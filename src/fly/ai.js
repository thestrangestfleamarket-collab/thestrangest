// Dogfight AI: flies the same flight model as the player through stick/throttle commands.
import * as THREE from 'three';

const _d = new THREE.Vector3(), _l = new THREE.Vector3(), _q = new THREE.Quaternion(), _a = new THREE.Vector3();
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

export class AI {
  constructor(plane, skill = 0.6) {
    this.p = plane; this.skill = skill; this.target = null; this.retarget = 0; this.evade = 0; this.evadeDir = 1; this.aimErr = new THREE.Vector3(); this.errT = 0; this.burst = 0; this.extend = 0; this.rearm = 0;
    const s = plane.spec; this.vs = Math.sqrt(2 * s.mass * 9.81 / (1.225 * s.S * s.CLmax)); this.home = new THREE.Vector3();
  }
  onHit(by) { if (by && by.alive && Math.random() < 0.6 + this.skill * 0.4) { this.evade = 2 + Math.random() * 2.5; this.evadeDir = Math.random() < 0.5 ? -1 : 1; if (by.team !== this.p.team) this.target = by; } }

  update(dt) {
    const p = this.p, fm = p.fm, c = fm.ctl, g = p.game; this.retarget -= dt; this.evade -= dt; this.extend -= dt; this.errT -= dt;
    if (this.rearm > 0) { this.target = null; this.retarget = 1; }
    else if (this.retarget <= 0 || !this.target || !this.target.alive) { this.retarget = 2.5; let best = null, bd = 1e12;
      for (const o of g.aircraft) { if (o.team === p.team || !o.alive) continue; let d = o.fm.pos.distanceToSquared(fm.pos); if (o === this.target) d *= 0.5; if (o.isPlayer) d *= g.aiFocusPlayer; if (d < bd) { bd = d; best = o; } } this.target = best; }
    if (this.errT <= 0) { this.errT = 0.6; const e = (1 - this.skill) * 0.05; this.aimErr.set((Math.random() - 0.5) * e, (Math.random() - 0.5) * e, 0); }
    const speed = fm.tas, t = this.target; p.firing = false; c.yaw = 0; c.brake = 0;
    _q.copy(fm.quat).invert();
    // ---- terrain avoidance: look ahead along the velocity vector
    const look = 5.5, ax = fm.pos.x + fm.vel.x * look, az = fm.pos.z + fm.vel.z * look, gh = Math.max(g.world.ground(ax, az), g.world.ground(fm.pos.x + fm.vel.x * 2, fm.pos.z + fm.vel.z * 2), g.world.ground(fm.pos.x, fm.pos.z));
    const clear = fm.pos.y + Math.min(fm.vel.y, 0) * look - gh; const floor = 140 + speed * 0.9;
    if (clear < floor) { // roll wings level, pull
      const bank = Math.atan2(-p.right.y, p.up.y); c.roll = clamp(-bank * 2.5, -1, 1); c.pitch = Math.abs(bank) < 1.2 ? clamp((floor - clear) / floor * 2.2 + 0.3, 0, 1) : 0; c.throttle = 1; return; }
    let dir;
    if (this.rearm > 0) { this.rearm -= dt; if (this.rearm <= 0) { p.ammo = p.spec.gun.ammo; p.rockets = p.spec.rockets || 0; } }
    if (!t) { // orbit the patrol point
      _d.copy(this.home).sub(fm.pos); const hd = Math.hypot(_d.x, _d.z); _d.y = clamp(this.home.y - fm.pos.y, -400, 400) * 0.3; if (hd < 2500) { const tx = -_d.z, tz = _d.x; _d.x = tx; _d.z = tz; } dir = _d.normalize(); c.throttle = 0.75;
      this.steer(dir, 0.6); this.speedGuard(); return; }
    _d.copy(t.fm.pos).sub(fm.pos); const dist = _d.length(); const tof = dist / (p.spec.gun.v0 + 50);
    const closing = -(_a.copy(t.fm.vel).sub(fm.vel).dot(_d)) / dist;
    // lead for gunnery inside 1.3 km, otherwise fly to where the target is going
    _l.copy(t.fm.pos).addScaledVector(t.fm.vel, dist < 1300 ? tof : Math.min(dist / Math.max(speed, 50), 6) * 0.5).addScaledVector(fm.vel, dist < 1300 ? -tof : 0); if (dist < 1300) _l.y += 4.9 * tof * tof;
    dir = _l.sub(fm.pos).normalize();
    // energy / altitude discipline: don't follow a target up into a stall
    const ceil = p.spec.engine === 'jet' ? (p.spec.supersonic ? 12500 : 10500) : p.spec.era === 'WW1' ? 3500 : 7500; if ((fm.alt > ceil || fm.ias < this.vs * 1.35) && dir.y > 0) { dir.y = fm.ias < this.vs * 1.35 ? -0.25 : 0; dir.normalize(); }
    const cosOff = dir.dot(p.fwd), ang = Math.acos(clamp(cosOff, -1, 1));
    const behindMe = _a.copy(fm.pos).sub(t.fm.pos).normalize().dot(t.fwd) > 0.85 && dist < 900 && cosOff < 0.2; // target is on my six
    if (this.evade > 0 || behindMe && this.skill > 0.3) { // break turn, slightly nose-low to keep energy
      if (behindMe && this.evade <= 0) { this.evade = 2.5; this.evadeDir = Math.random() < 0.5 ? -1 : 1; }
      const bank = Math.atan2(-p.right.y, p.up.y), want = this.evadeDir * 1.35; c.roll = clamp((want - bank) * 2.5, -1, 1); c.pitch = Math.abs(want - bank) < 0.5 ? 0.9 : 0.2; if (fm.ias < this.vs * 1.3) { c.pitch = -0.1; c.roll *= 0.4; } c.throttle = 1; this.speedGuard(); return; }
    if (dist < 110 && closing > 20 || this.extend > 0) { if (this.extend <= 0) this.extend = 1.6; _d.copy(p.fwd).addScaledVector(p.up, 0.55).addScaledVector(p.right, 0.3 * this.evadeDir).normalize(); this.steer(_d, 1); c.throttle = 1; return; }
    dir.applyQuaternion(_q).add(this.aimErr).normalize(); dir.applyQuaternion(fm.quat);
    this.steer(dir, 1);
    // throttle: full in a turning fight, ease off when overshooting from behind
    c.throttle = dist < 450 && closing > 25 && cosOff > 0.9 ? 0.25 : 1; if (p.spec.airbrake) fm.airbrake = dist < 350 && closing > 40 && cosOff > 0.9;
    this.speedGuard();
    // gunnery
    const cone = 0.022 + (1 - this.skill) * 0.03 + 4 / Math.max(dist, 50);
    if (ang < cone && dist < (p.spec.engine === 'jet' ? 900 : 550) && dist > 40) this.burst = 0.35 + this.skill * 0.4;
    this.burst -= dt; p.firing = this.burst > 0 && p.ammo > 0;
    if (p.rockets > 0 && ang < 0.05 && dist < 1100 && dist > 250 && Math.abs(closing) < 200 && Math.random() < dt * 1.5 * (0.4 + this.skill)) p.fireRocket();
    // guns dry: break off, extend for a while, come back re-armed
    if (p.ammo <= 0 && this.rearm <= 0) { this.home.copy(fm.pos).addScaledVector(p.fwd, 5000); this.home.y = Math.max(1500, g.world.ground(this.home.x, this.home.z) + 900); this.target = null; this.retarget = 18; this.rearm = 18; }
  }
  // don't let the AI pull itself into a stall
  speedGuard() { const fm = this.p.fm, c = fm.ctl; const m = clamp((fm.ias - this.vs * 1.2) / (this.vs * 0.4), 0, 1); if (fm.ias < this.vs * 1.2) { c.pitch = Math.min(c.pitch, -0.15); c.throttle = 1; } if (c.pitch > 0) c.pitch *= m; if (fm.aoaStall > 0.2) c.pitch = Math.min(c.pitch, 0.1); }
  // roll the lift vector onto the desired direction, then pull
  steer(dirWorld, gain) {
    const p = this.p, c = p.fm.ctl; _a.copy(dirWorld).applyQuaternion(_q.copy(p.fm.quat).invert());
    const ang = Math.acos(clamp(-_a.z, -1, 1));
    if (ang > 0.14) { const rollErr = Math.atan2(_a.x, _a.y); c.roll = clamp(rollErr * 2.4, -1, 1); c.pitch = clamp(ang * 2.2, 0, 1) * (Math.abs(rollErr) < 0.8 ? 1 : 0.15) * gain; if (ang > 2.2 && Math.abs(rollErr) > 2.4) { c.pitch = gain; c.roll *= 0.3; } }
    else { c.pitch = clamp(_a.y * 9, -0.6, 1) * gain; c.yaw = clamp(_a.x * 6, -1, 1); const bank = Math.atan2(-p.right.y, p.up.y); c.roll = clamp(_a.x * 7 - bank * 0.4, -1, 1); }
  }
}
