-- Fix Critical Security Issues: Restrict public access to sensitive data

-- 1. Fix profiles table - Remove public access and restrict to user's own data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create proper profile access policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

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

-- 4. Enhanced contact access logging function
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

-- Add audit triggers for sensitive tables (INSERT, UPDATE, DELETE only)
CREATE TRIGGER contacts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_data_access();

CREATE TRIGGER tasks_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_data_access();

CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_data_access();

-- 5. Add rate limiting tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limiting
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit data
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limit_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can manage rate limit data
CREATE POLICY "System can manage rate limits" 
ON public.rate_limit_tracking 
FOR ALL 
WITH CHECK (true);

-- 6. Add security monitoring view for admins
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  sal.created_at,
  sal.user_id,
  p.full_name as user_name,
  sal.action,
  sal.table_name,
  sal.ip_address,
  sal.metadata
FROM public.security_audit_logs sal
LEFT JOIN public.profiles p ON p.user_id = sal.user_id
ORDER BY sal.created_at DESC;

-- Enable security barrier for the view
ALTER VIEW public.security_dashboard SET (security_barrier = true);

-- 7. Add comments for security documentation
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 'Security Policy: Users can only access their own profile data to prevent data leakage';
COMMENT ON POLICY "Authenticated users can view team leaderboard" ON public.team_leaderboard IS 'Security Policy: Leaderboard requires authentication to prevent anonymous data scraping';
COMMENT ON TABLE public.security_audit_logs IS 'Security Table: Comprehensive audit logging for sensitive data access and modifications';
COMMENT ON TABLE public.rate_limit_tracking IS 'Security Table: Track API rate limits per user/IP to prevent abuse';
COMMENT ON VIEW public.security_dashboard IS 'Security View: Admin dashboard for monitoring security events and user activity';