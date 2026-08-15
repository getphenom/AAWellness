# Supabase setup — do this once

Everything is written and waiting. When your Supabase account exists, this
takes about ten minutes.

---

## 1. Create the project

[supabase.com](https://supabase.com) → **New project**.

- **Region:** pick the one closest to Puerto Rico (`us-east-1`).
- **Database password:** save it in a password manager. You will rarely need it,
  but it cannot be recovered — only reset.

Wait for provisioning to finish (~2 min).

## 2. Create the tables

Left sidebar → **SQL Editor** → **New query**.

1. Paste the whole of `schema.sql`, press **Run**.
2. New query, paste the whole of `seed.sql`, press **Run**.

`schema.sql` creates the tables, the security policies and the triggers.
`seed.sql` loads your 7 services and 8 document templates. Both are safe to
re-run — they update rather than duplicate.

**Check it worked:** Table Editor should show `patients`, `documents`,
`signatures`, `services`, and the rest, each with a green **RLS enabled** badge.
If any table lacks that badge, stop and re-run `schema.sql`.

## 3. Connect the app

Project Settings → **API**. Copy two values into `app/js/config.js`:

```js
export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

Commit and push. That is the whole deploy.

> The `anon` key is *meant* to be public — it identifies the project, it does
> not grant access. Row Level Security decides what each signed-in user can see.
>
> **Never** put the `service_role` key in this file. That key bypasses all
> security. It belongs on a server, never in a browser.

## 4. Make yourself the owner

Open `app/index.html`, create an account with your real email.

Every new signup becomes a **patient** by default — nobody can make themselves
staff. Promote yourself once, by hand:

SQL Editor → New query:

```sql
update public.profiles
   set role = 'owner'
 where email = 'tu@correo.com';   -- your email
```

Sign out and back in. You now land on the clinic console.

## 5. Email settings

Authentication → Providers → Email.

- **Confirm email** ON is safer, but every new patient must click a link before
  they can sign in. Supabase's built-in mailer is rate-limited and only really
  suitable for testing — for real patient volume, connect your own SMTP under
  Authentication → Emails → SMTP Settings.
- Turning confirmation OFF makes onboarding smoother but lets anyone register
  with an email they do not own. For health records, leave it ON.

## 6. Try it end to end

1. In the clinic console, **+ Nuevo paciente** — use a second email you control.
2. Assign that patient a consent document.
3. Sign out. Register with that second email.
4. You land on the patient portal, see the document, read it, tick the box, sign.
5. Sign back in as owner — the signature is there, with name and date.

The account links automatically because the trigger matches on email address.
If it does not link, the email on the patient record does not match the one
used to register.

---

## How access is enforced

Not in JavaScript. The front end is static and anyone can read it — so it is
not trusted with security at all. Every rule lives in the database:

| Rule | Enforced by |
| --- | --- |
| A patient sees only their own records | RLS policies on every table |
| A patient cannot sign someone else's document | `signatures_insert` policy |
| A patient cannot make themselves staff | `profiles_self_update` check |
| Signatures cannot be edited or deleted | No update/delete policy exists |
| Anonymous visitors see nothing | Every policy requires a session |

Verified against a real Postgres 16 instance before release: 18 adversarial
tests, every attack refused, every legitimate action allowed. See
`_test_rls.sql` — you can run it yourself against a local Postgres.

## Files

| File | Purpose |
| --- | --- |
| `schema.sql` | Tables, RLS policies, triggers. Run first. |
| `seed.sql` | Services and document templates. Run second. Generated from the app source. |
| `_test_shim.sql` | Local-only. Fakes Supabase's `auth` schema so the tests can run on plain Postgres. **Never run in Supabase.** |
| `_test_rls.sql` | The adversarial security tests. Local only. |

## Still open

- Contact details and hours are empty until the website content arrives (AAWELLNESS-6).
- Clover payment links are set per service in the clinic console (AAWELLNESS-7).
- Consent templates are drafts and need clinical + legal review before real
  patients sign them (AAWELLNESS-10).
- File uploads need a Supabase Storage bucket with matching policies — not yet built.
