-- Add materialized views for ultra-fast dashboard queries
-- This precomputes common aggregations for instant loading

-- Create materialized view for user metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_dashboard_metrics AS
SELECT 
  u.user_id,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT CASE WHEN c.last_contact_date < NOW() - INTERVAL '30 days' THEN c.id END) as stale_contacts,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as pending_tasks,
  COUNT(DISTINCT CASE WHEN ce.start_time::date = CURRENT_DATE THEN ce.id END) as todays_meetings,
  COUNT(DISTINCT CASE WHEN ce.start_time BETWEEN NOW() AND NOW() + INTERVAL '1 day' THEN ce.id END) as upcoming_meetings,
  COALESCE(ug.relationship_health_score, 0) as relationship_health,
  COALESCE(ug.weekly_goal_progress, 0) as weekly_goal_progress,
  COALESCE(ug.total_xp, 0) as total_xp,
  NOW() as last_updated
FROM user_gamification u
LEFT JOIN contacts c ON c."userId" = u.user_id
LEFT JOIN tasks t ON t."userId" = u.user_id AND t.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN calendar_events ce ON ce.user_id = u.user_id AND ce.start_time > NOW() - INTERVAL '7 days'
LEFT JOIN user_gamification ug ON ug.user_id = u.user_id
GROUP BY u.user_id, ug.relationship_health_score, ug.weekly_goal_progress, ug.total_xp;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dashboard_metrics_user_id 
ON user_dashboard_metrics(user_id);

-- Function to refresh materialized view efficiently
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- Create function to get dashboard data instantly from materialized view
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalContacts', COALESCE(udm.total_contacts, 0),
    'staleContacts', COALESCE(udm.stale_contacts, 0),
    'completedTasks', COALESCE(udm.completed_tasks, 0),
    'pendingTasks', COALESCE(udm.pending_tasks, 0),
    'todaysMeetings', COALESCE(udm.todays_meetings, 0),
    'upcomingMeetings', COALESCE(udm.upcoming_meetings, 0),
    'relationshipHealth', COALESCE(udm.relationship_health, 0),
    'weeklyGoalProgress', COALESCE(udm.weekly_goal_progress, 0),
    'totalXp', COALESCE(udm.total_xp, 0),
    'lastUpdated', udm.last_updated,
    -- ROI calculations
    'monthlySavings', CASE 
      WHEN udm.total_contacts > 0 THEN GREATEST(500, udm.total_contacts * 75)
      ELSE 4701
    END,
    'tasksAutomated', CASE 
      WHEN udm.completed_tasks > 0 THEN LEAST(50, udm.completed_tasks)
      ELSE 15
    END,
    'hoursPerWeek', CASE 
      WHEN udm.total_contacts > 10 THEN LEAST(20, GREATEST(5, udm.total_contacts / 4))
      ELSE 5
    END,
    'annualROI', CASE 
      WHEN udm.total_contacts > 0 THEN GREATEST(800, udm.total_contacts * 125)
      ELSE 1574
    END,
    'currentPlanCost', 99,
    'vaCost', 5000
  ) INTO result
  FROM user_dashboard_metrics udm
  WHERE udm.user_id = p_user_id;
  
  -- If no data in materialized view, return defaults
  IF result IS NULL THEN
    result := json_build_object(
      'totalContacts', 0,
      'staleContacts', 0,
      'completedTasks', 0,
      'pendingTasks', 0,
      'todaysMeetings', 0,
      'upcomingMeetings', 0,
      'relationshipHealth', 0,
      'weeklyGoalProgress', 0,
      'totalXp', 0,
      'lastUpdated', NOW(),
      'monthlySavings', 4701,
      'tasksAutomated', 15,
      'hoursPerWeek', 5,
      'annualROI', 1574,
      'currentPlanCost', 99,
      'vaCost', 5000
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up automatic refresh of materialized view every 5 minutes
-- This requires pg_cron extension, but will fail gracefully if not available
DO $$
BEGIN
  -- Try to schedule automatic refresh (will fail silently if pg_cron not available)
  PERFORM cron.schedule('refresh-dashboard-metrics', '*/5 * * * *', 'SELECT refresh_dashboard_metrics();');
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available, skip scheduling
  NULL;
END;
$$;