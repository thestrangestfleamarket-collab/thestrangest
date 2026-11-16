// THE CANTINA's hall: Polyfork models and Poly Haven textures (data/cantina/); the bar under the loft, the card tables, the jukebox corner, the regulars. Three looks (THEMES).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { ROOM, LOFT, TABLES, seatInfo, tableY, buttonPos, inLoft, onStair } from './layout.js';

export const THEMES = {
  A: {
    name: 'The Onyx Room', floor: ['herringbone_parquet', 2.2, 0x9a8272], wall: ['painted_plaster_wall', 2.4, 0x6e1a20], wains: ['dark_paneled_wood', 1.6, 0x8a7460], ceil: ['ceiling_interior', 3, 0x2a211c],
    fog: [0x0a0503, 0.05], exposure: 0.62, back: 'onyxBack', counter: 'onyxCounter', stool: 'stoolRound', table: 'pokerLong', chand: 'crystal', sconce: 'sconce',
    key: 0xffc98a, glow: 0xffb45a, stage: [0xffd9a0, 0xff7a4a], fill: [0xffd0a0, 0x1a0c08, 0.22], haze: 0xffc890,
  },
  B: {
    name: 'The Barrel House', floor: ['wood_floor_worn', 2.6, 0xa89684], wall: ['red_brick_03', 2.2, 0xa08878], wains: ['wooden_panels', 1.8, 0x7a6450], ceil: ['dark_wooden_planks', 3, 0x40342a],
    fog: [0x090604, 0.045], exposure: 0.66, back: 'woodBack', counter: 'woodCounter', stool: 'stoolWood', table: 'pokerRound', chand: 'iron', sconce: 'cafeSconce',
    key: 0xffb866, glow: 0xffa040, stage: [0xffe0b0, 0xffa050], fill: [0xffc890, 0x180e08, 0.26], haze: 0xffc070,
  },
  C: {
    name: 'After Hours', floor: ['black_painted_planks', 2.4, 0x8890a0], wall: ['dark_brick_wall', 2.4, 0x70748a], wains: ['dark_brick_wall', 2.4, 0x50546a], ceil: ['ceiling_interior', 3, 0x101018],
    fog: [0x040309, 0.055], exposure: 0.78, back: 'onyxBack', counter: 'onyxCounter', stool: 'stoolRound', table: 'pokerLong', chand: null, sconce: null,
    key: 0x9fe8ff, glow: 0x36d8ff, stage: [0xff3fa4, 0x30d0ff], fill: [0x6070ff, 0x08040c, 0.2], haze: 0x8090ff,
  },
};

// ---------- assets ----------
const loader = new GLTFLoader(), texLoader = new THREE.TextureLoader();
const protos = new Map();
const _c = new THREE.Color();

function hsv(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d > 1e-5) { if (mx === r) h = ((g - b) / d + 6) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; }
  return [h * 60, mx ? d / mx : 0, mx];
}

// Polyfork models are flat vertex colours with one matte material. Split each mesh's triangles by colour so
// brass and gold read as metal, and lamp shades / backlit onyx glow.
function dress(root, opt = {}) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = opt.shadow !== false; o.receiveShadow = true;
    const g = o.geometry, col = g.attributes.color;
    if (o.material.transparent) { o.castShadow = false; o.material.roughness = 0.08; o.material.envMapIntensity = 2; return; }
    if (o.isSkinnedMesh || !col) { o.material.roughness = 0.7; return; }
    let inGlow = false;
    for (let p = o; p; p = p.parent) if (opt.glowNode && p.name === opt.glowNode) inGlow = true;
    const idx = g.index ? Array.from(g.index.array) : Array.from({ length: g.attributes.position.count }, (_, i) => i);
    const buckets = [[], [], []];
    for (let t = 0; t < idx.length; t += 3) {
      _c.setRGB(col.getX(idx[t]), col.getY(idx[t]), col.getZ(idx[t]));
      const [h, s, v] = hsv(Math.pow(_c.r, 1 / 2.2), Math.pow(_c.g, 1 / 2.2), Math.pow(_c.b, 1 / 2.2));
      let k = 0;
      if (inGlow || (opt.glow && opt.glow(h, s, v))) k = 2;
      else if ((h > 28 && h < 58 && s > 0.42 && v > 0.5) || (opt.chrome && s < 0.1 && v > 0.5 && v < 0.86)) k = 1;
      buckets[k].push(idx[t], idx[t + 1], idx[t + 2]);
    }
    const base = o.material.clone();
    base.roughness = opt.rough ?? 0.72; base.envMapIntensity = 0.6; if (opt.dim) base.color.multiplyScalar(opt.dim);
    const metal = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1, roughness: 0.3, envMapIntensity: 1.6, flatShading: base.flatShading });
    const glow = new THREE.MeshBasicMaterial({ vertexColors: true, color: opt.glowTint ?? 0xffffff });
    glow.color.multiplyScalar(opt.glowGain ?? 1.6);
    const ng = g.clone();
    ng.setIndex([...buckets[0], ...buckets[1], ...buckets[2]]);
    ng.clearGroups();
    let start = 0;
    buckets.forEach((b, i) => { if (b.length) ng.addGroup(start, b.length, i); start += b.length; });
    o.geometry = ng;
    o.material = [base, metal, glow];
  });
  return root;
}

async function proto(key, opt) {
  const id = key + (opt?.tag || '');
  if (!protos.has(id)) {
    protos.set(id, loader.loadAsync(`cantina-assets/pf/${key}.glb`).then((gltf) => {
      const root = dress(gltf.scene, opt);
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      return { root, box, gltf };
    }));
  }
  return protos.get(id);
}

function pbr(id, tile, tint, w, h) {
  const set = (t, srgb) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / tile, h / tile); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const arm = set(texLoader.load(`cantina-assets/tex/${id}_arm.jpg`));
  return new THREE.MeshStandardMaterial({
    map: set(texLoader.load(`cantina-assets/tex/${id}_diff.jpg`), true), normalMap: set(texLoader.load(`cantina-assets/tex/${id}_nor.jpg`)),
    aoMap: arm, roughnessMap: arm, metalnessMap: arm, color: tint, envMapIntensity: 0.5,
  });
}

function gradientTex() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.38)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  return new THREE.CanvasTexture(c);
}

function cardTex(rank, suit) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 180;
  const x = c.getContext('2d');
  x.fillStyle = '#f6f1e6'; x.fillRect(0, 0, 128, 180);
  if (!rank) {
    x.fillStyle = '#7a1420'; x.fillRect(9, 9, 110, 162); x.strokeStyle = '#d9a441'; x.lineWidth = 2;
    for (let i = -180; i < 300; i += 14) { x.beginPath(); x.moveTo(i, 9); x.lineTo(i + 162, 171); x.stroke(); x.beginPath(); x.moveTo(i, 171); x.lineTo(i + 162, 9); x.stroke(); }
    x.fillStyle = '#f6f1e6'; x.fillRect(0, 0, 128, 9); x.fillRect(0, 171, 128, 9); x.fillRect(0, 0, 9, 180); x.fillRect(119, 0, 9, 180);
  } else {
    x.fillStyle = suit === '♥' || suit === '♦' ? '#c8102e' : '#16161a'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = 'bold 34px Georgia'; x.fillText(rank, 22, 26); x.font = '28px serif'; x.fillText(suit, 22, 56);
    x.font = '84px serif'; x.fillText(suit, 64, 104);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// ---------- hats, ties and other clothes for the regulars (unit size: one head wide) ----------
const felt = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
function hat(type) {
  const g = new THREE.Group(), add = (geo, mat, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.castShadow = true; g.add(m); return m; };
  if (type === 'top') { add(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24), felt(0x121214)); add(new THREE.CylinderGeometry(0.38, 0.35, 0.62, 24), felt(0x121214), 0.33); add(new THREE.CylinderGeometry(0.362, 0.362, 0.1, 24), felt(0x8a1420), 0.1); }
  else if (type === 'bowler') { add(new THREE.CylinderGeometry(0.56, 0.56, 0.05, 24), felt(0x2a1c14)); add(new THREE.SphereGeometry(0.38, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), felt(0x2a1c14), 0.02); }
  else if (type === 'fez') { add(new THREE.CylinderGeometry(0.26, 0.34, 0.44, 20), felt(0xa01420), 0.22); add(new THREE.CylinderGeometry(0.012, 0.012, 0.3), felt(0xd9a441), 0.36).position.x = 0.2; }
  else if (type === 'cowboy') { const b = add(new THREE.TorusGeometry(0.5, 0.2, 8, 28), felt(0x7a5230)); b.rotation.x = Math.PI / 2; b.scale.set(1.25, 1, 0.22); add(new THREE.CylinderGeometry(0.3, 0.38, 0.42, 20), felt(0x7a5230), 0.22); add(new THREE.CylinderGeometry(0.385, 0.385, 0.06, 20), felt(0x2a1a10), 0.06); }
  else if (type === 'party') { add(new THREE.ConeGeometry(0.3, 0.7, 16), felt(0xe84393), 0.35); add(new THREE.SphereGeometry(0.07), felt(0xf2c14e), 0.72); }
  else if (type === 'visor') { const m = new THREE.MeshPhysicalMaterial({ color: 0x1fae5a, transparent: true, opacity: 0.75, roughness: 0.2, side: THREE.DoubleSide, emissive: 0x0a3a1c });
    const brim = add(new THREE.CylinderGeometry(0.62, 0.62, 0.02, 24, 1, false, -Math.PI / 2 + 0.2, Math.PI - 0.4), m, -0.12); brim.rotation.x = 0.25; brim.position.z = 0.12; const band = add(new THREE.TorusGeometry(0.43, 0.035, 6, 24), felt(0x111111), -0.1); band.rotation.x = Math.PI / 2; }
  return g;
}
function bowtie(color = 0xb01020) {
  const g = new THREE.Group(), m = felt(color);
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 4), m); c.rotation.z = s * Math.PI / 2; c.position.x = s * 0.1; c.scale.z = 0.5; g.add(c); }
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.045), m));
  return g;
}
function smokeTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  for (let i = 0; i < 26; i++) { const px = 60 + Math.random() * 136, py = 60 + Math.random() * 136, r = 30 + Math.random() * 60, g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.11)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
  return new THREE.CanvasTexture(c);
}

// ---------- the room ----------
let envTex = null;
export async function buildBar(real, renderer, themeKey = 'A', Q = {}) {
  const T = THEMES[themeKey], { w: W, d: D, h: H, loft: LY } = ROOM, neon = themeKey === 'C';
  const scene = new THREE.Group(); real.add(scene);
  const bar = { theme: T, key: themeKey, root: scene, npcs: [], buttonMeshes: [], seatMarkers: [], pressT: new Map() };
  envTex = envTex || new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  real.environment = envTex;
  real.environmentIntensity = 0.06;
  real.background = new THREE.Color(T.fog[0]);
  real.fog = new THREE.FogExp2(T.fog[0], T.fog[1] * 0.62);
  renderer.toneMappingExposure = T.exposure;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const ray = new THREE.Raycaster();
  const topOf = (obj, x, z, from = 12) => { obj.updateMatrixWorld(true); ray.set(V(x, from, z), V(0, -1, 0)); const h = ray.intersectObject(obj, true)[0]; return h ? h.point.y : 0; };

  const put = async (key, x, z, rot = 0, o = {}) => {
    const P = await proto(key, o.dress), g = new THREE.Group(), m = P.root.clone(true), c = P.box.getCenter(new THREE.Vector3());
    m.position.set(-c.x, 0, -c.z);
    g.add(m); g.position.set(x, o.y || 0, z); g.rotation.y = rot;
    if (o.s) g.scale.setScalar(o.s);
    if (o.sx) g.scale.set(o.sx, o.sy || 1, o.sz || o.sx);
    scene.add(g);
    return g;
  };
  const onto = async (key, target, x, z, rot = 0, o = {}) => put(key, x, z, rot, { ...o, y: topOf(target, x, z) + (o.lift || 0) });
  const grad = gradientTex();
  const cone = (from, to, radius, color, opacity = 0.16) => {
    const dir = new THREE.Vector3().subVectors(to, from), len = dir.length();
    const g = new THREE.ConeGeometry(radius, len, 40, 1, true); g.translate(0, -len / 2, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, alphaMap: grad, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide, fog: false }));
    m.position.copy(from); m.quaternion.setFromUnitVectors(V(0, -1, 0), dir.normalize()); m.renderOrder = 10; scene.add(m);
  };
  const spot = (from, to, color, intensity, angle, o = {}) => {
    if (o.cone !== false) cone(from, to, Math.min(Math.tan(angle) * from.distanceTo(to) * 0.9, 2.2), color, (o.haze ?? 0.14) * 0.3);
    if (o.light === false) return null;
    const s = new THREE.SpotLight(color, intensity, o.dist || 14, angle, o.pen ?? 0.6, 1.4);
    s.position.copy(from); s.target.position.copy(to);
    if (o.shadow && Q.shadows) { s.castShadow = true; s.shadow.mapSize.set(2048, 2048); s.shadow.radius = 3; s.shadow.bias = -0.0004; s.shadow.normalBias = 0.02; s.shadow.camera.near = 0.3; s.shadow.camera.far = 14; }
    scene.add(s, s.target);
    return s;
  };
  // most lamps only glow; a real light is made where keep is set (the room has a budget of lights)
  const bulb = (x, y, z, color, intensity, dist = 5, keep) => { if (!keep) return null; const l = new THREE.PointLight(color, intensity, dist, 2); l.position.set(x, y, z); scene.add(l); return l; };
  const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  const plane = (w, h, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.receiveShadow = true; return m; };
  const trim = new THREE.MeshStandardMaterial({ color: neon ? 0x15151c : 0x2a1a10, roughness: 0.45, metalness: 0.1 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.5, metalness: 0.8 });
  const brassM = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 1, roughness: 0.28, envMapIntensity: 2.2 });
  const lampGlow = { tag: 'lamp', glow: (h, s, v) => s < 0.3 && v > 0.82, glowTint: T.key, glowGain: 1.5 };

  // --- shell: two storeys ---
  const floor = plane(W, D, pbr(...T.floor, W, D)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const ceil = plane(W, D, pbr(...T.ceil, W, D)); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);
  const WH = 1.15;
  for (const [x, z, ry, len] of [[0, -D / 2, 0, W], [0, D / 2, Math.PI, W], [-W / 2, 0, Math.PI / 2, D], [W / 2, 0, -Math.PI / 2, D]]) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
    const lo = plane(len, WH, pbr(...T.wains, len, WH)); lo.position.y = WH / 2;
    const up = plane(len, H - WH, pbr(...T.wall, len, H - WH)); up.position.y = WH + (H - WH) / 2;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.06), trim); rail.position.set(0, WH, 0.03);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, 0.12), trim); crown.position.set(0, H - 0.1, 0.06);
    g.add(lo, up, rail, crown); scene.add(g);
  }
  for (let x = -W / 2 + 2.2; x < W / 2; x += 4.4) box(0.3, 0.34, D, trim, x, H - 0.17, 0);
  scene.add(new THREE.HemisphereLight(T.fill[0], T.fill[1], T.fill[2] * 0.42));

  // --- the loft: over the bar along the back wall and down the left wall, on iron posts ---
  const LX = LOFT.lx, LZ = LOFT.lz, LE = LOFT.le;   // left loft's edge, back loft's edge, back loft's east end
  const loftTop = pbr('dark_wooden_planks', 2.4, 0xb09880, 6, 6), under = new THREE.MeshStandardMaterial({ color: neon ? 0x101016 : 0x24170f, roughness: 0.8 });
  const slab = (x0, x1, z0, z1) => { const w = x1 - x0, d = z1 - z0, m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), [under, under, loftTop, under, under, under]); m.position.set((x0 + x1) / 2, LY - 0.14, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; scene.add(m);
    for (let x = x0 + 0.6; x < x1; x += 1.2) box(0.12, 0.16, d, trim, x, LY - 0.36, (z0 + z1) / 2); };
  slab(-W / 2, LE, -D / 2, LZ); slab(-W / 2, LX, LZ, D / 2);
  const post = (x, z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, LY - 0.28, 14), iron); p.position.set(x, (LY - 0.28) / 2, z); p.castShadow = true; scene.add(p);
    for (const y of [0.12, LY - 0.4]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 14), brassM); c.position.set(x, y, z); scene.add(c); } };
  for (let x = LX; x <= LE + 0.1; x += (LE - LX) / 3) post(x, LZ - 0.15);
  for (let z = LZ + 3.9; z < D / 2 - 0.5; z += 3.9) post(LX - 0.15, z);
  post(LE - 0.15, -D / 2 + 2);
  const railDress = { tag: 'rl', rough: 0.4 };
  for (let x = LX + 1; x < LE; x += 2) await put('rail', Math.min(x, LE - 1), LZ - 0.06, 0, { y: LY, dress: railDress });
  for (let z = -D / 2 + 1; z < LZ; z += 2) await put('rail', LE - 0.06, z, Math.PI / 2, { y: LY, dress: railDress });
  const STZ = LOFT.stz;   // the stair's line, along the front wall, climbing west onto the left loft
  for (let z = LZ + 1; z < STZ - 1.2; z += 2) await put('rail', LX - 0.06, z, Math.PI / 2, { y: LY, dress: railDress });
  { const st = await put('stair', 0, 0, 0, { sx: 1.7, sy: LY / 2.68, sz: LOFT.run / 3, dress: { tag: 'stair', rough: 0.5 } });
    const hi = topOf(st, 0, -1.2) > topOf(st, 0, 1.2) ? -1 : 1;   // which end is the top
    st.rotation.y = hi < 0 ? Math.PI / 2 : -Math.PI / 2; st.position.set(LX + LOFT.run / 2, 0, STZ); }

  // --- the bar, under the back loft ---
  const BX = -4.6, backZ = -D / 2 + 0.26, counterZ = -D / 2 + 1.95, NB = 5;
  const onyx = { tag: 'onyx' + themeKey, glowNode: 'onyx', glowTint: T.glow, glowGain: neon ? 1.5 : 1.25 };
  const counters = [];
  for (let i = 0; i < NB; i++) {
    const x = BX + (i - (NB - 1) / 2) * 2;
    await put(T.back, x, backZ, 0, { dress: T.back === 'onyxBack' ? onyx : { tag: 'wood', rough: 0.55 } });
    counters.push(await put(T.counter, x, counterZ, 0, { dress: T.counter === 'onyxCounter' ? onyx : { tag: 'wood', rough: 0.5 } }));
    bulb(x, 1.7, backZ + 1.0, T.glow, T.back === 'onyxBack' ? 5 : 4, 6, i % 2 === 0);
    spot(V(x, LY - 0.5, counterZ + 0.1), V(x, 1.1, counterZ + 0.1), T.key, 12, 0.75, { haze: 0.12, light: i % 2 === 1 });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: neon ? 0x111118 : 0x1c3a2c, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide })); shade.position.set(x, LY - 0.55, counterZ + 0.1); scene.add(shade);
  }
  const cTop = (x) => topOf(counters[Math.max(0, Math.min(NB - 1, Math.round((x - BX) / 2 + (NB - 1) / 2)))], x, counterZ);
  const onBar = async (key, x, dz = 0, rot = 0, o = {}) => put(key, x, counterZ + dz, rot, { ...o, y: cTop(x) });
  const stoolX = (i) => BX - 4.5 + i * 1.0, stoolZ = counterZ + 0.64;
  for (let i = 0; i < 10; i++) await put(T.stool, stoolX(i), stoolZ, Math.PI + (i % 3 - 1) * 0.25, { dress: { tag: 'st', chrome: true } });
  await onBar('whiskey', BX - 3.6, 0.05, 0.6); await onBar('wine', BX + 3.1, -0.05); await onBar('bottle', BX + 3.3, 0.02); await onBar('whiskey', BX + 1.4, 0.08, -0.8);
  await onBar('holo', BX + 4.3, 0, 0, { s: 0.6, dress: { tag: 'holo', glow: (h, s, v) => h > 150 && h < 220 && v > 0.6, glowGain: 2 } }); 
  await put('barrel', BX + 5.6, backZ + 0.3, 0, { s: 1.2 }); await put('barrel', BX + 6.3, backZ + 0.25, 0.5, { s: 1.2 });

  // --- the card table, in the middle of the hall under a long-chained lamp ---
  const TX = TABLES[0].x, TZ = TABLES[0].z;
  for (let i = -1; i <= 1; i++) for (let j = 0; j < 2; j++) await put('carpet', TX + i * 2, TZ - 1 + j * 2, 0, { dress: { tag: 'cp', rough: 0.95, dim: 0.3 }, sx: 1, sy: 0.3 });
  const table = await put('pokerLong', TX, TZ, 0, { dress: { tag: 'tb', rough: 0.8 } });
  const seats = [];
  for (let i = 0; i < 8; i++) { const si = seatInfo(0, i); seats.push({ x: si.x, z: si.z, a: si.a, rot: si.yaw + Math.PI }); await put('gameChair', si.x, si.z, si.yaw + Math.PI, { dress: { tag: 'ch' } }); }
  await put('gameLamp', TX, TZ, 0, { dress: { tag: 'gl' } });
  for (const dx of [-0.72, 0.72]) box(0.02, H - 4, 0.02, brassM, TX + dx, 4 + (H - 4) / 2, TZ);
  { const u = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.36), new THREE.MeshBasicMaterial({ color: new THREE.Color(T.key).multiplyScalar(1.3) })); u.rotation.x = Math.PI / 2; u.position.set(TX, 2.195, TZ); scene.add(u); }
  spot(V(TX, 2.15, TZ), V(TX, 0, TZ), T.key, 15, 0.95, { shadow: true, pen: 0.7, haze: 0.1 });
  const cardG = new THREE.PlaneGeometry(0.064, 0.089); cardG.rotateX(-Math.PI / 2);
  const backM = new THREE.MeshStandardMaterial({ map: cardTex(), roughness: 0.5 });
  for (const n of TABLES[0].npc) { const sn = seats[n], ex = Math.sin(sn.a), ez = Math.cos(sn.a), px = TX + ex * 1.22 * 0.9, pz = TZ + ez * 0.39 * 0.9;
    for (let k = 0; k < 3; k++) { const cx = px + ez * (0.1 + k * 0.05), cz = pz - ex * (0.1 + k * 0.05); await put('chip', cx, cz, Math.random() * 6, { y: topOf(table, cx, cz), sx: 1, sy: 4 + Math.floor(Math.random() * 14) }); } }
  await onto('shoe', table, TX + 0.3, TZ - 0.3, Math.PI * 0.9); await onto('chipRack', table, TX - 0.3, TZ - 0.32, 0);

  // --- the jukebox corner, under the high ceiling: sofas round a rug, the jukebox against the back wall ---
  const SX = 7.6, SZ = -5.4, JZ = -D / 2 + 0.55;
  { const jk = await put('jukebox', SX, JZ, 0, { s: 1.15, dress: { tag: 'jk', glow: (h, s, v) => s > 0.25 && v > 0.8, glowGain: 1.7 } });
    bar.jukebox = { obj: jk, x: SX, y: 1.1, z: JZ };
    bulb(SX, 1.3, JZ + 0.9, neon ? 0xff40c0 : 0xff9040, 7, 7, true);
    spot(V(SX, 5.2, JZ + 1.6), V(SX, 0.8, JZ + 0.2), T.stage[0], 22, 0.42, { haze: 0.3 });
    await put('rug', SX, SZ + 0.6, 0, { sx: 1.9, sy: 0.4, sz: 1.9 });
    await put('sofa', SX - 2.0, SZ + 0.6, Math.PI / 2, {}); await put('sofa', SX + 2.0, SZ + 0.6, -Math.PI / 2, {});
    const dt = await put('drumTable', SX, SZ + 0.9, 0, { dress: { tag: 'dt', rough: 0.4 } }); await onto('whiskey', dt, SX + 0.08, SZ + 0.95, 0.7); await onto('goblet', dt, SX - 0.12, SZ + 0.8, 0, { dress: { tag: 'gb' } });
    await put('floorLamp', SX + 2.7, JZ + 0.1, 0, { dress: lampGlow }); await put('palm', SX - 2.7, JZ + 0.2, 0, { dress: { tag: 'pm' } }); }

  // --- booths under the left loft ---
  const boothX = -W / 2 + 0.72, boothZ = [-2.3, 0.5, 3.3];
  for (const z of boothZ) {
    await put('booth', boothX, z, Math.PI / 2, { dress: { tag: 'bo', rough: 0.85 } });
    const dt = await put('drumTable', boothX + 0.42, z, 0, { dress: { tag: 'dt', rough: 0.4 }, sx: 1, sy: 1.25 });
    await onto('tableLamp', dt, boothX + 0.42, z - 0.08, 0, { dress: lampGlow, s: 0.8 }); await onto('whiskey', dt, boothX + 0.52, z + 0.14, 1, { s: 0.9 });
    bulb(boothX + 1.2, 1.6, z, T.key, 5, 7, z === boothZ[1]);
  }
  // --- the right of the hall: blackjack, cantina tables, the jukebox ---
  const bj = await put('blackjack', 8.2, 2.2, -Math.PI / 2, { dress: { tag: 'bj', rough: 0.8 } });
  for (const dz of [-0.7, 0, 0.7]) await put('gameChair', 7.25, 2.2 + dz, Math.PI / 2, { dress: { tag: 'ch' } });
  spot(V(8.0, 3.2, 2.2), V(8.0, 0, 2.2), neon ? 0xff4fb0 : T.key, 26, 0.7, { haze: 0.18 });
  const cant = [await put('cantina', 6.0, 5.9, 0.4, {}), await put('cantina', 9.3, 5.6, -0.7, {})];
  bulb(7.6, 2.2, 5.8, T.key, 7, 8, true);
  await put('ashtray', W / 2 - 0.5, -0.6, 0, {});
  await put('door', 3.4, D / 2 - 0.1, Math.PI, {}); await put('ashtray', 4.4, D / 2 - 0.4, 0, {});
  await put('palm', W / 2 - 0.8, D / 2 - 0.8, 0, { dress: { tag: 'pm' } }); await put('palm', LX + 0.7, LZ + 0.6, 0, { dress: { tag: 'pm' } });
  // --- up in the loft: a second card table, sofas, drum tables ---
  const t2x = TABLES[1].x, t2z = TABLES[1].z;
  const t2 = await put('pokerRound', t2x, t2z, 0, { y: LY, dress: { tag: 'tb', rough: 0.8 } });
  spot(V(t2x, LY + 2.2, t2z), V(t2x, LY, t2z), T.key, 22, 0.8, { haze: 0.16 });
  { const sh = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.3, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0x1f5a41, roughness: 0.5, side: THREE.DoubleSide })); sh.position.set(t2x, LY + 2.3, t2z); scene.add(sh); box(0.015, H - LY - 2.4, 0.015, trim, t2x, (H + LY + 2.4) / 2, t2z); }
  await put('sofa', -9.4, -6.6, Math.PI / 2 + 0.5, { y: LY }); await put('sofa', -10.2, 1.5, Math.PI / 2, { y: LY });
  const ldt = await put('drumTable', -9.2, 1.5, 0, { y: LY, dress: { tag: 'dt', rough: 0.4 } });
  await put('floorLamp', -10.4, -0.2, 0, { y: LY, dress: lampGlow }); bulb(-9.6, LY + 1.7, -0.2, T.key, 8, 9, true);
  await put('tub', -8.4, 4.4, 2.2, { y: LY, dress: { tag: 'tu', rough: 0.9 } }); await put('floorLamp', -10.4, 5.6, 0, { y: LY, dress: lampGlow }); bulb(-9.6, LY + 1.7, 5.6, T.key, 6, 8, !Q.low);
  bulb(1.5, LY + 1.8, -6.4, T.key, 5, 7, !Q.low);

  // --- wall lights, the big chandeliers, a model ship ---
  const sc = async (x, y, z, rot) => { await put('sconce', x, z, rot, { y, dress: lampGlow }); bulb(x + Math.sin(rot) * 0.3, y + 2.05, z + Math.cos(rot) * 0.3, T.key, 1.5, 4.5); };
  for (const z of [-3.8, -0.9, 1.9, 4.7]) { await sc(-W / 2 + 0.2, 0, z, Math.PI / 2); await sc(-W / 2 + 0.2, LY, z, Math.PI / 2); }
  for (const z of [-2.4, 0.9, 4.0, 6.9]) { await sc(W / 2 - 0.2, 0, z, -Math.PI / 2); await sc(W / 2 - 0.2, 3.4, z, -Math.PI / 2); }
  for (const x of [-4.4, 0.6, 6.4, 9.4]) await sc(x, 0, D / 2 - 0.2, Math.PI);
  for (const x of [-8.6, -5.6, -2.6, 0.4]) await sc(x, LY, -D / 2 + 0.2, 0);
  if (!neon) for (const [x, z] of [[4.4, 4.6], [-2.2, -0.6]]) {
    await put(T.chand || 'crystal', x, z, 0, { y: 2.6, s: 1.3, dress: { tag: 'cd', glow: (h, s, v) => s < 0.22 && v > 0.8, glowTint: T.key, glowGain: 1.8 } });
    bulb(x, 5.6, z, T.key, 16, 14, true);
  }
  { const ship = await put('ship', 3.6, -1.6, 0.7, { y: 5.6, s: 0.16, dress: { tag: 'ship', glow: (h, s, v) => h > 250 && h < 320 && v > 0.6, glowGain: 1.6 } }); ship.rotation.z = 0.12;
    for (const [dx, dz] of [[-0.5, 0], [0.5, 0.2]]) box(0.008, H - 5.9, 0.008, iron, 3.6 + dx, (H + 5.9) / 2, -1.6 + dz); }
  if (neon) {
    const tube = (pts, color, r = 0.02, lit) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2), 120, r, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.6) })); scene.add(m); const c = pts[Math.floor(pts.length / 2)]; bulb(c.x * 0.86, c.y, c.z, color, 14, 12, lit); };
    const heart = [], spade = [];
    for (let i = 0; i <= 40; i++) { const t = (i / 40) * Math.PI * 2, x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); heart.push(V(W / 2 - 0.07, 5.6 + y * 0.05, 2.2 + x * 0.05)); spade.push(V(-W / 2 + 0.07, 6.1 - y * 0.04, 1.0 + x * 0.04)); }
    tube(heart, 0xff2f8f, 0.03, true); tube(spade, 0x30d8ff, 0.026, true);
    tube([V(LX, LY - 0.3, LZ + 0.2), V(LX, LY - 0.3, STZ - 1.4)], 0x7a3cff, 0.014); tube([V(LX, LY - 0.3, LZ), V(LE, LY - 0.3, LZ)], 0xff2f8f, 0.014);
    tube([V(BX - 5, 0.12, counterZ + 0.42), V(BX + 5, 0.12, counterZ + 0.42)], 0x30d8ff, 0.012);
    tube([V(SX - 2.3, 6.6, -D / 2 + 0.07), V(SX - 2.3, 0.4, -D / 2 + 0.07)], 0xff2f8f, 0.016); tube([V(SX + 2.3, 6.6, -D / 2 + 0.07), V(SX + 2.3, 0.4, -D / 2 + 0.07)], 0x30d8ff, 0.016);
    bulb(0, 6.5, 0, 0x6050ff, 16, 16, true);
  }

  // ---------- the regulars ----------
  const fwd = (rot) => V(Math.sin(rot), 0, Math.cos(rot));
  const _q = new THREE.Quaternion(), _p = new THREE.Quaternion(), _v = new THREE.Vector3();
  const patron = async (key, x, y, z, rot, o = {}) => {
    const P = await proto(key), m = SkeletonUtils.clone(P.root), G = new THREE.Group();
    G.add(m); G.position.set(x, y, z); G.rotation.y = rot; G.scale.setScalar(o.s || 1); scene.add(G);
    m.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.frustumCulled = false; } });
    const clip = P.gltf.animations.find((a) => a.name === 'Idle');
    if (clip) { const mx = new THREE.AnimationMixer(m); mx.clipAction(clip).play(); mx.update(o.t ?? Math.random() * 2); }
    G.updateMatrixWorld(true);
    const B = {}; m.traverse((n) => { if (n.isBone && !B[n.name]) B[n.name] = n; });
    const right = V(1, 0, 0).applyAxisAngle(V(0, 1, 0), rot);
    const turn = (name, ang, axis = right) => { const b = B[name]; if (!b) return; b.getWorldQuaternion(_q); _q.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, ang)); b.parent.getWorldQuaternion(_p); b.quaternion.copy(_p.invert().multiply(_q)); b.updateMatrixWorld(true); };
    const P_ = o.pose || [];
    if (P_.includes('sit')) { for (const s of ['Left', 'Right']) { turn(s + 'UpLeg', -1.45); turn(s + 'Leg', 1.5); } G.updateMatrixWorld(true); if (B.Hips) G.position.y += (o.seat ?? 0.62) + y - B.Hips.getWorldPosition(_v).y + 0.08; }
    if (P_.includes('drink')) { turn('RightArm', -0.55); turn('RightForeArm', -1.55); }
    if (P_.includes('sip')) { turn('RightArm', -0.9); turn('RightForeArm', -2.1); }
    if (P_.includes('tray')) { turn('LeftArm', -0.25); turn('LeftForeArm', -1.45); }
    if (P_.includes('cards')) { for (const s of ['Left', 'Right']) { turn(s + 'Arm', -0.5); turn(s + 'ForeArm', -1.15); turn(s + 'ForeArm', s === 'Left' ? -0.5 : 0.5, V(0, 1, 0)); } }
    if (P_.includes('deal')) { turn('RightArm', -0.9); turn('RightForeArm', -0.7); turn('LeftArm', -0.4); turn('LeftForeArm', -1.2); }
    if (P_.includes('lean')) { turn('Spine', 0.3); for (const s of ['Left', 'Right']) { turn(s + 'Arm', -0.9); turn(s + 'ForeArm', -0.9); } }
    if (P_.includes('sing')) { turn('RightArm', -0.7); turn('RightForeArm', -2.0); turn('LeftArm', -1.2, right); turn('Head', -0.25); }
    G.updateMatrixWorld(true);
    // where the head is: the points its Head bone moves
    const hb = new THREE.Box3();
    m.traverse((n) => {
      if (!n.isSkinnedMesh) return;
      const set = new Set(); if (B.Head) B.Head.traverse((b) => { const i = n.skeleton.bones.indexOf(b); if (i >= 0) set.add(i); });
      const si = n.geometry.attributes.skinIndex, sw = n.geometry.attributes.skinWeight, pos = n.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } }
        if (!set.has(bi)) continue; n.getVertexPosition(i, _v); _v.applyMatrix4(n.matrixWorld); hb.expandByPoint(_v); }
    });
    if (hb.isEmpty()) { hb.setFromObject(G); hb.min.y = hb.max.y - (hb.max.y - hb.min.y) * 0.3; }
    const hs = hb.getSize(new THREE.Vector3()), hc = hb.getCenter(new THREE.Vector3()), hw = Math.min(hs.x, hs.z) * 0.5 + Math.max(hs.x, hs.z) * 0.5, f = fwd(rot);
    if (o.hat) { const [type, k = 1, dy = 0, back = 0] = o.hat; let h;
      if (type === 'wizard' || type === 'crown') { h = (await proto(type === 'wizard' ? 'wizardHat' : 'crown', { tag: 'hat' })).root.clone(true); h.scale.setScalar(hw * k * (type === 'wizard' ? 1.25 / 0.74 : 0.9 / 0.27)); }
      else { h = hat(type); h.scale.setScalar(hw * k); }
      h.position.set(hc.x - f.x * back * hw, hb.max.y - hs.y * 0.1 + dy * hw, hc.z - f.z * back * hw); h.rotation.set(-0.08, rot, o.tilt ?? 0.1); scene.add(h); }
    if (o.tie) { const t = bowtie(o.tie === true ? undefined : o.tie), k = hw * (o.tieS || 1.1); t.scale.setScalar(k); const fz = Math.abs(f.x) > Math.abs(f.z) ? hs.x : hs.z;
      t.position.set(hc.x + f.x * fz * (o.tieF ?? 0.42), hb.min.y - hs.y * (o.tieD ?? 0.05), hc.z + f.z * fz * (o.tieF ?? 0.42)); t.rotation.y = rot; scene.add(t); }
    const hand = (name, key, sc = 1, lift = 0.02, dress) => { const b = B[name]; if (!b) return; b.getWorldPosition(_v); return put(key, _v.x + f.x * 0.06 * (o.s || 1), _v.z + f.z * 0.06 * (o.s || 1), rot, { y: _v.y + lift, s: sc, dress }); };
    if (o.drink) await hand('RightHand', o.drink[0], o.drink[1] || 1, o.drink[2] ?? -0.02);
    if (P_.includes('tray')) { const tr = await hand('LeftHand', 'tray', 1.1, 0.06); if (tr) for (const [dx, dz] of [[-0.12, 0], [0.1, 0.06], [0.02, -0.08]]) await put('goblet', tr.position.x + dx, tr.position.z + dz, 0, { y: tr.position.y + 0.04, dress: { tag: 'gb' } }); }
    if (P_.includes('cards') && B.LeftHand) { B.LeftHand.getWorldPosition(_v); for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(cardG, backM); c.position.set(_v.x + f.x * 0.08 + right.x * (i - 1.5) * 0.028, _v.y + 0.06, _v.z + f.z * 0.08 + right.z * (i - 1.5) * 0.028); c.rotation.set(-1.25, rot + Math.PI + (i - 1.5) * 0.16, 0, 'YXZ'); scene.add(c); } }
    if (o.id) { const c = hb.getCenter(new THREE.Vector3()); bar.npcs.push({ id: o.id, x: c.x, y: hb.max.y, z: c.z }); }
    return { G, hb };
  };

  // behind the bar
  await patron('occultist', BX - 1.2, 0, counterZ - 0.85, 0.15, { pose: ['drink'], drink: ['martini', 1.1], tie: true, tieD: 0.45, id: 'occultist' });
  await patron('dweller', BX + 2.6, 0, counterZ - 0.85, -0.2, { pose: ['tray'], hat: ['bowler', 0.95], tie: 0x1f6fae, tieD: 0.25, id: 'dweller' });
  // on the stools and the counter
  const stoolTop = 0.78;
  await patron('frog', stoolX(1), stoolTop, stoolZ, Math.PI + 0.2, { s: 5.2, hat: ['top', 0.5, -0.08], tie: true, tieS: 0.5, tieD: -0.25, tieF: 0.5, id: 'frog' });
  await onBar('martini', stoolX(1) - 0.05, 0.2, 0);
  await patron('goblin', stoolX(2) + 0.1, 0, stoolZ + 0.35, Math.PI - 0.3, { pose: ['sip'], drink: ['goblet', 1.2], hat: ['fez', 0.9] });
  await patron('penguin', stoolX(4), stoolTop, stoolZ, Math.PI, { s: 1.15, hat: ['fez', 0.8, -0.05], tie: 0x111111, tieS: 0.8, tieD: 0.1 });
  await onBar('goblet', stoolX(4) + 0.1, 0.18, 0, { dress: { tag: 'gb' } });
  await patron('owl', stoolX(5) + 0.1, cTop(stoolX(5)), counterZ + 0.05, Math.PI + 0.5, { s: 1.5, hat: ['top', 0.6, -0.05] });
  await patron('crab', stoolX(6) + 0.1, stoolTop - 0.05, stoolZ, Math.PI, { s: 0.6, hat: ['cowboy', 0.42, -0.25] });
  await patron('pirate', stoolX(7) + 0.2, 0, stoolZ + 0.1, Math.PI + 0.25, { pose: ['sit', 'drink'], seat: 0.72, drink: ['bottle', 1], id: 'pirate' });
  await patron('rat', stoolX(8) + 0.35, cTop(stoolX(8)), counterZ + 0.12, Math.PI - 0.6, { s: 0.55, hat: ['party', 0.7, -0.1] });
  await patron('behemoth', stoolX(9) + 1.7, 0, stoolZ + 0.5, Math.PI + 0.5, { s: 0.92, pose: ['sip'], drink: ['barrel', 0.9, -0.3], hat: ['bowler', 0.42, -0.1] });
  // at the card table: the regulars hold five seats, three are left for players; the dealer stands
  const players = { 1: ['goblinMage', 1.0, ['wizard', 1.0, -0.25], 'goblinmage'], 2: ['dragonborn', 0.92, ['cowboy', 0.95, -0.1], 'dragonborn'], 3: ['druid', 0.95, null, 'druid'], 5: ['starkeeper', 0.92, null], 6: ['butcher', 0.92, ['top', 0.8]] };
  for (const i of TABLES[0].npc) { const sn = seats[i], pl = players[i]; await patron(pl[0], sn.x, 0, sn.z, sn.rot, { s: pl[1], pose: ['sit', 'cards'], seat: 0.66, hat: pl[2], id: pl[3] }); }
  await patron('boneWarrior', TX, 0, TZ - 1.02, 0, { s: 0.8, pose: ['deal'], hat: ['visor', 1.0, -0.35], tie: true, tieD: 0.3, id: 'bonewarrior' });
  // working the floor, and the door
  await patron('robot', 4.6, 0, 4.3, -2.2, { pose: ['tray'], tie: true, tieD: 0.3, hat: ['bowler', 0.9], id: 'robot' });
  await patron('bear', 2.2, 0, D / 2 - 1.5, Math.PI - 0.5, { s: 1.15, hat: ['bowler', 0.55, -0.12], tie: 0x111111, tieS: 0.6, tieD: 0.0, id: 'bear' });
  // round the jukebox
  await patron('mariachi', SX - 0.75, 0, JZ + 0.55, 0.7, { pose: ['drink'], drink: ['goblet', 1.1], id: 'mariachi' });
  await patron('berserker', SX - 1.95, 0, SZ + 0.25, Math.PI / 2, { s: 0.9, pose: ['sit', 'drink'], seat: 0.42, drink: ['goblet', 1.2], hat: ['cowboy', 0.9, -0.1], id: 'berserker' });
  await patron('gnome', SX + 1.9, 0, SZ + 0.9, -Math.PI / 2, { pose: ['sit', 'sip'], seat: 0.42, drink: ['martini', 1], hat: ['fez', 0.8], id: 'gnome' });
  await patron('diver', SX + 0.95, 0, JZ + 0.7, -0.6, { s: 0.92, pose: ['lean'], id: 'diver' });
  // the big ones
  await patron('colossus', -2.4, 0, 4.9, 2.6, { s: 1.0, pose: ['drink'], drink: ['barrel', 0.9, -0.2], hat: ['top', 0.5, -0.1], id: 'colossus' });
  await patron('whisperer', 10.1, 0, -0.9, -2.2, { s: 0.95, hat: ['fez', 0.6, -0.1] });
  await patron('bogFiend', boothX + 1.75, 0, boothZ[1], -Math.PI / 2 + 0.2, { s: 0.75, pose: ['sip'], drink: ['goblet', 2.2], hat: ['cowboy', 0.5, -0.15] });
  await patron('fleshEater', boothX + 1.2, 0, boothZ[2] + 0.2, Math.PI / 2 + 2.6, { s: 0.9, hat: ['party', 0.5, -0.15] });
  await patron('swampChild', boothX + 0.25, 0.5, boothZ[0], Math.PI / 2, { pose: ['sit', 'drink'], seat: 0.02, drink: ['goblet', 1] });
  // blackjack and the cantina tables
  await patron('varka', 9.05, 0, 2.2, -Math.PI / 2, { pose: ['deal'], hat: ['visor', 1.0, -0.35] });
  await patron('raptor', 7.15, 0.6, 2.2, Math.PI / 2, { s: 0.75, hat: ['party', 0.5, -0.2] });
  await patron('fox', 5.5, 0.0, 5.2, 0.9, { s: 0.9, hat: ['bowler', 0.45, -0.15], tie: true, tieS: 0.6 });
  await patron('bloom', 9.9, 0, 6.3, -2.4, { pose: ['drink'], drink: ['martini', 1.1] });
  // up in the loft
  await patron('mantis', 2.9, LY, -5.2, 0.5, { s: 0.3, hat: ['top', 0.7, -0.1] });
  await patron('hiveBug', -9.6, LY, -3.4, 1.2, { s: 0.32, hat: ['cowboy', 0.6, -0.2] });
  await patron('goblin', -0.6, LY, LZ - 0.45, 0, { pose: ['lean'], hat: ['party', 0.8] });
  await patron('pirate', LX - 0.5, LY, 0.6, Math.PI / 2, { pose: ['lean', 'drink'], drink: ['goblet', 1.2] });
  await patron('starkeeper', -9.6, LY, 2.6, 2.4, { s: 0.92, pose: ['drink'], drink: ['martini', 1] });
  await patron('croc', -5.9, LY, -6.9, 1.2, { s: 0.6, hat: ['top', 0.3, -0.1] });

  // --- smoke: drifting layers, thickest under the loft and up in the rafters ---
  { const tex = smokeTex(), tint = new THREE.Color(T.haze).multiplyScalar(0.16);
    const puff = (x, y, z, size, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: tint, transparent: true, opacity: op, depthWrite: false, rotation: Math.random() * 6.28, fog: false })); s.position.set(x, y, z); s.scale.set(size * (1.2 + Math.random()), size * 0.7, 1); s.renderOrder = 9; scene.add(s); };
    for (let i = 0; i < (Q.low ? 30 : 110); i++) { const band = Math.random(); const y = band < 0.4 ? 1.3 + Math.random() * 1.6 : band < 0.75 ? 3.9 + Math.random() * 1.6 : 6 + Math.random() * 1.6;
      puff((Math.random() - 0.5) * (W - 2), y, (Math.random() - 0.5) * (D - 2), 3 + Math.random() * 4, 0.05 + Math.random() * 0.07); }
    for (let i = 0; i < (Q.low ? 6 : 18); i++) puff(BX + (Math.random() - 0.5) * 10, 1.6 + Math.random() * 1.3, counterZ + 0.4 + Math.random() * 1.6, 2 + Math.random() * 2, 0.09);
    for (let i = 0; i < (Q.low ? 5 : 14); i++) puff(TX + (Math.random() - 0.5) * 4, 1.5 + Math.random() * 2.2, TZ + (Math.random() - 0.5) * 3, 2 + Math.random() * 2.5, 0.08);
    for (let i = 0; i < (Q.low ? 4 : 10); i++) puff(SX + (Math.random() - 0.5) * 4, 1.4 + Math.random() * 2.5, SZ + Math.random() * 2.5, 2.5 + Math.random() * 2.5, 0.1);
    const n = Q.low ? 500 : 1400, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * W; p[i * 3 + 1] = 0.3 + Math.random() * (H - 0.6); p[i * 3 + 2] = (Math.random() - 0.5) * D; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: T.haze, size: 0.016, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }))); }

  // --- what the cards and the controls use: table buttons, seat markers ---
  const label = (text, bg, fg) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 128, 128); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 26px system-ui, sans-serif'; x.fillText(text, 64, 66); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const sprite = (text, color, w = 0.2) => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.font = 'bold 40px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 6; x.strokeStyle = 'rgba(0,0,0,.85)'; x.strokeText(text, 128, 34, 250); x.fillStyle = color; x.fillText(text, 128, 34, 250);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); sp.scale.set(w, w / 4, 1); return sp; };
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x7fe3b0, transparent: true, opacity: 0.7 });
  TABLES.forEach((TB, t) => {
    [['SHUFFLE', '#8c1c2b', '#ffd9a0'], ['DEAL', '#c9962b', '#231405']].forEach(([text, bg, fg], which) => {
      const bp = buttonPos(t, which), cap = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.038, 0.016, 28), [new THREE.MeshStandardMaterial({ color: bg, roughness: 0.4 }), new THREE.MeshStandardMaterial({ map: label(text, bg, fg), roughness: 0.4 }), new THREE.MeshStandardMaterial({ color: bg })]);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.046, 0.008, 28), brassM); base.position.set(bp.x, bp.y + 0.004, bp.z);
      cap.position.set(bp.x, bp.y + 0.016, bp.z); cap.userData = { button: { t, which }, restY: bp.y + 0.016 }; scene.add(base, cap); bar.buttonMeshes.push(cap);
    });
    const row = [];
    for (const sn of TB.free) { const si = seatInfo(t, sn), mk = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), markerMat); mk.position.set(si.x, si.y + 1.2, si.z); mk.userData.seat = { t, s: sn }; const sp = sprite('SIT', '#bfffdc'); sp.position.y = 0.12; mk.add(sp); mk.visible = false; scene.add(mk); row.push(mk); }
    bar.seatMarkers.push(row);
  });
  bar.standMarker = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffb36b, transparent: true, opacity: 0.75 }));
  { const sp = sprite('STAND', '#ffe1c4', 0.16); sp.position.y = 0.1; bar.standMarker.add(sp); bar.standMarker.userData.stand = true; bar.standMarker.visible = false; scene.add(bar.standMarker); }
  // names over the regulars you can talk to
  for (const n of bar.npcs) { n.name = (Q.names && Q.names[n.id]) || n.id; n.tag = sprite(n.name, '#ffe9c0', 0.42); n.tag.position.set(n.x, n.y + 0.28, n.z); n.tag.visible = false; scene.add(n.tag); }

  // keep a walker of radius r out of the walls, the tables, the bar, the jukebox and off the loft's edge; changes p (x, z), reads p.y
  const solid = [[BX - 5.2, counterZ - 0.45, BX + 5.2, counterZ + 0.45], [SX - 0.65, -D / 2, SX + 0.65, JZ + 0.5], [SX - 2.5, SZ + 0.1, SX - 1.5, SZ + 1.6], [SX + 1.5, SZ + 0.1, SX + 2.5, SZ + 1.6], [-W / 2, boothZ[0] - 1.3, boothX + 0.75, boothZ[2] + 1.3], [7.6, 1.2, 9.2, 3.2], [BX - 5.2, -D / 2, BX + 7.2, backZ + 0.4]];
  bar.collide = (p, r) => {
    const up = (p.y || 0) > LY - 0.7 && !onStair(p.x, p.z);
    p.x = Math.max(-W / 2 + r + 0.1, Math.min(W / 2 - r - 0.1, p.x)); p.z = Math.max(-D / 2 + r + 0.1, Math.min(D / 2 - r - 0.1, p.z));
    if (up) {   // on the loft: stay behind the rail, but for the head of the stair
      if (!inLoft(p.x, p.z)) { const toLeft = LX - p.x, toBack = LZ - p.z; if (p.x < LE && (toBack > toLeft || p.z < LZ + 0.5) && p.x >= LX) p.z = LZ - r * 0.5; else p.x = LX - r * 0.5; }
      else { if (p.x > LX - r && p.z > LZ && Math.abs(p.z - LOFT.stz) > LOFT.half) p.x = LX - r; if (p.z > LZ - r && p.x > LX && p.x < LE) p.z = LZ - r; if (p.x > LE - r && p.z < LZ) p.x = LE - r; }
      const dx = p.x - TABLES[1].x, dz = p.z - TABLES[1].z, dd = Math.hypot(dx, dz), mn = 0.62 + r; if (dd < mn) { p.x = TABLES[1].x + dx / (dd || 1) * mn; p.z = TABLES[1].z + dz / (dd || 1) * mn; }
      return p;
    }
    if (onStair(p.x, p.z)) return p;
    if ((p.y || 0) < 0.3 && p.x > LX && p.x < LX + LOFT.run + r && Math.abs(Math.abs(p.z - LOFT.stz) - LOFT.half - r * 0.5) < r * 0.5 && p.x < LX + LOFT.run - 0.3) p.z = LOFT.stz + Math.sign(p.z - LOFT.stz) * (LOFT.half + r);
    for (const [x0, z0, x1, z1] of solid) if (p.x > x0 - r && p.x < x1 + r && p.z > z0 - r && p.z < z1 + r) { const e = [p.x - (x0 - r), (x1 + r) - p.x, p.z - (z0 - r), (z1 + r) - p.z], k = e.indexOf(Math.min(...e)); if (k === 0) p.x = x0 - r; else if (k === 1) p.x = x1 + r; else if (k === 2) p.z = z0 - r; else p.z = z1 + r; }
    { const TB = TABLES[0], dx = (p.x - TB.x) / (1.62 + r), dz = (p.z - TB.z) / (0.78 + r), dd = Math.hypot(dx, dz); if (dd < 1) { p.x = TB.x + dx / (dd || 1) * (1.62 + r); p.z = TB.z + dz / (dd || 1) * (0.78 + r); } }
    return p;
  };
  bar.press = (t, which) => bar.pressT.set(t * 2 + which, 0.25);
  bar.update = (dt, time, eye) => {
    for (const cap of bar.buttonMeshes) { const key = cap.userData.button.t * 2 + cap.userData.button.which, left = bar.pressT.get(key) || 0; if (left > 0) bar.pressT.set(key, left - dt); cap.position.y = cap.userData.restY - (left > 0 ? 0.008 * Math.sin((left / 0.25) * Math.PI) : 0); }
    if (eye) for (const n of bar.npcs) n.tag.visible = Math.hypot(n.x - eye.x, n.z - eye.z) < 3.4 && Math.abs(n.y - eye.y) < 2.6;
  };
  bar.dispose = () => { real.remove(scene); scene.traverse((o) => { if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose(); }); };
  return bar;
}
