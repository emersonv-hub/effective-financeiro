import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { MuscleEvaluation, MuscleEvaluationSide } from '@/types';

const COMMON_MUSCLES = [
  'Bíceps braquial',
  'Tríceps braquial',
  'Deltóide anterior',
  'Deltóide médio',
  'Deltóide posterior',
  'Trapézio',
  'Grande dorsal',
  'Peitoral maior',
  'Quadríceps',
  'Reto femoral',
  'Vasto lateral',
  'Vasto medial',
  'Isquiotibiais',
  'Glúteo máximo',
  'Glúteo médio',
  'Sóleo',
  'Gastrocnêmio',
  'Tibial anterior',
  'Fibulares',
];

const UNITS = ['kgf', 'N', 'graus', 'cm', 'lb'];
const SIDES: { value: MuscleEvaluationSide; label: string }[] = [
  { value: 'D', label: 'Direito' },
  { value: 'E', label: 'Esquerdo' },
  { value: 'BD', label: 'Bilateral' },
];

interface Props {
  open: boolean;
  patientId: string;
  evaluationDate: string;
  onClose: () => void;
  onSaved: (evaluation: MuscleEvaluation) => void;
}

export function MuscleEvaluationForm({ open, patientId, evaluationDate, onClose, onSaved }: Props) {
  const { profile } = useAuthStore();
  const [muscleName, setMuscleName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('');
  const [side, setSide] = useState<MuscleEvaluationSide | ''>('');
  const [unit, setUnit] = useState('kgf');
  const [measures, setMeasures] = useState(['', '', '']);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const parsedMeasures = measures.map(m => (m === '' ? null : parseFloat(m.replace(',', '.'))));
  const validMeasures = parsedMeasures.filter((m): m is number => m !== null && !isNaN(m));
  const average = validMeasures.length === 3
    ? Math.round((validMeasures.reduce((a, b) => a + b, 0) / 3) * 100) / 100
    : null;

  const finalMuscle = muscleName === '__custom__' ? customMuscle.trim() : muscleName;

  async function handleSave() {
    if (!finalMuscle) { toast.error('Selecione ou informe o músculo.'); return; }
    if (validMeasures.length < 3) { toast.error('Preencha as 3 medidas.'); return; }
    if (!profile) return;

    setSaving(true);
    const payload = {
      patient_id: patientId,
      fisio_id: profile.id,
      evaluation_date: evaluationDate,
      muscle_name: finalMuscle,
      side: side || null,
      unit,
      measure_1: parsedMeasures[0],
      measure_2: parsedMeasures[1],
      measure_3: parsedMeasures[2],
      average,
      notes: notes.trim() || null,
    };

    const { data, error } = await supabase.from('muscle_evaluations').insert(payload).select('*').single();
    setSaving(false);
    if (error) { toast.error('Erro ao salvar avaliação.'); return; }
    toast.success('Avaliação salva.');
    onSaved(data as MuscleEvaluation);
    resetForm();
    onClose();
  }

  function resetForm() {
    setMuscleName('');
    setCustomMuscle('');
    setSide('');
    setUnit('kgf');
    setMeasures(['', '', '']);
    setNotes('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Avaliação Muscular</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Músculo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Músculo</label>
            <select
              value={muscleName}
              onChange={e => setMuscleName(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione...</option>
              {COMMON_MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="__custom__">Outro (digitar)</option>
            </select>
            {muscleName === '__custom__' && (
              <Input
                placeholder="Nome do músculo"
                value={customMuscle}
                onChange={e => setCustomMuscle(e.target.value)}
              />
            )}
          </div>

          {/* Lado + Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Lado</label>
              <select
                value={side}
                onChange={e => setSide(e.target.value as MuscleEvaluationSide | '')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">—</option>
                {SIDES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Unidade</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* 3 Medidas */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Medidas ({unit})</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="space-y-1">
                  <span className="text-xs text-muted-foreground">Medida {i + 1}</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={measures[i]}
                    onChange={e => setMeasures(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Média calculada */}
          <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${average !== null ? 'bg-blue-50 border border-blue-200' : 'bg-muted'}`}>
            <span className="text-sm font-medium">Média das 3 medidas</span>
            <span className={`text-lg font-bold ${average !== null ? 'text-blue-700' : 'text-muted-foreground'}`}>
              {average !== null ? `${average} ${unit}` : '—'}
            </span>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Observações (opcional)</label>
            <Textarea
              rows={2}
              placeholder="Condição do teste, dor, compensações..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={saving}>Cancelar</Button>
            <Button size="sm" className="bg-[#2250fc] hover:bg-[#1a3fd4]" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar avaliação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
