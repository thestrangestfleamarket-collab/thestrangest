// SPACE FLEET's open space, built of bodies in three dimensions (no picture, no painted points): every star is a small glowing ball far off, made and drawn the way the meteors are (one shape, drawn many times, each with its own place and size) - the Yale Bright Star Catalogue's stars in their true directions with their own brightness and colour, a galaxy's disc and bulge seen from inside, far clusters, a spiral galaxy and clouds of gas, and a sun
import * as THREE from 'three';

// galactic to equatorial (J2000), so the built galaxy lies where the real one does among the catalogue's stars
const G2E = new THREE.Matrix3().set(-0.0548755604, 0.4941094279, -0.8676661490, -0.8734370902, -0.4448296300, -0.1980763734, -0.4838350155, 0.7469822445, 0.4559837762);
const TILT = new THREE.Euler(-1.05, 0.6, 0.35), DEG = Math.PI / 180;   // how the sky is turned over the field: the galaxy's band rises behind the far fleet
function tint(bv, c) { const t = Math.max(-0.3, Math.min(1.9, bv)); if (t < 0.3) c.setRGB(0.68 + t * 0.9, 0.78 + t * 0.6, 1); else if (t < 0.9) c.setRGB(0.95 + (t - 0.3) * 0.08, 0.96 - (t - 0.3) * 0.12, 1 - (t - 0.3) * 0.5); else c.setRGB(1, 0.89 - (t - 0.9) * 0.3, 0.7 - (t - 0.9) * 0.4); return c; }
// a ball of light with no edge: brightest where you look into its middle
const glow = (power, color = 0xffffff) => { const m = new THREE.MeshBasicMaterial({ color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
  m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vGlow;').replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\nvec3 gN = normalize(normalMatrix * (mat3(instanceMatrix) * normal));\n#else\nvec3 gN = normalize(normalMatrix * normal);\n#endif\nvGlow = abs(dot(gN, normalize(-mvPosition.xyz)));');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= pow(vGlow, ' + power.toFixed(1) + ');'); }; return m; };

// cat: the catalogue as [ra, dec, mag, b-v] in hundredths, brightest first
function buildCosmos(cat, sunDir) {
  const root = new THREE.Group(), skyG = new THREE.Group(); skyG.rotation.copy(TILT); root.add(skyG); const c = new THREE.Color(), v = new THREE.Vector3(), B = [];   // B: every body as x, y, z, radius, r, g, b
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.87;
  const put = (x, y, z, ang, r, g, b) => B.push(x, y, z, Math.hypot(x, y, z) * Math.tan(ang * DEG), r, g, b), at = (ra, de, d) => new THREE.Vector3(Math.cos(de) * Math.cos(ra) * d, Math.sin(de) * d, -Math.cos(de) * Math.sin(ra) * d);
  // the catalogue's stars: true directions; the bright ones nearer, as on the whole they are, each at its own depth
  for (let i = 0, n = Math.min(4600, cat.length / 4); i < n; i++) { const mag = cat[i * 4 + 2] / 100, p = at(cat[i * 4] / 100 * DEG, cat[i * 4 + 1] / 100 * DEG, 700 + Math.max(0, mag + 1.5) * 300 + rnd() * 500), f = Math.min(3, Math.pow(10, -0.4 * (mag - 2.6)));
    tint(cat[i * 4 + 3] / 100, c).multiplyScalar(0.55 + f * 0.9); put(p.x, p.y, p.z, 0.05 + Math.max(0, 5.5 - mag) * 0.018, c.r, c.g, c.b); }
  // the galaxy: a disc of stars with a bulge at its heart, we 8 kiloparsecs out from the centre; every one has a place in it
  for (let i = 0; i < 6500; i++) { let x, y, z; const bulge = rnd() < 0.16;
    if (bulge) { x = gauss() * 1.6; y = gauss() * 1.6; z = gauss() * 1.1; } else { const r = -Math.log(1 - rnd() * 0.985) * 3.4, a = rnd() * Math.PI * 2 + r * 0.55 + (rnd() < 0.5 ? Math.PI : 0) + gauss() * 0.5; x = Math.cos(a) * r; y = Math.sin(a) * r; z = gauss() * (0.35 + rnd() * 0.9); }
    v.set(x + 8, y, z); const d = v.length(); if (d < 0.4) v.multiplyScalar(0.4 / d); v.set(-v.x, -v.y, v.z).applyMatrix3(G2E).normalize(); const far = 2300 + Math.min(20, d) * 70, b = (bulge ? 0.16 : 0.2) * (0.5 + rnd() * 0.8) / (1 + d * 0.03);
    put(v.x * far, v.z * far, -v.y * far, 0.05 + rnd() * 0.06, b * (bulge ? 1 : 0.85 + rnd() * 0.15), b * 0.88, b * (bulge ? 0.7 : 0.95 + rnd() * 0.1)); }
  // far formations: tight clusters, a spiral galaxy seen from outside, and two clouds of glowing gas (big faint balls, one inside another)
  for (const [ra, de, n, sz, warm] of [[0.9, 0.5, 300, 26, 1], [2.3, -0.3, 220, 18, 0], [3.9, 0.9, 360, 34, 1], [5.2, -0.7, 200, 15, 0], [1.6, -1.0, 260, 22, 1], [4.6, 0.2, 180, 14, 0]]) { const o = at(ra, de, 2900);
    for (let i = 0; i < n; i++) { const k = Math.pow(rnd(), 1.8) * sz, a = rnd() * 6.283, z = rnd() * 2 - 1, r = Math.sqrt(1 - z * z), b = 0.25 + rnd() * 0.5; put(o.x + Math.cos(a) * r * k, o.y + z * k, o.z + Math.sin(a) * r * k, 0.045 + rnd() * 0.04, b * (warm ? 1 : 0.8), b * 0.9, b * (warm ? 0.72 : 1)); } }
  { const o = at(0.2, -0.25, 3300), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.1, 0.4, 0.7));
    for (let i = 0; i < 1900; i++) { const core = rnd() < 0.3, r = core ? Math.abs(gauss()) * 22 : -Math.log(1 - rnd() * 0.97) * 46, a = rnd() * 6.283 + r * 0.045 + (rnd() < 0.5 ? Math.PI : 0) + gauss() * 0.35, b = (core ? 0.3 : 0.2) * (0.5 + rnd()); v.set(Math.cos(a) * r, gauss() * (core ? 9 : 3), Math.sin(a) * r).applyQuaternion(q); put(o.x + v.x, o.y + v.y, o.z + v.z, 0.045 + rnd() * 0.04, b, b * (core ? 0.88 : 0.92), b * (core ? 0.7 : 1.05)); } }
  for (const [ra, de, n, sz, r, g, b] of [[2.9, 0.35, 260, 150, 1, 0.25, 0.32], [5.6, 0.75, 200, 120, 0.25, 0.7, 0.85]]) { const o = at(ra, de, 3000);
    for (let i = 0; i < n; i++) { const k = 0.02 + rnd() * 0.025, lump = rnd() < 0.5 ? 0.45 : 1; put(o.x + gauss() * sz * lump + Math.sin(i * 0.37) * sz * 0.5, o.y + gauss() * sz * 0.55 * lump, o.z + gauss() * sz * lump, 0.5 + rnd() * 0.9, r * k, g * k, b * k); } }
  const n = B.length / 7, im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), glow(2.4), n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(); im.frustumCulled = false;
  for (let i = 0; i < n; i++) { const k = i * 7; m.compose(v.set(B[k], B[k + 1], B[k + 2]), q, s.setScalar(B[k + 3])); im.setMatrixAt(i, m); im.setColorAt(i, c.setRGB(B[k + 4], B[k + 5], B[k + 6])); }
  skyG.add(im); root.bodies = n;
  // the sun: a burning sphere where the light comes from, its corona two shells of glow
  const sun = new THREE.Group(); sun.position.copy(sunDir).multiplyScalar(2000); sun.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff6e0, toneMapped: false })));
  for (const [r, k, p] of [[70, 0.9, 3], [190, 0.35, 5]]) sun.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), glow(p, new THREE.Color(1, 0.86, 0.6).multiplyScalar(k))));
  root.add(sun); root.tick = () => {};
  return root;
}
export { buildCosmos, tint };   // tint: a star's colour from its B-V, used by FOURTH & LONG's far stars too
