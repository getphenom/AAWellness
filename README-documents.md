# Documents & signatures — how it works

Added: `clinic-data.js`, `documents.js`, `documents.css`
Wired into: `app.html`, `demo.js`

---

## What works right now

**Clinic side** (patient profile → *Documentos* tab)

- **+ Añadir formulario** → pick one of 8 built-in templates, *or* choose
  “— Escribir uno nuevo —” to type a custom title and body.
- Toggle **Requiere firma del paciente** per document.
- **Subir documento** → upload a file. Files under ~1.5 MB are stored inline so
  the patient can actually open and download them; larger files are recorded by
  name only.
- Every row shows live status: *Por completar → Aceptado → Firmado / En archivo*.
- Click **Ver** on a signed document to see the captured signature, the name and
  the date.

**Patient side** (phone view → *Docs* tab)

- The tab shows a pending count, e.g. **Docs (2)**.
- **Revisar y firmar** opens the full text.
- The patient must tick *He leído y acepto este documento* before the **Firmar**
  button unlocks.
- Signing accepts either a drawn signature (finger on mobile, mouse on desktop)
  or a typed full name, rendered in script.
- Read-only documents (e.g. the HIPAA notice) get a simple **Aceptar** instead.

The two sides read and write the same record, so assigning on the clinic side
makes the document appear on the patient side immediately, and signing on the
patient side updates the clinic side immediately.

## Built-in templates

| Template | Signature |
|---|---|
| Formulario de admisión | required |
| Consentimiento general de tratamiento | required |
| Consentimiento para terapia intravenosa | required |
| Consentimiento · Programa de Control de Peso | required |
| Consentimiento · Terapia PRP | required |
| Aviso de privacidad (HIPAA) | accept only |
| Política de pago y cancelación | required |
| Seguimiento mensual | accept only |

> **These are drafts, not vetted legal documents.** A licensed provider and an
> attorney should review the wording before it is used with real patients.

---

## The one real limitation

This is a **static site** — GitHub Pages, no server. Both sides therefore share
one `localStorage` record (`aa.docs.v1`) **in the same browser**.

That means:

- ✅ Works fully for the demo, and for one shared clinic device (e.g. a tablet
  handed to the patient in the office).
- ❌ Does **not** sync to a patient's own phone at home. Their phone is a
  different browser, so it has its own empty copy.

To make it work for patients on their own devices, three things are needed:

1. A small backend (Supabase, Firebase or similar) to hold documents and
   signatures instead of `localStorage`.
2. Patient login, so each person sees only their own documents.
3. A signed-PDF export for the clinic's records.

The code is already shaped for this: every read and write goes through
`AADOCS.*`, so only the `read()` / `write()` pair inside `documents.js` has to be
swapped for API calls. Nothing in the UI has to change.

**On e-signature compliance:** for signatures that must hold up legally (ESIGN /
UETA), the record also needs an audit trail — timestamp, IP address, and a
tamper-evident copy of exactly what was signed. That comes with the backend, or
by routing consents through a service like Dropbox Sign or DocuSign.

---

## Clinic info & Clover

`clinic-data.js` is now the single source of truth for clinic details and
services, read by both sides so they can't drift apart. The 7 services, their
prices and durations were carried over from the existing build.

Fields marked `[TODO]` are **intentionally left empty rather than guessed** —
phone, email, address, hours, social handles and booking URL. Fill them in one
place and both sides update.

**Clover:** this static site cannot charge cards — that needs a server holding
Clover API keys. What it *can* do is deep-link to Clover-hosted payment pages.
Create a payment link per service in the Clover dashboard, paste it into that
service's `cloverLink`, and a pay button appears. Services with no link show
“Pagar en clínica” instead. `payments.generalPayLink` works as a catch-all.

Run this in the browser console to list everything still unfilled:

```js
AACLINIC.missingInfo()
```

---

## Resetting the demo

```js
AADOCS.reset()   // clears all documents, then reload
```
