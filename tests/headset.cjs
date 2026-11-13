// THE VR HEADSET CHECK: node tests/headset.cjs dist/market.html (dist/roam.html, dist/holo.html and dist/asylum.html beside it). Every player has a VR HEADSET; used anywhere it lists the
// holodeck's programs; RUN leaves the market's page for the program's own page, where no market is loaded; LEAVE THE HOLODECK loads the market again, you where you stood.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=headset::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/not loaded before use|^ROAM|^SYS /.test(m.text())) errs.push(m.text().slice(0, 300)); });
  const started = async () => { await pg.waitForFunction(() => window.__started, null, { timeout: 400000 }); await pg.waitForTimeout(8000); await pg.waitForFunction(() => !FADE.busy, null, { timeout: 120000, polling: 200 }).catch(() => {}); };
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1&at=60,-60', { waitUntil: 'commit' }); await started();
  const r1 = await pg.evaluate(async () => { await LOAD('later'); const have = INV.items.vr_headset || 0, name = FORAGE.name('vr_headset'), usable = FORAGE.usable('vr_headset');
    HUD.useItem('vr_headset'); const hp = document.getElementById('holog'); return { have, name, usable, arcade: ARCDBG().built, open: !hp.hidden, rows: hp.querySelectorAll('button[data-run]').length, text: hp.textContent.slice(0, 400), at: [__dbg.pos()[0], __dbg.pos()[2]] }; });
  ok(r1.have === 1 && r1.name === 'VR HEADSET' && r1.usable, 'every player has a VR HEADSET, usable from the bag: ' + JSON.stringify(r1));
  ok(!r1.arcade && r1.open && r1.rows === 7 && /VESPER WARD/.test(r1.text) && /BREACHLINE/.test(r1.text) && /HALCYON GREENS/.test(r1.text) && /ROAM/.test(r1.text) && /BOARDED UP/.test(r1.text) && /HOLLOW PINES/.test(r1.text) && /SHARDWAVE/.test(r1.text), 'used on the street (no arcade built), it lists every holodeck program');
  await pg.evaluate(() => { const H = STORE.holo; document.querySelectorAll('#holog button[data-run]')[H.programs.findIndex(p => p.name === 'ROAM')].click(); });
  await pg.waitForFunction(() => /roam\.html/.test(location.pathname) && window.ROAMDBG && ROAMDBG().on, null, { timeout: 180000, polling: 200 });
  const r2 = await pg.evaluate(() => { const c = HOLONET.card; return { market: typeof window.__dbg !== 'undefined' || typeof window.ARCDBG !== 'undefined' || typeof window.INV !== 'undefined', run: HOLO.run && HOLO.run.P.name, card: { room: c.room, name: !!c.name, look: !!c.look, at: c.at, back: c.back, game: c.game } }; });
  ok(!r2.market && r2.run === 'ROAM', 'RUN ROAM leaves the market\'s page: ROAM\'s own page runs it, nothing of the market loaded: ' + JSON.stringify({ market: r2.market, run: r2.run }));
  ok(/^s-/.test(r2.card.room) && r2.card.name && r2.card.look && Array.isArray(r2.card.at) && Math.hypot(r2.card.at[0] - r1.at[0], r2.card.at[1] - r1.at[1]) < 1 && r2.card.game === 'ROAM', 'the page was handed your room, name, look and where you stood, to keep you with the server: ' + JSON.stringify(r2.card));
  await pg.click('#leave', { noWaitAfter: true }); await started();
  const r3 = await pg.evaluate(() => ({ market: /market\.html/.test(location.pathname), d: Math.hypot(__dbg.pos()[0] - 60, __dbg.pos()[2] + 60), have: INV.items.vr_headset || 0, phone: INV.items.brickphone || 0 }));
  ok(r3.market && r3.d < 2 && r3.have === r3.phone, 'LEAVE THE HOLODECK loads the market again, you where you stood (the headset kept as the other given-once things are: a second ?fresh=1 start off the website empties the bag): ' + JSON.stringify(r3));
  await pg.evaluate(async () => { await LOAD('later'); INV.items.vr_headset = 1; HUD.useItem('vr_headset'); const H = STORE.holo; document.querySelectorAll('#holog button[data-run]')[H.programs.findIndex(p => p.name === 'HOLLOW PINES')].click(); });
  await pg.waitForFunction(() => /holo\.html/.test(location.pathname) && document.querySelector('iframe'), null, { timeout: 180000, polling: 200 });
  const r4 = await pg.evaluate(() => ({ src: document.querySelector('iframe').getAttribute('src'), allow: document.querySelector('iframe').allow, market: typeof window.__dbg !== 'undefined', leave: !!document.getElementById('leave'), room: HOLONET.card.room }));
  ok(/asylum\.html$/.test(r4.src) && /xr-spatial-tracking/.test(r4.allow) && !r4.market && r4.leave && /^s-/.test(r4.room), 'RUN HOLLOW PINES leaves for the holodeck\'s shell: the game\'s page alone, LEAVE THE HOLODECK over it, no market loaded: ' + JSON.stringify(r4));
  await pg.click('#leave', { noWaitAfter: true }); await pg.waitForFunction(() => /market\.html/.test(location.pathname), null, { timeout: 60000 });
  ok(true, 'LEAVE THE HOLODECK on the shell goes back to the market');
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await b.close(); process.exit(fails.length ? 1 : 0); })().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
