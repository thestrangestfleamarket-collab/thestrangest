// wear and clutter round the cart: gas bottles, rags, crates, bags, litter, stains, hand-brushed prices, a tired bulb
import * as THREE from 'three';
import { G, mat, box, cyl, mesh } from './ctx.js';
import * as T from './tex.js';

export function buildGrit(scene, city, cart) {
  const root = new THREE.Group(); scene.add(root);
  const R = T.rng(77), nop = (o) => { o.traverse((c) => { c.userData.nopick = true; }); return o; };
  const rusty = (color, seed) => { const t = T.canvasTex(256, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); }); T.dirty(t, seed, { rust: 22, stains: 14, scratches: 60, drips: 10 }); return mat({ map: t, roughness: 0.6, metalness: 0.5 }); };
  const stain = (x, z, sx, sz, a = 0.5, y = 0.004, col = 0x050404) => { const m = mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: city.glowMap, color: col, transparent: true, opacity: a, depthWrite: false }), x, y, z, root); m.rotation.x = -Math.PI / 2; m.rotation.z = R() * 3; m.castShadow = false; m.renderOrder = -2; return m; };

  // propane bottles + hose to the stove wing
  const tankM = rusty('#6f7a72', 3);
  for (const [x, z, s] of [[-1.5, 0.35, 1], [-1.52, 0.72, 0.86]]) { const t = cyl(0.15 * s, 0.15 * s, 0.5 * s, tankM, x, 0.27 * s, z, root, 16); mesh(new THREE.SphereGeometry(0.15 * s, 16, 8, 0, 6.3, 0, 1.57), tankM, x, 0.52 * s, z, root); cyl(0.03, 0.04, 0.08, mat({ color: 0x8a6a20, metalness: 0.8, roughness: 0.4 }), x, 0.7 * s, z, root, 8); t.rotation.y = R() * 3; }
  const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-1.5, 0.74, 0.35], [-1.42, 0.6, 0.3], [-1.3, 0.2, 0.28], [-1.17, 0.35, 0.3], [-1.16, 0.7, 0.3]].map((p) => new THREE.Vector3(...p))), 24, 0.012, 6), mat({ color: 0x1a1210, roughness: 0.7 })); hose.castShadow = true; root.add(hose);

  // rags, a bucket, crates, cardboard, bin bags, a broom
  const rag = mesh(new THREE.PlaneGeometry(0.22, 0.3, 6, 6), mat({ color: 0x8a8474, roughness: 1, side: THREE.DoubleSide, map: T.dirty(T.canvasTex(128, 128, (g) => { g.fillStyle = '#b8b09a'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#3a4a6a'; g.lineWidth = 5; g.strokeRect(10, 10, 108, 108); }), 5, { stains: 16 }) }), 1.16, 0.83, 0.2, root);
  { const p = rag.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.008 + Math.cos(p.getY(i) * 30) * 0.006); rag.geometry.computeVertexNormals(); rag.rotation.y = Math.PI / 2; }
  const bucket = cyl(0.16, 0.13, 0.28, mat({ color: 0x2a4a7a, roughness: 0.55, side: THREE.DoubleSide }), 1.5, 0.14, 0.85, root, 16, true); cyl(0.13, 0.13, 0.01, bucket.material, 1.5, 0.01, 0.85, root, 16); mesh(new THREE.CircleGeometry(0.15, 16).rotateX(-Math.PI / 2), mat({ color: 0x2a2a26, roughness: 0.15 }), 1.5, 0.2, 0.85, root);
  const card = mat({ map: T.dirty(T.canvasTex(256, 256, (g) => { g.fillStyle = '#8a6a44'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#5a4020'; g.font = 'bold 40px sans-serif'; g.fillText('中華麺', 60, 140); g.fillRect(0, 122, 256, 6); }), 6, { stains: 20, drips: 8, scratches: 20 }), roughness: 0.95 });
  for (const [x, y, z, w, h, d, ry] of [[-2.9, 0.2, 2.45, 0.55, 0.4, 0.4, 0.2], [-2.85, 0.56, 2.48, 0.45, 0.32, 0.36, -0.3], [-3.5, 0.15, 2.3, 0.5, 0.3, 0.45, 0.6], [1.75, 0.16, 1.5, 0.42, 0.32, 0.36, 0.4]]) box(w, h, d, card, x, y, z, root).rotation.y = ry;
  const bag = new THREE.MeshPhysicalMaterial({ color: 0x08080a, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.4 });
  for (const [x, z, s] of [[3.9, 2.5, 1], [4.35, 2.42, 0.85], [4.1, 2.15, 0.7], [-6.3, 2.5, 0.9]]) { const b = mesh(new THREE.IcosahedronGeometry(0.3 * s, 1), bag, x, 0.22 * s, z, root); b.scale.set(1, 0.75, 0.9); b.rotation.set(R(), R() * 3, R()); cyl(0.02, 0.06, 0.1, bag, x, 0.46 * s, z, root, 6); }
  const br = new THREE.Group(); br.position.set(1.9, 0, 2.86); br.rotation.x = -0.18; root.add(br); cyl(0.013, 0.013, 1.3, mat({ color: 0x8a6a3a, roughness: 0.8 }), 0, 0.75, 0, br, 6); box(0.28, 0.2, 0.05, mat({ color: 0x9a8040, roughness: 1 }), 0, 0.1, 0, br);
  // beer crate with empties under the prep wing's outer side
  const crate = mat({ color: 0x9a7a14, roughness: 0.7 }); for (const y of [0.16, 0.5]) { box(0.42, 0.3, 0.32, crate, 1.55, y, 0.3, root).rotation.y = y * 0.3; }
  for (let i = 0; i < 6; i++) cyl(0.03, 0.03, 0.2, new THREE.MeshPhysicalMaterial({ color: 0x3a1c08, roughness: 0.15, transmission: 0.4, thickness: 0.02 }), 1.44 + (i % 3) * 0.1, 0.72, 0.22 + Math.floor(i / 3) * 0.13, root, 8);

  // ledge: ashtray with butts, sauce drips, bottle caps, a folded newspaper
  cyl(0.055, 0.045, 0.02, mat({ color: 0xb8bcc0, metalness: 0.9, roughness: 0.4 }), -1.05, 1.012, -0.8, root, 14);
  const butt = mat({ color: 0xd8c8a8, roughness: 0.9 }); for (let i = 0; i < 5; i++) { const b = cyl(0.004, 0.004, 0.03, butt, -1.05 + (R() - 0.5) * 0.05, 1.026, -0.8 + (R() - 0.5) * 0.05, root, 5); b.rotation.set(1.57, 0, R() * 3); }
  for (let i = 0; i < 26; i++) stain((R() - 0.5) * 2.2, R() < 0.5 ? -0.62 - R() * 0.25 : -0.5 + R() * 0.32, 0.02 + R() * 0.06, 0.02 + R() * 0.05, 0.5, R() < 0.5 ? 1.003 : 0.9045, 0x1a0a04);
  const paper = box(0.3, 0.012, 0.21, mat({ map: T.dirty(T.canvasTex(256, 180, (g) => { g.fillStyle = '#cfc8b4'; g.fillRect(0, 0, 256, 180); g.fillStyle = '#222'; g.font = `bold 34px ${T.JP}`; g.fillText('夕刊スポーツ', 12, 40); for (let y = 60; y < 170; y += 9) g.fillRect(10, y, 100 + ((y * 7) % 130), 3); g.fillRect(150, 60, 96, 70); }), 9, { stains: 8, yellow: 1 }), roughness: 0.9 }), 1.05, 1.008, -0.76, root); paper.rotation.y = 0.35;

  // hand-brushed price strips taped to the cart's front, none of them straight
  ['醤油 四五〇円', '塩 四五〇円', '味噌 五〇〇円', '豚骨 五五〇円', 'ビール 三〇〇円'].forEach((s, i) => {
    const t = T.canvasTex(96, 384, (g, w, h) => { g.fillStyle = '#d8ceb0'; g.fillRect(0, 0, w, h); g.fillStyle = '#16120e'; g.font = `bold 50px ${T.JP}`; g.textAlign = 'center'; [...s.replace(' ', '')].forEach((c, k) => { g.globalAlpha = 0.8 + ((k * 7) % 3) * 0.07; g.fillText(c, w / 2 + ((k * 13) % 7) - 3, 52 + k * 54); }); g.globalAlpha = 1; g.fillStyle = '#a01c1c'; g.fillRect(0, 0, w, 10); });
    T.dirty(t, 40 + i, { stains: 10, drips: 4, yellow: 1 });
    const m = mesh(new THREE.PlaneGeometry(0.11, 0.44), mat({ map: t, roughness: 0.95, side: THREE.DoubleSide }), -0.9 + i * 0.42 + (R() - 0.5) * 0.06, 0.62 + (R() - 0.5) * 0.06, -0.595, root); m.rotation.set(0, Math.PI, (R() - 0.5) * 0.14); m.castShadow = false;
  });

  // ground: grease under the cart, drip lines, gutter muck, cigarette ends, scraps, leaves
  for (let i = 0; i < 18; i++) stain((R() - 0.5) * 3.2, -1.6 + R() * 2.8, 0.4 + R() * 1.1, 0.3 + R() * 0.8, 0.35 + R() * 0.3);
  for (let i = 0; i < 40; i++) stain(-30 + R() * 60, -3.05 + R() * 0.25, 0.6 + R() * 2.5, 0.18 + R() * 0.2, 0.55);
  for (let i = 0; i < 30; i++) stain(-24 + R() * 48, -2.8 + R() * 5, 0.3 + R() * 1.4, 0.3 + R() * 1.2, 0.2 + R() * 0.25);
  const litter = (n, geo, material, y, zone) => { const im = new THREE.InstancedMesh(geo, material, n), d = new THREE.Object3D(); for (let i = 0; i < n; i++) { const [x, z] = zone(); d.position.set(x, y, z); d.rotation.set(-Math.PI / 2 + (R() - 0.5) * 0.3, 0, R() * 6.3); d.scale.setScalar(0.7 + R() * 0.7); d.updateMatrix(); im.setMatrixAt(i, d.matrix); } im.castShadow = false; im.receiveShadow = true; im.userData.nopick = true; root.add(im); };
  const walk = () => { let x, z; do { x = -22 + R() * 44; z = R() < 0.4 ? -3.1 + R() * 0.35 : -3 + R() * 5.7; } while (Math.abs(x) < 1.3 && z > -0.6 && z < 1.1); return [x, z]; };
  litter(160, new THREE.PlaneGeometry(0.008, 0.03), new THREE.MeshStandardMaterial({ color: 0xc8b890, roughness: 1, side: THREE.DoubleSide }), 0.006, walk);
  litter(46, new THREE.PlaneGeometry(0.1, 0.07), new THREE.MeshStandardMaterial({ color: 0x8a8678, roughness: 1, side: THREE.DoubleSide }), 0.007, walk);
  litter(70, new THREE.CircleGeometry(0.03, 5), new THREE.MeshStandardMaterial({ color: 0x4a3a18, roughness: 1, side: THREE.DoubleSide }), 0.008, walk);
  litter(14, new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshStandardMaterial({ color: 0x9a2a1c, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide }), 0.009, walk);
  // water stains running down the wall from the AC unit and pipes
  for (const [x, w] of [[-0.6, 0.7], [0.68, 0.3], [2.6, 3]]) { const m = mesh(new THREE.PlaneGeometry(w, 2.6), new THREE.MeshBasicMaterial({ map: T.canvasTex(64, 256, (g, cw, ch) => { const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; for (let i = 0; i < 14; i++) g.fillRect(R() * cw, 0, 2 + R() * 8, ch * (0.4 + R() * 0.6)); }), transparent: true, depthWrite: false }), x, 1.5, 2.965, root); m.rotation.y = Math.PI; m.castShadow = false; }

  // nothing hangs level: lanterns at different drops, a tired bulb that browns out now and then
  if (cart.lanterns[1]) { cart.lanterns[1].scale.setScalar(0.93); cart.lanterns[1].position.y -= 0.04; }
  const lights = cart.bulbs.map((pv) => pv.children.find((c) => c.isPointLight)); const base = lights.map((l, i) => l.intensity * [1, 0.72, 0.9][i]); lights.forEach((l, i) => { l.intensity = base[i]; l.color.offsetHSL((i - 1) * 0.012, 0, 0); });
  let brown = 0, next = 9;
  nop(root);
  return { update(dt, t) { next -= dt; if (next <= 0) { brown = 0.5 + Math.random() * 1.2; next = 12 + Math.random() * 30; } if (brown > 0) { brown -= dt; lights[1].intensity = base[1] * (0.25 + 0.6 * Math.abs(Math.sin(t * 37) * Math.sin(t * 11.3))); } else lights[1].intensity = base[1] * (0.96 + 0.04 * Math.sin(t * 50)); } };
}
