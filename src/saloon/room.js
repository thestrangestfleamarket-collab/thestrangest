// the saloon itself: one tall plank room at night, the long bar and its back bar and mirror, stools, tables and chairs, the stove, the piano's stage, lamps, the batwing doors and the street beyond them; what is solid, what things rest on, where people sit and stand
import * as THREE from 'three';
import { G, BOUNDS, mergeStatic } from '../sushi/ctx.js';
import { PH } from '../sushi/physics.js';
import { pbr, plain, brass, slab, tube, model, canvasTex, glow } from './kit.js';
import { buildBarWood } from './barwood.js';

// the room: x from -W to W, z from the street wall at -L to the back wall at B; you stand behind the bar at the origin, looking down the room (-z)
export const R = { W: 7, L: 11.5, B: 1.7, H: 4.3, barX: 3.2, barZ0: -0.9, barZ1: -0.32, barY: 1.06, backZ: 1.05, backY: 0.92, stoolZ: -1.32,
  pool: { x: 4.3, z: -5.6 }, darts: { x: -6.93, y: 1.73, z: -3.2 }, piano: { x: -5.9, z: -9.2 }, poker: { x: 0.9, z: -8.4 }, door: { x: 0, z: -11.5 }, stove: { x: -5.6, z: -5.9 }, board: { x: 6.93, z: -2.2 }, hatch: { x: -2.5, z: 0.45 } };

export function buildRoom(scene) {
  const g = new THREE.Group(), dyn = new THREE.Group(); scene.add(g, dyn);
  const solids = [], seats = [], lamps = [];
  const solid = (x0, x1, z0, z1, h = 3) => { solids.push({ x0, x1, z0, z1 }); if (PH.ready) PH.box((x0 + x1) / 2, h / 2, (z0 + z1) / 2, (x1 - x0) / 2, h / 2, (z1 - z0) / 2); };
  const top = (x0, x1, z0, z1, y, th = 0.03) => { G.surfaces.push({ minX: x0, maxX: x1, minZ: z0, maxZ: z1, y }); if (PH.ready) PH.box((x0 + x1) / 2, y - th, (z0 + z1) / 2, (x1 - x0) / 2, th, (z1 - z0) / 2); };
  const { W, L, B, H } = R;
  const floorM = pbr('floor', { tile: 2.2, rough: 1, env: 0.35, color: 0xc8b8a4 }), wallM = pbr('wall', { tile: 2.4, color: 0xb8a48c }), paperM = pbr('paper', { tile: 1.6, color: 0x9a6a5a }), darkM = pbr('dark', { tile: 1.8, color: 0x8a7a6a }), walnut = pbr('walnut', { tile: 1.2, color: 0x5c3a2a, rough: 0.5, env: 0.8 }), plank = pbr('planks', { tile: 1.6 });

  // ---- the shell
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, L + B).rotateX(-Math.PI / 2), floorM); fl.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? (L + B) : 2 * W) / 2.2; }); fl.position.set(0, 0, (B - L) / 2); fl.receiveShadow = true; g.add(fl);
  slab(2 * W, 0.2, L + B, darkM, 0, H + 0.1, (B - L) / 2, g);
  for (let z = -L + 1.2; z < B; z += 2.1) slab(2 * W, 0.24, 0.2, darkM, 0, H - 0.12, z, g);   // the beams
  const wall = (w, x, z, ry, door) => { const grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry; g.add(grp);
    if (!door) { slab(w, 1.15, 0.12, wallM, 0, 0.575, 0, grp); slab(w, H - 1.2, 0.1, paperM, 0, 1.2 + (H - 1.2) / 2, 0, grp); }
    slab(w, 0.09, 0.16, walnut, 0, 1.17, 0, grp); slab(w, 0.16, 0.15, walnut, 0, 0.08, 0, grp); slab(w, 0.14, 0.15, walnut, 0, H - 0.07, 0, grp); return grp; };
  wall(2 * W, 0, B + 0.06, 0); wall(L + B, -W - 0.06, (B - L) / 2, Math.PI / 2); wall(L + B, W + 0.06, (B - L) / 2, Math.PI / 2);
  { // the street wall: the doorway in the middle, a tall window either side
    const fw = wall(2 * W, 0, -L - 0.06, 0, true), pane = plain(0x0a1220, { rough: 0.08, metal: 0.2, env: 1.6, glow: 0x05080f });
    for (const [x0, x1] of [[-W, -5.6], [-3.2, -0.95], [0.95, 3.2], [5.6, W]]) { slab(x1 - x0, 1.15, 0.12, wallM, (x0 + x1) / 2, 0.575, 0, fw); slab(x1 - x0, H - 1.2, 0.1, paperM, (x0 + x1) / 2, 1.2 + (H - 1.2) / 2, 0, fw); }
    for (const s of [-1, 1]) { const x = s * 4.4; slab(2.4, 0.9, 0.12, wallM, x, 0.45, 0, fw); slab(2.4, H - 3.0, 0.1, paperM, x, 3.0 + (H - 3.0) / 2, 0, fw); slab(2.3, 2.1, 0.02, pane, x, 1.95, -0.03, fw);
      for (const dx of [-1.15, 0, 1.15]) slab(0.07, 2.1, 0.09, walnut, x + dx, 1.95, 0, fw); for (const dy of [0.9, 1.95, 3.0]) slab(2.4, 0.07, 0.11, walnut, x, dy, 0, fw); }
    slab(1.9, H - 2.5, 0.1, paperM, 0, 2.5 + (H - 2.5) / 2, 0, fw); slab(2.1, 0.12, 0.2, walnut, 0, 2.5, 0, fw); for (const s of [-1, 1]) slab(0.12, 2.5, 0.2, walnut, s * 0.98, 1.25, 0, fw);
  }
  solid(-W - 1, -W, -L, B); solid(W, W + 1, -L, B); solid(-W, W, B, B + 1); solid(-W, -0.95, -L - 1, -L); solid(0.95, W, -L - 1, -L);

  // ---- the street through the doors: dirt, a far row of dark fronts with a few lit windows, the night
  { const dirt = pbr('dirt', { tile: 3, color: 0x6a5a4a }), st = new THREE.Mesh(new THREE.PlaneGeometry(26, 12).rotateX(-Math.PI / 2), dirt); st.position.set(0, -0.12, -L - 6); st.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? 4 : 8.6); }); g.add(st);
    slab(4, 0.14, 1.6, plank, 0, -0.07, -L - 0.9, g);
    const far = canvasTex(1024, 256, (x, w, h) => { x.fillStyle = '#070912'; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(220,225,255,${0.3 + Math.random() * 0.6})`; x.fillRect(Math.random() * w, Math.random() * 110, 1.5, 1.5); }
      let px = 0; while (px < w) { const bw = 90 + Math.random() * 120, bh = 90 + Math.random() * 70; x.fillStyle = '#0d0b0a'; x.fillRect(px, h - bh, bw - 6, bh); x.fillRect(px, h - bh - 18, bw - 6, 20);
        for (let k = 0; k < 3; k++) if (Math.random() < 0.45) { x.fillStyle = `rgba(255,${170 + Math.random() * 40 | 0},90,${0.5 + Math.random() * 0.4})`; x.fillRect(px + 14 + k * (bw - 40) / 3, h - bh + 26, 14, 22); } px += bw; } });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), new THREE.MeshBasicMaterial({ map: far, fog: false })); card.position.set(0, 4.2, -L - 12); g.add(card); }

  // ---- the bar and the back bar (barwood.js)
  const X = R.barX, bz = R.backZ, { shelves, mirror } = buildBarWood(g, top, solid);
  model('mantel_clock_01', -1.5, R.backY, bz + 0.34, Math.PI, { h: 0.3 }, g);

  // ---- stools along the bar
  for (let i = 0; i < 7; i++) { const x = -2.55 + i * 0.85; model('wooden_stool_01', x, 0, R.stoolZ, i * 1.3, { h: 0.76 }, g); seats.push({ x, z: R.stoolZ, ry: 0, y: 0, kind: 'stool', at: 'bar', i, who: null }); solids.push({ x0: x - 0.17, x1: x + 0.17, z0: R.stoolZ - 0.17, z1: R.stoolZ + 0.17, low: true }); }

  // ---- tables and chairs down the room
  const tables = [];
  const table = (x, z, name, n = 4) => { model('round_wooden_table_01', x, 0, z, 0, { h: 0.76 }, g); top(x - 0.38, x + 0.38, z - 0.38, z + 0.38, 0.76); if (PH.ready) PH.cyl(x, 0.38, z, 0.36, 0.1); solids.push({ x0: x - 0.42, x1: x + 0.42, z0: z - 0.42, z1: z + 0.42 }); const t = { x, z, name, seats: [] }; tables.push(t);
    for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n + 0.6, cx = x + Math.sin(a) * 0.78, cz = z + Math.cos(a) * 0.78; model('painted_wooden_chair_02', cx, 0, cz, a + Math.PI + (k * 0.37 % 0.5 - 0.25), { h: 0.88 }, g).traverse((o) => { if (o.isMesh) o.material.color.set(0x8a6444); }); const s = { x: cx, z: cz, ry: a + Math.PI, y: -0.33, kind: 'chair', at: name, who: null }; seats.push(s); t.seats.push(s); } return t; };
  table(-3.6, -4.3, 'left'); table(-0.7, -5.2, 'middle'); table(R.poker.x, R.poker.z, 'poker'); table(-3.3, -8.3, 'stage', 3);
  { const felt = new THREE.Mesh(new THREE.CircleGeometry(0.46, 28).rotateX(-Math.PI / 2), pbr('velvet', { tile: 0.5, color: 0x1f5a34 })); felt.position.set(R.poker.x, 0.765, R.poker.z); g.add(felt); }

  // ---- the stove, its pipe, the old woman's rocking chair beside it
  model('barrel_stove', R.stove.x, 0, R.stove.z, 0.6, { h: 0.95 }, g); tube(0.07, 0.07, H - 0.9, plain(0x1a1816, { rough: 0.7, metal: 0.6 }), R.stove.x, 0.9 + (H - 0.9) / 2, R.stove.z, g, 10); solid(R.stove.x - 0.35, R.stove.x + 0.35, R.stove.z - 0.35, R.stove.z + 0.35, 1);
  model('rockingchair_01', -6.1, 0, -4.7, 1.9, { h: 1.0 }, g); seats.push({ x: -6.1, z: -4.7, ry: 1.9, y: -0.3, kind: 'chair', at: 'stove', who: null });
  model('wooden_bucket_01', -5.0, 0, -6.6, 0.4, { h: 0.3 }, g);

  // ---- the stage and the piano (built here: an upright in dark walnut, its keys and lid)
  { const P = R.piano; slab(3.4, 0.22, 2.6, plank, P.x + 0.5, 0.11, P.z - 0.6, g); top(P.x - 1.2, P.x + 2.2, P.z - 1.9, P.z + 0.7, 0.22, 0.1); solids.push({ x0: P.x - 1.2, x1: P.x + 2.2, z0: P.z - 1.9, z1: P.z + 0.7, step: 0.22 });
    const pn = new THREE.Group(); pn.position.set(P.x - 0.45, 0.22, P.z - 0.6); pn.rotation.y = Math.PI / 2; g.add(pn); const eb = plain(0x241410, { rough: 0.35, env: 1.1 });
    slab(1.5, 1.25, 0.34, eb, 0, 0.625, 0, pn); slab(1.5, 0.05, 0.6, eb, 0, 0.72, 0.28, pn); slab(1.38, 0.025, 0.16, plain(0xe8e2d0, { rough: 0.4 }), 0, 0.755, 0.42, pn);
    for (let i = 0; i < 36; i++) { if ([1, 2, 4, 5, 6].includes(i % 7)) slab(0.016, 0.02, 0.09, plain(0x0c0a0a), -0.675 + i * 0.0385, 0.775, 0.385, pn); }
    for (const s of [-1, 1]) slab(0.06, 0.72, 0.06, eb, s * 0.7, 0.36, 0.52, pn); slab(1.5, 0.04, 0.38, eb, 0, 1.27, 0, pn);
    model('wooden_stool_01', P.x + 0.45, 0.22, P.z - 0.6, 0, { h: 0.5 }, g); model('brass_candleholders', P.x - 0.5, 1.51, P.z - 0.6, 0, { h: 0.3 }, g);
    solid(P.x - 0.7, P.x - 0.2, P.z - 1.4, P.z + 0.2, 1.4);
    for (const s of [-1, 1]) { const c = slab(0.5, H - 0.6, 0.08, pbr('velvet', { tile: 0.7, color: 0x6a1418 }), P.x + 0.5 + s * 1.75, 0.3 + (H - 0.6) / 2, -L + 0.12, g); c.rotation.y = s * 0.12; } }

  // ---- barrels, crates, the clock, the benches by the door, spittoons, pictures
  for (const [x, z, r] of [[6.4, -10.7, 0], [5.7, -10.8, 1], [6.45, -10.0, 2]]) { model('wine_barrel_01', x, 0, z, r, { h: 0.95 }, g); solids.push({ x0: x - 0.35, x1: x + 0.35, z0: z - 0.35, z1: z + 0.35 }); }
  model('wooden_crate_01', 6.4, 0, 0.9, 0.3, { h: 0.5 }, g); model('wooden_crate_01', 6.35, 0.5, 0.95, 1.1, { h: 0.45 }, g); model('wine_barrel_01', 5.5, 0, 1.1, 0.5, { h: 0.95 }, g);
  model('vintage_grandfather_clock_01', -6.75, 0, -0.2, Math.PI / 2, { h: 2.15 }, g);
  model('painted_wooden_bench', -2.2, 0, -10.95, 0, { w: 1.5 }, g); model('painted_wooden_bench', 2.2, 0, -10.95, 0, { w: 1.5 }, g);
  for (const [x, z] of [[-2.9, -1.75], [2.9, -1.75], [R.poker.x + 0.9, R.poker.z + 0.9]]) model('brass_pot_01', x, 0, z, 0, { h: 0.2 }, g);
  for (const [x, y, z, ry, w] of [[-6.96, 2.2, -7.4, Math.PI / 2, 1.0], [6.96, 2.3, -8.6, -Math.PI / 2, 1.1], [-6.96, 2.25, 0.6, Math.PI / 2, 0.8]]) model('fancy_picture_frame_01', x, y - 0.4, z, ry, { w }, g);

  // ---- light: nothing shines but the lamps: three wagon-wheel chandeliers that throw real shadows, two oil lamps on the back bar, the stove's mouth, the moon through the street windows (look.js)
  const hemi = new THREE.HemisphereLight(0xffc890, 0x1a0e08, 0.16); scene.add(hemi);
  const halo = (x, y, z, c, sc = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: c, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(sc); s.position.set(x, y, z); s.userData.nopick = true; dyn.add(s); return s; };
  const lamp = (x, y, z, k, d, c = 0xffa850) => { const l = new THREE.PointLight(c, k, d, 2); l.position.set(x, y, z); scene.add(l); const o = { l, s: halo(x, y, z, c), k, on: true, x, y, z }; lamps.push(o); return o; };
  const iron = plain(0x14110e, { metal: 0.7, rough: 0.6 }), chim = new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffa040, emissiveIntensity: 2.2, transparent: true, opacity: 0.85, roughness: 0.2 });
  for (const [x, z] of [[-2.2, -4.6], [2.6, -6.2], [-1.5, -9.0]]) { const y = H - 1.35, w = new THREE.Group(); w.position.set(x, y, z); g.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 28).rotateX(Math.PI / 2), walnut); rim.castShadow = true; w.add(rim); tube(0.07, 0.07, 0.12, walnut, 0, 0, 0, w, 10);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, sp = slab(0.6, 0.03, 0.035, walnut, Math.cos(a) * 0.31, 0, Math.sin(a) * 0.31, w); sp.rotation.y = -a; const lx = Math.cos(a + 0.5) * 0.62, lz = Math.sin(a + 0.5) * 0.62; tube(0.03, 0.04, 0.05, brass(), lx, 0.06, lz, w, 8); const c = tube(0.022, 0.03, 0.11, chim, lx, 0.14, lz, w, 8); c.castShadow = false; c.userData.keep = true; }
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, ch = tube(0.006, 0.006, 1.42, iron, Math.cos(a) * 0.3, 0.66, Math.sin(a) * 0.3, w, 4); ch.rotation.z = -Math.cos(a) * 0.44; ch.rotation.x = Math.sin(a) * 0.44; ch.castShadow = false; }
    const l = new THREE.SpotLight(0xffb070, 150, 11, 1.25, 0.9, 1.6); l.position.set(x, y + 0.1, z); l.target.position.set(x, 0, z); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0015; l.shadow.radius = 4; l.shadow.camera.near = 0.6; l.shadow.camera.far = 8; scene.add(l, l.target);
    lamps.push({ l, s: halo(x, y + 0.14, z, 0xffb060, 1.5), k: 120, on: true, x, y: y + 0.14, z, wheel: true }); }
  for (const x of [-2.6, 2.6]) { model('vintage_oil_lamp', x, R.backY, bz + 0.25, 0, { h: 0.38 }, g); halo(x, R.backY + 0.3, bz + 0.25, 0xffb060, 0.4); }
  for (const x of [-1.7, 1.7]) { model('lantern_01', x, 2.25, 0.25, 0, { h: 0.42 }, g); tube(0.006, 0.006, H - 2.67, iron, x, 2.67 + (H - 2.67) / 2, 0.25, g, 4); lamp(x, 2.4, 0.25, 16, 7, 0xffb878); }
  const fire = lamp(R.stove.x + 0.25, 0.45, R.stove.z + 0.2, 4, 3.5, 0xff5a18);

  // ---- where people stand: at the doors, at the bar between stools, by the stove, the piano, the pool table, the dartboard
  const spots = { door: { x: 0, z: -L + 0.7 }, street: { x: 0, z: -L - 2.5 }, bar: [-2.98, -2.13, -1.28, -0.43, 0.42, 1.27, 2.12, 2.9].map((x) => ({ x, z: -1.4 })), stove: { x: -4.9, z: -5.3 }, piano: { x: R.piano.x + 0.45, z: R.piano.z - 0.6 }, stage: { x: R.piano.x + 1.4, z: R.piano.z - 0.9 }, pool: { x: R.pool.x - 1.5, z: R.pool.z }, darts: { x: R.darts.x + 2.4, z: R.darts.z }, board: { x: R.board.x - 1.0, z: R.board.z }, flap: { x: X + 0.7, z: -0.6 } };

  Object.assign(BOUNDS, { minX: -W + 0.3, maxX: W - 0.3, minZ: -L + 0.3, maxZ: bz - 0.22 });
  G.baked = mergeStatic(g);
  let t0 = 0;
  return { group: g, mirror, dyn, solids, seats, tables, lamps, spots, shelves, hemi, fire,
    // you are kept out of what is solid (a circle against boxes), as input.js keeps you in the room
    keepOut(rig, camera) { const p = camera.getWorldPosition(new THREE.Vector3()), r = 0.22; for (const s of solids) { if (s.step) continue; const cx = Math.max(s.x0, Math.min(p.x, s.x1)), cz = Math.max(s.z0, Math.min(p.z, s.z1)), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
        if (d < r && d > 1e-5) { const k = (r - d) / d; rig.position.x += dx * k; rig.position.z += dz * k; p.x += dx * k; p.z += dz * k; } else if (d <= 1e-5) { const ex = Math.min(p.x - s.x0, s.x1 - p.x), ez = Math.min(p.z - s.z0, s.z1 - p.z); if (ex < ez) { const m = p.x - s.x0 < s.x1 - p.x ? s.x0 - r - p.x : s.x1 + r - p.x; rig.position.x += m; p.x += m; } else { const m = p.z - s.z0 < s.z1 - p.z ? s.z0 - r - p.z : s.z1 + r - p.z; rig.position.z += m; p.z += m; } } } },
    update() { },
    lampOut(o) { o.on = false; o.l.intensity = 0; if (o.up) o.up.intensity = 0; o.s.visible = false; },
  };
}
