// THE APARTMENT'S OWN PIECES (owner, 7 Nov 2026): a fresh apartment, not furnished, still has the CRT TV, the typewriter's writing desk, the telescope, the globes, the microscope's desk and stool and the fish tank, with koi in it. node tests/aptfixed.cjs [dist/market.html]
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=aptfixed::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const want = ['CRT TV', 'WRITING DESK', 'TELESCOPE', 'EARTH GLOBE', 'GLOBE TABLE', 'LAB DESK', 'LAB STOOL', 'FISH TANK'];
    let d = null; for (let i = 0; i < 40; i++) { d = await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG()); if (d && d.built && want.every(k => d.kinds.includes(k))) break; await pg.waitForTimeout(1000); }
    ok(d && want.every(k => d.kinds.includes(k)), 'a fresh apartment has its own pieces: ' + JSON.stringify(d && d.kinds));
    ok(d && d.kinds.every(k => want.includes(k)), 'and nothing else until you buy it');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
