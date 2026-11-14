// the station: a New York subway platform in 1985 (59 St, Columbus Circle), where the cart stands: tiled walls and their name tablets, steel columns, the yellow edge and the track, tube lights, a newsstand, a token booth, benches, stairs at either end, and the train that comes in
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, clamp } from './ctx.js';
import * as T from './tex.js';
import { buildBlock } from './block.js';

export const FOG = 0x0b100f;
export function buildStation(scene) {
  const city = new THREE.Group(); scene.add(city); const glow = new THREE.Group(); city.add(glow); const ups = [];
  const glowMap = T.glowTex();
  const halo = (color, size, x, y, z, parent = glow, op = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op, fog: true })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); s.userData.nopick = true; return s; };
  const real = (n, size, color = 0xffffff) => T.worldUV(mat({ map: T.photo(n), color }), size), flat = (c) => mat({ color: c });
  const L = 64, EDGE = -5.95, TZ = -7.5, WALLZ = -10.2, BACK = 3.7, CEIL = 3.5;
  const floorM = real('concrete_dirty', 3, 0xa4a49c), tileM = real('tile_white', 1.3, 0xcfcfc2), tileD = real('tile_white', 1.3, 0x9a9a90), bedM = real('asphalt', 2.5, 0x4a4844), steel = flat(0x24362c), dark = flat(0x121416), rail = real('rust', 1.5, 0x8a8480), wood = real('wood', 1.2, 0x9a8a78), blue = flat(0x1c3a5a), cream = flat(0xd8d2be);
  // platform, its yellow strip and nosing, the wall under the edge
  box(L, 0.5, BACK - EDGE, floorM, 0, -0.25, (BACK + EDGE) / 2, city); box(L, 0.012, 0.5, flat(0xc49a1c), 0, 0.007, EDGE + 0.27, city).castShadow = false; box(L, 0.05, 0.14, flat(0x8a8a82), 0, 0, EDGE + 0.02, city);
  // the track: ballast, ties, running rails, the covered third rail
  box(L, 0.3, EDGE - WALLZ, bedM, 0, -1.4, (EDGE + WALLZ) / 2, city); for (let x = -L / 2 + 0.3; x < L / 2; x += 0.62) box(0.2, 0.1, 2.4, flat(0x2a2018), x, -1.22, TZ, city).castShadow = false;
  for (const z of [TZ - 0.72, TZ + 0.72]) box(L, 0.14, 0.07, rail, 0, -1.12, z, city); box(L, 0.12, 0.16, flat(0x3a3a36), 0, -1.06, TZ - 1.55, city);
  // walls: white tile, a blue band, the station's name set in tile along it
  box(L, 5.4, 0.3, tileD, 0, 1.0, WALLZ - 0.15, city); box(L, 4.2, 0.3, tileM, 0, CEIL - 2.1, BACK + 0.15, city); box(L, 0.4, 0.04, blue, 0, 2.3, WALLZ + 0.02, city).castShadow = false; box(L, 0.4, 0.04, blue, 0, 2.55, BACK - 0.02, city).castShadow = false;
  const tablet = T.canvasTex(512, 160, (g, w, h) => { g.fillStyle = '#16345a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8d2be'; g.lineWidth = 10; g.strokeRect(9, 9, w - 18, h - 18); g.strokeStyle = '#8a5a1c'; g.lineWidth = 4; g.strokeRect(22, 22, w - 44, h - 44); g.fillStyle = '#efe9d6'; g.textAlign = 'center'; g.font = 'bold 76px Georgia, serif'; g.fillText('59TH STREET', w / 2, 92, w - 70); g.font = 'bold 30px Georgia, serif'; g.fillText('COLUMBUS CIRCLE', w / 2, 132); }), tabM = new THREE.MeshBasicMaterial({ map: tablet, color: 0x9a9a9a });
  for (let x = -24; x <= 24; x += 8) { const m = mesh(new THREE.PlaneGeometry(2.6, 0.81), tabM, x, 2.3, WALLZ + 0.05, city); m.castShadow = false; if (Math.abs(x + 4) < 27) { const b = mesh(new THREE.PlaneGeometry(2.6, 0.81), tabM, x + 4, 2.55, BACK - 0.05, city); b.rotation.y = Math.PI; b.castShadow = false; } }
  // ceiling, cross beams, the row of columns by the edge
  box(L, 0.3, BACK - WALLZ + 0.6, dark, 0, CEIL + 0.15, (BACK + WALLZ) / 2, city).castShadow = false;
  for (let x = -L / 2 + 2.5; x < L / 2; x += 5) { box(0.3, 0.32, BACK - WALLZ, flat(0x1c2420), x, CEIL - 0.16, (BACK + WALLZ) / 2, city).castShadow = false;
    box(0.16, CEIL, 0.03, steel, x, CEIL / 2, -5.0, city); for (const s of [-1, 1]) box(0.03, CEIL, 0.26, steel, x + s * 0.09, CEIL / 2, -5.0, city); box(0.36, 0.36, 0.36, flat(0x202220), x, 0.18, -5.0, city);
    const pl = mesh(new THREE.PlaneGeometry(0.2, 0.3), new THREE.MeshBasicMaterial({ map: T.labelTex(['59'], { w: 96, h: 144, fs: 76, bg: '#101214', fg: '#e8e4d8' }), color: 0x9a9a9a }), x, 2.0, -4.86, city); pl.castShadow = false; }
  // tube lights down the platform; the three by the cart light it for real
  const tubeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.85, 1.65), toneMapped: false });
  for (let x = -L / 2 + 5; x < L / 2; x += 5) for (const z of [-2.7, 1.9]) { box(1.5, 0.07, 0.24, flat(0x7a7a74), x, CEIL - 0.04, z, city).castShadow = false; const t = mesh(new THREE.BoxGeometry(1.34, 0.04, 0.05), tubeM, x, CEIL - 0.1, z, city); t.castShadow = false; if (Math.abs(x) < 16 && z < 0) halo(0xcfe8d8, 1.5, x, CEIL - 0.14, z, glow, 0.16); }
  scene.add(new THREE.HemisphereLight(0xb8d0c8, 0x40443c, 2.3));
  for (const [x, z, k] of [[-5, -2.7, 8], [0, -3.4, 8], [5, -2.7, 8], [0, 2.2, 4]]) { const p = new THREE.PointLight(0xd4ecdc, k, 12, 1.6); p.position.set(x, CEIL - 0.35, z); scene.add(p); }
  // hanging enamel signs
  const sign = T.canvasTex(1024, 176, (g, w, h) => { g.fillStyle = '#0c0c0d'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, 10); g.font = 'bold 74px Helvetica, Arial, sans-serif'; g.fillText('59 St', 28, 96); g.font = '38px Helvetica, Arial, sans-serif'; g.fillText('Columbus Circle', 30, 150); [['A', '#2a4aa8'], ['C', '#2a4aa8'], ['B', '#e0661c'], ['D', '#e0661c'], ['1', '#c8281e']].forEach(([n, c], i) => { g.fillStyle = c; g.beginPath(); g.arc(560 + i * 92, 92, 40, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 54px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(n, 560 + i * 92, 111); g.textAlign = 'left'; }); }), signM = new THREE.MeshBasicMaterial({ map: sign, color: 0xb0b0b0, side: THREE.DoubleSide });
  for (const x of [-11, 10]) { const m = mesh(new THREE.PlaneGeometry(2.9, 0.5), signM, x, 2.75, -3.9, city); m.castShadow = false; for (const s of [-1.2, 1.2]) box(0.02, CEIL - 3.0, 0.02, dark, x + s, (CEIL + 3.0) / 2, -3.9, city).castShadow = false; }
  // benches against the back wall, a wire bin, a pay phone
  for (const x of [-9, 8]) { for (let k = 0; k < 4; k++) box(2.2, 0.035, 0.1, wood, x, 0.46, BACK - 0.72 + k * 0.13, city); for (let k = 0; k < 3; k++) box(2.2, 0.1, 0.03, wood, x, 0.62 + k * 0.14, BACK - 0.2, city); for (const dx of [-0.95, 0, 0.95]) { box(0.05, 0.46, 0.5, dark, x + dx, 0.23, BACK - 0.5, city); box(0.05, 0.5, 0.04, dark, x + dx, 0.7, BACK - 0.18, city); } }
  cyl(0.24, 0.2, 0.75, flat(0x2a4034), 4.6, 0.38, BACK - 0.5, city, 12, true).material.side = THREE.DoubleSide;
  box(0.34, 0.5, 0.2, flat(0x1c3a6a), -6, 1.35, BACK - 0.12, city); box(0.3, 0.1, 0.04, flat(0xc8c8c8), -6, 1.62, BACK - 0.21, city); box(0.06, 0.24, 0.06, dark, -6.1, 1.3, BACK - 0.25, city); box(0.5, 0.9, 0.04, flat(0x8a8a84), -6, 1.35, BACK - 0.02, city);
  // the newsstand
  { const x = 14, g = new THREE.Group(); g.position.set(x, 0, BACK - 0.75); city.add(g); box(3.2, 2.5, 1.4, flat(0x1c4a34), 0, 1.25, 0, g); box(3.0, 1.3, 0.1, new THREE.MeshBasicMaterial({ color: 0x4a4436 }), 0, 1.55, -0.68, g).castShadow = false; box(3.3, 0.06, 0.5, wood, 0, 0.9, -0.9, g);
    const nm = mesh(new THREE.PlaneGeometry(3.0, 0.36), new THREE.MeshBasicMaterial({ map: T.labelTex(['NEWS · CANDY · CIGARS'], { w: 1024, h: 124, fs: 78, bg: '#e8d48a', fg: '#7a1612' }), color: 0xc8c8c8 }), 0, 2.3, -0.71, g); nm.rotation.y = Math.PI; nm.castShadow = false;
    const R = T.rng(59), cols = [0xc8281e, 0x2a4aa8, 0xe8c020, 0x2a8a4a, 0xe8e4d8, 0x1a1a1c, 0xe0661c]; for (let r = 0; r < 3; r++) for (let k = 0; k < 13; k++) { const m = box(0.19, 0.26, 0.02, new THREE.MeshBasicMaterial({ color: new THREE.Color(cols[(R() * cols.length) | 0]).multiplyScalar(0.55) }), -1.35 + k * 0.225, 1.2 + r * 0.33, -0.74, g); m.rotation.x = 0.2; m.castShadow = false; }
    for (let k = 0; k < 9; k++) box(0.26, 0.06 + R() * 0.1, 0.34, flat([0xd8d2be, 0xc8c2ae, 0xe8e4d8][k % 3]), -1.3 + k * 0.32, 0.96, -0.9, g); halo(0xffd890, 2.2, x, 1.9, BACK - 1.6, glow, 0.12); }
  // the token booth
  { const x = -18, g = new THREE.Group(); g.position.set(x, 0, BACK - 0.9); city.add(g); box(2.0, 1.1, 1.6, flat(0x3a4a44), 0, 0.55, 0, g); box(2.0, 0.12, 1.6, flat(0x2a3430), 0, 2.5, 0, g); for (const sx of [-0.96, 0.96]) for (const sz of [-0.76, 0.76]) box(0.08, 1.3, 0.08, flat(0x2a3430), sx, 1.75, sz, g);
    box(1.8, 1.2, 1.4, new THREE.MeshBasicMaterial({ color: 0x6a644c }), 0, 1.75, 0, g).castShadow = false; const gm = mat({ color: 0x9ab0a8, transparent: true, opacity: 0.25 }); box(1.84, 1.24, 0.02, gm, 0, 1.75, -0.78, g).castShadow = false;
    const nm = mesh(new THREE.PlaneGeometry(1.7, 0.3), new THREE.MeshBasicMaterial({ map: T.labelTex(['TOKENS  90¢'], { w: 640, h: 112, fs: 74, bg: '#0c0c0d', fg: '#f2f2ee' }), color: 0xc0c0c0 }), 0, 2.72, -0.81, g); nm.rotation.y = Math.PI; nm.castShadow = false; }
  // stairs up to the street at either end
  for (const s of [-1, 1]) for (let k = 0; k < 12; k++) box(2.4, 0.19, 0.3, floorM, s * 27.5, 0.095 + k * 0.19, BACK - 2.6 + (k * 0.3) * 0 + 0, city).position.set(s * (25.2 + k * 0.3), 0.095 + k * 0.19, BACK - 1.3);
  // the train: four cars in, a stop, and away again
  const train = new THREE.Group(); train.position.set(160, 0, TZ); city.add(train); train.userData.dyn = true;
  const winT = T.canvasTex(1024, 128, (g, w, h) => { g.fillStyle = '#8a9296'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3a6a'; g.fillRect(0, 96, w, 12); for (let i = 0; i < 4; i++) { const x = 40 + i * 250; g.fillStyle = '#ffe9b8'; g.fillRect(x, 18, 150, 52); g.fillStyle = '#5a6266'; g.fillRect(x + 170, 10, 60, 112); g.fillStyle = '#ffe9b8'; g.fillRect(x + 178, 18, 20, 50); g.fillRect(x + 202, 18, 20, 50); } }), sideM = new THREE.MeshBasicMaterial({ map: winT, color: 0x9a9a9a }), bodyM = flat(0x7a8286);
  for (let i = 0; i < 4; i++) { const cx = (i - 1.5) * 15.6; box(15.2, 2.75, 2.7, bodyM, cx, 1.45, 0, train).castShadow = false; box(15.0, 0.7, 2.3, dark, cx, -0.45, 0, train).castShadow = false; const sd = mesh(new THREE.PlaneGeometry(15.2, 1.9), sideM, cx, 1.55, 1.36, train); sd.castShadow = false; }
  for (const z of [-0.8, 0.8]) { const h = mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.8, 2.2), toneMapped: false }), -31.3, 0.9, z, train); h.castShadow = false; } halo(0xfff0c0, 3, -31.4, 0.9, 0, train, 0.5);
  train.traverse((o) => { o.userData.nopick = true; o.userData.dyn = true; });
  let st = 'away', tt = 25, v = 0, trainK = 0;
  ups.push((dt) => { tt -= dt; const x = train.position.x;
    if (st === 'away') { train.visible = false; if (tt <= 0) { st = 'in'; train.position.x = 150; v = 17; train.visible = true; } }
    else if (st === 'in') { v = Math.max(0.6, Math.min(17, Math.abs(x) * 0.42 + 0.4)); train.position.x = Math.max(0, x - v * dt); if (train.position.x <= 0.02) { st = 'stop'; tt = 13; v = 0; G.audio?.play('click'); } }
    else if (st === 'stop') { if (tt <= 0) st = 'out'; }
    else { v = Math.min(18, v + 1.5 * dt); train.position.x -= v * dt; if (train.position.x < -150) { st = 'away'; tt = 70 + Math.random() * 60; } }
    trainK = train.visible ? clamp(1 - Math.abs(train.position.x) / 70, 0, 1) * clamp(v / 9, 0.12, 1) : 0; });
  // where the platform's people stop: the newsstand, the booth, the phone, a bench, the busker's pitch
  const P = (x, z) => new THREE.Vector3(x, 0, z), shops = [{ type: 'newsstand', open: true, p: P(14, BACK - 2.0) }, { type: 'booth', open: true, p: P(-18, BACK - 2.1) }, { type: 'phone', open: true, p: P(-6, BACK - 0.7) }, { type: 'bench', open: true, p: P(8, BACK - 1.2) }, { type: 'busk', open: true, p: P(-12.5, BACK - 0.9) }, { type: 'edge', open: true, p: P(3, -4.2) }];
  const block = buildBlock(city, shops, { near: -2.6, far: -4.3, split: -3.5, end: 24.5 }); ups.push((dt, t) => block.update(dt, t));
  return { group: city, shops, glow, station: true, get trainK() { return trainK; }, update(dt, t) { for (const u of ups) u(dt, t); }, halo, rain: null, cars: [], glowMap, bakeFar() { }, reflect() { } };
}
