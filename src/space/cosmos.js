// SPACE FLEET's open space, built in three dimensions (no painted sky): the Yale Bright Star Catalogue's 8,404 stars each a point in its true direction with its own brightness and colour, the Milky Way as thousands of faint points laid out as a galaxy's disc and bulge seen from inside, far clusters, a spiral galaxy and clouds of gas each built of their own points, and a sun as a burning sphere. Every star is a soft point of light, never a hard pixel
import * as THREE from 'three';

// galactic to equatorial (J2000), so the built galaxy lies where the real one does among the catalogue's stars
const G2E = new THREE.Matrix3().set(-0.0548755604, 0.4941094279, -0.8676661490, -0.8734370902, -0.4448296300, -0.1980763734, -0.4838350155, 0.7469822445, 0.4559837762);
const TILT = new THREE.Euler(-1.05, 0.6, 0.35);   // how the sky is turned over the field: the galaxy's band rises behind the far fleet
function tint(bv, c) { const t = Math.max(-0.3, Math.min(1.9, bv)); if (t < 0.3) c.setRGB(0.68 + t * 0.9, 0.78 + t * 0.6, 1); else if (t < 0.9) c.setRGB(0.95 + (t - 0.3) * 0.08, 0.96 - (t - 0.3) * 0.12, 1 - (t - 0.3) * 0.5); else c.setRGB(1, 0.89 - (t - 0.9) * 0.3, 0.7 - (t - 0.9) * 0.4); return c; }
const points = (pos, col, size) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('tint', new THREE.BufferAttribute(col, 3)); g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const u = { uPx: { value: 1 } }, vp = new THREE.Vector4(), m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: u, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    vertexShader: 'attribute vec3 tint; attribute float size; varying vec3 vC; uniform float uPx; void main(){ vC = tint; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = max(3.0, size * uPx * 2.2); }',
    fragmentShader: 'varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = exp(-r * r * 5.0) * smoothstep(1.0, 0.7, r); gl_FragColor = vec4(vC * a, 1.0);\n#include <colorspace_fragment>\n}' }));
  m.frustumCulled = false; m.onBeforeRender = (r) => { r.getCurrentViewport(vp); u.uPx.value = vp.w / 900; }; return m; };

// cat: the catalogue as [ra, dec, mag, b-v] in hundredths
function buildCosmos(cat, sunDir) {
  const root = new THREE.Group(), skyG = new THREE.Group(); skyG.rotation.copy(TILT); root.add(skyG); const c = new THREE.Color(), v = new THREE.Vector3();
  // the catalogue's stars: true directions; the bright ones nearer, as on the whole they are
  { const n = cat.length / 4, P = new Float32Array(n * 3), C = new Float32Array(n * 3), S = new Float32Array(n);
    for (let i = 0; i < n; i++) { const ra = cat[i * 4] / 100 * Math.PI / 180, de = cat[i * 4 + 1] / 100 * Math.PI / 180, mag = cat[i * 4 + 2] / 100, d = 700 + Math.max(0, mag + 1.5) * 260, f = Math.min(1.6, Math.pow(10, -0.4 * (mag - 2.2)));
      P[i * 3] = Math.cos(de) * Math.cos(ra) * d; P[i * 3 + 1] = Math.sin(de) * d; P[i * 3 + 2] = -Math.cos(de) * Math.sin(ra) * d; tint(cat[i * 4 + 3] / 100, c).multiplyScalar(0.42 + f * 0.75); C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b; S[i] = 2 + Math.max(0, 5 - mag) * 0.9; }
    skyG.add(points(P, C, S)); }
  // the galaxy: a disc of stars with a bulge at its heart, we 8 kiloparsecs out from the centre; every point has a place in it
  { const n = 36000, P = new Float32Array(n * 3), C = new Float32Array(n * 3), S = new Float32Array(n); let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.87;
    for (let i = 0; i < n; i++) { let x, y, z; const bulge = rnd() < 0.16;
      if (bulge) { x = gauss() * 1.6; y = gauss() * 1.6; z = gauss() * 1.1; } else { const r = -Math.log(1 - rnd() * 0.985) * 3.4, a = rnd() * Math.PI * 2 + r * 0.55 + (rnd() < 0.5 ? Math.PI : 0) + gauss() * 0.5; x = Math.cos(a) * r; y = Math.sin(a) * r; z = gauss() * (0.35 + rnd() * 0.9); }
      v.set(x + 8, y, z); const d = v.length(); if (d < 0.4) v.multiplyScalar(0.4 / d); v.set(-v.x, -v.y, v.z).applyMatrix3(G2E);   // from us, looking in at the centre (galactic x toward it)
      const far = 2400 + Math.min(20, d) * 60; v.normalize(); P[i * 3] = v.x * far; P[i * 3 + 1] = v.z * far; P[i * 3 + 2] = -v.y * far;
      const b = (bulge ? 0.007 : 0.035) * (0.5 + rnd() * 0.7) / (1 + d * 0.035); c.setRGB(bulge ? 1 : 0.8 + rnd() * 0.2, bulge ? 0.86 : 0.86 + rnd() * 0.1, bulge ? 0.68 : 0.9 + rnd() * 0.1).multiplyScalar(b); C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b; S[i] = 2.2 + rnd() * 2.6; }
    skyG.add(points(P, C, S)); }
  // the sun: a burning sphere where the light comes from, its corona two shells of glow
  const sun = new THREE.Group(); sun.position.copy(sunDir).multiplyScalar(2000); sun.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff6e0, toneMapped: false })));
  for (const [r, k, p] of [[70, 0.9, 3], [190, 0.35, 5]]) { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.86, 0.6).multiplyScalar(k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
    m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vGlow;').replace('#include <project_vertex>', '#include <project_vertex>\nvGlow = abs(dot(normalize(normalMatrix * normal), normalize(-mvPosition.xyz)));'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= pow(vGlow, ' + p.toFixed(1) + ');'); };
    sun.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), m)); }
  root.add(sun);
  // far formations, each built of its own stars: tight clusters, a spiral galaxy seen from outside, and two glowing clouds of gas
  { const P = [], C = [], S = []; let seed = 29; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.87, put = (x, y, z, r, g, b, s) => { P.push(x, y, z); C.push(r, g, b); S.push(s); };
    const at = (ra, de, d) => v.set(Math.cos(de) * Math.cos(ra) * d, Math.sin(de) * d, -Math.cos(de) * Math.sin(ra) * d).clone();
    for (const [ra, de, n, sz, warm] of [[0.9, 0.5, 420, 26, 1], [2.3, -0.3, 300, 18, 0], [3.9, 0.9, 520, 34, 1], [5.2, -0.7, 260, 15, 0], [1.6, -1.0, 380, 22, 1], [4.6, 0.2, 240, 14, 0]]) { const o = at(ra, de, 2900);
      for (let i = 0; i < n; i++) { const k = Math.pow(rnd(), 1.8) * sz, a = rnd() * 6.283, z = rnd() * 2 - 1, r = Math.sqrt(1 - z * z), b = 0.1 + rnd() * 0.22; put(o.x + Math.cos(a) * r * k, o.y + z * k, o.z + Math.sin(a) * r * k, b * (warm ? 1 : 0.8), b * 0.9, b * (warm ? 0.72 : 1), 2.2 + rnd() * 2.2); } }
    { const o = at(0.2, -0.25, 3300), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.1, 0.4, 0.7));
      for (let i = 0; i < 4200; i++) { const core = rnd() < 0.3, r = core ? Math.abs(gauss()) * 22 : -Math.log(1 - rnd() * 0.97) * 46, a = rnd() * 6.283 + r * 0.045 + (rnd() < 0.5 ? Math.PI : 0) + gauss() * 0.35, b = (core ? 0.16 : 0.085) * (0.5 + rnd()); v.set(Math.cos(a) * r, gauss() * (core ? 9 : 3), Math.sin(a) * r).applyQuaternion(q); put(o.x + v.x, o.y + v.y, o.z + v.z, b, b * (core ? 0.88 : 0.92), b * (core ? 0.7 : 1.05), 2.2 + rnd() * 2.4); } }
    for (const [ra, de, n, sz, r, g, b] of [[2.9, 0.35, 900, 150, 1, 0.25, 0.32], [5.6, 0.75, 700, 120, 0.25, 0.7, 0.85]]) { const o = at(ra, de, 3000);
      for (let i = 0; i < n; i++) { const k = 0.016 + rnd() * 0.02, lump = rnd() < 0.5 ? 0.45 : 1; put(o.x + gauss() * sz * lump + Math.sin(i * 0.37) * sz * 0.5, o.y + gauss() * sz * 0.55 * lump, o.z + gauss() * sz * lump, r * k, g * k, b * k, 16 + rnd() * 26); } }
    skyG.add(points(new Float32Array(P), new Float32Array(C), new Float32Array(S))); }
  root.tick = () => {};
  return root;
}
export { buildCosmos };
