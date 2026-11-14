// the street in 1986: wet road, fronts and neon, the moon, lamps and haze, traffic, passers-by, rain
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, rand, pick } from './ctx.js';
import * as T from './tex.js';
import { makePerson } from './avatars.js';
import { makeStreet } from './street.js';

export const FOG = 0x15122a;
export const MOON_DIR = new THREE.Vector3(-0.955, 0.27, -0.1).normalize();

export function buildCity(scene) {
  const R = T.rng(1986);
  const city = new THREE.Group(); scene.add(city);
  const glow = new THREE.Group(); city.add(glow); // everything mirrored in the wet street
  const ups = [];
  const glowMap = T.glowTex();
  const halo = (color, size, x, y, z, parent = glow, op = 0.5) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op, fog: true }));
    s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); s.userData.nopick = true; return s;
  };

  // ---------- sky, stars, moon ----------
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 16), new THREE.MeshBasicMaterial({ map: T.skyTex(), side: THREE.BackSide, fog: false, depthWrite: false }));
  city.add(sky);
  {
    const n = 1800, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = R() * Math.PI * 2, v = Math.asin(0.06 + R() * 0.94), b = (0.25 + R() * R() * 0.75) * Math.min(1, v * 2.2);
      pos.set([Math.cos(u) * Math.cos(v) * 380, Math.sin(v) * 380, Math.sin(u) * Math.cos(v) * 380], i * 3);
      const w = R(); col.set([b * (0.8 + w * 0.2), b * 0.9, b * (1 - w * 0.25)], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    city.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, depthWrite: false })));
    const moonT = T.canvasTex(256, 256, (c, w) => {
      const gr = c.createRadialGradient(118, 112, 10, 128, 128, 120); gr.addColorStop(0, '#fffdf2'); gr.addColorStop(0.9, '#e6e2d0'); gr.addColorStop(1, 'rgba(230,226,208,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(128, 128, 122, 0, 7); c.fill();
      const r2 = T.rng(4); c.globalAlpha = 0.16; c.fillStyle = '#6f7480';
      for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(60 + r2() * 130, 50 + r2() * 150, 8 + r2() * 30, 6 + r2() * 22, r2() * 3, 0, 7); c.fill(); }
    });
    const moon = new THREE.Mesh(new THREE.CircleGeometry(11, 40), new THREE.MeshBasicMaterial({ map: moonT, transparent: true, fog: false, toneMapped: false, color: new THREE.Color(1.5, 1.5, 1.45) }));
    moon.position.copy(MOON_DIR).multiplyScalar(370); moon.lookAt(0, 0, 0); city.add(moon);
    const mh = halo(0x8fa6ff, 150, moon.position.x, moon.position.y, moon.position.z, city, 0.4); mh.material.fog = false;
    // thin drifting cloud wisps near the moon
    const cm = new THREE.SpriteMaterial({ map: T.smokeTex(), color: 0x39406a, transparent: true, opacity: 0.55, fog: false, depthWrite: false });
    for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(cm); s.position.set(-330 + R() * 60, 60 + R() * 110, -260 + R() * 420); s.scale.set(200 + R() * 160, 40 + R() * 40, 1); city.add(s); ups.push((dt) => { s.position.z += dt * 1.2; if (s.position.z > 200) s.position.z = -260; }); }
  }

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0x2c3458, 0x100c12, 0.44));
  const moonL = new THREE.DirectionalLight(0x9db6ff, 0.32);
  moonL.position.copy(MOON_DIR).multiplyScalar(45); moonL.target.position.set(0, 0, -3);
  moonL.castShadow = true; moonL.shadow.mapSize.set(2048, 2048); moonL.shadow.bias = -0.0006; moonL.shadow.normalBias = 0.03;
  Object.assign(moonL.shadow.camera, { left: -16, right: 16, top: 12, bottom: -12, near: 5, far: 90 });
  scene.add(moonL, moonL.target);
  [[-14, 5, -12.6, 0xff2d8a, 60], [4, 6, -12.6, 0x22d8ff, 60], [20, 5, -12.6, 0xffa030, 50], [-30, 6, -12.6, 0x8a4dff, 50], [-2.2, 1.4, 1.6, 0xbfe0ff, 3]].forEach(([x, y, z, c, i]) => {
    const l = new THREE.PointLight(c, i, 26, 1.8); l.position.set(x, y, z); scene.add(l);
  });

  // ---------- ground ----------
  const L = 150;
  const mSide = mat({ map: T.paverTex([L / 2.4, 2.4]), roughness: 0.42, metalness: 0.05, envMapIntensity: 0.6 });
  T.dirty(mSide.map, 21, { cracks: 16, gum: 110, stains: 44, patch: 6 });
  mSide.normalMap = T.normalOf(mSide.map, 2.5);
  const nearWalk = mesh(new THREE.PlaneGeometry(L, 5.8), mSide, 0, 0, -0.3, city); nearWalk.rotation.x = -Math.PI / 2; nearWalk.castShadow = false;
  box(L, 0.12, 0.18, mat({ color: 0x55555a, roughness: 0.6 }), 0, -0.06, -3.29, city);
  const mStreet = new THREE.MeshStandardMaterial({ map: T.asphaltTex([L / 5, 1.6]), alphaMap: T.puddleTex([L / 9, 0.9], 9, 246, 168), transparent: true, roughness: 0.28, metalness: 0.0, envMapIntensity: 1.2, color: 0xd0d0dc });
  T.dirty(mStreet.map, 22, { cracks: 14, patch: 12, stains: 30 });
  mStreet.normalMap = T.normalOf(mStreet.map, 3); mStreet.normalScale.set(0.7, 0.7);
  const street = mesh(new THREE.PlaneGeometry(L, 8), mStreet, 0, -0.12, -7.3, city); street.rotation.x = -Math.PI / 2; street.castShadow = false; street.renderOrder = -5;
  const mFarWalk = new THREE.MeshStandardMaterial({ map: T.paverTex([L / 2.4, 1]), alphaMap: T.puddleTex([L / 7, 0.4], 12, 250, 195), transparent: true, roughness: 0.4 });
  const farWalk = mesh(new THREE.PlaneGeometry(L, 2.4), mFarWalk, 0, 0, -12.5, city); farWalk.rotation.x = -Math.PI / 2; farWalk.castShadow = false; farWalk.renderOrder = -5;
  box(L, 0.12, 0.18, mat({ color: 0x55555a, roughness: 0.6 }), 0, -0.06, -11.31, city);
  const mPaint = new THREE.MeshStandardMaterial({ color: 0xb9b6a8, roughness: 0.5, transparent: true, opacity: 0.8 });
  for (let x = -L / 2; x < L / 2; x += 6) { const p = mesh(new THREE.PlaneGeometry(2.6, 0.14), mPaint, x, -0.114, -7.3, city); p.rotation.x = -Math.PI / 2; p.castShadow = false; p.renderOrder = -4; }
  for (let i = 0; i < 9; i++) { const p = mesh(new THREE.PlaneGeometry(0.5, 7.2), mPaint, 11.5 + i * 0.95, -0.113, -7.3, city); p.rotation.x = -Math.PI / 2; p.castShadow = false; p.renderOrder = -4; }

  // ---------- far-side buildings ----------
  const mBody = mat({ color: 0x17161c, roughness: 0.9 });
  const signs = [
    ['カラオケ', '#ff2d8a', 1], ['パチンコ', '#ffd21f', 0, 'PACHINKO'], ['スナック純', '#b56bff', 1], ['喫茶', '#ff7a2a', 1], ['BAR', '#22d8ff', 0, 'ウイスキー'], ['HOTEL', '#ff3d4d', 1],
    ['サウナ', '#39f0c0', 1], ['麻雀', '#ff3d4d', 1], ['焼鳥', '#ffa030', 1], ['居酒屋', '#ffd21f', 1], ['DISCO', '#ff2de0', 0, 'ALL NIGHT'], ['薬', '#39f08a', 1],
    ['VIDEO', '#22d8ff', 0, 'ビデオレンタル'], ['レコード', '#ff7a2a', 0, 'RECORDS & TAPES'], ['カメラ', '#ffffff', 0, 'CAMERA 現像'], ['ゲーム', '#8aff3d', 0, 'GAME CENTER'], ['寿司', '#ff5a3a', 1], ['酒', '#ffe9a8', 1],
    ['CABARET', '#ff2d8a', 0], ['ビリヤード', '#39f0c0', 1], ['中華', '#ff3d2a', 1], ['24H', '#22d8ff', 0],
  ];
  const signMats = signs.map(([t, c, v, sub]) => {
    const tex = T.dirty(T.neonTex(t, c, { vertical: !!v, sub }), 50 + t.length * 3 + (v ? 7 : 0), { stains: 16, drips: 6 });
    const dim = 0.7 + R() * 0.75; const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide, color: new THREE.Color(dim, dim, dim) });
    m.userData = { aspect: tex.image.width / tex.image.height, color: c, vertical: !!v };
    return m;
  });
  const flickers = [];
  const addSign = (m0, x, y, z, h, rotY = 0, k = 1) => {
    let m = m0; if (k < 1) { m = m0.clone(); m.color.multiplyScalar(k); m.userData = m0.userData; }
    const w = h * m.userData.aspect;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); s.position.set(x, y, z); s.rotation.y = rotY; glow.add(s);
    box(w + 0.15, h + 0.15, 0.12, mBody, x - Math.sin(rotY) * 0.08, y, z - Math.cos(rotY) * 0.08, city).rotation.y = rotY;
    const hl = halo(m.userData.color, Math.max(w, h) * 2.2, x + Math.sin(rotY) * 0.3, y, z + Math.cos(rotY) * 0.3, glow, 0.3 * k);
    if (R() < 0.3) flickers.push([s, hl, R()]);
  };
  const SHOPSIGN = { izakaya: ['居酒屋', '#ffa030'], books: ['書店', '#f0e8d0'], records: ['レコード', '#ff7a2a'], pharmacy: ['薬局', '#39f08a'], tv: ['電気店', '#22d8ff'], kissa: ['喫茶', '#ff7a2a'], grocer: ['八百屋', '#ffd21f'], game: ['ゲーム', '#8aff3d'], liquor: ['酒屋', '#ffe9a8'], camera: ['カメラ', '#e8f0ff'] }, shopSigns = {};
  const signFor = (type) => { if (!shopSigns[type]) { const [t, c] = SHOPSIGN[type], tex = T.dirty(T.neonTex(t, c, {}), 70 + t.length, { stains: 14, drips: 5 }); const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide, color: new THREE.Color(1.1, 1.1, 1.1) }); m.userData = { aspect: tex.image.width / tex.image.height, color: c, vertical: false }; shopSigns[type] = m; } return shopSigns[type]; };
  const fronts = makeStreet(scene, city, glow, R, { body: mBody, glowMap, signMats, signFor, addSign: (...a) => addSign(...a) });
  let si = 0;
  const row = (z, dir, x0, x1, hMin, hMax) => {
    let x = x0;
    while (x < x1) {
      const w = 6 + R() * 7, h = hMin + R() * (hMax - hMin), b = fronts.building(x, w, h, z, dir, si, { near: Math.abs(x + w / 2) < 38 }), top = b.top;
      if (R() < 0.6) { // a canvas awning on its rods
        const aw = box(w - 0.5, 0.04, 1.0, mat({ color: [0x7a1c1c, 0x1c4a3a, 0x26335e, 0x5e4a1c, 0x6a665a][si % 5], roughness: 0.9 }), x + w / 2, 2.62, z + dir * 0.62, city); aw.rotation.x = dir * 0.26;
        for (const ax of [x + 0.5, x + w - 0.5]) { const r = cyl(0.012, 0.012, 1.05, mBody, ax, 2.56, z + dir * 0.6, city, 5); r.rotation.x = dir * 1.35; }
      }
      if (dir > 0) {
        const vms = signMats.filter((m) => m.userData.vertical), nV = 1 + ((R() * 2.4) | 0);
        for (let k = 0; k < nV; k++) {
          const vm = vms[(si * 3 + k * 5) % vms.length], hh = 2.2 + R() * 2.6;
          if (top > 5.5 + hh) addSign(vm, x + (k ? w - 0.45 : 0.45), 3.9 + hh / 2 + R() * Math.max(0.1, top - 5 - hh), z + 0.75, hh, Math.PI / 2 * (R() < 0.5 ? 1 : -1));
        }
        if (top > 16 && R() < 0.5) {
          const bm = signMats.filter((m) => !m.userData.vertical)[(si * 5 + 3) % 9];
          addSign(bm, x + w / 2, top + 2.2, z - 0.8, Math.min(2.2, (w - 1) / bm.userData.aspect));
          cyl(0.06, 0.06, 1.6, mBody, x + w / 2 - 1.5, top + 0.9, z - 0.9, city, 6); cyl(0.06, 0.06, 1.6, mBody, x + w / 2 + 1.5, top + 0.9, z - 0.9, city, 6);
        }
        if (top > 21) { const bl = halo(0xff2020, 1.6, x + w / 2, top + 1.2, z - 3, city, 0.9); ups.push((dt, t) => { bl.material.opacity = (Math.sin(t * 2 + x) > 0.2) ? 0.9 : 0.08; }); }
      }
      si++; x += w + (R() < 0.15 ? 1.2 : 0);
    }
  };
  row(-13.7, 1, -76, 76, 7, 25);
  // near side (behind the cart)
  row(2.9, -1, -76, -6, 7, 17); row(2.9, -1, 7, 76, 7, 17);
  {
    const mWall = mat({ map: T.tileWallTex([7, 5]), roughness: 0.55 });
    T.dirty(mWall.map, 23, { drips: 46, stains: 34, soot: 1, missing: 22, cracks: 4 });
    mWall.normalMap = T.normalOf(mWall.map, 3);
    [[-0.9, 1.5, 0], [-0.2, 1.42, 1], [1.4, 1.75, 2], [-5.6, 1.5, 3], [5.3, 1.55, 4], [5.95, 1.5, 0]].forEach(([x, y, k]) => { const pm = mesh(new THREE.PlaneGeometry(0.52, 0.78), mat({ map: T.posterTex(k), roughness: 0.85 }), x, y, 2.972, city); pm.rotation.set(0, Math.PI, (k - 2) * 0.012); pm.castShadow = false; });
    box(13.2, 15, 10, mBody, 0.5, 7.4, 8.0, city);
    const wall = mesh(new THREE.PlaneGeometry(13.2, 6), mWall, 0.5, 3, 2.98, city); wall.rotation.y = Math.PI;
    fronts.building(-6.1, 13.2, 15, 2.98, -1, 97, { y0: 6, noShops: true, noBody: true });
    const sh = mesh(new THREE.PlaneGeometry(3.2, 2.7), mat({ map: T.dirty(T.shutterTex(), 24, { rust: 34, drips: 26, scratches: 70, graffiti: 1, stains: 14 }), roughness: 0.4, metalness: 0.6 }), 2.6, 1.35, 2.95, city); sh.rotation.y = Math.PI;
    // door with lantern sign
    box(1.0, 2.1, 0.06, mat({ color: 0x2a1a10, roughness: 0.6 }), -4.6, 1.05, 2.95, city);
    const ds = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.3), new THREE.MeshBasicMaterial({ map: T.neonTex('スナック', '#b56bff', { vertical: true, fs: 80 }), toneMapped: false }));
    ds.position.set(-3.85, 1.9, 2.93); ds.rotation.y = Math.PI; city.add(ds); halo(0xb56bff, 2.2, -3.85, 1.9, 2.7, city, 0.3);
    // vending machine
    { // vending machine: a lit case of real cans behind glass, buttons, coin panel, the drop tray
      const vm = new THREE.Group(); vm.position.set(-2.2, 0, 2.2); vm.rotation.y = Math.PI; city.add(vm);
      const shell = mat({ color: 0xd8dde0, roughness: 0.45, metalness: 0.3 }), dark = mat({ color: 0x15171a, roughness: 0.6 });
      box(1.0, 1.85, 0.62, shell, 0, 0.925, -0.39, vm);
      for (const [bx, by, bwid, bh] of [[-0.47, 0.925, 0.06, 1.85], [0.47, 0.925, 0.06, 1.85], [0, 1.82, 1.0, 0.06], [0, 0.03, 1.0, 0.06], [0, 0.72, 0.9, 0.05]]) box(bwid, bh, 0.1, shell, bx, by, -0.04, vm);
      box(0.88, 1.0, 0.02, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.6, 1.7) }), 0, 1.27, -0.075, vm);
      const cans = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.115, 10), new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.6, emissive: 0x222222 }), 24), d = new THREE.Object3D(), cc = [0xd02a2a, 0x2a5ad0, 0xe8c020, 0x2aa05a, 0xf08a2a, 0x7a3ad0, 0x161616, 0xf0f0f0], r2 = T.rng(3);
      for (let i = 0; i < 24; i++) { d.position.set(-0.36 + (i % 8) * 0.103, 0.9 + Math.floor(i / 8) * 0.3 + 0.06, -0.045); d.rotation.y = r2() * 6; d.updateMatrix(); cans.setMatrixAt(i, d.matrix); cans.setColorAt(i, new THREE.Color(cc[(r2() * cc.length) | 0])); }
      vm.add(cans);
      for (let j = 0; j < 3; j++) { box(0.88, 0.02, 0.07, shell, 0, 0.895 + j * 0.3, -0.04, vm); for (let i = 0; i < 8; i++) box(0.05, 0.022, 0.02, new THREE.MeshBasicMaterial({ color: r2() < 0.2 ? 0x5a1010 : new THREE.Color(0.2, 1.4, 0.5) }), -0.36 + i * 0.103, 0.87 + j * 0.3, 0.004, vm); }
      const pane = box(0.88, 1.0, 0.008, new THREE.MeshPhysicalMaterial({ color: 0x223038, roughness: 0.05, transparent: true, opacity: 0.2, envMapIntensity: 2 }), 0, 1.27, 0.008, vm); pane.castShadow = false;
      box(0.2, 0.3, 0.03, dark, 0.3, 0.52, 0.01, vm); box(0.05, 0.012, 0.035, mat({ color: 0x8a8d90, metalness: 0.9, roughness: 0.3 }), 0.3, 0.6, 0.012, vm); box(0.08, 0.05, 0.035, mat({ color: 0x8a8d90, metalness: 0.9, roughness: 0.3 }), 0.3, 0.45, 0.012, vm);
      box(0.56, 0.2, 0.12, dark, -0.12, 0.25, -0.03, vm); const flap = box(0.5, 0.15, 0.01, new THREE.MeshPhysicalMaterial({ color: 0x2a2a2e, roughness: 0.2, transparent: true, opacity: 0.6 }), -0.12, 0.26, 0.03, vm); flap.rotation.x = 0.25;
      const banner = mesh(new THREE.PlaneGeometry(0.86, 0.12), new THREE.MeshBasicMaterial({ map: T.labelTex(['つめた〜い  COLD DRINKS 100円'], { w: 512, h: 72, fs: 34, bg: '#b8201c', fg: '#fff' }), color: 0xbbbbbb }), 0, 0.79, 0.012, vm); banner.castShadow = false;
      vm.traverse((c) => { c.userData.nopick = true; });
    }
    halo(0xcfe8ff, 2.2, -2.2, 1.25, 1.95, city, 0.12);
    // pipes, AC, crates
    const mPipe = mat({ color: 0x5a5d60, roughness: 0.5, metalness: 0.6 });
    cyl(0.05, 0.05, 6, mPipe, 0.6, 3, 2.9, city, 8); cyl(0.035, 0.035, 6, mPipe, 0.75, 3, 2.9, city, 8);
    box(0.8, 0.55, 0.3, mat({ color: 0xa8a8a0, roughness: 0.6 }), -0.6, 2.9, 2.8, city);
    const mCrate = mat({ color: 0xc8a020, roughness: 0.7 });
    box(0.5, 0.3, 0.36, mCrate, 4.9, 0.15, 2.6, city); box(0.5, 0.3, 0.36, mat({ color: 0x1c5a8a, roughness: 0.7 }), 4.9, 0.45, 2.62, city).rotation.y = 0.2;
  }

  // ---------- street furniture ----------
  const mPole = mat({ color: 0x4a4c50, roughness: 0.55, metalness: 0.5 });
  const mConc = mat({ color: 0x6a6862, roughness: 0.9 });
  const coneG = new THREE.ConeGeometry(3.4, 6.2, 24, 1, true); coneG.translate(0, -3.1, 0);
  const coneT = T.canvasTex(4, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const lamp = (x, z, dir, real) => {
    cyl(0.07, 0.1, 6.4, mPole, x, 3.2, z, city, 8);
    const arm = box(0.07, 0.07, 1.8, mPole, x, 6.3, z + dir * 0.9, city);
    box(0.28, 0.1, 0.6, mPole, x, 6.26, z + dir * 1.7, city);
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.1, 1.0), toneMapped: false })); bulb.position.set(x, 6.19, z + dir * 1.7); glow.add(bulb);
    halo(0xffb060, 3.8, x, 6.15, z + dir * 1.7, glow, 0.6);
    const cone = new THREE.Mesh(coneG, new THREE.MeshBasicMaterial({ map: coneT, color: 0xffa850, transparent: true, opacity: 0.085, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(x, 6.2, z + dir * 1.7); cone.userData.nopick = true; city.add(cone);
    if (real) { const s = new THREE.SpotLight(0xffb060, 120, 18, 0.8, 0.85, 1.9); s.position.set(x, 6.1, z + dir * 1.7); s.target.position.set(x, 0, z + dir * 1.9); scene.add(s, s.target); if (real > 1) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.001; } }
  };
  lamp(-7.5, -3.05, -1, 2); lamp(9.5, -3.05, -1, 1);
  for (const x of [-41, -24, 26, 43, 60, -58]) lamp(x, -3.05, -1, 0);
  for (const x of [-49, -32, -15, 1, 18, 35, 52]) lamp(x, -11.5, 1, 0);
  // utility poles + wires
  const wirePts = [];
  const poles = [-56, -38, -20, -4.8, 12, 30, 48, 66];
  poles.forEach((x, i) => {
    cyl(0.11, 0.14, 9, mConc, x, 4.5, -2.85, city, 10);
    box(0.08, 0.08, 1.8, mPole, x, 8.4, -2.85, city); box(0.08, 0.08, 1.4, mPole, x, 7.7, -2.85, city);
    if (i % 2) cyl(0.22, 0.22, 0.6, mPole, x + 0.3, 7.1, -2.85, city, 12);
    if (i > 0) for (const [dy, dz] of [[8.45, -0.8], [8.45, 0.8], [8.45, 0], [7.75, -0.6], [7.75, 0.6]]) {
      const x0 = poles[i - 1], sag = 0.5 + R() * 0.4;
      for (let k = 0; k < 10; k++) { const a = k / 10, b = (k + 1) / 10; wirePts.push(x0 + (x - x0) * a, dy - sag * 4 * a * (1 - a), -2.85 + dz, x0 + (x - x0) * b, dy - sag * 4 * b * (1 - b), -2.85 + dz); }
    }
  });
  for (const x of [-4.8, 12, 30, -20]) for (let k = 0; k < 8; k++) { const a = k / 8, b = (k + 1) / 8, f = (t) => [x + t * 2, 7.7 - 0.8 * 4 * t * (1 - t) + (7.5 - 7.7) * t, -2.85 + t * -10.6]; wirePts.push(...f(a), ...f(b)); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wirePts, 3));
  city.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x050507 })));
  // traffic signal at the crosswalk
  cyl(0.08, 0.1, 5, mPole, 10.6, 2.5, -3.05, city, 8); box(0.07, 0.07, 3, mPole, 10.6, 4.9, -4.5, city);
  box(1.1, 0.36, 0.2, mBody, 10.6, 4.9, -6, city);
  const tl = [0x1cff7a, 0xffc21c, 0xff2a1c].map((c, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); m.position.set(10.25 + i * 0.35, 4.9, -6); m.rotation.y = -Math.PI / 2; m.material.side = THREE.DoubleSide; glow.add(m); const h = halo(c, 1.4, 10.25 + i * 0.35, 4.9, -6, glow, 0.6); return [m, h]; });
  ups.push((dt, t) => { const ph = (t % 30) / 30, on = ph < 0.55 ? 0 : ph < 0.62 ? 1 : 2; tl.forEach(([m, h], i) => { m.visible = h.visible = i === on; }); });

  // ---------- mirror (wet-street reflections) ----------
  const mirror = glow.clone(true); mirror.scale.y = -1; mirror.position.y = -0.24;
  mirror.traverse((o) => { o.renderOrder = -10; o.userData.nopick = true; }); city.add(mirror);

  // ---------- cars ----------
  const cars = [];
  const mGlass = mat({ color: 0x0a0e14, roughness: 0.1, metalness: 0.8 }), mTire = mat({ color: 0x0c0c0d, roughness: 0.9 });
  const beamG = new THREE.ConeGeometry(1.3, 9, 16, 1, true); beamG.rotateZ(Math.PI / 2); beamG.translate(4.5, 0, 0);
  const mkCar = (color, taxi) => {
    const c = new THREE.Group(), mp = mat({ color, roughness: 0.28, metalness: 0.55 });
    box(4.3, 0.55, 1.68, mp, 0, 0.55, 0, c); box(2.3, 0.5, 1.5, mp, -0.25, 1.06, 0, c); box(2.34, 0.36, 1.52, mGlass, -0.25, 1.06, 0, c); box(2.1, 0.36, 1.54, mp, -0.25, 1.06, 0, c).scale.set(0.05, 1, 1);
    box(4.36, 0.14, 1.72, mat({ color: 0x9a9da0, roughness: 0.25, metalness: 0.9 }), 0, 0.33, 0, c);
    for (const [x, z] of [[1.35, 0.8], [1.35, -0.8], [-1.35, 0.8], [-1.35, -0.8]]) { const w = cyl(0.31, 0.31, 0.2, mTire, x, 0.31, z, c, 14); w.rotation.x = Math.PI / 2; cyl(0.17, 0.17, 0.21, mat({ color: 0x9a9da0, metalness: 0.9, roughness: 0.3 }), x, 0.31, z, c, 10).rotation.x = Math.PI / 2; }
    for (const z of [-0.6, 0.6]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.8, 2.2), toneMapped: false })); hl.position.set(2.16, 0.62, z); c.add(hl);
      halo(0xfff0c8, 2.2, 2.25, 0.62, z, c, 0.8);
      const tlm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.34), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.1, 0.05), toneMapped: false })); tlm.position.set(-2.16, 0.64, z); c.add(tlm);
      halo(0xff2010, 1.1, -2.25, 0.64, z, c, 0.6);
    }
    const beam = new THREE.Mesh(beamG, new THREE.MeshBasicMaterial({ map: coneT, color: 0xfff0d0, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.set(2.1, 0.6, 0); beam.rotation.z = -0.03; c.add(beam);
    // light pool + streak on the wet road
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.2), new THREE.MeshBasicMaterial({ map: glowMap, color: 0xfff0c8, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(5.5, 0.012, 0); c.add(pool);
    const tail = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.8), new THREE.MeshBasicMaterial({ map: glowMap, color: 0xff2010, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })); tail.rotation.x = -Math.PI / 2; tail.position.set(-3.6, 0.012, 0); c.add(tail);
    if (taxi) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.6, 0.4), toneMapped: false })); r.position.set(-0.2, 1.4, 0); c.add(r); }
    c.traverse((o) => { o.userData.nopick = true; });
    city.add(c); return c;
  };
  [[0xb8b8b0, 0], [0x8a1818, 0], [0xe8c020, 1], [0x1c2c4a, 0], [0x2a2a2c, 0]].forEach(([col, taxi], i) => {
    const c = mkCar(col, taxi), dir = i % 2 ? -1 : 1;
    c.position.set(-70 + i * 31, -0.12, dir > 0 ? -9.3 : -5.3); c.rotation.y = dir > 0 ? 0 : Math.PI;
    cars.push({ c, dir, v: 8 + R() * 4, wait: 0 });
  });
  ups.push((dt) => cars.forEach((k) => { k.c.position.x += k.dir * k.v * dt; if (Math.abs(k.c.position.x) > 78) { k.c.position.x = -78 * k.dir; k.v = 7 + Math.random() * 6; } }));

  // ---------- pedestrians ----------
  const peds = [];
  for (let i = 0; i < 7; i++) {
    const p = makePerson(500 + i * 7), far = i < 4, dir = i % 2 ? 1 : -1;
    p.root.position.set(-40 + R() * 80, 0, far ? -12 - R() * 1.2 : -2.4 - R() * 0.5); p.root.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; p.pose = 'walk';
    p.root.traverse((o) => { o.userData.nopick = true; });
    const v = 1.0 + R() * 0.5; p.speed = v; city.add(p.root); peds.push({ p, dir, v });
  }
  ups.push((dt, t) => peds.forEach((k) => { k.p.root.position.x += k.dir * k.v * dt; if (Math.abs(k.p.root.position.x) > 45) k.p.root.position.x = -45 * k.dir; k.p.update(dt, t * (k.v / 1.2)); }));

  fronts.seats.slice(0, 7).forEach((st, i) => { const p = makePerson(900 + i); p.pose = 'sit'; p.root.position.copy(st.p); p.root.rotation.y = st.ry; p.root.traverse((o) => { o.userData.nopick = true; }); city.add(p.root); ups.push((dt, t) => p.update(dt, t)); });

  // ---------- rain ----------
  const nR = 1400, rp = new Float32Array(nR * 6), rs = new Float32Array(nR);
  for (let i = 0; i < nR; i++) {
    let x, z; do { x = (R() - 0.5) * 30; z = -16 + R() * 20; } while (Math.abs(x) < 1.85 && z > -1.9 && z < 2.25);
    const y = R() * 12; rs[i] = 9 + R() * 5;
    rp.set([x, y, z, x + 0.02, y - 0.28, z], i * 6);
  }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaab8e0, transparent: true, opacity: 0.2, depthWrite: false })); rain.frustumCulled = false; rain.userData.nopick = true; city.add(rain);
  ups.push((dt) => { for (let i = 0; i < nR; i++) { let y = rp[i * 6 + 1] - rs[i] * dt; if (y < 0) y += 12; rp[i * 6 + 1] = y; rp[i * 6 + 4] = y - 0.28; } rg.attributes.position.needsUpdate = true; });
  // drifting ground mist catching the street light
  const mistM = new THREE.SpriteMaterial({ map: T.smokeTex(), color: 0x6a5a8a, transparent: true, opacity: 0.1, depthWrite: false });
  for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(mistM); s.userData.nopick = true; s.position.set(-36 + R() * 72, 0.8 + R() * 1.8, -4.5 - R() * 6); s.scale.set(9 + R() * 6, 3 + R() * 2, 1); city.add(s); ups.push((dt) => { s.position.x += dt * 0.35; if (s.position.x > 38) s.position.x = -38; }); }

  ups.push((dt, t) => flickers.forEach(([s, h, k], i) => { const on = k < 0.25 ? Math.sin(t * 0.4 + i * 3) > -0.2 && Math.sin(t * 31 + i * 9) + Math.sin(t * 11.3 + i) > -1.0 : Math.sin(t * 23 + i * 9) + Math.sin(t * 7.3 + i) > -1.5; s.visible = on; h.visible = on; }));
  return { group: city, glow, update(dt, t) { for (const u of ups) u(dt, t); }, halo, rain, cars, glowMap };
}
