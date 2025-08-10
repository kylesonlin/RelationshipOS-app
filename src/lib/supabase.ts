import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string | null
          industry: string | null
          size_category: string | null
          description: string | null
          website_url: string | null
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          industry?: string | null
          size_category?: string | null
          description?: string | null
          website_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          industry?: string | null
          size_category?: string | null
          description?: string | null
          website_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: string | null
          avatar_url: string | null
          timezone: string | null
          preferences: Record<string, unknown>
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          full_name: string
          role?: string | null
          avatar_url?: string | null
          timezone?: string | null
          preferences?: Record<string, unknown>
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: string | null
          avatar_url?: string | null
          timezone?: string | null
          preferences?: Record<string, unknown>
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      people: {
        Row: {
          id: string
          organization_id: string
          created_by: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          title: string | null
          company: string | null
          industry: string | null
          seniority_level: string | null
          department: string | null
          linkedin_url: string | null
          twitter_url: string | null
          website_url: string | null
          location: string | null
          relationship_strength: number | null
          last_interaction_date: string | null
          interaction_frequency: string | null
          communication_preferences: Record<string, unknown>
          notes: string | null
          tags: string[] | null
          personality_profile: Record<string, unknown>
          interests: string[] | null
          mutual_connections: number | null
          influence_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          title?: string | null
          company?: string | null
          industry?: string | null
          seniority_level?: string | null
          department?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          location?: string | null
          relationship_strength?: number | null
          last_interaction_date?: string | null
          interaction_frequency?: string | null
          communication_preferences?: Record<string, unknown>
          notes?: string | null
          tags?: string[] | null
          personality_profile?: Record<string, unknown>
          interests?: string[] | null
          mutual_connections?: number | null
          influence_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          title?: string | null
          company?: string | null
          industry?: string | null
          seniority_level?: string | null
          department?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          location?: string | null
          relationship_strength?: number | null
          last_interaction_date?: string | null
          interaction_frequency?: string | null
          communication_preferences?: Record<string, unknown>
          notes?: string | null
          tags?: string[] | null
          personality_profile?: Record<string, unknown>
          interests?: string[] | null
          mutual_connections?: number | null
          influence_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          person_id: string
          relationship_type: string
          relationship_status: string | null
          priority_level: string | null
          first_met_date: string | null
          last_contact_date: string | null
          next_follow_up_date: string | null
          total_interactions: number | null
          business_value: string | null
          deal_potential: number | null
          collaboration_history: string | null
          mutual_interests: string[] | null
          relationship_health_score: number | null
          engagement_trend: string | null
          recommended_actions: string[] | null
          ai_insights: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          person_id: string
          relationship_type: string
          relationship_status?: string | null
          priority_level?: string | null
          first_met_date?: string | null
          last_contact_date?: string | null
          next_follow_up_date?: string | null
          total_interactions?: number | null
          business_value?: string | null
          deal_potential?: number | null
          collaboration_history?: string | null
          mutual_interests?: string[] | null
          relationship_health_score?: number | null
          engagement_trend?: string | null
          recommended_actions?: string[] | null
          ai_insights?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          person_id?: string
          relationship_type?: string
          relationship_status?: string | null
          priority_level?: string | null
          first_met_date?: string | null
          last_contact_date?: string | null
          next_follow_up_date?: string | null
          total_interactions?: number | null
          business_value?: string | null
          deal_potential?: number | null
          collaboration_history?: string | null
          mutual_interests?: string[] | null
          relationship_health_score?: number | null
          engagement_trend?: string | null
          recommended_actions?: string[] | null
          ai_insights?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      oracle_queries: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          query_text: string
          response_text: string | null
          query_type: string | null
          response_time_ms: number | null
          model_used: string | null
          tokens_used: number | null
          context_data: Record<string, unknown>
          user_feedback: number | null
          was_helpful: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          query_text: string
          response_text?: string | null
          query_type?: string | null
          response_time_ms?: number | null
          model_used?: string | null
          tokens_used?: number | null
          context_data?: Record<string, unknown>
          user_feedback?: number | null
          was_helpful?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          query_text?: string
          response_text?: string | null
          query_type?: string | null
          response_time_ms?: number | null
          model_used?: string | null
          tokens_used?: number | null
          context_data?: Record<string, unknown>
          user_feedback?: number | null
          was_helpful?: boolean | null
          created_at?: string
        }
      }
      intelligence_cache: {
        Row: {
          id: string
          organization_id: string
          cache_key: string
          cache_type: string
          query_embedding: number[] | null
          similarity_threshold: number | null
          cache_data: Record<string, unknown>
          expires_at: string | null
          hit_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          cache_key: string
          cache_type: string
          query_embedding?: number[] | null
          similarity_threshold?: number | null
          cache_data: Record<string, unknown>
          expires_at?: string | null
          hit_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          cache_key?: string
          cache_type?: string
          query_embedding?: number[] | null
          similarity_threshold?: number | null
          cache_data?: Record<string, unknown>
          expires_at?: string | null
          hit_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 