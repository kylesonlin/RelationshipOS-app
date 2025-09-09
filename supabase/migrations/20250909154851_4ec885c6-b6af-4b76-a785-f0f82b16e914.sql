-- Remove views that use auth.uid() to fix Security Definer View warnings
-- Replace with direct table access patterns

-- Drop the problematic views
DROP VIEW IF EXISTS public.current_month_usage;
DROP VIEW IF EXISTS public.security_dashboard;

-- Create a function instead of a view for current month usage
CREATE OR REPLACE FUNCTION public.get_current_month_usage(_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  user_id UUID,
  resource_type TEXT,
  total_usage BIGINT,
  month_start TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ut.user_id,
    ut.resource_type,
    SUM(ut.usage_count)::BIGINT as total_usage,
    date_trunc('month', CURRENT_DATE::timestamp with time zone) as month_start
  FROM public.usage_tracking ut
  WHERE ut.usage_date >= date_trunc('month', CURRENT_DATE::timestamp with time zone)
    AND ut.user_id = _user_id
  GROUP BY ut.user_id, ut.resource_type;
$$;

-- Create a function for security dashboard (admin only)
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS TABLE (
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  user_name TEXT,
  action TEXT,
  table_name TEXT,
  ip_address INET,
  metadata JSONB
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY sal.created_at DESC;
$$;

-- Add comments
COMMENT ON FUNCTION public.get_current_month_usage(UUID) IS 'Security Function: Returns current month usage for the specified user (defaults to current authenticated user)';
COMMENT ON FUNCTION public.get_security_dashboard() IS 'Security Function: Returns security audit dashboard data (admin access only)';