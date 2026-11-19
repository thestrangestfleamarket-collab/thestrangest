// you, the cook: Polyfork's carving chef (pf.js) under your eyes, turning as your body turns, its arms reaching to your hands; its head is left out (you see through its eyes) and so are its hands while your own are drawn
import * as THREE from 'three';
import { G } from './ctx.js';
import { avatarsReady, makePerson } from './avatars.js';

export function buildCook() {
  const cook = { on: false, P: null }; G.cook = cook; let yaw = null;
  const _c = new THREE.Vector3(), _d = new THREE.Vector3(), tL = new THREE.Vector3(), tR = new THREE.Vector3(), TINY = new THREE.Vector3(0.001, 0.001, 0.001), ONE = new THREE.Vector3(1, 1, 1);
  const make = () => { const P = makePerson(0, 'carving_chef'); if (!P.polyfork) return null; P.pose = 'stand'; P.root.traverse((o) => { o.userData.nopick = true; if (o.isMesh) o.castShadow = true; }); G.scene.add(P.root); P.hands = { L: null, R: null }; return P; };
  cook.update = (dt) => {
    if (!cook.P) { if (!avatarsReady() || G.mode === 'menu') return; cook.P = make(); if (!cook.P) return; }
    const P = cook.P, cam = G.camera; cam.getWorldPosition(_c); cam.getWorldDirection(_d); const want = Math.atan2(_d.x, _d.z);
    if (yaw == null) yaw = want; const df = Math.atan2(Math.sin(want - yaw), Math.cos(want - yaw)); if (Math.abs(df) > 0.45) yaw += (df - Math.sign(df) * 0.45) * Math.min(1, dt * 8);   // the body follows the head only past a turn of the neck
    const fx = Math.sin(yaw), fz = Math.cos(yaw), k = THREE.MathUtils.clamp(_c.y / (P.eyeY || 1.58), 0.85, 1.2);   // its eyes at yours
    P.root.position.set(_c.x - fx * 0.13 * k, 0, _c.z - fz * 0.13 * k); P.root.rotation.y = yaw; P.root.scale.setScalar(k);
    // your hands: a headset's wrists (on a screen the arms hang as a body's do)
    let n = 0; P.hands.L = P.hands.R = null;
    for (const h of G.hands || []) { if (h.models) { for (const s of ['L', 'R']) { const M = h.models[s]; if (M.root.visible) { P.hands[s] = (s === 'L' ? tL : tR).copy(M.root.position); n++; } } } }
    const b = P.bones; b.find((x) => x.name === 'head').scale.copy(TINY); for (const s of ['L', 'R']) b.find((x) => x.name === 'hand' + s).scale.copy(n && P.hands[s] ? TINY : ONE);
    P.update(dt); cook.on = true; };
  return cook;
}
