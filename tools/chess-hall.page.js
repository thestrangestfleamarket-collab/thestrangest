// SKIRMISH TABLE's hall, the part of the dungeon bake that builds Kilnhold's walls (tools/chess-dungeon.page.js): the east curtain with its gatehouse, buttresses, lancets and battlements, a round tower at each east corner, the end walls fallen to a dwarf wall before each seat, the west wall breached over the gorge.
// Every face is flat stone on one picture that wraps along (two bands: coursed wall stone, dressed ashlar) and has its own patch of a second picture, the light: sun, sky, shade, the lava's glow and the weather's stains, worked out a point at a time.
import * as THREE from 'three';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const SW = 1024, SH = 2048, LW = 2048, LH = 1024, GUT = 8;
export const BANDS = { stone: { y: 8, h: 1008, rep: 2 }, ashlar: { y: 1032, h: 1008, rep: 2 } }, CORE = [0.74, 0.73, 0.72];   // a broken face is the wall's own stone, darker
const DARK = [0.07, 0.065, 0.06];

const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), l = (a, b, t) => a + (b - a) * t; return l(l(hash(xi, yi), hash(xi + 1, yi), u), l(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); };
const fbm = (x, y) => 0.5 * vnoise(x, y) + 0.25 * vnoise(x * 2.03 + 17.1, y * 2.03 + 9.7) + 0.15 * vnoise(x * 4.1 + 3.3, y * 4.1 + 1.9) + 0.1 * vnoise(x * 8.3, y * 8.3 + 5.5);
const sm = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// what the years have done to a wall at a point: slow stains, damp and moss at its foot, runs of rain down it, pale lichen, soot over the baskets
export function weather(p, n, sconces) {
  const h = p.x * 0.7 + p.z * 0.7, big = 0.8 + 0.34 * fbm(h * 0.45 + p.y * 0.13, p.y * 0.5 + (p.x - p.z) * 0.21), run = sm(fbm(h * 5.3, p.y * 0.22 + 3.1), 0.52, 0.8) * (Math.abs(n.y) < 0.5 ? 1 : 0), foot = (1 - sm(p.y + 0.5 * fbm(h * 1.7, 7.7), 0.25, 0.95)) * (n.y < 0.5 ? 1 : 0.4);
  const lichen = sm(fbm(p.x * 2.9 + p.y * 1.3 + 11, p.z * 2.9 - p.y * 1.1 + 4), 0.6, 0.72) * 0.6, mossTop = n.y > 0.5 ? sm(fbm(p.x * 1.9 + 5, p.z * 1.9 + 8), 0.45, 0.7) * 0.55 : 0;
  let r = big * (1 - 0.2 * run), g = big * (1 - 0.18 * run), b = big * (1 - 0.15 * run);
  r *= 1 - 0.42 * foot; g *= 1 - 0.26 * foot; b *= 1 - 0.44 * foot;
  r *= 1 + 0.1 * lichen - 0.3 * mossTop; g *= 1 + 0.09 * lichen - 0.14 * mossTop; b *= 1 - 0.02 * lichen - 0.34 * mossTop;
  for (const s of sconces) { const d = Math.hypot(p.x - s[0], p.z - s[2]), up = p.y - s[1]; if (up > -0.1 && d < 0.5) { const k = 0.5 * (1 - sm(d, 0.12, 0.5)) * (1 - sm(up, 0.3, 1.5)); r *= 1 - k; g *= 1 - k; b *= 1 - k; } }
  return [r, g, b];
}

export function makeHall(R) {
  const faces = [], charts = [], vines = [], tops = [], ribTips = [], sconces = [];
  let share = null;

  // ---- a patch of the light picture: a flat one for a face (or for faces that lie in one plane), a round one for a tower
  class Plane {
    constructor() { this.faces = []; charts.push(this); }
    fix(D) {
      const n = this.n = this.faces[0].n, A = this.A = V(1, 0, 0); if (Math.abs(n.x) > 0.9) A.set(0, 0, 1); A.addScaledVector(n, -n.dot(A)).normalize(); const B = this.B = V().crossVectors(n, A);
      let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const f of this.faces) for (const p of f.pts) { const a = p.dot(A), b = p.dot(B); a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); }
      this.a0 = a0; this.b0 = b0; this.da = Math.max(1e-5, a1 - a0); this.db = Math.max(1e-5, b1 - b0); this.c = n.dot(this.faces[0].pts[0]);
      this.w = Math.max(2, Math.ceil(this.da * D) + 1); this.h = Math.max(2, Math.ceil(this.db * D) + 1);
      this.poly = this.faces.length === 1 ? this.faces[0].pts.map(p => [p.dot(A), p.dot(B)]) : null;
      if (this.poly) { let cx = 0, cy = 0; for (const q of this.poly) { cx += q[0]; cy += q[1]; } this.mid = [cx / this.poly.length, cy / this.poly.length]; }
    }
    uv(p) { return [(p.dot(this.A) - this.a0) / this.da, (p.dot(this.B) - this.b0) / this.db]; }
    at(fu, fv) {
      let a = this.a0 + fu * this.da, b = this.b0 + fv * this.db;
      if (this.poly) for (let pass = 0; pass < 2; pass++) for (let i = 0; i < this.poly.length; i++) {   // a point of the patch outside its face is lit as the face's nearest point
        const q = this.poly[i], r = this.poly[(i + 1) % this.poly.length]; let nx = -(r[1] - q[1]), ny = r[0] - q[0]; const l = Math.hypot(nx, ny); if (l < 1e-9) continue; nx /= l; ny /= l;
        if ((this.mid[0] - q[0]) * nx + (this.mid[1] - q[1]) * ny < 0) { nx = -nx; ny = -ny; }
        const d = (a - q[0]) * nx + (b - q[1]) * ny; if (d < 0.004) { a += nx * (0.004 - d); b += ny * (0.004 - d); } }
      return { p: V().copy(this.A).multiplyScalar(a).addScaledVector(this.B, b).addScaledVector(this.n, this.c), n: this.n };
    }
  }
  class Round {
    constructor(cx, cz, rOf, y0, y1, inward = false) { Object.assign(this, { cx, cz, rOf, y0, y1, inward }); this.faces = []; charts.push(this); }
    fix(D) { this.w = Math.max(2, Math.ceil(Math.PI * 2 * this.rOf((this.y0 + this.y1) / 2) * D) + 1); this.h = Math.max(2, Math.ceil((this.y1 - this.y0) * D) + 1); }
    uv(p, ref) { let a = Math.atan2(p.z - this.cz, p.x - this.cx); if (a < 0) a += Math.PI * 2; let fu = a / (Math.PI * 2); if (ref !== undefined) { if (fu - ref > 0.5) fu -= 1; if (ref - fu > 0.5) fu += 1; } return [fu, (p.y - this.y0) / (this.y1 - this.y0)]; }
    at(fu, fv) { const a = fu * Math.PI * 2, y = this.y0 + fv * (this.y1 - this.y0), r = this.rOf(y), s = this.inward ? -1 : 1, dr = (this.rOf(y + 0.05) - this.rOf(y - 0.05)) / 0.1;
      return { p: V(this.cx + Math.cos(a) * r, y, this.cz + Math.sin(a) * r), n: V(Math.cos(a) * s, -dr * s, Math.sin(a) * s).normalize() }; }
  }

  // ---- a face: flat, its corners in order; it is turned to face `out`, away from `away`, or toward `toward`
  function face(pts, o = {}) {
    let n = V().subVectors(pts[1], pts[0]).cross(V().subVectors(pts[2], pts[0])); if (n.lengthSq() < 1e-12 && pts.length > 3) n = V().subVectors(pts[2], pts[0]).cross(V().subVectors(pts[3], pts[0])); n.normalize();
    const mid = pts.reduce((a, p) => a.add(p), V()).multiplyScalar(1 / pts.length), want = o.out || (o.away && V().subVectors(mid, o.away)) || (o.toward && V().subVectors(o.toward, mid));
    let st = o.st || null;
    if (want && n.dot(want) < 0) { pts = pts.slice().reverse(); n.negate(); if (st) st = st.slice().reverse(); }
    const f = { pts, n, st, band: o.band || 'stone', tint: o.tint || null, chart: o.chart || share };
    if (!f.chart) f.chart = new Plane(); f.chart.faces.push(f); faces.push(f); return f;
  }
  const shared = fn => { const was = share; share = new Plane(); fn(); if (!share.faces.length) charts.splice(charts.indexOf(share), 1); share = was; };
  const alone = fn => { const was = share; share = null; fn(); share = was; };
  // a wall's own line: u along it, y up, w across it
  const frame = (ox, oz, ax, az, wx, wz) => { const P = (u, y, w = 0) => V(ox + ax * u + wx * w, y, oz + az * u + wz * w); P.U = V(ax, 0, az); P.W = V(wx, 0, wz); return P; };

  // a block: which of its faces are made (u U its ends, y Y under and over, w W its two sides), each on the band given for it
  function slab(P, u0, u1, y0, y1, w0, w1, o = {}) {
    const c = P((u0 + u1) / 2, (y0 + y1) / 2, (w0 + w1) / 2), fs = o.faces || 'uUYwW', b = k => (o.bands && o.bands[k]) || o.band, q = (k, pts) => fs.includes(k) && face(pts, { away: c, band: b(k), tint: o.tint });
    q('u', [P(u0, y0, w0), P(u0, y0, w1), P(u0, y1, w1), P(u0, y1, w0)]); q('U', [P(u1, y0, w0), P(u1, y0, w1), P(u1, y1, w1), P(u1, y1, w0)]);
    q('y', [P(u0, y0, w0), P(u1, y0, w0), P(u1, y0, w1), P(u0, y0, w1)]); q('Y', [P(u0, y1, w0), P(u1, y1, w0), P(u1, y1, w1), P(u0, y1, w1)]);
    q('w', [P(u0, y0, w0), P(u1, y0, w0), P(u1, y1, w0), P(u0, y1, w0)]); q('W', [P(u0, y0, w1), P(u1, y0, w1), P(u1, y1, w1), P(u0, y1, w1)]);
  }
  // a shape in (w, y) drawn along the wall: its edges (those named, or all) and its two ends
  function prism(P, prof, u0, u1, o = {}) {
    let cw = 0, cy = 0; for (const q of prof) { cw += q[0]; cy += q[1]; } const c = P((u0 + u1) / 2, cy / prof.length, cw / prof.length), n = prof.length;
    for (let i = 0; i < n; i++) { if (o.edges && !o.edges.includes(i)) continue; const a = prof[i], b = prof[(i + 1) % n]; face([P(u0, a[1], a[0]), P(u1, a[1], a[0]), P(u1, b[1], b[0]), P(u0, b[1], b[0])], { away: c, band: (o.edgeBands && o.edgeBands[i]) || o.band }); }
    if (o.caps !== false) for (const u of o.caps === 'u' ? [u0] : o.caps === 'U' ? [u1] : [u0, u1]) face(prof.map(q => P(u, q[1], q[0])), { away: c, band: o.capBand || o.band });
  }
  // a wall's upright face from u0 to u1 with openings in it: each a slit with a pointed head, its sides going into the wall, dark at the back
  function wallFace(P, w, dir, u0, u1, y0, y1, holes = [], o = {}) {
    const out = V().copy(P.W).multiplyScalar(dir), hs = holes.slice().sort((a, b) => a.u0 - b.u0), rect = (a, b, c, d) => { if (b - a > 1e-5 && d - c > 1e-5) face([P(a, c, w), P(b, c, w), P(b, d, w), P(a, d, w)], { out, band: o.band }); };
    shared(() => { let cur = u0;
      for (const h of hs) { rect(cur, h.u0, y0, y1); rect(h.u0, h.u1, y0, h.y0); rect(h.u0, h.u1, h.y1, y1); cur = h.u1; const m = (h.u0 + h.u1) / 2, sh = h.y1 - (h.head || 0);
        if (h.head) { face([P(h.u0, sh, w), P(m, h.y1, w), P(h.u0, h.y1, w)], { out, band: o.band }); face([P(h.u1, sh, w), P(h.u1, h.y1, w), P(m, h.y1, w)], { out, band: o.band }); } }
      rect(cur, u1, y0, y1); });
    alone(() => { for (const h of hs) { const wi = w - dir * h.depth, m = (h.u0 + h.u1) / 2, sh = h.y1 - (h.head || 0), c = P(m, (h.y0 + sh) / 2, (w + wi) / 2), b = h.band || 'ashlar';
      face([P(h.u0, h.y0, w), P(h.u0, h.y0, wi), P(h.u0, sh, wi), P(h.u0, sh, w)], { toward: c, band: b }); face([P(h.u1, h.y0, w), P(h.u1, h.y0, wi), P(h.u1, sh, wi), P(h.u1, sh, w)], { toward: c, band: b });
      face([P(h.u0, h.y0, w), P(h.u1, h.y0, w), P(h.u1, h.y0, wi), P(h.u0, h.y0, wi)], { toward: c, band: b });
      if (h.head) { face([P(h.u0, sh, w), P(h.u0, sh, wi), P(m, h.y1, wi), P(m, h.y1, w)], { toward: c, band: b }); face([P(h.u1, sh, w), P(h.u1, sh, wi), P(m, h.y1, wi), P(m, h.y1, w)], { toward: c, band: b }); }
      else face([P(h.u0, sh, w), P(h.u1, sh, w), P(h.u1, sh, wi), P(h.u0, sh, wi)], { toward: c, band: b });
      face([P(h.u0, h.y0, wi), P(h.u1, h.y0, wi), P(h.u1, h.y1, wi), P(h.u0, h.y1, wi)], { out, tint: h.tint || DARK }); } });
  }
  // a wall whose top is given stretch by stretch (battlements, a ruin's steps): its two sides, its tops, the risers between, its ends
  function profWall(P, us, hs, y0, w0, w1, o = {}) {
    const U = [us[0]], H = [], B = [], tb = i => (typeof o.topBand === 'function' ? o.topBand(i, hs[i]) : o.topBand) || o.band;
    for (let i = 0; i < hs.length; i++) { if (H.length && Math.abs(H[H.length - 1] - hs[i]) < 1e-6 && B[B.length - 1] === tb(i)) U[U.length - 1] = us[i + 1]; else { H.push(hs[i]); B.push(tb(i)); U.push(us[i + 1]); } }
    const n = H.length, outA = V().copy(P.W).negate(), outB = P.W, lo = Math.min(...H.filter(h => h > y0 + 1e-6));
    for (const [w, out, on] of [[w0, outA, o.front !== false], [w1, outB, o.back !== false]]) if (on) shared(() => {   // one face up to the lowest top, then what stands above it
      if (lo < 1e8) face([P(U[0], y0, w), P(U[n], y0, w), P(U[n], lo, w), P(U[0], lo, w)], { out, band: o.band });
      for (let i = 0; i < n; i++) if (H[i] > lo + 1e-6) face([P(U[i], lo, w), P(U[i + 1], lo, w), P(U[i + 1], H[i], w), P(U[i], H[i], w)], { out, band: o.band }); });
    for (let i = 0; i < n; i++) { if (H[i] <= y0 + 1e-6) continue; face([P(U[i], H[i], w0), P(U[i + 1], H[i], w0), P(U[i + 1], H[i], w1), P(U[i], H[i], w1)], { out: V(0, 1, 0), band: B[i] }); }
    for (let i = 0; i < n - 1; i++) { const a = Math.max(y0, Math.min(H[i], H[i + 1])), b = Math.max(H[i], H[i + 1]); if (b - a > 1e-5) face([P(U[i + 1], a, w0), P(U[i + 1], a, w1), P(U[i + 1], b, w1), P(U[i + 1], b, w0)], { out: H[i] > H[i + 1] ? P.U : V().copy(P.U).negate(), band: o.riserBand || o.band }); }
    const e0 = o.end0 === undefined ? y0 : o.end0, e1 = o.end1 === undefined ? y0 : o.end1;
    if (e0 !== null && H[0] - e0 > 1e-5) face([P(U[0], e0, w0), P(U[0], e0, w1), P(U[0], H[0], w1), P(U[0], H[0], w0)], { out: V().copy(P.U).negate(), band: o.endBand || o.riserBand || o.band });
    if (e1 !== null && H[n - 1] - e1 > 1e-5) face([P(U[n], e1, w0), P(U[n], e1, w1), P(U[n], H[n - 1], w1), P(U[n], H[n - 1], w0)], { out: P.U, band: o.endBand || o.riserBand || o.band });
  }
  // battlements along a stretch: merlons and the gaps between, here and there one broken
  function crenels(u0, u1, base, gap, top, broken = 0.2) {
    const us = [u0], hs = [], bands = [], n = Math.max(1, Math.round((u1 - u0 - 0.5) / 0.92)), mw = (u1 - u0 - n * 0.36) / (n + 1); let u = u0;
    for (let i = 0; i <= n; i++) { const br = R() < broken; u += mw; us.push(u); hs.push(br ? gap + (top - gap) * (0.1 + R() * 0.6) : top); bands.push(br ? 'core' : 'ashlar'); if (i < n) { u += 0.36; us.push(u); hs.push(gap); bands.push('ashlar'); } }
    us[us.length - 1] = u1; return { us, hs, bands };
  }
  // a ruin's top: from height a at u0 to height b at u1 in broken steps of the courses
  function steps(u0, u1, a, b, bite = 0.18) {
    const us = [u0], hs = []; let u = u0; while (u < u1 - 1e-6) { const w = Math.min(u1 - u, 0.22 + R() * 0.34), f = (u + w / 2 - u0) / (u1 - u0); let h = a + (b - a) * f * f * (3 - 2 * f) + (R() - 0.5) * 0.34; if (R() < bite) h -= 0.3 + R() * 0.3; h = Math.round(h / 0.14) * 0.14; hs.push(Math.max(Math.min(a, b) * 0.7, Math.min(Math.max(a, b), h))); u += w; us.push(u); }
    us[us.length - 1] = u1; return { us, hs };
  }
  // a buttress against a wall's face at w = 0, standing toward -w: two stages, each weathered back, dressed stone
  function buttress(P, u, hw, d1, y1, d2, y2, o = {}) {
    prism(P, [[0, 0], [-d1, 0], [-d1, y1], [-d2, y1 + (d1 - d2) * 1.6], [0, y1 + (d1 - d2) * 1.6]], u - hw, u + hw, { edges: [1, 2], band: 'ashlar' });
    prism(P, [[0, y1 + (d1 - d2) * 1.6], [-d2, y1 + (d1 - d2) * 1.6], [-d2, y2], [0, y2 + d2 * 1.5]], u - hw, u + hw, { edges: [1, 2], band: 'ashlar' });
    if (o.vine !== false && R() < 0.5) vines.push({ at: P(u + (R() - 0.5) * hw, y2 * (0.7 + R() * 0.3), -d2), right: P.U, out: V().copy(P.W).negate(), len: 0.9 + R(), n: 6 });
  }
  // a rib of the fallen roof, springing from (x, y, z) toward dir: a few stones of its arc, broken off
  function rib(x, y, z, dx, len) {
    const Pk = k => { const a = k / 7 * 1.25; return V(x + dx * 2.4 * (1 - Math.cos(a)), y + 2.4 * Math.sin(a), z); }, sd = V(0, 0, 0.11);
    for (let k = 0; k < len; k++) { const a = Pk(k), b = Pk(k + 1), up = V(-(b.y - a.y) * dx, (b.x - a.x) * dx, 0).normalize().multiplyScalar(0.13), q = (p, i, j) => V().copy(p).addScaledVector(up, i).addScaledVector(sd, j), c = V().addVectors(a, b).multiplyScalar(0.5);
      for (const [i0, j0, i1, j1] of [[-1, -1, -1, 1], [1, 1, 1, -1], [-1, 1, 1, 1], [1, -1, -1, -1]]) face([q(a, i0, j0), q(a, i1, j1), q(b, i1, j1), q(b, i0, j0)], { away: c, band: 'ashlar' });
      if (k === len - 1) { face([q(b, -1, -1), q(b, -1, 1), q(b, 1, 1), q(b, 1, -1)], { away: c, band: 'core' }); ribTips.push(b.clone()); } }
    slab(frame(x, z, 0, 1, dx, 0), -0.15, 0.15, y - 0.3, y - 0.02, -0.13, 0.17, { faces: 'uUyYW', band: 'ashlar' });   // the corbel it springs from
  }
  // a small dark hole in a face (a putlog hole, a beam's socket): painted, a hair proud of the wall
  const socket = (P, u, y, w, dir, s = 0.07, t = s) => alone(() => face([P(u - s, y - t, w + dir * 0.012), P(u + s, y - t, w + dir * 0.012), P(u + s, y + t, w + dir * 0.012), P(u - s, y + t, w + dir * 0.012)], { out: V().copy(P.W).multiplyScalar(dir), tint: DARK }));

  // ---- a round tower: battered foot, shaft, a corbelled head, battlements; slits painted on its shaft
  function tower(cx, cz, H, r, o = {}) {
    const N = 14, prof = [[0, r + 0.16], [0.95, r], [H - 0.42, r], [H - 0.2, r + 0.15], [H + 0.3, r + 0.15]], rOf = y => { for (let i = 0; i < prof.length - 1; i++) if (y <= prof[i + 1][0]) { const f = (y - prof[i][0]) / (prof[i + 1][0] - prof[i][0]); return prof[i][1] + (prof[i + 1][1] - prof[i][1]) * Math.max(0, f); } return prof[prof.length - 1][1]; };
    const ang = k => k / N * Math.PI * 2 + 0.11, at = (k, y, rr) => V(cx + Math.cos(ang(k)) * rr, y, cz + Math.sin(ang(k)) * rr), c = V(cx, H / 2, cz), turns = Math.max(1, Math.round(Math.PI * 2 * r / 2)), sOf = k => k / N * turns * 2;
    const shell = new Round(cx, cz, rOf, 0, H + 0.3);
    for (let i = 0; i < prof.length - 1; i++) { const [ya, ra] = prof[i], [yb, rb] = prof[i + 1], band = i === 2 ? 'ashlar' : 'stone';
      for (let k = 0; k < N; k++) face([at(k, ya, ra), at(k + 1, ya, ra), at(k + 1, yb, rb), at(k, yb, rb)], { out: V(Math.cos(ang(k + 0.5)), 0, Math.sin(ang(k + 0.5))), band, chart: shell, st: [[sOf(k), ya], [sOf(k + 1), ya], [sOf(k + 1), yb], [sOf(k), yb]] }); }
    const ri = r - 0.05, ro = r + 0.15, inner = new Round(cx, cz, () => ri, H, H + 0.3, true);
    face(Array.from({ length: N }, (_, k) => at(k, H, ri)), { out: V(0, 1, 0), band: 'ashlar' });                                                    // the deck
    for (let k = 0; k < N; k++) { face([at(k, H, ri), at(k + 1, H, ri), at(k + 1, H + 0.3, ri), at(k, H + 0.3, ri)], { toward: V(cx, H, cz), chart: inner, st: [[sOf(k), H], [sOf(k + 1), H], [sOf(k + 1), H + 0.3], [sOf(k), H + 0.3]] });
      const merlon = k % 2 === 0, broke = merlon && R() < (o.broken || 0.2), top = H + (merlon ? (broke ? 0.4 + R() * 0.3 : 0.92) : 0.3), mid = at(k + 0.5, H + 0.6, (ri + ro) / 2);
      face([at(k, top, ri), at(k + 1, top, ri), at(k + 1, top, ro), at(k, top, ro)], { out: V(0, 1, 0), band: broke ? 'core' : 'ashlar' });
      if (merlon) { face([at(k, H + 0.3, ro), at(k + 1, H + 0.3, ro), at(k + 1, top, ro), at(k, top, ro)], { away: c }); face([at(k, H + 0.3, ri), at(k + 1, H + 0.3, ri), at(k + 1, top, ri), at(k, top, ri)], { toward: V(cx, H, cz) });
        for (const kk of [k, k + 1]) face([at(kk, H + 0.3, ri), at(kk, H + 0.3, ro), at(kk, top, ro), at(kk, top, ri)], { away: mid }); } }
    for (let k = 0; k < N; k++) { const a = at(k + 0.5, 0, r * Math.cos(Math.PI / N)), d = V(a.x - cx, 0, a.z - cz).normalize(), P = frame(a.x, a.z, -d.z, d.x, d.x, d.z); prism(P, [[0, H - 0.72], [0.13, H - 0.5], [0.13, H - 0.4], [0, H - 0.4]], -0.07, 0.07, { edges: [0, 1], band: 'ashlar' }); }   // the corbels under its head
    // slits and doors: a dark slot in a dressed surround
    for (const [k, y, hw = 0.035, tall = 0.62] of o.slits || []) { const a = at(k, 0, r), b = at(k + 1, 0, r), m = V().addVectors(a, b).multiplyScalar(0.5), al = V().subVectors(b, a).normalize(), out = V(m.x - cx, 0, m.z - cz).normalize(), P = frame(m.x, m.z, al.x, al.z, out.x, out.z);
      alone(() => { face([P(-hw, y, 0.014), P(hw, y, 0.014), P(hw, y + tall, 0.014), P(-hw, y + tall, 0.014)], { out, tint: DARK });
        slab(P, -hw - 0.065, -hw, y - 0.02, y + tall + 0.06, 0, 0.03, { faces: 'uUyYW', band: 'ashlar' }); slab(P, hw, hw + 0.065, y - 0.02, y + tall + 0.06, 0, 0.03, { faces: 'uUyYW', band: 'ashlar' }); if (hw > 0.05) slab(P, -hw, hw, y + tall, y + tall + 0.07, 0, 0.035, { faces: 'yYW', band: 'ashlar' }); }); }
    for (let i = 0; i < (o.vines || 0); i++) { const a = o.vineArc[0] + R() * (o.vineArc[1] - o.vineArc[0]), d = V(Math.cos(a), 0, Math.sin(a)); vines.push({ at: V(cx + d.x * (r + 0.02), H * (0.45 + R() * 0.5), cz + d.z * (r + 0.02)), right: V(-d.z, 0, d.x), out: d, len: 1.4 + R() * 1.4, n: 10 }); }
  }

  // ================= the east: the curtain wall against the hill, its gatehouse, a tower at each corner
  const EX = 6.4, ET = 0.6, EH = 4.0, GZ = 1.7, GF = -0.4, GB = 0.75, GH = 5.0;
  { const P = frame(EX, 0, 0, 1, 1, 0);
    for (const sg of [-1, 1]) { const a = sg < 0 ? -6.5 : GZ, b = sg < 0 ? -GZ : 6.5, lancet = u => ({ u0: u - 0.085, u1: u + 0.085, y0: 2.3, y1: 3.32, head: 0.16, depth: 0.34 });
      wallFace(P, 0, -1, a, b, 0, EH, [2.32, 3.78, 5.25].map(u => lancet(sg * u)));
      wallFace(P, ET, 1, a, b, 0, EH, [2.32, 3.78, 5.25].map(u => ({ ...lancet(sg * u), depth: 0.2, u0: sg * u - 0.05, u1: sg * u + 0.05 })));
      prism(P, [[0, 0], [-0.1, 0], [-0.1, 0.34], [0, 0.5]], a, b, { edges: [1, 2], caps: false, band: 'ashlar' });                             // the plinth
      slab(P, a, b, 1.94, 2.06, -0.05, 0, { faces: 'yYw', band: 'ashlar' });                                                                  // a string course
      prism(P, [[0, 3.74], [-0.09, 3.86], [-0.09, 4.0], [0, 4.0]], a, b, { edges: [0, 1], caps: false, band: 'ashlar' });                     // the cornice under the wall walk
      face([P(a, EH, -0.09), P(b, EH, -0.09), P(b, EH, ET - 0.2), P(a, EH, ET - 0.2)], { out: V(0, 1, 0), band: 'ashlar' });                   // the wall walk
      const c = crenels(a, b, EH, EH + 0.32, EH + 0.86, 0.22); profWall(P, c.us, c.hs, EH, ET - 0.2, ET, { topBand: i => c.bands[i], front: true, back: true, end0: null, end1: null });
      for (const u of [2.95, 4.62]) { buttress(P, sg * u, 0.2, 0.36, 1.7, 0.22, 3.3); sconces.push([EX - 0.36, 2.42, sg * u]); }
      for (const [u, len] of sg < 0 ? [[2.95, 2], [4.62, 1]] : [[2.95, 1], [4.62, 2]]) rib(EX - 0.13, 3.92, sg * u, -1, len);
      for (const u of [2.0, 2.63, 3.36, 4.2, 5.0, 5.6]) socket(P, sg * u + (R() - 0.5) * 0.1, 3.5, 0, -1, 0.09, 0.11);                        // where the roof's timbers sat
      for (const u of [2.3, 3.8, 5.3]) for (const y of [1.2, 2.72]) if (R() < 0.75) socket(P, sg * (u + 0.42), y + (R() - 0.5) * 0.06, 0, -1, 0.045);   // putlog holes
      for (let i = 0; i < 7; i++) { const u = sg * (GZ + 0.25 + R() * 4.3); vines.push({ at: P(u, EH - 0.05 - R() * 0.5, -0.1), right: P.U, out: V(-1, 0, 0), len: 1.2 + R() * 1.9, n: 12 }); }
      for (let i = 0; i < 4; i++) tops.push([EX + 0.1 + R() * 0.3, EH + 0.04, sg * (GZ + 0.3 + R() * 4.3)]); }
    // the gatehouse: it stands forward of the wall and above it; a round arch of dressed stones, the gate inside it
    const N = 12, arch = Array.from({ length: N + 1 }, (_, i) => { const z = -1 + 2 * i / N; return [z, 1.25 + 0.85 * Math.sqrt(Math.max(0, 1 - z * z))]; }), ring = arch.map(([z, y], i) => { const a = Math.atan2((y - 1.25) / 0.85, z), k = 0.24; return [z + Math.cos(a) * k, y + Math.sin(a) * k]; }); ring[0] = [-1.24, 1.25]; ring[N] = [1.24, 1.25];
    shared(() => { const out = V(-1, 0, 0), slit = u => ({ u0: u - 0.06, u1: u + 0.06, y0: 3.3, y1: 4.1 });
      for (const sg of [-1, 1]) face([P(sg * GZ, 0, GF), P(sg * 1.24, 0, GF), P(sg * 1.24, 3.1, GF), P(sg * GZ, 3.1, GF)], { out });
      for (let i = 0; i < N; i++) face([P(ring[i][0], ring[i][1], GF), P(ring[i + 1][0], ring[i + 1][1], GF), P(ring[i + 1][0], 3.1, GF), P(ring[i][0], 3.1, GF)], { out }); });
    wallFace(P, GF, -1, -GZ, GZ, 3.1, GH - 0.12, [-0.62, 0.62].map(u => ({ u0: u - 0.06, u1: u + 0.06, y0: 3.42, y1: 4.2, head: 0.1, depth: 0.3 })));
    for (let i = 0; i < N; i++) { const [a, b, ra, rb] = [arch[i], arch[i + 1], ring[i], ring[i + 1]], c = P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.1, GF - 0.02);
      face([P(a[0], a[1], GF - 0.05), P(b[0], b[1], GF - 0.05), P(rb[0], rb[1], GF - 0.05), P(ra[0], ra[1], GF - 0.05)], { out: V(-1, 0, 0), band: 'ashlar' });               // the arch's stones, proud of the wall
      face([P(ra[0], ra[1], GF - 0.05), P(rb[0], rb[1], GF - 0.05), P(rb[0], rb[1], GF), P(ra[0], ra[1], GF)], { away: P((a[0] + b[0]) / 2, 1.25, GF), band: 'ashlar' });
      face([P(a[0], a[1], GF - 0.05), P(b[0], b[1], GF - 0.05), P(b[0], b[1], 0.52), P(a[0], a[1], 0.52)], { toward: P(0, 1.2, 0), band: 'ashlar' }); }                    // its soffit, back to the dark
    for (const sg of [-1, 1]) { slab(P, sg * 1.24, sg * 1.0, 0, 1.25, GF - 0.05, GF, { faces: 'uw', band: 'ashlar' }); face([P(sg, 0, GF - 0.05), P(sg, 0, 0.52), P(sg, 1.25, 0.52), P(sg, 1.25, GF - 0.05)], { toward: P(0, 0.6, 0), band: 'ashlar' });
      slab(P, sg * 1.3, sg * 0.98, 1.2, 1.3, GF - 0.09, GF, { faces: 'uUyYw', band: 'ashlar' });                                                                          // the impost the arch springs from
      face([P(sg * GZ, 0, GF), P(sg * GZ, 0, 0), P(sg * GZ, GH - 0.12, 0), P(sg * GZ, GH - 0.12, GF)], { out: V(0, 0, sg) });                                               // its sides, forward of the wall
      face([P(sg * GZ, EH, 0), P(sg * GZ, EH, GB), P(sg * GZ, GH - 0.12, GB), P(sg * GZ, GH - 0.12, 0)], { out: V(0, 0, sg) }); face([P(sg * GZ, 0, ET), P(sg * GZ, 0, GB), P(sg * GZ, EH, GB), P(sg * GZ, EH, ET)], { out: V(0, 0, sg) });
      slab(P, sg * GZ, sg * (GZ - 0.34), 0, 4.3, GF - 0.13, GF, { faces: 'uUw', band: 'ashlar' }); prism(P, [[GF, 4.3], [GF - 0.13, 4.3], [GF, 4.55]], Math.min(sg * GZ, sg * (GZ - 0.34)), Math.max(sg * GZ, sg * (GZ - 0.34)), { edges: [1], band: 'ashlar' }); }   // a pilaster at each corner
    face([P(-GZ, 0, GB), P(GZ, 0, GB), P(GZ, GH - 0.12, GB), P(-GZ, GH - 0.12, GB)], { out: V(1, 0, 0) });                                                                  // its back, to the hill
    prism(P, [[GF, 0], [GF - 0.08, 0], [GF - 0.08, 0.34], [GF, 0.48]], -GZ + 0.34, -1.24, { edges: [1, 2], caps: false, band: 'ashlar' }); prism(P, [[GF, 0], [GF - 0.08, 0], [GF - 0.08, 0.34], [GF, 0.48]], 1.24, GZ - 0.34, { edges: [1, 2], caps: false, band: 'ashlar' });
    slab(P, -GZ + 0.34, GZ - 0.34, 3.04, 3.16, GF - 0.05, GF, { faces: 'yYw', band: 'ashlar' });
    // corbels carry its parapet out over the gate
    const OV = 0.16; for (let i = 0; i < 10; i++) { const u = -GZ + 0.2 + i * (2 * GZ - 0.4 - 0.13) / 9; prism(P, [[GF, GH - 0.42], [GF - OV, GH - 0.2], [GF - OV, GH - 0.12], [GF, GH - 0.12]], u, u + 0.13, { edges: [0, 1], band: 'ashlar' }); }
    for (const [Q, a, b] of [[frame(EX + GF - OV, 0, 0, 1, 1, 0), -GZ - OV, GZ + OV], [frame(EX + GB, 0, 0, -1, -1, 0), -GZ - OV, GZ + OV], [frame(EX, -GZ - OV, 1, 0, 0, 1), GF - OV, GB], [frame(EX, GZ + OV, -1, 0, 0, -1), -GB, -GF + OV]]) {
      const c = crenels(a, b, GH, GH + 0.3, GH + 0.84, 0.12); profWall(Q, c.us, c.hs, GH - 0.12, 0, 0.18, { topBand: i => c.bands[i], end0: null, end1: null }); }
    face([P(-GZ - OV, GH - 0.12, GF - OV), P(GZ + OV, GH - 0.12, GF - OV), P(GZ + OV, GH - 0.12, GF), P(-GZ - OV, GH - 0.12, GF)], { out: V(0, -1, 0), band: 'ashlar' });
    for (const sg of [-1, 1]) face([P(sg * GZ, GH - 0.12, GF), P(sg * (GZ + OV), GH - 0.12, GF), P(sg * (GZ + OV), GH - 0.12, GB), P(sg * GZ, GH - 0.12, GB)], { out: V(0, -1, 0), band: 'ashlar' });
    face([P(-GZ, GH, GF), P(GZ, GH, GF), P(GZ, GH, GB), P(-GZ, GH, GB)], { out: V(0, 1, 0), band: 'ashlar' });                                                              // its roof
    for (let i = 0; i < 5; i++) vines.push({ at: P((R() < 0.5 ? -1 : 1) * (1.15 + R() * 0.5), GH - 0.5 - R() * 1.4, GF - 0.03), right: P.U, out: V(-1, 0, 0), len: 1 + R() * 1.4, n: 9 });
  }
  const TN = [6.85, -7.05, 5.9, 1.08], TS = [6.85, 7.05, 5.0, 1.08];
  tower(...TN, { slits: [[4, 2.2], [5, 3.7], [3, 2.6], [6, 3.2], [4, 4.5], [5, 0.02, 0.15, 0.78], [3, 4.02, 0.13, 0.72]], vines: 5, vineArc: [1.6, 4.4], broken: 0.3 });
  tower(...TS, { slits: [[8, 2.2], [7, 3.3], [9, 2.6], [6, 2.6], [7, 0.02, 0.15, 0.78], [10, 4.02, 0.13, 0.72]], vines: 5, vineArc: [1.9, 4.7], broken: 0.3 });

  // ================= the west: the wall over the gorge. Its middle went down the mountain with the roof; what stands each side of the breach still carries its walk and a few battlements
  const WX = -6.6, WT = 0.45, WH = 3.22, WE = 6.67;
  { const P = frame(WX, 0, 0, 1, -1, 0);
    for (const sg of [-1, 1]) { const Q = frame(WX, 0, 0, sg, -1, 0), full = 4.3, br = 2.9;   // u runs from the breach out to the corner on both sides
      const st = steps(br, full, 0.84, WH, 0.12), us = [...st.us, WE], hs = [...st.hs, WH];
      const lanc = { u0: 5.52, u1: 5.7, y0: 1.55, y1: 2.6, head: 0.16, depth: 0.3 };
      shared(() => { const out = V(1, 0, 0); for (let i = 0; i < hs.length; i++) if (i < hs.length - 1) face([Q(us[i], 0, 0), Q(us[i + 1], 0, 0), Q(us[i + 1], hs[i], 0), Q(us[i], hs[i], 0)], { out }); });
      wallFace(Q, 0, -1, full, WE, 0, WH, [lanc]);
      shared(() => { const out = V(-1, 0, 0); for (let i = 0; i < hs.length - 1; i++) face([Q(us[i], 0, WT), Q(us[i + 1], 0, WT), Q(us[i + 1], hs[i], WT), Q(us[i], hs[i], WT)], { out }); });
      wallFace(Q, WT, 1, full, WE + 0.36, 0, WH, [{ ...lanc, u0: 5.56, u1: 5.66, depth: 0.15 }]);
      for (let i = 0; i < hs.length - 1; i++) { face([Q(us[i], hs[i], 0), Q(us[i + 1], hs[i], 0), Q(us[i + 1], hs[i], WT), Q(us[i], hs[i], WT)], { out: V(0, 1, 0), band: 'core' });
        const a = i ? hs[i - 1] : 0.56, lo = Math.min(a, hs[i]), hi = Math.max(a, hs[i]); if (hi - lo > 1e-5) face([Q(us[i], lo, 0), Q(us[i], lo, WT), Q(us[i], hi, WT), Q(us[i], hi, 0)], { out: V(0, 0, a > hs[i] ? sg : -sg), band: 'core' }); }
      { const i = hs.length - 2, lo = hs[i]; if (WH - lo > 1e-5) face([Q(full, lo, 0), Q(full, lo, WT), Q(full, WH, WT), Q(full, WH, 0)], { out: V(0, 0, -sg), band: 'core' }); }
      face([Q(full, WH, -0.07), Q(WE, WH, -0.07), Q(WE, WH, WT - 0.18), Q(full, WH, WT - 0.18)], { out: V(0, 1, 0), band: 'ashlar' });                       // its walk
      prism(Q, [[0, WH - 0.24], [-0.07, WH - 0.13], [-0.07, WH], [0, WH]], full, WE, { edges: [0, 1], caps: 'u', band: 'ashlar' });
      const c = crenels(full + 0.1, WE + 0.36, WH, WH + 0.3, WH + 0.8, 0.45); profWall(Q, c.us, c.hs, WH, WT - 0.18, WT, { topBand: i => c.bands[i], end1: null, riserBand: null });
      prism(Q, [[0, 0], [-0.09, 0], [-0.09, 0.3], [0, 0.44]], br + 0.5, WE, { edges: [1, 2], caps: 'u', band: 'ashlar' });
      buttress(Q, 4.72, 0.2, 0.34, 1.5, 0.2, 2.75);
      { const O = frame(WX - WT, 0, 0, sg, 1, 0); buttress(O, 4.9, 0.24, 0.5, 1.4, 0.3, 2.6, { vine: false }); }                                                            // and one outside, over the drop
      for (const [u, y] of [[5.2, 1.05], [6.2, 1.05], [5.15, 2.35], [6.2, 2.5]]) if (R() < 0.8) socket(Q, u, y, 0, -1, 0.045);
      for (let i = 0; i < 4; i++) { vines.push({ at: Q(full + 0.2 + R() * 2, 1.4 + R() * 1.7, -0.03), right: Q.U, out: V(1, 0, 0), len: 1.3, n: 7 }); vines.push({ at: Q(br + 0.6 + R() * 3, 1.0 + R() * 1.6, WT + 0.03), right: Q.U, out: V(-1, 0, 0), len: 1.2, n: 5 }); }
    }
    // the breach's sill: the wall's lowest courses, broken, with gaps a stone wide
    { const us = [-2.9], hs = []; let u = -2.9; while (u < 2.9 - 1e-6) { const w = Math.min(2.9 - u, 0.3 + R() * 0.5); hs.push(R() < 0.16 ? 0.06 : Math.round((0.16 + R() * R() * 0.6) / 0.07) * 0.07); u += w; us.push(u); } us[us.length - 1] = 2.9; hs[0] = 0.56; hs[hs.length - 1] = 0.56;
      profWall(P, us, hs, 0, 0, WT, { topBand: 'core', riserBand: 'core', end0: null, end1: null });
      for (const [u, h] of [[-1.5, 1.25], [1.9, 0.95]]) { slab(P, u - 0.26, u + 0.26, 0, h, -0.04, WT + 0.04, { faces: 'uUwWY', bands: { Y: 'core' } }); slab(P, u - 0.2, u + 0.16, h, h + 0.2, 0.02, WT - 0.06, { faces: 'uUwWY', bands: { Y: 'core', u: 'core' } }); } }   // two stumps of the wall's piers still stand in it
  }

  // ================= the ends: each end wall is down to a dwarf wall before its seat, the road's gap between two gate piers, the stumps of its piers along it; it climbs in broken steps to the corners
  for (const sg of [-1, 1]) { const P = frame(0, sg * WE, 1, 0, 0, sg), TH = 0.36, LOW = 0.78;
    const west = steps(-6.2, -4.5, WH, LOW, 0.12), east = steps(4.5, 5.75, LOW, 3.0, 0.12);
    const dwarf = (a, b) => { const us = [a], hs = []; let u = a; while (u < b - 1e-6) { const w = Math.min(b - u, 0.35 + R() * 0.75); hs.push(R() < 0.26 ? LOW - 0.14 * (1 + Math.floor(R() * 3)) : LOW); u += w; us.push(u); } us[us.length - 1] = b; hs[0] = hs[hs.length - 1] = LOW; return { us, hs }; };
    const dw = dwarf(-4.5, -1.14), de = dwarf(1.14, 4.5), us = [-7.05, ...west.us, ...dw.us.slice(1)], hs = [WH, ...west.hs, ...dw.hs];
    const tb = (i, h) => Math.abs(h - LOW) < 1e-6 ? 'ashlar' : 'core';
    profWall(P, us, hs, 0, 0, TH, { topBand: tb, riserBand: 'core', end0: null });
    profWall(P, [...de.us, ...east.us.slice(1), 6.3], [...de.hs, ...east.hs, 3.0], 0, 0, TH, { topBand: tb, riserBand: 'core', end1: null });
    for (const s of [-1, 1]) { const u = s * 0.97;                                                                                                                         // the gate piers
      slab(P, u - 0.19, u + 0.19, 0, 1.16, -0.03, TH + 0.03, { faces: 'uUwW', band: 'ashlar' }); slab(P, u - 0.23, u + 0.23, 1.16, 1.24, -0.07, TH + 0.07, { faces: 'uUwWyY', band: 'ashlar' });
      const tip = P(u, 1.5, TH / 2), cs = [P(u - 0.2, 1.24, -0.04), P(u + 0.2, 1.24, -0.04), P(u + 0.2, 1.24, TH + 0.04), P(u - 0.2, 1.24, TH + 0.04)]; for (let k = 0; k < 4; k++) face([cs[k], cs[(k + 1) % 4], tip], { away: P(u, 1.2, TH / 2), band: 'ashlar' }); }
    for (const [u, h] of [[-3.45, 1.02], [-2.25, 0.92], [2.25, 1.06], [3.45, 0.9]]) { slab(P, u - 0.23, u + 0.23, 0, h, -0.05, TH + 0.05, { faces: 'uUwWY', band: 'ashlar', bands: { Y: 'core' } }); slab(P, u - 0.27, u + 0.27, 0, 0.16, -0.09, TH + 0.09, { faces: 'uUwWY', band: 'ashlar' }); }   // the stumps of the piers that carried its arches
    prism(P, [[0, 0], [-0.07, 0], [-0.07, 0.22], [0, 0.32]], -6.6, -4.5, { edges: [1, 2], caps: 'U', band: 'ashlar' }); prism(P, [[0, 0], [-0.07, 0], [-0.07, 0.22], [0, 0.32]], 4.5, 5.9, { edges: [1, 2], caps: 'u', band: 'ashlar' });
    for (let i = 0; i < 6; i++) { const u = (i < 3 ? -1 : 1) * (1.5 + R() * 3); vines.push({ at: P(u, LOW - 0.1, -0.03), right: P.U, out: V(0, 0, -sg), len: 0.55, n: 4, s: 0.85 }); vines.push({ at: P(u + 0.3, LOW - 0.12, TH + 0.03), right: P.U, out: V(0, 0, sg), len: 0.55, n: 4, s: 0.85 }); }
    for (let i = 0; i < 3; i++) { vines.push({ at: P(-6.4 + R() * 1.5, 1.2 + R() * 1.2, -0.03), right: P.U, out: V(0, 0, -sg), len: 1.2, n: 6 }); vines.push({ at: P(4.8 + R() * 0.8, 1.2 + R() * 1.2, -0.03), right: P.U, out: V(0, 0, -sg), len: 1.2, n: 6 }); }
  }

  // ---- the faces as one mesh: each cut where its band of the stone picture begins again
  function geometry(D0 = 64) {
    let D = D0, placed = false;
    while (!placed) { for (const c of charts) c.fix(D); const order = charts.slice().sort((a, b) => b.h - a.h); let x = 0, y = 0, row = 0; placed = true;
      for (const c of order) { if (c.w + 2 > LW) { placed = false; break; } if (x + c.w + 2 > LW) { x = 0; y += row; row = 0; } if (y + c.h + 2 > LH) { placed = false; break; } c.x = x + 1; c.y = y + 1; x += c.w + 2; row = Math.max(row, c.h + 2); }
      if (!placed) D *= 0.94; }
    const pos = [], uv = [], uv1 = [], col = [];
    const clip = (poly, k, sign) => { const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], da = (a.t - k) * sign, db = (b.t - k) * sign; if (da >= -1e-7) out.push(a); if ((da > 1e-7 && db < -1e-7) || (da < -1e-7 && db > 1e-7)) { const f = da / (da - db); out.push({ p: V().lerpVectors(a.p, b.p, f), s: a.s + (b.s - a.s) * f, t: k }); } } return out; };
    for (const f of faces) { const n = f.n, band = BANDS[f.band] || BANDS.stone, rep = band.rep; let S, T;
      if (Math.abs(n.y) > 0.75) { S = V(1, 0, 0); T = V(0, 0, 1); } else { T = V(0, 1, 0).addScaledVector(n, -n.y).normalize(); S = V().crossVectors(T, n); }
      const vs = f.pts.map((p, i) => ({ p, s: f.st ? f.st[i][0] : p.dot(S), t: f.st ? f.st[i][1] : p.dot(T) })), t0 = Math.min(...vs.map(v => v.t)), t1 = Math.max(...vs.map(v => v.t)), s0 = Math.floor(Math.min(...vs.map(v => v.s)) / 2) * 2;
      const mid = f.pts.reduce((a, p) => a.add(p), V()).multiplyScalar(1 / f.pts.length), ref = f.chart.uv(mid)[0], c = f.tint || (f.band === 'core' ? CORE : [1, 1, 1]);
      for (let k = Math.floor(t0 / rep + 1e-4); k * rep < t1 - 1e-4; k++) { let poly = clip(clip(vs, k * rep, 1), (k + 1) * rep, -1); if (poly.length < 3) continue;
        for (let i = 1; i < poly.length - 1; i++) for (const v of [poly[0], poly[i], poly[i + 1]]) { const q = f.chart.uv(v.p, ref);
          pos.push(v.p.x, v.p.y, v.p.z); uv.push((v.s - s0) / 2, (band.y + (1 - Math.min(1, Math.max(0, (v.t - k * rep) / rep))) * band.h) / SH);
          uv1.push((f.chart.x + 0.5 + Math.min(1, Math.max(0, q[0])) * (f.chart.w - 1)) / LW, (f.chart.y + 0.5 + Math.min(1, Math.max(0, q[1])) * (f.chart.h - 1)) / LH); col.push(c[0] * 255, c[1] * 255, c[2] * 255, 128); } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2)); g.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(col), 4, true));
    return { g, D, patches: charts.length, faces: faces.length };
  }
  // ---- the light picture: every patch's points lit, smoothed a little within the patch, stained by the weather, its edge carried one point out
  function light(lightAt, reseed) {
    const cv = document.createElement('canvas'); cv.width = LW; cv.height = LH; const ctx = cv.getContext('2d'), im = ctx.createImageData(LW, LH), d = im.data; for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = 150; d[i + 3] = 255; }
    const enc = v => { v = Math.min(1, Math.max(0, v)); return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); };
    for (const c of charts) { const { w, h } = c, L = new Float32Array(w * h * 3), Wt = new Float32Array(w * h * 3);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const { p, n } = c.at(i / (w - 1), j / (h - 1)); reseed(p); L.set(lightAt(p, n, 20), (j * w + i) * 3); Wt.set(weather(p, n, sconces), (j * w + i) * 3); }
      const B = new Float32Array(w * h * 3);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) for (let k = 0; k < 3; k++) { let s = 0, m = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const x = i + di, y = j + dj; if (x < 0 || y < 0 || x >= w || y >= h) continue; const wt = (di ? 1 : 2) * (dj ? 1 : 2); s += L[(y * w + x) * 3 + k] * wt; m += wt; } B[(j * w + i) * 3 + k] = s / m; }
      for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) { const x = Math.min(w - 1, Math.max(0, i)), y = Math.min(h - 1, Math.max(0, j)), o = ((c.y + j) * LW + c.x + i) * 4, q = (y * w + x) * 3; d[o] = enc(B[q] * Wt[q]); d[o + 1] = enc(B[q + 1] * Wt[q + 1]); d[o + 2] = enc(B[q + 2] * Wt[q + 2]); } }
    ctx.putImageData(im, 0, 0); return cv;
  }
  return { geometry, light, vines, tops, ribTips, sconces, TN, TS };
}

// ---- the stone picture: each surface's photograph with its relief and hollows painted in (light from above, as a wall under the sky has it), muted; two bands, each with its own rows repeated above and below so it can begin again cleanly
export function stonePicture(pics) {
  const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH; const ctx = cv.getContext('2d'); ctx.fillStyle = '#55524e'; ctx.fillRect(0, 0, SW, SH);
  for (const [name, across, tone, sat] of [['stone', 1, [1.0, 1.0, 1.0], 0.6], ['ashlar', 1, [1.5, 1.5, 1.52], 0.3]]) { const b = BANDS[name], w = SW / across, h = b.h, t = document.createElement('canvas'); t.width = w; t.height = h; const x = t.getContext('2d', { willReadFrequently: true });
    const px = im => { x.drawImage(im, 0, 0, w, h); return x.getImageData(0, 0, w, h).data; }, C = px(pics[name]), N = px(pics[name + '_nor']), A = px(pics[name + '_ao']), out = x.createImageData(w, h), o = out.data;
    for (let i = 0; i < w * h * 4; i += 4) { const ny = N[i + 1] / 127.5 - 1, nx = N[i] / 127.5 - 1, k = (0.6 + 0.4 * A[i] / 255) * Math.min(1.3, Math.max(0.6, 1 + 0.85 * ny - 0.2 * nx)); let r = C[i] * k, g = C[i + 1] * k, bl = C[i + 2] * k; const l = 0.3 * r + 0.59 * g + 0.11 * bl;
      o[i] = Math.min(255, (l + (r - l) * sat) * tone[0]); o[i + 1] = Math.min(255, (l + (g - l) * sat) * tone[1]); o[i + 2] = Math.min(255, (l + (bl - l) * sat) * tone[2]); o[i + 3] = 255; }
    x.putImageData(out, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, b.y - GUT, SW, h + 2 * GUT); ctx.clip(); for (let i = 0; i < across; i++) for (const dy of [-h, 0, h]) ctx.drawImage(t, i * w, b.y + dy); ctx.restore(); }
  return cv;
}
