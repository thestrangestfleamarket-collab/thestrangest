// WebXR controls: controllers and tracked hands, locomotion, grabbing, throwing.
import * as THREE from 'three';
import { TABLES, seatInfo, deckPos, CARD, floorY, onStair } from './layout.js';
import { PALM, mSide, pinchLocal, indexTipLocal } from './hands.js';
import { pinchDefault } from './cards.js';

// --- Tuning: how the visual hand sits relative to the controller grip pose ---
// Grip space (WebXR): -Z along the handle toward the thumb, +X out of the back of the
// right hand (out of the palm of the left). HAND_TILT swings the fingers toward the
// controller's pointing direction.
const HAND_TILT = 0.5;
const basis = (x, y, z) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z)));
const UP = new THREE.Vector3(0, 1, 0);
const GRIP_Q = {
  L: basis([0, 0, -1], [-1, 0, 0], [0, 1, 0]).multiply(new THREE.Quaternion().setFromAxisAngle(UP, -HAND_TILT)),
  R: basis([0, 0, 1], [1, 0, 0], [0, 1, 0]).multiply(new THREE.Quaternion().setFromAxisAngle(UP, HAND_TILT)),
};
const GRIP_P = { L: PALM.clone().applyQuaternion(GRIP_Q.L).negate(), R: PALM.clone().applyQuaternion(GRIP_Q.R).negate() };

const MOVE_SPEED = 2.0, SNAP = Math.PI / 6, NEAR = 0.1;
const TIPS = ['thumb-tip', 'index-finger-tip', 'middle-finger-tip', 'ring-finger-tip', 'pinky-finger-tip'];
const KNUCKLES = ['thumb-metacarpal', 'index-finger-phalanx-proximal', 'middle-finger-phalanx-proximal', 'ring-finger-phalanx-proximal', 'pinky-finger-phalanx-proximal'];

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _m = new THREE.Matrix4(), _dir = new THREE.Vector3();

export class XRControls {
  constructor(game) {
    this.g = game;
    const xr = game.renderer.xr;
    this.slots = [0, 1].map((i) => {
      const slot = { ctrl: xr.getController(i), grip: xr.getControllerGrip(i), hand: xr.getHand(i), src: null };
      slot.ctrl.addEventListener('connected', (e) => { slot.src = e.data; });
      slot.ctrl.addEventListener('disconnected', () => { slot.src = null; });
      game.dolly.add(slot.ctrl, slot.grip, slot.hand);
      return slot;
    });
    const mk = () => ({
      live: false, tracked: false, grab: false, grabPrev: false, trig: false, pinching: false,
      a: false, aPrev: false, b: false, bPrev: false, sx: 0, sy: 0,
      p: new THREE.Vector3(), q: new THREE.Quaternion(), pp: new THREE.Vector3(), tip: new THREE.Vector3(),
      rayO: new THREE.Vector3(), rayD: new THREE.Vector3(0, 0, -1), hasRay: false,
      hist: [], rayHit: null, curl: [0.15, 0.1, 0.1, 0.1, 0.1],
    });
    this.st = { L: mk(), R: mk() };
    this.snapReady = true;
    this.seatKey = -1; this.lastSeat = null;
    this.cool = 0; this.frames = 0;
    this.ray = new THREE.Raycaster();
    const lg = new THREE.CylinderGeometry(0.0015, 0.0015, 1, 6);
    lg.rotateX(Math.PI / 2); lg.translate(0, 0, -0.5);
    this.lasers = { L: null, R: null };
    for (const s of ['L', 'R']) {
      const l = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.6 }));
      l.visible = false;
      game.scene.add(l);
      this.lasers[s] = l;
    }
  }

  begin() { this.seatKey = -1; this.frames = 0; }
  end() { for (const s of ['L', 'R']) this.lasers[s].visible = false; this.seatKey = -1; }

  headYaw() { _e.setFromQuaternion(this.g.me.pose.head.q); return _e.y; }

  // Move the rig so the head lands on (x, z); optionally set head height and facing.
  placeHead(x, z, y, yaw) {
    const g = this.g, d = g.dolly, cam = g.camera;
    if (yaw !== undefined) { _e.setFromQuaternion(cam.quaternion); d.rotation.y = yaw - _e.y; }
    d.position.y = y === undefined ? 0 : y - cam.position.y;
    d.updateMatrixWorld(true);
    _v.copy(cam.position).applyMatrix4(d.matrixWorld);
    d.position.x += x - _v.x; d.position.z += z - _v.z;
    d.updateMatrixWorld(true);
  }

  syncSeat() {
    const seat = this.g.me.seat, key = seat ? seat.t * 10 + seat.s : -1;
    if (key === this.seatKey) return;
    if (seat) { const si = seatInfo(seat.t, seat.s); this.placeHead(si.x, si.z, si.y + TABLES[seat.t].headY, si.yaw); }
    else if (this.lastSeat && this.seatKey >= 0) {
      const si = seatInfo(this.lastSeat.t, this.lastSeat.s);
      this.placeHead(si.x + Math.sin(si.yaw) * 0.8, si.z + Math.cos(si.yaw) * 0.8, undefined, si.yaw); this.g.dolly.position.y = si.y;
    }
    this.seatKey = key; this.lastSeat = seat;
  }

  readButtons(slot, st) {
    const src = slot.src, gp = src.gamepad;
    st.tracked = !!src.hand;
    st.sx = st.sy = 0; st.a = st.b = false;
    let trigger = 0, squeeze = 0, touch = false;
    if (gp && !st.tracked) {
      const b = gp.buttons;
      trigger = b[0]?.value || 0; squeeze = b[1]?.value || 0;
      st.a = !!b[4]?.pressed; st.b = !!b[5]?.pressed;
      touch = !!(b[3]?.touched || b[4]?.touched || b[5]?.touched);
      if (gp.axes.length >= 4) { st.sx = gp.axes[2]; st.sy = gp.axes[3]; }
      else if (gp.axes.length >= 2) { st.sx = gp.axes[0]; st.sy = gp.axes[1]; }
      st.trig = trigger > 0.55;
      st.grab = squeeze > 0.5 || st.trig;
      st.curl = [touch || squeeze > 0.5 ? 0.6 : 0.15, 0.08 + trigger * 0.85, 0.1 + squeeze * 0.8, 0.1 + squeeze * 0.82, 0.1 + squeeze * 0.85];
    }
  }

  readPose(slot, side, st) {
    const src = slot.src;
    st.live = false;
    if (st.tracked) {
      const J = slot.hand.joints, wrist = J && J['wrist'];
      if (wrist && wrist.visible && J['thumb-tip'] && J['index-finger-tip']) {
        wrist.matrixWorld.decompose(st.p, st.q, _s);
        const thumb = _v.setFromMatrixPosition(J['thumb-tip'].matrixWorld);
        st.tip.setFromMatrixPosition(J['index-finger-tip'].matrixWorld);
        st.pp.addVectors(thumb, st.tip).multiplyScalar(0.5);
        const gap = thumb.distanceTo(st.tip);
        st.pinching = st.pinching ? gap < 0.04 : gap < 0.018;
        st.grab = st.trig = st.pinching;
        for (let i = 0; i < 5; i++) {
          const tip = J[TIPS[i]], kn = J[KNUCKLES[i]];
          if (!tip || !kn) continue;
          const dt = _v.setFromMatrixPosition(tip.matrixWorld).distanceTo(st.p);
          const dk = _w.setFromMatrixPosition(kn.matrixWorld).distanceTo(st.p) || 0.09;
          const open = i === 0 ? 3.2 : 1.85, closed = i === 0 ? 2.2 : 0.85;
          st.curl[i] = Math.max(0, Math.min(1, (open - dt / dk) / (open - closed)));
        }
        st.live = true;
      }
    } else if (slot.grip.visible !== false && src.gripSpace) {
      slot.grip.matrixWorld.decompose(_v, _q, _s);
      st.q.copy(_q).multiply(GRIP_Q[side]);
      st.p.copy(GRIP_P[side]).applyQuaternion(_q).add(_v);
      pinchLocal(side, st.pp).applyQuaternion(st.q).add(st.p);
      indexTipLocal(side, st.tip).applyQuaternion(st.q).add(st.p);
      st.live = true;
    }
    st.hasRay = slot.ctrl.visible !== false;
    if (st.hasRay) {
      st.rayO.setFromMatrixPosition(slot.ctrl.matrixWorld);
      st.rayD.set(0, 0, -1).transformDirection(slot.ctrl.matrixWorld);
    }
  }

  update(dt) {
    const g = this.g, pose = g.me.pose;
    this.cool -= dt;
    // re-seat once tracking has settled so the head height offset is right
    this.frames++;
    this.syncSeat();
    if (g.me.seat && this.frames < 90) g.dolly.position.y = seatInfo(g.me.seat.t, g.me.seat.s).y + TABLES[g.me.seat.t].headY - g.camera.position.y;

    const active = { L: null, R: null };
    for (const slot of this.slots) {
      const h = slot.src?.handedness;
      const side = h === 'left' ? 'L' : h === 'right' ? 'R' : null;
      if (!side) continue;
      active[side] = slot;
      this.readButtons(slot, this.st[side]);
    }
    for (const s of ['L', 'R']) if (!active[s]) { const st = this.st[s]; st.live = false; st.grab = st.trig = st.a = st.b = false; st.sx = st.sy = 0; }

    // --- locomotion (left stick walks, right stick snap-turns) ---
    g.dolly.updateMatrixWorld(true);
    g.camera.matrixWorld.decompose(pose.head.p, pose.head.q, _s);
    const L = this.st.L, R = this.st.R;
    if (!g.me.seat && Math.hypot(L.sx, L.sy) > 0.15) {
      const yaw = this.headYaw(), sy = Math.sin(yaw), cy = Math.cos(yaw);
      const f = -L.sy, r = L.sx;
      _v.set(pose.head.p.x + (-sy * f + cy * r) * MOVE_SPEED * dt, 0, pose.head.p.z + (-cy * f - sy * r) * MOVE_SPEED * dt);
      _v.y = g.dolly.position.y; g.world.collide(_v, 0.3);
      g.dolly.position.x += _v.x - pose.head.p.x; g.dolly.position.z += _v.z - pose.head.p.z;
    }
    if (Math.abs(R.sx) > 0.6 && this.snapReady) {
      this.snapReady = false;
      const ang = -Math.sign(R.sx) * SNAP;
      g.dolly.position.sub(pose.head.p).applyAxisAngle(UP, ang).add(pose.head.p);
      g.dolly.rotation.y += ang;
    } else if (Math.abs(R.sx) < 0.3) this.snapReady = true;
    if (!g.me.seat) { const f = floorY(pose.head.p.x, pose.head.p.z, g.dolly.position.y); g.dolly.position.y = onStair(pose.head.p.x, pose.head.p.z) ? f : g.dolly.position.y + (f - g.dolly.position.y) * Math.min(1, dt * 10); }
    g.dolly.updateMatrixWorld(true);
    g.camera.matrixWorld.copy(g.dolly.matrixWorld).multiply(g.camera.matrix);
    g.camera.matrixWorld.decompose(pose.head.p, pose.head.q, _s);

    // --- hand poses ---
    const yawQ = _q2.setFromAxisAngle(UP, this.headYaw()).clone();
    for (const s of ['L', 'R']) {
      const st = this.st[s];
      if (active[s]) this.readPose(active[s], s, st);
      if (!st.live) {
        st.p.set(-mSide(s) * 0.22, -0.55, -0.1).applyQuaternion(yawQ).add(pose.head.p);
        st.q.copy(yawQ);
        st.curl = [0.25, 0.2, 0.25, 0.3, 0.32];
        st.grab = st.trig = false;
        pinchLocal(s, st.pp).applyQuaternion(st.q).add(st.p);
        st.tip.copy(st.pp);
      }
      st.hist.push({ t: performance.now(), p: st.pp.clone(), q: st.q.clone() });
      if (st.hist.length > 8) st.hist.shift();
    }

    // --- seats ---
    this.updateMarkers();
    const aDown = (L.a && !L.aPrev) || (R.a && !R.aPrev);
    if (aDown) {
      if (g.me.seat) g.stand();
      else { const s = g.nearestFreeSeat(pose.head.p.x, pose.head.p.z, 2.0, g.dolly.position.y); if (s) g.sit(s.t, s.s); }
    }

    for (const s of ['L', 'R']) this.interact(s, dt);

    for (const s of ['L', 'R']) {
      const st = this.st[s], out = pose[s];
      out.p.copy(st.p); out.q.copy(st.q);
      const fan = g.cards.fan(g.me.id, s).length > 0, held = g.cards.pinched(g.me.id, s) !== null;
      for (let i = 0; i < 5; i++) {
        let c = st.curl[i];
        if (!st.tracked) {
          if (fan) c = i === 0 ? Math.max(c, 0.5) : Math.min(c, 0.12);
          if (held && i < 2) c = Math.max(c, i === 0 ? 0.6 : 0.5);
        }
        out.c[i] = c;
      }
      st.grabPrev = st.grab; st.aPrev = st.a; st.bPrev = st.b;
    }
  }

  updateMarkers() {
    const g = this.g, w = g.world, seated = !!g.me.seat;
    for (const row of w.seatMarkers) for (const mk of row) mk.visible = !seated;
    w.standMarker.visible = seated;
    if (seated) {
      const si = seatInfo(g.me.seat.t, g.me.seat.s);
      w.standMarker.position.set(si.x + Math.sin(si.yaw) * 0.12 - Math.cos(si.yaw) * 0.46, si.y + 0.95, si.z + Math.cos(si.yaw) * 0.12 + Math.sin(si.yaw) * 0.46);
    }
  }

  activate(hit) {
    const g = this.g;
    if (this.cool > 0) return;
    this.cool = 0.7;
    if (hit.type === 'button') g.pressButton(hit.t, hit.which);
    else if (hit.type === 'seat') g.sit(hit.t, hit.s);
    else if (hit.type === 'stand') g.stand();
  }

  velocity(st) {
    const h = st.hist, now = h[h.length - 1];
    let old = h[0];
    for (const e of h) if (now.t - e.t <= 90) { old = e; break; }
    if (old === now && h.length > 1) old = h[h.length - 2];
    const dt = Math.max((now.t - old.t) / 1000, 1 / 120);
    const v = new THREE.Vector3().subVectors(now.p, old.p).divideScalar(dt);
    const dq = _q.copy(now.q).multiply(_q2.copy(old.q).invert());
    if (dq.w < 0) { dq.x = -dq.x; dq.y = -dq.y; dq.z = -dq.z; dq.w = -dq.w; }
    const ang = 2 * Math.acos(Math.min(1, dq.w)), s = Math.sqrt(Math.max(1e-9, 1 - dq.w * dq.w));
    const w = new THREE.Vector3(dq.x / s, dq.y / s, dq.z / s).multiplyScalar(ang / dt);
    if (ang < 0.01) w.set(0, 0, 0);
    return { v, w };
  }

  takeFan(id, side, index) {
    const g = this.g;
    g.cards.take(g.me.id, id, side, 'fan', index);
    g.net.send({ op: 'take', card: id, side, mode: 'fan', index });
  }

  takePinch(id, side, st, keepPose) {
    const g = this.g, c = g.cards.cards[id];
    let rel;
    if (keepPose) {
      // keep the card where it is relative to the hand, pulled in to the fingertips
      const inv = _q.copy(st.q).invert();
      const ppL = _w.copy(st.pp).sub(st.p).applyQuaternion(inv);
      const p = _v.copy(c.mesh.position).sub(st.p).applyQuaternion(inv);
      const d = p.sub(ppL);
      if (d.length() > 0.038) d.setLength(0.038);
      rel = { p: d.add(ppL).toArray(), q: inv.multiply(c.mesh.quaternion).toArray() };
    } else rel = pinchDefault(side);
    g.cards.take(g.me.id, id, side, 'pinch', 0, rel);
    g.net.send({ op: 'take', card: id, side, mode: 'pinch', rel });
  }

  release(side, st, id) {
    const g = this.g, cards = g.cards, me = g.me.id, c = cards.cards[id];
    const other = side === 'L' ? 'R' : 'L', ost = this.st[other];
    const pos = c.mesh.position;

    // next to the other hand: add it to that hand's fan
    const ofan = cards.fan(me, other);
    if (ost.live && cards.pinched(me, other) === null) {
      const anchor = _v.copy(PALM).applyQuaternion(ost.q).add(ost.p);
      if (anchor.distanceTo(st.pp) < 0.16 || anchor.distanceTo(pos) < 0.15) {
        // insert next to the closest card already in the fan
        let index = ofan.length, bd = Infinity;
        ofan.forEach((fid, i) => {
          const fm = cards.cards[fid].mesh;
          const d = fm.position.distanceTo(pos);
          if (d < bd) { bd = d; const right = _w.set(1, 0, 0).applyQuaternion(fm.quaternion); index = _s.subVectors(pos, fm.position).dot(right) > 0 ? i + 1 : i; }
        });
        this.takeFan(id, other, index);
        return;
      }
    }
    // onto its deck
    const d = deckPos(c.table);
    if (Math.hypot(pos.x - d.x, pos.z - d.z) < 0.07 && pos.y - d.y < 0.14 && pos.y > d.y - 0.02) {
      cards.toDeck(id);
      g.net.send({ op: 'todeck', card: id });
      return;
    }
    // let go: drop or throw
    const { v, w } = this.velocity(st);
    v.multiplyScalar(1.15);
    if (v.length() > 7) v.setLength(7);
    if (w.length() > 25) w.setLength(25);
    const p = pos.toArray(), q = c.mesh.quaternion.toArray(), va = v.toArray(), wa = w.toArray();
    cards.drop(id, p, q, va, wa, true);
    g.net.send({ op: 'drop', card: id, p, q, v: va, w: wa });
  }

  interact(side, dt) {
    const g = this.g, cards = g.cards, me = g.me.id, st = this.st[side], slot = side === 'L' ? 0 : 1;
    const laser = this.lasers[side];
    laser.visible = false;
    if (!st.live) return;
    const held = cards.pinched(me, side);
    const fan = cards.fan(me, side);
    const down = st.grab && !st.grabPrev, up = !st.grab && st.grabPrev;

    // physical pokes: table buttons and seat markers
    for (const cap of g.world.buttonMeshes) if (cap.position.distanceTo(st.tip) < 0.05) this.activate({ type: 'button', ...cap.userData.button });
    if (g.world.standMarker.visible && g.world.standMarker.position.distanceTo(st.tip) < 0.08) this.activate({ type: 'stand' });
    if (!g.me.seat) for (const row of g.world.seatMarkers) for (const mk of row) if (mk.visible && mk.position.distanceTo(st.tip) < 0.1) this.activate({ type: 'seat', ...mk.userData.seat });

    if (held !== null) {
      if (up || !st.grab) this.release(side, st, held);
      return;
    }

    // B / Y: lay the whole fan down
    if (st.b && !st.bPrev && fan.length) {
      const { v } = this.velocity(st);
      [...fan].forEach((id, i) => {
        const m = cards.cards[id].mesh;
        const p = m.position.toArray(), q = m.quaternion.toArray();
        const va = [v.x + (Math.random() - 0.5) * 0.3, v.y, v.z + (Math.random() - 0.5) * 0.3], wa = [0, (i - fan.length / 2) * 0.8, 0];
        cards.drop(id, p, q, va, wa, true);
        g.net.send({ op: 'drop', card: id, p, q, v: va, w: wa });
      });
      return;
    }

    const near = cards.nearest(st.pp, NEAR, me, side);
    let hit = null;
    if (near >= 0) {
      cards.highlight(slot, near);
      if (cards.cards[near].loc === 'fan') cards.liftCard(near, 0.014);
    } else if (st.hasRay) {
      this.ray.set(st.rayO, st.rayD);
      this.ray.far = 12;
      hit = g.pick(this.ray, true);
      if (hit && hit.type === 'card' && hit.dist > 3) hit = null;
      if (hit && hit.type === 'button' && hit.dist > 3) hit = null;
      if (hit) {
        laser.visible = true;
        laser.position.copy(st.rayO);
        laser.quaternion.setFromUnitVectors(_v.set(0, 0, -1), st.rayD);
        laser.scale.set(1, 1, hit.dist);
        if (hit.type === 'card') cards.highlight(slot, hit.id);
      }
    }

    if (!down) return;
    if (near >= 0) {
      if (fan.length) this.takeFan(near, side, fan.length);
      else this.takePinch(near, side, st, true);
    } else if (hit && st.trig) {
      if (hit.type === 'card') { if (fan.length) this.takeFan(hit.id, side, fan.length); else this.takePinch(hit.id, side, st, false); }
      else this.activate(hit);
    }
  }
}
