// EYES DOWN's visitors: black wet slime that takes whatever shape the place it waits in needs, with pale eyes; they move only when you are not looking, they test you, and if you meet their eyes they hunt
import { THREE, LOW, scene, renderer, camera, P, clamp, lerp, rnd, pick, clear, CLOCK } from './core.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { ROOM, H } from './room.js';

const THEM = { list: [], drips: null, puddles: [], onEvent: null, contactCone: 4.5 * Math.PI / 180 };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const _a = V(), _b = V(), _c = V(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const slime = () => new THREE.MeshPhysicalMaterial({ color: 0x040405, roughness: .1, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, iridescence: .35, iridescenceIOR: 1.6, envMapIntensity: 1.3, specularIntensity: 1 });
const SCLERA = new THREE.MeshStandardMaterial({ color: 0xe9e4c4, roughness: .25, emissive: 0xd8d2a8, emissiveIntensity: .22 }), PUPIL = new THREE.MeshStandardMaterial({ color: 0x050403, roughness: .1 });
const EYE_G = new THREE.SphereGeometry(1, 18, 12), PUP_G = new THREE.SphereGeometry(1, 12, 8);
const KINDS = ['tall', 'thin', 'wide', 'many', 'small', 'tall'];
// the box each shape is drawn in: half its size and the height of its middle
const FIT = { stand: [1.18, 1.13], sit: [.72, .64], crouch: [.5, .45], hang: [.72, H - .66], cling: [.75, .88], under: [.55, .2], ceiling: [.8, H - .3], face: [.42, -.12] };

/* a body: balls of slime placed by pose, merged into one surface by marching cubes */
function make(id, kind) {
  const S = 1, res = LOW ? 30 : 44;
  const mc = new MarchingCubes(res, slime(), false, false, 22000); mc.isolation = 80; mc.castShadow = true; mc.receiveShadow = true; mc.frustumCulled = false;
  const root = new THREE.Group(); root.add(mc); root.visible = false; scene.add(root);
  const nEyes = kind === 'many' ? 6 : kind === 'wide' ? 4 : pick([2, 2, 3]), eyes = [];
  for (let i = 0; i < nEyes; i++) { const e = new THREE.Group(), w = new THREE.Mesh(EYE_G, SCLERA), p = new THREE.Mesh(PUP_G, PUPIL); const r = kind === 'small' ? .02 : rnd(.022, .03); w.scale.setScalar(r); p.scale.set(r * .55, r * .55, r * .3); p.position.z = r * .82; e.add(w, p); e.userData = { r, p, w, wide: 1 }; root.add(e); eyes.push(e); }
  const C = { id, kind, S, mc, root, eyes, pos: V(-50, 0, 0), yaw: 0, spot: null, pose: 'stand', state: 'away', sus: 0, contact: 0, noticed: false, seen: false, seenT: 0, stare: 0, flinchT: -9, lastSeen: -9, upd: 0, t: rnd(100),
    test: null, testT: 0, want: null, wantTest: null, line: '', hideMem: null, huntT: 0, cool: 0, glances: 0, stareSec: 0, flinches: 0, backs: 0, eyeW: [], vis: 0, approach: null, drip: rnd(1) };
  THEM.list.push(C); return C;
}

// the shapes: every ball is [x, y, z, radius] in metres from the feet, facing +z; t is its own time for breathing and twitching
function shape(C, t) {
  const B = [], add = (x, y, z, r) => B.push([x, y, z, r]), br = Math.sin(t * 1.3) * .012, tw = Math.sin(t * 7.1) * Math.sin(t * 2.3) > .97 ? .04 : 0, k = C.kind;
  const chain = (a, b, n, r0, r1) => { n = Math.max(n, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / (Math.min(r0, r1) * .8))); for (let i = 0; i <= n; i++) { const f = i / n; add(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f), lerp(r0, r1, f)); } };
  const tallH = k === 'thin' ? 2.35 : k === 'wide' ? 1.85 : 2.15, wd = k === 'wide' ? 1.5 : k === 'thin' ? .8 : 1, head = [];
  switch (C.pose) {
    case 'stand': {   // too tall, too thin, its head hung forward on a long neck, arms to its knees
      const hip = tallH * .48, sh = tallH * .8; chain([-.1 * wd, .05, 0], [-.09 * wd, hip, 0], 6, .06, .08); chain([.1 * wd, .05, 0], [.09 * wd, hip, 0], 6, .06, .08);
      chain([0, hip, 0], [0, sh, .03], 5, .15 * wd + br, .13 * wd + br); add(0, hip + .1, 0, .16 * wd);
      const hx = Math.sin(t * .4) * .03 + tw, hd = [hx, sh + .2, .14]; chain([0, sh, .03], hd, 3, .06, .055); add(hd[0], hd[1], hd[2], .11); head.push(hd);
      for (const s of [-1, 1]) { const swing = Math.sin(t * .6 + s) * .04; chain([s * .2 * wd, sh - .02, 0], [s * .26 * wd, hip - .05, .06 + swing], 5, .05, .045); chain([s * .26 * wd, hip - .05, .06 + swing], [s * .24 * wd, hip - .45, .14 + swing], 4, .045, .035); }
      add(0, .03, 0, .2); break; }
    case 'sit': {   // sitting as you sit, a little too upright, turned toward you
      const seat = .45; chain([-.1, seat, 0], [-.11, seat, .4], 4, .07, .06); chain([.1, seat, 0], [.11, seat, .4], 4, .07, .06); chain([-.11, seat, .4], [-.11, .05, .45], 4, .055, .05); chain([.11, seat, .4], [.11, .05, .45], 4, .055, .05);
      chain([0, seat, -.05], [0, seat + .55, -.02], 5, .14 + br, .12 + br); const hd = [Math.sin(t * .3) * .02 + tw, seat + .78, .02]; chain([0, seat + .55, -.02], hd, 2, .06, .06); add(hd[0], hd[1], hd[2], .1); head.push(hd);
      for (const s of [-1, 1]) chain([s * .18, seat + .5, -.02], [s * .17, seat + .1, .28], 6, .045, .04); break; }
    case 'crouch': {   // folded small into the space it is in
      add(0, .32 + br, 0, .2); add(0, .5, .02, .17); add(0, .2, .1, .18); const hd = [0, .72, .1 + tw]; add(hd[0], hd[1], hd[2], .1); head.push(hd); chain([-.15, .1, .2], [-.18, .42, .22], 3, .05, .04); chain([.15, .1, .2], [.18, .42, .22], 3, .05, .04); break; }
    case 'hang': {   // from the ceiling, upside down, its face at the height of yours
      const top = H; chain([0, top, 0], [0, 1.95, 0], 5, .09, .08); add(0, 1.85 + br, 0, .15); const hd = [tw, 1.62, .04]; chain([0, 1.85, 0], hd, 2, .07, .07); add(hd[0], hd[1], hd[2], .11); head.push(hd);
      for (const s of [-1, 1]) chain([s * .16, 1.9, 0], [s * .2 + Math.sin(t * .5 + s) * .05, 1.3, .05], 6, .045, .03); break; }
    case 'cling': {   // spread flat on the glass
      add(0, .7 + br, 0, .2); add(0, 1.0, 0, .18); const hd = [0, 1.28, .05 + tw]; add(hd[0], hd[1], hd[2], .12); head.push(hd);
      for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) chain([sx * .12, .85 + sy * .15, 0], [sx * .55, .85 + sy * .55 + Math.sin(t * .7 + sx) * .03, .02], 6, .05, .035); break; }
    case 'under': {   // a pool under the bed, rising at one end
      for (let i = 0; i < 6; i++) add(Math.cos(i) * .3, .06, Math.sin(i * 1.7) * .3, .14); add(0, .14 + br, .2, .14); const hd = [0, .18, .38]; add(hd[0], hd[1], hd[2], .09); head.push(hd); chain([.1, .05, .3], [.2, .03, .75], 5, .04, .03); break; }
    case 'ceiling': {   // flat on the ceiling like a stain with limbs
      for (let i = 0; i < 5; i++) add(Math.cos(i * 1.3) * .25, H - .1, Math.sin(i * 1.3) * .25, .15); const hd = [0, H - .3 + br, .15]; add(hd[0], hd[1], hd[2], .11); head.push(hd);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; chain([Math.cos(a) * .2, H - .08, Math.sin(a) * .2], [Math.cos(a) * .7, H - .05, Math.sin(a) * .7], 5, .045, .03); } break; }
    case 'face': {   // close: just its head and shoulders in front of yours
      add(0, -.35, -.1, .2); add(0, -.15, -.05, .12); const hd = [tw, 0, 0]; add(hd[0], hd[1], hd[2], .12); head.push(hd); break; }
  }
  return { B, head };
}

// where its eyes sit on its head; 'many' has them scattered down its front too
function eyeSpots(C, head) { const out = [], h = head[0], n = C.eyes.length, r = C.pose === 'face' ? .12 : C.pose === 'under' ? .09 : .11;
  for (let i = 0; i < n; i++) { if (i < 2 || C.kind !== 'many') { const sx = n === 1 ? 0 : (i % 2 ? 1 : -1) * (i < 2 ? .045 : .07), sy = i < 2 ? .015 : -.035; out.push([h[0] + sx, h[1] + sy, h[2] + r * .88]); } else out.push([h[0] + rnd(-.1, .1) * 0 + (i % 2 ? .08 : -.08), h[1] - .1 - (i - 2) * .12, h[2] + .06]); }
  return out; }

/* drips: drops fall off them and leave black spots that dry slowly */
function initDrips() {
  const N = 60, I = new THREE.InstancedMesh(new THREE.SphereGeometry(.012, 8, 6), slime(), N); I.frustumCulled = false; I.castShadow = false; scene.add(I);
  const d = []; for (let i = 0; i < N; i++) { d.push({ p: V(0, -9, 0), v: 0, live: false }); I.setMatrixAt(i, _m.makeTranslation(0, -9, 0)); } THEM.drips = { I, d };
  const PN = 40, pg = new THREE.CircleGeometry(1, 16); pg.rotateX(-Math.PI / 2); const pm = new THREE.MeshPhysicalMaterial({ color: 0x030304, roughness: .05, clearcoat: 1, transparent: true, opacity: .9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const PI = new THREE.InstancedMesh(pg, pm, PN); PI.frustumCulled = false; PI.receiveShadow = true; scene.add(PI); THEM.pud = { I: PI, list: [], n: 0 }; for (let i = 0; i < PN; i++) PI.setMatrixAt(i, _m.makeScale(0, 0, 0));
}
function drip(x, y, z) { const D = THEM.drips.d.find(d => !d.live); if (!D) return; D.live = true; D.p.set(x, y, z); D.v = 0; }
function puddle(x, y, z, r) { const P_ = THEM.pud, i = P_.n++ % P_.I.count; P_.list[i] = { x, y, z, r, t: 0 }; }
function floorAt(x, z) { if (x > 2.75 && x < 4.3 && z > 3 && z < 4.8) return .013; return 0; }

function build() { for (let i = 0; i < 6; i++) make(i, KINDS[i]); initDrips(); }

/* put one at a spot, in that spot's shape */
function setSpot(C, id) {
  const S = ROOM.spots[id]; if (!S) return false; if (THEM.list.some(o => o !== C && o.spot === id && o.state !== 'away')) return false;
  C.spot = id; C.pose = S.pose; C.pos.copy(S.pos); C.yaw = S.yaw; C.state = 'wait'; C.root.visible = true; C.since = CLOCK.t; C.flinchT = -9; C.upd = 0; render(C, 0, true);
  if (S.pose === 'stand' || S.pose === 'sit') puddle(C.pos.x, floorAt(C.pos.x, C.pos.z) + .002, C.pos.z, rnd(.18, .32));
  return true;
}
function away(C) { C.state = 'away'; C.spot = null; C.root.visible = false; C.test = null; C.approach = null; }

// redraw the surface; far or unseen ones less often
function render(C, dt, force) {
  C.t += dt; const fast = C.vis > 0 || C.state === 'hunt' || C.test === 'approach'; C.upd -= dt; if (!force && C.upd > 0) return; C.upd = fast ? 1 / 30 : 1 / 6;
  const { B, head } = shape(C, C.t), mc = C.mc, F = FIT[C.pose] || FIT.stand, S = F[0] * (C.kind === 'small' && C.pose === 'stand' ? .8 : 1), cy = F[1];
  mc.scale.setScalar(S); mc.position.set(0, cy, 0); mc.reset();
  for (const [x, y, z, r] of B) { const n = r / (2 * S); mc.addBall(x / (2 * S) + .5, (y - cy) / (2 * S) + .5, z / (2 * S) + .5, 140 * n * n, 60); }
  mc.update();
  const es = eyeSpots(C, head); C.eyes.forEach((e, i) => e.position.set(es[i][0], es[i][1], es[i][2]));
  C.root.position.copy(C.pos); C.root.rotation.y = C.yaw;
  // a drop now and then
  C.drip -= dt * (fast ? 1 : 0); if (C.drip < 0 && C.root.visible) { C.drip = rnd(.5, 2.5); const b = pick(B); _a.set(b[0], b[1] - b[3], b[2]).applyAxisAngle(_b.set(0, 1, 0), C.yaw).add(C.pos); if (_a.y > .15) drip(_a.x, _a.y, _a.z); }
}

/* the core rule: are you looking into its eyes */
const head = V(), gaze = V(), toE = V(), mir = V();
function eyesWorld(C, out) { out.length = 0; for (const e of C.eyes) { e.getWorldPosition(_a); out.push(_a.clone()); } return out; }
// a point you are looking at directly: within the cone, nearer than 12 m, nothing in the way
function looked(p, cone) { toE.subVectors(p, head); const d = toE.length(); if (d > 12) return 99; toE.divideScalar(d); const ang = Math.acos(clamp(toE.dot(gaze), -1, 1)); if (ang > cone) return ang; if (!clear(head, p, .14)) return 99; return ang; }
function inView(p, half = .62) { toE.subVectors(p, head); const d = toE.length(); toE.divideScalar(d); return Math.acos(clamp(toE.dot(gaze), -1, 1)) < half && clear(head, p, .2); }
// seen in the bathroom mirror: the point mirrored through the glass, and the line to it passing through the glass
function inMirror(p) { const M = ROOM.mirror; if (!M || !M.rf.visible) return null; if (head.z < M.c.z || p.z < M.c.z) return null; mir.copy(p); mir.z = 2 * M.c.z - p.z;
  toE.subVectors(mir, head); const t = (M.c.z - head.z) / toE.z; if (!(t > 0 && t < 1)) return null; const hx = head.x + toE.x * t, hy = head.y + toE.y * t; if (Math.abs(hx - M.c.x) > M.w / 2 || Math.abs(hy - M.c.y) > M.h / 2) return null; return mir; }

const EW = [];
function update(dt, me) {
  camera.getWorldPosition(head); camera.getWorldDirection(gaze); const eyesShut = me.eyesShut, cone = THEM.contactCone * (renderer.xr.isPresenting ? 1.35 : 1);
  for (const C of THEM.list) {
    if (C.state === 'away') { C.vis = 0; C.contact = Math.max(0, C.contact - dt * 3); continue; }
    render(C, dt);
    // eyes follow your head
    for (const e of C.eyes) { e.getWorldPosition(_a); _c.copy(head); e.parent.worldToLocal(_c); e.lookAt(_c); const W = e.userData; W.wide = lerp(W.wide, C.noticed || C.state === 'hunt' ? 1.45 : 1, dt * 8); W.w.scale.setScalar(W.r * W.wide); W.p.scale.set(W.r * .55 / W.wide, W.r * .55 / W.wide, W.r * .3); W.p.position.z = W.r * W.wide * .82; }
    eyesWorld(C, EW); C.root.getWorldPosition(_b); _b.y += C.pose === 'hang' ? 1.7 : C.pose === 'ceiling' ? H - .2 : C.pose === 'under' ? .15 : C.pose === 'face' ? 0 : 1.1;
    const was = C.vis; C.vis = eyesShut ? 0 : (inView(_b) || EW.some(p => inView(p))) ? 1 : 0;
    if (C.vis && !was) { C.seenT = CLOCK.t; C.glances++; THEM.onEvent && THEM.onEvent('seen', C); }
    if (C.vis) C.lastSeen = CLOCK.t;
    // the eyes: straight at one of them, or at its reflection
    let best = 99; if (!eyesShut) for (const p of EW) { best = Math.min(best, looked(p, cone)); const m = inMirror(p); if (m) best = Math.min(best, looked(m.clone(), cone)); }
    const onEye = best < cone;
    if (onEye && C.state !== 'hunt') { C.contact += dt; if (C.contact > .3 && !C.noticed) { C.noticed = true; THEM.onEvent && THEM.onEvent('notice', C); } if (C.contact > .85) { THEM.onEvent && THEM.onEvent('contact', C); } }
    else { if (C.noticed && C.contact > 0) { C.sus += .42; C.noticed = false; THEM.onEvent && THEM.onEvent('escaped', C); } C.contact = 0; }
    // staring at its body
    toE.subVectors(_b, head); const dist = toE.length(); const onBody = !eyesShut && C.vis && Math.acos(clamp(toE.normalize().dot(gaze), -1, 1)) < .25;
    if (onBody && !onEye) { C.stare += dt; if (C.stare > 1.8) { C.sus += dt * .09; C.stareSec += dt; } } else C.stare = Math.max(0, C.stare - dt * 2);
    // a flinch: you snap away, shut your eyes or step back as it comes into view or right after it tests you
    const since = CLOCK.t - Math.max(C.seenT, C.flinchT);
    if (since < .9 && since > .05 && C.state !== 'hunt') { if (me.turnRate > (renderer.xr.isPresenting ? 4.5 : 6.5) || (eyesShut && !me.sleeping) || me.backFrom(C.pos) > 1.1) { C.sus += .26; C.flinches++; C.seenT = C.flinchT = -9; THEM.onEvent && THEM.onEvent('flinch', C); } }
    // backing away from one close by
    if (dist < 1.6 && me.backFrom(C.pos) > .9 && C.vis) { C.sus += dt * .35; C.backs += dt; }
    // running in a small flat
    if (me.speed > 2.4 && C.vis) C.sus += dt * .12;
    C.sus = Math.max(0, C.sus - dt * (me.busy ? .02 : .006)); C.sus = Math.min(1.2, C.sus);
    if (C.sus >= 1 && C.state !== 'hunt') THEM.onEvent && THEM.onEvent('suspect', C);
    // an approach: it comes to your face slowly, even while you watch, and stays
    if (C.test === 'approach' && C.approach) { const A = C.approach; A.t += dt; if (!A.to) { _a.copy(gaze).setY(0).normalize(); A.to = head.clone().addScaledVector(_a, .55); A.to.y = head.y + rnd(-.04, .04); }
      if (A.t < 3) C.pos.lerp(A.to, 1 - Math.exp(-dt * 1.4)); C.yaw = Math.atan2(head.x - C.pos.x, head.z - C.pos.z); if (A.t > A.len) { C.test = null; C.approach = null; THEM.onEvent && THEM.onEvent('approachDone', C); } }
  }
  // drips and the spots they leave
  const D = THEM.drips; D.d.forEach((d, i) => { if (!d.live) return; d.v += 9.8 * dt; d.p.y -= d.v * dt; const fy = floorAt(d.p.x, d.p.z); if (d.p.y < fy) { d.live = false; puddle(d.p.x, fy + .002, d.p.z, rnd(.015, .04)); THEM.onEvent && THEM.onEvent('drip', d.p); d.p.y = -9; } D.I.setMatrixAt(i, _m.makeTranslation(d.p.x, d.p.y, d.p.z)); }); D.I.instanceMatrix.needsUpdate = true;
  const PU = THEM.pud; PU.list.forEach((p, i) => { if (!p) return; p.t += dt; const s = p.r * Math.min(1, p.t * 6) * (p.t > 90 ? Math.max(0, 1 - (p.t - 90) / 30) : 1); PU.I.setMatrixAt(i, _m.makeScale(s, 1, s).setPosition(p.x, p.y, p.z)); }); PU.I.instanceMatrix.needsUpdate = true;
}
// the face test: it comes to stand in front of yours
function approach(C, len = 7) { C.test = 'approach'; C.approach = { t: 0, len }; C.pose = 'face'; C.root.visible = true; C.state = 'test'; C.flinchT = CLOCK.t; C.upd = 0; }

export { THEM, KINDS, build, update, setSpot, away, render, approach, inView, head, gaze };
