import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { paymentSchema, type PaymentInput } from '@/lib/validations';
import type { Patient, Profile } from '@/types';
import { format } from 'date-fns';

interface Props { open: boolean; onClose: () => void; onSave: (data: PaymentInput) => Promise<void>; }

export function PaymentForm({ open, onClose, onSave }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fisios, setFisios] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_date: format(new Date(), 'yyyy-MM-dd'), status: 'pago', payment_type: 'avista', installments: 1 },
  });
  const paymentType = watch('payment_type');

  useEffect(() => {
    supabase.from('patients').select('id,full_name').eq('active', true).order('full_name').then(({ data }) => setPatients((data ?? []) as Patient[]));
    supabase.from('fisio_profiles').select('id,full_name').eq('active', true).order('full_name').then(({ data }) => setFisios((data ?? []) as Profile[]));
  }, []);

  useEffect(() => { if (open) reset({ payment_date: format(new Date(), 'yyyy-MM-dd'), status: 'pago', payment_type: 'avista', installments: 1 }); }, [open]);

  async function onSubmit(data: PaymentInput) { setSaving(true); await onSave(data); setSaving(false); }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <Select onValueChange={v => setValue('patient_id', v)}><SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
            </Select>
            {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Fisioterapeuta *</Label>
            <Select onValueChange={v => setValue('fisio_id', v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{fisios.map(f => <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" placeholder="0,00" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" {...register('payment_date')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Forma de Pagamento</Label>
              <Select onValueChange={v => setValue('payment_method', v as PaymentInput['payment_method'])} defaultValue="pix">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['pix','PIX'],['dinheiro','Dinheiro'],['cartao_credito','Crédito'],['cartao_debito','Débito'],['convenio','Convênio'],['transferencia','Transferência']].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select onValueChange={v => setValue('payment_type', v as 'avista'|'parcelado')} defaultValue="avista">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="avista">À Vista</SelectItem><SelectItem value="parcelado">Parcelado</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          {paymentType === 'parcelado' && (
            <div className="space-y-1.5">
              <Label>Número de Parcelas</Label>
              <Select onValueChange={v => setValue('installments', Number(v))} defaultValue="2">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[2,3,4,5,6,7,8,9,10,11,12].map(n => <SelectItem key={n} value={String(n)}>{n}x</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select onValueChange={v => setValue('status', v as PaymentInput['status'])} defaultValue="pago">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[['pago','Pago'],['pendente','Pendente'],['parcial','Parcial']].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5"><Label>Descrição / Observações</Label><Textarea {...register('notes')} placeholder="Observações..." rows={2} /></div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-[#2250fc] hover:bg-[#1a3fd4]" disabled={saving}>
              {saving && <Loader2 size={15} className="animate-spin mr-1" />}Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
