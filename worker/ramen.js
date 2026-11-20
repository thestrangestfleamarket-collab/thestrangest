// RAMEN ACROSS DAYS (src/sushi/progress.js): a login's run, kept in Home: the day reached, the savings, the cart's reputation, the dishes and upgrades it has, what each regular remembers and last night's events. The page writes it (POST /sushi/save) and reads it back (POST /sushi/load); it is cut to size here, never trusted for anything but that player's own game
const word = (s, n = 16) => String(s ?? "").replace(/[^a-z0-9_-]/gi, "").slice(0, n);
const num = (v, lo, hi, d = lo) => Number.isFinite(+v) ? Math.min(hi, Math.max(lo, Math.round(+v * 100) / 100)) : d;
const list = (a, n) => (Array.isArray(a) ? a : []).map(x => word(x)).filter(Boolean).slice(0, n);

// the run as it is kept: { v, day, money, rep, debt, strikes, best, easy, tut, extras, ups: [id], recipes: [key], ev: [id], asks: {key: n}, regs: {id: {a, k, d, ok, n, b, bd}} }
function tidy(b) {
  if (!b || typeof b !== "object" || !(+b.day >= 1)) return null;
  const run = { v: 1, day: num(b.day, 1, 99999, 1) | 0, money: num(b.money, 0, 1e9, 0) | 0, rep: num(b.rep, 0, 100, 50), debt: num(b.debt, 0, 1e9, 0) | 0, strikes: num(b.strikes, 0, 9, 0) | 0, best: num(b.best, 0, 1e9, 0) | 0,
    easy: !!b.easy, tut: !!b.tut, extras: !!b.extras, ups: [...new Set(list(b.ups, 24))], recipes: [...new Set(list(b.recipes, 24))], ev: list(b.ev, 8), asks: {}, regs: {} };
  if (b.asks && typeof b.asks === "object") for (const k of Object.keys(b.asks).slice(0, 24)) { const w = word(k); if (w) run.asks[w] = num(b.asks[k], 0, 999, 0) | 0; }
  if (b.regs && typeof b.regs === "object") for (const k of Object.keys(b.regs).slice(0, 24)) { const w = word(k), r = b.regs[k]; if (!w || !r || typeof r !== "object") continue;
    run.regs[w] = { a: num(r.a, -5, 10, 0), k: word(r.k), d: word(r.d), ok: r.ok ? 1 : 0, n: num(r.n, 0, 99999, 0) | 0, b: num(r.b, 0, 9, 0) | 0, bd: num(r.bd, 0, 99999, 0) | 0 }; }
  return run;
}
// store: { get, put } on this player's own key
const save = async (store, body) => { const run = tidy(body); if (!run) return { why: "not a run" }; await store.put({ run, at: Date.now() }); return { ok: true, day: run.day }; };
const load = async store => { const v = (await store.get()) || {}; return { run: tidy(v.run) }; };

export const RAMEN = { tidy, save, load };
