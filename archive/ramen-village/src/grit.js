// wear and clutter round the stall: straw sacks of charcoal for the braziers, a rag, a wooden bucket, crates, a sake barrel, straw bundles, a broom, a tobacco tray and a broadsheet on the ledge, hand-brushed prices, the ground's stains and leaves
import * as THREE from 'three';
import { mat, box, cyl, mesh, mergeStatic } from './ctx.js';
import * as T from './tex.js';
import { glb, taru } from './models.js';

export function buildGrit(scene, city, cart) {
  const root = new THREE.Group(); scene.add(root);
  const R = T.rng(77), nop = (o) => { o.traverse((c) => { c.userData.nopick = true; }); return o; };
  const stainM = {};
  const stain = (x, z, sx, sz, a = 0.5, y = 0.004, col = 0x050404) => { const sk = col + '|' + Math.round(a * 3), sm = stainM[sk] || (stainM[sk] = new THREE.MeshBasicMaterial({ map: city.glowMap, color: col, transparent: true, opacity: Math.round(a * 3) / 3 || 0.33, depthWrite: false })); const m = mesh(new THREE.PlaneGeometry(sx, sz), sm, x, y, z, root); m.rotation.x = -Math.PI / 2; m.rotation.z = R() * 3; m.castShadow = false; m.renderOrder = -2; return m; };
  const straw = T.surface(mat({ map: T.photo('thatch'), color: 0xc0a878 }), { grime: 0.3 }), cloth = T.surface(mat({ map: T.photo('cloth'), color: 0xa89a7a }), { grime: 0.5 }), wood = T.surface(mat({ map: T.photo('wood'), color: 0x9a8670 }), { grime: 0.4 });
  // straw sacks of charcoal by the stove wing, and lumps spilt from the open one
  for (const [x, z, s, ry] of [[-1.52, 0.4, 1, 0.3], [-1.55, 0.78, 0.85, 1.2], [-1.85, 0.55, 0.9, 2]]) { const b = mesh(new THREE.SphereGeometry(0.22 * s, 10, 8), straw, x, 0.2 * s, z, root); b.scale.set(1, 0.9, 0.8); b.rotation.y = ry; cyl(0.05 * s, 0.09 * s, 0.1 * s, straw, x, 0.42 * s, z, root, 6); }
  const coal = mat({ color: 0x1a1714 }); for (let i = 0; i < 14; i++) { const c = mesh(new THREE.IcosahedronGeometry(0.02 + R() * 0.02, 0), coal, -1.4 + R() * 0.4, 0.015, 0.25 + R() * 0.5, root); c.rotation.set(R() * 3, R() * 3, 0); c.castShadow = false; }
  // the rag over the prep wing's edge
  const rag = mesh(new THREE.PlaneGeometry(0.22, 0.3, 6, 6), mat({ color: 0x8a8474, roughness: 1, side: THREE.DoubleSide, map: T.dirty(T.canvasTex(128, 128, (g) => { g.fillStyle = '#b8b09a'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#2a3a6a'; g.lineWidth = 5; g.strokeRect(10, 10, 108, 108); }), 5, { stains: 16 }) }), 1.16, 0.83, 0.2, root);
  { const p = rag.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.008 + Math.cos(p.getY(i) * 30) * 0.006); rag.geometry.computeVertexNormals(); rag.rotation.y = Math.PI / 2; }
  // a wooden bucket of water, crates, a sake barrel, a broom (CC0 models), straw bundles
  glb('wooden_bucket_01', 0xa8a8a8).then((m) => { const o = m.clone(); o.position.set(1.5, 0, 0.85); root.add(o); }).catch(() => { });
  glb('wooden_crate_01', 0x9a9088).then((m) => { for (const [x, z, ry, s] of [[-2.9, 2.45, 0.2, 0.7], [-2.85, 2.48, -0.3, 0.55], [1.8, 1.5, 0.4, 0.6]]) { const o = m.clone(); o.position.set(x, x < 0 && s < 0.6 ? 0.42 : 0, z); o.rotation.y = ry; o.scale.setScalar(s); root.add(o); } }).catch(() => { });
  taru(root, 1.6, 0.3, 0.8, 0.6);
  glb('wooden_broom', 0xa8a8a8).then((m) => { const o = m.clone(); o.position.set(1.9, 0, 2.86); o.rotation.set(-0.18, 0.4, 0); root.add(o); }).catch(() => { });
  for (const [x, z, ry] of [[3.9, 2.6, 0.2], [4.4, 2.5, 1.1], [-6.0, 2.9, 2]]) { const b = cyl(0.12, 0.12, 0.9, straw, x, 0.12, z, root, 10); b.rotation.set(Math.PI / 2, 0, ry); }
  // the ledge: a tobacco tray with its little fire-pot and a pipe, sauce drips, a folded broadsheet
  { const tb = box(0.14, 0.05, 0.1, wood, -1.05, 1.025, -0.8, root); tb.rotation.y = 0.3; cyl(0.026, 0.022, 0.035, T.surface(mat({ color: 0x5a5250 }), { grime: 0.2 }), -1.08, 1.06, -0.8, root, 10); const pipe = cyl(0.003, 0.003, 0.2, mat({ color: 0x3a2a1a }), -1.02, 1.055, -0.77, root, 5); pipe.rotation.set(0, 0.3, Math.PI / 2); }
  for (let i = 0; i < 9; i++) stain((R() - 0.5) * 2.2, R() < 0.5 ? -0.62 - R() * 0.25 : -0.5 + R() * 0.32, 0.02 + R() * 0.06, 0.02 + R() * 0.05, 0.5, R() < 0.5 ? 1.003 : 0.9045, 0x1a0a04);
  const paper = box(0.3, 0.012, 0.21, mat({ map: T.dirty(T.canvasTex(256, 180, (g) => { g.fillStyle = '#d8cfb4'; g.fillRect(0, 0, 256, 180); g.fillStyle = '#222'; g.font = `bold 34px ${T.JP}`; g.fillText('瓦版', 12, 40); for (let x = 240; x > 120; x -= 14) g.fillRect(x, 54, 4, 60 + ((x * 7) % 50)); g.strokeStyle = '#222'; g.lineWidth = 2; g.strokeRect(12, 56, 96, 100); g.beginPath(); g.arc(60, 106, 30, 0, 6.3); g.stroke(); }), 9, { stains: 8, yellow: 1 }), roughness: 0.9 }), 1.05, 1.008, -0.76, root); paper.rotation.y = 0.35;   // the town's woodblock broadsheet
  // hand-brushed prices pinned to the stall's front, none of them straight
  ['醤油 16文', '塩 16文', '味噌 20文', '豚骨 24文', '酒 12文'].forEach((s, i) => {
    const t = T.canvasTex(96, 384, (g, w, h) => { g.fillStyle = '#d8ceb0'; g.fillRect(0, 0, w, h); g.fillStyle = '#16120e'; g.font = `bold 52px ${T.JP}`; g.textAlign = 'center'; const ch = [...s.replace(' ', '')]; ch.forEach((c, j) => g.fillText(c, w / 2, 60 + j * 56)); g.fillStyle = '#a01c1c'; g.fillRect(0, 0, w, 8); });
    T.dirty(t, 40 + i, { stains: 10, drips: 4, yellow: 1 });
    const m = mesh(new THREE.PlaneGeometry(0.11, 0.44), mat({ map: t, roughness: 0.95, side: THREE.DoubleSide }), -0.9 + i * 0.42 + (R() - 0.5) * 0.06, 0.62 + (R() - 0.5) * 0.06, -0.595, root); m.rotation.set(0, Math.PI, (R() - 0.5) * 0.14); m.castShadow = false;
  });
  // the ground: grease and ash under the stall, wheel ruts, scraps and fallen leaves
  for (let i = 0; i < 7; i++) stain((R() - 0.5) * 3.2, -1.6 + R() * 2.8, 0.4 + R() * 1.1, 0.3 + R() * 0.8, 0.35 + R() * 0.3);
  for (let i = 0; i < 10; i++) stain(-30 + R() * 60, -3.05 + R() * 0.25, 0.6 + R() * 2.5, 0.18 + R() * 0.2, 0.45, 0.004, 0x2a1a0a);
  const litter = (n, geo, material, y, zone) => { const im = new THREE.InstancedMesh(geo, material, n), d = new THREE.Object3D(); for (let i = 0; i < n; i++) { const [x, z] = zone(); d.position.set(x, y, z); d.rotation.set(-Math.PI / 2 + (R() - 0.5) * 0.3, 0, R() * 6.3); d.scale.setScalar(0.7 + R() * 0.7); d.updateMatrix(); im.setMatrixAt(i, d.matrix); } im.castShadow = false; im.receiveShadow = true; im.userData.nopick = true; root.add(im); };
  const walk = () => { let x, z; do { x = -22 + R() * 44; z = -5 + R() * 7.7; } while (Math.abs(x) < 1.3 && z > -0.6 && z < 1.1); return [x, z]; };
  litter(40, new THREE.PlaneGeometry(0.1, 0.07), cloth, 0.007, walk);
  litter(90, new THREE.CircleGeometry(0.03, 5), mat({ color: 0x6a4a18, roughness: 1, side: THREE.DoubleSide }), 0.008, walk);
  litter(60, new THREE.CircleGeometry(0.025, 5), mat({ color: 0x8a6a28, roughness: 1, side: THREE.DoubleSide }), 0.008, walk);
  if (cart.lanterns[1]) { cart.lanterns[1].scale.setScalar(0.93); cart.lanterns[1].position.y -= 0.04; }   // nothing hangs level
  mergeStatic(root); nop(root);
  return { root, update() { } };
}
