// loose things as weighted bodies (Rapier): bowls, bottles, food and raw things fall, tumble, knock and stack on the cart's real surfaces; what has come to rest becomes something to land on
import RAPIER from '@dimforge/rapier3d-compat';
import { G } from './ctx.js';

const PH = { ready: false, world: null, live: new Map() };
const shape = (it) => {
  if (it.kind === 'bowl') return [RAPIER.ColliderDesc.cylinder(0.044, 0.1).setTranslation(0, 0.044, 0), 0.35];
  if (it.kind === 'drink') return [RAPIER.ColliderDesc.cylinder(0.12, 0.031).setTranslation(0, 0.12, 0), 0.55];
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
  PH.ready = true;
};
// the cart's tops and vessels, taken from what the cart registered
PH.statics = (cart) => {
  for (const s of G.surfaces) { const th = s.y > 0.95 && s.y < 1.01 ? 0.02 : s.y > 0.92 ? 0.014 : 0.42; PH.box((s.minX + s.maxX) / 2, s.y - th, (s.minZ + s.maxZ) / 2, (s.maxX - s.minX) / 2, th, (s.maxZ - s.minZ) / 2); }
  for (const p of cart.pots) PH.cyl(p.x, (p.baseY + p.rimY) / 2, p.z, (p.rimY - p.baseY) / 2, p.r + 0.005);
  for (const t of cart.tares) PH.cyl(t.x, 0.96, t.z, 0.06, 0.056);
  for (const k in cart.bins) PH.box(cart.bins[k].x, 0.92, cart.bins[k].z, 0.058, 0.02, 0.058);
  PH.box(0, 0.5, -0.6, 1.2, 0.5, 0.03); PH.cyl(0.93, 0.96, -0.36, 0.06, 0.1);
};
PH.spawn = (it, vel) => {
  PH.drop(it);
  const p = it.obj.position, q = it.obj.quaternion, [desc, mass] = shape(it);
  const b = PH.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x, p.y, p.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }).setLinearDamping(0.15).setAngularDamping(1.2).setCcdEnabled(true));
  PH.world.createCollider(desc.setMass(mass).setFriction(0.7).setRestitution(it.kind === 'food' ? 0.02 : 0.18), b);
  b.setLinvel({ x: vel ? vel.x : 0, y: vel ? vel.y : 0, z: vel ? vel.z : 0 }, true);
  if (vel && vel.lengthSq() > 0.3) b.setAngvel({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 3, z: (Math.random() - 0.5) * 4 }, true);
  PH.live.set(it, { b, still: 0, vy: 0, hit: 0 });
};
PH.drop = (it) => { const e = PH.live.get(it); if (e) { PH.world.removeRigidBody(e.b); PH.live.delete(it); } };
PH.step = (dt) => {
  for (const [it, e] of PH.live) {
    if (it.dead || it.held) { PH.drop(it); continue; }
    if (!it.free) { const t = e.b.translation(), p = it.obj.position; if (Math.abs(t.x - p.x) + Math.abs(t.y - p.y) + Math.abs(t.z - p.z) > 0.002) { const q = it.obj.quaternion; e.b.setTranslation({ x: p.x, y: p.y, z: p.z }, false); e.b.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, false); } }
  }
  PH.world.timestep = Math.min(dt, 1 / 30); PH.world.step();
  for (const [it, e] of PH.live) {
    if (!it.free) continue;
    const t = e.b.translation(), r = e.b.rotation(), v = e.b.linvel(), a = e.b.angvel();
    it.obj.position.set(t.x, t.y, t.z); it.obj.quaternion.set(r.x, r.y, r.z, r.w); it.vel.set(v.x, v.y, v.z);
    e.hit -= dt; if (e.vy < -0.7 && v.y > e.vy + 0.5 && e.hit <= 0) { e.hit = 0.15; if (t.y < 0.12 && e.vy < -2.2 && (it.kind === 'bowl' || it.kind === 'drink')) { it.free = false; PH.drop(it); it.onGround(); continue; } it.onLand(); }
    e.vy = v.y;
    const slow = Math.hypot(v.x, v.y, v.z) < 0.06 && Math.hypot(a.x, a.y, a.z) < 0.4; e.still = slow ? e.still + dt : 0;
    if (t.y < -2) { it.free = false; PH.drop(it); it.remove(); continue; }
    if (e.still > 0.3 || e.b.isSleeping()) {
      it.free = false; it.vel.set(0, 0, 0);
      if (t.y - it.base < 0.1) { PH.drop(it); it.onGround(); continue; }
      if (it.kind === 'bowl' && it.tilt() > 0.6) it.spill();
      if (it.tilt() < 0.9 || it.kind === 'bowl') it.upright();
      const p = it.obj.position, q = it.obj.quaternion; e.b.setBodyType(RAPIER.RigidBodyType.Fixed, false); e.b.setTranslation({ x: p.x, y: p.y, z: p.z }, false); e.b.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, false);
    }
  }
};
export { PH };
