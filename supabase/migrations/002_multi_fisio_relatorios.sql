-- ============================================================
-- FisioManager — Migration 002
-- Paciente com múltiplos fisioterapeutas + relatórios diários
-- ============================================================

-- ─── TABLE: patient_fisios ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patient_fisios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES public.patients(id)       ON DELETE CASCADE,
  fisio_id    UUID NOT NULL REFERENCES public.fisio_profiles(id)  ON DELETE CASCADE,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, fisio_id)
);

ALTER TABLE public.patient_fisios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pf_select" ON public.patient_fisios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "pf_all" ON public.patient_fisios
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'recepcionista'));

CREATE INDEX ON public.patient_fisios (patient_id);
CREATE INDEX ON public.patient_fisios (fisio_id);

-- ─── TABLE: daily_reports ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date      DATE NOT NULL,
  patient_id       UUID NOT NULL REFERENCES public.patients(id)       ON DELETE CASCADE,
  fisio_id         UUID         REFERENCES public.fisio_profiles(id)   ON DELETE SET NULL,
  appointment_id   UUID         REFERENCES public.appointments(id)     ON DELETE SET NULL,
  evolution        TEXT,
  procedures       TEXT[],
  duration_minutes INTEGER,
  status           TEXT NOT NULL DEFAULT 'confirmado'
    CHECK (status IN ('confirmado', 'cancelado', 'faltou')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dr_select" ON public.daily_reports FOR SELECT TO authenticated USING (
  public.current_user_role() IN ('admin', 'recepcionista') OR fisio_id = auth.uid()
);
CREATE POLICY "dr_insert" ON public.daily_reports FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'fisioterapeuta'));
CREATE POLICY "dr_update" ON public.daily_reports FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());

-- Reusa a função handle_updated_at já criada na migration 001
CREATE TRIGGER trg_daily_reports_updated
  BEFORE UPDATE ON public.daily_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX ON public.daily_reports (report_date);
CREATE INDEX ON public.daily_reports (fisio_id);
CREATE INDEX ON public.daily_reports (patient_id);

-- ─── TRIGGER: cria relatório ao concluir agendamento ───────────
CREATE OR REPLACE FUNCTION public.criar_relatorio_ao_concluir()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'concluido' AND OLD.status <> 'concluido' THEN
    INSERT INTO public.daily_reports (
      report_date, patient_id, fisio_id, appointment_id,
      duration_minutes, status
    )
    SELECT
      NEW.start_time::date,
      NEW.patient_id,
      NEW.fisio_id,
      NEW.id,
      EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::int / 60,
      'confirmado'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.daily_reports WHERE appointment_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_concluir_agendamento
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.criar_relatorio_ao_concluir();
