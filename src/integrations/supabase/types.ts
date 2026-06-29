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
      appointments: {
        Row: {
          color: string | null
          created_at: string
          end_time: string
          fisio_id: string
          google_calendar_id: string | null
          google_event_id: string | null
          google_synced_at: string | null
          id: string
          notes: string | null
          patient_id: string
          recurrence: string
          recurrence_end: string | null
          session_type: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          end_time: string
          fisio_id: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          google_synced_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          recurrence?: string
          recurrence_end?: string | null
          session_type?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          end_time?: string
          fisio_id?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          google_synced_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          recurrence?: string
          recurrence_end?: string | null
          session_type?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          registered_by: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          expense_date: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          registered_by?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          registered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fisio_profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          color: string
          created_at: string
          crefito: string | null
          email: string
          full_name: string
          google_calendar_id: string | null
          id: string
          must_change_password: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          color?: string
          created_at?: string
          crefito?: string | null
          email: string
          full_name: string
          google_calendar_id?: string | null
          id: string
          must_change_password?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          color?: string
          created_at?: string
          crefito?: string | null
          email?: string
          full_name?: string
          google_calendar_id?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      muscle_evaluations: {
        Row: {
          id: string
          patient_id: string
          fisio_id: string
          evaluation_date: string
          muscle_name: string
          side: string | null
          unit: string
          measure_1: number | null
          measure_2: number | null
          measure_3: number | null
          average: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          fisio_id: string
          evaluation_date?: string
          muscle_name: string
          side?: string | null
          unit?: string
          measure_1?: number | null
          measure_2?: number | null
          measure_3?: number | null
          average?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          fisio_id?: string
          evaluation_date?: string
          muscle_name?: string
          side?: string | null
          unit?: string
          measure_1?: number | null
          measure_2?: number | null
          measure_3?: number | null
          average?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          id: string
          report_date: string
          patient_id: string
          fisio_id: string | null
          appointment_id: string | null
          evolution: string | null
          procedures: string[] | null
          duration_minutes: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_date: string
          patient_id: string
          fisio_id?: string | null
          appointment_id?: string | null
          evolution?: string | null
          procedures?: string[] | null
          duration_minutes?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_date?: string
          patient_id?: string
          fisio_id?: string | null
          appointment_id?: string | null
          evolution?: string | null
          procedures?: string[] | null
          duration_minutes?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          id: string
          module: string
          role: string
          allowed: boolean
        }
        Insert: {
          id?: string
          module: string
          role: string
          allowed: boolean
        }
        Update: {
          id?: string
          module?: string
          role?: string
          allowed?: boolean
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          active: boolean
          body: string
          created_at: string
          created_by: string | null
          doc_type: string
          id: string
          pdf_path: string | null
          title: string
          version: number
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          created_by?: string | null
          doc_type: string
          id?: string
          pdf_path?: string | null
          title: string
          version: number
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string | null
          doc_type?: string
          id?: string
          pdf_path?: string | null
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          patient_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          patient_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          patient_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_invites_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_signatures: {
        Row: {
          accepted_at: string
          doc_type: string
          document_id: string
          id: string
          ip: string | null
          patient_id: string
          signature_path: string | null
          typed_name: string | null
          user_agent: string | null
        }
        Insert: {
          accepted_at?: string
          doc_type: string
          document_id: string
          id?: string
          ip?: string | null
          patient_id: string
          signature_path?: string | null
          typed_name?: string | null
          user_agent?: string | null
        }
        Update: {
          accepted_at?: string
          doc_type?: string
          document_id?: string
          id?: string
          ip?: string | null
          patient_id?: string
          signature_path?: string | null
          typed_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_signatures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_users: {
        Row: {
          created_at: string
          id: string
          onboarded_at: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          id: string
          onboarded_at?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarded_at?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_users_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          active: boolean
          address: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          cpf: string | null
          created_at: string
          diagnosis: string | null
          email: string | null
          full_name: string
          gender: string | null
          health_plan: string | null
          health_plan_number: string | null
          id: string
          notes: string | null
          phone: string | null
          responsible_fisio: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          diagnosis?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          health_plan?: string | null
          health_plan_number?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          responsible_fisio?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          diagnosis?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          health_plan?: string | null
          health_plan_number?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          responsible_fisio?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_responsible_fisio_fkey"
            columns: ["responsible_fisio"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          fisio_id: string
          id: string
          installment_number: number
          installments: number
          notes: string | null
          patient_id: string
          payment_date: string
          payment_method: string | null
          payment_type: string
          receipt_number: string | null
          session_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          fisio_id: string
          id?: string
          installment_number?: number
          installments?: number
          notes?: string | null
          patient_id: string
          payment_date: string
          payment_method?: string | null
          payment_type?: string
          receipt_number?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          fisio_id?: string
          id?: string
          installment_number?: number
          installments?: number
          notes?: string | null
          patient_id?: string
          payment_date?: string
          payment_method?: string | null
          payment_type?: string
          receipt_number?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          appointment_id: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          evolution: string | null
          fisio_id: string
          id: string
          patient_id: string
          session_notes: string | null
          session_number: number | null
          status: string | null
        }
        Insert: {
          appointment_id?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          evolution?: string | null
          fisio_id: string
          id?: string
          patient_id: string
          session_notes?: string | null
          session_number?: number | null
          status?: string | null
        }
        Update: {
          appointment_id?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          evolution?: string | null
          fisio_id?: string
          id?: string
          patient_id?: string
          session_notes?: string | null
          session_number?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_patient: { Args: { _patient_id: string }; Returns: boolean }
      can_write_patient_files: {
        Args: { _patient_id: string }
        Returns: boolean
      }
      current_patient_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
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
