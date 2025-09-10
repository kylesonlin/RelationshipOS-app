-- Initialize gamification data for existing users who don't have it
INSERT INTO public.user_gamification (
  user_id,
  total_xp,
  current_level,
  relationship_health_score,
  current_streak,
  longest_streak,
  last_activity_date,
  weekly_goal_progress,
  weekly_goal_target,
  total_contacts,
  total_meetings,
  total_opportunities
)
SELECT 
  id as user_id,
  0 as total_xp,
  1 as current_level,
  75 as relationship_health_score, -- Start with good baseline
  0 as current_streak,
  0 as longest_streak,
  CURRENT_DATE as last_activity_date,
  0 as weekly_goal_progress,
  5 as weekly_goal_target,
  0 as total_contacts,
  0 as total_meetings,
  0 as total_opportunities
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_gamification)
ON CONFLICT (user_id) DO NOTHING;