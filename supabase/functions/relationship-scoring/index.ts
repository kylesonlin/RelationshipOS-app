import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RelationshipFactors {
  emailFrequency: number
  responseRate: number
  meetingFrequency: number
  sentimentTrend: number
  recentActivity: number
  connectionLength: number
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

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { contactId } = await req.json()

    // Get contact data
    const { data: contact } = await supabaseClient
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single()

    if (!contact) {
      return new Response('Contact not found', { status: 404, headers: corsHeaders })
    }

    // Calculate relationship score based on multiple factors
    const factors = await calculateRelationshipFactors(supabaseClient, user.id, contactId)
    const relationshipScore = calculateOverallScore(factors)

    // Update contact with new score
    await supabaseClient
      .from('contacts')
      .update({ 
        relationship_strength: relationshipScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)

    // Store analytics
    await supabaseClient
      .from('relationship_analytics')
      .upsert({
        user_id: user.id,
        contact_id: contactId,
        metric_date: new Date().toISOString().split('T')[0],
        relationship_trend: determineRelationshipTrend(factors),
      }, { onConflict: 'user_id,contact_id,metric_date' })

    return new Response(
      JSON.stringify({
        success: true,
        contactId,
        previousScore: contact.relationship_strength,
        newScore: relationshipScore,
        factors,
        insights: generateInsights(factors, relationshipScore)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Relationship scoring error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function calculateRelationshipFactors(
  supabaseClient: any, 
  userId: string, 
  contactId: string
): Promise<RelationshipFactors> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Email frequency (last 30 days)
  const { data: emailInteractions } = await supabaseClient
    .from('email_interactions')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_id', contactId)
    .gte('sent_at', thirtyDaysAgo.toISOString())

  // Calculate email metrics
  const sentEmails = emailInteractions?.filter(e => e.direction === 'sent').length || 0
  const receivedEmails = emailInteractions?.filter(e => e.direction === 'received').length || 0
  const responseRate = sentEmails > 0 ? receivedEmails / sentEmails : 0

  // Meeting frequency
  const { data: meetings } = await supabaseClient
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', thirtyDaysAgo.toISOString())

  const meetingsWithContact = meetings?.filter(m => 
    JSON.stringify(m.attendees || {}).toLowerCase().includes(contactId.toLowerCase())
  ).length || 0

  // Sentiment analysis
  const avgSentiment = emailInteractions?.length > 0 
    ? emailInteractions.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / emailInteractions.length
    : 0

  // Recent activity score
  const { data: contact } = await supabaseClient
    .from('contacts')
    .select('last_contact_date, created_at')
    .eq('id', contactId)
    .single()

  const daysSinceLastContact = contact?.last_contact_date 
    ? Math.floor((Date.now() - new Date(contact.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const connectionLengthDays = contact?.created_at
    ? Math.floor((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    emailFrequency: Math.min(sentEmails + receivedEmails, 10) / 10, // Normalize to 0-1
    responseRate: Math.min(responseRate, 1),
    meetingFrequency: Math.min(meetingsWithContact, 5) / 5, // Normalize to 0-1
    sentimentTrend: (avgSentiment + 1) / 2, // Convert -1,1 to 0,1
    recentActivity: Math.max(0, 1 - (daysSinceLastContact / 30)), // More recent = higher score
    connectionLength: Math.min(connectionLengthDays / 365, 1) // Longer relationships = higher score
  }
}

function calculateOverallScore(factors: RelationshipFactors): number {
  const weights = {
    emailFrequency: 0.25,
    responseRate: 0.20,
    meetingFrequency: 0.20,
    sentimentTrend: 0.15,
    recentActivity: 0.15,
    connectionLength: 0.05
  }

  const weightedScore = 
    factors.emailFrequency * weights.emailFrequency +
    factors.responseRate * weights.responseRate +
    factors.meetingFrequency * weights.meetingFrequency +
    factors.sentimentTrend * weights.sentimentTrend +
    factors.recentActivity * weights.recentActivity +
    factors.connectionLength * weights.connectionLength

  // Convert to 1-10 scale
  return Math.round(Math.max(1, Math.min(10, weightedScore * 10)))
}

function determineRelationshipTrend(factors: RelationshipFactors): string {
  const currentScore = factors.recentActivity * 0.4 + factors.sentimentTrend * 0.6
  
  if (currentScore > 0.7) return 'improving'
  if (currentScore < 0.4) return 'declining'
  return 'stable'
}

function generateInsights(factors: RelationshipFactors, score: number): string[] {
  const insights = []

  if (factors.responseRate < 0.3) {
    insights.push("Low response rate detected - consider changing communication approach")
  }

  if (factors.recentActivity < 0.3) {
    insights.push("Haven't connected recently - good time for a follow-up")
  }

  if (factors.sentimentTrend > 0.7) {
    insights.push("Positive communication sentiment - relationship is strong")
  }

  if (factors.meetingFrequency > 0.6) {
    insights.push("High meeting frequency indicates strong professional relationship")
  }

  if (score >= 8) {
    insights.push("This is a high-value relationship - maintain regular contact")
  } else if (score <= 4) {
    insights.push("Relationship needs attention - consider scheduling a call or meeting")
  }

  return insights
}