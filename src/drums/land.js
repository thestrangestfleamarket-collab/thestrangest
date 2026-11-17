// THE GARAGE's land: what makes the street a place: the sky's own light on everything outdoors, trees from scanned cards that sway, hedges, drives, garages, porches, chimneys, poles and their wires, rolling ground out to the mountains, the shadows the sun lays and moves, birds, a chimney's smoke
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { pbr, plain, slabGeo, model, P } from './assets.js';
import { ROOM } from './garage.js';

const hsh = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return hsh(xi, yi) * (1 - u) * (1 - v) + hsh(xi + 1, yi) * u * (1 - v) + hsh(xi, yi + 1) * (1 - u) * v + hsh(xi + 1, yi + 1) * u * v; };
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function dressLand(scene, street, garage, low) {
  const group = new THREE.Group(); scene.add(group);
  const { FAR, FRONT, PAVE, ROADZ, RUN, M: SM } = street, Z0 = ROOM.z0;
  const bins = new Map(), box = (mat, w, h, d, x, y, z) => { if (!bins.has(mat)) bins.set(mat, []); bins.get(mat).push(slabGeo(w, h, d, mat.userData.tile || 1, x, y, z)); };
  const raw = (mat, g) => { if (!bins.has(mat)) bins.set(mat, []); bins.get(mat).push(g.index ? g.toNonIndexed() : g); };
  const M = { hedge: pbr('grass', { tile: 0.9, color: 0x55703f, env: 0.05 }), kerb: plain(0x8a877f, { rough: 1 }), pole: plain(0x4a3b2d, { rough: 1 }), gdoor: plain(0xdedad0, { rough: 0.6 }), chim: pbr('brick', { tile: 1.2, color: 0x9a8a80, env: 0.1 }),
    drive: pbr('drive', { tile: 2.4, env: 0.2, color: 0xd9d6cf }), bed: plain(0x3a2c22, { rough: 1 }), rock: plain(0x5e5c56, { rough: 1 }), ground: plain(0x3f5230, { rough: 1 }) };
  const casters = street.casters, solids = street.solids;
  // kerbs, a wide ground under everything, and every house finished: a drive and a garage door, a porch, a chimney, a bed under the windows, a hedge or a fence to the next lot
  box(M.kerb, 2 * RUN, 0.14, 0.16, 0, 0, ROADZ + 3.58); box(M.kerb, 2 * RUN, 0.14, 0.16, 0, 0, ROADZ - 3.58);
  const gd = new THREE.Mesh(new THREE.CircleGeometry(420, 48).rotateX(-Math.PI / 2), M.ground); gd.position.y = -0.16; group.add(gd);
  const cars = [];
  for (const h of street.houses) {
    const s = h.far ? 1 : -1, front = h.z + s * h.d / 2, kerb = h.far ? FAR - 0.85 : PAVE + 0.85, dx = h.x + (h.i % 2 ? -1 : 1) * (h.w / 2 - 1.7), len = Math.abs(front - kerb);
    box(M.drive, 3, 0.06, len, dx, -0.012, (front + kerb) / 2);
    box(M.gdoor, 2.6, 2.1, 0.08, dx, 1.05, front + s * 0.02); for (let k = 1; k < 4; k++) box(SM.steel, 2.6, 0.02, 0.09, dx, k * 0.525, front + s * 0.03);
    if (h.far) { box(SM.trim, 2.6, 0.1, 1.5, h.door, 2.45, front + 0.7); for (const px of [-1.15, 1.15]) box(SM.trim, 0.1, 2.4, 0.1, h.door + px, 1.2, front + 1.35); }
    box(M.chim, 0.7, 1.9, 0.7, h.x + (h.i % 2 ? 2.4 : -2.6), h.h + 1.3, h.z);
    box(M.bed, h.w - 4.5, 0.12, 0.7, h.x - (dx - h.x) * 0.35, 0.02, front + s * 0.45);
    if ((h.i + (h.far ? 0 : 1)) % 2) { box(M.hedge, 0.7, 1.05, len - 1, h.x + h.w / 2 + 1, 0.52, (front + kerb) / 2 + s * 0.4); solids.push([h.x + h.w / 2 + 0.6, Math.min(front, kerb) + 0.5, h.x + h.w / 2 + 1.4, Math.max(front, kerb) - 0.5]); casters.push([h.x + h.w / 2 + 1, (front + kerb) / 2, 0.7, len - 1, 1.05]); }
    else box(SM.fence, 0.05, 0.9, len - 1, h.x + h.w / 2 + 1, 0.45, (front + kerb) / 2 + s * 0.4);
    { // each yard dressed by its own draw of real things: a hose on the wall, planters, pots, rocks along the bed, bins by the garage, a ladder or broom left out, a watering can, crates
      const R = (k) => hsh(h.x * 1.7 + k * 9.1, h.far ? 5 : 6), wallZ = front + s * 0.12, ry = h.far ? 0 : Math.PI, put = (n, x, z, o) => model(n, x, o.y || 0, z, o.ry ?? R(n.length) * 6.28, { shadow: false, ...o }, group);
      if (R(1) > 0.35) put('garden_hose_wall_mounted_01', h.x + (R(2) - 0.5) * (h.w - 4), wallZ, { y: 0.7, h: 0.5, ry });
      if (R(3) > 0.3) put('planter_box_01', h.x + (R(4) - 0.5) * (h.w - 5), front + s * 0.5, { h: 0.4, ry });
      for (let k = 0; k < 1 + Math.floor(R(5) * 4); k++) put(R(6 + k) > 0.5 ? 'potted_plant_04' : 'potted_plant_01', h.x + (R(10 + k) - 0.5) * h.w * 0.9, front + s * (0.6 + R(14 + k) * 0.5), { h: R(6 + k) > 0.5 ? 0.3 + R(k) * 0.2 : 0.7 + R(k) * 0.7 });
      if (R(20) > 0.4) { put('metal_trash_can', dx + (h.i % 2 ? 1.9 : -1.9), front + s * 0.7, { h: 0.75, ry: ry + 1.57 }); }
      if (R(21) > 0.6) put('trashbag', dx + (h.i % 2 ? 2.6 : -2.6), front + s * 0.5, { h: 0.45 });
      if (R(22) > 0.65) put('wooden_ladder', h.x - h.w / 2 + 0.6, front + s * 0.3, { h: 1.3, ry: ry + (R(23) - 0.5) });
      if (R(24) > 0.6) put('plastic_broom', h.door ? h.door + 0.9 : h.x, wallZ + s * 0.1, { h: 1.2 });
      if (R(25) > 0.5) put('watering_can_metal_01', h.x + (R(26) - 0.5) * 5, front + s * 0.9, { h: 0.22 });
      if (R(27) > 0.7) put('wooden_crate_02', h.x + h.w / 2 - 0.8, front + s * 0.5, { h: 0.4 });
      if (R(28) > 0.72) put('plastic_crate_01', h.x - h.w / 2 + 1.5, front + s * 0.6, { h: 0.25 });
      if (R(29) > 0.75) put('metal_stool_01', h.door ? h.door - 1.6 : h.x + 1, front + s * 1.0, { h: 0.6 });
      // rocks edging the bed, a few of them, each its own size and turn
      for (let k = 0, n = 3 + Math.floor(R(30) * 7); k < n; k++) { const g = new THREE.DodecahedronGeometry(0.1 + R(31 + k) * 0.16, 0); g.scale(1, 0.6 + R(40 + k) * 0.3, 0.8 + R(50 + k) * 0.5); g.rotateY(R(60 + k) * 6); g.translate(h.x - (dx - h.x) * 0.35 + (R(70 + k) - 0.5) * (h.w - 4.5), 0.05, front + s * (0.85 + R(80 + k) * 0.2)); raw(M.rock, g); }
    }
    if (Math.abs(h.x) > 8 && hsh(h.x, h.far ? 1 : 2) > 0.45) { const c = street.makeCar(Math.floor(hsh(h.x, 7) * 4)); c.position.set(dx, 0, (front + kerb) / 2 + s * 0.6); c.rotation.y = Math.PI / 2; cars.push(c); solids.push([dx - 1.1, c.position.z - 2.2, dx + 1.1, c.position.z + 2.2]); casters.push([dx, c.position.z, 1.7, 4, 1.3]); }
  }
  // your own house, joined to the garage's right side and back, and a hipped roof on the garage
  { const hx = 7.6, hz = 3.2, w = 9, d = 10, h = 3.1, br = SM.brick[0], f = hz - d / 2;
    box(br, w, h, d, hx, h / 2, hz); solids.push([hx - w / 2 - 0.2, f - 0.2, hx + w / 2 + 0.2, hz + d / 2 + 0.2]); casters.push([hx, hz, w, d, 4]);
    const rg = new THREE.CylinderGeometry(0.02, 1, 1.9, 4, 1).rotateY(Math.PI / 4); rg.scale(w * 0.78, 1, d * 0.8); rg.translate(hx, h + 0.95, hz); raw(SM.roof[1], rg);
    const gr = new THREE.CylinderGeometry(0.02, 1, 1.5, 4, 1).rotateY(Math.PI / 4); gr.scale(4.5, 1, 5.6); gr.translate(0, ROOM.h + 1.02, (ROOM.z0 + ROOM.z1) / 2); raw(SM.roof[1], gr);
    box(SM.trim, 1.1, 2.15, 0.1, hx - 1.5, 1.07, f - 0.02); box(SM.door[1], 0.92, 2.0, 0.12, hx - 1.5, 1.0, f - 0.03); box(SM.pave, 2.4, 0.18, 1.3, hx - 1.5, 0.07, f - 0.65); box(SM.pave, 1.1, 0.06, f - PAVE - 1.4, hx - 1.5, -0.01, (f + PAVE) / 2 - 0.3);
    box(SM.trim, 2.6, 0.1, 1.5, hx - 1.5, 2.45, f - 0.7); for (const px of [-1.15, 1.15]) box(SM.trim, 0.1, 2.4, 0.1, hx - 1.5 + px, 1.2, f - 1.35);
    for (const wx of [-3.4, 1.0, 3.0]) { box(SM.trim, 1.25, 1.3, 0.08, hx + wx, 1.75, f - 0.02); box(SM.win, 1.1, 1.15, 0.1, hx + wx, 1.75, f - 0.03); }
    box(M.chim, 0.7, 1.9, 0.7, hx + 2.4, h + 1.3, hz); box(M.bed, 5, 0.12, 0.7, hx + 1.6, 0.02, f - 0.45); }
  // the poles and their wires along the far pavement
  const wire = [];
  for (let x = -112; x <= 112; x += 28) { raw(M.pole, new THREE.CylinderGeometry(0.1, 0.13, 8.4, 7).translate(x, 4.2, FAR - 1.25)); box(M.pole, 0.1, 0.1, 1.9, x, 7.7, FAR - 1.25); casters.push([x, FAR - 1.25, 0.2, 0.2, 8]);
    if (x < 112) for (const dz of [-0.8, 0, 0.8]) for (let k = 0; k < 8; k++) { const a = k / 8, b = (k + 1) / 8, sag = (t) => 7.75 - 0.9 * 4 * t * (1 - t); wire.push(x + a * 28, sag(a), FAR - 1.25 + dz, x + b * 28, sag(b), FAR - 1.25 + dz); } }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
  group.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x15171a })));
  for (const [mat, list] of bins) { const m = new THREE.Mesh(mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g))), mat); m.receiveShadow = true; group.add(m); }

  // the ground beyond the houses: it rolls, rising toward the mountains, lower where the road runs through
  const hgt = (x, z) => { const r = Math.hypot(x, z); return (vn(x * 0.02 + 5, z * 0.02) * 16 + vn(x * 0.06, z * 0.06 + 9) * 5 - 4) * ss(48, 110, r) * (0.25 + 0.75 * ss(6, 34, Math.abs(z - ROADZ))) - 0.2; };
  { const NR = low ? 10 : 18, NA = low ? 36 : 72, pos = [], col = [], idx = [], c = new THREE.Color();
    for (let i = 0; i <= NR; i++) for (let j = 0; j <= NA; j++) { const r = 44 + (i / NR) ** 1.4 * 300, a = j / NA * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r, y = hgt(x, z), n = vn(x * 0.05, z * 0.05);
      pos.push(x, y, z); c.setRGB(0.2 + 0.1 * n, 0.3 + 0.12 * n, 0.14 + 0.05 * n).lerp(new THREE.Color(0.36, 0.33, 0.22), ss(0.55, 0.8, vn(x * 0.013, z * 0.013 + 4))); col.push(c.r, c.g, c.b); }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); m.userData.amb = 0x6a7a4a; group.add(m); }

  // trees: scanned broadleaf and fir on crossed cards, lit by the day, bending a little in the wind
  const sway = { value: 0 }, wind = { value: 0.3 };
  // each species: two pictures of the same tree from two sides, set at right angles at the tree's own width and height
  const cards = (name) => {
    const T = P.trees[name], make = (map) => { const mat = new THREE.MeshStandardMaterial({ map, emissiveMap: map, alphaTest: 0.5, roughness: 1, color: 0x6a745c }); mat.userData.ambC = new THREE.Color(0.26, 0.3, 0.22);
      mat.onBeforeCompile = (sh) => { sh.uniforms.uT = sway; sh.uniforms.uW = wind; sh.vertexShader = 'uniform float uT, uW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float bend = uv.y * uv.y * uW; transformed.x += sin(uT * 1.1 + position.x * 0.31 + position.z * 0.17) * 0.22 * bend; transformed.z += cos(uT * 0.8 + position.x * 0.23) * 0.12 * bend;'); }; return mat; };
    const S = [0, 1].map((k) => ({ mat: make(T ? T.v[k] : null), pos: [], uv: [], nor: [], idx: [] })), asp = T ? T.w / T.h : 0.9;
    return { ok: !!T, add(x, y, z, h, rot) { const w = h * asp / 2; S.forEach((q, k) => { const a = rot + k * Math.PI / 2, c = Math.cos(a) * w, s = Math.sin(a) * w, n = q.pos.length / 3; q.pos.push(x - c, y, z - s, x + c, y, z + s, x + c, y + h, z + s, x - c, y + h, z - s); q.uv.push(0, 0, 1, 0, 1, 1, 0, 1); q.nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0); q.idx.push(n, n + 1, n + 2, n, n + 2, n + 3, n, n + 2, n + 1, n, n + 3, n + 2); }); },
      done() { for (const q of S) { if (!q.pos.length) continue; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(q.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(q.uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(q.nor, 3)); g.setIndex(q.idx); const m = new THREE.Mesh(g, q.mat); m.frustumCulled = false; group.add(m); } } };
  };
  const KIND = ['island_tree_01', 'island_tree_02', 'tree_small_02', 'jacaranda_tree', 'island_tree_03'].map(cards), shrub = cards('shrub_02'), pick = (r) => KIND[Math.floor(r * KIND.length) % KIND.length];
  for (const h of street.houses) { const s = h.far ? 1 : -1, front = h.z + s * h.d / 2, r = hsh(h.x, h.far ? 3 : 4), tx = h.x + (h.i % 2 ? 2.6 : -2.8), tz = front + s * (3.2 + r * 1.5);
    if (Math.abs(tx) > 4.5 || h.far) { pick(r * 7.3).add(tx, -0.15, tz, 6 + r * 3, r * 3); casters.push([tx, tz, 3.6, 3.6, 5, 1]); solids.push([tx - 0.25, tz - 0.25, tx + 0.25, tz + 0.25]); }
    pick(r * 3.1 + 0.4).add(h.x + (r - 0.5) * 6, -0.15, h.z - s * (h.d / 2 + 4 + r * 3), 8 + r * 4, r * 5);
    for (let k = 0; k < 3; k++) shrub.add(h.x - (h.i % 2 ? -1 : 1) * (0.6 + k * 1.5) - 1, -0.05, front + s * 0.75, 0.75 + hsh(h.x, k) * 0.35, k); }
  for (let i = 0; i < (low ? 60 : 190); i++) { const a = hsh(i, 1) * 6.283, r = 52 + hsh(i, 2) ** 0.8 * 200, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(z - ROADZ) < 9) continue; pick(hsh(i, 3)).add(x, hgt(x, z) - 0.3, z, 7 + hsh(i, 4) * 7, hsh(i, 5) * 3); }
  for (const k of KIND) k.done(); shrub.done();

  // the sky's own light on everything out of doors: each surface glows a little by its own colour, more by day, so a wall in shade is still a wall
  const amb = new Set();
  const take = (m) => { if (!m || m.isMeshBasicMaterial || m.isLineBasicMaterial || m.isSpriteMaterial || m.isPointsMaterial || m.isShaderMaterial || !m.emissive || m === SM.win) return; if (m.map && !m.emissiveMap) { m.emissiveMap = m.map; m.needsUpdate = true; } if (!(m.userData.ambC && m.userData.ambC.isColor)) m.userData.ambC = typeof m.userData.ambC === 'number' ? new THREE.Color(m.userData.ambC) : m.map ? new THREE.Color(1, 1, 1) : m.color.clone(); amb.add(m); };
  const own = new Map(), mine = (o) => { if (!o.isMesh || !o.material || o.material.isMeshBasicMaterial) return; if (o.userData.amb) { o.material.userData.ambC = new THREE.Color(o.userData.amb); } else if (!o.userData.outC && o.parent && o.parent !== group && o.parent !== street.group) { let c = own.get(o.material); if (!c) { c = o.material.clone(); own.set(o.material, c); } o.material = c; o.userData.outC = true; } take(o.material); };
  street.group.traverse(mine); group.traverse(mine); if (garage.out) garage.out.traverse(mine);
  for (const k of ['grass', 'drive', 'fence']) take(garage.M[k]);
  for (const m of [SM.road, SM.pave, SM.grass, garage.M.grass, garage.M.drive, M.drive]) { m.roughnessMap = null; m.roughness = 0.96; m.needsUpdate = true; }
  SM.pave.color.setHex(0xffffff); SM.road.color.setHex(0x6c6e72); SM.road.userData.ambC = new THREE.Color(0.7, 0.7, 0.72);
  for (const m of [SM.grass, garage.M.grass]) { m.color.setHex(0x8fb26a); m.userData.ambC = new THREE.Color(0.55, 0.75, 0.42); }

  // the shadows the sun lays: each thing's outline pushed along the ground away from the sun, redrawn as the sun moves
  casters.push([0, (ROOM.z0 + ROOM.z1) / 2, ROOM.x1 - ROOM.x0 + 0.5, ROOM.z1 - ROOM.z0 + 0.5, 2.95]);
  const SV = casters.length * 42, spos = new Float32Array(SV * 3), sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(spos, 3).setUsage(THREE.DynamicDrawUsage));
  const shadeM = new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true, opacity: 0.4, depthWrite: false, fog: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const shade = new THREE.Mesh(sg, shadeM); shade.frustumCulled = false; shade.renderOrder = 1; group.add(shade);
  let lastS = new THREE.Vector3();
  const lay = (sun) => {
    const k = Math.min(9, 1 / Math.max(0.08, Math.tan(Math.asin(Math.max(0.02, sun.y))))), L = Math.hypot(sun.x, sun.z) || 1, ox = -sun.x / L * k, oz = -sun.z / L * k; let n = 0;
    for (const c of casters) { const [x, z, w, d, h] = c;
      const pts = [], ring = c[5] ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [Math.cos(i * 0.785) * 1.1, Math.sin(i * 0.785) * 1.1]) : [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (const [a, b] of ring) { if (c[5]) pts.push([x + a * w / 2 + ox * h * 0.55, z + b * d / 2 + oz * h * 0.55]); else pts.push([x + a * w / 2, z + b * d / 2]); pts.push([x + a * w / 2 + ox * h, z + b * d / 2 + oz * h]); }
      pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
      for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      const hull = lo.slice(0, -1).concat(up.slice(0, -1));
      for (let i = 1; i < hull.length - 1 && i <= 14; i++) for (const p of [hull[0], hull[i + 1], hull[i]]) { spos[n++] = p[0]; spos[n++] = 0.05; spos[n++] = p[1]; }
    }
    sg.setDrawRange(0, n / 3); sg.attributes.position.needsUpdate = true;
  };
  // birds crossing the sky by day, and smoke from one chimney
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0, 0, 0.12, 0, 0, -0.12, 0.5, 0, 0, 0, 0, 0.12, 0, 0, -0.12], 3));
  const birdM = new THREE.MeshBasicMaterial({ color: 0x14161a, side: THREE.DoubleSide, fog: true }), birds = [];
  for (let i = 0; i < (low ? 3 : 9); i++) { const m = new THREE.Mesh(bg.clone(), birdM); m.frustumCulled = false; group.add(m); birds.push({ m, r: 30 + hsh(i, 8) * 60, h: 14 + hsh(i, 9) * 22, sp: (0.08 + hsh(i, 10) * 0.08) * (i % 2 ? 1 : -1), ph: hsh(i, 11) * 6.28, cx: (hsh(i, 12) - 0.5) * 60, cz: ROADZ - 10 + (hsh(i, 13) - 0.5) * 40 }); }
  const NS = 18, sp = new Float32Array(NS * 3), smg = new THREE.BufferGeometry(); smg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const puff = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  const smoke = new THREE.Points(smg, new THREE.PointsMaterial({ map: puff, size: 2.2, color: 0xb9bcc0, transparent: true, opacity: 0.35, depthWrite: false, sizeAttenuation: true })); smoke.frustumCulled = false; group.add(smoke);
  const sh = street.houses.find((h) => h.far && h.x === 6) || street.houses[0], sx = sh.x + (sh.i % 2 ? 2.4 : -2.6);
  const tc = new THREE.Color();

  return { group, amb, cars,
    // sun: the way to it; day 0..1; dim: how much of the sun the cloud lets through; wx: the weather
    update(dt, time, sun, day, dim, wx) {
      sway.value = time; wind.value = 0.25 + 0.9 * wx.cloud;
      const k = 0.03 + 0.3 * day * (0.55 + 0.45 * dim);
      for (const m of amb) m.emissive.copy(tc.copy(m.userData.ambC).multiplyScalar(k * (m.map ? 1 : 0.8)));
      const lit = sun.y > 0.03 ? ss(0.03, 0.2, sun.y) * dim : 0; shadeM.opacity = 0.42 * lit; shade.visible = lit > 0.02;
      if (shade.visible && lastS.distanceToSquared(sun) > 0.0004) { lastS.copy(sun); lay(sun); }
      for (const b of birds) { const a = b.ph + time * b.sp, m = b.m, p = m.geometry.attributes.position, f = Math.sin(time * 9 + b.ph) * 0.28; m.position.set(b.cx + Math.cos(a) * b.r, b.h + Math.sin(a * 3) * 1.5, b.cz + Math.sin(a) * b.r); m.rotation.y = -a + (b.sp > 0 ? 0 : Math.PI); p.setY(0, f); p.setY(3, f); p.needsUpdate = true; m.visible = day > 0.3 && wx.rain < 0.3; }
      for (let i = 0; i < NS; i++) { const t = (time * 0.07 + i / NS) % 1; sp[i * 3] = sx + t * t * (6 + 10 * wind.value) + Math.sin(i * 3.1 + time * 0.3) * 0.3 * t; sp[i * 3 + 1] = sh.h + 2.3 + t * 7; sp[i * 3 + 2] = sh.z + Math.cos(i * 2.3) * 0.4 * t; }
      smg.attributes.position.needsUpdate = true; smoke.material.opacity = 0.1 + 0.25 * day;
    } };
}
