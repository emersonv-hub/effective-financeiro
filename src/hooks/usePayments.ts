import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Payment, Expense } from '@/types';
import { generateReceiptNumber, installmentDates } from '@/lib/utils';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async (filters?: { patientId?: string; fisioId?: string; startDate?: string; endDate?: string }) => {
    setLoading(true);
    let query = supabase
      .from('payments')
      .select('*, patient:patients(id,full_name), fisio:fisio_profiles(id,full_name)')
      .order('payment_date', { ascending: false });
    if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters?.fisioId) query = query.eq('fisio_id', filters.fisioId);
    if (filters?.startDate) query = query.gte('payment_date', filters.startDate);
    if (filters?.endDate) query = query.lte('payment_date', filters.endDate);
    const { data } = await query;
    setPayments((data ?? []) as Payment[]);
    setLoading(false);
  }, []);

  const fetchExpenses = useCallback(async (startDate?: string, endDate?: string) => {
    let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    if (startDate) query = query.gte('expense_date', startDate);
    if (endDate) query = query.lte('expense_date', endDate);
    const { data } = await query;
    setExpenses((data ?? []) as Expense[]);
  }, []);

  const createPayment = async (data: Partial<Payment>) => {
    const receiptNumber = generateReceiptNumber();
    if (data.payment_type === 'parcelado' && data.installments && data.installments > 1) {
      const dates = installmentDates(data.payment_date!, data.installments);
      const rows = dates.map((date, i) => ({
        ...data,
        payment_date: date,
        due_date: date,
        installment_number: i + 1,
        receipt_number: `${receiptNumber}-${i + 1}`,
        status: i === 0 ? data.status : 'pendente',
      }));
      const { error } = await supabase.from('payments').insert(rows);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('payments').insert({ ...data, installments: 1, installment_number: 1, receipt_number: receiptNumber });
      if (error) throw error;
    }
  };

  const updatePayment = async (id: string, data: Partial<Payment>) => {
    const { error } = await supabase.from('payments').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  };

  const createExpense = async (data: Partial<Expense>) => {
    const { error } = await supabase.from('expenses').insert(data);
    if (error) throw error;
  };

  return { payments, expenses, loading, fetchPayments, fetchExpenses, createPayment, updatePayment, createExpense };
}
