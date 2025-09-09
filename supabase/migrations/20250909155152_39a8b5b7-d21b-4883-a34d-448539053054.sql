-- Address remaining security concerns from the security scan

-- 1. Fix subscription_plans - restrict to authenticated users only
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON public.subscription_plans;

CREATE POLICY "Authenticated users can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- 2. Fix achievements - restrict to authenticated users only  
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;

CREATE POLICY "Authenticated users can view achievements" 
ON public.achievements 
FOR SELECT 
TO authenticated  
USING (is_active = true);

-- 3. Fix challenges - restrict to authenticated users only
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.challenges;

CREATE POLICY "Authenticated users can view challenges" 
ON public.challenges 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- 4. Fix team leaderboard - restrict to user's own team data
DROP POLICY IF EXISTS "Authenticated users can view team leaderboard" ON public.team_leaderboard;

CREATE POLICY "Users can view their own team leaderboard data" 
ON public.team_leaderboard 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Add security comments
COMMENT ON POLICY "Authenticated users can view subscription plans" ON public.subscription_plans IS 'Security Policy: Prevents competitors from accessing pricing strategy without authentication';
COMMENT ON POLICY "Authenticated users can view achievements" ON public.achievements IS 'Security Policy: Protects gamification strategy from unauthorized access';  
COMMENT ON POLICY "Authenticated users can view challenges" ON public.challenges IS 'Security Policy: Prevents exposure of user engagement tactics to competitors';
COMMENT ON POLICY "Users can view their own team leaderboard data" ON public.team_leaderboard IS 'Security Policy: Restricts team performance data to authorized team members only';