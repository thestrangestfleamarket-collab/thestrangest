// HULL DOWN's room rules: two players at most, and what a player may send the other (the Tank Durable Object in door.js relays only what passes here)
const MAX = 2;
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const vec = (a, n, lim) => (Array.isArray(a) && a.length === n ? a.map(v => num(v, -lim, lim)) : null);
const TANK = {
  MAX,
  slot: used => (used.includes(0) ? 1 : 0),
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") { const p = vec(m.p, 8, 5000); return p ? { t: "pose", p } : null; }   // x, z, yaw, turret, gun, hatch, armour, speed
    if (m.t === "fire") { const o = vec(m.o, 3, 5000), v = vec(m.v, 3, 2000); return o && v ? { t: "fire", o, v, k: m.k === "H" ? "H" : "S" } : null; }
    if (m.t === "mine") { const o = vec(m.o, 2, 5000); return o ? { t: "mine", o } : null; }
    if (m.t === "hit") return { t: "hit", d: num(m.d, 0, 60) | 0 };
    if (m.t === "smoke" || m.t === "dead" || m.t === "ready") return { t: m.t };
    return null; },
};
export { TANK };
