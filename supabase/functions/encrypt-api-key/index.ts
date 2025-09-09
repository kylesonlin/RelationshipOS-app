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

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, apiKey } = await req.json();

    if (action === 'encrypt') {
      // Validate API key format (should start with sk-)
      if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }

      // Use Supabase's encryption via vault
      const { data: encryptedKey, error: encryptError } = await supabase
        .rpc('vault_encrypt', {
          secret: apiKey,
          key_id: 'openai-key'
        });

      if (encryptError) {
        console.error('Encryption error:', encryptError);
        throw new Error('Failed to encrypt API key');
      }

      // Store encrypted key in user_ai_settings
      const { error: updateError } = await supabase
        .from('user_ai_settings')
        .upsert({
          user_id: user.id,
          openai_api_key_encrypted: encryptedKey,
          ai_mode: 'user',
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error('Failed to save encrypted API key');
      }

      return new Response(
        JSON.stringify({ success: true, message: 'API key encrypted and saved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'decrypt') {
      // Get encrypted key from database
      const { data: settings, error: fetchError } = await supabase
        .from('user_ai_settings')
        .select('openai_api_key_encrypted')
        .eq('user_id', user.id)
        .single();

      if (fetchError || !settings?.openai_api_key_encrypted) {
        throw new Error('No API key found');
      }

      // Decrypt using Supabase vault
      const { data: decryptedKey, error: decryptError } = await supabase
        .rpc('vault_decrypt', {
          encrypted_secret: settings.openai_api_key_encrypted
        });

      if (decryptError) {
        console.error('Decryption error:', decryptError);
        throw new Error('Failed to decrypt API key');
      }

      return new Response(
        JSON.stringify({ success: true, apiKey: decryptedKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in encrypt-api-key function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});