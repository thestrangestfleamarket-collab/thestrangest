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
  // ---- the skyline, all the way round (owner, 20 Nov 2026: "add fake skyline 360 around entire scene"): the city's mass in the haze beyond the street, higher to the south where the Twin Towers stand; by night its floors are lit. A painted band, the only thing here that is not the market's
  { const Rr = 300, Hh = 130, N = 4096, HPX = 512, sk = (lights) => T.canvasTex(N, HPX, (gOut, w, h) => { const cs = document.createElement('canvas'); cs.width = w; cs.height = h; const g = cs.getContext('2d'); const RR = T.rng(1985), pxm = w / (2 * Math.PI * Rr), py = h / Hh, az = (a) => (a / 360) * w;
      const tower = (a, wm, hm, top) => { const x = az(a) - wm * pxm / 2, y = h - hm * py, ww = wm * pxm; if (!lights) { g.fillStyle = '#fff'; g.fillRect(x, y, ww, hm * py); if (top === 'spire') { g.beginPath(); g.moveTo(x + ww * 0.2, y); g.lineTo(x + ww / 2, y - 16 * py); g.lineTo(x + ww * 0.8, y); g.fill(); } if (top === 'mast') g.fillRect(x + ww / 2 - 1, y - 22 * py, 2.5, 22 * py); } else { for (let yy = y + 4; yy < h - 4; yy += 5) for (let xx = x + 1; xx < x + ww - 2; xx += 4) if (RR() < (top === 'twin' ? 0.22 : 0.07)) { g.fillStyle = RR() < 0.8 ? '#e8b878' : '#a8bcd8'; g.fillRect(xx, yy, 2, 2.5); } } };
      for (let a = 0; a < 360; a += 0.5 + RR() * 1.3) tower(a, 9 + RR() * 22, 26 + RR() * 26 + 34 * Math.exp(-(((a - 181) / 22) ** 2)) * RR(), RR() < 0.06 ? 'spire' : null);   // the mass of the city, higher toward downtown
      for (const [a, wm, hm, top] of [[168, 14, 62, 'spire'], [172.5, 16, 70, null], [189, 15, 66, 'spire'], [193, 18, 58, null], [40, 15, 72, 'spire'], [310, 16, 64, null]]) tower(a, wm, hm, top);
      tower(178.4, 13, 112, 'mast'); tower(182.6, 13, 111, 'twin');   // One and Two World Trade Center, the north tower's mast
      const k = lights ? 1.5 : 3, sm = document.createElement('canvas'); sm.width = Math.round(w / k); sm.height = Math.round(h / k); sm.getContext('2d').drawImage(cs, 0, 0, sm.width, sm.height); gOut.clearRect(0, 0, w, h); gOut.imageSmoothingEnabled = true; gOut.drawImage(sm, 0, 0, w, h); });   // (far things are soft: drawn small and laid back large, one pass)
    const g2 = new THREE.CylinderGeometry(Rr, Rr, Hh, 48, 1, true), bm = new THREE.MeshBasicMaterial({ map: sk(false), transparent: true, alphaTest: 0.03, depthWrite: false, side: THREE.BackSide, fog: false }), lm = new THREE.MeshBasicMaterial({ map: sk(true), transparent: true, side: THREE.BackSide, fog: false, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const band = new THREE.Mesh(g2, bm), lights = new THREE.Mesh(g2, lm); for (const m of [band, lights]) { m.position.set(0, Hh / 2 - 3, 0); m.userData.nopick = true; m.userData.keep = true; m.castShadow = m.receiveShadow = false; m.renderOrder = -5; city.add(m); } lights.renderOrder = -4; lights.scale.setScalar(0.998);
    // the air over that distance: a veil of the haze's own colour before the band, thick at the ground and thinning upward, thicker in mist and rain
    const vm = new THREE.MeshBasicMaterial({ map: T.canvasTex(4, 128, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.28, 'rgba(255,255,255,0.78)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, side: THREE.BackSide, fog: false });
    const veil = new THREE.Mesh(g2, vm); veil.position.copy(band.position); veil.scale.setScalar(0.996); veil.renderOrder = -3; veil.userData.nopick = true; veil.userData.keep = true; city.add(veil);
    const tone = new THREE.Color(), BLD = new THREE.Color(0x5a626e);
    S.paint = ({ day, fogC, lit }) => { tone.copy(BLD).multiplyScalar(0.25 + 0.75 * day).multiplyScalar(0.55).lerp(fogC, 0.3 + 0.3 * day); bm.color.copy(tone); vm.color.copy(fogC); vm.opacity = Math.min(1, 0.62 + 0.3 * (G.rainK || 0)); lm.opacity = lit * 0.45; }; }
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
