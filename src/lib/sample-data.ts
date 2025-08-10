import { supabase } from './supabase';
import { getVectorStore } from './vector-store';

// Sample organization for development
export const SAMPLE_ORG_ID = 'org_sample_123';
export const SAMPLE_USER_ID = 'user_sample_456';

// Sample professional relationships data
export const sampleRelationships = [
  {
    person: {
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'sarah.chen@stripe.com',
      title: 'VP Product',
      company: 'Stripe',
      industry: 'Fintech',
      seniority_level: 'executive',
      department: 'Product',
      linkedin_url: 'https://linkedin.com/in/sarahchen',
      location: 'San Francisco, CA',
      relationship_strength: 8,
      last_interaction_date: '2024-01-05',
      interaction_frequency: 'monthly',
      notes: 'Met at fintech conference. Interested in AI payment solutions.',
      tags: ['fintech', 'product', 'stripe', 'ai-interested'],
      mutual_connections: 3,
      influence_score: 85
    },
    relationship: {
      relationship_type: 'partner',
      relationship_status: 'active',
      priority_level: 'high',
      first_met_date: '2023-06-15',
      last_contact_date: '2024-01-05',
      next_follow_up_date: '2024-02-01',
      total_interactions: 12,
      business_value: 'high',
      deal_potential: 500000,
      collaboration_history: 'Discussed AI-powered payment fraud detection partnership',
      mutual_interests: ['artificial intelligence', 'payment innovation', 'fintech'],
      relationship_health_score: 88,
      engagement_trend: 'improving'
    },
    context: 'Strategic fintech partnership opportunity. Sarah is leading product initiatives around AI and expressed interest in our relationship intelligence platform for customer insights.'
  },
  {
    person: {
      first_name: 'David',
      last_name: 'Rodriguez',
      email: 'david.rodriguez@salesforce.com',
      title: 'CTO',
      company: 'Salesforce',
      industry: 'SaaS',
      seniority_level: 'c-level',
      department: 'Engineering',
      linkedin_url: 'https://linkedin.com/in/davidrodriguez',
      location: 'San Francisco, CA',
      relationship_strength: 6,
      last_interaction_date: '2023-05-20',
      interaction_frequency: 'quarterly',
      notes: 'Previous collaboration on enterprise AI project. Relationship has cooled.',
      tags: ['salesforce', 'cto', 'enterprise', 'ai'],
      mutual_connections: 5,
      influence_score: 95
    },
    relationship: {
      relationship_type: 'colleague',
      relationship_status: 'dormant',
      priority_level: 'high',
      first_met_date: '2022-03-10',
      last_contact_date: '2023-05-20',
      next_follow_up_date: '2024-01-15',
      total_interactions: 8,
      business_value: 'high',
      deal_potential: 2300000,
      collaboration_history: 'Led joint AI initiative that resulted in $2.3M partnership in 2022',
      mutual_interests: ['enterprise AI', 'CRM innovation', 'technical leadership'],
      relationship_health_score: 45,
      engagement_trend: 'declining'
    },
    context: 'Critical relationship at risk. David was instrumental in our largest partnership success but relationship has deteriorated due to lack of contact. Competitor relationships strengthening.'
  },
  {
    person: {
      first_name: 'Jennifer',
      last_name: 'Park',
      email: 'jennifer.park@openai.com',
      title: 'Head of Business Development',
      company: 'OpenAI',
      industry: 'AI/Technology',
      seniority_level: 'senior',
      department: 'Business Development',
      linkedin_url: 'https://linkedin.com/in/jenniferpark',
      location: 'San Francisco, CA',
      relationship_strength: 9,
      last_interaction_date: '2024-01-08',
      interaction_frequency: 'weekly',
      notes: 'Recently promoted. Excellent relationship. Exploring partnership opportunities.',
      tags: ['openai', 'ai', 'partnerships', 'recently-promoted'],
      mutual_connections: 2,
      influence_score: 78
    },
    relationship: {
      relationship_type: 'partner',
      relationship_status: 'active',
      priority_level: 'high',
      first_met_date: '2023-09-12',
      last_contact_date: '2024-01-08',
      next_follow_up_date: '2024-01-15',
      total_interactions: 15,
      business_value: 'high',
      deal_potential: 1500000,
      collaboration_history: 'Exploring AI model integration for relationship intelligence',
      mutual_interests: ['AI innovation', 'enterprise AI', 'strategic partnerships'],
      relationship_health_score: 92,
      engagement_trend: 'improving'
    },
    context: 'High-potential emerging opportunity. Jennifer was recently promoted and has decision-making authority for strategic AI partnerships. Perfect timing for deeper collaboration.'
  },
  {
    person: {
      first_name: 'Michael',
      last_name: 'Thompson',
      email: 'michael.thompson@techcrunch.com',
      title: 'CEO',
      company: 'TechCrunch',
      industry: 'Media/Technology',
      seniority_level: 'c-level',
      department: 'Executive',
      linkedin_url: 'https://linkedin.com/in/michaelthompson',
      location: 'New York, NY',
      relationship_strength: 7,
      last_interaction_date: '2024-01-03',
      interaction_frequency: 'monthly',
      notes: 'Media relationship for thought leadership. Responds well to industry insights.',
      tags: ['media', 'techcrunch', 'thought-leadership', 'ai-coverage'],
      mutual_connections: 4,
      influence_score: 70
    },
    relationship: {
      relationship_type: 'media',
      relationship_status: 'active',
      priority_level: 'medium',
      first_met_date: '2023-04-22',
      last_contact_date: '2024-01-03',
      next_follow_up_date: '2024-01-17',
      total_interactions: 6,
      business_value: 'medium',
      deal_potential: 0,
      collaboration_history: 'Featured in AI relationship management article',
      mutual_interests: ['AI innovation', 'enterprise technology', 'startup ecosystem'],
      relationship_health_score: 75,
      engagement_trend: 'stable'
    },
    context: 'Valuable media relationship for thought leadership positioning. Michael responds best to industry insight sharing and prefers communication on Tuesday-Thursday 2-4pm.'
  },
  {
    person: {
      first_name: 'Lisa',
      last_name: 'Wang',
      email: 'lisa.wang@a16z.com',
      title: 'Partner',
      company: 'Andreessen Horowitz',
      industry: 'Venture Capital',
      seniority_level: 'partner',
      department: 'Investments',
      linkedin_url: 'https://linkedin.com/in/lisawang',
      location: 'Menlo Park, CA',
      relationship_strength: 8,
      last_interaction_date: '2023-12-15',
      interaction_frequency: 'quarterly',
      notes: 'VC partner focused on enterprise AI. Connected through Alex Smith introduction.',
      tags: ['vc', 'a16z', 'enterprise-ai', 'investments'],
      mutual_connections: 1,
      influence_score: 88
    },
    relationship: {
      relationship_type: 'investor',
      relationship_status: 'active',
      priority_level: 'high',
      first_met_date: '2023-11-08',
      last_contact_date: '2023-12-15',
      next_follow_up_date: '2024-01-20',
      total_interactions: 4,
      business_value: 'high',
      deal_potential: 25000000,
      collaboration_history: 'Initial investment discussions around Series B',
      mutual_interests: ['enterprise AI applications', 'B2B SaaS', 'relationship technology'],
      relationship_health_score: 82,
      engagement_trend: 'improving'
    },
    context: 'Key investor relationship for Series B funding. Lisa focuses on enterprise AI applications and has strong portfolio alignment. Introduction path through Alex Smith.'
  }
];

// Initialize sample data for development
export async function initializeSampleData(): Promise<void> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    console.log('Initializing sample relationship data...');
    
    // Create sample organization
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: SAMPLE_ORG_ID,
        name: 'RelationshipOS Demo',
        domain: 'relationshipos.com',
        industry: 'AI/Technology',
        size_category: 'startup',
        description: 'AI-powered professional relationship management platform'
      });

    if (orgError && orgError.code !== '23505') { // Ignore duplicate key error
      console.error('Error creating organization:', orgError);
      return;
    }

    // Create sample user
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: SAMPLE_USER_ID,
        organization_id: SAMPLE_ORG_ID,
        email: 'demo@relationshipos.com',
        full_name: 'Demo User',
        role: 'admin'
      });

    if (userError && userError.code !== '23505') {
      console.error('Error creating user:', userError);
      return;
    }

    const vectorStore = getVectorStore();

    // Insert sample relationships
    for (const sample of sampleRelationships) {
      // Insert person
      const { data: person, error: personError } = await supabase
        .from('people')
        .upsert({
          organization_id: SAMPLE_ORG_ID,
          created_by: SAMPLE_USER_ID,
          ...sample.person
        })
        .select()
        .single();

      if (personError && personError.code !== '23505') {
        console.error('Error inserting person:', personError);
        continue;
      }

      if (person) {
        // Insert relationship
        const { error: relError } = await supabase
          .from('relationships')
          .upsert({
            organization_id: SAMPLE_ORG_ID,
            user_id: SAMPLE_USER_ID,
            person_id: person.id,
            ...sample.relationship
          });

        if (relError && relError.code !== '23505') {
          console.error('Error inserting relationship:', relError);
          continue;
        }

        // Store relationship context for vector search
        const contextKey = `person_${person.id}_context`;
        await vectorStore.storeRelationshipContext(
          SAMPLE_ORG_ID,
          contextKey,
          {
            person_name: `${sample.person.first_name} ${sample.person.last_name}`,
            company: sample.person.company,
            title: sample.person.title,
            relationship_type: sample.relationship.relationship_type,
            business_value: sample.relationship.business_value,
            relationship_health: sample.relationship.relationship_health_score,
            summary: sample.context,
            key_points: sample.person.tags,
            last_interaction: sample.person.last_interaction_date
          },
          `${sample.person.first_name} ${sample.person.last_name} ${sample.person.company} ${sample.person.title} ${sample.context}`
        );
      }
    }

    console.log('Sample data initialization completed successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Get relationship insights for Oracle queries
export async function getRelationshipInsights(query: string): Promise<string> {
  try {
    const vectorStore = getVectorStore();
    return await vectorStore.getRelationshipIntelligence(SAMPLE_ORG_ID, query);
  } catch (error) {
    console.error('Error getting relationship insights:', error);
    return "Unable to retrieve relationship insights at this time.";
  }
} 