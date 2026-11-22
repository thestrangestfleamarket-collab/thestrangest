// SAVANO LANE NIGHT DRIVE's room rules: what a driver may send the others and who may take which seat (the Drive Durable Object in door.js relays only what passes here)
const MAX = 12;
const DRIVE = {
  MAX,
  name: s => String(s ?? "").replace(/[^\w \-.']/g, "").trim().slice(0, 20) || "Driver",
  color: s => (/^#[0-9a-f]{6}$/i.test(String(s)) ? String(s) : "#ffffff"),
  slot: used => { let s = 0; while (used.includes(s)) s++; return s; },
  // seat `seat` (0..3) in the car owned by `car`, -1 to stand up; only a car's owner drives it
  sit: (seats, me, car, seat) => {
    for (const k in seats) for (let i = 0; i < 4; i++) if (seats[k][i] === me) seats[k][i] = null;
    if (!(seat >= 0)) return true; const a = seats[car];
    if (!a || !Number.isInteger(seat) || seat > 3 || a[seat] !== null || (seat === 0 && car !== me)) return false;
    a[seat] = me; return true; },
};
export { DRIVE };
