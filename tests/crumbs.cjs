// THE CRUMBS CHECK: node tests/crumbs.cjs [dist/crumbs.html]. MIDNIGHT CRUMBS starts on its menu, its bugs are Polyfork's, the scripted cook plays the first night to dawn with enough served, the cat comes and goes, its patrons are there and one answers through its mind; no page errors
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=crumbs::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/crumbs.html'), ROOT = path.dirname(PAGE);
const asked = [];
const srv = require('http').createServer((q, r) => { if (q.method === 'POST' && /\/crumbs\/talk$/.test(q.url)) { let b = ''; q.on('data', d => b += d); return q.on('end', () => { asked.push(JSON.parse(b)); r.writeHead(200, { 'content-type': 'application/json' }); r.end(JSON.stringify({ say: 'Evening, cook. Mind the cat.' })); }); } const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?nolock&fresh';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('response', q => { if (q.status() >= 400 && !/\/(talk|say)$|favicon/.test(q.url())) errs.push(q.status() + ' ' + q.url().split('/').pop()); }); pg.on('console', m => { if (m.type() === 'error' && !/GL Driver|Read pixels|fonts\.g|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
  const t0 = Date.now(); await pg.goto(FILE, { timeout: 180000 }); await pg.waitForFunction(() => window.MC && MC.booted, null, { timeout: 180000 }).catch(() => {});
  const ev = (f, a) => pg.evaluate(f, a);
  ok(await ev(() => !!(window.MC && MC.booted)), 'the kitchen is built once Rapier is ready (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  ok(await ev(() => MC.game.mode === 'menu' && !document.getElementById('menu').hidden), 'it opens on the menu');
  ok(await ev(() => ['beetle', 'ant', 'cat'].every(k => MC.pf.has(k)) && MC.makeBug(MC.REGULARS.bo.spec).pf), 'the regulars wear Polyfork bodies');
  const r = await ev(() => { MC.manual = true; MC.startNight(MC.cfgCareer(0)); const res = MC.bot.playNight({}); return { served: res.served, need: MC.game.cfg.need, mode: MC.game.mode }; });
  ok(r.mode === 'dawn' && r.served >= r.need, 'the scripted cook plays night 1 to dawn (' + r.served + ' served, ' + r.need + ' needed)');
  const c = await ev(() => { MC.manual = true; MC.startNight(MC.cfgCareer(12)); MC.advance(2); MC.events.start('cat'); let seen = false; for (let i = 0; i < 40 && MC.events.active; i++) { MC.advance(0.5); seen = seen || MC.events.active && MC.events.active.ph === 1; } return { seen, gone: !MC.events.active }; });
  ok(c.seen && c.gone, 'the cat comes, watches and goes');
  // the pub's folk: sixteen patrons with names, and one you walk up to answers through its mind (the server here stands in for /crumbs/talk)
  const f = await ev(() => { MC.manual = true; MC.startNight(MC.cfgCareer(2)); MC.advance(8); const P = MC.world.patrons.find(p => p.cast && p.cast.where === 'table'); MC.rig.position.set(P.pos.x + 1.2, 0, P.pos.z); MC.advance(0.5); return { n: MC.world.patrons.filter(p => p.cast).length, who: P.cast.id, name: P.cast.name, walkers: MC.world.patrons.filter(p => p.route).length }; });
  ok(f.n >= 16 && f.walkers === 3, f.n + ' patrons are in the pub, ' + f.walkers + ' of them on their feet');
  await pg.waitForFunction(n => MC.game.msg.indexOf(n + ': ') === 0, f.name, { timeout: 60000 }).catch(() => {});
  ok(await ev(n => MC.game.msg.indexOf(n + ': “Evening, cook') === 0, f.name) && asked.some(a => a.who === f.who && /come over/.test(a.say) && /the hour/.test(a.state)), 'a patron you walk up to greets you through its mind');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); process.exit(fails.length ? 1 : 0);
})();
