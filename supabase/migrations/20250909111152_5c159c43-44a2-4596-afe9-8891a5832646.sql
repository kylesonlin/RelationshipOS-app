-- Create trigger function to handle new Google auth users
CREATE OR REPLACE FUNCTION public.handle_new_google_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile with Google data
  INSERT INTO public.profiles (
    user_id,
    full_name,
    avatar_url,
    onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    true -- Google users are considered onboarded immediately
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    avatar_url = NEW.raw_user_meta_data ->> 'avatar_url',
    updated_at = now();

  -- Initialize gamification data for new user
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
  ) VALUES (
    NEW.id,
    0,
    1,
    0,
    0,
    0,
    CURRENT_DATE,
    0,
    5,
    0,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize AI settings for new user
  INSERT INTO public.user_ai_settings (
    user_id,
    ai_mode,
    monthly_platform_usage,
    monthly_platform_limit,
    usage_reset_date,
    preferences
  ) VALUES (
    NEW.id,
    'platform',
    0,
    100,
    CURRENT_DATE,
    '{}'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_google_user();

-- Create a table to store Google API tokens securely
CREATE TABLE IF NOT EXISTS public.user_google_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own Google tokens" 
ON public.user_google_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google tokens" 
ON public.user_google_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google tokens" 
ON public.user_google_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_user_google_tokens_updated_at
BEFORE UPDATE ON public.user_google_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();