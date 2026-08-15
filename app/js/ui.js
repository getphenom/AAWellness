/* ============================================================================
   ui.js — shared rendering helpers: escaping, modal, signature pad, toasts.
   ========================================================================= */

export const $  = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

/* Everything user-supplied goes through this before touching innerHTML. */
export function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export const money = (cents) => "$" + Math.round((cents || 0) / 100);

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("es-PR",
    { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleString("es-PR",
    { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" });
}

export function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleTimeString("es-PR",
    { hour: "numeric", minute: "2-digit" });
}

export const initials = (n) =>
  String(n || "").trim().split(/\s+/).slice(0, 2).map((x) => x[0] || "").join("").toUpperCase();

export const STATUS_ES = {
  pending: "Por completar", accepted: "Aceptado",
  signed: "Firmado", filed: "En archivo"
};
export const STATUS_CLASS = {
  pending: "todo", accepted: "warn", signed: "done", filed: ""
};

/* ---- modal ------------------------------------------------------------ */

function modalShell() {
  let bg = $("#modal-bg");
  if (!bg) {
    bg = document.createElement("div");
    bg.id = "modal-bg";
    bg.className = "modal-bg";
    bg.innerHTML = '<div class="modal" id="modal" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(bg);
    bg.addEventListener("click", (e) => { if (e.target === bg) closeModal(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && bg.classList.contains("on")) closeModal();
    });
  }
  return bg;
}

export function openModal(html) {
  const bg = modalShell();
  $("#modal", bg).innerHTML = html;
  bg.classList.add("on");
  document.body.style.overflow = "hidden";
  const f = $("#modal input, #modal select, #modal textarea, #modal button");
  if (f) setTimeout(() => f.focus(), 30);
  return $("#modal", bg);
}

export function closeModal() {
  const bg = $("#modal-bg");
  if (!bg) return;
  bg.classList.remove("on");
  $("#modal", bg).innerHTML = "";
  document.body.style.overflow = "";
}

/* ---- toast ------------------------------------------------------------ */

export function toast(message, kind = "ok") {
  let host = $("#toasts");
  if (!host) {
    host = document.createElement("div");
    host.id = "toasts";
    host.className = "toasts";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---- busy / error states ---------------------------------------------- */

export const loading = (msg = "Cargando…") =>
  `<div class="state"><span class="spinner"></span>${esc(msg)}</div>`;

export const emptyState = (msg) => `<div class="state muted">${esc(msg)}</div>`;

export const errorState = (msg) =>
  `<div class="state err">${esc(msg)}</div>`;

/* ---- signature pad ------------------------------------------------------
   Handles both mouse and touch. Sized to its rendered box and scaled for
   device pixel ratio so the saved PNG is not blurry on phones.            */

export function mountPad(canvas) {
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#223C64";

  let drawing = false, dirty = false, last = null;

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };
  const start = (e) => { e.preventDefault(); drawing = true; last = pos(e); };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p; dirty = true;
  };
  const end = () => { drawing = false; };

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  return {
    clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; },
    isEmpty: () => !dirty,
    dataUrl: () => canvas.toDataURL("image/png")
  };
}

/* ---- document body rendering ------------------------------------------- */

export function bodyHtml(doc) {
  if (!doc.body) return '<p class="doc-p">Sin contenido.</p>';
  return doc.body.split(/\n{2,}/)
    .map((p) => `<p class="doc-p">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function signatureHtml(sig) {
  if (!sig) return "";
  const mark = sig.signature_data
    ? `<img class="sig-img" src="${esc(sig.signature_data)}" alt="Firma">`
    : `<span class="sig-typed">${esc(sig.typed_name || sig.signer_name)}</span>`;
  return `<div class="signed-block">
    <span class="signed-label">Firmado por</span>${mark}
    <span class="signed-meta">${esc(sig.signer_name)} · ${esc(fmtDate(sig.signed_at))}</span>
  </div>`;
}
