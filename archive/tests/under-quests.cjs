// THE UNDERGROUND SET PIECES CHECK: node tests/under-quests.cjs dist/market.html [shots dir]. Nothing built at the start; off the Underway the Fairy Ring (dark without a light, caps picked once a day, spores turn you), the Crystal Grotto (the extractor frees a geode, the roof falls, the gem wheel cuts it) and the Drowned Apothecary (flooded, the crowbar opens a cabinet, a scroll teaches a recipe, the glass poisons); the Knight's Tomb off the crypt (the armour wakes, beaten it gives the blade and coins); the Smugglers' Tunnel from the riverbed grate (Strength opens it) to its cache and up into the bar, and back down its trapdoor.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=under-quests::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = []; let pg = null;
  const open = async () => { if (pg) await pg.close(); pg = await b.newPage({ viewport: { width: 960, height: 600 } }); pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
    await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=112,-112', { waitUntil: 'commit' });
    let s = false; for (let i = 0; i < 60 && !s; i++) { await pg.waitForTimeout(3000); s = await pg.evaluate(() => !!window.__started).catch(() => false); } return s; };
  let st = await open();
  ok(st, 'the page starts');
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 500) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(SHOTS, n + '.png') }); } };
  const act = src => pg.evaluate(s => { const t = __dbg.UI.things.find(t => new RegExp(s).test(t.name)); if (!t) return false; t.act(); return true; }, src);
  const inC = id => wait(i => window[i] && window[i].built && SHARED.LVL === 'down' && window[i + 'DBG']().inside && !FADE.busy, 90000, id);
  const has = id => pg.evaluate(i => INV.items[i] || 0, id);
  if (st) {
   if (process.env.PART !== 'smug') {
    ok(await pg.evaluate(() => { const B = UNDERDBG().built; return !Object.values(B).some(Boolean); }), 'nothing of the five places is built at the start');
    await pg.evaluate(() => { for (const id of ['goggles', 'headlight', 'scuba']) { INV.add(id, 1); EQUIP.wear(id, true); } SYS.run('rent', 'scuba'); __dbg.UI.setView('third'); FORAGE.S.sk.myco = 1000; FORAGE.S.sk.gem = 1000; FORAGE.S.sk.alchemy = 1000; });
    await pg.evaluate(() => UNDERWAY.go(1, 'river'));
    ok(await inC('UNDERWAY'), 'in the Underway');
    const ways = await pg.evaluate(() => UNDERWAYDBG().things.filter(n => /FAIRY RING|CRYSTAL GROTTO|APOTHECARY/.test(n)));
    ok(ways.length === 3, 'three new ways off the Underway: ' + JSON.stringify(ways));
    // the Fairy Ring
    await act('FAIRY RING\\)'); ok(await inC('FAIRYRING'), 'through the glowing crack into the Fairy Ring');
    const dark = await pg.evaluate(() => { const L = EQUIP.light; EQUIP.light = false; delete FORAGE.S.fx.dark; const t = __dbg.UI.things.find(t => /FAIRY LANTERN|STARSPORE/.test(t.name)), n0 = Object.values(INV.items).reduce((a, b) => a + b, 0); t.act(); const n1 = Object.values(INV.items).reduce((a, b) => a + b, 0); EQUIP.light = L; return { sees: UNDERDBG().sees, got: n1 - n0 }; });
    ok(dark.got === 0, 'in the dark nothing can be picked: ' + JSON.stringify(dark));
    const pk = await pg.evaluate(() => { const n0 = (INV.items.fy_lantern || 0) + (INV.items.fy_starspore || 0); for (const t of __dbg.UI.things.filter(t => /FAIRY LANTERN|STARSPORE/.test(t.name))) t.act(); const n1 = (INV.items.fy_lantern || 0) + (INV.items.fy_starspore || 0); const n2 = n1; for (const t of __dbg.UI.things.filter(t => /FAIRY LANTERN|STARSPORE/.test(t.name))) t.act(); return { got: n1 - n0, again: ((INV.items.fy_lantern || 0) + (INV.items.fy_starspore || 0)) - n2 }; });
    ok(pk.got >= 1 && pk.again === 0, 'with a headlight the ring\'s caps are picked (MYCOLOGY), once a day: ' + JSON.stringify(pk));
    await act("RING'S DUST"); ok(await has('fy_dust') >= 2, 'the ring\'s dust swept up');
    await shot('fairy-ring');
    await pg.evaluate(() => { const c = UNDER.fr.clouds[0].me.position; __dbg.UI.goTo(c.x, c.z, 'down'); });
    ok(await wait(() => UNDERDBG().conf > 0, 15000), 'standing in a spore cloud turns your head');
    await act('^BACK TO THE UNDERWAY$'); ok(await inC('UNDERWAY') && await pg.evaluate(() => !FAIRYRING.built), 'back in the Underway, the Fairy Ring dropped');
    // the Crystal Grotto
    await act('CRYSTAL GROTTO\\)'); ok(await inC('GROTTO'), 'into the Crystal Grotto');
    const ex0 = await pg.evaluate(() => { delete INV.items.extractor; const t = __dbg.UI.things.find(t => t.name === 'A CRYSTAL CLUSTER'); t.act(); return INV.items.raw_geode || 0; });
    ok(ex0 === 0, 'no extractor, no geode');
    const ex1 = await pg.evaluate(() => { INV.add('extractor', 1); const t = __dbg.UI.things.find(t => t.name === 'A CRYSTAL CLUSTER'); t.act(); return INV.items.raw_geode || 0; });
    ok(ex1 >= 1, 'the sonic extractor frees a raw geode: ' + ex1);
    await wait(() => !UNDERDBG().fall, 180000);   // (this machine's frame rate runs the game slowly)
    const hp0 = await pg.evaluate(() => { __dbg.VIT.hp = 1; UNDER.collapse(); return __dbg.VIT.hp; });
    ok(await wait(() => __dbg.VIT.hp < 1, 180000), 'a rumble, then the roof comes down on you (hurt)');
    const cut = await pg.evaluate(() => { INV.add('gem_wheel', 1); const r0 = INV.items.raw_geode || 0, c0 = INV.items.cut_grotto || 0; FORAGE.ACT.ucut(); return { raw: r0 - (INV.items.raw_geode || 0), cut: (INV.items.cut_grotto || 0) - c0 }; });
    ok(cut.raw === 1 && cut.cut === 1, 'the gem wheel cuts the geode: ' + JSON.stringify(cut));
    await shot('grotto');
    await act('^BACK TO THE UNDERWAY$'); ok(await inC('UNDERWAY') && await pg.evaluate(() => !GROTTO.built), 'back in the Underway, the Grotto dropped');
    // the Drowned Apothecary
    await act('APOTHECARY\\)'); ok(await inC('APOTHECARY'), 'down the cellar hatch into the Drowned Apothecary');
    await pg.waitForTimeout(1500);
    ok(await pg.evaluate(() => !!SWIMDBG().in), 'it is flooded: you swim');
    const cab = await pg.evaluate(() => { const t = __dbg.UI.things.find(t => t.name === 'A SWOLLEN CABINET'), n0 = Object.values(INV.items).reduce((a, b) => a + b, 0); t.act(); const n1 = Object.values(INV.items).reduce((a, b) => a + b, 0);
      __dbg.UI.things.find(t => t.name === 'A RUSTED CROWBAR').act(); const bar = INV.items.crowbar || 0; t.act(); const sc = Object.keys(INV.items).filter(k => /^scroll_/.test(k)); return { locked: n1 - n0, bar, sc }; });
    ok(cab.locked === 0 && cab.bar === 1 && cab.sc.length === 1, 'locked till the crowbar; the first cabinet holds a recipe scroll: ' + JSON.stringify(cab));
    const rc = await pg.evaluate(id => { FORAGE.ACT.uscroll(id); return { learned: UNDERDBG().learn, rc: FORAGE.RC.some(r => /^px_/.test(r[0])) }; }, cab.sc[0]);
    ok(rc.learned.length === 1 && rc.rc, 'reading the scroll teaches its recipe: ' + JSON.stringify(rc));
    await pg.evaluate(() => { delete FORAGE.S.fx.poison; const p = UNDER; __dbg.UI.goTo(SHARED.BOD.XS(1516 - 2000), SHARED.BOD.ZS(-72), 'down'); });
    ok(await wait(() => { const W = __dbg.ST.water; if (W) W.y = 10; return FORAGE.S.fx.poison > 0; }, 15000), 'the broken glass on the floor poisons you');
    await shot('apothecary');
    await act('^BACK UP TO THE UNDERWAY$'); ok(await inC('UNDERWAY') && await pg.evaluate(() => !APOTHECARY.built), 'back in the Underway, the Apothecary dropped');
    await act('^UP THROUGH THE LAKE$'); ok(await wait(() => !UNDERWAY.built && SHARED.LVL === 'up' && !FADE.busy, 90000), 'up through the lake');
    // the Knight's Tomb
    await pg.evaluate(() => { __dbg.VIT.hp = 1; delete FORAGE.S.fx.poison; DUNGEON.go(1); });
    ok(await wait(() => DUNDBG().objs > 0 && SHARED.LVL === 'down' && !FADE.busy, 120000), 'in the dungeon');
    ok(await wait(() => __dbg.UI.things.some(t => /KNIGHT'S TOMB/.test(t.name)), 20000), 'a sealed door in the crypt');
    await act("KNIGHT'S TOMB\\)"); ok(await inC('TOMB'), "into the Knight's Tomb");
    await pg.evaluate(() => { const g = UNDER.knight.g.position; __dbg.UI.goTo(g.x, g.z + 3 * __dbg.cv().TILE, 'down'); });
    ok(await wait(() => UNDER.knight.st === 'fight', 15000), 'the suit of armour wakes and steps down to fight');
    await shot('tomb');
    const kn = await pg.evaluate(() => { const c0 = INV.cash; UNDER.hitKnight(99); return { st: UNDER.knight.st, blade: INV.items.sword_knight || 0, cash: INV.cash - c0 }; });
    ok(kn.st === 'down' && kn.blade === 1 && kn.cash >= 25, "beaten, it gives the knight's blade and a purse: " + JSON.stringify(kn));
    await act('^BACK UP TO THE CRYPT$'); ok(await wait(() => !TOMB.built && DUNDBG().objs > 0 && SHARED.LVL === 'down' && !FADE.busy, 120000), 'back up in the crypt, the tomb dropped');
    await pg.evaluate(() => DUNGEON.go(0)); await wait(() => SHARED.LVL === 'up' && !FADE.busy, 60000);
   }
    // the Smugglers' Tunnel (a fresh page: this machine's memory)
    ok(await open(), 'a fresh page for the tunnel');
    await pg.evaluate(() => { for (const id of ['goggles', 'headlight', 'scuba']) { INV.add(id, 1); EQUIP.wear(id, true); } SYS.run('rent', 'scuba'); __dbg.UI.setView('third'); });
    ok(await wait(() => !!UNDERDBG().grate, 60000), 'a grate on the riverbed by the wreck: ' + JSON.stringify(await pg.evaluate(() => UNDERDBG().grate)));
    await pg.evaluate(() => { const T = __dbg.cv().TILE, g = UNDERDBG().grate; STORE.goTo(g[0] * T, g[1] * T, 'up'); });
    ok(await wait(() => RIVER.swim, 120000), 'swimming over the grate');
    const sg = await pg.evaluate(() => { __dbg.VIT.sta = 1; FORAGE.buff('str', 60); __dbg.UI.things.find(t => /GRATE IN THE RIVERBED/.test(t.name)).act(); return UNDERDBG().smug; });
    ok(sg, 'Strength (an oxhorn) heaves the grate open');
    await act('GRATE IN THE RIVERBED'); ok(await inC('SMUGGLE'), "down into the Smugglers' Tunnel");
    await pg.evaluate(() => { const T = __dbg.cv().TILE; __dbg.UI.goTo(SHARED.BOD.XS(1642 - 2000), SHARED.BOD.ZS(-73), 'down'); });
    await pg.waitForTimeout(1500);
    const ca = await pg.evaluate(() => { const c0 = INV.cash; __dbg.UI.things.find(t => t.name === "THE SMUGGLERS' CACHE").act(); const c1 = INV.cash; __dbg.UI.things.find(t => t.name === "THE SMUGGLERS' CACHE").act(); return { got: c1 - c0, again: INV.cash - c1, ext: UNDERDBG().ext }; });
    ok(ca.got >= 30 && ca.again === 0 && ca.ext, 'the cache pays once a day (and an old extractor the first time): ' + JSON.stringify(ca));
    await shot('smugglers');
    await act("INTO THE BAR'S CELLAR"); ok(await wait(() => !SMUGGLE.built && ROOMS.offIn() === 'bar' && !FADE.busy, 120000), 'up the ladder into the bar, the tunnel dropped');
    ok(await wait(() => __dbg.UI.things.some(t => t.name === 'A TRAPDOOR IN THE FLOOR'), 20000), 'a trapdoor in the bar');
    await act('^A TRAPDOOR IN THE FLOOR$'); ok(await inC('SMUGGLE') && await pg.evaluate(() => !ROOMS.offIn()), 'down the trapdoor into the tunnel again');
    await act('^BACK DOWN TO THE RIVER$'); ok(await wait(() => !SMUGGLE.built && SHARED.LVL === 'up' && !FADE.busy, 90000), 'back out to the river');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
