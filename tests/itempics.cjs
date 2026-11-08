// THE THINGS' PICTURES CHECK (owner, 8 Nov 2026: "lets use the 3d models in inventory too and quickslot, etc. no more icons to represent anything"): node tests/itempics.cjs [dist/market.html] [shot.png].
// A thing in the bag and on the quick bar is pictured from its own 3D model (a rendered photograph, not its 16-pixel icon); the shops' shelves hold models, not flat pictures.
const { chromium } = require('playwright'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), PAGE = path.resolve(process.argv[2] || ROOT + '/dist/market.html'), SHOT = process.argv[3] || null;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=itempics::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), pg = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = {}; pg.on('pageerror', e => { errs[e.message] = (errs[e.message] || 0) + 1; });
  await pg.goto('file://' + PAGE + '?hour=13&fresh=1', { waitUntil: 'commit', timeout: 300000 });
  let up = false; for (let i = 0; i < 400 && !(up = await pg.evaluate(() => !!window.__started).catch(() => false)); i++) await pg.waitForTimeout(1000);
  if (!up) { ok(false, 'the page started'); await b.close(); process.exit(1); }
  await pg.evaluate(() => LOAD('later')); await pg.waitForTimeout(4000); await pg.evaluate(() => PFI.load());
  const IDS = ['guitar', 'bmx', 'ruby', 'g_catfood', 'fr_apple', 'sword', 'coat_red', 'cooler_m'];
  await pg.evaluate(ids => { for (const id of ids) FORAGE.give(id, 1); ids.slice(0, 4).forEach((id, i) => HUD.set(i, id)); BAG.toggle(true); }, IDS);
  await pg.waitForTimeout(6000);
  const r = await pg.evaluate(async ids => { const out = {}; for (const id of ids) { const u = BAG.icon(id), im = new Image(); im.src = u; await im.decode().catch(() => {}); out[id] = { png: u.startsWith('data:image/png'), w: im.naturalWidth }; }
    const imgs = [...document.querySelectorAll('.bgr img, .bgi img, .qs img')].map(i => i.getAttribute('src') || ''); return { out, shown: imgs.length, photos: imgs.filter(s => s.startsWith('data:image/png') && s.length > 400).length }; }, IDS);
  for (const id of IDS) ok(r.out[id].png && r.out[id].w >= 64, id + ' is pictured from its 3D model (' + r.out[id].w + ' px photograph)');
  ok(r.shown > 0 && r.photos === r.shown, 'every picture in the bag and on the quick bar is a photograph of a model (' + r.photos + ' of ' + r.shown + ')');
  if (SHOT) await pg.screenshot({ path: SHOT });
  ok(!Object.keys(errs).length, 'no page errors' + (Object.keys(errs).length ? ': ' + JSON.stringify(errs).slice(0, 300) : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
