// the corner of Market St and West St as THE MARKET has it, read out of the market's own page by tools/ramen-corner.cjs (data/sushi/corner.json, corner.bin): every still thing round the cart, in the cart's metres, a drawing a material and a square of ground; its lamps' places; lit windows glow at night as the market's do
import * as THREE from 'three';
import { mat } from './ctx.js';

let D = null;
export const NIGHT = { value: 0 };   // how far the windows are lit (alley.js)
export async function loadCorner(base = '/sushi-assets/') {
  if (D) return D;
  try { const [J, Z] = await Promise.all([fetch(base + 'corner.json').then((r) => r.json()), fetch(base + 'corner.bin').then((r) => r.arrayBuffer())]), z = new Uint8Array(Z, 0, 2);
    const B = z[0] === 0x1f && z[1] === 0x8b ? await new Response(new Blob([Z]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() : Z;   // (gzipped by the bake)
    const texs = await Promise.all(J.texs.map((t) => new Promise((res) => { const im = new Image(), url = URL.createObjectURL(new Blob([new Uint8Array(B, t.at[0], t.at[1])], { type: 'image/webp' }));
      im.onload = () => { const x = new THREE.Texture(im); x.repeat.set(t.rep[0], t.rep[1]); x.offset.set(t.off[0], t.off[1]); x.wrapS = t.wrap[0]; x.wrapT = t.wrap[1]; x.flipY = t.flipY; x.rotation = t.rot || 0; if (t.srgb) x.colorSpace = THREE.SRGBColorSpace; if (t.near) x.magFilter = THREE.NearestFilter; x.anisotropy = 4; x.needsUpdate = true; URL.revokeObjectURL(url); res(x); };
      im.onerror = () => { URL.revokeObjectURL(url); res(null); }; im.src = url; })));
    D = { J, B, texs }; } catch (e) { console.warn('the corner did not come', e); D = { J: { mats: [], chunks: [], lights: [], texs: [], frame: { tile: [-18, -41.3], at: [0, 0], M: 1.34524 } }, B: new ArrayBuffer(0), texs: [] }; }
  return D;
}
const LIN = new Float32Array(256); for (let i = 0; i < 256; i++) { const c = i / 255; LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
const glowing = (m) => { m.onBeforeCompile = (sh) => { sh.uniforms.uNight = NIGHT; sh.vertexShader = 'attribute float glow; varying float vGlow;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vGlow = glow;');
  sh.fragmentShader = 'uniform float uNight; varying float vGlow;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * vGlow * uNight * 1.6;\n#include <opaque_fragment>'); }; m.customProgramCacheKey = () => 'cornerglow'; return m; };
export function buildCorner(parent) {
  const { J, B, texs } = D, group = new THREE.Group(); group.name = 'corner'; parent.add(group);
  const mats = J.mats.map((q) => { const o = { color: new THREE.Color().setRGB(q.c[0], q.c[1], q.c[2]), map: q.map >= 0 ? texs[q.map] : null, side: q.side, alphaTest: q.at || 0, transparent: !!q.tr, opacity: q.tr ? q.op : 1 };
    const m = q.basic ? new THREE.MeshBasicMaterial(o) : mat(o); if (q.tr) m.depthWrite = false; if (!q.basic && q.e) { m.emissive.setRGB(q.e[0], q.e[1], q.e[2]); if (q.emap >= 0) m.emissiveMap = texs[q.emap]; } if (q.glow) glowing(m); m.userData.q = q; return m; });
  let tris = 0;
  for (const c of J.chunks) { const g = new THREE.BufferGeometry(), n = c.n, q = new Uint16Array(B, c.P[0], n * 3), P = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) { const a = i % 3; P[i] = c.lo[a] + (q[i] / 65535) * (c.hi[a] - c.lo[a]); }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    if (c.N) g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(B, c.N[0], n * 3), 3, true));
    if (c.U) { const u = new Uint16Array(B, c.U[0], n * 2), U = new Float32Array(n * 2); for (let i = 0; i < n * 2; i++) { const a = i % 2; U[i] = c.ul[a] + (u[i] / 65535) * (c.uh[a] - c.ul[a]); } g.setAttribute('uv', new THREE.BufferAttribute(U, 2)); }
    let m = mats[c.m];
    if (c.C) { const s = new Uint8Array(B, c.C[0], n * 4), C = new Float32Array(n * 3), Gl = m.userData.q.glow ? new Float32Array(n) : null; for (let i = 0; i < n; i++) { C[i * 3] = LIN[s[i * 4]] * c.ck; C[i * 3 + 1] = LIN[s[i * 4 + 1]] * c.ck; C[i * 3 + 2] = LIN[s[i * 4 + 2]] * c.ck; if (Gl) Gl[i] = s[i * 4 + 3] / 255; }
      g.setAttribute('color', new THREE.BufferAttribute(C, 3)); if (Gl) g.setAttribute('glow', new THREE.BufferAttribute(Gl, 1)); if (!m.vertexColors) { m = mats[c.m + 'v'] ||= (() => { const x = m.clone(); x.vertexColors = true; x.userData.q = m.userData.q; if (m.userData.q.glow) glowing(x); return x; })(); } }
    else if (m.userData.q.glow) g.setAttribute('glow', new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setIndex(new THREE.BufferAttribute(c.i32 ? new Uint32Array(B, c.I[0], c.ni) : new Uint16Array(B, c.I[0], c.ni), 1)); if (!c.N) g.computeVertexNormals(); g.computeBoundingSphere(); g.computeBoundingBox();
    const me = new THREE.Mesh(g, m); me.castShadow = false; me.receiveShadow = true; me.userData.keep = true; me.userData.nopick = true; me.matrixAutoUpdate = false; group.add(me); tris += c.ni / 3; }
  return { group, tris, lights: J.lights, frame: J.frame };
}
