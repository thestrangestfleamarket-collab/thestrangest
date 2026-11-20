// SLOWFIRE DUEL's fighter: a jointed armoured figure hung under its head: it plants its feet and steps, bends its knees when the head drops, leans, and reaches its hands to where they are
import * as THREE from 'three';

const V = THREE.Vector3, UP = new V(0, 1, 0);
const NECK = .14, SPINE = .5, THIGH = .44, SHIN = .44, UPPER = .29, FORE = .27;
const a1 = new V(), a2 = new V(), a3 = new V(), M = new THREE.Matrix4();

function bend(a, b, l1, l2, pole, mid, end) {       // two bones from a toward b, the joint pushed toward pole
  a1.copy(b).sub(a); const reach = l1 + l2 - .002, d = Math.min(Math.max(a1.length(), .02), reach); a1.normalize();
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d), out = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  a2.copy(pole).addScaledVector(a1, -pole.dot(a1)); if (a2.lengthSq() < 1e-6) a2.set(1, 0, 0); a2.normalize();
  mid.copy(a).addScaledVector(a1, along).addScaledVector(a2, out); end.copy(a).addScaledVector(a1, d);
}
function span(mesh, a, b) { a1.copy(b).sub(a); const l = a1.length() || .001; mesh.position.copy(a); mesh.quaternion.setFromUnitVectors(UP, a1.divideScalar(l)); mesh.scale.y = l; }
function face(mesh, at, up, fwd) {                   // parts are modelled looking down -z
  a3.copy(fwd).addScaledVector(up, -fwd.dot(up)).normalize().negate(); a2.crossVectors(up, a3).normalize();
  mesh.quaternion.setFromRotationMatrix(M.makeBasis(a2, up, a3)); mesh.position.copy(at);
}

function makeBody(col, o) {
  const g = new THREE.Group(), see = o.opacity < 1 ? { transparent: true, opacity: o.opacity, depthWrite: false } : {};
  const tint = new THREE.Color(col).lerp(new THREE.Color(0x1a2238), .45);
  const armor = new THREE.MeshStandardMaterial({ ...o.skin, color: tint, roughness: 1, metalness: 1, envMap: o.env, envMapIntensity: .7, ...see });
  const plate = new THREE.MeshStandardMaterial({ ...o.skin, color: 0x3a4566, roughness: 1, metalness: 1, envMap: o.env, envMapIntensity: .7, ...see });
  const suit = new THREE.MeshStandardMaterial({ color: 0x0d111e, roughness: .85, metalness: .1, ...see });
  const lamp = new THREE.MeshBasicMaterial({ color: col, ...see });
  const add = (geo, mat, parent = g) => { const m = new THREE.Mesh(geo, mat); parent.add(m); return m; };
  const bone = (r1, r2, mat) => { const geo = new THREE.CylinderGeometry(r1, r2, 1, 10); geo.translate(0, .5, 0); return add(geo, mat); };
  const knob = (r, mat) => add(new THREE.SphereGeometry(r, 12, 9), mat);
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const head = new THREE.Group(); g.add(head);
  const skull = add(new THREE.SphereGeometry(.115, 20, 14), armor, head); skull.scale.set(1, 1.1, 1.1);
  const visor = add(new THREE.TorusGeometry(.1, .024, 8, 20, Math.PI * .95), lamp, head); visor.rotation.set(Math.PI / 2, 0, -Math.PI * .975); visor.position.set(0, .012, -.03);
  add(box(.03, .05, .2), plate, head).position.set(0, .115, .01); add(box(.25, .05, .08), plate, head).position.set(0, -.04, .03);
  add(new THREE.CylinderGeometry(.03, .03, .05, 8), suit, head).position.set(0, -.115, .02);

  const chest = new THREE.Group(); g.add(chest);
  add(new THREE.CylinderGeometry(.2, .15, .3, 8), armor, chest).position.y = -.15;
  add(box(.2, .15, .05), plate, chest).position.set(0, -.11, -.15); add(new THREE.CircleGeometry(.035, 6), lamp, chest).position.set(0, -.11, -.177);
  chest.children[2].rotation.y = Math.PI;
  add(box(.24, .22, .1), plate, chest).position.set(0, -.15, .16);
  for (const s of [-1, 1]) { add(box(.03, .14, .03), lamp, chest).position.set(s * .07, -.15, .212); const pad = add(new THREE.SphereGeometry(.095, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55), armor, chest); pad.position.set(s * .2, -.055, 0); pad.rotation.z = -s * .35; }
  const jets = [-1, 1].map(s => { const geo = new THREE.ConeGeometry(.045, .3, 10); geo.translate(0, -.15, 0); geo.rotateX(Math.PI); geo.translate(0, -.3, 0); const m = add(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }), chest); m.position.set(s * .07, -.26, .2); m.visible = false; return m; });
  const belly = bone(.12, .13, suit), hips = new THREE.Group(); g.add(hips);
  add(new THREE.CylinderGeometry(.145, .12, .15, 8), armor, hips).position.y = -.02; add(box(.1, .1, .04), plate, hips).position.set(0, -.04, -.125); add(box(.3, .035, .26), plate, hips).position.y = .05;

  const limbs = [-1, 1].map(s => ({
    s, thigh: bone(.075, .06, armor), shin: bone(.062, .045, armor), knee: knob(.068, plate), foot: add(box(.1, .07, .24), plate), ankle: knob(.05, suit),
    upper: bone(.05, .042, suit), fore: bone(.052, .04, armor), elbow: knob(.05, plate), hand: knob(.045, suit), cuff: add(box(.02, .05, .02), lamp),
    at: new V(), from: new V(), to: new V(), t: 1
  }));
  const N = new V(), P = new V(), T = new V(), fwd = new V(0, 0, o.face), up = new V(), right = new V(), hip = new V(), sh = new V(), mid = new V(), end = new V(), pole = new V(), want = new V(), last = new V(), vel = new V(), tar = [null, null];
  let ready = false; const floor = o.floor + .035;

  function update(dt, H, hands, burn = 0) {
    for (const m of jets) { m.visible = burn > 0; m.scale.set(1, burn * (.8 + Math.random() * .4), 1); }
    if (!ready) { ready = true; last.copy(H); for (const l of limbs) l.at.set(H.x - l.s * o.face * .11, floor, H.z); }
    a1.copy(H).sub(last).divideScalar(Math.max(dt, .001)); vel.lerp(a1, .25); last.copy(H);
    N.copy(H); N.y -= NECK;
    const cx = (limbs[0].at.x + limbs[1].at.x) / 2, cz = (limbs[0].at.z + limbs[1].at.z) / 2;
    T.set(cx + (H.x - cx) * .7, N.y - SPINE, cz + (H.z - cz) * .7 - o.face * .03); T.y = Math.max(T.y, floor + .16);
    P.copy(T).sub(N).setLength(SPINE).add(N); if (P.y < floor + .16) P.y = floor + .16;
    up.copy(N).sub(P).normalize(); right.crossVectors(up, a1.copy(fwd).negate()).normalize();
    face(chest, N, up, fwd); face(hips, P, UP, fwd); span(belly, P, a1.copy(N).addScaledVector(up, -.28));
    face(head, H, a1.copy(UP).addScaledVector(right, -right.dot(vel) * .05).normalize(), fwd);

    const moving = limbs[0].t < 1 || limbs[1].t < 1, aloft = P.y - floor > THIGH + SHIN + .12;
    for (const l of limbs) {
      if (aloft) { want.copy(P).addScaledVector(right, l.s * .1).addScaledVector(fwd, -.14); want.y -= .8; l.at.lerp(want, Math.min(1, dt * 10)); l.t = 1; continue; }
      if (l.at.y > floor + .08 && l.t >= 1) l.at.set(P.x + right.x * l.s * .11, floor, P.z + right.z * l.s * .11);
      want.set(P.x + right.x * l.s * .11 + vel.x * .08, floor, P.z + right.z * l.s * .11 + vel.z * .08);
      if (l.t < 1) {
        l.t = Math.min(1, l.t + dt / .17); l.at.lerpVectors(l.from, l.to, l.t); l.at.y = floor + Math.sin(l.t * Math.PI) * .07;
        if (l.t >= 1 && o.onStep) o.onStep(l.at.x);
      } else if (!moving && Math.hypot(want.x - l.at.x, want.z - l.at.z) > .15) { l.t = 0; l.from.copy(l.at); l.to.copy(want); }
    }
    limbs.forEach((l, i) => {
      hip.copy(P).addScaledVector(right, l.s * .09); hip.y -= .05;
      a3.copy(l.at); a3.y += .05; pole.copy(fwd).addScaledVector(right, l.s * .25);
      bend(hip, a3, THIGH, SHIN, pole, mid, end);
      span(l.thigh, hip, mid); span(l.shin, mid, end); l.knee.position.copy(mid).addScaledVector(fwd, .02); l.ankle.position.copy(end);
      l.foot.position.set(l.at.x + fwd.x * .05, l.at.y, l.at.z + fwd.z * .05); l.foot.rotation.x = aloft ? .5 * o.face : 0; l.foot.rotation.y = o.face > 0 ? Math.PI : 0;
    });

    tar[0] = hands[0] || null; tar[1] = hands[1] || null;
    if (tar[0] && tar[1] && a1.copy(tar[0]).sub(tar[1]).dot(right) < 0) { const x = tar[0]; tar[0] = tar[1]; tar[1] = x; }
    else if (!tar[0] && tar[1] && a1.copy(tar[1]).sub(N).dot(right) > 0) { tar[0] = tar[1]; tar[1] = null; }
    limbs.forEach((l, i) => {
      const side = l.s, t = tar[side > 0 ? 0 : 1];
      sh.copy(N).addScaledVector(right, side * .2).addScaledVector(up, -.07);
      if (t) want.copy(t); else want.copy(sh).addScaledVector(right, side * .07).addScaledVector(fwd, .1 - vel.dot(fwd) * .03).addScaledVector(UP, -.47);
      pole.set(0, -1, 0).addScaledVector(right, side * .7).addScaledVector(fwd, -.6);
      bend(sh, want, UPPER, FORE, pole, mid, end);
      span(l.upper, sh, mid); span(l.fore, mid, end); l.elbow.position.copy(mid); l.hand.position.copy(end);
      l.cuff.position.copy(end).lerp(mid, .3).addScaledVector(right, side * .045);
    });
  }
  return { group: g, update };
}

export { makeBody };
