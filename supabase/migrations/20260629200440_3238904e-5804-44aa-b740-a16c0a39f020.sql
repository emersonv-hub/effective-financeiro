
-- 1) Set immutable search_path on all functions
ALTER FUNCTION public.fn_eh_admin() SET search_path = public;
ALTER FUNCTION public.fn_media_nf_12m(date, uuid) SET search_path = public;
ALTER FUNCTION public.fn_repasse_clinica(uuid, date) SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.fn_resumo_repasses(date) SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.set_session_number() SET search_path = public;
ALTER FUNCTION public.criar_relatorio_ao_concluir() SET search_path = public;

-- 2) Revoke EXECUTE on SECURITY DEFINER functions from public/anon; restrict to needed roles
REVOKE ALL ON FUNCTION public.fn_eh_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_resumo_repasses(date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fisio_handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_resumo_repasses(date) TO service_role;

-- 3) Convert views to SECURITY INVOKER so RLS of caller applies
ALTER VIEW public.vw_resultado_mensal SET (security_invoker = true);
ALTER VIEW public.vw_fluxo_mensal SET (security_invoker = true);
ALTER VIEW public.vw_rateio_socios SET (security_invoker = true);
ALTER VIEW public.vw_producao_profissionais SET (security_invoker = true);
ALTER VIEW public.vw_lucro_fisios SET (security_invoker = true);
ALTER VIEW public.vw_conciliacao_recebimentos SET (security_invoker = true);
ALTER VIEW public.vw_historico_pagamentos_fisios SET (security_invoker = true);

-- 4) Prevent role self-escalation on fisio_profiles
DROP POLICY IF EXISTS profiles_update ON public.fisio_profiles;
CREATE POLICY profiles_update ON public.fisio_profiles
  FOR UPDATE TO authenticated
  USING ((id = auth.uid()) OR (public.current_user_role() = 'admin'))
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR (
      id = auth.uid()
      AND role IS NOT DISTINCT FROM (SELECT role FROM public.fisio_profiles WHERE id = auth.uid())
    )
  );

-- 5) Restrict clinical muscle_evaluations from receptionists
DROP POLICY IF EXISTS muscle_evaluations_select ON public.muscle_evaluations;
CREATE POLICY muscle_evaluations_select ON public.muscle_evaluations
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin','fisioterapeuta')
    OR fisio_id = auth.uid()
  );

-- 6) Fix uppercase role check on payments delete
DROP POLICY IF EXISTS payments_delete ON public.payments;
CREATE POLICY payments_delete ON public.payments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fisio_profiles
      WHERE id = auth.uid() AND role = ANY (ARRAY['admin','fisioterapeuta'])
    )
  );

-- 7) Stop auto-assigning fisioterapeuta on signup; new users land inactive with no role
ALTER TABLE public.fisio_profiles ALTER COLUMN role DROP DEFAULT;

CREATE OR REPLACE FUNCTION public.fisio_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fisio_profiles (id, email, full_name, role, color, active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.fisio_profiles) THEN 'admin' ELSE NULL END,
    '#2250fc',
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.fisio_profiles) THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- 8) Storage write policies for legal-documents bucket (admin-only)
CREATE POLICY legal_docs_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'legal-documents' AND public.current_user_role() = 'admin');

CREATE POLICY legal_docs_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'legal-documents' AND public.current_user_role() = 'admin')
  WITH CHECK (bucket_id = 'legal-documents' AND public.current_user_role() = 'admin');

CREATE POLICY legal_docs_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'legal-documents' AND public.current_user_role() = 'admin');
