// THE CORE CHECK: node tests/core.cjs dist/market.html. Fast checks of the core's own logic (imports, the level file, SYS, ZONES, VIS, LEVELS, FADE, collision), one start of the page.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=core::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const ROOT = path.resolve(__dirname, '..');

try { execFileSync('node', ['--stack-size=8000', ROOT + '/tools/imports.cjs', '--check'], { stdio: 'pipe' }); ok(true, 'every file\'s imports are up to date and point back only'); }
catch (e) { ok(false, 'imports: ' + String(e.stdout || '') + String(e.stderr || '')); }
{ const fs = require('fs'), bad = fs.readdirSync(ROOT + '/src').filter(f => /\.js$/.test(f) && /CLOCKWISE/.test(fs.readFileSync(ROOT + '/src/' + f, 'utf8'))); ok(!bad.length, 'the Loop\'s signs name streets, not directions (no CLOCKWISE in src' + (bad.length ? ': ' + bad.join(', ') : '') + ')'); }

const L = JSON.parse(fs.readFileSync(ROOT + '/data/world.json', 'utf8'));
ok(L.places.every(p => p.x0 < p.x1), 'every place in the level file has x0 < x1');
const rect = p => p.y1 != null ? [p.x0, p.x1, p.y0, p.y1] : [p.x0, p.x1, L.block.back, -77], into = (a, b) => a.kind === 'stairs' && b.kind === 'passage';
const pl = L.places.filter(p => p.kind !== 'park'), lap = pl.find((p, i) => pl.some((q, j) => j !== i && !into(p, q) && !into(q, p) && (([a0, a1, b0, b1], [c0, c1, d0, d1]) => a0 < c1 - .01 && c0 < a1 - .01 && b0 < d1 - .01 && d0 < b1 - .01)(rect(p), rect(q))));
ok(!lap, 'no two places overlap (stairs may stand in a passage)' + (lap ? ' (' + lap.id + ')' : ''));
ok(L.paths.every(p => p.a && p.b), 'every park path has two ends');
{ const c = L.parkPlaces.castle, P = L.park, [n, e] = ['path0', 'path1'].map(id => L.paths.find(p => p.id === id)), x0 = c.x0 - 3.6, x1 = c.x0 + 21 + 3.6, y0 = c.y0 - 3.9, y1 = c.y0 + 17 + 3.6, gx = c.x0 + 12.5;
  ok(x0 > P.x0 + 12 && x1 < n.a[0] - 8 && y0 > e.a[1] + 8 && y1 < P.y1 - 12, 'the castle and its moat stand in the park\'s north-west block, clear of the wall and the ways (owner, 2 Nov 2026)');
  ok(L.paths.some(p => Math.abs(p.b[0] - gx) < .01 && Math.abs(p.b[1] - y0) < .01 && Math.abs(p.a[1] - e.a[1]) < .01), 'a way runs from the cross path to the castle\'s drawbridge'); }
{ const C = JSON.parse(fs.readFileSync(ROOT + '/data/cars.json', 'utf8')).cars, P = L.cars || [];
  ok(P.length && P.every(c => C[c.model] && c.x > L.streets.market.x0 && c.x < L.streets.market.x1 && c.y > -70 && c.y < -50) && new Set(P.map(c => c.id)).size === P.length, 'every parked car in the level file is a car in data/cars.json, on Market St between its kerbs, its id its own (' + P.length + ')'); }
{ const A = JSON.parse(fs.readFileSync(ROOT + '/data/art.json', 'utf8')), bad = A.filter(t => !(t.t && t.a && t.d && t.m && t.w > 0 && t.h > 0 && /^data:image\/jpeg;base64,/.test(t.i)));
  ok(A.length >= 50 && !bad.length && new Set(A.map(t => t.t + t.a)).size === A.length, 'the art museum\'s ' + A.length + ' paintings each have a title, artist, date, museum, size and picture, none twice'); }
{ const S = L.sections, G = S.grid, ids = S.ids.flat(), box = id => { const c = S.ids.findIndex(r => r.includes(id)), r = S.ids[c].indexOf(id); return [G.x0 + c * G.w, G.x0 + (c + 1) * G.w, G.y0 + r * G.h, G.y0 + (r + 1) * G.h]; };
  ok(ids.length === G.cols * G.rows && new Set(ids).size === ids.length && ids.includes(L.section.id), 'the section grid names each of its ' + ids.length + ' sections once, this one among them');
  ok(ids.every(id => L.loop.stations.filter(s => s.id === id).length === 1) && L.loop.stations.every(s => { const [x0, x1] = box(s.id); return s.x - 29 > x0 && s.x + 29 < x1; }), 'every section has one loop station, inside it'); }
ok(L.places.every(p => p.x0 >= L.streets.market.x0 && p.x1 <= L.streets.market.x1), 'every place sits on Market St');
{ const S = fs.readFileSync(ROOT + '/src/001-rig.js', 'utf8'), src = S.slice(S.indexOf('const WDRAWN='), S.indexOf('\n})();') + 6);
  const R = new Function('location', 'localStorage', 'document', '__DATA__', src + '\nreturn RIG;')({ search: '' }, { getItem: () => null, setItem() {} }, { createElement: () => ({ getContext: () => ({}) }) }, p => JSON.parse(fs.readFileSync(ROOT + '/' + p, 'utf8')));
  let bad = 0; for (const hold of [1, 3, 6, 10]) { const st = R.create(); st.snap = st.smooth = true; let z = 0, t = 0;
    for (let f = 0; f < 70; f++) { st.target = f >= 30 && f < 30 + hold ? 1 : 0; const b = st.dist; R.step(st, 1 / 60); z += st.dist - b; t += 1 / 60; st.world = { x: 0, z, y: 0, hd: 0, kx: 1, ky: 1, gnd: () => 0, t };
      const J = R.pose(st).J; if (!['ankleL', 'ankleR', 'kneeL', 'kneeR'].every(n => isFinite(J[n].x + J[n].y + J[n].z))) bad++; } }
  ok(!bad, 'a one-tap step and stop keeps both legs finite (world foot lock)' + (bad ? ' (' + bad + ' bad frames)' : ''));
  // the held thing's arm is the passport's hand: an aim moves the right wrist for a right-hander, the left for a left-hander, and an arm pointing up or back still poses
  const wr = (hand, v) => { const st = R.create(); st.hand = hand; if (v) st.aim = { v: R.V(...v), w: 1 }; const J = R.pose(st).J; return { L: [J.wristL.x, J.wristL.y, J.wristL.z], R: [J.wristR.x, J.wristR.y, J.wristR.z] }; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]), o = wr('R'), aR = wr('R', [0, -.3, 1]), aL = wr('L', [0, -.3, 1]), up = wr('L', [0, 1, 0]), back = wr('R', [0, 0, -1]);
  ok(dist(o.R, aR.R) > 3 && dist(o.L, aR.L) < .01 && dist(o.L, aL.L) > 3 && dist(o.R, aL.R) < .01 && [up.L, back.R].every(w => w.every(isFinite)), 'the aim poses the right arm for a right-hander and the left for a left-hander, up and back included');
  // hanging from a branch: with holds given in the world the wrists go to them (the hands over the branch), without them the arms just hang up
  { const hg = grip => { const st = R.create(); st.hang = { z: 0, t: 0, side: 0, grip }; st.world = { x: 0, z: 0, y: 0, hd: 0, kx: 1, ky: 1, gnd: () => 0, t: 0 }; const J = R.pose(st).J; return { L: [J.wristL.x, J.wristL.y, J.wristL.z], R: [J.wristR.x, J.wristR.y, J.wristR.z] }; };
    const H = { L: { h: { x: 4, y: 46, z: 5, nx: 0, ny: 1, nz: 0 } }, R: { h: { x: -4, y: 46, z: 5, nx: 0, ny: 1, nz: 0 } } }, g = hg(H), o = hg(null), tgt = h => [h.x, h.y - .3, h.z];
    ok(dist(g.L, tgt(H.L.h)) < 2 && dist(g.R, tgt(H.R.h)) < 2 && dist(o.L, g.L) > 2 && [g.L, g.R, o.L, o.R].every(w => w.every(isFinite)), 'hanging, the wrists go onto the branch\'s holds: ' + JSON.stringify({ g, o })); } }

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 } }), errs = [];   // small: software drawing is the check's time
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(3000);
    for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => !!(window.SHAFTS && SHAFTS.occ === 1)).catch(() => false)) break; await pg.waitForTimeout(500); }   // the sun's first shadow pass (slow under software GL)
    await pg.waitForFunction(() => window.RPGNPC && RPGNPC.list && RPGNPC.list.length >= 6 && window.BODIES && BODIES.by.hero && BODIES.by.poacher, { timeout: 30000 }).catch(() => {});   // the deferred street walkers
    const r = await pg.evaluate(async () => {
      const o = {}, B = SHARED.BOD, X = B.XS, Z = B.ZS;
      o.sway = !!(SYS.P.cam && SYS.P.cam.some(s => s.name === '094-ui')) && __dbg.ui().sway === false && !!document.getElementById('dsway') && __dbg.ui().swayL >= 1 && __dbg.ui().swayL <= 10 && !!document.getElementById('dswayl');
      o.inspect = !!(window.INSPECT && INSPECT.kinds.length >= 10 && typeof INSPECT.item === 'function' && __dbg.ui().keyOf('inspect') && FORAGE.ROWB.some(f => (f('m_button') || []).some(b => b[1] === 'inspect')));
      o.talk = !!(window.TALK && typeof TALK.open === 'function' && TALK.shops instanceof Map && TALK.script && (() => { const N = __dbg.npcs().find(n => n.key === 'teddy'); const t = N && TALK.script(N); return !!(t && t.lines && t.lines[t.start]); })());
      o.phases = Object.keys(SYS.P); o.sysErr = Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name));
      o.hud = (() => { try { const ok = {}; ok.vit = !document.getElementById('vit').hidden && getComputedStyle(document.getElementById('vit')).top !== 'auto' && /\/ 100$/.test(document.getElementById('vhpn').textContent);
        ok.slots = document.querySelectorAll('#hqb .qs').length === 10; HUD.set(1, 'mortar'); ok.setOk = HUD.slots[1] === 'mortar' && /MORTAR/.test(document.querySelectorAll('#hqb .qs')[1].textContent); HUD.set(1, null);
        __dbg.ui().log('a test line', null, 'MEL'); FORAGE.say('A SAID LINE'); ok.log = HUD.lines().slice(-2).join('|') === 'MEL a test line|A SAID LINE'; ok.map = !!HUDDBG().map && !!HUDDBG().plan && document.getElementById('hmz').textContent.startsWith('A') && !FORAGE.has('map');
        { const R = document.querySelector('#menu [data-p="graphics"] #dhaze'), e0 = DFOG.get().end, b0 = e0 - DFOG.get().start; DFOG.range(100); ok.haze = !!R && +R.value === 100 && DFOG.get().end === 100 && DFOG.get().end - DFOG.get().start === b0 && document.getElementById('dhazev').textContent === '100 TILES'; DFOG.range(e0); } return ok; } catch (e) { return { err: String(e) }; } })();
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
      o.offPlaces = window.__UI.places().filter(p => ROOMS.boxAt(p[1], p[2])).map(p => p[0] + ':' + (p[3] == null || p[3] === 'up') + ':' + !(window.RIVER && RIVER.inZone && RIVER.inZone(p[1], p[2]))).filter(t => /false/.test(t));
      o.chars = (() => { const C = window.CHARS; if (!C || ['apply', 'put', 'live', 'applyAll', 'id'].some(k => typeof C[k] !== 'function')) return { fns: false }; const F = { name: 'x', hp: 1, sta: 1, st: { v: 1, R: 1, home: { id: 'z' } }, g: { scale: { setScalar(v) { F.g.scale._v = v; } } } }; C.put(F, { name: 'NN', hp: 9, stamina: 4, scale: 3 }); return { fns: true, levelChars: C.rec('___none') === null, applied: F.name === 'NN' && F.hp === 9 && F.sta === 4 && F.g.scale._v === 3 }; })();
      o.shops = (() => { const S = window.SHOPS, C = window.CHARS; if (!S || !C) return { ok: false }; const fns = ['open', 'close', 'sync'].every(k => typeof S[k] === 'function') && typeof C.trade === 'function'; const N = (window.__dbg.NPCS || [])[0]; return { ok: fns, noTrade: N ? C.trade(N) === null : true }; })();
      o.edges = (() => { const C = __dbg.THREE.ShaderChunk, f = C.shadowmap_pars_fragment, L = C.lights_fragment_begin; return [(f.match(/texture2DCompare\(/g) || []).length, L.includes('if ( sh > 0. )'), window.SUNDBG ? SUNDBG().patch : false]; })();
      o.shafts = window.SHAFTS ? [SHAFTS.on === 0, SHAFTS.occ === 1, SHAFTS.list[0].material.depthTest === true] : null;
      o.lawn = (() => { const lc = SHARED.BOD.g.lawnCol(3.3, 7.1), map = __dbg.MAPK.MODS.land && __dbg.MAPK.MODS.land.material.map; return { painted: !!(map && map.image && map.image.width > 0), col: Array.isArray(lc) && lc.length === 3 && lc.every(v => v >= 0 && v <= 255), top: typeof WEEDS.top === 'function' }; })();
      o.sky = [typeof SKY.sunCover === 'number' && SKY.sunCover >= 0 && SKY.sunCover <= 1, SKY.CU && SKY.CU.cover(0, 1, 0, 0) >= 0 && SKY.CU.cover(0, 1, 0, 0) <= 1, SKY.CU && SKY.CU.n === 0 && typeof SKY.cumulus === 'function'];
      o.breath = [typeof __dbg.VIT.air === 'number', typeof __dbg.VIT.breathe === 'function', (window.ITEMS && ITEMS.prop ? +ITEMS.prop('airshroom', 'breath') : 0) || 0];
      o.downs = ['dungeon', 'gemcave', 'hudson'].map(k => { const L = LEVELS.of[k]; return !!(L && L.floor === 'down' && typeof L.has === 'function' && typeof L.ground === 'function' && typeof L.bound === 'function'); });
      o.swords = (() => { const I = window.ITEMS, W = window.WIELD, F = window.FIGHT, S = window.STRIKES, V = __dbg.VIT; if (!I || !W || !F || !S) return { ok: false };
        const h0 = V.hp, took = V.hurt(.01, { x: 0, z: 0 }); V.hp = h0; return { ok: true, dmg: ['sword_wood', 'sword', 'sword_steel', 'sword_ench'].map(k => +I.prop(k, 'damage')).join(), hand: I.prop('sword_steel', 'slot') === 'hand' && I.prop('sword_steel', 'grants') === 'fight', api: 'block' in W && typeof S.landed === 'function' && typeof V.guard === 'function', took }; })();
      o.hours = (() => { const c0 = DN.cycleAt(0), c1 = DN.cycleAt(3 * DN.HOUR + DN.FADE / 2), c2 = DN.cycleAt(3 * DN.HOUR + DN.FADE); return !!(DN.modes.join() === 'sunrise,day,sunset,night' && !CLOCK.run && DN.modes.every(m => DN.D0[m].bands === 0 && DN.D0[m].cov >= 1 && DN.D0[m].skym === 0 && DN.D0[m].shaft === 0) && c0.cur === 'sunrise' && c0.prev === 'night' && c1.cur === 'night' && c1.prev === 'sunset' && c1.f > .4 && c1.f < .6 && c2.f === 1 && DN.hold === 'day' && typeof DN.follow === 'function' && DN.dayAt(0) === 5 && Math.abs(DN.dayAt(3 * DN.HOUR + DN.HOUR / 2) - 2) < 1e-9 && CLOCK.sunH === 13 && CLOCK.h === 13 && typeof CLOCK.dayElev === 'function' && window.DFOG && DFOG.get().blur < 1 && DFOG.get().start === 10); })();
      o.windows = !!(window.WINDOWS && typeof WINDOWS.bake === 'function' && WINDOWS.panes.some(p => p.off === 'bodega' && p.look === 'in') && SYS.P.places.some(s => s.name === '130a-windows') && ROOMS.off.bodega.shift);
      o.cinema = !!(CINEMA && typeof CINEMA.tick === 'function' && typeof CINEMA.push === 'function' && typeof CINEMA.isAdmin === 'function' && typeof CINEMA.now === 'function' && CINEMA.on === false);
      o.online = !!(window.ONLINE && ONLINE.others instanceof Map && typeof ONLINE.feed === 'function' && typeof ONLINE.at === 'function' && ONLINE.V.length === 8 && typeof ONLINE.open === 'function' && SYS.P.life.some(s => s.name === '111d-online') && ONLINE.on === false && __dbg.ui().keyOf('chat') === 'enter');
      o.tenants = document.querySelector('[data-t="tenants"]').hidden === true && !!document.getElementById('dten');
      o.equip = (() => { const E = window.EQUIP, I = window.ITEMS, V = __dbg.VIT, F = window.FORAGE; if (!E || !I || !V || !F || typeof E.wear !== 'function') return { ok: false };
        const slots = I.prop('armor', 'slot') === 'body' && I.prop('armor', 'grants') === 'guard' && I.prop('cloudcoat', 'slot') === 'body' && I.prop('cloudcoat', 'grants') === 'float';
        const d0 = V.def === 0 && E.float === false; F.give('armor', 1); E.wear('armor'); const guard = V.def > 0 && E.worn === 'armor';
        F.give('cloudcoat', 1); E.wear('cloudcoat'); const float = E.float === true && V.def === 0; E.wear('cloudcoat'); const off = E.float === false && !E.worn;
        return { ok: true, slots, d0, guard, float, off }; })();
      o.rack = (() => { const R = window.RACK, G = window.GLBTOONS, bear = G && G.coatbear, B = __dbg.MAPK.BOD; if (!R || !R.at || !bear) return { ok: false };
        const h = bear.st.home, hudson = h.z > B.ZS(-119) && h.z < B.ZS(-107.9), c = __dbg.collide(h.x, h.z), free = Math.hypot(c[0] - h.x, c[1] - h.z) < 1e-6;   // his home sits on the Hudson promenade (the block's walk zone)
        return { ok: true, pinned: h.r === 0 && Math.hypot(bear.st.x - h.x, bear.st.z - h.z) < 1, hudson, free, thing: __dbg.ui().things.some(t => /COAT RACK/.test(t.name)), drawn: window.LEVELS.drawn(R.g), rackBy: Math.hypot(R.at.x - h.x, R.at.z - h.z) < 4 }; })();
      o.rpg = (() => { const R = window.RPGNPC; if (!R || !Array.isArray(R.list)) return { ok: false }; const L = R.list;
        return { ok: true, n: L.length, keys: L.map(N => N.key).sort().join(','), rig: L.every(N => N.PM && N.body), onStreet: L.every(N => N.g && N.g.parent) }; })();
      o.knight = (() => { const B = window.BODIES, K = B && B.by && B.by.knight && B.by.knight.npc; if (!K) return { ok: false }; const T = __dbg.THREE, g0 = K.g.parent, G = new T.Group();
        const street = K.on === true && K.st.home.id === 'knight' && K.name === 'THE ARMOURER', bound = SHOPDBG().bound.includes('knight');
        B.place('knight', K.st.x + 1, K.st.z + 1, 0, G); const borrowed = K.g.parent === G && K.st.home.r === 0; B.restore('knight'); const back = K.g.parent === g0 && K.on === true && K.st.home.id === 'knight' && K.st.home.r > 0 && !K.prev;
        return { ok: true, street, bound, borrowed, back }; })();
      o.charp = await (async () => { const U = window.__UI; if (!U || typeof U.toggleMenu !== 'function') return { ok: false };
        U.toggleMenu(); const home = document.querySelector('#dhome'), tabs = document.querySelector('#menu .tabs');
        const built = !!(home && home.querySelector('#cpav') && home.querySelector('#cpbtns button')), tabsHidden = !!(tabs && tabs.style.display === 'none'), open = U.menuOpen === true;
        const pick = !home.querySelector('#cpslots') && !home.querySelector('#cphp');   // the paperdoll and the bars left the page (2 Nov 2026)
        U.toggleMenu();
        let log = 0; if (window.CHARP && typeof CHARP.admin === 'function') { await LOAD('log'); CHARP.admin(); const ap = document.querySelector('#cpadmin'); log = ap ? ap.querySelectorAll('ul li').length : 0; if (ap) ap.hidden = true; }
        return { ok: true, open, built, tabsHidden, pick, closed: U.menuOpen === false, log }; })();
      o.bodies = (() => { const B = window.BODIES; if (!B || !B.by || typeof B.set !== 'function') return { ok: false };
        const inGame = ['knight', 'man', 'woman'].every(k => B.by[k]), none = ['knight', 'man', 'woman'].every(k => !B.by[k].playable);
        const btns = [...document.querySelectorAll('[id^=lbody-]')].map(b => b.id.slice(6)), noRow = btns.length === 0 && !/BODY/.test(document.querySelector('#looks').innerText);
        const saved = B.pick(); B.set('knight'); const stays = B.pick() === 'walker'; B.set('hero'); const hero = B.pick() === 'walker' && B.by.hero.tris() > 0 && B.by.hero.npc.on; B.set('poacher'); const poacher = B.pick() === 'walker' && !!B.by.poacher && B.by.poacher.tris() > 0 && B.by.poacher.npc.on; B.set(saved || 'walker');
        return { ok: true, inGame, none, noRow, stays, hero, poacher, btns: btns.join(',') }; })();
      o.layers = (() => { const W = window.W3; if (!W || !W.wear) return { ok: false }; const t0 = W.trisWorn, was = !!W.worn.shirt;
        W.wear('shirt', true); const hid = W.HIDE[W.idx('bodyTorso')] && !W.HIDE[W.idx('torso')];
        W.wear('shirt', false); const off = !W.HIDE[W.idx('bodyTorso')] && W.HIDE[W.idx('torso')]; W.wear('shirt', was);
        return { ok: true, hid, off, back: W.trisWorn === t0, briefs: W.idx('briefs') >= 0 }; })();
      o.garb = (() => { const d = window.GARBDBG && GARBDBG(); if (!d) return { ok: false };
        const parts = d.parts.map(p => p.k).sort().join(','), free = d.parts.every(p => p.free > 0 && p.free < p.points), sp = GARBDBG.spec(true), menu = document.querySelector('#looks').innerText;
        return { ok: true, parts, free, held: d.held, shown: d.shown, under: !W3.worn.shirt && !W3.worn.pants && W3.HIDE[W3.idx('torso')], bare: sp.shirt && sp.pants && !sp.shoes && !sp.hat && !sp.jacket, lean: !/BATHROBE|WEARING|STATS|CLOTHES/.test(menu), ms: d.ms }; })();
      o.wsmooth = (() => { const W = window.W3; return { on: !!(W && W.weld === 'dc'), tris: (W && W.tris) || 0 }; })();
      o.hatcut = (() => { const W = window.W3, G = window.GARB && GARB.mine && GARB.mine.garb; return { hat: !!(G && G.rg && G.rg.some(r => r.head)), cut: W && W.uHatCut ? W.uHatCut.value : null }; })();
      return o;
    });
    for (const p of ['dress', 'ring', 'water', 'sky', 'life', 'vitals', 'rooms', 'shadow', 'weedsAdd', 'roomsReset']) ok(r.phases.includes(p), 'SYS step "' + p + '" has systems');
    ok(r.inspect, 'INSPECT is wired: its families, the key, LOOK in the pack');
    ok(r.talk, 'TALK is wired: a character\'s script reads from characters.json, the shops hand over to it');
    ok(r.sway, 'CAMERA SWAY and its level (1-10) are in the menu, a SYS cam entry, off by default');
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
    ok(!r.offPlaces.length, 'every GO TO place inside an off-map inside enters it (level up) and is not the river\'s side' + (r.offPlaces.length ? ' (' + r.offPlaces.join() + ')' : ''));
    ok(r.doors.length >= 3 && !r.doors.includes('apt'), 'characters can go into the buildings but your apartment (' + r.doors.join(',') + ')');
    ok(r.shared >= 26, 'SHARED holds the shared state (' + r.shared + ' names)');
    ok(r.chars.fns && r.chars.levelChars && r.chars.applied, 'CHARS applies character overrides (name, stats, scale) and reads characters.json: ' + JSON.stringify(r.chars));
    ok(r.shops.ok && r.shops.noTrade, 'SHOPS is wired and a character with no shop config sells nothing: ' + JSON.stringify(r.shops));
    ok(r.lawn && r.lawn.painted && r.lawn.col && r.lawn.top, 'the lawn: the land wears its lawn texture and lawnCol gives a colour (the grass itself: tests/lawn.cjs) (' + JSON.stringify(r.lawn) + ')');
    ok(r.edges && r.edges[0] <= 16 && r.edges[1] && r.edges[2], 'cheaper shadow edges: PCF and SOFT read 4 texels (not 17/16), the point light 4 (not 9), the sun reads its near or far map and the moving map only where lit (' + JSON.stringify(r.edges) + ')');
    ok(r.shafts && r.shafts.every(Boolean), 'the sun shafts: every hour\'s look keeps them off (owner, 2 Nov 2026: no rays), still lit by the sun\'s shadow map and hidden by what stands in front (SHAFTS: ' + JSON.stringify(r.shafts) + ')');
    ok(r.sky && r.sky.every(Boolean), 'the sky knows its clouds: the sun\'s cover is a number in 0..1, the cumulus field answers in 0..1 and is baked empty (no clouds, owner 2 Nov 2026; SKY.cumulus) (' + JSON.stringify(r.sky) + ')');
    ok(r.breath[0] && r.breath[1] && r.breath[2] > 0, 'breath: VIT.air + VIT.breathe exist and the AIRCAP mushroom grants air (' + r.breath.join(',') + ')');
    ok(r.downs.every(Boolean), 'every down level (dungeon, gem cave, hudson cavern) gives its own has/ground/bound through LEVELS.of (' + r.downs.join(',') + ')');
    ok(r.swords.ok && r.swords.dmg === '1,2,3,5' && r.swords.hand && r.swords.api && r.swords.took === 1, 'swords: four blades carry DAMAGE on the item model, every blow passes the guard, landed strikes feed SWORDSMANSHIP: ' + JSON.stringify(r.swords));
    ok(r.hours, 'the hours: SUNRISE, DAY, SUNSET, NIGHT take turns one real hour each with a minute\'s fade, the day\'s hour running a quarter of the day through each; smooth cloudless skies, the far fading into the horizon colour, the distance fog gentle');
    ok(r.windows, 'WINDOWS is wired (the bodega\'s street panes registered, retaken while you are in)');
    ok(r.cinema, 'CINEMA is wired (shared screen: tick, push, admin, now; idle off the street)');
    ok(r.tenants, 'the owner\'s TENANTS tab is there and hidden (only the owner sees it)');
    ok(r.online, 'ONLINE is wired (other players: feed, at/V for the ragdoll, chat key, a SYS life entry; alone off the website)');
    ok(r.rack.ok && r.rack.pinned && r.rack.hudson && r.rack.free && r.rack.thing && r.rack.drawn && r.rack.rackBy, 'the bear merchant is pinned on free ground by the Hudson, his coat rack beside him and usable: ' + JSON.stringify(r.rack));
    ok(r.knight.ok && r.knight.street && r.knight.bound && r.knight.borrowed && r.knight.back, 'the plate knight walks the street as THE ARMOURER, is a shop, and comes back after a place borrows him: ' + JSON.stringify(r.knight));
    ok(r.rpg.ok && r.rpg.n === 6 && r.rpg.keys === 'cleric,monk,ranger,rogue,warrior,wizard' && r.rpg.rig && r.rpg.onStreet, 'the six RPG townsfolk walk the street on the player rig: ' + JSON.stringify(r.rpg));
    ok(r.bodies.ok && r.bodies.inGame && r.bodies.none && r.bodies.noRow && r.bodies.stays && r.bodies.hero && r.bodies.poacher, 'you are always the Walker: knight/man/woman/hero/egg poacher stay in the game, YOU has no BODY row, and picking one makes you the Walker: ' + JSON.stringify(r.bodies));
    ok(r.layers.ok && r.layers.hid && r.layers.off && r.layers.back && r.layers.briefs, 'the Walker is a base body in underwear with shirt, pants, shoes and hair as layers on top: ' + JSON.stringify(r.layers));
    ok(r.garb.ok && r.garb.parts === 'pants,shirt' && r.garb.free && r.garb.held === 2 && r.garb.shown && r.garb.under && r.garb.bare && r.garb.lean, 'everyone wears a shirt, trousers and shoes (shirt and trousers on cloth at their loose edges, shoes held; barefoot drops the shoes), the body\'s own layers hidden under them; YOU has no bathrobe, WEARING or STATS: ' + JSON.stringify(r.garb));
    ok(r.hatcut.cut != null && (r.hatcut.hat ? r.hatcut.cut < 10 : r.hatcut.cut > 1e8), 'with a hat on, hair above its band is not drawn (the cut follows the hat): ' + JSON.stringify(r.hatcut));
    ok(r.wsmooth.on && r.wsmooth.tris > 12000 && r.wsmooth.tris < 60000, 'the Walker is welded by dual contouring (straight hems, no ripples) with a sane triangle count (styles not worn are built when picked): ' + JSON.stringify(r.wsmooth));
    ok(r.equip.ok && r.equip.slots && r.equip.d0 && r.equip.guard && r.equip.float && r.equip.off, 'EQUIP wears body gear and resolves its grant (guard softens blows, float lifts), one off at a time: ' + JSON.stringify(r.equip));
    ok(r.hud && r.hud.vit && r.hud.slots && r.hud.setOk && r.hud.log && r.hud.map && r.hud.haze, 'the HUD: vitals top left with numbers, ten quick slots that take a thing, the log takes the chat and the game\'s lines, the minimap paints from the map\'s plan with no MAP item, HAZE RANGE in GRAPHICS moves the fog\'s end: ' + JSON.stringify(r.hud));
    ok(r.charp.ok && r.charp.open && r.charp.built && r.charp.tabsHidden && r.charp.pick && r.charp.closed && r.charp.log >= 50, 'the character page is the menu home (ESC): avatar + buttons built, the old tabs hidden, an empty slot opens its gear list, opens and closes, and the admin menu game log is baked from HISTORY: ' + JSON.stringify(r.charp));
    const pk = await pg.evaluate(() => { const P = window.PARK, D = window.DFOG, c = window.SHARED && window.SHARED.composer; return { sign: !!(P.sign && P.sign.top > P.sign.y), fog: !!D && D.get().start === 10 && D.get().end === 45, pass: !!c && c.passes.some(q => q.uniforms && q.uniforms.tDepth), stand: !!(P.stand && P.stand.geometry && P.standFar && P.standFar.geometry) }; }).catch(e => ({ err: e.message }));
    ok(pk.sign && pk.fog && pk.pass && pk.stand, 'the park: its sign has a top for the dragon, the street stand-ins are built, the distance fog pass reads depth (10 to 45 tiles from you): ' + JSON.stringify(pk));
    await pg.evaluate(() => window.__dbg.UI.setView('follow')).catch(() => {}); await pg.waitForTimeout(800);
    { const d0 = await pg.evaluate(() => ({ on: window.DFOG.get().on, cut: window.DFOG.cut(), pass: window.DFOG.pass.enabled, mist: window.FAR3.mist })).catch(e => ({ err: e.message })); ok(d0.on === false && d0.cut === 0 && !d0.pass && d0.mist === false, 'no distance effects by default (3 Nov 2026): the whole map drawn, no fog pass, no mist: ' + JSON.stringify(d0)); }
    await pg.evaluate(() => window.DFOG.set({ on: true })).catch(() => {}); await pg.waitForTimeout(800);   // the fog, when chosen in ATMOSPHERE
    const hz = await pg.evaluate(() => { const D = window.__dbg, C = D.CULL, T = D.cv().TILE, [x, , z] = D.pos(), mk = d => { const m = new D.THREE.Mesh(new D.THREE.BoxGeometry(1, 1, 1)); m.position.set(x + d * T, 0, z); m.updateMatrixWorld(); D.scene.add(m); return m; };
      const far = mk(80), near = mk(10), sky = window.FAR3.mesh, skyV = sky && sky.visible, pass = window.SHARED.composer.passes.find(q => q.uniforms && q.uniforms.uF);
      C.scan(); C.begin(); const r = { cut: +(window.DFOG.cut() / T).toFixed(1), farHid: !far.visible, nearShown: near.visible, sky: !!sky && sky.visible === skyV && !C.FL.includes(sky), npc: C.past(x + 80 * T, z, T) && !C.past(x + 30 * T, z, T), full: !!pass && pass.uniforms.uF.value === 1 };
      C.end(); r.back = far.visible; far.removeFromParent(); near.removeFromParent(); return r; }).catch(e => ({ err: e.message }));
    ok(hz.cut === 45 && hz.farHid && hz.nearShown && hz.sky && hz.npc && hz.full && hz.back, 'the haze is whole at its end and nothing wholly past it is drawn (a mesh 80 tiles off hidden for the frame, one 10 tiles off drawn, the skyline kept, characters by the same test): ' + JSON.stringify(hz));
    await pg.evaluate(() => window.DFOG.set({ on: false })).catch(() => {});
    { const iz = await pg.evaluate(() => { window.__dbg.UI.setView('iso'); return window.DFOG.cut(); }).catch(e => e.message); ok(iz === 0, 'no haze and nothing cut in the isometric view (27 Oct 2026): ' + iz); }
    const rg = await pg.evaluate(() => { const P = window.PARK, R = P.ring; if (!R) return { ring: false }; const A = R.userData.P; let out = 0;
      for (let v = 0; v < A.length; v += 3) { const [x, y] = P.at(A[v], A[v + 2]); if (x < P.x0 + 1.5 || x > P.x1 - 1.5 || y < P.y0 + 1.5 || y > P.y1 - 1.5) out++; }
      return { ring: true, n: P.ringN, still: !R.geometry.attributes.aSw, low: R.userData.items.every(o => /\.low$/.test(o.k)), out, climb: P.treeItems().length >= P.ringN }; }).catch(e => ({ err: e.message }));
    ok(rg.ring && rg.n > 40 && rg.still && rg.low && rg.out === 0 && rg.climb, "the park's edge ring is one still low bake, every crown inside the wall, its trees climbable: " + JSON.stringify(rg));
    const ck = await pg.evaluate(() => ({ k: window.FORAGE && FORAGE.climbK ? FORAGE.climbK() : null, grow: !!(window.FORAGE && FORAGE.climbed), lad: !!(window.__dbg.MAPK && window.__dbg.MAPK.MODS.apts.lad), sk: !!(window.FORAGE && FORAGE.SK.some(s => s[0] === 'climb')) })).catch(e => ({ err: e.message }));
    ok(ck.sk && ck.k >= .7 && ck.k <= 1.5 && ck.grow && ck.lad, 'CLIMBING is one skill for every climb: its pace and growth live on the skills system, the fire escape ladder is there to read it: ' + JSON.stringify(ck));
    const rf = await pg.evaluate(() => typeof ROOFSDBG !== 'undefined' ? ROOFSDBG() : null).catch(e => ({ err: e.message }));
    ok(rf && rf.blockProps > 120 && rf.blockBoxes > 250 && rf.tris < 160000 && rf.propRows.length === 1 && rf.propRows[0] === 1, 'the Market St row garages wear a busy roof of units, dishes, ducts, planters and debris (within budget); the Hudson row is bare (30 Oct 2026): ' + JSON.stringify(rf));
    const mk = await pg.evaluate(() => { const all = [...BLK.blds.map(q => ({ ...q, kind: 'garage' })), ...BLK.lots], a = q => q.row === 5 ? [q.y0, q.y1] : [q.x0, q.x1]; let same = 0;
      for (const r of [1, 5]) { const L = all.filter(q => q.row === r).sort((p, q) => a(p)[0] - a(q)[0]); for (let i = 1; i < L.length; i++) if (L[i].kind === L[i - 1].kind && a(L[i])[0] - a(L[i - 1])[1] < .05) same++; }
      const n = k => all.filter(q => q.kind === k).length; return { n: all.length, garage: n('garage'), park: n('park'), empty: n('empty'), wide: all.filter(q => a(q)[1] - a(q)[0] > 13.1).length, same, signs: BLK.signs.length, hud2lots: BLK.lots.filter(q => q.row === 2).length, hud2g: BLK.blds.filter(q => q.row === 2).length }; }).catch(e => ({ err: e.message }));
    ok(mk.n > 50 && mk.garage > 15 && mk.park >= 9 && mk.empty > 10 && !mk.wide && !mk.same && !mk.signs && !mk.hud2lots && mk.hud2g > 5, "fillers: rows 1 and 5 stay a mix of closed garages, empty parking lots and dirt lots (no two alike side by side); the Hudson row (row 2) is all closed garages (30 Oct 2026): " + JSON.stringify(mk));
    const cm = await pg.evaluate(async () => { const raf = () => new Promise(r => requestAnimationFrame(r)), D = window.__dbg, W = D.W3, T = D.cv().TILE, hi = W.idx('head');
      D.UI.goTo(-2.2, 3.2, 'up', .8); D.UI.setView('follow'); for (let i = 0; i < 12; i++) await raf(); let min = 1e9;
      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); for (let i = 0; i < 3; i++) { await raf(); const h = new D.THREE.Vector3().setFromMatrixPosition(W.PM.value[hi]).applyMatrix4(W.mesh.matrixWorld); min = Math.min(min, D.camO().position.distanceTo(h) / T); }
      dispatchEvent(new KeyboardEvent('keyup', { key: 'w' })); D.UI.setView('iso'); return { min: +min.toFixed(2) }; }).catch(e => ({ err: e.message }));
    ok(cm.min >= 1.5, 'the behind view never pulls the camera into his head as he starts walking beside a solid: ' + JSON.stringify(cm));
    const dg = await pg.evaluate(async () => { const raf = () => new Promise(r => requestAnimationFrame(r)); for (let i = 0; i < 600 && !window.DRAGONDBG; i++) await raf();
      const D = window.__dbg, TI = D.cv().TILE, you = D.pos(), n = D.npcs().find(q => q.key === 'dragon' && !q.D.p.sign); if (!n) return { err: 'no dragon' };
      const fly = n.mixer._actions.find(x => x.getClip().name === 'Flying_loop'), out = {}; if (n.D.p) n.D.p.on = 0;
      const put = () => { n.D.mode = 'fly'; n.D.fly = 99; n.st.x = you[0] + 2 * TI; n.st.z = you[2] + 2 * TI; n.D.y = n.D.cruise = you[1] + 4 * TI; };
      for (let k = 0; k < 2; k++) { n.D.bt = k ? 0 : 99; for (let i = 0; i < (k ? 12 : 2); i++) { await raf(); put(); }
        out['phase' + k] = { style: n.D.style, speed: +fly.getEffectiveTimeScale().toFixed(2), weight: +fly.getEffectiveWeight().toFixed(2) }; } return out; }).catch(e => ({ err: e.message }));
    ok(dg.phase0 && dg.phase1 && dg.phase0.style !== dg.phase1.style && dg.phase0.speed > .4 && dg.phase1.speed > .4, 'a flying dragon beats its wings through both halves of its flight: ' + JSON.stringify(dg));
  }
  { const ps = await pg.evaluate(() => { const C = SHARED.composer.passes, i = C.findIndex(q => q.uniforms && q.uniforms.uL && q.uniforms.uT), on = C.filter(q => q.enabled); return { found: i >= 0, on: i >= 0 && C[i].enabled, last: on[on.length - 1] === C[i], lines: i >= 0 && C[i].uniforms.uL.value.y }; }).catch(e => ({ err: e.message }));
    ok(ps.found && ps.on && ps.last && ps.lines === 240, 'the PS2 filter is on by default and is the last pass (240 lines): ' + JSON.stringify(ps)); }
  await pg.setViewportSize({ width: 1280, height: 720 });   // the RESOLUTION steps differ only on a tall enough window
  { const rs = await pg.evaluate(async () => { const c = document.querySelector('#stage canvas'), out = {}, raf = () => new Promise(r => requestAnimationFrame(r)), at = async i => { document.querySelector('[data-res="' + i + '"]').click(); await raf(); return c.height; }; for (const i of [0, 2, 4]) out[i] = await at(i); PS2.set(false); out.off = await at(4); PS2.set(true); return out; }).catch(e => ({ err: e.message }));
    ok(rs[0] > 0 && rs[0] < rs[2] && rs[2] === 480 && rs[4] === 480 && rs.off > 480, 'RESOLUTION: LOWEST under MED; MED and HIGHEST both 480 lines while the PS2 filter is on, HIGHEST the screen\'s own with it off: ' + JSON.stringify(rs)); }
  { const av = await pg.evaluate(() => { const c = (k, v) => document.querySelector(`#looks [data-${k}="${v}"]`).click(), on = n => !W3.HIDE[W3.idx(n)], out = {};
      out.start = on('hair') && !on('hairWavy') && !on('bustF'); c('hair', 'hairWavy'); out.wavy = on('hairWavy') && on('hairWavyA') && !on('hair');
      c('hair', ''); out.bald = !W3.pcs.some((P, i) => P.layer === 'hair' && !W3.HIDE[i]); c('beard', 'beardGoatee'); out.beard = on('beardGoatee');
      c('form', 'F'); out.female = on('bodyBustF') && !on('beardGoatee') && document.querySelector('#lbeard').hidden; out.code = LOOKS.code(); out.back = JSON.stringify(LOOKS.decode(out.code));
      c('form', 'M'); c('hair', 'hair'); c('beard', ''); out.reset = on('hair') && !on('bustF') && LOOKS.code() === 'M00'; return out; }).catch(e => ({ err: e.message }));
    ok(av.start && av.wavy && av.bald && av.beard && av.female && av.code === 'F60' && av.back === '{"form":"F","hair":"","beard":""}' && av.reset, 'YOU: a hairstyle, bald, a beard and FEMALE each show only their pieces, and the look\'s code for the other players reads back: ' + JSON.stringify(av)); }
  { const cn = await pg.evaluate(() => { const U = CINEMA.upcoming(4), t = Date.now(), a = CINEMA.showAt(t), b = CINEMA.showAt(t + 1);
      return { n: CINEMA.films.length, same: a.f.id === b.f.id && a.start === b.start, order: U.every((f, i) => !i || f.start > U[i - 1].start), starts: U.every(f => f.start % 900000 === 0), gate: typeof (STORE.gate || {}).theatre === 'function', noBooth: !(ROOMS.off || {}).booth }; }).catch(e => ({ err: e.message }));
    ok(cn.n >= 10 && cn.same && cn.order && cn.starts && cn.gate && cn.noBooth, 'the cinema runs one shared schedule of films on the quarter hour, the theatre door asks for a ticket, and there is no projection booth: ' + JSON.stringify(cn)); }
  { const tx = await pg.evaluate(() => { const a = TEXT.t('core.x', 'A {b}', { b: 'C' }); TEXT.set('core.x', 'Z {b}'); const z = TEXT.t('core.x', null, { b: 'C' }); TEXT.set('core.x', ''); return { a, z, back: TEXT.t('core.x'), loop: TEXT.list().some(t => t.id === 'loop.track'), n: TEXT.list().length }; }).catch(e => ({ err: e.message }));
    ok(tx.a === 'A C' && tx.z === 'Z C' && tx.back === 'A {b}' && tx.loop, 'TEXT: the game\'s words with a {part}, the owner\'s words over them, back again; the Loop\'s signs registered ' + JSON.stringify(tx)); }
  { const r = await pg.evaluate(() => { const o = { was: PASSPORT.hand }; PASSPORT.open(); o.shown = document.querySelector('#passportw').textContent.includes('HAND'); PASSPORT.setHand('L'); o.hand = PASSPORT.hand; o.wield = WIELD.hand; o.saved = localStorage.getItem('market-save').includes('"hand":"L"'); PASSPORT.setHand('R'); o.back = PASSPORT.hand; PASSPORT.close(); return o; });
    ok(r.shown && r.was === 'R' && r.hand === 'L' && r.wield === 'L' && r.saved && r.back === 'R', 'the passport shows your hand and keeps it with what you own: ' + JSON.stringify(r)); }
  { const g = await pg.evaluate(async () => { const fr = n => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); f(); });
      const groups = () => BATCH.queues.reduce((s, q) => s + q.groups.length, 0), tex = () => BATCH.queues.reduce((s, q) => s + q.groups.reduce((t, G) => t + G.ms.reduce((u, me) => u + ['map', 'emissiveMap'].reduce((v, k) => v + (me.material[k] && me.material[k].image ? me.material[k].image.width * me.material[k].image.height * 4 : 0), 0), 0), 0), 0);
      const o = { g0: groups(), mb0: +(tex() / 1e6).toFixed(1), kept: BATCH.kept() }; const a0 = BATCH.away; BATCH.away = () => true; await fr(4); o.g1 = groups(); o.mb1 = tex(); BATCH.away = a0; await fr(6); o.g2 = groups(); return o; });
    ok(g.g0 > 0 && g.kept && g.g1 === 0 && g.mb1 === 0 && g.g2 > 0, 'the painted ground and walls are only kept near you, all dropped while you are in a room off the map, painted again near you on the way out: ' + JSON.stringify(g)); }
  { const m = await pg.evaluate(async () => { const ST = window.STORE; if (!ST || !ST.inside) return { none: true }; await ST.ensure(); const R = ST.inside.museum; if (!R) return { noMuseum: true };
      const o = { before: !!R.done }; await ST.enter('museum', true); o.built = !!R.done && !!R.P && R.P.objs.length > 0; await ST.exit('museum'); await new Promise(r => setTimeout(r, 2500)); o.dropped = !R.done && !R.P; await ST.enter('museum', true); o.again = !!R.done && !!R.P; await ST.exit('museum'); return o; });
    ok(m.before === false && m.built && m.dropped && m.again, 'the museum\'s inside is built only when you go in and dropped when you leave (built again next time): ' + JSON.stringify(m)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all core checks passed');
  process.exit(fails.length ? 1 : 0);
})();
