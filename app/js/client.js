/* ============================================================================
   client.js — Supabase client, session, and role routing.

   The role decides the view. Not the URL, not a button. If a patient opens
   clinic.html they are redirected out, and even if they defeated that, the
   database would return them nothing (see supabase/schema.sql).
   ========================================================================= */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from "./config.js?v=1786828255";

export const configured = isConfigured();

export const supabase = configured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;

/* ---- session -------------------------------------------------------- */

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

/* Profile carries the role. Cached per page load — it does not change mid-session. */
let _profile = null;
export async function getProfile({ refresh = false } = {}) {
  if (_profile && !refresh) return _profile;
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Could not load profile:", error.message);
    return null;
  }
  _profile = data;
  return _profile;
}

export const isStaff = (p) => !!p && (p.role === "owner" || p.role === "staff");

/* ---- auth actions --------------------------------------------------- */

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: friendly(error) } : { ok: true };
}

export async function signUp(email, password, fullName) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  return error ? { ok: false, message: friendly(error) } : { ok: true };
}

export async function sendReset(email) {
  const redirectTo = new URL("./index.html", location.href).href;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return error ? { ok: false, message: friendly(error) } : { ok: true };
}

export async function signOut() {
  _profile = null;
  if (supabase) await supabase.auth.signOut();
  location.replace("./index.html");
}

/* Supabase messages are in English and often terse. */
function friendly(error) {
  const m = (error && error.message) || "";
  if (/Invalid login credentials/i.test(m)) return "Correo o contraseña incorrectos.";
  if (/Email not confirmed/i.test(m)) return "Confirma tu correo antes de entrar. Revisa tu bandeja.";
  if (/User already registered/i.test(m)) return "Ya existe una cuenta con ese correo.";
  if (/Password should be at least/i.test(m)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/rate limit|too many/i.test(m)) return "Demasiados intentos. Espera un momento.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "Sin conexión con el servidor. Revisa tu internet.";
  return m || "Algo salió mal. Inténtalo de nuevo.";
}

/* ---- page guards ----------------------------------------------------
   Call at the top of a protected page. Sends the wrong audience away
   before any data is requested.                                        */

export async function requireRole(want /* 'staff' | 'patient' */) {
  if (!configured) { location.replace("./index.html"); return null; }

  const session = await getSession();
  if (!session) { location.replace("./index.html"); return null; }

  const profile = await getProfile();
  if (!profile) { location.replace("./index.html"); return null; }

  const staff = isStaff(profile);
  if (want === "staff" && !staff) { location.replace("./portal.html"); return null; }
  if (want === "patient" && staff) { location.replace("./clinic.html"); return null; }

  return profile;
}

/* Where should this user land? */
export const homeFor = (profile) => (isStaff(profile) ? "./clinic.html" : "./portal.html");
