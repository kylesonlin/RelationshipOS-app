-- Fix missing RLS policies for interactions table
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interactions through their contacts" ON public.interactions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.id = interactions.contact_id 
  AND c."userId" = auth.uid()
));

CREATE POLICY "Users can insert interactions through their contacts" ON public.interactions
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.id = interactions.contact_id 
  AND c."userId" = auth.uid()
));

CREATE POLICY "Users can update interactions through their contacts" ON public.interactions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.id = interactions.contact_id 
  AND c."userId" = auth.uid()
));

CREATE POLICY "Users can delete interactions through their contacts" ON public.interactions
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.id = interactions.contact_id 
  AND c."userId" = auth.uid()
));

-- Fix missing RLS policies for current_month_usage table
ALTER TABLE public.current_month_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON public.current_month_usage
FOR SELECT
USING (auth.uid() = user_id);

-- The current_month_usage should only be updated by the system
CREATE POLICY "System can manage usage data" ON public.current_month_usage
FOR ALL
USING (true);

-- Install the missing trigger for handle_new_google_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_google_user();