// wind and what it moves, rain's splashes and drips, moths, a steaming manhole, the elevated train, the street's sounds
import * as THREE from 'three';
import { G, V3, mat, box, cyl, mesh, clamp } from './ctx.js';
import * as T from './tex.js';

export function buildLife(scene, city, cart) {
  const root = new THREE.Group(); scene.add(root);
  const env = { wind: 0.3, car: 0, carPan: 0, train: 0 };
  const ups = [];
  const nop = (o) => { o.userData.nopick = true; return o; };

  // ---- wind: slow swell + occasional gusts
  let gust = 0, gustT = 6;
  const pend = (n) => Array.from({ length: n }, () => ({ a: 0, v: 0, b: 0, w: 0 }));
  const lp = pend(cart.lanterns.length), bp = pend(cart.bulbs.length);
  const swing = (st, pv, dt, len, drive, t, i) => { // damped pendulum driven by wind (two axes)
    const k = 9.8 / len;
    st.v += (-k * st.a - 0.9 * st.v + drive * (0.6 + 0.4 * Math.sin(t * 1.3 + i * 2.1))) * dt; st.a += st.v * dt;
    st.w += (-k * st.b - 0.9 * st.w + drive * 0.5 * Math.sin(t * 0.9 + i * 4.2)) * dt; st.b += st.w * dt;
    pv.rotation.z = st.a; pv.rotation.x = st.b;
  };
  ups.push((dt, t) => {
    gustT -= dt; if (gustT <= 0) { gust = 0.5 + Math.random() * 0.6; gustT = 7 + Math.random() * 14; }
    gust = Math.max(0, gust - dt * 0.22);
    env.wind = clamp(0.28 + 0.14 * Math.sin(t * 0.21) + 0.1 * Math.sin(t * 0.67 + 1) + gust, 0, 1.3);
    cart.lanterns.forEach((pv, i) => swing(lp[i], pv, dt, 0.42, env.wind * 1.5, t, i));
    cart.bulbs.forEach((pv, i) => swing(bp[i], pv, dt, 0.26, env.wind * 0.35, t, i + 3));
    for (const n of cart.noren) { // cloth: pinned along the top edge, rippling more toward the hem
      const p = n.mesh.geometry.attributes.position, b = n.base;
      for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], f = Math.pow((0.25 - y) / 0.5, 1.6); p.setZ(i, (Math.sin(t * 2.3 + x * 5 + n.ph) * 0.03 + Math.sin(t * 3.7 + x * 9 + y * 6 + n.ph) * 0.012 + 0.07) * f * env.wind * 1.6); }
      p.needsUpdate = true; n.mesh.geometry.computeVertexNormals();
    }
    for (const c of G.game.customers) if (c.ticket) c.ticket.rotation.x = Math.sin(t * 2.1 + c.seat * 1.9) * 0.05 * env.wind + 0.03 * env.wind;
    city.rain.rotation.z = -0.03 - env.wind * 0.07;
  });

  // ---- rain: splash rings on wet ground + drips off the canopy
  const ringG = new THREE.RingGeometry(0.75, 1, 18).rotateX(-Math.PI / 2), rings = [];
  for (let i = 0; i < 70; i++) { const r = nop(new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0xbfd0ff, transparent: true, opacity: 0, depthWrite: false }))); r.userData.t = Math.random(); r.renderOrder = -3; root.add(r); rings.push(r); }
  const place = (r) => { let x, z; do { x = (Math.random() - 0.5) * 16; z = -13 + Math.random() * 15; } while (Math.abs(x) < 1.8 && z > -1.85 && z < 2.2); r.position.set(x, z < -3.2 && z > -11.3 ? -0.112 : 0.006, z); r.userData.s = 0.03 + Math.random() * 0.05; };
  rings.forEach(place);
  const dripG = new THREE.SphereGeometry(0.006, 6, 5).scale(1, 2.6, 1), dripM = new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.7 }), drips = [];
  for (let i = 0; i < 16; i++) { const d = nop(new THREE.Mesh(dripG, dripM)); d.userData = { v: 0, wait: Math.random() * 3, nopick: true }; root.add(d); drips.push(d); }
  const edge = (d) => { const s = Math.random(); if (s < 0.5) d.position.set((Math.random() - 0.5) * 3.4, 2.62, -1.82); else d.position.set((Math.random() - 0.5) * 3.4, 2.62, 2.12); d.userData.v = 0; d.userData.wait = Math.random() * 2.5; d.visible = false; };
  drips.forEach(edge);
  ups.push((dt) => {
    for (const r of rings) { r.userData.t += dt * 2.2; if (r.userData.t > 1) { r.userData.t = 0; place(r); } const s = r.userData.s * (0.3 + r.userData.t); r.scale.set(s, 1, s); r.material.opacity = 0.32 * (1 - r.userData.t); }
    for (const d of drips) { const u = d.userData; if (u.wait > 0) { u.wait -= dt; continue; } d.visible = true; u.v += 9.8 * dt; d.position.y -= u.v * dt; if (d.position.y < 0.02) { const r = rings[(Math.random() * rings.length) | 0]; r.position.set(d.position.x, 0.006, d.position.z); r.userData.t = 0; r.userData.s = 0.05; edge(d); } }
  });

  // ---- moths circling the lights
  const mk = (n, c, r, size) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const p = nop(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff0d0, size, transparent: true, opacity: 0.85, depthWrite: false }))); p.frustumCulled = false; root.add(p); return { p, n, c, r, ph: Array.from({ length: n }, () => [Math.random() * 6, 1.5 + Math.random() * 2.5, Math.random() * 6]) }; };
  const swarms = [mk(4, new V3(-0.55, 2.34, -0.25), 0.13, 0.008), mk(4, new V3(0, 2.34, -1.05), 0.16, 0.008), mk(12, new V3(-7.5, 6.0, -4.75), 0.7, 0.03), mk(10, new V3(9.5, 6.0, -4.75), 0.7, 0.03)];
  ups.push((dt, t) => { for (const s of swarms) { const a = s.p.geometry.attributes.position; s.ph.forEach(([p0, w, p1], i) => { const rr = s.r * (0.5 + 0.5 * Math.sin(t * 0.9 * w + p1)); a.setXYZ(i, s.c.x + Math.cos(t * w + p0) * rr, s.c.y + Math.sin(t * w * 1.7 + p1) * s.r * 0.5, s.c.z + Math.sin(t * w + p0) * rr); }); a.needsUpdate = true; } });

  // ---- manhole venting steam into the lamp light
  const mh = cyl(0.42, 0.42, 0.02, mat({ color: 0x2a2a2e, roughness: 0.5, metalness: 0.7 }), 4.6, -0.11, -6.2, root, 24); mh.castShadow = false; nop(mh);
  const smoke = T.smokeTex(), puffs = [];
  for (let i = 0; i < 14; i++) { const s = nop(new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke, color: 0xc8b8a8, transparent: true, opacity: 0, depthWrite: false }))); s.userData.t = i / 14; root.add(s); puffs.push(s); }
  ups.push((dt) => { for (const s of puffs) { s.userData.t += dt * 0.16; if (s.userData.t > 1) { s.userData.t = 0; s.userData.x = (Math.random() - 0.5) * 0.3; } const k = s.userData.t; s.position.set(4.6 + (s.userData.x || 0) + k * k * env.wind * 2.2, -0.05 + k * 3.2, -6.2); const sc = 0.5 + k * 2.4; s.scale.set(sc, sc, 1); s.material.opacity = Math.sin(k * Math.PI) * 0.16; } });

  // ---- elevated railway crossing the far end of the street
  const mC = mat({ color: 0x3a3a3e, roughness: 0.9 });
  box(3.4, 0.7, 60, mC, -58, 8.2, -6, root).castShadow = false; for (const z of [-12.2, -2.6]) box(1.1, 8, 1.1, mC, -58, 4, z, root).castShadow = false;
  const winT = T.canvasTex(1024, 32, (g, w, h) => { g.fillStyle = '#20242a'; g.fillRect(0, 0, w, h); for (let c = 0; c < 6; c++) { for (let i = 0; i < 9; i++) { g.fillStyle = '#ffe9b8'; g.fillRect(c * 170 + 10 + i * 17, 7, 13, 14); } g.fillStyle = '#0a0a0c'; g.fillRect(c * 170 + 166, 0, 4, h); } });
  const train = new THREE.Group(); root.add(train);
  const tb = box(2.7, 2.7, 60, mat({ color: 0x4a5a48, roughness: 0.5, metalness: 0.4 }), 0, 0, 0, train); tb.castShadow = false;
  const tw = nop(new THREE.Mesh(new THREE.PlaneGeometry(60, 1.1), new THREE.MeshBasicMaterial({ map: winT, toneMapped: false, color: new THREE.Color(1.6, 1.5, 1.3) }))); tw.rotation.y = Math.PI / 2; tw.position.set(1.36, 0.3, 0); train.add(tw);
  train.position.set(-58, 10, 200); train.traverse(nop);
  let trainT = 12;
  ups.push((dt) => { trainT -= dt; if (trainT <= 0) { train.position.z = 130; trainT = 38 + Math.random() * 30; } if (train.position.z > -140) train.position.z -= 22 * dt; env.train = clamp(1 - Math.abs(train.position.z + 6) / 75, 0, 1); });

  // ---- sound cues from the world
  let stepT = 0, chirpT = 0;
  ups.push((dt, t) => {
    let best = 0, pan = 0; const cam = G.camera.getWorldPosition(_p);
    for (const k of city.cars) { const d = k.c.position.distanceTo(cam), g = 1 / (1 + (d * d) / 60); if (g > best) { best = g; pan = clamp((k.c.position.x - cam.x) / 14, -1, 1); } }
    env.car = best; env.carPan = pan;
    stepT -= dt; if (stepT <= 0 && G.game.customers.some((c) => (c.state === 'walk' || c.state === 'leaving') && Math.abs(c.p.root.position.x) < 4)) { G.audio.play('step'); stepT = 0.47; }
    chirpT -= dt; if (chirpT <= 0 && (t % 30) / 30 < 0.55) { G.audio.play('chirp'); chirpT = 1.25; }
    if (Math.random() < dt * 14) G.audio.play('patter');
  });

  return { env, update(dt, t) { for (const u of ups) u(dt, t); } };
}
const _p = new V3();
