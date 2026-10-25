// THE DESIGNER CHECK: node tests/designer.cjs dist/market.html. YOU's DESIGN YOUR WALKER opens the studio (you alone, drawn and lit); a click picks the part under it; a part's size, turn and move reshape you (its other side mirrored), undo takes it back, it's kept, and another player in your look is drawn with your shape.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=designer::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 820 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!(window.__started && window.DESIGN && window.PARK && !PARK.hold)).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(1500);
    ok(await pg.evaluate(() => DESIGN.code() === '' && !!document.getElementById('ldesign')), 'a new player has no design, and YOU has DESIGN YOUR WALKER');
    await pg.evaluate(() => { document.getElementById('looks').hidden = false; }); await pg.click('#ldesign'); await pg.waitForTimeout(2500);
    const r0 = await pg.evaluate(() => { const cv = document.querySelector('#design canvas'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let lit = 0; for (let i = 0; i < d.length; i += 4)if (d[i] + d[i + 1] + d[i + 2] > 120) lit++;
      return { open: !document.getElementById('design').hidden && DESIGN.on, lit: lit / (d.length / 4), part: DESIGN.test.pickAt(280, 420), sky: DESIGN.test.pickAt(20, 20) }; });
    ok(r0.open && r0.lit > .05, 'the studio opens and draws you, lit (' + JSON.stringify(r0) + ')');
    ok(!!r0.part && r0.sky === null, 'a click on you picks the part under it, and nothing off you');
    const r1 = await pg.evaluate(() => { const W = __dbg.W3, T = DESIGN.test, E = n => W.E[W.idx(n)];
      const s0 = (E('upperArmR') || { s: [1, 1, 1] }).s[0]; T.set({ sel: 'upperArmL', mode: 'size', mirror: true }); T.edit('s', 0, 1.5);
      const mir = E('upperArmR').s[0] / s0; T.set({ sel: 'head', mode: 'turn' }); T.edit('r', 2, 15); T.set({ mode: 'move' }); T.edit('o', 1, 1);
      const head = E('head'); return { mir, lq: !!head.lq, lo: head.lo && head.lo[1], code: DESIGN.code() }; });
    ok(Math.abs(r1.mir - 1.5) < .02, 'sizing the left upper arm sizes the right one too (mirror sides)');
    ok(r1.lq && Math.abs(r1.lo - 1) < .03, 'a turn and a move go on the part, in its own frame');
    const r2 = await pg.evaluate(async () => { const c = DESIGN.code(); await new Promise(r => setTimeout(r, 300)); return { saved: (localStorage.getItem('market-save') || '').includes(c), c }; });
    ok(r1.code && r2.saved, 'your design is kept (OWNED design: ' + r1.code + ')');
    const r3 = await pg.evaluate(() => { const T = DESIGN.test; T.undo(); const a = __dbg.W3.E[__dbg.W3.idx('head')]; T.redo(); const b = __dbg.W3.E[__dbg.W3.idx('head')]; return { undone: !(a && a.lo), redone: !!(b && b.lo) }; });
    ok(r3.undone && r3.redone, 'undo takes a change back and redo puts it again');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => { const d = document.getElementById('design'); return d.hidden && !DESIGN.on && getComputedStyle(d).display === 'none'; }), 'Escape closes the studio (and it is gone from the screen)');
    await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00.' + DESIGN.code(), at: [P.x + 1.5, P.z, SHARED.py, 0, SHARED.LVL, ''] }] }); });
    await pg.waitForFunction(() => { const o = ONLINE.others.get('a'); return !!(o && o.fig); }, { timeout: 30000 }).catch(() => {});
    const r4 = await pg.evaluate(() => { const o = ONLINE.others.get('a'), F = o && o.fig; if (!F || !F.PCS) return null; const p = F.PCS.find(q => q.n === 'upperArmL'); return { s: p && p.E && p.E.s[0], head: !!(F.PCS.find(q => q.n === 'head') || {}).E }; });
    ok(r4 && r4.s > 1.4 && r4.head, 'another player in your look is drawn with your shape (' + JSON.stringify(r4) + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all designer checks passed'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
