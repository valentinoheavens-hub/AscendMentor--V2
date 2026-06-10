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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      behavioural_evidence: {
        Row: {
          action_taken: string
          ai_feedback: string | null
          ai_quality_score: number | null
          created_at: string
          dimension_id: string
          framework_applied: string
          id: string
          learner_id: string | null
          outcome: string | null
          situation_described: string
          user_id: string
          week_number: number
        }
        Insert: {
          action_taken: string
          ai_feedback?: string | null
          ai_quality_score?: number | null
          created_at?: string
          dimension_id: string
          framework_applied: string
          id?: string
          learner_id?: string | null
          outcome?: string | null
          situation_described: string
          user_id: string
          week_number: number
        }
        Update: {
          action_taken?: string
          ai_feedback?: string | null
          ai_quality_score?: number | null
          created_at?: string
          dimension_id?: string
          framework_applied?: string
          id?: string
          learner_id?: string | null
          outcome?: string | null
          situation_described?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "behavioural_evidence_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      clarity_assessments: {
        Row: {
          assessment_round: number
          belt_tier: string
          completed_at: string
          created_at: string
          id: string
          leadership_mastery_pct: number
          leadership_mastery_score: number
          learner_id: string | null
          overall_pct: number
          people_clarity_pct: number
          people_clarity_score: number
          raw_answers: Json
          strategic_direction_pct: number
          strategic_direction_score: number
          structural_clarity_pct: number
          structural_clarity_score: number
          systems_processes_pct: number
          systems_processes_score: number
          user_id: string
        }
        Insert: {
          assessment_round?: number
          belt_tier?: string
          completed_at?: string
          created_at?: string
          id?: string
          leadership_mastery_pct?: number
          leadership_mastery_score?: number
          learner_id?: string | null
          overall_pct?: number
          people_clarity_pct?: number
          people_clarity_score?: number
          raw_answers?: Json
          strategic_direction_pct?: number
          strategic_direction_score?: number
          structural_clarity_pct?: number
          structural_clarity_score?: number
          systems_processes_pct?: number
          systems_processes_score?: number
          user_id: string
        }
        Update: {
          assessment_round?: number
          belt_tier?: string
          completed_at?: string
          created_at?: string
          id?: string
          leadership_mastery_pct?: number
          leadership_mastery_score?: number
          learner_id?: string | null
          overall_pct?: number
          people_clarity_pct?: number
          people_clarity_score?: number
          raw_answers?: Json
          strategic_direction_pct?: number
          strategic_direction_score?: number
          structural_clarity_pct?: number
          structural_clarity_score?: number
          systems_processes_pct?: number
          systems_processes_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clarity_assessments_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_signups: {
        Row: {
          country: string | null
          created_at: string | null
          designation: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
        }
        Relationships: []
      }
      coaching_applications: {
        Row: {
          business_stage: string | null
          coaching_goal: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          designation: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          main_challenge: string | null
          phone: string | null
        }
        Insert: {
          business_stage?: string | null
          coaching_goal?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          main_challenge?: string | null
          phone?: string | null
        }
        Update: {
          business_stage?: string | null
          coaching_goal?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          main_challenge?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          bdf_phase: string | null
          dimension_focus: string | null
          ended_at: string | null
          focus: string | null
          id: string
          learner_id: string
          message_count: number
          quality_score: number | null
          session_type: string
          started_at: string | null
          summary: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          bdf_phase?: string | null
          dimension_focus?: string | null
          ended_at?: string | null
          focus?: string | null
          id?: string
          learner_id: string
          message_count?: number
          quality_score?: number | null
          session_type?: string
          started_at?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          bdf_phase?: string | null
          dimension_focus?: string | null
          ended_at?: string | null
          focus?: string | null
          id?: string
          learner_id?: string
          message_count?: number
          quality_score?: number | null
          session_type?: string
          started_at?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          country: string | null
          created_at: string | null
          designation: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      learners: {
        Row: {
          application_id: string | null
          assessment_complete: boolean
          avatar_url: string | null
          beta_tier: string | null
          business_stage: string | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string
          full_name: string | null
          id: string
          initial_challenge: string | null
          last_name: string | null
          onboarding_complete: boolean
          organisation_name: string | null
          organisation_size: string | null
          past_coaching: boolean
          past_coaching_outcome: string | null
          phone_number: string | null
          role_title: string | null
          status: string | null
          subscription_status: string
          subscription_tier: string
          success_criteria: string | null
          user_id: string | null
          years_running: string | null
        }
        Insert: {
          application_id?: string | null
          assessment_complete?: boolean
          avatar_url?: string | null
          beta_tier?: string | null
          business_stage?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name: string
          full_name?: string | null
          id?: string
          initial_challenge?: string | null
          last_name?: string | null
          onboarding_complete?: boolean
          organisation_name?: string | null
          organisation_size?: string | null
          past_coaching?: boolean
          past_coaching_outcome?: string | null
          phone_number?: string | null
          role_title?: string | null
          status?: string | null
          subscription_status?: string
          subscription_tier?: string
          success_criteria?: string | null
          user_id?: string | null
          years_running?: string | null
        }
        Update: {
          application_id?: string | null
          assessment_complete?: boolean
          avatar_url?: string | null
          beta_tier?: string | null
          business_stage?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          full_name?: string | null
          id?: string
          initial_challenge?: string | null
          last_name?: string | null
          onboarding_complete?: boolean
          organisation_name?: string | null
          organisation_size?: string | null
          past_coaching?: boolean
          past_coaching_outcome?: string | null
          phone_number?: string | null
          role_title?: string | null
          status?: string | null
          subscription_status?: string
          subscription_tier?: string
          success_criteria?: string | null
          user_id?: string | null
          years_running?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learners_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "coaching_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string | null
          id: string
          learner_id: string
          os_domain: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          learner_id: string
          os_domain?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          learner_id?: string
          os_domain?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_scores: {
        Row: {
          ai_score: number
          be_score: number
          belt_tier: string
          ca_score: number
          created_at: string
          current_streak_weeks: number
          id: string
          learner_id: string | null
          lp_score: number
          ps_score: number
          score_velocity: number
          snapshot_date: string
          total_score: number
          user_id: string
        }
        Insert: {
          ai_score?: number
          be_score?: number
          belt_tier?: string
          ca_score?: number
          created_at?: string
          current_streak_weeks?: number
          id?: string
          learner_id?: string | null
          lp_score?: number
          ps_score?: number
          score_velocity?: number
          snapshot_date?: string
          total_score?: number
          user_id: string
        }
        Update: {
          ai_score?: number
          be_score?: number
          belt_tier?: string
          ca_score?: number
          created_at?: string
          current_streak_weeks?: number
          id?: string
          learner_id?: string | null
          lp_score?: number
          ps_score?: number
          score_velocity?: number
          snapshot_date?: string
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_scores_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_applications: {
        Row: {
          country: string | null
          created_at: string | null
          designation: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin_url: string | null
          membership_type: string
          organisation: string | null
          payment_ref: string | null
          phone: string | null
          reason_for_joining: string | null
          role: string | null
          short_bio: string | null
          status: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          linkedin_url?: string | null
          membership_type: string
          organisation?: string | null
          payment_ref?: string | null
          phone?: string | null
          reason_for_joining?: string | null
          role?: string | null
          short_bio?: string | null
          status?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          designation?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin_url?: string | null
          membership_type?: string
          organisation?: string | null
          payment_ref?: string | null
          phone?: string | null
          reason_for_joining?: string | null
          role?: string | null
          short_bio?: string | null
          status?: string | null
        }
        Relationships: []
      }
      module_completions: {
        Row: {
          completed_at: string | null
          id: string
          learner_id: string
          module_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          learner_id: string
          module_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          learner_id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "path_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      path_modules: {
        Row: {
          created_at: string | null
          id: string
          path_id: string
          pillar: string | null
          sequence: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          path_id: string
          pillar?: string | null
          sequence?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          path_id?: string
          pillar?: string | null
          sequence?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_modules_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_validations: {
        Row: {
          completed_at: string | null
          created_at: string
          dimension_scores: Json
          id: string
          learner_id: string
          overall_observation: string | null
          token: string
          validator_name: string
          validator_relationship: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dimension_scores?: Json
          id?: string
          learner_id: string
          overall_observation?: string | null
          token?: string
          validator_name: string
          validator_relationship: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dimension_scores?: Json
          id?: string
          learner_id?: string
          overall_observation?: string | null
          token?: string
          validator_name?: string
          validator_relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_validations_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_snapshots: {
        Row: {
          created_at: string | null
          id: string
          learner_id: string
          note: string | null
          people_score: number | null
          structure_score: number | null
          systems_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          learner_id: string
          note?: string | null
          people_score?: number | null
          structure_score?: number | null
          systems_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          learner_id?: string
          note?: string | null
          people_score?: number | null
          structure_score?: number | null
          systems_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_snapshots_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      session_messages: {
        Row: {
          content: string
          created_at: string | null
          framework_citations: string[]
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          framework_citations?: string[]
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          framework_citations?: string[]
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_sessions: {
        Row: {
          assessment_answers: Json
          assessment_question_index: number
          clarity_scores: Json
          conversation_history: Json
          created_at: string
          current_dimension: string | null
          id: string
          last_active_at: string
          last_menu_open: boolean
          learner_id: string | null
          mastery_score: number
          session_state: string
          streak_count: number
          user_id: string | null
          wa_phone_number: string
        }
        Insert: {
          assessment_answers?: Json
          assessment_question_index?: number
          clarity_scores?: Json
          conversation_history?: Json
          created_at?: string
          current_dimension?: string | null
          id?: string
          last_active_at?: string
          last_menu_open?: boolean
          learner_id?: string | null
          mastery_score?: number
          session_state?: string
          streak_count?: number
          user_id?: string | null
          wa_phone_number: string
        }
        Update: {
          assessment_answers?: Json
          assessment_question_index?: number
          clarity_scores?: Json
          conversation_history?: Json
          created_at?: string
          current_dimension?: string | null
          id?: string
          last_active_at?: string
          last_menu_open?: boolean
          learner_id?: string | null
          mastery_score?: number
          session_state?: string
          streak_count?: number
          user_id?: string | null
          wa_phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_streaks: {
        Row: {
          activity_type: string
          completed: boolean
          created_at: string
          id: string
          learner_id: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          activity_type?: string
          completed?: boolean
          created_at?: string
          id?: string
          learner_id?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          activity_type?: string
          completed?: boolean
          created_at?: string
          id?: string
          learner_id?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_streaks_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_mastery_score: { Args: { p_user_id: string }; Returns: Json }
      get_learner_clarity_profile: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_wa_session_context: { Args: { p_phone: string }; Returns: Json }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      score_clarity_assessment: {
        Args: {
          p_leadership_mastery_score: number
          p_people_clarity_score: number
          p_strategic_direction_score: number
          p_structural_clarity_score: number
          p_systems_processes_score: number
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
