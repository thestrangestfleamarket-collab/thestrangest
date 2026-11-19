// the people: Microsoft Rocketbox's photographed bodies (MIT) in their own clothes as downtown New Yorkers of 1985, and their recorded motion (data/sushi/rb/, from tools/sushi-people.py), with what the cart asks of them: walking, standing, sitting on a stool, hands that talk, a nod, a head shake, a laugh, a wave, eyes that blink, a jaw that moves when they speak, a blow taken as it really lands (the struck limb and what it hangs from knocked about their joints and sprung back, a step back or a fall past what the feet can hold, a hand to where it hurts, a duck), marks on their clothes, chopsticks to the mouth, a head that turns to what it looks at; near, the whole body, farther off a lighter one
import * as THREE from 'three';
import { G, mat } from './ctx.js';

// who can be at the cart: [sex, voice, pitch, youngest, oldest, what they do] (the voice names are worker/door.js's /sushi/say)
export const RB = {
  cook: ['f', 'hera', 0.98, 35, 55, 'the cook'],
  cop: ['m', 'helios', 0.97, 30, 45, 'a patrolman of the Ninth Precinct who walks this beat'],
  cabbie: ['m', 'zeus', 0.95, 50, 62, 'a yellow cab driver between fares'],
  punk: ['f', 'asteria', 1.0, 19, 26, 'a singer in a punk band'],
  suit: ['m', 'perseus', 0.98, 28, 40, 'a man in a suit up from an office on Wall Street'],
  nurse: ['f', 'hera', 1.0, 28, 45, 'a nurse from the hospital on First Avenue'],
  babushka: ['f', 'luna', 0.95, 64, 78, 'an old Ukrainian woman who has lived on this block for forty years'],
  bboy: ['m', 'orpheus', 1.02, 17, 23, 'a young man in a track suit who breakdances by the subway'],
  denim: ['m', 'arcas', 0.97, 35, 48, 'the man who keeps the bodega'],
  leather: ['f', 'asteria', 1.01, 24, 36, 'a painter with a studio in an old tenement on Avenue B'],
  coned: ['m', 'angus', 0.96, 40, 58, 'a Con Edison man working on the steam main across the street'],
  kid: ['m', 'orpheus', 1.18, 9, 12, 'a kid from the block sent out for a bowl'],
  grocer: ['m', 'zeus', 0.96, 48, 60, 'the counterman from the coffee shop on the corner, still in his tie'],
  clerk: ['m', 'orion', 0.98, 22, 34, 'a clerk at the record shop'],
  laundress: ['f', 'hera', 0.99, 35, 50, 'the woman who runs the laundromat'],
  secretary: ['f', 'asteria', 1.02, 28, 45, 'a legal secretary on her way home from an office near City Hall'],
  dancer: ['f', 'asteria', 1.03, 20, 30, 'a dancer who waits tables on Second Avenue'],
  messenger: ['m', 'angus', 0.98, 26, 40, 'a longshoreman off the Brooklyn piers'],
  student: ['m', 'orion', 1.0, 19, 27, 'a student at the art school on Cooper Square'],
};
// the regulars' own bodies are theirs alone (block.js CAST): whoever else sits down or passes is one of the others
const CASTED = ['cop', 'cabbie', 'punk', 'nurse', 'babushka', 'bboy', 'denim', 'kid', 'clerk', 'laundress'];
export const CUSTOMERS = Object.keys(RB).filter((k) => k !== 'cook' && !CASTED.includes(k));
// THE MARKET's visitors come as one of these, in their own colours and at their own size (tenant.js)
export const VISITORS = ['secretary', 'leather', 'student', 'messenger', 'suit', 'dancer'];

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
let D = null, NB = 0, PI = [], HEAD, TORSO, BASE = ''; const CL = { m: {}, f: {} }, BODY = {};
const IX = {};
// the people and their motion: the cast's file, then each body's mesh (near and far) and pictures
export async function loadPeople(base) {
  BASE = base; D = await (await fetch(base + 'people.json')).json(); NB = D.bones.length; PI = D.parent; D.bones.forEach((n, i) => (IX[n] = i)); HEAD = IX.head; TORSO = IX.torso;
  for (const s of ['m', 'f']) for (const [n, c] of Object.entries(D.clips[s])) { const q = new Int16Array(b64(c.q).buffer), p = new Int16Array(b64(c.p).buffer); CL[s][n] = { ...c, Q: Float32Array.from(q, (v) => v / 32767), P: Float32Array.from(p, (v) => v / 1000) }; }
  for (const s of ['m', 'f']) CL[s].hip0 = CL[s].Idle.P[1];
  const tl = new THREE.TextureLoader();
  await Promise.all(Object.keys(D.bodies).map(async (k) => { const b = D.bodies[k], buf = await (await fetch(base + k + '.bin')).arrayBuffer();
    const t = await tl.loadAsync(base + k + '.webp'); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2;
    BODY[k] = { b, t, geo: b.lod.map((L, i) => geom(buf, L, i ? L.at : 0)), mat: null, O: b.O.map((v) => new THREE.Vector3(...v)), X: (b.X || []).map((v) => new THREE.Vector3(...v)), QI: b.Q.map((q) => new THREE.Quaternion(q[1], q[2], q[3], q[0]).invert()) }; }));
  return Object.keys(BODY);
}
const geom = (buf, L, at) => { const n = L.nv, P = new Uint16Array(buf, at, n * 3); let o = at + n * 6; const N = new Int8Array(buf, o, n * 4); o += n * 4; const U = new Uint16Array(buf, o, n * 2); o += n * 4; const SI = new Uint8Array(buf, o, n * 4); o += n * 4; const SW = new Uint8Array(buf, o, n * 4); o += n * 4; const I = new Uint16Array(buf, o, L.ni);
  const pos = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) pos[i] = L.lo[i % 3] + P[i] * L.sc[i % 3];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(N, 4), 3, 0, true)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(U.length).map((_, i) => U[i] / 65535), 2));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(Uint16Array.from(SI), 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4, true)); g.setIndex(new THREE.BufferAttribute(I, 1)); g.computeBoundingSphere(); return g; };
const materialOf = (k, map) => { const B = BODY[k]; if (!map && B.mat) return B.mat; const m = mat({ map: map || B.t, alphaTest: 0.5, side: THREE.DoubleSide }); m.alphaToCoverage = true; if (!map) B.mat = m; return m; };
// what a body wears and where in its picture (run lengths from the bake: 0 neither, 1 above the waist, 2 below, 3 shoes), opened when first asked for
const wearOf = (B) => { if (B.wear !== undefined) return B.wear; const w = B.b.wear; if (!w) return (B.wear = null); const r = b64(w.r), m = new Uint8Array(w.n * w.n); let o = 0; for (let i = 0; i < r.length; i += 2) { m.fill(r[i], o, o + r[i + 1]); o += r[i + 1]; } return (B.wear = { n: w.n, m }); };
export const bodyInfo = (k) => (BODY[k] ? { sex: BODY[k].b.sex, height: BODY[k].b.height, tex: BODY[k].t, wear: wearOf(BODY[k]) } : null);

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3(), e1 = new THREE.Euler(), _w = new THREE.Vector3(), _t = new THREE.Vector3(), _cam = new THREE.Vector3();
// a frame of a take: each bone's turn from its parent (the hips' from the body), and where the hips are
const sample = (c, t, loop, i, q, p) => { const f = loop ? (((t / c.dur) % 1) + 1) % 1 * c.n : Math.max(0, Math.min(c.n - 1.001, (t / c.dur) * c.n)), a = Math.floor(f) % c.n, b = loop ? (a + 1) % c.n : Math.min(c.n - 1, a + 1), x = f - Math.floor(f), A = (a * NB + i) * 4, B = (b * NB + i) * 4;
  q.set(c.Q[A + 1], c.Q[A + 2], c.Q[A + 3], c.Q[A]); qb.set(c.Q[B + 1], c.Q[B + 2], c.Q[B + 3], c.Q[B]); q.slerp(qb, x);
  if (p) { const C = a * 3, E = b * 3; p.set(c.P[C], c.P[C + 1], c.P[C + 2]); vb.set(c.P[E], c.P[E + 1], c.P[E + 2]); p.lerp(vb, x); } };
const GEST = { nod: 'Agree', no: 'Head shake', laugh: 'Laughing', shrug: 'Shrug', think: 'Thoughtful', wave: 'Wave' };
const UPPER = ['torso', 'neck', 'head', 'clavL', 'upperArmL', 'forearmL', 'handL', 'clavR', 'upperArmR', 'forearmR', 'handR'];
const SEAT = 0.79; // where a hip sits on the cart's stools
const NEAR = 12, GONE = 34, SLOW = 14; // metres from the eyes: nearer, the whole body; farther, the lighter one, its pose worked every other frame; beyond GONE (deep in the haze) not drawn
const FR = new THREE.Frustum(), _pm = new THREE.Matrix4(), _sp = new THREE.Sphere(); let frT = -1, frN = 0;
const onScreen = (p) => { if (frT !== G.t) { frT = G.t; frN++; G.camera.updateMatrixWorld(); FR.setFromProjectionMatrix(_pm.multiplyMatrices(G.camera.projectionMatrix, G.camera.matrixWorldInverse)); } _sp.center.copy(p).y += 0.9; _sp.radius = 1.6; return FR.intersectsSphere(_sp); };
// each limb about its own joint, with all it carries: moment of inertia (kg m²), how hard muscle pulls it back, how far it can go
const LIMBS = { head: [0.06, 70, 0.7], torso: [3, 28, 0.5], upperArm: [0.35, 35, 1], forearm: [0.07, 45, 1], hand: [0.006, 80, 0.6], thigh: [2, 90, 0.35], shin: [0.25, 90, 0.4] };
const STEP_J = 0.8, FALL_J = 4, FALL_HEAD_J = 3; // a push (N s) the feet answer with a step back; one they cannot hold
const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); let SPOT = null; const ray = new THREE.Raycaster();

// a person: P.root to place and turn; P.pose 'walk' | 'stand' | 'sit' | 'eat'; P.look a point to look at or null; P.talkT seconds of talking hands; P.gesture(name); P.waveT > 0 waves; P.push(bone, impulse, at) a blow on a limb (P.hit(dir, at, f) the same by strength); P.duck(); P.down() while knocked down; P.stain(at, color, r)
// o: { map } their own pictures (a visitor's colours), { scale } their size
export function rbPerson(key, sticks, o = {}) {
  if (!BODY[key]) key = Object.keys(BODY)[0];   // (a name this build has no body for: whoever is first)
  const B = BODY[key], b = B.b, sex = b.sex, clips = CL[sex], ks = b.hipY / clips.hip0, O = B.O, QI = B.QI;
  const root = new THREE.Group(), inner = new THREE.Group(), body = new THREE.Group(); root.add(inner); inner.add(body); if (o.scale) body.scale.setScalar(o.scale);
  const OA = [...O, ...B.X], bones = [...D.bones, ...(D.extra || []).slice(0, B.X.length)].map((n) => Object.assign(new THREE.Bone(), { name: n })), skel = new THREE.Skeleton(bones, OA.map((v) => new THREE.Matrix4().makeTranslation(-v.x, -v.y, -v.z))), M = materialOf(key, o.map);   // (after the takes' bones: the eyelids and the jaw, moved here)
  const LID = B.X.length > 0 ? NB : -1, JAWB = B.X.length > 1 ? NB + 1 : -1, face = { blinkT: 1 + Math.random() * 4, blink: 0, jaw: 0, ph: Math.random() * 9 };
  bones.forEach((bn, i) => { bn.position.copy(OA[i]); body.add(bn); });
  const lods = B.geo.map((g) => { const m = new THREE.SkinnedMesh(g, M); m.bind(skel, new THREE.Matrix4()); m.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.9, 0), 1.4); body.add(m); return m; }); lods[1].visible = false; const mesh = lods[0];
  const ix = (n) => IX[n], ARM = { L: [ix('upperArmL'), ix('forearmL'), ix('handL')], R: [ix('upperArmR'), ix('forearmR'), ix('handR')] }, UP = UPPER.map(ix);
  const DIR = (a, c) => O[c].clone().sub(O[a]).normalize(), LEN = (a, c) => O[c].distanceTo(O[a]);
  const sitHip = clips.Sitting.P[1] * ks;
  const st = { cur: { c: clips.Idle, t: Math.random() * 5, loop: true }, prev: null, fade: 0, fade0: 1, over: null, yaw: 0, pitch: 0, fold: 0, hit: null, down: null, duck: null, push: null, wd: 0, wl: 0, phys: 0, far: false, par: Math.random() < 0.5 ? 1 : 0 };
  const CH = D.bones.map((n, i) => { const L = LIMBS[n.replace(/[LR]$/, '')]; if (!L) return null; const set = []; for (let k = 0; k < NB; k++) { let a = k; while (a > 0 && a !== i) a = PI[a]; if (a === i) set.push(k); } return { set, I: L[0], K: L[1], C: 2 * 0.65 * Math.sqrt(L[1]), max: L[2], a: new THREE.Vector3(), w: new THREE.Vector3() }; });
  const below = (i) => CH[i] ? CH[i].set : D.bones.map((_, k) => k).filter((k) => { let a = k; while (a > 0 && a !== i) a = PI[a]; return a === i; }), UPSET = below(TORSO);
  const LQ = D.bones.map(() => new THREE.Quaternion()), MQ = D.bones.map(() => new THREE.Quaternion()), J = D.bones.map(() => new THREE.Vector3()), R = D.bones.map(() => new THREE.Quaternion()), hp = new THREE.Vector3(), hq = new THREE.Vector3(), tgt = new THREE.Vector3(), inv = new THREE.Matrix4();
  const ax = new THREE.Vector3(), qh = new THREE.Quaternion(), spot = new THREE.Vector3(), sv = [0, 1, 2].map(() => new THREE.Quaternion()), stains = [];
  const play = (name) => { const c = clips[name]; if (!c || st.cur.c === c) return; st.prev = st.cur; st.cur = { c, t: Math.random() * c.dur, loop: true }; st.fade = st.fade0 = 0.4; };
  const fk = () => { for (let i = 1; i < NB; i++) { const p = PI[i]; J[i].copy(O[i]).sub(O[p]).applyQuaternion(R[p]).add(J[p]); } };
  // the arm's hand to T (the body's own space): the elbow out and down, each bone turned from where it was modelled
  const reach = (side, T) => { const [u, f, h] = ARM[side], S = J[u], L1 = LEN(u, f), L2 = LEN(f, h), d = Math.min(_t.copy(T).sub(S).length(), L1 + L2 - 1e-4), dir = _t.normalize().clone();
    const ca = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))), pole = va.set(side === 'L' ? 0.5 : -0.5, -1, -0.4); pole.sub(vb.copy(dir).multiplyScalar(pole.dot(dir))).normalize();
    const E = vb.copy(S).addScaledVector(dir, L1 * ca).addScaledVector(pole, L1 * Math.sqrt(1 - ca * ca)), H = _w.copy(S).addScaledVector(dir, d);
    R[u].setFromUnitVectors(DIR(u, f), va.copy(E).sub(S).normalize()); R[f].setFromUnitVectors(DIR(f, h), va.copy(H).sub(E).normalize()); R[h].copy(R[f]); };
  const reachW = (side, T, w) => { if (w <= 0.001) return; const A = ARM[side]; A.forEach((i, k) => sv[k].copy(R[i])); reach(side, T); A.forEach((i, k) => R[i].copy(sv[k].slerp(R[i], w))); };
  const turn = (set, q) => { for (const i of set) R[i].premultiply(q); };
  const lean = (x, z, a, head) => { qh.setFromAxisAngle(ax.set(z, 0, -x).normalize(), a); turn(UPSET, qh); if (head) R[HEAD].premultiply(qh.setFromAxisAngle(ax, head)); };   // the trunk, head and arms tipped as one toward (x, z)
  const P = {
    root, sticks, style: key, sex, pose: 'stand', speed: 1.3, look: null, lookW: 0, lookAt: new THREE.Vector3(), waveT: 0, eatT: Math.random() * 3, talkT: 0, habitT: 4 + Math.random() * 8, mood: 0, real: true, bones, mesh,
    eyeY: (O[HEAD].y + 0.1) * (o.scale || 1),
    // an impulse imp (world, N s) landing at at on the named bone: it and each limb it hangs from turn about their joints by r × imp / I and spring back; the feet answer what reaches the hips
    push(name, imp, at) {
      if (st.acc) { st.force = 1; this.update(0); st.force = 0; }   // (a pose left unworked while far or out of view is brought up to now before the blow lands)
      body.updateWorldMatrix(true, false); inv.copy(body.matrixWorld).invert(); body.getWorldQuaternion(qh).invert();
      const j = imp.clone().applyQuaternion(qh), a = at.clone().applyMatrix4(inv), seated = this.pose === 'sit' || this.pose === 'eat', r = new THREE.Vector3(); let i = IX[name] ?? -1; if (i < 0) i = TORSO;
      for (let k = i; k > 0; k = PI[k]) { const c = CH[k]; if (!c) continue; c.w.addScaledVector(r.copy(a).sub(J[k]).cross(j), 1 / c.I); st.phys = 3; }
      const jh = Math.hypot(imp.x, imp.z), head = i === HEAD; st.duck = null;
      if (jh > 0.3) st.hit = { t: 0, d: new THREE.Vector3(j.x, 0, j.z).normalize(), f: jh / FALL_J, head, side: a.x > 0 ? 'L' : 'R' };
      if (!seated && !st.down && jh >= (head ? FALL_HEAD_J : FALL_J)) st.down = { t: 0, d: new THREE.Vector3(j.x, 0, j.z).normalize() };
      else if (!seated && !st.down && jh >= STEP_J) st.push = { v: new THREE.Vector3(imp.x, 0, imp.z).normalize().multiplyScalar(Math.min(0.8, jh / 12)), t: 0.7 };
      return head ? 'head' : 'body'; },
    hit(dir, at, f = 0.6) { return this.push(at.y > bones[HEAD].getWorldPosition(_w).y - 0.08 ? 'head' : 'torso', dir.clone().setLength(f * FALL_J), at); },
    rest: O,
    duck() { if (!st.duck && !st.down) st.duck = { t: 0 }; },
    down() { return !!st.down; },
    reeling() { return !!(st.down || st.push); },
    // what was thrown or spilt on them, left on their clothes a while (it fades)
    stain(at, color, r = 0.05) {
      root.updateMatrixWorld(true); let best = TORSO, bd = 9; for (const i of [HEAD, TORSO, 0, ARM.L[0], ARM.R[0], ARM.L[1], ARM.R[1]]) { const d = bones[i].getWorldPosition(_w).distanceTo(at); if (d < bd) { bd = d; best = i; } }
      const bn = bones[best], c = bn.getWorldPosition(new THREE.Vector3()), n = at.clone().sub(c); if (n.lengthSq() < 1e-6) n.set(0, 0, 1); n.normalize();
      ray.set(c.clone().addScaledVector(n, 0.5), n.clone().negate()); ray.far = 0.6; const hit = ray.intersectObject(mesh, false)[0], on = hit ? hit.point : c.clone().addScaledVector(n, 0.12);
      SPOT ||= new THREE.SphereGeometry(1, 8, 6); const m = new THREE.Mesh(SPOT, mat({ color: new THREE.Color(color).multiplyScalar(0.7), transparent: true, opacity: 0.85, depthWrite: false }));
      m.scale.set(r * (0.8 + Math.random() * 0.5), r * (0.7 + Math.random() * 0.4), r * 0.22); m.position.copy(on); m.quaternion.setFromUnitVectors(_t.set(0, 0, 1), n); m.userData.nopick = true; m.updateMatrix(); bn.attach(m);
      stains.push({ m, life: 150 }); if (stains.length > 8) { const o = stains.shift(); o.m.removeFromParent(); o.m.material.dispose(); } return m; },
    stains,
    gesture(name) { const c = clips[GEST[name] || name]; if (!c) return; if (name === 'wave' && (this.pose !== 'stand' || st.down)) { this.waveT = 1.6; return; } if (this.pose !== 'walk') { st.over = { c, t: 0, w: 0, end: Math.min(c.dur, name === 'laugh' ? 3.2 : c.dur), wave: name === 'wave' }; if (name === 'wave') this.waveT = st.over.end; } },
    update(dt) {
      // far or out of view: drawn lighter or not at all, the pose worked less often (time still passes for it)
      st.acc = (st.acc || 0) + dt; if (G.camera && !this.hands) { root.getWorldPosition(_w); G.camera.getWorldPosition(_cam); const d = _w.distanceTo(_cam), vr = G.renderer && G.renderer.xr.isPresenting;
        body.visible = d < GONE; if (!st.force && (!body.visible || (!vr && !onScreen(_w)) || (d > SLOW && (frN & 1) === st.par))) { if (st.acc < 0.25) return; } }
      dt = st.acc; st.acc = 0;
      const seated = this.pose === 'sit' || this.pose === 'eat';
      this.talkT = Math.max(0, this.talkT - dt); if (st.fold > 0) st.fold -= dt;
      for (let i = stains.length - 1; i >= 0; i--) { const s = stains[i]; s.life -= dt; s.m.material.opacity = 0.85 * Math.min(1, s.life / 25); if (s.life <= 0) { s.m.removeFromParent(); s.m.material.dispose(); stains.splice(i, 1); } }
      if (st.push) { st.push.t -= dt; root.position.addScaledVector(st.push.v, dt * 2 * Math.max(0, st.push.t / 0.7)); if (st.push.t <= 0) st.push = null; }   // a stagger: steps back the way the blow went
      if (!seated && this.pose === 'stand' && this.talkT <= 0 && (this.habitT -= dt) <= 0) { this.habitT = 9 + Math.random() * 14; st.fold = 4 + Math.random() * 3; }
      // near or far: the whole body or the lighter one (the cook and anyone held by the hands always whole)
      if (G.camera) { root.getWorldPosition(_w); G.camera.getWorldPosition(_cam); const far = !this.hands && _w.distanceTo(_cam) > NEAR + (st.far ? 0.5 : 0); if (far !== st.far) { st.far = far; lods[0].visible = !far; lods[1].visible = far; } }
      const want = this.pose === 'walk' || st.push ? 'Walk' : this.act && clips[this.act] && this.talkT <= 0 ? this.act : seated ? 'Sitting' : this.talkT > 0 ? 'Talking' : st.fold > 0 ? 'Look around' : 'Idle'; play(want);
      const rate = st.push ? -0.9 : this.pose === 'walk' && st.cur.c.speed ? this.speed / (st.cur.c.speed * ks * body.scale.x) : 1; st.cur.t += dt * rate; if (st.prev) { st.prev.t += dt; st.fade -= dt; if (st.fade <= 0) st.prev = null; }
      const w = st.prev ? 1 - st.fade / st.fade0 : 1;
      for (let i = 0; i < NB; i++) { sample(st.cur.c, st.cur.t, st.cur.loop, i, LQ[i], i ? null : hp); if (st.prev) { sample(st.prev.c, st.prev.t, st.prev.loop, i, qa, i ? null : hq); qa.slerp(LQ[i], w); LQ[i].copy(qa); if (!i) hp.lerpVectors(hq, hp, w); } }
      // a gesture over the trunk, arms and head (and talking hands while seated), eased in and out
      const o = st.over; if (o) { o.t += dt; o.w = Math.min(1, o.t / 0.3, (o.end - o.t) / 0.4); if (o.t >= o.end) st.over = null; else for (const i of UP) { sample(o.c, o.t, false, i, qa, null); LQ[i].slerp(qa, Math.max(0, o.w)); } }
      else if (seated && this.talkT > 0) { const c = clips.Talking; st.tt = (st.tt || 0) + dt; for (const i of UP) { if (i === IX.torso) continue; sample(c, st.tt, true, i, qa, null); LQ[i].slerp(qa, 0.85); } }
      // the bones from the hips out: each turned from where it was modelled (the skin follows that)
      MQ[0].copy(LQ[0]); for (let i = 1; i < NB; i++) MQ[i].multiplyQuaternions(MQ[PI[i]], LQ[i]); for (let i = 0; i < NB; i++) R[i].multiplyQuaternions(MQ[i], QI[i]);
      // where to look: yaw and pitch in the body's own space, as far as a neck goes
      this.lookW += ((this.look ? 1 : 0) - this.lookW) * Math.min(1, dt * 3.5); if (this.look) this.lookAt.lerp(this.look, Math.min(1, dt * 6));
      let ty = 0, tp = 0; if (this.lookW > 0.02 && !st.down) { body.updateWorldMatrix(true, false); inv.copy(body.matrixWorld).invert(); tgt.copy(this.lookAt).applyMatrix4(inv).sub(va.copy(O[HEAD]).setY(O[HEAD].y + 0.1)); ty = Math.atan2(tgt.x, tgt.z) * this.lookW; tp = Math.atan2(tgt.y, Math.hypot(tgt.x, tgt.z)) * this.lookW; }
      const hy = Math.max(-1.1, Math.min(1.1, ty)), hpi = Math.max(-0.45, Math.min(0.5, tp)), k = Math.min(1, dt * 3.2); st.yaw += (hy * 0.75 - st.yaw) * k; st.pitch += (hpi * 0.7 - st.pitch) * k;
      turn(UPSET, qa.setFromEuler(e1.set(0, st.yaw * 0.22, 0))); R[HEAD].premultiply(qa.setFromEuler(e1.set(-st.pitch, st.yaw * 0.78, 0, 'YXZ')));
      // a duck folds forward; a blow past what the feet hold floors them and they get up again
      const H = st.hit; if (H) { H.t += dt; if (H.t > 3.2) st.hit = null; }
      const Dk = st.duck; let de = 0; if (Dk) { Dk.t += dt; de = Dk.t < 0.16 ? sm(Dk.t / 0.16) : Dk.t < 0.8 ? 1 : 1 - sm((Dk.t - 0.8) / 0.5); if (Dk.t > 1.3) st.duck = null; else lean(0, 1, de * 0.7, de * 0.35); }
      const F = st.down; let fa = 0, fl = 0; if (F) { F.t += dt; const t = F.t; if (t < 0.55) fa = 1.45 * (t / 0.55) ** 2; else if (t < 2.7) fa = 1.45 - 0.07 * Math.max(0, Math.sin((t - 0.55) * 8)) * Math.max(0, 1 - (t - 0.55) * 2.5); else if (t < 4.3) fa = 1.45 * (1 - sm((t - 2.7) / 1.6)); else st.down = null; fl = Math.sin(Math.PI * Math.min(1, t / 0.9)); }
      if (st.down) { body.quaternion.setFromAxisAngle(ax.set(F.d.z, 0, -F.d.x), fa); body.position.y = Math.sin(fa) * 0.11; } else if (body.position.y || body.quaternion.w < 1) { body.quaternion.identity(); body.position.y = 0; }
      J[0].copy(hp).multiplyScalar(ks); fk();
      // seated at the counter: hands on it, the right one to the mouth with the chopsticks while eating; a wave is the right hand up by the head
      sticks.visible = false; const lift = seated ? SEAT - sitHip * body.scale.x : 0; inner.position.y += (lift - inner.position.y) * Math.min(1, dt * 6);
      const lt = (x, y, z) => _t.set(x, y - inner.position.y, z).divideScalar(body.scale.x);
      if (seated && this.talkT <= 0 && !st.over) { reach('L', lt(0.17, 0.99, 0.4));
        if (this.pose === 'eat') { this.eatT += dt; const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3), mouth = va.copy(J[HEAD]).add(vb.set(-0.04, 0.05, 0.19)); reach('R', lt(-0.06, 1.0, 0.42).lerp(mouth, c)); }
        else if (this.waveT <= 0) reach('R', lt(-0.17, 0.99, 0.4)); }
      // a hand to where it hurts; hands up over the head in a duck; arms thrown out in a fall
      if (H && !st.down && H.t > 0.18 && H.t < 2.9) { const w = sm((H.t - 0.18) / 0.35) * (1 - sm((H.t - 2.2) / 0.7)), bi = H.head ? HEAD : TORSO; spot.copy(J[bi]).addScaledVector(H.d, -0.15).add(_w.set(H.side === 'L' ? 0.05 : -0.05, H.head ? 0.04 : 0.2, 0)); reachW(H.side, spot, w); }
      if (de > 0) for (const s of ['L', 'R']) reachW(s, spot.copy(J[HEAD]).add(_w.set(s === 'L' ? 0.09 : -0.09, 0.1, 0.1)), de);
      if (fl > 0) for (const s of ['L', 'R']) reachW(s, spot.set(s === 'L' ? 0.5 : -0.5, 1.45, 0.2), fl * 0.8);
      // a wave where the recorded one cannot be (seated, or knocked about): the upper arm raised to the side of the head, the forearm up, the hand rocking at the wrist; the other arm still
      if (this.waveT > st.wl + 1e-3) st.wd = this.waveT; st.wl = this.waveT = Math.max(0, this.waveT - dt);
      if (st.wd > 0 && this.waveT > 0 && !st.down && !(st.over && st.over.wave)) { const e = st.wd - this.waveT, w = sm(e / 0.38) * sm(this.waveT / 0.42), s = Math.sin(e * Math.PI * 2 * 1.8) * sm((e - 0.25) / 0.25), [u, f, h] = ARM.R;
        sv[0].setFromUnitVectors(DIR(u, f), spot.set(-0.78, 0.5, 0.3).normalize()); sv[1].setFromUnitVectors(DIR(f, h), spot.set(-0.1 + s * 0.12, 1, 0.16).normalize()); sv[1].premultiply(qh.setFromAxisAngle(spot, 0.5)); sv[2].copy(sv[1]).premultiply(qh.setFromAxisAngle(ax.set(0, 0, 1), s * 0.42));
        R[u].slerp(sv[0], w); R[f].slerp(sv[1], w); R[h].slerp(sv[2], w); }
      if (this.hands) for (const s of ['L', 'R']) if (this.hands[s]) { body.updateWorldMatrix(true, false); reach(s, body.worldToLocal(_t.copy(this.hands[s]))); }   // hands held where someone's real ones are (the cook: cook.js)
      for (const s of ['L', 'R']) { const [u, f, h] = ARM[s]; J[f].copy(O[f]).sub(O[u]).applyQuaternion(R[u]).add(J[u]); J[h].copy(O[h]).sub(O[f]).applyQuaternion(R[f]).add(J[f]); }
      if (st.phys > 0) { st.phys -= dt; const h = Math.min(dt, 1 / 30);   // the limbs knocked about, springing back to where the motion has them
        for (let k = NB - 1; k > 0; k--) { const c = CH[k]; if (!c) continue; c.w.addScaledVector(c.a, -c.K * h).multiplyScalar(Math.max(0, 1 - c.C * h)); c.a.addScaledVector(c.w, h); const l = c.a.length(); if (l > c.max) { c.a.multiplyScalar(c.max / l); c.w.multiplyScalar(0.5); }
          if (l > 1e-4) { qh.setFromAxisAngle(ax.copy(c.a).normalize(), Math.min(l, c.max)); for (const i of c.set) R[i].premultiply(qh); } if (st.phys <= 0) { c.a.set(0, 0, 0); c.w.set(0, 0, 0); } }
        fk(); }
      for (let i = 0; i < NB; i++) { bones[i].position.copy(J[i]); bones[i].quaternion.copy(R[i]); }
      // the face: a blink every few seconds (both lids down and up in a sixth of a second), the jaw going while they speak or chew
      if (LID >= 0) { const hb = bones[HEAD]; if (!st.far) { if ((face.blinkT -= dt) <= 0) { face.blinkT = 2.2 + Math.random() * 4.5; face.blink = 0.17; } face.blink = Math.max(0, face.blink - dt); face.ph += dt;
          const sp = this.talkT > 0 ? (0.5 + 0.5 * Math.sin(face.ph * 13.1)) * (0.45 + 0.55 * Math.sin(face.ph * 4.3 + 1)) ** 2 * 0.16 : this.pose === 'eat' ? 0.05 * (0.5 + 0.5 * Math.sin(this.eatT * 7)) : 0; face.jaw += (sp - face.jaw) * Math.min(1, dt * 18); } else { face.blink = 0; face.jaw = 0; }
        const k = face.blink > 0 ? Math.sin(Math.PI * (1 - face.blink / 0.17)) : 0, lb = bones[LID]; lb.position.copy(va.copy(B.X[0]).sub(O[HEAD]).add(vb.set(0, -b.blink * k, 0.0025 * k)).applyQuaternion(R[HEAD]).add(J[HEAD])); lb.quaternion.copy(R[HEAD]); lb.scale.copy(hb.scale);
        if (JAWB >= 0) { const jb = bones[JAWB]; jb.position.copy(va.copy(B.X[1]).sub(O[HEAD]).applyQuaternion(R[HEAD]).add(J[HEAD])); jb.quaternion.copy(R[HEAD]).multiply(qh.setFromAxisAngle(ax.set(1, 0, 0), face.jaw)); jb.scale.copy(hb.scale); } }
      if (this.pose === 'eat' && seated && !st.over) { root.updateMatrixWorld(true); const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3), Hh = bones[ARM.R[2]].getWorldPosition(_w), Mh = bones[HEAD].getWorldPosition(new THREE.Vector3()); Mh.y += 0.06; const T = new THREE.Vector3(0.05, 1.0, 0.5).applyMatrix4(root.matrixWorld).lerp(Mh, c);
        sticks.visible = true; root.worldToLocal(sticks.position.copy(Hh).addScaledVector(va.copy(T).sub(Hh).normalize(), 0.05)); sticks.lookAt(T); } },
  };
  P.blink = () => { face.blink = 0.17; }; P.face = face; P.update(0); return P;
}
