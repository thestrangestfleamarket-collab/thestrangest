// COLD BORE's people: built from a few shapes, walking their errands, hit by head, body or legs, running when a shot lands
import * as THREE from 'three';
import { Kit, M4 } from './world.js';

const SKIN = [[0.9, 0.72, 0.6], [0.78, 0.58, 0.44], [0.55, 0.38, 0.27], [0.36, 0.25, 0.18], [0.95, 0.8, 0.7]], HAIR = [[0.08, 0.06, 0.05], [0.25, 0.15, 0.08], [0.55, 0.42, 0.2], [0.5, 0.5, 0.5], [0.3, 0.08, 0.05]];
const COAT = [[0.2, 0.25, 0.4], [0.5, 0.2, 0.2], [0.25, 0.4, 0.3], [0.7, 0.65, 0.5], [0.15, 0.15, 0.17], [0.6, 0.35, 0.15], [0.35, 0.3, 0.5], [0.8, 0.8, 0.78], [0.2, 0.45, 0.6]], LEGS = [[0.12, 0.13, 0.18], [0.2, 0.2, 0.22], [0.3, 0.26, 0.2], [0.18, 0.22, 0.34]];
const pick = (R, a) => a[R() * a.length | 0];

// closest approach of segment p→q to segment a→b: [distance squared, how far along p→q]
export function segSeg(p, q, a, b) {
  const d1x = q.x - p.x, d1y = q.y - p.y, d1z = q.z - p.z, d2x = b.x - a.x, d2y = b.y - a.y, d2z = b.z - a.z, rx = p.x - a.x, ry = p.y - a.y, rz = p.z - a.z;
  const A = d1x * d1x + d1y * d1y + d1z * d1z, E = d2x * d2x + d2y * d2y + d2z * d2z, F = d2x * rx + d2y * ry + d2z * rz, C = d1x * rx + d1y * ry + d1z * rz, B = d1x * d2x + d1y * d2y + d1z * d2z, den = A * E - B * B;
  let s = den > 1e-9 ? Math.min(1, Math.max(0, (B * F - C * E) / den)) : 0, t = E > 1e-9 ? (B * s + F) / E : 0;
  if (t < 0) { t = 0; s = Math.min(1, Math.max(0, -C / A)); } else if (t > 1) { t = 1; s = Math.min(1, Math.max(0, (B - C) / A)); }
  const x = rx + d1x * s - d2x * t, y = ry + d1y * s - d2y * t, z = rz + d1z * s - d2z * t; return [x * x + y * y + z * z, s];
}

export function makeFigure(mat, o, R) {
  const skin = o.skin || pick(R, SKIN), hair = o.hair || pick(R, HAIR), coat = o.coat || pick(R, COAT), legs = o.legs || pick(R, LEGS), shoe = [0.06, 0.05, 0.05], dk = (c, k = 0.8) => [c[0] * k, c[1] * k, c[2] * k];
  const g = new THREE.Group(), build = (fn) => { const k = new Kit(); fn(k); const m = k.build({ f: mat }, null, null)[0]; m.matrixAutoUpdate = true; m.castShadow = true; return m; };
  const cap = (k, x, y, z, r, len, c, sx = 1, sz = 1, rx = 0, rz = 0) => k.geo('f', new THREE.CapsuleGeometry(r, len, 3, 9), M4(x, y, z, rx, 0, rz, sx, 1, sz), c), W = o.female ? 0.9 : 1;
  const body = build(k => {
    cap(k, 0, 1.3, 0, 0.15, 0.2, coat, 1.22 * W, 0.78); cap(k, 0, 1.12, 0, 0.14, 0.12, coat, 1.1 * W, 0.8); cap(k, 0, 1.42, 0, 0.07, 0.3 * W, coat, 1, 1, 0, Math.PI / 2);
    cap(k, 0, 0.97, 0, 0.13, 0.06, o.skirt ? coat : legs, 1.15, 0.82); if (!o.skirt) k.box('f', 0, 1.02, 0, 0.36 * W, 0.16, 0.235, { color: dk(coat, 0.92) });
    if (o.skirt) k.geo('f', new THREE.CylinderGeometry(0.16, 0.25, 0.5, 10), M4(0, 0.76, 0), coat);
    k.cyl('f', 0, 1.555, 0, 0.048, 0.1, skin, { seg: 8 }); k.ball('f', 0, 1.67, 0.005, 0.1, skin, 1.16, 0.9, 1.02); k.ball('f', 0, 1.625, 0.03, 0.075, skin, 0.9, 0.95, 1);
    k.box('f', 0, 1.655, 0.1, 0.022, 0.04, 0.03, { color: dk(skin, 0.93) }); for (const s of [-1, 1]) { k.ball('f', s * 0.092, 1.665, 0, 0.022, dk(skin, 0.9), 1.4, 0.5, 1); k.ball('f', s * 0.036, 1.69, 0.088, 0.012, [0.1, 0.08, 0.07]); }
    if (!o.bald) { k.ball('f', 0, 1.705, -0.018, 0.104, hair, 1.02, 0.95, 1.02); if (o.female) { k.ball('f', 0, 1.6, -0.06, 0.1, hair, 1.3, 0.95, 0.7); } }
    if (o.hat) { k.cyl('f', 0, 1.755, 0, 0.185, 0.014, o.hat, { seg: 16 }); k.cyl('f', 0, 1.805, 0, 0.105, 0.1, o.hat, { seg: 14, top: 0.095 }); k.cyl('f', 0, 1.768, 0, 0.107, 0.02, dk(o.hat, 0.4), { seg: 14 }); }
    if (o.cap) { k.ball('f', 0, 1.73, 0, 0.106, o.cap, 0.75, 1, 1); k.box('f', 0, 1.735, 0.125, 0.15, 0.012, 0.1, { color: o.cap }); }
    if (o.shades) { k.box('f', 0, 1.69, 0.092, 0.165, 0.032, 0.02, { color: [0.015, 0.015, 0.015] }); }
    if (o.tie || o.suit !== false && !o.female && !o.vest) { k.box('f', 0, 1.37, 0.112, 0.1, 0.24, 0.02, { color: o.tie ? [0.95, 0.95, 0.95] : dk(coat, 0.6) }); for (const s of [-1, 1]) k.box('f', s * 0.062, 1.4, 0.118, 0.05, 0.22, 0.016, { color: dk(coat, 0.85), ry: 0 }); }
    if (o.tie) k.box('f', 0, 1.35, 0.125, 0.042, 0.26, 0.012, { color: o.tie });
    if (o.vest) { cap(k, 0, 1.28, 0, 0.165, 0.18, o.vest, 1.2, 0.86); for (let i = -1; i <= 1; i++) k.box('f', i * 0.1, 1.2, 0.135, 0.075, 0.11, 0.04, { color: dk(o.vest, 0.8) }); }
    if (o.pack) k.box('f', 0, 1.28, -0.19, 0.3, 0.4, 0.14, { color: o.pack });
  });
  const leg = (s) => { const up = build(k => cap(k, 0, -0.21, 0, 0.078, 0.28, legs)), lo = build(k => { cap(k, 0, -0.2, 0, 0.058, 0.3, o.skirt ? skin : legs); k.ball('f', 0, -0.415, 0.05, 0.06, shoe, 0.6, 0.85, 2.1); });
    lo.position.y = -0.44; up.add(lo); up.knee = lo; up.position.set(s * 0.09, 0.92, 0); return up; };
  const arm = (s) => { const up = build(k => cap(k, 0, -0.14, 0, 0.052, 0.2, coat)), lo = build(k => { cap(k, 0, -0.12, 0, 0.043, 0.18, coat); k.ball('f', 0, -0.29, 0, 0.042, skin, 1.25, 0.8, 1);
    if (s > 0 && o.case) { k.box('f', 0.0, -0.5, 0, 0.09, 0.3, 0.42, { color: o.case }); k.box('f', 0, -0.345, 0, 0.02, 0.04, 0.12, { color: [0.08, 0.08, 0.08] }); for (const z of [-0.12, 0.12]) k.box('f', 0.047, -0.4, z, 0.004, 0.03, 0.03, { color: [0.75, 0.65, 0.3] }); }
    if (s > 0 && o.gun) { k.box('f', -0.05, -0.27, 0.16, 0.04, 0.07, 0.62, { color: [0.06, 0.06, 0.065] }); k.cyl('f', -0.05, -0.26, 0.6, 0.012, 0.36, [0.05, 0.05, 0.05], { rx: Math.PI / 2, seg: 6 }); k.box('f', -0.05, -0.36, 0.1, 0.03, 0.16, 0.05, { color: [0.06, 0.06, 0.065] }); k.cyl('f', -0.05, -0.2, 0.2, 0.02, 0.22, [0.04, 0.04, 0.04], { rx: Math.PI / 2, seg: 8 }); }
    if (s > 0 && o.phone) k.box('f', -0.03, -0.33, 0.02, 0.016, 0.13, 0.065, { color: [0.04, 0.04, 0.05] }); });
    lo.position.y = -0.29; up.add(lo); up.elbow = lo; up.position.set(s * (o.female ? 0.2 : 0.235) * (o.female ? 1 : 1), 1.45, 0); return up; };
  const P = { body, legL: leg(-1), legR: leg(1), armL: arm(-1), armR: arm(1) }; const inner = new THREE.Group(); inner.add(body, P.legL, P.legR, P.armL, P.armR); g.add(inner);
  const blob = new THREE.Mesh(BLOB, BLOBM); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03; blob.renderOrder = 2; g.add(blob);
  const sc = o.scale || 0.95 + R() * 0.1; inner.scale.setScalar(sc); return { g, inner, P, sc };
}
const BLOB = new THREE.CircleGeometry(0.42, 16), BLOBM = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.38, depthWrite: false });

const _a = new THREE.Vector3(), _b = new THREE.Vector3();
export class Crowd {
  constructor(game) { this.g = game; this.list = []; this.group = new THREE.Group(); game.scene.add(this.group); }
  clear() { this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); this.group.clear(); this.list = []; }
  // tasks: {to:[x,z], speed, run} · {wait:seconds, pose} · {call:fn} ; loop repeats them
  add(o, R) {
    const f = makeFigure(this.g.world.figMat, o, R), p = { ...f, o, name: o.name || '', role: o.role || 'civ', pos: new THREE.Vector3(o.at[0], o.y || 0, o.at[1]), yaw: o.yaw || 0, tasks: o.tasks || [], ti: 0, tt: 0, loop: o.loop !== false, pose: o.pose || 'stand',
      phase: R() * 6, alive: true, gone: false, snap: true, fall: 0, fallDir: 1, speed: 0, alert: false, hold: 0 };
    this.group.add(f.g); this.list.push(p); this.place(p); return p;
  }
  place(p) { p.g.position.copy(p.pos); p.g.rotation.y = p.yaw; }
  set(p, tasks, loop = false) { p.tasks = tasks; p.ti = 0; p.tt = 0; p.loop = loop; }
  // everyone within r of a point learns of it: civilians run for the nearest way out, the rest do what their mission says
  alarm(at, r, exits) {
    for (const p of this.list) { if (!p.alive || p.gone || p.alert || p.pos.distanceTo(at) > r) continue; p.alert = true;
      if (p.onAlarm) { p.onAlarm(p); continue; } if (p.role !== 'civ') continue;
      let best = exits[0], bd = 1e9; for (const e of exits) { const d = Math.hypot(e[0] - p.pos.x, e[1] - p.pos.z) + (Math.hypot(e[0] - at.x, e[1] - at.z) < Math.hypot(p.pos.x - at.x, p.pos.z - at.z) ? 30 : 0); if (d < bd) { bd = d; best = e; } }
      this.set(p, [{ wait: 0.15 + Math.random() * 0.6, pose: 'cower' }, { to: best, run: true }, { call: (q) => { q.gone = true; q.g.visible = false; } }]); }
  }
  update(dt) {
    for (const p of this.list) {
      if (p.gone) continue; const P = p.P;
      if (!p.alive) { if (p.fall < 1) { p.fall = Math.min(1, p.fall + dt * 2.4); const e = p.fall * p.fall; p.inner.rotation.x = p.fallDir * e * 1.5; p.inner.position.y = (p.sitY || 0) * (1 - e) + 0.12 * e; P.armL.rotation.z = -e * 1.2; P.armR.rotation.z = e * 0.9; P.legL.rotation.x = e * 0.25 * p.fallDir; P.legR.rotation.x = -e * 0.15; P.legL.knee.rotation.x = e * 0.5; p.g.children[1].visible = false; } continue; }
      let t = p.tasks[p.ti], moving = false, run = false, pose = p.pose;
      if (t) {
        if (t.to) { const dx = t.to[0] - p.pos.x, dz = t.to[1] - p.pos.z, d = Math.hypot(dx, dz), sp = t.speed || (t.run ? 4.6 : 1.35); run = !!t.run;
          if (d < sp * dt + 0.02) { p.pos.x = t.to[0]; p.pos.z = t.to[1]; p.ti++; p.tt = 0; } else { p.pos.x += dx / d * sp * dt; p.pos.z += dz / d * sp * dt; const want = Math.atan2(dx, dz); let dy = want - p.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.yaw += dy * Math.min(1, dt * 8); moving = true; p.speed = sp; p.phase += sp * dt * (run ? 2.2 : 3.6); }
        } else if (t.wait !== undefined) { p.tt += dt; pose = t.pose || 'stand'; if (t.yaw !== undefined) { let dy = t.yaw - p.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.yaw += dy * Math.min(1, dt * 5); } if (p.tt >= t.wait) { p.ti++; p.tt = 0; } }
        else if (t.call) { p.ti++; t.call(p); }
        if (p.ti >= p.tasks.length && p.loop && p.tasks.length) p.ti = 0;
      }
      p.moving = moving; p.curPose = moving ? 'walk' : pose; this.place(p);
      const s = Math.sin(p.phase), k = p.snap ? 1 : Math.min(1, dt * 10), to = (o, ax, v) => { o.rotation[ax] += (v - o.rotation[ax]) * k; }; let y = 0, lean = 0, kL = 0.04, kR = 0.04, eL = -0.15, eR = -0.15;
      const gt = this.g.time;
      if (moving) { const a = run ? 0.95 : 0.52, c = Math.cos(p.phase); to(P.legL, 'x', -s * a - (run ? 0.25 : 0.05)); to(P.legR, 'x', s * a - (run ? 0.25 : 0.05)); kL = Math.max(0, c) * (run ? 1.6 : 0.95) + 0.08; kR = Math.max(0, -c) * (run ? 1.6 : 0.95) + 0.08;
        to(P.armL, 'x', s * a * (run ? 1 : 0.6)); to(P.armR, 'x', (p.o.case || p.o.gun ? 0.12 : 1) * -s * a * 0.6); to(P.armR, 'z', 0); to(P.armL, 'z', 0); eL = run ? -1.4 : -0.3 - Math.max(0, s) * 0.25; eR = p.o.case ? -0.05 : run ? -1.4 : -0.3 - Math.max(0, -s) * 0.25; lean = run ? 0.2 : 0.03; y = Math.abs(c) * (run ? 0.05 : 0.02) - 0.02; }
      else if (pose === 'sit') { to(P.legL, 'x', -1.5); to(P.legR, 'x', -1.5); kL = kR = 1.5; to(P.armL, 'x', -0.5); to(P.armR, 'x', -0.6); eL = eR = -0.9; to(P.armR, 'z', 0); to(P.armL, 'z', 0); y = -0.42; }
      else if (pose === 'phone') { to(P.legL, 'x', 0); to(P.legR, 'x', 0); to(P.armR, 'x', -0.75); to(P.armR, 'z', -0.3); eR = -2.25; to(P.armL, 'x', Math.sin(gt * 0.7 + p.phase) * 0.08); to(P.armL, 'z', 0); }
      else if (pose === 'talk') { to(P.legL, 'x', 0); to(P.legR, 'x', 0); to(P.armR, 'x', -0.35); eR = -1.3 - Math.sin(gt * 2.3 + p.phase) * 0.45; to(P.armL, 'x', -0.1); eL = -0.5 + Math.sin(gt * 1.7 + p.phase) * 0.3; to(P.armR, 'z', 0); to(P.armL, 'z', 0); }
      else if (pose === 'watch') { to(P.legL, 'x', 0); to(P.legR, 'x', 0); to(P.armL, 'x', -0.5); to(P.armL, 'z', 0.35); eL = -1.6; to(P.armR, 'x', 0); to(P.armR, 'z', 0); }
      else if (pose === 'guard') { to(P.legL, 'x', 0.05); to(P.legR, 'x', -0.05); to(P.armR, 'x', -0.25); eR = -1.2; to(P.armL, 'x', -0.5); eL = -1.3; to(P.armL, 'z', 0.45); to(P.armR, 'z', 0); }
      else if (pose === 'aim') { to(P.legL, 'x', -1.5); kL = 1.6; to(P.legR, 'x', 0.1); kR = 1.6; to(P.armR, 'x', -1.2); eR = -0.5; to(P.armL, 'x', -1.3); eL = -0.4; to(P.armL, 'z', 0.4); to(P.armR, 'z', -0.1); y = -0.5; }
      else if (pose === 'cower') { to(P.legL, 'x', -1.2); to(P.legR, 'x', -1.2); kL = kR = 2.1; to(P.armL, 'x', -2.4); to(P.armR, 'x', -2.4); eL = eR = -1.6; y = -0.45; lean = 0.4; }
      else { to(P.legL, 'x', 0); to(P.legR, 'x', 0); to(P.armL, 'x', Math.sin(gt * 0.8 + p.phase) * 0.04); to(P.armR, 'x', -Math.sin(gt * 0.8 + p.phase) * 0.04); to(P.armR, 'z', 0); to(P.armL, 'z', 0); }
      to(P.legL.knee, 'x', kL); to(P.legR.knee, 'x', kR); to(P.armL.elbow, 'x', eL); to(P.armR.elbow, 'x', eR);
      p.snap = false; p.sitY = y; p.inner.position.y += (y - p.inner.position.y) * k; p.inner.rotation.x += (lean - p.inner.rotation.x) * k;
    }
  }
  // the first living person the segment a→b passes through: {p, zone, s}
  hit(a, b) {
    let best = null;
    for (const p of this.list) {
      if (!p.alive || p.gone) continue; const x = p.pos.x, z = p.pos.z, sc = p.sc, oy = p.pos.y + (p.inner.position.y || 0);
      const mx = Math.min(a.x, b.x) - 0.6, Mx = Math.max(a.x, b.x) + 0.6; if (x < mx || x > Mx) continue; const mz = Math.min(a.z, b.z) - 0.6, Mz = Math.max(a.z, b.z) + 0.6; if (z < mz || z > Mz) continue;
      const lean = p.inner.rotation.x, fx = Math.sin(p.yaw) * Math.sin(lean), fz = Math.cos(p.yaw) * Math.sin(lean), cl = Math.cos(lean), at = (h) => _b.set(x + fx * h * sc, oy + h * sc * cl, z + fz * h * sc);
      const test = (h0, h1, r, zone) => { _a.copy(at(h0)); const top = at(h1).clone(); const [d2, s] = segSeg(a, b, _a, top); if (d2 < r * r * sc * sc && (!best || s < best.s)) best = { p, zone, s }; };
      test(1.67, 1.68, 0.118, 'head'); test(1.02, 1.46, 0.185, 'body'); if (p.curPose !== 'sit' && p.curPose !== 'aim' && p.curPose !== 'cower') test(0.12, 0.92, 0.15, 'legs'); else test(0.75, 0.95, 0.2, 'legs');
    }
    return best;
  }
  kill(p, dir) { p.alive = false; p.fall = 0; const f = Math.sin(p.yaw) * dir.x + Math.cos(p.yaw) * dir.z; p.fallDir = f > 0 ? 1 : -1; p.tasks = []; }
  head(p, out) { return out.set(p.pos.x, p.pos.y + (p.inner.position.y || 0) + 1.67 * p.sc, p.pos.z); }
  chest(p, out) { return out.set(p.pos.x, p.pos.y + (p.inner.position.y || 0) + 1.28 * p.sc, p.pos.z); }
}
