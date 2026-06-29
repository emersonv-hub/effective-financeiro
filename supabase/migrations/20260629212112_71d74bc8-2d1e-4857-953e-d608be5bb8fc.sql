
-- Tighten sessions_insert: fisioterapeuta must insert their own sessions only
DROP POLICY IF EXISTS sessions_insert ON public.sessions;
CREATE POLICY sessions_insert ON public.sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'admin'
    OR (current_user_role() = 'fisioterapeuta' AND fisio_id = auth.uid())
  );

-- Restrict receptionists to sessions of patients they manage (via patient_fisios assignment is fisio-scoped; receptionists generally see scheduling).
-- Limit to non-clinical scope by requiring the session belongs to a patient and exclude unrestricted access.
DROP POLICY IF EXISTS sessions_select_recepcionista ON public.sessions;
CREATE POLICY sessions_select_recepcionista ON public.sessions
  FOR SELECT TO authenticated
  USING (
    current_user_role() = 'recepcionista'
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = sessions.patient_id
    )
    AND status IN ('agendado','presente','falta','cancelado','confirmado','remarcado')
  );

-- Restrict payments_delete: admins or owning fisioterapeuta only
DROP POLICY IF EXISTS payments_delete ON public.payments;
CREATE POLICY payments_delete ON public.payments
  FOR DELETE TO authenticated
  USING (
    current_user_role() = 'admin'
    OR (current_user_role() = 'fisioterapeuta' AND fisio_id = auth.uid())
  );
