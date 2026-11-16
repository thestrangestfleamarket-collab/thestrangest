// Physics: Rapier rigid bodies for items (collision groups: static world, loose items, the player's kinematic paws/feet),
'use strict';
// plus a mirrored list of simple static shapes that the player controller and the walk grid read directly.
// Bodies are handed out as a small adapter (position / velocity / quaternion / wakeUp / sleeping / applyImpulse) so game code stays engine-neutral.
(function () {
const { V3, clamp } = MC;
const P = MC.phys = { GROUP_STATIC: 1, GROUP_ITEM: 2, GROUP_PLAYER: 4, GRAV: 18, ready: null, world: null };
const grp = (member, filter) => ((member & 0xffff) << 16) | (filter & 0xffff);
const G_STATIC = grp(P.GROUP_STATIC, P.GROUP_ITEM), G_ITEM = grp(P.GROUP_ITEM, P.GROUP_STATIC | P.GROUP_ITEM | P.GROUP_PLAYER), G_KIN = grp(P.GROUP_PLAYER, P.GROUP_ITEM), G_RAY = grp(P.GROUP_ITEM, P.GROUP_STATIC);
const MAT = { world: [0.6, 0.15], soft: [0.9, 0.02], item: [0.5, 0.12] };
let R, world, queue;
const bySolid = new Map(), byBody = new Map();   // collider handle -> solid (static) / body adapter (dynamic)
P.ready = RAPIER.init().then(() => {
  R = RAPIER; world = P.world = new R.World({ x: 0, y: -P.GRAV, z: 0 }); world.timestep = 1 / 60; queue = new R.EventQueue(true);
  P.bodyFeet = kin(0.3); P.handBodies = [kin(0.09), kin(0.09)];
});

P.solids = [];      // {type:'box',min,max}|{type:'cyl',x,z,r,y0,y1} + flags: playerOnly, unreachable, soft, sticky, body
P.statics = [];     // rapier bodies to clear on rebuild
P.clear = function () { for (const b of P.statics) world.removeRigidBody(b); P.statics.length = 0; P.solids.length = 0; bySolid.clear(); };
function fixed(x, y, z) { const b = world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z)); P.statics.push(b); return b; }
function staticCollider(desc, body, s) { const m = s.soft ? MAT.soft : MAT.world; const c = world.createCollider(desc.setFriction(m[0]).setRestitution(m[1]).setCollisionGroups(G_STATIC), body); bySolid.set(c.handle, s); return c; }
P.addBox = function (x0, x1, y0, y1, z0, z1, flags = {}) {
  const s = Object.assign({ type: 'box', min: new V3(x0, y0, z0), max: new V3(x1, y1, z1) }, flags);
  P.solids.push(s);
  if (!s.playerOnly) { const b = fixed((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); staticCollider(R.ColliderDesc.cuboid((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2), b, s); s.body = b; }
  return s;
};
P.addCyl = function (x, z, r, y0, y1, flags = {}) {
  const s = Object.assign({ type: 'cyl', x, z, r, y0, y1, min: new V3(x - r, y0, z - r), max: new V3(x + r, y1, z + r) }, flags);
  P.solids.push(s);
  const b = fixed(x, (y0 + y1) / 2, z); staticCollider(R.ColliderDesc.cylinder((y1 - y0) / 2, r), b, s); s.body = b;
  return s;
};
// a ring of thin walls (the pea lid's rim): keeps items in, but is not something the player stands on
P.addRing = function (x, z, r, h, n = 14) {
  const b = fixed(x, 0, z), s = { type: 'ring' };
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, q = new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), -a);
    staticCollider(R.ColliderDesc.cuboid(0.04, h / 2, r * Math.PI / n * 1.05).setTranslation(Math.cos(a) * r, h / 2, Math.sin(a) * r).setRotation(q), b, s); }
};

// ---------- dynamic bodies, behind a small engine-neutral adapter ----------
function vecProxy(get, set) {   // reads come from Rapier; writes (whole or per-axis) go straight back
  return { get x() { return get().x; }, get y() { return get().y; }, get z() { return get().z; },
    set x(v) { const a = get(); set(v, a.y, a.z); }, set y(v) { const a = get(); set(a.x, v, a.z); }, set z(v) { const a = get(); set(a.x, a.y, v); },
    set(x, y, z) { set(x, y, z); return this; } };
}
// tuning values are cannon-style fractions lost per second; Rapier wants a rate
const damp = d => -Math.log(1 - Math.min(0.99, d));
P.makeBody = function (o) {
  const desc = R.RigidBodyDesc.dynamic().setTranslation(o.pos.x, o.pos.y, o.pos.z).setLinearDamping(damp(o.linDamp == null ? 0.03 : o.linDamp)).setAngularDamping(damp(o.angDamp == null ? 0.5 : o.angDamp)).setCcdEnabled(true);
  const rb = world.createRigidBody(desc), m = MAT.item;
  const cd = (o.box ? R.ColliderDesc.cuboid(o.box[0], o.box[1], o.box[2]) : R.ColliderDesc.ball(o.r)).setMass(o.mass || 0.3).setFriction(m[0]).setRestitution(m[1]).setCollisionGroups(G_ITEM)
    .setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(0.5);
  const col = world.createCollider(cd, rb);
  const B = { rb, col, onImpact: o.onImpact || null, prev: { x: 0, y: 0, z: 0 }, enabled: true,
    position: vecProxy(() => rb.translation(), (x, y, z) => rb.setTranslation({ x, y, z }, true)),
    velocity: vecProxy(() => rb.linvel(), (x, y, z) => rb.setLinvel({ x, y, z }, true)),
    angularVelocity: vecProxy(() => rb.angvel(), (x, y, z) => rb.setAngvel({ x, y, z }, true)),
    get quaternion() { return rb.rotation(); },
    setQuaternion(x, y, z, w) { rb.setRotation({ x, y, z, w }, true); },
    get sleeping() { return rb.isSleeping(); },
    wakeUp() { rb.wakeUp(); },
    applyImpulse(v) { rb.applyImpulse({ x: v.x, y: v.y, z: v.z }, true); } };
  byBody.set(col.handle, B); return B;
};
P.enable = function (B, on) { if (B.enabled === on) return; B.enabled = on; B.rb.setEnabled(on); if (on) B.rb.wakeUp(); };
P.destroy = function (B) { if (!B || !B.rb) return; byBody.delete(B.col.handle); world.removeRigidBody(B.rb); B.rb = null; };

// static-world ray: returns {t, point, normal, solid} or null
P.ray = function (o, d, maxT = 100) {
  const hit = world.castRayAndGetNormal(new R.Ray({ x: o.x, y: o.y, z: o.z }, { x: d.x, y: d.y, z: d.z }), maxT, true, undefined, G_RAY);
  if (!hit) return null; const t = hit.timeOfImpact;
  return { t, point: new V3(o.x + d.x * t, o.y + d.y * t, o.z + d.z * t), normal: new V3(hit.normal.x, hit.normal.y, hit.normal.z), solid: bySolid.get(hit.collider.handle) };
};
// top surface height of a solid at (x,z), or null if (x,z) is not over it
P.topAt = function (s, x, z, pad = 0) {
  if (s.type === 'cyl') { const dx = x - s.x, dz = z - s.z; return dx * dx + dz * dz <= (s.r + pad) * (s.r + pad) ? s.y1 : null; }
  return x >= s.min.x - pad && x <= s.max.x + pad && z >= s.min.z - pad && z <= s.max.z + pad ? s.max.y : null;
};
const yTop = s => s.type === 'cyl' ? s.y1 : s.max.y, yBot = s => s.type === 'cyl' ? s.y0 : s.min.y;
P.yTop = yTop; P.yBot = yBot;
// push a vertical circle (x,z,R) out of solid s; returns [dx,dz] or null
P.pushOut = function (s, x, z, R) {
  if (s.type === 'cyl') {
    const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz), m = s.r + R; if (d >= m) return null;
    return d > 1e-6 ? [dx / d * (m - d), dz / d * (m - d)] : [m, 0];
  }
  const cx = clamp(x, s.min.x, s.max.x), cz = clamp(z, s.min.z, s.max.z), dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
  if (d2 >= R * R) return null;
  if (d2 > 1e-10) { const d = Math.sqrt(d2); return [dx / d * (R - d), dz / d * (R - d)]; }
  const c = [[x - s.min.x, -1, 0], [s.max.x - x, 1, 0], [z - s.min.z, 0, -1], [s.max.z - z, 0, 1]].sort((a, e) => a[0] - e[0])[0];
  return [c[1] * (c[0] + R), c[2] * (c[0] + R)];
};
// analytic helpers for interaction shapes
P.rayBox = function (o, d, mn, mx) {
  let t0 = 0, t1 = Infinity;
  for (const a of ['x', 'y', 'z']) {
    const dv = Math.abs(d[a]) < 1e-9 ? 1e-9 : d[a]; let n = (mn[a] - o[a]) / dv, f = (mx[a] - o[a]) / dv; if (n > f) { const s = n; n = f; f = s; }
    if (n > t0) t0 = n; if (f < t1) t1 = f; if (t0 > t1) return null;
  }
  return t0;
};
P.raySphere = function (o, d, c, R) {
  const ox = c.x - o.x, oy = c.y - o.y, oz = c.z - o.z, tca = ox * d.x + oy * d.y + oz * d.z, d2 = ox * ox + oy * oy + oz * oz - tca * tca; if (d2 > R * R) return null;
  const th = Math.sqrt(R * R - d2); if (tca + th < 0) return null; return Math.max(0, tca - th);
};
P.distBox = (p, mn, mx) => Math.hypot(p.x - clamp(p.x, mn.x, mx.x), p.y - clamp(p.y, mn.y, mx.y), p.z - clamp(p.z, mn.z, mx.z));
P.inBox = (p, b) => p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y && p.z >= b.min.z && p.z <= b.max.z;

// kinematic bodies that let the player shove things around (roll peas, nudge crumbs)
function kin(r) { const rb = world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -100, 0)); world.createCollider(R.ColliderDesc.ball(r).setCollisionGroups(G_KIN), rb); return rb; }
P.moveKin = function (b, p) { if (b) b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z }); };
// fixed 60 Hz steps (up to 4 a frame); impacts are measured as the change in a body's velocity across the step that touched it
let acc = 0;
P.step = function (dt) {
  if (!world) return; acc = Math.min(acc + dt, 4 / 60);
  while (acc >= 1 / 60 - 1e-6) {
    acc -= 1 / 60;
    for (const B of byBody.values()) if (B.enabled && !B.rb.isSleeping()) { const v = B.rb.linvel(); B.prev.x = v.x; B.prev.y = v.y; B.prev.z = v.z; }
    world.step(queue);
    queue.drainContactForceEvents(e => {
      for (const [h, other] of [[e.collider1(), e.collider2()], [e.collider2(), e.collider1()]]) {
        const B = byBody.get(h); if (!B || !B.onImpact || !B.rb) continue; const v = B.rb.linvel(), dv = Math.hypot(v.x - B.prev.x, v.y - B.prev.y, v.z - B.prev.z);
        if (dv > 1.7) B.onImpact(dv, bySolid.get(other) || (byBody.get(other) ? { item: true } : null));
      } });
    // rolling resistance: a crumb resting on something loses its roll instead of coasting across the counter
    for (const B of byBody.values()) if (B.enabled && B.rb && !B.rb.isSleeping()) {
      const v = B.rb.linvel(); if (Math.abs(v.y) > 0.25 || Math.abs(v.y - B.prev.y) > 0.2) continue; const hs = Math.hypot(v.x, v.z); if (hs > 3) continue;
      const k = hs < 0.15 ? 0.8 : 0.95, w = B.rb.angvel(); B.rb.setLinvel({ x: v.x * k, y: v.y, z: v.z * k }, false); B.rb.setAngvel({ x: w.x * k, y: w.y * k, z: w.z * k }, false);
    }
  }
};

// walk grid + A* (used by the layout validator, the test bot and critters)
P.buildGrid = function (x0, x1, z0, z1, cell = 0.5) {
  const nx = Math.round((x1 - x0) / cell), nz = Math.round((z1 - z0) / cell), g = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = x0 + (i + 0.5) * cell, z = z0 + (j + 0.5) * cell; let blocked = 0;
    for (const s of P.solids) { if (yTop(s) <= 0.36 || yBot(s) >= 1.4) continue; if (P.pushOut(s, x, z, 0.3)) { blocked = 1; break; } }
    g[j * nx + i] = blocked;
  }
  P.grid = { x0, z0, nx, nz, cell, g };
};
P.cellOf = (x, z) => { const G = P.grid; return [clamp(Math.floor((x - G.x0) / G.cell), 0, G.nx - 1), clamp(Math.floor((z - G.z0) / G.cell), 0, G.nz - 1)]; };
P.path = function (ax, az, bx, bz) {
  const G = P.grid; let [si, sj] = P.cellOf(ax, az), [ti, tj] = P.cellOf(bx, bz);
  const N = G.nx * G.nz, idx = (i, j) => j * G.nx + i;
  const nearestFree = (ci, cj) => { // a blocked start/target (standing on a low prop) snaps to the closest open cell
    if (!G.g[idx(ci, cj)]) return [ci, cj]; let best = null, bd = 1e9;
    for (let j = Math.max(0, cj - 6); j < Math.min(G.nz, cj + 7); j++) for (let i = Math.max(0, ci - 6); i < Math.min(G.nx, ci + 7); i++) if (!G.g[idx(i, j)]) { const d = (i - ci) ** 2 + (j - cj) ** 2; if (d < bd) { bd = d; best = [i, j]; } }
    return best; };
  const sFree = nearestFree(si, sj), tFree = nearestFree(ti, tj); if (!sFree || !tFree) return null;
  const moved = sFree[0] !== si || sFree[1] !== sj; [si, sj] = sFree; [ti, tj] = tFree;
  const cost = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), open = [idx(si, sj)]; cost[idx(si, sj)] = 0;
  const hfun = k => Math.hypot(k % G.nx - ti, Math.floor(k / G.nx) - tj);
  while (open.length) {
    let bi = 0; for (let k = 1; k < open.length; k++) if (cost[open[k]] + hfun(open[k]) < cost[open[bi]] + hfun(open[bi])) bi = k;
    const cur = open.splice(bi, 1)[0]; if (cur === idx(ti, tj)) break;
    const ci = cur % G.nx, cj = Math.floor(cur / G.nx);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= G.nx || nj >= G.nz) continue;
      const k = idx(ni, nj); if (G.g[k] && !(ni === si && nj === sj)) continue; if (di && dj && (G.g[idx(ci + di, cj)] || G.g[idx(ci, cj + dj)])) continue;
      const c = cost[cur] + (di && dj ? 1.414 : 1); if (c < cost[k]) { cost[k] = c; from[k] = cur; if (open.indexOf(k) < 0) open.push(k); }
    }
  }
  if (from[idx(ti, tj)] < 0 && !(si === ti && sj === tj)) return null;
  const pts = []; let k = idx(ti, tj);
  while (k >= 0 && k !== idx(si, sj)) { pts.push([G.x0 + (k % G.nx + 0.5) * G.cell, G.z0 + (Math.floor(k / G.nx) + 0.5) * G.cell]); k = from[k]; }
  pts.reverse(); if (moved) pts.unshift([G.x0 + (si + 0.5) * G.cell, G.z0 + (sj + 0.5) * G.cell]);
  return { pts, len: cost[idx(ti, tj)] * G.cell };
};
})();
