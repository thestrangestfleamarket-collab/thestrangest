// Night flow: recipes, customers, orders, tips, the noise meter, results.
'use strict';
(function () {
const { V3, clamp } = MC, W = MC.world, C = MC.cook, S = MC.sfx, PL = MC.player, P = MC.phys;
const G = MC.game = { mode: 'menu', t: 0, len: 420, tips: 0, noise: 0, quietT: 0, served: 0, lost: 0, spot: 0, hiding: false, orders: [], sched: [], cfg: null, msg: '', msgT: 0, features: {}, caughtN: 0, vipServed: false, lives: 3, doneT: 0, time: 0 };
const RECIPES = MC.RECIPES = {
  toast: { name: 'Toasted Crumb', parts: ['toast'], tip: 4 }, char: { name: 'Charred Crumb', parts: ['char'], tip: 5 },
  roast: { name: 'Roasted Pea', parts: ['roast'], tip: 5 }, soup: { name: 'Pea Soup', parts: ['soup'], tip: 7 },
  cheesetoast: { name: 'Cheese Toast', parts: ['toast', 'melt'], tip: 9 }, cheeseplate: { name: "Ploughmouse's Plate", parts: ['toast', 'slice'], tip: 8 },
  mashtoast: { name: 'Pea Mash on Toast', parts: ['toast', 'mash'], tip: 8 }, soupcrouton: { name: 'Soup & Crouton', parts: ['soup', 'toast'], tip: 11 },
  cheesypeas: { name: 'Cheesy Peas', parts: ['roast', 'melt'], tip: 10 }, fondue: { name: 'Fondue Dippers', parts: ['melt', 'crumbs'], tip: 11 },
  gratin: { name: 'Crumb Gratin', parts: ['melt', 'crumbs', 'roast'], tip: 16 }, noodles: { name: 'Noodle Bowl', parts: ['boiled'], tip: 7 },
  mac: { name: 'Mouse & Cheese', parts: ['boiled', 'melt'], tip: 11 }, eggtoast: { name: 'Egg on Toast', parts: ['fried', 'toast'], tip: 11 },
  feast: { name: 'Midnight Feast', parts: ['toast', 'melt', 'roast'], tip: 15 },
};
// which raw ingredient + features a component needs (drives unlock gating + validation)
MC.COMPONENT = { toast: { src: 'crumb', st: 'toaster' }, char: { src: 'crumb', st: 'toaster' }, crumbs: { src: 'crumb', st: 'blade' }, melt: { src: 'cheese', st: 'pan' }, slice: { src: 'cheese', st: 'blade' },
  roast: { src: 'pea', st: 'pan' }, mash: { src: 'pea', st: 'blade' }, soup: { src: 'pea', st: 'pot' }, boiled: { src: 'noodle', st: 'pot' }, fried: { src: 'egg', st: 'pan' } };
G.has = f => !!G.features[f];
MC.say = function (m, dur = 4) { G.msg = m; G.msgT = dur; MC.emit('say', m); };

G.addNoise = function (n, pos, o) {
  if (pos && n > 2) G.lastNoisePos = pos.clone ? pos.clone() : pos;
  if (G.mode !== 'play' || n <= 0) return;
  if (MC.events.mask > 0) n *= 0.12;
  if (G.noise < 50 && G.noise + n >= 50 && !G.warned50) { G.warned50 = true; MC.say('Shh! The diner candle is flaring. Much louder and someone will come to look.', 3); }
  if (G.noise < 25) G.warned50 = false;   // thunder is rolling: nobody can hear you
  G.noise = Math.min(100, G.noise + n * (G.cfg.noiseMul || 1)); if (!(o && o.steady)) G.quietT = 1.5; MC.emit('noise', n);   // steady sources (the phone) let the meter drain between bursts
  if (G.noise >= 100) { if (MC.events.start('snacker', { investigate: true })) { G.noise = 40; MC.say('Too loud! Someone is getting up to check…', 4); } else { G.noise = 99; G.investigate = true; } }
};

// ---------- night setup ----------
G.cfgSlice = () => ({ id: 'slice', regulars: Object.keys(MC.REGULARS), title: 'A full night at The Flat', home: 0, seed: 7, len: 420, recipes: ['toast', 'char', 'cheesetoast', 'soup', 'roast', 'mashtoast', 'cheeseplate', 'soupcrouton', 'cheesypeas'], count: 9, need: 4, target: 70, vip: 'feast',
  events: [{ type: 'snacker', at: 0.47 }], mods: [], floss: true });
function schedule(cfg) {
  const r = MC.rng(cfg.seed * 7919 + 13), out = [], span = cfg.len - 110, rush = (cfg.mods || []).indexOf('rush') >= 0, n = Math.round(cfg.count * (rush ? 1.3 : 1));
  let pool = cfg.regulars.filter(id => !MC.REGULARS[id].vipOnly), last = null;
  // customers come in little waves (1-3 bugs a few seconds apart) with quiet gaps between, so stations overlap
  const times = []; { const waves = Math.max(1, Math.round(n / (n >= 6 ? 2.2 : 1.4))); let left = n;
    for (let w = 0; w < waves; w++) { const size = w === waves - 1 ? left : Math.min(left - (waves - 1 - w), Math.max(1, Math.round(left / (waves - w) + (r() - 0.5)))); const t0 = 5 + (w / waves) * span + (w ? (r() - 0.3) * span / waves * 0.35 : 0);
      for (let k = 0; k < size; k++) times.push(t0 + k * (4 + r() * 5)); left -= size; } }
  if (rush) { const rs = cfg.len * 0.35 + r() * cfg.len * 0.2; for (let k = 0; k < Math.round(n * 0.3); k++) times[times.length - 1 - k * 2 >= 0 ? times.length - 1 - k * 2 : 0] = rs + k * 7; }
  times.sort((a, b) => a - b);
  for (let i = 0; i < n; i++) {
    let at = times[i], id, tries = 0;
    do { id = MC.pick(r, pool); tries++; } while ((id === last || (MC.REGULARS[id].late && i < n * 0.6)) && tries < 20);
    last = id; const R = MC.REGULARS[id];
    let opts = cfg.recipes.filter(k => !R.simple || RECIPES[k].parts.length === 1); if (!opts.length) opts = cfg.recipes;
    const weighted = []; for (const k of opts) { weighted.push(k); if (R.likes.indexOf(k) >= 0) weighted.push(k, k); if (k === cfg.special) weighted.push(k, k, k); }
    out.push({ at, reg: id, recipe: MC.pick(r, weighted) });
  }
  if (cfg.vip) out.push({ at: cfg.len * (cfg.vipAt || 0.55), reg: cfg.vipReg || 'gregor', recipe: cfg.vip, vip: true });
  out.sort((a, b) => a.at - b.at); return out;
}
// special of the night: shows up more often and pays 1.5x
G.pickSpecial = function (cfg) { if (cfg.special !== undefined || cfg.long) return; const multi = cfg.recipes.filter(k => RECIPES[k].parts.length > 1 && k !== cfg.vip); cfg.special = cfg.recipes.length > 2 && multi.length ? multi[MC.rng(cfg.seed + 99)() * multi.length | 0] : null; };
// what a night could pay at an ordinary pace (before speed bonuses and regulars' memory): star targets are set from this
G.potential = function (cfg) { G.pickSpecial(cfg); let sum = 0; for (const s of schedule(cfg)) { const R = MC.REGULARS[s.reg]; sum += RECIPES[s.recipe].tip * R.tip * (cfg.tipMul || 1) * (s.recipe === cfg.special ? 1.5 : 1) * (s.vip ? 1.5 : 1); } return sum; };
G.countOf = cfg => Math.round(cfg.count * ((cfg.mods || []).indexOf('rush') >= 0 ? 1.3 : 1)) + (cfg.vip ? 1 : 0);
G.start = function (cfg) {
  MC.clock.reset();
  G.cfg = cfg;
  if (cfg.daily) { const S = MC.save, e = S.daily[cfg.daily]; if (!e) { S.daily[cfg.daily] = { first: { tips: 0, stars: 0, pending: true }, best: null }; MC.persist(); } else if (!e.best && e.tips != null) S.daily[cfg.daily] = { first: e, best: e }; }   // the first try is locked the moment it starts MC.events.reset();
  G.pickSpecial(cfg);
  W.build(cfg.home, cfg.seed);
  G.features = { blade: !!W.st.blade, pan: !!W.st.pan, pot: !!W.st.pot, floss: !!cfg.floss || MC.up('floss') };
  for (const s of W.sources) G.features[s.type] = true; G.features.egg = !!W.st.egg;
  C.reset(); PL.packMax = Math.min(2, 1 + (MC.up('pack') ? 1 : 0) + ((cfg.career || 0) >= 10 || cfg.home > 0 ? 1 : 0)); PL.reset(); PL.slip = false;   // a second pocket comes with the bigger kitchens
  G.tierUps = []; G.lifeAt = 0; G.n70 = G.n90 = false; G.lastServe = -99; G.warned50 = false; G.investigate = false; G.vipAt = -1;
  Object.assign(G, { mode: 'play', t: cfg.len, len: cfg.len, tips: 0, noise: 0, quietT: 0, served: 0, lost: 0, spot: 0, hiding: false, caughtN: 0, vipServed: false, doneT: 0, time: 0, lives: cfg.lives || 3, result: null });
  G.orders = []; G.sched = cfg.long ? [] : schedule(cfg); G.longT = 4; G.longEv = 75; G.tip = ''; G.total = G.sched.length; for (const s of W.seats) s.order = null;
  G.evq = (cfg.events || []).map(e => ({ type: e.type, at: e.at * cfg.len, o: e.o })).sort((a, b) => a.at - b.at);
  // interactables
  MC.inter.length = 0;
  for (const s of W.sources) if (s.min) MC.inter.push({ min: s.min, max: s.max, hint: h => s.type === 'crumb' ? 'tear off a crumb' : s.type === 'cheese' ? 'pinch off a bit of cheese' : s.type === 'noodle' ? 'snap off a piece of noodle' : 'take one', use: h => C.fromSource(s, h) });
  if (W.st.pot) MC.inter.push({ min: W.st.pot.box.min, max: W.st.pot.box.max, hint: h => C.pot.state === 'done' ? (C.pot.out === 'boiled' ? 'fish out the noodle' : 'ladle out the soup') : null, use: h => C.takeSoup(h) });
  if (W.st.egg) { const ei = C.eggInter = { min: new V3(0, -99, 0), max: new V3(0, -98, 0), hint: h => C.egg ? 'shove the egg' : null, use: h => C.pushEgg() }; MC.inter.push(ei); } else C.eggInter = null;
  for (const p of W.pins) MC.inter.push({ min: p.head.clone().addScalar(-0.3), max: p.head.clone().addScalar(0.3), hint: h => !G.has('floss') ? null : !PL.floss ? 'tie floss to this pushpin' : PL.floss === p ? 'untie the floss' : 'string the floss line here', use: h => PL.pinUse(p) });
  MC.applyMods && MC.applyMods(cfg);
  MC.say(cfg.intro || 'The humans are asleep. The diner is open.', 5); MC.emit('night:start', cfg);
};

// ---------- customers ----------
function arrive(s, seat) {
  const R = MC.REGULARS[s.reg], rec = RECIPES[s.recipe], mem = MC.save.regulars[s.reg] || (MC.save.regulars[s.reg] = { n: 0 });
  const bug = MC.makeBug(R.spec); bug.base = seat.cust.y; bug.root.position.set(seat.cust.x, seat.cust.y - 2.4, seat.cust.z); W.group.add(bug.root); bug.hop = 0.5; MC.emit('furAdded');
  const maxPat = (70 + 35 * rec.parts.length) * R.pat * (G.cfg.patMul || 1) * (MC.opt.pace === 'standard' ? 1 : 1.6);   // Pace: Relaxed / No walk-outs give everyone more time
  const o = { reg: s.reg, R, recipe: s.recipe, rec, parts: rec.parts.slice(), plated: [], pat: maxPat, maxPat, vip: !!s.vip, state: 'wait', seat, bug, eatT: 0, mem };
  seat.order = o; G.orders.push(o); S.chirp(seat.cust); G.arrivalT = 5; G.arrivalAt = seat.cust;
  MC.say((s.vip ? '★ VIP ★ ' : '') + R.name + ' the ' + R.kind + ' wants ' + rec.name + '. “' + (mem.n ? R.back : R.hi) + '”', 5); MC.emit('order', o);
}
function leave(o, happy) {
  o.state = 'out'; o.outT = 1.0; o.bug.targetY = -2.8; if (!happy) { o.bug.shake = 0.6; S.nope(o.seat.cust); }
  for (const it of o.plated) { if (happy) C.remove(it); else { C.free(it, new V3(o.seat.x, 1.2, -3.2), new V3(0, 2.5, 2.4)); it.cool = 1.2; it.quietT = 2.5; } }
  o.plated = [];
}
const remaining = o => { const need = o.parts.slice(); for (const it of o.plated) { const i = need.indexOf(C.key(it)); if (i >= 0) need.splice(i, 1); } return need; };
G.remaining = remaining;
G.wants = function (seat, it) {
  const o = seat.order; if (!o || o.state !== 'wait') return { why: 'Nobody is waiting at that plate.' };
  if (G.hiding) return { why: 'They are hiding — wait until it is safe.' };
  const k = C.key(it); if (remaining(o).indexOf(k) >= 0) return { ok: 1, hint: 'serve the ' + C.name(it) + ' to ' + o.R.name };
  const want = remaining(o).find(k2 => MC.COMPONENT[k2] && MC.COMPONENT[k2].src === it.type);
  if (want) return { why: o.R.name + ' wants it ' + STAGE[want] + '.' };
  return { why: o.R.name + ' did not order ' + C.name(it) + '. Check the ticket.' };
};
const STAGE = { toast: 'toasted: toaster once', char: 'charred: through the toaster twice', crumbs: 'as crumbs: cut it on the blade', melt: 'melted: in the pan', slice: 'sliced: on the blade', roast: 'roasted: in the pan', mash: 'mashed: cut it on the blade', soup: 'as soup: in the thimble pot', boiled: 'boiled: in the thimble pot', fried: 'fried: in the pan' };
G.wrongOffer = function (seat) { const o = seat.order; if (o && o.state === 'wait') { o.bug.shake = 0.5; if (o.R.picky) o.pat -= 10; } };
G.plate = function (seat, it) {
  const o = seat.order, n = o.plated.length; C.hold(it, 'plated'); o.plated.push(it); if (!n) o.firstPlate = G.time; o.lastPlate = G.time;
  it.pos.set(seat.plate.x + (n ? (n % 2 ? 0.17 : -0.17) : 0) * (o.parts.length > 1 ? 1 : 0), seat.plate.y + 0.13 + (n > 1 ? 0.12 : 0), seat.plate.z + (o.parts.length > 1 && n === 0 ? -0.08 : 0.06));
  it.mesh.quaternion.set(0, 0, 0, 1); it.mesh.visible = true; S.tink(it.pos); MC.emit('plated', o);
  if (!remaining(o).length) serve(o); else MC.say(o.R.name + ' still needs: ' + remaining(o).map(k => C.NAMES[k]).join(' + ') + '.', 3);
};
function serve(o) {
  const frac = clamp(o.pat / o.maxPat, 0, 1), R = o.R; let tip = o.rec.tip * (0.7 + 0.9 * frac * frac) * R.tip * (G.cfg.tipMul || 1), notes = [];
  if (o.recipe === G.cfg.special) { tip *= 1.5; notes.push('special'); }
  const hot = o.plated.every(it => it.hotT > 0); if (hot) { tip *= o.reg === 'bo' ? 2 : 1.2; notes.push(o.reg === 'bo' ? 'Bo loves it piping hot ×2' : 'still sizzling'); }
  if (o.reg === 'pinch' && o.parts.length > 1 && o.lastPlate - o.firstPlate > 10) { tip *= 0.5; notes.push('Pinch: it went cold on the plate'); }
  if (G.time - (G.lastServe || -99) < 8) { tip += 3; notes.push('double dash +$3'); } G.lastServe = G.time;
  if (R.bonusKey && o.parts.indexOf(R.bonusKey) >= 0) tip *= 1.5;
  if (o.reg === 'moth' && G.noise < 25) tip *= 2;
  if (!G.cfg.daily) tip *= 1 + Math.min(10, o.mem.n) * 0.02; if (o.vip) tip *= 1.5;   // regulars' memory (off in Daily, so scores compare)
  tip = Math.max(1, Math.round(tip)); G.tips += tip; G.served++; const t0 = MC.tierOf(o.mem.n); o.mem.n++; const t1 = MC.tierOf(o.mem.n); if (t1 !== t0) (G.tierUps = G.tierUps || []).push(R.name + ' is now your ' + t1 + '! Favourite: ' + (R.likes[0] ? RECIPES[R.likes[0]].name : 'the VIP dish')); if (o.vip) G.vipServed = true;
  o.state = 'eat'; o.eatT = 2.0; o.bug.hop = 0.9; o.tip = tip; S.coin(o.seat.cust);
  if (o.reg === 'moth' && G.noise < 25) notes.push('quiet-kitchen bonus');
  const meh = notes.some(n => /cold/.test(n));   // never "loves it" and "it went cold" in one breath
  MC.say(R.name + (meh ? ' eats it, unimpressed. +' : ' loves it! +') + MC.money(tip) + (notes.length ? ' (' + notes.join(', ') + ')' : ''), 4); MC.emit('served', o);
}
G.neededSoon = function (it) { const k = C.key(it); return G.orders.some(o => o.state === 'wait' && remaining(o).indexOf(k) >= 0) || it.age < 25; };
G.scatter = function () { for (const o of G.orders) if (o.state === 'wait') { leave(o, false); G.lost++; } };
G.caught = function (why) {
  if (G.mode !== 'play') return; G.caughtN++; G.lives--; S.gasp(); G.scatter();
  const fine = Math.min(G.tips, 6); G.tips -= fine; MC.say('EEK! ' + why + ' The customers scatter' + (fine ? ' and you drop ' + MC.money(fine) + '.' : '.'), 5); MC.emit('caught');
  if (G.cfg.long && G.lives <= 0) G.end('caught');
};

// ---------- the night clock: named phases over 12am-6am, a 'phase' event when one begins; ?fast=N runs the night N× (default 10) for testing ----------
const CLOCK = MC.clock = { speed: MC.params.has('fast') ? (+MC.params.get('fast') > 1 ? +MC.params.get('fast') : 10) : 1, phase: null,
  PHASES: [['open', 0], ['rush', 0.12], ['lull', 0.62], ['predawn', 0.85]],
  frac() { return G.len ? clamp(1 - G.t / G.len, 0, 1) : 0; },
  left() { return Math.max(0, G.t); },
  at(f) { let p = CLOCK.PHASES[0][0]; for (const [n, a] of CLOCK.PHASES) if (f >= a) p = n; return p; },
  tick() { if (G.cfg && G.cfg.long) return; const p = G.t < 45 ? 'predawn' : CLOCK.at(CLOCK.frac()); if (p !== CLOCK.phase) { CLOCK.phase = p; MC.emit('phase', p); } },
  reset() { CLOCK.phase = null; } };
// ---------- update ----------
G.update = function (dt) {
  if (G.msgT > 0) G.msgT -= dt;
  if (G.mode !== 'play') return;
  G.time += dt; G.t -= dt * (G.hiding ? 0.5 : 1) * CLOCK.speed;   // dawn keeps coming while you hide, just slower
  CLOCK.tick();
  const chirp = G.orders.some(o => o.state === 'wait' && o.R.chirp);
  if (G.quietT > 0) G.quietT -= dt; else G.noise = Math.max(0, G.noise - (chirp ? 12 : 6) * dt);
  if (W.candle) W.candle.wild = G.noise / 100;
  MC.audio.setLoop('wind', Math.pow(G.noise / 100, 2) * 0.08, 0.5);   // a beating drone that swells as the kitchen gets loud
  const door = new V3(61, 12, 30); if (G.noise >= 70 && !G.n70) { G.n70 = true; S.bedsprings(door); if (MC.opt.cues) MC.say('🔊 Bedsprings creak down the hall… someone is stirring.', 3); } if (G.noise >= 90 && !G.n90) { G.n90 = true; S.cough(door); if (MC.opt.cues) MC.say('🔊 A cough from the bedroom! One more bang and they get up.', 3); } if (G.noise < 40) G.n70 = G.n90 = false;
  // arrivals
  const el = G.len - G.t;
  if (!G.hiding && G.sched.length && G.sched[0].at <= el) { const seat = W.seats.find(s => !s.order); if (seat) arrive(G.sched.shift(), seat); }
  // orders
  for (const o of G.orders.slice()) {
    o.bug.targetY = o.state === 'out' ? -2.8 : G.hiding ? -1.9 : 0; o.bug.mood = o.state === 'eat' ? 'eat' : o.pat < o.maxPat * 0.3 ? 'antsy' : 'idle'; o.bug.update(dt, PL.head);
    if (o.state === 'wait') {
      o.pat -= dt * (o.R.shy && G.noise > 55 ? 3 : 1) * (G.hiding ? 0.5 : 1);   // hiding costs time: patience still drains, at half speed if (MC.opt.pace === 'nowalk' && o.pat < 1) o.pat = 1;   // they wait as long as it takes (tips bottom out)
      if (o.pat <= 0) { leave(o, false); G.lost++; MC.say(o.R.name + ' got tired of waiting and left.' + (G.cfg.long ? ' You lose a life.' : ''), 4); MC.emit('lost', o); if (G.cfg.long && --G.lives <= 0) return G.end('walkout'); }
    } else if (o.state === 'eat') {
      o.eatT -= dt; const k = clamp(o.eatT / 2, 0, 1); for (const it of o.plated) it.mesh.scale.setScalar(k);
      if (o.eatT <= 0) leave(o, true);
    } else if (o.state === 'out') { o.outT -= dt; if (o.outT <= 0) { W.group.remove(o.bug.root); o.seat.order = null; G.orders.splice(G.orders.indexOf(o), 1); } }
  }
  // Long Night: endless arrivals that speed up, and a random event every so often
  if (G.cfg.long && !G.hiding) {
    const lvl = G.served, c = G.cfg; G.longT -= dt; c.patMul = Math.max(0.55, 1 - lvl * 0.02);
    const seat = W.seats.find(s => !s.order);
    if (G.longT <= 0 && seat) {
      const vip = lvl > 0 && lvl % 8 === 7 && G.vipAt !== lvl && !G.orders.some(o => o.reg === 'gregor'); if (vip) G.vipAt = lvl; const ids = Object.keys(MC.REGULARS).filter(id => !MC.REGULARS[id].vipOnly && !G.orders.some(o => o.reg === id)), r = Math.random;
      const maxParts = 1 + Math.floor(lvl / 4), opts = c.recipes.filter(k => RECIPES[k].parts.length <= maxParts), reg = vip ? 'gregor' : MC.pick(r, ids), R = MC.REGULARS[reg];
      const o2 = opts.filter(k => !R.simple || RECIPES[k].parts.length === 1);
      arrive({ reg, recipe: vip ? MC.pick(r, c.recipes.filter(k => RECIPES[k].parts.length > 1)) : MC.pick(r, o2.length ? o2 : opts), vip }, seat); G.longT = Math.max(9, 26 - lvl * 0.9);
    }
    if (G.served && G.served % 12 === 0 && G.lifeAt !== G.served) { G.lifeAt = G.served; if (G.lives < 3) { G.lives++; MC.say('Twelve served: a life back! ♥', 3); } }
    {
    }
    G.longEv -= dt; if (G.longEv <= 0 && !MC.events.active) { const evs = Object.keys(MC.events.list).filter(k => k !== 'phone' || W.st.phone); MC.events.start(MC.pick(Math.random, evs), {}); G.longEv = Math.max(38, 70 - G.served * 1.5) + Math.random() * 30; }
  }
  // a racket during another event still brings someone to look, the moment it ends
  if (G.investigate && !MC.events.active) { G.investigate = false; if (MC.events.start('snacker', { investigate: true })) { G.noise = 40; MC.say('All that racket woke someone. They are coming to check…', 4); } }
  // scheduled events
  if (G.evq.length && G.evq[0].at <= el) { const e = G.evq[0]; if (MC.events.start(e.type, e.o || {})) G.evq.shift(); }   // a busy slot just delays the next event, it is not lost
  // end conditions
  if (G.t <= 0) return G.end('dawn');
  if (!G.sched.length && !G.orders.length && !MC.events.active && !G.cfg.long) { G.doneT += dt; if (G.doneT > 2.5) G.end('closed'); } else G.doneT = 0;
};
// one rule everywhere: ★ serve enough, ★★ hit the tips, ★★★ also lose at most 1 in 10 customers (and serve the VIP if there is one)
G.stars = function () { const c = G.cfg; if (c.long) return 0; return G.served < c.need ? 0 : G.tips < c.target ? 1 : (G.lost > Math.floor(G.total / 10) || (c.vip && !G.vipServed)) ? 2 : 3; };
G.end = function (reason) {
  if (G.mode !== 'play') return;
  G.mode = 'dawn'; MC.events.reset(); G.hiding = false; G.spot = 0;
  for (const h of PL.hands) h.grip = null; PL.zip = null;
  const c = G.cfg, stars = G.stars();
  G.result = { reason, stars, tips: G.tips, served: G.served, need: c.need, target: c.target, vip: c.vip ? G.vipServed : null, lost: G.lost, caught: G.caughtN, total: G.total, time: G.time };
  MC.emit('night:end', G.result); MC.persist();
  if (stars) for (let i = 0; i < stars; i++) S.star(i); else S.fail(); MC.audio.cadence(); MC.audio.setLoop('wind', 0, 1);
};
G.clockText = function () { if (G.cfg && G.cfg.long) { const s = Math.floor(G.time); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); } const f = clamp(1 - G.t / G.len, 0, 1), mins = Math.floor(f * 360), h = Math.floor(mins / 60), m = mins % 60; return (h === 0 ? 12 : h) + ':' + String(m).padStart(2, '0'); };
})();
