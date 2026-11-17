// HULL DOWN's room rules: four players at most, and what a player may send the other (the Tank Durable Object in door.js relays only what passes here)
const MAX = 4;
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const vec = (a, n, lim) => (Array.isArray(a) && a.length === n ? a.map(v => num(v, -lim, lim)) : null);
const list = (a, max, lim) => (Array.isArray(a) && a.length <= max ? a.map(v => num(v, -lim, lim)) : null);
const id = v => (typeof v === "string" && v.length <= 64 ? v : "");
const TANK = {
  MAX,
  slot: used => { for (let i = 0; i < MAX; i++) if (!used.includes(i)) return i; return 0; },
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") { const p = Array.isArray(m.p) && m.p.length >= 8 && m.p.length <= 10 ? m.p.map(v => num(v, -5000, 5000)) : null; return p ? { t: "pose", p } : null; }   // x, z, yaw, turret, gun, hatch, armour, speed, head turn, head tilt
    if (m.t === "fire") { const o = vec(m.o, 3, 5000), v = vec(m.v, 3, 2000); return o && v ? { t: "fire", o, v, k: m.k === "H" ? "H" : "S" } : null; }
    if (m.t === "nade") { const o = vec(m.o, 3, 5000), v = vec(m.v, 3, 60); return o && v ? { t: "nade", o, v } : null; }
    if (m.t === "mine") { const o = vec(m.o, 2, 5000); return o ? { t: "mine", o } : null; }
    if (m.t === "hit") return { t: "hit", d: num(m.d, 0, 60) | 0, to: id(m.to) };
    if (m.t === "smoke" || m.t === "dead" || m.t === "ready") return { t: m.t };
    // a mission, run by the first one in: its start, its tanks and trucks, their shots, what is said and how it ends
    if (m.t === "start") return { t: "start", m: num(m.m, 0, 4) | 0, j: m.j ? 1 : 0 };
    if (m.t === "foes") { const a = list(m.a, 180, 5000), o = list(m.o || [], 16, 5000), n = list(m.n || [], 4, 999); return a && o && n ? { t: "foes", a, o, n } : null; }
    if (m.t === "shot") { const f = vec(m.f, 3, 5000), to = vec(m.to, 3, 5000); return f && to ? { t: "shot", f, to, h: m.h ? 1 : 0, w: id(m.w), i: num(m.i, -1, 5000, -1) | 0, k: num(m.k, -1, 8, -1) | 0 } : null; }
    if (m.t === "fhit") return { t: "fhit", f: num(m.f, 0, 60) | 0, d: num(m.d, 0, 3) | 0 };
    if (m.t === "kill") return { t: "kill", f: num(m.f, 0, 60) | 0 };
    if (m.t === "boom") { const o = vec(m.o, 3, 5000), d = vec(m.d, 2, 2000); return o && d ? { t: "boom", o, d, b: m.b ? 1 : 0, i: num(m.i, -1, 5000, -1) | 0 } : null; }
    if (m.t === "ram") { const d = vec(m.d, 2, 1); return d ? { t: "ram", i: num(m.i, 0, 5000) | 0, d } : null; }
    if (m.t === "say") { const n = list(m.n || [], 4, 999); return n ? { t: "say", c: num(m.c, 0, 15) | 0, n } : null; }
    if (m.t === "end") return { t: "end", w: m.w ? 1 : 0, c: num(m.c, 0, 15) | 0 };
    return null; },
};
export { TANK };
