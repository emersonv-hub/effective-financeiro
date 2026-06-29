
CREATE POLICY "sessions_select_recepcionista" ON public.sessions
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'recepcionista');
