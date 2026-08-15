/* Revenue aggregation, kept free of Supabase and the DOM so it can be tested
   directly. All money is integer cents — no float ever touches a total. */

export function periodStart(period, now = new Date()) {
  let d;
  if (period === "week") {            // week starts Sunday, matching the Agenda
    d = new Date(now); d.setDate(now.getDate() - now.getDay());
  } else if (period === "ytd") {
    d = new Date(now.getFullYear(), 0, 1);
  } else {                            // month
    d = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

export function summarise(visits) {
  const byService = new Map();
  const patients = new Set();
  let total = 0;

  for (const v of visits) {
    const cents = Number.isFinite(v.price_cents) ? v.price_cents : 0;
    total += cents;
    if (v.patient_id) patients.add(v.patient_id);
    const name = v.services?.name || "Sin servicio";
    const row = byService.get(name) || { name, cents: 0, count: 0 };
    row.cents += cents; row.count += 1;
    byService.set(name, row);
  }

  const rows = [...byService.values()].sort((a, b) => a.cents - b.cents);
  return {
    totalCents: total,
    treatments: visits.length,
    patients: patients.size,
    // Integer division: an average of cents must stay in cents.
    avgCents: visits.length ? Math.round(total / visits.length) : 0,
    top: rows.length ? rows[rows.length - 1] : null,
    rows
  };
}
