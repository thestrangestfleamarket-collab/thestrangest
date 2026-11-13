// THE BANK'S SAFE: node tests/banksafe.cjs dist/market.html [shot.png]. Once, what you carry but what you wear and your tools goes into your safe, and your gold; a price is paid from what you carry, then from the bank; you take gold out at the safe; saying BANK by the bank opens it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=banksafe::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&bank=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    let moved = false; for (let i = 0; i < 40 && !moved; i++) { await pg.waitForTimeout(500); moved = await pg.evaluate(() => VAULT.moved()); }
    ok(moved, 'the move into the safe ran once');
    const r = await pg.evaluate(() => { const carried = BAG.contents('bag'), safe = VAULT.items(); return { cash: INV.cash, bal: BANKK.account().bal, carried, kept: carried.filter(id => !VAULT.keeps(id) && !id.includes('~')), safe: Object.keys(safe).length, again: VAULT.moveIn() }; });
    ok(r.cash === 0 && r.bal >= 1000, 'your gold is in the bank: on you $' + r.cash + ', in the safe $' + r.bal);
    ok(r.kept.length === 0, 'you carry only what you wear and your tools: ' + r.carried.join(', ') + (r.kept.length ? ' (not tools: ' + r.kept.join(', ') + ')' : ''));
    ok(r.safe > 0, 'the rest is in the safe (' + r.safe + ' kinds)');
    ok(r.again === false, 'the move never runs twice');
    const p = await pg.evaluate(() => { const b0 = BANKK.account().bal, a = INV.pay(50), b1 = BANKK.account().bal; BANKK.move(-100); const c0 = INV.cash; INV.pay(30); return { a, from: b0 - b1, c0, c1: INV.cash, b2: BANKK.account().bal, b1, no: INV.pay(1e9), big: INV.afford(1e9) }; });
    ok(p.a && p.from === 50, 'a price you cannot carry comes out of the bank');
    ok(p.c0 === 100 && p.c1 === 70 && p.b2 === p.b1 - 100, 'gold you take out pays first: $' + p.c1 + ' on you');
    ok(p.no === false && p.big === false, 'what you cannot afford is refused');
    const at = await pg.evaluate(() => { const s = VAULT.spot(); __UI.goTo(s[0], s[1], 'up'); return VAULT.near(); });
    ok(at, 'in front of the bank counts as at the bank');
    await pg.evaluate(() => ONLINE.said('BANK')); await pg.waitForTimeout(500);
    const open = await pg.evaluate(() => { const w = document.getElementById('vaultw'); return !!w && !w.hidden && /YOUR SAFE/.test(w.textContent); });
    ok(open, 'saying BANK opens your safe');
    if (process.argv[3]) { await pg.evaluate(() => { document.getElementById('vaultw').style.zIndex = 99999; }); const bb = await pg.evaluate(() => { const r = document.getElementById('vaultw').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }); await pg.screenshot({ path: process.argv[3], clip: bb }); }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
