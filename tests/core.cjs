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
{ const S = fs.readFileSync(ROOT + '/src/001-rig.js', 'utf8'), src = S.slice(S.indexOf('const WDRAWN='), S.indexOf('\n})();') + 6);
  const R = new Function('location', 'localStorage', 'document', '__DATA__', src + '\nreturn RIG;')({ search: '' }, { getItem: () => null, setItem() {} }, { createElement: () => ({ getContext: () => ({}) }) }, p => JSON.parse(fs.readFileSync(ROOT + '/' + p, 'utf8')));
  let bad = 0; for (const hold of [1, 3, 6, 10]) { const st = R.create(); st.snap = st.smooth = true; let z = 0, t = 0;
    for (let f = 0; f < 70; f++) { st.target = f >= 30 && f < 30 + hold ? 1 : 0; const b = st.dist; R.step(st, 1 / 60); z += st.dist - b; t += 1 / 60; st.world = { x: 0, z, y: 0, hd: 0, kx: 1, ky: 1, gnd: () => 0, t };
      const J = R.pose(st).J; if (!['ankleL', 'ankleR', 'kneeL', 'kneeR'].every(n => isFinite(J[n].x + J[n].y + J[n].z))) bad++; } }
  ok(!bad, 'a one-tap step and stop keeps both legs finite (world foot lock)' + (bad ? ' (' + bad + ' bad frames)' : '')); }

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
    await pg.waitForFunction(() => window.RPGNPC && RPGNPC.list && RPGNPC.list.length >= 6, { timeout: 30000 }).catch(() => {});   // the deferred street walkers
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
      o.msaa = [SHARED.composer.readBuffer === SHARED.MSRT, SHARED.MSRT.samples];
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
      o.edges = (() => { const C = __dbg.THREE.ShaderChunk, f = C.shadowmap_pars_fragment, L = C.lights_fragment_begin; return [(f.match(/texture2DCompare\(/g) || []).length, L.includes('if ( sh > 0. )'), window.SUNDBG ? SUNDBG().patch : false]; })();
      o.shafts = window.SHAFTS ? [SHAFTS.on > 0, SHAFTS.occ === 1, SHAFTS.list[0].material.depthTest === true] : null;
      o.lawn = (() => { const lc = SHARED.BOD.g.lawnCol(3.3, 7.1), map = __dbg.MAPK.MODS.land && __dbg.MAPK.MODS.land.material.map; return { painted: !!(map && map.image && map.image.width > 0), col: Array.isArray(lc) && lc.length === 3 && lc.every(v => v >= 0 && v <= 255), top: typeof WEEDS.top === 'function' }; })();
      o.sky = [typeof SKY.sunCover === 'number' && SKY.sunCover >= 0 && SKY.sunCover <= 1, typeof SKY.cloudAt === 'function' && SKY.cloudAt(0, 1, 0, 0, .5) >= 0 && SKY.cloudAt(0, 1, 0, 0, .5) <= 1, typeof SKY.GLSL === 'string' && SKY.GLSL.includes('cloudAt')];
      o.breath = [typeof __dbg.VIT.air === 'number', typeof __dbg.VIT.breathe === 'function', (window.ITEMS && ITEMS.prop ? +ITEMS.prop('airshroom', 'breath') : 0) || 0];
      o.downs = ['dungeon', 'gemcave', 'hudson'].map(k => { const L = LEVELS.of[k]; return !!(L && L.floor === 'down' && typeof L.has === 'function' && typeof L.ground === 'function' && typeof L.bound === 'function'); });
      o.swords = (() => { const I = window.ITEMS, W = window.WIELD, F = window.FIGHT, S = window.STRIKES, V = __dbg.VIT; if (!I || !W || !F || !S) return { ok: false };
        const h0 = V.hp, took = V.hurt(.01, { x: 0, z: 0 }); V.hp = h0; return { ok: true, dmg: ['sword_wood', 'sword', 'sword_steel', 'sword_ench'].map(k => +I.prop(k, 'damage')).join(), hand: I.prop('sword_steel', 'slot') === 'hand' && I.prop('sword_steel', 'grants') === 'fight', api: 'block' in W && typeof S.landed === 'function' && typeof V.guard === 'function', took }; })();
      o.soft = !!(DN.modes.includes('soft') && DN.D0.soft && DN.D0.soft.shaft > 0 && window.SHAFTS && SHAFTS.list.length && SKY.U.uCldC && SKY.U.uCldK);
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
      o.rpg = (() => { const R = window.RPGNPC; if (!R || !Array.isArray(R.list)) return { ok: false }; const L = R.list;
        return { ok: true, n: L.length, keys: L.map(N => N.key).sort().join(','), skinned: L.every(N => N.me && N.me.isSkinnedMesh), mixer: L.every(N => !!N.mixer), street: L.every(N => N.lv === 'up'), clips: L.every(N => N.mixer && N.mixer._actions !== undefined) }; })();
      o.knight = (() => { const B = window.BODIES, K = B && B.by && B.by.knight && B.by.knight.npc; if (!K) return { ok: false }; const T = __dbg.THREE, g0 = K.g.parent, G = new T.Group();
        const street = K.on === true && K.st.home.id === 'knight' && K.name === 'THE ARMOURER', bound = SHOPDBG().bound.includes('knight');
        B.place('knight', K.st.x + 1, K.st.z + 1, 0, G); const borrowed = K.g.parent === G && K.st.home.r === 0; B.restore('knight'); const back = K.g.parent === g0 && K.on === true && K.st.home.id === 'knight' && K.st.home.r > 0 && !K.prev;
        return { ok: true, street, bound, borrowed, back }; })();
      o.charp = (() => { const U = window.__UI; if (!U || typeof U.toggleMenu !== 'function') return { ok: false };
        U.toggleMenu(); const home = document.querySelector('#dhome'), tabs = document.querySelector('#menu .tabs');
        const built = !!(home && home.querySelector('#cpav') && home.querySelector('#cpbtns button')), tabsHidden = !!(tabs && tabs.style.display === 'none'), open = U.menuOpen === true;
        const hs = home && home.querySelector('#cpslots [data-slot="head"]'), pk = home && home.querySelector('#cppick'); if (hs && !hs.classList.contains('on')) hs.click(); const pick = !!(pk && !pk.hidden && /HEAD/.test(pk.textContent));
        U.toggleMenu();
        let log = 0; if (window.CHARP && typeof CHARP.admin === 'function') { CHARP.admin(); const ap = document.querySelector('#cpadmin'); log = ap ? ap.querySelectorAll('ul li').length : 0; if (ap) ap.hidden = true; }
        return { ok: true, open, built, tabsHidden, pick, closed: U.menuOpen === false, log }; })();
      o.bodies = (() => { const B = window.BODIES; if (!B || !B.by || typeof B.set !== 'function') return { ok: false };
        const inGame = ['knight', 'man', 'woman'].every(k => B.by[k]), none = ['knight', 'man', 'woman'].every(k => !B.by[k].playable);
        const btns = [...document.querySelectorAll('[id^=lbody-]')].map(b => b.id.slice(6)), onlyWalker = btns.length === 1 && btns[0] === 'walker';
        const saved = B.pick(); B.set('knight'); const stays = B.pick() === 'walker'; B.set(saved || 'walker');
        return { ok: true, inGame, none, onlyWalker, stays, btns: btns.join(',') }; })();
      o.layers = (() => { const W = window.W3; if (!W || !W.wear) return { ok: false }; const t0 = W.trisWorn, sh = W.HIDE[W.idx('bodyTorso')];
        W.wear('shirt', false); const off = !W.HIDE[W.idx('bodyTorso')] && W.HIDE[W.idx('torso')]; W.wear('shirt', true);
        return { ok: true, hid: sh, off, back: W.trisWorn === t0, briefs: W.idx('briefs') >= 0 }; })();
      o.wsmooth = (() => { const W = window.W3; return { on: !!(W && W.weld === 'dc'), tris: (W && W.tris) || 0 }; })();
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
    ok(r.msaa[0] && r.msaa[1] > 0, 'the scene is drawn into the multisampled target, edges smooth by default (' + r.msaa + ')');
    ok(r.clamp, 'collision keeps you inside the world');
    ok(r.queues >= 2, 'the far painting queues are there (bodega ground, park wall): ' + r.queues);
    ok(r.lazy[0] >= 3 && !r.lazy[1].length, 'no inside of a building is built at the start (' + r.lazy[0] + ' insides wait; built: ' + r.lazy[1].join(',') + ')');
    ok(r.offAPI && r.off.length >= 1 && r.off.every(q => q[1] && q[2] && !q[3]), 'insides off the map: each one waits (box, spawn, way out, builder) and none is built at the start (' + r.off.map(q => q[0]).join(',') + ')');
    ok(r.offSpawn, 'every off-map inside has enterAt/boxAt and its spawn falls inside its own box (GO TO enters it, never teleports onto its footprint)');
    ok(r.doors.length >= 3 && !r.doors.includes('apt'), 'characters can go into the buildings but your apartment (' + r.doors.join(',') + ')');
    ok(r.shared >= 26, 'SHARED holds the shared state (' + r.shared + ' names)');
    ok(r.chars.fns && r.chars.levelChars && r.chars.applied, 'CHARS applies character overrides (name, stats, scale) and reads characters.json: ' + JSON.stringify(r.chars));
    ok(r.shops.ok && r.shops.noTrade, 'SHOPS is wired and a character with no shop config sells nothing: ' + JSON.stringify(r.shops));
    ok(r.lawn && r.lawn.painted && r.lawn.col && r.lawn.top, 'the lawn: the land wears its lawn texture and lawnCol gives a colour (the grass itself: tests/lawn.cjs) (' + JSON.stringify(r.lawn) + ')');
    ok(r.edges && r.edges[0] <= 16 && r.edges[1] && r.edges[2], 'cheaper shadow edges: PCF and SOFT read 4 texels (not 17/16), the point light 4 (not 9), the sun reads its near or far map and the moving map only where lit (' + JSON.stringify(r.edges) + ')');
    ok(r.shafts && r.shafts.every(Boolean), 'the sun shafts are up in the day, lit by the sun\'s shadow map so solids block them, and hidden by what stands in front (SHAFTS: ' + JSON.stringify(r.shafts) + ')');
    ok(r.sky && r.sky.every(Boolean), 'the sky knows its clouds: the sun\'s cover is a number in 0..1, the CPU cloud mirror answers in 0..1 (' + JSON.stringify(r.sky) + ')');
    ok(r.breath[0] && r.breath[1] && r.breath[2] > 0, 'breath: VIT.air + VIT.breathe exist and the AIRCAP mushroom grants air (' + r.breath.join(',') + ')');
    ok(r.downs.every(Boolean), 'every down level (dungeon, gem cave, hudson cavern) gives its own has/ground/bound through LEVELS.of (' + r.downs.join(',') + ')');
    ok(r.swords.ok && r.swords.dmg === '1,2,3,5' && r.swords.hand && r.swords.api && r.swords.took === 1, 'swords: four blades carry DAMAGE on the item model, every blow passes the guard, landed strikes feed SWORDSMANSHIP: ' + JSON.stringify(r.swords));
    ok(r.soft, 'the SOFT DAY look: a fourth look with its clouds, sun-side mist and sun shafts');
    ok(r.cinema, 'CINEMA is wired (shared screen: tick, push, admin, now; idle off the street)');
    ok(r.tenants, 'the owner\'s TENANTS tab is there and hidden (only the owner sees it)');
    ok(r.online, 'ONLINE is wired (other players: feed, at/V for the ragdoll, chat key, a SYS life entry; alone off the website)');
    ok(r.rack.ok && r.rack.pinned && r.rack.near && r.rack.free && r.rack.thing && r.rack.drawn && r.rack.rackBy, 'the bear merchant is pinned on free ground beside the nature merchant, his coat rack beside him and usable: ' + JSON.stringify(r.rack));
    ok(r.knight.ok && r.knight.street && r.knight.bound && r.knight.borrowed && r.knight.back, 'the plate knight walks the street as THE ARMOURER, is a shop, and comes back after the holodeck borrows him: ' + JSON.stringify(r.knight));
    ok(r.rpg.ok && r.rpg.n === 6 && r.rpg.keys === 'cleric,monk,ranger,rogue,warrior,wizard' && r.rpg.skinned && r.rpg.mixer && r.rpg.street, 'the six RPG townsfolk walk the street, each a rigged skinned body with its own clips: ' + JSON.stringify(r.rpg));
    ok(r.bodies.ok && r.bodies.inGame && r.bodies.none && r.bodies.onlyWalker && r.bodies.stays, 'YOU can only be the Walker: knight/man/woman stay in the game but are off the BODY row, and picking one makes you the Walker: ' + JSON.stringify(r.bodies));
    ok(r.layers.ok && r.layers.hid && r.layers.off && r.layers.back && r.layers.briefs, 'the Walker is a base body in underwear with shirt, pants, shoes and hair as layers on top: ' + JSON.stringify(r.layers));
    ok(r.wsmooth.on && r.wsmooth.tris > 20000 && r.wsmooth.tris < 60000, 'the Walker is welded by dual contouring (straight hems, no ripples) with a sane triangle count: ' + JSON.stringify(r.wsmooth));
    ok(r.equip.ok && r.equip.slots && r.equip.d0 && r.equip.guard && r.equip.float && r.equip.off, 'EQUIP wears body gear and resolves its grant (guard softens blows, float lifts), one off at a time: ' + JSON.stringify(r.equip));
    ok(r.charp.ok && r.charp.open && r.charp.built && r.charp.tabsHidden && r.charp.pick && r.charp.closed && r.charp.log >= 50, 'the character page is the menu home (ESC): avatar + buttons built, the old tabs hidden, an empty slot opens its gear list, opens and closes, and the admin menu game log is baked from HISTORY: ' + JSON.stringify(r.charp));
    const pk = await pg.evaluate(() => { const P = window.PARK, D = window.DFOG, c = window.SHARED && window.SHARED.composer; return { sign: !!(P.sign && P.sign.top > P.sign.y), fog: !!D && D.get().start === 20 && D.get().end === 60, pass: !!c && c.passes.some(q => q.uniforms && q.uniforms.tDepth), stand: !!(P.stand && P.stand.children.length) }; }).catch(e => ({ err: e.message }));
    ok(pk.sign && pk.fog && pk.pass && pk.stand, 'the park: its sign has a top for the dragon, the street stand-ins are built, the distance fog pass reads depth (20 to 60 tiles from you): ' + JSON.stringify(pk));
    const rg = await pg.evaluate(() => { const P = window.PARK, R = P.ring; if (!R) return { ring: false }; const A = R.userData.P; let out = 0;
      for (let v = 0; v < A.length; v += 3) { const [x, y] = P.at(A[v], A[v + 2]); if (x < P.x0 + 1.5 || x > P.x1 - 1.5 || y < P.y0 + 1.5 || y > P.y1 - 1.5) out++; }
      return { ring: true, n: P.ringN, still: !R.geometry.attributes.aSw, low: R.userData.items.every(o => /\.low$/.test(o.k)), out, climb: P.treeItems().length >= P.ringN }; }).catch(e => ({ err: e.message }));
    ok(rg.ring && rg.n > 40 && rg.still && rg.low && rg.out === 0 && rg.climb, "the park's edge ring is one still low bake, every crown inside the wall, its trees climbable: " + JSON.stringify(rg));
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
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all core checks passed');
  process.exit(fails.length ? 1 : 0);
})();
