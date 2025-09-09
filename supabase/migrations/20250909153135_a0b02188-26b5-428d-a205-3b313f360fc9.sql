-- Drop and recreate the current_month_usage view to ensure it doesn't have SECURITY DEFINER
DROP VIEW IF EXISTS public.current_month_usage;

-- Recreate the view with proper security settings (SECURITY INVOKER is the default)
CREATE VIEW public.current_month_usage AS
SELECT 
  usage_tracking.user_id,
  usage_tracking.resource_type,
  sum(usage_tracking.usage_count) AS total_usage,
  date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) AS month_start
FROM usage_tracking
WHERE (
  usage_tracking.usage_date >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)
  AND usage_tracking.user_id = auth.uid()
)
GROUP BY usage_tracking.user_id, usage_tracking.resource_type;

-- Add appropriate RLS policy for the view (views don't have RLS directly, but we ensure proper access)
COMMENT ON VIEW public.current_month_usage IS 'Monthly usage aggregation view that respects user-level access through auth.uid() filtering';