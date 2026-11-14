// COLD BORE's people: Microsoft Rocketbox avatars moved by its recorded motion, walking their errands, hit by head, body or legs where their bones really are, running when a shot lands
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { A } from './assets.js';

const MEN = ['Male_Adult_03', 'Male_Adult_05', 'Male_Adult_06', 'Male_Adult_08'], WOMEN = ['Female_Adult_01', 'Female_Adult_02', 'Female_Adult_04', 'Female_Adult_09', 'Business_Female_03'], SUITS = ['Business_Male_01', 'Business_Male_03', 'Business_Male_05'];
const POSE = { stand: 'idle', phone: 'phone', talk: 'talk', sit: 'sit', watch: 'look', guard: 'look', aim: 'crouch', cower: 'crouch' };
const pick = (R, a) => a[R() * a.length | 0];

// closest approach of segment p→q to segment a→b: [distance squared, how far along p→q]
export function segSeg(p, q, a, b) {
  const d1x = q.x - p.x, d1y = q.y - p.y, d1z = q.z - p.z, d2x = b.x - a.x, d2y = b.y - a.y, d2z = b.z - a.z, rx = p.x - a.x, ry = p.y - a.y, rz = p.z - a.z;
  const A2 = d1x * d1x + d1y * d1y + d1z * d1z, E = d2x * d2x + d2y * d2y + d2z * d2z, F = d2x * rx + d2y * ry + d2z * rz, C = d1x * rx + d1y * ry + d1z * rz, B = d1x * d2x + d1y * d2y + d1z * d2z, den = A2 * E - B * B;
  let s = den > 1e-9 ? Math.min(1, Math.max(0, (B * F - C * E) / den)) : 0, t = E > 1e-9 ? (B * s + F) / E : 0;
  if (t < 0) { t = 0; s = Math.min(1, Math.max(0, -C / A2)); } else if (t > 1) { t = 1; s = Math.min(1, Math.max(0, (B - C) / A2)); }
  const x = rx + d1x * s - d2x * t, y = ry + d1y * s - d2y * t, z = rz + d1z * s - d2z * t; return [x * x + y * y + z * z, s];
}

// one person: a copy of an avatar with its own bones, its motions ready, what it carries held at the hand
export function makeFigure(o, R) {
  const name = o.av || (o.female ? pick(R, WOMEN) : o.suit || o.tie ? pick(R, SUITS) : pick(R, MEN)), src = A.p[name], sex = /Female/.test(name) ? 'f' : 'm';
  const g = new THREE.Group(), inner = new THREE.Group(), body = SkeletonUtils.clone(src.scene); body.scale.multiplyScalar(src.fit * (o.scale || 0.97 + R() * 0.06)); inner.add(body); g.add(inner);
  body.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
  const bone = (n) => body.getObjectByName(n), mixer = new THREE.AnimationMixer(body), acts = {}; for (const k in A.clip[sex]) acts[k] = mixer.clipAction(A.clip[sex][k]);
  let prop = null;
  if (o.case) { prop = new THREE.Group(); const c = A.m.vintage_suitcase.clone(true); c.traverse((q) => { if (/suitcase_02/.test(q.name)) q.visible = false; if (q.isMesh) q.castShadow = true; }); c.position.set(-0.458 * 0.8, -0.44, 0); c.scale.setScalar(0.8); c.rotation.y = 0; prop.add(c); prop.rotation.y = Math.PI / 2; }
  if (o.gun) { prop = new THREE.Group(); const r = A.m.ksr29.clone(true); r.scale.setScalar(0.11); r.rotation.set(0, Math.PI / 2, 0); r.position.set(0, 0.05, -0.25); r.traverse((q) => { if (q.isMesh) q.castShadow = true; }); prop.add(r); prop.rotation.x = -0.5; }
  if (prop) g.add(prop);
  const blob = new THREE.Mesh(BLOB, BLOBM); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03; blob.renderOrder = 2; g.add(blob);
  return { g, inner, body, mixer, acts, prop, blob, hand: bone('Bip01_R_Hand'), headB: bone('Bip01_Head'), neckB: bone('Bip01_Neck'), pelvisB: bone('Bip01_Pelvis'), av: name };
}
const BLOB = new THREE.CircleGeometry(0.42, 16), BLOBM = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.38, depthWrite: false });

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
export class Crowd {
  constructor(game) { this.g = game; this.list = []; this.group = new THREE.Group(); game.scene.add(this.group); }
  clear() { for (const p of this.list) p.mixer.stopAllAction(); this.group.clear(); this.list = []; }
  // tasks: {to:[x,z], speed, run} · {wait:seconds, pose} · {call:fn} ; loop repeats them
  add(o, R) {
    const f = makeFigure(o, R), p = { ...f, o, name: o.name || '', role: o.role || 'civ', pos: new THREE.Vector3(o.at[0], o.y || 0, o.at[1]), yaw: o.yaw || 0, tasks: o.tasks || [], ti: 0, tt: 0, loop: o.loop !== false, pose: o.pose || 'stand',
      alive: true, gone: false, snap: true, fall: 0, fallDir: 1, speed: 0, alert: false, cur: null, head: new THREE.Vector3(), neck: new THREE.Vector3(), pelvis: new THREE.Vector3() };
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
  play(p, name, fade) { const a = p.acts[name] || p.acts.idle; if (p.cur === a) return a; a.reset().play(); if (p.cur) p.cur.crossFadeTo(a, fade, false); p.cur = a; return a; }
  bones(p) { p.g.updateMatrixWorld(true); p.headB.getWorldPosition(p.head); p.head.y += 0.07; p.neckB.getWorldPosition(p.neck); p.pelvisB.getWorldPosition(p.pelvis); }
  update(dt) {
    for (const p of this.list) {
      if (p.gone) continue;
      if (!p.alive) { if (p.fall < 1) { p.fall = Math.min(1, p.fall + dt * 2.2); const e = p.fall * p.fall; p.inner.rotation.x = p.fallDir * e * 1.5; p.inner.position.y = 0.12 * e; p.mixer.update(dt * (1 - e)); p.blob.visible = false; if (p.prop) { p.prop.position.y = Math.max(0.1, p.prop.position.y - dt * 3); } } continue; }
      const t = p.tasks[p.ti]; let moving = false, run = false, pose = p.pose, sp = 0;
      if (t) {
        if (t.to) { const dx = t.to[0] - p.pos.x, dz = t.to[1] - p.pos.z, d = Math.hypot(dx, dz); sp = t.speed || (t.run ? 4.6 : 1.35); run = !!t.run;
          if (d < sp * dt + 0.02) { p.pos.x = t.to[0]; p.pos.z = t.to[1]; p.ti++; p.tt = 0; } else { p.pos.x += dx / d * sp * dt; p.pos.z += dz / d * sp * dt; const want = Math.atan2(dx, dz); let dy = want - p.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.yaw += dy * Math.min(1, dt * 8); moving = true; p.speed = sp; }
        } else if (t.wait !== undefined) { p.tt += dt; pose = t.pose || 'stand'; if (t.yaw !== undefined) { let dy = t.yaw - p.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.yaw += dy * Math.min(1, dt * 5); } if (p.tt >= t.wait) { p.ti++; p.tt = 0; } }
        else if (t.call) { p.ti++; t.call(p); }
        if (p.ti >= p.tasks.length && p.loop && p.tasks.length) p.ti = 0;
      }
      p.moving = moving; p.curPose = moving ? 'walk' : pose; this.place(p);
      const a = this.play(p, moving ? (run ? 'run' : 'walk') : POSE[pose] || 'idle', p.snap ? 0 : 0.3); a.timeScale = moving ? sp / (run ? 3.9 : 1.3) : 1; p.mixer.update(p.snap ? Math.random() * 3 : dt); p.snap = false; this.bones(p);
      if (p.prop) { p.g.worldToLocal(_a.copy(p.hand.getWorldPosition(_b))); if (p.o.gun) p.prop.position.copy(_a); else p.prop.position.set(_a.x, _a.y - 0.06, _a.z); }
    }
  }
  // the first living person the segment a→b passes through: {p, zone, s}
  hit(a, b) {
    let best = null;
    for (const p of this.list) {
      if (!p.alive || p.gone) continue; const x = p.pos.x, z = p.pos.z;
      if (x < Math.min(a.x, b.x) - 1 || x > Math.max(a.x, b.x) + 1 || z < Math.min(a.z, b.z) - 1 || z > Math.max(a.z, b.z) + 1) continue;
      const test = (u, v, r, zone) => { const [d2, s] = segSeg(a, b, u, v); if (d2 < r * r && (!best || s < best.s)) best = { p, zone, s }; };
      test(p.head, _a.copy(p.head).setY(p.head.y + 0.01), 0.115, 'head'); test(p.pelvis, p.neck, 0.18, 'body'); test(_c.set(p.pelvis.x, p.pos.y + 0.1, p.pelvis.z), _a.copy(p.pelvis).setY(p.pelvis.y - 0.1), 0.15, 'legs');
    }
    return best;
  }
  kill(p, dir) { p.alive = false; p.fall = 0; const f = Math.sin(p.yaw) * dir.x + Math.cos(p.yaw) * dir.z; p.fallDir = f > 0 ? 1 : -1; p.tasks = []; }
  head(p, out) { return out.copy(p.head); }
  chest(p, out) { return out.copy(p.pelvis).lerp(p.neck, 0.7); }
}
