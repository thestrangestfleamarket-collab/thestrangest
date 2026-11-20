// bakes RAMEN's street from THE MARKET: node tools/ramen-corner.cjs [--list]  (after SKIP=g python3 build.py; PWCHROME the browser)
// opens dist/market.html at the cart's corner (data/world.json ramen), reads every still thing the market draws round it out of the page (its points, colours, pictures, where its lamps are) into the cart's own metres, whole, as far as the section runs; then keeps only what can be seen from where a player of RAMEN can be (see: every piece is drawn in its own colour from eye points all over the cart, its pavement and the camera's reach behind a walker, six ways from each; a piece no eye sees is left out, a large one by the part of it that is seen), and writes data/sushi/corner.json and corner.bin (the points and the pictures, gzipped); TOPDOWN=<file.png> also writes a picture from above of what is kept (green) and left out (red); run it again when the map there changes
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist'), OUT = path.join(ROOT, 'data/sushi'), LIST = process.argv.includes('--list');
const W = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/world.json'), 'utf8')), CART = W.ramen || { x: -18, y: -41.3 };
// what is read, in metres from the cart: everything in the section's reach (x0..z1), past it only what is large and plain (out); a picture is written at the size its nearest wearer is seen at (near, mid from where a player can be: walk)
// see: where eyes can be (the cook's place, the stools, the pavement a guest walks and the camera 2.6 m behind them, from a sitter's eye to the raised camera's), how fine each look is, and how a large piece is split into parts (unit: larger than this, by squares of part metres)
const REG = { x0: -190, x1: 130, z0: -120, z1: 210, near: 40, mid: 90, cell: 44, tex: 512, out: { x0: -260, x1: 230, z0: -170, z1: 230, size: 16, tris: 320 }, walk: { x0: -12, x1: 43, z0: -7.4, z1: 2.4 },
  see: { px: 1024, xs: [-12, 43, 4], zs: [-7.2, -4.8, -2.4, 0, 2.3], ys: [1.15, 1.7, 3.3], cook: { xs: [-0.5, 0, 0.5], zs: [0, 0.6, 1.2], ys: [1.2, 1.6, 1.9] }, stools: { xs: [-0.8, 0, 0.8], z: -1.2, ys: [1.2, 1.6] }, cart: [-1.2, -0.6, 1.2, 1.85], unit: 8, part: 5 } };
// Market St alone (owner, 20 Nov 2026): nothing north of the park's wall line or south of Market St's row is read (north, south). The park's side is lined with Market St's own fronts that stand out of the cart's sight (SHOPS, west to east from x0: "use the unique store fronts like arcade, theatre, playhouse, musuems"): each is read a second time, turned round to face the street, its front where the park's wall was (band: where the row stands, with what stands out before its fronts; each shop: where it is, and S, pz2: x -> S - x, z -> pz2 - z)
const T2M = 0.84, zOf = (y) => (y - CART.y) * T2M, xOf = (x) => (x - CART.x) * T2M, SHOPS = { x0: -62, list: ['theatre', 'bank', 'art', 'play', 'gym', 'clinic', 'butterflies', 'pets', 'reptiles', 'birdshop'] };
const ROW = { z0: 1e9, z1: 1e9, front: 0, dz: 0, north: zOf(W.park.y0) - 0.05, south: zOf(W.block.back), clear: [-4, 4], band: [zOf(W.block.back) - 0.4, zOf(W.block.front) + 3.5], pz2: zOf(W.park.y0) + zOf(W.block.front), shops: [] };
{ let at = SHOPS.x0; for (const id of SHOPS.list) { const P = W.places.find((p) => p.id === id), a = xOf(P.x0), b = xOf(P.x1); ROW.shops.push({ id, x0: a, x1: b, S: at + (b - a) / 2 + (a + b) / 2 }); at += b - a; } }
const srv = require('http').createServer((q, r) => { const f = path.join(DIST, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });

// ---- in the page ----
const bake = async (o) => {
  const D = __dbg, T = D.THREE, sc = D.scene, TL = D.cv().TILE, M = TL / 0.84, B = D.MAPK.BOD, cx = B.XS(o.cart.x), cz = B.ZS(o.cart.y), gy = D.ground(cx, cz), R = o.REG, MV = o.row; MV.dy = -(D.ground(cx, cz + ((MV.z0 + MV.z1) / 2) * M) - gy) / M;   // (the row stands on Market St's own level)
  for (let i = 0; i < 400 && BATCH.left(400 * M) > 0; i++) { BATCH.rush(250, 400 * M); await new Promise((r) => setTimeout(r, 60)); }   // every patch of ground in sight painted first
  const unpainted = BATCH.left(400 * M); sc.updateMatrixWorld(true);
  const vis = (q) => { for (let p = q; p; p = p.parent) if (!p.visible) return false; return true; };
  const chain = (q) => { const c = []; for (let p = q; p; p = p.parent) if (p.name) c.push(p.name); return c.join('<'); };
  // what moves is not the street: whatever stands somewhere else a few seconds later
  const at0 = new Map(); sc.traverse((q) => { if (q.isMesh) at0.set(q, q.matrixWorld.elements.slice(12, 15)); });
  await new Promise((r) => setTimeout(r, 6000)); sc.updateMatrixWorld(true);
  const moved = (q) => { const a = at0.get(q), e = q.matrixWorld.elements; return !a || Math.abs(a[0] - e[12]) + Math.abs(a[1] - e[13]) + Math.abs(a[2] - e[14]) > 1e-4; };
  const UNDER = /(^|<)(loop|loop-tunnels|down|trains)(<|$)/, CARP = /(^|<)(BODY|WHEEL [FRM][LR]|DOOR [FR][LR]|GLASS|LIGHT BAR|INSIDE|DOME|CARGO CRATE|CAMERA HEAD)/;
  const texs = new Map(), TX = [], cv = document.createElement('canvas');
  // a picture: kept by the nearest thing that wears it, and written smaller for what only far things wear
  const tex = (t) => { if (!t) return -1; if (!t.image) { note(skipped, 'a picture gone', 1); return -1; } let i = texs.get(t.uuid); if (i == null) { i = TX.push({ t }) - 1; texs.set(t.uuid, i); } return i; };
  const picture = ({ t }, d) => { let url = null; const im = t.image, cap = d < R.near ? R.tex : d < R.mid ? R.tex / 2 : R.tex / 4;
    try { const w = im.width || im.videoWidth, h = im.height || im.videoHeight; if (!w) throw 0; const k = Math.min(1, cap / Math.max(w, h)); cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k)); const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
      if (im.data) { const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const dd = new ImageData(w, h), s = im.data, ch = s.length / (w * h); for (let i = 0; i < w * h; i++) { dd.data[i * 4] = s[i * ch]; dd.data[i * 4 + 1] = s[i * ch + (ch > 1 ? 1 : 0)]; dd.data[i * 4 + 2] = s[i * ch + (ch > 2 ? 2 : 0)]; dd.data[i * 4 + 3] = ch > 3 ? s[i * ch + 3] : 255; } c2.getContext('2d').putImageData(dd, 0, 0); g.drawImage(c2, 0, 0, cv.width, cv.height); }
      else g.drawImage(im, 0, 0, cv.width, cv.height);
      url = cv.toDataURL('image/webp', 0.82); } catch (e) { url = null; }
    return { url, w: cv.width, h: cv.height, rep: [t.repeat.x, t.repeat.y], off: [t.offset.x, t.offset.y], wrap: [t.wrapS, t.wrapT], flipY: t.flipY, rot: t.rotation, near: t.magFilter === T.NearestFilter, srgb: t.colorSpace === T.SRGBColorSpace }; };
  const mats = new Map(), ML = [];
  const mat = (m, hasUv, glow) => { const k = m.uuid + (glow ? 'g' : '') + (hasUv ? 'u' : ''); if (mats.has(k)) return mats.get(k);
    const map = hasUv ? tex(m.map) : -1, e = m.emissive && m.emissiveIntensity > 0 && (m.emissive.r + m.emissive.g + m.emissive.b) > 0 ? [m.emissive.r * m.emissiveIntensity, m.emissive.g * m.emissiveIntensity, m.emissive.b * m.emissiveIntensity] : null;
    const q = { c: m.color ? [m.color.r, m.color.g, m.color.b] : [1, 1, 1], map, basic: !!m.isMeshBasicMaterial, tr: !!m.transparent && m.opacity < 0.99, op: m.opacity, at: m.alphaTest || (m.transparent && map >= 0 ? 0.4 : 0), side: m.side, vc: !!m.vertexColors, e, emap: e && hasUv ? tex(m.emissiveMap) : -1, glow: !!glow, fog: m.fog !== false };
    const key = JSON.stringify(q); let i = ML.findIndex((x) => x.key === key); if (i < 0) i = ML.push({ key, q }) - 1; mats.set(k, i); return i; };
  // the pieces, by material and by a square of ground: P points, N normals, U uv, C colour and glow, I index, T which piece each triangle is of (see)
  const chunks = new Map(), stat = {}, skipped = {}, v = new T.Vector3(), n = new T.Vector3(), nm = new T.Matrix3(), IM = new T.Matrix4(), WM = new T.Matrix4(), bb = new T.Box3(), ic = new T.Color();
  const note = (S, k, t) => { S[k] = (S[k] || 0) + t; };
  const buf = (A) => { const b = { a: new A(3072), n: 0 }; b.add = (x) => { if (b.n === b.a.length) { const a = new A(b.a.length * 2); a.set(b.a); b.a = a; } b.a[b.n++] = x; }; return b; };
  const CL = [null], SE = R.see, WK = R.walk, dWalk = (x0, z0, x1, z1) => Math.hypot(Math.max(x0 - WK.x1, 0, WK.x0 - x1), Math.max(z0 - WK.z1, 0, WK.z0 - z1));   // CL: every piece (or part of a large one): its triangles, its name, how near it comes to where a player can be, its material
  const one = (q, mw, g, m, start, count, tint, tag, vr) => { const P = g.attributes.position, idx = g.index, v0 = vr ? vr[0] : 0;
    if (vr) { bb.makeEmpty(); for (let i = v0; i < v0 + vr[1]; i++) bb.expandByPoint(v.fromBufferAttribute(P, i)); bb.applyMatrix4(mw); } else { if (!g.boundingBox) g.computeBoundingBox(); bb.copy(g.boundingBox).applyMatrix4(mw); }
    const x0 = (bb.min.x - cx) / M, x1 = (bb.max.x - cx) / M, y0 = (bb.min.y - gy) / M, y1 = (bb.max.y - gy) / M; let z0 = (bb.min.z - cz) / M, z1 = (bb.max.z - cz) / M;
    const row = z0 >= MV.z0 - MV.front && z1 <= MV.z1 + 0.4, dz = row ? MV.dz : 0, dy = row ? MV.dy : 0, zm = (z0 + z1) / 2, wide = Math.hypot(x1 - x0, z1 - z0) > 8;   // row: a thing of the Hudson row, read where it stands on the park's side
    if (row && !wide && x1 > MV.clear[0] && x0 < MV.clear[1] && z0 + dz < MV.north - 0.3) { note(skipped, 'where the cart stands ' + tag, 1); return; }
    if (!row && (zm > MV.north || zm < MV.south) && (!wide || y1 > 1.2)) { note(skipped, 'beyond Market St ' + tag, 1); return; }   // (a wide flat thing is ground: cut at the line instead)
    if (!row && !wide && (z1 > MV.north + 1.5 || z0 < MV.south - 1.5)) { note(skipped, 'beyond Market St ' + tag, 1); return; }
    const gone = (za, zb, zc) => !row && ((za > MV.north && zb > MV.north && zc > MV.north) || (za < MV.south && zb < MV.south && zc < MV.south));
    z0 += dz; z1 += dz;
    const size = Math.hypot(x1 - x0, y1 - y0, z1 - z0), O = R.out, inR = !(x1 < R.x0 || x0 > R.x1 || z1 < R.z0 || z0 > R.z1);
    const nt = (count === Infinity || count == null ? (idx ? idx.count : P.count) : count) / 3;
    if (y1 < -1.2 || y0 > 140 || !(inR || (size > O.size && nt <= O.tris && !(x1 < O.x0 || x0 > O.x1 || z1 < O.z0 || z0 > O.z1)))) return;
    const A = g.attributes, hasUv = !!(A.uv && m.map), gl = A.aGlow, mi = mat(m, hasUv, gl), cellX = Math.floor(((x0 + x1) / 2) / R.cell), cellZ = Math.floor(((z0 + z1) / 2) / R.cell), big = size > R.cell * 1.5, key = mi + '|' + (big ? 'big' : cellX + ',' + cellZ);
    let c = chunks.get(key); if (!c) chunks.set(key, c = { m: mi, P: buf(Float32Array), N: buf(Float32Array), U: hasUv ? buf(Float32Array) : null, C: buf(Float32Array), I: buf(Uint32Array), T: buf(Uint32Array), n: 0, col: false });
    const N = A.normal, U = A.uv, C = A.color, aC = A.aCol, base = c.n, flip = mw.determinant() < 0; nm.getNormalMatrix(mw);
    // a point of it: where (the cart's metres), which way it faces, its place on its picture, its colour and glow
    const rec = (i) => { v.fromBufferAttribute(P, i).applyMatrix4(mw); const o = [(v.x - cx) / M, (v.y - gy) / M + dy, (v.z - cz) / M + dz, 0, 1, 0, 0, 0, 1, 1, 1, gl ? gl.getX(i) : 0];
      if (N) { n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); o[3] = n.x; o[4] = n.y; o[5] = n.z; } if (c.U) { o[6] = U.getX(i); o[7] = U.getY(i); }
      if (C && m.vertexColors) { o[8] = C.getX(i); o[9] = C.getY(i); o[10] = C.getZ(i); } if (aC) { o[8] *= aC.getX(i); o[9] *= aC.getY(i); o[10] *= aC.getZ(i); } if (tint) { o[8] *= tint.r; o[9] *= tint.g; o[10] *= tint.b; } return o; };
    const push = (o) => { c.P.add(o[0]); c.P.add(o[1]); c.P.add(o[2]); c.N.add(o[3]); c.N.add(o[4]); c.N.add(o[5]); if (c.U) { c.U.add(o[6]); c.U.add(o[7]); } if (o[8] !== 1 || o[9] !== 1 || o[10] !== 1) c.col = true; c.C.add(o[8]); c.C.add(o[9]); c.C.add(o[10]); c.C.add(o[11]); return c.n++; };
    // a triangle of it: of the piece itself when the piece is small, else of the part of it in its square of space
    const small = size <= SE.unit, parts = small ? null : new Map(); let whole = 0;
    const tri = (a, b, c3) => { c.I.add(a); c.I.add(b); c.I.add(c3); let id; const p = c.P.a;
      if (small) { if (!whole) whole = CL.push({ t: 0, tag, d: dWalk(x0, z0, x1, z1), m: mi }) - 1; id = whole; }
      else { const S = SE.part, gx = Math.floor((p[a * 3] + p[b * 3] + p[c3 * 3]) / 3 / S), gh = Math.floor((p[a * 3 + 1] + p[b * 3 + 1] + p[c3 * 3 + 1]) / 3 / S), gz = Math.floor((p[a * 3 + 2] + p[b * 3 + 2] + p[c3 * 3 + 2]) / 3 / S), k = gx + ',' + gh + ',' + gz; id = parts.get(k); if (!id) { id = CL.push({ t: 0, tag, d: dWalk(gx * S, gz * S, gx * S + S, gz * S + S), m: mi }) - 1; parts.set(k, id); } }
      CL[id].t++; c.T.add(id); };
    const cnt = vr ? vr[1] : P.count, s = start || 0, e = Math.min(idx ? idx.count : v0 + cnt, count === Infinity || count == null ? Infinity : s + count);
    const heavy = nt > 1500, F = heavy ? { x0: R.x0 - 20, x1: R.x1 + 20, z0: R.z0 - 20, z1: R.z1 + 20 } : O, out = (x, z) => x < F.x0 || x > F.x1 || z < F.z0 || z > F.z1;   // a thing that runs on out of sight is cut off there (sooner if it is many-faced)
    // what the market cuts off with a plane (a neighbouring section's copy, cut at this one's edge) is cut here the same way: each triangle against each plane, in the cart's metres
    const planes = (m.clippingPlanes || []).map((pl) => { const a = pl.normal.x, b = pl.normal.y, c3 = pl.normal.z; return [a, b, c3, (a * cx + b * gy + c3 * cz + pl.constant) / M - c3 * dz - b * dy]; }); if (planes.length && !row) planes.push([0, 0, -1, MV.north], [0, 0, 1, -MV.south]);
    if (planes.length) { const dist = (pl, o) => pl[0] * o[0] + pl[1] * o[1] + pl[2] * o[2] + pl[3], mix = (a, b, t) => a.map((x, k) => x + (b[k] - x) * t);
      for (let i = s; i + 2 < e; i += 3) { let poly = [0, 1, 2].map((k) => rec(idx ? idx.getX(i + k) : i + k)); if (poly.every((o) => out(o[0], o[2])) || gone(poly[0][2], poly[1][2], poly[2][2])) continue;
        for (const pl of planes) { const nx = []; for (let k = 0; k < poly.length; k++) { const a = poly[k], b = poly[(k + 1) % poly.length], da = dist(pl, a), db = dist(pl, b); if (da >= 0) nx.push(a); if ((da >= 0) !== (db >= 0)) nx.push(mix(a, b, da / (da - db))); } poly = nx; if (poly.length < 3) break; }
        if (poly.length < 3) continue; const ids = poly.map(push); for (let k = 1; k + 1 < ids.length; k++) { if (flip) tri(ids[0], ids[k + 1], ids[k]); else tri(ids[0], ids[k], ids[k + 1]); } } }
    else { for (let i = v0; i < v0 + cnt; i++) push(rec(i)); const far = (k) => out(c.P.a[(base + k) * 3], c.P.a[(base + k) * 3 + 2]);
      for (let i = s; i + 2 < e; i += 3) { const a = (idx ? idx.getX(i) : i) - v0, b2 = (idx ? idx.getX(i + 1) : i + 1) - v0, c2 = (idx ? idx.getX(i + 2) : i + 2) - v0; if (big && far(a) && far(b2) && far(c2)) continue;
        if (!row) { const za = c.P.a[(base + a) * 3 + 2], zb = c.P.a[(base + b2) * 3 + 2], zc = c.P.a[(base + c2) * 3 + 2], inK = (z) => z <= MV.north && z >= MV.south;
          if (!(inK(za) && inK(zb) && inK(zc))) { const src = [a, b2, c2].map((k) => rec(v0 + k)), cut = (poly, pls) => { for (const pl of pls) { const nx = []; for (let k = 0; k < poly.length; k++) { const p = poly[k], q2 = poly[(k + 1) % poly.length], da = pl[0] * p[2] + pl[1], db = pl[0] * q2[2] + pl[1]; if (da >= 0) nx.push(p); if ((da >= 0) !== (db >= 0)) nx.push(p.map((x, j) => x + (q2[j] - x) * (da / (da - db)))); } poly = nx; if (poly.length < 3) break; } return poly; };
            for (const [pls, mz, my] of [[[[-1, MV.north], [1, -MV.south]], 0, 0], [[[-1, MV.z1], [1, -(MV.z0 - 0.05)]], MV.dz, MV.dy]]) { const poly = cut(src, pls); if (poly.length < 3) continue; const ids = poly.map((p) => { const q2 = p.slice(); q2[1] += my; q2[2] += mz; return push(q2); }); for (let k = 1; k + 1 < ids.length; k++) { if (flip) tri(ids[0], ids[k + 1], ids[k]); else tri(ids[0], ids[k], ids[k + 1]); } }
            continue; } } if (flip) tri(base + a, base + c2, base + b2); else tri(base + a, base + b2, base + c2); } }
    // a front of the park's side: this piece's triangles that are of one of the chosen shops, turned round and stood across the street
    if (MV.shops.length && z1 >= MV.band[0] && z0 <= MV.band[1] && y1 > 0.06) { const made = new Map();
      for (let i = s; i + 2 < e; i += 3) { const ii = [0, 1, 2].map((k) => (idx ? idx.getX(i + k) : i + k)), R3 = ii.map(rec), mx = (R3[0][0] + R3[1][0] + R3[2][0]) / 3, mz = (R3[0][2] + R3[1][2] + R3[2][2]) / 3;
        if (mz < MV.band[0] || mz > MV.band[1] || Math.max(R3[0][1], R3[1][1], R3[2][1]) < 0.06) continue; const pi = MV.shops.findIndex((p) => mx >= p.x0 && mx < p.x1); if (pi < 0) continue; const p = MV.shops[pi];
        if (p.S - mx > MV.clear[0] && p.S - mx < MV.clear[1] && MV.pz2 - mz < MV.north - 0.3 && Math.min(R3[0][1], R3[1][1], R3[2][1]) < 4) continue;   // (clear of the cart)
        const ids = ii.map((vi, k) => { const key = vi * 64 + pi; let id = made.get(key); if (id == null) { const q2 = R3[k].slice(); q2[0] = p.S - q2[0]; q2[2] = MV.pz2 - q2[2]; q2[3] = -q2[3]; q2[5] = -q2[5]; id = push(q2); made.set(key, id); } return id; });
        if (flip) tri(ids[0], ids[2], ids[1]); else tri(ids[0], ids[1], ids[2]); } } };
  sc.traverse((q) => { if (!q.isMesh || q.isSkinnedMesh || !q.geometry || !q.geometry.attributes.position || !vis(q)) return; const g = q.geometry, A = g.attributes, ch = chain(q), tag = (q.name || '') + '<' + ch.split('<').slice(-3).join('<');
    if (A.bi || A.pidx || A.skinIndex || A.reg || q.userData.sky || q.userData.PM) { note(skipped, 'body ' + tag, 1); return; }
    if (!q.isInstancedMesh && moved(q)) { note(skipped, 'moving ' + tag, 1); return; }
    if (/ramen cart/.test(ch)) { if (!g.boundingBox) g.computeBoundingBox(); g.boundingBox.getCenter(v).applyMatrix4(q.matrixWorld); if (Math.hypot(v.x - cx, v.z - cz) < 6 * M) { note(skipped, 'the cart itself ' + tag, 1); return; } }   // (RAMEN has its own cart there)
    if (CARP.test(q.name + '<' + ch)) { q.getWorldPosition(v); if (!o.parked.some(([x, z]) => Math.hypot(B.XS(x) - v.x, B.ZS(z) - v.z) < 4 * M)) { note(skipped, 'a car not parked ' + tag, 1); return; } }   // a car is the street's only where the level file parks one
    if (UNDER.test(ch)) { note(skipped, 'the subway ' + tag, 1); return; }
    const mm = [].concat(q.material); if (mm.some((m) => !m || m.isShaderMaterial || m.visible === false || (m.blending === T.AdditiveBlending) || (m.transparent && m.opacity < 0.35 && !m.map))) { note(skipped, 'shader ' + tag + ' ' + (mm[0] && mm[0].type), 1); return; }
    const parts = mm.length > 1 && g.groups.length ? g.groups.map((G) => [mm[G.materialIndex], G.start, G.count]) : [[mm[0], g.drawRange.start, g.drawRange.count]];
    if (q.isBatchedMesh) { const n = q.instanceCount ?? (q._instanceInfo ? q._instanceInfo.length : 0), m = mm[0]; for (let i = 0; i < n; i++) { let ok = false; try { ok = q.getVisibleAt(i); } catch (e) { ok = false; } if (!ok) continue; const R0 = q.getGeometryRangeAt(q.getGeometryIdAt(i)); q.getMatrixAt(i, IM); WM.multiplyMatrices(q.matrixWorld, IM); let tint = null; if (q._colorsTexture) { try { q.getColorAt(i, ic); tint = ic; } catch (e) { tint = null; } }
        one(q, WM, g, m, g.index ? R0.indexStart : R0.vertexStart, g.index ? R0.indexCount : R0.vertexCount, tint, 'batched ' + tag, [R0.vertexStart, R0.vertexCount]); } return; }
    if (q.isInstancedMesh) { for (let i = 0; i < q.count; i++) { q.getMatrixAt(i, IM); WM.multiplyMatrices(q.matrixWorld, IM); if (Math.abs(WM.determinant()) < 1e-9) continue; let tint = null; if (q.instanceColor) { q.getColorAt(i, ic); tint = ic; } for (const [m, s, c] of parts) one(q, WM, g, m, s, c, tint, tag); } }
    else for (const [m, s, c] of parts) one(q, q.matrixWorld, g, m, s, c, null, tag); });
  // ---- what can be seen: every piece drawn in its own colour (its number), from each place an eye can be, six ways; a picture with holes lets through what its holes do, glass a part of what is behind it
  let all = 0; for (const c of chunks.values()) all += c.T.n;
  const seen = new Uint8Array(CL.length); let looks = 0, top = null;
  { const cv2 = document.createElement('canvas'), rn = new T.WebGLRenderer({ canvas: cv2, antialias: false, preserveDrawingBuffer: true }); rn.setPixelRatio(1); rn.setSize(16, 16, false); rn.toneMapping = T.NoToneMapping; rn.setClearColor(0x000000, 1);
    const rt = new T.WebGLRenderTarget(SE.px, SE.px, { magFilter: T.NearestFilter, minFilter: T.NearestFilter, generateMipmaps: false }), sc2 = new T.Scene(), white = new T.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
    const VS = 'attribute vec3 cid; uniform mat3 uvT; varying vec3 vC; varying vec2 vU; void main(){ vC = cid; vU = (uvT * vec3(uv, 1.0)).xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      FS = 'uniform sampler2D map; uniform float at, dz; varying vec3 vC; varying vec2 vU; void main(){ if (at > 0.0 && texture2D(map, vU).a < at) discard; if (dz > 0.5) { vec2 f = floor(gl_FragCoord.xy); if (mod(f.x + f.y * 2.0 + floor(vC.r * 255.0 + 0.5), 4.0) > 0.5) discard; } gl_FragColor = vec4(vC, 1.0); }';
    const idM = ML.map(({ q }) => { const t = q.map >= 0 ? TX[q.map].t : null; if (t) t.updateMatrix(); return new T.ShaderMaterial({ uniforms: { map: { value: t || white }, uvT: { value: t ? t.matrix.clone() : new T.Matrix3() }, at: { value: t ? q.at || 0 : 0 }, dz: { value: q.tr ? 1 : 0 } }, vertexShader: VS, fragmentShader: FS, side: q.side }); });
    const meshes = []; for (const c of chunks.values()) { const nt = c.T.n; if (!nt) continue; const P = new Float32Array(nt * 9), K = new Uint8Array(nt * 9), U = c.U ? new Float32Array(nt * 6) : null;
      for (let t = 0; t < nt; t++) { const id = c.T.a[t]; for (let k = 0; k < 3; k++) { const vi = c.I.a[t * 3 + k], w = t * 3 + k; P[w * 3] = c.P.a[vi * 3]; P[w * 3 + 1] = c.P.a[vi * 3 + 1]; P[w * 3 + 2] = c.P.a[vi * 3 + 2]; K[w * 3] = id & 255; K[w * 3 + 1] = (id >> 8) & 255; K[w * 3 + 2] = (id >> 16) & 255; if (U) { U[w * 2] = c.U.a[vi * 2]; U[w * 2 + 1] = c.U.a[vi * 2 + 1]; } } }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('cid', new T.BufferAttribute(K, 3, true)); if (U) g.setAttribute('uv', new T.BufferAttribute(U, 2)); g.computeBoundingSphere();
      const me = new T.Mesh(g, idM[c.m]); me.matrixAutoUpdate = false; sc2.add(me); meshes.push({ me, c, K }); }
    const eyes = []; for (let x = SE.xs[0]; x <= SE.xs[1] + 1e-6; x += SE.xs[2]) for (const z of SE.zs) { if (x > SE.cart[0] && x < SE.cart[2] && z > SE.cart[1] && z < SE.cart[3]) continue; for (const y of SE.ys) eyes.push([x, y, z]); }
    for (const x of SE.cook.xs) for (const z of SE.cook.zs) for (const y of SE.cook.ys) eyes.push([x, y, z]); for (const x of SE.stools.xs) for (const y of SE.stools.ys) eyes.push([x, y, SE.stools.z]);
    const cam = new T.PerspectiveCamera(90, 1, 0.05, 4000), WAYS = [[1, 0, 0, 0, 1, 0], [-1, 0, 0, 0, 1, 0], [0, 1, 0, 0, 0, 1], [0, -1, 0, 0, 0, 1], [0, 0, 1, 0, 1, 0], [0, 0, -1, 0, 1, 0]], px = new Uint8Array(SE.px * SE.px * 4), p32 = new Uint32Array(px.buffer);
    rn.setRenderTarget(rt);
    for (const [ex, ey, ez] of eyes) { for (const w of WAYS) { cam.position.set(ex, ey, ez); cam.up.set(w[3], w[4], w[5]); cam.lookAt(ex + w[0], ey + w[1], ez + w[2]); cam.updateMatrixWorld(true); rn.clear(); rn.render(sc2, cam); rn.readRenderTargetPixels(rt, 0, 0, SE.px, SE.px, px);
        for (let i = 0; i < p32.length; i++) { const id = p32[i] & 0xffffff; if (id) seen[id] = 1; } looks++; } await new Promise((r) => setTimeout(r, 0)); }
    // a picture from above: what is kept green, what is left out red, where eyes can be yellow (east to the right, the park at the bottom)
    if (o.top) { for (const { me, K } of meshes) { for (let i = 0; i < K.length; i += 3) { const id = K[i] | (K[i + 1] << 8) | (K[i + 2] << 16), s = 0.6 + 0.4 * (((id * 2654435761) >>> 0) % 97) / 97; if (seen[id]) { K[i] = 50 * s; K[i + 1] = 215 * s; K[i + 2] = 90 * s; } else { K[i] = 235 * s; K[i + 1] = 55 * s; K[i + 2] = 45 * s; } } me.geometry.attributes.cid.needsUpdate = true; me.material.uniforms.dz.value = 0; }
      const W = o.top, k = W.k, oc = new T.OrthographicCamera(W.x0, W.x1, -W.z0, -W.z1, 1, 2000); oc.position.set(0, 900, 0); oc.up.set(0, 0, -1); oc.lookAt(0, 0, 0); oc.updateMatrixWorld(true);
      const ln = new T.LineLoop(new T.BufferGeometry().setFromPoints([[WK.x0, WK.z0], [WK.x1, WK.z0], [WK.x1, WK.z1], [WK.x0, WK.z1]].map(([x, z]) => new T.Vector3(x, 300, z))), new T.LineBasicMaterial({ color: 0xffe040 })); sc2.add(ln);
      rn.setRenderTarget(null); rn.setSize(Math.round((W.x1 - W.x0) * k), Math.round((W.z1 - W.z0) * k), false); rn.setClearColor(0x101418, 1); rn.clear(); rn.render(sc2, oc); top = cv2.toDataURL('image/png'); }
    for (const { me } of meshes) me.geometry.dispose(); rt.dispose(); rn.dispose(); }
  // what is kept: the seen pieces' triangles, the materials and pictures they wear (each picture as small as its nearest wearer allows)
  const matD = new Map(); let nSeen = 0; for (let id = 1; id < CL.length; id++) { const k = CL[id]; if (seen[id]) { nSeen++; note(stat, k.tag, k.t); if (!(matD.get(k.m) <= k.d)) matD.set(k.m, k.d); } else note(skipped, 'not seen ' + k.tag, k.t); }
  const texD = new Map(); for (const [mi, d] of matD) for (const ti of [ML[mi].q.map, ML[mi].q.emap]) if (ti >= 0 && !(texD.get(ti) <= d)) texD.set(ti, d);
  const texAt = new Map(), texOut = []; for (const [ti, d] of [...texD].sort((a, b) => a[0] - b[0])) { texAt.set(ti, texOut.length); texOut.push(picture(TX[ti], d)); }
  const matAt = new Map(), matOut = []; for (const mi of [...matD.keys()].sort((a, b) => a - b)) { const q = { ...ML[mi].q }; q.map = q.map >= 0 ? texAt.get(q.map) : -1; q.emap = q.emap >= 0 ? texAt.get(q.emap) : -1; matAt.set(mi, matOut.length); matOut.push(q); }
  // the lamps (THE MARKET's own list of lights), where they stand
  const lights = D.LITE.recs.map((l) => { l.getWorldPosition(v); return { p: [(v.x - cx) / M, (v.y - gy) / M, (v.z - cz) / M], c: [l.color.r, l.color.g, l.color.b], i: l.userData.i0 || l.intensity, d: l.distance / M, spot: !!l.isSpotLight }; }).filter((l) => l.p[2] <= MV.north && l.p[2] >= MV.south).flatMap((l) => { const p = l.p[2] >= MV.band[0] && l.p[2] <= MV.band[1] && MV.shops.find((q2) => l.p[0] >= q2.x0 && l.p[0] < q2.x1); return p ? [l, { ...l, p: [p.S - l.p[0], l.p[1], MV.pz2 - l.p[2]] }] : [l]; }).filter((l) => l.p[0] > R.x0 && l.p[0] < R.x1 && l.p[2] > R.z0 && l.p[2] < R.z1 && l.p[1] > -0.5);
  const b64 = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const enc = (x) => Math.round(255 * (x <= 0.0031308 ? 12.92 * Math.max(0, x) : 1.055 * Math.pow(Math.min(1, x), 1 / 2.4) - 0.055));
  const out = []; let tris = 0;
  for (const c of chunks.values()) { const used = new Int32Array(c.n).fill(-1), I0 = []; let k = 0; for (let t = 0; t < c.T.n; t++) { if (!seen[c.T.a[t]]) continue; for (let j = 0; j < 3; j++) { const i = c.I.a[t * 3 + j]; if (used[i] < 0) used[i] = k++; I0.push(used[i]); } } if (!I0.length) continue;
    const fP = new Float32Array(k * 3), fN = new Float32Array(k * 3), fC = new Float32Array(k * 4), fU = c.U ? new Float32Array(k * 2) : null; for (let i = 0; i < c.n; i++) { const j = used[i]; if (j < 0) continue; for (let a = 0; a < 3; a++) { fP[j * 3 + a] = c.P.a[i * 3 + a]; fN[j * 3 + a] = c.N.a[i * 3 + a]; } for (let a = 0; a < 4; a++) fC[j * 4 + a] = c.C.a[i * 4 + a]; if (fU) { fU[j * 2] = c.U.a[i * 2]; fU[j * 2 + 1] = c.U.a[i * 2 + 1]; } }
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < fP.length; i++) { const a = i % 3; if (fP[i] < lo[a]) lo[a] = fP[i]; if (fP[i] > hi[a]) hi[a] = fP[i]; }
    const P = new Uint16Array(fP.length); for (let i = 0; i < fP.length; i++) { const a = i % 3; P[i] = Math.round(((fP[i] - lo[a]) / Math.max(1e-6, hi[a] - lo[a])) * 65535); }
    const N = new Int8Array(fN.length); for (let i = 0; i < fN.length; i++) N[i] = Math.round(fN[i] * 127);
    let U = null, ul = null, uh = null; if (fU) { ul = [1e9, 1e9]; uh = [-1e9, -1e9]; for (let i = 0; i < fU.length; i++) { const a = i % 2; if (fU[i] < ul[a]) ul[a] = fU[i]; if (fU[i] > uh[a]) uh[a] = fU[i]; } U = new Uint16Array(fU.length); for (let i = 0; i < fU.length; i++) { const a = i % 2; U[i] = Math.round(((fU[i] - ul[a]) / Math.max(1e-6, uh[a] - ul[a])) * 65535); } }
    let C = null, ck = 1; const glow = ML[c.m].q.glow; if (c.col || glow) { for (let i = 0; i < fC.length; i++) if (i % 4 < 3 && fC[i] > ck) ck = fC[i]; C = new Uint8Array(fC.length); for (let i = 0; i < fC.length; i++) C[i] = i % 4 < 3 ? enc(fC[i] / ck) : Math.round(255 * Math.min(1, Math.max(0, fC[i]))); }
    const I = k > 65535 ? new Uint32Array(I0) : new Uint16Array(I0); tris += I0.length / 3;
    out.push({ m: matAt.get(c.m), n: k, lo, hi, ul, uh, ck, i32: k > 65535, P: b64(P), N: b64(N), U: U ? b64(U) : null, C: C ? b64(C) : null, I: b64(I), ni: I0.length }); }
  const prof = { z: [], x: [] }; for (let z = 6; z >= -46; z -= 0.25) prof.z.push([z, +((D.ground(cx, cz + z * M) - gy) / M).toFixed(3)]); for (let x = -60; x <= 60; x += 0.5) prof.x.push([x, +((D.ground(cx + x * M, cz - 3 * M) - gy) / M).toFixed(3), +((D.ground(cx + x * M, cz - 12 * M) - gy) / M).toFixed(3)]);
  return { dy: MV.dy, unpainted, prof, frame: { cx, cz, gy, M, TL, tile: [o.cart.x, o.cart.y] }, mats: matOut, texs: texOut, chunks: out, lights, stat, skipped, tris, all, pieces: CL.length - 1, seen: nSeen, looks, top };
};

(async () => {
  await new Promise((res) => srv.listen(0, '127.0.0.1', res)); const base = 'http://127.0.0.1:' + srv.address().port, TL = 1.13, XS = -81.36 + TL * CART.x, ZS = 87.01 + TL * CART.y;
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } }); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
  await p.goto(`${base}/market.html?fresh=1&at=${XS.toFixed(2)},${ZS.toFixed(2)}&hour=13&view=first&cull=0&freepics=0&dither=0`); await p.waitForFunction('window.__started', null, { timeout: 900000 }); await p.waitForTimeout(+process.env.WAIT || 60000);
  const r = await p.evaluate(bake, { cart: { x: CART.x, y: CART.y }, REG, parked: (W.cars || []).map((c) => [c.x, c.y]), row: ROW, top: process.env.TOPDOWN ? { x0: REG.x0, x1: REG.x1, z0: REG.z0, z1: REG.z1, k: 6 } : null });
  await b.close(); srv.close();
  const top = (S, n) => Object.entries(S).sort((a, c) => c[1] - a[1]).slice(0, n).map(([k, t]) => t + ' ' + k).join('\n');
  console.log('row dy', r.dy, 'unpainted', r.unpainted, 'frame', JSON.stringify(r.frame), 'read', r.all, 'triangles in', r.pieces, 'pieces; seen', r.seen, 'pieces in', r.looks, 'looks; kept', r.tris, 'triangles', 'chunks', r.chunks.length, 'materials', r.mats.length, 'pictures', r.texs.length, 'lamps', r.lights.length);
  if (r.top) fs.writeFileSync(process.env.TOPDOWN, Buffer.from(r.top.split(',')[1], 'base64'));
  if (process.env.PROF) fs.writeFileSync(process.env.PROF, JSON.stringify({ ...r.prof, stat: r.stat, skipped: r.skipped }));
  if (LIST) { console.log('--- kept, by triangles\n' + top(r.stat, 90) + '\n--- left out\n' + top(r.skipped, 60)); return; }
  // corner.bin: every chunk's arrays and every picture (webp) end to end, each padded to 4 bytes; corner.json: where each lies
  const bufs = []; let off = 0; const put = (s) => { if (!s) return null; const d = Buffer.from(s, 'base64'), at = off; bufs.push(d); off += d.length; const pad = (4 - (off % 4)) % 4; if (pad) { bufs.push(Buffer.alloc(pad)); off += pad; } return [at, d.length]; };
  const chunks = r.chunks.map((c) => ({ m: c.m, n: c.n, ni: c.ni, i32: c.i32 ? 1 : 0, lo: c.lo.map((x) => +x.toFixed(3)), hi: c.hi.map((x) => +x.toFixed(3)), ul: c.ul && c.ul.map((x) => +x.toFixed(4)), uh: c.uh && c.uh.map((x) => +x.toFixed(4)), ck: +c.ck.toFixed(3), P: put(c.P), N: put(c.N), U: put(c.U), C: put(c.C), I: put(c.I) }));
  let pics = 0; const texs = r.texs.map((t) => { const { url, ...q } = t; q.at = put(url.split(',')[1]); pics += q.at[1]; return q; });
  const r3 = (a) => a.map((x) => +x.toFixed(3));
  fs.writeFileSync(path.join(OUT, 'corner.bin'), require('zlib').gzipSync(Buffer.concat(bufs), { level: 9 }));   // (gzipped: the page opens it)
  fs.writeFileSync(path.join(OUT, 'corner.json'), JSON.stringify({ v: 1, frame: { tile: r.frame.tile, at: r3([r.frame.cx, r.frame.cz]), M: +r.frame.M.toFixed(5) }, tris: r.tris, mats: r.mats.map((m) => ({ ...m, c: r3(m.c), e: m.e && r3(m.e) })), texs, chunks, lights: r.lights.map((l) => ({ p: r3(l.p), c: r3(l.c), i: +l.i.toFixed(2), d: +l.d.toFixed(1), spot: l.spot ? 1 : 0 })) }));
  const du = (f) => fs.statSync(path.join(OUT, f)).size; console.log('corner.bin', du('corner.bin'), 'of it pictures', pics, 'corner.json', du('corner.json'));
})();
