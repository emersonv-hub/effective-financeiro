import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield } from 'lucide-react';
import { LGPDModal } from '@/components/lgpd/LGPDModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { patientSchema, type PatientInput } from '@/lib/validations';
import type { Patient, Profile } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  patient?: Patient & { fisio_ids?: string[] };
  onSave: (data: PatientInput & { fisio_ids: string[] }) => Promise<void>;
}

export function PatientForm({ open, onClose, patient, onSave }: Props) {
  const [fisios, setFisios] = useState<Profile[]>([]);
  const [selectedFisioIds, setSelectedFisioIds] = useState<string[]>([]);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
  });

  const responsibleFisio = watch('responsible_fisio');

  useEffect(() => {
    supabase
      .from('fisio_profiles')
      .select('id,full_name')
      .eq('active', true)
      .then(({ data }) => setFisios((data ?? []) as Profile[]));
  }, []);

  useEffect(() => {
    if (open && patient) {
      setLgpdConsent(patient.lgpd_consent ?? false);
      reset({
        full_name: patient.full_name,
        cpf: patient.cpf,
        phone: patient.phone,
        email: patient.email,
        birth_date: patient.birth_date,
        address: patient.address,
        city: patient.city,
        cep: patient.cep,
        gender: patient.gender,
        diagnosis: patient.diagnosis,
        notes: patient.notes,
        health_plan: patient.health_plan,
        health_plan_number: patient.health_plan_number,
        responsible_fisio: patient.responsible_fisio,
      });
      // Carrega fisio_ids do paciente (da tabela patient_fisios)
      const ids = patient.fisio_ids ?? (patient.responsible_fisio ? [patient.responsible_fisio] : []);
      setSelectedFisioIds(ids);
    } else if (open) {
      reset({});
      setSelectedFisioIds([]);
    }
  }, [open, patient]);

  // Quando muda a seleção múltipla e o principal não está mais selecionado, limpa
  useEffect(() => {
    if (responsibleFisio && !selectedFisioIds.includes(responsibleFisio)) {
      setValue('responsible_fisio', '');
    }
  }, [selectedFisioIds]);

  async function onSubmit(data: PatientInput) {
    if (!lgpdConsent && !patient) {
      toast.error('É necessário aceitar os termos de uso dos dados (LGPD) para cadastrar o paciente.');
      return;
    }
    setSaving(true);
    await onSave({ ...data, fisio_ids: selectedFisioIds, lgpd_consent: lgpdConsent, lgpd_consent_date: lgpdConsent ? new Date().toISOString() : undefined });
    setSaving(false);
  }

  const fisioOptions = fisios.map(f => ({ label: f.full_name, value: f.id }));
  const selectedFisios = fisios.filter(f => selectedFisioIds.includes(f.id));

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome Completo *</Label>
              <Input {...register('full_name')} placeholder="Nome do paciente" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5"><Label>CPF</Label><Input {...register('cpf')} placeholder="000.000.000-00" /></div>
            <div className="space-y-1.5"><Label>Data de Nascimento</Label><Input type="date" {...register('birth_date')} /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input {...register('phone')} placeholder="(00) 00000-0000" /></div>
            <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" {...register('email')} placeholder="email@exemplo.com" /></div>
            <div className="space-y-1.5">
              <Label>Gênero</Label>
              <Select onValueChange={v => setValue('gender', v as 'M' | 'F' | 'Outro')} defaultValue={patient?.gender}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fisioterapeutas responsáveis (multi-select) */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
            <div className="space-y-1.5">
              <Label>Fisioterapeutas responsáveis</Label>
              <MultiSelect
                options={fisioOptions}
                value={selectedFisioIds}
                onChange={setSelectedFisioIds}
                placeholder="Selecione fisioterapeutas..."
              />
            </div>

            {selectedFisios.length > 0 && (
              <div className="space-y-1.5">
                <Label>Fisioterapeuta principal</Label>
                <Select
                  onValueChange={v => setValue('responsible_fisio', v)}
                  value={responsibleFisio ?? ''}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o principal" /></SelectTrigger>
                  <SelectContent>
                    {selectedFisios.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5"><Label>Endereço</Label><Input {...register('address')} placeholder="Rua, número" /></div>
            <div className="space-y-1.5"><Label>CEP</Label><Input {...register('cep')} placeholder="00000-000" /></div>
            <div className="col-span-2 space-y-1.5"><Label>Cidade</Label><Input {...register('city')} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Convênio</Label><Input {...register('health_plan')} placeholder="Nome do convênio" /></div>
            <div className="space-y-1.5"><Label>Nº Carteirinha</Label><Input {...register('health_plan_number')} /></div>
          </div>

          <div className="space-y-1.5"><Label>Diagnóstico</Label><Input {...register('diagnosis')} placeholder="Diagnóstico principal" /></div>
          <div className="space-y-1.5"><Label>Observações</Label><Textarea {...register('notes')} placeholder="Informações adicionais..." rows={2} /></div>

          {/* LGPD Consent */}
          <div className="border rounded-lg p-3 bg-blue-50/50 space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="lgpd"
                checked={lgpdConsent}
                onChange={e => setLgpdConsent(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <label htmlFor="lgpd" className="text-sm text-gray-700 leading-snug cursor-pointer">
                Autorizo o uso dos meus dados pessoais e de saúde pela Effective Fisioterapia conforme a{' '}
                <strong>Lei nº 13.709/2018 (LGPD)</strong>.
                {patient?.lgpd_consent && (
                  <span className="ml-1 text-green-600 font-medium">✓ Já autorizado</span>
                )}
              </label>
            </div>
            <button
              type="button"
              onClick={() => setLgpdModalOpen(true)}
              className="flex items-center gap-1 text-xs text-[#2250fc] hover:underline"
            >
              <Shield size={12} /> Ver termos completos de privacidade
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-[#2250fc] hover:bg-[#1a3fd4]" disabled={saving}>
              {saving && <Loader2 size={15} className="animate-spin mr-1" />}
              {patient ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <LGPDModal
      open={lgpdModalOpen}
      onClose={() => setLgpdModalOpen(false)}
      showAccept={!lgpdConsent}
      onAccept={() => { setLgpdConsent(true); setLgpdModalOpen(false); }}
    />
    </>
  );
}
