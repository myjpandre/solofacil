-- =====================================================
-- SoloFácil — Schema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Dashboard → SQL Editor → New query → colar e "Run").
-- =====================================================

-- Extensão usada para gerar UUIDs (geralmente já vem habilitada no Supabase)
create extension if not exists "pgcrypto";

-- =====================================================
-- Tabela: propriedades
-- =====================================================
create table if not exists public.propriedades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  municipio text not null,
  area_ha numeric not null check (area_ha > 0),
  cultura text not null default 'milho',
  produtividade_esperada numeric not null check (produtividade_esperada > 0),
  created_at timestamptz not null default now()
);

alter table public.propriedades enable row level security;

drop policy if exists "propriedades_select_own" on public.propriedades;
create policy "propriedades_select_own"
  on public.propriedades for select
  using (auth.uid() = user_id);

drop policy if exists "propriedades_insert_own" on public.propriedades;
create policy "propriedades_insert_own"
  on public.propriedades for insert
  with check (auth.uid() = user_id);

drop policy if exists "propriedades_update_own" on public.propriedades;
create policy "propriedades_update_own"
  on public.propriedades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "propriedades_delete_own" on public.propriedades;
create policy "propriedades_delete_own"
  on public.propriedades for delete
  using (auth.uid() = user_id);

-- =====================================================
-- Tabela: diagnosticos
-- Guarda o resultado completo do motor de regras (lib/motor.ts)
-- em colunas jsonb, vinculado à propriedade e ao usuário.
-- =====================================================
create table if not exists public.diagnosticos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  propriedade_id uuid not null references public.propriedades (id) on delete cascade,
  dados_solo jsonb not null,
  diagnostico jsonb not null,
  recomendacao jsonb not null,
  custo jsonb not null,
  gerado_em timestamptz not null default now()
);

create index if not exists diagnosticos_user_id_idx on public.diagnosticos (user_id);
create index if not exists diagnosticos_propriedade_id_idx on public.diagnosticos (propriedade_id);

alter table public.diagnosticos enable row level security;

drop policy if exists "diagnosticos_select_own" on public.diagnosticos;
create policy "diagnosticos_select_own"
  on public.diagnosticos for select
  using (auth.uid() = user_id);

drop policy if exists "diagnosticos_insert_own" on public.diagnosticos;
create policy "diagnosticos_insert_own"
  on public.diagnosticos for insert
  with check (auth.uid() = user_id);

drop policy if exists "diagnosticos_delete_own" on public.diagnosticos;
create policy "diagnosticos_delete_own"
  on public.diagnosticos for delete
  using (auth.uid() = user_id);

-- =====================================================
-- Pronto! Depois de rodar este script:
-- 1. Vá em Authentication → Providers e confirme que "Email" está habilitado.
-- 2. (Opcional, recomendado em dev) Em Authentication → Settings,
--    desative "Confirm email" para poder logar imediatamente após o cadastro.
-- 3. Copie a Project URL e a anon public key em
--    Project Settings → API, e coloque no seu .env.local
--    (veja o arquivo .env.local.example).
-- =====================================================
