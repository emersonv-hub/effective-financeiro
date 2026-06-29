-- patient_fisios
DROP POLICY IF EXISTS pf_select ON public.patient_fisios;
CREATE POLICY pf_select ON public.patient_fisios
FOR SELECT TO authenticated
USING (
  current_user_role() = ANY (ARRAY['admin','recepcionista'])
  OR fisio_id = auth.uid()
);

-- fisio_profiles
DROP POLICY IF EXISTS profiles_select ON public.fisio_profiles;
CREATE POLICY profiles_select ON public.fisio_profiles
FOR SELECT TO authenticated
USING (
  current_user_role() = ANY (ARRAY['admin','recepcionista'])
  OR id = auth.uid()
  OR (
    current_user_role() = 'fisioterapeuta'
    AND active = true
    AND role IS NOT NULL
  )
);

-- faixas_repasse: admin only
DROP POLICY IF EXISTS leitura_autenticados ON public.faixas_repasse;
CREATE POLICY leitura_admin ON public.faixas_repasse
FOR SELECT TO authenticated
USING (fn_eh_admin());

-- lancamentos: admin only
DROP POLICY IF EXISTS leitura_autenticados ON public.lancamentos;
CREATE POLICY leitura_admin ON public.lancamentos
FOR SELECT TO authenticated
USING (fn_eh_admin());

-- notas_fiscais: admin only
DROP POLICY IF EXISTS leitura_autenticados ON public.notas_fiscais;
CREATE POLICY leitura_admin ON public.notas_fiscais
FOR SELECT TO authenticated
USING (fn_eh_admin());

-- perfis: admin or self
DROP POLICY IF EXISTS leitura_autenticados ON public.perfis;
CREATE POLICY leitura_admin_or_self ON public.perfis
FOR SELECT TO authenticated
USING (fn_eh_admin() OR user_id = auth.uid());

-- expenses: explicit admin-only update/delete
CREATE POLICY expenses_update ON public.expenses
FOR UPDATE TO authenticated
USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

CREATE POLICY expenses_delete ON public.expenses
FOR DELETE TO authenticated
USING (current_user_role() = 'admin');