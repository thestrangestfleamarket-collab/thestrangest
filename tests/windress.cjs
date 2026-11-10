// THE WINDOWS' DRESSING: node tests/windress.cjs [dist/market.html]. Your apartment's windows: double-click opens the menu, curtains and blinds go up on one window and on all of them, the morning sun throws rays through the glass, the dressing is in the saved layout and comes back from it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=windress::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const pg = await b.newPage({ viewport: { width: 900, height: 600 } }); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&npcwait=99&hour=9&place=your%20apartment', { waitUntil: 'commit', timeout: 180000 });
  for (let i = 0; i < 240; i++) { await pg.waitForTimeout(1000); if (await pg.evaluate(() => !!window.__started).catch(() => false)) break; }
  for(let i=0;i<60;i++){ await pg.waitForTimeout(2000); if(await pg.evaluate(()=>window.WINDRDBG&&WINDRDBG().n>0).catch(()=>false))break; } await pg.waitForTimeout(2000);
  const r = await pg.evaluate(async () => { const D = WINDRDBG(), n = D.n; D.pick(0); const menu = WINDRDBG().open; D.click('b', 'venetian'); D.click('c', 'velvet'); D.click('all'); D.click('close');
    await new Promise(r => setTimeout(r, 2500)); const d = WINDRDBG(), L = ROOMED.snapshot(); ROOMED.apply({ ...L, win: L.win.map(() => ({ c: 'none', b: 'none' })) }); const cleared = WINDRDBG().d.every(x => x.c === 'none' && x.b === 'none');
    ROOMED.apply(L); return { n, menu, every: d.d.every(x => x.c === 'velvet' && x.b === 'venetian'), cloth: d.cloth, lit: d.lit, saved: L.win && L.win[0], cleared, back: WINDRDBG().d.every(x => x.c === 'velvet') }; });
  ok(r.n >= 4 && r.menu, 'double-clicking a window opens its menu (' + r.n + ' windows)');
  ok(r.every && r.cloth >= 2 * r.n, 'velvet curtains (as cloth) and venetian blinds on every window (' + r.cloth + ' panels)');
  ok(r.lit > 0, 'the morning sun throws rays through ' + r.lit + ' windows');
  ok(r.saved && r.saved.c === 'velvet' && r.saved.b === 'venetian' && r.cleared && r.back, 'the dressing is saved with the apartment and comes back from it');
  { await pg.evaluate(() => { for (const W of WINDR.wins) W.open = true; }); let aw = 1; for (let i = 0; i < 100 && aw; i++) { await pg.waitForTimeout(3000); aw = await pg.evaluate(() => WINDRDBG().awake); }
    ok(aw === 0, 'windows open and you standing still, every curtain comes to rest and stays (owner, 10 Nov 2026: nothing in the apartment moves on its own but fish, animals and water)'); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'windress: all good'); process.exit(fails.length ? 1 : 0); })();
