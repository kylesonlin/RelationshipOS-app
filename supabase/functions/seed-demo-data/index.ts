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
    // Use service role key to bypass RLS for seeding data
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header provided')
    
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError) throw new Error(`Authentication error: ${userError.message}`)
    const user = userData.user
    if (!user?.id) throw new Error('User not authenticated')

    console.log('Seeding demo data for user:', user.id)

    // Sample contacts data
    const sampleContacts = [
      {
        userId: user.id,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        company: 'TechCorp Inc',
        title: 'VP of Product',
        phone: '+1-555-0123',
        notes: 'Key decision maker for enterprise software. Very interested in automation solutions. Has budget for Q1 2025.',
        additional_fields: {
          linkedin: 'https://linkedin.com/in/sarah-johnson-tech',
          industry: 'Technology',
          company_size: '500-1000',
          last_meeting: '2024-11-15',
          relationship_strength: 9
        }
      },
      {
        userId: user.id,
        first_name: 'Michael',
        last_name: 'Torres',
        email: 'mtorres@techflow.com',
        company: 'TechFlow Solutions',
        title: 'CEO & Founder',
        phone: '+1-555-0124',
        notes: 'Serial entrepreneur, looking for strategic partnerships. Previously sold company to Oracle for $50M.',
        additional_fields: {
          linkedin: 'https://linkedin.com/in/michael-torres-ceo',
          industry: 'SaaS',
          company_size: '50-100',
          last_meeting: '2024-10-28',
          relationship_strength: 8
        }
      },
      {
        userId: user.id,
        first_name: 'David',
        last_name: 'Chen',
        email: 'dchen@innovate.io',
        company: 'Innovate.io',
        title: 'Chief Technology Officer',
        phone: '+1-555-0125',
        notes: 'Technical decision maker. Focused on AI/ML solutions. Currently evaluating multiple vendors.',
        additional_fields: {
          linkedin: 'https://linkedin.com/in/david-chen-cto',
          industry: 'AI/ML',
          company_size: '100-500',
          last_meeting: '2024-11-20',
          relationship_strength: 7
        }
      },
      {
        userId: user.id,
        first_name: 'Lisa',
        last_name: 'Park',
        email: 'lisa@startupx.com',
        company: 'StartupX',
        title: 'Co-Founder & COO',
        phone: '+1-555-0126',
        notes: 'Early-stage startup, recently raised Series A. Looking for cost-effective solutions to scale operations.',
        additional_fields: {
          linkedin: 'https://linkedin.com/in/lisa-park-startup',
          industry: 'FinTech',
          company_size: '10-50',
          last_meeting: '2024-11-01',
          relationship_strength: 6
        }
      },
      {
        userId: user.id,
        first_name: 'Robert',
        last_name: 'Kim',
        email: 'robert.kim@globalcorp.com',
        company: 'Global Corp',
        title: 'Director of Operations',
        phone: '+1-555-0127',
        notes: 'Large enterprise contact. Slow decision process but high deal value. Interested in enterprise-wide deployment.',
        additional_fields: {
          linkedin: 'https://linkedin.com/in/robert-kim-ops',
          industry: 'Manufacturing',
          company_size: '5000+',
          last_meeting: '2024-09-15',
          relationship_strength: 5
        }
      }
    ]

    // Insert contacts
    const { data: insertedContacts, error: contactsError } = await supabaseClient
      .from('contacts')
      .insert(sampleContacts)
      .select()

    if (contactsError) throw contactsError
    console.log('Inserted contacts:', insertedContacts?.length)

    // Create sample interactions for the contacts
    const sampleInteractions = [
      {
        contact_id: insertedContacts?.[0]?.id,
        type: 'email',
        summary: 'Q4 Planning Discussion',
        topics: ['product roadmap', 'budget planning', 'automation'],
        sentiment: 0.8,
        timestamp: new Date('2024-11-15T14:30:00Z'),
        metadata: {
          subject: 'Q4 Planning Discussion',
          direction: 'outbound',
          response_time: '2 hours'
        }
      },
      {
        contact_id: insertedContacts?.[1]?.id,
        type: 'meeting',
        summary: 'Strategic Partnership Discussion',
        topics: ['partnership', 'integration', 'revenue sharing'],
        sentiment: 0.9,
        timestamp: new Date('2024-10-28T10:00:00Z'),
        metadata: {
          duration: '60 minutes',
          meeting_type: 'video call',
          attendees: 3
        }
      },
      {
        contact_id: insertedContacts?.[2]?.id,
        type: 'demo',
        summary: 'Technical Product Demo',
        topics: ['AI features', 'API integration', 'scalability'],
        sentiment: 0.7,
        timestamp: new Date('2024-11-20T16:00:00Z'),
        metadata: {
          demo_duration: '45 minutes',
          questions_asked: 12,
          technical_depth: 'high'
        }
      },
      {
        contact_id: insertedContacts?.[3]?.id,
        type: 'call',
        summary: 'Pricing and Implementation Discussion',
        topics: ['pricing', 'timeline', 'support'],
        sentiment: 0.6,
        timestamp: new Date('2024-11-01T11:30:00Z'),
        metadata: {
          call_duration: '30 minutes',
          follow_up_required: true,
          price_sensitivity: 'high'
        }
      },
      {
        contact_id: insertedContacts?.[4]?.id,
        type: 'email',
        summary: 'Enterprise Requirements Gathering',
        topics: ['security', 'compliance', 'enterprise features'],
        sentiment: 0.5,
        timestamp: new Date('2024-09-15T09:00:00Z'),
        metadata: {
          thread_length: 8,
          stakeholders_involved: ['IT', 'Legal', 'Procurement'],
          decision_timeline: 'Q1 2025'
        }
      }
    ]

    // Insert interactions
    const { data: insertedInteractions, error: interactionsError } = await supabaseClient
      .from('interactions')
      .insert(sampleInteractions)
      .select()

    if (interactionsError) throw interactionsError
    console.log('Inserted interactions:', insertedInteractions?.length)

    // Initialize user gamification data if it doesn't exist
    const { data: existingGamification } = await supabaseClient
      .from('user_gamification')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existingGamification) {
      const { error: gamificationError } = await supabaseClient
        .from('user_gamification')
        .insert({
          user_id: user.id,
          total_xp: 150,
          current_level: 2,
          relationship_health_score: 75,
          current_streak: 5,
          longest_streak: 12,
          last_activity_date: new Date().toISOString().split('T')[0],
          weekly_goal_progress: 3,
          weekly_goal_target: 5,
          total_contacts: 5,
          total_meetings: 8,
          total_opportunities: 3
        })

      if (gamificationError) throw gamificationError
      console.log('Initialized gamification data')
    }

    // Add some sample tasks
    const sampleTasks = [
      {
        userId: user.id,
        title: 'Follow up with Sarah on Q4 roadmap',
        description: 'Send detailed product roadmap and pricing for enterprise features',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        contact_id: insertedContacts?.[0]?.id
      },
      {
        userId: user.id,
        title: 'Prepare partnership proposal for Michael',
        description: 'Create comprehensive partnership proposal with revenue sharing model',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        contact_id: insertedContacts?.[1]?.id
      },
      {
        userId: user.id,
        title: 'Send technical documentation to David',
        description: 'Compile API docs and integration guides for technical evaluation',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        contact_id: insertedContacts?.[2]?.id
      }
    ]

    const { data: insertedTasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .insert(sampleTasks)
      .select()

    if (tasksError) throw tasksError
    console.log('Inserted tasks:', insertedTasks?.length)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data successfully seeded!',
        data: {
          contacts: insertedContacts?.length || 0,
          interactions: insertedInteractions?.length || 0,
          tasks: insertedTasks?.length || 0,
          gamification: !existingGamification ? 'initialized' : 'existing'
        }
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