
-- 1) Fix role self-escalation: split UPDATE policy so non-admins cannot touch role
DROP POLICY IF EXISTS profiles_update ON public.fisio_profiles;

CREATE POLICY profiles_update_admin ON public.fisio_profiles
FOR UPDATE TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY profiles_update_self ON public.fisio_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() AND public.current_user_role() <> 'admin')
WITH CHECK (
  id = auth.uid()
  AND role IS NOT DISTINCT FROM (SELECT role FROM public.fisio_profiles WHERE id = auth.uid())
  AND active IS NOT DISTINCT FROM (SELECT active FROM public.fisio_profiles WHERE id = auth.uid())
);

-- 2) New signups: no role, inactive, require admin approval
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
END;
$$;

-- 3) Restrict muscle_evaluations SELECT to admin or the owning fisio only
DROP POLICY IF EXISTS muscle_evaluations_select ON public.muscle_evaluations;
CREATE POLICY muscle_evaluations_select ON public.muscle_evaluations
FOR SELECT TO authenticated
USING (
  public.current_user_role() = 'admin'
  OR (public.current_user_role() = 'fisioterapeuta' AND fisio_id = auth.uid())
);

-- 4) Restrict planejamento SELECT to admins only
DROP POLICY IF EXISTS "leitura planejamento" ON public.planejamento;
CREATE POLICY planejamento_select_admin ON public.planejamento
FOR SELECT TO authenticated
USING (public.fn_eh_admin());
