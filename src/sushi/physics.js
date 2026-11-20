// loose things as weighted bodies (Rapier): bowls, bottles, food and raw things fall, tumble, knock and stack on the cart's real surfaces; what has come to rest becomes something to land on; what meets a person's limbs (limbs.js) is measured there
import RAPIER from '@dimforge/rapier3d-compat';
import { G, V3, Q } from './ctx.js';

const PH = { ready: false, world: null, live: new Map(), grip: new Map(), feel: new Map(), touch: [], hooks: null, dish: new Map(), SERVE: 1.3 };   // SERVE: metres a second under which a bowl or a drink carried in the hand is being served, not swung
const ITEM = 0x0004ffff, HELD_TOOL = 0x00020009; // loose things meet everything; a tool in the hand meets only the cart and people (a ladle still dips into its pot)
PH.LIMB = 0x00080016; PH.HAND = 0x0010000c; PH.HAND_PEOPLE = 0x00100008; // a person's limbs meet loose and held things and the cook's hands; a headset hand meets loose things and people, the screen's hand only people
const _p = new V3(), _d = new V3(), _r = new Q(), _e = new Q();
const shape = (it) => {
  if (it.col) { const c = it.col; return [c.t === 'cyl' ? RAPIER.ColliderDesc.cylinder(c.hh, c.r).setTranslation(0, c.hh, 0) : RAPIER.ColliderDesc.cuboid(c.hx, c.hy, c.hz).setTranslation(0, c.cy ?? c.hy, 0), it.mass || 0.3]; }
  if (it.tool) return [RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.15).setTranslation(0, 0, -0.14), 0.25];
  if (it.kind === 'debris') return [RAPIER.ColliderDesc.cuboid(0.013, 0.004, 0.011), 0.008];
  if (it.kind === 'bowl') return [RAPIER.ColliderDesc.cylinder(0.044, 0.1).setTranslation(0, 0.044, 0), 0.35];
  if (it.kind === 'drink') return [RAPIER.ColliderDesc.cylinder(0.061, 0.033).setTranslation(0, 0.061, 0), it.mass || 0.38];   // a twelve-ounce can, as tall and as wide as it is drawn
  if (it.kind === 'raw') return [RAPIER.ColliderDesc.cuboid(it.def.len / 2, it.def.r, it.def.r).setTranslation(it.def.len / 2, 0, 0), 0.4];
  if (it.noodle) return [RAPIER.ColliderDesc.cylinder(0.014, 0.05).setTranslation(0, 0.014, 0), 0.1];
  return [RAPIER.ColliderDesc.cuboid(0.03, 0.007, 0.03).setTranslation(0, 0.007, 0), 0.03];
};
PH.init = async () => {
  await RAPIER.init();
  const w = (PH.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }));
  const fixed = (desc) => w.createCollider(desc.setFriction(0.8).setRestitution(0.12), w.createRigidBody(RAPIER.RigidBodyDesc.fixed()));
  PH.box = (cx, cy, cz, hx, hy, hz) => fixed(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(cx, cy, cz));
  PH.cyl = (cx, cy, cz, hh, r) => fixed(RAPIER.ColliderDesc.cylinder(hh, r).setTranslation(cx, cy, cz));
  PH.box(0, -0.5, 0, 40, 0.5, 40);
  // a person's hand or forearm lets a slow thing by (what is set down or paid by them); anything moving meets it
  PH.hooks = { filterContactPair(c1, c2, b1, b2) { const f1 = PH.feel.get(c1), f = f1 || PH.feel.get(c2); if (!f || !f.soft) return RAPIER.SolverFlags.COMPUTE_IMPULSE; const ob = w.getRigidBody(f1 ? b2 : b1); if (!ob || !ob.isDynamic()) return RAPIER.SolverFlags.COMPUTE_IMPULSE; const g = PH.dish.get(ob.handle); if (g) return g.sp < PH.SERVE ? RAPIER.SolverFlags.EMPTY : RAPIER.SolverFlags.COMPUTE_IMPULSE;   // (a carried dish by how fast the hand brings it, not by how hard it is being pushed back to the hand)
    const v = ob.linvel(); return v.x * v.x + v.y * v.y + v.z * v.z < 0.36 ? RAPIER.SolverFlags.EMPTY : RAPIER.SolverFlags.COMPUTE_IMPULSE; }, filterIntersectionPair: () => true };
  PH.ready = true;
};
// the cart's tops and vessels, taken from what the cart registered
PH.statics = (cart) => {
  for (const s of G.surfaces) { const th = s.y > 0.95 && s.y < 1.01 ? 0.02 : s.y > 0.92 ? 0.014 : 0.42; PH.box((s.minX + s.maxX) / 2, s.y - th, (s.minZ + s.maxZ) / 2, (s.maxX - s.minX) / 2, th, (s.maxZ - s.minZ) / 2); }
  for (const it of G.items) if (it.col && !it.carrier) PH.rest(it);
  for (const b of cart.burners) PH.cyl(b.x, 0.84, b.z, 0.02, 0.14);
  for (const k in cart.bins) PH.box(cart.bins[k].x, 0.92, cart.bins[k].z, 0.058, 0.02, 0.058);
  PH.box(0, 0.5, -0.6, 1.2, 0.5, 0.03); PH.cyl(0.93, 0.96, -0.36, 0.06, 0.1);
};
PH.spawn = (it, vel, ang) => {
  PH.drop(it);
  const p = it.obj.position, q = it.obj.quaternion, [desc, mass] = shape(it);
  const b = PH.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x, p.y, p.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }).setLinearDamping(0.15).setAngularDamping(1.2).setCcdEnabled(true));
  PH.world.createCollider(desc.setMass(mass).setFriction(0.7).setRestitution(it.kind === 'food' ? 0.02 : 0.18).setCollisionGroups(ITEM), b);
  b.setLinvel({ x: vel ? vel.x : 0, y: vel ? vel.y : 0, z: vel ? vel.z : 0 }, true);
  if (ang) b.setAngvel({ x: ang.x, y: ang.y, z: ang.z }, true);
  else if (vel && vel.lengthSq() > 0.3) b.setAngvel({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 3, z: (Math.random() - 0.5) * 4 }, true);
  PH.live.set(it, { b, c: b.collider(0), still: 0, pv: { x: 0, y: 0, z: 0 }, hit: 0, soft: 0 });
};
// standing where it was put: solid to everything else until it is lifted
PH.rest = (it) => { PH.spawn(it); const e = PH.live.get(it); e.b.setBodyType(RAPIER.RigidBodyType.Fixed, false); it.free = false; };
PH.drop = (it) => { const e = PH.live.get(it); if (e) { PH.world.removeRigidBody(e.b); PH.live.delete(it); } };
// in a headset's hand: a weightless body driven toward the hand each step, so it stops against the cart and shoves what is loose instead of passing through
const toolEnd = (it) => it.kind === 'knife' ? [RAPIER.ColliderDesc.cuboid(0.004, 0.027, 0.095).setTranslation(0, -0.013, -0.155), 0.25] // a tool in the hand meets the cart with its working end: the blade, the cup
  : it.cup ? [RAPIER.ColliderDesc.ball(it.kind === 'basket' ? 0.06 : it.r || 0.03).setTranslation(it.cup.x, it.cup.y, it.cup.z), 0.25] : shape(it);
PH.hold = (it) => {
  PH.drop(it); PH.unhold(it);
  const p = it.obj.position, q = it.obj.quaternion, [desc, mass] = it.tool ? toolEnd(it) : shape(it);
  const b = PH.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x, p.y, p.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }).setGravityScale(0).setCcdEnabled(true).setCanSleep(false));
  const dish = it.kind === 'bowl' || it.kind === 'drink'; if (dish) desc.setMassProperties(mass, { x: 0, y: it.center.y, z: 0 }, { x: 4, y: 4, z: 4 }, { x: 0, y: 0, z: 0, w: 1 }); else desc.setMass(mass);   // a carried dish keeps the hand's level: what it knocks against does not tip it
  const c = PH.world.createCollider(desc.setFriction(0.6).setRestitution(0.02).setCollisionGroups(0), b);
  const g = { b, c, tp: p.clone(), tq: q.clone(), ptp: p.clone(), sp: 0, off: new V3(), sep: 0, touch: false, bump: 0, want: it.tool ? HELD_TOOL : ITEM, ghost: 0.4 }; PH.grip.set(it, g); if (it.kind === 'bowl' || it.kind === 'drink') PH.dish.set(b.handle, g); // it meets nothing until it has come clear of what it was taken out of (no pop)
};
PH.unhold = (it) => { const g = PH.grip.get(it); if (g) { PH.dish.delete(g.b.handle); PH.world.removeRigidBody(g.b); PH.grip.delete(it); } };
PH.aim = (it, p, q) => { const g = PH.grip.get(it); if (!g) return false; g.tp.copy(p); g.tq.copy(q); return true; };
function drive(dt) {
  const h = Math.max(dt, 1 / 120);
  for (const [it, g] of PH.grip) {
    if (it.dead || !it.held) { PH.unhold(it); continue; }
    const t = g.b.translation(), r = g.b.rotation(); _p.set(t.x, t.y, t.z); _r.set(r.x, r.y, r.z, r.w);
    _d.copy(g.tp).sub(_p);
    if (_d.length() > 0.6 && !g.touch) { g.b.setTranslation(g.tp, true); g.b.setRotation(g.tq, true); g.b.setLinvel({ x: 0, y: 0, z: 0 }, true); g.b.setAngvel({ x: 0, y: 0, z: 0 }, true); g.ghost = 0.4; g.c.setCollisionGroups(0); continue; } // the hand left it far behind in free air: it comes back to the hand
    _d.multiplyScalar(1 / h).clampLength(0, 9); g.b.setLinvel(_d, true);
    _e.copy(g.tq).multiply(_r.invert()); if (_e.w < 0) _e.set(-_e.x, -_e.y, -_e.z, -_e.w);
    const s = Math.sqrt(Math.max(0, 1 - _e.w * _e.w)), a = 2 * Math.acos(Math.min(1, _e.w));
    if (s > 1e-5) _d.set(_e.x / s, _e.y / s, _e.z / s).multiplyScalar(a / h).clampLength(0, 25); else _d.set(0, 0, 0);
    g.b.setAngvel(_d, true);
  }
}
function follow(dt) {
  for (const [it, g] of PH.grip) {
    const t = g.b.translation(), r = g.b.rotation(); it.obj.position.set(t.x, t.y, t.z); it.obj.quaternion.set(r.x, r.y, r.z, r.w);
    g.off.copy(it.obj.position).sub(g.tp); g.sep = g.off.length();
    if (g.ghost > 0) { g.ghost -= dt; if (g.ghost > 0 && PH.world.intersectionWithShape(g.c.translation(), g.c.rotation(), g.c.shape, undefined, g.want, g.c, g.b)) continue; g.ghost = 0; g.c.setCollisionGroups(g.want); }
    const was = g.touch; g.touch = false;
    PH.world.contactPairsWith(g.c, (o) => { let hit = false; PH.world.contactPair(g.c, o, (m) => { for (let i = 0; i < m.numContacts(); i++) if (m.contactDist(i) < 0.004) hit = true; }); if (!hit) return; g.touch = true;
      const ob = o.parent(); for (const [lt, e] of PH.live) if (e.b.handle === ob.handle) { if (!lt.free && !lt.held && !lt.dead) { e.b.setBodyType(RAPIER.RigidBodyType.Dynamic, true); lt.free = true; e.still = 0; } break; } }); // what rests where the held thing comes is shoved, not walked through
    if (g.touch && !was) g.bump = 1;
  }
}
// a loose thing against someone's limb: the impulse the contact took (else its own change of momentum), where, and how it was moving before
const _at = new V3();
function feel(it, e, dv) {
  PH.world.contactPairsWith(e.c, (o) => { const f = PH.feel.get(o.handle); if (!f) return; let J = 0, n = 0; _at.set(0, 0, 0);
    PH.world.contactPair(e.c, o, (m) => { for (let i = 0; i < m.numContacts(); i++) if (m.contactDist(i) < 0.01) { J += m.contactImpulse(i); n++; } for (let i = 0; i < m.numSolverContacts(); i++) { const p = m.solverContactPoint(i); _at.x += p.x; _at.y += p.y; _at.z += p.z; } if (m.numSolverContacts()) _at.multiplyScalar(1 / m.numSolverContacts()); });
    if (!n) return; e.soft = 0.15; if (!J) J = e.b.mass() * dv; if (!_at.lengthSq()) it.worldCenter(_at);
    PH.touch.push({ it, f, J, at: _at.clone(), v: new V3(e.pv.x, e.pv.y, e.pv.z), m: e.b.mass() }); });
}
PH.step = (dt) => {
  for (const [it, e] of PH.live) {
    if (it.dead || it.held) { PH.drop(it); continue; }
    if (!it.free) { const t = e.b.translation(), p = it.obj.position; if (Math.abs(t.x - p.x) + Math.abs(t.y - p.y) + Math.abs(t.z - p.z) > 0.002) { const q = it.obj.quaternion; e.b.setTranslation({ x: p.x, y: p.y, z: p.z }, false); e.b.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, false); } }
  }
  for (const g of PH.dish.values()) { g.sp += (g.tp.distanceTo(g.ptp) / Math.max(dt, 1 / 120) - g.sp) * 0.5; g.ptp.copy(g.tp); }   // how fast the hand itself is carrying it
  drive(Math.min(dt, 1 / 30));
  PH.world.timestep = Math.min(dt, 1 / 30); PH.world.step(undefined, PH.feel.size ? PH.hooks : undefined);
  follow(Math.min(dt, 1 / 30));
  for (const [it, e] of PH.live) {
    if (!it.free) continue;
    const t = e.b.translation(), r = e.b.rotation(), v = e.b.linvel(), a = e.b.angvel();
    it.obj.position.set(t.x, t.y, t.z); it.obj.quaternion.set(r.x, r.y, r.z, r.w); it.vel.set(v.x, v.y, v.z);
    e.hit -= dt; e.soft -= dt; const dv = Math.hypot(v.x - e.pv.x, v.y - e.pv.y, v.z - e.pv.z), sp = Math.hypot(e.pv.x, e.pv.y, e.pv.z);
    if (PH.feel.size && !e.b.isSleeping()) feel(it, e, dv);
    if (dv > 0.45 && e.soft <= 0 && PH.onHit) PH.onHit(it, dv); // heard (items.js: by what it is made of)
    if (dv > 1.1 && e.hit <= 0) { e.hit = 0.12; if (e.soft > 0) { e.pv.x = v.x; e.pv.y = v.y; e.pv.z = v.z; continue; } if (it.onImpact(sp) === true) continue; it.onLand(); } // a sudden change of speed is a hit: how hard decides what breaks (a person is soft: nothing breaks on them)
    e.pv.x = v.x; e.pv.y = v.y; e.pv.z = v.z;
    const slow = Math.hypot(v.x, v.y, v.z) < 0.06 && Math.hypot(a.x, a.y, a.z) < 0.4; e.still = slow ? e.still + dt : 0;
    if (t.y < -2) { it.free = false; PH.drop(it); it.remove(); continue; }
    if (e.still > 0.3 || e.b.isSleeping()) {
      it.free = false; it.vel.set(0, 0, 0);
      if (!it.col && t.y - it.base < 0.1) { PH.drop(it); it.onGround(); continue; }
      if (it.kind === 'bowl' && it.tilt() > 0.6) it.spill();
      if (it.tilt() < 0.9 || it.kind === 'bowl') it.upright();
      const p = it.obj.position, q = it.obj.quaternion; e.b.setBodyType(RAPIER.RigidBodyType.Fixed, false); e.b.setTranslation({ x: p.x, y: p.y, z: p.z }, false); e.b.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, false);
    }
  }
};
export { PH };
