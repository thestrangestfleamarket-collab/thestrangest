// NO TWO SURFACES IN ONE PLACE (6 Nov 2026 rule): node tests/zfight.cjs [dist/market.html] [x,z ...]. Every drawn, solid face near each spot is checked against every other: two that lie in one plane (or nearer than the depth buffer can tell apart) and overlap would flicker; the check names them.
const { chromium } = require('playwright'), path = require('path');
// the scan, in the page: each solid face near you in the world's units, bucketed by its plane, then every two in one bucket that overlap
const SCAN = ({ R, EPS }) => { const THREE = __dbg.THREE, sc = window.__scene, me = __dbg.pos(), V = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], M = new THREE.Matrix4(), IM = new THREE.Matrix4(), T = [], meshes = new Set();
  const seen = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }, name = o => { const n = []; for (let p = o; p && p !== sc && n.length < 3; p = p.parent) if (p.name) n.push(p.name); return (n.join('<') || o.type) + '#' + o.id; };
  sc.traverse(o => { if (!o.isMesh || !seen(o) || !o.geometry || !o.geometry.attributes.position) return; const mats = [].concat(o.material); if (mats.every(m => !m || !m.visible || m.transparent && !m.depthWrite || m.depthTest === false || m.polygonOffset || m.colorWrite === false)) return;
    const g = o.geometry, P = g.attributes.position, I = g.index, n = I ? I.count : P.count, ds = mats.some(m => m && m.side === THREE.DoubleSide), K = o.isInstancedMesh ? o.count : 1; if (n > 600000) return;
    if (!g.boundingSphere) g.computeBoundingSphere(); o.updateWorldMatrix(true, false);
    for (let k = 0; k < K; k++) { M.copy(o.matrixWorld); if (o.isInstancedMesh) { o.getMatrixAt(k, IM); M.multiply(IM); } const c = g.boundingSphere.center.clone().applyMatrix4(M); if (Math.hypot(c.x - me[0], c.z - me[2]) > R + g.boundingSphere.radius * M.getMaxScaleOnAxis()) continue; meshes.add(o);
      const gr = g.groups && g.groups.length ? g.groups : [{ start: 0, count: n, materialIndex: 0 }];
      for (const G of gr) { const m = Array.isArray(o.material) ? o.material[G.materialIndex] : o.material; if (!m || !m.visible || m.transparent && !m.depthWrite || m.depthTest === false || m.polygonOffset || m.colorWrite === false) continue;
        for (let i = G.start; i + 2 < Math.min(n, G.start + G.count); i += 3) { for (let j = 0; j < 3; j++) V[j].fromBufferAttribute(P, I ? I.getX(i + j) : i + j).applyMatrix4(M);
          const cx = (V[0].x + V[1].x + V[2].x) / 3, cz = (V[0].z + V[1].z + V[2].z) / 3; if (Math.hypot(cx - me[0], cz - me[2]) > R) continue;
          const nv = new THREE.Vector3().subVectors(V[1], V[0]).cross(new THREE.Vector3().subVectors(V[2], V[0])), a2 = nv.length(); if (a2 < 1e-6) continue; nv.divideScalar(a2);
          T.push({ o, k, ds: m.side === THREE.DoubleSide, back: m.side === THREE.BackSide, p: V.map(v => v.clone()), n: nv, d: nv.dot(V[0]) }); } } } });
  // a plane's key: its normal and distance rounded, the face put in its own and the neighbouring distance buckets
  const B = new Map(), key = (n, d) => { let s = 1; if (Math.abs(n.x) > 1e-3 ? n.x < 0 : Math.abs(n.y) > 1e-3 ? n.y < 0 : n.z < 0) s = -1; return [Math.round(n.x * s * 50), Math.round(n.y * s * 50), Math.round(n.z * s * 50), Math.round(d * s / EPS)]; };
  T.forEach((t, i) => { const k = key(t.n, t.d), s = k.join(); (B.get(s) || B.set(s, []).get(s)).push(i); t.k = k; });
  const ov = (a, b) => { const n = a.n, ax = Math.abs(n.x) > .5 ? [1, 2] : Math.abs(n.y) > .5 ? [0, 2] : [0, 1], q = v => [v.getComponent(ax[0]), v.getComponent(ax[1])];
    let poly = a.p.map(q); const cl = b.p.map(q), ar = p => { let s = 0; for (let i = 0; i < p.length; i++) { const u = p[i], v = p[(i + 1) % p.length]; s += u[0] * v[1] - v[0] * u[1]; } return s / 2; }, sg = ar(cl) > 0 ? 1 : -1;
    for (let i = 0; i < 3 && poly.length; i++) { const A = cl[i], Bq = cl[(i + 1) % 3], ins = p => sg * ((Bq[0] - A[0]) * (p[1] - A[1]) - (Bq[1] - A[1]) * (p[0] - A[0])) > 1e-9, out = [];
      for (let j = 0; j < poly.length; j++) { const P = poly[j], Q = poly[(j + 1) % poly.length], pi = ins(P), qi = ins(Q); if (pi) out.push(P); if (pi !== qi) { const d1 = sg * ((Bq[0] - A[0]) * (P[1] - A[1]) - (Bq[1] - A[1]) * (P[0] - A[0])), d2 = sg * ((Bq[0] - A[0]) * (Q[1] - A[1]) - (Bq[1] - A[1]) * (Q[0] - A[0])), t = d1 / (d1 - d2); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); } } poly = out; }
    const nn = Math.max(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)); return poly.length > 2 ? Math.abs(ar(poly)) / nn : 0; };
  const hit = new Map();
  T.forEach((a, i) => { for (let dd = 0; dd <= 1; dd++) { const k = a.k.slice(); k[3] += dd; for (const j of B.get(k.join()) || []) { if (j <= i && dd === 0) continue; const b = T[j];
    const same = a.n.dot(b.n); if (Math.abs(same) < .9995 || Math.abs(a.d - same * b.d) > EPS) continue; const facing = same > 0 ? a.back === b.back : false; if (!facing && !a.ds && !b.ds) continue;
    const A = ov(a, b); if (A < 2e-3) continue; const id = name(a.o) + ' / ' + name(b.o), h = hit.get(id) || { a: name(a.o), b: name(b.o), area: 0, gap: 0, at: '' }; h.area += A; h.gap = Math.max(h.gap, Math.abs(a.d - same * b.d)); h.at = a.p[0].x.toFixed(1) + ',' + a.p[0].y.toFixed(2) + ',' + a.p[0].z.toFixed(1); hit.set(id, h); } } });
  const pairs = [...hit.values()].sort((x, y) => y.area - x.area).map(h => ({ ...h, area: +h.area.toFixed(3), gap: +h.gap.toFixed(4) }));
  return { tris: T.length, meshes: meshes.size, pairs }; };
// the spots: those given, or the whole section on a 50-unit grid, one start and a jump to each
const L = require('../data/world.json'), TILE = 33.9 / 30, xs = L.places.flatMap(p => [p.x0, p.x1]), ys = L.places.filter(p => p.y0 != null).flatMap(p => [p.y0, p.y1]).concat([L.park.y1]), GRID = [];
for (let x = Math.min(...xs) * TILE; x <= Math.max(...xs) * TILE + 25; x += 50) for (let z = Math.min(...ys) * TILE; z <= Math.max(...ys) * TILE + 25; z += 50) GRID.push(Math.round(x) + ',' + Math.round(z));
const SPOTS = process.argv.slice(3).length ? process.argv.slice(3) : GRID;
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const pg = await b.newPage({ viewport: { width: 900, height: 620 } });
  const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? 'ok  ' : 'FAIL') + ' ' + m); }, errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&npcwait=99&at=' + SPOTS[0], { waitUntil: 'commit', timeout: 240000 });
  await pg.waitForFunction(() => window.__started, null, { timeout: 400000 }); await pg.waitForTimeout(6000);
  const all = new Map(); let n = 0;
  for (const at of SPOTS) { const [x, z] = at.split(',').map(Number);
    await pg.evaluate(([x, z]) => { __dbg.UI.goTo(x, z, 0); }, [x, z]); await pg.waitForTimeout(4000);
    const r = await pg.evaluate(`(${SCAN})({R:30,EPS:.004})`); n += r.tris;
    for (const h of r.pairs) { const k = h.a + ' / ' + h.b; if (!all.has(k) || all.get(k).area < h.area) all.set(k, h); } }
  const P = [...all.values()].sort((x, y) => y.area - x.area);
  ok(!P.length, SPOTS.length + ' spots, ' + n + ' faces: no two surfaces sharing a place' + (P.length ? ': ' + P.length + ' pairs\n  ' + P.slice(0, +(process.env.ZN || 40)).map(p => p.a + ' / ' + p.b + ' at ' + p.at + ' (' + p.area + ' m², ' + p.gap + ' apart)').join('\n  ') : ''));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'zfight: all good'); process.exit(fails.length ? 1 : 0); })();
