-- ============================================================
-- FisioManager — Effective Fisioterapia
-- Migration 001: Schema inicial completo
-- ============================================================

-- ─── EXTENSÕES ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM auxiliar ───────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'fisioterapeuta', 'recepcionista');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fisio_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  role         TEXT CHECK (role IN ('admin','fisioterapeuta','recepcionista')) DEFAULT 'fisioterapeuta',
  color        TEXT NOT NULL DEFAULT '#3B82F6',
  avatar_url   TEXT,
  phone        TEXT,
  crefito      TEXT,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PATIENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patients (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name            TEXT NOT NULL,
  cpf                  TEXT UNIQUE,
  birth_date           DATE,
  phone                TEXT,
  email                TEXT,
  address              TEXT,
  city                 TEXT,
  cep                  TEXT,
  gender               TEXT CHECK (gender IN ('M','F','Outro')),
  diagnosis            TEXT,
  notes                TEXT,
  health_plan          TEXT,
  health_plan_number   TEXT,
  responsible_fisio    UUID REFERENCES public.fisio_profiles(id),
  active               BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id),
  fisio_id        UUID NOT NULL REFERENCES public.fisio_profiles(id),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  status          TEXT CHECK (status IN ('agendado','confirmado','em_atendimento','concluido','faltou','cancelado')) DEFAULT 'agendado',
  session_type    TEXT,
  notes           TEXT,
  color           TEXT,
  recurrence      TEXT CHECK (recurrence IN ('none','daily','weekly','biweekly')) DEFAULT 'none',
  recurrence_end  DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SESSIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES public.appointments(id),
  patient_id      UUID NOT NULL REFERENCES public.patients(id),
  fisio_id        UUID NOT NULL REFERENCES public.fisio_profiles(id),
  date            DATE NOT NULL,
  check_in        TIMESTAMPTZ,
  check_out       TIMESTAMPTZ,
  status          TEXT CHECK (status IN ('presente','faltou','faltou_justificado','cancelado')),
  session_notes   TEXT,
  evolution       TEXT,
  session_number  INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID NOT NULL REFERENCES public.patients(id),
  fisio_id           UUID NOT NULL REFERENCES public.fisio_profiles(id),
  session_id         UUID REFERENCES public.sessions(id),
  amount             DECIMAL(10,2) NOT NULL,
  payment_date       DATE NOT NULL,
  due_date           DATE,
  payment_method     TEXT CHECK (payment_method IN ('dinheiro','pix','cartao_credito','cartao_debito','convenio','transferencia')),
  payment_type       TEXT CHECK (payment_type IN ('avista','parcelado')) DEFAULT 'avista',
  installments       INTEGER DEFAULT 1,
  installment_number INTEGER DEFAULT 1,
  status             TEXT CHECK (status IN ('pendente','pago','parcial','cancelado','estornado')) DEFAULT 'pendente',
  description        TEXT,
  receipt_number     TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EXPENSES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description     TEXT NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  expense_date    DATE NOT NULL,
  category        TEXT CHECK (category IN ('aluguel','material','equipamento','marketing','pessoal','outros')),
  payment_method  TEXT,
  receipt_url     TEXT,
  notes           TEXT,
  registered_by   UUID REFERENCES public.fisio_profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRIGGER: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['fisio_profiles','patients','appointments','payments'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON public.%I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t, t);
  END LOOP;
END $$;

-- ─── TRIGGER: fisio_profile automático no cadastro ───────────
-- Usa nome diferente para não conflitar com trigger do GolManager
CREATE OR REPLACE FUNCTION public.fisio_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.fisio_profiles (id, email, full_name, role, color)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.fisio_profiles) THEN 'admin' ELSE 'fisioterapeuta' END,
    '#2250fc'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS fisio_on_auth_user_created ON auth.users;
CREATE TRIGGER fisio_on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fisio_handle_new_user();

-- ─── TRIGGER: session_number incremental ─────────────────────
CREATE OR REPLACE FUNCTION public.set_session_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  SELECT COALESCE(MAX(session_number), 0) + 1 INTO NEW.session_number
  FROM public.sessions WHERE patient_id = NEW.patient_id AND status = 'presente';
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_session_number ON public.sessions;
CREATE TRIGGER trg_session_number BEFORE INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_session_number();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.fisio_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses    ENABLE ROW LEVEL SECURITY;

-- Helper: papel do usuário atual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.fisio_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- PROFILES: todos autenticados leem; cada um edita só o próprio
CREATE POLICY "profiles_select" ON public.fisio_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.fisio_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON public.fisio_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin');

-- PATIENTS: admin e fisio responsável leem; recepcionista lê todos; ninguém deleta (soft delete)
CREATE POLICY "patients_select" ON public.patients FOR SELECT TO authenticated USING (
  public.current_user_role() IN ('admin','recepcionista')
  OR responsible_fisio = auth.uid()
  OR public.current_user_role() = 'fisioterapeuta'
);
CREATE POLICY "patients_insert" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin','fisioterapeuta'));
CREATE POLICY "patients_update" ON public.patients FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin' OR responsible_fisio = auth.uid());

-- APPOINTMENTS: admin vê todos; fisio vê os seus; recepcionista vê todos
CREATE POLICY "appt_select" ON public.appointments FOR SELECT TO authenticated USING (
  public.current_user_role() IN ('admin','recepcionista') OR fisio_id = auth.uid()
);
CREATE POLICY "appt_insert" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin','fisioterapeuta','recepcionista'));
CREATE POLICY "appt_update" ON public.appointments FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());
CREATE POLICY "appt_delete" ON public.appointments FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());

-- SESSIONS: admin e fisio próprio
CREATE POLICY "sessions_select" ON public.sessions FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());
CREATE POLICY "sessions_insert" ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin','fisioterapeuta'));
CREATE POLICY "sessions_update" ON public.sessions FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());

-- PAYMENTS: admin e fisio próprio; recepcionista sem acesso
CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin','fisioterapeuta'));
CREATE POLICY "payments_update" ON public.payments FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin' OR fisio_id = auth.uid());

-- EXPENSES: apenas admin
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin');
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');
