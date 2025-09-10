import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // 4. AI-Powered Relationship Health Insights
    const { data: contactData } = await supabaseClient
      .from('contacts')
      .select(`
        id, first_name, last_name, email, company,
        email_interactions!inner(sent_at, direction, sentiment_score)
      `)
      .eq('userId', user.id)
      .order('last_contact_date', { ascending: true })
      .limit(10)

    // Generate AI-powered insights for relationship health
    const relationshipInsights = await generateRelationshipHealthInsights(contactData || [])
    insights.push(...relationshipInsights.map(insight => ({
      ...insight,
      user_id: user.id,
      expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })))

    // 5. Smart Opportunity Detection via AI
    const { data: recentContacts } = await supabaseClient
      .from('contacts')
      .select(`
        id, first_name, last_name, email, company, title,
        contact_activities(activity_type, activity_date)
      `)
      .eq('userId', user.id)
      .gte('updated_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const opportunityInsights = await generateOpportunityInsights(recentContacts || [])
    insights.push(...opportunityInsights.map(insight => ({
      ...insight,
      user_id: user.id,
      expires_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
    })))

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

// AI-powered relationship health analysis
async function generateRelationshipHealthInsights(contacts: any[]): Promise<any[]> {
  const insights = []
  
  for (const contact of contacts.slice(0, 5)) {
    const interactions = contact.email_interactions || []
    const sentimentAvg = interactions.reduce((sum: number, i: any) => sum + (i.sentiment_score || 0), 0) / interactions.length
    const responseTime = calculateAverageResponseTime(interactions)
    
    // Declining sentiment detection
    if (sentimentAvg < -0.2 && interactions.length > 2) {
      insights.push({
        contact_id: contact.id,
        insight_type: 'relationship_health',
        title: `Relationship cooling with ${contact.first_name} ${contact.last_name}`,
        description: `Sentiment analysis shows declining engagement (${(sentimentAvg * 100).toFixed(0)}% negative trend). Consider a warm outreach.`,
        priority: 'high',
        action_data: {
          contact_name: `${contact.first_name} ${contact.last_name}`,
          sentiment_score: sentimentAvg,
          suggested_action: 'Schedule a friendly check-in call',
          talking_points: ['Ask about recent projects', 'Share relevant industry insights', 'Offer assistance']
        }
      })
    }
    
    // Positive momentum detection
    if (sentimentAvg > 0.3 && interactions.length > 1) {
      insights.push({
        contact_id: contact.id,
        insight_type: 'positive_momentum',
        title: `Strong momentum with ${contact.first_name} ${contact.last_name}`,
        description: `Excellent engagement trend (${(sentimentAvg * 100).toFixed(0)}% positive). Perfect time for deeper collaboration.`,
        priority: 'medium',
        action_data: {
          contact_name: `${contact.first_name} ${contact.last_name}`,
          sentiment_score: sentimentAvg,
          suggested_action: 'Propose strategic collaboration',
          next_steps: ['Schedule strategy session', 'Explore partnership opportunities', 'Make strategic introductions']
        }
      })
    }
  }
  
  return insights
}

// Smart opportunity detection using AI patterns
async function generateOpportunityInsights(contacts: any[]): Promise<any[]> {
  const insights = []
  
  // Group contacts by company for introduction opportunities
  const companyMap = new Map()
  contacts.forEach(contact => {
    if (contact.company) {
      if (!companyMap.has(contact.company)) {
        companyMap.set(contact.company, [])
      }
      companyMap.get(contact.company).push(contact)
    }
  })
  
  // Detect warm introduction opportunities
  companyMap.forEach((companyContacts, company) => {
    if (companyContacts.length >= 2) {
      const contact1 = companyContacts[0]
      const contact2 = companyContacts[1]
      
      insights.push({
        contact_id: contact1.id,
        insight_type: 'warm_introduction',
        title: `Introduction opportunity at ${company}`,
        description: `You know ${contact1.first_name} and ${contact2.first_name} at ${company}. Consider facilitating an introduction.`,
        priority: 'medium',
        action_data: {
          primary_contact: `${contact1.first_name} ${contact1.last_name}`,
          secondary_contact: `${contact2.first_name} ${contact2.last_name}`,
          company: company,
          introduction_value: 'Cross-department collaboration potential'
        }
      })
    }
  })
  
  // Detect industry expertise patterns
  const titleKeywords = ['VP', 'Director', 'Head of', 'Chief', 'Manager']
  const seniorContacts = contacts.filter(contact => 
    titleKeywords.some(keyword => contact.title?.includes(keyword))
  )
  
  if (seniorContacts.length > 0) {
    const contact = seniorContacts[0]
    insights.push({
      contact_id: contact.id,
      insight_type: 'expertise_network',
      title: `Industry expertise: ${contact.first_name} ${contact.last_name}`,
      description: `${contact.title} at ${contact.company} - valuable for strategic insights and industry intelligence.`,
      priority: 'medium',
      action_data: {
        contact_name: `${contact.first_name} ${contact.last_name}`,
        expertise_area: contact.title,
        suggested_topics: ['Industry trends', 'Strategic insights', 'Market intelligence']
      }
    })
  }
  
  return insights
}

// Calculate average response time for relationship health
function calculateAverageResponseTime(interactions: any[]): number {
  const responses = interactions
    .filter((i: any) => i.direction === 'sent')
    .map((i: any) => new Date(i.sent_at).getTime())
  
  if (responses.length < 2) return 0
  
  const intervals = []
  for (let i = 1; i < responses.length; i++) {
    intervals.push(responses[i] - responses[i-1])
  }
  
  return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length / (1000 * 60 * 60) // hours
}