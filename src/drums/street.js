// THE GARAGE's street: the houses opposite, the pavements, the lamps, the cars that pass, and the neighbours and the mail carrier on their rounds, who hear you play, come up the drive and talk
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { pbr, plain, slabGeo, model, P } from './assets.js';
import { ROOM } from './garage.js';
import CAST from './cast.json';

const Z0 = ROOM.z0, PAVE = Z0 - 10, ROADZ = Z0 - 14.3, FAR = Z0 - 18.6, FRONT = Z0 - 25, END = 70, CAREND = 115, RUN = 125;
const HOUSES = [-78, -66, -54, -42, -30, -18, -6, 6, 18, 30, 42, 54, 66, 78], HOME = 4; // across the street, by x; the cast's `house` is an index into the first five
export const STAND = [0.7, Z0 - 1.3]; // where a caller stops at the door
export const relWord = (r) => (r <= -4 ? 'CANNOT STAND YOU' : r < -1 ? 'COOL WITH YOU' : r < 1.5 ? 'A NEIGHBOUR' : r < 5 ? 'FRIENDLY' : 'A FRIEND');
const isNight = (h) => h >= 22 || h < 7;

function bubble() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 176;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, fog: false, toneMapped: false, transparent: true }));
  s.scale.set(1.7, 0.585, 1); s.position.y = 2.25; s.renderOrder = 22; s.visible = false;
  const g = c.getContext('2d');
  return { sprite: s, write(name, text) {
    g.clearRect(0, 0, 512, 176); g.fillStyle = 'rgba(8,8,10,.84)'; g.fillRect(0, 0, 512, 176);
    g.fillStyle = '#ffb347'; g.font = '700 26px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText(name, 18, 34);
    g.fillStyle = '#f2efe6'; g.font = '500 25px system-ui,sans-serif';
    const words = String(text).split(' '); let line = '', y = 68;
    for (const w of words) { if (g.measureText(line + w).width > 476) { g.fillText(line, 18, y); y += 31; line = ''; if (y > 165) break; } line += w + ' '; }
    if (y <= 165) g.fillText(line, 18, y);
    t.needsUpdate = true; s.visible = true;
  } };
}

export function buildStreet(scene, low) {
  const group = new THREE.Group();
  scene.add(group);
  const bins = new Map();
  const box = (mat, w, h, d, x, y, z) => { if (!bins.has(mat)) bins.set(mat, []); bins.get(mat).push(slabGeo(w, h, d, mat.userData.tile || 1, x, y, z)); };
  const raw = (mat, g) => { if (!bins.has(mat)) bins.set(mat, []); bins.get(mat).push(g.index ? g.toNonIndexed() : g); };
  const M = {
    road: pbr('road', { tile: 4, env: 0.15, color: 0x8a8c90 }), pave: pbr('drive', { tile: 2, env: 0.15 }), grass: pbr('grass', { tile: 2.5, env: 0.1 }),
    brick: [0xffffff, 0xd8c6b0, 0xb9a48f, 0xe6d6c8, 0xc8ccd0, 0xe8dcc0].map((c) => pbr('brick', { tile: 1.8, env: 0.2, color: c })), fence: pbr('fence', { tile: 1.2, env: 0.2 }),
    roof: [plain(0x3b3d42, { rough: 0.9 }), plain(0x4a3a34, { rough: 0.9 }), plain(0x2e3a34, { rough: 0.9 })], trim: plain(0xe9e6dc, { rough: 0.6 }), door: [plain(0x7a2a24, { rough: 0.5 }), plain(0x23405e, { rough: 0.5 }), plain(0x2f4a36, { rough: 0.5 })],
    steel: plain(0x6e7379, { rough: 0.4, metal: 0.8 }), line: plain(0xd8d2b0, { rough: 0.8 }),
    win: new THREE.MeshStandardMaterial({ color: 0x1a222b, roughness: 0.15, emissive: 0xffc878, emissiveIntensity: 0 }),
  };
  M.winD = M.win.clone(); // a window with nobody home
  // the ground: your pavement, the road with its line, the far pavement, lawns behind
  box(M.pave, 2 * RUN, 0.12, 1.7, 0, -0.03, PAVE);
  box(M.road, 2 * RUN, 0.1, 7, 0, -0.09, ROADZ);
  for (let x = -RUN; x < RUN; x += 6) box(M.line, 2.4, 0.01, 0.12, x, -0.036, ROADZ);
  box(M.pave, 2 * RUN, 0.12, 1.7, 0, -0.03, FAR);
  box(M.grass, 2 * RUN, 0.1, 60, 0, -0.09, FAR - 30.8);
  box(M.grass, 2 * RUN, 0.1, 40, 0, -0.1, Z0 + 14);
  const solids = [], houses = [], casters = [];
  // the houses opposite: brick, a hipped roof, a porch, windows that light at night, a path, a mailbox at the kerb
  HOUSES.forEach((hx, i) => {
    const w = 9 + (i % 2), d = 7, h = 3 + (i % 3) * 0.25, z = FRONT - d / 2, br = M.brick[(i * 5 + 1) % 6];
    box(br, w, h, d, hx, h / 2, z); solids.push([hx - w / 2 - 0.2, z - d / 2 - 0.2, hx + w / 2 + 0.2, z + d / 2 + 0.2]); houses.push({ x: hx, z, w, d, h, i, far: true, door: hx + (i % 2 ? 1.6 : -1.4) }); casters.push([hx, z, w, d, h + 0.9]);
    const rg = new THREE.CylinderGeometry(0.02, 1, 1.9, 4, 1).rotateY(Math.PI / 4); rg.scale(w * 0.78, 1, d * 0.8); rg.translate(hx, h + 0.95, z);
    raw(M.roof[(i * 2) % 3], rg);
    const dx = hx + (i % 2 ? 1.6 : -1.4);
    box(M.trim, 1.1, 2.15, 0.1, dx, 1.07, FRONT + 0.02); box(M.door[i % 3], 0.92, 2.0, 0.12, dx, 1.0, FRONT + 0.03);
    box(M.pave, 2.4, 0.18, 1.3, dx, 0.07, FRONT + 0.65); box(M.pave, 1.1, 0.06, FRONT - FAR - 1.4, dx, -0.01, (FRONT + FAR) / 2 + 0.6);
    for (const wx of [-3, i % 2 ? -0.6 : 1.2, 3]) { if (Math.abs(hx + wx - dx) < 1) continue; box(M.trim, 1.25, 1.3, 0.08, hx + wx, 1.75, FRONT + 0.02); box(Math.sin(hx * 3.7 + wx * 5.1) > 0.25 ? M.winD : M.win, 1.1, 1.15, 0.1, hx + wx, 1.75, FRONT + 0.03); box(M.trim, 1.4, 0.06, 0.16, hx + wx, 1.1, FRONT + 0.06); if (i % 3 !== 1) for (const sx of [-0.82, 0.82]) box(M.door[(i + 1) % 3], 0.34, 1.25, 0.05, hx + wx + sx, 1.75, FRONT + 0.03); }
    box(M.steel, 0.07, 1.05, 0.07, dx + 1.1, 0.5, FAR + 0.75); box(M.trim, 0.2, 0.2, 0.42, dx + 1.1, 1.1, FAR + 0.75);
    if (Math.abs(hx) > 31) return;
    model('potted_plant_01', hx - 3.6, 0, FRONT + 0.9, i, { h: 1.3, shadow: false }, group);
  });
  // your own side: a neighbour's house each way, your mailbox by the drive
  for (const s of [-1, 1]) for (const k of [0, 1, 2, 3, 4]) { const hx = s * (17 + k * 14), br = M.brick[s > 0 ? 2 : 1]; box(br, 10, 3.1, 8, hx, 1.55, Z0 - 2.5); solids.push([hx - 5.2, Z0 - 6.7, hx + 5.2, Z0 + 1.7]); houses.push({ x: hx, z: Z0 - 2.5, w: 10, d: 8, h: 3.1, i: k, far: false }); casters.push([hx, Z0 - 2.5, 10, 8, 4]); const rg = new THREE.CylinderGeometry(0.02, 1, 1.9, 4, 1).rotateY(Math.PI / 4); rg.scale(7.8, 1, 6.4); rg.translate(hx, 4.05, Z0 - 2.5); raw(M.roof[0], rg);
    for (const wx of [-2.5, 2.5]) { box(M.trim, 1.25, 1.3, 0.08, hx + wx, 1.75, Z0 - 6.52); box(Math.sin(hx * 2.3 + wx) > 0.2 ? M.winD : M.win, 1.1, 1.15, 0.1, hx + wx, 1.75, Z0 - 6.53); } if (!k) { box(M.fence, 0.05, 1.1, 6, s * 10.5, 0.55, Z0 - 5.5); solids.push([s * 10.5 - 0.15, Z0 - 8.5, s * 10.5 + 0.15, Z0 - 2.5]); } }
  box(M.steel, 0.07, 1.05, 0.07, 2.4, 0.5, PAVE + 1.05); box(M.trim, 0.2, 0.2, 0.42, 2.4, 1.1, PAVE + 1.05);
  for (const [mat, list] of bins) { const m = new THREE.Mesh(mergeGeometries(list), mat); m.receiveShadow = true; m.castShadow = false; group.add(m); }
  // lamps along your kerb, a hydrant, two cars left at the kerb
  const lampM = new THREE.MeshBasicMaterial({ color: 0x33302a }), lamps = [];
  for (const x of [-63, -45, -27, -9, 9, 27, 45, 63]) { solids.push([x - 0.2, PAVE - 1.2, x + 0.2, PAVE - 0.8]); casters.push([x, PAVE - 1.0, 0.16, 0.16, 4.5]); model('street_lamp_01', x, 0, PAVE - 1.0, 0, { h: 4.6, shadow: false }, group); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lampM); b.position.set(x, 4.35, PAVE - 1.0); group.add(b); }
  for (const x of [-9, 9]) { const l = new THREE.PointLight(0xffc27a, 0, 16, 1.6); l.position.set(x, 4.2, PAVE - 1.0); group.add(l); lamps.push(l); }
  model('fire_hydrant', 6.2, 0, PAVE - 0.55, 0, { h: 0.75, shadow: false }, group);
  const carMat = (v) => { const src = model('car', 0, 0, 0, 0).getObjectByProperty('isMesh', true), m = src.material.clone(); m.map = P.car[v] || m.map; m.roughness = 0.5; m.metalness = 0.12; return m; };
  const mats = [0, 1, 2, 3, 4].map(carMat); for (const m of mats) m.userData.ambC = new THREE.Color(0.5, 0.5, 0.5);
  const makeCar = (v) => { const g = model('car', 0, 0, 0, 0, { shadow: false }); g.traverse((o) => { if (o.isMesh) o.material = mats[v]; }); const eyes = new THREE.Mesh(mergeGeometries([new THREE.SphereGeometry(0.09, 6, 5).translate(1.98, 0.62, 0.55), new THREE.SphereGeometry(0.09, 6, 5).translate(1.98, 0.62, -0.55)]), new THREE.MeshBasicMaterial({ color: 0xfff3c8 })); eyes.visible = false; g.add(eyes); g.userData.eyes = eyes; group.add(g); return g; };
  const parked = makeCar(2); parked.position.set(-13, 0, FAR + 1.45); parked.rotation.y = Math.PI;
  const parked2 = makeCar(3); parked2.position.set(21, 0, PAVE - 1.45);
  solids.push([-15.2, FAR + 0.5, -10.8, FAR + 2.4], [18.8, PAVE - 2.4, 23.2, PAVE - 0.5]);
  casters.push([-13, FAR + 1.45, 4, 1.7, 1.3], [21, PAVE - 1.45, 4, 1.7, 1.3]);
  // the cars that pass: three, taken in turn
  const cars = [0, 1, 3].map((v) => { const g = makeCar(v); g.visible = false; return { g, on: false, dir: 1, v: 9 }; });
  let nextCar = 4;

  // ---- the people ----
  const BLOB = new THREE.CircleGeometry(0.42, 14), BLOBM = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.38, depthWrite: false });
  const people = CAST.map((c) => {
    const src = P.body[c.av], g = new THREE.Group();
    const p = { c, id: c.id, g, pos: g.position, state: 'home', t: 0, rel: 0, met: false, last: -99, said: -99, bub: bubble(), hear: 0, path: [], pi: 0, done: {} };
    if (src) {
      const sex = /Female/.test(c.av) ? 'f' : 'm', body = SkeletonUtils.clone(src.scene);
      body.scale.multiplyScalar(src.fit * (c.age < 20 ? 0.93 : 1));
      body.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.frustumCulled = false; } });
      g.add(body);
      p.mixer = new THREE.AnimationMixer(body); p.acts = {};
      for (const k in P.clip[sex]) p.acts[k] = p.mixer.clipAction(P.clip[sex][k]);
    }
    const b = new THREE.Mesh(BLOB, BLOBM); b.rotation.x = -Math.PI / 2; b.position.y = 0.03; b.renderOrder = 2;
    g.add(b, p.bub.sprite);
    g.visible = false;
    group.add(g);
    return p;
  });
  const play = (p, name) => { if (!p.acts || p.anim === name || !p.acts[name]) return; const a = p.acts[name]; a.reset().fadeIn(0.3).play(); if (p.anim) p.acts[p.anim].fadeOut(0.3); p.anim = name; };
  const go = (p, pts) => { p.path = pts; p.pi = 0; p.state = 'walk'; p.g.visible = true; play(p, 'walk'); };
  const S = {
    group, people, cars, solids, houses, casters, M, makeCar, FAR, FRONT, RUN, events: [], talkTo: null, hour: 12, PAVE, ROADZ,
    // a shot: everyone who can hear it runs, and thinks the worse of you; nobody is hurt
    scare(x, z) { for (const p of people) { if (!p.g.visible || p.fled) continue; const d = Math.hypot(p.pos.x - x, p.pos.z - z); if (d > 55) continue; p.fled = true; S.warm(p, d < 12 ? -5 : -3);
      S.say(p, d < 12 ? 'Whoa! Put that thing down!' : 'Was that a gun?!', 'shot'); const dir = p.pos.x >= x ? 1 : -1; p.then = null; p.hear = 0; p.run = 3.2; go(p, [[p.pos.x, PAVE], [dir * END, PAVE]]); play(p, 'run'); } },
    // a line from someone: shown over their head, handed to the page to be spoken
    say(p, text, kind) { p.bub.write(p.c.name.toUpperCase() + ' · ' + relWord(p.rel), text); p.said = S.time; p.sayT = Math.min(9, 2.5 + text.length * 0.06); S.events.push({ t: 'say', p, text, kind }); play(p, 'talk'); },
    line(p, key) { const L = p.c.lines[key]; return L && L.length ? L[(Math.random() * L.length) | 0] : ''; },
    warm(p, d) { p.rel = Math.max(-10, Math.min(10, p.rel + d)); S.events.push({ t: 'rel', p, d }); },
    // who would hear you if you spoke: the caller at the door, else the nearest passer within ten metres
    nearest() { let best = null, bd = 10; for (const p of people) { if (!p.g.visible) continue; const d = Math.hypot(p.pos.x, p.pos.z) - (p.state === 'visit' ? 6 : 0); if (d < bd) { bd = d; best = p; } } return best; },
    // you spoke to them: they stay, and wait for their answer
    heard(p) { p.hear = 30; if (p.state === 'walk' && Math.abs(p.pos.z - PAVE) < 1) { p.resume = [p.path, p.pi]; p.state = 'pause'; play(p, 'idle'); } },
    time: 0,
    // ctx: { loud 0..1 (how hard you have been playing lately), playing, door 0..1 }
    update(dt, time, hour, ctx) {
      S.time = time; S.hour = hour;
      const night = isNight(hour), dark = 1 - ctx.day;
      M.win.emissiveIntensity = dark * 1.1; M.winD.emissiveIntensity = dark * 0.06; lampM.color.setRGB(0.2 + dark * 1.6, 0.16 + dark * 1.28, 0.1 + dark * 0.8); for (const l of lamps) l.intensity = dark * 26;
      // cars
      nextCar -= dt;
      if (nextCar < 0) { nextCar = (night ? 25 : 7) + Math.random() * (night ? 50 : 16); const c = cars.find((k) => !k.on); if (c) { c.on = true; c.dir = Math.random() < 0.5 ? 1 : -1; c.v = 8 + Math.random() * 4; c.g.visible = true; c.g.position.set(-c.dir * CAREND, 0, ROADZ + c.dir * 1.75); c.g.rotation.y = c.dir > 0 ? 0 : Math.PI; } }
      let near = 99;
      for (const c of cars) { if (!c.on) continue; c.g.position.x += c.dir * c.v * dt; c.g.userData.eyes.visible = dark > 0.4; near = Math.min(near, Math.abs(c.g.position.x)); if (Math.abs(c.g.position.x) > CAREND + 2) { c.on = false; c.g.visible = false; } }
      parked.userData.eyes.visible = parked2.userData.eyes.visible = false;
      S.carNear = near;
      // the day's walks: each sets out at their hours, the mail carrier on his round
      const hh = Math.floor(hour);
      for (const p of people) {
        if (p.state === 'home') { for (const h0 of p.c.hours) { const h = 16 + (h0 * 5 + p.c.age) % 8; if (hh === h && p.done[h] !== S.dayN) { p.done[h] = S.dayN; const dir = Math.random() < 0.5 ? 1 : -1; p.pos.set(-dir * END, 0, PAVE + (Math.random() - 0.5) * 0.5); go(p, [[dir * END, PAVE]]); p.dir = dir; p.asked = false; break; } } continue; }
        p.mixer?.update(dt);
        if (p.sayT > 0) { p.sayT -= dt; if (p.sayT <= 0) { p.bub.sprite.visible = false; if (p.state !== 'walk') play(p, 'idle'); } }
        p.hear = Math.max(0, p.hear - dt);
        if (p.state === 'walk') {
          const [tx, tz] = p.path[p.pi], dx = tx - p.pos.x, dz = tz - p.pos.z, d = Math.hypot(dx, dz), v = (p.run || (p.c.age > 60 ? 1.05 : p.c.age < 20 ? 1.6 : 1.3)) * dt;
          if (d < v) { p.pos.x = tx; p.pos.z = tz; if (++p.pi >= p.path.length) { if (p.then) { const f = p.then; p.then = null; f(); } else { p.state = 'home'; p.g.visible = false; p.anim = null; p.run = 0; p.fled = false; p.mixer?.stopAllAction(); } } }
          else { p.pos.x += dx / d * v; p.pos.z += dz / d * v; p.g.rotation.y = Math.atan2(dx, dz); }
          // passing your drive: they hear what comes out of the garage and may call out or come up
          if (!p.asked && !p.fled && Math.abs(p.pos.z - PAVE) < 1 && Math.abs(p.pos.x - 1) < 1.2) {
            p.asked = true;
            const loud = ctx.loud > 0.45, playing = ctx.playing, tol = p.id === 'gus' || p.id === 'marcus', hates = p.id === 'dolores' || p.id === 'rick';
            const key = playing && night && p.c.lines.night.length ? 'night' : playing && loud && (hates || (p.id === 'marcus' && hour < 12)) ? 'loud' : playing ? 'nice' : 'hi';
            if (key === 'night') S.warm(p, tol ? 0 : -0.6); else if (key === 'loud') S.warm(p, -0.4); else if (key === 'nice') S.warm(p, 0.4); else if (!p.met) S.warm(p, 0.2);
            p.met = true;
            const up = ctx.door > 0.6 && (p.id === 'walt' || key !== 'hi' || Math.random() < 0.6 || p.rel > 2);
            if (up) { const back = [[p.dir * END, PAVE]]; p.then = () => { p.state = 'visit'; p.t = 0; p.g.rotation.y = Math.atan2(-p.pos.x, -p.pos.z + 0.6); play(p, 'idle'); S.say(p, S.line(p, key), key); p.back = back; }; p.path = [[1, PAVE + 1], [STAND[0], STAND[1]]]; p.pi = 0; }
            else S.say(p, S.line(p, key), key);
          }
        } else if (p.state === 'visit' || p.state === 'pause') {
          p.t += dt;
          p.g.rotation.y = Math.atan2(-p.pos.x, 0.1 - p.pos.z);
          // they wait a while for you to speak, longer while you are talking, then say goodbye and go on
          if (p.t > 14 && p.hear <= 0 && !(p.sayT > 0) && !p.busy) { if (p.state === 'visit') { const b = S.line(p, 'bye'); if (b) S.say(p, b, 'bye'); go(p, [[1, PAVE + 1], [1, PAVE], ...p.back]); } else { p.state = 'walk'; [p.path, p.pi] = p.resume; play(p, 'walk'); } p.bub.sprite.visible = !!(p.sayT > 0); }
        }
      }
    },
    dayN: 0,
  };
  return S;
}
