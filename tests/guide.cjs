// THE GUIDE CHECK: node tests/guide.cjs dist/market.html. Shift+G opens the menu's GUIDE tab: every chapter has steps, the ones with pictures show them, a chapter button changes the page, Shift+G closes it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=guide::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 }); await pg.waitForTimeout(1500);
  await pg.keyboard.press('Shift+G'); await pg.waitForFunction(() => document.querySelector('#dguide [data-gc]'), null, { timeout: 60000 });
  const a = await pg.evaluate(() => { const P = document.getElementById('dguide'), n = P.querySelectorAll('[data-gc]').length; return { open: !P.hidden, n, first: P.querySelector('h3').textContent, steps: P.querySelectorAll('li').length, img: !!P.querySelector('img') }; });
  ok(a.open && a.n >= 20 && a.first === 'GETTING STARTED' && a.steps >= 4 && a.img, 'Shift+G opens the GUIDE tab on its first chapter, with steps and a picture: ' + JSON.stringify(a));
  const all = await pg.evaluate(() => { const P = document.getElementById('dguide'), out = []; for (const btn of [...P.querySelectorAll('[data-gc]')]) { P.querySelector('[data-gc="' + btn.dataset.gc + '"]').click(); out.push([P.querySelector('h3').textContent, P.querySelectorAll('li').length, !!P.querySelector('img'), P.querySelectorAll('.gk').length]); } return out; });
  ok(all.every(c => c[1] >= 3), 'every chapter has at least three steps: ' + all.map(c => c[0] + ' ' + c[1]).join(', '));
  ok(all.filter(c => c[2]).length >= 12 && all.some(c => c[3] > 0), 'chapters have pictures (' + all.filter(c => c[2]).length + ') and keys drawn as key caps');
  await pg.evaluate(() => { const P = document.getElementById('dguide'); [...P.querySelectorAll('[data-gc]')].find(x => x.textContent === 'FISHING').click(); }); await pg.waitForTimeout(400);
  if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT });
  await pg.keyboard.press('Shift+G'); await pg.waitForTimeout(400);
  const c = await pg.evaluate(() => !!__dbg.UI.menuOpen); ok(!c, 'Shift+G closes it again');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all guide checks passed'); process.exit(fails.length ? 1 : 0);
})();
