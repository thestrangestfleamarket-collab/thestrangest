// LASER TAG's room rules: two players at most, and what a player may send the other (the Laser Durable Object in door.js relays only what passes here)
const MAX = 2, KINDS = ["", "front", "back", "gunL", "gunR", "barrel"], PHASES = ["u", "n", "r", "s", "w", "o"];
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const LASER = {
  MAX,
  slot: used => (used.includes(0) ? 1 : 0),
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") return Array.isArray(m.p) && m.p.length === 14 ? { t: "pose", p: m.p.map(v => num(v, -100, 100)) } : null;
    if (m.t === "st") return { t: "st", ph: PHASES.includes(m.ph) ? m.ph : "u", l: num(m.l, 0, 99) | 0, s: num(m.s, 0, 99) | 0, sc: num(m.sc, -99999, 99999) | 0, k: num(m.k, 0, 9) | 0, su: m.su ? 1 : 0, cal: m.cal ? 1 : 0, rd: m.rd ? 1 : 0 };
    if (m.t === "fire") return { t: "fire", k: KINDS.includes(m.k) ? m.k : "", rf: m.rf ? 1 : 0, d: num(m.d, 0, 60, 25), sid: num(m.sid, 0, 1e9) | 0 };
    if (m.t === "res") return { t: "res", sid: num(m.sid, 0, 1e9) | 0 };
    if (m.t === "go") return { t: "go", in: num(m.in, 1000, 10000, 5000) };
    return null; },
};
export { LASER };
