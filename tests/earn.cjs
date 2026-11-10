// THE EARNING CHECK: node tests/earn.cjs dist/market.html. Every skill pays somewhere: a known kind sells for more (WORTH.know), the new trainer ladders (prints too), loot with a buyer, the Squirrel's bounties, and no dead skill keys.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=earn::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWEXE ? { executablePath: process.env.PWEXE } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&at=40,150&res=0', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const r = await pg.evaluate(async () => { await LOAD('later'); INV.cash += 1000;
      FORAGE.train('alch'); FORAGE.train('prosp'); const tot = Object.values(FORAGE.S ? FORAGE.S.sk : {}).every(v => Number.isFinite(+v));
      const k0 = WORTH.of('m_button', 1, 10); const lad = TRAINERS.skills();
      const p = { id: 'photo_test1', cap: 'A MONARCH', src: '', v: 12, sub: 'b_3' }; PHOTOS.own(p); TRAINERS.set('photo', 0); const c0 = INV.cash, ask = TRAINERS.ask('photo'); for (let i = 0; i < 2; i++) PHOTOS.own({ ...p, id: 'photo_test' + (i + 2) });
      const handed = TRAINERS.hand('photo'), paid = INV.cash - c0, left = PHOTOS.mine.filter(q => /^photo_test/.test(q.id)).length;
      const sq = [...__dbg.NPCS, ...(__dbg.NPCS.extra || [])].find(N => N.key === 'squirrel'), talk = sq && TALK.script(sq), bounty = !!(talk && talk.lines && talk.lines.board);
      return { tot, k0, lad, ask: ask && ask.item, handed, paid, left, bounty, anti: FORAGE.BUYK.antiquities, gems: FORAGE.BUYK.gems.includes('raw_geode'), cabs: STORE.cabs && [...STORE.cabs.list ? STORE.cabs.list : []].map(c => c.skill) }; });
    ok(r.tot, 'lessons in unknown skills no longer break the skill total');
    ok(r.k0 >= 10, 'a known kind sells at its worth or more (' + r.k0 + ' for 10)');
    ok(['forage', 'sword', 'fight', 'climb', 'photo', 'bird'].every(k => r.lad.includes(k)), 'the new trainer ladders are there (' + r.lad.join(',') + ')');
    ok(r.ask === 'photo:b_' && r.handed && r.paid > 0 && r.left === 0, 'prints of butterflies hand in to the Forest Ranger ($' + r.paid + ')');
    ok(r.bounty, 'the Squirrel offers the bounties');
    ok(r.anti.includes('doubloon') && r.anti.includes('va_') && r.gems, 'the Hudson salvage, the vault finds and raw geodes have a buyer');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
