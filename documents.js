/* ============================================================================
   documents.js — Documents & signatures for A&A Wellness.

   WHAT THIS GIVES YOU
     Clinic side  : create a document from a template, write a custom one, or
                    upload a file; assign it to a patient; watch its status;
                    read back the captured signature.
     Patient side : see everything assigned to them, read the full text,
                    accept it, and sign it (finger/mouse drawing or typed).

   HOW THE TWO SIDES SHARE DATA
     This is a static site with no backend, so both sides read and write one
     localStorage record (`aa.docs.v1`) in the same browser. That is enough for
     a working demo and for single-device use in the clinic. For real patients
     on their own phones this needs a small backend — see README-documents.md.

   LEGAL NOTE
     The consent templates below are reasonable starting drafts, NOT vetted
     legal documents. Have a licensed provider and an attorney review the
     wording before using them with real patients.
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "aa.docs.v1";
  var subs = [];

  /* ---------------------------------------------------------------- utils */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid() { return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function nowISO() { return new Date().toISOString(); }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("es-PR", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* -------------------------------------------------------------- storage */
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); }
    catch (e) { /* private mode / quota — stay in memory for this session */ }
    mem = list;
    subs.forEach(function (fn) { try { fn(list); } catch (e) {} });
  }
  var mem = read();
  function all() { return mem.slice(); }

  // Keep tabs / the patient phone view in sync if storage changes elsewhere.
  window.addEventListener("storage", function (e) {
    if (e.key !== KEY) return;
    mem = read();
    subs.forEach(function (fn) { try { fn(mem); } catch (err) {} });
  });

  /* ------------------------------------------------------------ templates */
  var TEMPLATES = [
    {
      id: "intake",
      title: "Formulario de admisión",
      titleEn: "Intake form",
      kind: "form",
      requireSignature: true,
      body:
"Complete esta información antes de su primera visita.\n\n" +
"DATOS DEL PACIENTE\n" +
"Nombre completo, fecha de nacimiento, teléfono, correo electrónico y dirección postal.\n\n" +
"CONTACTO DE EMERGENCIA\n" +
"Nombre, parentesco y teléfono de la persona a contactar en caso de emergencia.\n\n" +
"HISTORIAL MÉDICO\n" +
"Indique condiciones actuales o pasadas, cirugías, hospitalizaciones y embarazos.\n\n" +
"MEDICAMENTOS Y ALERGIAS\n" +
"Liste todos los medicamentos, suplementos y vitaminas que toma actualmente, así como " +
"cualquier alergia a medicamentos, alimentos o látex.\n\n" +
"AUTORIZACIÓN\n" +
"Certifico que la información provista es correcta y completa según mi mejor conocimiento, " +
"y me comprometo a informar a la clínica de cualquier cambio."
    },
    {
      id: "consent-treatment",
      title: "Consentimiento general de tratamiento",
      titleEn: "General treatment consent",
      kind: "consent",
      requireSignature: true,
      body:
"Autorizo a A&A Healthcare Services LLC y a su personal cualificado a proveerme los " +
"servicios de bienestar que se me han explicado.\n\n" +
"ENTIENDO QUE:\n" +
"• Los servicios de bienestar no sustituyen la atención de mi médico primario.\n" +
"• Se me ha explicado el propósito del servicio, sus beneficios esperados y sus " +
"alternativas, y he tenido la oportunidad de hacer preguntas.\n" +
"• Ningún resultado ha sido garantizado.\n" +
"• Puedo retirar este consentimiento en cualquier momento antes o durante el servicio.\n\n" +
"RIESGOS COMUNES\n" +
"Molestia leve, enrojecimiento o moretón en el área de aplicación, mareo pasajero y, " +
"con poca frecuencia, reacción alérgica.\n\n" +
"Confirmo que he informado a la clínica de todas mis condiciones médicas, medicamentos y alergias."
    },
    {
      id: "consent-iv",
      title: "Consentimiento para terapia intravenosa",
      titleEn: "IV therapy consent",
      kind: "consent",
      requireSignature: true,
      body:
"Consiento a recibir terapia de hidratación y/o vitaminas por vía intravenosa (IV).\n\n" +
"PROCEDIMIENTO\n" +
"Se coloca un catéter pequeño en una vena, generalmente del brazo, para administrar " +
"líquidos y nutrientes durante la sesión.\n\n" +
"RIESGOS\n" +
"• Dolor, moretón, enrojecimiento o inflamación en el sitio de punción.\n" +
"• Infiltración del líquido fuera de la vena.\n" +
"• Infección en el sitio de punción (poco frecuente).\n" +
"• Mareo, náusea o sabor metálico durante la infusión.\n" +
"• Reacción alérgica a alguno de los componentes (poco frecuente).\n\n" +
"CONFIRMO QUE HE INFORMADO SOBRE:\n" +
"Enfermedad renal o cardiaca, embarazo o lactancia, alergias, y todos los medicamentos " +
"y suplementos que tomo.\n\n" +
"Entiendo que debo avisar inmediatamente al personal si siento cualquier molestia durante la sesión."
    },
    {
      id: "consent-glp",
      title: "Consentimiento · Programa de Control de Peso",
      titleEn: "Weight management program consent",
      kind: "consent",
      requireSignature: true,
      body:
"Consiento a participar en el Programa de Control de Peso supervisado por la clínica.\n\n" +
"SOBRE EL PROGRAMA\n" +
"El programa puede incluir seguimiento de peso, orientación de alimentación e hidratación, " +
"y — cuando el proveedor lo determine apropiado y lo recete — medicamento para el control " +
"de peso, junto con visitas de seguimiento periódicas.\n\n" +
"ENTIENDO QUE:\n" +
"• La elegibilidad la determina el proveedor tras evaluación clínica.\n" +
"• Los resultados varían de persona a persona y no se garantiza ninguna pérdida de peso.\n" +
"• Debo asistir a las visitas de seguimiento acordadas.\n" +
"• Debo informar de inmediato cualquier efecto secundario.\n\n" +
"POSIBLES EFECTOS SECUNDARIOS\n" +
"Náusea, vómito, diarrea o estreñimiento, dolor abdominal, reflujo, fatiga y disminución " +
"del apetito. Efectos menos frecuentes pero serios deben ser atendidos de inmediato.\n\n" +
"NO DEBO PARTICIPAR SI:\n" +
"Estoy embarazada, intentando quedar embarazada o lactando; o si tengo historial personal " +
"o familiar de ciertos tumores de tiroides o pancreatitis, sin evaluación previa.\n\n" +
"He tenido la oportunidad de hacer preguntas y todas fueron contestadas."
    },
    {
      id: "consent-prp",
      title: "Consentimiento · Terapia PRP",
      titleEn: "PRP therapy consent",
      kind: "consent",
      requireSignature: true,
      body:
"Consiento a recibir terapia de plasma rico en plaquetas (PRP).\n\n" +
"PROCEDIMIENTO\n" +
"Se extrae una muestra de mi propia sangre, se procesa en una centrífuga para concentrar " +
"las plaquetas, y el plasma resultante se aplica en el área tratada.\n\n" +
"RIESGOS\n" +
"• Dolor, moretón o inflamación en el área de extracción y de aplicación.\n" +
"• Infección (poco frecuente).\n" +
"• Resultados variables; puede requerir más de una sesión.\n\n" +
"ENTIENDO QUE este servicio requiere evaluación previa y que el proveedor puede determinar " +
"que no soy candidato/a.\n\n" +
"He tenido la oportunidad de hacer preguntas y todas fueron contestadas."
    },
    {
      id: "privacy",
      title: "Aviso de privacidad (HIPAA)",
      titleEn: "Notice of privacy practices (HIPAA)",
      kind: "policy",
      requireSignature: false,
      body:
"Este aviso describe cómo se puede usar y divulgar su información de salud y cómo usted " +
"puede obtener acceso a ella.\n\n" +
"USO DE SU INFORMACIÓN\n" +
"Usamos su información de salud para proveer tratamiento, coordinar su cuidado, procesar " +
"pagos y para operaciones administrativas de la clínica.\n\n" +
"SUS DERECHOS\n" +
"• Solicitar copia de su expediente.\n" +
"• Solicitar corrección de información incorrecta.\n" +
"• Solicitar restricciones sobre cómo se usa su información.\n" +
"• Recibir un listado de divulgaciones.\n" +
"• Presentar una queja sin represalias.\n\n" +
"NO compartimos su información con terceros para fines de mercadeo sin su autorización escrita.\n\n" +
"Al aceptar, usted confirma que recibió y tuvo oportunidad de leer este aviso."
    },
    {
      id: "financial",
      title: "Política de pago y cancelación",
      titleEn: "Payment and cancellation policy",
      kind: "policy",
      requireSignature: true,
      body:
"PAGO\n" +
"El pago se requiere al momento del servicio. Los pagos se procesan de forma segura a " +
"través de Clover. Aceptamos tarjetas de débito y crédito.\n\n" +
"CANCELACIONES\n" +
"Le pedimos avisar con al menos 24 horas de anticipación si necesita cancelar o reprogramar " +
"su cita, para poder ofrecer ese espacio a otro paciente.\n\n" +
"AUSENCIAS\n" +
"Las ausencias sin aviso pueden requerir prepago para futuras citas.\n\n" +
"PAQUETES Y PROGRAMAS\n" +
"Los paquetes y programas se pagan por adelantado y no son transferibles.\n\n" +
"Al firmar confirmo que entiendo y acepto esta política."
    },
    {
      id: "followup",
      title: "Seguimiento mensual",
      titleEn: "Monthly follow-up",
      kind: "form",
      requireSignature: false,
      body:
"Cuéntenos cómo le ha ido este mes.\n\n" +
"• ¿Cómo se ha sentido en general?\n" +
"• ¿Ha notado algún efecto secundario? ¿Cuál?\n" +
"• ¿Ha cambiado algún medicamento o suplemento?\n" +
"• ¿Cómo ha estado su nivel de energía, sueño e hidratación?\n" +
"• ¿Tiene alguna pregunta para su próxima visita?\n\n" +
"Sus respuestas ayudan al proveedor a ajustar su plan."
    }
  ];

  function template(id) {
    return TEMPLATES.filter(function (t) { return t.id === id; })[0] || null;
  }

  /* ------------------------------------------------------------- mutators */
  function forPatient(name) {
    return all()
      .filter(function (d) { return d.patient === name; })
      .sort(function (a, b) {
        var rank = { pending: 0, accepted: 1, signed: 2, filed: 3 };
        var r = (rank[a.status] || 0) - (rank[b.status] || 0);
        return r !== 0 ? r : String(b.assignedAt).localeCompare(String(a.assignedAt));
      });
  }

  function assign(patient, templateId) {
    var t = template(templateId);
    if (!t) return null;
    var doc = {
      id: uid(),
      patient: patient,
      title: t.title,
      titleEn: t.titleEn,
      kind: t.kind,
      body: t.body,
      fileName: null,
      requireSignature: !!t.requireSignature,
      status: "pending",
      assignedAt: nowISO(),
      completedAt: null,
      signature: null,
      fromTemplate: t.id
    };
    var list = all(); list.unshift(doc); write(list);
    return doc;
  }

  function createCustom(patient, opts) {
    opts = opts || {};
    var doc = {
      id: uid(),
      patient: patient,
      title: opts.title || "Documento",
      titleEn: opts.title || "Document",
      kind: opts.kind || "form",
      body: opts.body || "",
      fileName: null,
      requireSignature: opts.requireSignature !== false,
      status: "pending",
      assignedAt: nowISO(),
      completedAt: null,
      signature: null,
      fromTemplate: null
    };
    var list = all(); list.unshift(doc); write(list);
    return doc;
  }

  /* An uploaded file is stored as a reference only (name + optional data URL
     for small files). Large files are kept by name so the record still shows. */
  function addFile(patient, fileName, dataUrl, requireSignature) {
    var doc = {
      id: uid(),
      patient: patient,
      title: fileName,
      titleEn: fileName,
      kind: "file",
      body: "",
      fileName: fileName,
      dataUrl: dataUrl || null,
      requireSignature: !!requireSignature,
      status: requireSignature ? "pending" : "filed",
      assignedAt: nowISO(),
      completedAt: requireSignature ? null : nowISO(),
      signature: null,
      fromTemplate: null
    };
    var list = all(); list.unshift(doc); write(list);
    return doc;
  }

  function update(id, patch) {
    var list = all(), hit = null;
    list.forEach(function (d) { if (d.id === id) { Object.assign(d, patch); hit = d; } });
    if (hit) write(list);
    return hit;
  }

  function accept(id) {
    var d = byId(id); if (!d) return null;
    // A doc that needs a signature only reaches "signed" through sign().
    return update(id, d.requireSignature
      ? { status: "accepted" }
      : { status: "filed", completedAt: nowISO() });
  }

  function sign(id, sig) {
    return update(id, { status: "signed", completedAt: nowISO(), signature: sig });
  }

  function remove(id) {
    write(all().filter(function (d) { return d.id !== id; }));
  }

  function byId(id) { return all().filter(function (d) { return d.id === id; })[0] || null; }

  function onChange(fn) { subs.push(fn); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; }

  /* Bring the old hard-coded demo lists into the real store, once. */
  function seed(patient, legacyRows) {
    if (all().some(function (d) { return d.patient === patient; })) return;
    var map = {
      "Formulario de admisión": "intake",
      "Consentimiento control de peso": "consent-glp",
      "Consentimiento de control de peso": "consent-glp",
      "Consentimiento terapia IV": "consent-iv",
      "Consentimiento de tratamiento": "consent-treatment",
      "Seguimiento mensual": "followup"
    };
    (legacyRows || []).slice().reverse().forEach(function (row) {
      var title = row[0], state = row[1], tid = map[title];
      var doc = tid ? assign(patient, tid) : createCustom(patient, { title: title, body: "", requireSignature: false });
      if (!doc) return;
      if (/Completado/i.test(state)) {
        sign(doc.id, { type: "seed", typedName: patient, name: patient, date: doc.assignedAt, dataUrl: null });
      } else if (/En archivo/i.test(state)) {
        update(doc.id, { status: "filed", completedAt: doc.assignedAt, requireSignature: false });
      }
    });
  }

  /* --------------------------------------------------------------- labels */
  function statusLabel(d) {
    return { pending: "Por completar", accepted: "Aceptado", signed: "Firmado", filed: "En archivo" }[d.status] || d.status;
  }
  function statusClass(d) {
    return { pending: "todo", accepted: "warn", signed: "done", filed: "" }[d.status] || "";
  }

  function rows(list, role) {
    if (!list.length) {
      return '<div class="aadoc-empty">Sin documentos todavía.</div>';
    }
    return list.map(function (d) {
      var needs = d.status === "pending" || d.status === "accepted";
      var cta = role === "patient" && needs
        ? '<button class="aadoc-open" data-aadoc-open="' + d.id + '">' +
            (d.requireSignature ? "Revisar y firmar" : "Revisar") + "</button>"
        : '<button class="aadoc-link" data-aadoc-open="' + d.id + '">Ver</button>';
      var sub = d.kind === "file"
        ? "Archivo adjunto"
        : (d.status === "signed" && d.signature
            ? "Firmado " + fmtDate(d.completedAt)
            : (d.requireSignature ? "Requiere firma" : "Solo lectura"));
      return '' +
        '<div class="doc-row-native aadoc-row">' +
          '<span class="doc-icon-native">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' +
            '<path d="M7 3h7l4 4v14H7z"></path><path d="M10 12h6M10 16h6"></path></svg>' +
          "</span>" +
          '<div class="doc-main-native"><b>' + esc(d.title) + "</b><span>" + esc(sub) + "</span></div>" +
          '<span class="doc-status-native ' + statusClass(d) + '">' + esc(statusLabel(d)) + "</span>" +
          cta +
        "</div>";
    }).join("");
  }

  /* --------------------------------------------------------- modal plumbing
     Reuses the existing #demo-modal shell when present; otherwise builds its
     own overlay so the patient phone view works standalone.                */
  function shell() {
    var bg = document.getElementById("demo-modal-bg");
    if (bg) return { bg: bg, box: document.getElementById("demo-modal"), own: false };
    bg = document.getElementById("aadoc-modal-bg");
    if (!bg) {
      bg = document.createElement("div");
      bg.className = "demo-modal-bg"; bg.id = "aadoc-modal-bg";
      bg.innerHTML = '<div class="demo-modal" id="aadoc-modal"></div>';
      document.body.appendChild(bg);
      bg.addEventListener("click", function (e) { if (e.target === bg) closeModal(); });
    }
    return { bg: bg, box: document.getElementById("aadoc-modal"), own: true };
  }
  function openModal(html) {
    var s = shell(); s.box.innerHTML = html; s.bg.classList.add("on"); return s;
  }
  function closeModal() {
    ["demo-modal-bg", "aadoc-modal-bg"].forEach(function (id) {
      var bg = document.getElementById(id);
      if (bg) { bg.classList.remove("on"); var b = bg.querySelector(".demo-modal"); if (b) b.innerHTML = ""; }
    });
  }

  /* ------------------------------------------------------- signature pad */
  function mountPad(canvas) {
    var ctx = canvas.getContext("2d");
    var ratio = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "#223C64";

    var drawing = false, dirty = false, last = null;

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    }
    function start(e) { e.preventDefault(); drawing = true; last = pos(e); }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = pos(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p; dirty = true;
    }
    function end() { drawing = false; }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    return {
      clear: function () { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; },
      isEmpty: function () { return !dirty; },
      dataUrl: function () { return canvas.toDataURL("image/png"); }
    };
  }

  /* ----------------------------------------------------------- doc viewer */
  function bodyHtml(d) {
    if (d.kind === "file") {
      return '<div class="aadoc-file">' +
        '<b>' + esc(d.fileName || d.title) + "</b>" +
        "<span>Este documento fue subido por la clínica.</span>" +
        (d.dataUrl ? '<a class="demo-btn secondary" download="' + esc(d.fileName) + '" href="' + d.dataUrl + '">Descargar</a>' : "") +
        "</div>";
    }
    if (!d.body) return '<p class="aadoc-p">Sin contenido.</p>';
    return d.body.split(/\n{2,}/).map(function (para) {
      return '<p class="aadoc-p">' + esc(para).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  function signatureHtml(d) {
    if (!d.signature) return "";
    var s = d.signature;
    var img = s.dataUrl
      ? '<img class="aadoc-sig-img" src="' + s.dataUrl + '" alt="Firma">'
      : '<span class="aadoc-sig-typed">' + esc(s.typedName || s.name || "") + "</span>";
    return '<div class="aadoc-signed">' +
      '<span class="aadoc-signed-label">Firmado por</span>' + img +
      "<span class=\"aadoc-signed-meta\">" + esc(s.name || s.typedName || d.patient) +
      " · " + esc(fmtDate(s.date || d.completedAt)) + "</span></div>";
  }

  /* role: 'clinic' (read-only review) or 'patient' (can accept / sign) */
  function openDoc(id, role, onDone) {
    var d = byId(id); if (!d) return;
    var done = d.status === "signed" || d.status === "filed";
    var canAct = role === "patient" && !done;

    var actions;
    if (!canAct) {
      actions = '<button class="demo-btn secondary" data-aadoc-close>Cerrar</button>';
    } else if (d.requireSignature) {
      actions =
        '<label class="aadoc-check"><input type="checkbox" id="aadoc-agree"> ' +
        "He leído y acepto este documento.</label>" +
        '<div class="demo-modal-actions">' +
          '<button class="demo-btn secondary" data-aadoc-close>Ahora no</button>' +
          '<button class="demo-btn" id="aadoc-tosign" disabled>Firmar</button>' +
        "</div>";
    } else {
      actions =
        '<div class="demo-modal-actions">' +
          '<button class="demo-btn secondary" data-aadoc-close>Cerrar</button>' +
          '<button class="demo-btn" id="aadoc-accept">Aceptar</button>' +
        "</div>";
    }

    openModal(
      '<div class="aadoc-view">' +
        '<span class="aadoc-kicker">' + esc({ consent: "Consentimiento", form: "Formulario", policy: "Política", file: "Archivo" }[d.kind] || "Documento") + "</span>" +
        "<h3>" + esc(d.title) + "</h3>" +
        '<div class="aadoc-body">' + bodyHtml(d) + signatureHtml(d) + "</div>" +
        actions +
      "</div>"
    );

    var box = document.querySelector("#demo-modal, #aadoc-modal");
    box.querySelectorAll("[data-aadoc-close]").forEach(function (b) { b.onclick = closeModal; });

    var agree = document.getElementById("aadoc-agree");
    var toSign = document.getElementById("aadoc-tosign");
    if (agree && toSign) {
      agree.onchange = function () { toSign.disabled = !agree.checked; };
      toSign.onclick = function () { openSign(d.id, onDone); };
    }
    var acc = document.getElementById("aadoc-accept");
    if (acc) acc.onclick = function () { accept(d.id); closeModal(); if (onDone) onDone(); };
  }

  /* ----------------------------------------------------------- sign modal */
  function openSign(id, onDone) {
    var d = byId(id); if (!d) return;
    openModal(
      '<div class="aadoc-view">' +
        '<span class="aadoc-kicker">Firma</span>' +
        "<h3>" + esc(d.title) + "</h3>" +
        '<p class="aadoc-hint">Firme con el dedo o el ratón, o escriba su nombre completo.</p>' +
        '<div class="aadoc-pad-wrap"><canvas id="aadoc-pad" class="aadoc-pad"></canvas>' +
          '<button type="button" class="aadoc-clear" id="aadoc-clear">Borrar</button></div>' +
        '<div class="demo-field full"><label>O escriba su nombre completo</label>' +
          '<input id="aadoc-typed" type="text" placeholder="' + esc(d.patient) + '"></div>' +
        '<div class="demo-modal-actions">' +
          '<button class="demo-btn secondary" data-aadoc-close>Cancelar</button>' +
          '<button class="demo-btn" id="aadoc-save">Firmar documento</button>' +
        "</div>" +
      "</div>"
    );

    var canvas = document.getElementById("aadoc-pad");
    var pad = mountPad(canvas);
    document.getElementById("aadoc-clear").onclick = function () { pad.clear(); };
    document.querySelectorAll("[data-aadoc-close]").forEach(function (b) { b.onclick = closeModal; });

    document.getElementById("aadoc-save").onclick = function () {
      var typed = (document.getElementById("aadoc-typed").value || "").trim();
      if (pad.isEmpty() && !typed) {
        document.getElementById("aadoc-typed").focus();
        return;
      }
      sign(d.id, {
        type: pad.isEmpty() ? "type" : "draw",
        dataUrl: pad.isEmpty() ? null : pad.dataUrl(),
        typedName: typed || d.patient,
        name: typed || d.patient,
        date: nowISO()
      });
      closeModal();
      if (onDone) onDone();
    };
  }

  /* ------------------------------------------- clinic: create / assign UI */
  function assignModal(patient, onDone) {
    var opts = TEMPLATES.map(function (t) {
      return '<option value="' + t.id + '">' + esc(t.title) + "</option>";
    }).join("");
    openModal(
      "<h3>Añadir documento</h3>" +
      "<p>El paciente lo verá en su app como pendiente.</p>" +
      '<div class="demo-field full"><label>Plantilla</label><select id="aadoc-tpl">' + opts +
        '<option value="__custom">— Escribir uno nuevo —</option></select></div>' +
      '<div id="aadoc-custom" style="display:none">' +
        '<div class="demo-field full"><label>Título</label><input id="aadoc-title" type="text" placeholder="Título del documento"></div>' +
        '<div class="demo-field full"><label>Contenido</label><textarea id="aadoc-body" rows="7" placeholder="Escriba el texto que el paciente debe leer…"></textarea></div>' +
      "</div>" +
      '<label class="aadoc-check"><input type="checkbox" id="aadoc-needsig" checked> Requiere firma del paciente</label>' +
      '<div class="demo-modal-actions">' +
        '<button class="demo-btn secondary" data-aadoc-close>Cancelar</button>' +
        '<button class="demo-btn" id="aadoc-assign">Asignar</button>' +
      "</div>"
    );

    var sel = document.getElementById("aadoc-tpl");
    var custom = document.getElementById("aadoc-custom");
    var needsig = document.getElementById("aadoc-needsig");

    function syncTpl() {
      var isCustom = sel.value === "__custom";
      custom.style.display = isCustom ? "" : "none";
      if (!isCustom) {
        var t = template(sel.value);
        if (t) needsig.checked = !!t.requireSignature;
      }
    }
    sel.onchange = syncTpl; syncTpl();

    document.querySelectorAll("[data-aadoc-close]").forEach(function (b) { b.onclick = closeModal; });
    document.getElementById("aadoc-assign").onclick = function () {
      var doc;
      if (sel.value === "__custom") {
        var title = (document.getElementById("aadoc-title").value || "").trim();
        var body = (document.getElementById("aadoc-body").value || "").trim();
        if (!title) { document.getElementById("aadoc-title").focus(); return; }
        doc = createCustom(patient, { title: title, body: body, requireSignature: needsig.checked });
      } else {
        doc = assign(patient, sel.value);
        if (doc) update(doc.id, { requireSignature: needsig.checked });
      }
      closeModal();
      if (onDone) onDone(doc);
    };
  }

  /* ------------------------------------------------------------- exports */
  window.AADOCS = {
    TEMPLATES: TEMPLATES,
    template: template,
    all: all,
    forPatient: forPatient,
    byId: byId,
    assign: assign,
    createCustom: createCustom,
    addFile: addFile,
    update: update,
    accept: accept,
    sign: sign,
    remove: remove,
    seed: seed,
    onChange: onChange,
    rows: rows,
    statusLabel: statusLabel,
    openDoc: openDoc,
    openSign: openSign,
    assignModal: assignModal,
    closeModal: closeModal,
    reset: function () { write([]); },
    _fmtDate: fmtDate
  };
})();
