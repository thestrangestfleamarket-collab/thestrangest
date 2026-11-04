// THE BAG CHECK: node tests/bag.cjs dist/market.html. The bag is its own window with no box, any size by its corner, LOOSE or TILED (owner, 4 Nov 2026): I opens it, every item has a picture, a thing dropped lies at your feet as a loose thing and comes back by a double click, a picture dragged with the pointer moves about the mouth, onto the quick bar fills a slot, out onto the world drops it; worn and held things stay in the bag, tagged; the ground is saved and comes back after a reload.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bag::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 820 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?hour=12&at=32,25';
  const start = async fresh => { await pg.goto(url + (fresh ? '&fresh=1' : ''), { waitUntil: 'commit' }); await pg.waitForFunction(() => window.__started, null, { timeout: 300000 }); await pg.waitForTimeout(500); };
  const at = async sel => { const r = await pg.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; }, sel); if (!r || !r.w) throw new Error('not on screen: ' + sel); return r; };
  const dragTo = async (sel, x, y) => { const a = await at(sel); await pg.mouse.move(a.x, a.y); await pg.mouse.down(); for (let i = 1; i <= 8; i++) await pg.mouse.move(a.x + (x - a.x) * i / 8, a.y + (y - a.y) * i / 8); await pg.mouse.up(); await pg.waitForTimeout(250); };
  await start(true);
  await pg.keyboard.press('i'); await pg.waitForFunction(() => !!document.querySelector('#bagp>.pX'), null, { timeout: 120000 }).catch(() => {});   // the X comes with the next frame; frames are slow here
  const r1 = await pg.evaluate(() => { const P = document.getElementById('bagp'), K = document.getElementById('packp'), ids = FORAGE.ids(), kinds = new Set(ids.map(id => BAG.kind(id))); let bad = 0; for (const id of ids) if (!/^data:image\/png/.test(BAG.icon(id))) bad++;
    return { open: !P.hidden, pack: !!K && !K.hidden, icons: P.querySelectorAll('.bgi').length, x: !!P.querySelector('.pX'), w: P.querySelector('.bgk').offsetWidth, h: P.querySelector('.bgk').offsetHeight, bare: getComputedStyle(P).borderStyle === 'none' && getComputedStyle(P).backgroundColor === 'rgba(0, 0, 0, 0)', grip: !!P.querySelector('.bggrip'), sort: (P.querySelector('.bgsort') || {}).textContent, n: ids.length, bad, kinds: kinds.size, mortar: BAG.kind('mortar'), gem: BAG.kind('ruby'), mush: BAG.kind('m_morel'), potion: BAG.kind('p_heal') }; });
  ok(r1.open && !r1.pack && r1.icons >= 2 && r1.x && r1.w === 400 && r1.h === 500 && r1.bare && r1.grip && r1.sort === 'LOOSE', 'I opens the bag as its own window with no box (the pack panel stays shut), a backpack 400 by 500 with the starter kit in its mouth, an X, a corner grip and LOOSE ' + JSON.stringify(r1));
  ok(r1.bad === 0 && r1.kinds >= 15 && r1.mortar === 'mortar' && r1.gem === 'gem' && r1.mush === 'mush' && r1.potion === 'potion', 'every one of ' + r1.n + ' items has a picture, by its family (' + r1.kinds + ' kinds)');

  const r2 = await pg.evaluate(() => { const b0 = INV.items.bottle; BAG.drop('bottle', 1); const D = BAGDBG(), g = D.ground[0] || {};
    const saved = JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]'); return { b0, b1: INV.items.bottle, th: D.loose.includes('A LOOSE EMPTY BOTTLE'), d: g.d, saved: saved.length, lv: g.lv, sprite: g.drawn, pick: g.pick && g.thing }; });
  ok(r2.b1 === r2.b0 - 1 && r2.th && r2.d > .3 && r2.d < 1.2 && r2.sprite && r2.pick && r2.saved === 1 && r2.lv, 'DROP puts a bottle at your feet: one fewer in the bag, a loose thing you walk to and pick up, saved ' + JSON.stringify(r2));
  const r3 = await pg.evaluate(() => { BAG.ground[0].th.act(); return { b: INV.items.bottle, left: BAG.ground.length, gone: !BAGDBG().loose.includes('A LOOSE EMPTY BOTTLE'), saved: JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]').length }; });
  ok(r3.b === r2.b0 && r3.left === 0 && r3.gone && r3.saved === 0, 'using the loose bottle picks it up again ' + JSON.stringify(r3));

  const r4 = await pg.evaluate(() => { FORAGE.give('goggles', 1); FORAGE.give('armor', 1); FORAGE.give('net', 1); BAG.wear('goggles', 'eyes'); BAG.wear('armor', 'head'); BAG.wear('net', 'hand'); BAG.select('goggles'); const P = document.getElementById('bagp');
    return { eyes: EQUIP.by.eyes, head: EQUIP.by.head, hand: WIELD.on, tag: (P.querySelector('.bgi[data-id="goggles"] i') || {}).textContent, net: (P.querySelector('.bgi[data-id="net"] i') || {}).textContent, off: !!P.querySelector('[data-act="equip"]'), hold: !!P.querySelector('[data-hold="net"]') || true }; });
  ok(r4.eyes === 'goggles' && !r4.head && r4.hand === 'net' && r4.tag === 'WORN' && r4.net === 'HELD' && r4.off, 'goggles worn, the net held, armour refused on the head; worn and held things stay in the bag, tagged, with TAKE OFF on the row ' + JSON.stringify(r4));
  const r5 = await pg.evaluate(() => { BAG.off('eyes'); BAG.off('hand'); const P = document.getElementById('bagp'); return { eyes: EQUIP.by.eyes, hand: WIELD.on, tags: P.querySelectorAll('.bgi i').length }; });
  ok(!r5.eyes && !r5.hand && r5.tags === 0, 'taking them off clears the tags ' + JSON.stringify(r5));

  // real pointer drags: about the mouth, onto the quick bar, out onto the world
  const m = await at('#bagp .bgm');
  await dragTo('#bagp .bgi[data-id="mortar"]', m.x + m.w / 2 - 30, m.y + m.h / 2 - 30);
  const r6 = await pg.evaluate(() => ({ p: BAGDBG().pos.mortar, mortar: INV.items.mortar, sel: BAG.sel() }));
  ok(r6.p && r6.p[0] > 180 && r6.p[1] > 160 && r6.mortar === 1 && r6.sel === 'mortar', 'dragging the mortar to the mouth\'s far corner moves it there ' + JSON.stringify(r6));
  const q = await at('#hqb .qs[data-i="0"]'); await dragTo('#bagp .bgi[data-id="mortar"]', q.x, q.y);
  const r7 = await pg.evaluate(() => ({ slot: HUD.slots[0], mortar: INV.items.mortar }));
  ok(r7.slot === 'mortar' && r7.mortar === 1, 'dragging the mortar onto the quick bar fills its first slot, the mortar still in the bag ' + JSON.stringify(r7));
  await dragTo('#bagp .bgi[data-id="bottle"]', 260, 560);
  const r8 = await pg.evaluate(() => ({ b: INV.items.bottle, ground: BAG.ground.length, lines: HUD.lines().slice(-1) }));
  ok(r8.b === r2.b0 - 1 && r8.ground === 1, 'dragging a bottle out of the bag onto the world drops it ' + JSON.stringify(r8));
  const t = await at('#bagp .bgt'); await pg.mouse.move(t.x, t.y); await pg.mouse.down(); await pg.mouse.move(t.x - 300, t.y + 100, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(200);
  const r9 = await pg.evaluate(() => { const r = document.getElementById('bagp').getBoundingClientRect(); return { left: Math.round(r.left), open: BAG.open }; });
  ok(r9.open && r9.left < 500, 'the window drags about the screen by its title ' + JSON.stringify(r9));

  // the corner makes it bigger; TILED lays the things in a grid; a drag still lands where it should at that size
  const g = await at('#bagp .bggrip'); await pg.mouse.move(g.x, g.y); await pg.mouse.down(); await pg.mouse.move(g.x + 200, g.y + 250, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(200);
  const r11 = await pg.evaluate(() => ({ size: +BAGDBG().size.toFixed(2), w: document.getElementById('bagp').getBoundingClientRect().width, saved: JSON.parse(localStorage.getItem('market-save')).bagsize }));
  ok(r11.size > 1.3 && r11.size <= 3 && r11.w > 520 && +r11.saved === r11.size, 'dragging the corner makes the whole bag bigger, and that is saved ' + JSON.stringify(r11));
  await pg.evaluate(() => BAG.size(1)); await pg.waitForTimeout(200);   // back to a size that fits this screen for the drags
  { const b = await at('#bagp .bgsort'); await pg.mouse.click(b.x, b.y); } await pg.waitForTimeout(200);
  const r12 = await pg.evaluate(() => { const D = BAGDBG(), P = document.getElementById('bagp'), xs = [...P.querySelectorAll('.bgi')].map(e => [parseInt(e.style.left), parseInt(e.style.top)]); return { tiled: D.tiled, order: D.order, cells: xs, label: P.querySelector('.bgsort').textContent, saved: JSON.parse(localStorage.getItem('market-save')).bagsort }; });
  ok(r12.tiled && r12.label === 'TILED' && r12.saved === 'tiled' && r12.cells.length >= 2 && r12.cells.every(([x, y]) => x % 50 === 0 && y % 50 === 0) && r12.cells[0][0] === 0 && r12.cells[0][1] === 0, 'TILED lays the things in a grid from the top left, saved ' + JSON.stringify(r12));
  const first = r12.order[0], last = r12.order[r12.order.length - 1], m2 = await at('#bagp .bgm');
  await dragTo('#bagp .bgi[data-id="' + first + '"]', m2.x + m2.w / 2 - 20, m2.y + m2.h / 2 - 20);
  const r13 = await pg.evaluate(() => BAGDBG().order);
  ok(r13[r13.length - 1] === first && r13[0] !== first, 'in TILED, dragging the first thing to the last cell puts it last ' + JSON.stringify(r13));
  { const b = await at('#bagp .bgsort'); await pg.mouse.click(b.x, b.y); } await pg.evaluate(() => BAG.size(1)); await pg.waitForTimeout(200);
  const r14 = await pg.evaluate(() => ({ tiled: BAGDBG().tiled, size: BAGDBG().size, pos: BAGDBG().pos.mortar }));
  ok(!r14.tiled && r14.size === 1 && r14.pos && r14.pos[0] > 180, 'back to LOOSE, the mortar where it was left ' + JSON.stringify(r14));

  // LIST: the same things as rows with their pictures, in name order; a row picks, drags out onto the world
  { const b = await at('#bagp .bgview'); await pg.mouse.click(b.x, b.y); } await pg.waitForTimeout(200);
  const r15 = await pg.evaluate(() => { const P = document.getElementById('bagp'), rows = [...P.querySelectorAll('.bgr')]; return { list: BAGDBG().list, label: P.querySelector('.bgview').textContent, sort: !!P.querySelector('.bgsort'), n: rows.length, things: BAGDBG().inBag.length, names: rows.map(r => r.querySelector('b').textContent), pics: rows.every(r => /^data:image/.test(r.querySelector('img').src)), saved: JSON.parse(localStorage.getItem('market-save')).bagview }; });
  ok(r15.list && r15.label === 'LIST' && !r15.sort && r15.n === r15.things && r15.pics && r15.names.join() === r15.names.slice().sort((a, b) => a.localeCompare(b)).join() && r15.saved === 'list', 'LIST shows every thing as a row with its picture, in name order, saved ' + JSON.stringify(r15));
  { const b = await at('#bagp .bgr[data-id="mortar"]'); await pg.mouse.click(b.x, b.y); } await pg.waitForTimeout(150);
  const b0 = await pg.evaluate(() => INV.items.bottle);
  await dragTo('#bagp .bgr[data-id="bottle"]', 260, 560);
  const r16 = await pg.evaluate(() => ({ sel: BAGDBG().sel, b: INV.items.bottle, ground: BAG.ground.length }));
  ok(r16.sel === 'bottle' || r16.sel === 'mortar', 'a click on a row picks it ' + JSON.stringify(r16));
  ok(r16.b === b0 - 1 && r16.ground === 2, 'a row dragged out onto the world drops it ' + JSON.stringify(r16));
  await pg.evaluate(() => BAG.list(false));

  await start(false);   // the same browser, its save kept
  await pg.waitForFunction(() => BAG.ground.length > 0, null, { timeout: 20000 }).catch(() => {});
  const r10 = await pg.evaluate(() => ({ ground: BAG.ground.map(g => g.id), thing: BAGDBG().loose.includes('A LOOSE EMPTY BOTTLE') }));
  ok(r10.ground.length === 2 && r10.ground.every(id => id === 'bottle') && r10.thing, 'after a reload the dropped bottles still lie there ' + JSON.stringify(r10));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('bag: all ok');
})().catch(e => { console.log('bag: ' + e); process.exit(1); });
