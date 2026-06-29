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
          created_at: string | null
          end_time: string
          fisio_id: string
          id: string
          notes: string | null
          patient_id: string
          recurrence: string | null
          recurrence_end: string | null
          session_type: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          end_time: string
          fisio_id: string
          id?: string
          notes?: string | null
          patient_id: string
          recurrence?: string | null
          recurrence_end?: string | null
          session_type?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          end_time?: string
          fisio_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          recurrence?: string | null
          recurrence_end?: string | null
          session_type?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
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
      categorias: {
        Row: {
          ativo: boolean
          entra_no_total: boolean
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          entra_no_total?: boolean
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          entra_no_total?: boolean
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          appointment_id: string | null
          created_at: string
          duration_minutes: number | null
          evolution: string | null
          fisio_id: string | null
          id: string
          patient_id: string
          procedures: string[] | null
          report_date: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          evolution?: string | null
          fisio_id?: string | null
          id?: string
          patient_id: string
          procedures?: string[] | null
          report_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          evolution?: string | null
          fisio_id?: string | null
          id?: string
          patient_id?: string
          procedures?: string[] | null
          report_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_patient_id_fkey"
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
      faixas_repasse: {
        Row: {
          faixa_max: number | null
          faixa_min: number
          id: string
          modo: string
          percentual: number
          profissional_id: string
        }
        Insert: {
          faixa_max?: number | null
          faixa_min?: number
          id?: string
          modo?: string
          percentual: number
          profissional_id: string
        }
        Update: {
          faixa_max?: number | null
          faixa_min?: number
          id?: string
          modo?: string
          percentual?: number
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faixas_repasse_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faixas_repasse_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      fisio_profiles: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          color: string
          created_at: string | null
          crefito: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          color?: string
          created_at?: string | null
          crefito?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          color?: string
          created_at?: string | null
          crefito?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          categoria_id: string
          competencia: string
          created_at: string
          data_lancamento: string | null
          descricao: string
          id: string
          janela: string | null
          profissional_id: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria_id: string
          competencia: string
          created_at?: string
          data_lancamento?: string | null
          descricao: string
          id?: string
          janela?: string | null
          profissional_id?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria_id?: string
          competencia?: string
          created_at?: string
          data_lancamento?: string | null
          descricao?: string
          id?: string
          janela?: string | null
          profissional_id?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_mensal"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      module_permissions: {
        Row: {
          allowed: boolean
          id: string
          module: string
          role: string
        }
        Insert: {
          allowed?: boolean
          id?: string
          module: string
          role: string
        }
        Update: {
          allowed?: boolean
          id?: string
          module?: string
          role?: string
        }
        Relationships: []
      }
      muscle_evaluations: {
        Row: {
          average: number | null
          created_at: string
          evaluation_date: string
          fisio_id: string
          id: string
          measure_1: number | null
          measure_2: number | null
          measure_3: number | null
          muscle_name: string
          notes: string | null
          patient_id: string
          side: string | null
          unit: string
        }
        Insert: {
          average?: number | null
          created_at?: string
          evaluation_date?: string
          fisio_id: string
          id?: string
          measure_1?: number | null
          measure_2?: number | null
          measure_3?: number | null
          muscle_name: string
          notes?: string | null
          patient_id: string
          side?: string | null
          unit?: string
        }
        Update: {
          average?: number | null
          created_at?: string
          evaluation_date?: string
          fisio_id?: string
          id?: string
          measure_1?: number | null
          measure_2?: number | null
          measure_3?: number | null
          muscle_name?: string
          notes?: string | null
          patient_id?: string
          side?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "muscle_evaluations_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_evaluations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          competencia: string
          created_at: string
          id: string
          profissional_id: string
          valor: number
        }
        Insert: {
          competencia: string
          created_at?: string
          id?: string
          profissional_id: string
          valor: number
        }
        Update: {
          competencia?: string
          created_at?: string
          id?: string
          profissional_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      pagamentos_fisioterapeutas: {
        Row: {
          competencia: string
          created_at: string
          data_pagamento: string | null
          id: string
          observacoes: string | null
          profissional_id: string
          status: string
          updated_at: string
          valor_pago: number
        }
        Insert: {
          competencia: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          profissional_id: string
          status?: string
          updated_at?: string
          valor_pago?: number
        }
        Update: {
          competencia?: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          profissional_id?: string
          status?: string
          updated_at?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_fisioterapeutas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_fisioterapeutas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      patient_contracts: {
        Row: {
          created_at: string
          fisio_id: string | null
          id: string
          notes: string | null
          patient_id: string
          plan_name: string
          plan_sessions: number
          plan_value: number
          sent_at: string | null
          signed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fisio_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          plan_name: string
          plan_sessions: number
          plan_value: number
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fisio_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          plan_name?: string
          plan_sessions?: number
          plan_value?: number
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_contracts_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_contracts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_fisios: {
        Row: {
          created_at: string
          fisio_id: string
          id: string
          is_primary: boolean
          patient_id: string
        }
        Insert: {
          created_at?: string
          fisio_id: string
          id?: string
          is_primary?: boolean
          patient_id: string
        }
        Update: {
          created_at?: string
          fisio_id?: string
          id?: string
          is_primary?: boolean
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_fisios_fisio_id_fkey"
            columns: ["fisio_id"]
            isOneToOne: false
            referencedRelation: "fisio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_fisios_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          active: boolean | null
          address: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          cpf: string | null
          created_at: string | null
          diagnosis: string | null
          email: string | null
          full_name: string
          gender: string | null
          health_plan: string | null
          health_plan_number: string | null
          id: string
          lgpd_consent: boolean | null
          lgpd_consent_date: string | null
          notes: string | null
          phone: string | null
          responsible_fisio: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          diagnosis?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          health_plan?: string | null
          health_plan_number?: string | null
          id?: string
          lgpd_consent?: boolean | null
          lgpd_consent_date?: string | null
          notes?: string | null
          phone?: string | null
          responsible_fisio?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          diagnosis?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          health_plan?: string | null
          health_plan_number?: string | null
          id?: string
          lgpd_consent?: boolean | null
          lgpd_consent_date?: string | null
          notes?: string | null
          phone?: string | null
          responsible_fisio?: string | null
          updated_at?: string | null
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
          created_at: string | null
          description: string | null
          due_date: string | null
          fisio_id: string
          id: string
          installment_number: number | null
          installments: number | null
          notes: string | null
          patient_id: string
          payment_date: string
          payment_method: string | null
          payment_type: string | null
          receipt_number: string | null
          session_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          fisio_id: string
          id?: string
          installment_number?: number | null
          installments?: number | null
          notes?: string | null
          patient_id: string
          payment_date: string
          payment_method?: string | null
          payment_type?: string | null
          receipt_number?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          fisio_id?: string
          id?: string
          installment_number?: number | null
          installments?: number | null
          notes?: string | null
          patient_id?: string
          payment_date?: string
          payment_method?: string | null
          payment_type?: string | null
          receipt_number?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
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
      perfis: {
        Row: {
          id: string
          nome: string
          papel: string
          user_id: string
        }
        Insert: {
          id?: string
          nome: string
          papel?: string
          user_id: string
        }
        Update: {
          id?: string
          nome?: string
          papel?: string
          user_id?: string
        }
        Relationships: []
      }
      planejamento: {
        Row: {
          categoria_id: string | null
          competencia: string
          consolidado: boolean
          consolidado_em: string | null
          created_at: string | null
          descricao: string
          id: string
          lancamento_id: string | null
          recorrente: boolean
          tipo: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          competencia: string
          consolidado?: boolean
          consolidado_em?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          lancamento_id?: string | null
          recorrente?: boolean
          tipo: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          competencia?: string
          consolidado?: boolean
          consolidado_em?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          lancamento_id?: string | null
          recorrente?: boolean
          tipo?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "planejamento_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamento_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_mensal"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "planejamento_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          percentual_rateio: number | null
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          percentual_rateio?: number | null
          tipo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          percentual_rateio?: number | null
          tipo?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          appointment_id: string | null
          check_in: string | null
          check_out: string | null
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
      vw_conciliacao_recebimentos: {
        Row: {
          competencia: string | null
          dia_10: number | null
          dia_11_31: number | null
          diferenca: number | null
          nome: string | null
          producao: number | null
          profissional_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      vw_fluxo_mensal: {
        Row: {
          abr: number | null
          ago: number | null
          categoria_id: string | null
          categoria_nome: string | null
          dez: number | null
          entra_no_total: boolean | null
          fev: number | null
          jan: number | null
          jul: number | null
          jun: number | null
          mai: number | null
          mar: number | null
          media: number | null
          nov: number | null
          out: number | null
          set: number | null
          tipo: string | null
          total: number | null
        }
        Relationships: []
      }
      vw_historico_pagamentos_fisios: {
        Row: {
          competencia: string | null
          created_at: string | null
          data_pagamento: string | null
          id: string | null
          observacoes: string | null
          profissional_nome: string | null
          status: string | null
          valor_pago: number | null
        }
        Relationships: []
      }
      vw_lucro_fisios: {
        Row: {
          competencia: string | null
          lucro: number | null
          nf_media: number | null
          nf_valor: number | null
          nome: string | null
          producao: number | null
          profissional_id: string | null
          repasse_profissional: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      vw_producao_profissionais: {
        Row: {
          competencia: string | null
          producao_total: number | null
          profissional_id: string | null
          profissional_nome: string | null
          repasse_clinica: number | null
          repasse_profissional: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "vw_rateio_socios"
            referencedColumns: ["profissional_id"]
          },
        ]
      }
      vw_rateio_socios: {
        Row: {
          competencia: string | null
          profissional_id: string | null
          profissional_nome: string | null
          valor_rateio: number | null
        }
        Relationships: []
      }
      vw_resultado_mensal: {
        Row: {
          competencia: string | null
          despesas_extras: number | null
          faturamento_total: number | null
          resultado: number | null
          total_despesas: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_role: { Args: never; Returns: string }
      fn_eh_admin: { Args: never; Returns: boolean }
      fn_media_nf_12m: {
        Args: { p_competencia: string; p_profissional_id?: string }
        Returns: number
      }
      fn_repasse_clinica: {
        Args: { p_competencia: string; p_profissional_id: string }
        Returns: Json
      }
      fn_resumo_repasses: {
        Args: { p_competencia: string }
        Returns: {
          a_pagar: number
          data_pagamento: string
          nf_valor: number
          nome: string
          observacoes: string
          producao: number
          profissional_id: string
          repasse_clinica: number
          repasse_fisio: number
          status_pgto: string
          valor_pago: number
        }[]
      }
    }
    Enums: {
      user_role: "admin" | "fisioterapeuta" | "recepcionista"
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
      user_role: ["admin", "fisioterapeuta", "recepcionista"],
    },
  },
} as const
