// THE SHOPS' INSIDES CHECK: node tests/insides.cjs dist/market.html. Each street shop's inside is built only when you go in and dropped when you leave; nothing it built or added to the shared lists is left behind, twice round.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=insides::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(async () => { await STORE.ensure(); for (const id in STORE.gate) STORE.gate[id] = () => true; });
    await pg.evaluate(() => { window.__home = __dbg.pos(); });
    const ids = await pg.evaluate(() => Object.keys(STORE.inside));
    ok(ids.length > 0, 'the street has shops with insides: ' + ids.join(', '));
    const until = async (f, a, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
    const s0 = await pg.evaluate(() => Object.keys(STORE.inside).map(id => [id, !!STORE.inside[id].done]));
    ok(s0.every(([, d]) => !d), 'no inside is built before you go in: ' + JSON.stringify(s0));
    for (let round = 1; round <= 2; round++) {
      for (const id of ids) {
        await pg.evaluate(id => { STORE.gate[id] = () => true; return STORE.enter(id, true); }, id);
        const built = await until(id => STORE.inside[id].done && !!STORE.inside[id].P, id, 60000);
        await pg.evaluate(async id => { window.__P = STORE.inside[id].P; await STORE.exit(id); const h = window.__home; __dbg.ui().goTo(h[0], h[2], h[1]); }, id);   // then back to where you started: a shop whose glass shows its inside keeps it built while you stand near (owner, 4 Nov 2026)
        const dropped = await until(id => !STORE.inside[id].done && !STORE.inside[id].P, id, 60000);
        const left = await pg.evaluate(() => { const P = window.__P; if (!P) return 'nothing recorded'; const objs = P.objs.filter(o => o.parent).length, regs = P.regs.reduce((n, [A, L]) => n + L.filter(x => A.includes(x)).length, 0); return objs + regs ? objs + ' objects and ' + regs + ' list entries still there' : ''; });
        const why = built && dropped ? '' : ' (' + await pg.evaluate(id => { const R = STORE.inside[id], Rm = STORE.rooms.find(r => r.id === id), g = __dbg.W3.group.position; return JSON.stringify({ held: [...WINDOWS.held], done: R.done, P: !!R.P, busy: R.busy, fade: FADE.busy, inside: Rm && Rm.inside(g.x, g.z), cur: window.ROOMS && ROOMS.cur && ROOMS.cur.id }); }, id) + ')';
        ok(built && dropped && !left, 'round ' + round + ': ' + id + ' is built when you go in and dropped when you leave, nothing of it left' + why + (left ? ' (' + left + ')' : ''));
      }
    }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
