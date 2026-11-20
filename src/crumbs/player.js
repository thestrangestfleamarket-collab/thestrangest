// Player: walking, arm-powered climbing, ledge hops, floss ziplines, hands, backpack. Desktop + WebXR + scripted input.
'use strict';
(function () {
const { V3, Y, clamp, lerp, col } = MC, P = MC.phys, W = MC.world, S = MC.sfx, C = MC.cook;
const rig = MC.rig, camera = MC.camera;
const EYE = 1.2, REACH = 2.0, RAD = 0.25;
const PL = MC.player = { hands: [], pack: [], packMax: 1, vel: new V3(), grounded: true, peak: 0, daze: 0, fade: 0, yaw: 0, pitch: 0, speed: 0, head: new V3(0, EYE, 0),
  safe: new V3(), fwdFlat: new V3(0, 0, -1), fwdFull: new V3(0, 0, -1), right: new V3(1, 0, 0), headLocal: new V3(0, EYE, 0), zip: null, floss: null, seq: 0, slip: false, EYE, REACH, climbVel: new V3(), camLift: 0, bobT: 0, groundSolid: null, stickMove: 0 };
const I = MC.input = { mx: 0, mz: 0, jump: false, lookX: 0, lookY: 0, pullX: 0, pullY: 0, q: [] };
const keys = PL.keys = {};
MC.inter = [];   // interactables: {min,max,hint(hand)->string|null,use(hand)}
const headW = PL.headW = () => MC.toWorld(PL.headLocal);
const isXR = MC.isXR;

// ---------- paws ----------
function makePaw(i) {
  const g = new THREE.Group(), M = MC.M;
  MC.creature.init(); const K = MC.creature, fur = { len: 0.022, root: 0x4e463e, tip: 0x9d9284, layers: 8, repeat: 4, droop: 0.2 };
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), M.fur); palm.scale.set(1, 0.55, 1.15); g.add(palm); K.fur(palm, fur);
  const claw = M.flat(0xe8e0d2, 0.35); for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.04, 6), claw); c.position.set(-0.055 + k * 0.037, -0.018, -0.125 - (k === 1 || k === 2 ? 0.012 : 0)); c.rotation.x = -Math.PI / 2 - 0.5; g.add(c); }
  for (let k = 0; k < 4; k++) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M.pink); t.position.set(-0.055 + k * 0.037, -0.01, -0.095 - (k === 1 || k === 2 ? 0.012 : 0)); g.add(t); }
  const pad = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), M.pink); pad.position.set(0, -0.035, 0); pad.scale.set(1, 0.4, 1); g.add(pad);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.078, 1, 18, 4), M.fur); arm.geometry.translate(0, 0.5, 0); K.fur(arm, Object.assign({}, fur, { droop: 0 }));
  MC.shadow(g, true, false); arm.castShadow = true; MC.scene.add(g, arm);
  return { g, arm, pos: new V3(), side: i ? 1 : -1 };
}
// tracked hands jitter: a one-euro filter keeps a still paw still without lagging a fast one (after thestrangest's sushi input)
const _f = new V3();
function euro(f, p, dt) {
  if (!f.on || dt <= 0 || f.p.distanceTo(p) > 0.3) { f.p.copy(p); f.dp.set(0, 0, 0); f.on = true; f.k = 1; return f.p; }
  const al = c => 1 / (1 + 1 / (2 * Math.PI * c * dt));
  f.dp.lerp(_f.copy(p).sub(f.p).divideScalar(dt), al(1)); f.k = al(1.6 + 18 * f.dp.length()); return f.p.lerp(p, f.k);
}
// what a let-go thing carries on with: a weighted least-squares fit of the last few paw positions, the latest weighing most
const _a = new V3(), _b = new V3();
PL.throwOf = function (h, v) {
  const H = h.hist, n = H.length; v.set(0, 0, 0); if (n < 3) return v.copy(h.vel);
  let sw = 0, tm = 0; _a.set(0, 0, 0); for (let i = 0; i < n; i++) { const k = i + 1; sw += k; tm += k * H[i].t; _a.addScaledVector(H[i].p, k); } tm /= sw; _a.divideScalar(sw);
  let den = 0; for (let i = 0; i < n; i++) { const k = i + 1, d = H[i].t - tm; den += k * d * d; v.addScaledVector(_b.copy(H[i].p).sub(_a), k * d); }
  return den < 1e-8 ? v.copy(h.vel) : v.divideScalar(den).clampLength(0, 14);
};
PL.init = function () {
  for (let i = 0; i < 2; i++) {
    const obj = MC.renderer.xr.getControllerGrip(i); rig.add(obj);
    const h = { i, obj, grip: null, anchor: new V3(), offset: new V3(), item: null, seq: 0, pressed: 0, prev: new V3(), vel: new V3(), paw: makePaw(i), cutDone: false, fp: obj.position.clone(), f: { on: false, p: new V3(), dp: new V3(), k: 1 }, hist: [] };
    const down = () => { if (h.pressed++ === 0) { if (MC.opt.gripToggle && (h.grip || (PL.zip && PL.zip.hand === h))) I.q.push({ t: 'up', h: i }); else I.q.push({ t: 'down', h: i }); } }, up = () => { if (h.pressed > 0 && --h.pressed === 0 && !(MC.opt.gripToggle && (h.grip || (PL.zip && PL.zip.hand === h)))) I.q.push({ t: 'up', h: i }); };
    obj.addEventListener('squeezestart', down); obj.addEventListener('selectstart', down); obj.addEventListener('squeezeend', up); obj.addEventListener('selectend', up);
    PL.hands.push(h);
  }
  // comfort overlays
  PL.fadeMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, depthTest: false, fog: false })); PL.fadeMesh.position.z = -0.2; PL.fadeMesh.renderOrder = 999; camera.add(PL.fadeMesh);
  const vc = document.createElement('canvas'); vc.width = vc.height = 256; { const g = vc.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.42, 'rgba(0,0,0,0)'); gr.addColorStop(0.78, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  PL.vig = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(vc), color: 0xffffff, transparent: true, opacity: 0, depthTest: false, fog: false })); PL.vig.position.z = -0.3;
  // VR wrist note: hints and messages, since the page HUD does not exist in a headset
  const wc = document.createElement('canvas'); wc.width = 512; wc.height = 160; PL.wrist = { c: wc, tex: new THREE.CanvasTexture(wc), key: '' }; PL.wrist.tex.colorSpace = THREE.SRGBColorSpace;
  PL.wrist.mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.13), new THREE.MeshBasicMaterial({ map: PL.wrist.tex, transparent: true, depthTest: false, fog: false })); PL.wrist.mesh.renderOrder = 990; PL.wrist.mesh.visible = false; MC.scene.add(PL.wrist.mesh); PL.vig.renderOrder = 998; PL.vig.visible = false; camera.add(PL.vig);
  PL.red = new THREE.Mesh(new THREE.RingGeometry(0.2, 1.4, 32), new THREE.MeshBasicMaterial({ color: 0xff2010, transparent: true, opacity: 0, depthTest: false, fog: false, blending: THREE.AdditiveBlending })); PL.red.position.z = -0.32; PL.red.renderOrder = 997; camera.add(PL.red);
  PL.flossMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), new THREE.MeshBasicMaterial({ color: 0xffffff })); PL.flossMesh.geometry.translate(0, 0.5, 0); PL.flossMesh.visible = false; MC.scene.add(PL.flossMesh);
};
PL.reset = function () {
  for (const h of PL.hands) { h.grip = null; h.item = null; h.pressed = 0; }
  PL.pack.length = 0; PL.vel.set(0, 0, 0); PL.grounded = true; PL.daze = 0; PL.fade = 0; PL.zip = null; PL.floss = null; PL.flossMesh.visible = false;
  rig.position.copy(W.spawn); PL.safe.copy(W.spawn); PL.yaw = 0;
  { const b = W.sources.find(s => s.type === 'crumb'); if (b) PL.yaw = Math.atan2(-(b.out.x - W.spawn.x), -(b.out.z - W.spawn.z)); } PL.pitch = 0; rig.rotation.y = PL.yaw; PL.peak = W.spawn.y; PL.camLift = 0; I.q.length = 0; I.pullX = I.pullY = I.lookX = I.lookY = 0;
  PL.head.copy(headW());
};
const activeGrip = PL.activeGrip = () => PL.hands.filter(h => h.grip).sort((a, b) => b.seq - a.seq)[0];
const canAct = () => MC.game.mode === 'play' && PL.daze <= 0;

// ---------- items in hands ----------
PL.take = function (h, it) {
  const pi = PL.pack.indexOf(it); if (pi >= 0) PL.pack.splice(pi, 1);
  if (it.state === 'pan') C.pan.item = null;
  C.hold(it, 'held', h); it.mesh.visible = true; it.quietT = 0; h.cutDone = false; S.pick(it.pos); MC.emit('take', it);
};
PL.stash = function (it) { if (it.hand) it.hand.item = null; it.hand = null; C.hold(it, 'pack'); it.mesh.visible = false; PL.pack.push(it); S.stash(); MC.emit('stash', it); };
PL.packKey = function () {
  if (!canAct()) return;
  const hh = PL.hands.find(h => h.item);
  if (hh && PL.pack.length < PL.packMax) PL.stash(hh.item);
  else if (PL.pack.length) { const fh = PL.hands.find(h => !h.item && !h.grip); if (fh) PL.take(fh, PL.pack[PL.pack.length - 1]); else MC.say('Free a paw first.', 2); }
  else if (hh) MC.say('Your pack is full.', 2);
};

// ---------- grips ----------
PL.startGrip = function (h, g, point) {
  if (PL.zip) PL.zip = null;
  const other = PL.hands.find(x => x !== h && x.item);
  if (other && !g.lever) { if (PL.pack.length < PL.packMax) { MC.say('Tucked the ' + C.name(other.item) + ' into your pack: climbing takes both paws.', 3); PL.stash(other.item); } else MC.say('One paw is full and your pack is too: you will not get far climbing one-pawed.', 3); }
  PL.buzz(h, 0.35, 25); h.grip = g; h.anchor.copy(point); h.seq = ++PL.seq; PL.vel.set(0, 0, 0); h.offset.copy(point).sub(headW()); PL.climbVel.set(0, 0, 0); S.grab(point); MC.emit('grip', g);
};
PL.endGrip = function (h) {
  const g = h.grip; if (!g) return; h.grip = null;
  if (activeGrip()) { if (!mantleTarget(h, g)) return; for (const o of PL.hands) if (o.grip) o.grip = null; }   // let go of the top with one paw while the other still holds: still hop over
  PL.peak = rig.position.y;
  const m = mantleTarget(h, g);
  if (m) { rig.position.x += m.px - m.head.x; rig.position.z += m.pz - m.head.z; PL.camLift -= m.top - rig.position.y; rig.position.y = m.top; PL.peak = m.top; PL.vel.set(0, 0, 0); S.hop(); if (isXR()) { PL.fade = 1; PL.buzz(h, 0.6, 60); } MC.emit('mantle'); }
  else { PL.vel.copy(PL.climbVel).multiplyScalar(isXR() ? 1 : 0.55); const l = PL.vel.length(); if (l > 7) PL.vel.multiplyScalar(7 / l); }
};
function groundAt(x, z, maxY, pad = 0) { let g = -50, gs = null; for (const s of P.solids) { if (s.playerOnly) continue; const y = P.topAt(s, x, z, pad && P.yTop(s) <= rig.position.y + 0.05 ? pad : 0); if (y != null && y <= maxY && y > g) { g = y; gs = s; } } return [g, gs]; }
function mantleTarget(h, g) {
  if (g.line) return null;
  const head = headW(), sx = g.max.x - g.min.x, sy = g.max.y - g.min.y, sz = g.max.z - g.min.z; let nx = 0, nz = 0;
  if (sx <= sy && sx <= sz) nx = Math.sign(head.x - (g.min.x + g.max.x) / 2); else if (sz <= sy) nz = Math.sign(head.z - (g.min.z + g.max.z) / 2);
  const cur = groundAt(head.x, head.z, head.y - 0.2)[0];
  for (const d of [0.95, 0.5]) {   // land well inside the ledge, not on its lip (a narrow top takes the shorter hop)
    const px = h.anchor.x - nx * d, pz = h.anchor.z - nz * d, top = groundAt(px, pz, head.y + 0.3)[0];   // a head a little under the top still pulls itself over
    if (top > cur + 0.36 && Math.abs(groundAt(px + nx * 0.3, pz + nz * 0.3, head.y + 0.3)[0] - top) < 0.05) return { px, pz, top, head };
  }
  return null;
}
PL.mantleReady = () => PL.hands.some(h => h.grip && mantleTarget(h, h.grip));

// ---------- targeting (desktop + bot) ----------
function segRay(o, d, a, b) { // closest approach between ray and segment -> {t, s, dist}
  const u = new V3().subVectors(b, a), w0 = new V3().subVectors(o, a), A = d.dot(d), B = d.dot(u), Cc = u.dot(u), D = d.dot(w0), E = u.dot(w0), den = A * Cc - B * B;
  let s = den < 1e-9 ? 0 : clamp((A * E - B * D) / den, 0, 1); const t = Math.max(0, (B * s - D) / A);
  const p1 = o.clone().addScaledVector(d, t), p2 = a.clone().addScaledVector(u, s); return { t, s, dist: p1.distanceTo(p2), point: p2 };
}
PL.aim = function (h) {
  const o = headW(), d = PL.fwdFull, sr = P.ray(o, d, REACH + 1.5), st = sr ? sr.t : Infinity;
  if (h.item) {
    const it = h.item, bl = W.st.blade;
    if (bl && MC.game.has('blade')) { const t = P.rayBox(o, d, bl.zone.min, bl.zone.max); if (t !== null && t <= REACH && t <= st + 0.15) return C.canCut(it) ? { kind: 'cut', hint: 'click: cut it on the blade' } : { kind: 'none', hint: it.cut ? 'It is already cut.' : 'That cannot be cut.' }; }
    for (const g of W.grips) { if (g.lever) continue; const t = P.rayBox(o, d, g.min, g.max); if (t !== null && t <= REACH && t <= st + 0.08) return { kind: 'none', hint: PL.pack.length < PL.packMax ? 'Pack it first (E): climbing takes both paws' : 'Free a paw to climb' }; }
    for (const z of C.zones()) { const t = P.rayBox(o, d, z.zone.min, z.zone.max); if (t !== null && t <= REACH + 0.3 && t <= st + 0.15) { const r = z.test(it); return r.ok ? { kind: 'zone', t, z, hint: 'click: ' + r.hint } : { kind: 'none', hint: r.why }; } }
    if (sr && st <= REACH) return { kind: 'place', t: st, hint: 'click: set it down' };
    return { kind: 'toss', hint: '' };
  }
  let best = null; const put = (c) => { if (!best || c.t < best.t) best = c; };
  for (const it of C.items) { if (it.state !== 'free' && it.state !== 'pan') continue; const t = P.raySphere(o, d, it.pos, C.TYPES[it.type].r + 0.13); if (t !== null && t <= REACH && t <= st + 0.4) put({ kind: 'item', t: t - 0.15, ref: it, hint: 'click: pick up the ' + C.name(it) }); }
  for (const x of MC.inter) { const t = P.rayBox(o, d, x.min, x.max); if (t === null || t > REACH || t > st + 0.15) continue; const hint = x.hint(h); if (hint) put({ kind: 'inter', t, ref: x, hint: 'click: ' + hint }); }
  for (const g of W.grips) { const t = P.rayBox(o, d, g.min, g.max); if (t !== null && t <= REACH && t <= st + 0.08) put({ kind: 'grip', t, ref: g, hint: g.lever ? 'hold: hang on the lever' : 'hold + pull the mouse down: climb' }); }
  for (const L of W.lines) { const r = segRay(o, d, L.a, L.b); if (r.dist < 0.3 && r.t <= REACH && r.t <= st + 0.1) put({ kind: 'line', t: r.t, ref: L, s: r.s, point: r.point, hint: 'hold: ride the floss line' }); }
  if (best && !best.point) best.point = o.clone().addScaledVector(d, Math.max(0, best.t));
  return best;
};
function handDown(h) {
  if (MC.game.mode === 'dawn') { if (isXR()) MC.emit('vr:continue'); return; } if (!canAct()) return;
  if (isXR()) return vrGrab(h);
  const tg = PL.aim(h), o = headW(), d = PL.fwdFull;
  if (h.item) {
    const it = h.item; if (!tg) return;
    if (tg.kind === 'cut') return C.cut(it);
    if (tg.kind === 'none') { S.nope(o); return MC.say(tg.hint, 2); }
    if (tg.kind === 'zone') return C.free(it, tg.z.drop ? tg.z.drop.clone() : o.clone().addScaledVector(d, tg.t + 0.1));
    if (tg.kind === 'place') { S.thunk(it.pos, 0.08, 'soft'); return C.free(it, o.clone().addScaledVector(d, Math.max(0.2, tg.t - C.TYPES[it.type].r - 0.02))); }
    const p = o.clone().addScaledVector(d, 0.5); p.y -= 0.15; const v = d.clone().multiplyScalar(5.5); v.y += 2.2; return C.free(it, p, v);
  }
  if (!tg) return;
  if (tg.kind === 'item') PL.take(h, tg.ref); else if (tg.kind === 'inter') tg.ref.use(h); else if (tg.kind === 'grip') PL.startGrip(h, tg.ref, tg.point); else if (tg.kind === 'line') startZip(h, tg.ref, tg.s);
}
function handUp(h) {
  if (PL.zip && PL.zip.hand === h) { endZip(false); return; }
  if (h.grip) return PL.endGrip(h);
  if (isXR() && h.item) { const p = MC.toWorld(h.fp); if (PL.pack.length < PL.packMax && behindHead(p)) PL.stash(h.item); else C.free(h.item, p, PL.throwOf(h, new V3())); }
}
function behindHead(p) { const l = p.clone().sub(headW()); return l.dot(PL.fwdFlat) < 0 && l.length() < 0.5; }
function vrGrab(h) {
  if (h.item) return;
  const p = MC.toWorld(h.fp);
  let best = null, bd = 0.34; for (const it of C.items) if (it.state === 'free' || it.state === 'pan') { const dd = it.pos.distanceTo(p); if (dd < bd) { bd = dd; best = it; } }
  if (best) return PL.take(h, best);
  if (PL.pack.length && behindHead(p)) return PL.take(h, PL.pack[PL.pack.length - 1]);
  for (const L of W.lines) { const u = new V3().subVectors(L.b, L.a), s = clamp(p.clone().sub(L.a).dot(u) / u.lengthSq(), 0, 1); if (L.a.clone().addScaledVector(u, s).distanceTo(p) < 0.25) return startZip(h, L, s); }
  for (const x of MC.inter) if (P.distBox(p, x.min, x.max) < 0.22 && x.hint(h)) return x.use(h);
  for (const g of W.grips) if (P.distBox(p, g.min, g.max) < 0.16) return PL.startGrip(h, g, p);
}

// ---------- floss ziplines ----------
function startZip(h, L, s) {
  for (const x of PL.hands) x.grip = null; const pt = L.a.clone().lerp(L.b, s);
  // desktop: ease from where you are onto the line instead of snapping there
  const off = isXR() ? new V3() : headW().sub(pt.clone().sub(new V3(0, 0.55, 0)));
  PL.zip = { line: L, s, speed: 1.5, hand: h, off }; PL.vel.set(0, 0, 0); S.zip(); PL.buzz(h, 0.5, 80); MC.emit('zip');
}
function endZip(atEnd) { const z = PL.zip; if (!z) return; PL.zip = null; const dir = new V3().subVectors(z.line.b, z.line.a).normalize(); PL.vel.copy(dir).multiplyScalar(atEnd ? 2 : z.speed * 0.6); PL.peak = rig.position.y; }
PL.pinUse = function (pin) {
  if (!PL.floss) { PL.floss = pin; S.grab(pin.head); MC.say('Floss tied. Now pick another pushpin to string the line to.', 3); return; }
  if (PL.floss === pin) { PL.floss = null; PL.flossMesh.visible = false; return; }
  const a0 = PL.floss.head, b0 = pin.head, hi = a0.y >= b0.y ? a0 : b0, lo = hi === a0 ? b0 : a0;
  { const d = new V3().subVectors(lo, hi), dl = d.length(), hit = P.ray(hi, d.divideScalar(dl), dl); if (hit && hit.t < dl - 0.45) { S.nope(pin.head); MC.say('Something is in the way: the floss would cut through it. Pick a pushpin with a clear line.', 3); return; } }
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 5), new THREE.MeshStandardMaterial({ color: col(0xffffff), roughness: 0.4, emissive: col(0x30343c) })); m.geometry.translate(0, 0.5, 0);
  setSeg(m, hi, lo); W.group.add(m);
  const L = { a: hi.clone(), b: lo.clone(), mesh: m, line: true }; W.lines.push(L);
  if (W.lines.length > 3) { const old = W.lines.shift(); W.group.remove(old.mesh); }
  PL.floss = null; PL.flossMesh.visible = false; S.zip(); MC.emit('line', L);
  MC.say(hi.y - lo.y < 0.4 ? 'Line strung, but it is too flat to slide on.' : 'Zipline strung! Grab it near the high end to ride down.', 3);
};
function setSeg(m, a, b) { const d = new V3().subVectors(b, a), l = d.length(); m.position.copy(a); m.scale.set(1, l, 1); m.quaternion.setFromUnitVectors(Y, d.divideScalar(l || 1)); }
PL.setSeg = setSeg;

// ---------- haptics + VR wrist note ----------
PL.btn = [false, false]; PL.wristNote = t => wristNote(t);
PL.buzz = function (h, v, ms) {
  const s = MC.renderer.xr.getSession && MC.renderer.xr.getSession(); if (!s) return;
  const srcs = Array.from(s.inputSources).filter(x => x.gamepad);
  for (const src of srcs) { if (h && srcs.indexOf(src) !== h.i) continue; const a = src.gamepad.hapticActuators && src.gamepad.hapticActuators[0]; try { if (a && a.pulse) a.pulse(v, ms); } catch (e) {} }
};
function wristNote(force) {
  const G = MC.game, w = PL.wrist, text = force ? force : G.mode !== 'play' ? '' : PL.mantleReady() ? 'Let go: hop onto the ledge' : MC.events.state === 'seen' ? 'SEEN: stop moving!' : G.msgT > 0 ? G.msg : (G.tip || '');
  w.mesh.visible = !!text; if (!text) { w.mesh.userData.on = false; return; }
  if (text !== w.key) { w.key = text; const g = w.c.getContext('2d'); g.clearRect(0, 0, 512, 160); g.fillStyle = 'rgba(250,240,215,0.96)'; g.beginPath(); g.roundRect ? g.roundRect(4, 4, 504, 152, 18) : g.rect(4, 4, 504, 152); g.fill();
    g.fillStyle = '#3a2414'; g.textAlign = 'center'; let fs = 32, lines; do { g.font = '600 ' + fs + 'px sans-serif'; lines = []; let line = ''; for (const wd of text.split(' ')) { if (g.measureText(line + wd).width > 470 && line) { lines.push(line); line = ''; } line += wd + ' '; } lines.push(line); fs -= 2; } while (lines.length * (fs + 6) > 140 && fs > 14);
    const lh = fs + 6, y0 = 80 - (lines.length - 1) * lh / 2 + fs * 0.35; lines.forEach((l, k) => g.fillText(l.trim(), 256, y0 + k * lh)); w.tex.needsUpdate = true; }
  const where = MC.opt.captions || 'float';
  if (where === 'float') {   // a card floating ahead, low and a little to the left: it eases after your head only when you turn well away
    const yaw = Math.atan2(PL.fwdFull.x, PL.fwdFull.z); if (w.yaw == null || !w.mesh.userData.on) w.yaw = yaw;
    let d = yaw - w.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > 0.5) w.yaw += d * Math.min(1, 0.06);
    const s = MC.rig.scale.x, fx = Math.sin(w.yaw), fz = Math.cos(w.yaw), want = new V3(PL.head.x + fx * 1.0 * s + fz * 0.28 * s, PL.head.y - 0.42 * s, PL.head.z + fz * 1.0 * s - fx * 0.28 * s);
    if (!w.mesh.userData.on) w.mesh.position.copy(want); else w.mesh.position.lerp(want, 0.08); w.mesh.userData.on = true;
    w.mesh.scale.setScalar(s * 1.15); w.mesh.lookAt(PL.head); return;
  }
  w.mesh.userData.on = false; w.mesh.scale.setScalar(1);
  if (where === 'head') { w.mesh.position.copy(PL.head).addScaledVector(PL.fwdFull, 0.8).add(new V3(0, -0.28, 0)); w.mesh.quaternion.copy(MC.camera.getWorldQuaternion(new THREE.Quaternion())); return; }
  const paw = PL.hands[where === 'right' ? 1 : 0].paw.pos; w.mesh.position.copy(paw).add(new V3(0, 0.16, 0)); w.mesh.lookAt(PL.head);
}

// ---------- collision ----------
function collideHead() { // climbing: only the head is solid, so legs can swing over ledges
  let pushed = 0;
  for (const s of P.solids) {
    const h = headW(); if (h.y - 0.25 >= P.yTop(s) || h.y + 0.15 <= P.yBot(s)) continue;
    const pu = P.pushOut(s, h.x, h.z, RAD); if (!pu) continue; const mag = Math.hypot(pu[0], pu[1]);
    const k = mag > 0.15 && !s.playerOnly ? 0.15 / mag : 1;   // ease out of geometry over a few frames instead of a one-frame shove
    rig.position.x += pu[0] * k; rig.position.z += pu[1] * k;
    pushed += mag;
  }
  return pushed;
}
PL.turn = function (a) { const before = headW(); rig.rotation.y += a; PL.yaw = rig.rotation.y; rig.position.add(before.sub(headW())); };

// ---------- update ----------
let snapReady = true, stepT = 0;
PL.update = function (dt) {
  const xr = isXR(), prevPos = rig.position.clone();
  // view basis
  if (xr) {
    const xc = MC.renderer.xr.getCamera(camera), e = xc.matrixWorld.elements;
    PL.headLocal.set(e[12], e[13], e[14]).sub(rig.position).applyAxisAngle(Y, -rig.rotation.y).divideScalar(rig.scale.x);
    PL.fwdFull.set(-e[8], -e[9], -e[10]).normalize(); PL.fwdFlat.set(PL.fwdFull.x, 0, PL.fwdFull.z); if (PL.fwdFlat.lengthSq() < 1e-4) PL.fwdFlat.set(0, 0, -1); PL.fwdFlat.normalize(); PL.right.set(-PL.fwdFlat.z, 0, PL.fwdFlat.x);
  } else {
    const lk = 1.9 * dt; if (keys.ArrowLeft) PL.yaw += lk; if (keys.ArrowRight) PL.yaw -= lk; if (keys.ArrowUp) PL.pitch += lk; if (keys.ArrowDown) PL.pitch -= lk;
    if (!activeGrip() && !PL.zip) { PL.yaw -= I.lookX * 0.0023 * MC.opt.sens; PL.pitch -= I.lookY * 0.0023 * MC.opt.sens * (MC.opt.invertY ? -1 : 1); }
    I.lookX = I.lookY = 0; PL.pitch = clamp(PL.pitch, -1.5, 1.5);
    rig.rotation.y = PL.yaw; PL.fwdFlat.set(-Math.sin(PL.yaw), 0, -Math.cos(PL.yaw)); PL.right.set(Math.cos(PL.yaw), 0, -Math.sin(PL.yaw));
    PL.fwdFull.set(PL.fwdFlat.x * Math.cos(PL.pitch), Math.sin(PL.pitch), PL.fwdFlat.z * Math.cos(PL.pitch));
    PL.headLocal.set(0, EYE, 0);
  }
  // inputs
  let mx = I.mx, mz = I.mz, jump = I.jump; I.jump = false; PL.stickMove = 0;
  if (xr) {
    mx = mz = 0; const s = MC.renderer.xr.getSession();
    if (s) for (const src of s.inputSources) {
      if (!src.gamepad) continue; const ax = src.gamepad.axes, x = ax[2] || 0, y = ax[3] || 0;
      if (MC.opt.vrOneHand && src.handedness === 'right') { if (Math.abs(y) > 0.15) { mz = -y; PL.stickMove = 1; } if (Math.abs(x) > 0.6) { if (snapReady && canAct()) { PL.turn(-Math.sign(x) * Math.PI / 6); snapReady = false; } } else if (Math.abs(x) < 0.3) snapReady = true; if (src.gamepad.buttons[4] && src.gamepad.buttons[4].pressed && PL.grounded) jump = true; continue; }   // one-handed: the right stick walks and turns
      if (src.handedness === 'left') { if (Math.hypot(x, y) > 0.15) { mx = x; mz = -y; PL.stickMove = 1; } }
      else if (MC.opt.turn === 'smooth') { if (Math.abs(x) > 0.2 && canAct()) { PL.turn(-x * 2.4 * dt); PL.stickMove = 1; } }
      else if (Math.abs(x) > 0.6) { if (snapReady && canAct()) { PL.turn(-Math.sign(x) * ({ snap15: 15, snap45: 45 }[MC.opt.turn] || 30) * Math.PI / 180); snapReady = false; } } else if (Math.abs(x) < 0.3) snapReady = true;
      if (src.handedness === 'right' && src.gamepad.buttons[4] && src.gamepad.buttons[4].pressed && PL.grounded) jump = true;
    }
  } else { const K = MC.opt.keys; mx += (keys[K.right] ? 1 : 0) - (keys[K.left] ? 1 : 0); mz += (keys[K.fwd] ? 1 : 0) - (keys[K.back] ? 1 : 0); }
  const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  if (!canAct()) { mx = mz = 0; jump = false; PL.stickMove = 0; }
  if (xr) { const ses = MC.renderer.xr.getSession(), srcs = ses ? Array.from(ses.inputSources) : []; PL.time = (PL.time || 0) + dt;
    for (const h of PL.hands) { const src = srcs[h.i];   // getControllerGrip(i) follows inputSources[i] h.tracked = !!(src && src.hand);
      if (h.tracked) h.fp.copy(euro(h.f, h.obj.position, dt)); else { h.fp.copy(h.obj.position); h.f.on = false; }
      if (dt > 1e-4) { const p = MC.toWorld(h.fp); h.vel.lerp(p.clone().sub(h.prev).divideScalar(dt), 0.5); h.prev.copy(p); h.hist.push({ t: PL.time, p }); if (h.hist.length > 8) h.hist.shift(); } } }
  while (I.q.length) { const ev = I.q.shift(); if (ev.t === 'down') handDown(PL.hands[ev.h]); else if (ev.t === 'up') handUp(PL.hands[ev.h]); else if (ev.t === 'pack') PL.packKey(); }

  const gh = activeGrip();
  if (PL.zip) {
    const z = PL.zip, L = z.line, len = L.a.distanceTo(L.b), slope = (L.a.y - L.b.y) / len;
    z.speed = Math.min(9, z.speed + (2 + 16 * slope) * dt); if (slope < 0.03) z.speed = Math.max(0, z.speed - 6 * dt);
    if (PL.hands.some(h => h !== z.hand && (h.pressed > 0 || PL.btn[h.i]))) z.speed = Math.max(0.6, z.speed - 10 * dt);   // second paw on the line = brake
    z.s += z.speed * dt / len; const pt = L.a.clone().lerp(L.b, Math.min(1, z.s));
    if (xr) rig.position.add(pt.clone().sub(MC.toWorld(z.hand.fp))); else { z.off.multiplyScalar(Math.max(0, 1 - dt * 9)); rig.position.add(pt.clone().sub(new V3(0, 0.55, 0)).add(z.off).sub(headW())); }
    const bonk = collideHead(); PL.grounded = false; PL.peak = rig.position.y; PL.stickMove = 1;
    const zh = headW(), zg = groundAt(zh.x, zh.z, zh.y + 0.3)[0];
    if (rig.position.y <= zg) { rig.position.y = zg; endZip(false); PL.vel.y = 0; }   // feet touched down: step off the line
    else if (z.s >= 1 || bonk > 0.25 || z.speed <= 0.01) endZip(z.s >= 1);
  } else if (gh) {
    PL.grounded = false; let delta;
    if (xr) delta = gh.anchor.clone().sub(MC.toWorld(gh.fp));
    else {
      const cs = 0.006 * (MC.opt.climbSens || 1); gh.offset.addScaledVector(PL.right, I.pullX * cs); gh.offset.y -= I.pullY * cs;
      if (MC.opt.climbAssist && mz > 0) {   // hold forward: pull up, re-grab higher with the free paw, hop off the top
        gh.offset.y -= 1.7 * dt * mz; const hd = headW(), g = gh.grip;
        if (PL.mantleReady()) { for (const h of PL.hands) if (h.grip) PL.endGrip(h); return finish(dt, prevPos); }
        if (!g.lever && gh.offset.y < -0.85) { const h2 = PL.hands.find(h => h !== gh && !h.grip && !h.item), y2 = Math.min(g.max.y - 0.04, hd.y + 0.8); if (h2 && y2 > gh.anchor.y + 0.3) { PL.startGrip(h2, g, new V3(gh.anchor.x, y2, gh.anchor.z)); PL.endGrip(gh); } }
      } else gh.offset.addScaledVector(PL.fwdFlat, -mz * 1.6 * dt);
      if (gh.offset.length() > REACH) gh.offset.setLength(REACH);
      delta = gh.anchor.clone().sub(gh.offset).sub(headW());
    }
    rig.position.add(delta); collideHead();
    if (rig.position.y < 0) rig.position.y = 0;   // the counter itself is the lowest floor
    PL.peak = rig.position.y;
    if (!xr) { const hd = headW(); for (const h of PL.hands) if (h.grip) { h.offset.copy(h.anchor).sub(hd); if (h.offset.length() > REACH + 0.9) PL.endGrip(h); } }
    if (dt > 1e-4) PL.climbVel.lerp(rig.position.clone().sub(prevPos).divideScalar(dt), 0.35);
    PL.vel.set(0, 0, 0);
  } else {
    // walk
    const sticky = PL.groundSolid && PL.groundSolid.sticky, sp = 3.7 * (sticky ? 0.4 : 1), wx = (PL.fwdFlat.x * mz + PL.right.x * mx) * sp, wz = (PL.fwdFlat.z * mz + PL.right.z * mx) * sp;
    const acc = (PL.grounded ? (PL.slip ? 5 : 42) : 9) * dt, dvx = wx - PL.vel.x, dvz = wz - PL.vel.z, dl = Math.hypot(dvx, dvz);
    if (dl > 1e-6) { const k = Math.min(1, acc / dl); PL.vel.x += dvx * k; PL.vel.z += dvz * k; }
    if (jump && PL.grounded && !sticky) { PL.vel.y = 5.6; PL.grounded = false; S.hop(); }
    PL.vel.y -= (xr ? 12 : P.GRAV) * dt;
    rig.position.addScaledVector(PL.vel, dt);
    const feet = rig.position.y;
    for (const s of P.solids) {
      const h = headW(); if (P.yTop(s) <= feet + 0.36 || P.yBot(s) >= h.y) continue;
      const pu = P.pushOut(s, h.x, h.z, RAD); if (!pu) continue; rig.position.x += pu[0]; rig.position.z += pu[1];
      const l = Math.hypot(pu[0], pu[1]); if (l > 1e-6) { const nx = pu[0] / l, nz = pu[1] / l, vn = PL.vel.x * nx + PL.vel.z * nz; if (vn < 0) { PL.vel.x -= vn * nx; PL.vel.z -= vn * nz; } }
    }
    // ledge grace: while standing, you can lean or step ~0.28 m past an edge before you drop (peering over is free)
    const h = headW(), [g, gs] = groundAt(h.x, h.z, Math.max(h.y - 0.2, rig.position.y + 0.4), PL.grounded ? (xr ? 0.55 : 0.28) : 0);
    if (rig.position.y <= g) {
      if (!PL.grounded) {
        const drop = PL.peak - g, soft = gs && gs.soft;
        if (soft) { if (drop > 1.2) { PL.vel.y = Math.min(6, drop * 1.4); S.thunk(h, 0.3, 'soft'); rig.position.y = g; PL.peak = g; PL.groundSolid = gs; MC.emit('bounce'); PL.head.copy(headW()); finish(dt, prevPos); return; } }
        else if (drop > 3.6) { PL.daze = 1.6; S.land(h, 1); PL.buzz(null, 1, 160); MC.game.addNoise(14, h); MC.say('Oof — long fall. Dazed for a moment.', 2); MC.emit('daze'); }
        else if (drop > 0.9) S.land(h, 0.35);
      } else if (g - rig.position.y > 0.02) PL.camLift -= g - rig.position.y;
      rig.position.y = g; PL.vel.y = 0; PL.grounded = true; PL.peak = g; PL.groundSolid = gs;
    } else { if (PL.grounded && PL.vel.y <= 0 && rig.position.y - g < 0.37) { PL.camLift += rig.position.y - g; rig.position.y = g; PL.vel.y = 0; } else { PL.grounded = false; if (rig.position.y > PL.peak) PL.peak = rig.position.y; } }
    // safety net: the player can never end up under or off the counter
    const B0 = W.bounds; if (PL.grounded && rig.position.y >= 0) PL.safe.copy(rig.position);
    else if (rig.position.y < -0.6 || h.x < B0.x0 - 0.4 || h.x > B0.x1 + 0.6 || h.z > B0.z1 + 0.6 || h.z < B0.z0 - 0.3) { rig.position.copy(PL.safe); PL.vel.set(0, 0, 0); PL.peak = rig.position.y; PL.fade = 1; MC.emit('rescue'); }
    // footsteps
    const hs = Math.hypot(PL.vel.x, PL.vel.z);
    if (PL.grounded && hs > 0.8) { stepT -= dt * hs; PL.bobT += dt * hs; if (stepT <= 0) { stepT = 0.55; S.step(h, PL.slip ? 0.5 : 1); } }
  }
  finish(dt, prevPos);
};
function finish(dt, prevPos) {
  const xr = isXR(), gh = activeGrip();
  I.pullX = I.pullY = 0;
  if (PL.daze > 0) PL.daze -= dt;
  PL.head.copy(headW());
  if (dt > 1e-4) PL.speed = lerp(PL.speed, rig.position.distanceTo(prevPos) / dt, 0.3);
  // motion you did not make with your own arms: stick walking, falls, the lever, ziplines, being pushed
  const selfDriven = gh && !gh.grip.lever; PL.artSpeed = selfDriven ? 0 : PL.speed;
  // camera feel (desktop only): step smoothing + bob
  PL.camLift *= Math.max(0, 1 - dt * 12);
  if (!xr) { const bob = MC.opt.bob && PL.grounded ? Math.sin(PL.bobT * 3.4) * 0.018 * Math.min(1, Math.hypot(PL.vel.x, PL.vel.z) / 3) : 0; camera.position.set(0, EYE + PL.camLift + bob, 0); camera.rotation.set(PL.pitch, 0, 0); }
  const fall = PL.peak - rig.position.y, target = PL.daze > 0 ? 0.7 : (!PL.grounded && !gh && !PL.zip && fall > 1 ? Math.min(0.85, (fall - 1) / 2.2) : 0);
  PL.fade += (target - PL.fade) * Math.min(1, dt * 10);
  PL.fadeMesh.material.opacity = PL.fade; PL.fadeMesh.visible = PL.fade > 0.01;
  const lvl = MC.opt.vignette === false ? 0 : (MC.opt.vigLevel == null ? 2 : MC.opt.vigLevel), vt = lvl ? Math.max(PL.stickMove ? 0.75 : 0, clamp((PL.artSpeed - 0.8) / 4, 0, 1)) : 0;
  PL.vig.visible = xr && lvl > 0; PL.vig.scale.setScalar([1, 1.35, 1.05, 0.82][lvl]); PL.vig.material.opacity += (vt - PL.vig.material.opacity) * Math.min(1, dt * 8);
  if (xr) wristNote(); else PL.wrist.mesh.visible = false;
  const spot = MC.game.spot || 0; PL.red.material.opacity = spot * 0.5; PL.red.visible = spot > 0.02;
  // physical presence
  P.moveKin(P.bodyFeet, new V3(PL.head.x, rig.position.y + 0.3, PL.head.z), dt);
  // paws + held items
  const camPos = new V3().copy(PL.head); camPos.y += xr ? 0 : PL.camLift;
  const up = new V3().crossVectors(PL.right, PL.fwdFull).normalize();
  for (const h of PL.hands) {
    const pw = h.paw, tgt = new V3();
    if (xr) tgt.copy(MC.toWorld(h.fp));
    else if (h.grip) tgt.copy(h.anchor);
    else if (PL.zip && PL.zip.hand === h) tgt.copy(PL.zip.line.a).lerp(PL.zip.line.b, Math.min(1, PL.zip.s));
    else { const idle = h.item ? 0 : 0.06, sw = PL.grounded ? Math.sin(PL.bobT * 3.4 + (h.i ? Math.PI : 0)) * 0.03 * Math.min(1, Math.hypot(PL.vel.x, PL.vel.z) / 3) : 0; const walk = Math.min(1, Math.hypot(PL.vel.x, PL.vel.z) / 3); tgt.copy(camPos).addScaledVector(PL.fwdFull, 0.46 + sw - walk * 0.06).addScaledVector(PL.right, pw.side * (0.36 + walk * 0.04)).addScaledVector(up, -0.32 - idle - walk * 0.07); }   // resting paws sit in the bottom corners, lower still while walking
    if (xr) pw.pos.copy(tgt); else pw.pos.lerp(tgt, Math.min(1, dt * 22));
    pw.g.position.copy(pw.pos);
    if (xr) pw.g.quaternion.copy(h.obj.quaternion).premultiply(rig.quaternion); else { pw.g.quaternion.copy(camera.quaternion).premultiply(rig.quaternion); if (h.grip) pw.g.rotateX(0.9); }
    const sh = camPos.clone().addScaledVector(PL.right, pw.side * 0.3).addScaledVector(Y, -0.5).addScaledVector(PL.fwdFlat, 0.12);   // shoulders low and forward: short forearms from the screen corners, not batons up the middle
    setSeg(pw.arm, sh, pw.pos);
    const vis = MC.game.mode !== 'menu' && (xr || h.item || h.grip || (PL.zip && PL.zip.hand === h) || PL.pitch > -0.7);   // desktop: empty paws duck out of the way when you look down
    pw.g.visible = pw.arm.visible = !!vis;
    if (xr) P.moveKin(P.handBodies[h.i], pw.pos, dt); else P.moveKin(P.handBodies[h.i], { x: 0, y: -100 - h.i, z: 0 }, dt);
    if (h.item) {
      const it = h.item; it.pos.copy(pw.pos).addScaledVector(up, 0.1).addScaledVector(PL.fwdFull, 0.02); it.mesh.position.copy(it.pos); it.mesh.quaternion.copy(pw.g.quaternion);
      // VR: sweeping a held item through the blade cuts it
      if (xr && W.st.blade && MC.game.has('blade')) { const inZ = P.inBox(it.pos, W.st.blade.zone); if (inZ && !h.cutDone && C.canCut(it)) C.cut(it); h.cutDone = inZ; }
    }
  }
  if (PL.floss) { const hd = PL.hands.find(h => !h.item) || PL.hands[0]; PL.flossMesh.visible = true; setSeg(PL.flossMesh, PL.floss.head, hd.paw.pos); if (PL.floss.head.distanceTo(PL.head) > 60) PL.floss = null; }
}

// ---------- desktop input ----------
const canvas = MC.canvas;
PL.noLock = MC.params.has('nolock') || !canvas.requestPointerLock;
const locked = PL.locked = () => document.pointerLockElement === canvas;
PL.lockMouse = function () { if (PL.noLock) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { PL.noLock = true; } };
// paws: mouse buttons or keys; with "toggle grip" a press grabs and the next press lets go
const holding = h => !!(PL.hands[h].grip || (PL.zip && PL.zip.hand === PL.hands[h]));
function pawDown(h) { if (MC.opt.gripToggle && holding(h)) { I.q.push({ t: 'up', h }); PL.btn[h] = false; return; } PL.btn[h] = true; I.q.push({ t: 'down', h }); }
function pawUp(h) { PL.btn[h] = false; if (MC.opt.gripToggle && holding(h)) return; I.q.push({ t: 'up', h }); }
PL.pawDown = pawDown; PL.pawUp = pawUp;
addEventListener('keydown', e => {
  const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || MC.rebinding) return;   // let form fields type normally
  const K = MC.opt.keys;
  if (e.repeat) { if (e.code.startsWith('Arrow') || e.code === K.hop) e.preventDefault(); return; }
  keys[e.code] = true;
  if (e.code === K.pack) I.q.push({ t: 'pack' });
  if (e.code === K.hop) I.jump = true;
  if (MC.game.mode === 'play' && (e.code === K.pawL || e.code === K.pawR)) pawDown(e.code === K.pawL ? 0 : 1);
  MC.emit('key', e.code);
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; const K = MC.opt.keys; if (e.code === K.pawL || e.code === K.pawR) pawUp(e.code === K.pawL ? 0 : 1); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (!isXR()) for (const h of PL.hands) I.q.push({ t: 'up', h: h.i }); });
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', e => {
  MC.audio.init();
  if (MC.game.mode !== 'play') return;
  if (!PL.noLock && !locked()) { PL.lockMouse(); return; }
  const h = e.button === 0 ? 0 : e.button === 2 ? 1 : -1; if (h >= 0) pawDown(h);
});
addEventListener('mouseup', e => { if (e.target && e.target.tagName && e.target !== canvas && MC.game.mode !== 'play') return; const h = e.button === 0 ? 0 : e.button === 2 ? 1 : -1; if (h >= 0) pawUp(h); });
document.addEventListener('pointerlockerror', () => { if (!canvas.requestPointerLock) PL.noLock = true; else MC.say('Click the view to capture the mouse again.', 3); });
document.addEventListener('pointerlockchange', () => MC.emit('lock', locked()));
addEventListener('mousemove', e => {
  if (isXR()) return; const dx = e.movementX || 0, dy = e.movementY || 0;
  if (activeGrip()) { I.pullX += dx; I.pullY += dy; } else if (locked() || e.buttons === 4) { I.lookX += dx; I.lookY += dy; }
});
})();
