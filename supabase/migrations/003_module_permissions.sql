-- ============================================================
-- FisioManager — Migration 003
-- Permissões de acesso por módulo e papel
-- ============================================================

CREATE TABLE IF NOT EXISTS public.module_permissions (
  id      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  module  TEXT    NOT NULL,
  role    TEXT    NOT NULL CHECK (role IN ('fisioterapeuta', 'recepcionista')),
  allowed BOOLEAN NOT NULL DEFAULT true,
  UNIQUE  (module, role)
);

ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_read"  ON public.module_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "mp_write" ON public.module_permissions
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin');

-- Valores padrão (espelham as permissões fixas anteriores)
INSERT INTO public.module_permissions (module, role, allowed) VALUES
  ('agenda',      'fisioterapeuta', true),
  ('agenda',      'recepcionista',  true),
  ('pacientes',   'fisioterapeuta', true),
  ('pacientes',   'recepcionista',  true),
  ('presenca',    'fisioterapeuta', true),
  ('presenca',    'recepcionista',  false),
  ('financeiro',  'fisioterapeuta', true),
  ('financeiro',  'recepcionista',  false),
  ('relatorios',  'fisioterapeuta', true),
  ('relatorios',  'recepcionista',  false)
ON CONFLICT (module, role) DO NOTHING;
