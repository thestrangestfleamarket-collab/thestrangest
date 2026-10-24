// THE OLD GAME'S ROOMS: node tests/oldrooms.cjs dist/market.html. None is built at the start; a jump from the GO TO list builds one off the map (its items placed, the rest as named blocks), with the map hidden; leaving drops it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=oldrooms::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await pg.waitForTimeout(250)) if (await pg.evaluate(f).catch(() => false)) return true; return false; };
  if (st) {
    const s0 = await pg.evaluate(() => { const d = OLDDBG(); return { rooms: d.rooms, built: d.built.length, data: d.data, listed: UI.places().filter(p => SHARED.OLDROOMS.by[p[0]]).length }; });
    ok(s0.rooms >= 40, 'the old rooms are registered (' + s0.rooms + ')');
    ok(s0.built === 0 && !s0.data, 'none is built and its items are not fetched at the start');
    ok(s0.listed === s0.rooms, 'every one is in the GO TO list (' + s0.listed + ')');
    for (const name of ['DINER', 'THE OFFICE']) {
      await pg.evaluate(n => UI.goPlace(n), name);
      const id = await pg.evaluate(n => SHARED.OLDROOMS.by[n], name);
      ok(await U(k => OLDDBG().built.includes(k) && !(window.FADE && FADE.busy), 90000, id) || await pg.evaluate(k => OLDDBG().built.includes(k), id), name + ' is built on the jump');
      const r = await pg.evaluate(k => ({ ...OLDDBG().of(k), inside: OLDDBG().inside, dark: ROOMS.dark(), inBox: ROOMS.boxAt(pos.x, pos.z) === k }), id);
      ok(r.inside === id && r.inBox, name + ': you stand inside it');
      ok(r.placed + r.missing === r.items && r.items > 0, name + ': every item accounted for (' + r.placed + ' made, ' + r.missing + ' standing in)');
      ok(r.dark, name + ': the map is not drawn while you are in');
      await pg.evaluate(k => ROOMS.exit(k), id);
      ok(await U(k => !OLDDBG().built.includes(k) && !(window.FADE && FADE.busy), 60000, id), name + ' is dropped on the way out');
    }
    const s1 = await pg.evaluate(() => ({ built: OLDDBG().built.length, sol: SOL.up.length }));
    ok(s1.built === 0, 'nothing left built after leaving');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' FAILED' : 'all ok');
  process.exit(fails.length ? 1 : 0);
})();
