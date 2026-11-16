// Shared creature-building kit: chitin and eye materials, shell fur, jointed limbs, wing/iris textures.
'use strict';
(function () {
const { V3, Y, col, clamp } = MC, N = MC.noise;
const K = MC.creature = {};
let FUR, CHITIN_N, FACET_N, SKIN_N, SPH, SPHZ;
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }
K.canvasTex = function (c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
K.init = function () {
  if (FUR) return;
  // fur density map: soft dots, so a rising alpha threshold makes every strand taper to a tip
  const c = canvas(256), g = c.getContext('2d'), r = MC.rng(77); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5200; i++) { const x = r() * 256, y = r() * 256, rad = 2.2 + r() * 2.6, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; for (const ox of [0, 256, -256]) for (const oy of [0, 256, -256]) if (x + ox > -6 && x + ox < 262 && y + oy > -6 && y + oy < 262) g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); }
  FUR = new THREE.CanvasTexture(c); FUR.wrapS = FUR.wrapT = THREE.RepeatWrapping;
  CHITIN_N = MC.genTex(128, (u, v, o) => { o.h = N.fbm(u, v, 3, 20, 20, 3) * 0.5 + N.vnoise(u * 5, v * 48, 48, 9) * 0.5; }, 0.5).normalMap;
  FACET_N = MC.genTex(128, (u, v, o) => { const a = u * 16, b = v * 16 + (Math.floor(a) % 2) * 0.5, fx = a - Math.floor(a) - 0.5, fy = b - Math.floor(b) - 0.5; o.h = Math.max(0, 1 - (fx * fx + fy * fy) * 4.5); }, 2.2).normalMap;
  SKIN_N = MC.genTex(128, (u, v, o) => { o.h = N.fbm(u, v, 3, 30, 30, 11); }, 0.8).normalMap;
  SPH = new THREE.SphereGeometry(1, 36, 26); SPHZ = new THREE.SphereGeometry(1, 36, 26); SPHZ.rotateX(Math.PI / 2);
  K.SPH = SPH; K.SPHZ = SPHZ; K.FUR = FUR;
};
// glossy exoskeleton: clear-coated, finely pitted
K.chitin = function (hex, o = {}) {
  const m = new THREE.MeshPhysicalMaterial({ color: col(hex), roughness: o.rough == null ? 0.38 : o.rough, metalness: o.metal == null ? 0.05 : o.metal, clearcoat: o.coat == null ? 0.85 : o.coat, clearcoatRoughness: o.coatRough == null ? 0.22 : o.coatRough, normalMap: CHITIN_N, envMapIntensity: 2.4 });
  m.color.multiplyScalar(1.18); m.normalScale.set(0.45, 0.45); if (o.map) m.map = o.map; if (o.sheen) { m.sheen = 1; m.sheenColor = col(o.sheen); } if (o.emissive) { m.emissive = col(o.emissive); m.emissiveIntensity = o.emissiveI || 0.3; } return m;
};
K.eyeMat = function (hex, facets = true) { const m = new THREE.MeshPhysicalMaterial({ color: col(hex), roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 3.5 }); if (facets) { m.normalMap = FACET_N; m.normalScale.set(0.6, 0.6); } return m; };
K.skin = function (hex, o = {}) { const m = new THREE.MeshStandardMaterial({ color: col(hex), roughness: o.rough == null ? 0.62 : o.rough, normalMap: SKIN_N }); m.normalScale.set(0.35, 0.35); if (o.emissive) { m.emissive = col(o.emissive); m.emissiveIntensity = o.emissiveI || 0.12; } return m; };
K.matte = (hex, rough = 0.9) => new THREE.MeshStandardMaterial({ color: col(hex), roughness: rough });

K.ell = function (parent, mat, x, y, z, sx, sy, sz, o = {}) {
  const m = new THREE.Mesh(o.geo || (o.z ? SPHZ : SPH), mat); m.position.set(x, y, z); m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; m.castShadow = o.cast !== false; m.receiveShadow = true; parent.add(m); return m;
};
// Shell fur: stacked cut-out copies of a mesh, each pushed further out along the normals.
K.fur = function (mesh, o = {}) {
  const layers = o.layers || 12, len = o.len || 0.06, root = col(o.root == null ? 0x3a3028 : o.root), tip = col(o.tip == null ? 0xb8a890 : o.tip), g0 = mesh.geometry, sc = mesh.scale, rep = o.repeat || 5, droop = o.droop == null ? 0.35 : o.droop;
  const p0 = g0.attributes.position, n0 = g0.attributes.normal, out = [];
  for (let i = 1; i <= layers; i++) {
    const t = i / layers, g = g0.clone(), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const d = len * t; p.setXYZ(k, p0.getX(k) + n0.getX(k) * d / sc.x, p0.getY(k) + (n0.getY(k) * d - droop * len * t * t) / sc.y, p0.getZ(k) + n0.getZ(k) * d / sc.z); }
    const m = new THREE.MeshStandardMaterial({ color: root.clone().lerp(tip, Math.pow(t, 0.7)), roughness: 1, alphaMap: FUR, alphaTest: 0.12 + 0.72 * t, side: THREE.FrontSide });
    if (o.map) m.map = o.map;
    const sh = new THREE.Mesh(g, m); sh.castShadow = false; sh.receiveShadow = true; sh.userData.furLayer = i; mesh.add(sh); out.push(sh);
    // fur density is tied to this geometry's own UVs
    if (i === 1 && !g0.userData.furUV) { const uv = g0.attributes.uv; g0.userData.furUV = true; void uv; }
    m.alphaMap = FUR; m.userData.rep = rep;
    m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <alphamap_fragment>', 'diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv * ' + rep.toFixed(1) + ' ).g;'); };
    m.customProgramCacheKey = () => 'fur' + rep;
  }
  return out;
};
const _d = new V3();
K.seg = function (m, a, b) { _d.subVectors(b, a); const l = _d.length(); m.position.copy(a); m.scale.set(1, l, 1); m.quaternion.setFromUnitVectors(Y, _d.divideScalar(l || 1)); };
// two-bone IK: returns the knee position
K.knee = function (hip, foot, L1, L2, pole) {
  const d = new V3().subVectors(foot, hip); let dl = d.length(); const mx = L1 + L2 - 1e-3; if (dl > mx) dl = mx; const dir = d.clone().normalize();
  const a = (L1 * L1 - L2 * L2 + dl * dl) / (2 * dl), h = Math.sqrt(Math.max(0, L1 * L1 - a * a)), pl = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  return hip.clone().addScaledVector(dir, a).addScaledVector(pl, h);
};
// a jointed limb through a list of points with per-joint radii; call .pose(points) to re-aim it
K.limb = function (parent, pts, radii, mat, o = {}) {
  const segs = [], joints = [];
  for (let i = 0; i < pts.length - 1; i++) { const g = new THREE.CylinderGeometry(radii[i + 1], radii[i], 1, 10, 1); g.translate(0, 0.5, 0); const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); segs.push(m); }
  for (let i = 1; i < pts.length - 1; i++) { const j = new THREE.Mesh(SPH, mat); j.scale.setScalar(radii[i] * 1.18); j.castShadow = true; parent.add(j); joints.push(j); }
  const L = { segs, joints, pose(p) { for (let i = 0; i < segs.length; i++) K.seg(segs[i], p[i], p[i + 1]); for (let i = 0; i < joints.length; i++) joints[i].position.copy(p[i + 1]); } };
  L.pose(pts); if (o.claw) { const c = new THREE.Mesh(new THREE.ConeGeometry(radii[radii.length - 1] * 1.1, radii[radii.length - 1] * 5, 6), mat); parent.add(c); L.claw = c; }
  return L;
};
K.tube = function (parent, pts, r, mat, seg = 20) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 6), mat); m.castShadow = true; parent.add(m); return m; };
// tapered whisker / antenna along a quadratic curve
K.taper = function (parent, a, b, c, r0, r1, mat, n = 9) {
  const g = new THREE.Group(); parent.add(g); let prev = a.clone();
  for (let i = 1; i <= n; i++) { const t = i / n, p = new V3().copy(a).multiplyScalar((1 - t) * (1 - t)).addScaledVector(b, 2 * (1 - t) * t).addScaledVector(c, t * t), ra = r0 + (r1 - r0) * (i - 1) / n, rb = r0 + (r1 - r0) * t; const ge = new THREE.CylinderGeometry(rb, ra, 1, 6, 1); ge.translate(0, 0.5, 0); const m = new THREE.Mesh(ge, mat); K.seg(m, prev, p); m.castShadow = false; g.add(m); prev = p; }
  return g;
};
// textures -------------------------------------------------------------------
K.dotsTex = function (base, dot, spots) { // ladybird-style wing cases (sphere UVs, poles on the body axis)
  const c = canvas(256, 128), g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 256, 128); g.fillStyle = dot;
  for (const [u, v, r] of spots) for (const uu of [u, 1 - u]) { g.beginPath(); g.ellipse(uu * 256, v * 128, r * 256, r * 128 * 1.6, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(126, 0, 4, 128); g.fillRect(0, 0, 2, 128); g.fillRect(254, 0, 2, 128); return K.canvasTex(c);
};
K.stripeTex = function (a, b, n, soft) { const c = canvas(256, 128), g = c.getContext('2d'); g.fillStyle = a; g.fillRect(0, 0, 256, 128); g.fillStyle = b; for (let i = 0; i < n; i++) { const y = (i + 0.5) / n * 128; g.globalAlpha = soft ? 0.55 : 1; g.fillRect(0, y - 128 / n * 0.22, 256, 128 / n * 0.44); } g.globalAlpha = 1; return K.canvasTex(c); };
K.wingTex = function (kind, tint) {
  const c = canvas(256), g = c.getContext('2d'), r = MC.rng(kind === 'moth' ? 5 : 9);
  if (kind === 'moth') {
    g.fillStyle = tint || '#cdbb96'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(70,50,30,' + (0.25 + r() * 0.3) + ')'; g.lineWidth = 3 + r() * 9; g.beginPath(); const y = 30 + i * 26; g.moveTo(0, y + r() * 10); g.bezierCurveTo(80, y - 22, 170, y + 22, 256, y - 6); g.stroke(); }
    for (const [x, y] of [[150, 150]]) { let gr = g.createRadialGradient(x, y, 2, x, y, 34); gr.addColorStop(0, '#15100c'); gr.addColorStop(0.35, '#3b6a8a'); gr.addColorStop(0.55, '#e8d9a8'); gr.addColorStop(0.8, '#3a2a1a'); gr.addColorStop(1, 'rgba(58,42,26,0)'); g.fillStyle = gr; g.fillRect(x - 36, y - 36, 72, 72); }
    for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '40,28,18' : '255,245,220') + ',' + r() * 0.18 + ')'; g.fillRect(r() * 256, r() * 256, 2, 2); }
  } else {
    g.clearRect(0, 0, 256, 256); g.fillStyle = 'rgba(210,225,235,0.22)'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(40,36,32,0.85)'; g.lineWidth = 2.2;
    for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(8, 128); g.bezierCurveTo(90, 128 + (i - 3) * 30, 170, 128 + (i - 3) * 44, 250, 128 + (i - 3) * 34); g.stroke(); }
    for (let i = 0; i < 9; i++) { const x = 50 + i * 22; g.beginPath(); g.moveTo(x, 128 - i * 9 - 14); g.lineTo(x + 8, 128 + i * 9 + 14); g.stroke(); }
  }
  return K.canvasTex(c);
};
K.irisTex = function (inner, outer, pupilW) {
  const c = canvas(256), g = c.getContext('2d'); g.fillStyle = '#0a0806'; g.fillRect(0, 0, 256, 256);
  const gr = g.createRadialGradient(128, 128, 10, 128, 128, 118); gr.addColorStop(0, inner); gr.addColorStop(0.75, outer); gr.addColorStop(0.97, '#1a1408'); gr.addColorStop(1, '#0a0806'); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  const r = MC.rng(3); g.strokeStyle = 'rgba(40,30,10,0.35)'; g.lineWidth = 1.5; for (let i = 0; i < 160; i++) { const a = r() * 6.283, r0 = 30 + r() * 30, r1 = 70 + r() * 46; g.beginPath(); g.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0); g.lineTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1); g.stroke(); }
  g.fillStyle = '#020202'; g.beginPath(); g.ellipse(128, 128, 118 * pupilW, 96, 0, 0, 7); g.fill(); return K.canvasTex(c);
};
})();
