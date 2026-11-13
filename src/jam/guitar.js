// STADIUM JAM's guitar: the model, fretting and strumming (its frame: +X up the neck, +Y across the strings with low E on top, +Z out of the face)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const SCALE = 0.648, BRIDGE_X = -0.03, NUT_X = BRIDGE_X + SCALE;
const TUNING = [40, 45, 50, 55, 59, 64];
const SHAPES = {
  major: [0, 2, 2, 1, 0, 0],
  minor: [0, 2, 2, 0, 0, 0],
  power: [0, 2, 2, -1, -1, -1],
};
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAX_FRET = 15;
const fretX = (n) => NUT_X - SCALE * (1 - 2 ** (-n / 12));
const STRING_VIS = 0.0105, STRING_HIT = 0.017;

export function chordName(fret, shape) {
  return NOTE_NAMES[(40 + fret) % 12] + (shape === 'minor' ? 'm' : shape === 'power' ? '5' : '');
}

export function buildGuitar(color = 0xb01020, T = null) {
  const group = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0.19, 0.03);
  s.quadraticCurveTo(0.14, 0.04, 0.16, 0.08);
  s.quadraticCurveTo(0.2, 0.12, 0.26, 0.115);
  s.quadraticCurveTo(0.28, 0.135, 0.24, 0.145);
  s.bezierCurveTo(0.15, 0.17, 0.08, 0.12, 0.0, 0.135);
  s.bezierCurveTo(-0.1, 0.155, -0.2, 0.17, -0.245, 0.09);
  s.bezierCurveTo(-0.275, 0.03, -0.275, -0.04, -0.245, -0.1);
  s.bezierCurveTo(-0.2, -0.185, -0.08, -0.18, 0.0, -0.15);
  s.bezierCurveTo(0.07, -0.125, 0.12, -0.15, 0.2, -0.135);
  s.quadraticCurveTo(0.235, -0.125, 0.22, -0.105);
  s.quadraticCurveTo(0.15, -0.085, 0.145, -0.06);
  s.quadraticCurveTo(0.14, -0.035, 0.19, -0.03);
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 0.034, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 20 });
  bodyGeo.translate(0, 0, -0.04);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color, roughness: T ? 1 : 0.25, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.04, ...(T ? T.sparkle : {}), bumpScale: 0.05 }));
  group.add(body);

  const maple = new THREE.MeshStandardMaterial(T ? { ...T.maple, roughness: 1, bumpScale: 0.2 } : { color: 0xc9a36b, roughness: 0.45 });
  const rosewood = new THREE.MeshStandardMaterial(T ? { ...T.rosewood, roughness: 1, bumpScale: 0.3 } : { color: 0x24150e, roughness: 0.6 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe2e6ec, metalness: 1, roughness: 0.15 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.4 });
  const neckLen = NUT_X - 0.15;
  const neck = new THREE.Mesh(new THREE.BoxGeometry(neckLen, 0.05, 0.02), maple);
  neck.position.set(0.15 + neckLen / 2, 0, -0.002);
  const board = new THREE.Mesh(new THREE.BoxGeometry(neckLen, 0.052, 0.005), rosewood);
  board.position.set(0.15 + neckLen / 2, 0, 0.0105);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.068, 0.014), maple);
  head.position.set(NUT_X + 0.085, -0.006, -0.003);
  group.add(neck, board, head);

  const frets = [], dots = [], metal = [];
  for (let n = 0; n <= 20; n++) {
    const g = new THREE.BoxGeometry(n === 0 ? 0.004 : 0.0022, 0.052, 0.0025);
    g.translate(fretX(n), 0, 0.0138);
    frets.push(g);
  }
  for (const n of [3, 5, 7, 9, 12, 15, 17]) {
    for (const y of n === 12 ? [-0.012, 0.012] : [0]) {
      const g = new THREE.CylinderGeometry(0.003, 0.003, 0.0006, 10);
      g.rotateX(Math.PI / 2);
      g.translate((fretX(n) + fretX(n - 1)) / 2, y, 0.0132);
      dots.push(g);
    }
  }
  group.add(new THREE.Mesh(mergeGeometries(frets), chrome));
  group.add(new THREE.Mesh(mergeGeometries(dots), new THREE.MeshStandardMaterial({ color: 0xeeeadf, roughness: 0.3 })));
  const bridge = new THREE.BoxGeometry(0.03, 0.078, 0.012);
  bridge.translate(BRIDGE_X - 0.008, 0, 0.006);
  metal.push(bridge);
  for (let i = 0; i < 6; i++) {
    const g = new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8);
    g.translate(NUT_X + 0.03 + i * 0.024, 0.034, -0.003);
    metal.push(g);
  }
  for (const [x, y] of [[-0.15, -0.085], [-0.1, -0.118]]) {
    const g = new THREE.CylinderGeometry(0.012, 0.013, 0.014, 16);
    g.rotateX(Math.PI / 2);
    g.translate(x, y, 0.007);
    metal.push(g);
  }
  group.add(new THREE.Mesh(mergeGeometries(metal), chrome));
  for (const x of [0.015, 0.105]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.072, 0.012), black);
    p.position.set(x, 0, 0.006);
    group.add(p);
  }

  const guard = new THREE.Shape();
  guard.moveTo(0.16, 0.02);
  guard.bezierCurveTo(0.1, 0.1, -0.02, 0.07, -0.06, 0.02);
  guard.bezierCurveTo(-0.2, -0.02, -0.19, -0.13, -0.06, -0.135);
  guard.bezierCurveTo(0.05, -0.12, 0.1, -0.11, 0.16, -0.02);
  const pg = new THREE.Mesh(new THREE.ShapeGeometry(guard, 16), new THREE.MeshPhysicalMaterial({ color: 0xf1ede2, roughness: 0.35, clearcoat: 0.6 }));
  pg.position.z = 0.0012;
  group.add(pg);

  const steel = new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 1, roughness: 0.25 });
  const strLen = NUT_X - BRIDGE_X + 0.05;
  const strings = [0.0013, 0.0011, 0.0009, 0.0007, 0.0006, 0.0005].map((r, i) => {
    const g = new THREE.CylinderGeometry(r, r, strLen, 5);
    g.rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(g, steel);
    m.position.set(BRIDGE_X + strLen / 2, (2.5 - i) * STRING_VIS, 0.0175);
    group.add(m);
    return { mesh: m, y: (2.5 - i) * STRING_VIS, vib: 0 };
  });

  const marker = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.001),
    new THREE.MeshBasicMaterial({ color: 0x40e0ff, transparent: true, opacity: 0.85 }));
  marker.visible = false;
  group.add(marker);

  return {
    group, strings,
    setFret(n) {
      marker.visible = n > 0;
      if (n > 0) marker.position.set((fretX(n) + fretX(n - 1)) / 2, 0, 0.0138);
    },
    pluck(i, vel) {
      strings[i].vib = Math.max(strings[i].vib, 0.4 + vel);
    },
    update(dt, time) {
      for (let i = 0; i < 6; i++) {
        const st = strings[i];
        st.mesh.position.y = st.y + Math.sin(time * 150 + i * 2) * st.vib * 0.0014;
        st.vib *= Math.exp(-dt * 3.5);
      }
    },
  };
}

// Orientation of the guitar relative to the player's body (player faces -Z).
const Q_WEAR = (() => {
  const x = new THREE.Vector3(-0.92, 0.37, -0.12).normalize();
  const y = new THREE.Vector3(0, 0.5, -1).cross(x).normalize(); // face tipped up so you can see the strings
  const z = new THREE.Vector3().crossVectors(x, y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
})();
const UP = new THREE.Vector3(0, 1, 0);

export class GuitarPlayer {
  constructor(guitar) {
    this.guitar = guitar;
    this.fret = 0;
    this.shape = 'major';
    this.pos = null;
    this.yaw = 0;
    this.prevPick = { left: null, right: null };
    this.inv = new THREE.Matrix4();
    this.tmp = new THREE.Vector3();
    this.qYaw = new THREE.Quaternion();
    this.deskStrum = 0;
  }

  get chord() { return chordName(this.fret, this.shape); }

  // Hang the guitar off the player's body, following the head loosely.
  wear(headPos, headYaw, dt) {
    if (!this.pos) { this.pos = new THREE.Vector3(); this.yaw = headYaw; dt = 1e3; }
    let d = headYaw - this.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * (1 - Math.exp(-dt * 3));
    this.qYaw.setFromAxisAngle(UP, this.yaw);
    this.tmp.set(0.12, -0.55, -0.2).applyQuaternion(this.qYaw).add(headPos);
    this.pos.lerp(this.tmp, 1 - Math.exp(-dt * 5));
    const g = this.guitar.group;
    g.position.copy(this.pos);
    g.quaternion.copy(this.qYaw).multiply(Q_WEAR);
    g.updateMatrixWorld(true);
    this.inv.copy(g.matrixWorld).invert();
  }

  _setFret(fret, shape, emit) {
    if (fret === this.fret && shape === this.shape) return false;
    this.fret = fret;
    this.shape = shape;
    this.guitar.setFret(fret);
    emit({ k: 'x' }); // lifting the fretting hand chokes the strings
    return true;
  }

  _pluck(s, vel, emit) {
    const off = SHAPES[this.shape][s];
    if (off < 0) return;
    this.guitar.pluck(s, vel);
    emit({ k: 'g', s, m: TUNING[s] + this.fret + off, v: Math.round(vel * 100) / 100 });
  }

  // VR: left hand picks the fret, right hand (or either) strums across the strings.
  // Returns true when the chord changed.
  update(hands, dt, emit) {
    let changed = false;
    const L = hands.left;
    if (L.active) {
      const p = this.tmp.copy(L.pick).applyMatrix4(this.inv);
      let fret = 0;
      if (p.x > 0.17 && p.x < NUT_X + 0.1 && Math.abs(p.y) < 0.13 && Math.abs(p.z) < 0.14) {
        const d = NUT_X - p.x;
        fret = 1;
        while (fret < MAX_FRET && SCALE * (1 - 2 ** (-fret / 12)) < d) fret++;
      }
      const shape = L.squeeze ? 'power' : L.trigger || L.pinch ? 'minor' : 'major';
      changed = this._setFret(fret, shape, emit);
    }
    for (const side of ['right', 'left']) {
      const h = hands[side];
      if (!h.active) { this.prevPick[side] = null; continue; }
      const p = this.tmp.copy(h.pick).applyMatrix4(this.inv);
      const inZone = p.x > -0.07 && p.x < 0.16 && p.z > -0.03 && p.z < 0.11;
      const prev = this.prevPick[side];
      if (prev && inZone && prev.z > -0.03 && dt > 0) {
        const vel = Math.min(1, Math.max(0.15, Math.abs(p.y - prev.y) / dt / 2.2));
        const down = p.y < prev.y;
        for (let k = 0; k < 6; k++) {
          const i = down ? k : 5 - k;
          const y = (2.5 - i) * STRING_HIT;
          if ((prev.y - y) * (p.y - y) < 0) { this._pluck(i, vel, emit); h.pulse?.(0.25 + vel * 0.5, 18); }
        }
      }
      if (prev) prev.copy(p); else this.prevPick[side] = p.clone();
    }
    return changed;
  }

  // Desktop helpers
  setChord(fret, shape, emit) {
    return this._setFret(Math.max(0, Math.min(MAX_FRET, fret)), shape, emit);
  }
  strum(down, vel, emit) {
    this.deskStrum = down ? 1 : -1;
    for (let k = 0; k < 6; k++) {
      const i = down ? k : 5 - k;
      setTimeout(() => this._pluck(i, vel * (0.85 + Math.random() * 0.15), emit), k * 13);
    }
  }
  pick(s, vel, emit) { this._pluck(s, vel, emit); }

  // Where the hands would be, for desktop players' avatars.
  deskHand(side, out, dt) {
    if (side === 'left') out.set(this.fret ? fretX(this.fret) + 0.015 : NUT_X - 0.02, 0, 0.03);
    else {
      this.deskStrum *= Math.exp(-dt * 9);
      out.set(0.06, -this.deskStrum * 0.07, 0.05);
    }
    return out.applyMatrix4(this.guitar.group.matrixWorld);
  }
}
