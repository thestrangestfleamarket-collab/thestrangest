// the village where the stall stands, Japan in the 1860s: a dirt street between two rows of wooden machiya under tiled roofs, noren at the shop doors, paper lanterns, a well, the shrine's gate at the west end, rice fields and dark hills to the east; its sky, sun, moon and lamps follow the run's clock (clock.js)
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, clamp } from './ctx.js';
import * as T from './tex.js';
import { buildBlock } from './block.js';
import { taru } from './models.js';
import { makeWater } from './ripple.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { buildSky } from './sky.js';
import * as E from './ephem.js';
import { AIR } from './air.js';
import { weatherAt } from './weather.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const FOG = 0xb8c4cc;
export function buildAlley(scene, o = {}) {
  const rich = !!o.rich;   // a screen: the richer path (a wider, softer sun shadow); a headset: the lean one
  const city = new THREE.Group(); scene.add(city); const glow = new THREE.Group(); city.add(glow); const ups = [], R = T.rng(1862);
  const glowMap = T.glowTex(), S = { easy: true };
  const halo = (color, size, x, y, z, parent = glow, op = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op, fog: true })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); s.userData.nopick = true; return s; };
  const real = (n, size, color = 0xffffff, o = {}) => T.surface(T.worldUV(mat({ map: T.photo(n), color, side: o.side }), size), { bomb: o.bomb ?? 1, grime: o.grime ?? 0.3, band: o.band ?? 0.8, scale: 0.6, worn: o.worn ?? 0 }), flat = (c, o = {}) => mat({ color: c, ...o });
  const NZ = 3.4, FZ = -5.6, MID = (NZ + FZ) / 2, W0 = -26, E0 = 26;
  // ---- the ground: the street's packed dirt, grass beyond the houses, the path out between the fields
  const dirt = real('dirt', 3.2, 0xa89880, { grime: 0.2 }), grass = real('grass', 3, 0x8a9a70), mud = real('mud', 2.6, 0x8a7a68);
  box(160, 0.4, 140, grass, 20, -0.21, 0, city).castShadow = false;
  { const fg = new THREE.CircleGeometry(430, 48).rotateX(-Math.PI / 2), fm = mesh(fg, real('grass', 6, 0x8a9468, { grime: 0.1 }), 20, -0.24, 0, city); fm.castShadow = false; fm.receiveShadow = false; fm.userData.nopick = true; }   // the plain out to the hills
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
  const norenM = NOREN.map(([c, k]) => { const t = T.canvasTex(256, 128, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#efe8d8'; g.font = `bold ${k.length > 1 ? 70 : 90}px ${T.JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k, w / 2, h / 2 + 4); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = w / 3; x < w; x += w / 3) g.fillRect(x - 1, 0, 3, h); }); T.dirty(t, 3 + k.length, { stains: 10, fade: 1 }); return T.sway(mat({ map: t, side: THREE.DoubleSide }), 'cloth'); });   // (they move in the wind)
  // the lamps: every paper lantern in the village shares a few materials whose light comes up together at dusk and goes at dawn (steadily: nothing flickers)
  // every lamp's and fire's glow in the air is one drawing of camera-facing cards: larger and softer the thicker the air (mist, rain), fading into the haze with distance
  const HU = { map: { value: glowMap }, color: { value: new THREE.Color(0xffa860) }, opacity: { value: 0 }, grow: { value: 1 }, fogD: { value: 0.006 } };
  const haloM = new THREE.ShaderMaterial({ uniforms: HU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: 'uniform float grow; varying vec2 vUv; varying float vD; void main(){ vec4 c = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); float s = length(instanceMatrix[0].xyz) * grow; c.xy += position.xy * s; vUv = uv; vD = -c.z; gl_Position = projectionMatrix * c; }',
    fragmentShader: 'uniform sampler2D map; uniform vec3 color; uniform float opacity, fogD; varying vec2 vUv; varying float vD; void main(){ vec4 t = texture2D(map, vUv); float f = exp(-fogD * vD * 0.8); gl_FragColor = vec4(color * t.rgb * t.a * opacity * f, 1.0); }' });
  const haloAt = [], haloIM = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), haloM, 64); haloIM.count = 0; haloIM.frustumCulled = false; haloIM.userData.nopick = true; haloIM.castShadow = haloIM.receiveShadow = false; city.add(haloIM);
  const _hm = new THREE.Matrix4(), haloSet = (i, x, y, z, size) => { _hm.makeScale(size, size, size).setPosition(x, y, z); haloIM.setMatrixAt(i, _hm); haloIM.instanceMatrix.needsUpdate = true; };
  const addHalo = (x, y, z, size) => { const i = haloIM.count++; haloAt.push(size); haloSet(i, x, y, z, size); return i; };
  const lampMats = [];
  const paper = (bg, ink, txt) => { const t = T.canvasTex(128, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let y = 8; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } if (txt) { g.fillStyle = ink; g.font = `bold 54px ${T.JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 4, h / 2); g.fillText(txt, (w * 3) / 4, h / 2); } }); const m = mat({ map: t, emissiveMap: t, emissive: 0xffb070, emissiveIntensity: 0 }); m.userData.lamp = 1; lampMats.push(m); return m; };
  const lampW = paper('#efe4c8', '#1a1a1a', '提灯'.slice(0, 1)), lampR = paper('#c8301c', '#140404', '祭'), lampS = paper('#e8dcc0', '#1a1a1a', '');
  const chochin = (x, y, z, m = lampW, s = 1) => ({ x, y: y + 0.34 * s, z, m, s });   // a lantern hung from its cord's top (drawn all together below, so it swings in the wind at no cost in draws)
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
      const fire = mesh(new THREE.BoxGeometry(0.2, 0.2, 0.31), lampS, lx, 1.26, lz, city); fire.castShadow = false; addHalo(lx, 1.26, lz, 1.2); }
    for (let i = 0; i < 6; i++) box(1.4, 0.2, 5, stone, W0 - 1 - i * 0.7, 0.1 + i * 0.2, MID, city);   // the steps up
    box(14, 1.4, 22, stone, W0 - 12, 0.7, MID, city);   // the shrine's terrace
    const hx = W0 - 13; box(6, 3, 5, cedar, hx, 1.4 + 1.5, MID, city); for (const sd of [-1, 1]) { const r = box(8, 0.12, 3.6, tiles, hx, 5.1, MID + sd * 1.5, city); r.rotation.x = -sd * 0.55; } box(8.1, 0.25, 0.3, ridgeM, hx, 6.05, MID, city);
    for (let i = 0; i < 4; i++) { const hz = MID + (i - 1.5) * 1.3; mesh(new THREE.PlaneGeometry(1.1, 2.2), lattice, hx + 3.01, 1.4 + 1.2, hz, city).rotation.y = Math.PI / 2; }
    lamps.push(chochin(hx + 3.4, 3.8, MID - 1.2, lampW, 1.3), chochin(hx + 3.4, 3.8, MID + 1.2, lampW, 1.3)); }
  // ---- the lanterns, drawn together: the paper of each kind and the black caps and cords, one instanced drawing each, every one turned about its cord's top as the wind swings it
  const lampG = new THREE.SphereGeometry(0.17, 12, 8).scale(1, 1.35, 1).translate(0, -0.34, 0), capG = mergeGeometries([new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10).translate(0, -0.58, 0), new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10).translate(0, -0.1, 0), new THREE.CylinderGeometry(0.004, 0.004, 0.1, 4).translate(0, -0.05, 0)]);
  const lampSets = [...new Set(lamps.map((L) => L.m))].map((m) => ({ list: lamps.filter((L) => L.m === m), im: null, m })); lampSets.push({ list: lamps, m: ridgeM, g: capG });
  for (const S of lampSets) { S.im = new THREE.InstancedMesh(S.g || lampG, S.m, S.list.length); S.im.castShadow = false; S.im.receiveShadow = true; S.im.userData.nopick = true; city.add(S.im); }
  for (const L of lamps) L.h = addHalo(L.x, L.y - 0.34 * L.s, L.z, 1.6 * L.s);
  const _le = new THREE.Euler(), _lq = new THREE.Quaternion(), _lp = new THREE.Vector3(), _ls = new THREE.Vector3(), _lv = new THREE.Vector3(), _lm = new THREE.Matrix4();
  const swing = (t) => { const wk = G.wind ?? 0.3; lamps.forEach((L, i) => { _le.set(Math.sin(t * 1.1 + i * 2.3) * 0.035 * wk, 0, Math.sin(t * 1.6 + i * 1.7) * 0.05 * wk + 0.03 * wk); L.q = _lq.setFromEuler(_le); L.mx = _lm.compose(_lp.set(L.x, L.y, L.z), _lq, _ls.setScalar(L.s)).clone(); });
    for (const S of lampSets) { S.list.forEach((L, i) => S.im.setMatrixAt(i, L.mx)); S.im.instanceMatrix.needsUpdate = true; }
    for (const L of lamps) { _lv.set(0, -0.34, 0).applyMatrix4(L.mx); haloSet(L.h, _lv.x, _lv.y, _lv.z, 1.6 * L.s); } };
  swing(0); for (const S of lampSets) S.im.computeBoundingSphere();
  // ---- trees: cedars and pines round the shrine and the village's edges (a trunk and its tiers, cheap)
  const bark = real('bark', 1, 0x7a5a44), needles = T.sway(real('grass', 1.2, 0x3a5a3a), 'tree'), pineM = T.sway(real('grass', 1.4, 0x4a6a3a), 'tree');   // the needles' texture is the grass photograph, darkened
  const tree = (x, z, h, pine) => { cyl(0.18 * h / 8, 0.28 * h / 8, h * 0.45, bark, x, h * 0.22, z, city, 6); const n = pine ? 3 : 4; for (let i = 0; i < n; i++) { const r = (pine ? 1.6 : 1.2) * (1 - i / (n + 0.5)) * h / 8, c = mesh(new THREE.ConeGeometry(r * (pine ? 1.4 : 1), h * (pine ? 0.22 : 0.3), 7), pine ? pineM : needles, x, h * (0.42 + i * (pine ? 0.16 : 0.15)), z, city); c.rotation.y = R() * 3; c.castShadow = i === 0; } };
  for (let i = 0; i < 18; i++) tree(W0 - 4 - R() * 16, MID + (R() < 0.5 ? -1 : 1) * (6 + R() * 9), 9 + R() * 7, false);
  for (let i = 0; i < 16; i++) tree(-30 + R() * 60, (R() < 0.5 ? NZ + 15 + R() * 10 : FZ - 15 - R() * 10), 6 + R() * 6, R() < 0.5);
  const paddyW = mat({ color: 0x3a4848, emissive: 0x8aa0b8, emissiveIntensity: 0.4, transparent: true, opacity: 0.82 });   // (the paddies' water shows the sky: its glow is the sky's colour, set with the light below)
  // ---- the rice fields east of the village: flooded paddies between low dikes, the young rice in rows
  { const water = paddyW, dike = grass, field = real('field', 2, 0x6a5a48); const rice = [], dd = new THREE.Object3D();
    for (let px = E0 + 3; px < E0 + 60; px += 9) for (const pz of [MID - 9, MID - 18, MID + 7, MID + 16, MID - 27, MID + 25]) { const w = 8.2, d = 8.2;
      box(w, 0.06, d, field, px + w / 2, 0.0, pz, city).castShadow = false; box(w, 0.02, d, water, px + w / 2, 0.05, pz, city).castShadow = false;
      for (const s of [-1, 1]) { box(w + 0.8, 0.22, 0.4, dike, px + w / 2, 0.06, pz + s * (d / 2 + 0.2), city).castShadow = false; box(0.4, 0.22, d, dike, px + (s > 0 ? w + 0.2 : -0.2), 0.06, pz, city).castShadow = false; }
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { dd.position.set(px + 0.6 + i * 1.15, 0.04, pz - d / 2 + 0.6 + j * 1.15); dd.rotation.y = R() * 3; dd.scale.setScalar(0.8 + R() * 0.4); dd.updateMatrix(); rice.push(dd.matrix.clone()); } }
    const rg = (() => { const p = [], RR = T.rng(7); for (let b = 0; b < 6; b++) { const a = (b / 6) * Math.PI * 2 + RR() * 0.5, lean = 0.05 + RR() * 0.07, h = 0.28 + RR() * 0.14, w = 0.012, ca = Math.cos(a), sa = Math.sin(a); p.push(-sa * w, 0, ca * w, sa * w, 0, -ca * w, ca * lean, h, sa * lean); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((p.length / 3) * 2).fill(0), 2)); g.computeVertexNormals(); return g; })();   // a tuft of young rice: six thin blades leaning out
    const im = new THREE.InstancedMesh(rg, T.sway(mat({ color: 0x6e9a3a, side: THREE.DoubleSide }), 'grass'), rice.length); rice.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = false; im.userData.nopick = true; city.add(im); }
  // ---- the hills all round in three ridges, each further one bluer in the haze (air.js), lower to the west-south-west where Fuji stands far off over the plain, snow on its top
  { const hillM = real('grass', 22, 0xffffff, { grime: 0.15 }); hillM.vertexColors = true; const FUJI = 247 * Math.PI / 180, wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a)), c0 = new THREE.Color(), c1 = new THREE.Color();
    const ridge = (r0, depth, h0, h1, lo, hi, seed, N = 160) => { const pos = [], col = [], idx = [], ph = [1, 2, 3, 5, 7, 11, 17, 29, 47, 83].map((k) => [k, R() * 6.28, k > 20 ? 0.09 : 1 / Math.sqrt(k)]);   // (the high ones: the treeline's ragged top)
      const H = (a) => { let v = 0, n = 0; for (const [k, p, w] of ph) { v += Math.sin(k * a + p + seed) * w; n += w; } const dip = 1 - 0.72 * Math.exp(-((wrap(a - FUJI) / 0.42) ** 2)); return (h0 + (h1 - h0) * (0.5 + 0.5 * v / n * 1.6)) * dip; };
      const rows = [[0, -2, 0.25], [0.45, 0.7, 0.55], [1, 1, 1], [1.7, 0.45, 0.8]];
      for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI * 2, h = Math.max(1, H(a)), sx = Math.sin(a), sz = Math.cos(a);
        for (const [dr, fh, cb] of rows) { const r = r0 + depth * dr, y = fh < 0 ? -2 : h * fh; pos.push(20 + sx * r, y, sz * r); c0.setHex(lo).lerp(c1.setHex(hi), cb * (0.75 + 0.25 * R())); col.push(c0.r, c0.g, c0.b); } }
      for (let i = 0; i < N; i++) for (let j = 0; j < 3; j++) { const a = i * 4 + j, b = a + 4; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, hillM); m.castShadow = m.receiveShadow = false; m.userData.nopick = true; city.add(m); };
    ridge(105, 30, 7, 20, 0x1e2a18, 0x3a4a2c, 0.3); ridge(165, 40, 14, 32, 0x2a3830, 0x4a5a4a, 1.7); ridge(240, 55, 22, 48, 0x3a4652, 0x5a6672, 3.1);
    // Fuji: a long concave cone, snow over the top third with a ragged edge
    const prof = []; for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(Math.max(4, 82 * Math.pow(1 - t, 1.7)), t * 34)); } const fg = new THREE.LatheGeometry(prof, 48), fp = fg.attributes.position, fc = [];
    for (let i = 0; i < fp.count; i++) { const y = fp.getY(i), a = Math.atan2(fp.getZ(i), fp.getX(i)), snow = y > 34 * (0.62 + 0.07 * Math.sin(a * 7) + 0.05 * Math.sin(a * 13 + 1)); c0.setHex(snow ? 0xe8ecf2 : 0x4a5868); fc.push(c0.r, c0.g, c0.b); }
    fg.setAttribute('color', new THREE.Float32BufferAttribute(fc, 3)); const fm = new THREE.Mesh(fg, mat({ vertexColors: true })); fm.position.set(20 + Math.sin(FUJI) * 340, -3, Math.cos(FUJI) * 340); fm.castShadow = fm.receiveShadow = false; fm.userData.nopick = true; city.add(fm); }
  // ---- what stands about: barrels, buckets, baskets, crates, a broom, a stump, shrubs (CC0 models)
  const gl = new GLTFLoader(); gl.setMeshoptDecoder(MeshoptDecoder); const A = '/sushi-assets/m/';
  const put = (file, spots, tint = 0xa8a8a8) => gl.loadAsync(A + file + '.glb').then((g) => { g.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: tint }); o.userData.nopick = true; o.castShadow = false; } }); for (const [x, z, ry, s] of spots) { const c = g.scene.clone(); c.position.set(x, 0, z); c.rotation.y = ry || 0; c.scale.setScalar(s || 1); city.add(c); } }).catch(() => { });
  for (const [x, z, ry, s] of [[-13.2, NZ - 0.5, 0, 1], [-12.6, NZ - 0.55, 1, 0.9], [-1.2, FZ + 0.6, 2, 1], [-0.6, FZ + 0.62, 0.4, 0.85], [11.6, FZ + 0.6, 0.5, 1], [6.2, NZ - 0.6, 3, 0.9]]) taru(city, x, z, s, ry);   // sake barrels by the sake house and the inn put('wooden_bucket_01', [[-6.2, 2.0, 0.4], [-5.9, 2.5, 1.7], [-9.6, FZ + 0.7, 0], [16.3, NZ - 0.6, 2]]);
  put('wicker_basket_01', [[5.4, NZ - 0.5, 0.2], [-16.7, FZ + 0.6, 1.1], [-14.4, FZ + 0.65, 0.4], [10.6, NZ - 0.55, 2]]); put('wooden_crate_01', [[-12.4, FZ + 0.6, 0.3], [-12.4, FZ + 0.6, 0.1, 0.9], [12.5, NZ - 0.55, 1.2]], 0x9a9088); put('wooden_broom', [[-4.4, NZ - 0.3, 1.6]]);
  put('tree_stump_01', [[23.8, NZ - 1.5, 0], [W0 + 6, FZ + 0.8, 2]]); put('shrub_02', [[-23.6, NZ - 0.6, 0], [-18.4, FZ + 0.6, 1], [17.6, NZ - 0.6, 2], [23.2, FZ + 0.8, 3], [W0 + 3.4, NZ - 0.4, 1], [W0 + 3.4, FZ + 0.5, 2]], 0x8a9a80);
  // ---- the light, after THE MARKET's: the real sun and moon over Edo on the run's clock (sky.js, ephem.js), the light from whichever is up and its shadows, the hemisphere's fill by the sky's colour, the air's haze and mist (air.js) by the hour and the weather (weather.js); and the village's lanterns and braziers
  const fill = new THREE.HemisphereLight(0xbcd0ec, 0x6a5a40, 1.05); scene.add(fill);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.castShadow = true; const SH = rich ? 14 : 10; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 1, far: 90 }); sun.shadow.bias = -0.0012; sun.shadow.normalBias = 0.02; sun.shadow.radius = rich ? 2 : 1.2; scene.add(sun, sun.target);
  sun.shadow.camera.layers.set(2); sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true; let shT = 0; ups.push((dt) => { if ((shT -= dt) <= 0) { shT = 3; sun.shadow.needsUpdate = true; } });   // the sun's (and the moon's) shadows are the still village's (layer 2, only its larger things), laid again every three seconds as the light creeps; what moves takes its shadows from the lanterns near the stall
  const moon = sun, sky = buildSky(scene);
  // the day the run is set on: 11 May 1862 (Bunkyū 2), in Edo's own time, the young rice just planted and the moon two days from full; the clock's hours run true through the day and the dusk, and the night is drawn so the sun comes up as the dawn's light does (clock.js: dawn 29 to 30.5)
  const BASE = Date.UTC(1862, 4, 11) - (E.LON / 15) * 3600e3, R0 = (() => { for (let h = 3; h < 8; h += 0.01) if (E.seen('sun', E.jdOf(BASE + (24 + h) * 3600e3)).alt > -0.83) return 24 + h; return 29; })();
  const realH = (h) => (h <= 19.5 ? h : h <= 29 ? 19.5 + ((h - 19.5) * (R0 - 1.15 - 19.5)) / 9.5 : R0 - 1.15 + (h - 29));
  city.jd = (h) => E.jdOf(BASE + realH(h) * 3600e3);
  const lampLights = [[-4.6, 1.75, FZ + 0.8], [10.6, 1.75, NZ - 0.85], [-16.9, 1.75, NZ - 0.85]].map(([x, y, z]) => { const p = new THREE.PointLight(0xff9a48, 0, 13, 1.6); p.position.set(x, y + 0.25, z); scene.add(p); return p; });
  // the braziers (kagaribi): an iron basket of pine on three legs, its fire a slow breath (never a flicker), its smoke going up into the haze
  const flameT = T.canvasTex(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); for (const [c, k] of [['rgba(255,120,30,0.55)', 1], ['rgba(255,190,90,0.7)', 0.62], ['rgba(255,240,200,0.9)', 0.3]]) { g.fillStyle = c; g.beginPath(); g.moveTo(w / 2, h * (1 - 0.95 * k) ); g.bezierCurveTo(w / 2 + w * 0.42 * k, h * (1 - 0.55 * k), w / 2 + w * 0.46 * k, h * 0.96, w / 2, h * 0.98); g.bezierCurveTo(w / 2 - w * 0.46 * k, h * 0.96, w / 2 - w * 0.42 * k, h * (1 - 0.55 * k), w / 2, h * (1 - 0.95 * k)); g.fill(); } }), flameG = new THREE.PlaneGeometry(0.42, 0.62).translate(0, 0.27, 0);
  const iron = mat({ color: 0x2a2622 }), fireM = new THREE.MeshBasicMaterial({ map: flameT, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true }), smokeT = T.smokeTex(), braz = [];
  lampLights.forEach((l, i) => { const { x, z } = l.position, g = new THREE.Group(); g.position.set(x, 0, z); city.add(g);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2, leg = cyl(0.025, 0.03, 1.62, iron, Math.cos(a) * 0.2, 0.78, Math.sin(a) * 0.2, g, 6); leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); }
    cyl(0.26, 0.17, 0.3, iron, 0, 1.68, 0, g, 10, true).material = mat({ color: 0x2a2622, side: THREE.DoubleSide }); cyl(0.2, 0.2, 0.06, darkWood, 0, 1.6, 0, g, 8);
    const fl = new THREE.Group(); fl.position.set(0, 1.7, 0); fl.userData.dyn = true; g.add(fl); for (let k = 0; k < 3; k++) { const c = mesh(flameG, fireM, 0, 0, 0, fl); c.rotation.y = (k / 3) * Math.PI; c.castShadow = c.receiveShadow = false; c.userData.nopick = true; }
    addHalo(x, 1.95, z, 2.6);
    const puffs = []; for (let k = 0; k < 4; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeT, color: 0x6a6460, transparent: true, opacity: 0, depthWrite: false, fog: true })); s.userData = { t: k / 4, nopick: true }; g.add(s); puffs.push(s); }
    braz.push({ fl, puffs, ph: i * 2.1, l }); });
  const _mp = new THREE.Vector3(), fogC = new THREE.Color(), tmp = new THREE.Color(), tmp2 = new THREE.Color(), MOONC = new THREE.Color(0x9ab0e8), NIGHTF = new THREE.Color(0x5468a0), DAYF = new THREE.Color(0xbcd0ec), EARTH = new THREE.Color(0x6a5a40);
  let lit = 0, skyT = 0, wet = 0, lastH = -1; const api = {};
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const paint = () => { const K = G.clock, h = K ? K.hour : 11, w = G.weather ? G.weather.now : weatherAt(K ? K.frac : 0), jd = city.jd(h);
    const Sk = sky.set(jd, w, null), e = Sk.e, day = sm(-10, 8, e);   // (the twilight counts: the dawn brightens the street before the sun is up)
    // the air's colour: the horizon's, greyed (more under cloud and in the mist), as THE MARKET's haze
    const l = Sk.horizon.r * 0.3 + Sk.horizon.g * 0.59 + Sk.horizon.b * 0.11; fogC.copy(Sk.horizon).lerp(tmp.setRGB(l, l, l), 0.3 + 0.35 * w.cloud + 0.2 * w.mist); fogC.lerp(tmp.copy(Sk.zen).lerp(Sk.horizon, 0.55), 0.22 * day * (1 - w.cloud));   // by day the far air goes bluer, toward the sky's own
    if (scene.fog) { scene.fog.color.copy(fogC); scene.fog.density = 0.0068 + 0.004 * (1 - day) + 0.014 * (G.rainK || 0) + 0.006 * w.mist; } scene.background = fogC;
    AIR.mist[0] = 0.003 + 0.03 * w.mist + 0.012 * (1 - day) + 0.01 * (G.rainK || 0); AIR.mist[1] = 1 / (1.8 + 2.4 * w.mist); AIR.mist[2] = -0.1;
    HU.fogD.value = scene.fog ? scene.fog.density : 0.006; HU.grow.value = 1 + 0.8 * w.mist + 1.5 * (G.rainK || 0);   // the lamps' glow spreads in damp air
    sky.U.uFogC.value.copy(fogC); sky.U.uFogK.value = 0.5 + 0.4 * w.mist;
    // the light: the sun's while it is up, the moon's after (the same light, so one shadow map), passing between them through the twilight
    const f = sm(1, -5, e), sunK = sm(-1, 9, e) * 2.7 * (1 - 0.6 * clamp((w.cloud - 0.25) / 0.7, 0, 1)), mk = (1 - sm(-4, 2, e)) * clamp((Sk.moonAlt + 2) / 12, 0, 1) * (0.25 + 0.75 * Sk.moonLit) * (1 - 0.55 * clamp((w.cloud - 0.3) / 0.6, 0, 1));
    _mp.copy(Sk.sunDir).lerp(Sk.moonDir, f); _mp.y = Math.max(0.12, _mp.y); _mp.normalize(); sun.position.copy(_mp).multiplyScalar(40); sun.target.position.set(0, 0, 0);
    sun.color.copy(Sk.sunC).lerp(MOONC, f); sun.intensity = sunK * (1 - f) + 1.15 * mk * f;
    AIR.sun[0] = _mp.x; AIR.sun[1] = _mp.y; AIR.sun[2] = _mp.z; const glow = sm(-3, 3, e) * (0.35 + 0.65 * (1 - clamp((e - 5) / 25, 0, 1))) * 0.22 * (1 - 0.7 * w.cloud);
    tmp.copy(Sk.sunC).multiplyScalar(glow).lerp(tmp2.copy(MOONC).multiplyScalar(0.03 * mk), f); AIR.sunC[0] = tmp.r; AIR.sunC[1] = tmp.g; AIR.sunC[2] = tmp.b;
    fill.color.copy(NIGHTF).lerp(DAYF, day).lerp(Sk.sunC, 0.22 * day * (1 - clamp(e / 20, 0, 1))).lerp(tmp2.setRGB(0.6, 0.62, 0.66), 0.3 * w.cloud * day); fill.groundColor.copy(EARTH).multiplyScalar(0.25 + 0.75 * day);
    fill.intensity = (0.9 + 0.42 * day + 0.3 * mk) * (S.easy ? 1.2 : 1);
    if (G.renderer) G.renderer.toneMappingExposure = 1.15 + 0.7 * (1 - day);   // the eye opens in the dark: night dark but readable
    paddyW.emissive.copy(Sk.zen).lerp(Sk.horizon, 0.5).lerp(fogC, 0.3); paddyW.emissiveIntensity = 0.3 + 0.45 * day;
    if (G.weather) G.weather.rain.material.color.setHex(0x8a98a8).multiplyScalar(0.16 + 0.84 * day + 0.25 * lit);
    api.sky = { e: +e.toFixed(2), day: +day.toFixed(3), moon: +mk.toFixed(3), sun: +sun.intensity.toFixed(3), hour: +h.toFixed(2) }; lastH = h; };
  paint();
  ups.push((dt, t) => {
    const K = G.clock, hr = K ? K.hour : 11, want = hr >= 17.8 && hr < 29 ? 1 : hr >= 29 && hr < 30.2 ? clamp((30.2 - hr) / 1.2, 0, 1) : 0;   // the lamps are lit as the sun goes, and burn down one by one through the dawn
    lit += clamp(want - lit, -dt / 4, dt / 4); const e = S.easy ? 0.6 : 1;
    for (const m of lampMats) m.emissiveIntensity = lit * 1.6 * e; HU.opacity.value = lit * 0.32 * e; fireM.opacity = lit * 0.7 * e;
    braz.forEach((b, i) => { const br = 1 + 0.05 * Math.sin(t * 0.9 + b.ph) + 0.03 * Math.sin(t * 0.37 + b.ph * 2); b.l.intensity = lit * 3.4 * br; b.fl.scale.set(1, br * (0.6 + 0.4 * lit), 1); b.fl.visible = lit > 0.02;   // a slow breath: nothing flickers
      for (const s of b.puffs) { const u = s.userData; u.t += dt * 0.09; if (u.t > 1) u.t -= 1; const k = u.t, wd = (G.wind ?? 0.3) * 2.4; s.position.set(k * k * wd, 2.0 + k * 3.4, k * 0.3); const sc = 0.5 + k * 2.2; s.scale.set(sc, sc, 1); s.material.opacity = Math.sin(k * Math.PI) * 0.16 * lit; } });
    swing(t);   // the lanterns swing a little on their cords
    wet += clamp(clamp((G.rainK || 0) / 0.2, 0, 1) - wet, -dt / 300, dt / 60); T.SURF.wet.value = wet;   // the ground darkens as it rains and dries slowly after
    if (G.cart && G.cart.lamps) G.cart.lamps(lit);
    sky.update(dt, G.renderer && G.renderer.xr.isPresenting ? 1.5 : 1);
    if ((skyT -= dt) <= 0 || Math.abs((G.clock ? G.clock.hour : 11) - lastH) > 0.05) { skyT = 0.25; paint(); } });   // (at once when the clock jumps: a guest joining, a new run)
  S.easy = !!(G.set && G.set.easy); city.setEasy = (on) => { S.easy = on; paint(); };
  // where the village's people stop: the sake house's door, the tofu maker's, the teahouse, the road out east, a house's step, the shrine gate
  const P = (x, z) => new THREE.Vector3(x, 0, z), shops = [{ type: 'bar', open: true, p: P(-2.1, FZ + 1.2) }, { type: 'kitchen', open: true, p: P(8.2, NZ - 1.2) }, { type: 'stage', open: true, p: P(-10.8, FZ + 1.2) }, { type: 'corner', open: true, p: P(E0 - 2.5, -3.6) }, { type: 'stoop', open: true, p: P(-14.6, NZ - 1.3) }, { type: 'fence', open: true, p: P(W0 + 6, -2.8) }];
  const block = buildBlock(city, shops, { near: -2.6, far: -4.2, split: -3.4, end: E0 + 4, dead: true }); ups.push((dt, t) => block.update(dt, t));
  return Object.assign(api, { group: city, shops, glow, fill, sun, moon, lamps, alley: true, skyDome: sky, weatherAt, setEasy(on) { S.easy = on; paint(); }, update(dt, t) { for (const u of ups) u(dt, t); }, halo, rain: null, cars: [], glowMap, bakeFar() { }, reflect() { } });
}
