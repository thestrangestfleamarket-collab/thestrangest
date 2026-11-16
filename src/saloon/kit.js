// THE LAST CHANCE's makers: photographed surfaces with their relief and sheen (data/saloon/tex), Poly Haven's furniture (data/saloon/m), boxes laid by the metre, 
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { G } from '../sushi/ctx.js';

export const BASE = '/saloon-assets/';
const TL = new THREE.TextureLoader(), GL = new GLTFLoader(), sets = {}, models = {};
export const TEX = ['floor', 'wall', 'planks', 'dark', 'walnut', 'paper', 'velvet', 'leather', 'dirt', 'rust', 'plate', 'plaster', 'siding'];
export const MODELS = ['round_wooden_table_01', 'woodentable_02', 'woodenchair_01', 'wooden_stool_01', 'lantern_chandelier_01', 'vintage_oil_lamp', 'lantern_01', 'wine_barrel_01', 'wooden_crate_01', 'dartboard', 'ornate_mirror_01', 'fancy_picture_frame_01',
  'hanging_picture_frame_01', 'vintage_grandfather_clock_01', 'cashregister_01', 'wooden_bucket_01', 'brass_candleholders', 'jug_01', 'barrel_stove', 'rockingchair_01', 'painted_wooden_bench', 'brass_pot_01', 'mantel_clock_01', 'wooden_display_shelves_01', 'hatchet', 'painted_wooden_chair_02', 'painted_wooden_table', 'wooden_candlestick', 'wooden_lantern_01', 'hanging_picture_frame_02', 'wooden_barrels_01', 'vintage_cabinet_01', 'brass_vase_03', 'wooden_broom', 'vintage_suitcase', 'wooden_ladder'];

const one = (url, srgb) => TL.loadAsync(url).then((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; return t; }).catch(() => null);
export async function loadKit(onProgress = () => { }) {
  let n = 0; const all = TEX.length + MODELS.length, tick = (v) => { onProgress(++n / all); return v; };
  await Promise.all([
    ...TEX.map((k) => Promise.all([one(`${BASE}tex/${k}_c.jpg`, true), one(`${BASE}tex/${k}_n.jpg`), one(`${BASE}tex/${k}_r.jpg`)]).then((s) => { sets[k] = s; }).then(tick)),
    ...MODELS.map((k) => GL.loadAsync(`${BASE}m/${k}.glb`).then((d) => { d.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material.envMapIntensity = 0.7; } }); models[k] = d.scene; }).catch((e) => console.warn('no model', k, e)).then(tick)),
  ]);
}

// a surface by name: tile metres across, a tint, how rough and how much metal
const made = new Map();
export function pbr(name, o = {}) {
  const k = name + '|' + JSON.stringify(o); if (made.has(k)) return made.get(k);
  const [c, n, r] = sets[name] || [], m = new THREE.MeshStandardMaterial({ map: c || null, normalMap: n || null, roughnessMap: r || null, color: o.color ?? 0xffffff, roughness: o.rough ?? 1, metalness: o.metal ?? 0, envMapIntensity: o.env ?? 0.6, side: o.side ?? THREE.FrontSide });
  if (n) m.normalScale.setScalar(o.bump ?? 1); m.userData.tile = o.tile ?? 1; made.set(k, m); return m;
}
export const plain = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0, envMapIntensity: o.env ?? 0.8, transparent: !!o.opacity, opacity: o.opacity ?? 1, emissive: o.glow ?? 0, emissiveIntensity: o.glowK ?? 1, side: o.side ?? THREE.FrontSide });
export const brass = () => plain(0xb08a3a, { rough: 0.32, metal: 1, env: 1.2 });

// a box whose picture is laid by the metre on every face (material.userData.tile metres a tile)
export function slab(w, h, d, material, x = 0, y = 0, z = 0, parent, turn) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, t = material.userData.tile || 1, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i, [a, b] = turn ? [dims[f][1], dims[f][0]] : dims[f]; if (turn) uv.setXY(k, uv.getY(k) * a / t, uv.getX(k) * b / t); else uv.setXY(k, uv.getX(k) * a / t, uv.getY(k) * b / t); }
  const m = new THREE.Mesh(g, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
}
export function tube(rt, rb, h, material, x = 0, y = 0, z = 0, parent, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m; }

// a model stood on the floor at (x, z), turned ry, made h tall (or scaled s); its box comes back as .userData.box
const _b = new THREE.Box3(), _s = new THREE.Vector3();
export function model(name, x = 0, y = 0, z = 0, ry = 0, o = {}, parent) {
  const src = models[name], g = new THREE.Group(); if (!src) return g;
  const m = src.clone(true); _b.setFromObject(m); _b.getSize(_s); const s = o.h ? o.h / _s.y : o.w ? o.w / Math.max(_s.x, _s.z) : o.s ?? 1;
  m.scale.multiplyScalar(s); m.position.set(-(_b.min.x + _b.max.x) / 2 * s, -_b.min.y * s, -(_b.min.z + _b.max.z) / 2 * s); g.add(m);
  g.position.set(x, y, z); g.rotation.y = ry; g.userData.size = _s.clone().multiplyScalar(s); if (parent) parent.add(g); return g;
}
export const hasModel = (n) => !!models[n];

// words and pictures drawn on a canvas
export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
export const glow = (() => { let t; return () => (t ||= canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,220,160,.35)'); g.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); })); })();
