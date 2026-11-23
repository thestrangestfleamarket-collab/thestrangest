// SKIRMISH TABLE's dungeon bake, the part that runs in a browser (tools/chess-bake.cjs dungeon): Kilnhold's hall round the board and the mountainside it has broken open on, all still.
// Near: one mesh on one picture (the hall's walls and things lit a point at a time, sun, sky, shade and the lava's glow worked out against everything that stands; the ground and the gorge's far wall painted whole, light and shadow in the paint), leaves and tree cards a second, falling water, mist and birds a third.
// Far: the whole country (ridges, forest, the tarn, the pass, the beacon) drawn once from the hall under a photographed sky into one all-round picture, its haze in the paint.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';
import { MeshBVH } from 'three-mesh-bvh';
import { thin, b64, exportGlb } from './chess-bake.page.js';
import { SHEET, TW, TH } from './chess-trees.page.js';

// the plan, in tiles (the board with its kerb is 9.7 by 11.7): a moat of lava round the board, a bank of rock round the moat, the hall's east wall with its gate, piers and two towers against the cliff, low broken walls before each seat, the west wall fallen into the gorge
const BX = 4.85, BZ = 5.85, MX = 5.5, MZ = 6.5, OX = 7.5, OZ = 7.5, LAVA = -0.3;
export const PITS = [[-5.98, -6.78], [5.98, -6.78], [-5.98, 6.78], [5.98, 6.78]];
const RIBTIPS = [], SCONCES = [[6.16, 2.15, -3.4], [6.16, 2.15, -1.25], [6.16, 2.15, 1.25], [6.16, 2.15, 3.4]];
const R0 = 5, R1 = 46, LS = 2048;                 // the ground's picture: from the moat out to 46 tiles, finer near (dungeon.js reads it the same way)
const EYE = new THREE.Vector3(0, 9, 0);           // where the far country is seen from
const EL0 = -35 * Math.PI / 180, EL1 = Math.PI / 2, PW = 4096, PH = 1424;
const W = 2048, H = 2048, CELL = { brick: [0, 0, 512, 2], wall: [512, 0, 512, 2], floor: [1024, 0, 512, 3], kerb: [512, 512, 256, 1.5], moat: [768, 512, 256, 1.5],
  namaqualand_boulder_02: [512, 768, 256], rock_moss_set_01: [1536, 0, 512], stone_fire_pit: [1024, 512, 256], large_iron_gate: [1280, 512, 256], treasure_chest: [1024, 768, 256], wine_barrel_01: [1280, 768, 256],
  wooden_crate_01: [1536, 512, 256], kite_shield: [1792, 512, 256], white: [1544, 776, 48], iron: [1608, 776, 48] };
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d'); ctx.fillStyle = '#4a4744'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.fillRect(1536, 768, 64, 64); ctx.fillStyle = '#3a3836'; ctx.fillRect(1600, 768, 64, 64);
const LW = 2048, LH = 1024, leafC = document.createElement('canvas'); leafC.width = LW; leafC.height = LH; const lctx = leafC.getContext('2d');
const log = [], files = {}, loader = new GLTFLoader();
let seed = 11; const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp, sm = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, lerp = (a, b, t) => a + (b - a) * t;

// ---- the mountainside: one height for every place
const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); };
const fbm = (x, y, o = 4) => { let a = 0.5, s = 0, n = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x, y); n += a; x = x * 2.03 + 17.1; y = y * 2.03 + 9.7; a *= 0.5; } return s / n; };
const ridged = (x, y, o = 5) => { let a = 0.5, s = 0, n = 0, w = 1; for (let i = 0; i < o; i++) { let v = 1 - Math.abs(2 * vnoise(x, y) - 1); v *= v; s += a * v * w; n += a; w = clamp(v * 1.6, 0, 1); x = x * 2.07 + 13.3; y = y * 2.07 + 5.9; a *= 0.5; } return s / n; };
const axis = z => -37 + 7 * Math.sin(z / 70) + 3 * Math.sin(z / 27 + 1.3) + 55 * Math.sin(z / 520 + 0.4) * sm(Math.abs(z), 150, 500);   // the Tarnwater's line down its gorge
const floorY = z => z > 0 ? Math.max(-76, -46 - 0.045 * z) : z > -420 ? -46 + 0.19 * -z : 33.8 - 0.1 * (-z - 420);
const floorW = z => 3 + Math.max(0, z - 90) * 0.22 - 1.2 * sm(-z, 150, 400);
const wallW = z => 15 + Math.max(0, z - 120) * 0.25;
const shelf = z => z < 0 ? (z > -9 ? 0 : z > -38 ? 6.5 * sm(-z, 9, 38) : 6.5 - 3.5 * sm(-z, 38, 56) + Math.max(0, -z - 56) * 0.2) : (z < 24 ? 0 : -22 * sm(z, 24, 90) - Math.max(0, z - 90) * 0.05);
const WL = -74, FALLZ = -1, BEACON = [125, -235];
function ground(x, z) {
  const ax = axis(z), sx = x - ax, east = sx >= 0, d = Math.abs(sx), fy = floorY(z), w = floorW(z), ww = wallW(z), t = (d - w) / ww, r = Math.hypot(x, z), sh = shelf(z), near = 1 - sm(Math.abs(z), 22, 40);
  const pass = 70 * Math.exp(-(((z + 420) / 70) ** 2));
  const rim = east ? sh - 2.5 * near : sh * 0.6 + 15 + 5 * fbm(z / 30, 3.3, 3);
  let y, b = 0;
  if (t <= 0) y = fy + (fbm(x / 5, z / 5, 3) - 0.5) * 1.2;
  else if (t < 1) { const tb = clamp(t + Math.sin(Math.PI * t) * ((fbm(z / 17, east ? 1.5 : 7.7, 3) - 0.5) * 0.7 + (fbm(z / 5, 2.2, 2) - 0.5) * 0.22), 0, 1), s = tb * tb * (3 - 2 * tb), top = rim + pass * sm(t, 0.3, 1);   // buttresses and gullies along the wall
    const ys = fy + (top - fy) * Math.pow(s, 0.75), band = 8.5, fr = ys / band - Math.floor(ys / band); y = lerp(ys, (Math.floor(ys / band) + sm(fr, 0.5, 1)) * band, 0.14 * Math.sin(Math.PI * t)); }                                                        // ledges: the rock lies in beds
  else {
    b = d - w - ww;
    if (east) { const bh = x + 16.1, q = lerp(bh, b, sm(Math.abs(z), 20, 60));
      y = sh - 2.5 * near * (1 - sm(b, 0.5, 8)) + 3.6 * (1 - sm(Math.abs(z), 10, 24)) * sm(q, 23.6, 31.6) + 12 * sm(q, 27.6, 52) - 8 * sm(q, 52, 78) + Math.max(0, q - 78) * 0.42; }
    else { y = rim + 0.08 * Math.min(b, 100) + Math.max(0, b - 100) * 0.36; const dz = Math.abs(z - FALLZ - 3 * Math.sin(x / 14)); if (dz < 3 && b < 70) y -= 3.5 * (1 - (dz / 3) ** 2) * (1 - sm(b, 40, 70)); }
    y += pass * Math.exp(-b / 50);
    y += ridged(x / 380 + 5.2, z / 380 + 1.7, r > 700 ? 3 : 4) * sm(b, 70, 520) * (east ? 380 : 300);
  }
  y += (fbm(x / 13, z / 13) - 0.5) * 3.2 * sm(r, 12, 40) * (1 - sm(r, 70, 170)) * (t > 0 && t < 1 ? 0.4 : 1);   // small rises, near only: far off they are finer than the far picture can hold
  y += ridged(x / 1100 + 1.1, z / 1100 + 4.3, r > 2500 ? 3 : 4) * 460 * sm(r, 500, 1600);
  y += 55 * Math.exp(-((x - BEACON[0]) ** 2 + (z - BEACON[1]) ** 2) / 1444);
  return y * sm(Math.max(Math.abs(x) + Math.max(0, x - 7.3) * 2.2, Math.abs(z)), 8.2, 13);   // the hall's own floor is level; the hill begins at once behind its east wall
}
const normalAt = (x, z, e = 0.3, out = V()) => out.set(ground(x - e, z) - ground(x + e, z), 2 * e, ground(x, z - e) - ground(x, z + e)).normalize();
// the valley road: up from the tarn, through the hall, on to the pass; a spur to the beacon
const ROAD = [[[60, 760], [34, 520], [12, 300], [-3, 130], [-2, 60], [-1, 26], [0, 8], [0, -8], [2, -36], [-6, -110], [-20, -290], [-28, -420], [-34, -600]], [[2, -40], [40, -90], [88, -160], [118, -222]]];
function roadAt(x, z) { let best = 1e9; for (const line of ROAD) for (let i = 0; i < line.length - 1; i++) { const [ax, az] = line[i], [bx, bz] = line[i + 1], dx = bx - ax, dz = bz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1); best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t)); } return best; }
const forestAt = (x, z, y, ny) => { const m = Math.max(Math.abs(x), Math.abs(z)); let f = sm(fbm(x / 45 + 3, z / 45 + 8), 0.38, 0.54);
  f = Math.max(f, Math.exp(-((x + 19) ** 2 + (Math.abs(z) - 33) ** 2) / 90), 0.8 * Math.exp(-(((x - axis(z) + 26) / 7) ** 2)) * (1 - sm(Math.abs(z), 70, 95)));   // the stands on the near rim, the line along the far one
  return f * sm(ny, 0.74, 0.86) * sm(m, 12, 19) * (1 - sm(y, 230, 300)) * sm(y, WL + 1, WL + 6) * sm(roadAt(x, z), 1.5, 4); };
// what the ground is made of at a place: forest floor, road, the hall's bare floor (painted as light alone), snow
const matAt = (x, z, y, n) => [forestAt(x, z, y, n.y), 1 - sm(roadAt(x, z), 0.5, 1.4), 1 - sm(Math.max(Math.abs(x), Math.abs(z)), 7.42, 7.58), sm(y + 50 * fbm(x / 60, z / 60), 360, 470) * sm(n.y, 0.5, 0.8)];

// ---- light: the sun from the east over the cliff, the sky's fill, the ground's bounce, the lava's glow from the moat, the embers' from the pits and the wall's baskets; shade from everything that stands
const SUN = V(8, 9, 1).normalize(), SUNC = [0.68, 0.615, 0.5], SKYC = [0.45, 0.5, 0.57], BOUNCE = [0.13, 0.115, 0.09], HZ = [0.445, 0.52, 0.59];
const hazeAt = p => { const d = Math.hypot(p.x - EYE.x, p.y - EYE.y, p.z - EYE.z); let f = 0.94 * (1 - Math.exp(-Math.max(0, d - 9) * 0.004 * lerp(1, 0.3, sm(p.y, 0, 420)))); const g = Math.abs(p.x - axis(p.z)); if (g < 30) f = 1 - (1 - f) * (1 - 0.5 * sm(-p.y, 6, 44) * (1 - sm(g, 18, 30))); return f; };   // the air between, and the mist that lies in the gorge
const hazed = (c, p) => { const f = hazeAt(p); return [lerp(c[0], HZ[0], f), lerp(c[1], HZ[1], f), lerp(c[2], HZ[2], f)]; };
let solid = null, canopy = null;
const ray = new THREE.Ray(), toLava = V(), tmp = V(), tmp2 = V(), tA = V(), tB = V();
const blocked = (bvh, o, d, far) => { ray.origin.copy(o); ray.direction.copy(d); return !!bvh.raycastFirst(ray, THREE.DoubleSide, 0.001, far); };
function lavaAt(p) { const hx = (BX + MX) / 2, hz = (BZ + MZ) / 2, x = clamp(p.x, -hx, hx), z = clamp(p.z, -hz, hz); if (hx - Math.abs(x) < hz - Math.abs(z)) return toLava.set(Math.sign(p.x || 1) * hx, LAVA, z); return toLava.set(x, LAVA, Math.sign(p.z || 1) * hz); }
let lseed = 7; const LR = () => { lseed = (lseed * 1664525 + 1013904223) >>> 0; return lseed / 4294967296; };
function lightAt(p, n, rays = 12) {
  const o = tmp2.copy(p).addScaledVector(n, 0.035); o.y += 0.004;
  const ndl = Math.max(0, n.dot(SUN)); let vis = 0, open = 0;
  if (ndl > 0) for (let k = 0; k < 4; k++) { tA.set(SUN.x + (LR() - 0.5) * 0.1, SUN.y + (LR() - 0.5) * 0.1, SUN.z + (LR() - 0.5) * 0.1).normalize(); vis += blocked(solid, o, tA, 300) ? 0 : blocked(canopy, o, tA, 80) ? 0.3 : 1; }
  vis /= 4;
  // how much sky a point sees: rays round its normal, near things counting most
  tB.set(1, 0, 0); if (Math.abs(n.x) > 0.8) tB.set(0, 0, 1); const t1 = tB.cross(n).normalize().clone(), t2 = tB.crossVectors(n, t1).clone();
  for (let k = 0; k < rays; k++) { const u = (k + LR()) / rays, a = LR() * 6.2832, rr = Math.sqrt(u), h = Math.sqrt(1 - u); tA.copy(n).multiplyScalar(h).addScaledVector(t1, rr * Math.cos(a)).addScaledVector(t2, rr * Math.sin(a)); open += blocked(solid, o, tA, 4.5) ? 0 : blocked(canopy, o, tA, 9) ? 0.6 : 1; }
  const ao = 0.22 + 0.78 * open / rays, up = n.y * 0.5 + 0.5;
  let r = SUNC[0] * ndl * vis + (SKYC[0] * (0.5 + 0.5 * up) + BOUNCE[0] * (1 - up)) * ao, g = SUNC[1] * ndl * vis + (SKYC[1] * (0.5 + 0.5 * up) + BOUNCE[1] * (1 - up)) * ao, b = SUNC[2] * ndl * vis + (SKYC[2] * (0.5 + 0.5 * up) + BOUNCE[2] * (1 - up)) * ao;
  if (Math.max(Math.abs(p.x), Math.abs(p.z)) < 12) {
    const d = tmp.copy(lavaAt(p)).sub(p), dl = d.length(), gl = 0.85 / (1 + (dl / 0.8) ** 2) * (0.3 + 0.7 * Math.max(0, n.dot(d.normalize())));
    r += gl; g += gl * 0.4; b += gl * 0.1;
    for (const [x, z] of PITS) { const e = tmp.set(x, 0.45, z).sub(p), de = e.length(), k = 0.6 / (1 + (de / 0.75) ** 2) * (0.35 + 0.65 * Math.max(0, n.dot(e.normalize()))); r += k; g += k * 0.5; b += k * 0.2; }
    for (const [x, y, z] of SCONCES) { const e = tmp.set(x, y, z).sub(p), de = e.length(), k = 0.5 / (1 + (de / 0.5) ** 2) * (0.3 + 0.7 * Math.max(0, n.dot(e.normalize()))); r += k; g += k * 0.5; b += k * 0.2; }
  }
  return [Math.min(1, r), Math.min(1, g), Math.min(1, b)];
}
// far ground has no walls to shade it: its own slopes do, found by walking toward the sun
function farLight(x, y, z, n) {
  let vis = 1; const ndl = Math.max(0, n.dot(SUN));
  if (ndl > 0) for (let k = 1, s = 2; k <= 14; k++, s *= 1.5) vis = Math.min(vis, 1 - clamp((ground(x + SUN.x * s, z + SUN.z * s) - y - SUN.y * s) / (s * 0.25) + 0.3, 0, 0.88));
  const up = n.y * 0.5 + 0.5, ao = 0.75 + 0.25 * up;
  return [SUNC[0] * ndl * vis + (SKYC[0] * (0.5 + 0.5 * up) + BOUNCE[0] * (1 - up)) * ao, SUNC[1] * ndl * vis + (SKYC[1] * (0.5 + 0.5 * up) + BOUNCE[1] * (1 - up)) * ao, SUNC[2] * ndl * vis + (SKYC[2] * (0.5 + 0.5 * up) + BOUNCE[2] * (1 - up)) * ao];
}

// ---- a part: points and where each is in the picture; its colour comes later, when everything that can shade it is built
const parts = [];
function finish(pos, uv, land) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); g.userData.land = land; return g; }
const stain = q => 0.86 + 0.14 * (Math.sin(q.x * 1.7 + q.y * 2.3) * Math.sin(q.z * 1.9 - q.y * 1.1) + Math.sin(q.x * 4.1 - q.z * 3.3 + q.y * 5.2) * 0.5);   // old walls are not one colour: slow stains, the same at any point however it is cut
function shade(g) {
  const P = g.attributes.position, N = g.attributes.normal, col = new Uint8Array(P.count * 4), p = V(), n = V(), fixed = g.userData.fixed;
  for (let i = 0; i < P.count; i++) { p.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i);
    if (g.userData.land) { col.set([255, 255, 255, 0], i * 4); continue; }
    const k = fixed ? 1 : stain(p), c = fixed ? fixed(p, i) : lightAt(p, n), h = g.userData.far ? hazed(c, p) : c;
    col[i * 4] = Math.min(1, h[0] * k) * 255; col[i * 4 + 1] = Math.min(1, h[1] * k) * 255; col[i * 4 + 2] = Math.min(1, h[2] * k) * 255; col[i * 4 + 3] = 255; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 4, true));
  return g;
}
// flat faces under a tiling picture: every square is cut on the picture's own grid, so its place in the one picture never wraps
class Faces {
  constructor(cell) { this.c = CELL[cell]; this.pos = []; this.uv = []; }
  // a, b, c, d: corners, counter-clockwise seen from `out`; st: each corner's place on the surface, in tiles
  quad(a, b, c, d, st, out) {
    const [cx, cy, cs, rep = 1] = this.c, n = tmp.copy(b).sub(a).cross(V().copy(d).sub(a)), flip = n.dot(out) < 0, P = flip ? [a, d, c, b] : [a, b, c, d], S = flip ? [st[0], st[3], st[2], st[1]] : st;
    const s0 = Math.floor(Math.min(...S.map(q => q[0])) / rep + 1e-6) * rep, t0 = Math.floor(Math.min(...S.map(q => q[1])) / rep + 1e-6) * rep;
    for (const i of [0, 1, 2, 0, 2, 3]) { this.pos.push(P[i].x, P[i].y, P[i].z); this.uv.push((cx + 2 + clamp((S[i][0] - s0) / rep, 0, 1) * (cs - 4)) / W, (cy + 2 + (1 - clamp((S[i][1] - t0) / rep, 0, 1)) * (cs - 4)) / H); }
  }
  // a block: its middle, half sizes, a turn about the upright and a lean; no underside
  box(c, h, turn = 0, lean = 0) {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(lean, turn, lean * 0.6)), K = (x, y, z) => V(x * h.x, y * h.y, z * h.z).applyMatrix4(m).add(c), rep = this.c[3] || 1;
    for (const [ax, sg] of [[0, 1], [0, -1], [2, 1], [2, -1], [1, 1]]) { const u = ax === 0 ? 2 : 0, v = ax === 1 ? 2 : 1, hu = Math.min(h.getComponent(u), rep / 2), hv = Math.min(h.getComponent(v), rep / 2), s0 = R() * (rep - 2 * hu), t0 = R() * (rep - 2 * hv), q = (a, b) => { const e = [0, 0, 0]; e[ax] = sg; e[u] = a; e[v] = b; return K(...e); }, o = [0, 0, 0]; o[ax] = sg;
      this.quad(q(-1, -1), q(1, -1), q(1, 1), q(-1, 1), [[s0, t0], [s0 + 2 * hu, t0], [s0 + 2 * hu, t0 + 2 * hv], [s0, t0 + 2 * hv]], V(...o).applyMatrix4(m)); }
  }
  done(land) { if (this.pos.length) parts.push(finish(this.pos, this.uv, land)); }
}
// A ruined wall along a line (at(u, side, y) gives a point: side 0 its inner face, 1 its outer): its top (hi) and, over an opening, its underside (lo) are given at every joint, so the top runs ragged, not in steps.
function ruin(cell, cap, n, at, hi, lo, outOf, cw = 0.5) {
  const F = new Faces(cell), C = new Faces(cap), L = (i, e) => !lo ? 0 : typeof lo === 'function' ? lo(i, e) : lo[i + e];
  for (let i = 0; i < n; i++) {
    const h0 = hi[i], h1 = hi[i + 1], l0 = L(i, 0), l1 = L(i, 1); if (Math.max(h0, h1) <= Math.min(l0, l1) + 1e-6 || h0 + h1 - l0 - l1 < 0.02) continue;
    const s0 = i * cw, s1 = s0 + cw, yA = Math.ceil(Math.max(l0, l1) - 1e-6), yB = Math.floor(Math.min(h0, h1) + 1e-6), rows = yA < yB ? [[l0, l1, yA, yA], ...Array.from({ length: yB - yA }, (_, k) => [yA + k, yA + k, yA + k + 1, yA + k + 1]), [yB, yB, h0, h1]] : [[l0, l1, h0, h1]];
    for (const side of [0, 1]) { const o = outOf(i + 0.5, side); for (const [a0, a1, b0, b1] of rows) if (b0 - a0 > 1e-4 || b1 - a1 > 1e-4) F.quad(at(i, side, a0), at(i + 1, side, a1), at(i + 1, side, b1), at(i, side, b0), [[s0, a0], [s1, a1], [s1, b1], [s0, b0]], o); }
    C.quad(at(i, 0, h0), at(i + 1, 0, h1), at(i + 1, 1, h1), at(i, 1, h0), [[s0, 0], [s1, 0], [s1, 0.5], [s0, 0.5]], V(0, 1, 0));
    if (l0 > 0 || l1 > 0) C.quad(at(i, 0, l0), at(i + 1, 0, l1), at(i + 1, 1, l1), at(i, 1, l0), [[s0, 0], [s1, 0], [s1, 0.5], [s0, 0.5]], V(0, -1, 0));
    const along = tmp.copy(at(i + 1, 0, 0)).sub(at(i, 0, 0)).normalize().clone();
    // the wall's ends, and the jamb where an opening begins or ends
    for (const [u, a, b, o] of [[i, i === 0 ? l0 : Math.min(l0, L(i - 1, 1)), i === 0 ? h0 : Math.max(l0, L(i - 1, 1)), i === 0 ? along.clone().negate() : l0 > L(i - 1, 1) ? along.clone().negate() : along], ...(i === n - 1 ? [[n, l1, h1, along]] : [])])
      if (b - a > 0.02 && (i === 0 || u === n || i > 0)) F.quad(at(u, 0, a), at(u, 1, a), at(u, 1, b), at(u, 0, b), [[0, a], [0.45, a], [0.45, b], [0, b]], o);
  }
  F.done(); C.done();
}
// a wall's top at each joint: it wanders between lo and hi, and here and there a bite is out of it
const ragged = (n, lo, hi, bite = 0.1) => { const a = []; let h = lo + R() * (hi - lo), gap = 0, deep = 0; for (let i = 0; i <= n; i++) { h = clamp(h + (R() - 0.5) * (hi - lo) * 0.3, lo, hi); if (gap > 0) gap--; else if (R() < bite) { gap = 1 + Math.floor(R() * 3); deep = (0.25 + R() * 0.5) * (hi - lo); } a.push(gap > 0 ? Math.max(lo * 0.6, h - deep) + (R() - 0.5) * 0.06 : h); } return a; };

function build() {
  // the bank of rock round the moat: its light and shade are in the ground's picture
  { const F = new Faces('floor'), M = new Faces('moat'), s = 1.5;
    for (let x = -OX; x < OX - 1e-6; x += s) for (let z = -OZ; z < OZ - 1e-6; z += s) { const x0 = Math.max(x, -OX), x1 = Math.min(x + s, OX), z1 = Math.min(z + s, OZ);
      for (const [a, b, c, d] of [[x0, Math.min(x1, -MX), z, z1], [Math.max(x0, MX), x1, z, z1], [Math.max(x0, -MX), Math.min(x1, MX), z, Math.min(z1, -MZ)], [Math.max(x0, -MX), Math.min(x1, MX), Math.max(z, MZ), z1]])
        if (b - a > 1e-6 && d - c > 1e-6) F.quad(V(a, 0, d), V(b, 0, d), V(b, 0, c), V(a, 0, c), [[a + 21, 21 - d], [b + 21, 21 - d], [b + 21, 21 - c], [a + 21, 21 - c]], V(0, 1, 0)); }
    for (let x = -MX; x < MX - 1e-6; x += 0.5) for (const z of [-MZ, MZ]) M.quad(V(x, LAVA - 0.04, z), V(x + 0.5, LAVA - 0.04, z), V(x + 0.5, 0, z), V(x, 0, z), [[x + 20, 0], [x + 20.5, 0], [x + 20.5, 0.34], [x + 20, 0.34]], V(0, 0, -z));
    for (let z = -MZ; z < MZ - 1e-6; z += 0.5) for (const x of [-MX, MX]) M.quad(V(x, LAVA - 0.04, z), V(x, LAVA - 0.04, z + 0.5), V(x, 0, z + 0.5), V(x, 0, z), [[z + 20, 0], [z + 20.5, 0], [z + 20.5, 0.34], [z + 20, 0.34]], V(-x, 0, 0));
    F.done(true); M.done(); }
  // low broken walls before each seat, the road's gap in the middle of each: nothing here stands between a player and the board
  for (const sz of [-1, 1]) { const n = 40, x0 = -5, hi = ragged(n, 0.22, 0.78, 0.2); for (let i = 17; i <= 23; i++) hi[i] = 0; hi[16] = hi[24] = 0.95; hi[15] = hi[25] = 1.05;
    ruin('wall', 'wall', n, (u, side, y) => V(x0 + u * 0.25, y, sz * (6.7 + side * 0.3)), hi, null, (u, side) => V(0, 0, sz * (side ? 1 : -1)), 0.25); }
  // the east: the hall's one standing wall, brick, an arched gateway in it, piers along it, a tower at each end
  { const n = 44, z0 = -5.5, hi = ragged(n, 2.5, 3.6), lo = (i, e) => { const dz = Math.abs(z0 + (i + e) * 0.25); return i < 18 || i > 25 ? 0 : 1.25 + 0.85 * Math.sqrt(Math.max(0, 1 - dz * dz)); };
    for (let i = 18; i <= 26; i++) hi[i] = Math.max(hi[i], 3.0);
    ruin('brick', 'brick', n, (u, side, y) => V(6.45 + side * 0.45, y, z0 + u * 0.25), hi, lo, (u, side) => V(side ? 1 : -1, 0, 0), 0.25);
    for (const pz of [-3.4, -1.25, 1.25, 3.4]) { const top = 2.9 + R() * 0.4;   // a pier, and the rib of the fallen roof that still springs from it
      ruin('wall', 'wall', 2, (u, side, y) => V(6.45 - (side ? 0 : 0.24), y, pz - 0.26 + u * 0.26), [top, top + 0.08, top], null, (u, side) => V(side ? 1 : -1, 0, 0), 0.26);
      const F = new Faces('wall'), len = 1 + Math.floor(R() * 2), P = k => { const a = k / 7 * 1.25; return V(6.33 - 2.4 * (1 - Math.cos(a)), top - 0.05 + 2.4 * Math.sin(a), pz); }, sd = V(0, 0, 0.12);
      for (let k = 0; k < len; k++) { const a = P(k), b = P(k + 1), up = V(-(b.y - a.y), b.x - a.x, 0).normalize().multiplyScalar(0.13), q = (p, i, j) => V().copy(p).addScaledVector(up, i).addScaledVector(sd, j);
        for (const [i0, j0, i1, j1, o] of [[-1, -1, -1, 1, up.clone().negate()], [1, 1, 1, -1, up], [-1, 1, 1, 1, sd], [1, -1, -1, -1, sd.clone().negate()]]) F.quad(q(a, i0, j0), q(a, i1, j1), q(b, i1, j1), q(b, i0, j0), [[k * 0.6, 0], [k * 0.6, 0.3], [k * 0.6 + 0.6, 0.3], [k * 0.6 + 0.6, 0]], o);
        if (k === len - 1) { F.quad(q(b, -1, -1), q(b, -1, 1), q(b, 1, 1), q(b, 1, -1), [[0, 0], [0.3, 0], [0.3, 0.3], [0, 0.3]], V().copy(b).sub(a)); RIBTIPS.push(b.clone()); } }
      F.done(); }
    for (const [cz, lo2, hi2] of [[-6.25, 3.9, 5.2], [6.25, 2.0, 3.3]]) { const m = 12, hs = ragged(m, lo2, hi2, 0.2); hs[m] = hs[0]; const rr = side => side ? 0.95 : 0.6;
      ruin('brick', 'brick', m, (u, side, y) => { const a = (u / m) * Math.PI * 2; return V(6.75 + Math.cos(a) * rr(side), y, cz + Math.sin(a) * rr(side)); }, hs, null, (u, side) => { const a = (u / m) * Math.PI * 2; return V(Math.cos(a), 0, Math.sin(a)).multiplyScalar(side ? 1 : -1); }); } }
  // the west wall went down the mountain with the roof: its two corners still stand, and its stones lie down the slope to the gorge's rim
  for (const sz of [-1, 1]) { const n = 12, hi = ragged(n, 1.6, 3.3, 0.25).map((h, i) => h * (1 - (i / n) ** 2.2) + 0.05); hi[n] = 0;
    ruin('wall', 'wall', n, (u, side, y) => V(-7.05 + side * 0.4, y, sz * (7.5 - u * 0.25)), hi, null, (u, side) => V(side ? 1 : -1, 0, 0), 0.25);
    const m = 8, h2 = ragged(m, 1.2, 2.6, 0.25).map((h, i) => h * (1 - (i / m) ** 2) + 0.05); h2[0] = hi[0]; h2[m] = 0;
    ruin('wall', 'wall', m, (u, side, y) => V(-7.05 + u * 0.25, y, sz * (7.5 - side * 0.4)), h2, null, (u, side) => V(0, 0, sz * (side ? -1 : 1)), 0.25); }
  { const F = new Faces('wall');
    for (let i = 0; i < 56; i++) { const far = R() ** 1.3, x = -6.3 - far * 8.5, z = (R() - 0.5) * (13 + far * 6), s = (0.08 + R() * R() * 0.3) * (1 - far * 0.3), y = ground(x, z);
      F.box(V(x, y + s * 0.15, z), V(s * (0.8 + R() * 1.1), s * (0.5 + R() * 0.4), s * (0.6 + R() * 0.5)), R() * 6.3, (R() - 0.5) * 1.1); }
    for (const [x, z] of [[-3.2, 7.9], [3.6, -8.1], [-1.9, -7.7], [5.2, 7.8]]) F.box(V(x, 0.12, z), V(0.3, 0.16, 0.22), R() * 6, (R() - 0.5) * 0.5);
    F.done(); }
  // iron baskets of embers on the piers
  { const F = new Faces('iron'), E = new Faces('white');
    for (const [x, y, z] of SCONCES) { F.box(V(x + 0.12, y - 0.05, z), V(0.13, 0.02, 0.02)); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283, b = a + 6.283 / 6, p = (q, r, yy) => V(x + Math.cos(q) * r, y + yy, z + Math.sin(q) * r);
      F.quad(p(a, 0.06, -0.08), p(b, 0.06, -0.08), p(b, 0.11, 0.08), p(a, 0.11, 0.08), [[0, 0], [0.1, 0], [0.1, 0.2], [0, 0.2]], V(Math.cos(a + 0.5), 0, Math.sin(a + 0.5)));
      E.quad(p(a, 0.1, 0.06), p(b, 0.1, 0.06), V(x, y + 0.06, z), V(x, y + 0.06, z), [[0, 0], [0.1, 0], [0.1, 0.1], [0, 0.1]], V(0, 1, 0)); } }
    F.done(); const g = finish(E.pos, E.uv); g.userData.fixed = (p, i) => { const r = Math.min(...SCONCES.map(s => Math.hypot(p.x - s[0], p.z - s[2]))) / 0.1; return [0.9 - 0.35 * r, 0.32 - 0.2 * r, 0.07 - 0.05 * r]; }; parts.push(g); }
  // the way into the mountain behind the gate: dark
  { const F = new Faces('white'); F.quad(V(6.92, 0, -1), V(6.92, 0, 1), V(6.92, 2.2, 1), V(6.92, 2.2, -1), [[0, 0], [1, 0], [1, 1], [0, 1]], V(-1, 0, 0)); const g = finish(F.pos, F.uv); g.userData.fixed = p => [0.03 + 0.03 * (1 - p.y / 2.2), 0.028, 0.03]; parts.push(g); }
}

// ---- the scanned things: each stood at its place, sized by its height, on its own corner of the picture
async function thing(name, tris, list) {
  const g = await loader.loadAsync('/full/m/' + name + '.glb'), geos = []; let map = null;
  g.scene.updateMatrixWorld(true);
  g.scene.traverse(o => { if (!o.isMesh) return; map = map || o.material.map; const q = o.geometry.clone().applyMatrix4(o.matrixWorld); for (const k of Object.keys(q.attributes)) if (!['position', 'normal', 'uv'].includes(k)) q.deleteAttribute(k); geos.push(q.index ? q : q.toNonIndexed()); });
  const [cx, cy, cs] = CELL[name]; ctx.drawImage(map.image, cx, cy, cs, cs);
  let geo = geos.length > 1 ? mergeGeometries(geos.map(q => q.index ? q.toNonIndexed() : q)) : geos[0];
  if (!geo.index) geo.setIndex([...Array(geo.attributes.position.count).keys()]);
  geo = thin(geo, tris);
  const U = geo.attributes.uv; for (let i = 0; i < U.count; i++) { let a = U.getX(i), b = U.getY(i); a -= Math.floor(a); b -= Math.floor(b); U.setXY(i, (cx + 1.5 + a * (cs - 3)) / W, (cy + 1.5 + b * (cs - 3)) / H); }
  geo.computeBoundingBox(); const bb = geo.boundingBox, size = bb.getSize(V()), mid = bb.getCenter(V());
  geo.translate(-mid.x, -bb.min.y, -mid.z);
  for (const { at, tall, wide, turn = 0, tilt = 0, sink = 0, deep = 1 } of list) {
    const k = tall ? tall / size.y : wide / Math.max(size.x, size.z), q = geo.clone();
    q.scale(k, k, k * deep).rotateX(tilt).rotateY(turn).translate(at[0], (at[2] === undefined ? ground(at[0], at[1]) : at[2]) - sink, at[1]); q.computeVertexNormals();
    parts.push(q);
  }
  log.push(name + ' ' + geo.index.count / 3 + ' triangles x' + list.length + ' (' + size.toArray().map(v => v.toFixed(2)).join(' by ') + ')');
}

// ---- trees: where each stands, which picture it is, how tall
const SPECIES = SHEET.map(([name, , , x, y, w, h]) => ({ fir: /fir|pine/.test(name), u0: x / LW, u1: (x + w) / LW, v0: y / LH, v1: (y + h) / LH, asp: w / h }));
const FIRS = SPECIES.filter(s => s.fir), LEAFY = SPECIES.filter(s => !s.fir);
const trees = [];
function plant() {
  const n = V();
  for (const [rMax, step, rMin] of [[150, 2.7, 0], [430, 4.4, 150], [1150, 8.5, 430]]) for (let gx = -rMax; gx < rMax; gx += step) for (let gz = -rMax; gz < rMax; gz += step) {
    const x = gx + (R() * 2.2 - 0.6) * step, z = gz + (R() * 2.2 - 0.6) * step, r = Math.hypot(x, z);   // well off the grid: a forest is not an orchard
    if (r >= rMax || r < rMin || (Math.abs(x) < 12.5 && Math.abs(z) < 28) || (z > 0 && z < 90 && Math.abs(x) < 9 + z * 0.5) || (r < 200 && roadAt(x, z) < 4)) { R(); R(); R(); continue; }
    const y = ground(x, z); normalAt(x, z, 0.6, n);
    if (R() > forestAt(x, z, y, n.y) * 0.72) { R(); R(); continue; }
    const fir = R() < clamp(0.55 + y / 120 - z / 400, 0.2, 0.95), sp = fir ? FIRS[Math.floor(R() * FIRS.length)] : LEAFY[Math.floor(R() * LEAFY.length)], h = fir ? 8.5 + R() * 6.5 : 4.6 + R() * 2.6;
    trees.push({ x, y: y - 0.25, z, r, h: h * (r > 430 ? 1.5 : 1), sp, fir, tint: fir ? [0.8 + R() * 0.14, 0.86 + R() * 0.1, 0.78 + R() * 0.1] : [1.0 + R() * 0.12, 0.86 + R() * 0.08, 0.52 + R() * 0.16], near: false });
  }
  // the ones the game draws as cards: round the hall, and along the far rim of the gorge
  const mine = trees.filter(t => { const ax = axis(t.z); return (Math.max(Math.abs(t.x), Math.abs(t.z)) < R1 - 1 && t.x > ax + 16) || (t.x < ax - 17 && t.x > ax - 46 && Math.abs(t.z) < 82); }).sort((a, b) => a.r - b.r);
  for (const t of mine.slice(0, 300)) t.near = true;
  log.push(trees.length + ' trees, ' + trees.filter(t => t.near).length + ' of them cards in the game');
}
const cardLight = t => { const c = lightAt(tmp.set(t.x, t.y + t.h * 0.5, t.z), V(0, 1, 0).lerp(SUN, 0.5).normalize(), 6); return [c[0] / 0.78 * t.tint[0], c[1] / 0.78 * t.tint[1], c[2] / 0.78 * t.tint[2]]; };

// ---- leaves: ivy in clusters of real leaves (ambientCG LeafSet029) down the walls, the trees' cards, the chains
function leaves() {
  const pos = [], uv = [], col = [];
  const quad = (P, T, C) => { for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(P[i].x, P[i].y, P[i].z); uv.push(T[i][0], T[i][1]); const c = Array.isArray(C[0]) ? C[i] : C; col.push(Math.min(255, c[0] * 255), Math.min(255, c[1] * 255), Math.min(255, c[2] * 255), 255); } };
  const leaf = (c, right, upv, out, s) => { const k = Math.floor(R() * 4), u0 = k * 256 / LW, v0 = 512 / LH, a = R() * 6.283, r = V().copy(right).multiplyScalar(Math.cos(a)).addScaledVector(upv, Math.sin(a)), u = V().crossVectors(out, r);
    r.addScaledVector(out, (R() - 0.5) * 0.5).normalize(); const L = lightAt(c, out, 6), g = 0.62 + R() * 0.3;
    quad([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => V().copy(c).addScaledVector(r, x * s).addScaledVector(u, y * s)), [[0.01, 0.99], [0.99, 0.99], [0.99, 0.01], [0.01, 0.01]].map(([a2, b2]) => [u0 + a2 * 256 / LW, v0 + b2 * 256 / LH]), [L[0] * g * 0.62, L[1] * g * 0.7, L[2] * g * 0.5]); };
  const vine = (start, right, out, len, n, s = 1) => { const p = V().copy(start), up = V(0, 1, 0); let drift = (R() - 0.5) * 0.5;
    for (let i = 0; i < n; i++) { drift += (R() - 0.5) * 0.3; p.y -= len / n; p.addScaledVector(right, drift * len / n); if (p.y < 0.06) break; leaf(V().copy(p).addScaledVector(out, 0.04 + R() * 0.05).addScaledVector(right, (R() - 0.5) * 0.2), right, up, out, (0.12 + R() * 0.09) * s); } };
  for (let i = 0; i < 16; i++) vine(V(6.45, 2.6 + R() * 0.9, -5.2 + R() * 10.4), V(0, 0, 1), V(-1, 0, 0), 1.3 + R() * 1.9, 13);                                       // down the brick wall's inner face
  for (let i = 0; i < 9; i++) { const z = -5 + R() * 10; leaf(V(6.5 + R() * 0.3, 3.0 + R() * 0.5, z), V(0, 0, 1), V(1, 0, 0), V(0, 1, 0), 0.2); }                      // over its top
  for (const sz of [-1, 1]) for (let i = 0; i < 7; i++) { const x = -4.8 + R() * 9.6; if (Math.abs(x) < 1.2) continue; vine(V(x, 0.62, sz * 6.7), V(1, 0, 0), V(0, 0, -sz), 0.55, 4, 0.85); vine(V(x + 0.3, 0.6, sz * 7.0), V(1, 0, 0), V(0, 0, sz), 0.55, 4, 0.85); }
  for (const [cz, top] of [[-6.25, 4.2], [6.25, 2.4]]) for (let i = 0; i < 6; i++) { const a = Math.PI * (0.5 + R() * 1.0), o = V(Math.cos(a), 0, Math.sin(a)); vine(V(6.75 + o.x * 0.95, top * (0.6 + R() * 0.4), cz + o.z * 0.95), V(-o.z, 0, o.x), o, 1.6 + R(), 10); }
  for (const sz of [-1, 1]) for (let i = 0; i < 5; i++) { vine(V(-6.65, 0.8 + R() * 1.6, sz * (7.4 - R() * 1.6)), V(0, 0, 1), V(1, 0, 0), 1.2, 6); vine(V(-7.05, 0.8 + R() * 1.4, sz * (7.4 - R() * 1.6)), V(0, 0, 1), V(-1, 0, 0), 1.2, 5); }
  for (let i = 0; i < 26; i++) { const far = R(), x = -7.6 - far * 6.5, z = (R() - 0.5) * 16, y = ground(x, z); leaf(V(x, y + 0.14, z), V(1, 0, 0), V(0, 0, 1), V(0, 1, 0).add(V(R() - 0.5, 0, R() - 0.5).multiplyScalar(0.6)).normalize(), 0.22 + R() * 0.16); }   // among the fallen stones
  const nIvy = pos.length / 9;
  // chains: from the gate's arch, from two ribs' broken ends, from the tall tower
  { const u0 = 1024 / LW, u1 = 1056 / LW, v0 = 512 / LH;
    for (const [x, y, z, len] of [[6.4, 2.02, -0.55, 0.7], [6.4, 2.02, 0.55, 0.5], ...[0, 2].map(k => [RIBTIPS[k].x + 0.1, RIBTIPS[k].y - 0.15, RIBTIPS[k].z, 1.0 + k * 0.25]), [5.95, 4.0, -5.7, 1.3]]) { const L = lightAt(V(x, y - len / 2, z), V(-1, 0, 0), 6).map(c => c * 0.8), v1 = v0 + Math.min(1, len / 1.6) * 256 / LH;
      for (const [dx, dz] of [[0.035, 0], [0, 0.035]]) quad([V(x - dx, y - len, z - dz), V(x + dx, y - len, z + dz), V(x + dx, y, z + dz), V(x - dx, y, z - dz)], [[u0, v1], [u1, v1], [u1, v0], [u0, v0]], L); } }
  // the trees' cards: two crossed near the hall, one turned to the hall further off
  let cards = 0;
  for (const t of trees) { if (!t.near) continue; const L = hazed(cardLight(t), tmp.set(t.x, t.y + t.h * 0.6, t.z)), Lb = L.map(c => c * 0.72), w = t.h * t.sp.asp / 2, s = t.sp, a0 = t.r < 30 ? R() * 3.14 : Math.atan2(t.x, -t.z) + Math.PI;
    for (const a of t.r < 24 ? [a0, a0 + Math.PI / 3, a0 + 2 * Math.PI / 3] : t.r < 34 ? [a0, a0 + Math.PI / 2] : [a0]) { const dx = Math.cos(a) * w, dz = Math.sin(a) * w; cards++;
      quad([V(t.x - dx, t.y, t.z - dz), V(t.x + dx, t.y, t.z + dz), V(t.x + dx, t.y + t.h, t.z + dz), V(t.x - dx, t.y + t.h, t.z - dz)], [[s.u0, s.v1], [s.u1, s.v1], [s.u1, s.v0], [s.u0, s.v0]], [Lb, Lb, L, L]); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(col), 4, true));
  log.push('leaves: ' + nIvy + ' ivy and chain triangles, ' + cards * 2 + ' in tree cards');
  return g;
}
function leafSheet(ivy, treesPic) {
  lctx.clearRect(0, 0, LW, LH); lctx.drawImage(treesPic, 0, 0);
  for (let c = 0; c < 4; c++) for (let i = 0; i < 9; i++) { const k = Math.floor(R() * 7), s = 86 + R() * 46; lctx.save(); lctx.filter = 'saturate(0.55) brightness(0.8)'; lctx.translate(c * 256 + 62 + R() * 132, 512 + 62 + R() * 132); lctx.rotate(R() * 6.283); lctx.drawImage(ivy, (k % 3) * 170 + 2, Math.floor(k / 3) * 170 + 2, 166, 166, -s / 2, -s / 2, s, s); lctx.restore(); }
  lctx.strokeStyle = '#2f2c2a'; lctx.lineWidth = 5; for (let y = 520; y < 768; y += 22) { lctx.beginPath(); lctx.ellipse(1040, y + 8, 8, 12, 0, 0, 6.283); lctx.stroke(); lctx.fillStyle = '#3a3633'; lctx.fillRect(1037, y + 17, 6, 12); }
}

// ---- the whole ground as the far picture and the paint see it: fine points, each with its light and what it is made of
const HERO_V = `attribute vec3 aLight; attribute vec4 aMat; attribute vec2 aUv2; uniform int uMode; varying vec3 vP, vN, vL; varying vec4 vM;
void main() { vP = position; vN = normal; vL = aLight; vM = aMat;
  if (uMode == 0) gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  else if (uMode == 1) { vec2 q = position.xz; float m = max(max(abs(q.x), abs(q.y)), 0.001); gl_Position = vec4(q / m * (log(m / ${R0}.0) / log(${R1}.0 / ${R0}.0)), 0.0, 1.0); }
  else gl_Position = vec4(aUv2 * 2.0 - 1.0, 0.0, 1.0); }`;
const HAZE_GL = `uniform vec3 uEye; const vec3 HZ = vec3(${HZ.join(',')}); const vec3 SUNXZ = vec3(${SUN.x / Math.hypot(SUN.x, SUN.z)}, 0.0, ${SUN.z / Math.hypot(SUN.x, SUN.z)});
vec3 hazed(vec3 c, vec3 p, float gx) { vec3 v = p - uEye; float d = length(v), f = 0.94 * (1.0 - exp(-max(0.0, d - 9.0) * 0.004 * mix(1.0, 0.3, smoothstep(0.0, 420.0, p.y)))); float g = abs(p.x - gx);
  if (g < 30.0) f = 1.0 - (1.0 - f) * (1.0 - 0.5 * smoothstep(6.0, 44.0, -p.y) * (1.0 - smoothstep(18.0, 30.0, g)));
  return mix(c, HZ + vec3(0.07, 0.035, -0.01) * pow(max(dot(normalize(v * vec3(1.0, 0.0, 1.0)), SUNXZ), 0.0), 3.0) * smoothstep(60.0, 500.0, d), f); }`;
const HERO_F = `uniform sampler2D tGrass, tForest, tCliff, tScree, tCrag; uniform int uMode; varying vec3 vP, vN, vL; varying vec4 vM; ${HAZE_GL}
float hsh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hsh(i), hsh(i + vec2(1, 0)), f.x), mix(hsh(i + vec2(0, 1)), hsh(i + vec2(1, 1)), f.x), f.y); }
float fb(vec2 p) { return 0.5 * vn(p) + 0.25 * vn(p * 2.1 + 7.0) + 0.125 * vn(p * 4.3 + 3.0) + 0.125 * vn(p * 8.7); }
float gx(float z) { return -37.0 + 7.0 * sin(z / 70.0) + 3.0 * sin(z / 27.0 + 1.3) + 55.0 * sin(z / 520.0 + 0.4) * smoothstep(150.0, 500.0, abs(z)); }
void main() { vec3 p = vP, n = normalize(vN); float sl = 1.0 - n.y, far = smoothstep(120.0, 700.0, length(p - uEye));
  vec3 an = abs(n); an /= an.x + an.y + an.z;
  vec3 rock = texture2D(tCliff, p.zy / 15.0).rgb * an.x + texture2D(tCliff, p.xy / 15.0).rgb * an.z + texture2D(tCrag, p.xz / 12.0).rgb * an.y;
  rock = mix(vec3(0.36), rock, 0.72); rock = mix(vec3(dot(rock, vec3(0.3, 0.59, 0.11))), rock, 0.4) * vec3(0.9, 0.93, 0.98) * (0.72 + 0.5 * fb(vec2(p.x + p.z, p.y) / 23.0));   // grey mountain rock
  float big = fb(p.xz / 41.0);
  vec3 grass = texture2D(tGrass, p.xz / 6.0).rgb * mix(vec3(0.86, 0.86, 0.6), vec3(1.08, 0.96, 0.58), big) * 1.5;   // late in the year: straw in the green
  vec3 c = mix(grass, texture2D(tForest, p.xz / 6.0).rgb * 0.62 * vec3(0.9, 1.0, 0.8), vM.x * (1.0 - far * 0.3));
  c = mix(c, vec3(0.115, 0.15, 0.1) * (0.75 + 0.5 * fb(p.xz / 9.0)), vM.x * far);                                     // far forest is a dark nap on the hills
  c = mix(c, texture2D(tScree, p.xz / 5.0).rgb, smoothstep(0.2, 0.36, sl + (fb(p.xz / 5.0) - 0.5) * 0.24));
  c = mix(c, rock, smoothstep(0.34, 0.54, sl + (fb(p.xz / 9.0) - 0.5) * 0.24));
  c = mix(c, vec3(0.34, 0.29, 0.22) * (0.8 + 0.4 * fb(p.xz * 1.3)), vM.y * 0.85);
  c = mix(c, vec3(0.8, 0.83, 0.86), vM.w);
  float l = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(vec3(l), c, 0.78) * 0.94;                                          // muted: no surface shouts
  if (uMode == 1) { c = mix(c, vec3(1.0), vM.z); float m = max(abs(p.x), abs(p.z)); if (m < ${(R0 * 0.985).toFixed(3)}) discard; }
  c *= vL;
  if (!(uMode == 1 && vM.z > 0.5)) c = hazed(c, p, gx(p.z));
  gl_FragColor = vec4(c, uMode == 0 ? 0.0 : 1.0);
  #include <colorspace_fragment>
}`;
const pix = {};
function heroMat(mode) {
  const u = { uMode: { value: mode }, uEye: { value: EYE } };
  for (const [k, name] of [['tGrass', 'grass'], ['tForest', 'forest'], ['tCliff', 'cliff'], ['tScree', 'scree'], ['tCrag', 'crag']]) { if (!pix[name].isTexture) { const t = new THREE.Texture(pix[name]); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; pix[name] = t; } u[k] = { value: pix[name] }; }
  return new THREE.ShaderMaterial({ uniforms: u, vertexShader: HERO_V, fragmentShader: HERO_F, side: THREE.DoubleSide, depthTest: mode === 0, depthWrite: mode === 0 });
}
// a sheet of ground from a rule giving each point's place; lit near by everything that stands, far by its own slopes
function sheet(nu, nv, at, lit, uv2) {
  const pos = new Float32Array(nu * nv * 3), nor = new Float32Array(nu * nv * 3), li = new Float32Array(nu * nv * 3), mat = new Float32Array(nu * nv * 4), u2 = new Float32Array(nu * nv * 2), idx = [], p = V(), n = V();
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const k = j * nu + i, [x, z] = at(i, j), y = ground(x, z); normalAt(x, z, lit ? 0.3 : Math.max(0.4, Math.hypot(x, z) * 0.012), n); p.set(x, y, z);
    pos.set([x, y, z], k * 3); nor.set([n.x, n.y, n.z], k * 3); li.set(lit ? lightAt(p, n) : farLight(x, y, z, n), k * 3); mat.set(matAt(x, z, y, n), k * 4); if (uv2) u2.set(uv2(x, z), k * 2);
    if (i < nu - 1 && j < nv - 1) idx.push(k, k + nu, k + 1, k + 1, k + nu, k + nu + 1); }
  if (!lit) for (let pass = 0; pass < 2; pass++) { const o = li.slice(); for (let j = 1; j < nv - 1; j++) for (let i = 0; i < nu; i++) for (let c = 0; c < 3; c++) { const a = (i + nu - 2) % (nu - 1), b = (i + 1) % (nu - 1); li[(j * nu + i) * 3 + c] = (o[(j * nu + i) * 3 + c] * 2 + o[(j * nu + a) * 3 + c] + o[(j * nu + b) * 3 + c] + o[((j - 1) * nu + i) * 3 + c] + o[((j + 1) * nu + i) * 3 + c]) / 6; } }   // far light is soft: no one triangle stands out
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('aLight', new THREE.BufferAttribute(li, 3)); g.setAttribute('aMat', new THREE.BufferAttribute(mat, 4)); g.setAttribute('aUv2', new THREE.BufferAttribute(u2, 2)); g.setIndex(idx);
  return g;
}
// the gorge's far wall, laid flat for its paint: along the gorge one way, from the river up the wall and over its rim the other (most of the picture to the wall itself)
const cliffV = (x, z) => { const q = axis(z) + 6 - x; return q < 9 ? q / 9 * 0.08 : q < 24 ? 0.08 + (q - 9) / 15 * 0.84 : 0.92 + (q - 24) / 6 * 0.08; };
const cliffX = (v, z) => axis(z) + 6 - (v < 0.08 ? v / 0.08 * 9 : v < 0.92 ? 9 + (v - 0.08) / 0.84 * 15 : 24 + (v - 0.92) / 0.08 * 6);
const CZ = 82, cliffUv = (x, z) => [(z + CZ) / (2 * CZ), cliffV(x, z)];

function shot(renderer, w, h, scene, cam, into, x, y) { renderer.setSize(w, h, false); renderer.render(scene, cam); into.drawImage(renderer.domElement, x, y, w, h); }

window.bakeDungeon = async () => {
  await MeshoptSimplifier.ready;
  const QUIET = { brick: 'saturate(0.5) brightness(0.84)', wall: 'saturate(0.8) brightness(0.92)', floor: 'saturate(0.75) brightness(0.9)', kerb: 'saturate(0.6) brightness(0.78)', moat: 'brightness(0.9)' };   // muted: no surface shouts
  for (const name of Object.keys(QUIET)) { const [x, y, s] = CELL[name]; ctx.filter = QUIET[name]; ctx.drawImage(await img('/full/tex/' + name + '.jpg'), x, y, s, s); }
  ctx.filter = 'none';
  for (const name of ['grass', 'forest', 'cliff', 'scree', 'crag', 'sky']) pix[name] = await img('/full/tex/' + name + '.jpg');
  const treesPic = await img('/full/trees.png'); leafSheet(await img('/full/ivy.png'), treesPic);
  build();
  // mossed rock and boulders among the fallen stones; the embers' pits; the gate in its arch; what the garrison left
  await thing('rock_moss_set_01', 260, [{ at: [-8.3, 2.7], wide: 1.6, sink: 0.1 }, { at: [6.0, -3.9, 0], wide: 0.9, turn: 2 }, { at: [9.6, 10.5], wide: 2.4, turn: 1, sink: 0.25 }, { at: [-10.5, -15], wide: 2.6, turn: 4, sink: 0.3 }, { at: [10.5, -12], wide: 2.0, turn: 2.6, sink: 0.25 }]);
  await thing('namaqualand_boulder_02', 70, [{ at: [-8.6, -1.9], wide: 0.9, sink: 0.1 }, { at: [-6.2, 5.9, 0], wide: 0.7, turn: 1 }, { at: [5.4, 7.9], wide: 0.45, turn: 2 }, { at: [-5.35, -8.0], wide: 0.5, turn: 4 }, { at: [6.05, 4.3, 0], wide: 0.45, turn: 3 }, { at: [-10.3, -5.3], wide: 1.3, turn: 5, sink: 0.2 }, { at: [-11.6, 4.6], wide: 1.1, sink: 0.2 }, { at: [5.9, -1.9, 0], wide: 0.35, turn: 1 }, { at: [-9.1, -3.2], wide: 0.6, turn: 2.2 }, { at: [-12.8, 0.6], wide: 0.9, turn: 0.7, sink: 0.15 }, { at: [3.4, 9.4], wide: 0.6, turn: 1.4, sink: 0.1 }, { at: [-3.8, -9.6], wide: 0.7, turn: 3.3, sink: 0.1 }]);
  await thing('stone_fire_pit', 170, PITS.map(([x, z]) => ({ at: [x, z, 0], wide: 0.56 })));
  await thing('large_iron_gate', 420, [{ at: [6.62, 0, 0], tall: 2.05, turn: Math.PI / 2 }]);
  await thing('treasure_chest', 120, [{ at: [6.0, 1.9, 0], wide: 0.5, turn: -1.9 }]);
  await thing('wine_barrel_01', 150, [{ at: [6.02, 2.75, 0], tall: 0.62, turn: 0.4 }, { at: [6.05, 3.42, 0], tall: 0.62, turn: 2.2 }]);
  await thing('wooden_crate_01', 60, [{ at: [5.95, -2.5, 0], wide: 0.5, turn: 0.3 }, { at: [6.0, -3.05, 0], wide: 0.42, turn: 1.1 }, { at: [5.97, -2.6, 0.36], wide: 0.36, turn: 0.8 }]);
  await thing('kite_shield', 110, [{ at: [6.3, -4.3, 0.02], tall: 0.7, turn: -Math.PI / 2, tilt: -0.3 }, { at: [6.3, 4.45, 0.02], tall: 0.7, turn: -Math.PI / 2 + 0.2, tilt: -0.28 }]);
  // the embers in each pit: a small bright disc
  { const [cx, cy, cs] = CELL.white, u = (cx + cs / 2) / W, v = (cy + cs / 2) / H;
    for (const [x, z] of PITS) { const g = new THREE.CircleGeometry(0.2, 10).rotateX(-Math.PI / 2).translate(x, 0.16, z).toNonIndexed(); for (let i = 0; i < g.attributes.uv.count; i++) g.attributes.uv.setXY(i, u, v);
      g.userData.fixed = p => { const r = Math.hypot(p.x - x, p.z - z) / 0.2; return [0.92 - 0.4 * r, 0.3 - 0.2 * r, 0.06 - 0.05 * r]; }; parts.push(g); } }
  plant();

  // ---- everything that can shade: the hall and its things, the ground for 90 tiles round, each near tree as a cone or a ball
  { const occ = parts.map(g => { const q = (g.index ? g.toNonIndexed() : g.clone()); for (const k of Object.keys(q.attributes)) if (k !== 'position') q.deleteAttribute(k); return q; });
    const G = new THREE.PlaneGeometry(180, 190, 360, 380).rotateX(-Math.PI / 2).translate(-10, 0, 0), P = G.attributes.position; for (let i = 0; i < P.count; i++) P.setY(i, ground(P.getX(i), P.getZ(i)) - 0.01);
    const gq = G.toNonIndexed(); gq.deleteAttribute('normal'); gq.deleteAttribute('uv'); occ.push(gq);
    solid = new MeshBVH(mergeGeometries(occ));
    const can = trees.filter(t => t.r < 80).map(t => { const g = t.fir ? new THREE.ConeGeometry(t.h * 0.2, t.h * 0.86, 7).translate(0, t.h * 0.56, 0) : new THREE.SphereGeometry(t.h * 0.5, 7, 5).scale(1, 0.5, 1).translate(0, t.h * 0.72, 0); g.translate(t.x, t.y, t.z); const q = g.toNonIndexed(); q.deleteAttribute('normal'); q.deleteAttribute('uv'); return q; });
    canopy = new MeshBVH(mergeGeometries(can));
    log.push('shade from ' + solid.geometry.attributes.position.count / 3 + ' triangles and ' + can.length + ' trees'); }
  for (const g of parts) { if (!g.attributes.normal) g.computeVertexNormals(); shade(g); }
  console.log('the hall is lit');

  // ---- the ground's paint and the far wall's
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true }); renderer.toneMapping = THREE.NoToneMapping;
  const nearG = sheet(197, 197, (i, j) => [-49 + i * 0.5, -49 + j * 0.5], true), fineG = sheet(153, 153, (i, j) => [-9.5 + i * 0.125, -9.5 + j * 0.125], true);
  console.log('the near ground is lit');
  const landC = document.createElement('canvas'); landC.width = landC.height = LS;
  { const sc = new THREE.Scene(), a = new THREE.Mesh(nearG, heroMat(1)), b = new THREE.Mesh(fineG, heroMat(1)); a.frustumCulled = b.frustumCulled = false; b.renderOrder = 1; sc.add(a, b); renderer.setClearColor(new THREE.Color(...HZ).convertLinearToSRGB(), 1);
    shot(renderer, LS, LS, sc, new THREE.Camera(), landC.getContext('2d'), 0, 0); }
  const cliffG = sheet(69, 2 * CZ * 2 + 1, (i, j) => { const z = -CZ + j * 0.5; return [axis(z) + 7 - i * 0.5, z]; }, true, cliffUv);
  { const sc = new THREE.Scene(), a = new THREE.Mesh(cliffG, heroMat(2)); a.frustumCulled = false; sc.add(a); shot(renderer, 2048, 1024, sc, new THREE.Camera(), ctx, 0, 1024); }
  console.log('the ground and the far wall are painted');

  // ---- the game's own ground: rings out from the bank, coarse (its detail is in the paint), stopping at the gorge where the far wall's sheet takes over
  { const K = 16, NS = 26, pos = [], idx = [], ring = k => 7.3 * Math.pow((R1 - 0.6) / 7.3, k / K), at = (k, i) => { const m = k > K ? ring(K) : ring(k), s = Math.floor(i / NS), f = (i % NS) / NS * 2 - 1, q = [[f, -1], [1, f], [-f, 1], [-1, -f]][s]; let x = q[0] * m, z = q[1] * m; x = Math.max(x, axis(z) + 6); return [x, ground(x, z) - (k === 0 ? 0.03 : k > K ? 7 : 0), z]; };
    for (let k = 0; k <= K + 1; k++) for (let i = 0; i < 4 * NS; i++) { pos.push(...at(k, i)); if (k <= K) { const a = k * 4 * NS + i, b = k * 4 * NS + (i + 1) % (4 * NS), c = a + 4 * NS, d = b + 4 * NS; idx.push(a, b, c, b, d, c); } }
    const [cx, cy, cs] = CELL.white, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); const q = g.toNonIndexed(), n = q.attributes.position.count;
    q.setAttribute('uv', new THREE.Float32BufferAttribute(Array.from({ length: n * 2 }, (_, i) => (i % 2 ? cy + cs / 2 : cx + cs / 2) / (i % 2 ? H : W)), 2)); q.userData.land = true; q.computeVertexNormals(); parts.push(shade(q));
    // the far wall's sheet
    const NU = 28, VS = [0, 0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92, 1], p2 = [], u2 = [], i2 = [];
    for (let j = 0; j < VS.length; j++) for (let i = 0; i <= NU; i++) { const z = -CZ + i / NU * 2 * CZ, x = cliffX(VS[j], z); p2.push(x, ground(x, z), z); u2.push(i / NU * (2046 / W) + 1 / W, (1024 + (1 - VS[j]) * 1022 + 1) / H); if (i < NU && j < VS.length - 1) { const a = j * (NU + 1) + i; i2.push(a, a + NU + 1, a + 1, a + 1, a + NU + 1, a + NU + 2); } }
    const c = new THREE.BufferGeometry(); c.setAttribute('position', new THREE.Float32BufferAttribute(p2, 3)); c.setAttribute('uv', new THREE.Float32BufferAttribute(u2, 2)); c.setIndex(i2); const cq = c.toNonIndexed(); cq.computeVertexNormals(); cq.userData.fixed = () => [1, 1, 1]; parts.push(shade(cq));
    log.push('ground ' + n / 3 + ' triangles, far wall ' + cq.attributes.position.count / 3); }

  // ---- falling water, mist, birds: one mesh the game moves (kind, phase, reach, pace at each point; a bird's circle's middle)
  const air = (() => { const pos = [], uv = [], col = [], move = [], cen = [];
    const put = (P, T, C, M, O = [0, 0, 0]) => { for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(P[i].x, P[i].y, P[i].z); uv.push(T[i][0], T[i][1]); const c = Array.isArray(C[0]) ? C[i] : C; col.push(c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255); move.push(...M); cen.push(...O); } };
    // the Greyveil: the stream over the far rim, then down the wall into the mist
    { const z0 = FALLZ, pts = [], zOf = x => z0 + 3 * Math.sin(x / 14); for (let k = 0; k <= 4; k++) { const x = axis(z0) - 18 - (4 - k) * 5; pts.push(V(x, ground(x, zOf(x)) + 0.5, zOf(x))); }
      const zr = pts[4].z; for (let k = 1; k <= 14; k++) { const x = axis(zr) - 18 + k * 1.05; pts.push(V(x + 1.1, Math.min(pts[pts.length - 1].y - 1.5, ground(x, zr) + 1.2), zr)); }
      let run = 0; for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], b = pts[k + 1], len = a.distanceTo(b), wA = k < 4 ? 1.1 : 1.3 + (k - 4) * 0.12, wB = k + 1 < 4 ? 1.1 : 1.3 + (k - 3) * 0.12, fa = hazeAt(a), fb2 = hazeAt(b), cA = [lerp(0.8, HZ[0], fa), lerp(0.84, HZ[1], fa), lerp(0.87, HZ[2], fa), k < 4 ? 0.5 * sm(k, 0, 1.5) : 0.82 * (1 - sm(k, 13, 18))], cB = [lerp(0.8, HZ[0], fb2), lerp(0.84, HZ[1], fb2), lerp(0.87, HZ[2], fb2), k + 1 < 4 ? 0.5 : 0.82 * (1 - sm(k + 1, 13, 18))];
        put([V(a.x, a.y, a.z + wA), V(a.x, a.y, a.z - wA), V(b.x, b.y, b.z - wB), V(b.x, b.y, b.z + wB)], [[0, run / 9], [1, run / 9], [1, (run + len) / 9], [0, (run + len) / 9]], [cA, cA, cB, cB], [0, 0, 0, k < 4 ? 0.35 : 1]); run += len; } }
    // mist: where the water lands, and lying along the gorge
    for (const [dx, y, z, w, h, a, amp] of [[-9, -10, FALLZ, 9, 16, 0.2, 0.9], [-4, -38, FALLZ, 13, 11, 0.5, 1.2], [-1, -31, FALLZ + 3, 17, 12, 0.34, 1.8], [-3, -25, FALLZ - 4, 15, 10, 0.22, 2.2], [1, -30, -34, 26, 12, 0.24, 2.6], [0, -32, 30, 28, 12, 0.24, 2.4], [2, -27, -62, 30, 13, 0.2, 3], [1, -29, 60, 30, 13, 0.2, 3], [3, -19, 8, 22, 9, 0.13, 3.2]]) { const x = axis(z) + dx, c = [0.86, 0.89, 0.92, a]; put([V(x, y - h / 2, z + w / 2), V(x, y - h / 2, z - w / 2), V(x, y + h / 2, z - w / 2), V(x, y + h / 2, z + w / 2)], [[0, 0], [1, 0], [1, 1], [0, 1]], c, [1, R() * 6.3, amp, 0.02 + R() * 0.02]); }
    // birds, far off: each on its own slow circle over the gorge or the crest
    for (const [cx, cy, cz, rad, pace] of [[-46, 20, -22, 15, 0.062], [-50, 27, 26, 21, -0.047], [-40, 34, -58, 17, 0.055], [-60, 16, 50, 12, -0.07], [-70, 38, -6, 26, 0.04], [44, 46, -52, 16, -0.058], [-52, 48, 10, 30, 0.036]]) { const s = 0.7, ph = R() * 6.3, f = hazeAt(V(cx, cy, cz)), c = [lerp(0.12, HZ[0], f), lerp(0.115, HZ[1], f), lerp(0.11, HZ[2], f), 1];
      put([V(-s, 0.14 * s, -0.08 * s), V(0, 0, -0.26 * s), V(0, 0, 0.34 * s), V(-s * 0.45, 0.05 * s, 0.1 * s)], [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], c, [2, ph, rad, pace], [cx, cy, cz]);
      put([V(s, 0.14 * s, -0.08 * s), V(s * 0.45, 0.05 * s, 0.1 * s), V(0, 0, 0.34 * s), V(0, 0, -0.26 * s)], [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], c, [2, ph, rad, pace], [cx, cy, cz]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(col), 4, true)); g.setAttribute('move', new THREE.Float32BufferAttribute(move, 4)); g.setAttribute('cen', new THREE.Float32BufferAttribute(cen, 3));
    return g; })();

  // ---- the far country, drawn once from the hall
  { const sc = new THREE.Scene(), NA = 1100, NR = 520, far = sheet(NA + 1, NR, (i, j) => { const r = 22 * Math.pow(6500 / 22, j / (NR - 1)), a = i / NA * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; }, false);
    const land = new THREE.Mesh(far, heroMat(0)); land.frustumCulled = false; sc.add(land);
    console.log('the far ground is lit');
    const skyT = new THREE.Texture(pix.sky); skyT.colorSpace = THREE.SRGBColorSpace; skyT.wrapS = THREE.RepeatWrapping; skyT.needsUpdate = true;
    // the photographed sky, its sun turned to the east, quieter, sinking into the haze at the horizon
    const d = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.drawImage(pix.sky, 0, 0, 512, 256); const D = x.getImageData(0, 0, 512, 128).data; let best = 0, bu = 0; for (let i = 0; i < 512; i++) { let s = 0; for (let j = 20; j < 100; j++) s += D[(j * 512 + i) * 4] + D[(j * 512 + i) * 4 + 1]; if (s > best) { best = s; bu = i / 512; } } return bu; })();
    const sky = new THREE.Mesh(new THREE.SphereGeometry(8000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { map: { value: skyT }, uOff: { value: d - 0.5 - Math.atan2(SUN.z, SUN.x) / 6.2831853 } },
      vertexShader: 'varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D map; uniform float uOff; varying vec3 vD; const vec3 HZ = vec3(${HZ.join(',')}); void main() { vec3 d = normalize(vD); vec3 c = texture2D(map, vec2(atan(d.z, d.x) / 6.2831853 + 0.5 + uOff, 0.5 + asin(clamp(d.y, -1.0, 1.0)) / 3.14159265)).rgb;
        float l = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(vec3(l), c, 0.6); c = mix(c / (1.0 + c * 0.2), vec3(0.62, 0.7, 0.8), 0.42); c = mix(c, HZ, 0.92 * smoothstep(0.26, -0.01, d.y)); gl_FragColor = vec4(c, 1.0);\n#include <colorspace_fragment>\n}` }));
    sky.frustumCulled = false; sc.add(sky);
    log.push('the sky photograph\'s sun is at ' + d.toFixed(3));
    // the tarn and the Tarnwater: still, the colour of the sky above them
    const wet = new THREE.ShaderMaterial({ uniforms: { uEye: { value: EYE } }, vertexShader: 'varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vP; ${HAZE_GL} void main() { vec3 c = hazed(vec3(0.3, 0.37, 0.43), vP, vP.x); gl_FragColor = vec4(c, 0.0);\n#include <colorspace_fragment>\n}` });
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(5000, 2600).rotateX(-Math.PI / 2).translate(0, WL, 1500), wet));
    { const pos = [], idx = []; for (let z = -420, k = 0; z <= 400; z += 4, k++) { const w = floorW(z) * 0.7, x = axis(z), y = floorY(z) + 0.35; pos.push(x - w, y, z, x + w, y, z); if (z < 400) idx.push(k * 2, k * 2 + 2, k * 2 + 1, k * 2 + 1, k * 2 + 2, k * 2 + 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, wet); m.frustumCulled = false; sc.add(m); }
    // the beacon on its crag, dark; the keep's ring under it
    { const [bx, bz] = BEACON, by = ground(bx, bz), geos = [new THREE.CylinderGeometry(3.6, 4.6, 34, 10).translate(0, 17, 0), new THREE.CylinderGeometry(4.6, 4.2, 2.2, 10).translate(0, 35, 0), new THREE.CylinderGeometry(1.2, 1.6, 5, 6).translate(0, 38.5, 0)];
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; geos.push(new THREE.BoxGeometry(24, 9, 2.4).rotateY(a).translate(Math.sin(a) * 12, 3, Math.cos(a) * 12), new THREE.CylinderGeometry(2.6, 3, 13, 8).translate(Math.sin(a + 0.785) * 17, 5, Math.cos(a + 0.785) * 17)); }
      const g = mergeGeometries(geos.map(q => q.toNonIndexed())).translate(bx, by - 2, bz), P = g.attributes.position, N = g.attributes.normal, li = new Float32Array(P.count * 3), mat = new Float32Array(P.count * 4), n = V();
      for (let i = 0; i < P.count; i++) { n.fromBufferAttribute(N, i); const c = farLight(P.getX(i), P.getY(i) + 3, P.getZ(i), n), k = 0.42 + 0.1 * hash(Math.floor(P.getY(i) / 3), i % 7); li.set([c[0] * k, c[1] * k * 0.97, c[2] * k * 0.93], i * 3); mat.set([0, 0, 1, 0], i * 4); }
      g.setAttribute('aLight', new THREE.BufferAttribute(li, 3)); g.setAttribute('aMat', new THREE.BufferAttribute(mat, 4)); g.setAttribute('aUv2', new THREE.BufferAttribute(new Float32Array(P.count * 2), 2));
      const hm = heroMat(0); hm.fragmentShader = hm.fragmentShader.replace('if (uMode == 1) { c = mix(c, vec3(1.0), vM.z);', 'c = mix(c, vec3(1.0), vM.z); if (uMode == 1) {'); const m = new THREE.Mesh(g, hm); m.frustumCulled = false; sc.add(m); }
    // every tree the game does not draw itself: two crossed cards each
    { const far = trees.filter(t => !t.near), base = new THREE.BufferGeometry(), q = [-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0, 0, 0, -0.5, 0, 0, 0.5, 0, 1, 0.5, 0, 1, -0.5];
      base.setAttribute('position', new THREE.Float32BufferAttribute(q, 3)); base.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1], 2)); base.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
      const g = new THREE.InstancedBufferGeometry().copy(base); g.instanceCount = far.length; const off = new Float32Array(far.length * 4), rect = new Float32Array(far.length * 4), tint = new Float32Array(far.length * 4), n = V();
      far.forEach((t, i) => { off.set([t.x, t.y, t.z, t.h], i * 4); rect.set([t.sp.u0, t.sp.v0, t.sp.u1, t.sp.v1], i * 4); normalAt(t.x, t.z, 1, n); const c = farLight(t.x, t.y + t.h * 0.7, t.z, n.lerp(V(0, 1, 0), 0.5).lerp(SUN, 0.3).normalize()); tint.set([c[0] / 0.78 * t.tint[0], c[1] / 0.78 * t.tint[1], c[2] / 0.78 * t.tint[2], t.sp.asp], i * 4); });
      g.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4)); g.setAttribute('aRect', new THREE.InstancedBufferAttribute(rect, 4)); g.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 4));
      const lt = new THREE.CanvasTexture(leafC); lt.colorSpace = THREE.SRGBColorSpace; lt.flipY = false; lt.premultiplyAlpha = false;
      const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { map: { value: lt }, uEye: { value: EYE } },
        vertexShader: 'attribute vec4 aOff, aRect, aTint; varying vec2 vUv; varying vec3 vC, vP; void main() { vec3 p = vec3(position.x * aOff.w * aTint.w, position.y * aOff.w, position.z * aOff.w * aTint.w) + aOff.xyz; vP = p; vC = aTint.rgb * (0.7 + 0.3 * position.y); vUv = vec2(mix(aRect.x, aRect.z, uv.x), mix(aRect.w, aRect.y, uv.y)); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
        fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying vec3 vC, vP; ${HAZE_GL} void main() { vec4 t = texture2D(map, vUv); if (t.a < 0.35) discard; gl_FragColor = vec4(hazed(t.rgb * vC, vP, vP.x), 0.0);\n#include <colorspace_fragment>\n}` }));
      m.frustumCulled = false; sc.add(m); }
    const rt = new THREE.WebGLCubeRenderTarget(2048, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter }), cc = new THREE.CubeCamera(3, 9000, rt); cc.position.copy(EYE); sc.add(cc);
    renderer.setClearColor(new THREE.Color(...HZ), 0); cc.update(renderer, sc);
    console.log('the far country is drawn');
    const flat = mode => new THREE.ShaderMaterial({ uniforms: { cube: { value: rt.texture } }, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `uniform samplerCube cube; varying vec2 vUv; void main() { float el = mix(${EL0.toFixed(6)}, ${EL1.toFixed(6)}, vUv.y), az = (vUv.x - 0.5) * 6.2831853; vec3 d = vec3(cos(el) * cos(az), sin(el), cos(el) * sin(az)); vec4 t = textureCube(cube, d);
        ${mode ? 'gl_FragColor = vec4(vec3(t.a), 1.0);' : 'gl_FragColor = vec4(t.rgb + (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 600.0, 1.0);\n#include <colorspace_fragment>'}\n}` });
    const q = new THREE.Scene(), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), flat(0)); quad.frustumCulled = false; q.add(quad);
    const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH; shot(renderer, PW, PH, q, new THREE.Camera(), pc.getContext('2d'), 0, 0);
    files['pano.jpg'] = pc.toDataURL('image/jpeg', 0.84).split(',')[1];
    quad.material = flat(1); const mc = document.createElement('canvas'); mc.width = 1024; mc.height = 356; const mx = mc.getContext('2d'); mx.filter = 'blur(2px) brightness(0.9) contrast(1.6)'; shot(renderer, 1024, 356, q, new THREE.Camera(), mx, 0, 0);
    files['mask.jpg'] = mc.toDataURL('image/jpeg', 0.8).split(',')[1]; }

  const all = mergeGeometries(parts.map(g => { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k); return g.index ? g.toNonIndexed() : g; }));
  all.deleteAttribute('normal');
  const root = new THREE.Group(), walls = new THREE.Mesh(mergeVertices(all), new THREE.MeshBasicMaterial({ vertexColors: true })), lv = new THREE.Mesh(mergeVertices(leaves()), new THREE.MeshBasicMaterial({ vertexColors: true })), am = new THREE.Mesh(air, new THREE.MeshBasicMaterial({ vertexColors: true }));
  walls.name = 'dungeon'; lv.name = 'ivy'; am.name = 'air'; root.add(walls, lv, am);
  files['dungeon.glb'] = b64(await exportGlb(root));
  files['atlas.jpg'] = canvas.toDataURL('image/jpeg', 0.84).split(',')[1];
  files['land.jpg'] = landC.toDataURL('image/jpeg', 0.84).split(',')[1];
  files['leaf.webp'] = leafC.toDataURL('image/webp', 0.86).split(',')[1];
  const small = async (name, s) => { const c = document.createElement('canvas'); c.width = c.height = s; c.getContext('2d').drawImage(await img('/full/tex/' + name + '.jpg'), 0, 0, s, s); return c.toDataURL('image/jpeg', 0.86).split(',')[1]; };
  files['flag.jpg'] = await small('flag', 512); files['lava.jpg'] = await small('lava_glow', 256);
  log.push('hall, ground and far wall ' + all.attributes.position.count / 3 + ' triangles, leaves ' + lv.geometry.index.count / 3 + ', air ' + air.attributes.position.count / 3);
  return { files, log };
};
