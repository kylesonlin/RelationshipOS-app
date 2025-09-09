-- Simple fix for role escalation - just prevent users from changing their own role
-- Create a function to check if role is being changed
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a role change and user is trying to change their own role
  IF OLD.role != NEW.role AND auth.uid() = NEW.user_id THEN
    -- Only allow if user is admin
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
  END IF;
  
  -- Log role changes
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
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to prevent role escalation
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();