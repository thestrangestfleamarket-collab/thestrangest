// THE INVITATIONS CHECK: node tests/invites.cjs dist/market.html. An invitation from another player (fed as the block's server sends it) shows a card, a line in the log and the bookstore marked on the map; ACCEPT takes you into the bookstore and sits you at that table. Then from a table: a two-player game picked, INVITE A PLAYER lists who is online here and in other sections, and a click sends the invitation; a one-player game has no INVITE.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=invites::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    const a = await pg.evaluate(async () => { ONLINE.feed({ t: 'inv', op: 'ask', from: 'p-bob', name: 'BOB', sec: ONLINE.room, k: 'books', d: { n: 1, g: 'chess' }, at: Date.now() }); await new Promise(r => setTimeout(r, 300));
      const c = document.querySelector('#invs .inv'); return { card: c && c.textContent, w: INVITES.waiting(), m: INVITES.marks(), log: (HUD.lines ? HUD.lines() : []).slice(-3).join(' | ') }; });
    ok(a.card && /BOB INVITES YOU TO PLAY CHESS AT THE BOOKSTORE CAFÉ \(TABLE 2\)/.test(a.card) && /ACCEPT/.test(a.card) && /NO THANKS/.test(a.card), 'the card: who, what, where, ACCEPT and NO THANKS (' + a.card + ')');
    ok(a.m.length === 1 && a.m[0].name === 'THE BOOKSTORE' && a.m[0].until - Date.now() > 590000, 'the bookstore is marked on the map for ten minutes (' + JSON.stringify(a.m) + ')');
    ok(/BOB INVITES YOU/.test(a.log), 'a line in the messages log (' + a.log + ')');
    const sent = await pg.evaluate(() => { window.__sent = []; ONLINE.send = m => window.__sent.push(m); return true; });
    await pg.click('#invs .inv button.y');
    let at = null; for (let i = 0; i < 60 && !at; i++) { await pg.waitForTimeout(1000); at = await pg.evaluate(() => TABLES.at()); }
    const s = await pg.evaluate(() => ({ in: ROOMS.offIn && ROOMS.offIn(), at: TABLES.at(), sit: !!__dbg.ST.sit, sent: window.__sent.filter(m => m.t === 'invr'), card: !!document.querySelector('#invs .inv'), m: INVITES.marks().length }));
    ok(s.in === 'books' && s.at && s.at[0] === 1 && s.sit, 'ACCEPT: into the bookstore and sat at table 2 (' + JSON.stringify(s) + ')');
    ok(s.sent.length === 1 && s.sent[0].op === 'yes' && s.sent[0].to === 'p-bob' && !s.card && !s.m, 'BOB is told yes; the card and the mark go (' + JSON.stringify(s.sent) + ')');
    // the other side: a table, a game for two, INVITE A PLAYER
    const click = async (x, y) => { const r = await pg.evaluate(() => { const c = document.querySelector('#minig canvas').getBoundingClientRect(); return [c.left, c.top, c.width / 520]; }); await pg.mouse.click(r[0] + x * r[2], r[1] + y * r[2]); await pg.waitForTimeout(150); };
    const btn = async id => { const r = await pg.evaluate(id => { const S = MINI.state(); return S && S.sys && S.sys[id]; }, id); if (!r) return false; await click(r[0] + r[2] / 2, r[1] + r[3] / 2); return true; };
    await pg.evaluate(() => { ONLINE.on = true; ONLINE.feed({ t: 'everyone', all: [{ id: 'p-carol', name: 'CAROL', sec: 's-b' }, { id: 'p-dan', name: 'DAN', sec: ONLINE.room }] }); });
    await pg.waitForTimeout(400);
    ok(await btn('g:klondike') && !(await pg.evaluate(() => !!MINI.state().sys.inv)), 'a one-player game (Klondike) has no INVITE');
    await btn('back'); await pg.waitForTimeout(300);
    ok(await btn('g:chess') && await btn('inv'), 'a two-player game (Chess): INVITE A PLAYER');
    await pg.waitForTimeout(300);
    const L = await pg.evaluate(() => Object.keys(MINI.state().sys).filter(k => k.startsWith('p:')));
    ok(L.includes('p:p-carol') && L.includes('p:p-dan'), 'everyone online is listed, here and in other sections (' + L + ')');
    if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT + '-pick.png' });
    await btn('p:p-carol'); await pg.waitForTimeout(300);
    const v = await pg.evaluate(() => window.__sent.filter(m => m.t === 'inv'));
    ok(v.length === 1 && v[0].to === 'p-carol' && v[0].k === 'books' && v[0].d.g === 'chess' && v[0].d.n === 1, 'a click sends CAROL the invitation to this table and game (' + JSON.stringify(v) + ')');
    await pg.evaluate(() => ONLINE.feed({ t: 'inv', op: 'no', from: 'p-carol', name: 'CAROL', k: 'books' })); await pg.waitForTimeout(200);
    ok((await pg.evaluate(() => HUD.lines().slice(-2).join(' | '))).includes('CAROL SAID NO THANKS'), 'her answer shows in the log');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all invitation checks passed'); process.exit(fails.length ? 1 : 0);
})();
