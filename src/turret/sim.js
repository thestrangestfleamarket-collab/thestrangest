// SWIVEL's fight with no screen or sound: your gunship is at the origin (the turret's seat; nose to +z), everything else flies round it; metres and seconds
export const TYPES = {
  fighter: { hp: 4, r: 13, speed: 120, turn: 1.5, score: 100, len: 30 },
  ace: { hp: 7, r: 13, speed: 150, turn: 2.0, score: 250, len: 32 },
  bomber: { hp: 18, r: 22, speed: 55, turn: 0.7, score: 400, len: 58 },
  torp: { hp: 1, r: 6, speed: 75, turn: 1.4, score: 25, len: 6 },
  drone: { hp: 1, r: 9, speed: 100, turn: 1.7, score: 40, len: 14 },
  cruiser: { hp: 160, r: 30, speed: 0, turn: 0, score: 2000, len: 300 },
  pod: { hp: 12, r: 12, speed: 0, turn: 0, score: 150, len: 16 },
};
export const RULES = { bolt: 700, boltLife: 1.4, rate: 0.1, heat: 0.055, cool: 0.32, coolTo: 0.35, missiles: 6, reload: 6, lock: 0.21, shieldWait: 3.5, shieldUp: 9,
  hull: [[0, -6, -26], [0, -6, 26], 10], foe: 260, foeDmg: 2, heavyDmg: 6, torpDmg: 14, droneDmg: 6, harder: 0.05 };

const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// the nearest point of segment a-b to p, as 0..1 along it
const along = (p, a, b) => { const ab = sub(b, a), l = dot(ab, ab); return l ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / l)) : 0; };
// how near two segments come (p0-p1 and q0-q1)
function segSeg(p0, p1, q0, q1) {
  const d1 = sub(p1, p0), d2 = sub(q1, q0), r = sub(p0, q0), a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r); let s, t;
  if (a < 1e-9 && e < 1e-9) return len(r);
  if (a < 1e-9) { s = 0; t = Math.max(0, Math.min(1, f / e)); }
  else { const c = dot(d1, r); if (e < 1e-9) { t = 0; s = Math.max(0, Math.min(1, -c / a)); }
    else { const b = dot(d1, d2), den = a * e - b * b; s = den > 1e-9 ? Math.max(0, Math.min(1, (b * f - c * e) / den)) : 0; t = (b * s + f) / e;
      if (t < 0) { t = 0; s = Math.max(0, Math.min(1, -c / a)); } else if (t > 1) { t = 1; s = Math.max(0, Math.min(1, (b - c) / a)); } } }
  return len(sub(add(p0, d1, s), add(q0, d2, t)));
}
// turn unit vector a toward unit vector b by at most ang
function toward(a, b, ang) {
  const c = Math.max(-1, Math.min(1, dot(a, b))), th = Math.acos(c); if (th <= ang || th < 1e-4) return b.slice();
  if (th > 3.1) b = norm(add(b, [0.3, 1, 0.2])); const c2 = Math.max(-1, Math.min(1, dot(a, b))), t2 = Math.acos(c2), f = Math.min(1, ang / t2), s = Math.sin(t2) || 1;
  return norm(add([a[0] * Math.sin((1 - f) * t2) / s, a[1] * Math.sin((1 - f) * t2) / s, a[2] * Math.sin((1 - f) * t2) / s], b, Math.sin(f * t2) / s));
}
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// what a wave brings: a cruiser every fifth, more and tougher ships as they go on
export function plan(n) {
  if (n % 5 === 0) return ['cruiser', ...Array(Math.min(1 + n / 5, 4)).fill('fighter')];
  const k = n - Math.floor(n / 5), out = [];
  for (let i = Math.min(1 + Math.ceil(k / 2), 6); i--;) out.push('fighter');
  for (let i = Math.max(0, Math.min(Math.floor((k - 2) / 2), 4)); i--;) out.push('ace');
  for (let i = k >= 3 ? Math.min(1 + Math.floor((k - 3) / 3), 3) : 0; i--;) out.push('bomber');
  for (let i = k >= 2 ? Math.min(2 + k, 9) : 0; i--;) out.push('drone');
  return out;
}

export class Sim {
  constructor(seed = 1) { this.rnd = rng(seed); this.best = 0; this.reset(); }
  reset() { Object.assign(this, { state: 'ready', t: 0, wave: 0, score: 0, streak: 0, streakT: 0, kills: 0, shield: 100, hull: 100, heat: 0, hot: false, fireT: 0, mslT: 0, msl: RULES.missiles, mslUp: 0,
    lastHit: -9, rest: 1.5, ships: [], bolts: [], missiles: [], queue: [], events: [], id: 1 }); }
  start() { this.reset(); this.state = 'play'; this.ev('start'); }
  ev(t, o) { this.events.push(Object.assign({ t }, o)); }
  foes() { return this.ships.filter(s => !s.dead && s.type !== 'torp'); }
  ram(s) { return s.type === 'torp' || s.type === 'drone'; }

  // ---- the gunner ----
  fire(o, d) {
    if (this.state !== 'play' || this.hot || this.fireT > 0) return false;
    this.fireT = RULES.rate; this.heat += RULES.heat; if (this.heat >= 1) { this.heat = 1; this.hot = true; this.ev('overheat'); }
    this.bolts.push({ p: o.slice(), v: [d[0] * RULES.bolt, d[1] * RULES.bolt, d[2] * RULES.bolt], life: RULES.boltLife, mine: true, dmg: 1 }); this.ev('fire', { p: o }); return true;
  }
  // the ship nearest the aim, inside the lock's cone
  lock(o, d) { let best = null, bc = Math.cos(RULES.lock); for (const s of this.ships) { if (s.dead || s.type === 'cruiser' && this.ships.some(x => x.par === s.id && !x.dead)) continue; const c = dot(norm(sub(s.p, o)), d); if (c > bc) { bc = c; best = s; } } return best; }
  missile(o, d) {
    if (this.state !== 'play' || this.msl < 1 || this.mslT > 0) return false;
    const tg = this.lock(o, d); this.msl--; this.mslT = 0.35; this.missiles.push({ id: this.id++, p: o.slice(), d: d.slice(), sp: 110, tg: tg ? tg.id : 0, life: 7 }); this.ev('missile', { p: o, tg: tg ? tg.id : 0 }); return true;
  }

  // ---- your ship ----
  hurtShip(dmg, p) {
    if (this.state !== 'play') return; this.lastHit = this.t;
    if (this.shield > 0) { this.shield -= dmg; if (this.shield < 0) { this.hull += this.shield; this.shield = 0; } this.ev('shield', { p, dmg }); }
    else { this.hull -= dmg; this.ev('hull', { p, dmg }); }
    if (this.hull <= 0) { this.hull = 0; this.state = 'over'; this.best = Math.max(this.best, this.score); this.ev('over', { score: this.score, wave: this.wave }); }
  }
  hitsHull(p0, p1) { const H = RULES.hull; return segSeg(p0, p1, H[0], H[1]) < H[2]; }

  // ---- the others ----
  spawn(type, o = {}) { const T = TYPES[type], s = Object.assign({ id: this.id++, type, p: [0, 0, 0], d: [0, 0, 1], v: [0, 0, 0], hp: T.hp, r: T.r, st: 'run', fireT: 1 + this.rnd(), burst: 0, age: 0 }, o); this.ships.push(s); this.ev('spawn', { id: s.id, type }); return s; }
  enter(type, az) {
    const el = 0.1 + this.rnd() * 0.6, R = 950 + this.rnd() * 200, p = [Math.cos(az) * Math.cos(el) * R, Math.sin(el) * R, Math.sin(az) * Math.cos(el) * R];
    if (type === 'cruiser') { const c = this.spawn('cruiser', { ang: az, rad: 2600, h: 130, sent: 0, sendT: 10 }); this.place(c, 0);
      [-0.3, -0.1, 0.1, 0.3].forEach((k, i) => this.spawn('pod', { par: c.id, k, fireT: 2 + i * 0.6 })); this.place(c, 0); return c; }
    const s = this.spawn(type, { p, d: norm(sub([0, 0, 0], p)) }); this.aim(s); if (type === 'bomber') { s.orb = 340 + this.rnd() * 120; s.h = 80 + this.rnd() * 90; s.cw = this.rnd() < 0.5 ? 1 : -1; s.fireT = 6 + this.rnd() * 3; } return s;
  }
  aim(s) { s.st = 'run'; s.tp = [(this.rnd() - 0.5) * 12, -4, (this.rnd() - 0.5) * 44]; s.rin = 95 + this.rnd() * 50; s.rout = 420 + this.rnd() * 300; }
  place(c, dt) {
    c.rad = Math.max(440, c.rad - 160 * dt); c.ang += 0.03 * dt; const cs = Math.cos(c.ang), sn = Math.sin(c.ang);
    c.p = [cs * c.rad, c.h, sn * c.rad]; c.d = [-sn, 0, cs]; c.v = [-sn * 0.03 * c.rad, 0, cs * 0.03 * c.rad];
    for (const s of this.ships) if (s.par === c.id && !s.dead) { s.p = add(add(c.p, c.d, s.k * TYPES.cruiser.len), [-cs * 28, 6, -sn * 28]); s.v = c.v; s.d = [-cs, 0, -sn]; }
  }
  axis(c) { const h = TYPES.cruiser.len * 0.42; return [add(c.p, c.d, -h), add(c.p, c.d, h)]; }
  shoot(s, dmg, spread, heavy) {
    const to = norm(sub([(this.rnd() - 0.5) * 10, -5, (this.rnd() - 0.5) * 40], s.p)), base = heavy ? to : s.d, side = norm(cross(base, [0.13, 1, 0.07])), up = cross(side, base);
    const d = norm(add(add(base, side, (this.rnd() - 0.5) * 2 * spread), up, (this.rnd() - 0.5) * 2 * spread));
    this.bolts.push({ p: add(s.p, d, s.r * 0.6), v: [d[0] * RULES.foe, d[1] * RULES.foe, d[2] * RULES.foe], life: 4.5, mine: false, dmg: dmg * (1 + (this.wave - 1) * RULES.harder), heavy: !!heavy }); this.ev('foefire', { p: s.p, heavy: !!heavy });
  }
  hurt(s, dmg, p) {
    if (s.dead) return; s.hp -= dmg; this.ev('hit', { p, id: s.id });
    if (s.hp > 0) return; s.dead = true; const T = TYPES[s.type]; let pts = 0;
    if (this.state === 'play') { this.streak++; this.streakT = 4; this.kills++; this.score += pts = Math.round(T.score * Math.min(5, 1 + (this.streak - 1) * 0.25)); }
    this.ev('boom', { p: s.p.slice(), v: s.v.slice(), type: s.type, id: s.id, pts });
    if (s.type === 'cruiser') for (const x of this.ships) if (x.par === s.id && !x.dead) { x.dead = true; this.ev('boom', { p: x.p.slice(), v: x.v.slice(), type: 'pod', id: x.id }); }
  }

  fly(s, dt) {
    const T = TYPES[s.type], dist = len(s.p), play = this.state === 'play'; let want;
    if (this.ram(s)) { want = norm(sub([0, -5, 0], s.p)); if (s.type === 'drone' && dist > 160) { const j = norm(cross(want, [0, 1, 0])); want = norm(add(add(want, j, Math.sin(this.t * 3.1 + s.id * 1.7) * 0.45), [0, 1, 0], Math.cos(this.t * 2.3 + s.id) * 0.3)); }
      const n = add(s.p, s.d, T.speed * dt); if (this.hitsHull(s.p, n)) { s.dead = true; this.ev('boom', { p: s.p.slice(), v: [0, 0, 0], type: s.type, id: s.id, onHull: true }); this.hurtShip(s.type === 'torp' ? RULES.torpDmg : RULES.droneDmg * (1 + (this.wave - 1) * RULES.harder), s.p.slice()); return; } }
    else if (s.type === 'bomber') {
      const flat = Math.hypot(s.p[0], s.p[2]) || 1, rad = [s.p[0] / flat, 0, s.p[2] / flat], tan = [-rad[2] * s.cw, 0, rad[0] * s.cw];
      want = norm([tan[0] + rad[0] * (s.orb - flat) / 120, (s.h - s.p[1]) / 120, tan[2] + rad[2] * (s.orb - flat) / 120]);
      s.fireT -= dt; if (play && s.fireT <= 0 && flat < s.orb + 150 && this.ships.filter(x => x.from === s.id && !x.dead).length < 2) { s.fireT = 6 + this.rnd() * 3; this.spawn('torp', { p: s.p.slice(), d: norm(sub([0, -5, 0], s.p)), from: s.id }); this.ev('torp', { p: s.p }); }
    } else if (s.st === 'run') {
      want = norm(sub(s.tp, s.p)); if (s.type === 'ace' && dist > 220) { const j = norm(cross(want, [0, 1, 0])); want = norm(add(add(want, j, Math.sin(this.t * 2.6 + s.id) * 0.3), [0, 1, 0], Math.cos(this.t * 2.1 + s.id) * 0.2)); }
      s.fireT -= dt; if (play && dist < 650 && dot(s.d, norm(sub(s.tp, s.p))) > 0.99 && s.fireT <= 0) { if (s.burst <= 0) s.burst = s.type === 'ace' ? 7 : 5; this.shoot(s, RULES.foeDmg, 0.035); s.fireT = --s.burst > 0 ? 0.15 : 1.2; }
      if (dist < s.rin) { s.st = 'break'; s.bt = 0; const a = this.rnd() * 6.283, x = norm(cross(s.d, [0, 1, 0])), y = cross(x, s.d); s.side = norm(add([x[0] * Math.cos(a), x[1] * Math.cos(a), x[2] * Math.cos(a)], y, Math.abs(Math.sin(a)) + 0.3)); }
    } else {
      s.bt += dt; const out = norm(s.p), early = s.bt < 1.1; want = norm(add(add([s.d[0] * 0.4, s.d[1] * 0.4 + 0.25, s.d[2] * 0.4], s.side, early ? 1 : 0.3), out, early ? 0.3 : 1));
      if (dist > s.rout) this.aim(s);
    }
    if (!this.ram(s) && s.p[1] < 30) want = norm([want[0], want[1] + (30 - s.p[1]) / 30 * 1.6, want[2]]);
    s.d = toward(s.d, want, T.turn * dt); s.v = [s.d[0] * T.speed, s.d[1] * T.speed, s.d[2] * T.speed]; s.p = add(s.p, s.v, dt);
  }

  step(dt) {
    if (this.state === 'ready') return; const play = this.state === 'play'; this.t += dt;
    this.fireT -= dt; this.mslT -= dt; this.heat = Math.max(0, this.heat - RULES.cool * dt); if (this.hot && this.heat < RULES.coolTo) { this.hot = false; this.ev('cooled'); }
    if (this.msl < RULES.missiles && (this.mslUp += dt) >= RULES.reload) { this.mslUp = 0; this.msl++; this.ev('reload'); }
    if (play && this.t - this.lastHit > RULES.shieldWait && this.shield < 100) this.shield = Math.min(100, this.shield + RULES.shieldUp * dt);
    if (this.streakT > 0 && (this.streakT -= dt) <= 0) this.streak = 0;

    // the waves
    if (play) {
      if (!this.queue.length && !this.foes().length) { if (this.rest <= 0) { if (this.wave) { this.hull = Math.min(100, this.hull + 12); this.ev('clear', { wave: this.wave }); } this.rest = this.wave ? 5 : 1.5; }
        if ((this.rest -= dt) <= 0) { this.wave++; const g = 1 + (this.wave > 2) + (this.wave > 6), az = Array.from({ length: g }, () => this.rnd() * 6.283);
          const P = plan(this.wave); P.forEach((type, i) => this.queue.push({ type, at: this.t + (type === 'drone' ? 4 + i * 0.35 : i * 1.3), az: type === 'drone' ? az[g - 1] + 2.4 + (this.rnd() - 0.5) * 0.3 : az[i % g] + (this.rnd() - 0.5) * 0.5 })); this.queue.sort((a, b) => a.at - b.at);
          this.ev('wave', { wave: this.wave, boss: this.wave % 5 === 0, az: az[0], drones: P.includes('drone') }); } }
      while (this.queue.length && this.queue[0].at <= this.t) { const q = this.queue.shift(); this.enter(q.type, q.az); }
    }

    for (const s of this.ships) { if (s.dead) continue; s.age += dt;
      if (s.type === 'cruiser') { this.place(s, dt); if (play && s.rad < 900 && s.sent < 6 && (s.sendT -= dt) <= 0 && this.foes().filter(x => x.type === 'fighter').length < 3) { s.sendT = 12; s.sent++; const f = this.spawn('fighter', { p: add(s.p, [0, -20, 0]), d: norm(sub([0, 0, 0], s.p)) }); this.aim(f); } }
      else if (s.type === 'pod') { const c = this.ships.find(x => x.id === s.par); if (play && c && c.rad < 900 && (s.fireT -= dt) <= 0) { s.fireT = 2.4 + this.rnd(); this.shoot(s, RULES.heavyDmg, 0.012, true); } }
      else this.fly(s, dt); }

    for (const b of this.bolts) { const n = add(b.p, b.v, dt); b.life -= dt;
      if (b.mine) { for (const s of this.ships) { if (s.dead) continue;
        if (s.type === 'cruiser') { const [a, c] = this.axis(s); if (segSeg(b.p, n, a, c) < s.r) { b.life = 0; this.hurt(s, b.dmg, n); break; } }
        else { const k = along(s.p, b.p, n), q = add(b.p, sub(n, b.p), k); if (len(sub(q, s.p)) < s.r) { b.life = 0; this.hurt(s, b.dmg, q); break; } } } }
      else if (this.hitsHull(b.p, n)) { b.life = 0; this.hurtShip(b.dmg, n); if (!play) this.ev('shield', { p: n, dmg: 0 }); }
      b.p = n; }

    for (const m of this.missiles) { m.life -= dt; m.sp = Math.min(430, m.sp + 300 * dt); const tg = m.tg && this.ships.find(s => s.id === m.tg && !s.dead);
      if (tg) { const tt = len(sub(tg.p, m.p)) / m.sp; m.d = toward(m.d, norm(sub(add(tg.p, tg.v, tt), m.p)), 3.5 * dt); }
      const n = add(m.p, m.d, m.sp * dt);
      for (const s of this.ships) { if (s.dead) continue; let near; if (s.type === 'cruiser') { const [a, c] = this.axis(s); near = segSeg(m.p, n, a, c); } else { const k = along(s.p, m.p, n); near = len(sub(add(m.p, sub(n, m.p), k), s.p)); }
        if (near < s.r + 6) { m.life = 0; this.ev('boom', { p: n, v: [0, 0, 0], type: 'missile' }); this.hurt(s, 10, n); break; } }
      m.p = n; }

    this.bolts = this.bolts.filter(b => b.life > 0); this.missiles = this.missiles.filter(m => m.life > 0);
    this.ships = this.ships.filter(s => !s.dead && !(this.state === 'over' && len(s.p) > 3000));
  }
}
