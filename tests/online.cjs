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
    await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'mv', id: 'b', at: [P.x, P.z, SHARED.py, 0, SHARED.LVL === 'up' ? 'down' : 'up', ''] }); ONLINE.feed({ t: 'out', id: 'a' }); });
    await pg.waitForTimeout(800);
    const r3 = await pg.evaluate(() => ({ n: ONLINE.others.size, bShown: !!(ONLINE.others.get('b').fig && ONLINE.others.get('b').fig.g.visible), who: document.querySelector('#onlwho').textContent, err: Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)) }));
    ok(r3.n === 1 && /ONLINE 2/.test(r3.who), 'ROSA leaves: one other left (' + r3.who + ')');
    ok(!r3.bShown, 'a player on another level is not drawn');
    ok(!r3.err.length, 'no SYS errors (' + r3.err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all online checks passed');
  process.exit(fails.length ? 1 : 0);
})();
