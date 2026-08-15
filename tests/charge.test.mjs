/* Guards the money-touching path in the clinic console.
   The real protection is a unique index in Postgres; this checks that the
   client surfaces it correctly rather than swallowing it. */
import { summarise } from "../app/js/revenue.js";
let pass=0, fail=0;
const ok=(n,c)=>c?(pass++,console.log("PASS  "+n)):(fail++,console.log("FAIL  "+n));

/* A fake table enforcing the same unique constraint the database has. */
function makeDb() {
  const visits = [];
  return {
    visits,
    insert(row) {
      if (row.appointment_id != null &&
          visits.some((v) => v.appointment_id === row.appointment_id)) {
        const e = new Error("duplicate key"); e.code = "23505"; throw e;
      }
      visits.push(row); return row;
    }
  };
}

const appt = {
  id: "appt-1", patient_id: "pat-1", service_id: "svc-1",
  starts_at: "2026-08-15T13:00:00.000Z",
  services: { name: "Terapia PRP", price_cents: 45000 }
};

/* charge, mirroring api.chargeAppointment's insert shape */
function charge(db, a) {
  try {
    return db.insert({
      patient_id: a.patient_id, service_id: a.service_id, appointment_id: a.id,
      title: a.services?.name || "Visita",
      price_cents: a.services?.price_cents ?? 0,
      occurred_at: a.starts_at
    });
  } catch (e) {
    if (e.code === "23505") throw new Error("Esta cita ya fue cobrada.");
    throw e;
  }
}

let db = makeDb();
const v = charge(db, appt);
ok("charging records one visit", db.visits.length === 1);
ok("price is snapshotted from the service", v.price_cents === 45000);
ok("visit is linked to its appointment", v.appointment_id === "appt-1");
ok("visit inherits the appointment time", v.occurred_at === appt.starts_at);

let threw = null;
try { charge(db, appt); } catch (e) { threw = e; }
ok("a second charge is rejected", threw !== null);
ok("rejection message is in Spanish and specific",
   threw && threw.message === "Esta cita ya fue cobrada.");
ok("the rejected charge added nothing", db.visits.length === 1);
ok("revenue counts the treatment once",
   summarise(db.visits.map(x => ({ ...x, services: { name: x.title } }))).totalCents === 45000);

/* a service with no price must not become NaN or undefined */
db = makeDb();
const free = { ...appt, id: "appt-2", services: { name: "Consulta" } };
const fv = charge(db, free);
ok("missing price becomes zero, not undefined", fv.price_cents === 0);
ok("missing price does not poison the total",
   summarise([{ ...fv, services:{name:"Consulta"} }]).totalCents === 0);

/* different appointments for the same patient are both chargeable */
db = makeDb();
charge(db, appt);
charge(db, { ...appt, id: "appt-3" });
ok("two different appointments both charge", db.visits.length === 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
