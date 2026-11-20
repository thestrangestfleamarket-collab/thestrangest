// 6-DOF flight model. Forces are fully aerodynamic (lift/drag polars with stall, wave drag, thrust lapse
// with altitude and Mach); rotational response is modelled as angle-of-attack / roll-rate dynamics whose
// authority scales with dynamic pressure, so stalls, departures, energy bleed and turn performance all emerge
// from each aircraft's real mass, wing area, span, CLmax and thrust/power.
import * as THREE from 'three';

export const G = 9.80665;
export function airDensity(h) { h = Math.max(-200, Math.min(h, 30000)); return h < 11000 ? 1.225 * Math.pow(1 - 2.25577e-5 * h, 4.2559) : 0.3639 * Math.exp(-(h - 11000) / 6341.6); }
export function speedOfSound(h) { return h < 11000 ? Math.sqrt(1.4 * 287.05 * (288.15 - 0.0065 * Math.max(h, -200))) : 295.07; }

const _v = new THREE.Vector3(), _vb = new THREE.Vector3(), _f = new THREE.Vector3(), _q = new THREE.Quaternion(), _qi = new THREE.Quaternion();
const _lift = new THREE.Vector3(), _fw = new THREE.Vector3(), _up = new THREE.Vector3(), _rt = new THREE.Vector3(), _e = new THREE.Euler();
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

export class FlightModel {
  constructor(spec, dims) {
    this.spec = spec; const s = spec;
    this.len = dims.len; this.gearY = dims.gearY; // lowest point of wheels relative to origin (negative)
    this.AR = s.b * s.b / s.S; this.chord = s.S / s.b;
    this.CLa = 2 * Math.PI * this.AR / (2 + Math.sqrt(4 + this.AR * this.AR));
    this.k = 1 / (Math.PI * s.e * this.AR);
    this.CL0 = s.engine === 'jet' ? 0.05 : 0.18;
    this.aStall = (s.CLmax - this.CL0) / this.CLa;
    this.isProp = s.engine !== 'jet';
    this.propD = dims.propD || (s.era === 'WW1' ? 2.6 : 3.2);
    this.maxRoll = s.era === 'WW1' ? 1.9 : s.era === 'WW2' ? 2.4 : s.engine === 'jet' && s.supersonic ? 4.2 : 3.0; // rad/s
    this.tailDragger = this.isProp;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3(); this.quat = new THREE.Quaternion(); this.omega = new THREE.Vector3();
    this.ctl = { pitch: 0, roll: 0, yaw: 0, throttle: 0.8, brake: 0 };
    this.flaps = 0; this.flapsTarget = 0; this.gearDown = !!s.fixedGear; this.gearPos = this.gearDown ? 1 : 0; this.airbrake = false; this.airbrakePos = 0;
    this.engineOn = true; this.rpm = 0.8; this.ab = 0; this.fuel = 1; this.fuelFlowScale = 1;
    this.damage = { engine: 0, wing: 0, ctl: 0 }; // 0..1
    this.alpha = 0; this.beta = 0; this.alphaPrev = 0; this.gLoad = 1; this.mach = 0; this.ias = 0; this.tas = 0; this.aoaStall = 0; this.onGround = false; this.crashed = null;
    this.thrustN = 0; this.alt = 0; this.agl = 1000; this.vs = 0; this.autopilot = false; this.apAlt = 0; this.stallShake = 0;
  }

  reset(pos, heading, speed, onGround = false) {
    this.pos.copy(pos); _e.set(0, heading, 0, 'YXZ'); this.quat.setFromEuler(_e);
    this.vel.set(0, 0, -speed).applyQuaternion(this.quat); this.omega.set(0, 0, 0);
    this.crashed = null; this.alphaPrev = this.alpha = 0; this.onGround = onGround; this.rpm = onGround ? 0.25 : 0.85; this.ctl.throttle = onGround ? 0 : 0.85;
    this.gearDown = onGround || !!this.spec.fixedGear; this.gearPos = this.gearDown ? 1 : 0; this.flaps = this.flapsTarget = 0; this.airbrake = false; this.fuel = 1;
    this.damage.engine = this.damage.wing = this.damage.ctl = 0; this.engineOn = true; this.autopilot = false;
    if (onGround && this.tailDragger) { _e.set(0.2, heading, 0, 'YXZ'); this.quat.setFromEuler(_e); }
  }

  // one physics step. ground(x,z) -> terrain height (water = 0)
  step(dt, ground) {
    if (this.crashed) return;
    const s = this.spec, c = this.ctl, q = this.quat;
    const h = this.pos.y, rho = airDensity(h), a = speedOfSound(h), sigma = rho / 1.225;
    _qi.copy(q).invert();
    _vb.copy(this.vel).applyQuaternion(_qi); // body-frame velocity (x right, y up, z back)
    const V = Math.max(_vb.length(), 0.01), fwdSpeed = -_vb.z;
    const slow = V < 8 ? V / 8 : 1; // aerodynamic angles are meaningless at a standstill
    const alpha = Math.atan2(-_vb.y, Math.max(fwdSpeed, 0.5)) * slow;
    const beta = Math.asin(clamp(_vb.x / V, -1, 1)) * slow;
    const qbar = 0.5 * rho * V * V, M = V / a;
    this.alpha = alpha; this.beta = beta; this.mach = M; this.tas = V; this.ias = V * Math.sqrt(sigma); this.alt = h;

    // ---- systems
    this.flaps += clamp(this.flapsTarget - this.flaps, -dt * 0.35, dt * 0.35);
    this.gearPos += clamp((this.gearDown ? 1 : 0) - this.gearPos, -dt * 0.4, dt * 0.4);
    this.airbrakePos += clamp((this.airbrake ? 1 : 0) - this.airbrakePos, -dt * 1.5, dt * 1.5);
    const run = this.engineOn && this.fuel > 0 && this.damage.engine < 1;
    const thr = run ? clamp(c.throttle, 0, 1) : 0;
    const hasAB = !!s.thrustAB;
    const rpmTarget = run ? (this.isProp ? 0.28 + 0.72 * thr : 0.55 + 0.45 * Math.min(thr / (hasAB ? 0.9 : 1), 1)) : Math.min(0.12, V / 600);
    const spool = this.isProp ? 1.6 : (this.rpm < rpmTarget ? 0.28 : 0.4);
    this.rpm += clamp(rpmTarget - this.rpm, -dt * spool, dt * spool);
    const abT = run && hasAB && thr > 0.92 && this.rpm > 0.97 ? 1 : 0; this.ab += clamp(abT - this.ab, -dt * 2.5, dt * 1.6);

    // ---- thrust
    let T = 0; const dmgE = 1 - this.damage.engine * 0.85;
    if (this.isProp) {
      const pw = (this.rpm - 0.28) / 0.72; const lapse = s.engine === 'rotary' ? Math.pow(sigma, 0.9) : Math.min(1, Math.pow(sigma / 0.62, 0.85)) * (0.9 + 0.1 * sigma);
      const P = s.power * clamp(pw, 0, 1) * lapse * dmgE; const A = Math.PI * this.propD * this.propD / 4;
      const Ts = 0.9 * Math.cbrt(2 * rho * A * Math.pow(s.propEff * P, 2));
      T = run ? Math.min(Ts, s.propEff * P / Math.max(V, 1)) : 0;
      if (!run || pw < 0.05) T -= 0.5 * rho * V * V * A * 0.06 * (run ? 1 - pw / 0.05 : 1); // windmilling drag
    } else {
      const core = clamp((this.rpm - 0.55) / 0.45, 0, 1);
      const lapse = Math.pow(sigma, 0.72);
      const mil = s.thrust * (0.06 + 0.94 * Math.pow(core, 2.2)) * lapse * (1 - 0.22 * M + 0.32 * M * M * (s.supersonic ? 1 : 0.6));
      const abx = hasAB ? (s.thrustAB - s.thrust) * this.ab * lapse * (1 + 0.3 * M) * (M > 2.1 ? Math.max(0, 1 - (M - 2.1) * 2.5) : 1) : 0;
      T = run || this.rpm > 0.2 ? (mil + abx) * dmgE : 0; if (!run) T *= this.rpm;
    }
    if (!this.isProp && this.ias > 400) T *= Math.max(0, 1 - (this.ias - 400) / 45); // engine/q limiter
    this.thrustN = T;
    if (run) this.fuel = Math.max(0, this.fuel - dt * this.fuelFlowScale * (this.isProp ? 0.00006 + 0.00016 * thr : 0.00007 + 0.0002 * thr + 0.0011 * this.ab));

    // ---- lift / drag
    const fl = this.flaps, CLmax = s.CLmax + 0.45 * fl, CL0 = this.CL0 + 0.3 * fl;
    const mEff = Math.min(M, 0.85), comp = 1 / Math.sqrt(1 - mEff * mEff * 0.6);
    const CLa = this.CLa * (M > 1.1 ? Math.max(0.55, 1.6 / (1 + M)) : comp);
    const aS = (CLmax - CL0) / this.CLa, aN = -(CLmax * 0.75 + CL0) / this.CLa;
    const absA = Math.abs(alpha);
    const sig = alpha >= 0 ? sstep(aS * 0.96, aS * 1.45 + 0.05, alpha) : sstep(-aN * 0.96, -aN * 1.45 + 0.05, -alpha);
    const sLift = alpha >= 0 ? sstep(aS, aS * 1.35 + 0.04, alpha) : sstep(-aN, -aN * 1.35 + 0.04, -alpha);
    const CLlin = clamp(CL0 + CLa * alpha, -CLmax * 0.78, CLmax * 1.02);
    const CLpost = 0.95 * Math.sin(2 * alpha) * (1 + (s.tvc || s.id === 'su27' ? 0.25 : 0));
    let CL = CLlin * (1 - sLift) + CLpost * sLift; CL *= 1 - 0.45 * this.damage.wing;
    let wave = 0; const wk = s.wave ?? 0.08;
    if (M > s.mcrit) { const x = (M - s.mcrit) / (1.06 - s.mcrit); wave = M < 1.06 ? wk * x * x * (3 - 2 * Math.min(x, 1)) : wk * (0.62 + 0.38 * 1.06 / M); if (!s.supersonic && M > 1.0) wave += (M - 1) * 0.5; }
    const kEff = this.k * (M > 1.1 ? 1 + (M - 1.1) * 1.4 : 1);
    const CD = s.CD0 * (1 + 0.6 * this.damage.wing) + kEff * CL * CL * (1 - sLift) + sLift * (0.08 + 1.25 * Math.sin(alpha) ** 2) + wave + 0.03 * fl + (s.fixedGear ? 0 : 0.018 * this.gearPos) + 0.045 * this.airbrakePos + 0.9 * Math.sin(beta) ** 2 * 0.25;
    const L = qbar * s.S * CL, D = qbar * s.S * CD;
    // ground effect
    this.agl = h + this.gearY - ground(this.pos.x, this.pos.z);
    // directions in body frame
    const vx = _vb.x / V, vy = _vb.y / V, vz = _vb.z / V;
    // lift dir = x_body × v̂  (perpendicular to airflow, in symmetry plane)
    _lift.set(0 * vz - 0 * vy, 0 * vx - 1 * vz, 1 * vy - 0 * vx); const ll = _lift.length() || 1; _lift.multiplyScalar(1 / ll);
    _f.set(-vx * D, -vy * D, -vz * D).addScaledVector(_lift, L);
    _f.x += -qbar * s.S * 0.9 * beta + qbar * s.S * 0.12 * c.yaw; // side force
    _f.z -= T; // thrust forward
    const nBody = _f.y / (s.mass * G); this.gLoad = nBody; this.aoaStall = sig;
    _f.applyQuaternion(q); _f.y -= s.mass * G;

    // ---- rotational dynamics (angular accelerations)
    const Vs1 = Math.sqrt(2 * s.mass * G / (1.225 * s.S * s.CLmax)); const qRef = 0.5 * 1.225 * (Vs1 * 1.15) ** 2;
    const A = clamp(qbar / qRef, 0, 2.6), ctlEff = (1 - 0.6 * this.damage.ctl) * (M > 0.9 && !s.supersonic ? Math.max(0.35, 1 - (M - 0.9) * 4) : 1);
    let pitchIn = clamp(c.pitch, -1, 1), rollIn = clamp(c.roll, -1, 1), yawIn = clamp(c.yaw, -1, 1);
    if (this.autopilot && !this.onGround) { // altitude hold + wings level
      _up.set(0, 1, 0).applyQuaternion(q); _rt.set(1, 0, 0).applyQuaternion(q);
      const bank = Math.atan2(-_rt.y, _up.y); rollIn = clamp(bank * -2.5, -1, 1);
      const vsT = clamp((this.apAlt - h) * 0.12, -25, 25); this.apI = clamp((this.apI || 0) + (vsT - this.vel.y) * dt * 0.006, -0.5, 0.5); pitchIn = clamp((vsT - this.vel.y) * 0.02 + this.apI, -0.6, 0.6);
      if (Math.abs(c.pitch) > 0.5 || Math.abs(c.roll) > 0.5) this.autopilot = false;
    }
    if (!this.autopilot) this.apI = 0;
    // pitch: stick commands angle of attack around the 1-g trim value
    const a1g = clamp((s.mass * G / Math.max(qbar * s.S, 1) - CL0) / CLa, -0.03, aS * 0.9);
    const aG = (s.gLimit * s.mass * G / Math.max(qbar * s.S, 1) - CL0) / CLa; // AoA for structural g limit
    const post = s.tvc ? 2.6 : s.id === 'su27' || s.id === 'mig29' ? 1.9 : s.fbw ? 0.94 : 1.32;
    const aMax = Math.min(aS * post, aG), aMin = Math.max(aN * (s.fbw ? 0.8 : 1.1), -0.45 * aG);
    const cosB = clamp(_up.set(0, 1, 0).applyQuaternion(q).y, -1, 1);
    const trim = a1g * clamp(0.35 + 0.65 * cosB, 0, 1); // relax trim when banked/inverted so neutral stick ~ holds the nose
    const aCmd = pitchIn >= 0 ? trim + pitchIn * (aMax - trim) : trim + pitchIn * (trim - aMin);
    const aDot = (alpha - this.alphaPrev) / dt; this.alphaPrev = alpha;
    const Ka = (this.isProp ? 16 : 20) * ctlEff, auth = A + (s.tvc ? 0.5 * this.rpm : 0);
    const wn2 = Ka * Math.min(auth, 2.6);
    let wx = wn2 * (aCmd - alpha) - 2 * 0.85 * Math.sqrt(wn2 + 0.5) * clamp(aDot, -6, 6) - 0.8 * this.omega.x * Math.min(A, 1);
    if (this.onGround) wx = (pitchIn > 0.05 && A > 0.5 ? pitchIn * 1.6 * Math.min(A, 1.4) : pitchIn < -0.05 ? pitchIn * 0.8 * Math.min(A, 1) : A > 1.6 ? 0.35 : 0) - this.omega.x * 2.5; // rotate only on command, with real elevator authority
    // natural weathervane keeps acting even with controls lost; deep stall nose-drop
    if (!this.onGround) wx -= sig * 2.2 * Math.sign(alpha) * (s.tvc ? 0.3 : 1) * Math.min(A + 0.3, 1.2) * (1 - Math.max(0, pitchIn) * (post > 1.5 ? 0.9 : 0.35));
    // roll
    const helix = (s.era === 'WW1' ? 0.14 : 0.11) * 2 * V / s.b; const pMax = Math.min(this.maxRoll, helix) * (this.isProp && this.ias > 130 ? Math.max(0.45, 1 - (this.ias - 130) / 220) : 1);
    const pCmd = rollIn * pMax * ctlEff * (1 - 0.6 * sig);
    const p = -this.omega.z; // roll-right rate
    let pd = (pCmd - p) / (this.isProp ? 0.16 : 0.11) * Math.min(A * 1.5, 1) - p * 0.4 * (1 - Math.min(A * 1.5, 1));
    pd += -beta * 3.5 * A; // dihedral effect
    const r = -this.omega.y; // yaw-right rate
    const spinK = s.fbw ? 0.15 : 1, air = this.onGround ? 0 : 1;
    pd += air * sig * (r * 9 + beta * 6 + Math.sin(this.pos.x * 0.37 + this.pos.z * 0.21) * 1.8) * spinK; // asymmetric wing stall / autorotation
    if (this.isProp && !this.onGround) pd -= 0.35 * this.rpm * this.rpm / (1 + A * 2.5); // engine torque at low speed
    // yaw
    let rd = A * 7 * beta * (1 - 0.6 * sig * spinK) - r * (1.2 + 2.2 * A) * (1 - 0.5 * sig * spinK) + yawIn * 1.6 * Math.max(A, 0.45 * sig) * ctlEff + air * sig * spinK * (p * 1.1 + Math.sign(r) * Math.min(Math.abs(r), 1) * 0.9) + rollIn * 0.12 * A * (this.isProp ? -1 : 0); // weathervane, damping, rudder, adverse yaw
    // rotary-engine gyroscopics
    if (s.gyro) { const gk = s.gyro * this.rpm; wx += -gk * r * 1.4; rd += gk * this.omega.x * 1.2; }
    // damage: asymmetric drag/roll
    pd += this.damage.wing * 0.8 * A;
    this.stallShake = this.onGround ? 0 : sig * Math.min(A + 0.2, 1);
    // exceeding the airframe's never-exceed speed: buffet, then structural damage
    const vne = s.vne || (s.era === 'WW1' ? 78 : this.isProp ? 215 : s.supersonic ? 440 : 335); this.overspeed = this.ias > vne;
    if (this.overspeed) { const o = this.ias / vne - 1; this.stallShake = Math.max(this.stallShake, Math.min(1, o * 6)); this.damage.wing = Math.min(1, this.damage.wing + o * dt * 1.2); }

    // ---- integrate
    this.omega.x += wx * dt; this.omega.y += -rd * dt; this.omega.z += -pd * dt;
    const om = this.omega; const wl = om.length();
    if (wl > 9) om.multiplyScalar(9 / wl);
    if (wl > 1e-6) { _q.setFromAxisAngle(_v.copy(om).multiplyScalar(1 / Math.max(wl, 1e-6)), Math.min(wl, 9) * dt); q.multiply(_q).normalize(); }
    this.vel.addScaledVector(_f, dt / s.mass); this.pos.addScaledVector(this.vel, dt); this.vs = this.vel.y;

    // ---- ground contact
    const gh = ground(this.pos.x, this.pos.z); const wheelY = this.pos.y + this.gearY;
    if (wheelY <= gh) {
      _fw.set(0, 0, -1).applyQuaternion(q); _up.set(0, 1, 0).applyQuaternion(q); _rt.set(1, 0, 0).applyQuaternion(q);
      const water = gh <= 0.01, sink = -this.vel.y, pitchUp = Math.asin(clamp(_fw.y, -1, 1)), bank = Math.atan2(-_rt.y, _up.y);
      const hard = sink > (this.gearPos > 0.9 ? 6.5 : 2.5) || water || this.gearPos < 0.9 && V > 25 || Math.abs(bank) > 0.5 || pitchUp < -0.2 || _up.y < 0.5;
      if (hard) { this.crashed = water ? 'water' : 'ground'; this.pos.y = gh - this.gearY; return; }
      this.onGround = true; this.pos.y = gh - this.gearY; if (this.vel.y < 0) this.vel.y *= -0.05;
      // friction
      const fs = this.vel.dot(_fw), ss = this.vel.dot(_rt);
      const mu = 0.03 + 0.5 * clamp(c.brake, 0, 1) + (run ? 0 : 0.01);
      const dec = Math.min(Math.abs(fs), mu * G * dt) * Math.sign(fs);
      this.vel.addScaledVector(_fw, -dec).addScaledVector(_rt, -ss * Math.min(1, 12 * dt));
      // attitude: settle on gear, allow rotation with elevator authority
      const rest = this.tailDragger ? 0.2 * (1 - sstep(0.25, 0.6, A)) : 0;
      const lim = rest + (pitchIn > 0.05 ? 0.22 : 0.012);
      if (pitchUp < rest) { this.omega.x += (rest - pitchUp) * 30 * dt - this.omega.x * 6 * dt; }
      else if (pitchUp > lim) { this.omega.x -= (pitchUp - lim) * 30 * dt + Math.max(0, this.omega.x) * 6 * dt; }
      this.omega.z += (bank * 40 - this.omega.z * 12) * dt;
      this.omega.y += (-yawIn * clamp(fs / 15, -1, 1) * 0.9 * (1 - 0.6 * Math.min(A, 1)) - this.omega.y) * 5 * dt; // nose-wheel / tail-wheel steering
    } else if (wheelY > gh + 0.3) this.onGround = false;
    if (!isFinite(this.pos.x + this.vel.x + q.x)) this.crashed = 'ground';
  }
}
