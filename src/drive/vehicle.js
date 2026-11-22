// Rigid-body vehicle dynamics for the Honda e: 4 independent suspensions, slip-based tyres,
// rear-wheel-drive electric motor with regen, ABS, traction control, collisions against buildings and poles.
import * as THREE from 'three';

const G = 9.81;
export const SPEC = {
  mass: 1540, com: new THREE.Vector3(0, 0.50, 0.02), inertia: new THREE.Vector3(1900, 2050, 620),
  wheelR: 0.3248, track: 0.7285, axle: 1.2524, wheelInertia: 1.4,
  springK: 30500, dampBump: 2300, dampRebound: 3600, bump: 0.085, droop: 0.105, arbFront: 14000, arbRear: 7000,
  maxSteer: 0.60, steerRatioTurns: 3.1,
  motorTorque: 315, motorPower: 113000, gearRatio: 9.545, driveEff: 0.95, topSpeed: 145 / 3.6, reverseSpeed: 40 / 3.6,
  brakeForce: 1.12, brakeBias: 0.64, CdA: 0.78, battery: 35.5, halfW: 0.86, front: -1.93, rear: 1.89,
};

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const _f = new THREE.Vector3(), _s = new THREE.Vector3(), _n = new THREE.Vector3(), _force = new THREE.Vector3(), _torque = new THREE.Vector3(), _r = new THREE.Vector3(), _pc = new THREE.Vector3(), _vc = new THREE.Vector3();
const _right = new THREE.Vector3(), _up = new THREE.Vector3(), _back = new THREE.Vector3();

export class Vehicle {
  constructor(world) {
    this.world = world; const S = SPEC;
    this.pos = new THREE.Vector3(); this.quat = new THREE.Quaternion(); this.vel = new THREE.Vector3(); this.angVel = new THREE.Vector3();
    this.wheels = [];
    for (const [sx, sz, front] of [[-1, -1, true], [1, -1, true], [-1, 1, false], [1, 1, false]]) this.wheels.push({ local: new THREE.Vector3(sx * S.track, S.wheelR, sz * S.axle).sub(S.com), front, left: sx < 0, comp: 0, omega: 0, spin: 0, steer: 0, fz: S.mass * G / 4, slip: 0, slipA: 0, onGround: true, type: 0, skid: 0, surf: { y: 0, type: 0, mu: 1, nx: 0, ny: 1, nz: 0 } });
    this.gear = 'P'; this.power = false; this.epb = true; this.singlePedal = false; this.sport = false;
    this.steer = 0; this.throttle = 0; this.brake = 0; this.motorTorque = 0; this.motorRpm = 0; this.powerKw = 0; this.soc = 0.82; this.odo = 0; this.trip = 0;
    this.speed = 0; this.fwdSpeed = 0; this.accelG = new THREE.Vector3(); this.impact = 0; this.absActive = false; this.tcActive = false; this.surfaceType = 0;
    this.modelPos = new THREE.Vector3(); this.extraCircles = [];
  }
  place(x, z, yaw) {
    const S = SPEC; const o = {}; this.world.surface(x, z, 1e9, o); const y0 = this.world.height(x, z);
    this.quat.setFromAxisAngle(_v1.set(0, 1, 0), yaw); this.pos.set(x, Math.max(o.y, y0) + S.com.y + 0.02, z).add(_v1.set(S.com.x, 0, S.com.z).applyQuaternion(this.quat));
    // align to slope
    this.vel.set(0, 0, 0); this.angVel.set(0, 0, 0); for (const w of this.wheels) { w.omega = 0; w.comp = 0; }
    for (let i = 0; i < 240; i++) this.substep(1 / 240, 0, 1, 0, true);
    this.vel.set(0, 0, 0); this.angVel.set(0, 0, 0);
  }
  placeOnSurface(x, y, z, yaw) { const S = SPEC; this.quat.setFromAxisAngle(_v1.set(0, 1, 0), yaw); this.pos.set(x, y + S.com.y + 0.05, z); this.vel.set(0, 0, 0); this.angVel.set(0, 0, 0); for (const w of this.wheels) w.omega = 0; }
  get yaw() { _v1.set(0, 0, -1).applyQuaternion(this.quat); return Math.atan2(-_v1.x, -_v1.z); }

  update(dt, input) {
    // input: {throttle, brake, steer (-1..1 of full lock), handbrake}
    const S = SPEC; this.throttle = input.throttle; this.brake = input.brake;
    this.steer = input.steer;
    const steps = Math.max(1, Math.min(8, Math.ceil(dt / (1 / 240)))); const h = dt / steps;
    const v0 = _v3.copy(this.vel);
    this.impact = 0;
    for (let i = 0; i < steps; i++) this.substep(h, input.throttle, input.brake, input.steer, false, input.handbrake);
    // parked / held: static friction keeps the car exactly still
    if ((this.gear === 'P' || this.epb || input.brake > 0.3) && Math.hypot(this.vel.x, this.vel.z) < 0.06 && this.angVel.lengthSq() < 0.0004 && this.wheels.every(w => w.onGround)) { this.vel.x = 0; this.vel.z = 0; this.angVel.y = 0; }
    this.collide();
    // telemetry
    _right.set(1, 0, 0).applyQuaternion(this.quat); _back.set(0, 0, 1).applyQuaternion(this.quat);
    this.fwdSpeed = -this.vel.dot(_back); this.speed = this.vel.length();
    if (dt > 0) { const ax = (this.vel.dot(_right) - v0.dot(_right)) / dt, az = (-this.vel.dot(_back) + v0.dot(_back)) / dt; this.accelG.x += (ax / G - this.accelG.x) * Math.min(1, dt * 6); this.accelG.z += (az / G - this.accelG.z) * Math.min(1, dt * 6); }
    const d = Math.abs(this.fwdSpeed) * dt; this.odo += d; this.trip += d;
    this.soc = Math.max(0, this.soc - (this.powerKw + (this.power ? 0.35 : 0)) * dt / 3600 / S.battery);
    this.modelPos.copy(S.com).applyQuaternion(this.quat).multiplyScalar(-1).add(this.pos);
  }

  substep(h, throttle, brake, steer, settle, handbrake) {
    const S = SPEC, W = this.wheels, world = this.world;
    _right.set(1, 0, 0).applyQuaternion(this.quat); _up.set(0, 1, 0).applyQuaternion(this.quat); _back.set(0, 0, 1).applyQuaternion(this.quat);
    _force.set(0, -S.mass * G, 0); _torque.set(0, 0, 0);
    const fwd = -this.vel.dot(_back);
    // aero drag
    const sp = this.vel.length(); if (sp > 0.01) _force.addScaledVector(this.vel, -0.5 * 1.2 * S.CdA * sp);
    // ---- drivetrain
    const rearOmega = (W[2].omega + W[3].omega) / 2; const motorOmega = Math.abs(rearOmega) * S.gearRatio; this.motorRpm = motorOmega * 60 / (2 * Math.PI);
    let tm = 0; const avail = Math.min(S.motorTorque, S.motorPower / Math.max(motorOmega, 1));
    if (this.power && !settle) {
      const vKmh = fwd * 3.6;
      if (this.gear === 'D') {
        if (this.singlePedal) { const t = throttle; if (t > 0.12) tm = avail * (t - 0.12) / 0.88 * (this.sport ? 1 : 0.92); else if (vKmh > 0.8) tm = -Math.min(avail, 100) * (1 - t / 0.12) * Math.min(1, vKmh / 6); }
        else { tm = avail * throttle * (this.sport ? 1 : 0.92); if (throttle < 0.02) { if (vKmh > 9) tm = -Math.min(avail, 38) * Math.min(1, (vKmh - 9) / 8); else if (brake < 0.05 && vKmh < 7 && !this.epb) tm = 55 * (1 - Math.max(0, vKmh) / 7); } }
        if (fwd > S.topSpeed) tm = Math.min(tm, 0);
        if (brake > 0.05 && tm < 0) tm *= 1 + brake * 0.6; // blended regen
      } else if (this.gear === 'R') {
        tm = -avail * throttle * 0.7; if (throttle < 0.02 && brake < 0.05 && vKmh > -5 && !this.epb) tm = -50 * (1 - Math.max(0, -vKmh) / 5);
        if (-fwd > S.reverseSpeed) tm = Math.max(tm, 0);
      }
      if (this.soc <= 0 && tm * (this.gear === 'R' ? -1 : 1) > 0) tm = 0;
    }
    this.motorTorque = tm; this.powerKw = tm * rearOmega * S.gearRatio / 1000 / (tm * rearOmega >= 0 ? S.driveEff : 1 / 0.7);
    let driveT = tm * S.gearRatio * S.driveEff / 2;
    // ---- brakes
    const totalBrake = S.brakeForce * S.mass * G * brake; const lockRear = this.gear === 'P' || this.epb || handbrake;
    // ---- steering (Ackermann)
    const delta = -steer * S.maxSteer; // positive steer = right turn => wheels rotate clockwise seen from above (negative yaw)
    const L = S.axle * 2; let dl = delta, dr = delta;
    if (Math.abs(delta) > 1e-4) { const Rt = L / Math.tan(Math.abs(delta)); const inner = Math.atan(L / (Rt - S.track)), outer = Math.atan(L / (Rt + S.track)); if (delta > 0) { dl = inner; dr = outer; } else { dl = -outer; dr = -inner; } }
    W[0].steer = dl; W[1].steer = dr;
    // ---- suspension pass
    for (const w of W) {
      _r.copy(w.local).applyQuaternion(this.quat); _pc.copy(this.pos).add(_r);
      const sf = world.surface(_pc.x, _pc.z, _pc.y + 0.3, w.surf); w.type = sf.type;
      let x = ((sf.y + S.wheelR) - _pc.y) / Math.max(0.3, _up.y);
      _vc.copy(this.angVel).cross(_r).add(this.vel); _n.set(sf.nx, sf.ny, sf.nz);
      const xd = -_vc.dot(_n);
      const x0 = S.mass * G / 4 / S.springK;
      if (x < -S.droop) { w.onGround = false; w.comp = -S.droop; w.fz = 0; continue; }
      w.onGround = true; let fz = S.springK * (Math.min(x, S.bump) + x0) + (xd > 0 ? S.dampBump : S.dampRebound) * xd;
      if (x > S.bump) fz += (x - S.bump) * S.springK * 9 + xd * 6000;
      w.comp = Math.min(x, S.bump + 0.03); w.fz = Math.max(0, fz);
    }
    const arb = (a, b, k) => { if (!a.onGround && !b.onGround) return; const d = (a.comp - b.comp) * k; a.fz = Math.max(0, a.fz + d); b.fz = Math.max(0, b.fz - d); };
    arb(W[0], W[1], S.arbFront); arb(W[2], W[3], S.arbRear);
    // ---- tyre pass
    this.absActive = false; this.tcActive = false; let skidMax = 0;
    for (let i = 0; i < 4; i++) {
      const w = W[i]; const sf = w.surf;
      let Tb = (w.front ? S.brakeBias : 1 - S.brakeBias) * totalBrake * S.wheelR / 2; if (!w.front && lockRear) Tb += 2600; if (settle) Tb = 3000;
      let Td = w.front ? 0 : driveT;
      if (!w.onGround) { w.omega += Td / S.wheelInertia * h; const dw = Tb / S.wheelInertia * h; if (Math.abs(w.omega) <= dw) w.omega = 0; else w.omega -= Math.sign(w.omega) * dw; w.omega *= 0.999; w.spin += w.omega * h; w.slip = 0; w.skid = 0; continue; }
      _r.copy(w.local).applyQuaternion(this.quat); _n.set(sf.nx, sf.ny, sf.nz);
      // contact point: wheel centre at current compression, minus radius
      _pc.copy(_r).addScaledVector(_up, w.comp - S.wheelR);
      _vc.copy(this.angVel).cross(_pc).add(this.vel);
      // wheel heading
      const c = Math.cos(w.steer), s = Math.sin(w.steer);
      _f.copy(_back).multiplyScalar(-c).addScaledVector(_right, -s); // forward rotated about up by steer (positive = left)
      _f.addScaledVector(_n, -_f.dot(_n)).normalize(); _s.crossVectors(_f, _n).normalize();
      const vx = _vc.dot(_f), vy = _vc.dot(_s); const mu = sf.mu, Fz = w.fz;
      // longitudinal
      const vs = w.omega * S.wheelR - vx; let kappa = vs / Math.max(Math.abs(vx), 2.5);
      if (brake > 0.1 && kappa < -0.13 && Math.abs(vx) > 2 && !lockRear) { Tb *= 0.25; this.absActive = true; }
      if (Td * Math.sign(vs) > 0 && Math.abs(kappa) > 0.16 && Math.abs(Td) > 1) { Td *= 0.35; this.tcActive = true; }
      let Fx = mu * Fz * Math.sin(1.65 * Math.atan(9 * kappa));
      if (w.omega === 0 && Tb > 0 && Math.abs(vx) < 0.6) { Fx = -vx * (Fz / G) / h * 0.45; const lm = mu * Fz; Fx = Fx > lm ? lm : Fx < -lm ? -lm : Fx; } // static hold on a locked wheel
      const cap = Math.abs(vs) * S.wheelInertia / (S.wheelR * S.wheelR * h) + (Math.abs(Td) + Tb) / S.wheelR; if (Fx > cap) Fx = cap; else if (Fx < -cap) Fx = -cap;
      // lateral
      const alpha = Math.atan2(vy, Math.max(Math.abs(vx), 1.2)); let Fy = -mu * Fz * Math.sin(1.4 * Math.atan(8.5 * alpha));
      const capY = Math.abs(vy) * (Fz / G) / h * 0.45; if (Fy > capY) Fy = capY; else if (Fy < -capY) Fy = -capY;
      const tot = Math.hypot(Fx, Fy), lim = mu * Fz; if (tot > lim && tot > 0) { Fx *= lim / tot; Fy *= lim / tot; }
      // rolling resistance
      const crr = sf.type === 2 ? 0.075 : 0.011; const Frr = -Math.tanh(vx * 3) * crr * Fz;
      // integrate wheel
      w.omega += (Td - Fx * S.wheelR) / S.wheelInertia * h; const dw = Tb / S.wheelInertia * h; if (Math.abs(w.omega) <= dw) w.omega = 0; else w.omega -= Math.sign(w.omega) * dw;
      w.spin += w.omega * h; w.slip = kappa; w.slipA = alpha;
      const sl = Math.min(1, Math.max(0, (Math.hypot(vs, vy) - 1.2) / 5)) * Math.min(1, Fz / 2500) * (sf.type === 2 ? 0.3 : 1); w.skid = sl; if (sl > skidMax) skidMax = sl;
      // accumulate
      _v1.copy(_f).multiplyScalar(Fx + Frr).addScaledVector(_s, Fy).addScaledVector(_n, Fz);
      _force.add(_v1); _torque.add(_v2.crossVectors(_pc, _v1));
    }
    this.skid = skidMax; this.surfaceType = (W[0].type + W[1].type + W[2].type + W[3].type) / 4;
    // ---- integrate body
    this.vel.addScaledVector(_force, h / S.mass);
    _q.copy(this.quat).invert(); const tb = _v1.copy(_torque).applyQuaternion(_q); const wb = _v2.copy(this.angVel).applyQuaternion(_q); const I = S.inertia;
    const gx = (I.y - I.z) * wb.y * wb.z, gy = (I.z - I.x) * wb.z * wb.x, gz = (I.x - I.y) * wb.x * wb.y;
    wb.x += (tb.x + gx) / I.x * h; wb.y += (tb.y + gy) / I.y * h; wb.z += (tb.z + gz) / I.z * h;
    wb.multiplyScalar(1 - 0.02 * h);
    this.angVel.copy(wb).applyQuaternion(this.quat);
    this.pos.addScaledVector(this.vel, h);
    const av = this.angVel; _q.set(av.x * h / 2, av.y * h / 2, av.z * h / 2, 0).multiply(this.quat); this.quat.x += _q.x; this.quat.y += _q.y; this.quat.z += _q.z; this.quat.w += _q.w; this.quat.normalize();
    // keep the body above ground if it ever tunnels or rolls over
    const gy0 = world.height(this.pos.x, this.pos.z); if (this.pos.y < gy0 + 0.25 && !W.some(w => w.surf.bridge)) { this.pos.y = gy0 + 0.25; if (this.vel.y < 0) this.vel.y *= -0.2; this.angVel.multiplyScalar(0.9); }
  }

  collide() {
    const S = SPEC, world = this.world; const hits = this._hits || (this._hits = []);
    const pts = this._pts || (this._pts = [[-S.halfW + 0.12, S.front + 0.12], [S.halfW - 0.12, S.front + 0.12], [-S.halfW + 0.12, S.rear - 0.12], [S.halfW - 0.12, S.rear - 0.12], [0, S.front + 0.1], [0, S.rear - 0.1], [-S.halfW + 0.1, -0.65], [S.halfW - 0.1, -0.65], [-S.halfW + 0.1, 0.65], [S.halfW - 0.1, 0.65]]);
    const lim = world.meta.half - 15;
    for (const [lx, lz] of pts) {
      _r.set(lx, 0, lz).applyQuaternion(this.quat); const px = this.pos.x + _r.x, pz = this.pos.z + _r.z, py = this.pos.y;
      let n = world.collideCircle(px, pz, 0.13, py - 0.3, py + 0.6, hits);
      for (const c of this.extraCircles) { const dx = px - c[0], dz = pz - c[1]; const d = Math.hypot(dx, dz); if (d < c[2] + 0.13 && d > 1e-4 && Math.abs(py - c[3]) < 1.5) hits[n++] = { nx: dx / d, nz: dz / d, depth: c[2] + 0.13 - d }; }
      if (Math.abs(px) > lim) hits[n++] = { nx: -Math.sign(px), nz: 0, depth: Math.abs(px) - lim };
      if (Math.abs(pz) > lim) hits[n++] = { nx: 0, nz: -Math.sign(pz), depth: Math.abs(pz) - lim };
      for (let i = 0; i < n; i++) { const hI = hits[i]; const depth = Math.min(hI.depth, 0.5);
        this.pos.x += hI.nx * depth * 0.7; this.pos.z += hI.nz * depth * 0.7;
        _vc.copy(this.angVel).cross(_r).add(this.vel); const vn = _vc.x * hI.nx + _vc.z * hI.nz; if (vn >= 0) continue;
        const rxn = _r.z * hI.nx - _r.x * hI.nz; // (r × n).y
        const j = -(1.25) * vn / (1 / S.mass + rxn * rxn / S.inertia.y);
        this.vel.x += hI.nx * j / S.mass; this.vel.z += hI.nz * j / S.mass; this.angVel.y += rxn * j / S.inertia.y;
        // scrape friction
        const tx = -hI.nz, tz = hI.nx; const vt = _vc.x * tx + _vc.z * tz; const jt = Math.max(-0.35 * j, Math.min(0.35 * j, -vt * S.mass * 0.3)); this.vel.x += tx * jt / S.mass; this.vel.z += tz * jt / S.mass;
        this.impact = Math.max(this.impact, -vn);
      }
    }
  }
}
