// THE CRT TV CHECK: node tests/crt.cjs dist/market.html (owner, 10 Nov 2026): the set in a fresh apartment opens its panel; nine channels with THE GUIDE; the guide lists cartoons, shows and films and plays a pick; the state is told to the room, heard from it and kept in the layout; ZOOM IN and FULL SCREEN show the picture close up.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=crt::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=21&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    let d = null; for (let i = 0; i < 40; i++) { d = await pg.evaluate(() => window.CRTDBG && CRTDBG()); if (d && d.thing && d.unit) break; await pg.waitForTimeout(1000); }
    ok(d && d.thing && d.unit, 'a fresh apartment has its CRT TV, to double-click');
    await pg.evaluate(async () => { const A = __dbg.MAPK.MODS.apts; if (!A.inReal) await A.enterReal(); for (let i = 0; i < 40 && (window.FADE && FADE.busy); i++) await new Promise(r => setTimeout(r, 250)); });
    // stand before it, looking at its screen, in first person
    await pg.evaluate(() => { const un = ROOMED._api().units().find(u => u.kind === 'CRT TV'); un.obj.updateWorldMatrix(true, false); const e = un.obj.matrixWorld.elements, M = ROOMED._api().M, l = Math.hypot(e[8], e[10]) || 1, dx = e[8] / l, dz = e[10] / l;
      __dbg.UI.goTo(e[12] + dx * 1.7 * M, e[14] + dz * 1.7 * M, SHARED.py); SHARED.yawTo = SHARED.yaw = Math.atan2(dx, dz); __dbg.UI.setView && __dbg.UI.setView('first'); });
    await pg.waitForTimeout(2500);
    await pg.evaluate(() => { window.__sent = []; ONLINE.on = true; ONLINE.send = m => __sent.push(m); });
    await pg.evaluate(() => __dbg.UI.things.find(t => /^CRT TV/.test(t.name)).act());
    for (let i = 0; i < 30 && !(await pg.evaluate(() => CRTDBG().panel && CRTDBG().data)); i++) await pg.waitForTimeout(500);
    const C = { noWaitAfter: true, timeout: 90000 };
    ok(await pg.$$eval('#crtp [data-c]', e => e.map(x => x.dataset.c).join()) === '2,3,4,5,6,7,9,11,13', 'a double click opens its panel: channels 2, 3 (THE GUIDE), 4, 5, 6, 7, 9, 11, 13');
    await pg.click('#crtp [data-c="3"]', C); await pg.waitForTimeout(1500);
    const g = await pg.evaluate(() => CRTDBG());
    ok(g.on && g.ch === 3 && g.lists && g.lists.cartoons >= 60 && g.lists.shows >= 30 && g.lists.movies >= 10 && g.pic === 'guide', 'THE GUIDE: its page on the screen, cartoons, shows and films to pick (' + JSON.stringify({ lists: g.lists, pic: g.pic }) + ')');
    ok(__sentLast(await pg.evaluate(() => __sent)), 'turning to it is told to the room');
    await pg.click('#crtp [data-t="shows"]', C); await pg.waitForTimeout(300);
    const title = await pg.$eval('#crtp .gl .it', e => e.firstChild.textContent); await pg.click('#crtp .gl .it', C); await pg.waitForTimeout(1500);
    const p = await pg.evaluate(() => ({ d: CRTDBG(), s: __sent[__sent.length - 1] }));
    ok(p.d.live && p.d.pick && title.startsWith(p.d.pick) && /\/download\/|\/film\//.test(p.d.src), 'a show picked from the guide plays from its start (' + JSON.stringify({ pick: p.d.pick, src: p.d.src }) + ')');
    ok(p.s && p.s.t === 'tv' && p.s.ch === 3 && p.s.p && p.s.p.title === p.d.pick && p.s.t0 > 0, 'the pick is told to the room: everyone here watches it from the same moment');
    await pg.waitForTimeout(1500);
    const saved = await pg.evaluate(() => JSON.parse(__dbg.SAVE.get('home') || 'null'));
    ok(saved && saved.tv && saved.tv.on === 1 && saved.tv.ch === 3 && saved.tv.p && saved.tv.p.title === p.d.pick, 'it is kept with the layout, for a visitor who comes in later (' + JSON.stringify(saved && saved.tv && { ch: saved.tv.ch, p: saved.tv.p && saved.tv.p.title }) + ')');
    await pg.evaluate(() => ONLINE.hear.tv({ t: 'tv', id: 'x', on: 1, ch: 6, p: null, t0: 0 })); await pg.waitForTimeout(800);
    const h = await pg.evaluate(() => CRTDBG());
    ok(h.on && h.ch === 6 && !h.pick, 'a change from someone else in the room turns this set too (' + JSON.stringify({ ch: h.ch, pick: h.pick }) + ')');
    await pg.evaluate(() => CRT.close()); await pg.waitForTimeout(2500); await pg.screenshot({ path: (process.env.SHOT || '/tmp/crt') + '-room.png' }); await pg.evaluate(() => CRT.open()); await pg.waitForTimeout(800);
    await pg.click('#crtp [data-c="3"]', C); await pg.waitForTimeout(800);
    await pg.click('#crtp [data-a="zoom"]', C); await pg.waitForTimeout(1500);
    const w = await pg.evaluate(() => ({ d: CRTDBG(), c: (() => { const c = document.querySelector('#crtw canvas'); return c && c.width; })(), vis: !document.getElementById('crtw').hidden }));
    ok(w.d.watch && w.vis && w.c > 300, 'ZOOM IN: the set fills the view (' + JSON.stringify({ watch: w.d.watch, w: w.c }) + ')');
    await pg.screenshot({ path: (process.env.SHOT || '/tmp/crt') + '-close.png' });
    const z0 = await pg.evaluate(() => CRTDBG().zoom); await pg.mouse.move(40, 300); await pg.mouse.wheel(0, -300); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => CRTDBG().zoom) > z0, 'the wheel zooms in closer');
    await pg.click('#crtw [data-w="full"]', C); await pg.waitForTimeout(1200);
    const f = await pg.evaluate(() => ({ d: CRTDBG(), h: document.querySelector('#crtw canvas').getBoundingClientRect().height }));
    ok(f.d.full && f.h >= 590, 'FULL SCREEN: the picture fills the screen (' + JSON.stringify({ full: f.d.full, h: f.h }) + ')');
    await pg.screenshot({ path: (process.env.SHOT || '/tmp/crt') + '-full.png' });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(800);
    ok(!(await pg.evaluate(() => CRTDBG().watch)), 'Esc goes back to the room');
    await pg.evaluate(async () => { await __dbg.MAPK.MODS.apts.exitReal(); for (let i = 0; i < 40 && (window.FADE && FADE.busy); i++) await new Promise(r => setTimeout(r, 250)); }); await pg.waitForTimeout(2000);
    const out = await pg.evaluate(() => CRTDBG());
    ok(out.on && !out.src && !out.panel, 'out of the apartment nothing streams (the set stays on for when you come back)');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
function __sentLast(s) { const m = s && s[s.length - 1]; return !!(m && m.t === 'tv' && m.ch === 3 && m.on === 1); }
