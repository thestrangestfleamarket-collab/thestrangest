// THE AVATAR CHECK: node tests/avatar.cjs dist/market.html. Your avatar is the body you wear by default; YOU's rows choose its outfit, hair, beard, colours and height, every choice builds and is kept; another player in an avatar look is drawn as one; dead, it hides for the ghost.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=avatar::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!(window.__started && window.AVATAR)).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    const r0 = await pg.evaluate(() => { const O = AVATAR.OPT, K = ['outfit', 'hair', 'beard', 'skin', 'hairc', 'tall'];
      return { pick: BODIES.pick(), code: AVATAR.code(), rows: K.every(k => { const r = document.getElementById('lav-' + k); return r && r.children.length === O[k].length; }), worn: __dbg.W3.group.children.some(m => m.geometry && m.geometry === BODIES.by.avatar.GEO && m.visible) }; });
    ok(r0.pick === 'avatar' && r0.code === '000002', 'a new player wears the avatar, the base look: the monk\'s clothes, bald, no beard, middle height (' + JSON.stringify(r0) + ')');
    ok(r0.rows, 'YOU has a row for each of outfit, hair, beard, skin, hair colour and height, a button for each choice');
    ok(r0.worn, 'the avatar is the mesh you wear');
    const r1 = await pg.evaluate(async () => { const O = AVATAR.OPT, K = ['outfit', 'hair', 'beard', 'skin', 'hairc', 'tall'], bad = [];
      for (const k of K) for (let i = 0; i < O[k].length; i++) { AVATAR.set(k, i); const t = BODIES.by.avatar.tris(); if (!(t > 1000)) bad.push(k + i + ':' + t); }
      AVATAR.set('tall', 0); const sS = BODIES.by.avatar.S; AVATAR.set('tall', O.tall.length - 1); const sT = BODIES.by.avatar.S;
      AVATAR.set('outfit', 5); AVATAR.set('hair', 3); AVATAR.set('beard', 2); AVATAR.set('skin', 0); AVATAR.set('hairc', 8); AVATAR.set('tall', 2);
      await new Promise(r => setTimeout(r, 400));
      const saved = (localStorage.getItem('market-save') || '').includes(AVATAR.code());
      return { bad, taller: sT > sS * 1.15, code: AVATAR.code(), sends: BODIES.by.avatar.look() === AVATAR.code(), saved, worn: __dbg.W3.group.children.some(m => m.geometry && m.geometry === BODIES.by.avatar.GEO && m.visible) }; });
    ok(!r1.bad.length, 'every choice builds a whole avatar' + (r1.bad.length ? ': ' + r1.bad.join(' ') : ''));
    ok(r1.taller, 'TALL makes you taller than SHORT');
    ok(r1.code === '532082' && r1.worn, 'a new look is worn at once (' + r1.code + ')');
    ok(r1.saved, 'your look is kept (OWNED avatar)');
    ok(r1.sends, 'your look is what the other players are sent');
    await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'b:avatar:315171', at: [P.x + 1.5, P.z, SHARED.py, 0, SHARED.LVL, ''] }] }); });
    await pg.waitForFunction(() => { const o = ONLINE.others.get('a'); return !!(o && o.fig); }, { timeout: 30000 }).catch(() => {});
    const r2 = await pg.evaluate(() => { const o = ONLINE.others.get('a'), F = o && o.fig; return { fig: !!F, body: !!(F && F.body), own: !!(F && F.body && F.body !== BODIES.by.avatar), tris: F && F.body ? F.body.tris() : 0, vis: !!(F && F.g.visible) }; });
    ok(r2.fig && r2.body && r2.own && r2.tris > 1000 && r2.vis, 'another player in an avatar look is drawn as their own avatar (' + JSON.stringify(r2) + ')');
    const r3 = await pg.evaluate(async () => { __dbg.W3.ghost = true; await new Promise(r => setTimeout(r, 300)); const hid = !__dbg.W3.group.children.some(m => m.geometry === BODIES.by.avatar.GEO && m.visible); __dbg.W3.ghost = false; await new Promise(r => setTimeout(r, 300));
      return { hid, back: __dbg.W3.group.children.some(m => m.geometry === BODIES.by.avatar.GEO && m.visible) }; });
    ok(r3.hid && r3.back, 'dead, your avatar hides for the ghost, and comes back');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all avatar checks passed'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
