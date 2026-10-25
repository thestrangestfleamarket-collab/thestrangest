// THE ROOM EDITOR CHECK: node tests/roomedit.cjs dist/market.html. DECORATE in your apartment: T opens it; a click picks a thing up and a drag moves it (its solid follows); Q turns, the wheel resizes, DEL puts it away and the panel brings it back; a new thing from the catalog; the walls, the floor and a light; UNDO; DONE saves, and the room comes back the same after a reload.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roomedit::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 680 } }), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html');
  const start = async q => { await pg.goto(url + '?hour=17&place=your%20apartment' + q, { waitUntil: 'commit' });
    let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built && window.ROOMEDDBG && ROOMEDDBG().units > 0)); i++) await pg.waitForTimeout(1000);
    return st; };
  const st = await start('&fresh=1');
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(() => { const A = __dbg.MAPK.MODS.apts.R, B = SHARED.BOD; __dbg.UI.goTo(B.X(A.x0 + (A.x1 - A.x0) * .3), B.Z(A.y0 + (A.y1 - A.y0) * .3), SHARED.py); SHARED.yawTo = SHARED.yaw = -Math.PI / 4; SHARED.ppuTo = SHARED.ppu = SHARED.ppu * .6; });
    await pg.waitForTimeout(2500);
    ok(await pg.evaluate(() => !document.getElementById('roomedbtn').hidden), 'the DECORATE button shows in your apartment');
    await pg.keyboard.press('t'); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => ROOMEDDBG().on && !document.getElementById('roomed').hidden), 'T opens the room editor and its panel');
    // where the bed is on screen
    const scr = () => pg.evaluate(() => { const A = ROOMED._api(), un = A.units().find(u => u.kind === 'BED'), t0 = A.getT(un), p = A.W(t0.u + Math.cos(t0.ry) * .6, .5, t0.v - Math.sin(t0.ry) * .6); p.project(SHARED.cam); const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height, t: A.getT(un), id: un.id }; });
    const s0 = await scr();
    await pg.mouse.move(s0.x, s0.y); await pg.mouse.down(); await pg.mouse.move(s0.x + 60, s0.y + 40, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(500);
    const s1 = await scr(), moved = Math.hypot(s1.t.u - s0.t.u, s1.t.v - s0.t.v);
    ok(await pg.evaluate(id => ROOMEDDBG().sel === id, s0.id) && moved > .2, 'a click picks the bed up and a drag moves it (' + moved.toFixed(2) + ' m)');
    ok(await pg.evaluate(() => { const A = ROOMED._api(), un = A.units().find(u => u.kind === 'BED'); return un.h.length > 0 && un.h.every(h => h.r && SHARED.solids.includes(h.r)); }), 'its solid moved with it');
    await pg.keyboard.press('q'); await pg.waitForTimeout(200);
    await pg.mouse.move(s1.x, s1.y); await pg.mouse.wheel(0, -120); await pg.waitForTimeout(300);
    const s2 = await scr();
    ok(Math.abs(s2.t.ry - s1.t.ry) > .2 && s2.t.s > 1.02, 'Q turns it and the wheel makes it bigger (turn ' + (s2.t.ry - s1.t.ry).toFixed(2) + ', size ' + s2.t.s.toFixed(2) + ')');
    await pg.keyboard.press('Delete'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => ROOMEDDBG().gone === 1 && !!document.querySelector('#roomed [data-back]')), 'DEL puts it away and the panel lists it');
    await pg.click('#roomed [data-back]'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => ROOMEDDBG().gone === 0), 'the panel brings it back');
    await pg.click('#roomed [data-add="LAMP"]'); await pg.waitForTimeout(500);
    ok(await pg.evaluate(() => ROOMEDDBG().added === 1 && ROOMED._api().lightsAll().some(q => q.un && q.un.added)), 'a new lamp from the catalog, its light listed');
    await pg.click('#roomed [data-tab="walls"]'); await pg.click('#roomed [data-wall="brick"]');
    await pg.click('#roomed [data-tab="floor"]'); await pg.click('#roomed [data-floor="checker"]'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => ROOMEDDBG().wall === 'brick' && ROOMEDDBG().floor === 'checker'), 'brick walls and a checker floor');
    await pg.click('#roomed [data-tab="lights"]'); await pg.click('#roomed [data-lon="ceiling-1"]'); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => { const q = ROOMED._api().lightsAll().find(x => x.id === 'ceiling-1'); return q.L.userData.on === false && q.L.intensity === 0; }), 'a ceiling light switches off');
    await pg.click('#roomed [data-lon="ceiling-1"]'); await pg.click('#roomed [data-a="undo"]'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => ROOMED._api().lightsAll().find(x => x.id === 'ceiling-1').L.userData.on === false), 'UNDO takes the last change back');
    await pg.screenshot({ path: process.env.SHOT || '/tmp/roomedit.png' });
    await pg.click('#roomed [data-a="done"]'); await pg.waitForTimeout(600);
    const saved = await pg.evaluate(() => JSON.parse(localStorage.getItem('market-home') || 'null'));
    ok(saved && saved.wall === 'brick' && saved.added.length === 1 && !(await pg.evaluate(() => ROOMEDDBG().on)), 'DONE closes the editor and saves the room');
    const s3 = await scr();
    await start('');
    const back = await pg.evaluate(() => { const A = ROOMED._api(), un = A.units().find(u => u.kind === 'BED'); return { wall: A.R.wall, floor: A.R.floor, added: A.units().filter(u => u.added).length, t: A.getT(un) }; });
    ok(back.wall === 'brick' && back.floor === 'checker' && back.added === 1 && Math.abs(back.t.u - s3.t.u) < .01 && Math.abs(back.t.ry - s3.t.ry) < .01, 'after a reload the room is as you left it (' + JSON.stringify({ wall: back.wall, floor: back.floor, added: back.added }) + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all room editor checks passed');
  process.exit(fails.length ? 1 : 0);
})();
