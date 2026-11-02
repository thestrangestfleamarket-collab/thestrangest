// THE HANDHELD CHECK: node tests/handheld.cjs dist/market.html [folder for screenshots]. ESC pops up the handheld; its icons open the menus; ESC out of a menu it opened comes back to it; ESC again puts it away; ADMIN only for owners.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=handheld::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
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
  const menuOpen = () => pg.evaluate(() => !document.getElementById('menu').hidden);
  if (st) {
    await pg.keyboard.press('Escape');
    ok(await until(() => HHDBG().up), 'ESC pops up the handheld');
    ok(!(await menuOpen()), 'the old menu stays shut');
    ok(await pg.evaluate(() => !document.querySelector('#hh [data-app="admin"]')), 'no ADMIN for a player');
    await pg.waitForTimeout(800); await shot('home');
    await tap('#hh [data-app="set"]'); ok(await until(() => !HHDBG().up) && await menuOpen(), 'SET opens the settings');
    await pg.keyboard.press('Escape'); ok(await until(() => HHDBG().up) && !(await menuOpen()), 'ESC out of settings comes back to the handheld');
    await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('Enter'); ok(await until(() => !HHDBG().up && FORAGE.PACK && FORAGE.PACK.open), 'the arrows and RETURN open the PACK');
    await pg.evaluate(() => FORAGE.PACK.toggle());
    await pg.keyboard.press('Escape'); await until(() => HHDBG().up);
    await tap('#hh [data-app="people"]'); ok(await until(() => HHDBG().page === 'people'), 'PEOPLE lists who is on');
    await pg.keyboard.press('Escape'); ok(await until(() => HHDBG().up && HHDBG().page === 'home'), 'ESC goes back to the icons');
    await pg.keyboard.press('Escape'); ok(await until(() => !HHDBG().up), 'ESC again puts it away');
    await pg.keyboard.press('Escape'); await until(() => HHDBG().up);
    await tap('#hh [data-app="bbs"]'); ok(await until(() => window.DRONEDBG && DRONEDBG().on && DRONEDBG().page === 'menu'), 'BBS opens the BBS at its menu');
    await pg.evaluate(() => DRONE.close());
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
