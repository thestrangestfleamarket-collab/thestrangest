// THE WEEK: node tools/weeksim.cjs [seed] [out.json]. A week of 30 players as an agent model on the game's own numbers (9 Nov 2026): habits, Central-evening sessions, skills by FORAGE.use, earnings by each activity's rate, the live shops' wants, every minute's save through the server's bucket (worker/door.js ECON).
const _S = require('../data/guitar-songs.json'), SONGS = Array.isArray(_S) ? _S : _S.songs;
let seed = +process.argv[2] || 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const pick = a => a[Math.floor(rnd() * a.length)], gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
const ECON = { cash: 2500, cashMin: 40, units: 600, unitsMin: 30 };
const KIT_UNITS = 99 * 14 + 12;
// skill gain: the game's FORAGE.use (tenths; under 30.0 a gain is 1-2 tenths), int 30
const use = (P, k, min, max) => { const v = P.sk[k] / 10, c = Math.max(0, Math.min(1, (v - min) / (max - min))), ok = rnd() < c;
  if (c > 0 && c < 1 && P.sk[k] < 1000 && P.tot() < 6000) { let g = (1000 - P.sk[k]) / 1000 * .5 * (.4 + 2.4 * c * (1 - c)) * (ok ? 1.2 : 1) + (P.sk[k] < 300 ? .3 : 0);
    if (rnd() < g) P.sk[k] = Math.min(1000, P.sk[k] + (P.sk[k] < 300 ? 1 + Math.floor(rnd() * 2) : 1)); } return ok; };
const know = (P, k) => 1 + P.sk[k] / 10 / 200, sell = (P, k, v) => Math.max(1, Math.round(v * .5 * know(P, k)));
// per-minute activity models (seconds of play -> cash in, units in, skill tries)
const ACT = {
  fish(P) { // 142-fishing: lambda = .0022*9.6*(1+fish/100)/s, strike (fish-(5*fight-40))/90 with fight ~ 3, avg bite $6.5; 40 s rest per spot; bait $1
    const lam = .0022 * 9.6 * (1 + P.sk.fish / 1000); let cash = 0, units = 0; const bites = 60 * lam;
    for (let i = 0; i < 3; i++) if (rnd() < bites / 3) { const ok = use(P, 'fish', -25, 65); if (ok || rnd() < (P.sk.fish / 10 + 25) / 90) { units++; P.fishV += 6.5 + (P.lure ? 1 : 0); } P.spend('bait', P.lure ? 0 : 1); }
    if (P.fishCarry() <= units + P.fishN) { cash += sell(P, 'fish', P.fishV); P.fishV = 0; P.fishN = 0; units = 0; } else P.fishN += units; return { cash, units }; },
  forage(P) { // park mushrooms: ~1 pick a minute at value ~6 (commons), rare 25% ; fairy rings when the player knows them
    let cash = 0; if (rnd() < .8) { const v = rnd() < .7 ? 4 : rnd() < .83 ? 16 : 70; if (use(P, 'forage', -5, 45)) { P.mush += v * (rnd() < .4 ? 2 : 1); use(P, 'myco', 0, 40); } }
    if (P.knows.fairy && rnd() < 60 / 115) P.mush += 3.5 * (.75 * 64 + .25 * 70);
    if (P.mush > 300 || rnd() < .05) { cash = sell(P, 'myco', P.mush); P.mush = 0; } return { cash, units: 0 }; },
  busk(P) { // 146zob: tip = k*(.5+lvl/40)*(.5+guitar/50)*U(.7,1.3), k<=6 listeners (fewer off the busy street), best song <= skill, 3 s between songs
    const g = P.sk.guitar / 10; let best = null, br = 0; for (const s of SONGS) { if (s.lvl > g) continue; const r = (.5 + s.lvl / 40) / (s.secs + 3); if (r > br) { br = r; best = s; } }
    if (!best) return { cash: 0 }; const k = P.knows.busk ? 6 : 3, songs = 60 / (best.secs + 3); let cash = 0;
    for (let i = 0; i < songs; i++) { cash += Math.max(1, Math.round(k * (.5 + best.lvl / 40) * (.5 + g / 50) * (.7 + rnd() * .6))); }
    for (let i = 0; i < songs * (1 + Math.floor(best.secs / 30)); i++) use(P, 'guitar', best.lvl - 30, best.lvl + 20);
    return { cash: Math.round(cash), units: 0 }; },
  dungeon(P) { // 146b-dunmobs: ~1.3 kills a minute when uncontested; level 1-5 by skill; coins+loot ~$12 at lvl 1 to ~$60 at lvl 5 (sold); bounties $30-150 repeat
    const lvl = 1 + Math.min(4, Math.floor(P.sk.sword / 10 / 12)), share = Math.min(1, 6 / Math.max(1, SECT.dungeoners)), kills = 1.3 * share * (P.sword >= 40 ? 1.3 : 1);
    let cash = 0; for (let i = 0; i < 3; i++) if (rnd() < kills / 3) { use(P, 'sword', lvl * 8 - 20, lvl * 8 + 30); use(P, 'fight', lvl * 8 - 20, lvl * 8 + 30); cash += (8 + 13 * (lvl - 1)) * (.6 + rnd() * .8); P.bk++; }
    if (P.bk >= 6) { P.bk = 0; cash += lvl >= 3 ? 90 : 30; }
    if (rnd() < .002 * (6 - lvl) + (P.sword < 15 ? .004 : 0)) P.die(); return { cash: Math.round(cash), units: 0 }; },
  paint(P) { // 159h: $1 paper, one fill, the professor pays $13; ~25 s each
    if (!P.knows.paint) return ACT.social(P); P.spend('paper', 2.4); return { cash: Math.round(2.4 * 13), units: 0 }; },
  photo(P) { // free film; first prints of rare subjects then 0.25 floor; ~$3/min plain, more for rare subjects
    const c = rnd() < .5 ? 1 : 0; use(P, 'photo', 0, 40); return { cash: Math.round(c * (6 + P.sk.photo / 40) * (P.knows.photo ? 4 : 1)), units: 0 }; },
  bugs(P) { // butterflies and birds: a catch ~ every 2 min, commons ~8, rare ~150 1 in 12; respawn on chunk reload if known
    let cash = 0; if (rnd() < .5 * (P.knows.bfly ? 2 : 1)) { if (use(P, 'ento', -10, 40)) { const v = rnd() < 1 / 12 ? 150 : 8; cash = sell(P, 'ento', v); } } return { cash, units: 0 }; },
  social(P) { return { cash: 0, units: 0 }; }, // board games, chat, the bar, the fair, skating, decorating: no money
  decorate(P) { return { cash: 0, units: 0 }; },
};
// what the live shops sell, by habit (one-time; nothing wears) and the open-ended sinks
const WANTS = { fish: [['lure_spoon', 14], ['cooler_m', 50], ['rod_carbon', 60], ['reel_fast', 40], ['cooler_l', 120], ['rod_surf', 180], ['reel_pro', 120], ['crabpot', 75], ['goggles', 30]],
  dungeon: [['sword_steel', 40], ['sword_ench', 120]], forage: [['pouch', 12], ['chest', 60]], bugs: [['jar_l', 25], ['feeder', 14], ['cages', 50]], busk: [], paint: [], photo: [],
  any: [['clothes', 150], ['hives', 147], ['gem_wheel', 35], ['pets', 120], ['aquarium', 400], ['garden', 120], ['lessons', 600]] };
const ARCH = { // habit weights, minutes a day, how likely to optimise (learns loops), spend urge
  explorer: { w: { fish: 2, forage: 2, bugs: 2, photo: 1, social: 3, dungeon: 1, decorate: 1 }, min: 70, opt: .2, spend: .7 },
  fisher: { w: { fish: 7, social: 1, forage: 1, decorate: 1 }, min: 90, opt: .1, spend: .6 },
  grinder: { w: { dungeon: 3, forage: 2, busk: 3, fish: 1, paint: 1 }, min: 180, opt: .9, spend: .3 },
  social: { w: { social: 7, busk: 1, decorate: 2 }, min: 80, opt: .1, spend: .8 },
  fighter: { w: { dungeon: 6, social: 1, decorate: 1 }, min: 120, opt: .4, spend: .5 },
  musician: { w: { busk: 6, social: 2, decorate: 1 }, min: 100, opt: .5, spend: .5 },
  decorator: { w: { decorate: 4, social: 2, forage: 2, fish: 1 }, min: 90, opt: .2, spend: 1 },
  casual: { w: { social: 3, fish: 1, forage: 1, bugs: 1, decorate: 1 }, min: 35, opt: .05, spend: .6 } };
const MIX = ['explorer', 'explorer', 'explorer', 'explorer', 'casual', 'casual', 'casual', 'casual', 'casual', 'casual', 'fisher', 'fisher', 'fisher', 'social', 'social', 'social', 'social', 'grinder', 'grinder', 'grinder', 'fighter', 'fighter', 'fighter', 'musician', 'musician', 'decorator', 'decorator', 'decorator', 'explorer', 'casual'];
const SECT = { dungeoners: 0 };
const players = MIX.map((a, i) => { const A = ARCH[a];
  const P = { i, a, A, cash: 1000, bank: 0, cb: ECON.cash, ib: ECON.units, sk: { forage: 200, myco: 150, fish: 150, ento: 150, guitar: 100, sword: 100, fight: 100, photo: 100, garden: 100, bee: 100, gem: 100 },
    knows: {}, owned: new Set(), fishV: 0, fishN: 0, mush: 0, bk: 0, sword: 15, lure: 0, earned: {}, spent: {}, clipC: 0, clipU: 0, kitLost: 0, deaths: 0, lost: 0, mins: 0, days: 0, quitDay: 0, bored: 0, log: [],
    pending: 0, fun: 0, idle: 0, sessions: 0 };
  P.tot = () => Object.values(P.sk).reduce((a, b) => a + b, 0) + 1100;
  P.fishCarry = () => P.owned.has('cooler_l') ? 100 : P.owned.has('cooler_m') ? 40 : P.owned.has('cooler_s') ? 15 : 5;
  P.spend = (what, v) => { P.cash -= v; P.spent[what] = (P.spent[what] || 0) + v; };
  P.die = () => { P.deaths++; if (rnd() < .25) { P.lost += P.cash; P.cash = 0; P.log.push('lost body') } };
  // the first save: the kit through the item bucket (worker/door.js ownedSave)
  const cut = Math.max(0, KIT_UNITS - P.ib); P.kitLost = cut; P.ib = Math.max(0, P.ib - KIT_UNITS);
  P.joinDay = i < 20 ? 0 : Math.floor(rnd() * 6) + 1; // 20 at launch, the rest join through the week
  return P; });
// sessions: each day each player may play; start hour by Central evening weight
const HOURW = [1, .5, .3, .2, .1, .1, .2, .4, .6, .8, 1, 1.2, 1.4, 1.3, 1.2, 1.3, 1.6, 2, 2.6, 3, 3.2, 3, 2.4, 1.6];
const pickHour = () => { const t = HOURW.reduce((a, b) => a + b) * rnd(); let s = 0; for (let h = 0; h < 24; h++) { s += HOURW[h]; if (s >= t) return h; } return 20; };
const conc = new Array(7 * 24 * 60).fill(0), dungeonAt = new Array(7 * 24 * 60).fill(0);
const sched = players.map(P => { const out = []; for (let d = 0; d < 7; d++) { if (d < P.joinDay) continue; const keep = d === P.joinDay ? 1 : Math.max(.15, .9 - .08 * (d - P.joinDay) - P.bored * .12);
  if (rnd() > keep) continue; const len = Math.max(10, Math.round(P.A.min * (1 + .5 * gauss()) * (d % 7 >= 5 ? 1.4 : 1))), h = pickHour(), st = d * 1440 + h * 60 + Math.floor(rnd() * 60); out.push([st, Math.min(7 * 1440, st + len)]); } return out; });
const WEEK = 7 * 1440, daily = [];
let firstFinder = {}; const discover = (P, k, m) => { if (!P.knows[k]) { P.knows[k] = m; if (!firstFinder[k]) firstFinder[k] = { who: P.a + '#' + P.i, day: Math.floor(m / 1440) }; } };
for (let m = 0; m < WEEK; m++) {
  const on = players.filter((P, i) => sched[i].some(([a, b]) => m >= a && m < b)); conc[m] = on.length;
  for (const P of on) { if (!P.cur || rnd() < 1 / 15) { const w = { ...P.A.w }; if (P.knows.busk) w.busk = (w.busk || 0) + 4 * P.A.opt; if (P.knows.fairy) w.forage = (w.forage || 0) + 3 * P.A.opt; if (P.knows.paint) w.paint = (w.paint || 0) + 2 * P.A.opt;
      const t = Object.values(w).reduce((a, b) => a + b); let r = rnd() * t; for (const k in w) { r -= w[k]; if (r <= 0) { P.cur = k; break; } } } }
  SECT.dungeoners = on.filter(P => P.cur === 'dungeon').length; dungeonAt[m] = SECT.dungeoners;
  for (const P of on) {
    P.mins++; const r = ACT[P.cur](P) || {}; const gain = r.cash || 0; P.pending += gain; P.earned[P.cur] = (P.earned[P.cur] || 0) + gain; P.cash += gain; if (P.cur === 'social' || P.cur === 'decorate') P.fun++;
    // learning the loops: a player who does it (an optimiser), or hears of it in chat from someone online who knows
    for (const k of ['busk', 'fairy', 'paint', 'photo', 'bfly']) if (!P.knows[k]) { const told = on.some(o => o.knows[k]) ? .0015 * on.length : 0; const self = { busk: P.cur === 'busk' ? .01 : 0, fairy: P.cur === 'forage' ? .004 : 0, paint: .0003, photo: P.cur === 'photo' ? .003 : 0, bfly: P.cur === 'bugs' ? .004 : 0 }[k] * P.A.opt * 4;
      if (rnd() < told * P.A.opt + self) discover(P, k, m); }
    // the save each minute through the bucket
    P.cb = Math.min(ECON.cash, P.cb + ECON.cashMin); if (P.pending > 0) { const cut = Math.max(0, P.pending - P.cb); P.cb -= P.pending - cut; P.cash -= cut; P.clipC += cut; } P.pending = 0;
    // spending, now and then: the next want of its habits, then the open-ended ones
    if (rnd() < .02 * P.A.spend) { const list = [...(WANTS[P.cur] || []), ...WANTS.any].filter(([k]) => !P.owned.has(k)); const w = list.find(([, v]) => v <= P.cash * .6);
      if (w) { P.owned.add(w[0]); P.spend(w[0], w[1]); if (w[0] === 'lure_spoon') P.lure = 1; if (w[0] === 'sword_steel') P.sword = 40; if (w[0] === 'lessons') { for (const k in P.sk) P.sk[k] = Math.min(300, P.sk[k] + 30); } }
      else if (!list.length || list.every(([, v]) => v > P.cash * 3)) { if (P.cur === 'decorate' && P.cash > 200 && rnd() < .3) P.spend('furniture', Math.round(20 + rnd() * 130)); } }
    // banking a big wad sometimes (safe from death)
    if (P.cash > 1500 && rnd() < .01) { P.bank += P.cash - 500; P.cash = 500; }
  }
  if (m % 1440 === 1439) { const d = Math.floor(m / 1440); for (const P of players) { const left = [...Object.values(WANTS).flat()].filter(([k]) => !P.owned.has(k)).length; if (left < 4 && P.cash + P.bank > 3000) P.bored++; }
    const W = players.filter(P => d >= P.joinDay).map(P => P.cash + P.bank).sort((a, b) => a - b), sum = W.reduce((a, b) => a + b, 0);
    let g = 0; for (let i = 0; i < W.length; i++) g += (2 * (i + 1) - W.length - 1) * W[i]; g /= W.length * sum;
    const peak = Math.max(...conc.slice(d * 1440, (d + 1) * 1440)); const act = new Set(); players.forEach((P, i) => { if (sched[i].some(([a, b]) => a < (d + 1) * 1440 && b > d * 1440)) act.add(i); });
    daily.push({ day: d + 1, players: W.length, active: act.size, peakOnline: peak, medianWealth: W[W.length >> 1], p90: W[Math.floor(W.length * .9)], max: W[W.length - 1], total: sum, gini: +g.toFixed(2), knowBusk: players.filter(P => P.knows.busk).length, knowFairy: players.filter(P => P.knows.fairy).length }); } }
// report
const sum = o => Object.values(o).reduce((a, b) => a + b, 0), R = players.map(P => ({ id: P.a + '#' + P.i, join: P.joinDay + 1, hours: +(P.mins / 60).toFixed(1), wealth: Math.round(P.cash + P.bank), earned: Math.round(sum(P.earned)), spent: Math.round(sum(P.spent)), clipped: Math.round(P.clipC), kitLost: P.kitLost, deaths: P.deaths, lost: Math.round(P.lost),
  top: Object.entries(P.earned).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => k + ' $' + Math.round(v)).join(', '), wantsLeft: Object.values(WANTS).flat().filter(([k]) => !P.owned.has(k)).length, guitar: P.sk.guitar / 10 }));
const bySrc = {}; for (const P of players) for (const k in P.earned) bySrc[k] = (bySrc[k] || 0) + P.earned[k];
const spentBy = {}; for (const P of players) for (const k in P.spent) spentBy[k] = (spentBy[k] || 0) + P.spent[k];
const out = { daily, players: R, earnedBySource: Object.fromEntries(Object.entries(bySrc).map(([k, v]) => [k, Math.round(v)]).sort((a, b) => b[1] - a[1])), spentBy: Object.fromEntries(Object.entries(spentBy).map(([k, v]) => [k, Math.round(v)]).sort((a, b) => b[1] - a[1])),
  firstFinder, peakOnline: Math.max(...conc), peakInDungeon: Math.max(...dungeonAt), totalClipped: Math.round(players.reduce((a, P) => a + P.clipC, 0)), kitLostEach: players[0].kitLost };
if (process.argv[3]) require('fs').writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.table(daily); console.table(R); console.log(JSON.stringify({ earnedBySource: out.earnedBySource, spentBy: out.spentBy, firstFinder, peakOnline: out.peakOnline, peakInDungeon: out.peakInDungeon, totalClipped: out.totalClipped, kitLostEach: out.kitLostEach }, null, 1));
