-- =============================================
-- Job Hunter — Migración inicial
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- Tabla de perfiles (one-to-one con auth.users)
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  nombre            text not null default '',
  stack             text[] not null default '{}',
  nivel_ingles      text not null default 'B2',
  paises_objetivo   text[] not null default '{}',
  cv_base_url       text,
  anios_experiencia int not null default 0,
  updated_at        timestamptz not null default now()
);

-- Tabla de ofertas de empleo
create table if not exists public.jobs (
  id                uuid primary key default gen_random_uuid(),
  fuente            text not null check (fuente in ('remotive','adzuna','arbeitnow')),
  titulo            text not null,
  empresa           text not null,
  pais              text not null default '',
  url               text not null unique,
  descripcion       text not null default '',
  tags              text[] not null default '{}',
  remoto            boolean not null default true,
  salario_min       int,
  salario_max       int,
  moneda            text,
  score             int not null default 0,
  fecha_publicacion date not null default current_date,
  fecha_scrape      timestamptz not null default now()
);

-- Tabla de aplicaciones
create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  job_id           text not null,
  estado           text not null default 'preparando'
                     check (estado in ('preparando','enviada','en_proceso','rechazada','oferta')),
  fecha_aplicacion date not null default current_date,
  cv_usado_url     text,
  notas            text,
  created_at       timestamptz not null default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

create policy "Usuarios ven su propio perfil"
  on public.profiles for all
  using (auth.uid() = id);

create policy "Usuarios ven sus aplicaciones"
  on public.applications for all
  using (auth.uid() = user_id);

create policy "Lectura pública de ofertas"
  on public.jobs for select
  using (true);

-- =============================================
-- Trigger: crear perfil al registrarse
-- =============================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
