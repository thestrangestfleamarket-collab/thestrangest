// RAMEN across days (owner, 19 Nov 2026): the day number, the savings, the stall's reputation, the dishes unlocked, the upgrades owned and what each regular remembers; each day's takings target and the fee due at dawn; kept for a login by the website (POST /sushi/save, /sushi/load, worker/ramen.js), for anyone else as long as the page is open
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
  { id: 'knife', cost: 6, mod: { chop: 2 } },
  { id: 'basket', cost: 8, mod: { baskets: 2 } },
  { id: 'tank', cost: 8, mod: { calm: 1.15 } },
  { id: 'sign', cost: 10, mod: { draw: 1.25 } },
  { id: 'burner', cost: 12, mod: { heat: 2, cool: 0.5 } },
  { id: 'pot', cost: 12, mod: { pot: 1.5 } },
  { id: 'stool', cost: 16, mod: { seats: 3 } },
];
const BASE = { baskets: 1, seats: 2, chop: 1, pot: 1, draw: 1, calm: 1, heat: 1, cool: 1 };
// a dish after the first comes onto the menu when the stall's reputation reaches rep, or regulars have asked for it asks times (one new thing a day)
export const NEED = [null, { rep: 53, asks: 2 }, { rep: 58, asks: 3 }, { rep: 64, asks: 4 }];
export const EXTRAS = { rep: 60, day: 4 };   // special requests (firm noodles, extra toppings, one left out)
const U = RECIPES[DAYDISH[0]].price;   // every amount is counted in bowls of the first dish, so the prices can change under it
export const DAYS = {
  target: (d, easy) => Math.round(U * Math.min(12 + 6 * (d - 1), 54) * (easy ? 0.7 : 1)),   // the day's takings to aim for
  fee: (d, easy) => Math.round(U * Math.min(4 + 3 * (d - 1), 25) * (easy ? 0.5 : 1)),       // due at dawn
  strikes: 3,   // fees unpaid in a row before the pitch is lost (never on EASY, never on day one)
};
const fresh = () => ({ v: 1, day: 1, money: 0, rep: 50, debt: 0, strikes: 0, easy: false, tut: false, ups: [], recipes: [DAYDISH[0]], extras: false, asks: {}, regs: {}, best: 0 });

export function buildProgress(params) {
  const prog = { P: fresh(), saved: false, loaded: false, result: null, hooks: [] };
  G.prog = prog; G.money = { fmt: mon };   // (every new system writes an amount through G.money.fmt)
  const day = { menu: [], mods: false, drinks: false, night: false }, night = { menu: [], mods: false, drinks: true, night: true };
  // the stall as it stands today: the upgrades into G.mods, the menus for the day and the night
  prog.apply = () => { const P = prog.P; Object.assign(G.mods, BASE); for (const u of UPGRADES) if (P.ups.includes(u.id)) Object.assign(G.mods, u.mod);
    day.menu = DAYDISH.filter((k) => P.recipes.includes(k)); day.mods = !!P.extras; day.drinks = P.day >= 2;
    const nd = Object.keys(RECIPES).filter((k) => RECIPES[k].night); night.menu = [...new Set([...nd, day.menu[0], day.menu[day.menu.length - 1]])];
    G.cart?.fit?.(); for (const f of prog.hooks) f(); };
  prog.stage = (isNight) => (isNight ? night : day);
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
    let d = g.scores.length ? Math.round((rating - 3.6) * 6) + (met ? 2 : -1) : -2; if (short > 0) d -= 6; d = clamp(d, P.easy ? -3 : -12, 8); if (P.day === 1) d = Math.max(d, -2);
    const was = P.rep; P.rep = clamp(P.rep + d + (G.events ? G.events.rep : 0), 0, 100); P.money = have - paid; P.debt = short; P.strikes = short > 0 && P.day > 1 ? P.strikes + 1 : 0; P.best = Math.max(P.best, taken);
    const R = { day: P.day, taken, target, met, fee, owed: due - fee, paid, short, rating, served: g.served, lost: g.lost, late: g.lateServed, repWas: was, rep: P.rep, money: P.money, dish: null, extras: false, out: !P.easy && P.strikes >= DAYS.strikes };
    for (let i = 1; i < DAYDISH.length && !R.dish; i++) { const k = DAYDISH[i], n = NEED[i] || NEED[NEED.length - 1]; if (!P.recipes.includes(k) && (P.rep >= n.rep || (P.asks[k] | 0) >= n.asks)) { P.recipes.push(k); R.dish = k; } }
    if (!R.dish && !P.extras && (P.rep >= EXTRAS.rep || P.day >= EXTRAS.day)) R.extras = P.extras = true;
    P.day++; if (R.out) prog.P = fresh(); prog.result = R; prog.saving = prog.save(); return R; };
  // the next morning (or the first again): the page as it was before the first bowl, the stall as it now stands
  prog.next = () => { prog.result = null; G.ended = false; prog.apply(); G.clock.reset(); };
  prog.over = () => { const easy = prog.P.easy; prog.P = fresh(); prog.P.easy = easy; prog.save(); prog.next(); };
  // what the website keeps (worker/ramen.js cuts it to size); a page nobody is logged in on keeps it only while it is open
  const tidy = (v) => { const P = fresh(); if (!v || typeof v !== 'object' || !(v.day >= 1)) return null; for (const k of ['day', 'money', 'rep', 'debt', 'strikes', 'best']) if (Number.isFinite(+v[k])) P[k] = +v[k]; P.easy = !!v.easy; P.tut = !!v.tut; P.extras = !!v.extras;
    if (Array.isArray(v.ups)) P.ups = v.ups.filter((id) => UPGRADES.some((u) => u.id === id)); if (Array.isArray(v.recipes)) P.recipes = DAYDISH.filter((k, i) => !i || v.recipes.includes(k));
    if (v.asks && typeof v.asks === 'object') for (const k of DAYDISH) if (v.asks[k] > 0) P.asks[k] = v.asks[k] | 0;
    if (v.regs && typeof v.regs === 'object') for (const id in v.regs) { const r = v.regs[id]; if (r && typeof r === 'object') P.regs[id] = { a: clamp(+r.a || 0, -5, 10), k: String(r.k || ''), d: String(r.d || ''), ok: r.ok ? 1 : 0, n: r.n | 0, b: r.b | 0, bd: r.bd | 0 }; } return P; };
  const post = (path, body) => NET.tok().then(() => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const off = G.guest || params.has('prog') || !/^https?:$/.test(location.protocol);
  prog.save = () => (off ? Promise.resolve(false) : post('/sushi/save', prog.P).then((j) => (prog.saved = !!(j && j.ok))));
  prog.load = () => (off ? Promise.resolve(false) : post('/sushi/load', {}).then((j) => { prog.loaded = true; if (!j) return false; prog.saved = true; const P = tidy(j.run); if (P && !G.clock.running && !prog.result) { prog.P = P; prog.next(); } return !!P; }));
  prog.take = (v) => { const P = tidy(v); if (P) { prog.P = P; prog.next(); } return !!P; };   // (a check sets a run by hand)
  if (params.get('prog') === 'all') Object.assign(prog.P, { day: 5, tut: true, rep: 70, recipes: [...DAYDISH], extras: true });
  prog.apply();
  return prog;
}
