import { supabase } from './supabase';

export async function confirmarAgendamento(appointmentId: string, evolution?: string) {
  // Verifica se já existe relatório para este agendamento
  const { data: existing } = await supabase
    .from('daily_reports')
    .select('id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (existing) {
    if (evolution) {
      await supabase
        .from('daily_reports')
        .update({ evolution })
        .eq('id', existing.id);
    }
    return;
  }

  // Busca dados do agendamento para criar o relatório manualmente
  // (fallback caso o trigger do banco não tenha disparado ainda)
  const { data: appt, error } = await supabase
    .from('appointments')
    .select('id, patient_id, fisio_id, start_time, end_time')
    .eq('id', appointmentId)
    .single();

  if (error || !appt) return;

  const start = new Date(appt.start_time);
  const end = new Date(appt.end_time);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);

  await supabase.from('daily_reports').insert({
    report_date:      start.toISOString().split('T')[0],
    patient_id:       appt.patient_id,
    fisio_id:         appt.fisio_id,
    appointment_id:   appt.id,
    duration_minutes: duration,
    status:           'confirmado',
    evolution:        evolution ?? null,
  });
}
