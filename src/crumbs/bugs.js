// The regulars. Each critter is built with real insect anatomy (head / thorax / abdomen, jointed legs, compound eyes,
'use strict';
// wing cases, membranous wings, fur) from the creature kit, perched on the bench behind the bar and leaning in to eat.
(function () {
const { V3, col, clamp } = MC, K = MC.creature, X = new V3(1, 0, 0);
const TH = 0.36; let CATCH;                                   // nose-down pitch of the body
const T0 = new V3(0, 0.52, -0.1);                  // thorax centre above the bench
function hat(HG, kind, hd) {
  const top = hd[1] * 0.78, w = hd[0];
  if (kind === 'cap') { const m = K.matte(0xa8322a, 0.85); const d = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, 6.283, 0, 1.5), m); d.scale.set(w * 1.02, hd[1] * 0.8, hd[2] * 1.05); d.position.set(0, top * 0.55, -0.01); d.castShadow = true; HG.add(d); K.ell(HG, m, 0, top * 0.62, hd[2] * 1.05, w * 0.72, 0.018, hd[2] * 0.6, { rx: 0.18 }); K.ell(HG, K.matte(0xf2e9d0), 0, top * 1.3, 0, 0.03); }
  else if (kind === 'beret') { const m = K.matte(0x23284a, 0.95); K.ell(HG, m, 0.04, top * 1.12, -0.02, w * 1.15, 0.055, hd[2] * 1.2, { rz: -0.22 }); K.ell(HG, m, 0.04, top * 1.12 + 0.07, -0.02, 0.022); }
  else if (kind === 'toque') { const m = K.matte(0xf4f2ea, 0.9); const c = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.78, w * 0.72, 0.2, 20), m); c.position.set(0, top + 0.08, -0.02); c.castShadow = true; HG.add(c); K.ell(HG, m, 0, top + 0.26, -0.02, w * 1.0, 0.13, w * 1.0); for (let i = 0; i < 7; i++) K.ell(HG, m, Math.cos(i * 0.9) * w * 0.62, top + 0.27, -0.02 + Math.sin(i * 0.9) * w * 0.62, w * 0.42, 0.11, w * 0.42); }
  else if (kind === 'helmet') { const m = K.chitin(0x55633a, { rough: 0.6, coat: 0.2 }); const d = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, 6.283, 0, 1.45), m); d.scale.set(w * 1.12, hd[1] * 0.95, hd[2] * 1.2); d.position.set(0, top * 0.42, 0); d.castShadow = true; HG.add(d); }
}
function antenna(HG, kind, len, hd, mat, sd) {
  const g = new THREE.Group(); g.position.set(sd * hd[0] * 0.42, hd[1] * 0.62, hd[2] * 0.55); HG.add(g);
  const a = new V3(0, 0, 0);
  if (kind === 'elbow') { const e = new V3(sd * len * 0.22, len * 0.42, len * 0.1); K.taper(g, a, e.clone().multiplyScalar(0.5), e, 0.02, 0.016, mat, 3); K.taper(g, e, new V3(sd * len * 0.5, len * 0.45, len * 0.5), new V3(sd * len * 0.55, len * 0.2, len * 0.95), 0.015, 0.008, mat, 7); }
  else if (kind === 'club') { const t = new V3(sd * len * 0.45, len * 0.55, len * 0.5); K.taper(g, a, new V3(sd * len * 0.1, len * 0.5, len * 0.15), t, 0.014, 0.012, mat, 5); K.ell(g, mat, t.x, t.y, t.z, 0.034, 0.05, 0.034); }
  else { const mid = new V3(sd * len * 0.25, len * 0.75, len * 0.25), t = new V3(sd * len * 0.55, len * 0.55, len * 0.95); K.taper(g, a, mid, t, 0.018, 0.004, mat, 12);
    if (kind === 'feather') for (let i = 1; i < 12; i++) { const k = i / 12, p = new V3().copy(a).multiplyScalar((1 - k) * (1 - k)).addScaledVector(mid, 2 * (1 - k) * k).addScaledVector(t, k * k), w = 0.11 * Math.sin(k * Math.PI) + 0.02; for (const s2 of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, w, 4), mat); b.position.set(p.x + s2 * w * 0.5, p.y, p.z); b.rotation.z = Math.PI / 2; g.add(b); } } }
  return g;
}
// Polyfork rigged body: the same customer API as the hand-built bugs (rise to the bar, look at you, chew, fidget)
const PFQ = new THREE.Quaternion(), PFQ2 = new THREE.Quaternion(), PFV = new V3(), UPY = new V3(0, 1, 0);
function makePF(sp, pf) {
  const s = sp.size || 1, root = new THREE.Group(), g = new THREE.Group(); root.add(g);
  const P = MC.pf.build(pf.kind, { len: (pf.len || 1.5) * s, colors: pf.colors, glow: sp.glow ? (pf.glow || ['lantern']) : null, mat: pf.mat });
  g.add(P.root); P.root.rotation.y = pf.ry || 0;
  const hb = P.headBox, hd = [Math.max(0.12, hb.x * 1.05), Math.max(0.1, hb.y), Math.max(0.1, hb.z)];
  const HG = new THREE.Group(); g.add(HG);
  if (sp.hat) hat(HG, sp.hat, hd);
  if (sp.scarf != null) { const t = new THREE.Mesh(new THREE.TorusGeometry(hd[0] * 1.15, 0.05, 8, 20), K.matte(sp.scarf, 1)); t.position.set(0, -hd[1] * 0.8, -hd[2] * 0.6); t.rotation.x = Math.PI / 2 - 0.3; t.castShadow = true; HG.add(t); }
  if (sp.monocle) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.011, 6, 20), MC.M.brass); t.position.set(hd[0] * 0.7, hd[1] * 0.2, hd[2] * 0.75); t.rotation.y = 0.5; HG.add(t); }
  let glowL = null; if (sp.glow) { glowL = new THREE.PointLight(col(0xcfff6a), 3, 3, 2); glowL.position.set(0, 0.35, -0.5 * (pf.len || 1.5) * s); g.add(glowL); }
  const C = P.clips, idle = MC.pf.pick(C, 'idle'), walk = MC.pf.pick(C, 'walk'), fly = MC.pf.pick(C, 'fly'), curl = MC.pf.pick(C, 'curl');
  const hbone = P.head, hx = new V3(), parentQ = new THREE.Quaternion(); let yaw = 0, pitch = 0;
  const bug = { root, g, head: HG, pf: P, t: Math.random() * 10, y: -2.4, targetY: 0, shake: 0, hop: 0, base: 0, mood: 'idle', buzz: 0 };
  bug.update = function (dt, lookAt) {
    bug.t += dt; const t = bug.t; bug.y += (bug.targetY - bug.y) * Math.min(1, dt * (bug.targetY < bug.y ? 12 : 6));
    if (bug.hop > 0) bug.hop -= dt; if (bug.shake > 0) bug.shake -= dt;
    root.position.y = bug.base + bug.y + (bug.hop > 0 && !fly ? Math.abs(Math.sin(bug.hop * 12)) * 0.2 : bug.hop > 0 ? Math.sin(Math.min(1, bug.hop * 2) * Math.PI) * 0.35 : 0);
    g.rotation.z = bug.shake > 0 ? Math.sin(bug.shake * 40) * 0.09 : 0;
    // what the body is doing: flying in, curled up when it is hiding, shuffling when impatient, else idle
    const hiding = bug.targetY < -1;
    const want = bug.hop > 0 && fly ? fly : hiding && curl ? curl : bug.mood === 'antsy' && walk && !fly ? walk : idle;
    const a = P.play(want, 0.3, want === walk ? 0.45 : bug.mood === 'eat' ? 1.6 : 1);
    P.mixer.update(dt);
    // head follows you (and nods while chewing), applied on top of the clip in world space
    let ty = 0, tp = 0;
    if (lookAt) { root.updateMatrixWorld(); const dx = lookAt.x - root.position.x, dz = lookAt.z - root.position.z; ty = clamp(Math.atan2(dx, dz) - root.rotation.y - g.rotation.y, -0.7, 0.7); tp = clamp((lookAt.y - root.position.y - 0.6) * 0.15, -0.3, 0.35); }
    if (bug.mood === 'eat') tp -= 0.12 + Math.sin(t * 12) * 0.1;
    yaw += (ty - yaw) * Math.min(1, dt * 4); pitch += (tp - pitch) * Math.min(1, dt * 4);
    if (hbone && hbone.parent) {
      hbone.parent.updateWorldMatrix(true, false); hbone.parent.getWorldQuaternion(parentQ);
      PFQ.setFromAxisAngle(UPY, yaw); PFV.set(1, 0, 0).applyQuaternion(g.getWorldQuaternion(PFQ2)); PFQ2.setFromAxisAngle(PFV, -pitch); PFQ.premultiply(PFQ2);
      hbone.quaternion.premultiply(parentQ).premultiply(PFQ).premultiply(parentQ.invert());
      hbone.updateMatrixWorld(true);
      // hats and props ride the head
      hx.copy(P.headLocal).applyMatrix4(hbone.matrixWorld); g.updateMatrixWorld(); HG.position.copy(g.worldToLocal(hx)); HG.rotation.set(-pitch * 0.8, yaw + (pf.ry || 0), 0);
    }
    if (glowL) { const k = 0.6 + 0.4 * Math.sin(t * 2.2); glowL.intensity = 4.5 * k; P.mat.userData.glow.value = 0.35 + 0.65 * k; }
  };
  root.position.y = bug.y; bug.update(0, null);
  return bug;
}
MC.makeBug = function (sp) {
  if (sp.pf && MC.pf && MC.pf.has(sp.pf.kind) && MC.opt.pfBugs !== false) return makePF(sp, sp.pf);
  K.init(); if (!CATCH) CATCH = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const s = sp.size || 1, root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(s);
  const bodyM = K.chitin(sp.body, sp.mat || {}), headM = sp.head == null ? bodyM : K.chitin(sp.head, sp.mat || {}), legM = K.chitin(sp.legs == null ? 0x17110d : sp.legs, { rough: 0.5, coat: 0.5 });
  const thx = sp.thx || [0.27, 0.24, 0.27], abd = sp.abd || [0.33, 0.29, 0.5], hd = sp.hd || [0.23, 0.2, 0.2];
  const bodyG = new THREE.Group(); bodyG.position.copy(T0); g.add(bodyG);
  const HG = new THREE.Group(), parts = { ant: [], legs: [], wings: [], mand: [] }; let abdomen = null, glowL = null, glowM = null;
  const toG = v => v.clone().applyAxisAngle(X, sp.kind === 'snail' ? 0 : TH).add(T0);
  const leg = (hipLocal, foot, o = {}) => {
    const hip = toG(hipLocal), f = foot.clone().divideScalar(s); let L1 = 0.36 * (sp.leg || 1) * (o.l || 1), L2 = 0.44 * (sp.leg || 1) * (o.l || 1); const dl = hip.distanceTo(f); if (dl > 0.92 * (L1 + L2)) { const k = dl / (0.9 * (L1 + L2)); L1 *= k; L2 *= k; }
    const sd = Math.sign(hipLocal.x) || 1, pole = o.pole || new V3(sd * 0.55, 1, 0), th = (sp.legThick || 1) * (o.th || 1);
    const pts = () => { const ank = f.clone(); ank.y += 0.035; return [hip, K.knee(hip, ank, L1, L2, pole), ank, new V3(f.x + sd * 0.02, f.y + 0.008, f.z + (o.toe == null ? 0.08 : o.toe))]; };
    const L = K.limb(g, pts(), [0.04 * th * (o.femur || 1), 0.03 * th, 0.019 * th, 0.01 * th], legM); L.foot = f; L.pts = pts; return L;
  };

  if (sp.kind === 'snail') {
    const skin = K.chitin(sp.body, { rough: 0.22, coat: 1, coatRough: 0.1 }); K.ell(g, skin, 0, 0.16, -0.05, 0.3, 0.16, 0.78, { z: true }); K.ell(g, skin, 0, 0.3, 0.52, 0.2, 0.2, 0.3);
    HG.position.set(0, 0.44, 0.72); g.add(HG); K.ell(HG, skin, 0, 0, 0, 0.17, 0.16, 0.19);
    for (const sd of [-1, 1]) { const st = new THREE.Group(); st.position.set(sd * 0.08, 0.1, 0.05); HG.add(st); const tip = new V3(sd * 0.1, 0.42, 0.12); K.taper(st, new V3(), new V3(sd * 0.02, 0.25, 0.02), tip, 0.03, 0.018, skin, 8); K.ell(st, K.eyeMat(0x0a0a0a, false), tip.x, tip.y + 0.02, tip.z, 0.042); parts.ant.push(st); K.taper(HG, new V3(sd * 0.07, -0.06, 0.15), new V3(sd * 0.09, -0.08, 0.26), new V3(sd * 0.11, -0.13, 0.33), 0.02, 0.012, skin, 4); }
    const sh1 = K.chitin(sp.shell, { rough: 0.3, coat: 1 }), sh2 = K.chitin(sp.shell2 || 0x5a3618, { rough: 0.3, coat: 1 });
    // planispiral shell: a tube that winds inward, with growth bands painted along it
    const pts = []; for (let i = 0; i <= 120; i++) { const a = i * 0.11 + 0.4, R = 0.36 * Math.exp(-0.105 * i * 0.11 * 1.0); pts.push(new V3(0.02 + i * 0.0009, 0.62 + Math.cos(a) * R, -0.22 + Math.sin(a) * R)); }
    const cv = new THREE.CatmullRomCurve3(pts), tg = new THREE.TubeGeometry(cv, 160, 1, 14), tp = tg.attributes.position, tc = new V3(); { const np = tg.attributes.normal; for (let k = 0; k < tp.count; k++) { const seg = Math.floor(k / 15), u = Math.min(1, seg / 160), c = cv.getPointAt(u), r = 0.2 * Math.exp(-1.45 * u) + 0.008; tc.set(np.getX(k), np.getY(k), np.getZ(k)); tp.setXYZ(k, c.x + tc.x * r * 1.25, c.y + tc.y * r, c.z + tc.z * r); } tg.computeVertexNormals(); }
    const shc = document.createElement('canvas'); shc.width = 512; shc.height = 32; const sg = shc.getContext('2d'); for (let x = 0; x < 512; x += 4) { const k = MC.noise.vnoise(x * 0.08, 0, 64, 3); sg.fillStyle = 'rgb(' + Math.round(150 + 60 * k) + ',' + Math.round(95 + 40 * k) + ',' + Math.round(45 + 20 * k) + ')'; sg.fillRect(x, 0, 4, 32); } for (let x = 0; x < 512; x += 37) { sg.fillStyle = 'rgba(60,30,10,0.75)'; sg.fillRect(x, 0, 9, 32); }
    const shM = K.chitin(0xffffff, { rough: 0.32, coat: 1 }); shM.map = K.canvasTex(shc); shM.map.wrapS = THREE.RepeatWrapping; shM.map.repeat.set(3, 1);
    const shell = new THREE.Mesh(tg, shM); shell.castShadow = true; shell.receiveShadow = true; g.add(shell); void sh1; void sh2;
  } else if (sp.kind === 'pillbug') {
    const w = [0.62, 0.86, 1, 1.02, 0.98, 0.84, 0.6, 0.36];
    for (let i = 0; i < w.length; i++) { const m = K.ell(bodyG, i % 2 ? bodyM : K.chitin(sp.body2 || sp.body, sp.mat || {}), 0, -0.02, 0.5 - i * 0.165, 0.42 * w[i], 0.3 * w[i], 0.125, { z: true }); if (i === 4) abdomen = m; }
    HG.position.set(0, -0.06, 0.63); HG.rotation.x = -TH * 0.6; bodyG.add(HG); K.ell(HG, headM, 0, 0, 0, 0.2, 0.15, 0.14);
    for (const sd of [-1, 1]) { K.ell(HG, K.eyeMat(0x050505), sd * 0.15, 0.03, 0.06, 0.045); parts.ant.push(antenna(HG, 'elbow', 0.3, [0.2, 0.15, 0.14], legM, sd)); }
    for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) { const z = 0.42 - i * 0.16, front = i === 0; parts.legs.push(leg(new V3(sd * 0.22, -0.2, z), front ? new V3(sd * 0.3, -0.35, 0.62) : new V3(sd * 0.5, 0, 0.3 - i * 0.15), { l: front ? 1 : 0.55, th: 0.6 })); }
  } else {
    // thorax / abdomen
    K.ell(bodyG, sp.thxCol == null ? bodyM : K.chitin(sp.thxCol, sp.mat || {}), 0, 0, 0, thx[0], thx[1], thx[2], { z: true });
    const az = -(thx[2] * 0.75 + abd[2] * 0.85), abdM = K.chitin(sp.abdCol == null ? sp.body : sp.abdCol, Object.assign({ map: sp.bands ? K.stripeTex(sp.bands[0], sp.bands[1], sp.bands[2], true) : null }, sp.mat || {}));
    abdomen = K.ell(bodyG, abdM, 0, sp.kind === 'spider' ? 0.06 : -0.02, az, abd[0], abd[1], abd[2], { z: true });
    if (sp.kind === 'ant') K.ell(bodyG, bodyM, 0, 0.02, -thx[2] * 0.95, 0.07, 0.1, 0.08);                      // petiole node
    if (sp.pronotum != null) K.ell(bodyG, K.chitin(sp.pronotum, { coat: 1, rough: 0.25 }), 0, 0.03, 0.02, thx[0] * 1.08, thx[1] * 1.05, thx[2] * 1.02, { z: true });
    if (sp.elytra) { const e = sp.elytra, m = K.chitin(e.color, { coat: 1, rough: e.rough == null ? 0.18 : e.rough, metal: e.metal || 0, map: e.spots ? K.dotsTex(e.base, e.dot, e.spots) : e.ridges ? K.stripeTex(e.ridges[0], e.ridges[1], 18, true) : null }); if (m.map) m.color = col(0xffffff);
      const el = K.ell(bodyG, m, 0, 0.035, az + 0.02, abd[0] * 1.1, abd[1] * 1.1, abd[2] * 1.05, { z: true }); el.rotation.z = Math.PI / 2; if (!m.map) K.ell(bodyG, K.matte(0x050505), 0, 0.04 + abd[1] * 1.1, az + 0.02, 0.006, 0.006, abd[2] * 0.98); }
    if (sp.cerci) for (const sd of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.42, 8), K.chitin(0x3a1a0a)); c.position.set(sd * 0.09, 0, az - abd[2] * 1.15); c.rotation.set(-Math.PI / 2, 0, sd * -0.22); c.castShadow = true; bodyG.add(c); }
    if (sp.glow) { glowM = new THREE.MeshBasicMaterial({ color: col(0xd6ff5a), fog: false }); K.ell(bodyG, glowM, 0, -0.07, az - abd[2] * 0.52, abd[0] * 0.8, abd[1] * 0.75, abd[2] * 0.42, { z: true, cast: false }); glowL = new THREE.PointLight(col(0xcfff6a), 3.5, 9, 2); glowL.position.set(0, -0.3, az - abd[2] * 0.6); bodyG.add(glowL); }
    // wings
    if (sp.wings === 'fly') for (const sd of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(sd * 0.1, thx[1] * 0.85, -0.05); bodyG.add(piv); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.0), new THREE.MeshStandardMaterial({ map: K.wingTex('fly'), transparent: true, side: THREE.DoubleSide, roughness: 0.15, metalness: 0.2, depthWrite: false })); w.geometry.translate(0, -0.5, 0); w.rotation.set(-Math.PI / 2 + 0.12, 0, 0); w.material.map.rotation = Math.PI / 2; w.material.map.center.set(0.5, 0.5); piv.add(w); piv.rotation.y = sd * 0.42; piv.rotation.z = sd * -0.12; parts.wings.push({ piv, sd, base: sd * 0.42 }); }
    if (sp.wings === 'moth') for (const sd of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(sd * 0.55, -0.2, sd * 0.78, -1.05); sh.quadraticCurveTo(sd * 0.3, -1.28, sd * -0.08, -1.12); sh.quadraticCurveTo(sd * -0.05, -0.5, 0, 0); const ge = new THREE.ShapeGeometry(sh, 10), uv = ge.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, Math.abs(uv.getX(i)) / 0.8 + 0.05, -uv.getY(i) / 1.3);
      const w = new THREE.Mesh(ge, new THREE.MeshStandardMaterial({ map: K.wingTex('moth', sp.wingTint), side: THREE.DoubleSide, roughness: 0.95 })); w.castShadow = true;
      const lift = new THREE.Group(); lift.position.set(sd * 0.06, thx[1] * 0.7, 0.06); lift.rotation.z = sd * 0.95; bodyG.add(lift);   // wings held up in a V, so they read from the front
      const piv = new THREE.Group(); piv.rotation.set(Math.PI / 2 - 0.25, 0, 0); lift.add(piv); w.rotation.y = 0; piv.add(w); parts.wings.push({ piv, w, lift, sd, moth: true }); }
    // head
    HG.position.set(0, sp.kind === 'spider' ? 0.02 : 0, thx[2] * (sp.kind === 'spider' ? 0.55 : 0.85) + hd[2] * 0.7); HG.rotation.x = -TH * 0.7; bodyG.add(HG);
    if (sp.kind !== 'spider') K.ell(HG, headM, 0, 0, 0, hd[0], hd[1], hd[2]);
    const er = sp.eye || 0.085, eyeM = K.eyeMat(sp.eyeCol == null ? 0x08080a : sp.eyeCol);
    if (sp.kind === 'spider') { const eM = K.eyeMat(0x050506, false); for (const sd of [-1, 1]) { K.ell(HG, eM, sd * 0.085, 0.07, thx[2] * 0.42, 0.075); K.ell(HG, CATCH, sd * 0.07, 0.11, thx[2] * 0.42 + 0.06, 0.016, 0.016, 0.01, { cast: false }); K.ell(HG, eM, sd * 0.21, 0.09, thx[2] * 0.3, 0.045); K.ell(HG, eM, sd * 0.16, 0.19, thx[2] * 0.1, 0.03); K.ell(HG, eM, sd * 0.2, 0.2, -0.06, 0.028);
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 8), K.chitin(0x2a1a12)); fang.position.set(sd * 0.07, -0.13, thx[2] * 0.42); fang.rotation.x = Math.PI + 0.25; fang.castShadow = true; HG.add(fang); parts.mand.push({ m: fang, sd, spider: true });
        K.limb(HG, [new V3(sd * 0.14, -0.06, thx[2] * 0.3), new V3(sd * 0.24, -0.02, thx[2] * 0.62), new V3(sd * 0.17, -0.16, thx[2] * 0.82)], [0.035, 0.03, 0.026], legM); } }
    else for (const sd of [-1, 1]) {
      K.ell(HG, eyeM, sd * hd[0] * 0.74, hd[1] * 0.22, hd[2] * 0.38, er, er * 1.15, er * 0.95);
      K.ell(HG, CATCH, sd * hd[0] * 0.74 - sd * er * 0.25, hd[1] * 0.22 + er * 0.5, hd[2] * 0.38 + er * 0.72, er * 0.2, er * 0.2, er * 0.12, { cast: false });   // catchlight
      const md = new THREE.Mesh(new THREE.ConeGeometry(0.028 * (sp.mand || 1), 0.13 * (sp.mand || 1), 6), legM); md.position.set(sd * 0.05, -hd[1] * 0.62, hd[2] * 0.78); md.rotation.set(Math.PI * 0.62, 0, sd * 0.35); md.castShadow = true; HG.add(md); parts.mand.push({ m: md, sd });
      K.taper(HG, new V3(sd * 0.09, -hd[1] * 0.55, hd[2] * 0.6), new V3(sd * 0.13, -hd[1] * 0.9, hd[2] * 0.85), new V3(sd * 0.1, -hd[1] * 1.15, hd[2] * 1.0), 0.012, 0.008, legM, 4);
      if (sp.ant) parts.ant.push(antenna(HG, sp.antKind || 'thread', sp.ant, hd, legM, sd));
    }
    if (sp.face != null) K.ell(HG, K.chitin(sp.face, { rough: 0.5 }), 0, -hd[1] * 0.15, hd[2] * 0.62, hd[0] * 0.55, hd[1] * 0.5, hd[2] * 0.45);
    if (sp.cheeks != null) for (const sd of [-1, 1]) K.ell(HG, K.chitin(sp.cheeks, { rough: 0.4 }), sd * hd[0] * 0.5, hd[1] * 0.45, hd[2] * 0.55, 0.06, 0.05, 0.03);
    // legs
    const hx = thx[0] * 0.72, hy = -thx[1] * 0.72;
    if (sp.kind === 'spider') { const fz = [0.62, 0.34, -0.1, -0.52], fx = [0.34, 0.72, 0.78, 0.6]; for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) parts.legs.push(leg(new V3(sd * hx, hy * 0.5, 0.16 - i * 0.1), new V3(sd * fx[i], i === 0 ? -0.35 : 0, fz[i]), { pole: new V3(sd * 0.4, 1, 0), l: 1.15, toe: i < 2 ? 0.06 : -0.04 })); }
    else for (const sd of [-1, 1]) {
      parts.legs.push(leg(new V3(sd * hx, hy, thx[2] * 0.55), new V3(sd * 0.3, -0.35, 0.62)));
      parts.legs.push(leg(new V3(sd * hx, hy, 0), new V3(sd * 0.6, 0, 0.14), { toe: 0.04 }));
      parts.legs.push(leg(new V3(sd * hx, hy, -thx[2] * 0.55), new V3(sd * (sp.jump ? 0.5 : 0.55), 0, sp.jump ? -0.5 : -0.62), sp.jump ? { pole: new V3(sd * 0.25, 1, -0.5), l: 1.9, femur: 2.1, toe: -0.07 } : { toe: -0.06 }));
    }
  }
  // fur
  if (sp.fur) g.traverse(o => { if (o.isMesh && o.geometry === K.SPHZ && o.parent === bodyG && !o.userData.noFur) K.fur(o, sp.fur); else if (o.isMesh && o.parent === HG && o.geometry === K.SPH && o.scale.x > 0.15 && sp.fur.head !== false) K.fur(o, Object.assign({}, sp.fur, { len: sp.fur.len * 0.7 })); });
  if (sp.hat) hat(HG, sp.hat, sp.kind === 'snail' ? [0.17, 0.16, 0.19] : sp.kind === 'spider' ? [thx[0] * 0.8, thx[1] * 0.9, thx[2] * 0.7] : sp.kind === 'pillbug' ? [0.2, 0.15, 0.14] : hd);
  if (sp.scarf != null) { const t = new THREE.Mesh(new THREE.TorusGeometry(thx[0] * 0.92, 0.06, 8, 20), K.matte(sp.scarf, 1)); t.position.set(0, 0.02, thx[2] * 0.7); t.castShadow = true; bodyG.add(t); K.ell(bodyG, K.matte(sp.scarf, 1), thx[0] * 0.5, -0.2, thx[2] * 0.8, 0.05, 0.2, 0.03, { rz: 0.3 }); }
  if (sp.monocle) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 6, 20), MC.M.brass); t.position.set(hd[0] * 0.74, hd[1] * 0.22, hd[2] * 0.5); t.rotation.y = 0.9; HG.add(t); }

  if (sp.kind === 'snail') g.rotation.y = 1.15;   // side-on, so the shell spiral reads; the head still turns to you
  const bug = { root, g, head: HG, t: Math.random() * 10, y: -2.4, targetY: 0, shake: 0, hop: 0, base: 0, mood: 'idle', buzz: 0 }, hx0 = HG.rotation.x;
  bug.update = function (dt, lookAt) {
    bug.t += dt; const t = bug.t; bug.y += (bug.targetY - bug.y) * Math.min(1, dt * (bug.targetY < bug.y ? 12 : 6));
    if (bug.hop > 0) bug.hop -= dt; if (bug.shake > 0) bug.shake -= dt;
    root.position.y = bug.base + bug.y + (bug.hop > 0 ? Math.abs(Math.sin(bug.hop * 12)) * 0.2 : 0);
    g.rotation.z = bug.shake > 0 ? Math.sin(bug.shake * 40) * 0.09 : 0; bodyG.position.y = T0.y + Math.sin(t * 1.9) * 0.012;
    if (abdomen) { const b = 1 + Math.sin(t * 2.6) * 0.035; abdomen.scale.x = abdomen.userData.sx || (abdomen.userData.sx = abdomen.scale.x); abdomen.scale.x *= b; }
    if (lookAt) { const dx = lookAt.x - root.position.x, dz = lookAt.z - root.position.z, a = Math.atan2(dx, dz); HG.rotation.y += (clamp(a, -0.75, 0.75) - HG.rotation.y) * Math.min(1, dt * 4); HG.rotation.x += ((hx0 + clamp(-(lookAt.y - (root.position.y + 0.5)) * 0.12, -0.3, 0.3) + (bug.mood === 'eat' ? 0.35 + Math.sin(t * 9) * 0.08 : 0)) - HG.rotation.x) * Math.min(1, dt * 5); }
    for (let i = 0; i < parts.ant.length; i++) { const a = parts.ant[i], sd = i % 2 ? 1 : -1; a.rotation.x = Math.sin(t * 2.3 + i) * 0.12 + (bug.mood === 'antsy' ? Math.sin(t * 9 + i) * 0.1 : 0); a.rotation.z = sd * Math.sin(t * 1.7 + i * 2) * 0.1; }
    const chew = bug.mood === 'eat' ? 14 : 2.2; for (const m of parts.mand) m.m.rotation.z = m.sd * ((m.spider ? 0.05 : 0.35) + Math.sin(t * chew) * (bug.mood === 'eat' ? 0.3 : 0.08));
    // front feet drum on the bar when patience runs low
    if (parts.legs.length > 1 && sp.kind !== 'pillbug') for (let i = 0; i < 2; i++) { const L = parts.legs[sp.kind === 'spider' ? i : i * 3], lift = bug.mood === 'antsy' ? Math.max(0, Math.sin(t * 8 + i * Math.PI)) * 0.07 : sp.kind === 'spider' && i === 0 ? 0.03 + Math.sin(t * 1.3) * 0.03 : 0; if (lift !== L.lift) { L.lift = lift; const y0 = L.foot.y; L.foot.y = y0 + lift; L.pose(L.pts()); L.foot.y = y0; } }
    bug.buzz -= dt; if (bug.buzz < -3 - (bug.t % 3)) bug.buzz = 0.45;
    for (const w of parts.wings) { if (w.moth) w.lift.rotation.z = w.sd * (0.95 + Math.sin(t * 0.9) * 0.07 + (bug.hop > 0 ? 0.45 : 0)); else w.piv.rotation.y = w.base + (bug.buzz > 0 || bug.hop > 0 ? w.sd * (0.5 + Math.sin(t * 90) * 0.5) : 0); }
    if (glowL) { const k = 0.6 + 0.4 * Math.sin(t * 2.2); glowL.intensity = 4.5 * k; glowM.color.setRGB(0.65 * k + 0.1, 1.0 * k + 0.12, 0.25 * k); }
  };
  root.position.y = bug.y;
  return bug;
};

MC.REGULARS = {
  bo:      { name: 'Big Rig Bo', kind: 'stag beetle trucker', spec: { kind: 'beetle', body: 0x1c1410, head: 0x1a120e, thx: [0.3, 0.26, 0.27], abd: [0.36, 0.3, 0.52], hd: [0.24, 0.19, 0.2], pronotum: 0x14301f, elytra: { color: 0x1d5a35, metal: 0.55, rough: 0.2, ridges: ['#1d5a35', '#0f3a20'] }, ant: 0.3, antKind: 'club', mand: 2.1, hat: 'cap', size: 1.08, legThick: 1.3 }, pat: 0.85, tip: 1.3, quirk: 'Tips big, but hates waiting.', likes: ['cheesetoast', 'toast', 'feast'], hi: 'Long haul tonight. Feed me.', back: 'The usual, chief.' },
  moth:    { name: 'Mothilda', kind: 'moth poet', spec: { kind: 'moth', body: 0xcbbfa6, head: 0xd6ccb4, eyeCol: 0x1a0f08, eye: 0.095, thx: [0.27, 0.25, 0.28], abd: [0.24, 0.22, 0.5], wings: 'moth', ant: 0.42, antKind: 'feather', fur: { len: 0.085, root: 0x7a6a52, tip: 0xf2e8d2, layers: 12, repeat: 5 }, hat: 'beret', scarf: 0x8b2f4a, legs: 0x6a5a48 }, pat: 1.1, tip: 1.0, quirk: 'Tips double if the kitchen is quiet when you serve her.', likes: ['char', 'soup', 'soupcrouton'], hi: 'A crumb, a flame, a quiet night…', back: 'Ah, my muse returns.' },
  joe:     { name: 'Slow Joe', kind: 'garden snail', spec: { kind: 'snail', body: 0xb9a878, shell: 0xa9743a, shell2: 0x5a3618, size: 0.95 }, pat: 2.4, tip: 1.0, quirk: 'Arrives very late and never hurries.', late: true, likes: ['soup', 'mashtoast', 'noodles'], hi: 'No… rush…', back: 'Took the scenic route. Again.' },
  antony:  { name: 'Sgt. Antony', kind: 'soldier ant', spec: { kind: 'ant', body: 0x6e2414, head: 0x7a2a16, abdCol: 0x2a0f0a, thx: [0.17, 0.17, 0.3], abd: [0.24, 0.22, 0.34], hd: [0.24, 0.2, 0.22], ant: 0.5, antKind: 'elbow', mand: 1.7, hat: 'helmet', leg: 1.15, size: 0.9 }, pat: 0.6, tip: 1.6, quirk: 'Always in a hurry. Pays well for speed.', likes: ['toast', 'roast', 'char'], hi: 'On the double!', back: 'Same drill. Move it!' },
  web:     { name: 'Webster', kind: 'jumping spider', spec: { kind: 'spider', body: 0x241e1a, thx: [0.3, 0.24, 0.3], abd: [0.3, 0.27, 0.38], fur: { len: 0.05, root: 0x15110e, tip: 0x8a7a66, layers: 10, repeat: 6, head: false }, legs: 0x1c1612, legThick: 1.5, size: 1.0 }, pat: 1.0, tip: 1.0, quirk: 'Tips extra for anything charred.', bonusKey: 'char', likes: ['char', 'cheesypeas'], hi: 'I like it… burnt.', back: 'You remember how I like it.' },
  dot:     { name: 'Dot', kind: 'ladybird', spec: { kind: 'ladybug', body: 0x0e0c0c, thx: [0.25, 0.2, 0.2], abd: [0.36, 0.33, 0.4], hd: [0.18, 0.15, 0.15], pronotum: 0x0c0a0a, cheeks: 0xf2efe6, elytra: { color: 0xc81e14, base: '#c81e14', dot: '#0a0808', spots: [[0.13, 0.3, 0.05], [0.3, 0.52, 0.06], [0.14, 0.72, 0.045], [0.4, 0.22, 0.04]] }, ant: 0.2, antKind: 'club', size: 0.95 }, pat: 1.0, tip: 1.15, quirk: 'Picky: every wrong item costs her patience.', picky: true, likes: ['cheeseplate', 'mashtoast', 'eggtoast'], hi: 'Exactly as written, please.', back: 'Precisely the same as last time.' },
  fidd:    { name: 'Fidd', kind: 'field cricket', spec: { kind: 'cricket', body: 0x4a3a1c, head: 0x3a2c14, abdCol: 0x5a4622, bands: ['#5a4622', '#2e2210', 9], thx: [0.24, 0.23, 0.26], abd: [0.24, 0.22, 0.56], hd: [0.22, 0.21, 0.19], ant: 0.95, jump: true, size: 0.95, eyeCol: 0x120c08 }, pat: 1.0, tip: 1.0, quirk: 'His soft chirping covers your noise.', chirp: true, likes: ['roast', 'toast', 'fondue'], hi: 'Mind if I play?', back: 'Encore!' },
  buzz:    { name: 'Buzz', kind: 'housefly', spec: { kind: 'fly', body: 0x23262b, head: 0x1c1e22, abdCol: 0x3a3d40, bands: ['#4a4d52', '#17181b', 6], eyeCol: 0x7a1410, eye: 0.15, thx: [0.24, 0.24, 0.26], abd: [0.25, 0.23, 0.36], hd: [0.2, 0.19, 0.16], wings: 'fly', ant: 0.1, antKind: 'club', fur: { len: 0.035, root: 0x0a0a0a, tip: 0x3a3a3a, layers: 6, repeat: 3, head: false }, size: 0.85 }, pat: 0.55, tip: 0.75, quirk: 'Impatient and cheap, but easy to please.', simple: true, likes: ['toast', 'roast'], hi: 'Quick quick quick!', back: 'Me again! Quick!' },
  rollo:   { name: 'Rollo', kind: 'pill bug', spec: { kind: 'pillbug', body: 0x4d555e, body2: 0x3d444c, head: 0x3a4048, mat: { rough: 0.45, coat: 0.6 }, size: 1.0 }, pat: 1.2, tip: 1.1, quirk: 'Shy: loud noise makes him lose patience fast.', shy: true, likes: ['soup', 'cheesetoast', 'mac'], hi: '…h-hello.', back: '…it is nice here.' },
  lumen:   { name: 'Lumen', kind: 'firefly', spec: { kind: 'firefly', body: 0x1a1612, head: 0x1a1612, pronotum: 0xb5482a, thx: [0.24, 0.2, 0.24], abd: [0.24, 0.2, 0.52], hd: [0.17, 0.15, 0.15], elytra: { color: 0x241c16, rough: 0.5 }, glow: true, ant: 0.38 }, pat: 1.0, tip: 1.2, quirk: 'Lights up the diner.', likes: ['cheesypeas', 'gratin', 'soupcrouton'], hi: 'Brought my own lamp.', back: 'Shining for my favorite cook.' },
  pinch:   { name: 'Pinch', kind: 'earwig', spec: { kind: 'earwig', body: 0x5a3216, head: 0x3a1c0c, abdCol: 0x6a3c1a, bands: ['#6a3c1a', '#2e1608', 8], thx: [0.2, 0.17, 0.26], abd: [0.2, 0.17, 0.62], hd: [0.19, 0.16, 0.19], cerci: true, ant: 0.6, monocle: true, size: 0.95 }, pat: 1.5, tip: 0.8, quirk: 'Patient, but a stingy tipper.', likes: ['cheeseplate', 'fondue', 'noodles'], hi: 'I shall be counting every crumb.', back: 'Do try to impress me this time.' },
  gregor:  { name: 'Chef Gregor', kind: 'cockroach critic', spec: { kind: 'roach', body: 0x4a2412, head: 0x2e160a, pronotum: 0x6a3418, thx: [0.3, 0.17, 0.26], abd: [0.34, 0.17, 0.6], hd: [0.2, 0.17, 0.17], elytra: { color: 0x5a2c14, rough: 0.25, ridges: ['#6a3418', '#3e1e0c'] }, ant: 1.1, hat: 'toque', size: 1.05, leg: 1.1 }, pat: 1.0, tip: 2.0, quirk: 'The critic. Only orders the VIP dish.', vipOnly: true, likes: [], hi: 'Surprise me. No — follow the ticket.', back: 'We meet again, little cook.' },
};
// which Polyfork body each regular wears (recoloured by zone where the species differs)
const PFMAP = {
  bo: { kind: 'beetle', len: 1.9, colors: { body: '#1d2a22', chestnut: '#3a2416' } },
  moth: { kind: 'butterfly', len: 1.7, colors: { wing: '#cbbfa6', black: '#6a5a48', spots: '#efe4cc', abdomen: '#a89878', bands: '#7a6a52', club: '#8a7a62' } },
  joe: { kind: 'snail', len: 1.6, colors: { body: '#b9a878', sole: '#8a7a58', shell: '#a9743a', band: '#e6d2a6' } },
  antony: { kind: 'ant', len: 1.6 },
  web: { kind: 'tarantula', len: 1.7, colors: { body: '#241e1a', abdomen: '#2a221c', band: '#8a7a66', tips: '#15110e' } },
  dot: { kind: 'ladybird', len: 1.35 },
  fidd: { kind: 'hopper', len: 1.8, colors: { body: '#4a3a1c', wing: '#2e2210', stripe: '#6a5630', marks: '#2a1e0c', eyes: '#120c08' } },
  buzz: { kind: 'wasp', len: 1.35, colors: { black: '#23262b', yellow: '#5a5d62', tarsi: '#2a2a2c', brown: '#3a3d40', eyes: '#7a1410', membrane: '#9a9da0' } },
  rollo: { kind: 'woodlouse', len: 1.5, colors: { shell: '#4d555e', rim: '#8a8e94', under: '#3d444c' } },
  lumen: { kind: 'firefly', len: 1.6, glow: ['lantern'] },
  gregor: { kind: 'firefly', len: 1.9, colors: { shield: '#7a4020', crest: '#3e1e0c', elytra: '#5a2c14', trim: '#8a5228', head: '#2e160a', body: '#4a2412', lantern: '#6a3418' } },
};
for (const k in PFMAP) if (MC.REGULARS[k]) MC.REGULARS[k].spec.pf = PFMAP[k];
})();
