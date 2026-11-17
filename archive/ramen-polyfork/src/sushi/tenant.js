// a tenant of THE MARKET as they really are, in period dress: their own figure (a Walker of rigid pieces, or a body on 15 bones) sent once by their market page (146bg), drawn here and moved by their bones' matrices ten times a second, with what they hold (a guitar) where their hands have it
import * as THREE from 'three';
import { dye } from './pf.js';

const dec = (s, T) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); };

// their own body and face, but dressed for the village (owner, 16 Nov 2026): what they wear dyed to indigo work clothes, skin and hair kept
const DRESSED = [0x1c2440, 0x3a4a6a, 0xc8c0a8], _k = new THREE.Color();
const period = (u) => { const f = new Float32Array(u.length); for (let i = 0; i < u.length; i += 3) { _k.setRGB(u[i] / 255, u[i + 1] / 255, u[i + 2] / 255, THREE.SRGBColorSpace); f[i] = _k.r; f[i + 1] = _k.g; f[i + 2] = _k.b; } dye(f, DRESSED); for (let i = 0; i < u.length; i += 3) { _k.setRGB(f[i], f[i + 1], f[i + 2]); const c = _k.getRGB({}, THREE.SRGBColorSpace); u[i] = c.r * 255; u[i + 1] = c.g * 255; u[i + 2] = c.b * 255; } return u; };
// D: {kind 'w' | 'b', np matrices, n points, lo, hi, s scale to metres, p points, c colours, b piece or bones, i index, x held things [{n, lo, hi, p, c, i}]}; mirror: -1 when the market's alley runs the other way round
export function tenantFigure(D, mirror = 1) {
  const n = D.n, q = dec(D.p, Uint16Array), P = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) { const a = i % 3; P[i] = D.lo[a] + (q[i] / 65535) * (D.hi[a] - D.lo[a]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(period(dec(D.c, Uint8Array)), 3, true));
  const B = dec(D.b, Uint8Array);
  if (D.kind === 'w') g.setAttribute('pidx', new THREE.BufferAttribute(Float32Array.from(B), 1));
  else { const bi = new Float32Array(n * 2), bw = new Float32Array(n); for (let i = 0; i < n; i++) { bi[i * 2] = B[i * 3]; bi[i * 2 + 1] = B[i * 3 + 1]; bw[i] = B[i * 3 + 2] / 255; } g.setAttribute('bi', new THREE.BufferAttribute(bi, 2)); g.setAttribute('bw', new THREE.BufferAttribute(bw, 1)); }
  if (D.i) g.setIndex(new THREE.BufferAttribute(dec(D.i, Uint16Array), 1)); g.computeVertexNormals(); g.computeBoundingSphere();
  const np = Math.max(1, D.np | 0), PM = { value: Array.from({ length: np }, () => new THREE.Matrix4()) }, cur = Array.from({ length: np }, () => new THREE.Matrix4()), want = Array.from({ length: np }, () => new THREE.Matrix4());
  const head = D.kind === 'w' ? `attribute float pidx; uniform mat4 uPM[${np}];` : `attribute vec2 bi; attribute float bw; uniform mat4 uPM[${np}];`, at = D.kind === 'w' ? 'mat4 PM=uPM[int(pidx+0.5)];' : 'mat4 PM=uPM[int(bi.x+.5)]*bw+uPM[int(bi.y+.5)]*(1.-bw);';
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => { sh.uniforms.uPM = PM; sh.vertexShader = head + '\n' + sh.vertexShader.replace('#include <beginnormal_vertex>', at + ' vec3 objectNormal=normalize(mat3(PM)*normal);').replace('#include <begin_vertex>', 'vec3 transformed=(PM*vec4(position,1.)).xyz;'); };
  mat.customProgramCacheKey = () => 'tenant' + D.kind + np;
  const me = new THREE.Mesh(g, mat); me.frustumCulled = false; me.castShadow = true; me.userData.nopick = true;
  const root = new THREE.Group(), inner = new THREE.Group(); inner.scale.set(D.s[0] * mirror, D.s[1], D.s[2]); inner.add(me); root.add(inner);
  const held = (Array.isArray(D.x) ? D.x : []).slice(0, 8).map((x) => { const q = dec(x.p, Uint16Array), P = new Float32Array(x.n * 3); for (let i = 0; i < x.n * 3; i++) { const a = i % 3; P[i] = x.lo[a] + (q[i] / 65535) * (x.hi[a] - x.lo[a]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(dec(x.c, Uint8Array), 3, true)); if (x.i) g.setIndex(new THREE.BufferAttribute(dec(x.i, Uint16Array), 1)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); m.matrixAutoUpdate = false; m.visible = false; m.castShadow = true; m.userData.nopick = true; m.frustumCulled = false; inner.add(m); return { m, cur: new THREE.Matrix4(), want: new THREE.Matrix4(), on: false }; });
  let got = false;
  return { root, key: '',
    // the bones as their market page posed them: 12 numbers a matrix
    pose(m, x) { if (!Array.isArray(m)) return; for (let j = 0; j < held.length; j++) { const H = held[j], a = Array.isArray(x) ? x[j] : null; if (!Array.isArray(a) || a.length < 12) { H.on = H.m.visible = false; continue; } H.want.set(+a[0], +a[3], +a[6], +a[9], +a[1], +a[4], +a[7], +a[10], +a[2], +a[5], +a[8], +a[11], 0, 0, 0, 1); if (!H.on) { H.on = true; H.cur.copy(H.want); H.m.matrix.copy(H.want); H.m.visible = true; } } for (let i = 0; i < np && i * 12 + 11 < m.length; i++) { const k = i * 12, e = want[i].elements; e[0] = +m[k]; e[1] = +m[k + 1]; e[2] = +m[k + 2]; e[3] = 0; e[4] = +m[k + 3]; e[5] = +m[k + 4]; e[6] = +m[k + 5]; e[7] = 0; e[8] = +m[k + 6]; e[9] = +m[k + 7]; e[10] = +m[k + 8]; e[11] = 0; e[12] = +m[k + 9]; e[13] = +m[k + 10]; e[14] = +m[k + 11]; e[15] = 1; } if (!got) { got = true; for (let i = 0; i < np; i++) { cur[i].copy(want[i]); PM.value[i].copy(want[i]); } } },
    // eased toward the last pose, so ten a second look smooth
    update(dt) { if (!got) return; const k = Math.min(1, dt * 12); for (let i = 0; i < np; i++) { const a = cur[i].elements, b = want[i].elements, o = PM.value[i].elements; for (let j = 0; j < 16; j++) o[j] = a[j] += (b[j] - a[j]) * k; }
      for (const H of held) if (H.on) { const a = H.cur.elements, b = H.want.elements; for (let j = 0; j < 16; j++) a[j] += (b[j] - a[j]) * k; H.m.matrix.copy(H.cur); H.m.matrixWorldNeedsUpdate = true; } },
    held: () => held.filter((H) => H.on).length,
    posed: () => got, hipY: () => want[0].elements[13],
    dispose() { root.removeFromParent(); g.dispose(); mat.dispose(); for (const H of held) { H.m.geometry.dispose(); H.m.material.dispose(); } } };
}
