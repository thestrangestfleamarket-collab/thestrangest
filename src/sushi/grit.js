// wear and clutter round the cart: gas bottles, rags, crates, bags, litter, stains, hand-lettered prices, the morning paper on the ledge
import * as THREE from 'three';
import { G, mat, box, cyl, mesh, mergeStatic } from './ctx.js';
import * as T from './tex.js';
import { glb } from './models.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NZ, KERB } from './plan.js';

export function buildGrit(scene, city, cart) {
  const root = new THREE.Group(); scene.add(root);
  const R = T.rng(77), nop = (o) => { o.traverse((c) => { c.userData.nopick = true; }); return o; };
  const rusty = (color, seed) => { const t = T.canvasTex(256, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); }); T.dirty(t, seed, { rust: 22, stains: 14, scratches: 60, drips: 10 }); return mat({ map: t, roughness: 0.6, metalness: 0.5 }); };
  const stainM = {};
  const stain = (x, z, sx, sz, a = 0.5, y = 0.004, col = 0x050404) => { const sk = col + '|' + Math.round(a * 3), sm = stainM[sk] || (stainM[sk] = new THREE.MeshBasicMaterial({ map: city.glowMap, color: col, transparent: true, opacity: Math.round(a * 3) / 3 || 0.33, depthWrite: false })); const m = mesh(new THREE.PlaneGeometry(sx, sz), sm, x, y, z, root); m.rotation.x = -Math.PI / 2; m.rotation.z = R() * 3; m.castShadow = false; m.renderOrder = -2; return m; };

  // propane bottles + hose to the stove wing
  const tankM = rusty('#6f7a72', 3);
  const bottles = [[-1.5, 0.35, 1], [-1.52, 0.72, 0.86]], tankAt = (x, z, s, ry) => { const t = cyl(0.15 * s, 0.15 * s, 0.5 * s, tankM, x, 0.27 * s, z, root, 16); mesh(new THREE.SphereGeometry(0.15 * s, 16, 8, 0, 6.3, 0, 1.57), tankM, x, 0.52 * s, z, root); cyl(0.03, 0.04, 0.08, mat({ color: 0x8a6a20, metalness: 0.8, roughness: 0.4 }), x, 0.7 * s, z, root, 8); t.rotation.y = ry; };
  glb('propane_tank', 0x9a9a92).then((m) => { for (const [x, z, s] of bottles) { const o = m.clone(); o.scale.setScalar(1.3 * s); o.position.set(x, 0, z); o.rotation.y = R() * 6; root.add(o); } }).catch(() => { for (const [x, z, s] of bottles) tankAt(x, z, s, R() * 3); });   // Poly Haven's gas bottle, a little dented
  const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-1.5, 0.74, 0.35], [-1.42, 0.6, 0.3], [-1.3, 0.2, 0.28], [-1.17, 0.35, 0.3], [-1.16, 0.7, 0.3]].map((p) => new THREE.Vector3(...p))), 24, 0.012, 6), mat({ color: 0x1a1210, roughness: 0.7 })); hose.castShadow = true; root.add(hose);

  // rags, a bucket, crates, cardboard, bin bags, a broom
  const rag = mesh(new THREE.PlaneGeometry(0.22, 0.3, 6, 6), mat({ color: 0x8a8474, roughness: 1, side: THREE.DoubleSide, map: T.dirty(T.canvasTex(128, 128, (g) => { g.fillStyle = '#b8b09a'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#3a4a6a'; g.lineWidth = 5; g.strokeRect(10, 10, 108, 108); }), 5, { stains: 16 }) }), 1.16, 0.83, 0.2, root);
  { const p = rag.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.008 + Math.cos(p.getY(i) * 30) * 0.006); rag.geometry.computeVertexNormals(); rag.rotation.y = Math.PI / 2; }
  const bucket = cyl(0.16, 0.13, 0.28, mat({ color: 0x2a4a7a, roughness: 0.55, side: THREE.DoubleSide }), 1.5, 0.14, 0.85, root, 16, true); cyl(0.13, 0.13, 0.01, bucket.material, 1.5, 0.01, 0.85, root, 16); mesh(new THREE.CircleGeometry(0.15, 16).rotateX(-Math.PI / 2), mat({ color: 0x2a2a26, roughness: 0.15 }), 1.5, 0.2, 0.85, root);
  const card = mat({ map: T.dirty(T.canvasTex(256, 256, (g) => { g.fillStyle = '#8a6a44'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#5a4020'; g.font = 'bold 40px sans-serif'; g.fillText('中華麺', 60, 140); g.fillRect(0, 122, 256, 6); }), 6, { stains: 20, drips: 8, scratches: 20 }), roughness: 0.95 });
  for (const [x, y, z, w, h, d, ry] of [[-2.9, 0.2, NZ - 0.32, 0.55, 0.4, 0.4, 0.2], [-2.85, 0.56, NZ - 0.3, 0.45, 0.32, 0.36, -0.3], [-3.5, 0.15, NZ - 0.42, 0.5, 0.3, 0.45, 0.6], [1.75, 0.16, 1.5, 0.42, 0.32, 0.36, 0.4]]) box(w, h, d, card, x, y, z, root).rotation.y = ry;
  const bag = mat({ color: 0x08080a, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.4 });
  for (const [x, z, s] of [[3.9, NZ - 0.38, 1], [4.35, NZ - 0.42, 0.85], [4.1, NZ - 0.8, 0.7], [-6.3, NZ - 0.38, 0.9]]) { const b = mesh(new THREE.IcosahedronGeometry(0.3 * s, 1), bag, x, 0.22 * s, z, root); b.scale.set(1, 0.75, 0.9); b.rotation.set(R(), R() * 3, R()); cyl(0.02, 0.06, 0.1, bag, x, 0.46 * s, z, root, 6); }
  const br = new THREE.Group(); br.position.set(2.15, 0, NZ - 0.28); br.rotation.x = 0.16; root.add(br); cyl(0.013, 0.013, 1.3, mat({ color: 0x8a6a3a, roughness: 0.8 }), 0, 0.75, 0, br, 6); box(0.28, 0.2, 0.05, mat({ color: 0x9a8040, roughness: 1 }), 0, 0.1, 0, br);
  // soda crates with their empties by the prep wing's outer side: Poly Haven's plastic crate, twice, a wooden one under them; bottles of brown and green glass standing in the top one
  { const cx = 1.56, cz = 0.32, slat = mat({ map: T.photo('wood', () => T.woodTex('#6a4a2a', '#2a180c')), color: 0xb09a80 }), W = 0.44, D = 0.34, H = 0.26;
    for (const [y0, hh] of [[0, 0.03], [0.1, 0.05], [0.2, 0.05]]) { for (const e of [-1, 1]) { box(W, hh, 0.014, slat, cx, y0 + hh / 2 + 0.005, cz + e * D / 2, root); box(0.014, hh, D, slat, cx + e * W / 2, y0 + hh / 2 + 0.005, cz, root); } }
    for (const ex of [-1, 1]) for (const ez of [-1, 1]) box(0.03, H, 0.03, slat, cx + ex * (W / 2 - 0.02), H / 2, cz + ez * (D / 2 - 0.02), root); for (let i = 0; i < 4; i++) box(0.09, 0.012, D, slat, cx - 0.165 + i * 0.11, 0.012, cz, root);
    glb('plastic_crate_02', 0xb8a8a0).then((m) => { const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3()), k = 0.42 / Math.max(sz.x, sz.z), h = sz.y * k; [[H, 0.08], [H + h, -0.12]].forEach(([y, ry]) => { const o = m.clone(); o.scale.setScalar(k); o.position.set(cx, y - b.min.y * k, cz); o.rotation.y = ry; root.add(o); });
      const prof = [[0, 0], [0.028, 0], [0.03, 0.006], [0.03, 0.12], [0.026, 0.15], [0.013, 0.19], [0.012, 0.23], [0.015, 0.232], [0.015, 0.24], [0, 0.24]].map(([x, y]) => new THREE.Vector2(x, y)), brown = [], greenG = [];
      for (let i = 0; i < 9; i++) { if (i === 4 || i === 7) continue; const g = new THREE.LatheGeometry(prof, 9).translate(cx - 0.12 + (i % 3) * 0.12 + (R() - 0.5) * 0.01, H + h + 0.03, cz - 0.09 + Math.floor(i / 3) * 0.09); (i % 4 === 1 ? greenG : brown).push(g); }
      const bt = (gs, c) => { const o = new THREE.Mesh(mergeGeometries(gs), mat({ color: c, transparent: true, opacity: 0.88, envMap: T.env(), reflectivity: 0.25 })); o.userData.nopick = true; o.castShadow = false; root.add(o); }; bt(brown, 0x3a1c08); bt(greenG, 0x1c4a26); }).catch(() => { }); }

  // ledge: ashtray with butts, sauce drips, bottle caps, a folded newspaper
  cyl(0.055, 0.045, 0.02, mat({ color: 0xb8bcc0, metalness: 0.9, roughness: 0.4 }), -1.05, 1.012, -0.8, root, 14);
  const butt = mat({ color: 0xd8c8a8, roughness: 0.9 }); for (let i = 0; i < 5; i++) { const b = cyl(0.004, 0.004, 0.03, butt, -1.05 + (R() - 0.5) * 0.05, 1.026, -0.8 + (R() - 0.5) * 0.05, root, 5); b.rotation.set(1.57, 0, R() * 3); }
  for (let i = 0; i < 9; i++) stain((R() - 0.5) * 2.2, R() < 0.5 ? -0.62 - R() * 0.25 : -0.5 + R() * 0.32, 0.02 + R() * 0.06, 0.02 + R() * 0.05, 0.5, R() < 0.5 ? 1.003 : 0.9045, 0x1a0a04);
  const paper = box(0.3, 0.012, 0.21, mat({ map: T.dirty(T.canvasTex(256, 180, (g) => { g.fillStyle = '#cfc8b4'; g.fillRect(0, 0, 256, 180); g.fillStyle = '#222'; g.font = `bold 34px ${T.JP}`; g.fillText('DAILY LEDGER', 12, 40, 232); g.font = 'bold 22px Georgia, serif'; g.fillText('METS 2 BACK, 3 TO PLAY', 10, 66, 236); for (let y = 80; y < 170; y += 9) g.fillRect(10, y, 100 + ((y * 7) % 30), 3); g.fillRect(150, 78, 96, 70); }), 9, { stains: 8, yellow: 1 }), roughness: 0.9 }), 1.05, 1.008, -0.76, root); paper.rotation.y = 0.35;

  // hand-brushed price strips taped to the cart's front, none of them straight
  ['SHOYU $4.50', 'SHIO $4.50', 'MISO $5.00', 'TONKOTSU $5.50', 'SODA 75¢'].forEach((s, i) => {
    const t = T.canvasTex(96, 384, (g, w, h) => { g.fillStyle = '#d8ceb0'; g.fillRect(0, 0, w, h); g.fillStyle = '#16120e'; g.font = `bold 46px ${T.JP}`; g.textAlign = 'center'; g.save(); g.translate(w / 2 + 14, h / 2 + 4); g.rotate(Math.PI / 2); g.fillText(s, 0, 0, h - 30); g.restore(); g.fillStyle = '#a01c1c'; g.fillRect(0, 0, w, 10); });
    T.dirty(t, 40 + i, { stains: 10, drips: 4, yellow: 1 });
    const m = mesh(new THREE.PlaneGeometry(0.11, 0.44), mat({ map: t, roughness: 0.95, side: THREE.DoubleSide }), -0.9 + i * 0.42 + (R() - 0.5) * 0.06, 0.62 + (R() - 0.5) * 0.06, -0.595, root); m.rotation.set(0, Math.PI, (R() - 0.5) * 0.14); m.castShadow = false;
  });

  // ground: grease under the cart, drip lines, gutter muck, cigarette ends, scraps, leaves
  for (let i = 0; i < 7; i++) stain((R() - 0.5) * 3.2, -1.6 + R() * 2.8, 0.4 + R() * 1.1, 0.3 + R() * 0.8, 0.35 + R() * 0.3);
  for (let i = 0; i < 10; i++) stain(-26 + R() * 52, KERB + 0.12 + R() * 0.25, 0.6 + R() * 2.5, 0.18 + R() * 0.2, 0.55);
  for (let i = 0; i < 8; i++) stain(-24 + R() * 48, KERB + 0.5 + R() * (NZ - KERB - 1), 0.3 + R() * 1.4, 0.3 + R() * 1.2, 0.2 + R() * 0.25);
  // what blows about a pavement in October: cigarette ends, bottle caps, crushed cans, balled paper, and the trees' leaves drifted into the gutter and against the wall
  const litter = (n, geo, material, y, zone, o = {}) => { const im = new THREE.InstancedMesh(geo, material, n), d = new THREE.Object3D(), c = new THREE.Color(); for (let i = 0; i < n; i++) { const [x, z] = zone(); d.position.set(x, y, z); d.rotation.set(o.up ? (R() - 0.5) * 0.5 : -Math.PI / 2 + (R() - 0.5) * 0.3, o.up ? R() * 6.3 : 0, R() * 6.3); d.scale.setScalar(0.7 + R() * 0.7); d.updateMatrix(); im.setMatrixAt(i, d.matrix); if (o.cols) im.setColorAt(i, c.set(o.cols[(R() * o.cols.length) | 0]).multiplyScalar(0.7 + R() * 0.5)); } im.castShadow = false; im.receiveShadow = true; im.userData.nopick = true; root.add(im); };
  const clear = (x, z) => Math.abs(x) < 1.3 && z > -0.6 && z < 1.1, walk = () => { let x, z; do { x = -22 + R() * 44; z = R() < 0.4 ? KERB + 0.1 + R() * 0.35 : KERB + 0.3 + R() * (NZ - KERB - 0.5); } while (clear(x, z)); return [x, z]; };
  const drift = () => { let x, z; do { const k = R(); x = k < 0.45 ? [-10.2, 15.6, -25][(R() * 3) | 0] + (R() - 0.5) * 7 : -24 + R() * 48; z = k < 0.45 ? KERB + 0.1 + R() * 1.6 : k < 0.75 ? KERB + 0.05 + R() * 0.3 : NZ - 0.05 - R() * 0.45; } while (clear(x, z)); return [x, z]; };
  litter(160, new THREE.PlaneGeometry(0.008, 0.03), mat({ color: 0xc8b890, side: THREE.DoubleSide }), 0.006, walk);
  litter(60, new THREE.CircleGeometry(0.014, 6), mat({ color: 0x8a8a80, side: THREE.DoubleSide }), 0.007, walk);
  { const leaf = new THREE.Shape(); leaf.moveTo(0, -0.04); leaf.quadraticCurveTo(0.034, -0.012, 0.018, 0.02); leaf.lineTo(0.03, 0.03); leaf.lineTo(0.008, 0.032); leaf.lineTo(0, 0.05); leaf.lineTo(-0.008, 0.032); leaf.lineTo(-0.03, 0.03); leaf.lineTo(-0.018, 0.02); leaf.quadraticCurveTo(-0.034, -0.012, 0, -0.04);
    litter(190, new THREE.ShapeGeometry(leaf, 3), mat({ color: 0xffffff, side: THREE.DoubleSide }), 0.009, drift, { cols: [0xb8862e, 0xa8632a, 0x8a4a22, 0xc8a23a, 0x7a6a2a, 0x9a3a22] }); }
  litter(12, new THREE.IcosahedronGeometry(0.035, 0).scale(1, 0.7, 0.85), mat({ color: 0xd0cabc, flatShading: true }), 0.026, walk, { up: 1 });
  litter(7, new THREE.CylinderGeometry(0.031, 0.031, 0.1, 8).rotateZ(Math.PI / 2).scale(1, 0.55, 1), mat({ color: 0xffffff }), 0.02, walk, { up: 1, cols: [0xb82a1c, 0x1c4a9a, 0x2a8a4a, 0xb8b4a8] });
  // water stains running down the wall from the AC unit and pipes
  for (const [x, w] of [[-0.6, 0.7], [0.68, 0.3], [2.6, 3]]) { const m = mesh(new THREE.PlaneGeometry(w, 2.6), new THREE.MeshBasicMaterial({ map: T.canvasTex(64, 256, (g, cw, ch) => { const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; for (let i = 0; i < 14; i++) g.fillRect(R() * cw, 0, 2 + R() * 8, ch * (0.4 + R() * 0.6)); }), transparent: true, depthWrite: false }), x, 1.5, NZ - 0.03, root); m.rotation.y = Math.PI; m.castShadow = false; }

  // nothing hangs level: lanterns at different drops, a tired bulb that browns out now and then
  if (cart.lanterns[1]) { cart.lanterns[1].scale.setScalar(0.93); cart.lanterns[1].position.y -= 0.04; }
  let brown = 0, next = 9;
  mergeStatic(root); nop(root);
  return { root, update() { } };
}
