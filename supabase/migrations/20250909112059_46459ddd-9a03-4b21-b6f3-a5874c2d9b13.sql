-- Fix the security definer view issue
DROP VIEW IF EXISTS public.current_month_usage;

-- Create the view without security definer (uses invoker's permissions)
CREATE VIEW public.current_month_usage AS
SELECT 
  user_id,
  resource_type,
  SUM(usage_count) as total_usage,
  DATE_TRUNC('month', CURRENT_DATE) as month_start
FROM public.usage_tracking 
WHERE usage_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND user_id = auth.uid() -- Add RLS filtering at view level
GROUP BY user_id, resource_type;