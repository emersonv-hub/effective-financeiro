-- Políticas DELETE ausentes — necessárias para exclusão definitiva de pacientes

CREATE POLICY "sessions_delete" ON public.sessions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fisio_profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'FISIOTERAPEUTA')
    )
  );

CREATE POLICY "payments_delete" ON public.payments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fisio_profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'FISIOTERAPEUTA')
    )
  );

CREATE POLICY "patients_delete" ON public.patients
  FOR DELETE TO authenticated
  USING (current_user_role() = 'admin');
