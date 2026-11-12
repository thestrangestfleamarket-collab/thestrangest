// the asylum's map: rooms, walls, doors, lights and everything standing in them
import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { lit, glow, rnd, M, WALL, FLOOR, CEIL, sign } from './tex.js';

export const GW = 36, GH = 32, H = 3, DH = 2.2;
export const ROOMS = [
  ['morgue', 'm', 1, 1, 9, 7], ['cross', 'c', 11, 1, 27, 2], ['boiler', 'b', 29, 1, 34, 8], ['hall', 'c', 12, 3, 14, 22],
  ['cell9', 'p', 8, 9, 10, 11], ['cell8', 'p', 8, 13, 10, 15], ['cell7', 'p', 8, 17, 10, 19],
  ['treat', 't', 16, 5, 21, 10], ['closet', 's', 16, 12, 18, 13], ['day', 'd', 16, 15, 22, 21],
  ['lobby', 'l', 9, 24, 17, 29], ['office', 'o', 3, 24, 7, 28], ['records', 'r', 19, 24, 24, 28],
];
const DOORS = [[10, 2, 'morgue', 'steel'], [28, 2, 'boiler', 'steel'], [11, 10, 'cell9', 'cell'], [11, 14, 'cell8', 'cell'], [11, 18, 'cell7', 'cell'], [15, 8, 'treat', 'ward'],
  [15, 12, 'closet', 'wood'], [15, 18, 'day', 'ward'], [13, 23, 'ward', 'ward'], [8, 26, 'office', 'wood'], [18, 26, 'records', 'wood'], [13, 30, 'exit', 'exit']];
export const grid = Array.from({ length: GH }, () => Array(GW).fill('#'));
for (const [, t, x0, z0, x1, z1] of ROOMS) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) grid[z][x] = t;
for (const [x, z] of DOORS) grid[z][x] = 'D';
export const W = { doors: [], doorAt: {}, tubes: [], items: [], solids: [], blocked: new Set(), dyn: {} };
export const cell = (x, z) => (x < 0 || z < 0 || x >= GW || z >= GH) ? '#' : grid[z][x];
export function roomAt(x, z) {
  const cx = Math.floor(x), cz = Math.floor(z);
  for (const r of ROOMS) if (cx >= r[2] && cx <= r[4] && cz >= r[3] && cz <= r[5]) return r[0];
  const d = W.doorAt[cz * GW + cx]; return d ? 'door:' + d.id : null;
}
export function solidCell(cx, cz) { const c = cell(cx, cz); if (c === '#') return true; if (c === 'D') { const d = W.doorAt[cz * GW + cx]; return d.a < .6; } return false; }
export function los(x0, z0, x1, z1) {
  const dx = x1 - x0, dz = z1 - z0, n = Math.ceil(Math.hypot(dx, dz) / .2);
  for (let i = 1; i < n; i++) if (solidCell(Math.floor(x0 + dx * i / n), Math.floor(z0 + dz * i / n))) return false;
  return true;
}
export function collide(p, r) {
  for (let k = 0; k < 2; k++) {
    const cx = Math.floor(p.x), cz = Math.floor(p.z);
    for (let z = cz - 1; z <= cz + 1; z++) for (let x = cx - 1; x <= cx + 1; x++) if (solidCell(x, z)) push(p, r, x, z, x + 1, z + 1);
    for (const s of W.solids) if (!s.off) push(p, r, s[0], s[1], s[2], s[3]);
  }
}
function push(p, r, x0, z0, x1, z1) {
  const qx = Math.max(x0, Math.min(p.x, x1)), qz = Math.max(z0, Math.min(p.z, z1)); let dx = p.x - qx, dz = p.z - qz; const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return;
  if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x = qx + dx / d * r; p.z = qz + dz / d * r; return; }
  const l = p.x - x0, rr = x1 - p.x, u = p.z - z0, dn = z1 - p.z, m = Math.min(l, rr, u, dn);
  if (m === l) p.x = x0 - r; else if (m === rr) p.x = x1 + r; else if (m === u) p.z = z0 - r; else p.z = z1 + r;
}
export function tubeLit(tb, t) {
  if (tb.state === 'on') return true; if (tb.state !== 'flick') return false;
  return Math.sin(t * 9 + tb.ph) + Math.sin(t * 23.7 + tb.ph * 3) + Math.sin(t * 2.1 + tb.ph) > -.4;
}
export function litAt(x, z) { for (const tb of W.tubes) if (tb.lit && (tb.x - x) ** 2 + (tb.z - z) ** 2 < 9 && los(tb.x, tb.z, x, z)) return tb; return null; }

class Quads {
  constructor() { this.p = []; this.n = []; this.u = []; this.i = []; }
  quad(P, n, U) { const b = this.p.length / 3; for (let k = 0; k < 4; k++) { this.p.push(...P[k]); this.n.push(...n); this.u.push(...U[k]); } this.i.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  mesh(mat) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(this.u, 2)); g.setIndex(this.i); return new T.Mesh(g, mat); }
}
const sub = (p, x, z, ry = 0, y = 0) => { const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g); return g; };
const box = (p, w, h, d, m, x = 0, y = 0, z = 0, ry = 0) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.y = ry; p.add(o); return o; };
const cyl = (p, r, l, m, x = 0, y = 0, z = 0, ax = 'y', r2 = r, seg = 10) => { const o = new T.Mesh(new T.CylinderGeometry(r2, r, l, seg), m); o.position.set(x, y, z); if (ax === 'z') o.rotation.x = Math.PI / 2; if (ax === 'x') o.rotation.z = Math.PI / 2; p.add(o); return o; };
const sph = (p, r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new T.Mesh(new T.SphereGeometry(r, 12, 9), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); p.add(o); return o; };
const tor = (p, r, t, m, x, y, z, ry = Math.PI / 2) => { const o = new T.Mesh(new T.TorusGeometry(r, t, 6, 18), m); o.position.set(x, y, z); o.rotation.y = ry; p.add(o); return o; };
const FACE = { n: 0, s: Math.PI, w: Math.PI / 2, e: -Math.PI / 2 };
const wdec = (p, w, h, m, x, y, z, f, rz = 0) => { const o = new T.Mesh(new T.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(0, FACE[f], rz, 'YXZ'); p.add(o); return o; };
const fdec = (p, w, d, m, x, z, ry = 0, y = .012) => { const o = new T.Mesh(new T.PlaneGeometry(w, d), m); o.position.set(x, y, z); o.rotation.set(-Math.PI / 2, ry, 0, 'YXZ'); p.add(o); return o; };
function solid(x0, z0, x1, z1) { const s = [x0, z0, x1, z1]; W.solids.push(s); for (let z = Math.floor(z0); z <= Math.floor(z1); z++) for (let x = Math.floor(x0); x <= Math.floor(x1); x++) if (x + .5 > x0 - .2 && x + .5 < x1 + .2 && z + .5 > z0 - .2 && z + .5 < z1 + .2) W.blocked.add(z * GW + x); return s; }

function shell(scene) {
  const B = {}, q = k => B[k] || (B[k] = new Quads());
  const wq = (key, a, b, y0, y1, n, u0, u1) => q(key).quad([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], n, [[u0, y0 / H], [u1, y0 / H], [u1, y1 / H], [u0, y1 / H]]);
  for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
    const t = grid[z][x]; if (t === '#') continue; const h = t === 'D' ? DH : H;
    q('f' + t).quad([[x, 0, z + 1], [x + 1, 0, z + 1], [x + 1, 0, z], [x, 0, z]], [0, 1, 0], [[x / 2, -(z + 1) / 2], [(x + 1) / 2, -(z + 1) / 2], [(x + 1) / 2, -z / 2], [x / 2, -z / 2]]);
    q('ceil').quad([[x, h, z], [x + 1, h, z], [x + 1, h, z + 1], [x, h, z + 1]], [0, -1, 0], [[x / 2, z / 2], [(x + 1) / 2, z / 2], [(x + 1) / 2, (z + 1) / 2], [x / 2, (z + 1) / 2]]);
    const side = (nb, a, b, n, u0, u1) => { if (nb === '#') wq('w' + t, a, b, 0, h, n, u0, u1); else if (nb === 'D' && t !== 'D') wq('w' + t, a, b, DH, H, n, u0, u1); };
    side(cell(x, z - 1), [x, z], [x + 1, z], [0, 0, 1], x / 2, (x + 1) / 2);
    side(cell(x, z + 1), [x + 1, z + 1], [x, z + 1], [0, 0, -1], -(x + 1) / 2, -x / 2);
    side(cell(x - 1, z), [x, z + 1], [x, z], [1, 0, 0], -(z + 1) / 2, -z / 2);
    side(cell(x + 1, z), [x + 1, z], [x + 1, z + 1], [-1, 0, 0], z / 2, (z + 1) / 2);
  }
  for (const k in B) { const m = B[k].mesh(k === 'ceil' ? CEIL : k[0] === 'f' ? FLOOR[k[1]] : WALL[k[1]]); m.receiveShadow = true; m.castShadow = k[0] === 'w'; scene.add(m); }
}

function doors(scene) {
  for (const [x, z, id, kind] of DOORS) {
    const alongX = cell(x - 1, z) !== '#' && cell(x + 1, z) !== '#', pv = new T.Group();
    pv.position.set(alongX ? x + .5 : x + .02, 0, alongX ? z + .02 : z + .5); const base = alongX ? -Math.PI / 2 : 0; pv.rotation.y = base; scene.add(pv);
    const h = DH - .04, mat = { wood: M.doorWood, ward: M.doorWard, steel: M.doorSteel, exit: M.doorExit }[kind];
    if (kind === 'cell') { box(pv, .96, 1.4, .07, M.doorSteel, .48, .7, 0); box(pv, .96, h - 1.72, .07, M.steelDark, .48, 1.72 + (h - 1.72) / 2, 0); box(pv, .28, .32, .07, M.steelDark, .14, 1.56, 0); box(pv, .28, .32, .07, M.steelDark, .82, 1.56, 0); box(pv, .44, .03, .1, M.steel, .48, 1.39, 0); }
    else box(pv, .96, h, .06, mat, .48, h / 2, 0);
    for (const s of [-1, 1]) sph(pv, .035, M.brass, .86, 1.02, s * .06, 1, 1, 1);
    pv.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const fr = M.woodDark; for (const s of [0, 1]) { const g = sub(scene, alongX ? x + .5 : x + s, alongX ? z + s : z + .5, alongX ? Math.PI / 2 : 0); box(g, .05, DH, .16, fr, s ? -.025 : .025, DH / 2, 0); }
    const d = { id, kind, x, z, alongX, pv, base, a: 0, t: 0, locked: false, shake: 0, px: x + .5, pz: z + .5 };
    W.doors.push(d); W.doorAt[z * GW + x] = d;
  }
}
export const door = id => W.doors.find(d => d.id === id);

function tube(scene, x, z, state, along = 'z', y = H - .06) {
  const g = sub(scene, x, z, along === 'x' ? Math.PI / 2 : 0, y); box(g, .3, .05, 1.3, M.steelDark, 0, 0, 0);
  const mat = glow(0x141a1c), m = box(g, .07, .05, 1.15, mat, 0, -.04, 0);
  const tb = { x, z, y: y - .3, state, lit: false, ph: rnd() * 40, mat, m, I: 6.5, col: 0xbcd8e8 }; W.tubes.push(tb); return tb;
}

function bed(S, x, z, ry) {
  const g = sub(S, x, z, ry); box(g, .85, .06, 1.9, M.steelDark, 0, .42, 0); box(g, .8, .14, 1.84, M.mattress, 0, .52, 0); box(g, .5, .1, .32, M.sheet, 0, .63, -.7);
  for (const sx of [-.4, .4]) for (const sz of [-.92, .92]) cyl(g, .02, sz < 0 ? 1.0 : .6, M.steelDark, sx, sz < 0 ? .5 : .3, sz);
  box(g, .82, .03, .03, M.steelDark, 0, 1.0, -.92); for (let i = -3; i <= 3; i++) cyl(g, .01, .5, M.steelDark, i * .11, .75, -.92);
  for (const sz of [-.25, .45]) box(g, .88, .02, .09, M.strap, 0, .6, sz); return g;
}
function gurney(p, x, z, ry, body) {
  const g = sub(p, x, z, ry); box(g, .62, .05, 1.9, M.steel, 0, .82, 0); box(g, .64, .04, 1.92, M.sheet, 0, .86, 0); box(g, .56, .02, 1.7, M.steel, 0, .3, 0);
  for (const sx of [-.27, .27]) for (const sz of [-.85, .85]) { cyl(g, .015, .78, M.steel, sx, .43, sz); cyl(g, .05, .03, M.rubber, sx, .05, sz, 'x'); }
  if (body) { sph(g, .3, M.sheet, 0, .93, .25, .85, .42, 2.1); sph(g, .12, M.sheet, 0, .98, -.72); sph(g, .1, M.sheet, 0, .97, .82, 1.4, .8, 1); }
  return g;
}
function wheelchair(p, x, z, ry) {
  const g = sub(p, x, z, ry), mt = M.steelDark, lea = M.leather; box(g, .46, .05, .44, lea, 0, .5, 0); box(g, .46, .5, .04, lea, 0, .78, -.22);
  const wh = [];
  for (const s of [-1, 1]) { const w = sub(g, s * .27, -.05, 0, .3); wh.push(w); tor(w, .28, .02, mt, 0, 0, 0); box(w, .02, .02, .56, mt, 0, 0, 0); box(w, .02, .56, .02, mt, 0, 0, 0);
    box(g, .03, .25, .03, mt, s * .23, .64, .1); box(g, .03, .03, .3, mt, s * .23, .76, 0); box(g, .03, .4, .03, mt, s * .2, .28, .25); box(g, .1, .02, .14, mt, s * .14, .09, .32); box(g, .03, .5, .03, mt, s * .23, 1.02, -.24); cyl(g, .06, .03, M.rubber, s * .2, .06, .26, 'x'); }
  g.userData.wheels = wh; return g;
}
function desk(S, x, z, ry) {
  const g = sub(S, x, z, ry); box(g, 1.5, .05, .75, M.wood, 0, .75, 0); for (const s of [-1, 1]) { box(g, .4, .7, .7, M.wood, s * .52, .36, 0); for (const y of [.18, .4, .6]) box(g, .34, .16, .02, M.woodDark, s * .52, y, .355); }
  box(g, .3, .02, .22, M.paper, -.2, .785, .05, .2); cyl(g, .07, .02, M.black, .55, .785, -.2); cyl(g, .012, .32, M.black, .55, .94, -.2); cyl(g, .11, .12, M.green, .55, 1.12, -.2, 'y', .05);
  box(g, .2, .07, .16, M.black, -.55, .81, -.15); box(g, .22, .04, .05, M.black, -.55, .87, -.15); return g;
}
function chair(p, x, z, ry, tip) {
  const g = sub(p, x, z, ry); const c = sub(g, 0, 0); box(c, .42, .04, .42, M.woodLight, 0, .45, 0); box(c, .42, .45, .04, M.woodLight, 0, .72, -.2); for (const sx of [-.18, .18]) for (const sz of [-.18, .18]) box(c, .04, .45, .04, M.woodLight, sx, .22, sz);
  if (tip) { c.rotation.x = -Math.PI / 2; c.position.y = .2; } return g;
}
function cabinet(S, x, z, ry, open) { const g = sub(S, x, z, ry); box(g, .48, 1.36, .6, M.steelDark, 0, .68, 0); wdec(g, .46, 1.34, M.cabinet, 0, .68, .305, 'n'); if (open) { box(g, .44, .28, .4, M.steelDark, 0, .52, .45); box(g, .4, .2, .34, M.paper, 0, .58, .45); } }
function locker(S, x, z, ry, ajar) { const g = sub(S, x, z, ry); box(g, .42, 1.9, .5, M.steelDark, 0, .95, 0); const d = sub(g, -.21, .255); wdec(d, .42, 1.88, M.locker, .21, .95, 0, 'n'); if (ajar) { d.rotation.y = -.7; box(g, .36, 1.8, .02, M.black, 0, .95, .24); } }
function bench(S, x, z, ry) { const g = sub(S, x, z, ry); box(g, 1.7, .05, .08, M.steelDark, 0, .32, 0); for (const s of [-.75, .75]) box(g, .05, .32, .4, M.steelDark, s, .16, 0); for (const s of [-.57, 0, .57]) { box(g, .46, .04, .42, M.plastic, s, .42, 0); box(g, .46, .4, .04, M.plastic, s, .66, -.2); } }
function sink(S, x, z, ry) { const g = sub(S, x, z, ry); box(g, .5, .16, .4, M.porcelain, 0, .82, .2); box(g, .4, .02, .3, M.steelDark, 0, .905, .2); cyl(g, .015, .16, M.chrome, 0, .98, .06); cyl(g, .03, .8, M.steelDark, 0, .4, .1); wdec(g, .4, .6, M.mirror, 0, 1.55, .02, 'n'); wdec(g, .5, .7, M.blood, 0, .5, .015, 'n'); }
function toilet(S, x, z, ry) { const g = sub(S, x, z, ry); cyl(g, .19, .4, M.steel, 0, .2, .22, 'y', .15); cyl(g, .16, .02, M.black, 0, .405, .22); box(g, .36, .5, .14, M.steel, 0, .5, .02); }
function ivstand(S, x, z) { const g = sub(S, x, z); cyl(g, .012, 1.8, M.chrome, 0, .9, 0); for (const a of [0, 1.57]) box(g, .5, .02, .03, M.steelDark, 0, .02, 0, a); box(g, .26, .02, .02, M.chrome, 0, 1.78, 0); box(g, .1, .18, .03, M.glass, .1, 1.62, 0); }
function trolley(S, x, z, ry) { const g = sub(S, x, z, ry); for (const y of [.3, .86]) box(g, .6, .03, .42, M.steel, 0, y, 0); for (const sx of [-.28, .28]) for (const sz of [-.19, .19]) cyl(g, .012, .88, M.steel, sx, .44, sz); for (let i = 0; i < 6; i++) box(g, .02 + rnd() * .02, .01, .12 + rnd() * .08, M.chrome, -.2 + i * .07, .88, rnd() * .1 - .05, rnd() * .6); cyl(g, .06, .05, M.enamel, .2, .9, .08); return g; }
function plant(S, x, z) { const g = sub(S, x, z); cyl(g, .16, .34, M.pot, 0, .17, 0, 'y', .22); for (let i = 0; i < 7; i++) { const s = cyl(g, .008, .6 + rnd() * .5, M.plant, rnd() * .1 - .05, .6, rnd() * .1 - .05); s.rotation.set(rnd() * .7 - .35, 0, rnd() * .7 - .35); } }
function shelf(S, x, z, ry, w = 1.6) { const g = sub(S, x, z, ry); for (const s of [-1, 1]) box(g, .04, 1.9, .4, M.steelDark, s * w / 2, .95, 0); for (const y of [.1, .55, 1.0, 1.45, 1.88]) box(g, w, .03, .4, M.steelDark, 0, y, 0);
  for (const y of [.12, .57, 1.02, 1.47]) for (let i = 0, n = 2 + rnd() * 3 | 0; i < n; i++) { const bw = .2 + rnd() * .2; box(g, bw, .12 + rnd() * .2, .3, rnd() < .5 ? M.cloth : M.paper, -w / 2 + .2 + i * (w - .4) / n, y + .12, 0); } return g; }
function pipes(S, x0, x1, z, y, r, m) { cyl(S, r, x1 - x0, m, (x0 + x1) / 2, y, z, 'x'); for (let x = x0 + 1; x < x1; x += 2.5) cyl(S, r + .025, .07, M.steelDark, x, y, z, 'x'); }

function props(scene) {
  const S = new T.Group(), D = W.dyn, item = (id, kind, x, y, z, mesh) => { const o = { id, kind, x, y, z, mesh, got: false }; W.items.push(o); return o; };
  const batt = (id, x, y, z) => { const g = sub(scene, x, z, rnd() * 3, y); cyl(g, .028, .11, M.yellow, 0, 0, 0, 'x'); cyl(g, .029, .03, M.black, .04, 0, 0, 'x'); cyl(g, .012, .012, M.chrome, -.06, 0, 0, 'x'); item(id, 'batt', x, y, z, g); };
  const fuse = (id, x, y, z, up) => { const g = sub(scene, x, z, .5, y); cyl(g, .03, .13, M.ceramic, 0, 0, 0, up ? 'y' : 'x'); for (const s of [-.065, .065]) cyl(g, .033, .03, M.brass, up ? 0 : s, up ? s : 0, 0, up ? 'y' : 'x'); return item(id, 'fuse', x, y, z, g); };
  const note = (id, x, y, z, f) => { const m = f ? wdec(scene, .22, .3, M.paper, x, y, z, f) : fdec(scene, .22, .3, M.paper, x, z, rnd() * 1.5, y); item(id, 'note', x, y, z, m); };
  const keyM = (id, x, y, z) => { const g = sub(scene, x, z, .8, y); tor(g, .028, .007, M.brass, 0, 0, 0, 0).rotation.x = Math.PI / 2; box(g, .08, .008, .012, M.brass, .065, 0, 0); box(g, .012, .008, .03, M.brass, .1, 0, .015); item(id, id, x, y, z, g); };

  wdec(S, 1.4, 1.3, M.win, 11.2, 1.75, 29.98, 's'); wdec(S, 1.4, 1.3, M.win, 15.8, 1.75, 29.98, 's');
  box(S, 2.6, 1.1, .5, M.wood, 10.9, .55, 25.6); box(S, 2.7, .05, .6, M.woodDark, 10.9, 1.12, 25.6); box(S, .5, 1.1, 1.2, M.wood, 9.85, .55, 24.75); solid(9.6, 24.2, 12.2, 25.9);
  wdec(S, 1.6, .4, sign('HOLLOW PINES\nSTATE HOSPITAL'), 10.9, 2.2, 24.02, 'n'); wdec(S, .8, .26, sign('WARD C', '#3b5a44', '#c8c2a8'), 13.5, 2.62, 24.02, 'n'); wdec(S, .5, .16, sign('RECEPTION'), 10.9, .8, 25.86, 'n');
  wdec(S, .4, .4, M.clock, 15.6, 2.3, 24.02, 'n'); wdec(S, 1.2, .9, M.board, 9.02, 1.6, 27.6, 'w');
  bench(S, 17.6, 28.3, -Math.PI / 2); solid(17.3, 27.4, 18, 29.2); bench(S, 10.2, 29.55, Math.PI); solid(9.3, 29.25, 11.1, 30); plant(S, 17.5, 24.5); plant(S, 9.4, 28.9);
  box(S, .3, .5, .12, M.black, 17.93, 1.45, 24.9); box(S, .08, .22, .06, M.steelDark, 17.82, 1.45, 24.8);
  for (let i = 0; i < 7; i++) fdec(S, .5, .5, M.papers, 10 + rnd() * 7, 26.3 + rnd() * 3, rnd() * 6, .012 + i * .001);
  fdec(S, 1.2, 1.2, M.blood, 13.6, 24.9, 1, .014);
  const ex = glow(0x1a0806); D.exitSign = ex; box(S, .6, .2, .06, M.black, 13.5, 2.5, 29.95); wdec(scene, .5, .14, ex, 13.5, 2.5, 29.91, 's'); wdec(S, .5, .14, sign('EXIT', '#0c0c0a', '#b02a20'), 13.5, 2.5, 29.915, 's').material.transparent = false;
  note('log', 11.4, 1.152, 25.6); batt('b0', 10.3, 1.18, 25.55);

  desk(S, 5.5, 25, 0); solid(4.7, 24.6, 6.3, 25.4); chair(S, 5.5, 24.45, 0); chair(S, 5.2, 26.2, Math.PI + .3);
  for (const z of [26.3, 26.85, 27.4]) cabinet(S, 3.3, z, Math.PI / 2, z === 26.85); solid(3, 26, 3.65, 27.7); shelf(S, 5.4, 28.75, Math.PI, 2); solid(4.3, 28.5, 6.5, 29);
  box(S, .5, .7, .08, M.woodDark, 7, 1.6, 24.05); for (let i = 0; i < 5; i++) cyl(S, .004, .05, M.brass, 6.82 + i * .09, 1.7, 24.1); wdec(S, .4, .1, sign('KEYS'), 7, 2.02, 24.03, 'n');
  cyl(S, .02, 1.7, M.woodDark, 7.6, .85, 28.6); box(S, .34, .7, .1, M.coat, 7.6, 1.3, 28.55); wdec(S, .6, .8, M.board, 3.02, 1.7, 25, 'w');
  keyM('key', 5.15, .79, 25.1); note('memo', 5.85, .782, 25.12);

  for (let x = 19.4; x < 24.8; x += .52) cabinet(S, x, 24.34, 0, Math.abs(x - 21.48) < .1); solid(19, 24, 25, 24.7);
  shelf(S, 23, 27.6, 0, 2.6); solid(21.6, 27.35, 24.4, 27.85); box(S, .9, .04, .6, M.wood, 21, .74, 26.2); for (const sx of [-.4, .4]) for (const sz of [-.25, .25]) box(S, .05, .74, .05, M.wood, 21 + sx, .37, 26.2 + sz); solid(20.5, 25.85, 21.5, 26.55);
  for (let i = 0; i < 6; i++) box(S, .4, .3, .34, M.plastic, 24.5 - (i % 2) * .1, .15 + (i / 3 | 0) * .3, 28.2 + (i % 3) * .28, rnd() * .3); solid(24.2, 28, 25, 29);
  for (let i = 0; i < 9; i++) fdec(S, .5, .5, M.papers, 19.5 + rnd() * 5, 25 + rnd() * 3.5, rnd() * 6, .012 + i * .001);
  note('file', 20.9, .765, 26.2); batt('b1', 21.25, .79, 26.3);

  const gh = gurney(S, 14.55, 14.6, 0, false); solid(14.2, 13.6, 15, 15.6); gh.rotation.y = .04;
  trolley(S, 12.35, 6.4, Math.PI / 2); solid(12.1, 6.05, 12.6, 6.75);
  for (const [z, n] of [[11.35, '9'], [15.35, '8'], [19.35, '7']]) wdec(S, .22, .16, sign(n), 12.02, 1.7, z, 'w');
  wdec(S, .6, .16, sign('TREATMENT'), 14.98, 1.75, 7.6, 'e'); wdec(S, .5, .16, sign('LINEN'), 14.98, 1.75, 11.65, 'e'); wdec(S, .6, .16, sign('DAY ROOM'), 14.98, 1.75, 17.6, 'e');
  wdec(S, 1.7, .3, sign('<  MORTUARY          BOILER  >', '#3b5a44', '#c8c2a8', 512, 64), 13.5, 2.45, 1.02, 'n'); wdec(S, .8, .22, sign('QUIET PLEASE'), 12.02, 2.1, 21, 'w');
  fdec(S, .6, 3.2, M.trail, 13.3, 12.6, .12); fdec(S, .6, 2.2, M.trail, 12.4, 10.8, Math.PI / 2 + .2, .014); fdec(S, .6, 4, M.trail, 12.6, 4.2, .5, .013);
  wdec(S, .3, .44, M.hand, 12.02, 1.25, 12.6, 'w', .3); wdec(S, .3, .44, M.hand, 14.98, 1.4, 16.2, 'e', -.4); wdec(S, .3, .44, M.hand, 12.02, 1.05, 9.3, 'w', -.2);
  box(S, .6, .03, .6, M.enamelDirty, 13.9, .02, 20.2, .5); box(S, .5, .03, .3, M.enamelDirty, 14.2, .05, 19.7, 1.2); fdec(S, 1.2, 1.2, M.blood, 13.2, 16.5, 2);
  for (let i = 0; i < 8; i++) fdec(S, .5, .5, M.papers, 12.3 + rnd() * 2.4, 4 + rnd() * 18, rnd() * 6, .012 + i * .001);
  D.wheelchair = wheelchair(scene, 14.45, 20.6, Math.PI + .2);
  pipes(S, 11, 28, 1.25, 2.72, .07, M.rust); pipes(S, 11, 28, 1.45, 2.8, .04, M.steelDark);
  for (let i = 0; i < 4; i++) chair(S, 20, 1.45, .1 * i).position.y = i * .12; cyl(S, .17, .3, M.yellow, 25.6, .15, 2.78, 'y', .2); cyl(S, .015, 1.3, M.woodLight, 25.7, .7, 2.8).rotation.z = .25;
  wdec(S, .7, .3, sign('BOILER ROOM\nSTAFF ONLY', '#b09018', '#111'), 27.98, 1.8, 1.5, 'e'); wdec(S, .5, .2, sign('MORTUARY'), 11.02, 1.8, 1.5, 'w');
  fdec(S, 1.4, 1.4, M.blood, 23, 2.1, 1); wdec(S, .3, .44, M.hand, 20.5, 1.2, 2.98, 's', .1);

  for (const [id, z0] of [['cell9', 9], ['cell8', 13], ['cell7', 17]]) { bed(S, 8.5, z0 + 1.5, 0); solid(8.05, z0 + .55, 8.95, z0 + 2.45); toilet(S, 10.55, z0 + .12, 0); fdec(S, 1, 1, M.blood, 9.6, z0 + 1.8, rnd() * 6); }
  wdec(S, 1.6, .8, M.tally, 9.5, 1.5, 19.98, 's'); item('tally', 'note', 9.5, 1.5, 19.9, null);
  wdec(S, 1.8, .9, M.scrawl("DON'T LOOK\nAWAY"), 9.5, 1.7, 9.02, 'n'); wdec(S, 1.2, .6, M.tally, 9.4, 1.2, 11.98, 's');
  cyl(S, .005, .5, M.black, 9.5, H - .25, 10.5); D.bulb9 = { x: 9.5, z: 10.5, y: H - .6, state: 'flick', lit: false, ph: 3, mat: glow(0x221a0c), I: 3, col: 0xffb060 }; sph(scene, .045, D.bulb9.mat, 9.5, H - .55, 10.5); W.tubes.push(D.bulb9);
  D.fuse1 = fuse('f1', 8.5, .64, 10.9);

  const tb = sub(S, 19, 8, Math.PI / 2); box(tb, .7, .1, 1.95, M.leather, 0, .85, 0); box(tb, .5, .75, 1.2, M.steelDark, 0, .4, 0); for (const sz of [-.6, 0, .6]) box(tb, .76, .02, .08, M.strap, 0, .91, sz); solid(18, 7.6, 20, 8.4);
  D.ectBody = sub(scene, 19, 8, Math.PI / 2, .9); sph(D.ectBody, .3, M.sheet, 0, .06, .1, .8, .38, 2.3); sph(D.ectBody, .12, M.sheet, 0, .1, -.78);
  cyl(S, .02, .7, M.steelDark, 19, H - .35, 8); cyl(S, .42, .12, M.enamel, 19, H - .75, 8, 'y', .3); D.lampM = glow(0x1c1c18); cyl(scene, .28, .02, D.lampM, 19, H - .82, 8);
  const et = trolley(S, 19, 6.55, 0); box(et, .46, .3, .32, M.steelDark, 0, 1.03, 0); wdec(et, .44, .22, M.dials, 0, 1.03, .162, 'n'); cyl(et, .012, .5, M.black, .15, .9, .25, 'z'); solid(18.65, 6.3, 19.35, 6.8);
  D.fuse2 = fuse('f2', 19.14, 1.24, 6.55, true);
  trolley(S, 20.6, 8.7, .3); sink(S, 21.75, 6.6, -Math.PI / 2); ivstand(S, 18.2, 7.2); locker(S, 16.4, 5.28, 0, true); locker(S, 16.85, 5.28, 0); solid(16.1, 5, 17.1, 5.55);
  box(S, 1.2, .9, .34, M.steelDark, 20.6, 1.5, 5.2); wdec(S, 1.1, .8, M.glass, 20.6, 1.5, 5.38, 'n'); solid(20, 5, 21.2, 5.42); for (let i = 0; i < 6; i++) cyl(S, .03, .12, M.enamel, 20.2 + i * .15, 1.3, 5.2);
  box(S, .34, .9, .1, M.coat, 17.9, 1.35, 10.92); box(S, .04, .04, .06, M.steelDark, 17.9, 1.84, 10.96); fdec(S, .5, .5, M.grate, 19.6, 9.2); fdec(S, 1.3, 1.3, M.blood, 19.3, 8.9, 2);
  wdec(S, .3, .44, M.hand, 16.02, 1.3, 9.4, 'w', .2);
  keyM('mkey', 17.9, 1.2, 10.82); note('finch', 20.62, .9, 8.72);

  shelf(S, 17.5, 12.25, 0, 2.6); shelf(S, 18.75, 13.3, -Math.PI / 2, 1.2); cyl(S, .16, .28, M.steel, 16.5, .14, 13.5, 'y', .19); cyl(S, .015, 1.4, M.woodLight, 16.45, .75, 13.6).rotation.z = -.2;
  batt('b2', 17.3, 1.06, 12.42);
  const co = D.corpse = sub(scene, 16.25, 12.5, 0); sph(co, .2, M.sheet, 0, .85, 0, .95, 3.4, .8); sph(co, .12, M.sheet, 0, 1.62, .02, 1, 1.15, 1); for (const y of [.35, .8, 1.25]) box(co, .42, .04, .36, M.strap, 0, y, 0); wdec(co, .3, .3, M.blood, -.2, 1.6, 0, 'e'); co.traverse(c => { if (c.isMesh) c.castShadow = true; });

  const tv = sub(S, 22.55, 18.5, -Math.PI / 2); box(tv, .7, .7, .5, M.woodDark, 0, .35, 0); box(tv, .66, .5, .5, M.tvBody, 0, .97, 0); for (const s of [-.3, .3]) { const a = cyl(tv, .006, .5, M.chrome, s * .5, 1.45, 0); a.rotation.z = -s; }
  D.tv = wdec(scene, .5, .38, M.screenOff, 22.29, .98, 18.5, 'e'); solid(22.2, 18.1, 23, 18.9);
  const rk = D.rocker = sub(scene, 20.6, 18.5, -Math.PI / 2 + .15); box(rk, .5, .04, .48, M.wood, 0, .42, 0); box(rk, .5, .7, .04, M.wood, 0, .8, -.24).rotation.x = -.15; for (const s of [-.24, .24]) { box(rk, .04, .04, .8, M.wood, s, .03, 0); box(rk, .04, .4, .04, M.wood, s, .22, .18); box(rk, .04, .4, .04, M.wood, s, .22, -.18); box(rk, .04, .04, .5, M.wood, s, .62, 0); }
  cyl(S, .6, .04, M.wood, 18.5, .74, 20.4, 'y', .6, 16); cyl(S, .06, .74, M.woodDark, 18.5, .37, 20.4); solid(18, 19.9, 19, 20.9); chair(S, 18.5, 19.6, 0); chair(S, 19.35, 20.5, -Math.PI / 2 - .3); chair(S, 17.5, 21, 1, true);
  for (let i = 0; i < 9; i++) box(S, .06, .002, .09, M.paper, 18.2 + rnd() * .6, .765, 20.1 + rnd() * .6, rnd() * 3);
  shelf(S, 18, 15.25, 0, 2.2); solid(16.8, 15, 19.2, 15.5); for (let i = 0; i < 7; i++) wdec(S, .26, .32, M.drawing(i), 16.6 + i * .85, 1.2 + (i % 2) * .5, 21.98, 's', rnd() * .2 - .1);
  for (let i = 0; i < 5; i++) box(S, .08, .08, .08, [M.red, M.yellow, M.green][i % 3], 21 + rnd() * 1.2, .04, 20.4 + rnd() * 1.2, rnd() * 2); plant(S, 22.5, 15.5); wdec(S, .4, .4, M.clock, 16.02, 2.2, 16.5, 'w');
  fdec(S, 1.6, 1.6, M.blood, 20.7, 18.6, 1);
  batt('b3', 18.75, .79, 20.25);

  for (let c = 0; c < 5; c++) for (let r = 0; r < 2; r++) { if (c === 3 && r === 0) continue; box(S, .06, .68, .78, M.steelDark, 1.03, .5 + r * .8, 2 + c * .9); wdec(S, .74, .64, M.drawer, 1.065, .5 + r * .8, 2 + c * .9, 'w'); }
  box(S, .2, 1.75, 4.7, M.steel, 1.0, .875, 3.8).visible = false;
  const dr = D.drawer = sub(scene, 1.02, 4.7, 0, .16); box(dr, 1.9, .04, .7, M.steel, -.95, 0, 0); box(dr, .06, .68, .78, M.steelDark, .01, .34, 0); wdec(dr, .74, .64, M.drawer, .045, .34, 0, 'w'); sph(dr, .28, M.bag, -1, .18, 0, 3, .55, 1); sph(dr, .13, M.bag, -1.7, .2, 0);
  box(dr, .04, .06, .02, M.paper, -.2, .26, .12); dr.userData.x0 = 1.02; solid(1, 1.5, 1.12, 6.2);
  D.fuse3 = fuse('f3', 2.15, .56, 4.7); D.fuse3.mesh.visible = false;
  const at = sub(S, 5.5, 4.5, Math.PI / 2); box(at, .8, .06, 2, M.steel, 0, .86, 0); box(at, .84, .03, 2.04, M.steelDark, 0, .9, 0); cyl(at, .12, .84, M.steel, 0, .42, 0); box(at, .5, .04, .5, M.steel, 0, .02, 0); solid(4.5, 4.1, 6.5, 4.9); fdec(S, .5, .5, M.grate, 5.5, 5.5); fdec(S, 1.8, 1.8, M.blood, 5.4, 5.3, .4);
  cyl(S, .3, .02, M.steelDark, 5.5, H - .5, 4.5); cyl(S, .02, .5, M.steelDark, 5.5, H - .25, 4.5);
  const gb = gurney(S, 7.6, 6.7, Math.PI / 2, false); solid(6.6, 6.35, 8.6, 7.05);
  const bd = D.body = sub(scene, 7.75, 6.7, Math.PI / 2, .88); sph(scene, .26, M.sheet, 7.2, .96, 6.7, 2.2, .45, 1); const up = sub(bd, 0, 0); sph(up, .27, M.sheet, 0, .06, -.42, 1, .5, 1.7); sph(up, .13, M.sheet, 0, .1, -.92); D.body.userData.up = up;
  sink(S, 3.5, 1.02, 0); sink(S, 4.6, 1.02, 0); trolley(S, 3.2, 6.9, 1.4); box(S, .3, .34, .3, M.steel, 8.9, 1.8, 7.7); cyl(S, .16, .05, M.steel, 8.9, 1.55, 7.7); wdec(S, .5, .16, sign('COLD ROOM'), 9.98, 2.0, 4.5, 'e');
  ivstand(S, 8.9, 5.2); fdec(S, .6, 3.4, M.trail, 8.3, 3, Math.PI / 2 - .25);
  batt('b4', 5.2, .945, 4.75); note('tags', 9.97, 1.45, 3.7, 'e');

  const bt = sub(S, 33.3, 5, 0); cyl(bt, 1, 3.4, M.rust, 0, 1.25, 0, 'z', 1, 18); for (const z of [-1.4, -.5, .5, 1.4]) cyl(bt, 1.03, .08, M.steelDark, 0, 1.25, z, 'z', 1.03, 18); box(bt, 1.6, .3, 3, M.brick, 0, .15, 0); solid(32.3, 3.2, 34.4, 6.8);
  box(S, .7, .6, .1, M.steelDark, 33.3, .95, 6.76); D.fire = glow(0xff7a20); box(scene, .5, .22, .06, D.fire, 33.3, .9, 6.8); cyl(S, .14, 2.6, M.rust, 33.3, 2.4, 3.6); cyl(S, .16, .06, M.rust, 33.3, 1.5, 6.8, 'z'); wdec(S, .3, .3, M.clock, 33.3, 1.9, 6.72, 'n');
  cyl(S, .5, 2.4, M.steelDark, 30, 1.2, 7.9, 'y', .5, 14); for (const y of [.5, 1.9]) cyl(S, .52, .06, M.rust, 30, y, 7.9, 'y', .52, 14); solid(29.5, 7.4, 30.5, 8.4);
  pipes(S, 29, 35, 1.3, 2.6, .08, M.rust); pipes(S, 29, 35, 8.6, 2.3, .06, M.rust); cyl(S, .06, 3, M.rust, 34.6, 1.5, 1.4); tor(S, .12, .02, M.red, 34.45, 1.3, 1.4);
  box(S, 1.6, .06, .6, M.wood, 30.4, .85, 1.4); for (const s of [-.7, .7]) box(S, .06, .85, .5, M.wood, 30.4 + s, .42, 1.4); solid(29.6, 1.1, 31.2, 1.7); box(S, .3, .12, .2, M.red, 30.1, .94, 1.4); box(S, .3, .03, .05, M.steel, 30.7, .9, 1.35, .5);
  for (let i = 0; i < 14; i++) sph(S, .08 + rnd() * .1, M.black, 34.2 + rnd() * .6, .06, 7.6 + rnd() * 1.1);
  const fb = sub(S, 31.5, 8.98, Math.PI); box(fb, .7, .9, .12, M.steelDark, 0, 1.45, .06); wdec(fb, .5, .12, sign('MAINS  3 x 30A', '#b09018', '#111'), 0, 1.98, .125, 'n'); for (const s of [-.2, 0, .2]) box(fb, .1, .22, .02, M.black, s, 1.55, .125);
  D.slots = [-.2, 0, .2].map(s => { const g = sub(scene, 31.5 - s, 8.84, 0, 1.55); cyl(g, .03, .13, M.ceramic, 0, 0, 0); for (const y of [-.065, .065]) cyl(g, .033, .03, M.brass, 0, y, 0); g.visible = false; return g; });
  const lv = D.lever = sub(scene, 30.95, 8.85, 0, 1.3); box(lv, .04, .34, .04, M.red, 0, .17, 0); sph(lv, .04, M.black, 0, .36, 0); box(S, .12, .2, .06, M.steelDark, 30.95, 1.3, 8.94); lv.rotation.x = -.9;
  wdec(S, 1.2, .6, M.scrawl('HE WALKS\nIN THE DARK'), 29.02, 1.6, 5.5, 'w');

  const mats = new Map(); scene.add(S); S.updateMatrixWorld(true);
  S.traverse(o => { if (!o.isMesh || !o.visible) return; const g = o.geometry.clone().applyMatrix4(o.matrixWorld); for (const k in g.attributes) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); (mats.get(o.material) || mats.set(o.material, []).get(o.material)).push(g); });
  scene.remove(S);
  for (const [m, gs] of mats) { const mesh = new T.Mesh(mergeGeometries(gs, false), m); mesh.castShadow = !m.transparent && !m.isMeshBasicMaterial; mesh.receiveShadow = !m.isMeshBasicMaterial; scene.add(mesh); }
  for (const o of [D.wheelchair, D.rocker, D.drawer, D.body, D.ectBody]) o.traverse(c => { if (c.isMesh) c.castShadow = true; });
}

export function build(scene) {
  shell(scene); doors(scene);
  for (const [z, s] of [[5.5, 'flick'], [9.5, 'on'], [13.5, 'dead'], [17.5, 'on'], [21.5, 'flick']]) tube(scene, 13.5, z, s);
  tube(scene, 16.5, 2, 'dead', 'x'); tube(scene, 23.5, 2, 'flick', 'x'); tube(scene, 11.5, 27, 'on'); tube(scene, 15.5, 27, 'flick'); tube(scene, 5.5, 26.6, 'on', 'x'); tube(scene, 22, 26.4, 'dead', 'x');
  tube(scene, 17.2, 9.6, 'on', 'x'); tube(scene, 3.6, 5.6, 'flick', 'x'); tube(scene, 7.6, 2.4, 'dead', 'x'); tube(scene, 19.5, 16.6, 'dead', 'x'); tube(scene, 31, 4.5, 'dead');
  props(scene);
  W.tubes.forEach((t, i) => { t.i = i; });
}
