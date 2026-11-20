// THE MARKET's copy of RAMEN's cart: node tools/ramen-cart.cjs [--list]  (after node tools/sushi.cjs; PWCHROME the browser)  ->  data/ramencart.json
// opens dist/ramen.html, reads the cart as it stands there (its frame, roof, counter, signs, lanterns and what is left on it; not the cook, the loose small things' finest detail or anything that moves) and bakes it into one mesh in the cart's own metres: each point its colour and how much it shines at night, the written things (the signs, the curtain, the boards) on one picture
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist'), LIST = process.argv.includes('--list');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp' };
const srv = require('http').createServer((q, r) => { const f = path.join(DIST, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(DIST) || q.method !== 'GET') { r.writeHead(404); return r.end(); } fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });

const bake = () => {
  const T = G.debug.THREE, B = new T.Box3(), v = new T.Vector3(), n = new T.Vector3(), nm = new T.Matrix3(), M4 = new T.Matrix4(), col = new T.Color();
  G.itemRoot.visible = true; G.scene.updateMatrixWorld(true);
  const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)), enc = (x) => Math.round(255 * (x <= 0.0031308 ? 12.92 * Math.max(0, x) : 1.055 * Math.pow(Math.min(1, x), 1 / 2.4) - 0.055));
  // a picture's own colour, all of it together (a surface laid by the metre is one colour from the street)
  const cv = document.createElement('canvas'); cv.width = cv.height = 16; const cg = cv.getContext('2d', { willReadFrequently: true }), avgOf = new Map();
  const avg = (t) => { if (!t || !t.image) return [1, 1, 1]; if (avgOf.has(t.uuid)) return avgOf.get(t.uuid); let o = [1, 1, 1]; try { cg.clearRect(0, 0, 16, 16); cg.drawImage(t.image, 0, 0, 16, 16); const d = cg.getImageData(0, 0, 16, 16).data; let r = 0, g = 0, b = 0, a = 0; for (let i = 0; i < d.length; i += 4) { const k = d[i + 3] / 255; r += lin(d[i] / 255) * k; g += lin(d[i + 1] / 255) * k; b += lin(d[i + 2] / 255) * k; a += k; } if (a > 0) o = [r / a, g / a, b / a]; } catch (e) { o = [1, 1, 1]; } avgOf.set(t.uuid, o); return o; };
  // what is written (a canvas on a flat board) keeps its picture: all of them on one sheet
  const AT = document.createElement('canvas'); AT.width = AT.height = 1024; const ag = AT.getContext('2d'); ag.fillStyle = '#fff'; ag.fillRect(0, 0, 8, 8); let ax = 10, ay = 0, ah = 0; const slot = new Map();
  const pic = (m) => m.map || m.emissiveMap, written = (o, m) => { const t = pic(m), im = t && t.image; return !!(im && im.getContext && im.width >= 128 && o.geometry.attributes.uv && o.geometry.attributes.position.count <= 900 && !/worldPosition|vWorld/.test(m.onBeforeCompile.toString())); };
  const place = (t) => { if (slot.has(t.uuid)) return slot.get(t.uuid); const im = t.image, k = Math.min(1, 300 / Math.max(im.width, im.height)), w = Math.max(8, Math.round(im.width * k)), h = Math.max(8, Math.round(im.height * k)); if (ax + w + 2 > 1024) { ax = 0; ay += ah + 2; ah = 0; } if (ay + h > 1024) { slot.set(t.uuid, null); return null; } ag.drawImage(im, ax, ay, w, h); const s = [ax, ay, w, h]; ax += w + 2; ah = Math.max(ah, h); slot.set(t.uuid, s); return s; };
  const P = [], N = [], C = [], U = [], I = [], stat = {}, skipped = {}, all = [], meshes = [], BUDGET = 16000; let nv = 0;
  const one = (o, mw, tag) => { const g = o.geometry, A = g.attributes, Pp = A.position; if (!Pp) return; const mm = [].concat(o.material), m = mm[0]; if (!m || m.visible === false) return;
    B.makeEmpty(); for (let i = 0; i < Pp.count; i++) B.expandByPoint(v.fromBufferAttribute(Pp, i).applyMatrix4(mw));
    if (!(B.min.x > -2.4 && B.max.x < 2.4 && B.min.z > -2.3 && B.max.z < 2.62 && B.min.y > -0.06 && B.max.y < 5.6)) return;
    const diag = B.min.distanceTo(B.max), nt = (g.index ? g.index.count : Pp.count) / 3;
    if (m.blending === T.AdditiveBlending || (m.transparent && m.opacity < 0.5) || m.isShaderMaterial || m.isSpriteMaterial) { skipped['clear ' + tag] = (skipped['clear ' + tag] || 0) + nt; return; }
    if (diag < 0.06 || nt > 6000) { skipped['fine ' + tag] = (skipped['fine ' + tag] || 0) + nt; return; }
    all.push({ o, mw: mw.clone(), tag, nt, k: nt / (diag * diag) }); };
  const top = (o) => { let q = o, last = o; while (q.parent && q.parent !== G.scene) { last = q; q = q.parent; } return (q.name || q.type) + '/' + (last.name || last.type); };
  G.scene.traverse((o) => { if (!o.isMesh || o.isSkinnedMesh || !o.geometry || !vis(o) || o.userData.dyn) return; let p = o; for (; p; p = p.parent) if (p === G.peopleRoot) return; const tag = top(o);
    if (o.isInstancedMesh) { for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M4); M4.premultiply(o.matrixWorld); one(o, M4, tag); } } else one(o, o.matrixWorld, tag); });
  // the plain large things first, then the finer, as many as the market's frame affords
  { let t = 0; all.sort((a, b) => a.k - b.k); for (const m of all) { if (t + m.nt > BUDGET) { skipped['over ' + m.tag] = (skipped['over ' + m.tag] || 0) + m.nt; continue; } t += m.nt; meshes.push(m); } }
  // by day, then lit: what a material shines with at night
  const day = new Map(); for (const { o } of meshes) for (const m of [].concat(o.material)) if (!day.has(m)) day.set(m, { c: m.color ? [m.color.r, m.color.g, m.color.b] : [1, 1, 1] });
  try { G.cart.open = true; G.cart.lamps(1); } catch (e) { /* as it is */ }
  const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  for (const [m, d] of day) { const e = m.emissive ? lum(m.emissive.r, m.emissive.g, m.emissive.b) * (m.emissiveIntensity || 0) : 0, a = avg(m.emissiveMap || m.map), base = Math.max(0.04, lum(d.c[0] * a[0], d.c[1] * a[1], d.c[2] * a[2])); d.glow = m.isMeshBasicMaterial ? (lum(d.c[0], d.c[1], d.c[2]) > 0.25 ? 0.6 : 0) : Math.min(1, e / base / 1.6); if (m.emissive && e > 0.05 && base < 0.08) d.c = [m.emissive.r * 0.5, m.emissive.g * 0.5, m.emissive.b * 0.5]; }
  for (const { o, mw, tag, nt } of meshes) { const g = o.geometry, A = g.attributes, Pp = A.position, Nn = A.normal, Uu = A.uv, Cc = A.color, mm = [].concat(o.material), flip = mw.determinant() < 0; nm.getNormalMatrix(mw);
    const groups = mm.length > 1 && g.groups.length ? g.groups : [{ start: 0, count: Infinity, materialIndex: 0 }], base = nv, idx = g.index;
    // (a mesh of several materials: each point takes the first group's that uses it)
    const mOf = new Array(Pp.count).fill(null); for (const G0 of groups) { const m = mm[G0.materialIndex], e = Math.min(idx ? idx.count : Pp.count, G0.start + G0.count); for (let i = G0.start; i < e; i++) { const k = idx ? idx.getX(i) : i; if (!mOf[k]) mOf[k] = m; } }
    for (let i = 0; i < Pp.count; i++) { const m = mOf[i] || mm[0], d = day.get(m), wr = written(o, m), s = wr ? place(pic(m)) : null, a = s ? [1, 1, 1] : avg(m.map);
      v.fromBufferAttribute(Pp, i).applyMatrix4(mw); P.push(v.x, v.y, v.z); if (Nn) { n.fromBufferAttribute(Nn, i).applyMatrix3(nm).normalize(); N.push(n.x, n.y, n.z); } else N.push(0, 1, 0);
      let r = d.c[0] * a[0], gg = d.c[1] * a[1], b = d.c[2] * a[2]; if (s && !m.map) r = gg = b = 1; if (Cc && m.vertexColors) { r *= Cc.getX(i); gg *= Cc.getY(i); b *= Cc.getZ(i); } C.push(enc(Math.min(1, r)), enc(Math.min(1, gg)), enc(Math.min(1, b)), Math.round(255 * (d.glow || 0)));
      if (s) { const t = pic(m), u = Uu.getX(i) * t.repeat.x + t.offset.x, w = Uu.getY(i) * t.repeat.y + t.offset.y; U.push((s[0] + Math.min(1, Math.max(0, u)) * s[2]) / 1024, 1 - (s[1] + (1 - Math.min(1, Math.max(0, w))) * s[3]) / 1024); } else U.push(4 / 1024, 1 - 4 / 1024); }
    const e = idx ? idx.count : Pp.count; for (let i = 0; i + 2 < e; i += 3) { const a = idx ? idx.getX(i) : i, b = idx ? idx.getX(i + 1) : i + 1, c = idx ? idx.getX(i + 2) : i + 2; if (flip) I.push(base + a, base + c, base + b); else I.push(base + a, base + b, base + c); }
    nv += Pp.count; stat[tag] = (stat[tag] || 0) + nt; }
  const lights = []; G.scene.traverse((o) => { if (o.isPointLight || o.isSpotLight) { o.getWorldPosition(v); if (Math.abs(v.x) < 2.5 && v.z > -2.5 && v.z < 2 && v.y < 3.5 && o.intensity > 0) lights.push({ p: v.toArray().map((x) => +x.toFixed(2)), c: o.color.getHex(), i: +o.intensity.toFixed(2), d: o.distance }); } });
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i++) { const a = i % 3; if (P[i] < lo[a]) lo[a] = P[i]; if (P[i] > hi[a]) hi[a] = P[i]; }
  const b64 = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const q = new Uint16Array(P.length); for (let i = 0; i < P.length; i++) { const a = i % 3; q[i] = Math.round(((P[i] - lo[a]) / (hi[a] - lo[a])) * 65535); }
  const used = Math.min(1024, ay + ah + 2), out = document.createElement('canvas'); out.width = 1024; out.height = used <= 512 ? 512 : 1024; out.getContext('2d').drawImage(AT, 0, 0);
  const vs = out.height / 1024; if (vs !== 1) for (let i = 1; i < U.length; i += 2) U[i] = 1 - (1 - U[i]) / vs;
  return { n: nv, tris: I.length / 3, lo: lo.map((x) => +x.toFixed(4)), hi: hi.map((x) => +x.toFixed(4)), p: b64(q), c: b64(Uint8Array.from(C)), u: b64(Uint16Array.from(U, (x) => Math.round(Math.min(1, Math.max(0, x)) * 65535))), i: b64(nv > 65535 ? Uint32Array.from(I) : Uint16Array.from(I)), i32: nv > 65535 ? 1 : 0,
    atlas: out.toDataURL('image/webp', 0.86), seats: G.cart.seatSpots.map((s) => s.toArray().map((x) => +x.toFixed(2))), lights, stat, skipped };
};

(async () => {
  await new Promise((res) => srv.listen(0, '127.0.0.1', res)); const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } }); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 200)));
  await p.goto('http://127.0.0.1:' + srv.address().port + '/ramen.html?desktop&nopost'); await p.waitForFunction('window.G && G.debug', null, { timeout: 600000 }); await p.waitForFunction('G.till && G.till.ready', null, { timeout: 180000 }).catch(() => { }); await p.waitForTimeout(8000);
  const r = await p.evaluate(bake); await b.close(); srv.close();
  const top = (S) => Object.entries(S).sort((a, c) => c[1] - a[1]).slice(0, 40).map(([k, t]) => Math.round(t) + ' ' + k).join('\n');
  console.log('points', r.n, 'triangles', r.tris, 'lights', JSON.stringify(r.lights), 'seats', JSON.stringify(r.seats)); console.log('--- kept\n' + top(r.stat) + '\n--- left out\n' + top(r.skipped));
  if (LIST) return; const { stat, skipped, ...out } = r; out.note = "RAMEN's cart as THE MARKET draws it at the Market St and West St corner (tools/ramen-cart.cjs): one mesh in metres, the cook's side toward +z";
  const s = JSON.stringify(out); fs.writeFileSync(path.join(ROOT, 'data/ramencart.json'), s); console.log('data/ramencart.json', s.length, 'bytes, of them the picture', r.atlas.length);
})();
