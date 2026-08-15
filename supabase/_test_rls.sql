-- ============================================================================
-- RLS TEST SUITE
-- Deliberately adversarial: each test tries to DO something it should not be
-- allowed to do. A passing run means Postgres refused.
-- ============================================================================
\set ON_ERROR_STOP off
\pset pager off
\pset tuples_only on

-- ---------------------------------------------------------------- fixtures --
set role postgres;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000aa', 'owner@aa.test'),
  ('00000000-0000-0000-0000-0000000000bb', 'danielle@aa.test'),
  ('00000000-0000-0000-0000-0000000000cc', 'keila@aa.test')
on conflict do nothing;

update public.profiles set role = 'owner' where id = '00000000-0000-0000-0000-0000000000aa';

insert into public.patients (id, profile_id, full_name, email) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000bb', 'Danielle Porter', 'danielle@aa.test'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000cc', 'Keila Belén', 'keila@aa.test')
on conflict do nothing;

insert into public.documents (id, patient_id, title, kind, body, requires_signature) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Consentimiento IV (Danielle)', 'consent', 'texto', true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Consentimiento IV (Keila)', 'consent', 'texto', true)
on conflict do nothing;

\echo ''
\echo '=============== RUNNING AS DANIELLE (patient) ==============='
set role app_user;
set test.user_id = '00000000-0000-0000-0000-0000000000bb';

\echo '-- 1. sees own patient row only (expect exactly 1: Danielle)'
select '   -> ' || coalesce(string_agg(full_name, ', '), 'NONE') from public.patients;

\echo '-- 2. sees own documents only (expect 1, Danielle''s)'
select '   -> ' || coalesce(string_agg(title, ', '), 'NONE') from public.documents;

\echo '-- 3. targeted read of Keila''s document by id (expect 0 rows)'
select '   -> rows: ' || count(*) from public.documents
 where id = '20000000-0000-0000-0000-000000000002';

\echo '-- 4. ATTACK: update Keila''s document (expect 0 rows updated)'
with x as (
  update public.documents set status = 'signed'
   where id = '20000000-0000-0000-0000-000000000002' returning 1)
select '   -> rows affected: ' || count(*) from x;

\echo '-- 5. ATTACK: sign Keila''s document (expect policy violation)'
insert into public.signatures (document_id, signer_name) values
  ('20000000-0000-0000-0000-000000000002', 'Danielle (impostor)');

\echo '-- 6. legitimately sign OWN document (expect success)'
insert into public.signatures (document_id, signer_name, typed_name, body_snapshot)
values ('20000000-0000-0000-0000-000000000001', 'Danielle Porter', 'Danielle Porter', 'texto');
\echo '   -> own signatures visible:'
select '   -> ' || count(*) from public.signatures;

\echo '-- 7. ATTACK: promote self to staff (expect 0 rows / violation)'
with x as (
  update public.profiles set role = 'owner'
   where id = '00000000-0000-0000-0000-0000000000bb' returning 1)
select '   -> rows affected: ' || count(*) from x;
\echo '   -> role now:'
select '   -> ' || role from public.profiles where id = '00000000-0000-0000-0000-0000000000bb';

\echo '-- 8. ATTACK: create a patient record (staff-only, expect violation)'
insert into public.patients (full_name) values ('Fake Patient');

\echo '-- 9. ATTACK: delete a signature (append-only, expect 0 rows)'
with x as (delete from public.signatures returning 1)
select '   -> rows deleted: ' || count(*) from x;

\echo '-- 10. ATTACK: reassign own doc to Keila (expect violation/0)'
with x as (
  update public.documents
     set patient_id = '10000000-0000-0000-0000-000000000002'
   where id = '20000000-0000-0000-0000-000000000001' returning 1)
select '   -> rows affected: ' || count(*) from x;

\echo ''
\echo '=============== RUNNING AS OWNER (staff) ==============='
set test.user_id = '00000000-0000-0000-0000-0000000000aa';

\echo '-- 11. staff sees all patients (expect 2)'
select '   -> ' || count(*) from public.patients;

\echo '-- 12. staff sees all documents (expect 2)'
select '   -> ' || count(*) from public.documents;

\echo '-- 13. staff sees the signature Danielle made (expect 1)'
select '   -> ' || count(*) from public.signatures;

\echo '-- 14. staff can assign a new document (expect success)'
insert into public.documents (patient_id, title, kind, body)
values ('10000000-0000-0000-0000-000000000002', 'Nuevo formulario', 'form', 'texto');
select '   -> documents now: ' || count(*) from public.documents;

\echo ''
\echo '=============== RUNNING AS ANONYMOUS (no login) ==============='
set test.user_id = '';

\echo '-- 15. anonymous sees no patients (expect 0)'
select '   -> ' || count(*) from public.patients;
\echo '-- 16. anonymous sees no documents (expect 0)'
select '   -> ' || count(*) from public.documents;
\echo '-- 17. anonymous sees no services (expect 0)'
select '   -> ' || count(*) from public.services;
\echo '-- 18. anonymous sees no signatures (expect 0)'
select '   -> ' || count(*) from public.signatures;

reset role;
