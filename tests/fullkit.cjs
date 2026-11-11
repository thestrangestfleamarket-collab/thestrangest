// THE FULL KIT: a player sent the kit from TENANTS (OWNED 'gift') finds it in the bag at the next start, once.
const { chromium: C0 } = require('playwright'), chromium = { launch: o => C0.launch({ ...o, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) }) }, path = require('path');
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 } }), errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.addInitScript(() => { if (!sessionStorage.getItem('k')) { sessionStorage.setItem('k', '1'); localStorage.setItem('market-save', JSON.stringify({ v: 5, gift: 'kit' })); } });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  await pg.waitForTimeout(2000);
  const r = await pg.evaluate(() => ({ it: { ...INV.items }, gift: JSON.parse(localStorage.getItem('market-save')).gift ?? null, arch: Object.keys(INV.items).filter(id => ARCHI(id) && !['mortar', 'passport'].includes(id)) }));
  ok(r.gift === null, 'the gift is taken once');
  for (const id of ['guitar', 'piano', 'drums', 'harp', 'kart', 'board_pine', 'board_teal', 'bmx', 'skateboard', 'rod', 'bait', 'sword', 'sword_ench', 'net', 'bnet', 'cage', 'bseed', 'kite', 'binoc', 'camera', 'headlight', 'goggles', 'balloon', 'bee_smoker'])
    ok(r.it[id] >= 1, 'in the bag: ' + id);
  ok(['shroom_fly', 'shroom_invis', 'airshroom'].every(id => r.it[id] >= 99) && r.it.m_button >= 20, '99 of each power mushroom, 20 of the healing ones');
  ok(r.it.scuba >= 1, 'the scuba set is in the kit (bought, no longer rented)');
  ok(!r.arch.length, 'nothing archived: ' + r.arch.join(','));
  console.log(Object.keys(r.it).length + ' kinds: ' + Object.keys(r.it).join(' '));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); process.exit(bad ? 1 : 0);
})();
