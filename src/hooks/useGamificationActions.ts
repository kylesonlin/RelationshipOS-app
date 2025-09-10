import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface GamificationResponse {
  success: boolean
  xp_earned: number
  total_xp: number
  level: number
  level_up: boolean
  streak: number
  action: string
  message: string
}

export const useGamificationActions = () => {
  const { toast } = useToast()

  const triggerAction = async (action: string, data?: any): Promise<GamificationResponse | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.warn('No active session for gamification action')
        return null
      }

      const { data: response, error } = await supabase.functions.invoke('update-gamification', {
        body: { action, data },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (response?.success) {
        // Show XP notification
        toast({
          title: response.level_up ? "🎉 Level Up!" : "XP Earned!",
          description: response.level_up 
            ? `Congratulations! You've reached level ${response.level}!`
            : response.message,
        })

        return response
      }

      return null
    } catch (error) {
      console.error('Error triggering gamification action:', error)
      return null
    }
  }

  // Specific action helpers
  const contactAdded = () => triggerAction('contact_added')
  const meetingScheduled = () => triggerAction('meeting_scheduled')
  const meetingCompleted = () => triggerAction('meeting_completed')
  const emailSent = () => triggerAction('email_sent')
  const callMade = () => triggerAction('call_made')
  const noteAdded = () => triggerAction('note_added')
  const opportunityCreated = () => triggerAction('opportunity_created')
  const followUpCompleted = () => triggerAction('follow_up_completed')
  const integrationConnected = () => triggerAction('integration_connected')
  const profileCompleted = () => triggerAction('profile_completed')

  return {
    triggerAction,
    contactAdded,
    meetingScheduled,
    meetingCompleted,
    emailSent,
    callMade,
    noteAdded,
    opportunityCreated,
    followUpCompleted,
    integrationConnected,
    profileCompleted
  }
}