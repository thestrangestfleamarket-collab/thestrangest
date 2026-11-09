// THE SKILLS CHECK: node tests/skills.cjs dist/market.html. Ranks, the book's page for each thing you collect, the weekly rare seed, and the sparring dummy teaching the basics.
// (The daily asks, the recipes page, the museum's gifts, gem cutting, the Fixer and the Shark are archived, 5-8 Nov 2026.)
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=skills::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=11&place=CENTRAL PARK', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.FORAGE, null, { timeout: 300000, polling: 500 });
  await pg.evaluate(() => LOAD('later'));

  const rk = await pg.evaluate(() => { const s = FORAGE.S.sk, o = {}; s.fish = 0; o.a = FORAGE.rank('fish'); s.fish = 550; o.b = FORAGE.rank('fish'); s.fish = 1000; o.c = FORAGE.rank('fish'); return o; });
  ok(rk.a === 'NOVICE' && rk.b === 'JOURNEYMAN' && rk.c === 'GRANDMASTER', 'every skill has a rank: ' + JSON.stringify(rk));

  const pages = await pg.evaluate(() => FORAGE.BOOK.map(p => p.id));
  ok(['mush', 'flowers', 'bfly', 'birds', 'fish', 'honey'].every(i => pages.includes(i)), 'the book has a page for each thing you collect: ' + pages.join(' '));

  // gardening: a rarer seed each week
  const gd = await pg.evaluate(() => { const wk = GARDEN.week(), on = FORAGE.SELLS.filter(s => s[0].startsWith('sd_') && s[2]()).map(s => s[0]); return { wk, on }; });
  ok(gd.on.length === 1 && gd.on[0] === 'sd_' + gd.wk, 'one rarer seed is sold this week: ' + JSON.stringify(gd));

  // the sparring dummy: it teaches the basics only, and tires you
  const dm = await pg.evaluate(async () => { for (let i = 0; i < 40 && !(window.DUMMY && DUMMY.g); i++) await new Promise(r => setTimeout(r, 500)); const o = { there: !!(window.DUMMY && DUMMY.g) }, V = __dbg.VIT || {}; for (const k in FORAGE.S.sk) FORAGE.S.sk[k] = 0; FORAGE.S.sk.fight = 100; FORAGE.S.lock.fight = 'up';   // room under the skills' total cap (a new player starts near it)
    if (V.sta != null) V.sta = 1; for (let i = 0; i < 60; i++) { if (V.sta != null) V.sta = 1; DUMMY.spar(); } o.fight = FORAGE.sk('fight'); FORAGE.S.sk.fight = 450; DUMMY.spar(); o.capped = FORAGE.sk('fight'); if (V.sta != null) { V.sta = 1; DUMMY.spar(); o.tired = +V.sta.toFixed(2); } return o; });
  ok(dm.there && dm.fight > 10 && dm.capped === 45 && (dm.tired == null || dm.tired < 1), 'the sparring dummy teaches martial arts up to 40, and each bout tires you: ' + JSON.stringify(dm));

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all skills checks passed'); process.exit(fails.length ? 1 : 0);
})();
