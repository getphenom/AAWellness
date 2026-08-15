/* ============================================================================
   config.js — the ONLY file you edit to connect this app to Supabase.

   Once your project exists:
     Supabase dashboard → Project Settings → API
     Copy "Project URL"  → SUPABASE_URL
     Copy "anon public"  → SUPABASE_ANON_KEY

   Is it safe to put the anon key in public JavaScript? Yes — that is exactly
   what it is for. It identifies the project, it does not grant access. Every
   query still runs through Row Level Security, so the database decides what
   each signed-in user may see.

   The key that must NEVER appear here is the `service_role` key. That one
   bypasses RLS entirely. It belongs only on a server, never in a browser.
   ========================================================================= */

export const SUPABASE_URL = "";       // e.g. https://abcdefgh.supabase.co
export const SUPABASE_ANON_KEY = "";  // starts with "eyJ..."

export const isConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
