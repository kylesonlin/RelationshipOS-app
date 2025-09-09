import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
  }
  internalDate: string
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

    // Get Gmail access token
    const { data: integration } = await supabaseClient
      .from('user_integrations')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .eq('provider', 'gmail')
      .eq('is_active', true)
      .single()

    if (!integration?.access_token) {
      return new Response('Gmail not connected', { status: 400, headers: corsHeaders })
    }

    // Fetch recent emails from Gmail API
    const gmailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:sent OR in:inbox`,
      {
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${gmailResponse.statusText}`)
    }

    const { messages } = await gmailResponse.json()
    const processedEmails = []

    // Process each email
    for (const message of messages?.slice(0, 20) || []) {
      try {
        // Get full message details
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${integration.access_token}`,
            },
          }
        )

        const emailData: EmailMessage = await messageResponse.json()
        const headers = emailData.payload.headers

        // Extract email metadata
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const from = headers.find(h => h.name === 'From')?.value || ''
        const to = headers.find(h => h.name === 'To')?.value || ''
        const date = new Date(parseInt(emailData.internalDate))

        // Determine direction (sent or received)
        const userEmail = user.email
        const direction = from.includes(userEmail) ? 'sent' : 'received'
        const contactEmail = direction === 'sent' 
          ? to.match(/[\w\.-]+@[\w\.-]+/)?.[0] 
          : from.match(/[\w\.-]+@[\w\.-]+/)?.[0]

        if (!contactEmail || contactEmail === userEmail) continue

        // Find or create contact
        let { data: contact } = await supabaseClient
          .from('contacts')
          .select('id')
          .eq('email', contactEmail)
          .eq('user_id', user.id)
          .single()

        if (!contact) {
          // Extract name from email header
          const nameMatch = (direction === 'sent' ? to : from).match(/^([^<]+)/)
          const name = nameMatch?.[1]?.trim().replace(/"/g, '') || ''
          const [firstName, ...lastNameParts] = name.split(' ')

          const { data: newContact } = await supabaseClient
            .from('contacts')
            .insert({
              user_id: user.id,
              email: contactEmail,
              first_name: firstName || contactEmail.split('@')[0],
              last_name: lastNameParts.join(' ') || '',
            })
            .select('id')
            .single()

          contact = newContact
        }

        // Analyze sentiment (simple keyword-based for now)
        const sentimentScore = analyzeSentiment(emailData.snippet)

        // Store email interaction
        await supabaseClient
          .from('email_interactions')
          .upsert({
            user_id: user.id,
            contact_id: contact.id,
            email_id: emailData.id,
            subject,
            snippet: emailData.snippet,
            direction,
            sent_at: date.toISOString(),
            thread_id: emailData.threadId,
            sentiment_score: sentimentScore,
          }, { onConflict: 'email_id' })

        // Update contact's last contact date
        if (direction === 'sent') {
          await supabaseClient
            .from('contacts')
            .update({ 
              last_contact_date: date.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', contact.id)
        }

        processedEmails.push({
          id: emailData.id,
          subject,
          contact: contactEmail,
          direction,
          sentiment: sentimentScore
        })

      } catch (error) {
        console.error(`Error processing email ${message.id}:`, error)
      }
    }

    // Update last sync time
    await supabaseClient
      .from('user_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', 'gmail')

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedEmails.length,
        emails: processedEmails 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Gmail sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function analyzeSentiment(text: string): number {
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect', 'awesome', 'brilliant', 'outstanding']
  const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'disgusting', 'worst', 'bad', 'disappointed', 'angry', 'frustrated']
  
  const words = text.toLowerCase().split(/\W+/)
  let score = 0
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1
    if (negativeWords.includes(word)) score -= 0.1
  })
  
  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score))
}