// THE GARAGE's hands: a jointed hand closed round each stick (every finger bone turned at its own knuckle), your arms and seated body behind them
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Avatar } from '../jam/avatars.js';

const FINGERS = ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'];
const PARTS = { thumb: ['metacarpal', 'phalanx-proximal', 'phalanx-distal', 'tip'], other: ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'] };
// how far each knuckle is bent round a stick (radians), thumb then index to little finger
const GRIP = [[0.35, 0.5, 0.75, 0], [0, 0.95, 1.5, 0.75, 0], [0, 1.15, 1.5, 0.8, 0], [0, 1.25, 1.5, 0.8, 0], [0, 1.3, 1.45, 0.8, 0]];
const SGN = +new URLSearchParams(location.search).get('flex') || -1;
const X = new THREE.Vector3(1, 0, 0), v = new THREE.Vector3(), q = new THREE.Quaternion(), R = new THREE.Quaternion();

export class GripHand {
  constructor(side, material, base = '/jam-assets/') {
    this.side = side;
    this.group = new THREE.Group(); // lives in the stick's own space
    this.ready = false;
    this.wrist = new THREE.Vector3();
    this.loose = 0;
    new GLTFLoader().loadAsync(base + side + '.glb').then((d) => this._build(d.scene, material)).catch((e) => console.warn('no hand', side, e));
  }

  _build(scene, material) {
    const bones = {};
    scene.traverse((o) => {
      if (o.isSkinnedMesh) { o.material = material; o.castShadow = true; o.frustumCulled = false; this.mesh = o; }
      if (o.isBone || o.type === 'Object3D') bones[o.name] = o;
    });
    this.chains = FINGERS.map((f) => (f === 'thumb' ? PARTS.thumb : PARTS.other).map((p) => { const b = bones[f + '-' + p]; return { b, p: b.position.clone(), q: b.quaternion.clone() }; }));
    this.wristBone = bones.wrist;
    // a sleeve's cuff over the join of hand and arm
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.075, 12).rotateX(Math.PI / 2).translate(0, 0, 0.045), new THREE.MeshStandardMaterial({ color: 0x6a5648, roughness: 0.9 }));
    cuff.castShadow = true; this.wristBone = bones.wrist; this.wristBone.add(cuff);
    this.inner = scene;
    this.group.add(scene);
    this.curl(0);
    // seat the closed hand on the stick: the stick runs through the hollow of the curled fingers, the back of the hand to one side, the thumb on top
    const mid = (c) => c.slice(1).reduce((s, j) => s.add(j.b.position), new THREE.Vector3()).multiplyScalar(1 / (c.length - 1));
    const ci = mid(this.chains[1]), cr = mid(this.chains[4]), axis = ci.clone().sub(cr).normalize();
    const back = new THREE.Vector3(0, 1, 0).applyQuaternion(this.wristBone.quaternion);
    const ez = axis.clone().negate(), ex = back.addScaledVector(ez, -back.dot(ez)).normalize().multiplyScalar(this.side === 'right' ? 1 : -1), ey = ez.clone().cross(ex);
    const origin = ci.clone().add(cr).multiplyScalar(0.5);
    scene.matrixAutoUpdate = false;
    scene.matrix.makeBasis(ex, ey, ez).setPosition(origin).invert();
    this.ready = true;
  }

  // loose 0 .. 1: the back fingers let go a little, as they do when a stick comes up off a head
  curl(loose) {
    this.loose = loose;
    this.chains.forEach((c, f) => {
      R.identity();
      const open = f >= 2 ? 1 - 0.3 * loose : f === 1 ? 1 - 0.08 * loose : 1;
      for (let k = 0; k < c.length; k++) {
        const j = c[k];
        if (k) j.b.position.copy(c[k - 1].b.position).add(v.copy(j.p).sub(c[k - 1].p).applyQuaternion(R));
        else j.b.position.copy(j.p);
        const a = GRIP[f][k] * open;
        if (a) { v.copy(X).applyQuaternion(q.copy(R).multiply(j.q)); R.premultiply(q.setFromAxisAngle(v, SGN * a)); }
        j.b.quaternion.copy(R).multiply(j.q);
      }
    });
  }

  update() {
    // the arm is asked to end a little way up the hand's own cuff, so no end of either shows
    if (this.ready) { this.wristBone.getWorldPosition(this.wrist); this.wristBone.getWorldQuaternion(q); this.wrist.add(v.set(0, 0, 0.035).applyQuaternion(q)); }
  }
}

// your own seated body, without its head or hands: the arms end at the wrists of the hands on the sticks
export class Body {
  constructor(shadows) {
    this.avatar = new Avatar(5, { headless: true, shadows });
    this.group = this.avatar.group;
    this.handsOff = false;
  }
  get ready() { return this.avatar.ready; }
  get skin() { return this.avatar.skin; }
  pose(headPos, headQuat, wristL, wristR, seat, dt) {
    const a = this.avatar;
    if (!a.ready) return;
    if (!this.handsOff) { a.setHandsVisible(false); this.handsOff = true; }
    a.pose(headPos, headQuat, wristL, wristR, seat, dt);
  }
}
