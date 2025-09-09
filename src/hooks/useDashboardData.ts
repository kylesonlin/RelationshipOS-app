import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface DashboardMetrics {
  upcomingMeetings: number
  staleContacts: number
  totalContacts: number
  relationshipHealth: number
  weeklyGoal: number
  weeklyGoalProgress: number
  totalTasks: number
  completedTasks: number
  activeTasks: number
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardMetrics()
  }, [])

  const fetchDashboardMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch contacts data
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('userId', user.id)

      if (contactsError) throw contactsError

      // Fetch tasks data
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('userId', user.id)

      if (tasksError) throw tasksError

      // Fetch gamification data for relationship health
      const { data: gamificationData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (gamError) throw gamError

      // Calculate metrics
      const totalContacts = contacts?.length || 0
      
      // Calculate stale contacts (contacts with no recent interactions)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      
      // For now, we'll simulate stale contacts calculation
      // In a real implementation, you'd join with interactions table
      const staleContacts = Math.floor(totalContacts * 0.2) // 20% are stale as an example

      // Calculate upcoming meetings from tasks with due dates in next 24 hours
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const upcomingMeetings = tasks?.filter(task => {
        const dueDate = new Date(task.due_date)
        return dueDate >= now && dueDate <= tomorrow && task.status !== 'completed'
      }).length || 0

      // Task metrics
      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0
      const activeTasks = tasks?.filter(task => task.status !== 'completed').length || 0

      // Relationship health from gamification data
      const relationshipHealth = gamificationData?.relationship_health_score || 0
      const weeklyGoalProgress = gamificationData?.weekly_goal_progress || 0
      const weeklyGoalTarget = gamificationData?.weekly_goal_target || 5
      const weeklyGoal = weeklyGoalTarget > 0 ? (weeklyGoalProgress / weeklyGoalTarget) * 100 : 0

      setMetrics({
        upcomingMeetings,
        staleContacts,
        totalContacts,
        relationshipHealth,
        weeklyGoal: Math.min(weeklyGoal, 100), // Cap at 100%
        weeklyGoalProgress,
        totalTasks,
        completedTasks,
        activeTasks
      })

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    metrics,
    loading,
    refreshMetrics: fetchDashboardMetrics
  }
}