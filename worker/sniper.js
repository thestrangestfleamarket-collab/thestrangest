// COLD BORE's duel room rules: two players at most, and what a player may send the other (the Sniper Durable Object in door.js relays only what passes here)
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const SNIPER = {
  MAX: 2,
  slot: used => (used.includes(0) ? 1 : 0),
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") return Array.isArray(m.p) && m.p.length === 12 ? { t: "pose", p: m.p.map(v => num(v, -5000, 5000)) } : null;
    if (m.t === "rd") return { t: "rd", rd: m.rd ? 1 : 0, q: m.q ? 1 : 0 };
    if (m.t === "go") return { t: "go", a: num(m.a, 0, 2) | 0, b: num(m.b, 0, 2) | 0, in: num(m.in, 1000, 10000, 5000), n: m.n ? 1 : 0 };
    if (m.t === "fire") return Array.isArray(m.o) && m.o.length === 3 && Array.isArray(m.d) && m.d.length === 3 ? { t: "fire", o: m.o.map(v => num(v, -5000, 5000)), d: m.d.map(v => num(v, -1, 1)) } : null;
    if (m.t === "hit") return { t: "hit", k: m.k ? 1 : 0 };
    return null; },
};
export { SNIPER };
