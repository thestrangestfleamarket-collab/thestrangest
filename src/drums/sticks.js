// THE GARAGE's sticks: each one rigid in your hand, its tip swept from one frame to the next against every playing surface in that piece's own space
import * as THREE from 'three';
import { HOOP } from './kit.js';

export const TIP = 0.301, BUTT = 0.105, TIP_R = 0.006;
const REARM = 0.008, MIN_SPEED = 0.25, FULL_SPEED = 8.5, GAP = 0.02;

export function buildStick(T) {
  const pts = [[0, -BUTT], [0.0066, -BUTT + 0.002], [0.0073, -0.09], [0.0073, 0.17], [0.0046, 0.262], [0.0036, 0.283], [0.0058, 0.292], [0.0052, 0.299], [0, TIP + 0.0005]];
  const g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 14).rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ ...T.hickory, roughness: 1, bumpScale: 0.2 }));
  m.castShadow = true;
  return m;
}

const a0 = new THREE.Vector3(), a1 = new THREE.Vector3(), f0 = new THREE.Vector3(), f1 = new THREE.Vector3();
const c = new THREE.Vector3(), cf = new THREE.Vector3(), q0 = new THREE.Vector3(), q1 = new THREE.Vector3(), v = new THREE.Vector3(), w = new THREE.Vector3();
const qa = new THREE.Quaternion();

// the point of the stick (tip a .. hand f) that is at radius R from the piece's axis; null when both ends are on one side
function shaftAt(a, f, R, out) {
  const ra = a.x * a.x + a.z * a.z, rf = f.x * f.x + f.z * f.z, RR = R * R;
  if (ra >= RR || rf <= RR) return null;
  const dx = f.x - a.x, dz = f.z - a.z, A = dx * dx + dz * dz, B = 2 * (a.x * dx + a.z * dz), C = ra - RR;
  const t = (-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A);
  return out.copy(a).lerp(f, t);
}

export const speedToVel = (s, sens = 1) => Math.min(1, Math.max(0.03, Math.pow(Math.max(0, s - 0.15) / (FULL_SPEED - 0.15), 0.95) * sens));

class Stick {
  constructor(side, T) {
    this.side = side;
    this.obj = buildStick(T);
    this.obj.visible = false;
    this.pos = new THREE.Vector3(); this.quat = new THREE.Quaternion();
    this.tip = new THREE.Vector3(); this.prevTip = new THREE.Vector3(); this.prevPos = new THREE.Vector3();
    this.active = false; this.had = false;
    this.arm = {};
  }
}

export class Sticks {
  constructor(kit, T) {
    this.kit = kit;
    this.left = new Stick('left', T);
    this.right = new Stick('right', T);
    this.lead = 0; // seconds: a hit this near in time sounds now (EARLIER/LATER)
    this.sens = 1;
    this.onHit = null; // (piece, vel, zone, r, lx, lz, side)
    this.onClick = null;
    this.apart = 1;
    this.time = 0;
    this.detect = true; // off on a screen, where the keys play and the sticks are only drawn
  }

  // where the hand holds it this frame (the stick's own origin and turn, world space)
  set(side, pos, quat, active = true) {
    const s = this[side];
    s.active = active;
    if (!active) { s.had = false; s.obj.visible = false; return; }
    s.pos.copy(pos); s.quat.copy(quat);
    s.tip.set(0, 0, -TIP).applyQuaternion(quat).add(pos);
  }

  update(dt) {
    this.time += dt;
    const kit = this.kit;
    for (const s of [this.left, this.right]) {
      if (!s.active) continue;
      s.obj.visible = true;
      s.obj.position.copy(s.pos);
      s.obj.quaternion.copy(s.quat);
      if (this.detect && s.had && dt > 0) for (const p of kit.pieces) if (p.name !== 'kick') this._test(s, p, dt);
      this._rest(s);
      s.prevTip.copy(s.tip); s.prevPos.copy(s.pos); s.had = true;
    }
    this._knock(dt);
  }

  _emit(s, p, A, speed, zone, pt) {
    A.on = false; A.in = true; A.wait = false;
    if (speed < MIN_SPEED || this.time - (A.t || -1) < GAP) return;
    A.t = this.time;
    const rho = Math.hypot(pt.x, pt.z);
    this.onHit?.(p.name, speedToVel(speed, this.sens), zone, Math.min(1, rho / p.radius), pt.x, pt.z, s.side);
  }

  _test(s, p, dt) {
    const A = s.arm[p.name] ||= { on: true, shaft: true }, R = p.radius, drum = p.kind === 'drum', kit = this.kit;
    a0.copy(s.prevTip).applyMatrix4(p.inv); a1.copy(s.tip).applyMatrix4(p.inv);
    f0.copy(s.prevPos).applyMatrix4(p.inv); f1.copy(s.pos).applyMatrix4(p.inv);
    const rho0 = Math.hypot(a0.x, a0.z), rho1 = Math.hypot(a1.x, a1.z);
    const d0 = a0.y - kit.height(p, rho0), d1 = a1.y - kit.height(p, rho1);
    const e0 = shaftAt(a0, f0, R + (drum ? 0.005 : 0), q0), e1 = shaftAt(a1, f1, R + (drum ? 0.005 : 0), q1);
    const edgeY = drum ? HOOP + 0.008 : 0.004;

    if (!A.on) {
      if (A.wait) { if (d1 <= 0 || this.time - A.t > 0.15) A.wait = false; }
      else if ((d1 > REARM || rho1 > R + 0.03) && (drum || !e1 || q1.y > edgeY + REARM)) { A.on = true; A.in = false; }
    }
    if (!A.shaft && (!e1 || q1.y > edgeY + 0.02)) A.shaft = true;
    if (!A.on) {
      // the tip down on a head and the shaft dropped onto the hoop: a cross-stick
      if (drum && A.shaft && e0 && e1 && q0.y > edgeY && q1.y <= edgeY && rho1 < R && d1 < 0.03 && Math.abs(d0 - d1) / dt < 1) {
        A.shaft = false;
        const sp = (q0.y - q1.y) / dt * 2.2;
        if (sp >= MIN_SPEED && this.time - (A.t || -1) >= GAP) { A.t = this.time; this.onHit?.(p.name, speedToVel(sp, this.sens), 'cross', 1, q1.x, q1.z, s.side); }
      }
      return;
    }

    // a drum's hoop under the tip
    if (drum) {
      const h0 = a0.y - HOOP, h1 = a1.y - HOOP;
      if (h0 > 0 && h1 <= 0 && h0 < 0.4) {
        c.copy(a0).lerp(a1, h0 / (h0 - h1));
        const rho = Math.hypot(c.x, c.z);
        if (rho > R && rho <= R + 0.02) return this._emit(s, p, A, (h0 - h1) / dt, 'rim', c);
      }
    }
    // a cymbal's edge under the stick's shoulder
    if (!drum && A.shaft && e0 && e1 && q0.y > edgeY && q1.y <= edgeY && q0.y < 0.4 && d1 > 0) {
      A.shaft = false;
      return this._emit(s, p, A, (q0.y - q1.y) / dt, 'edge', q1);
    }
    // the tip through the surface
    if (d0 > 0 && d1 <= 0 && d0 < 0.4) {
      const f = d0 / (d0 - d1);
      c.copy(a0).lerp(a1, f);
      const rho = Math.hypot(c.x, c.z);
      if (rho <= R) return this._land(s, p, A, (d0 - d1) / dt, c, cf.copy(f0).lerp(f1, f));
    }
    // not there yet, but it will be within the lead asked for
    if (this.lead > 0 && d1 > 0 && d0 > d1) {
      const sp = (d0 - d1) / dt;
      if (sp > 1.2 && d1 / sp < this.lead) {
        const k = d1 / (d0 - d1);
        c.copy(a1).addScaledVector(v.copy(a1).sub(a0), k);
        if (Math.hypot(c.x, c.z) <= R) { this._land(s, p, A, sp, c, cf.copy(f1).addScaledVector(w.copy(f1).sub(f0), k)); A.wait = true; }
      }
    }
  }

  _land(s, p, A, speed, pt, hand) {
    const rho = Math.hypot(pt.x, pt.z), u = rho / p.radius;
    let zone;
    if (p.kind === 'cymbal') zone = u < 0.24 ? 'bell' : u > 0.82 ? 'edge' : 'bow';
    else {
      // the shaft on the hoop as the tip lands: a rimshot
      zone = 'head';
      if (shaftAt(pt, hand, p.radius + 0.005, q0) && q0.y <= HOOP + 0.009) { zone = 'rimshot'; A.shaft = false; }
    }
    this._emit(s, p, A, speed, zone, pt);
  }

  // drawn, the stick stops on what it struck: your hand can pass on, the wood cannot
  _rest(s) {
    for (const p of this.kit.pieces) {
      const A = s.arm[p.name];
      if (!this.detect || !A || !A.in) continue;
      a1.copy(s.tip).applyMatrix4(p.inv);
      const rho = Math.hypot(a1.x, a1.z), h = this.kit.height(p, rho) + TIP_R;
      if (rho > p.radius || a1.y >= h || a1.y < h - 0.35) continue;
      a1.y = h;
      a1.applyMatrix4((p.name === 'hat' ? p.top : p.group).matrixWorld);
      v.copy(s.tip).sub(s.pos).normalize(); w.copy(a1).sub(s.pos).normalize();
      s.obj.quaternion.copy(qa.setFromUnitVectors(v, w).multiply(s.quat));
      return;
    }
  }

  // the two sticks knocked together: every time one passes the other between two frames, or comes to touch it, as fast and as often as you like
  _knock(dt) {
    const L = this.left, Rr = this.right;
    if (!this.detect || !L.active || !Rr.active || !(dt > 0) || !L.had || !Rr.had) { this.side = 0; this.apart = 1; return; }
    const d1 = v.copy(L.tip).sub(L.pos), d2 = w.copy(Rr.tip).sub(Rr.pos), r = c.copy(L.pos).sub(Rr.pos);
    const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r), cc = d1.dot(r), b = d1.dot(d2), den = a * e - b * b;
    let sN = den > 1e-9 ? Math.min(1, Math.max(0, (b * f - cc * e) / den)) : 0, tN = (b * sN + f) / e;
    if (tN < 0) { tN = 0; sN = Math.min(1, Math.max(0, -cc / a)); } else if (tN > 1) { tN = 1; sN = Math.min(1, Math.max(0, (b - cc) / a)); }
    a0.copy(L.pos).addScaledVector(d1, sN); a1.copy(Rr.pos).addScaledVector(d2, tN);
    const dist = a0.distanceTo(a1), inside = sN > 0.02 && sN < 0.98 && tN > 0.02 && tN < 0.98;
    // which side of the right stick the left one is on: when that flips with both sticks overlapping along their lengths, they have crossed
    const side = Math.sign(cf.crossVectors(d1, d2).dot(q0.copy(a0).sub(a1))) || this.side, was = this.apart;
    const crossed = inside && this.side && side !== this.side && was < 0.12, touch = dist < 0.02 && was >= 0.02;
    if (dist > 0.03) this.clickArm = true;
    if ((crossed || (touch && this.clickArm)) && this.time - (this.clickT || -1) > 0.04) {
      const sp = crossed ? (was + dist) / dt : (was - dist) / dt;
      if (sp > 0.15) { this.clickT = this.time; this.clickArm = false; this.onClick?.(Math.min(1, Math.max(0.08, sp / 3.5))); }
    }
    this.side = side; this.apart = dist;
  }
}
