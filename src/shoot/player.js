// Local player: XR rig, tracked hands, body holsters, physical weapon handling, locomotion, health.
// Also provides a mouse + keyboard fallback so the game is playable (and testable) without a headset.
import * as THREE from 'three';
import { Weapon, magazineMesh, grenadeMesh } from './weapons.js';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _m = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0), XAXIS = new THREE.Vector3(1, 0, 0);

export function handMesh(right, color = 0x15171a) {
  const g = new THREE.Group(), s = right ? 1 : -1;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 });
  const pad = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.6, metalness: 0.2 });
  const add = (w, h, d, x, y, z, mat = m, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); b.rotation.x = rx; b.castShadow = true; g.add(b); return b; };
  add(0.03, 0.085, 0.09, s * 0.03, -0.005, 0.01);                 // palm
  add(0.012, 0.05, 0.06, s * 0.047, 0.0, 0.01, pad);              // knuckle guard
  add(0.07, 0.075, 0.075, s * 0.028, -0.01, 0.09);                // wrist / cuff
  g.userData.fingers = [];
  for (let i = 0; i < 4; i++) { const f = add(0.05, 0.018, 0.022, s * 0.0, 0.03 - i * 0.021, -0.035); g.userData.fingers.push(f); }
  add(0.022, 0.02, 0.06, s * 0.01, 0.045, -0.005, m, 0.2);        // thumb
  return g;
}

class Hand {
  constructor(i) {
    this.i = i; this.pos = new THREE.Vector3(); this.quat = new THREE.Quaternion(); this.prev = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.trigger = 0; this.trigPrev = false; this.grip = false; this.gripPrev = false; this.a = false; this.aPrev = false; this.b = false; this.bPrev = false;
    this.sx = 0; this.sy = 0; this.click = false; this.held = null; this.src = null; this.hover = false; this.active = false;
    this.mesh = handMesh(i === 1);
  }
  get trigDown() { return this.trigger > 0.55; }
  pulse(v, ms) { const h = this.src && this.src.gamepad && this.src.gamepad.hapticActuators; if (h && h[0] && h[0].pulse) h[0].pulse(Math.min(1, v), ms).catch(() => {}); else if (this.src && this.src.gamepad && this.src.gamepad.vibrationActuator) this.src.gamepad.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: Math.min(1, v), weakMagnitude: Math.min(1, v) }).catch(() => {}); }
}

export class Player {
  constructor(game) {
    this.g = game;
    const { scene, renderer } = game;
    this.rig = game.rig; this.cam = game.camera;
    this.hands = [new Hand(0), new Hand(1)];
    this.hands.forEach((h) => scene.add(h.mesh));
    this.ctrl = [0, 1].map((i) => ({ ray: renderer.xr.getController(i), grip: renderer.xr.getControllerGrip(i), src: null }));
    this.ctrl.forEach((c) => {
      this.rig.add(c.ray, c.grip);
      c.ray.addEventListener('connected', (e) => { c.src = e.data; });
      c.ray.addEventListener('disconnected', () => { c.src = null; });
    });
    this.weapons = { pistol: new Weapon('pistol', game.fx, game.audio), rifle: new Weapon('rifle', game.fx, game.audio), shotgun: new Weapon('shotgun', game.fx, game.audio) };
    this.wlist = Object.values(this.weapons);
    this.wlist.forEach((w) => scene.add(w.group));
    this.grenades = 2; this.grenadeMeshes = [grenadeMesh(), grenadeMesh()];
    this.grenadeMeshes.forEach((m) => scene.add(m));
    this.head = new THREE.Vector3(0, 1.65, 0); this.headQ = new THREE.Quaternion(); this.bodyYaw = 0;
    this.hp = 100; this.alive = true; this.sinceHit = 99; this.respawnT = 0; this.locked = false;
    this.moveSpeed = 0; this.stepAcc = 0; this.snapReady = true;
    // flashlight (single light, re-parented to the weapon in the main hand)
    this.flash = new THREE.SpotLight(0xdfe8ff, 0, 28, 0.5, 0.6, 1.3);
    this.flashOn = true; this.flashHolder = new THREE.Object3D(); scene.add(this.flashHolder);
    this.flashHolder.add(this.flash); this.flash.target.position.set(0, 0, -6); this.flashHolder.add(this.flash.target);
    if (game.q.tier > 0) { this.flash.castShadow = true; this.flash.shadow.mapSize.setScalar(1024); this.flash.shadow.camera.near = 0.15; this.flash.shadow.camera.far = 26; this.flash.shadow.bias = -0.001; }
    // faint fill light at the head so your own hands and weapon stay readable in dark arenas
    this.fill = new THREE.PointLight(0xc8d8ff, 0.5, 2.2, 1.2); this.cam.add(this.fill);
    // desktop state
    this.yaw = 0; this.pitch = 0; this.keys = {}; this.mouse = [false, false, false]; this.cur = 'rifle'; this.crouch = 0; this.ads = 0; this.mouseEdge = false;
    this.holsters = {};
    this._bindDesktop();
  }

  get vr() { return this.g.renderer.xr.isPresenting; }

  _bindDesktop() {
    const el = this.g.renderer.domElement;
    addEventListener('keydown', (e) => {
      if (this.vr || document.pointerLockElement !== el) return;
      this.keys[e.code] = true;
      if (e.code === 'Digit1') this.cur = 'pistol'; if (e.code === 'Digit2') this.cur = 'rifle'; if (e.code === 'Digit3') this.cur = 'shotgun';
      if (e.code === 'KeyR' && this.alive) this.weapons[this.cur].autoReload();
      if (e.code === 'KeyF') this.flashOn = !this.flashOn;
      if (e.code === 'KeyG' && this.alive && !this.locked && this.grenades > 0) {
        this.grenades--; _a.set(0, 0.15, -1).applyQuaternion(this.headQ).normalize();
        this.g.throwGrenade(_b.copy(this.head).addScaledVector(_a, 0.4), _a.multiplyScalar(13), 2.6);
      }
    });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    el.addEventListener('mousedown', (e) => { if (document.pointerLockElement === el) { this.mouse[e.button] = true; if (e.button === 0) this.mouseEdge = true; } });
    addEventListener('mouseup', (e) => { this.mouse[e.button] = false; });
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== el || this.vr) return;
      const k = 0.0022 * (this.ads > 0.5 ? 0.6 : 1);
      this.yaw -= e.movementX * k; this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch - e.movementY * k));
    });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  spawn(x, z, faceX = 0, faceZ = 0) {
    const yaw = Math.atan2(-(faceX - x), -(faceZ - z));
    this.rig.updateMatrixWorld(true);
    if (this.vr) {
      // rotate rig so the user's current gaze faces the arena centre, then put their head over the spawn
      _e.setFromQuaternion(this.cam.quaternion); this.rig.rotation.y = yaw - _e.y;
      this.rig.position.set(0, 0, 0); this.rig.updateMatrixWorld(true);
      _a.copy(this.cam.position).applyMatrix4(this.rig.matrixWorld);
      this.rig.position.set(x - _a.x, 0, z - _a.z);
    } else { this.rig.rotation.y = 0; this.rig.position.set(x, 0, z); this.yaw = yaw; this.pitch = 0; }
    this.rig.updateMatrixWorld(true);
    this.hp = 100; this.alive = true; this.sinceHit = 99; this.grenades = 2;
    this.wlist.forEach((w) => { w.refill(); w.state = 'holster'; w.hand = -1; w.support = -1; });
    this.hands.forEach((h) => this._clearHeld(h));
  }

  damage(amount, from) {
    if (!this.alive) return;
    this.hp -= amount; this.sinceHit = 0;
    this.g.audio.hurt(); this.g.ui.hit(amount, from, this);
    this.hands.forEach((h) => h.pulse(0.9, 120));
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.respawnT = 3; this.hands.forEach((h) => this._release(h, true)); return true; }
    return false;
  }

  // ---------- per-frame ----------
  update(dt) {
    const g = this.g;
    this.rig.updateMatrixWorld(true);
    if (this.vr) this._readXR(dt); else this._readDesktop(dt);
    // head
    this.cam.updateMatrixWorld(true);
    this.head.setFromMatrixPosition(this.cam.matrixWorld); this.headQ.setFromRotationMatrix(this.cam.matrixWorld);
    _e.setFromQuaternion(this.headQ);
    let dy = _e.y - this.bodyYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.bodyYaw += dy * Math.min(1, dt * (Math.abs(dy) > 0.9 ? 8 : 2.5));
    this._holsters();
    this.sinceHit += dt;
    if (this.alive && this.sinceHit > 6 && this.hp < 100) this.hp = Math.min(100, this.hp + 9 * dt);
    if (!this.alive) { this.respawnT -= dt; }

    for (const h of this.hands) {
      h.vel.subVectors(h.pos, h.prev).multiplyScalar(1 / Math.max(dt, 0.001)).lerp(h._v || (h._v = new THREE.Vector3()), 0.5); h._v.copy(h.vel); h.prev.copy(h.pos);
      if (this.vr && this.alive) this._handLogic(h, dt);
      h.gripPrev = h.grip; h.trigPrev = h.trigDown; h.aPrev = h.a; h.bPrev = h.b;
    }
    if (!this.vr) this._desktopWeapons(dt);

    // weapons not in hand follow their holster
    for (const w of this.wlist) {
      w.update(dt);
      if (w.state !== 'held') {
        const hs = this.holsters[w.type];
        if (w.state === 'return') { w.group.position.lerp(hs.p, Math.min(1, dt * 14)); w.group.quaternion.slerp(hs.q, Math.min(1, dt * 14)); if (w.group.position.distanceToSquared(hs.p) < 0.0004) { w.state = 'holster'; g.audio.click(hs.p, 0.6, 0.3); } }
        else { w.group.position.copy(hs.p); w.group.quaternion.copy(hs.q); }
        w.pull = 0;
        w.group.visible = this.vr || w.state === 'return' ? true : false;
      } else w.group.visible = true;
    }
    this.grenadeMeshes.forEach((m, i) => {
      const inHand = this.hands.find((h) => h.held && h.held.k === 'grenade' && h.held.mesh === m);
      if (inHand) { m.visible = true; return; }
      const free = this.grenades - this.hands.filter((h) => h.held && h.held.k === 'grenade').length;
      m.visible = this.vr && i < free;
      const hs = this.holsters['g' + i]; m.position.copy(hs.p); m.quaternion.copy(hs.q);
    });

    // flashlight follows main weapon
    const mw = this.mainWeapon();
    if (mw && this.flashOn && this.alive) { mw.lightMount.getWorldPosition(this.flashHolder.position); this.flashHolder.quaternion.copy(mw.group.quaternion); this.flash.intensity = 90; }
    else this.flash.intensity = 0;

    // hand visuals
    for (const h of this.hands) {
      h.mesh.visible = this.alive && (this.vr ? h.active : true);
      h.mesh.position.copy(h.pos); h.mesh.quaternion.copy(h.quat);
      const closed = !!h.held || h.grip;
      h.mesh.userData.fingers.forEach((f) => { f.position.z = closed ? -0.02 : -0.045; f.scale.x = closed ? 1.25 : 1; });
    }
  }

  mainWeapon() { for (const w of this.wlist) if (w.state === 'held') return w; return null; }

  _holsters() {
    const H = Math.max(0.9, this.head.y), c = Math.cos(this.bodyYaw), s = Math.sin(this.bodyYaw);
    const set = (k, lx, y, lz, rx, ry = 0, rz = 0) => {
      const o = this.holsters[k] || (this.holsters[k] = { p: new THREE.Vector3(), q: new THREE.Quaternion() });
      o.p.set(this.head.x + lx * c + lz * s, y, this.head.z - lx * s + lz * c);
      _e.set(rx, this.bodyYaw + ry, rz, 'YXZ'); o.q.setFromEuler(_e);
    };
    set('pistol', 0.25, H * 0.57, 0.02, -1.45);
    set('rifle', 0.16, H - 0.14, 0.2, -1.5, 0, 0.25);
    set('shotgun', -0.16, H - 0.14, 0.2, -1.5, 0, -0.25);
    set('g0', -0.1, H * 0.76, -0.15, 0); set('g1', 0.1, H * 0.76, -0.15, 0);
    set('pouchL', -0.15, H * 0.58, -0.12, 0); set('pouchR', 0.15, H * 0.58, -0.12, 0);
  }

  // ---------- XR input ----------
  _readXR(dt) {
    const tilt = this.g.settings.tilt * Math.PI / 180;
    this.hands.forEach((h) => { h.active = false; });
    for (const c of this.ctrl) {
      const src = c.src; if (!src || !src.gamepad || src.handedness === 'none') continue;
      const h = this.hands[src.handedness === 'left' ? 0 : 1]; h.src = src; h.active = true;
      h.pos.copy(c.grip.position).applyMatrix4(this.rig.matrixWorld);
      h.quat.copy(this.rig.quaternion).multiply(c.ray.quaternion);
      if (tilt) h.quat.multiply(_q.setFromAxisAngle(XAXIS, tilt));
      const gp = src.gamepad, b = gp.buttons;
      h.trigger = b[0] ? b[0].value : 0; h.grip = b[1] ? b[1].value > 0.5 : false; h.click = b[3] ? b[3].pressed : false;
      h.a = b[4] ? b[4].pressed : false; h.b = b[5] ? b[5].pressed : false;
      h.sx = gp.axes[2] || 0; h.sy = gp.axes[3] || 0;
    }
    if (!this.alive || this.locked) return;
    const S = this.g.settings, mh = this.hands[S.leftHanded ? 1 : 0], th = this.hands[S.leftHanded ? 0 : 1];
    // turning
    if (S.smoothTurn) { if (Math.abs(th.sx) > 0.2) this._turn(-th.sx * 2.2 * dt); }
    else if (Math.abs(th.sx) > 0.65) { if (this.snapReady) { this._turn(-Math.sign(th.sx) * Math.PI / 6); this.snapReady = false; } } else if (Math.abs(th.sx) < 0.3) this.snapReady = true;
    // movement relative to head yaw
    const mag = Math.hypot(mh.sx, mh.sy);
    if (mag > 0.15) {
      _e.setFromQuaternion(_q.setFromRotationMatrix(this.cam.matrixWorld));
      const sp = (mh.click ? 5.2 : 3.2) * Math.min(1, mag), c = Math.cos(_e.y), s = Math.sin(_e.y);
      this._move((mh.sx * c + mh.sy * s) * sp * dt / mag, (-mh.sx * s + mh.sy * c) * sp * dt / mag, dt);
    } else this.moveSpeed = 0;
    // keep the physical head out of walls at head height (still lets you lean over low cover)
    _a.setFromMatrixPosition(this.cam.matrixWorld); _b.copy(_a);
    this.g.world.resolveCircle(_b, 0.16, _a.y - 0.2, _a.y + 0.1);
    this.rig.position.x += _b.x - _a.x; this.rig.position.z += _b.z - _a.z;
  }
  _turn(a) {
    _a.setFromMatrixPosition(this.cam.matrixWorld);
    this.rig.rotation.y += a; this.rig.updateMatrixWorld(true);
    this.cam.updateMatrixWorld(true); _b.setFromMatrixPosition(this.cam.matrixWorld);
    // XR camera world matrix is only refreshed at render time, so recompute from its local pose
    _b.copy(this.cam.position).applyMatrix4(this.rig.matrixWorld);
    this.rig.position.x += _a.x - _b.x; this.rig.position.z += _a.z - _b.z; this.rig.updateMatrixWorld(true);
  }
  _move(dx, dz, dt) {
    _a.copy(this.cam.position).applyMatrix4(this.rig.matrixWorld); _b.copy(_a); _b.x += dx; _b.z += dz;
    this.g.world.resolveCircle(_b, 0.24, 0.35, Math.max(0.8, _a.y));
    const mx = _b.x - _a.x, mz = _b.z - _a.z;
    this.rig.position.x += mx; this.rig.position.z += mz; this.rig.updateMatrixWorld(true);
    const d = Math.hypot(mx, mz); this.moveSpeed = d / Math.max(dt, 0.001); this.stepAcc += d;
    if (this.stepAcc > 0.75) { this.stepAcc = 0; this.g.audio.step(_c.set(_b.x, 0.1, _b.z), 0.18); }
  }

  // nearest thing a free hand could grab right now
  _findGrab(h) {
    const other = this.hands[1 - h.i], ow = other.held && other.held.k === 'weapon' ? other.held.w : null;
    let best = null, bd = 1e9;
    const consider = (d, max, o) => { if (d < max && d / max < bd) { bd = d / max; best = o; } };
    if (ow) {
      if (ow.fore && ow.support < 0) consider(ow.fore.getWorldPosition(_a).distanceTo(h.pos), 0.15, { k: 'support', w: ow });
      if (ow.rack) consider(ow.rack.getWorldPosition(_a).distanceTo(h.pos), 0.1, { k: 'rack', w: ow });
      const needMag = ow.magwell && !ow.magIn && ow.reserve > 0, needShell = ow.def.pump && ow.mag < ow.def.cap && ow.reserve > 0;
      if (needMag || needShell) for (const k of ['pouchL', 'pouchR']) consider(this.holsters[k].p.distanceTo(h.pos), 0.22, { k: needMag ? 'mag' : 'shell', w: ow });
    }
    for (const w of this.wlist) if (w.state !== 'held') consider(this.holsters[w.type].p.distanceTo(h.pos), w.type === 'pistol' ? 0.2 : 0.27, { k: 'weapon', w });
    const freeG = this.grenades - this.hands.filter((x) => x.held && x.held.k === 'grenade').length;
    if (freeG > 0) for (let i = 0; i < freeG; i++) consider(this.holsters['g' + i].p.distanceTo(h.pos), 0.14, { k: 'grenade', i });
    return best;
  }

  _clearHeld(h) {
    const x = h.held; if (!x) return;
    if (x.mesh && (x.k === 'mag' || x.k === 'shell')) this.g.scene.remove(x.mesh);
    if (x.k === 'grenade') x.mesh.userData.led.visible = false;
    h.held = null;
  }
  _release(h, force = false) {
    const x = h.held; if (!x) return;
    if (x.k === 'weapon') {
      x.w.state = 'return'; x.w.hand = -1;
      if (x.w.support >= 0) { const sh = this.hands[x.w.support]; x.w.support = -1; sh.held = null; }
      const oh = this.hands[1 - h.i]; if (oh.held && oh.held.w === x.w) this._clearHeld(oh);
    } else if (x.k === 'support') { x.w.support = -1; }
    else if (x.k === 'rack') { x.w.pull = 0; x.w.pumpBack = false; }
    else if (x.k === 'grenade') {
      if (x.armed) { this.grenades--; _a.copy(h.vel).multiplyScalar(1.45); if (force) _a.set(0, 0, 0); this.g.throwGrenade(h.pos, _a, x.fuse); }
    }
    this._clearHeld(h);
  }

  _handLogic(h, dt) {
    const g = this.g, other = this.hands[1 - h.i];
    if (!h.active) { if (h.held) this._release(h, true); return; }
    if (!h.held) {
      const c = this._findGrab(h);
      if (c && !h.hover) h.pulse(0.15, 15);
      h.hover = !!c;
      if (c && h.grip && !h.gripPrev) {
        h.pulse(0.5, 30);
        if (c.k === 'weapon') { c.w.state = 'held'; c.w.hand = h.i; c.w.support = -1; h.held = c; g.audio.click(h.pos, 0.7, 0.4); }
        else if (c.k === 'support') { c.w.support = h.i; c.base = h.pos.distanceTo(other.pos) + c.w.pull; h.held = c; }
        else if (c.k === 'rack') { c.w.forward(_a); c.base = -_b.subVectors(h.pos, c.w.group.position).dot(_a); h.held = c; }
        else if (c.k === 'mag' || c.k === 'shell') { c.mesh = magazineMesh(c.w.type); g.scene.add(c.mesh); c.cool = 0; h.held = c; g.audio.click(h.pos, 1.2, 0.3); }
        else if (c.k === 'grenade') { c.mesh = this.grenadeMeshes[c.i]; c.armed = false; c.fuse = 3.2; h.held = c; }
      }
      return;
    }
    const x = h.held;
    if (!h.grip) { this._release(h); return; }
    if (x.k === 'weapon') {
      const w = x.w, sup = w.support >= 0 ? this.hands[w.support] : null;
      w.place(h.pos, h.quat, sup ? sup.pos : null);
      if (!this.locked) {
        const shot = w.trigger(h.trigDown && !h.trigPrev, h.trigDown);
        if (shot) { h.pulse(1, w.def.pump ? 110 : 55); if (sup) sup.pulse(0.6, 45); g.onLocalFire(w, shot); }
      }
      if (h.a && !h.aPrev) { if (w.ejectMag()) h.pulse(0.4, 25); }
      if (h.b && !h.bPrev) { if (w.boltRelease()) h.pulse(0.7, 35); else { this.flashOn = !this.flashOn; g.audio.click(h.pos, 1.5, 0.25); } }
    } else if (x.k === 'support') {
      if (x.w.def.pump) { if (x.w.setPump(x.base - h.pos.distanceTo(other.pos)) || (x.w.pumpBack && !x.pb)) h.pulse(0.7, 30); x.pb = x.w.pumpBack; }
      if (x.w.fore.getWorldPosition(_a).distanceTo(h.pos) > 0.3) this._release(h);
    } else if (x.k === 'rack') {
      x.w.forward(_a); const pull = -_b.subVectors(h.pos, x.w.group.position).dot(_a) - x.base;
      if (x.w.setRackPull(pull)) { h.pulse(0.8, 40); other.pulse(0.4, 30); }
    } else if (x.k === 'mag') {
      x.mesh.position.copy(h.pos); x.mesh.quaternion.copy(h.quat);
      if (x.w.state !== 'held' || x.w.magIn) { this._clearHeld(h); return; }
      if (x.w.magwell.getWorldPosition(_a).distanceTo(h.pos) < 0.085) { x.w.insertMag(); h.pulse(0.8, 40); other.pulse(0.5, 30); this._clearHeld(h); }
    } else if (x.k === 'shell') {
      x.mesh.position.copy(h.pos); x.mesh.quaternion.copy(h.quat); x.cool -= dt;
      if (x.w.state !== 'held') { this._clearHeld(h); return; }
      if (x.cool <= 0 && x.w.port.getWorldPosition(_a).distanceTo(h.pos) < 0.1) {
        if (x.w.loadShell()) { h.pulse(0.6, 30); x.cool = 0.38; }
        if (x.w.mag >= x.w.def.cap || x.w.reserve <= 0) this._clearHeld(h);
      }
    } else if (x.k === 'grenade') {
      x.mesh.position.copy(h.pos); x.mesh.quaternion.copy(h.quat);
      if (!x.armed && h.trigDown && !h.trigPrev && !this.locked) { x.armed = true; x.mesh.userData.led.visible = true; h.pulse(0.6, 60); g.audio.pinBeep(h.pos); }
      if (x.armed) { x.fuse -= dt; if (x.fuse <= 0.05) { this._release(h, true); } }
    }
  }

  // ---------- desktop fallback ----------
  _readDesktop(dt) {
    const K = this.keys, el = this.g.renderer.domElement, locked = document.pointerLockElement === el;
    this.crouch += ((K.KeyC || K.ControlLeft ? 1 : 0) - this.crouch) * Math.min(1, dt * 10);
    this.cam.position.set(0, 1.66 - this.crouch * 0.65, 0);
    _e.set(this.pitch, this.yaw, 0, 'YXZ'); this.cam.quaternion.setFromEuler(_e);
    this.cam.updateMatrixWorld(true);
    if (this.alive && !this.locked && locked) {
      const fx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0), fz = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0), m = Math.hypot(fx, fz);
      if (m > 0) { const sp = (K.ShiftLeft ? 5.2 : 3.2) * (1 - this.crouch * 0.5) * (this.ads > 0.5 ? 0.6 : 1), c = Math.cos(this.yaw), s = Math.sin(this.yaw); this._move((fx * c + fz * s) * sp * dt / m, (-fx * s + fz * c) * sp * dt / m, dt); }
      else this.moveSpeed = 0;
    }
    this.hands.forEach((h) => { h.active = true; });
  }
  _desktopWeapons(dt) {
    const w = this.weapons[this.cur], hr = this.hands[1], hl = this.hands[0];
    for (const o of this.wlist) { if (o !== w && o.state === 'held') { o.state = 'holster'; o.hand = -1; o.support = -1; } }
    if (!this.alive) { if (w.state === 'held') { w.state = 'holster'; w.hand = -1; } hr.pos.set(0, -50, 0); hl.pos.set(0, -50, 0); return; }
    w.state = 'held'; w.hand = 1; w.support = w.def.twoHand ? 0 : -1;
    this.ads += ((this.mouse[2] ? 1 : 0) - this.ads) * Math.min(1, dt * 14);
    const sightY = w.type === 'pistol' ? 0.094 : w.type === 'rifle' ? 0.133 : 0.098, a = this.ads;
    const rl = w.reloadT > 0 ? Math.sin(Math.min(1, w.reloadT) * Math.PI) * 0.12 : 0;
    const bob = Math.sin(performance.now() * 0.011) * Math.min(1, this.moveSpeed / 3) * 0.006 * (1 - a);
    _a.set(0.17 * (1 - a), -0.2 * (1 - a) - sightY * a - rl + bob, w.type === 'pistol' ? -0.46 : -0.3 + 0.06 * a).applyQuaternion(this.headQ);
    hr.pos.copy(this.head).add(_a);
    // converge the bore on whatever the crosshair is over
    _c.set(0, 0, -1).applyQuaternion(this.headQ); const th = this.g.world.raycast(this.head, _c, 60);
    _d.copy(this.head).addScaledVector(_c, Math.max(4, th ? th.t : 60)); _b.set(0, sightY * 0.55, 0).applyQuaternion(this.headQ).add(hr.pos);
    hr.quat.setFromRotationMatrix(_m.lookAt(_b, _d, _c.set(0, 1, 0).applyQuaternion(this.headQ)));
    if (rl) hr.quat.multiply(_q.setFromAxisAngle(XAXIS, -rl * 3));
    w.place(hr.pos, hr.quat, null);
    if (w.fore) w.fore.getWorldPosition(hl.pos); else hl.pos.copy(hr.pos).add(_b.set(-0.035, -0.035, 0.01).applyQuaternion(hr.quat));
    hl.quat.copy(w.group.quaternion);
    hr.grip = true; hl.grip = true;
    const edge = this.mouseEdge; this.mouseEdge = false;
    if (!this.locked) {
      const shot = w.trigger(edge, this.mouse[0]);
      if (shot) { this.g.onLocalFire(w, shot); if (w.def.pump) setTimeout(() => { w.autoPump = 0.35; }, 140); }
      else if (edge && !w.chambered && w.reloadT <= 0) w.autoReload();
    }
  }

  // network snapshot
  snapshot() {
    const r = (v) => Math.round(v * 1000) / 1000, P = (v) => [r(v.x), r(v.y), r(v.z)], Q = (q) => [r(q.x), r(q.y), r(q.z), r(q.w)];
    const s = { t: 's', h: P(this.head), hq: Q(this.headQ), l: P(this.hands[0].pos), lq: Q(this.hands[0].quat), r: P(this.hands[1].pos), rq: Q(this.hands[1].quat), al: this.alive ? 1 : 0, fl: this.flashOn ? 1 : 0, w: [], g: [] };
    for (const w of this.wlist) if (w.state === 'held') s.w.push([w.def.id, P(w.group.position), Q(w.group.quaternion), r(w.slidePos)]);
    this.hands.forEach((h, i) => { if (h.held && h.held.k === 'grenade') s.g.push(i); if (!h.active && this.vr) s[i ? 'r' : 'l'] = null; });
    return s;
  }
}
