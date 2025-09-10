-- Performance optimization: Fix slow queries and add missing indexes

-- 1. Add indexes for commonly queried timezone data (addressing slow pg_timezone_names query)
CREATE INDEX IF NOT EXISTS idx_pg_timezone_names_name ON pg_timezone_names(name);

-- 2. Optimize our dashboard function to use better query patterns
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics_optimized(p_user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
  contact_stats record;
  task_stats record;
  meeting_stats record;
  gamification_stats record;
BEGIN
  -- Single optimized query for contact statistics
  SELECT 
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN last_contact_date < NOW() - INTERVAL '30 days' THEN 1 END) as stale_contacts
  INTO contact_stats
  FROM contacts 
  WHERE "userId" = p_user_id;
  
  -- Single optimized query for task statistics  
  SELECT 
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
  INTO task_stats
  FROM tasks 
  WHERE "userId" = p_user_id 
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Single optimized query for meeting statistics
  SELECT 
    COUNT(CASE WHEN start_time::date = CURRENT_DATE THEN 1 END) as todays_meetings,
    COUNT(CASE WHEN start_time BETWEEN NOW() AND NOW() + INTERVAL '1 day' THEN 1 END) as upcoming_meetings
  INTO meeting_stats
  FROM calendar_events 
  WHERE user_id = p_user_id 
    AND start_time > NOW() - INTERVAL '7 days';
  
  -- Single query for gamification data
  SELECT 
    COALESCE(relationship_health_score, 0) as relationship_health,
    COALESCE(weekly_goal_progress, 0) as weekly_goal_progress,
    COALESCE(total_xp, 0) as total_xp
  INTO gamification_stats
  FROM user_gamification 
  WHERE user_id = p_user_id;
  
  -- Build result with all computed values
  result := json_build_object(
    'totalContacts', COALESCE(contact_stats.total_contacts, 0),
    'staleContacts', COALESCE(contact_stats.stale_contacts, 0),
    'completedTasks', COALESCE(task_stats.completed_tasks, 0),
    'pendingTasks', COALESCE(task_stats.pending_tasks, 0),
    'todaysMeetings', COALESCE(meeting_stats.todays_meetings, 0),
    'upcomingMeetings', COALESCE(meeting_stats.upcoming_meetings, 0),
    'relationshipHealth', COALESCE(gamification_stats.relationship_health, 0),
    'weeklyGoalProgress', COALESCE(gamification_stats.weekly_goal_progress, 0),
    'totalXp', COALESCE(gamification_stats.total_xp, 0),
    'lastUpdated', NOW(),
    'monthlySavings', CASE 
      WHEN COALESCE(contact_stats.total_contacts, 0) > 0 
      THEN GREATEST(500, COALESCE(contact_stats.total_contacts, 0) * 75)
      ELSE 4701
    END,
    'tasksAutomated', CASE 
      WHEN COALESCE(task_stats.completed_tasks, 0) > 0 
      THEN LEAST(50, COALESCE(task_stats.completed_tasks, 0))
      ELSE 15
    END,
    'hoursPerWeek', CASE 
      WHEN COALESCE(contact_stats.total_contacts, 0) > 10 
      THEN LEAST(20, GREATEST(5, COALESCE(contact_stats.total_contacts, 0) / 4))
      ELSE 5
    END,
    'annualROI', CASE 
      WHEN COALESCE(contact_stats.total_contacts, 0) > 0 
      THEN GREATEST(800, COALESCE(contact_stats.total_contacts, 0) * 125)
      ELSE 1574
    END,
    'currentPlanCost', 99,
    'vaCost', 5000
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Grant execute permission to authenticated users only
REVOKE EXECUTE ON FUNCTION get_dashboard_metrics_optimized(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics_optimized(uuid) TO authenticated;

-- 4. Add indexes to reduce query execution times
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_user_last_contact 
ON contacts("userId", last_contact_date) 
WHERE last_contact_date IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_status_created 
ON tasks("userId", status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_user_start_date 
ON calendar_events(user_id, start_time) 
WHERE start_time > NOW() - INTERVAL '30 days';

-- 5. Update our existing function to be an alias to the optimized one
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(p_user_id uuid)
RETURNS json AS $$
BEGIN
  RETURN get_dashboard_metrics_optimized(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;