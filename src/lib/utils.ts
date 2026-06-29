import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: ptBR });
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `REC-${y}${m}-${rand}`;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    agendado: 'Agendado', confirmado: 'Confirmado', em_atendimento: 'Em Atendimento',
    concluido: 'Concluído', faltou: 'Faltou', cancelado: 'Cancelado',
    presente: 'Presente', faltou_justificado: 'Faltou (Just.)',
    pendente: 'Pendente', pago: 'Pago', parcial: 'Parcial', estornado: 'Estornado',
    dinheiro: 'Dinheiro', pix: 'PIX', cartao_credito: 'Cartão Crédito',
    cartao_debito: 'Cartão Débito', convenio: 'Convênio', transferencia: 'Transferência',
    avista: 'À Vista', parcelado: 'Parcelado',
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    agendado: 'badge-agendado', confirmado: 'badge-confirmado',
    em_atendimento: 'badge-em_atendimento', concluido: 'badge-concluido',
    faltou: 'badge-faltou', cancelado: 'badge-cancelado',
    pendente: 'badge-pendente', pago: 'badge-pago', parcial: 'badge-parcial',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function installmentDates(startDate: string, count: number): string[] {
  const dates: string[] = [];
  const base = parseISO(startDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    dates.push(format(d, 'yyyy-MM-dd'));
  }
  return dates;
}
