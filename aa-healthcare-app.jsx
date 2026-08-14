import React, { useState, useEffect, useMemo, useContext, createContext } from "react";
import {
  LayoutGrid, CalendarDays, Users, MessageSquare, Sparkles, TrendingUp,
  Instagram, Facebook, Mail, Phone, Check, ChevronRight, Loader2, ArrowLeft,
  Clock, X, Droplet, AlertTriangle, Tag, Send, RefreshCw, Gift, MapPin
} from "lucide-react";

/* ============ brand — Nácar: marble, pink→blue ombré, gold edge ============ */
const T = {
  cream: "#FBF7F4", surface: "#FFFFFF", ink: "#223C64", muted: "#5A7091", line: "#EAD9B5",
  pink: "#E52E7B", blue: "#8CBCE4", blueDeep: "#2F6DA8", aqua: "#AFD0EC",
  gold: "#C69A44", goldSoft: "#EAD9B5", goldInk: "#8A6A10", deep: "#1F4E7C", rose: "#F1A7C4", teal: "#2F6DA8",
  magenta: "#C81A66", hair: "#EDDFC1", hairSoft: "#F0E4CE", pinkWash: "#FDEAF3", blueWash: "#DCEAF7",
};
const GOLDRULE = `linear-gradient(90deg,${T.goldSoft},${T.gold},${T.goldSoft})`;
/* the ombré band off the posters: magenta → rose → baby blue */
const BAND = `linear-gradient(96deg,${T.pink} 0%,#F28FB5 34%,#DCC8DE 58%,${T.blue} 100%)`;
/* the gold that rides every edge — a metal, so it needs the full four stops */
const GOLDEDGE = `linear-gradient(140deg,#EBD6A8,${T.gold} 45%,#F3E6C4 66%,#B98C33)`;
const MARBLE = `radial-gradient(120% 80% at 20% 0%,#FFFFFF,#FDFAF7 60%,#F4EDE7)`;

/* ============ i18n — [English, Español] ============ */
const LangCtx = createContext(0);
const useL = () => useContext(LangCtx);
const S = {
  owner: ["Owner", "Clínica"], patient: ["Patient app", "App del paciente"],
  today: ["Today", "Hoy"], sched: ["Schedule", "Agenda"], pts: ["Patients", "Pacientes"],
  inbox: ["Inbox", "Mensajes"], studio: ["Studio", "Estudio"], dash: ["Dashboard", "Panel"],
  opening: ["Opening the clinic…", "Abriendo la clínica…"],
  bookingLink: ["Booking link", "Enlace de reservas"],
  onBooks: ["On the books", "Citas de hoy"], slotsOpen: ["slots still open", "espacios disponibles"],
  expected: ["Expected today", "Ingreso esperado"], collected: ["collected", "cobrado"],
  waiting: ["Waiting on you", "Esperan respuesta"], msgsUn: ["messages unanswered", "mensajes sin contestar"],
  promosOn: ["Promotions live", "Promociones activas"], of: ["of", "de"],
  theDay: ["The day", "El día"], booked: ["booked", "citas"],
  noBookings: ["Nothing booked yet. Open some slots in Schedule and they'll show up on the booking link.",
    "Aún no hay citas. Abre espacios en Agenda y aparecerán en el enlace de reservas."],
  arrived: ["Arrived", "Llegó"], checkout: ["Check out", "Cobrar"], paid: ["paid", "pagado"],
  openLeft: ["Open slots left today", "Espacios libres hoy"], free: ["free", "libres"],
  fullyBooked: ["Fully booked. Beautiful.", "Todo reservado. Bellísimo."],
  fillPost: ["Write a fill-the-gap post", "Crear un post para llenarlos"],
  promos: ["Promotions", "Promociones"], pause: ["Pause", "Pausar"], resume: ["Resume", "Activar"],
  live: ["live", "activa"], paused: ["Paused", "Pausada"],
  ivMenu: ["Service menu", "Menú de servicios"], tapPause: ["tap to pause what you're out of", "toca para pausar lo que se agotó"],
  checkoutT: ["Check out", "Cobrar a"], credit: ["Referral credit", "Crédito de referido"],
  applyCredit: ["Apply credit", "Aplicar crédito"], total: ["Total", "Total"],
  payMethods: [["Visa on file", "ATH Móvil", "HSA card", "Cash"], ["Visa registrada", "ATH Móvil", "Tarjeta HSA", "Efectivo"]],
  payNote: ["Records the payment, issues a receipt and posts it to the dashboard. In the live build this is where the card on file is charged.",
    "Registra el pago, genera el recibo y lo envía al panel. En la versión real, aquí se cobra la tarjeta registrada."],
  next7: ["Next seven days", "Próximos siete días"],
  schedLede: ["Tap a slot to open or close it. Patients only ever see the open ones — the moment a slot is taken it disappears from the booking link.",
    "Toca un espacio para abrirlo o cerrarlo. Los pacientes solo ven los abiertos, y en cuanto alguien reserva, desaparece del enlace."],
  open: ["Open", "Abierto"], closed: ["Closed", "Cerrado"],
  calendars: ["Connected calendars", "Calendarios conectados"], twoWay: ["two-way", "bidireccional"], liveW: ["live", "activo"],
  igBtn: ["Instagram book button", "Botón de reserva en Instagram"], fbBook: ["Facebook Page booking", "Reservas desde Facebook"],
  connNote: ["Shown connected for the walkthrough. Each needs OAuth and a server before it's real.",
    "Se muestran conectados solo para la demostración. Cada uno necesita OAuth y un servidor para funcionar."],
  rules: ["Booking rules", "Reglas de reserva"],
  r1: ["2 chairs + 1 treatment room at once", "2 sillones + 1 sala de tratamiento a la vez"],
  r2: ["Deposit holds the appointment — waived on a new client's second visit", "El depósito reserva la cita; se exime en la segunda visita del cliente nuevo"],
  r3: ["Weight control: consult required before the first dose", "Control de peso: consulta obligatoria antes de la primera dosis"],
  r4: ["NAD+ and PRP block a full long session", "NAD+ y PRP ocupan una sesión larga completa"],
  patients: ["patients", "pacientes"], plan: ["Plan", "Plan"], visits: ["Visits", "Visitas"],
  lifetime: ["Lifetime", "Total"], nextVisit: ["Next visit", "Próxima cita"],
  recentVisits: ["Recent visits", "Visitas recientes"], noVisits: ["No visits recorded yet.", "Aún no hay visitas registradas."],
  chartNote: ["Dosing log, consent forms and intake notes belong here too — behind clinical access controls, separate from the marketing side.",
    "El registro de dosis, consentimientos y notas de admisión también van aquí, con control de acceso clínico y separados del mercadeo."],
  channels: ["Instagram · Facebook · Text · Email", "Instagram · Facebook · Texto · Correo"],
  writeReply: ["Write a reply, or let the assistant draft one you can edit.", "Escribe una respuesta, o deja que el asistente redacte una para editar."],
  draftReply: ["Draft a reply", "Redactar respuesta"], writing: ["Writing", "Escribiendo"], send: ["Send", "Enviar"],
  dmNote: ["Health details never belong in a social DM. Anything clinical goes out as a secure link instead.",
    "Los datos de salud no van en un mensaje directo. Todo lo clínico se envía por enlace seguro."],
  aiFail: ["Couldn't reach the writer. Try again.", "No se pudo conectar. Intenta de nuevo."],
  studioSub: ["Brochures · offers · captions", "Folletos · ofertas · textos"],
  brief: ["Brief", "Instrucciones"], promoting: ["What are you promoting", "Qué vas a promocionar"],
  format: ["Format", "Formato"], kinds: [["Offer", "Brochure", "Membership"], ["Oferta", "Folleto", "Membresía"]],
  goalQ: ["What do you want it to do", "Qué quieres lograr"],
  goalDef: ["Fill the open afternoon slots this week", "Llenar los espacios de la tarde esta semana"],
  makeIt: ["Make it", "Crear"], making: ["Making it", "Creando"], working: ["Working…", "Trabajando…"],
  draft: ["Draft", "Borrador"], yoursToEdit: ["yours to edit", "puedes editarlo"],
  studioEmpty: ["Set the brief and press Make it. You'll get a poster, an Instagram caption and hashtags — nothing goes live until you say so.",
    "Completa las instrucciones y pulsa Crear. Recibirás un afiche, un texto para Instagram y hashtags. Nada se publica hasta que tú lo apruebes."],
  caption: ["Caption", "Texto"], saved: ["Saved", "Guardados"], makeLive: ["Publish as a promotion", "Publicar como promoción"],
  since: ["since", "desde"], revenue: ["Revenue", "Ingresos"], treatments: ["treatments", "tratamientos"],
  avgTicket: ["Average ticket", "Ticket promedio"], perVisit: ["per visit", "por visita"],
  seen: ["Patients seen", "Pacientes atendidos"], uniqIn: ["unique in period", "distintos en el período"],
  topSeller: ["Top seller", "Más vendido"], whereRev: ["Where the revenue came from", "De dónde vinieron los ingresos"],
  week: ["Week", "Semana"], month: ["Month", "Mes"], ytd: ["Year to date", "Año hasta hoy"],
  last7: ["last 7 days", "últimos 7 días"], thisMonth: ["this month", "este mes"], ytdShort: ["year to date", "año hasta hoy"],
  payments: ["Payments", "Pagos"], autoReceipts: ["receipts issued automatically", "recibos automáticos"],
  date: ["Date", "Fecha"], patientC: ["Patient", "Paciente"], service: ["Service", "Servicio"],
  method: ["Method", "Método"], receipt: ["Receipt", "Recibo"], amount: ["Amount", "Monto"],
  noPay: ["No payments in this window.", "No hay pagos en este período."],
  heroScript: ["Feel", "Siéntete"], heroRest: ["BETTER TODAY", "MEJOR HOY"],
  menuFine: ["Every treatment is prepared and administered by licensed clinical staff. Questions? Message us — we usually answer within the hour.",
    "Cada tratamiento lo prepara y administra personal clínico licenciado. ¿Preguntas? Escríbenos, casi siempre contestamos en menos de una hora."],
  menu: ["Menu", "Menú"], inBag: ["What's in it", "Qué lleva"],
  bookedFor: ["Booked most often for", "Se reserva más para"], after: ["Afterwards", "Después"],
  bookThis: ["Book this", "Reservar"], howWorks: ["HOW IT WORKS", "¿CÓMO FUNCIONA?"],
  important: ["IMPORTANT", "IMPORTANTE"],
  infoFine: ["General information, not medical advice. Your clinician confirms what's right for you at the visit.",
    "Información general, no consejo médico. Tu clínica confirma qué es apropiado para ti en la cita."],
  noSlots: ["No open slots in the next ten days. Message us and we'll fit you in.",
    "No hay espacios en los próximos diez días. Escríbenos y te acomodamos."],
  yourName: ["Your name", "Tu nombre"], mobile: ["Mobile number", "Número de celular"],
  confirm: ["Confirm", "Confirmar"], addDetails: ["Add your details", "Añade tus datos"], pickTime: ["Pick a time", "Elige una hora"],
  holdFine: ["A deposit holds your chair. Free to cancel up to 24 hours before.",
    "Un depósito reserva tu sillón. Cancelación gratis hasta 24 horas antes."],
  youreBooked: ["You're booked.", "¡Listo, quedaste!"], at: ["at", "a las"],
  doneBox: ["Added to your calendar. Your intake form and directions arrive by text, and your receipt by email the moment you're done.",
    "Añadido a tu calendario. Tu formulario y las direcciones llegan por texto, y el recibo por correo al terminar."],
  backMenu: ["Back to the menu", "Volver al menú"],
  pNote: ["Same app, patient side — opened from the Instagram profile button, the Facebook page, a text link, or saved to the home screen.",
    "La misma app, lado del paciente: se abre desde el botón de Instagram, la página de Facebook, un enlace por texto, o guardada en la pantalla de inicio."],
  founder: ["Astrid Rivera, RN · Founder", "Astrid Rivera, RN · Fundadora"],
  scheduled: ["scheduled", "programado"], tomorrow6: ["Tomorrow 6:00 PM", "Mañana 6:00 PM"],
};

/* ============ promotions actually running on Instagram ============ */
const PROMOS = [
  {
    id: "referral", live: true, icon: Gift,
    script: ["Your referral", "Tu referido"], head: ["IS WORTH IT", "VALE"],
    blurb: ["Every time someone you refer completes their first purchase, you earn credit toward your next service.",
      "Cada vez que una persona referida por ti complete su primera compra, recibirás un crédito para tu próximo servicio."],
    steps: [
      { a: ["Their first purchase is $250 or more", "Su primera compra es de $250 o más"], b: ["$50 credit", "$50 en crédito"], c: T.blue },
      { a: ["Their first purchase is under $250", "Su primera compra es menor de $250"], b: ["$25 credit", "$25 en crédito"], c: T.pink },
    ],
    terms: ["Credit is not transferable, cannot be exchanged for cash, and does not combine with other current offers.",
      "El crédito no es transferible, no puede canjearse por dinero en efectivo y no es acumulable con otras promociones u ofertas vigentes."],
  },
  {
    id: "newclient", live: true, icon: Tag,
    script: ["For", "Para"], head: ["NEW CLIENTS", "CLIENTES NUEVOS"],
    blurb: ["20% off your first appointment with a purchase of $150 or more — and no deposit required on your second follow-up visit.",
      "20% de descuento en tu primera cita con la compra de $150 o más, y en tu segunda cita de seguimiento no tendrás que realizar depósito."],
    steps: [
      { a: ["First appointment, $150 or more", "Primera cita, $150 o más"], b: ["20% off", "20% de descuento"], c: T.pink },
      { a: ["Second follow-up visit", "Segunda cita de seguimiento"], b: ["No deposit", "Sin depósito"], c: T.blue },
    ],
    terms: ["Credit is not transferable and does not combine with other current offers.",
      "El crédito no es transferible ni se junta con otras ofertas vigentes."],
  },
];

/* ============ services =============
   Standard formulations — Astrid must confirm every line and every price
   against the clinic's actual protocols before this is shown to a patient. */
const CATALOG = [
  {
    id: "hydra", color: T.blueDeep, mins: 45, price: 165,
    name: ["Hydration Revive", "Hidratación Revive"], dose: ["1000 mL IV", "1000 mL IV"], tag: ["Most booked", "Más reservado"],
    what: ["A full litre of balanced fluid straight into the bloodstream, with the B vitamins and magnesium your body burns through when it's depleted.",
      "Un litro completo de líquido balanceado directo al torrente sanguíneo, con las vitaminas B y el magnesio que el cuerpo agota cuando está bajo."],
    mix: [
      { n: ["Lactated Ringer's, 1000 mL", "Lactato de Ringer, 1000 mL"], w: ["Fluid plus sodium, potassium, calcium and lactate — closer to plasma than plain saline", "Líquido con sodio, potasio, calcio y lactato: más parecido al plasma que la salina sola"] },
      { n: ["B-complex", "Complejo B"], w: ["B1, B2, B3, B5, B6 — cofactors cells use to turn food into energy", "B1, B2, B3, B5, B6: cofactores que las células usan para convertir comida en energía"] },
      { n: ["Vitamin B12", "Vitamina B12"], w: ["Supports nerve function and red blood cell production", "Apoya la función nerviosa y la producción de glóbulos rojos"] },
      { n: ["Magnesium chloride", "Cloruro de magnesio"], w: ["Eases muscle tightness and headache; the reason the drip feels warm", "Alivia tensión muscular y dolor de cabeza; por eso el suero se siente tibio"] },
    ],
    good: [["Travel and heat", "Viajes y calor"], ["After training hard", "Después de entrenar fuerte"], ["Low fluid intake", "Poca ingesta de líquidos"], ["Hangover recovery", "Recuperación de resaca"]],
    caution: ["Tell us first if you have kidney disease, heart failure, high blood pressure or any fluid restriction.",
      "Avísanos primero si tienes enfermedad renal, insuficiencia cardíaca, presión alta o alguna restricción de líquidos."],
    afterT: ["Drink water through the day. The warm flush during the magnesium push is normal and passes in a minute.",
      "Toma agua durante el día. El calor que sientes con el magnesio es normal y pasa en un minuto."],
  },
  {
    id: "myers", color: T.teal, mins: 45, price: 185,
    name: ["Myers' Immunity", "Inmunidad Myers"], dose: ["500 mL IV", "500 mL IV"],
    what: ["The original vitamin drip, formulated by Dr. John Myers — vitamin C, magnesium, calcium and the full B range in one bag.",
      "El suero vitamínico original, formulado por el Dr. John Myers: vitamina C, magnesio, calcio y todo el rango de vitaminas B en una sola bolsa."],
    mix: [
      { n: ["Vitamin C", "Vitamina C"], w: ["Antioxidant; supports normal immune function", "Antioxidante; apoya la función inmune normal"] },
      { n: ["Magnesium chloride", "Cloruro de magnesio"], w: ["Muscle and nerve function", "Función muscular y nerviosa"] },
      { n: ["Calcium gluconate", "Gluconato de calcio"], w: ["Balances the magnesium; nerve signalling", "Balancea el magnesio; señalización nerviosa"] },
      { n: ["B-complex + B12", "Complejo B + B12"], w: ["Energy metabolism and nerve support", "Metabolismo energético y apoyo nervioso"] },
      { n: ["Normal saline, 500 mL", "Solución salina, 500 mL"], w: ["Carrier fluid and hydration", "Líquido portador e hidratación"] },
    ],
    good: [["Run-down seasons", "Temporadas de agotamiento"], ["Frequent colds", "Catarros frecuentes"], ["Fatigue with no clear cause", "Cansancio sin causa clara"], ["Migraine-prone patients", "Pacientes con migraña"]],
    caution: ["High-dose vitamin C isn't for everyone — G6PD deficiency, kidney stones or kidney disease need screening first.",
      "La vitamina C en dosis alta no es para todos: deficiencia de G6PD, cálculos renales o enfermedad renal requieren evaluación previa."],
    afterT: ["Most people notice it the next morning rather than the same hour.", "La mayoría lo nota a la mañana siguiente, no en el momento."],
  },
  {
    id: "prp", color: T.gold, mins: 60, price: 450,
    name: ["PRP Therapy", "Terapia PRP"], dose: ["from your own blood", "de tu propia sangre"], tag: ["Evaluation first", "Requiere evaluación"],
    what: ["Platelet-rich plasma. We draw a small amount of your blood, spin it to concentrate the platelets, and place that fraction where it's needed.",
      "Plasma rico en plaquetas. Extraemos una cantidad pequeña de tu sangre, la centrifugamos para concentrar las plaquetas y colocamos esa fracción donde se necesita."],
    mix: [
      { n: ["Your own whole blood", "Tu propia sangre"], w: ["A small draw taken on site at the start of the visit", "Una extracción pequeña que se hace aquí al comenzar la cita"] },
      { n: ["Platelet-rich fraction", "Fracción rica en plaquetas"], w: ["Separated in a centrifuge; carries your own growth factors", "Separada en centrífuga; lleva tus propios factores de crecimiento"] },
      { n: ["Nothing added", "Sin aditivos"], w: ["No drugs, no filler — the entire point is that it comes from you", "Sin medicamentos ni rellenos: el punto es que viene de ti"] },
    ],
    good: [["Hair thinning", "Pérdida de cabello"], ["Skin texture and tone", "Textura y tono de la piel"], ["Joint discomfort", "Molestia articular"]],
    caution: ["Not performed with an active infection, a bleeding or platelet disorder, during pregnancy, or on blood thinners without clearance. Results build over weeks and vary from person to person.",
      "No se realiza con infección activa, trastornos de sangrado o plaquetas, durante el embarazo, ni con anticoagulantes sin autorización. Los resultados aparecen en semanas y varían de persona a persona."],
    afterT: ["Mild swelling or tenderness at the site for a day or two is expected. Follow the clinician's guidance on anti-inflammatories.",
      "Es normal algo de hinchazón o sensibilidad en el área por uno o dos días. Sigue las indicaciones sobre antiinflamatorios."],
  },
  {
    id: "glow", color: T.aqua, mins: 30, price: 210,
    name: ["Glutathione Glow", "Glutatión Glow"], dose: ["50 mL IV", "50 mL IV"],
    what: ["A slow push of glutathione, the antioxidant your liver already makes and spends. Often added onto a Myers' rather than taken alone.",
      "Una aplicación lenta de glutatión, el antioxidante que tu hígado ya produce y consume. Suele añadirse a un Myers en vez de darse solo."],
    mix: [
      { n: ["Glutathione", "Glutatión"], w: ["Master antioxidant; supports the liver's detoxification pathways", "Antioxidante principal; apoya las vías de desintoxicación del hígado"] },
      { n: ["Sterile saline carrier", "Solución salina estéril"], w: ["Dilutes the push so it goes in comfortably", "Diluye la aplicación para que entre cómodamente"] },
    ],
    good: [["Oxidative stress", "Estrés oxidativo"], ["Add-on to any drip", "Añadido a cualquier suero"], ["Patients already on a plan", "Pacientes ya en un plan"]],
    caution: ["Glutathione is not FDA-approved for skin lightening and we don't sell it that way. Not for use in pregnancy or breastfeeding.",
      "El glutatión no está aprobado por la FDA para aclarar la piel y no lo vendemos así. No se usa en embarazo ni lactancia."],
    afterT: ["A faint sulphur taste during the push is normal. Nothing else to do afterwards.",
      "Un sabor leve a azufre durante la aplicación es normal. No hay nada más que hacer después."],
  },
  {
    id: "nad", color: T.rose, mins: 90, price: 395,
    name: ["NAD+ Infusion", "Infusión NAD+"], dose: ["250 mL IV", "250 mL IV"], tag: ["Slow drip", "Goteo lento"],
    what: ["A coenzyme every cell uses to make energy. It has to go in slowly — that's why this one books a long chair.",
      "Una coenzima que toda célula usa para producir energía. Tiene que entrar despacio: por eso se reserva como sesión larga."],
    mix: [
      { n: ["NAD+", "NAD+"], w: ["Coenzyme central to mitochondrial energy production and DNA repair", "Coenzima central en la producción de energía mitocondrial y la reparación del ADN"] },
      { n: ["Normal saline, 250 mL", "Solución salina, 250 mL"], w: ["Carrier; the rate is kept deliberately low", "Portador; la velocidad se mantiene baja a propósito"] },
    ],
    good: [["Mental fog", "Neblina mental"], ["Recovery and endurance", "Recuperación y resistencia"], ["A longer, quieter session", "Una sesión larga y tranquila"]],
    caution: ["Pushed too fast it causes chest tightness, cramping and nausea. We slow the rate rather than stop — tell your nurse the moment you feel it.",
      "Si entra muy rápido causa presión en el pecho, calambres y náuseas. Bajamos la velocidad en vez de parar: dile a tu enfermera en cuanto lo sientas."],
    afterT: ["Block out the full 90 minutes. Bring headphones.", "Reserva los 90 minutos completos. Trae audífonos."],
  },
  {
    id: "b12", color: T.pink, mins: 15, price: 45,
    name: ["B12 Energy Boost", "Refuerzo de Energía B12"], dose: ["1 mL IM", "1 mL IM"], tag: ["Walk-in", "Sin cita"],
    what: ["A single intramuscular shot. In and out in fifteen minutes, no line, no chair.",
      "Una sola inyección intramuscular. Entras y sales en quince minutos, sin vía ni sillón."],
    mix: [
      { n: ["Methylcobalamin (B12) 1000 mcg", "Metilcobalamina (B12) 1000 mcg"], w: ["Active form of B12; supports nerve function and red blood cell formation", "Forma activa de la B12; apoya la función nerviosa y la formación de glóbulos rojos"] },
      { n: ["Optional lipotropic blend", "Mezcla lipotrópica opcional"], w: ["Methionine, inositol and choline — often paired with the weight programme", "Metionina, inositol y colina: se combina a menudo con el programa de peso"] },
    ],
    good: [["Weekly energy top-up", "Refuerzo semanal de energía"], ["Vegetarian and vegan diets", "Dietas vegetarianas y veganas"], ["On metformin or acid reducers", "Uso de metformina o antiácidos"]],
    caution: ["If you're tired, ask us about checking a B12 level first — a shot is not a substitute for finding the cause.",
      "Si estás cansada, pregúntanos por medir tu nivel de B12 primero. Una inyección no sustituye encontrar la causa."],
    afterT: ["The injection site may ache for a day. Normal.", "El área de la inyección puede molestar un día. Es normal."],
  },
  {
    id: "glp", color: T.deep, mins: 20, price: 325,
    name: ["Weight Control Programme", "Programa de Control de Peso"], dose: ["weekly injection", "inyección semanal"],
    tag: ["Consult required", "Requiere consulta"],
    what: ["Supervised GLP-1 therapy with dose titration, check-ins and lab monitoring. A monthly programme, not a one-off visit.",
      "Terapia GLP-1 supervisada, con ajuste de dosis, seguimiento y laboratorios. Es un programa mensual, no una visita suelta."],
    mix: [
      { n: ["Semaglutide or tirzepatide", "Semaglutida o tirzepatida"], w: ["GLP-1 (and GIP) receptor agonists that slow gastric emptying and reduce appetite signalling", "Agonistas del receptor GLP-1 (y GIP) que retrasan el vaciado gástrico y reducen las señales de apetito"] },
      { n: ["Titration schedule", "Plan de ajuste de dosis"], w: ["Started low and stepped up to limit nausea", "Se empieza bajo y se sube gradualmente para limitar las náuseas"] },
      { n: ["B12 or lipotropic support", "Apoyo con B12 o lipotrópicos"], w: ["Frequently paired during the programme", "Se combina con frecuencia durante el programa"] },
    ],
    good: [["Patients who qualify by BMI", "Pacientes que califican por IMC"], ["Plateau after diet change", "Estancamiento tras cambiar la dieta"], ["Wanting supervision", "Quien busca supervisión clínica"]],
    caution: ["Not prescribed with a personal or family history of medullary thyroid carcinoma or MEN2, during pregnancy, or while breastfeeding. Requires a consult and labs before the first dose.",
      "No se receta con historial personal o familiar de carcinoma medular de tiroides o MEN2, ni en embarazo o lactancia. Requiere consulta y laboratorios antes de la primera dosis."],
    afterT: ["Eat smaller and slower. Nausea and constipation are the common early effects — call us before you stop.",
      "Come porciones más pequeñas y despacio. Las náuseas y el estreñimiento son los efectos comunes al inicio: llámanos antes de suspender."],
  },
];
const cat = (id) => CATALOG.find((s) => s.id === id);
const money = (n) => "$" + Math.round(n).toLocaleString();

const TIMES = ["9:00", "9:45", "10:30", "11:15", "12:00", "1:00", "1:45", "2:30", "3:15", "4:00", "4:45"];
const t2m = (t) => { const [h, m] = t.split(":").map(Number); return (h < 8 ? h + 12 : h) * 60 + m; };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const TEMPLATE = { 0: [], 1: TIMES, 2: TIMES, 3: TIMES, 4: TIMES, 5: TIMES, 6: TIMES.slice(1, 6) };
const dow = (ds) => new Date(ds + "T12:00:00").getDay();
const loc = (l) => (l ? "es-PR" : "en-US");
const pretty = (ds, l) => new Date(ds + "T12:00:00").toLocaleDateString(loc(l), { weekday: "short", month: "short", day: "numeric" });

const CH = {
  instagram: { icon: Instagram, label: ["Instagram", "Instagram"], color: T.pink },
  facebook: { icon: Facebook, label: ["Facebook", "Facebook"], color: "#3A62C4" },
  sms: { icon: Phone, label: ["Text", "Texto"], color: T.teal },
  email: { icon: Mail, label: ["Email", "Correo"], color: T.muted },
};

/* ============ storage ============ */
const KEY = "aa-clinic:v3";
async function loadDB() { try { const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function saveDB(db) { try { await window.storage.set(KEY, JSON.stringify(db)); } catch (e) { console.error(e); } }

let SEED = 7;
const rnd = () => { SEED = (SEED * 1103515245 + 12345) % 2147483648; return SEED / 2147483648; };

function freshDB() {
  SEED = 7;
  const names = ["Keila Belén", "Danielle Porter", "Marisol Rivera", "Zoraida Pagán", "Tanya Morales", "Camila Ortiz", "Renée Adjei", "Yaritza Colón", "Brooke Sandoval"];
  const patients = names.map((n, i) => ({
    id: "p" + i, name: n, phone: "(787) 555-01" + (10 + i),
    since: iso(addDays(-420 + i * 44)), plan: i % 3 === 0 ? "Drip Club" : i % 3 === 1 ? "GLP-1" : "—",
    creditC: i === 1 ? 50 : i === 4 ? 25 : 0,
  }));
  const ledger = []; let receipt = 2600;
  for (let d = 250; d >= 1; d--) {
    const day = addDays(-d); if (day.getDay() === 0) continue;
    const n = rnd() < 0.35 ? 0 : rnd() < 0.6 ? 1 : 2;
    for (let k = 0; k < n; k++) {
      const s = CATALOG[Math.floor(rnd() * CATALOG.length)];
      const p = patients[Math.floor(rnd() * patients.length)];
      ledger.push({ id: "L" + receipt, date: iso(day), patientId: p.id, svcId: s.id, amt: s.price,
        method: ["Visa 4412", "ATH Móvil", "Amex 1007", "HSA 3391", "Mastercard 2290"][Math.floor(rnd() * 5)], receipt: "R-" + receipt++ });
    }
  }
  const today = iso(new Date());
  const appts = [
    { id: "a1", date: today, time: "9:00", patientId: "p2", svcId: "hydra", status: "done" },
    { id: "a2", date: today, time: "10:30", patientId: "p0", svcId: "nad", status: "arrived" },
    { id: "a3", date: today, time: "12:00", patientId: "p4", svcId: "b12", status: "booked" },
    { id: "a4", date: today, time: "1:45", patientId: "p3", svcId: "glp", status: "booked" },
    { id: "a5", date: today, time: "3:15", patientId: "p5", svcId: "prp", status: "booked" },
    { id: "a6", date: iso(addDays(1)), time: "10:30", patientId: "p1", svcId: "glp", status: "booked" },
    { id: "a7", date: iso(addDays(2)), time: "2:30", patientId: "p6", svcId: "myers", status: "booked" },
  ];
  return {
    lang: 1, patients, ledger, appts, closed: {}, paused: {}, nextReceipt: receipt, campaigns: [],
    promoLive: { referral: true, newclient: true },
    post: { svcId: "nad", caption: ["Ninety quiet minutes. NAD+ chairs open Thursday afternoon — link in bio.", "Noventa minutos de calma. Sillones de NAD+ abiertos el jueves en la tarde: enlace en la bio."] },
    threads: [
      { id: "t1", ch: "instagram", who: "@gigi.fitmom", msgs: [{ from: "them", text: "hola!! cuánto cuesta el programa de control de peso al mes?", at: "4m" }] },
      { id: "t2", ch: "instagram", who: "@rosariomntx", msgs: [{ from: "them", text: "¿necesito laboratorios antes del suero de NAD?", at: "22m" }] },
      { id: "t3", ch: "facebook", who: "Elena Vázquez", msgs: [{ from: "them", text: "¿Puedo llevar a mi hermana el sábado? ¿aplica el referido?", at: "1h" }] },
      { id: "t4", ch: "sms", who: "Danielle Porter", msgs: [{ from: "them", text: "Running 10 min late, sorry!", at: "2h" }] },
      { id: "t5", ch: "email", who: "tanya.m@email.com", msgs: [{ from: "them", text: "Requesting a receipt for my HSA card", at: "5h" }] },
    ],
  };
}

/* ============ AI ============ */
async function ask(prompt, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  return data.content.map((c) => (c.type === "text" ? c.text : "")).join("");
}
const GUARD = (l) =>
  "You write marketing copy for AA Wellness, the patient app of A&A Healthcare Services LLC in Loíza, Puerto Rico — a clinic founded by Astrid Rivera, RN, " +
  "offering vitamin IV therapy, PRP and supervised weight control. Never make medical claims, never promise outcomes, " +
  "never diagnose, never reference a patient's health information. Warm, confident, concise. No emoji spam. " +
  (l ? "Write everything in natural Puerto Rican Spanish, using tú." : "Write everything in English.");

/* ============ app ============ */
export default function App() {
  const [db, setDb] = useState(null);
  const [side, setSide] = useState("owner");
  const [tab, setTab] = useState("today");
  useEffect(() => { (async () => { const d = await loadDB(); setDb(d || freshDB()); })(); }, []);
  const update = (fn) => setDb((prev) => { const next = fn({ ...prev }); saveDB(next); return next; });
  const reset = () => { const d = freshDB(); setDb(d); saveDB(d); };

  if (!db) return (<><style>{CSS}</style><div className="app boot"><Loader2 className="spin" size={20} /> {S.opening[1]}</div></>);
  const l = db.lang; const t = (k) => S[k][l];

  return (
    <LangCtx.Provider value={l}>
      <style>{CSS}</style>
      <div className="app">
        <div className="topline" />
        <span className="sheen" aria-hidden="true" />
        <header className="top">
          <div className="brand">
            <img className="mark" src="./assets/aa-logo.png" alt="A&amp;A Healthcare Services LLC" />
            <div><div className="bname">Wellness</div>
              <div className="bsub"><MapPin size={9} /> A&amp;A Healthcare · Loíza, PR</div></div>
          </div>
          <div className="tright">
            <div className="seg lang">
              <button className={l === 0 ? "on" : ""} onClick={() => update((d) => ({ ...d, lang: 0 }))}>EN</button>
              <button className={l === 1 ? "on" : ""} onClick={() => update((d) => ({ ...d, lang: 1 }))}>ES</button>
            </div>
            <button className="reset" onClick={reset}><RefreshCw size={13} /></button>
            <div className="seg">
              <button className={side === "owner" ? "on" : ""} onClick={() => setSide("owner")}>{t("owner")}</button>
              <button className={side === "patient" ? "on" : ""} onClick={() => setSide("patient")}>{t("patient")}</button>
            </div>
          </div>
        </header>

        {side === "owner" ? (
          <div className="shell">
            <div className="shellInner">
              <nav className="rail">
                <span className="raillogo">
                  <img src="./assets/aa-logo.png" alt="A&amp;A Healthcare Services LLC" />
                  <em>A&amp;A<br />WELLNESS</em>
                </span>
                <ul>
                  {[["today", LayoutGrid], ["sched", CalendarDays], ["pts", Users], ["inbox", MessageSquare], ["studio", Sparkles], ["dash", TrendingUp]]
                    .map(([k, I]) => (
                      <li key={k}><button className={tab === k ? "nav on" : "nav"} onClick={() => setTab(k)}>
                        <I size={17} strokeWidth={1.7} /><span>{t(k)}</span>
                        {k === "inbox" && <em className="dot">{db.threads.filter((x) => x.msgs[x.msgs.length - 1].from === "them").length}</em>}
                      </button></li>))}
                </ul>
                <div className="booklink">
                  <span>{t("bookingLink")}</span>
                  <em>aawellness.pr/<b>reservar</b></em>
                </div>
              </nav>
              <main className="main">
                <Arcs />
                <div className="mainInner">
                  {tab === "today" && <Today db={db} update={update} go={setTab} />}
                  {tab === "sched" && <Schedule db={db} update={update} />}
                  {tab === "pts" && <Patients db={db} />}
                  {tab === "inbox" && <Inbox db={db} update={update} />}
                  {tab === "studio" && <Studio db={db} update={update} />}
                  {tab === "dash" && <Dashboard db={db} />}
                </div>
              </main>
            </div>
          </div>
        ) : <PatientApp db={db} update={update} />}
      </div>
    </LangCtx.Provider>
  );
}

const openSlots = (db, ds) => {
  const tpl = TEMPLATE[dow(ds)] || [];
  const taken = db.appts.filter((a) => a.date === ds).map((a) => a.time);
  return tpl.filter((t) => !db.closed[ds + "|" + t] && !taken.includes(t));
};
const pt = (db, id) => db.patients.find((p) => p.id === id) || { name: "—", creditC: 0 };

/* ============ TODAY ============ */
function Today({ db, update, go }) {
  const l = useL(); const t = (k) => S[k][l];
  const ds = iso(new Date());
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const todays = db.appts.filter((a) => a.date === ds).sort((a, b) => t2m(a.time) - t2m(b.time));
  const open = openSlots(db, ds).filter((x) => t2m(x) > now);
  const expected = todays.reduce((s, a) => s + cat(a.svcId).price, 0);
  const collected = db.ledger.filter((x) => x.date === ds).reduce((s, x) => s + x.amt, 0);
  const unread = db.threads.filter((x) => x.msgs[x.msgs.length - 1].from === "them").length;
  const liveN = PROMOS.filter((p) => db.promoLive[p.id]).length;
  const [pay, setPay] = useState(null);

  const setStatus = (id, status) => update((d) => ({ ...d, appts: d.appts.map((a) => (a.id === id ? { ...a, status } : a)) }));
  const takePayment = (a, method, useCredit) => update((d) => {
    const p = d.patients.find((x) => x.id === a.patientId);
    const cr = useCredit ? Math.min(p?.creditC || 0, cat(a.svcId).price) : 0;
    return {
      ...d,
      patients: d.patients.map((x) => (x.id === a.patientId ? { ...x, creditC: (x.creditC || 0) - cr } : x)),
      appts: d.appts.map((x) => (x.id === a.id ? { ...x, status: "done" } : x)),
      ledger: [...d.ledger, { id: "L" + d.nextReceipt, date: ds, patientId: a.patientId, svcId: a.svcId, amt: cat(a.svcId).price - cr, method, receipt: "R-" + d.nextReceipt }],
      nextReceipt: d.nextReceipt + 1,
    };
  });

  return (<>
    <div className="phead">
      <span className="eyebrow">{new Date().toLocaleDateString(loc(l), { weekday: "long", month: "long", day: "numeric" })}</span>
      <h2>{t("today")}</h2>
    </div>

    <div className="kpis">
      <Kpi c={T.pink} k={t("onBooks")} v={todays.length} d={`${open.length} ${t("slotsOpen")}`} />
      <Kpi c={T.blueDeep} k={t("expected")} v={money(expected)} d={`${money(collected)} ${t("collected")}`} />
      <Kpi c={T.gold} k={t("waiting")} v={unread} d={t("msgsUn")} />
      <Kpi c={T.teal} k={t("promosOn")} v={`${liveN} ${t("of")} ${PROMOS.length}`} d={t("promos")} />
    </div>

    <div className="two">
      <section className="card">
        <div className="chead"><h3>{t("theDay")}</h3><span className="unit">{todays.length} {t("booked")}</span></div>
        {todays.length === 0 && <div className="empty">{t("noBookings")}</div>}
        <ul className="agenda">
          {todays.map((a) => {
            const s = cat(a.svcId); const past = t2m(a.time) < now;
            return (
              <li key={a.id} className={"appt " + (a.status === "done" ? "done" : past ? "now" : "next")}>
                <span className="time">{a.time}</span>
                <span className="stripe" style={{ background: s.color }} />
                <div className="who"><b>{pt(db, a.patientId).name}</b><span>{s.name[l]} · {s.mins} min</span></div>
                {a.status === "done" ? <span className="paid"><Check size={11} strokeWidth={3} /> {t("paid")}</span>
                  : <div className="rowacts">
                      {a.status === "booked" && <button className="mini" onClick={() => setStatus(a.id, "arrived")}>{t("arrived")}</button>}
                      <button className="mini solid" onClick={() => setPay(a)}>{t("checkout")}</button>
                    </div>}
              </li>);
          })}
        </ul>
      </section>

      <div className="stack">
        <section className="card">
          <div className="chead"><h3>{t("openLeft")}</h3><span className="unit">{open.length} {t("free")}</span></div>
          {open.length === 0 ? <div className="empty sm">{t("fullyBooked")}</div> : (<>
            <div className="slotchips">{open.map((x) => <span key={x} className="schip">{x}</span>)}</div>
            <button className="btn ghost wide" onClick={() => go("studio")}><Sparkles size={14} /> {t("fillPost")}</button>
          </>)}
        </section>
        <section className="card">
          <div className="chead"><h3>Instagram</h3><span className="unit">{t("scheduled")}</span></div>
          <div className="postrow">
            <span className="pthumb" style={{ background: `linear-gradient(145deg,${cat(db.post.svcId).color},${T.ink})` }}><Instagram size={16} color="#fff" /></span>
            <div><b>{t("tomorrow6")}</b><span>{db.post.caption[l]}</span></div>
          </div>
        </section>
      </div>
    </div>

    <div className="two">
      {PROMOS.map((p) => {
        const on = db.promoLive[p.id]; const I = p.icon;
        return (
          <section key={p.id} className={"promo" + (on ? "" : " off")}>
            <div className="promoInner">
              <div className="promoTop">
                <span className="promoIcon"><I size={15} /></span>
                <button className="mini gold" onClick={() => update((d) => ({ ...d, promoLive: { ...d.promoLive, [p.id]: !on } }))}>
                  {on ? t("pause") : t("resume")}</button>
              </div>
              <span className="script">{p.script[l]}</span>
              <h3 className="promoHead">{p.head[l]}</h3>
              <span className="goldrule" />
              <p className="promoBlurb">{p.blurb[l]}</p>
              <div className="steps">
                {p.steps.map((s) => (
                  <div className="step" key={s.a[0]} style={{ borderColor: s.c }}>
                    <span>{s.a[l]}</span><b style={{ color: s.c }}>{s.b[l]}</b>
                  </div>))}
              </div>
              <div className="terms"><b>{t("important")}:</b> {p.terms[l]}</div>
            </div>
          </section>);
      })}
    </div>

    <section className="card">
      <div className="chead"><h3>{t("ivMenu")}</h3><span className="unit">{t("tapPause")}</span></div>
      <div className="menugrid">
        {CATALOG.map((s) => {
          const off = db.paused[s.id];
          return (
            <button key={s.id} className={"mtile" + (off ? " off" : "")} onClick={() => update((d) => ({ ...d, paused: { ...d.paused, [s.id]: !d.paused[s.id] } }))}>
              <span className="mbar" style={{ background: off ? T.line : s.color }} />
              <b>{s.name[l]}</b>
              <em className="mono">{off ? t("paused") : `${money(s.price)} · ${s.mins} min`}</em>
            </button>);
        })}
      </div>
    </section>

    {pay && <PayModal db={db} a={pay} close={() => setPay(null)} take={takePayment} />}
  </>);
}

function PayModal({ db, a, close, take }) {
  const l = useL(); const t = (k) => S[k][l];
  const p = pt(db, a.patientId); const s = cat(a.svcId);
  const [useCredit, setUseCredit] = useState((p.creditC || 0) > 0);
  const cr = useCredit ? Math.min(p.creditC || 0, s.price) : 0;
  return (
    <div className="sheet" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={close}><X size={16} /></button>
        <h3>{t("checkoutT")} {p.name}</h3>
        <p className="sub">{s.name[l]} · {money(s.price)}</p>
        {(p.creditC || 0) > 0 && (
          <button className={"creditRow" + (useCredit ? " on" : "")} onClick={() => setUseCredit(!useCredit)}>
            <span className="ckbox">{useCredit && <Check size={11} strokeWidth={3} />}</span>
            <Gift size={13} /> {t("applyCredit")} <b>{money(p.creditC)}</b>
          </button>)}
        <div className="totalRow"><span>{t("total")}</span><b>{money(s.price - cr)}</b></div>
        <div className="pills">{S.payMethods[l].map((m) => <button key={m} className="pill" onClick={() => { take(a, m, useCredit); close(); }}>{m}</button>)}</div>
        <p className="fine">{t("payNote")}</p>
      </div>
    </div>);
}

/* ============ SCHEDULE ============ */
function Schedule({ db, update }) {
  const l = useL(); const t = (k) => S[k][l];
  const days = Array.from({ length: 7 }, (_, i) => iso(addDays(i)));
  const toggle = (k) => update((d) => ({ ...d, closed: { ...d.closed, [k]: !d.closed[k] } }));
  return (<>
    <Head eyebrow={t("next7")} title={t("sched")} />
    <p className="lede">{t("schedLede")}</p>
    <div className="card grid-wrap">
      <div className="grid" style={{ gridTemplateColumns: `62px repeat(${days.length}, minmax(80px,1fr))` }}>
        <span />
        {days.map((d) => <span key={d} className="gh">{pretty(d, l)}</span>)}
        {TIMES.map((tm) => (
          <React.Fragment key={tm}>
            <span className="gt">{tm}</span>
            {days.map((d) => {
              const a = db.appts.find((x) => x.date === d && x.time === tm);
              if (a) { const s = cat(a.svcId); return <div key={d + tm} className="slot bk" style={{ borderColor: s.color, color: s.color }}><b>{pt(db, a.patientId).name.split(" ")[0]}</b></div>; }
              if (!(TEMPLATE[dow(d)] || []).includes(tm)) return <div key={d + tm} className="slot na" />;
              const shut = db.closed[d + "|" + tm];
              return <button key={d + tm} className={shut ? "slot shut" : "slot open"} onClick={() => toggle(d + "|" + tm)}>{shut ? t("closed") : t("open")}</button>;
            })}
          </React.Fragment>))}
      </div>
    </div>
    <div className="two">
      <section className="card">
        <div className="chead"><h3>{t("calendars")}</h3></div>
        <ul className="conns">
          {[["Google Calendar", t("twoWay")], ["Outlook", t("twoWay")], [t("igBtn"), t("liveW")], [t("fbBook"), t("liveW")]].map(([a, b]) => (
            <li key={a}><span className="ok"><Check size={12} strokeWidth={3} /></span>{a}<em>{b}</em></li>))}
        </ul>
        <p className="fine">{t("connNote")}</p>
      </section>
      <section className="card">
        <div className="chead"><h3>{t("rules")}</h3></div>
        <ul className="rules">{["r1", "r2", "r3", "r4"].map((k) => <li key={k}>{t(k)}</li>)}</ul>
      </section>
    </div>
  </>);
}

/* ============ PATIENTS ============ */
function Patients({ db }) {
  const l = useL(); const t = (k) => S[k][l];
  const [sel, setSel] = useState(null);
  const today = iso(new Date());
  const rows = db.patients.map((p) => {
    const spend = db.ledger.filter((x) => x.patientId === p.id);
    const next = db.appts.filter((a) => a.patientId === p.id && a.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    return { ...p, visits: spend.length, ltv: spend.reduce((s, x) => s + x.amt, 0), next, hist: spend.slice(-6).reverse() };
  }).sort((a, b) => b.ltv - a.ltv);

  return (<>
    <Head eyebrow={`N=${rows.length} ${t("patients")}`} title={t("pts")} />
    <div className="card">
      <table className="tbl">
        <thead><tr><th>{t("patientC")}</th><th>{t("plan")}</th><th>{t("credit")}</th><th>{t("visits")}</th><th>{t("lifetime")}</th><th>{t("nextVisit")}</th><th /></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} onClick={() => setSel(p)}>
              <td><div className="pcell"><span className="av">{p.name.split(" ").map((x) => x[0]).join("")}</span><div><b>{p.name}</b><em>{p.phone}</em></div></div></td>
              <td><span className="chip">{p.plan}</span></td>
              <td className="mono">{p.creditC ? <span className="creditPill">{money(p.creditC)}</span> : "—"}</td>
              <td className="mono">{p.visits}</td>
              <td className="mono">{money(p.ltv)}</td>
              <td className={p.next && p.next.date === today ? "mono hot" : "mono"}>{p.next ? (p.next.date === today ? `${t("today")} ${p.next.time}` : pretty(p.next.date, l)) : "—"}</td>
              <td><ChevronRight size={15} color={T.muted} /></td>
            </tr>))}
        </tbody>
      </table>
    </div>
    {sel && (
      <div className="sheet" onClick={() => setSel(null)}>
        <div className="panel" onClick={(e) => e.stopPropagation()}>
          <button className="x" onClick={() => setSel(null)}><X size={16} /></button>
          <span className="av big">{sel.name.split(" ").map((x) => x[0]).join("")}</span>
          <h3>{sel.name}</h3>
          <p className="sub">{sel.plan} · {sel.phone}</p>
          <div className="stats">
            <div><b className="mono">{sel.visits}</b><span>{t("visits")}</span></div>
            <div><b className="mono">{money(sel.ltv)}</b><span>{t("lifetime")}</span></div>
            <div><b className="mono">{money(sel.creditC || 0)}</b><span>{t("credit")}</span></div>
          </div>
          <h4 className="mini-h">{t("recentVisits")}</h4>
          <ul className="hist">
            {sel.hist.map((x) => (
              <li key={x.id}><span className="stripe" style={{ background: cat(x.svcId).color }} />
                <div><b>{cat(x.svcId).name[l]}</b><em className="mono">{pretty(x.date, l)} · {x.receipt}</em></div>
                <span className="mono">{money(x.amt)}</span></li>))}
            {sel.hist.length === 0 && <li className="empty sm">{t("noVisits")}</li>}
          </ul>
          <div className="note">{t("chartNote")}</div>
        </div>
      </div>)}
  </>);
}

/* ============ INBOX ============ */
function Inbox({ db, update }) {
  const l = useL(); const t = (k) => S[k][l];
  const [id, setId] = useState(db.threads[0].id);
  const [draft, setDraft] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const th = db.threads.find((x) => x.id === id) || db.threads[0];
  const last = th.msgs[th.msgs.length - 1];

  async function suggest() {
    setBusy(true); setErr("");
    try {
      const out = await ask(
        `A patient messaged the clinic on ${CH[th.ch].label[0]}: "${last.text}"\n\n` +
        `Menu: ${CATALOG.map((s) => `${s.name[0]} ${money(s.price)}`).join("; ")}. ` +
        `Weight control requires a consult and labs before the first dose. PRP requires an evaluation.\n` +
        `Live promotions: new clients get 20% off a first appointment of $150+, and no deposit on the second follow-up. ` +
        `Referrals earn $50 credit if the referred person's first purchase is $250+, otherwise $25.\n\n` +
        `Write one reply under 45 words the front desk can send as-is. Answer them, then invite them to book. ` +
        `Do not give medical advice or ask for health details in a social DM.`, GUARD(l));
      setDraft(out.trim());
    } catch { setErr(t("aiFail")); }
    setBusy(false);
  }
  const send = () => {
    const text = draft.trim(); if (!text) return;
    update((d) => ({ ...d, threads: d.threads.map((x) => (x.id === th.id ? { ...x, msgs: [...x.msgs, { from: "us", text, at: "now" }] } : x)) }));
    setDraft("");
  };
  const Icon = CH[th.ch].icon;

  return (<>
    <Head eyebrow={t("channels")} title={t("inbox")} />
    <div className="two inbox">
      <section className="card list">
        {db.threads.map((x) => {
          const C = CH[x.ch]; const I = C.icon; const lm = x.msgs[x.msgs.length - 1];
          return (
            <button key={x.id} className={"thread" + (x.id === th.id ? " on" : "")} onClick={() => { setId(x.id); setDraft(""); setErr(""); }}>
              <span className="chi" style={{ background: C.color }}><I size={12} color="#fff" strokeWidth={2} /></span>
              <div><b>{x.who} {lm.from === "them" && <i className="new" />}</b><span>{lm.text}</span></div>
              <em className="mono">{lm.at}</em>
            </button>);
        })}
      </section>
      <section className="card convo">
        <div className="chead"><h3><Icon size={15} strokeWidth={1.8} style={{ verticalAlign: -2, marginRight: 6 }} />{th.who}</h3><span className="unit">{CH[th.ch].label[l]}</span></div>
        <div className="msgs">{th.msgs.map((m, i) => <div key={i} className={"bubble " + (m.from === "them" ? "them" : "mine")}>{m.text}</div>)}</div>
        <div className="composer">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("writeReply")} />
          <div className="crow">
            <button className="btn ghost" onClick={suggest} disabled={busy}>{busy ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}{busy ? t("writing") : t("draftReply")}</button>
            <button className="btn" onClick={send} disabled={!draft.trim()}><Send size={13} /> {t("send")}</button>
          </div>
        </div>
        {err && <p className="err">{err}</p>}
        <p className="fine">{t("dmNote")}</p>
      </section>
    </div>
  </>);
}

/* ============ STUDIO ============ */
function Studio({ db, update }) {
  const l = useL(); const t = (k) => S[k][l];
  const [goal, setGoal] = useState(S.goalDef[l]);
  const [svcId, setSvcId] = useState("hydra");
  const [kind, setKind] = useState(0);
  const [out, setOut] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const s = cat(svcId);
  useEffect(() => { setGoal(S.goalDef[l]); }, [l]);

  async function make() {
    setBusy(true); setErr(""); setOut(null);
    try {
      const raw = await ask(
        `Create a promotional ${S.kinds[0][kind].toLowerCase()} for this clinic.\n` +
        `Service: ${s.name[0]} (${s.dose[0]}), ${money(s.price)}. What it is: ${s.what[0]}\n` +
        `Goal: ${goal}\n\nRespond with ONLY a JSON object, no fences, keys: ` +
        `"badge" (max 6 words), "script" (ONE short word to set in a script face, e.g. "Feel" or "Siéntete"), ` +
        `"headline" (max 5 words, will be set in caps), "sub" (one sentence), ` +
        `"bullets" (array of exactly 3 short strings), "cta" (max 4 words), ` +
        `"caption" (Instagram caption, 2 short sentences), "hashtags" (array of 5, no #), ` +
        `"fine" (one short eligibility/honesty line).`, GUARD(l));
      setOut(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setErr(t("aiFail")); }
    setBusy(false);
  }
  const publish = () => update((d) => ({
    ...d, post: { svcId, caption: [out.caption, out.caption] },
    campaigns: [{ id: "c" + Date.now(), svcId, kind: S.kinds[l][kind], data: out, created: iso(new Date()) }, ...d.campaigns],
  }));

  return (<>
    <Head eyebrow={t("studioSub")} title={t("studio")} />
    <div className="two studio">
      <section className="card">
        <div className="chead"><h3>{t("brief")}</h3></div>
        <label className="fl">{t("promoting")}</label>
        <div className="pills">{CATALOG.map((x) => (
          <button key={x.id} className={"pill" + (svcId === x.id ? " on" : "")} style={svcId === x.id ? { borderColor: x.color, color: x.color } : {}} onClick={() => setSvcId(x.id)}>
            <i style={{ background: x.color }} />{x.name[l]}</button>))}</div>
        <label className="fl">{t("format")}</label>
        <div className="pills">{S.kinds[l].map((k, i) => <button key={k} className={"pill" + (kind === i ? " on" : "")} onClick={() => setKind(i)}>{k}</button>)}</div>
        <label className="fl">{t("goalQ")}</label>
        <textarea className="ta" rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} />
        <button className="btn wide" onClick={make} disabled={busy}>{busy ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}{busy ? t("making") : t("makeIt")}</button>
        {err && <p className="err">{err}</p>}
        {db.campaigns.length > 0 && (<>
          <label className="fl">{t("saved")}</label>
          <ul className="saved">{db.campaigns.slice(0, 5).map((c) => (
            <li key={c.id}><span className="stripe" style={{ background: cat(c.svcId).color }} />
              <div><b>{c.data.headline}</b><em className="mono">{c.kind} · {pretty(c.created, l)}</em></div></li>))}</ul>
        </>)}
      </section>

      <section className="card">
        <div className="chead"><h3>{t("draft")}</h3><span className="unit">{t("yoursToEdit")}</span></div>
        {!out && !busy && <div className="empty">{t("studioEmpty")}</div>}
        {busy && <div className="empty">{t("working")}</div>}
        {out && (<>
          <div className="poster">
            <div className="posterInner">
              <span className="pbadge">{out.badge}</span>
              <span className="script big">{out.script}</span>
              <h4>{out.headline}</h4>
              <span className="goldrule" />
              <p>{out.sub}</p>
              <ul>{(out.bullets || []).map((b, i) => <li key={i}><Check size={12} strokeWidth={3} /> {b}</li>)}</ul>
              <span className="pcta">{out.cta}</span>
              <span className="pfoot">A&amp;A Healthcare Services LLC · Loíza, PR · {s.name[l]}</span>
            </div>
          </div>
          <div className="cap">
            <div className="caphead"><Instagram size={13} /> {t("caption")}</div>
            <p>{out.caption}</p>
            <p className="tags2">{(out.hashtags || []).map((h) => "#" + h).join("  ")}</p>
          </div>
          <p className="fine">{out.fine}</p>
          <div className="acts"><button className="btn" onClick={publish}>{t("makeLive")}</button></div>
        </>)}
      </section>
    </div>
  </>);
}

/* ============ DASHBOARD ============ */
function Dashboard({ db }) {
  const l = useL(); const t = (k) => S[k][l];
  const [period, setPeriod] = useState("month");
  const from = useMemo(() => {
    const n = new Date();
    if (period === "week") return iso(addDays(-6));
    if (period === "month") return iso(new Date(n.getFullYear(), n.getMonth(), 1));
    return iso(new Date(n.getFullYear(), 0, 1));
  }, [period]);
  const rows = db.ledger.filter((x) => x.date >= from);
  const total = rows.reduce((s, x) => s + x.amt, 0);
  const byService = CATALOG.map((s) => ({ ...s, rev: rows.filter((x) => x.svcId === s.id).reduce((a, x) => a + x.amt, 0), n: rows.filter((x) => x.svcId === s.id).length }));
  const max = Math.max(1, ...byService.map((r) => r.rev));
  const [fill, setFill] = useState(false);
  useEffect(() => { setFill(false); const x = setTimeout(() => setFill(true), 60); return () => clearTimeout(x); }, [period]);
  const uniq = new Set(rows.map((x) => x.patientId)).size;
  const top = [...byService].sort((a, b) => b.rev - a.rev)[0];

  return (<>
    <div className="phead dhead">
      <div><span className="eyebrow">{t("since")} {pretty(from, l)}</span><h2>{t("dash")}</h2></div>
      <div className="seg small">{[["week", t("week")], ["month", t("month")], ["ytd", t("ytd")]].map(([k, lb]) => (
        <button key={k} className={period === k ? "on" : ""} onClick={() => setPeriod(k)}>{lb}</button>))}</div>
    </div>
    <div className="kpis">
      <Kpi c={T.pink} k={t("revenue")} v={money(total)} d={`${rows.length} ${t("treatments")}`} />
      <Kpi c={T.blueDeep} k={t("avgTicket")} v={money(rows.length ? total / rows.length : 0)} d={t("perVisit")} />
      <Kpi c={T.gold} k={t("seen")} v={uniq} d={t("uniqIn")} />
      <Kpi c={T.teal} k={t("topSeller")} v={top ? top.name[l].split(" ")[0] : "—"} d={top ? money(top.rev) : ""} />
    </div>
    <section className="card">
      <div className="chead"><h3>{t("whereRev")}</h3><span className="unit">{period === "week" ? t("last7") : period === "month" ? t("thisMonth") : t("ytdShort")}</span></div>
      <div className="vials">
        {byService.map((r, i) => (
          <div className="vial" key={r.id}>
            <div className="tube"><span className="grad" />
              <div className="liquid" style={{ height: fill ? `${(r.rev / max) * 100}%` : "0%", background: r.color, transitionDelay: `${i * 60}ms` }} /></div>
            <div className="vlabel"><b>{money(r.rev)}</b><span>{r.name[l]}</span><em>{r.n} × {money(r.price)}</em></div>
          </div>))}
      </div>
    </section>
    <section className="card">
      <div className="chead"><h3>{t("payments")}</h3><span className="unit">{t("autoReceipts")}</span></div>
      <table className="tbl">
        <thead><tr><th>{t("date")}</th><th>{t("patientC")}</th><th>{t("service")}</th><th>{t("method")}</th><th>{t("receipt")}</th><th className="right">{t("amount")}</th></tr></thead>
        <tbody>
          {[...rows].reverse().slice(0, 12).map((x) => (
            <tr key={x.id}><td className="mono">{pretty(x.date, l)}</td><td><b>{pt(db, x.patientId).name}</b></td>
              <td>{cat(x.svcId).name[l]}</td><td className="mono">{x.method}</td><td className="mono link">{x.receipt}</td>
              <td className="mono right">{money(x.amt)}</td></tr>))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty sm">{t("noPay")}</div>}
    </section>
  </>);
}

/* ============ PATIENT APP ============ */
function PatientApp({ db, update }) {
  const l = useL(); const t = (k) => S[k][l];
  const [view, setView] = useState({ s: "menu" });
  const svcs = CATALOG.filter((s) => !db.paused[s.id]);
  const promos = PROMOS.filter((p) => db.promoLive[p.id]);

  return (
    <div className="pwrap">
      <div className="phoneFrame"><div className="phone">
        <span className="parcTop" aria-hidden="true"><i /></span>
        <span className="parcBot" aria-hidden="true"><i /></span>
        <div className="phoneTop">
          <span className="phoneBrand">
            <img src="./assets/aa-logo.png" alt="A&amp;A Healthcare Services LLC" />
            <span><b>WELLNESS</b><em>Loíza, PR</em></span>
          </span>
          <span className="phoneAv">DP</span>
        </div>
        <div className="pcard">
        {view.s === "menu" && (<>
          <div className="phero">
            <span className="script">{t("heroScript")}</span>
            <h2>{t("heroRest")}</h2>
            <span className="goldrule" />
            <span className="founder">{t("founder")}</span>
          </div>
          {promos.length > 0 && (
            <div className="promoStrip">
              {promos.map((p) => (
                <div className="pstrip" key={p.id}>
                  <span className="script sm">{p.script[l]}</span>
                  <b>{p.head[l]}</b>
                  <em>{p.steps[0].b[l]}</em>
                </div>))}
            </div>)}
          <div className="plist">
            {svcs.map((x) => (
              <button key={x.id} className="pitem" onClick={() => setView({ s: "detail", id: x.id })}>
                <span className="pbar" style={{ background: x.color }} />
                <div><b>{x.name[l]} {x.tag && <i className="tagi" style={{ color: x.color, borderColor: x.color }}>{x.tag[l]}</i>}</b>
                  <em>{x.dose[l]} · {x.mins} min</em></div>
                <span className="mono price">{money(x.price)}</span>
              </button>))}
          </div>
          <p className="pfine">{t("menuFine")}</p>
        </>)}
        {view.s === "detail" && <Detail s={cat(view.id)} back={() => setView({ s: "menu" })} book={() => setView({ s: "book", id: view.id })} />}
        {view.s === "book" && <Book db={db} update={update} s={cat(view.id)} back={() => setView({ s: "detail", id: view.id })} done={(d) => setView({ s: "done", ...d })} />}
        {view.s === "done" && (
          <div className="done">
            <span className="tick2"><Check size={26} strokeWidth={3} /></span>
            <h2>{t("youreBooked")}</h2>
            <p className="dline"><Clock size={14} /> {pretty(view.date, l)} {t("at")} {view.time}</p>
            <p className="dsvc">{cat(view.id).name[l]}</p>
            <div className="dbox">{t("doneBox")}</div>
            <button className="btn ghost" onClick={() => setView({ s: "menu" })}>{t("backMenu")}</button>
          </div>)}
        </div>
      </div></div>
      <p className="pnote">{t("pNote")}</p>
    </div>);
}

function Detail({ s, back, book }) {
  const l = useL(); const t = (k) => S[k][l];
  return (<>
    <button className="back" onClick={back}><ArrowLeft size={13} /> {t("menu")}</button>
    <div className="dhero" style={{ background: `linear-gradient(148deg, ${s.color} 0%, ${T.ink} 130%)` }}>
      <span className="dhdose mono">{s.dose[l]} · {s.mins} min</span>
      <h2>{s.name[l]}</h2>
      <span className="dhprice mono">{money(s.price)}</span>
    </div>
    <p className="dwhat">{s.what[l]}</p>
    <h4 className="mini-h"><Droplet size={12} /> {t("inBag")}</h4>
    <ul className="mix">{s.mix.map((m) => <li key={m.n[0]}><b>{m.n[l]}</b><span>{m.w[l]}</span></li>)}</ul>
    <h4 className="mini-h">{t("bookedFor")}</h4>
    <div className="goods">{s.good.map((g) => <span key={g[0]} className="chip">{g[l]}</span>)}</div>
    <div className="warn"><AlertTriangle size={14} /><p>{s.caution[l]}</p></div>
    <h4 className="mini-h">{t("after")}</h4>
    <p className="dafter">{s.afterT[l]}</p>
    <button className="btn wide" onClick={book}>{t("bookThis")}</button>
    <p className="pfine">{t("infoFine")}</p>
  </>);
}

function Book({ db, update, s, back, done }) {
  const l = useL(); const t = (k) => S[k][l];
  const days = Array.from({ length: 10 }, (_, i) => iso(addDays(i))).filter((d) => openSlots(db, d).length);
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState(null); const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const slots = date ? openSlots(db, date) : [];
  const confirm = () => {
    update((d) => {
      let p = d.patients.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
      let patients = d.patients;
      if (!p) { p = { id: "p" + Date.now(), name: name.trim(), phone, since: iso(new Date()), plan: "—", creditC: 0 }; patients = [...d.patients, p]; }
      return { ...d, patients, appts: [...d.appts, { id: "a" + Date.now(), date, time, patientId: p.id, svcId: s.id, status: "booked" }] };
    });
    done({ id: s.id, date, time });
  };
  return (<>
    <button className="back" onClick={back}><ArrowLeft size={13} /> {s.name[l]}</button>
    <div className="psel"><span className="pbar" style={{ background: s.color }} /><div><b>{s.name[l]}</b><em>{s.dose[l]} · {money(s.price)}</em></div></div>
    {days.length === 0 ? <div className="empty">{t("noSlots")}</div> : (<>
      <div className="days">{days.slice(0, 5).map((d) => {
        const dt = new Date(d + "T12:00:00");
        return <button key={d} className={"day" + (date === d ? " on" : "")} onClick={() => { setDate(d); setTime(null); }}>
          <em>{dt.toLocaleDateString(loc(l), { weekday: "short" })}</em><b>{dt.getDate()}</b></button>;
      })}</div>
      <div className="times">{slots.map((x) => <button key={x} className={"tslot" + (time === x ? " on" : "")} onClick={() => setTime(x)}>{x}</button>)}</div>
      {time && (<div className="form">
        <input className="inp" placeholder={t("yourName")} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="inp" placeholder={t("mobile")} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>)}
      <button className="btn wide" disabled={!time || !name.trim() || !phone.trim()} onClick={confirm}>
        {time ? (name.trim() && phone.trim() ? `${t("confirm")} ${time}` : t("addDetails")) : t("pickTime")}</button>
      <p className="pfine">{t("holdFine")}</p>
    </>)}
  </>);
}

/* the poster's two arcs, living inside the window: gold-edged pink entering
   top-right, the pink→blue band riding along the bottom */
const Arcs = () => (<>
  <span className="arcTop" aria-hidden="true"><i /></span>
  <span className="arcBot" aria-hidden="true"><i /></span>
</>);
const Head = ({ eyebrow, title }) => (<div className="phead"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>);
const Kpi = ({ k, v, d, c }) => (
  <div className="kpi"><span className="kbar" style={{ background: c }} />
    <span className="kk">{k}</span><b className="kv" style={{ color: c }}>{v}</b><em className="kd mono">{d}</em></div>);

/* ============ styles ============ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Dancing+Script:wght@600;700&display=swap');
:where(.app) *{box-sizing:border-box;margin:0;padding:0}
.app{font-family:'Montserrat',system-ui,sans-serif;background:radial-gradient(120% 90% at 18% 0%,#FFFFFF 0%,#FBF7F4 38%,#F3EAE4 100%);color:${T.ink};min-height:100vh;-webkit-font-smoothing:antialiased}
.sheen{position:fixed;top:0;left:32%;width:22%;height:100%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.7),rgba(255,255,255,0));pointer-events:none;z-index:0;animation:sheen 9s ease-in-out infinite alternate}
@keyframes sheen{0%{transform:translateX(-18%) skewX(-14deg)}100%{transform:translateX(18%) skewX(-14deg)}}
:where(.app button){font:inherit;cursor:pointer;border:none;background:none;color:inherit}
.app button:focus-visible,.app textarea:focus-visible,.app input:focus-visible{outline:2px solid ${T.pink};outline-offset:2px}
.app h2,.app h4{font-family:'Playfair Display',Georgia,serif;font-weight:700}
.app h3{font-family:'Montserrat',system-ui,sans-serif;font-weight:600;letter-spacing:-.01em}
.mono{font-family:'Montserrat',system-ui,sans-serif;font-size:12.5px;font-weight:600;letter-spacing:.01em}
.script{font-family:'Dancing Script',cursive;color:${T.pink};font-size:26px;line-height:1;display:block}
.script.sm{font-size:18px}.script.big{font-size:38px;color:#fff}
.goldrule{display:block;height:2px;width:64px;border-radius:2px;background:${GOLDRULE};margin:9px 0}
.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.boot{display:flex;align-items:center;justify-content:center;gap:10px;height:100vh;color:${T.muted};font-size:14px}
.topline{height:4px;background:${BAND};position:sticky;top:0;z-index:25}
.top{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 20px;background:${T.surface};border-bottom:1px solid ${T.line};position:sticky;top:4px;z-index:20;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:11px}
.mark{height:52px;width:52px;object-fit:contain;display:block;flex:none}
.bname{font-family:'Montserrat',system-ui,sans-serif;font-weight:600;font-size:14px;letter-spacing:.16em;text-transform:uppercase}
.bsub{display:flex;align-items:center;gap:3px;font-size:11px;color:${T.goldInk};font-weight:600}
.tright{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reset{color:${T.muted};padding:6px;border-radius:7px}.reset:hover{background:${T.cream};color:${T.ink}}
.seg{display:flex;background:${T.cream};border-radius:999px;padding:3px;border:1px solid ${T.line}}
.seg button{padding:7px 15px;border-radius:999px;font-size:13px;color:${T.muted};font-weight:500}
.seg button.on{background:${T.ink};color:#fff}
.seg.small button{padding:6px 12px;font-size:12px}
.seg.lang button{padding:6px 11px;font-family:'Montserrat',system-ui,sans-serif;font-size:11px}
.seg.lang button.on{background:${T.pink}}
.shell{position:relative;z-index:1;max-width:1320px;margin:20px auto 46px;padding:2px;border-radius:24px;background:${GOLDEDGE};box-shadow:0 26px 60px -40px rgba(34,60,100,.75)}
.shellInner{display:flex;align-items:stretch;background:#FFFDFA;border-radius:22px;overflow:hidden;min-height:660px}
.rail{width:186px;flex:none;padding:18px 12px;display:flex;flex-direction:column;gap:16px;background:linear-gradient(180deg,#FFFFFF,#FBF6EF);border-right:1px solid ${T.hairSoft}}
.raillogo{display:flex;align-items:center;gap:9px;padding:0 8px 13px;border-bottom:1px solid ${T.hairSoft}}
.raillogo img{height:46px;width:46px;object-fit:contain;display:block;flex:none}
.raillogo em{font-style:normal;font-size:9.5px;letter-spacing:.16em;font-weight:800;color:${T.goldInk};line-height:1.5}
.booklink{margin-top:auto;border:1px solid ${T.hair};border-radius:14px;background:#fff;padding:12px}
.booklink span{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:${T.goldInk};margin-bottom:6px}
.booklink em{display:block;font-style:normal;font-size:11.5px;color:#4B6484;line-height:1.5}
.booklink b{color:${T.magenta}}
.rail ul{list-style:none;display:flex;flex-direction:column;gap:2px}
.nav{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border-radius:10px;font-size:14px;color:${T.muted};position:relative}
.nav:hover{background:rgba(238,75,158,.07);color:${T.ink}}
.nav.on{background:${T.surface};color:${T.pink};font-weight:600;box-shadow:0 2px 6px rgba(34,72,91,.08)}
.dot{position:absolute;right:11px;font-style:normal;font-family:'Montserrat',system-ui,sans-serif;font-size:10px;background:${T.pink};color:#fff;border-radius:999px;padding:1px 6px}
.main{flex:1;padding:24px 24px 96px;min-width:0;position:relative;overflow:hidden;background:radial-gradient(120% 70% at 85% 0%,#FFFFFF,#FDFAF7 60%,#F7F1EA)}
.mainInner{position:relative;z-index:1}
.arcTop{position:absolute;top:-92px;right:-96px;width:46%;height:236px;border-radius:0 0 0 100%;background:linear-gradient(260deg,#EBD6A8,${T.gold} 40%,#F3E6C4 62%,#B98C33);pointer-events:none}
.arcTop i{position:absolute;top:0;left:5px;right:0;bottom:5px;border-radius:0 0 0 100%;background:linear-gradient(210deg,${T.pink},#F072A2 55%,#F9C8DC);display:block}
.arcBot{position:absolute;bottom:0;left:-10%;right:-10%;height:104px;border-radius:64% 20% 0 0 / 100% 46% 0 0;background:linear-gradient(100deg,#EBD6A8,${T.gold} 40%,#F3E6C4 62%,#B98C33);pointer-events:none}
.arcBot i{position:absolute;top:5px;left:0;right:0;bottom:0;border-radius:64% 20% 0 0 / 100% 46% 0 0;background:${BAND};display:block}
.phead{margin-bottom:16px}
.dhead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}
.eyebrow{display:block;color:${T.goldInk};text-transform:uppercase;letter-spacing:.12em;font-size:11px;font-weight:700;margin-bottom:6px}
.phead h2{font-size:31px}
.lede{color:${T.muted};font-size:14px;max-width:62ch;margin:-6px 0 14px;line-height:1.5}
.card{background:${T.surface};border:1px solid ${T.line};border-radius:16px;padding:17px;box-shadow:0 2px 10px rgba(34,72,91,.04)}
.chead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
.chead h3{font-size:15px}
.unit{font-family:'Montserrat',system-ui,sans-serif;font-size:11.5px;color:${T.muted}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:13px;align-items:start}
.stack{display:flex;flex-direction:column;gap:13px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:13px}
.kpi{background:${T.surface};border:1px solid ${T.line};border-radius:16px;padding:15px;position:relative;overflow:hidden;box-shadow:0 2px 10px rgba(34,72,91,.04)}
.kbar{position:absolute;left:0;top:0;bottom:0;width:4px}
.kk{display:block;font-size:12px;color:${T.muted};margin-bottom:5px}
.kv{display:block;font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:27px}
.kd{display:block;color:${T.muted};margin-top:3px}
.agenda{list-style:none}
.appt{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid ${T.cream}}
.appt:last-child{border:none}.appt.done{opacity:.45}
.appt.now{background:linear-gradient(90deg,rgba(238,75,158,.09),transparent);margin:0 -8px;padding:10px 8px;border-radius:10px}
.time{font-family:'Montserrat',system-ui,sans-serif;font-size:12px;width:42px;flex:none;color:${T.muted}}
.stripe{width:3px;height:26px;border-radius:2px;flex:none}
.who{flex:1;min-width:0}
.who b{display:block;font-size:13.5px;font-weight:600}
.who span{display:block;font-size:12px;color:${T.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rowacts{display:flex;gap:5px;flex:none}
.mini{font-size:11.5px;border:1px solid ${T.line};border-radius:8px;padding:5px 9px;color:${T.muted}}
.mini:hover{border-color:${T.pink};color:${T.pink}}
.mini.solid{background:${T.pink};color:#fff;border-color:${T.pink}}
.mini.gold{border-color:${T.goldSoft};color:${T.goldInk}}
.paid{display:flex;align-items:center;gap:4px;font-size:11px;color:${T.teal};font-family:'Montserrat',system-ui,sans-serif}
.slotchips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:11px}
.schip{font-family:'Montserrat',system-ui,sans-serif;font-size:11.5px;border:1px solid rgba(46,144,217,.35);background:linear-gradient(160deg,rgba(111,211,236,.2),rgba(238,75,158,.08));color:#1F6F94;border-radius:8px;padding:5px 9px}
.postrow{display:flex;gap:11px;align-items:flex-start}
.pthumb{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;flex:none}
.postrow b{display:block;font-size:12.5px}
.postrow span{display:block;font-size:12px;color:${T.muted};line-height:1.45;margin-top:2px}

/* promos, drawn from the clinic's own posters */
.promo{border-radius:18px;padding:3px;background:${BAND};box-shadow:0 4px 16px rgba(34,72,91,.07)}
.promo.off{opacity:.5;filter:saturate(.4)}
.promoInner{background:linear-gradient(160deg,#FFFDFB,${T.cream});border-radius:15px;padding:18px;border:1px solid rgba(201,162,39,.35)}
.promoTop{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.promoIcon{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:${T.goldInk};border:1px solid ${T.goldSoft};background:#fff}
.promoHead{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:25px;line-height:1;letter-spacing:.01em;color:${T.blueDeep}}
.promoBlurb{font-size:13px;color:${T.muted};line-height:1.6;margin-bottom:12px}
.steps{display:flex;flex-direction:column;gap:7px;margin-bottom:11px}
.step{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid;border-radius:11px;padding:9px 12px;background:#fff}
.step span{font-size:12.5px;color:${T.ink};line-height:1.35}
.step b{font-family:'Playfair Display',Georgia,serif;font-size:17px;white-space:nowrap}
.terms{font-size:11.5px;color:${T.muted};line-height:1.55;border-top:1px solid ${T.line};padding-top:9px}
.terms b{color:#C9186F;letter-spacing:.06em}
.menugrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px}
.mtile{display:flex;flex-direction:column;align-items:flex-start;gap:5px;border:1px solid ${T.line};border-radius:12px;padding:11px;text-align:left;background:#fff}
.mtile:hover{border-color:${T.pink}}.mtile.off{opacity:.45}
.mbar{width:26px;height:3px;border-radius:2px}
.mtile b{font-size:13px}.mtile em{font-style:normal;font-size:11.5px;color:${T.muted}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:${T.pink};color:#fff;padding:10px 16px;border-radius:999px;font-size:13px;font-weight:600}
.btn:hover{background:#DA3D8E}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn.ghost{background:transparent;color:${T.ink};border:1px solid ${T.line}}
.btn.ghost:hover{background:${T.cream};border-color:${T.goldSoft}}
.btn.wide{width:100%;margin-top:13px}
.acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.grid-wrap{overflow-x:auto;margin-bottom:13px}
.grid{display:grid;gap:4px;min-width:640px}
.gh{font-family:'Montserrat',system-ui,sans-serif;font-size:10.5px;color:${T.muted};text-align:center;padding-bottom:4px}
.gt{font-family:'Montserrat',system-ui,sans-serif;font-size:11px;color:${T.muted};display:flex;align-items:center}
.slot{border-radius:8px;padding:9px 4px;font-size:11px;text-align:center}
.slot.open{background:linear-gradient(160deg,rgba(111,211,236,.22),rgba(238,75,158,.09));border:1px solid rgba(46,144,217,.4);color:#1F6F94}
.slot.shut{background:${T.cream};border:1px dashed ${T.line};color:${T.muted}}
.slot.na{background:repeating-linear-gradient(45deg,${T.cream} 0 4px,transparent 4px 8px)}
.slot.bk{border:1px solid;background:#fff}
.conns{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:11px}
.conns li{display:flex;align-items:center;gap:9px;font-size:13px}
.conns em{margin-left:auto;font-style:normal;font-family:'Montserrat',system-ui,sans-serif;font-size:11px;color:${T.muted}}
.ok{width:17px;height:17px;border-radius:50%;background:${T.teal};color:#fff;display:grid;place-items:center;flex:none}
.rules{list-style:none;display:flex;flex-direction:column;gap:8px}
.rules li{font-size:13px;color:${T.muted};padding-left:12px;border-left:2px solid ${T.goldSoft}}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{text-align:left;font-family:'Montserrat',system-ui,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:${T.muted};font-weight:400;padding:0 10px 9px;border-bottom:1px solid ${T.line}}
.tbl td{padding:10px;border-bottom:1px solid ${T.cream}}
.tbl tbody tr:hover{background:${T.cream};cursor:pointer}
.tbl .right{text-align:right}
.pcell{display:flex;align-items:center;gap:10px}
.pcell em{display:block;font-style:normal;font-size:11px;color:${T.muted}}
.av{width:31px;height:31px;border-radius:50%;background:${BAND};color:#fff;display:grid;place-items:center;font-size:11px;font-weight:600;flex:none}
.av.big{width:50px;height:50px;font-size:15px;margin-bottom:10px}
.chip{display:inline-block;font-size:11px;border:1px solid ${T.line};border-radius:999px;padding:3px 9px;color:${T.muted}}
.creditPill{background:rgba(201,162,39,.16);border:1px solid ${T.goldSoft};color:${T.goldInk};border-radius:999px;padding:2px 8px;font-size:11px}
.hot{color:${T.pink};font-weight:500}
.link{color:${T.blueDeep};text-decoration:underline}
.sheet{position:fixed;inset:0;background:rgba(34,72,91,.38);display:flex;justify-content:flex-end;z-index:50}
.panel{background:${T.surface};width:min(400px,92vw);padding:24px;overflow-y:auto;position:relative}
.modal{background:${T.surface};width:min(380px,92vw);margin:auto;border-radius:18px;padding:24px;position:relative;height:fit-content;border-top:4px solid ${T.pink}}
.x{position:absolute;top:15px;right:15px;color:${T.muted}}
.panel h3,.modal h3{font-size:20px;font-family:'Playfair Display',Georgia,serif}
.sub{font-size:12.5px;color:${T.muted};margin-bottom:14px}
.creditRow{display:flex;align-items:center;gap:8px;width:100%;border:1px solid ${T.goldSoft};background:rgba(201,162,39,.1);border-radius:11px;padding:11px;font-size:13px;color:${T.goldInk};margin-bottom:10px}
.creditRow.on{background:rgba(201,162,39,.18)}
.ckbox{width:15px;height:15px;border-radius:4px;border:1px solid ${T.gold};display:grid;place-items:center;flex:none}
.totalRow{display:flex;justify-content:space-between;align-items:baseline;padding:10px 0;border-top:1px solid ${T.line};border-bottom:1px solid ${T.line};margin-bottom:13px;font-size:12.5px;color:${T.muted}}
.totalRow b{font-family:'Playfair Display',Georgia,serif;font-size:23px;color:${T.ink}}
.stats{display:flex;gap:18px;padding:13px 0;border-top:1px solid ${T.line};border-bottom:1px solid ${T.line};margin-bottom:14px}
.stats b{display:block;font-size:15px}.stats span{font-size:11px;color:${T.muted}}
.mini-h{display:flex;align-items:center;gap:6px;font-family:'Montserrat',system-ui,sans-serif;font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:.09em;color:${T.goldInk};margin:16px 0 8px}
.hist{list-style:none;display:flex;flex-direction:column;gap:9px}
.hist li{display:flex;align-items:center;gap:9px;font-size:12.5px}
.hist b{display:block;font-size:12.5px}.hist em{font-style:normal;color:${T.muted}}
.hist li div{flex:1}.hist li span.mono{color:${T.muted}}
.note{font-size:12.5px;color:${T.muted};line-height:1.55;background:${T.cream};padding:12px;border-radius:11px;margin-top:16px}
.saved{list-style:none;display:flex;flex-direction:column;gap:8px}
.saved li{display:flex;gap:9px;align-items:center}
.saved b{display:block;font-size:12.5px}.saved em{font-style:normal;color:${T.muted}}
.inbox{grid-template-columns:320px 1fr}
.list{padding:7px}
.thread{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:10px;border-radius:11px}
.thread:hover,.thread.on{background:${T.cream}}
.thread div{flex:1;min-width:0}
.thread b{display:block;font-size:12.5px;font-weight:600}
.thread span{display:block;font-size:12px;color:${T.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.thread em{color:${T.muted};font-style:normal}
.chi{width:21px;height:21px;border-radius:7px;display:grid;place-items:center;flex:none;margin-top:1px}
.new{display:inline-block;width:6px;height:6px;border-radius:50%;background:${T.pink};margin-left:5px;vertical-align:1px}
.msgs{display:flex;flex-direction:column;gap:8px}
.bubble{font-size:13.5px;line-height:1.55;padding:11px 13px;border-radius:14px;max-width:82%}
.bubble.them{background:${T.cream};border-bottom-left-radius:4px;align-self:flex-start}
.bubble.mine{background:${BAND};color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.composer{margin-top:12px}
.composer textarea,.ta{width:100%;border:1px solid ${T.line};border-radius:12px;padding:11px;font:inherit;font-size:13.5px;resize:vertical;min-height:76px;background:${T.surface};color:${T.ink}}
.crow{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
.fine{font-size:12px;color:${T.muted};margin-top:10px;line-height:1.55}
.err{color:${T.pink};font-size:12.5px;margin-top:8px}
.empty{font-size:13.5px;color:${T.muted};line-height:1.6;padding:26px 8px;text-align:center}
.empty.sm{padding:12px 4px;font-size:12.5px}
.studio{grid-template-columns:1fr 1.12fr}
.fl{display:block;font-family:'Montserrat',system-ui,sans-serif;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:${T.goldInk};margin:14px 0 7px}
.fl:first-of-type{margin-top:0}
.pills{display:flex;flex-wrap:wrap;gap:6px}
.pill{display:flex;align-items:center;gap:6px;border:1px solid ${T.line};border-radius:999px;padding:6px 12px;font-size:12.5px;color:${T.muted}}
.pill:hover{border-color:${T.goldSoft}}
.pill i{width:7px;height:7px;border-radius:50%}
.pill.on{border-color:${T.ink};color:${T.ink};font-weight:500}
.poster{border-radius:18px;padding:3px;background:${BAND}}
.posterInner{border-radius:15px;padding:22px;color:#fff;background:linear-gradient(155deg,rgba(34,72,91,.86),rgba(34,72,91,.96));border:1px solid rgba(227,203,134,.5)}
.pbadge{display:inline-block;font-family:'Montserrat',system-ui,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.12em;background:${GOLDRULE};color:#3B2F06;padding:4px 11px;border-radius:999px;margin-bottom:12px;font-weight:500}
.posterInner h4{font-size:29px;line-height:1.05;text-transform:uppercase;letter-spacing:.01em}
.posterInner .goldrule{margin:11px 0 10px}
.posterInner p{font-size:13.5px;opacity:1;line-height:1.5;margin-bottom:13px}
.posterInner ul{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.posterInner li{display:flex;align-items:center;gap:7px;font-size:13.5px;opacity:1}
.pcta{display:inline-block;background:${T.pink};color:#fff;padding:9px 18px;border-radius:999px;font-size:13px;font-weight:600}
.pfoot{display:block;font-family:'Montserrat',system-ui,sans-serif;font-size:10.5px;opacity:.88;margin-top:16px;letter-spacing:.04em}
.cap{border:1px solid ${T.line};border-radius:12px;padding:13px;margin-top:12px}
.caphead{display:flex;align-items:center;gap:6px;font-family:'Montserrat',system-ui,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${T.goldInk};margin-bottom:8px}
.cap p{font-size:13.5px;line-height:1.55}
.tags2{color:${T.blueDeep};font-size:12.5px;margin-top:6px}
.vials{display:flex;gap:11px;align-items:flex-end}
.vial{flex:1;display:flex;flex-direction:column;gap:8px;min-width:0}
.tube{position:relative;height:168px;border:1px solid ${T.line};border-radius:5px 5px 10px 10px;background:linear-gradient(${T.cream},#FFFDFB);overflow:hidden;display:flex;align-items:flex-end}
.grad{position:absolute;left:0;top:8px;bottom:8px;width:7px;background:repeating-linear-gradient(to bottom,${T.line} 0 1px,transparent 1px 18px);z-index:2}
.liquid{width:100%;transition:height .9s cubic-bezier(.22,.9,.3,1);border-radius:3px 3px 9px 9px}
.vlabel b{display:block;font-family:'Montserrat',system-ui,sans-serif;font-size:12.5px;font-weight:500}
.vlabel span{display:block;font-size:11.5px;line-height:1.35;margin-top:3px}
.vlabel em{display:block;font-family:'Montserrat',system-ui,sans-serif;font-size:11px;color:${T.muted};font-style:normal;margin-top:2px}
.pwrap{padding:28px 18px 60px;display:flex;flex-direction:column;align-items:center;gap:16px}
/* the phone: gold frame, marble screen, arcs in the header and the footer */
.phoneFrame{width:min(392px,100%);padding:3px;border-radius:42px;background:${GOLDEDGE};box-shadow:0 26px 60px -38px rgba(34,60,100,.8)}
.phone{position:relative;overflow:hidden;border-radius:39px;background:${MARBLE};padding-bottom:18px}
.parcTop{position:absolute;top:-60px;left:-70px;width:74%;height:180px;border-radius:0 0 100% 0;background:linear-gradient(110deg,#EBD6A8,${T.gold} 50%,#F3E6C4);pointer-events:none}
.parcTop i{position:absolute;top:0;left:0;right:4px;bottom:4px;border-radius:0 0 100% 0;background:linear-gradient(150deg,${T.pink},#F28FB5 60%,#F9C8DC);display:block}
.parcBot{position:absolute;bottom:0;left:-12%;right:-12%;height:92px;border-radius:64% 20% 0 0 / 100% 46% 0 0;background:linear-gradient(110deg,#EBD6A8,${T.gold} 50%,#F3E6C4);pointer-events:none}
.parcBot i{position:absolute;top:4px;left:0;right:0;bottom:0;border-radius:64% 20% 0 0 / 100% 46% 0 0;background:${BAND};display:block}
.phoneTop{position:relative;z-index:1;padding:22px 16px 0;display:flex;align-items:center;justify-content:space-between;gap:10px}
.phoneBrand{display:flex;align-items:center;gap:8px}
.phoneBrand img{height:44px;width:44px;object-fit:contain;border-radius:12px;background:#fff;padding:3px;display:block;box-shadow:0 2px 8px -3px rgba(34,60,100,.35)}
.phoneBrand b{display:block;font-size:11px;letter-spacing:.14em;font-weight:800;color:#fff}
.phoneBrand em{display:block;font-style:normal;font-size:9.5px;color:rgba(255,255,255,.85)}
.phoneAv{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.9);display:grid;place-items:center;font-size:11px;font-weight:800;color:${T.magenta}}
.pcard{position:relative;z-index:1;margin:20px 14px 0;background:#fff;border:1px solid ${T.line};border-radius:26px;padding:16px;box-shadow:0 8px 26px -14px rgba(34,60,100,.3)}
.phero{margin-bottom:13px}
.phero h2{font-size:28px;line-height:1;font-weight:700;letter-spacing:.01em;color:${T.blue};margin-top:5px}
.founder{display:block;font-size:11px;color:${T.goldInk};letter-spacing:.06em;text-transform:uppercase;font-weight:700}
.promoStrip{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px}
.pstrip{flex:none;min-width:150px;border-radius:14px;padding:12px;background:linear-gradient(150deg,#FFF6FA,#EEF5FC);border:1px solid ${T.goldSoft}}
.pstrip b{display:block;font-family:'Playfair Display',Georgia,serif;font-size:15px;line-height:1.1;color:${T.blueDeep};margin-top:2px}
.pstrip em{display:block;font-style:normal;font-size:12px;color:#C9186F;font-weight:600;margin-top:5px}
.plist{display:flex;flex-direction:column;gap:7px}
.pitem{display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:1px solid ${T.line};border-radius:14px;padding:12px;background:#fff}
.pitem:hover{border-color:${T.pink}}
.pitem div{flex:1;min-width:0}
.pitem b{display:block;font-size:13.5px}
.pitem em{display:block;font-style:normal;font-size:12px;color:${T.muted};margin-top:3px}
.tagi{font-style:normal;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;border:1px solid;border-radius:999px;padding:1px 6px;margin-left:5px;vertical-align:1px}
.pbar{width:4px;height:32px;border-radius:3px;flex:none}
.price{font-size:13px}
.pfine{font-size:12px;color:${T.muted};text-align:center;margin:14px 0 18px;line-height:1.55}
.back{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:${T.muted};margin:16px 0 13px}
.dhero{border-radius:16px;padding:20px;color:#fff;margin-bottom:14px;border:1px solid rgba(227,203,134,.4)}
.dhdose{display:block;opacity:.95;font-size:11px;text-transform:uppercase;letter-spacing:.1em}
.dhero h2{font-size:26px;line-height:1.1;margin:7px 0 9px}
.dhprice{font-size:15px;background:rgba(255,255,255,.22);padding:4px 11px;border-radius:999px}
.dwhat{font-size:14px;line-height:1.6}
.mix{list-style:none;display:flex;flex-direction:column;gap:10px}
.mix li{padding-left:11px;border-left:2px solid ${T.goldSoft}}
.mix b{display:block;font-size:13px}
.mix span{display:block;font-size:12px;color:${T.muted};line-height:1.5;margin-top:2px}
.goods{display:flex;flex-wrap:wrap;gap:5px}
.warn{display:flex;gap:9px;align-items:flex-start;background:linear-gradient(150deg,rgba(238,75,158,.09),rgba(127,174,220,.09));border:1px solid rgba(238,75,158,.3);border-radius:13px;padding:12px;margin-top:16px}
.warn svg{color:${T.pink};flex:none;margin-top:1px}
.warn p{font-size:12.5px;line-height:1.55}
.dafter{font-size:12.5px;color:${T.muted};line-height:1.55}
.psel{display:flex;align-items:center;gap:11px;padding-bottom:14px;border-bottom:1px solid ${T.line};margin-bottom:14px}
.psel b{display:block;font-size:14px}
.psel em{font-style:normal;font-size:11.5px;color:${T.muted}}
.days{display:flex;gap:6px;margin-bottom:13px}
.day{flex:1;border:1px solid ${T.line};border-radius:12px;padding:9px 0;text-align:center;background:#fff}
.day em{display:block;font-style:normal;font-size:10px;color:${T.muted}}
.day b{display:block;font-size:15px;font-family:'Montserrat',system-ui,sans-serif;font-weight:500}
.day.on{background:${T.blueDeep};border-color:${T.blueDeep};color:#fff}
.day.on em{color:rgba(255,255,255,.75)}
.times{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.tslot{border:1px solid ${T.line};border-radius:11px;padding:10px 0;font-family:'Montserrat',system-ui,sans-serif;font-size:12px;background:#fff}
.tslot.on{background:${T.pink};border-color:${T.pink};color:#fff}
.form{display:flex;flex-direction:column;gap:7px;margin-top:12px}
.inp{border:1px solid ${T.line};border-radius:12px;padding:11px;font:inherit;font-size:13.5px;background:${T.surface};color:${T.ink}}
.done{text-align:center;padding:26px 0}
.tick2{width:56px;height:56px;border-radius:50%;background:${BAND};color:#fff;display:grid;place-items:center;margin:0 auto 15px}
.done h2{font-size:26px;margin-bottom:8px}
.dline{display:flex;align-items:center;justify-content:center;gap:6px;font-family:'Montserrat',system-ui,sans-serif;font-size:13px}
.dsvc{font-size:12.5px;color:${T.muted};margin-top:4px}
.dbox{background:${T.cream};border:1px solid ${T.goldSoft};border-radius:13px;padding:14px;font-size:12.5px;color:${T.muted};line-height:1.6;margin:16px 0;text-align:left}
.pnote{font-size:12.5px;color:${T.muted};max-width:46ch;text-align:center;line-height:1.6}
@media (max-width:900px){
  .two,.inbox,.studio{grid-template-columns:1fr}
  .kpis{grid-template-columns:1fr 1fr}
  .main{padding:18px 15px 92px}
  .shell{display:block}
  .rail{width:100%;position:fixed;bottom:0;left:0;background:${T.surface};border-top:1px solid ${T.line};padding:5px;z-index:30}
  .rail ul{flex-direction:row;justify-content:space-between}
  .nav{flex-direction:column;gap:3px;font-size:10px;padding:6px 3px}
  .nav span{font-size:10px}.dot{top:2px;right:5px}
  .vials{gap:6px}.tube{height:112px}.vlabel span{font-size:10px}
  .phead h2{font-size:26px}
  .modal{margin:auto 12px}
}

/* ============================================================
   NÁCAR — the poster's construction applied to the console:
   marble surfaces, gold hairlines, ombré arcs, gold-ringed
   medallions, and every amount in a solid pill.
   ============================================================ */
/* app chrome */
.topline{background:${BAND}}
.top{background:rgba(255,255,255,.96);border-bottom:1px solid ${T.goldSoft};box-shadow:0 8px 30px -28px rgba(34,60,100,.45)}
.bname{color:${T.ink}}
.bsub{color:${T.goldInk};font-weight:700}
.seg{background:#FBF6EF;border-color:${T.hairSoft}}
.seg button{color:#4B6484;font-weight:600}
.seg button.on{background:${T.ink};color:#fff}
.seg.lang button.on{background:${T.pink}}
.reset:hover{background:#FFF6FA;color:${T.magenta}}

/* rail */
.nav{border:1px solid transparent;border-radius:12px;font-weight:500;color:#4B6484}
.nav:hover{background:#FFF8F5;border-color:${T.hair};color:${T.ink}}
.nav.on{background:linear-gradient(100deg,#FFF6FA,#F6FAFF);border-color:${T.goldSoft};color:${T.magenta};font-weight:700;box-shadow:none}
.dot{font-weight:800;font-size:10px;padding:2px 6px}

/* type */
.eyebrow{font-size:10.5px;letter-spacing:.13em;font-weight:800;color:${T.goldInk}}
.phead h2{font-size:30px;line-height:1}
.chead h3,.card h3,.panel h3,.modal h3{font-family:'Playfair Display',Georgia,serif;font-weight:700;color:${T.ink}}
.chead h3{font-size:17px}
.lede{color:#4B6484}
.script{font-size:34px;font-weight:700;color:${T.pink}}
.goldrule{background:linear-gradient(90deg,${T.gold},rgba(198,154,68,0));height:1.5px;width:auto}
.mini-h,.fl{color:${T.goldInk};font-weight:800;letter-spacing:.12em}

/* surfaces — white, gold hairline, no grey shadows */
.card,.kpi{background:#fff;border:1px solid #EBDCBB;border-radius:18px;box-shadow:none}
.panel,.modal{background:#fff;border:1px solid #EBDCBB;border-radius:18px}
.modal{border-top:none}
.appt{border-bottom-color:#F2E7D3}
.mtile,.thread,.slot,.pitem,.step,.cap,.dbox,.day,.tslot,.inp,.ta,.composer textarea{border-color:${T.hair}}
.note,.dbox{background:#FBF7F1;border:1px solid ${T.hair}}

/* KPI figures in Playfair, colour carried by the left rule */
.kbar{width:4px}
.kk{font-size:11px;color:#5A7091}
.kv{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:27px}
.kd{font-size:10.5px;color:${T.goldInk}}

/* the day: time, colour stripe, then the amount and its status pill */
.time{color:#5A7091;font-weight:600;width:46px}
.stripe{width:4px;height:30px;border-radius:3px}
.who b{font-weight:600}
.who span{color:#5A7091}
.paid{color:${T.deep};font-weight:700;font-size:10px;letter-spacing:.06em;text-transform:uppercase;background:${T.blueWash};border-radius:999px;padding:4px 9px}
.mini{border-color:${T.goldSoft};color:#4B6484;border-radius:9px;font-weight:600}
.mini:hover{border-color:${T.pink};color:${T.magenta}}
.mini.solid{background:${T.pink};border-color:${T.pink};color:#fff}
.mini.gold{border-color:${T.goldSoft};color:${T.goldInk};background:#FBF2DC}

/* medallions: a solid disc inside a gold ring */
.av{background:${BAND} padding-box,${GOLDEDGE} border-box;border:1.5px solid transparent;font-weight:800;width:34px;height:34px}
.av.big{width:52px;height:52px;font-size:14px}
.tick2{background:${BAND} padding-box,${GOLDEDGE} border-box;border:2px solid transparent}

/* amounts and states, always a pill */
.chip{border-color:#CFE2F3;background:#EAF3FB;color:${T.deep};font-weight:700;font-size:11px;letter-spacing:.04em}
.creditPill{background:#FBF2DC;border-color:${T.goldSoft};color:${T.goldInk};font-weight:700}
.hot{color:${T.magenta};font-weight:700}
.link{color:${T.magenta}}
.price{font-size:13.5px;font-weight:700;color:${T.deep};background:${T.blueWash};border-radius:9px;padding:4px 11px}
.schip{background:#FBF2DC;border:1px dashed #E6D4AE;color:${T.goldInk};font-weight:600}

/* buttons: magenta inside a gold ring */
.btn{background:linear-gradient(100deg,${T.pink},#D62170) padding-box,${GOLDEDGE} border-box;border:2px solid transparent;font-weight:700;letter-spacing:.02em}
.btn:hover{filter:brightness(1.07);background:linear-gradient(100deg,${T.pink},#D62170) padding-box,${GOLDEDGE} border-box}
.btn.ghost{background:linear-gradient(#fff,#fff) padding-box,${GOLDEDGE} border-box;color:${T.ink}}
.btn.ghost:hover{background:linear-gradient(#FFF8F5,#FFF8F5) padding-box,${GOLDEDGE} border-box;filter:none}
.pcta{background:linear-gradient(100deg,${T.pink},#D62170) padding-box,${GOLDEDGE} border-box;border:2px solid transparent}

/* table */
.tbl th{background:#FBF6EF;font-family:'Montserrat',system-ui,sans-serif;font-size:10px;font-weight:800;letter-spacing:.11em;color:${T.goldInk};border-bottom:1px solid ${T.hairSoft}}
.tbl td{border-bottom-color:#F5EDE0}
.tbl tbody tr:hover{background:#FFF9FC}

/* schedule grid — magenta booked, blue reserved online, dotted gold free */
.slot.open{background:#FBF2DC;border:1px dashed #E6D4AE;color:${T.goldInk};font-weight:600}
.slot.shut{background:#FBF7F1;border:1px dashed ${T.hair};color:#B39A63}
.slot.na{background:repeating-linear-gradient(45deg,#FBF7F1 0 4px,transparent 4px 8px)}
.rules li{border-left-color:${T.gold}}

/* inbox */
.thread:hover,.thread.on{background:#FFF9FC}
.chi{border-radius:9px}
.bubble.them{background:#FBF6EF}
.bubble.mine{background:${BAND};color:#fff}

/* studio + promos keep the poster frame */
.promo{background:${GOLDEDGE}}
.promoInner{background:linear-gradient(160deg,#FFFDFB,#FBF7F4);border-color:${T.goldSoft}}
.promoHead{font-family:'Playfair Display',Georgia,serif;color:${T.blue}}
.promoHead em,.terms b{color:${T.magenta}}
.poster{background:${GOLDEDGE}}
.pbadge{background:${GOLDRULE};color:#3B2F06;font-family:'Montserrat',system-ui,sans-serif;font-weight:700}
.pill.on{background:#FFF6FA;border-color:${T.pink};color:${T.magenta};font-weight:700}
.pill:hover{border-color:${T.goldSoft}}

/* dashboard bars */
.liquid{border-radius:8px 8px 3px 3px}
.tube{border-color:${T.hair};background:linear-gradient(#FBF7F1,#FFFDFB)}

/* patient phone interior */
.pcard .phero h2{color:${T.blue}}
.founder{color:${T.goldInk};font-weight:800;letter-spacing:.13em}
.pstrip{background:linear-gradient(150deg,#FFF6FA,#F6FAFF);border-color:${T.goldSoft}}
.pstrip b{font-family:'Playfair Display',Georgia,serif;color:${T.blue}}
.pstrip em{color:${T.magenta};font-weight:700}
.pitem{background:#FFFDFA;border-radius:14px}
.pitem:hover{border-color:${T.pink}}
.pbar{width:5px;border-radius:3px}
.day.on{background:${T.ink};border-color:${T.ink}}
.tslot.on{background:${T.pink};border-color:${T.pink}}
.warn{background:#FFF9FC;border-color:#F6D2E3}
.dhprice{background:rgba(255,255,255,.24);font-weight:700}
.pnote,.pfine{color:#4B6484}

@media (max-width:900px){
  .shell{margin:12px 10px 74px;border-radius:20px}
  .shellInner{display:block;border-radius:18px;min-height:0}
  .rail{width:100%;position:fixed;bottom:0;left:0;background:#FFFDFA;border-right:none;border-top:1px solid ${T.goldSoft};padding:5px;gap:0;z-index:30}
  .raillogo,.booklink{display:none}
  .main{padding:18px 15px 96px}
  .arcTop{width:62%;top:-70px;right:-70px;height:180px}
}
@media (prefers-reduced-motion:reduce){.liquid{transition:none}.spin{animation:none}.sheen{animation:none}}
`;
