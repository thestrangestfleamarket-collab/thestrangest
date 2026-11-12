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
    await pg.evaluate(() => { window.__sf = ONLINE.sayFor; ONLINE.sayFor = 600; const P = __dbg.you(); const a = (dx, dz) => [P.x + dx, P.z + dz, SHARED.py, 0, SHARED.LVL, ''];
      ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: a(1.5, 0) }, { id: 'b', name: 'MILO', look: 'w1', at: a(-1.5, .5) }] });
      window.__sayFor = ONLINE.sayFor; ONLINE.sayFor = 120;   // words stay up while a slow runner gets to read them; put back below
      ONLINE.feed({ t: 'say', id: 'a', name: 'ROSA', text: 'hello block', st: { f: 1, c: '#ff8ad8', s: 2 } }); ONLINE.said('over my head'); });
    await pg.waitForTimeout(1500);
    const r1 = await pg.evaluate(() => { const L = [...ONLINE.others.values()]; setTimeout(() => { ONLINE.sayFor = window.__sayFor; }, 0);
      return { n: L.length, figs: L.filter(o => o.fig && o.fig.g.visible).length, lv: L.every(o => o.fig && Object.keys(LEVELS.of).every(id => LEVELS.drawn(o.fig.g, id))), tags: L.filter(o => o.lab && o.lab.on && o.lab.el.textContent).length, bare: !!(ONLINE.others.get('b').fig && ONLINE.others.get('b').key === 'w1'),
        who: (document.querySelector('#onlwho') || {}).textContent, log: (document.querySelector('#onllog') || {}).textContent, say: ONLINE.others.get('a').tagS, sayRec: ONLINE.others.get('a').say, sayOld: performance.now() - ONLINE.others.get('a').sayT >= ONLINE.sayFor * 1000, at: ONLINE.at(ONLINE.others.get('a'), performance.now()).every(Number.isFinite) }; });
    ok(r1.n === 2 && r1.figs === 2 && r1.tags === 2, 'two players near you are drawn with name tags (' + JSON.stringify(r1) + ')');
    ok(r1.bare, 'a barefoot player gets that look');
    ok(r1.lv, 'other players are drawn on every level (the platform, the dungeon), not only the street');
    const r1c = await pg.evaluate(async () => { const o = ONLINE.others.get('a'), s0 = o.say; o.say = 'word '.repeat(38) + 'END'; o.sayT = performance.now(); await new Promise(r => setTimeout(r, 400)); const t = o.lab.el.textContent; o.say = s0; return /END/.test(t) && !/\u2026/.test(t); });
    ok(r1c, 'a long sentence over a head shows whole (wrapped and smaller, never cut)');
    ok(/ONLINE 3/.test(r1.who || ''), 'the list counts you and the two others (' + r1.who + ')');
    ok(/ROSA/.test(r1.log || '') && /hello block/.test(r1.log || '') && (/hello block/.test(r1.say || '') || r1.sayRec === 'hello block' && r1.sayOld), 'what ROSA said is in the chat and over her head (or was, and its seconds are up: a slow runner)');
    ok(r1.at, 'ONLINE.at gives the ragdoll a place to be carried to');
    const r1b = await pg.evaluate(() => { ONLINE.sayFor = window.__sf; return { styled: /1#ff8ad82$/.test(ONLINE.others.get('a').tagS), mine: !!(ONLINE.ME.lab && /over my head/.test(ONLINE.ME.tagS) && (ONLINE.ME.lab.on || performance.now() - ONLINE.ME.sayT >= ONLINE.sayFor * 1000)), noName: !/TENANT/.test(ONLINE.ME.tagS), you: !!document.querySelector('#looks #lsay [data-f="1"]') && document.querySelectorAll('#looks #lsay [data-c]').length === 8, stay: !!document.querySelector('#menu [data-p="chat"] #dsayfor'), sayFor: ONLINE.sayFor, logged: /over my head/.test((document.querySelector('#onllog') || {}).textContent || '') }; });
    ok(r1b.styled && r1b.mine && r1b.noName && r1b.you && r1b.stay && r1b.sayFor === 7 && r1b.logged, 'words over heads: ROSA\'s in her font, colour and size; your own over your head with no name; YOUR WORDS in the YOU window and WORDS STAY in CHAT (' + JSON.stringify(r1b) + ')');
    const x0 = await pg.evaluate(() => ONLINE.others.get('a').fig.g.position.x);
    await pg.evaluate(() => new Promise(res => { const P = __dbg.you(); let i = 0; const t = setInterval(() => { i++; ONLINE.feed({ t: 'mv', id: 'a', at: [P.x + 1.5 + i * .3, P.z, SHARED.py, Math.PI / 2, SHARED.LVL, ''] }); if (i === 6) { clearInterval(t); res(); } }, 160); }));
    await pg.waitForFunction(x0 => ONLINE.others.get('a').fig.g.position.x > x0 + 1.5, x0, { timeout: 8000, polling: 250 }).catch(() => {});   // (a slow runner draws few frames)
    const r2 = await pg.evaluate(() => { const o = ONLINE.others.get('a'); return { x: o.fig.g.position.x, walk: o.S.target }; });
    ok(r2.x > x0 + 1.5, 'ROSA walks where the server sends her (' + x0.toFixed(2) + ' -> ' + r2.x.toFixed(2) + ')');
    const w = await pg.evaluate(() => { const sent = []; const s0 = ONLINE.send; ONLINE.send = m => sent.push(m); ONLINE.feed({ t: 'world', k: 'bin:T', v: 3 }); ONLINE.add('bin:T', 2); ONLINE.put('lit:T', 1); ONLINE.send = s0; return { v: ONLINE.world['bin:T'], l: ONLINE.world['lit:T'], sent }; });
    ok(w.v === 5 && w.l === 1 && w.sent.length === 2 && w.sent[0].add === 2 && w.sent[1].v === 1, 'the block\'s shared world: what it sends is kept, what you add or put goes back to it (' + JSON.stringify(w) + ')');
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
    await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'in', p: { id: 'c', name: 'JUNE', look: 'w00..M00.jacket_denim~jeans~~shades~', at: [P.x + 1.2, P.z, SHARED.py, 0, SHARED.LVL, ''] } }); ONLINE.feed({ t: 'in', p: { id: 'd', name: 'OTTO', look: 'w00..M00.armor~~~~', at: [P.x - 1.2, P.z, SHARED.py, 0, SHARED.LVL, ''] } }); ONLINE.feed({ t: 'in', p: { id: 'e', name: 'IVY', look: 'w00..M00.~~~nv_goggles~', at: [P.x, P.z + 1.2, SHARED.py, 0, SHARED.LVL, ''] } }); ONLINE.feed({ t: 'in', p: { id: 'f', name: 'GUS', look: 'w00..M00.~~headlight~~', at: [P.x, P.z - 1.2, SHARED.py, 0, SHARED.LVL, ''] } }); });
    await pg.waitForTimeout(2500);
    await pg.evaluate(() => { ONLINE.feed({ t: 'ps', id: 'c', s: { sit: { z: -8 } } }); ONLINE.feed({ t: 'ps', id: 'd', s: { hang: { z: 4, t: 3 } } }); });
    await pg.waitForTimeout(1500);
    const r6 = await pg.evaluate(() => { const c = ONLINE.others.get('c'), d = ONLINE.others.get('d'), e = ONLINE.others.get('e'), f = ONLINE.others.get('f'), W = q => q && q.fig && q.fig.wornH || {}; const mats = typeof RIG !== 'undefined' ? RIG.MATS : [];
      return { dyed: mats.some(m => /^dye#2a4a7a$/i.test(m)) && mats.some(m => /^dye#34507e$/i.test(m)), shades: !!(W(c).eye && W(c).eye.shades && W(c).eye.shades.visible), nv: !!(W(e).eye && W(e).eye.nv && W(e).eye.nv.visible), lamp: !!(W(f).lamp && W(f).lamp.visible), armour: !!(W(d).worn && W(d).worn.root.visible && W(d).worn.armour.visible), sit: !!(c && c.S.sit), hang: !!(d && d.S.hang), mine: (() => { FORAGE.give('jeans', 1); EQUIP.wear('jeans'); return EQUIP.code(); })() }; });
    ok(r6.dyed && r6.shades && r6.armour && r6.nv && r6.lamp, 'a player\'s worn clothes and gear show on their copy (dyed jacket and jeans, shades, armour, night-vision goggles, headlamp): ' + JSON.stringify(r6));
    ok(r6.sit && r6.hang && /^~jeans~/.test(r6.mine), 'their sitting and hanging reach their pose, and what you wear goes in your look: ' + JSON.stringify(r6));
    const dl = await pg.evaluate(() => { const o = [...ONLINE.others.values()].find(q => q.fig && !q.dead), sent = [], s0 = ONLINE.send, on0 = ONLINE.on; o.fig.th.act(); const el = document.getElementById('dollo'), open = !el.hidden, btns = [...el.querySelectorAll('[data-b]')].map(b => b.textContent).join(), slots = el.querySelectorAll('[data-s]').length;
      ONLINE.send = m => sent.push(m); ONLINE.on = true; const ok = ONLINE.pm(o, 'hi there'); ONLINE.send = s0; ONLINE.on = on0; ONLINE.feed({ t: 'pm', from: o.id, name: 'ROSA', text: 'back at you' }); el.hidden = true;
      return { id: o.id, open, btns, slots, ok, sent, heard: /FROM ROSA: back at you/.test(document.getElementById('onllog').textContent) }; });
    ok(dl.open && /^MESSAGE,TRADE/.test(dl.btns) && dl.slots === 6 && dl.ok && dl.sent[0] && dl.sent[0].t === 'pm' && dl.sent[0].to === dl.id && dl.heard, 'double-clicking a player opens their paper doll (MESSAGE, TRADE; their slots); a message goes to them alone and theirs shows in your chat (9 Nov 2026): ' + JSON.stringify(dl));
    // what you hear of them (11 Nov 2026): a near walker's footsteps at them, a far one's fainter; a blow on them and a door they go through, where they are
    await pg.evaluate(() => new Promise(res => { const P = __dbg.you(), T = __dbg.cv().TILE, L = SHARED.LVL; window.__heard = []; window.__p0 = __dbg.SFX.play;
      __dbg.SFX.play = (k, o) => { const Y = __dbg.you(); if (o && o.at) __heard.push({ k, x: o.at.x, z: o.at.z, d: Math.hypot(o.at.x - Y.x, o.at.z - Y.z), far: o.far }); return __p0(k, o); };
      ONLINE.feed({ t: 'in', p: { id: 'g', name: 'NEAR', look: 'w00', at: [P.x, P.z + 1.5 * T, SHARED.py, 0, L, ''] } }); ONLINE.feed({ t: 'in', p: { id: 'h', name: 'FAR', look: 'w00', at: [P.x, P.z - 9 * T, SHARED.py, 0, L, ''] } });
      let i = 0; const t = setInterval(() => { i++; const dx = (i % 20 < 10 ? i % 10 : 10 - i % 10) * .3 * T; ONLINE.feed({ t: 'mv', id: 'g', at: [P.x + dx, P.z + 1.5 * T, SHARED.py, Math.PI / 2, L, ''] }); ONLINE.feed({ t: 'mv', id: 'h', at: [P.x + dx, P.z - 9 * T, SHARED.py, Math.PI / 2, L, ''] }); if (i === 40) { clearInterval(t); res(); } }, 160); }));
    const hs = await pg.evaluate(() => { const T = __dbg.cv().TILE, steps = __heard.filter(h => /^step_/.test(h.k)), k = h => Math.max(0, 1 - h.d / h.far), g = steps.filter(h => h.d < 4 * T), h = steps.filter(h => h.d > 6 * T);
      ONLINE.feed({ t: 'act', id: 'g', m: 'flinch' }); const hit = __heard.filter(h => h.k === 'punch' && h.d < 4 * T).length;
      const o = ONLINE.others.get('g'), q = o.s[o.s.length - 1]; ONLINE.feed({ t: 'mv', id: 'g', at: [q.x, q.z, q.y, 0, q.lv, 'apt:elsewhere'] }); const door = __heard.filter(h => /^door/.test(h.k) && Math.hypot(h.x - q.x, h.z - q.z) < .01).length;
      __dbg.SFX.play = __p0; return { near: g.length, far: h.length, kNear: g.length ? +k(g[0]).toFixed(2) : 0, kFar: h.length ? +k(h[0]).toFixed(2) : 0, hit, door }; });
    ok(hs.near >= 2 && hs.far >= 2 && hs.kNear > hs.kFar && hs.kFar > 0, 'another player walking near you is heard at their feet, a farther one fainter (' + JSON.stringify(hs) + ')');
    ok(hs.hit >= 1 && hs.door >= 1, 'a blow on them and a door they go through sound where they are (' + JSON.stringify(hs) + ')');
    ok(!r3.err.length, 'no SYS errors (' + r3.err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all online checks passed');
  process.exit(fails.length ? 1 : 0);
})();
