// the yatai itself, a village stall of the 1860s: its wooden frame and plank roof, the charcoal braziers under the pots, crocks, bins, board, shelves, the ticket rail, its paper lanterns' pools of light, the little things on its ledge, and the day's stock (what runs out is gone)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { G, V3, Q, mat, mesh, box, cyl, quatLook, clamp, mergeStatic } from './ctx.js';
import * as T from './tex.js';
import { makeWater } from './ripple.js';
import { Bowl, Food, Raw, Drink, Ladle, Basket, Knife, Prop, Vessel, Sticks, Rag, TOPPINGS, TARE, BROTH, RAW, doneness } from './items.js';

export const SEATS = [-0.72, 0, 0.72];
// a turned thing's outline (radius, height) from the foot up the outside, over the lip and down the inside: pots, crocks, cups and bottles are lathed with real walls
const lathe = (pts, seg = 28) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
const potGeo = (r, h) => lathe([[0, 0], [r - 0.014, 0], [r - 0.003, 0.005], [r, 0.02], [r, h - 0.012], [r + 0.004, h - 0.005], [r + 0.0035, h + 0.002], [r - 0.002, h + 0.0035], [r - 0.005, h - 0.006], [r - 0.005, 0.013], [0, 0.013]], 32);
const jarGeo = (r, h) => lathe([[0, 0], [r - 0.006, 0], [r, 0.008], [r, h - 0.03], [r * 0.82, h - 0.012], [r * 0.75, h - 0.006], [r * 0.76, h], [0, h]], 16);
const crockGeo = () => lathe([[0, 0], [0.04, 0], [0.047, 0.006], [0.054, 0.035], [0.057, 0.07], [0.053, 0.1], [0.048, 0.112], [0.05, 0.118], [0.047, 0.122], [0.044, 0.117], [0.048, 0.07], [0.042, 0.02], [0, 0.014]], 22);
// a model off the shelf with its own materials kept as the game's one cheap kind (a glass in it is left out: the bulb is the light)
const gl = new GLTFLoader(); gl.setMeshoptDecoder(MeshoptDecoder);
const model = (file, tint = 0xb0a8a0) => gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { d.scene.traverse((o) => { if (!o.isMesh) return; if (/glass/i.test(o.material.name)) o.visible = false; else o.material = mat({ map: o.material.map, color: tint }); o.userData.nopick = true; }); return d.scene; });
const fit = (o, size) => { const b = new THREE.Box3().setFromObject(o), s = b.getSize(new V3()); o.scale.multiplyScalar(size / Math.max(s.x, s.y, s.z)); return o; };
// prices in mon, as a village stall asked in the 1860s
export const RECIPES = {
  shoyu: { name: 'SHOYU', jp: '醤油ラーメン', price: 16, broth: 'chicken', tare: 'shoyu', tops: { chashu: 2, menma: 1, negi: 1, nori: 1, naruto: 1 } },
  shio: { name: 'SHIO', jp: '塩ラーメン', price: 16, broth: 'chicken', tare: 'shio', tops: { chashu: 2, menma: 1, negi: 1, egg: 1 } },
  miso: { name: 'MISO', jp: '味噌ラーメン', price: 20, broth: 'chicken', tare: 'miso', tops: { chashu: 2, corn: 1, negi: 1, menma: 1 } },
  tonkotsu: { name: 'TONKOTSU', jp: '豚骨ラーメン', price: 24, broth: 'tonkotsu', tare: 'shio', tops: { chashu: 2, egg: 1, negi: 1, nori: 1 } },
  yonaki: { name: 'YONAKI', jp: '夜鳴きそば', price: 12, broth: 'chicken', tare: 'shoyu', tops: { negi: 1, menma: 1, nori: 1 }, night: true },   // the night stall's plain bowl, cheaper, for whoever is out late
};
export const DAYDISH = Object.keys(RECIPES).filter((k) => !RECIPES[k].night);

const usd = (c) => Math.round(c) + ' mon';
export const DRINKS = { sake: 12, tea: 4 };
export const BOWL_BROTH = 0.044, BOWL_TARE = 0.05; // a pot's or crock's level that one bowl takes (two ladles of broth, one of tare)
export const YIELD = { chashu: 8, naruto: 10, negi: 12, egg: 2 }; // servings in one roll, log, stalk or egg
export function buildCart(scene, city) {
  const cart = new THREE.Group(); scene.add(cart); G.pickRoot.add(cart);
  const C = { group: cart, pots: [], bins: {}, board: null, open: false, ups: [], knobs: [], shown: { noodles: [], raw: {}, drinks: {} }, stock: { noodles: 0, kettle: 0, jar: { shoyu: 0, shio: 0, miso: 0 }, drinks: { sake: 0, tea: 0 }, raw: { chashu: 0, naruto: 0, negi: 0, egg: 0 } } };
  G.cart = C;
  const wood = T.surface(mat({ map: T.photo('wood', () => T.woodTex('#5a3a22', '#24140a')), color: 0xc8b8a8, userData: { metres: 1.5 } }), { grime: 0.4, band: 0.45 }); // photographed planks, laid by the metre (T.metreUV), never twice alike (T.surface)
  const woodDark = T.surface(mat({ map: T.photo('wood_dark', () => T.woodTex('#3a2414', '#150c06', [1, 1], 5)), color: 0xa89888, userData: { metres: 1.6 } }), { grime: 0.3 });
  const woodLight = T.surface(mat({ map: T.photo('wood_light', () => T.woodTex('#8f7350', '#54391f', [1, 1], 9)), color: 0xc0b0a0, userData: { metres: 1.3 } }), { worn: 0.4, grime: 0.2 });
  const woodTop = T.surface(mat({ map: T.photo('wood_counter', () => T.woodTex('#a07040', '#5a3a1c', [1, 1], 13)), color: 0xdcc6a6, userData: { metres: 1.1 } }), { worn: 0.7, grime: 0.12, vary: 0.16 }); // the worn, honey-coloured tops hands rest on
  const rbox = (w, h, d, m, x, y, z, p, r = 0.008) => mesh(new RoundedBoxGeometry(w, h, d, 2, r), m, x, y, z, p); // wood with its edges worn round
  T.dirty(wood.map, 2, { stains: 26, drips: 12, scratches: 60, rings: 4 }); T.dirty(woodDark.map, 3, { stains: 18, scratches: 40, drips: 8 }); T.dirty(woodLight.map, 4, { stains: 30, rings: 16, scratches: 90 });
  for (const m of [wood, woodDark, woodLight]) { m.normalMap = T.normalOf(m.map, 1.6); m.normalScale.set(0.6, 0.6); }
  const steel = mat({ map: T.steelTex([2, 2]), color: 0x8a7a68, metalness: 0.55, roughness: 0.34, envMapIntensity: 1.6 });   // hammered iron and copper, dark with use
  T.dirty(steel.map, 5, { scratches: 220, stains: 20, rings: 10 }); steel.roughnessMap = T.smudgeTex([2, 2]); steel.roughness = 0.62; woodLight.roughnessMap = T.smudgeTex([1, 1], 9); woodLight.roughness = 0.85;
  T.surface(steel, { vary: 0.12, grime: 0.15 });
  const steelDS = Object.assign(steel.clone(), { side: THREE.DoubleSide });
  const black = mat({ color: 0x111113, roughness: 0.6, metalness: 0.4 });
  const surf = (minX, maxX, minZ, maxZ, y) => G.surfaces.push({ minX, maxX, minZ, maxZ, y });
  const halo = city.halo;

  // ---------------- structure ----------------
  box(2.3, 0.88, 0.4, wood, 0, 0.44, -0.35, cart);                       // front body
  box(2.3, 0.02, 0.42, steel, 0, 0.89, -0.35, cart); surf(-1.15, 1.15, -0.56, -0.14, 0.9);
  rbox(2.44, 0.04, 0.36, woodTop, 0, 0.98, -0.71, cart, 0.012); surf(-1.22, 1.22, -0.89, -0.53, 1.0); // customer ledge
  box(2.4, 0.9, 0.04, woodDark, 0, 0.51, -0.57, cart);                    // front panel
  box(2.3, 0.094, 0.02, steel, 0, 0.947, -0.519, cart);                   // backsplash lip, just clear of the ledge (no two faces in one place)
  box(0.45, 0.8, 1.15, wood, -0.925, 0.4, 0.425, cart); box(0.47, 0.02, 1.17, steel, -0.925, 0.81, 0.425, cart); surf(-1.15, -0.7, -0.15, 1.0, 0.82); // stove wing
  box(0.45, 0.88, 1.15, wood, 0.925, 0.44, 0.425, cart); rbox(0.47, 0.02, 1.149, woodTop, 0.925, 0.89, 0.4355, cart, 0.006); surf(0.7, 1.15, -0.15, 1.0, 0.9); // prep wing, meeting the steel top edge to edge
  box(1.4, 0.03, 1.95, T.surface(mat({ map: T.photo('tatami'), color: 0x9a8a68 }), { grime: 0.5 }), 0, 0.015, 0.75, cart).castShadow = false; // a straw mat to stand on
  // posts, roof
  for (const [x, z] of [[-1.16, -0.56], [1.16, -0.56], [-1.16, 1.78], [1.16, 1.78]]) box(0.08, 2.62, 0.08, woodDark, x, 1.31, z, cart);
  for (const z of [-0.56, 1.78, -1.5, 0.6]) box(3.1, 0.08, 0.08, woodDark, 0, 2.58, z, cart);
  for (const x of [-1.16, 1.16]) { const br = box(0.05, 0.05, 1.2, woodDark, x, 2.3, -1.02, cart); br.rotation.x = 0.5; }
  for (const x of [-1.5, -0.75, 0, 0.75, 1.5]) for (const [zc, rx] of [[-0.8, -0.32], [1.1, 0.32]]) { const r = box(0.05, 0.06, 2.0, woodDark, x, 2.9, zc, cart); r.rotation.x = rx; }
  box(3.3, 0.09, 0.09, woodDark, 0, 3.2, 0.15, cart);
  const roofT = T.canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#8a1c16' : '#d8cfb8'; g.fillRect(i * 32, 0, 32, h); } const R = T.rng(2); for (let i = 0; i < 900; i++) { g.globalAlpha = 0.08; g.fillStyle = '#000'; g.fillRect(R() * w, R() * h, 3, 3 + R() * 20); } });
  T.dirty(roofT, 6, { stains: 30, drips: 24, patch: 3, fade: 1 });
  // a pitched roof of weathered sheet in two tiers, high enough to stand tall under
  const tileT = T.canvasTex(256, 256, (g, w, h) => { for (let x = 0; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#4a4d52'); gr.addColorStop(0.5, '#8a8e94'); gr.addColorStop(1, '#3a3d42'); g.fillStyle = gr; g.fillRect(x, 0, 16, h); } }, { repeat: [3, 1] });
  T.dirty(tileT, 12, { rust: 26, drips: 30, stains: 24, patch: 3 });
  const tileM = T.surface(mat({ map: T.photo('wood', () => tileT), color: 0x8a7a66, side: THREE.DoubleSide, userData: { metres: 1.12 } }), { bomb: 0, grime: 0.45, vary: 0.3 }); tileM.normalMap = T.normalOf(tileT, 3);
  for (const [zc, rx] of [[-0.82, -0.32], [1.12, 0.32]]) { const r = box(3.5, 0.03, 2.12, tileM, 0, 2.97, zc, cart); r.rotation.x = rx; }
  for (const [zc, rx] of [[-0.42, -0.36], [0.72, 0.36]]) { const r = box(2.7, 0.03, 1.25, tileM, 0, 3.42, zc, cart); r.rotation.x = rx; }
  box(2.8, 0.06, 0.1, woodDark, 0, 3.64, 0.15, cart);
  for (const sx of [-1.5, 1.5]) { const tri = new THREE.Shape(); tri.moveTo(-1.9, 0); tri.lineTo(1.9, 0); tri.lineTo(0, 0.62); tri.closePath(); const gm = mesh(new THREE.ShapeGeometry(tri), T.surface(mat({ map: woodLight.map, side: THREE.DoubleSide }), { worn: 0.3 }), sx, 2.62, 0.15, cart); gm.rotation.y = Math.PI / 2; }
  T.dirty(roofT, 6, { stains: 8 }); const roof = { rotation: {} };
  // wheels + pull handles
  for (const s of [-1, 1]) {
    const w = mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 28), black, s * 1.2, 0.39, 0.5, cart); w.rotation.y = Math.PI / 2;
    for (let i = 0; i < 6; i++) { const sp = box(0.02, 0.7, 0.03, woodDark, s * 1.2, 0.39, 0.5, cart); sp.rotation.x = (i * Math.PI) / 6; }
    box(0.05, 0.05, 1.1, woodDark, s * 0.9, 0.7, 2.3, cart);
  }
  box(1.85, 0.05, 0.05, woodDark, 0, 0.7, 2.83, cart);

  // noren + lanterns + roof sign (customer side)
  const norenT = T.canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#8f1712'; g.fillRect(0, 0, w, h);
    const R = T.rng(6); for (let i = 0; i < 2500; i++) { g.globalAlpha = 0.07; g.fillStyle = R() > 0.5 ? '#000' : '#fff'; g.fillRect(R() * w, R() * h, 2, 8 + R() * 30); }
    g.globalAlpha = 1; g.fillStyle = '#f4ead2'; g.font = `bold 150px ${T.JP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['ラ', 'ー', 'メ', 'ン'].forEach((c, i) => g.fillText(c, w * (0.125 + i * 0.25), h / 2 + 8));
  });
  T.dirty(norenT, 7, { stains: 22, drips: 30, fade: 1 });
  C.noren = [];
  for (let i = 0; i < 4; i++) {
    const t = norenT.clone(); t.repeat.set(0.25, 1); t.offset.set((3 - i) * 0.25, 0); t.needsUpdate = true;
    const n = mesh(new THREE.PlaneGeometry(0.69, 0.5, 8, 8), mat({ map: t, roughness: 0.95, side: THREE.DoubleSide }), -1.065 + i * 0.71, 2.28, -1.5, cart); n.rotation.y = Math.PI;
    n.userData.keep = true; n.visible = false; C.noren.push({ mesh: n, base: n.geometry.attributes.position.array.slice(), ph: i * 1.7 });
  }
  const lanternT = T.canvasTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#b01a10'); gr.addColorStop(0.5, '#ff4a2a'); gr.addColorStop(1, '#b01a10'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(60,0,0,0.5)'; for (let y = 10; y < h; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#140404'; g.font = `bold 78px ${T.JP}`; g.textAlign = 'center';
    for (const x of [64, 192]) { g.fillText('ラ', x, 86); g.fillText('メ', x, 164); g.fillText('ン', x, 240); }
  });
  T.dirty(lanternT, 8, { stains: 12, drips: 10, soot: 1 });
  const lanternM = mat({ map: lanternT, emissiveMap: lanternT, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.8 });
  C.lanternM = lanternM; C.lanternHalos = []; C.lanternLights = [];
  C.lanterns = [];
  for (const x of [-1.52, 1.52]) {
    const pv = new THREE.Group(); pv.position.set(x, 2.55, -1.5); pv.userData.dyn = true; cart.add(pv); C.lanterns.push(pv); cyl(0.004, 0.004, 0.3, black, 0, 0.1, 0, pv, 4);
    const l = mesh(new THREE.SphereGeometry(0.17, 20, 14), lanternM, 0, -0.38, 0, pv); l.scale.y = 1.35; l.castShadow = false;
    cyl(0.09, 0.09, 0.04, black, 0, -0.15, 0, pv, 12); cyl(0.09, 0.09, 0.04, black, 0, -0.61, 0, pv, 12); cyl(0.004, 0.004, 0.15, black, 0, -0.07, 0, pv, 4);
    C.lanternHalos.push(halo(0xff5a30, 1.5, 0, -0.38, 0, pv, 0.1));
    if (x < 0) { const pl = new THREE.PointLight(0xff5a30, 0, 7, 1.6); pl.position.set(1.5, -0.4, -0.2); pv.add(pl); C.lanternLights.push(pl); }
  }
  const signT = T.canvasTex(1024, 360, (g, w, h) => { g.fillStyle = '#5a3a20'; g.fillRect(0, 0, w, h); const R = T.rng(11); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '20,10,0' : '120,80,40'},0.15)`; g.fillRect(0, R() * h, w, 2 + R() * 6); } g.fillStyle = '#f0e6cc'; g.textAlign = 'center'; g.font = `bold 190px ${T.JP}`; g.fillText('らーめん', w / 2, 220); g.font = `bold 60px ${T.JP}`; g.fillText('RAMEN  夜鳴きそば', w / 2, 320); });
  C.signM = T.surface(mat({ map: signT }), { grime: 0.3, bomb: 0 });
  T.dirty(signT, 10, { stains: 26, drips: 8 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7 * signT.image.height / signT.image.width), C.signM); sign.position.set(0, 3.9, -0.2); sign.rotation.y = Math.PI; cart.add(sign);
  box(1.76, 0.62, 0.06, black, 0, 3.9, -0.16, cart); for (const sx of [-0.7, 0.7]) box(0.05, 0.5, 0.05, woodDark, sx, 3.5, -0.16, cart);
  C.signHalo = { material: { opacity: 0 } };

  // the work lights: paper lanterns hung under the roof, lit at dusk with the village's (the one over the pots casts shadows)
  const cartLampT = T.canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#efe2c0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,30,0,0.3)'; g.lineWidth = 2; for (let y = 8; y < h; y += 11) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#1a1a1a'; g.font = `bold 50px ${T.JP}`; g.textAlign = 'center'; g.fillText('麺', w / 4, 80); g.fillText('麺', (w * 3) / 4, 80); });
  const bulbM = mat({ map: cartLampT, emissiveMap: cartLampT, emissive: 0xffb070, emissiveIntensity: 0.0 });
  C.bulbs = []; C.workLights = [];
  [[-0.55, -0.25, true], [0.6, 0.1, false], [0, -1.05, false]].forEach(([x, z, sh], i) => {
    const pv = new THREE.Group(); pv.position.set(x, 2.62, z); pv.userData.dyn = true; cart.add(pv); C.bulbs.push(pv);
    cyl(0.003, 0.003, 0.2, black, 0, -0.11, 0, pv, 4);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10).scale(1, 1.3, 1), bulbM); b.position.set(0, -0.32, 0); pv.add(b); b.userData.nopick = true; for (const dy of [-0.13, 0.13]) cyl(0.06, 0.06, 0.02, black, 0, -0.32 + dy, 0, pv, 10);
    const hl = halo(0xffb070, 0.6, 0, -0.32, 0, pv, 0); C.workLights.push({ h: hl, op: 0.22 });
    const l = sh ? new THREE.PointLight(0xffb070, 0, 6, 1.8) : new THREE.SpotLight(0xffb070, 0, 6, 0.9, 0.9, 1.6); l.position.set(0, -0.34, 0); pv.add(l); if (l.isSpotLight) { l.target.position.set(0, -2.5, 0); pv.add(l.target); } C.workLights.push({ l, k: sh ? 0.6 : i === 2 ? 3.2 : 4 });
    if (sh) { const sl = new THREE.SpotLight(0xffb070, 0, 5, 0.95, 0.85, 1.7); sl.position.set(x, 2.25, z); sl.target.position.set(x + 0.15, 0, z + 0.05); cart.add(sl, sl.target); sl.castShadow = true; sl.shadow.mapSize.set(512, 512); sl.shadow.bias = -0.002; sl.shadow.camera.near = 0.1; sl.shadow.camera.far = 5; C.workLights.push({ l: sl, k: 10 }); }
  });
  // the lamps' level, from the village (alley.js): 0 by day, 1 when lit
  C.lamps = (k) => { C.lampK = k; const e = G.set && G.set.easy ? 0.6 : 1; bulbM.emissiveIntensity = k * 1.5 * e; lanternM.emissiveIntensity = 0.12 + k * 1.9 * e; C.lanternHalos.forEach((h) => (h.material.opacity = k * 0.4 * e)); C.lanternLights.forEach((l) => (l.intensity = k * 3)); for (const w of C.workLights) { if (w.l) w.l.intensity = k * w.k; else w.h.material.opacity = k * w.op * e; } };

  // stools
  for (const x of SEATS) { cyl(0.17, 0.16, 0.06, woodTop, x, 0.665, -1.16, cart, 16); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, lg = box(0.04, 0.64, 0.04, woodDark, x + Math.cos(a) * 0.1, 0.32, -1.16 + Math.sin(a) * 0.1, cart); lg.rotation.set(Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08); } box(0.24, 0.025, 0.025, woodDark, x, 0.25, -1.16, cart); } // plain wooden stools
  // placemats on the ledge
  C.seatSpots = SEATS.map((x) => { const p = box(0.3, 0.004, 0.22, mat({ color: 0x2a3a2e, roughness: 0.9 }), x, 1.002, -0.71, cart); p.castShadow = false; return new V3(x, 1.0, -0.71); });
  // on a little tray at each pair of seats: a glazed cup of chopsticks, the shichimi, a soy dispenser
  const indigo = mat({ color: 0x2c3c62 }), trayM = woodTop;
  for (const x of [-0.36, 0.36]) {
    rbox(0.27, 0.008, 0.115, trayM, x + 0.01, 1.004, -0.805, cart, 0.003).castShadow = false;
    const jg = new THREE.Group(); jg.position.set(x, 1.0, -0.8); mesh(lathe([[0, 0], [0.03, 0], [0.032, 0.004], [0.036, 0.098], [0.0345, 0.101], [0.032, 0.097], [0.028, 0.008], [0, 0.008]], 16), indigo, 0, 0, 0, jg);
    const jar = new Prop(jg, { name: 'chopstick cup', col: { t: 'cyl', hh: 0.05, r: 0.036 }, mass: 0.35, radius: 0.04, fragile: 0x2c3c62, mat: 'ceramic' }); jar.pick = true;
    for (let i = 0; i < 5; i++) { const st = new Sticks(); st.obj.position.set(x + Math.cos(i * 1.26) * 0.013, 1.11, -0.8 + Math.sin(i * 1.26) * 0.013); st.obj.rotation.set(Math.PI / 2 + Math.sin(i * 3) * 0.1, 0, Math.cos(i * 2) * 0.1); jar.hold(st); }
    const sg = new THREE.Group(); sg.position.set(x + 0.08, 1.0, -0.82); cyl(0.018, 0.018, 0.07, mat({ color: 0xb02a1a, roughness: 0.4 }), 0, 0.035, 0, sg, 10); cyl(0.019, 0.019, 0.012, steel, 0, 0.074, 0, sg, 10);
    const sh = new Prop(sg, { name: 'shichimi shaker', col: { t: 'cyl', hh: 0.04, r: 0.019 }, mass: 0.12, radius: 0.03, top: 0.08, mat: 'wood', pour: { color: 0xc8401c, pay: null, r: 0.0015, rate: 0.3, lip: 0 } }); sh.pick = true;
    const yg = new THREE.Group(); yg.position.set(x - 0.075, 1.0, -0.81); mesh(lathe([[0, 0], [0.024, 0], [0.026, 0.006], [0.025, 0.07], [0.016, 0.09], [0.012, 0.096], [0, 0.096]], 14), mat({ color: 0x2a1206, transparent: true, opacity: 0.9 }), 0, 0, 0, yg); cyl(0.0125, 0.0135, 0.022, mat({ color: 0xc81c14 }), 0, 0.104, 0, yg, 12); cyl(0.003, 0.004, 0.016, mat({ color: 0xc81c14 }), 0.008, 0.118, 0, yg, 6).rotation.z = -0.9;
    yg.traverse((o) => { o.castShadow = false; }); new Prop(yg, { name: 'soy sauce', col: { t: 'cyl', hh: 0.055, r: 0.026 }, mass: 0.25, radius: 0.03, top: 0.12, fragile: 0x2a1206, mat: 'glass', pour: { color: 0x2a1206, pay: null, r: 0.0015, rate: 0.4, lip: 0.01 } }).pick = true;
  }
  { // the beckoning cat at the left end, for luck
    const tg = new THREE.Group();
    const white = [], red = [], gold = [], dark = [], add = (list, g, x, y, z, rx = 0, rz = 0) => list.push(g.rotateX(rx).rotateZ(rz).translate(x, y, z));
    add(white, new THREE.SphereGeometry(1, 14, 10).scale(0.036, 0.044, 0.03), 0, 0.048, 0); add(white, new THREE.SphereGeometry(1, 14, 10).scale(0.034, 0.03, 0.029), 0, 0.1, 0.004);
    for (const s of [-1, 1]) add(white, new THREE.ConeGeometry(0.011, 0.02, 6), s * 0.02, 0.128, 0.002, 0, -s * 0.35);
    add(white, new THREE.CylinderGeometry(0.008, 0.009, 0.04, 8), 0.03, 0.105, 0.006, 0, 0.2); add(white, new THREE.SphereGeometry(0.01, 8, 6), 0.034, 0.126, 0.008);
    add(red, new THREE.TorusGeometry(0.026, 0.0035, 5, 18), 0, 0.074, 0.003, Math.PI / 2); add(red, new THREE.BoxGeometry(0.09, 0.012, 0.075), 0, 0.006, 0);
    add(gold, new THREE.SphereGeometry(0.0065, 8, 6), 0, 0.068, 0.029); add(gold, new THREE.CylinderGeometry(0.014, 0.014, 0.003, 12), -0.012, 0.04, 0.032, Math.PI / 2);
    for (const s of [-1, 1]) add(dark, new THREE.SphereGeometry(0.0035, 6, 4).scale(1.3, 0.5, 0.6), s * 0.012, 0.106, 0.031);
    const ng = new THREE.Group(); ng.position.set(-1.12, 1.0, -0.62); ng.rotation.y = 0.35;
    [[white, 0xf2eee6], [red, 0xc0281c], [gold, 0xd8a838], [dark, 0x1a1414]].forEach(([l, c]) => mesh(mergeGeometries(l.map((g) => g.toNonIndexed())), mat({ color: c }), 0, 0, 0, ng));
    for (const o of [tg, ng]) o.traverse((c) => { c.castShadow = false; }); // small things on the ledge: no shadows to draw
    new Prop(ng, { name: 'maneki-neko', col: { t: 'box', hx: 0.045, hy: 0.07, hz: 0.04 }, mass: 0.4, radius: 0.06, fragile: 0xf2eee6, mat: 'ceramic' }).pick = true;
  }

  { const bk = new THREE.Group(); cart.add(bk);
    box(1.36, 0.86, 0.34, wood, 0, 0.43, 1.62, bk); rbox(1.4, 0.03, 0.38, woodTop, 0, 0.885, 1.62, bk); surf(-0.7, 0.7, 1.43, 1.81, 0.9);
    for (const dx of [-0.34, 0.34]) { box(0.6, 0.7, 0.02, woodDark, dx, 0.44, 1.445, bk); cyl(0.012, 0.012, 0.03, steel, dx + (dx < 0 ? 0.22 : -0.22), 0.5, 1.43, bk, 8).rotation.x = Math.PI / 2; }
    for (let i = 0; i < 5; i++) { const b = new Bowl(); const o = b.obj; b.remove(); o.userData.item = null; o.position.set(-0.2, 0.9 + i * 0.022, 1.64); o.rotation.y = i * 1.3; bk.add(o); }
    rbox(1.4, 0.03, 0.22, woodTop, 0, 1.62, 1.72, bk); for (const sx of [-0.66, 0.66]) box(0.03, 0.74, 0.2, woodDark, sx, 1.26, 1.72, bk);
    bk.traverse((o) => { o.userData.nopick = true; }); }
  surf(-0.7, 0.7, 1.61, 1.83, 1.635);
  { // what stands on the back counter and its shelf: a rice tub, the stock kettle that tops the pots up, jars of tare for the crocks, a rag
    const tg = new THREE.Group(); tg.position.set(-0.45, 0.9, 1.64); cyl(0.13, 0.12, 0.2, mat({ color: 0xe8e4d8, roughness: 0.35 }), 0, 0.1, 0, tg, 20); cyl(0.125, 0.13, 0.05, mat({ color: 0x8a1c1c, roughness: 0.4 }), 0, 0.225, 0, tg, 20); cyl(0.02, 0.02, 0.03, black, 0, 0.26, 0, tg, 8);
    new Prop(tg, { name: 'rice tub', col: { t: 'cyl', hh: 0.125, r: 0.13 }, mass: 3, radius: 0.13 });
    const kg = new THREE.Group(); kg.position.set(0.5, 0.9, 1.66); cyl(0.09, 0.11, 0.17, steel, 0, 0.085, 0, kg, 16); const sp = cyl(0.012, 0.02, 0.12, steel, 0.1, 0.12, 0, kg, 8); sp.rotation.z = -0.9; mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 14, Math.PI), black, 0, 0.18, 0, kg);
    C.kettle = new Prop(kg, { name: 'stock kettle', col: { t: 'cyl', hh: 0.09, r: 0.11 }, mass: 2.5, radius: 0.11, top: 0.15, pour: { color: 0xc9a868, pay: { kind: 'stock', type: 'stock', heat: 0.6 }, r: 0.007, rate: 2.2, lip: 0.14, can: (q) => C.stock.kettle > 0 && ((C.stock.kettle -= q * 0.03), true) } });
    Object.keys(TARE).forEach((k, i) => { const g = new THREE.Group(); g.position.set(-0.56 + i * 0.16, 1.635, 1.72); mesh(jarGeo(0.04, 0.15), T.surface(mat({ color: [0x4a2a18, 0x8a5a2a, 0xd8d0c0][i] }), { grime: 0.3 }), 0, 0, 0, g); cyl(0.03, 0.03, 0.02, black, 0, 0.16, 0, g, 10);
      const lb = mesh(new THREE.PlaneGeometry(0.06, 0.04), new THREE.MeshBasicMaterial({ map: T.labelTex([TARE[k].label], { w: 256, h: 120, fs: 56 }), color: 0xbbbbbb }), 0, 0.08, 0.041, g); lb.castShadow = false; g.rotation.y = Math.PI;
      new Prop(g, { name: `${TARE[k].label.toLowerCase()} tare jar`, col: { t: 'cyl', hh: 0.085, r: 0.041 }, mass: 0.9, radius: 0.05, top: 0.17, fragile: TARE[k].color, pour: { color: TARE[k].color, pay: { kind: 'tare', type: k, heat: 1 }, r: 0.004, rate: 1.1, can: (q) => C.stock.jar[k] > 0 && ((C.stock.jar[k] -= q * 0.25), true) } }); });
    for (let i = 3; i < 6; i++) { const hh = 0.07 + (i % 3) * 0.02, col = [0x5a2a0c, 0xb8c8c0, 0x8a5a14, 0x2a3a24][i % 4], g = new THREE.Group(); g.position.set(-0.56 + i * 0.14, 1.635, 1.72); mesh(jarGeo(0.045, hh * 2), mat({ color: col }), 0, 0, 0, g); cyl(0.034, 0.034, 0.016, i % 2 ? black : mat({ color: 0xb8b0a0 }), 0, hh * 2 + 0.008, 0, g, 12); new Prop(g, { name: 'jar', col: { t: 'cyl', hh, r: 0.046 }, mass: 0.7, radius: 0.05, fragile: col }); }
    C.rag = new Rag(0.72, 0.935, -0.42);
  }

  // ---------------- stove + pots ----------------
  const potDefs = [
    { id: 'noodle', type: null, x: -0.93, z: 0.05, r: 0.165, h: 0.22, color: 0xd8dcc8, heat: 0.45, label: ['麺 NOODLES · VENT'] },
    { id: 'chicken', type: 'chicken', x: -0.93, z: 0.42, r: 0.15, h: 0.28, color: BROTH.chicken.color, heat: 0.7, label: ['鶏ガラ CHICKEN · VENT'] },
    { id: 'tonkotsu', type: 'tonkotsu', x: -0.93, z: 0.79, r: 0.15, h: 0.28, color: BROTH.tonkotsu.color, heat: 0.7, label: ['豚骨 TONKOTSU · VENT'] },
  ];
  const flameM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.5, 0.12), toneMapped: false }), coalM = mat({ color: 0x1a1612 }), clayM = T.surface(mat({ map: T.photo('plaster_clay'), color: 0xc09070 }), { grime: 0.6, bomb: 0 });
  const brothMap = T.brothTex('pot');
  C.burners = [];
  potDefs.forEach((d, i) => {
    const bn = { x: d.x, z: d.z, on: false, flames: [] }; C.burners.push(bn);
    cyl(0.2, 0.17, 0.05, clayM, d.x, 0.835, d.z, cart, 18, true).material = clayM; mesh(new THREE.TorusGeometry(0.19, 0.016, 6, 20), clayM, d.x, 0.86, d.z, cart).rotation.x = Math.PI / 2; // the brazier's clay rim
    for (let k = 0; k < 9; k++) { const a = k * 0.7, r = 0.04 + (k % 3) * 0.04; cyl(0.022, 0.026, 0.03, coalM, d.x + Math.cos(a) * r, 0.835, d.z + Math.sin(a) * r, cart, 6).rotation.set(k, k * 2, 0); }   // lumps of charcoal
    for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.3, r = 0.03 + (k % 3) * 0.045, f = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4).scale(1, 0.5, 1), flameM); f.position.set(d.x + Math.cos(a) * r, 0.848, d.z + Math.sin(a) * r); f.visible = false; f.userData.nopick = true; cart.add(f); bn.flames.push(f); }   // the coals' glow, when the draught is open
    // the pot itself stands on the burner: lift it, carry it, tip it out
    const pg = new THREE.Group(); pg.position.set(d.x, 0.86, d.z);
    const p = { id: d.id, type: d.type, r: d.r, h: d.h, color: d.color, heat: d.heat, label: d.label, hot: false, sip: d.type ? 0.022 : 0 };
    mesh(potGeo(d.r, d.h), steel, 0, 0, 0, pg);
    for (const sd of [-1, 1]) mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 12, Math.PI), steel, 0, d.h - 0.04, sd * (d.r + 0.005), pg).rotation.set(0, Math.PI / 2, 0);
    p.liqM = mat({ color: d.color, map: d.type ? brothMap : null, transparent: d.type !== 'tonkotsu', opacity: d.type === 'tonkotsu' ? 1 : 0.92 });
    p.water = makeWater(d.r - 0.004, p.liqM, { n: 24, damp: d.type === 'tonkotsu' ? 0.975 : 0.985, speed: 0.22 }); p.liq = p.water.mesh; p.liq.position.y = d.h * 0.8; pg.add(p.liq); p.liq.userData.water = p.water;   // the broth's live surface (ripple.js)
    if (d.type) { // pork bones / chicken + aromatics lying in the broth
      const bm = mat({ color: d.type === 'tonkotsu' ? 0xe8e0d0 : 0xd8b070, roughness: 0.6 });
      for (let k = 0; k < 4; k++) { const b = cyl(0.014, 0.018, 0.09, bm, Math.cos(k * 1.9) * 0.07, -0.005, Math.sin(k * 1.9) * 0.07, p.liq, 8); b.rotation.set(1.4, k, 0.3); }
      cyl(0.012, 0.012, 0.12, mat({ color: 0x5fae3a }), 0.03, 0, -0.05, p.liq, 6).rotation.set(1.5, 0.7, 0);
    }
    p.item = new Vessel(pg, { name: d.type ? `${d.type} broth pot` : 'noodle pot', col: { t: 'cyl', hh: d.h / 2, r: d.r + 0.005 }, mass: 9, radius: d.r, h: d.h, liq: p.liq, lift: 0.02, mat: 'metal' }, p);
    p.item.pay = d.type ? { kind: 'broth', type: d.type, heat: 1 } : { kind: 'water', type: 'water', heat: 1 }; p.item.fill = d.type ? 0.03 : 0.05;
    Object.defineProperty(p, 'on', { get: () => !p.tipped && C.burners.some((q) => q.on && Math.hypot(q.x - p.x, q.z - p.z) < 0.09 && Math.abs(p.baseY - 0.86) < 0.04) });
    p.bubbles = []; for (let k = 0; k < 10; k++) { const b = new THREE.Mesh(new THREE.RingGeometry(0.006, 0.009, 10).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); b.visible = false; b.userData = { t: Math.random(), nopick: true }; cart.add(b); p.bubbles.push(b); }
    // knob on the wing face toward the cook
    const kb = new THREE.Group(); kb.position.set(-0.695, 0.7, d.z); kb.userData.dyn = true; cart.add(kb);
    const km = box(0.03, 0.07, 0.09, woodDark, 0.015, 0, 0, kb);
    const mark = box(0.012, 0.03, 0.03, black, 0.032, 0, 0, kb);   // the draught door's wooden slide and its pull
    const lt = mesh(new THREE.PlaneGeometry(0.16, 0.035), new THREE.MeshBasicMaterial({ map: T.labelTex(d.label, { w: 256, h: 56, fs: 26, bg: '#3a2414', fg: '#e8e0c8' }) }), -0.699, 0.76, d.z, cart); lt.rotation.y = Math.PI / 2; lt.castShadow = false;
    
    p.vent = () => bn.on;   // (its brazier's vent open, whether or not the pot stands on it)
    p.setOn = (on) => { bn.on = on; kb.position.z = d.z + (on ? 0.05 : 0); bn.flames.forEach((f) => (f.visible = on)); G.audio.play('knob', _bp4.set(-0.67, 0.7, d.z)); };
    km.userData.button = kb.userData.button = mark.userData.button = { getPos: () => _bp.set(-0.67, 0.7, d.z), r: 0.045, press: () => p.setOn(!bn.on), name: `${d.id} brazier vent` };
    G.buttons.push(km.userData.button);
    C.pots.push(p);
  });
  // the plank screen and its noodle-timing wheels
  box(0.02, 0.82, 1.1, wood, -1.155, 1.23, 0.42, cart); box(0.05, 0.03, 0.5, woodDark, -1.13, 1.255, 0.05, cart);   // a plank screen behind the braziers
  C.dials = [0, 1].map((i) => {
    const t = T.panelTex(256, 256, () => { });
    const m = mesh(new THREE.CircleGeometry(0.075, 32), mat({ map: t, color: 0xd8d0c0 }), -1.088, 1.36, -0.05 + i * 0.2, cart);   // lit by the lamps like the wood round it m.rotation.y = Math.PI / 2; m.castShadow = false;
    cyl(0.08, 0.08, 0.055, woodDark, -1.117, 1.36, -0.05 + i * 0.2, cart, 24).rotation.z = Math.PI / 2; cyl(0.012, 0.012, 0.03, woodDark, -1.075, 1.36, -0.05 + i * 0.2, cart, 8).rotation.z = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.076, 0.007, 8, 32), woodDark, -1.088, 1.36, -0.05 + i * 0.2, cart).rotation.y = Math.PI / 2;
    return { t, last: -1 };
  });
  const drawDial = (d, cook, has, i) => {
    const key = has ? Math.floor(cook * 4) : -2; if (key === d.last) return; d.last = key;
    d.t.redraw((g, w, h) => {
      // a wheel of turned keyaki: the zones washed on in mineral pigments with a brush (bare wood raw, ochre firm, verdigris right, persimmon soft, bengara over), the marks in ink, a bamboo needle on an iron pin
      const wd = T.photoImg('wood_light'); if (wd) g.drawImage(wd, 0, 0, w, h); else { g.fillStyle = '#b08a5e'; g.fillRect(0, 0, w, h); }
      g.fillStyle = 'rgba(120,80,40,0.25)'; g.fillRect(0, 0, w, h); const rg = g.createRadialGradient(128, 128, 60, 128, 128, 128); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(40,20,5,0.45)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
      const R = T.rng(5 + i), seg = (a, b, c) => { for (let k = 0; k < 3; k++) { g.beginPath(); g.strokeStyle = c; g.globalAlpha = 0.38 + R() * 0.2; g.lineWidth = 22 + R() * 8; g.lineCap = 'round'; g.arc(128, 128, 90 + (R() - 0.5) * 6, -Math.PI / 2 + ((a + 0.3) / 34) * 6.283, -Math.PI / 2 + ((b - 0.3) / 34) * 6.283); g.stroke(); } g.globalAlpha = 1; };
      seg(9, 14, '#c89a3c'); seg(14, 23, '#4f7f5c'); seg(23, 29, '#b8662e'); seg(29, 34, '#7e2418');
      g.strokeStyle = 'rgba(20,14,8,0.85)'; g.lineWidth = 3; for (const v of [0, 9, 14, 23, 29]) { const a = -Math.PI / 2 + (v / 34) * 6.283; g.beginPath(); g.moveTo(128 + Math.cos(a) * 72, 128 + Math.sin(a) * 72); g.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110); g.stroke(); }
      g.fillStyle = '#1a120a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold 26px ${T.JP}`;
      for (const [v, k] of [[4.5, '生'], [11.5, '硬'], [18.5, '良'], [26, '柔'], [31.5, '過']]) { const a = -Math.PI / 2 + (v / 34) * 6.283; g.fillText(k, 128 + Math.cos(a) * 90, 128 + Math.sin(a) * 90); }
      g.font = `italic 15px Georgia, 'Times New Roman', serif`; for (const [v, k] of [[4.5, 'raw'], [11.5, 'firm'], [18.5, 'good'], [26, 'soft']]) { const a = -Math.PI / 2 + (v / 34) * 6.283; g.fillText(k, 128 + Math.cos(a) * 58, 128 + Math.sin(a) * 58); }
      g.font = `bold 22px ${T.JP}`; g.fillText(`麺 ${'一二'[i]}`, 128, 64);
      if (has) { const a = -Math.PI / 2 + (Math.min(cook, 33.5) / 34) * 6.283; g.lineCap = 'round'; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 9; g.beginPath(); g.moveTo(130, 131); g.lineTo(130 + Math.cos(a) * 86, 131 + Math.sin(a) * 86); g.stroke(); g.strokeStyle = '#d8c48a'; g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 86, 128 + Math.sin(a) * 86); g.stroke(); g.strokeStyle = '#7a6230'; g.lineWidth = 7; for (const r of [36, 66]) { g.beginPath(); g.moveTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); g.lineTo(128 + Math.cos(a) * (r + 3), 128 + Math.sin(a) * (r + 3)); g.stroke(); } }
      g.fillStyle = '#2a2420'; g.beginPath(); g.arc(128, 128, 11, 0, 7); g.fill(); g.fillStyle = '#4a4440'; g.beginPath(); g.arc(126, 126, 5, 0, 7); g.fill();
      if (has) { g.fillStyle = '#1a120a'; g.font = `italic bold 20px Georgia, 'Times New Roman', serif`; g.fillText(doneness(cook).label.toLowerCase(), 128, 98); }
    });
  };

  // ---------------- tools ----------------
  const placeTool = (tool, cupTarget, gripPos) => {
    const q = quatLook(_a.copy(cupTarget).sub(gripPos).normalize());
    const pos = cupTarget.clone().sub(tool.cup.clone().applyQuaternion(q));
    tool.setHome(pos, q);
  };
  const np = C.pots[0];
  C.baskets = [0, 1].map((i) => { const b = new Basket(np, i); const z = np.z + (i ? 0.075 : -0.075); placeTool(b, new V3(np.x - 0.02, np.liqY + 0.01, z), new V3(np.x + 0.3, np.rimY + 0.17, z + (i ? 0.05 : -0.05))); return b; });
  C.brothLadles = [1, 2].map((i) => { const p = C.pots[i], l = new Ladle('broth', p.type, p); placeTool(l, new V3(p.x - 0.02, p.liqY - 0.01, p.z + 0.03), new V3(p.x + 0.27, p.rimY + 0.14, p.z - 0.04)); p.item.tools.push(l); return l; });
  C.baskets.forEach((b) => np.item.tools.push(b));

  // tare crocks
  C.tares = Object.keys(TARE).map((k, i) => {
    const x = -0.64 + i * 0.15, z = -0.45, v = { r: 0.052, type: k, heat: 1, sip: 0.05 }, cg = new THREE.Group(); cg.position.set(x, 0.905, z);
    mesh(crockGeo(), mat({ color: [0x4a2a18, 0x8a5a2a, 0xd8d0c0][i] }), 0, 0, 0, cg);
    const tw = makeWater(0.049, mat({ color: TARE[k].color }), { n: 16, damp: 0.97, speed: 0.15 }), liq = tw.mesh; liq.position.y = 0.085; cg.add(liq); liq.userData.water = tw; v.water = tw;
    const lb = mesh(new THREE.PlaneGeometry(0.085, 0.04), new THREE.MeshBasicMaterial({ map: T.labelTex([`${TARE[k].jp} ${TARE[k].label}`], { w: 256, h: 120, fs: 50 }), color: 0xbbbbbb }), 0, 0.055, 0.056, cg); lb.castShadow = false;
    const it = new Vessel(cg, { name: `${TARE[k].label.toLowerCase()} tare crock`, col: { t: 'cyl', hh: 0.06, r: 0.056 }, mass: 1.6, radius: 0.055, h: 0.115, liq, lo: 0.1, hi: 0.74, fragile: [0x4a2a18, 0x8a5a2a, 0xd8d0c0][i], mat: 'ceramic' }, v); it.pay = { kind: 'tare', type: k, heat: 1 }; it.fill = 0.25; it.drain = 0.6;
    const l = new Ladle('tare', k, v); placeTool(l, new V3(x, v.liqY - 0.004, z - 0.01), new V3(x + 0.02, 1.1, z + 0.12)); it.tools.push(l);
    return v;
  });

  // ---------------- topping bins ----------------
  const binStart = { chashu: 8, egg: 4, negi: 8, nori: 20, menma: 14, naruto: 8, corn: 14 };
  Object.keys(TOPPINGS).forEach((k, i) => {
    const x = -0.15 + i * 0.128, z = -0.45, b = { type: k, stock: binStart[k], x, z, pieces: [] };
    cyl(0.074, 0.062, 0.07, steelDS, x, 0.937, z, cart, 4, true).rotation.y = Math.PI / 4;
    box(0.086, 0.004, 0.086, steel, x, 0.905, z, cart);
    const lt = T.panelTex(256, 96, () => { });
    b.label = lt;
    const lm = mesh(new THREE.PlaneGeometry(0.1, 0.0375), new THREE.MeshBasicMaterial({ map: lt, color: 0xcccccc }), x, 0.918, z + 0.066, cart); lm.rotation.x = -0.5; lm.castShadow = false;
    for (let n = 0; n < 6; n++) {
      const f = new Food(k); const o = f.obj; f.remove(); // borrow the mesh only
      o.userData.item = null; o.position.set(x + ((n % 2) - 0.5) * 0.04 + (k === 'nori' ? 0 : 0), 0.912 + Math.floor(n / 2) * 0.012 + (k === 'egg' ? 0 : 0), z + ((n % 3) - 1) * 0.028);
      o.rotation.y = n * 1.3; if (k === 'nori') { o.position.set(x, 0.912 + n * 0.0025, z); o.rotation.y = 0.1 * n; }
      o.userData.dyn = true; cart.add(o); b.pieces.push(o);
    }
    b.refresh = () => {
      b.pieces.forEach((p, n) => (p.visible = b.stock > n * (k === 'nori' || k === 'menma' || k === 'corn' ? 3 : 1)));
      lt.redraw((g, w, h) => { g.fillStyle = b.stock ? '#e9e2c8' : '#e8a090'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.font = `bold 40px ${T.JP}`; g.fillText(TOPPINGS[k].label, w / 2, 40); g.font = `bold 34px ${T.MONO}`; g.fillText(b.stock ? `x${b.stock}` : 'EMPTY', w / 2, 82); });
    };
    b.refresh();
    const pos = new V3(x, 0.95, z);
    G.sources.push({ pos, r: 0.07, name: `${TOPPINGS[k].label.toLowerCase()} (bin)`, can: () => b.stock > 0, take: () => { b.stock--; b.refresh(); return new Food(k); }, bin: b });
    G.targets.push({ getPos: () => pos, r: 0.095, prio: 1, accepts: (it) => it.kind === 'food' && it.topping === k, receive: (it) => { b.stock += it.servings; it.remove(); b.refresh(); G.audio.play('plop'); } });
    C.bins[k] = b;
  });

  // ---------------- cutting board + knife ----------------
  C.board = { x: 0.37, y: 0.928, z: -0.265, item: null };
  const bb0 = box(0.36, 0.028, 0.2, woodLight, C.board.x, 0.914, C.board.z, cart); bb0.userData.keep = true; surf(0.19, 0.55, -0.365, -0.165, 0.928);
  model('wooden_cutting_board', 0xc8b8a8).then((m) => { const o = fit(m, 0.36); o.scale.y *= 0.82; o.position.set(C.board.x, 0.9, C.board.z); cart.add(o); bb0.visible = false; }).catch(() => { });   // Poly Haven's board, its knife-scored face
  model('food_ginger_01', 0xc0b0a0).then((m) => { const o = fit(m, 0.07); o.position.set(0.215, 0.928, -0.345); o.rotation.set(0, 0.8, 1.45); cart.add(o); }).catch(() => { });   // a knob of ginger by the board
  G.targets.push({ getPos: () => _bp2.set(C.board.x - 0.03, C.board.y, C.board.z), r: 0.17, accepts: (it) => it.kind === 'raw' && !C.board.item, receive: (it) => { it.obj.position.set(C.board.x - 0.15, C.board.y + it.base, C.board.z); it.obj.quaternion.identity(); it.board = C.board; C.board.item = it; G.audio.play('place'); } });
  C.knife = new Knife(); C.knife.cup = C.knife.blade;
  C.knife.setHome(new V3(0.62, 0.912, -0.2), new Q().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)));
  // assembly mat
  box(0.86, 0.004, 0.2, mat({ color: 0x20262c, roughness: 0.85 }), -0.3, 0.902, -0.26, cart).castShadow = false;

  // ---------------- sources: bowls, noodles, raw, drinks ----------------
  const srcMesh = (m, src) => m.traverse((o) => { o.userData.source = src; });
  // what is left on a tray or in the box is drawn as it is: the pieces still there, baked into one draw again whenever the count changes
  const shelf = (pieces, src) => { const g = pieces[0].parent, tr = { n: -1, cur: null }; pieces.forEach((o) => o.removeFromParent());
    tr.show = (n) => { n = Math.min(n, pieces.length); if (n === tr.n) return; tr.n = n; if (tr.cur) { tr.cur.removeFromParent(); tr.cur.traverse((o) => o.geometry?.dispose()); }
      const h = new THREE.Group(); h.userData.dyn = true; pieces.slice(0, n).forEach((o) => h.add(o.clone())); g.add(h); mergeStatic(h); srcMesh(h, src); tr.cur = h; };
    return tr; };
  { // bowl stack
    const g = new THREE.Group(); g.position.set(0.93, 0.9, -0.36); cart.add(g);
    for (let i = 0; i < 6; i++) { const b = new Bowl(); const o = b.obj; b.remove(); o.userData.item = null; o.position.set(0, i * 0.022, 0); o.rotation.y = i; g.add(o); }
    const src = { pos: new V3(0.93, 1.06, -0.36), r: 0.12, name: 'clean bowl', can: () => true, take: () => new Bowl() };
    G.sources.push(src); srcMesh(g, src);
  }
  { // noodle box
    const g = new THREE.Group(); g.position.set(-0.93, 0.9, -0.36); cart.add(g);
    box(0.3, 0.012, 0.24, woodLight, 0, 0.006, 0, g); for (const [x, z, w, d] of [[0, 0.115, 0.3, 0.012], [0, -0.115, 0.3, 0.012], [0.145, 0, 0.012, 0.24], [-0.145, 0, 0.012, 0.24]]) box(w, 0.05, d, woodLight, x, 0.025, z, g);
    for (let i = 0; i < 6; i++) { const f = new Food('noodle'); const o = f.obj; f.remove(); o.userData.item = null; o.userData.dyn = true; o.position.set(((i % 3) - 1) * 0.092, 0.012, (Math.floor(i / 3) - 0.5) * 0.105); o.scale.setScalar(0.72); o.rotation.y = i * 2; g.add(o); C.shown.noodles.push(o); }
    const src = { pos: new V3(-0.93, 0.95, -0.36), r: 0.14, name: 'fresh noodle portion', can: () => C.stock.noodles > 0, take: () => { C.stock.noodles--; C.showStock(); return new Food('noodle'); } };
    G.sources.push(src); srcMesh(g, src); C.shown.noodles = shelf(C.shown.noodles, src);
  }
  Object.keys(RAW).forEach((k, i) => {
    const z = -0.02 + i * 0.165, g = new THREE.Group(); g.position.set(0.925, 0.9, z); cart.add(g);
    box(0.34, 0.012, 0.14, steel, 0, 0.006, 0, g); for (const zz of [-0.07, 0.07]) box(0.34, 0.03, 0.006, steel, 0, 0.018, zz, g);
    const cnt = k === 'egg' ? 5 : k === 'negi' ? 3 : 2;
    C.shown.raw[k] = []; for (let n = 0; n < cnt; n++) { const r = new Raw(k); const o = r.obj; r.remove(); o.userData.item = null; o.userData.dyn = true; C.shown.raw[k].push(o); if (k === 'egg') o.position.set(-0.15 + n * 0.062, 0.036, 0); else o.position.set(-RAW[k].len / 2, 0.012 + RAW[k].r, (n - (cnt - 1) / 2) * (k === 'negi' ? 0.035 : RAW[k].r * 2.1)); g.add(o); }
    const lm = mesh(new THREE.PlaneGeometry(0.1, 0.03), new THREE.MeshBasicMaterial({ map: T.labelTex([RAW[k].name.toUpperCase()], { w: 320, h: 96, fs: 36 }), color: 0xcccccc }), -0.226, 0.03, 0, g); lm.rotation.y = -Math.PI / 2; lm.castShadow = false;
    const src = { pos: new V3(0.925, 0.95, z), r: 0.085, name: RAW[k].name, can: () => C.stock.raw[k] > 0, take: () => { C.stock.raw[k]--; C.showStock(); return new Raw(k); } };
    G.sources.push(src); srcMesh(g, src); C.shown.raw[k] = shelf(C.shown.raw[k], src);
  });
  { // the tub of well water the sake and the tea stand in
    const g = new THREE.Group(); g.position.set(0.935, 0.9, 0.68); cart.add(g);
    const cm = woodDark;
    box(0.36, 0.012, 0.24, cm, 0, 0.006, 0, g); for (const [x, z, w, d] of [[0, 0.115, 0.36, 0.014], [0, -0.115, 0.36, 0.014], [0.173, 0, 0.014, 0.24], [-0.173, 0, 0.014, 0.24]]) box(w, 0.16, d, cm, x, 0.08, z, g);
    const ice = mesh(new THREE.BoxGeometry(0.33, 0.1, 0.21), mat({ color: 0x4a5a58, transparent: true, opacity: 0.7 }), 0, 0.065, 0, g); ice.castShadow = false;   // well water
    ['sake', 'tea'].forEach((d, j) => {
      const grp = new THREE.Group(); g.add(grp);
      C.shown.drinks[d] = []; for (let n = 0; n < 3; n++) { const b = new Drink(d); const o = b.obj; b.remove(); o.userData.item = null; o.userData.dyn = true; C.shown.drinks[d].push(o); o.position.set(-0.11 + n * 0.11, 0.06, (j - 0.5) * 0.11); o.rotation.z = (n - 1) * 0.08; grp.add(o); }
      const src = { pos: new V3(0.935, 1.14, 0.68 + (j - 0.5) * 0.11), r: 0.075, name: d, can: () => C.stock.drinks[d] > 0, take: () => { C.stock.drinks[d]--; C.showStock(); G.audio.play('bottle', _bp4.set(0.935, 1.0, 0.68)); return new Drink(d); } };
      G.sources.push(src); srcMesh(grp, src); C.shown.drinks[d] = shelf(C.shown.drinks[d], src);
    });
  }
  // ---------------- tonight's stock ----------------
  C.showStock = () => { const s = C.stock; C.shown.noodles.show(s.noodles); for (const k in C.shown.raw) C.shown.raw[k].show(s.raw[k]); for (const d in C.shown.drinks) C.shown.drinks[d].show(s.drinks[d]); C.menuDraw?.(); };
  // P: { noodles, sake, tea, tops: {t: servings}, broth: {type: bowls}, brothSpare, tare: {type: bowls}, tareSpare: {type: bowls} }; the pots and crocks hold the night's bowls, the kettle and jars the quarter more
  C.restock = (P) => {
    const s = C.stock; s.noodles = P.noodles; s.drinks.sake = P.sake; s.drinks.tea = P.tea;
    for (const k in C.bins) { const b = C.bins[k], need = P.tops[k] || 0, cap = { chashu: 8, egg: 4, negi: 8, naruto: 8 }[k]; if (cap !== undefined) { b.stock = Math.min(need, cap); s.raw[k] = Math.ceil((need - b.stock) / YIELD[k]); } else b.stock = need; b.refresh(); }
    for (const p of C.pots) if (p.type) p.level = Math.min(1, 0.035 + (P.broth[p.type] || 0) * BOWL_BROTH);
    s.kettle = P.brothSpare * BOWL_BROTH;
    for (const v of C.tares) { v.level = Math.min(1, 0.035 + (P.tare[v.type] || 0) * BOWL_TARE); s.jar[v.type] = (P.tareSpare[v.type] || 0) * BOWL_TARE; }
    C.showStock();
  };
  // what is left for tonight, counted in bowls and servings (what is already out on the counter included)
  C.avail = () => {
    const s = C.stock, a = { noodles: s.noodles + G.items.filter((i) => i.noodle && !i.dead).length + C.baskets.filter((b) => b.noodles).length, broth: {}, tare: {}, tops: {}, drinks: { ...s.drinks } };
    const spare = Math.floor(s.kettle / BOWL_BROTH + 0.01);
    for (const p of C.pots) if (p.type) a.broth[p.type] = Math.max(0, Math.floor((p.level - 0.03) / BOWL_BROTH + 0.01)) + spare;
    for (const v of C.tares) a.tare[v.type] = Math.max(0, Math.floor((v.level - 0.03) / BOWL_TARE + 0.01)) + Math.floor(s.jar[v.type] / BOWL_TARE + 0.01);
    for (const k in C.bins) a.tops[k] = C.bins[k].stock + (s.raw[k] || 0) * (YIELD[k] || 0) + G.items.filter((i) => !i.dead && ((i.kind === 'food' && i.topping === k) || (i.kind === 'raw' && i.raw === k))).reduce((n, i) => n + (i.kind === 'raw' ? i.left * (k === 'egg' ? 2 : i.def.per) : i.servings || 1), 0);
    return a;
  };
  C.canMake = (key, a = C.avail()) => { const r = RECIPES[key]; return a.noodles > 0 && a.broth[r.broth] > 0 && a.tare[r.tare] > 0; };
  { // bus tub
    const g = new THREE.Group(); g.position.set(0.935, 0.9, 0.91); cart.add(g);
    const tm = woodDark;
    box(0.36, 0.01, 0.15, tm, 0, 0.005, 0, g); for (const [x, z, w, d] of [[0, 0.075, 0.36, 0.01], [0, -0.075, 0.36, 0.01], [0.175, 0, 0.01, 0.15], [-0.175, 0, 0.01, 0.15]]) box(w, 0.12, d, tm, x, 0.06, z, g);
    const lm = mesh(new THREE.PlaneGeometry(0.13, 0.04), new THREE.MeshBasicMaterial({ map: T.labelTex(['DIRTY BOWLS'], { w: 320, h: 96, fs: 38 }), color: 0xcccccc }), -0.181, 0.07, 0, g); lm.rotation.y = -Math.PI / 2;
    const pos = new V3(0.935, 0.98, 0.91);
    G.targets.push({ getPos: () => pos, r: 0.2, prio: 1, accepts: (it) => it.kind === 'bowl' || it.kind === 'drink', receive: (it) => { G.audio.play('set', it, 0.7); it.remove(); G.game?.onBus?.(); } });
  }

  // ---------------- beam: ticket rail, recipe board ----------------
  box(2.3, 0.012, 0.012, steel, 0, 1.99, -0.53, cart);
  for (const x of [-1.1, 1.1]) cyl(0.003, 0.003, 0.58, black, x, 2.28, -0.53, cart, 4);
  const rb = T.canvasTex(2048, 512, (g, w, h) => {
    g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1612'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    const keys = DAYDISH, cw = (w - 40) / 5;
    keys.forEach((k, i) => {
      const r = RECIPES[k], x = 20 + i * cw;
      g.fillStyle = '#7a1612'; g.fillRect(x + 8, 22, cw - 16, 70); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `bold 46px ${T.JP}`; g.fillText(`${r.name}  ${usd(r.price)}`, x + cw / 2, 72);
      g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.font = `bold 34px ${T.JP}`;
      const lines = [`1 TARE:  ${TARE[r.tare].label} ${TARE[r.tare].jp}`, `2 BROTH: ${BROTH[r.broth].label} x2`, `3 NOODLES (green zone)`, '4 TOPPINGS:'];
      lines.forEach((l, n) => g.fillText(l, x + 18, 140 + n * 46, cw - 30));
      g.font = `bold 32px ${T.JP}`; g.fillStyle = '#12406a';
      Object.entries(r.tops).forEach(([t, n], j) => g.fillText(`${TOPPINGS[t].label}${n > 1 ? ' x' + n : ''}`, x + 30 + (j % 2) * (cw / 2 - 10), 322 + Math.floor(j / 2) * 44, cw / 2 - 26));
    });
    const x = 20 + 4 * cw; g.fillStyle = '#12406a'; g.fillRect(x + 8, 22, cw - 16, 70); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `bold 44px ${T.JP}`; g.fillText('HOW IT WORKS', x + cw / 2, 72);
    g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.font = `bold 29px ${T.JP}`;
    ['Vents (left) wake the braziers.', 'Noren peg (right post): open.', 'The ticket lists every step.', 'Tilt ladles/baskets to pour.', 'Chop on the board, fill bins.', 'Set the bowl on the placemat.', 'Dirty bowls → bus tub.', 'Drop a tool: it returns home.', 'FIRM = the ochre on the wheel.', 'Coin only: the box is behind you.'].forEach((l, n) => g.fillText('・' + l, x + 14, 130 + n * 37, cw - 26));
  });
  T.dirty(rb, 9, { stains: 40, rings: 12, drips: 10, yellow: 1, scratches: 30 });
  const board = mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: rb, color: 0x7a7468 }), 0, 2.24, -0.5, cart); board.rotation.x = 0.36; board.castShadow = false;
  const menuT = T.panelTex(1024, 256, () => { }); let menuKey = '';
  C.menuDraw = () => { // the customers' side: tonight's bowls and their prices; what has run out is marked
    const on = G.game ? G.game.cfg().menu : DAYDISH, list = on.some((k) => RECIPES[k].night) ? [...on, ...DAYDISH.filter((k) => !on.includes(k))].slice(0, 4) : DAYDISH, a = C.avail(), st = list.map((k) => (!on.includes(k) ? 0 : C.canMake(k, a) ? 1 : 2)), dr = G.game && G.game.cfg().drinks ? [a.drinks.sake > 0, a.drinks.tea > 0] : null, key = list.join() + st.join('') + JSON.stringify(dr);
    if (key === menuKey) return; menuKey = key;
    menuT.redraw((g, w, h) => {
      g.fillStyle = '#20140c'; g.fillRect(0, 0, w, h); g.textAlign = 'center';
      list.map((k) => RECIPES[k]).forEach((r, i) => { const x = w * (0.125 + i * 0.25); g.globalAlpha = st[i] === 1 ? 1 : 0.35; g.fillStyle = '#f4ead2'; g.font = `bold 46px ${T.JP}`; g.fillText(r.jp, x, 62, 230); g.fillStyle = '#c8b8a0'; g.font = `bold 30px ${T.JP}`; g.fillText(r.name + ' RAMEN', x, 104, 236); g.fillStyle = '#ffb040'; g.font = `bold 56px ${T.JP}`; g.fillText(usd(r.price), x, 172); g.globalAlpha = 1;
        if (st[i] === 2) { g.save(); g.translate(x, 120); g.rotate(-0.22); g.strokeStyle = '#d8281c'; g.lineWidth = 6; g.strokeRect(-104, -30, 208, 60); g.fillStyle = '#e8301e'; g.font = `bold 44px ${T.JP}`; g.fillText('SOLD OUT', 0, 16); g.restore(); } });
      g.fillStyle = '#e8dcc0'; g.font = `bold 26px ${T.JP}`; g.fillText(`COIN ONLY${dr ? `  ·  SAKE ${usd(DRINKS.sake)}${dr[0] ? '' : ' (OUT)'}  ·  TEA ${usd(DRINKS.tea)}${dr[1] ? '' : ' (OUT)'}` : ''}`, w / 2, 232, w - 30);
    });
  };
  const menu = mesh(new THREE.PlaneGeometry(1.8, 0.45), mat({ map: menuT, roughness: 0.8 }), 0, 2.24, -0.52, cart); menu.rotation.set(0.2, Math.PI, 0); menu.rotation.order = 'YXZ'; menu.rotation.x = -0.3;

  // ---------------- register LED + open switch (right post) ----------------
  const reg = new THREE.Group(); reg.position.set(1.02, 1.5, -0.47); reg.rotation.y = -0.75; cart.add(reg);
  box(0.36, 0.2, 0.08, black, 0, 0, -0.04, reg);
  C.led = T.panelTex(512, 256, () => { });
  mesh(new THREE.PlaneGeometry(0.33, 0.165), new THREE.MeshBasicMaterial({ map: C.led, toneMapped: false }), 0, 0, 0.002, reg).castShadow = false;
  const sw = new THREE.Group(); sw.position.set(0, -0.2, 0); sw.userData.dyn = true; reg.add(sw);
  box(0.16, 0.12, 0.05, woodDark, 0, 0, -0.025, sw);
  const lever = cyl(0.012, 0.012, 0.07, woodTop, 0, 0, 0.03, sw, 10); lever.rotation.x = Math.PI / 2 - 0.6;
  const swl = mesh(new THREE.PlaneGeometry(0.15, 0.035), new THREE.MeshBasicMaterial({ map: T.labelTex(['営業 OPEN / CLOSE'], { w: 384, h: 90, fs: 36, bg: '#111', fg: '#ffd060' }) }), 0, 0.085, 0.001, sw);
  C.setOpen = (on) => {
    C.open = on; lever.rotation.x = Math.PI / 2 + (on ? 0.6 : -0.6);
    const e = G.set && G.set.easy ? 0.6 : 1;   // easy on the eyes: the bright points burn lower
    C.noren.forEach((n) => (n.mesh.visible = on)); void e;   // open is the noren hung out
    G.audio.play('click');
  };
  const swb = { getPos: () => sw.getWorldPosition(_bp3), r: 0.06, press: () => G.game.toggleOpen(), name: 'OPEN / CLOSE: hang or take in the noren' };
  sw.traverse((o) => (o.userData.button = swb)); G.buttons.push(swb);

  // ---------------- per-frame ----------------
  C.update = (dt, t) => {
    let boil = 0; T.SURF.time.value = t;
    for (const bn of C.burners) if (bn.on) bn.flames.forEach((f, i) => { f.scale.setScalar(0.92 + Math.sin(t * 0.7 + i * 2.1) * 0.06); });   // the coals breathe slowly
    for (const p of C.pots) {
      p.heat = clamp(p.heat + (p.on ? dt / 14 : -dt / 90), 0.15, 1); p.hot = p.heat > 0.9;
      const k = clamp((p.heat - 0.6) / 0.4, 0, 1); boil += k * (p.type ? 0.5 : 1);
      p.bubbles.forEach((b) => {
        b.userData.t += dt * (1.5 + k * 3) * (p.type ? 0.45 : 1);
        if (b.userData.t > 1) { b.userData.t = 0; const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * (p.r - 0.03); b.position.set(p.x + Math.cos(a) * d, p.liqY + 0.002, p.z + Math.sin(a) * d); if (k > 0.3 && p.liqY > 0) p.water.poke(Math.cos(a) * d, Math.sin(a) * d, 0.0012 * k, 0.012); }   // a bubble bursting rings the surface
        b.visible = k > 0.3 && p.liqY > 0; const s = 0.4 + b.userData.t * 1.6; b.scale.set(s, 1, s); b.material.opacity = 0.55 * (1 - b.userData.t);
      });
      if (k > 0.2 && p.liqY > 0 && Math.random() < dt * 9 * k) G.fx.steam(_a.set(p.x + (Math.random() - 0.5) * 0.15, p.rimY + 0.02, p.z + (Math.random() - 0.5) * 0.15), 1);
    }
    for (const p of [...C.pots, ...C.tares]) if (p.item && p.item.tools) for (const tl of p.item.tools) { if (tl.dead || !tl.cup) continue; const cw = tl.obj.localToWorld(_a.copy(tl.cup)), ly = p.liqY; if (ly > 0 && Math.abs(cw.y - ly) < 0.03 && Math.hypot(cw.x - p.x, cw.z - p.z) < p.r) { const sp = tl.vel ? tl.vel.length() : 0, mv = tl.held ? Math.max(sp, 0.3) : sp; if (mv > 0.05 && Math.random() < dt * 30) (p.water || p.item.liq.userData.water)?.poke(cw.x - p.x, cw.z - p.z, Math.min(0.004, 0.0008 + mv * 0.002), 0.018); } }   // a ladle or a basket moving in the liquid stirs its surface
    C.baskets.forEach((b, i) => drawDial(C.dials[i], b.noodles ? b.noodles.cook : 0, !!b.noodles, i));
    for (const u of C.ups) u(dt, t);
    return boil / 2;
  };
  return C;
}
const _a = new V3(), _bp = new V3(), _bp2 = new V3(), _bp3 = new V3(), _bp4 = new V3();
