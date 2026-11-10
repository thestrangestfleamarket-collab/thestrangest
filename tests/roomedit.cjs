// THE ROOM EDITOR CHECK: node tests/roomedit.cjs dist/market.html. DECORATE in your apartment, like the Sims: the room starts empty but for its own pieces and you start with $1,000,000; T opens the panel and the buy bar (pictured things, prices, the game's items too); a bought thing follows the pointer and a click puts it down on the grid; a drag moves it (its solid follows), red where it doesn't fit (back where it was); a small thing onto a table, a picture onto a wall; Q turns a quarter, Shift+wheel resizes, DEL puts it away and the panel brings it back; SELL pays half back; walls, floor and a light; UNDO; DONE saves, and the room comes back the same after a reload.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roomedit::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }), pg = await ctx.newPage(), errs = [];
  ctx.setDefaultTimeout(120000);   // full-resolution software drawing on CI is slow; a click may wait past Playwright's 30 s
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html');
  const start = async q => { await pg.goto(url + '?hour=15&place=your%20apartment' + q, { waitUntil: 'commit' });
    let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built && window.ROOMEDDBG && ROOMED._api())); i++) await pg.waitForTimeout(1000);
    return st; };
  // where a point of the room (its metres) is on screen
  const at = (u, h, v) => pg.evaluate(([u, h, v]) => { const A = ROOMED._api(), p = A.W(u, h, v); p.project(SHARED.cam); const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height }; }, [u, h, v]);
  const T = id => pg.evaluate(id => { const A = ROOMED._api(), un = A.units().find(u => u.id === id); return un && A.getT(un); }, id);
  const db = () => pg.evaluate(() => ROOMEDDBG());
  const room = () => pg.evaluate(() => { const A = ROOMED._api(); return { Lx: A.Lx, Ly: A.Ly, HW: A.HW }; });
  // buy from the bar: carried under the pointer; a click on the floor puts it down
  const buy = async (kind, u, h, v) => { const n0 = (await db()).added; await pg.evaluate(k => { const b = [...document.querySelectorAll('#roombuy [data-add]')].find(x => x.dataset.add === k); if (b) b.click(); else ROOMED.buy(k); }, kind); await pg.waitForTimeout(300);
    const p = await at(u, h, v); await pg.mouse.move(p.x - 30, p.y - 20); await pg.mouse.move(p.x, p.y, { steps: 4 }); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(400);
    return pg.evaluate(n0 => { const A = ROOMED._api(), L = A.units().filter(u => u.added); return L.length > n0 ? L[L.length - 1].id : null; }, n0); };
  // pick a wall/floor/kitchen-floor swatch: scroll it into the pane, check it is not hidden behind the footer, then click it (returns whether it was reachable)
  const pick = async (set, key) => { const sel = `#roomed [data-${set}="${key}"]`; await pg.waitForSelector(sel);
    const hit = await pg.$eval(sel, el => { el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); el.click(); return !!(t && (t === el || el.contains(t))); });
    await pg.waitForTimeout(150); return hit; };
  const st = await start('&fresh=1');
  ok(st, 'the page starts');
  if (st) {
    const R = await room(), R0 = R;
    const own = await pg.evaluate(() => ROOMED._api().units().filter(u => !u.added).length); ok(await pg.evaluate(() => ROOMED._api().units().every(u => !u.added && ['CRT TV', 'WRITING DESK', 'TELESCOPE', 'EARTH GLOBE', 'GLOBE TABLE', 'LAB DESK', 'LAB STOOL', 'FISH TANK', 'TABLE RADIO', 'RECLINER', 'ROUND RUG', 'BOOKSHELF', 'FLOOR PLANT', 'OLIVE TREE', 'FERN STAND', 'HANGING PLANT', 'FLOWERING PLANT', 'HERB POT', 'BASIL POT', 'BISTRO TABLE', 'LAWN CHAIR', 'POTTED SHRUB', 'FLOWER PLANTER', 'WOODEN CRATE', 'CANDLE LANTERN', 'CACTUS POT', 'WATERING CAN'].includes(u.kind))), 'the apartment starts empty but for its own pieces (the TV, typewriter, telescope, globes, microscope, fish tank: owner, 7 Nov 2026)');
    ok((await db()).cash >= 1000, 'you start with $1,000 (' + (await db()).cash + ')');
    await pg.evaluate(() => { window.INV.cash = 1e6; });   // enough for everything the check buys (a player starts with $1,000 since 7 Nov 2026)
    ok(await pg.evaluate(() => !document.getElementById('roomedbtn').hidden), 'the DECORATE button shows in your apartment');
    await pg.evaluate(() => { const A = __dbg.MAPK.MODS.apts.R, B = SHARED.BOD; __dbg.UI.goTo(B.X(A.x0 + (A.x1 - A.x0) * .5), B.Z(A.y0 + (A.y1 - A.y0) * .5), SHARED.py); SHARED.yawTo = SHARED.yaw = Math.PI / 4; SHARED.ppuTo = SHARED.ppu = SHARED.ppu * .6; });
    await pg.waitForTimeout(2500);
    await pg.keyboard.press('t'); await pg.waitForTimeout(2500);
    ok(await pg.evaluate(() => ROOMEDDBG().on && !document.getElementById('roomed').hidden && !document.getElementById('roombuy').hidden), 'T opens the room editor, its panel and the buy bar');
    ok(await pg.evaluate(() => !__dbg.UI.hold), 'the view is left as it is');
    const tabs = await pg.evaluate(() => [...document.querySelectorAll('#roombuy [data-dept]')].map(b => b.dataset.dept));
    ok(tabs.includes('beds') && tabs.includes('g:street'), 'the buy bar has the room\'s departments and the game\'s (' + tabs.length + ')');
    await pg.click('#roombuy [data-dept="beds"]'); await pg.waitForTimeout(4000);
    ok((await db()).pics > 0 && await pg.evaluate(() => !!document.querySelector('#roombuy [data-add="BED"] img')), 'the tiles have pictures');
    // a bed bought and put down
    const c0 = (await db()).cash, bed = await buy('BED', R.Lx * .3, 0, R.Ly * .35), tb = bed && await T(bed);
    ok(bed && (await db()).cash === c0 - 150 && !(await db()).carry, 'a bed bought for $150 and put down by a click');
    ok(tb && Math.abs(tb.u / .25 - Math.round(tb.u / .25)) < 1e-6 && Math.abs(tb.v / .25 - Math.round(tb.v / .25)) < 1e-6, 'it stands on the grid (' + (tb && [tb.u, tb.v].join(',')) + ')');
    // a drag moves it, on the grid; its solid with it
    const p0 = await at(tb.u, .5, tb.v); await pg.mouse.move(p0.x, p0.y); await pg.mouse.down(); await pg.mouse.move(p0.x + 70, p0.y + 30, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(400);
    const tb1 = await T(bed), moved = Math.hypot(tb1.u - tb.u, tb1.v - tb.v);
    ok((await db()).sel === bed && moved > .2 && Math.abs(tb1.u / .25 - Math.round(tb1.u / .25)) < 1e-6, 'a click picks it up and a drag moves it on the grid (' + moved.toFixed(2) + ' m)');
    ok(await pg.evaluate(id => { const un = ROOMED._api().units().find(u => u.id === id); return un.h.length > 0 && un.h.every(h => h.r && SHARED.solids.includes(h.r)); }, bed), 'its solid moved with it');
    // a bookcase: dragged onto the bed it goes red and back
    const fr = await buy('BOOKCASE', Math.max(.6, tb1.u - 2), 0, tb1.v), tf0 = await T(fr);
    const pf = await at(tf0.u, .8, tf0.v), pb = await at(tb1.u, 0, tb1.v);
    await pg.mouse.move(pf.x, pf.y); await pg.mouse.down(); await pg.mouse.move(pb.x, pb.y, { steps: 8 }); await pg.waitForTimeout(200);
    const red = (await db()).fp.includes('no'); await pg.mouse.up(); await pg.waitForTimeout(400); const tf1 = await T(fr);
    ok(red && Math.hypot(tf1.u - tf0.u, tf1.v - tf0.v) < .01 && /IN THE WAY/.test((await db()).said), 'a bookcase dragged onto the bed shows red and goes back (' + (await db()).said + ')');
    // Q turns a quarter, the wheel makes it bigger
    await pg.evaluate(id => ROOMED.select(ROOMED._api().units().find(u => u.id === id)), bed);
    const tq0 = await T(bed); await pg.keyboard.press('q'); await pg.waitForTimeout(200); const pq = await at(tq0.u, .5, tq0.v); await pg.mouse.move(pq.x, pq.y); await pg.keyboard.down('Shift'); await pg.mouse.wheel(0, -120); await pg.keyboard.up('Shift'); await pg.waitForTimeout(300);
    const tq = await T(bed);
    ok(Math.abs(Math.abs(tq.ry - tq0.ry) - Math.PI / 2) < .01 && tq.s > 1.02, 'Q turns it a quarter and Shift+wheel makes it bigger (turn ' + (tq.ry - tq0.ry).toFixed(2) + ', size ' + tq.s.toFixed(2) + ')');
    await pg.keyboard.press('Delete'); await pg.waitForTimeout(300);
    ok((await db()).gone === 1 && await pg.evaluate(() => !!document.querySelector('#roomed [data-back]')), 'DEL puts it away and the panel lists it');
    await pg.click('#roomed [data-back]'); await pg.waitForTimeout(300);
    ok((await db()).gone === 0, 'the panel brings it back');
    // a desk, and a lamp put on it
    // a spot for the table that is open floor on screen (not under the panel or the bar)
    let spot = [R.Lx * .5, R.Ly * .5]; for (const [fu, fv] of [[.2, .2], [.2, .8], [.5, .2], [.8, .8], [.35, .65], [.65, .35], [.8, .2]]) { const q = await at(R.Lx * fu, .76, R.Ly * fv); if (await pg.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.tagName === 'CANVAS'; }, [q.x, q.y])) { spot = [R.Lx * fu, R.Ly * fv]; break; } }
    const tab = await buy('DESK', spot[0], 0, spot[1]), tt = await T(tab);
    await pg.click('#roombuy [data-dept="lights"]');
    const lamp = await buy('LAMP', tt.u, .76, tt.v); await pg.waitForTimeout(1500);
    const tl = await T(lamp);
    ok(lamp && tl.h > .6 && tl.h < 1, 'a lamp put down over the desk stands on it (h ' + (tl && tl.h.toFixed(2)) + ')');
    // a picture onto a wall
    await pg.click('#roombuy [data-dept="decor"]');
    let pic = null, tp = null; for (const [u, v] of [[R.Lx / 2, R.Ly], [0, R.Ly / 2], [R.Lx / 2, 0], [R.Lx, R.Ly / 2]]) { if (pic) { await pg.evaluate(id => { ROOMED.select(ROOMED._api().units().find(u => u.id === id)); ROOMED.sell(); }, pic); }
      pic = await buy('WALL SHELF', u, 1.5, v); tp = await T(pic); if (tp && Math.min(tp.u, R.Lx - tp.u, tp.v, R.Ly - tp.v) < .3 && Math.abs(tp.h + .2 - 1.5) < .6) break; }
    ok(tp && Math.min(tp.u, R.Lx - tp.u, tp.v, R.Ly - tp.v) < .3 && tp.h > .6, 'a wall shelf goes onto the wall you point at (' + (tp && [tp.u, tp.h, tp.v].map(x => x.toFixed(2)).join(',')) + ')');
    // a game item found by name
    await pg.fill('#roomfind', 'bus stop'); await pg.waitForTimeout(500);
    const bus = await buy('g:bus stop', R.Lx * .2, 0, R.Ly * .8);
    ok(bus && await pg.evaluate(id => ROOMED._api().units().find(u => u.id === id).obj.children.length > 0, bus), 'a game item (the bus stop) found by name and bought');
    // SELL pays half back
    await pg.evaluate(id => ROOMED.select(ROOMED._api().units().find(u => u.id === id)), bus); const cs0 = (await db()).cash, pr = await pg.evaluate(() => ROOMED.price('g:bus stop'));
    await pg.click('#roomed [data-a="sell"]'); await pg.waitForTimeout(300);
    ok((await db()).cash === cs0 + Math.floor(pr / 2), 'SELL pays half back ($' + Math.floor(pr / 2) + ')');
    await pg.click('#roomed [data-tab="walls"]'); const hitW = await pick('wall', 'brick');
    await pg.click('#roomed [data-tab="floor"]'); const hitF = await pick('floor', 'checker'); await pg.waitForTimeout(300);
    ok((await db()).wall === 'brick' && (await db()).floor === 'checker' && hitW && hitF, 'brick walls, a checker floor (each swatch reachable, not under the footer)');
    await pg.click('#roomed [data-tab="lights"]'); await pg.click('#roomed [data-add="SCONCE"]'); await pg.waitForTimeout(300); await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    ok(!(await db()).carry && !(await pg.evaluate(() => ROOMED._api().units().some(u => u.kind === 'SCONCE'))), 'ESC takes back a thing you are carrying (paid back)');
    await pg.click('#roomed [data-tab="lights"]'); await pg.click('#roomed [data-add="TRACK SPOTS"]'); await pg.waitForTimeout(300); await pg.evaluate(() => ROOMED.place()); await pg.waitForTimeout(300);
    const lid = await pg.evaluate(() => { const A = ROOMED._api(), q = A.lightsAll().find(x => x.un && x.un.kind === 'TRACK SPOTS'); return q && q.id; });
    ok(lid && await pg.evaluate(id => ROOMED._api().lightsAll().find(q => q.id === id).L.isSpotLight, lid), 'track spots bought, lighting a beam');
    await pg.click('#roomed [data-tab="lights"]'); await pg.click(`#roomed [data-lon="${lid}"]`); await pg.waitForTimeout(400);
    ok(await pg.evaluate(id => { const q = ROOMED._api().lightsAll().find(x => x.id === id); return q.L.userData.on === true && q.L.intensity > 0; }, lid), 'the light (off when it comes) switches on');
    await pg.click('#roomed [data-a="undo"]'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(id => { const q = ROOMED._api().lightsAll().find(x => x.id === id); return q.L.userData.on === false && q.L.intensity === 0; }, lid), 'UNDO takes it back: off');
    await pg.screenshot({ path: process.env.SHOT || '/tmp/roomedit.png' });
    const n = (await db()).added, tbx = await T(bed);
    await pg.keyboard.press('t'); await pg.waitForTimeout(600);
    const saved = await pg.evaluate(() => JSON.parse(__dbg.SAVE.get('home') || 'null'));
    ok(saved && saved.wall === 'brick' && saved.added.length === n && saved.added.every(a => a.paid > 0) && !(await db()).on, 'DONE closes the editor and saves the room (' + n + ' things)');
    await start('');
    const back = await pg.evaluate(id => { const A = ROOMED._api(), un = A.units().find(u => u.id === id); return { wall: A.R.wall, floor: A.R.floor, kfloor: A.R.kfloorK, added: A.units().filter(u => u.added).length, all: A.units().length, t: un && A.getT(un) }; }, bed);
    ok(back.wall === 'brick' && back.floor === 'checker' && back.added === n && back.all === n + own && back.t && Math.abs(back.t.u - tbx.u) < .01 && Math.abs(back.t.ry - tbx.ry) < .01, 'after a reload the room is as you left it (' + JSON.stringify({ wall: back.wall, floor: back.floor, added: back.added, all: back.all }) + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all room editor checks passed');
  process.exit(fails.length ? 1 : 0);
})();
