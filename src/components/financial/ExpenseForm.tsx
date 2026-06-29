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
import { expenseSchema, type ExpenseInput } from '@/lib/validations';
import { format } from 'date-fns';

interface Props { open: boolean; onClose: () => void; onSave: (data: ExpenseInput) => Promise<void>; }

export function ExpenseForm({ open, onClose, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expense_date: format(new Date(), 'yyyy-MM-dd'), category: 'outros' },
  });

  useEffect(() => { if (open) reset({ expense_date: format(new Date(), 'yyyy-MM-dd'), category: 'outros' }); }, [open]);
  async function onSubmit(data: ExpenseInput) { setSaving(true); await onSave(data); setSaving(false); }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrar Despesa</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Descrição *</Label>
            <Input {...register('description')} placeholder="Descrição da despesa" />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" {...register('expense_date')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select onValueChange={v => setValue('category', v as ExpenseInput['category'])} defaultValue="outros">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[['aluguel','Aluguel'],['material','Material'],['equipamento','Equipamento'],['marketing','Marketing'],['pessoal','Pessoal'],['outros','Outros']].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Observações</Label><Textarea {...register('notes')} rows={2} /></div>
          <div className="flex gap-3">
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
