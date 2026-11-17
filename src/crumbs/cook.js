// Ingredients and stations. An ingredient is a small state machine {type, cut, cook}; physics is only for moving it around.
'use strict';
(function () {
const { V3, col, clamp } = MC, P = MC.phys, W = MC.world, M = MC.M, S = MC.sfx;
const C = MC.cook = { items: [], puffs: [], shells: [], T: null, pan: null, pot: null, heatMul: 1, softPaws: 1, egg: null, eggT: 0 };
const TYPES = C.TYPES = {
  crumb: { r: 0.15, mass: 0.3, ang: 0.8, loud: 1 }, cheese: { r: 0.16, mass: 0.45, ang: 0.5, loud: 1, box: true },
  pea: { r: 0.17, mass: 0.4, ang: 0.12, loud: 0.8 }, soup: { r: 0.2, mass: 0.6, ang: 0.9, loud: 1.3, box: true },
  noodle: { r: 0.15, mass: 0.3, ang: 0.8, loud: 0.7, box: true }, egg: { r: 0.17, mass: 0.4, ang: 0.6, loud: 0.8 },
};
C.NAMES = { crumb: 'bread crumb', toast: 'toasted crumb', char: 'charred crumb', crumbs: 'breadcrumbs', cheese: 'cheese bit', melt: 'melted cheese', slice: 'cheese slice',
  pea: 'pea', roast: 'roasted pea', mash: 'pea mash', soup: 'pea soup', burnt: 'burnt lump', noodle: 'noodle', boiled: 'boiled noodle', egg: 'egg drop', fried: 'fried egg' };
C.key = function (it) {
  const t = it.type;
  if (t === 'crumb') return it.cook === 1 ? 'toast' : it.cook >= 2 ? 'char' : it.cut ? 'crumbs' : 'crumb';
  if (it.cook >= 2) return 'burnt';
  if (t === 'cheese') return it.cook === 1 ? 'melt' : it.cut ? 'slice' : 'cheese';
  if (t === 'pea') return it.cook === 1 ? 'roast' : it.cut ? 'mash' : 'pea';
  if (t === 'noodle') return it.cook === 1 ? 'boiled' : 'noodle';
  if (t === 'egg') return it.cook === 1 ? 'fried' : 'egg';
  return t;
};
C.name = it => C.NAMES[C.key(it)] || it.type;

// ---------- visuals ----------
const geo = {}, mats = {};
function lumpy(r, seed, amt = 0.22) {
  const g = new THREE.IcosahedronGeometry(r, 2), p = g.attributes.position, v = new V3();
  for (let i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)); const n = MC.noise.fbm((v.x / r + 2) * 0.25 + seed * 0.1, (v.y / r + 2) * 0.25 + (v.z / r) * 0.13, 2, 6, 6, seed); v.multiplyScalar(1 + (n - 0.5) * 2 * amt); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
function tint(base, hex, extra) { const m = base.clone(); m.color = col(hex); Object.assign(m, extra || {}); return m; }
function initLook() {
  geo.crumb = [lumpy(0.16, 1), lumpy(0.16, 2), lumpy(0.16, 3)]; geo.bit = lumpy(0.07, 4, 0.3); geo.mash = lumpy(0.17, 5, 0.3);
  geo.cube = MC.rboxGeo(0.3, 0.3, 0.3, 0.05, 1.2); geo.slice = MC.rboxGeo(0.36, 0.07, 0.36, 0.025, 1.2); geo.sph = new THREE.SphereGeometry(0.17, 18, 14);
  geo.cap = new THREE.LatheGeometry([[0, 0], [0.16, 0], [0.23, 0.13], [0.2, 0.13], [0.15, 0.03], [0, 0.03]].map(p => new THREE.Vector2(p[0], p[1])), 20); geo.disc = new THREE.CircleGeometry(0.19, 18);
  geo.noodle = new THREE.TorusGeometry(0.12, 0.035, 6, 14, 5); geo.yolk = new THREE.SphereGeometry(0.09, 12, 10);
  mats.crumb = tint(M.bread, 0xffffff); mats.toast = tint(M.bread, 0xd9a14e); mats.char = tint(M.bread, 0x4a3324, { roughness: 1 });
  mats.cheese = M.cheese; mats.melt = M.flat(0xf4a81f, 0.16); mats.pea = M.pea; mats.roast = M.flat(0x4f6a1d, 0.7); mats.mash = M.flat(0x8cc152, 0.85);
  mats.burnt = M.flat(0x0d0b0a, 1); mats.soup = M.flat(0x79b23c, 0.12); mats.cap = M.wood; mats.noodle = M.flat(0xf1dc9a, 0.5); mats.boiled = M.flat(0xf8ecc0, 0.25); mats.white = M.flat(0xfbfaf2, 0.3); mats.yolk = M.flat(0xf5a81c, 0.25);
}
C.refresh = function (it) {
  const g = it.mesh; while (g.children.length) g.remove(g.children[0]);
  const add = (ge, ma, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(ge, ma); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const k = C.key(it);
  if (k === 'burnt') add(geo.mash, mats.burnt);
  else if (it.type === 'crumb') { const ma = mats[it.cook === 1 ? 'toast' : it.cook >= 2 ? 'char' : 'crumb']; if (it.cut) for (let i = 0; i < 5; i++) add(geo.bit, ma, 1, 1, 1, Math.cos(i * 1.3) * 0.09, (i % 2) * 0.05 - 0.04, Math.sin(i * 1.3) * 0.09); else add(geo.crumb[it.id % 3], ma); }
  else if (it.type === 'cheese') { if (it.cook === 1) add(geo.sph, mats.melt, 1.35, 0.4, 1.35, 0, -0.06, 0); else if (it.cut) add(geo.slice, mats.cheese); else add(geo.cube, mats.cheese); }
  else if (it.type === 'pea') { if (it.cook === 1) add(geo.sph, mats.roast, 0.95, 0.9, 0.95); else if (it.cut) add(geo.mash, mats.mash, 1.15, 0.55, 1.15, 0, -0.05, 0); else add(geo.sph, mats.pea); }
  else if (it.type === 'soup') { add(geo.cap, mats.cap, 1, 1, 1, 0, -0.08, 0); const d = add(geo.disc, mats.soup, 1, 1, 1, 0, 0.035, 0); d.rotation.x = -Math.PI / 2; d.castShadow = false; }
  else if (it.type === 'noodle') { const n = add(geo.noodle, it.cook === 1 ? mats.boiled : mats.noodle); n.rotation.x = Math.PI / 2; }
  else if (it.type === 'egg') { if (it.cook === 1) { add(geo.sph, mats.white, 1.3, 0.22, 1.3, 0, -0.08, 0); add(geo.yolk, mats.yolk, 1, 0.7, 1, 0, -0.02, 0); } else add(geo.yolk, mats.yolk, 1.5, 1.5, 1.5); }
};

// ---------- items ----------
let nextId = 1;
C.create = function (type, pos, o = {}) {
  const T = TYPES[type], it = { id: nextId++, type, cut: !!o.cut, cook: o.cook || 0, state: 'free', hand: null, cool: 0, quietT: 0, age: 0, panT: 0, lastSafe: null, impT: 0, home: o.home || pos.clone() };
  it.mesh = new THREE.Group(); W.group.add(it.mesh); C.refresh(it);
  it.body = P.makeBody({ pos, mass: T.mass, angDamp: T.ang, r: T.r, box: T.box ? [T.r, type === 'soup' ? 0.1 : T.r, T.r] : null,
    onImpact: (v, other) => { if (it.state !== 'free' || it.impT > 0) return; impact(it, v, other); } });
  it.inWorld = true; it.pos = new V3(pos.x, pos.y, pos.z);
  C.items.push(it); return it;
};
function impact(it, v, other) {
  it.impT = 0.12; const soft = other && other.soft, T = TYPES[it.type];
  const q = it.quietT > 0 || soft, pos = it.pos;
  S.thunk(pos, (v / 12) * (q ? 0.35 : 1), soft ? 'soft' : (other && other.metal) ? 'metal' : 'hard');
  if (!q) MC.game.addNoise(clamp((v - 1.5) * 2.4 * T.loud, 0, 38) * C.softPaws, pos);
}
C.setBody = function (it, on) { if (on !== it.inWorld) { P.enable(it.body, on); it.inWorld = on; } };
C.free = function (it, pos, vel) {
  if (it.state === 'gone' || !it.body || !it.body.rb) return;   // already taken away (its body is gone): nothing to set free
  if (!isFinite(pos.x + pos.y + pos.z)) pos = it.lastSafe || W.spawn.clone().setY(0.3);   // never hand the physics a place that is not a number
  if (it.hand) it.hand.item = null; it.hand = null; it.state = 'free'; it.pos.copy(pos);
  const b = it.body; b.position.set(pos.x, pos.y, pos.z); b.velocity.set(vel ? vel.x : 0, vel ? vel.y : 0, vel ? vel.z : 0); b.angularVelocity.set(0, 0, 0); b.setQuaternion(0, 0, 0, 1);
  C.setBody(it, true); b.wakeUp(); it.mesh.visible = true;
};
C.hold = function (it, state, hand) { it.state = state; it.hand = hand || null; if (hand) hand.item = it; C.setBody(it, false); };
C.remove = function (it) {
  C.setBody(it, false); P.destroy(it.body); W.group.remove(it.mesh); if (it.hand) it.hand.item = null; it.state = 'gone';
  const i = C.items.indexOf(it); if (i >= 0) C.items.splice(i, 1);
  const pk = MC.player.pack, pi = pk.indexOf(it); if (pi >= 0) pk.splice(pi, 1);
};
// soft billowing puffs: a few drifting sprites instead of one hard ball
let PUFF = null;
function puffTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); for (let i = 0; i < 7; i++) { const x = 20 + Math.random() * 24, y = 20 + Math.random() * 24, r = 10 + Math.random() * 12, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); } return new THREE.CanvasTexture(c); }
C.puff = function (p, color = 0xd8d0c0, s = 1, o = {}) {
  if (!PUFF) PUFF = puffTex(); const n = o.n || 5;
  for (let i = 0; i < n; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFF, color: col(color), transparent: true, opacity: 0, depthWrite: false })); sp.material.rotation = Math.random() * 6.3;
    sp.position.set(p.x + (Math.random() - 0.5) * 0.3 * s, p.y + (Math.random() - 0.3) * 0.2 * s, p.z + (Math.random() - 0.5) * 0.3 * s); W.group.add(sp);
    C.puffs.push({ m: sp, t: -i * 0.03, life: o.life || 0.7, s: 0.35 * s * (0.7 + Math.random() * 0.6), rise: o.rise == null ? 0.5 : o.rise, op: o.op || 0.6, vx: (Math.random() - 0.5) * 0.4 * s, vz: (Math.random() - 0.5) * 0.4 * s, spin: (Math.random() - 0.5) * 2 });
  }
};
// steam over things that are cooking, smoke when food is about to burn
function emitSteam(dt) {
  C.steamT = (C.steamT || 0) - dt; if (C.steamT > 0) return; C.steamT = 0.12;
  const pan = C.pan && C.pan.item, st = W.st;
  if (C.pot && C.pot.state === 'cooking') C.puff(new V3(st.pot.pos.x + (Math.random() - 0.5) * 0.3, st.pot.pos.y + 0.15, st.pot.pos.z), 0xffffff, 1.3, { n: 1, life: 1.8, rise: 1.0, op: 0.5 });
  if (pan) { const smoky = pan.cook >= 2 || (pan.cook === 1 && pan.panT > 11); C.puff(new V3(st.pan.pos.x + (Math.random() - 0.5) * 0.3, st.pan.pos.y + 0.2, st.pan.pos.z), smoky ? 0x3a3632 : 0xf4efe6, smoky ? 1.4 : 1.0, { n: 1, life: smoky ? 2 : 1.4, rise: 0.8, op: smoky ? 0.65 : 0.42 }); }
}
function recover(it, why) {
  const to = it.lastSafe || it.home; C.puff(it.pos); C.free(it, new V3(to.x, to.y + 0.25, to.z)); it.quietT = 2; C.puff(it.pos); S.puff(it.pos);
  if (why) MC.say('Your ' + C.name(it) + ' ' + why + ' — it has been put back within reach.', 3);
}
C.bounce = function (it, why) { // gentle "no thanks" pop toward the open counter
  const b = it.body; it.cool = 1.4; it.quietT = 2.5; C.free(it, it.pos, new V3((Math.random() - 0.5) * 0.8, 3.6, 2.6)); void b;
  S.nope(it.pos); if (why) MC.say(why, 3);
};

// ---------- stations ----------
function resetStations() {
  const t = W.st.toaster;
  C.T = { state: 'up', y: t.top, t: 0, tick: 0, n: 0 }; setLever(t.top);
  C.pan = { item: null }; C.pot = { state: 'empty', t: 0 };
  W.st.pot.soup.material.color = col(0x9fc3d6);
}
function setLever(y) {
  const t = W.st.toaster, g = t.lever, dy = y - C.T.y; C.T.y = y;
  g.min.y = y - 0.13; g.max.y = y + 0.13; g.mesh.position.y = y;
  for (const h of MC.player.hands) if (h.grip === g) h.anchor.y += dy;
}
const TOAST_T = 5, PAN_T1 = 6, PAN_T2 = 14, POT_T = 8, POT_OVER = 20, PT2 = () => PAN_T2 + (MC.opt.pace === 'standard' ? 0 : 6), POV = () => POT_OVER + (MC.opt.pace === 'standard' ? 0 : 15), HOT_T = 20;
function updateToaster(dt) {
  const T = C.T, t = W.st.toaster, hands = MC.player.hands, held = hands.some(h => h.grip === t.lever);
  if (T.state === 'up') {
    if (held) {
      setLever(Math.max(t.bot, T.y - 2.0 * dt));
      if (T.y <= t.bot) {
        const n = C.items.filter(i => i.state === 'slot').length;
        if (C.noPower) { T.state = 'rising'; S.tick(t.pos); MC.say('No power — the lever will not latch. Toast in the pan instead.', 3); return; }
        T.state = 'down'; T.t = n ? TOAST_T * C.heatMul : 0.9; T.tick = 0; T.n = n; S.clunk(t.pos); MC.game.addNoise(4, t.pos);
        MC.say(n ? 'Clunk. Toasting… let go and stand clear.' : 'Clunk. The slots are empty (a handy way down, though).', 3); MC.emit('lever', n);
      }
    } else if (T.y < t.top) setLever(Math.min(t.top, T.y + 3.5 * dt));
  } else if (T.state === 'down') {
    T.t -= dt; T.tick -= dt; if (T.tick <= 0) { T.tick = 0.5; S.tick(t.pos); }
    if (T.t <= 0) {
      T.state = 'rising'; S.pop(t.pos); MC.game.addNoise(T.n ? 9 : 4, t.pos);
      for (const h of hands) if (h.grip === t.lever) MC.player.endGrip(h);
      let k = 0;
      for (const it of C.items) if (it.state === 'slot') {
        it.cook = Math.min(2, it.cook + 1); C.refresh(it); it.quietT = 3.5; it.cool = 0.8; it.hotT = HOT_T;
        C.free(it, new V3(t.ejectFrom.x + k * 0.75, t.ejectFrom.y, t.ejectFrom.z + (k % 2 ? 0.5 : -0.5)), new V3((Math.random() - 0.5) * 0.6, 6.4, 2.7 + Math.random() * 0.3));   // up and just forward: it lands within a step of the toaster's front
        it.body.angularVelocity.set(Math.random() * 8, Math.random() * 8, Math.random() * 8); k++;
      }
      if (k) { MC.say('Pop! ' + (k > 1 ? k + ' crumbs fly' : 'A ' + C.name(C.items.find(i => i.cool > 0.7 && i.type === 'crumb') || { type: 'crumb', cook: 1 }) + ' flies') + ' onto the counter.', 3); MC.emit('pop', k); }
    }
  } else {
    for (const h of hands) if (h.grip === t.lever) MC.player.endGrip(h);
    setLever(Math.min(t.top, T.y + 10 * dt)); if (T.y >= t.top) T.state = 'up';
  }
  const hot = T.state === 'down' && T.n ? 1 : 0; t.slotMat.emissiveIntensity += (hot * 2.2 - t.slotMat.emissiveIntensity) * Math.min(1, dt * 3); t.light.intensity = t.slotMat.emissiveIntensity * 3;
}
function updatePan(dt) {
  const pan = C.pan, it = pan.item, st = W.st.pan;
  if (it && it.state !== 'pan') pan.item = null;
  if (pan.item) {
    it.panT += it.cook === 0 ? dt / C.heatMul : dt; it.pos.copy(st.pos); it.mesh.rotation.y += dt * 0.6;
    if (it.cook === 0 && it.panT >= PAN_T1) { it.cook = 1; it.hotT = HOT_T; C.refresh(it); S.ding(st.pos); MC.say('The ' + C.name(it) + ' is ready. Take it off before it burns!', 3); MC.emit('cooked', it); }
    else if (it.cook === 1 && it.panT >= PT2()) { it.cook = 2; C.refresh(it); C.puff(st.pos, 0x333333, 1.6); S.burnt(st.pos); MC.say(it.type === 'crumb' ? 'That crumb is charred now.' : 'Burnt! Toss it and try again.', 3); }
    if (C.timer && it.cook === 1 && it.panT > PT2() - 4) { C.timerT = (C.timerT || 0) - dt; if (C.timerT <= 0) { C.timerT = 0.35; S.tick(st.pos); S.tick(st.pos); } }
    if (it.cook === 1 && it.panT > PT2() - 5 && Math.random() < dt * 5) C.puff(new V3(st.pos.x, st.pos.y + 0.3, st.pos.z), 0x666666, 0.6);
  }
  const sz = pan.item && pan.item.cook < 2 ? MC.clamp(pan.item.panT / PT2(), 0, 1) : 0; MC.audio.setLoop('sizzle', sz ? 0.008 + 0.018 * sz : 0); C.sizzle = sz;
  C.panLeft = pan.item && pan.item.cook === 1 ? PT2() - pan.item.panT : null;
  C.panPct = pan.item ? (pan.item.cook === 0 ? pan.item.panT / PAN_T1 : pan.item.cook === 1 ? 1 + (pan.item.panT - PAN_T1) / (PT2() - PAN_T1) : 2) : -1;
}
function updatePot(dt) {
  const pot = C.pot, st = W.st.pot;
  if (pot.state === 'cooking') {
    pot.t += dt / (C.heatMul * (pot.fast ? 2 : 1)); const k = clamp(pot.t / POT_T, 0, 1);
    st.soup.material.color.copy(col(0x9fc3d6)).lerp(col(pot.out === 'boiled' ? 0xf3e2a8 : 0x6fae35), k);
    if (Math.random() < dt * 6) C.puff(new V3(st.pos.x + (Math.random() - 0.5) * 0.3, st.pos.y + 0.25, st.pos.z + (Math.random() - 0.5) * 0.3), 0xffffff, 0.35);
    if (pot.t >= POT_T) { pot.state = 'done'; S.potDing(st.pos); MC.say(pot.out === 'boiled' ? 'The noodle is boiled. Fish it out of the thimble.' : 'Pea soup is ready. Ladle it out of the thimble.', 3); MC.emit('cooked', pot); }
  }
  else if (pot.state === 'done') {   // left too long, the thimble boils over
    pot.over = (pot.over || 0) + dt;
    if (pot.over > POV() - 5 && Math.random() < dt * 5) C.puff(new V3(st.pos.x, st.pos.y + 0.3, st.pos.z), 0x4a4440, 0.9, { n: 1, life: 1.6, op: 0.55 });
    if (pot.over > POV()) { pot.state = 'empty'; pot.over = 0; st.soup.material.color = col(0x9fc3d6); C.puff(st.pos, 0xd8e8c0, 1.6); S.thunk(st.pos, 0.4, 'soft'); MC.game.addNoise(6, st.pos); MC.say('The thimble boiled over! Ladle soup out sooner next time.', 3); }
  }
  if (W.water) W.water.heat = pot.state === 'cooking' ? 0.35 : pot.state === 'done' ? 0.45 + 0.55 * clamp(pot.over / POV(), 0, 1) : 0;   // simmer, then a rolling boil as it nears boiling over
  const warn = pot.state === 'done' && pot.over > POV() - 5; C.boil = warn ? (pot.over - (POV() - 5)) / 5 : 0; MC.audio.setLoop('bubble', pot.state === 'cooking' ? 0.05 : warn ? 0.05 + 0.06 * C.boil : 0);
  if (MC.audio.bubbleBP && MC.audio.ctx) MC.audio.bubbleBP.frequency.setTargetAtTime(warn ? 420 + 500 * C.boil : 420, MC.audio.ctx.currentTime, 0.2);
  C.potLeft = pot.state === 'done' ? POV() - (pot.over || 0) : null;
  C.potPct = pot.state === 'cooking' ? pot.t / POT_T : pot.state === 'done' ? 1 + pot.over / POV() : -1;
}
// what would a station do with this item? returns {ok, hint, why}
C.zones = function () {
  const st = W.st, z = [
    { k: 'slot', zone: st.toaster.slot, test: it => it.type !== 'crumb' ? { why: 'Only bread goes in the toaster.' } : C.items.filter(i => i.state === 'slot').length >= 2 ? { why: 'Both slots are full.' } : it.cook >= 2 ? { why: 'That crumb is already charred.' } : C.T.state !== 'up' ? { why: 'The toaster is busy.' } : { ok: 1, hint: 'drop it in the toaster' } },
    { k: 'pan', zone: st.pan.zone, drop: new V3(st.pan.pos.x, st.pan.pos.y + 0.3, st.pan.pos.z), test: it => C.pan.item ? { why: 'The pan is full.' } : it.type === 'soup' ? { why: 'Soup does not go in the pan.' } : it.cook >= 2 ? { why: 'It is already burnt.' } : it.cook === 1 ? { why: 'It is already cooked: serve it before it burns.' } : { ok: 1, hint: 'put it in the pan' } },
    { k: 'pot', zone: st.pot.zone, drop: new V3(st.pot.pos.x, st.pot.pos.y + 0.45, st.pot.pos.z), test: it => C.pot.state !== 'empty' ? { why: 'The thimble is busy.' } : (it.type === 'pea' || it.type === 'noodle') && it.cook === 0 ? { ok: 1, hint: it.cut ? 'drop it in the thimble pot (mashed: cooks twice as fast)' : 'drop it in the thimble pot' } : { why: 'Only raw peas' + (MC.game.has('noodle') ? ' and noodles' : '') + ' go in the pot.' } },
  ];
  for (const s of W.seats) z.push({ k: 'plate', seat: s, zone: s.zone, drop: new V3(s.plate.x, s.plate.y + 0.3, s.plate.z), test: it => MC.game.wants(s, it) });
  return z;
};
function capture(it) {
  for (const z of C.zones()) {
    if (!P.inBox(it.pos, z.zone)) continue;
    const r = z.test(it);
    if (!r.ok) { if (z.k === 'slot' && C.T.state !== 'up') return; if (z.k === 'plate') MC.game.wrongOffer(z.seat); C.bounce(it, r.why); return; }
    if (z.k === 'slot') { C.hold(it, 'slot'); it.mesh.visible = false; S.pick(it.pos); MC.say('Crumb in the slot. Now hang your whole weight on the lever.', 3); MC.emit('slotted', it); }
    else if (z.k === 'pan') { C.hold(it, 'pan'); C.pan.item = it; if (it.cook === 1) it.panT = Math.max(it.panT, PAN_T1); it.mesh.quaternion.set(0, 0, 0, 1); S.pick(it.pos); MC.emit('panned', it); }
    else if (z.k === 'pot') { if (W.water) W.water.pokeWorld(it.pos, 0.06, 0.08); C.pot.state = 'cooking'; C.pot.t = 0; C.pot.over = 0; C.pot.fast = it.cut; C.pot.out = it.type === 'noodle' ? 'boiled' : 'soup'; C.puff(it.pos, 0xffffff, 0.6); S.pick(it.pos); C.remove(it); MC.emit('potted'); }
    else MC.game.plate(z.seat, it);
    return;
  }
}
C.takeSoup = function (hand) {
  if (C.pot.state !== 'done') return false;
  const it = C.pot.out === 'boiled' ? C.create('noodle', W.st.pot.pos, { cook: 1 }) : C.create('soup', W.st.pot.pos); it.hotT = HOT_T; C.pot.over = 0;
  it.home = W.st.pot.stand.clone().setY(0.3); MC.player.take(hand, it);
  C.pot.state = 'empty'; W.st.pot.soup.material.color = col(0x9fc3d6); return true;
};
C.canCut = it => it.cook === 0 && !it.cut && (it.type === 'pea' || it.type === 'cheese' || it.type === 'crumb');
C.cut = function (it) { it.cut = true; C.refresh(it); S.cut(W.st.blade.pos); C.puff(W.st.blade.pos, 0xffffff, 0.4); MC.emit('cut', it); };
C.fromSource = function (src, hand) {
  const it = C.create(src.type, src.out); it.home = src.stand.clone().setY((src.high ? src.stand.y : 0) + 0.3); MC.player.take(hand, it); C.puff(src.out, 0xe8dcc0, 0.5); return it;
};

// ---------- the egg (too heavy to lift: push it off its stand so it cracks) ----------
function spawnEgg() {
  const st = W.st.egg; if (!st) return;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 18), M.flat(0xf3e6d2, 0.55)); m.scale.set(1, 1.28, 1); m.castShadow = m.receiveShadow = true; W.group.add(m);
  let egg = null; const b = P.makeBody({ pos: st.home, mass: 5, r: 0.85, angDamp: 0.35, linDamp: 0.05, onImpact: (v, other) => { if (C.egg !== egg || !other || other.item) return; if (v > 4.2 && b.position.y < 1.4) crackEgg(other.soft); } });
  egg = C.egg = { mesh: m, body: b, pos: new V3().copy(st.home), restT: 0 };
  C.puff(st.home, 0xffffff, 1.5);
}
function crackEgg(soft) {
  const egg = C.egg; if (!egg) return; C.egg = null; const p = egg.pos.clone(); P.destroy(egg.body); W.group.remove(egg.mesh);
  for (let i = 0; i < 3; i++) { const it = C.create('egg', new V3(p.x + Math.cos(i * 2.1) * 0.4, 0.4, p.z + Math.sin(i * 2.1) * 0.4)); it.quietT = 2; it.home = W.st.egg.land.clone().setY(0.3); }
  for (const sd of [-1, 1]) { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), M.flat(0xf3e6d2, 0.6, 0, { side: THREE.DoubleSide })); sh.position.set(p.x + sd * 0.8, 0.02, p.z + 0.3 * sd); sh.rotation.set(Math.PI + sd * 0.5, sd, 0.4); sh.castShadow = true; W.group.add(sh); C.shells.push({ m: sh, t: 25 }); }
  S.thunk(p, 1.1, soft ? 'soft' : 'hard'); MC.audio.noise(0.18, { f: 3800, q: 1.5, vol: 0.3, pos: p, wet: 0.6 }); C.puff(p, 0xfff2c0, 1.6);
  if (!soft) MC.game.addNoise(24, p);
  C.eggT = 16; MC.say(soft ? 'Crack! The sponge muffled it. Grab the egg drops.' : 'CRACK! That was loud. Grab the egg drops.', 4); MC.emit('egg');
}
C.pushEgg = function () { const egg = C.egg; if (!egg) return; const d = MC.player.fwdFlat; egg.body.wakeUp(); egg.body.applyImpulse({ x: d.x * 22, y: 2, z: d.z * 22 }); S.grab(egg.pos); };
function updateEgg(dt) {
  for (let i = C.shells.length - 1; i >= 0; i--) { const s = C.shells[i]; s.t -= dt; if (s.t < 1) s.m.scale.setScalar(Math.max(0.01, s.t)); if (s.t <= 0) { W.group.remove(s.m); C.shells.splice(i, 1); } }
  if (!W.st.egg || !MC.game.has('egg')) return;
  const egg = C.egg, ei = C.eggInter;
  if (!egg) { if (ei) { ei.min.set(0, -99, 0); ei.max.set(0, -98, 0); } C.eggT -= dt; if (C.eggT <= 0) spawnEgg(); return; }
  const b = egg.body; egg.pos.set(b.position.x, b.position.y, b.position.z); egg.mesh.position.copy(egg.pos); egg.mesh.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
  if (ei) { ei.min.copy(egg.pos).addScalar(-1.0); ei.max.copy(egg.pos).addScalar(1.0); ei.max.y += 0.25; }
  const Bn = W.bounds, off = egg.pos.y < -1 || egg.pos.x < Bn.x0 - 0.5 || egg.pos.x > Bn.x1 + 0.5 || egg.pos.z > Bn.z1 + 0.5;
  if (egg.pos.y < 1.3 && Math.hypot(b.velocity.x, b.velocity.y, b.velocity.z) < 0.3) egg.restT += dt; else egg.restT = 0;
  if (off || egg.restT > 3) { P.destroy(b); W.group.remove(egg.mesh); C.egg = null; C.eggT = 0.5; if (!off) MC.say('The egg did not crack — it has been put back on its stand.', 3); }
}

// ---------- lifecycle ----------
C.reset = function () {
  if (!geo.crumb) initLook();
  for (const it of C.items.slice()) C.remove(it); for (const p of C.puffs) W.group.remove(p.m); C.puffs.length = 0;
  resetStations(); C.peaT = 0; C.heatMul = 1; C.softPaws = 1; for (const s of C.shells) W.group.remove(s.m); C.shells = [];
  if (C.egg) { P.destroy(C.egg.body); C.egg = null; } C.eggT = 0;
  // a few loose crumbs around the bread, and peas in the lid
  for (const s of W.sources) {
    if (s.type === 'crumb') for (let i = 0; i < 3; i++) C.create('crumb', new V3(s.out.x - 1.9 + i * 1.6 + (i === 1 ? 0.6 : 0), 0.2, s.out.z + 1.7 + (i % 2) * 0.4));
    if (s.type === 'pea') for (let i = 0; i < 5; i++) C.create('pea', new V3(s.lid.x + Math.cos(i * 1.26) * 0.42, 0.3, s.lid.z + Math.sin(i * 1.26) * 0.42));
  }
};
C.update = function (dt) {
  // while something watches, the pan and the pot keep cooking (hiding has a cost); only a crumb mid-toast is held, since riding the lever is impossible
  updateToaster(MC.game.hiding && C.T.state === 'down' ? 0 : dt); updatePan(dt); updatePot(dt); updateEgg(dt);
  const B = W.bounds; let freeIdle = [];
  for (const it of C.items.slice()) {
    it.age += dt; if (it.cool > 0) it.cool -= dt;
    if (it.hotT > 0 && it.state !== 'pan') { if (!MC.game.hiding) it.hotT -= dt; if (it.state !== 'pack' && it.state !== 'slot' && Math.random() < dt * 2.5) C.puff(new V3(it.pos.x, it.pos.y + 0.15, it.pos.z), 0xffffff, 0.35, { n: 1, life: 0.9, rise: 0.7, op: 0.3 }); } if (it.quietT > 0) it.quietT -= dt; if (it.impT > 0) it.impT -= dt;
    if (it.state === 'free') {
      const b = it.body; it.pos.set(b.position.x, b.position.y, b.position.z); it.mesh.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
      const bad = !(it.pos.y > -1.2) || !(it.pos.x > B.x0 - 0.3 && it.pos.x < B.x1 + 0.3) || !(it.pos.z < B.z1 + 0.3 && it.pos.z > B.z0 - 0.5) || !(it.pos.y < 40);
      if (bad) { recover(it, 'left the counter'); continue; }
      if (b.sleeping) {
        // what is it resting on?
        let top = null; for (const s of P.solids) { if (s.playerOnly) continue; const y = P.topAt(s, it.pos.x, it.pos.z, 0.05); if (y != null && y <= it.pos.y + 0.05 && (!top || y > P.yTop(top))) top = s; }
        if ((top && top.unreachable) || W.keepOut.some(k => P.inBox(it.pos, k))) { recover(it, 'landed out of reach'); continue; }
        // wedged inside a prop or pushed under the counter surface (it can happen when something drops an item into geometry)
        const p0 = it.pos, buried = p0.y < -0.05 || P.solids.some(s => !s.playerOnly && s.type === 'box' && p0.x > s.min.x + 0.05 && p0.x < s.max.x - 0.05 && p0.z > s.min.z + 0.05 && p0.z < s.max.z - 0.05 && p0.y > s.min.y + 0.05 && p0.y < s.max.y - 0.05);
        if (buried) { recover(it, 'got stuck'); continue; }
        if (!it.lastSafe) it.lastSafe = new V3(); it.lastSafe.copy(it.pos); freeIdle.push(it);
      }
      if (it.cool <= 0) capture(it);
    }
    if (it.state !== 'gone') it.mesh.position.copy(it.pos);
  }
  // keep the pea lid stocked; cap loose clutter
  C.peaT -= dt;
  if (C.peaT <= 0) { C.peaT = 2; for (const s of W.sources) if (s.type === 'pea' && MC.game.has('pea')) { const n = C.items.filter(i => i.type === 'pea' && i.state === 'free' && Math.hypot(i.pos.x - s.lid.x, i.pos.z - s.lid.z) < 1.0 && i.cook === 0 && !i.cut).length; if (n < 3) { const p = new V3(s.lid.x + (Math.random() - 0.5) * 0.5, 0.5, s.lid.z + (Math.random() - 0.5) * 0.5); C.create('pea', p); C.puff(p, 0xb9e08a, 0.6); } } }
  if (freeIdle.length > 16) { freeIdle.sort((a, b) => b.age - a.age); const it = freeIdle.find(i => !MC.game.neededSoon(i)) || freeIdle[0]; C.puff(it.pos); C.remove(it); }
  emitSteam(dt);
  for (let i = C.puffs.length - 1; i >= 0; i--) { const p = C.puffs[i]; p.t += dt; if (p.t < 0) continue; const k = p.t / p.life; p.m.scale.setScalar(p.s * (1 + k * 2.6)); p.m.position.x += p.vx * dt; p.m.position.z += p.vz * dt; p.m.position.y += p.rise * dt; p.m.material.rotation += p.spin * dt; p.m.material.opacity = p.op * Math.min(1, k * 6) * (1 - k); if (k >= 1) { W.group.remove(p.m); p.m.material.dispose(); C.puffs.splice(i, 1); } }
};
})();
