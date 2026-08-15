import { dayKey, startOfWeek, weekDays, timeRows, minutesToLabel, buildWeek, bookableSlots }
  from '/home/claude/aawellness/app/js/slots.js';

const ok=(l,c)=>console.log((c?"PASS  ":"FAIL  ")+l);
const schedule={ "0":null,
  "1":{from:"09:00",to:"17:30"},"2":{from:"09:00",to:"17:30"},
  "3":{from:"09:00",to:"17:30"},"4":{from:"09:00",to:"17:30"},
  "5":{from:"09:00",to:"17:30"},"6":{from:"09:00",to:"14:00"} };
const SLOT=45;

// --- week boundaries -------------------------------------------------
const wed=new Date(2026,7,19);                 // Wed 19 Aug 2026
ok("week starts on Sunday", startOfWeek(wed).getDay()===0);
ok("week start is 16 Aug", dayKey(startOfWeek(wed))==="2026-08-16");
const days=weekDays(wed);
ok("seven days", days.length===7);
ok("last day is Saturday 22", dayKey(days[6])==="2026-08-22");
ok("days are consecutive",
   days.every((d,i)=> i===0 || (d-days[i-1])===864e5));

// week spanning a month boundary
ok("month-spanning week ok",
   dayKey(weekDays(new Date(2026,7,31))[0])==="2026-08-30" &&
   dayKey(weekDays(new Date(2026,7,31))[6])==="2026-09-05");

// --- time rows -------------------------------------------------------
const rows=timeRows(schedule,SLOT);
ok("first row is 9:00", minutesToLabel(rows[0])==="9:00");
ok("rows ascend", rows.every((r,i)=>i===0||r>rows[i-1]));
ok("no row runs past 17:30", rows[rows.length-1]+SLOT<=17*60+30);
ok("45-min spacing", rows[1]-rows[0]===45);
ok("second row is 9:45", minutesToLabel(rows[1])==="9:45");

// --- grid ------------------------------------------------------------
let w=buildWeek({anchor:wed,schedule,slotMinutes:SLOT});
ok("grid is 7 columns", w.cells.length===7);
ok("Sunday fully closed", w.cells[0].every(c=>c.state==="closed"));
ok("Monday 9:00 open", w.cells[1][0].state==="open");
const satIdx=6, lateRow=rows.findIndex(r=>r>=14*60);
ok("Saturday closed after 14:00", w.cells[satIdx][lateRow].state==="closed");
ok("Saturday open at 9:00", w.cells[satIdx][0].state==="open");

// --- overrides -------------------------------------------------------
const monday9=w.cells[1][0].iso;
w=buildWeek({anchor:wed,schedule,slotMinutes:SLOT,
  overrides:[{starts_at:monday9,is_open:false}]});
ok("owner can close an in-hours slot", w.cells[1][0].state==="closed");
ok("closure is flagged as an override", w.cells[1][0].overridden===true);

const sunday9=w.cells[0][0].iso;
w=buildWeek({anchor:wed,schedule,slotMinutes:SLOT,
  overrides:[{starts_at:sunday9,is_open:true}]});
ok("owner can open a slot outside hours", w.cells[0][0].state==="open");
ok("other Sunday slots stay closed", w.cells[0][1].state==="closed");

// --- appointments ----------------------------------------------------
const mon=new Date(days[1]); mon.setHours(9,0,0,0);
w=buildWeek({anchor:wed,schedule,slotMinutes:SLOT,
  appointments:[{starts_at:mon.toISOString(),minutes:45,patients:{full_name:"Marisol Rivera"}}]});
ok("booked slot shows as booked", w.cells[1][0].state==="booked");
ok("booked slot carries the patient", w.cells[1][0].appointment.patients.full_name==="Marisol Rivera");
ok("next slot stays open", w.cells[1][1].state==="open");

// a 90-minute appointment must consume TWO 45-minute slots
w=buildWeek({anchor:wed,schedule,slotMinutes:SLOT,
  appointments:[{starts_at:mon.toISOString(),minutes:90,patients:{full_name:"NAD+"}}]});
ok("90-min appointment blocks slot 1", w.cells[1][0].state==="booked");
ok("90-min appointment ALSO blocks slot 2", w.cells[1][1].state==="booked");
ok("and leaves slot 3 open", w.cells[1][2].state==="open");

// cancelled appointments free the slot again
w=buildWeek({anchor:wed,schedule,slotMinutes:SLOT,
  appointments:[{starts_at:mon.toISOString(),minutes:45,status:"cancelled"}]});
ok("cancelled frees the slot", w.cells[1][0].state==="open");

// --- bookable ---------------------------------------------------------
const future=new Date(); future.setDate(future.getDate()+14);
const fw=buildWeek({anchor:future,schedule,slotMinutes:SLOT});
const b=bookableSlots(fw);
ok("future week has bookable slots", b.length>0);
ok("none are closed", b.every(c=>c.state==="open"));
ok("none are in the past", b.every(c=>!c.past));

const past=new Date(); past.setDate(past.getDate()-14);
ok("past week offers nothing bookable", bookableSlots(
  buildWeek({anchor:past,schedule,slotMinutes:SLOT})).length===0);

// --- timezone trap -----------------------------------------------------
const evening=buildWeek({anchor:wed,schedule:{"3":{from:"18:00",to:"20:00"}},slotMinutes:60});
const cell=evening.cells[3][0];
ok("7pm-ish slot keeps its local day",
   dayKey(cell.startsAt)===dayKey(evening.days[3]));
