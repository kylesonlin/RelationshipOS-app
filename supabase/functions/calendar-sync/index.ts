import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: string
  }>
  location?: string
  hangoutLink?: string
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string
      uri: string
    }>
  }
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

    console.log(`Starting calendar sync for user: ${user.id}`)

    // Get Google Calendar access token
    const { data: tokens } = await supabaseClient
      .from('user_google_tokens')
      .select('access_token, refresh_token, expires_at, scopes')
      .eq('user_id', user.id)
      .single()

    if (!tokens?.access_token) {
      return new Response('Calendar not connected', { status: 400, headers: corsHeaders })
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokens.access_token
    const now = new Date()
    const expiresAt = new Date(tokens.expires_at)
    
    if (now >= expiresAt && tokens.refresh_token) {
      // Refresh the access token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        accessToken = refreshData.access_token
        
        // Update the stored token
        await supabaseClient
          .from('user_google_tokens')
          .update({ 
            access_token: accessToken,
            expires_at: new Date(now.getTime() + refreshData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } else {
        return new Response('Failed to refresh token - please reconnect Google account', { 
          status: 401, 
          headers: corsHeaders 
        })
      }
    } else if (now >= expiresAt) {
      return new Response('Access token expired - please reconnect Google account', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Check if user has calendar scope
    const hasCalendarScope = tokens.scopes?.includes('https://www.googleapis.com/auth/calendar.readonly')
    if (!hasCalendarScope) {
      return new Response('Calendar permission not granted', { status: 400, headers: corsHeaders })
    }

    // Get calendar events from the last 30 days and next 7 days
    const now = new Date()
    const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch events from Google Calendar API
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=50&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!calendarResponse.ok) {
      throw new Error(`Calendar API error: ${calendarResponse.statusText}`)
    }

    const { items: events } = await calendarResponse.json()
    const processedEvents = []
    const insights = []

    // Process each calendar event
    for (const event of events || []) {
      try {
        const calendarEvent: CalendarEvent = event

        // Skip all-day events without times
        if (!calendarEvent.start.dateTime || !calendarEvent.end.dateTime) {
          continue
        }

        const startTime = new Date(calendarEvent.start.dateTime)
        const endTime = new Date(calendarEvent.end.dateTime)
        const attendees = calendarEvent.attendees || []

        // Extract meeting links
        let meetingLink = calendarEvent.hangoutLink
        if (!meetingLink && calendarEvent.conferenceData?.entryPoints) {
          const videoEntry = calendarEvent.conferenceData.entryPoints.find(
            entry => entry.entryPointType === 'video'
          )
          meetingLink = videoEntry?.uri
        }

        // Store calendar event
        await supabaseClient
          .from('calendar_events')
          .upsert({
            user_id: user.id,
            event_id: calendarEvent.id,
            summary: calendarEvent.summary || 'Untitled Meeting',
            description: calendarEvent.description,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            attendees: attendees,
            location: calendarEvent.location,
            meeting_link: meetingLink,
          }, { onConflict: 'user_id,event_id' })

        // Process attendees and create relationship insights
        for (const attendee of attendees) {
          if (attendee.email === user.email) continue

          // Find or create contact
          let { data: contact } = await supabaseClient
            .from('contacts')
            .select('id, first_name, last_name')
            .eq('email', attendee.email)
            .eq('userId', user.id)
            .single()

          if (!contact) {
            // Create new contact from calendar attendee
            const name = attendee.displayName || attendee.email.split('@')[0]
            const [firstName, ...lastNameParts] = name.split(' ')

            const { data: newContact } = await supabaseClient
              .from('contacts')
              .insert({
                userId: user.id,
                email: attendee.email,
                first_name: firstName || name,
                last_name: lastNameParts.join(' ') || '',
              })
              .select('id, first_name, last_name')
              .single()

            contact = newContact
          }

          if (contact) {
            // Record contact activity
            await supabaseClient
              .from('contact_activities')
              .upsert({
                user_id: user.id,
                contact_id: contact.id,
                activity_type: 'meeting',
                activity_date: startTime.toISOString(),
                metadata: {
                  meeting_title: calendarEvent.summary,
                  duration_minutes: Math.round((endTime.getTime() - startTime.getTime()) / 60000),
                  location: calendarEvent.location,
                  meeting_link: meetingLink
                }
              })

            // Generate meeting prep insights for upcoming meetings
            if (startTime > now && startTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
              insights.push({
                user_id: user.id,
                contact_id: contact.id,
                insight_type: 'meeting_prep',
                title: `Prep for meeting with ${contact.first_name} ${contact.last_name}`,
                description: `Tomorrow: "${calendarEvent.summary}" - Review recent interactions and talking points`,
                priority: 'high',
                action_data: {
                  meeting_title: calendarEvent.summary,
                  meeting_time: startTime.toISOString(),
                  contact_email: attendee.email,
                  meeting_link: meetingLink
                },
                expires_at: startTime.toISOString()
              })
            }
          }
        }

        processedEvents.push({
          id: calendarEvent.id,
          summary: calendarEvent.summary,
          start_time: startTime.toISOString(),
          attendees_count: attendees.length,
          has_meeting_link: !!meetingLink
        })

      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error)
      }
    }

    // Generate stale relationship insights
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: staleContacts } = await supabaseClient
      .from('contacts')
      .select(`
        id, first_name, last_name, email,
        contact_activities!inner(activity_date)
      `)
      .eq('userId', user.id)
      .lt('contact_activities.activity_date', thirtyDaysAgo.toISOString())
      .limit(5)

    for (const contact of staleContacts || []) {
      insights.push({
        user_id: user.id,
        contact_id: contact.id,
        insight_type: 'follow_up',
        title: `Reconnect with ${contact.first_name} ${contact.last_name}`,
        description: `Haven't connected in over 30 days - perfect time for a check-in`,
        priority: 'medium',
        action_data: {
          contact_email: contact.email,
          last_activity: contact.contact_activities?.[0]?.activity_date
        },
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Store all insights
    if (insights.length > 0) {
      await supabaseClient
        .from('relationship_insights')
        .upsert(insights, { onConflict: 'user_id,contact_id,insight_type' })
    }

    console.log(`Calendar sync completed: ${processedEvents.length} events, ${insights.length} insights`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_events: processedEvents.length,
        insights_generated: insights.length,
        events: processedEvents,
        insights: insights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Calendar sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})