import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, ClipboardList, DollarSign, Star, FileDown, Trash2, Plus, Activity } from 'lucide-react';
import { exportPatientPDF, exportLaudoPDF } from '@/lib/pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PatientForm } from '@/components/patients/PatientForm';
import { MuscleEvaluationForm } from '@/components/patients/MuscleEvaluationForm';
import { usePatients } from '@/hooks/usePatients';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { formatBRL, formatDate, formatPhone } from '@/lib/utils';
import { toast } from 'sonner';
import type { Patient, Session, Payment, MuscleEvaluation } from '@/types';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatient, updatePatient, deletePatient } = usePatients();
  const { profile } = useAuthStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [evaluations, setEvaluations] = useState<MuscleEvaluation[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [evalFormOpen, setEvalFormOpen] = useState(false);
  const [evalDate, setEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) load(id); }, [id]);

  async function load(patientId: string) {
    setLoading(true);
    const [p, sessRes, payRes, evalRes] = await Promise.all([
      getPatient(patientId),
      supabase.from('sessions').select('*').eq('patient_id', patientId).order('date', { ascending: false }).limit(20),
      supabase.from('payments').select('*').eq('patient_id', patientId).order('payment_date', { ascending: false }).limit(20),
      supabase.from('muscle_evaluations').select('*, fisio:fisio_profiles(id,full_name)').eq('patient_id', patientId).order('evaluation_date', { ascending: false }).order('created_at', { ascending: true }),
    ]);
    setPatient(p);
    setSessions((sessRes.data ?? []) as Session[]);
    setPayments((payRes.data ?? []) as Payment[]);
    setEvaluations((evalRes.data ?? []) as MuscleEvaluation[]);
    setLoading(false);
  }

  async function deleteEvaluation(evalId: string) {
    const { error } = await supabase.from('muscle_evaluations').delete().eq('id', evalId);
    if (error) { toast.error('Erro ao excluir avaliação.'); return; }
    setEvaluations(prev => prev.filter(e => e.id !== evalId));
    toast.success('Avaliação removida.');
  }

  const handleDelete = async () => {
    if (!patient) return;
    setDeleting(true);
    try {
      await deletePatient(patient.id);
      toast.success('Paciente excluído definitivamente.');
      navigate('/pacientes');
    } catch {
      toast.error('Erro ao excluir paciente.');
      setDeleting(false);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0);
  const presence = sessions.filter(s => s.status === 'presente').length;
  const absences = sessions.filter(s => s.status === 'faltou' || s.status === 'faltou_justificado').length;
  const presenceRate = sessions.length > 0 ? Math.round((presence / sessions.length) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Carregando...</div>;
  if (!patient) return <div className="text-center py-16 text-muted-foreground">Paciente não encontrado.</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/pacientes')}><ArrowLeft size={16} className="mr-1" />Voltar</Button>
        <h2 className="text-xl font-bold flex-1">{patient.full_name}</h2>
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>Editar</Button>
        <Button size="sm" variant="outline" onClick={() => exportPatientPDF(patient, sessions, payments)}>
          <FileDown size={14} className="mr-1" />Ficha PDF
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportLaudoPDF(patient, evaluations, profile?.full_name)}>
          <Activity size={14} className="mr-1" />Laudo PDF
        </Button>
        <Button size="sm" className="bg-[#2250fc] hover:bg-[#1a3fd4]" onClick={() => navigate('/agenda')}>
          <Calendar size={14} className="mr-1" />Agendar
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={14} className="mr-1" />Excluir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total pago', value: formatBRL(totalPaid), icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Sessões', value: sessions.length, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
          { label: 'Presença', value: `${presenceRate}%`, icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Faltas', value: absences, icon: Calendar, color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
            <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-bold">{value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal info */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {patient.birth_date && <div className="flex gap-2"><Calendar size={15} className="text-muted-foreground shrink-0 mt-0.5" /><span><b>Nascimento:</b> {formatDate(patient.birth_date)}</span></div>}
            {patient.cpf && <div className="flex gap-2"><span className="text-muted-foreground text-xs w-4">CPF</span><span>{patient.cpf}</span></div>}
            {patient.gender && <div className="flex gap-2"><span className="text-muted-foreground text-xs">Gênero:</span><span>{{M:'Masculino',F:'Feminino',Outro:'Outro'}[patient.gender]}</span></div>}
            {patient.phone && <div className="flex gap-2"><Phone size={15} className="text-muted-foreground shrink-0" /><span>{formatPhone(patient.phone)}</span></div>}
            {patient.email && <div className="flex gap-2"><Mail size={15} className="text-muted-foreground shrink-0" /><span>{patient.email}</span></div>}
            {(patient.address || patient.city) && <div className="flex gap-2"><MapPin size={15} className="text-muted-foreground shrink-0 mt-0.5" /><span>{[patient.address, patient.city].filter(Boolean).join(', ')}</span></div>}
            {patient.health_plan && <div className="flex gap-2"><span className="text-muted-foreground text-xs">Convênio:</span><span>{patient.health_plan}{patient.health_plan_number ? ` · ${patient.health_plan_number}` : ''}</span></div>}
            {patient.diagnosis && <div className="border-t pt-3"><p className="text-xs text-muted-foreground mb-1">Diagnóstico</p><p>{patient.diagnosis}</p></div>}
            {patient.notes && <div><p className="text-xs text-muted-foreground mb-1">Observações</p><p className="text-muted-foreground">{patient.notes}</p></div>}
          </CardContent>
        </Card>

        {/* Session history */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Últimas Sessões</CardTitle></CardHeader>
          <CardContent className="p-0">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-4">Nenhuma sessão registrada.</p>
            ) : (
              <div className="divide-y max-h-72 overflow-y-auto">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div><p className="font-medium">{formatDate(s.date)}</p>
                    {s.session_number && <p className="text-xs text-muted-foreground">Sessão #{s.session_number}</p>}</div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment history */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Histórico de Pagamentos</CardTitle></CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-4">Nenhum pagamento registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden sm:table-cell">Método</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Parcelas</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody className="divide-y">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3">{formatDate(p.payment_date)}</td>
                      <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell text-xs capitalize">{p.payment_method?.replace('_',' ')}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{p.installments > 1 ? `${p.installment_number}/${p.installments}x` : 'À vista'}</td>
                      <td className="px-5 py-3 text-right font-mono font-semibold">{formatBRL(Number(p.amount))}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avaliações Musculares */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} className="text-[#2250fc]" />
              Avaliações Musculares
            </CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={evalDate}
                onChange={e => setEvalDate(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" className="bg-[#2250fc] hover:bg-[#1a3fd4] h-8" onClick={() => setEvalFormOpen(true)}>
                <Plus size={13} className="mr-1" />Nova avaliação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {evaluations.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-4">Nenhuma avaliação muscular registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Músculo</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">Lado</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">Medida 1</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">Medida 2</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">Medida 3</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">Média</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {evaluations.map(ev => {
                    const sideLabel = ev.side === 'D' ? 'Dir.' : ev.side === 'E' ? 'Esq.' : ev.side === 'BD' ? 'Bil.' : '—';
                    return (
                      <tr key={ev.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(ev.evaluation_date)}</td>
                        <td className="px-5 py-3 font-medium">{ev.muscle_name}</td>
                        <td className="px-3 py-3 text-center text-xs text-muted-foreground">{sideLabel}</td>
                        <td className="px-3 py-3 text-center font-mono text-xs">{ev.measure_1 != null ? `${ev.measure_1} ${ev.unit}` : '—'}</td>
                        <td className="px-3 py-3 text-center font-mono text-xs">{ev.measure_2 != null ? `${ev.measure_2} ${ev.unit}` : '—'}</td>
                        <td className="px-3 py-3 text-center font-mono text-xs">{ev.measure_3 != null ? `${ev.measure_3} ${ev.unit}` : '—'}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                            {ev.average != null ? `${ev.average} ${ev.unit}` : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => deleteEvaluation(ev.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <MuscleEvaluationForm
        open={evalFormOpen}
        patientId={patient.id}
        evaluationDate={evalDate}
        onClose={() => setEvalFormOpen(false)}
        onSaved={ev => setEvaluations(prev => [...prev, ev])}
      />

      <PatientForm open={editOpen} onClose={() => setEditOpen(false)} patient={patient}
        onSave={async data => { await updatePatient(patient.id, data); setEditOpen(false); load(patient.id); }} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 size={18} />Excluir paciente definitivamente
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação é <strong>irreversível</strong>. Todos os dados de{' '}
            <strong>{patient.full_name}</strong> serão removidos permanentemente, incluindo sessões, pagamentos e agendamentos.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
