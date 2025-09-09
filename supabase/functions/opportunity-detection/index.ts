import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OpportunityPattern {
  type: string
  title: string
  description: string
  confidence: number
  priority: 'low' | 'medium' | 'high'
  expiresInDays?: number
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

    const detectedOpportunities = []

    // 1. Detect follow-up opportunities (contacts not contacted recently)
    const { data: staleContacts } = await supabaseClient
      .from('contacts')
      .select('id, first_name, last_name, email, last_contact_date, relationship_strength')
      .eq('user_id', user.id)
      .gte('relationship_strength', 6) // Only high-value contacts
      .order('last_contact_date', { ascending: true })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    for (const contact of staleContacts?.slice(0, 10) || []) {
      const lastContact = contact.last_contact_date ? new Date(contact.last_contact_date) : null
      
      if (!lastContact || lastContact < oneWeekAgo) {
        const daysSinceContact = lastContact 
          ? Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
          : 999

        const opportunity: OpportunityPattern = {
          type: 'follow-up',
          title: `Follow up with ${contact.first_name} ${contact.last_name}`,
          description: `High-value contact (${contact.relationship_strength}/10) hasn't been contacted in ${daysSinceContact} days`,
          confidence: Math.min(9, 5 + Math.floor(daysSinceContact / 7)),
          priority: daysSinceContact > 21 ? 'high' : daysSinceContact > 14 ? 'medium' : 'low',
          expiresInDays: 7
        }

        await createOpportunity(supabaseClient, user.id, contact.id, opportunity)
        detectedOpportunities.push({ contactEmail: contact.email, ...opportunity })
      }
    }

    // 2. Detect response opportunities (emails that need replies)
    const { data: unrepliedEmails } = await supabaseClient
      .from('email_interactions')
      .select(`
        id, contact_id, subject, sent_at, 
        contacts!inner(id, first_name, last_name, email, relationship_strength)
      `)
      .eq('user_id', user.id)
      .eq('direction', 'received')
      .gte('contacts.relationship_strength', 5)
      .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    for (const email of unrepliedEmails?.slice(0, 5) || []) {
      // Check if we've replied to this email
      const { data: replies } = await supabaseClient
        .from('email_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_id', email.contact_id)
        .eq('direction', 'sent')
        .gte('sent_at', email.sent_at)

      if (!replies || replies.length === 0) {
        const hoursAgo = Math.floor((Date.now() - new Date(email.sent_at).getTime()) / (1000 * 60 * 60))
        
        if (hoursAgo > 24) {
          const opportunity: OpportunityPattern = {
            type: 'email-response',
            title: `Reply to ${email.contacts.first_name} ${email.contacts.last_name}`,
            description: `Email "${email.subject}" from ${hoursAgo} hours ago needs a response`,
            confidence: Math.min(9, 6 + Math.floor(hoursAgo / 24)),
            priority: hoursAgo > 72 ? 'high' : hoursAgo > 48 ? 'medium' : 'low',
            expiresInDays: 3
          }

          await createOpportunity(supabaseClient, user.id, email.contact_id, opportunity)
          detectedOpportunities.push({ contactEmail: email.contacts.email, ...opportunity })
        }
      }
    }

    // 3. Detect introduction opportunities (mutual connections)
    const { data: contacts } = await supabaseClient
      .from('contacts')
      .select('id, first_name, last_name, email, company, job_title')
      .eq('user_id', user.id)
      .not('company', 'is', null)

    const introOpportunities = findIntroductionOpportunities(contacts || [])
    
    for (const intro of introOpportunities.slice(0, 3)) {
      const opportunity: OpportunityPattern = {
        type: 'introduction',
        title: `Introduce ${intro.contact1.first_name} to ${intro.contact2.first_name}`,
        description: `Both work in ${intro.commonGround} - potential collaboration opportunity`,
        confidence: intro.confidence,
        priority: intro.confidence > 7 ? 'high' : 'medium',
        expiresInDays: 14
      }

      await createOpportunity(supabaseClient, user.id, intro.contact1.id, opportunity)
      detectedOpportunities.push({ 
        contactEmail: intro.contact1.email, 
        secondaryContact: intro.contact2.email,
        ...opportunity 
      })
    }

    // 4. Detect upcoming meeting preparation opportunities
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const { data: upcomingMeetings } = await supabaseClient
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', new Date().toISOString())
      .lte('start_time', nextWeek.toISOString())

    for (const meeting of upcomingMeetings?.slice(0, 5) || []) {
      if (!meeting.preparation_notes && meeting.attendees) {
        const opportunity: OpportunityPattern = {
          type: 'meeting-prep',
          title: `Prepare for "${meeting.title}"`,
          description: `Meeting in ${Math.ceil((new Date(meeting.start_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days - review context and talking points`,
          confidence: 8,
          priority: new Date(meeting.start_time) < tomorrow ? 'high' : 'medium',
          expiresInDays: 1
        }

        // Find the primary contact for this meeting
        const attendeeEmails = Object.values(meeting.attendees || {})
        if (attendeeEmails.length > 0) {
          const { data: meetingContact } = await supabaseClient
            .from('contacts')
            .select('id')
            .eq('user_id', user.id)
            .in('email', attendeeEmails)
            .limit(1)
            .single()

          if (meetingContact) {
            await createOpportunity(supabaseClient, user.id, meetingContact.id, opportunity)
            detectedOpportunities.push({ 
              meetingId: meeting.id,
              ...opportunity 
            })
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        opportunities: detectedOpportunities,
        count: detectedOpportunities.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Opportunity detection error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createOpportunity(
  supabaseClient: any, 
  userId: string, 
  contactId: string, 
  opportunity: OpportunityPattern
) {
  const expiresAt = opportunity.expiresInDays 
    ? new Date(Date.now() + opportunity.expiresInDays * 24 * 60 * 60 * 1000)
    : null

  // Check if similar opportunity already exists
  const { data: existing } = await supabaseClient
    .from('opportunities')
    .select('id')
    .eq('user_id', userId)
    .eq('contact_id', contactId)
    .eq('opportunity_type', opportunity.type)
    .eq('status', 'open')
    .single()

  if (!existing) {
    await supabaseClient
      .from('opportunities')
      .insert({
        user_id: userId,
        contact_id: contactId,
        opportunity_type: opportunity.type,
        title: opportunity.title,
        description: opportunity.description,
        confidence_score: opportunity.confidence,
        priority: opportunity.priority,
        expires_at: expiresAt?.toISOString()
      })
  }
}

function findIntroductionOpportunities(contacts: any[]): any[] {
  const opportunities = []
  
  // Group contacts by company and industry keywords
  const companyGroups = new Map()
  const industryKeywords = ['tech', 'marketing', 'sales', 'finance', 'consulting', 'healthcare', 'education']
  
  contacts.forEach(contact => {
    if (contact.company) {
      if (!companyGroups.has(contact.company)) {
        companyGroups.set(contact.company, [])
      }
      companyGroups.get(contact.company).push(contact)
    }
  })

  // Find potential introductions within same companies
  companyGroups.forEach((companyContacts, company) => {
    if (companyContacts.length >= 2) {
      for (let i = 0; i < companyContacts.length - 1; i++) {
        for (let j = i + 1; j < companyContacts.length; j++) {
          opportunities.push({
            contact1: companyContacts[i],
            contact2: companyContacts[j],
            commonGround: company,
            confidence: 8
          })
        }
      }
    }
  })

  // Find potential introductions by job title similarity
  const titleGroups = new Map()
  contacts.forEach(contact => {
    if (contact.job_title) {
      const normalizedTitle = contact.job_title.toLowerCase()
      industryKeywords.forEach(keyword => {
        if (normalizedTitle.includes(keyword)) {
          if (!titleGroups.has(keyword)) {
            titleGroups.set(keyword, [])
          }
          titleGroups.get(keyword).push(contact)
        }
      })
    }
  })

  titleGroups.forEach((titleContacts, industry) => {
    if (titleContacts.length >= 2) {
      for (let i = 0; i < Math.min(titleContacts.length - 1, 3); i++) {
        for (let j = i + 1; j < Math.min(titleContacts.length, 4); j++) {
          if (titleContacts[i].company !== titleContacts[j].company) {
            opportunities.push({
              contact1: titleContacts[i],
              contact2: titleContacts[j],
              commonGround: `${industry} industry`,
              confidence: 6
            })
          }
        }
      }
    }
  })

  return opportunities.slice(0, 10) // Return top 10 opportunities
}