-- Create optimized dashboard data function
CREATE OR REPLACE FUNCTION public.get_dashboard_data(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  contacts_data jsonb;
  tasks_data jsonb;
  gamification_data jsonb;
  calendar_data jsonb;
  subscriber_data jsonb;
BEGIN
  -- Get contacts summary (minimal data)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'created_at', created_at,
      'updated_at', updated_at
    )
  ) INTO contacts_data
  FROM contacts 
  WHERE "userId" = user_id_param;

  -- Get tasks summary
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'status', status
    )
  ) INTO tasks_data
  FROM tasks 
  WHERE "userId" = user_id_param;

  -- Get gamification data
  SELECT to_jsonb(g) INTO gamification_data
  FROM (
    SELECT relationship_health_score, weekly_goal_progress, weekly_goal_target
    FROM user_gamification 
    WHERE user_id = user_id_param
  ) g;

  -- Get upcoming calendar events (next 24 hours)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id
    )
  ) INTO calendar_data
  FROM calendar_events 
  WHERE user_id = user_id_param
    AND start_time >= NOW()
    AND start_time <= NOW() + INTERVAL '24 hours'
  LIMIT 10;

  -- Get subscriber data
  SELECT to_jsonb(s) INTO subscriber_data
  FROM (
    SELECT plan_id
    FROM subscribers 
    WHERE user_id = user_id_param
  ) s;

  -- Build final result
  result := jsonb_build_object(
    'contacts', COALESCE(contacts_data, '[]'::jsonb),
    'tasks', COALESCE(tasks_data, '[]'::jsonb),
    'gamification', gamification_data,
    'calendar_events', COALESCE(calendar_data, '[]'::jsonb),
    'subscriber', subscriber_data
  );

  RETURN result;
END;
$$;