DROP POLICY IF EXISTS patients_select ON public.patients;
CREATE POLICY patients_select ON public.patients
FOR SELECT TO authenticated
USING (
  current_user_role() = ANY (ARRAY['admin','recepcionista'])
  OR responsible_fisio = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.patient_fisios pf
    WHERE pf.patient_id = patients.id AND pf.fisio_id = auth.uid()
  )
);