// FOURTH & LONG's whole game with no screen: 11 on 11, the plays, every player's job, the ball's flight, tackles, downs, the clock and the score. Yards; x runs goal to goal (-50..50), z across (-26.67..26.67)
import { ROUTES, OFFENSE, DEFENSE, DROLES, DALIGN, formation } from './plays.js';

export const FIELD = { L: 50, EZ: 10, W: 26.67 }, G = 10.73;
const SPD = { QB: 7.8, HB: 9.2, FB: 8.3, WR: 9.5, TE: 8.5, C: 6.6, LG: 6.6, RG: 6.6, LT: 6.7, RT: 6.7, DE: 7.6, DT: 7.1, OLB: 8.6, MLB: 8.5, CB: 9.45, FS: 9.3, SS: 9.1 };
const SHED = { DE: 0.085, DT: 0.065, OLB: 0.26, MLB: 0.26, CB: 0.5, FS: 0.5, SS: 0.45 };
// how hard the computer plays: [0] ROOKIE, [1] PRO, [2] ALL-PRO. lag: seconds a man defender is late on a receiver's cut; shed: how fast its rushers beat your blocks; rush: their speed at you; tackle: its tacklers; wild: how far its own passes stray; read: seconds its quarterback takes
export const LEVELS = [{ name: 'ROOKIE', lag: 0.46, shed: 0.35, rush: 0.72, tackle: 0.86, wild: 4.2, read: 0.5 }, { name: 'PRO', lag: 0.32, shed: 0.55, rush: 0.82, tackle: 1, wild: 3.2, read: 0 }, { name: 'ALL-PRO', lag: 0.2, shed: 0.8, rush: 0.92, tackle: 1.08, wild: 2.4, read: -0.2 }];
const LINE = new Set(['C', 'LG', 'RG', 'LT', 'RT']);
const hyp = Math.hypot, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

export class Game {
  constructor(o = {}) {
    this.rnd = rng(o.seed ?? 7); this.human = o.human ?? [true, false]; this.qlen = o.qlen ?? 180;
    this.names = o.names ?? ['HOME', 'AWAY']; this.lvl = o.lvl ?? 1; this.K = LEVELS[this.lvl]; this.score = [0, 0]; this.q = 1; this.clock = this.qlen;
    this.P = []; for (let t = 0; t < 2; t++) for (let i = 0; i < 11; i++) this.P.push({ id: t * 11 + i, team: t, i, role: '', x: 0, z: 0, vx: 0, vz: 0, y: 0, face: 0, spd: 8, job: '', st: 'up' });
    this.ball = { x: 0, y: 0.3, z: 0, vx: 0, vy: 0, vz: 0, st: 'dead', by: -1, land: null, tgt: -1 };
    this.mode = o.mode ?? 'game'; this.ko = o.ko ?? this.mode === 'game'; this.to = [3, 3]; this.lastRun = 0; this.box = [0, 1].map(() => ({ att: 0, comp: 0, pass: 0, rush: 0, runs: 0, int: 0, sack: 0, first: 0, td: 0, fum: 0 }));
    if (this.mode === 'drill') { this.q = 4; this.clock = 120; this.score = [0, 4]; }   // the two-minute drill: your ball, down four, two minutes
    this.ev = []; this.msg = ''; this.me = this.human[0] ? 0 : 1; this.ctls = [-1, -1]; this.ins = [{ x: 0, z: 0, sprint: false }, { x: 0, z: 0, sprint: false }]; this.call = [-1, -1]; this.stats = { plays: 0, td: 0, int: 0, sack: 0, comp: 0, att: 0 };
    this.firstPoss = o.first ?? 0; this.wx = { wet: 0, wind: 0 };   // the weather's hand in the game: a wet ball, slow footing, a kick in the wind
    this.kickoff(this.firstPoss);
  }
  dir(t) { return t === 0 ? 1 : -1; }
  // each side's own player and stick; ctl and in are those of the side this page plays (me)
  get ctl() { return this.ctls[this.me]; } set ctl(v) { this.ctls[this.me] = v; } get in() { return this.ins[this.me]; }
  get off() { return this.poss; } get def() { return 1 - this.poss; }
  team(t) { return this.P.slice(t * 11, t * 11 + 11); }
  emit(t, d) { this.ev.push({ t, ...d }); }
  // the ball to a team at its own 25, first and ten
  kickoff(t) { this.poss = t; if (!this.ko) return this.spot(-25 * this.dir(t), true); this.kickReturn(t); }
  reset(p, role) { return Object.assign(p, { role, spd: SPD[role], vx: 0, vz: 0, y: 0, st: 'up', dn: 0, stun: 0, free: 0, blk: -1, blkN: 0, mv: '', mvT: 0, cd: 0, tk: 0, way: null, wi: 0, tgt: -1, zone: null, deep: false, lagT: 0, hold: 0, tried: -1, ord: null, elig: false, bt: -1 }); }
  // a kickoff, taken up as the returner catches it: his blockers in two rows ahead of him, the kicking side already coming down the field
  kickReturn(t) {
    const d = this.dir(t), R = this.team(t), K = this.team(1 - t); this.los = this.first = -47 * d; this.down = 1; this.pc = 30; this.tip = [-1, -1]; this.msg = ''; this.call = [0, 0]; this.play = { name: 'KICKOFF', cat: 'KICK', ko: 1, sk: [] }; this.dplay = DEFENSE[0];
    R.forEach((p, i) => { this.reset(p, i === 10 ? 'HB' : 'TE'); p.job = i === 10 ? 'carry' : 'block'; p.x = (i === 10 ? -46 : i < 5 ? -22 : -33) * d; p.z = i === 10 ? 0 : ((i % 5) - 2) * 9.5; p.face = d > 0 ? 0 : Math.PI; p.hx = p.x; p.hz = p.z; });
    K.forEach((p, i) => { this.reset(p, 'OLB'); p.job = 'pursue'; p.x = (2 + (i % 2) * 3) * d; p.z = (i - 5) * 4.6; p.face = d > 0 ? Math.PI : 0; p.hx = p.x; p.hz = p.z; });
    const r = R[10], b = this.ball; this.qb = r.id; this.run = null; this.handed = true; this.thrown = false; this.past = true; this.scr = false; this.isKO = true; this.t = 0; this.pre = 0; this.phase = 'pre'; this.result = null; this.carrier = r.id; b.st = 'held'; b.by = r.id; b.land = null;
    this.ctls = [-1, -1]; if (this.human[t]) this.ctls[t] = r.id; if (this.human[1 - t]) this.ctls[1 - t] = (1 - t) * 11 + 5; this.emit('lineup');
  }
  spot(x, first) {
    const d = this.dir(this.poss); this.los = clamp(x, -49, 49);
    if (first) { this.down = 1; this.first = this.los + 10 * d; if (this.first * d > 50) this.first = 50 * d; }
    this.phase = 'call'; this.call = [-1, -1]; this.pc = 30; this.isKO = false; this.t = 0; this.pre = 0; this.ball.st = 'dead'; this.ball.by = -1; this.ball.x = this.los; this.ball.z = 0; this.ball.y = 0.15; this.carrier = -1; this.ctls = [-1, -1];
    this.stand(); this.tip = [0, 1].map(t => !this.human[t] ? -1 : t === this.poss ? this.cpuOff() : this.tipDef());   // the coach's pick, each side's own
  }
  get toGo() { return Math.max(0, Math.round((this.first - this.los) * this.dir(this.poss))); }
  get yard() { const a = this.los * this.dir(this.poss); return a <= 0 ? 'OWN ' + Math.round(50 + a) : 'OPP ' + Math.round(50 - a); }
  get downText() { const g = (this.first * this.dir(this.poss) >= 50); return ['1ST', '2ND', '3RD', '4TH'][this.down - 1] + ' & ' + (g ? 'GOAL' : this.toGo || 'INCHES'); }
  // both huddles, standing either side of the ball
  stand() { for (const p of this.P) { const d = this.dir(this.poss) * (p.team === this.poss ? -1 : 1); p.x = this.los + d * (4 + (p.i % 3) * 1.5); p.z = (p.i - 5) * 1.6; p.vx = p.vz = 0; p.y = 0; p.st = 'up'; p.face = d > 0 ? Math.PI : 0; p.job = 'idle'; p.mv = ''; p.dn = 0; } }

  // ---- calling a play ----
  pick(team, n) {
    if (this.phase !== 'call') return false; if (n >= 0) this.call[team] = n;
    for (const t of [0, 1]) if (this.call[t] < 0 && !this.human[t]) this.call[t] = t === this.poss ? this.cpuOff() : this.cpuDef();
    if (this.call[0] >= 0 && this.call[1] >= 0) this.lineup(); return true;
  }
  cpuOff() {
    const r = this.rnd(), d = this.dir(this.poss), toGoal = 50 - this.los * d, by = (c) => { const L = OFFENSE.map((p, i) => [p, i]).filter(([p]) => p.cat === c && !p.sneak); return L[Math.floor(this.rnd() * L.length)][1]; };
    const late = this.q === 4 && this.score[this.poss] < this.score[1 - this.poss];
    if (this.q === 4 && this.score[this.poss] > this.score[1 - this.poss] && this.clock < 14 * (5 - this.down)) return OFFENSE.findIndex(p => p.kneel);
    if (this.down === 4) { if (toGoal <= 35) return OFFENSE.findIndex(p => p.kick === 'fg'); if (!(this.toGo <= 1 && toGoal < 45) && !(late && this.clock < 60)) return OFFENSE.findIndex(p => p.kick === 'punt'); }
    if (this.toGo <= 1 && r < 0.5) return OFFENSE.findIndex(p => p.sneak);
    if (this.toGo <= 3) return by(r < 0.65 ? 'RUN' : 'SHORT');
    if (this.toGo >= 8 && this.down >= 2) return by(r < 0.15 ? 'RUN' : r < 0.6 ? 'SHORT' : 'DEEP');
    return by(r < 0.42 ? 'RUN' : r < 0.8 ? 'SHORT' : 'DEEP');
  }
  tipDef() { const d = this.dir(this.poss), n = (s) => DEFENSE.findIndex(p => p.name === s); return 50 - this.los * d <= 4 ? n('GOAL LINE') : this.toGo >= 8 ? n(this.down >= 3 ? 'COVER 4' : 'COVER 3') : this.toGo <= 2 ? n('COVER 1 MAN') : n(this.down === 1 ? 'COVER 2' : 'COVER 2 MAN'); }
  cpuDef() { const d = this.dir(this.poss); if (50 - this.los * d <= 3) return DEFENSE.findIndex(p => p.tight); return Math.floor(this.rnd() * (DEFENSE.length - 1)); }
  lineup() {
    this.run = null; const o = this.poss, d = this.dir(o), play = OFFENSE[this.call[o]], dplay = DEFENSE[this.call[1 - o]], form = formation(play.form); this.play = play; this.dplay = dplay;
    const at = (p, f, s) => { p.x = this.los + d * f; p.z = clamp(d * s, -FIELD.W + 1, FIELD.W - 1); p.hx = p.x; p.hz = p.z; p.face = d > 0 ? 0 : Math.PI; };
    const base = (p, role) => this.reset(p, role); this.scr = false;
    this.team(o).forEach((p, i) => { const F = form[i]; base(p, F.role); at(p, F.f - 0.6, F.s); p.side = F.s < 0 ? -1 : 1;
      if (i < 5) p.job = 'block'; else if (i === 5) { p.job = 'qb'; this.qb = p.id; } else { p.elig = true; this.setJob(p, play.sk[i - 6]); } });
    const sk = this.team(o).slice(6), wide = [...sk].sort((a, b) => a.z * d - b.z * d);
    this.team(1 - o).forEach((p, i) => { base(p, DROLES[i]); let [f, s] = DALIGN[i]; if (dplay.tight) { f = Math.min(f, 3 + (i > 8 ? 2 : 0)); s *= 0.7; }
      const j = dplay.jobs[i]; if (i === 7) s = wide[0].z * d; if (i === 8) s = wide[4].z * d; if (i === 10 && j === 'man') s = wide[3].z * d * 0.8;
      at(p, f, s); p.face += Math.PI; if (j === 'rush') p.job = 'rush'; else if (j === 'man') p.job = 'man'; else { p.job = 'zone'; p.zone = { x: this.los + d * j[0], z: d * j[1] }; p.deep = j[0] >= 14; } });
    // man coverage: the corners take the widest receivers, the rest go to whoever is nearest and still free
    const taken = new Set(), men = this.team(1 - o).filter(p => p.job === 'man');
    for (const m of men) { let best = null, bd = 1e9; for (const r of sk) { if (taken.has(r.id)) continue; const q = hyp(r.x - m.x, (r.z - m.z) * 1.6); if (q < bd) { bd = q; best = r; } } if (best) { taken.add(best.id); m.tgt = best.id; } else { m.job = 'zone'; m.zone = { x: this.los + d * 9, z: m.z }; } }
    this.handed = false; this.thrown = false; this.caught = false; this.past = false; this.t = 0; this.pre = 0; this.phase = 'pre'; this.carrier = -1; this.result = null;
    this.ball.st = 'dead'; this.ball.x = this.los; this.ball.z = 0; this.ball.y = 0.15;
    this.ctls[o] = -1; this.ctls[1 - o] = this.human[1 - o] ? (1 - o) * 11 + 5 : -1;
    this.emit('lineup');
  }
  setJob(p, j) {
    const d = this.dir(p.team); p.way = null; p.wi = 0; p.stop = false; p.rname = '';
    if (j === 'block') { p.job = 'block'; return; }
    if (typeof j === 'string') { const R = ROUTES[j], out = p.side || 1; p.job = 'route'; p.rname = j; p.stop = !!R.stop; p.way = R.w.map(([f, s]) => ({ x: p.hx + d * f, z: clamp(p.hz + d * out * s, -FIELD.W + 1.5, FIELD.W - 1.5) })); return; }
    if (j.run) { p.job = 'runner'; this.run = { id: p.id, ho: j.ho }; p.way = j.run.map(([f, s]) => ({ x: this.los + d * f, z: d * s })); }
  }
  // the user's word to one of his own: a spot to go to, a player to block or cover, or a new route
  order(id, o) {
    const p = this.P[id]; if (!p || (this.phase !== 'pre' && this.phase !== 'live') || p.id === this.ctls[p.team]) return false; const off = p.team === this.poss;
    if (o.route) { if (!off || !p.elig || this.phase !== 'pre') return false; this.setJob(p, o.route); return true; }
    if (o.target != null) { const q = this.P[o.target]; if (!q || q.team === p.team) return false; if (off) { p.job = 'block'; p.ord = q.id; } else if (q.id === this.qb || q.id === this.carrier) p.job = 'rush'; else { p.job = 'man'; p.tgt = q.id; } return true; }
    const x = clamp(o.x, -FIELD.L - 8, FIELD.L + 8), z = clamp(o.z, -FIELD.W + 1, FIELD.W - 1);
    if (off) { if (LINE.has(p.role) || p.id === this.qb || p.id === this.carrier) return false; p.job = 'route'; p.stop = true; p.rname = 'spot'; p.way = [{ x, z }]; p.wi = 0; }
    else { p.job = 'zone'; p.zone = { x, z }; if (this.phase === 'pre' && (x - this.los) * this.dir(this.poss) > 0.8) { p.hx = x; p.hz = z; } }
    return true;
  }
  // the quarterback throws it away, out of bounds
  throwAway() { if (!this.canThrow()) return false; const q = this.P[this.qb], d = this.dir(q.team); const ok = this.launch({ x: q.x, y: 2, z: q.z }, { vx: d * 9, vz: (q.z >= 0 ? 1 : -1) * 17, vy: 7 }); for (const p of this.P) p.tried = 1; this.box[q.team].att--; this.stats.att--; return ok; }
  // a timeout: the seconds the last play ran off the clock come back
  timeout(team = this.me) { if ((this.phase !== 'dead' && this.phase !== 'call' && this.phase !== 'pre') || this.to[team] < 1 || this.lastRun <= 0) return false; this.clock += this.lastRun; this.lastRun = 0; this.to[team]--; this.emit('timeout'); return true; }
  hurry() { if (this.phase === 'pre' && !this.human[this.poss]) this.pre = 99; }
  audible() { if (this.phase !== 'pre' || !this.human[this.poss] || this.isKO) return false; this.phase = 'call'; this.call[this.poss] = -1; this.ctls[this.poss] = -1; return true; }
  skip() { if (this.phase === 'dead') this.deadT = Math.min(this.deadT, 0.05); }
  snap() {
    if (this.phase !== 'pre') return false; if (this.isKO) { this.pre = 99; return true; } this.phase = 'live'; this.t = 0; this.stats.plays++; const qb = this.P[this.qb];
    if (this.play.kick) { this.kick(); return true; }
    this.ball.st = 'held'; this.ball.by = qb.id; this.carrier = qb.id; this.emit('snap');
    if (this.play.kneel) { qb.x -= this.dir(this.poss); return this.end('down', qb), true; } if (this.play.spike) { this.thrown = true; return this.end('inc'), true; }
    if (this.play.sneak) { this.handed = true; qb.job = 'runner'; qb.way = [{ x: this.los + this.dir(this.poss) * 3, z: 0 }]; }
    if (this.human[this.poss]) this.ctls[this.poss] = this.run ? -1 : qb.id;
    return true;
  }
  kick() {
    const d = this.dir(this.poss), k = this.P[this.qb], b = this.ball, fg = this.play.kick === 'fg'; this.emit('kick');
    if (fg) { const from = this.los - d * 7, dist = (50 - from * d) + 10, p = clamp(1.32 - dist / 68 - (dist > 45 ? (dist - 45) * 0.03 : 0) - 0.1 * this.wx.wet - 0.12 * this.wx.wind, 0, 0.98), good = this.rnd() < p, T = 1.6 + dist / 60;
      const tz = good ? (this.rnd() - 0.5) * 3 : (this.rnd() < 0.5 ? -1 : 1) * (4.5 + this.rnd() * 4), tx = (60 + (good ? 2 : 0)) * d; b.x = from; b.z = 0; b.y = 0.2;
      b.vx = (tx - from) / T; b.vz = tz / T; b.vy = (4.5 - 0.2) / T + G * T / 2; if (!good && dist > 50) { b.vx *= 0.85; } b.st = 'kick'; this.kickRes = { fg: true, good, dist: Math.round(dist) }; }
    else { const dist = 36 + this.rnd() * 14, T = 3.6 + this.rnd() * 0.6; b.x = k.x; b.z = k.z; b.y = 1; b.vx = d * (dist + 14) / T; b.vz = (this.rnd() - 0.5) * 12 / T; b.vy = G * T / 2 - 1 / T; b.st = 'kick'; this.kickRes = { fg: false }; }
    this.carrier = -1; b.by = -1;
  }

  // ---- the user's player ----
  act(m, t = this.me) { return this.move(this.ctls[t], m); }
  move(id, m) {
    const p = this.P[id]; if (!p || this.phase !== 'live' || p.st !== 'up' || p.cd > 0 || p.mv) return false; const car = id === this.carrier, d = hyp(p.vx, p.vz) || 1;
    if (car && (m === 'jukeL' || m === 'jukeR' || m === 'spin' || m === 'hurdle' || m === 'stiff' || m === 'dive')) {
      p.mv = m; p.mvT = { jukeL: 0.3, jukeR: 0.3, spin: 0.45, hurdle: 0.55, stiff: 0.7, dive: 0.3 }[m]; p.cd = 0.95; p.mx = p.vx / d; p.mz = p.vz / d; if (d < 1) { p.mx = this.dir(p.team); p.mz = 0; } this.emit('move', { m, id }); return true; }
    if (!car && p.team !== this.carrierTeam() && (m === 'dive' || m === 'hit' || m === 'jump')) { p.mv = m; p.mvT = m === 'jump' ? 0.6 : 0.35; p.cd = 1.0; p.mx = Math.cos(p.face); p.mz = Math.sin(p.face); this.emit('move', { m, id }); return true; }
    if (!car && m === 'jump') { p.mv = 'jump'; p.mvT = 0.6; p.cd = 1; this.emit('move', { m, id }); return true; }
    return false;
  }
  carrierTeam() { return this.carrier >= 0 ? this.P[this.carrier].team : this.ball.st === 'air' ? this.poss : -1; }
  // the nearest of the user's defenders to the ball becomes his player
  switchCtl(t = this.me) { if (this.phase !== 'live' && this.phase !== 'pre') return; if (this.carrier >= 0 && this.P[this.carrier].team === t) return;
    const b = this.ball.st === 'air' && this.ball.land ? this.ball.land : this.ball; let best = -1, bd = 1e9; for (const p of this.team(t)) { if (p.id === this.ctls[t] || p.st !== 'up') continue; const q = hyp(p.x - b.x, p.z - b.z); if (q < bd) { bd = q; best = p.id; } } if (best >= 0) this.ctls[t] = best; return best; }

  // ---- throwing ----
  // a pass led to a receiver: speed is the ball's speed over the ground (15 a lob, 25 a bullet)
  aim(from, r, speed, err = 0) {
    let T = 0.5, px = r.x, pz = r.z; const moving = r.job === 'route' && !(r.stop && r.wi >= (r.way ? r.way.length : 0));
    for (let i = 0; i < 4; i++) { px = r.x + (moving ? r.vx * T : 0); pz = r.z + (moving ? r.vz * T : 0); T = Math.max(0.25, hyp(px - from.x, pz - from.z) / speed); }
    px += (this.rnd() - 0.5) * 2 * err; pz += (this.rnd() - 0.5) * 2 * err; pz = clamp(pz, -FIELD.W - 2, FIELD.W + 2);
    return { vx: (px - from.x) / T, vz: (pz - from.z) / T, vy: (1.45 - from.y) / T + G * T / 2 };
  }
  throwTo(id, lob = false, from, wild = 1) {
    const qb = this.P[this.carrier], r = this.P[id]; if (!this.canThrow() || !r || r.team !== qb.team || !r.elig) return false;
    from = from || { x: qb.x, y: 2.0, z: qb.z }; const dist = hyp(r.x - from.x, r.z - from.z), sp = lob ? clamp(11 + dist * 0.22, 13, 19) : clamp(17 + dist * 0.28, 19, 27);
    return this.launch(from, this.aim(from, r, sp, (0.25 + dist * 0.012) * wild));
  }
  // a pass thrown by hand: its own velocity, bent toward a receiver if one is near its line
  throwVel(from, v) {
    if (!this.canThrow()) return false; const qb = this.P[this.carrier], h = hyp(v.vx, v.vz); if (h < 2) return false; let best = null, ba = 0.3;
    for (const r of this.team(qb.team)) { if (!r.elig || r.st !== 'up') continue; const dx = r.x - from.x, dz = r.z - from.z, dd = hyp(dx, dz); if (dd < 2) continue; const a = Math.acos(clamp((dx * v.vx + dz * v.vz) / (dd * h), -1, 1)); if (a < ba) { ba = a; best = r; } }
    if (best) { const dist = hyp(best.x - from.x, best.z - from.z); return this.launch(from, this.aim(from, best, clamp(h, 13, 27), 0.3 + ba * 6 + dist * 0.01)); }
    const s = Math.min(1, 32 / hyp(v.vx, v.vy, v.vz)); return this.launch(from, { vx: v.vx * s, vy: v.vy * s, vz: v.vz * s });
  }
  canThrow() { if (this.phase !== 'live' || this.carrier !== this.qb || this.thrown || this.handed && !this.play.pa) return false; const q = this.P[this.qb]; return q.st === 'up' && (q.x - this.los) * this.dir(q.team) < 0.5; }
  launch(from, v) {
    const b = this.ball; Object.assign(b, { x: from.x, y: from.y, z: from.z, vx: v.vx, vy: v.vy, vz: v.vz, st: 'air', by: -1 }); this.thrown = true; this.carrier = -1; this.stats.att++; this.box[this.poss].att++;
    const T = (v.vy + Math.sqrt(Math.max(0, v.vy * v.vy + 2 * G * (from.y - 1.2)))) / G; b.land = { x: from.x + v.vx * T, z: from.z + v.vz * T, T, t: 0, far: hyp(v.vx, v.vz) * T };
    let tg = -1, bd = 1e9; for (const r of this.team(this.poss)) { if (!r.elig) continue; const q = hyp(r.x + r.vx * T * 0.5 - b.land.x, r.z + r.vz * T * 0.5 - b.land.z); if (q < bd) { bd = q; tg = r.id; } } b.tgt = tg;
    for (const p of this.P) p.tried = -1; this.emit('throw'); if (this.human[this.poss] && tg >= 0) this.ctls[this.poss] = -1; return true;
  }

  // ---- one step ----
  step(dt) {
    if (this.phase === 'call' && !this.human[0] && !this.human[1]) this.pick(0, -1);
    if ((this.phase === 'call' || this.phase === 'pre') && this.human[this.poss] && this.mode !== 'practice' && !this.isKO) { this.pc -= dt; if (this.pc <= 0) { const d = this.dir(this.poss), x = this.los - 5 * d; this.msg = 'DELAY OF GAME, 5 YARDS'; this.emit('flag'); this.spot(x * d < -49 ? this.los : x, false); return; } }
    if (this.phase === 'pre' && this.isKO) { this.pre += dt; if (this.pre > 2.5) { this.phase = 'live'; this.stats.plays++; this.emit('kickoff'); } return; }
    if (this.phase === 'pre') { this.pre += dt; for (const p of this.P) this.settle(p, dt); if (!this.human[this.poss] && this.pre > (this.human[1 - this.poss] ? 5.5 : 3.5)) this.snap(); return; }
    if (this.phase === 'dead') { this.deadT -= dt; for (const p of this.P) { p.vx *= 0.8; p.vz *= 0.8; if (p.st === 'down') { p.dn -= dt; if (p.dn <= 0) p.st = 'up'; } p.y = Math.max(0, p.y - dt * 3); } if (this.deadT <= 0) this.next(); return; }
    if (this.phase !== 'live') return;
    this.t += dt; if (this.mode !== 'practice') this.clock = Math.max(0, this.clock - dt);
    if (this.ball.st === 'kick') return this.flyKick(dt);
    const o = this.poss, d = this.dir(o), b = this.ball, car = this.carrier >= 0 ? this.P[this.carrier] : null;
    if (this.run && !this.handed && this.t >= this.run.ho && car && car.id === this.qb && car.st === 'up') { this.handed = true; this.carrier = this.run.id; b.by = this.run.id; this.emit('handoff'); this.autoT = this.t + 0.9; if (this.human[o]) this.ctls[o] = this.run.id; }
    if (car && car.team === o && (car.x - this.los) * d > 0.5) this.past = true;
    this.blocks(dt);
    for (const p of this.P) this.think(p, dt);
    this.collide();
    for (const p of this.P) { p.x += p.vx * dt; p.z += p.vz * dt; if (hyp(p.vx, p.vz) > 0.6) p.face = Math.atan2(p.vz, p.vx); }
    if (b.st === 'air') this.flyBall(dt); else if (this.carrier >= 0) { const c = this.P[this.carrier]; b.x = c.x + Math.cos(c.face) * 0.3; b.z = c.z + Math.sin(c.face) * 0.3; b.y = 1.1 + c.y; this.carried(c); }
  }
  settle(p, dt) { const dx = p.hx - p.x, dz = p.hz - p.z, q = hyp(dx, dz); if (q > 0.05) { const s = Math.min(q, 5 * dt); p.x += dx / q * s; p.z += dz / q * s; } }
  go(p, gx, gz, frac, dt, arrive = true) {
    let dx = gx - p.x, dz = gz - p.z, q = hyp(dx, dz), s = p.spd * frac; if (arrive && q < 1.5) s *= q / 1.5; if (q < 0.01) { dx = 0; dz = 0; q = 1; }
    const ax = dx / q * s - p.vx, az = dz / q * s - p.vz, a = hyp(ax, az), m = 26 * (1 - 0.3 * this.wx.wet) * dt; if (a > m) { p.vx += ax / a * m; p.vz += az / a * m; } else { p.vx += ax; p.vz += az; }
  }
  // who blocks whom: each blocker takes the nearest defender nobody has; a held defender crawls until he sheds
  blocks(dt) {
    const o = this.carrierTeam(); if (o < 0) return; const D = this.team(1 - o).filter(p => p.st === 'up'); for (const q of this.P) { q.blk = -1; q.blkN = 0; }
    const prot = this.carrier >= 0 ? this.P[this.carrier] : this.P[this.qb];
    for (const b of this.team(o)) {
      if (b.job !== 'block' || b.st !== 'up' || b.stun > 0 || b.id === this.carrier) { b.bt = -1; continue; }
      let best = null, bd = 1e9; if (b.ord != null && this.P[b.ord].st === 'up') best = this.P[b.ord];
      else for (const q of D) { if (q.blkN > 0 && !LINE.has(b.role)) continue; const m = hyp(q.x - b.x, q.z - b.z) + 0.45 * hyp(q.x - prot.x, q.z - prot.z) + q.blkN * 6 + (q.job === 'rush' || q.job === 'pursue' ? 0 : 5); if (m < bd) { bd = m; best = q; } }
      b.bt = best ? best.id : -1; if (!best) continue; best.blkN++;
      if (hyp(best.x - b.x, best.z - b.z) < 1.25 && best.free <= 0 && !best.mv) { best.blk = b.id; const k = (SHED[best.role] || 0.3) * (best.id === this.ctls[best.team] ? 2.2 : 1) * (this.past ? 1.6 : this.run && !this.thrown ? 0.2 : this.human[o] && !this.human[1 - o] ? this.K.shed : 1); if (this.rnd() < k * dt) { best.free = 1.3; b.stun = 0.8; best.blk = -1; } }
    }
  }
  think(p, dt) {
    const o = this.poss, d = this.dir(o), b = this.ball; p.cd = Math.max(0, p.cd - dt); p.tk = Math.max(0, p.tk - dt); p.stun = Math.max(0, p.stun - dt); p.free = Math.max(0, p.free - dt); p.hold = Math.max(0, p.hold - dt);
    if (p.st === 'down') { p.vx *= 0.85; p.vz *= 0.85; p.dn -= dt; if (p.dn <= 0 && p.id !== this.downed) p.st = 'up'; return; }
    if (p.mv) { p.mvT -= dt; this.moving(p, dt); if (p.mvT <= 0) { const m = p.mv; p.mv = ''; p.y = 0; if (m === 'dive' || m === 'hit') { if (p.id === this.carrier) return this.end('down', p); if (m === 'dive') { p.st = 'down'; p.dn = 1.1; } else p.stun = 0.5; } } if (p.mv === 'dive' || p.mv === 'hit' || p.mv === 'jukeL' || p.mv === 'jukeR') return; }
    if (p.stun > 0) { p.vx *= 0.9; p.vz *= 0.9; return; }
    const user = p.id === this.ctls[p.team];
    if (user) { const I = this.ins[p.team], m = hyp(I.x, I.z), auto = m <= 0.15 && p.id === this.carrier && (p.id === this.qb ? !this.handed && this.t < 1.3 : this.t < (this.autoT || 0)); if (!auto && (m > 0.15 || p.id === this.carrier)) { const f = Math.min(1, m) * (I.sprint ? 1 : 0.86) * (p.id === this.carrier ? (this.past ? 0.92 : 0.99) * (p.hold > 0 ? 0.5 : 1) : 1) * (p.blk >= 0 ? 0.25 : 1) * (p.mv === 'stiff' ? 0.9 : 1); this.go(p, p.x + I.x * 10, p.z + I.z * 10, m > 0.15 ? f : 0, dt, false); this.bounds(p); return; }
      }
    if (p.id === this.carrier) return this.carry(p, dt, user);
    const air = b.st === 'air' && b.land, car = this.carrier >= 0 ? this.P[this.carrier] : null;
    if (p.team === this.carrierTeam() || (this.carrier < 0 && p.team === o)) {
      // the ball's side
      if (air && p.id === b.tgt) return this.go(p, b.land.x, b.land.z, 1, dt);
      if (car && car.team !== o) return this.blockJob(p, dt);                                                    // after a turnover everyone blocks
      if (p.job === 'qb') { const drop = this.play.drop || 5, gx = this.los - d * drop; if (this.handed || this.thrown) return this.go(p, gx - d * 1, p.z + (this.run ? -Math.sign(this.P[this.run.id].z - p.z || 1) * 2 : 0), 0.4, dt);
        if (this.run) { const r = this.P[this.run.id]; return this.go(p, (p.x + r.x) / 2, (p.z + r.z) / 2, 0.6, dt); }
        this.go(p, gx, p.z, 0.75, dt); if (!this.human[o]) this.cpuQB(p); return; }
      if (p.job === 'runner') { if (!this.handed) { const q = this.P[this.qb]; return this.go(p, q.x + d * 0.5, q.z, 0.8, dt, false); } return this.blockJob(p, dt); }
      if (p.job === 'route' && !(car && car.id !== this.qb && this.past)) { const w = p.way[p.wi]; if (w) { this.go(p, w.x, w.z, 1, dt, p.stop && p.wi === p.way.length - 1); if (hyp(w.x - p.x, w.z - p.z) < 1.2) { for (const q of this.team(1 - o)) if (q.job === 'man' && q.tgt === p.id) q.lagT = this.human[o] ? this.K.lag : 0.24; if (p.wi === p.way.length - 1 && !p.stop) { const a = p.way[p.wi - 1] || { x: p.hx, z: p.hz }, l = hyp(w.x - a.x, w.z - a.z) || 1; p.way.push({ x: clamp(w.x + (w.x - a.x) / l * 30, -57, 57), z: clamp(w.z + (w.z - a.z) / l * 30, -FIELD.W + 2, FIELD.W - 2) }); p.stop = true; } p.wi++; } }
        else { const q = this.P[this.qb]; this.go(p, p.x + (q.x - p.x) * 0.05, p.z + Math.sin(this.t * 2 + p.id) * 1.5, 0.35, dt); } this.bounds(p); return; }
      return this.blockJob(p, dt);
    }
    // the other side
    const slow = p.blk >= 0 ? (this.run && !this.thrown ? 0.1 : 0.2) : p.job === 'rush' && this.human[o] && !this.past && !this.thrown && !this.handed ? this.K.rush : 1; let aim = null;
    if (air && (p.job !== 'rush' || hyp(b.land.x - p.x, b.land.z - p.z) < 8)) { if (hyp(b.land.x - p.x, b.land.z - p.z) < 14 || p.tgt === b.tgt) aim = b.land; }
    if (!aim && car && (p.job === 'rush' || car.team !== o || this.past || (this.handed && this.t > (this.run ? this.run.ho : 0) + 1.0) || car.id !== this.qb && car.team === o && this.thrown)) { const q = hyp(car.x - p.x, car.z - p.z), T = Math.min(1.6, q / p.spd); aim = { x: car.x + car.vx * T, z: car.z + car.vz * T }; if (p.job !== 'rush') p.job = 'pursue'; }
    if (!aim && p.job === 'man' && p.lagT > 0) { p.lagT -= dt; aim = { x: p.x + p.vx, z: p.z + p.vz }; }
    if (!aim && p.job === 'man') { const r = this.P[p.tgt]; aim = { x: r.x + r.vx * 0.3 + d * 1.4, z: r.z + r.vz * 0.3 }; }
    if (!aim && p.job === 'zone' && p.deep) { let deep = p.zone.x * d, z = p.zone.z, bd = 13; for (const r of this.team(o)) { if (!r.elig) continue; const q = Math.abs(r.z - p.zone.z); if (q < 13 && r.x * d + 5 > deep) { deep = r.x * d + 5; if (q < bd) { bd = q; z = r.z * 0.6 + p.zone.z * 0.4; } } } aim = { x: deep * d, z }; }
    if (!aim && p.job === 'zone') { aim = p.zone; let bd = 9; for (const r of this.team(o)) { if (!r.elig) continue; const q = hyp(r.x - p.zone.x, r.z - p.zone.z); if (q < bd) { bd = q; aim = { x: r.x * 0.75 + p.zone.x * 0.25 + d * 1.6, z: r.z * 0.8 + p.zone.z * 0.2 }; } } }
    if (!aim) aim = car ? car : this.P[this.qb];
    this.go(p, aim.x, aim.z, slow, dt, p.job === 'zone' && !air); this.bounds(p);
  }
  blockJob(p, dt) { const q = p.bt >= 0 ? this.P[p.bt] : null; if (p.job !== 'block') { p.job = 'block'; return; } if (!q) return this.go(p, p.x + this.dir(p.team) * 4, p.z, 0.5, dt);
    const c = this.carrier >= 0 ? this.P[this.carrier] : this.P[this.qb], dx = c.x - q.x, dz = c.z - q.z, l = hyp(dx, dz) || 1; this.go(p, q.x + dx / l * 0.9, q.z + dz / l * 0.9, 1, dt, false); }
  bounds(p) { if (p.id !== this.carrier) { if (Math.abs(p.z) > FIELD.W + 1) p.vz = -Math.sign(p.z) * 2; if (Math.abs(p.x) > 59) p.vx = -Math.sign(p.x) * 2; } }
  moving(p, dt) {
    const m = p.mv, s = p.spd; if (m === 'jukeL' || m === 'jukeR') { const k = m === 'jukeL' ? 1 : -1; p.vx = p.mx * s * 0.55 + p.mz * k * 8.5; p.vz = p.mz * s * 0.55 - p.mx * k * 8.5; }
    else if (m === 'spin') { p.face += dt * 14; } else if (m === 'hurdle' || m === 'jump') { const T = m === 'jump' ? 0.6 : 0.55, u = 1 - p.mvT / T; p.y = Math.max(0, 4 * u * (1 - u) * (m === 'jump' ? 0.9 : 0.8)); }
    else if (m === 'dive' || m === 'hit') { p.vx = p.mx * s * 1.25; p.vz = p.mz * s * 1.25; p.y = 0; }
  }
  // the ball carrier on his own: his play's path, then the goal line, bending away from tacklers ahead
  carry(p, dt, user) {
    const d = this.dir(p.team), w = p.way && p.way[p.wi]; let gx, gz;
    if (p.id === this.qb && !this.handed && !this.past && !this.scr) { const drop = this.play.drop || 5; this.go(p, this.los - d * drop, p.z, 0.75, dt); if (!this.human[p.team]) this.cpuQB(p); return; }
    if (w && p.team === this.poss && (w.x - p.x) * d > 0.5) { gx = w.x; gz = w.z; if (hyp(gx - p.x, gz - p.z) < 1.5) p.wi++; } else { gx = p.x + d * 10; gz = p.z; if (w) p.wi++; }
    let ax = gx - p.x, az = gz - p.z, l = hyp(ax, az) || 1; ax /= l; az /= l; let near = 9, side = 0;
    for (const q of this.team(1 - p.team)) { if (q.st !== 'up') continue; const dx = q.x - p.x, dz = q.z - p.z, r = hyp(dx, dz); if (r > 8 || dx * d < -1.5) continue; const k = (q.blk >= 0 ? 0.5 : 1.3) / (r + 0.6); az -= dz / (Math.abs(dz) + 0.3) * k; if (r < near && q.blk < 0) { near = r; side = dz; } }
    if (Math.abs(p.z) > FIELD.W - 3) az -= Math.sign(p.z) * 1.2; l = hyp(ax, az) || 1; this.go(p, p.x + ax / l * 10, p.z + az / l * 10, (p.mv === 'stiff' ? 0.85 : this.past ? 0.91 : 0.99) * (p.hold > 0 ? 0.5 : 1), dt, false);
    if (!user && near < 2.4 && !p.mv && p.cd <= 0 && this.rnd() < 2.2 * dt) this.move(p.id, this.rnd() < 0.3 ? 'spin' : this.rnd() < 0.3 ? 'stiff' : side > 0 ? 'jukeR' : 'jukeL');
  }
  open(r, T = 0.6) { let m = 99; const px = r.x + r.vx * T, pz = r.z + r.vz * T; for (const q of this.team(1 - r.team)) { if (q.st !== 'up') continue; const e = hyp(q.x + q.vx * T * 0.7 - px, q.z + q.vz * T * 0.7 - pz); if (e < m) m = e; } return m; }
  cpuQB(p) {
    if (!this.canThrow() || this.run && !this.play.pa || this.t < 1.3 + (this.human[1 - p.team] ? this.K.read : 0)) return; const d = this.dir(p.team); let heat = 99; for (const q of this.team(1 - p.team)) if (q.st === 'up' && q.blk < 0) heat = Math.min(heat, hyp(q.x - p.x, q.z - p.z));
    if ((this.qbT || 0) > this.t && heat > 2.5) return; this.qbT = this.t + 0.25; let best = null, bs = this.t > 3.6 || heat < 3 ? 1.6 : this.t > 2.4 ? 2.8 : 3.8;
    for (const r of this.team(p.team)) { if (!r.elig || r.st !== 'up' || r.job !== 'route') continue; const dist = hyp(r.x - p.x, r.z - p.z); if (dist < 3 || dist > 55) continue; const s = this.open(r, dist / 22) + (r.x - this.los) * d * 0.035; if (s > bs) { bs = s; best = r; } }
    if (best) return this.throwTo(best.id, hyp(best.x - p.x, best.z - p.z) > 28, null, this.human[1 - p.team] ? this.K.wild + 0.8 : 3.2);
    if (heat < 2.6 && this.t > 1.8 && this.rnd() < 0.45) { this.scr = true; return; }   // nobody open and the rush is home: he runs
    if (this.t > 5 || heat < 2.3 && this.t > 1.5) { const from = { x: p.x, y: 2, z: p.z }; this.launch(from, { vx: d * 9, vz: (p.z > 0 ? 1 : -1) * 16, vy: 6 }); }
  }
  collide() {
    const P = this.P; for (let i = 0; i < 22; i++) { const a = P[i]; if (a.st !== 'up') continue; for (let j = i + 1; j < 22; j++) { const c = P[j]; if (c.st !== 'up') continue; const dx = c.x - a.x, dz = c.z - a.z, q = dx * dx + dz * dz; if (q > 0.81 || q < 1e-6) continue;
      const r = Math.sqrt(q), push = (0.9 - r) * 0.5, nx = dx / r, nz = dz / r; a.x -= nx * push; a.z -= nz * push; c.x += nx * push; c.z += nz * push;
      if (a.team !== c.team) { const b = a.blk === c.id ? c : c.blk === a.id ? a : null; if (b) { const h = b === a ? c : a, drive = this.run && !this.thrown, s = this.dir(b.team); h.vx += s * (drive ? 0.5 : 0.15); if (drive) { h.x += s * 0.045; b.x += s * 0.03; } } } } }
  }
  carried(c) {
    const d = this.dir(c.team);
    if (c.x * d >= FIELD.L) return this.end('td', c);
    if (Math.abs(c.z) > FIELD.W) return this.end('oob', c);
    if (c.mv === 'dive') return;
    for (const q of this.team(1 - c.team)) {
      if (q.st !== 'up' || q.tk > 0 || q.stun > 0) continue; const r = hyp(q.x - c.x, q.z - c.z), lunge = q.mv === 'dive' || q.mv === 'hit'; if (r > (lunge ? 1.45 : 1.05)) continue; q.tk = 0.55;
      let p = (lunge ? 0.93 : 0.86) * (this.human[c.team] ? this.K.tackle : this.human[q.team] ? 2 - this.K.tackle : 1); if (q.blk >= 0) p *= this.run && !this.past ? 0.18 : 0.45; const front = ((q.x - c.x) * c.vx + (q.z - c.z) * c.vz) > 0;
      if (c.mv === 'jukeL' || c.mv === 'jukeR') p *= 0.22; else if (c.mv === 'spin') p *= 0.3; else if (c.mv === 'stiff' && front) p *= 0.4; else if (c.mv === 'hurdle') p *= lunge ? 0.15 : 0.6;
      if (c.id === this.qb && !this.past && !c.mv) p = Math.max(p, 0.85);
      if (this.rnd() < p) { const hit = q.mv === 'hit'; q.mv = ''; if (!(c.id === this.qb && !this.past) && this.rnd() < (hit ? 0.07 : 0.012) * (1 + this.wx.wet)) return this.end('fumble', c, q); return this.end('tackle', c, q); }
      q.st = 'down'; q.dn = 0.9; q.mv = ''; q.y = 0; c.vx *= 0.8; c.vz *= 0.8; this.emit('miss', { id: q.id });
    }
  }
  flyBall(dt) {
    const b = this.ball; b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.land.t += dt;
    if (b.y <= 0.15) return this.end('inc');
    if (Math.abs(b.z) > FIELD.W + 3 || Math.abs(b.x) > 62) return this.end('inc');
    if (b.land.t < 0.18) return;
    const near = this.P.filter(p => p.st === 'up' && p.tried !== 1 && p.id !== this.qb && hyp(p.x - b.x, p.z - b.z) < 1.35 && b.y < (p.mv === 'jump' ? 3.5 : 2.75) + (p.id === this.ctls[p.team] ? 0.15 : 0)).sort((a, c) => (a.team === this.poss ? 1 : 0) - (c.team === this.poss ? 1 : 0));
    for (const p of near) { p.tried = 1; const mine = p.id === this.ctls[p.team];
      if (p.team !== this.poss) { const r = this.rnd(), pi = mine ? (p.mv === 'jump' ? 0.45 : 0.22) : 0.045, ps = mine ? 0.35 : 0.24; if (r < pi) { this.stats.int++; this.box[this.poss].int++; this.grab(p); this.emit('int', { id: p.id }); this.picked = true; return; } if (r < pi + ps) { this.emit('swat', { id: p.id }); b.vx *= 0.25; b.vz *= 0.25; b.vy = Math.min(b.vy, -2); for (const q of this.P) q.tried = 1; return; } continue; }
      if (!p.elig) continue; let cov = 0; for (const q of this.team(1 - p.team)) if (q.st === 'up' && hyp(q.x - p.x, q.z - p.z) < 2.1) cov++;
      if (this.rnd() < 0.94 - Math.min(2, cov) * 0.2 - 0.1 * this.wx.wet - Math.max(0, b.land.far - 15) * 0.007) { this.stats.comp++; this.box[this.poss].comp++; this.caught = true; this.grab(p); this.emit('catch', { id: p.id }); return; } this.emit('drop', { id: p.id }); }
  }
  grab(p) { const b = this.ball; b.st = 'held'; b.by = p.id; this.carrier = p.id; b.land = null; p.way = null; p.job = 'carry'; p.hold = 0.5; if (this.human[p.team]) this.ctls[p.team] = p.id; if (this.human[1 - p.team] && this.ctls[1 - p.team] < 0) this.switchCtl(1 - p.team);
    if (p.team === this.poss && (p.x - this.los) * this.dir(p.team) > 0) this.past = true; }
  flyKick(dt) {
    const b = this.ball, d = this.dir(this.poss); b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    for (const p of this.P) { const dn = p.team !== this.poss; this.go(p, dn ? p.x : p.x + d * 3, p.z, dn ? 0 : 0.5, dt); p.x += p.vx * dt; p.z += p.vz * dt; }
    const K = this.kickRes; if (K.fg && (b.x * d >= 60 || b.y <= 0.15)) { const good = K.good && b.x * d >= 59.5; return this.end(good ? 'fg' : 'nofg'); }
    if (!K.fg && b.y <= 0.15) this.end('punt');
  }

  // ---- the whistle ----
  end(k, c, by) {
    if (this.phase !== 'live') return; const o = this.poss, d = this.dir(o), b = this.ball; this.phase = 'dead'; this.deadT = 2.6; this.downed = c ? c.id : -1; let msg = '', next;
    if (c && k !== 'td') { c.st = 'down'; c.dn = 9; c.vx *= 0.3; c.vz *= 0.3; c.mv = ''; c.y = 0; } if (by) { by.st = 'down'; by.dn = 1.2; }
    const gain = c ? Math.round((c.x - this.los) * d) : 0, turn = c && c.team !== o;
    const B = this.box[o];
    if (k === 'td') { const t = c.team; this.score[t] += 6; this.box[t].td++; if (t === o && !this.isKO) { if (this.caught) B.pass += gain; else { B.rush += gain; B.runs++; } } const xp = this.rnd() < 0.95; if (xp) this.score[t]++; msg = 'TOUCHDOWN ' + this.names[t] + (xp ? '' : ' (KICK NO GOOD)'); this.stats.td++; next = { kick: 1 - t }; this.emit('td', { team: t }); }
    else if (k === 'fg') { this.score[o] += 3; msg = this.kickRes.dist + ' YARD FIELD GOAL IS GOOD'; next = { kick: 1 - o }; this.emit('fgood'); }
    else if (k === 'nofg') { msg = 'FIELD GOAL NO GOOD'; next = { poss: 1 - o, x: this.los }; this.emit('fgno'); }
    else if (k === 'punt') { let x = b.x; if (x * d >= 50) x = 30 * d; msg = 'PUNT'; next = { poss: 1 - o, x: clamp(x, -48, 48) }; }
    else if (k === 'inc') { msg = this.picked ? '' : 'INCOMPLETE'; next = { x: this.los, down: 1 }; this.emit('inc'); }
    else if (k === 'fumble') { this.box[c.team].fum++; msg = 'FUMBLE! ' + this.names[1 - c.team] + ' RECOVER'; next = { poss: 1 - c.team, x: c.x }; this.emit('tackle'); }
    else if (this.isKO) { const td = this.dir(c.team); let x = c.x; if (x * td <= -50) x = -25 * td; msg = 'RETURNED TO THE ' + Math.round(50 - Math.abs(x)) + (x * td > 0 ? ' (THEIR SIDE)' : ''); next = { poss: c.team, x }; this.emit('tackle'); }
    else if (turn) { let x = c.x; const td = this.dir(c.team); if (x * td <= -50) x = -30 * td; msg = (this.picked ? 'INTERCEPTED' : 'TURNOVER') + ', ' + this.names[c.team] + ' BALL'; next = { poss: c.team, x }; this.emit('tackle'); }
    else { if (c.x * d <= -50) { this.score[1 - o] += 2; msg = 'SAFETY'; next = { kick: 1 - o }; this.emit('tackle'); }
      else { const sack = c.id === this.qb && !this.handed && gain < 0 && !this.play.kneel; if (sack) { this.stats.sack++; B.sack++; } else if (this.caught) B.pass += gain; else if (!this.play.kneel) { B.rush += gain; B.runs++; } msg = sack ? 'SACK, LOSS OF ' + -gain : k === 'oob' ? 'OUT OF BOUNDS, ' + (gain >= 0 ? 'GAIN OF ' + gain : 'LOSS OF ' + -gain) : gain > 0 ? 'GAIN OF ' + gain : gain < 0 ? 'LOSS OF ' + -gain : 'NO GAIN'; next = { x: c.x, down: 1 }; this.emit(k === 'oob' ? 'whistle' : 'tackle'); } }
    if (next.down) { if ((next.x - this.first) * d >= 0) { next.first = true; msg += ', FIRST DOWN'; B.first++; this.emit('first'); } else if (this.down === 4) { next = { poss: 1 - o, x: next.x }; msg += ', TURNOVER ON DOWNS'; } }
    this.picked = false; this.msg = msg; this.nextUp = next; this.result = { k, gain, msg }; { const runs = next.down && k !== 'inc' && k !== 'oob' && this.mode !== 'practice'; this.lastRun = runs ? Math.min(this.clock, this.clock <= 120 && this.q % 2 === 0 ? 8 : 14) : 0; this.clock -= this.lastRun; } this.emit('whistle');
    if (c) { b.x = c.x; b.z = c.z; b.y = 0.2; } b.st = 'dead'; this.carrier = -1;
  }
  next() {
    const n = this.nextUp;
    if (this.mode === 'practice') { this.poss = 0; return this.spot(-20, true); }
    if (this.mode === 'drill') { const won = this.score[0] > this.score[1]; if (won || this.clock <= 0 || n.poss === 1 || n.kick != null) { this.phase = 'over'; this.msg = won ? 'YOU WIN THE DRILL' : this.clock <= 0 ? 'TIME IS UP' : 'DRIVE OVER'; this.emit('over'); return; } }
    if (this.clock <= 0) { this.q++; this.clock = this.qlen; if (this.q > 4) { this.phase = 'over'; this.msg = this.score[0] === this.score[1] ? 'FINAL: A TIE' : 'FINAL: ' + this.names[this.score[0] > this.score[1] ? 0 : 1] + ' WIN'; this.emit('over'); return; } if (this.q === 3) { this.to = [3, 3]; this.emit('quarter'); return this.kickoff(1 - (this.firstPoss ?? 0)); } this.emit('quarter'); }
    if (n.kick != null) return this.kickoff(n.kick);
    if (n.poss != null) { this.poss = n.poss; return this.spot(n.x, true); }
    if (n.first) return this.spot(n.x, true);
    this.down++; this.spot(n.x, false);
  }
}

// ---- 1 v 1: the page that runs the game sends what the other needs to draw it; the other lays it over a game it does not run ----
const r2 = v => Math.round((v || 0) * 100) / 100;
Game.prototype.snapshot = function (ev) { const b = this.ball, pre = this.phase === 'pre';
  return { ph: this.phase, po: this.poss, qb: this.qb ?? -1, sc: this.score, msg: this.msg, q: this.q, ck: r2(this.clock), ca: this.carrier, los: r2(this.los), fi: r2(this.first), dn: this.down, pa: this.past ? 1 : 0, th: this.thrown ? 1 : 0, ha: this.handed ? 1 : 0, t: r2(this.t), call: this.call, ct: this.ctls, run: this.run ? this.run.id : -1, to: this.to, pc: r2(this.pc ?? 30), lr: this.lastRun, tip: this.tip, ko: this.isKO ? 1 : 0, box: this.box, md: this.mode,
    P: this.P.map(p => [r2(p.x), r2(p.z), r2(p.vx), r2(p.vz), r2(p.y), r2(p.face), p.st, p.mv || '', r2(p.mvT), p.elig ? 1 : 0, p.role, p.job, pre && p.way ? p.way.map(w => [r2(w.x), r2(w.z)]) : 0, r2(p.hx), r2(p.hz)]),
    b: [r2(b.x), r2(b.y), r2(b.z), r2(b.vx), r2(b.vy), r2(b.vz), b.st, b.by, b.tgt, b.land ? [r2(b.land.x), r2(b.land.z), r2(b.land.T), r2(b.land.t)] : 0], ev: ev || [] }; };
// the second player's game: it is drawn from the first's snapshots, moved on between them, and what its player does is sent, not done
export class Remote extends Game {
  constructor(o, send) { super({ ...o, human: [true, true], ko: false }); this.me = 1; this.send = send; this.remote = true; }
  read(s) { if (!s || !Array.isArray(s.P) || s.P.length !== 22) return;
    this.phase = s.ph; this.poss = s.po; this.qb = s.qb; this.score = s.sc; this.msg = s.msg; this.q = s.q; this.clock = s.ck; this.carrier = s.ca; this.los = s.los; this.first = s.fi; this.down = s.dn; this.past = !!s.pa; this.thrown = !!s.th; this.handed = !!s.ha; this.t = s.t; this.call = s.call; this.ctls = s.ct; this.run = s.run >= 0 ? { id: s.run } : null; if (s.to) { this.to = s.to; this.pc = s.pc; this.lastRun = s.lr; this.tip = s.tip; this.isKO = !!s.ko; this.box = s.box; this.mode = s.md; }
    if (this.call[s.po] >= 0 && this.call[1 - s.po] >= 0) { this.play = OFFENSE[this.call[s.po]]; this.dplay = DEFENSE[this.call[1 - s.po]]; }
    s.P.forEach((a, i) => { const p = this.P[i]; p.x = a[0]; p.z = a[1]; p.vx = a[2]; p.vz = a[3]; p.y = a[4]; p.face = a[5]; p.st = a[6]; p.mv = a[7]; p.mvT = a[8]; p.elig = !!a[9]; p.role = a[10]; p.job = a[11]; if (s.ph === 'pre') p.way = a[12] ? a[12].map(w => ({ x: w[0], z: w[1] })) : null; p.hx = a[13]; p.hz = a[14]; });
    const b = this.ball, q = s.b; b.x = q[0]; b.y = q[1]; b.z = q[2]; b.vx = q[3]; b.vy = q[4]; b.vz = q[5]; b.st = q[6]; b.by = q[7]; b.tgt = q[8]; b.land = q[9] ? { x: q[9][0], z: q[9][1], T: q[9][2], t: q[9][3] } : null; this.ev.push(...(s.ev || [])); }
  step(dt) { if (this.phase !== 'live') return; for (const p of this.P) { p.x += p.vx * dt; p.z += p.vz * dt; } const b = this.ball;
    if (b.st === 'air' || b.st === 'kick') { b.x += b.vx * dt; b.z += b.vz * dt; b.y = Math.max(0.15, b.y + b.vy * dt); b.vy -= G * dt; } else if (b.st === 'held' && this.P[b.by]) { b.x = this.P[b.by].x; b.z = this.P[b.by].z; } }
  pick(team, n) { if (this.phase !== 'call') return false; if (n >= 0) this.call[team] = n; this.send('pick', [n]); return true; }
  throwAway() { if (!this.canThrow()) return false; this.send('away'); return true; } timeout() { this.send('to'); return true; } hurry() { this.send('hurry'); }
  snap() { this.send('snap'); return true; } audible() { this.send('audible'); return true; } skip() { this.send('skip'); } act(m) { this.send('act', [m]); return true; } switchCtl() { this.send('sw'); }
  order(id, o) { this.send('order', [id, o]); return true; } throwTo(id, lob, from, wild) { if (!this.canThrow()) return false; this.send('throw', [id, lob ? 1 : 0, from || null, wild ?? 1]); return true; } throwVel(from, v) { if (!this.canThrow()) return false; this.send('tv', [from, v]); return true; }
}
// what the second player asked for, done for their side by the game that runs
const MOVES = ['jukeL', 'jukeR', 'spin', 'dive', 'hurdle', 'jump', 'hit', 'stiff'], fin = v => typeof v === 'number' && Number.isFinite(v), pt = o => o && fin(o.x) && fin(o.z) && (o.y == null || fin(o.y));
Game.prototype.cmd = function (c, a = []) { const T = 1, mine = this.poss === T;
  if (c === 'in') { const I = this.ins[T]; I.x = fin(a[0]) ? clamp(a[0], -1, 1) : 0; I.z = fin(a[1]) ? clamp(a[1], -1, 1) : 0; I.sprint = !!a[2]; return; }
  if (c === 'pick') { const n = a[0] | 0, L = mine ? OFFENSE : DEFENSE; if (n >= 0 && n < L.length) this.pick(T, n); return; }
  if (c === 'snap') { if (mine) this.snap(); return; } if (c === 'audible') { if (mine) this.audible(); return; } if (c === 'skip') return this.skip(); if (c === 'sw') return this.switchCtl(T);
  if (c === 'away') { if (mine) this.throwAway(); return; } if (c === 'to') return void this.timeout(T); if (c === 'hurry') return this.hurry();
  if (c === 'act') { if (typeof a[0] === 'string' && a[0].length < 12) this.act(a[0], T); return; }
  if (c === 'order') { const p = this.P[a[0] | 0], o = a[1]; if (p && p.team === T && o && typeof o === 'object') this.order(p.id, o); return; }
  if (c === 'throw') { const r = this.P[a[0] | 0]; if (mine && r && r.team === T) this.throwTo(r.id, !!a[1], pt(a[2]) ? a[2] : undefined, fin(a[3]) ? clamp(a[3], 0.2, 3) : 1); return; }
  if (c === 'tv') { const v = a[1]; if (mine && pt(a[0]) && fin(a[0].y) && v && fin(v.vx) && fin(v.vy) && fin(v.vz)) this.throwVel(a[0], v); } };
