import { cn, statusLabel } from '@/lib/utils';

const colorMap: Record<string, string> = {
  agendado: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmado: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  em_atendimento: 'bg-amber-100 text-amber-700 border-amber-200',
  concluido: 'bg-green-100 text-green-700 border-green-200',
  faltou: 'bg-red-100 text-red-700 border-red-200',
  faltou_justificado: 'bg-orange-100 text-orange-700 border-orange-200',
  cancelado: 'bg-gray-100 text-gray-500 border-gray-200',
  presente: 'bg-green-100 text-green-700 border-green-200',
  pendente: 'bg-amber-100 text-amber-700 border-amber-200',
  pago: 'bg-green-100 text-green-700 border-green-200',
  parcial: 'bg-orange-100 text-orange-700 border-orange-200',
  estornado: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', colorMap[status] ?? 'bg-gray-100 text-gray-600 border-gray-200', className)}>
      {statusLabel(status)}
    </span>
  );
}
