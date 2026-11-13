// THE GOLF CHECK: node tests/golf.cjs [dist/golf.html] [folder for screenshots]. HALCYON GREENS loads its pictures, the menu shows, PLAY starts the hole, a putt rolls and stops, a putt from beside the cup holes out and the scorecard follows; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=golf::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/golf.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
// served over http as the website serves it (a browser will not fetch the page's own files from disk)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [], miss = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => miss.push(r.url().split('/').pop()));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  let n = 0; const shot = async name => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 120000 }); };
  await pg.addInitScript(() => localStorage.setItem('halcyon-settings', JSON.stringify({ quality: 'low', name: 'Tester' })));
  const t0 = Date.now(); await pg.goto(FILE); await pg.waitForFunction(() => window.__game, null, { timeout: 420000 }).catch(() => {});
  const ev = (f, a) => pg.evaluate(f, a), G = () => ev(() => { const g = __game; return { phase: g.game.phase, menu: g.game.menu, strokes: g.game.strokes, rest: g.ball.atRest, holed: g.ball.holed, z: g.ball.z, page: g.game.page }; });
  const up = await ev(() => !!window.__game); ok(up, 'the page starts with its sky, ground, wood and models loaded (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log('loading screen says: ' + await pg.textContent('#loading').catch(() => '?') + (errs.length ? '\npage errors: ' + errs.join(' | ') : '')); await b.close(); srv.close(); process.exit(1); }
  ok(miss.length === 0, 'every picture and model is found' + (miss.length ? ': ' + miss.join(', ') : ''));
  ok((await G()).phase === 'menu' && (await G()).menu, 'it opens on the menu'); await shot('menu');
  await ev(() => __game.startCourse(0)); await pg.waitForFunction(() => __game.ball.atRest, null, { timeout: 120000 }).catch(() => {});
  let s = await G(); ok(s.phase === 'play' && !s.menu && s.strokes === 0, 'PLAY puts the ball on the tee'); await shot('tee');
  const z0 = s.z; ok(await ev(() => __game.hit(0, -1, 2)), 'a putt is taken');
  await pg.waitForFunction(() => __game.ball.atRest && !__game.game.moving, null, { timeout: 120000 }).catch(() => {});
  s = await G(); ok(s.strokes === 1 && z0 - s.z > 0.8 && z0 - s.z < 2.5, 'it rolls up the green and stops (' + (z0 - s.z).toFixed(2) + ' m)');
  await ev(() => { const g = __game, h = g.game.hole; Object.assign(g.ball, { x: h.cup.x, z: h.cup.z + 0.3, y: h.cup.y + g.ball.r + 0.002, vx: 0, vy: 0, vz: 0, atRest: false, restT: 0 }); });
  await pg.waitForFunction(() => __game.ball.atRest, null, { timeout: 120000 }).catch(() => {});
  ok(await ev(() => __game.hit(0, -1, 1)), 'a short putt at the cup');
  await pg.waitForFunction(() => __game.game.phase === 'holed', null, { timeout: 120000 }).catch(() => {});
  s = await G(); ok(s.phase === 'holed' && s.holed && s.strokes === 2, 'it drops in for a two'); await shot('holed');
  await ev(() => __game.nextHole()); s = await G(); ok(s.phase === 'done' && s.menu && s.page === 'score', 'the scorecard follows the last hole'); await shot('score');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
