import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { provider_token, provider_refresh_token, user } = await req.json();

    if (!user?.id) {
      throw new Error('User ID is required');
    }

    console.log('Storing Google tokens for user:', user.id);

    // Calculate token expiry (Google tokens typically expire in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store the Google API tokens securely
    const { error: tokenError } = await supabase
      .from('user_google_tokens')
      .upsert({
        user_id: user.id,
        access_token: provider_token,
        refresh_token: provider_refresh_token,
        expires_at: expiresAt.toISOString(),
        scopes: [
          'openid',
          'email', 
          'profile',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/calendar.readonly'
        ],
        updated_at: new Date().toISOString()
      });

    if (tokenError) {
      console.error('Error storing Google tokens:', tokenError);
      throw new Error('Failed to store Google tokens');
    }

    // Update user profile with Google data if available
    if (user.user_metadata) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata.full_name || user.user_metadata.name,
          avatar_url: user.user_metadata.avatar_url,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    console.log('Successfully stored Google tokens and updated profile');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google tokens stored successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in store-google-tokens function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});