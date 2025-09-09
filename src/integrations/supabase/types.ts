export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          badge_icon: string
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          tier: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_color: string
          badge_icon: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          tier?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_color?: string
          badge_icon?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requirement_type?: string
          requirement_value?: number
          tier?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          ai_mode: string
          cost_usd: number | null
          created_at: string
          id: string
          model_used: string
          request_type: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          ai_mode: string
          cost_usd?: number | null
          created_at?: string
          id?: string
          model_used: string
          request_type: string
          tokens_used: number
          user_id: string
        }
        Update: {
          ai_mode?: string
          cost_usd?: number | null
          created_at?: string
          id?: string
          model_used?: string
          request_type?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          properties: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          created_at: string
          data: Json | null
          event_type: string
          id: string
          stripe_event_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_type: string
          id?: string
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_type?: string
          id?: string
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          badge_reward: string | null
          challenge_type: string
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          target_value: number
          title: string
          xp_reward: number | null
        }
        Insert: {
          badge_reward?: string | null
          challenge_type: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          target_value: number
          title: string
          xp_reward?: number | null
        }
        Update: {
          badge_reward?: string | null
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value?: number
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          additional_fields: Json | null
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          title: string | null
          updated_at: string
          userId: string | null
        }
        Insert: {
          additional_fields?: Json | null
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          userId?: string | null
        }
        Update: {
          additional_fields?: Json | null
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          userId?: string | null
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          activity_date: string
          calls_made: number | null
          contacts_added: number | null
          created_at: string
          emails_sent: number | null
          follow_ups_completed: number | null
          id: string
          meetings_completed: number | null
          notes_added: number | null
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          activity_date: string
          calls_made?: number | null
          contacts_added?: number | null
          created_at?: string
          emails_sent?: number | null
          follow_ups_completed?: number | null
          id?: string
          meetings_completed?: number | null
          notes_added?: number | null
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          activity_date?: string
          calls_made?: number | null
          contacts_added?: number | null
          created_at?: string
          emails_sent?: number | null
          follow_ups_completed?: number | null
          id?: string
          meetings_completed?: number | null
          notes_added?: number | null
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          integration_id: string
          records_processed: number | null
          status: string
          sync_duration_ms: number | null
          sync_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id: string
          records_processed?: number | null
          status: string
          sync_duration_ms?: number | null
          sync_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id?: string
          records_processed?: number | null
          status?: string
          sync_duration_ms?: number | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          sentiment: number | null
          summary: string | null
          timestamp: string
          topics: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sentiment?: number | null
          summary?: string | null
          timestamp: string
          topics?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sentiment?: number | null
          summary?: string | null
          timestamp?: string
          topics?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_tracking: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: unknown
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_trial: boolean | null
          plan_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string | null
          trial_end: string | null
          trial_used: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_trial?: boolean | null
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_used?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_trial?: boolean | null
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_used?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          limits: Json
          name: string
          plan_id: string
          price_monthly: number
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name: string
          plan_id: string
          price_monthly: number
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name?: string
          plan_id?: string
          price_monthly?: number
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
          userId: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          priority: string
          project_id?: string | null
          status: string
          title: string
          updated_at?: string
          userId?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_leaderboard: {
        Row: {
          created_at: string
          id: string
          month_start: string | null
          monthly_xp: number | null
          rank_position: number | null
          team_name: string | null
          total_xp: number | null
          updated_at: string
          user_id: string
          week_start: string | null
          weekly_xp: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          month_start?: string | null
          monthly_xp?: number | null
          rank_position?: number | null
          team_name?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          week_start?: string | null
          weekly_xp?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          month_start?: string | null
          monthly_xp?: number | null
          rank_position?: number | null
          team_name?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          week_start?: string | null
          weekly_xp?: number | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          resource_type: string
          usage_count: number
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_type: string
          usage_count?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_type?: string
          usage_count?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_settings: {
        Row: {
          ai_mode: string
          created_at: string
          id: string
          monthly_platform_limit: number | null
          monthly_platform_usage: number | null
          openai_api_key_encrypted: string | null
          preferences: Json | null
          updated_at: string
          usage_reset_date: string | null
          user_id: string
        }
        Insert: {
          ai_mode?: string
          created_at?: string
          id?: string
          monthly_platform_limit?: number | null
          monthly_platform_usage?: number | null
          openai_api_key_encrypted?: string | null
          preferences?: Json | null
          updated_at?: string
          usage_reset_date?: string | null
          user_id: string
        }
        Update: {
          ai_mode?: string
          created_at?: string
          id?: string
          monthly_platform_limit?: number | null
          monthly_platform_usage?: number | null
          openai_api_key_encrypted?: string | null
          preferences?: Json | null
          updated_at?: string
          usage_reset_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_progress: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string
          current_level: number | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          relationship_health_score: number | null
          total_contacts: number | null
          total_meetings: number | null
          total_opportunities: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
          weekly_goal_progress: number | null
          weekly_goal_target: number | null
        }
        Insert: {
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          relationship_health_score?: number | null
          total_contacts?: number | null
          total_meetings?: number | null
          total_opportunities?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          weekly_goal_progress?: number | null
          weekly_goal_target?: number | null
        }
        Update: {
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          relationship_health_score?: number | null
          total_contacts?: number | null
          total_meetings?: number | null
          total_opportunities?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          weekly_goal_progress?: number | null
          weekly_goal_target?: number | null
        }
        Relationships: []
      }
      user_google_tokens: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          scopes: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          api_key_encrypted: string | null
          config: Json | null
          created_at: string
          display_name: string
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          updated_at: string
          usage_stats: Json | null
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          display_name: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string
          usage_stats?: Json | null
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string
          usage_stats?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_two_factor: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_month_usage: {
        Args: { _user_id?: string }
        Returns: {
          month_start: string
          resource_type: string
          total_usage: number
          user_id: string
        }[]
      }
      get_security_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          created_at: string
          ip_address: unknown
          metadata: Json
          table_name: string
          user_id: string
          user_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
