// SPACE FLEET's rules: the whole battle with no screen or network (ships that fly and fight on their own, orders, building, relays, the win); the host runs it, ten steps a second
const DT = 0.1, CAP = 30, QMAX = 5, BX = 1, BY = 0.4, BZ = 1.35;
const MOTHER = 0, FIGHTER = 1, FRIGATE = 2, CRUISER = 3, TURRET = 4, MINE = 5;
// cls: 0 small, 1 medium, 2 large; w: the weapon (0 guns, 1 cannon, 2 heavy beam, 3 the mine's blast); time in steps
const TYPES = [
  { name: 'MOTHERSHIP', hp: 7000, speed: 0, range: 0.34, dmg: 28, cd: 4, cls: 2, r: 0.17, cost: 0, time: 0, w: 1, acc: 0, turn: 0, grip: 1, sh: 1800 },
  { name: 'FIGHTER', hp: 100, speed: 0.24, range: 0.13, dmg: 7, cd: 3, cls: 0, r: 0.02, cost: 50, time: 40, w: 0, acc: 0.5, turn: 3.4, grip: 0.4, sh: 0 },
  { name: 'FRIGATE', hp: 380, speed: 0.12, range: 0.22, dmg: 22, cd: 6, cls: 1, r: 0.045, cost: 120, time: 80, w: 1, acc: 0.12, turn: 1.2, grip: 0.2, sh: 160 },
  { name: 'CRUISER', hp: 1250, speed: 0.07, range: 0.3, dmg: 110, cd: 15, cls: 2, r: 0.08, cost: 300, time: 160, w: 2, acc: 0.04, turn: 0.55, grip: 0.1, sh: 420 },
  { name: 'TURRET', hp: 520, speed: 0.035, range: 0.33, dmg: 25, cd: 6, cls: 1, r: 0.032, cost: 160, time: 100, w: 1, acc: 0.03, turn: 0.7, grip: 0.15, sh: 200 },
  { name: 'MINE', hp: 40, speed: 0.06, range: 0.05, dmg: 260, cd: 0, cls: 0, r: 0.012, cost: 40, time: 30, w: 3, acc: 0.1, turn: 2, grip: 0.25, sh: 0 },
];
// what each weapon does to each size: fighters wear down the big ships, cannon swats fighters, the heavy beam breaks hulls and cannot track fighters
const MUL = [[1, 0.75, 0.6], [1.15, 1, 0.55], [1, 1.1, 1.2], [1, 1, 1]];
// a shot is not a hit: how likely each weapon is to land on each size (before the target's own speed and the range are counted), and how fast each one's shot flies
const ACC = [[0.7, 0.8, 0.9], [0.55, 0.75, 0.9], [0.12, 0.7, 0.92], [1, 1, 1]], SHOT = [0.9, 0.55, 3];
const NODES = [[0, 0, 0], [-0.62, 0.14, 0.42], [0.62, -0.14, 0.42], [0.62, 0.14, -0.42], [-0.62, -0.14, -0.42]];
const SNEAK_SEE = 0.16, NODE_R = 0.16, BASE_INC = 12, NODE_INC = 4, START = 300, MINE_SEE = 0.12, HELP = 0.4, DOCK = 0.34, BLAST = 0.09;
const HOME = [[0, 0, 1.12], [0, 0, -1.12]];
const MASS = [1e9, 1, 8, 40, 12, 0.5], BOOM = [2, 6, 20];   // how heavy each kind is, and how hard each size goes up
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// the two navies: the same six kinds of ship, each navy's own hulls and its own bent (the Admiralty's stronger force fields; the Corsairs' lighter, faster, cheaper ships)
const NAVY = [{ name: 'ADMIRALTY', hp: 1, sh: 1.3, speed: 1, cost: 1, dmg: 1 }, { name: 'CORSAIRS', hp: 0.85, sh: 0.7, speed: 1.1, cost: 0.95, dmg: 1.3 }];
const table = f => TYPES.map((t, i) => (i === MOTHER ? { ...t } : { ...t, hp: Math.round(t.hp * NAVY[f].hp), sh: Math.round(t.sh * NAVY[f].sh), speed: t.speed * NAVY[f].speed, acc: t.acc * NAVY[f].speed, dmg: t.dmg * NAVY[f].dmg, cost: Math.round(t.cost * NAVY[f].cost / 5) * 5 }));

class Sim {
  // fac: which navy each side flies (0 ADMIRALTY, 1 CORSAIRS)
  constructor(fac = [0, 1], seed = (Math.random() * 2147483646) | 0) {
    this.seed = seed % 2147483646 + 1; this.shots = [];   // shots on their way
    this.fac = [fac[0] ? 1 : 0, fac[1] ? 1 : 0]; this.T = this.fac.map(table); this.tick = 0; this.next = 1; this.winner = -1; this.units = []; this.byId = new Map(); this.ev = [];
    this.credits = [START, START]; this.queue = [[], []]; this.nodes = NODES.map(p => ({ p, owner: -1, prog: 0 }));
    this.rally = [[0, 0, 0.62], [0, 0, -0.62]];
    for (let s = 0; s < 2; s++) { this.spawn(MOTHER, s, HOME[s]);
      for (let i = 0; i < 3; i++) this.spawn(FIGHTER, s, [(i - 1) * 0.1, 0.05, HOME[s][2] * 0.6]);
      this.spawn(FRIGATE, s, [0, -0.05, HOME[s][2] * 0.5]); }
  }
  spawn(type, side, p) {
    const u = { id: this.next++, type, side, x: p[0], y: p[1], z: p[2], vx: 0, vy: 0, vz: 0, yaw: side ? 0 : Math.PI, pitch: 0, hp: this.T[side][type].hp, sh: this.T[side][type].sh, calm: 0, cool: 0, by: 0, byT: -999,
      k: 0, gx: p[0], gy: p[1], gz: p[2], ax: p[0], ay: p[1], az: p[2], tid: 0, q: [], m: 0, loud: 0 };   // m: how it goes about its orders (0 attack, 1 defend, 2 sneak); loud: steps since it last gave itself away   // q: the rest of its mission, done one after another   // k: 0 guard at a, 1 move to g, 2 attack tid
    this.units.push(u); this.byId.set(u.id, u); return u;
  }
  rnd() { return (this.seed = (this.seed * 16807) % 2147483647) / 2147483647; }
  count(side) { let n = 0; for (const u of this.units) if (u.side === side && u.type !== MOTHER) n++; return n; }
  // a big fleet costs to run: every ship past ten takes 2% off what comes in
  income(side) { let n = BASE_INC; for (const d of this.nodes) if (d.owner === side) n += NODE_INC; return Math.round(n * (1 - 0.02 * Math.max(0, this.count(side) - 10))); }
  build(side, type) {
    const T = this.T[side][type]; if (!T || !T.cost || this.winner >= 0) return false; const q = this.queue[side];
    if (this.credits[side] < T.cost || q.length >= QMAX || this.count(side) + q.length >= CAP) return false;
    this.credits[side] -= T.cost; q.push({ type, left: T.time }); return true;
  }
  // the next thing on a ship's mission, if it has one
  advance(u) { for (let o; (o = u.q.shift());) { if (o.k === 2) { if (!this.byId.has(o.tid)) continue; u.k = 2; u.tid = o.tid; } else { u.k = 1; u.tid = 0; u.gx = o.x; u.gy = o.y; u.gz = o.z; } u.m = o.m | 0; return true; } return false; }
  // how ships go about their orders, without sending them anywhere: ATTACK takes on what it meets and chases; DEFEND holds its place and shoots only what comes in reach (steadier aim, its field back sooner); SNEAK goes slow and silent, unseen from afar until it fires or is hit
  stance(side, ids, m) { m = m === 1 || m === 2 ? m : 0; for (const id of ids) { const u = this.byId.get(id); if (u && u.side === side && u.type !== MOTHER) { u.m = m; for (const o of u.q) o.m = m; } } }
  give(u, o, add) { if (add && (u.k !== 0 || u.q.length)) { if (u.q.length < 6) u.q.push(o); return; } u.q.length = 0; u.q.push(o); this.advance(u); }
  // k: 0 move to p (the group keeps its shape), 1 attack tid; add: after what the ship is already doing, not in place of it; the mothership moved is the rally point moved
  order(side, ids, k, p, tid, add, mode) {
    if (this.winner >= 0) return; const us = []; mode = mode === 1 || mode === 2 ? mode : 0;
    for (const id of ids) { const u = this.byId.get(id); if (u && u.side === side) us.push(u); }
    if (!us.length) return;
    if (k === 1) { const t = this.byId.get(tid); if (!t || t.side === side) return; for (const u of us) if (u.type !== MOTHER) this.give(u, { k: 2, tid, m: mode }, add); return; }
    const g = [clamp(p[0], -BX, BX), clamp(p[1], -BY, BY), clamp(p[2], -BZ, BZ)];
    let cx = 0, cy = 0, cz = 0, n = 0; for (const u of us) if (u.type !== MOTHER) { cx += u.x; cy += u.y; cz += u.z; n++; }
    if (!n) { this.rally[side] = g; return; }
    cx /= n; cy /= n; cz /= n;
    for (const u of us) { if (u.type === MOTHER) continue; let ox = u.x - cx, oy = u.y - cy, oz = u.z - cz; const l = Math.hypot(ox, oy, oz), m = l > 0.15 ? 0.15 / l : 1;
      this.give(u, { k: 1, x: clamp(g[0] + ox * m, -BX, BX), y: clamp(g[1] + oy * m, -BY, BY), z: clamp(g[2] + oz * m, -BZ, BZ), m: mode }, add); }
  }
  // the nearest enemy this ship should shoot, within reach d (mines are seen only from close)
  pick(u, d) {
    const T = this.T[u.side][u.type]; let best = null, bs = 1e9;
    for (const e of this.units) { if (e.side === u.side || e.hp <= 0) continue; const dist = Math.hypot(e.x - u.x, e.y - u.y, e.z - u.z) - this.T[e.side][e.type].r;
      if (dist > d || (e.type === MINE && dist > MINE_SEE) || (e.m === 2 && e.loud <= 0 && dist > SNEAK_SEE)) continue; const s = (dist + 0.02) / MUL[T.w][this.T[e.side][e.type].cls]; if (s < bs) { bs = s; best = e; } }
    return best;
  }
  step() {
    if (this.winner >= 0) return; this.tick++; const US = this.units;
    for (let s = 0; s < 2; s++) { this.credits[s] = Math.min(9999, this.credits[s] + this.income(s) * DT); const q = this.queue[s];
      if (q.length && --q[0].left <= 0) { const it = q.shift(), h = HOME[s], a = this.tick * 0.7 + s, u = this.spawn(it.type, s, [h[0] + (Math.cos(a) < 0 ? -0.16 : 0.16), Math.sin(a * 1.3) * 0.06, h[2] * 0.9 + Math.sin(a) * 0.08]);
        const r = this.rally[s]; u.k = 1; u.gx = clamp(r[0] + Math.cos(a) * 0.07, -BX, BX); u.gy = clamp(r[1] + Math.sin(a * 1.3) * 0.04, -BY, BY); u.gz = clamp(r[2] + Math.sin(a) * 0.07, -BZ, BZ); this.ev.push(3, s, it.type); } }
    for (const u of US) {
      if (u.hp <= 0) continue; const T = this.T[u.side][u.type]; let tx = u.x, ty = u.y, tz = u.z, go = false, tgt = null;
      if (u.k === 2) { tgt = this.byId.get(u.tid); if (!tgt || tgt.hp <= 0) { tgt = null; u.k = 0; u.ax = u.x; u.ay = u.y; u.az = u.z; if (this.advance(u) && u.k === 2) tgt = this.byId.get(u.tid) || null; } }
      if (u.k === 1) { tx = u.gx; ty = u.gy; tz = u.gz; go = true; if (Math.hypot(tx - u.x, ty - u.y, tz - u.z) < 0.02) { u.k = 0; u.ax = tx; u.ay = ty; u.az = tz; go = false; this.advance(u); } }
      // on guard a ship takes on what comes near and goes back to its post; told to move it only shoots what it passes
      let foe = tgt; const mine = u.type === MINE, quiet = u.m === 2 && u.loud <= 0, hunt = u.m === 0 && !mine; if (u.loud > 0) u.loud--;
      if (!foe && !quiet) foe = this.pick(u, mine ? 0.15 : u.m === 1 || (u.k === 1 && !hunt) ? T.range : Math.max(T.range * 1.5, 0.3));
      // a ship's own sense: shot at from beyond its reach it goes for whoever did it; standing by, it goes to a friend under fire close by (to its mothership from farther)
      let back = false; if (!foe && !mine && T.speed) { let a = this.tick - u.byT < 40 ? this.byId.get(u.by) : null; if (a && a.hp <= 0) a = null;
        if (!a && u.k === 0 && u.m !== 2) { let bd = 9; for (const f of US) { if (f.side !== u.side || f === u || f.hp <= 0 || this.tick - f.byT > 30) continue; const e = this.byId.get(f.by); if (!e || e.hp <= 0) continue; const d = Math.hypot(f.x - u.x, f.y - u.y, f.z - u.z); if (d < (f.type === MOTHER ? HELP * 1.6 : HELP) && d < bd) { bd = d; a = e; } } }
        if (a) { foe = a; back = true; } }
      if (u.k === 0) { if (foe && Math.hypot(u.x - u.ax, u.y - u.ay, u.z - u.az) > (mine ? 0.2 : u.m === 1 ? 0.12 : 0.5)) foe = null;
        if ((!foe || u.m === 1) && Math.hypot(u.x - u.ax, u.y - u.ay, u.z - u.az) > 0.03) { tx = u.ax; ty = u.ay; tz = u.az; go = true; } }   // a defender knocked off its post goes back to it, still shooting
      if (foe && (u.k === 2 || mine || (u.m !== 1 && (u.k === 0 || hunt)))) { const d = Math.hypot(foe.x - u.x, foe.y - u.y, foe.z - u.z), reach = T.range + this.T[foe.side][foe.type].r;
        if (mine) { tx = foe.x; ty = foe.y; tz = foe.z; go = true; }
        else if (u.type === FIGHTER) { const a = this.tick * 0.22 + u.id * 1.7, rr = reach * 0.75; tx = foe.x + Math.cos(a) * rr; ty = foe.y + Math.sin(a * 0.7) * rr * 0.4; tz = foe.z + Math.sin(a) * rr; go = true; }
        else if (d > reach * 0.85) { tx = foe.x; ty = foe.y; tz = foe.z; go = true; } else go = false; }
      else if (foe && back && u.m === 1 && u.k === 0 && T.speed) { const dx = foe.x - u.ax, dy = foe.y - u.ay, dz = foe.z - u.az, d = Math.hypot(dx, dy, dz) || 1, k = Math.min(0.1, Math.max(0, d - T.range * 0.85)) / d; tx = u.ax + dx * k; ty = u.ay + dy * k; tz = u.az + dz * k; go = true; }   // a defender answers from as far out as its post allows
      // fly: a ship turns its nose at its own rate and thrusts along it, so it swings round in an arc, carries its way and brakes to arrive; the last few lengths are on manoeuvring jets
      let wx = 0, wy = 0, wz = 0, fx = 0, fy = 0, fz = 0;
      if (go && T.speed) { const dx = tx - u.x, dy = ty - u.y, dz = tz - u.z, d = Math.hypot(dx, dy, dz) || 1e-6; fx = dx / d; fy = dy / d; fz = dz / d;
        const cp = Math.cos(u.pitch), nx = Math.sin(u.yaw) * cp, ny = Math.sin(u.pitch), nz = Math.cos(u.yaw) * cp, al = Math.max(T.cls === 0 ? 0.45 : 0.08, nx * fx + ny * fy + nz * fz);
        const sp = Math.min(T.speed * (quiet ? 0.6 : 1), Math.sqrt(2 * T.acc * d)) * al, near = clamp(1 - d / 0.05, 0, 1), js = Math.min(T.speed * 0.4, d / DT * 0.5);
        wx = nx * sp * (1 - near) + fx * js * near; wy = ny * sp * (1 - near) + fy * js * near; wz = nz * sp * (1 - near) + fz * js * near; }
      const b = T.grip; u.vx += (wx - u.vx) * b; u.vy += (wy - u.vy) * b; u.vz += (wz - u.vz) * b;
      // shoot
      if (u.cool > 0) u.cool--;
      const shot = foe && foe.hp > 0 ? foe : null, sd = shot ? Math.hypot(shot.x - u.x, shot.y - u.y, shot.z - u.z) - this.T[shot.side][shot.type].r : 9;
      if (mine) { if (shot && sd < T.range) { u.hp = 0; u.boom = 1; } }
      else if (shot && sd <= T.range && u.cool <= 0) { u.cool = T.cd; const TT = this.T[shot.side][shot.type], kd = Math.hypot(shot.x - u.x, shot.y - u.y, shot.z - u.z) || 1, dx = (shot.x - u.x) / kd, dy = (shot.y - u.y) / kd, dz = (shot.z - u.z) / kd;
        // the shot flies, and may miss: small fast ships are hard to hit, long shots harder; a ship shot at jinks
        const dodge = Math.min(0.45, Math.hypot(shot.vx, shot.vy, shot.vz) / 0.5) * (TT.cls === 0 ? 1 : TT.cls === 1 ? 0.5 : 0.15), hit = this.rnd() < ACC[T.w][TT.cls] * (1 - dodge) * (1 - 0.25 * Math.max(0, sd) / T.range) * (u.m === 1 && Math.hypot(u.vx, u.vy, u.vz) < T.speed * 0.3 ? 1.15 : 1), t = Math.max(1, Math.min(15, Math.round(kd / SHOT[T.w] / DT)));
        u.loud = 30; shot.by = u.id; shot.byT = this.tick; this.shots.push({ t, tid: shot.id, dmg: T.dmg * MUL[T.w][TT.cls], hit, dx, dy, dz, k: T.dmg * 0.0006 / MASS[shot.type] }); this.ev.push(1, u.id, shot.id, T.w | (shot.sh > 0 ? 8 : 0) | (hit ? 0 : 16) | (t << 5));
        if (TT.cls < 2 && TT.speed) { const j = (TT.cls ? 0.02 : 0.08) * (this.rnd() < 0.5 ? -1 : 1), up = this.rnd() - 0.5; shot.vx += -dz * j; shot.vz += dx * j; shot.vy += up * Math.abs(j); } }
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
    // shots arrive: one that was true does its damage and knocks its target back
    for (let i = this.shots.length - 1; i >= 0; i--) { const f = this.shots[i]; if (--f.t > 0) continue; this.shots.splice(i, 1); const e = this.byId.get(f.tid); if (!e || e.hp <= 0 || !f.hit) continue; e.hurt = (e.hurt || 0) + f.dmg; e.vx += f.dx * f.k; e.vy += f.dy * f.k; e.vz += f.dz * f.k; }
    // mines go off, damage lands, the dead leave
    for (const u of US) if (u.boom) for (const e of US) if (e.side !== u.side && e.hp > 0 && Math.hypot(e.x - u.x, e.y - u.y, e.z - u.z) - this.T[e.side][e.type].r < BLAST) e.hurt = (e.hurt || 0) + TYPES[MINE].dmg;
    let dead = false;
    // a force field takes the damage first, and comes back after six quiet seconds
    for (const u of US) { if (!u.hurt && u.type !== MOTHER && u.calm > 20 && u.hp < this.T[u.side][u.type].hp && Math.hypot(u.x - HOME[u.side][0], u.z - HOME[u.side][2]) < DOCK) u.hp = Math.min(this.T[u.side][u.type].hp, u.hp + this.T[u.side][u.type].hp * 0.0012);   // beside its own mothership a ship out of the fight is mended
      if (u.hurt) { const a = Math.min(u.sh, u.hurt); u.sh -= a; u.hp -= u.hurt - a; u.hurt = 0; u.calm = 0; u.loud = 30; } else if (u.sh < this.T[u.side][u.type].sh && ++u.calm > (u.m === 1 ? 30 : 50)) u.sh = Math.min(this.T[u.side][u.type].sh, u.sh + this.T[u.side][u.type].sh * 0.02); if (u.hp <= 0) { dead = true; this.ev.push(2, u.id, u.boom ? 3 : this.T[u.side][u.type].cls, 0); this.byId.delete(u.id); if (u.type === MOTHER && this.winner < 0) this.winner = 1 - u.side; } }
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
    for (const u of this.units) a.push(u.id, u.type | (u.side << 3) | (u.k << 4) | ((u.m === 2 && u.loud <= 0 ? 3 : u.m) << 6), Math.round(u.x * 1000), Math.round(u.y * 1000), Math.round(u.z * 1000), Math.round(u.yaw * 100), Math.round(u.pitch * 100), Math.max(1, Math.round(1000 * u.hp / this.T[u.side][u.type].hp)));
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
  for (let j = 0; j < n; j++) { const id = a[i++], f = a[i++]; o.units.push({ id, type: f & 7, side: (f >> 3) & 1, k: (f >> 4) & 3, m: (f >> 6) & 3, x: a[i++] / 1000, y: a[i++] / 1000, z: a[i++] / 1000, yaw: a[i++] / 100, pitch: a[i++] / 100, hp: a[i++] / 1000 }); }
  n = a[i++]; if (!(n >= 0) || i + n > a.length) return null; for (let j = 0; j < n; j++) o.ev.push(a[i++]);
  return o;
}
export { Sim, read, table, NAVY, TYPES, NODES, HOME, DT, CAP, QMAX, NODE_R, BX, BY, BZ, MOTHER, FIGHTER, FRIGATE, CRUISER, TURRET, MINE };
