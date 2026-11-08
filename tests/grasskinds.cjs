// THE GRASS KINDS CHECK: node tests/grasskinds.cjs dist/market.html. The six grasses (GRASS) grow in patches over the park; each stands in its own shape near you (none in the flat ones), and its own wild flowers, mushrooms and butterflies come up in it; a grass painted in the landscape editor grows where it is painted.
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
    const g = await pg.evaluate(() => ({ ids: GRASS.K.map(k => k.id), full: GRASS.K.every(k => (k.paint || k.img) && ['c', 'r', 's'].every(t => k.flowers[t] && k.bf[t] && k.mush[t])), map: !!(GRASS.map && GRASS.map.m), ms: GRASS.ms }));
    ok(g.ids.join() === '34,33,32,08,04,01' && g.full, 'six grass kinds (5 Nov 2026), each with its look and a common, a rare and a super-rare wild flower, butterfly and mushroom: ' + g.ids.join());
    ok(g.map, 'the land is painted from a map of which kind grows where (painted in ' + g.ms + ' ms)');
    // each kind's middle: a spot in the park with the same kind five tiles round
    const spots = await pg.evaluate(() => { const T = 33.9 / 30, P = PARK, o = {}; for (let y = P.y0 + 12; y < P.y1 - 12; y += 3) for (let x = P.x0 + 12; x < P.x1 - 12; x += 3) { if (P.path && P.path(x, y)) continue; const wx = SHARED.BOD.XS(x + P.ox), wz = SHARED.BOD.ZS(y + P.oy), k = GRASS.at(wx / T, wz / T);
      if ([[5, 0], [-5, 0], [0, 5], [0, -5]].every(([u, v]) => GRASS.at(wx / T + u, wz / T + v) === k) && !o[k.id]) o[k.id] = [wx, wz]; } return o; });
    ok(Object.keys(spots).length >= 5 && spots['01'] && !spots['34'], 'the park grows the mown lawn and its four patch kinds, not the meadow (one lawn with patches, 7 Nov 2026): ' + Object.keys(spots).join());
    const tally = { tufts: 0, off: 0, flatTufts: 0, fl: [], mu: [], bf: [] };
    for (const id of Object.keys(spots)) {
      await pg.evaluate(([x, z]) => __dbg.UI.goTo(x, z, SHARED.py), spots[id]); await pg.waitForTimeout(7000);
      const r = await pg.evaluate(() => { const T = 33.9 / 30, o = { n: 0, off: 0, flat: 0 }; for (const me of TUFTS.meshes) { const A = me.instanceMatrix.array; for (let i = 0; i < me.count; i++) { const k = GRASS.at(A[i * 16 + 12] / T, A[i * 16 + 14] / T); o.n++; if (k.shape !== me.userData.shape) o.off++; if (!k.shape) o.flat++; } }
        const M = GRASS.MIX, by = id => GRASS.K.find(q => q.id === id), own = (K, f, it) => [K.id, ...(K.id === M.lawn ? M.gone : f === 'mush' && M.patches.includes(K.id) ? [M.lawn, ...M.gone] : [])].some(id => Object.values(by(id)[f]).includes(it)), kin = (x, z) => GRASS.at(x / T, z / T), near = (x, z, f) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([u, v]) => f(kin(x + u * T, z + v * T)));
        o.fl = GARDEN.spots().map(([k, x, z]) => near(x, z, K => own(K, 'flowers', k))); o.mu = FORAGE.spots().map(([k, x, z]) => near(x, z, K => own(K, 'mush', k))); o.bf = BFLY.spots().map(([n, x, z]) => near(x, z, K => own(K, 'bf', n))); return o; });
      tally.tufts += r.n; tally.off += r.off; tally.flatTufts += r.flat; tally.fl.push(...r.fl); tally.mu.push(...r.mu); tally.bf.push(...r.bf);
    }
    ok(tally.tufts > 1000 && tally.off / tally.tufts < .03, 'the grass near you stands in its own kind\'s shape (' + tally.off + ' of ' + tally.tufts + ' off, at the kinds\' edges)');
    ok(tally.flatTufts / Math.max(1, tally.tufts) < .03, 'none stands in the flat kinds (pixel meadow, mown lawn): ' + tally.flatTufts);
    const ht = await pg.evaluate(() => { const lv = new Set(), P = __dbg.you(); for (let i = -8; i <= 8; i += .5) for (let j = -8; j <= 8; j += .5) lv.add(TUFTS.lv(P.x + i, P.z + j)); let bend = 0, flat = 0; for (const me of TUFTS.meshes) { const B = me.geometry.attributes.aBend; for (let i = 0; i < me.count; i++)B.array[i] ? bend++ : flat++; } return { lv: [...lv].sort().join(), bend, flat, press: TUFTS.pressing().length }; });
    ok(ht.lv.split(',').length >= 3 && ht.bend > 0 && ht.flat > 0 && ht.press >= 1, 'the grass in patches of five heights (8 Nov 2026), 3 and up parting round whoever walks through: ' + JSON.stringify(ht));
    const share = a => a.length ? a.filter(Boolean).length / a.length : 1;
    ok(tally.fl.length > 0 && share(tally.fl) >= .95, 'wild flowers come up in the park, each its grass\'s own (' + tally.fl.filter(Boolean).length + ' of ' + tally.fl.length + ')');
    ok(share(tally.mu) >= .95, 'mushrooms come up by their grass\'s odds (' + tally.mu.filter(Boolean).length + ' of ' + tally.mu.length + ')');
    ok(share(tally.bf) >= .95, 'butterflies on the lawn are their grass\'s own or its rare (' + tally.bf.filter(Boolean).length + ' of ' + tally.bf.length + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all grass kind checks passed');
  process.exit(fails.length ? 1 : 0);
})();
