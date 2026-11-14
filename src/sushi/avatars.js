// the people: Microsoft Rocketbox avatars and motion (MIT), walking, sitting at the counter, eating
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { makePerson as makeFallback } from './people.js';
import { mat } from './ctx.js';

const BASE = '/sushi-assets/';
const NAMES = ['Male_Adult_02', 'Female_Adult_02', 'Male_Adult_07', 'Female_Adult_09', 'Male_Adult_03', 'Female_Adult_04', 'Male_Adult_08', 'Female_Adult_14', 'Male_Adult_13', 'Female_Adult_11'];
const CLIPS = ['walk', 'sit', 'look', 'wait'];
const SIT_LIFT = 0.215, SIT_Z = 0.03;
const lib = { avatars: [], creatures: [], ready: false, next: 0 };
// the cantina's regulars who have two arms and can sit at a counter: [model, who they are in the cantina's cast, standing height]
const CREATURES = [['robot', 'robot', 1.7], ['gnome', 'gnome', 1.42], ['mariachi', 'mariachi', 1.76], ['pirate', 'pirate', 1.8], ['goblinMage', 'goblinmage', 1.46], ['dragonborn', 'dragonborn', 1.9]];
export const avatarsReady = () => lib.ready;

export async function loadAvatars(onProgress = () => { }) {
  try {
    const total = NAMES.length + 8; let done = 0; const tick = () => onProgress(++done / total);
    const raw = { m: {}, f: {} };
    await Promise.all(['m', 'f'].flatMap((g) => CLIPS.map(async (c) => { raw[g][c] = await (await fetch(`${BASE}anim/${g}_${c}.json`)).json(); tick(); })));
    const manager = new THREE.LoadingManager(); manager.onError = () => { };
    manager.setURLModifier((u) => (/\.tga$/i.test(u) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' : u));
    const fbxLoader = new FBXLoader(manager), texLoader = new THREE.TextureLoader();
    const tex = async (url, srgb) => { const t = await texLoader.loadAsync(url), c = document.createElement('canvas'); c.width = c.height = 512; c.getContext('2d').drawImage(t.image, 0, 0, 512, 512); t.dispose(); const s = new THREE.CanvasTexture(c); s.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; s.anisotropy = 4; return s; };
    const warn = console.warn; console.warn = (...a) => { if (!String(a[0]).includes('FBXLoader')) warn(...a); };
    lib.avatars = await Promise.all(NAMES.map(async (name) => {
      const dir = `${BASE}avatars/${name}/`, g = name.startsWith('Male') ? 'm' : 'f';
      const [fbx, bc, hc, oc] = await Promise.all([fbxLoader.loadAsync(dir + 'avatar.fbx'), tex(dir + 'body_color.webp', true), tex(dir + 'head_color.webp', true), tex(dir + 'opacity_color.webp', true).catch(() => null)]);
      const kill = []; fbx.traverse((o) => { if (o.isLight || o.isCamera) kill.push(o); }); kill.forEach((o) => o.removeFromParent());
      const mats = {
        body: mat({ map: bc, roughness: 0.82, metalness: 0 }),
        head: mat({ map: hc, roughness: 0.62, metalness: 0 }),
        opacity: oc ? mat({ map: oc, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.7, metalness: 0 }) : mat({ map: hc, roughness: 0.62 }),
      };
      let hip = 90;
      fbx.traverse((o) => {
        if (o.isSkinnedMesh || o.isMesh) { const pick = (m) => mats[Object.keys(mats).find((k) => m.name.toLowerCase().includes(k)) || 'body']; o.material = Array.isArray(o.material) ? o.material.map(pick) : pick(o.material); o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; }
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
    const gl = new GLTFLoader(); gl.setMeshoptDecoder(MeshoptDecoder);
    Promise.all(CREATURES.map(async ([file, cast, tall]) => { try { const g = await gl.loadAsync(`/cantina-assets/pf/${file}.glb`), box = new THREE.Box3().setFromObject(g.scene), h0 = box.max.y - box.min.y || 1; g.scene.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; } }); lib.creatures.push({ cast, scene: g.scene, k: tall / h0, clip: g.animations[0], tall }); } catch (e) { /* that one stays in the bar */ } }));
  } catch (e) { console.warn('Rocketbox avatars unavailable, using fallback figures:', e); lib.ready = false; }
  return lib.ready;
}

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _t = new THREE.Vector3(), _e = new THREE.Vector3(), _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _m = new THREE.Vector3(), _x = new THREE.Vector3();
// rotate `bone` (in world space) by quaternion q
function rotWorld(bone, q) { bone.parent.getWorldQuaternion(_pq); bone.quaternion.premultiply(_pq.clone().invert().multiply(q).multiply(_pq)); bone.updateMatrixWorld(true); }

// the two-bone reach every arm here uses: turn the forearm, then the upper arm, until the hand is at the point
function reach(fore, upper, hand, T) { for (let it = 0; it < 6; it++) for (const b of [fore, upper]) { hand.getWorldPosition(_e); b.getWorldPosition(_b); _a.copy(_e).sub(_b).normalize(); _e.copy(T).sub(_b).normalize(); rotWorld(b, _q.setFromUnitVectors(_a, _e).slerp(_pq.identity(), 0.25).clone()); } }
// chopsticks start past the fingertips' side of the hand and point at the bowl, then the mouth
function holdSticks(root, sticks, hand, head, c) { hand.getWorldPosition(_e); head.getWorldPosition(_b); _b.y += 0.04; _a.set(0.05, 1.04, 0.5).applyMatrix4(root.matrixWorld).lerp(_b, c); _x.copy(_a).sub(_e).normalize(); _e.addScaledVector(_x, 0.07); _e.y += 0.02; sticks.visible = true; root.worldToLocal(sticks.position.copy(_e)); sticks.lookAt(_a); }

// a cantina regular as a patron: its own idle, and walking, sitting, reaching, eating and looking worked out on its bones
function makeCreature(C) {
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const inst = SkeletonUtils.clone(C.scene); inst.scale.setScalar(C.k); inner.add(inst);
  const B = {}; inst.traverse((o) => { if (o.isBone && !B[o.name]) B[o.name] = o; });
  const mixer = new THREE.AnimationMixer(inst); if (C.clip) mixer.clipAction(C.clip).play();
  stickGeo ||= new THREE.CylinderGeometry(0.0028, 0.0018, 0.22, 5).rotateX(Math.PI / 2).translate(0, 0, 0.07); stickMat ||= mat({ color: 0xd8c49a });
  const sticks = new THREE.Group(); sticks.visible = false; root.add(sticks); for (const s of [-1, 1]) { const m = new THREE.Mesh(stickGeo, stickMat); m.position.x = s * 0.006; m.rotation.y = s * 0.04; sticks.add(m); }
  const used = ['LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'Head', 'Neck', 'Spine'].map((n) => B[n]).filter(Boolean), rest = used.map((b) => b.quaternion.clone());
  inst.updateMatrixWorld(true); const hipY = B.Hips ? B.Hips.getWorldPosition(new THREE.Vector3()).y : C.tall * 0.52;
  const P = { root, sticks, cast: C.cast, style: 'creature', pose: 'stand', speed: 1.3, look: null, lookW: 0, lookAt: new THREE.Vector3(), waveT: 0, eatT: Math.random() * 3, ph: Math.random() * 6, pitch: C.tall < 1.5 ? 1.35 : C.cast === 'robot' ? 0.8 : C.cast === 'dragonborn' ? 0.7 : 0.95, rocketbox: true,
    update(dt) {
      used.forEach((b, i) => b.quaternion.copy(rest[i])); mixer.update(dt); // start each frame from the idle, then pose
      const seated = this.pose === 'sit' || this.pose === 'eat', k = Math.min(1, dt * 6);
      inner.position.y += ((seated ? 0.76 - hipY : 0) - inner.position.y) * k; inner.position.z += ((seated ? 0.03 : 0) - inner.position.z) * k;
      root.updateMatrixWorld(true); const X = _x.set(1, 0, 0).transformDirection(root.matrixWorld).clone(), turn = (b, a) => { if (b) rotWorld(b, _q.setFromAxisAngle(X, a).clone()); };
      if (seated) { turn(B.LeftUpLeg, -1.45); turn(B.RightUpLeg, -1.45); turn(B.LeftLeg, 1.4); turn(B.RightLeg, 1.4);
        if (B.LeftHand && B.LeftForeArm && B.LeftArm) reach(B.LeftForeArm, B.LeftArm, B.LeftHand, _t.set(-0.17, 1.05, 0.42).applyMatrix4(root.matrixWorld));
        if (this.pose !== 'eat' && this.waveT <= 0 && B.RightHand) reach(B.RightForeArm, B.RightArm, B.RightHand, _t.set(0.17, 1.05, 0.42).applyMatrix4(root.matrixWorld));
      } else if (this.pose === 'walk') { this.ph += dt * this.speed * 5.2; const s = Math.sin(this.ph); turn(B.LeftUpLeg, -s * 0.5); turn(B.RightUpLeg, s * 0.5); turn(B.LeftLeg, Math.max(0, s) * 0.7); turn(B.RightLeg, Math.max(0, -s) * 0.7); turn(B.LeftArm, s * 0.3); turn(B.RightArm, -s * 0.3); inner.position.y = Math.abs(Math.cos(this.ph)) * 0.02; }
      const head = B.Head, hand = B.RightHand; sticks.visible = false;
      this.lookW += ((this.look ? 1 : 0) - this.lookW) * Math.min(1, dt * 3.5); if (this.look) this.lookAt.lerp(this.look, Math.min(1, dt * 6));
      if (this.lookW > 0.02 && head) { head.getWorldPosition(_b); _a.copy(this.lookAt).sub(_b).applyQuaternion(root.getWorldQuaternion(_pq).invert()); const yaw = Math.max(-1.1, Math.min(1.1, Math.atan2(_a.x, _a.z))) * this.lookW, pit = Math.max(-0.45, Math.min(0.45, Math.atan2(_a.y, Math.hypot(_a.x, _a.z)))) * this.lookW;
        _x.set(0, 1, 0).transformDirection(root.matrixWorld); if (B.Neck) rotWorld(B.Neck, _q.setFromAxisAngle(_x, yaw * 0.35).clone()); rotWorld(head, _q.setFromAxisAngle(_x, yaw * 0.65).clone()); rotWorld(head, _q.setFromAxisAngle(X, -pit).clone()); }
      if (!hand || !head || !B.RightForeArm || !B.RightArm) return;
      if (this.waveT > 0 && this.pose !== 'eat') { this.waveT -= dt; head.getWorldPosition(_t); _x.set(0.3 + Math.sin(this.waveT * 13) * 0.08, 0.1, 0.16).applyQuaternion(root.getWorldQuaternion(_pq)); _t.add(_x); reach(B.RightForeArm, B.RightArm, hand, _t); }
      if (this.pose === 'eat') { this.eatT += dt; const c = Math.pow((Math.sin(this.eatT * 2.4) + 1) / 2, 1.3); if (B.Spine) turn(B.Spine, 0.16 + c * 0.08); turn(head, 0.18 - c * 0.08);
        head.getWorldPosition(_m); _x.set(0.05, -0.15, 0.17).applyQuaternion(root.getWorldQuaternion(_pq)); _m.add(_x); _t.set(0.05, 1.12, 0.5).applyMatrix4(root.matrixWorld).lerp(_m, c); reach(B.RightForeArm, B.RightArm, hand, _t); holdSticks(root, sticks, hand, head, c); }
    } };
  return P;
}

let stickGeo, stickMat;
export function makePerson(seed) {
  if (!lib.ready) return makeFallback(seed);
  if (lib.creatures.length && Math.random() < 0.4) return makeCreature(lib.creatures[(Math.random() * lib.creatures.length) | 0]);
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
    root, sticks, seed, style: A.name, pose: 'stand', cur: null, speed: 1.3, look: null, lookW: 0, waveT: 0, lookAt: new THREE.Vector3(), eatT: Math.random() * 3, rocketbox: true,
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
      this.lookW += ((this.look ? 1 : 0) - this.lookW) * Math.min(1, dt * 3.5); if (this.look) this.lookAt.lerp(this.look, Math.min(1, dt * 6));
      if (this.lookW > 0.02 && head) { // turn the neck and head toward what they are looking at, as far as a neck goes
        root.updateMatrixWorld(true); head.getWorldPosition(_b); _a.copy(this.lookAt).sub(_b).applyQuaternion(root.getWorldQuaternion(_pq).invert());
        const yaw = Math.max(-1.1, Math.min(1.1, Math.atan2(_a.x, _a.z))) * this.lookW, pit = Math.max(-0.45, Math.min(0.45, Math.atan2(_a.y, Math.hypot(_a.x, _a.z)))) * this.lookW, neck = bones.Bip01_Neck;
        _x.set(0, 1, 0).transformDirection(root.matrixWorld); if (neck) rotWorld(neck, _q.setFromAxisAngle(_x, yaw * 0.35).clone()); rotWorld(head, _q.setFromAxisAngle(_x, yaw * 0.65).clone());
        _x.set(1, 0, 0).transformDirection(root.matrixWorld); rotWorld(head, _q.setFromAxisAngle(_x, -pit).clone());
      }
      if (this.waveT > 0 && this.pose !== 'eat' && hand && fore && upper && head) { // a raised hand, shaken: waving back
        this.waveT -= dt; root.updateMatrixWorld(true); head.getWorldPosition(_t); _x.set(0.3 + Math.sin(this.waveT * 13) * 0.08, 0.1, 0.16).applyQuaternion(root.getWorldQuaternion(_pq)); _t.add(_x); reach(fore, upper, hand, _t);
      }
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
        holdSticks(root, sticks, hand, head, c);
      }
    },
  };
  return P;
}
