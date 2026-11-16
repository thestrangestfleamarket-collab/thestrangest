// Polyfork rigged creatures (polyfork.dev/licensing: use in games, no reselling the files).
'use strict';
// The decoder follows thestrangest's SKIN: int16 corners, byte colours, 4-bone skinning, int16 quaternion clips.
(function () {
const PF = MC.pf = {};
const B64 = s => { if (typeof s !== 'string') return s; const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };
const F32 = s => new Float32Array(B64(s).buffer), I16 = s => new Int16Array(B64(s).buffer), U16 = s => new Uint16Array(B64(s).buffer);
const DEC = new Map(), M4 = new THREE.Matrix4();
const srgb = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const hex3 = h => { h = typeof h === 'number' ? h : parseInt(String(h).replace('#', ''), 16); return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; };
PF.has = k => !!(window.PFDATA && window.PFDATA[k]);
function dec(k) {
  let D = DEC.get(k); if (D) return D; const S = window.PFDATA[k], M = S.mesh, q = I16(M.p), p = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) p[i] = (q[i] + 32500) * M.sc + M.lo[i % 3];
  D = { S, p, c: B64(M.c), i: U16(M.i), j: M.j ? B64(M.j) : null, w: M.w ? B64(M.w) : null, z: M.z ? B64(M.z) : null, clips: null }; DEC.set(k, D); return D;
}
function rig(S) {
  const R = S.rig, bones = R.names.map((nm, i) => { const b = new THREE.Bone(); b.name = nm; b.position.fromArray(R.t[i]); b.quaternion.fromArray(R.q[i]); if (R.s) b.scale.fromArray(R.s[i]); return b; });
  R.parent.forEach((p, i) => { if (p >= 0) bones[p].add(bones[i]); }); const W = bones.map(() => new THREE.Matrix4());
  bones.forEach((b, i) => { M4.compose(b.position, b.quaternion, b.scale); W[i].copy(R.parent[i] >= 0 ? W[R.parent[i]] : new THREE.Matrix4()).multiply(M4); });
  return { bones, W, skeleton: new THREE.Skeleton(bones, W.map(m => m.clone().invert())) };
}
function clips(D) {
  if (D.clips) return D.clips; const S = D.S, out = {}, BN = S.rig.names;
  for (const [name, C] of Object.entries(S.clips)) {
    const tm = Array.from({ length: C.n }, (_, k) => k * C.dur / (C.n - 1)), Q = I16(C.q), tr = [];
    BN.forEach((bn, j) => { const v = new Float32Array(C.n * 4); for (let k = 0; k < C.n; k++) for (let c = 0; c < 4; c++) v[k * 4 + c] = Q[(k * BN.length + j) * 4 + c] / 32000; tr.push(new THREE.QuaternionKeyframeTrack(bn + '.quaternion', tm, v)); });
    for (const bn in C.p) { const j = BN.indexOf(bn), d = F32(C.p[bn]), v = new Float32Array(d.length); for (let k = 0; k < d.length; k++) v[k] = d[k] + S.rig.t[j][k % 3]; tr.push(new THREE.VectorKeyframeTrack(bn + '.position', tm, v)); }
    out[name] = new THREE.AnimationClip(name, C.dur, tr);
  }
  return D.clips = out;
}
// a clip for what it is doing: names vary (Walk, Crawl, Fly, Flying, Roll_up ...)
PF.pick = function (CL, want) {
  const N = Object.keys(CL), f = re => N.find(n => re.test(n));
  if (want === 'fly') return f(/^fly(?!_fast)|flying|flap|hover/i) || null;
  if (want === 'run') return f(/^run/i) || f(/fly_fast/i) || f(/^walk|crawl/i) || N[0];
  if (want === 'walk') return f(/^walk/i) || f(/crawl/i) || N[0];
  if (want === 'curl') return f(/curl|roll/i) || null;
  return f(/^idle/i) || N[0];
};
// recolour by zone: each corner keeps its own shading relative to its zone's base colour
function paint(D, colors, geo) {
  const S = D.S, n = S.mesh.n, C0 = D.c, out = new Float32Array(n * 3), Z0 = S.zones.map(z => hex3(z[1])), Zn = S.zones.map(z => hex3(colors && colors[z[0]] != null ? colors[z[0]] : z[1]));
  for (let i = 0; i < n; i++) {
    const z = D.z ? D.z[i] : 0, a = Z0[z] || [128, 128, 128], b = Zn[z] || a, lv = (C0[i * 3] + C0[i * 3 + 1] + C0[i * 3 + 2] + 1) / (a[0] + a[1] + a[2] + 1);
    for (let c = 0; c < 3; c++) out[i * 3 + c] = srgb(Math.max(0, Math.min(255, b[c] * lv)));
  }
  geo.setAttribute('color', new THREE.BufferAttribute(out, 3));
}
// low-poly corners are split per face: average normals over corners at the same spot, so a big close-up body reads smooth
function smooth(g) {
  const P = g.attributes.position, N = g.attributes.normal, map = new Map(), key = i => Math.round(P.getX(i) * 1e4) + ',' + Math.round(P.getY(i) * 1e4) + ',' + Math.round(P.getZ(i) * 1e4);
  for (let i = 0; i < P.count; i++) { const k = key(i); let a = map.get(k); if (!a) map.set(k, a = [0, 0, 0]); a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); }
  for (let i = 0; i < P.count; i++) { const a = map.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  N.needsUpdate = true;
}
// fur shells on a skinned body: each shell shares the skeleton, so it bends with the body (UVs from a box projection; fur noise hides the seams)
PF.fur = function (P, o = {}) {
  MC.creature.init(); const FUR = MC.creature.FUR, g0 = P.mesh.geometry, p0 = g0.attributes.position, n0 = g0.attributes.normal, n = p0.count, layers = o.layers || 10, len = (o.len || 0.1) / P.scale, rep = o.repeat || 6, out = [];
  const uv = new Float32Array(n * 2); for (let i = 0; i < n; i++) { const ax = Math.abs(n0.getX(i)), ay = Math.abs(n0.getY(i)); const u = ax > ay ? p0.getZ(i) : p0.getX(i), v = ax > ay || ay < 0.6 ? p0.getY(i) : p0.getZ(i); uv[i * 2] = u * P.scale * 0.25; uv[i * 2 + 1] = v * P.scale * 0.25; }
  const root = new THREE.Color(o.root == null ? 0x15120f : o.root), tip = new THREE.Color(o.tip == null ? 0x4a423a : o.tip), mask = o.skip ? o.skip(P) : null;
  for (let k = 1; k <= layers; k++) {
    const t = k / layers, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const d = mask && mask[i] ? 0 : len * t; pos[i * 3] = p0.getX(i) + n0.getX(i) * d; pos[i * 3 + 1] = p0.getY(i) + n0.getY(i) * d - (o.droop || 0.3) * len * t * t; pos[i * 3 + 2] = p0.getZ(i) + n0.getZ(i) * d; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', n0); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(g0.index);
    g.setAttribute('skinIndex', g0.attributes.skinIndex); g.setAttribute('skinWeight', g0.attributes.skinWeight); g.setAttribute('color', g0.attributes.color);
    const m = new THREE.MeshStandardMaterial({ color: root.clone().lerp(tip, Math.pow(t, 0.7)), vertexColors: !!o.tint, roughness: 1, alphaMap: FUR, alphaTest: 0.12 + 0.72 * t });
    m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <alphamap_fragment>', 'diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv * ' + rep.toFixed(1) + ' ).g;'); };
    m.customProgramCacheKey = () => 'pffur' + rep;
    const sh = new THREE.SkinnedMesh(g, m); sh.bind(P.mesh.skeleton, P.mesh.bindMatrix); sh.castShadow = false; sh.receiveShadow = true; sh.userData.furLayer = k; sh.boundingSphere = P.mesh.boundingSphere; sh.frustumCulled = P.mesh.frustumCulled;
    P.mesh.parent.add(sh); out.push(sh);
  }
  P.furShells = out; return out;
};
PF.zoneOf = P => { const D = DEC.get(P.kind); return D.z ? Array.from(D.z) : []; };
// the centre of each eye (corners of the named zone, split left and right), in the head bone's frame
PF.eyes = function (P, zone = 'eye') {
  const D = DEC.get(P.kind), S = D.S, zi = S.zones.findIndex(z => z[0] === zone); if (zi < 0) return [];
  const sides = [[new THREE.Vector3(), 0], [new THREE.Vector3(), 0]], v = new THREE.Vector3();
  for (let i = 0; i < S.mesh.n; i++) if (D.z[i] === zi) { v.fromArray(D.p, i * 3); const s = v.x < 0 ? 0 : 1; sides[s][0].add(v); sides[s][1]++; }
  P.mesh.updateMatrixWorld(true); const inv = P.restHeadInv;
  return sides.filter(x => x[1]).map(x => x[0].divideScalar(x[1]).applyMatrix4(inv));
};
// zone mask (1 where the corner's zone is in the list), for glow
function mask(D, names) { const S = D.S, ids = new Set(S.zones.map((z, i) => names.includes(z[0]) ? i : -1)), m = new Float32Array(S.mesh.n); for (let i = 0; i < m.length; i++) m[i] = D.z && ids.has(D.z[i]) ? 1 : 0; return m; }

// build(kind, {colors, len, glow:[zones], mat}) -> { root, mesh, mixer, clips, play(name, fade), bone(re), scale, head, headBox }
PF.build = function (k, o = {}) {
  const D = dec(k), S = D.S, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(D.p.slice(), 3)); g.setIndex(new THREE.BufferAttribute(D.i.slice(), 1));
  if (D.j) { g.setAttribute('skinIndex', new THREE.Uint8BufferAttribute(D.j.slice(), 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(D.w.slice(), 4, true)); }
  paint(D, o.colors, g); g.computeVertexNormals(); if (o.smooth) smooth(g);
  const mo = Object.assign({ vertexColors: true, roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 1.6 }, o.mat || {});
  const mat = new THREE.MeshPhysicalMaterial(mo);
  if (o.glow) {
    g.setAttribute('glow', new THREE.BufferAttribute(mask(D, o.glow), 1)); mat.userData.glow = { value: 1 };
    mat.onBeforeCompile = s => { s.uniforms.uGlow = mat.userData.glow; s.vertexShader = 'attribute float glow;\nvarying float vGlow;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = glow;');
      s.fragmentShader = 'uniform float uGlow;\nvarying float vGlow;\n' + s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.75, 1.0, 0.28) * vGlow * uGlow * 2.2;'); };
    mat.customProgramCacheKey = () => 'pfglow';
  }
  const R = rig(S), mesh = new THREE.SkinnedMesh(g, mat); mesh.add(R.bones[0]); mesh.bind(R.skeleton); mesh.castShadow = true; mesh.receiveShadow = true;
  g.computeBoundingSphere(); mesh.boundingSphere = g.boundingSphere.clone(); mesh.boundingSphere.radius *= 2;   // moves stay inside twice the rest pose
  // fit: longest horizontal extent -> o.len, feet on y=0
  const bb = new THREE.Box3().setFromBufferAttribute(g.attributes.position), sz = bb.getSize(new THREE.Vector3()), sc = (o.len || 1) / Math.max(sz.x, sz.z);
  const root = new THREE.Group(), holder = new THREE.Group(); holder.scale.setScalar(sc); holder.position.y = -bb.min.y * sc; holder.add(mesh); root.add(holder);
  const CL = clips(D), mixer = new THREE.AnimationMixer(R.bones[0]); let cur = null;
  const P = { root, holder, mesh, mixer, clips: CL, scale: sc, size: sz.multiplyScalar(sc), bones: R.bones, mat, cur: () => cur,
    play(name, fade = 0.25, ts = 1) { if (!name || !CL[name]) return; const a = mixer.clipAction(CL[name]); a.timeScale = ts; if (name === cur) return a; P.orient(name); a.reset().fadeIn(cur ? fade : 0).play(); if (cur) mixer.clipAction(CL[cur]).fadeOut(fade); cur = name; return a; },
    bone: re => R.bones.find(b => re.test(b.name)) };
  // the head: the bone named head (else the frontmost bone with a child), and the box of the corners it mostly carries
  let hb = P.bone(/^head$/i) || P.bone(/head/i) || P.bone(/fang|pedipalp|mandible|jaw/i); if (!hb) { let best = -1e9; R.bones.forEach((b, i) => { const z = R.W[i].elements[14]; if (z > best && b.children.length) { best = z; hb = b; } }); }
  const hi = R.bones.indexOf(hb), box = new THREE.Box3(), v = new THREE.Vector3();
  if (D.j) for (let i = 0; i < S.mesh.n; i++) for (let c = 0; c < 4; c++) if (D.j[i * 4 + c] === hi && D.w[i * 4 + c] > 140) box.expandByPoint(v.fromArray(D.p, i * 3));
  if (box.isEmpty()) box.setFromCenterAndSize(new THREE.Vector3().setFromMatrixPosition(R.W[hi]), new THREE.Vector3(0.2, 0.2, 0.2).divideScalar(sc));
  const hc = box.getCenter(new THREE.Vector3()); P.head = hb;
  // each clip can carry its own turn of the hips: measure which way the head points at its first frame, so every clip faces +Z
  const hips = R.bones[0], tmp = new THREE.AnimationMixer(hips), sv = R.bones.map(b => [b.position.clone(), b.quaternion.clone()]), wh = new THREE.Vector3(), wb = new THREE.Vector3(), front = P.bone(/fang|pedipalp/i) ? R.bones.filter(b => /fang|pedipalp/i.test(b.name)) : [hb];
  // measured on the skinned corners themselves (the drawn body), head corners against all corners
  const hv = [], av = []; if (D.j) for (let i = 0; i < S.mesh.n; i++) { if (i % 7 === 0) av.push(i); for (let c = 0; c < 4; c++) if (front.includes(R.bones[D.j[i * 4 + c]]) && D.w[i * 4 + c] > 140) { hv.push(i); break; } }
  if (!hv.length) for (let i = 0; i < S.mesh.n; i++) for (let c = 0; c < 4; c++) if (D.j && D.j[i * 4 + c] === hi && D.w[i * 4 + c] > 140) { hv.push(i); break; }
  P.face = {}; const tv = new THREE.Vector3(), avg = (L, out) => { out.set(0, 0, 0); for (const i of L) out.add(mesh.getVertexPosition(i, tv)); return out.divideScalar(Math.max(1, L.length)); };
  for (const nm in CL) { const a = tmp.clipAction(CL[nm]); a.play(); tmp.update(0); hips.updateMatrixWorld(true); mesh.skeleton.update();
    avg(hv, wh); avg(av, wb); P.face[nm] = /curl|roll/i.test(nm) ? null : Math.atan2(wh.x - wb.x, wh.z - wb.z); a.stop(); R.bones.forEach((b, k) => { b.position.copy(sv[k][0]); b.quaternion.copy(sv[k][1]); }); }
  tmp.uncacheRoot(hips);
  const bc = bb.getCenter(new THREE.Vector3()), Yax = new THREE.Vector3(0, 1, 0);
  P.orient = nm => { const fa = P.face[nm] == null ? (P.fa || 0) : P.face[nm]; holder.rotation.y = -fa; const off = new THREE.Vector3(bc.x, 0, bc.z).multiplyScalar(sc).applyAxisAngle(Yax, -fa); holder.position.x = -off.x; holder.position.z = -off.z; P.fa = fa; };
  P.kind = k; P.restHeadInv = R.W[hi].clone().invert(); P.headLocal = hc.clone().applyMatrix4(P.restHeadInv); P.headBox = box.getSize(new THREE.Vector3()).multiplyScalar(sc * 0.5);
  const fa0 = P.face[PF.pick(CL, 'idle')] || 0; P.orient(PF.pick(CL, 'idle'));  if (Math.abs(Math.sin(fa0)) > 0.7) { const t = P.headBox.x; P.headBox.x = P.headBox.z; P.headBox.z = t; }
  P.play(PF.pick(CL, 'idle')); mixer.update(Math.random() * 3);
  return P;
};
})();
