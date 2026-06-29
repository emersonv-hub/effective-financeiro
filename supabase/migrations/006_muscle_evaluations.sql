-- Avaliações musculares: 3 medidas por músculo + média para laudo

CREATE TABLE IF NOT EXISTS public.muscle_evaluations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  fisio_id      uuid NOT NULL REFERENCES public.fisio_profiles(id),
  evaluation_date date NOT NULL DEFAULT CURRENT_DATE,
  muscle_name   text NOT NULL,
  side          text CHECK (side IN ('D', 'E', 'BD')),
  unit          text NOT NULL DEFAULT 'kgf',
  measure_1     numeric(7,2),
  measure_2     numeric(7,2),
  measure_3     numeric(7,2),
  average       numeric(7,2),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.muscle_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "muscle_evaluations_select" ON public.muscle_evaluations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "muscle_evaluations_insert" ON public.muscle_evaluations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.fisio_profiles WHERE id = auth.uid())
  );

CREATE POLICY "muscle_evaluations_update" ON public.muscle_evaluations
  FOR UPDATE TO authenticated
  USING (
    fisio_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.fisio_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "muscle_evaluations_delete" ON public.muscle_evaluations
  FOR DELETE TO authenticated
  USING (
    fisio_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.fisio_profiles WHERE id = auth.uid() AND role = 'admin')
  );
