// the village where the stall stands, Japan in the 1860s: a dirt street between two rows of wooden machiya under tiled roofs, noren at the shop doors, paper lanterns, a well, the shrine's gate at the west end, rice fields and dark hills to the east; its sky, sun, moon and lamps follow the run's clock (clock.js)
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, clamp } from './ctx.js';
import * as T from './tex.js';
import { buildBlock } from './block.js';
import { taru } from './models.js';
import { makeWater } from './ripple.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const FOG = 0xb8c4cc;
const C3 = (h) => new THREE.Color(h);
// the sky at each moment: [hour, zenith, horizon, fog, sun colour, sun, hemisphere sky, hemisphere ground, fill]
const SKY = [[6, 0x5a6a92, 0xe0a070, 0x9a8a88, 0xffb070, 0.9, 0x8a94b8, 0x3a3028, 0.7], [10, 0x5e8ed0, 0xc8d8e4, 0xb8c4cc, 0xfff2dc, 2.4, 0xbcd0ec, 0x6a5a40, 1.05], [16.5, 0x6a94cc, 0xd8d8d0, 0xbcc4c4, 0xffe8c8, 2.1, 0xc0cce0, 0x6a5a40, 1.0],
  [18.2, 0x4a5a8a, 0xf08848, 0xb08070, 0xff8a40, 1.1, 0x9a88a8, 0x4a3828, 0.8], [19, 0x1c2244, 0x8a4a48, 0x4a3a48, 0xd06040, 0.25, 0x4a4a78, 0x201818, 0.5], [19.6, 0x070a18, 0x18203a, 0x0c1020, 0x000000, 0, 0x2a3a6a, 0x0a0a10, 0.38],
  [28.8, 0x070a18, 0x18203a, 0x0c1020, 0x000000, 0, 0x2a3a6a, 0x0a0a10, 0.38], [29.05, 0x10163a, 0x4a3a5e, 0x1e1c2e, 0xc07050, 0, 0x3a4272, 0x16141c, 0.45], [29.6, 0x2a3460, 0xb06a5a, 0x5a4a58, 0xff9a60, 0.4, 0x6a6a90, 0x2a2420, 0.55], [30.5, 0x5a6a9a, 0xe8a878, 0x9a8c8c, 0xffb878, 1.0, 0x9aa0c0, 0x3a3028, 0.75]];

export function buildAlley(scene) {
  const city = new THREE.Group(); scene.add(city); const glow = new THREE.Group(); city.add(glow); const ups = [], R = T.rng(1862);
  const glowMap = T.glowTex(), S = { easy: true };
  const halo = (color, size, x, y, z, parent = glow, op = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op, fog: true })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); s.userData.nopick = true; return s; };
  const real = (n, size, color = 0xffffff, o = {}) => T.surface(T.worldUV(mat({ map: T.photo(n), color, side: o.side }), size), { bomb: o.bomb ?? 1, grime: o.grime ?? 0.3, band: o.band ?? 0.8, scale: 0.6, worn: o.worn ?? 0 }), flat = (c, o = {}) => mat({ color: c, ...o });
  const NZ = 3.4, FZ = -5.6, MID = (NZ + FZ) / 2, W0 = -26, E0 = 26;
  // ---- the ground: the street's packed dirt, grass beyond the houses, the path out between the fields
  const dirt = real('dirt', 3.2, 0xa89880, { grime: 0.2 }), grass = real('grass', 3, 0x8a9a70), mud = real('mud', 2.6, 0x8a7a68);
  box(160, 0.4, 140, grass, 20, -0.21, 0, city).castShadow = false;
  box(E0 - W0 + 12, 0.2, NZ - FZ + 1.2, dirt, (E0 + W0) / 2 + 2, -0.1, MID, city).castShadow = false;
  box(70, 0.2, 4.2, dirt, E0 + 41, -0.105, MID, city).castShadow = false;   // the road east, out between the fields
  for (let i = 0; i < 22; i++) { const m = mesh(new THREE.CircleGeometry(0.4 + R() * 1.1, 10), mud, W0 + 4 + R() * 48, 0.002, FZ + 0.6 + R() * (NZ - FZ - 1.2), city); m.rotation.x = -Math.PI / 2; m.castShadow = false; m.scale.y = 0.5 + R(); }   // worn patches where feet and carts go
  // ---- the houses: machiya, a shop's lattice and noren below, a low upper storey of white plaster with slatted windows, a tiled roof with deep eaves; the far ones plainer (they stand in the haze)
  const cedar = real('cedar', 1.6, 0xb09070), darkWood = real('wood_dark', 1.4, 0x6a5040), plaster = real('plaster_white', 2, 0xe8e2d4, { grime: 0.45, band: 1.2 }), clay = real('plaster_clay', 2, 0xb8a080), stone = real('stone_wall', 1.4, 0x9a9488);
  const tiles = real('roof_tiles', 1.2, 0x8a8e94, { bomb: 0, grime: 0.35, side: THREE.DoubleSide }), thatch = real('thatch', 2, 0x9a8460, { side: THREE.DoubleSide }), ridgeM = real('roof_tiles', 0.6, 0x5a5c62, { bomb: 0 });
  const latticeT = T.canvasTex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#3a2618'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 4, h); g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5); }, { repeat: [1, 1] });
  latticeT.wrapS = latticeT.wrapT = THREE.RepeatWrapping;
  const lattice = mat({ map: latticeT, alphaTest: 0.5, side: THREE.DoubleSide }), inside = new THREE.MeshBasicMaterial({ color: 0x120c08 }), tatami = real('tatami', 1, 0x8a8060, { grime: 0.1 });
  const slats = mat({ map: T.canvasTex(64, 32, (g, w, h) => { g.fillStyle = '#16100a'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d0c0'; for (let x = 0; x < w; x += 10) g.fillRect(x, 0, 5, h); }) });
  const NOREN = [['#24325a', '酒', 'SAKE'], ['#2a2a2a', '茶', 'TEA'], ['#5a2a1c', '魚', 'FISH'], ['#3a4a2a', '陶', 'POTTERY'], ['#24325a', '宿', 'INN'], ['#6a1c1c', '米', 'RICE'], ['#2a3a4a', '豆腐', 'TOFU'], ['#4a3a24', '薬', 'MEDICINE']];
  const norenM = NOREN.map(([c, k]) => { const t = T.canvasTex(256, 128, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#efe8d8'; g.font = `bold ${k.length > 1 ? 70 : 90}px ${T.JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k, w / 2, h / 2 + 4); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = w / 3; x < w; x += w / 3) g.fillRect(x - 1, 0, 3, h); }); T.dirty(t, 3 + k.length, { stains: 10, fade: 1 }); return mat({ map: t, side: THREE.DoubleSide }); });
  // the lamps: every paper lantern in the village shares a few materials whose light comes up together at dusk and goes at dawn (steadily: nothing flickers)
  const lampMats = [], lampHalos = new THREE.SpriteMaterial({ map: glowMap, color: 0xffa860, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: true });
  const paper = (bg, ink, txt) => { const t = T.canvasTex(128, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let y = 8; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } if (txt) { g.fillStyle = ink; g.font = `bold 54px ${T.JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 4, h / 2); g.fillText(txt, (w * 3) / 4, h / 2); } }); const m = mat({ map: t, emissiveMap: t, emissive: 0xffb070, emissiveIntensity: 0 }); m.userData.lamp = 1; lampMats.push(m); return m; };
  const lampW = paper('#efe4c8', '#1a1a1a', '提灯'.slice(0, 1)), lampR = paper('#c8301c', '#140404', '祭'), lampS = paper('#e8dcc0', '#1a1a1a', '');
  const chochin = (x, y, z, m = lampW, s = 1) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); city.add(g); mesh(new THREE.SphereGeometry(0.17, 12, 8).scale(1, 1.35, 1), m, 0, 0, 0, g).castShadow = false; for (const dy of [-0.24, 0.24]) cyl(0.1, 0.1, 0.03, ridgeM, 0, dy, 0, g, 10).castShadow = false; const h = new THREE.Sprite(lampHalos); h.scale.set(1.6 * s, 1.6 * s, 1); g.add(h); h.userData.nopick = true; return g; };
  const house = (x, z, w, s, k, far) => { // s: 1 the row behind the stall (its front faces -z), -1 across the street
    const D = far ? 6 : 7, fz = z, cz = z + s * D / 2, g1 = 2.9, kind = k.kind;
    const wallM = kind === 'kura' ? plaster : cedar;
    box(w, 0.35, D, stone, x, 0.17, cz, city).castShadow = false;   // the stone footing
    box(w, g1, D, wallM, x, 0.35 + g1 / 2, cz, city);
    if (!far && kind !== 'kura') { const fp = mesh(new THREE.PlaneGeometry(w - 0.3, g1 - 0.5), lattice, x, 0.35 + (g1 - 0.5) / 2 + 0.1, fz - s * 0.06, city); fp.rotation.y = s > 0 ? Math.PI : 0; latticeT.repeat.set(1, 1); fp.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = i % 2 ? v * (g1 - 0.5) * 1.2 : v * (w - 0.3) * 1.6; }); fp.castShadow = false; }
    if (!far && k.door) { const dw = 1.6, dx = x + k.door; box(dw, 2.15, 0.1, inside, dx, 0.35 + 1.07, fz - s * 0.04, city).castShadow = false; const fl = box(dw, 0.04, 1.2, tatami, dx, 0.37, fz + s * 0.6, city); fl.castShadow = false;
      if (k.noren != null) for (let i = 0; i < 3; i++) { const n = mesh(new THREE.PlaneGeometry(dw / 3 - 0.02, 0.7), norenM[k.noren], dx - dw / 3 + i * dw / 3, 2.15, fz - s * 0.16, city); n.rotation.y = s > 0 ? Math.PI : 0; n.castShadow = false; const uv = n.geometry.attributes.uv; for (let j = 0; j < uv.count; j++) uv.setX(j, (uv.getX(j) + i) / 3); }
      if (k.lamp) lamps.push(chochin(dx + 1.05, 2.45, fz - s * 0.4, k.lamp, 0.85)); }
    if (kind === 'farm') { // a thatched roof, steep, to the ground's edge
      for (const sd of [-1, 1]) { const r = box(w + 0.8, 0.25, D * 0.62, thatch, x, 0.35 + g1 + 1.1, cz + sd * D * 0.25, city); r.rotation.x = -sd * 0.72; }
      return; }
    // the eave over the street (hisashi), then the upper storey and its roof
    const ev = box(w + 0.1, 0.06, 1.15, tiles, x, 0.35 + g1 + 0.12, fz - s * 0.45, city); ev.rotation.x = s * 0.28;
    const u = kind === 'kura' ? 2.6 : 1.9, uz = cz + s * 0.4; box(w, u, D - 0.8, kind === 'kura' ? plaster : plaster, x, 0.35 + g1 + u / 2, uz, city);
    if (!far && kind !== 'kura') for (const wx of [-w / 4, w / 4]) { const sl = mesh(new THREE.PlaneGeometry(Math.min(1.2, w / 3), 0.55), slats, x + wx, 0.35 + g1 + u * 0.55, uz - s * ((D - 0.8) / 2 + 0.01), city); sl.rotation.y = s > 0 ? Math.PI : 0; sl.castShadow = false; }
    if (kind === 'kura') box(w + 0.02, 0.9, D - 0.78, darkWood, x, 0.35 + g1 + 0.45 - g1 + 0.6, uz, city);
    const top = 0.35 + g1 + u, half = (D - 0.8) / 2 + 0.6, pitch = 0.5;
    for (const sd of [-1, 1]) { const r = box(w + 0.7, 0.08, half / Math.cos(pitch) + 0.1, tiles, x, top + Math.tan(pitch) * half / 2 - 0.05, uz + sd * half / 2, city); r.rotation.x = -sd * pitch; }
    box(w + 0.75, 0.18, 0.22, ridgeM, x, top + Math.tan(pitch) * half + 0.02, uz, city);
    for (const ex of [-1, 1]) { const tri = new THREE.Shape(); tri.moveTo(-half + 0.6, 0); tri.lineTo(half - 0.6, 0); tri.lineTo(0, Math.tan(pitch) * (half - 0.6)); tri.closePath(); const gm = mesh(new THREE.ShapeGeometry(tri), plaster, x + ex * (w / 2 - 0.01), top, uz, city); gm.rotation.y = ex * Math.PI / 2; gm.castShadow = false; }
  };
  const lamps = [];
  // the street's houses, west to east: [x, width, kind, door offset, noren, lamp]; the stall stands in the open in front of the gap behind it
  const near = [[-21, 6, 'house', 0, null], [-15, 5.4, 'shop', -0.6, 4, lampW], [-9.6, 5, 'kura'], [-3.8, 4.4, 'house', 0.4, null, lampS], [3.6, 4.6, 'shop', 0.4, 2, lampW], [9, 5.6, 'shop', -0.8, 6, lampW], [14.6, 5.2, 'house', 0, null], [20.4, 6, 'farm', 0]];
  const farR = [[-21.5, 5, 'shop', 0, 7, lampW], [-16, 5.6, 'house', 0, null], [-10.4, 5, 'shop', -0.4, 1, lampW], [-6.5, 2.6, 'kura'], [-2.4, 5, 'shop', 0.3, 0, lampR], [3.2, 5.6, 'house', 0.2, null, lampS], [8.8, 5.2, 'shop', 0, 5, lampW], [14.3, 5.4, 'kura'], [19.8, 5.2, 'farm', 0]];
  for (const [x, w, kind, door, noren, lamp] of near) house(x, NZ, w - 0.25, 1, { kind, door, noren, lamp });
  for (const [x, w, kind, door, noren, lamp] of farR) house(x, FZ, w - 0.25, -1, { kind, door, noren, lamp });
  for (let x = -40; x <= 40; x += 6.2) if (Math.abs(x) > 24) for (const [z, s] of [[NZ + 9, 1], [FZ - 9, -1]]) house(x + R() * 1.5, z, 5.4, s, { kind: R() < 0.4 ? 'farm' : 'house' }, true);   // the rows behind, plain blocks in the haze
  for (const z of [NZ, FZ]) for (const x of [-30, -36]) house(x, z, 5.6, z > 0 ? 1 : -1, { kind: 'house' }, true);
  // ---- the well, on the stall's side of the street, and its bucket
  { const wx = -6.8, wz = 2.3, ring = cyl(0.62, 0.66, 0.75, real('stone_wall', 1.4, 0x9a9488, { side: THREE.DoubleSide }), wx, 0.37, wz, city, 18, true); const ww = makeWater(0.5, mat({ color: 0x1a2426 }), { n: 20, damp: 0.99 }); ww.mesh.position.set(wx, 0.5, wz); city.add(ww.mesh); const seen = new Map(); ups.push((dt) => { for (const it of G.items) { const p = it.obj.position, was = seen.get(it) ?? 9; seen.set(it, p.y); if (Math.hypot(p.x - wx, p.z - wz) < 0.45 && was > 0.5 && p.y <= 0.52) ww.poke(p.x - wx, p.z - wz, 0.01, 0.05); } ww.update(dt); });   // the well's water, a live surface: what falls in rings it
    for (const s of [-1, 1]) box(0.12, 2.1, 0.12, darkWood, wx + s * 0.7, 1.05, wz, city); box(1.6, 0.12, 0.14, darkWood, wx, 2.1, wz, city); const pul = mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 14), darkWood, wx, 1.95, wz, city); pul.castShadow = false;
    cyl(0.006, 0.006, 1.2, thatch, wx, 1.35, wz, city, 4).castShadow = false;
    const rf = box(1.9, 0.05, 1.2, tiles, wx, 2.35, wz - 0.3, city); rf.rotation.x = 0.35; const rb = box(1.9, 0.05, 1.2, tiles, wx, 2.35, wz + 0.3, city); rb.rotation.x = -0.35; }
  // ---- the shrine at the west end: the vermilion gate over the street, stone lanterns, the steps up, its hall among the cedars
  const ver = real('wood_dark', 1.2, 0xe0583a, { grime: 0.25 }), blackM = real('wood_dark', 1.2, 0x4a4440, { grime: 0.2 });   // lacquered vermilion and black over the wood's grain
  { const tx = W0 + 2; for (const s of [-1, 1]) { cyl(0.2, 0.24, 4.4, ver, tx, 2.2, MID + s * 2.3, city, 12); cyl(0.3, 0.3, 0.3, blackM, tx, 0.15, MID + s * 2.3, city, 12); }
    box(0.5, 0.22, 6.4, ver, tx, 3.55, MID, city); const k = box(0.6, 0.3, 7.4, blackM, tx, 4.45, MID, city); k.castShadow = true; box(0.5, 0.18, 6.9, ver, tx, 4.2, MID, city);
    box(0.25, 0.7, 0.18, ver, tx, 3.95, MID, city); for (const s of [-1, 1]) { const tip = box(0.6, 0.3, 0.9, blackM, tx, 4.55, MID + s * 3.9, city); tip.rotation.x = s * 0.25; }
    for (const s of [-1, 1]) { const lz = MID + s * 3.3, lx = W0 + 4.5; box(0.5, 0.2, 0.5, stone, lx, 0.1, lz, city); cyl(0.09, 0.12, 0.8, stone, lx, 0.6, lz, city, 8); box(0.42, 0.1, 0.42, stone, lx, 1.05, lz, city); const head = box(0.3, 0.32, 0.3, stone, lx, 1.26, lz, city); head.userData.keep = false; const cap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 4), stone); cap.position.set(lx, 1.57, lz); cap.rotation.y = Math.PI / 4; city.add(cap);
      const fire = mesh(new THREE.BoxGeometry(0.2, 0.2, 0.31), lampS, lx, 1.26, lz, city); fire.castShadow = false; const h = new THREE.Sprite(lampHalos); h.position.set(lx, 1.26, lz); h.scale.set(1.2, 1.2, 1); city.add(h); }
    for (let i = 0; i < 6; i++) box(1.4, 0.2, 5, stone, W0 - 1 - i * 0.7, 0.1 + i * 0.2, MID, city);   // the steps up
    box(14, 1.4, 22, stone, W0 - 12, 0.7, MID, city);   // the shrine's terrace
    const hx = W0 - 13; box(6, 3, 5, cedar, hx, 1.4 + 1.5, MID, city); for (const sd of [-1, 1]) { const r = box(8, 0.12, 3.6, tiles, hx, 5.1, MID + sd * 1.5, city); r.rotation.x = -sd * 0.55; } box(8.1, 0.25, 0.3, ridgeM, hx, 6.05, MID, city);
    for (let i = 0; i < 4; i++) { const hz = MID + (i - 1.5) * 1.3; mesh(new THREE.PlaneGeometry(1.1, 2.2), lattice, hx + 3.01, 1.4 + 1.2, hz, city).rotation.y = Math.PI / 2; }
    lamps.push(chochin(hx + 3.4, 3.8, MID - 1.2, lampW, 1.3), chochin(hx + 3.4, 3.8, MID + 1.2, lampW, 1.3)); }
  // ---- trees: cedars and pines round the shrine and the village's edges (a trunk and its tiers, cheap)
  const bark = real('bark', 1, 0x7a5a44), needles = real('grass', 1.2, 0x3a5a3a), pineM = real('grass', 1.4, 0x4a6a3a);   // the needles' texture is the grass photograph, darkened
  const tree = (x, z, h, pine) => { cyl(0.18 * h / 8, 0.28 * h / 8, h * 0.45, bark, x, h * 0.22, z, city, 6); const n = pine ? 3 : 4; for (let i = 0; i < n; i++) { const r = (pine ? 1.6 : 1.2) * (1 - i / (n + 0.5)) * h / 8, c = mesh(new THREE.ConeGeometry(r * (pine ? 1.4 : 1), h * (pine ? 0.22 : 0.3), 7), pine ? pineM : needles, x, h * (0.42 + i * (pine ? 0.16 : 0.15)), z, city); c.rotation.y = R() * 3; c.castShadow = i === 0; } };
  for (let i = 0; i < 18; i++) tree(W0 - 4 - R() * 16, MID + (R() < 0.5 ? -1 : 1) * (6 + R() * 9), 9 + R() * 7, false);
  for (let i = 0; i < 16; i++) tree(-30 + R() * 60, (R() < 0.5 ? NZ + 15 + R() * 10 : FZ - 15 - R() * 10), 6 + R() * 6, R() < 0.5);
  // ---- the rice fields east of the village: flooded paddies between low dikes, the young rice in rows
  { const water = mat({ color: 0x5a6a6a, transparent: true, opacity: 0.72 }), dike = grass, field = real('field', 2, 0x6a5a48); const rice = [], dd = new THREE.Object3D();
    for (let px = E0 + 3; px < E0 + 60; px += 9) for (const pz of [MID - 9, MID - 18, MID + 7, MID + 16, MID - 27, MID + 25]) { const w = 8.2, d = 8.2;
      box(w, 0.06, d, field, px + w / 2, -0.17, pz, city).castShadow = false; box(w, 0.02, d, water, px + w / 2, -0.12, pz, city).castShadow = false;
      for (const s of [-1, 1]) { box(w + 0.8, 0.22, 0.4, dike, px + w / 2, -0.05, pz + s * (d / 2 + 0.2), city).castShadow = false; box(0.4, 0.22, d, dike, px + (s > 0 ? w + 0.2 : -0.2), -0.05, pz, city).castShadow = false; }
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { dd.position.set(px + 0.6 + i * 1.15, -0.12, pz - d / 2 + 0.6 + j * 1.15); dd.rotation.y = R() * 3; dd.scale.setScalar(0.8 + R() * 0.4); dd.updateMatrix(); rice.push(dd.matrix.clone()); } }
    const rg = new THREE.ConeGeometry(0.07, 0.42, 4).translate(0, 0.21, 0), im = new THREE.InstancedMesh(rg, real('grass', 0.5, 0x9ac060), rice.length); rice.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = false; im.userData.nopick = true; city.add(im); }
  // ---- the dark hills all round, and the far mountains
  const hillM = real('grass', 18, 0x4a6040, { grime: 0.5 }), farM = real('stone_wall', 30, 0x6a7480, { grime: 0.5 });
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + R() * 0.3, d = 85 + R() * 40, h = mesh(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 3 ? hillM : farM, 20 + Math.cos(a) * d, -0.5, Math.sin(a) * d, city); h.scale.set(30 + R() * 25, 14 + R() * 22, 30 + R() * 25); h.castShadow = false; h.receiveShadow = false; }
  // ---- what stands about: barrels, buckets, baskets, crates, a broom, a stump, shrubs (CC0 models)
  const gl = new GLTFLoader(); gl.setMeshoptDecoder(MeshoptDecoder); const A = '/sushi-assets/m/';
  const put = (file, spots, tint = 0xa8a8a8) => gl.loadAsync(A + file + '.glb').then((g) => { g.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: tint }); o.userData.nopick = true; o.castShadow = false; } }); for (const [x, z, ry, s] of spots) { const c = g.scene.clone(); c.position.set(x, 0, z); c.rotation.y = ry || 0; c.scale.setScalar(s || 1); city.add(c); } }).catch(() => { });
  for (const [x, z, ry, s] of [[-13.2, NZ - 0.5, 0, 1], [-12.6, NZ - 0.55, 1, 0.9], [-1.2, FZ + 0.6, 2, 1], [-0.6, FZ + 0.62, 0.4, 0.85], [11.6, FZ + 0.6, 0.5, 1], [6.2, NZ - 0.6, 3, 0.9]]) taru(city, x, z, s, ry);   // sake barrels by the sake house and the inn put('wooden_bucket_01', [[-6.2, 2.0, 0.4], [-5.9, 2.5, 1.7], [-9.6, FZ + 0.7, 0], [16.3, NZ - 0.6, 2]]);
  put('wicker_basket_01', [[5.4, NZ - 0.5, 0.2], [-16.7, FZ + 0.6, 1.1], [-14.4, FZ + 0.65, 0.4], [10.6, NZ - 0.55, 2]]); put('wooden_crate_01', [[-12.4, FZ + 0.6, 0.3], [-12.4, FZ + 0.6, 0.1, 0.9], [12.5, NZ - 0.55, 1.2]], 0x9a9088); put('wooden_broom', [[-4.4, NZ - 0.3, 1.6]]);
  put('tree_stump_01', [[23.8, NZ - 1.5, 0], [W0 + 6, FZ + 0.8, 2]]); put('shrub_02', [[-23.6, NZ - 0.6, 0], [-18.4, FZ + 0.6, 1], [17.6, NZ - 0.6, 2], [23.2, FZ + 0.8, 3], [W0 + 3.4, NZ - 0.4, 1], [W0 + 3.4, FZ + 0.5, 2]], 0x8a9a80);
  // ---- the light: the sun across the sky, the moon at night, the hemisphere's fill, the sky dome and its stars; and the village's lanterns
  const fill = new THREE.HemisphereLight(0xbcd0ec, 0x6a5a40, 1.05); scene.add(fill);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 80 }); sun.shadow.bias = -0.0015; scene.add(sun, sun.target);
  sun.shadow.camera.layers.set(2); sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true; let shT = 0; ups.push((dt) => { if ((shT -= dt) <= 0) { shT = 1; sun.shadow.needsUpdate = true; } });   // the sun's (and the moon's) shadows are the still village's (layer 2), laid again once a second as the light creeps; what moves takes its shadows from the lanterns near the stall
  const moon = sun;
  const skyG = new THREE.SphereGeometry(400, 24, 12), skyC = new Float32Array(skyG.attributes.position.count * 3); skyG.setAttribute('color', new THREE.BufferAttribute(skyC, 3));
  const sky = new THREE.Mesh(skyG, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -10; sky.userData.nopick = true; sky.userData.dyn = true; sky.frustumCulled = false; scene.add(sky);
  const disc = (c, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: c, fog: false, depthWrite: false, transparent: true })); m.scale.set(s, s, 1); m.renderOrder = -9; scene.add(m); return m; };
  const sunDisc = disc(0xfff0d0, 60), moonDisc = disc(0xdfe8ff, 26);
  const nS = 420, sp = new Float32Array(nS * 3); for (let i = 0; i < nS; i++) { const a = R() * Math.PI * 2, e = 0.12 + R() * 1.35, r = 380; sp.set([Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); stars.renderOrder = -9; stars.frustumCulled = false; scene.add(stars);
  const lampLights = [[-2.4, 2.6, FZ + 1.2], [9, 2.6, NZ - 1.3], [-15, 2.6, NZ - 1.3]].map(([x, y, z]) => { const p = new THREE.PointLight(0xffa860, 0, 12, 1.6); p.position.set(x, y, z); scene.add(p); return p; });
  const _mp = new THREE.Vector3(), zen = new THREE.Color(), hor = new THREE.Color(), fogC = new THREE.Color(), sc = new THREE.Color(), tmp = new THREE.Color(), tmp2 = new THREE.Color();
  const mix = (i, a, b, f) => tmp.set(a).lerp(tmp2.set(b), f);
  let lit = 0, skyT = 9, ease = true;
  const look = (h) => { let i = SKY.findIndex((k) => k[0] > h); if (i < 0) i = SKY.length - 1; if (i === 0) i = 1; const a = SKY[i - 1], b = SKY[i], f = clamp((h - a[0]) / (b[0] - a[0]), 0, 1); const v = (j) => a[j] + (b[j] - a[j]) * f, c = (j, out) => out.set(a[j]).lerp(tmp2.set(b[j]), f);
    return { zen: c(1, zen), hor: c(2, hor), fog: c(3, fogC), sunC: c(4, sc), sun: v(5), hs: c(6, new THREE.Color()), hg: c(7, new THREE.Color()), fill: v(8) }; };
  const paint = () => { const K = G.clock, h = K ? K.hour : 11, L = look(h), dark = 1 - (K ? K.light : 1);
    const dawn = h > 28.7 && h < 31.5 ? clamp(1 - Math.abs(h - 30.1) / 1.4, 0, 1) : 0;   // the first light: a pale glow low in the east (+x, where the sun comes up) before the sun is up
    const p = skyG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 400, k = clamp(y * 2.2, 0, 1); tmp.copy(L.hor).lerp(L.zen, Math.sqrt(k)); if (y < 0) tmp.copy(L.hor).multiplyScalar(0.6);
      if (dawn > 0) { const x = p.getX(i), e = Math.max(0, x / (Math.hypot(x, p.getZ(i)) || 1)); const gl = dawn * e * e * (1 - Math.sqrt(k)) * 0.85; if (gl > 0) tmp.lerp(tmp2.set(0xf2c08a), gl); }
      skyC.set([tmp.r, tmp.g, tmp.b], i * 3); } skyG.attributes.color.needsUpdate = true;
    if (scene.fog) scene.fog.color.copy(L.fog); scene.background = L.fog.clone(); if (scene.fog) scene.fog.density = 0.009 + dark * 0.014;
    const a = ((h - 6) / 12) * Math.PI, sy = Math.sin(a), sx = Math.cos(a); sun.position.set(sx * 30, Math.max(2, sy * 32), -14); sun.target.position.set(0, 0, 0); sun.color.copy(L.sunC); sun.intensity = sy > 0 ? L.sun : 0;
    sunDisc.position.set(sx * 360, sy * 360, -170); sunDisc.visible = sy > -0.05; sunDisc.material.color.copy(L.sunC).lerp(tmp2.set(0xffffff), 0.4);
    const ma = ((h - 19) / 11) * Math.PI; moonDisc.position.set(-Math.cos(ma) * 340, Math.sin(ma) * 300 + 30, 160); moonDisc.material.opacity = clamp(dark * 1.2, 0, 1); const f = clamp((0.1 - sy) / 0.25, 0, 1); if (f > 0) { _mp.copy(moonDisc.position).normalize().multiplyScalar(30); _mp.y = Math.max(8, _mp.y); sun.position.lerp(_mp, f); sun.color.lerp(tmp2.set(0x9ab0e8), f); sun.intensity = sun.intensity * (1 - f) + clamp(dark * 1.1, 0, 1) * 0.9 * f; }   // by night the same light is the moon's: its soft shadows, no second shadow map
    stars.material.opacity = clamp((dark - 0.6) / 0.4, 0, 1) * 0.8;
    fill.color.copy(L.hs); fill.groundColor.copy(L.hg); fill.intensity = L.fill * (S.easy ? 1.25 : 1); };
  paint();
  ups.push((dt) => {
    const K = G.clock, hr = K ? K.hour : 11, want = hr >= 17.8 && hr < 29 ? 1 : hr >= 29 && hr < 30.2 ? clamp((30.2 - hr) / 1.2, 0, 1) : 0;   // the lamps are lit as the sun goes, and burn down one by one through the dawn
    lit += clamp(want - lit, -dt / 4, dt / 4); const e = S.easy ? 0.6 : 1;
    for (const m of lampMats) m.emissiveIntensity = lit * 1.6 * e; lampHalos.opacity = lit * 0.32 * e; lampLights.forEach((l) => (l.intensity = lit * 3.2));
    if (G.cart && G.cart.lamps) G.cart.lamps(lit);
    if ((skyT -= dt) <= 0) { skyT = 0.25; paint(); } });
  S.easy = !!(G.set && G.set.easy); city.setEasy = (on) => { S.easy = on; paint(); };
  // where the village's people stop: the sake house's door, the tofu maker's, the teahouse, the road out east, a house's step, the shrine gate
  const P = (x, z) => new THREE.Vector3(x, 0, z), shops = [{ type: 'bar', open: true, p: P(-2.1, FZ + 1.2) }, { type: 'kitchen', open: true, p: P(8.2, NZ - 1.2) }, { type: 'stage', open: true, p: P(-10.8, FZ + 1.2) }, { type: 'corner', open: true, p: P(E0 - 2.5, -3.6) }, { type: 'stoop', open: true, p: P(-14.6, NZ - 1.3) }, { type: 'fence', open: true, p: P(W0 + 6, -2.8) }];
  const block = buildBlock(city, shops, { near: -2.6, far: -4.2, split: -3.4, end: E0 + 4, dead: true }); ups.push((dt, t) => block.update(dt, t));
  return { group: city, shops, glow, fill, sun, moon, lamps, alley: true, setEasy(on) { S.easy = on; paint(); }, update(dt, t) { for (const u of ups) u(dt, t); }, halo, rain: null, cars: [], glowMap, bakeFar() { }, reflect() { } };
}
