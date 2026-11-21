// SKIRMISH TABLE's computer opponent: it reads the same state a player sees and answers with the same actions the rules judge (game.js); no screen, no network, no dice of its own
import * as G from './game.js';

// level: how much it weighs danger and how much it wobbles between near-equal choices
export const LEVELS = {
  easy: { name: 'Recruit', care: 0, wobble: 9, face: false },
  hard: { name: 'Veteran', care: 1, wobble: 0.4, face: true },
};
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const worth = u => G.stat(u, 'cost') + 1;
const ranged = k => k !== 'melee' && k !== 'line';

// The chance a strike from (fx, fy) gets past the target's block, as the rules will roll it.
function through(s, target, fx, fy, blockable, facing = target.facing) {
  if (!blockable || target.snare > 0) return 1;
  const side = G.sideOf({ ...target, facing }, fx, fy), b = G.stat(target, 'block') * (G.ground(s, target.x, target.y).slip ?? 1);
  return 1 - Math.min(100, side === 'front' ? b : side === 'side' ? b * Math.min(1, G.stat(target, 'flank') ?? 0.5) : 0) / 100;
}
// What one strike from attacker (standing at fx, fy) is worth against target: positive for a foe, negative for a friend.
function strikeWorth(s, a, fx, fy, target, blockable) {
  const dmg = G.damage(s, { ...a, x: fx, y: fy }, target), p = through(s, target, fx, fy, blockable), hp = G.stat(target, 'hp');
  const v = p * (Math.min(dmg, target.hp) / hp * worth(target) * 10 + (dmg >= target.hp ? worth(target) * 12 : 0) + (1 - target.hp / hp) * 4);
  return target.owner === a.owner ? -v * 1.3 : v;
}
// What acting on tile t is worth for unit u standing at (x, y).
function actWorth(s, u, x, y, t) {
  const kind = G.stat(u, 'kind'), target = G.unitAt(s, t.x, t.y);
  if (kind === 'melee' || kind === 'ranged') return strikeWorth(s, u, x, y, target, true);
  if (kind === 'line') {
    const sx = Math.sign(t.x - x), sy = Math.sign(t.y - y); let v = 0;
    for (let i = 1; i <= G.stat(u, 'max'); i++) { const px = x + sx * i, py = y + sy * i; if (!G.inBounds(s, px, py) || G.ground(s, px, py).wall) break; const q = G.unitAt(s, px, py); if (q && q.id !== u.id) v += strikeWorth(s, u, x, y, q, true); }
    return v;
  }
  if (kind === 'blast') {
    let v = 0;
    for (const [ax, ay] of [[0, 0], ...Object.values(G.DIRS)]) { const q = G.unitAt(s, t.x + ax, t.y + ay); if (q && !(G.stat(u, 'spare') && q.owner === u.owner)) v += strikeWorth(s, u, x, y, q, false); }
    return v;
  }
  if (kind === 'heal') { const amt = Math.min(G.stat(u, 'pow'), G.stat(target, 'hp') - target.hp); return amt / G.stat(target, 'hp') * worth(target) * 8 + (G.stat(u, 'cleanse') && target.snare > 0 ? worth(target) * 2 : 0); }
  if (kind === 'snare') return target.snare > 0 ? 0 : worth(target) * (target.rec > 0 ? 1.5 : 3.5) + (G.stat(target, 'block') > 40 ? 2 : 0);
  return 0;
}
// How much harm waits for u at (x, y) facing f on the foe's next turn (only one of them acts, so the worst counts most).
function danger(s, u, x, y, f, foes) {
  let worst = 0, sum = 0;
  for (const e of foes) {
    if (e.snare > 0) continue;
    const k = G.stat(e, 'kind'); if (k === 'heal' || k === 'snare') continue;
    const d = Math.abs(e.x - x) + Math.abs(e.y - y), reach = G.stat(e, 'max') + (ranged(k) ? 1 : 0), far = d - reach;
    if (far > G.stat(e, 'move')) continue;
    if (ranged(k) && far <= 0 && d < G.stat(e, 'min') && G.stat(e, 'move') === 0) continue;
    const hit = G.damage(s, e, { ...u, x, y }) * through(s, { ...u, x, y }, e.x, e.y, k !== 'blast', f) * (e.rec > 0 ? 0.35 : 1) * (far > 0 ? 0.8 : 1);
    worst = Math.max(worst, hit); sum += hit;
  }
  const t = worst + (sum - worst) * 0.25;
  return Math.min(1.5, t / u.hp) * worth(u) * 6 + (t >= u.hp ? worth(u) * 6 : 0);
}
// How far every tile is from the nearest foe by the way a unit would walk it (round water and rock, slower through a ford or a wood).
function walkField(s, foes) {
  const n = s.cols * s.rows, d = new Float32Array(n).fill(99); let q = [];
  for (const e of foes) { d[e.y * s.cols + e.x] = 0; q.push([e.x, e.y]); }
  while (q.length) { const next = [];
    for (const [x, y] of q) for (const [dx, dy] of Object.values(G.DIRS)) { const px = x + dx, py = y + dy; if (!G.inBounds(s, px, py)) continue; const g = G.ground(s, px, py); if (g.solid) continue;
      const c = d[y * s.cols + x] + (G.ground(s, x, y).cost || 1); if (c < d[py * s.cols + px]) { d[py * s.cols + px] = c; next.push([px, py]); } }
    q = next; }
  return d;
}
// Where a unit with nothing to strike would rather stand.
function standing(s, u, x, y, foes, friends, walk) {
  const kind = G.stat(u, 'kind'), g = G.ground(s, x, y); let v = 0;
  if (!foes.length) return 0;
  const near = foes.reduce((m, e) => Math.min(m, Math.abs(e.x - x) + Math.abs(e.y - y)), 99);
  if (kind === 'heal') { const hurt = friends.filter(q => q.id !== u.id && q.hp < G.stat(q, 'hp')); v -= (hurt.length ? hurt.reduce((m, q) => Math.min(m, Math.abs(q.x - x) + Math.abs(q.y - y)), 99) : friends.reduce((m, q) => (q.id === u.id ? m : Math.min(m, Math.abs(q.x - x) + Math.abs(q.y - y))), 99)) * 0.5; v += Math.min(near, 5) * 0.4; }
  else if (ranged(kind)) v -= Math.abs(near - G.stat(u, 'max')) * 0.55;
  else v -= (walk ? walk[y * s.cols + x] : near) * 0.6;
  if (ranged(kind)) v += G.high(s, x, y) * 1.2;
  if (g.cover) v += 0.8;
  if (g.slip) v -= 0.8;
  return v;
}
// The facing that leaves the least open at (x, y).
function bestFacing(s, u, x, y, foes, care) {
  let best = u.facing, bd = Infinity;
  for (const f of Object.keys(G.DIRS)) { const d = danger(s, u, x, y, f, foes) + (f === u.facing ? -0.01 : 0); if (d < bd) { bd = d; best = f; } }
  if (!care && foes.length) { const e = foes.reduce((m, q) => (dist(q, { x, y }) < dist(m, { x, y }) ? q : m)), dx = e.x - x, dy = e.y - y; best = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N'); }
  return best;
}

// One whole turn for `player`: the actions to send, in order (a move, an act, then the end with a facing). `rand` only breaks near ties.
export function plan(s, player, level = 'hard', rand = Math.random) {
  const L = LEVELS[level] || LEVELS.hard, foes = s.units.filter(u => u.owner !== player), friends = s.units.filter(u => u.owner === player);
  let best = null;
  const walk = walkField(s, foes);
  for (const u of friends) {
    if (!G.canUse(s, player, u)) continue;
    const moved = s.active && s.active.moved, acted = s.active && s.active.acted;
    const spots = [{ x: u.x, y: u.y, here: true }, ...(moved ? [] : G.reachable(s, u))];
    const here0 = standing(s, u, u.x, u.y, foes, friends, walk) - danger(s, u, u.x, u.y, u.facing, foes) * L.care;
    for (const p of spots) {
      const there = { ...u, x: p.x, y: p.y }, sim = p.here ? s : { ...s, units: s.units.map(q => (q.id === u.id ? there : q)) };
      const f = bestFacing(sim, there, p.x, p.y, foes, L.face), pos = standing(sim, there, p.x, p.y, foes, friends, walk) - danger(sim, there, p.x, p.y, f, foes) * L.care - here0;
      const acts = acted ? [] : G.targets(sim, there);
      const opts = [{ t: null, v: 0 }, ...acts.map(t => ({ t, v: actWorth(sim, there, p.x, p.y, t) }))];
      for (const o of opts) {
        if (o.t && o.v <= 0) continue;
        // a strike turns the unit toward its target; it may turn again when the turn ends, so the facing stands
        const score = o.v + pos * (o.t ? 0.6 : 1) - (o.t ? G.stat(u, 'rec') * 0.3 : 0) + rand() * L.wobble;
        if (!best || score > best.score) best = { score, u, p, t: o.t, f };
      }
    }
  }
  if (!best) return [{ type: 'end' }];
  const out = [];
  if (!best.p.here) out.push({ type: 'move', unit: best.u.id, x: best.p.x, y: best.p.y });
  if (best.t) out.push({ type: 'act', unit: best.u.id, x: best.t.x, y: best.t.y });
  out.push(out.length || (s.active && s.active.id === best.u.id) || best.f !== best.u.facing ? { type: 'end', unit: best.u.id, facing: best.f } : { type: 'end' });
  return out;
}
