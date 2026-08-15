-- ============================================================================
-- LOCAL TEST SHIM — not for Supabase.
--
-- Supabase provides the `auth` schema, `auth.users`, and `auth.uid()`.
-- This recreates just enough of it to run schema.sql against a plain Postgres
-- and exercise the RLS policies. Supabase derives auth.uid() from the JWT;
-- here it reads a session GUC we can set per test.
-- ============================================================================

create schema if not exists auth;

create table if not exists auth.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique,
  raw_user_meta_data  jsonb default '{}'::jsonb,
  created_at          timestamptz default now()
);

-- Mirrors Supabase: null when nobody is signed in.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('test.user_id', true), '')::uuid;
$$;

-- A non-superuser role that RLS actually applies to. (RLS is bypassed for
-- superusers and table owners, so testing as postgres would prove nothing.)
do $$ begin
  create role app_user nologin;
exception when duplicate_object then null; end $$;

grant usage on schema public, auth to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant select on auth.users to app_user;
grant execute on all functions in schema public, auth to app_user;
