// FOURTH & LONG's room rules: two players at most, and what each may send the other (the Football Durable Object in door.js relays only what passes here). The first in runs the game and sends its state; the second sends what their side does
const MAX = 2, CMDS = ["in", "pick", "snap", "audible", "skip", "sw", "act", "order", "throw", "tv"];
const FOOT = {
  MAX,
  slot: used => (used.includes(0) ? 1 : 0),
  clean: (m, slot) => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "s") return slot === 0 && m.s && typeof m.s === "object" && Array.isArray(m.s.P) && m.s.P.length === 22 ? { t: "s", s: m.s } : null;
    if (m.t === "c") { if (slot !== 1 || !CMDS.includes(m.c)) return null; const a = Array.isArray(m.a) ? m.a : []; return JSON.stringify(a).length <= 400 ? { t: "c", c: m.c, a } : null; }
    return null; },
};
export { FOOT };
