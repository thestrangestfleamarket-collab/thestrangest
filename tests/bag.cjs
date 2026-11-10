// THE BAG CHECK: node tests/bag.cjs dist/market.html. The bag is INVENTORY > BAG in the menu (owner, 10 Nov 2026), a list of your things with their pictures: I opens it there and shuts it, every item has a picture, rows drag into your own order, a thing dropped lies at your feet as a loose thing and comes back by a double click, a picture dragged with the pointer moves about the mouth, onto the quick bar fills a slot, out onto the world drops it; worn and held things stay in the bag, tagged; the ground is saved and comes back after a reload.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bag::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 820 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?hour=12&at=32,25';
  const start = async fresh => { await pg.goto(url + (fresh ? '&fresh=1' : ''), { waitUntil: 'commit' }); await pg.waitForFunction(() => window.__started, null, { timeout: 300000 }); await pg.waitForTimeout(500); };
  const at = async sel => { const r = await pg.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; }, sel); if (!r || !r.w) throw new Error('not on screen: ' + sel + ' ' + await pg.evaluate(() => JSON.stringify({ open: !document.getElementById('bagp').hidden, rows: [...document.querySelectorAll('#bagp .bgr')].map(r => r.dataset.id) }))); return r; };
  const answer = async n => { await pg.waitForTimeout(150); await pg.evaluate(n => { const A = document.getElementById('bagask'); if (A.hidden) return; const i = A.querySelector('[type=number]'); i.value = n; i.dispatchEvent(new Event('input')); A.querySelector('.ak-go').click(); }, n); await pg.waitForTimeout(150); };
  const dragTo = async (sel, x, y) => { const a = await at(sel); await pg.mouse.move(a.x, a.y); await pg.mouse.down(); for (let i = 1; i <= 8; i++) await pg.mouse.move(a.x + (x - a.x) * i / 8, a.y + (y - a.y) * i / 8); await pg.mouse.up(); await pg.waitForTimeout(250); };
  await start(true);
  await pg.keyboard.press('i'); await pg.waitForFunction(() => BAG.inMenu() && document.querySelectorAll('#bagp .bgr').length > 1, null, { timeout: 120000 }).catch(() => {});
  await pg.waitForFunction(() => FORAGE.ids().every(id => /^data:image\/png/.test(BAG.icon(id))), null, { timeout: 240000 }).catch(() => {});   // the pictures are painted a few a frame
  const r1 = await pg.evaluate(() => { const P = document.getElementById('bagp'), K = document.getElementById('packp'), ids = FORAGE.ids(), kinds = new Set(ids.map(id => BAG.kind(id))); let bad = 0; for (const id of ids) if (!/^data:image\/png/.test(BAG.icon(id))) bad++;
    return { open: !P.hidden, menu: !!P.closest('#dbag') && JSON.stringify(__UI.menuNow()) === '["pack","bag"]', pack: !!K && !K.hidden && !!K.closest('#menu'), rows: P.querySelectorAll('.bgr').length, pics: [...P.querySelectorAll('.bgr img')].every(i => /^data:image/.test(i.src)), plain: !P.querySelector('.bgsw,.bgsort,.bgview'), h: P.querySelector('.bgm').offsetHeight, grip: !!P.querySelector('.bggrip'), n: ids.length, bad, kinds: kinds.size, mortar: BAG.kind('mortar'), gem: BAG.kind('ruby'), mush: BAG.kind('m_morel'), potion: BAG.kind('p_heal') }; });
  ok(r1.open && r1.menu && !r1.pack && r1.rows >= 2 && r1.pics && r1.plain && r1.h > 200 && !r1.grip, 'I opens the bag in the menu, INVENTORY > BAG, listing the starter kit, each row with its picture; no switches, no corner grip ' + JSON.stringify(r1));
  ok(r1.bad === 0 && r1.kinds >= 15 && r1.mortar === 'mortar' && r1.gem === 'gem' && r1.mush === 'mush' && r1.potion === 'potion', 'every one of ' + r1.n + ' items has a picture, by its family (' + r1.kinds + ' kinds)');

  const r2 = await pg.evaluate(() => { const b0 = INV.items.bottle; BAG.drop('bottle', 1); const D = BAGDBG(), g = D.ground[0] || {};
    const saved = JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]'); return { b0, b1: INV.items.bottle, th: D.loose.includes('A LOOSE EMPTY BOTTLE'), d: g.d, saved: saved.length, lv: g.lv, sprite: g.drawn, pick: g.pick && g.thing }; });
  ok(r2.b1 === r2.b0 - 1 && r2.th && r2.d > .3 && r2.d < 1.2 && r2.sprite && r2.pick && r2.saved === 1 && r2.lv, 'DROP puts a bottle at your feet: one fewer in the bag, a loose thing you walk to and pick up, saved ' + JSON.stringify(r2));
  const r3 = await pg.evaluate(() => { BAG.ground[0].th.act(); return { b: INV.items.bottle, left: BAG.ground.length, gone: !BAGDBG().loose.includes('A LOOSE EMPTY BOTTLE'), saved: JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]').length }; });
  ok(r3.b === r2.b0 && r3.left === 0 && r3.gone && r3.saved === 0, 'using the loose bottle picks it up again ' + JSON.stringify(r3));

  const r4 = await pg.evaluate(() => { FORAGE.give('goggles', 1); FORAGE.give('armor', 1); FORAGE.give('net', 1); BAG.wear('goggles', 'eyes'); BAG.wear('armor', 'head'); BAG.wear('net', 'hand'); BAG.select('goggles'); const P = document.getElementById('bagp');
    return { eyes: EQUIP.by.eyes, head: EQUIP.by.head, hand: WIELD.on, tag: (P.querySelector('.bgr[data-id="goggles"] u') || {}).textContent, net: (P.querySelector('.bgr[data-id="net"] u') || {}).textContent, off: !P.querySelector('.bgf button') && !P.querySelector('.bge,#heye') }; });
  ok(r4.eyes === 'goggles' && !r4.head && r4.hand === 'net' && r4.tag === 'WORN' && r4.net === 'HELD' && r4.off, 'goggles worn, the net held, armour refused on the head; worn and held things stay in the bag, tagged; no buttons under the bag, no eye ' + JSON.stringify(r4));
  const r5 = await pg.evaluate(() => { BAG.off('eyes'); BAG.off('hand'); const P = document.getElementById('bagp'); return { eyes: EQUIP.by.eyes, hand: WIELD.on, tags: P.querySelectorAll('.bgr u').length }; });
  ok(!r5.eyes && !r5.hand && r5.tags === 0, 'taking them off clears the tags ' + JSON.stringify(r5));
  const r5b = await pg.evaluate(() => { for (let k = 0; k < 2; k++) { const r = document.querySelector('#bagp .bgr[data-id="net"]'); r.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 99 })); r.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 99 })); } const h = WIELD.on; BAG.off('hand'); return h; });
  await pg.waitForTimeout(600);
  ok(r5b === 'net', 'a double click on a row holds it ' + JSON.stringify({ held: r5b }));

  // real pointer drags: a row to the end of the list, onto the quick bar, out of the bag (it drops at your feet)
  const o0 = await pg.evaluate(() => { const m = document.querySelector('#bagp .bgm').getBoundingClientRect(); return [...document.querySelectorAll('#bagp .bgr')].filter(r => r.getBoundingClientRect().bottom <= m.bottom).map(r => r.dataset.id); }), first = o0[0], tgt = o0[o0.length - 1], lastR = await at('#bagp .bgr[data-id="' + tgt + '"]');
  await dragTo('#bagp .bgr[data-id="' + first + '"]', lastR.x, lastR.y + lastR.h / 2 - 2);
  const r6 = await pg.evaluate(() => ({ rows: [...document.querySelectorAll('#bagp .bgr')].map(r => r.dataset.id), saved: JSON.parse(JSON.parse(localStorage.getItem('market-save')).bagorder || '{}').bag || [] }));
  ok(r6.rows.indexOf(first) > r6.rows.indexOf(tgt) && r6.rows[0] !== first && r6.saved.indexOf(first) === r6.rows.indexOf(first), 'dragging the first row below the last one in sight puts it past it, and that order is saved ' + JSON.stringify({ first, tgt, rows: r6.rows }));
  { const top = await pg.evaluate(() => [...document.querySelectorAll('#bagp .bgr')].map(r => r.dataset.id)[0]), a = await at('#bagp .bgr[data-id="' + top + '"]'), m = await at('#bagp .bgm');
    await pg.mouse.move(a.x, a.y); await pg.mouse.down(); for (let k = 1; k <= 8; k++) await pg.mouse.move(a.x, a.y + (m.y + m.h / 2 - 6 - a.y) * k / 8); await pg.waitForTimeout(8000);
    const sc = await pg.evaluate(() => { const g = document.querySelector('#bagp .bgm'); return { top: g.scrollTop, max: g.scrollHeight - g.clientHeight }; });
    await pg.mouse.move(a.x, m.y + m.h / 2 - 5); await pg.mouse.up(); await pg.waitForTimeout(300);
    const rows = await pg.evaluate(() => [...document.querySelectorAll('#bagp .bgr')].map(r => r.dataset.id));
    ok(sc.max > 0 && sc.top >= sc.max - 2 && rows[rows.length - 1] === top, 'held at the bottom edge the list scrolls to its end, and the row drops there last ' + JSON.stringify({ sc, top, last: rows[rows.length - 1] })); }
  const q = await at('#hqb .qs[data-i="0"]'); await dragTo('#bagp .bgr[data-id="camera"]', q.x, q.y);
  const r7 = await pg.evaluate(() => { const s = document.querySelector('#hqb .qs[data-i="0"]'); return { slot: HUD.slots[0], camera: INV.items.camera, pic: !!s.querySelector('img') && /^data:image/.test(s.querySelector('img').src), title: s.title }; });
  ok(r7.slot === 'camera' && r7.camera === 1 && r7.pic && r7.title === 'CAMERA (35 MM) ×1', 'dragging the camera onto the quick bar fills its first slot with its picture, its name and amount on hover; the mortar still in the bag ' + JSON.stringify(r7));
  await dragTo('#bagp .bgr[data-id="bottle"]', 260, 560); await answer(1);
  const r8 = await pg.evaluate(() => ({ b: INV.items.bottle, ground: BAG.ground.length, d: (BAGDBG().ground[0] || {}).d }));
  ok(r8.b === r2.b0 - 1 && r8.ground === 1 && r8.d < 1.2, 'dragging a bottle out of the bag asks how many and drops one at your feet ' + JSON.stringify(r8));
  // dragged onto another player, a thing asks them to trade with it already put in
  const pl = await pg.evaluate(() => { const D = window.__dbg, T = D.cv().TILE, c = SHARED.cam, d = new D.THREE.Vector3(); c.getWorldDirection(d); d.y = 0; d.normalize();
    const me = new D.THREE.Mesh(new D.THREE.BoxGeometry(1.2 * T, 2.4 * T, 1.2 * T), new D.THREE.MeshBasicMaterial()); const p = D.pos(), L = document.querySelector('#bagp .bgm').getBoundingClientRect(), cr = document.querySelector('canvas').getBoundingClientRect();   // stood to the side, off the bag's list, so a drag reaches them past it
    for (let k = 0; k <= 40; k++) { me.position.set(p[0] + d.x * 3 * T + d.z * k * .5 * T, SHARED.py + 1.2 * T, p[2] + d.z * 3 * T - d.x * k * .5 * T); me.updateMatrixWorld(); const v = me.position.clone().project(c), sx = cr.left + (v.x + 1) / 2 * cr.width; if (sx < L.left - 30 || sx > L.right + 30) break; } D.scene.add(me);
    window.__pl = { id: 'p1', name: 'BOB' }; window.__th = { player: window.__pl, name: 'BOB', obj: me, reach: 1.6, tall: 1.9, act: () => {} }; D.UI.thing(window.__th); window.__asked = null; window.__ask0 = SWAP.ask; SWAP.ask = (o, put) => { window.__asked = { who: o.name, put }; };
    const v = me.position.clone().project(c), r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; });
  await dragTo('#bagp .bgr[data-id="bottle"]', pl.x, pl.y); await answer(1);
  const r8b = await pg.evaluate(() => { const a = window.__asked; SWAP.ask = window.__ask0; __dbg.UI.things.splice(__dbg.UI.things.indexOf(window.__th), 1); window.__th.obj.removeFromParent(); return { a, b: INV.items.bottle }; });
  ok(r8b.a && r8b.a.who === 'BOB' && r8b.a.put && r8b.a.put.id === 'bottle' && r8b.a.put.n === 1 && r8b.b === r2.b0 - 1, 'a bottle dragged onto another player asks them to trade with one bottle in, and stays in the bag ' + JSON.stringify(r8b));
  ok(!(await pg.evaluate(() => __UI.menuOpen)), 'a drop that starts a trade shuts the menu so the trade shows'); await pg.evaluate(() => BAG.toggle(true)); await pg.waitForTimeout(300);
  await pg.keyboard.press('i'); await pg.waitForTimeout(300); const r9 = await pg.evaluate(() => ({ menu: __UI.menuOpen, inMenu: BAG.inMenu(), home: document.getElementById('bagp').parentNode === document.body }));
  ok(!r9.menu && !r9.inMenu && r9.home, 'I again shuts the menu and the bag ' + JSON.stringify(r9)); await pg.keyboard.press('i'); await pg.waitForTimeout(300);

  // one size: no corner to drag, no browser resize, and the list doesn't move the window
  const r11 = await pg.evaluate(() => { const P = document.getElementById('bagp'), cs = getComputedStyle(P); return { grip: !!P.querySelector('.bggrip'), resize: cs.resize, over: cs.overflow, size: BAGDBG().size }; });
  ok(!r11.grip && r11.resize === 'none' && r11.over === 'visible' && r11.size === 1, 'the bag is one size: no corner, no resize ' + JSON.stringify(r11));
  { const b = await at('#bagp .bgr[data-id="camera"]'); await pg.mouse.click(b.x, b.y); } await pg.waitForTimeout(150);
  ok(await pg.evaluate(() => BAGDBG().sel === 'camera'), 'a click on a row picks it');

  // containers: a pouch is one thing of its own, opens as a bag, holds things; dropped, it goes with them and comes back whole
  const r17 = await pg.evaluate(() => { FORAGE.give('pouch', 1); FORAGE.give('bottle', 5); FORAGE.draw(); const p = BAGDBG().inBag.find(id => id.startsWith('pouch~')); const t0 = INV.items.bottle, ok1 = BAG.move('bottle', 2, 'bag', p), self = BAG.move(p, 1, 'bag', p); BAG.open(p); const D = BAGDBG();
    return { p, ok1, self, loose: BAG.have('bottle', 'bag'), inP: BAG.have('bottle', p), total: INV.items.bottle, t0, wins: D.wins, icons: document.querySelectorAll('.bagw[data-cont] .bgr').length, name: FORAGE.name(p), cont: !!document.querySelector('#bagp .bgr.cont'), saved: Object.values(JSON.parse(localStorage.getItem('market-save'))).some(v => typeof v === 'string' && v.includes('"inside"')) }; });
  ok(r17.p && r17.ok1 && !r17.self && r17.total === r17.t0 && r17.loose === r17.t0 - 2 && r17.inP === 2 && r17.wins.includes(r17.p) && r17.icons === 1 && r17.name === 'LEATHER POUCH' && r17.cont && r17.saved, 'a pouch holds two bottles, opens as its own bag showing them, not itself; the bag shows the rest; saved ' + JSON.stringify(r17));
  const r18 = await pg.evaluate(() => { const p = BAGDBG().inBag.find(id => id.startsWith('pouch~')); const t0 = INV.items.bottle; BAG.drop(p, 1); const g = BAGDBG().ground.find(q => q.id === 'pouch'); const gone = !Object.keys(INV.items).some(id => id.startsWith('pouch~')); const t1 = INV.items.bottle;
    BAG.ground.find(q => q.id === 'pouch').th.act(); const p2 = BAGDBG().inBag.find(id => id.startsWith('pouch~')); return { g: g && g.in, gone, t0, t1, t2: INV.items.bottle, p2, inP2: p2 && BAG.have('bottle', p2), back: !BAGDBG().ground.some(q => q.id === 'pouch'), loose: BAGDBG().loose }; });
  ok(r18.g && r18.g.bottle === 2 && r18.gone && r18.t1 === r18.t0 - 2 && r18.p2 && r18.inP2 === 2 && r18.t2 === r18.t0 && r18.back, 'a dropped pouch lies there with its bottles (THINGS INSIDE) and comes back whole, a fresh pouch ' + JSON.stringify(r18));
  // how many: the picker answers a drag of a stack
  const r19 = await pg.evaluate(() => { window.__askP = BAG.ask(5, 300, 300); const A = document.getElementById('bagask'); return { shown: !A.hidden, max: A.querySelector('[type=range]').max }; });
  await pg.evaluate(() => { const A = document.getElementById('bagask'), n = A.querySelector('[type=number]'); n.value = 3; n.dispatchEvent(new Event('input')); A.querySelector('.ak-go').click(); });
  const r20 = await pg.evaluate(async () => ({ v: await window.__askP, hidden: document.getElementById('bagask').hidden }));
  ok(r19.shown && r19.max === '5' && r20.v === 3 && r20.hidden, 'HOW MANY? asks up to the stack and answers what you typed ' + JSON.stringify({ ...r19, ...r20 }));
  // the shared ground: what the section's room says lies there appears; a take is answered by the room
  const r21 = await pg.evaluate(() => { const g0 = BAGDBG().ground[0] || { x: 0, z: 0 }; const a0 = INV.items.fr_apple || 0; ONLINE.feed({ t: 'world', k: 'drop:t1', v: JSON.stringify({ id: 'fr_apple', n: 2, x: g0.x, y: 0, z: g0.z, lv: 'street', t: Date.now() }) }); const D = BAGDBG(), g = D.ground.find(q => q.key === 'drop:t1');
    BAG.pickUp(BAG.ground.find(q => q.key === 'drop:t1')); const off = BAGDBG().ground.some(q => q.key === 'drop:t1'); ONLINE.on = true; ONLINE.me = 'me'; BAG.pickUp(BAG.ground.find(q => q.key === 'drop:t1')); const taking = BAGDBG().ground.find(q => q.key === 'drop:t1').taking;
    ONLINE.feed({ t: 'took', k: 'drop:t1', v: JSON.stringify({ id: 'fr_apple', n: 2 }) }); const a1 = INV.items.fr_apple || 0; ONLINE.feed({ t: 'world', k: 'drop:t2', v: JSON.stringify({ id: 'quartz', n: 1, x: g0.x, y: 0, z: g0.z, lv: 'street', t: Date.now() }) }); const two = BAGDBG().ground.some(q => q.key === 'drop:t2'); ONLINE.feed({ t: 'world', k: 'drop:t2', v: '' }); const gone2 = !BAGDBG().ground.some(q => q.key === 'drop:t2'); ONLINE.on = false; ONLINE.me = '';
    return { placed: !!g && g.n === 2, loose: D.loose.includes('A LOOSE APPLE ×2'), off, taking, a0, a1, gone: !BAGDBG().ground.some(q => q.key === 'drop:t1'), two, gone2 }; });
  ok(r21.placed && r21.loose && r21.off && r21.taking && r21.a1 === r21.a0 + 2 && r21.gone && r21.two && r21.gone2, 'a drop the room tells of lies there for you; offline you cannot take it; online a take waits for the room and its answer gives you the thing; a drop the room clears goes ' + JSON.stringify(r21));

  await start(false);   // the same browser, its save kept
  await pg.waitForFunction(() => BAG.ground.length > 0, null, { timeout: 20000 }).catch(() => {});
  const r10 = await pg.evaluate(() => ({ ground: BAG.ground.map(g => g.id), thing: BAGDBG().loose.includes('A LOOSE EMPTY BOTTLE') }));
  ok(r10.ground.length === 1 && r10.ground.every(id => id === 'bottle') && r10.thing, 'after a reload the bottle dropped offline still lies there ' + JSON.stringify(r10));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('bag: all ok');
})().catch(e => { console.log('bag: ' + e); process.exit(1); });
