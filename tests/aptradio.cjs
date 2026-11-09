// THE APARTMENT RADIO CHECK: node tests/aptradio.cjs dist/market.html (owner, 9 Nov 2026): a fresh apartment has its radio; double-clicking it opens the panel; ON plays the market's station, quieter away from it, silent out of the apartment; its state is in the saved layout. 
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=aptradio::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=21&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    let d = null; for (let i = 0; i < 40; i++) { d = await pg.evaluate(() => window.TRADIODBG && TRADIODBG()); if (d && d.thing && d.srcs.length) break; await pg.waitForTimeout(1000); }
    ok(d && d.thing && d.srcs.length === 1, 'a fresh apartment has its table radio, to double-click, one of the radio\'s sources (' + JSON.stringify(d && { thing: d.thing, srcs: d.srcs }) + ')');
    ok(await pg.evaluate(() => !!ROOMED._api().units().find(u => u.kind === 'TABLE RADIO')), 'it is a unit the room editor moves');
    await pg.evaluate(async () => { const A = __dbg.MAPK.MODS.apts; if (!A.inReal) await A.enterReal(); for (let i = 0; i < 40 && (window.FADE && FADE.busy); i++) await new Promise(r => setTimeout(r, 250)); });
    // stand before it, in first person
    const front = k => pg.evaluate(k => { const un = ROOMED._api().units().find(u => u.kind === 'TABLE RADIO'), e = (un.obj.updateWorldMatrix(true, false), un.obj.matrixWorld.elements), p = { x: e[12], z: e[14] }; const M = ROOMED._api().M; __dbg.UI.goTo(p.x, p.z - k * M, SHARED.py); SHARED.yawTo = SHARED.yaw = Math.PI; return [p.x, p.z]; }, k);
    await front(1.1); await pg.evaluate(() => __dbg.UI.setView && __dbg.UI.setView('first')); await pg.waitForTimeout(2500);
    await pg.evaluate(() => __dbg.UI.things.find(t => /^TABLE RADIO/.test(t.name)).act());
    for (let i = 0; i < 30 && !(await pg.evaluate(() => TRADIODBG().panel)); i++) await pg.waitForTimeout(500);
    const d1 = await pg.evaluate(() => TRADIODBG());
    ok(d1.panel && d1.data && !d1.on && await pg.$$eval('#radp [data-s]', e => e.length) === 4, 'a double click opens its panel: off, four stations (' + JSON.stringify({ panel: d1.panel, on: d1.on }) + ')');
    const C = { noWaitAfter: true, timeout: 90000 }; await pg.click('#radp [data-a="on"]', C); await pg.waitForTimeout(500); await pg.click('#radp [data-s="2"]', C);
    let m = null; for (let i = 0; i < 40; i++) { m = await pg.evaluate(() => TRADIODBG().mix); if (m && m.ch.dance && !m.ch.dance.paused && m.ch.dance.g > 0) break; await pg.waitForTimeout(500); }
    const near = m && m.best && m.best.dance && m.best.dance.k;
    ok(m && m.ch.dance && !m.ch.dance.paused && m.ch.dance.g > 0 && near > 0, 'ON and WRTZ: its station plays (' + JSON.stringify(m && { ctx: m.ctx, ch: m.ch, k: near }) + ')');
    let sync = 99; for (let i = 0; i < 20 && sync > 1.6; i++) { await pg.waitForTimeout(1000); const c = (await pg.evaluate(() => CARS.radio())).ch.dance; if (c && !c.paused) sync = Math.abs(c.t - c.want); }
    ok(sync < 1.6, 'at the same moment as every other radio on that station (' + sync.toFixed(2) + ' s off)');
    ok(await pg.evaluate(() => /WRTZ/.test(__dbg.UI.things.find(t => /^TABLE RADIO/.test(t.name)).name) && /ROARING TWENTIES/.test(document.querySelector('#radp .now').textContent)), 'its name and panel say what plays');
    await pg.screenshot({ path: process.env.SHOT || '/tmp/radio.png' });
    const p0 = await pg.evaluate(() => __dbg.pos()); await front(3); let far = 1, p1 = null; for (let i = 0; i < 20 && far >= near; i++) { await pg.waitForTimeout(500); far = await pg.evaluate(() => { const b = TRADIODBG().mix.best.dance; return b ? b.k : 0; }); p1 = await pg.evaluate(() => __dbg.pos()); }
    ok(far < near, 'quieter as you walk away (' + (+near).toFixed(2) + ' close, ' + (+far).toFixed(2) + ' across the room; ' + JSON.stringify([p0, p1]) + ')');
    await pg.waitForTimeout(1500);
    const saved = await pg.evaluate(() => JSON.parse(__dbg.SAVE.get('home') || 'null'));
    ok(saved && saved.radio && saved.radio.on === 1 && saved.radio.st === 2, 'its state is in the saved layout (' + JSON.stringify(saved && saved.radio) + ')');
    await pg.evaluate(async () => { await __dbg.MAPK.MODS.apts.exitReal(); for (let i = 0; i < 40 && (window.FADE && FADE.busy); i++) await new Promise(r => setTimeout(r, 250)); }); await pg.waitForTimeout(3000);
    const out = await pg.evaluate(() => TRADIODBG());
    ok(out.on && (!out.mix.ch.dance || out.mix.ch.dance.paused || out.mix.ch.dance.g < .02), 'out of the apartment it is not heard (still on for when you come back) (' + JSON.stringify(out.mix.ch) + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
