// SKIRMISH TABLE's three worlds' own things, built for land.js from a map's data: giant and small fungus, crystal, stalagmites, basalt columns, steam, what falls or rises in the air (snow, ash, embers, spores) and the props that say what happened there; each the size scale.js gives it; nothing in it flickers
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SIZES } from './scale.js';

const lathe = (pts, seg) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
const paint = (g, r, gr, b) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([r, gr, b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const at = (pts, r) => { for (let i = 1; i < pts.length; i++) if (r <= pts[i][0]) { const a = pts[i - 1], b = pts[i], t = (r - a[0]) / (b[0] - a[0] || 1); return a[1] + (b[1] - a[1]) * t; } return pts[pts.length - 1][1]; };

let DOT = null;
function dot() {   // a small soft disc: a flake, an ember, a spore
  if (DOT) return DOT;
  const N = 32, d = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const r = Math.hypot(x - 15.5, y - 15.5) / 15.5, a = Math.max(0, 1 - r); d.set([255, 255, 255, Math.round(255 * Math.min(1, a * a * 2.4))], (y * N + x) * 4); }
  DOT = new THREE.DataTexture(d, N, N); DOT.magFilter = DOT.minFilter = THREE.LinearFilter; DOT.needsUpdate = true; return DOT;
}

// a giant fungus as a tree is (land.js sets it out, sways it and cuts it down when it hides a piece): stem, cap (its width is the crown's), and what glows: the gills beneath and the spots on top
function fungus({ stem, cap, gill, tint, glow, spots }) {
  const K = 8, scene = new THREE.Group();   // eight units tall, so the wind's sway (by height squared) reaches it
  const sg = lathe(stem, 8), sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) sp.setX(i, sp.getX(i) + 0.045 * Math.sin(sp.getY(i) * 4.4));
  const cg = lathe([...cap].reverse(), 14), parts = [lathe(gill, 14).toNonIndexed()];
  for (let i = 0; i < spots; i++) { const a = i * 2.4 + 0.5, r = 0.1 + 0.3 * ((i * 0.618) % 1), s = new THREE.IcosahedronGeometry(0.026 + 0.022 * ((i * 0.37) % 1), 0); s.scale(1, 0.45, 1); s.translate(Math.cos(a) * r, at(cap, r) + 0.004, Math.sin(a) * r); parts.push(s); }
  for (const g of parts) for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
  const gg = mergeGeometries(parts);
  for (const g of [sg, cg, gg]) { g.scale(K, K, K); g.computeVertexNormals(); }
  scene.add(new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xb9c8c0, roughness: 0.8, emissive: tint, emissiveIntensity: 0.12 })));
  scene.add(new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: tint, roughness: 0.5, emissive: tint, emissiveIntensity: 0.55, alphaTest: 0.01 })));
  scene.add(new THREE.Mesh(gg, new THREE.MeshBasicMaterial({ color: new THREE.Color(glow).multiplyScalar(0.62), side: THREE.DoubleSide })));
  return { scene };
}
export const GROWN = {
  fungus: () => fungus({ stem: [[0.085, 0], [0.06, 0.06], [0.045, 0.3], [0.04, 0.62], [0.055, 0.68]], cap: [[0, 1], [0.14, 0.985], [0.28, 0.94], [0.4, 0.86], [0.48, 0.75], [0.5, 0.66], [0.47, 0.62]], gill: [[0.47, 0.625], [0.05, 0.69]], tint: 0x1c7a80, glow: 0x7ffff0, spots: 9 }),
  puffcap: () => fungus({ stem: [[0.17, 0], [0.13, 0.08], [0.11, 0.3], [0.12, 0.42]], cap: [[0, 1], [0.2, 0.97], [0.36, 0.88], [0.46, 0.74], [0.5, 0.58], [0.46, 0.44], [0.34, 0.38]], gill: [[0.34, 0.385], [0.11, 0.43]], tint: 0x5a3a9a, glow: 0xdca0ff, spots: 12 }),
};

export function makeWorld(c) {
  const { map, look, group, R, m, span, sample, letter, cols, rows, B, U, fx, tex } = c;
  const notes = c.built.world = {}, note = (k, v) => { (notes[k] || (notes[k] = [])).push(v); return v; };
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V3 = new THREE.Vector3(), SC = new THREE.Vector3(), C = new THREE.Color();
  const fall = [], halos = [];
  let shrooms = null, steam = null;
  // one mesh for many of a thing: each [x, z (tile space), lift, width, height, turn, lean x, lean z, colour]
  const many = (geo, mat, list, cast = true) => {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((t, i) => { Q.setFromEuler(E.set(t[6] || 0, t[5] || 0, t[7] || 0, 'YXZ')); im.setMatrixAt(i, M4.compose(V3.set(t[0] - cols / 2, sample(t[0], t[1]).h + t[2], t[1] - rows / 2), Q, SC.set(t[3], t[4], t[3]))); if (t[8] != null) im.setColorAt(i, C.set(t[8])); });
    im.castShadow = cast; im.receiveShadow = cast; im.frustumCulled = false; im.raycast = () => {}; group.add(im); return im;
  };
  const tiles = g => { const a = []; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (letter(x, y) === g) a.push([x, y]); return a; };
  const side = () => { const x = R() < 0.5 ? -B + 0.2 + R() * (B - 0.5) : cols + 0.3 + R() * (B - 0.5); return [x, -B + 0.3 + R() * (rows + 2 * B - 0.6)]; };   // a place at one of the two sides, before neither seat

  // ---- crystal: a cluster on each crystal tile, shards along the walls and in the carts
  const crystals = [], HUE = [0x9a5cff, 0xc86cff, 0x7a6cff, 0x62d8ff];
  const cluster = (x, z, tall, lift = 0) => {
    const w = span(SIZES.crystal.wide); crystals.push([x, z, lift - 0.05, w, tall, R() * 6.28, (R() - 0.5) * 0.16, (R() - 0.5) * 0.16, HUE[Math.floor(R() * 3)]]);
    for (let n = 0, k = 5 + Math.floor(R() * 3); n < k; n++) { const a = n / k * 6.28 + R(), d = w * (0.55 + R() * 0.5), t = tall * (0.3 + R() * 0.4); crystals.push([x + Math.cos(a) * d, z + Math.sin(a) * d, lift - 0.05, w * (0.4 + R() * 0.3), t, R() * 6.28, Math.sin(a) * 0.5, -Math.cos(a) * 0.5, HUE[Math.floor(R() * 4)]]); }
  };
  for (const [x, y] of tiles('c')) cluster(x + 0.5, y + 0.5, note('crystal', span(SIZES.crystal.tall)));
  for (let n = 0; n < (look.shards || 0); n++) { const [x, z] = side(), t = span(SIZES.crystal.shard); crystals.push([x, z, -0.03, t * 0.3, t, R() * 6.28, (R() - 0.5) * 0.9, (R() - 0.5) * 0.9, HUE[Math.floor(R() * 4)]]); }

  // ---- rock as this world has it: stalagmites, or six-sided columns of basalt
  const spikes = [], columns = [];
  if (look.rock === 'stalagmite') {
    for (const [x, y] of tiles('r')) { const tall = note('stalagmite', span(SIZES.stalagmite.tall)), w = span(SIZES.stalagmite.wide); spikes.push([x + 0.5, y + 0.5, -0.06, w, tall, R() * 6.28, 0, 0]);
      for (let n = 0; n < 5; n++) { const a = n * 1.26 + R(), t = span(SIZES.stalagmite.small); spikes.push([x + 0.5 + Math.cos(a) * 0.33, y + 0.5 + Math.sin(a) * 0.33, -0.04, t * 0.3, t, R() * 6.28, 0, 0]); } }
    for (let n = 0; n < 70; n++) { const [x, z] = side(), t = span(SIZES.stalagmite.small) * (1 + R() * 1.6); spikes.push([x, z, -0.05, t * 0.28, t, R() * 6.28, (R() - 0.5) * 0.12, (R() - 0.5) * 0.12]); }
  }
  if (look.rock === 'basalt') {
    const w = m(SIZES.column.wide), shadeOf = () => C.setScalar(0.72 + R() * 0.4).getHex();
    for (const [x, y] of tiles('r')) { const tall = note('column', span(SIZES.column.tall)), a0 = R();
      columns.push([x + 0.5, y + 0.5, -0.1, w, tall + 0.1, a0, 0, 0, shadeOf()]);
      for (let n = 0; n < 6; n++) { const a = a0 + n * 1.047; columns.push([x + 0.5 + Math.sin(a) * w * 0.87, y + 0.5 + Math.cos(a) * w * 0.87, -0.1, w, tall * (0.45 + R() * 0.5) + 0.1, a0, 0, 0, shadeOf()]); }
      for (let n = 0; n < 4; n++) { const a = a0 + 0.52 + Math.floor(R() * 6) * 1.047; columns.push([x + 0.5 + Math.sin(a) * w * 1.5, y + 0.5 + Math.cos(a) * w * 1.5, -0.1, w, tall * (0.1 + R() * 0.2) + 0.1, a0, 0, 0, shadeOf()]); } }
    for (let n = 0; n < 16; n++) { const [x, z] = side(), a0 = R(), tall = span(SIZES.column.tall) * (0.5 + R());
      for (let k = 0; k < 5; k++) { const a = a0 + k * 1.047; columns.push([x + (k ? Math.sin(a) * w * 0.87 : 0), z + (k ? Math.cos(a) * w * 0.87 : 0), -0.2, w, tall * (k ? 0.4 + R() * 0.5 : 1) + 0.2, a0, 0, 0, shadeOf()]); } }
  }

  // ---- props: wood, stone, bone, iron and cloth, each kind merged into one mesh
  const wood = [], stone = [], bone = [], metal = [], glass = [], cloth = [];
  const put = (list, g, x, y, z, ry = 0, rx = 0, rz = 0) => { if (g.index) g = g.toNonIndexed(); for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv' && !(list === cloth && k === 'color')) g.deleteAttribute(k); g.applyMatrix4(M4.compose(V3.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz, 'YXZ')), SC.set(1, 1, 1))); list.push(g); };
  const box = (w, h, d) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, k = Math.max(w, h, d) * 0.9; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return g; };
  const rod = (r0, r1, h, n = 6) => new THREE.CylinderGeometry(r1, r0, h, n);
  const crate = (lx, gy, lz, s, r, tip = 0) => put(wood, box(s, s, s), lx, gy + s / 2 - 0.02 + (tip ? s * 0.12 : 0), lz, r, tip, 0);
  for (const p of map.props || []) {
    const lx = p.x - cols / 2, lz = p.y - rows / 2, gy = sample(p.x, p.y).h, r = p.r || 0, cs = Math.cos(r), sn = Math.sin(r), rel = (u, v) => [lx + u * cs + v * sn, lz - u * sn + v * cs];
    if (p.k === 'glow') c.lamp(lx, gy + (p.h || 1), lz, p.c, p.s);
    else if (p.k === 'lantern') {   // a post, an arm, a lamp of glass that glows steadily
      const tall = note('lantern', m(SIZES.lantern.tall)), gl = m(SIZES.lantern.glass);
      put(wood, rod(0.035, 0.026, tall + 0.1), lx, gy + tall / 2 - 0.05, lz); put(wood, box(0.34, 0.03, 0.03), lx + 0.13, gy + tall - 0.03, lz);
      put(metal, box(gl * 1.15, 0.02, gl * 1.15), lx + 0.26, gy + tall - 0.11, lz); put(metal, box(gl * 1.15, 0.02, gl * 1.15), lx + 0.26, gy + tall - 0.13 - gl * 1.2, lz); put(metal, rod(0.006, 0.006, 0.09, 4), lx + 0.26, gy + tall - 0.07, lz);
      put(glass, box(gl, gl * 1.2, gl), lx + 0.26, gy + tall - 0.12 - gl * 0.6, lz);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fx.tex.circle_05, color: 0xffa850, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.85); s.position.set(lx + 0.26, gy + tall - 0.12 - gl * 0.6, lz); s.raycast = () => {}; s.renderOrder = 6; group.add(s); halos.push(s);
    } else if (p.k === 'cart') {   // an ore cart on a length of rail, loaded with crystal
      const L = m(SIZES.cart.long), W = m(SIZES.cart.wide), T = m(SIZES.cart.tall), wr = T * 0.2, by = gy + wr * 1.5, bh = T - wr * 1.5;
      for (const v of [-0.5, 0.5]) { let [x, z] = rel(0, v * W); put(wood, box(L, bh, 0.04), x, by + bh / 2, z, r, 0, v * 0.24); [x, z] = rel(v * L, 0); put(wood, box(0.04, bh, W * 0.84), x, by + bh / 2, z, r, 0, 0); }
      put(wood, box(L, 0.04, W * 0.8), lx, by, lz, r);
      for (const u of [-0.32, 0.32]) { for (const v of [-0.46, 0.46]) { const [x, z] = rel(u * L, v * W); put(metal, rod(wr, wr, 0.05, 10), x, gy + wr, z, r, Math.PI / 2, 0); } const [x, z] = rel(u * L, 0); put(metal, rod(0.02, 0.02, W, 5), x, gy + wr, z, r, Math.PI / 2, 0); }
      for (const v of [-0.46, 0.46]) { const [x, z] = rel(0.2 * L, v * W); put(metal, box(L * 2.1, 0.035, 0.03), x, gy + 0.012, z, r); }
      for (let n = -3; n <= 4; n++) { const [x, z] = rel(n * L * 0.27 + 0.2 * L, 0); put(wood, box(0.09, 0.03, W * 1.25), x, gy - 0.005, z, r + (R() - 0.5) * 0.1); }
      for (let n = 0; n < 6; n++) { const [x, z] = rel((R() - 0.5) * L * 0.7, (R() - 0.5) * W * 0.5), t = span(SIZES.crystal.shard) * 0.8; crystals.push([x + cols / 2, z + rows / 2, T * 0.72, t * 0.34, t, R() * 6.28, (R() - 0.5) * 1.1, (R() - 0.5) * 1.1, HUE[Math.floor(R() * 4)]]); }
      note('cart', T);
    } else if (p.k === 'crates') {
      const s0 = note('crate', span(SIZES.crate)), s1 = span(SIZES.crate), s2 = span(SIZES.crate) * 0.85;
      crate(lx, gy, lz, s0, r); let [x, z] = rel(s0 * 0.5 + s1 * 0.62, 0.08); crate(x, sample(x + cols / 2, z + rows / 2).h, z, s1, r + 0.4);
      crate(lx + 0.03, gy + s0, lz - 0.02, s2, r + 0.7); [x, z] = rel(-s0 * 1.2, s0 * 0.6); crate(x, sample(x + cols / 2, z + rows / 2).h, z, s2, r + 1.9, 0.5);
    } else if (p.k === 'bones') {   // what is left of something big: a spine, its ribs standing, a horned skull
      const k = p.s || 1, tall = note('rib', m(SIZES.rib) * k), Rr = tall / 1.77, len = tall * 2.1, tube = 0.03 * k + 0.012, by = Math.max(gy, -0.06) - gy;   // in a lake or in lava it lies at the sheet's level
      put(bone, rod(tube * 1.6, tube * 0.8, len, 6), lx, gy + by + tube, lz, r, Math.PI / 2, 0);
      for (let n = 0; n < 6; n++) { const f = n / 5, kk = 0.62 + 0.38 * Math.sin(f * 2.6 + 0.45), [x, z] = rel(0, (f - 0.45) * len * 0.8);
        for (const sd of [0, Math.PI]) { if (n === 4 && sd) continue;   // one has fallen
          const g = new THREE.TorusGeometry(Rr * kk, tube, 5, 9, 2.35); g.rotateZ(-Math.PI / 2); g.translate(0, Rr * kk, 0); put(bone, g, x, gy + by - 0.03, z, r + sd, 0, 0); } }
      { const [x, z] = rel(0, -len * 0.62), g = new THREE.SphereGeometry(0.2 * k + 0.06, 7, 5); g.scale(0.85, 0.72, 1.45); put(bone, g, x, gy + by + 0.1 * k + 0.03, z, r, -0.15, 0);
        for (const sd of [-1, 1]) { const [hx, hz] = rel(sd * (0.17 * k + 0.05), -len * 0.56); put(bone, new THREE.ConeGeometry(0.045 * k + 0.012, 0.5 * k + 0.1, 6), hx, gy + by + 0.3 * k + 0.08, hz, r, -0.5, -sd * 0.7); } }
      { const [x, z] = rel(Rr * 0.9, len * 0.28), g = new THREE.TorusGeometry(Rr * 0.9, tube, 5, 9, 2.35); put(bone, g, x, gy + by + tube, z, r + 0.6, Math.PI / 2, 0); }
    } else if (p.k === 'pillar') {   // a fluted column of something older: standing broken, or fallen in its drums
      const W = m(SIZES.pillar.wide), T = m(SIZES.pillar.tall);
      if (p.down) { let v = -T * 0.42; for (let n = 0; n < 3; n++) { const l = T * (0.2 + R() * 0.1), [x, z] = rel((R() - 0.5) * 0.12, v + l / 2); put(stone, rod(W * 0.45, W * 0.45, l, 10), x, sample(x + cols / 2, z + rows / 2).h + W * 0.32, z, r + (R() - 0.5) * 0.3, Math.PI / 2 + (R() - 0.5) * 0.1, 0); v += l + 0.1 + R() * 0.12; } }
      else { const f = 0.55 + R() * 0.3; note('pillar', T * f + 0.16); put(stone, box(W * 1.35, 0.2, W * 1.35), lx, gy + 0.06, lz, r); put(stone, rod(W * 0.5, W * 0.44, T * f, 10), lx, gy + 0.16 + T * f / 2, lz, r);
        put(stone, rod(W * 0.44, W * 0.42, T * 0.16, 10), lx + 0.03, gy + 0.16 + T * f + T * 0.06, lz, r, 0.16, 0.1); }
    } else if (p.k === 'banner') {   // a marker pole, its cloth torn and streaming downwind
      const T = note('banner', m(SIZES.banner.tall)), len = span(SIZES.banner.cloth), drop = len * 0.5 + 0.12;
      put(wood, rod(0.03, 0.02, T + 0.1), lx, gy + T / 2 - 0.05, lz);
      const g = new THREE.PlaneGeometry(len, drop, 7, 4), q = g.attributes.position, col = new Float32Array(q.count * 3), base = C.set(p.c || (look.hour === 'ember' ? 0x4a1c16 : 0x8a2c26));
      for (let i = 0; i < q.count; i++) { const u = q.getX(i) / len + 0.5, v = q.getY(i) / drop + 0.5; q.setX(i, (u - (u > 0.8 ? R() * 0.2 : 0)) * len); q.setY(i, q.getY(i) - u * u * drop * 0.25 + (v < 0.1 ? R() * drop * 0.3 * u : 0)); const k = (Math.abs(v - 0.5) < 0.12 ? 1.9 : 1) * (0.8 + R() * 0.2); col.set([base.r * k, base.g * k, base.b * k], i * 3); }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.attributes.uv.array.forEach((_, i, a) => { if (i % 2 === 0) a[i] = q.getX(i / 2) / len; });
      put(cloth, g, lx + 0.02, gy + T - drop / 2 - 0.04, lz);
    } else if (p.k === 'sledge') {   // a sledge left where it stopped, its load half off
      const L = note('sledge', m(SIZES.sledge.long)), W = m(SIZES.sledge.wide);
      for (const v of [-0.5, 0.5]) { let [x, z] = rel(0, v * W); put(wood, box(L, 0.05, 0.05), x, gy + 0.05, z, r); [x, z] = rel(L * 0.55, v * W); put(wood, box(L * 0.2, 0.05, 0.05), x, gy + 0.12, z, r, 0, 0.75);
        for (const u of [-0.3, 0.05, 0.35]) { [x, z] = rel(u * L, v * W); put(wood, box(0.04, 0.2, 0.04), x, gy + 0.16, z, r); } }
      for (let n = 0; n < 5; n++) { const [x, z] = rel(0, (n / 4 - 0.5) * W * 0.9); put(wood, box(L * 0.86, 0.025, W * 0.19), x, gy + 0.27 + (n % 2) * 0.004, z, r + (R() - 0.5) * 0.03); }
      { const s = span(SIZES.crate); let [x, z] = rel(-L * 0.18, 0); crate(x, gy + 0.3, z, s, r + 0.1); [x, z] = rel(L * 0.2, 0.04); put(wood, rod(0.13, 0.13, W * 0.9, 9), x, gy + 0.42, z, r, Math.PI / 2, 0); [x, z] = rel(L * 0.05, W * 1.05); crate(x, sample(x + cols / 2, z + rows / 2).h, z, s * 0.9, r + 0.9, 0.45); }
    } else if (p.k === 'cairn') {   // stones stacked to mark the way
      const T = note('cairn', m(SIZES.cairn)); let lift = 0;
      for (const [f, i] of [[0.48, 0], [0.38, 1], [0.3, 4], [0.22, 6], [0.15, 7]]) { c.rocks.push([p.x + (R() - 0.5) * 0.04, p.y + (R() - 0.5) * 0.04, T * f, T * f * 0.62, i, lift]); lift += T * f * 0.52; }
    }
  }
  const merged = (list, mat) => { if (!list.length) return null; const mesh = c.still(new THREE.Mesh(mergeGeometries(list), mat)); return mesh; };
  merged(wood, c.dress(new THREE.MeshStandardMaterial({ map: tex('planks_d', true), normalMap: tex('planks_n'), color: look.hour === 'ember' ? 0x4a3e38 : 0x9a846c, roughness: 0.9 }), c.capOnly, 'prop')); merged(metal, c.iron);
  merged(stone, c.dress(new THREE.MeshStandardMaterial({ map: tex('wall_d', true), normalMap: tex('wall_n'), roughness: 0.95, color: 0xc8c4bc }), look.stone, 'pillar'));
  merged(bone, c.dress(new THREE.MeshStandardMaterial({ color: 0xd6ccb0, roughness: 0.82 }), c.capOnly, 'bone'));
  { const g = merged(glass, new THREE.MeshBasicMaterial({ color: 0xd98a3a })); if (g) g.castShadow = false; }
  if (cloth.length) { const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.92 });
    mat.onBeforeCompile = s => { Object.assign(s.uniforms, { uTime: U.uTime, uWind: U.uWind });
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime; uniform vec2 uWind;').replace('#include <begin_vertex>', `#include <begin_vertex>
        { float w = uv.x, ph = position.z * 3.1 + position.x * 5.;
          transformed.z += (sin(uTime * 2.3 - ph) * .07 + sin(uTime * 1.1 - ph * .6) * .05) * w * length(uWind);
          transformed.y += sin(uTime * 1.9 - ph + 1.) * .03 * w * w * length(uWind); }`); };
    mat.customProgramCacheKey = () => 'chess-cloth'; merged(cloth, c.dress(mat, null, 'cloth')); }

  { const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, flatShading: true });   // crystal glows with its own colour
    mat.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * .8;'); }; mat.customProgramCacheKey = () => 'chess-crystal';
    many(lathe([[0.5, 0], [0.5, 0.78], [0, 1]], 6), mat, crystals, false); }
  if (spikes.length) { const g = lathe([[0.5, 0], [0.43, 0.1], [0.31, 0.32], [0.21, 0.58], [0.1, 0.84], [0, 1]], 7), q = g.attributes.position;
    for (let i = 0; i < q.count; i++) { const a = Math.atan2(q.getZ(i), q.getX(i)), k = 1 + 0.16 * Math.sin(a * 3 + q.getY(i) * 9) * (1 - q.getY(i)); q.setX(i, q.getX(i) * k); q.setZ(i, q.getZ(i) * k); } g.computeVertexNormals();
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * 2);
    many(g, c.dress(new THREE.MeshStandardMaterial({ map: tex('rock_d', true), normalMap: tex('rock_n'), color: 0x8890a6, roughness: 0.55 }), null, 'spike'), spikes); }
  if (columns.length) { const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 6); g.translate(0, 0.5, 0);
    many(g, c.dress(new THREE.MeshStandardMaterial({ map: tex(look.tex.rock + '_d', true), color: 0x565458, roughness: 0.8, flatShading: true }), look.stone && look.stone.cap ? { cap: look.stone.cap } : null, 'column'), columns); }

  // ---- small fungus, in clusters by the groves, the water and the walls
  if (look.shrooms) {
    const st = paint(rod(0.16, 0.11, 0.62, 5).toNonIndexed().translate(0, 0.31, 0), 0.3, 0.34, 0.34), cp = paint(lathe([[0.4, 0.6], [0.5, 0.72], [0.3, 0.93], [0, 1]], 6).toNonIndexed(), 1, 1, 1);
    for (const g of [st, cp]) g.deleteAttribute('uv');
    const list = [], GL = [0x2fc8a4, 0x24b094, 0x48c8c0, 0x3c90c8, 0x9460c8];
    for (let tries = 0; tries < 900 && list.length < look.shrooms; tries++) {
      const x = -B + 0.2 + R() * (cols + 2 * B - 0.4), z = -B + 0.2 + R() * (rows + 2 * B - 0.4), s = sample(x, z), w = s.w;
      if (s.h < -0.04 || !(w[1] > 0.3 || (w[3] > 0.06 && w[3] < 0.4) || (s.out > 0.25 && s.out < 1.4) || R() < 0.05)) continue;
      const hue = GL[Math.floor(R() * (w[2] > 0.4 ? 5 : 4))];
      for (let n = 0, k = 4 + Math.floor(R() * 9); n < k; n++) { const a = R() * 6.28, d = R() * 0.3, t = span(SIZES.shroom); list.push([x + Math.cos(a) * d, z + Math.sin(a) * d, -0.01, t * (0.7 + R() * 0.5), t, R() * 6.28, (R() - 0.5) * 0.4, (R() - 0.5) * 0.4, hue]); }
    }
    shrooms = many(mergeGeometries([st, cp]), new THREE.MeshBasicMaterial({ vertexColors: true }), list, false); note('shroom', m(SIZES.shroom[1]));
  }

  // ---- steam over each vent: two crossed sheets of slow rising vapour, and a ring of stones to know it by
  const vents = tiles('v');
  if (vents.length) {
    const parts = [];
    for (const [x, y] of vents) { const gy = sample(x + 0.5, y + 0.5).h, ph = R();
      for (let n = 0; n < 8; n++) c.rocks.push([x + 0.5 + Math.cos(n * 0.785 + ph) * 0.34, y + 0.5 + Math.sin(n * 0.785 + ph) * 0.34, m(0.14 + R() * 0.12), 0, 3 + n % 5]);
      for (const ry of [0.4, 1.97]) { const g = new THREE.PlaneGeometry(0.95, 2.1, 1, 5).toNonIndexed(); g.rotateY(ry + ph); g.translate(x + 0.5 - cols / 2, gy + 1.0, y + 0.5 - rows / 2); g.setAttribute('aPh', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(ph + ry), 1)); parts.push(g); } }
    steam = new THREE.Mesh(mergeGeometries(parts), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime: U.uTime, uWind: U.uWind, tNoise: { value: c.noise() }, uCol: { value: new THREE.Color(look.fog[0]).lerp(new THREE.Color(0xd8c8c0), 0.7) } },
      vertexShader: 'attribute float aPh; uniform float uTime; uniform vec2 uWind; varying vec2 vUv; varying float vPh; void main(){ vUv = uv; vPh = aPh; vec3 p = position; p.xz += uWind * .5 * uv.y * uv.y + vec2(sin(uTime * .4 + aPh * 9.), cos(uTime * .33 + aPh * 7.)) * .09 * uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }',
      fragmentShader: `uniform sampler2D tNoise; uniform float uTime; uniform vec3 uCol; varying vec2 vUv; varying float vPh;
void main(){ float n = texture2D(tNoise, vec2(vUv.x * .55 + vPh, vUv.y * .8 - uTime * .1 + vPh)).b * .6 + texture2D(tNoise, vec2(vUv.x * 1.2 - vPh, vUv.y * 1.6 - uTime * .17)).b * .4;
  float a = smoothstep(.3, .72, n + (1. - vUv.y) * .3) * smoothstep(0., .3, vUv.x) * smoothstep(1., .7, vUv.x) * smoothstep(1., .4, vUv.y) * smoothstep(0., .06, vUv.y);
  gl_FragColor = vec4(mix(vec3(1., .62, .36), uCol, smoothstep(0., .3, vUv.y)), a * .42);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
    steam.raycast = () => {}; steam.frustumCulled = false; steam.renderOrder = 4; group.add(steam);
  }

  // ---- the air: what falls or rises all over the land (snow, ash, embers, spores), moved in the shader, wrapped round its box
  for (const f of look.fall || []) {
    const n = f.n, pos = new Float32Array(n * 3), sd = new Float32Array(n), bx = cols + 2 * B, bz = rows + 2 * B;
    for (let i = 0; i < n; i++) { pos.set([(R() - 0.5) * bx, R() * f.high, (R() - 0.5) * bz], i * 3); sd[i] = R(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const mat = new THREE.PointsMaterial({ map: dot(), color: f.c, size: f.size, transparent: true, opacity: f.glow ? 0.95 : 0.85, depthWrite: false, blending: f.glow ? THREE.AdditiveBlending : THREE.NormalBlending });
    mat.onBeforeCompile = s => { Object.assign(s.uniforms, { uTime: U.uTime, uVel: { value: new THREE.Vector3(...f.vel) }, uBox: { value: new THREE.Vector3(bx, f.high, bz) }, uSway: { value: f.sway } });
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime, uSway; uniform vec3 uVel, uBox; attribute float aS; varying float vA;').replace('#include <begin_vertex>', `vec3 transformed = position + uVel * uTime * (.6 + .8 * aS);
        transformed.x += sin(uTime * .5 + aS * 40.) * uSway; transformed.z += cos(uTime * .37 + aS * 23.) * uSway;
        transformed = mod(transformed + uBox * vec3(.5, 0., .5), uBox) - uBox * vec3(.5, 0., .5);
        { vec3 q = abs(transformed) / (uBox * .5); float yy = transformed.y / uBox.y; vA = smoothstep(0., .08, yy) * smoothstep(1., .8, yy) * smoothstep(1., .9, q.x) * smoothstep(1., .9, q.z); }`);
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vA;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vA;'); };
    mat.customProgramCacheKey = () => 'chess-fall';
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.raycast = () => {}; pts.renderOrder = 5; pts.userData = { n, size: f.size }; group.add(pts); fall.push(pts);
  }

  return {
    setDetail(high, ar, eased) {
      if (shrooms) shrooms.count = Math.floor(shrooms.instanceMatrix.count * (high ? 1 : 0.45) * (ar ? 0.7 : 1));
      for (const p of fall) p.geometry.setDrawRange(0, Math.floor(p.userData.n * (high ? 1 : 0.4) * (ar ? 0.5 : 1)));
      if (steam) steam.visible = !(ar && eased > 1); for (const h of halos) h.visible = high;
    },
    update() { const e = group.matrixWorld.elements, k = Math.hypot(e[0], e[1], e[2]); for (const p of fall) p.material.size = p.userData.size * k; },   // a flake stays a flake when the table is shrunk into the room
  };
}
