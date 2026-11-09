// THE SOUND CHECK: node tests/sound.cjs dist/market.html. Sound is on by default; the effects, the radio and the instruments share one audio context and one master volume; every effect the code asks for has a recipe and plays; the SOUND tab shows.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=sound::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const asked = new Set(); for (const f of fs.readdirSync('src')) if (f.endsWith('.js')) for (const m of fs.readFileSync('src/' + f, 'utf8').matchAll(/SFX\.play\('(\w+)'/g)) asked.add(m[1]);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.addInitScript(() => { window.__acs = 0; for (const k of ['AudioContext', 'webkitAudioContext']) { const A = window[k]; if (A) window[k] = class extends A { constructor(...a) { super(...a); window.__acs++; } }; } });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=25,10', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 400000, polling: 500 });
  const r0 = await pg.evaluate(() => ({ n: window.__acs, ctx: !!__dbg.SFX.ac }));
  ok(r0.n === 0 && !r0.ctx, 'no audio context before the first click or key: ' + JSON.stringify(r0));
  await pg.mouse.click(480, 80); await pg.waitForFunction(() => __dbg.SFX.live(), null, { timeout: 15000 }).catch(() => {});
  const r1 = await pg.evaluate(names => { const S = __dbg.SFX, c = S.live(); return { live: !!c, missing: names.filter(k => !S.recipe(k)), dead: S.names().filter(k => { const B = c && S.buffer(k, c); if (!B) return true; const D = B.getChannelData(0); let mx = 0; for (let i = 0; i < D.length; i++) { const v = Math.abs(D[i]); if (!isFinite(v)) return true; if (v > mx) mx = v; } return mx < .01 || !S.play(k, { vol: .01 }); }), n: S.names().length }; }, [...asked]);
  ok(r1.live, 'the first click starts the sound');
  ok(!r1.missing.length, 'every effect the code asks for has a recipe' + (r1.missing.length ? ': none for ' + r1.missing.join(', ') : ' (' + asked.size + ')'));
  ok(!r1.dead.length, 'every recipe is audible and plays' + (r1.dead.length ? ': not ' + r1.dead.join(', ') : ' (' + r1.n + ')'));
  const r2 = await pg.evaluate(async () => { const S = __dbg.SFX, G = GUITAR.GSND; S.set(null, .4); await new Promise(r => setTimeout(r, 400)); const m = S.out(S.ac).gain.value; G.wake(); for (let i = 0; i < 40 && !G.ok; i++) await new Promise(r => setTimeout(r, 250)); await RADIO.load(); RADIO.wake(); const out = { m: +m.toFixed(2), gt: G.ok && G.ctx === S.ac, rad: CARS.radio().ctx, n: window.__acs }; S.set(false, 1); out.off = !S.play('click'); S.set(true, 1); return out; });
  ok(Math.abs(r2.m - .4) < .02, 'the volume moves the master: ' + r2.m);
  ok(r2.gt && r2.rad === 'running' && r2.n === 1, 'the guitar and the radio play on the same one audio context: ' + JSON.stringify(r2));
  ok(r2.off, 'EFFECTS off silences the effects');
  await pg.evaluate(() => { __dbg.UI.toggleMenu(); }); await pg.waitForTimeout(600);
  const tab = await pg.evaluate(() => { const p = document.querySelector('.panes>[data-p="sound"]'); return !!p && !!document.querySelector('#dvol'); });
  ok(tab, 'the menu has its SOUND pane');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('sound: all ok');
})();
