import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface GamificationData {
  id: string
  user_id: string
  total_xp: number
  current_level: number
  relationship_health_score: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  weekly_goal_progress: number
  weekly_goal_target: number
  total_contacts: number
  total_meetings: number
  total_opportunities: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  badge_icon: string
  badge_color: string
  requirement_type: string
  requirement_value: number
  xp_reward: number
  tier: string
  earned_at?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  challenge_type: string
  target_value: number
  xp_reward: number
  badge_reward: string | null
  start_date: string
  end_date: string
  current_progress: number
  completed: boolean
}

export function useGamification() {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([])
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchGamificationData()
    fetchAchievements()
    fetchActiveChallenges()
  }, [])

  const fetchGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get or create user gamification data
      let { data: gamData, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (!gamData) {
        // Create initial gamification data
        const { data: newGamData, error: createError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            relationship_health_score: 0,
            current_streak: 0,
            longest_streak: 0,
            weekly_goal_progress: 0,
            weekly_goal_target: 5
          })
          .select()
          .single()

        if (createError) throw createError
        gamData = newGamData
      }

      setGamificationData(gamData)

      // Fetch user achievements
      const { data: userAchievData, error: achError } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements (*)
        `)
        .eq('user_id', user.id)

      if (achError) throw achError

      const earnedAchievements = userAchievData?.map(ua => ({
        ...ua.achievements,
        earned_at: ua.earned_at
      })) || []

      setUserAchievements(earnedAchievements as Achievement[])

    } catch (error) {
      console.error('Error fetching gamification data:', error)
      toast({
        title: "Error",
        description: "Failed to load gamification data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('tier, requirement_value')

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchActiveChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select(`
          *,
          user_challenge_progress (
            current_progress,
            completed
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0])

      if (error) throw error

      const challenges = challengesData?.map(challenge => ({
        ...challenge,
        current_progress: challenge.user_challenge_progress?.[0]?.current_progress || 0,
        completed: challenge.user_challenge_progress?.[0]?.completed || false
      })) || []

      setActiveChallenges(challenges as Challenge[])
    } catch (error) {
      console.error('Error fetching challenges:', error)
    }
  }

  const addXP = async (amount: number, activity: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !gamificationData) return

      const newXP = gamificationData.total_xp + amount
      const newLevel = Math.floor(newXP / 1000) + 1 // 1000 XP per level

      // Update gamification data
      const { error } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newXP,
          current_level: newLevel,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setGamificationData({
        ...gamificationData,
        total_xp: newXP,
        current_level: newLevel,
        last_activity_date: new Date().toISOString().split('T')[0]
      })

      // Check for level up
      if (newLevel > gamificationData.current_level) {
        toast({
          title: "🎉 Level Up!",
          description: `You've reached level ${newLevel}! Keep building those relationships!`,
        })
      }

      // Check for new achievements
      await checkAchievements(newXP, newLevel)

      toast({
        title: "XP Earned!",
        description: `+${amount} XP for ${activity}`,
      })

    } catch (error) {
      console.error('Error adding XP:', error)
    }
  }

  const checkAchievements = async (totalXP: number, level: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !gamificationData) return

      // Check for unearned achievements
      const unearnedAchievements = achievements.filter(
        achievement => !userAchievements.some(ua => ua.id === achievement.id)
      )

      for (const achievement of unearnedAchievements) {
        let qualified = false

        switch (achievement.requirement_type) {
          case 'xp':
            qualified = totalXP >= achievement.requirement_value
            break
          case 'contacts':
            qualified = gamificationData.total_contacts >= achievement.requirement_value
            break
          case 'meetings':
            qualified = gamificationData.total_meetings >= achievement.requirement_value
            break
          case 'opportunities':
            qualified = gamificationData.total_opportunities >= achievement.requirement_value
            break
          case 'streak':
            qualified = gamificationData.current_streak >= achievement.requirement_value
            break
        }

        if (qualified) {
          // Award achievement
          await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id
            })

          // Add achievement XP
          if (achievement.xp_reward > 0) {
            await addXP(achievement.xp_reward, `earning ${achievement.name}`)
          }

          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
          })

          // Refresh achievements
          fetchGamificationData()
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !gamificationData) return

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      let newStreak = 1
      if (gamificationData.last_activity_date === yesterday) {
        newStreak = gamificationData.current_streak + 1
      } else if (gamificationData.last_activity_date === today) {
        return // Already updated today
      }

      const newLongestStreak = Math.max(newStreak, gamificationData.longest_streak)

      await supabase
        .from('user_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today
        })
        .eq('user_id', user.id)

      setGamificationData({
        ...gamificationData,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today
      })

      if (newStreak > 1) {
        toast({
          title: "🔥 Streak Maintained!",
          description: `${newStreak} day streak! Keep it up!`,
        })
      }

    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  const updateActivityStats = async (activity: 'contacts' | 'meetings' | 'opportunities', increment = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !gamificationData) return

      const field = `total_${activity}`
      const newValue = gamificationData[field] + increment

      await supabase
        .from('user_gamification')
        .update({ [field]: newValue })
        .eq('user_id', user.id)

      setGamificationData({
        ...gamificationData,
        [field]: newValue
      })

      // Award XP for activities
      const xpRewards = { contacts: 25, meetings: 50, opportunities: 100 }
      await addXP(xpRewards[activity], `adding ${activity.slice(0, -1)}`)
      
      // Update streak
      await updateStreak()

    } catch (error) {
      console.error('Error updating activity stats:', error)
    }
  }

  const getLevel = (xp: number) => Math.floor(xp / 1000) + 1
  const getXPForNextLevel = (xp: number) => (getLevel(xp) * 1000) - xp
  const getXPProgress = (xp: number) => (xp % 1000) / 1000 * 100

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600'
      case 'silver': return 'text-gray-500'
      case 'gold': return 'text-yellow-500'
      case 'platinum': return 'text-purple-500'
      default: return 'text-gray-400'
    }
  }

  const getHealthScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Platinum', color: 'text-purple-500', bg: 'bg-purple-100' }
    if (score >= 75) return { level: 'Gold', color: 'text-yellow-500', bg: 'bg-yellow-100' }
    if (score >= 60) return { level: 'Silver', color: 'text-gray-500', bg: 'bg-gray-100' }
    return { level: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-100' }
  }

  return {
    gamificationData,
    achievements,
    userAchievements,
    activeChallenges,
    loading,
    addXP,
    updateActivityStats,
    updateStreak,
    getLevel,
    getXPForNextLevel,
    getXPProgress,
    getTierColor,
    getHealthScoreLevel,
    refreshData: fetchGamificationData
  }
}