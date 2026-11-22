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
const harmless = k => k === 'heal' || k === 'snare' || k === 'none' || k === 'summon';

// The chance a strike from (fx, fy) gets past the target's block, as the rules will roll it.
function through(s, target, fx, fy, blockable, facing = target.facing) {
  if (!blockable || target.snare > 0) return 1;
  const t = G.eff(s, target), side = G.sideOf({ ...target, facing }, fx, fy), b = t.block * (G.ground(s, target.x, target.y).slip ?? 1);
  return 1 - Math.min(100, side === 'front' ? b : side === 'side' ? b * Math.min(1, t.flank ?? 0.5) : 0) / 100;
}
// What one strike from attacker (standing at fx, fy) is worth against target: positive for a foe, negative for a friend. Nothing against a target it cannot hurt.
function strikeWorth(s, a, fx, fy, target, blockable, scale = 1) {
  const dmg = G.damage(s, { ...a, x: fx, y: fy }, target, scale); if (!dmg) return 0;
  const p = through(s, target, fx, fy, blockable), hp = G.stat(target, 'hp');
  const v = p * (Math.min(dmg, target.hp) / hp * worth(target) * 10 + (dmg >= target.hp ? worth(target) * 12 : 0) + (1 - target.hp / hp) * 4);
  return target.owner === a.owner ? -v * 1.3 : v;
}
// What acting on tile t is worth for unit u standing at (x, y); moved: it walked there this turn.
function actWorth(s, u, x, y, t, moved, foes) {
  const st = G.stats(u), kind = st.kind, target = G.unitAt(s, t.x, t.y);
  if (st.reload && u.empty) return 3;
  // a braced foe strikes first at whoever walks up to it
  const brace = q => (moved && q && q.owner !== u.owner && G.stat(q, 'brace') && !(q.snare > 0) && Math.abs(q.x - x) + Math.abs(q.y - y) === 1 && G.sideOf(q, x, y) !== 'back' ? strikeWorth(s, q, q.x, q.y, { ...u, x, y }, true, G.stat(q, 'brace')) * 0.8 : 0);
  if (kind === 'melee' || kind === 'ranged') return strikeWorth(s, u, x, y, target, true) + (st.shove ? 0.5 : 0) - (G.schoolOf(st) === 'blade' ? brace(target) : 0);
  if (kind === 'line') {
    const sx = Math.sign(t.x - x), sy = Math.sign(t.y - y); let v = -brace(G.unitAt(s, x + sx, y + sy));
    for (let i = 1; i <= st.max; i++) { const px = x + sx * i, py = y + sy * i; if (!G.inBounds(s, px, py) || G.ground(s, px, py).wall) break; const q = G.unitAt(s, px, py); if (q && q.id !== u.id) v += strikeWorth(s, u, x, y, q, true); }
    return v;
  }
  if (kind === 'blast') {
    let v = 0;
    for (const [ax, ay] of [[0, 0], ...Object.values(G.DIRS)]) { const q = G.unitAt(s, t.x + ax, t.y + ay); if (q && !(st.spare && q.owner === u.owner)) v += strikeWorth(s, u, x, y, q, false); }
    return v;
  }
  if (kind === 'bolt') return strikeWorth(s, u, x, y, target, false) + (target.frozen > 0 || G.stat(target, 'move') === 0 ? 0 : worth(target) * (ranged(G.stat(target, 'kind')) ? 0.5 : 1.2));
  if (kind === 'chain') {
    const hit = new Set([u.id]); let v = 0, q = target, k = 1;
    for (let i = 0; q && i <= st.jumps; i++, k *= 0.7) { const from = q; hit.add(q.id); v += strikeWorth(s, u, x, y, q, false, k); q = null;
      for (const [ax, ay] of Object.values(G.DIRS)) { const n = G.unitAt(s, from.x + ax, from.y + ay); if (n && !hit.has(n.id)) { q = n; break; } } }
    return v;
  }
  if (kind === 'cone') { let v = 0; for (const p of G.coneTiles({ x, y }, Math.sign(t.x - x), Math.sign(t.y - y))) { const q = G.unitAt(s, p.x, p.y); if (q && q.id !== u.id) v += strikeWorth(s, u, x, y, q, false); } return v; }
  if (kind === 'flask') {   // only thrown at someone: the fire under them is worth a little more, less if they are sure to walk off it
    if (!target) return 0;
    const v = strikeWorth(s, u, x, y, target, false), burns = G.takes(target, 'spell') > 0 ? 2 : 0;
    return target.owner === u.owner ? v - burns : v + burns;
  }
  if (kind === 'summon') { const near = foes.reduce((m, e) => Math.min(m, Math.abs(e.x - t.x) + Math.abs(e.y - t.y)), 99); return (G.TYPES[st.summon].cost + 1) * 2.5 - near * 0.15; }
  if (kind === 'heal') { const amt = Math.min(st.pow, G.stat(target, 'hp') - target.hp); return amt / G.stat(target, 'hp') * worth(target) * 8 + (st.cleanse && target.snare > 0 ? worth(target) * 2 : 0); }
  if (kind === 'snare') return target.snare > 0 ? 0 : worth(target) * (target.rec > 0 ? 1.5 : 3.5) + (G.stat(target, 'block') > 40 ? 2 : 0);
  return 0;
}
// How much harm waits for u at (x, y) facing f on the foe's next turn (only one of them acts, so the worst counts most).
function danger(s, u, x, y, f, foes) {
  let worst = 0, sum = 0;
  for (const e of foes) {
    if (e.snare > 0 || e.empty) continue;
    const k = G.stat(e, 'kind'); if (harmless(k)) continue;
    const d = Math.abs(e.x - x) + Math.abs(e.y - y), reach = G.stat(e, 'max') + (ranged(k) ? 1 : 0), far = d - reach, move = e.frozen > 0 ? 0 : G.stat(e, 'move');
    if (far > move) continue;
    if (ranged(k) && far <= 0 && d < G.stat(e, 'min') && move === 0) continue;
    const dmg = G.damage(s, e, { ...u, x, y }); if (!dmg) continue;
    const hit = dmg * through(s, { ...u, x, y }, e.x, e.y, k === 'melee' || k === 'line' || k === 'ranged', f) * (e.rec > 0 ? 0.35 : 1) * (far > 0 ? 0.8 : 1);
    worst = Math.max(worst, hit); sum += hit;
  }
  const burn = G.ground(s, x, y).burn && G.takes(u, 'spell') > 0 ? G.ground(s, x, y).burn : 0;
  const t = worst + (sum - worst) * 0.25 + burn;
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
  const st = G.stats(u), kind = st.kind, g = G.ground(s, x, y); let v = 0;
  if (!foes.length) return 0;
  const near = foes.reduce((m, e) => Math.min(m, Math.abs(e.x - x) + Math.abs(e.y - y)), 99), toFriend = list => list.reduce((m, q) => (q.id === u.id ? m : Math.min(m, Math.abs(q.x - x) + Math.abs(q.y - y))), 99);
  if (kind === 'heal') { const hurt = friends.filter(q => q.id !== u.id && q.hp < G.stat(q, 'hp')); v -= (hurt.length ? toFriend(hurt) : toFriend(friends)) * 0.5; v += Math.min(near, 5) * 0.4; }
  else if (kind === 'none' || kind === 'summon') { v -= Math.max(0, toFriend(friends) - 1) * 0.5; v += Math.min(near, 4) * 0.5; }   // behind the line, close to it
  else if (ranged(kind)) v -= Math.abs(near - st.max) * 0.55;
  else v -= (walk && !st.fly ? walk[y * s.cols + x] : near) * 0.6;
  if (st.aura) v += friends.filter(q => q.id !== u.id && Math.abs(q.x - x) + Math.abs(q.y - y) <= st.aura).length * 0.7;   // a bard or a captain stands where its allies are
  if (st.shelter) v += friends.some(q => q.id !== u.id && Math.abs(q.x - x) + Math.abs(q.y - y) === 1 && ranged(G.stat(q, 'kind'))) ? 0.6 : 0;
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
      const f = u.frozen > 0 ? u.facing : bestFacing(sim, there, p.x, p.y, foes, L.face), pos = standing(sim, there, p.x, p.y, foes, friends, walk) - danger(sim, there, p.x, p.y, f, foes) * L.care - here0;
      const acts = acted ? [] : G.targets(sim, there);
      const opts = [{ t: null, v: 0 }, ...acts.map(t => ({ t, v: actWorth(sim, there, p.x, p.y, t, !p.here || !!moved, foes) }))];
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

// A team for the computer to field: a random legal mix under the budget, fighters and creatures to the front, shooters and casters behind (the standing line-up if nothing fits).
export function muster(s, owner, rand = Math.random) {
  const m = G.mapOf(s.map), budget = s.budget ?? G.BUDGET, count = {}, picks = [], types = Object.keys(G.TYPES);
  const front = t => { const k = G.TYPES[t].kind; return (k === 'melee' || k === 'line' || k === 'cone') && !G.TYPES[t].aura; };
  let left = budget, guard = 0;
  const take = t => { picks.push(t); count[t] = (count[t] || 0) + 1; left -= G.TYPES[t].cost; };
  const may = t => G.TYPES[t].cost <= left && (count[t] || 0) < G.TYPES[t].limit && picks.length < G.TEAM_MAX;
  for (let i = 0; i < 3; i++) { const c = types.filter(t => front(t) && may(t) && G.TYPES[t].cost <= 7); if (c.length) take(c[Math.floor(rand() * c.length)]); }   // a front line first
  { const c = types.filter(t => may(t) && G.TYPES[t].pow > 0 && G.schoolOf(G.TYPES[t]) === 'spell' && G.TYPES[t].cost <= 5); if (c.length) take(c[Math.floor(rand() * c.length)]); }   // and something that can hurt a ghost
  while (guard++ < 200) {
    const c = types.filter(t => may(t) && !(G.TYPES[t].summon && !picks.some(front)) && picks.filter(q => !front(q)).length + (front(t) ? 0 : 1) <= Math.ceil((picks.length + 1) * 0.55));
    if (!c.length) break;
    take(c[Math.floor(rand() * c.length)]);
  }
  // rows from the foe's side back: the front line, then the rest
  const rows = []; for (let r = m.zone - 1; r >= 0; r--) rows.push(owner === 0 ? s.rows - 1 - r : r);
  const free = y => { const a = []; for (let x = 0; x < s.cols; x++) if (!G.ground(s, x, y).solid) a.push(x); return a.sort((p, q) => Math.abs(p - (s.cols - 1) / 2) - Math.abs(q - (s.cols - 1) / 2)); };
  const slots = rows.map(y => ({ y, xs: free(y) })), team = [];
  const put = (t, from) => { for (let i = 0; i < slots.length; i++) { const sl = slots[(from + i) % slots.length]; if (sl.xs.length) { team.push({ type: t, x: sl.xs.shift(), y: sl.y }); return; } } };
  for (const t of picks.filter(front)) put(t, 0);
  for (const t of picks.filter(t => !front(t))) put(t, 1);
  return team.length && G.checkTeam(s, owner, team) === null ? team : G.defaultTeam(s.map, owner);
}
