// Asset loading + caching (GLB aircraft, PBR textures, audio buffers)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeNoiseTexture, makeWaterNormal, makeRunwayTexture } from './world.js';

const gltf = new GLTFLoader(), texLoader = new THREE.TextureLoader();
const T = (name, srgb = true, aniso = 8) => new Promise(res => texLoader.load(`fly-assets/tex/${name}.jpg`, t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; res(t); }, undefined, () => res(null)));

export async function loadTextures() {
  const names = { grass: 'aerial_grass_rock_diff', grassN: ['aerial_grass_rock_nor'], rock: 'aerial_rocks_02_diff', sand: 'aerial_beach_01_diff', snow: 'snow_02_diff', forest: 'forest_ground_04_diff', cliff: 'rock_face_diff',
    concrete: 'concrete_panels_diff', concreteN: ['concrete_panels_nor'], 
    metal: 'metal_plate_diff', metalN: ['metal_plate_nor'], metalR: ['metal_plate_rough'], leather: 'brown_leather_diff', leatherN: ['brown_leather_nor'], wood: 'wood_table_worn_diff', woodN: ['wood_table_worn_nor'], canvas: 'hessian_230_diff', canvasN: ['hessian_230_nor'], rust: 'rusty_metal_02_diff', rustN: ['rusty_metal_02_nor'], rustR: ['rusty_metal_02_rough'] };
  const out = {}; await Promise.all(Object.entries(names).map(async ([k, v]) => { out[k] = Array.isArray(v) ? await T(v[0], false) : await T(v); }));
  out.trees = await new Promise(res => texLoader.load('fly-assets/tex/trees.webp', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t); }));
  out.concrete2 = out.concrete; out.noise = makeNoiseTexture(); out.waterN = makeWaterNormal(); out.runway = makeRunwayTexture();
  return out;
}

const planeCache = new Map();
export function loadPlane(id) {
  if (!planeCache.has(id)) planeCache.set(id, (async () => {
    const [full, lod, meta] = await Promise.all([gltf.loadAsync(`fly-assets/planes/${id}.glb`), gltf.loadAsync(`fly-assets/planes/${id}_lod.glb`), fetch(`fly-assets/planes/${id}.json`).then(r => r.json())]);
    lod.scene.traverse(o => { if (o.isMesh) { o.geometry.computeVertexNormals(); o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.15 }); } });
    full.scene.traverse(o => { if (o.isMesh) { const m = o.material; m.side = THREE.FrontSide; if (m.map) m.map.anisotropy = 8; m.envMapIntensity = 1; } });
    return { full: full.scene, lod: lod.scene, meta };
  })());
  return planeCache.get(id);
}
const partCache = new Map();
export function loadPart(name) { if (!partCache.has(name)) partCache.set(name, gltf.loadAsync(`fly-assets/cockpit/${name}.glb`).then(g => g.scene).catch(() => null)); return partCache.get(name); }
