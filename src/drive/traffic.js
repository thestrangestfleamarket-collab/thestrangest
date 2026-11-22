// Ambient traffic: cars that follow the mapped road network, keep their lane, queue behind each other and the player,
// stop for red lights, slow for junctions, and show head and tail lights. Local to each player (not synchronised).
import * as THREE from 'three';

export const DEF_MPH = [15, 28, 30, 38, 25, 42, 25, 45, 25, 68, 40, 10]; // by road class when no limit is mapped
export class Traffic {
  constructor(world, scene, count) {
    this.world = world; this.count = count; this.cars = []; this.enabled = count > 0; if (!count) return;
    // drivable network: residential and above, joined at shared end points
    this.roads = world.roads.filter(r => r.c >= 1 && r.c !== 11 && r.p.length >= 4);
    this.ends = new Map(); const key = (x, z) => Math.round(x * 2) + '_' + Math.round(z * 2);
    for (const r of this.roads) { const p = r.p, n = p.length; r.cum = [0]; for (let i = 2; i < n; i += 2) r.cum.push(r.cum[r.cum.length - 1] + Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1])); r.len = r.cum[r.cum.length - 1];
      for (const [k, end] of [[key(p[0], p[1]), 0], [key(p[n - 2], p[n - 1]), 1]]) { let l = this.ends.get(k); if (!l) this.ends.set(k, l = []); l.push({ r, end }); } r.k0 = key(p[0], p[1]); r.k1 = key(p[n - 2], p[n - 1]); }
    this.roads = this.roads.filter(r => r.len > 12);
    const M = world.mats; this.meshes = []; const geo = world.carGeo || world.geo.carBody[0]; const mats = world.carMats && world.carMats.length ? world.carMats : [M.carPaint];
    const mk = (g, m) => { const im = new THREE.InstancedMesh(g, m, count); im.frustumCulled = false; im.count = 0; im.castShadow = !!world.q.shadows; scene.add(im); return im; };
    // each entry: the meshes of one vehicle type, its size relative to the base coupe (for lamp positions) and how common it is
    for (const m of mats) this.meshes.push({ ims: [mk(geo, m)], sx: 1, sy: 1, sz: 1, wgt: 1.2, len: 4.05 });
    const WG = { sedan: 3, hatch: 3, suv: 3.5, wagon: 2, pickup: 3, van: 1.2, truck: 0.6, police: 0.35 };
    for (const f of world.fleet || []) this.meshes.push({ ims: f.parts.map(p => mk(p.geo, p.mat)), sx: f.info.w / 1.99, sy: Math.min(1.5, f.info.h / 1.46), sz: f.info.len / 4.08, wgt: WG[f.info.kind] || 1, len: f.info.len, kind: f.info.kind });
    this.wsum = this.meshes.reduce((a, m) => a + m.wgt, 0); this._ls = new THREE.Vector3(); this._lm = new THREE.Matrix4();
    // lamps: two white quads in front, two red behind (bright enough to bloom)
    const lg = []; const q = (x, y, z, w, h, c, back) => { const g = new THREE.PlaneGeometry(w, h); if (!back) g.rotateY(Math.PI); g.translate(x, y, z); const n = g.attributes.position.count; const col = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.set(c, i * 3); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; };
    for (const sx of [-0.6, 0.6]) { lg.push(q(sx, 0.66, -2.04, 0.3, 0.12, [9, 8.6, 7.6], false)); lg.push(q(sx, 0.8, 2.04, 0.34, 0.1, [1.6, 0.03, 0.02], true)); }
    const merged = mergeColored(lg); this.lights = new THREE.InstancedMesh(merged, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), count); this.lights.frustumCulled = false; this.lights.count = 0; scene.add(this.lights);
    const extra = (parts) => { const im = new THREE.InstancedMesh(mergeColored(parts), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), count); im.frustumCulled = false; im.count = 0; scene.add(im); return im; };
    this.brakes = extra([-0.6, 0.6].map(sx => q(sx, 0.8, 2.045, 0.36, 0.12, [9, 0.2, 0.08], true)));
    this.blinkL = extra([q(-0.8, 0.66, -2.045, 0.14, 0.12, [9, 4, 0.2], false), q(-0.8, 0.8, 2.046, 0.14, 0.1, [9, 4, 0.2], true)]); this.blinkR = extra([q(0.8, 0.66, -2.045, 0.14, 0.12, [9, 4, 0.2], false), q(0.8, 0.8, 2.046, 0.14, 0.1, [9, 4, 0.2], true)]);
    const pg = new THREE.PlaneGeometry(7, 16); pg.rotateX(-Math.PI / 2); pg.translate(0, 0.12, -10.5); this.pools = new THREE.InstancedMesh(pg, new THREE.MeshBasicMaterial({ map: M.pool.map, color: new THREE.Color(0.9, 0.86, 0.74), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -9, polygonOffsetUnits: -9 }), count); this.pools.frustumCulled = false; this.pools.count = 0; this.pools.renderOrder = 3; scene.add(this.pools);
    // headlight glare: a soft bloom sprite on each lamp, seen from far away at night
    { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 6), 3)); g.setDrawRange(0, 0); this.glare = new THREE.Points(g, new THREE.PointsMaterial({ map: M.pool.map, size: 2.6, sizeAttenuation: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(1, 0.96, 0.86) })); this.glare.frustumCulled = false; scene.add(this.glare); }
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._p = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1); this._e = new THREE.Euler(0, 0, 0, 'YXZ'); this._col = new THREE.Color(); this._o = {};
  }
  pointAt(r, s, out) { const c = r.cum; let lo = 0, hi = c.length - 1; if (s <= 0) { lo = 0; hi = 1; } else if (s >= r.len) { lo = c.length - 2; hi = lo + 1; } else while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
    const p = r.p, ax = p[lo * 2], az = p[lo * 2 + 1], bx = p[hi * 2], bz = p[hi * 2 + 1]; const l = (c[hi] - c[lo]) || 1; const t = Math.max(0, Math.min(1, (s - c[lo]) / l)); out.x = ax + (bx - ax) * t; out.z = az + (bz - az) * t; out.dx = (bx - ax) / l; out.dz = (bz - az) / l; return out; }
  laneOffset(r, dir, lane) { if (r.o) { const lw = Math.min(3.7, r.w / Math.max(1, r.l)); return (-(r.l - 1) / 2 + lane) * lw; } const per = Math.max(1, Math.floor(r.l / 2)); const lw = Math.min(3.6, r.w / 2 / per); return dir * (lw * (0.5 + lane) + (r.c === 1 ? 0.3 : 0.15)); }
  spawn(px, pz) {
    for (let tries = 0; tries < 30; tries++) { const r = this.roads[(Math.random() * this.roads.length) | 0]; const s = Math.random() * r.len; const o = this.pointAt(r, s, this._o); const d = Math.hypot(o.x - px, o.z - pz); if (d < 110 || d > 430) continue;
      const dir = r.o ? 1 : (Math.random() < 0.5 ? 1 : -1); const per = r.o ? r.l : Math.max(1, Math.floor(r.l / 2)); const lane = (Math.random() * per) | 0;
      if (this.cars.some(c => c.r === r && c.dir === dir && c.lane === lane && Math.abs(c.s - s) < 14)) continue;
      const lim = (r.s || DEF_MPH[r.c] || 28) * 0.447; const v = Math.random(); const col = v < 0.3 ? [0.82, 0.82, 0.84] : v < 0.5 ? [0.03, 0.03, 0.035] : v < 0.68 ? [0.3, 0.31, 0.33] : v < 0.8 ? [0.45, 0.04, 0.04] : v < 0.9 ? [0.05, 0.1, 0.3] : [0.5, 0.48, 0.42];
      return { r, s, dir, lane, v: lim * 0.8, cruise: lim * (0.9 + Math.random() * 0.12), type: this.pickType(), col, ctrlDone: -1, ctrlWait: 0, turn: 0, x: o.x, y: 0, z: o.z, yaw: 0, off: this.laneOffset(r, dir, lane), yInit: false, wait: 0 }; }
    return null;
  }
  pickType() { let x = Math.random() * this.wsum; for (let i = 0; i < this.meshes.length; i++) { x -= this.meshes[i].wgt; if (x <= 0) return i; } return 0; }
  nextRoad(c) { const k = c.dir > 0 ? c.r.k1 : c.r.k0; const opts = (this.ends.get(k) || []).filter(e => e.r !== c.r && (e.end === 0 || !e.r.o) && e.r.len > 12); if (!opts.length) return null; // weight bigger roads
    let tot = 0; for (const e of opts) tot += 1 + e.r.c; let x = Math.random() * tot; for (const e of opts) { x -= 1 + e.r.c; if (x <= 0) return e; } return opts[0]; }
  update(dt, player, night) {
    if (!this.enabled) return []; const W = this.world; const px = player.x, pz = player.z;
    // population
    for (let i = this.cars.length - 1; i >= 0; i--) { const c = this.cars[i]; if (Math.hypot(c.x - px, c.z - pz) > 520 || c.dead) this.cars.splice(i, 1); }
    let budget = 2; while (this.cars.length < this.count && budget-- > 0) { const c = this.spawn(px, pz); if (c) this.cars.push(c); else break; }
    const o = this._o;
    for (const c of this.cars) {
      const fx0 = Math.sin(c.yaw) * -1, fz0 = Math.cos(c.yaw) * -1; // current forward
      let target = c.cruise; const remain = c.dir > 0 ? c.r.len - c.s : c.s;
      if (remain < 45) { if (!c.next) { c.next = this.nextRoad(c) || 'none'; c.turn = 0; if (c.next !== 'none') { const a = this.pointAt(c.r, c.dir > 0 ? c.r.len - 1 : 1, o); const ax = a.dx * c.dir, az = a.dz * c.dir; const n = c.next; const b = this.pointAt(n.r, n.end === 0 ? 6 : n.r.len - 6, {}); const bx = b.dx * (n.end === 0 ? 1 : -1), bz = b.dz * (n.end === 0 ? 1 : -1); const cr = ax * bz - az * bx; if (Math.abs(cr) > 0.4) c.turn = cr > 0 ? 1 : -1; } } // signal about 45 m before the turn
        if (remain < 22) target = Math.min(target, c.next === 'none' ? 3 : c.turn ? 5.0 : target); } else c.turn = 0;
      // slow for bends: lateral acceleration kept near 2.2 m/s^2
      { const s2 = Math.max(0, Math.min(c.r.len, c.s + c.dir * 16)); const d1x = o.dx, d1z = o.dz; this.pointAt(c.r, c.s, o); const hx = o.dx, hz = o.dz; this.pointAt(c.r, s2, o); const bend = Math.acos(Math.max(-1, Math.min(1, hx * o.dx + hz * o.dz))); if (bend > 0.05) target = Math.min(target, Math.max(3.5, Math.sqrt(2.2 * 16 / bend))); }
      // stop signs: come to a complete stop, wait your turn, then go. Yield signs: slow, give way to anything close and moving
      const ctl = W.controlAhead ? W.controlAhead(c.x, c.z, fx0, fz0, 34) : null;
      if (ctl && ctl.id !== c.ctrlDone) { const busy = this.cars.some(d => d !== c && d.v > 1.5 && Math.hypot(d.x - c.x, d.z - c.z) < 13 && ((d.x - c.x) * fx0 + (d.z - c.z) * fz0) > -2) || (player.speed > 1.5 && Math.hypot(px - c.x, pz - c.z) < 13);
        if (ctl.kind === 0) { if (ctl.dist < c.v * c.v / 4.4 + 5) target = 0; if (c.v < 0.2 && ctl.dist < 8) { c.ctrlWait += dt; if (c.ctrlWait > 1.4 && !busy) { c.ctrlDone = ctl.id; c.ctrlWait = 0; } } }
        else { target = Math.min(target, 4.5); if (busy && ctl.dist < 9) target = 0; if (ctl.dist < 3) c.ctrlDone = ctl.id; } }
      // red or yellow light ahead
      const sig = W.signalAhead(c.x, c.z, fx0, fz0); if (sig && sig.state !== 2 && sig.dist < c.v * c.v / 5 + 9) target = sig.dist < 4.5 && sig.state === 1 ? target : 0;
      // vehicles ahead (traffic and the player)
      let gap = 1e9; const chk = (ox, oz, ov) => { const dx = ox - c.x, dz = oz - c.z; const ahead = dx * fx0 + dz * fz0; if (ahead < 1 || ahead > 45) return; const lat = Math.abs(dx * fz0 - dz * fx0); if (lat > 1.9) return; if (ahead < gap) { gap = ahead; c.lead = ov; } };
      for (const d of this.cars) if (d !== c) chk(d.x, d.z, d.v); chk(px, pz, player.speed || 0); if (this.peds) for (const f of this.peds) { const dd = Math.hypot(f.x - c.x, f.z - c.z); if (dd < 30) { const dx = f.x - c.x, dz = f.z - c.z; const ahead = dx * fx0 + dz * fz0; if (ahead > 1 && ahead < 22 && Math.abs(dx * fz0 - dz * fx0) < 2.4 && ahead < gap) { gap = ahead; c.lead = 0; } } }
      if (gap < 1e8) { const safe = 5.5 + c.v * 1.3 + (this.meshes[c.type % this.meshes.length].len - 4) * 0.6; if (gap < safe) target = Math.min(target, Math.max(0, (c.lead || 0) * (gap / safe) - (gap < 6.5 ? 3 : 0))); }
      const acc = target > c.v ? 1.7 : -Math.min(6, 2.2 + (c.v - target) * 0.9); c.v = Math.max(0, c.v + acc * dt); if (target === 0 && c.v < 0.25) c.v = 0;
      c.wait = c.v < 0.1 ? c.wait + dt : 0; if (c.wait > 45) c.dead = true;
      c.s += c.dir * c.v * dt;
      if ((c.dir > 0 && c.s >= c.r.len) || (c.dir < 0 && c.s <= 0)) { const n = c.next && c.next !== 'none' ? c.next : this.nextRoad(c); c.next = null; if (!n) { c.dead = true; continue; } const over = c.dir > 0 ? c.s - c.r.len : -c.s; c.r = n.r; c.dir = n.end === 0 ? 1 : -1; c.s = n.end === 0 ? over : n.r.len - over; const per = c.r.o ? c.r.l : Math.max(1, Math.floor(c.r.l / 2)); c.lane = Math.min(c.lane, per - 1); c.tOff = this.laneOffset(c.r, c.dir, c.lane); c.cruise = (c.r.s || DEF_MPH[c.r.c] || 28) * 0.447 * (0.86 + Math.random() * 0.16); }
      else c.tOff = this.laneOffset(c.r, c.dir, c.lane);
      c.off += (c.tOff - c.off) * Math.min(1, dt * 1.2);
      this.pointAt(c.r, c.s, o); const tx = o.x + (-o.dz) * c.off, tz = o.z + o.dx * c.off; // right of the road's own direction
      // smooth the path through junctions
      const k = Math.min(1, dt * (2.5 + c.v * 0.35)); const nx = c.yInit ? c.x + (tx - c.x) * k : tx, nz = c.yInit ? c.z + (tz - c.z) * k : tz; const mvx = nx - c.x, mvz = nz - c.z;
      const wantYaw = Math.atan2(-o.dx * c.dir, -o.dz * c.dir); let dy = wantYaw - c.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; c.yaw = c.yInit ? c.yaw + dy * Math.min(1, dt * 3.5) : wantYaw; c.x = nx; c.z = nz;
      const gy = W.surfaceY(c.x, c.z, c.yInit ? c.y + 1.2 : 1e9); c.y = c.yInit ? c.y + (gy - c.y) * Math.min(1, dt * 10) : gy; c.yInit = true; c.braking = acc < -1.2 || c.v < 0.3;
    }
    // draw
    const cnt = this.meshes.map(() => 0); let li = 0, bi = 0, bl = 0, br = 0; const circles = []; const blinkOn = (performance.now() % 740) < 370;
    for (const c of this.cars) { if (c.dead) continue; this._e.set(0, c.yaw, 0); this._q.setFromEuler(this._e); this._m.compose(this._p.set(c.x, c.y, c.z), this._q, this._s); const k = c.type % this.meshes.length; const ms = this.meshes[k]; const i = cnt[k]++; for (const im of ms.ims) im.setMatrixAt(i, this._m);
      this._lm.compose(this._p, this._q, this._ls.set(ms.sx, ms.sy, ms.sz)); // lamps sit on the same car, stretched to its size
      this.lights.setMatrixAt(li, this._lm); this.pools.setMatrixAt(li, this._m); li++; if (c.braking) this.brakes.setMatrixAt(bi++, this._lm); if (blinkOn && c.turn > 0) this.blinkR.setMatrixAt(br++, this._lm); if (blinkOn && c.turn < 0) this.blinkL.setMatrixAt(bl++, this._lm);
      { const ga = this.glare.geometry.attributes.position.array; const fxx = -Math.sin(c.yaw), fzz = -Math.cos(c.yaw); const hl2 = ms.len / 2 + 0.03; for (const sd of [-1, 1]) { const o = (li - 1) * 6 + (sd > 0 ? 3 : 0); ga[o] = c.x + fxx * hl2 + fzz * -0.6 * sd * ms.sx; ga[o + 1] = c.y + 0.66 * ms.sy; ga[o + 2] = c.z + fzz * hl2 - fxx * -0.6 * sd * ms.sx; } }
      const d = Math.hypot(c.x - px, c.z - pz); if (d < 35) { const sx = Math.sin(c.yaw), cz = Math.cos(c.yaw); const hl = ms.len * 0.27; circles.push([c.x - sx * hl, c.z - cz * hl, 0.95 * Math.max(1, ms.sx * 0.9), c.y + 0.5], [c.x + sx * hl, c.z + cz * hl, 0.95 * Math.max(1, ms.sx * 0.9), c.y + 0.5]); if (ms.len > 6) circles.push([c.x, c.z, 1.2, c.y + 0.5]); } }
    this.meshes.forEach((ms, k) => { for (const im of ms.ims) { im.count = cnt[k]; im.instanceMatrix.needsUpdate = true; } });
    this.glare.geometry.setDrawRange(0, night ? li * 2 : 0); this.glare.geometry.attributes.position.needsUpdate = true;
    this.lights.count = li; this.lights.instanceMatrix.needsUpdate = true; this.pools.count = night ? li : 0; this.pools.instanceMatrix.needsUpdate = true;
    for (const [im, n] of [[this.brakes, bi], [this.blinkL, bl], [this.blinkR, br]]) { im.count = n; im.instanceMatrix.needsUpdate = true; }
    return circles;
  }
}
function mergeColored(list) { let vc = 0, ic = 0; for (const g of list) { vc += g.attributes.position.count; ic += g.index.count; } const pos = new Float32Array(vc * 3), col = new Float32Array(vc * 3), idx = new Uint16Array(ic); let vo = 0, io = 0; for (const g of list) { pos.set(g.attributes.position.array, vo * 3); col.set(g.attributes.color.array, vo * 3); for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.array[i] + vo; io += g.index.count; vo += g.attributes.position.count; } const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.BufferAttribute(pos, 3)); o.setAttribute('color', new THREE.BufferAttribute(col, 3)); o.setIndex(new THREE.BufferAttribute(idx, 1)); return o; }
