// the pool table: an 8 ft drop-pocket table built by the metre, sixteen ivory balls rolled by their own sums in the table's plane, two cues to take up, and a game to eight against whoever puts money on it
import * as THREE from 'three';
import { G, UP, clamp, mergeStatic } from '../sushi/ctx.js';
import { Tool } from '../sushi/items.js';
import { PH } from '../sushi/physics.js';
import { pbr, plain, slab, tube, canvasTex } from './kit.js';
import { R } from './room.js';

const HX = 0.56, HZ = 1.12, BED = 0.79, BR = 0.0286, CUSH = 0.05, RAIL = 0.125, LX = HX - BR, LZ = HZ - BR, BY = BED + BR;
const FA = 0.3, FK = 0.3, E_BALL = 0.94, E_CUSH = 0.74, CAP = 7.5, STOP = 0.012, WIN = 8;
const RAILX = -0.595, RAILY = 0.4982, SLOT = 2 * BR + 0.001, TIP = 1.2;
const ON = 0, DROP = 1, ROLL = 2, RACKED = 3, OUT = 4;
// the six pockets: where a ball falls (cap), where the cushion is open (mouth), the hole drawn (vr), where a shot is aimed (ax, az)
const POCKETS = [];
for (const sx of [-1, 1]) { for (const sz of [-1, 1]) POCKETS.push({ x: sx * (HX + 0.02), z: sz * (HZ + 0.02), cap: 0.062, mouth: 0.095, vr: 0.062, ax: sx * (HX - 0.012), az: sz * (HZ - 0.012), side: false });
  POCKETS.push({ x: sx * (HX + 0.04), z: 0, cap: 0.05, mouth: 0.079, vr: 0.06, ax: sx * (HX + 0.005), az: 0, side: true }); }
const ORDER = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 6, 13, 7, 14, 15];
const COLORS = ['#e8dcc0', '#d9a520', '#1f3f8a', '#a8221c', '#4a2466', '#c8601a', '#1f6a3a', '#6a1a1c', '#141210'];

const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _f = new THREE.Vector3(), _o = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _e = new THREE.Euler();

// the inside edge of the rails (the bed's rectangle and the pocket holes together), or the cloth (the rectangle less the holes), walked round the centre
function outline(ix, iz, grow) {
  const raw = [], N = 1440;
  for (let k = 0; k < N; k++) { const th = k / N * Math.PI * 2, c = Math.cos(th), s = Math.sin(th); let t = Math.min(ix / Math.abs(c || 1e-9), iz / Math.abs(s || 1e-9));
    for (const p of POCKETS) { const b = c * p.x + s * p.z, q = b * b - (p.x * p.x + p.z * p.z - p.vr * p.vr); if (q <= 0) continue; const sq = Math.sqrt(q), tin = b - sq, tout = b + sq;
      if (grow) { if (tin <= t && tout > t) t = tout; } else if (tin > 0 && tin < t) t = tin; }
    raw.push(new THREE.Vector2(c * t, s * t)); }
  const out = [raw[0]]; let a = 0;
  for (let j = 2; j <= N; j++) { const A = raw[a], B = raw[j % N], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1; let far = 0;
    for (let k = a + 1; k < j; k++) far = Math.max(far, Math.abs((raw[k].x - A.x) * dy - (raw[k].y - A.y) * dx) / L);
    if (far > 0.0007) { a = j - 1; out.push(raw[a]); } }
  return out;
}
function flat(shape, y, depth, material, parent) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).rotateX(-Math.PI / 2), uv = g.attributes.uv, t = material.userData.tile || 1;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / t, uv.getY(i) / t);
  const m = new THREE.Mesh(g, material); m.position.y = y; m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
// a cushion: its back against the rail at x = 0, its nose CUSH toward -x, running along z, mitred to the pocket at each end
function cushion(b0, n0, b1, n1, tile) {
  const prof = [[0, 0], [0, 0.04], [CUSH, 0.0375], [CUSH, 0.026], [0.014, 0]], P = (k, e) => { const [d, y] = prof[k], f = d / CUSH; return [-d, y, e ? b1 + (n1 - b1) * f : b0 + (n0 - b0) * f]; };
  const pos = [], uv = [], c = [-CUSH * 0.4, 0.02, (b0 + b1) / 2];
  const tri = (A, B, C) => { const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2], nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const out = nx * ((A[0] + B[0] + C[0]) / 3 - c[0]) + ny * ((A[1] + B[1] + C[1]) / 3 - c[1]) + nz * ((A[2] + B[2] + C[2]) / 3 - c[2]) > 0;
    for (const V of out ? [A, B, C] : [A, C, B]) { pos.push(V[0], V[1], V[2]); uv.push(V[2] / tile, (V[1] - V[0]) / tile); } };
  for (let k = 1; k < 4; k++) { tri(P(k, 0), P(k + 1, 0), P(k + 1, 1)); tri(P(k, 0), P(k + 1, 1), P(k, 1)); }
  for (const e of [0, 1]) for (let k = 1; k < 4; k++) tri(P(0, e), P(k, e), P(k + 1, e));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); return g;
}

function buildTable(g) {
  const st = new THREE.Group(); g.add(st);
  const walnut = pbr('walnut', { tile: 1.2, color: 0x5c3a2a, rough: 0.5, env: 0.8 }), cloth = pbr('velvet', { tile: 0.5, color: 0x1f5a34 }).clone(), leather = pbr('leather', { tile: 0.3, color: 0x4a2c1a, side: THREE.DoubleSide }), br = plain(0xb08a3a, { rough: 0.34, metal: 0.8, env: 1.3 }), ivory = plain(0xe8dcc0, { rough: 0.35 });
  cloth.map = null; cloth.color.set(0x123f25); cloth.roughness = 1; cloth.envMapIntensity = 0.05;   // the velvet's weave without its red
  const ix = HX + CUSH, iz = HZ + CUSH, ox = ix + RAIL, oz = iz + RAIL, top = BED + 0.04;
  const rail = new THREE.Shape([new THREE.Vector2(-ox, -oz), new THREE.Vector2(ox, -oz), new THREE.Vector2(ox, oz), new THREE.Vector2(-ox, oz)]); rail.holes.push(new THREE.Path(outline(ix, iz, true)));
  flat(rail, BED - 0.03, 0.07, walnut, st);
  flat(new THREE.Shape(outline(ix, iz, false)), BED - 0.03, 0.03, cloth, st);
  { const tl = cloth.userData.tile, long = cushion(0.06, 0.068, HZ - 0.035, HZ - 0.085, tl), longM = cushion(-(HZ - 0.035), -(HZ - 0.085), -0.06, -0.068, tl), end = cushion(-(HX - 0.035), -(HX - 0.085), HX - 0.035, HX - 0.085, tl);
    const put = (geo, x, z, ry) => { const m = new THREE.Mesh(geo, cloth); m.position.set(x, BED, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; st.add(m); };
    for (const geo of [long, longM]) { put(geo, ix, 0, 0); put(geo, -ix, 0, Math.PI); } put(end, 0, iz, -Math.PI / 2); put(end, 0, -iz, Math.PI / 2); }
  slab(1.0, 0.2, 2.12, walnut, 0, 0.66, 0, st); slab(1.04, 0.035, 2.16, walnut, 0, 0.575, 0, st);
  { const leg = new THREE.LatheGeometry([[0, 0], [0.05, 0], [0.062, 0.025], [0.05, 0.06], [0.036, 0.1], [0.05, 0.16], [0.076, 0.27], [0.07, 0.36], [0.046, 0.44], [0.066, 0.47], [0.066, 0.5], [0.05, 0.52], [0.072, 0.54], [0.072, 0.56]].map(([x, y]) => new THREE.Vector2(x, y)), 14);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const m = new THREE.Mesh(leg, walnut); m.position.set(sx * 0.42, 0, sz * 0.98); m.castShadow = true; m.receiveShadow = true; st.add(m); } }
  { const bag = new THREE.LatheGeometry([[0.066, 0], [0.064, -0.05], [0.052, -0.1], [0.03, -0.128], [0, -0.135]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
    for (const p of POCKETS) { const m = new THREE.Mesh(bag, leather); m.position.set(p.x, BED - 0.03, p.z); m.castShadow = true; m.receiveShadow = true; st.add(m);
      const arc = p.side ? Math.PI : Math.PI * 1.3, rim = new THREE.Mesh(new THREE.TorusGeometry(p.vr + 0.005, 0.009, 6, 14, arc).rotateX(Math.PI / 2), leather); rim.position.set(p.x, top - 0.002, p.z); rim.rotation.y = arc / 2 - Math.atan2(p.z, p.x); rim.castShadow = true; rim.receiveShadow = true; st.add(rim); } }
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) { // brass at the corners, over the rail and down its sides
      slab(0.2, 0.004, 0.084, br, sx * (ox - 0.098), top + 0.002, sz * (oz - 0.04), st); slab(0.084, 0.004, 0.12, br, sx * (ox - 0.04), top + 0.002, sz * (oz - 0.142), st);
      slab(0.2, 0.078, 0.004, br, sx * (ox - 0.098), BED + 0.005, sz * (oz + 0.002), st); slab(0.004, 0.078, 0.2, br, sx * (ox + 0.002), BED + 0.005, sz * (oz - 0.098), st); }
    slab(0.07, 0.004, 0.16, br, sx * (ox - 0.033), top + 0.002, 0, st); slab(0.004, 0.078, 0.16, br, sx * (ox + 0.002), BED + 0.005, 0, st); }
  { const dot = new THREE.CircleGeometry(0.0065, 8).rotateX(-Math.PI / 2), put = (x, z) => { const m = new THREE.Mesh(dot, ivory); m.position.set(x, top + 0.0006, z); m.receiveShadow = true; st.add(m); };
    for (const s of [-1, 1]) { for (const k of [-3, -2, -1, 1, 2, 3]) put(s * (ix + 0.07), k * HZ / 4); for (const k of [-1, 0, 1]) put(k * HX / 2, s * (iz + 0.07)); } }
  for (const x of [RAILX - 0.02, RAILX + 0.02]) tube(0.006, 0.006, 2.04, br, x, 0.47, 0, st, 6).rotation.x = Math.PI / 2;   // the rail the pocketed balls lie on
  for (const z of [-0.9, 0, 0.9]) { slab(0.14, 0.008, 0.014, br, -0.565, 0.461, z, st); slab(0.008, 0.1, 0.014, br, -0.5, 0.51, z, st); }
  for (const s of [-1, 1]) slab(0.07, 0.04, 0.006, br, RAILX, 0.485, s * 1.0, st);
  mergeStatic(st);
}

function ballSkin() {
  return canvasTex(512, 256, (x) => { x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let n = 0; n < 16; n++) { const cx = (n % 4) * 128, cy = (n >> 2) * 64, col = COLORS[n === 0 ? 0 : (n - 1) % 8 + 1];
      x.fillStyle = n > 8 || n === 0 ? COLORS[0] : col; x.fillRect(cx, cy, 128, 64);
      if (n > 8) { x.fillStyle = col; x.fillRect(cx, cy + 17, 128, 30); }
      for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${i % 2 ? '60,40,10' : '255,250,230'},0.05)`; x.fillRect(cx + (i * 37 + n * 11) % 124, cy + (i * 23 + n * 7) % 60, 3 + i % 4, 1 + i % 3); }
      if (n) for (const u of [32, 96]) { x.fillStyle = COLORS[0]; x.beginPath(); x.arc(cx + u, cy + 32, 9.5, 0, 7); x.fill(); x.fillStyle = '#17120c'; x.font = `bold ${n > 9 ? 11 : 13}px Georgia, serif`; x.fillText(String(n), cx + u, cy + 33); } } });
}
function cueGeo() {
  const dark = [0.2, 0.09, 0.05], maple = [0.74, 0.56, 0.32], iv = [0.86, 0.8, 0.66], tip = [0.2, 0.26, 0.34];
  const prof = [[0, -0.25, iv], [0.0155, -0.25, iv], [0.0158, -0.238, iv], [0.0158, -0.238, dark], [0.0138, 0.1, dark], [0.0136, 0.1, maple], [0.0068, 1.172, maple], [0.0068, 1.172, iv], [0.0066, 1.193, iv], [0.0066, 1.193, tip], [0.0058, 1.2, tip], [0, 1.2, tip]];
  const g = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 8), col = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < g.attributes.position.count; i++) col.set(prof[i % prof.length][2], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g.rotateX(-Math.PI / 2);
}

class Cue extends Tool {
  constructor(pool, geo, material, handle) {
    const o = new THREE.Group(), m = new THREE.Mesh(geo, material); m.castShadow = true; o.add(m, new THREE.Mesh(handle.geo, handle.mat));
    super('cue', o, { name: 'pool cue', radius: 0.25, lift: 0 }); this.center.set(0, 0, -0.3); this.pool = pool; this.useMode = 'cue'; this.tx = this.ty = this.tz = 0; this.has = false; this.cool = 0; this.pow = 0; this.pull = 0.03; this.charging = false;
  }
  onGrab(h) { super.onGrab(h); this.tool = !!h.xr; this.has = false; this.pow = 0; this.charging = false; this.pull = 0.03; }
  onRelease() { this.tool = true; this.homing = true; this.charging = false; return true; }
  onHeld(dt, h) { this.pool.cueHeld(this, dt, h); }
  hint() { const s = this.pool.state(); return (s.on ? `${s.turn === 'you' ? 'your shot' : 'their shot'} · you ${s.you}, them ${s.them} · ` : '') + 'look at the table, hold RMB or E to draw back, let go to strike'; }
}

export function buildPool(scene, room) {
  const OX = R.pool.x, OZ = R.pool.z, g = new THREE.Group(); g.position.set(OX, 0, OZ); scene.add(g);
  buildTable(g);
  { const x0 = OX - HX - CUSH - RAIL, x1 = OX + HX + CUSH + RAIL, z0 = OZ - HZ - CUSH - RAIL, z1 = OZ + HZ + CUSH + RAIL;
    room.solids.push({ x0, x1, z0, z1 }); G.surfaces.push({ minX: OX - HX, maxX: OX + HX, minZ: OZ - HZ, maxZ: OZ + HZ, y: BED });
    if (PH.ready) PH.box(OX, BED - 0.06, OZ, HX + CUSH, 0.05, HZ + CUSH); }

  // ---- the balls: one mesh, one picture, each ball its own corner of it
  const X = new Float64Array(16), Z = new Float64Array(16), Y = new Float64Array(16), VX = new Float64Array(16), VZ = new Float64Array(16), X0 = new Float64Array(16), Z0 = new Float64Array(16), TM = new Float32Array(16), TG = new Float32Array(16), ST = new Uint8Array(16), PK = new Uint8Array(16);
  const QS = []; for (let i = 0; i < 16; i++) QS.push(new THREE.Quaternion());
  const geo = new THREE.SphereGeometry(BR, 18, 12), PAD = 4, uvo = new Float32Array(32);
  for (let i = 0; i < 16; i++) { uvo[i * 2] = ((i % 4) * 128 + PAD) / 512; uvo[i * 2 + 1] = 1 - (((i >> 2) + 1) * 64 - PAD) / 256; }
  geo.setAttribute('uvo', new THREE.InstancedBufferAttribute(uvo, 2));
  const bm = new THREE.MeshStandardMaterial({ map: ballSkin(), roughness: 0.2, envMapIntensity: 1.1 });
  bm.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 uvo;').replace('#include <uv_vertex>', `#include <uv_vertex>\nvMapUv = vMapUv * vec2(${(128 - 2 * PAD) / 512}, ${(64 - 2 * PAD) / 256}) + uvo;`); };
  const balls = new THREE.InstancedMesh(geo, bm, 16); balls.castShadow = true; balls.receiveShadow = true; balls.frustumCulled = false; g.add(balls);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.2, depthWrite: false })); line.visible = false; g.add(line);

  const game = { on: false, turn: 'you', you: 0, them: 0, stake: 0, who: null, skill: 0.5, wait: 0 };
  let active = false, moving = 0, shot = null, fresh = true, quiet = false, sndT = -1, lineT = -1, rerack = 0, slotA = 0, slotB = 0, free = 0, shots = 0, last = null, seedN = 1881;
  const rnd = () => { seedN = (seedN + 0x6d2b79f5) | 0; let t = Math.imul(seedN ^ (seedN >>> 15), 1 | seedN); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sound = (name, k) => { if (quiet || G.t - sndT < 0.03) return; sndT = G.t; const e = G.camera.matrixWorld.elements, d = Math.hypot(e[12] - OX, e[14] - OZ); G.audio?.play(name, k * clamp(1.5 - d / 5, 0.15, 1)); };
  const say = (what) => { if (game.who != null) G.folk?.say?.(game.who, what); };

  function sync() { for (let i = 0; i < 16; i++) { _v.set(X[i], Y[i], Z[i]); _m.compose(_v, QS[i], _s); balls.setMatrixAt(i, _m); } balls.instanceMatrix.needsUpdate = true; }
  function roll(i, dx, dz) { const d = Math.hypot(dx, dz); if (d < 1e-7) return; _a.set(dz / d, 0, -dx / d); _q.setFromAxisAngle(_a, d / BR); QS[i].premultiply(_q); }
  function rack() {
    for (let i = 0; i < 16; i++) { VX[i] = VZ[i] = 0; ST[i] = ON; Y[i] = BY; TM[i] = 0; QS[i].setFromEuler(_e.set(-Math.PI / 2 + Math.sin(i * 12.9) * 0.6, i * 2.4, Math.cos(i * 7.3) * 0.6)); }
    X[0] = 0; Z[0] = HZ / 2; let k = 0; const d = 2 * BR + 0.0004;
    for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) { const i = ORDER[k++]; X[i] = (c - r / 2) * d; Z[i] = -HZ / 2 - r * d * 0.8661; }
    active = false; moving = 0; shot = null; fresh = true; slotA = slotB = free = 0; rerack = 0; sync();
  }
  function clear(x, z, skip) { for (let k = 0; k < 16; k++) if (k !== skip && ST[k] === ON && (X[k] - x) ** 2 + (Z[k] - z) ** 2 < 4.1 * BR * BR) return false; return true; }
  function respot() { let x = 0, z = HZ / 2; for (let k = 0; k < 40 && !clear(x, z, 0); k++) { const s = (k >> 1) + 1; x = (k & 1 ? -1 : 1) * s * 2.1 * BR; if (Math.abs(x) > LX - 0.01) { x = 0; z -= 2.1 * BR; } } X[0] = x; Z[0] = z; Y[0] = BY; VX[0] = VZ[0] = 0; ST[0] = ON; }

  function pocket(i, p) {
    ST[i] = DROP; TM[i] = 0; PK[i] = p; VX[i] = VZ[i] = 0; sound('pocket', 1);
    if (i === 0) { if (shot) shot.foul = true; return; }
    const by = game.on ? (shot ? shot.by : game.turn) : 'you';
    if (game.on) game[by]++; else free++;
    if (shot) shot.n++;
    TG[i] = by === 'them' ? -0.96 + slotB++ * SLOT : 0.96 - slotA++ * SLOT;
  }
  function walls(i) {
    let x = X[i], z = Z[i], inM = -1;
    for (let p = 0; p < 6; p++) { const P = POCKETS[p], dx = x - P.x, dz = z - P.z, d2 = dx * dx + dz * dz; if (d2 < P.cap * P.cap) return pocket(i, p); if (d2 < P.mouth * P.mouth) inM = p; }
    if (inM >= 0) { if (Math.abs(x) > LX + 0.004 || Math.abs(z) > LZ + 0.004) pocket(i, inM); return; }
    if (x > LX || x < -LX) { const s = Math.sign(x); x = s * LX; if (VX[i] * s > 0) { if (VX[i] * s > 0.25) sound('cushion', Math.min(1, VX[i] * s / 2.5)); VX[i] *= -E_CUSH; VZ[i] *= 0.97; } }
    if (z > LZ || z < -LZ) { const s = Math.sign(z); z = s * LZ; if (VZ[i] * s > 0) { if (VZ[i] * s > 0.25) sound('cushion', Math.min(1, VZ[i] * s / 2.5)); VZ[i] *= -E_CUSH; VX[i] *= 0.97; } }
    X[i] = x; Z[i] = z;
  }
  function pairs(bounce) {
    let hit = false;
    for (let i = 0; i < 15; i++) { if (ST[i] !== ON) continue; const mi = VX[i] !== 0 || VZ[i] !== 0;
      for (let j = i + 1; j < 16; j++) { if (ST[j] !== ON || (bounce && !mi && VX[j] === 0 && VZ[j] === 0)) continue;
        let dx = X[j] - X[i], dz = Z[j] - Z[i]; const d2 = dx * dx + dz * dz; if (d2 >= 4 * BR * BR) continue;
        const d = Math.sqrt(d2); if (d > 1e-6) { dx /= d; dz /= d; } else { dx = 1; dz = 0; }
        const o = (2 * BR - d) / 2 + 1e-6; X[i] -= dx * o; Z[i] -= dz * o; X[j] += dx * o; Z[j] += dz * o; hit = true;
        if (!bounce) continue;
        const vn = (VX[i] - VX[j]) * dx + (VZ[i] - VZ[j]) * dz; if (vn <= 0) continue;
        const J = (1 + E_BALL) / 2 * vn; VX[i] -= J * dx; VZ[i] -= J * dz; VX[j] += J * dx; VZ[j] += J * dz; if (vn > 0.12) sound('ball', Math.min(1, 0.25 + vn / 3)); } }
    return hit;
  }
  function settle() {
    for (let k = 0; k < 12 && pairs(false); k++) for (let i = 0; i < 16; i++) if (ST[i] === ON) { let m = false; for (const P of POCKETS) if ((X[i] - P.x) ** 2 + (Z[i] - P.z) ** 2 < P.mouth * P.mouth) m = true; if (!m) { X[i] = clamp(X[i], -LX, LX); Z[i] = clamp(Z[i], -LZ, LZ); } }
    if (ST[0] === OUT) respot();
    const s = shot; shot = null;
    if (game.on && s) { if (game[s.by] >= WIN) end(s.by === 'you'); else { if (s.foul || !s.n) game.turn = s.by === 'you' ? 'them' : 'you'; game.wait = 2.4; } }
    else if (!game.on && free >= 15) rerack = 2.5;
  }
  function end(won) {
    game.on = false; last = { won, stake: game.stake, who: game.who, you: game.you, them: game.them }; say(won ? 'pool-lose' : 'pool-win');
    G.story?.onGame?.('pool', { won, stake: game.stake, who: game.who }); rerack = 8;
  }

  function step(dt) {
    let anim = false, drop = false;
    for (let i = 0; i < 16; i++) {
      if (ST[i] === DROP) { TM[i] += dt; const P = POCKETS[PK[i]], k = Math.min(1, dt * 16); X[i] += (P.x - X[i]) * k; Z[i] += (P.z - Z[i]) * k; Y[i] = BY - 6 * TM[i] * TM[i]; anim = drop = true;
        if (Y[i] < BED - 0.1) { if (i === 0) { ST[i] = OUT; Y[i] = -5; } else { ST[i] = ROLL; X[i] = RAILX; Y[i] = RAILY; Z[i] = 0; } } }
      else if (ST[i] === ROLL) { const d = TG[i] - Z[i], m = Math.min(Math.abs(d), 0.8 * dt) * Math.sign(d); Z[i] += m; roll(i, 0, m); anim = true; if (Math.abs(TG[i] - Z[i]) < 1e-5) { Z[i] = TG[i]; ST[i] = RACKED; sound('ball', 0.3); } }
    }
    if (moving) {
      let vm = 0; for (let i = 0; i < 16; i++) if (ST[i] === ON) { vm = Math.max(vm, Math.abs(VX[i]), Math.abs(VZ[i])); X0[i] = X[i]; Z0[i] = Z[i]; }
      const n = clamp(Math.ceil(vm * 1.42 * dt / (0.35 * BR)), 1, 48), h = dt / n;
      for (let s = 0; s < n; s++) {
        for (let i = 0; i < 16; i++) { if (ST[i] !== ON || (VX[i] === 0 && VZ[i] === 0)) continue; X[i] += VX[i] * h; Z[i] += VZ[i] * h;
          const sp = Math.hypot(VX[i], VZ[i]), ns = sp - (FA + FK * sp) * h; if (ns < STOP) VX[i] = VZ[i] = 0; else { VX[i] *= ns / sp; VZ[i] *= ns / sp; } }
        pairs(true);
        for (let i = 0; i < 16; i++) if (ST[i] === ON) walls(i);
      }
      moving = 0; for (let i = 0; i < 16; i++) if (ST[i] === ON) { roll(i, X[i] - X0[i], Z[i] - Z0[i]); if (VX[i] !== 0 || VZ[i] !== 0) moving++; }
      for (let i = 0; i < 16; i++) if (ST[i] === DROP) anim = drop = true;
    }
    if (!moving && !drop && (shot || ST[0] === OUT)) settle();
    active = moving > 0 || anim || ST[0] === OUT;
  }

  function hit(i, dx, dz, sp, by) {
    if (ST[i] !== ON) return false; const d = Math.hypot(dx, dz); if (d < 1e-6 || !(sp > 0)) return false;
    sp = Math.min(sp, CAP); VX[i] = dx / d * sp; VZ[i] = dz / d * sp; moving = Math.max(moving, 1); active = true; fresh = false; rerack = 0; shots++;
    if (!shot) shot = { by: game.on ? game.turn : by || 'you', n: 0, foul: false };
    sound('ball', Math.min(1, 0.3 + sp / 5)); return true;
  }
  const mayShoot = () => ST[0] === ON && (game.on ? game.turn === 'you' && !active : true);

  // ---- the opponent's eye: the ball and pocket with the straightest clear road, struck as true as their skill allows
  function open(ax, az, bx, bz, s1, s2) { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
    for (let k = 1; k < 16; k++) { if (k === s1 || k === s2 || ST[k] !== ON) continue; const t = clamp(((X[k] - ax) * dx + (Z[k] - az) * dz) / L2, 0, 1), ex = X[k] - ax - dx * t, ez = Z[k] - az - dz * t; if (ex * ex + ez * ez < 3.9 * BR * BR) return false; } return true; }
  const speedFor = (s) => Math.sqrt(2 * FA * s) + FK * s * 0.9;
  function aiShot(skill = 0.5) {
    if (ST[0] !== ON || active) return false;
    const cx = X[0], cz = Z[0]; let best = 0, dx = 0, dz = 0, sp = 0;
    if (fresh) { dx = X[1] - cx; dz = Z[1] - cz; sp = 6.2; }
    else { for (let b = 1; b < 16; b++) { if (ST[b] !== ON) continue;
        for (const P of POCKETS) { let nx = P.ax - X[b], nz = P.az - Z[b]; const L2 = Math.hypot(nx, nz); if (L2 < 1e-4) continue; nx /= L2; nz /= L2; if (P.side && Math.abs(nx) < 0.45) continue;
          const gx = X[b] - nx * 2 * BR, gz = Z[b] - nz * 2 * BR; let mx = gx - cx, mz = gz - cz; const L1 = Math.hypot(mx, mz); if (L1 < 1e-4) continue; mx /= L1; mz /= L1;
          const cut = mx * nx + mz * nz; if (cut < 0.3 || !open(cx, cz, gx, gz, b, 0) || !open(X[b], Z[b], P.ax, P.az, b, 0)) continue;
          const sc = cut * cut / (1 + 0.6 * (L1 + L2)); if (sc > best) { best = sc; dx = mx; dz = mz; const vo = speedFor(L2) * 1.3 + 0.5, vc = vo / Math.max(cut, 0.35); sp = clamp(Math.sqrt(vc * vc + 2 * FA * L1) + FK * L1, 1.2, 6); } } }
      if (!best) { let bd = 1e9; for (let b = 1; b < 16; b++) if (ST[b] === ON) { const d = Math.hypot(X[b] - cx, Z[b] - cz); if (d < bd) { bd = d; dx = X[b] - cx; dz = Z[b] - cz; } } if (bd > 1e8) return false; sp = 2.6; } }
    const a = Math.atan2(dz, dx) + (rnd() + rnd() + rnd() - 1.5) * (0.004 + (1 - clamp(skill, 0, 1)) * 0.06);
    return hit(0, Math.cos(a), Math.sin(a), sp, 'them');
  }

  // ---- the cues: one leant on the near end, one laid along the far rail
  function showLine(dx, dz) { const tx = dx > 0 ? (LX - X[0]) / dx : dx < 0 ? (-LX - X[0]) / dx : 9, tz = dz > 0 ? (LZ - Z[0]) / dz : dz < 0 ? (-LZ - Z[0]) / dz : 9;
    line.position.set(X[0], BED + 0.002, Z[0]); line.rotation.y = Math.atan2(-dx, -dz); line.scale.set(0.007, 1, Math.max(0.02, Math.min(tx, tz))); line.visible = true; lineT = G.t; }
  function cueHeld(cue, dt, h) {
    cue.cool -= dt; const o = cue.obj;
    if (h.xr) {
      _v.set(0, 0, -TIP).applyQuaternion(o.quaternion).add(o.position); const tx = _v.x - OX, ty = _v.y, tz = _v.z - OZ;
      _a.set(0, 0, -1).applyQuaternion(o.quaternion); const al = Math.hypot(_a.x, _a.z), ax = _a.x / (al || 1), az = _a.z / (al || 1);
      if (cue.has && dt > 0 && cue.cool <= 0 && al > 0.3 && ty < BY + BR + 0.03 && (!game.on || mayShoot())) {
        const sx = tx - cue.tx, sy = ty - cue.ty, sz = tz - cue.tz, vx = sx / dt, vz = sz / dt, sp = Math.hypot(vx, vz), L2 = sx * sx + sy * sy + sz * sz || 1e-9;
        if (sp > 0.2) for (let i = 0, n = game.on ? 1 : 16; i < n; i++) { if (ST[i] !== ON) continue;
          const rx = X[i] - cue.tx, ry = BY - cue.ty, rz = Z[i] - cue.tz, t = clamp((rx * sx + ry * sy + rz * sz) / L2, 0, 1), ex = rx - sx * t, ey = ry - sy * t, ez = rz - sz * t;
          if (ex * ex + ey * ey + ez * ez > (BR + 0.006) ** 2 || vx * rx + vz * rz <= 0) continue;
          hit(i, vx / sp + ax, vz / sp + az, sp * 1.25, 'you'); cue.cool = 0.35; h.pulse(Math.min(1, 0.3 + sp / 4), 40); break; }
      }
      cue.tx = tx; cue.ty = ty; cue.tz = tz; cue.has = true;
      if (mayShoot() && !moving && al > 0.3) { const rx = X[0] - tx, rz = Z[0] - tz, along = rx * ax + rz * az; if (along > -0.02 && along < 0.6 && Math.abs(rx * az - rz * ax) < 0.045 && Math.abs(ty - BY) < 0.1) showLine(ax, az); }
      return;
    }
    const e = G.camera.matrixWorld.elements, fy = -e[9]; let aim = false, dx = 0, dz = 0;
    if (mayShoot() && !moving && fy < -0.05) { const t = (BY - e[13]) / fy, lx = e[12] - e[8] * t - OX, lz = e[14] - e[10] * t - OZ;
      if (t < 4.5 && Math.abs(lx) < HX + 0.3 && Math.abs(lz) < HZ + 0.3) { aim = true; dx = -e[8]; dz = -e[10]; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d; } }
    if (!aim) { cue.charging = false; cue.pow = 0; cue.pull = 0.03; return; }
    if (h.use) { cue.charging = true; cue.pow = Math.min(1, cue.pow + dt / 1.1); }
    else if (cue.charging) { cue.charging = false; hit(0, dx, dz, 0.5 + cue.pow * 5.5, 'you'); cue.pow = 0; cue.pull = -0.01; }
    cue.pull += (0.03 + cue.pow * 0.3 - cue.pull) * Math.min(1, dt * 18);
    const c = 0.9877, s = 0.1564; _f.set(dx * c, -s, dz * c); _m.lookAt(_o, _f, UP); o.quaternion.setFromRotationMatrix(_m);
    o.position.set(OX + X[0] - dx * (BR + cue.pull), BY, OZ + Z[0] - dz * (BR + cue.pull)).addScaledVector(_f, -TIP);
    showLine(dx, dz);
  }
  const api = {};
  const cgeo = cueGeo(), cmat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, envMapIntensity: 0.8 }), handle = { geo: new THREE.CylinderGeometry(0.035, 0.035, 1.45, 6).rotateX(Math.PI / 2).translate(0, 0, -0.475), mat: new THREE.MeshBasicMaterial({ visible: false }) };
  const cues = [0, 1].map((k) => { const c = new Cue(api, cgeo, cmat, handle);
    if (k === 0) { _f.set(0.04, 0.87, -0.49).normalize(); _m.lookAt(_o, _f, _a.set(1, 0, 0)); _q.setFromRotationMatrix(_m); _v.set(OX + 0.3, 0.012, OZ + HZ + CUSH + RAIL + 0.475).addScaledVector(_f, 0.25); }
    else { _q.setFromAxisAngle(UP, 0.012); _v.set(OX + HX + CUSH + 0.07, BED + 0.04 + 0.0162, OZ + 0.42); }
    c.setHome(_v, _q); return c; });

  rack();
  Object.assign(api, {
    group: g, cues, cueHeld, origin: { x: OX, z: OZ }, size: { hx: HX, hz: HZ, bed: BED, r: BR }, pockets: POCKETS, auto: true,
    update(dt) {
      if (line.visible && G.t - lineT > 0.08) line.visible = false;
      if (rerack > 0 && !active && (rerack -= dt) <= 0 && !game.on) rack();
      if (game.on && game.turn === 'them' && !active && api.auto && (game.wait -= dt) <= 0) api.npcTurn();
      if (!active) return;
      step(dt); sync();
    },
    challenge(who, stake = 0, skill = 0.5) { if (game.on) return false; rack(); Object.assign(game, { on: true, turn: 'you', you: 0, them: 0, stake, who, skill, wait: 2.4 }); last = null; return true; },
    npcTurn(skill = game.skill) { if (!game.on || game.turn !== 'them' || active) return false; if (!aiShot(skill)) return false; say('pool-shot'); return true; },
    concede() { if (!game.on) return false; shot = null; end(false); return true; },
    state: () => ({ on: game.on, turn: game.turn, you: game.you, them: game.them, stake: game.stake, who: game.who }),
    // ---- for tests: places are the table's own (x across, z along, metres from its centre)
    rack, last: () => last, busy: () => active, shots: () => shots, seed(n) { seedN = n | 0; },
    strike(dx, dz, speed, i = 0) { return hit(i, dx, dz, speed, 'you'); },
    place(i, x, z) { X[i] = x; Z[i] = z; Y[i] = BY; VX[i] = VZ[i] = 0; ST[i] = ON; fresh = false; sync(); },
    balls() { const out = []; for (let i = 0; i < 16; i++) out.push({ n: i, x: X[i], z: Z[i], y: Y[i], vx: VX[i], vz: VZ[i], on: ST[i] === ON, st: ['table', 'falling', 'rolling', 'racked', 'out'][ST[i]] }); return out; },
    score: () => ({ you: game.you, them: game.them, free, onTable: ST.reduce((n, s, i) => n + (i && s === ON ? 1 : 0), 0) }),
    sim(seconds = 40, h = 1 / 120) { quiet = true; let t = 0; while (active && t < seconds) { step(h); t += h; } quiet = false; sync(); return t; },
    playOut(skillYou = 0.6, skillThem = game.skill, maxShots = 400) { let n = 0; quiet = true;
      while (game.on && n < maxShots) { api.sim(); quiet = true; if (!game.on) break; if (!aiShot(game.turn === 'you' ? skillYou : skillThem)) break; if (game.turn === 'them') say('pool-shot'); n++; }
      api.sim(); return { shots: n, ...last, on: game.on }; },
  });
  return api;
}
