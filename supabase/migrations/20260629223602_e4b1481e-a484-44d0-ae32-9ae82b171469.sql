DROP POLICY IF EXISTS leitura_autenticados ON public.profissionais;
CREATE POLICY profissionais_admin_only ON public.profissionais
  FOR SELECT TO authenticated
  USING (public.fn_eh_admin());