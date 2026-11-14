// THE GUEST LIST's house: the plan (rooms, openings), its walls, floors, ceilings, trims, doors, windows, hearths, roof, the cellar under the east lawn, the grounds and the storm over them
import { THREE, LOW, clamp, lerp, rnd, pick, scene, camera, CLOCK, P, RAPIER, solid, grp, GRP, mat, flat, box, quad, gather, group, GR, mark, HGT, USE, BUS, TEX } from './core.js';

const H = 3.8, T = .1;
// every room: its box on the plan, what it is floored, walled and panelled with
const ROOMS = {
  conserv: { n: 'the conservatory', x0: -8, z0: 0, x1: 0, z1: 9, floor: 'slate_floor_02', wall: 'white_plaster_02', tint: 0xcfd6cc, ft: 1.6 },
  drawing: { n: 'the drawing room', x0: 0, z0: 0, x1: 8, z1: 9, floor: 'herringbone_parquet', wall: 'quatrefoil_jacquard_fabric', tint: 0x7d8f86, wains: 'dark_paneled_wood', wt: .8 },
  library: { n: 'the library', x0: 8, z0: 0, x1: 18, z1: 9, floor: 'old_wood_floor', wall: 'wooden_panels', tint: 0x9a7a5c, wt: 1.6, beams: 1 },
  hall: { n: 'the great hall', x0: 18, z0: 0, x1: 34, z1: 12, floor: 'herringbone_parquet', wall: 'decrepit_wallpaper', tint: 0x9c6a5c, wains: 'dark_paneled_wood', wt: 1.4, beams: 1 },
  dining: { n: 'the dining room', x0: 34, z0: 0, x1: 46, z1: 9, floor: 'old_wood_floor', wall: 'quatrefoil_jacquard_fabric', tint: 0x8a5a52, wains: 'dark_paneled_wood', wt: .8, beams: 1 },
  wcorr: { n: 'the west corridor', x0: -8, z0: 9, x1: 18, z1: 12, floor: 'marble_tiles', wall: 'painted_plaster_wall', tint: 0xb9ad98, wains: 'wooden_panels', ft: 1.5 },
  ecorr: { n: 'the east corridor', x0: 34, z0: 9, x1: 46, z1: 12, floor: 'marble_tiles', wall: 'painted_plaster_wall', tint: 0xb9ad98, wains: 'wooden_panels', ft: 1.5 },
  bedroom: { n: 'the blue bedroom', x0: -8, z0: 12, x1: 0, z1: 22, floor: 'dirty_carpet', wall: 'beige_wall_001', tint: 0x8fa0b3, fc: 0x7a6f8a, ft: 2.5 },
  billiard: { n: 'the billiard room', x0: 0, z0: 12, x1: 8, z1: 22, floor: 'dark_wood', wall: 'painted_plaster_wall', tint: 0x4f6a55, wains: 'dark_paneled_wood', ft: 1.4 },
  study: { n: 'the study', x0: 8, z0: 12, x1: 14, z1: 22, floor: 'old_wood_floor', wall: 'wooden_panels', tint: 0x8d6c50, wt: 1.6 },
  bath: { n: 'the bathroom', x0: 14, z0: 12, x1: 20, z1: 16.5, floor: 'marble_mosaic_tiles', wall: 'white_plaster_02', tint: 0xc9d6d2, ft: 1.2, wt: 2, wains: 'marble_mosaic_tiles', wc: 0xe8eeea, wh: 1.7, plain: 1 },
  cloak: { n: 'the cloakroom', x0: 14, z0: 16.5, x1: 20, z1: 22, floor: 'old_wood_floor', wall: 'plastered_wall_04', tint: 0xa89f8e },
  foyer: { n: 'the entrance hall', x0: 20, z0: 12, x1: 32, z1: 22, floor: 'marble_tiles', wall: 'painted_plaster_wall', tint: 0xc2b59c, wains: 'dark_paneled_wood', ft: 2 },
  kitchen: { n: 'the kitchen', x0: 32, z0: 12, x1: 42, z1: 22, floor: 'floor_tiles_06', wall: 'white_plaster_02', tint: 0xcfc6ac, ft: 1.6, wt: 2, wains: 'marble_mosaic_tiles', wc: 0xe2e0d4, wh: 1.5, plain: 1 },
  pantry: { n: 'the pantry', x0: 42, z0: 12, x1: 46, z1: 17, floor: 'floor_tiles_06', wall: 'plastered_wall_04', tint: 0xb5b0a4, ft: 1.6 },
  stairs: { n: 'the cellar stair', x0: 42, z0: 17, x1: 46, z1: 22, floor: 'old_wood_floor', wall: 'plastered_wall_04', tint: 0x9d978a, hole: [43, 19, 46, 20.5] },
  cellar: { n: 'the cellar', x0: 48.2, z0: 13, x1: 58, z1: 24, y: -3.2, h: 2.7, floor: 'monastery_stone_floor', wall: 'castle_brick_07', tint: 0x9a9088, ceil: 'castle_brick_07', ft: 2.2, wt: 1.6, plain: 1 },
  shed: { n: 'the garden shed', x0: -6, z0: -24, x1: -1.6, z1: -20, h: 2.5, floor: 'old_wood_floor', wall: 'wood_table_worn', tint: 0x7c6a58, plain: 1, out: 1 },
};
for (const k in ROOMS) { const r = ROOMS[k]; r.id = k; r.y = r.y || 0; r.h = r.h || H; r.cx = (r.x0 + r.x1) / 2; r.cz = (r.z0 + r.z1) / 2; r.lit = true; }
const X0 = -8, X1 = 46, Z0 = 0, Z1 = 22;
// every opening in a wall: a = which line ('x' means the wall runs along z at x = at), c = its middle along that line
const OPEN = [
  // doors between rooms
  { id: 'd-cons-draw', a: 'x', at: 0, c: 5, w: 1, kind: 'door' }, { id: 'd-cons-corr', a: 'z', at: 9, c: -4, w: 1, kind: 'door' }, { id: 'd-draw-corr', a: 'z', at: 9, c: 4, w: 1.6, kind: 'door', two: 1 },
  { id: 'd-draw-lib', a: 'x', at: 8, c: 2.2, w: 1, kind: 'door' }, { id: 'd-lib-corr', a: 'z', at: 9, c: 13, w: 1, kind: 'door' }, { id: 'd-lib-hall', a: 'x', at: 18, c: 3, w: 1.6, kind: 'door', two: 1 },
  { id: 'a-wcorr-hall', a: 'x', at: 18, c: 10.5, w: 2, kind: 'arch', h: 2.6 }, { id: 'a-ecorr-hall', a: 'x', at: 34, c: 10.5, w: 2, kind: 'arch', h: 2.6 },
  { id: 'd-hall-dining', a: 'x', at: 34, c: 2.2, w: 1.6, kind: 'door', two: 1 }, { id: 'd-dining-corr', a: 'z', at: 9, c: 40, w: 1, kind: 'door' },
  { id: 'a-hall-foyer', a: 'z', at: 12, c: 26, w: 3, kind: 'arch', h: 2.9 },
  { id: 'd-bed-corr', a: 'z', at: 12, c: -4, w: 1, kind: 'door' }, { id: 'd-bill-corr', a: 'z', at: 12, c: 4, w: 1, kind: 'door' }, { id: 'd-study-corr', a: 'z', at: 12, c: 11, w: 1, kind: 'door' },
  { id: 'd-bath-corr', a: 'z', at: 12, c: 16, w: .9, kind: 'door' }, { id: 'd-cloak-foyer', a: 'x', at: 20, c: 19.5, w: .9, kind: 'door' },
  { id: 'd-kitchen-corr', a: 'z', at: 12, c: 38, w: 1, kind: 'door' }, { id: 'd-kitchen-foyer', a: 'x', at: 32, c: 14, w: .9, kind: 'door' }, { id: 'd-pantry', a: 'x', at: 42, c: 14.5, w: .9, kind: 'door' }, { id: 'd-cellar', a: 'x', at: 42, c: 19.75, w: 1, kind: 'door' },
  { id: 'd-bill-study', a: 'x', at: 8, c: 17, w: .9, kind: 'door' },
  // ways out: the terrace's glass doors, the conservatory's garden door, the kitchen's yard door; the front door stays locked
  { id: 'f-hall-1', a: 'z', at: 0, c: 22.5, w: 1.8, kind: 'door', two: 1, glass: 1, h: 2.5 }, { id: 'f-hall-2', a: 'z', at: 0, c: 29.5, w: 1.8, kind: 'door', two: 1, glass: 1, h: 2.5 },
  { id: 'd-cons-garden', a: 'z', at: 0, c: -4, w: 1.1, kind: 'door', glass: 1 }, { id: 'd-front', a: 'z', at: 22, c: 26, w: 2, kind: 'door', two: 1, locked: 1, h: 2.6 },
  // windows
  ...[[-6.6], [-1.4]].map(([c]) => ({ a: 'z', at: 0, c, w: 1.9, kind: 'window', sill: .5, h: 3.2 })), ...[2, 4.5, 7].map(c => ({ a: 'x', at: -8, c, w: 1.9, kind: 'window', sill: .5, h: 3.2 })),
  ...[2, 6].map(c => ({ a: 'z', at: 0, c, w: 1.3, kind: 'window' })), ...[10.3, 15.7].map(c => ({ a: 'z', at: 0, c, w: 1.3, kind: 'window' })), { a: 'z', at: 0, c: 26, w: 1.6, kind: 'window' }, { a: 'z', at: 0, c: 19.6, w: 1, kind: 'window' }, { a: 'z', at: 0, c: 32.4, w: 1, kind: 'window' },
  ...[36.5, 40, 43.5].map(c => ({ a: 'z', at: 0, c, w: 1.3, kind: 'window' })), { a: 'x', at: 46, c: 2, w: 1.3, kind: 'window' }, { a: 'x', at: 46, c: 7, w: 1.3, kind: 'window' }, { a: 'x', at: 46, c: 10.5, w: 1.1, kind: 'window' }, { a: 'x', at: 46, c: 14.5, w: .8, kind: 'window', sill: 1.5, h: 2.4 },
  { a: 'x', at: -8, c: 10.5, w: 1.1, kind: 'window' }, { a: 'x', at: -8, c: 15, w: 1.3, kind: 'window' }, { a: 'x', at: -8, c: 19, w: 1.3, kind: 'window' }, { a: 'z', at: 22, c: -4, w: 1.3, kind: 'window' },
  { a: 'z', at: 22, c: 2.2, w: 1.3, kind: 'window' }, { a: 'z', at: 22, c: 5.8, w: 1.3, kind: 'window' }, { a: 'z', at: 22, c: 9.6, w: 1.1, kind: 'window' }, { a: 'z', at: 22, c: 12.4, w: 1.1, kind: 'window' }, { a: 'z', at: 22, c: 17, w: .8, kind: 'window', sill: 1.5, h: 2.4 },
  { a: 'z', at: 22, c: 22.3, w: 1.2, kind: 'window' }, { a: 'z', at: 22, c: 29.7, w: 1.2, kind: 'window' }, { a: 'z', at: 22, c: 35, w: 1.3, kind: 'window', sill: 1.1 }, { a: 'z', at: 22, c: 39, w: 1.3, kind: 'window', sill: 1.1 },
  // the cellar's way in, the shed's door
  { id: 'a-under', a: 'x', at: 46, c: 19.75, w: 1.5, kind: 'under' }, { id: 'a-cellar', a: 'x', at: 48.2, c: 19.75, w: 1.5, kind: 'arch', h: 2.1, y: -3.2 }, { id: 'd-shed', a: 'x', at: -1.6, c: -22, w: .9, kind: 'door', h: 2 }, { a: 'z', at: -24, c: -3.8, w: .8, kind: 'window', sill: 1, h: 1.9 },
];
for (const o of OPEN) { o.h = o.h || (o.kind === 'window' ? 2.9 : 2.15); o.sill = o.kind === 'window' ? (o.sill ?? .85) : 0; o.y = o.y || 0; }
const DOORS = [], WINDOWS = [];
const onLine = (o, a, at, lo, hi) => o.a === a && Math.abs(o.at - at) < .01 && o.c > lo && o.c < hi;
const ext = (a, at) => (a === 'x' && (at === X0 || at === X1)) || (a === 'z' && (at === Z0 || at === Z1));
const roomAt = (x, z) => { for (const k in ROOMS) { const r = ROOMS[k]; if (x >= r.x0 && x < r.x1 && z >= r.z0 && z < r.z1) return k; } return z < 0 && z > -6 && x > 15 && x < 37 ? 'terrace' : z < 0 ? 'garden' : z > 22 ? 'drive' : 'garden'; };
const roomName = k => ROOMS[k] ? ROOMS[k].n : k === 'terrace' ? 'the terrace' : k === 'drive' ? 'the front drive' : 'the garden';

const M = {};
function mats() {
  M.trim = mat('dark_wood', { tile: 1.2, color: 0x6b4a36, rough: .7 }); M.white = mat('white_plaster_02', { tile: 2, color: 0xe9e4d8 }); M.ceil = mat('ceiling_interior', { tile: 3, color: 0xd9d2c2 }); M.stone = mat('large_sandstone_blocks', { tile: 2.6, color: 0x8d8a86 });
  M.slate = mat('roof_slates_02', { tile: 2.4, color: 0x767c86, rough: .55 }); M.brick = mat('castle_brick_07', { tile: 2, color: 0x9a8d84 }); M.door = mat('rosewood_veneer1', { tile: 1.6, color: 0x7a5038, rough: .55 }); M.fine = mat('fine_grained_wood', { tile: 1.2, color: 0x80583c, rough: .5 });
  M.brass = flat(0xb08a3c, { metal: 1, rough: .32 }); M.iron = flat(0x1c1c1e, { metal: .9, rough: .5 }); M.soot = flat(0x0c0a09, { rough: 1 }); M.marble = mat('marble_01', { tile: 1.5, rough: .35 }); M.velvet = mat('velour_velvet', { tile: .7, color: 0x6e1f22, side: THREE.DoubleSide });
  M.velvetG = mat('velour_velvet', { tile: .7, color: 0x24402e, side: THREE.DoubleSide }); M.velvetB = mat('velour_velvet', { tile: .7, color: 0x2a3a5c, side: THREE.DoubleSide });
  M.gravel = mat('gravel_floor_02', { tile: 2.5, color: 0x77726b, rough: .7 }); M.mud = mat('brown_mud_leaves_01', { tile: 3, color: 0x5d5a50, rough: .55 }); M.grass = mat('leafy_grass', { tile: 2.6, color: 0x4d5a45, rough: .7 }); M.terrace = mat('slate_floor_02', { tile: 1.8, color: 0x8b8f93, rough: .3 });
  M.cobble = mat('cobblestone_floor_04', { tile: 2.2, color: 0x7f7c78, rough: .45 }); M.metal = mat('rusty_metal_02', { tile: 1, metal: .8, color: 0x6a6460 }); M.leather = mat('brown_leather', { tile: .8, rough: .6 }); M.plank = mat('wood_table_worn', { tile: 1.4, color: 0x8a7460 });
  M.rug = [0x7a2a2a, 0x2f4a66, 0x5c4a2a, 0x3d5a45].map(c => mat('fabric_pattern_07', { tile: 1.1, color: c })); M.enamel = flat(0xf1efe8, { rough: .18 }); M.chrome = flat(0xc8ccd0, { metal: 1, rough: .15 }); M.bark = mat('dark_wood', { tile: .8, color: 0x3a332c, rough: 1 });
}

// A WALL'S FACE on one side of a room, cut round its openings. side N/S/W/E is the wall it is; faces point into the room
function face(place, r, side, m, mw, wh, y0, y1, open, off = T, outward = false) {
  const along = side === 'N' || side === 'S' ? 'x' : 'z', lo = along === 'x' ? r.x0 : r.z0, hi = along === 'x' ? r.x1 : r.z1, at = side === 'N' ? r.z0 : side === 'S' ? r.z1 : side === 'W' ? r.x0 : r.x1;
  const inward = (side === 'N' || side === 'W') ? 1 : -1, pl = at + inward * off * (outward ? -1 : 1), flip = ((side === 'N' || side === 'E') ? 1 : -1) * (outward ? -1 : 1);
  const pt = (u, y) => along === 'x' ? [u, y, pl] : [pl, y, u];
  const q = (mm, u0, u1, a, b) => { if (u1 - u0 < .01 || b - a < .01) return; const [p, s] = flip > 0 ? [u0, u1] : [u1, u0]; quad(place, mm, pt(p, a), pt(s, a), pt(s, b), pt(p, b), { u0: p / (mm.userData.tile || 2) * (flip > 0 ? 1 : -1), v0: a / (mm.userData.tile || 2) }); };
  const strip = (u0, u1, a, b) => { if (mw && wh > a) { q(mw, u0, u1, a, Math.min(b, wh)); if (b > wh) q(m, u0, u1, wh, b); } else q(m, u0, u1, a, b); };
  const os = open.filter(o => o.kind !== 'under' && onLine(o, along === 'x' ? 'z' : 'x', at, lo, hi) && Math.abs((o.y || 0) - (r.y || 0)) < 1).sort((a, b) => a.c - b.c); let u = lo;
  for (const o of os) { const a = o.c - o.w / 2, b = o.c + o.w / 2; strip(u, a, y0, y1); if (o.sill > 0) strip(a, b, y0, y0 + o.sill); strip(a, b, y0 + o.h, y1); u = b; }
  strip(u, hi, y0, y1); return os;
}
// the runs of wall between a side's doors (for skirting, rails and the grid)
function runs(r, side, kinds) { const along = side === 'N' || side === 'S' ? 'x' : 'z', lo = along === 'x' ? r.x0 : r.z0, hi = along === 'x' ? r.x1 : r.z1, at = side === 'N' ? r.z0 : side === 'S' ? r.z1 : side === 'W' ? r.x0 : r.x1;
  const os = OPEN.filter(o => onLine(o, along === 'x' ? 'z' : 'x', at, lo, hi) && kinds.includes(o.kind) && Math.abs((o.y || 0) - (r.y || 0)) < 1).sort((a, b) => a.c - b.c), out = []; let u = lo; for (const o of os) { out.push([u, o.c - o.w / 2]); u = o.c + o.w / 2; } out.push([u, hi]); return { along, at, out: out.filter(s => s[1] - s[0] > .02) }; }
// a box lying along a wall: u0..u1 along it, sticking d into the room from the face, y0..y1
function along(place, m, r, side, u0, u1, y0, y1, d, off = T) { const inward = (side === 'N' || side === 'W') ? 1 : -1, at = (side === 'N' ? r.z0 : side === 'S' ? r.z1 : side === 'W' ? r.x0 : r.x1) + inward * off, a = Math.min(at, at + inward * d), b = Math.max(at, at + inward * d);
  if (side === 'N' || side === 'S') box(place, m, u0, y0, a, u1, y1, b); else box(place, m, a, y0, u0, b, y1, u1); }

function buildRooms() {
  for (const k in ROOMS) { const r = ROOMS[k], y = r.y, top = y + r.h, wm = mat(r.wall, { tile: r.wt || 1.2, color: r.tint }), fm = mat(r.floor, { tile: r.ft || 2, color: r.fc ?? 0xffffff, rough: k === 'foyer' || k.endsWith('corr') ? .35 : 1 }), wains = r.wains ? mat(r.wains, { tile: 1.1, color: r.wc ?? 0x6a4a38, rough: .6 }) : null;
    // the floor (the stair room's has a hole the stair goes down through) and the ceiling
    const fl = (x0, z0, x1, z1) => quad(k, fm, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], { noShadow: 1 });
    if (r.hole) { const [a, b, c, d] = r.hole; fl(r.x0, r.z0, r.x1, b); fl(r.x0, d, r.x1, r.z1); fl(r.x0, b, a, d); } else fl(r.x0, r.z0, r.x1, r.z1);
    const cm = r.ceil ? mat(r.ceil, { tile: 2, color: 0x6f6862 }) : M.ceil; quad(k, cm, [r.x0, top, r.z0], [r.x1, top, r.z0], [r.x1, top, r.z1], [r.x0, top, r.z1]);
    for (const side of 'NSWE') { face(k, r, side, wm, wains, y + (r.wh || 1.05), y, top, OPEN);
      if (r.plain) continue;
      const R = runs(r, side, ['door', 'arch']); for (const [a, b] of R.out) { along(k, M.trim, r, side, a, b, y, y + .14, .025); if (wains) along(k, M.trim, r, side, a, b, y + 1.03, y + 1.1, .04); }
      const lo = side === 'N' || side === 'S' ? r.x0 : r.z0, hi = side === 'N' || side === 'S' ? r.x1 : r.z1; along(k, r.wall === 'wooden_panels' ? M.trim : M.white, r, side, lo, hi, top - .14, top, .12); along(k, r.wall === 'wooden_panels' ? M.trim : M.white, r, side, lo, hi, top - .2, top - .14, .05); }
    if (r.beams) { const n = Math.round((r.x1 - r.x0) / 2.6); for (let i = 1; i < n; i++) { const x = r.x0 + (r.x1 - r.x0) * i / n; box(k, M.trim, x - .11, top - .26, r.z0 + T, x + .11, top, r.z1 - T); } box(k, M.trim, r.x0 + T, top - .2, r.cz - .09, r.x1 - T, top, r.cz + .09); }
    // the grid and the physics: every side's wall, except where a door or arch stands
    for (const side of 'NSWE') { const R = runs(r, side, ['door', 'arch', 'under']); for (const [a, b] of R.out) { const m = (a + b) / 2, hl = (b - a) / 2; if (R.along === 'x') { mark(m, R.at, hl, .13, 0, { dark: 1 }); solid(a, y, R.at - .12, b, top, R.at + .12); } else { mark(R.at, m, .13, hl, 0, { dark: 1 }); solid(R.at - .12, y, a, R.at + .12, top, b); } } }
  }
  // windows let sight through
  for (const o of OPEN) if (o.kind === 'window' || o.glass) { const hw = o.w / 2 - .08; if (o.a === 'z') mark(o.c, o.at, hw, .2, 0, { dark: 1, solid: false, clear: 1 }); else mark(o.at, o.c, .2, hw, 0, { dark: 1, solid: false, clear: 1 }); }
}

// the outside of the house: stone on all four sides round the openings, a plinth, a band, the roof and its chimneys
function buildShell() {
  const R = { x0: X0, x1: X1, z0: Z0, z1: Z1, y: 0 }, top = 4.5; for (const side of 'NSWE') { face('out', R, side, M.stone, null, 0, -.4, top, OPEN, .26, true); along('out', M.stone, R, side, side === 'N' || side === 'S' ? X0 - .3 : Z0 - .3, side === 'N' || side === 'S' ? X1 + .3 : Z1 + .3, -.4, .45, -.34, 0); along('out', M.stone, R, side, side === 'N' || side === 'S' ? X0 - .34 : Z0 - .34, side === 'N' || side === 'S' ? X1 + .34 : Z1 + .34, top - .35, top, -.4, 0); }
  // the wall's own thickness above the ceilings, so no light or lightning comes through the roof space
  box('out', M.soot, X0 - .2, H + .02, Z0 - .2, X1 + .2, H + .12, Z1 + .2, { noShadow: 0 });
  const e = .7, y0 = top, y1 = top + 5.2, rx0 = X0 - e, rx1 = X1 + e, rz0 = Z0 - e, rz1 = Z1 + e, ri = 11.7, A = [rx0, y0, rz0], B = [rx1, y0, rz0], C = [rx1, y0, rz1], D = [rx0, y0, rz1], E = [rx0 + ri, y1, 11], F = [rx1 - ri, y1, 11];
  const tri = (a, b, c) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)); const uv = [a, b, c].flatMap(p => [(p[0] + p[2]) / 2.4, p[1] / 1.6]); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); gather('out', M.slate, g); };
  tri(A, E, B); tri(B, E, F); tri(C, F, D); tri(D, F, E); tri(A, D, E); tri(B, F, C); box('out', M.trim, rx0, y0 - .12, rz0, rx1, y0 + .02, rz1);
  for (const [x, z] of [[4, 2], [13, 2], [34.6, 6.4], [45, 4.5], [11, 20]]) { box('out', M.brick, x - .7, top, z - .5, x + .7, top + 6.6, z + .5); box('out', M.stone, x - .8, top + 6.6, z - .6, x + .8, top + 6.8, z + .6); }
}

// A DOOR'S LEAF: stiles, rails and raised panels (or glass), a brass knob; it hangs on a hinge group
function leaf(w, h, glass) { const g = new THREE.Group(), add = (m, x0, y0, z0, x1, y1, z1) => { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  const s = .1, t = .022; add(M.door, 0, 0, -t, s, h, t); add(M.door, w - s, 0, -t, w, h, t); add(M.door, s, 0, -t, w - s, .2, t); add(M.door, s, h - s, -t, w - s, h, t); add(M.door, s, h * .45, -t, w - s, h * .45 + s, t);
  if (glass) { const gm = glassMat(); const p = add(gm, s, .2, -.004, w - s, h - s, .004); p.castShadow = false; add(M.door, w / 2 - .015, .2, -.012, w / 2 + .015, h - s, .012); add(M.door, s, h * .72, -.012, w - s, h * .72 + .03, .012); }
  else { add(M.fine, s, .2, -.012, w - s, h * .45, .012); add(M.fine, s, h * .45 + s, -.012, w - s, h - s, .012); add(M.door, s + .08, .28, -.02, w - s - .08, h * .45 - .08, .02); add(M.door, s + .08, h * .45 + s + .08, -.02, w - s - .08, h - s - .08, .02); }
  for (const z of [-.05, .05]) { const k = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 8), M.brass); k.position.set(w - .06, 1.02, z); g.add(k); } return g; }
let GLASS = null; const RAINT = { value: 0 }, FLASH = { value: 0 };
// glass with the rain running down it
function glassMat() { if (GLASS) return GLASS; GLASS = new THREE.MeshPhysicalMaterial({ color: 0x9fb4c4, roughness: .06, metalness: 0, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 2.2 });
  GLASS.onBeforeCompile = s => { s.uniforms.rt = RAINT; s.uniforms.fl = FLASH; s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 wp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nwp=(modelMatrix*vec4(position,1.)).xyz;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 wp; uniform float rt,fl; float hh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n vec2 q=vec2((wp.x+wp.z)*26.,wp.y*5.); float col=floor(q.x); float sp=.5+hh(vec2(col,1.))*1.6; float y=fract(q.y*.16+rt*sp+hh(vec2(col,7.))); float streak=smoothstep(.0,.05,y)*smoothstep(.5,.05,y)*step(.62,hh(vec2(col,3.)))*smoothstep(.5,.2,abs(fract(q.x)-.5)); float beads=step(.965,hh(floor(vec2(wp.x+wp.z,wp.y)*55.)+floor(rt*.3))); float w=streak*.55+beads*.5; gl_FragColor.rgb+=vec3(.5,.62,.75)*w*(.1+fl*1.6); gl_FragColor.a=clamp(gl_FragColor.a+w*.5+fl*.12,0.,1.);'); };
  return GLASS; }

function buildOpenings() {
  for (const o of OPEN) { if (o.kind === 'under') continue; const isX = o.a === 'x', outer = ext(o.a, o.at), place = outer ? 'out' : roomAt(isX ? o.at + .5 : o.c, isX ? o.c : o.at + .5), dp = outer ? .5 : .32, y = o.y, a = o.c - o.w / 2, b = o.c + o.w / 2, ctr = outer ? (o.at === X0 || o.at === Z0 ? -.08 : .08) : 0;
    const bx = (m, u0, y0, d0, u1, y1, d1, pl = place) => isX ? box(pl, m, o.at + ctr + d0, y0, u0, o.at + ctr + d1, y1, u1) : box(pl, m, u0, y0, o.at + ctr + d0, u1, y1, o.at + ctr + d1);
    const pl2 = outer ? roomAt(isX ? (o.at === X0 ? o.at + .5 : o.at - .5) : o.c, isX ? o.c : (o.at === Z0 ? o.at + .5 : o.at - .5)) : place, fm = o.kind === 'window' ? M.white : M.trim;
    // the casing: jambs, head (and a sill board), a little proud of the wall each side
    bx(fm, a - .1, y + o.sill - (o.sill ? .05 : 0), -dp / 2, a, y + o.h + .1, dp / 2, pl2); bx(fm, b, y + o.sill - (o.sill ? .05 : 0), -dp / 2, b + .1, y + o.h + .1, dp / 2, pl2); bx(fm, a, y + o.h, -dp / 2, b, y + o.h + .1, dp / 2, pl2);
    if (o.kind === 'arch') bx(M.trim, a, y - .005, -.12, b, y + .012, .12, pl2);
    if (o.kind === 'window') { bx(M.white, a - .14, y + o.sill - .06, -dp / 2 - .06, b + .14, y + o.sill, dp / 2 + .04, pl2); const gm = glassMat(), g = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h - o.sill), gm); g.position.set(isX ? o.at + ctr : o.c, y + (o.h + o.sill) / 2, isX ? o.c : o.at + ctr); if (isX) g.rotation.y = Math.PI / 2; g.renderOrder = 5; group(pl2).add(g);
      const bars = Math.max(1, Math.round(o.w / .65)) - 1; for (let i = 1; i <= bars; i++) { const u = a + o.w * i / (bars + 1); bx(M.white, u - .018, y + o.sill, -.025, u + .018, y + o.h, .025, pl2); } const rows = Math.round((o.h - o.sill) / .7); for (let i = 1; i < rows; i++) { const yy = y + o.sill + (o.h - o.sill) * i / rows; bx(M.white, a, yy - .018, -.025, b, yy + .018, .025, pl2); }
      WINDOWS.push({ x: isX ? o.at : o.c, z: isX ? o.c : o.at, o, room: pl2 });
      // curtains inside, gathered each side under a pelmet
      if (pl2 !== 'conserv' && pl2 !== 'bath' && pl2 !== 'kitchen' && pl2 !== 'pantry' && pl2 !== 'shed' && pl2 !== 'cloak') { const inn = (o.at === X0 || o.at === Z0 || o.at === -24) ? 1 : -1, cm = pl2 === 'billiard' || pl2 === 'study' ? M.velvetG : pl2 === 'bedroom' || pl2 === 'library' ? M.velvetB : M.velvet;
        for (const s of [-1, 1]) { const g2 = curtain(.5, o.h + .25 - .1, cm); const u = s < 0 ? a - .28 : b + .28 - .5; g2.translate(0, y + .1, 0); if (isX) { g2.rotateY(-Math.PI / 2); g2.translate(o.at + inn * .24, 0, u + (inn > 0 ? .5 : 0) * 0 + .0); g2.translate(0, 0, .5 * 0); } else g2.translate(u, 0, o.at + inn * .24); if (isX) { g2.translate(0, 0, 0); } gather(pl2, cm, g2); }
        bx(M.trim, a - .34, y + o.h + .12, inn > 0 ? .14 : -.34, b + .34, y + o.h + .3, inn > 0 ? .34 : -.14, pl2); } }
    if (o.kind === 'door') { const n = o.two ? 2 : 1, lw = o.w / n - .012; const D = { o, id: o.id, x: isX ? o.at : o.c, z: isX ? o.c : o.at, isX, open: 0, want: 0, locked: !!o.locked, leaves: [], rooms: [roomAt(isX ? o.at - .6 : o.c, isX ? o.c : o.at - .6), roomAt(isX ? o.at + .6 : o.c, isX ? o.c : o.at + .6)], y, sight: !o.glass };
      for (let i = 0; i < n; i++) { const hg = new THREE.Group(), L = leaf(lw, o.h - .02, o.glass), u = i === 0 ? a + .006 : b - .006; hg.position.set(isX ? o.at : u, y + .01, isX ? u : o.at); const base = isX ? (i === 0 ? -Math.PI / 2 : Math.PI / 2) : (i === 0 ? 0 : Math.PI); hg.rotation.y = base; hg.add(L); scene.add(hg); D.leaves.push({ hg, base, dir: i === 0 ? 1 : -1 }); }
      DOORS.push(D); setDoorGrid(D); if (!D.locked || o.id !== 'd-front') D.use = USE.add({ x: D.x, y: y + 1.1, z: D.z, r: 1.5, door: D, label: () => D.locked ? 'Locked' : D.open > .5 ? 'Close the door' : 'Open the door', act: () => { if (D.locked) { BUS.say('sound', 'locked', D.x, D.z); return; } toggleDoor(D); } }); }
  }
}
// a hanging cloth in folds: w wide, h high, its top at h, in its own plane (x along, y up)
function curtain(w, h, m) { const n = 14, g = new THREE.BufferGeometry(), p = [], uv = [], idx = [], t = m.userData.tile || .7; for (let j = 0; j <= 6; j++) for (let i = 0; i <= n; i++) { const u = i / n, v = j / 6, sway = .03 + .05 * (1 - v); p.push(u * w, v * h, Math.sin(u * Math.PI * 5) * sway); uv.push(u * w * 2.2 / t, v * h / t); }
  for (let j = 0; j < 6; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i; idx.push(a, a + 1, a + n + 2, a, a + n + 2, a + n + 1); } g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g.toNonIndexed(); }
function setDoorGrid(D) { const shut = D.want < .5, hw = D.o.w / 2; if (D.isX) mark(D.x, D.z, .13, hw, 0, { dark: D.sight, clear: !shut }); else mark(D.x, D.z, hw, .13, 0, { dark: D.sight, clear: !shut }); if (shut && !D.sight) { if (D.isX) mark(D.x, D.z, .13, hw, 0, { dark: 1, solid: false, clear: 1 }); else mark(D.x, D.z, hw, .13, 0, { dark: 1, solid: false, clear: 1 }); } }
function toggleDoor(D, to) { const w = to === undefined ? (D.want > .5 ? 0 : 1) : to; if (w === D.want) return; D.want = w; setDoorGrid(D); BUS.say('sound', w ? 'dooropen' : 'doorshut', D.x, D.z); BUS.say('door', D); }
function stepDoors(dt) { for (const D of DOORS) { if (D.open !== D.want) { D.open = D.want > D.open ? Math.min(D.want, D.open + dt * 2.2) : Math.max(D.want, D.open - dt * 2.6); const e = D.open * D.open * (3 - 2 * D.open); for (const L of D.leaves) L.hg.rotation.y = L.base + L.dir * e * 1.75 * (D.isX ? -1 : 1) * -1; } } }
const doorNear = (x, z, r = 1.2) => DOORS.find(D => Math.hypot(D.x - x, D.z - z) < r);

// A HEARTH: a chimney breast into the room, a stone surround, a mantel, logs, flames and their light
const FIRES = [];
function hearth(place, x, z, side, lit = true) { const r = ROOMS[place], w = 2.3, d = .5, inward = side === 'N' || side === 'W' ? 1 : -1, isZ = side === 'N' || side === 'S';
  const bx = (m, u0, y0, d0, u1, y1, d1) => isZ ? box(place, m, x + u0, y0, z + inward * Math.min(d0, d1) + (inward < 0 ? 0 : 0), x + u1, y1, z + inward * Math.max(d0, d1)) : box(place, m, x + inward * Math.min(d0, d1), y0, z + u0, x + inward * Math.max(d0, d1), y1, z + u1);
  const fix = (m, u0, y0, d0, u1, y1, d1) => { const a = inward > 0 ? [d0, d1] : [-d1, -d0]; if (isZ) box(place, m, x + u0, y0, z + a[0], x + u1, y1, z + a[1]); else box(place, m, x + a[0], y0, z + u0, x + a[1], y1, z + u1); };
  const wm = mat(r.wall, { tile: r.wt || 1.2, color: r.tint });
  fix(wm, -w / 2, 1.5, T, w / 2, H, d); fix(wm, -w / 2, 0, T, -.62, 1.5, d); fix(wm, .62, 0, T, w / 2, 1.5, d); fix(M.soot, -.62, 0, T, .62, 1.5, T + .06); fix(M.brick, -.62, 0, T + .06, -.56, 1.1, d); fix(M.brick, .56, 0, T + .06, .62, 1.1, d); fix(M.brick, -.62, 1.1, T + .06, .62, 1.5, d);
  fix(M.marble, -.86, 0, d, -.56, 1.22, d + .08); fix(M.marble, .56, 0, d, .86, 1.22, d + .08); fix(M.marble, -.86, 1.1, d, .86, 1.3, d + .08); fix(M.trim, -1.05, 1.3, T, 1.05, 1.38, d + .2); fix(M.marble, -.95, 0, d, .95, .05, d + .55); fix(M.iron, -.4, .05, T + .16, .4, .1, d - .06);
  const cx = isZ ? x : x + inward * (T + .28), cz = isZ ? z + inward * (T + .28) : z; for (let i = 0; i < 4; i++) { const g = new THREE.CylinderGeometry(.045 + rnd(.02), .05 + rnd(.02), .5, 7); g.rotateZ(Math.PI / 2); g.rotateY(rnd(-.5, .5) + (isZ ? 0 : Math.PI / 2)); g.translate(cx + rnd(-.05, .05), .16 + (i > 1 ? .1 : 0), cz + rnd(-.05, .05)); gather(place, M.bark, g); }
  if (isZ) mark(x, z + inward * (d / 2 + T), w / 2, d / 2 + .1); else mark(x + inward * (d / 2 + T), z, d / 2 + .1, w / 2);
  const F = { place, x: cx, y: .2, z: cz, lit, isZ, mx: isZ ? x : x + inward * (d + .1), mz: isZ ? z + inward * (d + .1) : z, face: isZ ? (inward > 0 ? 0 : Math.PI) : (inward > 0 ? Math.PI / 2 : -Math.PI / 2) };
  const fm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: { t: RAINT, s: { value: rnd(10) }, on: { value: lit ? 1 : 0 } }, vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float t,s,on; varying vec2 v; float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); float a=fract(sin(dot(i,vec2(12.9,78.2)))*43758.5),b=fract(sin(dot(i+vec2(1,0),vec2(12.9,78.2)))*43758.5),c=fract(sin(dot(i+vec2(0,1),vec2(12.9,78.2)))*43758.5),d=fract(sin(dot(i+vec2(1,1),vec2(12.9,78.2)))*43758.5); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); } void main(){ float tt=t*3.+s; vec2 p=v; p.x+=(n(vec2(p.y*3.-tt*1.4,s))-.5)*.3*p.y; float f=n(vec2(p.x*5.,p.y*3.-tt*2.))*.6+n(vec2(p.x*11.,p.y*7.-tt*3.3))*.4; float shape=smoothstep(.5,.0,abs(p.x-.5))*(1.-p.y); float a=smoothstep(.28,.75,f*shape*2.1); vec3 c=mix(vec3(1.,.25,.02),vec3(1.,.85,.4),a*a); gl_FragColor=vec4(c*a*1.5*on,a*on); }' });
  for (let i = 0; i < 3; i++) { const q = new THREE.Mesh(new THREE.PlaneGeometry(.75, .62), fm); q.position.set(cx, .42, cz); q.rotation.y = F.face + (i - 1) * .9; q.renderOrder = 6; group(place).add(q); } F.mat = fm; FIRES.push(F); return F; }

// THE CELLAR STAIR and what is under the ground
function buildCellar() { const y1 = -3.2, x0 = 43, x1 = 48.2, z0 = 19, z1 = 20.5, n = 16, st = mat('wood_table_worn', { tile: 1.2, color: 0x6f5a48 });
  for (let i = 0; i < n; i++) { const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, y = y1 * (i + 1) / n; box('stairs', st, xa, y - .05, z0, xb + .03, y, z1); box('stairs', M.trim, xa, y - .19, z0 + .02, xa + .03, y - .05, z1 - .02); }
  // the stairwell's sides and roof under the floor, the rail round the hole
  const wm = mat('castle_brick_07', { tile: 1.6, color: 0x9a9088 }); quad('stairs', wm, [x0, y1, z0], [x1, y1, z0], [x1, 0, z0], [x0, 0, z0]); quad('stairs', wm, [x1, y1, z1], [x0, y1, z1], [x0, 0, z1], [x1, 0, z1]); quad('stairs', wm, [46, -.02, z1], [x1, -.02, z1], [x1, -.02, z0], [46, -.02, z0]); quad('stairs', wm, [x0, y1, z1], [x0, y1, z0], [x0, 0, z0], [x0, 0, z1]);
  quad('cellar', mat('monastery_stone_floor', { tile: 2.2 }), [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]);
  for (const z of [z0 - .04, z1 + .04]) { box('stairs', M.trim, 43.6, .9, z - .03, 45.9, .96, z + .03); for (let x = 43.6; x < 46; x += .28) box('stairs', M.trim, x - .02, 0, z - .02, x + .02, .9, z + .02); mark(44.75, z, 1.2, .08); }
  HGT.ramps.push({ x0, x1, z0: z0 - .2, z1: z1 + .2, ax: 'x', ya: 0, yb: y1 }, { x0: x1, x1: 58.4, z0: 12.6, z1: 24.4, y: y1 });
  // physics: the ramp, the cellar's floor; the ground slab everywhere but over the stair
  const len = Math.hypot(x1 - x0, y1), ang = Math.atan2(-y1, x1 - x0); P.world.createCollider(RAPIER.ColliderDesc.cuboid(len / 2, .1, (z1 - z0) / 2).setTranslation((x0 + x1) / 2, y1 / 2 - .1, (z0 + z1) / 2).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -ang))).setFriction(.9).setCollisionGroups(grp(GRP.WORLD, 0xffff)));
  solid(x0, y1 - .5, 12, 59, y1, 25); solid(-40, -.5, -40, x0, 0, 50); solid(x0, -.5, -40, 70, 0, z0); solid(x0, -.5, z1, 70, 0, 50); solid(46, -.5, z0, 48.2, -.02, z1); solid(x0, y1, z0 - .2, x1, 0, z0); solid(x0, y1, z1, x1, 0, z1 + .2);
  // nothing walks the lawn over the cellar: the grid there belongs to the cellar
  mark(52, 6, 5.8, 6.6); mark(52, 31, 5.8, 6.6); mark(47.1, 15.8, 1.05, 3.1); mark(47.1, 23, 1.05, 2.4); mark(58.6, 18.5, .3, 6); mark(53, 12.7, 5, .25); mark(53, 24.3, 5, .25);
  for (const [a, b, c, d] of [[x0, z0 - .13, x1, z0 - .13], [x0, z1 + .13, x1, z1 + .13]]) mark((a + c) / 2, b, (c - a) / 2, .1, 0, { dark: 1 });
}

// bare trees for a storm in autumn: a trunk that forks and forks again
function tree(x, z, hgt = 9, sd = 1) { let s = sd * 9301 + 49297; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; const geos = [];
  const limb = (p, dir, len, rad, depth) => { const e = p.clone().addScaledVector(dir, len), g = new THREE.CylinderGeometry(rad * .68, rad, len, depth > 2 ? 4 : 6, 1), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); g.applyQuaternion(q); g.translate((p.x + e.x) / 2, (p.y + e.y) / 2, (p.z + e.z) / 2); geos.push(g);
    if (depth >= 5 || rad < .012) return; const n = depth === 0 ? 3 : 2 + (r() > .6 ? 1 : 0); for (let i = 0; i < n; i++) { const d2 = dir.clone().add(new THREE.Vector3(r() - .5, r() * .5 - .05, r() - .5).multiplyScalar(1.15)).normalize(); limb(e, d2, len * (.62 + r() * .2), rad * .62, depth + 1); } };
  limb(new THREE.Vector3(x, -.2, z), new THREE.Vector3((r() - .5) * .15, 1, (r() - .5) * .15).normalize(), hgt * .34, hgt * .028, 0); for (const g of geos) gather('out', M.bark, g); mark(x, z, .3, .3, 0, { dark: 1 }); }

const RAIN = { mesh: null };
function buildGrounds() {
  const G = (m, x0, z0, x1, z1, y = 0) => quad('out', m, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], { noShadow: 1 });
  // the lawn is cut round the house so no grass shows through a floor
  G(M.grass, -34, -34, 70, -6); G(M.grass, -34, -6, 15.5, 0); G(M.grass, 36.5, -6, 70, 0); G(M.grass, -34, 0, X0 - .3, 22); G(M.grass, X1 + .3, 0, 70, 22); G(M.mud, -34, 22, 14, 50); G(M.mud, 38, 22, 70, 50); G(M.gravel, 14, 22.3, 38, 50);
  // the terrace: slate, a stone balustrade with two gaps, wide steps of one tread
  box('out', M.terrace, 15.5, -.3, -6, 36.5, .02, -.26); const bal = (x0, z0, x1, z1) => { box('out', M.stone, x0, .82, z0, x1, .95, z1); box('out', M.stone, x0, .02, z0, x1, .12, z1); const n = Math.round(Math.max(x1 - x0, z1 - z0) / .3); for (let i = 0; i <= n; i++) { const g = new THREE.CylinderGeometry(.05, .07, .7, 8); g.translate(lerp(x0 + .07, x1 - .07, x1 - x0 > .3 ? i / n : .5), .47, lerp(z0 + .07, z1 - .07, z1 - z0 > .3 ? i / n : .5)); gather('out', M.stone, g); } mark((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2 + .05, (z1 - z0) / 2 + .05); solid(x0, 0, z0, x1, .95, z1); };
  bal(15.5, -6, 15.7, -.3); bal(36.3, -6, 36.5, -.3); bal(15.5, -6, 23.5, -5.8); bal(28.5, -6, 36.5, -5.8);
  // gravel walks, the round pond with its figure, benches under lamps
  G(M.gravel, 24.6, -22, 27.4, -6, .01); const rim = new THREE.TorusGeometry(3.3, .28, 8, 40); rim.rotateX(Math.PI / 2); rim.scale(1, 1.3, 1); rim.translate(26, .2, -16); gather('out', M.stone, rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(3.25, 40), new THREE.MeshPhysicalMaterial({ color: 0x0a1116, roughness: .08, metalness: .2, envMapIntensity: 3 })); water.rotation.x = -Math.PI / 2; water.position.set(26, .3, -16); group('out').add(water);
  for (let a = 0; a < 40; a++) mark(26 + Math.cos(a / 40 * 6.283) * 3.3, -16 + Math.sin(a / 40 * 6.283) * 3.3, .3, .3); G(M.gravel, 20.8, -21.2, 31.2, -10.8, .008);
  // the estate's wall, all the way round, and the iron gate that will not open tonight
  const wall = (x0, z0, x1, z1) => { box('out', M.stone, x0, -.2, z0, x1, 2.7, z1); box('out', M.slate, x0 - .08, 2.7, z0 - .08, x1 + .08, 2.82, z1 + .08); mark((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, 0, { dark: 1 }); solid(x0, 0, z0, x1, 2.8, z1); };
  wall(-20, -31, 46.6, -30.5); wall(-20.5, -31, -20, 40.5); wall(46.3, -31, 46.8, 0); wall(46.3, 22, 46.8, 40.5); wall(-20, 40, 24.4, 40.5); wall(27.6, 40, 46.6, 40.5); mark(26, 40.2, 1.7, .3);
  for (const x of [24, 28]) { box('out', M.stone, x - .4, 0, 39.85, x + .4, 3.4, 40.65); const b = new THREE.SphereGeometry(.3, 12, 10); b.translate(x, 3.7, 40.25); gather('out', M.stone, b); }
  // the shed's weatherboards and roof
  const s = ROOMS.shed; face('out', s, 'N', M.plank, null, 0, 0, 2.5, OPEN, .08, true); face('out', s, 'S', M.plank, null, 0, 0, 2.5, OPEN, .08, true); face('out', s, 'W', M.plank, null, 0, 0, 2.5, OPEN, .08, true); face('out', s, 'E', M.plank, null, 0, 0, 2.5, OPEN, .08, true);
  { const g = new THREE.BoxGeometry(5.2, .08, 3); g.rotateX(.42); g.translate(s.cx, 3.05, s.cz - 1.2); gather('out', M.slate, g); const g2 = new THREE.BoxGeometry(5.2, .08, 3); g2.rotateX(-.42); g2.translate(s.cx, 3.05, s.cz + 1.2); gather('out', M.slate, g2); for (const x of [s.x0 - .08, s.x1 + .08]) { const t = new THREE.BufferGeometry(); t.setAttribute('position', new THREE.Float32BufferAttribute([x, 2.5, s.z0, x, 2.5, s.z1, x, 3.62, s.cz, x, 2.5, s.z1, x, 2.5, s.z0, x, 3.62, s.cz], 3)); t.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 1, 1, 0, 0, 2, 0, 1, 1], 2)); t.computeVertexNormals(); gather('out', M.plank, t); } }
  // trees along the walls and loose on the lawns
  const T2 = [[-16, -26, 11], [-9, -27, 9], [4, -27, 12], [13, -26, 10], [38, -27, 12], [43, -22, 9], [-17, -12, 12], [-16, 2, 10], [-17, 16, 12], [-15, 30, 11], [-6, 36, 9], [8, 35, 12], [42, 34, 11], [36, 37, 9], [43, -8, 10], [10, -14, 8], [-12, -18, 9]]; T2.forEach(([x, z, h], i) => tree(x, z, h, i + 3));
  // the sky: a low ceiling of cloud that the lightning lights from inside
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, uniforms: { t: RAINT, fl: FLASH, fp: { value: new THREE.Vector2(.3, .2) } }, vertexShader: 'varying vec3 d; void main(){ d=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float t,fl; uniform vec2 fp; varying vec3 d; float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); float a=fract(sin(dot(i,vec2(12.9,78.2)))*43758.5),b=fract(sin(dot(i+vec2(1,0),vec2(12.9,78.2)))*43758.5),c=fract(sin(dot(i+vec2(0,1),vec2(12.9,78.2)))*43758.5),e=fract(sin(dot(i+vec2(1,1),vec2(12.9,78.2)))*43758.5); return mix(mix(a,b,f.x),mix(c,e,f.x),f.y); } float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*n(p); p*=2.03; a*=.5; } return s; } void main(){ vec3 v=normalize(d); vec2 uv=v.xz/(abs(v.y)+.18)*1.4+vec2(t*.012,t*.02); float c=fbm(uv); float c2=fbm(uv*2.3+3.); vec3 col=mix(vec3(.012,.016,.024),vec3(.05,.058,.075),smoothstep(.3,.8,c)); float g=exp(-6.*length(v.xz/(abs(v.y)+.3)-fp)); col+=vec3(.55,.62,.8)*fl*(.25+g*2.2)*(.4+c2); col*=smoothstep(-.05,.25,v.y)*.9+.1; gl_FragColor=vec4(col,1.); }' }));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky); RAIN.sky = sky;
  // the rain: streaks that fall round you wherever there is no roof
  const N = LOW ? 2500 : 9000, pos = new Float32Array(N * 6), sd = new Float32Array(N * 2); for (let i = 0; i < N; i++) { const x = rnd(-1, 1), y = rnd(), z = rnd(-1, 1); pos.set([x, y, z, x, y, z], i * 6); sd[i * 2] = 0; sd[i * 2 + 1] = 1; }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); rg.setAttribute('e', new THREE.BufferAttribute(sd, 1));
  const rm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { t: RAINT, c: { value: new THREE.Vector3() }, fl: FLASH }, vertexShader: 'attribute float e; uniform float t; uniform vec3 c; varying float a; void main(){ vec3 p=position; float R=22.; vec3 w; w.x=c.x+(fract(p.x*.5+.5+ (-c.x)/(2.*R))*2.-1.)*R; w.z=c.z+(fract(p.z*.5+.5+(-c.z)/(2.*R))*2.-1.)*R; float sp=17.+fract(p.x*37.)*6.; w.y=fract(p.y-t*sp/26.)*26.-3.+c.y*.0; w.x+=(w.y)*.12; w.y+=e*.34; w.x+=e*.04; a=.16; if(w.x>-8.6&&w.x<46.6&&w.z>-.6&&w.z<22.6&&w.y<10.) a=0.; if(w.y<-.2) a=0.; gl_Position=projectionMatrix*viewMatrix*vec4(w,1.); }', fragmentShader: 'varying float a; uniform float fl; void main(){ if(a<.01) discard; gl_FragColor=vec4(vec3(.55,.62,.72)*(1.+fl*3.),a); }' });
  RAIN.mesh = new THREE.LineSegments(rg, rm); RAIN.mesh.frustumCulled = false; RAIN.mesh.renderOrder = 4; scene.add(RAIN.mesh);
}

// THE STORM: wind in bursts, lightning that lights the grounds and comes in at the windows, thunder after by its distance
const STORM = { next: 6, flash: 0, light: null, moon: null, mask: 0, seq: [] };
function buildStorm() { const L = new THREE.DirectionalLight(0xb9c8ff, 0); L.position.set(-30, 60, -45); L.castShadow = !LOW; L.shadow.mapSize.set(2048, 2048); const c = L.shadow.camera; c.left = -42; c.right = 42; c.top = 42; c.bottom = -42; c.near = 5; c.far = 160; L.shadow.bias = -.0012; L.shadow.normalBias = .06; L.shadow.autoUpdate = false; L.shadow.needsUpdate = true; L.target.position.set(19, 0, 5); scene.add(L, L.target); STORM.light = L;
  const hemi = new THREE.HemisphereLight(0x27344a, 0x0a0908, .22); scene.add(hemi); STORM.hemi = hemi; }
function stepStorm(dt, onThunder) { RAINT.value = CLOCK.t; RAIN.mesh.material.uniforms.c.value.copy(camera.getWorldPosition(new THREE.Vector3()));
  STORM.next -= dt; STORM.mask = Math.max(0, STORM.mask - dt);
  if (STORM.next <= 0) { STORM.next = rnd(9, 26); const far = rnd(.1, 1); STORM.seq = [[0, 1], [.07, .15], [.13, .8], [.2, .1], [.32, .5 * rnd()], [.5, 0]].map(([t, v]) => [CLOCK.t + t, v * (1.2 - far * .5)]); STORM.light.position.set(rnd(-60, 60), 70, rnd(-70, -20)); RAIN.sky.material.uniforms.fp.value.set(rnd(-.8, .8), rnd(-.8, .2)); STORM.light.shadow.needsUpdate = true; setTimeout(() => { STORM.mask = 3.2; onThunder(far); }, far * 2600); }
  let v = 0; while (STORM.seq.length && STORM.seq[0][0] <= CLOCK.t) v = STORM.seq.shift()[1], STORM.flash = v; if (!STORM.seq.length) STORM.flash = Math.max(0, STORM.flash - dt * 4);
  FLASH.value = STORM.flash; STORM.light.intensity = .16 + STORM.flash * 7; }

function buildHouse() { mats(); buildRooms(); buildShell(); buildOpenings(); buildCellar(); buildGrounds(); buildStorm(); }
export { H, ROOMS, OPEN, DOORS, WINDOWS, FIRES, M, STORM, RAINT, roomAt, roomName, buildHouse, hearth, toggleDoor, stepDoors, stepStorm, doorNear, glassMat, curtain, along, X0, X1, Z0, Z1 };
