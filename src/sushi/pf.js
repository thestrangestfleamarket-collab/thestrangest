// Polyfork's (polyfork.dev) people as Polyfork made them, each on its own 22 bones with all its skin weights, and Polyfork's recorded motion (a game's cast.json, from tools/sushi-cast.cjs); RAMEN's and THE LAST CHANCE's (src/saloon/), with what the cart asks of them: walking, standing, sitting on a stool, hands that talk, a nod, a head shake, a laugh, a wave from the shoulder, a blow taken as it really lands (the struck limb and what it hangs from knocked about their joints and sprung back, a step back or a fall past what the feet can hold, a hand to where it hurts, a duck), marks on their clothes, chopsticks to the mouth, a head that turns to what it looks at, eyes that blink
import * as THREE from 'three';
import { G, mat } from './ctx.js';

// who: [sex, voice, pitch, youngest, oldest, what they do, a dye of their own or null for none]
export const PEOPLE = [];   // everyone made, for what follows them about (their shadows: RAMEN's shade.js)
export const PF = {};   // filled by the game that uses them (src/sushi/cast.js, src/saloon/cast.js)
// the dye for a body that came in later clothes: its cloth (everything that is not skin or hair) recoloured by shade into a period palette: [dark, middle, light]
export const DRESS = {
  carving_chef: [0x1c2440, 0x2c3a62, 0xd8d0bc], hanga_roa_fisherman: [0x2a2a30, 0x3a4a6a, 0xc8bca0], male_villager: [0x2e2620, 0x5a4a38, 0xb8a888],
  townswoman_frontier_town: [0x2a1424, 0x6a2a4a, 0xd8b8c0], grandmother_in_a_rebozo: [0x24202a, 0x4a4238, 0x9a8a70], farmer_cozy_farm: [0x2a2418, 0x5a5038, 0xa89870],
  village_gardener: [0x2a2a22, 0x4a5a3a, 0xa8a080], village_child: [0x1c2440, 0x3a4a72, 0xc8c0a8],
};
const _h = {}, _c = new THREE.Color();
export function dye(C, pal, keep) { if (!pal) return C; const P = pal.map((x) => new THREE.Color(x));
  for (let i = 0; i < C.length; i += 3) { if (keep && keep(i / 3)) continue; _c.setRGB(C[i], C[i + 1], C[i + 2]).convertSRGBToLinear(); _c.getHSL(_h); const skin = _h.h > 0.015 && _h.h < 0.12 && _h.s > 0.2 && _h.s < 0.8 && _h.l > 0.08 && _h.l < 0.75, hair = _h.l < 0.035;
    if (skin || hair) continue; const k = Math.min(1, _h.l / 0.45), c = k < 0.5 ? P[0].clone().lerp(P[1], k * 2) : P[1].clone().lerp(P[2], (k - 0.5) * 2); C[i] = c.r; C[i + 1] = c.g; C[i + 2] = c.b; }
  return C; }

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)), i16 = (s) => new Int16Array(b64(s).buffer), u16 = (s) => new Uint16Array(b64(s).buffer);
const lin = (C, n) => { const out = new Float32Array(n), c = new THREE.Color(); for (let i = 0; i < n; i += 3) { c.setRGB(C[i] / 255, C[i + 1] / 255, C[i + 2] / 255, THREE.SRGBColorSpace); out[i] = c.r; out[i + 1] = c.g; out[i + 2] = c.b; } return out; };
let D = null, MAT = null, BONES, NB, PI, HEAD, TORSO, SKULL, CHEST, CL, FACEB, PART; const GEO = {};
// the game's names: hips, torso (the lowest of three spine bones), head (the neck's joint; skull above it), collar, upperArm, forearm, hand, thigh, shin, shoe, toe; a part is a bone with those that move as one with it
const PARTS = { head: ['head', 'skull'], torso: ['torso', 'spine1', 'spine2', 'collarL', 'collarR'] };
export async function loadCast(url) {
  D = await (await fetch(url)).json(); MAT = mat({ vertexColors: true, flatShading: true });
  BONES = D.bones; NB = BONES.length; PI = D.parent; const ix = (n) => BONES.indexOf(n); HEAD = ix('head'); TORSO = ix('torso'); SKULL = ix('skull'); CHEST = ix('spine2'); FACEB = new Set(['head', 'skull', 'handL', 'handR'].map(ix)); PART = {}; for (const n of BONES) PART[n] = (PARTS[n] || [n]).map(ix);
  CL = {}; for (const [n, c] of Object.entries(D.clips)) { const q = i16(c.q), Q = new Float32Array(q.length); for (let i = 0; i < q.length; i++) Q[i] = q[i] / 32767; CL[n] = { ...c, Q, H: Float32Array.from(c.h) }; }
  return Object.keys(D.bodies);
}
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3(), e1 = new THREE.Euler(), m1 = new THREE.Matrix4(), _w = new THREE.Vector3(), _t = new THREE.Vector3();
const sample = (c, t, loop, i, q, p) => { const f = loop ? (((t / c.dur) % 1) + 1) % 1 * c.n : Math.max(0, Math.min(c.n - 1.001, (t / c.dur) * c.n)), a = Math.floor(f) % c.n, b = loop ? (a + 1) % c.n : Math.min(c.n - 1, a + 1), x = f - Math.floor(f), A = (a * NB + i) * 4, B = (b * NB + i) * 4;
  q.set(c.Q[A], c.Q[A + 1], c.Q[A + 2], c.Q[A + 3]); qb.set(c.Q[B], c.Q[B + 1], c.Q[B + 2], c.Q[B + 3]); q.slerp(qb, x);
  q.normalize(); if (p) p.set(0, c.H[a] + (c.H[b] - c.H[a]) * x, 0); };
const geoOf = (key) => { if (GEO[key]) return GEO[key]; const b = D.bodies[key], Q = i16(b.pos), n = Q.length / 3, P = new Float32Array(Q.length); for (let i = 0; i < Q.length; i++) P[i] = (Q[i] + 32500) * b.sc + b.lo[i % 3];
  const BN = b64(b.bone), BW = b64(b.w), si = Uint16Array.from(BN), sw = new Float32Array(n * 4); for (let i = 0; i < sw.length; i++) sw[i] = BW[i] / 255;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(dye(lin(b64(b.vcol), Q.length), PF[key] && PF[key].length > 6 ? PF[key][6] : DRESS[key], (v) => FACEB.has(BN[v * 4])), 3)); g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4)); g.setIndex(new THREE.BufferAttribute(u16(b.tri), 1)); g.computeVertexNormals();
  // the face: the nose is the head's foremost point; the eyes sit above it, either side
  const O = b.origin; let face = null; { let zm = -9, ny = 0; for (let v = 0; v < n; v++) if (BN[v * 4] === SKULL && BW[v * 4] > 200 && Math.abs(P[v * 3]) < 0.03 && P[v * 3 + 1] < O[HEAD][1] + 0.2 && P[v * 3 + 2] > zm) { zm = P[v * 3 + 2]; ny = P[v * 3 + 1]; }
    const zs = []; for (let v = 0; v < n; v++) if (BN[v * 4] === SKULL && BW[v * 4] > 200 && Math.abs(P[v * 3]) > 0.025 && Math.abs(P[v * 3]) < 0.07 && Math.abs(P[v * 3 + 1] - ny - 0.04) < 0.05) zs.push(P[v * 3 + 2]); zs.sort((a, c) => c - a); if (zs.length) face = [0.036, ny + 0.042, zs[0] - 0.006]; }
  return (GEO[key] = { g, face }); };

const ER = 0.015; let EYE = null; const EYEBALLS = false;   // (owner, 16 Nov 2026: the faces looked wrong: Polyfork's own painted eyes, nothing laid over them)
const eyeball = () => { EYE ||= { white: mat({ color: 0xf2efe6 }), iris: mat({ color: 0x4a3a2a }), pupil: new THREE.MeshBasicMaterial({ color: 0x0a0806 }), wg: new THREE.SphereGeometry(ER, 10, 8), ig: new THREE.CircleGeometry(ER * 0.56, 12), pg: new THREE.CircleGeometry(ER * 0.27, 10), lg: new THREE.SphereGeometry(ER * 1.09, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), lid: mat({ color: 0xd9a98a }) };
  const g = new THREE.Group(); g.add(new THREE.Mesh(EYE.wg, EYE.white)); const ir = new THREE.Mesh(EYE.ig, EYE.iris); ir.position.z = ER * 0.86; g.add(ir); const pu = new THREE.Mesh(EYE.pg, EYE.pupil); pu.position.z = ER * 0.875; g.add(pu); return g; };
const GEST = { nod: 'Agree', no: 'Head shake', laugh: 'Laughing', shrug: 'Arms folded', think: 'Arms folded' }, UPPER = ['torso', 'spine1', 'spine2', 'head', 'skull', 'collarL', 'upperArmL', 'forearmL', 'handL', 'collarR', 'upperArmR', 'forearmR', 'handR'];
const SEAT = 0.79; // where a hip sits on the cart's stools
// each limb about its own joint, with all it carries: moment of inertia (kg m²), how hard muscle pulls it back, how far it can go
const LIMBS = { head: [0.06, 70, 0.7], torso: [3, 28, 0.5], upperArm: [0.35, 35, 1], forearm: [0.07, 45, 1], hand: [0.006, 80, 0.6], thigh: [2, 90, 0.35], shin: [0.25, 90, 0.4] };
const STEP_J = 0.8, FALL_J = 4, FALL_HEAD_J = 3; // a push (N s) the feet answer with a step back; one they cannot hold
const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); let SPOT = null; const ray = new THREE.Raycaster();
const GONE = 34, SLOW = 14, _cam = new THREE.Vector3();   // metres from the eyes (opt.cart): past SLOW the pose is worked every other frame, past GONE (deep in the haze) nothing is drawn
const FR = new THREE.Frustum(), _pm = new THREE.Matrix4(), _sp = new THREE.Sphere(); let frT = -1, frN = 0;
const onScreen = (p) => { if (frT !== G.t) { frT = G.t; frN++; G.camera.updateMatrixWorld(); FR.setFromProjectionMatrix(_pm.multiplyMatrices(G.camera.projectionMatrix, G.camera.matrixWorldInverse)); } _sp.center.copy(p).y += 0.9; _sp.radius = 1.6; return FR.intersectsSphere(_sp); };

// a person: P.root to place and turn; P.pose 'walk' | 'stand' | 'sit' | 'eat'; P.look a point to look at or null; P.talkT seconds of talking hands; P.gesture(name); P.waveT > 0 waves; P.push(bone, impulse, at) a blow on a limb (P.hit(dir, at, f) the same by strength); P.duck(); P.down() while knocked down; P.stain(at, color, r)
// opt: { cart } RAMEN's street and counter: far off or out of view it is worked less and not drawn; seated, the forearms rest on the counter and the eyes wander
export function pfPerson(key, sticks, opt = {}) {
  if (!D.bodies[key]) key = Object.keys(D.bodies)[0];   // (a name this build has no body for: whoever is first)
  const b = D.bodies[key], [sex] = PF[key] || ['m'], clips = CL, ks = b.hipY / D.hip, { g: geo, face } = geoOf(key);
  const root = new THREE.Group(), inner = new THREE.Group(), body = new THREE.Group(); root.add(inner); inner.add(body);
  const O = b.origin.map((v) => new THREE.Vector3(...v)), bones = BONES.map((n) => Object.assign(new THREE.Bone(), { name: n })), mesh = new THREE.SkinnedMesh(geo, MAT);
  bones.forEach((bn, i) => { bn.position.copy(O[i]); body.add(bn); }); mesh.bind(new THREE.Skeleton(bones, O.map((v) => new THREE.Matrix4().makeTranslation(-v.x, -v.y, -v.z))), new THREE.Matrix4()); mesh.frustumCulled = false; body.add(mesh);
  const ix = (n) => BONES.indexOf(n), ARM = { L: [ix('upperArmL'), ix('forearmL'), ix('handL')], R: [ix('upperArmR'), ix('forearmR'), ix('handR')] }, UP = UPPER.map(ix);
  const DIR = (a, c) => O[c].clone().sub(O[a]).normalize(), LEN = (a, c) => O[c].distanceTo(O[a]);
  let eyes = null; if (face && EYEBALLS) { const [ex, ey, ez] = face; eyes = [-1, 1].map((sx) => { const e = eyeball(); e.position.set(sx * ex, ey, ez).sub(O[HEAD]); bones[HEAD].add(e); const lid = new THREE.Mesh(EYE.lg, EYE.lid); lid.rotation.x = -1.5; lid.position.copy(e.position); bones[HEAD].add(lid); e.userData.lid = lid; return e; }); }
  const sitHip = O[0].y + (clips.Sitting ? clips.Sitting.H[0] : -0.39) * ks;
  const st = { cur: { c: clips.Idle, t: Math.random() * 5, loop: true }, prev: null, fade: 0, fade0: 1, over: null, yaw: 0, pitch: 0, ey: 0, ep: 0, blink: 1 + Math.random() * 3, lid: 0, sac: 0, sx: 0, sy: 0, base: 'Idle', fold: 0, hit: null, down: null, duck: null, push: null, wd: 0, wl: 0, phys: 0, par: Math.random() < 0.5 ? 1 : 0 };
  const CH = BONES.map((n, i) => { const L = LIMBS[n.replace(/[LR]$/, '')]; if (!L) return null; const set = []; for (let k = 0; k < NB; k++) { let a = k; while (a > 0 && a !== i) a = PI[a]; if (a === i) set.push(k); } return { set, I: L[0], K: L[1], C: 2 * 0.65 * Math.sqrt(L[1]), max: L[2], a: new THREE.Vector3(), w: new THREE.Vector3() }; });
  const J = BONES.map(() => new THREE.Vector3()), R = BONES.map(() => new THREE.Quaternion()), hp = new THREE.Vector3(), hq = new THREE.Vector3(), tgt = new THREE.Vector3(), inv = new THREE.Matrix4();
  const ax = new THREE.Vector3(), qh = new THREE.Quaternion(), spot = new THREE.Vector3(), sv = [0, 1, 2].map(() => new THREE.Quaternion()), stains = [];
  const play = (name) => { const c = clips[name]; if (!c || st.cur.c === c) return; st.prev = st.cur; st.cur = { c, t: Math.random() * c.dur, loop: true }; st.fade = st.fade0 = 0.4; };
  // the arm's hand to T (the body's own space): the elbow out and down, each bone turned from where it was modelled
  const reach = (side, T) => { const [u, f, h] = ARM[side], S = J[u], L1 = LEN(u, f), L2 = LEN(f, h), d = Math.min(_t.copy(T).sub(S).length(), L1 + L2 - 1e-4), dir = _t.normalize().clone();
    const ca = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))), pole = va.set(side === 'L' ? 0.5 : -0.5, -1, -0.4); pole.sub(vb.copy(dir).multiplyScalar(pole.dot(dir))).normalize();
    const E = vb.copy(S).addScaledVector(dir, L1 * ca).addScaledVector(pole, L1 * Math.sqrt(1 - ca * ca)), H = _w.copy(S).addScaledVector(dir, d);
    R[u].setFromUnitVectors(DIR(u, f), va.copy(E).sub(S).normalize()); R[f].setFromUnitVectors(DIR(f, h), va.copy(H).sub(E).normalize()); R[h].copy(R[f]); };
  const reachW = (side, T, w) => { if (w <= 0.001) return; const A = ARM[side]; A.forEach((i, k) => sv[k].copy(R[i])); reach(side, T); A.forEach((i, k) => R[i].copy(sv[k].slerp(R[i], w))); };
  const lean = (x, z, a, head) => { qh.setFromAxisAngle(ax.set(z, 0, -x).normalize(), a); for (const i of UP) R[i].premultiply(qh); if (head) { qh.setFromAxisAngle(ax, head); for (const i of PART.head) R[i].premultiply(qh); } };   // the trunk, head and arms tipped as one toward (x, z)
  const P = {
    root, sticks, style: key, sex, pose: 'stand', speed: 1.3, look: null, lookW: 0, lookAt: new THREE.Vector3(), waveT: 0, eatT: Math.random() * 3, talkT: 0, habitT: 4 + Math.random() * 8, mood: 0, polyfork: true, bones, mesh, eyeY: O[HEAD].y + 0.12,
    // an impulse imp (world, N s) landing at at on the named bone: it and each limb it hangs from turn about their joints by r × imp / I and spring back; the feet answer what reaches the hips
    push(name, imp, at) {
      if (st.acc) { st.force = 1; this.update(0); st.force = 0; }   // (a pose left unworked while far or out of view is brought up to now before the blow lands)
      body.updateWorldMatrix(true, false); inv.copy(body.matrixWorld).invert(); body.getWorldQuaternion(qh).invert();
      const j = imp.clone().applyQuaternion(qh), a = at.clone().applyMatrix4(inv), seated = this.pose === 'sit' || this.pose === 'eat', r = new THREE.Vector3(); let i = BONES.indexOf(name); if (i < 0) i = TORSO;
      for (let k = i; k > 0; k = PI[k]) { const c = CH[k]; if (!c) continue; c.w.addScaledVector(r.copy(a).sub(J[k]).cross(j), 1 / c.I); st.phys = 3; }
      const jh = Math.hypot(imp.x, imp.z), head = i === HEAD; st.duck = null;
      if (jh > 0.3) st.hit = { t: 0, d: new THREE.Vector3(j.x, 0, j.z).normalize(), f: jh / FALL_J, head, side: a.x > 0 ? 'L' : 'R' };
      if (!seated && !st.down && jh >= (head ? FALL_HEAD_J : FALL_J)) st.down = { t: 0, d: new THREE.Vector3(j.x, 0, j.z).normalize() };
      else if (!seated && !st.down && jh >= STEP_J) st.push = { v: new THREE.Vector3(imp.x, 0, imp.z).normalize().multiplyScalar(Math.min(0.8, jh / 12)), t: 0.7 };
      return head ? 'head' : 'body'; },
    hit(dir, at, f = 0.6) { return this.push(at.y > bones[HEAD].getWorldPosition(_w).y - 0.08 ? 'head' : 'torso', dir.clone().setLength(f * FALL_J), at); },
    rest: O, part: (n) => (PART[n] || []).map((i) => bones[i]),
    duck() { if (!st.duck && !st.down) st.duck = { t: 0 }; },
    down() { return !!st.down; },
    reeling() { return !!(st.down || st.push); },
    // what was thrown or spilt on them, left on their clothes a while (it fades)
    stain(at, color, r = 0.05) {
      root.updateMatrixWorld(true); let best = TORSO, bd = 9; for (const i of [SKULL, CHEST, 0, ARM.L[0], ARM.R[0], ARM.L[1], ARM.R[1]]) { const d = bones[i].getWorldPosition(_w).distanceTo(at); if (d < bd) { bd = d; best = i; } }
      const bn = bones[best], c = bn.getWorldPosition(new THREE.Vector3()), n = at.clone().sub(c); if (n.lengthSq() < 1e-6) n.set(0, 0, 1); n.normalize();
      ray.set(c.clone().addScaledVector(n, 0.5), n.clone().negate()); ray.far = 0.6; const hit = ray.intersectObject(mesh, false)[0], on = hit ? hit.point : c.clone().addScaledVector(n, 0.12);
      SPOT ||= new THREE.SphereGeometry(1, 8, 6); const m = new THREE.Mesh(SPOT, mat({ color: new THREE.Color(color).multiplyScalar(0.7), transparent: true, opacity: 0.85, depthWrite: false }));
      m.scale.set(r * (0.8 + Math.random() * 0.5), r * (0.7 + Math.random() * 0.4), r * 0.22); m.position.copy(on); m.quaternion.setFromUnitVectors(_t.set(0, 0, 1), n); m.userData.nopick = true; m.updateMatrix(); bn.attach(m);
      stains.push({ m, life: 150 }); if (stains.length > 8) { const o = stains.shift(); o.m.removeFromParent(); o.m.material.dispose(); } return m; },
    stains,
    gesture(name) { if (opt.cart && name === 'wave') { if (this.pose !== 'walk' || st.down) this.waveT = 2.2; return; }   // (a wave is the arm raised out to the side, clear of the face, and it ends)
      const c = clips[GEST[name] || name]; if (c && this.pose !== 'walk') st.over = { c, t: 0, w: 0, end: Math.min(c.dur, name === 'laugh' ? 3.2 : c.dur) }; if (name === 'wave') this.waveT = 1.6; },
    update(dt) {
      if (opt.cart) { st.acc = (st.acc || 0) + dt; if (G.camera && !this.hands) { root.getWorldPosition(_w); G.camera.getWorldPosition(_cam); const d = _w.distanceTo(_cam), vr = G.renderer && G.renderer.xr.isPresenting;
          body.visible = d < GONE; if (!st.force && (!body.visible || (!vr && !onScreen(_w)) || (d > SLOW && (frN & 1) === st.par))) { if (st.acc < 0.25) return; } }
        dt = st.acc; st.acc = 0; }
      const seated = this.pose === 'sit' || this.pose === 'eat';
      this.talkT = Math.max(0, this.talkT - dt); if (st.fold > 0) st.fold -= dt;
      for (let i = stains.length - 1; i >= 0; i--) { const s = stains[i]; s.life -= dt; s.m.material.opacity = 0.85 * Math.min(1, s.life / 25); if (s.life <= 0) { s.m.removeFromParent(); s.m.material.dispose(); stains.splice(i, 1); } }
      if (st.push) { st.push.t -= dt; root.position.addScaledVector(st.push.v, dt * 2 * Math.max(0, st.push.t / 0.7)); if (st.push.t <= 0) st.push = null; }   // a stagger: steps back the way the blow went
      if (!seated && this.pose === 'stand' && this.talkT <= 0 && (this.habitT -= dt) <= 0) { this.habitT = 9 + Math.random() * 14; st.fold = 4 + Math.random() * 4; }
      const want = this.pose === 'walk' || st.push ? 'Walk' : this.act && clips[this.act] && this.talkT <= 0 ? this.act : seated ? (this.talkT > 0 ? 'Sitting talking' : 'Sitting') : this.talkT > 0 ? 'Talking' : st.fold > 0 ? 'Arms folded' : 'Idle'; play(want);
      const rate = st.push ? -0.9 : this.pose === 'walk' && st.cur.c.speed ? this.speed / (st.cur.c.speed * ks) : 1; st.cur.t += dt * rate; if (st.prev) { st.prev.t += dt; st.fade -= dt; if (st.fade <= 0) st.prev = null; }
      const w = st.prev ? 1 - st.fade / st.fade0 : 1;
      for (let i = 0; i < NB; i++) { sample(st.cur.c, st.cur.t, st.cur.loop, i, R[i], i ? null : hp); if (st.prev) { sample(st.prev.c, st.prev.t, st.prev.loop, i, qa, i ? null : hq); qa.slerp(R[i], w); R[i].copy(qa); if (!i) hp.lerpVectors(hq, hp, w); } }
      // a gesture over the trunk, arms and head, eased in and out
      const o = st.over; if (o) { o.t += dt; o.w = Math.min(1, o.t / 0.3, (o.end - o.t) / 0.4); if (o.t >= o.end) st.over = null; else for (const i of UP) { sample(o.c, o.t, false, i, qa, null); R[i].slerp(qa, Math.max(0, o.w)); } }
      // where to look: yaw and pitch in the body's own space, as far as a neck goes
      this.lookW += ((this.look ? 1 : 0) - this.lookW) * Math.min(1, dt * 3.5); if (this.look) this.lookAt.lerp(this.look, Math.min(1, dt * 6));
      let ty = 0, tp = 0; if (this.lookW > 0.02 && !st.down) { body.updateWorldMatrix(true, false); inv.copy(body.matrixWorld).invert(); tgt.copy(this.lookAt).applyMatrix4(inv).sub(opt.cart && seated ? va.copy(J[HEAD]).setY(J[HEAD].y + 0.12) : va.copy(O[HEAD]).setY(O[HEAD].y + 0.12)); ty = Math.atan2(tgt.x, tgt.z) * this.lookW; tp = (Math.atan2(tgt.y, Math.hypot(tgt.x, tgt.z)) + (opt.cart && seated ? 0.3 : 0)) * this.lookW; }   // (on a stool the head is where the sitting has it, and the recorded sitting bows it: it comes up to whoever it looks at)
      st.bt = (st.bt ?? Math.random() * 30) + dt; if (opt.cart && seated && !st.down) { const iw = 1 - this.lookW; ty += iw * (0.3 * Math.sin(st.bt * 0.21 + (this.seed || 0)) + 0.13 * Math.sin(st.bt * 0.63)); tp += iw * (-0.1 + 0.05 * Math.sin(st.bt * 0.37)); }   // seated with nothing to look at, the eyes wander: the street, the pots, the bowl
      const hy = Math.max(-1.1, Math.min(1.1, ty)), hpi = Math.max(-0.45, Math.min(0.5, tp)), k = Math.min(1, dt * 3.2); st.yaw += (hy * 0.75 - st.yaw) * k; st.pitch += (hpi * 0.7 - st.pitch) * k;
      qa.setFromEuler(e1.set(0, st.yaw * 0.22, 0)); for (const i of PART.torso) R[i].premultiply(qa); qa.setFromEuler(e1.set(-st.pitch, st.yaw, 0, 'YXZ')); for (const i of PART.head) R[i].premultiply(qa);
      // a duck folds forward; a blow past what the feet hold floors them and they get up again
      const H = st.hit; if (H) { H.t += dt; if (H.t > 3.2) st.hit = null; }
      const D = st.duck; let de = 0; if (D) { D.t += dt; de = D.t < 0.16 ? sm(D.t / 0.16) : D.t < 0.8 ? 1 : 1 - sm((D.t - 0.8) / 0.5); if (D.t > 1.3) st.duck = null; else lean(0, 1, de * 0.7, de * 0.35); }
      const F = st.down; let fa = 0, fl = 0; if (F) { F.t += dt; const t = F.t; if (t < 0.55) fa = 1.45 * (t / 0.55) ** 2; else if (t < 2.7) fa = 1.45 - 0.07 * Math.max(0, Math.sin((t - 0.55) * 8)) * Math.max(0, 1 - (t - 0.55) * 2.5); else if (t < 4.3) fa = 1.45 * (1 - sm((t - 2.7) / 1.6)); else st.down = null; fl = Math.sin(Math.PI * Math.min(1, t / 0.9)); }
      if (st.down) { body.quaternion.setFromAxisAngle(ax.set(F.d.z, 0, -F.d.x), fa); body.position.y = Math.sin(fa) * 0.11; } else if (body.position.y || body.quaternion.w < 1) { body.quaternion.identity(); body.position.y = 0; }
      const eatC = this.pose === 'eat' ? Math.pow((Math.sin((this.eatT + dt) * 2.4) + 1) / 2, 1.3) : 0;
      if (opt.cart && !st.down) { if (seated) lean(0, 1, 0.012 * Math.sin(st.bt * 1.5) + 0.08 * eatC);   // breathing (the recorded sitting already leans to the counter); down to the bowl with each mouthful
        else if (this.pose === 'stand') lean(0, 1, 0.006 * Math.sin(st.bt * 1.4)); }
      J[0].copy(hp).multiplyScalar(ks).add(O[0]); for (let i = 1; i < NB; i++) { const p = PI[i]; J[i].copy(O[i]).sub(O[p]).applyQuaternion(R[p]).add(J[p]); }
      // seated at the counter: hands on it, the right one to the mouth with the chopsticks while eating; a wave is the right hand up by the head
      sticks.visible = false; const lift = seated ? SEAT - sitHip : 0; inner.position.y += (lift - inner.position.y) * Math.min(1, dt * 6);
      const lt = (x, y, z) => _t.set(x, y - inner.position.y, z);
      // (at the cart the forearms rest on the counter's edge with the elbows bent, or one hand in the lap, or the arms folded on it, changing now and then; with a bowl in front the left hand is beside it and the right over it with the chopsticks, never through it)
      if (opt.cart && seated && !st.over) { const S0 = st.sit || (st.sit = { v: (Math.random() * 3) | 0, t: 5 + Math.random() * 9, L: new THREE.Vector3(0.13, 1.035, 0.33), R: new THREE.Vector3(-0.13, 1.035, 0.33), wl: 1, wr: 1 }), eat = this.pose === 'eat', talk = this.talkT > 0, k = Math.min(1, dt * 3);
        if ((S0.t -= dt) <= 0) { S0.t = 9 + Math.random() * 9; S0.v = (S0.v + 1 + ((Math.random() * 2) | 0)) % 3; }
        S0.L.lerp(eat ? va.set(0.21, 1.045, 0.37) : S0.v === 2 ? va.set(0.02, 1.04, 0.31) : va.set(0.13, 1.035, 0.33), k); S0.R.lerp(S0.v === 2 ? va.set(-0.06, 1.052, 0.33) : va.set(-0.13, 1.035, 0.33), k);
        S0.wl += ((talk ? 0 : 1) - S0.wl) * k; S0.wr += ((eat ? 1 : talk || S0.v === 1 || this.waveT > 0 ? 0 : 1) - S0.wr) * k;
        reachW('L', lt(S0.L.x, S0.L.y, S0.L.z), S0.wl);
        if (eat) { this.eatT += dt; const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3), mouth = va.copy(J[HEAD]).add(vb.set(-0.1, -0.17, 0.2)); reachW('R', lt(-0.1, 1.14, 0.36).lerp(mouth, c), S0.wr); }   // (the hand comes up under the chin, never across the face: the chopsticks carry the noodles the rest of the way)
        else reachW('R', lt(S0.R.x, S0.R.y, S0.R.z), S0.wr); }
      else if (seated && this.talkT <= 0 && !st.over) { reach('L', lt(0.17, 0.99, 0.4));
        if (this.pose === 'eat') { this.eatT += dt; const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3), mouth = va.copy(J[HEAD]).add(vb.set(-0.04, 0.05, 0.19)); reach('R', lt(-0.06, 1.0, 0.42).lerp(mouth, c)); }
        else if (this.waveT <= 0) reach('R', lt(-0.17, 0.99, 0.4)); }
      // a hand to where it hurts; hands up over the head in a duck; arms thrown out in a fall
      if (H && !st.down && H.t > 0.18 && H.t < 2.9) { const w = sm((H.t - 0.18) / 0.35) * (1 - sm((H.t - 2.2) / 0.7)), b = H.head ? HEAD : TORSO; spot.copy(J[b]).addScaledVector(H.d, -0.15).add(_w.set(H.side === 'L' ? 0.05 : -0.05, H.head ? 0.04 : 0.2, 0)); reachW(H.side, spot, w); }
      if (de > 0) for (const s of ['L', 'R']) reachW(s, spot.copy(J[HEAD]).add(_w.set(s === 'L' ? 0.09 : -0.09, 0.1, 0.1)), de);
      if (fl > 0) for (const s of ['L', 'R']) reachW(s, spot.set(s === 'L' ? 0.5 : -0.5, 1.45, 0.2), fl * 0.8);
      // a wave: the upper arm raised from the shoulder to the side of the head, the forearm up, the hand rocking at the wrist, eased in and out; the other arm still
      if (this.waveT > st.wl + 1e-3) st.wd = this.waveT; st.wl = this.waveT = Math.max(0, this.waveT - dt);
      if (st.wd > 0 && this.waveT > 0 && !st.down) { const e = st.wd - this.waveT, w = sm(e / 0.38) * sm(this.waveT / 0.42), s = Math.sin(e * Math.PI * 2 * 1.8) * sm((e - 0.25) / 0.25), [u, f, h] = ARM.R;
        sv[0].setFromUnitVectors(DIR(u, f), spot.set(-0.78, 0.5, 0.3).normalize()); sv[1].setFromUnitVectors(DIR(f, h), spot.set(-0.1 + s * 0.12, 1, 0.16).normalize()); sv[1].premultiply(qh.setFromAxisAngle(spot, 0.5)); sv[2].copy(sv[1]).premultiply(qh.setFromAxisAngle(ax.set(0, 0, 1), s * 0.42));
        R[u].slerp(sv[0], w); R[f].slerp(sv[1], w); R[h].slerp(sv[2], w); }
      if (this.hands) for (const s of ['L', 'R']) if (this.hands[s]) { body.updateWorldMatrix(true, false); reach(s, body.worldToLocal(_t.copy(this.hands[s]))); }   // hands held where someone's real ones are (the cook: cook.js)
      const arms = () => { for (const s of ['L', 'R']) { const [u, f, h] = ARM[s]; J[f].copy(O[f]).sub(O[u]).applyQuaternion(R[u]).add(J[u]); J[h].copy(O[h]).sub(O[f]).applyQuaternion(R[f]).add(J[f]); } }; arms();
      if (opt.cart && seated && !st.down) { let moved = false; for (const s of ['L', 'R']) { if (this.hands && this.hands[s]) continue; const h = J[ARM[s][2]], y = h.y + inner.position.y; if (h.z > 0.27 && y < 1.03) { reach(s, lt(h.x, 1.035, h.z)); moved = true; } } if (moved) arms(); }   // (a hand that a gesture carried down through the counter is set on it)
      if (st.phys > 0) { st.phys -= dt; const h = Math.min(dt, 1 / 30);   // the limbs knocked about, springing back to where the motion has them
        for (let k = NB - 1; k > 0; k--) { const c = CH[k]; if (!c) continue; c.w.addScaledVector(c.a, -c.K * h).multiplyScalar(Math.max(0, 1 - c.C * h)); c.a.addScaledVector(c.w, h); const l = c.a.length(); if (l > c.max) { c.a.multiplyScalar(c.max / l); c.w.multiplyScalar(0.5); }
          if (l > 1e-4) { qh.setFromAxisAngle(ax.copy(c.a).normalize(), Math.min(l, c.max)); for (const i of c.set) R[i].premultiply(qh); } if (st.phys <= 0) { c.a.set(0, 0, 0); c.w.set(0, 0, 0); } }
        for (let i = 1; i < NB; i++) { const p = PI[i]; J[i].copy(O[i]).sub(O[p]).applyQuaternion(R[p]).add(J[p]); } }
      for (let i = 0; i < NB; i++) { bones[i].position.copy(J[i]); bones[i].quaternion.copy(R[i]); }
      if (this.pose === 'eat' && seated && !st.over) { root.updateMatrixWorld(true); const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3), H = bones[ARM.R[2]].getWorldPosition(_w), M = bones[HEAD].getWorldPosition(new THREE.Vector3()); M.y += 0.06; const T = new THREE.Vector3(0.05, 1.0, 0.5).applyMatrix4(root.matrixWorld).lerp(M, c);
        sticks.visible = true; root.worldToLocal(sticks.position.copy(H).addScaledVector(va.copy(T).sub(H).normalize(), 0.05)); sticks.lookAt(T); }
      if (eyes) { st.sac -= dt; if (st.sac <= 0) { st.sac = 0.4 + Math.random() * 1.8; st.sx = (Math.random() - 0.5) * 0.09; st.sy = (Math.random() - 0.5) * 0.05; }
        const ey = Math.max(-0.5, Math.min(0.5, ty - st.yaw)) + st.sx, ep = Math.max(-0.35, Math.min(0.35, tp - st.pitch)) + st.sy, ke = Math.min(1, dt * 14); st.ey += (ey - st.ey) * ke; st.ep += (ep - st.ep) * ke;
        st.blink -= dt; if (st.blink <= 0) st.blink = 2 + Math.random() * 4; const shut = st.blink < 0.13 ? 1 - Math.abs(st.blink - 0.065) / 0.065 : 0; st.lid += (shut - st.lid) * Math.min(1, dt * 40);
        for (const e of eyes) { e.rotation.set(-st.ep, st.ey, 0, 'YXZ'); e.userData.lid.rotation.x = -1.5 + st.lid * 1.45 + Math.max(0, -st.ep) * 0.5; } } },
  };
  PEOPLE.push(P); P.update(0); return P;
}
