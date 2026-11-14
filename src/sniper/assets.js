// COLD BORE's pictures and models from disk: the skies (Poly Haven), the surfaces with their relief, the rifle and the props, fetched once and shared
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BASE = 'sniper-assets/', TEX = ['asphalt_02', 'rectangular_paving', 'aerial_grass_rock', 'hessian_230', 'container_side', 'corrugated_iron', 'wood_floor_deck', 'concrete_floor_02', 'painted_concrete', 'brick_wall_001', 'grey_plaster_02', 'aerial_rocks_02'], CARDS = ['fir', 'leaf'];
const MODELS = ['ksr29', 'ammo_box', 'concrete_road_barrier', 'street_lamp_01', 'covered_car', 'ocean_buoy', 'old_military_crate', 'binoculars', 'barrel_01', 'wooden_crate_02', 'metal_trash_can', 'fire_hydrant', 'potted_plant_04', 'old_tyre', 'metal_jerrycan_green', 'painted_wooden_bench', 'wooden_picnic_table', 'cardboard_box_01', 'propane_tank', 'vintage_suitcase', 'car', 'chopper'];
const PEOPLE = ['Business_Male_01', 'Business_Male_03', 'Business_Male_04', 'Business_Male_05', 'Business_Male_06', 'Business_Male_07', 'Business_Female_01', 'Business_Female_02', 'Business_Female_03', 'Security_Male_01', 'Military_Male_03', 'Pilot_Male_03', 'Male_Adult_03', 'Male_Adult_05', 'Male_Adult_06', 'Male_Adult_08', 'Female_Adult_01', 'Female_Adult_02', 'Female_Adult_04', 'Female_Adult_09'];
const MOVES = { m: ['idle', 'phone', 'talk', 'sit', 'crouch', 'look', 'walk', 'run'], f: ['idle', 'phone', 'talk', 'sit', 'crouch', 'walk', 'run'] }, FACE = /Eye|Jaw|lip|Tongue|Mouth|Masseter|Caninus|Cheek|Nose|Finger|Toe|Footsteps|Nub/i;
export const A = { tex: {}, m: {}, sky: {}, card: {}, p: {}, clip: { m: {}, f: {} }, carTex: [], info: {}, ok: false };

export async function loadAssets(onProgress) {
  const tl = new THREE.TextureLoader(), gl = new GLTFLoader(); let done = 0; const total = TEX.length * 3 + MODELS.length + 1 + CARDS.length + PEOPLE.length + MOVES.m.length + MOVES.f.length + 5, tick = () => onProgress && onProgress(++done / total);
  const tex = (url, srgb) => tl.loadAsync(BASE + url).then((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; tick(); return t; });
  const jobs = [fetch(BASE + 'sky/sky.json').then(r => r.json()).then((j) => { A.info = j; tick(); })];
  for (const s of TEX) { A.tex[s] = {}; jobs.push(tex('tex/' + s + '_d.jpg', true).then(t => { A.tex[s].d = t; }), tex('tex/' + s + '_n.jpg').then(t => { A.tex[s].n = t; }), tex('tex/' + s + '_a.jpg').then(t => { A.tex[s].a = t; })); }
  for (const m of MODELS) jobs.push(gl.loadAsync(BASE + 'm/' + m + '.glb').then((g) => { A.m[m] = g.scene; tick(); }));
  for (const c of CARDS) jobs.push(tl.loadAsync(BASE + 'tex/' + c + '.png').then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; A.card[c] = t; tick(); }));
  for (let i = 0; i < 5; i++) jobs.push(tl.loadAsync(BASE + 'tex/car_' + i + '.jpg').then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 4; A.carTex[i] = t; tick(); }));
  // the people: each avatar sized to 1.76 m, standing on the ground, facing +Z; each motion kept as turns of the body's bones and the hips' rise, its walk held in place
  for (const n of PEOPLE) jobs.push(gl.loadAsync(BASE + 'p/' + n + '.glb').then((g) => { g.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(g.scene); g.scene.traverse((m) => { if (m.isMesh && m.material.transparent) { m.material.transparent = false; m.material.alphaTest = 0.4; } }); A.p[n] = { scene: g.scene, fit: 1.76 / (b.max.y - b.min.y) }; tick(); }));
  for (const s of ['m', 'f']) for (const c of MOVES[s]) jobs.push(gl.loadAsync(BASE + 'p/a_' + s + '_' + c + '.glb').then((g) => { const clip = g.animations[0], keep = [];
    for (const t of clip.tracks) { if (FACE.test(t.name)) continue; if (t.name.endsWith('.quaternion')) keep.push(t); else if (/Pelvis\.position$/.test(t.name)) { const v = t.values, n = v.length / 3; for (let a = 0; a < 3; a++) { const d = v[(n - 1) * 3 + a] - v[a]; if (Math.abs(d) > 8) for (let i = 0; i < n; i++) v[i * 3 + a] = v[a] + (v[i * 3 + a] - v[a] - d * i / (n - 1)); } keep.push(t); } }
    clip.tracks = keep; clip.name = c; A.clip[s][c] = clip; tick(); }));
  await Promise.all(jobs); A.ok = true;
}
// a sky's picture and its small copy for the light, fetched the first time its hour is wanted
export function sky(name) {
  const one = (f) => new THREE.TextureLoader().loadAsync(BASE + 'sky/' + f + '.jpg').then((t) => { t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t; });
  if (!A.sky[name]) A.sky[name] = Promise.all([one(name), one(name + '_s')]).then(([bg, env]) => ({ bg, env }));
  return A.sky[name];
}
// a surface as a lit material: colour, relief, and its roughness and shade
export function surface(slug, o = {}) { const t = A.tex[slug]; return new THREE.MeshStandardMaterial({ map: t.d, normalMap: t.n, roughnessMap: t.a, aoMap: t.a, metalnessMap: o.metal ? t.a : null, metalness: o.metal ? 1 : 0, roughness: 1, vertexColors: true, ...(o.props || {}) }); }
