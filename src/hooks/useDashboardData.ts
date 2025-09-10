import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { handleError } from '@/utils/errorHandling'

export interface DashboardMetrics {
  upcomingMeetings: number
  staleContacts: number
  totalContacts: number
  relationshipHealth: number
  weeklyGoalProgress: number
  totalTasks: number
  completedTasks: number
  activeTasks: number
  monthlySavings: number
  tasksAutomated: number
  hoursPerWeek: number
  annualROI: number
  currentPlanCost: number
  vaCost: number
}

export const useDashboardData = () => {
  // Use React Query for caching and background updates
  const { data: metrics, isLoading: loading, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    initialData: {
      upcomingMeetings: 0,
      staleContacts: 0,
      totalContacts: 0,
      relationshipHealth: 0,
      weeklyGoalProgress: 0,
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      monthlySavings: 4701,
      tasksAutomated: 15,
      hoursPerWeek: 5,
      annualROI: 1574,
      currentPlanCost: 99,
      vaCost: 5000
    }
  })

  return {
    metrics: metrics!,
    loading,
    refreshMetrics: refetch
  }
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('No authenticated user')
    }

    console.log('Fetching dashboard metrics for user:', user.id)

    // Single optimized query to get all data at once
    const { data: dashboardData, error } = await supabase.rpc('get_dashboard_data', {
      user_id_param: user.id
    })

    if (error) {
      console.warn('Dashboard RPC failed, falling back to individual queries:', error)
      return await fallbackFetchMetrics(user.id)
    }

    return transformDashboardData(dashboardData)

  } catch (error: any) {
    console.error('Dashboard metrics error:', error)
    handleError(error, 'Dashboard Metrics')
    
    // Return fallback data instead of failing
    return {
      upcomingMeetings: 0,
      staleContacts: 0,
      totalContacts: 0,
      relationshipHealth: 0,
      weeklyGoalProgress: 0,
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      monthlySavings: 4701,
      tasksAutomated: 15,
      hoursPerWeek: 5,
      annualROI: 1574,
      currentPlanCost: 99,
      vaCost: 5000
    }
  }
}

async function fallbackFetchMetrics(userId: string): Promise<DashboardMetrics> {
  // Optimized parallel queries with minimal data selection
  const [
    contactsResult,
    tasksResult,
    gamificationResult,
    calendarEventsResult,
    subscriberResult
  ] = await Promise.allSettled([
    supabase.from('contacts')
      .select('id, created_at, updated_at')
      .eq('userId', userId),
    supabase.from('tasks')
      .select('id, status')
      .eq('userId', userId),
    supabase.from('user_gamification')
      .select('relationship_health_score, weekly_goal_progress, weekly_goal_target')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('calendar_events')
      .select('id')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString())
      .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .limit(10),
    supabase.from('subscribers')
      .select('plan_id')
      .eq('user_id', userId)
      .maybeSingle()
  ])

  // Extract data safely
  const contacts = contactsResult.status === 'fulfilled' ? contactsResult.value.data : []
  const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data : []
  const gamificationData = gamificationResult.status === 'fulfilled' ? gamificationResult.value.data : null
  const calendarEvents = calendarEventsResult.status === 'fulfilled' ? calendarEventsResult.value.data : []
  const subscriber = subscriberResult.status === 'fulfilled' ? subscriberResult.value.data : null

  return calculateMetrics(contacts, tasks, gamificationData, calendarEvents, subscriber)
}

function calculateMetrics(contacts: any[], tasks: any[], gamificationData: any, calendarEvents: any[], subscriber: any): DashboardMetrics {
  const totalContacts = contacts?.length || 0
  
  // Calculate stale contacts efficiently
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const staleContacts = contacts?.filter(contact => {
    const lastActivity = new Date(contact.updated_at || contact.created_at)
    return lastActivity < fourteenDaysAgo
  }).length || 0
  
  const upcomingMeetings = calendarEvents?.length || 0
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0
  const activeTasks = totalTasks - completedTasks

  const relationshipHealth = gamificationData?.relationship_health_score || 0
  const weeklyGoalProgress = gamificationData?.weekly_goal_progress || 0
  const weeklyGoalTarget = gamificationData?.weekly_goal_target || 5

  // ROI calculations
  const vaCost = 5000
  const currentPlanCost = subscriber?.plan_id === 'pro' ? 299 : 
                         subscriber?.plan_id === 'enterprise' ? 499 : 99

  const tasksAutomated = Math.max(Math.min(completedTasks + Math.floor(totalContacts * 1.5), 500), 15)
  const hoursPerWeek = Math.min(tasksAutomated * 0.5, 20)
  const monthlySavings = Math.round(hoursPerWeek * 4 * 25)
  const annualROI = Math.round((monthlySavings * 12) / currentPlanCost * 100)

  return {
    totalContacts,
    staleContacts,
    upcomingMeetings,
    totalTasks,
    completedTasks,
    activeTasks,
    relationshipHealth,
    weeklyGoalProgress: Math.min((weeklyGoalProgress / weeklyGoalTarget) * 100, 100),
    monthlySavings,
    tasksAutomated,
    hoursPerWeek,
    annualROI,
    currentPlanCost,
    vaCost
  }
}

function transformDashboardData(data: any): DashboardMetrics {
  // Transform RPC response to metrics format
  return calculateMetrics(
    data.contacts || [],
    data.tasks || [], 
    data.gamification,
    data.calendar_events || [],
    data.subscriber
  )
}