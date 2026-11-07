// THE GUIDE CHECK: node tests/guide.cjs dist/market.html. The guide is out of the game and the menu (owner, 7 Nov 2026: "no bbs, no guide"): Shift+G opens nothing and the menu has no GUIDE.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=guide::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 }); await pg.waitForTimeout(1500);
  await pg.keyboard.press('Shift+G'); await pg.waitForTimeout(1500);
  const a = await pg.evaluate(() => { const P = document.getElementById('dguide'); return { shown: !!(P && !P.hidden && P.offsetParent), menu: !!__UI.menuOpen }; });
  ok(!a.shown && !a.menu, 'Shift+G opens no guide: ' + JSON.stringify(a));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(800);
  const s = await pg.evaluate(() => [...document.querySelectorAll('#mnav [data-sec]')].map(x => x.dataset.sec).join());
  ok(!/guide/.test(s), 'the menu has no GUIDE: ' + s);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
