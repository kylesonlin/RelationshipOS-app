import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { action, data } = await req.json();

    console.log(`[GAMIFICATION] Processing action: ${action} for user: ${user.id}`);

    // Define XP rewards for different actions
    const xpRewards = {
      'contact_added': 25,
      'meeting_scheduled': 50,
      'meeting_completed': 75,
      'email_sent': 10,
      'call_made': 20,
      'note_added': 5,
      'opportunity_created': 100,
      'follow_up_completed': 30,
      'integration_connected': 200,
      'profile_completed': 50,
    };

    const xpReward = xpRewards[action] || 0;

    if (xpReward === 0) {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current gamification data
    const { data: gamData, error: gamError } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (gamError && gamError.code !== 'PGRST116') {
      throw gamError;
    }

    // Calculate new values
    const currentXP = gamData?.total_xp || 0;
    const newXP = currentXP + xpReward;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const currentLevel = gamData?.current_level || 1;
    const today = new Date().toISOString().split('T')[0];

    // Update streak logic
    const lastActivityDate = gamData?.last_activity_date;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newStreak = 1;
    if (lastActivityDate === yesterday) {
      newStreak = (gamData?.current_streak || 0) + 1;
    } else if (lastActivityDate === today) {
      newStreak = gamData?.current_streak || 1;
    }

    const newLongestStreak = Math.max(newStreak, gamData?.longest_streak || 0);

    // Update activity-specific counters
    const activityUpdates: any = {
      total_xp: newXP,
      current_level: newLevel,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
    };

    // Map actions to specific counters
    if (action === 'contact_added') {
      activityUpdates.total_contacts = (gamData?.total_contacts || 0) + 1;
    } else if (['meeting_scheduled', 'meeting_completed'].includes(action)) {
      activityUpdates.total_meetings = (gamData?.total_meetings || 0) + 1;
    } else if (action === 'opportunity_created') {
      activityUpdates.total_opportunities = (gamData?.total_opportunities || 0) + 1;
    }

    // Update relationship health score based on activity
    if (['contact_added', 'meeting_completed', 'follow_up_completed'].includes(action)) {
      const healthBoost = action === 'meeting_completed' ? 2 : 1;
      activityUpdates.relationship_health_score = Math.min(100, (gamData?.relationship_health_score || 0) + healthBoost);
    }

    // Upsert gamification data
    if (gamData) {
      const { error: updateError } = await supabase
        .from('user_gamification')
        .update(activityUpdates)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_gamification')
        .insert({
          user_id: user.id,
          weekly_goal_target: 5,
          weekly_goal_progress: 1,
          ...activityUpdates
        });

      if (insertError) throw insertError;
    }

    // Update daily activities
    const { data: dailyActivity, error: dailyError } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('activity_date', today)
      .maybeSingle();

    if (dailyError && dailyError.code !== 'PGRST116') {
      throw dailyError;
    }

    const dailyUpdates: any = {
      xp_earned: (dailyActivity?.xp_earned || 0) + xpReward,
    };

    // Map actions to daily activity fields
    if (action === 'contact_added') {
      dailyUpdates.contacts_added = (dailyActivity?.contacts_added || 0) + 1;
    } else if (['meeting_scheduled', 'meeting_completed'].includes(action)) {
      dailyUpdates.meetings_completed = (dailyActivity?.meetings_completed || 0) + 1;
    } else if (action === 'email_sent') {
      dailyUpdates.emails_sent = (dailyActivity?.emails_sent || 0) + 1;
    } else if (action === 'call_made') {
      dailyUpdates.calls_made = (dailyActivity?.calls_made || 0) + 1;
    } else if (action === 'note_added') {
      dailyUpdates.notes_added = (dailyActivity?.notes_added || 0) + 1;
    } else if (action === 'follow_up_completed') {
      dailyUpdates.follow_ups_completed = (dailyActivity?.follow_ups_completed || 0) + 1;
    }

    if (dailyActivity) {
      const { error: updateDailyError } = await supabase
        .from('daily_activities')
        .update(dailyUpdates)
        .eq('id', dailyActivity.id);

      if (updateDailyError) throw updateDailyError;
    } else {
      const { error: insertDailyError } = await supabase
        .from('daily_activities')
        .insert({
          user_id: user.id,
          activity_date: today,
          ...dailyUpdates
        });

      if (insertDailyError) throw insertDailyError;
    }

    // Check for achievements
    await checkAchievements(supabase, user.id, newXP, newLevel, activityUpdates);

    // Prepare response
    const response = {
      success: true,
      xp_earned: xpReward,
      total_xp: newXP,
      level: newLevel,
      level_up: newLevel > currentLevel,
      streak: newStreak,
      action: action,
      message: `+${xpReward} XP for ${action.replace('_', ' ')}`
    };

    console.log(`[GAMIFICATION] Success:`, response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GAMIFICATION] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkAchievements(supabase: any, userId: string, totalXP: number, level: number, activityData: any) {
  try {
    // Get all achievements and user's current achievements
    const [achievementsResult, userAchievementsResult] = await Promise.all([
      supabase.from('achievements').select('*').eq('is_active', true),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', userId)
    ]);

    if (achievementsResult.error || userAchievementsResult.error) {
      console.error('Error fetching achievements:', achievementsResult.error || userAchievementsResult.error);
      return;
    }

    const achievements = achievementsResult.data || [];
    const earnedAchievementIds = new Set((userAchievementsResult.data || []).map(ua => ua.achievement_id));

    // Check each achievement
    for (const achievement of achievements) {
      if (earnedAchievementIds.has(achievement.id)) continue;

      let qualified = false;

      switch (achievement.requirement_type) {
        case 'xp':
          qualified = totalXP >= achievement.requirement_value;
          break;
        case 'contacts':
          qualified = (activityData.total_contacts || 0) >= achievement.requirement_value;
          break;
        case 'meetings':
          qualified = (activityData.total_meetings || 0) >= achievement.requirement_value;
          break;
        case 'opportunities':
          qualified = (activityData.total_opportunities || 0) >= achievement.requirement_value;
          break;
        case 'streak':
          qualified = (activityData.current_streak || 0) >= achievement.requirement_value;
          break;
        case 'level':
          qualified = level >= achievement.requirement_value;
          break;
      }

      if (qualified) {
        // Award achievement
        const { error: awardError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          });

        if (awardError) {
          console.error('Error awarding achievement:', awardError);
        } else {
          console.log(`[ACHIEVEMENT] Awarded: ${achievement.name} to user ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAchievements:', error);
  }
}