// EYES DOWN's you: a body that walks, sits, lies down and shuts its eyes, two hands in the headset (a mouse on a screen) that use things and carry them
import { THREE, RAPIER, P, G, grp, clamp, lerp, renderer, scene, camera, rig, ray, CLOCK } from './core.js';
import { ROOM, nearestUse } from './room.js';

const R = .22, EYE = 1.62, GROUPS = grp(G.PLAYER, G.SOLID);
const PL = { pos: new THREE.Vector3(.75, 0, 4.4), head: new THREE.Vector3(), fwd: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: Math.PI, pitch: 0, eye: EYE, keys: {}, hands: [], speed: 0, turnRate: 0, seat: null, lying: false, eyesShut: false, shutK: 0, frozen: false, onUse: null, busy: false, sleeping: false, covered: false };
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), lastF = new THREE.Vector3(0, 0, -1);
let body, col, ctl;

function init() {
  body = P.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(PL.pos.x, PL.pos.y, PL.pos.z));
  col = P.world.createCollider(RAPIER.ColliderDesc.capsule(.6, R).setTranslation(0, .82, 0).setCollisionGroups(GROUPS), body);
  ctl = P.world.createCharacterController(.02); ctl.enableAutostep(.2, .1, true); ctl.enableSnapToGround(.3); ctl.setApplyImpulsesToDynamicBodies(true); ctl.setCharacterMass(70);
  const hm = new THREE.MeshStandardMaterial({ color: 0xc9a58a, roughness: .6 });
  for (let i = 0; i < 2; i++) {
    const grip = renderer.xr.getControllerGrip(i), hand = new THREE.Group(), part = (w, h, d, x, y, z, rx = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hm); m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = true; hand.add(m); };
    part(.08, .026, .09, 0, 0, .01); for (let f = 0; f < 4; f++) { part(.016, .017, .05, -.03 + f * .02, -.004, -.058, -.25); part(.015, .015, .033, -.03 + f * .02, -.018, -.093, -.7); } part(.02, .02, .05, (i ? -1 : 1) * .05, -.004, -.02); part(.07, .05, .08, 0, .002, .09);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(.045, .05, .14, 10), new THREE.MeshStandardMaterial({ color: 0x3a4250, roughness: .9 })); sleeve.rotation.x = Math.PI / 2; sleeve.position.z = .18; hand.add(sleeve);
    hand.rotation.x = -.5; grip.add(hand); rig.add(grip);
    const ctrl = renderer.xr.getController(i), beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color: 0xfff2d0, transparent: true, opacity: .35 })); beam.scale.z = 1.2; beam.visible = false; ctrl.add(beam); rig.add(ctrl);
    const hb = P.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -5, 0)); P.world.createCollider(RAPIER.ColliderDesc.ball(.05).setCollisionGroups(grp(G.HAND, G.SOLID)), hb);
    const H = { grip, ctrl, beam, hb, pos: new THREE.Vector3(0, -5, 0), on: false, src: null, held: null, sq: false, tr: false, b: false, snap: false };
    PL.hands.push(H); grip.addEventListener('connected', e => { H.src = e.data; H.on = true; }); grip.addEventListener('disconnected', () => { H.on = false; H.src = null; drop(H); });
  }
  PL.mouse = { held: null, dist: .8, down: false, pos: new THREE.Vector3() };
  addEventListener('keydown', e => { if (e.repeat) return; PL.keys[e.code] = true; if (e.code === 'KeyE') use(); if (e.code === 'Space') e.preventDefault(); });
  addEventListener('keyup', e => { PL.keys[e.code] = false; });
  addEventListener('mousemove', e => { if (document.pointerLockElement !== renderer.domElement) return; PL.yaw -= e.movementX * .0021; PL.pitch = clamp(PL.pitch - e.movementY * .0021, -1.45, 1.45); });
  addEventListener('mousedown', e => { if (document.pointerLockElement === renderer.domElement && e.button === 0) { PL.mouse.down = true; mouseGrab(); } });
  addEventListener('mouseup', () => { const h = PL.mouse.held; PL.mouse.down = false; drop(PL.mouse); if (h) { const m = h.T.mass; h.T.b.applyImpulse({ x: PL.fwd.x * 3 * m, y: (PL.fwd.y * 3 + .6) * m, z: PL.fwd.z * 3 * m }, true); } });
}
const camLocal = () => renderer.xr.isPresenting ? _w.set(camera.position.x, 0, camera.position.z).applyAxisAngle(UP, rig.rotation.y) : _w.set(0, 0, 0);
function place(x, z, yaw) { PL.pos.set(x, 0, z); PL.yaw = yaw; PL.pitch = 0; body.setTranslation(PL.pos, true); rig.rotation.y = yaw; const c = camLocal(); rig.position.set(x - c.x, 0, z - c.z); PL.seat = null; PL.lying = false; }
// sit on a seat or lie on the bed: you are put there, facing its way; any step gets you up
function sit(S) { PL.seat = S; PL.lying = !!S.lie; PL.pos.copy(S.pos); body.setTranslation(PL.pos, true); PL.yaw = S.yaw; PL.pitch = S.lie ? .9 : 0; rig.rotation.y = S.yaw; const c = camLocal(); rig.position.set(S.pos.x - c.x, 0, S.pos.z - c.z); PL.sitT = CLOCK.t; }
function stand() { if (!PL.seat) return; const S = PL.seat; PL.seat = null; PL.lying = false; PL.covered = false; _v.set(Math.sin(S.yaw), 0, Math.cos(S.yaw)).multiplyScalar(-.45); PL.pos.add(_v); if (S.lie) { PL.pos.set(5.7, 0, 1.5); } body.setTranslation(PL.pos, true); PL.pitch = 0; }

/* hands: carry what is loose */
function take(Hd, p) {
  const pr = P.world.projectPoint(p, true, undefined, grp(G.HAND, G.SOLID)); if (!pr) return false; const d = Math.hypot(pr.point.x - p.x, pr.point.y - p.y, pr.point.z - p.z); if (d > .14 && !pr.isInside) return false;
  const T = P.byCol.get(pr.collider.handle); if (!T || T.fixed || T.mass > 15) return false; const b = T.b, t = b.translation(), q = b.rotation();
  Hd.held = { T, local: _v.set(pr.point.x - t.x, pr.point.y - t.y, pr.point.z - t.z).applyQuaternion(_q.set(q.x, q.y, q.z, q.w).invert()).clone() }; b.wakeUp(); T.plT = CLOCK.t; PL.onTake && PL.onTake(T); return true;
}
function drop(Hd) { Hd.held = null; }
function carry(Hd, p, dt) { const h = Hd.held; if (!h) return; const b = h.T.b, t = b.translation(), q = b.rotation(), m = h.T.mass;
  const a = _v.copy(h.local).applyQuaternion(_q.set(q.x, q.y, q.z, q.w)), lv = b.linvel(), av = b.angvel(), k = Math.min(1600, m * 380), c = 1.9 * Math.sqrt(k * m);
  const vx = lv.x + av.y * a.z - av.z * a.y, vy = lv.y + av.z * a.x - av.x * a.z, vz = lv.z + av.x * a.y - av.y * a.x; let fx = k * (p.x - t.x - a.x) - c * vx, fy = k * (p.y - t.y - a.y) - c * vy + m * 9.81, fz = k * (p.z - t.z - a.z) - c * vz;
  const f = Math.hypot(fx, fy, fz); if (f > 160) { fx *= 160 / f; fy *= 160 / f; fz *= 160 / f; } if (Math.hypot(p.x - t.x - a.x, p.y - t.y - a.y, p.z - t.z - a.z) > .9) return drop(Hd);
  b.applyImpulseAtPoint({ x: fx * dt, y: fy * dt, z: fz * dt }, { x: t.x + a.x, y: t.y + a.y, z: t.z + a.z }, true); b.setAngvel({ x: av.x * .88, y: av.y * .88, z: av.z * .88 }, true); }
function mouseGrab() { const M = PL.mouse; const h = ray(PL.head, PL.fwd, 1.8, grp(G.HAND, G.SOLID), body), d = h ? h.t : 1.2; M.dist = clamp(d, .4, 1); M.pos.copy(PL.head).addScaledVector(PL.fwd, d); take(M, M.pos); }
// use what you point at (headset: the right hand's beam or what is under your hand; screen: what is in the middle of your sight)
function use(H) { if (PL.frozen) return; let from = PL.head, dir = PL.fwd;
  if (renderer.xr.isPresenting && H) { H.ctrl.getWorldPosition(_v); from = _v.clone(); H.ctrl.getWorldDirection(_w); dir = _w.clone().negate(); const near = nearestUse(H.pos, null); if (near && near.pos.distanceTo(H.pos) < .35) { PL.onUse && PL.onUse(near); return; } }
  const U = nearestUse(from, dir); if (U) PL.onUse && PL.onUse(U); }
PL.pointed = () => { if (renderer.xr.isPresenting) { const H = PL.hands.find(h => h.on && h.src && h.src.handedness === 'right'); if (!H) return null; H.ctrl.getWorldPosition(_v); H.ctrl.getWorldDirection(_w); return nearestUse(_v, _w.clone().negate()); } return nearestUse(PL.head, PL.fwd); };

function update(dt) {
  const xr = renderer.xr.isPresenting, K = PL.keys; let mx = 0, mz = 0, shut = false;
  if (xr) { for (const H of PL.hands) { const gp = H.src && H.src.gamepad; if (!gp) continue; const ax = gp.axes, sx = ax[2] ?? ax[0] ?? 0, sy = ax[3] ?? ax[1] ?? 0, tr = gp.buttons[0] && gp.buttons[0].pressed, sq = gp.buttons[1] && gp.buttons[1].pressed, bb = (gp.buttons[5] && gp.buttons[5].pressed) || (gp.buttons[4] && gp.buttons[4].pressed);
      if (H.src.handedness === 'left') { mx = Math.abs(sx) > .15 ? sx : 0; mz = Math.abs(sy) > .15 ? sy : 0; if (tr || bb) shut = true; }
      else { if (Math.abs(sx) > .7 && !H.snap) { H.snap = true; rig.rotation.y -= Math.sign(sx) * Math.PI / 6; PL.yaw = rig.rotation.y; const c = camLocal(); rig.position.x = PL.pos.x - c.x; rig.position.z = PL.pos.z - c.z; } if (Math.abs(sx) < .3) H.snap = false;
        if (tr && !H.tr) use(H); H.tr = tr; if (bb && !H.b) PL.onStand && PL.onStand(); H.b = bb; }
      if (sq && !H.sq) take(H, H.pos.clone()); if (!sq && H.sq) drop(H); H.sq = sq; H.beam.visible = H.src.handedness === 'right' && !!PL.pointed(); } }
  else { mx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0); mz = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0); shut = !!K.Space; rig.rotation.y = PL.yaw; camera.rotation.set(PL.pitch, 0, 0, 'YXZ');
    const want = PL.seat ? (PL.covered ? .5 : PL.seat.eye || 1.15) : EYE; PL.eye = lerp(PL.eye, want, 1 - Math.exp(-dt * 7)); camera.position.set(0, PL.eye, 0); }
  // hands over your eyes shut them too
  if (xr) { camera.getWorldPosition(_v); camera.getWorldDirection(_w); let n = 0; for (const H of PL.hands) if (H.on && H.pos.distanceTo(_v.clone().addScaledVector(_w, .08)) < .13) n++; if (n === 2) shut = true; }
  PL.eyesShut = shut; PL.shutK = lerp(PL.shutK, shut ? 1 : 0, 1 - Math.exp(-dt * (shut ? 14 : 9)));
  if (PL.frozen) mx = mz = 0;
  if (PL.seat && (mx || mz)) { if (CLOCK.t - PL.sitT > .6) stand(); mx = mz = 0; }
  camera.getWorldDirection(PL.fwd); const yaw = Math.atan2(-PL.fwd.x, -PL.fwd.z), cl = camLocal(), sp = 1.25 * (K.ShiftLeft && !xr ? 2.2 : 1), len = Math.hypot(mx, mz) || 1;
  const want = { x: (mx * Math.cos(yaw) + mz * Math.sin(yaw)) / Math.max(1, len) * sp * dt, y: 0, z: (-mx * Math.sin(yaw) + mz * Math.cos(yaw)) / Math.max(1, len) * sp * dt };
  if (xr && !PL.seat) { want.x += rig.position.x + cl.x - PL.pos.x; want.z += rig.position.z + cl.z - PL.pos.z; }
  const before = PL.pos.clone();
  if (!PL.seat) { want.y = -.05; ctl.computeColliderMovement(col, want, undefined, GROUPS); const m = ctl.computedMovement(); PL.pos.x += m.x; PL.pos.z += m.z; PL.pos.y = 0; body.setNextKinematicTranslation(PL.pos); }
  PL.vel.subVectors(PL.pos, before).divideScalar(Math.max(dt, 1e-3)); PL.speed = lerp(PL.speed, PL.vel.length(), .3);
  if (PL.seat) { rig.position.set(PL.pos.x - cl.x, xr ? (PL.seat.lie ? -.8 : -.45) : 0, PL.pos.z - cl.z); } else rig.position.set(PL.pos.x - cl.x, 0, PL.pos.z - cl.z);
  rig.updateMatrixWorld(true); camera.getWorldPosition(PL.head); camera.getWorldDirection(PL.fwd);
  // how fast your head turns, not counting the stick's snap turns
  _w.set(0, 0, -1).applyQuaternion(camera.quaternion); const local = xr ? _w : PL.fwd;
  PL.turnRate = lerp(PL.turnRate, Math.acos(clamp(local.dot(lastF), -1, 1)) / Math.max(dt, 1e-3), .5); lastF.copy(local);
  for (const H of PL.hands) { if (!H.on) continue; H.grip.getWorldPosition(H.pos); H.hb.setNextKinematicTranslation(H.pos); carry(H, H.pos, dt); }
  if (!xr) { const M = PL.mouse; M.pos.copy(PL.head).addScaledVector(PL.fwd, M.dist); if (M.down) carry(M, M.pos, dt); }
}
// how fast you are moving away from a point, metres a second
PL.backFrom = p => { _v.subVectors(PL.pos, p).setY(0); const d = _v.length(); if (d < .01) return 0; return PL.vel.x * _v.x / d + PL.vel.z * _v.z / d; };
PL.room = () => { const x = PL.pos.x, z = PL.pos.z; if (x > 5.05 && z > 3.0) return 'bathroom'; if (x > 4.8 && z < 2.6) return 'bed alcove'; if (x < 2.4 && z < 2.2) return 'kitchen'; if (z > 3.9 && x < 2) return 'entry'; return 'living room'; };
Object.assign(PL, { init, place, update, sit, stand, use, take, drop });
export { PL };
