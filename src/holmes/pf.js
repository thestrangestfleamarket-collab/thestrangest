// THE SPECKLED BAND's Polyfork things (data/holmes/stage.json, from tools/holmes-bake.cjs): a prop by name; a person: Polyfork's body on its 15 bones, its recorded motion crossfaded, a head that turns to what it looks at, and eyes that move and blink.
import * as T from 'three';
import STAGE from '../../data/holmes/stage.json';

const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)), i16 = s => new Int16Array(b64(s).buffer), u16 = s => new Uint16Array(b64(s).buffer);
const lin = (C, n) => { const out = new Float32Array(n), c = new T.Color(); for (let i = 0; i < n; i += 3) { c.setRGB(C[i] / 255, C[i + 1] / 255, C[i + 2] / 255, T.SRGBColorSpace); out[i] = c.r; out[i + 1] = c.g; out[i + 2] = c.b; } return out; };
const MAT = new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .82, metalness: 0 }), GEO = {};
function propGeo(name) { if (GEO[name]) return GEO[name]; const D = STAGE.props[name]; if (!D) throw new Error('no prop ' + name); const q = i16(D.p), P = new Float32Array(q.length), b = D.b;
  for (let i = 0; i < q.length; i++) { const a = i % 3; P[i] = b[a] + (q[i] + 32768) / 65535 * (b[a + 3] - b[a]); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('color', new T.BufferAttribute(lin(b64(D.c), q.length), 3)); g.computeVertexNormals(); g.computeBoundingBox(); return GEO[name] = g; }
// a prop standing on the ground at x,z (its own middle), turned ry, scaled s; o.h a height to stand it at, o.fit a height to scale it to
function prop(g, name, x, z, ry = 0, s = 1, o = {}) { const geo = propGeo(name), bb = geo.boundingBox, m = new T.Mesh(geo, o.mat || MAT), k = new T.Group(); if (o.fit) s = o.fit / (bb.max.y - bb.min.y);
  m.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); m.castShadow = o.cast !== false; m.receiveShadow = true; k.add(m); k.scale.setScalar(s); k.position.set(x, o.h || 0, z); k.rotation.y = ry; k.userData.size = [(bb.max.x - bb.min.x) * s, (bb.max.y - bb.min.y) * s, (bb.max.z - bb.min.z) * s]; g.add(k); return k; }

const BONES = STAGE.bones, NB = BONES.length, PARENT = { torso: 'hips', head: 'torso', upperArmL: 'torso', upperArmR: 'torso', forearmL: 'upperArmL', forearmR: 'upperArmR', handL: 'forearmL', handR: 'forearmR', thighL: 'hips', thighR: 'hips', shinL: 'thighL', shinR: 'thighR', shoeL: 'shinL', shoeR: 'shinR' };
const PI = BONES.map(n => PARENT[n] ? BONES.indexOf(PARENT[n]) : -1), HEAD = BONES.indexOf('head'), TORSO = BONES.indexOf('torso');
const CL = {}; for (const s of ['m', 'f']) { CL[s] = {}; for (const [n, c] of Object.entries(STAGE.clips[s])) CL[s][n] = { ...c, Q: Float32Array.from(c.q), P: Float32Array.from(c.p) }; }
const qa = new T.Quaternion(), qb = new T.Quaternion(), va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3(), e1 = new T.Euler(), m1 = new T.Matrix4();
// bone i of clip c at time t: its turn from rest into q; the hips' shift into p
const sample = (c, t, loop, i, q, p) => { const f = loop ? ((t / c.dur % 1) + 1) % 1 * c.n : Math.max(0, Math.min(c.n - 1.001, t / c.dur * c.n)), a = Math.floor(f) % c.n, b = loop ? (a + 1) % c.n : Math.min(c.n - 1, a + 1), x = f - Math.floor(f), A = (a * NB + i) * 4, B = (b * NB + i) * 4;
  q.set(c.Q[A], c.Q[A + 1], c.Q[A + 2], c.Q[A + 3]); qb.set(c.Q[B], c.Q[B + 1], c.Q[B + 2], c.Q[B + 3]); q.slerp(qb, x);
  if (p) { const C = (a * NB + i) * 3, D = (b * NB + i) * 3; p.set(c.P[C], c.P[C + 1], c.P[C + 2]); vb.set(c.P[D], c.P[D + 1], c.P[D + 2]); p.lerp(vb, x); } };

const ER = .015, EYE = { white: new T.MeshStandardMaterial({ color: 0xf2efe6, roughness: .25 }), pupil: new T.MeshBasicMaterial({ color: 0x0a0806 }), glint: new T.MeshBasicMaterial({ color: 0xffffff }) };
function eyeball(iris) { const g = new T.Group(), R = ER; const w = new T.Mesh(new T.SphereGeometry(R, 14, 10), EYE.white); g.add(w);
  const ir = new T.Mesh(new T.CircleGeometry(R * .56, 16), new T.MeshStandardMaterial({ color: iris, roughness: .3 })); ir.position.z = R * .86; g.add(ir); const pu = new T.Mesh(new T.CircleGeometry(R * .27, 12), EYE.pupil); pu.position.z = R * .875; g.add(pu);
  const gl = new T.Mesh(new T.CircleGeometry(R * .1, 8), EYE.glint); gl.position.set(R * .22, R * .25, R * .9); g.add(gl); return g; }

// a person. look: {eyes:[x,y,z] the right eye in the body's own space at rest (the left mirrored), iris, skin, lid}; sex picks the clips
function person(key, o = {}) { const b = STAGE.bodies[key]; if (!b) throw new Error('no body ' + key); const sex = o.sex || 'm', clips = CL[sex], SK = STAGE.skel[sex], ks = b.hipY / SK.hipY;
  const Q = i16(b.pos), n = Q.length / 3, P = new Float32Array(Q.length); for (let i = 0; i < Q.length; i++) P[i] = (Q[i] + 32500) * b.sc + b.lo[i % 3];
  const BN = b64(b.bone), BW = b64(b.w), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4); for (let v = 0; v < n; v++) { si[v * 4] = BN[v * 2]; si[v * 4 + 1] = BN[v * 2 + 1]; sw[v * 4] = BW[v] / 255; sw[v * 4 + 1] = 1 - BW[v] / 255; }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(P, 3)); geo.setAttribute('color', new T.BufferAttribute(lin(b64(b.vcol), Q.length), 3)); geo.setAttribute('skinIndex', new T.BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new T.BufferAttribute(sw, 4)); geo.setIndex(new T.BufferAttribute(u16(b.tri), 1)); geo.computeVertexNormals();
  const g = new T.Group(), O = b.origin.map(v => new T.Vector3(...v)), bones = BONES.map(() => new T.Bone()), mesh = new T.SkinnedMesh(geo, MAT); bones.forEach((bn, i) => { bn.position.copy(O[i]); g.add(bn); });
  mesh.bind(new T.Skeleton(bones, O.map(v => new T.Matrix4().makeTranslation(-v.x, -v.y, -v.z))), new T.Matrix4()); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; g.add(mesh);
  const s = o.scale || 1; g.scale.setScalar(s);
  // a clip turns each bone's own frame (rest) to where it points; from the body as modelled that is the clip's turn after undoing the frame's
  const RI = b.rest.map(r => new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(r[0], r[1], r[2]), new T.Vector3(r[3], r[4], r[5]), new T.Vector3(r[6], r[7], r[8]))).invert());
  // the face: the nose is the head's foremost point; the eyes sit above it, either side, on the face's plane
  let face = null; { let zm = -9, ny = 0; const hv = []; for (let v = 0; v < n; v++) if (BN[v * 2] === HEAD && BW[v] > 200) { hv.push(v); if (Math.abs(P[v * 3]) < .03 && P[v * 3 + 1] < O[HEAD].y + .2 && P[v * 3 + 2] > zm) { zm = P[v * 3 + 2]; ny = P[v * 3 + 1]; } }
    const zs = hv.filter(v => Math.abs(P[v * 3]) > .025 && Math.abs(P[v * 3]) < .07 && Math.abs(P[v * 3 + 1] - ny - .04) < .05).map(v => P[v * 3 + 2]).sort((a, c) => c - a); if (zs.length) face = [.036, ny + .042, zs[0] - .006]; }
  let eyes = null; if (o.eyes !== false && (o.eyes || face)) { const [ex, ey, ez] = o.eyes || face; eyes = [-1, 1].map(sx => { const e = eyeball(o.iris || 0x4a3a2a); e.position.set(sx * ex - O[HEAD].x, ey - O[HEAD].y, ez - O[HEAD].z); bones[HEAD].add(e);
      const lid = new T.Mesh(new T.SphereGeometry(ER * 1.09, 12, 8, 0, Math.PI * 2, 0, Math.PI * .5), new T.MeshStandardMaterial({ color: o.skin || 0xd9a98a, roughness: .7 })); lid.rotation.x = -1.5; e.userData.lid = lid; e.parent.add(lid); lid.position.copy(e.position); return e; }); }
  const st = { cur: { c: clips.Idle, t: Math.random() * 5, loop: true }, prev: null, fade: 0, yaw: 0, pitch: 0, ey: 0, ep: 0, blink: 1 + Math.random() * 3, lid: 0, sac: 0, sx: 0, sy: 0, speak: 0 };
  const J = BONES.map(() => new T.Vector3()), R = BONES.map(() => new T.Quaternion()), hp = new T.Vector3(), hq = new T.Vector3(), tgt = new T.Vector3(), inv = new T.Matrix4(), OC = new T.Vector3(0, SK.hipY, 0);
  const api = { g, key, height: b.height * s, clips: Object.keys(clips), head: new T.Vector3(),
    play(name, loop = true, fade = .35) { const c = clips[name]; if (!c || st.cur.c === c) return; st.prev = st.cur; st.cur = { c, t: 0, loop }; st.fade = fade; st.fade0 = fade; },
    clip: () => Object.keys(clips).find(k => clips[k] === st.cur.c), speaking(v) { st.speak = v ? 1 : 0; },
    // dt on; target: a point in the world to look at, or null to look ahead
    update(dt, target) { st.cur.t += dt; if (st.prev) { st.prev.t += dt; st.fade -= dt; if (st.fade <= 0) st.prev = null; } const w = st.prev ? 1 - st.fade / st.fade0 : 1;
      for (let i = 0; i < NB; i++) { sample(st.cur.c, st.cur.t, st.cur.loop, i, R[i], i ? null : hp); if (st.prev) { sample(st.prev.c, st.prev.t, st.prev.loop, i, qa, i ? null : hq); qa.slerp(R[i], w); R[i].copy(qa); if (!i) hp.lerpVectors(hq, hp, w); } R[i].multiply(RI[i]); }
      // where to look: yaw and pitch in the body's own space, held within what a neck does
      let ty = 0, tp = 0; if (target) { g.updateWorldMatrix(true, false); inv.copy(g.matrixWorld).invert(); tgt.copy(target).applyMatrix4(inv).sub(va.copy(O[HEAD]).setY(O[HEAD].y + .12)); ty = Math.atan2(tgt.x, tgt.z); tp = Math.atan2(tgt.y, Math.hypot(tgt.x, tgt.z)); }
      const hy = Math.max(-1.1, Math.min(1.1, ty)), hpi = Math.max(-.45, Math.min(.5, tp)), k = Math.min(1, dt * 3.2); st.yaw += (hy * .72 - st.yaw) * k; st.pitch += (hpi * .7 - st.pitch) * k;
      const nod = st.speak ? Math.sin(st.cur.t * 5.1) * .03 + Math.sin(st.cur.t * 2.3) * .025 : 0;
      R[TORSO].premultiply(qa.setFromEuler(e1.set(0, st.yaw * .22, 0))); R[HEAD].premultiply(qa.setFromEuler(e1.set(-st.pitch + nod, st.yaw, 0, 'YXZ')));
      J[0].copy(hp).multiplyScalar(ks).add(O[0]);
      for (let i = 1; i < NB; i++) { const p = PI[i]; J[i].copy(O[i]).sub(O[p]).applyQuaternion(R[p]).add(J[p]); }
      for (let i = 0; i < NB; i++) { bones[i].position.copy(J[i]); bones[i].quaternion.copy(R[i]); }
      api.head.copy(J[HEAD]).setY(J[HEAD].y + .13).multiplyScalar(s).applyQuaternion(g.quaternion).add(g.position);
      if (eyes) { // the eyes go the rest of the way to the target, dart a little, and blink
        st.sac -= dt; if (st.sac <= 0) { st.sac = .4 + Math.random() * 1.8; st.sx = (Math.random() - .5) * .09; st.sy = (Math.random() - .5) * .05; }
        const ey = Math.max(-.5, Math.min(.5, ty - st.yaw)) + st.sx, ep = Math.max(-.35, Math.min(.35, tp - st.pitch)) + st.sy, ke = Math.min(1, dt * 14); st.ey += (ey - st.ey) * ke; st.ep += (ep - st.ep) * ke;
        st.blink -= dt; if (st.blink <= 0) st.blink = 2 + Math.random() * 4; const shut = st.blink < .13 ? 1 - Math.abs(st.blink - .065) / .065 : 0; st.lid += (shut - st.lid) * Math.min(1, dt * 40);
        for (const e of eyes) { e.rotation.set(-st.ep, st.ey, 0, 'YXZ'); e.userData.lid.rotation.x = -1.5 + st.lid * 1.45 + Math.max(0, -st.ep) * .5; } } } };
  api.update(0, null); return api; }

export { prop, propGeo, person, STAGE, MAT };
