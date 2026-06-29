import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export const patientSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  cep: z.string().optional(),
  gender: z.enum(['M', 'F', 'Outro']).optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  health_plan: z.string().optional(),
  health_plan_number: z.string().optional(),
  responsible_fisio: z.string().uuid('Selecione um fisioterapeuta').optional().or(z.literal('')),
  lgpd_consent: z.boolean().optional(),
  lgpd_consent_date: z.string().optional(),
});

export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Selecione um paciente'),
  fisio_id: z.string().uuid('Selecione um fisioterapeuta'),
  start_time: z.string().min(1, 'Data/hora de início obrigatória'),
  end_time: z.string().min(1, 'Data/hora de fim obrigatória'),
  status: z.enum(['agendado','confirmado','em_atendimento','concluido','faltou','cancelado']),
  session_type: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.enum(['none','daily','weekly','biweekly']).default('none'),
  recurrence_end: z.string().optional(),
});

export const paymentSchema = z.object({
  patient_id: z.string().uuid('Selecione um paciente'),
  fisio_id: z.string().uuid('Selecione um fisioterapeuta'),
  session_id: z.string().uuid().optional().or(z.literal('')),
  amount: z.number().positive('Valor deve ser positivo'),
  payment_date: z.string().min(1, 'Data de pagamento obrigatória'),
  due_date: z.string().optional(),
  payment_method: z.enum(['dinheiro','pix','cartao_credito','cartao_debito','convenio','transferencia']),
  payment_type: z.enum(['avista','parcelado']),
  installments: z.number().int().min(1).max(12),
  status: z.enum(['pendente','pago','parcial','cancelado','estornado']),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  expense_date: z.string().min(1, 'Data obrigatória'),
  category: z.enum(['aluguel','material','equipamento','marketing','pessoal','outros']),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
