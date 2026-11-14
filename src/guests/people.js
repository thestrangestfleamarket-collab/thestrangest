// THE GUEST LIST's bodies: each guest's own model on the shared skeleton, motion-captured clips blended by what they are doing, a head that looks where they look, a face that speaks and blinks, and a real physics body (a ragdoll) for when they fall
import { THREE, ASSET, clamp, lerp, rnd, pick, scene, CLOCK, P, RAPIER, grp, GRP, gltfL, height, angd } from './core.js';

const PEOPLE = __PEOPLE__, CLIPS = { m: {}, f: {} }, BODIES = {};
async function loadPeople(keys, onp) { let n = 0; const tick = () => onp(++n / (keys.length + 2));
  await Promise.all([...['m', 'f'].map(s => gltfL.loadAsync(ASSET + 'anim-' + s + '.glb').then(g => { for (const c of g.animations) CLIPS[s][c.name] = c; tick(); })), ...keys.map(k => gltfL.loadAsync(ASSET + 'people/' + k + '.glb').then(g => { BODIES[k] = g.scene; tick(); }))]); }

const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _e = new THREE.Euler();
const WALKS = [['walk_stroll_01', 0], ['walk_slow_01', 0], ['walk_neutral', 0], ['walk_fast_01', 0], ['run_neutral', 0]];
// the ragdoll's parts: bone, the bone its far end is at, thickness, what it hangs from, and how the joint bends
const PARTS = [['pelvis', 'Bip01_Pelvis', 'Bip01_Spine2', .13, null], ['chest', 'Bip01_Spine2', 'Bip01_Neck', .14, 'pelvis'], ['head', 'Bip01_Head', null, .1, 'chest'],
  ['armL', 'Bip01_L_UpperArm', 'Bip01_L_Forearm', .045, 'chest'], ['foreL', 'Bip01_L_Forearm', 'Bip01_L_Hand', .04, 'armL', [-2.4, .05]], ['armR', 'Bip01_R_UpperArm', 'Bip01_R_Forearm', .045, 'chest'], ['foreR', 'Bip01_R_Forearm', 'Bip01_R_Hand', .04, 'armR', [-2.4, .05]],
  ['thighL', 'Bip01_L_Thigh', 'Bip01_L_Calf', .075, 'pelvis'], ['calfL', 'Bip01_L_Calf', 'Bip01_L_Foot', .055, 'thighL', [-.05, 2.3]], ['thighR', 'Bip01_R_Thigh', 'Bip01_R_Calf', .075, 'pelvis'], ['calfR', 'Bip01_R_Calf', 'Bip01_R_Foot', .055, 'thighR', [-.05, 2.3]]];

class Body {
  constructor(key) { const src = BODIES[key]; this.key = key; this.sex = PEOPLE.people[key].sex; this.h = PEOPLE.people[key].height; this.o = src; scene.add(src); this.bones = {}; this.faces = [];
    src.traverse(m => { if (m.isBone) this.bones[m.name] = m; if (m.isSkinnedMesh || m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; if (m.morphTargetDictionary) this.faces.push(m); if (m.material) { m.material.envMapIntensity = .8; if (m.name === 'hair' || m.material.alphaTest) m.material.alphaToCoverage = true; } } });
    this.mixer = new THREE.AnimationMixer(src); this.acts = {}; this.cur = null; this.x = 0; this.z = 0; this.y = 0; this.yaw = 0; this.speed = 0; this.look = null; this.lookK = 0; this.hy = 0; this.hp = 0;
    this.vis = { aa: 0, oh: 0, ee: 0, pp: 0, ff: 0, blink: 0, smile: 0, fear: 0 }; this.mood = { smile: .1, fear: 0 }; this.blinkT = rnd(2, 5); this.talkT = 0; this.talkAmp = 0; this.ph = rnd(10); this.rag = null; this.frozen = false; this.held = null; this.shake = 0; this.lean = 0;
    for (const w of WALKS) w[1] = PEOPLE.clips[this.sex][w[0]].speed; this.play('idle_neutral_01', 0); }
  act(name) { let a = this.acts[name]; if (!a) { const c = CLIPS[this.sex][name]; if (!c) return null; a = this.acts[name] = this.mixer.clipAction(c); } return a; }
  // cross-fade to a clip; once = play through and hold
  play(name, fade = .35, o = {}) { if (this.cur === name && !o.again) { if (o.rate) this.acts[name].timeScale = o.rate; return; } const a = this.act(name); if (!a) return; const old = this.cur && this.acts[this.cur]; a.reset(); a.enabled = true; a.setLoop(o.once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = !!o.once; a.timeScale = o.rate || 1; if (!o.once && !o.start0) a.time = rnd(a.getClip().duration);
    a.setEffectiveWeight(1); if (old && old !== a) { a.crossFadeFrom(old, fade, false); } a.play(); this.cur = name; this.curOnce = !!o.once; }
  // move over the ground at v m/s facing yaw: picks the walk whose own speed is nearest and plays it at the pace that keeps the feet from sliding
  walk(v) { let best = WALKS[0]; for (const w of WALKS) if (Math.abs(w[1] - v) < Math.abs(best[1] - v)) best = w; if (this.drunk && v < 1.2) best = ['walk_drunk', PEOPLE.clips[this.sex].walk_drunk.speed]; this.play(best[0], .3, { rate: clamp(v / best[1], .6, 1.5) }); }
  hold(obj, o = {}) { if (this.held) this.held.removeFromParent(); this.held = obj; if (!obj) return; const h = this.bones.Bip01_R_Hand; h.add(obj); const s = 1 / (h.getWorldScale(_v).x || 1); obj.scale.multiplyScalar(s); obj.position.set(o.px ?? .09, o.py ?? -.03, o.pz ?? .02).multiplyScalar(s); obj.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? -1.57); }
  say(dur) { this.talkT = dur; }
  step(dt) { if (this.frozen) return; if (this.rag) { this.ragStep(dt); return; }
    this.mixer.update(dt); const o = this.o; o.position.set(this.x, this.y, this.z); o.rotation.y = this.yaw;
    // the head and eyes turn to what holds their attention, as far as a neck allows
    const hd = this.bones.Bip01_Head, nk = this.bones.Bip01_Neck; let ty = 0, tp = 0; if (this.look) { const dx = this.look.x - this.x, dz = this.look.z - this.z, d = Math.hypot(dx, dz); ty = clamp(angd(this.yaw, Math.atan2(dx, dz)), -1.25, 1.25); tp = clamp(Math.atan2((this.look.y ?? 1.6) - (this.y + this.h * .93), d), -.5, .5); if (Math.abs(angd(this.yaw, Math.atan2(dx, dz))) > 2) ty = 0; }
    this.hy = lerp(this.hy, ty, 1 - Math.exp(-dt * 5)); this.hp = lerp(this.hp, tp, 1 - Math.exp(-dt * 5)); const sh = this.shake ? Math.sin(CLOCK.t * 31 + this.ph) * this.shake * .06 : 0;
    if (Math.abs(this.hy) > .01 || Math.abs(this.hp) > .01 || sh) { o.updateMatrixWorld(true); for (const [b, k] of [[nk, .35], [hd, .65]]) { b.getWorldQuaternion(_q); _q2.setFromEuler(_e.set(-this.hp * k, this.hy * k + sh, 0, 'YXZ')); const wq = _q2.premultiply(new THREE.Quaternion().setFromAxisAngle(Y, this.yaw)).multiply(new THREE.Quaternion().setFromAxisAngle(Y, -this.yaw)); b.parent.getWorldQuaternion(_q); b.quaternion.premultiply(_q.clone().invert().multiply(wq).multiply(_q)); b.updateMatrixWorld(true); } }
    if (this.shake) { const s = this.bones.Bip01_Spine1; s.rotation.z += Math.sin(CLOCK.t * 23 + this.ph) * this.shake * .05; s.rotation.x += Math.sin(CLOCK.t * 17) * this.shake * .04; }
    this.face(dt); }
  // the mouth makes the shapes of speech while talking; the eyes blink; the mood shows
  face(dt) { const v = this.vis, k = 1 - Math.exp(-dt * 18); let aa = 0, oh = 0, ee = 0, pp = 0, ff = 0;
    if (this.talkT > 0) { this.talkT -= dt; const t = CLOCK.t * 9.5 + this.ph, syl = Math.sin(t) * .5 + .5, sel = Math.floor(t / Math.PI) * 7.13 + this.ph, r = sel - Math.floor(sel), amp = (this.talkAmp || .8) * (.55 + .45 * Math.sin(CLOCK.t * 2.3 + this.ph)); if (r < .4) aa = syl * amp; else if (r < .6) oh = syl * amp; else if (r < .82) ee = syl * amp * .9; else if (r < .92) pp = .8 * syl; else ff = .7 * syl; aa = Math.max(aa, .08 * amp); }
    v.aa = lerp(v.aa, aa, k); v.oh = lerp(v.oh, oh, k); v.ee = lerp(v.ee, ee, k); v.pp = lerp(v.pp, pp, k); v.ff = lerp(v.ff, ff, k); v.smile = lerp(v.smile, this.mood.smile, dt * 2); v.fear = lerp(v.fear, this.mood.fear, dt * 3);
    this.blinkT -= dt; let bl = this.mood.shut ? 1 : 0; if (this.blinkT < 0) { bl = 1; if (this.blinkT < -.12) this.blinkT = rnd(1.8, 6) * (this.mood.fear > .5 ? .5 : 1); } v.blink = lerp(v.blink, bl, 1 - Math.exp(-dt * 40));
    for (const m of this.faces) { const d = m.morphTargetDictionary, f = m.morphTargetInfluences; for (const n in v) if (d[n] !== undefined) f[d[n]] = v[n]; } }
  headPos(out = new THREE.Vector3()) { return this.bones.Bip01_Head.getWorldPosition(out); }
  bonePos(n, out = new THREE.Vector3()) { return this.bones[n].getWorldPosition(out); }
  // FALL: the body becomes eleven weighted parts jointed where a body bends; push = the shove it falls with
  ragdoll(push) { if (this.rag) return; this.mixer.stopAllAction(); this.mixer.update(0); this.cur = null; const o = this.o; o.updateMatrixWorld(true); const R = { parts: {}, list: [], joints: [], still: 0, t: 0 }, W = P.world, left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y, this.yaw);
    for (const [name, bn, endn, rad, parent, lim] of PARTS) { const b = this.bones[bn], a = b.getWorldPosition(new THREE.Vector3()), e = endn ? this.bones[endn].getWorldPosition(new THREE.Vector3()) : a.clone().add(new THREE.Vector3(0, .13, 0)), mid = name === 'head' ? a.clone().add(new THREE.Vector3(0, .09, 0)) : a.clone().add(e).multiplyScalar(.5), len = a.distanceTo(e);
      const rb = W.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(mid.x, mid.y, mid.z).setLinearDamping(.25).setAngularDamping(2.2).setCcdEnabled(name === 'head' || name === 'pelvis'));
      const dir = e.clone().sub(a).normalize(), cq = new THREE.Quaternion().setFromUnitVectors(Y, dir), cd = name === 'head' ? RAPIER.ColliderDesc.ball(rad) : RAPIER.ColliderDesc.capsule(Math.max(.01, len / 2 - rad * .6), rad).setRotation(cq);
      W.createCollider(cd.setDensity(name === 'chest' || name === 'pelvis' ? 950 : 800).setFriction(1).setRestitution(.02).setCollisionGroups(grp(GRP.BODY, GRP.WORLD)), rb);
      const part = { name, rb, bone: b, rel: new THREE.Matrix4().makeTranslation(mid.x, mid.y, mid.z).invert().multiply(b.matrixWorld) }; R.parts[name] = part; R.list.push(part);
      if (parent) { const pr = R.parts[parent].rb, pt = pr.translation(), a1 = { x: a.x - pt.x, y: a.y - pt.y, z: a.z - pt.z }, a2 = { x: a.x - mid.x, y: a.y - mid.y, z: a.z - mid.z };
        const j = lim ? W.createImpulseJoint(RAPIER.JointData.revolute(a1, a2, { x: left.x, y: 0, z: left.z }), pr, rb, true) : W.createImpulseJoint(RAPIER.JointData.spherical(a1, a2), pr, rb, true); if (lim) j.setLimits(lim[0], lim[1]); j.setContactsEnabled(false); R.joints.push(j); }
      if (push) rb.applyImpulse({ x: push.x * rb.mass() * (name === 'chest' || name === 'head' ? 1.2 : .6), y: (push.y || 0) * rb.mass(), z: push.z * rb.mass() * (name === 'chest' || name === 'head' ? 1.2 : .6) }, true); }
    this.rag = R; this.mood.shut = true; this.mood.fear = 0; this.talkT = 0; this.look = null; }
  ragStep(dt) { const R = this.rag; R.t += dt; let moving = 0; for (const p of R.list) { const t = p.rb.translation(), r = p.rb.rotation(), v = p.rb.linvel(); moving = Math.max(moving, Math.hypot(v.x, v.y, v.z)); _m.compose(_v.set(t.x, t.y, t.z), _q.set(r.x, r.y, r.z, r.w), _v2.set(1, 1, 1)).multiply(p.rel); p.bone.parent.updateWorldMatrix(true, false); _m2.copy(p.bone.parent.matrixWorld).invert().multiply(_m); _m2.decompose(p.bone.position, p.bone.quaternion, _v2); p.bone.updateMatrixWorld(true); }
    const c = R.parts.pelvis.rb.translation(); this.x = c.x; this.z = c.z; this.ry = c.y; this.face(dt); if (c.y < -9) { R.parts.pelvis.rb.setTranslation({ x: this.x, y: 1, z: this.z }, true); }
    // once it lies still the physics lets go of it and the pose stays
    R.still = moving < .06 && !R.handle ? R.still + dt : 0; if (R.still > 1.5 && R.t > 2.5) this.settle(); }
  settle() { const R = this.rag; if (!R) return; for (const j of R.joints) P.world.removeImpulseJoint(j, true); for (const p of R.list) P.world.removeRigidBody(p.rb); if (R.handle) P.world.removeRigidBody(R.handle.rb); this.rag = null; this.frozen = true; this.lying = true; this.o.updateMatrixWorld(true); }
  // take hold of the fallen body by its nearest part: it comes after the hand as a dead weight
  grab(point) { if (!this.rag) { this.frozen = false; this.ragdollFromPose(); } const R = this.rag; let best = null, bd = 1e9; for (const p of R.list) { if (!['chest', 'foreL', 'foreR', 'calfL', 'calfR', 'head'].includes(p.name)) continue; const t = p.rb.translation(), d = Math.hypot(t.x - point.x, t.y - point.y, t.z - point.z); if (d < bd) { bd = d; best = p; } }
    const t = best.rb.translation(), hb = P.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(t.x, t.y, t.z)), j = P.world.createImpulseJoint(RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }), hb, best.rb, true); R.handle = { rb: hb, j, part: best }; R.joints.push(j); for (const p of R.list) p.rb.wakeUp(); return best.name; }
  ragdollFromPose() { const y = this.yaw; this.ragdoll(null); this.yaw = y; }
  pull(to) { const R = this.rag; if (R && R.handle) R.handle.rb.setNextKinematicTranslation({ x: to.x, y: to.y, z: to.z }); }
  release() { const R = this.rag; if (!R || !R.handle) return; P.world.removeImpulseJoint(R.handle.j, true); R.joints.splice(R.joints.indexOf(R.handle.j), 1); P.world.removeRigidBody(R.handle.rb); R.handle = null; R.t = 1; }
  // where the fallen body is (its hips), for those who might see it
  where(out = new THREE.Vector3()) { return this.bones.Bip01_Pelvis.getWorldPosition(out); }
  vanish(v) { this.o.visible = !v; }
}
export { PEOPLE, CLIPS, loadPeople, Body };
