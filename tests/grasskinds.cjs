// THE GRASS KINDS CHECK: node tests/grasskinds.cjs dist/market.html. The nine grasses (GRASS) grow in patches over the park; each stands in its own shape near you (none in the flat ones), and its own wild flowers, mushrooms and butterflies come up in it; a grass painted in the landscape editor grows where it is painted.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=grasskinds::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=40,150&res=0&grass=all', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts in the park');
  if (st) {
    const g = await pg.evaluate(() => ({ ids: GRASS.K.map(k => k.id), full: GRASS.K.every(k => (k.paint || k.img) && Object.keys(k.flowers).length && k.bf.length && k.rare && Object.keys(k.mush).length), map: !!(GRASS.map && GRASS.map.m), ms: GRASS.ms }));
    ok(g.ids.join() === '34,33,32,29,30,08,04,01,03' && g.full, 'nine grass kinds, each with its look, wild flowers, butterflies (and a rare) and mushrooms: ' + g.ids.join());
    ok(g.map, 'the land is painted from a map of which kind grows where (painted in ' + g.ms + ' ms)');
    // each kind's middle: a spot in the park with the same kind five tiles round
    const spots = await pg.evaluate(() => { const T = 33.9 / 30, P = PARK, o = {}; for (let y = P.y0 + 12; y < P.y1 - 12; y += 3) for (let x = P.x0 + 12; x < P.x1 - 12; x += 3) { if (P.path && P.path(x, y)) continue; const wx = SHARED.BOD.XS(x + P.ox), wz = SHARED.BOD.ZS(y + P.oy), k = GRASS.at(wx / T, wz / T);
      if ([[5, 0], [-5, 0], [0, 5], [0, -5]].every(([u, v]) => GRASS.at(wx / T + u, wz / T + v) === k) && !o[k.id]) o[k.id] = [wx, wz]; } return o; });
    ok(Object.keys(spots).length >= 6, 'the park grows at least six of the kinds: ' + Object.keys(spots).join());
    const tally = { tufts: 0, off: 0, flatTufts: 0, fl: [], mu: [], bf: [] };
    for (const id of Object.keys(spots)) {
      await pg.evaluate(([x, z]) => __dbg.UI.goTo(x, z, SHARED.py), spots[id]); await pg.waitForTimeout(7000);
      const r = await pg.evaluate(() => { const T = 33.9 / 30, o = { n: 0, off: 0, flat: 0 }; for (const me of TUFTS.meshes) { const A = me.instanceMatrix.array; for (let i = 0; i < me.count; i++) { const k = GRASS.at(A[i * 16 + 12] / T, A[i * 16 + 14] / T); o.n++; if (k.shape !== me.userData.shape) o.off++; if (!k.shape) o.flat++; } }
        const kin = (x, z) => GRASS.at(x / T, z / T), near = (x, z, f) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([u, v]) => f(kin(x + u * T, z + v * T)));
        o.fl = GARDEN.spots().map(([k, x, z]) => near(x, z, K => k in K.flowers)); o.mu = FORAGE.spots().map(([k, x, z]) => near(x, z, K => k in K.mush)); o.bf = BFLY.spots().map(([n, x, z]) => near(x, z, K => K.bf.includes(n) || K.rare === n)); return o; });
      tally.tufts += r.n; tally.off += r.off; tally.flatTufts += r.flat; tally.fl.push(...r.fl); tally.mu.push(...r.mu); tally.bf.push(...r.bf);
    }
    ok(tally.tufts > 1000 && tally.off / tally.tufts < .03, 'the grass near you stands in its own kind\'s shape (' + tally.off + ' of ' + tally.tufts + ' off, at the kinds\' edges)');
    ok(tally.flatTufts / Math.max(1, tally.tufts) < .03, 'none stands in the flat kinds (pixel meadow, mown lawn): ' + tally.flatTufts);
    const share = a => a.length ? a.filter(Boolean).length / a.length : 1;
    ok(tally.fl.length > 0 && share(tally.fl) >= .95, 'wild flowers come up in the park, each its grass\'s own (' + tally.fl.filter(Boolean).length + ' of ' + tally.fl.length + ')');
    ok(share(tally.mu) >= .95, 'mushrooms come up by their grass\'s odds (' + tally.mu.filter(Boolean).length + ' of ' + tally.mu.length + ')');
    ok(share(tally.bf) >= .95, 'butterflies on the lawn are their grass\'s own or its rare (' + tally.bf.filter(Boolean).length + ' of ' + tally.bf.length + ')');
    // the landscape editor paints a grass: a box of leaf clumps (or round tufts) where you stand
    const pr = await pg.evaluate(async () => { const T = 33.9 / 30, x = W3.group.position.x, z = W3.group.position.z, was = GRASS.at(x / T, z / T), k = GRASS.of[was.id === '04' ? '33' : '04'];
      __dbg.LAND.paint({ x0: x - 8 * T, x1: x + 8 * T, z0: z - 8 * T, z1: z + 8 * T, y: SHARED.py || 0, t: 'gk:' + k.id }); await new Promise(r => setTimeout(r, 6000));
      const M = GRASS.map, W = Math.round(1 / M.v.z), mi = Math.floor(x / T) - M.v.x, mj = Math.floor(z / T) - M.v.y, o = { k: k.id, at: GRASS.at(x / T, z / T).id, map: M.m.image.data[mj * W + mi], want: k.i, n: 0, off: 0 };
      for (const me of TUFTS.meshes) { const A = me.instanceMatrix.array; for (let i = 0; i < me.count; i++) { const tx = A[i * 16 + 12], tz = A[i * 16 + 14]; if (Math.abs(tx - x) > 7 * T || Math.abs(tz - z) > 7 * T) continue; o.n++; if (me.userData.shape !== k.shape) o.off++; } }
      o.fl = GARDEN.spots().filter(([f, fx, fz]) => Math.abs(fx - x) < 7 * T && Math.abs(fz - z) < 7 * T).every(([f]) => f in k.flowers); return o; });
    ok(pr.at === pr.k && pr.map === pr.want, 'a grass painted in the landscape editor grows there (' + pr.k + '), the ground\'s kind map with it');
    ok(pr.n > 100 && pr.off === 0 && pr.fl, 'the standing grass and wild flowers in the painted patch are the painted grass\'s (' + pr.n + ' tufts, ' + pr.off + ' off)');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all grass kind checks passed');
  process.exit(fails.length ? 1 : 0);
})();
