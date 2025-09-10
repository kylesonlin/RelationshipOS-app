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
    staleTime: 5 * 60 * 1000, // 5 minutes - more aggressive caching
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Enable background updates for smoother UX
    refetchInterval: 10 * 60 * 1000, // Background refresh every 10 minutes
    // Return cached data immediately, update in background
    networkMode: 'online',
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

    // Check if this is demo mode - return demo data immediately
    if (user.id === 'demo-user-123') {
      return {
        upcomingMeetings: 3,
        staleContacts: 8,
        totalContacts: 47,
        relationshipHealth: 82,
        weeklyGoalProgress: 75,
        totalTasks: 12,
        completedTasks: 8,
        activeTasks: 4,
        monthlySavings: 4701,
        tasksAutomated: 15,
        hoursPerWeek: 5,
        annualROI: 1574,
        currentPlanCost: 99,
        vaCost: 5000
      }
    }

    console.log('Fetching dashboard metrics for user:', user.id)

    // Use the optimized database function for ultra-fast queries
    const { data: metricsData, error } = await supabase.rpc('get_dashboard_metrics_optimized', {
      p_user_id: user.id
    })

    if (error) {
      console.error('RPC error, falling back to manual queries:', error)
      return await fallbackFetchMetrics(user.id)
    }

    if (metricsData && typeof metricsData === 'object') {
      const data = metricsData as any;
      return {
        upcomingMeetings: data.upcomingMeetings || 0,
        staleContacts: data.staleContacts || 0,
        totalContacts: data.totalContacts || 0,
        relationshipHealth: data.relationshipHealth || 0,
        weeklyGoalProgress: data.weeklyGoalProgress || 0,
        totalTasks: (data.completedTasks || 0) + (data.pendingTasks || 0),
        completedTasks: data.completedTasks || 0,
        activeTasks: data.pendingTasks || 0,
        monthlySavings: data.monthlySavings || 4701,
        tasksAutomated: data.tasksAutomated || 15,
        hoursPerWeek: data.hoursPerWeek || 5,
        annualROI: data.annualROI || 1574,
        currentPlanCost: data.currentPlanCost || 99,
        vaCost: data.vaCost || 5000
      }
    }

    // Fallback to manual queries if RPC fails
    return await fallbackFetchMetrics(user.id)

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