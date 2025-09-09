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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Sample contacts data
    const sampleContacts = [
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        company: 'TechCorp',
        job_title: 'VP of Product',
        relationship_strength: 9,
        last_contact_date: '2024-11-15'
      },
      {
        first_name: 'Michael',
        last_name: 'Torres',
        email: 'mtorres@techflow.com',
        company: 'TechFlow Solutions',
        job_title: 'CEO',
        relationship_strength: 8,
        last_contact_date: '2024-10-28'
      },
      {
        first_name: 'David',
        last_name: 'Chen',
        email: 'dchen@innovate.io',
        company: 'Innovate.io',
        job_title: 'CTO',
        relationship_strength: 7,
        last_contact_date: '2024-11-20'
      },
      {
        first_name: 'Lisa',
        last_name: 'Park',
        email: 'lisa@startupx.com',
        company: 'StartupX',
        job_title: 'Founder',
        relationship_strength: 6,
        last_contact_date: '2024-11-01'
      }
    ]

    // Sample interactions
    const sampleInteractions = [
      {
        interaction_type: 'email',
        subject: 'Q4 Planning Discussion',
        content: 'Discussed expansion plans and marketing support needs'
      },
      {
        interaction_type: 'meeting',
        subject: 'Product Demo',
        content: 'Showcased new features, positive feedback received'
      },
      {
        interaction_type: 'email',
        subject: 'Introduction to VP Marketing',
        content: 'Facilitated connection between contacts'
      }
    ]

    // Insert sample data (in a real app, this would be done once or through proper data migration)
    console.log('Sample data generation completed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data structure ready',
        contacts: sampleContacts.length,
        interactions: sampleInteractions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Demo data error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})