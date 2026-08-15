/* ============================================================================
   clinic-data.js — SINGLE SOURCE OF TRUTH for clinic info + services.
   Consumed by BOTH the clinic console and the patient app so the two can
   never drift apart. Edit this file only; both sides update together.

   PROVENANCE (important — read before editing):
     [APP]  = carried over from the existing built app (verified in repo).
     [TODO] = must be confirmed against the public website
              (ez-qr.online/a-and-a-healthcare-services). Left intentionally
              EMPTY rather than guessed. Fill these in and both sides update.
   ========================================================================= */
(function () {
  "use strict";

  var CLINIC = {
    /* ---- identity ---------------------------------------------------- */
    legalName: "A&A Healthcare Services LLC",      // [APP]
    displayName: "A&A Wellness",                   // [APP]
    town: "Loíza, PR",                             // [APP]

    /* ---- contact — [TODO] confirm all of these from the website ------- */
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
      addressLine: "",
      city: "",
      zip: "",
      mapsUrl: "",
      bookingUrl: ""
    },

    /* ---- social — [TODO] confirm handles ----------------------------- */
    social: { facebook: "", instagram: "", tiktok: "" },

    /* ---- hours — [TODO] confirm from website -------------------------
       Shape: [labelEs, labelEn, hours] — empty array renders "consultar". */
    hours: [],

    /* ---- payments ----------------------------------------------------
       She takes payment through Clover. This site is a static build with no
       backend, so we CANNOT run card charges here (that needs a server +
       Clover API keys). What we can do safely is deep-link to Clover-hosted
       payment pages she creates in her own Clover dashboard.

       To turn payments on: create a payment link per service in Clover, then
       paste it into `cloverLink` on that service below. Any service with an
       empty cloverLink simply shows "Pagar en clínica" instead of a button. */
    payments: {
      processor: "Clover",
      currency: "USD",
      // Optional catch-all Clover link (e.g. a general "pay balance" page).
      generalPayLink: "",                          // [TODO]
      note: [
        "Payments are processed securely through Clover.",
        "Los pagos se procesan de forma segura a través de Clover."
      ]
    },

    /* ---- services -----------------------------------------------------
       [APP] names/prices/durations carried from the built app.
       `cloverLink` is [TODO] — paste Clover payment links to enable paying. */
    services: [
      { id: "glp",   name: "Programa de Control de Peso", nameEn: "Weight Management Program",
        price: 325, mins: 20, cat: "programa",
        desc: "Programa supervisado · requiere consulta",
        descEn: "Supervised program · consultation required",
        requiresConsult: true, consentDoc: "consent-glp", cloverLink: "" },

      { id: "hydra", name: "Hidratación Revive", nameEn: "Revive Hydration",
        price: 165, mins: 45, cat: "iv",
        desc: "Hidratación IV y apoyo vitamínico",
        descEn: "IV hydration and vitamin support",
        requiresConsult: false, consentDoc: "consent-iv", cloverLink: "" },

      { id: "myers", name: "Inmunidad Myers", nameEn: "Myers Immunity",
        price: 185, mins: 45, cat: "iv",
        desc: "Vitamina C, magnesio, calcio y complejo B",
        descEn: "Vitamin C, magnesium, calcium and B complex",
        requiresConsult: false, consentDoc: "consent-iv", cloverLink: "" },

      { id: "glow",  name: "Glutatión Glow", nameEn: "Glutathione Glow",
        price: 210, mins: 30, cat: "iv",
        desc: "Aplicación lenta de glutatión",
        descEn: "Slow glutathione push",
        requiresConsult: false, consentDoc: "consent-iv", cloverLink: "" },

      { id: "nad",   name: "Infusión NAD+", nameEn: "NAD+ Infusion",
        price: 395, mins: 90, cat: "iv",
        desc: "Sesión de goteo lento",
        descEn: "Slow drip session",
        requiresConsult: false, consentDoc: "consent-iv", cloverLink: "" },

      { id: "b12",   name: "Refuerzo de Energía B12", nameEn: "B12 Energy Boost",
        price: 45, mins: 15, cat: "inyeccion",
        desc: "Visita rápida · 1 mL IM",
        descEn: "Quick visit · 1 mL IM",
        requiresConsult: false, consentDoc: "consent-treatment", cloverLink: "" },

      { id: "prp",   name: "Terapia PRP", nameEn: "PRP Therapy",
        price: 450, mins: 60, cat: "avanzado",
        desc: "Plasma rico en plaquetas · requiere evaluación",
        descEn: "Platelet-rich plasma · evaluation required",
        requiresConsult: true, consentDoc: "consent-prp", cloverLink: "" }
    ],

    /* ---- disclaimer [APP] -------------------------------------------- */
    disclaimer: [
      "General information, not medical advice. Your clinic confirms what is appropriate for you at your visit.",
      "Información general, no consejo médico. Tu clínica confirma qué es apropiado para ti en la cita."
    ]
  };

  /* ---- helpers shared by both sides ---------------------------------- */
  CLINIC.money = function (n) { return "$" + Number(n || 0).toFixed(0); };

  CLINIC.service = function (id) {
    return CLINIC.services.filter(function (s) { return s.id === id; })[0] || null;
  };

  CLINIC.activeServices = function () { return CLINIC.services.slice(); };

  /* Returns a Clover link for a service, falling back to the general link. */
  CLINIC.payLink = function (id) {
    var s = CLINIC.service(id);
    return (s && s.cloverLink) || CLINIC.payments.generalPayLink || "";
  };

  /* Which contact/hours fields still need filling from the website. */
  CLINIC.missingInfo = function () {
    var gaps = [];
    Object.keys(CLINIC.contact).forEach(function (k) {
      if (!CLINIC.contact[k]) gaps.push("contact." + k);
    });
    if (!CLINIC.hours.length) gaps.push("hours");
    if (!CLINIC.payments.generalPayLink) gaps.push("payments.generalPayLink");
    CLINIC.services.forEach(function (s) {
      if (!s.cloverLink) gaps.push("services." + s.id + ".cloverLink");
    });
    return gaps;
  };

  window.AACLINIC = CLINIC;
})();
