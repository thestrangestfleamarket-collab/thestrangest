// THE INSIDES' DOORS OUT: node tests/exitdoors.cjs dist/market.html. Every inside off the map with an exit shows a door there once you are in (its own or the shared one), and double-clicking it (its thing's act) takes you out.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=exitdoors::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(() => LOAD('later'));
    const ids = await pg.evaluate(() => Object.keys(ROOMS.off).filter(id => ROOMS.off[id].exit));
    ok(ids.length > 5, 'insides with a way out: ' + ids.join(', '));
    const until = async (f, a, ms = 60000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
    for (const id of ids) {
      await pg.evaluate(id => ROOMS.enter(id), id);
      const inn = await until(id => ROOMS.offIn() === id && !FADE.busy, id);
      const r = await pg.evaluate(id => { const o = ROOMS.off[id], e = o.exit, g = o.P && o.P.group; let door = null; if (g) g.traverse(c => { if (c.name === 'exit-door') door = c; });
        const near = __UI.things.filter(t => t.exit && t.obj && Math.hypot(t.obj.position.x - e[0], t.obj.position.z - e[2]) < 0.1);
        return { own: !!o.ownDoor, door: !!door, at: door ? Math.hypot(door.position.x - e[0], door.position.z - e[2]) : null, thing: near.length }; }, id);
      ok(inn, id + ': you get in');
      ok(r.own || (r.door && r.at < 1.5), id + ': a door shows at its way out ' + JSON.stringify(r));
      ok(r.thing === 1, id + ': the door is a thing you double-click');
      await pg.evaluate(id => { const e = ROOMS.off[id].exit, t = __UI.things.find(t => t.exit && t.obj && Math.hypot(t.obj.position.x - e[0], t.obj.position.z - e[2]) < 0.1); return t && t.act(); }, id);
      ok(await until(() => !ROOMS.offIn() && !FADE.busy), id + ': double-clicking it takes you out');
    }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
