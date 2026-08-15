import { periodStart, summarise } from "../app/js/revenue.js";
let pass = 0, fail = 0;
const ok = (n, c) => c ? (pass++, console.log("PASS  " + n))
                       : (fail++, console.log("FAIL  " + n));
const eq = (n, a, b) => ok(n + "  (" + JSON.stringify(a) + " vs " + JSON.stringify(b) + ")",
                           JSON.stringify(a) === JSON.stringify(b));

/* --- empty ------------------------------------------------------------- */
const e = summarise([]);
eq("empty: total is zero", e.totalCents, 0);
eq("empty: average does not divide by zero", e.avgCents, 0);
ok("empty: no top seller", e.top === null);
eq("empty: no rows", e.rows.length, 0);

/* --- basic totals ------------------------------------------------------- */
const v = [
  { patient_id: "a", price_cents: 16500, services: { name: "Hidratación" } },
  { patient_id: "b", price_cents: 18500, services: { name: "Inmunidad" } },
  { patient_id: "b", price_cents: 18500, services: { name: "Inmunidad" } },
  { patient_id: "c", price_cents: 45000, services: { name: "PRP" } },
];
const s = summarise(v);
eq("total sums every visit", s.totalCents, 98500);
eq("treatments counts visits, not patients", s.treatments, 4);
eq("patients are distinct", s.patients, 3);
eq("average is total over visits", s.avgCents, 24625);
eq("top seller is the highest revenue", s.top.name, "PRP");
eq("repeat service accumulates", s.rows.find(r => r.name === "Inmunidad").cents, 37000);
eq("repeat service counts twice", s.rows.find(r => r.name === "Inmunidad").count, 2);
eq("rows sort ascending by revenue", s.rows.map(r => r.name),
   ["Hidratación", "Inmunidad", "PRP"]);

/* --- money integrity ---------------------------------------------------- */
ok("total is an integer", Number.isInteger(s.totalCents));
ok("average is an integer", Number.isInteger(s.avgCents));
const third = summarise([
  { patient_id: "a", price_cents: 10000, services: { name: "X" } },
  { patient_id: "a", price_cents: 10000, services: { name: "X" } },
  { patient_id: "a", price_cents: 10001, services: { name: "X" } },
]);
ok("average of a repeating decimal stays an integer", Number.isInteger(third.avgCents));
eq("average rounds, never truncates to a float", third.avgCents, 10000);

/* --- missing / dirty data ------------------------------------------------ */
const dirty = summarise([
  { patient_id: "a", price_cents: null, services: { name: "Sin precio" } },
  { patient_id: null, price_cents: 5000, services: null },
  { patient_id: "a", price_cents: undefined, services: { name: "Sin precio" } },
]);
eq("null price counts as zero, not NaN", dirty.totalCents, 5000);
ok("total never goes NaN", !Number.isNaN(dirty.totalCents));
eq("visit with no service is labelled", dirty.rows.some(r => r.name === "Sin servicio"), true);
eq("null patient is not counted", dirty.patients, 1);

/* --- period boundaries --------------------------------------------------- */
const mid = new Date(2026, 7, 15, 13, 0, 0);        // Sat 15 Aug 2026
eq("month starts on the 1st", periodStart("month", mid).getDate(), 1);
eq("month keeps the month", periodStart("month", mid).getMonth(), 7);
eq("ytd starts 1 January", periodStart("ytd", mid).getMonth(), 0);
eq("ytd keeps the year", periodStart("ytd", mid).getFullYear(), 2026);
eq("week starts on Sunday", periodStart("week", mid).getDay(), 0);
eq("week start is at midnight", periodStart("week", mid).getHours(), 0);
ok("week start is on or before today", periodStart("week", mid) <= mid);

// a Sunday should return itself, not jump back a week
const sun = new Date(2026, 7, 16, 9, 0, 0);
eq("Sunday returns that same Sunday", periodStart("week", sun).getDate(), 16);

// month boundary: the 1st should return the 1st
const first = new Date(2026, 7, 1, 23, 30, 0);
eq("the 1st returns the 1st", periodStart("month", first).getDate(), 1);

// a week spanning a month change
const cross = new Date(2026, 8, 2, 10, 0, 0);       // Wed 2 Sep 2026
eq("week may start in the previous month", periodStart("week", cross).getMonth(), 7);

// unknown period falls back to month rather than throwing
eq("unknown period falls back to month", periodStart("nonsense", mid).getDate(), 1);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
