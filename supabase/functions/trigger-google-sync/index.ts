import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response('User ID required', { status: 400, headers: corsHeaders });
    }

    console.log(`Starting Google sync for user: ${user_id}`);

    // Check if user has valid Google tokens
    const { data: tokens } = await supabaseClient
      .from('user_google_tokens')
      .select('access_token, expires_at, scopes')
      .eq('user_id', user_id)
      .single();

    if (!tokens?.access_token) {
      return new Response('Google not connected', { status: 400, headers: corsHeaders });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokens.expires_at);
    if (now >= expiresAt) {
      return new Response('Access token expired - please reconnect Google account', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const results = [];

    // Sync Gmail if scope is available
    const hasGmailScope = tokens.scopes?.includes('https://www.googleapis.com/auth/gmail.readonly');
    if (hasGmailScope) {
      try {
        const gmailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/gmail-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          },
          body: JSON.stringify({ user_id })
        });

        const gmailResult = await gmailResponse.json();
        results.push({ service: 'gmail', success: gmailResponse.ok, ...gmailResult });
      } catch (error) {
        results.push({ service: 'gmail', success: false, error: error.message });
      }
    }

    // Sync Calendar if scope is available  
    const hasCalendarScope = tokens.scopes?.includes('https://www.googleapis.com/auth/calendar.readonly');
    if (hasCalendarScope) {
      try {
        const calendarResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calendar-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          },
          body: JSON.stringify({ user_id })
        });

        const calendarResult = await calendarResponse.json();
        results.push({ service: 'calendar', success: calendarResponse.ok, ...calendarResult });
      } catch (error) {
        results.push({ service: 'calendar', success: false, error: error.message });
      }
    }

    // Update user gamification based on sync results
    const successfulSyncs = results.filter(r => r.success);
    if (successfulSyncs.length > 0) {
      await supabaseClient
        .from('user_gamification')
        .upsert({
          user_id,
          last_activity_date: new Date().toISOString().split('T')[0],
          total_xp: 10, // Base XP for staying active
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    console.log(`Google sync completed for user ${user_id}:`, results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google sync completed',
        results,
        synced_services: results.filter(r => r.success).map(r => r.service)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Google sync orchestration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});