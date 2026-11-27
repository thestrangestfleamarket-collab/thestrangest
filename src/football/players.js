// FOURTH & LONG's players: Microsoft Rocketbox men on Rocketbox's recorded run, walk, stand and crouch (COLD BORE's files, /sniper-assets/p/, MIT), dressed here as football players: the cloth recoloured by which bone a point hangs on (jersey, pants, socks, cleats, bare forearms), a helmet with a face mask on the head bone, shoulder pads and numbers on the spine
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const BASE = '/sniper-assets/p/', BODIES = ['Male_Adult_08', 'Male_Adult_05'], MOVES = ['run', 'walk', 'idle', 'crouch'], FACE = /Bip01_[LRM][A-Z][a-z]|Eye|Jaw|Tongue|Finger/, TALL = 1.86, RUNV = 3.6, WALKV = 1.35;
// each side's kit: jersey, pants, socks, helmet, the helmet's stripe, the numbers
export const KIT = [{ name: 'HOME', css: '#17409a', jersey: 0x17409a, pants: 0xe9e9e4, sock: 0x17409a, helmet: 0xe9e9e4, stripe: 0x17409a, num: '#ffffff' }, { name: 'AWAY', css: '#a31621', jersey: 0xecece6, pants: 0xa31621, sock: 0xa31621, helmet: 0xa31621, stripe: 0xecece6, num: '#a31621' }];
const A = { body: [], clip: {}, ok: false }, lin = (hex) => new THREE.Color(hex);

function zoneOf(name) { return /Spine|Clavicle|UpperArm|Neck/.test(name) ? 1 : /Pelvis|Thigh/.test(name) ? 2 : /Forearm/.test(name) ? 3 : /Calf/.test(name) ? 4 : /Foot|Toe/.test(name) ? 5 : 0; }
// the body's cloth, recoloured: the photograph's folds and shade are kept, its colour is the kit's
function dress(src, kit) {
  const m = new THREE.MeshLambertMaterial({ map: src.map, side: THREE.FrontSide }), U = { uJ: { value: lin(kit.jersey) }, uP: { value: lin(kit.pants) }, uK: { value: lin(kit.sock) } };
  m.onBeforeCompile = (s) => { Object.assign(s.uniforms, U);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float aZone; varying float vZone;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvZone = aZone;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vZone; uniform vec3 uJ, uP, uK;').replace('#include <map_fragment>', `#include <map_fragment>
      { float l = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11)), sh = 0.72 + 0.5 * smoothstep(0.0, 0.5, l);
        if (vZone > 4.5) diffuseColor.rgb = vec3(0.03) + 0.1 * l; else if (vZone > 3.5) diffuseColor.rgb = uK * sh; else if (vZone > 2.5) diffuseColor.rgb = vec3(0.36, 0.23, 0.15) * (0.8 + 0.5 * l);
        else if (vZone > 1.5) diffuseColor.rgb = uP * sh; else if (vZone > 0.5) diffuseColor.rgb = uJ * sh; }`); };
  m.customProgramCacheKey = () => 'fb-kit'; return m;
}
function numbers(kit) {   // every number 0..99 on its jersey's colour, one picture a side; the corner is plain white for the gear
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'); g.fillStyle = '#' + lin(kit.jersey).getHexString(); g.fillRect(0, 0, 1024, 1024); g.fillStyle = kit.num; g.font = '900 78px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let n = 1; n < 100; n++) g.fillText(String(n), (n % 10) * 102.4 + 51.2, Math.floor(n / 10) * 102.4 + 54); g.fillStyle = '#fff'; g.fillRect(0, 0, 100, 100);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const tone = (g, hex, uv) => { g = g.index ? g.toNonIndexed() : g; const c = lin(hex), n = g.attributes.position.count, col = new Float32Array(n * 3); for (let i = 0; i < n; i++) c.toArray(col, i * 3); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); if (!uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2).fill(0.04), 2)); return g; };
function helmetGeo(kit) {
  const P = [tone(new THREE.SphereGeometry(0.128, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.68).scale(1, 1.04, 1.14), kit.helmet), tone(new THREE.BoxGeometry(0.028, 0.012, 0.25).translate(0, 0.131, -0.005), kit.stripe)];
  for (const s of [-1, 1]) P.push(tone(new THREE.SphereGeometry(0.05, 8, 6).scale(0.5, 1.3, 1).translate(s * 0.112, -0.035, 0.03), kit.helmet));          // ear pieces
  for (const [y, r] of [[-0.03, 0.118], [-0.065, 0.112], [-0.1, 0.1]]) P.push(tone(new THREE.TorusGeometry(r, 0.0065, 5, 14, Math.PI).rotateX(Math.PI / 2).translate(0, y, 0.045), 0x8a8d92));   // the mask's bars
  P.push(tone(new THREE.CylinderGeometry(0.006, 0.006, 0.075, 5).translate(0, -0.065, 0.158), 0x8a8d92));
  return mergeGeometries(P);
}
// the helmet seen from far off: the shell and its stripe, no mask
function helmetFar(kit) { return mergeGeometries([tone(new THREE.SphereGeometry(0.128, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.68).scale(1, 1.04, 1.14), kit.helmet), tone(new THREE.BoxGeometry(0.028, 0.012, 0.25).translate(0, 0.131, -0.005), kit.stripe)]); }
// a body for far off: points that share a small cell, a part of the kit and the bone that holds them become one point, and the triangles that close up are dropped (a fifth of the triangles; its bones, cloth and picture as they were)
function thin(g, cell) {
  const P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, Z = g.attributes.aZone, I = g.index, map = new Map(), to = new Int32Array(P.count), keep = [];
  for (let i = 0; i < P.count; i++) { let w = 0, k = 0; for (let j = 0; j < 4; j++) if (SW.getComponent(i, j) > w) { w = SW.getComponent(i, j); k = SI.getComponent(i, j); }
    const key = Math.round(P.getX(i) / cell) + ',' + Math.round(P.getY(i) / cell) + ',' + Math.round(P.getZ(i) / cell) + ',' + (Z ? Z.getX(i) : 0) + ',' + k; let n = map.get(key); if (n === undefined) { n = keep.length; map.set(key, n); keep.push(i); } to[i] = n; }
  const out = new THREE.BufferGeometry(), idx = []; for (let i = 0; i < I.count; i += 3) { const a = to[I.getX(i)], b = to[I.getX(i + 1)], c = to[I.getX(i + 2)]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
  for (const name in g.attributes) { const A = g.attributes[name], n = A.itemSize, arr = new A.array.constructor(keep.length * n); keep.forEach((v, j) => { for (let c = 0; c < n; c++) arr[j * n + c] = A.array[v * n + c]; }); out.setAttribute(name, new THREE.BufferAttribute(arr, n, A.normalized)); }
  out.setIndex(idx); return out;
}
function torsoGeo(kit, n) {
  const pad = tone(new THREE.SphereGeometry(1, 14, 8).scale(0.265, 0.075, 0.15), kit.jersey), u = (n % 10) / 10, v = 1 - Math.floor(n / 10) / 10, tile = (z, ry) => { const p = new THREE.PlaneGeometry(0.2, 0.2).rotateY(ry).translate(0, -0.2, z), uv = p.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, u + uv.getX(i) * 0.1, v - 0.1 + uv.getY(i) * 0.1); return tone(p, 0xffffff, true); };
  return mergeGeometries([pad, tile(0.135, 0), tile(-0.14, Math.PI)]);
}

export async function loadPlayers() {
  const gl = new GLTFLoader(), jobs = [];
  for (const n of BODIES) jobs.push(gl.loadAsync(BASE + n + '.glb').then((g) => { g.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(g.scene); A.body.push({ scene: g.scene, fit: TALL / (b.max.y - b.min.y), tall: b.max.y - b.min.y, top: b.max.y }); }));
  // each motion kept as turns of the body's bones and the hips' rise, its run held in place (as COLD BORE keeps them)
  for (const c of MOVES) jobs.push(gl.loadAsync(BASE + 'a_m_' + c + '.glb').then((g) => { const clip = g.animations[0], keep = [];
    for (const t of clip.tracks) { if (FACE.test(t.name)) continue; if (t.name.endsWith('.quaternion')) keep.push(t); else if (/Pelvis\.position$/.test(t.name)) { const v = t.values, n = v.length / 3; for (let a = 0; a < 3; a++) { const d = v[(n - 1) * 3 + a] - v[a]; if (Math.abs(d) > 8) for (let i = 0; i < n; i++) v[i * 3 + a] = v[a] + (v[i * 3 + a] - v[a] - d * i / (n - 1)); } keep.push(t); } }
    clip.tracks = keep; clip.name = c; A.clip[c] = clip; }));
  await Promise.all(jobs);
  A.kit = KIT.map(k => ({ k, num: numbers(k), helm: helmetGeo(k), helmFar: helmetFar(k), mats: new Map() })); for (const t of A.kit) t.gear = new THREE.MeshLambertMaterial({ vertexColors: true, map: t.num });
  // which part of the kit each point of each body is: by the bone that holds it most
  for (const b of A.body) b.scene.traverse((m) => { if (!m.isSkinnedMesh) return; const g = m.geometry, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, z = new Float32Array(SI.count), cloth = /body/.test(m.material.name);
    if (cloth) for (let i = 0; i < SI.count; i++) { let w = 0, k = 0; for (let j = 0; j < 4; j++) if (SW.getComponent(i, j) > w) { w = SW.getComponent(i, j); k = SI.getComponent(i, j); } z[i] = zoneOf(m.skeleton.bones[k].name); }
    g.setAttribute('aZone', new THREE.BufferAttribute(z, 1)); if (!g.boundingBox) g.computeBoundingBox(); const far = thin(g, (g.boundingBox.max.y - g.boundingBox.min.y + g.boundingBox.max.z - g.boundingBox.min.z + g.boundingBox.max.x - g.boundingBox.min.x) / 62); g.userData.far = far; A.tris = A.tris || [0, 0]; A.tris[0] += g.index.count / 3; A.tris[1] += far.index.count / 3; });
  A.ok = true;
}
// one player (yards: he is made a yard-world's size). coach: a man in his own clothes, no kit
export function makePlayer(side, number, o = {}) {
  const src = A.body[(o.coach ? 1 : number) % A.body.length], T = A.kit[side], g = new THREE.Group(), body = SkeletonUtils.clone(src.scene); g.rotation.order = 'YXZ';
  const parts = [];
  body.traverse((m) => { if (!m.isMesh) return; m.frustumCulled = false; if (m.geometry.userData.far && !o.coach) parts.push([m, m.geometry, m.geometry.userData.far]); if (o.coach) { m.material = new THREE.MeshLambertMaterial({ map: m.material.map, transparent: m.material.transparent, alphaTest: 0.4 }); return; }
    if (m.material.transparent || /opacity|hair/i.test(m.material.name)) { m.visible = false; return; }
    let k = T.mats.get(m.material); if (!k) { k = dress(m.material, T.k); T.mats.set(m.material, k); } m.material = k; });
  body.updateMatrixWorld(true);
  if (!o.coach) { const head = body.getObjectByName('Bip01_Head'), neck = body.getObjectByName('Bip01_Neck'), hp = head.getWorldPosition(new THREE.Vector3()), np = neck.getWorldPosition(new THREE.Vector3()), s = src.tall / 1.78;   // the gear is sized by the body's own height, the helmet set by the top of its head
    const put = (bone, geo, x, y, z) => { const m = new THREE.Mesh(geo, T.gear); m.position.set(x, y, z); m.scale.setScalar(s); m.frustumCulled = false; m.updateMatrixWorld(true); bone.attach(m); return m; };
    parts.push([put(head, T.helm, hp.x, src.top - 0.118 * s, hp.z + 0.018 * s), T.helm, T.helmFar]); put(neck.parent, torsoGeo(T.k, number), np.x, np.y - 0.03 * s, np.z - 0.012 * s); }
  body.scale.multiplyScalar(src.fit / 0.9144); g.add(body);
  const mixer = new THREE.AnimationMixer(body), acts = {}; for (const c of MOVES) { acts[c] = mixer.clipAction(A.clip[c]); acts[c].play(); acts[c].setEffectiveWeight(0); } let cur = 'idle'; acts.idle.setEffectiveWeight(1); mixer.update(Math.random() * 2);
  // the throw, made on his own bones: the arm cocked by the ear, whipped through, across the body; each bone turned to point where that moment wants it, over whatever the motion left
  const arm = o.coach ? null : ['Bip01_R_UpperArm', 'Bip01_R_Forearm', 'Bip01_R_Hand', 'Bip01_Spine1'].map(n => body.getObjectByName(n)); let thr = null, far = false;
  const KEY = [[[-0.72, 0.38, -0.58], [-0.12, 0.96, -0.24], 0.5], [[-0.4, 0.62, 0.68], [-0.15, 0.72, 0.68], -0.35], [[0.3, -0.25, 0.92], [0.42, -0.5, 0.76], -0.6]], _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _w = new THREE.Quaternion(), _p = new THREE.Quaternion(), mixv = (i, k, u, out) => out.set(...KEY[i][k]).lerp(_b.set(...KEY[i + 1][k]), u).normalize();
  const point = (bone, child, dir, w) => { bone.getWorldPosition(_a); child.getWorldPosition(_b); _b.sub(_a).normalize(); _q.setFromUnitVectors(_b, dir); bone.getWorldQuaternion(_w); bone.parent.getWorldQuaternion(_p); _q.multiply(_w); _p.invert().multiply(_q); bone.quaternion.slerp(_p, w); bone.updateMatrixWorld(true); };
  const pose = () => { if (!thr || !arm || !arm[0]) return; const T = thr.t, cock = thr.hold ? Math.min(1, T / 0.16) : 1, u = thr.hold ? 0 : Math.min(1, T / 0.3), seg = u < 0.42 ? 0 : 1, f = seg ? (u - 0.42) / 0.58 : u / 0.42, w = thr.hold ? cock : u < 0.8 ? 1 : (1 - u) / 0.2;
    g.updateMatrixWorld(true); g.getWorldQuaternion(_w); const gq = _w.clone(); if (arm[3]) { arm[3].rotateY((KEY[seg][2] + (KEY[seg + 1][2] - KEY[seg][2]) * f) * 0.5 * w); arm[3].updateMatrixWorld(true); }
    point(arm[0], arm[1], mixv(seg, 0, f, _d).applyQuaternion(gq), w); point(arm[1], arm[2], mixv(seg, 1, f, _d).applyQuaternion(gq), w); };
  return { g, body, tris: A.tris,
    // far: the body thinned and the helmet plain
    get far() { return far; },
    lod(on) { if (on === far) return; far = on; for (const [m, hi, lo] of parts) m.geometry = on ? lo : hi; },
    // hold: the arm cocked and kept there; then throw() whips it through
    wind() { if (!thr || !thr.hold) thr = { t: 0, hold: true }; }, throw() { thr = { t: 0, hold: false }; }, relax() { if (thr && thr.hold) thr = null; },
    // how he moves: v in yards a second; set: crouched at the line
    update(dt, v, set, still) { const mps = v * 0.9144, want = still ? cur : set && mps < 0.5 ? 'crouch' : mps > 2.4 ? 'run' : mps > 0.45 ? 'walk' : 'idle';
      if (want !== cur) { acts[want].reset().setEffectiveWeight(1).crossFadeFrom(acts[cur], 0.18, false); cur = want; }
      acts.run.timeScale = Math.min(2.1, Math.max(0.7, mps / RUNV)); acts.walk.timeScale = Math.min(1.8, Math.max(0.6, mps / WALKV)); if (!still) mixer.update(dt); if (thr) { thr.t += dt; if (!thr.hold && thr.t > 0.3) thr = null; else pose(); } } };
}
export const playersReady = () => A.ok;
