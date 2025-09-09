-- Recreate views without any security options to fix Security Definer View warnings

-- Drop and recreate current_month_usage view 
DROP VIEW IF EXISTS public.current_month_usage;

CREATE VIEW public.current_month_usage AS
SELECT 
  user_id,
  resource_type,
  SUM(usage_count) as total_usage,
  date_trunc('month', CURRENT_DATE::timestamp with time zone) as month_start
FROM public.usage_tracking
WHERE usage_date >= date_trunc('month', CURRENT_DATE::timestamp with time zone)
  AND user_id = auth.uid()
GROUP BY user_id, resource_type;

-- Drop and recreate security_dashboard view
DROP VIEW IF EXISTS public.security_dashboard;

CREATE VIEW public.security_dashboard AS
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