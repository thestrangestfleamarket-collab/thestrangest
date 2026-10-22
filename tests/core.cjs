// THE CORE CHECK: node tests/core.cjs dist/market.html. Fast checks of the core's own logic (imports, the level file, SYS, ZONES, VIS, FADE, collision), one start of the page.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=core::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const ROOT = path.resolve(__dirname, '..');

try { execFileSync('node', ['--stack-size=8000', ROOT + '/tools/imports.cjs', '--check'], { stdio: 'pipe' }); ok(true, 'every file\'s imports are up to date and point back only'); }
catch (e) { ok(false, 'imports: ' + String(e.stdout || '') + String(e.stderr || '')); }

const L = JSON.parse(fs.readFileSync(ROOT + '/data/world.json', 'utf8'));
ok(L.places.every(p => p.x0 < p.x1), 'every place in the level file has x0 < x1');
const row = L.places.filter(p => p.kind !== 'park').slice().sort((a, b) => a.x0 - b.x0);
const lap = row.find((p, i) => i && p.x0 < row[i - 1].x1 - 0.01);
ok(!lap, 'no two places on the street overlap' + (lap ? ' (' + lap.id + ')' : ''));
ok(L.paths.every(p => p.a && p.b), 'every park path has two ends');
ok(L.places.every(p => p.x0 >= L.streets.market.x0 && p.x1 <= L.streets.market.x1), 'every place sits on Market St');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(3000);
    const r = await pg.evaluate(() => {
      const o = {}, B = SHARED.BOD, X = B.XS, Z = B.ZS;
      o.phases = Object.keys(SYS.P); o.sysErr = Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name));
      o.zoneHere = ZONES.cur && ZONES.cur.id;
      o.zoneDown = ZONES.at(0, 0, 'down', null).id;
      o.zoneRoom = ZONES.at(0, 0, 'up', { name: 'test room' }).id;
      const T = __dbg.THREE, m = new T.Object3D();
      VIS.hide(m, 'a'); VIS.hide(m, 'b'); const h2 = !m.visible; VIS.hide(m, 'a', false); const h1 = !m.visible; VIS.hide(m, 'b', false);
      o.vis = [h2, h1, m.visible, VIS.hidden(m)];
      o.fade = FADE.busy;
      const Bd = SHARED.BOUND, c = __dbg.collide(Bd.x1 + 500, Bd.z1 + 500); o.clamp = c[0] <= Bd.x1 + 1e-6 && c[1] <= Bd.z1 + 1e-6;
      o.shared = Object.keys(SHARED).length;
      o.lazy = [Object.keys(ROOMS.lazy).length, Object.keys(ROOMS.lazy).filter(k => ROOMS.lazy[k].done)];
      o.queues = BATCH.queues.length;
      o.off = Object.keys(ROOMS.off).map(k => [k, !!ROOMS.lazy[k], !!(ROOMS.off[k].box && ROOMS.off[k].spawn && ROOMS.off[k].out && ROOMS.off[k].build), !!ROOMS.off[k].P]);
      o.doors = HOMES.doors().map(d => d.id); o.shops = HOMESDBG().filter(r => r[1] && r[1] !== '?').length;
      o.offAPI = ['enter', 'exit', 'goIn', 'goOut', 'offIn'].every(k => typeof ROOMS[k] === 'function');
      return o;
    });
    for (const p of ['dress', 'ring', 'sky', 'life', 'vitals', 'rooms', 'shadow', 'weedsAdd', 'roomsReset']) ok(r.phases.includes(p), 'SYS step "' + p + '" has systems');
    ok(!r.sysErr.length, 'no system has thrown' + (r.sysErr.length ? ': ' + r.sysErr.join(', ') : ''));
    ok(r.zoneHere === 'market', 'at 53,10 you are on Market St (' + r.zoneHere + ')');
    ok(r.zoneDown === 'station', 'down at 0,0 is the subway station (' + r.zoneDown + ')');
    ok(r.zoneRoom === 'inside', 'in a room is inside (' + r.zoneRoom + ')');
    ok(r.vis[0] && r.vis[1] && r.vis[2] && !r.vis[3], 'VIS: hidden while any reason is left, shown when none is');
    ok(r.fade === 0, 'no fade is left running after the start');
    ok(r.clamp, 'collision keeps you inside the world');
    ok(r.queues >= 2, 'the far painting queues are there (bodega ground, park wall): ' + r.queues);
    ok(r.lazy[0] >= 3 && !r.lazy[1].length, 'no inside of a building is built at the start (' + r.lazy[0] + ' insides wait; built: ' + r.lazy[1].join(',') + ')');
    ok(r.offAPI && r.off.length >= 1 && r.off.every(q => q[1] && q[2] && !q[3]), 'insides off the map: each one waits (box, spawn, way out, builder) and none is built at the start (' + r.off.map(q => q[0]).join(',') + ')');
    ok(r.doors.length >= 5 && !r.doors.includes('apt'), 'characters can go into every building but your apartment (' + r.doors.join(',') + ')');
    ok(r.shared >= 26, 'SHARED holds the shared state (' + r.shared + ' names)');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all core checks passed');
  process.exit(fails.length ? 1 : 0);
})();
