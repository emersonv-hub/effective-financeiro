-- ============================================================
-- FisioManager — Seed de dados de teste
-- Execute APÓS criar os usuários via Supabase Auth
-- e APÓS rodar 001_initial_schema.sql
-- ============================================================

-- ─── PASSO 1: Criar usuários no Auth (via dashboard ou Admin API) ─
-- email: admin@effective.com.br   / senha: Effective2024!  → role: admin
-- email: carlos@effective.com.br  / senha: Effective2024!  → role: fisioterapeuta
-- email: ana@effective.com.br     / senha: Effective2024!  → role: fisioterapeuta

-- ─── PASSO 2: Atualizar fisio_profiles com dados completos ───────
-- (substitua os UUIDs pelos IDs reais gerados no passo 1)

-- Exemplo — substitua os UUIDs abaixo pelos reais:
/*
UPDATE public.fisio_profiles SET
  full_name = 'Dr. Carlos Eduardo Ramos',
  phone     = '(16) 99900-1111',
  crefito   = 'CREFITO-3 123456-F',
  color     = '#2250fc',
  role      = 'admin'
WHERE email = 'admin@effective.com.br';

UPDATE public.fisio_profiles SET
  full_name = 'Dra. Ana Paula Souza',
  phone     = '(16) 99900-2222',
  crefito   = 'CREFITO-3 234567-F',
  color     = '#10b981',
  role      = 'fisioterapeuta'
WHERE email = 'ana@effective.com.br';

UPDATE public.fisio_profiles SET
  full_name = 'Dr. Bruno Lima Costa',
  phone     = '(16) 99900-3333',
  crefito   = 'CREFITO-3 345678-F',
  color     = '#f59e0b',
  role      = 'fisioterapeuta'
WHERE email = 'carlos@effective.com.br';
*/

-- ─── PASSO 3: Pacientes ──────────────────────────────────────────
INSERT INTO public.patients (full_name, cpf, birth_date, phone, email, gender, diagnosis, city, health_plan, active) VALUES
('Maria Silva Santos',    '123.456.789-01', '1985-03-15', '(16) 99999-1111', 'maria@email.com',     'F', 'Lombalgia crônica',            'Ribeirão Preto', NULL,       true),
('João Carlos Oliveira',  '234.567.890-12', '1972-07-22', '(16) 99999-2222', 'joao@email.com',      'M', 'Tendinite de ombro',           'Ribeirão Preto', 'Unimed',   true),
('Ana Paula Ferreira',    '345.678.901-23', '1990-11-08', '(16) 99999-3333', 'ana.p@email.com',     'F', 'Pós-op LCA joelho direito',    'Ribeirão Preto', 'Amil',     true),
('Roberto Mendes Costa',  '456.789.012-34', '1968-05-30', '(16) 99999-4444', NULL,                  'M', 'Hérnia de disco L4-L5',        'Sertãozinho',    NULL,       true),
('Fernanda Lima Barros',  '567.890.123-45', '1995-09-12', '(16) 99999-5555', 'fer@email.com',       'F', 'Fascite plantar bilateral',    'Ribeirão Preto', 'Bradesco', true),
('Carlos Eduardo Rocha',  '678.901.234-56', '1980-01-25', '(16) 99999-6666', NULL,                  'M', 'Cervicalgia e braquialgia',    'Ribeirão Preto', NULL,       true),
('Patricia Souza Nunes',  '789.012.345-67', '1988-04-17', '(16) 99999-7777', 'pati@email.com',      'F', 'Bursite trocantérica',         'Pradópolis',     'Unimed',   true),
('Marcos Vinícius Alves', '890.123.456-78', '1975-12-03', '(16) 99999-8888', NULL,                  'M', 'Síndrome do túnel do carpo',   'Ribeirão Preto', NULL,       true),
('Juliana Castro Melo',   '901.234.567-89', '1993-08-19', '(16) 99999-9999', 'juliana@email.com',   'F', 'Fibromialgia — dor crônica',   'Ribeirão Preto', NULL,       true),
('André Luís Martins',    '012.345.678-90', '1965-06-28', '(16) 98888-0000', 'andre@email.com',     'M', 'Pós-op PTJ joelho esquerdo',   'Ribeirão Preto', 'Amil',     true);
