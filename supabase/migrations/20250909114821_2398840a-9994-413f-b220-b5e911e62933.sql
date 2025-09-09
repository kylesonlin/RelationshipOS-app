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