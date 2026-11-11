// THE CAR RADIO CHECK: node tests/radio.cjs dist/market.html. In a car T tunes the radio through its stations and off; the station plays the moment everyone hears (the clock's seconds); getting out turns it off; another player's car with its radio on is heard nearby, muffled, and not once they leave it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=radio::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&physics=1&scanin=9999&at=-25,-8', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.CARS && CARS.dbg().loaded, null, { timeout: 400000, polling: 500 });
  await pg.evaluate(() => CARS.getIn('c7')); await pg.waitForTimeout(1500); await pg.mouse.click(480, 80);
  await pg.keyboard.press('t'); await pg.waitForFunction(() => { const c = CARS.radio().ch.jazz; return c && !c.paused; }, null, { timeout: 60000 }).catch(() => {});
  let sync = 99; for (let i = 0; i < 20 && sync > .5; i++) { await pg.waitForTimeout(1000); const c = (await pg.evaluate(() => CARS.radio())).ch.jazz; if (c && !c.paused) sync = Math.abs(c.t - c.want); }
  const r1 = await pg.evaluate(() => ({ ...CARS.radio(), hud: document.getElementById('carhud').innerText }));
  ok(r1.mine === 1 && r1.ch.jazz && !r1.ch.jazz.paused && r1.ch.jazz.g > .5 && /WJAZ/.test(r1.hud) && sync < 1.6, 'T turns the radio on: the first station plays loud in the car, at the moment everyone hears: ' + JSON.stringify({ mine: r1.mine, jazz: r1.ch.jazz, sync: +sync.toFixed(2), hud: r1.hud.split('\n')[0] }));
  const seen = []; for (let i = 0; i < 4; i++) { await pg.keyboard.press('t'); await pg.waitForTimeout(400); seen.push(await pg.evaluate(() => CARS.radio().mine)); }
  ok(seen.join() === '2,3,4,0', 'T goes through the stations and off: ' + seen.join());
  await pg.keyboard.press('t'); await pg.waitForTimeout(1500); await pg.keyboard.press('f');
  await pg.waitForFunction(() => { const r = CARS.radio(); return r.ch.jazz && r.ch.jazz.paused; }, null, { timeout: 15000, polling: 200 }).catch(() => {});   // the quiet channel is paused on a frame 1.5 s after it fades: wait for it, not a fixed time
  const r2 = await pg.evaluate(() => ({ ...CARS.radio(), w: ONLINE.world['radio:c7'] }));
  ok(r2.w === 0 && r2.ch.jazz && r2.ch.jazz.paused, 'getting out turns it off: ' + JSON.stringify({ w: r2.w, jazz: r2.ch.jazz }));
  await pg.evaluate(() => { ONLINE.feed({ t: 'car', k: 'c7', by: 'a' }); ONLINE.feed({ t: 'world', k: 'radio:c7', v: 3 }); });
  await pg.waitForFunction(() => { const c = CARS.radio().ch.rag; return c && !c.paused && c.g > .05; }, null, { timeout: 20000, polling: 250 }).catch(() => {});   // (the station's file is still loading on a slow runner: wait for it to play, not a fixed time)
  const r3 = await pg.evaluate(() => CARS.radio());
  ok(r3.ch.rag && !r3.ch.rag.paused && r3.ch.rag.g > .05 && r3.ch.rag.g < .56, 'another player\'s car with its radio on is heard beside it, muffled: ' + JSON.stringify(r3.ch.rag));
  await pg.evaluate(() => ONLINE.feed({ t: 'car', k: 'c7', by: null })); await pg.waitForFunction(() => { const c = CARS.radio().ch.rag; return c && c.paused; }, null, { timeout: 20000, polling: 500 }).catch(() => {}); const r4 = await pg.evaluate(() => CARS.radio());
  ok(r4.ch.rag && r4.ch.rag.paused, 'once they leave it, it is quiet: ' + JSON.stringify(r4.ch.rag));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all radio checks passed'); process.exit(fails.length ? 1 : 0);
})();
