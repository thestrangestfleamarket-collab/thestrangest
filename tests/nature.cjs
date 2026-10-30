// THE NATURE CHECK: node tests/nature.cjs dist/market.html. Mushrooms, butterflies and birds as whole things to do: the new mushroom kinds and when they show, the gems count, the book's pages,
// the Radish and the Nature Merchant buying and teaching, mounting, releasing and giving the museum a butterfly, the feeder, binoculars, feathers and the quill, specimens at home, and another player's tame bird.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=nature::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=11&place=CENTRAL PARK', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.FORAGE && FORAGE.BOOK && window.BIRDS, null, { timeout: 300000, polling: 500 });
  await pg.evaluate(() => LOAD('later'));

  // mushrooms: fourteen kinds; some only after rain, at dawn or by night; morels are not gems; picking a known one fills its page
  const m = await pg.evaluate(() => { const o = { kinds: Object.keys(FORAGE.MU).length, ghostDay: FORAGE.now('ghostcap'), inkDry: FORAGE.now('inkcap') }; FORAGE.wetT = performance.now() / 1e3; o.inkWet = FORAGE.now('inkcap');
    const g0 = INV.count(); FORAGE.give('m_morel', 3); o.gems = INV.count() - g0; FORAGE.take('m_morel', 3);
    FORAGE.S.sk.forage = 1000; FORAGE.S.sk.myco = 1000; FORAGE.pick({ k: 'oyster', id: 'test:1', x: 0, z: 0 }); o.got = FORAGE.has('m_oyster');
    const pgM = FORAGE.BOOK.find(p => p.id === 'mush'); o.row = pgM.rows().find(r => r[0] === 'OYSTER MUSHROOM'); return o; });
  ok(m.kinds === 14 && !m.ghostDay && !m.inkDry && m.inkWet, 'fourteen mushrooms; the ghost cap is not out by day, ink caps come up after rain: ' + JSON.stringify(m));
  ok(m.gems === 0, 'morels in the pack do not count as gems: ' + m.gems);
  ok(m.got >= 1 && m.row && m.row[1], 'a picked oyster mushroom is in the book: ' + JSON.stringify(m.row));
  const cr = await pg.evaluate(() => { FORAGE.S.sk.alchemy = 1000; for (let i = 0; i < 12 && !FORAGE.has('p_ghost'); i++) { FORAGE.give('m_ghostcap'); FORAGE.give('m_trumpet'); FORAGE.give('bottle'); FORAGE.craft('p_ghost'); } return FORAGE.has('p_ghost'); });   // a hard recipe: even a master fails some
  ok(cr === 1, 'a ghost cap and a black trumpet make a GHOST POTION');

  // the book: a page for each thing you collect
  const bk = await pg.evaluate(() => FORAGE.BOOK.map(p => p.id + ':' + p.rows().length));
  ok(['mush:14', 'bfly:32', 'birds:13', 'fish:'].every(s => bk.some(x => x.startsWith(s))), 'the book has pages for mushrooms, butterflies, birds and fish: ' + bk.join(' '));

  // the merchants: the Radish buys mushrooms and teaches; the Nature Merchant sells frames, feeders and binoculars, buys birds and teaches birding and entomology
  const sh = await pg.evaluate(() => { const T = id => CHARS.trade({ key: id }) || (window.LEVEL && LEVEL.chars && LEVEL.chars[id] && LEVEL.chars[id].trade); const r = T('radish') || {}, n = T('origamifox') || {};
    return { rb: r.buys, rt: r.teaches, ns: n.sells, nb: n.buys, nt: n.teaches, bnet: (FORAGE.SELLS.find(s => s[0] === 'bnet') || [])[1], net: (FORAGE.SELLS.find(s => s[0] === 'net') || [])[1] }; });
  ok((sh.rb || []).includes('mushrooms') && (sh.rt || []).includes('forage'), 'the Radish buys mushrooms and teaches foraging: ' + JSON.stringify([sh.rb, sh.rt]));
  ok(['frame', 'feeder', 'binoc'].every(i => (sh.ns || []).includes(i)) && (sh.nb || []).includes('birds') && ['ento', 'bird'].every(i => (sh.nt || []).includes(i)), 'the Nature Merchant sells frames, feeders and binoculars, buys birds, teaches birding and entomology: ' + JSON.stringify(sh));
  ok(sh.bnet === 12 && sh.net === 8, 'a net costs the same from every seller (butterfly $8, bird $12): ' + JSON.stringify([sh.net, sh.bnet]));

  // butterflies: mount one, give the museum its first, and only its first
  const bf = await pg.evaluate(() => { FORAGE.S.sk.ento = 1000; FORAGE.give('b_3', 2); FORAGE.give('frame', 2); FORAGE.ACT.bmount('b_3'); FORAGE.ACT.bmount('b_3'); const o = { mounted: FORAGE.has('s_3') };
    const here = STORE.here; STORE.here = id => id === 'museum'; const btn = () => FORAGE.ROWB.flatMap(f => f('s_3')).map(x => x[0]); o.before = btn(); const c0 = INV.cash; FORAGE.ACT.gift('s_3'); o.paid = INV.cash - c0; o.after = btn(); o.left = FORAGE.has('s_3');
    STORE.here = here; o.away = FORAGE.ROWB.flatMap(f => f('s_3')).map(x => x[0]); o.page = FORAGE.BOOK.find(p => p.id === 'bfly').rows()[3]; return o; });
  ok(bf.mounted === 2 && bf.before.includes('DONATE') && bf.paid > 0 && !bf.after.includes('DONATE') && bf.left === 1 && !bf.away.includes('DONATE'), 'a mounted butterfly can be given to the museum once, for pay, only inside it: ' + JSON.stringify(bf));

  // birds: feathers make a quill; a feeder hangs outdoors and comes down; binoculars reach birds far off
  const bd = await pg.evaluate(async () => { const o = {}; FORAGE.S.sk.bind = 1000; FORAGE.give('bs_kit'); FORAGE.give('bird_feather', 3); FORAGE.craft('quill_pen'); o.quill = FORAGE.has('quill_pen');
    FORAGE.give('feeder'); FORAGE.ACT.bhang('feeder'); o.hung = !!BIRDS.S.feed && !FORAGE.has('feeder'); const th = BIRDS.feeder(); o.thing = !!th; if (th) th.act(); o.down = !BIRDS.S.feed && FORAGE.has('feeder') === 1;
    const T = __dbg.cv().TILE, p = __dbg.pos(); const w = BIRDS.add(1, p[0] + 3 * T, p[1], p[2]); FORAGE.give('binoc'); for (let i = 0; i < 30 && w.th.reach < 9 * T; i++) await new Promise(r => setTimeout(r, 100)); o.reach = +(w.th.reach / T).toFixed(1); return o; });
  ok(bd.quill === 1, 'three feathers make a feather quill');
  ok(bd.hung && bd.thing && bd.down, 'a bird feeder hangs outdoors and a double click takes it down: ' + JSON.stringify(bd));
  ok(bd.reach >= 9, 'with binoculars a bird can be watched from 9 tiles: ' + bd.reach);

  // at home: a mounted butterfly for the wall, a caged bird for the floor, each yours from your pack
  const sp = await pg.evaluate(() => SPECDBG());
  ok(sp.n === 45 && sp.wall === 'wall' && sp.own[0] === 's_3' && sp.own[1] === 'bd_2' && sp.meshes.every(n => n > 1), 'mounted butterflies and caged birds are things for your apartment: ' + JSON.stringify(sp));

  // another player's tame bird rides on their shoulder
  const op = await pg.evaluate(async () => { const T = __dbg.cv().TILE, p = __dbg.pos(), at = [p[0] + 2 * T, p[2] + 1 * T, 0, 0, SHARED.LVL, '']; ONLINE.on = true;
    for (let i = 0; i < 12; i++) { ONLINE.feed(i ? { t: 'mv', id: 'z', at } : { t: 'hi', you: 'me', all: [{ id: 'z', name: 'ROSA', look: 'w00', at, x: { pet: 5 } }] }); await new Promise(r => setTimeout(r, 200)); }
    const b = BIRDS.list.find(x => x.st === 'opet'); return { bird: b ? BIRDS.K[b.k][0] : null, on: b ? +Math.hypot(b.x - ONLINE.others.get('z').fig.g.position.x, b.z - ONLINE.others.get('z').fig.g.position.z).toFixed(2) : null, mine: ONLINE.mine.pet && ONLINE.mine.pet() }; });
  ok(op.bird === 'BLUE JAY' && op.on < 1, "another player's tame blue jay rides on their shoulder: " + JSON.stringify(op));

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all nature checks passed'); process.exit(fails.length ? 1 : 0);
})();
