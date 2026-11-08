// THE SKILLS CHECK: node tests/skills.cjs dist/market.html. The other skills as things to do: ranks, the recipe and flower and finds pages, today's asks handed in for pay, gifts to the museum,
// cutting stones on a gem wheel, the Fixer buying ore, the weekly rare seed, and the sparring dummy teaching the basics.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=skills::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=11&place=CENTRAL PARK', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.FORAGE && FORAGE.asks && window.MINING, null, { timeout: 300000, polling: 500 });
  await pg.evaluate(() => LOAD('later'));

  const rk = await pg.evaluate(() => { const s = FORAGE.S.sk, o = {}; s.fish = 0; o.a = FORAGE.rank('fish'); s.fish = 550; o.b = FORAGE.rank('fish'); s.fish = 1000; o.c = FORAGE.rank('fish'); return o; });
  ok(rk.a === 'NOVICE' && rk.b === 'JOURNEYMAN' && rk.c === 'GRANDMASTER', 'every skill has a rank: ' + JSON.stringify(rk));

  const pages = await pg.evaluate(() => FORAGE.BOOK.map(p => p.id));
  ok(['recipes', 'mush', 'flowers', 'bfly', 'birds', 'fish', 'honey', 'finds', 'books'].every(i => pages.includes(i)), 'the book has a page for each thing you collect: ' + pages.join(' '));
  const rc = await pg.evaluate(() => { const row = () => FORAGE.BOOK.find(p => p.id === 'recipes').rows().find(r => r[0] === 'HEAL POTION'), before = row()[1]; FORAGE.S.sk.alchemy = 1000; FORAGE.give('m_chanterelle', 2); FORAGE.give('m_puffball'); FORAGE.give('bottle'); FORAGE.craft('p_heal'); return { before, after: row()[1], note: row()[2] }; });
  ok(rc.before === false && rc.after === true, 'a recipe fills in the book the first time you make it: ' + JSON.stringify(rc));

  // today's asks: three merchants, handed in for pay over the odds
  const ask = await pg.evaluate(() => { const A = FORAGE.asks(), a = A[0]; FORAGE.give(a.id, a.n); const c0 = INV.cash; FORAGE.hand(0); return { n: A.length, who: A.map(x => x.who), paid: INV.cash - c0, done: FORAGE.asks()[0].done, rows: FORAGE.askRows(a.who).includes('DONE') }; });
  ok(ask.n === 3 && new Set(ask.who).size === 3 && ask.paid > 0 && ask.done && ask.rows, "today's asks: three merchants, one handed in for pay and marked done in their shop: " + JSON.stringify(ask));

  // the museum takes the first of each find, specimen; cut stones on a gem wheel
  const mu = await pg.evaluate(() => { const here = STORE.here; STORE.here = id => id === 'museum'; const o = {}; FORAGE.give('jade', 2); const c0 = INV.cash; FORAGE.ACT.gift('jade'); o.paid = INV.cash - c0; o.again = FORAGE.ROWB.flatMap(f => f('jade')).map(x => x[0]).includes('DONATE');
    STORE.here = here;
    FORAGE.S.sk.prosp = 1000; FORAGE.craft('cut_jade'); o.noWheel = FORAGE.has('cut_jade'); FORAGE.give('gem_wheel'); FORAGE.craft('cut_jade'); o.cut = FORAGE.has('cut_jade'); o.worth = FORAGE.PRICE.cut_jade;
    o.page = FORAGE.BOOK.find(p => p.id === 'finds').rows().length; return o; });
  ok(mu.paid > 0 && !mu.again, 'the museum pays for its first jade, and only the first: ' + JSON.stringify(mu));
  ok(!mu.noWheel && mu.cut === 1 && mu.worth > 26 * 2 && mu.page === 22, 'a gem wheel cuts jade into a stone worth twice and more; the finds page lists 22: ' + JSON.stringify(mu));

  const tr = await pg.evaluate(() => ({ fixer: (CHARS.trade({ key: 'fixer' }) || {}).buys, ore: FORAGE.BUYK.ore, shark: (CHARS.trade({ key: 'shark' }) || {}).sells }));
  ok((tr.fixer || []).includes('ore') && (tr.ore || []).includes('goldnug') && (tr.shark || []).includes('gem_wheel'), 'the Fixer buys ore; the Shark sells a gem wheel: ' + JSON.stringify(tr));

  // gardening: a rarer seed each week
  const gd = await pg.evaluate(() => { const wk = GARDEN.week(), on = FORAGE.SELLS.filter(s => s[0].startsWith('sd_') && s[2]()).map(s => s[0]); return { wk, on }; });
  ok(gd.on.length === 1 && gd.on[0] === 'sd_' + gd.wk, 'one rarer seed is sold this week: ' + JSON.stringify(gd));

  // the sparring dummy: it teaches the basics only, and tires you
  const dm = await pg.evaluate(async () => { for (let i = 0; i < 40 && !(window.DUMMY && DUMMY.g); i++) await new Promise(r => setTimeout(r, 500)); const o = { there: !!(window.DUMMY && DUMMY.g) }, V = __dbg.VIT || {}; FORAGE.S.sk.fight = 100; FORAGE.S.lock.fight = 'up';
    if (V.sta != null) V.sta = 1; for (let i = 0; i < 60; i++) { if (V.sta != null) V.sta = 1; DUMMY.spar(); } o.fight = FORAGE.sk('fight'); FORAGE.S.sk.fight = 450; DUMMY.spar(); o.capped = FORAGE.sk('fight'); if (V.sta != null) { V.sta = 1; DUMMY.spar(); o.tired = +V.sta.toFixed(2); } return o; });
  ok(dm.there && dm.fight > 10 && dm.capped === 45 && (dm.tired == null || dm.tired < 1), 'the sparring dummy teaches martial arts up to 40, and each bout tires you: ' + JSON.stringify(dm));

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all skills checks passed'); process.exit(fails.length ? 1 : 0);
})();
