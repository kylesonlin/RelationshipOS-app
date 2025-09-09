-- Create gamification tables
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  relationship_health_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  weekly_goal_progress INTEGER DEFAULT 0,
  weekly_goal_target INTEGER DEFAULT 5,
  total_contacts INTEGER DEFAULT 0,
  total_meetings INTEGER DEFAULT 0,
  total_opportunities INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_color TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements junction table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create daily activities tracking
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  contacts_added INTEGER DEFAULT 0,
  meetings_completed INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  notes_added INTEGER DEFAULT 0,
  follow_ups_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Create team leaderboard
CREATE TABLE public.team_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_name TEXT,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  rank_position INTEGER DEFAULT 0,
  week_start DATE,
  month_start DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenge progress
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own gamification data" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own gamification data" ON public.user_gamification FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own gamification data" ON public.user_gamification FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities" ON public.daily_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.daily_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.daily_activities FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Team leaderboard is viewable by everyone" ON public.team_leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can update their own leaderboard data" ON public.team_leaderboard FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leaderboard data" ON public.team_leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);

CREATE POLICY "Users can view their own challenge progress" ON public.user_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenge progress" ON public.user_challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge progress" ON public.user_challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_user_gamification_updated_at BEFORE UPDATE ON public.user_gamification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_activities_updated_at BEFORE UPDATE ON public.daily_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_leaderboard_updated_at BEFORE UPDATE ON public.team_leaderboard FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_challenge_progress_updated_at BEFORE UPDATE ON public.user_challenge_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, badge_icon, badge_color, requirement_type, requirement_value, xp_reward, tier) VALUES
('First Contact', 'Add your first contact to the system', 'Users', 'bronze', 'contacts', 1, 50, 'bronze'),
('Networking Novice', 'Reach 10 contacts', 'UserPlus', 'bronze', 'contacts', 10, 100, 'bronze'),
('Contact Collector', 'Reach 50 contacts', 'Users', 'silver', 'contacts', 50, 250, 'silver'),
('Relationship Master', 'Reach 100 contacts', 'Crown', 'gold', 'contacts', 100, 500, 'gold'),
('Network Mogul', 'Reach 500 contacts', 'Trophy', 'platinum', 'contacts', 500, 1000, 'platinum'),

('Meeting Starter', 'Complete your first meeting', 'Calendar', 'bronze', 'meetings', 1, 50, 'bronze'),
('Regular Networker', 'Complete 10 meetings', 'CalendarCheck', 'bronze', 'meetings', 10, 150, 'bronze'),
('Meeting Marathon', 'Complete 50 meetings', 'Users', 'silver', 'meetings', 50, 300, 'silver'),
('Face-to-Face Expert', 'Complete 100 meetings', 'Crown', 'gold', 'meetings', 100, 600, 'gold'),

('Opportunity Scout', 'Identify your first opportunity', 'Target', 'bronze', 'opportunities', 1, 75, 'bronze'),
('Deal Hunter', 'Identify 10 opportunities', 'TrendingUp', 'silver', 'opportunities', 10, 200, 'silver'),
('Business Builder', 'Identify 25 opportunities', 'Briefcase', 'gold', 'opportunities', 25, 400, 'gold'),

('Consistency King', 'Maintain a 7-day streak', 'Calendar', 'silver', 'streak', 7, 200, 'silver'),
('Dedication Master', 'Maintain a 30-day streak', 'Flame', 'gold', 'streak', 30, 500, 'gold'),
('Unstoppable Force', 'Maintain a 100-day streak', 'Zap', 'platinum', 'streak', 100, 1000, 'platinum'),

('XP Accumulator', 'Earn 1000 XP', 'Star', 'silver', 'xp', 1000, 100, 'silver'),
('XP Master', 'Earn 5000 XP', 'StarHalf', 'gold', 'xp', 5000, 250, 'gold'),
('XP Legend', 'Earn 10000 XP', 'Sparkles', 'platinum', 'xp', 10000, 500, 'platinum');

-- Insert sample challenges
INSERT INTO public.challenges (title, description, challenge_type, target_value, xp_reward, badge_reward, start_date, end_date) VALUES
('Weekly Connector', 'Add 5 new contacts this week', 'contacts', 5, 100, 'UserPlus', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Meeting Blitz', 'Complete 3 meetings this week', 'meetings', 3, 150, 'Calendar', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Follow-up Hero', 'Complete 10 follow-ups this week', 'follow_ups', 10, 200, 'MessageCircle', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days');

-- Create indexes for performance
CREATE INDEX idx_user_gamification_user_id ON public.user_gamification(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_daily_activities_user_date ON public.daily_activities(user_id, activity_date);
CREATE INDEX idx_team_leaderboard_xp ON public.team_leaderboard(total_xp DESC);
CREATE INDEX idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);