// THE HOUSEPLANTS: node tests/plants3d.cjs [dist/market.html]. A fresh apartment has its Polyfork plants (models in), the hanging vines move when you walk into them and when a window is open, and come to rest (stop costing) once it is shut and you have gone; the leafy ones bend and spring back; no page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=plants3d::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const pg = await b.newPage({ viewport: { width: 480, height: 320 } }); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('crash', () => console.log('page crashed'));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&npcwait=99&hour=11&place=your%20apartment', { waitUntil: 'commit', timeout: 180000 });
  for (let i = 0; i < 240; i++) { await pg.waitForTimeout(1000); if (await pg.evaluate(() => !!window.__started).catch(() => false)) break; }
  for (let i = 0; i < 90; i++) { await pg.waitForTimeout(2000); if (await pg.evaluate(() => { const d = window.PLANT3DBG && PLANT3DBG(); return d && d.loaded && d.units.length >= 9 && d.units.every(u => u.models > 0); }).catch(() => false)) break; }
  const sleep = ms => pg.waitForTimeout(ms), frames = n => pg.evaluate(n => new Promise(r => { const f = () => --n > 0 ? requestAnimationFrame(f) : r(); requestAnimationFrame(f); }), n), D = () => pg.evaluate(() => PLANT3DBG());
  const goTo = (u, v) => pg.evaluate(([u, v]) => { const A = ROOMED._api(), p = A.W(u, 0, v), U = window.__dbg ? __dbg.UI : UI; U.goTo(p.x, p.z, p.y); }, [u, v]);
  const d0 = await D(); const kinds = d0 ? d0.units.map(u => u.kind) : [];
  ok(d0 && d0.loaded && ['FLOOR PLANT', 'OLIVE TREE', 'FERN STAND', 'FLOWERING PLANT', 'HERB POT', 'BASIL POT'].every(k => kinds.includes(k)) && kinds.filter(k => k === 'HANGING PLANT').length === 3, 'a fresh apartment has its plants: ' + kinds.join(', '));
  ok(d0 && d0.units.every(u => u.models > 0), 'every plant has its Polyfork model');
  const hang = d0 ? d0.units.filter(u => u.vine) : []; ok(hang.length === 3 && hang.every(u => u.vine.pts > 20 && u.vine.leaves > 20), 'three baskets with vines (' + hang.map(u => u.vine && u.vine.pts + ' points, ' + u.vine.leaves + ' leaves').join('; ') + ')');
  const vines = d => d.units.filter(u => u.vine), calm = d => vines(d).every(u => u.vine.still > 40) && d.units.every(u => u.bend.every(b => b[2]));
  const run = n => pg.evaluate(n => PLANT3.run(n), n), settle = async () => { for (let n = 1; n <= 20; n++) { await run(30); if (calm(await D())) return n; } return -1; };
  // stand still away from them: they settle and stop
  await goTo(6, 4); let t = await settle(); let d = await D();
  ok(t >= 0, 'at rest, every vine and leaf is still and skipped (' + (t >= 0 ? t + ' s of its time' : vines(d).map(u => u.vine.still + ' calm steps, ' + u.vine.dev.toFixed(3) + ' m').join('; ')) + ')');
  // walk through the vines of the east basket
  for (let u = 10.0; u <= 11.3; u += .1) { await goTo(u, 6.62); await run(3); } await run(2); d = await D(); const v1 = vines(d)[2];
  ok(v1.vine.dev > .03, 'walking through a basket pushes its vines aside (' + v1.vine.dev.toFixed(3) + ' m, the basket swings ' + v1.sw.slice(0, 2).map(x => (+x).toFixed(4)).join(',') + ')');
  const fern = d.units.find(u => u.kind === 'FERN STAND'); ok(fern && fern.bend.some(b => !b[2]), 'the fern beside it bends as you brush it');
  await goTo(6, 4); t = await settle(); ok(t >= 0, 'you gone, they swing back and come to rest (' + t + ' s of its time)');
  // open the west windows: the draught sways the vines by them
  await pg.evaluate(() => { for (const w of ROOMED._api().R.wins) if (w.k === 'Ww') { w.open = true; w.br = 1; } }); await run(60); d = await D(); const w1 = vines(d)[0];
  ok(w1.vine.dev > .005 && w1.vine.still < 5, 'an open window\'s draught sways the vines by it (' + w1.vine.dev.toFixed(3) + ' m)');
  // shut them: they come to rest
  await pg.evaluate(() => { for (const w of ROOMED._api().R.wins) { w.open = false; w.br = 0; } }); t = await settle();
  ok(t >= 0, 'window shut, every vine and leaf comes to rest again (' + t + ' s of its time)');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'plants3d: all good'); process.exit(fails.length ? 1 : 0); })();
