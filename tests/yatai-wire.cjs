// RAMEN OVER THE REAL SERVER: node tests/yatai-wire.cjs [folder for pictures] (after a full build). One login, two windows on the website's own worker (wrangler dev): a cook working the cart at /sushi, and THE MARKET, where going to RAMEN leaves for the same alley as a guest. Through the section's room (worker/door.js, t 'yt'): the cook sees the guest as their MARKET figure and hears them; the guest sees the cook and the cook's things on the cart; both see the same passers-by and customers in the same places; the guest sits, orders and pays; a second cook brings a cart of their own; and LEAVE takes the guest back to THE MARKET. Without a Cloudflare token, WIRE_CONFIG=<a copy of wrangler.jsonc without its "ai" line>.
const { chromium } = require('playwright'), { spawn } = require('child_process'), fs = require('fs'), path = require('path');
const PORT = +process.env.WIRE_PORT || 8797, BASE = 'http://127.0.0.1:' + PORT, out = process.argv[2] || ''; let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const shot = (j, name) => { if (out && j) fs.writeFileSync(path.join(out, name), Buffer.from(j.split(',')[1], 'base64')); };
(async () => {
  const w = spawn('npx', ['wrangler', 'dev', ...(process.env.WIRE_CONFIG ? ['--config', process.env.WIRE_CONFIG] : []), '--port', String(PORT), '--ip', '127.0.0.1', '--var', 'DEV_AUTH:1', '--show-interactive-dev-session=false', '--persist-to', fs.mkdtempSync(path.join(require('os').tmpdir(), 'wire-'))], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
  const stop = () => { try { process.kill(-w.pid, 'SIGKILL'); } catch (e) { try { w.kill('SIGKILL'); } catch (_) {} } }; let log = ''; w.stdout.on('data', (d) => log += d); w.stderr.on('data', (d) => log += d);
  let up = false; for (let i = 0; i < 120 && !up; i++) { await new Promise((r) => setTimeout(r, 1000)); up = await fetch(BASE + '/').then((r) => r.ok).catch(() => false); } if (!up) { console.log('FAIL: the worker never started\n' + log); stop(); process.exit(1); }
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const cx = await b.newContext({ viewport: { width: 900, height: 600 }, permissions: ['microphone'] }); await cx.addCookies([{ name: 'tsfm-pass', value: 'dev:wire-check', url: BASE }]); const errs = [];
  const until = (p, f, ms, arg) => p.waitForFunction(f, arg, { timeout: ms, polling: 500 }).then(() => true, () => false);
  try {
    { const r1 = await fetch(BASE + '/sushi?x=1', { redirect: 'manual' }), r2 = await fetch(BASE + '/ramen'); ok(r1.status === 301 && /\/ramen\?x=1$/.test(r1.headers.get('location') || '') && r2.status === 200 && /<title>RAMEN<\/title>/.test(await r2.text()), '/ramen serves the game and /sushi, its old name, leads there: ' + r1.status + ' ' + r1.headers.get('location') + ' ' + r2.status); }
    const a = await cx.newPage(); a.on('pageerror', (e) => errs.push('cook: ' + e.message.slice(0, 200))); await a.goto(BASE + '/ramen?desktop'); await a.waitForFunction('window.G && G.live && G.mirror && G.items && G.items.length > 10', null, { timeout: 300000 });
    await a.evaluate(() => { G.muteVoices = true; G.cart.pots.forEach((p) => p.setOn(true)); if (G.game.state !== 'open') G.game.toggleOpen(); G.clock.follow(0.05); });
    // THE MARKET: GO TO RAMEN leaves it for the alley as a guest
    const m = await cx.newPage(); m.on('pageerror', (e) => errs.push('market: ' + e.message.slice(0, 200))); await m.goto(BASE + '/?fresh=1&hour=21'); await m.waitForFunction(() => window.__started, null, { timeout: 600000 }); await m.waitForTimeout(3000);
    await m.evaluate(() => { __dbg.UI.goPlace('RAMEN'); }); await m.waitForURL(/\/holo\?g=ramen&as=guest/, { timeout: 120000 }).catch(() => {});
    ok(/\/holo\?g=ramen&as=guest/.test(m.url()), 'RAMEN leaves THE MARKET for the cart\'s own alley as a guest: ' + m.url());
    let g = null; for (let i = 0; i < 600 && !g; i++) { g = m.frames().find((f) => /\/ramen\?guest=1/.test(f.url())) || null; if (!g) await m.waitForTimeout(200); }
    await g.waitForFunction('window.G && G.guestRole && G.live && G.live.share', null, { timeout: 300000 }); await g.evaluate(() => { G.debug.startDesktop(); G.muteVoices = true; });
    await until(g, () => !!G.live.me, 120000); const GID = await g.evaluate(() => G.live.me), CID = GID + '~cart';   // (who the login is on this server: the guest, and the cook in the other window)
    // the cook sees the guest as their own figure, and the guest the cook and the cook's things
    const fig = await until(a, (gid) => { const w = G.live.watchers.get(gid); return w && w.av && w.av.posed() && w.real; }, 180000, GID);
    ok(fig, 'the cook sees the guest as their own MARKET figure, moved by its own bones' + (fig ? '' : ': ' + JSON.stringify(await a.evaluate(() => [...G.live.watchers.entries()].map(([id, w]) => ({ id, av: !!w.av, real: !!w.real }))))));
    const st = await a.evaluate(() => G.live.status()); ok(/^LINKED · [1-9]/.test(st), '/ramen says it is linked and counts who is in its alley: ' + st);
    const sees = await until(g, (cid) => { const N = [...G.live.cooks.values()][0]; return N && N.id === cid && N.things.size > 20 && N.P && G.items.every((i) => !i.obj.visible); }, 180000, CID);
    ok(sees, 'the guest sees the cook (the carving chef) at the cart and the cook\'s own things on it: ' + JSON.stringify(await g.evaluate(() => ({ cooks: [...G.live.cooks.values()].map((N) => [N.id, N.x, N.things.size, !!N.P]), status: G.live.status() }))));
    const ld = await until(g, (cid) => !G.live.share.lead && G.live.share.by === cid, 60000, CID), la = await a.evaluate(() => G.live.share.lead);
    ok(ld && la, 'the cook\'s page runs the alley\'s people and the guest\'s page follows it');
    // the same people in the same places
    const cmp = []; for (let i = 0; i < 12; i++) { await m.waitForTimeout(5000); const [A, B] = await Promise.all([a.evaluate(() => G.live.share.list()), g.evaluate(() => G.live.share.list())]); const keys = Object.keys(A); cmp.push({ n: keys.length, miss: keys.filter((k) => !B[k]).length + Object.keys(B).filter((k) => !A[k]).length, far: keys.filter((k) => B[k] && Math.hypot(A[k][0] - B[k][0], A[k][1] - B[k][1]) > 0.8).length }); }
    const n = cmp.reduce((s, c) => s + c.n, 0), off = cmp.reduce((s, c) => s + c.miss + c.far, 0);
    ok(n >= 6 && off <= Math.max(2, n * 0.1), 'the cook\'s page and the guest\'s show the same passers-by and customers in the same places (' + n + ' seen, ' + off + ' out by more than 0.8 m): ' + JSON.stringify(cmp));
    if (out) { const gj = await g.evaluate(() => { const me = G.guestRole; me.view = 'third'; G.desk.yaw = Math.atan2(me.at.x, me.at.z - 0.3); G.desk.pitch = -0.12; return new Promise((r) => { G.afterRender = () => r(G.renderer.domElement.toDataURL('image/jpeg', 0.9)); }); }); const cj = await a.evaluate((gid) => { const w = G.live.watchers.get(gid), p = (w.av || w.p).root.position, c = G.camera.getWorldPosition(new G.debug.THREE.Vector3()); G.desk.yaw = Math.atan2(-(p.x - c.x), -(p.z - c.z)); G.desk.pitch = -0.2; return new Promise((r) => { G.afterRender = () => r(G.renderer.domElement.toDataURL('image/jpeg', 0.9)); }); }, GID); shot(gj, 'wire-guest-view.jpg'); shot(cj, 'wire-cook-view.jpg'); }
    // their voice reaches the cook from where their figure is
    await a.evaluate(() => G.audio.init());
    const vo = await until(a, () => [...G.live.voices.values()].some((v) => v.src && v.at), 90000);
    ok(vo, 'the cook hears the guest from where their figure stands: ' + JSON.stringify(await a.evaluate(() => [...G.live.voices.entries()].map(([id, v]) => [id, !!v.src, v.at]))));
    // a stool: sit, the menu, an order, and the bowl paid for
    await g.evaluate(() => { const me = G.guestRole; me.at.set(0.72, 0, -1.62); G.rig.position.set(0.72, 0, -1.62); me.sit(); });
    const sat = await until(g, () => G.guestRole.sat && G.guestRole.menu, 90000);
    ok(sat, 'the guest takes a stool, sits on it and is shown the cart\'s menu: ' + JSON.stringify(await g.evaluate(() => G.guestRole.state())));
    await g.evaluate(() => { const b = G.buttons.find((x) => x.guestMenu && /MISO|SHOYU/.test(x.name)); if (b) b.press(); });
    const ord = await until(a, (gid) => G.game.customers.some((c) => c.guest === gid && c.order), 120000, GID), told = await until(g, () => /ORDER/.test(G.guestRole.state().said), 30000);
    ok(ord && told, 'their choice is the order the cook gets, and they are told it: ' + JSON.stringify(await a.evaluate(() => G.game.customers.map((c) => [c.guest, c.state, c.order && c.order.key]))));
    const seenSit = await until(a, (gid) => { const w = G.live.watchers.get(gid); return w && w.seated && w.real && Math.abs(w.av.root.position.z + 1.16) < 0.15; }, 90000, GID);
    ok(seenSit, 'the cook sees the seated guest on the stool as their own figure');
    if (out) { const sj = await a.evaluate((gid) => { const w = G.live.watchers.get(gid), T3 = G.debug.THREE, c = new T3.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 80), p = w.av.root.position; c.position.set(p.x + 1.3, 1.4, p.z - 1.5); c.lookAt(p.x, 0.85, p.z); G.scene.updateMatrixWorld(true); G.renderer.render(G.scene, c); return G.renderer.domElement.toDataURL('image/jpeg', 0.9); }, GID); shot(sj, 'wire-cook-sees-seated-guest.jpg'); }
    await a.evaluate((gid) => G.live.tell({ r: { to: gid, score: 88, pay: 450, verdict: 'Good', issues: [] } }), GID);
    const paid = await until(g, () => G.guestRole.paid > 0, 60000), pd = await g.evaluate(() => ({ paid: G.guestRole.paid, kept: JSON.parse(sessionStorage.getItem('holo')).yatai.paid, cash: G.guestRole.cash }));
    ok(paid ? pd.paid === 5 && pd.kept === 5 : pd.cash < 5, 'the bowl is paid for from the guest\'s own money, kept for THE MARKET: ' + JSON.stringify(pd));
    await g.evaluate(() => G.guestRole.sit()); const freed = await until(a, (gid) => !G.game.customers.some((c) => c.guest === gid && c.state !== 'leaving'), 60000, GID);
    ok(freed, 'getting up frees the stool at the cart');
    // a second cook: a cart of their own beside the first, seen by the guest too
    const cx2 = await b.newContext({ viewport: { width: 700, height: 450 } }); await cx2.addCookies([{ name: 'tsfm-pass', value: 'dev:wire-check-two', url: BASE }]);
    const a2 = await cx2.newPage(); a2.on('pageerror', (e) => errs.push('cook 2: ' + e.message.slice(0, 200))); await a2.goto(BASE + '/ramen?desktop', { timeout: 300000 }); await a2.waitForFunction('window.G && G.live && G.mirror && G.items && G.items.length > 10', null, { timeout: 300000 });
    const sl = await until(a2, () => G.live.net().slot >= 1, 120000);
    ok(sl, 'the second cook takes the next cart along');
    const two = await until(g, () => { const L = [...G.live.cooks.values()]; return L.length === 2 && L.some((N) => N.x !== 0 && N.copy && N.things.size > 20); }, 180000);
    ok(two, 'the guest sees both carts, each with its own things: ' + JSON.stringify(await g.evaluate(() => [...G.live.cooks.values()].map((N) => [N.id, N.x, N.things.size, !!N.copy]))));
    await a2.close();
    // LEAVE: back to THE MARKET, and what was paid comes out of their money
    await m.click('#leave'); const back = await m.waitForFunction(() => window.__started, null, { timeout: 600000 }).then(() => true, () => false);
    await m.waitForTimeout(4000); const settled = await m.evaluate(() => { try { return JSON.parse(sessionStorage.getItem('holo')).yatai; } catch (e) { return null; } });
    ok(back && /\/\?fresh=1&hour=21$/.test(m.url()) && (!pd.paid || (settled && settled.settled)), 'LEAVE takes the guest back to THE MARKET, where their bowl is paid for: ' + JSON.stringify({ url: m.url(), paid: settled && settled.paid, settled: settled && settled.settled }));
    ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  } catch (e) { ok(false, 'the check ran: ' + String(e.message || e).slice(0, 300)); }
  await b.close(); stop(); console.log(bad ? bad + ' FAILED' : 'RAMEN is one game over the real server'); process.exit(bad ? 1 : 0); })();
