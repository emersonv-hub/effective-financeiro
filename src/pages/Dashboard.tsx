import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, ClipboardCheck, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { supabase } from '@/lib/supabase';
import { formatBRL, formatTime } from '@/lib/utils';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { Appointment } from '@/types';

interface Stats {
  todayCount: number;
  confirmedCount: number;
  activePatients: number;
  monthRevenue: number;
  pendingPayments: number;
}

function StatCard({ title, value, icon: Icon, color, sub }: { title: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ todayCount: 0, confirmedCount: 0, activePatients: 0, monthRevenue: 0, pendingPayments: 0 });
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const today = new Date();

  useEffect(() => {
    const load = async () => {
      const todayStart = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
      const todayEnd = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
      const monthStart = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');

      const [apptRes, patientsRes, revenueRes, pendingRes] = await Promise.all([
        supabase.from('appointments').select('*, patient:patients(full_name), fisio:fisio_profiles(full_name,color)')
          .gte('start_time', todayStart).lte('start_time', todayEnd).order('start_time'),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('payments').select('amount').gte('payment_date', monthStart).eq('status', 'pago'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
      ]);

      const appts = (apptRes.data ?? []) as Appointment[];
      setTodayAppts(appts);
      setStats({
        todayCount: appts.length,
        confirmedCount: appts.filter(a => a.status === 'confirmado' || a.status === 'em_atendimento').length,
        activePatients: patientsRes.count ?? 0,
        monthRevenue: (revenueRes.data ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0),
        pendingPayments: pendingRes.count ?? 0,
      });
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Olá! Hoje é {format(today, "EEEE, dd 'de' MMMM", { locale: undefined })}</h2>
        <p className="text-muted-foreground text-sm">Aqui está o resumo do dia</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Atendimentos hoje" value={stats.todayCount} icon={Calendar} color="bg-[#2250fc]" sub={`${stats.confirmedCount} confirmados`} />
        <StatCard title="Pacientes ativos" value={stats.activePatients} icon={Users} color="bg-[#728a9f]" />
        <StatCard title="Receita do mês" value={formatBRL(stats.monthRevenue)} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Pgtos pendentes" value={stats.pendingPayments} icon={AlertCircle} color="bg-amber-500" />
      </div>

      {/* Today's agenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock size={18} className="text-[#2250fc]" /> Agenda de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">Nenhum agendamento para hoje.</p>
          ) : (
            <div className="divide-y">
              {todayAppts.map(a => (
                <div key={a.id} className="flex items-center gap-4 py-3 cursor-pointer hover:bg-muted/40 rounded-lg px-2 transition-colors" onClick={() => navigate('/agenda')}>
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: a.fisio?.color ?? '#2250fc' }} />
                  <div className="w-16 text-right shrink-0">
                    <span className="text-sm font-mono font-medium">{formatTime(a.start_time)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{a.patient?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{a.fisio?.full_name} · {a.session_type ?? 'Tratamento'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nova Sessão', icon: Calendar, path: '/agenda', color: 'bg-[#2250fc]/10 text-[#2250fc] hover:bg-[#2250fc]/20' },
          { label: 'Novo Paciente', icon: Users, path: '/pacientes', color: 'bg-[#728a9f]/10 text-[#728a9f] hover:bg-[#728a9f]/20' },
          { label: 'Registrar Presença', icon: ClipboardCheck, path: '/presenca', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
          { label: 'Registrar Pgto', icon: DollarSign, path: '/financeiro', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
        ].map(({ label, icon: Icon, path, color }) => (
          <button key={path} onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition-colors ${color}`}>
            <Icon size={24} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
