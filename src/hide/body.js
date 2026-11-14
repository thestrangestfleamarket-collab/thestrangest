// DEAD END's figure: the body under your head. A chest and hips that follow you, arms that reach to wherever your hands are, legs that step as you move, fold when you crouch and trail behind you when you lie flat. It throws your shadow.
import { THREE, scene, clamp, lerp } from './core.js';

const UP = new THREE.Vector3(0, 1, 0), _m = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3();
function makeBody() {
  const cloth = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: .9 }), denim = new THREE.MeshStandardMaterial({ color: 0x10141c, roughness: .85 }), boot = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: .6 }), g = new THREE.Group(); scene.add(g);
  const seg = (r, m) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, 1, 4, 8), m); o.castShadow = true; o.frustumCulled = false; g.add(o); o.userData.r = r; return o; };
  // a limb drawn from one point to another
  const put = (o, a, b) => { _d.subVectors(b, a); const len = _d.length() || .001; o.position.copy(a).addScaledVector(_d, .5); o.quaternion.setFromUnitVectors(UP, _d.multiplyScalar(1 / len)); o.scale.y = Math.max(.02, len - o.userData.r) ; };
  // where the middle joint goes: two bones of fixed length from a to as near c as they reach, bent toward the pole
  const bend = (a, c, l1, l2, pole, out, end) => { _d.subVectors(c, a); const d = clamp(_d.length(), Math.abs(l1 - l2) + .01, l1 + l2 - .005); _d.normalize(); const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    _p.copy(pole).addScaledVector(_d, -pole.dot(_d)); if (_p.lengthSq() < 1e-6) _p.set(0, 1, 0); _p.normalize(); out.copy(a).addScaledVector(_d, x).addScaledVector(_p, h); end.copy(a).addScaledVector(_d, d); };
  const chest = seg(.15, cloth), hips = seg(.14, denim), arms = [0, 1].map(() => [seg(.052, cloth), seg(.044, cloth)]), legs = [0, 1].map(() => [seg(.078, denim), seg(.06, denim)]), feet = [0, 1].map(() => { const f = new THREE.Mesh(new THREE.BoxGeometry(.1, .08, .26), boot); f.castShadow = true; g.add(f); return f; });
  const B = { g, phase: 0, go: 0, neck: new THREE.Vector3(), pelvis: new THREE.Vector3(), V: Array.from({ length: 12 }, () => new THREE.Vector3()) };
  // o: pos (your feet), head, fwd (level, unit), hands [left, right] (a point or null), moved (metres this moment), low (0 stand, 1 crouch, 2 flat)
  B.update = (o, dt) => { const f = o.fwd, rx = -f.z, rz = f.x, h = Math.max(.3, o.head.y - o.pos.y), V = B.V, flat = o.low === 2, k = clamp(1 - h / 1.66, 0, 1);
    B.go = lerp(B.go, o.moved > .0015 ? 1 : 0, 1 - Math.exp(-dt * 8)); B.phase += o.moved / .72 * Math.PI;
    B.neck.copy(o.head).addScaledVector(f, -.07); B.neck.y -= .15;
    if (flat) B.pelvis.set(o.head.x - f.x * .62, o.pos.y + .15, o.head.z - f.z * .62); else B.pelvis.set(o.pos.x - f.x * (.05 + k * .3), o.pos.y + clamp(h * .56, .2, .98), o.pos.z - f.z * (.05 + k * .3));
    const mid = V[0].copy(B.neck).lerp(B.pelvis, .55); put(chest, B.neck, mid); put(hips, mid, B.pelvis);
    for (let s = 0; s < 2; s++) { const sg = s ? 1 : -1, sw = Math.sin(B.phase + (s ? Math.PI : 0)) * B.go, lift = Math.max(0, Math.cos(B.phase + (s ? Math.PI : 0))) * B.go;
      const sh = V[1].copy(B.neck).addScaledVector(f, .02); sh.x += rx * sg * .19; sh.z += rz * sg * .19; sh.y -= .04; const hand = V[2];
      if (o.hands[s]) hand.copy(o.hands[s]); else if (flat) { hand.copy(sh).addScaledVector(f, .32); hand.y = o.pos.y + .06; hand.x += rx * sg * .08; hand.z += rz * sg * .08; } else { hand.copy(sh).addScaledVector(f, -sw * .14 + .04); hand.y -= .5 - k * .12; hand.x += rx * sg * .05; hand.z += rz * sg * .05; }
      const pole = V[3].set(rx * sg * .5 - f.x * .7, -.7, rz * sg * .5 - f.z * .7), el = V[4], we = V[5]; bend(sh, hand, .29, .28, pole, el, we); put(arms[s][0], sh, el); put(arms[s][1], el, we);
      const hip = V[6].copy(B.pelvis); hip.x += rx * sg * .1; hip.z += rz * sg * .1; const foot = V[7];
      if (flat) { foot.copy(B.pelvis).addScaledVector(f, -.82); foot.x += rx * sg * .11; foot.z += rz * sg * .11; foot.y = o.pos.y + .07; } else { foot.set(o.pos.x + rx * sg * .1 + f.x * (sw * .24 + k * .12), o.pos.y + .06 + lift * .09, o.pos.z + rz * sg * .1 + f.z * (sw * .24 + k * .12)); }
      const kp = flat ? V[8].set(rx * sg * .3, 1, rz * sg * .3) : V[8].set(f.x + rx * sg * .15, .25, f.z + rz * sg * .15), kn = V[9], an = V[10]; bend(hip, foot, .46, .45, kp, kn, an); put(legs[s][0], hip, kn); put(legs[s][1], kn, an);
      feet[s].position.copy(an).addScaledVector(f, flat ? -.06 : .07); feet[s].position.y = an.y - .02; feet[s].rotation.set(flat ? 1.2 : 0, Math.atan2(f.x, f.z), 0, 'YXZ'); } };
  return B;
}
export { makeBody };
