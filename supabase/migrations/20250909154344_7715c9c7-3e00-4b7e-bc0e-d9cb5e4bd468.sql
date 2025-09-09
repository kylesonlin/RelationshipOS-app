-- Fix Critical Security Issues: Restrict public access to sensitive data

-- 1. Fix profiles table - Remove public access and restrict to user's own data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create proper profile access policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a limited public profile view for cases where we need some public info
CREATE OR REPLACE VIEW public.public_profiles AS 
SELECT 
  profiles.user_id,
  profiles.full_name,
  profiles.avatar_url,
  profiles.company,
  profiles.bio
FROM public.profiles 
WHERE profiles.user_id IS NOT NULL;

-- Enable RLS on the public view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- 2. Fix team leaderboard - Restrict to authenticated users only
DROP POLICY IF EXISTS "Team leaderboard is viewable by everyone" ON public.team_leaderboard;

CREATE POLICY "Authenticated users can view team leaderboard" 
ON public.team_leaderboard 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 4. Create function to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if it's not the user viewing their own profile
  IF auth.uid() != NEW.user_id OR auth.uid() != OLD.user_id THEN
    INSERT INTO public.security_audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      metadata
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.user_id, OLD.user_id),
      jsonb_build_object(
        'accessed_user_id', COALESCE(NEW.user_id, OLD.user_id),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger to log profile access
CREATE TRIGGER profile_access_audit
  AFTER SELECT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_access();

-- 5. Enhanced contact access logging
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'timestamp', now(),
      'table', TG_TABLE_NAME
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers for sensitive tables
CREATE TRIGGER contacts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_data_access();

CREATE TRIGGER tasks_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_data_access();

-- 6. Add comments for security documentation
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 'Security Policy: Users can only access their own profile data to prevent data leakage';
COMMENT ON POLICY "Authenticated users can view team leaderboard" ON public.team_leaderboard IS 'Security Policy: Leaderboard requires authentication to prevent anonymous data scraping';
COMMENT ON TABLE public.security_audit_logs IS 'Security Table: Comprehensive audit logging for sensitive data access and modifications';