// Night events. The signature one: the midnight snacker — a giant human shuffles in, the light snaps on, a hand reaches past you.
'use strict';
(function () {
const { V3, Y, clamp, lerp, sstep, col } = MC, W = MC.world, P = MC.phys, S = MC.sfx, PL = MC.player;
const E = MC.events = { active: null, list: {}, shake: 0 };
// Storms and power cuts are background layers (E.bg) that can run alongside a watcher (E.active).
const BG = { storm: 1, outage: 1 };
E.start = function (type, o) {
  if (MC.game.mode !== 'play' || !E.list[type]) return false;
  if (BG[type]) { if (E.bg) return false; E.bg = { type, t: 0, ph: 0, pt: 0, o: o || {}, bg: true }; E.list[type].begin(E.bg); MC.emit('event', type); return true; }
  if (E.active) return false; E.active = { type, t: 0, ph: 0, pt: 0, o: o || {} }; E.list[type].begin(E.active); MC.emit('event', type); return true;
};
E.next = a => { a.ph++; a.pt = 0; };
E.finish = function (which) { const a = which && which.bg ? E.bg : E.active; if (!a) return; if (E.list[a.type].end) E.list[a.type].end(a); if (a === E.bg) E.bg = null; else E.active = null; };
E.reset = function () { E.mask = 0; if (E.active) E.finish(); if (E.bg) E.finish(E.bg); for (const k in E.list) if (E.list[k].reset) E.list[k].reset(); MC.game.hiding = false; MC.game.spot = 0; if (W.group) W.setLit(0); };
E.update = function (dt) {
  E.shake *= Math.max(0, 1 - dt * 5); if (E.mask > 0) E.mask -= dt; PL.rigY = MC.rig.position.y;
  E.danger = false;
  if (E.bg) { E.bg.t += dt; E.bg.pt += dt; E.list[E.bg.type].update(E.bg, dt); }
  const a = E.active; if (!a) { MC.game.spot = Math.max(0, MC.game.spot - dt); return; }
  a.t += dt; a.pt += dt; E.list[a.type].update(a, dt);
};
// Shared "freeze or hide" rule: you are only caught if the watcher has line of sight AND you are moving.
E.watch = function (eye, dt, o = {}) {
  const G = MC.game, head = PL.head, d = new V3().subVectors(head, eye), dist = d.length(); d.divideScalar(dist || 1);
  const hit = P.ray(eye, d, dist), seen = !(hit && hit.t < dist - 0.35) && (!o.cone || d.dot(o.cone.dir) > o.cone.cos), moving = PL.speed > 0.65;
  const flash = (W.flash || 0) > 0.3 && MC.opt.flash !== 'off' ? 2 : 1;   // a lightning flash lights you up: twice as easy to spot
  // frozen in the open, right in the middle of the watcher's gaze, you are slowly noticed anyway
  const centre = o.center && seen && !moving && d.dot(o.center) > 0.95 && dist < 22;
  if (centre) G.spot += dt * 0.32 * flash;
  else if (seen && moving) G.spot += dt * flash / ((o.grace || 0.9) / (G.cfg.spotMul || 1)); else G.spot = Math.max(0, G.spot - dt / (seen ? 7 : 0.8));   // suspicion fades slowly while you stay in view, fast once you are in cover
  E.state = !seen ? 'hidden' : moving ? 'seen' : centre ? 'stare' : 'frozen'; E.danger = true;
  if (seen && moving) { E.beat = (E.beat || 0) - dt; if (E.beat <= 0) { E.beat = lerp(0.6, 0.22, G.spot); S.heart(0.5 + G.spot * 0.5); } }
  if (G.spot >= 1) { G.spot = 0; return true; }
  return false;
};

// ---------- the human ----------
let H = null;
function seg(m, a, b) { const d = new V3().subVectors(b, a), l = d.length(); m.position.copy(a); m.scale.set(1, l, 1); m.quaternion.setFromUnitVectors(Y, d.divideScalar(l || 1)); }
function buildHuman() {
  const M = MC.M, g = new THREE.Group(), mk = (geo, mat, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; (parent || g).add(m); return m; };
  const stripes = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#5b6fa8'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#e9e4d6'; for (let i = 0; i < 64; i += 16) x.fillRect(i, 0, 5, 64); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const pj = new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.95 });
  const body = new THREE.Group(); g.add(body);
  const torso = mk(MC.rboxGeo(9, 12.5, 4.8, 1.6, 0.25), pj, body); torso.position.set(0, 4.3, 0);
  const hips = mk(MC.rboxGeo(8.6, 5, 4.6, 1.4, 0.25), pj, body); hips.position.set(0, -4, 0);
  for (const sd of [-1, 1]) { const leg = mk(new THREE.CylinderGeometry(1.9, 1.5, 13, 14), pj, body); leg.position.set(sd * 2.3, -12.5, 0); }
  const neck = mk(new THREE.CylinderGeometry(1.2, 1.4, 2, 14), M.skin, body); neck.position.set(0, 11.2, 0);
  const collar = mk(new THREE.TorusGeometry(1.75, 0.38, 10, 28), pj, body); collar.position.set(0, 10.4, 0); collar.rotation.x = Math.PI / 2; collar.scale.set(1.2, 1, 0.8);
  const head = new THREE.Group(); head.position.set(0, 14.4, 0); body.add(head);
  mk(new THREE.SphereGeometry(2.7, 28, 22), M.skin, head).scale.set(0.92, 1.05, 0.98);
  M.skin.emissive = col(0x4a1c10); M.skin.emissiveIntensity = 0.16; M.skin.roughness = 0.5;
  const hair = mk(new THREE.SphereGeometry(2.8, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hair, head); hair.position.set(0, 0.35, 0.25); hair.scale.set(0.97, 1, 1.02);
  MC.creature.init(); MC.creature.fur(hair, { len: 0.55, root: 0x2a1c14, tip: 0x6a4a34, layers: 10, repeat: 7, droop: 0.5 });   // bed head
  for (const sd of [-1, 1]) { const br = mk(MC.rboxGeo(1.0, 0.18, 0.25, 0.08), M.hair, head); br.position.set(sd * 0.95, 0.85, -2.3); br.rotation.z = sd * -0.15; }
  for (const sd of [-1, 1]) {
    const eye = mk(new THREE.SphereGeometry(0.42, 14, 10), M.flat(0xf4f1ea, 0.2), head); eye.position.set(sd * 0.95, 0.15, -2.33); eye.scale.set(1, 0.7, 0.5);
    const pup = mk(new THREE.SphereGeometry(0.2, 10, 8), M.flat(0x1c1410, 0.2), head); pup.position.set(sd * 0.95, 0.05, -2.56);
    const lid = mk(new THREE.SphereGeometry(0.46, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), M.skin, head); lid.position.set(sd * 0.95, 0.2, -2.3); lid.scale.set(1.05, 0.75, 0.6);
    mk(new THREE.SphereGeometry(0.7, 10, 8), M.skin, head).position.set(sd * 2.5, -0.1, 0.1);
    void pup;
  }
  const nose = mk(new THREE.SphereGeometry(0.42, 12, 10), M.skin, head); nose.position.set(0, -0.45, -2.75); nose.scale.set(0.9, 1.1, 1);
  const mouth = mk(MC.rboxGeo(1.1, 0.16, 0.2, 0.07), M.flat(0x8a4a44, 0.5), head); mouth.position.set(0, -1.45, -2.38);
  const arm = () => { const u = mk(new THREE.CylinderGeometry(1.0, 1.25, 1, 14), pj), f = mk(new THREE.CylinderGeometry(0.78, 1.0, 1, 14), pj), e = mk(new THREE.SphereGeometry(1.05, 12, 10), pj), sh = mk(new THREE.SphereGeometry(1.4, 12, 10), pj); u.geometry.translate(0, 0.5, 0); f.geometry.translate(0, 0.5, 0); return { u, f, e, sh }; };
  const hand = () => {
    const hg = new THREE.Group(); g.add(hg); const palm = mk(MC.rboxGeo(2.3, 0.7, 2.4, 0.3, 0.3), M.skin, hg); palm.position.z = 0.4; const cuff = mk(new THREE.CylinderGeometry(1.02, 1.02, 0.7, 18), pj, hg); cuff.rotation.x = Math.PI / 2; cuff.position.z = -0.75; cuff.scale.set(1, 1, 0.75); const fingers = [];
    for (let k = 0; k < 4; k++) { const fg = new THREE.Group(); fg.position.set(-0.86 + k * 0.57, 0, 1.55); hg.add(fg); const a = mk(new THREE.CylinderGeometry(0.25, 0.27, 1.05, 10), M.skin, fg); a.rotation.x = Math.PI / 2; a.position.z = 0.5; const f2 = new THREE.Group(); f2.position.z = 1.05; fg.add(f2); const b = mk(new THREE.CylinderGeometry(0.21, 0.25, 1.0 - Math.abs(k - 1.5) * 0.14, 10), M.skin, f2); b.rotation.x = Math.PI / 2; b.position.z = 0.45; mk(new THREE.SphereGeometry(0.21, 8, 6), M.skin, f2).position.z = 0.93 - Math.abs(k - 1.5) * 0.14; fingers.push([fg, f2]); }
    const th = new THREE.Group(); th.position.set(1.15, -0.05, 0.2); th.rotation.y = 0.9; hg.add(th); const t1 = mk(new THREE.CylinderGeometry(0.27, 0.3, 1.3, 10), M.skin, th); t1.rotation.x = Math.PI / 2; t1.position.z = 0.6;
    return { hg, fingers, th };
  };
  const torch = new THREE.SpotLight(col(0xe8f0ff), 0, 60, 0.42, 0.35, 1.2); torch.position.set(1.2, -1.0, -2.6); head.add(torch); torch.target.position.set(1.2, -10, -18); head.add(torch.target);
  const rim = new THREE.SpotLight(col(0xffc890), 0, 70, 0.7, 0.7, 1.4); rim.position.set(7, 22, 16); body.add(rim); rim.target = head;   // hallway light behind him: a rim-lit silhouette
  H = { torch, rim, g, body, head, R: arm(), L: arm(), hand: hand(), handL: hand(), x: 46, handPos: new V3(), handT: new V3(), curl: 0.25, bob: 0, look: 0, step: 0, carried: null };
  g.visible = false; MC.scene.add(g);
}
function poseHuman(dt) {
  H.rim.intensity = 2600 * (W.door ? W.door.material.opacity : 0) + 1200 * W.lit;
  const z = 11.3, bobY = Math.abs(Math.sin(H.step * Math.PI)) * 0.5;
  H.body.position.set(H.x, bobY, z); H.body.rotation.z = Math.sin(H.step * Math.PI) * 0.03;
  H.head.rotation.set(0.42, H.look, 0);
  const poseArm = (A, hd, sx, target, curl) => {
    const sh = new V3(H.x + sx * 4.9, 9.4 + bobY, z), L1 = 7.0, L2 = 6.6, d = new V3().subVectors(target, sh); let dl = d.length(); const mx = L1 + L2 - 0.05; if (dl > mx) { d.multiplyScalar(mx / dl); dl = mx; }
    const dir = d.clone().normalize(), a = (L1 * L1 - L2 * L2 + dl * dl) / (2 * dl), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const pole = new V3(sx * 0.7, 0.15, 0.7); pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    const el = sh.clone().addScaledVector(dir, a).addScaledVector(pole, hh), wr = sh.clone().add(d);
    A.sh.position.copy(sh); A.e.position.copy(el); seg(A.u, sh, el); seg(A.f, el, wr);
    const fd = new V3().subVectors(wr, el).normalize(); hd.hg.position.copy(wr).addScaledVector(fd, 0.2);
    const flat = new V3(fd.x, fd.y * 0.35, fd.z).normalize(); hd.hg.lookAt(hd.hg.position.clone().add(flat));
    for (const [f1, f2] of hd.fingers) { f1.rotation.x = curl * 0.9; f2.rotation.x = curl * 1.3; } hd.th.rotation.z = -curl * 0.6;
    return wr;
  };
  H.handPos.lerp(H.handT, Math.min(1, dt * 5));
  const wr = poseArm(H.R, H.hand, 1, H.handPos, H.curl); poseArm(H.L, H.handL, -1, new V3(H.x - 5.6, -2.5 + bobY, z + 0.6), 0.5);
  H.palm = wr;
  if (H.carried) { H.carried.group.position.copy(wr).add(new V3(0, -0.7, -1.2)); }
}
const restHand = () => new V3(H.x + 5.8, -2.6, 11.9);
E.list.snacker = {
  begin(a) {
    if (!H) buildHuman();
    a.cookie = a.o.investigate ? null : W.cookies.find(c => !c.taken) || null;
    a.standX = clamp(a.cookie ? a.cookie.pos.x - 4.9 : PL.head.x * 0.5, -11, 11);   // never inside the fridge or the range
    // woken by noise, he goes for whatever was making it: the loose food nearest the racket gets confiscated
    a.take = a.o.investigate && MC.game.lastNoisePos ? MC.cook.items.filter(i => i.state === 'free' && i.pos.distanceTo(MC.game.lastNoisePos) < 5).sort((x, y) => x.pos.distanceTo(MC.game.lastNoisePos) - y.pos.distanceTo(MC.game.lastNoisePos))[0] || null : null;
    if (a.take) a.standX = clamp(a.take.pos.x - 4.9, -11, 11);
    a.torch = !!(E.bg && E.bg.type === 'outage');   // in a power cut the big light will not come on: he brings a phone torch instead
    H.torch.intensity = 0;
    H.x = 46; H.g.visible = true; H.look = 0; H.curl = 0.3; H.carried = null; H.handT.copy(restHand()); H.handPos.copy(restHand()); a.stomp = 0; a.caught = false;
    MC.game.hiding = true; S.creak(new V3(61, 6, 30));
    MC.say(a.o.investigate ? 'You woke someone! Freeze or hide — do not move while they can see you.' : 'Footsteps… someone wants a midnight snack. Freeze or hide!', 6);
  },
  update(a, dt) {
    const G = MC.game, D = [3.2, 2.4, a.cookie ? 1.7 : 3.6, 0.5, 1.6, 1.0, 2.6][a.ph];
    const k = clamp(a.pt / D, 0, 1), e = sstep(0, 1, k);
    const stomp = (rate, vol) => { a.stomp -= dt; if (a.stomp <= 0) { a.stomp = rate; S.stomp(vol, new V3(H.x, -12, 11)); E.shake = Math.max(E.shake, vol * 0.05); H.step += 1; } };
    H.torch.intensity = a.torch && a.ph >= 1 && a.ph <= 5 ? 320 : 0;
    if (a.ph === 0) { W.door.material.opacity = e * (a.torch ? 0.25 : 0.9); stomp(0.75, 0.35 + k * 0.4); if (k >= 1) { S.switch(); if (a.torch) MC.say('The light switch clicks… nothing. He has a torch!', 3); else W.setLit(1); E.next(a); } }
    else if (a.ph === 1) { H.x = lerp(46, a.standX, e); stomp(0.6, 0.9); H.handT.copy(restHand()); if (k >= 1) E.next(a); }
    else if (a.ph === 2) {
      if (a.cookie) { H.handT.copy(a.cookie.pos).add(new V3(0, 1.4 - e * 0.6, 1.6)); H.curl = 0.15; H.look = -0.15; }
      else if (a.take && a.take.state === 'free') { H.handT.copy(a.take.pos).add(new V3(0, 1.4 - e * 0.9, 1.6)); H.curl = 0.15; H.look = Math.sin(a.pt * 1.6) * 0.4; }
      else { H.look = Math.sin(a.pt * 1.6) * 0.75; H.handT.set(H.x + 4.5, 2.2, 7.6); H.curl = 0.5; }
      if (k >= 1) E.next(a);
    }
    else if (a.ph === 3) { if (k >= 1 && a.take && a.take.state === 'free') { const nm = MC.cook.name(a.take); MC.cook.puff(a.take.pos); MC.cook.remove(a.take); a.take = null; MC.say('He swept up the ' + nm + ' that was making all that noise.', 4); }
      if (a.cookie) { H.curl = lerp(0.15, 0.95, e); if (k >= 1) { a.cookie.taken = true; H.carried = a.cookie; W.group.remove(a.cookie.group); MC.scene.add(a.cookie.group); S.thunk(a.cookie.pos, 0.5, 'soft'); } } if (k >= 1) E.next(a); }
    else if (a.ph === 4) { if (a.cookie) H.handT.set(H.x + 2.2, 11.5, 9.4); else H.handT.copy(restHand()); H.look = 0; if (k >= 1) { if (H.carried) { H.carried.group.visible = false; H.carried = null; MC.audio.noise(0.25, { f: 1200, q: 0.8, vol: 0.25, wet: 0.6 }); } E.next(a); } }
    else if (a.ph === 5) { H.handT.copy(restHand()); H.curl = 0.4; H.look = Math.sin(a.pt * 5) * 0.2; if (k >= 1) E.next(a); }
    else if (a.ph === 6) { H.x = lerp(a.standX, 46, e); stomp(0.6, 0.8); H.handT.copy(restHand()); if (k > 0.75 && W.litTarget) { S.switch(); W.setLit(0); } W.door.material.opacity = (1 - e) * 0.9; if (k >= 1) return E.finish(); }
    poseHuman(dt);
    // detection (only while the light is on)
    if (a.ph >= 1 && !a.caught && (W.litTarget || a.torch)) {
      H.g.updateMatrixWorld(true); const eye = new V3(H.x, 14.0, 9.2), look = H.head.getWorldDirection(new V3()).negate();
      // investigating, he searches with his eyes (a wide cone that follows his head); with a torch, only the narrow beam sees
      const cone = a.torch ? { dir: look, cos: 0.9 } : a.o.investigate ? { dir: look, cos: 0.45 } : null;
      const near = H.palm && a.ph >= 2 && a.ph <= 4 && H.palm.distanceTo(PL.head) < 1.9, byHand = near && PL.speed > 0.65;
      if (near && !byHand) { const pu = new V3().subVectors(PL.head, H.palm); pu.y = 0; if (pu.lengthSq() > 1e-6) MC.rig.position.addScaledVector(pu.normalize(), dt * 1.2); }   // a frozen mouse is brushed aside, not caught
      if (E.watch(eye, dt, cone ? { cone, center: look } : { center: look }) || byHand) { a.caught = true; G.caught(byHand ? 'The hand brushed right against you!' : 'The human saw a mouse!'); H.look = 0; a.ph = 5; a.pt = 0; if (H.carried) { H.carried.group.visible = false; H.carried = null; } }
    } else if (a.ph === 0) { E.state = 'coming'; }
  },
  end() { if (H) { H.g.visible = false; H.torch.intensity = 0; if (H.carried) { H.carried.group.visible = false; H.carried = null; } } W.setLit(0); W.door.material.opacity = 0; MC.game.hiding = false; MC.game.spot = 0; E.state = null; if (MC.game.mode === 'play') MC.say('Safe. Back to work.', 3); },
  reset() { if (H) H.g.visible = false; if (W.door) W.door.material.opacity = 0; E.state = null; },
};

// ---------- the cat ----------
let CAT = null, CAT_IRIS = null;
// the Polyfork cat: a whole black cat, sized so its head is as wide as the old close-up head; g's origin sits on its head
function buildCatPF() {
  const g = new THREE.Group(), pivot = new THREE.Group(), body = new THREE.Group(); g.add(pivot); pivot.add(body);
  const probe = MC.pf.build('cat', { len: 1 }), hw = probe.headBox.x * 2, P = MC.pf.build('cat', { len: 4.4 / hw,
    colors: { coat: '#24201d', belly: '#34302c', dark: '#100d0b', lid: '#1c1815', inner: '#5a3a38', nose: '#3a2624', eye: '#d8f060', pupil: '#0b0d06' }, glow: ['eye'], smooth: true,
    mat: { roughness: 0.75, clearcoat: 0, sheen: 1, sheenColor: col(0x6a6056), sheenRoughness: 0.5, envMapIntensity: 0.8 } });
  P.mat.userData.glow.value = 0.9; body.add(P.root); P.root.updateMatrixWorld(true);
  const hb = P.head, rest = P.headLocal.clone().applyMatrix4(hb.matrixWorld); P.root.position.sub(rest);   // head at the origin, body behind it
  const spot = new THREE.SpotLight(col(0xcfff7a), 0, 34, 0.5, 0.6, 1.2); spot.position.set(0, 0.3, -1.9); g.add(spot); g.add(spot.target);
  // fur over the whole body except the eyes and nose; the eyes' glow rides the head bone
  const S0 = window.PFDATA.cat, bare = new Set(S0.zones.map((z, i) => /eye|pupil|nose/.test(z[0]) ? i : -1));
  MC.pf.fur(P, { layers: 12, len: 0.22, root: 0x0f0d0b, tip: 0x3a342e, repeat: 7, droop: 0.25, skip: () => { const Z = MC.pf.zoneOf(P); return Z.map(z => bare.has(z) ? 1 : 0); } });
  for (const e of MC.pf.eyes(P)) { const sp = W.glow(e.x, e.y, e.z, 1.6 / P.scale, 0xcaff5a, hb); sp.material.opacity = 0.8; }
  const paws = [new THREE.Object3D(), new THREE.Object3D()], C = P.clips, idle = MC.pf.pick(C, 'idle'), walk = MC.pf.pick(C, 'walk'), run = MC.pf.pick(C, 'run');
  const pq = new THREE.Quaternion(), qq = new THREE.Quaternion(), ax = new V3(); let hy = 0, hp = 0;
  CAT = { g, spot, paws, yaw: 0, pf: P,
    tick(a, dt) {
      // body heading in g's frame: facing out of the head (-Z), or along the counter when it walks; it rears up on its hind legs at the front edge
      const walking = a.v === 2 && a.ph === 1, bodyYaw = a.v === 2 ? Math.PI / 2 - CAT.yaw : Math.PI, rear = a.v === 0 ? 0.75 : a.v === 1 ? 0.15 : 0;
      body.rotation.y = bodyYaw; pivot.rotation.x = rear;
      const lunge = a.ph === 2 ? Math.sin(clamp(a.pt / 0.8, 0, 1) * Math.PI) : 0; pivot.position.set(0, -lunge * 0.6, -lunge * 3);
      P.play(a.ph === 2 ? run : walking ? walk : idle, 0.3, walking ? 0.8 : 1); P.mixer.update(dt);
      // the head carries the gaze: turn it from the body's heading to g's -Z, and pitch it down to the look angle
      const ty = clamp(Math.PI - bodyYaw, -1.6, 1.6), tp = a.pitch - rear;
      hy += (ty - hy) * Math.min(1, dt * 5); hp += (tp - hp) * Math.min(1, dt * 5);
      hb.parent.updateWorldMatrix(true, false); hb.parent.getWorldQuaternion(pq); g.getWorldQuaternion(qq);
      const q = new THREE.Quaternion().setFromAxisAngle(ax.set(1, 0, 0).applyQuaternion(qq), hp * 0.8).multiply(new THREE.Quaternion().setFromAxisAngle(ax.set(0, 1, 0).applyQuaternion(qq), hy));   // turn first, then nod
      hb.quaternion.premultiply(pq).premultiply(q).premultiply(pq.invert());
    } };
  g.visible = false; MC.scene.add(g);
}
function buildCat() {
  if (MC.pf && MC.pf.has('cat') && MC.opt.pfBugs !== false) return buildCatPF();
  const g = new THREE.Group(), M = MC.M, fur = M.flat(0x2a2623, 0.95), mk = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; g.add(m); return m; };
  const S1 = new THREE.SphereGeometry(1, 24, 18);
  MC.creature.init(); const K = MC.creature, cf = { len: 0.28, root: 0x15120f, tip: 0x4a423a, layers: 12, repeat: 9, droop: 0.4 };
  K.fur(mk(S1, fur, 0, 0, 0, 2.3, 1.95, 2.0), cf); K.fur(mk(S1, fur, 0, -0.75, -1.5, 1.0, 0.7, 0.8), Object.assign({}, cf, { len: 0.16 })); mk(S1, M.pink, 0, -0.45, -2.2, 0.22, 0.15, 0.15);
  for (const sd of [-1, 1]) { const ch = mk(S1, fur, sd * 0.42, -0.95, -1.72, 0.55, 0.42, 0.45); K.fur(ch, Object.assign({}, cf, { len: 0.12 })); }
  for (const sd of [-1, 1]) {
    const ear = mk(new THREE.ConeGeometry(0.75, 1.5, 16), fur, sd * 1.45, 2.05, 0.1); ear.rotation.set(-0.15, 0, sd * -0.3); ear.scale.set(1, 1.3, 0.45);
    const inner = mk(new THREE.ConeGeometry(0.5, 1.1, 16), M.pink, sd * 1.43, 1.82, -0.12); inner.rotation.set(-0.15, 0, sd * -0.3); inner.scale.z = 0.25;
    const eye = mk(S1, K.eyeMat(0x0a0c08, false), sd * 0.95, 0.3, -1.72, 0.44, 0.38, 0.24); eye.castShadow = false;
    if (!CAT_IRIS) CAT_IRIS = new THREE.MeshBasicMaterial({ map: K.irisTex('#efff9a', '#8fbf2a', 0.16), fog: false, transparent: true });
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), CAT_IRIS); iris.position.set(sd * 0.95, 0.3, -1.97); iris.rotation.y = Math.PI; iris.scale.set(1, 0.86, 1); g.add(iris);
    mk(S1, new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), sd * 0.95 - sd * 0.12, 0.45, -2.0, 0.05, 0.05, 0.03).castShadow = false;
    W.glow(sd * 0.95, 0.3, -1.95, 2.2, 0xcaff5a, g);
    for (let k = 0; k < 3; k++) K.taper(g, new V3(sd * 0.5, -0.85 + k * 0.1, -2.05), new V3(sd * 1.5, -0.8 + k * 0.12, -2.1), new V3(sd * 2.6, -1.05 + k * 0.26, -1.85), 0.02, 0.003, M.white, 8);
  }
  // a tail curling up behind: the shape that makes a dark blob read as a cat from any angle
  const tail = K.tube(g, [new V3(0.6, -1.4, 1.6), new V3(1.6, -0.6, 2.6), new V3(2.4, 1.2, 2.5), new V3(2.2, 2.8, 1.8), new V3(1.6, 3.4, 1.4)], 0.32, fur, 32); K.fur(tail, Object.assign({}, cf, { len: 0.14, droop: 0.1 }));
  const paws = [-1, 1].map(sd => { const p = mk(S1, fur, sd * 2.6, -2.2, -1.2, 0.95, 0.6, 1.3); K.fur(p, Object.assign({}, cf, { len: 0.14 })); return p; });
  const spot = new THREE.SpotLight(col(0xcfff7a), 0, 34, 0.5, 0.6, 1.2); spot.position.set(0, 0.3, -1.9); g.add(spot); g.add(spot.target);
  CAT = { g, spot, paws, yaw: 0 }; g.visible = false; MC.scene.add(g);
}
E.list.cat = {
  // three ways the cat turns up, taken in turn: rising at the front edge, sitting on the window sill looking down, or padding along the front edge
  begin(a) {
    if (!CAT) { buildCat(); MC.emit('furAdded'); } a.v = (E.catN = (E.catN || 0) + 1) % 3; a.x = clamp(PL.head.x, -10, 10); a.caught = false;
    a.base = a.v === 1 ? new V3(2, 8.0, -5.2) : new V3(a.v === 2 ? -12 : a.x, 2.6, 8.3); a.yaw0 = a.v === 1 ? Math.PI : 0; a.pitch = a.v === 1 ? -0.95 : -0.16;   // from the sill it looks steeply down over the work area
    CAT.g.scale.setScalar(a.v === 1 ? 0.75 : 1); CAT.g.position.set(a.base.x, a.v === 1 ? 4 : -8, a.base.z); CAT.g.visible = true; CAT.yaw = a.yaw0; MC.game.hiding = true;
    S.meow(a.base); MC.audio.setLoop('purr', 0.16, 1.5); MC.audio.loopPos('purr', a.base);
    MC.say(a.v === 1 ? 'The cat is up on the window sill, watching the whole counter! Get behind something tall.' : a.v === 2 ? 'The cat is padding along the edge of the counter. Freeze when its eyes come your way.' : 'The cat is prowling! Freeze when its eyes sweep over you.', 6);
  },
  update(a, dt) {
    const D = [2.2, a.v === 2 ? 11 : 9, 0.8, 1.8][a.ph], k = clamp(a.pt / D, 0, 1), e = sstep(0, 1, k), c = CAT, y0 = a.v === 1 ? 4 : -8;
    if (a.ph === 0) { c.g.position.y = lerp(y0, a.base.y, e); if (k >= 1) E.next(a); }
    else if (a.ph === 1) {
      if (a.v === 2) { const walk = clamp((a.pt < 3 ? a.pt : a.pt < 5 ? 3 : a.pt < 8 ? a.pt - 2 : 6) / 6, 0, 1); c.g.position.x = lerp(-12, 12, walk); c.yaw = Math.sin(a.pt * 1.3) * 0.5; MC.audio.loopPos('purr', c.g.position); }   // two pauses on the way
      else c.yaw = a.yaw0 + Math.sin(a.pt * 0.9) * (a.v === 1 ? 0.75 : 0.95);
      c.g.position.y = a.base.y + Math.sin(a.pt * 1.7) * 0.12; if (k >= 1) { a.ph = 3; a.pt = 0; }
    }
    else if (a.ph === 2) { c.paws[1].position.z = -1.2 - Math.sin(k * Math.PI) * 5; c.paws[1].position.y = -2.2 + Math.sin(k * Math.PI) * 1.5; if (k >= 1) { a.ph = 3; a.pt = 0; } }
    else { c.g.position.y = lerp(a.base.y, y0, e); MC.audio.setLoop('purr', 0, 0.8); if (k >= 1) return E.finish(); }
    c.g.rotation.y = c.yaw; if (c.tick) c.tick(a, dt); const cp = Math.cos(a.pitch), dir = new V3(-Math.sin(c.yaw) * cp, Math.sin(a.pitch), -Math.cos(c.yaw) * cp).normalize();
    c.spot.intensity = a.ph === 1 || a.ph === 2 ? 140 : 0; c.spot.target.position.set(0, Math.tan(a.pitch) * 12 - 0.3, -12);   // target lives in the cat's local frame
    if (a.ph === 1 && !a.caught) { const eye = new V3(c.g.position.x + dir.x * 1.9, c.g.position.y + 0.3, c.g.position.z + dir.z * 1.9); if (E.watch(eye, dt, { cone: { dir, cos: 0.84 }, center: dir, grace: 0.8 })) { a.caught = true; a.ph = 2; a.pt = 0; MC.game.caught('The cat pounced!'); S.meow(); } }
    else if (a.ph === 0) E.state = 'coming';
  },
  end() { if (CAT) CAT.g.visible = false; MC.audio.setLoop('purr', 0, 0.5); MC.game.hiding = false; MC.game.spot = 0; E.state = null; if (MC.game.mode === 'play') MC.say('The cat got bored. Back to work.', 3); },
  reset() { if (CAT) { CAT.g.visible = false; CAT.g.scale.setScalar(1); } MC.audio.setLoop('purr', 0, 0.2); },
};

// ---------- power outage ----------
E.list.outage = {
  begin(a) { W.power = 0; W.clockDead = true; MC.cook.noPower = true; MC.audio.setLoop('hum', 0, 0.3); S.switch(); MC.say('Power cut! The toaster is dead — toast crumbs in the pan until it comes back.', 6); },
  update(a, dt) { if (a.t > 34) { W.power = Math.random() < 0.5 ? 1 : 0.2; } if (a.t > 36) E.finish(a); },
  end() { W.power = 1; W.clockDead = false; MC.cook.noPower = false; MC.audio.setLoop('hum', 0.05, 1); if (MC.game.mode === 'play') MC.say('The power is back.', 3); },
  reset() { if (W.group) { W.power = 1; W.clockDead = false; } MC.cook.noPower = false; },
};

// ---------- thunderstorm: thunder covers your noise ----------
E.list.storm = {
  begin(a) { a.next = 2.5; a.thunder = -1; MC.audio.setLoop('rain', 0.09, 2); MC.say('A storm rolls in. Thunder covers your noise — save the loud jobs for the rumble.', 6); },
  update(a, dt) {
    a.next -= dt; if (a.next <= 0 && a.t < 38) { a.next = 4 + Math.random() * 5; W.flash = 1; a.thunder = 0.35 + Math.random() * 0.9; }
    if (a.thunder >= 0) { a.thunder -= dt; if (a.thunder < 0) { S.thunder(); E.mask = 2.8; E.shake = Math.max(E.shake, 0.03); MC.emit('thunder'); } }
    if (a.t > 44) E.finish(a);
  },
  end() { MC.audio.setLoop('rain', PL.slip ? 0.06 : 0, 3); W.flash = 0; },
  reset() { MC.audio.setLoop('rain', 0, 0.5); if (W.group) W.flash = 0; E.mask = 0; },
};

// ---------- buzzing phone ----------
E.list.phone = {
  begin(a) { const ph = W.st.phone; if (!ph) return (a.skip = true); MC.say('The phone is buzzing! Stand on it to muffle the racket.', 6); },
  update(a, dt) {
    if (a.skip) return E.finish(); const ph = W.st.phone, cyc = a.t % 3.4, on = cyc < 2.1 && a.t < 12;
    ph.scr.material.color.setRGB(on ? 0.75 : 0.02, on ? 0.86 : 0.03, on ? 1 : 0.04); ph.light.intensity = on ? 16 + Math.sin(a.t * 30) * 3 : 0; MC.audio.loopPos('buzz', ph.pos); MC.audio.setLoop('buzz', on ? 0.06 : 0, 0.05);
    if (on) {
      const muffled = P.inBox(PL.head, ph.box) || PL.groundSolid === ph.solid; MC.game.addNoise((muffled ? 1.5 : 10) * dt, ph.pos, { steady: true }); a.muffled = muffled; MC.audio.setBuzzMuffle(muffled);
      for (const it of MC.cook.items) if (it.state === 'free' && it.pos.distanceTo(ph.pos) < 3.2 && Math.random() < dt * 8) { it.body.wakeUp(); it.body.velocity.x += (Math.random() - 0.5) * 0.9; it.body.velocity.z += (Math.random() - 0.5) * 0.9; it.body.velocity.y += 0.6; it.quietT = 0.6; }
    }
    if (a.t > 12.5) E.finish();
  },
  end() { const ph = W.st.phone; if (ph) { ph.scr.material.color.setRGB(0.02, 0.03, 0.04); ph.light.intensity = 0; } MC.audio.setLoop('buzz', 0, 0.05); },
  reset() { MC.audio.setLoop('buzz', 0, 0.05); },
};

// ---------- ant raid ----------
function makeAnt() {
  const g = new THREE.Group(), m = MC.M.flat(0x1a0f0a, 0.4), S1 = new THREE.SphereGeometry(1, 10, 8);
  for (const [z, r] of [[-0.2, 0.09], [0, 0.07], [0.24, 0.13]]) { const s = new THREE.Mesh(S1, m); s.position.set(0, 0.13, z); s.scale.set(r, r * 0.9, r * 1.3); s.castShadow = true; g.add(s); }
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.26, 4), m); l.position.set((i % 2 ? 1 : -1) * 0.1, 0.08, -0.1 + Math.floor(i / 2) * 0.1); l.rotation.z = (i % 2 ? -1 : 1) * 0.9; g.add(l); }
  return g;
}
E.list.ants = {
  begin(a) { a.ants = []; const hole = W.st.diner.hole; for (let i = 0; i < 4; i++) { const g = makeAnt(); g.position.set(hole.x + (i - 1.5) * 0.25, 0, hole.z + 0.6); g.visible = false; W.group.add(g); a.ants.push({ g, wait: i * 1.5, state: 'seek', it: null, path: null, pi: 0, fear: 0, re: 0 }); } MC.say('Ants! They will carry off loose food — walk up to them to shoo them away.', 6); S.skit(hole); MC.audio.setLoop('skitter', 0.05, 0.5); },
  update(a, dt) {
    const C = MC.cook, hole = W.st.diner.hole, home = new V3(hole.x, 0, hole.z + 0.9), over = a.t > 30; let alive = 0;
    for (const n of a.ants) {
      if (n.done) continue; alive++; if (n.wait > 0) { n.wait -= dt; continue; } n.g.visible = true; const p = n.g.position; if (!isFinite(p.x + p.z)) p.set(home.x, 0, home.z);
      const goto = (t, sp) => { n.re -= dt; if (!n.path || n.re <= 0) { const r = P.path(p.x, p.z, t.x, t.z); n.path = r ? r.pts.concat([[t.x, t.z]]) : [[t.x, t.z]]; n.pi = 0; n.re = 1.5; }
        const w = n.path[Math.min(n.pi, n.path.length - 1)], dx = w[0] - p.x, dz = w[1] - p.z, d = Math.hypot(dx, dz); if (!(d >= 0.2)) { n.pi++; return n.pi >= n.path.length; } p.x += dx / d * sp * dt; p.z += dz / d * sp * dt; n.g.rotation.y = Math.atan2(dx, dz) + Math.PI; p.y = Math.abs(Math.sin(a.t * 30 + p.x)) * 0.02; return false; };
      const near = Math.hypot(PL.head.x - p.x, PL.head.z - p.z) < 1.5 && PL.rigY < 1.5;
      if (near && n.state !== 'flee') { if (n.it) { C.free(n.it, new V3(p.x, 0.3, p.z)); n.it.quietT = 1; n.it = null; S.pick(p); } n.state = 'flee'; n.fear = 3.5; n.path = null; S.skit(p); }
      if (n.state === 'flee') { n.fear -= dt; if (goto(home, 4.5) || n.fear <= 0) { if (over) { n.done = true; n.g.visible = false; } else if (n.fear <= 0) { n.state = 'seek'; n.path = null; } } }
      else if (n.state === 'seek') {
        if (over) { n.state = 'flee'; n.fear = 99; n.path = null; continue; }
        if (!n.it || n.it.state !== 'free') { n.it = C.items.filter(i => i.state === 'free' && i.pos.y < 0.6 && i.body.sleeping && !a.ants.some(o => o !== n && o.it === i)).sort((x, y) => x.pos.distanceTo(p) - y.pos.distanceTo(p))[0] || null; n.path = null; }
        if (!n.it) { goto(new V3(home.x + Math.sin(a.t + p.x) * 3, 0, home.z + 2 + Math.cos(a.t * 0.7) * 1.5), 1.6); continue; }
        if (goto(n.it.pos, 1.9) || Math.hypot(n.it.pos.x - p.x, n.it.pos.z - p.z) < 0.35) { C.hold(n.it, 'ant'); n.state = 'carry'; n.path = null; }
      } else if (n.state === 'carry') {
        if (!n.it || n.it.state !== 'ant') { n.state = 'seek'; n.it = null; continue; }
        n.it.pos.set(p.x, 0.38, p.z); n.it.mesh.position.copy(n.it.pos);
        if (goto(home, 1.25)) { MC.say('An ant made off with a ' + C.name(n.it) + '!', 3); C.remove(n.it); n.it = null; n.done = true; n.g.visible = false; MC.emit('stolen'); }   // one prize each, then home
      }
    }
    { const live = a.ants.find(n => !n.done && n.g.visible); if (live) MC.audio.loopPos('skitter', live.g.position); }
    if (!alive) E.finish();
  },
  end(a) { MC.audio.setLoop('skitter', 0, 0.4); for (const n of a.ants) { if (n.it && n.it.state === 'ant') MC.cook.free(n.it, new V3(n.g.position.x, 0.3, n.g.position.z)); W.group.remove(n.g); } },
};
E.human = () => H;
})();
