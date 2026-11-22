// SKIRMISH TABLE's dungeon bake, the part that runs in a browser (tools/chess-bake.cjs dungeon): the board's surround as one still mesh on one picture, its light, its shade and the lava's glow worked into each point's colour; the ivy a second mesh
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer';
import { thin, b64, exportGlb } from './chess-bake.page.js';

// the plan, in tiles (the board with its kerb is 9.7 by 11.7): a moat of lava round the board, a bank of rock round the moat, low broken walls before each seat, the brick wall and its two towers to the east, the cavern's rock to the west
const BX = 4.85, BZ = 5.85, MX = 5.5, MZ = 6.5, OX = 7.5, OZ = 7.5, LAVA = -0.3, FLOOR = -0.34;
export const PITS = [[-5.98, -6.78], [5.98, -6.78], [-5.98, 6.78], [5.98, 6.78]];
const W = 2048, H = 768, CELL = { brick: [0, 0, 512, 2], wall: [512, 0, 512, 2], floor: [1024, 0, 512, 3], kerb: [1536, 0, 256, 1.5], moat: [1792, 0, 256, 1.5], rock_face_01: [1536, 256, 256], rock_face_02: [1792, 256, 256],
  namaqualand_boulder_02: [256, 512, 256], rock_moss_set_01: [512, 512, 256], stone_fire_pit: [768, 512, 256], large_iron_gate: [1024, 512, 256], treasure_chest: [1536, 512, 256], white: [1800, 520, 48] };
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d'); ctx.fillStyle = '#4a4744'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.fillRect(1792, 512, 64, 64);
const log = [], files = {}, loader = new GLTFLoader();
let seed = 11; const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- light, worked out once for every point: a dim cool cavern, a low warm sun for form, the lava's glow from the moat, the embers' from the four pits, dark where a thing meets the ground
const SUN = V(8, 9, 1).normalize(), toLava = V(), tmp = V();
function lavaAt(p) {   // the nearest point of the moat's middle line
  const hx = (BX + MX) / 2, hz = (BZ + MZ) / 2, x = THREE.MathUtils.clamp(p.x, -hx, hx), z = THREE.MathUtils.clamp(p.z, -hz, hz);
  if (hx - Math.abs(x) < hz - Math.abs(z)) return toLava.set(Math.sign(p.x || 1) * hx, LAVA, z);
  return toLava.set(x, LAVA, Math.sign(p.z || 1) * hz);
}
function light(p, n, ao = 1) {
  const s = Math.max(0, n.dot(SUN)), up = n.y * 0.5 + 0.5;
  let r = 0.2 + 0.1 * up + 0.4 * s, g = 0.21 + 0.11 * up + 0.37 * s, b = 0.25 + 0.13 * up + 0.31 * s;
  const d = tmp.copy(lavaAt(p)).sub(p), dl = d.length(), fl = 0.3 + 0.7 * Math.max(0, n.dot(d.normalize())), gl = 1.25 / (1 + (dl / 0.8) ** 2) * fl;
  r += gl; g += gl * 0.4; b += gl * 0.1;
  for (const [x, z] of PITS) { const e = tmp.set(x, 0.45, z).sub(p), de = e.length(), k = 0.9 / (1 + (de / 0.75) ** 2) * (0.35 + 0.65 * Math.max(0, n.dot(e.normalize()))); r += k; g += k * 0.5; b += k * 0.2; }
  const k = ao * (1 - 0.1 * Math.min(1, Math.max(0, p.y) / 4));
  return [Math.min(1, r * k), Math.min(1, g * k), Math.min(1, b * k)];
}

// ---- a part: points, where each is in the picture, then its colour from the light
const parts = [];
function finish(pos, uv, aoOf) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  return shade(g, aoOf);
}
function shade(g, aoOf) {
  const P = g.attributes.position, N = g.attributes.normal, col = new Uint8Array(P.count * 4), p = V(), n = V(), stain = q => 0.84 + 0.16 * (Math.sin(q.x * 1.7 + q.y * 2.3) * Math.sin(q.z * 1.9 - q.y * 1.1) + Math.sin(q.x * 4.1 - q.z * 3.3 + q.y * 5.2) * 0.5);   // old walls are not one colour: slow stains, the same at any point however it is cut
  for (let i = 0; i < P.count; i++) { p.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i); const c = light(p, n, (aoOf ? aoOf(p, n) : 1) * stain(p)); col[i * 4] = c[0] * 255; col[i * 4 + 1] = c[1] * 255; col[i * 4 + 2] = c[2] * 255; col[i * 4 + 3] = 255; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 4, true));
  return g;
}
// flat faces under a tiling picture: every square is cut on the picture's own grid, so its place in the one picture never wraps
class Faces {
  constructor(cell) { this.c = CELL[cell]; this.pos = []; this.uv = []; }
  // a, b, c, d: corners, counter-clockwise seen from `out`; s, t: each corner's place on the surface, in tiles
  quad(a, b, c, d, st, out) {
    const [cx, cy, cs, rep] = this.c, n = tmp.copy(b).sub(a).cross(V().copy(d).sub(a)), flip = n.dot(out) < 0, P = flip ? [a, d, c, b] : [a, b, c, d], S = flip ? [st[0], st[3], st[2], st[1]] : st;
    const s0 = Math.floor(Math.min(...S.map(q => q[0])) / rep + 1e-6) * rep, t0 = Math.floor(Math.min(...S.map(q => q[1])) / rep + 1e-6) * rep;
    for (const i of [0, 1, 2, 0, 2, 3]) { this.pos.push(P[i].x, P[i].y, P[i].z); this.uv.push((cx + 2 + Math.min(1, (S[i][0] - s0) / rep) * (cs - 4)) / W, (cy + 2 + (1 - Math.min(1, (S[i][1] - t0) / rep)) * (cs - 4)) / H); }
  }
  done(ao) { if (this.pos.length) parts.push(finish(this.pos, this.uv, ao)); }
}
// A ruined wall: columns half a tile wide along a line (at(u, side, y) gives a point: side 0 its inner face, 1 its outer), each its own height (hi) and, over an opening, its own underside (lo).
function ruin(cell, cap, n, at, hi, lo, outOf, cw = 0.5) {
  const F = new Faces(cell), C = new Faces(cap), step = 0.5;
  for (let i = 0; i < n; i++) {
    const h = hi[i], l = lo ? lo[i] : 0; if (h <= l) continue;
    for (const side of [0, 1]) for (let y = l; y < h - 1e-6; y += step) { const y1 = Math.min(h, y + step), o = outOf(i + 0.5, side);
      F.quad(at(i, side, y), at(i + 1, side, y), at(i + 1, side, y1), at(i, side, y1), [[i * cw, y], [i * cw + cw, y], [i * cw + cw, y1], [i * cw, y1]], o); }
    C.quad(at(i, 0, h), at(i + 1, 0, h), at(i + 1, 1, h), at(i, 1, h), [[i * cw, 0], [i * cw + cw, 0], [i * cw + cw, 0.5], [i * cw, 0.5]], V(0, 1, 0));
    if (l > 0) C.quad(at(i, 0, l), at(i + 1, 0, l), at(i + 1, 1, l), at(i, 1, l), [[i * cw, 0], [i * cw + cw, 0], [i * cw + cw, 0.5], [i * cw, 0.5]], V(0, -1, 0));
    for (const [j, u] of [[i - 1, i], [i + 1, i + 1]]) {   // the broken end where a neighbour is lower, or the jamb of an opening
      const nh = j < 0 || j >= n ? 0 : hi[j], nl = j < 0 || j >= n ? 0 : (lo ? lo[j] : 0), o = tmp.copy(at(u + (j < i ? -1 : 1) * 0.01, 0, 0)).sub(at(u, 0, 0)).normalize().clone();
      for (const [y0, y1] of [[Math.max(l, nh), h], [l, Math.min(h, nl)]]) for (let y = y0; y < y1 - 1e-6; y += step) { const yb = Math.min(y1, y + step);
        F.quad(at(u, 0, y), at(u, 1, y), at(u, 1, yb), at(u, 0, yb), [[0, y], [0.5, y], [0.5, yb], [0, yb]], o); }
    }
  }
  const ao = p => 0.55 + 0.45 * THREE.MathUtils.smoothstep(p.y, 0, 0.6);
  F.done(ao); C.done(ao);
}
const broken = (n, lo, hi, gap = 0) => { const a = []; let h = lo + R() * (hi - lo), g = 0; for (let i = 0; i < n; i++) { h = THREE.MathUtils.clamp(h + (R() - 0.5) * (hi - lo) * 0.6, lo, hi); if (g > 0) g--; else if (R() < gap) g = 1 + Math.floor(R() * 3); a.push(g > 0 ? 0 : Math.round(h * 16) / 16); } return a; };

function build() {
  // the bank of rock round the moat, its rim ragged and falling to the table
  { const F = new Faces('floor'), M = new Faces('moat'), s = 0.5, yAt = (x, z) => { const e = Math.max(Math.abs(x) - (OX - 0.5), Math.abs(z) - (OZ - 0.5)); return e <= 0 ? 0 : FLOOR * Math.min(1, e / 0.5) ** 1.5; }, jit = new Map();
    const pt = (x, z) => { const k = x + ',' + z, rim = Math.abs(x) >= OX || Math.abs(z) >= OZ; if (!jit.has(k)) jit.set(k, rim ? [(R() - 0.5) * 0.3, (R() - 0.5) * 0.3] : [0, 0]); const j = jit.get(k); return V(x + j[0], yAt(x, z), z + j[1]); };
    for (let x = -OX; x < OX - 1e-6; x += s) for (let z = -OZ; z < OZ - 1e-6; z += s) { if (x >= -MX && x + s <= MX && z >= -MZ && z + s <= MZ) continue;
      F.quad(pt(x, z + s), pt(x + s, z + s), pt(x + s, z), pt(x, z), [[x + 20, 20 - z - s], [x + s + 20, 20 - z - s], [x + s + 20, 20 - z], [x + 20, 20 - z]], V(0, 1, 0)); }
    for (let x = -MX; x < MX - 1e-6; x += s) for (const z of [-MZ, MZ]) M.quad(V(x, LAVA - 0.04, z), V(x + s, LAVA - 0.04, z), V(x + s, 0, z), V(x, 0, z), [[x + 20, 0], [x + s + 20, 0], [x + s + 20, 0.34], [x + 20, 0.34]], V(0, 0, -z));
    for (let z = -MZ; z < MZ - 1e-6; z += s) for (const x of [-MX, MX]) M.quad(V(x, LAVA - 0.04, z), V(x, LAVA - 0.04, z + s), V(x, 0, z + s), V(x, 0, z), [[z + 20, 0], [z + s + 20, 0], [z + s + 20, 0.34], [z + 20, 0.34]], V(-x, 0, 0));
    F.done(p => 0.8 + 0.2 * R()); M.done(); }
  // low broken walls before each seat: nothing here stands between a player and the board
  for (const sz of [-1, 1]) { const n = 40, x0 = -5, hi = broken(n, 0.2, 0.72, 0.1);
    ruin('wall', 'wall', n, (u, side, y) => V(x0 + u * 0.25, y, sz * (6.7 + side * 0.3)), hi, null, (u, side) => V(0, 0, sz * (side ? 1 : -1)), 0.25); }
  // the east: a brick wall with an arched gateway, a tower at each end of it
  { const n = 44, z0 = -5.5, hi = broken(n, 2.3, 3.5), lo = hi.map(() => 0);
    for (let i = 18; i < 26; i++) { lo[i] = i === 18 || i === 25 ? 1.5 : i === 19 || i === 24 ? 1.75 : 2; hi[i] = Math.max(hi[i], 2.75); }
    ruin('brick', 'brick', n, (u, side, y) => V(6.45 + side * 0.45, y, z0 + u * 0.25), hi, lo, (u, side) => V(side ? 1 : -1, 0, 0), 0.25);
    for (const [cz, lo2, hi2] of [[-6.2, 3.1, 3.9], [6.2, 1.7, 2.9]]) { const m = 14, hs = broken(m, lo2, hi2), rr = side => 0.72 + side * 0.0 - (1 - side) * 0.32;
      ruin('brick', 'brick', m, (u, side, y) => { const a = (u / m) * Math.PI * 2; return V(6.6 + Math.cos(a) * rr(side), y, cz + Math.sin(a) * rr(side)); }, hs, null, (u, side) => { const a = (u / m) * Math.PI * 2; return V(Math.cos(a), 0, Math.sin(a)).multiplyScalar(side ? 1 : -1); }); } }
}

// ---- the scanned things: each stood on the bank at its place, sized by its height, on its own corner of the picture
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
  for (const { at, tall, wide, turn = 0, tilt = 0, sink = 0 } of list) {
    const k = tall ? tall / size.y : wide / Math.max(size.x, size.z), q = geo.clone();
    q.rotateX(tilt).rotateY(turn).scale(k, k, k).translate(at[0], (at[2] || 0) - sink, at[1]); q.computeVertexNormals();
    const base = (at[2] || 0); parts.push(shade(q, p => 0.6 + 0.4 * THREE.MathUtils.smoothstep(p.y - base, 0, 0.5)));
  }
  log.push(name + ' ' + geo.index.count / 3 + ' triangles x' + list.length + ' (' + size.toArray().map(v => v.toFixed(2)).join(' by ') + ')');
}

// ---- ivy: real leaves (ambientCG LeafSet029), a leaf a square, strung down the walls
function ivy() {
  const pos = [], uv = [], col = [], leaf = (c, right, upv, out, s) => { const k = Math.floor(R() * 7), u0 = (k % 3) / 3, v0 = Math.floor(k / 3) / 3, a = R() * 6.283, r = V().copy(right).multiplyScalar(Math.cos(a)).addScaledVector(upv, Math.sin(a)), u = V().crossVectors(out, r);
    r.addScaledVector(out, (R() - 0.5) * 0.7).normalize(); const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => V().copy(c).addScaledVector(r, x * s).addScaledVector(u, y * s)), T = [[0.02, 0.98], [0.98, 0.98], [0.98, 0.02], [0.02, 0.02]], L = light(c, out), g = 0.5 + R() * 0.3;
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(P[i].x, P[i].y, P[i].z); uv.push(u0 + T[i][0] / 3, v0 + T[i][1] / 3); col.push(L[0] * g * 0.62 * 255, L[1] * g * 0.74 * 255, L[2] * g * 0.5 * 255, 255); } };
  const vine = (start, right, out, len, n) => { const p = V().copy(start), up = V(0, 1, 0); let drift = (R() - 0.5) * 0.5;
    for (let i = 0; i < n; i++) { drift += (R() - 0.5) * 0.25; p.y -= len / n; p.addScaledVector(right, drift * len / n); if (p.y < 0.05) break; leaf(V().copy(p).addScaledVector(out, 0.03 + R() * 0.04).addScaledVector(right, (R() - 0.5) * 0.16), right, up, out, 0.04 + R() * 0.035); } };
  for (let i = 0; i < 9; i++) vine(V(6.45, 2.3 + R() * 0.9, -5 + R() * 10), V(0, 0, 1), V(-1, 0, 0), 1.2 + R() * 1.6, 34);   // down the brick wall's inner face
  for (const sz of [-1, 1]) for (let i = 0; i < 7; i++) { const x = -4.8 + R() * 9.6; vine(V(x, 0.5, sz * 6.7), V(1, 0, 0), V(0, 0, -sz), 0.5, 11); vine(V(x + 0.3, 0.5, sz * 7.0), V(1, 0, 0), V(0, 0, sz), 0.5, 11); }
  for (const cz of [-6.2, 6.2]) for (let i = 0; i < 5; i++) { const a = Math.PI * (0.55 + R() * 0.9), o = V(Math.cos(a), 0, Math.sin(a)); vine(V(6.6 + o.x * 0.72, 1.6 + R() * 1.2, cz + o.z * 0.72), V(-o.z, 0, o.x), o, 1.4, 26); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(col), 4, true)); g.computeVertexNormals();
  return g;
}

window.bakeDungeon = async () => {
  await MeshoptSimplifier.ready;
  const QUIET = { brick: 'saturate(0.5) brightness(0.8)', wall: 'saturate(0.8) brightness(0.9)', floor: 'saturate(0.75) brightness(0.85)', kerb: 'saturate(0.6) brightness(0.7)', moat: 'brightness(0.9)' };   // muted: no surface shouts
  for (const name of Object.keys(QUIET)) { const [x, y, s] = CELL[name]; ctx.filter = QUIET[name]; ctx.drawImage(await img('/full/tex/' + name + '.jpg'), x, y, s, s); }
  ctx.filter = 'none';
  build();
  // the cavern's rock down the west side, rubble where the walls have fallen, the embers' pits at the corners, the gate in its arch, a chest
  await thing('rock_face_01', 560, [{ at: [-6.9, -4.1], tall: 3.6, turn: Math.PI / 2, tilt: -0.12 }, { at: [-6.95, 1.5], tall: 3.0, turn: Math.PI / 2 + 0.35 }]);
  await thing('rock_face_02', 560, [{ at: [-6.85, 4.3], tall: 3.3, turn: Math.PI / 2 + 0.2, tilt: -0.1 }, { at: [-6.9, -1.3], tall: 2.7, turn: Math.PI / 2 - 0.4 }, { at: [-7.3, 0.2], tall: 3.8, turn: Math.PI / 2 + 0.1 }]);
  await thing('rock_moss_set_01', 300, [{ at: [-6.05, 2.5], wide: 1.4 }, { at: [6.0, -3.9], wide: 0.9, turn: 2 }]);
  await thing('namaqualand_boulder_02', 90, [{ at: [-6.0, -1.7], wide: 0.7 }, { at: [-5.95, 5.9], wide: 0.8, turn: 1 }, { at: [5.4, 6.85], wide: 0.4, turn: 2 }, { at: [-5.35, -6.85], wide: 0.45, turn: 4 }, { at: [6.05, 4.3], wide: 0.45, turn: 3 }, { at: [-6.3, -6.3], wide: 0.8, turn: 5 }, { at: [-6.6, 6.6], wide: 0.6 }, { at: [5.9, -1.9], wide: 0.35, turn: 1 }, { at: [-6.1, -3.2], wide: 0.5, turn: 2.2 }, { at: [-6.0, 3.6], wide: 0.45, turn: 0.7 }]);
  await thing('stone_fire_pit', 200, PITS.map(([x, z]) => ({ at: [x, z], wide: 0.56 })));
  await thing('large_iron_gate', 500, [{ at: [6.62, 0], tall: 1.95, turn: Math.PI / 2 }]);
  await thing('treasure_chest', 200, [{ at: [6.0, 1.9], wide: 0.5, turn: -1.9 }]);
  // the embers in each pit: a small bright disc
  { const [cx, cy, cs] = CELL.white, u = (cx + cs / 2) / W, v = (cy + cs / 2) / H;
    for (const [x, z] of PITS) { const g = new THREE.CircleGeometry(0.2, 10).rotateX(-Math.PI / 2).translate(x, 0.16, z).toNonIndexed(), P = g.attributes.position, col = new Uint8Array(P.count * 4);
      for (let i = 0; i < P.count; i++) { const r = Math.hypot(P.getX(i) - x, P.getZ(i) - z) / 0.2; col.set([(0.92 - 0.4 * r) * 255, (0.3 - 0.2 * r) * 255, (0.06 - 0.05 * r) * 255, 255], i * 4); g.attributes.uv.setXY(i, u, v); }
      g.setAttribute('color', new THREE.BufferAttribute(col, 4, true)); parts.push(g); } }
  const all = mergeGeometries(parts.map(g => { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k); return g.index ? g.toNonIndexed() : g; }));
  all.deleteAttribute('normal');
  const root = new THREE.Group(), walls = new THREE.Mesh(mergeVertices(all), new THREE.MeshBasicMaterial({ vertexColors: true })), leaves = new THREE.Mesh(ivy(), new THREE.MeshBasicMaterial({ vertexColors: true }));
  leaves.geometry.deleteAttribute('normal'); leaves.geometry = mergeVertices(leaves.geometry); walls.name = 'dungeon'; leaves.name = 'ivy'; root.add(walls, leaves);
  files['dungeon.glb'] = b64(await exportGlb(root));
  files['atlas.jpg'] = canvas.toDataURL('image/jpeg', 0.88).split(',')[1];
  const small = async (name, s) => { const c = document.createElement('canvas'); c.width = c.height = s; c.getContext('2d').drawImage(await img('/full/tex/' + name + '.jpg'), 0, 0, s, s); return c.toDataURL('image/jpeg', 0.86).split(',')[1]; };
  files['flag.jpg'] = await small('flag', 512); files['floor.jpg'] = await small('floor', 512); files['lava.jpg'] = await small('lava_glow', 256);
  log.push('surround ' + all.attributes.position.count / 3 + ' triangles, ivy ' + leaves.geometry.index.count / 3);
  return { files, log, copy: { 'ivy.png': 'ivy.png' } };
};
