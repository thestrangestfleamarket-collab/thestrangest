// Player avatars: head, torso, IK arms, articulated hands, name tag.
import * as THREE from 'three';
import { Hand } from './hands.js';

export function makePose() {
  const hand = () => ({ p: new THREE.Vector3(0, 1, 0), q: new THREE.Quaternion(), c: [0.15, 0.1, 0.1, 0.1, 0.1] });
  return { head: { p: new THREE.Vector3(0, 1.65, 0), q: new THREE.Quaternion() }, L: hand(), R: hand() };
}
const r4 = (v) => Math.round(v * 10000) / 10000;
export function packPose(pose) {
  const d = [];
  const pq = (o) => d.push(r4(o.p.x), r4(o.p.y), r4(o.p.z), r4(o.q.x), r4(o.q.y), r4(o.q.z), r4(o.q.w));
  pq(pose.head);
  for (const s of ['L', 'R']) { pq(pose[s]); for (const c of pose[s].c) d.push(Math.round(c * 100) / 100); }
  return d;
}
export function unpackPose(d, pose) {
  pose.head.p.fromArray(d, 0); pose.head.q.fromArray(d, 3);
  let o = 7;
  for (const s of ['L', 'R']) {
    pose[s].p.fromArray(d, o); pose[s].q.fromArray(d, o + 3);
    for (let i = 0; i < 5; i++) pose[s].c[i] = d[o + 7 + i];
    o += 12;
  }
  return pose;
}
function lerpPose(a, b, t, out) {
  out.head.p.lerpVectors(a.head.p, b.head.p, t); out.head.q.slerpQuaternions(a.head.q, b.head.q, t);
  for (const s of ['L', 'R']) {
    out[s].p.lerpVectors(a[s].p, b[s].p, t); out[s].q.slerpQuaternions(a[s].q, b[s].q, t);
    for (let i = 0; i < 5; i++) out[s].c[i] = a[s].c[i] + (b[s].c[i] - a[s].c[i]) * t;
  }
}

const SKINS = [0xe8b998, 0xd29b74, 0xa9714b, 0x7b4a2d, 0xf0c8a8];
const _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function nameSprite(name) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const x = c.getContext('2d');
  x.font = '600 52px system-ui, sans-serif';
  const w = Math.min(500, x.measureText(name).width + 48);
  x.fillStyle = 'rgba(0,0,0,.55)';
  x.beginPath(); x.roundRect((512 - w) / 2, 8, w, 80, 40); x.fill();
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(name, 256, 50, 460);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(0.5, 0.094, 1);
  return s;
}

export class Avatar {
  constructor(scene, { id, name, color, local }) {
    this.scene = scene;
    this.local = !!local;
    this.pose = makePose();
    this.torsoYaw = 0;
    this.init = false;
    const skin = SKINS[id % SKINS.length];
    const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.6 });
    const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    this.body = new THREE.Group();
    scene.add(this.body);

    this.head = new THREE.Group();
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), skinMat);
    skull.scale.set(0.92, 1.08, 1);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.9 }));
    hair.scale.set(0.94, 1.08, 1.02); hair.position.set(0, 0.008, 0.012); hair.rotation.x = -0.25;
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x15110e, roughness: 0.2 });
    const eyeG = new THREE.SphereGeometry(0.013, 10, 8);
    const eL = new THREE.Mesh(eyeG, eyeMat), eR = new THREE.Mesh(eyeG, eyeMat);
    eL.position.set(-0.036, 0.012, -0.093); eR.position.set(0.036, 0.012, -0.093);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), skinMat);
    nose.position.set(0, -0.018, -0.105);
    this.head.add(skull, hair, eL, eR, nose);
    this.head.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.body.add(this.head);

    this.torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.27, 6, 16), cloth);
    this.torso.scale.set(1.22, 1, 0.78);
    this.torso.castShadow = true;
    this.body.add(this.torso);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 0.1, 10), skinMat);
    neck.position.y = 0.3;
    this.torso.add(neck);

    const armG = new THREE.CylinderGeometry(0.036, 0.03, 1, 10);
    this.arms = { L: [new THREE.Mesh(armG, cloth), new THREE.Mesh(armG, cloth)], R: [new THREE.Mesh(armG, cloth), new THREE.Mesh(armG, cloth)] };
    for (const s of ['L', 'R']) for (const m of this.arms[s]) { m.castShadow = true; this.body.add(m); }

    this.hands = { L: new Hand('L', skin), R: new Hand('R', skin) };
    scene.add(this.hands.L.root, this.hands.R.root);

    if (!local) { this.tag = nameSprite(name); this.body.add(this.tag); }
    else { this.head.visible = false; this.torso.visible = false; }
    this.showArms = true;

    this.buf = []; // remote snapshots: { t, pose }
  }

  push(d, now) {
    this.buf.push({ t: now, pose: unpackPose(d, makePose()) });
    if (this.buf.length > 12) this.buf.shift();
  }

  // Remote avatars render ~100 ms in the past, interpolating between snapshots.
  interpolate(now) {
    const b = this.buf;
    if (!b.length) return false;
    const t = now - 100;
    let i = b.length - 1;
    while (i > 0 && b[i - 1].t > t) i--;
    if (i === 0 || b[i].t <= t) lerpPose(b[i].pose, b[i].pose, 0, this.pose);
    else lerpPose(b[i - 1].pose, b[i].pose, (t - b[i - 1].t) / (b[i].t - b[i - 1].t), this.pose);
    return true;
  }

  apply(dt) {
    const P = this.pose;
    this.head.position.copy(P.head.p);
    this.head.quaternion.copy(P.head.q);
    _e.setFromQuaternion(P.head.q);
    let dy = _e.y - this.torsoYaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.torsoYaw += this.init ? dy * Math.min(1, dt * 5) : dy;
    this.init = true;
    const sy = Math.sin(this.torsoYaw), cy = Math.cos(this.torsoYaw);
    this.torso.position.set(P.head.p.x + sy * 0.035, P.head.p.y - 0.44, P.head.p.z + cy * 0.035);
    this.torso.rotation.y = this.torsoYaw;
    if (this.tag) this.tag.position.set(P.head.p.x, P.head.p.y + 0.24, P.head.p.z);

    for (const s of ['L', 'R']) {
      const h = this.hands[s];
      h.root.position.copy(P[s].p);
      h.root.quaternion.copy(P[s].q);
      for (let i = 0; i < 5; i++) h.curl[i] = P[s].c[i];
      h.update(dt);
      for (const m of this.arms[s]) m.visible = this.showArms;
      if (this.showArms) this.solveArm(s);
    }
  }

  solveArm(s) {
    const m = s === 'L' ? -1 : 1; // world side: left shoulder is at -X when facing -Z
    const sy = Math.sin(this.torsoYaw), cy = Math.cos(this.torsoYaw);
    const S = _a.set(this.torso.position.x + cy * m * 0.2, this.torso.position.y + 0.2, this.torso.position.z - sy * m * 0.2);
    const W = _b.copy(this.pose[s].p);
    const L1 = 0.28, L2 = 0.27;
    const dir = _c.subVectors(W, S);
    const dist = dir.length();
    const d = Math.min(Math.max(dist, 0.06), L1 + L2 - 0.002);
    dir.divideScalar(dist || 1);
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const pole = _d.set(cy * m * 0.5 + sy * 0.35, -1, -sy * m * 0.5 + cy * 0.35);
    pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    const E = pole.multiplyScalar(h).addScaledVector(dir, a).add(S);
    this.setBone(this.arms[s][0], S, E);
    this.setBone(this.arms[s][1], E, W);
  }

  setBone(mesh, A, B) {
    mesh.position.addVectors(A, B).multiplyScalar(0.5);
    const len = A.distanceTo(B);
    mesh.scale.set(1, Math.max(len, 0.01), 1);
    mesh.quaternion.setFromUnitVectors(UP, mesh.up.subVectors(B, A).divideScalar(len || 1));
  }

  dispose() {
    this.scene.remove(this.body, this.hands.L.root, this.hands.R.root);
  }
}
