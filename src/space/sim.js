// SPACE FLEET's rules: the whole battle with no screen or network (ships that fly and fight on their own, orders, building, relays, the win); the host runs it, ten steps a second
const DT = 0.1, CAP = 30, QMAX = 5, BX = 1, BY = 0.4, BZ = 1.35;
const MOTHER = 0, FIGHTER = 1, FRIGATE = 2, CRUISER = 3, TURRET = 4, MINE = 5;
// cls: 0 small, 1 medium, 2 large; w: the weapon (0 guns, 1 cannon, 2 heavy beam, 3 the mine's blast); time in steps
const TYPES = [
  { name: 'MOTHERSHIP', hp: 4000, speed: 0, range: 0.34, dmg: 16, cd: 4, cls: 2, r: 0.17, cost: 0, time: 0, w: 1, acc: 0, turn: 0, grip: 1, sh: 900 },
  { name: 'FIGHTER', hp: 70, speed: 0.24, range: 0.13, dmg: 7, cd: 3, cls: 0, r: 0.02, cost: 50, time: 40, w: 0, acc: 0.5, turn: 3.4, grip: 0.4, sh: 0 },
  { name: 'FRIGATE', hp: 260, speed: 0.12, range: 0.22, dmg: 22, cd: 6, cls: 1, r: 0.045, cost: 120, time: 80, w: 1, acc: 0.12, turn: 1.2, grip: 0.2, sh: 90 },
  { name: 'CRUISER', hp: 800, speed: 0.07, range: 0.3, dmg: 110, cd: 14, cls: 2, r: 0.08, cost: 300, time: 160, w: 2, acc: 0.04, turn: 0.55, grip: 0.1, sh: 260 },
  { name: 'TURRET', hp: 420, speed: 0.035, range: 0.33, dmg: 30, cd: 6, cls: 1, r: 0.032, cost: 150, time: 100, w: 1, acc: 0.03, turn: 0.7, grip: 0.15, sh: 160 },
  { name: 'MINE', hp: 40, speed: 0.06, range: 0.05, dmg: 260, cd: 0, cls: 0, r: 0.012, cost: 40, time: 30, w: 3, acc: 0.1, turn: 2, grip: 0.25, sh: 0 },
];
// what each weapon does to each size: fighters wear down the big ships, cannon swats fighters, the heavy beam breaks hulls and cannot track fighters
const MUL = [[1, 0.6, 0.6], [1.3, 1, 0.6], [0.15, 1, 1.2], [1, 1, 1]];
const NODES = [[0, 0, 0], [-0.62, 0.14, 0.42], [0.62, -0.14, 0.42], [0.62, 0.14, -0.42], [-0.62, -0.14, -0.42]];
const NODE_R = 0.16, BASE_INC = 8, NODE_INC = 5, START = 300, MINE_SEE = 0.12, BLAST = 0.09;
const HOME = [[0, 0, 1.12], [0, 0, -1.12]];
const MASS = [1e9, 1, 8, 40, 12, 0.5], BOOM = [2, 6, 20];   // how heavy each kind is, and how hard each size goes up
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// the two navies: the same six kinds of ship, each navy's own hulls and its own bent (the Admiralty's stronger force fields; the Corsairs' lighter, faster, cheaper ships)
const NAVY = [{ name: 'ADMIRALTY', hp: 1, sh: 1.3, speed: 1, cost: 1 }, { name: 'CORSAIRS', hp: 0.85, sh: 0.7, speed: 1.15, cost: 0.88 }];
const table = f => TYPES.map((t, i) => (i === MOTHER ? { ...t } : { ...t, hp: Math.round(t.hp * NAVY[f].hp), sh: Math.round(t.sh * NAVY[f].sh), speed: t.speed * NAVY[f].speed, acc: t.acc * NAVY[f].speed, cost: Math.round(t.cost * NAVY[f].cost / 5) * 5 }));

class Sim {
  // fac: which navy each side flies (0 ADMIRALTY, 1 CORSAIRS)
  constructor(fac = [0, 1]) {
    this.fac = [fac[0] ? 1 : 0, fac[1] ? 1 : 0]; this.T = this.fac.map(table); this.tick = 0; this.next = 1; this.winner = -1; this.units = []; this.byId = new Map(); this.ev = [];
    this.credits = [START, START]; this.queue = [[], []]; this.nodes = NODES.map(p => ({ p, owner: -1, prog: 0 }));
    this.rally = [[0, 0, 0.62], [0, 0, -0.62]];
    for (let s = 0; s < 2; s++) { this.spawn(MOTHER, s, HOME[s]);
      for (let i = 0; i < 3; i++) this.spawn(FIGHTER, s, [(i - 1) * 0.1, 0.05, HOME[s][2] * 0.6]);
      this.spawn(FRIGATE, s, [0, -0.05, HOME[s][2] * 0.5]); }
  }
  spawn(type, side, p) {
    const u = { id: this.next++, type, side, x: p[0], y: p[1], z: p[2], vx: 0, vy: 0, vz: 0, yaw: side ? 0 : Math.PI, pitch: 0, hp: this.T[side][type].hp, sh: this.T[side][type].sh, calm: 0, cool: 0,
      k: 0, gx: p[0], gy: p[1], gz: p[2], ax: p[0], ay: p[1], az: p[2], tid: 0 };   // k: 0 guard at a, 1 move to g, 2 attack tid
    this.units.push(u); this.byId.set(u.id, u); return u;
  }
  count(side) { let n = 0; for (const u of this.units) if (u.side === side && u.type !== MOTHER) n++; return n; }
  income(side) { let n = BASE_INC; for (const d of this.nodes) if (d.owner === side) n += NODE_INC; return n; }
  build(side, type) {
    const T = this.T[side][type]; if (!T || !T.cost || this.winner >= 0) return false; const q = this.queue[side];
    if (this.credits[side] < T.cost || q.length >= QMAX || this.count(side) + q.length >= CAP) return false;
    this.credits[side] -= T.cost; q.push({ type, left: T.time }); return true;
  }
  // k: 0 move to p (the group keeps its shape), 1 attack tid; the mothership moved is the rally point moved
  order(side, ids, k, p, tid) {
    if (this.winner >= 0) return; const us = [];
    for (const id of ids) { const u = this.byId.get(id); if (u && u.side === side) us.push(u); }
    if (!us.length) return;
    if (k === 1) { const t = this.byId.get(tid); if (!t || t.side === side) return; for (const u of us) if (u.type !== MOTHER) { u.k = 2; u.tid = tid; } return; }
    const g = [clamp(p[0], -BX, BX), clamp(p[1], -BY, BY), clamp(p[2], -BZ, BZ)];
    let cx = 0, cy = 0, cz = 0, n = 0; for (const u of us) if (u.type !== MOTHER) { cx += u.x; cy += u.y; cz += u.z; n++; }
    if (!n) { this.rally[side] = g; return; }
    cx /= n; cy /= n; cz /= n;
    for (const u of us) { if (u.type === MOTHER) continue; let ox = u.x - cx, oy = u.y - cy, oz = u.z - cz; const l = Math.hypot(ox, oy, oz), m = l > 0.15 ? 0.15 / l : 1;
      u.k = 1; u.tid = 0; u.gx = clamp(g[0] + ox * m, -BX, BX); u.gy = clamp(g[1] + oy * m, -BY, BY); u.gz = clamp(g[2] + oz * m, -BZ, BZ); }
  }
  // the nearest enemy this ship should shoot, within reach d (mines are seen only from close)
  pick(u, d) {
    const T = this.T[u.side][u.type]; let best = null, bs = 1e9;
    for (const e of this.units) { if (e.side === u.side || e.hp <= 0) continue; const dist = Math.hypot(e.x - u.x, e.y - u.y, e.z - u.z) - this.T[e.side][e.type].r;
      if (dist > d || (e.type === MINE && dist > MINE_SEE)) continue; const s = (dist + 0.02) / MUL[T.w][this.T[e.side][e.type].cls]; if (s < bs) { bs = s; best = e; } }
    return best;
  }
  step() {
    if (this.winner >= 0) return; this.tick++; const US = this.units;
    for (let s = 0; s < 2; s++) { this.credits[s] = Math.min(9999, this.credits[s] + this.income(s) * DT); const q = this.queue[s];
      if (q.length && --q[0].left <= 0) { const it = q.shift(), h = HOME[s], a = this.tick * 0.7 + s, u = this.spawn(it.type, s, [h[0] + (Math.cos(a) < 0 ? -0.16 : 0.16), Math.sin(a * 1.3) * 0.06, h[2] * 0.9 + Math.sin(a) * 0.08]);
        const r = this.rally[s]; u.k = 1; u.gx = clamp(r[0] + Math.cos(a) * 0.07, -BX, BX); u.gy = clamp(r[1] + Math.sin(a * 1.3) * 0.04, -BY, BY); u.gz = clamp(r[2] + Math.sin(a) * 0.07, -BZ, BZ); this.ev.push(3, s, it.type); } }
    for (const u of US) {
      if (u.hp <= 0) continue; const T = this.T[u.side][u.type]; let tx = u.x, ty = u.y, tz = u.z, go = false, tgt = null;
      if (u.k === 2) { tgt = this.byId.get(u.tid); if (!tgt || tgt.hp <= 0) { tgt = null; u.k = 0; u.ax = u.x; u.ay = u.y; u.az = u.z; } }
      if (u.k === 1) { tx = u.gx; ty = u.gy; tz = u.gz; go = true; if (Math.hypot(tx - u.x, ty - u.y, tz - u.z) < 0.02) { u.k = 0; u.ax = tx; u.ay = ty; u.az = tz; go = false; } }
      // on guard a ship takes on what comes near and goes back to its post; told to move it only shoots what it passes
      let foe = tgt; const mine = u.type === MINE;
      if (!foe) foe = this.pick(u, u.k === 1 ? T.range : mine ? 0.15 : Math.max(T.range * 1.5, 0.3));
      if (u.k === 0) { if (foe && Math.hypot(u.x - u.ax, u.y - u.ay, u.z - u.az) > (mine ? 0.2 : 0.5)) foe = null;
        if (!foe && Math.hypot(u.x - u.ax, u.y - u.ay, u.z - u.az) > 0.03) { tx = u.ax; ty = u.ay; tz = u.az; go = true; } }
      if (foe && u.k !== 1) { const d = Math.hypot(foe.x - u.x, foe.y - u.y, foe.z - u.z), reach = T.range + this.T[foe.side][foe.type].r;
        if (mine) { tx = foe.x; ty = foe.y; tz = foe.z; go = true; }
        else if (u.type === FIGHTER) { const a = this.tick * 0.22 + u.id * 1.7, rr = reach * 0.75; tx = foe.x + Math.cos(a) * rr; ty = foe.y + Math.sin(a * 0.7) * rr * 0.4; tz = foe.z + Math.sin(a) * rr; go = true; }
        else if (d > reach * 0.85) { tx = foe.x; ty = foe.y; tz = foe.z; go = true; } else go = false; }
      // fly: a ship turns its nose at its own rate and thrusts along it, so it swings round in an arc, carries its way and brakes to arrive; the last few lengths are on manoeuvring jets
      let wx = 0, wy = 0, wz = 0, fx = 0, fy = 0, fz = 0;
      if (go && T.speed) { const dx = tx - u.x, dy = ty - u.y, dz = tz - u.z, d = Math.hypot(dx, dy, dz) || 1e-6; fx = dx / d; fy = dy / d; fz = dz / d;
        const cp = Math.cos(u.pitch), nx = Math.sin(u.yaw) * cp, ny = Math.sin(u.pitch), nz = Math.cos(u.yaw) * cp, al = Math.max(T.cls === 0 ? 0.45 : 0.08, nx * fx + ny * fy + nz * fz);
        const sp = Math.min(T.speed, Math.sqrt(2 * T.acc * d)) * al, near = clamp(1 - d / 0.05, 0, 1), js = Math.min(T.speed * 0.4, d / DT * 0.5);
        wx = nx * sp * (1 - near) + fx * js * near; wy = ny * sp * (1 - near) + fy * js * near; wz = nz * sp * (1 - near) + fz * js * near; }
      const b = T.grip; u.vx += (wx - u.vx) * b; u.vy += (wy - u.vy) * b; u.vz += (wz - u.vz) * b;
      // shoot
      if (u.cool > 0) u.cool--;
      const shot = foe && foe.hp > 0 ? foe : null, sd = shot ? Math.hypot(shot.x - u.x, shot.y - u.y, shot.z - u.z) - this.T[shot.side][shot.type].r : 9;
      if (mine) { if (shot && sd < T.range) { u.hp = 0; u.boom = 1; } }
      else if (shot && sd <= T.range && u.cool <= 0) { u.cool = T.cd; shot.hurt = (shot.hurt || 0) + T.dmg * MUL[T.w][this.T[shot.side][shot.type].cls]; this.ev.push(1, u.id, shot.id, T.w | (shot.sh > 0 ? 8 : 0));
        const kd = Math.hypot(shot.x - u.x, shot.y - u.y, shot.z - u.z) || 1, kk = T.dmg * 0.0006 / MASS[shot.type]; shot.vx += (shot.x - u.x) / kd * kk; shot.vy += (shot.y - u.y) / kd * kk; shot.vz += (shot.z - u.z) / kd * kk; }   // the hit knocks its target back
      // the nose swings to where it is going, or to what it shoots when it holds still
      if (!(go && Math.hypot(tx - u.x, ty - u.y, tz - u.z) > 0.03) && shot) { fx = shot.x - u.x; fy = shot.y - u.y; fz = shot.z - u.z; }
      const fl = Math.hypot(fx, fy, fz);
      if (fl > 1e-4 && T.speed) { const wantP = Math.asin(clamp(fy / fl, -1, 1)) * 0.8, m = T.turn * DT; let dy = Math.atan2(fx, fz) - u.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        u.yaw += clamp(dy, -m, m); u.pitch += clamp(wantP - u.pitch, -m, m); }
      else u.pitch *= 0.9;
    }
    // ships of one side keep clear of each other
    for (let i = 0; i < US.length; i++) { const a = US[i]; if (a.hp <= 0 || !this.T[a.side][a.type].speed) continue;
      for (let j = 0; j < US.length; j++) { const o = US[j]; if (i === j || o.side !== a.side || o.hp <= 0) continue;
        const dx = a.x - o.x, dy = a.y - o.y, dz = a.z - o.z, d = Math.hypot(dx, dy, dz), need = (this.T[a.side][a.type].r + this.T[o.side][o.type].r) * 1.1;
        if (d < need && d > 1e-5) { const p = (need - d) / d * (this.T[o.side][o.type].speed ? 0.5 : 1) * 2; a.vx += dx * p; a.vy += dy * p; a.vz += dz * p; } } }
    for (const u of US) { if (u.hp <= 0) continue; u.x = clamp(u.x + u.vx * DT, -BX, BX); u.y = clamp(u.y + u.vy * DT, -BY, BY); u.z = clamp(u.z + u.vz * DT, -BZ, BZ); }
    // mines go off, damage lands, the dead leave
    for (const u of US) if (u.boom) for (const e of US) if (e.side !== u.side && e.hp > 0 && Math.hypot(e.x - u.x, e.y - u.y, e.z - u.z) - this.T[e.side][e.type].r < BLAST) e.hurt = (e.hurt || 0) + TYPES[MINE].dmg;
    let dead = false;
    // a force field takes the damage first, and comes back after six quiet seconds
    for (const u of US) { if (u.hurt) { const a = Math.min(u.sh, u.hurt); u.sh -= a; u.hp -= u.hurt - a; u.hurt = 0; u.calm = 0; } else if (u.sh < this.T[u.side][u.type].sh && ++u.calm > 60) u.sh = Math.min(this.T[u.side][u.type].sh, u.sh + this.T[u.side][u.type].sh * 0.02); if (u.hp <= 0) { dead = true; this.ev.push(2, u.id, u.boom ? 3 : this.T[u.side][u.type].cls, 0); this.byId.delete(u.id); if (u.type === MOTHER && this.winner < 0) this.winner = 1 - u.side; } }
    // a ship that blows up shoves the ships around it, the light ones most
    if (dead) for (const u of US) { if (u.hp > 0) continue; const E = u.type === MOTHER ? 60 : u.boom ? 10 : BOOM[this.T[u.side][u.type].cls];
      for (const e of US) { if (e.hp <= 0 || !this.T[e.side][e.type].speed) continue; const dx = e.x - u.x, dy = e.y - u.y, dz = e.z - u.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > 0.09) continue; const d = Math.sqrt(d2) || 1e-4, dv = Math.min(0.25, E * 0.0006 / (MASS[e.type] * (d2 + 0.003))); e.vx += dx / d * dv; e.vy += dy / d * dv; e.vz += dz / d * dv; } }
    if (dead) this.units = US.filter(u => u.hp > 0);
    if (this.byId.size && this.winner >= 0 && !this.units.some(u => u.type === MOTHER)) this.winner = 2;   // both at once: a draw
    // relays: held by the only side with ships beside them
    for (let i = 0; i < this.nodes.length; i++) { const d = this.nodes[i]; let n0 = 0, n1 = 0;
      for (const u of this.units) if (u.type !== MINE && Math.hypot(u.x - d.p[0], u.y - d.p[1], u.z - d.p[2]) < NODE_R) { if (u.side) n1++; else n0++; }
      const dir = n0 && !n1 ? -1 : n1 && !n0 ? 1 : 0; if (!dir) continue; d.prog = clamp(d.prog + dir * 2, -100, 100);
      const own = d.prog <= -100 ? 0 : d.prog >= 100 ? 1 : d.owner >= 0 && Math.sign(d.prog) !== (d.owner ? 1 : -1) ? -1 : d.owner;
      if (own !== d.owner) { d.owner = own; if (own >= 0) this.ev.push(4, i, own); } }
  }
  // what a headset needs to draw the battle, as whole numbers; the steps' happenings ride along and are cleared
  snap() {
    const a = [this.tick, this.winner, this.credits[0] | 0, this.credits[1] | 0, this.income(0), this.income(1), this.fac[0], this.fac[1]];
    for (let s = 0; s < 2; s++) { const q = this.queue[s]; a.push(q.length); for (const it of q) a.push(it.type, Math.round(1000 * (1 - it.left / TYPES[it.type].time))); }
    a.push(this.nodes.length); for (const d of this.nodes) a.push(d.owner + 1, d.prog);
    a.push(this.units.length);
    for (const u of this.units) a.push(u.id, u.type | (u.side << 3) | (u.k << 4), Math.round(u.x * 1000), Math.round(u.y * 1000), Math.round(u.z * 1000), Math.round(u.yaw * 100), Math.round(u.pitch * 100), Math.max(1, Math.round(1000 * u.hp / this.T[u.side][u.type].hp)));
    a.push(this.ev.length); for (const e of this.ev) a.push(e); this.ev.length = 0; return a;
  }
  // a battle carried on from the last picture a headset had (its host left): every ship holds where it was
  static from(v) {
    const s = new Sim(v.fac); s.units = []; s.byId.clear(); s.tick = v.tick; s.credits = [v.credits[0], v.credits[1]]; let top = 0;
    for (const u of v.units.values()) { const n = s.spawn(u.type, u.side, [u.x, u.y, u.z]); s.byId.delete(n.id); n.id = u.id; s.byId.set(n.id, n); n.yaw = u.yaw; n.pitch = u.pitch; n.hp = Math.max(1, u.hp * s.T[u.side][u.type].hp); top = Math.max(top, u.id); }
    s.next = top + 1; v.nodes.forEach((d, i) => { if (s.nodes[i]) { s.nodes[i].owner = d.owner; s.nodes[i].prog = d.prog; } }); return s;
  }
}
// read a picture back (the other half of snap); null when it is not one
function read(a) {
  if (!Array.isArray(a) || a.length < 10) return null; let i = 0; const o = { tick: a[i++], winner: a[i++], credits: [a[i++], a[i++]], income: [a[i++], a[i++]], fac: [a[i++] ? 1 : 0, a[i++] ? 1 : 0], queue: [[], []], nodes: [], units: [], ev: [] };
  for (let s = 0; s < 2; s++) { const n = a[i++]; if (!(n >= 0 && n <= QMAX)) return null; for (let j = 0; j < n; j++) o.queue[s].push({ type: a[i++], done: a[i++] / 1000 }); }
  let n = a[i++]; if (!(n >= 0 && n <= 8)) return null; for (let j = 0; j < n; j++) o.nodes.push({ owner: a[i++] - 1, prog: a[i++] });
  n = a[i++]; if (!(n >= 0 && n <= 80)) return null;
  for (let j = 0; j < n; j++) { const id = a[i++], f = a[i++]; o.units.push({ id, type: f & 7, side: (f >> 3) & 1, k: (f >> 4) & 3, x: a[i++] / 1000, y: a[i++] / 1000, z: a[i++] / 1000, yaw: a[i++] / 100, pitch: a[i++] / 100, hp: a[i++] / 1000 }); }
  n = a[i++]; if (!(n >= 0) || i + n > a.length) return null; for (let j = 0; j < n; j++) o.ev.push(a[i++]);
  return o;
}
export { Sim, read, table, NAVY, TYPES, NODES, HOME, DT, CAP, QMAX, NODE_R, BX, BY, BZ, MOTHER, FIGHTER, FRIGATE, CRUISER, TURRET, MINE };
