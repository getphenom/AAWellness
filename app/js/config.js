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

export const SUPABASE_URL = "https://ldzvxhchpuebiejppceu.supabase.co";

/* The legacy `anon` key. Deliberately chosen over the newer
   `sb_publishable_...` key because supabase-js is pinned at 2.47.10, which
   predates publishable-key support. If you upgrade supabase-js, you can swap
   in the publishable key (it rotates independently, which is nicer). */
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkenZ4aGNocHVlYmllanBwY2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTIzMTMsImV4cCI6MjEwMjM4ODMxM30.40bJWow5cH_Bi1iUjtJyc7CPH7oggDFRvWcYSDtZb6U";

export const isConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
