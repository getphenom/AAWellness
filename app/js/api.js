/* ============================================================================
   api.js — every database call lives here.

   Nothing in this file enforces permissions, and it does not try to. The
   database does that (supabase/schema.sql). These functions ask plainly for
   what they want; RLS returns only what the caller is entitled to. That is
   why the patient and clinic views can share the same query helpers safely.
   ========================================================================= */

import { supabase } from "./client.js?v=202608152025";

const unwrap = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

/* ---- clinic settings & services ------------------------------------- */

export const getClinic = () =>
  supabase.from("clinic_settings").select("*").maybeSingle().then(unwrap);

export const getServices = () =>
  supabase.from("services").select("*").eq("active", true)
    .order("sort_order").then(unwrap);

export const saveClinic = (patch) =>
  supabase.from("clinic_settings").update(patch).eq("id", true).select().single().then(unwrap);

export const saveService = (id, patch) =>
  supabase.from("services").update(patch).eq("id", id).select().single().then(unwrap);

/* ---- patients -------------------------------------------------------- */

export const listPatients = () =>
  supabase.from("patients").select("*").eq("active", true)
    .order("full_name").then(unwrap);

export const getPatient = (id) =>
  supabase.from("patients").select("*").eq("id", id).single().then(unwrap);

/* A patient's own record. RLS means this returns exactly one row for a
   patient and nothing for anyone else. */
export const getMyPatient = () =>
  supabase.from("patients").select("*").maybeSingle().then(unwrap);

export const createPatient = (row) =>
  supabase.from("patients").insert(row).select().single().then(unwrap);

export const updatePatient = (id, patch) =>
  supabase.from("patients").update(patch).eq("id", id).select().single().then(unwrap);

/* ---- document templates ---------------------------------------------- */

export const listTemplates = () =>
  supabase.from("document_templates").select("*").eq("active", true)
    .order("sort_order").then(unwrap);

/* ---- documents -------------------------------------------------------- */

export const listDocuments = (patientId) => {
  let q = supabase.from("documents")
    .select("*, signatures(id, signer_name, typed_name, signature_data, signed_at)")
    .order("assigned_at", { ascending: false });
  if (patientId) q = q.eq("patient_id", patientId);
  return q.then(unwrap);
};

export const getDocument = (id) =>
  supabase.from("documents")
    .select("*, signatures(*)")
    .eq("id", id).single().then(unwrap);

/* Assign a template. The body is COPIED onto the document, not referenced,
   so editing the template later never alters what someone already agreed to. */
export async function assignTemplate(patientId, template, assignedBy) {
  return supabase.from("documents").insert({
    patient_id: patientId,
    template_slug: template.slug,
    title: template.title,
    kind: template.kind,
    body: template.body,
    requires_signature: template.requires_signature,
    assigned_by: assignedBy
  }).select().single().then(unwrap);
}

export const createDocument = (row) =>
  supabase.from("documents").insert(row).select().single().then(unwrap);

export const deleteDocument = (id) =>
  supabase.from("documents").delete().eq("id", id).then(unwrap);

/* ---- patient actions --------------------------------------------------- */

/* Read-only document: acknowledge and file it. */
export const acceptDocument = (id) =>
  supabase.from("documents")
    .update({ status: "filed", completed_at: new Date().toISOString() })
    .eq("id", id).select().single().then(unwrap);

/* Sign: write the signature first, then flip the status. Order matters — if
   the status update failed we would rather have an orphan signature than a
   document marked signed with no signature behind it. */
export async function signDocument(doc, { kind, dataUrl, typedName, signerName, userId }) {
  await supabase.from("signatures").insert({
    document_id: doc.id,
    signer_name: signerName,
    signature_kind: kind,
    signature_data: dataUrl,
    typed_name: typedName,
    body_snapshot: doc.body,          // freeze what was actually on screen
    user_agent: navigator.userAgent,
    signed_by: userId
  }).then(unwrap);

  return supabase.from("documents")
    .update({ status: "signed", completed_at: new Date().toISOString() })
    .eq("id", doc.id).select().single().then(unwrap);
}

/* ---- visits & appointments --------------------------------------------- */

export const listVisits = (patientId) => {
  let q = supabase.from("visits").select("*").order("occurred_at", { ascending: false });
  if (patientId) q = q.eq("patient_id", patientId);
  return q.then(unwrap);
};

export const createVisit = (row) =>
  supabase.from("visits").insert(row).select().single().then(unwrap);

export const listAppointments = (patientId, { upcomingOnly = false } = {}) => {
  let q = supabase.from("appointments")
    .select("*, services(name, minutes)")
    .order("starts_at", { ascending: true });
  if (patientId) q = q.eq("patient_id", patientId);
  if (upcomingOnly) q = q.gte("starts_at", new Date().toISOString());
  return q.then(unwrap);
};

export const createAppointment = (row) =>
  supabase.from("appointments").insert(row).select().single().then(unwrap);

export const updateAppointment = (id, patch) =>
  supabase.from("appointments").update(patch).eq("id", id).select().single().then(unwrap);

export const deleteAppointment = (id) =>
  supabase.from("appointments").delete().eq("id", id).then(unwrap);

/* ---- messages ---------------------------------------------------------- */

export const listMessages = (patientId) => {
  let q = supabase.from("messages")
    .select("*, patients(full_name)")
    .order("created_at", { ascending: true });
  if (patientId) q = q.eq("patient_id", patientId);
  return q.then(unwrap);
};

export const sendMessage = (patientId, body, fromClinic, senderId) =>
  supabase.from("messages").insert({
    patient_id: patientId, body, from_clinic: fromClinic, sender_id: senderId
  }).select().single().then(unwrap);

export const markMessagesRead = (ids) =>
  ids.length
    ? supabase.from("messages").update({ read_at: new Date().toISOString() })
        .in("id", ids).then(unwrap)
    : Promise.resolve(null);

/* ---- aggregate views ---------------------------------------------------
   Deliberately fetched per-table then combined in JS rather than via a view.
   RLS applies to each query, so staff get everything and a patient could only
   ever see their own slice even if these were called from the portal.      */

export async function todaySnapshot() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date();   end.setHours(23, 59, 59, 999);

  const [appts, docs, msgs] = await Promise.all([
    supabase.from("appointments")
      .select("*, patients(full_name), services(name, price_cents)")
      .gte("starts_at", start.toISOString())
      .lte("starts_at", end.toISOString())
      .order("starts_at").then(unwrap),
    supabase.from("documents")
      .select("id, title, status, patient_id, patients(full_name)")
      .in("status", ["pending", "accepted"]).then(unwrap),
    supabase.from("messages")
      .select("id, body, created_at, patient_id, from_clinic, read_at, patients(full_name)")
      .eq("from_clinic", false).is("read_at", null)
      .order("created_at", { ascending: false }).then(unwrap)
  ]);
  return { appts, pendingDocs: docs, unread: msgs };
}

export async function dashboardStats() {
  const since = new Date(); since.setDate(since.getDate() - 30);

  const [patients, docs, visits, appts, services] = await Promise.all([
    supabase.from("patients").select("id, active, created_at").then(unwrap),
    supabase.from("documents").select("id, status, assigned_at").then(unwrap),
    supabase.from("visits").select("id, occurred_at, service_id").then(unwrap),
    supabase.from("appointments")
      .select("id, status, starts_at, minutes, service_id, services(name, price_cents)")
      .then(unwrap),
    supabase.from("services").select("id, name, price_cents").then(unwrap)
  ]);

  const recentVisits = visits.filter((v) => new Date(v.occurred_at) >= since);
  const byService = {};
  for (const v of recentVisits) {
    const s = services.find((x) => x.id === v.service_id);
    const key = s ? s.name : "Sin servicio";
    byService[key] = (byService[key] || 0) + 1;
  }

  const upcoming = appts.filter(
    (a) => new Date(a.starts_at) >= new Date() && a.status !== "cancelled");
  const expected = upcoming.reduce(
    (sum, a) => sum + (a.services?.price_cents || 0), 0);

  return {
    patients: patients.filter((p) => p.active).length,
    newPatients: patients.filter((p) => new Date(p.created_at) >= since).length,
    docsTotal: docs.length,
    docsPending: docs.filter((d) => d.status === "pending" || d.status === "accepted").length,
    docsSigned: docs.filter((d) => d.status === "signed").length,
    visits30: recentVisits.length,
    upcoming: upcoming.length,
    expectedCents: expected,
    byService
  };
}

/* Every document across all patients — the clinic-wide Documentos view. */
export const listAllDocuments = () =>
  supabase.from("documents")
    .select("*, patients(full_name), signatures(id, signed_at, signer_name)")
    .order("assigned_at", { ascending: false }).then(unwrap);
