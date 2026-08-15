repo: getphenom/AAWellness
branch: main

## Last sync
date: 2026-08-15

### Added 2026-08-15 — documents & signatures
- `documents.js` / `documents.css` — clinic assigns templates, writes custom docs or
  uploads files; patient reads, accepts and signs (draw or typed). Status syncs both ways.
- `clinic-data.js` — shared source of truth for clinic info + the 7 services, read by
  BOTH the clinic console and the patient app so they cannot drift.
- `README-documents.md` — setup, Clover payment-link wiring, and the localStorage limit.
- Contact details, hours and Clover links are deliberately EMPTY, not guessed.
  Run `AACLINIC.missingInfo()` in the console to list them.

### Updated in this project
- Applied the Nácar visual direction to the real app: clinic console (Hoy, Agenda, Pacientes, Servicios, Mensajes, Panel) and the patient app (Inicio, Progreso, Visitas, Documentos).
- Screen content, service prices and patient data lifted from the repo's app source and demo seed data.

## Screen map
| Project screen | Repo files |
| --- | --- |
| AA App - Nacar.dc.html · clinic console | aa-healthcare-app.jsx (Today, Schedule, Patients, Inbox, Dashboard, CSS theme), demo.js (services page, seed data) |
| AA App - Nacar.dc.html · patient app | app.html (#patient-demo-clean views), demo.js (setupPatientDemo, patientStore) |
| AA - Cuatro Direcciones.dc.html | design-options.html (four directions board) |
| Documents tab (both sides) | documents.js, documents.css, clinic-data.js |
