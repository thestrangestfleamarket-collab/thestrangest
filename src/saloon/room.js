// the saloon itself: one tall plank room at night, the long bar and its back bar and mirror, stools, tables and chairs, the stove, the piano's stage, lamps, the batwing doors and the street beyond them; what is solid, what things rest on, where people sit and stand
import * as THREE from 'three';
import { G, BOUNDS, mergeStatic } from '../sushi/ctx.js';
import { PH } from '../sushi/physics.js';
import { pbr, plain, brass, slab, tube, model, canvasTex, glow } from './kit.js';
import { buildBarWood } from './barwood.js';

// the room, as real saloons of the 1880s were (the Long Branch at Dodge City, photographed about 1880): long and narrow, the street door at one narrow end (x = E), the bar down one long wall; you stand behind the bar at the origin, looking across the room (-z)
export const R = { W: 7, E: 11, L: 5.8, B: 1.7, H: 4.1, barX: 3.2, barZ0: -0.9, barZ1: -0.32, barY: 1.06, backZ: 1.05, backY: 0.92, stoolZ: -1.32,
  pool: { x: -5.2, z: -2.3 }, darts: { x: -6.93, y: 1.73, z: 0.45 }, piano: { x: -5.5, z: -5.25 }, poker: { x: 0.5, z: -4.4 }, door: { x: 11, z: -2.05 }, stove: { x: 2.9, z: -4.95 }, board: { x: 5.5, z: 1.62, ry: Math.PI }, hatch: { x: -2.5, z: 0.45 } };

export function buildRoom(scene) {
  const g = new THREE.Group(), dyn = new THREE.Group(); scene.add(g, dyn);
  const solids = [], seats = [], lamps = [];
  const solid = (x0, x1, z0, z1, h = 3) => { solids.push({ x0, x1, z0, z1 }); if (PH.ready) PH.box((x0 + x1) / 2, h / 2, (z0 + z1) / 2, (x1 - x0) / 2, h / 2, (z1 - z0) / 2); };
  const top = (x0, x1, z0, z1, y, th = 0.03) => { G.surfaces.push({ minX: x0, maxX: x1, minZ: z0, maxZ: z1, y }); if (PH.ready) PH.box((x0 + x1) / 2, y - th, (z0 + z1) / 2, (x1 - x0) / 2, th, (z1 - z0) / 2); };
  const { W, E, L, B, H } = R, LX = W + E, LZ = L + B, CX = (E - W) / 2, CZ = (B - L) / 2;
  const floorM = pbr('floor', { tile: 2.2, rough: 1, env: 0.1, color: 0x8f867c }), wallM = pbr('wall', { tile: 2.4, color: 0x8a7c6c }), paperM = pbr('paper', { tile: 1.6, color: 0x857c68 }), darkM = pbr('dark', { tile: 1.8, color: 0x6a6058 }), walnut = pbr('walnut', { tile: 1.2, color: 0x4a3a30, rough: 0.85, env: 0.2 }), plank = pbr('planks', { tile: 1.6, color: 0xa89c8c }), tin = pbr('plate', { tile: 0.61, color: 0x5e584c, rough: 0.9, env: 0.15 });

  // ---- the shell: plank floor, wainscot under faded paper, a pressed-tin ceiling on beams
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(LX, LZ).rotateX(-Math.PI / 2), floorM); fl.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? LZ : LX) / 2.2; }); fl.position.set(CX, 0, CZ); fl.receiveShadow = true; g.add(fl);
  slab(LX, 0.12, LZ, tin, CX, H + 0.06, CZ, g);
  for (let x = -W + 1.5; x < E; x += 3) slab(0.2, 0.22, LZ, darkM, x, H - 0.11, CZ, g);
  const wall = (w, x, z, ry, parts) => { const grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry; g.add(grp);
    for (const [a, b2] of parts || [[-w / 2, w / 2]]) { const c = (a + b2) / 2, ww = b2 - a; slab(ww, 1.05, 0.12, wallM, c, 0.525, 0, grp); slab(ww, H - 1.1, 0.1, paperM, c, 1.1 + (H - 1.1) / 2, 0, grp); slab(ww, 0.07, 0.15, walnut, c, 1.08, 0, grp); slab(ww, 0.15, 0.14, walnut, c, 0.075, 0, grp); }
    slab(w, 0.12, 0.14, walnut, 0, H - 0.06, 0, grp); return grp; };
  wall(LX, CX, B + 0.06, 0); wall(LX, CX, -L - 0.06, 0); wall(LZ, -W - 0.06, CZ, Math.PI / 2);
  { // the street wall: the doorway, a tall window either side of it (local x runs along z)
    const dz = R.door.z, wz = [-4.3, 0.2], loc = (z) => -(z - CZ), fw = wall(LZ, E + 0.06, CZ, Math.PI / 2, [[loc(B), loc(wz[1] + 1.15)], [loc(wz[1] - 1.15), loc(dz + 0.95)], [loc(dz - 0.95), loc(wz[0] + 1.15)], [loc(wz[0] - 1.15), loc(-L)]]), pane = new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.25, metalness: 0, transparent: true, opacity: 0.22, envMapIntensity: 0.6 });
    for (const z of wz) { const x = loc(z); slab(2.3, 0.9, 0.12, wallM, x, 0.45, 0, fw); slab(2.3, H - 3.0, 0.1, paperM, x, 3.0 + (H - 3.0) / 2, 0, fw); const gl = slab(2.3, 2.1, 0.012, pane, x, 1.95, 0, fw); gl.castShadow = false; gl.userData.keep = true;
      for (const dx of [-1.15, -0.38, 0.38, 1.15]) slab(0.06, 2.1, 0.08, walnut, x + dx, 1.95, 0, fw); for (const dy of [0.9, 1.95, 3.0]) slab(2.36, 0.06, 0.1, walnut, x, dy, 0, fw); slab(2.5, 0.05, 0.22, walnut, x, 0.88, 0.05, fw); }
    slab(1.9, H - 2.5, 0.1, paperM, loc(dz), 2.5 + (H - 2.5) / 2, 0, fw); slab(2.1, 0.12, 0.2, walnut, loc(dz), 2.5, 0, fw); for (const s2 of [-1, 1]) slab(0.12, 2.5, 0.2, walnut, loc(dz) + s2 * 0.98, 1.25, 0, fw);
    // the batwing doors, hung open a little
    for (const s2 of [-1, 1]) { const d = slab(0.82, 1.0, 0.035, plank, 0, 0, 0, fw); d.position.set(loc(dz) + s2 * 0.52, 1.05, -0.12 * (s2 > 0 ? 1 : 2)); d.rotation.y = s2 * 0.35; } }
  solid(-W - 1, -W, -L, B); solid(-W, E, B, B + 1); solid(-W, E, -L - 1, -L); solid(E, E + 0.3, -L - 1, R.door.z - 0.95); solid(E, E + 0.3, R.door.z + 0.95, B + 1);

  // ---- the bar and the back bar (barwood.js)
  const X = R.barX, bz = R.backZ, { shelves, mirror } = buildBarWood(g, top, solid);
  model('mantel_clock_01', -1.5, R.backY, bz + 0.34, Math.PI, { h: 0.3 }, g);

  // ---- stools along the bar
  for (let i = 0; i < 7; i++) { const x = -2.55 + i * 0.85; model('wooden_stool_01', x, 0, R.stoolZ, i * 1.3, { h: 0.76 }, g); seats.push({ x, z: R.stoolZ, ry: 0, y: 0, kind: 'stool', at: 'bar', i, who: null }); solids.push({ x0: x - 0.17, x1: x + 0.17, z0: R.stoolZ - 0.17, z1: R.stoolZ + 0.17, low: true }); }

  // ---- tables and chairs down the long wall opposite the bar
  const tables = [];
  const table = (x, z, name, n = 4) => { model('round_wooden_table_01', x, 0, z, 0, { h: 0.76 }, g); top(x - 0.38, x + 0.38, z - 0.38, z + 0.38, 0.76); if (PH.ready) PH.cyl(x, 0.38, z, 0.36, 0.1); solids.push({ x0: x - 0.42, x1: x + 0.42, z0: z - 0.42, z1: z + 0.42 }); const t = { x, z, name, seats: [] }; tables.push(t);
    for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n + 0.6, cx = x + Math.sin(a) * 0.78, cz = z + Math.cos(a) * 0.78; model('painted_wooden_chair_02', cx, 0, cz, a + Math.PI + (k * 0.37 % 0.5 - 0.25), { h: 0.88 }, g).traverse((o) => { if (o.isMesh) o.material.color.set(0x7a6450); }); const s = { x: cx, z: cz, ry: a + Math.PI, y: -0.33, kind: 'chair', at: name, who: null }; seats.push(s); t.seats.push(s); } return t; };
  table(4.9, -4.3, 'left'); table(7.7, -4.35, 'middle'); table(R.poker.x, R.poker.z, 'poker'); table(-2.5, -4.5, 'stage', 3); table(8.3, 0.35, 'window', 3);
  { const felt = new THREE.Mesh(new THREE.CircleGeometry(0.46, 28).rotateX(-Math.PI / 2), plain(0x1c3a26, { rough: 1, env: 0.05 })); felt.position.set(R.poker.x, 0.765, R.poker.z); felt.receiveShadow = true; g.add(felt); }

  // ---- the stove in the middle of the long wall, its pipe, the old woman's rocking chair beside it
  model('barrel_stove', R.stove.x, 0, R.stove.z, 0.6, { h: 0.95 }, g); tube(0.07, 0.07, H - 0.9, plain(0x16140f, { rough: 0.85, metal: 0.4 }), R.stove.x, 0.9 + (H - 0.9) / 2, R.stove.z, g, 10); solid(R.stove.x - 0.35, R.stove.x + 0.35, R.stove.z - 0.35, R.stove.z + 0.35, 1);
  model('rockingchair_01', 3.75, 0, -5.05, -0.5, { h: 1.0 }, g); seats.push({ x: 3.75, z: -5.05, ry: -0.5, y: -0.3, kind: 'chair', at: 'stove', who: null });
  model('wooden_bucket_01', 2.2, 0, -5.3, 0.4, { h: 0.3 }, g);

  // ---- at the back: a low stage against the long wall with the upright piano on it
  { const P = R.piano; slab(3.2, 0.2, 1.15, plank, P.x, 0.1, P.z, g); top(P.x - 1.6, P.x + 1.6, P.z - 0.55, P.z + 0.575, 0.2, 0.1); solids.push({ x0: P.x - 1.6, x1: P.x + 1.6, z0: P.z - 0.55, z1: P.z + 0.575, step: 0.2 });
    const pn = new THREE.Group(); pn.position.set(P.x - 0.5, 0.2, P.z - 0.3); g.add(pn); const eb = plain(0x1c1210, { rough: 0.75, env: 0.2 });
    slab(1.5, 1.25, 0.34, eb, 0, 0.625, 0, pn); slab(1.5, 0.05, 0.6, eb, 0, 0.72, 0.28, pn); slab(1.38, 0.025, 0.16, plain(0xb8b09a, { rough: 0.7 }), 0, 0.755, 0.42, pn);
    for (let i = 0; i < 36; i++) { if ([1, 2, 4, 5, 6].includes(i % 7)) slab(0.016, 0.02, 0.09, plain(0x0c0a0a), -0.675 + i * 0.0385, 0.775, 0.385, pn); }
    for (const s2 of [-1, 1]) slab(0.06, 0.72, 0.06, eb, s2 * 0.7, 0.36, 0.52, pn); slab(1.5, 0.04, 0.38, eb, 0, 1.27, 0, pn);
    model('wooden_stool_01', P.x - 0.5, 0.2, P.z + 0.35, 0, { h: 0.5 }, g); model('brass_candleholders', P.x - 0.5, 1.51, P.z - 0.3, 0, { h: 0.3 }, g);
    solid(P.x - 1.3, P.x + 0.3, P.z - 0.55, P.z - 0.1, 1.4); }

  // ---- barrels, crates, the clock, benches under the street windows, spittoons, pictures
  for (const [x, z, r] of [[-6.4, 1.2, 0], [-5.7, 1.25, 1], [-6.45, 0.5 - 1.6, 2]]) { if (z < 0) continue; model('wine_barrel_01', x, 0, z, r, { h: 0.95 }, g); solids.push({ x0: x - 0.35, x1: x + 0.35, z0: z - 0.35, z1: z + 0.35 }); }
  model('wooden_crate_01', 10.3, 0, 1.2, 0.3, { h: 0.5 }, g); model('wooden_crate_01', 10.25, 0.5, 1.25, 1.1, { h: 0.45 }, g);
  model('vintage_grandfather_clock_01', 4.0, 0, 1.45, Math.PI, { h: 2.15 }, g);
  model('painted_wooden_bench', 10.55, 0, -4.3, -Math.PI / 2, { w: 1.5 }, g);
  for (const [x, z] of [[-2.9, -1.75], [2.9, -1.75], [R.poker.x + 0.9, R.poker.z + 0.9], [6.3, -3.4]]) model('brass_pot_01', x, 0, z, 0, { h: 0.2 }, g);
  for (const [x, y, z, ry, w] of [[6.2, 2.2, -5.76, 0, 1.0], [-0.8, 2.3, -5.76, 0, 1.1], [8.4, 2.25, 1.66, Math.PI, 0.8]]) model('fancy_picture_frame_01', x, y - 0.4, z, ry, { w }, g);

  // ---- light: nothing shines but the lamps: three wagon-wheel chandeliers that throw real shadows, two oil lamps on the back bar, the stove's mouth, the moon through the street windows (look.js)
  const hemi = new THREE.HemisphereLight(0xcfc4b4, 0x1c1814, 0.26); scene.add(hemi);
  const halo = (x, y, z, c, sc = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: c, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(sc * 0.6); s.position.set(x, y, z); s.userData.nopick = true; dyn.add(s); return s; };
  const lamp = (x, y, z, k, d, c = 0xffa850) => { const l = new THREE.PointLight(c, k, d, 2); l.position.set(x, y, z); scene.add(l); const o = { l, s: halo(x, y, z, c), k, on: true, x, y, z }; lamps.push(o); return o; };
  const iron = plain(0x14110e, { metal: 0.7, rough: 0.6 }), chim = new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffb060, emissiveIntensity: 1.1, transparent: true, opacity: 0.85, roughness: 0.2 });
  for (const [x, z] of [[5.6, -2.7], [0.4, -3.3], [-5.2, -2.3]]) { const y = H - 1.35, w = new THREE.Group(); w.position.set(x, y, z); g.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 28).rotateX(Math.PI / 2), walnut); rim.castShadow = true; w.add(rim); tube(0.07, 0.07, 0.12, walnut, 0, 0, 0, w, 10);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, sp = slab(0.6, 0.03, 0.035, walnut, Math.cos(a) * 0.31, 0, Math.sin(a) * 0.31, w); sp.rotation.y = -a; const lx = Math.cos(a + 0.5) * 0.62, lz = Math.sin(a + 0.5) * 0.62; tube(0.03, 0.04, 0.05, brass(), lx, 0.06, lz, w, 8); const c = tube(0.022, 0.03, 0.11, chim, lx, 0.14, lz, w, 8); c.castShadow = false; c.userData.keep = true; }
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, ch = tube(0.006, 0.006, 1.42, iron, Math.cos(a) * 0.3, 0.66, Math.sin(a) * 0.3, w, 4); ch.rotation.z = -Math.cos(a) * 0.44; ch.rotation.x = Math.sin(a) * 0.44; ch.castShadow = false; }
    const l = new THREE.SpotLight(0xffc896, 130, 11, 1.3, 0.95, 1.6); l.position.set(x, y + 0.1, z); l.target.position.set(x, 0, z); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0015; l.shadow.radius = 4; l.shadow.camera.near = 0.6; l.shadow.camera.far = 8; scene.add(l, l.target);
    lamps.push({ l, s: halo(x, y + 0.14, z, 0xffb060, 1.2), k: 130, on: true, x, y: y + 0.14, z, wheel: true }); }
  for (const x of [-2.6, 2.6]) { model('vintage_oil_lamp', x, R.backY, bz + 0.25, 0, { h: 0.38 }, g); halo(x, R.backY + 0.3, bz + 0.25, 0xffb060, 0.4); }
  for (const x of [-1.7, 1.7]) { model('lantern_01', x, 2.25, 0.25, 0, { h: 0.42 }, g); tube(0.006, 0.006, H - 2.67, iron, x, 2.67 + (H - 2.67) / 2, 0.25, g, 4); lamp(x, 2.4, 0.25, 13, 7, 0xffc898); }
  const fire = lamp(R.stove.x + 0.25, 0.45, R.stove.z + 0.2, 4, 3.5, 0xff5a18);

  // ---- where people stand: at the door, at the bar between stools, by the stove, the piano, the pool table, the dartboard, the notice board
  const spots = { door: { x: E - 0.7, z: R.door.z }, street: { x: E + 2.5, z: R.door.z }, bar: [-2.98, -2.13, -1.28, -0.43, 0.42, 1.27, 2.12, 2.9].map((x) => ({ x, z: -1.4 })), stove: { x: R.stove.x - 0.1, z: R.stove.z + 0.85 }, piano: { x: R.piano.x - 0.5, z: R.piano.z + 0.75 }, stage: { x: R.piano.x + 1.0, z: R.piano.z + 0.2 }, pool: { x: R.pool.x + 1.5, z: R.pool.z }, darts: { x: R.darts.x + 2.4, z: R.darts.z }, board: { x: R.board.x, z: R.board.z - 1.0 }, flap: { x: X + 0.7, z: -0.6 } };

  Object.assign(BOUNDS, { minX: -W + 0.3, maxX: E - 0.3, minZ: -L + 0.3, maxZ: bz - 0.22 });
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
