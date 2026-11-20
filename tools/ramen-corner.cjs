// bakes RAMEN's street from THE MARKET: node tools/ramen-corner.cjs [--list]  (after SKIP=g python3 build.py; PWCHROME the browser)
// opens dist/market.html at the cart's corner (data/world.json ramen), reads every still thing drawn round it out of the page (its points, colours, pictures, where its lamps are) into the cart's own metres, and writes data/sushi/corner.json and corner.bin (the points and the pictures, gzipped); run it again when the map there changes
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist'), OUT = path.join(ROOT, 'data/sushi'), LIST = process.argv.includes('--list');
const W = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/world.json'), 'utf8')), CART = W.ramen || { x: -18, y: -41.3 };
// what is kept, in metres from the cart: everything close, only larger things farther off, only buildings and ground at the edge of sight
const REG = { x0: -100, x1: 120, z0: -80, z1: 100, near: 34, mid: 70, midSize: 1.6, farSize: 5, farTris: 12, cell: 44, tex: 512, dense: [50, 150], out: { x0: -230, x1: 260, z0: -170, z1: 230, size: 16, tris: 320 }, park: { x: -4.6, z: 3.1, low: 1.35 } };
const srv = require('http').createServer((q, r) => { const f = path.join(DIST, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });

// ---- in the page ----
const bake = async (o) => {
  const D = __dbg, T = D.THREE, sc = D.scene, TL = D.cv().TILE, M = TL / 0.84, B = D.MAPK.BOD, cx = B.XS(o.cart.x), cz = B.ZS(o.cart.y), gy = D.ground(cx, cz), R = o.REG;
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
  const tex = (t, d) => { if (!t) return -1; if (!t.image) { note(skipped, 'a picture gone', 1); return -1; } let i = texs.get(t.uuid); if (i == null) { i = TX.push({ t, d }) - 1; texs.set(t.uuid, i); } else if (d < TX[i].d) TX[i].d = d; return i; };
  const picture = ({ t, d }) => { let url = null; const im = t.image, cap = d < R.near ? R.tex : d < R.mid ? R.tex / 2 : R.tex / 4;
    try { const w = im.width || im.videoWidth, h = im.height || im.videoHeight; if (!w) throw 0; const k = Math.min(1, cap / Math.max(w, h)); cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k)); const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
      if (im.data) { const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const dd = new ImageData(w, h), s = im.data, ch = s.length / (w * h); for (let i = 0; i < w * h; i++) { dd.data[i * 4] = s[i * ch]; dd.data[i * 4 + 1] = s[i * ch + (ch > 1 ? 1 : 0)]; dd.data[i * 4 + 2] = s[i * ch + (ch > 2 ? 2 : 0)]; dd.data[i * 4 + 3] = ch > 3 ? s[i * ch + 3] : 255; } c2.getContext('2d').putImageData(dd, 0, 0); g.drawImage(c2, 0, 0, cv.width, cv.height); }
      else g.drawImage(im, 0, 0, cv.width, cv.height);
      url = cv.toDataURL('image/webp', 0.82); } catch (e) { url = null; }
    return { url, w: cv.width, h: cv.height, rep: [t.repeat.x, t.repeat.y], off: [t.offset.x, t.offset.y], wrap: [t.wrapS, t.wrapT], flipY: t.flipY, rot: t.rotation, near: t.magFilter === T.NearestFilter, srgb: t.colorSpace === T.SRGBColorSpace }; };
  const mats = new Map(), ML = [];
  const mat = (m, hasUv, glow, d) => { const k = m.uuid + (glow ? 'g' : ''); if (mats.has(k)) { const i = mats.get(k), q = ML[i].q; if (q.map >= 0) tex(m.map, d); if (q.emap >= 0) tex(m.emissiveMap, d); return i; }
    const map = hasUv ? tex(m.map, d) : -1, e = m.emissive && m.emissiveIntensity > 0 && (m.emissive.r + m.emissive.g + m.emissive.b) > 0 ? [m.emissive.r * m.emissiveIntensity, m.emissive.g * m.emissiveIntensity, m.emissive.b * m.emissiveIntensity] : null;
    const q = { c: m.color ? [m.color.r, m.color.g, m.color.b] : [1, 1, 1], map, basic: !!m.isMeshBasicMaterial, tr: !!m.transparent && m.opacity < 0.99, op: m.opacity, at: m.alphaTest || (m.transparent && map >= 0 ? 0.4 : 0), side: m.side, vc: !!m.vertexColors, e, emap: e && hasUv ? tex(m.emissiveMap, d) : -1, glow: !!glow, fog: m.fog !== false };
    const key = JSON.stringify(q); let i = ML.findIndex((x) => x.key === key); if (i < 0) i = ML.push({ key, q }) - 1; mats.set(k, i); return i; };
  // the pieces, by material and by a square of ground: P points, N normals, U uv, C colour and glow, I index
  const ball = {}, chunks = new Map(), stat = {}, skipped = {}, v = new T.Vector3(), n = new T.Vector3(), nm = new T.Matrix3(), IM = new T.Matrix4(), WM = new T.Matrix4(), bb = new T.Box3(), ic = new T.Color();
  const note = (S, k, t) => { S[k] = (S[k] || 0) + t; };
  const one = (q, mw, g, m, start, count, tint, tag, thin, vr) => { const P = g.attributes.position, idx = g.index, v0 = vr ? vr[0] : 0;
    if (vr) { bb.makeEmpty(); for (let i = v0; i < v0 + vr[1]; i++) bb.expandByPoint(v.fromBufferAttribute(P, i)); bb.applyMatrix4(mw); } else { if (!g.boundingBox) g.computeBoundingBox(); bb.copy(g.boundingBox).applyMatrix4(mw); }
    const x0 = (bb.min.x - cx) / M, x1 = (bb.max.x - cx) / M, z0 = (bb.min.z - cz) / M, z1 = (bb.max.z - cz) / M, y0 = (bb.min.y - gy) / M, y1 = (bb.max.y - gy) / M;
    const size = Math.hypot(x1 - x0, y1 - y0, z1 - z0), O = R.out, inR = !(x1 < R.x0 || x0 > R.x1 || z1 < R.z0 || z0 > R.z1);
    const nt = (count === Infinity || count == null ? (idx ? idx.count : P.count) : count) / 3;
    if (y1 < -1.2 || y0 > 140 || !(inR || (size > O.size && nt <= O.tris && !(x1 < O.x0 || x0 > O.x1 || z1 < O.z0 || z0 > O.z1)))) return;
    const dx = Math.max(x0, Math.min(0, x1)), dz = Math.max(z0, Math.min(0, z1)), d = Math.hypot(dx, dz);
    if (d > R.dense[0] && nt > R.dense[1] * size) { note(skipped, 'many-faced and far ' + tag, 1); return; }   // (a parked car up the street, a shop's fittings: lost in the haze from the cart)
    if (thin && x0 > R.park.x && z0 > R.park.z && d > 12 && (thin.i++ % 3) === 2) return;   // the park's leaves, a third fewer
    if (!(d < R.near || (d < R.mid && size > R.midSize) || (size > R.farSize && (nt <= R.farTris * size || y1 - y0 < 3)))) { note(skipped, 'small ' + tag, 1); return; }   // far off only what is large and plain
    if (x0 > R.park.x && z0 > R.park.z && y1 < R.park.low && size < 30) { note(skipped, 'low behind the wall ' + tag, 1); return; }   // the park's grass and flowers are behind its wall
    const A = g.attributes, hasUv = !!(A.uv && m.map), gl = A.aGlow, mi = mat(m, hasUv, gl, d), cellX = Math.floor(((x0 + x1) / 2) / R.cell), cellZ = Math.floor(((z0 + z1) / 2) / R.cell), big = size > R.cell * 1.5, key = mi + '|' + (big ? 'big' : cellX + ',' + cellZ);
    let c = chunks.get(key); if (!c) chunks.set(key, c = { m: mi, P: [], N: [], U: hasUv ? [] : null, C: [], I: [], n: 0, col: false });
    const N = A.normal, U = A.uv, C = A.color, aC = A.aCol, base = c.n, flip = mw.determinant() < 0; nm.getNormalMatrix(mw);
    // a point of it: where (the cart's metres), which way it faces, its place on its picture, its colour and glow
    const rec = (i) => { v.fromBufferAttribute(P, i).applyMatrix4(mw); const o = [(v.x - cx) / M, (v.y - gy) / M, (v.z - cz) / M, 0, 1, 0, 0, 0, 1, 1, 1, gl ? gl.getX(i) : 0];
      if (N) { n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); o[3] = n.x; o[4] = n.y; o[5] = n.z; } if (c.U) { o[6] = U.getX(i); o[7] = U.getY(i); }
      if (C && m.vertexColors) { o[8] = C.getX(i); o[9] = C.getY(i); o[10] = C.getZ(i); } if (aC) { o[8] *= aC.getX(i); o[9] *= aC.getY(i); o[10] *= aC.getZ(i); } if (tint) { o[8] *= tint.r; o[9] *= tint.g; o[10] *= tint.b; } return o; };
    const push = (o) => { c.P.push(o[0], o[1], o[2]); c.N.push(o[3], o[4], o[5]); if (c.U) c.U.push(o[6], o[7]); if (o[8] !== 1 || o[9] !== 1 || o[10] !== 1) c.col = true; c.C.push(o[8], o[9], o[10], o[11]); return c.n++; };
    const cnt = vr ? vr[1] : P.count, s = start || 0, e = Math.min(idx ? idx.count : v0 + cnt, count === Infinity || count == null ? Infinity : s + count);
    const heavy = nt > 1500, F = heavy ? { x0: R.x0 - 20, x1: R.x1 + 20, z0: R.z0 - 20, z1: R.z1 + 20 } : O, out = (x, z) => x < F.x0 || x > F.x1 || z < F.z0 || z > F.z1; let kept = 0;   // a thing that runs on out of sight is cut off there (sooner if it is many-faced)
    // what the market cuts off with a plane (a neighbouring section's copy, cut at this one's edge) is cut here the same way: each triangle against each plane, in the cart's metres
    const planes = (m.clippingPlanes || []).map((pl) => { const a = pl.normal.x, b = pl.normal.y, c3 = pl.normal.z; return [a, b, c3, (a * cx + b * gy + c3 * cz + pl.constant) / M]; });
    if (planes.length) { const dist = (pl, o) => pl[0] * o[0] + pl[1] * o[1] + pl[2] * o[2] + pl[3], mix = (a, b, t) => a.map((x, k) => x + (b[k] - x) * t);
      for (let i = s; i + 2 < e; i += 3) { let poly = [0, 1, 2].map((k) => rec(idx ? idx.getX(i + k) : i + k)); if (poly.every((o) => out(o[0], o[2]))) continue;
        for (const pl of planes) { const nx = []; for (let k = 0; k < poly.length; k++) { const a = poly[k], b = poly[(k + 1) % poly.length], da = dist(pl, a), db = dist(pl, b); if (da >= 0) nx.push(a); if ((da >= 0) !== (db >= 0)) nx.push(mix(a, b, da / (da - db))); } poly = nx; if (poly.length < 3) break; }
        if (poly.length < 3) continue; const ids = poly.map(push); for (let k = 1; k + 1 < ids.length; k++) { kept++; if (flip) c.I.push(ids[0], ids[k + 1], ids[k]); else c.I.push(ids[0], ids[k], ids[k + 1]); } } }
    else { for (let i = v0; i < v0 + cnt; i++) push(rec(i)); const far = (k) => out(c.P[(base + k) * 3], c.P[(base + k) * 3 + 2]);
      for (let i = s; i + 2 < e; i += 3) { const a = (idx ? idx.getX(i) : i) - v0, b2 = (idx ? idx.getX(i + 1) : i + 1) - v0, c2 = (idx ? idx.getX(i + 2) : i + 2) - v0; if (big && far(a) && far(b2) && far(c2)) continue; kept++; if (flip) c.I.push(base + a, base + c2, base + b2); else c.I.push(base + a, base + b2, base + c2); } }
    note(stat, tag, kept); };
  sc.traverse((q) => { if (!q.isMesh || q.isSkinnedMesh || !q.geometry || !q.geometry.attributes.position || !vis(q)) return; const g = q.geometry, A = g.attributes, ch = chain(q), tag = (q.name || '') + '<' + ch.split('<').slice(-3).join('<');
    if (A.bi || A.pidx || A.skinIndex || A.reg || q.userData.sky || q.userData.PM) { note(skipped, 'body ' + tag, 1); return; }
    if (!q.isInstancedMesh && moved(q)) { note(skipped, 'moving ' + tag, 1); return; }
    if (CARP.test(q.name + '<' + ch)) { q.getWorldPosition(v); if (!o.parked.some(([x, z]) => Math.hypot(B.XS(x) - v.x, B.ZS(z) - v.z) < 4 * M)) { note(skipped, 'a car not parked ' + tag, 1); return; } }   // a car is the street's only where the level file parks one
    if (UNDER.test(ch)) { note(skipped, 'the subway ' + tag, 1); return; }
    const mm = [].concat(q.material); if (mm.some((m) => !m || m.isShaderMaterial || m.visible === false || (m.blending === T.AdditiveBlending) || (m.transparent && m.opacity < 0.35 && !m.map))) { note(skipped, 'shader ' + tag + ' ' + (mm[0] && mm[0].type), 1); return; }
    const parts = mm.length > 1 && g.groups.length ? g.groups.map((G) => [mm[G.materialIndex], G.start, G.count]) : [[mm[0], g.drawRange.start, g.drawRange.count]];
    if (q.isBatchedMesh) { const n = q.instanceCount ?? (q._instanceInfo ? q._instanceInfo.length : 0), m = mm[0]; for (let i = 0; i < n; i++) { let ok = false; try { ok = q.getVisibleAt(i); } catch (e) { ok = false; } if (!ok) continue; const R0 = q.getGeometryRangeAt(q.getGeometryIdAt(i)); q.getMatrixAt(i, IM); WM.multiplyMatrices(q.matrixWorld, IM); let tint = null; if (q._colorsTexture) { try { q.getColorAt(i, ic); tint = ic; } catch (e) { tint = null; } }
        one(q, WM, g, m, g.index ? R0.indexStart : R0.vertexStart, g.index ? R0.indexCount : R0.vertexCount, tint, 'batched ' + tag, null, [R0.vertexStart, R0.vertexCount]); } return; }
    if (q.isInstancedMesh) { let g2 = g; if (q.count > 60 && !g.attributes.uv === false || q.count > 60) { const P0 = g.attributes.position, nt0 = (g.index ? g.index.count : P0.count) / 3; if (nt0 === 80) { let r0 = 0, same = true; for (let i = 0; i < P0.count; i++) { const r = v.fromBufferAttribute(P0, i).length(); if (!i) r0 = r; else if (Math.abs(r - r0) > r0 * 0.02) { same = false; break; } } if (same) g2 = ball[r0.toFixed(4)] ||= new T.IcosahedronGeometry(r0, 0); } }   // a leaf ball of eighty faces is drawn with twenty, as the market's other trees are
      const thin = q.count > 900 && g.attributes.position.count < 80 ? { i: 0 } : null; for (let i = 0; i < q.count; i++) { q.getMatrixAt(i, IM); WM.multiplyMatrices(q.matrixWorld, IM); if (Math.abs(WM.determinant()) < 1e-9) continue; let tint = null; if (q.instanceColor) { q.getColorAt(i, ic); tint = ic; } for (const [m, s, c] of (g2 === g ? parts : [[mm[0], 0, Infinity]])) one(q, WM, g2, m, s, c, tint, tag, thin); } }
    else for (const [m, s, c] of parts) one(q, q.matrixWorld, g, m, s, c, null, tag); });
  // the lamps (THE MARKET's own list of lights), where they stand
  const lights = D.LITE.recs.map((l) => { l.getWorldPosition(v); return { p: [(v.x - cx) / M, (v.y - gy) / M, (v.z - cz) / M], c: [l.color.r, l.color.g, l.color.b], i: l.userData.i0 || l.intensity, d: l.distance / M, spot: !!l.isSpotLight }; }).filter((l) => l.p[0] > R.x0 && l.p[0] < R.x1 && l.p[2] > R.z0 && l.p[2] < R.z1 && l.p[1] > -0.5);
  const b64 = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const enc = (x) => Math.round(255 * (x <= 0.0031308 ? 12.92 * Math.max(0, x) : 1.055 * Math.pow(Math.min(1, x), 1 / 2.4) - 0.055));
  const out = []; let tris = 0;
  for (const c of chunks.values()) { if (!c.I.length) continue;
    { const used = new Int32Array(c.n).fill(-1); let k = 0; for (const i of c.I) if (used[i] < 0) used[i] = k++; if (k < c.n) { const P = new Array(k * 3), N = new Array(k * 3), C = new Array(k * 4), U = c.U ? new Array(k * 2) : null; for (let i = 0; i < c.n; i++) { const j = used[i]; if (j < 0) continue; for (let a = 0; a < 3; a++) { P[j * 3 + a] = c.P[i * 3 + a]; N[j * 3 + a] = c.N[i * 3 + a]; } for (let a = 0; a < 4; a++) C[j * 4 + a] = c.C[i * 4 + a]; if (U) { U[j * 2] = c.U[i * 2]; U[j * 2 + 1] = c.U[i * 2 + 1]; } } c.P = P; c.N = N; c.C = C; c.U = U; c.I = c.I.map((i) => used[i]); c.n = k; } }
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < c.P.length; i++) { const a = i % 3; if (c.P[i] < lo[a]) lo[a] = c.P[i]; if (c.P[i] > hi[a]) hi[a] = c.P[i]; }
    const P = new Uint16Array(c.P.length); for (let i = 0; i < c.P.length; i++) { const a = i % 3; P[i] = Math.round(((c.P[i] - lo[a]) / Math.max(1e-6, hi[a] - lo[a])) * 65535); }
    const N = new Int8Array(c.N.length); for (let i = 0; i < c.N.length; i++) N[i] = Math.round(c.N[i] * 127);
    let U = null, ul = null, uh = null; if (c.U) { ul = [1e9, 1e9]; uh = [-1e9, -1e9]; for (let i = 0; i < c.U.length; i++) { const a = i % 2; if (c.U[i] < ul[a]) ul[a] = c.U[i]; if (c.U[i] > uh[a]) uh[a] = c.U[i]; } U = new Uint16Array(c.U.length); for (let i = 0; i < c.U.length; i++) { const a = i % 2; U[i] = Math.round(((c.U[i] - ul[a]) / Math.max(1e-6, uh[a] - ul[a])) * 65535); } }
    let C = null, ck = 1; const glow = ML[c.m].q.glow; if (c.col || glow) { for (let i = 0; i < c.C.length; i++) if (i % 4 < 3 && c.C[i] > ck) ck = c.C[i]; C = new Uint8Array(c.C.length); for (let i = 0; i < c.C.length; i++) C[i] = i % 4 < 3 ? enc(c.C[i] / ck) : Math.round(255 * Math.min(1, Math.max(0, c.C[i]))); }
    const I = c.n > 65535 ? new Uint32Array(c.I) : new Uint16Array(c.I); tris += c.I.length / 3;
    out.push({ m: c.m, n: c.n, lo, hi, ul, uh, ck, i32: c.n > 65535, P: b64(P), N: b64(N), U: U ? b64(U) : null, C: C ? b64(C) : null, I: b64(I), ni: c.I.length }); }
  const prof = { z: [], x: [] }; for (let z = 6; z >= -46; z -= 0.25) prof.z.push([z, +((D.ground(cx, cz + z * M) - gy) / M).toFixed(3)]); for (let x = -60; x <= 60; x += 0.5) prof.x.push([x, +((D.ground(cx + x * M, cz - 3 * M) - gy) / M).toFixed(3), +((D.ground(cx + x * M, cz - 12 * M) - gy) / M).toFixed(3)]);
  return { unpainted, prof, frame: { cx, cz, gy, M, TL, tile: [o.cart.x, o.cart.y] }, mats: ML.map((x) => x.q), texs: TX.map(picture), chunks: out, lights, stat, skipped, tris };
};

(async () => {
  await new Promise((res) => srv.listen(0, '127.0.0.1', res)); const base = 'http://127.0.0.1:' + srv.address().port, TL = 1.13, XS = -81.36 + TL * CART.x, ZS = 87.01 + TL * CART.y;
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } }); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
  await p.goto(`${base}/market.html?fresh=1&at=${XS.toFixed(2)},${ZS.toFixed(2)}&hour=13&view=first&cull=0&freepics=0&dither=0`); await p.waitForFunction('window.__started', null, { timeout: 900000 }); await p.waitForTimeout(+process.env.WAIT || 60000);
  const r = await p.evaluate(bake, { cart: { x: CART.x, y: CART.y }, REG, parked: (W.cars || []).map((c) => [c.x, c.y]) });
  await b.close(); srv.close();
  const top = (S, n) => Object.entries(S).sort((a, c) => c[1] - a[1]).slice(0, n).map(([k, t]) => t + ' ' + k).join('\n');
  console.log('unpainted', r.unpainted, 'frame', JSON.stringify(r.frame), 'triangles', r.tris, 'chunks', r.chunks.length, 'materials', r.mats.length, 'pictures', r.texs.length, 'lamps', r.lights.length);
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
