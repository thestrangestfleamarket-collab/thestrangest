// your hands: a headset's controllers or tracked hands, or a mouse; holding, pouring, chopping, pressing, stepping
import * as THREE from 'three';
import { G, V3, Q, UP, BOUNDS, mat, clamp } from './ctx.js';
import * as T from './tex.js';
import { Hand } from '../cantina/hands.js';

const _v = new V3(), _v2 = new V3(), _q = new Q(), _q2 = new Q(), _e = new THREE.Euler(), _sh = new V3(), _el = new V3(), _po = new V3();

function makeHand(i, xr) {
  const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glowTex(), color: 0xffd9a0, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
  marker.visible = false; marker.renderOrder = 40; marker.userData.nopick = true; G.scene.add(marker);
  return { i, xr, pos: new V3(), quat: new Q(), tip: new V3(), vel: new V3(), prev: new V3(), active: false, grip: false, use: false, _g: false, _u: false, gripDown: false, gripUp: false, useDown: false,
    vs: new V3(), held: null, cand: null, latch: new Set(), marker, relPos: new V3(), relQ: new Q(), tiltA: 0, chopT: 0, source: null, aim: null,
    pulse(v = 0.5, ms = 30) { try { this.source?.gamepad?.hapticActuators?.[0]?.pulse(v, ms); } catch (e) { /* no haptics */ } } };
}

function grab(h, cand) {
  let it = cand, fromSource = false;
  if (cand.take) { it = cand.take(); fromSource = true; it.obj.position.copy(h.pos); it.obj.position.y -= it.center.y; it.obj.quaternion.identity(); }
  if (it.held) it.held.held = null;
  it.held = h; h.held = it; it.free = false; it.grounded = -1; it.vel.set(0, 0, 0);
  it.onGrab(h);
  _q.copy(h.quat).invert();
  h.relQ.copy(_q).multiply(it.obj.quaternion);
  h.relPos.copy(it.obj.position).sub(h.pos).applyQuaternion(_q);
  h.tiltA = 0; h.chopT = 0;
  G.audio.play('grab'); h.pulse(0.4, 25);
  return it;
}

function release(h) {
  const it = h.held; h.held = null; if (!it || it.dead) return; it.held = null;
  if (it.onRelease(h)) return;
  const p = it.worldCenter(_v); let best = null, bd = 1e9;
  for (const t of G.targets) {
    if (!t.accepts(it)) continue;
    const tp = t.getPos(), d = Math.hypot(p.x - tp.x, p.z - tp.z);
    if (d < t.r && p.y > tp.y - 0.12 && p.y < tp.y + 0.32 && d - (t.prio || 0) * 0.05 < bd) { best = t; bd = d - (t.prio || 0) * 0.05; }
  }
  if (best) { best.receive(it); return; }
  it.drop(h.xr ? _v2.copy(h.vs).multiplyScalar(1.15).clampLength(0, 16) : _v2.set(0, 0, 0)); // the hand's real speed: thrown hard, it goes far
}

function findCand(h) {
  let best = null, bd = 1e9;
  for (const it of G.items) {
    if (it.locked || it.dead || (it.held && it.held === h)) continue;
    const d = it.worldCenter(_v).distanceTo(h.pos) - it.radius, sc = d - (it.kind === 'bowl' || it.tool ? 0.035 : 0) + (it.kind === 'prop' ? 0.06 : 0); // a bowl or a tool wins over loose food; a pork roll does not win over its own slices
    if (d < 0.055 && sc < bd) { best = it; bd = sc; }
  }
  if (best) return best;
  for (const s of G.sources) { if (!s.can()) continue; const d = s.pos.distanceTo(h.pos) - s.r; if (d < 0.05 && d < bd) { best = s; bd = d; } }
  return best;
}

function stepHand(h, dt) {
  h.gripDown = h.grip && !h._g; h.gripUp = !h.grip && h._g; h.useDown = h.use && !h._u; h._g = h.grip; h._u = h.use;
  if (dt > 0) { h.vel.copy(h.pos).sub(h.prev).divideScalar(dt); h.vs.lerp(h.vel, 0.4); } h.prev.copy(h.pos);
  if (!h.active) { h.marker.visible = false; if (h.held) release(h); return; }

  // ---- buttons
  if (h.xr) {
    let near = null, nd = 0.17;
    for (const b of G.buttons) {
      const d = h.tip.distanceTo(b.getPos());
      if (d < b.r + 0.015) { if (!h.latch.has(b)) { h.latch.add(b); if (!h.held) { b.press(); h.pulse(0.8, 50); } } }
      else if (d > b.r + 0.07) h.latch.delete(b);
      if (d < nd) { nd = d; near = b; }
    }
    if (h.useDown && !h.held && near && !h.latch.has(near)) { near.press(); h.pulse(0.8, 50); }
  } else if (h.aim?.button && (h.gripDown || h.useDown) && !h.held) { h.aim.button.press(); h.gripDown = false; }

  // ---- grab / hold / release
  if (!h.held) {
    const cand = h.xr ? findCand(h) : h.aim?.cand; h.cand = cand || null;
    if (cand) { h.marker.visible = true; if (cand.take) h.marker.position.copy(cand.pos); else cand.worldCenter(h.marker.position); const s = (cand.take ? cand.r : cand.radius) * 3.2; h.marker.scale.set(s, s, 1); h.marker.material.opacity = 0.28 + Math.sin(G.t * 6) * 0.08; }
    else h.marker.visible = false;
    if (h.gripDown && cand) grab(h, cand);
  } else {
    h.marker.visible = false;
    const it = h.held;
    if (it.dead || it.held !== h) { h.held = null; return; }
    if (h.xr) {
      if (it.tool) { it.obj.quaternion.copy(h.quat); it.obj.position.copy(h.pos); }
      else { it.obj.quaternion.copy(h.quat).multiply(h.relQ); it.obj.position.copy(h.relPos).applyQuaternion(h.quat).add(h.pos); }
    } else {
      let dy = it.lift;
      _q.setFromAxisAngle(UP, G.desk.yaw);
      if (it.tool && it.useMode === 'tilt') { h.tiltA += ((h.use ? 1.95 : 0) - h.tiltA) * Math.min(1, dt * 10); _q.multiply(_q2.setFromAxisAngle(_v.set(0, 0, 1), h.tiltA)); }
      if (it.tool && it.useMode === 'chop') { if (h.useDown && h.chopT <= 0) h.chopT = 0.3; if (h.chopT > 0) { h.chopT -= dt; dy -= 0.215 * Math.sin(Math.PI * clamp(1 - h.chopT / 0.3, 0, 1)); } }
      _v.copy(it.aim).applyQuaternion(_q); _v2.copy(h.pos).sub(_v); _v2.y += dy;
      it.obj.quaternion.copy(_q); it.obj.position.lerp(_v2, Math.min(1, dt * 30));
    }
    it.onHeld(dt, h);
    if (it.dead || it.held !== h) { h.held = null; return; }
    if (h.xr ? !h.grip : h.gripDown) release(h);
  }
}

export function buildInput(renderer, rig, camera, dom) {
  const skin = mat({ color: 0xe0b090, roughness: 0.6 });
  const ray = new THREE.Raycaster(); ray.far = 1.5;
  const desk = (G.desk = { yaw: 0, pitch: -0.35, keys: {}, locked: false, hand: makeHand(2, false), focus: 1.2 });
  const xrHands = [0, 1].map((i) => {
    const h = makeHand(i, true);
    const ctrl = renderer.xr.getController(i), grip = renderer.xr.getControllerGrip(i), hand = renderer.xr.getHand(i);
    rig.add(ctrl, grip, hand); h.ctrl = ctrl; h.gripSpace = grip; h.handSpace = hand;
    ctrl.addEventListener('connected', (e) => { h.source = e.data; });
    ctrl.addEventListener('disconnected', () => { h.source = null; h.grip = h.use = false; });
    ctrl.addEventListener('selectstart', () => { if (h.source?.hand) h.grip = true; else h.use = true; });
    ctrl.addEventListener('selectend', () => { if (h.source?.hand) h.grip = false; else h.use = false; });
    ctrl.addEventListener('squeezestart', () => { h.grip = true; });
    ctrl.addEventListener('squeezeend', () => { h.grip = false; });
    // a skinned hand for either side (the WebXR generic hand, as in the cantina) and a sleeved arm back to the shoulder
    h.models = { L: new Hand('L'), R: new Hand('R') }; for (const k in h.models) { h.models[k].root.visible = false; h.models[k].root.traverse((o) => { o.userData.nopick = true; }); G.scene.add(h.models[k].root); }
    const sleeve = mat({ color: 0xd8d4c8 }), seg = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 1, 10), sleeve); m.castShadow = true; m.userData.nopick = true; m.visible = false; G.scene.add(m); return m; };
    h.arm = { up: seg(), fore: seg() };
    return h;
  });
  G.hands = [...xrHands, desk.hand];

  // ---- desktop controls
  dom.addEventListener('mousemove', (e) => { if (document.pointerLockElement === dom || desk.drag) { desk.yaw -= e.movementX * 0.0023; desk.pitch = clamp(desk.pitch - e.movementY * 0.0023, -1.45, 1.2); } });
  dom.addEventListener('mousedown', (e) => {
    if (G.mode !== 'desktop') return;
    if (document.pointerLockElement !== dom) { try { dom.requestPointerLock?.(); } catch (err) { /* sandboxed */ } desk.drag = true; if (!desk.lockTried) { desk.lockTried = true; return; } }
    if (e.button === 0) { desk.hand.grip = true; } else if (e.button === 2) desk.hand.use = true;
  });
  window.addEventListener('mouseup', (e) => { desk.drag = false; if (e.button === 0) desk.hand.grip = false; else if (e.button === 2) desk.hand.use = false; });
  dom.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT') return; desk.keys[e.code] = true; if (['KeyE', 'KeyF', 'Space'].includes(e.code) && G.mode === 'desktop') { desk.hand.use = true; e.preventDefault(); } });
  window.addEventListener('keyup', (e) => { desk.keys[e.code] = false; if (['KeyE', 'KeyF', 'Space'].includes(e.code)) desk.hand.use = false; });

  let recentered = false, snapLatch = false;
  let xrFrames = 0; renderer.xr.addEventListener('sessionstart', () => { recentered = false; xrFrames = 0; rig.position.set(0, 0, 0.3); rig.rotation.set(0, 0, 0); camera.position.set(0, 1.7, 0); camera.quaternion.identity(); }); // the menu's roving view must not be taken for where you stand

  function owner(o) { for (let p = o; p; p = p.parent) if (!p.visible) return { skip: true };
    for (let p = o; p; p = p.parent) { if (p.userData.nopick) return { skip: true }; if (p.userData.item) return { item: p.userData.item }; if (p.userData.button) return { button: p.userData.button }; if (p.userData.source) return { source: p.userData.source }; } return {}; }

  function updateDesktop(dt) {
    const h = desk.hand, k = desk.keys; h.active = true;
    const f = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0), s = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
    if (f || s) { const sp = 1.3 * dt; rig.position.x += (-Math.sin(desk.yaw) * f + Math.cos(desk.yaw) * s) * sp; rig.position.z += (-Math.cos(desk.yaw) * f - Math.sin(desk.yaw) * s) * sp; }
    if (!desk.free) { rig.position.x = clamp(rig.position.x, BOUNDS.minX, BOUNDS.maxX); rig.position.z = clamp(rig.position.z, BOUNDS.minZ, BOUNDS.maxZ); rig.position.y = 0; }
    rig.rotation.set(0, 0, 0); camera.position.set(0, k.KeyC ? 1.25 : 1.62, 0); camera.rotation.set(desk.pitch, desk.yaw, 0, 'YXZ'); rig.updateMatrixWorld(true);
    // aim
    ray.setFromCamera({ x: 0, y: 0 }, camera);
    const hits = ray.intersectObjects(G.pickRoot.children, true);
    const aim = { point: null, cand: null, button: null, dist: 14 };
    for (const hit of hits) {
      const o = owner(hit.object); if (o.skip) continue; if (o.item && (o.item === h.held || o.item.dead)) continue;
      aim.point = hit.point; aim.dist = hit.distance;
      if (!h.held) { if (o.button) aim.button = o.button; else if (o.item && !o.item.locked) { if (o.item.kind === 'prop' && !o.item.pick) aim.prop = o.item; else aim.cand = o.item; } else if (o.source && o.source.can()) aim.cand = o.source; }
      break;
    }
    if (aim.point) h.pos.copy(aim.point); else h.pos.copy(ray.ray.direction).multiplyScalar(0.62).add(ray.ray.origin);
    if (!h.held && !aim.cand && !aim.button && aim.point) { // nearest thing to the aim point
      let bd = 0.075; for (const it of G.items) { if (it.locked || it.dead || it.kind === 'prop') continue; const d = it.worldCenter(_v).distanceTo(h.pos); if (d < Math.max(bd, it.radius * 0.9)) { bd = Math.min(bd, d); aim.cand = it; } }
      if (!aim.cand) for (const s of G.sources) if (s.can() && s.pos.distanceTo(h.pos) < s.r + 0.03) { aim.cand = s; break; }
      if (!aim.cand) for (const b of G.buttons) if (b.getPos().distanceTo(h.pos) < b.r + 0.02) { aim.button = b; break; }
    }
    if (!aim.cand && !aim.button && aim.prop) aim.cand = aim.prop;
    h.aim = aim; h.tip.copy(h.pos); h.quat.setFromAxisAngle(UP, desk.yaw);
    desk.focus += (aim.dist - desk.focus) * Math.min(1, dt * 5);
    stepHand(h, dt);
    const it = h.held;
    G.hoverText = it ? `${it.name} — ${it.hint()}  [LMB release${it.tool ? ' · hold RMB/E to ' + (it.useMode === 'chop' ? 'chop' : 'pour') : ''}]` : aim.button ? `[LMB] ${aim.button.name}` : aim.cand ? `[LMB] grab ${aim.cand.name}` : '';
  }

  function updateXR(dt) {
    const session = renderer.xr.getSession();
    desk.hand.active = false;
    camera.getWorldPosition(_v);
    if (!recentered && ++xrFrames > 3) { // once the headset's own pose has arrived: stand them in the middle of the cart, facing the counter, wherever they are in their room
      camera.getWorldDirection(_v2); rig.rotation.y += Math.PI - Math.atan2(_v2.x, _v2.z); rig.updateMatrixWorld(true); camera.getWorldPosition(_v); rig.position.x += 0 - _v.x; rig.position.z += 0.3 - _v.z; recentered = true; }
    else if (recentered) { rig.updateMatrixWorld(true); camera.getWorldPosition(_v); const m = 0.35; rig.position.x += clamp(_v.x, BOUNDS.minX - m, BOUNDS.maxX + m) - _v.x; rig.position.z += clamp(_v.z, BOUNDS.minZ - m, BOUNDS.maxZ + m) - _v.z; } // never outside the cart, however they walk their room
    for (const h of xrHands) {
      const src = h.source, isHand = !!src?.hand;
      h.active = !!src && (h.gripSpace.visible || h.handSpace.visible || h.ctrl.visible);
      if (!h.active) { h.models.L.root.visible = h.models.R.root.visible = h.arm.up.visible = h.arm.fore.visible = false; stepHand(h, dt); continue; }
      const space = h.gripSpace.visible ? h.gripSpace : h.ctrl;
      space.getWorldPosition(h.pos); (h.ctrl.visible ? h.ctrl : space).getWorldQuaternion(h.quat); // position from the grip, orientation from the pointing ray
      if (isHand) {
        const J = h.handSpace.joints || {}, it = J['index-finger-tip'], tt = J['thumb-tip'];
        if (it && tt) { it.getWorldPosition(h.tip); tt.getWorldPosition(_v2); h.pos.copy(h.tip).add(_v2).multiplyScalar(0.5); }
      } else h.tip.set(0, 0, -0.08).applyQuaternion(h.quat).add(h.pos);
      { // the hand's model follows the wrist; its fingers curl by your own fingers (tracked) or by the grip and trigger
        const sd = src.handedness === 'left' ? 'L' : 'R', M = h.models[sd]; h.models[sd === 'L' ? 'R' : 'L'].root.visible = false; M.root.visible = true;
        const J = isHand ? h.handSpace.joints || {} : null, wj = J && J.wrist;
        if (wj) { wj.getWorldPosition(M.root.position); wj.getWorldQuaternion(M.root.quaternion);
          M.curl = ['thumb', 'index', 'middle', 'ring', 'pinky'].map((f) => { const tip = J[f === 'thumb' ? 'thumb-tip' : f + '-finger-tip'], base = J[f === 'thumb' ? 'thumb-metacarpal' : f + '-finger-phalanx-proximal']; if (!tip || !base) return 0.1; return clamp((0.085 - tip.getWorldPosition(_v).distanceTo(base.getWorldPosition(_v2))) / 0.05, 0, 1); });
        } else { M.root.quaternion.copy(h.quat).multiply(_q2.setFromAxisAngle(_v.set(0, 0, 1), sd === 'R' ? -1.35 : 1.35)); M.root.position.copy(_v.set(0, -0.015, 0.09).applyQuaternion(h.quat)).add(h.pos); const gr = h.grip ? 1 : 0.14; M.curl = [h.grip || h.use ? 0.7 : 0.2, h.use ? 1 : h.grip ? 0.75 : 0.12, gr, gr, gr]; }
        M.update(dt);
        // shoulder guessed from the head; elbow by the two-bone rule, hanging down and out
        const side = sd === 'R' ? 1 : -1, W = M.root.position; camera.getWorldPosition(_v); camera.getWorldDirection(_v2); const yaw = Math.atan2(-_v2.x, -_v2.z);
        const S = _sh.set(side * 0.2, -0.24, 0.04).applyAxisAngle(UP, yaw).add(_v), A = 0.31, B = 0.28, dir = _el.copy(W).sub(S), d = clamp(dir.length(), 0.08, A + B - 0.005); dir.normalize();
        const x = (A * A - B * B + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, A * A - x * x)), pole = _po.set(side * 0.55, -1, 0.35).applyAxisAngle(UP, yaw); pole.addScaledVector(dir, -pole.dot(dir)).normalize();
        const E = _el.copy(S).addScaledVector(dir, x).addScaledVector(pole, hh);
        const put = (m, a, b2) => { m.visible = true; m.position.copy(a).add(b2).multiplyScalar(0.5); _v2.copy(b2).sub(a); m.scale.set(1, _v2.length(), 1); m.quaternion.setFromUnitVectors(UP, _v2.normalize()); };
        if (G.cook && G.cook.on) h.arm.up.visible = h.arm.fore.visible = false; else { put(h.arm.up, E, S); put(h.arm.fore, W, E); }   // the chef's own arms reach your hands (cook.js)
      }
      { camera.getWorldPosition(_v); const up = h.pos.y > _v.y - 0.2, sg = Math.abs(h.vel.x) > 0.35 ? Math.sign(h.vel.x) : 0; h.wav = (h.wav || []).filter((t) => G.t - t < 1.3);
        if (up && sg && sg !== h.wsg) { h.wsg = sg; h.wav.push(G.t); if (h.wav.length >= 3 && G.t - (G.lastWave || -9) > 4) { G.lastWave = G.t; G.game.onWave?.(); } } if (!up) h.wav.length = 0; }
      stepHand(h, dt);
    }
    // thumbstick locomotion
    if (session) for (const src of session.inputSources) {
      const gp = src.gamepad; if (!gp || src.hand) continue;
      const ax = gp.axes.length >= 4 ? gp.axes[2] : gp.axes[0] || 0, ay = gp.axes.length >= 4 ? gp.axes[3] : gp.axes[1] || 0;
      if (src.handedness === 'left') {
        if (Math.abs(ax) > 0.15 || Math.abs(ay) > 0.15) {
          camera.getWorldDirection(_v); const yaw = Math.atan2(-_v.x, -_v.z), sp = 1.1 * dt;
          rig.position.x += (-Math.sin(yaw) * -ay + Math.cos(yaw) * ax) * sp; rig.position.z += (-Math.cos(yaw) * -ay - Math.sin(yaw) * ax) * sp;
          camera.getWorldPosition(_v); // keep the head inside the cart while stick-moving
          rig.position.x += clamp(_v.x, BOUNDS.minX, BOUNDS.maxX) - _v.x; rig.position.z += clamp(_v.z, BOUNDS.minZ, BOUNDS.maxZ) - _v.z;
        }
      } else {
        if (Math.abs(ax) > 0.6) { if (!snapLatch) { snapLatch = true; const a = -Math.sign(ax) * ((G.set ? G.set.turn : 30) * Math.PI / 180); camera.getWorldPosition(_v); rig.position.sub(_v).applyAxisAngle(UP, a).add(_v); rig.rotation.y += a; } } else if (Math.abs(ax) < 0.3) snapLatch = false;
        if (Math.abs(ay) > 0.5 && Math.abs(ax) < 0.4) rig.position.y = clamp(rig.position.y - ay * dt * 0.35, -0.45, 0.45);
      }
    }
    G.hoverText = '';
  }

  return { update(dt) { if (renderer.xr.isPresenting) updateXR(dt); else if (G.mode === 'desktop') updateDesktop(dt); }, grab, release, desk };
}
