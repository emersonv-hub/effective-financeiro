export type UserRole = 'admin' | 'fisioterapeuta' | 'recepcionista';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  color: string;
  avatar_url?: string;
  phone?: string;
  crefito?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  cep?: string;
  gender?: 'M' | 'F' | 'Outro';
  diagnosis?: string;
  notes?: string;
  health_plan?: string;
  health_plan_number?: string;
  responsible_fisio?: string;
  responsible_fisio_profile?: Profile;
  fisio_ids?: string[];
  lgpd_consent?: boolean;
  lgpd_consent_date?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'faltou' | 'cancelado';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly';

export interface Appointment {
  id: string;
  patient_id: string;
  fisio_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  session_type?: string;
  notes?: string;
  color?: string;
  recurrence: RecurrenceType;
  recurrence_end?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  fisio?: Profile;
}

export type SessionStatus = 'presente' | 'faltou' | 'faltou_justificado' | 'cancelado';

export interface Session {
  id: string;
  appointment_id?: string;
  patient_id: string;
  fisio_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: SessionStatus;
  session_notes?: string;
  evolution?: string;
  session_number?: number;
  created_at: string;
  patient?: Patient;
  fisio?: Profile;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'convenio' | 'transferencia';
export type PaymentStatus = 'pendente' | 'pago' | 'parcial' | 'cancelado' | 'estornado';
export type PaymentType = 'avista' | 'parcelado';

export interface Payment {
  id: string;
  patient_id: string;
  fisio_id: string;
  session_id?: string;
  amount: number;
  payment_date: string;
  due_date?: string;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  installments: number;
  installment_number: number;
  status: PaymentStatus;
  description?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  fisio?: Profile;
}

export type ExpenseCategory = 'aluguel' | 'material' | 'equipamento' | 'marketing' | 'pessoal' | 'outros';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  category: ExpenseCategory;
  payment_method?: string;
  receipt_url?: string;
  notes?: string;
  registered_by?: string;
  created_at: string;
  registered_by_profile?: Profile;
}

export interface DashboardStats {
  todayAppointments: number;
  confirmedToday: number;
  pendingPayments: number;
  monthRevenue: number;
  activePatients: number;
  todayRevenue: number;
}

export type MuscleEvaluationSide = 'D' | 'E' | 'BD';

export interface MuscleEvaluation {
  id: string;
  patient_id: string;
  fisio_id: string;
  evaluation_date: string;
  muscle_name: string;
  side?: MuscleEvaluationSide;
  unit: string;
  measure_1?: number | null;
  measure_2?: number | null;
  measure_3?: number | null;
  average?: number | null;
  notes?: string;
  created_at: string;
  fisio?: Profile;
}
