import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatBRL } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#2250fc','#728a9f','#10b981','#f59e0b','#ef4444','#8b5cf6'];

interface WeekData {
  appointments: any[];
  payments: any[];
  sessions: any[];
  totalRevenue: number;
  totalExpenses: number;
  prevRevenue: number;
}

export function WeeklyReport() {
  const [weekStart, setWeekStart] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [data, setData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const start = weekStart;
    const end = format(endOfWeek(new Date(weekStart + 'T12:00:00'), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const prevStart = format(subWeeks(new Date(weekStart + 'T12:00:00'), 1), 'yyyy-MM-dd');
    const prevEnd = format(endOfWeek(subWeeks(new Date(weekStart + 'T12:00:00'), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const [apptRes, payRes, sessRes, expRes, prevPayRes] = await Promise.all([
      supabase.from('appointments').select('*').gte('start_time', start + 'T00:00:00').lte('start_time', end + 'T23:59:59'),
      supabase.from('payments').select('*').gte('payment_date', start).lte('payment_date', end),
      supabase.from('sessions').select('*').gte('date', start).lte('date', end),
      supabase.from('expenses').select('*').gte('expense_date', start).lte('expense_date', end),
      supabase.from('payments').select('amount').gte('payment_date', prevStart).lte('payment_date', prevEnd).eq('status', 'pago'),
    ]);

    const payments = payRes.data ?? [];
    const expenses = expRes.data ?? [];
    setData({
      appointments: apptRes.data ?? [],
      payments,
      sessions: sessRes.data ?? [],
      totalRevenue: payments.filter((p: any) => p.status === 'pago').reduce((s: number, p: any) => s + Number(p.amount), 0),
      totalExpenses: expenses.reduce((s: number, e: any) => s + Number(e.amount), 0),
      prevRevenue: (prevPayRes.data ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0),
    });
    setLoading(false);
  }

  const days = data ? eachDayOfInterval({
    start: new Date(weekStart + 'T12:00:00'),
    end: endOfWeek(new Date(weekStart + 'T12:00:00'), { weekStartsOn: 1 }),
  }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const appts = data.appointments.filter((a: any) => a.start_time?.startsWith(dayStr));
    const rev = data.payments.filter((p: any) => p.payment_date === dayStr && p.status === 'pago').reduce((s: number, p: any) => s + Number(p.amount), 0);
    return { day: format(day, 'EEE', { locale: ptBR }), atendimentos: appts.length, receita: rev };
  }) : [];

  const payMethods = data ? Object.entries(
    data.payments.filter((p: any) => p.status === 'pago').reduce((acc: Record<string, number>, p: any) => {
      acc[p.payment_method ?? 'outros'] = (acc[p.payment_method ?? 'outros'] ?? 0) + Number(p.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name === 'pix' ? 'PIX' : name === 'dinheiro' ? 'Dinheiro' : name === 'cartao_credito' ? 'Crédito' : name === 'cartao_debito' ? 'Débito' : name, value })) : [];

  const diffPct = data && data.prevRevenue > 0 ? ((data.totalRevenue - data.prevRevenue) / data.prevRevenue * 100).toFixed(1) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="space-y-0.5">
          <label className="text-xs text-muted-foreground">Semana iniciando em</label>
          <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring block" />
        </div>
        <Button onClick={load} disabled={loading} size="sm" className="mt-5 bg-[#2250fc] hover:bg-[#1a3fd4]">
          <RefreshCw size={14} className={loading ? 'animate-spin mr-1' : 'mr-1'} />Gerar
        </Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Atendimentos', data.appointments.length, ''],
              ['Receita', formatBRL(data.totalRevenue), 'text-green-600'],
              ['Despesas', formatBRL(data.totalExpenses), 'text-red-500'],
              ['vs semana anterior', diffPct ? `${Number(diffPct) > 0 ? '+' : ''}${diffPct}%` : 'N/D', Number(diffPct) >= 0 ? 'text-green-600' : 'text-red-500'],
            ].map(([l, v, c]) => (
              <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className={`text-xl font-bold font-money ${c}`}>{v}</p></CardContent></Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Atendimentos por dia</CardTitle></CardHeader>
              <CardContent><ResponsiveContainer width="100%" height={200}>
                <BarChart data={days}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="atendimentos" fill="#2250fc" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer></CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Formas de pagamento</CardTitle></CardHeader>
              <CardContent>
                {payMethods.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Sem pagamentos na semana.</p> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={payMethods} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                        label={(p: any) => `${p.name} ${((p.percent ?? 0) * 100).toFixed(0)}%`}>
                        {payMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Receita diária</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={180}>
              <BarChart data={days}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                <Bar dataKey="receita" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer></CardContent>
          </Card>

          {/* Faltas */}
          {data.sessions.filter((s: any) => s.status === 'faltou').length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-500">Faltas na semana</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">{data.sessions.filter((s: any) => s.status === 'faltou').length}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
