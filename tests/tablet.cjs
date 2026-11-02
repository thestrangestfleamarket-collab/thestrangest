// THE TABLET CHECK: node tests/tablet.cjs dist/market.html [folder for screenshots]. Everyone has one; TAB raises it in your hands with the screen up, its apps open what they name, TAB again puts it away.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=tablet::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true }); let n = 0;
  const shot = async name => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 180000 }); };
  const tap = sel => pg.evaluate(s => document.querySelector(s).click(), sel);
  const until = async (f, ms = 20000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  if (st) {
    ok(await until(() => TABLETDBG().has), 'everyone carries a tablet');
    await pg.keyboard.press('Tab');
    ok(await until(() => TABLETDBG().open && TABLETDBG().held), 'TAB pulls it up: in your hands, the screen awake');
    ok(await until(() => TABLETDBG().model), 'its model came');
    ok(await pg.isVisible('#tablet .app[data-app="call"]'), 'the home screen shows its apps');
    await pg.waitForTimeout(1500); await shot('up');
    await tap('#tablet .app[data-app="players"]'); ok(await pg.isVisible('#tablet [data-home]'), 'PLAYERS lists who is on');
    await tap('#tablet [data-home]');
    await tap('#tablet .app[data-app="call"]'); ok(await pg.evaluate(() => document.getElementById('tablet').hidden), 'CALL hands over to the dial');
    await pg.evaluate(() => { for (const d of document.querySelectorAll('body>div')) if (/WHO ARE WE CALLING/.test(d.textContent)) d.hidden = true; }); await pg.waitForTimeout(1500); await shot('held');
    await pg.evaluate(() => WIELD.strike()); ok(await until(() => TABLETDBG().open), 'a click on the held tablet wakes the screen');
    await pg.keyboard.press('Tab');
    ok(await until(() => !TABLETDBG().open && !TABLETDBG().held), 'TAB again puts it away');
    await shot('away');
    await pg.keyboard.press('Tab'); await until(() => TABLETDBG().open);
    await tap('#tablet .app[data-app="order"]'); ok(await until(() => window.DRONEDBG && DRONEDBG().on && DRONEDBG().page === 'menu'), 'ORDER opens the BBS at its menu');
    await shot('order'); await pg.evaluate(() => DRONE.close());
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
