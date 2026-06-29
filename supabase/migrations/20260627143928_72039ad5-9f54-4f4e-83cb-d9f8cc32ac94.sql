
-- 1) Allow patient portal users to read their own appointments
CREATE POLICY "appt_select_patient" ON public.appointments
  FOR SELECT TO authenticated
  USING (patient_id = public.current_patient_id());

-- 2) Restrict legal-documents bucket reads to staff roles only
DROP POLICY IF EXISTS "legal_docs_read" ON storage.objects;
CREATE POLICY "legal_docs_staff_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'legal-documents'
    AND public.current_user_role() IN ('admin','recepcionista','fisioterapeuta')
  );

-- 3) Add DELETE policy on sessions, scoped to admin
CREATE POLICY "sessions_delete" ON public.sessions
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');
