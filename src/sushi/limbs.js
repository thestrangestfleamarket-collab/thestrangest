// the people's real space (Rapier): kinematic limbs that follow the bones of everyone near the cart (head, trunk, upper and lower arms, hands, thighs, shins), one capsule for those farther off, and the cook's hands; what meets them is measured (the contact's impulse) and handed on as a blow (react.js)
import RAPIER from '@dimforge/rapier3d-compat';
import { G, V3, Q } from './ctx.js';
import { PH } from './physics.js';

const NEAR = 4, MID = 10, OUT = 0.6, CZ = 0; // metres from the cart: limbs within NEAR, a capsule within MID, nothing beyond (OUT the margin before a tier is dropped)
const ARM_KG = 1.5; // what a swung arm carries into a blow besides what it holds
// [name, from bone, to bone (null: a ball), radius, bind-space offset of a ball's centre, metres kept off the far end (the trunk stops at the neck)]
const SEGS = [['head', 'head', null, 0.11, [0, 0.1, 0.02]], ['torso', 'hips', 'head', 0.16, null, 0.16], ['upperArmL', 'upperArmL', 'forearmL', 0.055], ['upperArmR', 'upperArmR', 'forearmR', 0.055], ['forearmL', 'forearmL', 'handL', 0.045], ['forearmR', 'forearmR', 'handR', 0.045],
  ['handL', 'handL', null, 0.05, 'L'], ['handR', 'handR', null, 0.05, 'R'], ['thighL', 'thighL', 'shinL', 0.075], ['thighR', 'thighR', 'shinR', 0.075], ['shinL', 'shinL', 'shoeL', 0.06], ['shinR', 'shinR', 'shoeR', 0.06]];
const _a = new V3(), _b = new V3(), _c = new V3(), _u = new V3(0, 1, 0), _q = new Q(), _m = new V3();

export function buildLimbs() {
  const W = PH.world, recs = new Map(), hands = new Map(), L = { recs, hands, touches: 0, active: 0 };
  const kin = (p, q) => W.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(p.x, p.y, p.z).setRotation(q));
  const drop = (r) => { for (const s of r.segs) { PH.feel.delete(s.c.handle); W.removeRigidBody(s.b); } r.segs.length = 0; r.tier = 0; };
  // where each piece is this frame, in the world: a segment's two ends, or a ball's centre
  const pose = (r) => {
    const P = r.p, bn = r.bn, body = bn[0].parent; body.updateWorldMatrix(true, false); const M = body.matrixWorld;
    for (const s of r.segs) {
      if (s.mid) { _a.copy(bn[0].position).applyMatrix4(M); _b.copy(bn[r.hi].position).applyMatrix4(M); _b.y += 0.1; _a.y = Math.max(_a.y - 0.5, 0.36); }
      else if (s.to < 0) { _a.copy(s.off).applyQuaternion(bn[s.from].quaternion).add(bn[s.from].position).applyMatrix4(M); _b.copy(_a); }
      else { _a.copy(bn[s.from].position).applyMatrix4(M); _b.copy(bn[s.to].position).applyMatrix4(M); if (s.cut) _b.lerp(_a, Math.min(0.5, s.cut / Math.max(1e-3, _a.distanceTo(_b)))); }
      s.A.copy(_a); s.B.copy(_b); _m.copy(_a).add(_b).multiplyScalar(0.5); _c.copy(_b).sub(_a); const l = _c.length(); _q.setFromUnitVectors(_u, l > 1e-4 ? _c.divideScalar(l) : _u);
      const t = s.b.translation(); if (r.fresh || Math.abs(t.x - _m.x) + Math.abs(t.y - _m.y) + Math.abs(t.z - _m.z) > 0.5) { s.b.setTranslation(_m, true); s.b.setRotation(_q, true); } else { s.b.setNextKinematicTranslation(_m); s.b.setNextKinematicRotation(_q); }
    }
    r.fresh = false;
  };
  const make = (r, tier) => {
    drop(r); r.tier = tier; r.fresh = true; const P = r.p, ix = (n) => P.bones.findIndex((b) => b.name === n), O = P.rest;
    const add = (name, from, to, rad, half, off, soft, mid, cut = 0) => { const b = kin({ x: 0, y: -50, z: 0 }, { x: 0, y: 0, z: 0, w: 1 }); const d = (half > 0 ? RAPIER.ColliderDesc.capsule(half, rad) : RAPIER.ColliderDesc.ball(rad)).setCollisionGroups(PH.LIMB).setFriction(0.6).setRestitution(0.3);
      if (soft) d.setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS); const c = W.createCollider(d, b), s = { name, from, to, off, b, c, mid, cut, A: new V3(), B: new V3(), r: rad }; PH.feel.set(c.handle, { rec: r, seg: s, soft }); r.segs.push(s); };
    if (tier === 1) { r.hi = ix('head'); const hy = P.bones[0].position.y; add('torso', 0, r.hi, 0.2, Math.max(0.3, (O[r.hi].y - hy + 0.1 + Math.min(0.5, hy - 0.36)) / 2), null, false, true); }
    else for (const [name, a, b, rad, off, cut = 0] of SEGS) { const i = ix(a), j = b ? ix(b) : -1; if (i < 0 || (b && j < 0)) continue;
      const o = Array.isArray(off) ? new V3(...off) : off ? O[i].clone().sub(O[ix('forearm' + off)]).setLength(0.07) : new V3(); add(name, i, j, rad, j >= 0 ? Math.max(0.01, O[j].distanceTo(O[i]) - cut) / 2 : 0, o, /^(hand|forearm)/.test(name), false, cut); }
    r.bn = P.bones; pose(r);
  };
  // the cook's hands: a ball at each live hand (or round what it holds where the hand holds it outside the engine)
  const handBall = (h) => {
    let k = hands.get(h); if (!k) { const b = kin({ x: 0, y: -50, z: 0 }, { x: 0, y: 0, z: 0, w: 1 }), c = W.createCollider(RAPIER.ColliderDesc.ball(0.045).setCollisionGroups(h.xr ? PH.HAND : PH.HAND_PEOPLE).setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT | RAPIER.ActiveCollisionTypes.KINEMATIC_KINEMATIC).setFriction(0.5).setRestitution(0.1), b); k = { b, c, r: 0.045, off: 0, fresh: true, near: new Map() }; c.setEnabled(false); hands.set(h, k); }
    return k;
  };
  const placeHand = (h, dt) => {
    const k = handBall(h), it = h.held && !h.held.dead ? h.held : null, grip = it && PH.grip.get(it); if (it) k.off = 0.5; else k.off -= dt;
    const on = !!(h.active && !grip && (it || !h.xr || k.off <= 0)); if (k.c.isEnabled() !== on) { k.c.setEnabled(on); k.fresh = true; } if (!on) return;
    const r = it ? Math.min(0.07, (it.radius || 0.05) * 0.6) : 0.045; if (Math.abs(r - k.r) > 1e-3) { k.c.setRadius(r); k.r = r; }
    const p = it ? (it.useMode === 'chop' && it.blade ? it.point(it.blade, _a) : it.worldCenter(_a)) : _a.copy(h.pos), t = k.b.translation();
    if (k.fresh || Math.abs(t.x - p.x) + Math.abs(t.y - p.y) + Math.abs(t.z - p.z) > 0.5) { k.b.setTranslation(p, true); k.fresh = false; } else k.b.setNextKinematicTranslation(p);
  };
  const touching = (c, f) => W.contactPairsWith(c, (o) => { const e = PH.feel.get(o.handle); if (!e) return; let hit = false; W.contactPair(c, o, (m) => { for (let i = 0; i < m.numContacts(); i++) if (m.contactDist(i) < 0.01) hit = true; }); if (hit) f(e); });
  // a new touch from the hand or what it holds: the arm's own momentum along with the thing's (J = m v)
  const fromHand = (h, c, near, mass, it, out) => { const seen = new Set();
    touching(c, (e) => { const p = e.rec.p; if (seen.has(p)) return; seen.add(p); if (near.has(p)) return; const v = h.vs.length(); out.push({ rec: e.rec, seg: e.seg, src: it ? 'held' : 'hand', it, hand: h, J: (ARM_KG + mass) * v, sp: v, at: (it ? it.worldCenter(new V3()) : h.pos.clone()), dir: h.vs.lengthSq() > 1e-6 ? h.vs.clone().normalize() : new V3(0, 0, -1) }); });
    for (const p of [...near.keys()]) if (!seen.has(p)) near.delete(p); for (const p of seen) near.set(p, 1); };
  const pending = new Map();
  // the people and their tiers, the hands, then what touched whom: [{ rec, seg, src 'thrown' | 'held' | 'hand', it, J (N s), at, dir, sp }]
  L.update = (dt, list) => {
    const out = [], live = new Set();
    for (const x of list) { const p = x.p; if (!p.push || !p.rest) continue; live.add(p); let r = recs.get(p); if (!r) recs.set(p, r = { p, x, segs: [], tier: 0 }); r.x = x;
      const d = Math.hypot(p.root.position.x, p.root.position.z - CZ), want = d < NEAR + (r.tier === 2 ? OUT : 0) ? 2 : d < MID + (r.tier >= 1 ? OUT : 0) ? 1 : 0;
      if (want !== r.tier) { if (want) make(r, want); else drop(r); } else if (r.tier) pose(r); }
    for (const [p, r] of recs) if (!live.has(p)) { drop(r); recs.delete(p); }
    L.active = 0; for (const r of recs.values()) L.active += r.segs.length;
    // a loose thing that met a limb: the impulse over the next few hundredths of a second is the blow
    for (const t of PH.touch) { const key = t.it, w = pending.get(key); if (w && w.rec === t.f.rec) { w.J += t.J; continue; } if (t.it.hitP === t.f.rec.p && G.t - (t.it.hitT || 0) < 0.6) continue;
      pending.set(key, { rec: t.f.rec, seg: t.f.seg, src: 'thrown', it: t.it, J: t.J, at: t.at, dir: t.v.lengthSq() > 1e-6 ? t.v.clone().normalize() : new V3(0, -1, 0), sp: t.v.length(), t: 0.06 }); t.it.hitP = t.f.rec.p; t.it.hitT = G.t; }
    PH.touch.length = 0;
    for (const [k, w] of pending) if ((w.t -= dt) <= 0) { pending.delete(k); if (!w.it.dead || w.J > 0) out.push(w); }
    for (const [it, g] of PH.grip) { const h = (G.hands || []).find((x) => x.held === it); if (h) fromHand(h, g.c, g.near ||= new Map(), g.b.mass(), it, out); }
    for (const h of G.hands || []) { placeHand(h, dt); const k = hands.get(h); if (k.c.isEnabled()) { const it = h.held && !h.held.dead && !PH.grip.get(h.held) ? h.held : null; fromHand(h, k.c, k.near, it ? it.mass || 0.3 : 0, it, out); } else k.near.clear(); }
    L.touches += out.length; return out;
  };
  // a point (a drop of soup) inside someone's real space: which of them, and which piece
  L.at = (pt, rad) => { for (const r of recs.values()) for (const s of r.segs) { const d = s.to < 0 && !s.mid ? pt.distanceTo(s.A) : segDist(pt, s.A, s.B); if (d < s.r + rad) return { rec: r, seg: s }; } return null; };
  return L;
}
const segDist = (p, a, b) => { _c.copy(b).sub(a); const l = _c.lengthSq(), k = l ? Math.min(1, Math.max(0, _a.copy(p).sub(a).dot(_c) / l)) : 0; return _b.copy(a).addScaledVector(_c, k).distanceTo(p); };
