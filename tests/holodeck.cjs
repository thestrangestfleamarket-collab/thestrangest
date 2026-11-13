// THE HOLODECK CHECK: node tests/holodeck.cjs dist/market.html. The holodeck is a booth at the arcade's back wall: no knight, no sword
// programs; E or a double-click on it opens the adventures menu; a registered program is listed with
// its cost, RUN takes the money and starts it, END PROGRAM stops it, ESC closes the menu, and leaving the arcade closes everything.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=holodeck::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});   // the fresh start fades into the park a few seconds in; an entry during that fade is dropped
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  const r1 = await pg.evaluate(() => { const d = ARCDBG(), K = BODIES.by.knight && BODIES.by.knight.npc; return { things: d.things, programs: d.holo.programs, open: d.holo.open, knightOnStreet: !!(K && K.on && K.st.home.id === 'knight') }; });
  ok(!r1.things.includes('THE HOLODECK PANEL') && !r1.things.includes('BACK TO THE ARCADE') && r1.things.includes('THE HOLODECK') && !r1.things.some(t => /SWORD|DUEL/.test(t)) && r1.programs.join() === 'ROAM,BOARDED UP,HOLLOW PINES,SHARDWAVE,HALCYON GREENS' && !r1.open && r1.knightOnStreet,
    'the holodeck is one booth (no hall, no panel), no knight and no sword programs (ROAM and BOARDED UP are the adventures); the knight stays on the street: ' + JSON.stringify(r1));
  const r2 = await pg.evaluate(() => { const th = __dbg.UI.things.find(t => t.name === 'THE HOLODECK'), H0 = STORE.holo.hall; __dbg.UI.goTo(H0.x, H0.z, 0, Math.PI); window.__e = __dbg.UI.choices().map(c => c.name); PROMPT.tick(); window.__p = PROMPT.text(); th.act(); const hp = document.getElementById('holog'); return { open: !hp.hidden, look: hp.classList.contains('ml'), text: hp.textContent, rows: ARCDBG().holo.rows, e: window.__e, p: window.__p }; });
  ok(r2.open && r2.look && /THE HOLODECK/.test(r2.text) && /ROAM/.test(r2.text) && /BOARDED UP/.test(r2.text) && /FREE/.test(r2.text) && r2.rows === 5 && /HOLLOW PINES/.test(r2.text) && /SHARDWAVE/.test(r2.text) && /HALCYON GREENS/.test(r2.text) && r2.e.includes('RUN SHARDWAVE') && r2.e.includes('RUN HALCYON GREENS') && r2.e.includes('THE HOLODECK') && r2.e.includes('RUN BOARDED UP') && r2.e.includes('RUN HOLLOW PINES') && /HOLODECK/.test(r2.p), 'standing at the booth, the E popup shows THE HOLODECK and each program to run; it opens the adventures menu in the menu look, listing ROAM and BOARDED UP free: ' + JSON.stringify({ ...r2, text: r2.text.slice(0, 120) }));
  await pg.evaluate(() => document.getElementById('holog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  const r3 = await pg.evaluate(() => ({ open: ARCDBG().holo.open }));
  ok(!r3.open, 'ESC closes the menu');
  const r4 = await pg.evaluate(() => { const H = STORE.holo, L = []; H.programs.push({ name: 'TEST RUN', skill: 'sword', cost: 12, intro: 'A TEST.', go: D => L.push('go'), run: (D, dt) => { D.n++; }, hide: () => L.push('hide') });
    INV.cash = 20; H.menu(); const hp = document.getElementById('holog'), row = [...hp.querySelectorAll('button[data-run]')].pop(), listed = /TEST RUN/.test(hp.textContent) && /SWORDSMANSHIP/.test(hp.textContent) && /\$12/.test(hp.textContent);
    row.click(); const d1 = ARCDBG().holo, cash = INV.cash, hid = hp.hidden; H.menu(); const endB = hp.querySelector('button[data-end]'), ran = H.run && H.run.n >= 0 && H.run.x === H.hall.x; if (endB) endB.click(); const d2 = ARCDBG().holo; H.hide(); H.programs.pop();
    return { listed, run: d1.run, cash, hid, ran, L, after: d2.run, rowsNow: ARCDBG().holo.programs.length }; });
  ok(r4.listed && r4.run === 'TEST RUN' && r4.cash === 8 && r4.hid && r4.ran && r4.L[0] === 'go' && r4.after === null && r4.L[1] === 'hide' && r4.rowsNow === 5,
    'a registered adventure is listed with its skill and cost; RUN takes $12, closes the menu and starts it in the hall; END PROGRAM stops it: ' + JSON.stringify(r4));
  const r6 = await pg.evaluate(() => { const c = __dbg.UI.choices().find(c => c.name === 'RUN HOLLOW PINES'); c.sub.act(); const f = document.querySelector('#hollow iframe'), on = HOLLOW.on, src = f && f.getAttribute('src'), run = ARCDBG().holo.run, ends = __dbg.UI.choices().map(c => c.name); document.querySelector('#hollow button').click(); return { on, src, run, ends, off: !HOLLOW.on && !document.querySelector('#hollow iframe') && !ARCDBG().holo.run }; });
  ok(r6.on && r6.src === '/vr' && r6.run === 'HOLLOW PINES' && r6.ends.includes('END PROGRAM') && r6.off, 'RUN HOLLOW PINES from the E popup puts its page (/vr) over the game; LEAVE THE HOLODECK ends it: ' + JSON.stringify(r6));
  const r7 = await pg.evaluate(() => { const c = __dbg.UI.choices().find(c => c.name === 'RUN SHARDWAVE'); c.sub.act(); const f = document.querySelector('#hollow iframe'), on = HOLLOW.on, src = f && f.getAttribute('src'), run = ARCDBG().holo.run; document.querySelector('#hollow button').click(); return { on, src, run, off: !HOLLOW.on && !document.querySelector('#hollow iframe') && !ARCDBG().holo.run }; });
  ok(r7.on && r7.src === '/wave' && r7.run === 'SHARDWAVE' && r7.off, 'RUN SHARDWAVE puts its page (/wave) over the game; LEAVE THE HOLODECK ends it: ' + JSON.stringify(r7));
  await pg.evaluate(() => { STORE.holo.menu(); ROOMS.exit('arcade'); }); await pg.waitForTimeout(1500); await wait(() => !FADE.busy).catch(() => {});
  const r5 = await pg.evaluate(() => ({ open: ARCDBG().holo.open, hall: !!STORE.holo.hall, run: ARCDBG().holo.run }));
  ok(!r5.open && !r5.hall && !r5.run, 'leaving the arcade drops the holodeck and closes its menu: ' + JSON.stringify(r5));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
