// THE OTHER PLAYERS CHECK: node tests/online.cjs dist/market.html. Feeds ONLINE what the block's server would send (no network): two players appear near you with name tags, walk, talk, the list counts them, one leaves.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=online::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    await pg.evaluate(() => { const P = __dbg.you(); const a = (dx, dz) => [P.x + dx, P.z + dz, SHARED.py, 0, SHARED.LVL, ''];
      ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: a(1.5, 0) }, { id: 'b', name: 'MILO', look: 'w11', at: a(-1.5, .5) }] });
      ONLINE.feed({ t: 'say', id: 'a', name: 'ROSA', text: 'hello block' }); });
    await pg.waitForTimeout(1500);
    const r1 = await pg.evaluate(() => { const L = [...ONLINE.others.values()];
      return { n: L.length, figs: L.filter(o => o.fig && o.fig.g.visible).length, tags: L.filter(o => o.tag && o.tag.visible).length, robe: !!(ONLINE.others.get('b').fig && ONLINE.others.get('b').key === 'w11'),
        who: (document.querySelector('#onlwho') || {}).textContent, log: (document.querySelector('#onllog') || {}).textContent, say: ONLINE.others.get('a').tagS, at: ONLINE.at(ONLINE.others.get('a'), performance.now()).every(Number.isFinite) }; });
    ok(r1.n === 2 && r1.figs === 2 && r1.tags === 2, 'two players near you are drawn with name tags (' + JSON.stringify(r1) + ')');
    ok(r1.robe, 'a player in the bathrobe and barefoot gets that look');
    ok(/ONLINE 3/.test(r1.who || ''), 'the list counts you and the two others (' + r1.who + ')');
    ok(/ROSA/.test(r1.log || '') && /hello block/.test(r1.log || '') && /hello block/.test(r1.say || ''), 'what ROSA said is in the chat and over her head');
    ok(r1.at, 'ONLINE.at gives the ragdoll a place to be carried to');
    const x0 = await pg.evaluate(() => ONLINE.others.get('a').fig.g.position.x);
    await pg.evaluate(() => new Promise(res => { const P = __dbg.you(); let i = 0; const t = setInterval(() => { i++; ONLINE.feed({ t: 'mv', id: 'a', at: [P.x + 1.5 + i * .3, P.z, SHARED.py, Math.PI / 2, SHARED.LVL, ''] }); if (i === 6) { clearInterval(t); res(); } }, 160); }));
    await pg.waitForTimeout(1500);
    const r2 = await pg.evaluate(() => { const o = ONLINE.others.get('a'); return { x: o.fig.g.position.x, walk: o.S.target }; });
    ok(r2.x > x0 + 1.5, 'ROSA walks where the server sends her (' + x0.toFixed(2) + ' -> ' + r2.x.toFixed(2) + ')');
    await pg.evaluate(() => ONLINE.feed({ t: 'tell', from: 'THE MARKET', text: 'the bodega closes early tonight' }));
    await pg.waitForTimeout(500);
    const r4 = await pg.evaluate(() => { const b = document.getElementById('onltell'); return { shown: !!b && !b.hidden && /bodega closes early/.test(b.textContent), log: /THE MARKET/.test(document.querySelector('#onllog').textContent) }; });
    ok(r4.shown && r4.log, 'a message from the owner shows over the game and in the chat');
    const rMe = await pg.evaluate(() => { const P = __dbg.you(), n = ONLINE.others.size; ONLINE.feed({ t: 'in', p: { id: 'me', name: 'TENANT', look: 'w00', at: [P.x, P.z, SHARED.py, 0, SHARED.LVL, ''] } }); ONLINE.feed({ t: 'mv', id: 'me', at: [P.x, P.z, SHARED.py, 0, SHARED.LVL, ''] }); return { n, after: ONLINE.others.size, me: ONLINE.others.has('me') }; });
    ok(rMe.after === rMe.n && !rMe.me, 'your own moves from another tab never draw a body of yours where you stand: ' + JSON.stringify(rMe));
    await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'mv', id: 'b', at: [P.x, P.z, SHARED.py, 0, SHARED.LVL === 'up' ? 'down' : 'up', ''] }); ONLINE.feed({ t: 'out', id: 'a' }); });
    await pg.waitForTimeout(800);
    const r3 = await pg.evaluate(() => ({ n: ONLINE.others.size, bShown: !!(ONLINE.others.get('b').fig && ONLINE.others.get('b').fig.g.visible), who: document.querySelector('#onlwho').textContent, err: Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)) }));
    ok(r3.n === 1 && /ONLINE 2/.test(r3.who), 'ROSA leaves: one other left (' + r3.who + ')');
    ok(!r3.bShown, 'a player on another level is not drawn');
    const r5 = await pg.evaluate(() => { document.querySelector('#onlwho').click(); return document.querySelector('#onllist').textContent; });
    ok(/on another level/.test(r5), 'the online list says where a player you cannot see is (' + r5 + ')');
    // what they wear and how they stand: a denim jacket and jeans dye their copy, shades and armour sit on it; sitting and hanging reach their pose
    await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'in', p: { id: 'c', name: 'JUNE', look: 'w00..M00.jacket_denim~jeans~~shades~', at: [P.x + 1.2, P.z, SHARED.py, 0, SHARED.LVL, ''] } }); ONLINE.feed({ t: 'in', p: { id: 'd', name: 'OTTO', look: 'w00..M00.armor~~~~', at: [P.x - 1.2, P.z, SHARED.py, 0, SHARED.LVL, ''] } }); });
    await pg.waitForTimeout(2500);
    await pg.evaluate(() => { ONLINE.feed({ t: 'ps', id: 'c', s: { sit: { z: -8 } } }); ONLINE.feed({ t: 'ps', id: 'd', s: { hang: { z: 4, t: 3 } } }); });
    await pg.waitForTimeout(1500);
    const r6 = await pg.evaluate(() => { const c = ONLINE.others.get('c'), d = ONLINE.others.get('d'), W = q => q && q.fig && q.fig.wornH || {}; const mats = typeof RIG !== 'undefined' ? RIG.MATS : [];
      return { dyed: mats.some(m => /^dye#2a4a7a$/i.test(m)) && mats.some(m => /^dye#34507e$/i.test(m)), shades: !!(W(c).sh && W(c).sh.visible), armour: !!(W(d).worn && W(d).worn.root.visible && W(d).worn.armour.visible), sit: !!(c && c.S.sit), hang: !!(d && d.S.hang), mine: (() => { FORAGE.give('jeans', 1); EQUIP.wear('jeans'); return EQUIP.code(); })() }; });
    ok(r6.dyed && r6.shades && r6.armour, 'a player\'s worn clothes and gear show on their copy (dyed jacket and jeans, shades, armour): ' + JSON.stringify(r6));
    ok(r6.sit && r6.hang && /^~jeans~/.test(r6.mine), 'their sitting and hanging reach their pose, and what you wear goes in your look: ' + JSON.stringify(r6));
    ok(!r3.err.length, 'no SYS errors (' + r3.err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all online checks passed');
  process.exit(fails.length ? 1 : 0);
})();
