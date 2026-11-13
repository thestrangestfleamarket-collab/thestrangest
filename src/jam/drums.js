// STADIUM JAM's drum kit: the model, its cymbals' swing, and the sticks' strikes
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PADS } from './audio.js';

// name, centre of playing surface (x,y,z), tilt (rx, rz), radius, shell depth (0 = cymbal)
const LAYOUT = {
  kick: [0.05, 0.3, -0.95, Math.PI / 2, 0, 0.28, 0.42],
  snare: [-0.12, 0.66, -0.42, 0.08, 0, 0.178, 0.14],
  hat: [-0.52, 0.86, -0.48, 0.06, -0.05, 0.18, 0],
  tom1: [-0.14, 0.88, -0.8, 0.45, 0, 0.13, 0.2],
  tom2: [0.2, 0.88, -0.8, 0.45, 0, 0.15, 0.22],
  floor: [0.5, 0.62, -0.3, 0.05, 0.08, 0.2, 0.38],
  crash: [-0.5, 1.28, -0.93, 0.3, -0.15, 0.23, 0],
  ride: [0.62, 1.08, -0.72, 0.35, 0.25, 0.26, 0],
};

export function buildStick(T) {
  const g = new THREE.CylinderGeometry(0.004, 0.0075, 0.4, 10);
  g.rotateX(-Math.PI / 2); // tip towards -Z
  g.translate(0, 0, -0.11);
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial(T ? { ...T.hickory, roughness: 1, bumpScale: 0.3 } : { color: 0xd9b77c, roughness: 0.6 }));
}
export const STICK_TIP = new THREE.Vector3(0, 0, -0.31);

export function buildKit(color = 0x9a1424, T = null) {
  const group = new THREE.Group();
  const shellMat = new THREE.MeshPhysicalMaterial({ color, metalness: 0.55, roughness: T ? 1 : 0.22, clearcoat: 1, clearcoatRoughness: 0.06, ...(T ? T.sparkle : {}), bumpScale: 0.15 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe3ea, metalness: 1, roughness: 0.12 });
  const brass = new THREE.MeshStandardMaterial(T
    ? { ...T.cymbal, metalness: 1, roughness: 1, bumpScale: 0.5, side: THREE.DoubleSide }
    : { color: 0xcfa552, metalness: 1, roughness: 0.3, side: THREE.DoubleSide });
  const lugGeo = new THREE.BoxGeometry(0.014, 0.05, 0.012);
  const hardware = [];
  const rod = (x, y0, y1, z, r = 0.011) => {
    const g = new THREE.CylinderGeometry(r, r, y1 - y0, 8);
    g.translate(x, (y0 + y1) / 2, z);
    hardware.push(g);
  };
  const tripod = (x, z, yTop) => {
    rod(x, 0.02, yTop, z);
    for (let i = 0; i < 3; i++) {
      const g = new THREE.CylinderGeometry(0.008, 0.008, 0.36, 6);
      g.translate(0, 0.18, 0);
      g.rotateZ(1.15);
      g.rotateY((i * Math.PI * 2) / 3 + 0.5);
      g.translate(x, 0.3, z);
      hardware.push(g);
    }
  };

  const cymbalGeo = (r) => new THREE.LatheGeometry(
    [new THREE.Vector2(0.004, 0.034), new THREE.Vector2(0.03, 0.03), new THREE.Vector2(0.055, 0.012), new THREE.Vector2(r * 0.6, 0.006), new THREE.Vector2(r, 0)], 40);

  const pads = PADS.map((name) => {
    const [x, y, z, rx, rz, r, depth] = LAYOUT[name];
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.set(rx, 0, rz);
    const pad = { name, group: g, radius: r, rx, rz, cymbal: depth === 0, flash: 0, ax: 0, az: 0, vx: 0, vz: 0, wc: new THREE.Vector3(), wn: new THREE.Vector3() };
    if (depth) {
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, 40, 1, true), shellMat);
      shell.position.y = -depth / 2;
      const headMat = new THREE.MeshStandardMaterial({ color: 0xc4c4c4, roughness: 1, emissive: 0xfff2cc, emissiveIntensity: 0, ...(T ? T.head : { color: 0xe9e5d8 }), bumpScale: 0.2 });
      const head = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.985, r * 0.985, 0.004, 40), headMat);
      head.position.y = -0.002;
      const reso = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.985, r * 0.985, 0.004, 40),
        new THREE.MeshStandardMaterial({ color: name === 'kick' ? 0x0c0c0e : 0xe9e5d8, roughness: 0.6 }));
      reso.position.y = -depth + 0.002;
      g.add(shell, head, reso);
      for (const hy of [0.004, -depth - 0.004]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(r + 0.004, 0.007, 8, 40), chrome);
        hoop.rotation.x = Math.PI / 2;
        hoop.position.y = hy;
        g.add(hoop);
      }
      const nl = Math.max(6, Math.round(r * 40)); // tension lugs around the shell
      for (let k = 0; k < nl; k++) {
        const a = (k / nl) * Math.PI * 2;
        const lug = new THREE.Mesh(lugGeo, chrome);
        lug.position.set(Math.cos(a) * (r + 0.006), -depth / 2, Math.sin(a) * (r + 0.006));
        lug.rotation.y = -a + Math.PI / 2;
        g.add(lug);
      }
      pad.head = headMat;
    } else {
      const c = new THREE.Mesh(cymbalGeo(r), brass);
      c.position.y = -0.006;
      g.add(c);
      if (name === 'hat') {
        const bottom = new THREE.Mesh(cymbalGeo(r), brass);
        bottom.scale.y = -1;
        bottom.position.y = -0.022;
        g.add(bottom);
        pad.top = c;
      }
    }
    group.add(g);
    return pad;
  });

  // stands and hardware
  tripod(-0.52, -0.48, 0.9);
  tripod(-0.5, -0.93, 1.3);
  tripod(0.62, -0.72, 1.1);
  tripod(-0.12, -0.42, 0.5);
  rod(-0.02, 0.56, 0.78, -0.8);
  rod(0.09, 0.56, 0.78, -0.8);
  for (const [dx, dz] of [[-0.2, 0.05], [0.2, 0.05], [0, -0.2]]) rod(0.5 + dx, 0, 0.45, -0.3 + dz, 0.007);
  for (const dx of [-0.3, 0.3]) rod(0.05 + dx, 0, 0.25, -1.3, 0.009);
  rod(0, 0.02, 0.5, 0.05, 0.018); // throne post
  group.add(new THREE.Mesh(mergeGeometries(hardware), chrome));
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.8 }));
  seat.position.set(0, 0.52, 0.05);
  group.add(seat);
  // kick pedal beater
  const beater = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 6), chrome);
  shaft.position.y = 0.1;
  const felt = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.9 }));
  felt.position.y = 0.2;
  beater.add(shaft, felt);
  beater.position.set(0.05, 0.1, -0.86);
  group.add(beater);

  const kit = {
    group, pads, hatOpen: false,
    updateWorld() {
      group.updateMatrixWorld(true);
      for (const p of pads) {
        p.wc.setFromMatrixPosition(p.group.matrixWorld);
        p.wn.set(0, 1, 0).transformDirection(p.group.matrixWorld);
      }
    },
    // ox, oz: where on the pad it was struck (pad-local metres). A cymbal is a damped
    // pendulum on its stand, so an edge hit kicks it harder than one near the bell.
    hit(i, vel, ox, oz) {
      const p = pads[i];
      if (!p) return;
      p.flash = Math.max(p.flash, 0.3 + vel * 0.7);
      if (p.cymbal) {
        if (ox === undefined) { const a = Math.random() * 6.283; ox = Math.cos(a) * p.radius * 0.7; oz = Math.sin(a) * p.radius * 0.7; }
        const k = (1.5 + vel * 5) / p.radius * (i === 2 ? 0.25 : 1);
        p.vx += oz * k;
        p.vz -= ox * k;
      }
    },
    update(dt, time) {
      for (const p of pads) {
        if (p.head) p.head.emissiveIntensity = p.flash * 0.08;
        p.flash = Math.max(0, p.flash - dt * 6);
        if (p.cymbal) { // spring back to rest, lightly damped
          const K = 130, C = 1.6;
          p.vx += (-K * p.ax - C * p.vx) * dt; p.ax += p.vx * dt;
          p.vz += (-K * p.az - C * p.vz) * dt; p.az += p.vz * dt;
          p.ax = Math.max(-0.5, Math.min(0.5, p.ax)); p.az = Math.max(-0.5, Math.min(0.5, p.az));
          p.group.rotation.x = p.rx + p.ax;
          p.group.rotation.z = p.rz + p.az;
        }
      }
      const hat = pads[2];
      hat.top.position.y = -0.006 + (kit.hatOpen ? 0.022 : 0);
      beater.rotation.x = -0.5 - pads[0].flash * 0.5;
    },
  };
  return kit;
}

// Detects stick tips passing down through the pad surfaces.
export class DrumPlayer {
  constructor(kit) {
    this.kit = kit;
    this.prev = { left: null, right: null };
    this.cool = {};
    this.tmp = new THREE.Vector3();
    this.off = new THREE.Vector3();
    this.q = new THREE.Quaternion();
  }

  // hands: { left: {active, tip: Vector3}, right: ... }; emit(padIndex, velocity, hand)
  update(hands, dt, now, emit) {
    for (const side of ['left', 'right']) {
      const h = hands[side];
      if (!h.active) { this.prev[side] = null; continue; }
      const prev = this.prev[side];
      if (prev && dt > 0) {
        for (let i = 1; i < this.kit.pads.length; i++) { // 0 = kick, played by pedal
          const p = this.kit.pads[i];
          const d0 = this.tmp.copy(prev).sub(p.wc).dot(p.wn);
          const d1 = this.tmp.copy(h.tip).sub(p.wc).dot(p.wn);
          if (d0 > 0 && d1 <= 0 && d0 < 0.35) {
            const f = d0 / (d0 - d1);
            this.tmp.copy(prev).lerp(h.tip, f).sub(p.wc);
            if (this.tmp.length() > p.radius * 1.1) continue;
            this.off.copy(this.tmp).applyQuaternion(this.q.copy(p.group.getWorldQuaternion(this.q)).invert());
            const key = side + i;
            if (now - (this.cool[key] || 0) < 0.07) continue;
            this.cool[key] = now;
            const speed = (d0 - d1) / dt;
            emit(i, Math.min(1, Math.max(0.12, speed / 4.5)), side, this.off.x, this.off.z);
          }
        }
        this.prev[side].copy(h.tip);
      } else {
        this.prev[side] = h.tip.clone();
      }
    }
  }
}
