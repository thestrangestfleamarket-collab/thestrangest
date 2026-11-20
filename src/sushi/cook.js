// you, the cook: Polyfork's carving chef (pf.js) under your eyes, turning as your body turns, its arms reaching to your hands; its neck is set where yours is behind your eyes; its head is whole for every eye but your own (what of it is right round your eyes is not drawn) and so are its hands while your own are drawn
import * as THREE from 'three';
import { G } from './ctx.js';
import { avatarsReady, makePerson } from './avatars.js';

const NECK = [0.1, 0.09];   // your eyes over the joint your head turns on: that far above it, that far before it (metres)
export function buildCook() {
  const cook = { on: false, P: null }; G.cook = cook; let yaw = null;
  const _c = new THREE.Vector3(), _d = new THREE.Vector3(), _u = new THREE.Vector3(), _n = new THREE.Vector3(), tL = new THREE.Vector3(), tR = new THREE.Vector3(), TINY = new THREE.Vector3(0.001, 0.001, 0.001), ONE = new THREE.Vector3(1, 1, 1);
  const make = () => { const P = makePerson(0, 'carving_chef'); if (!P.polyfork) return null; P.pose = 'stand'; P.root.traverse((o) => { o.userData.nopick = true; if (o.isMesh) o.castShadow = true; }); G.scene.add(P.root); P.hands = { L: null, R: null };
    // what of your own body is right under your eyes (the collar, the neck's stump) is not drawn, nor your own head from inside it: looking down you see your chest and arms; anyone else's eye, and a picture taken from outside, sees all of you
    if (P.mesh && P.mesh.material) { const m = (P.mesh.material = P.mesh.material.clone()), hb = P.part('head').map((b) => P.bones.indexOf(b));
      m.onBeforeCompile = (s) => { s.uniforms.uHead = { value: new THREE.Vector2(hb[0] ?? -1, hb[1] ?? -1) };
        s.vertexShader = 'uniform vec2 uHead; varying float vHead;\n' + s.vertexShader.replace('#include <skinning_vertex>', '#include <skinning_vertex>\n  { vec4 hh = vec4(0.0); for (int i = 0; i < 4; i++) { float b = skinIndex[i]; if (b == uHead.x || b == uHead.y) hh[i] = 1.0; } vHead = dot(hh, skinWeight); }');
        s.fragmentShader = 'varying float vHead;\n' + s.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n  { float nd = dot(vViewPosition, vViewPosition); if (nd < 0.09 || (vHead > 0.5 && nd < 0.3)) discard; }'); }; m.customProgramCacheKey = () => 'cook-near2'; }
    return P; };
  cook.update = (dt) => {
    if (!cook.P) { if (!avatarsReady() || G.mode === 'menu') return; cook.P = make(); if (!cook.P) return; }
    const P = cook.P, cam = G.camera;
    if (G.mode === 'menu') { P.root.position.set(0, 0, 0.55); P.root.rotation.y = Math.PI; P.hands.L = P.hands.R = null; for (const s of ['L', 'R']) P.part('hand' + s)[0].scale.copy(ONE); P.update(dt); return; }   // (the way in's picture of the cart: the cook stands at the counter)
    cam.getWorldPosition(_c); cam.getWorldDirection(_d); const want = Math.atan2(_d.x, _d.z);
    if (yaw == null) yaw = want; const df = Math.atan2(Math.sin(want - yaw), Math.cos(want - yaw)); if (Math.abs(df) > 0.45) yaw += (df - Math.sign(df) * 0.45) * Math.min(1, dt * 8);   // the body follows the head only past a turn of the neck
    const fx = Math.sin(yaw), fz = Math.cos(yaw), k = THREE.MathUtils.clamp(_c.y / (P.eyeY || 1.58), 0.85, 1.2);   // its eyes at yours
    // the neck's joint is behind and below your eyes, by how your head is tipped (bowed to look down, your eyes go forward over your chest); the body hangs from it
    _u.set(0, 1, 0).applyQuaternion(cam.getWorldQuaternion(new THREE.Quaternion())); _n.copy(_c).addScaledVector(_u, -NECK[0] * k).addScaledVector(_d, -NECK[1] * k);
    const hb = P.part('head')[0].position, bx = hb.x * k, bz = hb.z * k;   // where the body's own neck is from its feet (the stance sways)
    P.root.position.set(_n.x - (bx * fz + bz * fx), 0, _n.z - (-bx * fx + bz * fz)); P.root.rotation.y = yaw; P.root.scale.setScalar(k);
    // your hands: a headset's wrists (on a screen the arms hang as a body's do)
    let n = 0; P.hands.L = P.hands.R = null;
    for (const h of G.hands || []) { if (h.models) { for (const s of ['L', 'R']) { const M = h.models[s]; if (M.root.visible) { P.hands[s] = (s === 'L' ? tL : tR).copy(M.root.position); n++; } } } }
    for (const s of ['L', 'R']) P.part('hand' + s)[0].scale.copy(n && P.hands[s] ? TINY : ONE);
    P.update(dt); cook.on = true; };
  return cook;
}
