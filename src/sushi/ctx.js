// what every file of the cart shares: the scene's roots, the lists of things to hold, press and set down, small makers
import * as THREE from 'three';

export const G = {
  scene: null, camera: null, rig: null, renderer: null,
  itemRoot: null, pickRoot: null, peopleRoot: null,
  items: [], sources: [], targets: [], buttons: [], surfaces: [], hands: [],
  updaters: [],          // fn(dt, t)
  mode: 'menu',          // menu | desktop | vr
  t: 0,
  hint: '',
  audio: null, cart: null, game: null, fx: null,
};

export const V3 = THREE.Vector3;
export const Q = THREE.Quaternion;
export const UP = new THREE.Vector3(0, 1, 0);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const pick = (arr) => arr[(Math.random() * arr.length) | 0];

// Player walkable area behind the counter (head position clamp).
export const BOUNDS = { minX: -0.52, maxX: 0.52, minZ: -0.02, maxZ: 1.22 };

const DROP = new Set(['roughness', 'metalness', 'envMapIntensity', 'normalMap', 'clearcoat', 'clearcoatRoughness', 'sheen', 'sheenRoughness', 'sheenColor', 'transmission', 'thickness', 'roughnessMap']);
export function mat(o = {}) { const p = {}; for (const k in o) if (!DROP.has(k) && o[k] !== undefined) p[k] = o[k]; return new THREE.MeshLambertMaterial(p); }
// bake: still meshes of like material under one parent become one mesh (one draw instead of hundreds)
export function mergeStatic(root) {
  const by = new Map(), inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
  const sig = (m) => { const a = m.material; return [a.type, a.color ? a.color.getHex() : 0, a.map ? a.map.uuid : 0, a.transparent, a.opacity, a.side, a.emissive ? a.emissive.getHex() : 0, a.emissiveMap ? a.emissiveMap.uuid : 0, a.emissiveIntensity, a.alphaTest, a.blending, a.toneMapped, a.depthWrite, a.depthTest, a.fog, a.vertexColors, m.castShadow, m.receiveShadow, m.renderOrder, m.userData.source ? m.userData.source.name : ''].join('|'); };
  root.updateWorldMatrix(true, true); inv.copy(root.matrixWorld).invert();
  const walk = (o) => { for (const m of o.children) {
    const u = m.userData; if (u.dyn || u.keep || u.button || u.item || !m.visible) continue; // moving or pressable things stay as they are
    if (m.isMesh && !m.isInstancedMesh && !m.isSkinnedMesh && !Array.isArray(m.material) && !m.children.length && !u.nopick) { const g = m.geometry.attributes; if (g.position && g.normal && g.uv && !g.color) { const k = sig(m); if (!by.has(k)) by.set(k, []); by.get(k).push(m); } }
    else if (!m.isMesh && !m.isSprite && !m.isLight && !m.isLine && !m.isPoints && m.children.length) walk(m);
  } };
  walk(root);
  let saved = 0;
  for (const list of by.values()) {
    if (list.length < 2) continue;
    const pos = [], nor = [], uv = [], idx = []; let off = 0;
    for (const m of list) { rel.multiplyMatrices(inv, m.matrixWorld); const g = m.geometry.clone().applyMatrix4(rel), p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); uv.push(u.getX(i), u.getY(i)); }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + off); else for (let i = 0; i < p.count; i++) idx.push(i + off);
      off += p.count; g.dispose(); m.removeFromParent(); }
    const G2 = new THREE.BufferGeometry(); G2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G2.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G2.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); G2.setIndex(idx);
    const M = new THREE.Mesh(G2, list[0].material); M.castShadow = list[0].castShadow; M.receiveShadow = list[0].receiveShadow; M.renderOrder = list[0].renderOrder; if (list[0].userData.source) M.userData.source = list[0].userData.source; root.add(M); saved += list.length - 1;
  }
  return saved;
}

export function mesh(geo, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
export function box(w, h, d, material, x, y, z, parent) { return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, parent); }
export function cyl(rt, rb, h, material, x, y, z, parent, seg = 24, open = false) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), material, x, y, z, parent); }

// Quaternion that maps local -Z onto `dir` (grip-forward convention), keeping local +Y near world up.
const _m = new THREE.Matrix4(), _o = new THREE.Vector3();
export function quatLook(dir, up = UP) {
  _m.lookAt(_o, dir, up);
  return new THREE.Quaternion().setFromRotationMatrix(_m);
}
