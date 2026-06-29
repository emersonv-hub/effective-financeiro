import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Patient } from '@/types';

async function syncPatientFisios(patientId: string, fisioIds: string[], principalId?: string) {
  await supabase.from('patient_fisios').delete().eq('patient_id', patientId);

  if (fisioIds.length === 0) return;

  await supabase.from('patient_fisios').insert(
    fisioIds.map(fisioId => ({
      patient_id: patientId,
      fisio_id:   fisioId,
      is_primary: fisioId === principalId,
    }))
  );
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchPatients = useCallback(async (search = '', page = 0, pageSize = 20, activeOnly = true) => {
    setLoading(true);
    let query = supabase
      .from('patients')
      .select('*, responsible_fisio_profile:fisio_profiles!patients_responsible_fisio_fkey(id,full_name,color)', { count: 'exact' })
      .order('full_name');
    if (activeOnly) query = query.eq('active', true);
    if (search) query = query.ilike('full_name', `%${search}%`);
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    const { data, count } = await query;
    setPatients((data ?? []) as Patient[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, []);

  const getPatient = async (id: string) => {
    const [{ data: patient }, { data: fisioLinks }] = await Promise.all([
      supabase
        .from('patients')
        .select('*, responsible_fisio_profile:fisio_profiles!patients_responsible_fisio_fkey(id,full_name,color)')
        .eq('id', id)
        .single(),
      supabase
        .from('patient_fisios')
        .select('fisio_id')
        .eq('patient_id', id),
    ]);
    return {
      ...(patient as Patient),
      fisio_ids: (fisioLinks ?? []).map((f: any) => f.fisio_id),
    };
  };

  const createPatient = async (data: Partial<Patient> & { fisio_ids?: string[] }) => {
    const { fisio_ids, ...patientData } = data;
    // Converte strings vazias em null para campos opcionais (evita erro de tipo no Postgres)
    const cleaned: any = {};
    for (const [k, v] of Object.entries(patientData)) {
      cleaned[k] = v === '' ? null : v;
    }
    const { data: result, error } = await supabase
      .from('patients')
      .insert(cleaned)
      .select()
      .single();
    if (error) throw error;
    const patient = result as Patient;
    if (fisio_ids?.length) {
      await syncPatientFisios(patient.id, fisio_ids, patientData.responsible_fisio);
    }
    return patient;
  };

  const updatePatient = async (id: string, data: Partial<Patient> & { fisio_ids?: string[] }) => {
    const { fisio_ids, ...patientData } = data;
    const { error } = await supabase
      .from('patients')
      .update({ ...patientData, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    if (fisio_ids) {
      await syncPatientFisios(id, fisio_ids, patientData.responsible_fisio);
    }
  };

  const deactivatePatient = async (id: string) => {
    const { error } = await supabase.from('patients').update({ active: false }).eq('id', id);
    if (error) throw error;
  };

  const deletePatient = async (id: string) => {
    // Ordem importa: payments referencia sessions, sessions referencia appointments
    const steps: Array<{ table: string; col: string }> = [
      { table: 'patient_fisios', col: 'patient_id' },
      { table: 'payments',       col: 'patient_id' },
      { table: 'sessions',       col: 'patient_id' },
      { table: 'appointments',   col: 'patient_id' },
    ];
    for (const { table, col } of steps) {
      const { error } = await (supabase.from(table as any).delete() as any).eq(col, id);
      if (error) throw new Error(`Erro ao excluir ${table}: ${error.message}`);
    }
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
  };

  return { patients, loading, total, fetchPatients, getPatient, createPatient, updatePatient, deactivatePatient, deletePatient };
}
