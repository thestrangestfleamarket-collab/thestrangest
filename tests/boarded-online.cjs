// BOARDED UP ONLINE CHECK: node tests/boarded-online.cjs dist/boarded.html. Two pages, their 'bu' messages handed across here in place of the section's server:
// one hosts, the other is offered JOIN and joins; each has one whole screen; the host's dead and torn boards appear on the guest; the guest's shot hurts a zombie on the
// host and pays the guest; the guest's board goes on for both; the guest leaving hands the host a solo game.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=boarded-online::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }), errs = [], pgs = {};
  const open = async me => { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), other = me === 'a' ? 'b' : 'a'; pgs[me] = pg; pg.on('pageerror', e => errs.push(me + ': ' + e.message.slice(0, 300)));
    await pg.exposeFunction('__butx', j => pgs[other] && pgs[other].evaluate(([f, j]) => { if (window.BOARDED && BOARDED.api) BOARDED.api.net(f, JSON.parse(j)); }, [me, j]).catch(() => {}));
    await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/boarded.html') + '?stay=1&buq=low', { waitUntil: 'commit' });
    await pg.waitForFunction(() => window.BOARDEDDBG && window.HOLO && HOLO.run, null, { timeout: 120000 });
    await pg.evaluate(o => { BOARDED.online = () => true; BOARDED.peers = () => [{ id: o, name: o === 'a' ? 'ALICE' : 'BOB' }]; BOARDED.tx = (to, d) => window.__butx(JSON.stringify(d)); }, other);
    await pg.waitForFunction(() => BOARDEDDBG().ready, null, { timeout: 300000 }); await pg.evaluate(() => { BOARDED.api.NET.timeout = 1e12; }); return pg; };
  const [A, B] = await Promise.all([open('a'), open('b')]);
  const run = (pg, s) => pg.evaluate(s => { const X = BOARDED.api; for (let i = 0; i < s * 30; i++) { if (X.G.net !== 'guest') for (const p of X.players) { p.hp = 100; p.down = p.dead = false; } X.step(1 / 30); } }, s);
  const both = async s => { for (let i = 0; i < s * 4; i++) { await run(A, .25); await run(B, .25); await A.waitForTimeout(30); } };
  const sh = pg => pg.evaluate(() => { const S = document.getElementById('boarded').shadowRoot; return { join: S.querySelector('#bjoin').style.display !== 'none' ? S.querySelector('#bjoin').textContent : '', host: S.querySelector('#bhost').textContent }; });
  await A.evaluate(() => { const S = document.getElementById('boarded').shadowRoot; BOARDED.api.lobby(.1); S.querySelector('#bhost').click(); for (let i = 0; i < 5; i++) BOARDED.api.lobby(.5); }); await A.waitForTimeout(300);
  await B.evaluate(() => BOARDED.api.lobby(.1)); const l = await sh(B);
  ok(/JOIN BOB|JOIN ALICE/.test(l.join), 'the host offers its game and the other player\'s menu shows JOIN with the host\'s name: ' + JSON.stringify(l));
  await B.evaluate(() => document.getElementById('boarded').shadowRoot.querySelector('#bjoin').click()); await A.waitForTimeout(500); await B.waitForTimeout(300);
  const s0 = await Promise.all([A, B].map(pg => pg.evaluate(() => { const X = BOARDED.api; return { net: X.G.net, st: X.G.state, n: X.players.length, local: X.players.filter(p => !p.remote).length, huds: [...document.getElementById('boarded').shadowRoot.querySelectorAll('.hud')].filter(h => h.style.display === 'block').length, split: document.getElementById('boarded').shadowRoot.querySelector('#split').style.display }; })));
  ok(s0[0].net === 'host' && s0[1].net === 'guest' && s0.every(x => x.st === 'play' && x.n === 2 && x.local === 1 && x.huds === 1 && x.split === 'none'), 'JOIN starts one game on both: a host and a guest, each with one whole screen and the other as a body: ' + JSON.stringify(s0));
  await A.evaluate(() => { BOARDED.api.G.between = .1; }); await both(45);
  const s1 = await Promise.all([A, B].map(pg => pg.evaluate(() => { const X = BOARDED.api, r = X.players.find(p => p.remote); return { round: X.G.round, z: X.zombies.filter(z => z.state !== 'dead').map(z => z.id).sort((a, b) => a - b).join(), win: X.windows.map(w => w.count).join(''), rem: r ? [Math.round(r.pos.x * 10) / 10, Math.round(r.pos.z * 10) / 10] : null }; })));
  ok(s1[0].round === 1 && s1[1].round === 1 && s1[0].z.length > 0 && s1[0].z === s1[1].z && s1[0].win === s1[1].win && /[0-5]/.test(s1[0].win), 'the guest sees the host\'s round, the same dead and the same torn boards: ' + JSON.stringify(s1));
  const hit = await B.evaluate(() => { const X = BOARDED.api, me = X.players.find(p => !p.remote), z = X.zombies.find(z => z.state !== 'dead' && z.state !== 'rise'); if (!z) return null; const hp = new (me.pos.constructor)(); z.J.head.getWorldPosition(hp); me.pos.set(z.pos.x, z.pos.y, z.pos.z + 2.5); for (let i = 0; i < 3; i++) { me.pos.set(z.pos.x, z.pos.y, z.pos.z + 2.5); me.yaw = 0; me.pitch = Math.atan2(z.pos.y + .9 - (me.pos.y + 1.62), 2.5); X.step(1 / 30); }
    window.dispatchEvent(new MouseEvent('mousedown', { button: 0 })); X.step(1 / 30); window.dispatchEvent(new MouseEvent('mouseup', { button: 0 })); for (let i = 0; i < 6; i++) X.step(1 / 30); return { id: z.id, pts: me.pts, mag: me.w[me.cur].mag }; });
  await A.waitForTimeout(300); const hpA = hit && await A.evaluate(id => { const X = BOARDED.api, r = X.players.find(p => p.remote); return { hurt: X.zombies.filter(z => z.hp < 100 || z.state === 'dead').length, pts: r.pts }; }, hit.id);
  await both(1); const ptsB = await B.evaluate(() => BOARDED.api.players.find(p => !p.remote).pts);
  ok(hit && hit.mag === 8 && hpA && hpA.hurt > 0 && hpA.pts > 500 && ptsB === hpA.pts, 'the guest\'s shot hurts a zombie on the host, and the points the host pays come back to the guest: ' + JSON.stringify({ hit, hpA, ptsB }));
  const fix = await B.evaluate(() => { const X = BOARDED.api, me = X.players.find(p => !p.remote), wi = X.windows.findIndex(w => w.count < 6 && !w.vault), w = X.windows[wi]; if (!w) return null; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); for (let i = 0; i < 40; i++) { me.pos.set(w.x - w.nx * .7, 0, w.z - w.nz * .7); X.step(1 / 30); } window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyF' })); return { wi, c0: w.count }; });
  await A.waitForTimeout(300); const fixA = fix && await A.evaluate(wi => BOARDED.api.windows[wi].count, fix.wi);
  ok(fix && fixA > 0, 'a board the guest hammers on goes on at the host: ' + JSON.stringify({ fix, fixA }));
  await B.evaluate(() => BOARDED.api.toMenu()); await A.waitForTimeout(400); await run(A, .5);
  const end = await A.evaluate(() => { const X = BOARDED.api; return { net: X.G.net, n: X.players.length, st: X.G.state }; });
  ok(end.net === '' && end.n === 1 && end.st === 'play', 'the guest leaving hands the host a solo game: ' + JSON.stringify(end));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
