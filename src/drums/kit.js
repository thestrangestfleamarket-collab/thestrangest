// THE GARAGE's drum kit: the model, each piece's playing surface as the sticks test it, and how the pieces move when struck
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// name, kind, centre of the playing surface, tilt (rx toward the player, rz), radius, shell depth
export const LAYOUT = [
  ['kick', 'drum', [0.2, 0.29, -0.92], Math.PI / 2, 0, 0.28, 0.42],
  ['snare', 'drum', [-0.08, 0.66, -0.38], 0.08, 0, 0.178, 0.14],
  ['hat', 'cymbal', [-0.5, 0.87, -0.44], 0.06, -0.04, 0.178, 0],
  ['tom1', 'drum', [0, 0.89, -0.78], 0.42, 0, 0.127, 0.2],
  ['tom2', 'drum', [0.37, 0.89, -0.78], 0.42, 0, 0.152, 0.23],
  ['floor', 'drum', [0.6, 0.62, -0.22], 0.05, 0.08, 0.203, 0.38],
  ['crash1', 'cymbal', [-0.42, 1.27, -0.88], 0.3, -0.14, 0.23, 0],
  ['crash2', 'cymbal', [0.5, 1.3, -0.96], 0.32, 0.12, 0.23, 0],
  ['ride', 'cymbal', [0.78, 1.02, -0.55], 0.3, 0.26, 0.255, 0],
];
export const SEAT = new THREE.Vector3(0, 0.56, 0.08);
export const EYES = new THREE.Vector3(0, 1.24, 0.1);
export const FEET = [new THREE.Vector3(-0.5, 0.1, -0.18), new THREE.Vector3(0.2, 0.1, -0.6)];
export const HOOP = 0.012; // a hoop's top above its head
export const HAT_GAP = 0.02;

// a cymbal's top above its edge at radius rho (the lathe's own profile, so the sticks land on what is drawn)
const PROFILE = (r) => [[0.004, 0.036], [0.03, 0.033], [0.2 * r + 0.012, 0.013], [0.6 * r, 0.007], [r, 0]];
export function cymbalHeight(r, rho) {
  const P = PROFILE(r);
  if (rho <= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (rho <= P[i][0]) { const [a, h] = P[i - 1], [b, k] = P[i]; return h + (k - h) * (rho - a) / (b - a); }
  return 0;
}

export function buildKit(T, low) {
  const group = new THREE.Group();
  const SEG = low ? 24 : 56;
  const M = {
    shell: new THREE.MeshStandardMaterial({ map: T.shell.map, bumpMap: T.shell.bumpMap, bumpScale: 0.05, color: 0xb4583a, roughness: 0.42, metalness: 0 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xc3c8d0, metalness: 1, roughness: 0.2 }),
    head: new THREE.MeshStandardMaterial({ ...T.head, color: 0xf2f1ec, roughness: 1, bumpScale: 0.15 }),
    clear: new THREE.MeshStandardMaterial({ color: 0xe8e4d6, roughness: 0.45 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.55 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.95 }),
    maple: new THREE.MeshStandardMaterial({ ...T.maple, roughness: 1, bumpScale: 0.1 }),
    brass: new THREE.MeshStandardMaterial({ ...T.cymbal, color: 0xfff0d2, metalness: 1, roughness: 1, bumpScale: 0.35, side: THREE.DoubleSide }),
    felt: new THREE.MeshStandardMaterial({ color: 0xd9d2bc, roughness: 1 }),
    vinyl: new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.62 }),
  };
  // everything that never moves is gathered by material and drawn as one mesh each
  const still = {};
  const put = (mat, g, m4) => { if (m4) g.applyMatrix4(m4); (still[mat] ||= []).push(g); };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
  const rod = (mat, a, b, r = 0.011, seg = 10) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    put(mat, g, m4.compose(A.clone().add(B).multiplyScalar(0.5), q.setFromUnitVectors(UP, d.normalize()), new THREE.Vector3(1, 1, 1)));
  };
  const tripod = (x, z, yTop, spread = 0.3, turn = 0.5) => {
    rod('chrome', [x, 0.03, z], [x, yTop * 0.62, z], 0.014);
    rod('chrome', [x, yTop * 0.55, z], [x, yTop, z], 0.0105);
    put('black', new THREE.CylinderGeometry(0.019, 0.019, 0.03, 12).translate(x, yTop * 0.62, z));
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + turn, fx = x + Math.cos(a) * spread, fz = z + Math.sin(a) * spread;
      rod('chrome', [x, 0.34, z], [fx, 0.02, fz], 0.009);
      rod('chrome', [x, 0.12, z], [x + Math.cos(a) * spread * 0.55, 0.19, z + Math.sin(a) * spread * 0.55], 0.005);
      put('rubber', new THREE.SphereGeometry(0.018, 10, 8).translate(fx, 0.018, fz));
    }
  };

  const cymbalGeo = (r) => new THREE.LatheGeometry(PROFILE(r).map(([x, y]) => new THREE.Vector2(x, y)), SEG);

  const pieces = LAYOUT.map(([name, kind, pos, rx, rz, r, depth]) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.set(rx, 0, rz);
    const p = { name, kind, group: g, radius: r, depth, rx, rz, ax: 0, az: 0, vx: 0, vz: 0, grab: 0, inv: new THREE.Matrix4(), wc: new THREE.Vector3(), wn: new THREE.Vector3() };
    if (kind === 'drum') {
      const kick = name === 'kick', own = {}, add = (mat, geo) => (own[mat] ||= []).push(geo);
      add('shell', new THREE.CylinderGeometry(r, r, depth - 0.006, SEG, 1, true).translate(0, -depth / 2, 0));
      add('head', new THREE.CylinderGeometry(r * 0.992, r * 0.992, 0.003, SEG).translate(0, -0.0015, 0));
      add(kick ? 'black' : 'clear', new THREE.CylinderGeometry(r * 0.992, r * 0.992, 0.003, SEG).translate(0, -depth + 0.0015, 0));
      for (const hy of [0.006, -depth - 0.006]) {
        if (kick) add('maple', new THREE.CylinderGeometry(r + 0.011, r + 0.011, 0.038, SEG, 1, true).translate(0, hy < 0 ? hy + 0.012 : hy - 0.012, 0));
        add(kick ? 'maple' : 'chrome', new THREE.TorusGeometry(r + (kick ? 0.011 : 0.005), kick ? 0.006 : 0.0055, 8, SEG).rotateX(Math.PI / 2).translate(0, hy, 0));
      }
      const nl = kick ? 8 : r > 0.17 ? 8 : 6;
      for (let k = 0; k < nl; k++) {
        const a = ((k + 0.5) / nl) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), R = r + 0.008;
        const turn = new THREE.Matrix4().makeRotationY(-a + Math.PI / 2);
        for (const ly of depth > 0.3 ? [-0.09, -depth + 0.09] : [-depth / 2]) {
          add('chrome', new THREE.CylinderGeometry(0.008, 0.008, depth > 0.3 ? 0.06 : Math.min(0.07, depth * 0.42), 8).translate(c * (r + 0.006), ly, s * (r + 0.006)));
        }
        add('chrome', new THREE.CylinderGeometry(0.0024, 0.0024, depth + 0.012, 6).translate(c * (r + 0.0085), -depth / 2, s * (r + 0.0085)));
      }
      if (name === 'snare') {
        add('chrome', new THREE.BoxGeometry(0.03, 0.09, 0.05).translate(r + 0.02, -depth / 2, 0));
        add('chrome', new THREE.BoxGeometry(r * 1.5, 0.004, 0.06).translate(0, -depth - 0.004, 0));
      }
      for (const k in own) { const m = new THREE.Mesh(mergeGeometries(own[k]), M[k]); m.castShadow = m.receiveShadow = true; g.add(m); }
    } else {
      const c = new THREE.Mesh(cymbalGeo(r), M.brass);
      c.castShadow = c.receiveShadow = true;
      g.add(c);
      p.top = c;
      const nut = new THREE.Mesh(mergeGeometries([new THREE.CylinderGeometry(0.016, 0.016, 0.012, 12).translate(0, 0.044, 0), new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6).translate(0, 0.05, 0)]), M.felt);
      g.add(nut);
      if (name === 'hat') {
        const bottom = new THREE.Mesh(cymbalGeo(r), M.brass);
        bottom.scale.y = -1;
        bottom.position.y = -0.004;
        bottom.castShadow = true;
        g.add(bottom);
        p.bottom = bottom;
      }
    }
    group.add(g);
    return p;
  });
  const P = Object.fromEntries(pieces.map((p) => [p.name, p]));
  const at = (n) => LAYOUT.find((l) => l[0] === n)[2];

  // stands
  const [hx, , hz] = at('hat');
  tripod(hx, hz, 0.84, 0.27, 2.6);
  rod('chrome', [hx, 0.8, hz], [hx, 0.98, hz], 0.004);
  const snare = at('snare');
  tripod(snare[0], snare[2], 0.46, 0.25, 1.6);
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; rod('chrome', [snare[0], 0.44, snare[2]], [snare[0] + Math.cos(a) * 0.17, 0.52, snare[2] + Math.sin(a) * 0.17], 0.007); }
  for (const n of ['crash1', 'crash2', 'ride']) {
    const [x, y, z] = at(n), bx = x * 1.28, bz = z - (n === 'ride' ? 0.22 : 0.16), top = y - 0.16;
    tripod(bx, bz, top, 0.3, n === 'crash1' ? 0.2 : 1.2);
    rod('chrome', [bx, top, bz], [x, y - 0.03, z], 0.008);
    rod('chrome', [x, y - 0.03, z], [x, y + 0.02, z], 0.004);
    put('black', new THREE.SphereGeometry(0.02, 10, 8).translate(bx, top, bz));
  }
  // the rack toms hang from a post on the kick; the floor tom stands on three legs
  const kick = at('kick'), postX = (at('tom1')[0] + at('tom2')[0]) / 2, postZ = kick[2] - 0.16;
  rod('chrome', [postX, 0.56, postZ], [postX, 0.78, postZ], 0.014);
  put('chrome', new THREE.BoxGeometry(0.09, 0.03, 0.06).translate(postX, 0.57, postZ));
  for (const n of ['tom1', 'tom2']) { const t = at(n); rod('chrome', [postX, 0.77, postZ], [t[0], t[1] - 0.12, t[2] - 0.07], 0.009); }
  const fl = at('floor');
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 1.1, x = fl[0] + Math.cos(a) * 0.225, z = fl[2] + Math.sin(a) * 0.225;
    rod('chrome', [x, 0.5, z], [x, 0.06, z], 0.006);
    rod('chrome', [x, 0.06, z], [x + Math.cos(a) * 0.04, 0.012, z + Math.sin(a) * 0.04], 0.006);
    put('rubber', new THREE.SphereGeometry(0.014, 8, 6).translate(x + Math.cos(a) * 0.04, 0.012, z + Math.sin(a) * 0.04));
  }
  for (const s of [-1, 1]) rod('chrome', [kick[0] + s * 0.27, 0.2, kick[2] - 0.36], [kick[0] + s * 0.4, 0.01, kick[2] - 0.5], 0.008);
  // the throne
  rod('chrome', [SEAT.x, 0.03, SEAT.z + 0.02], [SEAT.x, SEAT.y - 0.07, SEAT.z + 0.02], 0.017);
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.52; rod('chrome', [SEAT.x, 0.3, SEAT.z + 0.02], [SEAT.x + Math.cos(a) * 0.27, 0.02, SEAT.z + 0.02 + Math.sin(a) * 0.27], 0.01); }
  put('vinyl', new THREE.CylinderGeometry(0.165, 0.155, 0.075, 28).translate(SEAT.x, SEAT.y - 0.04, SEAT.z + 0.02));
  put('vinyl', new THREE.TorusGeometry(0.158, 0.02, 8, 28).rotateX(Math.PI / 2).translate(SEAT.x, SEAT.y - 0.02, SEAT.z + 0.02));
  // the two pedals' plates
  put('black', new THREE.BoxGeometry(0.1, 0.008, 0.4).translate(kick[0], 0.006, kick[2] + 0.25));
  put('black', new THREE.BoxGeometry(0.1, 0.008, 0.3).translate(hx, 0.006, hz + 0.24));
  for (const s of [-1, 1]) rod('chrome', [kick[0] + s * 0.045, 0.01, kick[2] + 0.1], [kick[0] + s * 0.045, 0.16, kick[2] + 0.1], 0.006);
  rod('chrome', [kick[0] - 0.05, 0.16, kick[2] + 0.1], [kick[0] + 0.05, 0.16, kick[2] + 0.1], 0.005);

  for (const k in still) {
    const m = new THREE.Mesh(mergeGeometries(still[k]), M[k]);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }

  // what moves: the kick's beater and both footboards
  const beater = new THREE.Group();
  beater.add(new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.2, 6).translate(0, 0.1, 0), M.chrome));
  const mallet = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 14).rotateX(Math.PI / 2).translate(0, 0.2, 0), M.felt);
  mallet.castShadow = true;
  beater.add(mallet);
  beater.position.set(kick[0], 0.16, kick[2] + 0.1);
  group.add(beater);
  const board = (x, z, len) => {
    const b = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.01, len).translate(0, 0, -len / 2), M.chrome);
    m.castShadow = true;
    b.add(m);
    b.position.set(x, 0.022, z);
    group.add(b);
    return b;
  };
  const kickBoard = board(kick[0], kick[2] + 0.44, 0.28), hatBoard = board(hx, hz + 0.38, 0.26);
  const REST = 0.45, STRIKE = -Math.asin(0.076 / 0.2);

  const kit = {
    group, pieces, P, M, hatOpen: 0, pedal: 0, beat: 0,
    // world to piece space, refreshed once a frame after the cymbals have swung
    updateWorld() {
      group.updateMatrixWorld(true);
      for (const p of pieces) {
        const o = p.name === 'hat' ? p.top : p.group;
        p.inv.copy(o.matrixWorld).invert();
        p.wc.setFromMatrixPosition(o.matrixWorld);
        p.wn.set(0, 1, 0).transformDirection(o.matrixWorld);
      }
    },
    // the surface's height in the piece's own space at radius rho
    height(p, rho) { return p.kind === 'cymbal' ? cymbalHeight(p.radius, rho) : 0; },
    // where it was struck in the piece's own space: a cymbal is pushed over on its stand, a tom shakes on its mount
    strike(name, vel, lx = 0, lz = 0) {
      const p = P[name];
      if (!p) return;
      if (name === 'kick') { kit.beat = 1; return; }
      if (p.kind === 'cymbal') {
        if (!lx && !lz) { lz = p.radius * 0.7; }
        const k = (1.2 + vel * 5.5) / p.radius * (name === 'hat' ? 0.1 + 0.5 * kit.hatOpen : 1);
        p.vx += lz * k;
        p.vz -= lx * k;
      } else {
        const k = (name === 'snare' || name === 'floor' ? 0.25 : 1.1) * vel / p.radius;
        p.vx += lz * k;
        p.vz -= lx * k;
      }
    },
    // the kick's pedal: 0 at rest .. 1 the beater on the head
    setPedal(v) { kit.pedal = v; },
    setHat(open) { kit.hatOpen = open; },
    update(dt) {
      dt = Math.min(dt, 0.05);
      for (const p of pieces) {
        if (p.name === 'kick') continue;
        const cym = p.kind === 'cymbal', K = cym ? 120 : 2600, C = (cym ? 1.5 : 26) + p.grab * 40, lim = cym ? 0.5 : 0.02;
        for (let s = 0; s < 2; s++) {
          const h = dt / 2;
          p.vx += (-K * p.ax - C * p.vx) * h; p.ax += p.vx * h;
          p.vz += (-K * p.az - C * p.vz) * h; p.az += p.vz * h;
        }
        p.ax = Math.max(-lim, Math.min(lim, p.ax)); p.az = Math.max(-lim, Math.min(lim, p.az));
        if (p.name === 'hat') {
          p.top.rotation.set(p.ax, 0, p.az);
          p.top.position.y = kit.hatOpen * HAT_GAP;
        } else p.group.rotation.set(p.rx + p.ax, 0, p.rz + p.az);
        p.grab = 0;
      }
      kit.beat = Math.max(0, kit.beat - dt * 9);
      const k = Math.max(kit.pedal, kit.beat);
      beater.rotation.x = REST + (STRIKE - REST) * k;
      kickBoard.rotation.x = 0.3 * (1 - k) + 0.04;
      hatBoard.rotation.x = 0.06 + 0.24 * kit.hatOpen;
      kit.foot = [0.05 * kit.hatOpen, 0.06 * (1 - k)];
    },
  };
  kit.update(0);
  kit.updateWorld();
  return kit;
}
