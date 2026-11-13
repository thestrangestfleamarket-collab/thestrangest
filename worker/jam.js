// STADIUM JAM's room rules: who fits on the stage and what a player may send the others (the Jam Durable Object in door.js relays only what passes here)
const MAX = 8, INSTS = ["drums", "guitar"];
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const JAM = {
  MAX,
  name: s => String(s ?? "").replace(/[^\w \-.']/g, "").trim().slice(0, 16) || "Player",
  inst: s => (INSTS.includes(s) ? s : "drums"),
  slot: used => { let s = 0; while (used.includes(s)) s++; return s; },
  // a pose, a note or a change of instrument, cut to what the page reads; anything else is dropped
  clean: (m, st) => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") return Array.isArray(m.p) && m.p.length === 28 ? { t: "pose", p: m.p.map(v => num(v, -1000, 1000)) } : null;
    if (m.t === "note") {
      if (m.k === "d") return { t: "note", k: "d", pad: num(m.pad, 0, 15) | 0, v: num(m.v, 0, 1), o: m.o ? 1 : 0 };
      if (m.k === "g") return { t: "note", k: "g", s: num(m.s, 0, 5) | 0, m: num(m.m, 28, 100) | 0, v: num(m.v, 0, 1) };
      return m.k === "x" ? { t: "note", k: "x" } : null; }
    if (m.t === "state") return { t: "state", inst: INSTS.includes(m.inst) ? m.inst : st.inst, tone: num(m.tone, 0, 2, st.tone) | 0, ky: num(m.ky, -1, 2, st.ky) };
    return null; },
};
export { JAM };
