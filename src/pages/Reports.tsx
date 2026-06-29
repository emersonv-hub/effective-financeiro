import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, RefreshCw, Send } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import jsPDF from 'jspdf';
import type { Profile } from '@/types';

type ReportRow = {
  id: string;
  report_date: string;
  patient_id: string;
  fisio_id: string;
  duration_minutes: number | null;
  evolution: string | null;
  status: string;
  patient: { id: string; full_name: string } | null;
  fisio: { id: string; full_name: string } | null;
};

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  confirmado: 'default',
  cancelado: 'destructive',
  faltou: 'secondary',
};

export default function Reports() {
  const { profile } = useAuthStore();
  const isFisio = profile?.role === 'fisioterapeuta';

  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [dateTo, setDateTo]     = useState(format(endOfMonth(today),   'yyyy-MM-dd'));
  const [fisioFilter, setFisioFilter]     = useState<string>('todos');
  const [patientFilter, setPatientFilter] = useState<string>('todos');

  const [rows, setRows]           = useState<ReportRow[]>([]);
  const [fisios, setFisios]       = useState<Profile[]>([]);
  const [patients, setPatients]   = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading]     = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  // Carrega listas de filtro
  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: p }] = await Promise.all([
        supabase.from('fisio_profiles').select('id,full_name,role,color,email,active,created_at,updated_at').order('full_name'),
        supabase.from('patients').select('id,full_name').eq('active', true).order('full_name'),
      ]);
      setFisios((f ?? []) as Profile[]);
      setPatients(p ?? []);
    }
    load();
  }, []);

  async function buscar() {
    setLoading(true);
    let q = supabase
      .from('daily_reports')
      .select(`
        id, report_date, patient_id, fisio_id, duration_minutes, evolution, status,
        patient:patients(id, full_name),
        fisio:fisio_profiles(id, full_name)
      `)
      .gte('report_date', dateFrom)
      .lte('report_date', dateTo)
      .order('report_date', { ascending: false });

    if (isFisio) {
      q = q.eq('fisio_id', profile!.id);
    } else if (fisioFilter !== 'todos') {
      q = q.eq('fisio_id', fisioFilter);
    }

    if (patientFilter !== 'todos') {
      q = q.eq('patient_id', patientFilter);
    }

    const { data } = await q;
    setRows((data ?? []) as unknown as ReportRow[]);
    setLoading(false);
  }

  useEffect(() => { buscar(); }, [dateFrom, dateTo, fisioFilter, patientFilter]);

  // Resumo
  const totalAtendimentos = rows.length;
  const totalMinutos      = rows.reduce((acc, r) => acc + (r.duration_minutes ?? 0), 0);
  const pacientesUnicos   = new Set(rows.map(r => r.patient_id)).size;

  function gerarPDF(): jsPDF {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    doc.setFillColor(34, 80, 252);
    doc.rect(0, 0, 210, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('effective FisioManager — Relatório de Atendimentos', margin, 11);

    doc.setTextColor(40, 40, 40);
    y = 26;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${format(new Date(dateFrom + 'T12:00'), 'dd/MM/yyyy')} a ${format(new Date(dateTo + 'T12:00'), 'dd/MM/yyyy')}`, margin, y);
    y += 5;
    doc.text(`Total: ${totalAtendimentos} atendimentos · ${pacientesUnicos} pacientes · ${Math.floor(totalMinutos / 60)}h${totalMinutos % 60}min`, margin, y);
    y += 8;

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Data',           margin + 1,   y + 5);
    doc.text('Paciente',       margin + 25,  y + 5);
    doc.text('Fisioterapeuta', margin + 90,  y + 5);
    doc.text('Duração',        margin + 145, y + 5);
    doc.text('Status',         margin + 167, y + 5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    rows.forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(format(new Date(r.report_date + 'T12:00'), 'dd/MM/yyyy'), margin + 1, y);
      doc.text((r.patient?.full_name ?? '—').slice(0, 30), margin + 25,  y);
      doc.text((r.fisio?.full_name   ?? '—').slice(0, 25), margin + 90,  y);
      doc.text(r.duration_minutes ? `${r.duration_minutes}min` : '—',    margin + 145, y);
      doc.text(r.status,                                                   margin + 167, y);
      y += 6;
    });

    return doc;
  }

  function exportarPDF() {
    gerarPDF().save(`relatorio-${format(today, 'yyyy-MM-dd')}.pdf`);
  }

  async function compartilharWhatsApp() {
    const doc = gerarPDF();
    const nomeArquivo = `relatorio-${format(today, 'yyyy-MM-dd')}.pdf`;
    const blob = doc.output('blob');
    const file = new File([blob], nomeArquivo, { type: 'application/pdf' });

    // Mobile: Web Share API (Chrome Android, Safari iOS)
    if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Relatório Effective Fisio',
          text: resumoTexto(),
          files: [file],
        });
        return;
      } catch {
        // usuário cancelou ou erro — cai no fallback
      }
    }

    // Desktop fallback: baixa o PDF + abre WhatsApp Web com resumo
    doc.save(nomeArquivo);
    window.open(`https://wa.me/?text=${encodeURIComponent(resumoTexto())}`, '_blank');
  }

  function resumoTexto() {
    return (
      `*Relatório Effective FisioManager*\n` +
      `Período: ${format(new Date(dateFrom + 'T12:00'), 'dd/MM/yyyy')} a ${format(new Date(dateTo + 'T12:00'), 'dd/MM/yyyy')}\n` +
      `Total de atendimentos: ${totalAtendimentos}\n` +
      `Pacientes únicos: ${pacientesUnicos}\n` +
      `Horas atendidas: ${Math.floor(totalMinutos / 60)}h ${totalMinutos % 60}min`
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Relatórios de Atendimento</h1>
        <div className="flex gap-2">
          <Button onClick={exportarPDF} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
          <Button onClick={compartilharWhatsApp} size="sm" className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white">
            <Send className="h-4 w-4" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Data início</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Data fim</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {!isFisio && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fisioterapeuta</label>
              <Select value={fisioFilter} onValueChange={setFisioFilter}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {fisios.map(f => <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Paciente</label>
            <Select value={patientFilter} onValueChange={setPatientFilter}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total de atendimentos</p>
            <p className="text-3xl font-bold text-[#2250fc]">{totalAtendimentos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Pacientes únicos</p>
            <p className="text-3xl font-bold text-[#2250fc]">{pacientesUnicos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Horas atendidas</p>
            <p className="text-3xl font-bold text-[#2250fc]">
              {Math.floor(totalMinutos / 60)}h {totalMinutos % 60}min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <div ref={tableRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                {!isFisio && <TableHead>Fisioterapeuta</TableHead>}
                <TableHead>Duração</TableHead>
                <TableHead>Evolução</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isFisio ? 5 : 6} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isFisio ? 5 : 6} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum atendimento encontrado no período.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {format(new Date(r.report_date + 'T12:00'), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{r.patient?.full_name ?? '—'}</TableCell>
                    {!isFisio && <TableCell>{r.fisio?.full_name ?? '—'}</TableCell>}
                    <TableCell className="whitespace-nowrap">
                      {r.duration_minutes ? `${r.duration_minutes} min` : '—'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-xs">
                      {r.evolution ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status] ?? 'default'}>{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
