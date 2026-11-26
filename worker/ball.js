// BALL's room rules: eight players at most, what a player may send the others, and the game of HORSE (the Ball Durable Object in door.js relays only what passes here and keeps the game)
const MAX = 8, WORD = "HORSE", TURN = 45000, COURTS = ["outdoor", "gym"], WX = ["clear", "mist", "drizzle", "storm"], NETS = ["nylon", "chain"];
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const alive = g => g.order.filter(id => g.letters[id] < WORD.length);
const after = (g, id) => { const a = alive(g), k = g.order.indexOf(id); for (let i = 1; i <= g.order.length; i++) { const q = g.order[(k + i) % g.order.length]; if (a.includes(q)) return q; } return null; };
// the shot is over: the next to match it, or the mark is lifted and the lead shoots again
const next = g => { const a = alive(g); g.queue = g.queue.filter(id => a.includes(id)); if (a.length < 2) { g.on = false; g.win = a[0] ?? null; g.spot = null; g.turn = null; return; }
  if (g.spot && g.queue.length) { g.turn = g.queue.shift(); return; } g.spot = null; if (!a.includes(g.lead)) g.lead = after(g, g.lead) ?? a[0]; g.turn = g.lead; };
const BALL = {
  MAX, WORD, TURN,
  slot: used => { let s = 0; while (used.includes(s)) s++; return s; },
  // a pose (head, hands, ball) or the court's settings, cut to what the page reads; anything else is dropped
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") return Array.isArray(m.p) && m.p.length === 15 ? { t: "pose", p: m.p.map(v => Math.round(num(v, -100, 100) * 1000) / 1000) } : null;
    if (m.t === "world") return { t: "world", court: COURTS.includes(m.court) ? m.court : "outdoor", hour: num(m.hour, 0, 24, 22), wx: WX.includes(m.wx) ? m.wx : "mist", net: NETS.includes(m.net) ? m.net : "nylon", lights: num(m.lights, 0, 2) | 0 };
    return null; },
  // HORSE: the lead shoots from anywhere; a make sets the mark and each other player in turn must make it from there or take a letter; a miss passes the lead on; the last one without the whole word wins
  start: (ids, now) => (ids.length < 2 ? null : { on: true, order: ids.slice(0, MAX), letters: Object.fromEntries(ids.slice(0, MAX).map(id => [id, 0])), lead: ids[0], turn: ids[0], spot: null, queue: [], t0: now, win: null, last: null, n: 0 }),
  shot: (g, id, made, x, z, now) => { if (!g || !g.on || id !== g.turn) return false;
    if (g.spot) { if (Math.hypot(x - g.spot.x, z - g.spot.z) > 1.6) return false; if (!made) g.letters[id]++; }
    else if (made) { g.spot = { x: num(x, -12, 12), z: num(z, -18, 18), by: id }; g.queue = []; for (let q = after(g, id); q && q !== id; q = after(g, q)) g.queue.push(q); }
    else g.lead = after(g, id) ?? id;
    g.last = { id, made: !!made }; g.n++; g.t0 = now; next(g); return true; },
  leave: (g, id, now) => { if (!g || !g.on || !g.order.includes(id)) return false; const was = g.turn === id; g.letters[id] = WORD.length; if (g.lead === id) g.lead = after(g, id); if (was || alive(g).length < 2) { g.t0 = now; next(g); } g.n++; return true; },
  tick: (g, now) => (!!g && g.on && now - g.t0 > TURN && BALL.shot(g, g.turn, false, g.spot ? g.spot.x : 0, g.spot ? g.spot.z : 0, now)),
};
export { BALL };
