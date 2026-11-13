// Keyboard + mouse controls: first-person walking, sitting, and card handling.
import * as THREE from 'three';
import { TABLES, ROOM, SPAWN, seatInfo, flatQuat, tableY, onFelt, inLoft, floorY, onStair } from './layout.js';

const EYE_STAND = 1.65;
const UP = new THREE.Vector3(0, 1, 0);
const basisQ = (x, y, z) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z)));
// Hand orientations in camera / body space (see hands.js for the hand frame).
const Q_FAN = basisQ([0, 1, 0], [0, 0, -1], [-1, 0, 0]);           // left palm toward the face, thumb up
const Q_IDLE = { L: basisQ([0, 1, 0], [-1, 0, 0], [0, 0, 1]), R: basisQ([0, -1, 0], [1, 0, 0], [0, 0, 1]) };
const P_FAN = new THREE.Vector3(-0.065, -0.2, -0.392);
const Q_FLIP = new THREE.Quaternion(0, 0, 1, 0);

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _lp = new THREE.Vector3(), _lq = new THREE.Quaternion(), _dir = new THREE.Vector3();

export class DesktopControls {
  constructor(game) {
    this.g = game;
    this.keys = new Set();
    this.yaw = 0; this.pitch = -0.12;
    this.pos = new THREE.Vector3(SPAWN.x, 0, SPAWN.z);
    this.yaw = 0.25;
    this.vel = new THREE.Vector3();
    this.eye = EYE_STAND;
    this.sel = 0;
    this.seatKey = -1; this.lastSeat = null;
    this.locked = false;
    this.reach = { t: 1, p: new THREE.Vector3() };
    this.walk = 0;
    this.hs = { L: { p: new THREE.Vector3(), q: new THREE.Quaternion(), init: false }, R: { p: new THREE.Vector3(), q: new THREE.Quaternion(), init: false } };
    this.ray = new THREE.Raycaster();
    this.hover = null;
    this.yawQ = new THREE.Quaternion();

    const canvas = game.renderer.domElement;
    const active = () => game.started && !game.renderer.xr.isPresenting && !game.talk.open;
    canvas.addEventListener('click', () => { if (active() && !this.locked) canvas.requestPointerLock?.(); });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; this.keys.clear(); });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked || !active()) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - e.movementY * 0.0022));
    });
    canvas.addEventListener('mousedown', (e) => {
      if (!this.locked || !active()) return;
      if (e.button === 0) this.primary();
      else if (e.button === 2) this.play(false);
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('wheel', (e) => { if (active()) this.select(Math.sign(e.deltaY)); }, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (!active() || e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE') this.toggleSeat();
      else if (e.code === 'KeyF') this.play(true);
      else if (e.code === 'KeyQ') this.toss();
      else if (e.code === 'KeyR') this.flip();
      else if (e.code === 'KeyT') { const n = game.talk.near(); if (n) { e.preventDefault(); game.talk.start(n); } }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  // Called when leaving VR so the desktop view continues from where the player was.
  adopt(headPos, yaw) { this.pos.set(headPos.x, floorY(headPos.x, headPos.z, headPos.y - 1), headPos.z); this.yaw = yaw; this.pitch = -0.1; this.seatKey = -2; }

  myFan() { return this.g.cards.fan(this.g.me.id, 'L'); }
  select(d) { const n = this.myFan().length; if (n) this.sel = ((this.sel + d) % n + n) % n; }
  reachTo(p) { this.reach.t = 0; this.reach.p.copy(p); }

  toggleSeat() {
    const g = this.g;
    if (g.me.seat) { g.stand(); return; }
    const s = g.nearestFreeSeat(this.pos.x, this.pos.z, 1.9, this.pos.y);
    if (s) g.sit(s.t, s.s);
  }

  primary() {
    const g = this.g, h = this.hover;
    if (!h) return;
    if (h.type === 'card') {
      const fan = this.myFan(), index = fan.length;
      this.reachTo(g.cards.cards[h.id].mesh.position);
      g.cards.take(g.me.id, h.id, 'L', 'fan', index);
      g.net.send({ op: 'take', card: h.id, side: 'L', mode: 'fan', index });
      this.sel = index;
    } else if (h.type === 'button') { this.reachTo(h.point); g.pressButton(h.t, h.which); }
  }

  aimPoint() {
    const o = this.ray.ray.origin, d = this.ray.ray.direction;
    if (d.y > -0.02) return null;
    let best = null, bt = 3.6;
    const plane = (y, ok) => { const t = (y - o.y) / d.y; if (t > 0 && t < bt) { const x = o.x + d.x * t, z = o.z + d.z * t; if (ok(x, z)) { bt = t; best = [x, y, z]; } } };
    TABLES.forEach((T, t) => plane(tableY(t), (x, z) => onFelt(t, x, z)));
    plane(ROOM.loft, inLoft); plane(0, () => true);
    return best ? _v.set(best[0], best[1], best[2]) : null;
  }

  play(faceDown) {
    const g = this.g, fan = this.myFan();
    if (!fan.length) return;
    this.sel = Math.min(this.sel, fan.length - 1);
    const id = fan[this.sel], h = this.hover;
    if (h && h.type === 'card' && g.cards.cards[h.id].loc === 'deck') {
      this.reachTo(g.cards.cards[h.id].mesh.position);
      g.cards.toDeck(id);
      g.net.send({ op: 'todeck', card: id });
    } else {
      const pt = this.aimPoint();
      if (!pt) return;
      const p = [pt.x, g.cards.restY(id, pt.x, pt.z, pt.y), pt.z];
      const q = flatQuat(this.yaw + (Math.random() - 0.5) * 0.24, !faceDown);
      this.reachTo(pt);
      g.cards.put(id, p, q);
      g.net.send({ op: 'put', card: id, p, q });
    }
    this.sel = Math.max(0, Math.min(this.sel, fan.length - 1));
  }

  toss() {
    const g = this.g, fan = this.myFan();
    if (!fan.length) return;
    this.sel = Math.min(this.sel, fan.length - 1);
    const id = fan[this.sel];
    g.camera.getWorldDirection(_dir);
    const p = _v.copy(g.me.pose.head.p).addScaledVector(_dir, 0.38).toArray();
    p[1] -= 0.14;
    const q = flatQuat(this.yaw, true);
    const v = [_dir.x * 2.9, _dir.y * 2.9 + 0.9, _dir.z * 2.9], w = [0, 13, 0];
    g.cards.drop(id, p, q, v, w, true);
    g.net.send({ op: 'drop', card: id, p, q, v, w });
    this.reachTo(_w.fromArray(p).addScaledVector(_dir, 0.3));
    this.sel = Math.max(0, Math.min(this.sel, fan.length - 1));
  }

  flip() {
    const g = this.g, h = this.hover;
    if (!h || h.type !== 'card') return;
    const c = g.cards.cards[h.id];
    if (c.loc !== 'table') return;
    const p = c.p.toArray(), q = _q.copy(c.q).multiply(Q_FLIP).toArray();
    this.reachTo(c.p);
    g.cards.put(h.id, p, q, 0.3, 0.09);
    g.net.send({ op: 'put', card: h.id, p, q });
  }

  syncSeat() {
    const seat = this.g.me.seat, key = seat ? seat.t * 10 + seat.s : -1;
    if (key === this.seatKey) return;
    if (seat) {
      const si = seatInfo(seat.t, seat.s);
      this.pos.set(si.x, si.y, si.z); this.yaw = si.yaw; this.pitch = -0.34; this.vel.set(0, 0, 0);
    } else if (this.lastSeat && this.seatKey >= 0) {
      const si = seatInfo(this.lastSeat.t, this.lastSeat.s);
      this.pos.set(si.x + Math.sin(si.yaw) * 0.8, si.y, si.z + Math.cos(si.yaw) * 0.8);
    }
    this.seatKey = key; this.lastSeat = seat;
  }

  setHand(side, wp, wq, dt, head) {
    const s = this.hs[side];
    _q2.copy(this.yawQ).invert();
    _lp.copy(wp).sub(head).applyQuaternion(_q2);
    _lq.copy(_q2).multiply(wq);
    if (!s.init) { s.p.copy(_lp); s.q.copy(_lq); s.init = true; }
    else { const k = Math.min(1, dt * 14); s.p.lerp(_lp, k); s.q.slerp(_lq, k); }
    const out = this.g.me.pose[side];
    out.p.copy(s.p).applyQuaternion(this.yawQ).add(head);
    out.q.copy(this.yawQ).multiply(s.q);
  }

  update(dt) {
    const g = this.g, cam = g.camera, K = this.keys;
    this.syncSeat();
    const seated = !!g.me.seat;

    // --- walking ---
    let moving = 0;
    if (!seated) {
      const f = (K.has('KeyW') || K.has('ArrowUp') ? 1 : 0) - (K.has('KeyS') || K.has('ArrowDown') ? 1 : 0);
      const r = (K.has('KeyD') || K.has('ArrowRight') ? 1 : 0) - (K.has('KeyA') || K.has('ArrowLeft') ? 1 : 0);
      const speed = K.has('ShiftLeft') || K.has('ShiftRight') ? 3.6 : 2.0;
      const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
      _v.set(-sy * f + cy * r, 0, -cy * f - sy * r);
      if (_v.lengthSq() > 0) _v.normalize().multiplyScalar(speed);
      this.vel.lerp(_v, Math.min(1, dt * 10));
      this.pos.addScaledVector(this.vel, dt);
      g.world.collide(this.pos, 0.3);
      { const f = floorY(this.pos.x, this.pos.z, this.pos.y); this.pos.y = onStair(this.pos.x, this.pos.z) ? f : this.pos.y + (f - this.pos.y) * Math.min(1, dt * 12); }
      moving = this.vel.length();
    }
    this.walk += moving * dt * 3.2;
    const bob = Math.sin(this.walk * 2) * 0.018 * Math.min(1, moving / 2);
    this.eye += ((seated ? TABLES[g.me.seat.t].headY : EYE_STAND) - this.eye) * Math.min(1, dt * 7);

    g.dolly.position.copy(this.pos);
    g.dolly.rotation.set(0, this.yaw, 0);
    cam.position.set(0, this.eye + bob, 0);
    cam.rotation.set(this.pitch, 0, 0);
    const fov = K.has('KeyC') ? 28 : 70;
    if (Math.abs(cam.fov - fov) > 0.05) { cam.fov += (fov - cam.fov) * Math.min(1, dt * 12); cam.updateProjectionMatrix(); }
    g.dolly.updateMatrixWorld(true);

    const pose = g.me.pose, head = pose.head.p;
    cam.matrixWorld.decompose(head, pose.head.q, _w);
    this.yawQ.setFromAxisAngle(UP, this.yaw);

    // --- what is under the crosshair ---
    this.ray.setFromCamera({ x: 0, y: 0 }, cam);
    this.ray.far = 2.8;
    this.hover = g.pick(this.ray, false);
    const fan = this.myFan();
    if (fan.length) this.sel = Math.min(this.sel, fan.length - 1);
    let hint = '';
    if (!this.locked) hint = 'Click to look around';
    else if (this.hover?.type === 'card') {
      const c = g.cards.cards[this.hover.id];
      g.cards.highlight(0, this.hover.id);
      hint = c.loc === 'deck' ? (fan.length ? 'Click: draw · Right click: put card back on deck' : 'Click: draw a card') : 'Click: pick up · R: flip';
    } else if (this.hover?.type === 'button') hint = this.hover.which ? 'Click: deal one card to each seated player' : 'Click: collect all cards and shuffle';
    else if (!seated) { if (g.nearestFreeSeat(this.pos.x, this.pos.z, 1.9, this.pos.y)) hint = 'E: sit down'; else { const n = g.talk.near(); if (n) hint = 'T: talk to ' + n.name; } }
    else if (fan.length && this.aimPoint()) hint = 'Right click: play · F: face down · Q: toss';
    g.hint(hint);
    if (fan.length) g.cards.liftCard(fan[this.sel]);

    // --- hands ---
    // left hand: holds the fan up in view, otherwise hangs at the side
    if (fan.length) {
      _v.copy(P_FAN).applyMatrix4(cam.matrixWorld);
      _q.copy(pose.head.q).multiply(Q_FAN);
      pose.L.c = [0.5, 0.08, 0.1, 0.12, 0.14];
    } else {
      _v.set(-0.24, -0.52, -0.2).applyQuaternion(this.yawQ).add(head);
      _q.copy(this.yawQ).multiply(Q_IDLE.L);
      pose.L.c = [0.25, 0.22, 0.26, 0.3, 0.34];
    }
    this.setHand('L', _v, _q, dt, head);

    // right hand: rests at the side and reaches out for each action
    _v.set(0.24, -0.52, -0.2).applyQuaternion(this.yawQ).add(head);
    _q.copy(this.yawQ).multiply(Q_IDLE.R);
    pose.R.c = [0.25, 0.22, 0.26, 0.3, 0.34];
    if (this.reach.t < 1) {
      this.reach.t = Math.min(1, this.reach.t + dt / 0.38);
      const wgt = Math.sin(Math.PI * this.reach.t);
      const sh = _w.set(0.2, -0.28, 0).applyQuaternion(this.yawQ).add(head);
      _dir.subVectors(this.reach.p, sh);
      const dist = _dir.length();
      _dir.divideScalar(dist || 1);
      const tgt = _lp.copy(sh).addScaledVector(_dir, Math.min(Math.max(dist - 0.13, 0.2), 0.62));
      tgt.y += 0.03;
      _q2.setFromAxisAngle(UP, Math.atan2(-_dir.x, -_dir.z));
      _v.lerp(tgt, wgt);
      _q.slerp(_q2, wgt);
      pose.R.c = [0.5, 0.42, 0.2, 0.2, 0.22];
    }
    this.setHand('R', _v, _q, dt * (this.reach.t < 1 ? 2.2 : 1), head);
  }
}
