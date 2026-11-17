// THE GARAGE's garage: a small one-car garage with the kit in it, every shelf and corner full, the sun coming in through real windows from a real yard outside
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { pbr, plain, slabGeo, model, canvasTex } from './assets.js';

// the room: x left to right, z from the garage door (-) to the back wall (+), the drummer at the origin facing the door
export const ROOM = { x0: -2.1, x1: 2.1, z0: -3, z1: 2.4, h: 2.6, wall: 0.2 };
export const SUN = new THREE.Vector3(-0.62, 0.6, -0.5).normalize(); // toward the sun
const DOOR = { w: 2.9, h: 2.2, up: 0.42 };
const WIN = [{ z: -1.9, w: 0.95, y0: 1.12, y1: 1.86 }, { z: -0.25, w: 0.95, y0: 1.12, y1: 1.86 }];

export function buildGarage(scene, low) {
  const group = new THREE.Group();
  scene.add(group);
  const { x0, x1, z0, z1, h: H, wall: W } = ROOM;
  const bins = new Map();
  // boxes gathered by material, one mesh each at the end
  const box = (mat, w, h, d, x, y, z, ry) => {
    const g = slabGeo(w, h, d, mat.userData.tile || 1);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    if (!bins.has(mat)) bins.set(mat, []);
    bins.get(mat).push(g);
  };
  const raw = (mat, g) => { if (!bins.has(mat)) bins.set(mat, []); bins.get(mat).push(g); };

  const M = {
    floor: pbr('floor', { tile: 2.2, env: 0.5 }),
    block: pbr('block', { tile: 1.5, env: 0.3 }),
    ply: pbr('ply', { tile: 1.4, env: 0.3 }),
    joist: pbr('ply', { tile: 0.9, color: 0xc9a67a, env: 0.2 }),
    bench: pbr('ply', { tile: 0.8, color: 0xb98d5c, env: 0.3 }),
    rug: pbr('carpet', { tile: 1.1, color: 0x8f3a34, env: 0.1 }),
    door: pbr('door', { tile: 1.3, color: 0xe6e2d6, env: 0.4 }),
    drive: pbr('drive', { tile: 2.4, env: 0.2 }),
    road: pbr('drive', { tile: 3, color: 0x55575c, env: 0.2 }),
    paint: pbr('paint', { tile: 0.8, env: 0.5, metal: 0.4 }),
    fence: pbr('fence', { tile: 1.2, env: 0.2 }),
    brick: pbr('brick', { tile: 1.8, env: 0.2 }),
    grass: pbr('grass', { tile: 2.5, env: 0.1 }),
    trim: plain(0xe9e6dc, { rough: 0.6 }),
    steel: plain(0x8d9299, { rough: 0.35, metal: 1, env: 1 }),
    dark: plain(0x151517, { rough: 0.8 }),
    roof: plain(0x3b3d42, { rough: 0.9 }),
    foam: plain(0x1c1d20, { rough: 1, env: 0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xbfd4dc, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2, envMapIntensity: 3, depthWrite: false }),
  };

  // ---- the shell ----
  box(M.floor, x1 - x0, 0.1, z1 - z0, 0, -0.05, (z0 + z1) / 2);
  box(M.ply, x1 - x0 + 2 * W, 0.04, z1 - z0 + 2 * W, 0, H + 0.02 + 0.14, (z0 + z1) / 2);
  box(M.roof, x1 - x0 + 2 * W + 0.5, 0.06, z1 - z0 + 2 * W + 0.5, 0, H + 0.24, (z0 + z1) / 2);
  for (let z = z0 + 0.3; z < z1; z += 0.61) box(M.joist, x1 - x0, 0.14, 0.045, 0, H + 0.07, z);
  // a wall along z at x with window holes
  const wallZ = (x, holes) => {
    let z = z0 - W;
    for (const o of [...holes].sort((a, b) => a.z - b.z)) {
      const a = o.z - o.w / 2, b = o.z + o.w / 2;
      box(M.block, W, H + 0.2, a - z, x, (H + 0.2) / 2, (z + a) / 2);
      box(M.block, W, o.y0, o.w, x, o.y0 / 2, o.z);
      box(M.block, W, H + 0.2 - o.y1, o.w, x, (o.y1 + H + 0.2) / 2, o.z);
      z = b;
    }
    box(M.block, W, H + 0.2, z1 + W - z, x, (H + 0.2) / 2, (z + z1 + W) / 2);
  };
  wallZ(x0 - W / 2, WIN);
  wallZ(x1 + W / 2, []);
  box(M.block, x1 - x0, H + 0.2, W, 0, (H + 0.2) / 2, z1 + W / 2);
  // the front: block either side of the door and over it
  const side = (x1 - x0 - DOOR.w) / 2;
  for (const s of [-1, 1]) box(M.block, side, H + 0.2, W, s * (DOOR.w / 2 + side / 2), (H + 0.2) / 2, z0 - W / 2);
  box(M.block, DOOR.w, H + 0.2 - DOOR.h, W, 0, (DOOR.h + H + 0.2) / 2, z0 - W / 2);
  for (const s of [-1, 1]) box(M.trim, 0.06, DOOR.h, W + 0.02, s * (DOOR.w / 2 - 0.03), DOOR.h / 2, z0 - W / 2);

  // the sectional door, run up a hand's height: four panels, the third with four small panes
  const panes = [];
  const PH = 0.5, dz = z0 - 0.06;
  for (let i = 0; i < 4; i++) {
    const y = DOOR.up + i * PH + PH / 2;
    if (y + PH / 2 > DOOR.h + 0.3) break;
    if (i === 2) {
      const n = 4, pw = 0.5, ph = 0.36, gap = (DOOR.w - 0.12 - n * pw) / (n + 1);
      box(M.door, DOOR.w - 0.12, (PH - ph) / 2, 0.045, 0, y - PH / 2 + (PH - ph) / 4, dz);
      box(M.door, DOOR.w - 0.12, (PH - ph) / 2, 0.045, 0, y + PH / 2 - (PH - ph) / 4, dz);
      for (let k = 0; k <= n; k++) box(M.door, gap, ph, 0.045, -(DOOR.w - 0.12) / 2 + gap / 2 + k * (pw + gap), y, dz);
      for (let k = 0; k < n; k++) panes.push({ x: -(DOOR.w - 0.12) / 2 + gap + pw / 2 + k * (pw + gap), y, z: dz, w: pw, h: ph, axis: 'z' });
    } else box(M.door, DOOR.w - 0.12, PH - 0.012, 0.045, 0, y, dz);
    for (const s of [-1, 1]) box(M.steel, 0.03, 0.05, 0.06, s * (DOOR.w / 2 - 0.1), y - PH / 2, dz + 0.04);
  }
  box(M.door, DOOR.w - 0.12, 0.045, 0.42, 0, DOOR.h + 0.16, z0 + 0.22);
  box(M.dark, DOOR.w - 0.1, 0.03, 0.03, 0, DOOR.up - 0.015, dz);
  // its tracks and the opener
  for (const s of [-1, 1]) {
    box(M.steel, 0.05, DOOR.h + 0.1, 0.03, s * (DOOR.w / 2 - 0.02), (DOOR.h + 0.1) / 2, z0 + 0.03);
    box(M.steel, 0.05, 0.03, 2.3, s * (DOOR.w / 2 - 0.02), DOOR.h + 0.12, z0 + 1.2);
    box(M.steel, 0.02, H - DOOR.h - 0.1, 0.02, s * (DOOR.w / 2 - 0.02), (DOOR.h + 0.12 + H) / 2, z0 + 2.3);
  }
  box(M.steel, 0.04, 0.05, 3, 0, H - 0.1, z0 + 1.5);
  box(M.dark, 0.3, 0.16, 0.42, 0, H - 0.13, z0 + 3.1);

  // ---- the two windows: jambs through the wall's depth, a cross of glazing bars, a sill, the glass ----
  for (const o of WIN) {
    const x = x0 - W / 2, hh = o.y1 - o.y0, cy = (o.y0 + o.y1) / 2;
    for (const s of [-1, 1]) box(M.trim, W + 0.03, hh, 0.035, x, cy, o.z + s * (o.w / 2 - 0.0175));
    box(M.trim, W + 0.03, 0.035, o.w, x, o.y1 - 0.0175, o.z);
    box(M.trim, W + 0.1, 0.035, o.w + 0.08, x + 0.035, o.y0 + 0.0175, o.z);
    box(M.trim, 0.03, hh, 0.025, x - 0.03, cy, o.z);
    box(M.trim, 0.03, 0.025, o.w, x - 0.03, cy, o.z);
    for (const s of [-1, 1]) box(M.trim, 0.025, hh + 0.14, 0.07, x0 + 0.0125, cy, o.z + s * (o.w / 2 + 0.035));
    box(M.trim, 0.025, 0.07, o.w + 0.14, x0 + 0.0125, o.y1 + 0.035, o.z);
    panes.push({ x: x - 0.03, y: cy, z: o.z, w: o.w, h: hh, axis: 'x' });
  }
  const halo = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.4, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const haloM = new THREE.SpriteMaterial({ map: halo, color: 0xdfe9f2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.16 });
  for (const p of panes) {
    const h = new THREE.Sprite(haloM);
    h.position.set(p.x + (p.axis === 'x' ? 0.06 : 0), p.y, p.z + (p.axis === 'z' ? 0.06 : 0)); h.scale.set(p.w * 2.1, p.h * 2.4, 1); h.renderOrder = 7;
    group.add(h);
  }
  for (const p of panes) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), M.glass);
    g.position.set(p.x, p.y, p.z);
    if (p.axis === 'x') g.rotation.y = Math.PI / 2;
    g.renderOrder = 5;
    group.add(g);
  }

  // ---- the kit's corner: rug, blankets and foam to tame the walls, an amp, the cables ----
  box(M.rug, 2.7, 0.014, 2.1, 0.12, 0.007, -0.42);
  box(M.bench, 0.2, 0.025, 0.9, x1 - 0.1, 1.5, -2.35);
  for (const dz of [-0.35, 0.35]) box(M.steel, 0.18, 0.02, 0.02, x1 - 0.1, 1.48, -2.35 + dz);
  for (const [n, dz, hh, ry] of [['can_rusted', -0.33, 0.13, 0], ['spray_paint_bottles', -0.12, 0.2, 1.57], ['lubricant_spray', 0.06, 0.16, 0.4], ['can_rusted', 0.2, 0.11, 2], ['multi_cleaner_bottle', 0.34, 0.22, 1]])
    model(n, x1 - 0.1, 1.5125, -2.35 + dz, ry, { h: hh, shadow: false }, group);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const cx = x0 + 0.035, cz = 0.72 + i * 0.5, cy = 1.5 + j * 0.5;
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) {
      const g = new THREE.ConeGeometry(0.066, 0.06, 4, 1).rotateY(Math.PI / 4).rotateZ(-Math.PI / 2).translate(cx, cy - 0.2 + a * 0.1, cz - 0.2 + b * 0.1);
      raw(M.foam, g.toNonIndexed());
    }
  }
  // a combo amp against the door-side wall
  const amp = new THREE.Group();
  amp.position.set(-1.45, 0, -2.55);
  amp.rotation.y = 0.5;
  const grille = canvasTex(64, 64, (c) => { c.fillStyle = '#1a1712'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#3a3226'; for (let y = 0; y < 64; y += 4) for (let x = (y / 4) % 2 * 2; x < 64; x += 4) c.fillRect(x, y, 2, 2); });
  grille.wrapS = grille.wrapT = THREE.RepeatWrapping; grille.repeat.set(4, 3); grille.magFilter = THREE.NearestFilter;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.27).translate(0, 0.3, 0), M.dark);
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.36).translate(0, 0.26, 0.136), new THREE.MeshStandardMaterial({ map: grille, roughness: 1 }));
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.02).translate(0, 0.51, 0.13), M.steel);
  amp.add(cab, cloth, panel);
  for (let i = 0; i < 6; i++) amp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 8).rotateX(Math.PI / 2).translate(-0.2 + i * 0.07, 0.51, 0.15), M.dark));
  for (const sx of [-0.27, 0.27]) for (const sz of [-0.1, 0.1]) amp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8).translate(sx, 0.02, sz), M.dark));
  amp.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  group.add(amp);
  const cable = (pts, r = 0.006) => raw(M.dark, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 5).toNonIndexed());
  cable([[-1.35, 0.3, -2.4], [-1.2, 0.02, -2.2], [-1.6, 0.012, -1.6], [-1.95, 0.012, -0.9], [-2.05, 0.012, 0.3], [-2.08, 0.3, 0.55]]);
  cable([[x1 - 0.05, 0.35, 0.95], [x1 - 0.3, 0.012, 0.8], [1.2, 0.012, 1.2], [0.6, 0.012, 1.7], [-0.4, 0.012, 1.55], [-1.3, 0.2, 1.75]], 0.005);

  // ---- the right wall: a workbench under a pegboard of tools ----
  const bx = x1 - 0.33, bz = -0.75, BL = 1.9, BH = 0.9;
  box(M.bench, 0.66, 0.045, BL, bx, BH, bz);
  box(M.bench, 0.6, 0.02, BL - 0.1, bx, 0.28, bz);
  for (const s of [-1, 1]) for (const t of [-1, 1]) box(M.joist, 0.07, BH, 0.07, bx + t * 0.27, BH / 2, bz + s * (BL / 2 - 0.06));
  for (const t of [-1, 1]) box(M.joist, 0.04, 0.09, BL - 0.1, bx + t * 0.27, BH - 0.07, bz);
  const peg = canvasTex(128, 128, (c) => { c.fillStyle = '#b08a5e'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#3a2a1a'; for (let y = 8; y < 128; y += 16) for (let x = 8; x < 128; x += 16) { c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); } });
  peg.wrapS = peg.wrapT = THREE.RepeatWrapping; peg.repeat.set(BL / 0.2, 0.9 / 0.2);
  const pegM = new THREE.MeshStandardMaterial({ map: peg, roughness: 0.85 });
  const pegB = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.9, BL), pegM);
  pegB.position.set(x1 - 0.02, 1.55, bz); pegB.receiveShadow = true;
  group.add(pegB);
  box(M.joist, 0.02, 0.04, BL + 0.04, x1 - 0.02, 2.02, bz);
  const hang = (n, y, z, o = {}) => model(n, x1 - 0.045, y, z, -Math.PI / 2, { shadow: false, ...o }, group);
  hang('cross_pein_hammer', 1.5, bz - 0.75, { h: 0.3 });
  hang('handsaw_wood', 1.72, bz - 0.2, { rx: 0, rz: 0, w: 0.6 }).rotation.set(0, 0, 0);
  hang('pipe_wrench', 1.38, bz - 0.5, { h: 0.4 });
  hang('adjustable_wrench', 1.4, bz + 0.2, { h: 0.25 });
  hang('ratchet_wrench', 1.42, bz + 0.38, { h: 0.24 });
  hang('combination_wrench', 1.25, bz + 0.6, { w: 0.34 }).rotation.set(Math.PI / 2, 0, 0);
  hang('tire_pump', 1.2, bz + 0.82, { h: 0.58 });
  const on = (n, x, z, ry, o) => model(n, x, BH + 0.0225, z, ry, { shadow: !low, ...o }, group);
  on('bench_vice_01', bx - 0.15, bz + 0.7, Math.PI / 2, { h: 0.28 });
  on('metal_toolbox', bx + 0.05, bz - 0.62, 0.3, { h: 0.24 });
  on('drill_01', bx - 0.1, bz - 0.15, 1.1, { h: 0.19 });
  on('small_oil_can_01', bx + 0.18, bz + 0.25, -0.6, { h: 0.2 });
  on('lubricant_spray', bx + 0.2, bz + 0.02, 0, { h: 0.16 });
  on('spray_paint_bottles', bx + 0.22, bz - 0.25, 1.4, { h: 0.23 });
  on('cassette_player', bx - 0.12, bz + 0.25, 0.5, { h: 0.07 });
  on('can_rusted', bx + 0.1, bz + 0.48, 0, { h: 0.13 });
  on('desk_lamp_arm_01', bx + 0.2, bz + 0.85, -2.2, { h: 0.62 });
  const desk = new THREE.PointLight(0xffc98a, 1.1, 2.4, 2);
  desk.position.set(bx - 0.05, BH + 0.5, bz + 0.6);
  group.add(desk);
  const under = (n, x, z, ry, o) => model(n, x, 0.29, z, ry, { shadow: false, ...o }, group);
  under('plastic_crate_02', bx, bz - 0.55, 0.1, { h: 0.25 });
  under('plastic_crate_01', bx, bz + 0.1, 1.5, { h: 0.26 });
  under('cardboard_box_01', bx, bz + 0.62, 0.2, { h: 0.3 });
  model('metal_jerrycan', bx - 0.05, 0, bz - 0.5, 1.6, { h: 0.27 }, group);
  model('plastic_jerrycan', bx - 0.02, 0, bz + 0.05, 0.3, { h: 0.26 }, group);
  model('propane_tank', bx - 0.05, 0, bz + 0.6, 0, { h: 0.27 }, group);

  // further back on the right: the tool chest on its cart, then steel shelves loaded to the top
  model('tool_cart', x1 - 0.42, 0, 0.85, Math.PI / 2, { h: 0.82 }, group);
  model('metal_tool_chest', x1 - 0.38, 0.84, 0.85, -Math.PI / 2, { h: 0.42 }, group);
  model('steel_frame_shelves_02', x1 - 0.28, 0, 1.85, -Math.PI / 2, { h: 2.1 }, group);
  const shelf = (n, y, z, ry, o) => model(n, x1 - 0.3, y, z, ry, { shadow: false, ...o }, group);
  const L = [0.12, 0.62, 1.12, 1.6];
  shelf('propane_tank', L[0], 1.68, 0.5, { h: 0.4 }); shelf('metal_jerrycan', L[0], 1.95, 1.57, { h: 0.4 }); shelf('plastic_bottle_gallon', L[0], 2.07, 0.4, { h: 0.27 });
  shelf('bleach_bottle', L[1], 1.65, 0, { h: 0.29 }); shelf('multi_cleaner_bottle', L[1], 1.75, 0.7, { h: 0.23 }); shelf('spray_paint_bottles', L[1], 1.86, 1.2, { h: 0.2 }); shelf('watering_can_metal_01', L[1], 2.0, 1.2, { h: 0.2 });
  shelf('american_football', L[2], 1.7, 0.4, { h: 0.16 }); shelf('plastic_crate_01', L[2], 1.98, 1.57, { h: 0.22 }); shelf('can_rusted', L[2], 1.82, 0.3, { h: 0.12 });
  shelf('cardboard_box_01', L[3], 1.72, 1.57, { h: 0.26 }); shelf('cardboard_box_01', L[3], 2.0, 1.45, { h: 0.22 });

  // ---- the back wall: the house door, a rack, the bins ----
  box(M.trim, 0.92, 2.06, 0.06, 0.2, 1.03, z1 - 0.01);
  box(M.paint, 0.82, 1.98, 0.045, 0.2, 1.0, z1 - 0.035);
  raw(M.steel, new THREE.SphereGeometry(0.03, 10, 8).translate(-0.12, 1.0, z1 - 0.09));
  model('worn_metal_rack', -1.3, 0, z1 - 0.34, Math.PI, { h: 1.9 }, group);
  const rack = (n, x, y, ry, o) => model(n, x, y, z1 - 0.34, ry, { shadow: false, ...o }, group);
  rack('plastic_crate_02', -1.52, 0.02, 0.1, { h: 0.25 }); rack('plastic_jerrycan', -1.05, 0.02, 0.5, { h: 0.3 });
  rack('metal_toolbox', -1.5, 0.47, 3.2, { h: 0.2 }); rack('small_oil_can_01', -1.15, 0.47, 0.6, { h: 0.18 }); rack('can_rusted', -0.98, 0.47, 0, { h: 0.12 });
  rack('cardboard_box_01', -1.48, 0.97, 1.6, { h: 0.26 }); rack('plastic_bottle_gallon', -1.12, 0.97, 0.2, { h: 0.27 }); rack('bleach_bottle', -0.98, 0.97, 1, { h: 0.27 });
  rack('wooden_crate_02', -1.3, 1.47, 1.57, { h: 0.24 });
  model('trashbag', 1.25, 0, z1 - 0.3, 0.7, { h: 0.45 }, group);
  model('metal_trash_can', 0.95, 0, 1.05, 0.25, { h: 0.72, shadow: !low }, group);
  model('plastic_broom', -0.45, 0, z1 - 0.2, 0.3, { h: 1.25 }, group);
  model('korean_fire_extinguisher_01', 0.85, 0, z1 - 0.22, 2.6, { h: 0.55 }, group);
  model('power_box_01', -0.55, 1.35, z1 - 0.06, Math.PI, { h: 0.5, shadow: false }, group);
  box(M.steel, 0.025, 1.2, 0.025, -0.55, 2.0, z1 - 0.03);
  model('wall_clock', 0.2, 2.22, z1 - 0.035, Math.PI, { h: 0.3, shadow: false }, group);

  // ---- the left wall: a couch under the foam, a television on a crate, the ladder, the hose ----
  model('sofa_01', x0 + 0.42, 0, 1.25, Math.PI / 2, { h: 0.78 }, group);
  model('wooden_crate_02', -0.75, 0, 1.9, 1.45, { h: 0.42 }, group);
  model('television_01', -0.75, 0.42, 1.9, 2.6, { h: 0.44 }, group);
  model('boombox', x0 + 0.24, 0.02, -1.05, Math.PI / 2 + 0.25, { h: 0.34 }, group);
  model('ladder_sectioned_01', x0 + 0.2, 0, -2.75, 0.15, { h: 2.1, rz: -0.09 }, group);
  model('garden_hose_wall_mounted_01', x0 + 0.13, 0.75, 0.42, Math.PI / 2, { h: 0.5, shadow: false }, group);
  model('metal_stool_01', -1.25, 0, -1.5, 0.4, { h: 0.62 }, group);
  model('potted_plant_04', x0 - 0.04, WIN[1].y0 + 0.035, WIN[1].z - 0.22, 0.6, { h: 0.27 }, group);
  model('utility_box_01', x1 - 0.2, 0, -2.6, -Math.PI / 2, { h: 1.05 }, group);
    model('industrial_wall_lamp', 0.9, 2.05, z1 - 0.08, Math.PI, { h: 0.4, shadow: false }, group);

  // posters taped to the block
  const poster = (w, h, x, y, z, ry, draw) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: canvasTex(96, Math.round(96 * h / w), draw), roughness: 0.9 }));
    m.material.map.magFilter = THREE.NearestFilter;
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
    group.add(m);
  };
  poster(0.42, 0.6, x0 + 0.004, 1.62, -1.07, Math.PI / 2, (c, w, h) => {
    c.fillStyle = '#131313'; c.fillRect(0, 0, w, h); c.fillStyle = '#d43a2a'; c.beginPath(); c.arc(w / 2, h * 0.42, w * 0.3, 0, 7); c.fill();
    c.fillStyle = '#f1e9d2'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.fillText('LOUD', w / 2, h * 0.84); c.font = '7px sans-serif'; c.fillText('ONE NIGHT ONLY', w / 2, h * 0.94);
  });
  poster(0.5, 0.36, x1 - 0.036, 2.25, -1.9, -Math.PI / 2, (c, w, h) => {
    c.fillStyle = '#e8d9a8'; c.fillRect(0, 0, w, h); c.fillStyle = '#20324f'; for (let i = 0; i < 9; i++) c.fillRect(0, i * 8, w, 3);
    c.fillStyle = '#b5271e'; c.font = 'bold 20px sans-serif'; c.textAlign = 'center'; c.fillText('GARAGE', w / 2, h * 0.62);
  });
  // a few old oil stains on the slab
  const stain = new THREE.MeshBasicMaterial({ color: 0x0b0a09, transparent: true, opacity: 0.32, depthWrite: false });
  for (const [x, z, r] of [[1.0, 0.9, 0.22], [1.25, 0.6, 0.1], [-0.2, 1.9, 0.16], [0.6, -2.5, 0.13]]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14).rotateX(-Math.PI / 2), stain);
    m.position.set(x, 0.003, z); m.scale.z = 0.7;
    group.add(m);
  }

  // ---- outside: the drive to the street, a lawn, the side fence, planting, the house opposite ----
  const out = new THREE.Group();
  group.add(out);
  box(M.drive, 3.4, 0.1, 9, 0, -0.07, z0 - 4.5 - W);
  box(M.road, 60, 0.1, 6, 0, -0.1, z0 - 12.2);
  box(M.grass, 60, 0.1, 9.2, 0, -0.09, z0 - 4.6 - W);
  box(M.grass, 16, 0.1, 22, x0 - 8.2, -0.09, 0);
  box(M.grass, 60, 0.1, 14, 0, -0.09, z0 - 22.2);
  box(M.fence, 0.04, 1.75, 16, x0 - 3.4, 0.87, 0.5);
  for (let z = -7; z < 9; z += 2) box(M.fence, 0.09, 1.85, 0.09, x0 - 3.34, 0.92, z);
  model('planter_box_01', x0 - 0.75, 0, WIN[0].z + 0.1, Math.PI / 2, { h: 0.42, shadow: false }, out);
  model('potted_plant_01', x0 - 0.8, 0.3, WIN[0].z - 0.2, 0.4, { h: 1.35, shadow: false }, out);
  model('potted_plant_01', x0 - 1.5, 0, WIN[1].z + 0.4, 2.2, { h: 1.6, shadow: false }, out);
  model('potted_plant_01', x0 - 2.6, 0, WIN[0].z + 1.0, 4.0, { h: 1.9, shadow: false }, out);
  model('planter_box_01', 2.3, 0, z0 - 1.2, 0, { h: 0.42, shadow: false }, out);
  // trees and hedges: the same real plants, grown, far enough to sit in the haze
  for (const [x, z, hh, ry] of [[x0 - 5.6, -2.5, 4.6, 0], [x0 - 6.5, 3.2, 4, 1.3], [-5.5, z0 - 7.5, 4.2, 2.1], [6.2, z0 - 8.5, 5, 3.3], [-9, z0 - 17, 6, 0.7], [5.5, z0 - 15.5, 5.5, 4.4], [-2.6, z0 - 15.6, 2.2, 5]])
    model('potted_plant_01', x, -0.25 * hh / 1.33, z, ry, { h: hh, shadow: false }, out);
  // the house across the street
  const hx = 1.5, hz = z0 - 19;
  box(M.brick, 9, 3, 6, hx, 1.5, hz);
  const roofG = new THREE.CylinderGeometry(0.02, 3.6 / Math.SQRT1_2 * 0.5 + 2.2, 1.9, 4, 1).rotateY(Math.PI / 4);
  roofG.scale(1.25, 1, 0.85); roofG.translate(hx, 3.95, hz);
  raw(M.roof, roofG.toNonIndexed());
  for (const wx of [-3, -1, 2.6]) { box(M.trim, 1.1, 1.2, 0.08, hx + wx, 1.7, hz + 3.02); box(M.dark, 0.95, 1.05, 0.1, hx + wx, 1.7, hz + 3.02); }
  box(M.paint, 0.95, 2.05, 0.1, hx + 0.9, 1.03, hz + 3.02);
  box(M.fence, 22, 1.1, 0.05, hx, 0.55, hz + 6.3);

  // gather the boxes
  for (const [mat, list] of bins) {
    const same = list.every((g) => !!g.index === !!list[0].index);
    const m = new THREE.Mesh(mergeGeometries(same ? list : list.map((g) => (g.index ? g.toNonIndexed() : g))), mat);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }

  // ---- the sky and the light ----
  const sky = new Sky();
  sky.scale.setScalar(55);
  const U = sky.material.uniforms;
  U.turbidity.value = 4.5; U.rayleigh.value = 1.6; U.mieCoefficient.value = 0.006; U.mieDirectionalG.value = 0.82;
  U.sunPosition.value.copy(SUN);
  sky.material.fog = false;
  group.add(sky);
  // the air: a warm haze that thickens with distance, so the street dissolves instead of ending
  scene.fog = new THREE.FogExp2(0xb7c6d2, 0.03);

  const sun = new THREE.DirectionalLight(0xfff0d8, 10);
  sun.position.copy(SUN).multiplyScalar(14).add(new THREE.Vector3(0, 0.5, -0.3));
  sun.target.position.set(0, 0.5, -0.3);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(low ? 1024 : 2048);
  const sc = sun.shadow.camera;
  sc.left = -5.5; sc.right = 5.5; sc.top = 5; sc.bottom = -5; sc.near = 4; sc.far = 26;
  sun.shadow.needsUpdate = true;
  sun.shadow.autoUpdate = false; // the room does not move: the sun's shadows are drawn once
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  group.add(sun, sun.target);
  // every other light in the room is the sun's, come round a corner, and each throws its own shadows (drawn once):
  // the sky through the side windows, the sky under and through the door, the warm light back up off the slab where the sun lands
  const lights = [];
  const still = (color, power, from, to, angle, size = 1024) => {
    const l = new THREE.SpotLight(color, power, 0, angle, 1, 2);
    l.position.set(...from); l.target.position.set(...to);
    l.castShadow = true;
    l.shadow.mapSize.setScalar(low ? 512 : size);
    l.shadow.camera.near = 0.25; l.shadow.camera.far = 9;
    l.shadow.bias = -0.002; l.shadow.normalBias = 0.03;
    l.shadow.needsUpdate = true; l.shadow.autoUpdate = false;
    group.add(l, l.target);
    lights.push([l, power]);
    return l;
  };
  still(0xbdd2ee, 30, [x0 - 1.1, 1.75, (WIN[0].z + WIN[1].z) / 2], [1.2, 0.6, -0.6], 1.0);
  still(0xc8d8ee, 24, [0, 1.3, z0 - 1.6], [0, 0.7, 0.8], 0.95);
  still(0xffd9a8, 9, [-0.55, 0.06, -1.0], [0.1, 2.6, -0.2], 1.25);
  lights.push([sun, sun.intensity]);
  const hemi = new THREE.HemisphereLight(0xaebfd6, 0x57493b, 0.14);
  group.add(hemi);
  // the work lamp over the kit, swinging a little on its cord: the one light whose shadows follow the sticks and hands
  const cord = new THREE.Group();
  cord.position.set(0.15, H, -0.62);
  group.add(cord);
  model('hanging_industrial_lamp', 0, -0.85, 0, 0, { h: 0.85, shadow: false }, cord);
  const lamp = new THREE.SpotLight(0xffd9ae, 6.5, 0, 0.85, 0.9, 2);
  lamp.position.set(0, -0.9, 0);
  lamp.target.position.set(0, -2.6, 0.05);
  lamp.castShadow = true;
  lamp.shadow.mapSize.setScalar(low ? 512 : 1024);
  lamp.shadow.camera.near = 0.3; lamp.shadow.camera.far = 3.2;
  lamp.shadow.bias = -0.002;
  cord.add(lamp, lamp.target);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
  bulb.position.set(0, -0.78, 0);
  cord.add(bulb);

  // ---- where light cannot get to: the meeting of wall and floor, the corners, under the bench and the couch ----
  const fall = canvasTex(4, 64, (c) => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,.72)'); c.fillStyle = g; c.fillRect(0, 0, 4, 64); });
  const blob = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(0.6, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const shadeM = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const fallM = shadeM(fall), blobM = shadeM(blob), strips = [];
  // a strip from its dark edge (a..b) fading toward (c..d)
  const strip = (a, b, c, d) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...a, ...b, ...d, ...a, ...d, ...c]), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]), 2));
    strips.push(g);
  };
  const e = 0.004, ix0 = x0 + e, ix1 = x1 - e, iz0 = z0 + e, iz1 = z1 - e, FW = 0.55, WH = 0.6, CH = 0.5, CW = 0.4;
  for (const [ax, az, bx, bz, nx, nz] of [[ix0, iz0, ix0, iz1, 1, 0], [ix1, iz1, ix1, iz0, -1, 0], [ix0, iz1, ix1, iz1, 0, -1], [ix1, iz0, ix0, iz0, 0, 1]]) {
    strip([ax, e, az], [bx, e, bz], [ax + nx * FW, e, az + nz * FW], [bx + nx * FW, e, bz + nz * FW]);
    strip([ax, e, az], [bx, e, bz], [ax, WH, az], [bx, WH, bz]);
    strip([ax, H - e, az], [bx, H - e, bz], [ax, H - CH, az], [bx, H - CH, bz]);
    strip([ax, 0, az], [ax, H, az], [ax + (bx - ax ? Math.sign(bx - ax) * CW : 0), 0, az + (bz - az ? Math.sign(bz - az) * CW : 0)], [ax + (bx - ax ? Math.sign(bx - ax) * CW : 0), H, az + (bz - az ? Math.sign(bz - az) * CW : 0)]);
    strip([bx, 0, bz], [bx, H, bz], [bx - (bx - ax ? Math.sign(bx - ax) * CW : 0), 0, bz - (bz - az ? Math.sign(bz - az) * CW : 0)], [bx - (bx - ax ? Math.sign(bx - ax) * CW : 0), H, bz - (bz - az ? Math.sign(bz - az) * CW : 0)]);
  }
  const ao = new THREE.Mesh(mergeGeometries(strips), fallM);
  ao.material.side = THREE.DoubleSide; ao.renderOrder = 2;
  group.add(ao);
  for (const [x, z, w, d, y] of [[bx, bz, 1.0, 2.3, 0.006], [x0 + 0.45, 1.25, 1.1, 2.0, 0.006], [x1 - 0.35, 1.3, 1.0, 1.9, 0.006], [-1.3, z1 - 0.35, 1.4, 0.9, 0.006], [0.12, -0.45, 2.6, 2.3, 0.02], [-1.45, -2.5, 1, 0.7, 0.006], [-0.75, 1.9, 0.9, 0.9, 0.006]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), blobM);
    m.position.set(x, y, z); m.renderOrder = 2;
    group.add(m);
  }
  model('mounted_fluorescent_lights', 0.4, H - 0.045, 1.2, Math.PI / 2, { w: 0.9, shadow: false }, group);

  // ---- the sun in the air: shafts from every pane to the floor, and dust turning in them ----
  const openings = [...WIN.map((o) => ({ c: new THREE.Vector3(x0, (o.y0 + o.y1) / 2, o.z), u: new THREE.Vector3(0, 0, o.w / 2 - 0.03), v: new THREE.Vector3(0, (o.y1 - o.y0) / 2 - 0.03, 0) })),
    ...panes.filter((p) => p.axis === 'z').map((p) => ({ c: new THREE.Vector3(p.x, p.y, p.z + 0.05), u: new THREE.Vector3(p.w / 2, 0, 0), v: new THREE.Vector3(0, p.h / 2, 0) }))];
  const shaftG = [], down = SUN.clone().negate();
  for (const o of openings) {
    const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => o.c.clone().addScaledVector(o.u, a).addScaledVector(o.v, b));
    const fl = cs.map((p) => p.clone().addScaledVector(down, p.y / -down.y));
    const pos = [];
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; pos.push(cs[i], cs[j], fl[j], cs[i], fl[j], fl[i]); }
    const g = new THREE.BufferGeometry().setFromPoints(pos);
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(pos.length * 2), 2));
    g.computeVertexNormals();
    shaftG.push(g);
    o.fl = fl; o.cs = cs;
  }
  const shafts = new THREE.Mesh(mergeGeometries(shaftG), new THREE.MeshBasicMaterial({ color: 0xffe9c4, transparent: true, opacity: 0.012, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  shafts.renderOrder = 6;
  shafts.visible = false; // the dust shows the beams; a beam's own flat sides showed as edges
  group.add(shafts);
  const N = low ? 60 : 220, dp = new Float32Array(N * 3), seed = [];
  for (let i = 0; i < N; i++) seed.push({ o: openings[i % openings.length], a: Math.random() * 2 - 1, b: Math.random() * 2 - 1, t: Math.random(), s: 0.01 + Math.random() * 0.02, p: Math.random() * 6.28 });
  const dustG = new THREE.BufferGeometry();
  dustG.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: 0xfff2d8, size: 0.006, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  dust.frustumCulled = false;
  group.add(dust);
  const tmp = new THREE.Vector3();

  return {
    group, sun, lamp, sky, M, cord, swing: 0, haloM,
    // a headset that still cannot keep up loses the two softest lights and the shafts, never the sun or the lamp
    thin() { this.lean = true; lights[1][0].visible = lights[2][0].visible = false; shafts.visible = false; hemi.intensity = 0.25; },
    // a loud hit sets the lamp going on its cord
    jolt(v) { this.swing = Math.min(1, this.swing + v * 0.5); },
    update(dt, time) {
      this.swing *= Math.exp(-dt * 0.5);
      // thin cloud crossing the sun: all of its light, direct and come round corners, swells and fades together
      const cloud = 0.8 + 0.2 * Math.sin(time * 0.11) * Math.sin(time * 0.043 + 1.3) + 0.06 * Math.sin(time * 0.37);
      for (const [l, p] of lights) l.intensity = p * cloud;
      shafts.material.opacity = 0.012 * cloud;
      const sw = 1 + this.swing * 3;
      cord.rotation.set(0.022 * sw * Math.sin(time * 1.9), 0, 0.03 * sw * Math.sin(time * 1.7 + 0.6));
      for (let i = 0; i < N; i++) {
        const d = seed[i];
        d.t = (d.t + d.s * dt) % 1;
        tmp.copy(d.o.c).addScaledVector(d.o.u, d.a * 0.95 + 0.04 * Math.sin(time * 0.3 + d.p)).addScaledVector(d.o.v, d.b * 0.95);
        tmp.addScaledVector(down, d.t * (tmp.y / -down.y));
        dp[i * 3] = tmp.x; dp[i * 3 + 1] = tmp.y + 0.02 * Math.sin(time * 0.5 + d.p); dp[i * 3 + 2] = tmp.z;
      }
      dustG.attributes.position.needsUpdate = true;
    },
  };
}
