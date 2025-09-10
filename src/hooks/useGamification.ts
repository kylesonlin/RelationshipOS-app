import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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
  const { toast } = useToast()

  // Use React Query for caching
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['gamification-data'],
    queryFn: fetchAllGamificationData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  })

  const {
    gamificationData = null,
    achievements = [],
    userAchievements = [],
    activeChallenges = []
  } = data || {}

  // ... rest of the methods remain the same but use refetch instead of individual state setters
  
  return {
    gamificationData,
    achievements,
    userAchievements,
    activeChallenges,
    loading,
    addXP: (amount: number, activity: string) => addXP(amount, activity, refetch),
    updateActivityStats: (activity: 'contacts' | 'meetings' | 'opportunities', increment = 1) => 
      updateActivityStats(activity, increment, refetch),
    updateStreak: () => updateStreak(refetch),
    getLevel,
    getXPForNextLevel,
    getXPProgress,
    getTierColor,
    getHealthScoreLevel,
    refreshData: refetch
  }
}

// Optimized single query for all gamification data
async function fetchAllGamificationData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  // Get all data in parallel
  const [gamificationResult, achievementsResult, userAchievementsResult, challengesResult] = 
    await Promise.allSettled([
      // Get or create user gamification data
      supabase.from('user_gamification').select('*').eq('user_id', user.id).maybeSingle(),
      
      // Get all achievements
      supabase.from('achievements').select('*').eq('is_active', true).order('tier, requirement_value'),
      
      // Get user achievements
      supabase.from('user_achievements').select(`
        earned_at,
        achievements (*)
      `).eq('user_id', user.id),
      
      // Get active challenges
      supabase.from('challenges').select(`
        *,
        user_challenge_progress (
          current_progress,
          completed
        )
      `).eq('is_active', true).gte('end_date', new Date().toISOString().split('T')[0])
    ])

  let gamificationData = gamificationResult.status === 'fulfilled' ? gamificationResult.value.data : null
  
  // Create initial data if not exists
  if (!gamificationData) {
    const { data: newGamData } = await supabase
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
    
    gamificationData = newGamData
  }

  const achievements = achievementsResult.status === 'fulfilled' ? achievementsResult.value.data || [] : []
  
  const userAchievementsData = userAchievementsResult.status === 'fulfilled' ? 
    userAchievementsResult.value.data || [] : []
  const userAchievements = userAchievementsData.map(ua => ({
    ...ua.achievements,
    earned_at: ua.earned_at
  }))

  const challengesData = challengesResult.status === 'fulfilled' ? challengesResult.value.data || [] : []
  const activeChallenges = challengesData.map(challenge => ({
    ...challenge,
    current_progress: challenge.user_challenge_progress?.[0]?.current_progress || 0,
    completed: challenge.user_challenge_progress?.[0]?.completed || false
  }))

  return {
    gamificationData,
    achievements,
    userAchievements,
    activeChallenges
  }
}

// Optimized helper functions that trigger refetch
async function addXP(amount: number, activity: string, refetch: () => void) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: currentData } = await supabase
    .from('user_gamification')
    .select('total_xp, current_level')
    .eq('user_id', user.id)
    .single()

  if (!currentData) return

  const newXP = currentData.total_xp + amount
  const newLevel = Math.floor(newXP / 1000) + 1

  await supabase
    .from('user_gamification')
    .update({
      total_xp: newXP,
      current_level: newLevel,
      last_activity_date: new Date().toISOString().split('T')[0]
    })
    .eq('user_id', user.id)

  refetch() // Refresh cache
}

async function updateActivityStats(activity: 'contacts' | 'meetings' | 'opportunities', increment: number, refetch: () => void) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get current value first, then update
  const { data: currentData } = await supabase
    .from('user_gamification')
    .select(`total_${activity}`)
    .eq('user_id', user.id)
    .single()

  if (!currentData) return

  const currentValue = currentData[`total_${activity}`] || 0
  const field = `total_${activity}`
  
  await supabase
    .from('user_gamification')
    .update({ 
      [field]: currentValue + increment,
      last_activity_date: new Date().toISOString().split('T')[0]
    })
    .eq('user_id', user.id)

  refetch() // Refresh cache
}

async function updateStreak(refetch: () => void) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get current streak first, then update
  const { data: currentData } = await supabase
    .from('user_gamification')
    .select('current_streak')
    .eq('user_id', user.id)
    .single()

  if (!currentData) return

  await supabase
    .from('user_gamification')
    .update({
      current_streak: currentData.current_streak + 1,
      last_activity_date: new Date().toISOString().split('T')[0]
    })
    .eq('user_id', user.id)

  refetch() // Refresh cache
}

// Static helper functions (no changes needed)
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