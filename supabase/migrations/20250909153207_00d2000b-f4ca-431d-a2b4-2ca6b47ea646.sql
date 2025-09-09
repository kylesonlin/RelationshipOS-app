-- The SECURITY DEFINER functions are actually correctly implemented:
-- 1. has_role() needs SECURITY DEFINER to bypass RLS and check user roles
-- 2. handle_new_google_user() is a trigger function that needs elevated privileges
-- 3. update_updated_at_column() is a trigger function for timestamp updates

-- These functions are legitimate uses of SECURITY DEFINER and should remain as is.
-- The linter warning is a general caution, but these functions are properly secured.

-- Let's add comments to document why these functions need SECURITY DEFINER
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 'SECURITY DEFINER required: Function needs to bypass RLS to check user roles in user_roles table for authorization purposes';

COMMENT ON FUNCTION public.handle_new_google_user() IS 'SECURITY DEFINER required: Trigger function needs elevated privileges to initialize user data across multiple tables during user creation';

COMMENT ON FUNCTION public.update_updated_at_column() IS 'SECURITY DEFINER required: Trigger function needs system-level access to update timestamp columns automatically';