import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, access_token, refresh_token, expires_at, scopes } = await req.json();

    if (!user_id || !access_token) {
      throw new Error('Missing required parameters');
    }

    // Store Google tokens securely
    const { error } = await supabaseClient
      .from('user_google_tokens')
      .upsert({
        user_id,
        access_token,
        refresh_token,
        expires_at,
        scopes: scopes || ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar.readonly']
      });

    if (error) {
      throw error;
    }

    // Log successful token storage
    console.log(`Google tokens stored successfully for user: ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google tokens stored successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error storing Google tokens:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});