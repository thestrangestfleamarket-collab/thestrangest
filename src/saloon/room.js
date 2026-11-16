// the saloon itself, to the owner's floor plan: a square hall open to the roof, the batwing doors in the street wall and the bar facing them under a balcony that runs round two sides on posts, a stair up the side wall to the rooms off it (one a bedroom you can go into), a cellar under the floor with its own stair; stools, tables, the piano, the great wagon-wheel lamp; what is solid, what things rest on, where people sit and stand, and which floor you are on
import * as THREE from 'three';
import { G, BOUNDS, mergeStatic, clamp } from '../sushi/ctx.js';
import { PH } from '../sushi/physics.js';
import { pbr, plain, brass, slab, tube, model, canvasTex, glow } from './kit.js';
import { buildBarWood } from './barwood.js';

// x from -W (the stair wall) to W (the piano wall), z from the street wall at -L to the bar's wall at B; you stand behind the bar at the origin, looking at the doors (-z). UP the balcony's floor, DN the cellar's
export const R = { W: 6, E: 6, L: 10, B: 1.7, H: 6.2, UP: 3.1, DN: -2.6, barX: 3.2, barZ0: -0.9, barZ1: -0.32, barY: 1.06, backZ: 1.05, backY: 0.92, stoolZ: -1.32,
  gal: { z: -2.0, x: 3.4 }, stair: { x0: -6, x1: -4.9, z0: -8.0, z1: -2.0 }, well: { x0: -4.8, x1: -3.8, z0: -6.6, z1: -3.4 }, cellar: { x0: -6, x1: -0.4, z0: -10, z1: -6.6 }, bed: { x0: -10, x1: -6, z0: -2.6, z1: 1.7, door: [-0.65, 0.45] },
  pool: { x: -1.7, z: -7.5 }, darts: { x: -5.93, y: 1.73, z: -9.2 }, piano: { x: 5.5, z: -7.2 }, poker: { x: 1.4, z: -7.4 }, door: { x: 0, z: -10 }, stove: { x: 5.6, z: -4.4 }, board: { x: 5.9, z: -2.9, ry: -Math.PI / 2 }, hatch: { x: -2.5, z: 0.45 } };

export function buildRoom(scene) {
  const g = new THREE.Group(), dyn = new THREE.Group(); scene.add(g, dyn);
  const solids = [], seats = [], lamps = [];
  const solid = (x0, x1, z0, z1, h = 3) => { solids.push({ x0, x1, z0, z1 }); if (PH.ready) PH.box((x0 + x1) / 2, h / 2, (z0 + z1) / 2, (x1 - x0) / 2, h / 2, (z1 - z0) / 2); };
  const top = (x0, x1, z0, z1, y, th = 0.03) => { G.surfaces.push({ minX: x0, maxX: x1, minZ: z0, maxZ: z1, y }); if (PH.ready) PH.box((x0 + x1) / 2, y - th, (z0 + z1) / 2, (x1 - x0) / 2, th, (z1 - z0) / 2); };
  const { W, L, B, H, UP, DN } = R, LX = 2 * W, LZ = L + B, CZ = (B - L) / 2, S = R.stair, WL = R.well, CE = R.cellar, BD = R.bed, GZ = R.gal.z, GX = R.gal.x;
  const floorM = pbr('floor', { tile: 2.2, rough: 1, env: 0.1, color: 0x8f867c }), wallM = pbr('wall', { tile: 2.4, color: 0x8a7c6c }), paperM = pbr('paper', { tile: 1.6, color: 0x857c68 }), darkM = pbr('dark', { tile: 1.8, color: 0x6a6058 }), walnut = pbr('walnut', { tile: 1.2, color: 0x4a3a30, rough: 0.85, env: 0.2 }), plank = pbr('planks', { tile: 1.6, color: 0xa89c8c }), stone = pbr('plaster', { tile: 1.8, color: 0x6a6258, rough: 1 }), earth = pbr('dirt', { tile: 2, color: 0x5a5046 });
  const deck = (x0, x1, z0, z1, y, m = floorM, th = 0.16) => { const s = slab(x1 - x0, th, z1 - z0, m, (x0 + x1) / 2, y - th / 2, (z0 + z1) / 2, g); if (PH.ready && y !== 0) PH.box((x0 + x1) / 2, y - th / 2, (z0 + z1) / 2, (x1 - x0) / 2, th / 2, (z1 - z0) / 2); return s; };

  // ---- the ground floor, laid round the cellar stair's opening
  deck(-W, W, WL.z1, B, 0); deck(-W, W, -L, WL.z0, 0); deck(-W, WL.x0, WL.z0, WL.z1, 0); deck(WL.x1, W, WL.z0, WL.z1, 0);
  // ---- walls two storeys high: wainscot and paper below, paper above, a rail where the balcony meets them
  const wall = (w, x, z, ry, parts, y0 = 0, hh = H) => { const grp = new THREE.Group(); grp.position.set(x, y0, z); grp.rotation.y = ry; g.add(grp);
    for (const [a, b2] of parts || [[-w / 2, w / 2]]) { const c = (a + b2) / 2, ww = b2 - a; slab(ww, 1.05, 0.12, wallM, c, 0.525, 0, grp); slab(ww, hh - 1.1, 0.1, paperM, c, 1.1 + (hh - 1.1) / 2, 0, grp); slab(ww, 0.07, 0.15, walnut, c, 1.08, 0, grp); slab(ww, 0.15, 0.14, walnut, c, 0.075, 0, grp); }
    slab(w, 0.12, 0.14, walnut, 0, hh - 0.06, 0, grp); return grp; };
  wall(LX, 0, B + 0.06, 0); wall(LZ, W + 0.06, CZ, Math.PI / 2);
  { const lz = (z) => -(z - CZ); wall(LZ, -W - 0.06, CZ, Math.PI / 2, [[lz(B), lz(BD.door[1])], [lz(BD.door[0]), lz(-L)]]); slab(0.1, UP, BD.door[1] - BD.door[0], paperM, -W - 0.06, UP / 2, (BD.door[0] + BD.door[1]) / 2, g); slab(0.1, H - UP - 2.1, BD.door[1] - BD.door[0], paperM, -W - 0.06, UP + 2.1 + (H - UP - 2.1) / 2, (BD.door[0] + BD.door[1]) / 2, g); }
  { // the street wall: the batwing doorway, a tall window either side, shuttered windows above
    const fw = wall(LX, 0, -L - 0.06, 0, [[-W, -5.6], [-3.2, -0.95], [0.95, 3.2], [5.6, W]]), pane = new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.25, transparent: true, opacity: 0.22, envMapIntensity: 0.6 });
    for (const s of [-1, 1]) { const x = s * 4.4; slab(2.4, 0.9, 0.12, wallM, x, 0.45, 0, fw); slab(2.4, H - 3.0, 0.1, paperM, x, 3.0 + (H - 3.0) / 2, 0, fw); const gl = slab(2.4, 2.1, 0.012, pane, x, 1.95, 0, fw); gl.castShadow = false; gl.userData.keep = true;
      for (const dx of [-1.2, -0.4, 0.4, 1.2]) slab(0.06, 2.1, 0.08, walnut, x + dx, 1.95, 0, fw); for (const dy of [0.9, 1.95, 3.0]) slab(2.46, 0.06, 0.1, walnut, x, dy, 0, fw); slab(2.6, 0.05, 0.22, walnut, x, 0.88, 0.05, fw);
      slab(1.1, 1.5, 0.05, darkM, x, UP + 1.6, 0.06, fw); for (let k = 0; k < 9; k++) slab(1.0, 0.03, 0.07, walnut, x, UP + 0.95 + k * 0.16, 0.07, fw); }
    slab(1.9, H - 2.5, 0.1, paperM, 0, 2.5 + (H - 2.5) / 2, 0, fw); slab(2.1, 0.12, 0.2, walnut, 0, 2.5, 0, fw); for (const s of [-1, 1]) slab(0.12, 2.5, 0.2, walnut, s * 0.98, 1.25, 0, fw);
    for (const s of [-1, 1]) { const d = slab(0.82, 1.0, 0.035, plank, s * 0.52, 1.05, 0.14, fw); d.rotation.y = -s * 0.4; } }
  solid(W, W + 1, -L, B); solid(-W - 1, -W, -L, B); solid(-W, W, B, B + 1); solid(-W, -0.95, -L - 0.3, -L); solid(0.95, W, -L - 0.3, -L);
  // ---- the roof: boards on heavy beams
  slab(LX, 0.12, LZ, darkM, 0, H + 0.06, CZ, g); for (let x = -W + 1.5; x < W; x += 3) slab(0.24, 0.3, LZ, darkM, x, H - 0.15, CZ, g); slab(LX, 0.3, 0.24, darkM, 0, H - 0.15, -5.4, g);

  // ---- the bar and the back bar (barwood.js)
  const X = R.barX, bz = R.backZ, { shelves, mirror } = buildBarWood(g, top, solid);
  model('mantel_clock_01', -1.5, R.backY, bz + 0.34, Math.PI, { h: 0.3 }, g);
  for (let i = 0; i < 7; i++) { const x = -2.55 + i * 0.85; model('wooden_stool_01', x, 0, R.stoolZ, i * 1.3, { h: 0.76 }, g); seats.push({ x, z: R.stoolZ, ry: 0, y: 0, kind: 'stool', at: 'bar', i, who: null }); solids.push({ x0: x - 0.17, x1: x + 0.17, z0: R.stoolZ - 0.17, z1: R.stoolZ + 0.17, low: true }); }

  // ---- the balcony: a floor on joists round the bar's wall and the piano's wall, posts with braces under its edge, a railing, doors to the rooms
  const post = (x, z, y0 = 0, h = H) => { slab(0.18, h, 0.18, walnut, x, y0 + h / 2, z, g); solids.push({ x0: x - 0.11, x1: x + 0.11, z0: z - 0.11, z1: z + 0.11 }); for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (Math.abs(x + dx) > W - 0.2 || z + dz > B - 0.2 || z + dz < -L + 0.2) continue; const b = slab(0.1, 0.75, 0.1, walnut, x + dx * 0.25, UP - 0.48, z + dz * 0.25, g); b.rotation.z = -dx * 0.75; b.rotation.x = dz * 0.75; } };
  deck(-W, W, GZ, B, UP, floorM, 0.14); deck(GX, W, -L, GZ, UP, floorM, 0.14);
  for (let x = -W + 0.6; x < W; x += 1.2) slab(0.1, 0.2, B - GZ, darkM, x, UP - 0.24, (GZ + B) / 2, g); for (let z = -L + 0.6; z < GZ; z += 1.2) slab(W - GX, 0.2, 0.1, darkM, (GX + W) / 2, UP - 0.24, z, g);
  slab(GX + W - 1.1, 0.26, 0.16, walnut, (GX - W + 1.1) / 2, UP - 0.13, GZ, g); slab(0.16, 0.26, GZ + L, walnut, GX, UP - 0.13, (GZ - L) / 2, g);
  for (const [x, z] of [[-4.9, GZ], [-1.7, GZ], [GX, GZ], [GX, -4.7], [GX, -7.4], [GX, -L + 0.12]]) post(x, z);
  const rail = (x0, z0, x1, z1, y = UP) => { const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; const hr = slab(len, 0.06, 0.09, walnut, cx, y + 0.98, cz, g); hr.rotation.y = ry; const br = slab(len, 0.05, 0.06, walnut, cx, y + 0.12, cz, g); br.rotation.y = ry; for (let k = 0.5; k < len / 0.22; k++) { const t = k * 0.22 / len; slab(0.035, 0.82, 0.035, walnut, x0 + (x1 - x0) * t, y + 0.55, z0 + (z1 - z0) * t, g); } };
  rail(S.x1, GZ, GX, GZ); rail(GX, GZ, GX, -L + 0.1);
  const door = (x, z, ry, y = UP, open = 0) => { const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = ry; g.add(d); slab(1.02, 2.14, 0.07, walnut, 0, 1.07, 0, d); const leaf = new THREE.Group(); leaf.position.set(-0.44, 0, 0.03); leaf.rotation.y = open; d.add(leaf); slab(0.88, 2.04, 0.045, darkM, 0.44, 1.02, 0, leaf); for (const [py, ph] of [[0.55, 0.7], [1.5, 0.8]]) slab(0.6, ph, 0.012, plank, 0.44, py, 0.026, leaf); const k = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), brass()); k.position.set(0.8, 1.0, 0.05); leaf.add(k); };
  door(W - 0.01, -4.6, -Math.PI / 2); door(W - 0.01, -8.2, -Math.PI / 2); door(1.6, B - 0.01, Math.PI); door(-3.4, B - 0.01, Math.PI);
  model('painted_wooden_bench', W - 0.45, UP, -6.4, -Math.PI / 2, { w: 1.6 }, g);
  for (const [x, y, z, ry, w] of [[W - 0.04, UP + 1.7, -2.9, -Math.PI / 2, 0.5], [-1.0, UP + 1.7, B - 0.04, Math.PI, 0.6], [W - 0.04, 2.2, -5.4, -Math.PI / 2, 0.9], [-W + 0.04, UP + 1.6, -5.0, Math.PI / 2, 0.8]]) model('fancy_picture_frame_01', x, y - 0.3, z, ry, { w }, g);
  { // the stag's skull over the corner
    const sk = new THREE.Group(); sk.position.set(W - 0.5, UP + 2.15, B - 0.5); sk.rotation.y = -Math.PI * 0.75; g.add(sk); const bone = plain(0x9a927e, { rough: 1 }); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), bone); hd.scale.set(0.8, 1.5, 0.7); sk.add(hd); slab(0.34, 0.5, 0.04, walnut, 0, 0, -0.08, sk);
    for (const s of [-1, 1]) { let px = s * 0.07, py = 0.14; for (let k = 0; k < 4; k++) { const t = tube(0.016 - k * 0.003, 0.02 - k * 0.003, 0.2, bone, px + s * 0.06, py + 0.08, 0.02, sk, 5); t.rotation.z = -s * (0.6 - k * 0.12); px += s * 0.1; py += 0.15; const tn = tube(0.006, 0.011, 0.13, bone, px, py + 0.02, 0.06, sk, 4); tn.rotation.x = 0.7; tn.rotation.z = -s * 0.2; } } }

  // ---- the stair up the side wall to the balcony
  { const n = 17, run = (S.z1 - S.z0) / n, rise = UP / n, w = S.x1 - S.x0, cx = (S.x0 + S.x1) / 2; for (let i = 0; i < n; i++) { slab(w - 0.06, 0.045, run + 0.03, floorM, cx, rise * (i + 1) - 0.022, S.z0 + run * (i + 0.5), g); slab(w - 0.1, rise, 0.025, darkM, cx, rise * (i + 0.5), S.z0 + run * i + 0.012, g); if (PH.ready && i % 2) PH.box(cx, rise * i / 2, S.z0 + run * (i + 0.5), w / 2, rise * (i + 1) / 2, run); }
    const len = Math.hypot(S.z1 - S.z0, UP), ang = Math.atan2(UP, S.z1 - S.z0); for (const x of [S.x1 - 0.03, S.x0 + 0.04]) { const st = slab(0.06, 0.3, len, walnut, x, UP / 2 - 0.12, (S.z0 + S.z1) / 2, g); st.rotation.x = -ang; }
    const hr = slab(0.07, 0.06, len, walnut, S.x1 - 0.03, UP / 2 + 0.95, (S.z0 + S.z1) / 2, g); hr.rotation.x = -ang; for (let i = 0; i <= n; i += 1) slab(0.035, 0.9, 0.035, walnut, S.x1 - 0.03, rise * i + 0.5, S.z0 + run * i, g);
    slab(0.14, 1.15, 0.14, walnut, S.x1 - 0.03, 0.575, S.z0 - 0.05, g); slab(0.08, UP - 0.4, S.z1 - S.z0 - 2.2, plank, S.x1 - 0.03, (UP - 0.4) / 2 * 0.6, S.z0 + 2.4 + (S.z1 - S.z0 - 2.2) / 2, g).visible = false;
    solids.push({ x0: S.x1 - 0.1, x1: S.x1 + 0.02, z0: S.z0, z1: S.z1, any: true }); }

  // ---- the bedroom off the balcony: a bed, a wardrobe, a washstand, a lamp
  { const y = UP, cx = (BD.x0 + BD.x1) / 2, cz = (BD.z0 + BD.z1) / 2, w = BD.x1 - BD.x0, d = BD.z1 - BD.z0, hh = H - UP; deck(BD.x0, BD.x1 - 0.1, BD.z0, BD.z1, y, floorM, 0.14); slab(w, 0.1, d, darkM, cx, H + 0.05, cz, g);
    const wl = (ww, x, z, ry) => { const gp = new THREE.Group(); gp.position.set(x, y, z); gp.rotation.y = ry; g.add(gp); slab(ww, 0.9, 0.1, wallM, 0, 0.45, 0, gp); slab(ww, hh - 0.9, 0.09, paperM, 0, 0.9 + (hh - 0.9) / 2, 0, gp); slab(ww, 0.06, 0.13, walnut, 0, 0.92, 0, gp); };
    wl(w, cx, BD.z0 - 0.05, 0); wl(w, cx, BD.z1 + 0.05, 0); wl(d, BD.x0 - 0.05, cz, Math.PI / 2);
    door(-W - 0.06, (BD.door[0] + BD.door[1]) / 2, Math.PI / 2, y, -1.9);
    const bx = BD.x0 + 1.15, bzz = BD.z1 - 0.62, quilt = plain(0x5a2a26, { rough: 1 }), linen = plain(0x8a8474, { rough: 1 }); slab(2.0, 0.28, 1.05, walnut, bx, y + 0.3, bzz, g); slab(1.96, 0.16, 1.0, linen, bx, y + 0.5, bzz, g); slab(1.35, 0.06, 1.04, quilt, bx + 0.3, y + 0.6, bzz, g); slab(0.42, 0.1, 0.7, linen, bx - 0.72, y + 0.62, bzz, g); slab(0.07, 1.05, 1.1, walnut, bx - 1.0, y + 0.525, bzz, g); slab(0.07, 0.7, 1.1, walnut, bx + 1.0, y + 0.35, bzz, g); for (const sx of [-0.95, 0.95]) for (const sz of [-0.48, 0.48]) slab(0.08, 0.3, 0.08, walnut, bx + sx, y + 0.15, bzz + sz, g);
    model('vintage_cabinet_01', BD.x0 + 0.5, y, BD.z0 + 0.75, Math.PI / 2, { h: 1.95 }, g); model('painted_wooden_table', BD.x0 + 2.75, y, BD.z1 - 0.45, 0, { h: 0.7 }, g); model('vintage_oil_lamp', BD.x0 + 2.75, y + 0.7, BD.z1 - 0.45, 0, { h: 0.34 }, g); model('jug_01', BD.x1 - 0.6, y, BD.z0 + 0.5, 0, { h: 0.3 }, g);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2).rotateX(-Math.PI / 2), plain(0x3a2420, { rough: 1, env: 0.05 })); rug.position.set(cx + 0.4, y + 0.006, cz - 0.3); rug.receiveShadow = true; g.add(rug); }

  // ---- the cellar: earth floor, stone walls, the stair down, barrels, crates, a rack of bottles
  { const y = DN, cx = (CE.x0 + CE.x1) / 2, cz = (CE.z0 + CE.z1) / 2, w = CE.x1 - CE.x0, d = CE.z1 - CE.z0, hh = -DN - 0.16; deck(CE.x0, CE.x1, CE.z0, WL.z1, y, earth, 0.2);
    const wl = (ww, x, z, ry) => { const m = slab(ww, hh, 0.14, stone, x, y + hh / 2, z, g); m.rotation.y = ry; }; wl(w, cx, CE.z0 - 0.07, 0); wl(d, CE.x0 - 0.07, cz, Math.PI / 2); wl(d, CE.x1 + 0.07, cz, Math.PI / 2); wl(WL.x0 - CE.x0, (CE.x0 + WL.x0) / 2, CE.z1 + 0.07, 0); wl(CE.x1 - WL.x1, (WL.x1 + CE.x1) / 2, CE.z1 + 0.07, 0);
    wl(WL.z1 - WL.z0, WL.x0 - 0.07, (WL.z0 + WL.z1) / 2, Math.PI / 2); wl(WL.z1 - WL.z0, WL.x1 + 0.07, (WL.z0 + WL.z1) / 2, Math.PI / 2); wl(WL.x1 - WL.x0, (WL.x0 + WL.x1) / 2, WL.z1 + 0.07, 0);
    const n = 14, run = (WL.z1 - WL.z0) / n, rise = -DN / n, sx = (WL.x0 + WL.x1) / 2; for (let i = 0; i < n; i++) slab(WL.x1 - WL.x0 - 0.04, 0.05, run + 0.03, plank, sx, -rise * (i + 1) + 0.0, WL.z1 - run * (i + 0.5), g);
    for (const x of [WL.x0 + 0.03, WL.x1 - 0.03]) { const st = slab(0.05, 0.26, Math.hypot(WL.z1 - WL.z0, DN), walnut, x, DN / 2 - 0.1, (WL.z0 + WL.z1) / 2, g); st.rotation.x = -Math.atan2(-DN, WL.z1 - WL.z0); }
    rail(WL.x1 + 0.04, WL.z0, WL.x1 + 0.04, WL.z1, 0); rail(WL.x0, WL.z0 - 0.04, WL.x1, WL.z0 - 0.04, 0); solids.push({ x0: WL.x1, x1: WL.x1 + 0.1, z0: WL.z0, z1: WL.z1, lv: 0 }, { x0: WL.x0 - 0.1, x1: WL.x1 + 0.1, z0: WL.z0 - 0.1, z1: WL.z0, lv: 0 }, { x0: WL.x0 - 0.1, x1: WL.x0, z0: WL.z0, z1: WL.z1, lv: 0 });
    for (const [x, z, r, s] of [[-1.2, -9.3, 0, 1.0], [-2.1, -9.35, 1, 1.0], [-1.25, -8.4, 2, 0.95], [-3.0, -9.4, 3, 0.9]]) model('wine_barrel_01', x, y, z, r, { h: s }, g); model('wooden_barrels_01', -1.3, y, -7.3, 0.4, { w: 1.3 }, g);
    for (const [x, yy, z, r, s] of [[-5.4, 0, -9.3, 0.2, 0.55], [-4.75, 0, -9.4, 0.5, 0.5], [-5.35, 0.55, -9.35, 0.9, 0.45], [-5.5, 0, -8.4, 0.1, 0.5], [-3.9, 0, -9.45, 0.3, 0.45]]) model('wooden_crate_01', x, y + yy, z, r, { h: s }, g);
    model('wooden_display_shelves_01', -5.7, y, -7.4, Math.PI / 2, { h: 1.9 }, g); const bg = new THREE.CylinderGeometry(0.036, 0.036, 0.26, 8), bm = plain(0x1c1408, { rough: 0.35 }); for (let k = 0; k < 18; k++) { const b = new THREE.Mesh(bg, bm); b.position.set(-5.66, y + 0.45 + ((k / 6) | 0) * 0.45, -7.85 + (k % 6) * 0.16); g.add(b); } }

  // ---- three tables and their chairs (the fourth place is the pool table's)
  const tables = [];
  const table = (x, z, name, n = 4) => { model('round_wooden_table_01', x, 0, z, 0, { h: 0.76 }, g); top(x - 0.38, x + 0.38, z - 0.38, z + 0.38, 0.76); if (PH.ready) PH.cyl(x, 0.38, z, 0.36, 0.1); solids.push({ x0: x - 0.42, x1: x + 0.42, z0: z - 0.42, z1: z + 0.42 }); const t = { x, z, name, seats: [] }; tables.push(t);
    for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n + 0.6, cx = x + Math.sin(a) * 0.78, cz = z + Math.cos(a) * 0.78; model('painted_wooden_chair_02', cx, 0, cz, a + Math.PI + (k * 0.37 % 0.5 - 0.25), { h: 0.88 }, g).traverse((o) => { if (o.isMesh) o.material.color.set(0x7a6450); }); const s = { x: cx, z: cz, ry: a + Math.PI, y: -0.33, kind: 'chair', at: name, who: null }; seats.push(s); t.seats.push(s); } return t; };
  table(-1.7, -3.9, 'left'); table(1.5, -4.6, 'middle'); table(R.poker.x, R.poker.z, 'poker'); table(4.6, -4.9, 'stage', 3);
  { const felt = new THREE.Mesh(new THREE.CircleGeometry(0.46, 28).rotateX(-Math.PI / 2), plain(0x1c3a26, { rough: 1, env: 0.05 })); felt.position.set(R.poker.x, 0.765, R.poker.z); felt.receiveShadow = true; g.add(felt); }

  // ---- the piano against the side wall under the balcony, its stool, a rocking chair
  { const P = R.piano, pn = new THREE.Group(); pn.position.set(P.x + 0.2, 0, P.z); pn.rotation.y = -Math.PI / 2; g.add(pn); const eb = plain(0x1c1210, { rough: 0.75, env: 0.2 });
    slab(1.5, 1.25, 0.34, eb, 0, 0.625, 0, pn); slab(1.5, 0.05, 0.6, eb, 0, 0.72, 0.28, pn); slab(1.38, 0.025, 0.16, plain(0xb8b09a, { rough: 0.7 }), 0, 0.755, 0.42, pn);
    for (let i = 0; i < 36; i++) { if ([1, 2, 4, 5, 6].includes(i % 7)) slab(0.016, 0.02, 0.09, plain(0x0c0a0a), -0.675 + i * 0.0385, 0.775, 0.385, pn); }
    for (const s of [-1, 1]) slab(0.06, 0.72, 0.06, eb, s * 0.7, 0.36, 0.52, pn); slab(1.5, 0.04, 0.38, eb, 0, 1.27, 0, pn);
    model('wooden_stool_01', P.x - 0.55, 0, P.z, 0, { h: 0.5 }, g); model('brass_candleholders', P.x + 0.2, 1.29, P.z, 0, { h: 0.3 }, g); solid(P.x - 0.1, W, P.z - 0.8, P.z + 0.8, 1.3); }
  model('rockingchair_01', 5.2, 0, -9.0, -2.3, { h: 1.0 }, g); seats.push({ x: 5.2, z: -9.0, ry: -2.3, y: -0.3, kind: 'chair', at: 'stove', who: null });
  for (const [x, z] of [[-2.9, -1.75], [2.9, -1.75], [R.poker.x + 0.9, R.poker.z + 0.9]]) model('brass_pot_01', x, 0, z, 0, { h: 0.2 }, g);

  // ---- light: nothing shines but the lamps: the great wheel hung from the roof on its pole, lanterns over the bar and under the balcony, one on the landing, one in the bedroom, one in the cellar; the moon through the street windows (town.js)
  const hemi = new THREE.HemisphereLight(0xcfc4b4, 0x1c1814, 0.26); scene.add(hemi);
  const halo = (x, y, z, c, sc = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: c, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(sc * 0.6); s.position.set(x, y, z); s.userData.nopick = true; dyn.add(s); return s; };
  const lamp = (x, y, z, k, d, c = 0xffc898, lv) => { const l = new THREE.PointLight(c, k, d, 2); l.position.set(x, y, z); scene.add(l); const o = { l, s: halo(x, y, z, c), k, on: true, x, y, z, lv }; lamps.push(o); return o; };
  const iron = plain(0x14110e, { metal: 0.7, rough: 0.6 }), chim = new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffb060, emissiveIntensity: 1.1, transparent: true, opacity: 0.85, roughness: 0.2 });
  { const x = 0, z = -5.4, y = 3.75, rr = 1.25, w = new THREE.Group(); w.position.set(x, y, z); g.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.05, 8, 36).rotateX(Math.PI / 2), walnut); rim.castShadow = true; w.add(rim); tube(0.1, 0.1, 0.16, walnut, 0, 0, 0, w, 10); tube(0.045, 0.045, H - y, walnut, 0, (H - y) / 2, 0, w, 8);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4, sp = slab(2 * rr, 0.045, 0.06, walnut, 0, 0, 0, w); sp.rotation.y = -a; }
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2, lx = Math.cos(a) * rr, lz = Math.sin(a) * rr; tube(0.09, 0.07, 0.035, brass(), lx, 0.07, lz, w, 10); const c = tube(0.03, 0.04, 0.14, chim, lx, 0.16, lz, w, 8); c.castShadow = false; c.userData.keep = true; }
    const l = new THREE.SpotLight(0xffc896, 260, 13, 1.3, 0.95, 1.6); l.position.set(x, y + 0.1, z); l.target.position.set(x, 0, z); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0015; l.shadow.radius = 4; l.shadow.camera.near = 0.6; l.shadow.camera.far = 9; scene.add(l, l.target);
    lamps.push({ l, s: halo(x, y + 0.16, z, 0xffb060, 2.2), k: 260, on: true, x, y: y + 0.16, z, wheel: true }); }
  for (const x of [-2.6, 2.6]) { model('vintage_oil_lamp', x, R.backY, bz + 0.25, 0, { h: 0.38 }, g); halo(x, R.backY + 0.3, bz + 0.25, 0xffb060, 0.4); }
  const hang = (x, y, z, k, d, lv) => { model('lantern_01', x, y - 0.15, z, 0, { h: 0.42 }, g); tube(0.006, 0.006, 0.35, iron, x, y + 0.42, z, g, 4); return lamp(x, y, z, k, d, 0xffc898, lv); };
  hang(-1.7, 2.4, 0.25, 13, 7); hang(1.7, 2.4, 0.25, 13, 7);
  const fire = hang(4.7, 2.35, -6.2, 8, 6);
  hang(2.2, UP + 2.3, -0.4, 9, 7); hang(BD.x0 + 2.0, UP + 2.2, -0.6, 7, 5.5, 1); hang(-3.0, DN + 2.0, -8.2, 8, 6.5, -1);

  // ---- where people stand
  const spots = { door: { x: 0, z: -L + 0.7 }, street: { x: 0, z: -L - 2.5 }, bar: [-2.98, -2.13, -1.28, -0.43, 0.42, 1.27, 2.12, 2.9].map((x) => ({ x, z: -1.4 })), stove: { x: 4.6, z: -8.6 }, piano: { x: R.piano.x - 0.55, z: R.piano.z }, stage: { x: 4.2, z: -6.0 }, pool: { x: R.pool.x + 1.5, z: R.pool.z }, darts: { x: R.darts.x + 2.4, z: R.darts.z }, board: { x: R.board.x - 1.0, z: R.board.z }, flap: { x: X + 0.7, z: -0.6 } };

  Object.assign(BOUNDS, { minX: -1e4, maxX: 1e4, minZ: -1e4, maxZ: 1e4 });
  G.baked = mergeStatic(g);
  // which floor you are on, and where you may stand on it: the ground (0), the balcony and bedroom (1), the cellar (-1); the two stairs carry you between
  const _p = new THREE.Vector3(), m = 0.24, state = { lv: 0, y: 0 };
  const into = (p, x0, x1, z0, z1) => { p.x = clamp(p.x, x0 + m, x1 - m); p.z = clamp(p.z, z0 + m, z1 - m); };
  function walk(rig, camera, dt = 1 / 60) {
    const p = camera.getWorldPosition(_p), ox = p.x, oz = p.z; if (p.z < -L + 0.05 && state.lv === 0 && Math.abs(p.x) < 1) { state.out = true; return state; } state.out = false;
    const onS = p.x < S.x1 && p.x > S.x0 - 0.5 && p.z > S.z0 && p.z < S.z1 && (state.lv !== 0 || p.z < S.z0 + 0.5 || state.y > 0.15), onW = p.x > WL.x0 && p.x < WL.x1 && p.z > WL.z0 && p.z < WL.z1 && (state.lv !== 0 || p.z > WL.z1 - 0.5 || state.y < -0.1);
    let ty = 0;
    if (onS) { ty = UP * clamp((p.z - S.z0) / (S.z1 - S.z0), 0, 1); p.x = clamp(p.x, S.x0 + m, S.x1 - m); state.lv = ty > UP - 0.05 ? 1 : ty < 0.05 ? 0 : 0.5; }
    else if (onW) { ty = DN * clamp((WL.z1 - p.z) / (WL.z1 - WL.z0), 0, 1); p.x = clamp(p.x, WL.x0 + m, WL.x1 - m); state.lv = ty < DN + 0.05 ? -1 : ty > -0.05 ? 0 : -0.5; }
    else if (state.lv >= 0.5) { state.lv = 1; ty = UP; const inBed = p.x < -W - 0.05, atDoor = p.z > BD.door[0] + 0.1 && p.z < BD.door[1] - 0.1;
      if (inBed || (p.x < -W + m && atDoor)) { if (p.x > -W - 0.3 && atDoor) p.z = clamp(p.z, BD.door[0] + 0.2, BD.door[1] - 0.2); else into(p, BD.x0, BD.x1 - 0.06, BD.z0, BD.z1); }
      else { p.x = clamp(p.x, -W + m, W - m); p.z = clamp(p.z, -L + m, B - m); if (p.z < GZ + m && p.x < GX + m && p.x > S.x1 - 0.05) { if (GZ + m - p.z < GX + m - p.x) p.z = GZ + m; else p.x = GX + m; } } }
    else if (state.lv <= -0.5) { state.lv = -1; ty = DN; if (p.x > WL.x0 && p.x < WL.x1 && p.z > CE.z1 - m) p.x = clamp(p.x, WL.x0 + m, WL.x1 - m); else into(p, CE.x0, CE.x1, CE.z0, CE.z1); }
    else { state.lv = 0; p.x = clamp(p.x, -W + m, W - m); p.z = clamp(p.z, Math.abs(p.x) < 0.7 ? -L - 1 : -L + m, bz - 0.22); }
    const r = 0.22; for (const s of solids) { if (s.step || (s.lv !== undefined ? s.lv !== state.lv : !s.any && state.lv !== 0)) continue; const cx = clamp(p.x, s.x0, s.x1), cz = clamp(p.z, s.z0, s.z1), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d < r && d > 1e-5) { const k = (r - d) / d; p.x += dx * k; p.z += dz * k; } else if (d <= 1e-5) { const ex = Math.min(p.x - s.x0, s.x1 - p.x), ez = Math.min(p.z - s.z0, s.z1 - p.z); if (ex < ez) p.x = p.x - s.x0 < s.x1 - p.x ? s.x0 - r : s.x1 + r; else p.z = p.z - s.z0 < s.z1 - p.z ? s.z0 - r : s.z1 + r; } }
    rig.position.x += p.x - ox; rig.position.z += p.z - oz; state.y += (ty - state.y) * Math.min(1, dt * 12); rig.position.y = Math.abs(state.y) < 1e-3 ? 0 : state.y;
    for (const o of lamps) if (o.lv !== undefined && o.on) { const near = Math.round(state.lv) === o.lv || (o.lv === 1 && state.lv > 0) || (o.lv === -1 && state.lv < 0); o.l.intensity = near ? o.k : 0; o.s.visible = near; }
    return state; }
  return { group: g, mirror, dyn, solids, seats, tables, lamps, spots, shelves, hemi, fire, state, walk,
    keepOut(rig, camera) { walk(rig, camera); },
    update() { },
    lampOut(o) { o.on = false; o.l.intensity = 0; if (o.up) o.up.intensity = 0; o.s.visible = false; },
  };
}
