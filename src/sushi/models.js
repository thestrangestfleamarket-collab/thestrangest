// a model off the shelf (data/sushi/m), once per file, in the game's one cheap material; every copy shares it; strew: copies of one model stood about, all of them one drawing a material
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat } from './ctx.js';
const gl = new GLTFLoader(), got = {}, src = {}; gl.setMeshoptDecoder(MeshoptDecoder);
// the file as it comes: its meshes by name (a car's body, paint and glass; a tree's wood and leaves)
export const raw = (file) => (src[file] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { const out = {}; d.scene.updateMatrixWorld(true); d.scene.traverse((o) => { if (o.isMesh) { const g = o.geometry.clone().applyMatrix4(o.matrixWorld); out[o.name || o.material.name] = { geo: g, map: o.material.map || null, alpha: o.material.alphaTest > 0 || o.material.transparent }; } }); return out; }));
export const glb = (file, tint = 0xa8a8a8) => (got[file + tint] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { d.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: tint }); o.castShadow = false; o.userData.nopick = true; } }); return d.scene; }));
// spots: [x, y, z, turn, size]
export const strew = (parent, file, spots, tint, o = {}) => glb(file, tint).then((m) => { m.updateMatrixWorld(true); const by = new Map(), M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  m.traverse((c) => { if (!c.isMesh) return; for (const [x, y, z, ry, s] of spots) { M.compose(v.set(x, y, z), q.setFromEuler(e.set(0, ry || 0, 0)), sc.setScalar(s || 1)).multiply(c.matrixWorld); const g = new THREE.BufferGeometry(); for (const k of ['position', 'normal', 'uv']) if (c.geometry.attributes[k]) g.setAttribute(k, c.geometry.attributes[k].clone()); if (c.geometry.index) g.setIndex(c.geometry.index.clone()); g.applyMatrix4(M); if (!by.has(c.material)) by.set(c.material, []); by.get(c.material).push(g.index ? g.toNonIndexed() : g); } });
  const out = []; for (const [mt, gs] of by) { const mm = new THREE.Mesh(mergeGeometries(gs), mt); mm.userData.nopick = true; mm.castShadow = !!o.cast; mm.receiveShadow = true; if (o.cast) mm.layers.enable(2); parent.add(mm); out.push(mm); } return out; }).catch((e) => console.warn(file, e));
