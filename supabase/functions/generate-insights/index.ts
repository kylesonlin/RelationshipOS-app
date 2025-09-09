import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    console.log(`Generating insights for user: ${user.id}`)

    const now = new Date()
    const insights = []

    // 1. Meeting Prep Insights - Next 48 hours
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    
    const { data: upcomingEvents } = await supabaseClient
      .from('calendar_events')
      .select(`
        *, 
        contacts!inner(id, first_name, last_name, email, company)
      `)
      .eq('user_id', user.id)
      .gte('start_time', now.toISOString())
      .lte('start_time', twoDaysFromNow.toISOString())
      .order('start_time', { ascending: true })

    for (const event of upcomingEvents || []) {
      const startTime = new Date(event.start_time)
      const hoursUntil = Math.round((startTime.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      insights.push({
        user_id: user.id,
        contact_id: event.contacts?.id,
        insight_type: 'meeting_prep',
        title: `Meeting prep: ${event.summary}`,
        description: `In ${hoursUntil} hours with ${event.contacts?.first_name} ${event.contacts?.last_name} - Review recent interactions`,
        priority: hoursUntil < 4 ? 'high' : 'medium',
        action_data: {
          meeting_title: event.summary,
          meeting_time: event.start_time,
          contact_name: `${event.contacts?.first_name} ${event.contacts?.last_name}`,
          contact_email: event.contacts?.email,
          meeting_link: event.meeting_link,
          hours_until: hoursUntil
        },
        expires_at: event.start_time
      })
    }

    // 2. Follow-up Insights - Stale relationships
    const { data: staleContacts } = await supabaseClient
      .rpc('get_stale_contacts', { 
        user_id_param: user.id,
        days_threshold: 14 
      })

    for (const contact of (staleContacts || []).slice(0, 3)) {
      insights.push({
        user_id: user.id,
        contact_id: contact.id,
        insight_type: 'follow_up',
        title: `Follow up with ${contact.first_name} ${contact.last_name}`,
        description: `No recent activity - send a quick check-in message`,
        priority: 'medium',
        action_data: {
          contact_name: `${contact.first_name} ${contact.last_name}`,
          contact_email: contact.email,
          days_since_contact: contact.days_since_last_contact
        },
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 3. Email Response Insights - Unresponded emails
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    
    const { data: unrepliedEmails } = await supabaseClient
      .from('email_interactions')
      .select(`
        *,
        contacts!inner(id, first_name, last_name, email)
      `)
      .eq('user_id', user.id)
      .eq('direction', 'received')
      .gte('sent_at', twoDaysAgo.toISOString())
      .order('sent_at', { ascending: false })
      .limit(5)

    for (const email of unrepliedEmails || []) {
      // Check if user already replied to this thread
      const { data: replied } = await supabaseClient
        .from('email_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', email.thread_id)
        .eq('direction', 'sent')
        .gt('sent_at', email.sent_at)
        .limit(1)

      if (!replied || replied.length === 0) {
        insights.push({
          user_id: user.id,
          contact_id: email.contact_id,
          insight_type: 'email_response',
          title: `Reply to ${email.contacts?.first_name} ${email.contacts?.last_name}`,
          description: `"${email.subject}" - Received ${Math.round((now.getTime() - new Date(email.sent_at).getTime()) / (1000 * 60 * 60))} hours ago`,
          priority: 'high',
          action_data: {
            contact_name: `${email.contacts?.first_name} ${email.contacts?.last_name}`,
            contact_email: email.contacts?.email,
            email_subject: email.subject,
            email_snippet: email.snippet,
            thread_id: email.thread_id
          },
          expires_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }

    // 4. Simulated LinkedIn-style insights (teaser for Level 4 feature)
    const simulatedInsights = [
      {
        user_id: user.id,
        contact_id: null,
        insight_type: 'linkedin_preview',
        title: 'Sarah Chen visiting San Francisco',
        description: 'Your contact from Acme Corp is in your area next week - perfect coffee opportunity',
        priority: 'high',
        action_data: {
          contact_name: 'Sarah Chen',
          company: 'Acme Corp',
          location: 'San Francisco',
          visit_dates: 'Next week',
          unlock_level: 4
        },
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: user.id,
        contact_id: null,
        insight_type: 'linkedin_preview',
        title: 'Michael Rodriguez promoted to VP',
        description: 'Your connection just got promoted - great opportunity to congratulate and reconnect',
        priority: 'medium',
        action_data: {
          contact_name: 'Michael Rodriguez',
          new_title: 'VP of Engineering',
          company: 'TechFlow Inc',
          unlock_level: 4
        },
        expires_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Add simulated insights for demo purposes
    insights.push(...simulatedInsights)

    // Clean up expired insights
    await supabaseClient
      .from('relationship_insights')
      .delete()
      .eq('user_id', user.id)
      .lt('expires_at', now.toISOString())

    // Store new insights
    if (insights.length > 0) {
      await supabaseClient
        .from('relationship_insights')
        .upsert(insights, { 
          onConflict: 'user_id,insight_type,title',
          ignoreDuplicates: false
        })
    }

    console.log(`Generated ${insights.length} insights for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights_generated: insights.length,
        insights: insights.map(i => ({
          type: i.insight_type,
          title: i.title,
          priority: i.priority
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Generate insights error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to get stale contacts (this would be a database function in production)
async function getStaleContacts(supabaseClient: any, userId: string, daysThreshold: number) {
  const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000)
  
  const { data } = await supabaseClient
    .from('contacts')
    .select(`
      id, first_name, last_name, email,
      contact_activities(activity_date)
    `)
    .eq('userId', userId)
    .order('updated_at', { ascending: true })
  
  return data?.filter((contact: any) => {
    const lastActivity = contact.contact_activities?.[0]?.activity_date
    return !lastActivity || new Date(lastActivity) < cutoffDate
  }).slice(0, 5) || []
}