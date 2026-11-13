// Halcyon Greens' garden: one stroll garden laid out on the old rules (a path that reveals, stones in odd groups, gravel raked as water, lanterns at paths and water, a bridge, a basin, bamboo at the edge)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { fbm, clamp, lerp, smoothstep } from './util.js';

const V3 = THREE.Vector3, UP = new V3(0, 1, 0);

// ------------------------------------------------------------------ the plan (metres; the tee is at z +5, the cup at z -5, the stream runs past on the right)
export const PLAN = {
  garden: { cx: 1, cz: -1.5, rx: 15.5, rz: 15 },                       // the tended ground: moss, no meadow grass
  gravel: { x0: -10.4, x1: -4.4, z0: -6.2, z1: 6.2 },                  // the dry garden, raked
  groups: [[-7.4, -2.4, [0.95, 0.62, 0.34]], [-5.9, 3.3, [0.55, 0.3]], [-8.9, 4.6, [0.4]], [-5.4, -4.9, [0.28]]],   // stone groups: [x, z, heights] (seven stones)
  forecourt: [0, 8.6, 2.5], cupcourt: [-0.4, -7.4, 1.7],              // raked gravel rounds at the start and by the cup
  path: [[0, 10.9], [-1.2, 9.4], [-2.6, 6.4], [-2.9, 2.8], [-3.2, -0.6], [-2.8, -4.4], [-1.6, -6.9], [1.4, -8.7], [4.6, -9.6], [7.2, -9.3]],
  path2: [[12.4, -8.7], [13.6, -9.6], [14.8, -10.2]],                   // over the bridge to the pavilion
  bridge: [9.8, -9.0],
  pavilion: [16.4, -10.9],
  basin: [13.4, -8.6],
  deer: [5.5, -5.0],                                                     // the shishi-odoshi on the near bank
  lanterns: [['kasuga', -2.1, 7.6, true], ['yukimi', 5.3, 1.6, true], ['oki', -2.2, -6.0, true], ['oki', 8.0, -10.6, false], ['kasuga', 12.6, -7.4, false]],
  fence: [[-3.5, 12.5], [-8, 11.2], [-12, 8.2], [-14.2, 3], [-14.6, -3], [-13, -8.4], [-9.4, -12.2], [-4.6, -13.6]],
  station: [2.5, 9.0],
  mounds: [[3.3, 2.4, 0.55], [3.9, 1.6, 0.4], [3.5, -1.8, 0.5], [4.4, -2.5, 0.35], [-1.6, 3.9, 0.38], [-1.9, 4.6, 0.3], [-4.6, -7.9, 0.5], [-3.7, -8.6, 0.38], [2.2, -9.9, 0.45], [6.4, 6.2, 0.5], [5.8, 6.9, 0.35]],
  maples: [[3.6, 11.4, 5.4], [-4.4, -10.4, 5], [11.4, -14.6, 6.2], [7.2, -12.2, 4.6]],
  pines: [[19.4, -15.6, 8.5], [10.6, -21.4, 9.5], [-11.2, 0.8, 5.2]],
};

const segDist = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
const lineDist = (x, z, pts) => { let d = 1e9; for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, z, pts[i - 1], pts[i])); return d; };
const G = PLAN.gravel;
const inGravel = (x, z, m = 0) => x > G.x0 - m && x < G.x1 + m && z > G.z0 - m && z < G.z1 + m;
export function gardenMask(x, z) { const g = PLAN.garden, d = Math.hypot((x - g.cx) / g.rx, (z - g.cz) / g.rz); return smoothstep(1.08, 0.9, d); }
// ground inside the garden is a level, softly mounded terrace
export function gardenGround(x, z, h) {
  const m = gardenMask(x, z); if (m <= 0) return h;
  let y = -0.08 + (fbm(x * 0.12 + 3, z * 0.12, 3) - 0.5) * 0.18;
  for (const [mx, mz, r] of PLAN.mounds) y += r * 0.35 * Math.max(0, 1 - Math.hypot(x - mx, z - mz) / (r * 2.6)) ** 2;
  if (inGravel(x, z, 0.4)) y = -0.12;
  return lerp(h, y, m);
}
// how far a plant or blade of grass must keep from what is built: < 0 means not here
export function gardenKeep(x, z) {
  let d = 1e9;
  if (inGravel(x, z, 0.3)) d = -1;
  for (const c of [PLAN.forecourt, PLAN.cupcourt]) d = Math.min(d, Math.hypot(x - c[0], z - c[1]) - c[2] - 0.2);
  d = Math.min(d, lineDist(x, z, PLAN.path) - 0.55, lineDist(x, z, PLAN.path2) - 0.55, Math.hypot(x - PLAN.pavilion[0], z - PLAN.pavilion[1]) - 2.4, Math.hypot(x - PLAN.basin[0], z - PLAN.basin[1]) - 0.9);
  return d;
}
export const tended = (x, z) => gardenMask(x, z) > 0.4;

// ------------------------------------------------------------------ textures drawn once
function canvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
function texFrom(c, srgb) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function bambooTex(dry) {
  return texFrom(canvas(64, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, 0);
    const a = dry ? ['#7d6a43', '#c2a86e', '#a58c58'] : ['#4f5d27', '#8c9b4a', '#6b7a35'];
    grd.addColorStop(0, a[0]); grd.addColorStop(0.45, a[1]); grd.addColorStop(1, a[2]); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${dry ? '60,45,20' : '30,40,10'},${Math.random() * 0.12})`; g.fillRect(Math.random() * w, Math.random() * h, 1, 4 + Math.random() * 20); }
    g.fillStyle = dry ? 'rgba(70,52,25,0.85)' : 'rgba(55,62,25,0.85)'; g.fillRect(0, h * 0.5 - 3, w, 6); g.fillStyle = 'rgba(255,255,230,0.25)'; g.fillRect(0, h * 0.5 + 3, w, 2);
  }), true);
}
function bambooLeaves() {
  return texFrom(canvas(256, 256, (g) => {
    for (let i = 0; i < 26; i++) {
      g.save(); g.translate(40 + Math.random() * 176, 40 + Math.random() * 176); g.rotate(Math.random() * 6.28);
      g.fillStyle = `hsl(${78 + Math.random() * 18}, ${35 + Math.random() * 20}%, ${24 + Math.random() * 16}%)`;
      g.beginPath(); g.ellipse(0, 0, 34 + Math.random() * 14, 5 + Math.random() * 2, 0, 0, 6.28); g.fill(); g.restore();
    }
  }), true);
}
function gravelTex(W, H, pxPerM, rake) {
  const c = canvas(W, H, () => { }), g = c.getContext('2d'), img = g.createImageData(W, H), nc = canvas(W, H, () => { }), ng = nc.getContext('2d'), nimg = ng.createImageData(W, H);
  const hgt = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) hgt[y * W + x] = rake(x / pxPerM, y / pxPerM) + Math.random() * 0.25;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, hv = hgt[i], s = 0.7 + Math.random() * 0.22 + hv * 0.08;
    img.data[i * 4] = 200 * s; img.data[i * 4 + 1] = 196 * s; img.data[i * 4 + 2] = 186 * s; img.data[i * 4 + 3] = 255;
    const dx = (hgt[y * W + Math.min(W - 1, x + 1)] - hgt[y * W + Math.max(0, x - 1)]) * 1.6, dy = (hgt[Math.min(H - 1, y + 1) * W + x] - hgt[Math.max(0, y - 1) * W + x]) * 1.6, l = 1 / Math.hypot(dx, dy, 1);
    nimg.data[i * 4] = (-dx * l * 0.5 + 0.5) * 255; nimg.data[i * 4 + 1] = (dy * l * 0.5 + 0.5) * 255; nimg.data[i * 4 + 2] = (l * 0.5 + 0.5) * 255; nimg.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0); ng.putImageData(nimg, 0, 0);
  const map = texFrom(c, true), normalMap = texFrom(nc, false); map.wrapS = map.wrapT = normalMap.wrapS = normalMap.wrapT = THREE.ClampToEdgeWrapping;
  return { map, normalMap };
}
function signTex(lines) {
  return texFrom(canvas(512, 256, (g, w, h) => {
    g.fillStyle = '#3b2c1f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(20,12,6,${Math.random() * 0.4})`; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w / 3, y + 6, w / 2, y - 6, w, y + 2); g.stroke(); }
    g.fillStyle = '#e9dcc0'; g.textAlign = 'center';
    lines.forEach(([t, size, y]) => { g.font = `600 ${size}px Georgia, serif`; g.fillText(t, w / 2, y); });
  }), true);
}

// ------------------------------------------------------------------ building it
export function buildGarden(ctx) {
  const { group, groundH, rnd, mats, A, updaters, glow, lower } = ctx;
  const T = mats.tex;
  const stone = new THREE.MeshStandardMaterial({ map: T.stone.map, normalMap: T.stone.normalMap, color: 0x7a7870, roughness: 0.95 });
  const darkStone = new THREE.MeshStandardMaterial({ map: T.stone.map, normalMap: T.stone.normalMap, color: 0x6e6c66, roughness: 0.92 });
  const wood = new THREE.MeshStandardMaterial({ map: A.wood.map, normalMap: A.wood.normalMap, roughnessMap: A.wood.arm, color: 0x7a6656, roughness: 1 });
  const lacquer = new THREE.MeshStandardMaterial({ map: A.wood.map, normalMap: A.wood.normalMap, color: 0xa8402c, roughness: 0.55 });
  const tile = new THREE.MeshStandardMaterial({ color: 0x34363a, roughness: 0.62, metalness: 0.1 });
  const dryBamboo = new THREE.MeshStandardMaterial({ map: bambooTex(true), roughness: 0.6 });
  const greenBamboo = new THREE.MeshStandardMaterial({ map: bambooTex(false), color: 0x9a9a7c, roughness: 0.55 });
  const paper = new THREE.MeshStandardMaterial({ color: 0xd8c8a6, emissive: 0xff9a40, emissiveIntensity: 0.55, roughness: 0.9 });
  const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.5, 2.3, 0.8) });
  const add = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; group.add(m); return m; };
  const mesh = (geo, mat, x, y, z, ry = 0, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; return add(m, cast); };
  const lights = [], flickers = [];
  const flame = (parent, x, y, z, real, size = 1) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.035 * size, 10, 8), flameMat); f.position.set(x, y, z); parent.add(f);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffb060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
    h.position.set(x, y, z); h.scale.setScalar(0.8 * size); parent.add(h);
    let L = null; if (real) { L = new THREE.PointLight(0xffa24a, 2.4, 8, 1.7); L.position.set(x, y, z); parent.add(L); lights.push(L); }
    flickers.push({ f, h, L, ph: rnd() * 10 });
  };
  updaters.push((dt, t) => { for (const F of flickers) { const k = 0.84 + 0.09 * Math.sin(t * 7.3 + F.ph) + 0.05 * Math.sin(t * 13.1 + F.ph * 2) + 0.03 * Math.sin(t * 23 + F.ph); if (F.L) F.L.intensity = 2.4 * k; F.h.material.opacity = 0.5 * k; F.f.scale.setScalar(0.9 + 0.2 * k); } });

  // ---------- the dry garden: raked gravel, its stones, a cut-stone kerb ----------
  {
    const W = G.x1 - G.x0, H = G.z1 - G.z0, ppm = 90;
    const rings = PLAN.groups.map(([x, z, hs]) => [x - G.x0, z - G.z0, 0.45 + hs[0] * 1.0]);
    const rake = (u, v) => { // straight lines along the bed, rings round each group
      for (const [x, z, r] of rings) { const d = Math.hypot(u - x, v - z); if (d < r + 0.62) return d < r ? 0 : 0.5 + 0.5 * Math.cos((d - r) * Math.PI * 2 / 0.11); }
      return 0.5 + 0.5 * Math.cos(u * Math.PI * 2 / 0.11);
    };
    const tx = gravelTex(Math.round(W * ppm), Math.round(H * ppm), ppm, rake);
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tx.map, normalMap: tx.normalMap, normalScale: new THREE.Vector2(1.4, 1.4), roughness: 1, color: 0x9e9b93 }));
    bed.position.set((G.x0 + G.x1) / 2, -0.07, (G.z0 + G.z1) / 2); bed.receiveShadow = true; group.add(bed);
    PLAN.groups.forEach(([x, z, hs], gi) => hs.forEach((h, k) => {
      const piece = A.rocks[(gi * 3 + k) % A.rocks.length], a = gi * 2.1 + k * 2.4, off = k ? 0.35 + h * 0.9 : 0;
      const px = x + Math.cos(a) * off, pz = z + Math.sin(a) * off, s = (h * 1.5) / piece.h;
      const m = new THREE.Mesh(piece.geo, piece.mat); m.position.set(px, -0.07 - h * 0.45, pz); m.scale.set(s * 0.9, s, s * 0.9); m.rotation.y = a * 1.7; add(m);
    }));
    const kerb = new THREE.BoxGeometry(0.42, 0.14, 0.2), edges = [];
    for (let x = G.x0; x < G.x1; x += 0.44) edges.push([x + 0.22, G.z0 - 0.1, 0], [x + 0.22, G.z1 + 0.1, 0]);
    for (let z = G.z0; z < G.z1; z += 0.44) edges.push([G.x0 - 0.1, z + 0.22, Math.PI / 2], [G.x1 + 0.1, z + 0.22, Math.PI / 2]);
    const im = new THREE.InstancedMesh(kerb, darkStone, edges.length), d = new THREE.Object3D();
    edges.forEach(([x, z, r], i) => { d.position.set(x, -0.08 + rnd() * 0.02, z); d.rotation.set(0, r + (rnd() - 0.5) * 0.05, 0); d.scale.set(0.95 + rnd() * 0.1, 1, 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
    im.castShadow = im.receiveShadow = true; group.add(im);
  }
  // raked rounds of gravel at the start and by the cup
  for (const [cx, cz, r] of [PLAN.forecourt, PLAN.cupcourt]) {
    const ppm = 70, N = Math.round(r * 2 * ppm), tx = gravelTex(N, N, ppm, (u, v) => { const d = Math.hypot(u - r, v - r); return d > r - 0.25 ? 0.5 : 0.5 + 0.5 * Math.cos(d * Math.PI * 2 / 0.11); });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tx.map, normalMap: tx.normalMap, roughness: 1, color: 0x9a978f }));
    disc.position.set(cx, groundH(cx, cz) + 0.015, cz); disc.receiveShadow = true; group.add(disc);
  }

  // ---------- stepping stones ----------
  {
    const geos = [0, 1, 2].map((k) => { const g = new THREE.CylinderGeometry(1, 1.04, 1, 11); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), r = 0.82 + fbm(Math.cos(a) * 1.4 + k * 5, Math.sin(a) * 1.4, 3) * 0.4; p.setX(i, x * r); p.setZ(i, z * r); } g.computeVertexNormals(); return g; });
    const lay = (pts, step) => {
      const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new V3(x, 0, z))), n = Math.floor(curve.getLength() / step);
      for (let i = 0; i <= n; i++) {
        const t = i / n, p = curve.getPointAt(t), tan = curve.getTangentAt(t), side = (i % 2 ? 1 : -1) * 0.09, big = i % 5 === 0;
        const x = p.x - tan.z * side, z = p.z + tan.x * side, r = big ? 0.34 : 0.22 + rnd() * 0.06;
        const m = new THREE.Mesh(geos[i % 3], stone); m.position.set(x, groundH(x, z) + 0.01, z); m.scale.set(r, 0.09, r * (0.8 + rnd() * 0.25)); m.rotation.y = rnd() * 6.28; add(m, false);
      }
    };
    lay(PLAN.path, 0.6); lay(PLAN.path2, 0.6);
  }

  // ---------- stone lanterns ----------
  const lantern = (kind, x, z, real) => {
    const g = new THREE.Group(), y = groundH(x, z); g.position.set(x, y - 0.03, z); g.rotation.y = rnd() * 6.28; group.add(g);
    const hex = (r, h, yy, mat = stone, sides = 6, r2 = r) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, h, sides), mat); m.position.y = yy + h / 2; m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    const roof = (r, h, yy, sides = 6) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, sides), stone); m.position.y = yy + h / 2; m.castShadow = true; g.add(m); const lip = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.04, sides), stone); lip.position.y = yy + 0.02; g.add(lip); return m; };
    const box = (r, h, yy, sides = 6) => { // the fire box: posts round an open chamber
      for (let i = 0; i < sides; i++) { const a = i / sides * Math.PI * 2 + Math.PI / sides, p = new THREE.Mesh(new THREE.BoxGeometry(r * 0.42, h, r * 0.18), stone); p.position.set(Math.cos(a) * r * 0.86, yy + h / 2, Math.sin(a) * r * 0.86); p.rotation.y = -a + Math.PI / 2; p.castShadow = true; g.add(p); }
      const pane = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r * 0.72, h * 0.85, sides), paper); pane.position.y = yy + h / 2; g.add(pane);
      flame(g, 0, yy + h * 0.45, 0, real);
    };
    if (kind === 'kasuga') {
      hex(0.34, 0.12, 0); hex(0.2, 0.08, 0.12, stone, 6, 0.12); hex(0.09, 0.78, 0.2, stone, 12); hex(0.11, 0.05, 0.6, stone, 12);
      hex(0.3, 0.12, 0.98, stone, 6, 0.22); box(0.22, 0.32, 1.1); roof(0.46, 0.26, 1.42); hex(0.07, 0.06, 1.66, stone, 12);
      const ho = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), stone); ho.position.y = 1.78; ho.scale.y = 1.25; g.add(ho);
    } else if (kind === 'yukimi') {
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.55, 8), stone); leg.position.set(Math.cos(a) * 0.24, 0.26, Math.sin(a) * 0.24); leg.rotation.set(Math.sin(a) * 0.32, 0, -Math.cos(a) * 0.32); leg.castShadow = true; g.add(leg); }
      hex(0.32, 0.08, 0.5, stone, 6, 0.26); box(0.25, 0.26, 0.58); roof(0.7, 0.22, 0.84); hex(0.06, 0.05, 1.04, stone, 10);
      const ho = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), stone); ho.position.y = 1.13; g.add(ho);
    } else { // oki: a small lantern set straight on the ground
      hex(0.22, 0.08, 0, darkStone, 4); box(0.16, 0.22, 0.08, 4); roof(0.32, 0.18, 0.3, 4); const ho = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), stone); ho.position.y = 0.5; g.add(ho);
    }
  };
  for (const [k, x, z, real] of PLAN.lanterns) lantern(k, x, z, real);

  // ---------- the golf station by the forecourt: putter rack, a basket of balls, a bench, the scorecard box, the garden's board ----------
  {
    const [sx, sz] = PLAN.station, y = groundH(sx, sz), g = new THREE.Group(); g.position.set(sx, y, sz); g.rotation.y = -0.5; group.add(g);
    const part = (geo, mat, x, yy, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, yy, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    part(new THREE.BoxGeometry(0.07, 1.0, 0.07), wood, -0.5, 0.5, 0); part(new THREE.BoxGeometry(0.07, 1.0, 0.07), wood, 0.5, 0.5, 0); part(new THREE.BoxGeometry(1.1, 0.06, 0.09), wood, 0, 0.92, 0);
    part(new THREE.BoxGeometry(1.1, 0.05, 0.2), wood, 0, 0.12, 0.08);
    const steel = new THREE.MeshStandardMaterial({ color: 0xa8adb4, metalness: 0.9, roughness: 0.3 }), grip = new THREE.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.9 }), head = new THREE.MeshStandardMaterial({ color: 0x2e3136, metalness: 0.8, roughness: 0.35 });
    for (let i = 0; i < 5; i++) { const x = -0.38 + i * 0.19, tilt = 0.12; part(new THREE.CylinderGeometry(0.006, 0.007, 0.86, 6), steel, x, 0.5, 0.03, tilt); part(new THREE.CylinderGeometry(0.012, 0.011, 0.2, 8), grip, x, 0.87, -0.02, tilt); part(new THREE.BoxGeometry(0.1, 0.028, 0.03), head, x + 0.03, 0.08, 0.09, 0, 0.1); }
    const basket = part(new THREE.CylinderGeometry(0.2, 0.16, 0.24, 18, 1, true), dryBamboo, 0.95, 0.12, 0.35); basket.material = dryBamboo.clone(); basket.material.side = THREE.DoubleSide;
    for (let i = 0; i < 14; i++) { const a = i * 2.4, r = (i % 4) * 0.045; part(new THREE.SphereGeometry(0.0213, 10, 8), new THREE.MeshStandardMaterial({ color: [0xf2f2ee, 0xf2f2ee, 0xe8c547, 0xf2f2ee][i % 4], roughness: 0.3 }), 0.95 + Math.cos(a) * r, 0.2 + (i > 9 ? 0.03 : 0), 0.35 + Math.sin(a) * r); }
    // a stone-footed bench, and the scorecard box on its post
    part(new THREE.BoxGeometry(0.28, 0.32, 0.3), darkStone, -1.6, 0.16, 0.6); part(new THREE.BoxGeometry(0.28, 0.32, 0.3), darkStone, -0.5, 0.16, 0.6);
    part(new THREE.BoxGeometry(1.5, 0.07, 0.38), wood, -1.05, 0.355, 0.6);
    part(new THREE.BoxGeometry(0.06, 1.1, 0.06), wood, 1.45, 0.55, -0.1); part(new THREE.BoxGeometry(0.3, 0.24, 0.16), wood, 1.45, 1.12, -0.1);
    const board = part(new THREE.BoxGeometry(1.1, 0.55, 0.05), wood, 0, 1.45, -0.02); board.position.set(0, 1.42, -0.06);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.5), new THREE.MeshStandardMaterial({ map: signTex([['HALCYON GREENS', 54, 110], ['· one hole, par three ·', 30, 170], ['please rake the gravel after you', 22, 220]]), roughness: 0.9 }));
    face.position.set(0, 1.42, -0.032); face.rotation.y = Math.PI; g.add(face);
  }

  // ---------- the bridge over the stream ----------
  {
    let best = null, bd = 1e9; for (const q of lower) { const d = Math.hypot(q.p.x - PLAN.bridge[0], q.p.z - PLAN.bridge[1]); if (d < bd) { bd = d; best = q; } }
    const c = best.p, ax = best.side.clone(), span = best.w + 3.4, rise = 0.55, W = 1.15, N = 18;
    const e0 = c.clone().addScaledVector(ax, -span / 2), e1 = c.clone().addScaledVector(ax, span / 2), y0 = groundH(e0.x, e0.z), y1 = groundH(e1.x, e1.z);
    const at = (t) => { const p = e0.clone().lerp(e1, t); p.y = lerp(y0, y1, t) + Math.sin(t * Math.PI) * rise + 0.05; return p; };
    const g = new THREE.Group(); group.add(g);
    const perp = new V3(-ax.z, 0, ax.x), ry = Math.atan2(ax.x, ax.z);
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N, p = at(t), p0 = at(i / N), p1 = at((i + 1) / N), slope = Math.atan2(p1.y - p0.y, p0.distanceTo(p1));
      const pl = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, span / N * 0.96), wood); pl.position.copy(p); pl.rotation.set(-slope, ry, 0, 'YXZ'); pl.castShadow = pl.receiveShadow = true; g.add(pl);
    }
    for (const s of [-1, 1]) {
      const pts = []; for (let i = 0; i <= 12; i++) pts.push(at(i / 12).addScaledVector(perp, s * W / 2).add(new V3(0, 0.62, 0)));
      const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 8), lacquer); rail.castShadow = true; g.add(rail);
      const mid = []; for (let i = 0; i <= 12; i++) mid.push(at(i / 12).addScaledVector(perp, s * W / 2).add(new V3(0, 0.3, 0)));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mid), 24, 0.022, 6), lacquer));
      for (let i = 0; i <= 6; i++) {
        const p = at(i / 6).addScaledVector(perp, s * W / 2), end = i === 0 || i === 6, h = end ? 0.85 : 0.66;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.08), lacquer); post.position.copy(p).y += h / 2 - 0.03; post.rotation.y = ry; post.castShadow = true; g.add(post);
        if (end) { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: 0x6b5a3a, metalness: 0.7, roughness: 0.4 })); cap.position.copy(p).y += h + 0.02; cap.scale.y = 1.3; g.add(cap); }
      }
    }
    for (const t of [0.12, 0.88]) { const p = at(t); const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.6, 0.2), darkStone); b.position.copy(p).y -= 0.85; b.castShadow = true; g.add(b); }
  }

  // ---------- the pavilion facing the falls, and the stone basin at its step ----------
  {
    const [px, pz] = PLAN.pavilion; let gy = -1e9; for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3], [0, 0]]) gy = Math.max(gy, groundH(px + dx, pz + dz));
    const g = new THREE.Group(); g.position.set(px, gy, pz); group.add(g);
    const toFalls = new V3(14.8 - px, 0, -18 - pz).normalize(); g.rotation.y = Math.atan2(toFalls.x, toFalls.z);
    const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    for (const [x, z] of [[-1.25, -1.25], [1.25, -1.25], [-1.25, 1.25], [1.25, 1.25]]) { part(new THREE.BoxGeometry(0.34, 0.9, 0.34), darkStone, x, -0.05, z); part(new THREE.BoxGeometry(0.13, 2.45, 0.13), wood, x, 1.62, z); }
    part(new THREE.BoxGeometry(2.9, 0.1, 2.9), wood, 0, 0.42, 0);
    for (const [x, z, w, d] of [[0, -1.25, 2.7, 0.1], [0, 1.25, 2.7, 0.1], [-1.25, 0, 0.1, 2.7], [1.25, 0, 0.1, 2.7]]) part(new THREE.BoxGeometry(w, 0.14, d), wood, x, 2.78, z);
    const rf = part(new THREE.ConeGeometry(2.55, 1.25, 4, 1), tile, 0, 3.45, 0); rf.rotation.y = Math.PI / 4;
    const eave = part(new THREE.BoxGeometry(3.4, 0.07, 3.4), tile, 0, 2.86, 0);
    part(new THREE.SphereGeometry(0.1, 10, 8), tile, 0, 4.12, 0);
    part(new THREE.BoxGeometry(2.3, 0.07, 0.4), wood, 0, 0.88, -1.0); part(new THREE.BoxGeometry(0.1, 0.42, 0.34), wood, -1.0, 0.65, -1.0); part(new THREE.BoxGeometry(0.1, 0.42, 0.34), wood, 1.0, 0.65, -1.0);
    for (const s of [-1, 1]) part(new THREE.BoxGeometry(0.06, 0.06, 2.5), wood, s * 1.25, 1.05, 0);
    const chochin = part(new THREE.CylinderGeometry(0.13, 0.13, 0.32, 14), paper, 0, 2.38, 0.6); chochin.castShadow = false;
    part(new THREE.CylinderGeometry(0.004, 0.004, 0.36, 4), grip0(), 0, 2.62, 0.6);
    flame(g, 0, 2.38, 0.6, true, 1.2);
    part(new THREE.BoxGeometry(0.9, 0.18, 0.5), darkStone, 0, 0.12, 1.75);
  }
  function grip0() { return new THREE.MeshStandardMaterial({ color: 0x1a1a1a }); }
  {
    const [bx, bz] = PLAN.basin, y = groundH(bx, bz), g = new THREE.Group(); g.position.set(bx, y, bz); g.rotation.y = 0.8; group.add(g);
    const part = (geo, mat, x, yy, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, yy, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    part(new THREE.CylinderGeometry(0.3, 0.34, 0.36, 16), stone, 0, 0.16, 0);
    const water = part(new THREE.CircleGeometry(0.2, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0e1414, roughness: 0.02, metalness: 0.3, envMapIntensity: 2 }), 0, 0.32, 0); water.castShadow = false;
    part(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), greenBamboo, 0, 0.62, -0.62, Math.PI / 2 - 0.12);
    part(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 6), greenBamboo, 0.08, 0.3, -1.0, 0, 0, 0.4); part(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 6), greenBamboo, -0.08, 0.3, -1.0, 0, 0, -0.4);
    const drip = part(new THREE.CylinderGeometry(0.006, 0.01, 0.28, 6), new THREE.MeshStandardMaterial({ color: 0xcfe0e6, transparent: true, opacity: 0.6, roughness: 0.1 }), 0, 0.46, -0.17); drip.castShadow = false;
    part(new THREE.CylinderGeometry(0.04, 0.035, 0.06, 12), greenBamboo, 0.12, 0.38, 0.02); part(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 6), greenBamboo, -0.08, 0.37, 0.02, 0, 0, Math.PI / 2 + 0.05);
    for (const [x, z, s, k] of [[0, 0.62, 0.3, 0], [-0.6, 0.15, 0.22, 1], [0.58, -0.1, 0.2, 2]]) { const piece = A.rocks[k % A.rocks.length]; const m = new THREE.Mesh(piece.geo, piece.mat); m.position.set(x, -0.04, z); m.scale.setScalar(s / piece.h * 1.4); m.castShadow = true; g.add(m); }
  }

  // ---------- the deer scarer: a bamboo tube fills, tips, empties and knocks its stone ----------
  const deer = { pos: new V3(PLAN.deer[0], 0, PLAN.deer[1]), onKnock: null };
  {
    const [dx, dz] = PLAN.deer, y = groundH(dx, dz); deer.pos.y = y + 0.3;
    const g = new THREE.Group(); g.position.set(dx, y, dz); g.rotation.y = -0.9; group.add(g);
    const part = (geo, mat, x, yy, z, rx = 0, ry = 0, rz = 0, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, yy, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
    part(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), greenBamboo, -0.1, 0.35, 0.14); part(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), greenBamboo, -0.1, 0.35, -0.14);
    part(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 6), darkStone, -0.1, 0.52, 0, Math.PI / 2);
    const arm = new THREE.Group(); arm.position.set(-0.1, 0.52, 0); g.add(arm);
    part(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 10), greenBamboo, 0.12, 0, 0, 0, 0, Math.PI / 2, arm);
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), greenBamboo, 0.55, 0.85, 0, 0, 0, 1.25);
    part(new THREE.CylinderGeometry(0.038, 0.035, 1.0, 8), greenBamboo, 0.95, 0.5, 0);
    const piece = A.rocks[2]; const st = new THREE.Mesh(piece.geo, piece.mat); st.position.set(-0.5, -0.05, 0); st.scale.setScalar(0.22 / piece.h); st.castShadow = true; g.add(st);
    const drip = part(new THREE.CylinderGeometry(0.004, 0.008, 0.2, 5), new THREE.MeshStandardMaterial({ color: 0xcfe0e6, transparent: true, opacity: 0.55 }), 0.56, 0.62, 0); drip.castShadow = false;
    let t0 = 0, knocked = false; const REST = 0.2, TIP = -0.55, CYCLE = 9;
    updaters.push((dt, t) => {
      const c = (t + 3) % CYCLE; let a;
      if (c < CYCLE - 1.2) { a = lerp(REST, REST - 0.42, (c / (CYCLE - 1.2)) ** 3); knocked = false; }
      else if (c < CYCLE - 0.8) a = lerp(REST - 0.42, TIP, (c - (CYCLE - 1.2)) / 0.4);
      else { const k = (c - (CYCLE - 0.8)) / 0.8; a = lerp(TIP, REST, Math.min(1, k * 3.2)); if (k > 0.3 && !knocked) { knocked = true; deer.onKnock && deer.onKnock(deer.pos); } }
      arm.rotation.z = -a;
    });
  }

  // ---------- bamboo: the fence that bounds the garden, the grove beyond it ----------
  {
    const parts = [], pts = PLAN.fence, cyl = (r, h, x, y, z, rx = 0, rz = 0, ry = 0) => { const g = new THREE.CylinderGeometry(r, r, h, 7); g.rotateZ(rz); g.rotateX(rx); g.rotateY(ry); g.translate(x, y, z); parts.push(g); };
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = Math.hypot(bx - ax, bz - az), dir = Math.atan2(bz - az, bx - ax), n = Math.ceil(L / 1.8);
      for (let k = 0; k <= n; k++) { const t = k / n, x = lerp(ax, bx, t), z = lerp(az, bz, t); cyl(0.05, 1.15, x, groundH(x, z) + 0.55, z); }
      for (const h of [0.3, 0.6, 0.9]) { const mx = (ax + bx) / 2, mz = (az + bz) / 2, y = (groundH(ax, az) + groundH(bx, bz)) / 2 + h; cyl(0.018, L, mx, y, mz, 0, Math.PI / 2, -dir); }
      const m = Math.floor(L / 0.32);
      for (let k = 1; k < m; k++) { const t = k / m, x = lerp(ax, bx, t), z = lerp(az, bz, t), o = (k % 2 ? 1 : -1) * 0.03; cyl(0.014, 0.95, x - Math.sin(dir) * o, groundH(x, z) + 0.47, z + Math.cos(dir) * o); }
    }
    const fence = new THREE.Mesh(mergeGeometries(parts), dryBamboo); fence.castShadow = fence.receiveShadow = true; group.add(fence);
    const N = 150, culm = new THREE.CylinderGeometry(0.045, 0.055, 1, 7).translate(0, 0.5, 0), im = new THREE.InstancedMesh(culm, greenBamboo, N);
    const lt = bambooLeaves(), leafGeo = (() => { const a = new THREE.PlaneGeometry(1.4, 1.4), b = a.clone().rotateY(Math.PI / 2); return mergeGeometries([a, b]); })();
    const leaves = new THREE.InstancedMesh(leafGeo, new THREE.MeshLambertMaterial({ map: lt, alphaTest: 0.45, side: THREE.DoubleSide, color: 0x9aa47a }), N * 5);
    const d = new THREE.Object3D(); let n = 0, ln = 0;
    for (let tries = 0; n < N && tries < 3000; tries++) {
      const i = 1 + Math.floor(rnd() * (pts.length - 1)), t = rnd(), [ax, az] = pts[i - 1], [bx, bz] = pts[i], out = 1.2 + rnd() * rnd() * 5.5;
      const dir = Math.atan2(bz - az, bx - ax), fx = lerp(ax, bx, t), fz = lerp(az, bz, t), nx = Math.sin(dir), nz = -Math.cos(dir);
      const away = gardenMask(fx + nx, fz + nz) < gardenMask(fx - nx, fz - nz) ? 1 : -1, x = fx + nx * out * away, z = fz + nz * out * away;
      const h = 5.5 + rnd() * 4, lean = (rnd() - 0.5) * 0.12;
      d.position.set(x, groundH(x, z) - 0.1, z); d.rotation.set(lean, rnd() * 6.28, (rnd() - 0.5) * 0.12); d.scale.set(1, h, 1); d.updateMatrix(); im.setMatrixAt(n++, d.matrix);
      for (let k = 0; k < 5 && ln < N * 5; k++) { d.position.set(x + (rnd() - 0.5) * 0.9, groundH(x, z) + h * (0.55 + k * 0.09), z + (rnd() - 0.5) * 0.9); d.rotation.set((rnd() - 0.5) * 0.6, rnd() * 6.28, (rnd() - 0.5) * 0.6); d.scale.setScalar(0.9 + rnd() * 0.7); d.updateMatrix(); leaves.setMatrixAt(ln++, d.matrix); }
    }
    im.count = n; leaves.count = ln; im.castShadow = leaves.castShadow = true; im.receiveShadow = leaves.receiveShadow = true; group.add(im, leaves);
  }

  // ---------- clipped azalea mounds in the moss ----------
  {
    const geo = new THREE.IcosahedronGeometry(1, 3), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.9 + fbm(x * 3 + 5, y * 3 + z * 2, 3) * 0.22; p.setXYZ(i, x * k, Math.max(y, -0.3) * k, z * k); }
    geo.computeVertexNormals();
    const leafy = A.grass.map.clone(); leafy.repeat.set(2, 2); leafy.needsUpdate = true;
    const mat = new THREE.MeshStandardMaterial({ map: leafy, normalMap: A.grass.normalMap, color: 0x5a7a3c, roughness: 0.9 });
    const bloom = new THREE.MeshStandardMaterial({ map: leafy, normalMap: A.grass.normalMap, color: 0x8a4a56, roughness: 0.9 });
    PLAN.mounds.forEach(([x, z, r], i) => { const m = new THREE.Mesh(geo, i % 4 === 1 ? bloom : mat); m.position.set(x, groundH(x, z) - r * 0.15, z); m.scale.set(r * 1.25, r * 0.78, r * 1.1); m.rotation.y = i; add(m); });
  }

  // ---------- koi in the pool ----------
  const koi = [];
  {
    const body = new THREE.SphereGeometry(1, 14, 10); body.scale(0.07, 0.045, 0.24);
    const tail = new THREE.PlaneGeometry(0.16, 0.14).rotateX(-Math.PI / 2).translate(0, 0, 0.3);
    const cols = [0xd8581c, 0xece6da, 0xd99a2a, 0xece6da, 0x1d1d1e, 0xd8581c, 0xc94822, 0xe8e0cc];
    cols.forEach((c, i) => {
      const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }), g = new THREE.Group();
      g.add(new THREE.Mesh(body, m)); const tl = new THREE.Mesh(tail, new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); g.add(tl);
      if (c === 0xece6da) { const spot = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8).scale(0.05, 0.03, 0.1), new THREE.MeshStandardMaterial({ color: 0xd8581c })); spot.position.set(0, 0.022, -0.04); g.add(spot); }
      group.add(g); koi.push({ g, tl, r: 1.1 + rnd() * 2.3, sp: (0.12 + rnd() * 0.12) * (rnd() < 0.5 ? 1 : -1), ph: rnd() * 6.28, dep: 0.16 + rnd() * 0.16, s: 0.9 + rnd() * 0.5 });
    });
    const P = ctx.pool;
    updaters.push((dt, t) => {
      for (const k of koi) {
        const a = k.ph + t * k.sp + Math.sin(t * 0.3 + k.ph) * 0.4, r = k.r + Math.sin(t * 0.21 + k.ph * 2) * 0.4;
        k.g.position.set(P.x + Math.cos(a) * r, P.y - k.dep, P.z + Math.sin(a) * r); k.g.scale.setScalar(k.s);
        k.g.rotation.y = -a + (k.sp > 0 ? Math.PI : 0); k.tl.rotation.y = Math.sin(t * 6 + k.ph) * 0.45;
      }
    });
  }

  // ---------- the pagoda on the far ridge, borrowed into the view ----------
  {
    const p = ctx.ridgeSpot, g = new THREE.Group(); g.position.copy(p); g.rotation.y = rnd() * 6.28; group.add(g);
    const dark = new THREE.MeshStandardMaterial({ color: 0x3a3634, roughness: 1 }), roofM = new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.8 });
    let y = 0; const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const w = 7 - i * 0.9, h = 3.1 - i * 0.15;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, h, w * 0.72), dark); b.position.y = y + h / 2; g.add(b);
      const r = new THREE.Mesh(new THREE.ConeGeometry(w * 0.82, 1.1, 4), roofM); r.rotation.y = Math.PI / 4; r.position.y = y + h + 0.45; g.add(r);
      if (i < 2) { const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 5, 1.6) })); win.position.set(0, y + h * 0.5, w * 0.36 + 0.02); g.add(win); }
      y += h + 0.6;
    }
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 6, 8), roofM); spire.position.y = y + 2.6; g.add(spire);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffa050, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5, fog: false })); halo.position.set(0, 2.6, 4); halo.scale.setScalar(10); g.add(halo);
  }

  // ---------- birds wheeling high over the vale ----------
  {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.25, -0.9, 0, 0.1, 0, 0, 0.25, 0, 0, -0.25, 0.9, 0, 0.1, 0, 0, 0.25], 3)); geo.computeVertexNormals();
    const m = new THREE.MeshBasicMaterial({ color: 0x1c1e22, side: THREE.DoubleSide }), birds = [];
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(geo.clone(), m); b.scale.setScalar(0.9 + rnd() * 0.4); group.add(b); birds.push({ b, r: 60 + rnd() * 90, h: 34 + rnd() * 26, sp: 0.04 + rnd() * 0.03, ph: rnd() * 6.28, c: new V3(-40 + rnd() * 80, 0, -120 + rnd() * 60) }); }
    updaters.push((dt, t) => {
      for (const B of birds) {
        const a = B.ph + t * B.sp, p = B.b.geometry.attributes.position, f = Math.sin(t * 5 + B.ph) * 0.35 * (0.5 + 0.5 * Math.sin(t * 0.7 + B.ph) ** 2);
        p.setY(1, f); p.setY(4, f); p.needsUpdate = true;
        B.b.position.set(B.c.x + Math.cos(a) * B.r, B.h + Math.sin(t * 0.3 + B.ph) * 3, B.c.z + Math.sin(a) * B.r); B.b.rotation.y = -a;
      }
    });
  }

  return { deer, lights };
}
