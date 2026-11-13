// Remote player avatar: armoured body with IK arms, snapshot interpolation and hitboxes. Also the practice bot.
import * as THREE from 'three';
import { buildModel, grenadeMesh, TYPE_BY_ID, DEFS } from './weapons.js';
import { handMesh } from './player.js';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
const UP = new THREE.Vector3(0, 1, 0);

// closest approach of a ray to a segment -> {t (ray param), d (distance)}
const R1 = new THREE.Vector3(), R2 = new THREE.Vector3(), R3 = new THREE.Vector3(), R4 = new THREE.Vector3();
function raySeg(o, d, p0, p1) {
  R1.subVectors(p1, p0); R2.subVectors(o, p0);
  const b = d.dot(R1), c = R1.dot(R1), dd = d.dot(R2), e = R1.dot(R2), den = c - b * b;
  let s = den > 1e-8 ? (e - b * dd) / den : 0; s = Math.max(0, Math.min(1, s));
  const t = Math.max(0, b * s - dd);
  R3.copy(o).addScaledVector(d, t); R4.copy(p0).addScaledVector(R1, s);
  return { t, d: R3.distanceTo(R4) };
}
const P0 = new THREE.Vector3(), P1 = new THREE.Vector3();
// ray vs a standing body defined only by its head position. Returns {t, part} or null
export function hitBody(head, o, d, maxT) {
  let best = null;
  const test = (y0, y1, r, part) => {
    P0.set(head.x, y0, head.z); P1.set(head.x, y1, head.z);
    const h = raySeg(o, d, P0, P1); if (h.d > r) return;
    const t = h.t - Math.sqrt(r * r - h.d * h.d);
    if (t > 0 && t < maxT && (!best || t < best.t)) best = { t, part };
  };
  test(head.y, head.y + 0.02, 0.135, 'head');
  test(head.y * 0.55, head.y - 0.2, 0.2, 'torso');
  test(0.12, head.y * 0.55, 0.15, 'legs');
  return best;
}

function limb(parent, r, mat) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, 1, 8), mat); m.geometry.translate(0, -0.5, 0); m.castShadow = true; parent.add(m); return m; }
function aim(mesh, from, to) { mesh.position.copy(from); R1.subVectors(to, from); const l = R1.length(); mesh.scale.set(1, l, 1); mesh.quaternion.setFromUnitVectors(R2.set(0, -1, 0), R1.multiplyScalar(1 / (l || 1))); }

export class Avatar {
  constructor(game, color = 0xff5a20) {
    this.g = game; this.root = new THREE.Group(); game.scene.add(this.root); this.root.visible = false;
    const armor = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.55, metalness: 0.5 }), cloth = new THREE.MeshStandardMaterial({ color: 0x33362f, roughness: 0.9 }), glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.5) });
    const add = (geo, mat, parent = this.root) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; };
    this.headG = new THREE.Group(); this.root.add(this.headG);
    const helm = add(new THREE.SphereGeometry(0.125, 16, 12), armor, this.headG); helm.scale.set(1, 1.08, 1.12);
    const visor = add(new THREE.BoxGeometry(0.19, 0.055, 0.1), glow, this.headG); visor.position.set(0, 0.01, -0.08);
    const jaw = add(new THREE.BoxGeometry(0.16, 0.09, 0.13), armor, this.headG); jaw.position.set(0, -0.075, -0.045);
    this.torso = new THREE.Group(); this.root.add(this.torso);
    const chest = add(new THREE.BoxGeometry(0.4, 0.34, 0.24), armor, this.torso); chest.position.y = -0.17;
    const plate = add(new THREE.BoxGeometry(0.3, 0.22, 0.05), cloth, this.torso); plate.position.set(0, -0.17, -0.13);
    const strip = add(new THREE.BoxGeometry(0.12, 0.02, 0.01), glow, this.torso); strip.position.set(0, -0.1, -0.157);
    const belly = add(new THREE.BoxGeometry(0.34, 0.26, 0.2), cloth, this.torso); belly.position.y = -0.46;
    const pack = add(new THREE.BoxGeometry(0.28, 0.32, 0.1), cloth, this.torso); pack.position.set(0, -0.2, 0.16);
    for (const s of [-1, 1]) { const sh = add(new THREE.SphereGeometry(0.085, 10, 8), armor, this.torso); sh.position.set(s * 0.22, -0.05, 0); }
    this.neck = limb(this.root, 0.05, cloth);
    this.arms = [0, 1].map(() => ({ up: limb(this.root, 0.05, cloth), fore: limb(this.root, 0.042, armor) }));
    this.legs = [0, 1].map(() => ({ up: limb(this.root, 0.075, cloth), low: limb(this.root, 0.06, armor) }));
    this.handM = [handMesh(false, 0x1a1c1f), handMesh(true, 0x1a1c1f)]; this.handM.forEach((h) => this.root.add(h));
    this.guns = {}; for (const t of ['pistol', 'rifle', 'shotgun']) { const m = buildModel(t); m.group.visible = false; this.root.add(m.group); this.guns[t] = m; m.flash.visible = false; }
    this.nades = [grenadeMesh(), grenadeMesh()]; this.nades.forEach((n) => { n.visible = false; this.root.add(n); });
    this.flash = new THREE.SpotLight(0xdfe8ff, 0, 22, 0.42, 0.55, 1.4); this.flashHolder = new THREE.Object3D(); this.root.add(this.flashHolder); this.flashHolder.add(this.flash); this.flash.target.position.set(0, 0, -6); this.flashHolder.add(this.flash.target);
    this.head = new THREE.Vector3(0, 1.6, 0); this.headQ = new THREE.Quaternion(); this.hands = [new THREE.Vector3(), new THREE.Vector3()]; this.handQ = [new THREE.Quaternion(), new THREE.Quaternion()];
    this.yaw = 0; this.buf = []; this.alive = false; this.present = false; this.walk = 0; this.last = new THREE.Vector3(); this.stepAcc = 0; this.speed = 0;
  }
  reset() { this.buf.length = 0; this.present = false; this.root.visible = false; this.alive = false; }
  push(s) { s._t = performance.now() / 1000; this.buf.push(s); if (this.buf.length > 30) this.buf.shift(); this.present = true; }
  rayHit(o, d, maxT) { return this.alive && this.present ? hitBody(this.head, o, d, maxT) : null; }

  update(dt) {
    if (!this.present || !this.buf.length) { this.root.visible = false; return; }
    const rt = performance.now() / 1000 - 0.09, B = this.buf;
    let i = B.length - 1; while (i > 0 && B[i]._t > rt) i--;
    const s0 = B[i], s1 = B[Math.min(i + 1, B.length - 1)], k = s1 === s0 ? 0 : Math.max(0, Math.min(1, (rt - s0._t) / (s1._t - s0._t)));
    const V = (out, a, b) => out.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
    const Q = (out, a, b) => out.set(a[0], a[1], a[2], a[3]).slerp(_q.set(b[0], b[1], b[2], b[3]), k);
    const wasAlive = this.alive; this.alive = !!s1.al;
    if (wasAlive && !this.alive) { _a.copy(this.head); _a.y -= 0.3; this.g.fx.spark(_a, UP, 60, 5, 1.2); this.g.fx.puff(_a, _b.set(0, 0.6, 0), 0.4, 1.6, 1.2, 0.5, 0x444444); }
    this.root.visible = this.alive; if (!this.alive) { this.flash.intensity = 0; return; }
    V(this.head, s0.h, s1.h); Q(this.headQ, s0.hq, s1.hq);
    const H = this.head, c = Math.cos(this.yaw), sn = Math.sin(this.yaw);
    _e.setFromQuaternion(this.headQ); let dy = _e.y - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 5);
    this.headG.position.copy(H); this.headG.quaternion.copy(this.headQ);
    const ty = H.y - 0.2; this.torso.position.set(H.x, ty, H.z); this.torso.rotation.y = this.yaw;
    aim(this.neck, _c.set(H.x, H.y - 0.05, H.z), _d.set(H.x, ty - 0.02, H.z));
    // movement / footsteps
    const mv = Math.hypot(H.x - this.last.x, H.z - this.last.z); this.speed = mv / Math.max(dt, 0.001); this.last.copy(H);
    if (mv < 1) { this.walk += mv * 4.5; this.stepAcc += mv; if (this.stepAcc > 0.75) { this.stepAcc = 0; this.g.audio.step(_a.set(H.x, 0.1, H.z), 0.55); } }
    // legs
    const hipY = H.y * 0.53, sw = Math.min(1, this.speed / 2) * 0.22;
    for (let L = 0; L < 2; L++) {
      const sd = L ? 1 : -1, ph = Math.sin(this.walk + L * Math.PI) * sw;
      const hx = H.x + sd * 0.1 * c, hz = H.z - sd * 0.1 * sn;
      const fx = hx - sn * ph, fz = hz - c * ph;
      const kx = (hx + fx) / 2 - sn * 0.09, kz = (hz + fz) / 2 - c * 0.09, ky = hipY * 0.52;
      aim(this.legs[L].up, _c.set(hx, hipY, hz), _d.set(kx, ky, kz)); aim(this.legs[L].low, _d, _c.set(fx, 0.03, fz));
    }
    // hands + arms (2-bone IK)
    for (let h = 0; h < 2; h++) {
      const pk = h ? 'r' : 'l', qk = h ? 'rq' : 'lq', sd = h ? 1 : -1, ok = s0[pk] && s1[pk];
      const sx = H.x + sd * 0.22 * c, sz = H.z - sd * 0.22 * sn, sy = ty - 0.05;
      if (ok) { V(this.hands[h], s0[pk], s1[pk]); Q(this.handQ[h], s0[qk], s1[qk]); }
      else { this.hands[h].set(sx + sd * 0.06 * c, sy - 0.55, sz - sd * 0.06 * sn); this.handQ[h].setFromAxisAngle(UP, this.yaw); }
      const hp = this.hands[h]; this.handM[h].position.copy(hp); this.handM[h].quaternion.copy(this.handQ[h]);
      _c.set(sx, sy, sz); _a.subVectors(hp, _c); let len = _a.length(); const U = 0.3, F = 0.3;
      if (len > U + F - 0.01) { len = U + F - 0.01; }
      _a.normalize(); const mid = len / 2, hgt = Math.sqrt(Math.max(0, U * U - mid * mid));
      _b.set(sd * c * 0.5, -1, -sd * sn * 0.5).addScaledVector(_a, -_b.dot(_a)).normalize();
      _d.copy(_c).addScaledVector(_a, mid).addScaledVector(_b, hgt);
      aim(this.arms[h].up, _c, _d); aim(this.arms[h].fore, _d, hp);
    }
    // weapons
    let lit = false;
    for (const t in this.guns) this.guns[t].group.visible = false;
    const w0 = s0.w || [], w1 = s1.w || [];
    for (const b of w1) {
      const a = w0.find((x) => x[0] === b[0]) || b, m = this.guns[TYPE_BY_ID[b[0]]]; if (!m) continue;
      m.group.visible = true; V(m.group.position, a[1], b[1]); Q(m.group.quaternion, a[2], b[2]); m.slide.position.z = b[3] || 0;
      if (!lit && s1.fl) { lit = true; m.group.updateMatrixWorld(true); m.lightMount.getWorldPosition(this.flashHolder.position); this.flashHolder.quaternion.copy(m.group.quaternion); }
    }
    this.flash.intensity = lit ? 70 : 0;
    this.nades.forEach((n, i) => { const on = (s1.g || []).includes(i); n.visible = on; if (on) { n.position.copy(this.hands[i]); n.quaternion.copy(this.handQ[i]); } });
    for (const t in this.guns) { const m = this.guns[t]; if (m.flashT > 0) { m.flashT -= dt; if (m.flashT <= 0) m.flash.visible = false; } }
  }
  muzzleFlash(id, mat) { const m = this.guns[TYPE_BY_ID[id]]; if (!m) return; m.flash.material = mat; m.flash2.material = mat; m.flash.visible = true; m.flashT = 0.05; m.flash.rotation.z = Math.random() * 6.28; }
}

// ---------- practice bot: behaves like a network peer ----------
export class Bot {
  constructor(game) {
    this.g = game; this.pos = new THREE.Vector3(12, 0, 12); this.goal = new THREE.Vector3(); this.hp = 100; this.alive = true; this.respawn = 0;
    this.yaw = 0; this.burst = 0; this.cool = 1.5; this.shotT = 0; this.aimErr = new THREE.Vector3(); this.seen = 0; this.repath = 0; this.strafe = 1;
    this.head = new THREE.Vector3(); this.gq = new THREE.Quaternion(); this.gp = new THREE.Vector3();
  }
  place(x, z) { this.pos.set(x, 0, z); this.hp = 100; this.alive = true; this.pickGoal(); }
  pickGoal() { const s = this.g.world.spawns, p = s[Math.floor(Math.random() * s.length)]; this.goal.set(p[0] + (Math.random() - 0.5) * 6, 0, p[1] + (Math.random() - 0.5) * 6); this.repath = 3 + Math.random() * 4; this.strafe = Math.random() < 0.5 ? -1 : 1; }
  recv(m) {
    if (m.t === 'h' && this.alive) {
      this.hp -= m.dmg; this.seen = 2;
      if (this.hp <= 0) { this.alive = false; this.respawn = 3; this.g.onMsg({ t: 'k' }); }
    }
  }
  explosion(p) { if (!this.alive) return; const d = p.distanceTo(this.head); if (d < 7 && !this.g.world.blocked(p, this.head)) this.recv({ t: 'h', dmg: 140 * Math.pow(1 - d / 7, 1.3) }); }
  update(dt) {
    const g = this.g, pl = g.player, live = g.match.ph === 'live';
    if (!this.alive) {
      this.respawn -= dt;
      if (this.respawn <= 0 && g.match.ph !== 'over') { const sp = g.farSpawn(pl.head); this.place(sp[0], sp[1]); }
      g.onMsg({ t: 's', h: [this.pos.x, 1.6, this.pos.z], hq: [0, 0, 0, 1], l: null, r: null, al: 0, w: [], g: [] }); return;
    }
    this.head.set(this.pos.x, 1.62, this.pos.z);
    const los = pl.alive && !g.world.blocked(this.head, pl.head);
    this.seen = los ? Math.min(2, this.seen + dt) : Math.max(0, this.seen - dt);
    // movement
    this.repath -= dt;
    _a.subVectors(this.goal, this.pos); _a.y = 0; const dist = _a.length();
    if (dist < 0.6 || this.repath <= 0) this.pickGoal();
    if (live) {
      _a.normalize(); const sp = los ? 1.7 : 2.6;
      if (los) { _b.subVectors(pl.head, this.pos).setY(0).normalize(); _a.set(-_b.z * this.strafe, 0, _b.x * this.strafe).addScaledVector(_b, dist > 9 ? 0.5 : -0.2).normalize(); }
      const bx = this.pos.x, bz = this.pos.z;
      this.pos.addScaledVector(_a, sp * dt); g.world.resolveCircle(this.pos, 0.3, 0.3, 1.7);
      if (Math.hypot(this.pos.x - bx, this.pos.z - bz) < sp * dt * 0.3) this.repath -= dt * 4;
    }
    // facing + aim
    _b.copy(pl.head); _b.y -= 0.28; _c.subVectors(_b, this.head);
    const wantYaw = los || this.seen > 0 ? Math.atan2(-_c.x, -_c.z) : Math.atan2(-_a.x, -_a.z);
    let dy = wantYaw - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 5);
    const c = Math.cos(this.yaw), s = Math.sin(this.yaw);
    this.gp.set(this.head.x + 0.16 * c - -0.32 * -s, this.head.y - 0.22, this.head.z - 0.16 * s - 0.32 * c);
    this.aimErr.x += (Math.random() - 0.5) * dt * 0.6 - this.aimErr.x * dt * 2; this.aimErr.y += (Math.random() - 0.5) * dt * 0.6 - this.aimErr.y * dt * 2;
    _d.subVectors(_b, this.gp).normalize();
    if (!(los || this.seen > 0)) _d.set(-s, 0, -c);
    _d.x += this.aimErr.x; _d.y += this.aimErr.y; _d.normalize();
    this.gq.setFromUnitVectors(_a.set(0, 0, -1), _d);
    const hq = _q.setFromAxisAngle(UP, this.yaw);
    const fore = _c.copy(this.gp).addScaledVector(_d, 0.3);
    const R = (v) => [v.x, v.y, v.z], Qa = (q) => [q.x, q.y, q.z, q.w];
    g.onMsg({ t: 's', h: R(this.head), hq: Qa(hq), l: R(fore), lq: Qa(this.gq), r: R(this.gp), rq: Qa(this.gq), al: 1, fl: 1, w: [[2, R(this.gp), Qa(this.gq), 0]], g: [] });
    // shooting: short bursts once the player has been visible for a moment
    this.cool -= dt; this.shotT -= dt;
    if (live && los && this.seen > 0.7 && this.cool <= 0 && this.burst === 0) { this.burst = 2 + Math.floor(Math.random() * 3); }
    if (this.burst > 0 && this.shotT <= 0) {
      this.burst--; this.shotT = 0.11; if (this.burst === 0) this.cool = 0.9 + Math.random() * 1.1;
      const o = _b.copy(this.gp).addScaledVector(_d, 0.6), dir = _a.copy(_d);
      dir.x += (Math.random() - 0.5) * 0.07; dir.y += (Math.random() - 0.5) * 0.07; dir.normalize();
      g.onMsg({ t: 'f', w: 2, o: R(o), d: [R(dir)] });
      const wh = g.world.raycast(o, dir, 150), bh = hitBody(pl.head, o, dir, wh ? wh.t : 150);
      if (bh && live) g.onMsg({ t: 'h', dmg: (bh.part === 'head' ? 2 : 1) * 11, o: R(o) });
    }
  }
}
