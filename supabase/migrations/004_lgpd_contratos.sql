-- ============================================================
-- FisioManager — Migration 004
-- LGPD consent em pacientes + repositório de contratos
-- ============================================================

-- ─── LGPD consent nos pacientes ───────────────────────────────
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS lgpd_consent      BOOLEAN    DEFAULT false,
  ADD COLUMN IF NOT EXISTS lgpd_consent_date TIMESTAMPTZ;

-- ─── Contratos de serviço ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patient_contracts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID         NOT NULL REFERENCES public.patients(id)       ON DELETE CASCADE,
  fisio_id      UUID                  REFERENCES public.fisio_profiles(id)  ON DELETE SET NULL,
  plan_name     TEXT         NOT NULL,
  plan_sessions INTEGER      NOT NULL,
  plan_value    DECIMAL(10,2) NOT NULL,
  status        TEXT         NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'enviado', 'assinado', 'cancelado')),
  sent_at       TIMESTAMPTZ,
  signed_at     TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_select" ON public.patient_contracts FOR SELECT TO authenticated USING (
  public.current_user_role() IN ('admin', 'recepcionista') OR fisio_id = auth.uid()
);
CREATE POLICY "contracts_insert" ON public.patient_contracts FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'fisioterapeuta', 'recepcionista'));
CREATE POLICY "contracts_update" ON public.patient_contracts FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());

CREATE TRIGGER trg_contracts_updated
  BEFORE UPDATE ON public.patient_contracts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX ON public.patient_contracts (patient_id);
CREATE INDEX ON public.patient_contracts (fisio_id);
CREATE INDEX ON public.patient_contracts (status);

-- ─── Permissão do módulo contratos ────────────────────────────
INSERT INTO public.module_permissions (module, role, allowed) VALUES
  ('contratos', 'fisioterapeuta', true),
  ('contratos', 'recepcionista',  true)
ON CONFLICT (module, role) DO NOTHING;
