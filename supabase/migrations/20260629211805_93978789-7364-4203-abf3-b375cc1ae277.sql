DROP POLICY IF EXISTS patients_insert ON public.patients;
CREATE POLICY patients_insert ON public.patients
FOR INSERT TO authenticated
WITH CHECK (
  current_user_role() = 'admin'
  OR (current_user_role() = 'fisioterapeuta' AND responsible_fisio = auth.uid())
);

DROP POLICY IF EXISTS muscle_evaluations_insert ON public.muscle_evaluations;
CREATE POLICY muscle_evaluations_insert ON public.muscle_evaluations
FOR INSERT TO authenticated
WITH CHECK (
  current_user_role() = ANY (ARRAY['admin','fisioterapeuta'])
  AND (current_user_role() = 'admin' OR fisio_id = auth.uid())
);

CREATE POLICY dr_delete ON public.daily_reports
FOR DELETE TO authenticated
USING (current_user_role() = 'admin');

CREATE POLICY contracts_delete ON public.patient_contracts
FOR DELETE TO authenticated
USING (current_user_role() = 'admin');