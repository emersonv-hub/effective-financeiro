import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '@/types';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select('*, patient:patients(id,full_name,phone), fisio:fisio_profiles(id,full_name,color)')
      .order('start_time');
    if (start) query = query.gte('start_time', start);
    if (end) query = query.lte('start_time', end);
    const { data } = await query;
    setAppointments((data ?? []) as Appointment[]);
    setLoading(false);
  }, []);

  const createAppointment = async (data: Partial<Appointment>) => {
    const { data: result, error } = await supabase.from('appointments').insert(data).select().single();
    if (error) throw error;
    return result as Appointment;
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const { error } = await supabase.from('appointments').update(data).eq('id', id);
    if (error) throw error;
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', id);
    if (error) throw error;
  };

  const checkConflict = async (fisioId: string, start: string, end: string, excludeId?: string) => {
    let query = supabase
      .from('appointments')
      .select('id')
      .eq('fisio_id', fisioId)
      .not('status', 'in', '(cancelado,faltou)')
      .lt('start_time', end)
      .gt('end_time', start);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query;
    return (data?.length ?? 0) > 0;
  };

  return { appointments, loading, fetchAppointments, createAppointment, updateAppointment, deleteAppointment, checkConflict };
}
