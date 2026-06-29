import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { supabase } from '@/lib/supabase';
import { confirmarAgendamento } from '@/lib/confirmarAgendamento';
import { formatTime } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function Attendance() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { loadDay(); }, [date]);

  async function loadDay() {
    const { data } = await supabase
      .from('appointments')
      .select('*, patient:patients(id,full_name,phone), fisio:fisio_profiles(id,full_name,color)')
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`)
      .order('start_time');
    setAppointments((data ?? []) as Appointment[]);
  }

  async function setStatus(appt: Appointment, status: Appointment['status']) {
    setSaving(appt.id);
    await supabase.from('appointments').update({ status }).eq('id', appt.id);
    if (status === 'em_atendimento') {
      await supabase.from('sessions').upsert({ appointment_id: appt.id, patient_id: appt.patient_id, fisio_id: appt.fisio_id, date, check_in: new Date().toISOString(), status: 'presente' });
    } else if (status === 'concluido') {
      const evolution = evolutions[appt.id] ?? '';
      await supabase.from('sessions').update({ check_out: new Date().toISOString(), evolution, status: 'presente' }).eq('appointment_id', appt.id);
      await confirmarAgendamento(appt.id, evolution || undefined);
    } else if (status === 'faltou') {
      await supabase.from('sessions').upsert({ appointment_id: appt.id, patient_id: appt.patient_id, fisio_id: appt.fisio_id, date, status: 'faltou' });
    }
    setSaving(null);
    loadDay();
  }

  const stats = { total: appointments.length, concluido: appointments.filter(a => a.status === 'concluido').length, faltou: appointments.filter(a => a.status === 'faltou').length, pendente: appointments.filter(a => ['agendado','confirmado'].includes(a.status)).length };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <p className="text-muted-foreground text-sm capitalize">{format(new Date(date + 'T12:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', stats.total, 'bg-blue-50 text-blue-700'], ['Concluídos', stats.concluido, 'bg-green-50 text-green-700'], ['Faltas', stats.faltou, 'bg-red-50 text-red-700'], ['Pendentes', stats.pendente, 'bg-amber-50 text-amber-700']].map(([l, v, c]) => (
          <div key={String(l)} className={`rounded-xl p-4 ${c}`}>
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-sm font-medium">{l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {appointments.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhum agendamento para este dia.</CardContent></Card>}
        {appointments.map(a => (
          <Card key={a.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: a.fisio?.color ?? '#2250fc' }} />
                <div className="w-14 text-sm font-mono font-medium text-right shrink-0">{formatTime(a.start_time)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.patient?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.fisio?.full_name} · {a.session_type ?? 'Tratamento'}</p>
                </div>
                <StatusBadge status={a.status} />
                <div className="flex items-center gap-1 shrink-0">
                  {a.status === 'agendado' || a.status === 'confirmado' ? (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2" onClick={() => setStatus(a, 'em_atendimento')} disabled={saving === a.id}><Clock size={14} /></Button>
                      <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 h-8 px-2" onClick={() => setStatus(a, 'faltou')} disabled={saving === a.id}><XCircle size={14} /></Button>
                    </>
                  ) : a.status === 'em_atendimento' ? (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-3" onClick={() => setStatus(a, 'concluido')} disabled={saving === a.id}><CheckCircle size={14} className="mr-1" />Concluir</Button>
                  ) : null}
                  <button onClick={() => setExpanded(expanded === a.id ? null : a.id)} className="p-1 text-muted-foreground hover:text-foreground">
                    {expanded === a.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === a.id && (
                <div className="mt-4 pl-16 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><FileText size={12} />Evolução clínica</label>
                    <Textarea
                      placeholder="Descreva a evolução da sessão..."
                      rows={3}
                      value={evolutions[a.id] ?? ''}
                      onChange={e => setEvolutions(prev => ({ ...prev, [a.id]: e.target.value }))}
                    />
                  </div>
                  {a.notes && <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">📝 {a.notes}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
