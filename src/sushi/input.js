// your hands: a headset's controllers or tracked hands, or a mouse; holding, pouring, chopping, pressing, stepping
import * as THREE from 'three';
import { G, V3, Q, UP, BOUNDS, mat, clamp } from './ctx.js';
import * as T from './tex.js';

const _v = new V3(), _v2 = new V3(), _q = new Q(), _q2 = new Q(), _e = new THREE.Euler();

function makeHand(i, xr) {
  const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glowTex(), color: 0xffd9a0, transparent: true, opacity: 0.4, depthTest: false, blending: THREE.AdditiveBlending }));
  marker.visible = false; marker.renderOrder = 40; marker.userData.nopick = true; G.scene.add(marker);
  return { i, xr, pos: new V3(), quat: new Q(), tip: new V3(), vel: new V3(), prev: new V3(), active: false, grip: false, use: false, _g: false, _u: false, gripDown: false, gripUp: false, useDown: false,
    held: null, cand: null, latch: new Set(), marker, relPos: new V3(), relQ: new Q(), tiltA: 0, chopT: 0, source: null, aim: null,
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
  it.drop(_v2.copy(h.vel).clampLength(0, 2.5));
}

function findCand(h) {
  let best = null, bd = 1e9;
  for (const it of G.items) {
    if (it.locked || it.dead || (it.held && it.held === h)) continue;
    const d = it.worldCenter(_v).distanceTo(h.pos) - it.radius, sc = d - (it.kind === 'food' ? 0 : 0.035); // bowls and tools win over loose food
    if (d < 0.055 && sc < bd) { best = it; bd = sc; }
  }
  if (best) return best;
  for (const s of G.sources) { if (!s.can()) continue; const d = s.pos.distanceTo(h.pos) - s.r; if (d < 0.05 && d < bd) { best = s; bd = d; } }
  return best;
}

function stepHand(h, dt) {
  h.gripDown = h.grip && !h._g; h.gripUp = !h.grip && h._g; h.useDown = h.use && !h._u; h._g = h.grip; h._u = h.use;
  if (dt > 0) { h.vel.copy(h.pos).sub(h.prev).divideScalar(dt); } h.prev.copy(h.pos);
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
    // simple glove model on the grip
    const g = new THREE.Group(); grip.add(g); h.glove = g;
    const sph = new THREE.SphereGeometry(1, 16, 12), side = i === 0 ? 1 : -1;
    const palm = new THREE.Mesh(sph, skin); palm.scale.set(0.041, 0.016, 0.05); palm.position.set(0, 0, 0.012); g.add(palm);
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.03, 0.07, 14), mat({ color: 0xe8e4da, roughness: 0.9 })); wrist.rotation.x = Math.PI / 2; wrist.scale.z = 0.7; wrist.position.z = 0.085; g.add(wrist);
    h.fingers = [];
    for (let f = 0; f < 4; f++) {
      const fg = new THREE.Group(); fg.position.set(-0.027 + f * 0.018, 0, -0.03); fg.rotation.y = (1.5 - f) * 0.07; g.add(fg);
      const len = [0.062, 0.07, 0.066, 0.052][side > 0 ? f : 3 - f];
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.0082, len, 4, 10), skin); m.rotation.x = Math.PI / 2; m.position.z = -len / 2 - 0.006; fg.add(m); h.fingers.push(fg);
    }
    const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.042, 4, 10), skin); th.position.set(side * 0.04, -0.004, -0.012); th.rotation.set(Math.PI / 2, 0, side * 0.75); g.add(th); h.thumb = th;
    g.traverse((o) => { o.castShadow = true; o.userData.nopick = true; });
    h.jointMeshes = new Map();
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
  renderer.xr.addEventListener('sessionstart', () => { recentered = false; });

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
      if (!h.held) { if (o.button) aim.button = o.button; else if (o.item && !o.item.locked) aim.cand = o.item; else if (o.source && o.source.can()) aim.cand = o.source; }
      break;
    }
    if (aim.point) h.pos.copy(aim.point); else h.pos.copy(ray.ray.direction).multiplyScalar(0.62).add(ray.ray.origin);
    if (!h.held && !aim.cand && !aim.button && aim.point) { // nearest thing to the aim point
      let bd = 0.075; for (const it of G.items) { if (it.locked || it.dead) continue; const d = it.worldCenter(_v).distanceTo(h.pos); if (d < Math.max(bd, it.radius * 0.9)) { bd = Math.min(bd, d); aim.cand = it; } }
      if (!aim.cand) for (const s of G.sources) if (s.can() && s.pos.distanceTo(h.pos) < s.r + 0.03) { aim.cand = s; break; }
      if (!aim.cand) for (const b of G.buttons) if (b.getPos().distanceTo(h.pos) < b.r + 0.02) { aim.button = b; break; }
    }
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
    if (!recentered && camera.position.lengthSq() > 0.0001) { rig.position.x += 0 - _v.x; rig.position.z += 0.3 - _v.z; recentered = true; }
    for (const h of xrHands) {
      const src = h.source, isHand = !!src?.hand;
      h.active = !!src && (h.gripSpace.visible || h.handSpace.visible || h.ctrl.visible);
      if (!h.active) { stepHand(h, dt); continue; }
      const space = h.gripSpace.visible ? h.gripSpace : h.ctrl;
      space.getWorldPosition(h.pos); (h.ctrl.visible ? h.ctrl : space).getWorldQuaternion(h.quat); // position from the grip, orientation from the pointing ray
      h.glove.visible = !isHand;
      if (isHand) {
        const J = h.handSpace.joints || {}, it = J['index-finger-tip'], tt = J['thumb-tip'];
        if (it && tt) { it.getWorldPosition(h.tip); tt.getWorldPosition(_v2); h.pos.copy(h.tip).add(_v2).multiplyScalar(0.5); }
        for (const name in J) if (!h.jointMeshes.has(name)) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), skin); m.userData.nopick = true; m.castShadow = true; J[name].add(m); h.jointMeshes.set(name, m); }
      } else h.tip.set(0, 0, -0.08).applyQuaternion(h.quat).add(h.pos);
      const curl = h.grip ? 1.3 : h.use ? 0.5 : 0.15; h.fingers.forEach((f) => (f.rotation.x += (-curl - f.rotation.x) * Math.min(1, dt * 18)));
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
        if (Math.abs(ax) > 0.6) { if (!snapLatch) { snapLatch = true; const a = -Math.sign(ax) * Math.PI / 6; camera.getWorldPosition(_v); rig.position.sub(_v).applyAxisAngle(UP, a).add(_v); rig.rotation.y += a; } } else if (Math.abs(ax) < 0.3) snapLatch = false;
        if (Math.abs(ay) > 0.5 && Math.abs(ax) < 0.4) rig.position.y = clamp(rig.position.y - ay * dt * 0.35, -0.45, 0.45);
      }
    }
    G.hoverText = '';
  }

  return { update(dt) { if (renderer.xr.isPresenting) updateXR(dt); else if (G.mode === 'desktop') updateDesktop(dt); }, grab, release, desk };
}
