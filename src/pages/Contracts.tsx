import { useEffect, useState } from 'react';
import { Plus, Send, Download, FileText, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { gerarContratoPDF, PLANS, type ContractData } from '@/lib/contractPDF';
import type { Patient, Profile } from '@/types';

type Contract = {
  id: string;
  patient_id: string;
  fisio_id: string;
  plan_name: string;
  plan_sessions: number;
  plan_value: number;
  status: string;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
  patient: { id: string; full_name: string; phone?: string } | null;
  fisio: { id: string; full_name: string } | null;
};

const STATUS_LABEL: Record<string, string> = { pendente: 'Pendente', enviado: 'Enviado', assinado: 'Assinado', cancelado: 'Cancelado' };
const STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'destructive'> = {
  pendente: 'secondary', enviado: 'default', assinado: 'default', cancelado: 'destructive'
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  pendente: <Clock size={12} />, enviado: <Send size={12} />,
  assinado: <CheckCircle size={12} />, cancelado: <XCircle size={12} />,
};

export default function Contracts() {
  const { profile } = useAuthStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);

  // Novo contrato
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fisios, setFisios] = useState<Profile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedFisio, setSelectedFisio] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('PLANO 1');
  const [patientSearch, setPatientSearch] = useState('');
  const [creating, setCreating] = useState(false);

  async function loadContracts() {
    setLoading(true);
    let q = supabase
      .from('patient_contracts')
      .select('*, patient:patients(id,full_name,phone), fisio:fisio_profiles(id,full_name)')
      .order('created_at', { ascending: false });
    if (statusFilter !== 'todos') q = q.eq('status', statusFilter);
    const { data } = await q;
    let result = (data ?? []) as Contract[];
    if (search) result = result.filter(c => c.patient?.full_name.toLowerCase().includes(search.toLowerCase()));
    setContracts(result);
    setLoading(false);
  }

  useEffect(() => { loadContracts(); }, [search, statusFilter]);

  useEffect(() => {
    supabase.from('fisio_profiles').select('*').eq('active', true).then(({ data }) => setFisios((data ?? []) as Profile[]));
  }, []);

  useEffect(() => {
    if (patientSearch.length < 2) { setPatients([]); return; }
    supabase.from('patients').select('*').ilike('full_name', `%${patientSearch}%`).eq('active', true).limit(8)
      .then(({ data }) => setPatients((data ?? []) as Patient[]));
  }, [patientSearch]);

  async function criarContrato() {
    if (!selectedPatient || !selectedFisio || !selectedPlan) {
      toast.error('Preencha paciente, fisioterapeuta e plano.');
      return;
    }
    const plan = PLANS.find(p => p.name === selectedPlan)!;
    setCreating(true);
    try {
      const { error } = await supabase.from('patient_contracts').insert({
        patient_id: selectedPatient, fisio_id: selectedFisio,
        plan_name: plan.name, plan_sessions: plan.sessions, plan_value: plan.value,
        status: 'pendente',
      });
      if (error) throw error;
      toast.success('Contrato criado!');
      setModalOpen(false);
      setSelectedPatient(''); setSelectedFisio(''); setSelectedPlan('PLANO 1'); setPatientSearch('');
      loadContracts();
    } catch {
      toast.error('Erro ao criar contrato.');
    } finally {
      setCreating(false);
    }
  }

  async function baixarPDF(contract: Contract) {
    const patient = await supabase.from('patients').select('*').eq('id', contract.patient_id).single().then(r => r.data as Patient);
    const fisio = fisios.find(f => f.id === contract.fisio_id) ?? { id: contract.fisio_id, full_name: contract.fisio?.full_name ?? '' } as Profile;
    const plan = PLANS.find(p => p.name === contract.plan_name) ?? PLANS[0];
    const contractData: ContractData = { patient, fisio, plan };
    const doc = gerarContratoPDF(contractData);
    doc.save(`contrato-${patient.full_name.replace(/\s+/g, '-').toLowerCase()}-${contract.plan_name.toLowerCase()}.pdf`);
  }

  async function enviarWhatsApp(contract: Contract) {
    const patient = await supabase.from('patients').select('*').eq('id', contract.patient_id).single().then(r => r.data as Patient);
    const fisio = fisios.find(f => f.id === contract.fisio_id) ?? { id: contract.fisio_id, full_name: contract.fisio?.full_name ?? '' } as Profile;
    const plan = PLANS.find(p => p.name === contract.plan_name) ?? PLANS[0];
    const contractData: ContractData = { patient, fisio, plan };
    const doc = gerarContratoPDF(contractData);
    const fileName = `contrato-${patient.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    const blob = doc.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    // Mobile: Web Share API
    if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: 'Contrato de Serviço — Effective Fisio', files: [file] });
      } catch { /* cancelado */ }
    } else {
      doc.save(fileName);
      const phone = patient.phone?.replace(/\D/g, '') ?? '';
      const msg = `Olá ${patient.full_name.split(' ')[0]}, segue em anexo seu contrato de serviço — *Effective Fisioterapia* (${plan.name} — ${plan.sessions} sessões). Por favor, assine e retorne uma foto para confirmar. Qualquer dúvida, estamos à disposição! 😊`;
      const url = phone ? `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }

    // Atualiza status para enviado
    await supabase.from('patient_contracts').update({ status: 'enviado', sent_at: new Date().toISOString() }).eq('id', contract.id);
    loadContracts();
    toast.success('Contrato enviado via WhatsApp!');
  }

  async function marcarAssinado(id: string) {
    await supabase.from('patient_contracts').update({ status: 'assinado', signed_at: new Date().toISOString() }).eq('id', id);
    loadContracts();
    toast.success('Contrato marcado como assinado!');
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar paciente..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="assinado">Assinado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setModalOpen(true)} className="bg-[#2250fc] hover:bg-[#1a3fd4] shrink-0">
          <Plus size={15} className="mr-1" /> Novo Contrato
        </Button>
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : contracts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum contrato encontrado.</p>
            </div>
          ) : (
            <div className="divide-y">
              {contracts.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.patient?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.plan_name} · {c.plan_sessions} sessões · R$ {Number(c.plan_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      {c.fisio && ` · ${c.fisio.full_name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(new Date(c.created_at), 'dd/MM/yyyy')}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[c.status]} className="flex items-center gap-1 shrink-0">
                    {STATUS_ICON[c.status]} {STATUS_LABEL[c.status]}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => baixarPDF(c)} title="Baixar PDF"
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Download size={15} />
                    </button>
                    {c.status !== 'assinado' && c.status !== 'cancelado' && (
                      <button onClick={() => enviarWhatsApp(c)} title="Enviar WhatsApp"
                        className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-[#25D366] transition-colors">
                        <Send size={15} />
                      </button>
                    )}
                    {c.status === 'enviado' && (
                      <button onClick={() => marcarAssinado(c.id)} title="Marcar como assinado"
                        className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors">
                        <CheckCircle size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal novo contrato */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Contrato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Paciente</Label>
              <Input placeholder="Buscar paciente..." value={patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(''); }} />
              {patients.length > 0 && !selectedPatient && (
                <div className="border rounded-md shadow-sm max-h-36 overflow-y-auto">
                  {patients.map(p => (
                    <button key={p.id} type="button" onClick={() => { setSelectedPatient(p.id); setPatientSearch(p.full_name); setPatients([]); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted">
                      {p.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Fisioterapeuta</Label>
              <Select value={selectedFisio} onValueChange={setSelectedFisio}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{fisios.map(f => <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map(p => <SelectItem key={p.name} value={p.name}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={criarContrato} disabled={creating} className="flex-1 bg-[#2250fc] hover:bg-[#1a3fd4]">
                {creating ? 'Criando...' : 'Criar Contrato'}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
