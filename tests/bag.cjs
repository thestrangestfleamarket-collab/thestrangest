// THE BAG CHECK: node tests/bag.cjs dist/market.html. THE PACK as a bag (owner, 4 Nov 2026, his pick C): every item has a picture; a thing dropped lies at your feet as a loose thing and comes back by a double click; a picture dragged onto the world drops it, onto the quick bar fills a slot; gear put on the doll is worn (EQUIP) or held (WIELD) and leaves the mouth; the ground is saved and comes back after a reload.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bag::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 820 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?hour=12&at=32,25';
  const start = async fresh => { await pg.goto(url + (fresh ? '&fresh=1' : ''), { waitUntil: 'commit' }); await pg.waitForFunction(() => window.__started, null, { timeout: 300000 }); await pg.waitForTimeout(500); };
  await start(true);
  await pg.keyboard.press('i'); await pg.waitForTimeout(400);
  const r1 = await pg.evaluate(() => { const P = document.getElementById('packp'), ids = FORAGE.ids(), kinds = new Set(ids.map(id => BAG.kind(id))); let bad = 0; for (const id of ids) if (!/^data:image\/png/.test(BAG.icon(id))) bad++;
    return { open: !P.hidden, icons: P.querySelectorAll('.bgi').length, doll: P.querySelectorAll('.bgs').length, n: ids.length, bad, kinds: kinds.size, mortar: BAG.kind('mortar'), gem: BAG.kind('ruby'), mush: BAG.kind('m_morel'), potion: BAG.kind('p_heal'), width: P.offsetWidth }; });
  ok(r1.open && r1.icons >= 2 && r1.doll === 6 && r1.width > 500, 'I opens the bag: the starter kit lies in its mouth, the doll\'s six slots beside it ' + JSON.stringify(r1));
  ok(r1.bad === 0 && r1.kinds >= 15 && r1.mortar === 'mortar' && r1.gem === 'gem' && r1.mush === 'mush' && r1.potion === 'potion', 'every one of ' + r1.n + ' items has a picture, by its family (' + r1.kinds + ' kinds)');

  const r2 = await pg.evaluate(() => { const b0 = INV.items.bottle; BAG.drop('bottle', 1); const D = BAGDBG(), g = D.ground[0] || {};
    const saved = JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]'); return { b0, b1: INV.items.bottle, th: D.loose.includes('A LOOSE EMPTY BOTTLE'), d: g.d, saved: saved.length, lv: g.lv, sprite: g.drawn, pick: g.pick && g.thing }; });
  ok(r2.b1 === r2.b0 - 1 && r2.th && r2.d > .3 && r2.d < 1.2 && r2.sprite && r2.pick && r2.saved === 1 && r2.lv, 'DROP puts a bottle at your feet: one fewer in the bag, a loose thing you walk to and pick up, saved ' + JSON.stringify(r2));
  const r3 = await pg.evaluate(() => { BAG.ground[0].th.act(); return { b: INV.items.bottle, left: BAG.ground.length, gone: !BAGDBG().loose.includes('A LOOSE EMPTY BOTTLE'), saved: JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]').length }; });
  ok(r3.b === r2.b0 && r3.left === 0 && r3.gone && r3.saved === 0, 'using the loose bottle picks it up again ' + JSON.stringify(r3));

  const r4 = await pg.evaluate(() => { FORAGE.give('goggles', 1); FORAGE.give('armor', 1); FORAGE.give('net', 1); BAG.wear('goggles', 'eyes'); BAG.wear('armor', 'head'); BAG.wear('net', 'hand'); FORAGE.draw(); const P = document.getElementById('packp');
    return { eyes: EQUIP.by.eyes, head: EQUIP.by.head, body: EQUIP.by.body, hand: WIELD.on, eyeSlot: !!P.querySelector('.bgs[data-slot="eyes"] img'), handSlot: !!P.querySelector('.bgs[data-slot="hand"] img'), inMouth: !!P.querySelector('.bgi[data-id="goggles"]'), armourInMouth: !!P.querySelector('.bgi[data-id="armor"]') }; });
  ok(r4.eyes === 'goggles' && !r4.head && !r4.body && r4.hand === 'net' && r4.eyeSlot && r4.handSlot && !r4.inMouth && r4.armourInMouth, 'the doll: goggles worn on the eyes, the net held, armour refused on the head; worn things leave the mouth ' + JSON.stringify(r4));
  const r5 = await pg.evaluate(() => { BAG.off('eyes'); BAG.off('hand'); const P = document.getElementById('packp'); return { eyes: EQUIP.by.eyes, hand: WIELD.on, back: !!P.querySelector('.bgi[data-id="goggles"]') }; });
  ok(!r5.eyes && !r5.hand && r5.back, 'a click on a full slot takes it off, back into the bag ' + JSON.stringify(r5));

  // drags (the drag events with their DataTransfer, as the browser sends them): a picture onto the world drops it, onto the quick bar fills a slot, about the mouth moves it
  const drag = (from, to, x, y) => pg.evaluate(([from, to, x, y]) => { const a = document.querySelector(from), b = document.querySelector(to), dt = new DataTransfer(), r = a.getBoundingClientRect(), q = b.getBoundingClientRect(), cx = q.left + x, cy = q.top + y;
    const ev = (t, el, X, Y) => el.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: X, clientY: Y })); ev('dragstart', a, r.left + 10, r.top + 10); ev('dragover', b, cx, cy); ev('drop', b, cx, cy); ev('dragend', a, cx, cy); }, [from, to, x, y]);
  await drag('#packp .bgi[data-id="bottle"]', '#stage canvas', 300, 650); await pg.waitForTimeout(300);
  const r6 = await pg.evaluate(() => ({ b: INV.items.bottle, ground: BAG.ground.length, lines: HUD.lines().slice(-2) }));
  ok(r6.b === r2.b0 - 1 && r6.ground === 1, 'dragging a bottle out of the bag onto the world drops it ' + JSON.stringify(r6));
  await drag('#packp .bgi[data-id="mortar"]', '#hqb .qs[data-i="0"]', 20, 20); await pg.waitForTimeout(200);
  const r7 = await pg.evaluate(() => ({ slot: HUD.slots[0], mortar: INV.items.mortar }));
  ok(r7.slot === 'mortar' && r7.mortar === 1, 'dragging the mortar onto the quick bar fills its first slot, the mortar still in the bag ' + JSON.stringify(r7));
  await drag('#packp .bgi[data-id="mortar"]', '#packp .bgm', 200, 140); await pg.waitForTimeout(200);
  const r8 = await pg.evaluate(() => { const p = BAGDBG().pos.mortar; return { p, mortar: INV.items.mortar }; });
  ok(r8.p && r8.p[0] > 120 && r8.p[1] > 60 && r8.mortar === 1, 'dragging a thing about the mouth moves it there ' + JSON.stringify(r8));

  await start(false);   // the same browser, its save kept
  await pg.waitForFunction(() => BAG.ground.length > 0, null, { timeout: 20000 }).catch(() => {});   // the ground comes back on the first frame of play
  const r9 = await pg.evaluate(() => ({ ground: BAG.ground.map(g => g.id), thing: BAGDBG().loose.includes('A LOOSE EMPTY BOTTLE') }));
  ok(r9.ground.length === 1 && r9.ground[0] === 'bottle' && r9.thing, 'after a reload the dropped bottle still lies there ' + JSON.stringify(r9));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('bag: all ok');
})().catch(e => { console.log('bag: ' + e); process.exit(1); });
