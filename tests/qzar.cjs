// THE SLOWFIRE CHECK: node tests/qzar.cjs [dist/qzar.html]. SLOWFIRE DUEL starts, a round against the bot begins and ends when the bot's health is gone, the shield holds until its power is spent, a gun can be dropped or thrown, and two linked pages see each other's shots and agree on who won the round; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=qzar::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/qzar.html'), ROOT = path.dirname(PAGE);
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': 'text/html' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'] });
  const errs = [], ctx = await b.newContext({ viewport: { width: 400, height: 240 } });
  const open = async hash => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); await pg.goto(URL + hash); await pg.waitForFunction(() => !!window.__qzar, null, { timeout: 60000 }).catch(() => {}); return pg; };
  const until = (pg, fn, arg) => pg.waitForFunction(fn, arg, { polling: 50, timeout: 60000 }).then(() => true, () => false);
  const pg = await open('');
  await pg.click('#start');
  ok(await until(pg, () => __qzar.state === 'play'), 'the page starts and a round against the bot begins');
  await pg.evaluate(() => { __qzar.foe.grabT = 1e9; __qzar.setHeld(__qzar.flatHand, 'buckler'); });
  await pg.waitForTimeout(5000);
  ok(await pg.evaluate(() => __qzar.flatHand.shieldP === 60), 'the shield does not time out');
  await pg.evaluate(() => { const q = __qzar, at = q.flatHand.shield.getWorldPosition(new q.V3()); q.spawn(q.foe, 'pip', new q.V3(at.x, at.y, at.z - 1), new q.V3(0, 0, 5)); });
  ok(await until(pg, () => __qzar.flatHand.shieldP === 52) && await pg.evaluate(() => __qzar.you.hp === 100), 'a shot it stops spends its power and does not hurt you');
  await pg.keyboard.press('KeyE');
  ok(await until(pg, () => __qzar.flatHand.shieldP === 0 && !__qzar.shots.some(s => s.key === 'thrown')), 'E drops what you hold');
  await pg.evaluate(() => __qzar.setHeld(__qzar.flatHand, 'pip')); await pg.keyboard.press('KeyQ');
  ok(await until(pg, () => !__qzar.flatHand.held && __qzar.shots.some(s => s.key === 'thrown')), 'Q throws the gun');
  await pg.evaluate(() => { const q = __qzar; q.shots.forEach(s => { s.dead = s.gone = true; }); q.foe.hp = 100; q.spawn(q.you, 'thrown', new q.V3(q.foe.head.x, q.foe.head.y - .3, q.foe.head.z + .5), new q.V3(0, 0, -6), 'pip'); });
  ok(await until(pg, () => __qzar.foe.hp === 94), 'a thrown gun hurts a little');
  await pg.evaluate(() => __qzar.hurt(__qzar.foe, 100));
  ok(await pg.evaluate(() => __qzar.state === 'roundEnd' && __qzar.you.wins === 1), 'the round is yours when the bot has no health left');
  ok(await until(pg, () => __qzar.round === 2 && __qzar.state === 'play'), 'and the next round begins');
  await pg.close();
  const A = await open('#local'), B = await open('#local');
  await A.click('#oNet'); await A.click('#host'); const code = await A.inputValue('#code');
  await B.click('#oNet'); await B.fill('#code', code); await B.click('#join');
  ok(await until(A, () => __qzar.net.lastRx > 0) && await until(B, () => __qzar.net.lastRx > 0), 'two pages link by the code');
  await A.click('#start');
  ok(await until(A, () => __qzar.state === 'play') && await until(B, () => __qzar.state === 'play'), 'the host starts the round for both');
  let seen = false;
  for (let i = 0; i < 150 && !seen; i++) { await A.mouse.click(36, 200); await A.waitForTimeout(200); seen = await B.evaluate(() => __qzar.shots.some(s => s.far)); }
  ok(seen, "the guest sees the host's shot");
  await B.evaluate(() => __qzar.hurt(__qzar.you, 100));
  ok(await until(A, () => __qzar.state === 'roundEnd' && __qzar.you.wins === 1) && await until(B, () => __qzar.foe.wins === 1), 'both agree the host won the round');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
