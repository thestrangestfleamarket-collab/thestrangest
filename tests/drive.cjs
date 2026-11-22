// THE NIGHT DRIVE CHECK: node tests/drive.cjs [folder for screenshots]. The room's seat rule; then the website's own worker (wrangler dev): /drive is the page (no redirect), its files and a Range of the radio come, two pages meet in one room by its code, the second takes the first's passenger seat and may not take the wheel, the first powers up and drives off
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), os = require('os'), { spawn } = require('child_process'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=drive::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const ROOT = path.resolve(__dirname, '..'), OUT = process.argv[2], PORT = 8797, O = 'http://127.0.0.1:' + PORT; if (OUT) fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const { DRIVE } = await import(pathToFileURL(path.join(ROOT, 'worker/drive.js')));
  { const s = { 1: [null, null, null, null], 2: [null, null, null, null] };
    ok(!DRIVE.sit(s, 2, 1, 0) && DRIVE.sit(s, 2, 1, 1) && DRIVE.sit(s, 1, 1, 0) && !DRIVE.sit(s, 1, 1, 1) && s[1][0] === null && DRIVE.sit(s, 2, 1, -1) && s[1][1] === null, 'only the owner takes the wheel, a seat holds one, standing up frees it');
    ok(DRIVE.name('<b>Al</b>') === 'bAlb' && DRIVE.color('red') === '#ffffff' && DRIVE.slot([0, 1]) === 2, 'names and colours are cleaned'); }
  const CFG = path.join(ROOT, '.site-wrangler.jsonc'); fs.writeFileSync(CFG, fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8').replace(/^\s*"ai"\s*:\s*\{[^}]*\},?\s*$/m, '')); process.on('exit', () => { try { fs.unlinkSync(CFG); } catch (e) {} });
  const w = spawn('npx', ['wrangler', 'dev', '-c', CFG, '--port', String(PORT), '--ip', '127.0.0.1', '--var', 'DEV_AUTH:1', '--show-interactive-dev-session=false', '--persist-to', fs.mkdtempSync(path.join(os.tmpdir(), 'drive-'))], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
  const stop = () => { try { process.kill(-w.pid, 'SIGKILL'); } catch (e) { try { w.kill('SIGKILL'); } catch (_) {} } }; process.on('exit', stop);
  let up = false; for (let i = 0; i < 120 && !up; i++) { await new Promise(r => setTimeout(r, 1000)); try { up = (await fetch(O + '/drive', { redirect: 'manual' })).status > 0; } catch (e) {} }
  ok(up, 'the worker starts'); if (!up) { stop(); process.exit(1); }
  { const r = await fetch(O + '/drive', { redirect: 'manual' }), t = await r.text(); ok(r.status === 200 && /Savano Lane Night Drive/.test(t) && !/claude\.ai/.test(t), '/drive is the page itself, no redirect');
    const s = await fetch(O + '/drive/', { redirect: 'manual' }); ok(s.status === 301 && /\/drive$/.test(s.headers.get('location') || ''), '/drive/ leads to /drive');
    for (const f of ['world/world.json', 'world/c_10_10.glb', 'world/a_10_10.jpg', 'world/height.bin', 'world/land.png', 'car/car_lo.glb', 'audio/manifest.json', 'people/cast.json', 'radio/radio.json']) { const q = await fetch(O + '/drive-assets/' + f); ok(q.status === 200, 'file ' + f + ' ' + q.headers.get('content-type')); await q.arrayBuffer(); }
    const st = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/drive/radio/radio.json'), 'utf8')), mp = fs.readdirSync(path.join(ROOT, 'data/drive/radio')).find(f => /\.mp3$/.test(f));
    const g = await fetch(O + '/drive-assets/radio/' + mp, { headers: { Range: 'bytes=1000-1999' } }); ok(g.status === 206 && (await g.arrayBuffer()).byteLength === 1000 && !!st, 'the radio answers a Range');
    ok((await fetch(O + '/drive-assets/../wrangler.jsonc')).status !== 200 && (await fetch(O + '/drive-assets/world/x.exe')).status === 404, 'nothing else is handed out'); }
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); };
  const ctx = await b.newContext({ viewport: { width: 480, height: 300 } }), room = 't' + Date.now().toString(36);
  const open = async n => { const pg = await ctx.newPage(); watch(pg); await pg.goto(O + '/drive?auto=1&q=low&vd=130&time=night&room=' + room + '&name=' + n); await pg.waitForFunction(() => window.__sim && window.__sim.net && window.__sim.net.connected && window.__sim.myCar && document.getElementById('overlay').style.display === 'none', null, { timeout: 600000 }); return pg; };
  const A = await open('Ann'); ok(true, 'the first page starts and joins its room');
  const B = await open('Bo');
  await A.waitForFunction(() => window.__sim.net.players.size === 1, null, { timeout: 60000 }).catch(() => {}); ok(await A.evaluate(() => window.__sim.net.players.size) === 1 && await B.evaluate(() => window.__sim.net.players.size) === 1, 'two pages see each other');
  const ida = await A.evaluate(() => window.__sim.net.id), idb = await B.evaluate(() => window.__sim.net.id); ok(ida !== idb && typeof ida === 'number', 'each has its own number');
  await B.evaluate(a => window.__sim.net.sit(a, 0, 1), ida); await new Promise(r => setTimeout(r, 1500)); ok(await A.evaluate(([a, b]) => window.__sim.net.seats[a][0] !== b, [ida, idb]), 'a guest may not take the wheel');
  await B.evaluate(a => window.__sim.net.sit(a, 1, 2), ida); await A.waitForFunction(([a, b]) => window.__sim.net.seats[a][1] === b, [ida, idb], { timeout: 20000 }).catch(() => {}); ok(await A.evaluate(([a, b]) => window.__sim.net.seats[a][1] === b, [ida, idb]), 'the guest sits in the passenger seat');
  const d = await A.evaluate(() => { const S = window.__sim, v = S.veh; window.__testDrive = true; v.power = true; v.gear = 'D'; v.epb = false; const p0 = v.pos.clone(); for (let i = 0; i < 300; i++) v.update(1 / 60, { throttle: 0.6, brake: 0, steer: 0 }); window.__testDrive = false; return { d: v.pos.distanceTo(p0), y: v.pos.y - S.world.height(v.pos.x, v.pos.z) }; });
  ok(d.d > 1 && Math.abs(d.y) < 2, 'the car powers up and drives off on the ground (' + d.d.toFixed(1) + ' m)');
  if (OUT) await A.screenshot({ path: path.join(OUT, 'drive.png') });
  await B.close(); await A.waitForFunction(() => window.__sim.net.players.size === 0, null, { timeout: 30000 }).catch(() => {}); ok(await A.evaluate(() => window.__sim.net.players.size) === 0, 'a page that leaves is gone from the road');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); stop(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
