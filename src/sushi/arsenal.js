// THE REST OF WHAT A VILLAGE HAD, late Edo: tanto, wakizashi and naginata; shuriken (stars and spikes) and kunai thrown from the hand, spinning, sticking in wood and bodies and taken up again; a kusarigama's weight swung on its chain; a yumi and its arrows, set alight at a lantern or the brazier; a tanegashima matchlock (slow, loud, one shot, then a real reload, and every one of them hears it); a brazier and wet straw for smoke to hide in; the fire-watch tower's bell, rung from the cart by its rope, to draw them away; a paper lantern to throw for fire. Nothing here flickers: fire and the match glow steadily
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { G, V3, Q, mat, clamp, rand } from './ctx.js';
import { Prop } from './items.js';
import { PH } from './physics.js';
import * as T from './tex.js';
import { Weapon, W, BUILD, ARMS, mats, M, rod, flat, segSeg } from './weapons.js';

const _a = new V3(), _b = new V3(), _c = new V3(), _q = new Q(), _m = new THREE.Matrix4(), _n = new THREE.Matrix4();
let GLOW = null; const glow = (color, s, op = 0.85) => { GLOW ||= T.glowTex(); const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); g.scale.set(s, s, 1); g.userData.nopick = true; return g; };
const placed = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const iron = () => mats().iron || (mats().iron = mat({ color: 0x4a4c50, map: T.steelTex() }));
const blade = (len, w, sori, g, z0 = 0.05) => { const P = [], n = 10; for (let i = 0; i <= n; i++) { const t = i / n, x = z0 + t * len, bow = sori * Math.sin(t * Math.PI * 0.9); P.push([x, 0.004 + bow]); } P.push([z0 + len + 0.012, 0.004 + sori * 0.3 - w * 0.4]); for (let i = n; i >= 0; i--) { const t = i / n, x = z0 + t * len, bow = sori * Math.sin(t * Math.PI * 0.9); P.push([x, -w * (1 - t * 0.25) + bow]); } return M(flat(P, 0.005), mats().steel, g); };
const hilt = (g, len, r = 0.014) => { const m = mats(); rod(r, r * 1.05, len, m.cord || (m.cord = mat({ color: 0x1c1a26 })), g, len); M(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 16).rotateX(Math.PI / 2), iron(), g, 0, 0, -0.01); M(new THREE.CylinderGeometry(r * 1.05, r * 1.05, 0.03, 10).rotateX(Math.PI / 2), m.brass, g, 0, 0, -0.035); };
Object.assign(BUILD, {
  tanto(g) { hilt(g, 0.11, 0.012); blade(0.26, 0.026, 0.004, g, 0.05); },
  wakizashi(g) { hilt(g, 0.16, 0.013); blade(0.5, 0.028, 0.012, g, 0.05); },
  naginata(g) { const m = mats(); rod(0.017, 0.016, 1.62, m.lacquer, g, 0.75); M(new THREE.CylinderGeometry(0.019, 0.019, 0.04, 10).rotateX(Math.PI / 2), iron(), g, 0, 0, 0.75); M(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 14).rotateX(Math.PI / 2), iron(), g, 0, 0, -0.88); blade(0.58, 0.04, 0.03, g, 0.9); },
  kunai(g) { const m = mats(); rod(0.009, 0.009, 0.1, m.cord || (m.cord = mat({ color: 0x1c1a26 })), g, 0.05); M(new THREE.TorusGeometry(0.018, 0.004, 6, 14), iron(), g, 0, 0, 0.068); M(new THREE.LatheGeometry([[0, 0], [0.02, 0.05], [0.014, 0.12], [0, 0.155]].map(([x, y]) => new THREE.Vector2(x, y)), 4).rotateX(-Math.PI / 2).scale(1, 0.18, 1), iron(), g, 0, 0, -0.05); },
  shuriken(g) { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = i % 2 ? 0.014 : 0.052; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); const h = new THREE.Path(); h.absarc(0, 0, 0.006, 0, Math.PI * 2, true); s.holes.push(h);
    M(new THREE.ExtrudeGeometry(s, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0012, bevelSegments: 1 }).rotateX(Math.PI / 2).translate(0, 0.0015, 0), iron(), g); },
  boshuriken(g) { M(new THREE.CylinderGeometry(0.0035, 0.0045, 0.16, 6).rotateX(-Math.PI / 2), iron(), g, 0, 0, 0); M(new THREE.ConeGeometry(0.0045, 0.03, 6).rotateX(-Math.PI / 2), iron(), g, 0, 0, -0.095); },
  kusarigama(g) { BUILD.kama(g); },
  ya(g) { const m = mats(); rod(0.004, 0.004, 0.85, m.bamboo, g, 0.1); M(new THREE.ConeGeometry(0.007, 0.05, 4).rotateX(-Math.PI / 2), iron(), g, 0, 0, -0.775); const fm = m.feather || (m.feather = mat({ color: 0xd8d0c0, side: THREE.DoubleSide })); for (let i = 0; i < 3; i++) { const f = M(new THREE.PlaneGeometry(0.014, 0.1), fm, g, 0, 0, 0.04); f.rotation.set(Math.PI / 2, 0, (i * Math.PI * 2) / 3); f.position.set(Math.cos(i * 2.09) * 0.008, Math.sin(i * 2.09) * 0.008, 0.04); } },
  // the yumi: long, held a third of the way up, its two limbs drawn back in a long curve; lacquered black with cane bindings
  yumi(g) { const m = mats(), C = new THREE.CatmullRomCurve3([[0, -0.75, 0.02], [0, -0.45, -0.03], [0, -0.05, -0.055], [0, 0.0, -0.055], [0, 0.4, -0.05], [0, 0.9, -0.02], [0, 1.25, 0.03], [0, 1.45, 0.07]].map((p) => new V3(...p))); M(new THREE.TubeGeometry(C, 40, 0.011, 6), m.lacquer, g); M(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), m.cord || (m.cord = mat({ color: 0x1c1a26 })), g, 0, 0.02, -0.055);
    const s = new THREE.BufferGeometry().setFromPoints([new V3(0, -0.74, 0.03), new V3(0, 0.35, 0.03), new V3(0, 1.44, 0.075)]), str = new THREE.Line(s, new THREE.LineBasicMaterial({ color: 0xd8d0b8 })); str.userData.nopick = true; g.add(str); g.userData.string = str; },
  // the tanegashima: an octagonal iron barrel on a long stock, the brass pan and the serpentine holding its slow match, its tip a steady ember
  teppo(g) { const m = mats(); M(new THREE.CylinderGeometry(0.014, 0.017, 1.0, 8).rotateX(Math.PI / 2), iron(), g, 0, 0.02, -0.45); M(new THREE.BoxGeometry(0.04, 0.05, 0.62).translate(0, -0.005, -0.15), m.dark, g); M(new THREE.BoxGeometry(0.036, 0.09, 0.2).translate(0, -0.03, 0.22), m.dark, g);
    M(new THREE.BoxGeometry(0.03, 0.008, 0.03), m.brass, g, 0.024, 0.03, 0.02); const sp = M(new THREE.TorusGeometry(0.025, 0.004, 5, 10, Math.PI), m.brass, g, 0.024, 0.055, 0.04); sp.rotation.y = Math.PI / 2; const e = glow(0xff7a30, 0.03, 0.9); e.position.set(0.024, 0.08, 0.02); g.add(e); g.userData.ember = e; for (const z of [-0.6, -0.3]) M(new THREE.TorusGeometry(0.02, 0.003, 4, 10), m.brass, g, 0, 0.0, z); },
});

// ---------- things thrown or shot: they fly, the light ones spin, and stick where they strike (a beam, a crate, the ground, a limb); then they can be taken up again
const fly = [];
const KE = (w, sp) => 0.5 * w.def.kg * sp * sp;
export class Thrown extends Weapon {
  drop(v, ang) { if (!v || v.length() < 3) { this.stuck = null; return super.drop(v, ang); } this.free = false; PH.drop(this); this.stuck = null; this.v = v.clone(); this.spin = this.def.star ? 28 : 0; this.age = 0; fly.push(this); if (this.def.star) this.obj.quaternion.setFromUnitVectors(_a.set(0, 1, 0), _b.set(rand(-0.15, 0.15), 1, rand(-0.15, 0.15)).normalize()); }
  onGrab(h) { super.onGrab(h); this.stuck = null; const i = fly.indexOf(this); if (i >= 0) fly.splice(i, 1); }
  // on a screen: hold to draw back, let go to throw where you look, the harder the longer held
  desk(dt, h) { const k = this.dk; if (G.desk.keys.KeyQ) { this.wantDrop = true; return; }
    if (k.mode === 'rest' && h.gripDown) { k.mode = 'wind'; k.t = 0; } k.t += dt;
    const cam = G.camera; cam.updateMatrixWorld(); cam.getWorldQuaternion(_q);
    const back = k.mode === 'wind' ? Math.min(1, k.t / 0.4) : 0; this.obj.position.set(0.2, -0.22 + back * 0.12, -0.32 + back * 0.15).applyMatrix4(cam.matrixWorld); this.obj.quaternion.copy(_q);
    if (k.mode === 'wind' && !h.grip) { const pow = clamp(k.t / 0.5, 0.4, 1), v = _a.set(0, 0.04, -1).applyQuaternion(_q).normalize().multiplyScalar((this.def.arrow ? 40 : this.def.star ? 14 : 12) * pow); k.mode = 'rest'; h.held = null; this.held = null; this.onRelease(); this.drop(v.clone()); G.audio?.play('grab', this); } }
}
const stick = (w, at, bone) => { const i = fly.indexOf(w); if (i >= 0) fly.splice(i, 1); w.v = null; w.free = false; w.obj.position.copy(at); if (bone) { bone.updateMatrixWorld(); w.obj.updateMatrix(); w.stuck = { bone, m: _n.copy(bone.matrixWorld).invert().multiply(w.obj.matrix).clone() }; } else if (PH.ready) PH.rest(w); w.stuckT = G.t; };
const flyUpd = (dt) => {
  for (let i = fly.length - 1; i >= 0; i--) { const w = fly[i]; if (w.held || w.dead) { fly.splice(i, 1); continue; }
    w.age += dt; const p0 = _a.copy(w.obj.position), v = w.v; v.y -= 9.81 * dt; const p1 = _b.copy(p0).addScaledVector(v, dt), sp = v.length();
    if (w.def.star) w.obj.rotateY(w.spin * dt); else w.obj.quaternion.setFromUnitVectors(_c.set(0, 0, -1), _c.copy(v).normalize());
    // a limb on its way: it goes in
    let hit = null; const recs = G.react?.limbs?.recs; if (recs) for (const r of recs.values()) { for (const s of r.segs) { const [d, u] = segSeg(p0, p1, s.A, s.B); if (d < s.r + 0.01 && (!hit || u < hit.u)) hit = { r, s, u }; } }
    if (hit) { const at = p0.clone().lerp(p1, hit.u), b = hit.r.x, seg = hit.s.mid ? (at.y > 1.45 ? 'head' : 'torso') : hit.s.name, e = KE(w, sp), dmg = e * (w.def.arrow ? 2.2 : 2) * (w.def.pierce || 0.5), dir = v.clone().normalize();
      W.log.push({ t: +G.t.toFixed(2), w: w.wk, seg, sp: +sp.toFixed(1), thrown: true, dmg: Math.round(dmg) }); W.thrownHits = (W.thrownHits || 0) + 1;
      if (b.z) G.infected?.cut(b.z, { seg, at, dir, sp, J: w.def.kg * sp, cut: 0.6, crush: 0, pierce: 1, dmg, sever: null, w }); else if (G.react?.blow) G.react.blow(b, 'cut', seg === 'head' ? 'head' : 'body', dir, at, Math.min(4, w.def.kg * sp), w, true, seg);
      if (w.fire) { if (b.z) b.z.burn = 9; w.fire = false; } const bn = b.p.bones?.find((x) => x.name === seg) || b.p.bones?.[0]; stick(w, at.addScaledVector(dir, 0.02), bn); G.audio?.play('chop', at); continue; }
    // a surface (the counter, a shelf), a crate or the ground: it sticks if it came point or edge first and fast, else it falls
    let land = null; for (const s of G.surfaces) if (p0.y >= s.y && p1.y <= s.y && p1.x > s.minX && p1.x < s.maxX && p1.z > s.minZ && p1.z < s.maxZ) land = s.y;
    for (const it of G.items) if (it.bar !== undefined && !it.dead && !it.free) { const c = it.worldCenter(_c); if (p1.distanceTo(c) < (it.radius || 0.3) * 0.9) land = p1.y; }
    if (land === null && p1.y <= 0.005) land = 0;
    if (land !== null) { const at = p1.clone(); at.y = Math.max(at.y, land); if (sp > 6) { stick(w, at, null); G.audio?.play('chop', at); if (w.fire) G.arsenal?.fire(at, 0.5); W.stuckN = (W.stuckN || 0) + 1; } else { w.obj.position.copy(at).setY(at.y + 0.01); w.fly = false; fly.splice(i, 1); Weapon.prototype.drop.call(w, v.clone().multiplyScalar(0.3)); } continue; }
    w.obj.position.copy(p1); if (w.age > 5) { fly.splice(i, 1); Weapon.prototype.drop.call(w, v.clone().multiplyScalar(0.2)); } }
  for (const w of W.list) if (w.stuck && w.stuck.bone && !w.held) { _m.multiplyMatrices(w.stuck.bone.matrixWorld, w.stuck.m); _m.decompose(w.obj.position, w.obj.quaternion, _c); }
};

// ---------- the yumi: the other hand on the string draws it (in the headset), or hold to draw (on a screen); let go and the arrow flies along the bow
export class Bow extends Weapon {
  constructor() { super('yumi'); this.arrows = 12; this.draw = 0; }
  shape() { return [RAPIER.ColliderDesc.cuboid(0.015, 1.05, 0.03).setTranslation(0, 0.35, -0.03), 0.5]; }
  loose(pow) { if (this.arrows <= 0 || pow < 0.15) return null; this.arrows--; const a = new Thrown('ya'); W.list.push(a); const dir = _a.set(0, 0, -1).applyQuaternion(this.obj.quaternion); a.obj.position.copy(this.obj.position).addScaledVector(dir, 0.1); a.fire = this.lit; this.lit = false; if (a.fire) a.obj.add(placed(glow(0xff8a30, 0.12, 0.9), 0, 0, -0.78));
    a.drop(dir.clone().multiplyScalar(14 + 46 * pow)); G.audio?.play('set', this); W.shots = (W.shots || 0) + 1; return a; }
  desk(dt, h) { const k = this.dk; if (G.desk.keys.KeyQ) { this.wantDrop = true; return; } if (k.mode === 'rest' && h.gripDown) { k.mode = 'wind'; k.t = 0; } k.t += dt; const cam = G.camera; cam.updateMatrixWorld(); cam.getWorldQuaternion(_q);
    this.draw = k.mode === 'wind' ? Math.min(1, k.t / 0.9) : 0; this.obj.position.set(0.0, -0.18, -0.45).applyMatrix4(cam.matrixWorld); this.obj.quaternion.copy(_q).multiply(new Q().setFromAxisAngle(_b.set(0, 0, 1), -0.25));
    if (k.mode === 'wind' && !h.grip) { k.mode = 'rest'; this.loose(this.draw); this.draw = 0; } this.bend(); }
  bend() { const L = this.obj.userData.string; if (!L) return; const P = L.geometry.attributes.position; P.setZ(1, 0.03 + this.draw * 0.62); P.needsUpdate = true; }
  onUnsupp(h) { if (this.draw > 0.1) this.loose(this.draw); this.draw = 0; this.bend(); }
  update(dt) { super.update(dt); if (this.supp && this.supp.grip && this.held) { _a.copy(this.supp.pos); this.obj.worldToLocal(_a); this.draw = clamp(_a.z / 0.62, 0, 1); this.bend(); } if (this.held && G.arsenal?.nearFire(this.obj.position)) this.lit = true; }
  hint() { return `${this.def.name} — ${this.arrows} arrows${this.lit ? ', the next one alight' : ''}`; }
}
Object.assign(Bow.prototype, { onHeld(dt, h) { if (!h.xr) this.desk(dt, h); this.live = false; } });

// ---------- the tanegashima: the trigger lets the match down; a moment, then the shot. Then it is empty: powder, ball, ram, prime (R on a screen; in the headset, muzzle up and the other hand at the muzzle)
const STEPS = ['powder poured', 'ball dropped in', 'rammed home', 'pan primed'];
export class Gun extends Weapon {
  constructor() { super('teppo'); this.loaded = true; this.step = 0; this.stepT = 0; this.fireT = 0; this.shots = 0; this.clicks = 0; }
  pull() { if (this.fireT > 0) return; if (!this.loaded) { this.clicks++; G.audio?.play('set', this); return false; } this.fireT = 0.16; return true; }
  bang() { this.loaded = false; this.step = 0; this.shots++; const mz = _a.set(0, 0.02, -0.97).applyMatrix4(this.obj.matrixWorld).clone(), dir = _b.set(0, 0, -1).applyQuaternion(this.obj.quaternion).normalize().clone(), A = G.audio;
    if (A && A.ready) { A.shot('crash', mz, 1, 0.5); A.burst(90, 0.6, { vol: 0.9, type: 'lowpass' }); A.burst(1800, 0.25, { vol: 0.5 }); } G.outbreak?.noise?.(mz, 2.2); for (let i = 0; i < 4; i++) G.outbreak?.noise?.(mz.clone().add(_c.set(rand(-6, 6), 0, rand(-6, 6))), 1.6);
    G.arsenal?.puff(mz, dir); if (this.held) this.held.pulse?.(1, 140);
    // the ball: the first limb along the barrel's line
    let best = null; const recs = G.react?.limbs?.recs, far = mz.clone().addScaledVector(dir, 40); if (recs) for (const r of recs.values()) for (const s of r.segs) { const [d, u] = segSeg(mz, far, s.A, s.B); if (d < s.r + 0.01 && (!best || u < best.u)) best = { r, s, u }; }
    W.log.push({ t: +G.t.toFixed(2), w: 'teppo', shot: true, hit: best ? best.s.name : null });
    if (best) { const at = mz.clone().lerp(far, best.u), b = best.r.x, seg = best.s.mid ? (at.y > 1.45 ? 'head' : 'torso') : best.s.name, sev = /^(forearm|hand)/.test(seg) ? seg : null;
      if (b.z) G.infected?.cut(b.z, { seg, at, dir, sp: 300, J: 9, cut: 0, crush: 1, pierce: 1, dmg: 260, sever: sev, w: this }); else G.react?.blow?.(b, 'thing', seg === 'head' ? 'head' : 'body', dir, at, 8, this, true, seg); G.gore?.spray(at, dir, 1.6); } }
  reloadStep() { if (this.loaded || this.stepT > 0) return; this.stepT = 1.6; G.audio?.play('set', this); }
  desk(dt, h) { const k = this.dk; if (G.desk.keys.KeyQ) { this.wantDrop = true; return; } const cam = G.camera; cam.updateMatrixWorld(); cam.getWorldQuaternion(_q);
    const r = this.stepT > 0 ? 0.9 : 0; this.obj.position.set(0.12, -0.2 - r * 0.1, -0.3 + r * 0.1).applyMatrix4(cam.matrixWorld); this.obj.quaternion.copy(_q).multiply(new Q().setFromAxisAngle(_b.set(1, 0, 0), r));
    if (h.gripDown) this.pull(); if (G.desk.keys.KeyR) this.reloadStep(); }
  onHeld(dt, h) { if (this.drive) { this.drive(this, dt); return; } if (!h.xr) this.desk(dt, h); else { if (h.useDown) this.pull(); const up = _a.set(0, 0, -1).applyQuaternion(this.obj.quaternion).y > 0.75, mz = _b.set(0, 0, -0.97).applyMatrix4(this.obj.matrixWorld); if (up && this.supp && this.supp.pos.distanceTo(mz) < 0.12) this.reloadStep(); } this.live = false; }
  update(dt) { super.update(dt); if (this.fireT > 0 && (this.fireT -= dt) <= 0) this.bang(); if (this.stepT > 0 && (this.stepT -= dt) <= 0) { this.step++; if (this.step >= STEPS.length) { this.loaded = true; this.step = 0; } } }
  hint() { return `${this.def.name} — ${this.loaded ? 'loaded: click to fire' : this.stepT > 0 ? STEPS[this.step] + '…' : `empty: R to reload (${STEPS[this.step]})`}`; }
}

// ---------- the kusarigama: a chain from the sickle's butt to an iron weight; swung, the weight strikes as hard as it goes
export class Kusari extends Weapon {
  constructor() { super('kusarigama'); const n = 10; this.ch = Array.from({ length: n }, () => ({ p: new V3(), o: new V3() })); this.len = 0.12; this.wt = M(new THREE.SphereGeometry(0.028, 10, 8), iron(), G.itemRoot); this.links = new THREE.InstancedMesh(new THREE.TorusGeometry(0.008, 0.0022, 4, 8), iron(), n); this.links.frustumCulled = false; this.links.userData.nopick = true; this.wt.userData.nopick = true; G.itemRoot.add(this.links); this.whit = new Map(); this.init = false; }
  update(dt) { super.update(dt); const C = this.ch, base = _a.set(0, 0, 0.09).applyMatrix4(this.obj.matrixWorld); if (!this.init) { this.init = true; C.forEach((c, i) => { c.p.copy(base).add(_b.set(0, -i * this.len, 0)); c.o.copy(c.p); }); }
    const h = Math.min(dt, 1 / 30); for (let i = 0; i < C.length; i++) { const c = C[i], v = _b.copy(c.p).sub(c.o).multiplyScalar(0.99); c.o.copy(c.p); c.p.add(v); c.p.y -= 9.81 * h * h; if (c.p.y < 0.03) c.p.y = 0.03; }
    for (let k = 0; k < 4; k++) { C[0].p.copy(base); for (let i = 1; i < C.length; i++) { const a = C[i - 1].p, b = C[i].p, d = _b.copy(b).sub(a), l = d.length() || 1e-6, e = (l - this.len) / l; if (i === 1) b.addScaledVector(d, -e); else { a.addScaledVector(d, e * 0.5); b.addScaledVector(d, -e * 0.5); } } }
    for (let i = 0; i < C.length; i++) { _m.compose(C[i].p, _q.setFromUnitVectors(_c.set(0, 1, 0), _b.copy(C[i].p).sub(C[Math.max(0, i - 1)].p).normalize()), _c.set(1, 1, 1)); this.links.setMatrixAt(i, _m); } this.links.instanceMatrix.needsUpdate = true;
    const end = C[C.length - 1]; this.wt.position.copy(end.p); const v = _b.copy(end.p).sub(end.o).divideScalar(h), sp = v.length(); const recs = G.react?.limbs?.recs;
    if (sp > 4 && recs) for (const r of recs.values()) { if ((this.whit.get(r.p) || 0) > G.t) continue; for (const s of r.segs) { const [d] = segSeg(end.p, end.o, s.A, s.B); if (d < s.r + 0.03) { this.whit.set(r.p, G.t + 0.4); const seg = s.mid ? 'torso' : s.name, J = 0.9 * sp, dir = v.clone().normalize(); if (r.x.z) G.infected?.cut(r.x.z, { seg, at: end.p.clone(), dir, sp, J, cut: 0, crush: 1, pierce: 0, dmg: J * 3.2, sever: null, w: this }); G.audio?.play('set', end.p); W.log.push({ t: +G.t.toFixed(2), w: 'kusari-weight', seg, sp: +sp.toFixed(1) }); break; } } } }
  onRemove() { this.wt.removeFromParent(); this.links.removeFromParent(); }
}

// ---------- a paper lantern (chouchin) on its bamboo ribs, its candle a steady light: carried, it lights an arrow; thrown hard, it breaks and its oil burns
export class Lantern extends Prop {
  constructor() { const g = new THREE.Group(), paper = mat({ map: T.canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#e8d6b0'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,80,40,0.5)'; x.lineWidth = 2; for (let y = 6; y < h; y += 10) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } x.fillStyle = '#7a1a12'; x.font = 'bold 34px serif'; x.textAlign = 'center'; x.fillText('祭', w / 2, h / 2 + 12); }), emissive: 0x6a3a10, color: 0xffffff });
    const body = new THREE.Mesh(new THREE.LatheGeometry([[0.045, 0], [0.085, 0.04], [0.1, 0.12], [0.085, 0.2], [0.045, 0.24]].map(([x, y]) => new THREE.Vector2(x, y)), 16).translate(0, 0.02, 0), paper); const rim = mat({ color: 0x1a1210 }); g.add(body);
    for (const y of [0.02, 0.26]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 14), rim); r.position.y = y; g.add(r); } const hd = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.004, 4, 12, Math.PI), rim); hd.position.y = 0.27; g.add(hd); g.add(placed(glow(0xffb060, 0.5, 0.35), 0, 0.14, 0));
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); super(g, { name: 'paper lantern', col: { t: 'cyl', hh: 0.14, r: 0.1 }, mass: 0.45, radius: 0.12, mat: 'paper' }); this.lantern = true; this.pick = true; }
  onImpact(sp) { if (sp > 2.4) { G.arsenal?.fire(this.obj.position.clone().setY(0), 0.75, 30); G.audio?.play('crash', this.obj.position); this.remove(); return true; } return false; }
}

// ---------- fire (a thrown lantern's oil, a fire arrow, straw): a steady glow that burns what stands in it and catches straw near it; smoke from the brazier: they lose you in it
export function buildArsenal(scene) {
  const A = { fires: [], smoke: 0, rings: 0 }; G.arsenal = A; const lt = new THREE.PointLight(0xff8a3a, 0, 9, 1.6); scene.add(lt);
  A.fire = (at, r = 0.6, life = 30) => { if (A.fires.length > 5) return; const g = new THREE.Group(); g.position.copy(at).setY(Math.max(0, at.y)); for (let i = 0; i < 4; i++) { const s = glow(i ? 0xff6a20 : 0xffc060, r * (i ? 0.9 : 1.3), 0.7); s.position.set(rand(-r, r) * 0.4, 0.15 + i * 0.12, rand(-r, r) * 0.4); g.add(s); } scene.add(g); A.fires.push({ g, r, life, at: g.position }); G.outbreak?.noise?.(at, 0.6); G.outbreak?.note?.('a fire caught'); };
  A.nearFire = (p) => A.fires.some((f) => f.at.distanceTo(p) < f.r + 0.4) || (A.brazier && A.brazier.position.distanceTo(p) < 0.45) || G.items.some((it) => it.lantern && !it.dead && it.obj.position.distanceTo(p) < 0.35);
  const puffs = []; A.puff = (at, dir) => { for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.wispTex(), color: 0xd8d4cc, transparent: true, opacity: 0.5, depthWrite: false })); s.position.copy(at).addScaledVector(dir, 0.1 + i * 0.12); s.scale.setScalar(0.15); s.userData.nopick = true; scene.add(s); puffs.push({ s, life: 4 + i * 0.3 }); } };
  // the brazier at the cart's back corner, its embers; wet straw dropped on it smokes for a good while
  const br = new THREE.Group(); br.position.set(-0.95, 0, 2.1); scene.add(br); A.brazier = br; { const m = mat({ color: 0x3a3430, map: T.steelTex() }); const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.16, 16, 1, true), m); bowl.position.y = 0.5; const bot = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16).rotateX(-Math.PI / 2), m); bot.position.y = 0.42; br.add(bowl, bot); for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.44, 6), m); l.position.set(Math.cos(i * 2.09) * 0.15, 0.22, Math.sin(i * 2.09) * 0.15); br.add(l); }
    const coal = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x7a1e08 })); coal.position.y = 0.52; br.add(coal, placed(glow(0xff5a18, 0.6, 0.55), 0, 0.6, 0)); br.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.nopick = true; } }); }
  G.targets.push({ getPos: () => br.position.clone().setY(0.55), r: 0.28, prio: 2, accepts: (it) => it.straw, receive: (it) => { it.remove(); A.smoke = 45; G.outbreak?.note?.('wet straw on the brazier: thick smoke round the cart'); G.audio?.play('ignite', br.position); } });
  const smoke = []; for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.wispTex(), color: 0xb8b4ac, transparent: true, opacity: 0, depthWrite: false })); s.userData = { nopick: true, a: rand(6), r: rand(0.3, 2.2), y: rand(0.3, 2.4) }; s.visible = false; scene.add(s); smoke.push(s); }
  // straw: a bundle soaked in the water barrel, by the brazier
  A.straw = () => { const g = new THREE.Group(), m = T.surface(mat({ map: T.photo('wood_light'), color: 0xb89a50 }), { bomb: 0 }); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.42, 10).rotateZ(Math.PI / 2).translate(0, 0.09, 0), m); c.castShadow = true; g.add(c); g.position.set(-0.45, 0.92, 1.66); const it = new Prop(g, { name: 'wet straw (for the brazier)', col: { t: 'box', hx: 0.21, hy: 0.09, hz: 0.09 }, mass: 2.5, radius: 0.15, mat: 'soft' }); it.pick = true; it.straw = true; if (PH.ready) PH.rest(it); return it; };
  // the fire-watch tower down the street and its bell; its rope runs to the cart
  const tw = new THREE.Group(); tw.position.set(-15, 0, -4.7); scene.add(tw); { const m = T.surface(mat({ map: T.photo('wood_dark'), color: 0x8a7a6a }), { bomb: 0 }); for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7, 0.12), m); p.position.set(x * (1 - 0.0), 3.5, z); p.castShadow = true; tw.add(p); }
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), m); deck.position.y = 6.2; const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.6, 4), mat({ color: 0x2a2a2e })); roof.position.y = 7.4; roof.rotation.y = Math.PI / 4; const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.4, 14), mat({ color: 0x5a4a2a, map: T.steelTex() })); bell.position.y = 6.75; tw.add(deck, roof, bell); for (let y = 0.4; y < 6.2; y += 0.4) { const r = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), m); r.position.set(0, y, 0.62); tw.add(r); } tw.traverse((o) => { if (o.isMesh) o.userData.nopick = true; }); }
  { const knot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), mat({ color: 0x8a2a1a })); knot.position.set(-0.98, 1.55, 1.75); scene.add(knot); const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 5), mat({ color: 0xc8b890 })); cord.position.set(-0.98, 1.82, 1.75); scene.add(cord);
    const btn = { name: 'the fire-watch bell\'s rope', r: 0.05, getPos: () => knot.position, press: () => { A.rings++; const at = tw.position.clone().setY(6.7); G.outbreak?.sound?.('alarm', at); for (let i = 0; i < 4; i++) G.outbreak?.noise?.(at, 2.5); G.outbreak?.note?.(A.rings === 1 ? 'you rang the fire-watch bell to draw them off' : null); } }; knot.userData.button = btn; cord.userData.button = btn; G.buttons.push(btn); }
  A.tower = tw;
  A.update = (dt) => {
    flyUpd(dt); let li = 0;
    for (let i = A.fires.length - 1; i >= 0; i--) { const f = A.fires[i]; f.life -= dt; const k = Math.min(1, f.life / 5); f.g.children.forEach((s, j) => { s.material.opacity = 0.7 * k; s.position.y += dt * 0.02 * Math.sin(G.t * 0.7 + j); }); li = Math.max(li, k);
      for (const z of G.infected?.list || []) if (!z.dead && z.p.root.position.distanceTo(f.at) < f.r + 0.2) { if (!(z.burn > 0)) G.outbreak?.note?.(null); z.burn = Math.max(z.burn || 0, 6); }
      for (const it of G.items) if (it.straw && !it.dead && !it.held && it.obj.position.distanceTo(f.at) < f.r + 1.2) { it.remove(); A.fire(it.obj.position.clone().setY(0), 0.5, 25); }
      if (f.life <= 0) { f.g.removeFromParent(); A.fires.splice(i, 1); } }
    if (A.fires.length) lt.position.copy(A.fires[A.fires.length - 1].at).setY(0.8); lt.intensity = 3 * li;
    for (const z of G.infected?.list || []) if (z.burn > 0 && !z.dead) { if (!z.flame) { z.flame = glow(0xff7a30, 0.8, 0.6); z.p.root.add(z.flame); z.flame.position.y = 1.1; } } else if (z.flame) { z.flame.removeFromParent(); z.flame = null; }
    for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; p.life -= dt; p.s.scale.multiplyScalar(1 + dt * 0.5); p.s.position.y += dt * 0.12; p.s.material.opacity = Math.min(0.5, p.life * 0.15); if (p.life <= 0) { p.s.removeFromParent(); p.s.material.dispose(); puffs.splice(i, 1); } }
    A.smoke = Math.max(0, A.smoke - dt); const sk = Math.min(1, A.smoke / 6); for (const s of smoke) { const u = s.userData; s.visible = sk > 0.01; if (!s.visible) continue; u.a += dt * 0.05; s.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(G.t * 0.1 + u.a) * 0.1, 0.6 + Math.sin(u.a) * u.r); s.scale.setScalar(1.6); s.material.opacity = 0.32 * sk; }
  };
  return A;
}
