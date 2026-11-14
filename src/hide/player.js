// DEAD END's body: yours. It has a height that follows your head, cannot pass through anything, climbs, carries, breathes fog, leaves wet prints, and makes exactly the noise you make
import { CLOCK, THREE, RAPIER, G, grp, clamp, lerp, rnd, renderer, scene, camera, rig, P, ray } from './core.js';
import { WORLD } from './world.js';
import { A } from './sound.js';

const R = .22, EYES = [1.66, .8, .34], DROP = [0, -.75, -1.25], SPEED = [2.3, 1.15, .6], GROUPS = grp(G.PLAYER, G.SOLID | G.SEE);
const PL = { pos: new THREE.Vector3(0, 0, -2.6), head: new THREE.Vector3(), fwd: new THREE.Vector3(), yaw: 0, pitch: 0, eye: EYES[0], stance: 0, H: 1.78, vy: 0, grounded: true, speed: 0, run: false, blind: 0, wet: 0, stride: 0,
  noises: [], prints: [], puffs: [], breath: { phase: 0, air: 1, exert: 0, holding: false, want: false }, hands: [], keys: {}, mantle: null, frozen: false, onUse: null, moved: 0 };
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
let body, col, ctl, puffM, printM, printI = 0; const puffS = [], printS = [];

// a noise the thing might hear: loud 1 carries the alley's length, .1 a couple of metres
PL.buzz = (v, ms) => { if (!renderer.xr.isPresenting) return; for (const H of PL.hands) { const gp = H.src && H.src.gamepad, h = gp && (gp.hapticActuators && gp.hapticActuators[0]); try { if (h && h.pulse) h.pulse(Math.min(1, v), ms); else if (gp && gp.vibrationActuator) gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: Math.min(1, v), weakMagnitude: Math.min(1, v) }); } catch (e) {} } };
PL.noise = (pos, loud, what) => { if (loud > .02) PL.noises.push({ x: pos.x, y: pos.y ?? .5, z: pos.z, loud, what, t: CLOCK.t }); };

function init() {
  body = P.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(PL.pos.x, PL.pos.y, PL.pos.z));
  col = P.world.createCollider(RAPIER.ColliderDesc.capsule(PL.H / 2 - R, R).setTranslation(0, PL.H / 2, 0).setCollisionGroups(GROUPS), body); PL.body = body; PL.col = col;
  ctl = P.world.createCharacterController(.02); ctl.enableAutostep(.32, .12, true); ctl.enableSnapToGround(.3); ctl.setApplyImpulsesToDynamicBodies(true); ctl.setCharacterMass(70); ctl.setMaxSlopeClimbAngle(.9); ctl.setMinSlopeSlideAngle(.7);
  puffM = new THREE.SpriteMaterial({ map: WORLD.glowT, color: 0xb8c4d0, transparent: true, opacity: 0, depthWrite: false });
  for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(puffM.clone()); s.visible = false; scene.add(s); puffS.push({ s, t: 9, v: new THREE.Vector3() }); }
  printM = new THREE.MeshStandardMaterial({ color: 0x030405, roughness: .05, transparent: true, opacity: .7, depthWrite: false, envMapIntensity: 4 });
  for (let i = 0; i < 36; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.1, .26), printM.clone()); m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 2; scene.add(m); printS.push(m); }
  const hm = new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: .8 });
  for (let i = 0; i < 2; i++) { const grip = renderer.xr.getControllerGrip(i), mesh = new THREE.Group(), part = (w, h, d, x, y, z, rx = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hm); m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = true; mesh.add(m); };   // a gloved hand: palm, four fingers curled a little, a thumb, a cuff
    part(.082, .028, .09, 0, 0, .01); for (let f = 0; f < 4; f++) { part(.017, .018, .05, -.031 + f * .0207, -.004, -.058, -.25); part(.016, .016, .035, -.031 + f * .0207, -.018, -.094, -.7); } part(.02, .02, .05, (i ? -1 : 1) * .05, -.004, -.02, 0); part(.074, .05, .1, 0, .002, .1); mesh.rotation.x = -.5; grip.add(mesh); rig.add(grip);
    const hb = P.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -5, 0)); P.world.createCollider(RAPIER.ColliderDesc.ball(.05).setCollisionGroups(grp(G.HAND, G.SOLID)), hb);
    const H = { grip, hb, pos: new THREE.Vector3(0, -5, 0), last: new THREE.Vector3(), on: false, src: null, held: null, pin: -1, climb: false, sq: false, tr: false }; PL.hands.push(H);
    grip.addEventListener('connected', e => { H.src = e.data; H.on = true; }); grip.addEventListener('disconnected', () => { H.on = false; H.src = null; drop(H); }); }
  // the body you see when you look down, and whose shadow the lamps throw
  const cloth = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: .9 }), bg = new THREE.Group(), torso = new THREE.Mesh(new THREE.CapsuleGeometry(.15, .34, 4, 10), cloth), legs = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.CapsuleGeometry(.075, .62, 4, 8), cloth); l.position.set(s * .1, .4, 0); l.castShadow = true; bg.add(l); return l; }); torso.castShadow = true; bg.add(torso); scene.add(bg); PL.bodyG = bg; PL.torso = torso; PL.legs = legs;
  PL.mouse = { held: null, pin: -1, dist: .8, down: false, pos: new THREE.Vector3() };
  addEventListener('keydown', e => { if (e.repeat) return; PL.keys[e.code] = true; if (e.code === 'KeyC') setStance((PL.stance + 1) % 3); if (e.code === 'KeyE') use(); if (e.code === 'Space') { e.preventDefault(); tryMantle(); } });
  addEventListener('keyup', e => { PL.keys[e.code] = false; });
  addEventListener('mousemove', e => { if (document.pointerLockElement !== renderer.domElement) return; PL.yaw -= e.movementX * .0022; PL.pitch = clamp(PL.pitch - e.movementY * .0022, -1.5, 1.5); });
  addEventListener('mousedown', e => { if (document.pointerLockElement === renderer.domElement && e.button === 0) { PL.mouse.down = true; mouseGrab(); } }); addEventListener('mouseup', () => { const h = PL.mouse.held; PL.mouse.down = false; drop(PL.mouse); if (h && !PL.frozen) { const v = clamp(15 / (h.T.mass + 1), 2, 8), m = h.T.mass; h.T.b.applyImpulse({ x: PL.fwd.x * v * m, y: (PL.fwd.y * v + 1.2) * m, z: PL.fwd.z * v * m }, true); h.T.plT = CLOCK.t; } });
  addEventListener('keydown', e => { if (!e.repeat && /^Digit[1-3]$/.test(e.code) && PL.onAlt) PL.onAlt(+e.code.slice(5) - 1); });
}
function place(x, y, z, yaw) { PL.pos.set(x, y, z); PL.yaw = yaw; PL.pitch = 0; PL.vy = 0; PL.stance = 0; PL.eye = EYES[0]; body.setTranslation(PL.pos, true); rig.rotation.y = yaw; rig.position.set(x - camLocal().x, y, z - camLocal().z); for (const s of printS) s.visible = false; PL.key = false; PL.damp = 0; PL.prints.length = 0; PL.noises.length = 0; PL.wet = 0; PL.breath.air = 1; PL.breath.exert = 0; PL.mantle = null; }
const camLocal = () => renderer.xr.isPresenting ? _w.set(camera.position.x, 0, camera.position.z).applyAxisAngle(UP, rig.rotation.y) : _w.set(0, 0, 0);
function fits(H, x, y, z) { const r = Math.min(R, H / 2 - .01), sh = new RAPIER.Capsule(Math.max(.01, H / 2 - r), r); return !P.world.intersectionWithShape({ x, y: y + H / 2 + .04, z }, { x: 0, y: 0, z: 0, w: 1 }, sh, undefined, GROUPS, col); }
function setH(H) { if (Math.abs(H - PL.H) < .02) return true; if (H > PL.H && !fits(H, PL.pos.x, PL.pos.y, PL.pos.z)) return false; const r = Math.min(R, H / 2 - .01); col.setShape(new RAPIER.Capsule(Math.max(.01, H / 2 - r), r)); col.setTranslationWrtParent({ x: 0, y: H / 2, z: 0 }); PL.H = H; return true; }
function setStance(s) { if (PL.frozen) return; if (s < PL.stance && !renderer.xr.isPresenting && !fits(EYES[s] + .12, PL.pos.x, PL.pos.y, PL.pos.z)) { if (s === 0 && fits(EYES[1] + .12, PL.pos.x, PL.pos.y, PL.pos.z)) s = 1; else return; } PL.stance = s; A.at('cloth', PL.head, .12, 1.3); }

/* hands: carry what is loose, hang from what is not, pull the blanket by its hem */
function take(Hd, p) {
  const c = WORLD.cloth, i = c.near(p, .2); if (i >= 0) { Hd.pin = i; c.pins.set(i, p); A.at('cloth', p, .3); return; }
  const pr = P.world.projectPoint(p, true, undefined, grp(G.HAND, G.SOLID)); if (!pr) return; const d = Math.hypot(pr.point.x - p.x, pr.point.y - p.y, pr.point.z - p.z); if (d > .16 && !pr.isInside) return;
  const T = P.byCol.get(pr.collider.handle); if (T && T.isKey) { PL.key = true; T.b.setTranslation({ x: 0, y: -40, z: 0 }, false); T.b.sleep(); T.o.visible = false; A.at('glass', p, .25, 1.9); PL.noise(p, .1, 'a key'); return; }
  if (T && !T.fixed && !T.lid && T.mass < 60) { T.plT = CLOCK.t; const b = T.b, t = b.translation(), q = b.rotation(); Hd.held = { T, local: _v.set(pr.point.x - t.x, pr.point.y - t.y, pr.point.z - t.z).applyQuaternion(_q.set(q.x, q.y, q.z, q.w).invert()).clone() }; b.wakeUp(); }
  else if (Hd.grip) { Hd.climb = true; Hd.last.copy(p); }
}
function drop(Hd) { if (Hd.pin >= 0) WORLD.cloth.pins.delete(Hd.pin); Hd.pin = -1; Hd.held = null; Hd.climb = false; }
function carry(Hd, p, dt) { if (Hd.pin >= 0) WORLD.cloth.pins.set(Hd.pin, p); const h = Hd.held; if (!h) return; const b = h.T.b, t = b.translation(), q = b.rotation(), m = h.T.mass;
  const a = _v.copy(h.local).applyQuaternion(_q.set(q.x, q.y, q.z, q.w)), lv = b.linvel(), av = b.angvel(), k = Math.min(2200, m * 420), c = 1.9 * Math.sqrt(k * m);
  const vx = lv.x + av.y * a.z - av.z * a.y, vy = lv.y + av.z * a.x - av.x * a.z, vz = lv.z + av.x * a.y - av.y * a.x; let fx = k * (p.x - t.x - a.x) - c * vx, fy = k * (p.y - t.y - a.y) - c * vy + m * 9.81, fz = k * (p.z - t.z - a.z) - c * vz;
  const f = Math.hypot(fx, fy, fz), mx = 280; if (f > mx) { fx *= mx / f; fy *= mx / f; fz *= mx / f; } if (Math.hypot(p.x - t.x - a.x, p.y - t.y - a.y, p.z - t.z - a.z) > 1.1) return drop(Hd);
  b.applyImpulseAtPoint({ x: fx * dt, y: fy * dt, z: fz * dt }, { x: t.x + a.x, y: t.y + a.y, z: t.z + a.z }, true); b.setAngvel({ x: av.x * .9, y: av.y * .9, z: av.z * .9 }, true); }
function mouseGrab() { const M = PL.mouse; camera.getWorldDirection(_v); const h = ray(PL.head, _v, 1.9, grp(G.HAND, G.SOLID), body), d = h ? clamp(h.t, .4, 1.9) : 1.2; M.dist = clamp(d, .45, 1.05); M.pos.copy(PL.head).addScaledVector(_v, d); take(M, M.pos); }
// open or shut the nearest lid or door: pointed at, or simply within reach
function use() { if (PL.frozen) return; if (PL.onUse && PL.onUse()) return; let best = null, bd = 1.5; const from = renderer.xr.isPresenting && PL.hands[1].on ? PL.hands[1].pos : PL.head;
  for (const id in P.lids) { const L = P.lids[id], t = L.T.o.children[0].getWorldPosition(_v), d = t.distanceTo(from); if (d < bd) { bd = d; best = L; } }
  if (!best) return; if (!best.set(!best.want)) { PL.noise(best.T.b.translation(), .45, 'a chain rattling'); A.at(['metal1', 'metal2'], best.T.b.translation(), .5, 1.5); return; } PL.noise(best.T.b.translation(), .4, 'a hinge'); A.at('gate', best.T.b.translation(), .25, 1.7); }

// over, onto or into something up to chest height
function tryMantle() { if (PL.frozen || PL.mantle || !PL.grounded) return; const d = _v.copy(PL.fwd).setY(0).normalize(), o = { x: PL.pos.x, y: PL.pos.y + .3, z: PL.pos.z }; let h = ray(o, d, .95, GROUPS, body); o.y = PL.pos.y + .75; const h2 = ray(o, d, .95, GROUPS, body); if (!h || (h2 && h2.t < h.t)) h = h2; if (!h) return;
  const down = { x: 0, y: -1, z: 0 }, top = PL.pos.y + 2, at = t => ({ x: PL.pos.x + d.x * t, y: top, z: PL.pos.z + d.z * t }), rim = ray(at(h.t + .04), down, 2.6, GROUPS, body); if (!rim || top - rim.t - PL.pos.y > 1.45) return;
  for (const far of [.5, .75, .35]) { const l = ray(at(h.t + far), down, 3.4, GROUPS, body); if (!l) continue; const y = top - l.t; if (y - PL.pos.y > 1.45) continue; const p = at(h.t + far); if (!fits(EYES[2] + .12, p.x, y, p.z)) continue;
    PL.mantle = { from: PL.pos.clone(), to: new THREE.Vector3(p.x, y, p.z), top: Math.max(top - rim.t, y) + .08, t: 0 }; if (!renderer.xr.isPresenting && !fits(EYES[PL.stance] + .12, p.x, y, p.z)) PL.stance = fits(EYES[1] + .12, p.x, y, p.z) ? 1 : 2;
    const T = P.byCol.get(h.col.handle); PL.noise(PL.pos, .3, 'climbing'); A.hit(T ? T.kind : 'stone', at(h.t), .35); return; } }

function update(dt) {
  const xr = renderer.xr.isPresenting, K = PL.keys, B = PL.breath; let mx = 0, mz = 0, run = false;
  if (xr) { for (const H of PL.hands) { const gp = H.src && H.src.gamepad; if (!gp) continue; const ax = gp.axes, sx = ax[2] ?? ax[0] ?? 0, sy = ax[3] ?? ax[1] ?? 0, tr = gp.buttons[0] && gp.buttons[0].pressed, sq = gp.buttons[1] && gp.buttons[1].pressed, a = gp.buttons[4] && gp.buttons[4].pressed;
      if (H.src.handedness === 'left') { mx = Math.abs(sx) > .15 ? sx : 0; mz = Math.abs(sy) > .15 ? sy : 0; run = Math.hypot(sx, sy) > .92 || (gp.buttons[3] && gp.buttons[3].pressed); B.want = !!tr; const x = gp.buttons[4] && gp.buttons[4].pressed; if (x && !H.x && PL.onAlt) PL.onAlt(-1); H.x = x; }
      else { if (Math.abs(sx) > .7 && !H.snap) { H.snap = true; rig.rotation.y -= Math.sign(sx) * Math.PI / 6; PL.yaw = rig.rotation.y; const c = camLocal(); rig.position.x = PL.pos.x - c.x; rig.position.z = PL.pos.z - c.z; } if (Math.abs(sx) < .3) H.snap = false;
        if (Math.abs(sy) > .75 && !H.cr) { H.cr = true; setStance(clamp(PL.stance + Math.sign(sy), 0, 2)); } if (Math.abs(sy) < .3) H.cr = false; if (tr && !H.tr) use(); H.tr = tr; if (a && !H.a) tryMantle(); H.a = a; }
      if (sq && !H.sq) take(H, H.pos.clone()); if (!sq && H.sq) drop(H); H.sq = sq; } }
  else { mx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0); mz = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0); run = !!K.ShiftLeft; B.want = !!K.KeyQ; rig.rotation.y = PL.yaw; camera.rotation.set(PL.pitch, 0, 0, 'YXZ');
    const want = EYES[PL.stance]; PL.eye = lerp(PL.eye, want, 1 - Math.exp(-dt * 9)); camera.position.set(0, PL.eye, 0); }
  if (PL.frozen) { mx = mz = 0; }
  const off = xr ? DROP[PL.stance] : 0, headY = clamp(camera.position.y + off, .26, 2.1); setH(clamp(headY + .12, .46, 1.95));
  camera.getWorldDirection(PL.fwd); const yaw = Math.atan2(-PL.fwd.x, -PL.fwd.z), cl = camLocal(), low = headY < .6 ? 2 : headY < 1.15 ? 1 : 0, sp = SPEED[low] * (run && low === 0 ? 1.8 : 1), len = Math.hypot(mx, mz) || 1;
  const want = { x: (mx * Math.cos(yaw) + mz * Math.sin(yaw)) / Math.max(1, len) * sp * dt, y: 0, z: (-mx * Math.sin(yaw) + mz * Math.cos(yaw)) / Math.max(1, len) * sp * dt };
  if (xr) { want.x += rig.position.x + cl.x - PL.pos.x; want.z += rig.position.z + cl.z - PL.pos.z; }
  let climbing = false; for (const H of PL.hands) if (H.climb && H.on) { climbing = true; want.x += H.last.x - H.pos.x; want.y += H.last.y - H.pos.y; want.z += H.last.z - H.pos.z; }
  if (PL.mantle) { const M = PL.mantle; M.t = Math.min(1, M.t + dt / .6); const e = M.t * M.t * (3 - 2 * M.t); PL.pos.lerpVectors(M.from, M.to, e); PL.pos.y = lerp(lerp(M.from.y, M.top, Math.min(1, M.t * 2)), M.to.y, Math.max(0, M.t * 2 - 1)); PL.vy = 0; if (M.t >= 1) PL.mantle = null; PL.moved = 0; }
  else { if (climbing) PL.vy = 0; else { PL.vy = PL.grounded ? -1 : PL.vy - 9.81 * dt; want.y += PL.vy * dt; }
    ctl.computeColliderMovement(col, want, undefined, GROUPS); for (let i = 0; i < ctl.numComputedCollisions(); i++) { const c = ctl.computedCollision(i), T = c && c.collider && P.byCol.get(c.collider.handle); if (T && !T.fixed) T.plT = CLOCK.t; } const m = ctl.computedMovement(); PL.grounded = ctl.computedGrounded(); PL.pos.x += m.x; PL.pos.y += m.y; PL.pos.z += m.z; PL.moved = Math.hypot(m.x, m.z);
    if (PL.pos.y < -6) PL.pos.set(0, .1, -2.6); }
  body.setNextKinematicTranslation(PL.pos); PL.speed = lerp(PL.speed, PL.moved / Math.max(dt, .001), .25); PL.run = run && PL.speed > 3; PL.low = low;
  rig.position.set(PL.pos.x - cl.x, PL.pos.y + off, PL.pos.z - cl.z); rig.updateMatrixWorld(true); camera.getWorldPosition(PL.head);
  if (xr) PL.head.y = Math.max(PL.head.y, PL.pos.y + .2);
  PL.blind = lerp(PL.blind, P.world.intersectionWithShape(PL.head, { x: 0, y: 0, z: 0, w: 1 }, new RAPIER.Ball(.07), undefined, grp(G.PLAYER, G.SOLID), col) ? 1 : 0, 1 - Math.exp(-dt * 14));

  /* footsteps: sound for you, noise for it, wet prints after a puddle */
  if (PL.grounded && !PL.mantle) { PL.stride += PL.moved; const st = [.78, .58, .46][low]; if (PL.stride > st) { PL.stride = 0; let loud = low === 0 ? (PL.run ? .85 : PL.speed > 1.2 ? .4 : .2) : low === 1 ? .12 : .06; const f = { x: PL.pos.x, y: PL.pos.y + .05, z: PL.pos.z };
      const wet = PL.pos.y < .1 && WORLD.puddles.some(p => Math.hypot(p.x - f.x, p.z - f.z) < p.r); if (wet) { loud *= 1.6; PL.wet = 11; PL.damp = 60; A.at('splash', f, clamp(loud, .1, .6)); } A.at(['step1', 'step2', 'step3', 'step4'], f, loud * .55 + .03, low ? .8 : 1); PL.noise(f, loud, 'footsteps');
      if (PL.wet > 0 && !wet) { PL.wet -= st; const s = printS[printI++ % printS.length], side = printI % 2 ? .09 : -.09; s.position.set(f.x + Math.cos(yaw) * side, PL.pos.y + .008, f.z - Math.sin(yaw) * side); s.rotation.z = yaw; s.material.opacity = .75 * PL.wet / 11; s.visible = true; s.userData.t = 0; PL.prints.push({ x: f.x, z: f.z, yaw, t: CLOCK.t }); if (PL.prints.length > 40) PL.prints.shift(); } } }
  B.exert = clamp(B.exert + (PL.run ? dt * .22 : -dt * .05), 0, 1);

  /* breath: fog you cannot help, unless you hold it */
  if (B.want && B.air > 0 && !PL.frozen) { B.holding = true; B.air -= dt / (13 - 7 * B.exert); }
  else { if (B.holding) { B.holding = false; if (B.air <= .03) { PL.noise(PL.head, .45, 'a gasp'); A.at('breath', PL.head, .5, 1.25); B.exert = Math.max(B.exert, .75); B.phase = .95; } } B.air = Math.min(1, B.air + dt / 5);
    B.phase += dt / (3.9 - 2.4 * B.exert); if (B.phase >= 1) { B.phase = 0; const s = puffS.find(p => p.t > 2) || puffS[0]; s.t = 0; s.s.position.copy(PL.head).addScaledVector(PL.fwd, .14); s.s.position.y -= .07; s.v.copy(PL.fwd).multiplyScalar(.32 + B.exert * .3); s.v.y += .1; s.s.visible = true; s.k = .7 + B.exert * .6;
      const hit = ray(PL.head, PL.fwd, .5), reach = hit ? Math.max(0, hit.t - .06) : .44; if (hit && hit.t < .2) s.s.position.copy(PL.head).addScaledVector(PL.fwd, reach * .5); PL.puffs.push({ x: PL.head.x + PL.fwd.x * reach, y: s.s.position.y, z: PL.head.z + PL.fwd.z * reach, t: CLOCK.t }); if (PL.puffs.length > 6) PL.puffs.shift(); PL.noise(PL.head, .035 + B.exert * .12, 'breathing'); } }
  for (const p of puffS) if (p.t < 2) { p.t += dt; p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(1 - dt * 1.2); const u = p.t / 1.7; p.s.scale.setScalar(.07 + u * .42 * p.k); const tc = WORLD.torch, seen = clamp(WORLD.lit(p.s.position.x, p.s.position.z) * 1.1 + (tc && tc.on ? clamp(1.3 - p.s.position.distanceTo(tc.at) / 3.5, 0, 1) : 0), .04, 1); p.s.material.opacity = Math.max(0, .22 * p.k * seen * Math.sin(Math.min(1, u) * Math.PI)); if (u >= 1) p.s.visible = false; }
  for (const s of printS) if (s.visible) { s.userData.t += dt; if (s.userData.t > 45) s.visible = false; }

  /* hands; one held over your mouth holds your breath; and the body under your head */
  if (xr) { _v.copy(PL.head).addScaledVector(PL.fwd, .07); _v.y -= .09; for (const H of PL.hands) if (H.on && H.pos.distanceTo(_v) < .15) B.want = true; }
  PL.damp = Math.max(0, (PL.damp || 0) - dt);
  { const h = Math.max(.3, PL.head.y - PL.pos.y), f = _w.copy(PL.fwd).setY(0).normalize(), bg = PL.bodyG, k = clamp(h / 1.66, .25, 1); bg.position.set(PL.pos.x - f.x * (.1 + (1 - k) * .35), PL.pos.y, PL.pos.z - f.z * (.1 + (1 - k) * .35)); bg.rotation.y = Math.atan2(f.x, f.z); PL.torso.position.y = h * .68 - .06; PL.torso.scale.y = k; for (const l of PL.legs) { l.scale.y = k; l.position.y = h * .25; } bg.visible = !PL.thing; }
  for (const H of PL.hands) { if (!H.on) continue; H.last.copy(H.pos); H.grip.getWorldPosition(H.pos); H.hb.setNextKinematicTranslation(H.pos); carry(H, H.pos, dt); }
  if (!xr) { const M = PL.mouse; M.pos.copy(PL.head).addScaledVector(PL.fwd, M.dist); if (M.down) carry(M, M.pos, dt); }
}
// the points of you that can be seen: head, chest, hips, shins, and your hands
PL.points = out => { const h = PL.head.y - PL.pos.y; out.length = 0; out.push(PL.head.x, PL.head.y, PL.head.z); for (const t of [.72, .45, .12]) out.push(lerp(PL.pos.x, PL.head.x, t), PL.pos.y + h * t, lerp(PL.pos.z, PL.head.z, t)); for (const H of PL.hands) if (H.on) out.push(H.pos.x, H.pos.y, H.pos.z); return out; };
// the balls the blanket drapes over
PL.balls = out => { out.length = 0; const h = PL.head.y - PL.pos.y;
  if (PL.low) { const f = _v.copy(PL.fwd).setY(0).normalize(); out.push({ x: PL.head.x, y: PL.head.y - .1, z: PL.head.z, r: .21, up: true }, { x: PL.pos.x, y: PL.pos.y + Math.max(0, h - .3), z: PL.pos.z, r: .3, up: true }); if (PL.low === 2) out.push({ x: PL.pos.x - f.x * .55, y: PL.pos.y, z: PL.pos.z - f.z * .55, r: .28, up: true }, { x: PL.pos.x - f.x * 1.05, y: PL.pos.y - .08, z: PL.pos.z - f.z * 1.05, r: .24, up: true }); }
  for (const H of PL.hands) if (H.on) out.push({ x: H.pos.x, y: H.pos.y, z: H.pos.z, r: .08 }); if (PL.mouse.down) out.push({ x: PL.mouse.pos.x, y: PL.mouse.pos.y, z: PL.mouse.pos.z, r: .07 }); return out; };
Object.assign(PL, { init, place, update, setStance, use, tryMantle, fits });
export { PL };
