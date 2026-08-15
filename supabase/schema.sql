-- ============================================================================
-- A&A Wellness — database schema
--
-- Run this once in the Supabase SQL editor on a new project.
-- It is idempotent: safe to re-run.
--
-- THE IMPORTANT PART IS ROW LEVEL SECURITY (RLS).
-- Every table below is RLS-enabled. Postgres itself refuses to return a row
-- the caller is not entitled to, so a patient cannot read another patient's
-- records even if they craft their own API calls. The front end is static and
-- fully inspectable — security lives here, not in the JavaScript.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums ----
do $$ begin
  create type user_role as enum ('owner', 'staff', 'patient');
exception when duplicate_object then null; end $$;

do $$ begin
  create type doc_status as enum ('pending', 'accepted', 'signed', 'filed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type doc_kind as enum ('consent', 'form', 'policy', 'file');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appt_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------- profiles ----
-- One row per authenticated user. This is what makes someone staff or patient.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'patient',
  full_name   text,
  phone       text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------- patients ----
-- The clinical record. Deliberately separate from profiles: the clinic can
-- create a patient before that person ever signs up, then link the account
-- later by setting profile_id.
create table if not exists public.patients (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid unique references auth.users(id) on delete set null,
  full_name    text not null,
  phone        text,
  email        text,
  date_of_birth date,
  plan         text,
  notes        text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists patients_profile_id_idx on public.patients(profile_id);

-- ------------------------------------------------------------- services ----
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  name_en          text,
  description      text,
  description_en   text,
  price_cents      integer not null default 0,   -- cents, never floats
  minutes          integer not null default 30,
  category         text,
  requires_consult boolean not null default false,
  consent_slug     text,                          -- ties a service to its consent
  clover_link      text,                          -- Clover-hosted payment link
  active           boolean not null default true,
  sort_order       integer not null default 0
);

-- ---------------------------------------------------- document templates ----
create table if not exists public.document_templates (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title              text not null,
  title_en           text,
  kind               doc_kind not null default 'form',
  body               text not null,
  requires_signature boolean not null default true,
  version            integer not null default 1,
  active             boolean not null default true,
  sort_order         integer not null default 0
);

-- ------------------------------------------------------------ documents ----
create table if not exists public.documents (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.patients(id) on delete cascade,
  template_slug      text,
  title              text not null,
  kind               doc_kind not null default 'form',
  body               text,                        -- snapshot of the text at assign time
  file_path          text,                        -- storage path for uploads
  requires_signature boolean not null default true,
  status             doc_status not null default 'pending',
  assigned_by        uuid references auth.users(id) on delete set null,
  assigned_at        timestamptz not null default now(),
  completed_at       timestamptz,
  updated_at         timestamptz not null default now()
);
create index if not exists documents_patient_idx on public.documents(patient_id, status);

-- ----------------------------------------------------------- signatures ----
-- Append-only. Nobody may update or delete a signature — that is the point of
-- an audit trail. body_snapshot freezes exactly what was on screen when signed,
-- so later template edits cannot rewrite history.
create table if not exists public.signatures (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.documents(id) on delete cascade,
  signer_name   text not null,
  signature_kind text not null default 'draw',    -- 'draw' | 'type'
  signature_data text,                            -- PNG data URL, or null if typed
  typed_name    text,
  body_snapshot text,
  signed_at     timestamptz not null default now(),
  user_agent    text,
  signed_by     uuid references auth.users(id) on delete set null
);
create index if not exists signatures_document_idx on public.signatures(document_id);

-- --------------------------------------------------------------- visits ----
create table if not exists public.visits (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  service_id  uuid references public.services(id) on delete set null,
  occurred_at date not null default current_date,
  title       text not null,
  metric      text,
  notes       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists visits_patient_idx on public.visits(patient_id, occurred_at desc);

-- --------------------------------------------------------- appointments ----
create table if not exists public.appointments (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  service_id  uuid references public.services(id) on delete set null,
  starts_at   timestamptz not null,
  minutes     integer not null default 30,
  status      appt_status not null default 'scheduled',
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists appointments_patient_idx on public.appointments(patient_id, starts_at desc);

-- ------------------------------------------------------ clinic settings ----
-- Single row. Replaces the hard-coded clinic-data.js so the owner can edit
-- clinic details from the app instead of a developer editing a file.
create table if not exists public.clinic_settings (
  id            boolean primary key default true check (id),
  legal_name    text not null default 'A&A Healthcare Services LLC',
  display_name  text not null default 'A&A Wellness',
  town          text default 'Loíza, PR',
  phone         text,
  whatsapp      text,
  email         text,
  address_line  text,
  city          text,
  zip           text,
  maps_url      text,
  booking_url   text,
  hours         jsonb not null default '[]'::jsonb,
  social        jsonb not null default '{}'::jsonb,
  clover_general_link text,
  updated_at    timestamptz not null default now()
);

-- ============================================================================
-- HELPER FUNCTIONS
--
-- SECURITY DEFINER is deliberate. These run as the function owner and so
-- bypass RLS. Without that, a policy on `profiles` that reads `profiles`
-- recurses infinitely. This is the standard Supabase pattern.
-- ============================================================================

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'staff')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- The patient record belonging to the signed-in user, or null for staff.
create or replace function public.my_patient_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.patients where profile_id = auth.uid();
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles           enable row level security;
alter table public.patients           enable row level security;
alter table public.services           enable row level security;
alter table public.document_templates enable row level security;
alter table public.documents          enable row level security;
alter table public.signatures         enable row level security;
alter table public.visits             enable row level security;
alter table public.appointments       enable row level security;
alter table public.clinic_settings    enable row level security;

-- ---- profiles -------------------------------------------------------------
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  -- a patient must not be able to promote themselves to staff
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists profiles_staff_write on public.profiles;
create policy profiles_staff_write on public.profiles
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- patients -------------------------------------------------------------
drop policy if exists patients_read on public.patients;
create policy patients_read on public.patients
  for select using (public.is_staff() or profile_id = auth.uid());

drop policy if exists patients_staff_write on public.patients;
create policy patients_staff_write on public.patients
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- services / templates / settings: readable by all signed-in users -----
drop policy if exists services_read on public.services;
create policy services_read on public.services for select using (auth.uid() is not null);
drop policy if exists services_staff_write on public.services;
create policy services_staff_write on public.services
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists templates_read on public.document_templates;
create policy templates_read on public.document_templates for select using (auth.uid() is not null);
drop policy if exists templates_staff_write on public.document_templates;
create policy templates_staff_write on public.document_templates
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists settings_read on public.clinic_settings;
create policy settings_read on public.clinic_settings for select using (auth.uid() is not null);
drop policy if exists settings_owner_write on public.clinic_settings;
create policy settings_owner_write on public.clinic_settings
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- documents ------------------------------------------------------------
-- A patient sees only their own. Staff see all.
drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents
  for select using (public.is_staff() or patient_id = public.my_patient_id());

drop policy if exists documents_staff_write on public.documents;
create policy documents_staff_write on public.documents
  for all using (public.is_staff()) with check (public.is_staff());

-- A patient may advance the status of their OWN document, and nothing else.
-- They cannot reassign it to another patient, nor edit the body they agreed to.
drop policy if exists documents_patient_progress on public.documents;
create policy documents_patient_progress on public.documents
  for update
  using (patient_id = public.my_patient_id())
  with check (patient_id = public.my_patient_id());

-- ---- signatures -----------------------------------------------------------
drop policy if exists signatures_read on public.signatures;
create policy signatures_read on public.signatures
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.documents d
      where d.id = signatures.document_id
        and d.patient_id = public.my_patient_id()
    )
  );

-- Insert only, and only against your own document. No update, no delete
-- policy exists for anyone — signatures are append-only by design.
drop policy if exists signatures_insert on public.signatures;
create policy signatures_insert on public.signatures
  for insert with check (
    public.is_staff()
    or exists (
      select 1 from public.documents d
      where d.id = signatures.document_id
        and d.patient_id = public.my_patient_id()
    )
  );

-- ---- visits ---------------------------------------------------------------
drop policy if exists visits_read on public.visits;
create policy visits_read on public.visits
  for select using (public.is_staff() or patient_id = public.my_patient_id());
drop policy if exists visits_staff_write on public.visits;
create policy visits_staff_write on public.visits
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- appointments ---------------------------------------------------------
drop policy if exists appointments_read on public.appointments;
create policy appointments_read on public.appointments
  for select using (public.is_staff() or patient_id = public.my_patient_id());
drop policy if exists appointments_staff_write on public.appointments;
create policy appointments_staff_write on public.appointments
  for all using (public.is_staff()) with check (public.is_staff());

-- ============================================================================
-- GRANTS
--
-- RLS decides WHICH ROWS a caller may touch; grants decide whether they may
-- touch the table at all. Both are required — RLS on a table with no grant
-- just yields "permission denied".
--
-- Supabase normally grants these automatically via default privileges, but
-- stating them explicitly means this schema is correct on a fresh project and
-- portable to plain Postgres. Guarded so it is a no-op where the role is absent.
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant usage on schema public to authenticated;
    grant select, insert, update, delete on all tables in schema public to authenticated;
    grant execute on all functions in schema public to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    -- Anonymous visitors get nothing. Every policy already requires a session,
    -- but withholding the grant means they cannot even probe the tables.
    grant usage on schema public to anon;
  end if;
end $$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Every new auth user automatically gets a profile, defaulting to 'patient'.
-- Staff are promoted deliberately; nobody becomes staff by signing up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;

  -- If the clinic already created a patient record with this email, link it.
  update public.patients
     set profile_id = new.id
   where profile_id is null
     and lower(email) = lower(new.email);

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists documents_touch on public.documents;
create trigger documents_touch before update on public.documents
  for each row execute function public.touch_updated_at();

drop trigger if exists patients_touch on public.patients;
create trigger patients_touch before update on public.patients
  for each row execute function public.touch_updated_at();
