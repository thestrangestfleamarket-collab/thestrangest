// THE CART FOR THE MARKET'S ALLEY: node tools/yatai-bake.cjs (after node tools/sushi.cjs). Opens YATAI '86 and has it write out its own cart, joined by material, and one of every mesh its loose things are made of (src/sushi/mirror.js), into data/yatai.json, which THE DARK ALLEY draws (146bg). Re-run when the cart or its things change.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), http = require('http');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist');
(async () => { const srv = http.createServer((q, r) => { const f = path.join(DIST, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise((res) => srv.listen(0, '127.0.0.1', res));
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('pageerror', (e) => console.log('page error: ' + e.message.slice(0, 300)));
  await p.goto('http://127.0.0.1:' + srv.address().port + '/sushi.html?desktop'); await p.waitForFunction(() => window.G && G.cart && G.mirror && G.items && G.items.length > 10, null, { timeout: 300000 }); await p.waitForTimeout(10000);
  const d = await p.evaluate(() => G.mirror.bake()), s = JSON.stringify(d); fs.writeFileSync(path.join(ROOT, 'data/yatai.json'), s);
  console.log('data/yatai.json ' + s.length + ' bytes: ' + d.cart.length + ' parts of the cart, ' + Object.keys(d.lib).length + ' meshes, ' + Object.keys(d.tex).length + ' pictures, box ' + d.box.join(' '));
  await b.close(); srv.close(); })();
