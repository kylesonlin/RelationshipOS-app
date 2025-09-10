-- Fix security issues from the previous migration

-- 1. Fix function search path for security
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Hide materialized view from API by revoking public access
REVOKE ALL ON user_dashboard_metrics FROM PUBLIC;
REVOKE ALL ON user_dashboard_metrics FROM anon;
REVOKE ALL ON user_dashboard_metrics FROM authenticated;