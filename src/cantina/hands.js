// The hands: the WebXR generic hand mesh (data/cantina/hand/, MIT), its fingers curled by five numbers. Hand frame: wrist at the origin, fingers along -Z, palm facing -Y, thumb on +X for the left hand.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export const mSide = (s) => (s === 'L' ? 1 : -1);
export const PALM = new THREE.Vector3(0, -0.02, -0.06);
export const pinchLocal = (side, out) => out.set(mSide(side) * 0.03, -0.04, -0.112);
export const indexTipLocal = (side, out) => out.set(mSide(side) * 0.03, -0.01, -0.185);

const F = (n) => [`${n}-finger-metacarpal`, `${n}-finger-phalanx-proximal`, `${n}-finger-phalanx-intermediate`, `${n}-finger-phalanx-distal`, `${n}-finger-tip`];
// each chain from the palm out, and how far each joint bends at full curl
const CHAINS = [[['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'], [0.3, 0.55, 0.9, 0]],
  [F('index'), [0, 1.25, 1.5, 0.95, 0]], [F('middle'), [0, 1.3, 1.5, 0.95, 0]], [F('ring'), [0, 1.3, 1.5, 0.95, 0]], [F('pinky'), [0, 1.3, 1.45, 0.9, 0]]];
const loader = new GLTFLoader(), models = {};
const load = (side) => models[side] || (models[side] = loader.loadAsync(`cantina-assets/hand/${side === 'L' ? 'left' : 'right'}.glb`));
const _q = new THREE.Quaternion(), _d = new THREE.Quaternion(), _ax = new THREE.Vector3(), _p = new THREE.Vector3(), _o = new THREE.Vector3();

export class Hand {
  constructor(side, skin = 0xe0b08c) {
    this.side = side;
    this.root = new THREE.Group();
    this.curl = [0.15, 0.1, 0.1, 0.1, 0.1]; // targets: thumb, index, middle, ring, pinky
    this.cur = [0.15, 0.1, 0.1, 0.1, 0.1];
    this.rig = null;
    load(side).then((g) => {
      const model = SkeletonUtils.clone(g.scene), bones = {};
      model.traverse((o) => { if (o.isBone || CHAINS.some((c) => c[0].includes(o.name)) || o.name === 'wrist') bones[o.name] = o;
        if (o.isMesh) { o.material = new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.58, sheen: 0.35, sheenRoughness: 0.6, sheenColor: 0xffc0a0 }); o.castShadow = true; o.frustumCulled = false; } });
      // the model's own space, seen from its wrist
      const W = bones.wrist, wq = W.quaternion.clone(), wp = W.position.clone(), iq = wq.clone().invert();
      const rest = {};
      for (const n in bones) rest[n] = { p: bones[n].position.clone().sub(wp).applyQuaternion(iq), q: iq.clone().multiply(bones[n].quaternion) };
      const fix = new THREE.Group(); fix.quaternion.copy(iq); fix.position.copy(wp).applyQuaternion(iq).negate(); fix.add(model); this.root.add(fix);
      this.rig = { bones, rest, wq, wp };
      this.apply();
    });
  }

  update(dt) {
    const k = Math.min(1, dt * 22);
    for (let i = 0; i < 5; i++) this.cur[i] += (this.curl[i] - this.cur[i]) * k;
    this.apply();
  }

  apply() {
    const R = this.rig; if (!R) return;
    CHAINS.forEach(([names, bend], f) => {
      const c = this.cur[f];
      _d.identity(); _p.copy(R.rest[names[0]].p);
      for (let i = 0; i < names.length; i++) {
        const r = R.rest[names[i]], b = R.bones[names[i]];
        if (bend[i]) { _ax.set(1, 0, 0).applyQuaternion(r.q).applyQuaternion(_d); _d.premultiply(_q.setFromAxisAngle(_ax, -bend[i] * c)); }
        b.position.copy(_p).applyQuaternion(R.wq).add(R.wp);
        b.quaternion.copy(R.wq).multiply(_q.copy(_d).multiply(r.q));
        if (i + 1 < names.length) _p.add(_o.copy(R.rest[names[i + 1]].p).sub(r.p).applyQuaternion(_d));
      }
    });
  }
}
