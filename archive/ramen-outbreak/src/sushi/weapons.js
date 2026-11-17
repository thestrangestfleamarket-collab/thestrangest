// WHAT YOU FIGHT WITH, late Edo and found as the night goes: the kitchen's knife and cleaver, then a farmer's sickle, a woodcutter's axe, a bamboo spear and a staff, a fallen ronin's katana, a yari; each a body of real weight and balance (Rapier) held in the hand, one hand or two; a blow is judged where the blade meets a limb (limbs.js): the edge leading the swing cuts, the flat only bruises and knocks, the tip third cuts best, a good cut through a neck, forearm or shin takes it off (gore.js), a poor one stops in the body; blade on blade, or a haft, stops a swing; in a headset you swing with your hands, on a screen you hold to wind up, move the mouse the way to cut and let go, and hold the other button to guard
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { G, V3, Q, mat, clamp, rand } from './ctx.js';
import { Tool } from './items.js';
import { PH } from './physics.js';
import * as T from './tex.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// each in its own frame: the hand at the origin, forward -z, the edge toward -y. kg; the line that strikes (a: hand end, b: far end); r its half thickness; edge 0..1 (0 blunt); from: where along a..b the edge begins; sev: how well it takes a limb off; pierce: its point; bal: centre of mass ahead of the hand (m); hands: 2 if it wants both; thrust: a screen's click thrusts
export const ARMS = {
  knife: { name: 'kitchen knife', kg: 0.22, a: [0, -0.015, -0.06], b: [0, -0.02, -0.25], r: 0.02, edge: 0.6, from: 0, sev: 0.3, pierce: 0.8, bal: 0.03 },
  cleaver: { name: 'cleaver', kg: 0.72, a: [0, -0.04, -0.07], b: [0, -0.04, -0.27], r: 0.045, edge: 0.9, from: 0, sev: 1, pierce: 0.1, bal: 0.1 },
  kama: { name: 'sickle', kg: 0.5, a: [0, -0.03, -0.3], b: [0.0, -0.17, -0.41], r: 0.025, edge: 0.8, from: 0, sev: 0.7, pierce: 0.4, bal: 0.24 },
  axe: { name: 'woodcutter\'s axe', kg: 1.6, a: [0, -0.02, -0.05], b: [0, -0.07, -0.66], r: 0.045, edge: 0.85, from: 0.82, sev: 1.15, pierce: 0, bal: 0.42, hands: 2 },
  takeyari: { name: 'bamboo spear', kg: 0.9, a: [0, 0, 0.55], b: [0, 0, -1.45], r: 0.02, edge: 0.15, from: 0.93, sev: 0, pierce: 1.2, bal: 0.45, hands: 2, thrust: true },
  bo: { name: 'staff', kg: 1.3, a: [0, 0, 0.6], b: [0, 0, -1.2], r: 0.017, edge: 0, from: 2, sev: 0, pierce: 0.15, bal: 0.3, hands: 2 },
  katana: { name: 'katana', kg: 1.1, a: [0, 0, -0.18], b: [0, -0.012, -0.83], r: 0.018, edge: 1, from: 0, sev: 1.3, pierce: 0.9, bal: 0.1, hands: 2, tsuka: 0.2 },
  tanto: { name: 'tanto', kg: 0.3, a: [0, -0.008, -0.07], b: [0, -0.012, -0.33], r: 0.015, edge: 0.9, from: 0, sev: 0.5, pierce: 1, bal: 0.05 },
  wakizashi: { name: 'wakizashi', kg: 0.7, a: [0, -0.008, -0.1], b: [0, -0.02, -0.6], r: 0.017, edge: 1, from: 0, sev: 1.05, pierce: 0.9, bal: 0.09, tsuka: 0.13 },
  naginata: { name: 'naginata', kg: 2.1, a: [0, 0, 0.75], b: [0, -0.05, -1.5], r: 0.022, edge: 0.95, from: 0.78, sev: 1.25, pierce: 0.7, bal: 0.5, hands: 2 },
  kunai: { name: 'kunai', kg: 0.16, a: [0, 0, -0.05], b: [0, 0, -0.2], r: 0.012, edge: 0.5, from: 0.3, sev: 0.15, pierce: 1, bal: 0.06, throw: true },
  shuriken: { name: 'shuriken', kg: 0.08, a: [0, 0, 0.04], b: [0, 0, -0.04], r: 0.05, edge: 0.4, from: 0, sev: 0, pierce: 0.8, bal: 0, throw: true, star: true },
  boshuriken: { name: 'bo-shuriken', kg: 0.06, a: [0, 0, 0.08], b: [0, 0, -0.09], r: 0.006, edge: 0, from: 2, sev: 0, pierce: 1, bal: 0, throw: true },
  kusarigama: { name: 'kusarigama', kg: 0.55, a: [0, -0.03, -0.3], b: [0.0, -0.17, -0.41], r: 0.025, edge: 0.8, from: 0, sev: 0.7, pierce: 0.4, bal: 0.24 },
  yumi: { name: 'yumi (bow)', kg: 0.5, a: [0, -0.7, 0], b: [0, 1.4, 0], r: 0.015, edge: 0, from: 2, sev: 0, pierce: 0, bal: 0.1, bow: true },
  ya: { name: 'arrow', kg: 0.03, a: [0, 0, 0.1], b: [0, 0, -0.75], r: 0.005, edge: 0, from: 2, sev: 0, pierce: 1.4, bal: 0, throw: true, arrow: true },
  teppo: { name: 'tanegashima', kg: 3.6, a: [0, -0.03, 0.35], b: [0, 0.02, -0.95], r: 0.022, edge: 0, from: 2, sev: 0, pierce: 0, bal: 0.25, hands: 2, gun: true },
  yari: { name: 'yari', kg: 1.9, a: [0, 0, 0.6], b: [0, 0, -1.92], r: 0.02, edge: 0.6, from: 0.9, sev: 0.5, pierce: 1.4, bal: 0.55, hands: 2, thrust: true },
};
const NEED = { head: 4, upperArmL: 3.4, upperArmR: 3.4, forearmL: 2.2, forearmR: 2.2, handL: 1.1, handR: 1.1, shinL: 3.2, shinR: 3.2 }; // N s of a true edge's cut that takes each off
const SLOW = 1.3; // m/s: slower than this a blade only touches
const _a = new V3(), _b = new V3(), _c = new V3(), _d = new V3(), _e = new V3(), _f = new V3(), _q = new Q(), _m = new THREE.Matrix4(), _x = new V3(), _y = new V3(), _z = new V3();
// the closest points of two segments: [distance, s on the first, t on the second]
export function segSeg(p1, q1, p2, q2) {
  const d1 = _a.copy(q1).sub(p1), d2 = _b.copy(q2).sub(p2), r = _c.copy(p1).sub(p2), a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r); let s, t;
  if (a < 1e-9 && e < 1e-9) return [p1.distanceTo(p2), 0, 0];
  if (a < 1e-9) { s = 0; t = clamp(f / e, 0, 1); } else { const c = d1.dot(r); if (e < 1e-9) { t = 0; s = clamp(-c / a, 0, 1); } else { const b = d1.dot(d2), den = a * e - b * b; s = den > 1e-9 ? clamp((b * f - c * e) / den, 0, 1) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); } } }
  const c1 = _d.copy(p1).addScaledVector(d1, s), c2 = _e.copy(p2).addScaledVector(d2, t); return [c1.distanceTo(c2), s, t];
}

// the shapes: real models where there are CC0 ones (Poly Haven's antique katana, its axe), made to true size from the photographed woods and steel otherwise
let MATS = null;
export const mats = () => MATS || (MATS = { steel: mat({ color: 0xc4c8cc, map: T.steelTex() }), dark: T.surface(mat({ map: T.photo('wood_dark'), color: 0x8a7a6a }), { bomb: 0, grime: 0.2 }), light: T.surface(mat({ map: T.photo('wood_light'), color: 0xd8c8a8 }), { bomb: 0, grime: 0.2 }),
  bamboo: T.surface(mat({ map: T.photo('wood_light'), color: 0xc8c070 }), { bomb: 0, grime: 0.25 }), lacquer: mat({ color: 0x2a1410 }), cord: mat({ color: 0x1c1a2a }), brass: mat({ color: 0x8a6a2a }) });
export const M = (g, m, p, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
export const rod = (r0, r1, len, m, p, z0) => { const g = new THREE.CylinderGeometry(r1, r0, len, 10).rotateX(-Math.PI / 2); return M(g, m, p, 0, 0, z0 - len / 2); }; // from z0 forward (-z)
export const flat = (pts, depth) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) s.lineTo(x, y); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2).rotateY(Math.PI / 2); }; // drawn in (-z, y) as (x, y), laid on its side
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder); const GLB = {};
export const glb = (n) => GLB[n] || (GLB[n] = loader.loadAsync('/sushi-assets/m/' + n + '.glb').then((g) => { g.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: 0xffffff }); o.castShadow = true; o.userData.nopick = false; } }); return g.scene; }).catch(() => null));
export const BUILD = {
  cleaver(g) { const m = mats(); rod(0.012, 0.014, 0.12, m.dark, g, 0.07); M(new THREE.CylinderGeometry(0.0145, 0.0145, 0.012, 10).rotateX(Math.PI / 2), m.brass, g, 0, 0, -0.055); M(flat([[0.06, 0.012], [0.28, 0.012], [0.285, -0.085], [0.06, -0.085]], 0.004), m.steel, g); },
  kama(g) { const m = mats(); rod(0.014, 0.016, 0.34, m.light, g, 0.04); M(new THREE.CylinderGeometry(0.017, 0.017, 0.02, 10).rotateX(Math.PI / 2), m.steel, g, 0, 0, -0.3);
    const pts = []; for (let i = 0; i <= 8; i++) { const a = (i / 8) * 1.25; pts.push([0.3 + Math.sin(a) * 0.13, 0.0 - (1 - Math.cos(a)) * 0.13 - i * 0.004]); } for (let i = 8; i >= 0; i--) { const a = (i / 8) * 1.25; pts.push([0.3 + Math.sin(a) * 0.105 + 0.006, -0.012 - (1 - Math.cos(a)) * 0.105 - i * 0.002]); } M(flat(pts, 0.003), m.steel, g); },
  takeyari(g) { const m = mats(); rod(0.019, 0.017, 1.9, m.bamboo, g, 0.55); for (let z = 0.4; z > -1.2; z -= 0.32) M(new THREE.TorusGeometry(0.0185, 0.003, 4, 12), m.bamboo, g, 0, 0, z); M(new THREE.ConeGeometry(0.017, 0.11, 10).rotateX(-Math.PI / 2), m.bamboo, g, 0, 0, -1.4); },
  bo(g) { const m = mats(); rod(0.016, 0.016, 1.8, m.light, g, 0.6); },
  yari(g) { const m = mats(); rod(0.017, 0.015, 2.3, m.lacquer, g, 0.6); M(new THREE.CylinderGeometry(0.019, 0.019, 0.08, 10).rotateX(Math.PI / 2), m.brass, g, 0, 0, -1.66); M(new THREE.CylinderGeometry(0.017, 0.017, 0.04, 10).rotateX(Math.PI / 2), m.steel, g, 0, 0, 0.6);
    M(new THREE.LatheGeometry([[0, 0], [0.016, 0.03], [0.012, 0.18], [0, 0.24]].map(([x, y]) => new THREE.Vector2(x, y)), 4).rotateX(-Math.PI / 2).scale(1, 0.45, 1), m.steel, g, 0, 0, -1.7); },
  // Poly Haven's antique katana: its length along +y, the guard near y 0, the edge toward -x: turned so the hand sits behind the guard, the blade forward and the edge down
  katana(g) { const s = new THREE.Group(); s.rotation.z = Math.PI / 2; const i = new THREE.Group(); i.rotation.x = -Math.PI / 2; i.position.z = 0; s.add(i); g.add(s); const f = new THREE.Group(); f.position.y = 0.13; i.add(f);
    const stand = M(new THREE.BoxGeometry(0.01, 0.8, 0.03), mats().steel, f, 0, 0.35, 0); stand.visible = false; glb('antique_katana_01').then((sc) => { if (!sc) { stand.visible = true; return; } f.add(sc.clone()); }); },
  axe(g) { const s = new THREE.Group(); s.rotation.z = Math.PI; const i = new THREE.Group(); i.rotation.x = -Math.PI / 2; s.add(i); g.add(s); const f = new THREE.Group(); f.scale.setScalar(1.25); f.position.y = 0.19; i.add(f);
    glb('wooden_axe').then((sc) => { if (sc) f.add(sc.clone()); else rod(0.016, 0.016, 0.7, mats().light, g, 0.05); }); },
};

export class Weapon extends Tool {
  constructor(kind, obj) {
    const d = ARMS[kind], g = obj || new THREE.Group(); if (!obj) BUILD[kind](g);
    const A = new V3(...d.a), B = new V3(...d.b), mid = A.clone().add(B).multiplyScalar(0.5);
    super('weapon', g, { radius: d.hands === 2 ? 0.14 : 0.1, lift: 0.2, name: d.name, aim: new V3(0, 0, -0.1) });
    Object.assign(this, { def: d, wk: kind, A, B, weapon: true, useMode: 'swing', mass: d.kg, mat: kind === 'bo' || kind === 'takeyari' ? 'wood' : 'metal', grp: 0x00020007, col: { t: 'box' }, pA: new V3(), pB: new V3(), wA: new V3(), wB: new V3(), fresh: true, hits: new Map(), dk: { mode: 'rest', t: 0, dx: -0.7, dy: 0.7, wind: 0 }, tq: new Q(), parried: 0, cuts: 0 });
    this.center.set(0, 0, d.hands === 2 ? 0.05 : -0.03);
    this.half = Math.max(0.03, A.distanceTo(B) / 2); this.mid = mid;
  }
  // its body in the hand: a slab along what strikes, as heavy as it is
  shape() { const d = this.def, h = this.half, w = Math.max(0.012, d.r); return [RAPIER.ColliderDesc.cuboid(w, kindH[this.wk] || w, h).setTranslation(this.mid.x, this.mid.y, this.mid.z), d.kg]; }
  onGrab(h) { super.onGrab(h); this.fresh = true; this.wantDrop = false; this.dk.mode = 'rest'; this.tq.copy(this.obj.quaternion); G.outbreak?.found?.(this); }
  onRelease() { if (this.supp) { this.supp.supp = null; this.supp = null; } this.dk.mode = 'rest'; if (G.desk) G.desk.swingAim = null; return false; }   // let go, it falls where it is, as anything heavy would
  onGround() { }
  hint() { return this.def.name; }
  // where the striking line is in the world now
  line(A = this.wA, B = this.wB) { this.obj.updateMatrixWorld(); A.copy(this.A).applyMatrix4(this.obj.matrixWorld); B.copy(this.B).applyMatrix4(this.obj.matrixWorld); return [A, B]; }
  // in a headset: the hand, and a second hand on the grip if there is one, give where it points; one hand holds a long or heavy thing less steadily (it sags and comes round late)
  aimXR(h, pos, q, dt) {
    const d = this.def, two = !!(this.supp && this.supp.active && this.supp.grip);
    if (two) { _z.copy(h.pos).sub(this.supp.pos); const l = _z.length(); if (l > 0.05) { _z.divideScalar(l); _y.set(0, 1, 0).applyQuaternion(h.quat); _x.crossVectors(_y, _z.negate()).normalize(); _y.crossVectors(_z, _x); _m.makeBasis(_x, _y, _z); q.setFromRotationMatrix(_m); } }
    const lever = d.kg * d.bal, sag = two ? 0 : clamp(lever * 0.9 - 0.04, 0, 0.42); if (sag > 0) q.multiply(_q.setFromAxisAngle(_x.set(1, 0, 0), -sag));
    const agile = (two ? 44 : 20) / (lever * 4 + 0.4); this.tq.slerp(q, Math.min(1, dt * agile)); q.copy(this.tq); this.two = two;
  }
  // on a screen: rest, wind up (hold), swing (let go) along the way the mouse moved, guard (the other button); every pose is placed from the eye
  desk(dt, h) {
    const k = this.dk, d = this.def, ks = G.desk.keys;
    if (ks.KeyQ) { this.wantDrop = true; return; }
    if (k.mode === 'rest' && h.gripDown) { k.mode = 'wind'; k.t = 0; k.dx = -0.7; k.dy = 0.7; k.mx = 0; k.my = 0; G.desk.swingAim = (x, y) => { k.mx += x; k.my += y; const l = Math.hypot(k.mx, k.my); if (l > 12) { k.dx = k.mx / l; k.dy = k.my / l; } return true; }; }
    else if (k.mode === 'wind' && !h.grip) { k.mode = 'swing'; k.pow = clamp(k.t / 0.45, 0.35, 1); k.t = 0; k.dur = (d.thrust ? 0.2 : 0.2 + d.kg * d.bal * 0.25) / (0.7 + 0.3 * k.pow); G.desk.swingAim = null; this.hits.clear(); this.blocked = false; }
    else if (k.mode === 'rest' && h.use) { k.mode = 'guard'; k.t = 0; }
    else if (k.mode === 'guard' && !h.use) { k.mode = 'rest'; k.t = 0; }
    k.t += dt; if (k.mode === 'swing' && k.t >= k.dur) { k.mode = 'back'; k.t = 0; } if (k.mode === 'recoil' && k.t > 0.28) { k.mode = 'back'; k.t = 0; } if (k.mode === 'back' && k.t > 0.25) k.mode = 'rest';
    this.guard = k.mode === 'guard';
    // the pose in the eye's own space: hand H, pointing D, edge toward E
    const m = _f.set(k.dx, -k.dy, 0), H = _a, D = _b, E = _c; let s;
    const rest = () => { H.set(0.2, -0.27, -0.32); D.set(0.08, 0.55, -1).normalize(); E.set(0, -0.6, -0.8); };
    if (d.thrust) {
      if (k.mode === 'wind') { s = Math.min(1, k.t / 0.35); H.set(0.16, -0.25, -0.3 + 0.18 * s); D.set(0.02, 0.06, -1).normalize(); E.set(0, -1, 0); }
      else if (k.mode === 'swing' || k.mode === 'recoil') { s = k.mode === 'recoil' ? 0.6 : Math.min(1, k.t / k.dur); H.set(0.12, -0.24, -0.12 - 0.62 * Math.sin(s * Math.PI / 2) * k.pow); D.set(0.01, 0.03, -1).normalize(); E.set(0, -1, 0); }
      else if (k.mode === 'guard') { H.set(0.05, -0.12, -0.3); D.set(1, 0.25, -0.15).normalize(); E.set(0, 0, -1); } else rest();
    } else if (k.mode === 'wind') { s = Math.min(1, k.t / 0.35); const e = s * s * (3 - 2 * s); H.set(0.2, -0.27, -0.32).addScaledVector(m, -0.22 * e); D.set(0.08, 0.55, -1).normalize().lerp(_d.copy(m).multiplyScalar(-0.9).add(_e.set(0, 0.3, 0.35)), e).normalize(); E.copy(m); }
    else if (k.mode === 'swing' || k.mode === 'recoil') {
      s = k.mode === 'recoil' ? k.s : Math.min(1, k.t / k.dur); k.s = s; const H0 = _d.set(0.2, -0.27, -0.32).addScaledVector(m, -0.22), H2 = _e.set(0.04, -0.27, -0.36).addScaledVector(m, 0.24), H1 = new V3(0.06, -0.2, -0.56 - 0.12 * k.pow);
      H.copy(H0).multiplyScalar((1 - s) * (1 - s)).addScaledVector(H1.multiplyScalar(2).sub(_x.copy(H0).add(H2).multiplyScalar(0.5)), 2 * s * (1 - s)).addScaledVector(H2, s * s);
      const D0 = _x.copy(m).multiplyScalar(-0.9).add(_y.set(0, 0.3, 0.35)).normalize(), D2 = _y.copy(m).multiplyScalar(0.95).add(_z.set(0, 0, -0.35)).normalize(), D1 = new V3(0, -0.05, -1);
      D.copy(D0).multiplyScalar((1 - s) * (1 - s)).addScaledVector(D1.multiplyScalar(2).sub(_z.copy(D0).add(D2).multiplyScalar(0.5)), 2 * s * (1 - s)).addScaledVector(D2, s * s).normalize(); E.copy(m).addScaledVector(D, -m.dot(D));
    } else if (k.mode === 'guard') { H.set(0.08, -0.12, -0.34); D.set(-1, 0.3, -0.12).normalize(); E.set(0, 0.25, -1); }
    else if (k.mode === 'back') { s = Math.min(1, k.t / 0.25); rest(); H.lerp(_d.set(0.04, -0.27, -0.36).addScaledVector(m, 0.24), 1 - s); }
    else rest();
    // into the world: hand position, then a frame with -z along D and -y along E
    const cam = G.camera; cam.updateMatrixWorld(); cam.getWorldQuaternion(_q); _z.copy(D).negate(); E.addScaledVector(D, -E.dot(D)); if (E.lengthSq() < 1e-6) E.set(0, -1, 0).addScaledVector(D, -D.y); _y.copy(E).normalize().negate(); _x.crossVectors(_y, _z).normalize(); _y.crossVectors(_z, _x); _m.makeBasis(_x, _y, _z);
    this.obj.quaternion.setFromRotationMatrix(_m).premultiply(_q); this.obj.position.copy(H).applyMatrix4(cam.matrixWorld);
    this.live = k.mode === 'swing' && k.s > 0.08;
  }
  onHeld(dt, h) { if (this.drive) { this.drive(this, dt); this.live = true; return; } if (!h.xr) this.desk(dt, h); else this.live = true; }   // (drive: a scripted stroke, for the checks)
  update(dt) { super.update(dt); W.strike(this, dt); }
}
const kindH = { cleaver: 0.045, kama: 0.04, axe: 0.05, kusarigama: 0.04, shuriken: 0.004, naginata: 0.03 };

// what a moving blade meets this frame: another blade or haft first (a parry), then the limbs of anyone near (their real space, limbs.js)
export const W = { list: [], parries: 0, cuts: 0, flats: 0, log: [] };
W.strike = (w, dt) => {
  const [A, B] = w.line(); if (w.fresh || dt <= 0 || (!w.held && !w.free)) { w.pA.copy(A); w.pB.copy(B); w.fresh = false; return; }
  const mv = Math.max(w.pA.distanceTo(A), w.pB.distanceTo(B)); if (mv > 0.6 || mv / dt < SLOW || (w.held && !w.live) || (w.parryT || 0) > G.t) { w.pA.copy(A); w.pB.copy(B); return; }
  const d = w.def, recs = G.react?.limbs?.recs, a0 = new V3(), b0 = new V3();
  for (let k = 1; k <= 3; k++) {
    const f = k / 3; a0.lerpVectors(w.pA, A, f); b0.lerpVectors(w.pB, B, f);
    for (const o of W.list) { if (o === w || o.dead || !(o.held || o.guard || o.braced)) continue; const [oa, ob] = o.line(_f, new V3()); const [dd, s] = segSeg(a0, b0, oa, ob); if (dd < d.r + o.def.r + 0.01) { W.parry(w, o, a0.clone().lerp(b0, s)); w.pA.copy(A); w.pB.copy(B); return; } }
    if (recs) for (const r of recs.values()) { if (!r.segs.length || (w.hits.get(r.p) || 0) > G.t) continue;
      for (const s of r.segs) { const [dd, u, t] = segSeg(a0, b0, s.A, s.B); if (dd > s.r + d.r) continue; W.hit(w, r, s, u, f, dt); if (w.stop) { w.stop = false; w.pA.copy(A); w.pB.copy(B); return; } break; } }
  }
  w.pA.copy(A); w.pB.copy(B);
};
W.parry = (w, o, at) => { w.parryT = G.t + 0.3; o.parryT = G.t + 0.15; W.parries++; w.parried++; G.audio?.play('clank', at); G.outbreak?.noise?.(at, 0.6); if (w.held) w.held.pulse?.(1, 70); if (o.held) o.held.pulse?.(0.8, 60);
  if (w.dk.mode === 'swing') { w.dk.mode = 'recoil'; w.dk.t = 0; } W.log.push({ t: G.t, kind: 'parry', by: w.wk, on: o.wk }); };
// one blade meeting one limb: how fast the struck point went, and how much of that the edge led
W.hit = (w, r, s, u, f, dt) => {
  const d = w.def, P1 = _a.copy(w.A).lerp(w.B, u).applyMatrix4(w.obj.matrixWorld), P0 = _b.copy(w.pA).lerp(w.pB, u), v = _c.copy(P1).sub(P0).divideScalar(dt), sp = v.length(); if (sp < SLOW) return;
  const vn = v.clone().divideScalar(sp), edgeW = _d.set(0, -1, 0).applyQuaternion(w.obj.quaternion), along = _e.copy(w.wB).sub(w.wA).normalize();
  const sharp = u >= d.from ? d.edge : 0, lead = Math.max(0, vn.dot(edgeW)), push = Math.max(0, vn.dot(along)), tip = d.from < 1 ? (u > 0.66 ? 1.15 : 0.62 + 0.6 * u) : 1;
  const J = (d.kg + 0.6) * sp, cut = sharp * (lead > 0.5 ? lead : lead * 0.3) * tip, pierce = u > 0.85 ? d.pierce * push : 0, crush = 1 - Math.min(1, cut + pierce);
  const dmg = J * (cut * 9 + pierce * 8 + crush * 2.6), at = P1.clone(), b = r.x, z = b.z;
  let seg = s.mid ? (at.y > 1.45 ? 'head' : 'torso') : s.name; const neck = seg === 'head' ? at.y < s.A.y - 0.02 : seg === 'torso' && at.distanceTo(s.B) < 0.1;
  let sever = null; const part = neck ? 'head' : seg; if (cut > 0.45 && lead > 0.55 && sp > 2.3 && NEED[part] && J * cut * d.sev >= NEED[part]) sever = part;
  w.hits.set(r.p, G.t + 0.3); W.log.push({ t: +G.t.toFixed(2), w: w.wk, seg, sp: +sp.toFixed(2), lead: +lead.toFixed(2), cut: +cut.toFixed(2), dmg: Math.round(dmg), sever }); if (W.log.length > 30) W.log.shift();
  if (cut > 0.3) W.cuts++; else W.flats++; w.cuts++;
  const h = { seg, at, dir: vn, sp, J, cut, crush, pierce, dmg, sever, w };
  if (z) G.infected?.cut(z, h);
  else if (b && G.react?.blow) { G.react.blow(b, cut > 0.3 ? 'cut' : 'thing', seg === 'head' ? 'head' : 'body', vn, at, Math.min(J, 8), w, false, seg); if (cut > 0.3) { G.gore?.spray(at, vn, 0.6); G.gore?.wound(b.p, at, 0.035); } }
  G.audio?.play(cut > 0.3 ? 'chop' : 'set', at); G.outbreak?.noise?.(at, 0.45);
  if (w.held) w.held.pulse?.(sever ? 0.7 : 1, sever ? 40 : 90);
  // it stops in the body unless it went clean through
  if (!sever) { w.stop = true; if (w.held && !w.held.xr && w.dk.mode === 'swing') { w.dk.mode = 'recoil'; w.dk.t = 0; } const g = PH.grip.get(w); if (g) { g.c.setCollisionGroups(0x0002000f); w.bite = 0.25; } }
};
// is something held across the way between two points (a grab blocked by a guard)
W.guards = (from, to) => { for (const w of W.list) { if (!(w.held || w.guard) || w.dead) continue; const [A, B] = w.line(_f, new V3()); if (segSeg(from, to, A, B)[0] < 0.1) return w; } return null; };
W.make = (kind, at, quat) => { const C = W.kinds && W.kinds[kind], w = C ? new C(kind) : new Weapon(kind); W.list.push(w); if (at) { w.obj.position.copy(at); if (quat) w.obj.quaternion.copy(quat); w.home.pos.copy(w.obj.position); w.home.quat.copy(w.obj.quaternion); w.atHome = false; if (PH.ready) PH.rest(w); } return w; };
// the cart's own knife fights too
W.adopt = (it, kind) => { it.weapon = true; it.def = ARMS[kind]; it.wk = kind; it.A = new V3(...it.def.a); it.B = new V3(...it.def.b); Object.assign(it, { pA: new V3(), pB: new V3(), wA: new V3(), wB: new V3(), fresh: true, hits: new Map(), dk: { mode: 'rest' }, parried: 0, cuts: 0, line: Weapon.prototype.line, live: true }); W.list.push(it);
  const up = it.update.bind(it); it.update = (dt) => { up(dt); if (it.held && it.held.xr) W.strike(it, dt); }; };
W.update = (dt) => { for (const w of W.list) if (w.bite > 0 && (w.bite -= dt) <= 0) { const g = PH.grip.get(w); if (g) g.c.setCollisionGroups(w.grp); } W.list = W.list.filter((w) => !w.dead); };

export function buildWeapons() {
  G.weapons = W;
  if (G.cart && G.cart.knife) W.adopt(G.cart.knife, 'knife');
  // the cleaver: from the start, on the side counter by the board
  W.make('cleaver', new V3(0.86, 0.905, 0.42), new Q().setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2)));
  return W;
}
