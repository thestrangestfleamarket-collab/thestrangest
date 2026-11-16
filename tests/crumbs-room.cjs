// THE CRUMBS ROOM CHECK: node tests/crumbs-room.cjs [dist/crumbs.html]. Two pages join one house through the room's own rules (worker/crumbs.js, relayed here as the Crumbs Durable Object does): each sees the other mouse, the first one's night opens for both, tips reach the other's board
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { WebSocketServer } = require('ws');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=crumbs-room::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/crumbs.html');
(async () => {
  const src = fs.readFileSync('worker/crumbs.js', 'utf8'), rules = src.slice(src.indexOf('const num ='), src.indexOf('export const CRUMBS')), R = new Function(rules + '; return ROOMS;')();
  const srv = require('http').createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }), wss = new WebSocketServer({ server: srv }), conns = new Set(); let n = 0;
  wss.on('connection', c => { c.id = 'c' + (++n); conns.add(c); const peers = () => [...conns].filter(o => o !== c && o.state).map(o => ({ id: o.id, ...o.state })), cast = m => { for (const o of conns) if (o !== c && o.state) o.send(JSON.stringify(m)); };
    c.on('message', raw => { let m; try { m = JSON.parse(String(raw)); } catch (e) { return; }
      if (m.t === 'join') { if (c.state) return; const p = peers(); if (p.length >= R.MAX) { c.send('{"t":"full"}'); return c.close(); } c.state = { slot: R.slot(p.map(q => q.slot)), name: R.name(m.name) }; c.send(JSON.stringify({ t: 'welcome', id: c.id, slot: c.state.slot, peers: p })); return cast({ t: 'peer-join', id: c.id, ...c.state }); }
      if (!c.state) return; const out = R.clean(m); if (!out) return; if (out.t === 'start' && peers().some(q => q.slot < c.state.slot)) return; out.id = c.id; cast(out); });
    c.on('close', () => { conns.delete(c); if (c.state) cast({ t: 'peer-leave', id: c.id }); }); });
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/crumbs?nolock&fresh&room=test1';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }), errs = [];
  const open = async () => { const pg = await b.newPage({ viewport: { width: 640, height: 360 } }); pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); await pg.goto(URL, { timeout: 180000 }); await pg.waitForFunction(() => window.MC && MC.booted && MC.net && MC.net.connected, null, { timeout: 180000 }).catch(() => {}); return pg; };
  const A = await open(), B = await open();
  await A.waitForFunction(() => MC.net.peers.size === 1, null, { timeout: 30000 }).catch(() => {});
  ok(await A.evaluate(() => MC.net.connected && MC.net.peers.size === 1 && MC.net.host) && await B.evaluate(() => MC.net.connected && MC.net.peers.size === 1 && !MC.net.host), 'two mice are in the house, the first one is its host');
  await B.evaluate(() => MC.startNight(MC.cfgCareer(1))); ok(await B.evaluate(() => MC.game.mode === 'menu'), 'only the host opens a night');
  await A.evaluate(() => MC.startNight(MC.cfgCareer(1))); await B.waitForFunction(() => MC.game.mode === 'play', null, { timeout: 60000 }).catch(() => {});
  ok(await B.evaluate(() => MC.game.mode === 'play' && MC.game.cfg.career === 1), 'the host\'s night opens for the other');
  await B.waitForFunction(() => [...MC.net.peers.values()].some(p => p.av && p.av.g.visible), null, { timeout: 60000 }).catch(() => {});
  ok(await B.evaluate(() => [...MC.net.peers.values()].some(p => p.av && p.av.g.visible)), 'the other mouse is seen');
  await A.evaluate(() => { MC.game.tips = 17; MC.game.served = 2; }); await B.waitForFunction(() => MC.net.board()[0].tips === 17, null, { timeout: 150000 }).catch(() => {});
  ok(await B.evaluate(() => MC.net.board()[0].tips === 17 && !document.getElementById('board').hidden), 'tips reach the other\'s board');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); wss.close(); srv.close(); process.exit(fails.length ? 1 : 0);
})();
