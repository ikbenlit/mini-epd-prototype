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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_events: {
        Row: {
          client_id: string | null
          created_at: string
          duration_ms: number
          id: string
          kind: string
          note_id: string | null
          request: Json
          response: Json
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          duration_ms?: number
          id?: string
          kind: string
          note_id?: string | null
          request?: Json
          response?: Json
        }
        Update: {
          client_id?: string | null
          created_at?: string
          duration_ms?: number
          id?: string
          kind?: string
          note_id?: string | null
          request?: Json
          response?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_events_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "intake_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          activities: Json | null
          addresses_condition_ids: string[] | null
          author_id: string | null
          care_team_ids: string[] | null
          category_code: string | null
          category_display: string | null
          contributor_ids: string[] | null
          created_at: string | null
          created_date: string | null
          description: string | null
          encounter_id: string | null
          goals: Json | null
          id: string
          identifier: string | null
          intent: string
          note: string | null
          patient_id: string
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["careplan_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          addresses_condition_ids?: string[] | null
          author_id?: string | null
          care_team_ids?: string[] | null
          category_code?: string | null
          category_display?: string | null
          contributor_ids?: string[] | null
          created_at?: string | null
          created_date?: string | null
          description?: string | null
          encounter_id?: string | null
          goals?: Json | null
          id?: string
          identifier?: string | null
          intent?: string
          note?: string | null
          patient_id: string
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["careplan_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          addresses_condition_ids?: string[] | null
          author_id?: string | null
          care_team_ids?: string[] | null
          category_code?: string | null
          category_display?: string | null
          contributor_ids?: string[] | null
          created_at?: string | null
          created_date?: string | null
          description?: string | null
          encounter_id?: string | null
          goals?: Json | null
          id?: string
          identifier?: string | null
          intent?: string
          note?: string | null
          patient_id?: string
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["careplan_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plans_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          updated_at?: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          abatement_age: number | null
          abatement_datetime: string | null
          asserter_id: string | null
          body_site_code: string | null
          body_site_display: string | null
          category: string
          clinical_status: Database["public"]["Enums"]["condition_clinical_status"]
          code_code: string
          code_display: string
          code_system: string
          created_at: string | null
          encounter_id: string | null
          id: string
          identifier: string | null
          note: string | null
          onset_age: number | null
          onset_datetime: string | null
          patient_id: string
          recorded_date: string
          recorder_id: string | null
          severity_code: string | null
          severity_display: string | null
          updated_at: string | null
          verification_status: Database["public"]["Enums"]["condition_verification_status"]
        }
        Insert: {
          abatement_age?: number | null
          abatement_datetime?: string | null
          asserter_id?: string | null
          body_site_code?: string | null
          body_site_display?: string | null
          category?: string
          clinical_status?: Database["public"]["Enums"]["condition_clinical_status"]
          code_code: string
          code_display: string
          code_system?: string
          created_at?: string | null
          encounter_id?: string | null
          id?: string
          identifier?: string | null
          note?: string | null
          onset_age?: number | null
          onset_datetime?: string | null
          patient_id: string
          recorded_date?: string
          recorder_id?: string | null
          severity_code?: string | null
          severity_display?: string | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["condition_verification_status"]
        }
        Update: {
          abatement_age?: number | null
          abatement_datetime?: string | null
          asserter_id?: string | null
          body_site_code?: string | null
          body_site_display?: string | null
          category?: string
          clinical_status?: Database["public"]["Enums"]["condition_clinical_status"]
          code_code?: string
          code_display?: string
          code_system?: string
          created_at?: string | null
          encounter_id?: string | null
          id?: string
          identifier?: string | null
          note?: string | null
          onset_age?: number | null
          onset_datetime?: string | null
          patient_id?: string
          recorded_date?: string
          recorder_id?: string | null
          severity_code?: string | null
          severity_display?: string | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["condition_verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "conditions_asserter_id_fkey"
            columns: ["asserter_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_recorder_id_fkey"
            columns: ["recorder_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_users: {
        Row: {
          access_level: string
          created_at: string
          expires_at: string | null
          id: string
          last_login_at: string | null
          notes: string | null
          updated_at: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          access_level?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_login_at?: string | null
          notes?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_login_at?: string | null
          notes?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      encounters: {
        Row: {
          admission_source: string | null
          class_code: string
          class_display: string
          created_at: string | null
          discharge_disposition: string | null
          id: string
          identifier: string | null
          intake_note_id: string | null
          notes: string | null
          organization_id: string | null
          patient_id: string
          period_end: string | null
          period_start: string
          practitioner_id: string | null
          priority_code: string | null
          priority_display: string | null
          reason_code: string[] | null
          reason_display: string[] | null
          status: Database["public"]["Enums"]["encounter_status"]
          type_code: string
          type_display: string
          updated_at: string | null
        }
        Insert: {
          admission_source?: string | null
          class_code: string
          class_display: string
          created_at?: string | null
          discharge_disposition?: string | null
          id?: string
          identifier?: string | null
          intake_note_id?: string | null
          notes?: string | null
          organization_id?: string | null
          patient_id: string
          period_end?: string | null
          period_start: string
          practitioner_id?: string | null
          priority_code?: string | null
          priority_display?: string | null
          reason_code?: string[] | null
          reason_display?: string[] | null
          status?: Database["public"]["Enums"]["encounter_status"]
          type_code: string
          type_display: string
          updated_at?: string | null
        }
        Update: {
          admission_source?: string | null
          class_code?: string
          class_display?: string
          created_at?: string | null
          discharge_disposition?: string | null
          id?: string
          identifier?: string | null
          intake_note_id?: string | null
          notes?: string | null
          organization_id?: string | null
          patient_id?: string
          period_end?: string | null
          period_start?: string
          practitioner_id?: string | null
          priority_code?: string | null
          priority_display?: string | null
          reason_code?: string[] | null
          reason_display?: string[] | null
          status?: Database["public"]["Enums"]["encounter_status"]
          type_code?: string
          type_display?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encounters_intake_note_id_fkey"
            columns: ["intake_note_id"]
            isOneToOne: false
            referencedRelation: "intake_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_notes: {
        Row: {
          author: string | null
          client_id: string
          content_json: Json
          content_text: string | null
          created_at: string
          id: string
          tag: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          client_id: string
          content_json?: Json
          content_text?: string | null
          created_at?: string
          id?: string
          tag?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          client_id?: string
          content_json?: Json
          content_text?: string | null
          created_at?: string
          id?: string
          tag?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          body_site: string | null
          category: string
          code_code: string
          code_display: string
          code_system: string
          created_at: string | null
          effective_datetime: string
          encounter_id: string | null
          id: string
          identifier: string | null
          interpretation_code: string | null
          interpretation_display: string | null
          issued: string | null
          method_code: string | null
          method_display: string | null
          note: string | null
          patient_id: string
          performer_id: string | null
          reference_range_high: number | null
          reference_range_low: number | null
          reference_range_text: string | null
          status: Database["public"]["Enums"]["observation_status"]
          value_boolean: boolean | null
          value_codeable_concept: Json | null
          value_quantity_comparator: string | null
          value_quantity_unit: string | null
          value_quantity_value: number | null
          value_string: string | null
          value_type: string
        }
        Insert: {
          body_site?: string | null
          category: string
          code_code: string
          code_display: string
          code_system: string
          created_at?: string | null
          effective_datetime: string
          encounter_id?: string | null
          id?: string
          identifier?: string | null
          interpretation_code?: string | null
          interpretation_display?: string | null
          issued?: string | null
          method_code?: string | null
          method_display?: string | null
          note?: string | null
          patient_id: string
          performer_id?: string | null
          reference_range_high?: number | null
          reference_range_low?: number | null
          reference_range_text?: string | null
          status?: Database["public"]["Enums"]["observation_status"]
          value_boolean?: boolean | null
          value_codeable_concept?: Json | null
          value_quantity_comparator?: string | null
          value_quantity_unit?: string | null
          value_quantity_value?: number | null
          value_string?: string | null
          value_type: string
        }
        Update: {
          body_site?: string | null
          category?: string
          code_code?: string
          code_display?: string
          code_system?: string
          created_at?: string | null
          effective_datetime?: string
          encounter_id?: string | null
          id?: string
          identifier?: string | null
          interpretation_code?: string | null
          interpretation_display?: string | null
          issued?: string | null
          method_code?: string | null
          method_display?: string | null
          note?: string | null
          patient_id?: string
          performer_id?: string | null
          reference_range_high?: number | null
          reference_range_low?: number | null
          reference_range_text?: string | null
          status?: Database["public"]["Enums"]["observation_status"]
          value_boolean?: boolean | null
          value_codeable_concept?: Json | null
          value_quantity_comparator?: string | null
          value_quantity_unit?: string | null
          value_quantity_value?: number | null
          value_string?: string | null
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "observations_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean | null
          address_city: string | null
          address_country: string | null
          address_line: string[] | null
          address_postal_code: string | null
          alias: string[] | null
          created_at: string | null
          id: string
          identifier_agb: string | null
          identifier_kvk: string | null
          name: string
          telecom_email: string | null
          telecom_phone: string | null
          telecom_website: string | null
          type_code: string | null
          type_display: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address_city?: string | null
          address_country?: string | null
          address_line?: string[] | null
          address_postal_code?: string | null
          alias?: string[] | null
          created_at?: string | null
          id?: string
          identifier_agb?: string | null
          identifier_kvk?: string | null
          name: string
          telecom_email?: string | null
          telecom_phone?: string | null
          telecom_website?: string | null
          type_code?: string | null
          type_display?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address_city?: string | null
          address_country?: string | null
          address_line?: string[] | null
          address_postal_code?: string | null
          alias?: string[] | null
          created_at?: string | null
          id?: string
          identifier_agb?: string | null
          identifier_kvk?: string | null
          name?: string
          telecom_email?: string | null
          telecom_phone?: string | null
          telecom_website?: string | null
          type_code?: string | null
          type_display?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          active: boolean | null
          address_city: string | null
          address_country: string | null
          address_line: string[] | null
          address_postal_code: string | null
          birth_date: string
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          general_practitioner_agb: string | null
          general_practitioner_name: string | null
          id: string
          identifier_bsn: string | null
          identifier_client_number: string | null
          insurance_company: string | null
          insurance_number: string | null
          name_family: string
          name_given: string[]
          name_prefix: string | null
          name_use: string | null
          telecom_email: string | null
          telecom_phone: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address_city?: string | null
          address_country?: string | null
          address_line?: string[] | null
          address_postal_code?: string | null
          birth_date: string
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          general_practitioner_agb?: string | null
          general_practitioner_name?: string | null
          id?: string
          identifier_bsn?: string | null
          identifier_client_number?: string | null
          insurance_company?: string | null
          insurance_number?: string | null
          name_family: string
          name_given: string[]
          name_prefix?: string | null
          name_use?: string | null
          telecom_email?: string | null
          telecom_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address_city?: string | null
          address_country?: string | null
          address_line?: string[] | null
          address_postal_code?: string | null
          birth_date?: string
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          general_practitioner_agb?: string | null
          general_practitioner_name?: string | null
          id?: string
          identifier_bsn?: string | null
          identifier_client_number?: string | null
          insurance_company?: string | null
          insurance_number?: string | null
          name_family?: string
          name_given?: string[]
          name_prefix?: string | null
          name_use?: string | null
          telecom_email?: string | null
          telecom_phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      practitioners: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          identifier_agb: string | null
          identifier_big: string | null
          name_family: string
          name_given: string[]
          name_prefix: string | null
          name_suffix: string | null
          qualification: string[] | null
          telecom_email: string | null
          telecom_phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          identifier_agb?: string | null
          identifier_big?: string | null
          name_family: string
          name_given: string[]
          name_prefix?: string | null
          name_suffix?: string | null
          qualification?: string[] | null
          telecom_email?: string | null
          telecom_phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          identifier_agb?: string | null
          identifier_big?: string | null
          name_family?: string
          name_given?: string[]
          name_prefix?: string | null
          name_suffix?: string | null
          qualification?: string[] | null
          telecom_email?: string | null
          telecom_phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      problem_profiles: {
        Row: {
          category: string
          client_id: string
          created_at: string
          id: string
          remarks: string | null
          severity: string
          source_note_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          client_id: string
          created_at?: string
          id?: string
          remarks?: string | null
          severity: string
          source_note_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string
          id?: string
          remarks?: string | null
          severity?: string
          source_note_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_profiles_source_note_id_fkey"
            columns: ["source_note_id"]
            isOneToOne: false
            referencedRelation: "intake_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          plan: Json
          published_at: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          plan?: Json
          published_at?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          plan?: Json
          published_at?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_demo_access_level: {
        Args: { check_user_id: string }
        Returns: string
      }
      hook_check_duplicate_email: { Args: { event: Json }; Returns: Json }
      is_demo_user: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      careplan_status:
        | "draft"
        | "active"
        | "on-hold"
        | "revoked"
        | "completed"
        | "entered-in-error"
        | "unknown"
      condition_clinical_status:
        | "active"
        | "recurrence"
        | "relapse"
        | "inactive"
        | "remission"
        | "resolved"
        | "unknown"
      condition_verification_status:
        | "unconfirmed"
        | "provisional"
        | "differential"
        | "confirmed"
        | "refuted"
        | "entered-in-error"
      encounter_status:
        | "planned"
        | "in-progress"
        | "on-hold"
        | "completed"
        | "cancelled"
        | "entered-in-error"
        | "unknown"
      gender_type: "male" | "female" | "other" | "unknown"
      observation_status:
        | "registered"
        | "preliminary"
        | "final"
        | "amended"
        | "corrected"
        | "cancelled"
        | "entered-in-error"
        | "unknown"
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
      careplan_status: [
        "draft",
        "active",
        "on-hold",
        "revoked",
        "completed",
        "entered-in-error",
        "unknown",
      ],
      condition_clinical_status: [
        "active",
        "recurrence",
        "relapse",
        "inactive",
        "remission",
        "resolved",
        "unknown",
      ],
      condition_verification_status: [
        "unconfirmed",
        "provisional",
        "differential",
        "confirmed",
        "refuted",
        "entered-in-error",
      ],
      encounter_status: [
        "planned",
        "in-progress",
        "on-hold",
        "completed",
        "cancelled",
        "entered-in-error",
        "unknown",
      ],
      gender_type: ["male", "female", "other", "unknown"],
      observation_status: [
        "registered",
        "preliminary",
        "final",
        "amended",
        "corrected",
        "cancelled",
        "entered-in-error",
        "unknown",
      ],
    },
  },
} as const
