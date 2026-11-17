// THE GARAGE's garage: a one-car garage turned man cave with the kit in it, a sectional door that runs up its tracks, real windows onto a real yard, its light turning with the hour
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildSky } from '../sushi/sky.js';
import * as EPH from '../sushi/ephem.js';
import { AIR } from '../sushi/air.js';
import { pbr, plain, slabGeo, model, canvasTex } from './assets.js';

// the room: x left to right, z from the garage door (-) to the back wall (+), the drummer at the origin facing the door
export const ROOM = { x0: -2.6, x1: 2.6, z0: -3.75, z1: 3, h: 2.7, wall: 0.2 };
export const DOOR = { w: 3.4, h: 2.25, n: 5 };
const WIN = [{ z: -2.3, w: 1, y0: 1.12, y1: 1.9 }, { z: -0.4, w: 1, y0: 1.12, y1: 1.9 }];
// where a poster hangs: centre, the way it faces (ry), width and height
export const POSTERS = [{ at: [ROOM.x0 + 0.006, 1.68, -1.35], ry: Math.PI / 2, w: 0.5, h: 0.72 }, { at: [ROOM.x1 - 0.006, 1.72, -2.5], ry: -Math.PI / 2, w: 0.62, h: 0.86 },
  { at: [ROOM.x1 - 0.006, 1.72, -1.55], ry: -Math.PI / 2, w: 0.62, h: 0.86 }, { at: [-1.75, 1.75, ROOM.z1 - 0.006], ry: Math.PI, w: 0.56, h: 0.8 }];

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function buildGarage(scene, low) {
  const G0 = {}, G = G0;
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
    wood: pbr('ply', { tile: 0.8, color: 0x7d5a3c, env: 0.3 }),
    rug: pbr('carpet', { tile: 1.1, color: 0x8f3a34, env: 0.1 }),
    rug2: pbr('carpet', { tile: 1.1, color: 0x4d5a6b, env: 0.1 }),
    door: pbr('door', { tile: 1.3, color: 0xe6e2d6, env: 0.4 }),
    drive: pbr('drive', { tile: 2.4, env: 0.2 }),
    paint: pbr('paint', { tile: 0.8, env: 0.5, metal: 0.4 }),
    fence: pbr('fence', { tile: 1.2, env: 0.2 }),
    brick: pbr('brick', { tile: 1.8, env: 0.2 }),
    grass: pbr('grass', { tile: 2.5, env: 0.1 }),
    trim: plain(0xe9e6dc, { rough: 0.6 }),
    steel: plain(0x8d9299, { rough: 0.35, metal: 1, env: 1 }),
    dark: plain(0x151517, { rough: 0.8 }),
    white: plain(0xe4e4df, { rough: 0.35 }),
    roof: plain(0x3b3d42, { rough: 0.9 }),
    foam: plain(0x1c1d20, { rough: 1, env: 0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xbfd4dc, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2, envMapIntensity: 3, depthWrite: false }),
  };

  // ---- the shell ----
  box(M.floor, x1 - x0, 0.1, z1 - z0, 0, -0.05, (z0 + z1) / 2);
  box(M.ply, x1 - x0 + 2 * W, 0.04, z1 - z0 + 2 * W, 0, H + 0.02 + 0.14, (z0 + z1) / 2);
  box(M.roof, x1 - x0 + 2 * W + 0.5, 0.06, z1 - z0 + 2 * W + 0.5, 0, H + 0.24, (z0 + z1) / 2);
  for (let z = z0 + 0.3; z < z1; z += 0.61) box(M.joist, x1 - x0, 0.14, 0.045, 0, H + 0.07, z);
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
  const side = (x1 - x0 - DOOR.w) / 2;
  for (const s of [-1, 1]) box(M.block, side, H + 0.2, W, s * (DOOR.w / 2 + side / 2), (H + 0.2) / 2, z0 - W / 2);
  box(M.block, DOOR.w, H + 0.2 - DOOR.h, W, 0, (DOOR.h + H + 0.2) / 2, z0 - W / 2);
  for (const s of [-1, 1]) box(M.trim, 0.06, DOOR.h, W + 0.02, s * (DOOR.w / 2 - 0.03), DOOR.h / 2, z0 - W / 2);

  // ---- the sectional door: five panels on rollers, the fourth with four panes; each is moved along the track as the door runs ----
  const PH = DOOR.h / DOOR.n, dz = z0 + 0.04, TOP = DOOR.h + 0.16, pw = DOOR.w - 0.12;
  const halo = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.4, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const haloM = new THREE.SpriteMaterial({ map: halo, color: 0xdfe9f2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.12 });
  const panels = [];
  for (let i = 0; i < DOOR.n; i++) {
    const geos = [], g = new THREE.Group(), add = (w, h, x, y) => geos.push(slabGeo(w, h, 0.045, 1.3, x, y, 0));
    if (i === 3) {
      const n = 4, gw = 0.52, gh = PH - 0.14, gap = (pw - n * gw) / (n + 1);
      add(pw, 0.07, 0, -PH / 2 + 0.035); add(pw, 0.07, 0, PH / 2 - 0.035);
      for (let k = 0; k <= n; k++) add(gap, gh, -pw / 2 + gap / 2 + k * (gw + gap), 0);
      for (let k = 0; k < n; k++) {
        const x = -pw / 2 + gap + gw / 2 + k * (gw + gap), pane = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), M.glass);
        pane.position.set(x, 0, 0); pane.renderOrder = 5;
        const h = new THREE.Sprite(haloM); h.position.set(x, 0, 0.06); h.scale.set(gw * 2.1, gh * 2.4, 1); h.renderOrder = 7;
        g.add(pane, h);
      }
    } else add(pw, PH - 0.012, 0, 0);
    const m = new THREE.Mesh(mergeGeometries(geos), M.door);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    group.add(g);
    panels.push(g);
  }
  const door = { open: 0.18, want: 0.18, moving: false };
  const setDoor = () => {
    panels.forEach((g, i) => {
      const s = i * PH + PH / 2 + door.open * (DOOR.h + 0.05), t = Math.min(1, Math.max(0, (s - (TOP - PH / 2)) / PH));
      g.position.set(0, Math.min(s, TOP), dz + Math.max(0, s - TOP));
      g.rotation.x = -t * Math.PI / 2;
    });
  };
  setDoor();
  for (const s of [-1, 1]) {
    box(M.steel, 0.05, DOOR.h + 0.1, 0.03, s * (DOOR.w / 2 - 0.02), (DOOR.h + 0.1) / 2, z0 + 0.1);
    box(M.steel, 0.05, 0.03, 2.7, s * (DOOR.w / 2 - 0.02), TOP + 0.05, z0 + 1.45);
    box(M.steel, 0.02, H - TOP, 0.02, s * (DOOR.w / 2 - 0.02), (TOP + H) / 2 + 0.03, z0 + 2.75);
  }
  box(M.steel, 0.04, 0.05, 3.2, 0, H - 0.08, z0 + 1.7);
  box(M.dark, 0.3, 0.16, 0.42, 0, H - 0.13, z0 + 3.4);

  // ---- the two windows: jambs through the wall's depth, a cross of glazing bars, a sill, the glass ----
  const panes = [];
  for (const o of WIN) {
    const x = x0 - W / 2, hh = o.y1 - o.y0, cy = (o.y0 + o.y1) / 2;
    for (const s of [-1, 1]) box(M.trim, W + 0.03, hh, 0.035, x, cy, o.z + s * (o.w / 2 - 0.0175));
    box(M.trim, W + 0.03, 0.035, o.w, x, o.y1 - 0.0175, o.z);
    box(M.trim, W + 0.1, 0.035, o.w + 0.08, x + 0.035, o.y0 + 0.0175, o.z);
    box(M.trim, 0.03, hh, 0.025, x - 0.03, cy, o.z);
    box(M.trim, 0.03, 0.025, o.w, x - 0.03, cy, o.z);
    for (const s of [-1, 1]) box(M.trim, 0.025, hh + 0.14, 0.07, x0 + 0.0125, cy, o.z + s * (o.w / 2 + 0.035));
    box(M.trim, 0.025, 0.07, o.w + 0.14, x0 + 0.0125, o.y1 + 0.035, o.z);
    panes.push({ x: x - 0.03, y: cy, z: o.z, w: o.w, h: hh });
  }
  for (const p of panes) {
    const h = new THREE.Sprite(haloM);
    h.position.set(p.x + 0.06, p.y, p.z); h.scale.set(p.w * 2.1, p.h * 2.4, 1); h.renderOrder = 7;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), M.glass);
    g.position.set(p.x, p.y, p.z); g.rotation.y = Math.PI / 2; g.renderOrder = 5;
    group.add(h, g);
  }

  // ---- the kit's corner: its rug, foam on the wall, an amp, the cables ----
  box(M.rug, 2.7, 0.014, 2.1, 0.12, 0.007, -0.42);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const cx = x0 + 0.035, cz = 0.75 + i * 0.5, cy = 1.55 + j * 0.5;
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) raw(M.foam, new THREE.ConeGeometry(0.066, 0.06, 4, 1).rotateY(Math.PI / 4).rotateZ(-Math.PI / 2).translate(cx, cy - 0.2 + a * 0.1, cz - 0.2 + b * 0.1).toNonIndexed());
  }
  const amp = new THREE.Group();
  amp.position.set(-1.9, 0, -3.2);
  amp.rotation.y = 0.5;
  const grille = canvasTex(64, 64, (c) => { c.fillStyle = '#1a1712'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#3a3226'; for (let y = 0; y < 64; y += 4) for (let x = (y / 4) % 2 * 2; x < 64; x += 4) c.fillRect(x, y, 2, 2); });
  grille.wrapS = grille.wrapT = THREE.RepeatWrapping; grille.repeat.set(4, 3); grille.magFilter = THREE.NearestFilter;
  amp.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.27).translate(0, 0.3, 0), M.dark), new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.36).translate(0, 0.26, 0.136), new THREE.MeshStandardMaterial({ map: grille, roughness: 1 })), new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.02).translate(0, 0.51, 0.13), M.steel));
  for (let i = 0; i < 6; i++) amp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 8).rotateX(Math.PI / 2).translate(-0.2 + i * 0.07, 0.51, 0.15), M.dark));
  amp.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  group.add(amp);
  const cable = (pts, r = 0.006) => raw(M.dark, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 5).toNonIndexed());
  cable([[-1.8, 0.3, -3.05], [-1.6, 0.02, -2.8], [-2.1, 0.012, -2], [-2.45, 0.012, -1.1], [-2.55, 0.012, 0.3], [-2.58, 0.3, 0.55]]);
  cable([[x1 - 0.2, 0.3, 1.0], [x1 - 0.6, 0.012, 0.7], [1.2, 0.012, 0.4], [0.9, 0.012, 1.2]], 0.004);

  // ---- the right wall: garage things by the door, then the cave: a fridge, darts, the television and everything to play on it ----
  model('steel_frame_shelves_02', x1 - 0.28, 0, -2.95, -Math.PI / 2, { h: 2.1 }, group);
  const shelf = (n, y, z, ry, o) => model(n, x1 - 0.3, y, z, ry, { shadow: false, ...o }, group);
  const L = [0.12, 0.62, 1.12, 1.6];
  shelf('propane_tank', L[0], -3.1, 0.5, { h: 0.4 }); shelf('metal_jerrycan', L[0], -2.83, 1.57, { h: 0.4 });
  shelf('bleach_bottle', L[1], -3.14, 0, { h: 0.29 }); shelf('spray_paint_bottles', L[1], -2.96, 1.2, { h: 0.2 }); shelf('metal_toolbox', L[1], -2.8, 1.57, { h: 0.2 });
  shelf('plastic_crate_01', L[2], -2.98, 1.57, { h: 0.22 }); shelf('can_rusted', L[2], -2.78, 0.3, { h: 0.12 });
  shelf('cardboard_box_01', L[3], -2.95, 1.57, { h: 0.26 });
  model('ladder_sectioned_01', x1 - 0.2, 0, -2.25, Math.PI - 0.15, { h: 2.1, rz: 0.09 }, group);
  model('metal_trash_can', x1 - 0.5, 0, -1.55, 1.2, { h: 0.72, shadow: !low }, group);
  // the fridge and the dartboard over it
  const fx = x1 - 0.31, fz = -0.55;
  box(M.white, 0.56, 0.86, 0.5, fx, 0.45, fz); box(M.dark, 0.58, 0.02, 0.52, fx, 0.01, fz); box(M.steel, 0.02, 0.4, 0.03, fx - 0.29, 0.55, fz + 0.18);
  model('boombox', fx, 0.88, fz, -Math.PI / 2 + 0.2, { h: 0.3, shadow: false }, group);
  model('dartboard', x1 - 0.03, 1.72, 0.25, -Math.PI / 2, { h: 0.45, shadow: false }, group);
  // the television's stand, built open so the machines and the tapes show
  const tz = 1.35, tx = x1 - 0.3, UW = 1.5;
  box(M.wood, 0.5, 0.035, UW, tx, 0.56, tz); box(M.wood, 0.5, 0.03, UW, tx, 0.28, tz); box(M.wood, 0.5, 0.04, UW, tx, 0.04, tz);
  for (const s of [-1, 0, 1]) box(M.wood, 0.5, 0.56, 0.03, tx, 0.29, tz + s * (UW / 2 - 0.015));
  model('television_01', tx + 0.02, 0.578, tz - 0.25, -Math.PI / 2, { h: 0.5 }, group);
  // its picture: a channel that will not quite hold, drawn onto the glass and thrown into the room
  const tvC = document.createElement('canvas'); tvC.width = 64; tvC.height = 48;
  const tvX = tvC.getContext('2d', { willReadFrequently: true }), tvT = new THREE.CanvasTexture(tvC); tvT.colorSpace = THREE.SRGBColorSpace; tvT.magFilter = THREE.NearestFilter;
  const tvM = new THREE.MeshBasicMaterial({ map: tvT, toneMapped: false, color: 0xbbbbbb });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.3), tvM);
  screen.position.set(tx - 0.225, 0.578 + 0.27, tz - 0.31); screen.rotation.y = -Math.PI / 2;
  group.add(screen);
  // the film: Night of the Living Dead (1968, in the public domain), from the Internet Archive; the set's own channels until it comes, or if it never does
  const tv = { on: true, dead: false, film: null, tex: null, gain: null, at: new THREE.Vector3(tx - 0.225, 0.848, tz - 0.31) };
  G0.tvStart = (sound) => {
    if (tv.film) { if (tv.on && !tv.dead) tv.film.play().catch(() => { }); return; }
    const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.src = 'https://archive.org/cors/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_1080p_512kb.mp4';
    tv.film = v; tv.tex = new THREE.VideoTexture(v); tv.tex.colorSpace = THREE.SRGBColorSpace;
    try { tv.gain = sound.ctx.createGain(); tv.gain.gain.value = 0; sound.ctx.createMediaElementSource(v).connect(tv.gain).connect(sound.out); } catch (e) { tv.gain = null; }
    v.play().catch(() => { });
  };
  const tvL = new THREE.PointLight(0x9bb8ff, 1.2, 4.5, 2);
  tvL.position.set(tx - 0.6, 0.9, tz - 0.3);
  group.add(tvL);
  // the tape machine and the console under it, their leads, two pads on the floor
  box(M.dark, 0.34, 0.085, 0.42, tx, 0.34, tz - 0.4); box(M.steel, 0.01, 0.02, 0.16, tx - 0.172, 0.35, tz - 0.4);
  box(plain(0x9a9a96, { rough: 0.6 }), 0.26, 0.07, 0.2, tx - 0.05, 0.33, tz + 0.3); box(M.dark, 0.2, 0.012, 0.1, tx - 0.05, 0.37, tz + 0.3);
  for (const [px, pz, r] of [[1.55, 1.0, 0.4], [1.75, 1.7, -0.7]]) { box(plain(0x8e8e8a, { rough: 0.6 }), 0.13, 0.022, 0.058, px, 0.03, pz, r); cable([[tx - 0.2, 0.3, tz + 0.3], [tx - 0.5, 0.02, tz + 0.25], [px + 0.2, 0.012, pz + 0.1], [px, 0.03, pz]], 0.003); }
  // tapes and cartridges: every spine its own colour and title bars
  const spine = canvasTex(256, 64, (c) => {
    const cols = ['#b3261e', '#1f3f7a', '#e0b23c', '#2c6e49', '#6b2d7b', '#d86a1e', '#d9d6cc', '#222', '#2a8fa3', '#8a1f4d', '#566b2f', '#c9c2a0', '#3a3a8c', '#a34b22', '#1b1b1b', '#7a7f86'];
    for (let i = 0; i < 16; i++) { c.fillStyle = cols[i]; c.fillRect(i * 16, 0, 16, 64); c.fillStyle = i % 3 ? '#f3efe2' : '#111'; c.fillRect(i * 16 + 3, 8, 10, 3); c.fillRect(i * 16 + 3, 16, 10, 26); c.fillStyle = cols[(i * 7 + 3) % 16]; c.fillRect(i * 16 + 5, 20, 6, 18); c.fillStyle = '#eee'; c.fillRect(i * 16 + 4, 50, 8, 4); }
  });
  spine.magFilter = THREE.NearestFilter;
  const tapeM = new THREE.MeshStandardMaterial({ map: spine, roughness: 0.6 }), tapes = [];
  // a box of the row's material showing spine n of sixteen on every face
  const tape = (w, h, d, x, y, z, n, ry = 0) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (n % 16 + 0.1 + uv.getX(i) * 0.8) / 16, uv.getY(i)); g.rotateY(ry); g.translate(x, y, z); tapes.push(g); };
  for (let i = 0; i < 14; i++) tape(0.105, 0.19, 0.027, tx, 0.295 + 0.095, tz + 0.72 - i * 0.03, i * 5 + 1);
  for (let i = 0; i < 6; i++) tape(0.105, 0.027, 0.19, tx + 0.05, 0.578 + 0.0135 + i * 0.027, tz + 0.5, i * 3 + 2, 0.1 * Math.sin(i * 2.1));
  for (let i = 0; i < 9; i++) tape(0.11, 0.13, 0.02, tx, 0.055 + 0.065, tz + 0.6 - i * 0.023, i * 7 + 4);
  for (let i = 0; i < 4; i++) tape(0.11, 0.02, 0.13, tx - 0.02, 0.578 + 0.01 + i * 0.02, tz + 0.18, i * 4 + 9, 0.2 * Math.cos(i * 1.7));
  for (let i = 0; i < 10; i++) tape(0.105, 0.19, 0.027, tx, 0.055 + 0.095, tz - 0.1 - i * 0.03, i * 3);
  // the bookcase on the back wall: more tapes, games in their boxes, a ball, a plant
  model('wooden_bookshelf_worn', 1.75, 0, z1 - 0.3, Math.PI, { h: 2.0 }, group);
  for (const [y, n0] of [[0.52, 0], [0.97, 5], [1.42, 9]]) for (let i = 0; i < 26; i++) { if ((i * 7 + n0) % 9 === 0) continue; tape(0.027, 0.19, 0.105, 1.2 + i * 0.041, y + 0.095, z1 - 0.3, i + n0); }
  model('american_football', 1.75, 1.88, z1 - 0.3, 0.4, { h: 0.16, shadow: false }, group);
  model('potted_plant_04', 2.1, 1.88, z1 - 0.3, 1, { h: 0.27, shadow: false }, group);
  const tm = new THREE.Mesh(mergeGeometries(tapes), tapeM); tm.receiveShadow = true; group.add(tm);

  // ---- where you sit to watch: the couch on the left wall, a table before it, an armchair, a second rug ----
  box(M.rug2, 2.4, 0.012, 2.2, 0.2, 0.006, 1.75);
  model('sofa_01', x0 + 0.45, 0, 1.45, Math.PI / 2, { h: 0.78 }, group);
  model('coffeetable_01', -1.2, 0, 1.45, Math.PI / 2, { w: 0.95 }, group);
  model('can_rusted', -1.25, 0.34, 1.3, 0, { h: 0.11, shadow: false }, group);
  model('cassette_player', -1.15, 0.34, 1.62, 0.5, { h: 0.06, shadow: false }, group);
  model('armchair_01', 0.75, 0, 2.3, Math.PI + 0.9, { h: 0.95 }, group);
  model('metal_stool_01', -1.6, 0, -1.9, 0.4, { h: 0.62 }, group);
  model('garden_hose_wall_mounted_01', x0 + 0.13, 0.75, 0.35, Math.PI / 2, { h: 0.5, shadow: false }, group);
  model('potted_plant_04', x0 - 0.04, WIN[1].y0 + 0.035, WIN[1].z - 0.22, 0.6, { h: 0.27 }, group);
  model('utility_box_01', x0 + 0.22, 0, -3.3, Math.PI / 2, { h: 1.05 }, group);

  // ---- the back wall: the house door, a rack, what gets left by a door ----
  box(M.trim, 0.92, 2.06, 0.06, 0.2, 1.03, z1 - 0.01);
  box(M.paint, 0.82, 1.98, 0.045, 0.2, 1.0, z1 - 0.035);
  raw(M.steel, new THREE.SphereGeometry(0.03, 10, 8).translate(-0.12, 1.0, z1 - 0.09));
  model('worn_metal_rack', -0.95, 0, z1 - 0.34, Math.PI, { h: 1.9 }, group);
  const rack = (n, x, y, ry, o) => model(n, x, y, z1 - 0.34, ry, { shadow: false, ...o }, group);
  rack('plastic_crate_02', -1.17, 0.02, 0.1, { h: 0.25 }); rack('plastic_jerrycan', -0.7, 0.02, 0.5, { h: 0.3 });
  rack('small_oil_can_01', -0.8, 0.47, 0.6, { h: 0.18 }); rack('cardboard_box_01', -1.13, 0.97, 1.6, { h: 0.26 }); rack('plastic_bottle_gallon', -0.77, 0.97, 0.2, { h: 0.27 });
  rack('wooden_crate_02', -0.95, 1.47, 1.57, { h: 0.24 });
  model('plastic_broom', -0.3, 0, z1 - 0.2, 0.3, { h: 1.25 }, group);
  model('korean_fire_extinguisher_01', 0.85, 0, z1 - 0.22, 2.6, { h: 0.55 }, group);
  model('power_box_01', -1.75, 1.0, z1 - 0.06, Math.PI, { h: 0.5, shadow: false }, group);
  model('wall_clock', 0.2, 2.3, z1 - 0.035, Math.PI, { h: 0.3, shadow: false }, group);
  model('mounted_fluorescent_lights', 0.4, H - 0.045, 1.6, Math.PI / 2, { w: 0.9, shadow: false }, group);
  // a string of small bulbs along a joist over the couch
  const bulbs = [], bulbM = new THREE.MeshBasicMaterial({ color: 0xffd08a });
  for (let i = 0; i < 14; i++) bulbs.push(new THREE.SphereGeometry(0.018, 6, 5).translate(x0 + 0.3 + i * 0.36, H - 0.06 - 0.05 * Math.sin(i / 13 * Math.PI) - (i % 2) * 0.01, 2.45));
  group.add(new THREE.Mesh(mergeGeometries(bulbs), bulbM));
  const string = new THREE.PointLight(0xffc27a, 1.6, 5, 2);
  string.position.set(0, H - 0.4, 2.3);
  group.add(string);

  // ---- the posters, drawn here, in their frames ----
  const drawn = [
    (c, w, h) => { c.fillStyle = '#131313'; c.fillRect(0, 0, w, h); c.fillStyle = '#d43a2a'; c.beginPath(); c.arc(w / 2, h * 0.42, w * 0.3, 0, 7); c.fill(); c.fillStyle = '#f1e9d2'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.fillText('LOUD', w / 2, h * 0.84); c.font = '13px sans-serif'; c.fillText('ONE NIGHT ONLY', w / 2, h * 0.93); },
    (c, w, h) => { c.fillStyle = '#e8d9a8'; c.fillRect(0, 0, w, h); c.fillStyle = '#20324f'; for (let i = 0; i < 12; i++) c.fillRect(0, h * 0.5 + i * 12, w, 5); c.fillStyle = '#b5271e'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('GARAGE', w / 2, h * 0.3); c.fillStyle = '#20324f'; c.font = '14px sans-serif'; c.fillText('ALL AGES · 8 PM', w / 2, h * 0.4); },
    (c, w, h) => { c.fillStyle = '#0d1b2a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 7; i++) { c.strokeStyle = ['#ff4d6d', '#ffb347', '#4cc9f0'][i % 3]; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, h * 0.45, 14 + i * 13, 0, 7); c.stroke(); } c.fillStyle = '#f3efe2'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('LATE SHOW', w / 2, h * 0.92); },
    (c, w, h) => { c.fillStyle = '#f3efe2'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let i = 0; i < 5; i++) c.fillRect(w * 0.12, h * (0.14 + i * 0.1), w * 0.76, 3); c.font = 'bold 26px sans-serif'; c.textAlign = 'center'; c.fillText('RUDIMENTS', w / 2, h * 0.76); c.font = '13px sans-serif'; c.fillText('PRACTISE DAILY', w / 2, h * 0.86); },
  ];
  const frameM = plain(0x0f0f10, { rough: 0.5 });
  const posters = POSTERS.map((p, i) => {
    const own = canvasTex(192, Math.round(192 * p.h / p.w), drawn[i]), m = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshStandardMaterial({ map: own, roughness: 0.85 }));
    m.position.set(...p.at); m.rotation.y = p.ry; m.receiveShadow = true;
    const f = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.04, p.h + 0.04, 0.012), frameM);
    f.position.set(0, 0, -0.008); m.add(f);
    group.add(m);
    return { mesh: m, own };
  });
  // a few old oil stains on the slab
  const stain = new THREE.MeshBasicMaterial({ color: 0x0b0a09, transparent: true, opacity: 0.32, depthWrite: false });
  for (const [x, z, r] of [[1.3, -1.9, 0.22], [1.6, -2.3, 0.1], [-0.6, -3.1, 0.16], [0.9, -3.2, 0.13]]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14).rotateX(-Math.PI / 2), stain);
    m.position.set(x, 0.003, z); m.scale.z = 0.7;
    group.add(m);
  }

  // ---- the yard: the drive, the lawn, the side fence and its planting (the street beyond is street.js) ----
  const out = new THREE.Group();
  group.add(out);
  box(M.drive, 3.8, 0.1, 9, 0, -0.07, z0 - 4.5 - W);
  box(M.grass, 90, 0.1, 9.2, 0, -0.09, z0 - 4.6 - W);
  box(M.grass, 16, 0.1, 22, x0 - 8.2, -0.09, 0);
  box(M.fence, 0.04, 1.75, 16, x0 - 3.4, 0.87, 0.5);
  for (let z = -7; z < 9; z += 2) box(M.fence, 0.09, 1.85, 0.09, x0 - 3.34, 0.92, z);
  model('planter_box_01', x0 - 0.75, 0, WIN[0].z + 0.1, Math.PI / 2, { h: 0.42, shadow: false }, out);
  model('potted_plant_01', x0 - 0.8, 0.3, WIN[0].z - 0.2, 0.4, { h: 1.35, shadow: false }, out);
  model('potted_plant_01', x0 - 1.5, 0, WIN[1].z + 0.4, 2.2, { h: 1.6, shadow: false }, out);
  model('potted_plant_01', x0 - 2.6, 0, WIN[0].z + 1.0, 4.0, { h: 1.5, shadow: false }, out);
  model('planter_box_01', 2.9, 0, z0 - 1.2, 0, { h: 0.42, shadow: false }, out);

  for (const [mat, list] of bins) {
    const same = list.every((g) => !!g.index === !!list[0].index);
    const m = new THREE.Mesh(mergeGeometries(same ? list : list.map((g) => (g.index ? g.toNonIndexed() : g))), mat);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }

  // ---- the sky, the stars and the light ----
  // THE MARKET's sky (RAMEN's copy): the real sun and moon, the stars turning, cloud at the weather's cover
  const SUN = new THREE.Vector3(), MOON = new THREE.Vector3(), sky = buildSky(scene);
  scene.fog = new THREE.FogExp2(0xb7c6d2, 0.011);
  // far off, two ridges of mountains, the farther paler: the air between is in their colour, not drawn over them
  const ridge = (R, hgt, seed, haze) => {
    const N = 96, pos = [], idx = [], n1 = (a) => { let v = 0, f = 1, k = 0.5; for (let o = 0; o < 5; o++) { v += k * Math.sin(a * f * 3 + seed * (o + 1) * 1.7) * Math.cos(a * f * 1.3 + seed * o); f *= 2.1; k *= 0.5; } return v; };
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, h = hgt * (0.55 + 0.45 * Math.abs(n1(a)) + 0.25 * n1(a * 2.7)); pos.push(Math.cos(a) * R, -6, Math.sin(a) * R, Math.cos(a) * R, Math.max(4, h), Math.sin(a) * R); if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x556070, fog: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = -8; m.userData.haze = haze; group.add(m); return m;
  };
  const ridges = [ridge(360, 70, 3.1, 0.78), ridge(250, 38, 7.7, 0.55)], rockC = new THREE.Color(0x3d4a44), tC = new THREE.Color();
  const sun = new THREE.DirectionalLight(0xfff0d8, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(low ? 1024 : 2048);
  const sc = sun.shadow.camera;
  sc.left = -7; sc.right = 7; sc.top = 6.5; sc.bottom = -6.5; sc.near = 4; sc.far = 30;
  sun.shadow.needsUpdate = true;
  sun.shadow.autoUpdate = false; // the room does not move: the sun's shadows are drawn again only when the sun or the door has
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  sun.target.position.set(0, 0.5, -0.5);
  group.add(sun, sun.target);
  // every other light in the room is the sky's, come round a corner, each with its own shadows: through the side windows, through the door, back up off the slab
  const fills = [];
  const still = (color, power, from, to, angle) => {
    const l = new THREE.SpotLight(color, power, 0, angle, 1, 2);
    l.position.set(...from); l.target.position.set(...to);
    l.castShadow = true;
    l.shadow.mapSize.setScalar(low ? 512 : 1024);
    l.shadow.camera.near = 0.25; l.shadow.camera.far = 10;
    l.shadow.bias = -0.002; l.shadow.normalBias = 0.03;
    l.shadow.needsUpdate = true; l.shadow.autoUpdate = false;
    group.add(l, l.target);
    fills.push([l, power]);
    return l;
  };
  still(0xbdd2ee, 60, [x0 - 1.1, 1.75, (WIN[0].z + WIN[1].z) / 2], [1.4, 0.6, -0.8], 1.0);
  still(0xc8d8ee, 60, [0, 1.3, z0 - 1.8], [0, 0.7, 0.8], 0.95);
  const bounce = still(0xffd9a8, 14, [-0.55, 0.06, -1.2], [0.1, 2.6, -0.2], 1.25);
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

  // ---- where light cannot get to: the meeting of wall and floor, the corners, under the furniture ----
  const fall = canvasTex(4, 64, (c) => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,.72)'); c.fillStyle = g; c.fillRect(0, 0, 4, 64); });
  const blob = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(0.6, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const shadeM = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide });
  const strips = [];
  const strip = (a, b, c, d) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...a, ...b, ...d, ...a, ...d, ...c]), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]), 2));
    strips.push(g);
  };
  const e = 0.004, ix0 = x0 + e, ix1 = x1 - e, iz0 = z0 + e, iz1 = z1 - e, FW = 0.55, WH = 0.6, CH = 0.5, CW = 0.4;
  for (const [ax, az, bx, bz, nx, nz] of [[ix0, iz0, ix0, iz1, 1, 0], [ix1, iz1, ix1, iz0, -1, 0], [ix0, iz1, ix1, iz1, 0, -1]]) {
    const sx = Math.sign(bx - ax) * CW, sz = Math.sign(bz - az) * CW;
    strip([ax, e, az], [bx, e, bz], [ax + nx * FW, e, az + nz * FW], [bx + nx * FW, e, bz + nz * FW]);
    strip([ax, e, az], [bx, e, bz], [ax, WH, az], [bx, WH, bz]);
    strip([ax, H - e, az], [bx, H - e, bz], [ax, H - CH, az], [bx, H - CH, bz]);
    strip([ax, 0, az], [ax, H, az], [ax + sx, 0, az + sz], [ax + sx, H, az + sz]);
    strip([bx, 0, bz], [bx, H, bz], [bx - sx, 0, bz - sz], [bx - sx, H, bz - sz]);
  }
  const ao = new THREE.Mesh(mergeGeometries(strips), shadeM(fall));
  ao.renderOrder = 2;
  group.add(ao);
  const blobM = shadeM(blob);
  for (const [x, z, w, d, y] of [[x0 + 0.5, 1.45, 1.2, 2.1, 0.02], [tx, tz, 0.9, 1.9, 0.006], [1.75, z1 - 0.3, 1.7, 0.9, 0.006], [-0.95, z1 - 0.35, 1.4, 0.9, 0.006], [0.12, -0.45, 2.6, 2.3, 0.02], [-1.9, -3.15, 1, 0.7, 0.006], [fx, fz, 0.9, 0.9, 0.006], [-1.2, 1.45, 0.9, 1.3, 0.02], [0.75, 2.3, 1.1, 1.1, 0.02], [x1 - 0.3, -2.95, 0.9, 1.0, 0.006]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), blobM);
    m.position.set(x, y, z); m.renderOrder = 2;
    group.add(m);
  }

  // ---- dust in the sun: it drifts down the beams from each pane ----
  const beams = [...WIN.map((o) => ({ c: new THREE.Vector3(x0, (o.y0 + o.y1) / 2, o.z), u: new THREE.Vector3(0, 0, o.w / 2 - 0.03), v: new THREE.Vector3(0, (o.y1 - o.y0) / 2 - 0.03, 0) })),
    { c: new THREE.Vector3(0, 3.5 * PH, z0 + 0.1), u: new THREE.Vector3(pw / 2, 0, 0), v: new THREE.Vector3(0, PH / 2 - 0.08, 0) }];
  const N = low ? 60 : 220, dp = new Float32Array(N * 3), seed = [];
  for (let i = 0; i < N; i++) seed.push({ o: beams[i % beams.length], a: Math.random() * 2 - 1, b: Math.random() * 2 - 1, t: Math.random(), s: 0.01 + Math.random() * 0.02, p: Math.random() * 6.28 });
  const dustG = new THREE.BufferGeometry();
  dustG.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: 0xfff2d8, size: 0.004, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  dust.frustumCulled = false;
  group.add(dust);
  const tmp = new THREE.Vector3(), down = new THREE.Vector3(), cDay = new THREE.Color(0xb7c6d2), cDusk = new THREE.Color(0xd9a98a), cNight = new THREE.Color(0x070a12), cWarm = new THREE.Color(0xff9a52), cWhite = new THREE.Color(0xfff0d8), cMoon = new THREE.Color(0x8fa6d8), fogC = new THREE.Color(), cGrey = new THREE.Color();
  let lastSun = -9, tvT0 = 0;

  Object.assign(G0, {
    group, out, sun, lamp, sky, M, cord, haloM, door, posters, tv, ear: new THREE.Vector3(), sunV: SUN, dim: 1,
    tvToggle() { tv.on = !tv.on; if (tv.film) { if (tv.on && !tv.dead) tv.film.play().catch(() => { }); else tv.film.pause(); } },
    tvShot() { tv.dead = true; if (tv.film) tv.film.pause(); }, swing: 0, hour: 12, day: 1, lean: false,
    // a headset that still cannot keep up loses the two softest lights, never the sun or the lamp
    thin() { G.lean = true; fills[1][0].visible = fills[2][0].visible = false; hemi.intensity *= 2; },
    // a loud hit sets the lamp going on its cord
    jolt(v) { G.swing = Math.min(1, G.swing + v * 0.5); },
    toggleDoor() { door.want = door.want > 0.5 ? 0 : 1; },
    setDoor(v) { door.open = door.want = v; setDoor(); for (const [l] of fills) l.shadow.needsUpdate = true; sun.shadow.needsUpdate = true; },
    // the hour sets where the sun is, how much of it there is and what colour, and what the sky and the air look like
    // how high the sun stands at an hour of today (degrees)
    altAt(hour) { const d = new Date(); return EPH.seen('sun', EPH.jdOf(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) + (hour - EPH.LON / 15) * 3600e3)).alt; },
    // the hour (and the weather) set where the sun and moon really are, how much light there is and what colour, the sky and the air
    setHour(hour, time, wx = { cloud: 0.2, rain: 0, mist: 0.1 }) {
      G.hour = hour;
      const d = new Date(), jd = EPH.jdOf(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) + (hour - EPH.LON / 15) * 3600e3);
      const Sk = sky.set(jd, wx, null, 0.55), e = Sk.e, day = ss(-5, 9, e), low2 = 1 - ss(3, 26, e), dim = 1 - 0.8 * ss(0.45, 0.95, wx.cloud), moonUp = Sk.moonAlt > 2;
      SUN.copy(Sk.sunDir); MOON.copy(Sk.moonDir); G.day = day; G.sunE = e; G.dim = dim;
      const dir = e > -1 ? SUN : moonUp ? MOON : tmp.set(-0.3, 0.8, -0.5).normalize();
      sun.position.copy(dir).multiplyScalar(16).add(sun.target.position);
      sun.color.copy(e > -1 ? cWhite : cMoon).lerp(cWarm, e > -1 ? low2 * 0.75 : 0);
      sun.intensity = e > -1 ? 10 * ss(-1, 6, e) * (0.35 + 0.65 * Math.max(0, SUN.y)) * dim : (moonUp ? 0.12 + 0.4 * Sk.moonLit : 0.06) * dim;
      for (const [l, p] of fills) l.intensity = p * (0.03 + 0.97 * day) * (0.55 + 0.45 * dim);
      bounce.intensity *= Math.max(0, SUN.y) * 1.6 * dim;
      hemi.intensity = (G.lean ? 0.4 : 0.22) * (0.2 + 0.8 * day);
      fogC.copy(Sk.horizon).lerp(cGrey.setRGB(0.5, 0.53, 0.57).multiplyScalar(0.1 + 0.9 * day), 0.25 + 0.5 * wx.cloud);
      scene.fog.color.copy(fogC); if (scene.background && scene.background.isColor) scene.background.copy(fogC);
      scene.fog.density = 0.008 + 0.012 * wx.rain + 0.008 * wx.mist;
      AIR.mist[0] = 0.0015 + 0.02 * wx.mist; AIR.mist[1] = 1 / (1.8 + 2.4 * wx.mist); AIR.mist[2] = -0.1;
      AIR.sun[0] = dir.x; AIR.sun[1] = dir.y; AIR.sun[2] = dir.z; const glow = ss(-3, 3, e) * (1 - ss(5, 30, e) * 0.65) * 0.07 * dim;
      AIR.sunC[0] = Sk.sunC.r * glow; AIR.sunC[1] = Sk.sunC.g * glow; AIR.sunC[2] = Sk.sunC.b * glow;
      for (const m of ridges) m.material.color.copy(tC.copy(rockC).multiplyScalar(0.08 + 0.92 * day * (0.5 + 0.5 * dim))).lerp(fogC, m.userData.haze + 0.2 * wx.mist);
      dust.material.opacity = 0.22 * day * dim;
      down.copy(SUN).negate();
      // the sun's shadows are drawn again only once it has moved enough to see, or the door is running
      if (Math.abs(hour - lastSun) > 0.08 || door.moving) { lastSun = hour; sun.shadow.needsUpdate = true; }
    },
    update(dt, time) {
      G.swing *= Math.exp(-dt * 0.5);
      const sw = 1 + G.swing * 3;
      cord.rotation.set(0.022 * sw * Math.sin(time * 1.9), 0, 0.03 * sw * Math.sin(time * 1.7 + 0.6));
      // the door runs on its tracks; the light that comes through it is drawn again while it does
      door.moving = Math.abs(door.want - door.open) > 0.001;
      if (door.moving) { door.open += Math.sign(door.want - door.open) * Math.min(Math.abs(door.want - door.open), dt * 0.32); setDoor(); for (const [l] of fills) l.shadow.needsUpdate = true; sun.shadow.needsUpdate = true; }
      // the television: its picture rolls and its light with it
      const film = tv.film && tv.film.readyState >= 2 && !tv.film.paused;
      if (tvM.map !== (film ? tv.tex : tvT)) { tvM.map = film ? tv.tex : tvT; tvM.needsUpdate = true; }
      tvM.color.setHex(tv.on && !tv.dead ? 0xbbbbbb : 0x050505);
      if (tv.gain) tv.gain.gain.value = tv.on && !tv.dead ? Math.min(0.9, 0.5 / Math.max(0.6, G.ear.distanceToSquared(tv.at) * 0.35)) : 0;
      if (!tv.on || tv.dead) tvL.intensity = 0;
      else if (film) { tvL.color.setHex(0xcfd6e6); tvL.intensity = (0.8 + 0.5 * Math.abs(Math.sin(time * 5.3) * Math.sin(time * 1.7))) * (1.6 - 0.9 * G.day); }
      else if (time - tvT0 > 0.1) {
        tvT0 = time;
        const ph = Math.floor(time / 9) % 3, k = (time * 30) | 0;
        if (ph === 0) { for (let i = 0; i < 7; i++) { tvX.fillStyle = ['#c9c9c9', '#c9c93a', '#3ac9c9', '#3ac93a', '#c93ac9', '#c93a3a', '#3a3ac9'][i]; tvX.fillRect(i * 9.2, 0, 10, 48); } }
        else if (ph === 1) { tvX.fillStyle = '#10182c'; tvX.fillRect(0, 0, 64, 48); tvX.fillStyle = '#e8e8e8'; tvX.fillRect(2, 18 + 10 * Math.sin(time * 2), 2, 10); tvX.fillRect(60, 18 + 10 * Math.cos(time * 1.7), 2, 10); tvX.fillRect(32 + 26 * Math.sin(time * 1.9), 24 + 18 * Math.sin(time * 2.7), 2, 2); for (let y = 0; y < 48; y += 6) tvX.fillRect(31, y, 1, 3); }
        else { const im = tvX.getImageData(0, 0, 64, 48), d = im.data; for (let i = 0; i < d.length; i += 4) { const v = ((i * 2654435761 + k * 40503) >>> 8) & 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } tvX.putImageData(im, 0, 0); }
        tvX.fillStyle = 'rgba(0,0,0,.25)'; tvX.fillRect(0, (k * 3) % 48, 64, 3);
        tvT.needsUpdate = true;
        tvL.color.setHex(ph === 0 ? 0xc8d0b0 : ph === 1 ? 0x7f9cff : 0xcfd6e6);
        tvL.intensity = (0.9 + 0.5 * Math.abs(Math.sin(time * 7.3) * Math.sin(time * 2.1))) * (1.6 - 0.9 * G.day);
      }
      string.intensity = 1.6 * (1.5 - 0.9 * G.day);
      for (let i = 0; i < N; i++) {
        const d = seed[i];
        d.t = (d.t + d.s * dt) % 1;
        tmp.copy(d.o.c).addScaledVector(d.o.u, d.a * 0.95 + 0.04 * Math.sin(time * 0.3 + d.p)).addScaledVector(d.o.v, d.b * 0.95);
        if (down.y < -0.05) tmp.addScaledVector(down, d.t * (tmp.y / -down.y));
        dp[i * 3] = tmp.x; dp[i * 3 + 1] = tmp.y + 0.02 * Math.sin(time * 0.5 + d.p); dp[i * 3 + 2] = tmp.z;
      }
      dustG.attributes.position.needsUpdate = true;
    },
  });
  const { x0: X0, x1: X1, z0: Z0, z1: Z1 } = ROOM, T = 0.25;
  G.solids = [[X0 - T, Z0 - T, X0, Z1 + T], [X1, Z0 - T, X1 + T, Z1 + T], [X0 - T, Z1, X1 + T, Z1 + T], [X0 - T, Z0 - T, -DOOR.w / 2 + 0.05, Z0], [DOOR.w / 2 - 0.05, Z0 - T, X1 + T, Z0],
    [-0.85, -1.6, 1.15, -0.3], [X0, 0.4, X0 + 0.85, 2.5], [-1.7, 0.95, -0.7, 1.95], [X1 - 0.6, 0.55, X1, 2.15], [1.0, Z1 - 0.65, 2.5, Z1], [-1.75, Z1 - 0.7, -0.2, Z1], [0.3, 1.85, 1.2, 2.75], [X1 - 0.62, -0.85, X1, -0.25],
    [X1 - 0.6, -3.3, X1, -1.2], [-2.3, -3.5, -1.5, -2.9], [X0, -3.6, X0 + 0.5, -3.0], [-1.8, -2.1, -1.4, -1.7], [X0 - 3.5, -8, X0 - 3.3, 9]];
  G.doorGap = [-DOOR.w / 2, Z0 - T, DOOR.w / 2, Z0];
  G.setHour(12, 0);
  return G;
}
