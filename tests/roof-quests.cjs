// THE ROOFTOPS CHECK: node tests/roof-quests.cjs dist/market.html [shots dir]. Up on your apartment roof: the ruined greenhouse restored in three steps becomes a bed you plant (pigeons eat a seedling unless shooed or an owl decoy is up; the tray gives a rare seed a day); the water tower climbed to its catwalk (the nest's stone once a day, your flag on the pole), a slip drops you onto the roof, not through it; the night run (shut by day) leapt perch to perch to the mat, where the master spars you for a belt and a scroll.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roof-quests::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let pg, st = false; const errs = [];
  const open = async hour => { if (pg) await pg.close(); pg = await b.newPage({ viewport: { width: 960, height: 600 } });   // (a page each for day and night: one page through both runs this machine out of memory)
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/ROOFQ/.test(m.text())) errs.push(m.text().slice(0, 300)); });
    await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=' + hour + '&wx=CLEAR', { waitUntil: 'commit' });
    st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
    ok(st, 'the page starts at ' + hour + ':00');
    if (st) { await pg.evaluate(() => { const [x, z] = HOUSEAT(2); __dbg.UI.goTo(x, z, 'up'); }); ok(await wait(() => window.ROOFQ && ROOFQ.built, 60000), 'the rooftops are built once you are near the apartments: ' + JSON.stringify(await D())); } };
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 400) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(400); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(SHOTS, n + '.png'), timeout: 120000 }).catch(e => console.log('(no shot ' + n + ': ' + e.message.split('\n')[0] + ')')); } };
  const D = () => pg.evaluate(() => ROOFQDBG());
  await open(13);
  if (st) {
    let d = await D();
    // the greenhouse
    await pg.evaluate(([x, z, y]) => __dbg.UI.goTo(x, z, y), [...d.gh_at, d.top]);
    ok(await wait(t => Math.abs(SHARED.py - t) < .05, 15000, d.top), 'up on the roof: you stand on it (py ' + (await pg.evaluate(() => SHARED.py)).toFixed(2) + ', roof ' + d.top + ')');
    await pg.evaluate(() => __dbg.UI.setView('third')); await shot('greenhouse-ruin');
    const gh = await pg.evaluate(() => { const c0 = INV.cash, a = []; INV.cash = Math.max(INV.cash, 200); __dbg.VIT.sta = 1; for (let i = 0; i < 3; i++) { ROOFQ.GH.th.act(); a.push(ROOFQ.S.gh); } return { steps: a, paid: INV.cash - Math.max(c0, 200) }; });
    ok(gh.steps.join() === '1,2,3' && gh.paid === -85, 'the greenhouse is restored in three steps (clear, reglaze $60, mend the beds $25): ' + JSON.stringify(gh));
    await shot('greenhouse');
    await pg.evaluate(([x, z, y]) => __dbg.UI.goTo(x, z, y), [...d.bed, d.top]); await pg.waitForTimeout(1500);
    const pl = await pg.evaluate(() => { INV.add('sd_marigold', 2); FORAGE.ACT.gplant('sd_marigold'); return GARDEN.plots().filter(p => p.bed === 'roofgh').length; });
    ok(pl === 1, 'a seed plants in the greenhouse bed (' + pl + ')');
    await wait(() => !FADE.busy, 60000);   // the houses stand by the park (11 Nov 2026): going up loads it behind a fade, and the roof waits for it
    const pe = await pg.evaluate(async () => { ROOFQ.land(); const on = ROOFQ.PG.on; ROOFQ.PG.stay = 0; await new Promise(r => setTimeout(r, 1500)); return { on, eaten: GARDEN.plots().filter(p => p.bed === 'roofgh').length === 0 }; });
    ok(pe.on && pe.eaten, 'pigeons land and, left alone, eat the seedling: ' + JSON.stringify(pe));
    const ow = await pg.evaluate(async () => { FORAGE.ACT.gplant('sd_marigold'); ROOFQ.land(); ROOFQ.shoo(); const shooed = !ROOFQ.PG.on; ROOFQ.GH.owlTh.act(); ROOFQ.PG.fly = 0; ROOFQ.PG.t = 0; await new Promise(r => setTimeout(r, 1500)); return { shooed, owl: ROOFQ.S.owl, landed: ROOFQ.PG.on, kept: GARDEN.plots().filter(p => p.bed === 'roofgh').length }; });
    ok(ow.shooed && ow.owl && !ow.landed && ow.kept === 1, 'shooed they go; with the owl decoy up they do not land: ' + JSON.stringify(ow));
    const tr = await pg.evaluate(() => { const n = () => Object.keys(INV.items).filter(k => k.startsWith('sd_')).reduce((a, k) => a + INV.items[k], 0), n0 = n(); ROOFQ.GH.trayTh.act(); const n1 = n(); ROOFQ.GH.trayTh.act(); return [n1 - n0, n() - n1]; });
    ok(tr[0] === 1 && tr[1] === 0, 'the seed tray gives a rare seed once a day: ' + JSON.stringify(tr));
    // the water tower
    d = await D();
    await pg.evaluate(([x, z, y]) => __dbg.UI.goTo(x, z, y), [...d.tower.foot, d.top]); await pg.waitForTimeout(1500);
    await pg.mouse.click(480, 300);
    await pg.evaluate(() => { ROOFQ.TW.want = true; });
    ok(await wait(() => ROOFQ.TW.c != null, 10000), 'at the foot of the water tower the ladder takes you');
    await pg.evaluate(() => { ROOFQ.TW.c.h = ROOFQ.TW.H - .3; }); await pg.keyboard.down('w');
    const up = await wait(() => ROOFQ.TW.on, 60000); await pg.keyboard.up('w');
    ok(up, 'up the ladder onto the catwalk');
    ok(await wait(y => Math.abs(SHARED.py - y) < .1, 10000, d.tower.deck), 'you stand on the catwalk (py ' + (await pg.evaluate(() => SHARED.py)).toFixed(2) + ', deck ' + d.tower.deck + ')');
    await shot('tower-top');
    const ne = await pg.evaluate(() => { const n = () => Object.values(INV.items).reduce((a, b) => a + b, 0), n0 = n(); ROOFQ.TW.nestTh.act(); const n1 = n(); ROOFQ.TW.nestTh.act(); ROOFQ.TW.flagTh.act(); ROOFQ.TW.viewTh.act(); return { got: n1 - n0, again: n() - n1, flag: ROOFQDBG().flag, cloth: ROOFQ.TW.cloth.visible }; });
    ok(ne.got === 1 && ne.again === 0, 'the hawk\'s nest gives a stone once a day: ' + JSON.stringify(ne));
    ok(ne.flag && ne.flag.n && ne.cloth, 'your flag flies from the pole: ' + JSON.stringify(ne.flag));
    const sl = await pg.evaluate(async () => { ROOFQ.TW.downTh.act(); const on = ROOFQ.TW.c != null; const hp0 = __dbg.VIT.hp; ROOFQ.slip(); await new Promise(r => setTimeout(r, 2500)); return { on, hurt: +(hp0 - __dbg.VIT.hp).toFixed(3), py: SHARED.py, climb: !!ROOFQ.TW.c }; });
    ok(sl.on && sl.hurt > 0 && !sl.climb && Math.abs(sl.py - d.top) < .1, 'a slip from the ladder hurts and drops you onto the roof, not through it: ' + JSON.stringify(sl));
    // the night run and the master
    const day = await pg.evaluate(() => { CLOCK.h = 13; ROOFQ.run(); return ROOFQ.C.on; });
    ok(!day, 'by day the run is shut');
  }
  await open(22);
  if (st) {
    await pg.evaluate(() => { const m = ROOFQDBG().mat; __dbg.UI.goTo(m.x, m.z + 2 * __dbg.cv().TILE, ROOFQDBG().top); });
    ok(await wait(() => ROOFQ.B.N && ROOFQ.B.N.g.visible, 60000), 'after dark the master waits by the mat: ' + JSON.stringify((await D()).bout));
    await shot('master');
    const d = await D();
    ok(d.run.n >= 4, 'the run has its perches: ' + JSON.stringify(d.run.marks));
    await pg.mouse.click(480, 300);
    await pg.evaluate(() => { window.__r0 = Math.random; Math.random = () => .01; __dbg.VIT.sta = 1; ROOFQ.run(); });
    ok(await pg.evaluate(() => ROOFQ.C.on), 'at night the chalk mark starts the run');
    for (let k = 0; k < 40 && await pg.evaluate(() => ROOFQ.C.on); k++) { await pg.keyboard.down(' '); await pg.waitForTimeout(300); await pg.keyboard.up(' '); await wait(() => !ROOFQ.C.leap, 8000); await pg.evaluate(() => { __dbg.VIT.sta = 1; }); }
    await pg.evaluate(() => { Math.random = window.__r0; });
    const end = await D();
    ok(!end.run.on && end.bout.on, 'perch to perch to the mat, and the bout begins: ' + JSON.stringify({ run: end.run.i, bout: end.bout }));
    const won = await pg.evaluate(async () => { ROOFQ.B.hp = 0; await new Promise(r => setTimeout(r, 1500)); return { belt: ROOFQDBG().belt, on: ROOFQ.B.on, scroll: INV.items.rf_scroll || 0 }; });
    ok(won.belt === 'YELLOW' && !won.on && won.scroll === 1, 'beat the master: a belt and a scroll: ' + JSON.stringify(won));
    const again = await pg.evaluate(() => { ROOFQ.boutStart(); return ROOFQ.B.on; });
    ok(!again, 'one bout a night');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
