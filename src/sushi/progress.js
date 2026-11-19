// RAMEN across days (owner, 19 Nov 2026): the day number (day one is Friday 4 October 1985: clock.js), the savings, the cart's reputation, the dishes unlocked, the upgrades owned, what each regular remembers and last night's events; each day's takings target and the fee due at dawn; kept for a login by the website (POST /sushi/save, /sushi/load, worker/ramen.js), for anyone else as long as the page is open
import { G, clamp } from './ctx.js';
import { RECIPES, DAYDISH } from './cart.js';
import { mon } from './till.js';
import { NET } from '../holo/net.js';

// every word a player reads from this file
export const TEXT = {
  ups: {
    knife: ['SHARPER KNIFE', 'two slices to every stroke'],
    basket: ['SECOND NOODLE BASKET', 'two portions on the boil at once'],
    tank: ['BETTER FISH TANK', 'those waiting watch the fish and wait longer'],
    sign: ['BRIGHTER SIGN', 'more of those passing stop'],
    burner: ['HOTTER BURNERS', 'pots heat twice as fast, bowls keep warm'],
    pot: ['BIGGER STOCK POTS', 'each pot holds half as much again'],
    stool: ['THIRD STOOL', 'one more seat at the counter'],
  },
};
// one schema for every upgrade: its price in bowls (of the first dish) and what it sets in G.mods; apply() is the one place they are resolved
export const UPGRADES = [
  { id: 'knife', cost: 15, mod: { chop: 2 } },
  { id: 'basket', cost: 20, mod: { baskets: 2 } },
  { id: 'tank', cost: 20, mod: { calm: 1.15 } },
  { id: 'sign', cost: 25, mod: { draw: 1.25 } },
  { id: 'burner', cost: 30, mod: { heat: 2, cool: 0.5 } },
  { id: 'pot', cost: 30, mod: { pot: 1.5 } },
  { id: 'stool', cost: 40, mod: { seats: 3 } },
];
const BASE = { baskets: 1, seats: 2, chop: 1, pot: 1, draw: 1, calm: 1, heat: 1, cool: 1 };
// the cart begins with START dishes; each one after comes onto the menu when the cart's reputation reaches rep, or regulars have asked for it asks times (one new thing a day)
export const START = 2, NEED = [null, null, { rep: 58, asks: 3 }, { rep: 66, asks: 5 }];
export const EXTRAS = { rep: 64, day: 5 };   // special requests (firm noodles, extra toppings, one left out)
const U = RECIPES[DAYDISH[0]].price;   // every amount is counted in bowls of the first dish, so the prices can change under it
export const DAYS = {
  bowls: [25, 40, 47, 52, 56, 60, 64],   // the takings to aim for, day by day, in bowls: a gentle first day, then near what a fair cook takes
  target: (d, easy) => Math.round(U * DAYS.bowls[Math.min(d, DAYS.bowls.length) - 1] * (easy ? 0.6 : 1)),   // the day's takings to aim for
  fee: (d, easy) => Math.round(U * Math.min(6 + 4 * (d - 1), 36) * (easy ? 0.5 : 1)),         // due at dawn
  rep: (rating, met, short, refused, events) => Math.round((rating - 3.5) * 5) + (met ? 1 : -1) - (short ? 6 : 0) - Math.min(3, refused) + Math.max(-3, Math.min(3, events)),   // how a day moves the reputation (between -12 and +6; never below -3 on EASY, -2 on day one)
  strikes: 3,   // fees unpaid in a row before the pitch is lost (never on EASY, never on day one)
};
const fresh = () => ({ v: 1, day: 1, money: 0, rep: 50, debt: 0, strikes: 0, easy: false, tut: false, ups: [], recipes: DAYDISH.slice(0, START), extras: false, asks: {}, regs: {}, ev: [], best: 0 });

export function buildProgress(params) {
  const prog = { P: fresh(), saved: false, loaded: false, result: null, hooks: [] };
  G.prog = prog; G.money = { fmt: mon };   // (every new system writes an amount through G.money.fmt)
  const day = { menu: [], mods: false, drinks: false, night: false }, night = { menu: [], mods: false, drinks: true, night: true };
  // the cart as it stands today: the upgrades into G.mods, the menus for the day and the night
  prog.apply = () => { const P = prog.P; Object.assign(G.mods, BASE); for (const u of UPGRADES) if (P.ups.includes(u.id)) Object.assign(G.mods, u.mod);
    day.menu = DAYDISH.filter((k) => P.recipes.includes(k)); day.mods = !!P.extras; day.drinks = P.day >= 2;
    const nd = Object.keys(RECIPES).filter((k) => RECIPES[k].night); night.menu = [...new Set([...nd, day.menu[0], ...day.menu.slice(1).slice(-2)])]; night.mods = day.mods;   // the one menu (night only, owner 19 Nov 2026): the night's own bowl, the first dish and the two newest
    G.cart?.fit?.(); for (const f of prog.hooks) f(); };
  prog.stage = () => night;
  prog.on = (f) => { prog.hooks.push(f); };
  prog.has = (id) => prog.P.ups.includes(id);
  prog.price = (id) => { const u = UPGRADES.find((x) => x.id === id); return u ? u.cost * U : 0; };
  prog.buy = (id) => { const P = prog.P, c = prog.price(id); if (!c || prog.has(id) || P.money < c) return false; P.money -= c; P.ups.push(id); prog.apply(); prog.save(); return true; };
  prog.target = () => DAYS.target(prog.P.day, prog.P.easy);
  prog.fee = () => DAYS.fee(prog.P.day, prog.P.easy);
  prog.taken = () => (G.game ? G.game.money + G.game.tips + G.game.extra : 0);
  prog.setEasy = (on) => { prog.P.easy = !!on; prog.save(); };
  prog.reg = (id) => (prog.P.regs[id] ||= { a: 0, k: '', d: '', ok: 0, n: 0, b: 0, bd: 0 });
  // dawn: the fee is paid from the day's takings and the savings, the reputation moves with the rating, the target and the fee; what was earned comes onto tomorrow's menu
  prog.close = () => { if (prog.result) return prog.result; const P = prog.P, g = G.game, taken = prog.taken(), target = prog.target(), fee = prog.fee(), due = fee + P.debt, have = P.money + taken, paid = Math.min(due, have), short = due - paid, rating = g.rating(), met = taken >= target;
    let d = g.scores.length ? DAYS.rep(rating, met, short > 0, g.refused, G.events ? G.events.rep : 0) : -2; d = clamp(d, P.easy ? -3 : -12, 6); if (P.day === 1) d = Math.max(d, -2);
    const was = P.rep; P.rep = clamp(P.rep + d, 0, 100); P.money = have - paid; P.debt = short; P.strikes = short > 0 && P.day > 1 ? P.strikes + 1 : 0; P.best = Math.max(P.best, taken);
    const R = { day: P.day, taken, target, met, fee, owed: due - fee, paid, short, rating, served: g.served, lost: g.lost, late: g.lateServed, repWas: was, rep: P.rep, money: P.money, dish: null, extras: false, out: !P.easy && P.strikes >= DAYS.strikes };
    for (let i = START; i < DAYDISH.length && !R.dish; i++) { const k = DAYDISH[i], n = NEED[i] || NEED[NEED.length - 1]; if (!P.recipes.includes(k) && (P.rep >= n.rep || (P.asks[k] | 0) >= n.asks)) { P.recipes.push(k); R.dish = k; } }
    if (!R.dish && !P.extras && (P.rep >= EXTRAS.rep || P.day >= EXTRAS.day)) R.extras = P.extras = true;
    P.day++; if (R.out) prog.P = fresh(); prog.result = R; prog.saving = prog.save(); return R; };
  // the next morning (or the first again): the page as it was before the first bowl, the cart as it now stands
  prog.next = () => { prog.result = null; G.ended = false; prog.apply(); G.clock.reset(); };
  prog.over = () => { const easy = prog.P.easy; prog.P = fresh(); prog.P.easy = easy; prog.save(); prog.next(); };
  // what the website keeps (worker/ramen.js cuts it to size); a page nobody is logged in on keeps it only while it is open
  const tidy = (v) => { const P = fresh(); if (!v || typeof v !== 'object' || !(v.day >= 1)) return null; for (const k of ['day', 'money', 'rep', 'debt', 'strikes', 'best']) if (Number.isFinite(+v[k])) P[k] = +v[k]; P.easy = !!v.easy; P.tut = !!v.tut; P.extras = !!v.extras;
    if (Array.isArray(v.ups)) P.ups = v.ups.filter((id) => UPGRADES.some((u) => u.id === id)); if (Array.isArray(v.recipes)) P.recipes = DAYDISH.filter((k, i) => i < START || v.recipes.includes(k)); if (Array.isArray(v.ev)) P.ev = v.ev.map(String).slice(0, 8);
    if (v.asks && typeof v.asks === 'object') for (const k of DAYDISH) if (v.asks[k] > 0) P.asks[k] = v.asks[k] | 0;
    if (v.regs && typeof v.regs === 'object') for (const id in v.regs) { const r = v.regs[id]; if (r && typeof r === 'object') P.regs[id] = { a: clamp(+r.a || 0, -5, 10), k: String(r.k || ''), d: String(r.d || ''), ok: r.ok ? 1 : 0, n: r.n | 0, b: r.b | 0, bd: r.bd | 0 }; } return P; };
  const post = (path, body) => NET.tok().then(() => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const off = G.guest || params.has('prog') || !/^https?:$/.test(location.protocol); prog.loaded = off;
  prog.save = () => (off ? Promise.resolve(false) : post('/sushi/save', prog.P).then((j) => (prog.saved = !!(j && j.ok))));
  prog.load = () => (off ? Promise.resolve(false) : post('/sushi/load', {}).then((j) => { prog.loaded = true; if (!j) return false; prog.saved = true; const P = tidy(j.run); if (P && !prog.result) { prog.P = P; if (G.clock.running) prog.apply(); else prog.next(); } return !!P; }));   // (a run that comes back after the cart has opened still counts: the day goes on as that run's)
  prog.take = (v) => { const P = tidy(v); if (P) { prog.P = P; prog.next(); } return !!P; };   // (a check sets a run by hand)
  if (params.get('prog') === 'all') Object.assign(prog.P, { day: 5, tut: true, rep: 70, recipes: [...DAYDISH], extras: true });
  prog.apply();
  return prog;
}
