// Pure game rules, shared by the server (authoritative) and the client (highlights).
import { MAPS, TERRAIN, CLIMB, REACH, mapOf, groundAt, highAt } from './maps.js';
export { MAPS, TERRAIN, mapOf };
export const COLS = 9;
export const ROWS = 11;
export const TURN_SECONDS = 120;
export const MAX_PASSES = 4; // consecutive passes (both players) before a draw

export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

// A team is picked under a point budget: each unit has a cost, and a limit on how many of it a team may field.
export const BUDGET = 40, TEAM_MAX = 12;
// kind: melee | line | ranged | blast | heal | snare
export const TYPES = {
  bulwark:  { name: 'Knight', cost: 5, limit: 4,      hp: 50, pow: 18, armor: 25, block: 80, move: 3, rec: 1, kind: 'melee',  min: 1, max: 1,
              info: 'Armoured front-liner. Very hard to hurt from the front.' },
  lancer:   { name: 'Berserker', cost: 4, limit: 4,   hp: 36, pow: 20, armor: 10, block: 40, move: 4, rec: 1, kind: 'line',   min: 1, max: 2,
              info: 'Drives a great axe two tiles in a straight line, hitting everything in it.' },
  strider:  { name: 'Rogue', cost: 4, limit: 4,       hp: 28, pow: 18, armor: 0,  block: 60, move: 6, rec: 1, kind: 'melee',  min: 1, max: 1, backstab: 1.5,
              info: 'Fast flanker. +50% damage when striking from behind.' },
  slinger:  { name: 'Archer', cost: 4, limit: 4,      hp: 26, pow: 16, armor: 0,  block: 30, move: 3, rec: 2, kind: 'ranged', min: 2, max: 5,
              info: 'Lobbed shots at range 2-5. Cannot hit adjacent tiles.' },
  ember:    { name: 'Fire Mage', cost: 4, limit: 2,   hp: 24, pow: 14, armor: 0,  block: 0,  move: 3, rec: 3, kind: 'blast',  min: 1, max: 4,
              info: 'Unblockable burst on a unit and the 4 tiles around it. Burns allies too.' },
  mender:   { name: 'Cleric', cost: 3, limit: 2,      hp: 24, pow: 14, armor: 0,  block: 20, move: 3, rec: 2, kind: 'heal',   min: 1, max: 3,
              info: 'Restores 14 health to an ally within 3 tiles. Cannot attack.' },
  hexbinder:{ name: 'Enchanter', cost: 3, limit: 2,   hp: 22, pow: 0,  armor: 0,  block: 20, move: 3, rec: 3, kind: 'snare',  min: 1, max: 3, snare: 2,
              info: 'Snares an enemy for 2 of its turns: it cannot move, act or block.' },
};

// Player 0 deploys on the bottom rows (facing N); player 1 is the mirror image.
const LAYOUT = [
  ['strider', 1, 8], ['bulwark', 3, 8], ['lancer', 4, 8], ['bulwark', 5, 8], ['strider', 7, 8],
  ['slinger', 2, 9], ['ember', 4, 9], ['slinger', 6, 9],
  ['hexbinder', 3, 10], ['mender', 5, 10],
];

// A unit's numbers: its type's, changed by whatever it carries (u.up: { stat: amount }); every rule reads them here.
export function stats(u) {
  const t = TYPES[u.type];
  if (!u.up) return t;
  const o = { ...t };
  for (const k in u.up) o[k] = Math.max(0, (typeof t[k] === 'number' ? t[k] : 0) + u.up[k]);
  return o;
}
export const stat = (u, k) => stats(u)[k];
const piece = (id, type, owner, x, y) => ({ id, type, owner, x, y, facing: owner === 0 ? 'N' : 'S', hp: TYPES[type].hp, rec: 0, snare: 0 });
// The standing line-up (it costs exactly the budget). It is written for the board; on a wider or deeper map it keeps its place in the middle of the last rows.
export function defaultTeam(map, owner) {
  const m = mapOf(map), ox = Math.floor((m.cols - COLS) / 2), oy = m.rows - ROWS;
  return LAYOUT.map(([type, lx, ly]) => ({ type, x: owner === 0 ? lx + ox : m.cols - 1 - lx - ox, y: owner === 0 ? ly + oy : m.rows - 1 - ly - oy }));
}
// A match starts in play with the standing line-ups; with setup, each side first picks and places its own (setTeam), then begin().
export function newGame(map = 'board', { setup = false } = {}) {
  if (!MAPS[map]) map = 'board';
  const m = MAPS[map], units = [];
  for (const owner of [0, 1]) defaultTeam(map, owner).forEach((u, i) => units.push(piece(owner * 100 + i + 1, u.type, owner, u.x, u.y)));
  return { map, cols: m.cols, rows: m.rows, phase: setup ? 'setup' : 'play', units, turn: 0, turnNo: 1, active: null, passes: 0, winner: null };
}

export const inBounds = (s, x, y) => x >= 0 && y >= 0 && x < s.cols && y < s.rows;
export const ground = (s, x, y) => groundAt(mapOf(s.map), x, y);
export const high = (s, x, y) => highAt(mapOf(s.map), x, y);
// A side sets out on its own rows: the last ones for player 0, the first for player 1.
export const inZone = (s, owner, y) => (owner === 0 ? y >= s.rows - mapOf(s.map).zone : y < mapOf(s.map).zone);
export const teamCost = team => team.reduce((n, m) => n + (TYPES[m.type] ? TYPES[m.type].cost : 0), 0);
// What is wrong with a team [{type, x, y}] for this side on this map, or null when it may be fielded.
export function checkTeam(s, owner, team) {
  if (!Array.isArray(team) || team.length < 1 || team.length > TEAM_MAX) return `A team is 1 to ${TEAM_MAX} units`;
  const count = {}, seen = new Set();
  for (const m of team) {
    const t = m && typeof m.type === 'string' && Object.hasOwn(TYPES, m.type) ? TYPES[m.type] : null;
    if (!t) return 'Unknown unit';
    if (!Number.isInteger(m.x) || !Number.isInteger(m.y) || !inBounds(s, m.x, m.y) || !inZone(s, owner, m.y)) return 'Units go on your own rows';
    if (ground(s, m.x, m.y).solid) return 'Nothing can stand there';
    if (seen.has(m.x + ',' + m.y)) return 'Two units on one tile';
    seen.add(m.x + ',' + m.y);
    count[m.type] = (count[m.type] || 0) + 1;
    if (count[m.type] > t.limit) return `At most ${t.limit} of the ${t.name}`;
  }
  if (teamCost(team) > BUDGET) return `Over the budget of ${BUDGET} points`;
  return null;
}
// Before the match starts: replace this side's units with a checked team. Returns the error, or null.
export function setTeam(s, owner, team) {
  if (s.phase !== 'setup') return 'The match has started';
  const e = checkTeam(s, owner, team);
  if (e) return e;
  s.units = s.units.filter(u => u.owner !== owner);
  team.forEach((m, i) => s.units.push(piece(owner * 100 + i + 1, m.type, owner, m.x, m.y)));
  return null;
}
export function begin(s) { s.phase = 'play'; }

// Move points to step from one tile onto the next one, or Infinity where the ground forbids it.
export function stepCost(s, fx, fy, x, y) {
  const g = ground(s, x, y), up = high(s, x, y) - high(s, fx, fy);
  if (g.solid || up > 1) return Infinity;
  return (g.cost || 1) + (up > 0 ? CLIMB : 0);
}
// How far a unit that works at range reaches at this tile: one further at ground below it.
export const reach = (s, u, x, y) => { const t = stats(u); return t.max + (t.kind !== 'melee' && t.kind !== 'line' && high(s, u.x, u.y) > high(s, x, y) ? REACH : 0); };
export const unitAt = (s, x, y) => s.units.find(u => u.x === x && u.y === y) || null;
export const unitById = (s, id) => s.units.find(u => u.id === id) || null;
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Can this player pick this unit to move/act right now?
export function canUse(s, player, u) {
  if (!u || s.winner !== null || s.turn !== player || u.owner !== player) return false;
  if (u.rec > 0 || u.snare > 0) return false;
  return !s.active || s.active.id === u.id;
}

// Every tile the unit can end on, the cheapest way there within its move points (ground and climbs cost more).
export function reachable(s, u) {
  const out = [], best = new Map([[u.x + ',' + u.y, 0]]), move = stats(u).move;
  let frontier = [{ x: u.x, y: u.y, c: 0 }];
  while (frontier.length) {
    const next = [];
    for (const p of frontier) {
      if (best.get(p.x + ',' + p.y) !== p.c) continue;
      for (const [dx, dy] of Object.values(DIRS)) {
        const x = p.x + dx, y = p.y + dy, k = x + ',' + y;
        if (!inBounds(s, x, y) || unitAt(s, x, y)) continue;
        const c = p.c + stepCost(s, p.x, p.y, x, y);
        if (c > move || (best.has(k) && best.get(k) <= c)) continue;
        if (!best.has(k)) out.push({ x, y });
        best.set(k, c);
        next.push({ x, y, c });
      }
    }
    frontier = next;
  }
  return out;
}

// Tiles this unit may target from where it stands. Every target tile holds a unit.
export function targets(s, u) {
  const t = stats(u);
  const out = [];
  if (t.kind === 'line') {
    for (const [dx, dy] of Object.values(DIRS)) {
      for (let i = 1; i <= t.max; i++) {
        const x = u.x + dx * i, y = u.y + dy * i;
        if (!inBounds(s, x, y) || ground(s, x, y).wall) break;
        const v = unitAt(s, x, y);
        if (v && v.owner !== u.owner) { out.push({ x: v.x, y: v.y }); break; }
      }
    }
    return out;
  }
  for (const v of s.units) {
    if (v.id === u.id) continue;
    const d = dist(u, v);
    if (d < t.min || d > reach(s, u, v.x, v.y)) continue;
    const enemy = v.owner !== u.owner;
    if (t.kind === 'heal') { if (!enemy && v.hp < stats(v).hp) out.push({ x: v.x, y: v.y }); }
    else if (t.kind === 'blast') out.push({ x: v.x, y: v.y });
    else if (enemy) out.push({ x: v.x, y: v.y });
  }
  return out;
}

// Which side of the target is the attack coming from?
export function sideOf(target, fromX, fromY) {
  const [fx, fy] = DIRS[target.facing];
  const vx = fromX - target.x, vy = fromY - target.y;
  const dot = vx * fx + vy * fy, cross = Math.abs(vx * fy - vy * fx);
  if (dot > 0 && dot >= cross) return 'front';
  if (dot < 0 && -dot >= cross) return 'back';
  return 'side';
}

// What a strike that lands does: power, the rogue's backstab, the forest's cover against arrows, then armour.
export function damage(s, attacker, target) {
  const at = stats(attacker), side = sideOf(target, attacker.x, attacker.y);
  let pow = at.pow;
  if (at.backstab && side === 'back') pow *= at.backstab;
  if (at.kind === 'ranged') pow *= ground(s, target.x, target.y).cover ?? 1;
  return Math.max(1, Math.round(pow * (100 - stats(target).armor) / 100));
}

function strike(s, attacker, target, blockable, rand, events) {
  const tt = stats(target);
  const side = sideOf(target, attacker.x, attacker.y);
  if (blockable && target.snare === 0) {
    const chance = (side === 'front' ? tt.block : side === 'side' ? tt.block / 2 : 0) * (ground(s, target.x, target.y).slip ?? 1);
    if (rand() * 100 < chance) { events.push({ t: 'block', id: target.id }); return; }
  }
  const dmg = damage(s, attacker, target);
  target.hp -= dmg;
  events.push({ t: 'hit', id: target.id, dmg, side });
  if (target.hp <= 0) {
    s.units = s.units.filter(u => u.id !== target.id);
    events.push({ t: 'die', id: target.id });
  }
}

function checkWinner(s, events) {
  const alive = [0, 1].map(p => s.units.some(u => u.owner === p));
  if (alive[0] && alive[1]) return;
  s.winner = alive[0] ? 0 : alive[1] ? 1 : -1;
  events.push({ t: 'over', winner: s.winner });
}

function endTurn(s, events) {
  const p = s.turn;
  for (const u of s.units) {
    if (u.owner !== p) continue;
    if (u.rec > 0) u.rec--;
    if (u.snare > 0) u.snare--;
  }
  if (s.active) {
    const u = unitById(s, s.active.id);
    if (u) {
      const rec = stats(u).rec;
      u.rec = s.active.acted ? rec : s.active.moved ? Math.floor(rec / 2) : 0;
    }
    s.passes = 0;
  } else {
    s.passes++;
  }
  s.active = null;
  if (s.winner === null && s.passes >= MAX_PASSES) {
    s.winner = -1;
    events.push({ t: 'over', winner: -1 });
    return;
  }
  s.turn = 1 - p;
  s.turnNo++;
  events.push({ t: 'turn', player: s.turn });
}

// Apply one action for `player`. Mutates `s`. Returns { ok, events } or { ok:false, error }.
// Actions: {type:'move',unit,x,y} {type:'act',unit,x,y} {type:'end',unit?,facing?} {type:'surrender'}
export function apply(s, player, a, rand = Math.random) {
  const fail = error => ({ ok: false, error });
  const events = [];
  if (!a || typeof a !== 'object') return fail('bad action');
  if (s.winner !== null) return fail('game is over');
  if (s.phase === 'setup') return fail('the match has not started');
  if (a.type === 'surrender') {
    if (player !== 0 && player !== 1) return fail('not a player');
    s.winner = 1 - player;
    events.push({ t: 'over', winner: s.winner, surrender: true });
    return { ok: true, events };
  }
  if (s.turn !== player) return fail('not your turn');

  if (a.type === 'end') {
    if (a.facing !== undefined && !DIRS[a.facing]) return fail('bad facing');
    if (a.facing) {
      const u = s.active ? unitById(s, s.active.id) : unitById(s, a.unit);
      // The acting unit may be dead (caught in its own blast); otherwise it must be usable.
      if (u) {
        if (!s.active && !canUse(s, player, u)) return fail('unit cannot turn');
        u.facing = a.facing;
        events.push({ t: 'face', id: u.id, facing: a.facing });
      }
    }
    endTurn(s, events);
    return { ok: true, events };
  }

  const u = unitById(s, a.unit);
  if (!canUse(s, player, u)) return fail('unit not available');
  const hasTile = list => list.some(p => p.x === a.x && p.y === a.y);

  if (a.type === 'move') {
    if (s.active && s.active.moved) return fail('already moved');
    if (!hasTile(reachable(s, u))) return fail('cannot move there');
    const dx = a.x - u.x, dy = a.y - u.y;
    u.x = a.x; u.y = a.y;
    u.facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
    s.active = { id: u.id, moved: true, acted: s.active ? s.active.acted : false };
    events.push({ t: 'move', id: u.id, x: a.x, y: a.y });
    return { ok: true, events };
  }

  if (a.type === 'act') {
    if (s.active && s.active.acted) return fail('already acted');
    if (!hasTile(targets(s, u))) return fail('invalid target');
    const t = stats(u);
    const dx = a.x - u.x, dy = a.y - u.y;
    u.facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
    s.active = { id: u.id, moved: s.active ? s.active.moved : false, acted: true };
    events.push({ t: 'act', id: u.id, kind: t.kind, x: a.x, y: a.y });
    const target = unitAt(s, a.x, a.y);
    if (t.kind === 'melee' || t.kind === 'ranged') {
      strike(s, u, target, true, rand, events);
    } else if (t.kind === 'line') {
      const sx = Math.sign(dx), sy = Math.sign(dy);
      for (let i = 1; i <= t.max; i++) {
        const x = u.x + sx * i, y = u.y + sy * i;
        if (!inBounds(s, x, y) || ground(s, x, y).wall) break;
        const v = unitAt(s, x, y);
        if (v) strike(s, u, v, true, rand, events);
      }
    } else if (t.kind === 'blast') {
      const area = [[0, 0], ...Object.values(DIRS)];
      for (const [ax, ay] of area) {
        const v = unitAt(s, a.x + ax, a.y + ay);
        if (v) strike(s, u, v, false, rand, events);
      }
    } else if (t.kind === 'heal') {
      const amt = Math.min(t.pow, stats(target).hp - target.hp);
      target.hp += amt;
      events.push({ t: 'heal', id: target.id, amt });
    } else if (t.kind === 'snare') {
      target.snare = t.snare;
      events.push({ t: 'snare', id: target.id });
    }
    checkWinner(s, events);
    return { ok: true, events };
  }
  return fail('unknown action');
}
