// THE AVATAR DESIGNER CHECK: node tests/avdesigner.cjs [dist/market.html] [shots dir]. Every control moves the avatar itself: each part's SIZE, LENGTH,
// WIDTH and DEPTH change its mesh and its joints, HEIGHT its height; the shape goes out in the look code (what other players see); walking on its clips
// with long legs keeps the feet on the ground; nothing throws.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), PAGE = path.resolve(process.argv[2] || ROOT + '/dist/market.html'), OUT = process.argv[3] || null;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=avdesigner::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), pg = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = {}; pg.on('pageerror', e => { errs[e.message] = (errs[e.message] || 0) + 1; });
  await pg.goto('file://' + PAGE + '?hour=12&fresh=1', { waitUntil: 'commit', timeout: 300000 });
  let up = false; for (let i = 0; i < 400 && !(up = await pg.evaluate(() => !!window.__started && window.AVATAR && AVATAR.ready()).catch(() => false)); i++) await pg.waitForTimeout(1000);
  if (!up) { ok(false, 'the page started with the avatar'); await b.close(); process.exit(1); }
  await pg.waitForTimeout(4000);
  const wait = ms => pg.waitForTimeout(ms);
  // the avatar's rest mesh (its extent) and its joints (from the body's skeleton)
  const meas = () => pg.evaluate(() => { const B = BODIES.by.avatar, g = B.GEO, p = g.attributes.position.array, bi = g.attributes.bi.array, bw = g.attributes.bw.array, J = B.binv.map(m => { const e = m.clone().invert().elements; return [e[12], e[13], e[14]]; });
    const box = (bones) => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < p.length / 3; i++) { const k = bw[i] >= .5 ? bi[i * 2] : bi[i * 2 + 1]; if (bones && !bones.includes(k)) continue; x0 = Math.min(x0, p[i * 3]); x1 = Math.max(x1, p[i * 3]); y0 = Math.min(y0, p[i * 3 + 1]); y1 = Math.max(y1, p[i * 3 + 1]); z0 = Math.min(z0, p[i * 3 + 2]); z1 = Math.max(z1, p[i * 3 + 2]); } return { w: x1 - x0, h: y1 - y0, d: z1 - z0, y0 }; };
    return { all: box(null), head: box([2]), chest: box([1]), thigh: box([9]), foot: box([11]), J, S: B.S }; });
  const shape = async (k, v) => { await pg.evaluate(([k, v]) => { DESIGNER.test.set(k, v); DESIGNER.test.push(); }, [k, v]); for (let i = 0; i < 30; i++) { await wait(500); if (await pg.evaluate(() => { const L = AVATAR.L(); return JSON.stringify(L.sh || null) === JSON.stringify(Object.keys(DESIGNER.test.state().sh).length ? DESIGNER.test.state().sh : null); })) break; } await wait(1500); };
  await pg.evaluate(() => DESIGNER.open()); await wait(1500);
  const shot = async n => { if (!OUT) return; fs.mkdirSync(OUT, { recursive: true }); await pg.evaluate(() => DESIGNER.test.shot()); await (await pg.$('#avd')).screenshot({ path: path.join(OUT, n + '.png') }); };
  await shot('0-as-you-were');
  const base = await meas();
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  // each control, one at a time, back to plain after
  const checks = [
    ['head', [140, 100, 100, 100], m => m.head.h / base.head.h > 1.3 && m.head.w / base.head.w > 1.3, 'HEAD SIZE makes the head bigger'],
    ['chest', [100, 100, 150, 100], m => m.chest.w / base.chest.w > 1.3 && Math.abs(m.J[3][0]) > Math.abs(base.J[3][0]) * 1.2, 'CHEST WIDTH widens the chest and moves the shoulders out'],
    ['chest', [100, 100, 100, 150], m => m.chest.d / base.chest.d > 1.3, 'CHEST DEPTH deepens the chest'],
    ['thigh', [100, 150, 100, 100], m => m.thigh.h / base.thigh.h > 1.3 && m.all.h > base.all.h * 1.08 && Math.abs(m.all.y0 - base.all.y0) < .02, 'THIGH LENGTH makes the legs longer and you taller, the soles on the ground'],
    ['shin', [100, 60, 100, 100], m => m.all.h < base.all.h * .95, 'SHIN LENGTH shorter makes you shorter'],
    ['uarm', [100, 140, 100, 100], m => dist(m.J[4], m.J[3]) > dist(base.J[4], base.J[3]) * 1.3, 'UPPER ARM LENGTH puts the elbow further from the shoulder'],
    ['farm', [100, 140, 100, 100], m => dist(m.J[5], m.J[4]) > dist(base.J[5], base.J[4]) * 1.3, 'FOREARM LENGTH puts the wrist further from the elbow'],
    ['hand', [150, 100, 100, 100], m => m.all.h !== base.all.h || m.all.w > base.all.w * 1.02, 'HAND SIZE makes the hands bigger'],
    ['foot', [100, 150, 100, 100], m => m.foot.d / base.foot.d > 1.3, 'FOOT LENGTH makes the feet longer'],
    ['hips', [100, 100, 150, 100], m => Math.abs(m.J[9][0]) > Math.abs(base.J[9][0]) * 1.2, 'HIPS WIDTH spreads the legs'],
  ];
  for (const [k, v, f, msg] of checks) { await shape(k, v); const m = await meas(); ok(f(m), msg + ' ' + JSON.stringify({ all: m.all, J3: m.J[3] }).slice(0, 160)); await shape(k, null); }
  const back = await meas(); ok(Math.abs(back.all.h - base.all.h) < 1e-3 && Math.abs(back.all.w - base.all.w) < 1e-3, 'RESET puts the avatar back as it was');
  // HEIGHT
  await pg.evaluate(() => { DESIGNER.open(); }); const s0 = await pg.evaluate(() => BODIES.by.avatar.S);
  await pg.evaluate(() => { const r = document.querySelector('#avdh'); r.value = 108; r.oninput(); DESIGNER.test.push(); }); await wait(4000);
  const s1 = await pg.evaluate(() => BODIES.by.avatar.S); ok(s1 > s0 * 1.05, 'HEIGHT makes the avatar taller (' + s0.toFixed(3) + ' → ' + s1.toFixed(3) + ')');
  // a whole shape: in the look code, back out the same; another player's copy of it is the same shape
  await shape('thigh', [100, 140, 100, 100]); await shape('chest', [110, 100, 130, 100]); await shot('1-long-legs-wide-chest'); await shape('head', [120, 100, 100, 100]); await shape('foot', [100, 140, 100, 100]); await shot('2-big-head-long-feet'); await pg.evaluate(() => document.querySelector('#avdv [data-a="'+Math.PI/2+'"]') && document.querySelector('#avdv').children[1].click()); await wait(800); await shot('3-side'); await shape('head', null); await shape('foot', null);
  const rt = await pg.evaluate(() => { const c = AVATAR.code(), L = AVATAR.decode(c); return { c, same: (o => JSON.stringify(Object.keys(o || {}).sort().map(k => [k, o[k]])))(L.sh) === (o => JSON.stringify(Object.keys(o || {}).sort().map(k => [k, o[k]])))(AVATAR.L().sh), h: L.h }; });
  ok(rt.same, 'the shape goes out in the look code and comes back the same (' + rt.c.slice(-20) + ')');
  // walking on its clips with long legs: the soles stay on the ground (the lowest posed point within a few cm of where it is plain)
  const low = () => pg.evaluate(async () => { let me = null; W3.group.traverse(o => { if (o.isMesh && o.geometry === BODIES.by.avatar.GEO) me = o; }); const PM = me && me.userData.PM && me.userData.PM.value; if (!PM) return null; const g = me.geometry, p = g.attributes.position.array, bi = g.attributes.bi.array, bw = g.attributes.bw.array; let lo = 1e9;
    for (let i = 0; i < p.length / 3; i += 2) { const a = PM[bi[i * 2] | 0].elements, c = PM[bi[i * 2 + 1] | 0].elements, w = bw[i], x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2]; lo = Math.min(lo, (a[1] * w + c[1] * (1 - w)) * x + (a[5] * w + c[5] * (1 - w)) * y + (a[9] * w + c[9] * (1 - w)) * z + (a[13] * w + c[13] * (1 - w))); }
    return lo; });
  await pg.evaluate(() => DESIGNER.close()); await wait(2000);
  const walk = async () => { await pg.keyboard.down('w'); const L = []; for (let i = 0; i < 6; i++) { await wait(400); L.push(await low()); } await pg.keyboard.up('w'); await wait(1500); return L.filter(x => x != null); };
  const longW = await walk(); await pg.evaluate(() => { DESIGNER.open(); }); await shape('thigh', null); await shape('chest', null); await pg.evaluate(() => DESIGNER.close()); await wait(2000);
  const plainW = await walk(); const mn = L => Math.min(...L);
  ok(longW.length && plainW.length && Math.abs(mn(longW) - mn(plainW)) < .5, 'walking with long legs, the soles stay on the ground (within 1% of a body, rig units, 52 a body; lowest ' + mn(longW).toFixed(3) + ' vs ' + mn(plainW).toFixed(3) + ')');
  ok(!Object.keys(errs).length, 'no page errors' + (Object.keys(errs).length ? ': ' + JSON.stringify(errs).slice(0, 400) : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
