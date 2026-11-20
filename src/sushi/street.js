// what stands lit and what moves on the corner, as in THE MARKET (src/150pb-traffic.js): its lamps' glow where the market has lamps (corner.js lights), Polyfork's cars both ways along Market St (data/sushi/cars.json), every one on the road, and the kei vans, a fifth their size, roaming the pavement by the kerb
import * as THREE from 'three';
import { G, mat, clamp } from './ctx.js';
import * as T from './tex.js';
import { cars } from './models.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { KERB, FKERB, ROAD, KEI } from './plan.js';

export function buildStreet(X) {
  const { city, addHalo, corner, ups } = X, R = X.R, S = { cars: [], lampAt: [], kei: [] };
  // ---- the lamps: the nearest first (alley.js gives the first three a light of their own)
  const lamps = corner.lights.filter((l) => l.p[1] > 2.2 && l.p[1] < 12 && Math.hypot(l.p[0], l.p[2]) < 90).sort((a, b) => Math.hypot(a.p[0], a.p[2] + 4) - Math.hypot(b.p[0], b.p[2] + 4));
  for (const l of lamps) { S.lampAt.push([l.p[0], l.p[1], l.p[2]]); addHalo(l.p[0], l.p[1], l.p[2], 3.2, new THREE.Color().setRGB(l.c[0], l.c[1] * 0.86, l.c[2] * 0.6).getHex()); }
  // ---- the cars
  const PAINT = [0x6a1c1c, 0x1c2f52, 0x8a7a5a, 0x1e1e22, 0x56665a, 0xb8b4a8, 0x5c3418, 0x1c4236, 0x8a8e92, 0x471a28, 0x9a7a2a], KPAINT = [0xefe6cf, 0xd8a032, 0x7b8a3a, 0xc4612a, 0x8db4d4, 0xa63a2e];   // (the kei vans' 1980s paints are the market's)
  const glassM = mat({ color: 0x0c1218, envMap: T.env(), reflectivity: 0.3, combine: THREE.MixOperation }), headM = new THREE.MeshBasicMaterial({ color: 0xfff0c8 }), tailM = new THREE.MeshBasicMaterial({ color: 0xc81c10 }), beamM = new THREE.MeshBasicMaterial({ map: T.glowTex(), color: 0xfff0c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const lampsOf = []; G.passing = [];
  const faces = (g) => { g = g.toNonIndexed(); g.computeVertexNormals(); return g; };
  const painted = (P, paint) => { const gs = [], pc = new THREE.Color(paint ?? P.own ?? 0xffffff); for (const n of ['body', 'paint']) { if (!P[n]) continue; const g = P[n].toNonIndexed(); if (n === 'paint') { const c = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < c.length; i += 3) c.set([pc.r, pc.g, pc.b], i); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); } gs.push(g); } const g = mergeGeometries(gs); g.computeVertexNormals(); return g; };   // the body and its coachwork one mesh: the coachwork's points take the coat (null: Polyfork's own)
  cars().then((Ps) => {
    const bodyM = mat({ vertexColors: true, envMap: T.env(), reflectivity: 0.13, combine: THREE.MixOperation });
    const mkCar = (k, paint, beam = true) => { const P = Ps[k], c = new THREE.Group(), bx = new THREE.Box3().setFromBufferAttribute(P.body.attributes.position), hl = bx.max.x, hw = bx.max.z;
      const bm = new THREE.Mesh(painted(P, paint), bodyM); bm.castShadow = false; c.add(bm); if (P.glass) c.add(new THREE.Mesh(faces(P.glass), glassM));
      const L = new THREE.Group(); c.add(L); for (const z of [-hw * 0.66, hw * 0.66]) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.26), headM); a.position.set(hl + 0.01, 0.62, z); L.add(a); const t = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.3), tailM); t.position.set(-hl - 0.01, 0.7, z); L.add(t); }
      if (beam) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.4), beamM); pl.rotation.x = -Math.PI / 2; pl.position.set(hl + 3.6, 0.02, 0); L.add(pl); } L.visible = false; lampsOf.push(L);
      c.traverse((o) => { o.userData.nopick = true; o.userData.keep = true; }); city.add(c); return c; };
    // Market St, both ways: eastbound on the park's side, westbound on the shops'; each lane a loop far longer than what is seen, its cars a steady way apart
    const MID = (KERB + FKERB) / 2, SPAN = 150, LANES = [{ dir: 1, z: (KERB + MID) / 2, y: ROAD, v: 7.5, list: [['cab'], ['sedan', PAINT[3]], ['wagon', PAINT[6]]] }, { dir: -1, z: (FKERB + MID) / 2, y: ROAD, v: 7.5, list: [['hatch', PAINT[8]], ['cab'], ['towncar']] }];
    for (const L of LANES) L.list.forEach(([k, paint], i) => { const c = mkCar(k, paint); c.rotation.y = L.dir > 0 ? 0 : Math.PI; c.position.set(L.dir * (-SPAN + (i + 0.3 + R() * 0.4) * (2 * SPAN / L.list.length)), L.y, L.z); c.userData.L = L; c.userData.v = L.v * (0.9 + R() * 0.2); G.passing.push(c); S.cars.push({ c }); });
    // the kei vans: three, toy-sized, each its own paint and pace, up and down the pavement by the kerb, turning round at the ends of their stretch, stopping a while now and then
    KPAINT.slice(0, 3).forEach((paint, i) => { const c = mkCar('kei', KPAINT[(i * 2 + 1) % KPAINT.length], false); c.scale.setScalar(0.2); c.position.set(KEI.x0 + (i + 0.5) * (KEI.x1 - KEI.x0) / 3, 0, KEI.z0 + (i % 2) * (KEI.z1 - KEI.z0)); c.userData = { ...c.userData, kei: 1, dir: i % 2 ? 1 : -1, v: [1.3, 2.2, 3.4][i], stop: 2 + i * 5, z: c.position.z, keep: true, nopick: true }; S.kei.push(c); });
    ups.push((dt) => { const lit = X.api ? X.api() : 0;
      const walkers = G.block ? G.block.people.filter((h) => !h.hidden && h.p.root.visible && h.p.root.position.z < KERB && h.p.root.position.z > FKERB).map((h) => h.p.root.position) : [];   // whoever is crossing: the cars wait for them
      for (const { c } of S.cars) { const u = c.userData, L = u.L, held = walkers.some((w) => Math.abs(w.z - L.z) < 3.4 && (w.x - c.position.x) * L.dir > 1.5 && (w.x - c.position.x) * L.dir < 11); u.s = (u.s ?? u.v) + clamp((held ? 0 : u.v) - (u.s ?? u.v), -dt * 9, dt * 3.5); c.position.x += L.dir * u.s * dt; if (L.dir * c.position.x > SPAN) c.position.x -= L.dir * 2 * SPAN; c.visible = Math.abs(c.position.x) < 120; }
      for (const c of S.kei) { const u = c.userData; if (u.stop > 0) { u.stop -= dt; continue; } c.position.x += u.dir * u.v * dt; c.rotation.y = u.dir > 0 ? 0 : Math.PI;
        if ((u.dir > 0 && c.position.x > KEI.x1) || (u.dir < 0 && c.position.x < KEI.x0)) { u.dir = -u.dir; u.stop = 1 + Math.random() * 6; u.z = KEI.z0 + Math.random() * (KEI.z1 - KEI.z0); } else if (Math.random() < dt * 0.03) u.stop = 2 + Math.random() * 5;
        c.position.z += clamp(u.z - c.position.z, -dt * 0.5, dt * 0.5); }
      for (const L of lampsOf) L.visible = lit > 0.25; beamM.opacity = 0.22 * lit; headM.color.setHex(0xfff0c8).multiplyScalar(0.4 + 1.6 * lit); tailM.color.setHex(0xc81c10).multiplyScalar(0.4 + 1.2 * lit); });
  }).catch((e) => console.warn('the cars did not load', e));
  return S;
}
