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
    for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => !!(window.SHAFTS && SHAFTS.occ === 1)).catch(() => false)) break; await pg.waitForTimeout(500); }   // the sun's first shadow pass (slow under software GL)
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
      o.offAPI = ['enter', 'enterAt', 'exit', 'goIn', 'goOut', 'offIn', 'boxAt'].every(k => typeof ROOMS[k] === 'function');
      o.offSpawn = Object.keys(ROOMS.off).every(k => { const s = ROOMS.off[k].spawn; return !!(s && ROOMS.boxAt(s[0], s[1]) === k); });
      o.chars = (() => { const C = window.CHARS; if (!C || ['apply', 'put', 'live', 'applyAll', 'id'].some(k => typeof C[k] !== 'function')) return { fns: false }; const F = { name: 'x', hp: 1, sta: 1, st: { v: 1, R: 1, home: { id: 'z' } }, g: { scale: { setScalar(v) { F.g.scale._v = v; } } } }; C.put(F, { name: 'NN', hp: 9, stamina: 4, scale: 3 }); return { fns: true, levelChars: C.rec('___none') === null, applied: F.name === 'NN' && F.hp === 9 && F.sta === 4 && F.g.scale._v === 3 }; })();
      o.shops = (() => { const S = window.SHOPS, C = window.CHARS; if (!S || !C) return { ok: false }; const fns = ['open', 'close', 'sync'].every(k => typeof S[k] === 'function') && typeof C.trade === 'function'; const N = (window.__dbg.NPCS || [])[0]; return { ok: fns, noTrade: N ? C.trade(N) === null : true }; })();
      o.shafts = window.SHAFTS ? [SHAFTS.on > 0, SHAFTS.occ === 1, SHAFTS.dust === 0] : null;
      o.sky = [typeof SKY.sunCover === 'number' && SKY.sunCover >= 0 && SKY.sunCover <= 1, typeof SKY.cloudAt === 'function' && SKY.cloudAt(0, 1, 0, 0, .5) >= 0 && SKY.cloudAt(0, 1, 0, 0, .5) <= 1, typeof SKY.GLSL === 'string' && SKY.GLSL.includes('cloudAt')];
      o.breath = [typeof __dbg.VIT.air === 'number', typeof __dbg.VIT.breathe === 'function', (window.ITEMS && ITEMS.prop ? +ITEMS.prop('airshroom', 'breath') : 0) || 0];
      o.downs = ['dungeon', 'gemcave', 'hudson'].map(k => { const L = LEVELS.of[k]; return !!(L && L.floor === 'down' && typeof L.has === 'function' && typeof L.ground === 'function' && typeof L.bound === 'function'); });
      o.swords = (() => { const I = window.ITEMS, W = window.WIELD, F = window.FIGHT, S = window.STRIKES, V = __dbg.VIT; if (!I || !W || !F || !S) return { ok: false };
        const h0 = V.hp, took = V.hurt(.01, { x: 0, z: 0 }); V.hp = h0; return { ok: true, dmg: ['sword_wood', 'sword', 'sword_steel', 'sword_ench'].map(k => +I.prop(k, 'damage')).join(), hand: I.prop('sword_steel', 'slot') === 'hand' && I.prop('sword_steel', 'grants') === 'fight', api: 'block' in W && typeof S.landed === 'function' && typeof V.guard === 'function', took }; })();
      o.soft = !!(DN.modes.includes('soft') && DN.D0.soft && DN.D0.soft.shaft > 0 && window.SHAFTS && SHAFTS.list.length && SKY.U.uCldC && SKY.U.uCldK);
      o.spar = !!(window.SPAR && typeof SPAR.start === 'function' && SPARDBG().ring && SPARDBG().thing);
      o.cinema = !!(CINEMA && typeof CINEMA.tick === 'function' && typeof CINEMA.push === 'function' && typeof CINEMA.isAdmin === 'function' && typeof CINEMA.now === 'function' && CINEMA.on === false);
      o.online = !!(window.ONLINE && ONLINE.others instanceof Map && typeof ONLINE.feed === 'function' && typeof ONLINE.at === 'function' && ONLINE.V.length === 8 && typeof ONLINE.open === 'function' && SYS.P.life.some(s => s.name === '111d-online') && ONLINE.on === false && __dbg.ui().keyOf('chat') === 'enter');
      o.tenants = document.querySelector('[data-t="tenants"]').hidden === true && !!document.getElementById('dten');
      o.equip = (() => { const E = window.EQUIP, I = window.ITEMS, V = __dbg.VIT, F = window.FORAGE; if (!E || !I || !V || !F || typeof E.wear !== 'function') return { ok: false };
        const slots = I.prop('armor', 'slot') === 'body' && I.prop('armor', 'grants') === 'guard' && I.prop('cloudcoat', 'slot') === 'body' && I.prop('cloudcoat', 'grants') === 'float';
        const d0 = V.def === 0 && E.float === false; F.give('armor', 1); E.wear('armor'); const guard = V.def > 0 && E.worn === 'armor';
        F.give('cloudcoat', 1); E.wear('cloudcoat'); const float = E.float === true && V.def === 0; E.wear('cloudcoat'); const off = E.float === false && !E.worn;
        return { ok: true, slots, d0, guard, float, off }; })();
      o.rack = (() => { const R = window.RACK, G = window.GLBTOONS, bear = G && G.coatbear, fox = G && G.origamifox; if (!R || !R.at || !bear || !fox) return { ok: false };
        const h = bear.st.home, f = fox.st.home, near = Math.hypot(h.x - f.x, h.z - f.z) < 5 * __dbg.MAPK.BOD.XS(1) - 5 * __dbg.MAPK.BOD.XS(0), c = __dbg.collide(h.x, h.z), free = Math.hypot(c[0] - h.x, c[1] - h.z) < 1e-6;
        return { ok: true, pinned: h.r === 0 && Math.hypot(bear.st.x - h.x, bear.st.z - h.z) < 1, near, free, thing: __dbg.ui().things.some(t => /COAT RACK/.test(t.name)), drawn: window.LEVELS.drawn(R.g), rackBy: Math.hypot(R.at.x - h.x, R.at.z - h.z) < 4 }; })();
      o.knight = (() => { const B = window.BODIES, K = B && B.by && B.by.knight && B.by.knight.npc; if (!K) return { ok: false }; const T = __dbg.THREE, g0 = K.g.parent, G = new T.Group();
        const street = K.on === true && K.st.home.id === 'knight' && K.name === 'THE ARMOURER', bound = SHOPDBG().bound.includes('knight');
        B.place('knight', K.st.x + 1, K.st.z + 1, 0, G); const borrowed = K.g.parent === G && K.st.home.r === 0; B.restore('knight'); const back = K.g.parent === g0 && K.on === true && K.st.home.id === 'knight' && K.st.home.r > 0 && !K.prev;
        return { ok: true, street, bound, borrowed, back }; })();
      o.charp = (() => { const U = window.__UI; if (!U || typeof U.toggleMenu !== 'function') return { ok: false };
        U.toggleMenu(); const home = document.querySelector('#dhome'), tabs = document.querySelector('#menu .tabs');
        const built = !!(home && home.querySelector('#cpav') && home.querySelector('#cpbtns button')), tabsHidden = !!(tabs && tabs.style.display === 'none'), open = U.menuOpen === true;
        U.toggleMenu();
        let log = 0; if (window.CHARP && typeof CHARP.admin === 'function') { CHARP.admin(); const ap = document.querySelector('#cpadmin'); log = ap ? ap.querySelectorAll('ul li').length : 0; if (ap) ap.hidden = true; }
        return { ok: true, open, built, tabsHidden, closed: U.menuOpen === false, log }; })();
      o.bodies = (() => { const B = window.BODIES; if (!B || !B.by || typeof B.set !== 'function') return { ok: false };
        const inGame = ['knight', 'man', 'woman'].every(k => B.by[k]), none = ['knight', 'man', 'woman'].every(k => !B.by[k].playable);
        const btns = [...document.querySelectorAll('[id^=lbody-]')].map(b => b.id.slice(6)), onlyWalker = btns.length === 1 && btns[0] === 'walker';
        const saved = B.pick(); B.set('knight'); const stays = B.pick() === 'walker'; B.set(saved || 'walker');
        return { ok: true, inGame, none, onlyWalker, stays, btns: btns.join(',') }; })();
      o.wsmooth = (() => { const W = window.W3; return { on: !!(W && W.smooth > 0), tris: (W && W.tris) || 0 }; })();
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
    ok(r.offSpawn, 'every off-map inside has enterAt/boxAt and its spawn falls inside its own box (GO TO enters it, never teleports onto its footprint)');
    ok(r.doors.length >= 3 && !r.doors.includes('apt'), 'characters can go into the buildings but your apartment (' + r.doors.join(',') + ')');
    ok(r.shared >= 26, 'SHARED holds the shared state (' + r.shared + ' names)');
    ok(r.chars.fns && r.chars.levelChars && r.chars.applied, 'CHARS applies character overrides (name, stats, scale) and reads characters.json: ' + JSON.stringify(r.chars));
    ok(r.shops.ok && r.shops.noTrade, 'SHOPS is wired and a character with no shop config sells nothing: ' + JSON.stringify(r.shops));
    ok(r.shafts && r.shafts.every(Boolean), 'the sun shafts are up in the day and lit by the sun\'s shadow map, so solids block them, and no dust in the air (SHAFTS: ' + JSON.stringify(r.shafts) + ')');
    ok(r.sky && r.sky.every(Boolean), 'the sky knows its clouds: the sun\'s cover is a number in 0..1, the CPU cloud mirror answers in 0..1 (' + JSON.stringify(r.sky) + ')');
    ok(r.breath[0] && r.breath[1] && r.breath[2] > 0, 'breath: VIT.air + VIT.breathe exist and the AIRCAP mushroom grants air (' + r.breath.join(',') + ')');
    ok(r.downs.every(Boolean), 'every down level (dungeon, gem cave, hudson cavern) gives its own has/ground/bound through LEVELS.of (' + r.downs.join(',') + ')');
    ok(r.swords.ok && r.swords.dmg === '1,2,3,5' && r.swords.hand && r.swords.api && r.swords.took === 1, 'swords: four blades carry DAMAGE on the item model, every blow passes the guard, landed strikes feed SWORDSMANSHIP: ' + JSON.stringify(r.swords));
    ok(r.soft, 'the SOFT DAY look: a fourth look with its clouds, sun-side mist and sun shafts');
    ok(r.spar, 'the sparring ring stands by the swordsmith (partners come only when you spar)');
    ok(r.cinema, 'CINEMA is wired (shared screen: tick, push, admin, now; idle off the street)');
    ok(r.tenants, 'the owner\'s TENANTS tab is there and hidden (only the owner sees it)');
    ok(r.online, 'ONLINE is wired (other players: feed, at/V for the ragdoll, chat key, a SYS life entry; alone off the website)');
    ok(r.rack.ok && r.rack.pinned && r.rack.near && r.rack.free && r.rack.thing && r.rack.drawn && r.rack.rackBy, 'the bear merchant is pinned on free ground beside the nature merchant, his coat rack beside him and usable: ' + JSON.stringify(r.rack));
    ok(r.knight.ok && r.knight.street && r.knight.bound && r.knight.borrowed && r.knight.back, 'the plate knight walks the street as THE ARMOURER, is a shop, and comes back after the holodeck borrows him: ' + JSON.stringify(r.knight));
    ok(r.bodies.ok && r.bodies.inGame && r.bodies.none && r.bodies.onlyWalker && r.bodies.stays, 'YOU can only be the Walker: knight/man/woman stay in the game but are off the BODY row, and picking one keeps you the Walker: ' + JSON.stringify(r.bodies));
    ok(r.wsmooth.on && r.wsmooth.tris > 30000 && r.wsmooth.tris < 90000, 'the Walker is built with the line-smoothing pass on and a sane triangle count: ' + JSON.stringify(r.wsmooth));
    ok(r.equip.ok && r.equip.slots && r.equip.d0 && r.equip.guard && r.equip.float && r.equip.off, 'EQUIP wears body gear and resolves its grant (guard softens blows, float lifts), one off at a time: ' + JSON.stringify(r.equip));
    ok(r.charp.ok && r.charp.open && r.charp.built && r.charp.tabsHidden && r.charp.closed && r.charp.log >= 50, 'the character page is the menu home (ESC): avatar + buttons built, the old tabs hidden, opens and closes, and the admin menu game log is baked from HISTORY: ' + JSON.stringify(r.charp));
    const pk = await pg.evaluate(() => { const P = window.PARK, D = window.DFOG, c = window.SHARED && window.SHARED.composer; return { sign: !!(P.sign && P.sign.top > P.sign.y), fog: !!D && D.get().start === 20 && D.get().end === 60, pass: !!c && c.passes.some(q => q.uniforms && q.uniforms.tDepth), stand: !!(P.stand && P.stand.children.length) }; }).catch(e => ({ err: e.message }));
    ok(pk.sign && pk.fog && pk.pass && pk.stand, 'the park: its sign has a top for the dragon, the street stand-ins are built, the distance fog pass reads depth (20 to 60 tiles from you): ' + JSON.stringify(pk));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all core checks passed');
  process.exit(fails.length ? 1 : 0);
})();
