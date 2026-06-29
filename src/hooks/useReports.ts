import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function useReports() {
  const [loading, setLoading] = useState(false);

  const getDailyReport = useCallback(async (date: Date) => {
    setLoading(true);
    const start = format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ss");
    const end = format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss");
    const dateStr = format(date, 'yyyy-MM-dd');

    const [apptRes, payRes, expRes] = await Promise.all([
      supabase.from('appointments').select('*, patient:patients(full_name), fisio:fisio_profiles(full_name,color)')
        .gte('start_time', start).lte('start_time', end),
      supabase.from('payments').select('*, patient:patients(full_name)')
        .eq('payment_date', dateStr).eq('status', 'pago'),
      supabase.from('expenses').select('*').eq('expense_date', dateStr),
    ]);

    const appointments = apptRes.data ?? [];
    const payments = payRes.data ?? [];
    const expenses = expRes.data ?? [];
    const totalRevenue = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

    setLoading(false);
    return { appointments, payments, expenses, totalRevenue, totalExpenses, balance: totalRevenue - totalExpenses };
  }, []);

  const getMonthlyReport = useCallback(async (date: Date) => {
    setLoading(true);
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');

    const [payRes, expRes, sessRes] = await Promise.all([
      supabase.from('payments').select('*, patient:patients(full_name), fisio:fisio_profiles(full_name)')
        .gte('payment_date', start).lte('payment_date', end),
      supabase.from('expenses').select('*').gte('expense_date', start).lte('expense_date', end),
      supabase.from('sessions').select('*').gte('date', start).lte('date', end),
    ]);

    const payments = payRes.data ?? [];
    const expenses = expRes.data ?? [];
    const sessions = sessRes.data ?? [];
    const totalRevenue = payments.filter((p: any) => p.status === 'pago').reduce((s: number, p: any) => s + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

    setLoading(false);
    return { payments, expenses, sessions, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
  }, []);

  return { loading, getDailyReport, getMonthlyReport };
}
