import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { appointmentSchema, type AppointmentInput } from '@/lib/validations';
import { useAppointments } from '@/hooks/useAppointments';
import type { Appointment, Patient, Profile } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  initialSlot?: { start: Date; end: Date } | null;
  onSave: (data: Partial<Appointment>) => Promise<void>;
}

export function AppointmentModal({ open, onClose, appointment, initialSlot, onSave }: Props) {
  const { checkConflict } = useAppointments();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fisios, setFisios] = useState<Profile[]>([]);
  const [conflict, setConflict] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: { status: 'agendado', recurrence: 'none' } as Partial<AppointmentInput>,
  });

  useEffect(() => {
    supabase.from('patients').select('id,full_name').eq('active', true).order('full_name').then(({ data }) => setPatients((data ?? []) as Patient[]));
    supabase.from('fisio_profiles').select('id,full_name,color').eq('active', true).order('full_name').then(({ data }) => setFisios((data ?? []) as Profile[]));
  }, []);

  useEffect(() => {
    if (open) {
      if (appointment) {
        reset({
          patient_id: appointment.patient_id,
          fisio_id: appointment.fisio_id,
          start_time: appointment.start_time.slice(0, 16),
          end_time: appointment.end_time.slice(0, 16),
          status: appointment.status,
          session_type: appointment.session_type ?? '',
          notes: appointment.notes ?? '',
          recurrence: appointment.recurrence,
        });
      } else if (initialSlot) {
        reset({
          start_time: format(initialSlot.start, "yyyy-MM-dd'T'HH:mm"),
          end_time: format(initialSlot.end, "yyyy-MM-dd'T'HH:mm"),
          status: 'agendado', recurrence: 'none',
        } as Partial<AppointmentInput>);
      }
    }
  }, [open, appointment, initialSlot]);

  const fisioId = watch('fisio_id');
  const startTime = watch('start_time');
  const endTime = watch('end_time');

  useEffect(() => {
    if (fisioId && startTime && endTime) {
      checkConflict(fisioId, new Date(startTime).toISOString(), new Date(endTime).toISOString(), appointment?.id)
        .then(setConflict);
    }
  }, [fisioId, startTime, endTime]);

  async function onSubmit(data: any) {
    setSaving(true);
    const fisio = fisios.find(f => f.id === data.fisio_id);
    await onSave({
      ...data,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      color: fisio?.color,
    });
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Paciente</Label>
              <Select onValueChange={v => setValue('patient_id', v)} defaultValue={appointment?.patient_id}>
                <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Fisioterapeuta</Label>
              <Select onValueChange={v => setValue('fisio_id', v)} defaultValue={appointment?.fisio_id}>
                <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
                <SelectContent>
                  {fisios.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.full_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fisio_id && <p className="text-xs text-destructive">{errors.fisio_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="datetime-local" {...register('start_time')} />
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Input type="datetime-local" {...register('end_time')} />
            </div>
          </div>

          {conflict && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3 text-sm">
              <AlertTriangle size={16} /><span>Conflito de horário detectado para este profissional.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Sessão</Label>
              <Select onValueChange={v => setValue('session_type', v)} defaultValue={appointment?.session_type}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  {['Avaliação','Tratamento','Reavaliação','Home Care','Consulta'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select onValueChange={v => setValue('status', v as AppointmentInput['status'])} defaultValue={appointment?.status ?? 'agendado'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['agendado','Agendado'],['confirmado','Confirmado'],['em_atendimento','Em Atendimento'],['concluido','Concluído'],['faltou','Faltou'],['cancelado','Cancelado']].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Recorrência</Label>
            <Select onValueChange={v => setValue('recurrence', v as AppointmentInput['recurrence'])} defaultValue="none">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem recorrência</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quinzenal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea placeholder="Observações sobre o agendamento..." {...register('notes')} rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-[#2250fc] hover:bg-[#1a3fd4]" disabled={saving || conflict}>
              {saving ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
              {appointment ? 'Salvar' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
