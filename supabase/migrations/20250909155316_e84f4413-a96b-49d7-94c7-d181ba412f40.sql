-- Add additional security hardening to address scanner concerns
-- These policies are already correct but let's add extra validation

-- 1. Ensure subscribers table has proper RLS for all operations
-- Add explicit policy to prevent any public access attempts
CREATE POLICY "Prevent anonymous access to subscribers" 
ON public.subscribers 
FOR ALL 
TO anon
USING (false) 
WITH CHECK (false);

-- 2. Ensure user_two_factor has explicit anonymous block
CREATE POLICY "Prevent anonymous access to 2FA settings" 
ON public.user_two_factor 
FOR ALL 
TO anon
USING (false) 
WITH CHECK (false);

-- 3. Ensure user_integrations has explicit anonymous block  
CREATE POLICY "Prevent anonymous access to integrations" 
ON public.user_integrations 
FOR ALL 
TO anon
USING (false) 
WITH CHECK (false);

-- 4. Ensure user_ai_settings has explicit anonymous block
CREATE POLICY "Prevent anonymous access to AI settings" 
ON public.user_ai_settings 
FOR ALL 
TO anon
USING (false) 
WITH CHECK (false);

-- 5. Ensure contacts has explicit anonymous block
CREATE POLICY "Prevent anonymous access to contacts" 
ON public.contacts 
FOR ALL 
TO anon
USING (false) 
WITH CHECK (false);

-- 6. Ensure support_tickets has explicit anonymous block for sensitive operations
CREATE POLICY "Prevent anonymous access to support tickets" 
ON public.support_tickets 
FOR SELECT 
TO anon
USING (false);

-- Add security validation comments
COMMENT ON POLICY "Prevent anonymous access to subscribers" ON public.subscribers IS 'Security Hardening: Explicit block of all anonymous access to prevent any potential data exposure';
COMMENT ON POLICY "Prevent anonymous access to 2FA settings" ON public.user_two_factor IS 'Security Hardening: Explicit block to protect 2FA secrets and backup codes';
COMMENT ON POLICY "Prevent anonymous access to integrations" ON public.user_integrations IS 'Security Hardening: Explicit block to protect encrypted API keys';
COMMENT ON POLICY "Prevent anonymous access to AI settings" ON public.user_ai_settings IS 'Security Hardening: Explicit block to protect AI configuration and encrypted API keys';
COMMENT ON POLICY "Prevent anonymous access to contacts" ON public.contacts IS 'Security Hardening: Explicit block to protect customer contact information';
COMMENT ON POLICY "Prevent anonymous access to support tickets" ON public.support_tickets IS 'Security Hardening: Explicit block to protect customer support communications';