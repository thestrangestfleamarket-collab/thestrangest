// THE LIBRARY AND MUSEUM CHECK: node tests/lib-quests.cjs dist/market.html [shots dir]. The museum's vault: four clues round the city (each gives INTELLIGENCE), the dials and the star open it, a case of antiquities a day, the ladder back into the art museum, a donation pays and goes in the case, midnight's time lock clears the dials.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lib-quests::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = []; let pg = null;
  const start = async q => { if (pg) await pg.close(); pg = await b.newPage({ viewport: { width: 960, height: 600 } }); pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
    await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13' + (q || ''), { waitUntil: 'commit' });
    let s = false; for (let i = 0; i < 60 && !s; i++) { await pg.waitForTimeout(3000); s = await pg.evaluate(() => !!window.__started).catch(() => false); } return s; };   // (the vault half on a page of its own: one page through everything runs out of memory here)
  const st = await start();
  ok(st, 'the page starts');
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 500) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(SHOTS, n + '.png'), timeout: 120000 }).catch(e => console.log('(no shot ' + n + ')')); } };
  const act = name => pg.evaluate(n => { const t = __dbg.UI.things.find(t => t.name === n || (n.endsWith('*') && t.name.startsWith(n.slice(0, -1)))); if (!t) return false; t.act(t); return true; }, name);
  const has = n => pg.evaluate(n => __dbg.UI.things.filter(t => t.name.startsWith(n)).length, n);
  const calm = () => wait(() => !FADE.busy && !ROOMS.iv.busy, 120000);
  const PART = process.env.PART || '';   // stacks or vault: one half only
  if (st && PART !== 'vault') {
    await wait(() => MVAULTDBG().reg, 60000);
    const s0 = await pg.evaluate(() => ({ v: MVAULTDBG(), tr: CHARS.trade({ key: 'professor' }), bind: CHARS.trade({ key: 'professor' }).sells.filter(id => /^(bk_|bs_)|stack_key/.test(id) && !ARCHI(id)) }));
    ok(s0.v.reg && !s0.v.inside, 'the vault is registered off the map and nothing of it is built at the start: ' + JSON.stringify(s0.v.reg));
    ok(s0.tr && s0.tr.buys.includes('antiquities') && !s0.bind.length, 'the Professor buys antiquities and sells no bookbinding (archived 8 Nov 2026)');
    // the bookstore: the note (the Sealed Stacks' hatch archived with bookbinding)
    await pg.evaluate(() => ROOMS.enter('books')); await wait(() => __dbg.UI.things.some(t => /FOLDED NOTE/.test(t.name)), 90000); await calm();
    ok(await has('A FOLDED NOTE') === 1 && await has('A LOCKED HATCH') === 0, 'in the bookstore: a folded note on the lectern, and no hatch');
    const i0 = await pg.evaluate(() => FORAGE.ST.int);
    await act('A FOLDED NOTE*'); await pg.waitForTimeout(500); await pg.evaluate(() => MINI.close());
    const i1 = await pg.evaluate(() => ({ int: FORAGE.ST.int, read: MVAULTDBG().read }));
    ok(i1.int === i0 + 1 && i1.read.includes('note'), 'reading the note (a clue) gives a point of INTELLIGENCE: ' + i0 + ' -> ' + i1.int);
    await calm();
    // the clues by the art museum and the theatre
    await pg.evaluate(() => { const D = STORE.streetDoor.art; ROOMS.exit('books'); setTimeout(() => STORE.goTo(SHARED.BOD.X(D.out[0]), SHARED.BOD.Z(D.out[1]), 'up'), 1500); });
    ok(await wait(() => MVAULTDBG().clues >= 6, 60000), 'by the art museum: the cornerstone, the founder\'s statue and the theatre\'s sky poster are made once you come near: ' + JSON.stringify(await pg.evaluate(() => MVAULTDBG().clues)));
    await calm();
    for (const n of ['THE CORNERSTONE', "THE FOUNDER'S STATUE*", "TONIGHT'S SKY*"]) { await act(n); await pg.waitForTimeout(400); await pg.evaluate(() => MINI.close()); }
    const i2 = await pg.evaluate(() => ({ int: FORAGE.ST.int, read: MVAULTDBG().read.sort() }));
    ok(i2.int === i0 + 4 && i2.read.join() === 'note,plaque,sky,statue', 'all four clues read, a point of INTELLIGENCE each: ' + JSON.stringify(i2));
    await act("THE FOUNDER'S STATUE*"); await pg.evaluate(() => MINI.close());
    ok(await pg.evaluate(() => FORAGE.ST.int) === i0 + 4, 'a clue read again the same day gives nothing more');
    await shot('statue');
  }
  if (st && PART !== 'stacks') {
    // the vault, on a fresh page by the art museum
    ok(PART === 'vault' || await start(), 'a fresh page starts for the vault'); await wait(() => MVAULTDBG().reg && STORE.streetDoor && STORE.streetDoor.art, 60000);
    const i3 = await pg.evaluate(() => FORAGE.ST.int);
    await pg.evaluate(async () => { await STORE.ensure(); STORE.enter('art', true); }); await pg.waitForFunction(() => STORE.art.hung > 0 && !FADE.busy, null, { timeout: 900000, polling: 1000 }).catch(() => {});
    ok(await wait(() => STORE.here('art') && !FADE.busy && __dbg.UI.things.some(t => /SEALED VAULT/.test(t.name)), 120000), 'in the art museum: the sealed vault\'s hatch and its dials');
    await calm(); await shot('hatch');
    await act('THE SEALED VAULT*'); ok(await pg.evaluate(() => !document.getElementById('vaultp').hidden), 'double-click it: the dials and the star chart');
    const wr = await pg.evaluate(() => { const c = MVAULTDBG().code; MVAULT.set(c.dials.map(d => (d + 1) % 10), c.star); return MVAULT.try(); });
    ok(wr === false && !(await pg.evaluate(() => MVAULTDBG().open)), 'the wrong combination does not turn the wheel');
    await pg.evaluate(() => { const c = MVAULTDBG().code; MVAULT.set(c.dials, c.star); MVAULT.try(); });
    ok(await wait(() => MVAULTDBG().inside && !FADE.busy, 90000), 'the night\'s combination opens it and you go down into the vault');
    ok(await pg.evaluate(() => FORAGE.ST.int) === i3 + 2, 'opening it gives two more points of INTELLIGENCE');
    await calm(); await pg.waitForTimeout(1500); await shot('vault');
    const cs = await pg.evaluate(() => { const t = __dbg.UI.things.find(t => /^A GLASS CASE \(A/.test(t.name)), id = MVAULT.pick(0), n0 = INV.items[id] || 0; t.act(t); const n1 = INV.items[id] || 0; t.act(t); return { id, got: n1 - n0, again: (INV.items[id] || 0) - n1, cases: MVAULTDBG().cases }; });
    ok(cs.got === 1 && cs.again === 0 && cs.cases.length === 3, 'a glass case gives the day\'s antiquity, once: ' + JSON.stringify(cs));
    await act('THE LADDER UP*'); ok(await wait(() => STORE.here('art') && !FADE.busy && !ROOMS.offIn() && !MVAULTDBG().inside, 300000), 'the ladder up comes out in the art museum');
    await calm(); await pg.waitForTimeout(2000);
    const dn = await pg.evaluate(id => { const c0 = INV.cash; FORAGE.ACT.gift(id); return { paid: INV.cash - c0, gave: FORAGE.gave('art', id), price: ITEMS.prop(id, 'value') }; }, cs.id);
    ok(dn.gave && dn.paid === dn.price * 2, 'donated in the art museum: it pays twice its worth: ' + JSON.stringify(dn));
    ok(await wait(() => MVAULTDBG().shown === 1, 10000), 'and it goes on show in the vault\'s case');
    await shot('case');
    const tl = await pg.evaluate(() => { let v; if (window.MAIL && MAIL.ready) { const d0 = MAIL.day; MAIL.day = () => d0() + 1; v = MVAULTDBG(); MAIL.day = d0; } else { CITY.day = (CITY.day || 0) + 1; v = MVAULTDBG(); CITY.day--; } return v; });
    ok(!tl.open && tl.dials.join() === '0,0,0' && tl.star === -1 && !tl.read.length, 'at midnight the time lock clears the dials, the star and the clues read, and the vault shuts: ' + JSON.stringify({ open: tl.open, dials: tl.dials, read: tl.read }));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
