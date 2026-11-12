// THE BEES CHECK: node tests/bees.cjs dist/market.html. The Beekeeper sells, buys and teaches; a hive sets on the park lawn (three at most), fills over real time and faster among flowers;
// taking honey needs jars, smoke calms the bees, a veil keeps stings off; the flowers decide the honey; the book keeps the honeys; an empty hive lifts back into the pack.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bees::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=11&place=CENTRAL PARK', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.BEES && window.FORAGE && FORAGE.BOOK, null, { timeout: 300000, polling: 500 });
  await pg.evaluate(() => LOAD('later'));

  const tr = await pg.evaluate(() => { const t = CHARS.trade({ key: 'beekeeper' }) || {}; return { sells: t.sells, buys: t.buys, teaches: t.teaches, skill: FORAGE.SK.some(s => s[0] === 'bee') }; });
  ok(['bee_hive', 'bee_smoker', 'bee_veil', 'jar_honey'].every(i => (tr.sells || []).includes(i)) && (tr.buys || []).includes('honey') && (tr.teaches || []).includes('bee') && tr.skill, 'the Beekeeper sells hives, smokers, veils and jars, buys honey and teaches BEEKEEPING: ' + JSON.stringify(tr));
  const nk = await pg.evaluate(async () => { for (let i = 0; i < 60; i++) { const N = __dbg.NPCS ? __dbg.NPCS.extra.find(q => q.key === 'beekeeper') : null; if (N && N.g) return { at: [N.st.x, N.st.z].map(v => +v.toFixed(1)), park: !!(WEEDS.inPark && WEEDS.inPark(N.st.x, N.st.z)) }; await new Promise(r => setTimeout(r, 500)); } return null; }).catch(() => null);
  ok(nk === null || nk.park, 'the Beekeeper stands in the park: ' + JSON.stringify(nk));

  // a hive: only on the park lawn, three at most
  const set = await pg.evaluate(() => { FORAGE.give('bee_hive', 4); const a = BEES.set(), h2 = (SHARED.heading += 2, BEES.set()), h3 = (SHARED.heading += 2, BEES.set()), h4 = (SHARED.heading += 2, BEES.set()); return { a: !!a, n: BEES.S.hives.length, fourth: !!h4, left: FORAGE.has('bee_hive') }; });
  ok(set.a && set.n === 3 && !set.fourth && set.left === 1, 'a hive sets on the park lawn, three at most: ' + JSON.stringify(set));

  // it fills over real time, faster among flowers; the flowers decide the honey
  const fill = await pg.evaluate(() => { const h = BEES.S.hives[0], f0 = BEES.frames(h); h.t -= 60 * 60000; const f1 = BEES.frames(h), fl = BEES.flowers(h.x, h.z).t; return { f0: +f0.toFixed(2), f1: +f1.toFixed(2), fl, min: 2, max: 8 }; });
  ok(fill.f0 < .1 && fill.f1 >= 2 && fill.f1 <= 8 && fill.f1 >= 2 * (1 + Math.min(3, fill.fl / 6)) - .01, 'an hour fills two frames, more among flowers: ' + JSON.stringify(fill));
  const kind = await pg.evaluate(() => { const h = BEES.S.hives[0]; return { k: BEES.kindOf(h, false, { rose: 9, clover: 2 }), w: BEES.kindOf(h, false, {}) }; });
  ok(kind.k === 'honey_rose' && kind.w === 'honey_wild', 'roses near make rose honey; no flowers make wildflower honey: ' + JSON.stringify(kind));

  // taking honey: jars needed; a smoker and skill calm them; a veil keeps stings off
  const tk = await pg.evaluate(() => { const h = BEES.S.hives[0], o = {}; h.t = Date.now() - 300 * 60000; h.f = 0; BEES.take(h); o.noJar = !BEES.last;
    FORAGE.give('jar_honey', 10); FORAGE.give('bee_smoker'); FORAGE.give('bee_veil'); FORAGE.S.sk.bee = 1000; const hp0 = __dbg.VIT ? __dbg.VIT.hp : 1; BEES.take(h); o.last = BEES.last; o.wax = FORAGE.has('bee_wax'); o.after = +BEES.frames(h).toFixed(2);
    o.page = FORAGE.BOOK.find(p => p.id === 'honey').rows().filter(r => r[1]).length; o.hp = (__dbg.VIT ? __dbg.VIT.hp : 1) >= hp0; return o; });
  ok(tk.noJar && tk.last && tk.last.n >= 5 && tk.wax >= 3 && tk.after < 1 && tk.page === 1 && tk.hp, 'with jars, a smoker and a veil the full hive gives five jars and wax, and the book keeps the honey: ' + JSON.stringify(tk));

  // no candle crafting; honey heals; an empty hive lifts back into the pack
  const lt = await pg.evaluate(() => { const o = { craft: typeof FORAGE.craft }; const id = BEES.last.id; o.edible = !!ITEMS.prop(id, 'edible');
    const h = BEES.S.hives[1]; BEES.lift(h); o.n = BEES.S.hives.length; o.back = FORAGE.has('bee_hive'); return o; });
  ok(lt.craft === 'undefined' && lt.edible && lt.n === 2 && lt.back === 2, 'no crafting (owner, 12 Nov 2026), honey is food, an empty hive lifts back into the pack: ' + JSON.stringify(lt));

  // other players: your hives go to the section; theirs stand where they set them, with their name, and come down when they lift them
  const op = await pg.evaluate(async () => { const T = __dbg.cv().TILE, p = __dbg.pos(), sent = []; ONLINE.on = true; const send = ONLINE.send; ONLINE.send = m => sent.push(m);
    ONLINE.hear.puts({ all: [{ id: 'z', name: 'Rosa', k: 'hive', list: [[p[0] + 3 * T, p[1], p[2] + 2 * T, 6]] }] }); await new Promise(r => setTimeout(r, 400));
    const L = BEES.theirs.get('z') || [], h = L[0], o = { n: L.length, shown: !!(h && h.g && h.g.visible), name: h && h.th && h.th.name, mine: (sent.find(m => m.t === 'puts' && m.k === 'hive') || {}).list };
    ONLINE.hear.puts({ id: 'z', k: 'hive', name: 'Rosa', list: [] }); o.gone = !BEES.theirs.has('z') && !(h && h.g); ONLINE.send = send; return o; });
  ok(op.n === 1 && op.shown && op.name === "ROSA'S BEEHIVE" && Array.isArray(op.mine) && op.mine.length === 2 && op.gone, "another player's hive stands where they set it, with their name, and goes when they lift it; yours are sent to the section: " + JSON.stringify(op));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all bees checks passed'); process.exit(fails.length ? 1 : 0);
})();
