// THE CORE CHECK: node tests/core.cjs dist/market.html. Fast checks of the core's own logic (imports, the level file, SYS, ZONES, VIS, LEVELS, FADE, collision), one start of the page.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=core::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const ROOT = path.resolve(__dirname, '..');

try { execFileSync('node', ['--stack-size=8000', ROOT + '/tools/imports.cjs', '--check'], { stdio: 'pipe' }); ok(true, 'every file\'s imports are up to date and point back only'); }
catch (e) { ok(false, 'imports: ' + String(e.stdout || '') + String(e.stderr || '')); }

const L = JSON.parse(fs.readFileSync(ROOT + '/data/world.json', 'utf8'));
ok(L.places.every(p => p.x0 < p.x1), 'every place in the level file has x0 < x1');
const rect = p => p.y1 != null ? [p.x0, p.x1, p.y0, p.y1] : [p.x0, p.x1, L.block.back, -77], into = (a, b) => a.kind === 'stairs' && b.kind === 'passage';
const pl = L.places.filter(p => p.kind !== 'park'), lap = pl.find((p, i) => pl.some((q, j) => j !== i && !into(p, q) && !into(q, p) && (([a0, a1, b0, b1], [c0, c1, d0, d1]) => a0 < c1 - .01 && c0 < a1 - .01 && b0 < d1 - .01 && d0 < b1 - .01)(rect(p), rect(q))));
ok(!lap, 'no two places overlap (stairs may stand in a passage)' + (lap ? ' (' + lap.id + ')' : ''));
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
      o.levels = [LEVELS.at(0, 0, 'up'), LEVELS.at(0, 0, 'down'), LEVELS.ways.every(w => LEVELS.of[w.a] && LEVELS.of[w.b] && w.stair), LEVELS.drawn(__dbg.MAPG.bodega, 'street'), LEVELS.drawn(__dbg.MAPG.bodega, 'station')];
      o.floor = [LEVELS.floor('up', -5, null), LEVELS.floor('down', 0, null), LEVELS.floor('up', -3, {}), LEVELS.floor('down', 0, {})].join();
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
      o.chars = (() => { const C = window.CHARS; if (!C || ['apply', 'put', 'live', 'applyAll', 'id'].some(k => typeof C[k] !== 'function')) return { fns: false }; const F = { name: 'x', hp: 1, sta: 1, st: { v: 1, R: 1, home: { id: 'z' } }, g: { scale: { setScalar(v) { F.g.scale._v = v; } } } }; C.put(F, { name: 'NN', hp: 9, stamina: 4, scale: 3 }); return { fns: true, levelChars: C.rec('___none') === null, applied: F.name === 'NN' && F.hp === 9 && F.sta === 4 && F.g.scale._v === 3 }; })();
      o.shops = (() => { const S = window.SHOPS, C = window.CHARS; if (!S || !C) return { ok: false }; const fns = ['open', 'close', 'sync'].every(k => typeof S[k] === 'function') && typeof C.trade === 'function'; const N = (window.__dbg.NPCS || [])[0]; return { ok: fns, noTrade: N ? C.trade(N) === null : true }; })();
      o.breath = [typeof __dbg.VIT.air === 'number', typeof __dbg.VIT.breathe === 'function', (window.ITEMS && ITEMS.prop ? +ITEMS.prop('airshroom', 'breath') : 0) || 0];
      o.downs = ['dungeon', 'gemcave', 'hudson'].map(k => { const L = LEVELS.of[k]; return !!(L && L.floor === 'down' && typeof L.has === 'function' && typeof L.ground === 'function' && typeof L.bound === 'function'); });
      o.swords = (() => { const I = window.ITEMS, W = window.WIELD, F = window.FIGHT, S = window.STRIKES, V = __dbg.VIT; if (!I || !W || !F || !S) return { ok: false };
        const h0 = V.hp, took = V.hurt(.01, { x: 0, z: 0 }); V.hp = h0; return { ok: true, dmg: ['sword_wood', 'sword', 'sword_steel', 'sword_ench'].map(k => +I.prop(k, 'damage')).join(), hand: I.prop('sword_steel', 'slot') === 'hand' && I.prop('sword_steel', 'grants') === 'fight', api: 'block' in W && typeof S.landed === 'function' && typeof V.guard === 'function', took }; })();
      o.cinema = !!(CINEMA && typeof CINEMA.tick === 'function' && typeof CINEMA.push === 'function' && typeof CINEMA.isAdmin === 'function' && typeof CINEMA.now === 'function' && CINEMA.on === false);
      o.equip = (() => { const E = window.EQUIP, I = window.ITEMS, V = __dbg.VIT, F = window.FORAGE; if (!E || !I || !V || !F || typeof E.wear !== 'function') return { ok: false };
        const slots = I.prop('armor', 'slot') === 'body' && I.prop('armor', 'grants') === 'guard' && I.prop('cloudcoat', 'slot') === 'body' && I.prop('cloudcoat', 'grants') === 'float';
        const d0 = V.def === 0 && E.float === false; F.give('armor', 1); E.wear('armor'); const guard = V.def > 0 && E.worn === 'armor';
        F.give('cloudcoat', 1); E.wear('cloudcoat'); const float = E.float === true && V.def === 0; E.wear('cloudcoat'); const off = E.float === false && !E.worn;
        return { ok: true, slots, d0, guard, float, off }; })();
      return o;
    });
    for (const p of ['dress', 'ring', 'sky', 'life', 'vitals', 'rooms', 'shadow', 'weedsAdd', 'roomsReset']) ok(r.phases.includes(p), 'SYS step "' + p + '" has systems');
    ok(!r.sysErr.length, 'no system has thrown' + (r.sysErr.length ? ': ' + r.sysErr.join(', ') : ''));
    ok(r.zoneHere === 'market', 'at 53,10 you are on Market St (' + r.zoneHere + ')');
    ok(r.zoneDown === 'station', 'down at 0,0 is the subway station (' + r.zoneDown + ')');
    ok(r.zoneRoom === 'inside', 'in a room is inside (' + r.zoneRoom + ')');
    ok(r.levels[0] === 'street' && r.levels[1] === 'station' && r.levels[2] && r.levels[3] && !r.levels[4], 'LEVELS: the street above, the station below, every stairway joins two levels, the street is drawn only on its own level (' + r.levels.join(',') + ')');
    ok(r.floor === 'up,down,down,up', 'LEVELS.floor: the floor changes only on a stairway, never from height alone (' + r.floor + ')');
    ok(r.vis[0] && r.vis[1] && r.vis[2] && !r.vis[3], 'VIS: hidden while any reason is left, shown when none is');
    ok(r.fade === 0, 'no fade is left running after the start');
    ok(r.clamp, 'collision keeps you inside the world');
    ok(r.queues >= 2, 'the far painting queues are there (bodega ground, park wall): ' + r.queues);
    ok(r.lazy[0] >= 3 && !r.lazy[1].length, 'no inside of a building is built at the start (' + r.lazy[0] + ' insides wait; built: ' + r.lazy[1].join(',') + ')');
    ok(r.offAPI && r.off.length >= 1 && r.off.every(q => q[1] && q[2] && !q[3]), 'insides off the map: each one waits (box, spawn, way out, builder) and none is built at the start (' + r.off.map(q => q[0]).join(',') + ')');
    ok(r.doors.length >= 3 && !r.doors.includes('apt'), 'characters can go into the buildings but your apartment (' + r.doors.join(',') + ')');
    ok(r.shared >= 26, 'SHARED holds the shared state (' + r.shared + ' names)');
    ok(r.chars.fns && r.chars.levelChars && r.chars.applied, 'CHARS applies character overrides (name, stats, scale) and reads characters.json: ' + JSON.stringify(r.chars));
    ok(r.shops.ok && r.shops.noTrade, 'SHOPS is wired and a character with no shop config sells nothing: ' + JSON.stringify(r.shops));
    ok(r.breath[0] && r.breath[1] && r.breath[2] > 0, 'breath: VIT.air + VIT.breathe exist and the AIRCAP mushroom grants air (' + r.breath.join(',') + ')');
    ok(r.downs.every(Boolean), 'every down level (dungeon, gem cave, hudson cavern) gives its own has/ground/bound through LEVELS.of (' + r.downs.join(',') + ')');
    ok(r.swords.ok && r.swords.dmg === '1,2,3,5' && r.swords.hand && r.swords.api && r.swords.took === 1, 'swords: four blades carry DAMAGE on the item model, every blow passes the guard, landed strikes feed SWORDSMANSHIP: ' + JSON.stringify(r.swords));
    ok(r.cinema, 'CINEMA is wired (shared screen: tick, push, admin, now; idle off the street)');
    ok(r.equip.ok && r.equip.slots && r.equip.d0 && r.equip.guard && r.equip.float && r.equip.off, 'EQUIP wears body gear and resolves its grant (guard softens blows, float lifts), one off at a time: ' + JSON.stringify(r.equip));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all core checks passed');
  process.exit(fails.length ? 1 : 0);
})();
