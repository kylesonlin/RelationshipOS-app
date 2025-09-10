import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleContact {
  resourceName: string
  names?: Array<{
    displayName: string
    givenName: string
    familyName: string
  }>
  emailAddresses?: Array<{
    value: string
    type: string
  }>
  phoneNumbers?: Array<{
    value: string
    type: string
  }>
  organizations?: Array<{
    name: string
    title: string
  }>
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

    console.log(`Starting contacts sync for user: ${user.id}`)

    // Get Google contacts access token
    const { data: tokens } = await supabaseClient
      .from('user_google_tokens')
      .select('access_token, refresh_token, expires_at, scopes')
      .eq('user_id', user.id)
      .single()

    if (!tokens?.access_token) {
      return new Response('Google not connected', { status: 400, headers: corsHeaders })
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

    // Check if user has contacts scope
    const hasContactsScope = tokens.scopes?.includes('https://www.googleapis.com/auth/contacts.readonly')
    if (!hasContactsScope) {
      console.log('Contacts permission not granted - skipping contacts sync')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Contacts permission not granted - contacts sync skipped',
        processed: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Fetch contacts from Google People API
    const contactsResponse = await fetch(
      `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations&pageSize=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!contactsResponse.ok) {
      throw new Error(`Google Contacts API error: ${contactsResponse.statusText}`)
    }

    const { connections } = await contactsResponse.json()
    const processedContacts = []

    // Process each Google contact
    for (const contact of connections || []) {
      try {
        const googleContact: GoogleContact = contact

        // Extract contact info
        const name = googleContact.names?.[0]
        const email = googleContact.emailAddresses?.[0]?.value
        const phone = googleContact.phoneNumbers?.[0]?.value
        const organization = googleContact.organizations?.[0]

        // Skip contacts without email addresses
        if (!email || !name) continue

        const firstName = name.givenName || name.displayName?.split(' ')[0] || ''
        const lastName = name.familyName || name.displayName?.split(' ').slice(1).join(' ') || ''

        // Check if contact already exists
        const { data: existingContact } = await supabaseClient
          .from('contacts')
          .select('id')
          .eq('email', email)
          .eq('userId', user.id)
          .single()

        if (!existingContact) {
          // Create new contact
          await supabaseClient
            .from('contacts')
            .insert({
              userId: user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              company: organization?.name,
              title: organization?.title,
              additional_fields: {
                source: 'google_contacts',
                google_resource_name: googleContact.resourceName
              }
            })

          processedContacts.push({
            email,
            name: `${firstName} ${lastName}`.trim(),
            company: organization?.name,
            source: 'google_contacts'
          })
        }

      } catch (error) {
        console.error(`Error processing contact:`, error)
      }
    }

    console.log(`Contacts sync completed: ${processedContacts.length} new contacts imported`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedContacts.length,
        contacts: processedContacts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Contacts sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})