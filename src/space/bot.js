// SPACE FLEET's bot: plays one side of the battle through the same orders a player gives (builds to answer your fleet, takes relays, attacks in waves, comes home when its mothership is hit)
import { TYPES, HOME, NODES, CAP, MOTHER, FIGHTER, FRIGATE, CRUISER, TURRET, MINE } from './sim.js';
const NAMES = ['mothership', 'fighter', 'frigate', 'cruiser', 'turret', 'mine'];

class Bot {
  // think: an outside mind (Claude, through the website) asked every few seconds what the fleet should do; without it, or while it is silent, the bot's own instinct below commands
  constructor(sim, side, think) { this.sim = sim; this.side = side; this.wave = 4; this.out = false; this.goal = null; this.n = 0; this.think = think || null; this.busy = false; this.mindAt = -1e9; this.thought = ''; this.said = []; }
  // the battle as this side sees it, its own mothership always at z +112 (hundredths of the field)
  obs() { const S = this.sim, me = this.side, f = me ? -1 : 1, P = u => ({ id: u.id, kind: NAMES[u.type], x: Math.round(u.x * 100 * f), y: Math.round(u.y * 100), z: Math.round(u.z * 100 * f), hull: Math.round(100 * u.hp / S.T[u.side][u.type].hp), field: S.T[u.side][u.type].sh ? Math.round(100 * u.sh / S.T[u.side][u.type].sh) : 0 });
    return { seconds: Math.round(S.tick / 10), credits: S.credits[me] | 0, income: S.income(me), fleet: S.count(me), fleet_cap: CAP, building: S.queue[me].map(q => NAMES[q.type]), mine: S.units.filter(u => u.side === me).map(u => ({ ...P(u), doing: ['guarding', 'moving', 'attacking'][u.k] })), theirs: S.units.filter(u => u.side !== me && (u.type !== MINE || S.units.some(m => m.side === me && Math.hypot(m.x - u.x, m.y - u.y, m.z - u.z) < 0.14))).map(P),
      relays: NODES.map((p, i) => ({ relay: i, x: Math.round(p[0] * 100 * f), y: Math.round(p[1] * 100), z: Math.round(p[2] * 100 * f), held_by: S.nodes[i].owner < 0 ? 'nobody' : S.nodes[i].owner === me ? 'you' : 'enemy' })), your_last_plans: this.said.slice(-3) }; }
  // do what the mind said, as the same orders a player's hands give
  apply(D) { const S = this.sim, me = this.side, f = me ? -1 : 1; if (!D || !Array.isArray(D.orders)) return false; this.mindAt = S.tick; this.thought = String(D.thought || ''); this.said.push(this.thought);
    for (const b of (D.build || []).slice(0, 4)) { const t = NAMES.indexOf(b); if (t > 0) S.build(me, t); }
    for (const o of D.orders.slice(0, 12)) { if (!o || !Array.isArray(o.ships)) continue; const ids = o.ships.filter(id => { const u = S.byId.get(id); return u && u.side === me; }); if (!ids.length) continue; const t = S.byId.get(o.target);
      if (o.action === 'attack' && t && t.side !== me) S.order(me, ids, 1, null, t.id); else if (o.action === 'move') S.order(me, ids, 0, [(+o.x || 0) / 100 * f, (+o.y || 0) / 100, (+o.z || 0) / 100 * f]); }
    return true; }
  step() {
    const S = this.sim, me = this.side; if (S.winner >= 0) return;
    if (this.think && !this.busy && S.tick % 40 === 5) { this.busy = true; Promise.resolve().then(() => this.think(this.obs())).then(D => { this.busy = false; if (this.sim.winner < 0) this.apply(D); }, () => { this.busy = false; }); }
    if (S.tick % 10) return; this.n++;
    if (S.tick - this.mindAt < 150) { if (!S.queue[me].length && S.credits[me] > 450) S.build(me, [FIGHTER, FRIGATE, CRUISER][this.n % 3]); return; }   // the mind commands; instinct only keeps the shipyard from standing idle
    const mine = S.units.filter(u => u.side === me), foes = S.units.filter(u => u.side !== me), home = HOME[me];
    const army = mine.filter(u => u.type === FIGHTER || u.type === FRIGATE || u.type === CRUISER);
    // build what beats what the other side has most of
    const c = [0, 0, 0]; for (const f of foes) if (f.type !== MOTHER && f.type !== MINE) c[TYPES[f.type].cls]++;
    const have = t => mine.filter(u => u.type === t).length + S.queue[me].filter(q => q.type === t).length;
    let want = c[0] > c[1] + c[2] ? FRIGATE : c[2] * 3 >= c[0] + c[1] && c[2] ? FIGHTER : c[1] > c[0] ? CRUISER : [FIGHTER, FRIGATE, FIGHTER, CRUISER, FRIGATE][this.n % 5];
    if (this.n > 40 && have(TURRET) < 2 && this.n % 6 === 0) want = TURRET;
    if (this.n > 25 && have(MINE) < 3 && this.n % 9 === 0) want = MINE;
    if (S.queue[me].length < 2) S.build(me, want);
    // turrets hold the nearest relay to home, mines wait in the middle
    const near = NODES.map((p, i) => ({ p, i, d: Math.hypot(p[0] - home[0], p[2] - home[2]) })).sort((a, b) => a.d - b.d);
    for (const u of mine) { if (u.k !== 0) continue;
      if (u.type === TURRET && Math.hypot(u.x - home[0], u.z - home[2]) < 0.45) S.order(me, [u.id], 0, [near[u.id % 2].p[0], near[u.id % 2].p[1] + 0.06, near[u.id % 2].p[2]]);
      if (u.type === MINE && Math.hypot(u.x - home[0], u.z - home[2]) < 0.45) S.order(me, [u.id], 0, [((u.id * 37) % 100 - 50) / 90, ((u.id * 13) % 20 - 10) / 60, home[2] * 0.25]); }
    if (!army.length) { this.out = false; return; }
    const ids = army.map(u => u.id);
    // the mothership under attack: everyone home
    const raid = foes.find(f => f.type !== MINE && Math.hypot(f.x - home[0], f.y - home[1], f.z - home[2]) < 0.5);
    if (raid) { S.order(me, ids, 1, null, raid.id); this.out = false; this.goal = null; return; }
    if (!this.out) { if (army.length < this.wave) return; this.out = true; this.wave = Math.min(16, this.wave + 2); this.goal = null; }
    if (army.length < 2) { this.out = false; S.order(me, ids, 0, S.rally[me]); return; }
    // the nearest relay that is not ours, then their mothership
    const open = near.filter(n => S.nodes[n.i].owner !== me);
    if (open.length) { const g = open[0]; if (this.goal !== g.i || this.n % 5 === 0) { this.goal = g.i; S.order(me, ids.filter(id => S.byId.get(id).k === 0 || this.goal !== g.i), 0, g.p); } }
    else { const m = foes.find(f => f.type === MOTHER); if (m && this.n % 3 === 0) S.order(me, ids, 1, null, m.id); }
  }
}
export { Bot };
