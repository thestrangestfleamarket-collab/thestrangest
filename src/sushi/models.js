// a model off the shelf (data/sushi/m), once per file, in the game's one cheap material; every copy shares it; strew: copies of one model stood about, all of them one drawing a material
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat } from './ctx.js';
const gl = new GLTFLoader(), got = {}, src = {}, PLAIN = { trashbag: 0x30333a }; gl.setMeshoptDecoder(MeshoptDecoder);
// the file as it comes: its meshes by name (a car's body, paint and glass; a tree's wood and leaves)
export const raw = (file) => (src[file] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { const out = {}; d.scene.updateMatrixWorld(true); d.scene.traverse((o) => { if (o.isMesh) { const g = o.geometry.clone().applyMatrix4(o.matrixWorld); out[o.name || o.material.name] = { geo: g, map: o.material.map || null, alpha: o.material.alphaTest > 0 || o.material.transparent }; } }); return out; }));
export const glb = (file, tint = 0xa8a8a8) => (got[file + tint] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { d.scene.traverse((o) => { if (o.isMesh) { o.material = PLAIN[file] ? mat({ color: PLAIN[file], roughness: 0.45, emissive: 0x15171b }) : mat({ map: o.material.map, color: tint }); o.castShadow = false; o.userData.nopick = true; } }); return d.scene; }));
// Polyfork's cars (data/sushi/cars.json, tools/sushi-cars.cjs): each {body (its own colours), paint (its coachwork, for the page to colour; own: Polyfork's colour for it), glass, size}, in metres, nose along +x
let carsP = null; const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const cars = () => (carsP ||= fetch('/sushi-assets/cars.json').then((r) => r.json()).then((D) => { const out = {}, col = new THREE.Color();
  for (const [k, c] of Object.entries(D.cars)) { const o = (out[k] = { own: c.own, size: c.size }); for (const [n, p] of Object.entries(c.parts)) { const Q = new Int16Array(b64(p.p).buffer), P = new Float32Array(Q.length); for (let i = 0; i < Q.length; i++) P[i] = (Q[i] + 32500) * c.sc + c.lo[i % 3];
      const g = (o[n] = new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setIndex(new THREE.BufferAttribute(new Uint16Array(b64(p.i).buffer), 1));
      if (p.c) { const C = b64(p.c), F = new Float32Array(C.length); for (let i = 0; i < C.length; i += 3) { col.setRGB(C[i] / 255, C[i + 1] / 255, C[i + 2] / 255, THREE.SRGBColorSpace); F[i] = col.r; F[i + 1] = col.g; F[i + 2] = col.b; } g.setAttribute('color', new THREE.BufferAttribute(F, 3)); } } }
  return out; }));
// spots: [x, y, z, turn, size]
export const strew = (parent, file, spots, tint, o = {}) => glb(file, tint).then((m) => { m.updateMatrixWorld(true); const by = new Map(), M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  m.traverse((c) => { if (!c.isMesh) return; for (const [x, y, z, ry, s] of spots) { M.compose(v.set(x, y, z), q.setFromEuler(e.set(0, ry || 0, 0)), sc.setScalar(s || 1)).multiply(c.matrixWorld); const g = new THREE.BufferGeometry(); for (const k of ['position', 'normal', 'uv']) if (c.geometry.attributes[k]) g.setAttribute(k, c.geometry.attributes[k].clone()); if (c.geometry.index) g.setIndex(c.geometry.index.clone()); g.applyMatrix4(M); if (!by.has(c.material)) by.set(c.material, []); by.get(c.material).push(g.index ? g.toNonIndexed() : g); } });
  const out = []; for (const [mt, gs] of by) { const mm = new THREE.Mesh(mergeGeometries(gs), mt); mm.userData.nopick = true; mm.castShadow = !!o.cast; mm.receiveShadow = true; if (o.cast) mm.layers.enable(2); parent.add(mm); out.push(mm); } return out; }).catch((e) => console.warn(file, e));
