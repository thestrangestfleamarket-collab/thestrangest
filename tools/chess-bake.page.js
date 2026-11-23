// SKIRMISH TABLE's bake, the part that runs in a browser (tools/chess-bake.cjs): each unit type as one thinned skinned mesh on one shared picture, and the clips it plays
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';

// The people are Microsoft Rocketbox bodies (MIT; tools/chess-people.py), each put onto the bones the clips were made for (Quaternius' Universal Animation Library, CC0): the body is stood as those bones stand at rest, the bones moved to its own joints, its fingers left to the hand.
// Its modern clothes are painted over in the picture (PAINT: the photograph's own folds kept, the cloth's colour and weave replaced by a photographed one) and covered by things made here on its own shape (WEAR) and things held or carried (gear).
// body: its file in data/full/chess/people/; k: its size beside the others; drop: which of its materials are left out; tris: what each material's part is thinned to; cut: body regions left out (hidden under what it wears)
const A = 'torso arm leg foot', CLOTHES = 'torso arm leg';
const SPEC = {
  bulwark:   { body: 'knight', drop: /pistol|shotgun|machinegun|opacity/, tris: { body: 1050, head: 300, helmet: 280, equipment: 220 } },
  lancer:    { body: 'berserker', k: 1.03 },
  strider:   { body: 'rogue', k: 0.97 },
  slinger:   { body: 'archer', k: 0.95, drop: /opacity/ },
  ember:     { body: 'firemage', tris: { body: 1200, head: 520, keffiyeh: 300 } },
  mender:    { body: 'cleric', k: 0.94, drop: /opacity/ },
  hexbinder: { body: 'enchanter', k: 0.94, drop: /opacity/ },
  alchemist: { body: 'alchemist', drop: /opacity/ },
  necro:     { body: 'necro', k: 0.96, drop: /opacity/, tris: { body: 1450, head: 460 } },
  captain:   { body: 'captain', k: 1.02, tris: { body: 1100, head: 520, helmet: 260 } },
  ogre:      { body: 'ogre', k: 1.27, shape: 'ogre' },
  ghost:     { body: 'ghost', drop: /opacity/, tris: { color: 1900 }, fade: true, small: true },
};
const TRIS = { body: 1250, head: 600 }, OTHER = 220;   // what a material's part is thinned to unless its row says
// Rocketbox's bones (3ds Max's Biped) and the clips' bones
const MAPB = { Pelvis: 'pelvis', Spine: 'spine_01', Spine1: 'spine_02', Spine2: 'spine_03', Neck: 'neck_01', Head: 'Head' };
for (const [s, t] of [['L', 'l'], ['R', 'r']]) Object.assign(MAPB, { [s + '_Clavicle']: 'clavicle_' + t, [s + '_UpperArm']: 'upperarm_' + t, [s + '_Forearm']: 'lowerarm_' + t, [s + '_Hand']: 'hand_' + t, [s + '_Thigh']: 'thigh_' + t, [s + '_Calf']: 'calf_' + t, [s + '_Foot']: 'foot_' + t, [s + '_Toe0']: 'ball_' + t });
const REGION = n => (/Head|neck/.test(n) ? 'head' : /hand/.test(n) ? 'hand' : /upperarm|lowerarm/.test(n) ? 'arm' : /thigh|calf/.test(n) ? 'leg' : /foot|ball/.test(n) ? 'foot' : 'torso');
// which way each limb is stood: [Rocketbox's bone, the one after it, the clips' bone, the one after it]
const LIMBS = [['UpperArm', 'Forearm', 'upperarm', 'lowerarm'], ['Forearm', 'Hand', 'lowerarm', 'hand'], ['Hand', 'Finger2', 'hand', 'middle_01'], ['Thigh', 'Calf', 'thigh', 'calf'], ['Calf', 'Foot', 'calf', 'foot'], ['Foot', 'Toe0', 'foot', 'ball']];

const CRE = {
  // Rocketbox's German shepherd as a wolf: its own body and bones, its coat turned grey, moved by Quaternius' wolf's clips (dogAsWolf)
  wolf: { make: 'dogAsWolf', map: 512, long: 1.08, tris: 2300, paint: { to: 0x9a9890, gamma: 0.85, lo: 0.3, hi: 1.9, mix: 0.9 }, collar: ['dog_Neck1', 0.1, 0.022, [0, 0, 0], 1.15], clips: { Idle: 'Idle', Walk: 'Gallop', Attack: 'Attack', Hit: 'Idle_HitReact1', Death: 'Death' } },
  // the Darwin Museum's scanned iguana (tools/chess-whelp.cjs) given bones, wings and clips here (iguanaWhelp); it flies
  whelp: { make: 'iguanaWhelp', map: 512, long: 0.97, tris: 2100, midx: true, tail: [['tail2', [0, 1, 0], -0.5], ['tail3', [0, 1, 0], -0.75], ['tail4', [0, 1, 0], -0.8], ['tail5', [0, 1, 0], -0.75], ['tail6', [0, 1, 0], -0.6]], collar: ['neck', 0.05, 0.012, [0, 0, 0], 1.1], clips: {} },
};
const CLIPS = ['Sword_Idle', 'Idle_Loop', 'Idle_Shield_Loop', 'Zombie_Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sword_Attack', 'Sword_Regular_B', 'TreeChopping_Loop', 'Punch_Jab',
  'Pistol_Shoot', 'Spell_Simple_Shoot', 'Interact', 'OverhandThrow', 'Zombie_Scratch', 'Hit_Chest', 'Hit_Head', 'Death01'];
// when each strike lands, seconds into its clip: as measured on the first figures these clips were given to (22 Nov 2026), kept so every effect still meets its blow
const LANDS = { Sword_Attack: 0.9, Sword_Regular_B: 0.4, TreeChopping_Loop: 0.17, Punch_Jab: 0.2, Pistol_Shoot: 0, Spell_Simple_Shoot: 0, Interact: 0.7, OverhandThrow: 0.4, Zombie_Scratch: 0.6 };
// Rocketbox's own motion, put onto the clips' bones: our name, its file, the body it is read on
const RB = { Real_Idle: ['a_m_idle', 'rogue'], Real_Walk: ['a_m_walk', 'rogue'], Real_Run: ['a_m_run', 'rogue'], Real_IdleF: ['a_f_idle', 'archer'], Real_WalkF: ['a_f_walk', 'archer'] };
const WALKS = ['Walk_Loop', 'Jog_Fwd_Loop', 'Real_Walk', 'Real_Run', 'Real_WalkF'], STRIKES = ['Sword_Attack', 'Sword_Regular_B', 'TreeChopping_Loop', 'Punch_Jab', 'Pistol_Shoot', 'Spell_Simple_Shoot', 'Interact', 'OverhandThrow', 'Zombie_Scratch'], FPS = 15;
// the one picture every figure is drawn from: each material's own picture gets a square of it as it is first met (alloc); a surface (Poly Haven, ambientCG) a small one
const W = 2048, H = 2816, CELL = {};
const slots = { 512: [], 256: [], 128: [] };
for (let y = 0; y < 2048; y += 512) for (let x = 0; x < W; x += 512) slots[512].push([x, y, 512]);
for (let y = 2048; y < H; y += 256) for (let x = 0; x < W; x += 256) slots[256].push([x, y, 256]);
const alloc = (name, size) => { if (CELL[name]) return CELL[name]; if (size === 256 && !slots[256].length) { const [x, y] = slots[512].pop(); for (const [a, b] of [[0, 0], [256, 0], [0, 256], [256, 256]]) slots[256].push([x + a, y + b, 256]); } if (size === 128 && !slots[128].length) { const [x, y] = alloc('quarter' + Object.keys(CELL).length, 256); for (const [a, b] of [[0, 0], [128, 0], [0, 128], [128, 128]]) slots[128].push([x + a, y + b, 128]); } const c = slots[size].shift(); if (!c) throw new Error('the picture is full: ' + name); return (CELL[name] = c); };
// a surface: how bright it is made, how deep its relief is painted in, how much of its colour is taken out
const SURF = { dye: [0.6, 1.2, 1], steel: [0.62, 0.8, 0.9], chain: [0.5, 1.2, 1], leather: [0.5, 1, 0.2], wool: [0.7, 1.1, 1], cloth: [0.82, 1, 0.9], sack: [0.7, 1, 0.6], wood: [0.5, 1, 0.3], bone: [0.86, 1.1, 0.2], hide: [0.7, 0.9, 0], fur: [0.78, 1.2, 0.85] };

const FROM = { dye: 'wool' };   // a surface made from another's files
const BONE = { color: new THREE.Color(0xf2e8d0), lay: 'bone', metres: 0.3 };
const mat = (color, glow = 0) => ({ color: new THREE.Color(color).multiplyScalar(1 + glow) });
const on = (lay, color = 0xffffff, metres = 0.6, more) => ({ color: new THREE.Color(color), lay, metres, ...more });
const TEAM = { color: new THREE.Color(1, 1, 1), trim: true }, TEAMCLOTH = { color: new THREE.Color(1, 1, 1), trim: true, lay: 'dye', metres: 0.5 };   // drawn in its side's colour by the page (the point colour's fourth number is low)
const FUR = on('fur', 0x7a6650, 0.5), steel = on('steel', 0xd4d8de, 0.4), iron = on('steel', 0x8a8d92, 0.4), darkWood = on('wood', 0xb89a80, 0.5), leather = on('leather', 0xc8a888, 0.4), darkLeather = on('leather', 0x8a7460, 0.4), brass = on('steel', 0xd8b060, 0.4);
const part = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial()); o.userData.flat = m.color; o.userData.trim = !!m.trim; o.userData.lay = m.lay ? m : null; o.position.set(x, y, z); return o; };

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const hash = (x, y, z, s = 0) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 13.37) * 43758.5453; return h - Math.floor(h); };
// the built creatures' pieces: a bar from a to b, a ball, a boulder (a faceted lump, squared off, every point pushed in or out a little)
function bar(a, b, r0, r1, m, sides = 6) { const d = b.clone().sub(a), len = d.length(), o = part(new THREE.CylinderGeometry(r1, r0, len, sides, 1), m, 0, 0, 0); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; }
function ball(at, rx, ry, rz, m, w = 8, h = 6) { const o = part(new THREE.SphereGeometry(1, w, h), m, at.x, at.y, at.z); o.scale.set(rx, ry, rz); return o; }
function rock(at, rx, ry, rz, m, seed, detail = 1, q) {
  const g = new THREE.IcosahedronGeometry(1, detail), P = g.attributes.position, v = V();
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const k = 0.84 + 0.3 * hash(Math.round(v.x * 50), Math.round(v.y * 50), Math.round(v.z * 50), seed);
    v.set(Math.sign(v.x) * Math.abs(v.x) ** 0.7, Math.sign(v.y) * Math.abs(v.y) ** 0.7, Math.sign(v.z) * Math.abs(v.z) ** 0.7).multiplyScalar(k); P.setXYZ(i, v.x, v.y, v.z); }
  const o = part(g, m, at.x, at.y, at.z); o.scale.set(rx, ry, rz); if (q) o.quaternion.copy(q); else o.rotation.set(hash(seed, 1, 2) * 0.5 - 0.25, hash(seed, 3, 4) * 0.8, hash(seed, 5, 6) * 0.5 - 0.25); return o;
}
const along = (a, b, r, m, seed, grow = 1) => { const d = b.clone().sub(a), len = d.length(); return rock(a.clone().addScaledVector(d, 0.5), r, len / 2 * grow, r, m, seed, 1, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); };
const ring = (at, r, tube, m, axis, squash = 1, sides = 12) => { const o = part(new THREE.TorusGeometry(r, tube, 4, sides), m, at.x, at.y, at.z); o.quaternion.setFromUnitVectors(V(0, 0, 1), axis.clone().normalize()); o.scale.set(1, squash, 1); return o; };

const wp = o => new THREE.Vector3().setFromMatrixPosition(o.matrixWorld), wq = o => o.getWorldQuaternion(new THREE.Quaternion());
const short = n => n.replace(/^Bip01_?/, '');
// the clips' own bones as they stand at rest, without the fingers (the hand carries them), and where every one of them is
async function rigOf() {
  const scene = (await load('characters/animations.glb')).scene; scene.updateMatrixWorld(true);
  let root; scene.traverse(o => { if (o.name === 'root') root = o; });
  const up = {}; root.traverse(o => { up[o.name] = wp(o); });
  const top = new THREE.Group(); top.name = 'rig'; root.parent.matrixWorld.decompose(top.position, top.quaternion, top.scale);
  const mk = (o, to) => { if (/thumb|index|middle|ring|pinky|leaf/.test(o.name)) return; const b = new THREE.Bone(); b.name = o.name; b.position.copy(o.position); b.quaternion.copy(o.quaternion); b.scale.copy(o.scale); to.add(b); for (const c of o.children) mk(c, b); };
  mk(root, top); top.updateMatrixWorld(true);
  const bones = []; top.traverse(o => { if (o.isBone) bones.push(o); });
  return { top, bones, up };
}
// a Rocketbox body, turned to face +Z and stood as the clips' bones stand at rest: its limbs turned onto theirs, the hand's palm onto theirs
async function standAs(file, up) {
  const src = (await load('people/' + file + '.glb')).scene; src.updateMatrixWorld(true);
  const sm = []; src.traverse(o => { if (o.isSkinnedMesh) sm.push(o); });
  const S = {}; for (const b of sm[0].skeleton.bones) S[short(b.name)] = b;
  const rest = {}; { const f = wp(S.L_Toe0).sub(wp(S.L_Foot)); src.rotation.y = -Math.atan2(f.x, f.z); src.updateMatrixWorld(true); }
  if (Math.sign(wp(S.L_Thigh).x) !== Math.sign(up.thigh_l.x)) throw new Error(file + ': its left is the clips\' right');
  const turn = (b, q) => { b.quaternion.copy(wq(b.parent).invert().multiply(q).multiply(wq(b))); src.updateMatrixWorld(true); };
  let twist = 0;
  for (const [s, t] of [['L', 'l'], ['R', 'r']]) {
    for (const [a, c, ua, uc] of LIMBS) turn(S[s + '_' + a], new THREE.Quaternion().setFromUnitVectors(wp(S[s + '_' + c]).sub(wp(S[s + '_' + a])).normalize(), up[uc + '_' + t].clone().sub(up[ua + '_' + t]).normalize()));
    // the palm: the way from the first finger's root to the last, turned about the hand's own line onto the clips'
    const h = S[s + '_Hand'], ax = up['middle_01_' + t].clone().sub(up['hand_' + t]).normalize(), flat = v => v.addScaledVector(ax, -v.dot(ax)).normalize();
    const a = flat(wp(S[s + '_Finger4']).sub(wp(S[s + '_Finger1']))), b = flat(up['pinky_01_' + t].clone().sub(up['index_01_' + t])), ang = Math.atan2(a.clone().cross(b).dot(ax), a.dot(b));
    turn(S[s + '_Forearm'], new THREE.Quaternion().setFromAxisAngle(up['hand_' + t].clone().sub(up['lowerarm_' + t]).normalize(), ang * 0.5)); turn(h, new THREE.Quaternion().setFromAxisAngle(ax, ang * 0.5)); twist = Math.max(twist, Math.abs(ang));
  }
  const J = {}, Q = {}; for (const [k, b] of Object.entries(S)) if (MAPB[k]) { J[MAPB[k]] = wp(b); Q[MAPB[k]] = wq(b); }
  return { src, sm, S, J, Q, twist };
}

// what a body's shape is, for the things made on it: its points, each with its region and the bones that carry it
function shapeOf(pts) {
  const sect = (y, arms = false, dy = 0.03) => {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; const use = [];
    for (const q of pts) if (Math.abs(q.y - y) < dy && (arms || (q.r !== 'arm' && q.r !== 'hand'))) { use.push(q); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); }
    if (use.length < 6) return null;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, N = 24, R = new Float32Array(N);
    for (const q of use) { const i = ((Math.round(Math.atan2(q.x - cx, q.z - cz) / (2 * Math.PI) * N) % N) + N) % N; R[i] = Math.max(R[i], Math.hypot(q.x - cx, q.z - cz)); }
    for (let pass = 0; pass < 4; pass++) for (let i = 0; i < N; i++) { const m = (R[(i + N - 1) % N] + R[(i + 1) % N]) / 2; if (R[i] < m * 0.9) R[i] = m; }
    return { cx, cz, at: th => { const f = ((th / (2 * Math.PI) * N) % N + N) % N, i = Math.floor(f), t = f - i; return R[i] * (1 - t) + R[(i + 1) % N] * t; } };
  };
  const near = (p, ok, k = 4) => {
    const best = [];
    for (const q of pts) { if (ok && !ok(q)) continue; const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2; if (best.length < k || d < best[best.length - 1][0]) { best.push([d, q]); best.sort((a, b) => a[0] - b[0]); if (best.length > k) best.pop(); } }
    const w = new Map(); for (const [d, q] of best) for (const [b, x] of q.w) w.set(b, (w.get(b) || 0) + x / (Math.sqrt(d) + 0.01));
    const top = [...w].sort((a, b) => b[1] - a[1]).slice(0, 4), sum = top.reduce((s, x) => s + x[1], 0); return top.map(([b, x]) => [b, x / sum]);
  };
  let lo = 1e9, hi = -1e9; for (const q of pts) { lo = Math.min(lo, q.y); hi = Math.max(hi, q.y); }
  return { sect, near, lo, hi };
}
// cloth made on the body's own shape: rings round it from top down to bottom, each as far out as the body is there and off more; arc: which part of the way round (0 is the front); flare: how much wider it hangs for every metre below where the body ends or `from`; max: never further out than this
function wrap(shape, { top, bottom, rows = 4, seg = 12, off = 0.02, arc = [-Math.PI, Math.PI], flare = 0, from = null, max = 9, min = 0, arms = false, ok = null, m, taper = 0, wave = 0 }) {
  const pos = [], idx = [], full = arc[1] - arc[0] > 6.2; let last = null, lastY = top;
  for (let r = 0; r <= rows; r++) {
    const y = top + (bottom - top) * r / rows; let e = (from === null || y >= from) ? shape.sect(y, arms) : null; if (e) { last = e; lastY = y; } else e = last;
    if (!e) throw new Error('nothing of the body at ' + y.toFixed(2));
    for (let s = 0; s <= seg; s++) { const th = arc[0] + (arc[1] - arc[0]) * s / seg, edge = full ? 1 : 1 - taper * Math.abs(s / seg - 0.5) * 2 * (r / rows);
      const rad = Math.max(min, Math.min(max, e.at(th))) + off + flare * (lastY - y) + wave * Math.sin(th * 5 + r) * (r / rows);
      pos.push(e.cx + rad * Math.sin(th) * edge, y, e.cz + rad * Math.cos(th)); }
  }
  for (let r = 0; r < rows; r++) for (let s = 0; s < seg; s++) { const a = r * (seg + 1) + s, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  return cloth(shape, pos, idx, m, ok || (arms ? null : q => q.r !== 'arm' && q.r !== 'hand'));
}
// cloth's points given the bones of the body nearest them
function cloth(shape, pos, idx, m, filter) {
  const n = pos.length / 3, g = new THREE.BufferGeometry(), col = new Uint8Array(n * 4), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const w = shape.near({ x: pos[i * 3], y: pos[i * 3 + 1], z: pos[i * 3 + 2] }, filter); w.forEach(([b, x], k) => { si[i * 4 + k] = b; sw[i * 4 + k] = x; });
    col[i * 4] = Math.round(Math.min(1, m.color.r) * 255); col[i * 4 + 1] = Math.round(Math.min(1, m.color.g) * 255); col[i * 4 + 2] = Math.round(Math.min(1, m.color.b) * 255); col[i * 4 + 3] = m.trim ? 0 : 255;
    uv[i * 2] = (CELL.white[0] + 64) / W; uv[i * 2 + 1] = (CELL.white[1] + 64) / H; }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx); g.computeVertexNormals(); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 4, true)); g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  return m.lay ? lay(g, CELL[m.lay], m.metres) : g;
}
// a flat length of cloth hung down the body's front (or its back): from x0 to x1 across, lying on the body from top down to where the body ends or `from`, then straight
function panel(shape, { top, bottom, x0, x1, rows = 6, seg = 3, off = 0.022, back = false, from = null, flare = 0, m, ok = null, dy = 0.03 }) {
  const pos = [], idx = []; let last = null, lastY = top;
  for (let r = 0; r <= rows; r++) {
    const y = top + (bottom - top) * r / rows; let e = (from === null || y >= from) ? shape.sect(y, false, dy) : null; if (e) { last = e; lastY = y; } else e = last;
    for (let s = 0; s <= seg; s++) { const x = (x0 + (x1 - x0) * s / seg) * (1 + flare * (top - y)); let th = 0; for (let k = 0; k < 4; k++) th = Math.asin(Math.max(-1, Math.min(1, (x - e.cx) / Math.max(0.03, e.at(back ? Math.PI - th : th)))));
      const A = back ? Math.PI - th : th, rad = Math.max(e.at(A), e.at(A - 0.16), e.at(A + 0.16)); pos.push(x, y, e.cz + (back ? -1 : 1) * (Math.sqrt(Math.max(0, rad * rad - (x - e.cx) ** 2)) + off + (lastY - y) * 0.03)); }
  }
  for (let r = 0; r < rows; r++) for (let s = 0; s < seg; s++) { const a = r * (seg + 1) + s, b = a + 1, c = a + seg + 1, d = c + 1; if (back) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
  return cloth(shape, pos, idx, m, ok || (q => q.r !== 'arm' && q.r !== 'hand'));
}
// what is worn, made on the body: c.P(bone) where a joint is, c.shape the body, c.add(cloth), c.take(thing, bone) something stiff
const WEARS = {
  tabard(c, { m = TEAMCLOTH, hem = 0.56, half = 0.15, off = 0.024, top: from } = {}) { const top = from ? c.P(from).y + 0.07 : c.P('neck_01').y - 0.05; for (const back of [false, true]) c.add(panel(c.shape, { top, bottom: hem, x0: -half, x1: half, rows: 7, seg: 3, off, back, m, flare: 0.12, from: c.P('pelvis').y - 0.06 })); },
  stole(c, { m = TEAMCLOTH, hem = 0.5, off = 0.034, at = 0.07, wide = 0.05 } = {}) { const top = c.P('neck_01').y - 0.03; for (const sx of [-1, 1]) c.add(panel(c.shape, { top, bottom: hem, x0: sx * at - wide / 2, x1: sx * at + wide / 2, rows: 5, seg: 1, off, m, from: c.P('pelvis').y + 0.1, dy: 0.09 })); },
  belt(c, { m = darkLeather, y = 0.07, h = 0.055, off = 0.03 } = {}) { const at = c.P('pelvis').y + y; c.add(wrap(c.shape, { top: at + h / 2, bottom: at - h / 2, rows: 1, seg: 14, off, m })); },
  sash(c, { m = TEAMCLOTH, y = 0.07, h = 0.11, off = 0.028, tail = 0.3 } = {}) { const at = c.P('pelvis').y + y; c.add(wrap(c.shape, { top: at + h / 2, bottom: at - h / 2, rows: 1, seg: 14, off, m })); if (tail) c.add(wrap(c.shape, { top: at, bottom: at - tail, rows: 3, seg: 1, off: off + 0.012, arc: [0.75, 1.05], m, from: at - 0.02 })); },
  skirt(c, { m, top = 0.06, bottom = 0.5, flare = 0.12, off = 0.028, rows = 4, arc, seg = 14, wave = 0.008 } = {}) { const at = c.P('pelvis').y + top; c.add(wrap(c.shape, { top: at, bottom, rows, seg, off, m, flare, arc, from: c.P('pelvis').y - 0.08, wave })); },
  cowl(c, { m = TEAMCLOTH, drop = 0.13, off = 0.014, up = 0.035, max = Math.abs(c.P('upperarm_l').x) + 0.035 } = {}) { const top = c.P('neck_01').y + up; c.add(wrap(c.shape, { top, bottom: top - drop, rows: 4, seg: 14, off, m, arms: true, max })); },
  cloak(c, { m, bottom = 0.3, half = 1.45, off = 0.045, flare = 0.1 } = {}) { const top = c.P('neck_01').y - 0.02; c.add(wrap(c.shape, { top, bottom, rows: 7, seg: 8, off, m, flare, arc: [Math.PI - half, Math.PI + half], from: c.P('pelvis').y, ok: q => q.r === 'torso', wave: 0.012, max: 0.24 })); },
  apron(c, { m = leather, hem = 0.5, off = 0.026 } = {}) { const top = c.P('spine_03').y + 0.04; c.add(panel(c.shape, { top, bottom: hem, x0: -0.15, x1: 0.15, rows: 6, seg: 3, off, m, flare: 0.1, from: c.P('pelvis').y - 0.06 })); },
  pauldrons(c, { m = steel, r = 0.085, spikes = false } = {}) { for (const s of ['l', 'r']) { const p = c.P('upperarm_' + s), sx = s === 'l' ? 1 : -1, o = part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.55), m, p.x * 1.02, p.y + 0.005, p.z); o.scale.set(r * 1.15, r, r * 1.2); o.rotation.z = -sx * 0.5; c.take(o, 'clavicle_' + s);
      if (spikes) for (const a of [-0.6, 0, 0.6]) { const k = part(new THREE.ConeGeometry(r * 0.2, r * 0.75, 4), m, p.x * 1.02 + sx * r * 0.55, p.y + r * 0.95, p.z + Math.sin(a) * r * 0.8); k.rotation.z = -sx * 0.5; c.take(k, 'clavicle_' + s); } } },
  mantle(c, { m = on('fur', 0x8a7a68, 0.5), r = 0.3 } = {}) { const s = c.P('spine_03'), n = c.P('neck_01'), o = part(new THREE.SphereGeometry(1, 10, 5), m, 0, n.y - 0.035, s.z - 0.02); o.scale.set(r, 0.075, 0.17); c.take(o, 'spine_03'); },
  bracers(c, { m = TEAM } = {}) { for (const s of ['l', 'r']) { const el = c.P('lowerarm_' + s), ha = c.P('hand_' + s); c.take(ring(el.clone().lerp(ha, 0.6), 0.047, 0.016, m, ha.clone().sub(el), 1, 8), 'lowerarm_' + s); } },
};
const WEAR = {
  bulwark: [['tabard'], ['belt'], ['pauldrons']],
  lancer: [['cowl', { m: FUR, drop: 0.2, off: 0.03, up: 0.02 }], ['cloak', { m: FUR, bottom: 0.95, half: 1.2, off: 0.05, flare: 0 }], ['belt', { h: 0.08 }], ['sash', { tail: 0.34 }]],
  strider: [['cowl'], ['belt']],
  slinger: [['sash', { tail: 0.22 }], ['belt', { h: 0.035, y: 0.1 }]],
  ember: [['sash'], ['stole']],
  mender: [['stole', { hem: 0.45 }], ['belt', { m: on('cloth', 0xd8c8a0, 0.3), h: 0.03 }]],
  hexbinder: [['skirt', { m: on('wool', 0x8a5cb8, 0.5), bottom: 0.3, flare: 0.16, rows: 5 }], ['sash', { tail: 0.36 }]],
  alchemist: [['apron', { m: on('leather', 0x9a7a5a, 0.4) }], ['belt'], ['cowl', { drop: 0.1 }]],
  necro: [['stole'], ['sash', { tail: 0 }]],
  captain: [['tabard'], ['belt'], ['pauldrons', { m: brass }], ['cloak', { m: TEAMCLOTH }]],
  ogre: [['skirt', { m: on('hide', 0x8a6a4c, 0.8), bottom: 0.5, flare: 0.05 }], ['belt', { h: 0.09 }], ['cloak', { m: FUR, bottom: 0.95, half: 1.3, off: 0.06, flare: 0 }], ['pauldrons', { m: iron, r: 0.12, spikes: true }], ['bracers'], ['tabard', { hem: 0.5, half: 0.1, top: 'pelvis' }]],
  ghost: [['sash', { tail: 0.25, h: 0.04, y: 0.12 }]],
};
// How a body's own clothes are painted over: mat: which of its pictures; on: which regions of the body; to: the cloth's colour; weave: the photographed surface whose weave is laid in, rep times across; skin: bare skin there is left as it is; mix: how much of it is replaced
const PAINT = {
  bulwark: [{ mat: 'body', on: CLOTHES, to: 0x8a8f96, weave: 'chain', rep: 7, gamma: 0.5, deep: 0.9 }, { mat: 'body', on: 'foot hand', to: 0x54402e, weave: 'leather', rep: 3 }, { mat: 'equipment', on: A + ' head hand face', to: 0x9a9fa6, weave: 'steel', rep: 2, gamma: 0.6 }, { mat: 'helmet', on: A + ' head hand face', to: 0xa0a5ad, weave: 'steel', rep: 2, gamma: 0.6 }],
  lancer: [{ mat: 'body', on: 'torso arm', to: 0x80603e, weave: 'sack', rep: 4, gamma: 0.3, deep: 1.4 }, { mat: 'body', on: 'leg', to: 0x5c5040, weave: 'wool', rep: 5 }, { mat: 'body', on: 'foot', to: 0x4a3626, weave: 'leather', rep: 3 }, { mat: 'head', on: 'head', to: 0x6a5a48, weave: 'wool', rep: 5, skin: true, mix: 0.0 }],
  strider: [{ mat: 'body', on: 'torso arm head', to: 0x4c5648, weave: 'wool', rep: 5 }, { mat: 'body', on: 'leg', to: 0x3e3830, weave: 'wool', rep: 5 }, { mat: 'body', on: 'foot', to: 0x4a3828, weave: 'leather', rep: 3 }, { mat: 'head', on: 'head', to: 0x4c5648, weave: 'wool', rep: 5, skin: true }],
  slinger: [{ mat: 'body', on: 'leg', to: 0x5e6644, weave: 'wool', rep: 5 }],
  ember: [{ mat: 'body', on: CLOTHES, to: 0x92301e, weave: 'wool', rep: 5, lo: 0.45, hi: 1.35 }, { mat: 'keffiyeh', on: A + ' head face hand', to: 0x4e1a12, weave: 'wool', rep: 5, gamma: 0.2, lo: 0.7, hi: 1.3 }],
  mender: [{ mat: 'body', on: CLOTHES, to: 0xd4ccb4, weave: 'cloth', rep: 5, hi: 1.25 }, { mat: 'body', on: 'foot', to: 0x5a4632, weave: 'leather', rep: 3 }],
  hexbinder: [{ mat: 'body', on: 'torso arm', to: 0x5e3c80, weave: 'wool', rep: 5, skin: true }],
  alchemist: [{ mat: 'body', on: CLOTHES, to: 0x566040, weave: 'wool', rep: 5 }, { mat: 'body', on: 'foot', to: 0x4a3828, weave: 'leather', rep: 3 }, { mat: 'body', on: 'hand', to: 0x7a5c40, weave: 'leather', rep: 3 }],
  necro: [{ mat: 'body', on: CLOTHES, to: 0x3c2c48, weave: 'wool', rep: 5, lo: 0.5, hi: 1.6, gamma: 0.6 }],
  captain: [{ mat: 'body', on: CLOTHES, to: 0x5e4a38, weave: 'leather', rep: 3, hi: 1.2, gamma: 0.6 }, { mat: 'body', on: 'foot hand', to: 0x3e3026, weave: 'leather', rep: 3 }, { mat: 'helmet', on: A + ' head face hand', to: 0xa8acb2, weave: 'steel', rep: 2, gamma: 0.15, lo: 0.7, hi: 1.25 }],
  ogre: [{ mat: 'body', on: A + ' hand head face', to: 0x8e9c6c, gamma: 0.9, lo: 0.35, hi: 1.6, mix: 0.8 }, { mat: 'head', on: 'face', to: 0x8e9c6c, gamma: 0.9, lo: 0.35, hi: 1.6, mix: 0.8 }, { mat: 'head', on: A + ' hand head', to: 0x7c8a60, gamma: 0.35, lo: 0.6, hi: 1.3 }],
  ghost: [{ mat: 'color', on: A + ' hand head face', to: 0xccd6d8, weave: 'cloth', rep: 5, gamma: 0.7, lo: 0.45, hi: 1.4 }],
};

// A scanned thing (Poly Haven's model, data/full/chess/props/m/): thinned to so many triangles, made so many times its size, its own picture given a square of the shared one. grey: the parts whose picture is made grey, to be drawn in the side's colour.
const PROP = {}, PROPS = { sword: ['antique_estoc', 150, 0.7], axe: ['wooden_axe', 170, 1.75], kite: ['kite_shield', 230, 0.6, /body/] };
async function props() {
  for (const [name, [file, tris, k, grey]] of Object.entries(PROPS)) {
    const src = (await load('props/m/' + file + '.glb')).scene, g = new THREE.Group(), list = []; src.updateMatrixWorld(true); src.traverse(o => { if (o.isMesh) list.push(o); });
    const all = list.reduce((a, o) => a + o.geometry.index.count, 0);
    for (const o of list) { const cell = alloc(file + '_' + o.material.name, 256), team = !!(grey && grey.test(o.material.name));
      if (!cell.drawn) { cell.drawn = true; ctx.drawImage(o.material.map.image, cell[0], cell[1], cell[2], cell[2]);
        if (team) { const I = ctx.getImageData(cell[0], cell[1], cell[2], cell[2]), d = I.data; for (let i = 0; i < d.length; i += 4) { const l = Math.min(255, 70 + 0.75 * (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])); d[i] = d[i + 1] = d[i + 2] = l; } ctx.putImageData(I, cell[0], cell[1]); } }
      const geo = new THREE.BufferGeometry(); for (const a of ['position', 'normal', 'uv']) geo.setAttribute(a, o.geometry.attributes[a].clone()); geo.setIndex(Array.from(o.geometry.index.array)); geo.applyMatrix4(o.matrixWorld); geo.scale(k, k, k);
      const m = new THREE.Mesh(thin(geo, Math.max(12, Math.round(tris * o.geometry.index.count / all))), new THREE.MeshBasicMaterial()); m.userData = { cell: [...cell], trim: team }; g.add(m); }
    PROP[name] = g;
  }
}
const prop = (name, tint) => { const g = PROP[name].clone(); if (tint) g.traverse(o => { if (o.isMesh) o.userData.tint = tint; }); return g; };
// a round thing turned from an outline: [[radius, height], ...]
const lathe = (pts, m, seg = 8) => part(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), m);
function makeGear(kind) {   // grip at the origin, pointing along +Y
  const g = new THREE.Group();
  if (kind === 'sword') g.add(prop('sword'));
  else if (kind === 'rustsword') { const d = prop('sword', [0.72, 0.5, 0.36]); d.scale.setScalar(0.78); g.add(d); }
  else if (kind === 'dagger') { const d = prop('sword'); d.scale.setScalar(0.36); g.add(d); }
  else if (kind === 'greataxe') g.add(prop('axe'));
  else if (kind === 'shield') g.add(prop('kite'));
  else if (kind === 'staff' || kind === 'skullstaff') {
    const pts = [[0, -0.86, 0], [0.012, -0.3, 0.008], [-0.01, 0.2, -0.006], [0.008, 0.6, 0.01], [0, 0.86, 0]].map(p => V(...p)), wood = kind === 'staff' ? darkWood : on('wood', 0x5a4a44, 0.5);
    g.add(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 7, 0.019, 6), wood));
    if (kind === 'staff') { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4, b = bar(V(Math.sin(a) * 0.022, 0.85, Math.cos(a) * 0.022), V(Math.sin(a) * 0.06, 1.0, Math.cos(a) * 0.06), 0.007, 0.005, iron, 4); g.add(b); }
      g.add(part(new THREE.TorusGeometry(0.058, 0.007, 4, 8), iron, 0, 0.98, 0).rotateX(Math.PI / 2), part(new THREE.IcosahedronGeometry(0.048, 0), mat(0xff9a3a, 0.2), 0, 0.95, 0)); }
    else g.add(skull(0.085).translateY(0.93));
  } else if (kind === 'wand') {
    g.add(part(new THREE.CylinderGeometry(0.006, 0.013, 0.4, 5), darkWood, 0, 0.14, 0), part(new THREE.OctahedronGeometry(0.03), mat(0xb08aee, 0.15), 0, 0.37, 0));
  } else if (kind === 'crossbow') {
    const arc = new THREE.QuadraticBezierCurve3(V(-0.3, 0.36, 0), V(0, 0.56, 0), V(0.3, 0.36, 0));
    g.add(part(new THREE.BoxGeometry(0.045, 0.62, 0.05), darkWood, 0, 0.2, 0), part(new THREE.TubeGeometry(arc, 6, 0.012, 4), iron), bar(V(-0.3, 0.36, 0), V(0, 0.16, 0.026), 0.003, 0.003, mat(0xd8d0b8), 3), bar(V(0.3, 0.36, 0), V(0, 0.16, 0.026), 0.003, 0.003, mat(0xd8d0b8), 3),
      part(new THREE.TorusGeometry(0.035, 0.006, 4, 8), iron, 0, 0.54, 0), bar(V(0, 0.16, 0.03), V(0, 0.5, 0.03), 0.005, 0.005, darkWood, 4), part(new THREE.BoxGeometry(0.03, 0.1, 0.06), darkWood, 0, -0.1, -0.03));
  } else if (kind === 'flask') {
    g.add(lathe([[0, 0.07], [0.05, 0.085], [0.07, 0.13], [0.06, 0.19], [0.022, 0.22], [0.02, 0.29], [0.026, 0.3]], mat(0x62c07a, 0.1), 8), part(new THREE.CylinderGeometry(0.02, 0.018, 0.035, 6), darkWood, 0, 0.31, 0));
  } else if (kind === 'pack') {
    g.add(part(new THREE.BoxGeometry(0.3, 0.36, 0.14), leather, 0, 0, 0), part(new THREE.BoxGeometry(0.31, 0.12, 0.15), darkLeather, 0, 0.13, 0), part(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 7), on('cloth', 0xb8a888, 0.3), 0, 0.24, 0).rotateZ(Math.PI / 2));
  } else if (kind === 'quiver') {
    g.add(part(new THREE.CylinderGeometry(0.05, 0.04, 0.5, 7), leather, 0, 0, 0));
    for (let i = 0; i < 5; i++) { const a = i * 1.26, x = Math.sin(a) * 0.022, z = Math.cos(a) * 0.022; g.add(part(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 3), darkWood, x, 0.33, z), part(new THREE.BoxGeometry(0.002, 0.07, 0.03), mat(0xd8d2c0), x, 0.39, z).rotateY(a)); }
  } else if (kind === 'banner') {
    const cloth = new THREE.PlaneGeometry(0.5, 0.6, 4, 3), A = cloth.attributes.position; for (let i = 0; i < A.count; i++) A.setZ(i, Math.sin(A.getX(i) * 9) * 0.03 * (0.5 + A.getX(i) + 0.25)); cloth.computeVertexNormals();
    g.add(part(new THREE.CylinderGeometry(0.013, 0.015, 1.5, 6), darkWood, 0, 0.25, 0), part(cloth, TEAMCLOTH, 0.27, 0.64, 0), part(new THREE.CylinderGeometry(0.008, 0.008, 0.54, 4), darkWood, 0.26, 0.95, 0).rotateZ(Math.PI / 2), part(new THREE.ConeGeometry(0.022, 0.1, 4), brass, 0, 1.05, 0));
  } else if (kind === 'bandolier') {
    g.add(part(new THREE.BoxGeometry(0.5, 0.04, 0.012), darkLeather, 0, 0, 0));
    for (const [x, c] of [[-0.14, 0xc88a4a], [0, 0x62c07a], [0.14, 0x9a7ac8]]) g.add(lathe([[0, -0.07], [0.03, -0.06], [0.034, -0.01], [0.014, 0.01], [0.014, 0.03]], mat(c, 0.1), 6).translateX(x).translateZ(0.035), part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 5), darkWood, x, 0.035, 0.035));
  } else if (kind === 'club') {
    const c = lathe([[0, -0.12], [0.024, -0.11], [0.026, 0.1], [0.04, 0.45], [0.075, 0.72], [0.085, 0.86], [0.06, 0.95], [0, 0.97]], darkWood, 7), A = c.geometry.attributes.position;
    for (let i = 0; i < A.count; i++) { const k = 1 + (hash(Math.round(A.getX(i) * 40), Math.round(A.getY(i) * 40), Math.round(A.getZ(i) * 40), 3) - 0.5) * 0.24; A.setX(i, A.getX(i) * k); A.setZ(i, A.getZ(i) * k); } c.geometry.computeVertexNormals();
    g.add(c, part(new THREE.CylinderGeometry(0.078, 0.07, 0.035, 7), iron, 0, 0.7, 0), part(new THREE.CylinderGeometry(0.09, 0.088, 0.035, 7), iron, 0, 0.86, 0));
    for (let i = 0; i < 5; i++) { const a = i * 1.26, sp = part(new THREE.ConeGeometry(0.015, 0.05, 4), iron, Math.sin(a) * 0.1, 0.79, Math.cos(a) * 0.1); sp.rotation.set(Math.PI / 2 * Math.cos(a), 0, -Math.PI / 2 * Math.sin(a)); g.add(sp); }
  } else if (kind === 'book') {
    g.add(part(new THREE.BoxGeometry(0.13, 0.17, 0.045), on('leather', 0xa06a4a, 0.3), 0, 0, 0), part(new THREE.BoxGeometry(0.115, 0.155, 0.047), mat(0xd8cfb4), 0.006, 0, 0));
  } else if (kind === 'tusks') {
    for (const sx of [-1, 1]) { const t = part(new THREE.ConeGeometry(0.011, 0.055, 5), BONE, sx * 0.036, 0, 0); t.rotation.set(-0.25, 0, -sx * 0.2); g.add(t); }
  } else if (kind === 'plume') {
    g.add(part(new THREE.ConeGeometry(0.03, 0.2, 5), TEAM, 0, 0.1, -0.03).rotateX(-0.5));
  }
  return g;
}
// a skull, r its half height: the brain case, the cheekbones, the upper jaw and its teeth, the lower jaw, the sockets and the nose dark
function skull(r, m = BONE) {
  const g = new THREE.Group(), D = mat(0x14100c), k = r / 0.09, T = mat(0xe8e0c8), add = (o, x = 0, y = 0, z = 0) => { o.position.set(x * k, y * k, z * k); o.scale.multiplyScalar(k); g.add(o); return o; };
  add(ball(V(), 0.074, 0.08, 0.094, m, 10, 7), 0, 0.03, -0.012);
  add(part(new THREE.CylinderGeometry(0.05, 0.036, 0.075, 6), m), 0, -0.05, 0.036).scale.z *= 0.8;   // the face narrowing to the jaw
  add(part(new THREE.BoxGeometry(0.122, 0.02, 0.05), m), 0, -0.022, 0.04);                      // cheekbones
  add(part(new THREE.BoxGeometry(0.1, 0.016, 0.03), m), 0, 0.024, 0.074);                      // brow
  add(part(new THREE.BoxGeometry(0.058, 0.014, 0.022), T), 0, -0.089, 0.058);                  // teeth
  const jaw = add(part(new THREE.TorusGeometry(0.04, 0.011, 4, 8, Math.PI), m), 0, -0.112, 0.024); jaw.rotation.x = Math.PI / 2; jaw.scale.y *= 1.25;
  for (const sx of [-1, 1]) { add(ball(V(), 0.021, 0.022, 0.016, D, 6, 4), sx * 0.03, 0.0, 0.07); add(part(new THREE.BoxGeometry(0.012, 0.05, 0.03), m), sx * 0.046, -0.085, 0.0); }
  add(part(new THREE.ConeGeometry(0.012, 0.03, 3), D), 0, -0.04, 0.068);
  return g;
}
// How each item sits on its bone: [bone, position, rotation (Euler XYZ)].
const GRIP = [[0, 0.09, 0.03], [Math.PI, 0, 0]];
const HOLD = { sword: ['hand_r', ...GRIP], dagger: ['hand_r', ...GRIP], rustsword: ['hand_r', ...GRIP], greataxe: ['hand_r', ...GRIP], staff: ['hand_l', ...GRIP], skullstaff: ['hand_l', ...GRIP], wand: ['hand_r', ...GRIP], club: ['hand_r', ...GRIP], flask: ['hand_r', ...GRIP],
  crossbow: ['hand_r', [0, 0.09, 0.03], [Math.PI / 2, 0, 0]], shield: ['lowerarm_l', [0, 0.14, -0.07], [Math.PI / 2, 0, 0]] };
// Things worn: [the bone that carries it, where it sits from that bone as the figure stands at rest (the figure's left, up, its front), its turn]. 'top' is the crown of the head.
const WORN = { plume: ['Head', 'top', [0, -0.02, 0], [0, 0, 0]], tusks: ['Head', 'bone', [0, 0.062, 0.125], [0, 0, 0]], pack: ['spine_03', 'bone', [0, -0.1, -0.2], [0, 0, 0]], quiver: ['spine_03', 'bone', [-0.06, -0.05, -0.17], [0, 0, -0.45]], banner: ['spine_03', 'bone', [-0.1, 0, -0.17], [0, 0, 0]],
  bandolier: ['spine_02', 'bone', [0, 0.1, 0.15], [0, 0, 0.35]], book: ['pelvis', 'bone', [0.17, -0.06, 0.06], [0, 0.3, 0.1]] };
const GEAR = { bulwark: ['sword', 'shield'], lancer: ['greataxe'], strider: ['dagger'], slinger: ['crossbow', 'quiver'], ember: ['staff'], mender: ['book'], hexbinder: ['wand'], alchemist: ['flask', 'bandolier', 'pack'], necro: ['skullstaff'], captain: ['sword', 'banner'], ogre: ['club', 'tusks'], ghost: [] };
// How it stands (the page's own list names the same clip), and which way each thing it holds points as it stands so: y the way the thing runs, z the way its face looks (the figure's left, up, its front)
const STAND = { bulwark: 'Idle_Shield_Loop', ogre: 'Idle_Loop', ghost: 'Zombie_Idle_Loop', skeleton: 'Sword_Idle', slinger: 'Real_IdleF', mender: 'Real_IdleF', hexbinder: 'Real_IdleF', necro: 'Real_IdleF' }, STANDS = 'Real_Idle';
const POSE = { sword: { y: [0.12, -0.42, 0.9] }, rustsword: { y: [0.1, 0.85, 0.5] }, dagger: { y: [0.1, -0.3, 0.95] }, greataxe: { y: [-0.12, 1, 0.1], z: [1, 0, 0.3] }, staff: { y: [0, 1, 0] }, skullstaff: { y: [0, 1, 0], z: [0, 0, 1] }, wand: { y: [0, 0.25, 1] }, crossbow: { y: [0.1, -0.3, 0.95], z: [0, 1, 0.3] }, flask: { y: [0, 1, 0] }, club: { y: [0.1, 1, 0.12] },
  shield: { y: [0, 1, 0], z: [0.75, 0, 0.66], out: 0.05 } };
const POSES = { bulwark: { sword: { y: [-0.3, 0.75, 0.55] } } };
// a figure's points moved after it is put together: [x, y, z] and its normal, in metres, the figure standing at the origin; hd: where its head's joint is
const SHAPE = {
  ogre(p, n, hd, r) {
    if (r === 'arm' || r === 'hand') { p.addScaledVector(n, r === 'hand' ? 0.016 : 0.042); return; }
    const belly = Math.exp(-(((p.y - 1.08) / 0.2) ** 2)); if (p.y < hd.y - 0.02) { p.x = p.x * 1.16 + n.x * 0.025; p.z = p.z * 1.14 + n.z * 0.025 + (p.z > -0.02 && Math.abs(p.x) < 0.26 ? belly * 0.1 : 0); return; }
    const y = p.y - hd.y, jaw = Math.max(0, 1 - Math.abs(y - 0.03) / 0.075), brow = Math.max(0, 1 - Math.abs(y - 0.125) / 0.03), front = Math.max(0, Math.min(1, (p.z - hd.z) / 0.09));
    p.x = hd.x + (p.x - hd.x) * (1.12 + 0.42 * jaw); p.z = hd.z + (p.z - hd.z) * 1.08 + front * (0.05 * jaw + 0.03 * brow); if (y > 0.135) p.y = hd.y + 0.135 + (y - 0.135) * 0.72; p.y -= 0.012 * jaw * front;
  },
};

const log = [], say = (...a) => log.push(a.join(' '));
export const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const files = {}, loader = new GLTFLoader(), raw = {};
const load = async name => { raw[name] = raw[name] || await (await fetch('/src/' + name)).arrayBuffer(); return loader.parseAsync(raw[name].slice(0), ''); };   // a file under data/full/chess/
const picture = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('no picture ' + src)); i.src = src; });

const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.fillStyle = '#777'; ctx.fillRect(0, 0, W, H);
// A surface painted into the picture with its relief in it (the page lights these flat): its colour, darkened in its hollows (its occlusion picture) and lit from the upper left along its bumps (its normal picture).
async function surface(name) {
  const [x, y, s] = alloc(name, 256), [bright, deep, grey] = SURF[name], px = async suf => { const c = document.createElement('canvas'); c.width = c.height = s; const k = c.getContext('2d'); k.drawImage(await picture('/src/creatures/tex/' + (FROM[name] || name) + suf + '.jpg'), 0, 0, s, s); return k.getImageData(0, 0, s, s); };
  const d = await px(''), n = await px('_n'), ao = await px('_ao').catch(() => ({ data: new Uint8Array(s * s * 4).fill(255) })), o = d.data; let sum = 0;
  for (let i = 0; i < o.length; i += 4) {
    const nx = n.data[i] / 127.5 - 1, ny = n.data[i + 1] / 127.5 - 1, nz = n.data[i + 2] / 127.5 - 1, lit = Math.max(0.25, Math.min(1.5, 1 + deep * (-0.55 * nx + 0.65 * ny) + (nz - 1) * 0.3)), k = lit * (ao.data[i] / 255) ** deep;
    const l = 0.2126 * o[i] + 0.7152 * o[i + 1] + 0.0722 * o[i + 2]; for (let c = 0; c < 3; c++) o[i + c] = (o[i + c] + (l - o[i + c]) * grey) * k; sum += 0.2126 * o[i] + 0.7152 * o[i + 1] + 0.0722 * o[i + 2];
  }
  const gain = bright * 255 / (sum / (o.length / 4)); for (let i = 0; i < o.length; i += 4) for (let c = 0; c < 3; c++) o[i + c] = Math.min(255, o[i + c] * gain);
  ctx.putImageData(d, x, y);
}
// one piece of a figure: where each point is at rest, its normal, its place in the picture, its colour and the bones that carry it
function piece(geo, world, cell, color, skin) {
  const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv, n = P.count, g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Uint8Array(n * 4), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  const v = new THREE.Vector3(), q = new THREE.Vector3(), c = new THREE.Color(), nm = new THREE.Matrix3().getNormalMatrix(world), [cx, cy, cs] = cell;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(P, i); q.fromBufferAttribute(N, i);
    if (skin.mesh) { q.multiplyScalar(0.01).add(v); skin.mesh.applyBoneTransform(i, v); skin.mesh.applyBoneTransform(i, q); q.sub(v); }   // its normal goes with its bones too
    v.applyMatrix4(world); v.toArray(pos, i * 3); q.applyMatrix3(nm).normalize().toArray(nor, i * 3);
    let a = U ? U.getX(i) : 0.5, b = U ? U.getY(i) : 0.5; a -= Math.floor(a); b -= Math.floor(b); if (skin.flipV) b = 1 - b;
    uv[i * 2] = (cx + 1.5 + a * (cs - 3)) / W; uv[i * 2 + 1] = (cy + 1.5 + b * (cs - 3)) / H;
    c.copy(color);   // the models' own point colours are not used (most of a body never had them)
    col[i * 4] = Math.round(Math.min(1, c.r) * 255); col[i * 4 + 1] = Math.round(Math.min(1, c.g) * 255); col[i * 4 + 2] = Math.round(Math.min(1, c.b) * 255); col[i * 4 + 3] = (skin.trim ? 0 : 255) + (skin.held ? (skin.trim ? 64 : -127) : 0);   // 0 and 64: the page draws this point in its side's colour; 64 and 128: something held or carried, not the body (the check of each piece's footprint leaves it out)
    if (skin.mesh) for (let k = 0; k < 4; k++) { si[i * 4 + k] = skin.map[geo.attributes.skinIndex.getComponent(i, k)]; sw[i * 4 + k] = geo.attributes.skinWeight.getComponent(i, k); }
    else { si[i * 4] = skin.bone; sw[i * 4] = 1; }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 4, true)); g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  g.setIndex(geo.index ? Array.from(geo.index.array) : [...Array(n).keys()]);
  return g;
}
// A piece laid onto a surface that has no place for it of its own: each triangle flat along the way it faces, the whole piece inside the surface's picture (span: the metres one picture covers, or the piece if it is larger). facet: its faces flat, as a broken stone's are.
let laid = 0;
function lay(g, cell, span = 1, facet = false) {
  const s = g.index ? g.toNonIndexed() : g, P = s.attributes.position, U = s.attributes.uv, N = s.attributes.normal, [cx, cy, cs] = cell, p = [V(), V(), V()], e = V(), f = V(), seed = ++laid;
  s.computeBoundingBox(); const lo = s.boundingBox.min.toArray(), size = s.boundingBox.getSize(V()).toArray(), w = Math.max(span, ...size), off = [0, 1, 2].map(k => hash(seed, k, 5) * (1 - size[k] / w));
  for (let t = 0; t < P.count; t += 3) {
    for (let k = 0; k < 3; k++) p[k].fromBufferAttribute(P, t + k);
    f.copy(p[1]).sub(p[0]).cross(e.copy(p[2]).sub(p[0])).normalize();
    const ax = Math.abs(f.x) > Math.abs(f.y) && Math.abs(f.x) > Math.abs(f.z) ? 0 : Math.abs(f.y) > Math.abs(f.z) ? 1 : 2, ua = ax === 0 ? 2 : 0, va = ax === 1 ? 2 : 1;
    for (let k = 0; k < 3; k++) { const a = (p[k].getComponent(ua) - lo[ua]) / w + off[ua], b = 1 - ((p[k].getComponent(va) - lo[va]) / w + off[va]);
      U.setXY(t + k, (cx + 1.5 + a * (cs - 3)) / W, (cy + 1.5 + b * (cs - 3)) / H); if (facet) N.setXYZ(t + k, f.x, f.y, f.z); }
  }
  s.setIndex([...Array(P.count).keys()]);
  return s;
}
// fewer triangles, and only the points they still use
export function thin(g, tris) {
  { // points at one place with one place in the picture become one point (its normal their sum): the models are faceted, which would stop the thinning
    const P = g.attributes.position.array, U = g.attributes.uv.array, N = g.attributes.normal.array, seen = new Map(), to = new Uint32Array(P.length / 3);
    for (let i = 0; i < to.length; i++) { const k = Math.round(P[i * 3] * 2e4) + ',' + Math.round(P[i * 3 + 1] * 2e4) + ',' + Math.round(P[i * 3 + 2] * 2e4) + ',' + Math.round(U[i * 2] * 4096) + ',' + Math.round(U[i * 2 + 1] * 4096);
      if (seen.has(k)) { const j = seen.get(k); to[i] = j; for (let c = 0; c < 3; c++) N[j * 3 + c] += N[i * 3 + c]; } else { seen.set(k, i); to[i] = i; } }
    const v = new THREE.Vector3(); for (let i = 0; i < to.length; i++) if (to[i] === i) v.fromArray(N, i * 3).normalize().toArray(N, i * 3);
    g.setIndex(Array.from(g.index.array, i => to[i]));
  }
  const idx = new Uint32Array(g.index.array), before = idx.length / 3;
  const [out] = MeshoptSimplifier.simplify(idx, g.attributes.position.array, 3, tris * 3, 0.05, ['Prune', 'Permissive']), used = new Map(), keep = [];
  const ni = Array.from(out, i => { if (!used.has(i)) { used.set(i, keep.length); keep.push(i); } return used.get(i); }), o = new THREE.BufferGeometry();
  for (const [name, a] of Object.entries(g.attributes)) { const arr = new a.array.constructor(keep.length * a.itemSize); keep.forEach((src, d) => { for (let k = 0; k < a.itemSize; k++) arr[d * a.itemSize + k] = a.array[src * a.itemSize + k]; }); o.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize, a.normalized)); }
  o.setIndex(ni);
  return o;
}
export const exportGlb = (scene, animations = []) => new Promise((res, rej) => new GLTFExporter().parse(scene, res, rej, { binary: true, animations }));
// a clip as the page plays it: FPS keys a second (the page blends between them), nothing that never moves
function resample(c, name = c.name) {
  const n = Math.max(2, Math.round(c.duration * FPS) + 1), times = Float32Array.from({ length: n }, (_, i) => c.duration * i / (n - 1));
  const tracks = c.tracks.map(t => { const size = t.getValueSize(), it = t.createInterpolant(new Float32Array(size)), v = new Float32Array(n * size); times.forEach((tm, i) => v.set(it.evaluate(tm), i * size)); return new t.constructor(t.name, times, v); });
  return new THREE.AnimationClip(name, c.duration, tracks).optimize();
}
const moving = t => { if (t.name.endsWith('.scale')) return false; if (t.name.endsWith('.position')) { let span = 0; for (let i = 3; i < t.values.length; i++) span = Math.max(span, Math.abs(t.values[i] - t.values[i % 3])); return span > 1e-4; } return true; };   // a bone that never leaves its place keeps the body's own
// How fast a figure must cross the ground for its walk's feet not to slide (metres a second): at each moment the lowest point of its feet is the one bearing it, and the speed that point goes backwards at is the speed the body must go forwards; the middle one of those over the cycle (moments with nothing on the ground left out).
function stride(root, mesh, clip) {
  const P = mesh.geometry.attributes.position, bb = mesh.geometry.boundingBox, tall = bb.max.y - bb.min.y, feet = [], v = V(), mixer = new THREE.AnimationMixer(root), act = mixer.clipAction(clip); act.play();
  for (let i = 0; i < P.count; i++) if (P.getY(i) < bb.min.y + tall * 0.06) feet.push(i);
  const N = 96, at = [];
  for (let k = 0; k <= N; k++) { mixer.setTime(clip.duration * k / N); root.updateMatrixWorld(true); mesh.skeleton.update(); at.push(feet.map(i => { v.fromBufferAttribute(P, i); mesh.applyBoneTransform(i, v); return [v.y, v.z]; })); }
  const floor = Math.min(...at.map(f => Math.min(...f.map(q => q[0])))), vel = [];
  for (let k = 0; k < N; k++) { let j = 0; for (let i = 1; i < feet.length; i++) if (at[k][i][0] < at[k][j][0]) j = i; if (at[k][j][0] < floor + tall * 0.02 && at[k + 1][j][0] < floor + tall * 0.02) vel.push((at[k][j][1] - at[k + 1][j][1]) / (clip.duration / N)); }
  act.stop(); mixer.uncacheRoot(root); mixer.setTime(0); root.updateMatrixWorld(true); mesh.skeleton.update();
  vel.sort((a, b) => a - b);
  if (vel.length >= N / 8 && vel[vel.length >> 1] > 0) return +vel[vel.length >> 1].toFixed(3);
  // a bounding gait is hardly ever on the ground at its lowest: the mean speed its low points go backwards at instead
  const lo = at.map(f => f.reduce((m, q) => Math.min(m, q[0]), 1e9)), top = Math.max(...at.map(f => Math.max(...f.map(q => q[0])))); let sum = 0, n = 0;
  for (let k = 0; k < N; k++) for (let i = 0; i < feet.length; i++) { const d = (at[k][i][1] - at[k + 1][i][1]) / (clip.duration / N); if (d > 0 && Math.max(at[k][i][0], at[k + 1][i][0]) < floor + (top - floor) * 0.3) { sum += d; n++; } }
  return n ? +(sum / n).toFixed(3) : 0;
}

// When a strike lands: the moment in its clip the figure reaches furthest forward (seconds).
function reach(root, mesh, clip) {
  const P = mesh.geometry.attributes.position, v = V(), mixer = new THREE.AnimationMixer(root), act = mixer.clipAction(clip), N = Math.max(8, Math.round(clip.duration * 30)); act.play(); let best = -1e9, at = 0;
  for (let k = 0; k <= N; k++) { mixer.setTime(clip.duration * k / N); root.updateMatrixWorld(true); mesh.skeleton.update(); let z = -1e9; for (let i = 0; i < P.count; i += 3) { v.fromBufferAttribute(P, i); mesh.applyBoneTransform(i, v); z = Math.max(z, v.z); } if (z > best + 1e-4) { best = z; at = clip.duration * k / N; } }
  act.stop(); mixer.uncacheRoot(root); mixer.setTime(0); root.updateMatrixWorld(true); mesh.skeleton.update();
  return +at.toFixed(2);
}

// ---- the picture: a body's own pictures, painted over
const hex = h => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
const isSkin = (r, g, b) => r > 95 && g > 45 && b > 25 && r > g && g >= b && r - b > 28 && r - g > 10 && r - g < 110;
const weaves = {};
// a surface's weave as it is laid into a body's picture, rep times across a 256 square: the surface made that much smaller first (each point the mean of what it covers), so nothing of it turns to speckle
function weaveOf(name, rep) {
  const id = name + rep; if (weaves[id]) return weaves[id];
  const [x, y, s] = CELL[name], d = ctx.getImageData(x, y, s, s).data, t = Math.max(4, Math.round(s / rep)), L = new Float32Array(t * t), N = new Uint16Array(t * t); let sum = 0;
  for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) { const o = (j * s + i) * 4, k = Math.min(t - 1, Math.floor(j * t / s)) * t + Math.min(t - 1, Math.floor(i * t / s)); L[k] += 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2]; N[k]++; }
  for (let k = 0; k < t * t; k++) { L[k] /= N[k] || 1; sum += L[k]; } const mean = sum / (t * t);
  return (weaves[id] = (u, v) => L[(v % t) * t + (u % t)] / mean);
}
const maskOf = (cs, tris) => { const m = document.createElement('canvas'); m.width = m.height = cs; const k = m.getContext('2d', { willReadFrequently: true }); k.fillStyle = k.strokeStyle = '#fff'; k.lineWidth = 2; k.lineJoin = 'round';
  for (const t of tris) { k.beginPath(); k.moveTo(t[0], t[1]); k.lineTo(t[2], t[3]); k.lineTo(t[4], t[5]); k.closePath(); k.fill(); k.stroke(); } return k.getImageData(0, 0, cs, cs).data; };
function repaint(cell, tris, rule) {
  if (!tris.length) return;
  const [cx, cy, cs] = cell, M = maskOf(cs, tris), I = ctx.getImageData(cx, cy, cs, cs), d = I.data, wv = rule.weave ? weaveOf(rule.weave, (rule.rep || 3) * 256 / cs) : null, to = hex(rule.to ?? 0xffffff), lo = rule.lo ?? 0.4, hi = rule.hi ?? 1.5, gamma = rule.gamma ?? 0.8, mix = rule.mix ?? 1, deep = rule.deep ?? 1;
  const L = i => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2], skip = i => rule.skin && isSkin(d[i], d[i + 1], d[i + 2]); let sum = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (M[i] > 127 && !skip(i)) { sum += L(i); n++; }
  const mean = Math.max(10, sum / Math.max(1, n));
  for (let i = 0; i < d.length; i += 4) { if (M[i] <= 127 || skip(i)) continue;
    const p = i / 4, l = Math.max(lo, Math.min(hi, (L(i) / mean) ** gamma)), w = wv ? 1 + (wv(p % cs, Math.floor(p / cs)) - 1) * deep : 1;
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, d[i + c] + ((rule.tint ? d[i + c] * to[c] / 255 * (rule.gain || 1) : to[c] * l * w) - d[i + c]) * mix)); }
  ctx.putImageData(I, cx, cy);
}
// what lies outside a picture's own pieces takes the colour of the piece beside it, so no dark line shows where two pieces meet
function bleed(cell, tris, passes = 5) {
  const [cx, cy, cs] = cell, M = maskOf(cs, tris), I = ctx.getImageData(cx, cy, cs, cs), d = I.data, inn = new Uint8Array(cs * cs); for (let i = 0; i < cs * cs; i++) inn[i] = M[i * 4] > 127 ? 1 : 0;
  for (let pass = 0; pass < passes; pass++) { const add = [];
    for (let y = 0; y < cs; y++) for (let x = 0; x < cs; x++) { const i = y * cs + x; if (inn[i]) continue; let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= cs || Y >= cs) continue; const j = Y * cs + X; if (inn[j]) { r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; n++; } }
      if (n) add.push([i, r / n, g / n, b / n]); }
    for (const [i, r, g, b] of add) { inn[i] = 1; d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; } }
  ctx.putImageData(I, cx, cy);
}
const kindOf = m => m.name.split('.')[0].split('_').slice(1).join('_');
// every triangle of a piece: its corners' places in the picture (pixels inside its square) and the region of the body it belongs to
function trisOf(g, cell, names, face) {
  const U = g.attributes.uv, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, ix = g.index.array, out = [];
  for (let t = 0; t < ix.length; t += 3) { const w = {}, px = [];
    for (let k = 0; k < 3; k++) { const i = ix[t + k]; px.push(U.getX(i) * W - cell[0], U.getY(i) * H - cell[1]); for (let c = 0; c < 4; c++) { const r = REGION(names[SI.getComponent(i, c)]); w[r] = (w[r] || 0) + SW.getComponent(i, c); } }
    px.r = Object.keys(w).sort((a, b) => w[b] - w[a])[0]; if (px.r === 'head' && face) { const P = g.attributes.position, i = ix[t]; if (face(P.getX(i), P.getY(i), P.getZ(i))) px.r = 'face'; } out.push(px); }
  return out;
}

// A person: a Rocketbox body stood on the clips' bones, repainted, dressed and armed, thinned, one mesh.
async function person(type) {
  const spec = SPEC[type], K = spec.k || 1, { top, bones, up } = await rigOf(), { sm, S, J, twist } = await standAs(spec.body, up);
  const index = new Map(bones.map((b, i) => [b.name, i])), bone = name => { if (!index.has(name)) throw new Error(type + ': no bone ' + name); return index.get(name); }, names = bones.map(b => b.name);
  const mapOf = o => o.skeleton.bones.map(b => { let n = b; while (n && !MAPB[short(n.name)]) n = n.parent; return bone(n ? MAPB[short(n.name)] : 'pelvis'); });
  // its size: its hips as high as the clips' own, so its feet meet the ground as theirs do
  const s = up.pelvis.y / J.pelvis.y, dx = up.pelvis.x - J.pelvis.x * s, dz = up.pelvis.z - J.pelvis.z * s, place = v => v.multiplyScalar(s).add(V(dx, 0, dz));
  for (const v of Object.values(J)) place(v);
  for (const b of bones) if (J[b.name]) { b.position.copy(b.parent.worldToLocal(J[b.name].clone())); b.updateMatrixWorld(true); }
  const P = name => J[name].clone(), white = new THREE.Color(1, 1, 1), kinds = {}, cells = {}, pts = [];
  for (const o of sm) {
    const kind = kindOf(o.material); if (spec.drop && spec.drop.test(kind)) continue;
    o.skeleton.update();
    const cell = cells[kind] = cells[kind] || alloc(type + '_' + kind, (kind === 'body' || kind === 'color') && !spec.small ? 512 : 256), first = !kinds[kind];
    if (first) { kinds[kind] = []; ctx.drawImage(o.material.map.image, cell[0], cell[1], cell[2], cell[2]); }
    const g = piece(o.geometry, o.matrixWorld, cell, white, { mesh: o, map: mapOf(o) }), A = g.attributes.position;
    for (let i = 0; i < A.count; i++) { const v = place(V().fromBufferAttribute(A, i)); A.setXYZ(i, v.x, v.y, v.z); }
    g.userData.tris = trisOf(g, cell, names, (x, y, z) => z - J.Head.z > 0.045 && Math.abs(x - J.Head.x) < 0.075 && y > J.Head.y + 0.0 && y < J.Head.y + 0.165); kinds[kind].push(g);
    const SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
    for (let i = 0; i < A.count; i += 1) { const w = new Map(); for (let c = 0; c < 4; c++) if (SW.getComponent(i, c) > 0) w.set(SI.getComponent(i, c), (w.get(SI.getComponent(i, c)) || 0) + SW.getComponent(i, c)); const main = [...w].sort((a, b) => b[1] - a[1])[0]; pts.push({ x: A.getX(i), y: A.getY(i), z: A.getZ(i), r: REGION(names[main[0]]), w: [...w] }); }
  }
  for (const [kind, list] of Object.entries(kinds)) { const all = list.flatMap(g => g.userData.tris);
    for (const rule of PAINT[type] || []) if (rule.mat === kind) repaint(cells[kind], all.filter(t => rule.on.includes(t.r)), rule);
    bleed(cells[kind], all); }
  const shape = shapeOf(pts), groups = {}, was = {}, now = {}, count = g => g.index.count / 3, soft = [], built = [], held = [];
  const take = (o, boneName, to = built) => { o.updateWorldMatrix(true, true); o.traverse(m => { if (!m.isMesh) return; const u = m.userData, g = piece(m.geometry, m.matrixWorld, u.cell || CELL.white, u.cell ? (u.tint ? new THREE.Color(...u.tint) : white) : u.flat, { bone: bone(boneName), trim: u.trim, held: to === held }); to.push(u.lay ? lay(g, CELL[u.lay.lay], u.lay.metres, u.lay.facet) : g); }); };
  for (const [kind, list] of Object.entries(kinds)) {
    let m = mergeGeometries(list);
    if (spec.cut) { const keep = [], T = list.flatMap(g => g.userData.tris), ix = m.index.array; T.forEach((t, i) => { if (!spec.cut.includes(t.r)) keep.push(ix[i * 3], ix[i * 3 + 1], ix[i * 3 + 2]); }); m.setIndex(keep); }
    was[kind] = count(m); groups[kind] = thin(m, (spec.tris && spec.tris[kind]) || TRIS[kind] || OTHER); now[kind] = count(groups[kind]);
  }
  let crown = shape.hi;
  const c = { P, shape, add: g => soft.push(g), take };
  for (const [what, opt] of WEAR[type] || []) WEARS[what](c, opt);
  top.updateMatrixWorld(true);
  for (const kind of (GEAR[type] || []).filter(k => WORN[k])) {
    const [boneName, from, off, rot] = WORN[kind], item = makeGear(kind), at = P(boneName); if (from === 'top') at.y = crown;
    item.position.copy(at).add(V(...off)); item.rotation.set(...rot); take(item, boneName, held);
  }
  for (const kind of (GEAR[type] || []).filter(k => !WORN[k])) {
    const [boneName, pos, rot] = HOLD[kind], b = bones[bone(boneName)], item = makeGear(kind);
    item.position.set(...pos); item.rotation.set(...rot);
    const how = (POSES[type] && POSES[type][kind]) || POSE[kind];
    if (how) { const name = STAND[type] || STANDS, clip = made[name] || [...(await load('characters/animations.glb')).animations, ...(await load('characters/animations2.glb')).animations].find(c => c.name === name), mixer = new THREE.AnimationMixer(top), a = mixer.clipAction(clip); a.play(); mixer.setTime(0); top.updateMatrixWorld(true);
      const Y = V(...how.y).normalize(), Z = V(...(how.z || (Math.abs(Y.z) > 0.9 ? [0, 1, 0] : [0, 0, 1]))); Z.addScaledVector(Y, -Z.dot(Y)).normalize(); const X = Y.clone().cross(Z);
      item.quaternion.copy(wq(b).invert().multiply(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z))));
      if (how.out) item.position.copy(b.worldToLocal(b.localToWorld(V(0, 0.13, 0)).addScaledVector(Z, how.out)));
      a.stop(); mixer.uncacheRoot(top); top.updateMatrixWorld(true); }
    b.add(item); take(item, boneName, held); b.remove(item);
  }
  const ix = g => (g.index ? g : g.setIndex([...Array(g.attributes.position.count).keys()])), parts = Object.values(groups);
  for (const [k, list] of [['worn', [...soft, ...built]], ['gear', held]]) if (list.length) { const m = mergeGeometries(list.map(ix)); now[k] = count(m); parts.push(m); }
  const shaped = SHAPE[spec.shape];
  if (shaped) for (const t of parts.slice(0, -1 * (held.length ? 1 : 0) || undefined)) { const A = t.attributes.position, B = t.attributes.normal, SI = t.attributes.skinIndex, SW = t.attributes.skinWeight, p = V(), n = V(); for (let i = 0; i < A.count; i++) { p.fromBufferAttribute(A, i); n.fromBufferAttribute(B, i); let top4 = 0; for (let c = 1; c < 4; c++) if (SW.getComponent(i, c) > SW.getComponent(i, top4)) top4 = c; shaped(p, n, J.Head, REGION(names[SI.getComponent(i, top4)])); A.setXYZ(i, p.x, p.y, p.z); } }
  const geo = mergeVertices(mergeGeometries(parts.map(ix)));
  if (spec.fade) { const A = geo.attributes.position, C = geo.attributes.color; for (let i = 0; i < A.count; i++) { const k = Math.min(1, 0.3 + 0.7 * A.getY(i) / 1.0); if (C.getW(i) > 0.9) C.setXYZ(i, C.getX(i) * k * k, C.getY(i) * k * (0.5 + 0.5 * k), C.getZ(i) * k); } }   // the robe goes dark and blue toward its hem
  geo.scale(K, K, K);
  // bound as it stands at rest, the mesh at the origin: a figure's bones can then live outside the scene
  const root = new THREE.Group(), rig = new THREE.Group(); root.name = type; rig.name = type + '_rig'; rig.scale.setScalar(K);
  rig.add(top); root.add(rig); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  geo.computeBoundingBox(); const bb = geo.boundingBox;
  root.userData = { k: K, tall: +bb.max.y.toFixed(3), wide: +(bb.max.x - bb.min.x).toFixed(3), deep: +(bb.max.z - bb.min.z).toFixed(3) };
  const glb = await exportGlb(root);
  files[type + '.glb'] = b64(glb);
  say(type, spec.body, 'triangles', JSON.stringify(was), '->', JSON.stringify(now), '=', count(geo), 'points', geo.attributes.position.count, 'tall', bb.max.y.toFixed(2), 'wide', (bb.max.x - bb.min.x).toFixed(2), 'deep', (bb.max.z - bb.min.z).toFixed(2), 'made', s.toFixed(3), 'its size, wrist turned', twist.toFixed(2), Math.round(glb.byteLength / 1024) + ' KB');
  return { root, top, mesh, bones };
}

// a long bone from a to b: thick at its ends, thin between
function longBone(a, b, r, m = BONE, sides = 5) { const d = b.clone().sub(a), len = d.length(), o = lathe([[0, 0], [r * 1.55, len * 0.04], [r * 1.3, len * 0.12], [r * 0.85, len * 0.3], [r * 0.9, len * 0.75], [r * 1.5, len * 0.93], [0, len]], m, sides); o.position.copy(a); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; }
// The Skeleton: a person's bones as bones, each piece carried by one of the clips' bones (built here; no body under it).
async function skeleton(type = 'skeleton') {
  const { top, bones, up } = await rigOf(), index = new Map(bones.map((b, i) => [b.name, i])), bone = n => index.get(n), P = n => up[n].clone(), out = [], held = [], white = new THREE.Color(1, 1, 1);
  const take = (o, boneName, to = out) => { o.updateWorldMatrix(true, true); o.traverse(m => { if (!m.isMesh) return; const u = m.userData, g = piece(m.geometry, m.matrixWorld, u.cell || CELL.white, u.cell ? (u.tint ? new THREE.Color(...u.tint) : white) : u.flat, { bone: bone(boneName), trim: u.trim, held: to === held }); to.push(u.lay ? lay(g, CELL[u.lay.lay], u.lay.metres) : g); }); };
  const D = mat(0x1a1410), RAG = on('sack', 0x8a7458, 0.5);
  for (const [s, sx] of [['l', 1], ['r', -1]]) {
    const sh = P('upperarm_' + s), el = P('lowerarm_' + s), ha = P('hand_' + s), th = P('thigh_' + s), kn = P('calf_' + s), an = P('foot_' + s), bl = P('ball_' + s), fore = ha.clone().sub(el).normalize(), toe = bl.clone().sub(an).setY(0).normalize(), off = V(0, 0, 0.014);
    take(longBone(P('clavicle_' + s).setY(sh.y - 0.01), sh, 0.01), 'clavicle_' + s);
    take(longBone(sh, el, 0.017), 'upperarm_' + s);
    take(longBone(el.clone().add(off), ha.clone().add(off), 0.011), 'lowerarm_' + s); take(longBone(el.clone().sub(off), ha.clone().sub(off), 0.009, BONE, 4), 'lowerarm_' + s);
    take(part(new THREE.BoxGeometry(0.02, 0.05, 0.055), BONE, ...ha.clone().addScaledVector(fore, 0.03).toArray()), 'hand_' + s);
    for (let f = 0; f < 3; f++) { const base = ha.clone().addScaledVector(fore, 0.055).add(V(0, 0, (f - 1) * 0.02)); take(bar(base, base.clone().addScaledVector(fore, 0.075 - Math.abs(f - 1) * 0.01).add(V(0, -0.02, 0)), 0.007, 0.004, BONE, 3), 'hand_' + s); }
    take(longBone(th, kn, 0.022), 'thigh_' + s);
    take(longBone(kn, an, 0.018), 'calf_' + s); take(longBone(kn.clone().add(V(sx * 0.024, 0, -0.01)), an.clone().add(V(sx * 0.02, 0, -0.01)), 0.008, BONE, 4), 'calf_' + s);
    take(ball(kn.clone().add(V(0, 0, 0.03)), 0.022, 0.026, 0.014, BONE, 5, 3), 'calf_' + s);
    take(ball(an.clone().add(V(0, -0.02, -0.03)), 0.026, 0.03, 0.04, BONE, 5, 3), 'foot_' + s);
    for (let f = 0; f < 3; f++) { const a = an.clone().add(V((f - 1) * 0.02, -0.03, 0)), b = bl.clone().add(V((f - 1) * 0.028, 0, 0)).setY(0.012); take(bar(a, b, 0.009, 0.007, BONE, 3), 'foot_' + s); take(bar(b, b.clone().addScaledVector(toe, 0.06 - Math.abs(f - 1) * 0.01), 0.007, 0.004, BONE, 3), 'ball_' + s); }
    const sc = ball(V(sx * 0.085, P('spine_03').y + 0.1, P('spine_03').z - 0.085), 0.05, 0.07, 0.01, BONE, 6, 4); sc.rotation.y = -sx * 0.3; take(sc, 'spine_03');   // shoulder blade
    const hip = ball(V(sx * 0.08, P('pelvis').y + 0.04, P('pelvis').z - 0.01), 0.07, 0.085, 0.022, BONE, 8, 5); hip.rotation.y = sx * 0.7; hip.rotation.z = -sx * 0.25; take(hip, 'pelvis');
    take(part(new THREE.TorusGeometry(0.04, 0.012, 3, 6), BONE, sx * 0.05, P('pelvis').y - 0.045, P('pelvis').z + 0.02), 'pelvis');
  }
  const chain = ['pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head'];
  for (let i = 0; i < chain.length - 1; i++) { const a = P(chain[i]), b = P(chain[i + 1]), n = Math.max(1, Math.round(a.distanceTo(b) / 0.045));
    for (let j = 0; j < n; j++) { const c = a.clone().lerp(b, (j + 0.5) / n), back = i < 3 ? 0.04 : 0.012; const v = part(new THREE.CylinderGeometry(0.02, 0.02, 0.028, 5, 1, true), BONE, c.x, c.y, c.z - back); v.scale.z = 1.5; take(v, chain[i]); } }
  const lo = P('spine_01').y + 0.06, hi = P('neck_01').y - 0.05, cz = P('spine_02').z + 0.01, R = [0.09, 0.118, 0.134, 0.14, 0.136, 0.12, 0.092];
  R.forEach((r, i) => { const y = lo + (hi - lo) * i / (R.length - 1), o = part(new THREE.TorusGeometry(r, 0.0105, 3, 10), BONE, 0, y, cz); o.rotation.x = Math.PI / 2 + 0.24; o.scale.set(1, 0.72, 1); take(o, y < P('spine_03').y ? 'spine_02' : 'spine_03'); });
  take(part(new THREE.BoxGeometry(0.04, (hi - lo) * 0.6, 0.012), BONE, 0, lo + (hi - lo) * 0.66, cz + 0.1), 'spine_03');   // breastbone
  take(part(new THREE.BoxGeometry(0.07, 0.09, 0.03), BONE, 0, P('pelvis').y + 0.01, P('pelvis').z - 0.05), 'pelvis');
  const hd = P('Head'); take(skull(0.105).translateY(hd.y + 0.1).translateZ(hd.z + 0.012), 'Head');
  take(part(new THREE.BoxGeometry(0.2, 0.26, 0.014), RAG, 0, P('pelvis').y - 0.15, P('pelvis').z + 0.085), 'pelvis'); take(part(new THREE.BoxGeometry(0.2, 0.22, 0.014), RAG, 0, P('pelvis').y - 0.13, P('pelvis').z - 0.095), 'pelvis');
  const nk = P('neck_01'); take(ring(V(0, nk.y - 0.01, nk.z), 0.06, 0.026, TEAMCLOTH, V(0, 1, 0.1), 1, 10), 'spine_03');   // a torn scarf in its side's colour
  take(part(new THREE.BoxGeometry(0.07, 0.26, 0.012), TEAMCLOTH, 0.03, nk.y - 0.15, nk.z + 0.1), 'spine_03');
  { const kind = 'rustsword', [boneName, pos] = HOLD[kind], b = bones[bone(boneName)], item = makeGear(kind), how = POSE[kind], clip = (await load('characters/animations.glb')).animations.find(c => c.name === STAND[type]), mixer = new THREE.AnimationMixer(top), a = mixer.clipAction(clip);
    item.position.set(...pos); a.play(); mixer.setTime(0); top.updateMatrixWorld(true);
    const Y = V(...how.y).normalize(), Z = V(0, 0, 1); Z.addScaledVector(Y, -Z.dot(Y)).normalize(); item.quaternion.copy(wq(b).invert().multiply(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Y.clone().cross(Z), Y, Z))));
    a.stop(); mixer.uncacheRoot(top); top.updateMatrixWorld(true); b.add(item); take(item, boneName, held); b.remove(item); }
  const ix = g => (g.index ? g : g.setIndex([...Array(g.attributes.position.count).keys()])), geo = mergeVertices(mergeGeometries([...out, ...held].map(ix)));
  const root = new THREE.Group(), rig = new THREE.Group(); root.name = type; rig.name = type + '_rig'; rig.add(top); root.add(rig); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  geo.computeBoundingBox(); const bb = geo.boundingBox; root.userData = { k: 1, tall: +bb.max.y.toFixed(3), wide: +(bb.max.x - bb.min.x).toFixed(3), deep: +(bb.max.z - bb.min.z).toFixed(3) };
  const glb = await exportGlb(root); files[type + '.glb'] = b64(glb);
  say(type, 'built: triangles', geo.index.count / 3, 'points', geo.attributes.position.count, 'tall', bb.max.y.toFixed(2), Math.round(glb.byteLength / 1024) + ' KB');
}

// Rocketbox's dog moved as Quaternius' wolf moves: at each moment every bone of the dog is turned from where it stands at rest by as much as the wolf's bone is turned from where the wolf stands at the start of its Idle, and its hips carried as the wolf's are, to the dog's size.
const MAKE = {
  async dogAsWolf(spec, anims) {
    const dog = (await load('people/dog.glb')).scene, wolf = await load('creatures/Wolf.gltf'), D = {}, Wn = {}, order = [];
    dog.traverse(o => { if (o.isBone) { D[o.name.replace(/^dog_?/, '')] = o; order.push(o); } }); wolf.scene.traverse(o => { Wn[o.name] = o; });
    const mixer = new THREE.AnimationMixer(wolf.scene), pose = (clip, t) => { mixer.stopAllAction(); const a = mixer.clipAction(clip); a.play(); mixer.setTime(t); wolf.scene.updateMatrixWorld(true); }, find = n => wolf.animations.find(c => c.name === n);
    for (const n of Object.values(spec.clips)) if (!find(n)) throw new Error('the wolf has no clip ' + n);
    pose(find('Idle'), 0); dog.updateMatrixWorld(true);
    for (const [root, head, hip] of [[dog, D.Head, D.Pelvis], [wolf.scene, Wn.Head, Wn.Back]]) { const f = wp(head).sub(wp(hip)); root.rotation.y = -Math.atan2(f.x, f.z); root.updateMatrixWorld(true); }
    const same = Math.sign(wp(D.L_Thigh).x) === Math.sign(wp(Wn.BackLegL).x), map = { Pelvis: 'Back', Spine: 'Torso', Spine1: 'Torso2', Spine2: 'Torso3', Neck: 'Neck1', Neck1: 'Neck2', Neck2: 'Neck3', Head: 'Head', Tail: 'Tail2', Tail1: 'Tail4', Tail2: 'Tail6', Tail3: 'Tail8' };
    for (const s of ['L', 'R']) { const w = same ? s : s === 'L' ? 'R' : 'L'; Object.assign(map, { [s + '_Clavicle']: 'FrontShoulder' + w, [s + '_UpperArm']: 'FrontUpperLeg' + w, [s + '_Forearm']: 'FrontLowerLeg' + w, [s + '_Hand']: 'FF' + w, [s + '_Thigh']: 'BackLeg' + w, [s + '_Calf']: 'BackUpperLeg' + w, [s + '_Foot']: 'BackLowerLeg' + w, [s + '_Toe0']: 'FFB' + w }); }
    for (const [k, v] of Object.entries(map)) if (!D[k] || !Wn[v]) throw new Error('no bone ' + k + ' or ' + v);
    const QD = {}, QW = {}, rest = new Map(), key = b => b.name.replace(/^dog_?/, ''); for (const b of order) { rest.set(b, b.quaternion.clone()); if (map[key(b)]) { QD[key(b)] = wq(b); QW[key(b)] = wq(Wn[map[key(b)]]); } }
    const hip0 = wp(D.Pelvis), whip0 = wp(Wn.Back), k = hip0.y / whip0.y, top = D.Pelvis.parent, topQ = wq(top);
    for (const [name, from] of Object.entries(spec.clips)) {
      const clip = find(from), n = Math.max(2, Math.round(clip.duration * FPS) + 1), times = Float32Array.from({ length: n }, (_, i) => clip.duration * i / (n - 1)), vals = {}, hips = [];
      for (const b of order) if (map[key(b)]) vals[b.name] = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) { pose(clip, Math.min(clip.duration - 1e-4, times[i])); const WT = new Map([[top, topQ]]);
        for (const b of order) { const pq = WT.get(b.parent), kk = key(b); let w; if (map[kk]) { w = wq(Wn[map[kk]]).multiply(QW[kk].clone().invert()).multiply(QD[kk]); pq.clone().invert().multiply(w).toArray(vals[b.name], i * 4); } else w = pq.clone().multiply(rest.get(b)); WT.set(b, w); }
        hips.push(wp(Wn.Back).sub(whip0).multiplyScalar(k).add(hip0)); }
      if (name === 'Walk') { const drift = hips[n - 1].clone().sub(hips[0]); hips.forEach((p, i) => { p.x -= drift.x * i / (n - 1); p.z -= drift.z * i / (n - 1); }); const mz = hips.reduce((a, p) => a + p.z, 0) / n; hips.forEach(p => { p.z += hip0.z - mz; }); }
      const pv = new Float32Array(n * 3); hips.forEach((p, i) => top.worldToLocal(p.clone()).toArray(pv, i * 3));
      const tracks = Object.entries(vals).map(([b, v]) => new THREE.QuaternionKeyframeTrack(b + '.quaternion', times, v)); tracks.push(new THREE.VectorKeyframeTrack(D.Pelvis.name + '.position', times, pv));
      anims[name] = new THREE.AnimationClip(name, clip.duration, tracks);
    }
    mixer.stopAllAction(); return dog;
  },
};
// The Dragon Whelp: the scanned iguana on bones laid along its own middle line (hips to head, hips to tail's tip, each point carried by the two joints it lies between), its long tail curled round beside it, two wings built at its shoulders, and five clips written here (it flies: nothing of it walks).
MAKE.iguanaWhelp = async (spec, anims) => {
  const src = (await load('creatures/iguana.glb')).scene; let m; src.updateMatrixWorld(true); src.traverse(o => { if (o.isMesh) m = o; });
  const g = m.geometry.clone().applyMatrix4(m.matrixWorld), A = g.attributes.position, n = A.count; g.computeBoundingBox();
  { const b = g.boundingBox, L = b.max.z - b.min.z; let front = 0, back = 0; for (let i = 0; i < n; i++) { const z = A.getZ(i); if (z > b.max.z - L * 0.15) front = Math.max(front, A.getY(i)); if (z < b.min.z + L * 0.15) back = Math.max(back, A.getY(i)); } if (back > front) { g.rotateY(Math.PI); } }   // its head (the high end) to +Z
  g.computeVertexNormals(); g.computeBoundingBox(); const z0 = g.boundingBox.min.z, L = g.boundingBox.max.z - z0, at = f => z0 + f * L;
  // joints: how far along it each lies (0 the tail's tip, 1 the nose)
  const SP = [['pelvis', 0.62], ['back', 0.71], ['chest', 0.79], ['neck', 0.855], ['head', 0.9]], TL = [['tail1', 0.62], ['tail2', 0.5], ['tail3', 0.39], ['tail4', 0.28], ['tail5', 0.17], ['tail6', 0.07]];
  const mid = z => { let x = 0, y = 0, c = 0, top = 0; for (let i = 0; i < n; i++) if (Math.abs(A.getZ(i) - z) < L * 0.012) { x += A.getX(i); y += A.getY(i); top = Math.max(top, A.getY(i)); c++; } return c ? Object.assign(V(x / c, y / c, z), { top }) : null; };
  const bones = [], B = {}, add = (name, pos, parent) => { const b = new THREE.Bone(); b.name = name; b.userData.at = pos.clone(); b.position.copy(parent ? pos.clone().sub(parent.userData.at) : pos); if (parent) parent.add(b); B[name] = b; bones.push(b); return b; };
  const hips = mid(at(0.62)), root = add('root', V(hips.x, 0, hips.z));
  { let p = root; for (const [name, f] of SP) p = add(name, mid(at(f)), p); p = B.pelvis; for (const [name, f] of TL.slice(1)) p = add(name, mid(at(f)), p); }
  const idx = name => bones.indexOf(B[name]), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), band = L * 0.03;
  // each point: the joint whose stretch of the body it lies in, shared with the next where the two meet
  const chainW = (z, chain, dir) => { let k = 0; for (let j = 0; j < chain.length; j++) if (dir > 0 ? z >= at(chain[j][1]) : z <= at(chain[j][1])) k = j; const next = chain[k + 1], prev = chain[k - 1], out = [[chain[k][0], 1]];
    if (next) { const d = Math.abs(at(next[1]) - z); if (d < band) { const t = 0.5 * (1 - d / band); out[0][1] = 1 - t; out.push([next[0], t]); } }
    if (prev && out.length === 1) { const d = Math.abs(z - at(chain[k][1])); if (d < band) { const t = 0.5 * (1 - d / band); out[0][1] = 1 - t; out.push([prev[0], t]); } } return out; };
  const tailChain = [['pelvis', 0.62], ...TL.slice(1)];
  for (let i = 0; i < n; i++) { const z = A.getZ(i), w = z >= at(0.62) ? chainW(z, SP, 1) : chainW(z, tailChain, -1); w.forEach(([b, x], k) => { si[i * 4 + k] = idx(b); sw[i * 4 + k] = x; }); }
  g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  // wings: a shoulder, an elbow, a wrist and three fingers a side, skin stretched between them and down to its flank
  const chest = mid(at(0.79)), flank = mid(at(0.66)), HIDE = on('hide', 0x9a9a6c, 0.35), SPAR = on('hide', 0x5c6040, 0.3), extra = [];
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const K = 0.75, S = V(chest.x + sx * 0.045, chest.top - 0.02, chest.z + 0.01), E = S.clone().add(V(sx * 0.15, 0.2, -0.1).multiplyScalar(K)), Wr = E.clone().add(V(sx * 0.1, 0.12, -0.24).multiplyScalar(K)), F1 = Wr.clone().add(V(sx * 0.1, -0.1, -0.3).multiplyScalar(K)), F2 = Wr.clone().add(V(sx * 0.05, -0.27, -0.22).multiplyScalar(K)), F3 = Wr.clone().add(V(sx * 0.0, -0.36, -0.06).multiplyScalar(K)), Bd = V(flank.x + sx * 0.06, flank.top - 0.05, flank.z);
    const w1 = add('wing' + s + '1', S, B.chest), w2 = add('wing' + s + '2', E, w1), w3 = add('wing' + s + '3', Wr, w2), P = [[S, 'chest'], [E, w1.name], [Wr, w2.name], [F1, w3.name], [F2, w3.name], [F3, w3.name], [Bd, 'back'], [E.clone().lerp(F3, 0.5).add(V(0, -0.02, 0)), w2.name]];
    const tri = [[0, 1, 6], [1, 7, 6], [1, 2, 7], [2, 5, 7], [7, 5, 6], [2, 4, 5], [2, 3, 4]], pos = [], ix = [], bi = [];
    P.forEach(([p, b]) => { pos.push(p.x, p.y, p.z); bi.push(bones.indexOf(B[b])); }); for (const t of tri) ix.push(...(sx > 0 ? t : [t[0], t[2], t[1]]));
    const web = new THREE.BufferGeometry(), N = P.length, col = new Uint8Array(N * 4), wi = new Uint16Array(N * 4), ww = new Float32Array(N * 4), uv = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { col[i * 4] = Math.round(HIDE.color.r * 255); col[i * 4 + 1] = Math.round(HIDE.color.g * 255); col[i * 4 + 2] = Math.round(HIDE.color.b * 255); col[i * 4 + 3] = 255; wi[i * 4] = bi[i]; ww[i * 4] = 1; }
    web.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); web.setIndex(ix); web.computeVertexNormals(); web.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); web.setAttribute('color', new THREE.BufferAttribute(col, 4, true)); web.setAttribute('skinIndex', new THREE.BufferAttribute(wi, 4)); web.setAttribute('skinWeight', new THREE.BufferAttribute(ww, 4));
    extra.push(lay(web, CELL.hide, 0.6));
    for (const [a, b, bn, r] of [[S, E, w1.name, 0.011], [E, Wr, w2.name, 0.009], [Wr, F1, w3.name, 0.005], [Wr, F2, w3.name, 0.005], [Wr, F3, w3.name, 0.005]]) { const o = bar(a, b, r, r * 0.6, SPAR, 4); o.updateWorldMatrix(true, true); extra.push(lay(piece(o.geometry, o.matrixWorld, CELL.white, SPAR.color, { bone: bones.indexOf(B[bn]) }), CELL.hide, 0.5)); }
  }
  const pic = await picture('/src/creatures/iguana.jpg'), mesh = new THREE.SkinnedMesh(g, new THREE.MeshBasicMaterial({ map: Object.assign(new THREE.Texture(pic), { needsUpdate: true }) })), scene = new THREE.Group(); mesh.name = 'iguana';
  scene.add(root); scene.add(mesh); scene.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4()); scene.userData.extra = extra;
  // its clips: turns about the figure's own lines (x: nose down; y: to its left... ; z: its left side up), each bone's own, and the root's place
  const E3 = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)).toArray(), rot = (bone, t, list) => new THREE.QuaternionKeyframeTrack(bone + '.quaternion', t, list.flatMap(e => E3(...e))), move = (t, list) => new THREE.VectorKeyframeTrack('root.position', t, list.flatMap(p => [root.position.x + p[0], root.position.y + p[1], root.position.z + p[2]]));
  const wings = (t, f) => ['L', 'R'].flatMap((s, k) => [1, 2, 3].map(j => rot('wing' + s + j, t, t.map((tt, i) => f(j, i, k ? -1 : 1)))));
  { const t = [0, 1, 2]; anims.Idle = new THREE.AnimationClip('Idle', 2, [rot('head', t, [[0, 0, 0], [0.03, 0, 0], [0, 0, 0]]), rot('neck', t, [[0, 0, 0], [0.02, 0, 0], [0, 0, 0]])]); }
  { const N = 12, D = 0.72, t = Array.from({ length: N + 1 }, (_, i) => D * i / N), ph = i => 2 * Math.PI * i / N;
    anims.Walk = new THREE.AnimationClip('Walk', D, [move(t, t.map((_, i) => [0, 0.2 + 0.035 * Math.sin(ph(i) - 1.2), 0])), rot('pelvis', t, t.map((_, i) => [-0.12 + 0.04 * Math.sin(ph(i)), 0, 0])),
      ...wings(t, (j, i, sx) => (j === 1 ? [0, -sx * 0.35, sx * (-0.1 + 0.6 * Math.sin(ph(i)))] : j === 2 ? [0, -sx * 0.3, sx * (0.05 + 0.42 * Math.sin(ph(i) - 0.7))] : [0, -sx * 0.15, sx * 0.3 * Math.sin(ph(i) - 1.3)])),
      ...TL.slice(1).map(([name], k) => rot(name, t, t.map((_, i) => [0.05, 0.1 * Math.sin(ph(i) - k * 0.9), 0])))]); }
  { const t = [0, 0.3, 0.5, 0.62, 0.85, 1.1];
    anims.Attack = new THREE.AnimationClip('Attack', 1.1, [move(t, [[0, 0, 0], [0, 0.02, -0.06], [0, 0.03, 0.24], [0, 0.02, 0.22], [0, 0, 0.05], [0, 0, 0]]), rot('chest', t, [[0, 0, 0], [-0.3, 0, 0], [0.35, 0, 0], [0.3, 0, 0], [0.08, 0, 0], [0, 0, 0]]), rot('neck', t, [[0, 0, 0], [-0.3, 0, 0], [0.45, 0, 0], [0.4, 0, 0], [0.1, 0, 0], [0, 0, 0]]), rot('head', t, [[0, 0, 0], [-0.25, 0, 0], [0.3, 0, 0], [0.25, 0, 0], [0, 0, 0], [0, 0, 0]]),
      ...wings(t, (j, i, sx) => (j === 1 ? [0, 0, sx * [0, 0.45, -0.25, -0.15, 0, 0][i]] : j === 2 ? [0, 0, sx * [0, 0.3, -0.2, -0.1, 0, 0][i]] : [0, 0, 0]))]); }
  { const t = [0, 0.1, 0.26, 0.5];
    anims.Hit = new THREE.AnimationClip('Hit', 0.5, [move(t, [[0, 0, 0], [0, 0, -0.07], [0, 0, -0.03], [0, 0, 0]]), rot('chest', t, [[0, 0, 0], [-0.28, 0, 0.08], [-0.1, 0, 0.03], [0, 0, 0]]), rot('neck', t, [[0, 0, 0], [-0.25, 0.1, 0], [-0.1, 0.03, 0], [0, 0, 0]]),
      ...wings(t, (j, i, sx) => (j === 1 ? [0, 0, sx * [0, 0.3, 0.1, 0][i]] : [0, 0, 0]))]); }
  { const t = [0, 0.35, 0.8, 1.1, 1.6];
    anims.Death = new THREE.AnimationClip('Death', 1.6, [rot('root', t, [[0, 0, 0], [-0.15, 0, 0.2], [0.05, 0, 1.2], [0.05, 0, 1.4], [0.05, 0, 1.4]]), move(t, [[0, 0, 0], [0, 0.03, -0.03], [0, 0.02, 0], [0, 0.0, 0], [0, 0, 0]]), rot('neck', t, [[0, 0, 0], [-0.3, 0, 0], [0.2, 0.2, 0], [0.45, 0.3, 0], [0.5, 0.3, 0]]), rot('head', t, [[0, 0, 0], [-0.2, 0, 0], [0.2, 0, 0], [0.35, 0, 0], [0.4, 0, 0]]),
      ...wings(t, (j, i, sx) => (j === 1 ? [0, sx * [0, 0, 0.3, 0.5, 0.5][i], sx * [0, 0.3, -0.5, -0.8, -0.85][i]] : j === 2 ? [0, 0, sx * [0, 0.1, -0.3, -0.5, -0.5][i]] : [0, 0, 0]))]); }
  return scene;
};
// A creature of its own: one whole model made one mesh of the same kind as a person's (the shared picture, thinned, bound as it stands at rest), with its own bones and its own few clips in its own file.
async function creature(type) {
  const spec = CRE[type], anims = {}; let scene;
  if (spec.make) scene = await MAKE[spec.make](spec, anims);
  else if (spec.file.endsWith('.dae')) {
    const get = async f => { const d = new ColladaLoader().parse(await (await fetch('/src/' + f)).text(), '/src/none/'), names = new Map(); d.scene.traverse(o => names.set(o.uuid, o.name));
      for (const c of d.scene.animations || []) for (const t of c.tracks) { const i = t.name.lastIndexOf('.'); t.name = names.get(t.name.slice(0, i)) + t.name.slice(i); } return d.scene; };
    scene = await get(spec.file); for (const [name, f] of Object.entries(spec.clips)) anims[name] = (await get(f)).animations[0];
  } else { const src = await load(spec.file); scene = src.scene; for (const [name, from] of Object.entries(spec.clips)) anims[name] = from.map(n => src.animations.find(a => a.name === n)).find(Boolean); }
  for (const [name, c] of Object.entries(anims)) if (!c) throw new Error(type + ': no clip for ' + name);
  scene.updateMatrixWorld(true);
  const skinned = [], loose = []; scene.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); else if (o.isMesh) loose.push(o); });
  const bones = skinned[0].skeleton.bones, index = new Map(bones.map((b, i) => [b, i])), byName = n => { const b = bones.find(b => b.name === n); if (!b) throw new Error(type + ': no bone ' + n); return b; }, list = [];
  const turn = (b, angle, axis = [1, 0, 0]) => { const p = b.parent.getWorldQuaternion(new THREE.Quaternion()); return p.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(V(...axis), angle)).multiply(p); };   // a turn about one of the figure's own lines (side to side unless told), as that bone's own
  for (const [bn, axis, angle] of spec.tail || []) {   // in the rest pose and in every clip
    const b = byName(bn), q = turn(b, angle, axis); b.quaternion.premultiply(q); scene.updateMatrixWorld(true);
    for (const c of Object.values(anims)) for (const t of c.tracks) if (t.name === b.name + '.quaternion') { const k = new THREE.Quaternion(); for (let i = 0; i < t.values.length; i += 4) k.fromArray(t.values, i).premultiply(q).toArray(t.values, i); }
  }
  if (spec.stride) {   // each leg bone's turn away from where it is on average, made larger
    const [which, amp] = spec.stride, q = new THREE.Quaternion(), m = new THREE.Quaternion(), ax = V();
    for (const t of anims.Walk.tracks) { if (!t.name.endsWith('.quaternion') || !which.test(t.name)) continue;
      const v = t.values, sum = [0, 0, 0, 0]; for (let i = 0; i < v.length; i += 4) { const sg = v[i] * v[0] + v[i + 1] * v[1] + v[i + 2] * v[2] + v[i + 3] * v[3] < 0 ? -1 : 1; for (let c = 0; c < 4; c++) sum[c] += v[i + c] * sg; }
      m.fromArray(sum).normalize();
      for (let i = 0; i < v.length; i += 4) { q.fromArray(v, i); const d = m.clone().invert().multiply(q); if (d.w < 0) d.set(-d.x, -d.y, -d.z, -d.w); const ang = 2 * Math.acos(Math.min(1, d.w)), sn = Math.sqrt(1 - Math.min(1, d.w * d.w));
        if (sn > 1e-5) { ax.set(d.x / sn, d.y / sn, d.z / sn); d.setFromAxisAngle(ax, ang * amp); } m.clone().multiply(d).toArray(v, i); } }
  }
  let cell = null; if (spec.pic) { cell = alloc(type, 256); ctx.drawImage(await picture('/src/' + spec.pic), cell[0], cell[1], cell[2], cell[2]); const d = ctx.getImageData(cell[0], cell[1], cell[2], cell[2]); for (let i = 0; i < d.data.length; i++) if (i % 4 !== 3) d.data[i] = Math.min(255, d.data[i] * spec.gain); ctx.putImageData(d, cell[0], cell[1]); }   // its picture is dark for a dungeon: made brighter
  if (spec.map) { cell = alloc(type, spec.map); ctx.drawImage(skinned[0].material.map.image, cell[0], cell[1], cell[2], cell[2]); }
  const how = (m, skin) => (cell ? [cell, new THREE.Color(1, 1, 1), Object.assign(skin, { flipV: !spec.map })] : [CELL.white, m.color.clone(), skin]);
  for (const o of skinned) { o.skeleton.update(); const g = piece(o.geometry, o.matrixWorld, ...how(o.material, { mesh: o, map: o.skeleton.bones.map(b => index.get(b)) })); list.push(spec.lay ? lay(g, CELL[spec.lay], 1) : g); }
  for (const o of loose) { let b = o.parent; while (b && !index.has(b)) b = b.parent; list.push(piece(o.geometry, o.matrixWorld, ...how(o.material, { bone: b ? index.get(b) : 0 }))); }
  let geo = mergeGeometries(list); const was = geo.index.count / 3;
  if (spec.map) { const U = geo.attributes.uv, ix = geo.index.array, tris = []; for (let t = 0; t < ix.length; t += 3) tris.push([0, 1, 2].flatMap(k => [U.getX(ix[t + k]) * W - cell[0], U.getY(ix[t + k]) * H - cell[1]])); if (spec.paint) repaint(cell, tris, spec.paint); bleed(cell, tris); }
  if (was > spec.tris) geo = thin(geo, spec.tris);
  if (scene.userData.extra) geo = mergeGeometries([geo, ...scene.userData.extra.map(g => (g.index ? g : g.setIndex([...Array(g.attributes.position.count).keys()])))]);
  if (spec.collar) { const [bn, rad, tube, offs, squash] = spec.collar, b = byName(bn), at = V().setFromMatrixPosition(b.matrixWorld), kid = b.children.find(c => c.isBone), dir = kid ? V().setFromMatrixPosition(kid.matrixWorld).sub(at) : V(0, 0, 1);
    const o = ring(at.add(V(...offs)), rad, tube, TEAM, dir, squash, 12); o.updateWorldMatrix(true, true); geo = mergeGeometries([geo, piece(o.geometry, o.matrixWorld, CELL.white, TEAM.color, { bone: index.get(b), trim: true })]); }
  geo = mergeVertices(geo); geo.computeBoundingBox();
  const bb = geo.boundingBox, k = spec.long / (bb.max.z - bb.min.z), lift = -bb.min.y * k, mid = -(bb.max.z + bb.min.z) / 2 * k, midx = spec.midx ? -(bb.max.x + bb.min.x) / 2 * k : 0; geo.scale(k, k, k); geo.translate(midx, lift, mid);
  const root = new THREE.Group(), rig = new THREE.Group(); root.name = type; rig.name = type + '_rig'; rig.scale.setScalar(k); rig.position.set(midx, lift, mid);
  for (const o of [...skinned, ...loose]) o.removeFromParent();
  rig.add(scene); root.add(rig); root.updateMatrixWorld(true);
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })); mesh.name = type;
  root.add(mesh); mesh.bind(new THREE.Skeleton(bones, bones.map(b => b.matrixWorld.clone().invert())), new THREE.Matrix4());
  const out = [];
  for (const [name, c] of Object.entries(anims)) out.push(resample(new THREE.AnimationClip(name, c.duration, c.tracks.filter(moving)), name));
  if (spec.flinch) {   // no struck clip came with it: a short one made here, its neck and back thrown back and let go
    const tracks = spec.flinch.map((n, i) => { const b = byName(n), q0 = b.quaternion.clone(), q1 = q0.clone().premultiply(turn(b, -0.22 + i * 0.05)); return new THREE.QuaternionKeyframeTrack(n + '.quaternion', [0, 0.1, 0.24, 0.5], [...q0.toArray(), ...q1.toArray(), ...q0.clone().slerp(q1, 0.35).toArray(), ...q0.toArray()]); });
    out.push(new THREE.AnimationClip('Hit', 0.5, tracks));
  }
  geo.computeBoundingBox(); const nb = geo.boundingBox, speed = stride(root, mesh, out.find(c => c.name === 'Walk'));
  root.userData = { k: 1, speed, contact: reach(root, mesh, out.find(c => c.name === 'Attack')), tall: +nb.max.y.toFixed(3), wide: +(nb.max.x - nb.min.x).toFixed(3), deep: +(nb.max.z - nb.min.z).toFixed(3) };
  const glb = await exportGlb(root, out);
  files[type + '.glb'] = b64(glb);
  say(type, 'triangles', was, '->', geo.index.count / 3, 'points', geo.attributes.position.count, 'tall', nb.max.y.toFixed(2), 'wide', (nb.max.x - nb.min.x).toFixed(2), 'long', (nb.max.z - nb.min.z).toFixed(2), 'walks at', speed, 'm/s, strikes at', root.userData.contact, 's; clips', out.map(c => c.name + ' ' + c.duration.toFixed(1) + 's').join(', '), Math.round(glb.byteLength / 1024) + ' KB');
}

// Rocketbox's own motion (a walk, a run, a way of standing) put onto the clips' bones: at each moment every bone is turned from where it stands at rest by as much as Rocketbox's bone is turned from where the body was stood (standAs), and the hips carried as its hips are, to the clips' own height.
const made = {};
async function realClips() {
  for (const [name, [file, body]] of Object.entries(RB)) {
    const { top, bones, up } = await rigOf(), st = await standAs(body, up), back = Object.fromEntries(Object.entries(MAPB).map(([k, v]) => [v, k])), QU = {}, rest = {};
    for (const b of bones) { QU[b.name] = wq(b); rest[b.name] = b.quaternion.clone(); }
    const clip = (await load('people/' + file + '.glb')).animations[0], still = /Idle/.test(name), dur = still ? 0.2 : clip.duration, n = still ? 2 : Math.max(2, Math.round(dur * FPS) + 1), k = up.pelvis.y / st.J.pelvis.y;
    const mixer = new THREE.AnimationMixer(st.src), act = mixer.clipAction(clip); act.play();
    const times = Float32Array.from({ length: n }, (_, i) => dur * i / (n - 1)), vals = {}, hips = [], root = bones.find(b => b.name === 'root');
    for (const b of bones) if (st.Q[b.name]) vals[b.name] = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      mixer.setTime(still ? 0 : Math.min(clip.duration - 1e-4, times[i])); st.src.updateMatrixWorld(true);
      const WT = { '': wq(top) };
      for (const b of bones) { const pq = WT[b.parent.isBone ? b.parent.name : '']; let w;
        if (st.Q[b.name]) { w = wq(st.S[back[b.name]]).multiply(st.Q[b.name].clone().invert()).multiply(QU[b.name]); pq.clone().invert().multiply(w).toArray(vals[b.name], i * 4); } else w = pq.clone().multiply(rest[b.name]);
        WT[b.name] = w; }
      hips.push(wp(st.S.Pelvis).multiplyScalar(k));
    }
    act.stop(); mixer.uncacheRoot(st.src);
    const drift = hips[n - 1].clone().sub(hips[0]), mean = V(); hips.forEach((p, i) => { if (!still) { p.x -= drift.x * i / (n - 1); p.z -= drift.z * i / (n - 1); } mean.add(p); }); mean.multiplyScalar(1 / n);
    const pv = new Float32Array(n * 3); hips.forEach((p, i) => root.worldToLocal(V(p.x - mean.x + up.pelvis.x, p.y, p.z - mean.z + up.pelvis.z)).toArray(pv, i * 3));
    const tracks = Object.entries(vals).map(([b, v]) => new THREE.QuaternionKeyframeTrack(b + '.quaternion', times, v)); tracks.push(new THREE.VectorKeyframeTrack('pelvis.position', times, pv));
    made[name] = new THREE.AnimationClip(name, dur, tracks);
    say(name, 'from', file, 'on', body, dur.toFixed(2) + 's', n, 'keys, the hips drifted', drift.length().toFixed(2), 'm');
  }
}

async function clips(first) {
  const src = [...(await load('characters/animations.glb')).animations, ...(await load('characters/animations2.glb')).animations], out = [], speeds = {}, contact = {};
  for (const name of CLIPS) {
    const c = src.find(a => a.name === name); if (!c) throw new Error('no clip ' + name);
    out.push(resample(new THREE.AnimationClip(name, c.duration, c.tracks.filter(t => moving(t) && !/thumb|index|middle|ring|pinky|leaf/.test(t.name) && t.name !== 'root.position'))));   // the fingers stay as the body has them; nobody is carried off its tile
  }
  for (const c of Object.values(made)) out.push(c.optimize());
  for (const name of WALKS) speeds[name] = stride(first.root, first.mesh, out.find(c => c.name === name));
  for (const name of STRIKES) contact[name] = LANDS[name] ?? reach(first.root, first.mesh, out.find(c => c.name === name));
  const bare = new THREE.Group(); bare.name = 'clips'; bare.userData = { speeds, contact }; bare.add(first.top);
  const glb = await exportGlb(bare, out);
  files['anim.glb'] = b64(glb);
  say('clips', out.map(c => c.name + ' ' + c.duration.toFixed(2) + 's').join(', '), '| walking speeds', JSON.stringify(speeds), '| strikes land at', JSON.stringify(contact), Math.round(glb.byteLength / 1024) + ' KB');
}

window.bake = async only => {
  await MeshoptSimplifier.ready;
  { const [x, y, s] = alloc('white', 128); ctx.fillStyle = '#fff'; ctx.fillRect(x, y, s, s); }
  for (const name of Object.keys(SURF)) await surface(name);
  await props();
  await realClips();
  let first;
  for (const type of Object.keys(SPEC)) { if (only && first && !only.includes(type)) continue; const u = await person(type); first = first || u; }
  await clips(first);
  if (!only || only.includes('skeleton')) await skeleton();
  for (const type of Object.keys(CRE)) if (!only || only.includes(type)) await creature(type);
  files['atlas.jpg'] = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  say('picture', W + ' x ' + H, 'squares left:', slots[512].length, 'large,', slots[256].length, 'middling,', slots[128].length, 'small');
  return { files, log };
};
