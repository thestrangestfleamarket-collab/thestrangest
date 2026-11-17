// THE GARAGE's makers: photographed surfaces with their relief and sheen (data/drums/tex), Poly Haven's things (data/drums/m), the kit's own drawn surfaces
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { pbr as drawn, fbm } from '../jam/textures.js';

export const BASE = '/drums-assets/';
const TL = new THREE.TextureLoader(), GL = new GLTFLoader(), sets = {}, models = {}, made = new Map();
export const TEX = ['floor', 'block', 'ply', 'carpet', 'door', 'drive', 'paint', 'fence', 'brick', 'fabric', 'grass', 'road'];
export const MODELS = ['steel_frame_shelves_01', 'steel_frame_shelves_02', 'metal_tool_chest', 'metal_toolbox', 'bench_vice_01', 'drill_01', 'adjustable_wrench', 'combination_wrench', 'cross_pein_hammer', 'handsaw_wood', 'pipe_wrench',
  'ratchet_wrench', 'boombox', 'cardboard_box_01', 'plastic_crate_01', 'plastic_crate_02', 'metal_jerrycan', 'plastic_jerrycan', 'propane_tank', 'spray_paint_bottles', 'lubricant_spray', 'small_oil_can_01', 'tire_pump',
  'garden_hose_wall_mounted_01', 'korean_fire_extinguisher_01', 'ladder_sectioned_01', 'metal_trash_can', 'trashbag', 'plastic_broom', 'mounted_fluorescent_lights', 'hanging_industrial_lamp', 'power_box_01', 'utility_box_01',
  'television_01', 'sofa_01', 'wall_clock', 'metal_stool_01', 'desk_lamp_arm_01', 'bleach_bottle', 'plastic_bottle_gallon', 'wooden_ladder', 'watering_can_metal_01', 'american_football', 'old_military_crate', 'wooden_crate_02',
  'tool_cart', 'cassette_player', 'potted_plant_01', 'potted_plant_04', 'planter_box_01', 'worn_metal_rack', 'industrial_wall_lamp', 'can_rusted', 'multi_cleaner_bottle', 'armchair_01', 'coffeetable_01', 'painted_wooden_cabinet', 'dartboard', 'wooden_bookshelf_worn', 'car', 'street_lamp_01', 'fire_hydrant'];
export const PEOPLE = ['Male_Adult_03', 'Male_Adult_05', 'Male_Adult_06', 'Male_Adult_08', 'Female_Adult_01', 'Female_Adult_02', 'Female_Adult_04', 'Female_Adult_09', 'Security_Male_01'];
// the street's people (Microsoft Rocketbox avatars) and their recorded motion, and the car's five paints
export const P = { body: {}, clip: { m: {}, f: {} }, car: [] };
const FACE = /Eye|Jaw|lip|Tongue|Mouth|Masseter|Caninus|Cheek|Nose|Finger|Toe|Footsteps|Nub/i;

const one = (url, srgb, aniso) => TL.loadAsync(url).then((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = aniso; return t; }).catch(() => null);
export async function loadAssets(onProgress = () => { }, aniso = 4) {
  let n = 0; const all = TEX.length + MODELS.length + PEOPLE.length + 11, tick = (v) => { onProgress(++n / all); return v; };
  await Promise.all([
    ...TEX.map((k) => Promise.all([one(`${BASE}tex/${k}_c.jpg`, true, aniso), one(`${BASE}tex/${k}_n.jpg`, false, aniso), k === 'road' ? null : one(`${BASE}tex/${k}_r.jpg`, false, aniso)]).then((t) => { sets[k] = t; }).then(tick)),
    ...MODELS.map((k) => GL.loadAsync(`${BASE}m/${k}.glb`).then((d) => {
      d.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material.envMapIntensity = 0.6; if (o.material.emissiveIntensity > 0.1) o.material.emissiveIntensity = 0.1; if (o.material.transmission > 0) { o.material.transmission = 0; o.material.transparent = true; o.material.opacity = 0.35; } } });
      models[k] = d.scene;
    }).catch((e) => console.warn('no model', k, e)).then(tick)),
    // each avatar sized to 1.76 m; each motion kept as turns of the body's bones and the hips' rise, its walk held in place
    ...PEOPLE.map((n) => GL.loadAsync(`${BASE}p/${n}.glb`).then((g) => { g.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(g.scene); g.scene.traverse((m) => { if (m.isMesh && m.material.transparent) { m.material.transparent = false; m.material.alphaTest = 0.4; } }); P.body[n] = { scene: g.scene, fit: 1.76 / (b.max.y - b.min.y) }; }).catch((e) => console.warn('no person', n, e)).then(tick)),
    ...['m', 'f'].flatMap((s) => ['walk', 'idle', 'talk'].map((c) => GL.loadAsync(`${BASE}p/a_${s}_${c}.glb`).then((g) => { const clip = g.animations[0], keep = [];
      for (const t of clip.tracks) { if (FACE.test(t.name)) continue; if (t.name.endsWith('.quaternion')) keep.push(t); else if (/Pelvis\.position$/.test(t.name)) { const v = t.values, n = v.length / 3; for (let a = 0; a < 3; a++) { const d = v[(n - 1) * 3 + a] - v[a]; if (Math.abs(d) > 8) for (let i = 0; i < n; i++) v[i * 3 + a] = v[a] + (v[i * 3 + a] - v[a] - d * i / (n - 1)); } keep.push(t); } }
      clip.tracks = keep; clip.name = c; P.clip[s][c] = clip; }).catch((e) => console.warn('no motion', s, c, e)).then(tick))),
    ...[0, 1, 2, 3, 4].map((i) => TL.loadAsync(`${BASE}tex/car_${i}.jpg`).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; P.car[i] = t; }).catch(() => null).then(tick)),
  ]);
}

// a photographed surface by name: tile metres across, a tint, how rough and how much metal
export function pbr(name, o = {}) {
  const k = name + '|' + JSON.stringify(o); if (made.has(k)) return made.get(k);
  const [c, n, r] = sets[name] || [], m = new THREE.MeshStandardMaterial({ map: c || null, normalMap: n || null, roughnessMap: r || null, color: o.color ?? 0xffffff, roughness: o.rough ?? 1, metalness: o.metal ?? 0, envMapIntensity: o.env ?? 0.5, side: o.side ?? THREE.FrontSide });
  if (n) m.normalScale.setScalar(o.bump ?? 1.2); m.userData.tile = o.tile ?? 1; made.set(k, m); return m;
}
export const plain = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0, envMapIntensity: o.env ?? 0.5, transparent: !!o.opacity, opacity: o.opacity ?? 1, emissive: o.glow ?? 0, emissiveIntensity: o.glowK ?? 1, side: o.side ?? THREE.FrontSide });

// a box whose picture is laid by the metre on every face (material.userData.tile metres a tile)
export function slabGeo(w, h, d, tile = 1, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / tile, uv.getY(k) * dims[f][1] / tile); }
  return g.translate(x, y, z);
}
export function slab(w, h, d, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(slabGeo(w, h, d, material.userData.tile || 1), material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
}

// a model stood at (x, y, z), turned ry, made h tall (or w wide, or scaled s); its size comes back as .userData.size
const _b = new THREE.Box3(), _s = new THREE.Vector3();
export function model(name, x = 0, y = 0, z = 0, ry = 0, o = {}, parent) {
  const src = models[name], g = new THREE.Group(); if (!src) return g;
  const m = src.clone(true); _b.setFromObject(m); _b.getSize(_s); const s = o.h ? o.h / _s.y : o.w ? o.w / Math.max(_s.x, _s.z) : o.s ?? 1;
  m.scale.multiplyScalar(s); m.position.set(-(_b.min.x + _b.max.x) / 2 * s, -_b.min.y * s, -(_b.min.z + _b.max.z) / 2 * s); g.add(m);
  g.position.set(x, y, z); g.rotation.set(o.rx ?? 0, ry, o.rz ?? 0); g.userData.size = _s.clone().multiplyScalar(s); if (o.shadow === false) g.traverse((q) => { q.castShadow = false; }); if (parent) parent.add(g); return g;
}
export const hasModel = (n) => !!models[n];
export const modelSize = (n) => { const src = models[n]; if (!src) return null; _b.setFromObject(src); return _b.getSize(new THREE.Vector3()); };

export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

// the kit's own surfaces, drawn once: a coated head worn in the middle, lathed bronze, sparkle wrap, hickory and maple
export function kitTextures(low) {
  const M = low ? 128 : 512, bump = !low, hash = (x, y, s) => { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const wood = (r, g, b, seed) => drawn(M, (u, v) => { const grain = fbm(u, v, 3, 90, 4, seed), fig = fbm(u, v, 2, 6, 3, seed + 9), k = 0.72 + grain * 0.4 + fig * 0.12; return [Math.min(1, r * k), Math.min(1, g * k), Math.min(1, b * k), grain, 0.38 + grain * 0.25]; }, { bump });
  return {
    maple: wood(0.8, 0.62, 0.38, 51),
    shell: drawn(M, (u, v) => { const grain = fbm(u, v, 70, 3, 4, 57), fig = fbm(u, v, 5, 2, 3, 59), k = 0.55 + grain * 0.5 + fig * 0.2; return [Math.min(1, k), Math.min(1, k * 0.96), Math.min(1, k * 0.9), grain, 0.5]; }, { repeat: [2, 1], bump }),
    hickory: wood(0.86, 0.72, 0.5, 63),
    head: drawn(M, (u, v) => { const r = Math.hypot(u - 0.5, v - 0.5) * 2, n = fbm(u, v, 64, 64, 2, 71), wear = Math.max(0, 1 - r / 0.45) * (0.5 + fbm(u, v, 9, 9, 3, 73)), c = 0.9 - n * 0.06 - wear * 0.22; return [c, c * 0.985, c * 0.94, n, 0.8 - wear * 0.32]; }, { bump }),
    cymbal: drawn(M, (u, v) => { const rings = 0.5 + 0.5 * Math.sin(v * 330), hammer = fbm(u, v, 28, 10, 2, 81), patina = fbm(u, v, 5, 3, 4, 83), k = 0.7 + rings * 0.14 + patina * 0.28; return [0.92 * k, 0.74 * k, 0.4 * k, rings * 0.6 + hammer * 0.4, 0.22 + rings * 0.14 + patina * 0.22]; }, { bump }),
  };
}
