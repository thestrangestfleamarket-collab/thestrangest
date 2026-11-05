// THE TYPEWRITER CHECK: node tests/typewriter.cjs dist/market.html. The machine on its desk in your apartment; double-click opens it (its window's code loads only then); keys strike and the carriage steps, the bell rings before the margin, the keys lock at the margin, the return throws the carriage back a line down, backspace only overstrikes, a page pulled out is yours to hang.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=typewriter::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 700 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.TYPERDBG && TYPERDBG().unit)); i++) await pg.waitForTimeout(1000);
    const d0 = await pg.evaluate(() => TYPERDBG());
    ok(d0.unit && d0.thing, 'the typewriter stands on its desk in the room, to double-click');
    ok(await pg.evaluate(() => GPH.loose().filter(i => i.name === 'CHAIR').length >= 3), 'its chair is a loose thing like the room\'s chairs');
    ok(await pg.evaluate(() => !!ROOMED._api().units().find(u => u.kind === 'WRITING DESK')), 'the desk is a unit the room editor moves');
    await pg.evaluate(() => __dbg.UI.things.find(t => t.name === 'TYPEWRITER').act());
    for (let i = 0; i < 20 && !(await pg.evaluate(() => TYPERDBG().on)); i++) await pg.waitForTimeout(250);
    const G = await pg.evaluate(() => TYPER.G), d1 = await pg.evaluate(() => TYPERDBG());
    ok(d1.on && d1.sheet && d1.col === G.LM && d1.row === G.TOP, 'a double click opens it: a sheet in, at the left margin, the third line (' + JSON.stringify(d1) + ')');
    await pg.keyboard.type('Hello world', { delay: 30 }); await pg.waitForTimeout(500);
    const d2 = await pg.evaluate(() => TYPERDBG());
    ok(d2.n === 10 && d2.col === G.LM + 11 && Math.abs(d2.carX - d2.col) < .3, 'each key strikes a letter and the carriage steps on (the space strikes nothing) (' + JSON.stringify([d2.n, d2.col, d2.carX]) + ')');
    await pg.keyboard.type('x'.repeat(G.RM - G.LM - 11 + 4), { delay: 5 }); await pg.waitForTimeout(400);
    const d3 = await pg.evaluate(() => TYPERDBG());
    ok(d3.bells === 1, 'the bell rings once, five letters before the margin (' + d3.bells + ')');
    ok(d3.col === G.RM && d3.n === 10 + (G.RM - G.LM - 11), 'at the margin the keys lock: nothing more strikes (' + JSON.stringify([d3.col, d3.n]) + ')');
    const ret = await pg.evaluate(async () => { const T = []; TYPER.cr(); for (let i = 0; i < 12; i++) { await new Promise(r => setTimeout(r, 60)); T.push(TYPERDBG().carX); } return T; });
    const d4 = await pg.evaluate(() => TYPERDBG());
    ok(d4.row === G.TOP + 1 && d4.col === G.LM && Math.abs(d4.carX - G.LM) < .5 && ret.some(x => x > G.LM + 2), 'the return throws the carriage back to the margin, a line down (' + ret.map(x => x.toFixed(1)).join(' ') + ')');
    await pg.keyboard.press('O'); await pg.keyboard.press('Backspace'); await pg.keyboard.press('/'); await pg.waitForTimeout(200);
    const ov = await pg.evaluate(() => { const k = TYPER.dec(TYPER.st.s).filter(k => k.r === TYPER.st.row); return k.map(q => q.c + q.ch); });
    ok(ov.length === 2 && ov[0] === G.LM + 'O' && ov[1] === G.LM + '/', 'backspace only steps back: the next letter strikes over the last (' + ov + ')');
    const pages0 = d4.pages; await pg.evaluate(() => TYPER.pullOut()); const d5 = await pg.evaluate(() => TYPERDBG());
    const pk = await pg.evaluate(() => { const p = TYPER.pages[TYPER.pages.length - 1], K = ROOMED._api().kinds()['pg:' + p.id]; return { t: p.t, k: !!K, wall: K && K.mount, tpl: !!(K && K.tpl && K.tpl.isObject3D) }; });
    ok(d5.pages === pages0 + 1 && !d5.sheet && pk.t === 'HELLO WORLDXXXXXXXXXXXXXXXXX' && pk.k && pk.wall === 'wall' && pk.tpl, 'the page pulled out is yours: a sheet to hang from DECORATE (' + JSON.stringify(pk) + ')');
    await pg.keyboard.press('a'); ok((await pg.evaluate(() => TYPERDBG())).n === 0, 'with no paper in, the keys strike nothing');
    await pg.click('#typerp button[data-a=new]'); ok((await pg.evaluate(() => TYPERDBG())).sheet, 'NEW SHEET rolls a fresh one in');
    await pg.keyboard.type('tTt wasd', { delay: 30 }); const kt = await pg.evaluate(() => ({ n: TYPERDBG().n, deco: !!(window.ROOMED && ROOMED.on) }));
    ok(kt.n === 7 && !kt.deco, 'every key types, even the game\'s own keys (T is not DECORATE here) (' + JSON.stringify(kt) + ')');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    ok(!(await pg.evaluate(() => TYPERDBG().on)), 'Escape closes it');
    if (process.env.SHOT) { await pg.evaluate(() => { TYPER.open(); }); await pg.waitForTimeout(500); await pg.keyboard.type('The strangest flea market. ', { delay: 40 }); await pg.waitForTimeout(400); await pg.screenshot({ path: process.env.SHOT }); }
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all typewriter checks passed');
  process.exit(fails.length ? 1 : 0);
})();
