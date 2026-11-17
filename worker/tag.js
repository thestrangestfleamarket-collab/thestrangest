// SENSOR TAG's room rules: two players at most, and what a player may send the other (the Tag Durable Object in door.js relays only what passes here)
const MAX = 2, KINDS = ["", "sensor", "hand", "body"], PHASES = ["u", "n", "o"];
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const TAG = {
  MAX,
  slot: used => (used.includes(0) ? 1 : 0),
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") return Array.isArray(m.p) && m.p.length === 15 ? { t: "pose", p: m.p.map(v => num(v, -100, 100)) } : null;
    if (m.t === "st") return { t: "st", ph: PHASES.includes(m.ph) ? m.ph : "u", l: num(m.l, 0, 10) | 0, k: num(m.k, 0, 999) | 0, cal: m.cal ? 1 : 0, rd: m.rd ? 1 : 0 };
    if (m.t === "fire") return { t: "fire", k: KINDS.includes(m.k) ? m.k : "", d: num(m.d, 0, 60, 25), sid: num(m.sid, 0, 1e9) | 0 };
    if (m.t === "go") return { t: "go", in: num(m.in, 1000, 10000, 3000) };
    return null; },
};
export { TAG };
