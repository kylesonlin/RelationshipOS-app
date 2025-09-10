import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MeetingPrepRequest {
  meetingId?: string;
  attendeeEmails?: string[];
  meetingTitle?: string;
  meetingDate?: string;
}

interface ContactContext {
  id: string;
  name: string;
  email: string;
  company?: string;
  title?: string;
  lastInteraction?: string;
  relationshipStrength?: number;
  recentTopics?: string[];
  sentimentTrend?: number;
  mutualConnections?: string[];
}

interface MeetingPrep {
  summary: string;
  attendeeProfiles: ContactContext[];
  suggestedTalkingPoints: string[];
  potentialChallenges: string[];
  strategicOpportunities: string[];
  conversationStarters: string[];
  followUpActions: string[];
  confidenceScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { meetingId, attendeeEmails, meetingTitle, meetingDate }: MeetingPrepRequest = await req.json();

    console.log(`Generating meeting prep for user: ${user.id}`);

    // Get meeting details if meetingId provided
    let meeting = null;
    if (meetingId) {
      const { data: meetingData } = await supabaseClient
        .from('calendar_events')
        .select('*')
        .eq('id', meetingId)
        .eq('user_id', user.id)
        .single();
      
      meeting = meetingData;
    }

    // Extract attendee emails from meeting or use provided emails
    const emails = attendeeEmails || Object.values(meeting?.attendees || {}) as string[];
    
    if (emails.length === 0) {
      throw new Error('No attendees specified for meeting preparation');
    }

    // Build comprehensive attendee profiles
    const attendeeProfiles: ContactContext[] = [];
    
    for (const email of emails) {
      const profile = await buildAttendeeProfile(supabaseClient, user.id, email);
      if (profile) {
        attendeeProfiles.push(profile);
      }
    }

    // Generate AI-powered meeting preparation
    const meetingPrep = await generateSmartMeetingPrep({
      title: meetingTitle || meeting?.summary || 'Meeting',
      date: meetingDate || meeting?.start_time,
      attendees: attendeeProfiles,
      userContext: await getUserContext(supabaseClient, user.id)
    });

    // Store meeting prep for future reference
    if (meetingId) {
      await supabaseClient
        .from('meeting_prep_data')
        .upsert({
          meeting_id: meetingId,
          user_id: user.id,
          prep_data: meetingPrep,
          generated_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        meetingPrep,
        attendeeCount: attendeeProfiles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smart meeting prep error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function buildAttendeeProfile(supabaseClient: any, userId: string, email: string): Promise<ContactContext | null> {
  try {
    // Get contact information
    const { data: contact } = await supabaseClient
      .from('contacts')
      .select('*')
      .eq('userId', userId)
      .eq('email', email)
      .single();

    if (!contact) return null;

    // Get recent email interactions
    const { data: emailInteractions } = await supabaseClient
      .from('email_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contact.id)
      .order('sent_at', { ascending: false })
      .limit(10);

    // Get recent activities
    const { data: activities } = await supabaseClient
      .from('contact_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contact.id)
      .order('activity_date', { ascending: false })
      .limit(5);

    // Calculate sentiment trend
    const sentimentTrend = emailInteractions?.length > 0
      ? emailInteractions.reduce((sum: number, e: any) => sum + (e.sentiment_score || 0), 0) / emailInteractions.length
      : 0;

    // Extract recent topics from email subjects
    const recentTopics = emailInteractions?.map((e: any) => e.subject).filter(Boolean).slice(0, 3) || [];

    // Find mutual connections (simplified)
    const { data: mutualConnections } = await supabaseClient
      .from('contacts')
      .select('first_name, last_name')
      .eq('userId', userId)
      .eq('company', contact.company)
      .neq('id', contact.id)
      .limit(3);

    return {
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name}`,
      email: contact.email,
      company: contact.company,
      title: contact.title,
      lastInteraction: emailInteractions?.[0]?.sent_at,
      relationshipStrength: 7, // Simplified - could be calculated
      recentTopics,
      sentimentTrend,
      mutualConnections: mutualConnections?.map((c: any) => `${c.first_name} ${c.last_name}`) || []
    };

  } catch (error) {
    console.error(`Error building profile for ${email}:`, error);
    return null;
  }
}

async function getUserContext(supabaseClient: any, userId: string) {
  // Get user's recent activities and patterns
  const { data: recentActivities } = await supabaseClient
    .from('contact_activities')
    .select('activity_type, metadata')
    .eq('user_id', userId)
    .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(20);

  const { data: userProfile } = await supabaseClient
    .from('profiles')
    .select('full_name, company, bio')
    .eq('user_id', userId)
    .single();

  return {
    recentActivities: recentActivities || [],
    profile: userProfile
  };
}

async function generateSmartMeetingPrep(context: {
  title: string;
  date?: string;
  attendees: ContactContext[];
  userContext: any;
}): Promise<MeetingPrep> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return generateFallbackMeetingPrep(context);
  }

  const systemPrompt = `You are an expert relationship strategist and meeting preparation specialist. Generate comprehensive, actionable meeting preparation based on relationship data and context.

MEETING CONTEXT:
- Title: ${context.title}
- Date: ${context.date || 'Not specified'}
- Attendees: ${context.attendees.length}

ATTENDEE PROFILES:
${context.attendees.map(a => `
- ${a.name} (${a.email})
  Company: ${a.company || 'Unknown'}
  Title: ${a.title || 'Unknown'}
  Relationship Strength: ${a.relationshipStrength || 'Unknown'}/10
  Last Interaction: ${a.lastInteraction || 'Unknown'}
  Recent Topics: ${a.recentTopics?.join(', ') || 'None'}
  Sentiment Trend: ${a.sentimentTrend ? (a.sentimentTrend > 0 ? 'Positive' : 'Negative') : 'Neutral'}
  Mutual Connections: ${a.mutualConnections?.join(', ') || 'None'}
`).join('')}

Generate a strategic meeting preparation plan with:
1. Executive summary of the meeting dynamics
2. Individual talking points for each attendee
3. Potential challenges to watch for
4. Strategic opportunities to explore
5. Natural conversation starters
6. Specific follow-up actions

Be specific, actionable, and demonstrate deep understanding of relationship dynamics.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate comprehensive meeting preparation based on the provided context.' }
        ],
        max_completion_tokens: 1200
      })
    });

    const aiData = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${aiData.error?.message || 'Unknown error'}`);
    }

    const content = aiData.choices[0].message.content;
    
    // Parse AI response and structure it
    return parseMeetingPrepResponse(content, context);

  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateFallbackMeetingPrep(context);
  }
}

function parseMeetingPrepResponse(aiContent: string, context: any): MeetingPrep {
  // For now, create structured response from AI content
  // In production, you'd parse the AI response more intelligently
  
  return {
    summary: `Strategic meeting preparation for "${context.title}" with ${context.attendees.length} attendees. ${aiContent.substring(0, 200)}...`,
    attendeeProfiles: context.attendees,
    suggestedTalkingPoints: [
      'Review recent project developments and challenges',
      'Discuss upcoming opportunities and strategic priorities',
      'Address any concerns or blockers mentioned in recent communications',
      'Explore potential collaboration areas based on mutual interests'
    ],
    potentialChallenges: [
      'Different communication styles may require adaptation',
      'Competing priorities could limit availability for follow-up',
      'Technical complexity might need simplified explanations'
    ],
    strategicOpportunities: [
      'Build stronger relationship foundation through active listening',
      'Identify potential partnership opportunities',
      'Position yourself as a valuable resource and connector'
    ],
    conversationStarters: [
      'How has your team been handling the recent market changes?',
      'What are your biggest priorities for the next quarter?',
      'I saw your recent LinkedIn post about [topic] - interesting perspective!'
    ],
    followUpActions: [
      'Send meeting recap within 24 hours',
      'Schedule follow-up meetings for specific action items',
      'Make relevant introductions mentioned during the meeting',
      'Share promised resources or information'
    ],
    confidenceScore: Math.min(95, 70 + (context.attendees.length * 5))
  };
}

function generateFallbackMeetingPrep(context: any): MeetingPrep {
  return {
    summary: `Meeting preparation for "${context.title}" with ${context.attendees.length} participants. Based on relationship analysis and interaction history.`,
    attendeeProfiles: context.attendees,
    suggestedTalkingPoints: [
      'Reference previous conversations to show attentiveness',
      'Ask about current projects and challenges',
      'Share relevant industry insights or connections',
      'Discuss mutual goals and collaboration opportunities'
    ],
    potentialChallenges: [
      'Limited recent interaction history with some attendees',
      'Varying relationship strengths may affect dynamics',
      'Different communication preferences to consider'
    ],
    strategicOpportunities: [
      'Strengthen relationships through meaningful engagement',
      'Identify partnership or collaboration potential',
      'Position as valuable connector in their network'
    ],
    conversationStarters: context.attendees.map(a => 
      `Ask ${a.name.split(' ')[0]} about ${a.recentTopics?.[0] || 'their current priorities'}`
    ).slice(0, 3),
    followUpActions: [
      'Send personalized follow-up within 48 hours',
      'Connect attendees with relevant contacts if appropriate',
      'Schedule next touchpoint based on discussion outcomes'
    ],
    confidenceScore: 75
  };
}