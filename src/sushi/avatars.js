// the people: Microsoft Rocketbox avatars and motion (MIT), walking, sitting at the counter, eating
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { makePerson as makeFallback } from './people.js';
import { mat } from './ctx.js';

const BASE = '/sushi-assets/';
const NAMES = ['Male_Adult_02', 'Female_Adult_02', 'Male_Adult_07', 'Female_Adult_09', 'Male_Adult_03', 'Female_Adult_04', 'Male_Adult_08', 'Female_Adult_14', 'Male_Adult_13', 'Female_Adult_11'];
const CLIPS = ['walk', 'sit', 'look', 'wait'];
const SIT_LIFT = 0.215, SIT_Z = 0.03;
const lib = { avatars: [], ready: false, next: 0 };
export const avatarsReady = () => lib.ready;

export async function loadAvatars(onProgress = () => { }) {
  try {
    const total = NAMES.length + 8; let done = 0; const tick = () => onProgress(++done / total);
    const raw = { m: {}, f: {} };
    await Promise.all(['m', 'f'].flatMap((g) => CLIPS.map(async (c) => { raw[g][c] = await (await fetch(`${BASE}anim/${g}_${c}.json`)).json(); tick(); })));
    const manager = new THREE.LoadingManager(); manager.onError = () => { };
    manager.setURLModifier((u) => (/\.tga$/i.test(u) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' : u));
    const fbxLoader = new FBXLoader(manager), texLoader = new THREE.TextureLoader();
    const tex = async (url, srgb) => { const t = await texLoader.loadAsync(url); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; return t; };
    const warn = console.warn; console.warn = (...a) => { if (!String(a[0]).includes('FBXLoader')) warn(...a); };
    lib.avatars = await Promise.all(NAMES.map(async (name) => {
      const dir = `${BASE}avatars/${name}/`, g = name.startsWith('Male') ? 'm' : 'f';
      const [fbx, bc, bn, hc, hn, oc] = await Promise.all([fbxLoader.loadAsync(dir + 'avatar.fbx'), tex(dir + 'body_color.webp', true), tex(dir + 'body_normal.webp'), tex(dir + 'head_color.webp', true), tex(dir + 'head_normal.webp'), tex(dir + 'opacity_color.webp', true).catch(() => null)]);
      const kill = []; fbx.traverse((o) => { if (o.isLight || o.isCamera) kill.push(o); }); kill.forEach((o) => o.removeFromParent());
      const mats = {
        body: new THREE.MeshStandardMaterial({ map: bc, normalMap: bn, roughness: 0.82, metalness: 0 }),
        head: new THREE.MeshStandardMaterial({ map: hc, normalMap: hn, roughness: 0.62, metalness: 0 }),
        opacity: oc ? new THREE.MeshStandardMaterial({ map: oc, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.7, metalness: 0 }) : new THREE.MeshStandardMaterial({ map: hc, normalMap: hn, roughness: 0.62 }),
      };
      let hip = 90;
      fbx.traverse((o) => {
        if (o.isSkinnedMesh || o.isMesh) { const pick = (m) => mats[Object.keys(mats).find((k) => m.name.toLowerCase().includes(k)) || 'body']; o.material = Array.isArray(o.material) ? o.material.map(pick) : pick(o.material); o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; }
        if (o.name === 'Bip01') hip = o.position.y;
      });
      fbx.scale.setScalar(0.01);
      const k = hip / raw[g].walk.rootTrack[1], clips = {};
      for (const c of CLIPS) clips[c] = new THREE.AnimationClip(c, -1, raw[g][c].tracks.map((t) => t.p === 'q' ? new THREE.QuaternionKeyframeTrack(`${t.n}.quaternion`, t.t, t.v) : new THREE.VectorKeyframeTrack(`${t.n}.position`, t.t, t.v.map((v) => v * k))));
      tick();
      return { name, g, fbx, clips };
    }));
    console.warn = warn;
    lib.ready = true;
  } catch (e) { console.warn('Rocketbox avatars unavailable, using fallback figures:', e); lib.ready = false; }
  return lib.ready;
}

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _t = new THREE.Vector3(), _e = new THREE.Vector3(), _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _m = new THREE.Vector3(), _x = new THREE.Vector3();
// rotate `bone` (in world space) by quaternion q
function rotWorld(bone, q) { bone.parent.getWorldQuaternion(_pq); bone.quaternion.premultiply(_pq.clone().invert().multiply(q).multiply(_pq)); bone.updateMatrixWorld(true); }

let stickGeo, stickMat;
export function makePerson(seed) {
  if (!lib.ready) return makeFallback(seed);
  const A = lib.avatars[lib.next++ % lib.avatars.length];
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const inst = SkeletonUtils.clone(A.fbx); inner.add(inst);
  const bones = {}; inst.traverse((o) => { if (o.isBone) bones[o.name] = o; });
  const mixer = new THREE.AnimationMixer(inst), actions = {};
  for (const c of CLIPS) { actions[c] = mixer.clipAction(A.clips[c]); if (c !== 'walk') actions[c].setLoop(THREE.LoopPingPong, Infinity); }
  stickGeo ||= new THREE.CylinderGeometry(0.0028, 0.0018, 0.22, 5).rotateX(Math.PI / 2).translate(0, 0, 0.07);
  stickMat ||= mat({ color: 0xd8c49a, roughness: 0.6 });
  const sticks = new THREE.Group(); sticks.visible = false; root.add(sticks);
  for (const s of [-1, 1]) { const m = new THREE.Mesh(stickGeo, stickMat); m.position.x = s * 0.006; m.rotation.y = s * 0.04; m.castShadow = true; sticks.add(m); }
  const hand = bones.Bip01_R_Hand, fore = bones.Bip01_R_Forearm, upper = bones.Bip01_R_UpperArm, head = bones.Bip01_Head, spine = bones.Bip01_Spine1;
  const P = {
    root, sticks, seed, style: A.name, pose: 'stand', cur: null, speed: 1.3, eatT: Math.random() * 3, rocketbox: true,
    update(dt) {
      const seated = this.pose === 'sit' || this.pose === 'eat';
      const want = seated ? (this.cur && this.cur !== 'walk' ? this.cur : ['sit', 'wait', 'look'][(Math.random() * 3) | 0]) : 'walk';
      if (want !== this.cur) {
        const a = actions[want]; a.reset(); a.time = Math.random() * a.getClip().duration; a.fadeIn(this.cur ? 0.4 : 0).play();
        if (this.cur) actions[this.cur].fadeOut(0.4); this.cur = want;
      }
      actions.walk.timeScale = this.pose === 'walk' ? this.speed / 1.01 : 0;
      mixer.update(dt);
      const k = Math.min(1, dt * 6); inner.position.y += ((seated ? SIT_LIFT : 0) - inner.position.y) * k; inner.position.z += ((seated ? SIT_Z : 0) - inner.position.z) * k;
      sticks.visible = false;
      if (this.pose === 'eat' && hand && fore && upper && head) {
        this.eatT += dt;
        const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3); // 0 at the bowl .. 1 at the mouth
        root.updateMatrixWorld(true);
        _x.set(1, 0, 0).transformDirection(root.matrixWorld);
        if (spine) rotWorld(spine, _q.setFromAxisAngle(_x, 0.16 + c * 0.08).clone());
        rotWorld(head, _q.setFromAxisAngle(_x, 0.2 - c * 0.08).clone());
        head.getWorldPosition(_m); _x.set(0.05, -0.15, 0.17).applyQuaternion(root.getWorldQuaternion(_pq)); _m.add(_x); _x.set(1, 0, 0).transformDirection(root.matrixWorld); // wrist position when the chopsticks are at the mouth
        _t.set(0.05, 1.12, 0.5).applyMatrix4(root.matrixWorld).lerp(_m, c);                                                        // bowl → mouth
        for (let it = 0; it < 6; it++) for (const b of [fore, upper]) {
          hand.getWorldPosition(_e); b.getWorldPosition(_b);
          _a.copy(_e).sub(_b).normalize(); _e.copy(_t).sub(_b).normalize();
          rotWorld(b, _q.setFromUnitVectors(_a, _e).slerp(_pq.identity(), 0.25).clone());
        }
        hand.getWorldPosition(_e); sticks.visible = true; root.worldToLocal(sticks.position.copy(_e));
        head.getWorldPosition(_b); _b.y += 0.05; sticks.lookAt(_a.set(0.05, 1.04, 0.5).applyMatrix4(root.matrixWorld).lerp(_b, c)); // tips toward bowl, then mouth
      }
    },
  };
  return P;
}
