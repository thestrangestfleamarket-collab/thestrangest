// World: streamed map chunks, terrain/road surface queries, collision data, street furniture, sky and time of day.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import * as E from './ephem.js';
import { buildSky } from './sky.js';
import { AIR, installAir } from './air.js';
installAir(); // haze and ground mist in every material's fog step (from the owner's THE MARKET)

const A = '/drive-assets/';
const texLoader = new THREE.TextureLoader();
function tex(name, srgb, aniso) {
  const t = texLoader.load(A + 'tex/' + name + '.jpg');
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function pbr(name, aniso, opts = {}) {
  return new THREE.MeshStandardMaterial({ map: tex(name + '_col', true, aniso), normalMap: opts.noNormal ? null : tex(name + '_nor', false, aniso), roughnessMap: opts.noRough ? null : tex(name + '_rough', false, aniso), roughness: 1, metalness: 0, ...opts.mat });
}

export const PHASE = { cycle: 50 };
export function signalState(group, tSec) { // 0 red, 1 yellow, 2 green
  const t = ((tSec + (group ? 25 : 0)) % PHASE.cycle + PHASE.cycle) % PHASE.cycle;
  return t < 20 ? 2 : t < 23.5 ? 1 : 0;
}

export class World {
  constructor(scene, renderer, quality) {
    this.scene = scene; this.renderer = renderer; this.q = quality;
    this.group = new THREE.Group(); scene.add(this.group);
    this.loaded = new Map(); this.loading = new Set(); this.pendingCount = 0;
    this.time = 'night'; this.rain = 0; this.clockOffset = 0;
    this.lampLights = []; this.nightAmount = 1;
  }

  async load(progress) {
    const [meta, hbuf, roads, col] = await Promise.all([
      fetch(A + 'world/world.json').then(r => r.json()), fetch(A + 'world/height.bin').then(r => r.arrayBuffer()),
      fetch(A + 'world/roads.json').then(r => r.json()), fetch(A + 'world/collide.json').then(r => r.json())]);
    this.meta = meta; this.H = new Float32Array(hbuf); this.gn = meta.grid.n; this.gc = meta.grid.cell; this.gmin = meta.grid.min;
    this.roads = roads.roads; this.roadClasses = roads.classes;
    progress && progress(0.3, 'Indexing roads');
    // road segment hash
    this.RC = 20; this.rh = new Map();
    for (const r of this.roads) {
      const p = r.p, hw = r.w / 2; r.hw = hw;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const seg = { ax: p[i], az: p[i + 1], bx: p[i + 2], bz: p[i + 3], hw, f: r.f, c: r.c, r, ya: r.y ? r.y[i / 2] : 0, yb: r.y ? r.y[i / 2 + 1] : 0, br: !!r.y };
        const x0 = Math.floor((Math.min(seg.ax, seg.bx) - hw) / this.RC), x1 = Math.floor((Math.max(seg.ax, seg.bx) + hw) / this.RC), z0 = Math.floor((Math.min(seg.az, seg.bz) - hw) / this.RC), z1 = Math.floor((Math.max(seg.az, seg.bz) + hw) / this.RC);
        for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { const k = x * 4096 + z; let l = this.rh.get(k); if (!l) this.rh.set(k, l = []); l.push(seg); }
      }
    }
    // building hash
    this.BC = 40; this.bh = new Map(); this.buildings = col.buildings;
    for (const b of this.buildings) {
      let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity; for (let i = 0; i < b.p.length; i += 2) { x0 = Math.min(x0, b.p[i]); x1 = Math.max(x1, b.p[i]); z0 = Math.min(z0, b.p[i + 1]); z1 = Math.max(z1, b.p[i + 1]); }
      b.bb = [x0, z0, x1, z1];
      for (let x = Math.floor(x0 / this.BC); x <= Math.floor(x1 / this.BC); x++) for (let z = Math.floor(z0 / this.BC); z <= Math.floor(z1 / this.BC); z++) { const k = x * 4096 + z; let l = this.bh.get(k); if (!l) this.bh.set(k, l = []); l.push(b); }
    }
    // pole / trunk collision circles + per-chunk prop buckets
    this.ch = new Map(); this.CC = 20; this.props = new Map();
    const circ = (x, z, r, h) => { const k = Math.floor(x / this.CC) * 4096 + Math.floor(z / this.CC); let l = this.ch.get(k); if (!l) this.ch.set(k, l = []); l.push([x, z, r, h]); };
    const bucket = (x, z) => { const i = Math.floor((x + meta.half) / meta.chunk), j = Math.floor((z + meta.half) / meta.chunk); const k = i + '_' + j; let b = this.props.get(k); if (!b) this.props.set(k, b = { lamps: [], trees: [], signs: [], bushes: [], panels: [], parked: [], fences: [], poles: [], furn: [], wires: [] }); return b; };
    for (const l of meta.lamps) { circ(l[0], l[2], 0.14, 8); bucket(l[0], l[2]).lamps.push(l); }
    this.measured = !!meta.measured;
    for (const t of meta.trees) { circ(t[0], t[2], this.measured ? Math.min(0.45, 0.12 + t[3] * 0.018) : 0.24 * t[3], 3); bucket(t[0], t[2]).trees.push(t); }
    for (const b of meta.bushes || []) bucket(b[0], b[2]).bushes.push(b);
    for (const c of meta.parked || []) { const sx = Math.sin(c[3]), cz = Math.cos(c[3]); circ(c[0] + sx * 1.1, c[2] + cz * 1.1, 0.95, 1.5); circ(c[0] - sx * 1.1, c[2] - cz * 1.1, 0.95, 1.5); bucket(c[0], c[2]).parked.push(c); }
    for (const f of meta.fences || []) bucket(f[0], f[2]).fences.push(f);
    for (const wv of meta.wires || []) bucket(wv[0], wv[2]).wires.push(wv);
    for (const f of meta.furn || []) { if (f[4] !== 7) circ(f[0], f[2], f[4] === 5 ? 1.0 : 0.35, 1.5); bucket(f[0], f[2]).furn.push(f); }
    for (const q of meta.poles || []) { circ(q[0], q[2], 0.16, 8); bucket(q[0], q[2]).poles.push(q); }
    for (const q of meta.panels || []) { circ(q[0], q[2], 0.06, 2.6); bucket(q[0], q[2]).panels.push(q); }
    for (const s of meta.signs) { circ(s[0], s[2], 0.06, 2.2); bucket(s[0], s[2]).signs.push(s); }
    for (const s of meta.signals) circ(s[0], s[2], 0.16, 6);
    this.lampList = meta.lamps;
    this.lampHash = new Map(); for (const l of meta.lamps) { const k = Math.floor(l[0] / 60) * 4096 + Math.floor(l[2] / 60); let a = this.lampHash.get(k); if (!a) this.lampHash.set(k, a = []); a.push(l); }
    progress && progress(0.38, 'Loading scanned plants and props');
    this.kit = {}; try { const gl = new GLTFLoader(); gl.setMeshoptDecoder(MeshoptDecoder); const g = await gl.loadAsync(A + 'props/props.glb'); g.scene.updateMatrixWorld(true); for (const n of g.scene.children) { const parts = []; n.traverse(o => { if (o.isMesh) { o.material.side = THREE.DoubleSide; if (o.material.map) o.material.map.anisotropy = 4; if (/^(grass|drygrass|weed|shrub|tree)/.test(n.name) && !/trunk|branches/.test(o.material.name)) { // the scans store leaves on a black sheet: cut the black away
          o.material.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nif (max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)) < 0.035) discard;'); }; o.material.customProgramCacheKey = () => 'leafcut'; } parts.push({ geo: o.geometry, mat: o.material }); } }); this.kit[n.name] = parts; } } catch (e) { console.warn('props kit missing', e); }
    try { const gl2 = new GLTFLoader(); const cg = await gl2.loadAsync(A + 'cars/car.glb'); const src = cg.scene.getObjectByProperty('isMesh', true); cg.scene.updateMatrixWorld(true); const geo = src.geometry.clone(); geo.applyMatrix4(src.matrixWorld); geo.rotateY(Math.PI / 2); this.carGeo = geo; this.carMats = [];
      for (let i = 0; i < 5; i++) { const t = await texLoader.loadAsync(A + 'cars/car_' + i + '.jpg'); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; const m = src.material.clone(); m.map = t; m.roughness = 0.32; m.metalness = 0.35; this.carMats.push(m); } } catch (e) { console.warn('car model missing', e); }
    // more vehicles (CC BY models, see fleet.json): traffic versions and, for the simple ones, lighter parked versions
    this.fleet = []; try { const gl3 = new GLTFLoader(); const [fg, fi] = await Promise.all([gl3.loadAsync(A + 'cars/fleet.glb'), fetch(A + 'cars/fleet.json').then(r => r.json())]); fg.scene.updateMatrixWorld(true); const grab = (n) => { const node = fg.scene.children.find(c => c.name === n); if (!node) return null; const parts = []; node.traverse(o => { if (o.isMesh) { if (o.material.transparent) { o.material.depthWrite = false; o.material.opacity = Math.min(o.material.opacity, 0.55); } parts.push({ geo: o.geometry, mat: o.material }); } }); return parts; };
      for (const id in fi) { const parts = grab('car_' + id); if (parts) this.fleet.push({ id, info: fi[id], parts, lo: grab('carlo_' + id) }); } } catch (e) { console.warn('fleet missing', e); }
    // traffic controls for drivers: stop signs and yield signs, each with the direction of travel it governs
    this.ctrl = []; this.ctrlHash = new Map(); const addC = (x, z, yaw, kind) => { const c = { x, z, fx: -Math.sin(yaw), fz: -Math.cos(yaw), kind, id: this.ctrl.length }; this.ctrl.push(c); const k = Math.floor(x / 50) * 4096 + Math.floor(z / 50); let l = this.ctrlHash.get(k); if (!l) this.ctrlHash.set(k, l = []); l.push(c); };
    for (const g of meta.signs || []) addC(g[0], g[2], g[3], 0); for (const q of meta.panels || []) if (q[3] === 4) addC(q[0], q[2], q[4], 1);
    try { const tj = await fetch(A + 'trees/trees.json').then(r => r.json()); this.cards = []; for (const id of ['jacaranda_tree', 'island_tree_01', 'island_tree_02', 'tree_small_02', 'tree_small_02']) { const mats = []; for (const v of [0, 1]) { const t = await texLoader.loadAsync(A + 'trees/' + id + '_' + v + '_d.webp'); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mats.push(new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 1, color: new THREE.Color(1.7, 1.7, 1.6) })); } this.cards.push({ id, ar: tj[id].w / tj[id].h, mats }); }
      const q0 = new THREE.PlaneGeometry(1, 1); q0.translate(0, 0.5, 0); const q1 = q0.clone(); q1.rotateY(Math.PI / 2); for (const g of [q0, q1]) { const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); } this.cardGeo = [q0, q1]; } catch (e) { console.warn('tree cards missing', e); this.cards = null; }
    progress && progress(0.4, 'Materials');
    this.initMaterials(); this.initProps(); this.initSky(); this.initSignals(); this.initGrass();
    this.loader = new GLTFLoader(); this.loader.setMeshoptDecoder(MeshoptDecoder);
    this.setTime('night');
  }

  // ---------------------------------------------------------------- queries
  height(x, z) {
    let fx = (x - this.gmin) / this.gc, fz = (z - this.gmin) / this.gc; const n = this.gn;
    fx = fx < 0 ? 0 : fx > n - 1.001 ? n - 1.001 : fx; fz = fz < 0 ? 0 : fz > n - 1.001 ? n - 1.001 : fz;
    const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, a = j * n + i, H = this.H;
    return (H[a] * (1 - u) + H[a + 1] * u) * (1 - v) + (H[a + n] * (1 - u) + H[a + n + 1] * u) * v;
  }
  // Surface under a point. yRef is the height of the thing asking (to pick bridge deck vs the road underneath).
  surface(x, z, yRef, out) {
    const hy = this.height(x, z);
    let y = hy, type = 2, bridge = false, seg0 = null;
    const l = this.rh.get(Math.floor(x / this.RC) * 4096 + Math.floor(z / this.RC));
    if (l) for (let i = 0; i < l.length; i++) {
      const s = l[i]; const dx = s.bx - s.ax, dz = s.bz - s.az; const l2 = dx * dx + dz * dz || 1e-9; let t = ((x - s.ax) * dx + (z - s.az) * dz) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - s.ax - dx * t, ez = z - s.az - dz * t; if (ex * ex + ez * ez > s.hw * s.hw) continue;
      if (s.br) { const dy = s.ya + (s.yb - s.ya) * t; if (dy <= yRef + 0.7 && dy > y - 0.01) { y = dy; type = 0; bridge = true; seg0 = s; } }
      else if (!bridge) { const ry = hy + 0.055; if (ry > y - 0.5) { y = Math.max(y, ry); if (type === 2 || s.f === 0) type = s.f; seg0 = s; } }
    }
    out.y = y; out.type = type; out.bridge = bridge; out.seg = seg0;
    if (bridge) { out.nx = 0; out.ny = 1; out.nz = 0; }
    else { const e = 1.5; const gx = (this.height(x + e, z) - this.height(x - e, z)) / (2 * e), gz = (this.height(x, z + e) - this.height(x, z - e)) / (2 * e); const il = 1 / Math.hypot(gx, 1, gz); out.nx = -gx * il; out.ny = il; out.nz = -gz * il;
      if (type === 2 && this.land && this.landAt(x, z) === 3) type = 1; // car parks, driveways and plazas seen in the aerial photo
      if (type === 2) { out.y += 0.018 * (Math.sin(x * 2.3) * Math.cos(z * 2.9) + Math.sin(x * 0.7 + z * 1.3)); } }
    out.mu = type === 2 ? 0.62 : (type === 0 ? 1.02 : 0.98);
    if (this.rain > 0) out.mu *= 1 - 0.28 * this.rain;
    return out;
  }
  nearestRoad(x, z, maxD = 60) { let best = null, bd = maxD; const c = Math.ceil(maxD / this.RC); const ci = Math.floor(x / this.RC), cj = Math.floor(z / this.RC);
    for (let a = -c; a <= c; a++) for (let b = -c; b <= c; b++) { const l = this.rh.get((ci + a) * 4096 + cj + b); if (!l) continue; for (const s of l) { const dx = s.bx - s.ax, dz = s.bz - s.az; const l2 = dx * dx + dz * dz || 1e-9; let t = ((x - s.ax) * dx + (z - s.az) * dz) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t; const d = Math.hypot(x - s.ax - dx * t, z - s.az - dz * t); if (d < bd) { bd = d; best = s; } } }
    return best ? { seg: best, d: bd } : null; }
  // Push a circle out of buildings and poles. Returns number of contacts; writes into `hits` [{nx,nz,depth}].
  collideCircle(x, z, r, y0, y1, hits) {
    let n = 0;
    const bl = this.bh.get(Math.floor(x / this.BC) * 4096 + Math.floor(z / this.BC));
    if (bl) for (const b of bl) {
      if (x < b.bb[0] - r || x > b.bb[2] + r || z < b.bb[1] - r || z > b.bb[3] + r) continue; if (y0 > b.y[1] || y1 < b.y[0]) continue;
      const p = b.p; let inside = false, bd = Infinity, bx = 0, bz = 0;
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        const ax = p[j], az = p[j + 1], cx = p[i], cz = p[i + 1];
        if ((cz > z) !== (az > z) && x < (ax - cx) * (z - cz) / (az - cz) + cx) inside = !inside;
        const dx = cx - ax, dz = cz - az; const l2 = dx * dx + dz * dz || 1e-9; let t = ((x - ax) * dx + (z - az) * dz) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = x - ax - dx * t, ez = z - az - dz * t; const d = ex * ex + ez * ez; if (d < bd) { bd = d; bx = ex; bz = ez; }
      }
      const d = Math.sqrt(bd);
      if (inside) { const il = d > 1e-5 ? 1 / d : 0; hits[n++] = { nx: -bx * il, nz: -bz * il, depth: d + r }; }
      else if (d < r) { const il = d > 1e-5 ? 1 / d : 0; hits[n++] = { nx: bx * il, nz: bz * il, depth: r - d }; }
    }
    const ci = Math.floor(x / this.CC), cj = Math.floor(z / this.CC);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const cl = this.ch.get((ci + a) * 4096 + cj + b); if (!cl) continue; for (const c of cl) { const dx = x - c[0], dz = z - c[1]; const d = Math.hypot(dx, dz); if (d < r + c[2] && d > 1e-5) hits[n++] = { nx: dx / d, nz: dz / d, depth: r + c[2] - d, pole: true }; } }
    return n;
  }

  // ---------------------------------------------------------------- 3D grass around the viewer, only where the land-cover map says grass
  initGrass() {
    const N = this.q.grassCount; const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; this.land = new Uint8Array(c.width * c.height); for (let i = 0; i < this.land.length; i++) this.land[i] = Math.round(d[i * 4] / 50); this.landW = c.width; }; img.src = A + 'world/land.png'; if (!N) return;
    // scanned Bermuda-grass patches for lawns, dead/flattened patches for dry ground, scanned dandelions, nettles and small shrubs as weeds
    const mk = (name) => { const parts = this.kit[name]; if (!parts) return null; const ms = parts.map(p => { const m = new THREE.InstancedMesh(p.geo, p.mat, N); m.frustumCulled = false; m.count = 0; m.receiveShadow = this.q.shadows; m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3).fill(1), 3); this.scene.add(m); return m; }); return { ms, n: 0 }; };
    const set = (pre, k) => { const o = []; for (let i = 0; i < k; i++) { const v = mk(pre + i); if (v) o.push(v); } return o; };
    this.gv = set('grass_', 4); this.dv = set('drygrass_', 3); this.wv = set('weed_', 7); this.grass = this.gv.length ? true : null; this.grassC = new THREE.Vector3(1e9, 0, 1e9);
  }
  markTrack(x, z) { if (!this.tracks) this.tracks = new Map(); const k = Math.floor(x * 2) * 65536 + Math.floor(z * 2); if (!this.tracks.has(k)) { this.tracks.set(k, 1); this.tracksDirty = true; if (this.tracks.size > 6000) this.tracks.delete(this.tracks.keys().next().value); } }
  landAt(x, z) { if (!this.land) return 0; const i = Math.floor((x + this.meta.half) / 2), j = Math.floor((z + this.meta.half) / 2); if (i < 0 || j < 0 || i >= this.landW || j >= this.landW) return 0; return this.land[j * this.landW + i]; }
  updateGrass(p) {
    if (!this.grass || !this.land) return; this._gt = (this._gt || 0) + 1; if (Math.hypot(p.x - this.grassC.x, p.z - this.grassC.z) < 1.5 && !(this.tracksDirty && this._gt > 20)) return; this.grassC.copy(p); this._gt = 0; this.tracksDirty = false; const TR = this.tracks;
    const R = this.q.grassRadius, cell = 0.5, side = Math.floor(2 * R / cell); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), Yv = new THREE.Vector3(0, 1, 0); const all = [...this.gv, ...this.dv, ...this.wv]; for (const a of all) a.n = 0; const N = this.q.grassCount;
    const put = (set, idx, x, z, yaw, sc, hs, r, g, b) => { const a = set[idx % set.length]; if (!a || a.n >= N) return; q.setFromAxisAngle(Yv, yaw); m.compose(v.set(x, this.height(x, z) - 0.01, z), q, s.set(sc, sc * hs, sc)); for (const im of a.ms) { im.setMatrixAt(a.n, m); im.instanceColor.setXYZ(a.n, r, g, b); } a.n++; };
    const i0 = Math.floor(p.x / cell) - (side >> 1), j0 = Math.floor(p.z / cell) - (side >> 1);
    for (let j = 0; j < side; j++) for (let i = 0; i < side; i++) { const gi = i0 + i, gj = j0 + j; let h = (Math.imul(gi, 73856093) ^ Math.imul(gj, 19349663)) >>> 0; const r1 = (h & 1023) / 1023; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; const r2 = (h & 1023) / 1023, r3 = ((h >>> 10) & 1023) / 1023, r4 = ((h >>> 20) & 1023) / 1023;
      const x = (gi + 0.2 + r1 * 0.6) * cell, z = (gj + 0.2 + r2 * 0.6) * cell; const d = Math.hypot(x - p.x, z - p.z); if (d > R) continue; const lc = this.landAt(x, z); if (lc !== 1 && lc !== 2) continue;
      const down = TR && TR.has(Math.floor(x * 2) * 65536 + Math.floor(z * 2)) ? 0.2 : 1; // flattened where a wheel has been
      const fade = Math.min(1, (R - d) / (R * 0.25)) * down; const edge = this.landAt(x + 1.2, z) === 3 || this.landAt(x - 1.2, z) === 3 || this.landAt(x, z + 1.2) === 3 || this.landAt(x, z - 1.2) === 3;
      const sh = 0.62 + r3 * 0.3;
      if (lc === 1) { put(this.gv, (h >>> 4) & 3, x, z, r2 * 6.283, 0.8, (0.42 + r3 * 0.3) * fade, sh * 0.95 + 0.25, sh + 0.3, sh * 0.8 + 0.2); if (r4 < (edge ? 0.07 : 0.012)) put(this.wv, (h >>> 7) % 3, x + 0.15, z - 0.1, r1 * 6.283, 0.8 + r3 * 0.5, fade, 0.8, 0.85, 0.75); }
      else { if (r4 > 0.42) put(this.dv, (h >>> 4) % 3, x, z, r2 * 6.283, 1.1, (0.8 + r3 * 0.9) * fade, 1.0 * sh + 0.25, 0.86 * sh + 0.2, 0.5 * sh + 0.1); if (r4 < (edge ? 0.12 : 0.05)) put(this.wv, 3 + ((h >>> 7) % 4), x + 0.1, z + 0.12, r1 * 6.283, 0.9 + r3 * 0.9, fade, 0.8, 0.82, 0.7); } }
    for (const a of all) for (const im of a.ms) { im.count = a.n; im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; }
  }

  // ---------------------------------------------------------------- materials
  initMaterials() {
    const an = Math.min(this.q.aniso, this.renderer.capabilities.getMaxAnisotropy());
    const M = this.mats = {};
    M.ground = pbr('grass', an, { mat: { vertexColors: true, color: 0x8a9a78 } });
    M.asphalt = pbr('asphalt', an, { mat: { vertexColors: true, color: 0x9a9a9a, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 } });
    M.concrete = pbr('concrete', an, { mat: { vertexColors: true, color: new THREE.Color(1.75, 1.72, 1.64), polygonOffset: true, polygonOffsetFactor: -1.5, polygonOffsetUnits: -1.5 } });
    M.lot = M.asphalt.clone(); M.lot.color.set(0x7c7c7c); M.lot.polygonOffsetFactor = -1; M.lot.polygonOffsetUnits = -1;
    M.walk = pbr('concrete', an, { mat: { color: new THREE.Color(2.0, 1.97, 1.9), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 } });
    M.curb = new THREE.MeshStandardMaterial({ color: new THREE.Color(1.7, 1.68, 1.6), roughness: 0.95, map: M.walk.map });
    M.mark_w = new THREE.MeshStandardMaterial({ color: 0xe6e6de, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    M.mark_y = new THREE.MeshStandardMaterial({ color: 0xe0a800, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    M.roof = pbr('roof', an, { mat: { vertexColors: true, side: THREE.DoubleSide } }); M.roof.map.repeat.set(0.6, 0.6); M.roof.normalMap.repeat.set(0.6, 0.6); M.roof.roughnessMap.repeat.set(0.6, 0.6); M.roof.color.setScalar(1.5);
    M.roof_flat = new THREE.MeshStandardMaterial({ color: 0x8f8f8c, roughness: 0.95, vertexColors: true, side: THREE.DoubleSide });
    M.water = new THREE.MeshStandardMaterial({ color: 0x0c1c24, roughness: 0.06, metalness: 0.2 });
    M.bridge = new THREE.MeshStandardMaterial({ color: 0xbdb9b0, roughness: 0.9, map: M.walk.map, vertexColors: true });
    M.detail = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.05 });
    { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const g = c.getContext('2d'); g.clearRect(0, 0, 128, 128); g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 9); g.fillRect(0, 112, 128, 7); for (let i = 0; i < 4; i++) g.fillRect(i * 32 + 13, 0, 6, 119);
      const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.repeat.set(2.2, 1); M.rail = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true, roughness: 0.5, metalness: 0.6 }); }
    { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.clearRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2.2; for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.5, 2.5); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; M.chain = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.4, side: THREE.DoubleSide, vertexColors: true, roughness: 0.45, metalness: 0.7 }); }
    // window glass: dark and reflective by day; panes flagged as lit glow warm at night (colour and flag come from the builder)
    this.glassU = { uNight: { value: 1 } }; M.glass = new THREE.MeshStandardMaterial({ color: 0x0a0d10, roughness: 0.06, metalness: 0.0, envMapIntensity: 1.6, vertexColors: true });
    M.glass.onBeforeCompile = (sh) => { sh.uniforms.uNight = this.glassU.uNight; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNight;').replace('#include <color_fragment>', 'float litW = vColor.a * uNight; diffuseColor.rgb = mix(diffuseColor.rgb, vColor.rgb * 0.35, litW);').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * litW * 1.9;'); };
    // lit rooms seen through clear glass; unlit windows keep the dark reflective pane
    this.roomU = { uB: { value: 1 } }; M.room = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }); M.room.onBeforeCompile = (sh) => { sh.uniforms.uB = this.roomU.uB; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uB;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= uB * vec3(1.0, 0.86, 0.66);'); };
    M.glass_lit = new THREE.MeshStandardMaterial({ color: 0x8fa0a8, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, depthWrite: false, envMapIntensity: 1.4 });
    { const a2 = Math.min(this.q.aniso, 8); M.wall_stucco = pbr('stucco', a2, { mat: { vertexColors: true } }); for (const t of [M.wall_stucco.map, M.wall_stucco.normalMap, M.wall_stucco.roughnessMap]) t.repeat.set(0.4, 0.4); M.wall_stone = pbr('stone', a2, { mat: { vertexColors: true } }); for (const t of [M.wall_stone.map, M.wall_stone.normalMap, M.wall_stone.roughnessMap]) t.repeat.set(0.45, 0.45); }
    M.glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 5.2, 2.8), side: THREE.DoubleSide });
    this.winU = { uLit: { value: 0.3 }, uNight: { value: 1 } };
    M.wall = this.wallMaterial(pbr('brick', an, { mat: { vertexColors: true } }), 0.55, false);
    M.wall_com = this.wallMaterial(pbr('plaster', an, { mat: { vertexColors: true } }), 0.4, true);
  }
  wallMaterial(m, texScale, commercial) {
    const U = this.winU;
    m.map.repeat.set(texScale, texScale); if (m.normalMap) m.normalMap.repeat.set(texScale, texScale); if (m.roughnessMap) m.roughnessMap.repeat.set(texScale, texScale);
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uLit = U.uLit; sh.uniforms.uNight = U.uNight;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vWuv; varying float vSeed;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWuv = uv; vSeed = color.a;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec2 vWuv; varying float vSeed; uniform float uLit; uniform float uNight;
        float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
        float winMask = 0.0; float winLit = 0.0; vec3 winCol = vec3(0.0); float winFrame = 0.0;
        if (vSeed < 1.5) {
          ${commercial ? `
          float sH = 3.6; float st = floor(max(vWuv.y, 0.0) / sH); float vy = vWuv.y - st * sH; float cw = 4.2; float cx = floor(vWuv.x / cw); float ux = vWuv.x - cx * cw;
          float lo = st < 0.5 ? 0.35 : 1.0; float hi = st < 0.5 ? 2.9 : 2.5; float m0 = st < 0.5 ? 0.18 : 0.9;`
          : `
          float sH = 2.9; float st = floor(max(vWuv.y, 0.0) / sH); float vy = vWuv.y - st * sH; float cw = 3.4; float cx = floor(vWuv.x / cw); float ux = vWuv.x - cx * cw;
          float lo = 0.95; float hi = 2.3; float m0 = 0.95;`}
          float sd = floor(vSeed * 255.0 + 0.5) / 255.0;
          float rnd = h21(vec2(cx + sd * 91.7, st * 7.0 + sd * 37.3));
          float present = step(${commercial ? '0.12' : '0.3'}, rnd) * step(0.0, vWuv.y) * step(-0.5, uLit);
          float ax = smoothstep(m0, m0 + 0.03, ux) * smoothstep(cw - m0, cw - m0 - 0.03, ux);
          float ay = smoothstep(lo, lo + 0.03, vy) * smoothstep(hi, hi - 0.03, vy);
          winMask = ax * ay * present;
          float fx = smoothstep(m0 + 0.07, m0 + 0.1, ux) * smoothstep(cw - m0 - 0.07, cw - m0 - 0.1, ux); float fy = smoothstep(lo + 0.07, lo + 0.1, vy) * smoothstep(hi - 0.07, hi - 0.1, vy);
          float mull = smoothstep(0.02, 0.035, abs(ux - cw * 0.5)) * ${commercial ? '1.0' : 'smoothstep(0.02, 0.035, abs(vy - (lo + hi) * 0.5))'};
          winFrame = winMask * (1.0 - fx * fy * mull);
          float litR = h21(vec2(cx * 3.1 + sd * 17.0, st + sd * 53.0));
          winLit = winMask * (1.0 - winFrame) * step(1.0 - uLit, litR) * uNight;
          vec3 warm = mix(vec3(1.0, 0.72, 0.38), vec3(0.85, 0.9, 1.0), step(0.82, fract(litR * 7.3)));
          float blinds = 0.75 + 0.25 * step(0.5, fract(vy * 9.0)) ; float curtain = smoothstep(0.0, 0.5, abs(ux - cw * 0.5) / (cw * 0.5 - m0));
          winCol = warm * (0.55 + 0.45 * fract(litR * 13.7)) * mix(1.0, 0.55, curtain * step(0.5, fract(litR * 5.1))) * blinds;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.03, 0.04, 0.05), winMask * (1.0 - winFrame));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.75, 0.74, 0.7), winFrame);
        }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.1, winMask * (1.0 - winFrame));')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance += winCol * winLit * ${commercial ? '2.2' : '1.6'};`);
    };
    return m;
  }

  // ---------------------------------------------------------------- street furniture
  initProps() {
    const G = this.geo = {};
    // lamp: pole (8 m tall unit) + arm (2 m unit along +z)
    const pole = new THREE.CylinderGeometry(0.07, 0.11, 8, 8); pole.translate(0, 4, 0);
    const arm = new THREE.BoxGeometry(0.09, 0.09, 2); arm.translate(0, 7.95, 1);
    G.lamp = mergeGeos([pole, arm]);
    G.lum = new THREE.BoxGeometry(0.3, 0.1, 0.62);
    G.pool = new THREE.PlaneGeometry(1, 1); G.pool.rotateX(-Math.PI / 2);
    const trunk = new THREE.CylinderGeometry(0.16, 0.24, 3, 7); trunk.translate(0, 1.5, 0); G.trunk = trunk;
    const blobs = []; const rs = [[0, 4.3, 0, 2.5], [1.5, 3.7, 0.4, 1.8], [-1.3, 3.9, -0.6, 1.9], [0.2, 3.6, 1.5, 1.7], [-0.3, 5.3, -0.2, 1.7]];
    for (const [x, y, z, r] of rs) { const g = new THREE.IcosahedronGeometry(r, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const n = 1 + 0.18 * Math.sin(p.getX(i) * 3.1 + p.getY(i) * 2.3 + p.getZ(i) * 4.7); p.setXYZ(i, p.getX(i) * n, p.getY(i) * n * 0.85, p.getZ(i) * n); } g.translate(x, y, z); g.computeVertexNormals(); blobs.push(g); }
    G.canopy = mergeGeos(blobs);
    // measured trees: trunk + leaf-card crown (unit tree: 7 m tall, crown radius 2.5 m), shrubs: low card clump
    const cards = (n, cx, cy, cz, rx, ry, size, seed) => { const pos = [], nor = [], uv = [], idx = []; let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      const core = new THREE.IcosahedronGeometry(1, 1); const cp = core.attributes.position; const base0 = 0; for (let i = 0; i < cp.count; i++) { pos.push(cx + cp.getX(i) * rx * 0.62, cy + cp.getY(i) * ry * 0.62, cz + cp.getZ(i) * rx * 0.62); nor.push(cp.getX(i), cp.getY(i), cp.getZ(i)); uv.push(0.02, 0.02); } for (let i = 0; i < cp.count; i++) idx.push(i);
      for (let k = 0; k < n; k++) { const th = rnd() * 6.283, ph = Math.acos(1 - 1.7 * rnd()), rr = 0.6 + 0.4 * rnd(); const dx = Math.sin(ph) * Math.cos(th), dy = Math.cos(ph), dz = Math.sin(ph) * Math.sin(th); const px = cx + dx * rx * rr, py = cy + dy * ry * rr, pz = cz + dz * rx * rr;
        // card basis: roughly facing outward, randomly twisted
        const nrm = new THREE.Vector3(dx + (rnd() - 0.5) * 0.9, dy * 0.6 + 0.3 + (rnd() - 0.5) * 0.6, dz + (rnd() - 0.5) * 0.9).normalize(); const t = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(nrm).normalize(); const b = new THREE.Vector3().crossVectors(nrm, t); const h = size * (0.75 + 0.5 * rnd()) / 2; const v0 = pos.length / 3;
        for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { pos.push(px + (t.x * a + b.x * c) * h, py + (t.y * a + b.y * c) * h, pz + (t.z * a + b.z * c) * h); nor.push(dx * 0.75 + nrm.x * 0.25, dy * 0.75 + 0.25, dz * 0.75 + nrm.z * 0.25); uv.push(a > 0 ? 1 : 0, c > 0 ? 1 : 0); }
        idx.push(v0, v0 + 1, v0 + 2, v0, v0 + 2, v0 + 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g; };
    G.crown = cards(this.q.leafCards, 0, 4.7, 0, 2.5, 2.2, 2.6, 7); G.bush = cards(Math.max(5, this.q.leafCards >> 2), 0, 0.5, 0, 0.85, 0.5, 1.0, 13);
    const tk = new THREE.CylinderGeometry(0.1, 0.2, 3.4, 7); tk.translate(0, 1.7, 0); G.trunk2 = tk;
    const lc = document.createElement('canvas'); lc.width = lc.height = 256; const lg = lc.getContext('2d'); let ls = 99; const lr = () => { ls = (ls * 16807) % 2147483647; return ls / 2147483647; };
    for (let i = 0; i < 520; i++) { const x = 20 + lr() * 216, y = 20 + lr() * 216; const d = Math.hypot(x - 128, y - 128) / 118; if (d > 1 || lr() < d * d * 0.8) continue; const v = 150 + lr() * 105; lg.fillStyle = `rgb(${v * 0.92 | 0},${v | 0},${v * 0.86 | 0})`; lg.save(); lg.translate(x, y); lg.rotate(lr() * 6.283); lg.beginPath(); lg.ellipse(0, 0, 4 + lr() * 5, 2 + lr() * 2.5, 0, 0, 6.283); lg.fill(); lg.restore(); }
    lg.fillStyle = 'rgb(120,130,110)'; lg.fillRect(0, 236, 20, 20);
    const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 2;
    this.mats.leaf = new THREE.MeshStandardMaterial({ map: lt, alphaTest: 0.38, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 });
    // parked vehicles: generic extruded bodies (sedan / SUV) + dark glass and wheels
    const body = (pts) => { const sh = new THREE.Shape(); pts.forEach((q, i) => i ? sh.lineTo(q[0], q[1]) : sh.moveTo(q[0], q[1])); const g = new THREE.ExtrudeGeometry(sh, { depth: 1.62, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 2, curveSegments: 4 }); g.translate(0, 0, -0.81); g.rotateY(-Math.PI / 2); return g; };
    const sedan = [[-2.25, 0.3], [-2.25, 0.68], [-2.05, 0.8], [-0.95, 0.93], [-0.3, 1.38], [0.95, 1.38], [1.65, 0.98], [2.25, 0.93], [2.25, 0.3]], suv = [[-2.3, 0.34], [-2.3, 0.8], [-2.1, 0.98], [-1.1, 1.1], [-0.55, 1.68], [1.9, 1.68], [2.28, 1.1], [2.3, 0.34]];
    G.carBody = [body(sedan), body(suv)];
    const det = (roofY, beltY, f0, f1, r0, r1) => { const parts = []; const quad = (a, b2, c, d) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b2, ...c, ...d], 3)); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); return g; };
      for (const sd of [-1, 1]) { const x = sd * 0.895; const a = [x, beltY, f0 + 0.1], b2 = [x, beltY, r1 - 0.1], c = [x, roofY - 0.07, r0 - 0.05], d = [x, roofY - 0.07, f1 + 0.05]; parts.push(sd > 0 ? quad(b2, a, d, c) : quad(a, b2, c, d)); }
      parts.push(quad([-0.72, beltY + 0.02, f0 - 0.03], [0.72, beltY + 0.02, f0 - 0.03], [0.66, roofY - 0.04, f1 - 0.03], [-0.66, roofY - 0.04, f1 - 0.03]).applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.012, -0.012))); parts.push(quad([0.72, beltY + 0.02, r1 + 0.03], [-0.72, beltY + 0.02, r1 + 0.03], [-0.66, roofY - 0.04, r0 + 0.03], [0.66, roofY - 0.04, r0 + 0.03]).applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.012, 0.012)));
      for (const [wx, wz] of [[-0.82, -1.4], [0.82, -1.4], [-0.82, 1.38], [0.82, 1.38]]) { const w = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 14); w.rotateZ(Math.PI / 2); w.translate(wx, 0.33, wz); parts.push(w); }
      return mergeGeos(parts); };
    G.carDet = [det(1.38, 0.95, -0.95, -0.3, 0.95, 1.65), det(1.68, 1.12, -1.1, -0.55, 1.9, 2.28)];
    this.mats.carPaint = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 }); this.mats.carDark = new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.18, metalness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.5 });
    // fence panel (wooden privacy fence)
    const fc = document.createElement('canvas'); fc.width = 256; fc.height = 256; const fg = fc.getContext('2d'); for (let i = 0; i < 12; i++) { const v = 96 + ((i * 53) % 37); fg.fillStyle = `rgb(${v + 22},${v + 6},${v - 14})`; fg.fillRect(i * 21.4, 0, 20.2, 256); fg.fillStyle = 'rgba(40,28,18,0.55)'; fg.fillRect(i * 21.4 + 20.2, 0, 1.4, 256); for (let k = 0; k < 14; k++) { fg.fillStyle = `rgba(${40 + (k * 31 + i * 7) % 50},30,20,0.16)`; fg.fillRect(i * 21.4 + ((k * 7) % 18), (k * 53 + i * 29) % 256, 2, 30 + (k * 13) % 50); } } fg.fillStyle = 'rgba(30,22,14,0.5)'; fg.fillRect(0, 40, 256, 7); fg.fillRect(0, 205, 256, 7);
    const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4; { const pm = pbr('planks', 4); for (const t of [pm.map, pm.normalMap, pm.roughnessMap]) { t.rotation = Math.PI / 2; t.repeat.set(1, 1.3); } pm.color.set(0xb8a48c); this.mats.fence = pm; } G.fence = new THREE.BoxGeometry(2.7, 1, 0.05); G.fence.translate(0, 0.5, 0);
    // street furniture (vertex-coloured boxes): bench, bin, dog-waste station, grill, fountain, toilet hut, bike rack, gate arm, fuel pump
    const kit = (parts) => { const gs = parts.map(([w, h, d, x, y, z, c]) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); const n = g.attributes.position.count; const col = new Float32Array(n * 3); for (let i = 0; i < n; i++) { col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; }); const m = mergeGeos(gs); const cols = new Float32Array(m.attributes.position.count * 3); let o = 0; for (const g of gs) { cols.set(g.attributes.color.array, o); o += g.attributes.color.array.length; } m.setAttribute('color', new THREE.BufferAttribute(cols, 3)); return m; };
    const BK = [0.04, 0.04, 0.045], WD = [0.3, 0.2, 0.12], GN = [0.05, 0.25, 0.1], GY = [0.45, 0.46, 0.47], TN = [0.55, 0.48, 0.38], RD = [0.6, 0.07, 0.06], WH = [0.85, 0.85, 0.83];
    G.furn = [
      kit([[1.5, 0.05, 0.42, 0, 0.45, 0, WD], [1.5, 0.36, 0.04, 0, 0.72, -0.2, WD], [0.05, 0.45, 0.4, -0.65, 0.225, 0, BK], [0.05, 0.45, 0.4, 0.65, 0.225, 0, BK], [0.05, 0.5, 0.05, -0.65, 0.68, -0.2, BK], [0.05, 0.5, 0.05, 0.65, 0.68, -0.2, BK]]),
      kit([[0.5, 0.85, 0.5, 0, 0.425, 0, BK], [0.56, 0.06, 0.56, 0, 0.88, 0, GY]]),
      kit([[0.06, 1.3, 0.06, 0, 0.65, 0, GN], [0.3, 0.4, 0.2, 0, 1.2, 0.06, GN], [0.26, 0.2, 0.02, 0, 1.24, 0.17, WH]]),
      kit([[0.07, 0.85, 0.07, 0, 0.42, 0, BK], [0.5, 0.2, 0.36, 0, 0.92, 0, BK], [0.46, 0.02, 0.32, 0, 1.03, 0, GY]]),
      kit([[0.3, 0.9, 0.3, 0, 0.45, 0, GY], [0.42, 0.08, 0.42, 0, 0.94, 0, [0.6, 0.62, 0.64]]]),
      kit([[1.7, 2.3, 1.7, 0, 1.15, 0, TN], [2.0, 0.12, 2.0, 0, 2.36, 0, [0.25, 0.2, 0.17]], [0.8, 1.95, 0.04, 0, 0.98, 0.86, [0.2, 0.25, 0.3]]]),
      kit([0, 1, 2].flatMap(i => [[0.04, 0.8, 0.04, -0.3, 0.4, i * 0.6 - 0.6, GY], [0.04, 0.8, 0.04, 0.3, 0.4, i * 0.6 - 0.6, GY], [0.64, 0.04, 0.04, 0, 0.8, i * 0.6 - 0.6, GY]])),
      kit([[0.14, 1.15, 0.14, 0, 0.575, 0, GY], [1, 0.08, 0.08, 0.5, 1.0, 0, WH], [0.12, 0.09, 0.09, 0.3, 1.0, 0, RD], [0.12, 0.09, 0.09, 0.7, 1.0, 0, RD]]),
      kit([[1.2, 0.16, 3.2, 0, 0.08, 0, GY], [0.55, 1.75, 0.9, 0, 1.03, 0, WH], [0.57, 0.5, 0.7, 0, 1.45, 0, BK], [0.6, 0.25, 0.94, 0, 2.0, 0, RD], [0.12, 0.9, 0.12, 0, 0.6, -1.35, [0.8, 0.7, 0.1]], [0.12, 0.9, 0.12, 0, 0.6, 1.35, [0.8, 0.7, 0.1]]]),
      kit([[0.09, 1.05, 0.09, 0, 0.525, 0, WD], [0.2, 0.22, 0.48, 0, 1.15, 0, BK], [0.02, 0.14, 0.02, 0.11, 1.2, -0.1, RD]]),
      kit([[0.24, 0.5, 0.24, 0, 0.25, 0, RD], [0.3, 0.1, 0.3, 0, 0.55, 0, RD], [0.16, 0.16, 0.16, 0, 0.68, 0, RD], [0.5, 0.12, 0.12, 0, 0.4, 0, RD], [0.12, 0.12, 0.34, 0, 0.36, 0.1, [0.75, 0.75, 0.7]]]),
      kit([[0.58, 0.95, 0.68, 0, 0.6, 0, [0.05, 0.12, 0.3]], [0.62, 0.06, 0.74, 0, 1.1, 0, [0.04, 0.09, 0.24]], [0.08, 0.26, 0.26, -0.3, 0.13, 0.3, BK], [0.08, 0.26, 0.26, 0.3, 0.13, 0.3, BK]]),
      kit([[0.58, 0.95, 0.68, 0, 0.6, 0, [0.07, 0.16, 0.08]], [0.62, 0.06, 0.74, 0, 1.1, 0, [0.05, 0.12, 0.06]], [0.08, 0.26, 0.26, -0.3, 0.13, 0.3, BK], [0.08, 0.26, 0.26, 0.3, 0.13, 0.3, BK]]),
    ];
    this.mats.wire = new THREE.LineBasicMaterial({ color: 0x08090a, transparent: true, opacity: 0.85 });
    this.mats.furn = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.15 });
    // sign faces: one atlas for speed limits, per-chunk atlases for street names
    const sv = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]; const ac = document.createElement('canvas'); ac.width = 512; ac.height = 480; const ag = ac.getContext('2d'); this.speedVals = sv;
    sv.forEach((v, i) => { const x = (i % 4) * 128, y = Math.floor(i / 4) * 160; ag.fillStyle = '#f4f4f0'; ag.fillRect(x, y, 128, 160); ag.strokeStyle = '#111'; ag.lineWidth = 5; ag.strokeRect(x + 7, y + 7, 114, 146); ag.fillStyle = '#111'; ag.textAlign = 'center'; ag.font = 'bold 24px Arial'; ag.fillText('SPEED', x + 64, y + 42); ag.fillText('LIMIT', x + 64, y + 68); ag.font = 'bold 74px Arial'; ag.fillText(String(v), x + 64, y + 140); });
    const at = new THREE.CanvasTexture(ac); at.colorSpace = THREE.SRGBColorSpace; at.anisotropy = 4; this.mats.speed = new THREE.MeshStandardMaterial({ map: at, roughness: 0.4, emissive: 0xffffff, emissiveMap: at, emissiveIntensity: 0.05 });
    const post = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6); post.translate(0, 1.1, 0); G.post = post;
    const oct = new THREE.CircleGeometry(0.4, 8, Math.PI / 8); oct.translate(0, 2.25, 0.035); G.oct = oct;
    const M = this.mats;
    M.metal = new THREE.MeshStandardMaterial({ color: 0x55585c, roughness: 0.55, metalness: 0.7 });
    M.lum = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.2, 4.0), toneMapped: true });
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.14)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const pt = new THREE.CanvasTexture(c); pt.colorSpace = THREE.SRGBColorSpace;
    M.pool = new THREE.MeshBasicMaterial({ map: pt, color: new THREE.Color(1.0, 0.82, 0.58), transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 });
    M.trunk = pbr('bark', 2, { mat: { color: 0x9a8a78 } });
    M.canopy = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
    const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sg = sc.getContext('2d'); sg.fillStyle = '#b3121b'; sg.fillRect(0, 0, 256, 256); sg.strokeStyle = '#fff'; sg.lineWidth = 10; sg.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; const x = 128 + Math.cos(a) * 116, y = 128 + Math.sin(a) * 116; i ? sg.lineTo(x, y) : sg.moveTo(x, y); } sg.closePath(); sg.stroke(); sg.fillStyle = '#fff'; sg.font = 'bold 76px Arial'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText('STOP', 128, 134);
    const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
    M.stop = new THREE.MeshStandardMaterial({ map: st, roughness: 0.35, emissive: 0x330000, emissiveMap: st, emissiveIntensity: 0.25 });
  }
  buildProps(key, group) {
    const b = this.props.get(key); if (!b) return; const G = this.geo, M = this.mats; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
    if (b.lamps.length) {
      const H = [7.6, 10, 11.5], AR = [1.9, 2.9, 2.6];
      const poles = new THREE.InstancedMesh(G.lamp, M.metal, b.lamps.length), lum = new THREE.InstancedMesh(G.lum, M.lum, b.lamps.length), pool = new THREE.InstancedMesh(G.pool, M.pool, b.lamps.length);
      b.lamps.forEach((l, i) => { const h = H[l[4]], a = AR[l[4]]; q.setFromAxisAngle(Y, l[3]); m4.compose(p.set(l[0], l[1], l[2]), q, s.set(1, h / 8, a / 2)); poles.setMatrixAt(i, m4);
        const dx = Math.sin(l[3]) * a, dz = Math.cos(l[3]) * a; m4.compose(p.set(l[0] + dx, l[1] + h * 0.994 - 0.07, l[2] + dz), q, s.set(1, 1, 1)); lum.setMatrixAt(i, m4);
        const px = l[0] + dx * 1.3, pz = l[2] + dz * 1.3; const R = l[4] === 0 ? 30 : 38; m4.compose(p.set(px, this.surfaceY(px, pz, l[1] + 1) + 0.1, pz), q.identity(), s.set(R, 1, R)); pool.setMatrixAt(i, m4);
        l.lx = l[0] + dx; l.ly = l[1] + h - 0.15; l.lz = l[2] + dz; });
      { const gp = new Float32Array(b.lamps.length * 3); b.lamps.forEach((l, i) => { gp[i * 3] = l.lx; gp[i * 3 + 1] = l.ly - 0.1; gp[i * 3 + 2] = l.lz; }); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); if (!M.glare) M.glare = new THREE.PointsMaterial({ map: M.pool.map, size: 3.4, sizeAttenuation: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(1, 0.86, 0.62) }); const pts = new THREE.Points(gg, M.glare); pts.userData.night = true; pts.visible = this.nightAmount > 0.5; group.add(pts); }
      pool.renderOrder = 2; lum.userData.night = pool.userData.night = true; pool.visible = lum.visible = this.nightAmount > 0.5;
      for (const o of [poles, lum, pool]) { o.computeBoundingSphere(); group.add(o); }
      if (this.q.shadows) poles.castShadow = true;
    }
    if (this.measured) {
      const col = new THREE.Color(); const tint = (r, g2, bl, o) => { col.setRGB(r / 255, g2 / 255, bl / 255, THREE.SRGBColorSpace); const mx = Math.max(col.r, col.g, col.b, 0.01); const k = Math.min(2.4, 0.2 / mx); col.multiplyScalar(k); col.g = Math.max(col.g, col.r * 1.18, col.b * 1.4); return col; };
      const spOf = (t) => { const h = Math.abs(Math.floor(t[0] * 13.7 + t[2] * 7.3)) % 20; return h < 9 ? 0 : 1 + (h % 4); }; // 45% jacaranda (a model up close), the rest four other scanned species as photographed cards
      if (b.trees.length && this.cards) { for (let sp = 0; sp < this.cards.length; sp++) { const list = b.trees.filter(t => spOf(t) === sp); if (!list.length) continue; const C = this.cards[sp]; for (const v of [0, 1]) { const im = new THREE.InstancedMesh(this.cardGeo[v], C.mats[v], list.length); list.forEach((t, i) => { const hh = sp === 0 ? t[3] : Math.max(3.5, t[3]); q.setFromAxisAngle(Y, (t[0] * 12.9898 + t[2] * 78.233) % 6.283); const wd = Math.min(hh * C.ar, Math.max(hh * 0.8, t[4] * 2.3)); m4.compose(p.set(t[0], t[1] - 0.2, t[2]), q, s.set(wd, hh, wd)); im.setMatrixAt(i, m4); }); im.computeBoundingSphere(); im.userData.veg = true; if (sp === 0) im.userData.lod = 'lo'; if (this.q.shadows && sp !== 0) im.castShadow = true; group.add(im); } } }
      if (b.trees.length && this.kit.tree_hi) { const jl = this.cards ? b.trees.filter(t => spOf(t) === 0) : b.trees; for (const lod of (this.cards ? ['hi'] : ['hi', 'lo'])) { if (!jl.length) break; const K = this.kitInst('tree_' + lod, jl.length); jl.forEach((t, i) => { const hh = t[3], rr = t[4]; q.setFromAxisAngle(Y, (t[0] * 12.9898 + t[2] * 78.233) % 6.283); const sxz = Math.max(hh * 0.7, Math.min(hh * 1.5, rr / 0.5)); m4.compose(p.set(t[0], t[1] - 0.15, t[2]), q, s.set(sxz, hh, sxz)); const v = 0.72 + (((t[0] * 3.3 + t[2] * 7.7) % 1 + 1) % 1) * 0.3; col.setRGB(v, v, v * 0.95); K.set(i, m4, col); }); K.done(group, { veg: true, lod, shadow: lod === 'hi' }); if (lod === 'lo') for (const m of K.ms) m.castShadow = false; } }
      else if (b.trees.length) { const tr = new THREE.InstancedMesh(G.trunk2, M.trunk, b.trees.length), ca = new THREE.InstancedMesh(G.crown, M.leaf, b.trees.length);
        b.trees.forEach((t, i) => { const hh = t[3], rr = t[4]; q.setFromAxisAngle(Y, (t[0] * 12.9898 + t[2] * 78.233) % 6.283); const sxz = rr / 2.5, sy = hh / 7; m4.compose(p.set(t[0], t[1] - 0.1, t[2]), q, s.set(sxz, sy, sxz)); ca.setMatrixAt(i, m4); m4.compose(p, q, s.set(Math.min(2.2, 0.6 + hh * 0.07), sy, Math.min(2.2, 0.6 + hh * 0.07))); tr.setMatrixAt(i, m4); ca.setColorAt(i, tint(t[5], t[6], t[7])); });
        for (const o of [tr, ca]) { o.computeBoundingSphere(); o.userData.veg = true; group.add(o); if (this.q.shadows) o.castShadow = true; } }
      if (b.bushes.length && this.kit.shrub_0) { for (let k = 0; k < 4; k++) { const list = b.bushes.filter((t, i) => (Math.abs(Math.floor(t[0] * 3 + t[2] * 5)) % 4) === k); if (!list.length) continue; const K = this.kitInst('shrub_' + k, list.length); list.forEach((t, i) => { q.setFromAxisAngle(Y, (t[0] * 3.7 + t[2] * 9.1) % 6.283); const hh = Math.max(0.6, t[3]) * 1.15; m4.compose(p.set(t[0], t[1] - 0.05, t[2]), q, s.set(hh, hh, hh)); K.set(i, m4); }); K.done(group, { veg: true }); } }
      else if (b.bushes.length) { const bu = new THREE.InstancedMesh(G.bush, M.leaf, b.bushes.length);
        b.bushes.forEach((t, i) => { q.setFromAxisAngle(Y, (t[0] * 3.7 + t[2] * 9.1) % 6.283); const w = 1.15 + ((t[0] * 5.3) % 1 + 1) % 1 * 0.3; m4.compose(p.set(t[0], t[1] - 0.05, t[2]), q, s.set(w, Math.max(0.5, t[3]), w)); bu.setMatrixAt(i, m4); bu.setColorAt(i, tint(t[4], t[5], t[6])); });
        bu.computeBoundingSphere(); bu.userData.veg = true; group.add(bu); if (this.q.shadows) bu.castShadow = true; }
    } else if (b.trees.length) {
      const tr = new THREE.InstancedMesh(G.trunk, M.trunk, b.trees.length), ca = new THREE.InstancedMesh(G.canopy, M.canopy, b.trees.length); const col = new THREE.Color();
      b.trees.forEach((t, i) => { const sc = t[3]; q.setFromAxisAngle(Y, (t[0] * 12.9898 + t[2] * 78.233) % 6.283); const w = 0.85 + 0.3 * ((t[0] * 7.13) % 1 + 1) % 1; m4.compose(p.set(t[0], t[1] - 0.1, t[2]), q, s.set(sc * w, sc, sc * w)); tr.setMatrixAt(i, m4); ca.setMatrixAt(i, m4);
        const v = t[4]; col.setRGB(0.12 + v * 0.03, 0.2 + v * 0.035, 0.08 + v * 0.01); ca.setColorAt(i, col); });
      for (const o of [tr, ca]) { o.computeBoundingSphere(); group.add(o); if (this.q.shadows) o.castShadow = true; }
    }
    if (b.poles.length) { if (!G.upole) { const a = new THREE.CylinderGeometry(0.1, 0.15, 1, 7); a.translate(0, 0.5, 0); const c = new THREE.BoxGeometry(2.2, 0.012, 0.1); c.translate(0, 0.93, 0); G.upole = mergeGeos([a, c]); M.wood = new THREE.MeshStandardMaterial({ color: 0x4a3a2c, roughness: 0.95 }); }
      const po = new THREE.InstancedMesh(G.upole, M.wood, b.poles.length); b.poles.forEach((t, i) => { q.setFromAxisAngle(Y, (t[0] * 1.7 + t[2]) % 3.14); m4.compose(p.set(t[0], t[1] - 0.2, t[2]), q, s.set(1, t[3] + 0.2, 1)); po.setMatrixAt(i, m4); }); po.computeBoundingSphere(); group.add(po); if (this.q.shadows) po.castShadow = true; }
    const KITF = { 0: ['bench', 1.25], 1: ['trashcan', 1], 10: ['hydrant', 1] };
    if (b.furn.length) for (let ty = 0; ty < G.furn.length; ty++) { const list = b.furn.filter(f => f[4] === ty); if (!list.length) continue;
        if (KITF[ty] && this.kit[KITF[ty][0]]) { const K = this.kitInst(KITF[ty][0], list.length); list.forEach((f, i) => { q.setFromAxisAngle(Y, f[3] + (ty === 10 ? f[0] : 0)); const sc = KITF[ty][1]; m4.compose(p.set(f[0], this.surfaceY(f[0], f[2], f[1] + 1), f[2]), q, s.set(sc, sc, sc)); K.set(i, m4); }); K.done(group, { veg: true }); continue; }
        const im = new THREE.InstancedMesh(G.furn[ty], M.furn, list.length);
        list.forEach((f, i) => { let x = f[0], z = f[2], yaw = f[3]; s.set(1, 1, 1); if (ty === 7) { const hw = (f[5] || 6) / 2 + 0.4; x += Math.sin(yaw) * hw; z += Math.cos(yaw) * hw; yaw -= Math.PI; s.set((f[5] || 6) / 2, 1, 1); } q.setFromAxisAngle(Y, yaw); m4.compose(p.set(x, this.surfaceY(x, z, f[1] + 1), z), q, s); im.setMatrixAt(i, m4); });
        im.computeBoundingSphere(); im.userData.veg = true; group.add(im); if (this.q.shadows) im.castShadow = true; }
    if (b.wires.length) { const pos = []; for (const wv of b.wires) { const dx = wv[3] - wv[0], dz = wv[5] - wv[2]; const l = Math.hypot(dx, dz) || 1; const nx = -dz / l, nz = dx / l; const sag = Math.min(1.6, l * l / 900); for (const off of [-0.9, 0, 0.9]) for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6; for (const t of [t0, t1]) pos.push(wv[0] + dx * t + nx * off, wv[1] + (wv[4] - wv[1]) * t - sag * 4 * t * (1 - t), wv[2] + dz * t + nz * off); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); group.add(new THREE.LineSegments(g, M.wire)); }
    if (b.panels.length) this.buildPanels(b.panels, group);
    const loFleet = this.fleet.filter(f => f.lo); const nPark = this.carMats ? this.carMats.length + loFleet.length * 2 : 0;
    if (b.parked.length && this.carGeo) { for (let v = this.carMats.length; v < nPark; v++) { const f = loFleet[(v - this.carMats.length) % loFleet.length]; const list = b.parked.filter(c => (Math.abs(Math.floor(c[0] * 3.1 + c[2] * 1.7)) % nPark) === v); if (!list.length) continue; for (const part of f.lo) { const im = new THREE.InstancedMesh(part.geo, part.mat, list.length); list.forEach((c, i) => { q.setFromAxisAngle(Y, c[3] + ((Math.floor(c[0] * 7.3) & 1) ? Math.PI : 0)); m4.compose(p.set(c[0], this.surfaceY(c[0], c[2], c[1] + 1), c[2]), q, s.set(1, 1, 1)); im.setMatrixAt(i, m4); }); im.computeBoundingSphere(); im.userData.veg = true; group.add(im); if (this.q.shadows) im.castShadow = true; } }
      for (let v = 0; v < this.carMats.length; v++) { const list = b.parked.filter(c => (Math.abs(Math.floor(c[0] * 3.1 + c[2] * 1.7)) % nPark) === v); if (!list.length) continue; const im = new THREE.InstancedMesh(this.carGeo, this.carMats[v], list.length);
        list.forEach((c, i) => { q.setFromAxisAngle(Y, c[3] + ((Math.floor(c[0] * 7.3) & 1) ? Math.PI : 0)); const L = Math.max(0.94, Math.min(1.15, c[4] / 4.2)); m4.compose(p.set(c[0], this.surfaceY(c[0], c[2], c[1] + 1), c[2]), q, s.set(L, Math.max(0.95, Math.min(1.25, c[5] / 1.45)), L)); im.setMatrixAt(i, m4); });
        im.computeBoundingSphere(); im.userData.veg = true; group.add(im); if (this.q.shadows) { im.castShadow = true; im.receiveShadow = true; } } }
    else if (b.parked.length) { const col = new THREE.Color(); for (const ty of [0, 1]) { const list = b.parked.filter(c => (c[5] > 1.72 ? 1 : 0) === ty); if (!list.length) continue; const bo = new THREE.InstancedMesh(G.carBody[ty], M.carPaint, list.length), de = new THREE.InstancedMesh(G.carDet[ty], M.carDark, list.length);
        list.forEach((c, i) => { q.setFromAxisAngle(Y, c[3] + ((Math.floor(c[0] * 7.3) & 1) ? Math.PI : 0)); const L = c[4] / (ty ? 4.6 : 4.5); m4.compose(p.set(c[0], this.surfaceY(c[0], c[2], c[1] + 1), c[2]), q, s.set(1, 1, L)); bo.setMatrixAt(i, m4); de.setMatrixAt(i, m4); col.setRGB(c[6] / 255, c[7] / 255, c[8] / 255, THREE.SRGBColorSpace); const mx = Math.max(col.r, col.g, col.b), mn = Math.min(col.r, col.g, col.b); if (mx - mn < 0.08) { const v = mx > 0.45 ? 0.85 : mx > 0.2 ? 0.35 : 0.03; col.setRGB(v, v, v * 1.02); } bo.setColorAt(i, col); });
        for (const o of [bo, de]) { o.computeBoundingSphere(); o.userData.veg = true; group.add(o); if (this.q.shadows) { o.castShadow = true; o.receiveShadow = true; } } } }
    if (b.fences.length) { const fe = new THREE.InstancedMesh(G.fence, M.fence, b.fences.length); b.fences.forEach((f, i) => { q.setFromAxisAngle(Y, -f[3]); m4.compose(p.set(f[0] + 0.5, f[1] - 0.15, f[2] + 0.5), q, s.set(1, f[4] + 0.15, 1)); fe.setMatrixAt(i, m4); }); fe.computeBoundingSphere(); fe.userData.veg = true; group.add(fe); if (this.q.shadows) fe.castShadow = true; }
    if (b.signs.length) {
      const po = new THREE.InstancedMesh(G.post, M.metal, b.signs.length), oc = new THREE.InstancedMesh(G.oct, M.stop, b.signs.length);
      b.signs.forEach((g, i) => { q.setFromAxisAngle(Y, g[3]); m4.compose(p.set(g[0], g[1], g[2]), q, s.set(1, 1, 1)); po.setMatrixAt(i, m4); oc.setMatrixAt(i, m4); });
      for (const o of [po, oc]) { o.computeBoundingSphere(); group.add(o); }
    }
  }
  // street-name blades (type 1: [x,y,z,1,yawA,nameA,yawB,nameB]) and speed-limit plates (type 2: [x,y,z,2,yaw,value])
  buildPanels(list, group) {
    const names = list.filter(q => q[3] === 1), speeds = list.filter(q => q[3] === 2); const G = this.geo, M = this.mats; const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1.36, 1), p = new THREE.Vector3();
    const posted = list.filter(q => q[3] !== 3); if (posted.length) { const posts = new THREE.InstancedMesh(G.post, M.metal, posted.length); posted.forEach((q, i) => { m4.compose(p.set(q[0], q[1], q[2]), qt.identity(), q[3] === 1 ? one : new THREE.Vector3(q[3] === 5 ? 2.4 : 1, q[3] === 5 ? 0.75 : 1.05, 1)); posts.setMatrixAt(i, m4); }); posts.computeBoundingSphere(); group.add(posts); }
    const quad = (pos, uv, idx, cx, cy, cz, yaw, w, h, u0, v0, u1, v1) => { const c = Math.cos(yaw), s = Math.sin(yaw); for (const side of [1, -1]) { const b = pos.length / 3; const nx = s * side, nz = c * side; const ox = nx * 0.012, oz = nz * 0.012; const rx = c * side, rz = -s * side;
        for (const [a, d] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { pos.push(cx + rx * a * w / 2 + ox, cy + d * h / 2, cz + rz * a * w / 2 + oz); uv.push(a < 0 ? u0 : u1, d < 0 ? v0 : v1); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); } };
    const mk = (pos, uv, idx, mat) => { if (!idx.length) return; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); group.add(new THREE.Mesh(g, mat)); };
    if (names.length) { const cells = Math.min(64, names.length * 2); const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 64 * Math.ceil(cells / 4); const g = cv.getContext('2d'); const pos = [], uv = [], idx = []; let k = 0;
      const blade = (text, x, y, z, yaw) => { if (k >= cells) return; const cx = (k % 4) * 256, cy = Math.floor(k / 4) * 64; g.fillStyle = '#0b6b3a'; g.fillRect(cx, cy, 256, 64); g.strokeStyle = '#e9efe9'; g.lineWidth = 3; g.strokeRect(cx + 3, cy + 3, 250, 58); g.fillStyle = '#f4f7f4'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 30; g.font = `bold ${fs}px Arial`; const t = text.replace(/\bStreet\b/, 'St').replace(/\bDrive\b/, 'Dr').replace(/\bLane\b/, 'Ln').replace(/\bRoad\b/, 'Rd').replace(/\bTrail\b/, 'Trl').replace(/\bParkway\b/, 'Pkwy').replace(/\bBoulevard\b/, 'Blvd').replace(/\bCourt\b/, 'Ct').replace(/\bNorth\b/, 'N').replace(/\bAvenue\b/, 'Ave').replace(/\bCircle\b/, 'Cir').replace(/\bPlace\b/, 'Pl').replace(/\bWay\b/, 'Way'); while (g.measureText(t).width > 236 && fs > 14) { fs -= 2; g.font = `bold ${fs}px Arial`; } g.fillText(t, cx + 128, cy + 34);
        const H = cv.height; quad(pos, uv, idx, x, y, z, yaw, 0.92, 0.2, cx / 1024, 1 - (cy + 64) / H, (cx + 256) / 1024, 1 - cy / H); k++; };
      for (const q of names) { blade(q[5], q[0], q[1] + 2.72, q[2], q[4]); blade(q[7], q[0], q[1] + 2.94, q[2], q[6]); }
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; const mat = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.4, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: 0.06 }); mat.userData.ownTex = tx; mk(pos, uv, idx, mat); }
    const texty = list.filter(q => q[3] >= 3).slice(0, 48);
    if (texty.length) { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 128 * Math.ceil(texty.length / 2); const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); const pos = [], uv = [], idx = []; const Hc = cv.height; const css = (c) => `rgb(${c.map(v => Math.round(v * 255)).join(',')})`;
      const fit = (t, x, y, maxW, size, weight = 'bold') => { let fs = size; g.font = `${weight} ${fs}px Arial`; while (g.measureText(t).width > maxW && fs > 12) { fs -= 2; g.font = `${weight} ${fs}px Arial`; } g.fillText(t, x, y); };
      texty.forEach((q, k) => { const cx = (k % 2) * 512, cy = Math.floor(k / 2) * 128; const ty = q[3]; g.textAlign = 'center'; g.textBaseline = 'middle'; let w = 1, h = 1, y = q[1];
        if (ty === 3) { g.fillStyle = css(q[7] || [0.1, 0.1, 0.1]); g.fillRect(cx, cy, 512, 128); g.fillStyle = '#fff'; fit(q[5], cx + 256, cy + 66, 480, 76); w = q[6]; h = Math.min(1.3, w * 0.25); }
        else if (ty === 4) { g.fillStyle = '#c8102e'; g.beginPath(); g.moveTo(cx + 196, cy + 4); g.lineTo(cx + 316, cy + 4); g.lineTo(cx + 256, cy + 124); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx + 216, cy + 16); g.lineTo(cx + 296, cy + 16); g.lineTo(cx + 256, cy + 98); g.closePath(); g.fill(); g.fillStyle = '#c8102e'; g.font = 'bold 15px Arial'; g.fillText('YIELD', cx + 256, cy + 36); w = 3.4; h = 0.85; y = q[1] + 2.2; }
        else if (ty === 5) { g.fillStyle = '#3b2a1c'; g.fillRect(cx, cy, 512, 128); g.strokeStyle = '#e8dcc0'; g.lineWidth = 5; g.strokeRect(cx + 6, cy + 6, 500, 116); g.fillStyle = '#f0e6cc'; fit(q[5], cx + 256, cy + 50, 470, 56); fit(q[6] || '', cx + 256, cy + 100, 470, 24, 'normal'); w = 2.2; h = 0.55; y = q[1] + 1.35; }
        else { g.fillStyle = '#0b4f9e'; g.fillRect(cx + 160, cy, 192, 128); g.fillStyle = '#fff'; g.font = 'bold 46px Arial'; g.fillText('BUS', cx + 256, cy + 44); fit(q[6] || 'STOP', cx + 256, cy + 96, 180, 20); w = 1.6; h = 0.4 * 1.0; y = q[1] + 2.2; }
        quad(pos, uv, idx, q[0], y, q[2], q[4], w, h, cx / 1024, 1 - (cy + 128) / Hc, (cx + 512) / 1024, 1 - cy / Hc); });
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; const mat = new THREE.MeshStandardMaterial({ map: tx, alphaTest: 0.5, roughness: 0.5, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: 0.75 }); mat.userData.ownTex = tx; mk(pos, uv, idx, mat); }
    if (speeds.length) { const pos = [], uv = [], idx = []; for (const q of speeds) { let i = this.speedVals.indexOf(q[5]); if (i < 0) continue; const u0 = (i % 4) / 4, v1 = 1 - Math.floor(i / 4) / 3; quad(pos, uv, idx, q[0], q[1] + 1.95, q[2], q[4], 0.6, 0.75, u0, v1 - 1 / 3, u0 + 0.25, v1); } mk(pos, uv, idx, M.speed); }
  }
  // ground material with this chunk's aerial photograph, modulated by a close-up detail texture
  groundMaterial(key, cx, cz) {
    const base = this.mats.ground; const m = base.clone(); m.color.set(0xffffff); const U = { uAerial: { value: null }, uC: { value: new THREE.Vector2(cx, cz) }, uSize: { value: this.meta.chunk }, uHas: { value: 0 } };
    texLoader.load(A + 'world/a_' + key + '.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = this.q.aniso; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; U.uAerial.value = t; U.uHas.value = 1; m.userData.ownTex = t; });
    m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vAer; uniform vec2 uC; uniform float uSize;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 wpA = modelMatrix * vec4(transformed, 1.0); vAer = vec2((wpA.x - uC.x) / uSize + 0.5, 0.5 - (wpA.z - uC.y) / uSize);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vAer; uniform sampler2D uAerial; uniform float uHas;').replace('#include <map_fragment>', `vec4 detA = texture2D(map, vMapUv); float dl = dot(detA.rgb, vec3(0.3333)) / 0.2;
        if (uHas > 0.5) { vec3 aer = texture2D(uAerial, clamp(vAer, 0.001, 0.999)).rgb; float al = dot(aer, vec3(0.3333)); aer = mix(vec3(al), aer, 1.45); vec3 base = pow(max(aer, 0.0), vec3(1.12)) * 0.66 * mix(1.0, clamp(dl, 0.45, 1.7), 0.5);
          // close to the viewer, living lawn shows the photographed grass itself rather than the blurred aerial pixel
          float gness = clamp((aer.g - max(aer.r, aer.b)) * 9.0 + 0.35, 0.0, 1.0); float nearV = 1.0 - smoothstep(18.0, 60.0, length(vViewPosition)); diffuseColor.rgb = mix(base, detA.rgb * vec3(0.95, 1.05, 0.8) * (0.55 + al * 1.6), gness * nearV * 0.8); } else { diffuseColor *= detA * vec4(0.54, 0.6, 0.47, 1.0); }`); };
    m.customProgramCacheKey = () => 'groundAerial'; return m;
  }
  // instanced copies of a scanned kit model (one InstancedMesh per material)
  kitInst(name, count) { const parts = this.kit[name]; if (!parts || !parts.length) return null; const ms = parts.map(p => { const m = new THREE.InstancedMesh(p.geo, p.mat, count); m.frustumCulled = true; return m; }); return { ms, set: (i, m4, col) => { for (const m of ms) { m.setMatrixAt(i, m4); if (col) m.setColorAt(i, col); } }, done: (group, flags = {}) => { for (const m of ms) { m.computeBoundingSphere(); Object.assign(m.userData, flags); if (this.q.shadows && flags.shadow !== false) m.castShadow = true; group.add(m); } } }; }
  surfaceY(x, z, yRef) { const o = this._tmpS || (this._tmpS = {}); return this.surface(x, z, yRef, o).y; }

  initSignals() {
    const S = this.meta.signals; if (!S.length) return; const geos = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    this.bulbs = new THREE.InstancedMesh(new THREE.CircleGeometry(0.115, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }), S.length * 6); this.bulbInfo = [];
    let bi = 0;
    for (const s of S) {
      const arm = s[5]; q.setFromAxisAngle(Y, s[3]); m4.compose(p.set(s[0], s[1], s[2]), q, one);
      const pole = new THREE.CylinderGeometry(0.1, 0.15, 6.2, 8); pole.translate(0, 3.1, 0);
      const ar = new THREE.CylinderGeometry(0.06, 0.08, arm, 6); ar.rotateZ(Math.PI / 2); ar.translate(-arm / 2, 5.9, 0);
      const heads = [[-arm + 0.5, 5.35], [0.32, 3.3]];
      const parts = [pole, ar];
      for (const [hx, hy] of heads) { const hb = new THREE.BoxGeometry(0.36, 1.08, 0.24); hb.translate(hx, hy, 0.02); parts.push(hb);
        for (let k = 0; k < 3; k++) { const lp = new THREE.Vector3(hx, hy + 0.34 - k * 0.34, 0.145).applyMatrix4(m4); const bm = new THREE.Matrix4().compose(lp, q, one); this.bulbs.setMatrixAt(bi, bm); this.bulbInfo.push({ group: s[4], k }); bi++; } }
      const g = mergeGeos(parts); g.applyMatrix4(m4); geos.push(g);
    }
    const mesh = new THREE.Mesh(mergeGeos(geos), new THREE.MeshStandardMaterial({ color: 0x2a2c2e, roughness: 0.6, metalness: 0.5 })); this.scene.add(mesh);
    this.bulbs.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(S.length * 18), 3); this.bulbs.frustumCulled = false; this.scene.add(this.bulbs); this._sigKey = '';
  }
  now() { return (Date.now() + this.clockOffset) / 1000; }
  updateSignals() {
    if (!this.bulbs) return; const t = this.now(); const s0 = signalState(0, t), s1 = signalState(1, t); const key = s0 + '_' + s1; if (key === this._sigKey) return; this._sigKey = key;
    const on = [[9, 0.3, 0.2], [9, 5.5, 0.3], [0.3, 8, 2.5]], off = [[0.06, 0.012, 0.01], [0.06, 0.045, 0.01], [0.01, 0.05, 0.03]]; const c = new THREE.Color();
    this.bulbInfo.forEach((b, i) => { const st = b.group ? s1 : s0; const lit = (b.k === 0 && st === 0) || (b.k === 1 && st === 1) || (b.k === 2 && st === 2); const v = lit ? on[b.k] : off[b.k]; c.setRGB(v[0], v[1], v[2]); this.bulbs.setColorAt(i, c); });
    this.bulbs.instanceColor.needsUpdate = true;
  }
  // nearest stop or yield sign that governs a driver at (x,z) travelling along (fx,fz)
  controlAhead(x, z, fx, fz, maxD) { let best = null; const ci = Math.floor(x / 50), cj = Math.floor(z / 50); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const l = this.ctrlHash.get((ci + a) * 4096 + cj + b); if (!l) continue; for (const c of l) { if (c.fx * fx + c.fz * fz < 0.8) continue; const dx = c.x - x, dz = c.z - z; const d = dx * fx + dz * fz; if (d < -1 || d > maxD) continue; const lat = dx * -fz + dz * fx; if (lat < 0.5 || lat > 11) continue; if (!best || d < best.dist) best = { dist: d, kind: c.kind, id: c.id }; } } return best; }
  // signal the driver at (x,z) heading yaw is approaching, if any: returns {state, dist}
  signalAhead(x, z, fx, fz) { let best = null; for (const s of this.meta.signals) { const dx = s[6] - x, dz = s[7] - z; const d = dx * fx + dz * fz; if (d < 2 || d > 120) continue; const lat = Math.abs(dx * fz - dz * fx); if (lat > s[8] + 1) continue; const facing = -(Math.sin(s[3]) * fx + Math.cos(s[3]) * fz); if (facing < 0.8) continue; if (!best || d < best.dist) best = { state: signalState(s[4], this.now()), dist: d }; } return best; }

  // ---------------------------------------------------------------- sky / time of day
  initSky() {
    const sc = this.scene;
    this.hemi = new THREE.HemisphereLight(0x8fa8ff, 0x20242c, 0.2); sc.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 1); sc.add(this.sun); sc.add(this.sun.target);
    if (this.q.shadows) { this.sun.castShadow = true; const s = this.sun.shadow; s.mapSize.set(4096, 4096); s.camera.near = 1; s.camera.far = 260; const e = 60; s.camera.left = -e; s.camera.right = e; s.camera.top = e; s.camera.bottom = -e; s.bias = -0.0004; s.normalBias = 0.06; }
    this.sky = new Sky(); this.sky.scale.setScalar(4000); this.sky.visible = false; sc.add(this.sky);
    { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.42, 'rgba(240,244,255,1)'); gr.addColorStop(0.47, 'rgba(160,180,230,0.25)'); gr.addColorStop(1, 'rgba(120,150,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(170,175,190,0.5)'; for (const [x, y, r] of [[52, 54, 7], [72, 60, 5], [60, 74, 6], [76, 44, 4]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      this.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), fog: false, depthWrite: false, color: new THREE.Color(2.2, 2.2, 2.4) })); this.moon.scale.setScalar(260); this.moon.renderOrder = -4; sc.add(this.moon); }
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    new RGBELoader().load(A + 'tex/rogland_clear_night_1k.hdr', (t) => { t.mapping = THREE.EquirectangularReflectionMapping; this.nightTex = t; this.nightEnv = this.pmrem.fromEquirectangular(t).texture;  });
    this.fog = new THREE.FogExp2(0x05070c, 0.0016); sc.fog = this.fog;
    // photographed skies (Poly Haven, CC0) for day and dusk
    this.skyPh = {}; fetch(A + 'sky/sky.json').then(r => r.json()).then(async (info) => { for (const k of ['day', 'dusk']) { try { const one = (f) => texLoader.loadAsync(A + 'sky/' + f + '.jpg').then(t => { t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t; }); const [bg, env] = await Promise.all([one(k), one(k + '_s')]); this.skyPh[k] = { bg, env: this.pmrem.fromEquirectangular(env).texture, info: info[k] };  } catch (e) { } } }).catch(() => { });
    // flat Texas horizon: hides the mountains in the night-sky photo behind a dark band with a faint city glow
    { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, 'rgba(4,5,8,1)'); gr.addColorStop(0.22, 'rgba(14,11,9,1)'); gr.addColorStop(0.3, 'rgba(26,19,13,0.96)'); gr.addColorStop(0.6, 'rgba(14,12,12,0.6)'); gr.addColorStop(1, 'rgba(6,7,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const geo = new THREE.CylinderGeometry(3200, 3200, 1500, 48, 1, true); geo.translate(0, 420, 0); this.horizon = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false })); this.horizon.renderOrder = -5; this.horizon.frustumCulled = false; sc.add(this.horizon); }
    const n = this.q.lampLights; for (let i = 0; i < n; i++) { const l = new THREE.PointLight(0xffd9a8, 0, 34, 1.6); l.userData.lamp = null; sc.add(l); this.lampLights.push(l); }
    // rain streaks
    const N = this.q.rainDrops; const g = new THREE.BufferGeometry(); const pos = new Float32Array(N * 6); this.rainSeed = new Float32Array(N * 3); for (let i = 0; i < N; i++) { this.rainSeed[i * 3] = Math.random() * 40 - 20; this.rainSeed[i * 3 + 1] = Math.random() * 18; this.rainSeed[i * 3 + 2] = Math.random() * 40 - 20; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); this.rainMesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9fb0c8, transparent: true, opacity: 0.35, depthWrite: false })); this.rainMesh.frustumCulled = false; this.rainMesh.visible = false; sc.add(this.rainMesh);
  }
  // ---- the clock: a real moment over Fort Worth; the sun, moon and stars stand where they really would
  chicagoMs(hour) { const now = new Date(); const tz = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' })); const off = now.getTime() - tz.getTime(); const d = new Date(tz); d.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0); return d.getTime() + off; }
  gameMs() { return this.clockBase + (performance.now() - this.clockReal) * this.timeRate; }
  localHour(ms) { const d = new Date(new Date(ms).toLocaleString('en-US', { timeZone: 'America/Chicago' })); return d.getHours() + d.getMinutes() / 60; }
  setTime(mode) {
    if (!this.S) { E.site(this.meta.origin[0], this.meta.origin[1]); this.skyG = new THREE.Group(); this.skyG.scale.set(10, 10, -10); this.scene.add(this.skyG); this.S = buildSky(this.skyG); this.envScene = new THREE.Scene(); const eg = new THREE.Group(); eg.scale.set(1, 1, -1); this.envScene.add(eg); this.SE = buildSky(eg); this.timeRate = 1; this.weather = { mode: 'auto', cloud: 0.2, rain: 0, mist: 0.1 }; this.rainK = 0; this._envE = 999; }
    this.time = mode; const H = { night: 22.5, dawn: 6.75, day: 13, dusk: 17.45 }; this.clockBase = mode === 'live' ? Date.now() : this.chicagoMs(H[mode] ?? 22.5); this.clockReal = performance.now(); this.sky.visible = false; if (this.moon) this.moon.visible = false; if (this.horizon) this.horizon.visible = false;
    this.applyClock(true);
  }
  setWeather(mode) { this.weather.mode = mode; this.applyClock(true); }
  applyClock(force) {
    const cl = (v) => Math.max(0, Math.min(1, v)), ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); }; const sc = this.scene, S = this.S, W = this.weather;
    const ms = this.gameMs(), jd = E.jdOf(ms), hour = this.localHour(ms), days = Math.floor(ms / 864e5);
    // weather after THE GARAGE's: cloud that gathers and clears over the hours, rain when it is thick, mist at the day's ends
    const hsh = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); }, noise = (t) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hsh(i) * (1 - u) + hsh(i + 1) * u; }; const t = days * 24 + hour;
    W.cloud = W.mode === 'clear' ? 0.08 : W.mode === 'rain' ? 0.95 : Math.min(0.95, Math.max(0.04, 0.1 + 0.95 * noise(t / 7 + 3.3) * noise(t / 2.3 + 9.1) + 0.25 * (noise(t / 1.1) - 0.5)));
    W.rain = ss(0.62, 0.9, W.cloud); W.mist = Math.min(1, 0.08 + 0.5 * ss(4, 6.5, hour) * (1 - ss(7, 9, hour)) + 0.25 * W.rain);
    S.set(jd, W, this.fog.color, 0.6); const e = S.e, day = cl((e + 4) / 14); this.sunAlt = e; this.dayK = day; this.hourNow = hour;
    const toW = (v) => new THREE.Vector3(v.x, v.y, -v.z);
    if (e > -1.5) { this.lightDir = toW(S.sunDir); this.sun.color.copy(S.sunC).lerp(new THREE.Color(1, 1, 1), 0.35); this.sun.intensity = 2.7 * cl((e + 1.5) / 12) * (1 - 0.8 * cl((W.cloud - 0.3) / 0.55)); }
    else if (S.moonAlt > 2) { this.lightDir = toW(S.moonDir); this.sun.color.set(0xaec4ff); this.sun.intensity = 0.55 * S.moonLit * cl(S.moonAlt / 12) * (1 - 0.7 * W.cloud); }
    else { this.lightDir = new THREE.Vector3(0.2, 1, 0.1); this.sun.color.set(0x8090c0); this.sun.intensity = 0.03; }
    this.lightDir.y = Math.max(0.12, this.lightDir.y); this.lightDir.normalize();
    this.hemi.intensity = 0.17 + 0.55 * day * (1 - 0.3 * W.cloud); this.hemi.color.copy(S.zen).lerp(S.mid, 0.5).lerp(new THREE.Color(1, 1, 1), 0.35 * day); this.hemi.groundColor.set(day > 0.5 ? 0x6a6252 : 0x20242c);
    this.fog.color.copy(S.horizon).lerp(new THREE.Color(0.5, 0.52, 0.56), 0.5 * W.cloud * day).multiplyScalar(0.22 + 0.7 * day); const dens = 0.00016 + 0.0005 * (1 - day) + 0.0009 * W.rain; this.cfg = { dens, night: e < -3 ? 1 : e < 1 ? 0.8 : 0 }; this.fog.density = dens;
    this.renderer.toneMappingExposure = 1.0 - 0.58 * day;
    // air: mist that lies on the ground, and the glow toward the sun or moon
    AIR.mist[0] = 0.0035 * W.mist * (0.4 + 0.6 * (1 - day)); AIR.mist[1] = 1 / 9; AIR.mist[3] = 0.97; AIR.sun[0] = this.lightDir.x; AIR.sun[1] = this.lightDir.y; AIR.sun[2] = this.lightDir.z; AIR.sun[3] = 0.62; const gk = e > -1.5 ? 0.16 * cl((e + 1.5) / 6) + 0.25 * cl(1 - Math.abs(e) / 8) : 0.02 * S.moonLit; AIR.sunC[0] = S.sunC.r * gk; AIR.sunC[1] = S.sunC.g * gk; AIR.sunC[2] = S.sunC.b * gk;
    const na = this.cfg.night; const changed = na !== this.nightAmount; this.nightAmount = na; this.dark = e < -2;
    this.winU.uLit.value = this.meta.windows3d ? -1 : 0.34 * na; this.winU.uNight.value = na > 0 ? 1 : 0; this.glassU.uNight.value = na > 0.9 ? 1 : na > 0 ? 0.7 : 0; this.roomU.uB.value = na > 0.9 ? 1.25 : na > 0 ? 0.9 : 0.28;
    if (changed || force) this.group.traverse(o => { if (o.userData.night) o.visible = na > 0.5; });
    if (force || Math.abs(e - this._envE) > 1.2 || Math.abs(W.cloud - (this._envC || 0)) > 0.12) { this._envE = e; this._envC = W.cloud; this.SE.set(jd, W, this.fog.color, 0.6); const old = this._envRT; this._envRT = this.pmrem.fromScene(this.envScene, 0, 1, 2000); sc.environment = this._envRT.texture; if (old) old.dispose(); }
    sc.background = null; sc.environmentIntensity = 0.5 + 0.55 * day;
    if (Math.abs(W.rain - this.rainK) > 0.04 || force) { this.rainK = W.rain; this.setRain(W.rain > 0.08 ? W.rain : 0); }
    this.onTime && this.onTime(this.time, this.cfg);
  }
  _skyScene() { if (!this._ss) { this._ss = new THREE.Scene(); this._ssky = new Sky(); this._ssky.scale.setScalar(1000); this._ss.add(this._ssky); } const a = this.sky.material.uniforms, b = this._ssky.material.uniforms; for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) b[k].value = a[k].value; b.sunPosition.value.copy(a.sunPosition.value); return this._ss; }
  setRain(v) { this.rain = v; this.rainMesh.visible = v > 0; const M = this.mats; const wet = 1 - 0.75 * v; for (const k of ['asphalt', 'concrete', 'lot', 'walk']) { M[k].roughness = wet; M[k].envMapIntensity = 1 + v * 2; } this.fog.density = this.cfg.dens * (1 + v * 1.5); }

  // ---------------------------------------------------------------- streaming
  update(camObj, dt, focus) {
    // the camera sits inside a rig, so its own .position is local: always work from its world position
    const cam = this._camW || (this._camW = { position: new THREE.Vector3() }); camObj.getWorldPosition(cam.position);
    const m = this.meta; const R = this.q.viewDist; const ci = Math.floor((focus.x + m.half) / m.chunk), cj = Math.floor((focus.z + m.half) / m.chunk); const n = Math.ceil(R / m.chunk);
    this._acc = (this._acc || 0) + dt;
    if (this._acc > 0.25 || !this._started) { this._acc = 0; this._started = true;
      const want = [];
      for (let i = ci - n; i <= ci + n; i++) for (let j = cj - n; j <= cj + n; j++) { if (i < 0 || j < 0 || i >= m.nch || j >= m.nch) continue; const cx = -m.half + (i + 0.5) * m.chunk, cz = -m.half + (j + 0.5) * m.chunk; const d = Math.hypot(cx - focus.x, cz - focus.z); if (d > R + m.chunk * 0.7) continue; want.push({ key: i + '_' + j, i, j, d }); }
      want.sort((a, b) => a.d - b.d); const wantSet = new Set(want.map(w => w.key));
      for (const w of want) { if (this.loaded.has(w.key) || this.loading.has(w.key)) continue; if (this.loading.size >= this.q.parallelLoads) break; this.loadChunk(w); }
      for (const [k, g] of this.loaded) if (!wantSet.has(k) && g.userData.d > R + m.chunk * 2) { this.group.remove(g); g.traverse(o => { if (o.isInstancedMesh) o.dispose(); else if (o.geometry) o.geometry.dispose(); const t = o.material && o.material.userData && o.material.userData.ownTex; if (t) { t.dispose(); o.material.dispose(); } }); this.loaded.delete(k); }
      for (const [k, g] of this.loaded) { const d = g.userData.d = Math.hypot(g.userData.cx - focus.x, g.userData.cz - focus.z); const sv = d < this.q.vegDist + 180; if (g.userData.veg !== sv) { g.userData.veg = sv; for (const o of g.children) if (o.userData.veg) o.visible = sv; } const near = d < 240; if (g.userData.near !== near || g.userData.veg !== g.userData._v2) { g.userData.near = near; g.userData._v2 = g.userData.veg; for (const o of g.children) if (o.userData.lod) o.visible = g.userData.veg && (o.userData.lod === 'hi') === near; } }
      this.pendingCount = want.filter(w => !this.loaded.has(w.key)).length; this.nearReady = want.filter(w => w.d < 300).every(w => this.loaded.has(w.key));
      this.assignLampLights(focus);
    }
    // sun / moon shadow frustum follows the focus
    this.sun.position.copy(focus).addScaledVector(this.lightDir, 120); this.sun.target.position.copy(focus);
    if (this.skyG) { this.skyG.position.copy(cam.position); this.S.update(dt, this.renderer.getPixelRatio()); AIR.mist[2] = this.height(cam.position.x, cam.position.z); this._clk = (this._clk || 0) + dt; if (this._clk > (this.timeRate > 1 ? 0.25 : 2)) { this._clk = 0; this.applyClock(false); } } if (false) { this.horizon.position.set(cam.position.x, cam.position.y, cam.position.z); this.horizon.visible = this.time === 'night'; }
    this.updateSignals(); this.updateGrass(cam.position);
    for (const l of this.lampLights) { const t = l.userData.target || 0; l.intensity += (t - l.intensity) * Math.min(1, dt * 4); }
    if (this.rain > 0) { const p = this.rainMesh.geometry.attributes.position; const a = p.array; const s = this.rainSeed; const t = performance.now() / 1000; const N = s.length / 3; const vx = this._rvx || 0, vz = this._rvz || 0;
      for (let i = 0; i < N; i++) { const y = ((s[i * 3 + 1] - t * 22) % 18 + 18) % 18 - 4; const x = cam.position.x + s[i * 3], z = cam.position.z + s[i * 3 + 2]; a[i * 6] = x; a[i * 6 + 1] = cam.position.y + y; a[i * 6 + 2] = z; a[i * 6 + 3] = x - vx * 0.03; a[i * 6 + 4] = cam.position.y + y + 0.7; a[i * 6 + 5] = z - vz * 0.03; }
      p.needsUpdate = true; }
  }
  assignLampLights(focus) {
    if (!this.lampLights.length) return; const on = this.nightAmount > 0.5; const near = [];
    if (on) { const ci = Math.floor(focus.x / 60), cj = Math.floor(focus.z / 60); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const l = this.lampHash.get((ci + a) * 4096 + cj + b); if (l) for (const q of l) { if (q.lx === undefined) continue; const d = Math.hypot(q.lx - focus.x, q.lz - focus.z); if (d < 70) near.push([d, q]); } } near.sort((x, y) => x[0] - y[0]); }
    const keep = new Set(near.slice(0, this.lampLights.length).map(n => n[1])); const free = [];
    for (const l of this.lampLights) { if (l.userData.lamp && keep.has(l.userData.lamp)) { keep.delete(l.userData.lamp); l.userData.target = this.q.lampIntensity; } else { l.userData.target = 0; if (l.intensity < 0.05 * this.q.lampIntensity) free.push(l); } }
    for (const q of keep) { const l = free.pop(); if (!l) break; l.userData.lamp = q; l.position.set(q.lx, q.ly - 0.3, q.lz); l.intensity = 0; l.userData.target = this.q.lampIntensity; }
  }
  loadChunk(w) {
    const m = this.meta; this.loading.add(w.key);
    this.loader.load(A + 'world/c_' + w.key + '.glb', (gltf) => {
      this.loading.delete(w.key); const g = new THREE.Group(); const inner = gltf.scene; const cx = -m.half + (w.i + 0.5) * m.chunk, cz = -m.half + (w.j + 0.5) * m.chunk;
      inner.position.set(cx, 0, cz); inner.updateMatrixWorld(true);
      inner.traverse(o => { if (!o.isMesh) return; const mat = this.mats[o.name] || this.mats[o.parent.name]; if (mat) o.material = (o.name === 'ground' && this.meta.aerial) ? this.groundMaterial(w.key, cx, cz) : mat; o.matrixAutoUpdate = false;
        const nm = o.name; if (nm === 'mark_w' || nm === 'mark_y') o.renderOrder = 1; if (nm === 'glow') { o.userData.night = true; o.visible = this.nightAmount > 0.5; } o.receiveShadow = this.q.shadows && (nm === 'ground' || nm === 'asphalt' || nm === 'concrete' || nm === 'walk' || nm === 'lot'); o.castShadow = this.q.shadows && (nm === 'wall' || nm === 'wall_com' || nm === 'wall_stucco' || nm === 'wall_stone' || nm === 'roof' || nm === 'bridge' || nm === 'detail' || nm === 'rail'); });
      g.add(inner); g.userData = { cx, cz, d: w.d }; this.buildProps(w.key, g); this.group.add(g); this.loaded.set(w.key, g);
    }, undefined, () => { this.loading.delete(w.key); this.loaded.set(w.key, Object.assign(new THREE.Group(), { userData: { cx: 0, cz: 0, d: 0 } })); });
  }
}

export function mergeGeos(list) {
  let vc = 0, ic = 0; for (const g of list) { vc += g.attributes.position.count; ic += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), uv = new Float32Array(vc * 2), idx = new Uint32Array(ic); let vo = 0, io = 0;
  for (const g of list) { pos.set(g.attributes.position.array, vo * 3); if (g.attributes.normal) nor.set(g.attributes.normal.array, vo * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, vo * 2);
    if (g.index) for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.array[i] + vo; else for (let i = 0; i < g.attributes.position.count; i++) idx[io + i] = vo + i; io += g.index ? g.index.count : g.attributes.position.count; vo += g.attributes.position.count; }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); o.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); o.setIndex(new THREE.BufferAttribute(idx, 1)); return o;
}
