// THE APARTMENT'S OWN PIECES (owner, 7 Nov 2026): a fresh apartment, not furnished, still has the CRT TV, the typewriter's writing desk, the telescope, the globes, the microscope's desk and stool, the fish tank, with koi in it, and the table radio; in it third and first person, as in any inside. node tests/aptfixed.cjs [dist/market.html]
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=aptfixed::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const want = ['CRT TV', 'WRITING DESK', 'TELESCOPE', 'EARTH GLOBE', 'GLOBE TABLE', 'LAB DESK', 'LAB STOOL', 'FISH TANK', 'TABLE RADIO', 'ROUND RUG', 'RECLINER', 'BOOKSHELF', 'FLOOR PLANT', 'OLIVE TREE', 'FERN STAND', 'HANGING PLANT', 'FLOWERING PLANT', 'HERB POT', 'BASIL POT', 'BISTRO TABLE', 'LAWN CHAIR', 'POTTED SHRUB', 'FLOWER PLANTER', 'WOODEN CRATE', 'CANDLE LANTERN', 'CACTUS POT', 'WATERING CAN'];
    let d = null; for (let i = 0; i < 40; i++) { d = await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG()); if (d && d.built && want.every(k => d.kinds.includes(k))) break; await pg.waitForTimeout(1000); }
    ok(d && want.every(k => d.kinds.includes(k)), 'a fresh apartment has its own pieces: ' + JSON.stringify(d && d.kinds));
    ok(d && d.kinds.every(k => want.includes(k)), 'and nothing else until you buy it');
    const cl = await pg.evaluate(() => { const A = ROOMED._api(), U = A.units(), bs = U.find(u => u.kind === 'BOOKSHELF'), ft = U.find(u => u.kind === 'FISH TANK'), fresh = ROOMED.clips(), a = A.R.apt.matrixWorld.clone().invert(), B = A.unitBox(ft.obj).applyMatrix4(a), O = A.unitBox(bs.obj).applyMatrix4(a), t0 = A.getT(bs);
      A.setT(bs, { ...t0, u: t0.u + B.min.x + .3 - (O.min.x + O.max.x) / 2, v: t0.v + (B.min.z + B.max.z) / 2 - (O.min.z + O.max.z) / 2 }); const inTank = ROOMED.clips(), moved = ROOMED.unclip(), after = ROOMED.clips(); A.setT(bs, t0); return { fresh, inTank, moved, after }; });
    ok(cl.fresh.length === 0, 'no two pieces of a fresh apartment stand in one another: ' + JSON.stringify(cl.fresh));
    ok(cl.inTank.length === 1 && cl.moved.length === 1 && cl.after.length === 0, 'a bookshelf standing in the fish tank is found and moved clear: ' + JSON.stringify(cl.moved));
    const v = await pg.evaluate(async () => { const A = __dbg.MAPK.MODS.apts; await A.enterReal(); for (let i = 0; i < 40 && (window.FADE && FADE.busy); i++) await new Promise(r => setTimeout(r, 250)); return { inReal: !!A.inReal, views: __dbg.UI.viewsHere() }; });
    ok(v.inReal && v.views.includes('third') && v.views.includes('first'), 'in your apartment you can go to third and first person, as in any inside (owner, 7 Nov 2026): ' + JSON.stringify(v));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
