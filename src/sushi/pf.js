// the people: Polyfork's (polyfork.dev) bodies on their 15 bones and their recorded motion (data/sushi/cast.json, from tools/sushi-cast.cjs), as THE SPECKLED BAND's are, with what the cart asks of them: walking, standing, sitting on a stool, hands that talk, a nod, a head shake, a laugh, a wave from the shoulder, a blow taken as it really lands (the struck limb and what it hangs from knocked about their joints and sprung back, a step back or a fall past what the feet can hold, a hand to where it hurts, a duck), marks on their clothes, chopsticks to the mouth, a head that turns to what it looks at, eyes that blink
import * as THREE from 'three';
import { mat } from './ctx.js';

// who can be at the cart: [sex, voice, pitch, youngest, oldest, what they do] (the voice names are worker/door.js's /sushi/say)
export const PF = {
  carving_chef: ['m', 'zeus', 0.96, 45, 60, 'the cook'],
  // the block's regulars (block.js)
  fruitseller: ['m', 'zeus', 0.95, 58, 67, ''],
  passenger: ['f', 'hera', 0.97, 55, 63, ''],
  doorman: ['m', 'arcas', 0.96, 46, 55, ''],
  station_master: ['f', 'stella', 0.98, 36, 44, ''],
  salaryman_commuter: ['m', 'perseus', 1, 32, 40, ''],
  standing_worker_on_a_call: ['m', 'orpheus', 1.03, 21, 27, ''],
  diner_waitress: ['f', 'asteria', 1.02, 22, 28, ''],
  room_attendant: ['f', 'luna', 1, 24, 30, ''],
  barista: ['m', 'orion', 1, 27, 34, ''],
  cocktail_server: ['f', 'athena', 1, 30, 38, ''],
  // whoever else comes by for a bowl
  commuter: ['m', 'perseus', 1, 30, 50, 'an accountant in Midtown, on the late train home'],
  tour_guide: ['m', 'orion', 1, 28, 45, 'a guide for the bus tours round Manhattan'],
  construction_worker: ['m', 'angus', 0.96, 25, 50, 'an ironworker on a tower going up on Broadway'],
  site_manager: ['m', 'arcas', 0.96, 40, 58, 'the foreman on a building site two blocks down'],
  firefighter: ['m', 'zeus', 0.98, 28, 50, 'a firefighter at the engine company on West 67th'],
  trucker: ['m', 'angus', 0.94, 35, 60, 'a truck driver who just brought a load into the city'],
  delivery_courier: ['m', 'orpheus', 1.04, 19, 28, 'a bicycle messenger who runs papers across Midtown'],
  valet_attendant: ['f', 'luna', 1.02, 20, 30, 'a parking valet at the hotel on Central Park South'],
  suburban_resident: ['m', 'perseus', 0.98, 35, 55, 'a schoolteacher from Jersey in the city for a show'],
  parent_chaperone: ['f', 'stella', 0.98, 35, 50, 'a mother in town with her family for the weekend'],
  seated_office_worker: ['m', 'orion', 1, 25, 45, 'a clerk at an insurance company, working late'],
  tradesman: ['m', 'arcas', 0.95, 40, 60, 'a plumber coming off an emergency call'],
  graffiti_artist: ['m', 'orpheus', 1.05, 17, 24, 'a kid from the Bronx who paints subway cars'],
  doctor: ['m', 'zeus', 0.97, 35, 60, 'a resident doctor at Roosevelt Hospital, off a double shift'],
  paramedic: ['m', 'perseus', 1.02, 25, 40, 'an EMS paramedic between calls'],
  lounge_crooner: ['m', 'helios', 1, 30, 45, 'an Elvis impersonator who sings at weddings'],
  bellhop: ['m', 'orpheus', 1.04, 18, 25, 'a bellhop at the hotel round the corner'],
  student_in_a_hoodie: ['f', 'luna', 1.03, 18, 23, 'a student at Juilliard, up the road at Lincoln Center'],
  cafe_customer: ['f', 'stella', 1, 25, 40, 'a secretary at an ad agency on Madison Avenue'],
  spectator: ['f', 'asteria', 1.02, 20, 35, 'just out of a Knicks game at the Garden'],
  grandmother_in_a_rebozo: ['f', 'hera', 0.95, 60, 75, 'a grandmother on her way home from the night shift cleaning offices'],
  flight_attendant: ['f', 'athena', 1, 25, 40, 'a flight attendant with Pan Am, in from a long flight'],
  school_teacher: ['m', 'arcas', 0.97, 35, 55, 'a teacher at a public school on the Upper West Side'],
};
export const CUSTOMERS = Object.keys(PF).filter((k) => PF[k][5] && k !== 'carving_chef');

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)), i16 = (s) => new Int16Array(b64(s).buffer), u16 = (s) => new Uint16Array(b64(s).buffer);
const lin = (C, n) => { const out = new Float32Array(n), c = new THREE.Color(); for (let i = 0; i < n; i += 3) { c.setRGB(C[i] / 255, C[i + 1] / 255, C[i + 2] / 255, THREE.SRGBColorSpace); out[i] = c.r; out[i + 1] = c.g; out[i + 2] = c.b; } return out; };
let D = null, MAT = null, BONES, NB, PI, HEAD, TORSO, CL; const GEO = {};
const PARENT = { torso: 'hips', head: 'torso', upperArmL: 'torso', upperArmR: 'torso', forearmL: 'upperArmL', forearmR: 'upperArmR', handL: 'forearmL', handR: 'forearmR', thighL: 'hips', thighR: 'hips', shinL: 'thighL', shinR: 'thighR', shoeL: 'shinL', shoeR: 'shinR' };
export async function loadCast(url) {
  D = await (await fetch(url)).json(); MAT = mat({ vertexColors: true, flatShading: true });
  BONES = D.bones; NB = BONES.length; PI = BONES.map((n) => (PARENT[n] ? BONES.indexOf(PARENT[n]) : -1)); HEAD = BONES.indexOf('head'); TORSO = BONES.indexOf('torso');
  CL = {}; for (const s of ['m', 'f']) { CL[s] = {}; for (const [n, c] of Object.entries(D.clips[s])) CL[s][n] = { ...c, Q: Float32Array.from(c.q), P: Float32Array.from(c.p) }; }
  return Object.keys(D.bodies);
}
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3(), e1 = new THREE.Euler(), m1 = new THREE.Matrix4(), _w = new THREE.Vector3(), _t = new THREE.Vector3();
const sample = (c, t, loop, i, q, p) => { const f = loop ? (((t / c.dur) % 1) + 1) % 1 * c.n : Math.max(0, Math.min(c.n - 1.001, (t / c.dur) * c.n)), a = Math.floor(f) % c.n, b = loop ? (a + 1) % c.n : Math.min(c.n - 1, a + 1), x = f - Math.floor(f), A = (a * NB + i) * 4, B = (b * NB + i) * 4;
  q.set(c.Q[A], c.Q[A + 1], c.Q[A + 2], c.Q[A + 3]); qb.set(c.Q[B], c.Q[B + 1], c.Q[B + 2], c.Q[B + 3]); q.slerp(qb, x);
  if (p) { const C = (a * NB + i) * 3, E = (b * NB + i) * 3; p.set(c.P[C], c.P[C + 1], c.P[C + 2]); vb.set(c.P[E], c.P[E + 1], c.P[E + 2]); p.lerp(vb, x); } };
const geoOf = (key) => { if (GEO[key]) return GEO[key]; const b = D.bodies[key], Q = i16(b.pos), n = Q.length / 3, P = new Float32Array(Q.length); for (let i = 0; i < Q.length; i++) P[i] = (Q[i] + 32500) * b.sc + b.lo[i % 3];
  const BN = b64(b.bone), BW = b64(b.w), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4); for (let v = 0; v < n; v++) { si[v * 4] = BN[v * 2]; si[v * 4 + 1] = BN[v * 2 + 1]; sw[v * 4] = BW[v] / 255; sw[v * 4 + 1] = 1 - BW[v] / 255; }
  // what a body was modelled holding (a pie, a knife, plans, a cup, a tool) is left out: the mesh in pieces that touch; a piece held rigid by one forearm or hand that sits past the wrist or off the arm's line goes (a hand, a glove or a cuff bends with the wrist or lies along the arm, and stays)
  const ARMB = { [BONES.indexOf('forearmL')]: 'L', [BONES.indexOf('handL')]: 'L', [BONES.indexOf('forearmR')]: 'R', [BONES.indexOf('handR')]: 'R' }, T0 = u16(b.tri), up = new Int32Array(n), weld = new Map(), id = (v) => { const k = Math.round(P[v * 3] * 500) + ',' + Math.round(P[v * 3 + 1] * 500) + ',' + Math.round(P[v * 3 + 2] * 500); let i = weld.get(k); if (i == null) weld.set(k, i = v); return i; };
  for (let v = 0; v < n; v++) up[v] = v; const top = (v) => { while (up[v] !== v) v = up[v] = up[up[v]]; return v; };
  for (let i = 0; i < T0.length; i += 3) { const a = top(id(T0[i])); for (const v of [T0[i + 1], T0[i + 2]]) { const c = top(id(v)); if (c !== a) up[c] = a; } }
  const piece = new Map(); for (let v = 0; v < n; v++) { const r = top(id(v)); let q = piece.get(r); if (!q) piece.set(r, q = { bone: BN[v * 2], rigid: true, c: [0, 0, 0], k: 0 }); if (BN[v * 2] !== q.bone || BW[v] < 250) q.rigid = false; for (let a = 0; a < 3; a++) q.c[a] += P[v * 3 + a]; q.k++; }
  const AX = {}; for (const s of ['L', 'R']) { const S = b.origin[BONES.indexOf('upperArm' + s)], W = b.origin[BONES.indexOf('hand' + s)], d = [W[0] - S[0], W[1] - S[1], W[2] - S[2]], l = Math.hypot(...d); AX[s] = { S, d: d.map((x) => x / l), l }; }
  for (const q of piece.values()) { const s = ARMB[q.bone]; q.drop = false; if (!s || !q.rigid) continue; const A = AX[s], c = q.c.map((x) => x / q.k - 0), r = [c[0] - A.S[0], c[1] - A.S[1], c[2] - A.S[2]], t = r[0] * A.d[0] + r[1] * A.d[1] + r[2] * A.d[2], off = Math.hypot(r[0] - A.d[0] * t, r[1] - A.d[1] * t, r[2] - A.d[2] * t); q.drop = t > A.l - 0.02 || off > 0.1; }
  const held = (v) => piece.get(top(id(v))).drop;
  const keep = []; for (let i = 0; i < T0.length; i += 3) if (!held(T0[i])) keep.push(T0[i], T0[i + 1], T0[i + 2]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(lin(b64(b.vcol), Q.length), 3)); g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4)); g.setIndex(new THREE.BufferAttribute(new Uint16Array(keep), 1)); g.computeVertexNormals();
  // the face: the nose is the head's foremost point; the eyes sit above it, either side
  const O = b.origin; let face = null; { let zm = -9, ny = 0; for (let v = 0; v < n; v++) if (BN[v * 2] === HEAD && BW[v] > 200 && Math.abs(P[v * 3]) < 0.03 && P[v * 3 + 1] < O[HEAD][1] + 0.2 && P[v * 3 + 2] > zm) { zm = P[v * 3 + 2]; ny = P[v * 3 + 1]; }
    const zs = []; for (let v = 0; v < n; v++) if (BN[v * 2] === HEAD && BW[v] > 200 && Math.abs(P[v * 3]) > 0.025 && Math.abs(P[v * 3]) < 0.07 && Math.abs(P[v * 3 + 1] - ny - 0.04) < 0.05) zs.push(P[v * 3 + 2]); zs.sort((a, c) => c - a); if (zs.length) face = [0.036, ny + 0.042, zs[0] - 0.006]; }
  return (GEO[key] = { g, face }); };

const ER = 0.015; let EYE = null;
const eyeball = () => { EYE ||= { white: mat({ color: 0xf2efe6 }), iris: mat({ color: 0x4a3a2a }), pupil: new THREE.MeshBasicMaterial({ color: 0x0a0806 }), wg: new THREE.SphereGeometry(ER, 10, 8), ig: new THREE.CircleGeometry(ER * 0.56, 12), pg: new THREE.CircleGeometry(ER * 0.27, 10), lg: new THREE.SphereGeometry(ER * 1.09, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), lid: mat({ color: 0xd9a98a }) };
  const g = new THREE.Group(); g.add(new THREE.Mesh(EYE.wg, EYE.white)); const ir = new THREE.Mesh(EYE.ig, EYE.iris); ir.position.z = ER * 0.86; g.add(ir); const pu = new THREE.Mesh(EYE.pg, EYE.pupil); pu.position.z = ER * 0.875; g.add(pu); return g; };
const GEST = { nod: 'Agree', no: 'Head shake', laugh: 'Laughing', shrug: 'Arms folded', think: 'Arms folded' }, UPPER = ['torso', 'head', 'upperArmL', 'forearmL', 'handL', 'upperArmR', 'forearmR', 'handR'];
const SEAT = 0.79; // where a hip sits on the cart's stools
// each limb about its own joint, with all it carries: moment of inertia (kg m²), how hard muscle pulls it back, how far it can go
const LIMBS = { head: [0.06, 70, 0.7], torso: [3, 28, 0.5], upperArm: [0.35, 35, 1], forearm: [0.07, 45, 1], hand: [0.006, 80, 0.6], thigh: [2, 90, 0.35], shin: [0.25, 90, 0.4] };
const STEP_J = 0.8, FALL_J = 4, FALL_HEAD_J = 3; // a push (N s) the feet answer with a step back; one they cannot hold
const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); let SPOT = null; const ray = new THREE.Raycaster();

// a person: P.root to place and turn; P.pose 'walk' | 'stand' | 'sit' | 'eat'; P.look a point to look at or null; P.talkT seconds of talking hands; P.gesture(name); P.waveT > 0 waves; P.push(bone, impulse, at) a blow on a limb (P.hit(dir, at, f) the same by strength); P.duck(); P.down() while knocked down; P.stain(at, color, r)
export function pfPerson(key, sticks) {
  const b = D.bodies[key], [sex] = PF[key] || ['m'], clips = CL[sex], SK = D.skel[sex], ks = b.hipY / SK.hipY, { g: geo, face } = geoOf(key);
  const root = new THREE.Group(), inner = new THREE.Group(), body = new THREE.Group(); root.add(inner); inner.add(body);
  const O = b.origin.map((v) => new THREE.Vector3(...v)), bones = BONES.map((n) => Object.assign(new THREE.Bone(), { name: n })), mesh = new THREE.SkinnedMesh(geo, MAT);
  bones.forEach((bn, i) => { bn.position.copy(O[i]); body.add(bn); }); mesh.bind(new THREE.Skeleton(bones, O.map((v) => new THREE.Matrix4().makeTranslation(-v.x, -v.y, -v.z))), new THREE.Matrix4()); mesh.frustumCulled = false; body.add(mesh);
  const RI = b.rest.map((r) => new THREE.Quaternion().setFromRotationMatrix(m1.makeBasis(va.set(r[0], r[1], r[2]), vb.set(r[3], r[4], r[5]), _w.set(r[6], r[7], r[8]))).invert());
  const ix = (n) => BONES.indexOf(n), ARM = { L: [ix('upperArmL'), ix('forearmL'), ix('handL')], R: [ix('upperArmR'), ix('forearmR'), ix('handR')] }, UP = UPPER.map(ix);
  const DIR = (a, c) => O[c].clone().sub(O[a]).normalize(), LEN = (a, c) => O[c].distanceTo(O[a]);
  let eyes = null; if (face) { const [ex, ey, ez] = face; eyes = [-1, 1].map((sx) => { const e = eyeball(); e.position.set(sx * ex, ey, ez).sub(O[HEAD]); bones[HEAD].add(e); const lid = new THREE.Mesh(EYE.lg, EYE.lid); lid.rotation.x = -1.5; lid.position.copy(e.position); bones[HEAD].add(lid); e.userData.lid = lid; return e; }); }
  const sitHip = O[0].y + (clips.Sitting ? clips.Sitting.P[1] : -0.34) * ks;
  const st = { cur: { c: clips.Idle, t: Math.random() * 5, loop: true }, prev: null, fade: 0, fade0: 1, over: null, yaw: 0, pitch: 0, ey: 0, ep: 0, blink: 1 + Math.random() * 3, lid: 0, sac: 0, sx: 0, sy: 0, base: 'Idle', fold: 0, hit: null, down: null, duck: null, push: null, wd: 0, wl: 0, phys: 0 };
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
  const lean = (x, z, a, head) => { qh.setFromAxisAngle(ax.set(z, 0, -x).normalize(), a); for (const i of UP) R[i].premultiply(qh); if (head) R[HEAD].premultiply(qh.setFromAxisAngle(ax, head)); };   // the trunk, head and arms tipped as one toward (x, z)
  const P = {
    root, sticks, style: key, sex, pose: 'stand', speed: 1.3, look: null, lookW: 0, lookAt: new THREE.Vector3(), waveT: 0, eatT: Math.random() * 3, talkT: 0, habitT: 4 + Math.random() * 8, mood: 0, polyfork: true, bones,
    // an impulse imp (world, N s) landing at at on the named bone: it and each limb it hangs from turn about their joints by r × imp / I and spring back; the feet answer what reaches the hips
    push(name, imp, at) {
      body.updateWorldMatrix(true, false); inv.copy(body.matrixWorld).invert(); body.getWorldQuaternion(qh).invert();
      const j = imp.clone().applyQuaternion(qh), a = at.clone().applyMatrix4(inv), seated = this.pose === 'sit' || this.pose === 'eat', r = new THREE.Vector3(); let i = BONES.indexOf(name); if (i < 0) i = TORSO;
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
    gesture(name) { const c = clips[GEST[name]]; if (c && this.pose !== 'walk') st.over = { c, t: 0, w: 0, end: Math.min(c.dur, name === 'laugh' ? 3.2 : c.dur) }; if (name === 'wave') this.waveT = 1.6; },
    update(dt) {
      const seated = this.pose === 'sit' || this.pose === 'eat';
      this.talkT = Math.max(0, this.talkT - dt); if (st.fold > 0) st.fold -= dt;
      for (let i = stains.length - 1; i >= 0; i--) { const s = stains[i]; s.life -= dt; s.m.material.opacity = 0.85 * Math.min(1, s.life / 25); if (s.life <= 0) { s.m.removeFromParent(); s.m.material.dispose(); stains.splice(i, 1); } }
      if (st.push) { st.push.t -= dt; root.position.addScaledVector(st.push.v, dt * 2 * Math.max(0, st.push.t / 0.7)); if (st.push.t <= 0) st.push = null; }   // a stagger: steps back the way the blow went
      if (!seated && this.pose === 'stand' && this.talkT <= 0 && (this.habitT -= dt) <= 0) { this.habitT = 9 + Math.random() * 14; st.fold = 4 + Math.random() * 4; }
      const want = this.pose === 'walk' || st.push ? 'Walk' : seated ? (this.talkT > 0 ? 'Sitting talking' : 'Sitting') : this.talkT > 0 ? 'Talking' : st.fold > 0 ? 'Arms folded' : 'Idle'; play(want);
      const rate = st.push ? -0.9 : this.pose === 'walk' && st.cur.c.speed ? this.speed / st.cur.c.speed : 1; st.cur.t += dt * rate; if (st.prev) { st.prev.t += dt; st.fade -= dt; if (st.fade <= 0) st.prev = null; }
      const w = st.prev ? 1 - st.fade / st.fade0 : 1;
      for (let i = 0; i < NB; i++) { sample(st.cur.c, st.cur.t, st.cur.loop, i, R[i], i ? null : hp); if (st.prev) { sample(st.prev.c, st.prev.t, st.prev.loop, i, qa, i ? null : hq); qa.slerp(R[i], w); R[i].copy(qa); if (!i) hp.lerpVectors(hq, hp, w); } R[i].multiply(RI[i]); }
      // a gesture over the trunk, arms and head, eased in and out
      const o = st.over; if (o) { o.t += dt; o.w = Math.min(1, o.t / 0.3, (o.end - o.t) / 0.4); if (o.t >= o.end) st.over = null; else for (const i of UP) { sample(o.c, o.t, false, i, qa, null); qa.multiply(RI[i]); R[i].slerp(qa, Math.max(0, o.w)); } }
      // where to look: yaw and pitch in the body's own space, as far as a neck goes
      this.lookW += ((this.look ? 1 : 0) - this.lookW) * Math.min(1, dt * 3.5); if (this.look) this.lookAt.lerp(this.look, Math.min(1, dt * 6));
      let ty = 0, tp = 0; if (this.lookW > 0.02 && !st.down) { body.updateWorldMatrix(true, false); inv.copy(body.matrixWorld).invert(); tgt.copy(this.lookAt).applyMatrix4(inv).sub(va.copy(O[HEAD]).setY(O[HEAD].y + 0.12)); ty = Math.atan2(tgt.x, tgt.z) * this.lookW; tp = Math.atan2(tgt.y, Math.hypot(tgt.x, tgt.z)) * this.lookW; }
      const hy = Math.max(-1.1, Math.min(1.1, ty)), hpi = Math.max(-0.45, Math.min(0.5, tp)), k = Math.min(1, dt * 3.2); st.yaw += (hy * 0.75 - st.yaw) * k; st.pitch += (hpi * 0.7 - st.pitch) * k;
      R[TORSO].premultiply(qa.setFromEuler(e1.set(0, st.yaw * 0.22, 0))); R[HEAD].premultiply(qa.setFromEuler(e1.set(-st.pitch, st.yaw, 0, 'YXZ')));
      // a duck folds forward; a blow past what the feet hold floors them and they get up again
      const H = st.hit; if (H) { H.t += dt; if (H.t > 3.2) st.hit = null; }
      const D = st.duck; let de = 0; if (D) { D.t += dt; de = D.t < 0.16 ? sm(D.t / 0.16) : D.t < 0.8 ? 1 : 1 - sm((D.t - 0.8) / 0.5); if (D.t > 1.3) st.duck = null; else lean(0, 1, de * 0.7, de * 0.35); }
      const F = st.down; let fa = 0, fl = 0; if (F) { F.t += dt; const t = F.t; if (t < 0.55) fa = 1.45 * (t / 0.55) ** 2; else if (t < 2.7) fa = 1.45 - 0.07 * Math.max(0, Math.sin((t - 0.55) * 8)) * Math.max(0, 1 - (t - 0.55) * 2.5); else if (t < 4.3) fa = 1.45 * (1 - sm((t - 2.7) / 1.6)); else st.down = null; fl = Math.sin(Math.PI * Math.min(1, t / 0.9)); }
      if (st.down) { body.quaternion.setFromAxisAngle(ax.set(F.d.z, 0, -F.d.x), fa); body.position.y = Math.sin(fa) * 0.11; } else if (body.position.y || body.quaternion.w < 1) { body.quaternion.identity(); body.position.y = 0; }
      J[0].copy(hp).multiplyScalar(ks).add(O[0]); for (let i = 1; i < NB; i++) { const p = PI[i]; J[i].copy(O[i]).sub(O[p]).applyQuaternion(R[p]).add(J[p]); }
      // seated at the counter: hands on it, the right one to the mouth with the chopsticks while eating; a wave is the right hand up by the head
      sticks.visible = false; const lift = seated ? SEAT - sitHip : 0; inner.position.y += (lift - inner.position.y) * Math.min(1, dt * 6);
      const lt = (x, y, z) => _t.set(x, y - inner.position.y, z);
      if (seated && this.talkT <= 0 && !st.over) { reach('L', lt(0.17, 0.99, 0.4));
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
      for (const s of ['L', 'R']) { const [u, f, h] = ARM[s]; J[f].copy(O[f]).sub(O[u]).applyQuaternion(R[u]).add(J[u]); J[h].copy(O[h]).sub(O[f]).applyQuaternion(R[f]).add(J[f]); }
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
  P.update(0); return P;
}
