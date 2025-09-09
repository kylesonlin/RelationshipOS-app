-- Create a simple role restriction policy that prevents self-role-elevation
-- First drop the existing problematic policies
DROP POLICY IF EXISTS "Users can update their own profile (non-admin fields)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- Create a single policy that allows profile updates but prevents role changes
CREATE POLICY "Users can update profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- User can only update if they're not changing their role
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = NEW.role
  )
);

-- Allow admins to update any profile including roles
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add audit logging for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes specifically
  IF OLD.role != NEW.role THEN
    INSERT INTO public.security_audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      metadata
    ) VALUES (
      auth.uid(),
      'ROLE_CHANGE',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_user_id', NEW.user_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.profiles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();