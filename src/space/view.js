// SPACE FLEET's picture of the battle: the ships (real models, one draw per part), their float, bank and engine glow, shots, blasts, wreckage, the relays, rocks and dust, all inside the arena group; fed the host's pictures ten times a second and drawn smoothly between them
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TYPES, NODES, NODE_R, BX, BZ, MOTHER, FIGHTER, MINE } from './sim.js';

const BASE = '/space-assets/', FILES = ['mother', 'fighter', 'frigate', 'cruiser', 'turret', 'mine'], LEN = [0.5, 0.05, 0.11, 0.2, 0.07, 0.026];
// the two fleets' colours, light blue and light green: the hulls' paint, their engines' and shots' light, their rings
const HULL = [new THREE.Color(0.36, 0.62, 1.0), new THREE.Color(0.4, 0.9, 0.5)], GLOW = [new THREE.Color(0.25, 0.7, 1.0), new THREE.Color(0.35, 1.0, 0.45)], TEAM = [new THREE.Color(0.3, 0.66, 1), new THREE.Color(0.35, 0.95, 0.5)];
const MAXU = 40, STEP = 0.1, CELLS = [22, 5, 8, 12, 6, 4], FLING = [0.07, 0.3, 0.18, 0.11, 0.15, 0.25], _x = new THREE.Vector3();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Color(), _q2 = new THREE.Quaternion();
const Z = new THREE.Vector3(0, 0, 1), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const lerpA = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

// hull detail as real geometry: plates, blocks, pipes, hatches and masts standing on the hull where its surface is, lying along it fore and aft, each a solid thing the sun shades (k: how big they are for this kind of ship)
function greeble(parts, n, k, seed) {
  let sd = seed; const rnd = () => (sd = sd * 16807 % 2147483647) / 2147483647, G = parts.map(p => (p.geo.index ? p.geo.toNonIndexed() : p.geo.clone())), A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), O = new THREE.Vector3(), c = [0, 1, 2, 3].map(() => new THREE.Vector3()), nn = new THREE.Vector3();
  const cum = G.map(g => { const P = g.attributes.position.array, a = new Float32Array(P.length / 9); let t = 0; for (let i = 0; i < a.length; i++) { A.fromArray(P, i * 9); B.fromArray(P, i * 9 + 3).sub(A); C.fromArray(P, i * 9 + 6).sub(A); t += B.cross(C).length() * 0.5; a[i] = t; } return a; }), tot = cum.reduce((s, a) => s + (a[a.length - 1] || 0), 0) || 1;
  return parts.map((p, pi) => { const g = G[pi], P = g.attributes.position.array, N = g.attributes.normal.array, U = g.attributes.uv ? g.attributes.uv.array : null, a = cum[pi], pos = [], nor = [], uv = []; let u = 0, v = 0;
    // one flat face of a detail, wound to face the way it looks
    const quad = (p0, p1, p2, p3) => { nn.subVectors(p1, p0).cross(A.subVectors(p2, p0)).normalize(); [p0, p1, p2, p0, p2, p3].forEach((q, j) => { pos.push(q.x, q.y, q.z); nor.push(nn.x, nn.y, nn.z); uv.push(u + (j === 1 || j === 2 || j === 4 ? 0.004 : 0), v + (j === 2 || j === 4 || j === 5 ? 0.004 : 0)); }); };
    const box = (o, x, y, z, hx, hy, hz) => { const V = (sx, sy, sz, out) => out.copy(o).addScaledVector(x, sx * hx).addScaledVector(y, sy * hy).addScaledVector(z, sz * hz);
      quad(V(-1, -1, 1, c[0]), V(1, -1, 1, c[1]), V(1, 1, 1, c[2]), V(-1, 1, 1, c[3])); quad(V(1, -1, -1, c[0]), V(1, 1, -1, c[1]), V(1, 1, 1, c[2]), V(1, -1, 1, c[3])); quad(V(-1, 1, -1, c[0]), V(-1, -1, -1, c[1]), V(-1, -1, 1, c[2]), V(-1, 1, 1, c[3]));
      quad(V(1, 1, -1, c[0]), V(-1, 1, -1, c[1]), V(-1, 1, 1, c[2]), V(1, 1, 1, c[3])); quad(V(-1, -1, -1, c[0]), V(1, -1, -1, c[1]), V(1, -1, 1, c[2]), V(-1, -1, 1, c[3])); };
    // a round one: its axis ax, r across, h long, capped at both ends
    const cyl = (o, ax, e1, e2, r, h, sides) => { for (let i = 0; i < sides; i++) { const a0 = i / sides * 6.2832, a1 = (i + 1) / sides * 6.2832, R = (an, s, out) => out.copy(o).addScaledVector(e1, Math.cos(an) * r).addScaledVector(e2, Math.sin(an) * r).addScaledVector(ax, s * h);
        quad(R(a0, -1, c[0]), R(a1, -1, c[1]), R(a1, 1, c[2]), R(a0, 1, c[3])); quad(c[0].copy(o).addScaledVector(ax, h), R(a0, 1, c[1]), R(a1, 1, c[2]), c[3].copy(c[0])); quad(c[0].copy(o).addScaledVector(ax, -h), R(a1, -1, c[1]), R(a0, -1, c[2]), c[3].copy(c[0])); } };
    const m = Math.round(n * (a[a.length - 1] || 0) / tot);
    for (let i = 0; i < m; i++) { const r = rnd() * a[a.length - 1]; let lo = 0, hi = a.length - 1; while (lo < hi) { const md = (lo + hi) >> 1; if (a[md] < r) lo = md + 1; else hi = md; } const t = lo * 9; let b0 = rnd(), b1 = rnd(); if (b0 + b1 > 1) { b0 = 1 - b0; b1 = 1 - b1; } const b2 = 1 - b0 - b1;
      O.set(P[t] * b0 + P[t + 3] * b1 + P[t + 6] * b2, P[t + 1] * b0 + P[t + 4] * b1 + P[t + 7] * b2, P[t + 2] * b0 + P[t + 5] * b1 + P[t + 8] * b2); Z.set(N[t] + N[t + 3] + N[t + 6], N[t + 1] + N[t + 4] + N[t + 7], N[t + 2] + N[t + 5] + N[t + 8]).normalize();
      if (U) { const q = lo * 6; u = U[q] * b0 + U[q + 2] * b1 + U[q + 4] * b2; v = U[q + 1] * b0 + U[q + 3] * b1 + U[q + 5] * b2; }
      X.set(0, 0, 1); if (Math.abs(Z.z) > 0.9) X.set(1, 0, 0); X.addScaledVector(Z, -X.dot(Z)).normalize(); Y.crossVectors(Z, X); if (rnd() < 0.5) { A.copy(X); X.copy(Y); Y.copy(A).negate(); }
      A.fromArray(P, t); B.fromArray(P, t + 3); C.fromArray(P, t + 6); const edge = Math.min(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)), s = k * (0.6 + rnd() * 0.8), w = edge < 0.03 * s ? 0.5 + rnd() * 0.5 : rnd();
      if (w < 0.5) { const hz = (0.0007 + rnd() * 0.0016) * s; box(O.addScaledVector(Z, hz * 0.7), X, Y, Z, (0.005 + rnd() * 0.012) * s, (0.003 + rnd() * 0.006) * s, hz); }   // a plate
      else if (w < 0.72) { const hz = (0.0015 + rnd() * 0.004) * s; box(O.addScaledVector(Z, hz * 0.8), X, Y, Z, (0.002 + rnd() * 0.004) * s, (0.002 + rnd() * 0.004) * s, hz); }   // a block
      else if (w < 0.86) { const rr = (0.0006 + rnd() * 0.0008) * s; cyl(O.addScaledVector(Z, rr * 0.9), X, Y, Z, rr, (0.006 + rnd() * 0.016) * s, 7); }   // a pipe along the hull
      else if (w < 0.95) { const rr = (0.002 + rnd() * 0.003) * s, h = (0.0006 + rnd() * 0.0008) * s; cyl(O.addScaledVector(Z, h * 0.6), Z, X, Y, rr, h, 10); }   // a round hatch
      else if (w < 0.985) { const hz = (0.001 + rnd() * 0.002) * s; box(O.addScaledVector(Z, hz * 0.8), X, Y, Z, (0.008 + rnd() * 0.01) * s, 0.0012 * s, hz); } else { const h = (0.006 + rnd() * 0.01) * s; box(O.addScaledVector(Z, h * 0.9), X, Y, Z, 0.0005 * s, 0.0005 * s, h); } }   // a mast
    const n0 = P.length, geo = new THREE.BufferGeometry(), PP = new Float32Array(n0 + pos.length), NN = new Float32Array(n0 + nor.length), UU = new Float32Array(n0 / 3 * 2 + uv.length); PP.set(P); PP.set(pos, n0); NN.set(N); NN.set(nor, n0); if (U) UU.set(U); UU.set(uv, n0 / 3 * 2);
    geo.setAttribute('position', new THREE.BufferAttribute(PP, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(NN, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(UU, 2)); return { geo, mat: p.mat }; });
}
// the hull's fine surface, with depth: a real panel set's height map laid over the hull along its own axes; each pixel is traced down into the relief from where you look (so panels stand proud and seams sink, and one edge hides another), then shaded by the set's own normals, roughness and hollows. It fades out when a panel is smaller than a few pixels
const DETOF = new WeakMap();
function detail(mat, tex, scale, depth) { DETOF.set(mat, [tex, scale, depth]); mat.customProgramCacheKey = () => 'hulldetail'; mat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, { tDetN: { value: tex.n }, tDetH: { value: tex.h }, uDetS: { value: scale }, uDetD: { value: depth } });
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vDP; varying vec3 vDN; varying vec3 vDV; varying mat3 vD2V;').replace('#include <begin_vertex>', `#include <begin_vertex>
  vDP = position; vDN = normal;
  #ifdef USE_INSTANCING
  mat4 dM = modelMatrix * instanceMatrix; mat3 dI = mat3(instanceMatrix);
  #else
  mat4 dM = modelMatrix; mat3 dI = mat3(1.0);
  #endif
  vDV = (inverse(dM) * vec4(cameraPosition, 1.0)).xyz - position; vD2V = normalMatrix * mat3(normalize(dI[0]), normalize(dI[1]), normalize(dI[2]));`);
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vDP; varying vec3 vDN; varying vec3 vDV; varying mat3 vD2V; uniform sampler2D tDetN, tDetH; uniform float uDetS, uDetD;').replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  { vec3 dn = normalize(vDN), an = abs(dn), dV = normalize(vDV), dP = vDP * uDetS; float lod = max(0.0, log2(max(length(dFdx(dP)), length(dFdy(dP))) * 1024.0)), fade = clamp(4.5 - lod, 0.0, 1.0);
    if (fade > 0.0) { vec2 uv; vec3 T, B; float nz;
      if (an.x >= an.y && an.x >= an.z) { float s = sign(dn.x); T = vec3(0.0, 0.0, -s); B = vec3(0.0, 1.0, 0.0); uv = vec2(-s * dP.z, dP.y); nz = abs(dV.x); }
      else if (an.y >= an.z) { float s = sign(dn.y); T = vec3(1.0, 0.0, 0.0); B = vec3(0.0, 0.0, -s); uv = vec2(dP.x, -s * dP.z); nz = abs(dV.y); }
      else { float s = sign(dn.z); T = vec3(s, 0.0, 0.0); B = vec3(0.0, 1.0, 0.0); uv = vec2(s * dP.x, dP.y); nz = abs(dV.z); }
      vec2 du = vec2(dot(dV, T), dot(dV, B)) / max(nz, 0.35) * uDetD * fade / 12.0; float cur = 0.0, dep = 1.0 - textureLod(tDetH, uv, lod).r;
      for (int i = 0; i < 12; i++) { if (cur >= dep) break; uv -= du; cur += 1.0 / 12.0; dep = 1.0 - textureLod(tDetH, uv, lod).r; }
      float aft = dep - cur, bef = (1.0 - textureLod(tDetH, uv + du, lod).r) - cur + 1.0 / 12.0; uv += du * clamp(aft / (aft - bef - 1e-5), 0.0, 1.0);
      vec3 hra = textureLod(tDetH, uv, lod).rgb, tn = textureLod(tDetN, uv, lod).xyz * 2.0 - 1.0;
      float lod2 = lod + 2.585, fade2 = clamp(4.5 - lod2, 0.0, 1.0) * 0.85; vec2 uv2 = uv.yx * 6.0 + 0.37; vec3 hr2 = textureLod(tDetH, uv2, lod2).rgb, tn2 = textureLod(tDetN, uv2, lod2).yxz * 2.0 - 1.0;   // the same set again, six times finer and turned: small panels inside the big ones
      normal = normalize(normal + vD2V * ((T * tn.x + B * tn.y) * 1.1 * fade + (T * tn2.x + B * tn2.y) * 0.7 * fade2)); roughnessFactor = clamp(mix(roughnessFactor, hra.g * mix(1.0, 0.7 + 0.6 * hr2.r, fade2), 0.55 * fade), 0.04, 1.0);
      diffuseColor.rgb *= mix(1.0, hra.b * (0.5 + 0.85 * hra.r), fade) * mix(1.0, hr2.b * (0.72 + 0.5 * hr2.r), fade2); } }`); }; return mat; }
// one model's parts; each part's picture is measured (how bright it is all over) so every hull can be painted to the same lightness
async function loadOne(L, name) { const g = await L.loadAsync(BASE + 'm/' + name + '.glb'), parts = [], cv = document.createElement('canvas'); cv.width = cv.height = 16; const x = cv.getContext('2d', { willReadFrequently: true });
  g.scene.updateMatrixWorld(true); g.scene.traverse(o => { if (!o.isMesh) return; const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); let lum = 0.5;
    try { const im = o.material.map && o.material.map.image; if (im) { x.drawImage(im, 0, 0, 16, 16); const d = x.getImageData(0, 0, 16, 16).data; let t = 0; for (let i = 0; i < d.length; i += 4) t += Math.pow((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, 2.2); lum = t / 256; } } catch (e) {}
    parts.push({ geo, mat: o.material, gain: Math.min(5, Math.max(0.6, 0.3 / Math.max(0.02, lum))) }); });
  // every hull but a mine's carries its plates, blocks and pipes as geometry
  const ti = FILES.indexOf(name.split('-')[0].replace(/2$/, '')); if (ti < 0 || ti === MINE) return parts;
  return greeble(parts, [2200, 240, 520, 1000, 320][ti], [0.5, 1.8, 1.1, 0.75, 1.5][ti], 7 + ti * 13 + name.length).map((q, i) => ({ ...q, gain: parts[i].gain })); }
// the hull's file for a navy's kind of ship: each kind has three hulls
const hullName = (fc, type, v) => (v ? FILES[type] + '-' + fc + '-' + (v + 1) : FILES[type] + (fc ? '2' : ''));
async function loadModels(onStep) {
  const L = new GLTFLoader(), out = {}, names = [...FILES, ...FILES.map(f => f + '2'), 'relay', 'rock1', 'rock2', 'rock3']; let n = 0;
  await Promise.all(names.map(async name => { try { out[name] = await loadOne(L, name); } catch (e) { if (!name.endsWith('2')) throw e; } onStep && onStep(++n / names.length); }));
  // the other two hulls of every kind come in behind the start; a ship launched before its hull has come flies the first
  out.more = (async () => { for (let v = 1; v < 3; v++) for (let type = 0; type < FILES.length; type++) for (const fc of [0, 1]) { const name = hullName(fc, type, v); try { out[name] = await loadOne(L, name); } catch (e) {} } })();
  const TL = new THREE.TextureLoader(), tex = (f) => TL.loadAsync(BASE + 'tex/' + f + '.jpg').then(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
  try { out.__det = await Promise.all([0, 1].map(async fc => ({ n: await tex('hull' + fc + '_n'), h: await tex('hull' + fc + '_h') }))); } catch (e) { out.__det = null; }
  return out;
}

// cut a model into k pieces of its own hull (its triangles gathered round k points spread over it), each about its own centre, for when it is blown apart
function fracture(parts, k) {
  const G = parts.map(p => (p.geo.index ? p.geo.toNonIndexed() : p.geo)), T = [];
  G.forEach((g, pi) => { const a = g.attributes.position.array; for (let t = 0; t < a.length; t += 9) T.push({ pi, t: t / 9, x: (a[t] + a[t + 3] + a[t + 6]) / 3, y: (a[t + 1] + a[t + 4] + a[t + 7]) / 3, z: (a[t + 2] + a[t + 5] + a[t + 8]) / 3, d: 1e9, c: 0 }); });
  for (let c = 0, seed = T[0]; c < k; c++) { let far = seed, fd = -1; for (const t of T) { const d = (t.x - seed.x) ** 2 + (t.y - seed.y) ** 2 + (t.z - seed.z) ** 2; if (d < t.d) { t.d = d; t.c = c; } if (t.d > fd) { fd = t.d; far = t; } } seed = far; }
  const cells = [];
  for (let c = 0; c < k; c++) { const mine = T.filter(t => t.c === c); if (!mine.length) continue; const ctr = new THREE.Vector3(); for (const t of mine) ctr.add(_p.set(t.x, t.y, t.z)); ctr.divideScalar(mine.length); let r = 0; const pieces = [];
    G.forEach((g, pi) => { const ts = mine.filter(t => t.pi === pi); if (!ts.length) return; const geo = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'uv', 'uv1']) { const src = g.attributes[name]; if (!src) continue; const n = src.itemSize, out = new Float32Array(ts.length * 3 * n); ts.forEach((t, i) => { for (let j = 0; j < 3 * n; j++) out[i * 3 * n + j] = src.array[t.t * 3 * n + j]; });
        if (name === 'position') for (let i = 0; i < out.length; i += 3) { out[i] -= ctr.x; out[i + 1] -= ctr.y; out[i + 2] -= ctr.z; r = Math.max(r, Math.hypot(out[i], out[i + 1], out[i + 2])); } geo.setAttribute(name, new THREE.BufferAttribute(out, n)); }
      pieces.push({ geo, pi }); });
    cells.push({ c: ctr, r, pieces }); }
  return cells;
}

// a glow with no hard edge: bright where you look into it, fading to nothing at its rim (so a fireball or an engine flame reads as light, not as a painted ball)
function soft(mat, power, rim) { mat.customProgramCacheKey = () => 'soft' + power + (rim ? 'r' : ''); mat.onBeforeCompile = (sh) => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vGlow;').replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\nvec3 gN = normalize(normalMatrix * (mat3(instanceMatrix) * normal));\n#else\nvec3 gN = normalize(normalMatrix * normal);\n#endif\nvGlow = abs(dot(gN, normalize(-mvPosition.xyz)));');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= pow(' + (rim ? '1.0 - vGlow' : 'vGlow') + ', ' + power.toFixed(1) + ');'); }; return mat; }
function dotTex() { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(0.3, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); }

// fire: hot gas as balls of light in the field's own space (no flat picture turned to face you: each is a glowing body, seen from any side or from inside the blast), each thrown with its own speed, swelling and cooling from white through yellow and red to nothing
class Fire {
  constructor(arena, n = 700) { this.n = n; this.i = 0; this.P = new Float32Array(n * 3); this.C = new Float32Array(n * 3); this.S = new Float32Array(n); this.V = new Float32Array(n * 3); this.A = new Float32Array(n).fill(9); this.L = new Float32Array(n).fill(1); this.Z = new Float32Array(n); this.H = new Float32Array(n);
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), soft(new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }), 5), n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.M = this.mesh.instanceMatrix.array; this.M.fill(0); this.mesh.setColorAt(0, new THREE.Color(0, 0, 0)); this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage); this.K = this.mesh.instanceColor.array; this.K.fill(0);
    this.mesh.frustumCulled = false; arena.add(this.mesh); }
  emit(p, vx, vy, vz, size, life, heat) { const k = this.i; this.i = (k + 1) % this.n; this.P[k * 3] = p.x; this.P[k * 3 + 1] = p.y; this.P[k * 3 + 2] = p.z; this.V[k * 3] = vx; this.V[k * 3 + 1] = vy; this.V[k * 3 + 2] = vz; this.Z[k] = size; this.L[k] = life; this.A[k] = 0; this.H[k] = heat; }
  burst(p, n, speed, size, life, vx = 0, vy = 0, vz = 0) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, z = Math.random() * 2 - 1, r = Math.sqrt(1 - z * z), v = speed * Math.cbrt(Math.random()); _p.set(p.x + Math.cos(a) * r * size * 0.3, p.y + z * size * 0.3, p.z + Math.sin(a) * r * size * 0.3); this.emit(_p, vx + Math.cos(a) * r * v, vy + z * v, vz + Math.sin(a) * r * v, size * (0.5 + Math.random() * 0.7), life * (0.5 + Math.random() * 0.8), 1); } }
  step(dt) { const d = 1 - Math.min(0.9, dt * 1.6), M = this.M, K = this.K;
    for (let k = 0; k < this.n; k++) { if (this.A[k] >= this.L[k]) continue; const a = (this.A[k] += dt) / this.L[k], i = k * 3, j = k * 16; if (a >= 1) { this.S[k] = 0; M[j] = M[j + 5] = M[j + 10] = 0; continue; }
      this.P[i] += this.V[i] * dt; this.P[i + 1] += this.V[i + 1] * dt; this.P[i + 2] += this.V[i + 2] * dt; this.V[i] *= d; this.V[i + 1] *= d; this.V[i + 2] *= d;
      const T = this.H[k] * (1 - a), f = Math.min(1, a * 8) * 0.32, r = (this.S[k] = this.Z[k] * (0.55 + 1.3 * a)) * 0.8; K[i] = this.C[i] = Math.min(1, T * 2.4) * f; K[i + 1] = this.C[i + 1] = Math.max(0, Math.min(1, T * 1.9 - 0.5)) * f; K[i + 2] = this.C[i + 2] = Math.max(0, Math.min(1, T * 2.6 - 1.75)) * f;
      M[j] = M[j + 5] = M[j + 10] = r; M[j + 12] = this.P[i]; M[j + 13] = this.P[i + 1]; M[j + 14] = this.P[i + 2]; M[j + 15] = 1; }
    this.mesh.instanceMatrix.needsUpdate = true; this.mesh.instanceColor.needsUpdate = true; }
}

// a pool of instances that are born, live a while and go
class Pool {
  constructor(mesh, n) { this.mesh = mesh; this.n = n; this.i = 0; this.it = []; for (let i = 0; i < n; i++) { this.it.push({ t: 0, life: 0 }); mesh.setMatrixAt(i, ZERO); } mesh.count = n; mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); }
  take() { const k = this.i; this.i = (this.i + 1) % this.n; const o = this.it[k]; o.k = k; o.t = 0; return o; }
}

class View {
  constructor(arena, models, scene) {
    this.arena = arena; this.scene = scene; this.units = new Map(); this.tSnap = 0; this.tick = 0; this.winner = -1; this.credits = [0, 0]; this.income = [0, 0]; this.queue = [[], []];
    this.nodes = NODES.map(() => ({ owner: -1, prog: 0 })); this.sel = new Set(); this.plan = new Map(); this.hover = [0, 0]; this.me = 0; this.onEvent = null; this.time = 0; this.shake = 0;
    // ships: an InstancedMesh for each part of each kind for each side
    this.fac = [0, 1]; this.models = models; this.hulls = new Map(); this.hullOn = []; this.frags = new Map(); this.tintU = [{ value: HULL[0].clone() }, { value: HULL[1].clone() }];
    // engine glow, one soft flame a ship
    const add = (geo, color, n, opt = {}) => { const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, ...opt }), n); im.frustumCulled = false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.setColorAt(0, _c.set(0)); im.instanceColor.setUsage(THREE.DynamicDrawUsage); arena.add(im); return im; };
    const flame = new THREE.SphereGeometry(0.5, 8, 6); flame.translate(0, 0, -0.5);
    this.flames = add(flame, 0xffffff, MAXU * 2 + 2); this.flames.count = 0; soft(this.flames.material, 2.2);
    this.fire = new Fire(arena);
    // a force field lights where it is struck: a shell round the ship, bright at its rim
    this.fields = new Pool(add(new THREE.IcosahedronGeometry(1, 3), 0xffffff, 24), 24); soft(this.fields.mesh.material, 2.2, true);
    // shots (a bright streak), beams, fireballs, hull sparks
    const bolt = new THREE.BoxGeometry(1, 1, 1); bolt.translate(0, 0, 0.5);
    this.bolts = new Pool(add(bolt, 0xffffff, 96), 96);
    this.balls = new Pool(add(new THREE.IcosahedronGeometry(1, 3), 0xffffff, 64), 64); soft(this.balls.mesh.material, 3.2);
    // loose things, each a body with its own mass, way and spin: rocks, the pieces of blown ships, hot splinters. Nothing here is played back; step() moves them by what hits them
    this.bodies = []; this.grp = 0; this.waves = []; this.fragIM = new Map(); this.fragOn = [];
    const shard = new THREE.TetrahedronGeometry(1, 0); shard.scale(1, 0.35, 0.7);
    this.shards = new THREE.InstancedMesh(shard, new THREE.MeshStandardMaterial({ color: 0x8a8f96, metalness: 0.6, roughness: 0.5 }), 120); this.shards.castShadow = true; this.shards.frustumCulled = false; this.shards.setColorAt(0, _c.set(0xffffff)); this.shards.count = 0; arena.add(this.shards);
    for (const b of this.bolts.it) { b.a = new THREE.Vector3(); b.b = new THREE.Vector3(); b.c = new THREE.Color(); }
    for (const b of this.balls.it) { b.p = new THREE.Vector3(); b.c = new THREE.Color(); b.r = 0; }
    // sparks: hot points thrown out of a blast
    const SP = 400; this.spN = SP; this.spI = 0; this.spP = new Float32Array(SP * 3); this.spV = new Float32Array(SP * 3); this.spC = new Float32Array(SP * 3); this.spL = new Float32Array(SP);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(this.spP, 3).setUsage(THREE.DynamicDrawUsage)); sg.setAttribute('color', new THREE.BufferAttribute(this.spC, 3).setUsage(THREE.DynamicDrawUsage));
    this.sparks = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.007, map: dotTex(), vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, sizeAttenuation: true })); this.sparks.frustumCulled = false; arena.add(this.sparks);
    // the flash of a blast on the hulls around it
    this.flash = [0, 1].map(() => { const l = new THREE.PointLight(0xffb070, 0, 0.6, 2); l.t = 1; arena.add(l); return l; }); this.flashI = 0;
    // rings round what you have picked and what you point at, and hull bars over the damaged
    const ring = new THREE.RingGeometry(0.92, 1, 40); ring.rotateX(-Math.PI / 2);
    this.rings = add(ring, 0xffffff, MAXU + 4, { side: THREE.DoubleSide, blending: THREE.NormalBlending, opacity: 0.9 }); this.rings.count = 0;
    this.bars = add(new THREE.PlaneGeometry(1, 1), 0xffffff, MAXU * 2 + 2, { side: THREE.DoubleSide, blending: THREE.NormalBlending, depthTest: false }); this.bars.count = 0; this.bars.renderOrder = 5;
    // the missions of the ships you have picked: a line from each through every place it has been told to go
    this.pathP = new Float32Array(120 * 6); const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(this.pathP, 3).setUsage(THREE.DynamicDrawUsage));
    this.paths = new THREE.LineSegments(pg, new THREE.LineBasicMaterial({ color: 0x55e08a, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false })); this.paths.frustumCulled = false; arena.add(this.paths);
    // order lines: where each ship was sent, fading
    this.lineP = new Float32Array(64 * 6); this.lineC = new Float32Array(64 * 6); this.lineT = new Float32Array(64); this.lineI = 0;
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(this.lineP, 3).setUsage(THREE.DynamicDrawUsage)); lg.setAttribute('color', new THREE.BufferAttribute(this.lineC, 3).setUsage(THREE.DynamicDrawUsage));
    this.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); this.lines.frustumCulled = false; arena.add(this.lines);
    // relays: a station each, with a ring that fills in the holder's colour
    this.relays = NODES.map((p, i) => { const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]);
      for (const part of models.relay) { const m = new THREE.Mesh(part.geo, part.mat); m.scale.setScalar(0.085); m.castShadow = m.receiveShadow = true; g.add(m); }
      const r = new THREE.Mesh(new THREE.TorusGeometry(NODE_R, 0.0022, 6, 64), new THREE.MeshBasicMaterial({ color: 0x8892a0, transparent: true, opacity: 0.55, toneMapped: false })); r.rotation.x = Math.PI / 2; g.add(r);
      const f = new THREE.Mesh(new THREE.RingGeometry(NODE_R * 0.9, NODE_R * 0.97, 64, 1, 0, 0.001), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false })); f.rotation.x = -Math.PI / 2; g.add(f);
      arena.add(g); return { g, ring: r, fill: f, model: g.children[0], shown: 999, spin: 0.05 + i * 0.013 }; });
    // small meteors round and through the field, each set turning and drifting once and then left to the physics; dust that drifts through
    this.rockIM = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ['rock1', 'rock2', 'rock3'].forEach((name) => { const part = models[name][0], im = new THREE.InstancedMesh(part.geo, part.mat, 22); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); arena.add(im); this.rockIM.push(im);
      for (let i = 0; i < 22; i++) { const a = rnd() * Math.PI * 2, far = 0.85 + rnd() * 0.3, edge = rnd() < 0.75, sc = 0.007 + rnd() * rnd() * 0.028;
        const b = this.body(0, _p.set(Math.cos(a) * (edge ? BX * far * 1.1 : rnd() * 0.5 + 0.2) * (edge ? 1 : Math.sign(rnd() - 0.5)), (rnd() - 0.5) * 0.7, edge ? Math.sin(a) * BZ * 0.75 : (rnd() - 0.5) * 0.5), sc * 0.45, sc ** 3 * 4); b.im = im; b.i = i; b.s = sc; b.life = 1e9;
        b.v.set((rnd() - 0.5) * 0.004, (rnd() - 0.5) * 0.002, (rnd() - 0.5) * 0.004); b.w.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.25); } });
    const DN = 260, dp = new Float32Array(DN * 3); for (let i = 0; i < DN; i++) { dp[i * 3] = (rnd() - 0.5) * 2.6; dp[i * 3 + 1] = (rnd() - 0.5) * 1.1; dp[i * 3 + 2] = (rnd() - 0.5) * 3.2; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.004, map: dotTex(), color: 0x9fb0c8, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true })); this.dust.frustumCulled = false; arena.add(this.dust);
  }
  // which colour a side flies: its navy's, or its own side's when both players chose the same navy
  ci(side) { return this.fac[0] === this.fac[1] ? side : this.fac[side]; }
  // a hull's own paint is kept only as light and dark (its panels, wear and grime) and laid over the fleet's colour
  paint(part, side, fc, type) { const mat = part.mat.clone(), U = this.tintU[side], gain = part.gain; if (mat.emissiveMap) { mat.emissive.set(0xffffff); mat.emissiveIntensity = 1.25; } mat.metalness = Math.min(mat.metalness, 0.55);
    const det = this.models.__det && type !== MINE; if (det) detail(mat, this.models.__det[fc], 5 + 46 * LEN[type], 0.09); const D = det ? mat.onBeforeCompile : null;
    mat.onBeforeCompile = (sh, r) => { if (D) D(sh, r); sh.uniforms.uTint = U; sh.uniforms.uGain = { value: gain }; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uTint; uniform float uGain;').replace('#include <map_fragment>', '#include <map_fragment>\n{ vec3 own = diffuseColor.rgb * uGain; float l = dot(own, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb = mix(own, uTint * (0.12 + min(l, 0.75) * 1.7), 0.88); }'); };
    mat.customProgramCacheKey = () => 'fleet' + side + (det ? 'd' : ''); return mat; }
  // the hull a ship flies: one of its kind's three, by the ship's number (the same on both headsets)
  variant(fc, type, id) { const v = id % 3; return this.models[hullName(fc, type, v)] ? v : 0; }
  parts(fc, type, v) { return this.models[hullName(fc, type, v)] || this.models[FILES[type]]; }
  hull(fc, type, v, side) { const key = fc * 1000 + type * 100 + v * 10 + side; let H = this.hulls.get(key);
    if (!H) { H = this.parts(fc, type, v).map(p => { const im = new THREE.InstancedMesh(p.geo, this.paint(p, side, fc, type), type === MOTHER ? 1 : Math.ceil(MAXU / 2)); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.count = 0; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.arena.add(im); this.hullOn.push(im); return im; }); this.hulls.set(key, H); }
    return H; }
  frag(fc, type, v) { const key = fc * 100 + type * 10 + v; let F = this.frags.get(key); if (!F) this.frags.set(key, F = fracture(this.parts(fc, type, v), CELLS[type])); return F; }
  body(kind, p, r, m) { const b = { kind, p: new THREE.Vector3().copy(p), v: new THREE.Vector3(), q: new THREE.Quaternion(), w: new THREE.Vector3(), r, m, t: 0, life: 10, hot: 0, grp: 0, s: 1 }; this.bodies.push(b); return b; }
  // a blast's push on every loose thing near it: an impulse that falls off with the square of the distance, off-centre so things spin
  wave(p, E, grp) { for (const b of this.bodies) { if (grp && b.grp === grp && b.t < 0.05) continue; _a.subVectors(b.p, p); const d2 = _a.lengthSq(); if (d2 > 0.5) continue; const d = Math.sqrt(d2) || 1e-4, dv = Math.min(0.6, E / (d2 + 0.0004) / b.m); _a.divideScalar(d);
      b.v.addScaledVector(_a, dv); _b.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).cross(_a).multiplyScalar(Math.min(9, 1.5 * dv / b.r)); b.w.add(_b); if (b.kind) b.hot = Math.min(1, b.hot + dv * 3); } }
  // move every loose thing by its own momentum, and bounce it off the others, the rocks and the ships
  step(dt) {
    const B = this.bodies; for (let i = this.waves.length - 1; i >= 0; i--) { const w = this.waves[i]; if ((w.t -= dt) > 0) continue; this.waves.splice(i, 1); this.ball(w.p, w.r, 0.45, _c.set(1, 0.6 + Math.random() * 0.3, 0.3)); this.spark(w.p, 12, 0.15, _c.set(1, 0.7, 0.3), 0.6); this.wave(w.p, w.E, 0); const l = this.flash[this.flashI ^= 1]; l.position.copy(w.p); l.t = 0; l.power = 1.2; l.distance = 0.3 * this.arena.scale.x; this.fire.burst(w.p, 10, 0.1, w.r * 0.45, 0.8); this.onEvent && this.onEvent('pop', w.p, 0); }
    let nf = 0; for (let i = B.length - 1; i >= 0; i--) { const b = B[i]; b.t += dt; if (b.t >= b.life) { B.splice(i, 1); continue; } if (b.kind === 1) nf++; b.p.addScaledVector(b.v, dt); const wl = b.w.length(); if (wl > 1e-5) { _q.setFromAxisAngle(_a.copy(b.w).divideScalar(wl), wl * dt); b.q.premultiply(_q); } b.hot *= 1 - dt * 0.5;
      if (!b.kind) { if (Math.abs(b.p.x) > 1.45) b.v.x -= Math.sign(b.p.x) * dt * 0.02; if (Math.abs(b.p.y) > 0.5) b.v.y -= Math.sign(b.p.y) * dt * 0.02; if (Math.abs(b.p.z) > 1.7) b.v.z -= Math.sign(b.p.z) * dt * 0.02; b.v.multiplyScalar(1 - dt * 0.02); } }
    if (nf > 90) { let n = nf - 90; for (const b of B) if (b.kind === 1 && n > 0 && b.life - b.t > 1.5) { b.life = b.t + 1.5; n--; } }
    for (let i = 0; i < B.length; i++) { const a = B[i]; if (a.kind === 2) continue;
      for (let j = i + 1; j < B.length; j++) { const b = B[j]; if (b.kind === 2 || (a.grp && a.grp === b.grp && a.t < 1.5)) continue; const R = a.r + b.r; _a.subVectors(a.p, b.p); const d2 = _a.lengthSq(); if (d2 >= R * R || d2 < 1e-10) continue; const d = Math.sqrt(d2); _a.divideScalar(d);
        const rel = _b.subVectors(a.v, b.v).dot(_a), ia = 1 / a.m, ib = 1 / b.m, push = (R - d) / (ia + ib); a.p.addScaledVector(_a, push * ia); b.p.addScaledVector(_a, -push * ib); if (rel >= 0) continue;
        const J = -1.5 * rel / (ia + ib); a.v.addScaledVector(_a, J * ia); b.v.addScaledVector(_a, -J * ib); _b.addScaledVector(_a, -rel).cross(_a); a.w.addScaledVector(_b, -0.4 * J * ia / a.r); b.w.addScaledVector(_b, -0.4 * J * ib / b.r); }
      for (const u of this.units.values()) { const R = a.r + Math.max(TYPES[u.type].r, LEN[u.type] * 0.3); _a.subVectors(a.p, u.pos); const d2 = _a.lengthSq(); if (d2 >= R * R || d2 < 1e-10) continue; const d = Math.sqrt(d2); _a.divideScalar(d); a.p.addScaledVector(_a, R - d);
        const rel = _b.set((u.x - u.px) / STEP, (u.y - u.py) / STEP, (u.z - u.pz) / STEP).sub(a.v).multiplyScalar(-1).dot(_a); if (rel < 0) a.v.addScaledVector(_a, -1.5 * rel); } }
  }
  reset() { this.plan.clear(); this.bodies = this.bodies.filter(b => !b.kind); this.waves.length = 0; this.units.clear(); this.sel.clear(); this.winner = -1; this.tick = 0; for (const r of this.relays) r.shown = 999; }
  // take a picture from the host: every ship's place a step from now, and what happened since the last
  apply(o, now) {
    this.tick = o.tick; if (o.fac[0] !== this.fac[0] || o.fac[1] !== this.fac[1] || !this.tinted) { this.fac = o.fac; this.tinted = true; for (const sd of [0, 1]) this.tintU[sd].value.copy(HULL[this.ci(sd)]); } this.winner = o.winner; this.credits = o.credits; this.income = o.income; this.queue = o.queue; this.tSnap = now;
    o.nodes.forEach((d, i) => { if (this.nodes[i]) { this.nodes[i].owner = d.owner; this.nodes[i].prog = d.prog; } });
    const seen = this._seen || (this._seen = new Set()); seen.clear();
    for (const n of o.units) { seen.add(n.id); let u = this.units.get(n.id);
      if (!u) { u = { id: n.id, type: n.type, side: n.side, x: n.x, y: n.y, z: n.z, yaw: n.yaw, pitch: n.pitch, px: n.x, py: n.y, pz: n.z, pyaw: n.yaw, ppitch: n.pitch, hp: n.hp, roll: 0, thr: 0, ph: (n.id * 2.399) % 6.283, born: now, warp: this.tick > 20 ? 1 : 0, v: this.variant(this.fac[n.side], n.type, n.id), hit: 0, pos: new THREE.Vector3(n.x, n.y, n.z), fwd: new THREE.Vector3(0, 0, 1), quat: new THREE.Quaternion(), k: 0, m: 0, seen: true }; this.units.set(n.id, u); }
      else { u.px = u.x; u.py = u.y; u.pz = u.z; u.pyaw = u.yaw; u.ppitch = u.pitch; }
      if (n.hp < u.hp - 0.0005) u.hit = now; u.x = n.x; u.y = n.y; u.z = n.z; u.yaw = n.yaw; u.pitch = n.pitch; u.hp = n.hp; u.k = n.k; u.m = n.m; }
    const ev = o.ev;
    for (let i = 0; i < ev.length;) { const k = ev[i];
      if (k === 1) { const tg = this.units.get(ev[i + 2]), v = ev[i + 3], secs = (v >> 5) * STEP; this.shot(this.units.get(ev[i + 1]), tg, v & 7, !!(v & 16), secs); if (tg && v & 8 && !(v & 16)) { const f = this.fields.take(); f.uid = tg.id; f.life = 0.5; f.t = -secs; this.onEvent && this.onEvent('field', tg.pos, 0); } i += 4; }
      else if (k === 2) { const u = this.units.get(ev[i + 1]); if (u) this.blast(u, ev[i + 2]); i += 4; }
      else if (k === 5) { this.miss(this.units.get(ev[i + 1]), ev[i + 2] / 100, ev[i + 3] / 100, ev[i + 4] / 100); i += 5; }
      else if (k === 3) { this.onEvent && this.onEvent('built', ev[i + 1], ev[i + 2]); i += 3; }
      else if (k === 4) { this.onEvent && this.onEvent('relay', ev[i + 2], ev[i + 1]); i += 3; }
      else break; }
    for (const id of this.units.keys()) if (!seen.has(id)) { this.units.delete(id); this.sel.delete(id); }
  }
  // a shot on its way for secs; one that misses flies on past its target
  shot(a, b, w, miss, secs) {
    if (!a || !b) return; const T = TYPES[a.type], c = GLOW[this.ci(a.side)];
    _a.copy(a.pos).addScaledVector(a.fwd, LEN[a.type] * 0.3); _b.copy(b.pos).add(_p.set(Math.sin(a.id + this.tick) * 0.4, Math.cos(a.id * 3 + this.tick) * 0.3, Math.sin(a.id * 7 + this.tick) * 0.4).multiplyScalar(TYPES[b.type].r));
    const o = this.bolts.take(); o.a.copy(_a); o.b.copy(_b); o.w = w; o.life = w === 2 ? 0.45 : Math.max(0.12, secs || 0); o.miss = miss; if (miss) { _p.subVectors(_b, _a).normalize(); _b.addScaledVector(_p, 0.07 + Math.random() * 0.08).add(_x.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(Math.max(TYPES[b.type].r, LEN[b.type] * 0.3) * 2.2)); o.b.copy(_b); } o.c.copy(c); if (w === 2) o.c.lerp(_c.set(0xffffff), 0.35);
    o.tid = b.id; o.hitDone = false; this.onEvent && this.onEvent('shot', a, w);
  }
  // a hand-flown ship's shot that found nothing: a bolt out along its pilot's aim
  miss(a, x, y, z) { if (!a) return; const T = TYPES[a.type], o = this.bolts.take(); o.a.copy(a.pos).addScaledVector(_p.set(x, y, z), LEN[a.type] * 0.3); o.b.copy(a.pos).addScaledVector(_p, T.range * 1.5); o.w = T.w; o.life = T.w === 2 ? 0.45 : T.w === 1 ? 0.22 : 0.12; o.c.copy(GLOW[this.ci(a.side)]); o.tid = 0; o.hitDone = true; this.onEvent && this.onEvent('shot', a, T.w); }
  spark(p, n, sp, c, life) { for (let i = 0; i < n; i++) { const k = this.spI; this.spI = (k + 1) % this.spN; const a = Math.random() * 6.283, z = Math.random() * 2 - 1, r = Math.sqrt(1 - z * z), v = sp * (0.3 + Math.random());
      this.spP[k * 3] = p.x; this.spP[k * 3 + 1] = p.y; this.spP[k * 3 + 2] = p.z; this.spV[k * 3] = Math.cos(a) * r * v; this.spV[k * 3 + 1] = z * v; this.spV[k * 3 + 2] = Math.sin(a) * r * v; this.spC[k * 3] = c.r; this.spC[k * 3 + 1] = c.g; this.spC[k * 3 + 2] = c.b; this.spL[k] = life * (0.5 + Math.random()); } }
  ball(p, r, life, c, delay = 0) { const o = this.balls.take(); o.p.copy(p); o.r = r; o.life = life; o.c.copy(c); o.t = -delay; }
  // a ship dies: fireballs, sparks, a flash on the hulls near it, and its wreckage tumbling on the way it was going
  blast(u, size) {
    const r = size === 3 ? 0.09 : Math.max(TYPES[u.type].r, LEN[u.type] * 0.3) * 1.3, big = u.type === MOTHER ? 3 : size === 2 ? 2 : size === 3 ? 1 : size;
    this.ball(u.pos, r * 1.1, 0.35 + big * 0.15, _c.set(1, 0.72, 0.36)); this.ball(u.pos, r * 0.5, 0.2 + big * 0.08, _c.set(1, 1, 0.9));
    this.spark(u.pos, 14 + big * 22, 0.12 + big * 0.06, _c.set(1, 0.7, 0.3), 0.7 + big * 0.3);
    const l = this.flash[this.flashI ^= 1]; l.position.copy(u.pos); l.t = 0; l.power = 0.8 + big * 0.5; l.distance = (0.25 + big * 0.2) * this.arena.scale.x;
    // the ship comes apart: each piece of its hull leaves from where it sat, with the ship's own way and turn, thrown by a blast set a little off its centre
    const L = LEN[u.type], fc = this.fac[u.side], cells = this.frag(fc, u.type, u.v), grp = ++this.grp, vx = (u.x - u.px) / STEP, vy = (u.y - u.py) / STEP, vz = (u.z - u.pz) / STEP, yr = Math.atan2(Math.sin(u.yaw - u.pyaw), Math.cos(u.yaw - u.pyaw)) / STEP;
    _x.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(L * 0.3).applyQuaternion(u.quat).add(u.pos); let mm = 0; for (const c of cells) mm += (c.r * L * 0.55) ** 3; mm /= cells.length;
    const E = FLING[u.type] * mm * ((0.3 * L) ** 2 + 0.0004) * (size === 3 ? 1.6 : 1);
    cells.forEach((c, ci) => { _p.copy(c.c).multiplyScalar(L).applyQuaternion(u.quat); const b = this.body(1, _a.copy(u.pos).add(_p), c.r * L * 0.55, (c.r * L * 0.55) ** 3); b.q.copy(u.quat); b.type = u.type; b.side = u.side; b.fac = fc; b.hv = u.v; b.cell = ci; b.s = L; b.grp = grp; b.life = (u.type === MOTHER ? 30 : 14) + Math.random() * 8; b.hot = 0.6;
      b.v.set(vx, vy, vz).add(_b.set(0, yr, 0).cross(_p)); b.w.set(0, yr, 0); });
    for (let i = 0, ns = this.bodies.reduce((n, b) => n + (b.kind === 2), 0); i < 4 + big * 5 && ns + i < 70; i++) { const b = this.body(2, _a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(L * 0.4).add(u.pos), L * 0.04, (L * 0.03) ** 3); b.s = L * (0.03 + Math.random() * 0.06); b.life = 5 + Math.random() * 5; b.v.set(vx, vy, vz); b.grp = grp; }
    this.wave(_x, E, 0); this.fire.burst(u.pos, 12 + big * 12, 0.07 + big * 0.04, r * 0.4, 0.6 + big * 0.3, vx, vy, vz);
    // a big ship's magazines and reactor go after the first blast: more blasts inside the wreck, each pushing whatever is near
    if (big >= 2) for (let i = 0; i < (big === 3 ? 9 : 3); i++) this.waves.push({ t: 0.25 + i * (0.2 + Math.random() * 0.25), p: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(L * 0.7).applyQuaternion(u.quat).add(u.pos), E: E * 0.5, r: r * (0.4 + Math.random() * 0.5) });
    this.shake = Math.max(this.shake, big * 0.3); this.onEvent && this.onEvent('boom', u, size === 3 ? 4 : big);
  }
  order(ids, p, target, add, tid, now) { this.note(ids, p, add, tid, now || 0); const c = target ? _c.set(1, 0.25, 0.2) : _c.set(0.3, 1, 0.5);
    for (const id of ids) { const u = this.units.get(id); if (!u) continue; const k = this.lineI; this.lineI = (k + 1) % 64; this.lineP.set([u.pos.x, u.pos.y, u.pos.z, p.x, p.y, p.z], k * 6); this.lineC.set([c.r * 0.2, c.g * 0.2, c.b * 0.2, c.r, c.g, c.b], k * 6); this.lineT[k] = 1.4; } }
  // what you ordered is kept here too, so a picked ship's mission can be drawn: where it goes next, and after
  note(ids, p, add, tid, now) { for (const id of ids) { const u = this.units.get(id); if (!u || u.type === MOTHER) continue; let L = this.plan.get(id); if (!L || !add || (u.k === 0 && !L.length)) { L = []; this.plan.set(id, L); } if (L.length < 7) L.push({ p: new THREE.Vector3(p.x, p.y, p.z), tid, at: now }); } }
  // draw: every ship between its last two places, floating on its own slow sway, banking into its turns
  draw(now, dt, camera) {
    this.time += dt; const t = this.time, al = Math.min(1.3, (now - this.tSnap) / (STEP * 1000));
    for (const im of this.hullOn) im.count = 0;
    let nf = 0, nr = 0, nb = 0; camera.getWorldQuaternion(_q2); this.arena.getWorldQuaternion(_q); _q2.premultiply(_q.invert());
    for (const u of this.units.values()) { const T = TYPES[u.type], L = LEN[u.type];
      const yaw = lerpA(u.pyaw, u.yaw, al), pitch = u.ppitch + (u.pitch - u.ppitch) * al, yr = Math.atan2(Math.sin(u.yaw - u.pyaw), Math.cos(u.yaw - u.pyaw)) / STEP;
      const sp = Math.hypot(u.x - u.px, u.y - u.py, u.z - u.pz) / STEP, thr = T.speed ? Math.min(1, sp / T.speed) : 0.15;
      u.roll += (THREE.MathUtils.clamp(-yr * (T.cls === 0 ? 0.5 : 0.28), -1.1, 1.1) - u.roll) * Math.min(1, dt * 4); u.thr += (thr - u.thr) * Math.min(1, dt * 5);
      const still = 1 - u.thr * 0.8, bob = u.type === MOTHER ? 0.002 : L * 0.05;
      u.pos.set(u.px + (u.x - u.px) * al + Math.sin(t * 0.45 + u.ph) * bob * still, u.py + (u.y - u.py) * al + Math.sin(t * 0.6 + u.ph * 2) * bob * still, u.pz + (u.z - u.pz) * al + Math.cos(t * 0.38 + u.ph) * bob * still);
      _e.set(-pitch + Math.sin(t * 0.5 + u.ph) * 0.03 * still, u.type === MOTHER ? (u.side ? 0 : Math.PI) + Math.sin(t * 0.05 + u.ph) * 0.08 : u.type === MINE ? t * 0.8 + u.ph : yaw, u.roll + Math.sin(t * 0.4 + u.ph * 3) * 0.05 * still); _q.setFromEuler(_e); u.quat.copy(_q);
      u.fwd.set(0, 0, 1).applyQuaternion(_q);
      // a new ship drops out of warp: a long streak that closes up into the hull, and a flash where it stops
      if (u.warp) { const g = Math.min(1, (now - u.born) / 650), w = (1 - g) * (1 - g); if (g >= 1) { u.warp = 0; this.ball(u.pos, L * 0.8, 0.35, _c.copy(GLOW[this.ci(u.side)])); this.onEvent && this.onEvent('warp', u.pos, 0); } _p.copy(u.pos).addScaledVector(u.fwd, -L * w * 7); _m.compose(_p, _q, _s.set(L * (1 - w * 0.6), L * (1 - w * 0.6), L * (1 + w * 14))); }
      else _m.compose(u.pos, _q, _s.setScalar(L));
      // a ship with its hull failing burns
      if (u.hp < 0.45 && Math.random() < dt * (4 + 22 * (0.45 - u.hp))) { _p.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(L * 0.55).applyQuaternion(_q).add(u.pos); this.fire.emit(_p, (u.x - u.px) / STEP * 0.4, (u.y - u.py) / STEP * 0.4 + 0.004, (u.z - u.pz) / STEP * 0.4, L * (T.cls ? 0.1 : 0.2), 0.5, 0.9); }
      // the other fleet's sneaking ships are not seen until one of yours is close, or they give themselves away
      u.seen = true; if (u.side !== this.me && u.m === 3 && now - u.hit > 3000) { u.seen = false; for (const o of this.units.values()) if (o.side === this.me && (o.x - u.x) ** 2 + (o.y - u.y) ** 2 + (o.z - u.z) ** 2 < 0.0324) { u.seen = true; break; } if (!u.seen) continue; }
      for (const im of this.hull(this.fac[u.side], u.type, u.v, u.side)) if (im.count < im.instanceMatrix.count) im.setMatrixAt(im.count++, _m);
      if (T.speed && u.type !== MINE && u.type !== 4) { const fl = 0.85 + Math.sin(t * 40 + u.ph * 9) * 0.15, w = L * (T.cls === 0 ? 0.1 : 0.12) * (0.6 + u.thr * 0.4); _p.copy(u.pos).addScaledVector(u.fwd, -L * 0.46);
        _m.compose(_p, _q, _s.set(w, w, L * (0.2 + u.thr * 0.8) * fl)); this.flames.setMatrixAt(nf, _m); this.flames.setColorAt(nf++, _c.copy(GLOW[this.ci(u.side)]).multiplyScalar((0.8 + u.thr * 2.2) * (u.m >= 2 ? 0.25 : 1))); }
      const sel = this.sel.has(u.id), hov = this.hover[0] === u.id || this.hover[1] === u.id;
      if (sel || hov) { _m.compose(u.pos, _q.identity(), _s.setScalar(Math.max(T.r * 1.5, L * 0.62))); this.rings.setMatrixAt(nr, _m); this.rings.setColorAt(nr++, sel ? _c.set(1, 0.9, 0.3) : u.side === this.me ? _c.set(1, 1, 1) : _c.set(1, 0.3, 0.2)); }
      if (u.hp < 0.999 && (sel || hov || now - u.hit < 3000 || u.type === MOTHER)) { const w = Math.max(0.03, L * 0.8), up = Math.max(T.r, L * 0.3) + 0.012;
        _p.copy(u.pos); _p.y += up; _m.compose(_p, _q2, _s.set(w, 0.004, 1)); this.bars.setMatrixAt(nb, _m); this.bars.setColorAt(nb++, _c.set(0.06, 0.06, 0.06));
        _b.set(-(1 - u.hp) * w * 0.5, 0, 0.0005).applyQuaternion(_q2).add(_p); _m.compose(_b, _q2, _s.set(w * u.hp, 0.004, 1)); this.bars.setMatrixAt(nb, _m); this.bars.setColorAt(nb++, u.hp > 0.5 ? _c.set(0.2, 0.9, 0.3) : u.hp > 0.25 ? _c.set(1, 0.75, 0.1) : _c.set(1, 0.2, 0.1)); } }
    for (const im of this.hullOn) { im.visible = im.count > 0; im.instanceMatrix.needsUpdate = true; }
    this.flames.count = nf; this.flames.instanceMatrix.needsUpdate = true; this.flames.instanceColor.needsUpdate = true;
    this.rings.count = nr; this.rings.instanceMatrix.needsUpdate = true; this.rings.instanceColor.needsUpdate = true;
    this.bars.count = nb; this.bars.instanceMatrix.needsUpdate = true; this.bars.instanceColor.needsUpdate = true;
    // shots
    for (const o of this.bolts.it) { if (o.life <= 0 || o.t >= o.life) { if (o.life > 0) { this.bolts.mesh.setMatrixAt(o.k, ZERO); o.life = 0; } continue; } o.t += dt; const f = o.t / o.life; _b.copy(o.b); const tg = this.units.get(o.tid); if (tg && o.w !== 2 && !o.miss) _b.lerp(tg.pos, 0.6);
      _p.subVectors(_b, o.a); const len = _p.length() || 1e-4; _q.setFromUnitVectors(Z, _p.divideScalar(len));
      if (o.w === 2) { const w = 0.006 * (1 - f) * (0.7 + Math.random() * 0.6); _m.compose(o.a, _q, _s.set(w, w, len)); _c.copy(o.c).multiplyScalar(2 * (1 - f)); }
      else { const tl = Math.min(len, o.w === 1 ? 0.07 : 0.045), w = o.w === 1 ? 0.0035 : 0.002; _a.copy(o.a).addScaledVector(_p, Math.max(0, f * len - tl * 0.5)); _m.compose(_a, _q, _s.set(w, w, tl)); _c.copy(o.c).multiplyScalar(1.6); }
      this.bolts.mesh.setMatrixAt(o.k, _m); this.bolts.mesh.setColorAt(o.k, _c);
      if (!o.hitDone && !o.miss && (o.w === 2 ? o.t > 0.05 : f > 0.85)) { o.hitDone = true; this.ball(_b, o.w === 2 ? 0.02 : o.w === 1 ? 0.011 : 0.006, 0.18, _c.set(1, 0.85, 0.6)); if (o.w) this.fire.burst(_b, o.w === 2 ? 5 : 2, 0.05, o.w === 2 ? 0.03 : 0.016, 0.4); this.spark(_b, o.w === 2 ? 10 : 3, 0.08, _c.set(1, 0.8, 0.5), 0.35); this.onEvent && this.onEvent('hit', _b, o.w); } }
    this.bolts.mesh.instanceMatrix.needsUpdate = true; this.bolts.mesh.instanceColor.needsUpdate = true; this.fire.step(dt, this.arena.scale.x);
    for (const o of this.fields.it) { if (o.life <= 0) continue; o.t += dt; if (o.t < 0) continue; const u = this.units.get(o.uid), f = o.t / o.life; if (f >= 1 || !u) { this.fields.mesh.setMatrixAt(o.k, ZERO); o.life = 0; continue; } const L = LEN[u.type], w = Math.max(TYPES[u.type].r, L * 0.3) * 1.1;
      _m.compose(u.pos, u.quat, _s.set(w, w, Math.max(w, L * 0.6))); this.fields.mesh.setMatrixAt(o.k, _m); this.fields.mesh.setColorAt(o.k, _c.copy(GLOW[this.ci(u.side)]).multiplyScalar(1.6 * (1 - f))); }
    this.fields.mesh.instanceMatrix.needsUpdate = true; this.fields.mesh.instanceColor.needsUpdate = true;
    for (const o of this.balls.it) { if (o.life <= 0) continue; o.t += dt; if (o.t < 0) continue; const f = o.t / o.life; if (f >= 1) { this.balls.mesh.setMatrixAt(o.k, ZERO); o.life = 0; continue; }
      _m.compose(o.p, _q.identity(), _s.setScalar(o.r * (0.25 + 0.75 * Math.sqrt(f)))); this.balls.mesh.setMatrixAt(o.k, _m); this.balls.mesh.setColorAt(o.k, _c.copy(o.c).multiplyScalar((1 - f) * (1 - f) * 1.3)); }
    this.balls.mesh.instanceMatrix.needsUpdate = true; this.balls.mesh.instanceColor.needsUpdate = true;
    this.step(dt); for (const im of this.fragOn) im.count = 0; let ns = 0;
    for (const b of this.bodies) { const sc = b.s * Math.min(1, (b.life - b.t) / 1.5); _m.compose(b.p, b.q, _s.setScalar(sc));
      if (!b.kind) { b.im.setMatrixAt(b.i, _m); continue; } _c.setRGB(1 + b.hot * 0.35, 1 + b.hot * 0.08, 1); if (b.kind === 1 && b.hot > 0.2 && Math.random() < dt * 9) this.fire.emit(b.p, b.v.x * 0.6, b.v.y * 0.6, b.v.z * 0.6, b.r * 0.9, 0.4, Math.min(1, b.hot * 1.4));
      if (b.kind === 2) { if (ns < 120) { this.shards.setMatrixAt(ns, _m); this.shards.setColorAt(ns++, _c); } continue; }
      for (const pc of this.frag(b.fac, b.type, b.hv)[b.cell].pieces) { const key = b.hv * 1000000 + b.fac * 100000 + b.type * 10000 + b.side * 5000 + b.cell * 10 + pc.pi; let im = this.fragIM.get(key);
        if (!im) { const mat = this.paint(this.parts(b.fac, b.type, b.hv)[pc.pi], b.side, b.fac, b.type); mat.side = THREE.DoubleSide; im = new THREE.InstancedMesh(pc.geo, mat, b.type === MOTHER ? 1 : TYPES[b.type].cls ? 4 : 8); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.count = 0; im.setColorAt(0, _c); this.arena.add(im); this.fragIM.set(key, im); this.fragOn.push(im); }
        if (im.count < im.instanceMatrix.count) { im.setMatrixAt(im.count, _m); im.setColorAt(im.count++, _c); } } }
    for (const im of this.fragOn) { im.visible = im.count > 0; if (im.visible) { im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; } }
    for (const im of this.rockIM) im.instanceMatrix.needsUpdate = true; this.shards.count = ns; this.shards.instanceMatrix.needsUpdate = true; this.shards.instanceColor.needsUpdate = true;
    for (let k = 0; k < this.spN; k++) { if (this.spL[k] <= 0) continue; this.spL[k] -= dt; const i = k * 3; if (this.spL[k] <= 0) { this.spP[i + 1] = 1e4; continue; } this.spP[i] += this.spV[i] * dt; this.spP[i + 1] += this.spV[i + 1] * dt; this.spP[i + 2] += this.spV[i + 2] * dt; const d = 1 - dt * 2.2; this.spC[i] *= d; this.spC[i + 1] *= d * d; this.spC[i + 2] *= d * d * d; }
    this.sparks.geometry.attributes.position.needsUpdate = true; this.sparks.geometry.attributes.color.needsUpdate = true;
    for (const l of this.flash) { if (l.t >= 1) { l.intensity = 0; continue; } l.t += dt * 1.6; l.intensity = l.power * 0.03 * this.arena.scale.x ** 2 * Math.max(0, 1 - l.t) ** 2; }
    let np = 0; for (const [id, L] of this.plan) { const u = this.units.get(id); if (!u) { this.plan.delete(id); continue; }
      while (L.length && (L[0].tid ? !this.units.has(L[0].tid) : u.pos.distanceTo(L[0].p) < 0.045)) L.shift(); if (L.length && u.k === 0 && now - L[L.length - 1].at > 1500) L.length = 0; if (!L.length || !this.sel.has(id)) continue;
      _a.copy(u.pos); for (const o of L) { if (np >= 120) break; _b.copy(o.tid ? this.units.get(o.tid).pos : o.p); const k = np++ * 6; this.pathP[k] = _a.x; this.pathP[k + 1] = _a.y; this.pathP[k + 2] = _a.z; this.pathP[k + 3] = _b.x; this.pathP[k + 4] = _b.y; this.pathP[k + 5] = _b.z; _a.copy(_b); } }
    this.paths.geometry.setDrawRange(0, np * 2); this.paths.geometry.attributes.position.needsUpdate = true;
    for (let k = 0; k < 64; k++) { if (this.lineT[k] <= 0) continue; this.lineT[k] -= dt; const d = this.lineT[k] <= 0 ? 0 : 1 - dt * 1.6; for (let j = 0; j < 6; j++) this.lineC[k * 6 + j] *= d; }
    this.lines.geometry.attributes.position.needsUpdate = true; this.lines.geometry.attributes.color.needsUpdate = true;
    // relays, rocks, dust
    this.relays.forEach((r, i) => { const d = this.nodes[i]; r.model.rotation.y = t * r.spin; const key = d.owner * 1000 + d.prog;
      if (key !== r.shown) { r.shown = key; r.ring.material.color.copy(d.owner < 0 ? _c.set(0x8892a0) : TEAM[this.ci(d.owner)]); const a = Math.abs(d.prog) / 100; r.fill.visible = a > 0.01;
        if (r.fill.visible) { r.fill.geometry.dispose(); r.fill.geometry = new THREE.RingGeometry(NODE_R * 0.86, NODE_R * 0.96, 48, 1, 0, a * Math.PI * 2); r.fill.material.color.copy(TEAM[this.ci(d.prog < 0 ? 0 : 1)]); } } });
    this.sparks.material.size = 0.007 * this.arena.scale.x; this.dust.material.size = 0.004 * this.arena.scale.x; this.dust.rotation.y = t * 0.004; this.shake = Math.max(0, this.shake - dt * 1.5);
  }
  // the ship a ray points at (o and d in the arena's own space, k the arena's scale); own ships first
  pick(o, d, k, maxT) { let best = 0, bs = 1e9;
    for (const u of this.units.values()) { if (!u.seen) continue; _p.subVectors(u.pos, o); const t = _p.dot(d); if (t < 0 || t > maxT) continue; const perp = Math.sqrt(Math.max(0, _p.lengthSq() - t * t)), lim = Math.max(TYPES[u.type].r, LEN[u.type] * 0.4) * 1.25 + (0.01 + t * k * 0.022) / k;
      if (perp > lim) continue; const s = perp / lim + t * 0.05 + (u.side === this.me ? 0 : 0.15); if (s < bs) { bs = s; best = u.id; } }
    return best; }
  near(p, side, r) { let best = 0, bd = 1e9; for (const u of this.units.values()) { if (u.side !== side || !u.seen) continue; const d = u.pos.distanceTo(p) - Math.max(TYPES[u.type].r, LEN[u.type] * 0.35); if (d < r && d < bd) { bd = d; best = u.id; } } return best; }
}
export { View, loadModels, LEN, TEAM, GLOW, BASE };
