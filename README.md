# effective FisioManager

Sistema completo de gestão para clínicas de fisioterapia — Effective Fisioterapia, Ribeirão Preto.

## Módulos

| Módulo | Funcionalidades |
|--------|----------------|
| **Agenda** | FullCalendar semanal/mensal, drag & drop, conflito de horários, recorrência |
| **Pacientes** | Cadastro completo, ficha com histórico de sessões e pagamentos, export PDF |
| **Presença** | Check-in/check-out, evolução clínica, contador automático de sessões |
| **Financeiro** | Pagamentos à vista/parcelado, despesas por categoria, controle de status |
| **Relatórios** | Diário, semanal e mensal com gráficos Recharts + export PDF |
| **Configurações** | Perfil, cor na agenda compartilhada, gestão de equipe |

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router v6 · Zustand · Supabase · FullCalendar · Recharts · jsPDF · React Hook Form + Zod

## Primeiro uso

### 1. Instalar
```bash
git clone https://github.com/emersonv-hub/effective-fisio-manager.git
cd effective-fisio-manager && npm install
```

### 2. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. SQL Editor → rode `supabase/migrations/001_initial_schema.sql`
3. (Opcional) rode `supabase/seed.sql` para dados de exemplo

### 3. .env
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Rodar
```bash
npm run dev   # http://localhost:3000
npm run build # produção
```

## Papéis

| Papel | Acesso |
|-------|--------|
| **Admin** | Total |
| **Fisioterapeuta** | Seus agendamentos, pacientes e financeiro |
| **Recepcionista** | Agenda e pacientes (sem financeiro) |

> O primeiro usuário criado é automaticamente **Admin**.

## Deploy

Importe `emersonv-hub/effective-fisio-manager` no [Vercel](https://vercel.com/new) ou [Lovable](https://lovable.dev) e adicione as variáveis de ambiente.

© 2026 Effective Fisioterapia
