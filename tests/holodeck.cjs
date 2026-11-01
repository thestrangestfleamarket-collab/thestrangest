// THE HOLODECK CHECK: node tests/holodeck.cjs dist/market.html. The holodeck is an empty grid with a panel on its far wall: no knight, no sword
// programs; double-clicking the panel opens the adventures menu (empty until adventures are registered); a registered program is listed with
// its cost, RUN takes the money and starts it, END PROGRAM stops it, ESC closes the menu, and leaving the arcade closes everything.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=holodeck::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});   // the fresh start fades into the park a few seconds in; an entry during that fade is dropped
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  const r1 = await pg.evaluate(() => { const d = ARCDBG(), K = BODIES.by.knight && BODIES.by.knight.npc; return { things: d.things, programs: d.holo.programs, open: d.holo.open, knightOnStreet: !!(K && K.on && K.st.home.id === 'knight') }; });
  ok(r1.things.includes('THE HOLODECK PANEL') && r1.things.includes('THE HOLODECK') && !r1.things.some(t => /SWORD|DUEL/.test(t)) && r1.programs.join() === 'THE CATACOMB RUN' && !r1.open && r1.knightOnStreet,
    'the holodeck has its panel and door, no knight and no sword programs (THE CATACOMB RUN is the one adventure); the knight stays on the street: ' + JSON.stringify(r1));
  const r2 = await pg.evaluate(() => { __dbg.UI.things.find(t => t.name === 'THE HOLODECK PANEL').act(); const hp = document.getElementById('holog'); return { open: !hp.hidden, look: hp.classList.contains('ml'), text: hp.textContent, rows: ARCDBG().holo.rows }; });
  ok(r2.open && r2.look && /THE HOLODECK/.test(r2.text) && /THE CATACOMB RUN/.test(r2.text) && /MARTIAL ARTS/.test(r2.text) && /\$12/.test(r2.text) && r2.rows === 1, 'the panel opens the adventures menu in the menu look, listing the catacomb run with its skill and price: ' + JSON.stringify({ ...r2, text: r2.text.slice(0, 120) }));
  await pg.evaluate(() => document.getElementById('holog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  const r3 = await pg.evaluate(() => ({ open: ARCDBG().holo.open }));
  ok(!r3.open, 'ESC closes the menu');
  const r4 = await pg.evaluate(() => { const H = STORE.holo, L = []; H.programs.push({ name: 'TEST RUN', skill: 'sword', cost: 12, intro: 'A TEST.', go: D => L.push('go'), run: (D, dt) => { D.n++; }, hide: () => L.push('hide') });
    INV.cash = 20; H.menu(); const hp = document.getElementById('holog'), row = hp.querySelectorAll('button[data-run]')[1], listed = /TEST RUN/.test(hp.textContent) && /SWORDSMANSHIP/.test(hp.textContent) && /\$12/.test(hp.textContent);
    row.click(); const d1 = ARCDBG().holo, cash = INV.cash, hid = hp.hidden; H.menu(); const endB = hp.querySelector('button[data-end]'), ran = H.run && H.run.n >= 0 && H.run.x === H.hall.x; if (endB) endB.click(); const d2 = ARCDBG().holo; H.hide(); H.programs.pop();
    return { listed, run: d1.run, cash, hid, ran, L, after: d2.run, rowsNow: ARCDBG().holo.programs.length }; });
  ok(r4.listed && r4.run === 'TEST RUN' && r4.cash === 8 && r4.hid && r4.ran && r4.L[0] === 'go' && r4.after === null && r4.L[1] === 'hide' && r4.rowsNow === 1,
    'a registered adventure is listed with its skill and cost; RUN takes $12, closes the menu and starts it in the hall; END PROGRAM stops it: ' + JSON.stringify(r4));
  const c1 = await pg.evaluate(async () => { const H = STORE.holo, P = H.programs.find(p => p.name === 'THE CATACOMB RUN'); INV.cash = 50; H.start(P);
    const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 200))) if (f()) return true; return false; };
    const w1 = await U(() => CATDBG().ready && DUNMOBDBG().level === 1 && DUNMOBDBG().slimes.length === 3 && !FADE.busy); const set = CATDBG(), lv = SHARED.LVL, inHall = DUNMOBDBG().slimes.every(s => { const b = H.hall.box, T = __dbg.cv().TILE; return s.x * T > b.x0 && s.x * T < b.x1 && s.z * T > b.z0 && s.z * T < b.z1; });
    for (let i = 0; i < 3; i++) DUNMOBS.hit(i, 99); const w2 = await U(() => DUNMOBDBG().level === 2 && DUNMOBDBG().slimes.length === 4, 90000);
    return { cash: INV.cash, w1, set, lv, inHall, w2, arena: DUNMOBDBG().arena, run: ARCDBG().holo.run, menu: ARCDBG().holo.open }; });
  ok(c1.cash === 38 && c1.w1 && c1.set.set && c1.set.pillars === 4 && c1.set.torches === 4 && c1.set.fire === 4 && c1.lv === 'up' && c1.inHall && c1.w2 && c1.arena && c1.run === 'THE CATACOMB RUN' && !c1.menu,
    'THE CATACOMB RUN: $12, the hall becomes a catacomb (pillars, torches), three slimes in the hall for wave 1, four more when they burst: ' + JSON.stringify(c1));
  const c2 = await pg.evaluate(() => { const VIT = __dbg.VIT, hp0 = VIT.hp, sk0 = FORAGE.sk('fight'); VIT.hp = .05; return new Promise(r => setTimeout(() => r({ hp0, hp: VIT.hp, sk0, sk: FORAGE.sk('fight'), run: ARCDBG().holo.run, set: CATDBG(), slimes: DUNMOBDBG().slimes.length, arena: DUNMOBDBG().arena, sol: __dbg.SOL.up.length }), 800)); });
  ok(!c2.run && c2.hp >= c2.hp0 - 1e-6 && c2.sk > c2.sk0 && !c2.set.on && !c2.set.set && c2.set.fire === 0 && c2.slimes === 0 && !c2.arena,
    'the safety ends the run before you faint: health back as it was, the cleared wave paid MARTIAL ARTS, the catacomb and the slimes gone: ' + JSON.stringify(c2));
  await pg.evaluate(() => { STORE.holo.menu(); ROOMS.exit('arcade'); }); await pg.waitForTimeout(1500); await wait(() => !FADE.busy).catch(() => {});
  const r5 = await pg.evaluate(() => ({ open: ARCDBG().holo.open, hall: !!STORE.holo.hall, run: ARCDBG().holo.run }));
  ok(!r5.open && !r5.hall && !r5.run, 'leaving the arcade drops the holodeck and closes its menu: ' + JSON.stringify(r5));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
