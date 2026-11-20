// the night's pressure (owner, 19 Nov 2026): how fast customers come and how many sit at once through the run (a quiet opening, the evening crowd, the small hours and their late rush), how long each will wait before walking, and what a slow bowl costs its score
import { G, clamp, rand } from './ctx.js';
import { PHASES, RUN } from './clock.js';

export const TEXT = { eve: 'THE EVENING CROWD', late: 'THE LATE RUSH', hurry: 'IN A HURRY', soon: (n) => `${n} IS COMING: GET NOODLES ON`, slow: 'Kept waiting' };
// [phase, from, to (shares of that phase), its name, seconds between arrivals, how many may be at the counter at once (9: every stool), the share of them in a hurry]
export const WINDOWS = [
  ['night', 0, 0.1, '', 24, 2, 0],
  ['night', 0.1, 0.3, 'eve', 8, 9, 0.3],
  ['night', 0.3, 0.55, '', 30, 2, 0],
  ['night', 0.55, 0.7, 'late', 9, 9, 0.2],
  ['night', 0.7, 1, '', 40, 2, 0],
  ['dawn', 0, 1, '', 99, 0, 0],
];
// seconds a customer waits for a bowl before walking: base and up to spread more, less perDay each day down to least, times ramp on the first days; queue more for each one already waiting when they order; a hurried one hurry of it; EASY easy times it, the small hours (after eleven) night times it, a visitor from THE MARKET guest times it
export const PATIENCE = { base: 62, spread: 14, least: 56, perDay: 1.5, ramp: [1.5, 1.05], queue: 12, hurry: 0.58, easy: 1.7, night: 1.2, guest: 2 };
// a prompt bowl: served within base seconds of the order (ramp times it on the first day; queue more for each one already waiting; the same hurry, easy and guest as patience, at night alike) it loses nothing; after that rate points a second, up to most (a bowl that late is half refunded: game.js), up to gentle on the first day and on EASY
export const PROMPT = { base: 21, ramp: [1.15], queue: 12, rate: 1, most: 52, gentle: 40 };
export const PACE = 90;   // seconds a stool turns over at a fair pace (the walk in, the order, the bowl, the meal, the change): what the day is stocked for

export function buildRush() {
  const R = {}, K = G.clock; G.rush = R;
  const P = () => G.prog.P;
  R.now = () => { for (const w of WINDOWS) if (w[0] === K.phase && K.pfrac >= w[1] && K.pfrac < w[2]) return w; return WINDOWS[WINDOWS.length - 1]; };
  R.name = () => { const k = R.now()[3]; return k ? TEXT[k] : ''; };
  const demand = () => G.mods.draw * (0.75 + P().rep / 200) / ((P().day === 1 ? 1.5 : 1) * (P().easy ? 1.4 : 1));
  R.max = () => (!P().tut && P().day === 1 ? 1 : Math.min(G.mods.seats, R.now()[5]));   // (the first day's first lesson is one customer at a time)
  R.gap = () => R.now()[4] / demand() * rand(0.7, 1.3);
  R.hurry = () => P().day > 1 && !P().easy && Math.random() < R.now()[6];
  R.patience = (c, others) => { const p = P(), night = K.hour > 23;
    const k = (p.easy ? PATIENCE.easy : 1) * (c.hurry ? PATIENCE.hurry : 1) * (c.guest ? PATIENCE.guest : 1); others = Math.min(2, others);
    c.prompt = PROMPT.base * (PROMPT.ramp[p.day - 1] || 1) * k + PROMPT.queue * others;
    return (Math.max(PATIENCE.least, PATIENCE.base - PATIENCE.perDay * (p.day - 1)) + rand(0, PATIENCE.spread)) * (PATIENCE.ramp[p.day - 1] || 1) * k * (night ? PATIENCE.night : 1) * G.mods.calm * (c.pat || 1) + PATIENCE.queue * others; };
  R.late = (c) => Math.round(clamp((c.maxPatience - c.patience - (c.prompt || PROMPT.base)) * PROMPT.rate, 0, P().day === 1 || P().easy ? PROMPT.gentle : PROMPT.most));
  // the rush about to begin (within s seconds), for a word of warning
  R.soon = (s = 25) => { for (const w of WINDOWS) { if (!w[3]) continue; const ph = PHASES.find((p) => p[0] === w[0]), at = ph[1] + (ph[2] - ph[1]) * w[1], left = (at - K.frac) * RUN; if (left > 0 && left < s) return TEXT.soon(TEXT[w[3]]); } return ''; };
  // how many will come through the whole run at a fair pace: what the day is stocked for (parts: { day, night }, by which menu they order from)
  R.expect = (parts) => { let day = 0, night = 3; const d = demand(); for (const w of WINDOWS) { const ph = PHASES.find((p) => p[0] === w[0]), dur = (ph[2] - ph[1]) * (w[2] - w[1]) * RUN, seats = Math.min(G.mods.seats, w[5]), n = Math.min(dur / (w[4] / d), seats * dur / PACE); if (w[0] === 'night') night += n; else day += n; }
    const all = Math.ceil(day + night); return parts ? { day: all * day / (day + night), night: all * night / (day + night), all } : all; };
  let was = '';
  R.update = () => { const n = R.name(); if (n !== was) { was = n; if (n && G.game && G.game.state === 'open') { G.fx.popup(G.cart.seatSpots[1].clone().setY(1.5), [n], true); G.audio.play('bell'); } } };
  return R;
}
