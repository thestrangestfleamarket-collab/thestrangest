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
  const U = async (f, ms = 90000, arg) => { for (const t = Date.now(); Date.now() - t < ms; await pg.waitForTimeout(250)) if (await pg.evaluate(f, arg).catch(() => false)) return true; return false; };
  const NOT_YET = ['park lamppost', 'smoke', 'downfeed', 'roof tank', 'roof tank fill', 'tank overflow', 'zipline'];   // fittings the old engine made (the landscape kinds are this game's baked models now)
  if (st) {
    const s0 = await pg.evaluate(() => { const d = OLDDBG(); return { rooms: d.rooms, built: d.built.length, data: d.data, listed: __dbg.UI.places().filter(p => SHARED.OLDROOMS.by[p[0]]).length }; });
    ok(s0.rooms >= 40, 'the old rooms are registered (' + s0.rooms + ')');
    ok(s0.built === 0 && !s0.data, 'none is built and its items are not fetched at the start');
    ok(s0.listed === s0.rooms, 'every one is in the GO TO list (' + s0.listed + ')');
    for (const name of ['DINER', 'THE GREENHOUSE', "WITCH'S BEDROOM", 'CRYSTAL CAVERN', 'THE DOJO', 'THE FOREST (VR)', 'RESTROOM', 'LUCKY 7', 'UNDER THE SQUARE - LAUNDRY ROOM', 'CASTLE - THE CELLS', 'THE SQUARE - LOBBY', 'MOVIE THEATRE', 'OCTOPUS TANK', 'UNDER THE SQUARE - POOL', 'SUBWAY - CAR', 'SUBWAY - PLATFORM', 'UNDER THE SQUARE - BOXING GYM', 'THE DESK ROOM']) {   // one room per kit family
      await pg.evaluate(n => __dbg.UI.goPlace(SHARED.OLDROOMS.by[n] ? n : n + ' · OLD'), name);
      const id = await pg.evaluate(n => SHARED.OLDROOMS.by[n] || SHARED.OLDROOMS.by[n + ' · OLD'], name);   // a room named like a place on the street is listed with · OLD
      ok(await U(k => OLDDBG().built.includes(k) && !(window.FADE && FADE.busy), 120000, id), name + ' is built on the jump');
      await U(k => OLDDBG().inside === k && ROOMS.dark(), 20000, id);   // the room's state applies a frame or two after the build
      const r = await pg.evaluate(k => { const p = __dbg.pos(); return { ...OLDDBG().of(k), inside: OLDDBG().inside, dark: ROOMS.dark(), inBox: ROOMS.boxAt(p[0], p[2]) === k }; }, id);
      ok(r.inside === id && r.inBox, name + ': you stand inside it');
      ok(r.placed + r.missing === r.items && r.items > 0, name + ': every item accounted for (' + r.placed + ' made, ' + r.missing + ' standing in)');
      ok(r.verts > 150 * Math.min(4, r.placed), name + ': its items are painted (' + r.verts + ' vertices in the room)');
      const odd = r.left.filter(k => !NOT_YET.includes(k));   // a kit's own kind standing in is a regression; the old engine's and the shared kinds are known debt
      ok(!odd.length, name + ': every item standing in is a kind not ported yet (' + r.placed + ' made, ' + r.missing + ' standing in' + (odd.length ? '; a kit kind stands in: ' + odd.join(', ') : '') + ')');
      ok(r.dark, name + ': the map is not drawn while you are in');
      ok(await U(k => ROOMS.exit(k) != null, 30000, id), name + ': the way out runs');   // exit does nothing while a fade or swap is still busy: ask again until it runs
      ok(await U(k => !OLDDBG().built.includes(k) && !(window.FADE && FADE.busy), 120000, id), name + ' is dropped on the way out');   // the street is drawn again on the way out: as long as a build on a slow machine
    }
    const s1 = await pg.evaluate(() => ({ built: OLDDBG().built.length, sol: __dbg.SOL.up.length }));
    ok(s1.built === 0, 'nothing left built after leaving');
    const ke = await pg.evaluate(() => OLDDBG().kitErrors); ok(!ke.length, 'every old kit registered without an error' + (ke.length ? ': ' + ke.join(' | ') : ''));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' FAILED' : 'all ok');
  process.exit(fails.length ? 1 : 0);
})();
