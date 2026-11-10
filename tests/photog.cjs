// THE PHOTOGRAPHER CHECK: node tests/photog.cjs dist/market.html. PHOTOGRAPHY (146mb): the camera names the subject in its frame and prices the print by rarity, height, danger, quality and repeats; a sale trains the skill and the rangers buy prints.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=photog::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWEXE ? { executablePath: process.env.PWEXE } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&at=40,150&res=0', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(() => { if (window.WX) WX.hold = 'CLEAR'; if (window.LOAD) return LOAD('later'); });
    const P = await pg.evaluate(() => { const q = { base: 4, fill: .8, d: 5 * OPTIC.metre }, o = { dEV: 0, blurD: 0, blurM: 0 }, pr = (x, y) => PHOTOG.price({ ...q, ...x }, { ...o, ...y }).v;
      const c = pr({ tier: 'c', kind: 't1' }), r = pr({ tier: 'r', kind: 't2' }), s = pr({ tier: 's', kind: 't3' });
      const dz = pr({ tier: 'r', kind: 't4', danger: 1.5, d: 1 * OPTIC.metre }), blur = pr({ tier: 'r', kind: 't5' }, { blurD: 4, dEV: 3 });
      const py = SHARED.py; SHARED.py = 40 * OPTIC.metre; const hi = pr({ tier: 'r', kind: 't6' }); SHARED.py = py; return { c, r, s, dz, blur, hi }; });
    ok(P.c < P.r && P.r < P.s, 'rarer subjects pay more: common $' + P.c + ', rare $' + P.r + ', super rare $' + P.s);
    ok(P.dz > P.r && P.hi > P.r, 'a monster close by and a spot high up pay more ($' + P.dz + ', $' + P.hi + ' against $' + P.r + ')');
    ok(P.blur < P.r, 'a blurred, overexposed print pays less ($' + P.blur + ')');
    const shot = await pg.evaluate(async () => { WIELD.set('camera'); await OPTIC.toggle('camera'); await new Promise(r => setTimeout(r, 500)); Object.assign(OPTIC.cam, { f: 50, N: 8, t: 1 / 500, iso: 400, left: 24 });
      const cam = SHARED.cam, f = cam.getWorldDirection(cam.position.clone()); const p = cam.position.clone().addScaledVector(f, 1.5 * OPTIC.metre), bird = { x: p.x, y: p.y, z: p.z, k: 10 };
      for (const f of BFLY.list()) if (f.g) f.g.visible = false; const was = BIRDS.list.splice(0); BIRDS.list.push(bird); OPTIC.shoot(); const a = PHOTOS.mine[PHOTOS.mine.length - 1]; OPTIC.shoot(); const a2 = PHOTOS.mine[PHOTOS.mine.length - 1]; BIRDS.list.splice(0); BIRDS.list.push(...was);
      const sk0 = FORAGE.sk('photo'), cash0 = INV.cash, v = +ITEMS.prop(a.id, 'value'); for (let i = 0; i < 40; i++) for (const s of FORAGE.SOLD) s('photo_x', 1, 20); FORAGE.take(a.id, 1); for (const s of FORAGE.SOLD) s(a.id, 1, v);
      OPTIC.lower(); return { sub: a.sub, v: a.v, cap: a.cap, v2: a2.v, item: v, sk0, sk1: FORAGE.sk('photo'), gone: !PHOTOS.mine.some(p => p.id === a.id), buyk: FORAGE.BUYK.photos, cash: INV.cash - cash0 }; });
    ok(shot.sub === 'bd_10' && shot.v > 1 && shot.item === shot.v, 'the camera names the bird in frame and prices the print ($' + shot.v + ', ' + shot.cap + ', ' + shot.sub + ', item $' + shot.item + ')');
    ok(shot.v2 < shot.v, 'the same kind again that day pays less ($' + shot.v2 + ')');
    ok(shot.sk1 > shot.sk0, 'selling prints trains PHOTOGRAPHY (' + shot.sk0 + ' -> ' + shot.sk1 + ')');
    ok(shot.gone && shot.buyk && shot.buyk[0] === 'photo_', 'a sold print leaves your photos; the shops buy the photos group');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
