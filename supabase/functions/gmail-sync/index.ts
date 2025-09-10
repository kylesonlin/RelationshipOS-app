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

    // Get Gmail access token from user_google_tokens table
    const { data: tokens } = await supabaseClient
      .from('user_google_tokens')
      .select('access_token, refresh_token, expires_at, scopes')
      .eq('user_id', user.id)
      .single()

    if (!tokens?.access_token) {
      return new Response('Gmail not connected', { status: 400, headers: corsHeaders })
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

    // Check if user has Gmail scope
    const hasGmailScope = tokens.scopes?.includes('https://www.googleapis.com/auth/gmail.readonly')
    if (!hasGmailScope) {
      return new Response('Gmail permission not granted', { status: 400, headers: corsHeaders })
    }

    // Fetch recent emails from Gmail API
    const gmailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:sent OR in:inbox`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
              'Authorization': `Bearer ${accessToken}`,
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
          .eq('userId', user.id)
          .single()

        if (!contact) {
          // Extract name from email header
          const nameMatch = (direction === 'sent' ? to : from).match(/^([^<]+)/)
          const name = nameMatch?.[1]?.trim().replace(/"/g, '') || ''
          const [firstName, ...lastNameParts] = name.split(' ')

          const { data: newContact } = await supabaseClient
            .from('contacts')
            .insert({
              userId: user.id,
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

    // Update last sync time in google tokens table
    await supabaseClient
      .from('user_google_tokens')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

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