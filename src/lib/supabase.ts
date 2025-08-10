import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          plan_type: 'personal' | 'business' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          plan_type?: 'personal' | 'business' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          plan_type?: 'personal' | 'business' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      people: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string | null
          company: string | null
          title: string | null
          linkedin_url: string | null
          relationship_strength: number
          last_contact_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email?: string | null
          company?: string | null
          title?: string | null
          linkedin_url?: string | null
          relationship_strength?: number
          last_contact_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string | null
          company?: string | null
          title?: string | null
          linkedin_url?: string | null
          relationship_strength?: number
          last_contact_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          user_id: string
          person_id: string
          relationship_type: 'colleague' | 'client' | 'partner' | 'mentor' | 'friend' | 'other'
          interaction_frequency: number
          communication_channels: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_id: string
          relationship_type?: 'colleague' | 'client' | 'partner' | 'mentor' | 'friend' | 'other'
          interaction_frequency?: number
          communication_channels?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_id?: string
          relationship_type?: 'colleague' | 'client' | 'partner' | 'mentor' | 'friend' | 'other'
          interaction_frequency?: number
          communication_channels?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      oracle_queries: {
        Row: {
          id: string
          user_id: string
          query: string
          response: string
          response_time_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          response: string
          response_time_ms: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          response?: string
          response_time_ms?: number
          created_at?: string
        }
      }
      intelligence_cache: {
        Row: {
          id: string
          user_id: string
          cache_key: string
          cache_data: Record<string, unknown>
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cache_key: string
          cache_data: Record<string, unknown>
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cache_key?: string
          cache_data?: Record<string, unknown>
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
} 