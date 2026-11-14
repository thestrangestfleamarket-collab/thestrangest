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

export function mat(o) { return new THREE.MeshStandardMaterial(o); }
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
