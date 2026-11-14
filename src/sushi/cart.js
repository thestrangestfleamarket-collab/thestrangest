// the yatai itself: its frame, stove and pots, crocks, bins, board, shelves, switches, the ticket rail and the till
import * as THREE from 'three';
import { G, V3, Q, mat, mesh, box, cyl, quatLook, clamp } from './ctx.js';
import * as T from './tex.js';
import { Bowl, Food, Raw, Drink, Ladle, Basket, Knife, TOPPINGS, TARE, BROTH, RAW, doneness } from './items.js';

export const SEATS = [-0.72, 0, 0.72];
export const RECIPES = {
  shoyu: { name: 'SHOYU', jp: '醤油ラーメン', price: 450, broth: 'chicken', tare: 'shoyu', tops: { chashu: 2, menma: 1, negi: 1, nori: 1, naruto: 1 } },
  shio: { name: 'SHIO', jp: '塩ラーメン', price: 450, broth: 'chicken', tare: 'shio', tops: { chashu: 2, menma: 1, negi: 1, egg: 1 } },
  miso: { name: 'MISO', jp: '味噌ラーメン', price: 500, broth: 'chicken', tare: 'miso', tops: { chashu: 2, corn: 1, negi: 1, menma: 1 } },
  tonkotsu: { name: 'TONKOTSU', jp: '豚骨ラーメン', price: 550, broth: 'tonkotsu', tare: 'shio', tops: { chashu: 2, egg: 1, negi: 1, nori: 1 } },
};

export function buildCart(scene, city) {
  const cart = new THREE.Group(); scene.add(cart); G.pickRoot.add(cart);
  const C = { group: cart, pots: [], bins: {}, board: null, open: false, ups: [], knobs: [] };
  G.cart = C;
  const wood = mat({ map: T.woodTex('#5a3a22', '#24140a', [2, 1]), roughness: 0.62 });
  const woodDark = mat({ map: T.woodTex('#3a2414', '#150c06', [2, 1], 5), roughness: 0.7 });
  const woodLight = mat({ map: T.woodTex('#8f7350', '#54391f', [1, 1], 9), roughness: 0.6 });
  T.dirty(wood.map, 2, { stains: 26, drips: 12, scratches: 60, rings: 4 }); T.dirty(woodDark.map, 3, { stains: 18, scratches: 40, drips: 8 }); T.dirty(woodLight.map, 4, { stains: 30, rings: 16, scratches: 90 });
  for (const m of [wood, woodDark, woodLight]) { m.normalMap = T.normalOf(m.map, 1.6); m.normalScale.set(0.6, 0.6); }
  const steel = mat({ map: T.steelTex([2, 2]), color: 0xcfd2d6, metalness: 0.55, roughness: 0.34, envMapIntensity: 1.6 });
  T.dirty(steel.map, 5, { scratches: 220, stains: 20, rings: 10 }); steel.roughnessMap = T.smudgeTex([2, 2]); steel.roughness = 0.62; woodLight.roughnessMap = T.smudgeTex([1, 1], 9); woodLight.roughness = 0.85;
  const steelDS = Object.assign(steel.clone(), { side: THREE.DoubleSide });
  const black = mat({ color: 0x111113, roughness: 0.6, metalness: 0.4 });
  const surf = (minX, maxX, minZ, maxZ, y) => G.surfaces.push({ minX, maxX, minZ, maxZ, y });
  const halo = city.halo;

  // ---------------- structure ----------------
  box(2.3, 0.88, 0.4, wood, 0, 0.44, -0.35, cart);                       // front body
  box(2.3, 0.02, 0.42, steel, 0, 0.89, -0.35, cart); surf(-1.15, 1.15, -0.56, -0.14, 0.9);
  box(2.44, 0.04, 0.36, woodLight, 0, 0.98, -0.71, cart); surf(-1.22, 1.22, -0.89, -0.53, 1.0); // customer ledge
  box(2.4, 0.9, 0.04, woodDark, 0, 0.51, -0.57, cart);                    // front panel
  box(2.3, 0.1, 0.02, steel, 0, 0.95, -0.545, cart);                      // backsplash lip
  box(0.45, 0.8, 1.15, wood, -0.925, 0.4, 0.425, cart); box(0.47, 0.02, 1.17, steel, -0.925, 0.81, 0.425, cart); surf(-1.15, -0.7, -0.15, 1.0, 0.82); // stove wing
  box(0.45, 0.88, 1.15, wood, 0.925, 0.44, 0.425, cart); box(0.47, 0.02, 1.17, woodLight, 0.925, 0.89, 0.425, cart); surf(0.7, 1.15, -0.15, 1.0, 0.9); // prep wing
  box(1.4, 0.03, 1.95, mat({ color: 0x1a1a1c, roughness: 0.8 }), 0, 0.015, 0.75, cart).castShadow = false; // rubber floor mat
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
  const tileM = mat({ map: tileT, roughness: 0.6, metalness: 0.5, side: THREE.DoubleSide }); tileM.normalMap = T.normalOf(tileT, 3);
  for (const [zc, rx] of [[-0.82, -0.32], [1.12, 0.32]]) { const r = box(3.5, 0.03, 2.12, tileM, 0, 2.97, zc, cart); r.rotation.x = rx; }
  for (const [zc, rx] of [[-0.42, -0.36], [0.72, 0.36]]) { const r = box(2.7, 0.03, 1.25, tileM, 0, 3.42, zc, cart); r.rotation.x = rx; }
  box(2.8, 0.06, 0.1, woodDark, 0, 3.64, 0.15, cart);
  for (const sx of [-1.5, 1.5]) { const tri = new THREE.Shape(); tri.moveTo(-1.9, 0); tri.lineTo(1.9, 0); tri.lineTo(0, 0.62); tri.closePath(); const gm = mesh(new THREE.ShapeGeometry(tri), mat({ map: woodLight.map, roughness: 0.8, side: THREE.DoubleSide }), sx, 2.62, 0.15, cart); gm.rotation.y = Math.PI / 2; }
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
    C.noren.push({ mesh: n, base: n.geometry.attributes.position.array.slice(), ph: i * 1.7 });
  }
  const lanternT = T.canvasTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#b01a10'); gr.addColorStop(0.5, '#ff4a2a'); gr.addColorStop(1, '#b01a10'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(60,0,0,0.5)'; for (let y = 10; y < h; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#140404'; g.font = `bold 78px ${T.JP}`; g.textAlign = 'center';
    for (const x of [64, 192]) { g.fillText('ラ', x, 86); g.fillText('メ', x, 164); g.fillText('ン', x, 240); }
  });
  T.dirty(lanternT, 8, { stains: 12, drips: 10, soot: 1 });
  const lanternM = new THREE.MeshStandardMaterial({ map: lanternT, emissiveMap: lanternT, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.8 });
  C.lanternM = lanternM; C.lanternHalos = []; C.lanternLights = [];
  C.lanterns = [];
  for (const x of [-1.52, 1.52]) {
    const pv = new THREE.Group(); pv.position.set(x, 2.55, -1.5); cart.add(pv); C.lanterns.push(pv); cyl(0.004, 0.004, 0.3, black, 0, 0.1, 0, pv, 4);
    const l = mesh(new THREE.SphereGeometry(0.17, 20, 14), lanternM, 0, -0.38, 0, pv); l.scale.y = 1.35; l.castShadow = false;
    cyl(0.09, 0.09, 0.04, black, 0, -0.15, 0, pv, 12); cyl(0.09, 0.09, 0.04, black, 0, -0.61, 0, pv, 12); cyl(0.004, 0.004, 0.15, black, 0, -0.07, 0, pv, 4);
    C.lanternHalos.push(halo(0xff5a30, 1.5, 0, -0.38, 0, pv, 0.1));
    const pl = new THREE.PointLight(0xff5a30, 0, 5, 1.8); pl.position.set(0, -0.4, -0.12); pv.add(pl); C.lanternLights.push(pl);
  }
  const signT = T.neonTex('ラーメン', '#ff3d2a', { sub: 'RAMEN  夜鳴きそば', fs: 110, panel: '#1a0a08' });
  C.signM = new THREE.MeshBasicMaterial({ map: signT, toneMapped: false, color: new THREE.Color(0.25, 0.25, 0.25) });
  T.dirty(signT, 10, { stains: 26, drips: 8 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7 * signT.image.height / signT.image.width), C.signM); sign.position.set(0, 3.9, -0.2); sign.rotation.y = Math.PI; cart.add(sign);
  box(1.76, 0.62, 0.06, black, 0, 3.9, -0.16, cart); for (const sx of [-0.7, 0.7]) box(0.05, 0.5, 0.05, woodDark, sx, 3.5, -0.16, cart);
  C.signHalo = halo(0xff3d2a, 3.4, 0, 3.9, -0.5, cart, 0);

  // work lights: bare bulbs under the roof (real shadow-casting sources)
  const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.5, 1.5), toneMapped: false });
  C.bulbs = [];
  [[-0.55, -0.25, true], [0.6, 0.1, false], [0, -1.05, false]].forEach(([x, z, sh], i) => {
    const pv = new THREE.Group(); pv.position.set(x, 2.62, z); cart.add(pv); C.bulbs.push(pv);
    cyl(0.003, 0.003, 0.2, black, 0, -0.11, 0, pv, 4); cyl(0.016, 0.02, 0.04, black, 0, -0.21, 0, pv, 8);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), bulbM); b.position.set(0, -0.255, 0); pv.add(b); b.userData.nopick = true;
    halo(0xffc070, 0.26, 0, -0.255, 0, pv, 0.3);
    const l = new THREE.PointLight(0xffb878, i === 2 ? 1.1 : 1.7, 6, 1.8); l.position.set(0, -0.28, 0); pv.add(l);
    if (sh) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.002; l.shadow.radius = 4; l.shadow.camera.near = 0.08; l.shadow.camera.far = 6; }
  });

  // stools
  for (const x of SEATS) { cyl(0.16, 0.16, 0.05, mat({ color: 0x7a1814, roughness: 0.45 }), x, 0.67, -1.16, cart, 20); cyl(0.02, 0.02, 0.65, steel, x, 0.33, -1.16, cart, 8); cyl(0.17, 0.19, 0.02, steel, x, 0.01, -1.16, cart, 16); mesh(new THREE.TorusGeometry(0.13, 0.008, 6, 20), steel, x, 0.28, -1.16, cart).rotation.x = Math.PI / 2; }
  // placemats on the ledge
  C.seatSpots = SEATS.map((x) => { const p = box(0.3, 0.004, 0.22, mat({ color: 0x2a3a2e, roughness: 0.9 }), x, 1.002, -0.71, cart); p.castShadow = false; return new V3(x, 1.0, -0.71); });
  // chopstick jar + shichimi on the ledge
  for (const x of [-0.36, 0.36]) { cyl(0.035, 0.03, 0.1, mat({ color: 0x222226, roughness: 0.3 }), x, 1.05, -0.8, cart, 12); for (let i = 0; i < 7; i++) { const c = cyl(0.0025, 0.002, 0.2, woodLight, x + Math.cos(i) * 0.015, 1.1, -0.8 + Math.sin(i) * 0.015, cart, 4); c.rotation.z = Math.cos(i * 2) * 0.12; c.rotation.x = Math.sin(i * 3) * 0.12; } cyl(0.018, 0.018, 0.07, mat({ color: 0xb02a1a, roughness: 0.4 }), x + 0.08, 1.035, -0.82, cart, 10); }

  { const bk = new THREE.Group(); cart.add(bk);
    box(1.36, 0.86, 0.34, wood, 0, 0.43, 1.62, bk); box(1.4, 0.03, 0.38, woodLight, 0, 0.885, 1.62, bk); surf(-0.7, 0.7, 1.43, 1.81, 0.9);
    for (const dx of [-0.34, 0.34]) { box(0.6, 0.7, 0.02, woodDark, dx, 0.44, 1.445, bk); cyl(0.012, 0.012, 0.03, steel, dx + (dx < 0 ? 0.22 : -0.22), 0.5, 1.43, bk, 8).rotation.x = Math.PI / 2; }
    cyl(0.13, 0.12, 0.2, mat({ color: 0xe8e4d8, roughness: 0.35 }), -0.45, 1.0, 1.64, bk, 20); cyl(0.125, 0.13, 0.05, mat({ color: 0x8a1c1c, roughness: 0.4 }), -0.45, 1.125, 1.64, bk, 20); cyl(0.02, 0.02, 0.03, black, -0.45, 1.16, 1.64, bk, 8);
    cyl(0.09, 0.11, 0.17, steel, 0.5, 0.985, 1.66, bk, 16); const sp = cyl(0.012, 0.02, 0.12, steel, 0.6, 1.02, 1.66, bk, 8); sp.rotation.z = -0.9; mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 14, Math.PI), black, 0.5, 1.08, 1.66, bk);
    for (let i = 0; i < 5; i++) { const b = new Bowl(); const o = b.obj; b.remove(); o.userData.item = null; o.position.set(0.05, 0.9 + i * 0.022, 1.66); o.rotation.y = i * 1.3; bk.add(o); }
    box(0.34, 0.2, 0.26, mat({ map: woodLight.map, roughness: 0.9 }), -0.08, 1.0, 1.66, bk).rotation.y = 0.15;
    box(1.4, 0.03, 0.22, woodLight, 0, 1.62, 1.72, bk); for (const sx of [-0.66, 0.66]) box(0.03, 0.74, 0.2, woodDark, sx, 1.26, 1.72, bk);
    for (let i = 0; i < 9; i++) cyl(0.045, 0.045, 0.14 + (i % 3) * 0.04, mat({ color: [0x5a2a0c, 0xb8c8c0, 0x8a5a14, 0x2a3a24][i % 4], roughness: 0.2 }), -0.56 + i * 0.14, 1.71 + (i % 3) * 0.02, 1.72, bk, 10);
    bk.traverse((o) => { o.userData.nopick = true; }); }

  // ---------------- stove + pots ----------------
  const potDefs = [
    { id: 'noodle', type: null, x: -0.93, z: 0.05, r: 0.165, h: 0.22, color: 0xd8dcc8, heat: 0.45, label: ['麺 NOODLES'] },
    { id: 'chicken', type: 'chicken', x: -0.93, z: 0.42, r: 0.15, h: 0.28, color: BROTH.chicken.color, heat: 0.7, label: ['鶏ガラ CHICKEN'] },
    { id: 'tonkotsu', type: 'tonkotsu', x: -0.93, z: 0.79, r: 0.15, h: 0.28, color: BROTH.tonkotsu.color, heat: 0.7, label: ['豚骨 TONKOTSU'] },
  ];
  const flameM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 0.9, 3), toneMapped: false, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const brothMap = T.brothTex('pot');
  potDefs.forEach((d, i) => {
    const p = { ...d, on: false, baseY: 0.86, rimY: 0.86 + d.h, liqY: 0.86 + d.h * 0.8, hot: false };
    mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 20), black, d.x, 0.84, d.z, cart).rotation.x = Math.PI / 2; // burner
    for (let k = 0; k < 4; k++) { const g = box(0.26, 0.012, 0.014, black, d.x, 0.853, d.z, cart); g.rotation.y = (k * Math.PI) / 4; }
    p.flames = []; for (let k = 0; k < 12; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.035, 6), flameM); f.position.set(d.x + Math.cos(k * 0.524) * 0.1, 0.862, d.z + Math.sin(k * 0.524) * 0.1); f.visible = false; f.userData.nopick = true; cart.add(f); p.flames.push(f); }
    cyl(d.r, d.r, d.h, steelDS, d.x, 0.86 + d.h / 2, d.z, cart, 32, true);
    cyl(d.r, d.r, 0.006, steel, d.x, 0.863, d.z, cart, 32);
    mesh(new THREE.TorusGeometry(d.r, 0.006, 6, 32), steel, d.x, p.rimY, d.z, cart).rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 12, Math.PI), steel, d.x, p.rimY - 0.04, d.z + s * (d.r + 0.005), cart).rotation.set(0, Math.PI / 2, s > 0 ? 0 : 0);
    p.liqM = new THREE.MeshPhysicalMaterial({ color: d.color, map: d.type ? brothMap : null, roughness: 0.05, clearcoat: 1, transparent: true, opacity: d.type === 'tonkotsu' ? 1 : 0.9 });
    p.liq = mesh(new THREE.CircleGeometry(d.r - 0.004, 32).rotateX(-Math.PI / 2), p.liqM, d.x, p.liqY, d.z, cart); p.liq.castShadow = false;
    if (d.type) { // pork bones / chicken + aromatics peeking through the broth
      const bm = mat({ color: d.type === 'tonkotsu' ? 0xe8e0d0 : 0xd8b070, roughness: 0.6 });
      for (let k = 0; k < 4; k++) { const b = cyl(0.014, 0.018, 0.09, bm, d.x + Math.cos(k * 1.9) * 0.07, p.liqY - 0.005, d.z + Math.sin(k * 1.9) * 0.07, cart, 8); b.rotation.set(1.4, k, 0.3); }
      const ng = cyl(0.012, 0.012, 0.12, mat({ color: 0x5fae3a }), d.x + 0.03, p.liqY, d.z - 0.05, cart, 6); ng.rotation.set(1.5, 0.7, 0);
    }
    // bubbles
    p.bubbles = []; for (let k = 0; k < 10; k++) { const b = new THREE.Mesh(new THREE.RingGeometry(0.006, 0.009, 10).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); b.visible = false; b.userData = { t: Math.random(), nopick: true }; cart.add(b); p.bubbles.push(b); }
    // knob on the wing face toward the cook
    const kb = new THREE.Group(); kb.position.set(-0.695, 0.7, d.z); cart.add(kb);
    const km = cyl(0.03, 0.034, 0.03, black, 0, 0, 0, kb, 16); km.rotation.z = -Math.PI / 2; km.position.x = 0.015;
    const mark = box(0.004, 0.05, 0.008, mat({ color: 0xf0f0f0 }), 0.032, 0, 0, kb);
    const lt = mesh(new THREE.PlaneGeometry(0.16, 0.035), new THREE.MeshBasicMaterial({ map: T.labelTex(d.label, { w: 256, h: 56, fs: 26, bg: '#1a1a1c', fg: '#e8e0c8' }) }), -0.699, 0.76, d.z, cart); lt.rotation.y = Math.PI / 2; lt.castShadow = false;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0x401010 })); led.position.set(-0.697, 0.7, d.z - 0.06); cart.add(led);
    p.setOn = (on) => { p.on = on; kb.rotation.x = on ? Math.PI / 2 : 0; led.material.color.set(on ? new THREE.Color(3, 0.4, 0.1) : new THREE.Color(0x401010)); led.material.toneMapped = !on; p.flames.forEach((f) => (f.visible = on)); G.audio.play(on ? 'ignite' : 'click'); };
    km.userData.button = kb.userData.button = mark.userData.button = { getPos: () => _bp.set(-0.67, 0.7, d.z), r: 0.045, press: () => p.setOn(!p.on), name: `${d.id} burner knob` };
    G.buttons.push(km.userData.button);
    C.pots.push(p);
  });
  // steel splash guard with noodle timers
  box(0.02, 0.82, 1.1, steel, -1.155, 1.23, 0.42, cart); box(0.05, 0.03, 0.5, steel, -1.13, 1.255, 0.05, cart);
  C.dials = [0, 1].map((i) => {
    const t = T.panelTex(256, 256, () => { });
    const m = mesh(new THREE.CircleGeometry(0.075, 32), new THREE.MeshBasicMaterial({ map: t, color: 0xb0b0b0 }), -1.088, 1.36, -0.05 + i * 0.2, cart); m.rotation.y = Math.PI / 2; m.castShadow = false;
    cyl(0.08, 0.08, 0.055, black, -1.117, 1.36, -0.05 + i * 0.2, cart, 24).rotation.z = Math.PI / 2; cyl(0.012, 0.012, 0.03, steel, -1.075, 1.36, -0.05 + i * 0.2, cart, 8).rotation.z = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.076, 0.007, 8, 32), steel, -1.088, 1.36, -0.05 + i * 0.2, cart).rotation.y = Math.PI / 2;
    return { t, last: -1 };
  });
  const drawDial = (d, cook, has, i) => {
    const key = has ? Math.floor(cook * 4) : -2; if (key === d.last) return; d.last = key;
    d.t.redraw((g, w, h) => {
      g.fillStyle = '#f2ecd8'; g.fillRect(0, 0, w, h);
      const seg = (a, b, c) => { g.beginPath(); g.strokeStyle = c; g.lineWidth = 26; g.arc(128, 128, 92, -Math.PI / 2 + (a / 34) * 6.283, -Math.PI / 2 + (b / 34) * 6.283); g.stroke(); };
      seg(0, 9, '#c9c4b4'); seg(9, 14, '#e8c020'); seg(14, 23, '#2aa84a'); seg(23, 29, '#e8892a'); seg(29, 34, '#c8201c');
      g.fillStyle = '#222'; g.font = `bold 22px ${T.MONO}`; g.textAlign = 'center';
      g.fillText('RAW', 172, 62); g.fillText('FIRM', 196, 150); g.fillText('OK', 120, 212); g.fillText('SOFT', 52, 130);
      g.font = `bold 26px ${T.JP}`; g.fillText(`麺 ${i + 1}`, 128, 100);
      if (has) { const a = -Math.PI / 2 + (Math.min(cook, 33.5) / 34) * 6.283; g.strokeStyle = '#111'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84); g.stroke(); }
      g.fillStyle = '#111'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill();
      if (has) { g.font = `bold 24px ${T.MONO}`; g.fillText(doneness(cook).label, 128, 168); }
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
  C.brothLadles = [1, 2].map((i) => { const p = C.pots[i], l = new Ladle('broth', p.type, p); placeTool(l, new V3(p.x - 0.02, p.liqY - 0.01, p.z + 0.03), new V3(p.x + 0.27, p.rimY + 0.14, p.z - 0.04)); return l; });

  // tare crocks
  C.tares = Object.keys(TARE).map((k, i) => {
    const x = -0.64 + i * 0.15, z = -0.45, v = { x, z, r: 0.052, rimY: 1.02, liqY: 0.99, type: k, heat: 1 };
    cyl(0.055, 0.048, 0.12, mat({ color: [0x4a2a18, 0x8a5a2a, 0xd8d0c0][i], roughness: 0.3 }), x, 0.96, z, cart, 20, true).material.side = THREE.DoubleSide;
    cyl(0.048, 0.048, 0.005, black, x, 0.905, z, cart, 20);
    mesh(new THREE.CircleGeometry(0.05, 20).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: TARE[k].color, roughness: 0.08, clearcoat: 1 }), x, v.liqY, z, cart).castShadow = false;
    const lb = mesh(new THREE.PlaneGeometry(0.085, 0.04), new THREE.MeshBasicMaterial({ map: T.labelTex([`${TARE[k].jp} ${TARE[k].label}`], { w: 256, h: 120, fs: 50 }), color: 0xbbbbbb }), x, 0.96, z + 0.056, cart); lb.castShadow = false;
    const l = new Ladle('tare', k, v); placeTool(l, new V3(x, v.liqY - 0.004, z - 0.01), new V3(x + 0.02, 1.1, z + 0.12));
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
      cart.add(o); b.pieces.push(o);
    }
    b.refresh = () => {
      b.pieces.forEach((p, n) => (p.visible = b.stock > n * (k === 'nori' || k === 'menma' || k === 'corn' ? 3 : 1)));
      lt.redraw((g, w, h) => { g.fillStyle = b.stock ? '#e9e2c8' : '#e8a090'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.font = `bold 40px ${T.JP}`; g.fillText(TOPPINGS[k].label, w / 2, 40); g.font = `bold 34px ${T.MONO}`; g.fillText(b.stock ? `x${b.stock}` : 'EMPTY', w / 2, 82); });
    };
    b.refresh();
    const pos = new V3(x, 0.95, z);
    G.sources.push({ pos, r: 0.07, name: `${TOPPINGS[k].label.toLowerCase()} (bin)`, can: () => b.stock > 0, take: () => { b.stock--; b.refresh(); return new Food(k); }, bin: b });
    G.targets.push({ getPos: () => pos, r: 0.068, prio: 1, accepts: (it) => it.kind === 'food' && it.topping === k, receive: (it) => { b.stock += it.servings; it.remove(); b.refresh(); G.audio.play('plop'); } });
    C.bins[k] = b;
  });

  // ---------------- cutting board + knife ----------------
  C.board = { x: 0.37, y: 0.928, z: -0.265, item: null };
  box(0.36, 0.028, 0.2, woodLight, C.board.x, 0.914, C.board.z, cart); surf(0.19, 0.55, -0.365, -0.165, 0.928);
  G.targets.push({ getPos: () => _bp2.set(C.board.x - 0.03, C.board.y, C.board.z), r: 0.17, accepts: (it) => it.kind === 'raw' && !C.board.item, receive: (it) => { it.obj.position.set(C.board.x - 0.15, C.board.y + it.base, C.board.z); it.obj.quaternion.identity(); it.board = C.board; C.board.item = it; G.audio.play('place'); } });
  C.knife = new Knife(); C.knife.cup = C.knife.blade;
  C.knife.setHome(new V3(0.62, 0.912, -0.2), new Q().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)));
  // assembly mat
  box(0.86, 0.004, 0.2, mat({ color: 0x20262c, roughness: 0.85 }), -0.3, 0.902, -0.26, cart).castShadow = false;

  // ---------------- sources: bowls, noodles, raw, drinks ----------------
  const srcMesh = (m, src) => m.traverse((o) => { o.userData.source = src; });
  { // bowl stack
    const g = new THREE.Group(); g.position.set(0.93, 0.9, -0.36); cart.add(g);
    for (let i = 0; i < 6; i++) { const b = new Bowl(); const o = b.obj; b.remove(); o.userData.item = null; o.position.set(0, i * 0.022, 0); o.rotation.y = i; g.add(o); }
    const src = { pos: new V3(0.93, 1.06, -0.36), r: 0.12, name: 'clean bowl', can: () => true, take: () => new Bowl() };
    G.sources.push(src); srcMesh(g, src);
  }
  { // noodle box
    const g = new THREE.Group(); g.position.set(-0.93, 0.9, -0.36); cart.add(g);
    box(0.3, 0.012, 0.24, woodLight, 0, 0.006, 0, g); for (const [x, z, w, d] of [[0, 0.115, 0.3, 0.012], [0, -0.115, 0.3, 0.012], [0.145, 0, 0.012, 0.24], [-0.145, 0, 0.012, 0.24]]) box(w, 0.05, d, woodLight, x, 0.025, z, g);
    for (let i = 0; i < 6; i++) { const f = new Food('noodle'); const o = f.obj; f.remove(); o.userData.item = null; o.position.set(((i % 3) - 1) * 0.092, 0.012, (Math.floor(i / 3) - 0.5) * 0.105); o.scale.setScalar(0.72); o.rotation.y = i * 2; g.add(o); }
    const src = { pos: new V3(-0.93, 0.95, -0.36), r: 0.14, name: 'fresh noodle portion', can: () => true, take: () => new Food('noodle') };
    G.sources.push(src); srcMesh(g, src);
  }
  Object.keys(RAW).forEach((k, i) => {
    const z = -0.02 + i * 0.165, g = new THREE.Group(); g.position.set(0.925, 0.9, z); cart.add(g);
    box(0.34, 0.012, 0.14, steel, 0, 0.006, 0, g); for (const zz of [-0.07, 0.07]) box(0.34, 0.03, 0.006, steel, 0, 0.018, zz, g);
    const cnt = k === 'egg' ? 5 : k === 'negi' ? 3 : 2;
    for (let n = 0; n < cnt; n++) { const r = new Raw(k); const o = r.obj; r.remove(); o.userData.item = null; if (k === 'egg') o.position.set(-0.15 + n * 0.062, 0.036, 0); else o.position.set(-RAW[k].len / 2, 0.012 + RAW[k].r, (n - (cnt - 1) / 2) * (k === 'negi' ? 0.035 : RAW[k].r * 2.1)); g.add(o); }
    const lm = mesh(new THREE.PlaneGeometry(0.1, 0.03), new THREE.MeshBasicMaterial({ map: T.labelTex([RAW[k].name.toUpperCase()], { w: 320, h: 96, fs: 36 }), color: 0xcccccc }), -0.226, 0.03, 0, g); lm.rotation.y = -Math.PI / 2; lm.castShadow = false;
    const src = { pos: new V3(0.925, 0.95, z), r: 0.085, name: RAW[k].name, can: () => true, take: () => new Raw(k) };
    G.sources.push(src); srcMesh(g, src);
  });
  { // ice cooler with drinks
    const g = new THREE.Group(); g.position.set(0.935, 0.9, 0.68); cart.add(g);
    const cm = mat({ color: 0x1c4a8a, roughness: 0.4 });
    box(0.36, 0.012, 0.24, cm, 0, 0.006, 0, g); for (const [x, z, w, d] of [[0, 0.115, 0.36, 0.014], [0, -0.115, 0.36, 0.014], [0.173, 0, 0.014, 0.24], [-0.173, 0, 0.014, 0.24]]) box(w, 0.16, d, cm, x, 0.08, z, g);
    const ice = mesh(new THREE.BoxGeometry(0.33, 0.1, 0.21), new THREE.MeshPhysicalMaterial({ color: 0xdff2ff, roughness: 0.25, transmission: 0.3, thickness: 0.05 }), 0, 0.065, 0, g);
    ['beer', 'cola'].forEach((d, j) => {
      const grp = new THREE.Group(); g.add(grp);
      for (let n = 0; n < 3; n++) { const b = new Drink(d); const o = b.obj; b.remove(); o.userData.item = null; o.position.set(-0.11 + n * 0.11, 0.06, (j - 0.5) * 0.11); o.rotation.z = (n - 1) * 0.08; grp.add(o); }
      const src = { pos: new V3(0.935, 1.14, 0.68 + (j - 0.5) * 0.11), r: 0.075, name: d, can: () => true, take: () => { G.audio.play('bottle'); return new Drink(d); } };
      G.sources.push(src); srcMesh(grp, src);
    });
  }
  { // bus tub
    const g = new THREE.Group(); g.position.set(0.935, 0.9, 0.91); cart.add(g);
    const tm = mat({ color: 0x55585c, roughness: 0.6 });
    box(0.36, 0.01, 0.15, tm, 0, 0.005, 0, g); for (const [x, z, w, d] of [[0, 0.075, 0.36, 0.01], [0, -0.075, 0.36, 0.01], [0.175, 0, 0.01, 0.15], [-0.175, 0, 0.01, 0.15]]) box(w, 0.12, d, tm, x, 0.06, z, g);
    const lm = mesh(new THREE.PlaneGeometry(0.13, 0.04), new THREE.MeshBasicMaterial({ map: T.labelTex(['DIRTY BOWLS'], { w: 320, h: 96, fs: 38 }), color: 0xcccccc }), -0.181, 0.07, 0, g); lm.rotation.y = -Math.PI / 2;
    const pos = new V3(0.935, 0.98, 0.91);
    G.targets.push({ getPos: () => pos, r: 0.2, prio: 1, accepts: (it) => it.kind === 'bowl' || it.kind === 'drink', receive: (it) => { it.remove(); G.audio.play('clink'); G.game?.onBus?.(); } });
  }

  // ---------------- beam: ticket rail, recipe board ----------------
  box(2.3, 0.012, 0.012, steel, 0, 1.74, -0.53, cart);
  for (const x of [-1.1, 1.1]) cyl(0.003, 0.003, 0.82, black, x, 2.15, -0.53, cart, 4);
  const rb = T.canvasTex(2048, 512, (g, w, h) => {
    g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1612'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    const keys = Object.keys(RECIPES), cw = (w - 40) / 5;
    keys.forEach((k, i) => {
      const r = RECIPES[k], x = 20 + i * cw;
      g.fillStyle = '#7a1612'; g.fillRect(x + 8, 22, cw - 16, 70); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `bold 46px ${T.JP}`; g.fillText(`${r.name}  ¥${r.price}`, x + cw / 2, 72);
      g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.font = `bold 34px ${T.JP}`;
      const lines = [`1 TARE:  ${TARE[r.tare].label} ${TARE[r.tare].jp}`, `2 BROTH: ${BROTH[r.broth].label} x2`, `3 NOODLES (green zone)`, '4 TOPPINGS:'];
      lines.forEach((l, n) => g.fillText(l, x + 18, 140 + n * 46, cw - 30));
      g.font = `bold 32px ${T.JP}`; g.fillStyle = '#12406a';
      Object.entries(r.tops).forEach(([t, n], j) => g.fillText(`${TOPPINGS[t].label}${n > 1 ? ' x' + n : ''}`, x + 30 + (j % 2) * (cw / 2 - 10), 322 + Math.floor(j / 2) * 44, cw / 2 - 26));
    });
    const x = 20 + 4 * cw; g.fillStyle = '#12406a'; g.fillRect(x + 8, 22, cw - 16, 70); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `bold 44px ${T.JP}`; g.fillText('HOW IT WORKS', x + cw / 2, 72);
    g.fillStyle = '#1b1b1b'; g.textAlign = 'left'; g.font = `bold 29px ${T.JP}`;
    ['Knobs (left) light the burners.', 'OPEN switch (right post).', 'The ticket lists every step.', 'Tilt ladles/baskets to pour.', 'Chop on the board, fill bins.', 'Set the bowl on the placemat.', 'Dirty bowls → bus tub.', 'Drop a tool: it returns home.', 'FIRM = yellow zone on dial.'].forEach((l, n) => g.fillText('・' + l, x + 14, 132 + n * 41, cw - 26));
  });
  T.dirty(rb, 9, { stains: 40, rings: 12, drips: 10, yellow: 1, scratches: 30 });
  const board = mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: rb, color: 0x9a9a9a }), 0, 2.24, -0.5, cart); board.rotation.x = 0.36; board.castShadow = false;
  const menuT = T.canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#20140c'; g.fillRect(0, 0, w, h); g.textAlign = 'center';
    Object.values(RECIPES).forEach((r, i) => { const x = w * (0.125 + i * 0.25); g.fillStyle = '#f4ead2'; g.font = `bold 58px ${T.JP}`; g.fillText(r.jp, x, 90, 230); g.fillStyle = '#ffb040'; g.font = `bold 52px ${T.JP}`; g.fillText(`${r.price}円`, x, 160); g.fillStyle = '#c8b8a0'; g.font = `bold 30px ${T.JP}`; g.fillText(r.name, x, 210); });
  });
  const menu = mesh(new THREE.PlaneGeometry(1.8, 0.45), mat({ map: menuT, roughness: 0.8 }), 0, 2.24, -0.52, cart); menu.rotation.set(0.2, Math.PI, 0); menu.rotation.order = 'YXZ'; menu.rotation.x = -0.3;

  // ---------------- register LED + open switch (right post) ----------------
  const reg = new THREE.Group(); reg.position.set(1.02, 1.5, -0.47); reg.rotation.y = -0.75; cart.add(reg);
  box(0.36, 0.2, 0.08, black, 0, 0, -0.04, reg);
  C.led = T.panelTex(512, 256, () => { });
  mesh(new THREE.PlaneGeometry(0.33, 0.165), new THREE.MeshBasicMaterial({ map: C.led, toneMapped: false }), 0, 0, 0.002, reg).castShadow = false;
  const sw = new THREE.Group(); sw.position.set(0, -0.2, 0); reg.add(sw);
  box(0.16, 0.12, 0.05, mat({ color: 0x8a8d90, metalness: 0.8, roughness: 0.4 }), 0, 0, -0.025, sw);
  const lever = cyl(0.012, 0.012, 0.07, mat({ color: 0xd02020, roughness: 0.3 }), 0, 0, 0.03, sw, 10); lever.rotation.x = Math.PI / 2 - 0.6;
  const swl = mesh(new THREE.PlaneGeometry(0.15, 0.035), new THREE.MeshBasicMaterial({ map: T.labelTex(['営業 OPEN / CLOSE'], { w: 384, h: 90, fs: 36, bg: '#111', fg: '#ffd060' }) }), 0, 0.085, 0.001, sw);
  C.setOpen = (on) => {
    C.open = on; lever.rotation.x = Math.PI / 2 + (on ? 0.6 : -0.6);
    C.signM.color.setScalar(on ? 1.7 : 0.25); C.signHalo.material.opacity = on ? 0.45 : 0; lanternM.emissiveIntensity = on ? 2.4 : 0.25;
    C.lanternHalos.forEach((h) => (h.material.opacity = on ? 0.55 : 0.08)); C.lanternLights.forEach((l) => (l.intensity = on ? 2.2 : 0));
    G.audio.play('click');
  };
  const swb = { getPos: () => sw.getWorldPosition(_bp3), r: 0.06, press: () => G.game.toggleOpen(), name: 'OPEN / CLOSE switch' };
  sw.traverse((o) => (o.userData.button = swb)); G.buttons.push(swb);

  // ---------------- boombox (left post) ----------------
  const bb = new THREE.Group(); bb.position.set(-1.0, 1.42, -0.46); bb.rotation.y = 0.75; cart.add(bb);
  box(0.5, 0.02, 0.16, woodDark, 0, -0.13, -0.02, bb);
  box(0.46, 0.24, 0.11, mat({ color: 0x9a9da2, metalness: 0.7, roughness: 0.35 }), 0, 0, -0.055, bb);
  const bbT = T.canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#17181a'; g.fillRect(0, 0, w, h);
    for (const x of [100, 412]) { g.fillStyle = '#0a0a0b'; g.beginPath(); g.arc(x, 150, 82, 0, 7); g.fill(); g.strokeStyle = '#8a8d90'; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#2a2b2e'; g.lineWidth = 2; for (let r = 10; r < 80; r += 9) { g.beginPath(); g.arc(x, 150, r, 0, 7); g.stroke(); } g.fillStyle = '#3a3b3e'; g.beginPath(); g.arc(x, 150, 22, 0, 7); g.fill(); }
    g.fillStyle = '#26282c'; g.fillRect(196, 96, 120, 76); g.fillStyle = '#4a3a2a'; g.fillRect(208, 108, 96, 40); g.fillStyle = '#111'; g.beginPath(); g.arc(232, 128, 12, 0, 7); g.arc(280, 128, 12, 0, 7); g.fill();
    g.fillStyle = '#e8d9a0'; g.fillRect(150, 22, 212, 30); g.fillStyle = '#c8201c'; g.fillRect(240, 22, 3, 30); g.fillStyle = '#111'; g.font = 'bold 13px monospace'; g.fillText('FM 76  80  84  88  90  MHz', 158, 42);
    g.fillStyle = '#c8cacc'; g.font = 'bold 18px sans-serif'; g.fillText('STEREO RADIO CASSETTE', 152, 204);
  });
  mesh(new THREE.PlaneGeometry(0.45, 0.225), mat({ map: bbT, roughness: 0.5, metalness: 0.3 }), 0, 0, 0.001, bb).castShadow = false;
  for (const sx of [-0.152, 0.152]) { mesh(new THREE.TorusGeometry(0.074, 0.008, 8, 28), steel, sx, -0.02, 0.006, bb); const cone = mesh(new THREE.ConeGeometry(0.07, 0.035, 24, 1, true), mat({ color: 0x0c0c0e, roughness: 0.9, side: THREE.DoubleSide }), sx, -0.02, -0.012, bb); cone.rotation.x = -Math.PI / 2; mesh(new THREE.SphereGeometry(0.02, 12, 8), mat({ color: 0x2a2a2e, roughness: 0.5 }), sx, -0.02, -0.022, bb); }
  box(0.11, 0.07, 0.012, new THREE.MeshPhysicalMaterial({ color: 0x1a1410, roughness: 0.1, transparent: true, opacity: 0.6 }), 0, -0.012, 0.008, bb); for (const kx of [-0.04, 0.0, 0.04, 0.08]) box(0.03, 0.014, 0.02, black, kx, -0.075, 0.012, bb); for (const kx of [0.12, 0.17]) cyl(0.012, 0.012, 0.02, steel, kx, 0.09, 0.012, bb, 10).rotation.x = Math.PI / 2;
  const hb = mesh(new THREE.TorusGeometry(0.2, 0.008, 6, 20, Math.PI), black, 0, 0.11, -0.055, bb); hb.scale.y = 0.3;
  const mkBtn = (x, color, name, press) => {
    const b = cyl(0.022, 0.022, 0.02, mat({ color, roughness: 0.3 }), x, 0.13, -0.055, bb, 14);
    const btn = { getPos: () => b.getWorldPosition(new V3()), r: 0.035, press: () => { press(); G.audio.play('click'); b.position.y = 0.123; setTimeout(() => (b.position.y = 0.13), 150); }, name };
    b.userData.button = btn; G.buttons.push(btn);
  };
  mkBtn(-0.1, 0xc82020, 'radio power', () => G.audio.setRadio(!G.audio.radioOn));
  mkBtn(0.0, 0x2a2a2e, 'radio tune', () => G.audio.tune());
  cyl(0.004, 0.004, 0.4, steel, 0.2, 0.3, -0.08, bb, 4).rotation.z = -0.3;

  // ---------------- per-frame ----------------
  C.update = (dt, t) => {
    let boil = 0;
    for (const p of C.pots) {
      p.heat = clamp(p.heat + (p.on ? dt / 14 : -dt / 90), 0.15, 1); p.hot = p.heat > 0.9;
      const k = clamp((p.heat - 0.6) / 0.4, 0, 1); boil += k * (p.type ? 0.5 : 1);
      p.flames.forEach((f, i) => { f.scale.y = 0.8 + Math.sin(t * 30 + i * 2.1) * 0.25; });
      p.bubbles.forEach((b) => {
        b.userData.t += dt * (1.5 + k * 3) * (p.type ? 0.45 : 1);
        if (b.userData.t > 1) { b.userData.t = 0; const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * (p.r - 0.03); b.position.set(p.x + Math.cos(a) * d, p.liqY + 0.002, p.z + Math.sin(a) * d); }
        b.visible = k > 0.3; const s = 0.4 + b.userData.t * 1.6; b.scale.set(s, 1, s); b.material.opacity = 0.55 * (1 - b.userData.t);
      });
      if (k > 0.2 && Math.random() < dt * 9 * k) G.fx.steam(_a.set(p.x + (Math.random() - 0.5) * 0.15, p.rimY + 0.02, p.z + (Math.random() - 0.5) * 0.15), 1);
    }
    C.baskets.forEach((b, i) => drawDial(C.dials[i], b.noodles ? b.noodles.cook : 0, !!b.noodles, i));
    for (const u of C.ups) u(dt, t);
    return boil / 2;
  };
  return C;
}
const _a = new V3(), _bp = new V3(), _bp2 = new V3(), _bp3 = new V3();
