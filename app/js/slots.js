/* ============================================================================
   slots.js — turns the weekly schedule into concrete bookable slots.

   Kept free of DOM and network on purpose: this is the logic most likely to
   be quietly wrong (timezones, week boundaries, overlapping appointments),
   so it needs to be testable in isolation.

   A slot is one of:
     open    — inside working hours, nobody booked it
     closed  — outside working hours, or the owner closed it
     booked  — an appointment starts in it
   ========================================================================= */

/* Local-date key. Never slice an ISO string: that is UTC, and a 7pm
   appointment in Puerto Rico would land on the next day. */
export function dayKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Sunday-first, matching how the clinic reads a week. */
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function weekDays(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + (m || 0);
};

/* Every distinct start time across the week, so all day columns line up on
   the same rows even when working hours differ by day. */
export function timeRows(schedule, slotMinutes) {
  const set = new Set();
  for (const key of Object.keys(schedule || {})) {
    const win = schedule[key];
    if (!win || !win.from || !win.to) continue;
    for (let t = toMinutes(win.from); t + slotMinutes <= toMinutes(win.to); t += slotMinutes) {
      set.add(t);
    }
  }
  return [...set].sort((a, b) => a - b);
}

export const minutesToLabel = (mins) => {
  const h24 = Math.floor(mins / 60), m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")}`;
};

/* Build the grid for one week.
   overrides: [{starts_at, is_open}]   appointments: [{starts_at, minutes, ...}] */
export function buildWeek({ anchor, schedule, slotMinutes, overrides = [], appointments = [] }) {
  const days = weekDays(anchor);
  const rows = timeRows(schedule, slotMinutes);

  const overrideBy = new Map();
  for (const o of overrides) overrideBy.set(new Date(o.starts_at).getTime(), o.is_open);

  // An appointment occupies every slot its duration covers, not just its start.
  const bookedBy = new Map();
  for (const a of appointments) {
    if (a.status === "cancelled") continue;
    const start = new Date(a.starts_at).getTime();
    const end = start + (a.minutes || slotMinutes) * 60000;
    for (let t = start; t < end; t += slotMinutes * 60000) {
      bookedBy.set(t, a);
    }
    bookedBy.set(start, a);   // ensure the exact start wins
  }

  const now = Date.now();

  const cells = days.map((day) => {
    const win = (schedule || {})[String(day.getDay())];
    return rows.map((mins) => {
      const at = new Date(day);
      at.setHours(0, 0, 0, 0);
      at.setMinutes(mins);
      const time = at.getTime();

      const inHours = !!win &&
        mins >= toMinutes(win.from) &&
        mins + slotMinutes <= toMinutes(win.to);

      const override = overrideBy.get(time);
      const appt = bookedBy.get(time);

      let state;
      if (appt) state = "booked";
      else if (override === true) state = "open";
      else if (override === false) state = "closed";
      else state = inHours ? "open" : "closed";

      return {
        startsAt: at,
        iso: at.toISOString(),
        minutes: mins,
        state,
        past: time < now,
        appointment: appt || null,
        overridden: override !== undefined
      };
    });
  });

  return { days, rows, cells };
}

/* Slots a patient may actually book: open, not past, not booked. */
export const bookableSlots = (week) =>
  week.cells.flat().filter((c) => c.state === "open" && !c.past);
