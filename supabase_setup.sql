-- COPIE E COLE ESTE CÓDIGO NO SQL EDITOR DO SUPABASE (https://supabase.com/dashboard/project/npjodvblunmbdtkbndsq/sql)

-- 1. Cria a tabela de Perfis de Usuário (vinculada aos logins)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  is_admin boolean default false,
  max_credits int default 3,
  usage_count int default 0,
  created_at timestamptz default now()
);

-- 2. Cria a tabela de Análises (onde ficam os resultados dos currículos)
create table public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  candidate_name text,
  job_title text,
  result jsonb,
  created_at timestamptz default now()
);

-- 3. Habilita segurança (Row Level Security)
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

-- 4. Cria políticas de acesso (Quem pode ver/editar o quê)

-- Perfis: Usuários podem ver seu próprio perfil. Admin pode ver todos.
-- (Simplificado para permitir leitura pública de perfis autenticados para facilitar admin dashboard)
create policy "Perfis visíveis para usuários autenticados" 
on public.profiles for select 
to authenticated 
using (true);

-- Perfis: Usuários podem criar seu próprio perfil (durante o cadastro)
create policy "Usuários podem criar seu perfil" 
on public.profiles for insert 
to authenticated 
with check (auth.uid() = id);

-- Perfis: Usuários podem editar seu próprio perfil
create policy "Usuários podem editar seu perfil" 
on public.profiles for update 
to authenticated 
using (auth.uid() = id);

-- Análises: Usuários só podem ver e criar suas próprias análises
create policy "Usuários gerenciam suas análises" 
on public.analyses for all 
to authenticated 
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. Bucket de Storage (Opcional, se formos salvar o PDF no futuro, por enquanto salvamos base64 no banco localmente ou processamos em memória)
-- insert into storage.buckets (id, name) values ('resumes', 'resumes');
