-- Add missing last_contact_date column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;

-- Update existing contacts to set last_contact_date to their updated_at value
UPDATE public.contacts 
SET last_contact_date = updated_at 
WHERE last_contact_date IS NULL;