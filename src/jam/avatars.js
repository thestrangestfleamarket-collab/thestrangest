// STADIUM JAM's players: skinned Polyfork bodies (data/jam/avatars.json) posed each frame by IK from head and hands, and each other player's instrument and sound
import * as THREE from 'three';
import { buildKit, buildStick } from './drums.js';
import { buildGuitar } from './guitar.js';
import { GuitarVoice, DrumVoice, PADS } from './audio.js';
import { SLOTS } from './stadium.js';

export const PLAYER_COLORS = [0xb01020, 0x1450c8, 0xe0a010, 0x10a060, 0x8030c0, 0xe05a10, 0x10a0b0, 0xd0d0d8];

let DATA = null, pending = null;
export function loadAvatars() {
  pending ??= fetch('/jam-assets/avatars.json').then((r) => r.json()).then((d) => (DATA = d)).catch(() => null);
  return pending;
}
function dec(s, Type) {
  const bin = atob(s), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Type(u8.buffer);
}

const B = { hips: 0, torso: 1, head: 2, armL: 3, foreL: 4, handL: 5, armR: 6, foreR: 7, handR: 8, thighL: 9, shinL: 10, shoeL: 11, thighR: 12, shinR: 13, shoeR: 14 };
const UP = new THREE.Vector3(0, 1, 0);
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
const q1 = new THREE.Quaternion();
const FLIP = new THREE.Quaternion().setFromAxisAngle(UP, Math.PI); // the models face +Z, players face -Z

// Two-bone IK: where the middle joint goes so the chain root -> joint -> end reaches the target.
function solve(root, target, l1, l2, pole, joint, end) {
  const d = v1.copy(target).sub(root);
  const len = d.length();
  const dist = Math.min(Math.max(len, 0.02), l1 + l2 - 0.002);
  d.multiplyScalar(1 / (len || 1));
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const p = v2.copy(pole).addScaledVector(d, -pole.dot(d));
  if (p.lengthSq() < 1e-6) p.set(0, 0, 1);
  p.normalize();
  joint.copy(root).addScaledVector(d, a).addScaledVector(p, h);
  end.copy(root).addScaledVector(d, dist);
}

export class Avatar {
  // headless: your own body, drawn without its head so the camera can sit inside it
  constructor(look, { headless = false, shadows = false } = {}) {
    this.group = new THREE.Group();
    this.ready = false;
    this.yaw = 0;
    this.feet = [new THREE.Vector3(), new THREE.Vector3()];
    this.feetSet = false;
    loadAvatars().then((d) => { if (d) this._build(d, look, headless, shadows); });
  }

  _build(d, look, headless, shadows) {
    const L = d.looks[look % d.looks.length], skel = d.skel[L.fig];
    const pos = dec(L.pos, Float32Array), rgb = dec(L.col, Uint8Array), bone = dec(L.bone, Uint8Array), w = dec(L.w, Uint8Array);
    let tri = dec(L.tri, Uint32Array);
    const n = L.verts;
    if (headless) {
      const head = (q) => (w[q] >= 128 ? bone[q * 2] : bone[q * 2 + 1]) === B.head;
      const keep = [];
      for (let t = 0; t < tri.length; t += 3) if (!(head(tri[t]) && head(tri[t + 1]) && head(tri[t + 2]))) keep.push(tri[t], tri[t + 1], tri[t + 2]);
      tri = new Uint32Array(keep);
    }
    // hand triangles go last so they can be switched off when real tracked hands are drawn instead
    const isHand = (q) => { const b = w[q] >= 128 ? bone[q * 2] : bone[q * 2 + 1]; return b === B.handL || b === B.handR; };
    const body = [], hands = [];
    for (let t = 0; t < tri.length; t += 3) (isHand(tri[t]) && isHand(tri[t + 1]) && isHand(tri[t + 2]) ? hands : body).push(tri[t], tri[t + 1], tri[t + 2]);
    tri = new Uint32Array([...body, ...hands]);
    this.bodyCount = body.length;
    this.allCount = tri.length;
    const sk = hands.length ? hands[0] : 0;
    this.skin = new THREE.Color().setRGB(rgb[sk * 3] / 255, rgb[sk * 3 + 1] / 255, rgb[sk * 3 + 2] / 255, THREE.SRGBColorSpace);
    const col = new Float32Array(n * 3), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), c = new THREE.Color();
    for (let q = 0; q < n; q++) {
      c.setRGB(rgb[q * 3] / 255, rgb[q * 3 + 1] / 255, rgb[q * 3 + 2] / 255, THREE.SRGBColorSpace);
      col.set([c.r, c.g, c.b], q * 3);
      si[q * 4] = bone[q * 2]; si[q * 4 + 1] = bone[q * 2 + 1];
      sw[q * 4] = w[q] / 255; sw[q * 4 + 1] = 1 - w[q] / 255;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    g.setIndex(new THREE.BufferAttribute(tri, 1));
    g.computeVertexNormals();
    const mesh = new THREE.SkinnedMesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0, envMapIntensity: 0.6 }));
    this.O = skel.origin.map((o) => new THREE.Vector3(...o));
    this.bones = this.O.map((o) => { const b = new THREE.Bone(); b.position.copy(o); mesh.add(b); return b; });
    mesh.bind(new THREE.Skeleton(this.bones));
    mesh.frustumCulled = false;
    mesh.castShadow = shadows;
    mesh.receiveShadow = shadows;
    this.group.add(mesh);
    this.mesh = mesh;
    // rest offsets in the player's frame (flipped to face -Z)
    const rel = (a, b) => new THREE.Vector3().subVectors(this.O[a], this.O[b]).applyQuaternion(FLIP);
    this.R = {
      torso: rel(B.torso, B.hips), head: rel(B.head, B.torso),
      shL: rel(B.armL, B.torso), shR: rel(B.armR, B.torso),
      hipL: rel(B.thighL, B.hips), hipR: rel(B.thighR, B.hips),
      upper: [rel(B.foreL, B.armL), rel(B.foreR, B.armR)], fore: [rel(B.handL, B.foreL), rel(B.handR, B.foreR)],
      thigh: [rel(B.shinL, B.thighL), rel(B.shinR, B.thighR)], shin: [rel(B.shoeL, B.shinL), rel(B.shoeR, B.shinR)],
    };
    this.hipY = skel.hipY;
    this.q = this.bones.map(() => new THREE.Quaternion());
    this.p = this.bones.map(() => new THREE.Vector3());
    this.s = this.bones.map(() => 1);
    this.ready = true;
  }

  setHandsVisible(on) {
    if (this.ready) this.mesh.geometry.setDrawRange(0, on ? this.allCount : this.bodyCount);
  }

  // Point a bone whose rest direction (after `base` rotation) is `rest` along a -> b.
  _aim(i, base, rest, a, b) {
    v3.copy(rest).applyQuaternion(base).normalize();
    v4.copy(b).sub(a).normalize();
    this.q[i].setFromUnitVectors(v3, v4).multiply(base);
    this.p[i].copy(a);
  }

  _limb(root, target, upperI, rest1, rest2, base, pole) {
    // real arms are often longer than the model's: lengthen the limb just enough to reach the hand
    const k = Math.min(1.45, Math.max(1, root.distanceTo(target) / ((rest1.length() + rest2.length()) * 0.985)));
    this.s[upperI] = this.s[upperI + 1] = k;
    const l1 = rest1.length() * k, l2 = rest2.length() * k;
    const joint = this.p[upperI + 1], end = this.p[upperI + 2];
    solve(root, target, l1, l2, pole, joint, end);
    const j = v1.copy(joint), e = v2.copy(end); // _aim uses v3/v4 only
    this._aim(upperI, base, rest1, root, j);
    this._aim(upperI + 1, this.q[upperI], rest2, j, e);
    this.p[upperI + 1].copy(j);
    this.p[upperI + 2].copy(e);
    this.q[upperI + 2].copy(this.q[upperI + 1]);
  }

  // head: eye position + orientation; hands: wrist positions; seat: Vector3 when sitting at the kit
  pose(headPos, headQuat, handL, handR, seat, dt) {
    if (!this.ready) return;
    const R = this.R, p = this.p, q = this.q;
    v1.set(0, 0, -1).applyQuaternion(headQuat);
    let dy = (seat ? 0 : Math.atan2(-v1.x, -v1.z)) - this.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.yaw += dy * (1 - Math.exp(-dt * 4));
    const qYaw = q1.setFromAxisAngle(UP, this.yaw);

    // neck base sits below and behind the eyes
    const neck = new THREE.Vector3(0, -0.13, 0.06).applyQuaternion(headQuat).add(headPos);
    neck.y -= 0.16;
    const spine = R.torso.length() + R.head.length();
    if (seat) p[B.hips].copy(seat);
    else {
      p[B.hips].set(0, 0, 0.04).applyQuaternion(qYaw).add(neck);
      p[B.hips].y = Math.max(0.35, neck.y - spine);
    }
    q[B.hips].copy(qYaw);
    // spine leans from the hips to wherever the neck is
    const tPos = p[B.torso].copy(R.torso).applyQuaternion(qYaw).add(p[B.hips]);
    const lean = new THREE.Vector3().subVectors(neck, tPos).normalize();
    q[B.torso].setFromUnitVectors(UP, lean).multiply(qYaw);
    p[B.head].copy(R.head).applyQuaternion(q[B.torso]).add(tPos);
    q[B.head].copy(headQuat);

    const pole = new THREE.Vector3(), root = new THREE.Vector3();
    [[handL, R.shL, B.armL, -1], [handR, R.shR, B.armR, 1]].forEach(([hand, sh, bi, side], k) => {
      root.copy(sh).applyQuaternion(q[B.torso]).add(tPos);
      pole.set(side * 0.55, -1, 0.45).applyQuaternion(qYaw); // elbows hang down, out and back
      this._limb(root, hand, bi, R.upper[k], R.fore[k], q[B.torso], pole);
    });

    // legs: feet stay planted and step when the hips drift away
    [[R.hipL, B.thighL, -1], [R.hipR, B.thighR, 1]].forEach(([hip, bi, side], k) => {
      root.copy(hip).applyQuaternion(qYaw).add(p[B.hips]);
      const foot = this.feet[k];
      if (seat) foot.set(seat.x + side * 0.24, 0.09, seat.z - 0.46);
      else {
        v3.set(side * 0.02, 0, 0).applyQuaternion(qYaw).add(root).setY(0.09);
        if (!this.feetSet || foot.distanceTo(v3) > 0.28) foot.copy(v3);
        else foot.lerp(v3, 1 - Math.exp(-dt * 1.5));
      }
      pole.set(side * 0.15, 0.2, -1).applyQuaternion(qYaw); // knees bend forward
      this._limb(root, foot, bi, R.thigh[k], R.shin[k], qYaw, pole);
      q[bi + 2].copy(qYaw);
    });
    this.feetSet = true;

    for (let i = 0; i < this.bones.length; i++) {
      this.bones[i].position.copy(p[i]);
      this.bones[i].quaternion.copy(q[i]).multiply(FLIP);
      this.bones[i].scale.setScalar(this.s[i]);
    }
  }
}

export function nameSprite(text, color = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const g = c.getContext('2d');
  g.font = '600 52px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(0,0,0,0.55)';
  const w = Math.min(500, g.measureText(text).width + 48);
  g.beginPath();
  g.roundRect(256 - w / 2, 8, w, 80, 24);
  g.fill();
  g.fillStyle = color;
  g.fillText(text, 256, 50, 460);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  s.scale.set(0.8, 0.15, 1);
  return s;
}

function readPose(p, o, pos, quat) {
  pos.set(p[o], p[o + 1], p[o + 2]);
  quat.set(p[o + 3], p[o + 4], p[o + 5], p[o + 6]).normalize();
}

export class RemotePlayer {
  constructor(info, scene, audio, T, shadows) {
    this.id = info.id;
    this.scene = scene;
    this.slot = info.slot;
    const color = PLAYER_COLORS[info.slot % PLAYER_COLORS.length];
    const [sx, sz] = SLOTS[info.slot % SLOTS.length];
    this.sx = sx; this.sz = sz;
    this.root = new THREE.Group();
    scene.add(this.root);

    this.avatar = new Avatar(info.slot, { shadows });
    this.label = nameSprite(info.name);
    this.sticks = [buildStick(T), buildStick(T)];
    this.kit = buildKit(color, T);
    this.kit.group.position.set(sx, 0, sz);
    this.guitar = buildGuitar(color, T);
    this.root.add(this.avatar.group, this.label, ...this.sticks, this.kit.group, this.guitar.group);
    if (shadows) this.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    this.channel = audio.createChannel(true);
    this.channel.setPosition(sx, 1.2, sz);
    this.drumVoice = new DrumVoice(audio, this.channel);
    this.guitarVoice = new GuitarVoice(audio, this.channel);

    const V = (x, y, z) => [new THREE.Vector3(x, y, z), new THREE.Quaternion()];
    this.t = { head: V(sx, 1.5, sz), l: V(sx - 0.25, 0.95, sz - 0.3), r: V(sx + 0.25, 0.95, sz - 0.3), g: V(sx, 1, sz) };
    this.c = { head: V(sx, 1.5, sz), l: V(sx - 0.25, 0.95, sz - 0.3), r: V(sx + 0.25, 0.95, sz - 0.3) };
    this.seat = new THREE.Vector3();
    this.guitar.group.position.copy(this.t.g[0]);
    this.applyState(info);
  }

  applyState({ inst, tone, ky }) {
    this.inst = inst;
    this.ky = ky || 0;
    this.kit.group.visible = inst === 'drums';
    this.guitar.group.visible = inst === 'guitar';
    for (const s of this.sticks) s.visible = inst === 'drums';
    this.kit.group.position.y = this.ky;
    this.guitarVoice.setTone(tone ?? 1);
    if (inst !== 'guitar') this.guitarVoice.damp(0.05);
  }

  setPose(p) {
    readPose(p, 0, ...this.t.head);
    readPose(p, 7, ...this.t.l);
    readPose(p, 14, ...this.t.r);
    readPose(p, 21, ...this.t.g);
  }

  onNote(m) {
    if (m.k === 'd') {
      if (m.pad === 2) this.kit.hatOpen = !!m.o;
      this.drumVoice.hit(PADS[m.pad], m.v, !!m.o);
      this.kit.hit(m.pad, m.v);
    } else if (m.k === 'g') {
      this.guitarVoice.pluck(m.s, m.m, m.v);
      this.guitar.pluck(m.s, m.v);
    } else if (m.k === 'x') {
      this.guitarVoice.damp(0.1);
    }
  }

  update(dt, time) {
    const a = 1 - Math.exp(-dt * 16);
    for (const k of ['head', 'l', 'r']) {
      this.c[k][0].lerp(this.t[k][0], a);
      this.c[k][1].slerp(this.t[k][1], a);
    }
    this.guitar.group.position.lerp(this.t.g[0], a);
    this.guitar.group.quaternion.slerp(this.t.g[1], a);
    this.sticks.forEach((s, i) => {
      const c = this.c[i ? 'r' : 'l'];
      s.position.copy(c[0]);
      s.quaternion.copy(c[1]);
    });
    const drums = this.inst === 'drums';
    this.seat.set(this.sx, 0.6 + this.ky, this.sz + 0.05);
    this.avatar.pose(this.c.head[0], this.c.head[1], this.c.l[0], this.c.r[0], drums ? this.seat : null, dt);
    const hp = this.c.head[0];
    this.label.position.set(hp.x, hp.y + 0.38, hp.z);
    this.channel.setPosition(hp.x, hp.y - 0.3, hp.z);
    this.kit.update(dt, time);
    this.guitar.update(dt, time);
  }

  dispose() {
    this.guitarVoice.damp(0.05);
    this.scene.remove(this.root);
    setTimeout(() => this.channel.dispose(), 3000);
  }
}
