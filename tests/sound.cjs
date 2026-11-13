// THE SOUND CHECK: node tests/sound.cjs dist/market.html. Sound is on by default; the effects, the radio and the instruments share one audio context and one master volume; every effect the code asks for has a recipe or recorded takes and plays; the recorded takes (data/sfx.mp3) load and are audible; footsteps follow the ground; a car you drive hums its engine, H honks (not the emotes), getting out stops it; in a storm the recorded rain plays and thunder follows the lightning; by day the city's recorded bed plays outside, and every ambience take (data/amb.mp3) is audible; the fight sounds (data/fight.mp3) load and every take is audible; the owner's SOUND EDITOR uploads a take, sets a level, deletes and trims, saves for everyone (the shared store stood in here) and a new page hears it; the SOUND tab shows.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=sound::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const asked = new Set(); for (const f of fs.readdirSync('src')) if (f.endsWith('.js')) for (const m of fs.readFileSync('src/' + f, 'utf8').matchAll(/SFX\.play\('(\w+)'/g)) asked.add(m[1]);
const http = require('http'), PAGE = path.resolve(process.argv[2] || 'dist/market.html'), ROOT = path.resolve(path.dirname(PAGE), '..'), TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm' };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.addInitScript(() => { window.__acs = 0; for (const k of ['AudioContext', 'webkitAudioContext']) { const A = window[k]; if (A) window[k] = class extends A { constructor(...a) { super(...a); window.__acs++; } }; } });
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  const STORE = {};   // the website's /shared store, stood in: anyone reads, the editor writes
  const srv0 = srv.listeners('request')[0]; srv.removeAllListeners('request');
  srv.on('request', (q, r) => { const m = /^\/shared\/([a-z0-9.-]{1,40})$/.exec(q.url); if (!m) return srv0(q, r);
    if (q.method === 'POST') { const ch = []; q.on('data', c => ch.push(c)); q.on('end', () => { STORE[m[1]] = { type: q.headers['content-type'], data: Buffer.concat(ch) }; r.writeHead(200, { 'content-type': 'application/json' }); r.end('{"ok":true}'); }); return; }
    const f = STORE[m[1]]; if (!f) { r.writeHead(204); return r.end(); } r.writeHead(200, { 'content-type': f.type }); r.end(f.data); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/' + path.relative(ROOT, PAGE) + '?fresh=1&hour=13&physics=1&scanin=9999&at=25,10', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 400000, polling: 500 });
  const r0 = await pg.evaluate(() => ({ n: window.__acs, ctx: !!__dbg.SFX.ac }));
  ok(r0.n === 0 && !r0.ctx, 'no audio context before the first click or key: ' + JSON.stringify(r0));
  await pg.mouse.click(480, 80); await pg.waitForFunction(() => __dbg.SFX.live(), null, { timeout: 15000 }).catch(() => {});
  const r1 = await pg.evaluate(names => { const S = __dbg.SFX, c = S.live(); return { live: !!c, missing: names.filter(k => !S.has(k)), dead: S.names().filter(k => { const B = c && S.buffer(k, c); if (!B) return true; const D = B.getChannelData(0); let mx = 0; for (let i = 0; i < D.length; i++) { const v = Math.abs(D[i]); if (!isFinite(v)) return true; if (v > mx) mx = v; } return mx < .01 || !S.play(k, { vol: .01 }); }), n: S.names().length }; }, [...asked]);
  ok(r1.live, 'the first click starts the sound');
  ok(!r1.missing.length, 'every effect the code asks for has a recipe' + (r1.missing.length ? ': none for ' + r1.missing.join(', ') : ' (' + asked.size + ')'));
  ok(!r1.dead.length, 'every recipe is audible and plays' + (r1.dead.length ? ': not ' + r1.dead.join(', ') : ' (' + r1.n + ')'));
  const r2 = await pg.evaluate(async () => { const S = __dbg.SFX, G = GUITAR.GSND; S.set(null, .4); await new Promise(r => setTimeout(r, 400)); const m0 = S.out(S.ac).gain.value, snd0 = S.snd; S.master(true); await new Promise(r => setTimeout(r, 400)); const m = S.out(S.ac).gain.value; G.wake(); for (let i = 0; i < 40 && !G.ok; i++) await new Promise(r => setTimeout(r, 250)); await RADIO.load(); RADIO.wake(); const out = { m0: +m0.toFixed(2), snd0, m: +m.toFixed(2), gt: G.ok && G.ctx === S.ac, rad: CARS.radio().ctx, n: window.__acs }; S.set(false, 1); out.off = !S.play('click'); S.set(true, 1); return out; });
  ok(r2.snd0 === false && r2.m0 === 0, 'sound is off until you turn it on: the master is silent (owner, 12 Nov 2026): ' + r2.m0);
  ok(Math.abs(r2.m - .4) < .02, 'SOUND on: the volume moves the master: ' + r2.m);
  ok(r2.gt && r2.rad === 'running' && r2.n === 1, 'the guitar and the radio play on the same one audio context: ' + JSON.stringify(r2));
  ok(r2.off, 'EFFECTS off silences the effects');
  const r3 = await pg.evaluate(async () => { const S = __dbg.SFX, names = ['step_stone', 'step_grass', 'step_wood', 'dooropen', 'door', 'latch', 'car_engine', 'car_start', 'car_stop', 'car_door_open', 'car_door_close', 'horn', 'rain', 'thunder']; S.play('door', { vol: .01 }); for (let i = 0; i < 80 && !S.bank.buf; i++) await new Promise(r => setTimeout(r, 250)); const b = S.bank.buf; if (!b) return { ok: false };
    const D = b.getChannelData(0), sr = b.sampleRate, quiet = []; for (const k of names) for (const [t, L] of S.takes(k) || [[0, 0]]) { let mx = 0; for (let i = Math.floor(t * sr); i < (t + L) * sr && i < D.length; i++) mx = Math.max(mx, Math.abs(D[i])); if (!(mx > .2)) quiet.push(k); }
    const R = __dbg.ROOMS, c0 = R.cur, out = S.ground(); R.cur = { id: 'x' }; const ins = S.ground(); R.cur = c0; return { ok: true, secs: +b.duration.toFixed(1), quiet, out, ins, played: !!S.play('step_' + S.ground(), { vol: .01 }), door: typeof S.door }; });
  ok(r3.ok && !r3.quiet.length && r3.played, 'the recorded footsteps and doors load, every take is audible and plays: ' + JSON.stringify(r3));
  ok(r3.out === 'stone' && r3.ins === 'wood', 'footsteps are stone on the street and wood inside: ' + r3.out + ', ' + r3.ins);
  await pg.waitForFunction(() => window.CARS && CARS.dbg().loaded, null, { timeout: 300000, polling: 500 }).catch(() => {});
  await pg.evaluate(() => { const S = __dbg.SFX, p0 = S.play; window.__played = []; S.play = (k, o) => { window.__played.push(k); return p0(k, o); }; __dbg.UI.goTo(78.2, -62, 'up'); });
  await pg.waitForTimeout(3000);   // (the parked cars stand past the map's edge: one brought back onto Market St, as the cars check does)
  await pg.evaluate(() => { const C = CARS.cars.get('c1'); C.x = SHARED.BOD.XS(78.2); C.z = SHARED.BOD.ZS(-67); C.hd = Math.PI; window.__played.length = 0; });
  for (let i = 0; i < 4 && !(await pg.evaluate(() => !!CARS.driving)); i++) { await pg.waitForTimeout(1000); await pg.evaluate(() => CARS.getIn('c1')); }
  await pg.waitForFunction(() => CARS.driving && CARSND.voices() > 0, null, { timeout: 30000, polling: 250 }).catch(() => {});
  const c1 = await pg.evaluate(() => ({ driving: !!CARS.driving, voices: CARSND.voices(), played: window.__played.slice() }));
  ok(c1.driving && c1.voices >= 1 && ['car_door_open', 'car_door_close', 'car_start'].every(k => c1.played.includes(k)), 'getting in: the door, the start, and the engine hums: ' + JSON.stringify(c1));
  await pg.evaluate(() => { window.__played.length = 0; }); await pg.keyboard.press('h'); await pg.waitForTimeout(600);
  const c2 = await pg.evaluate(() => ({ horn: window.__played.includes('horn'), emotes: [...document.querySelectorAll('[id*=emot],[class*=emot]')].some(e => e.offsetParent !== null) }));
  ok(c2.horn && !c2.emotes, 'H in the car honks and does not open the emotes: ' + JSON.stringify(c2));
  await pg.keyboard.press('f'); await pg.waitForTimeout(1500);
  const c3 = await pg.evaluate(() => ({ driving: !!CARS.driving, stop: window.__played.includes('car_stop') }));
  ok(!c3.driving && c3.stop, 'getting out: the engine stops: ' + JSON.stringify(c3));
  await pg.evaluate(() => { window.__played.length = 0; WX.hold = 'STORM'; WX.flashK = 1; });
  await pg.waitForFunction(() => __dbg.AMB.dbg().rain && window.__played.includes('thunder'), null, { timeout: 30000, polling: 250 }).catch(() => {});
  const w1 = await pg.evaluate(() => ({ ...__dbg.AMB.dbg(), thunder: window.__played.includes('thunder') }));
  ok(w1.rain && w1.rainG > 0 && w1.thunder, 'in a storm the recorded rain plays and thunder follows the lightning: ' + JSON.stringify(w1));
  await pg.evaluate(() => { WX.hold = null; WX.flashK = 0; });
  // the day and night around you
  await pg.waitForFunction(() => { const d = __dbg.AMB.dbg(); return d.city && d.cityG > .01 && __dbg.SFX.banks[1].buf; }, null, { timeout: 30000, polling: 250 }).catch(() => {});
  const a1 = await pg.evaluate(() => { const S = __dbg.SFX, c = S.live(), d = __dbg.AMB.dbg(), quiet = []; for (const k of ['amb_city', 'amb_crickets', 'amb_birds', 'amb_dog', 'amb_siren']) (S.takes(k) || []).forEach((_, i) => { const v = S.take(c, { b: [k, i] }); if (!v) return quiet.push(k + i); const D = v.buf.getChannelData(0), sr = v.buf.sampleRate; let mx = 0; for (let j = Math.floor(v.t * sr); j < (v.t + v.L) * sr; j++)mx = Math.max(mx, Math.abs(D[j] || 0)); if (mx < .1) quiet.push(k + i); }); return { ...d, quiet, amb: !!S.banks[1].buf }; });
  ok(a1.where === 'day' && a1.city && a1.cityG > .01 && !a1.crick && a1.amb && !a1.quiet.length, 'by day the city plays outside (no crickets), and every ambience take is audible: ' + JSON.stringify(a1));
  // the fights
  const f1 = await pg.evaluate(async () => { const S = __dbg.SFX, c = S.live(); for (const B of S.banks) S.bankLoad(c); for (let i = 0; i < 60 && !S.banks[2].buf; i++) await new Promise(r => setTimeout(r, 250)); const quiet = [], n = {};
    for (const k of ['punch', 'hurt', 'swing', 'blade', 'clash', 'block']) { n[k] = (S.takes(k) || []).length; (S.takes(k) || []).forEach((_, i) => { const v = S.take(c, { b: [k, i] }); if (!v) return quiet.push(k + i); const D = v.buf.getChannelData(0), sr = v.buf.sampleRate; let mx = 0; for (let j = Math.floor(v.t * sr); j < (v.t + v.L) * sr; j++)mx = Math.max(mx, Math.abs(D[j] || 0)); if (mx < .1) quiet.push(k + i); }); }
    return { loaded: !!S.banks[2].buf, n, quiet, played: !!S.play('punch', { vol: .01 }) }; });
  ok(f1.loaded && Object.values(f1.n).every(v => v > 0) && !f1.quiet.length && f1.played, 'the fight sounds load from their own file, every take audible: ' + JSON.stringify(f1));
  // the owner's sound editor
  const wav = (() => { const sr = 22050, n = sr / 2, b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40); for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / sr * 2 * Math.PI * 440) * 12000), 44 + i * 2); return b; })();
  await pg.evaluate(() => { const d = document.createElement('div'); d.id = 'sedt'; d.style.cssText = 'position:fixed;left:0;top:0;width:700px;background:#000;z-index:99999'; document.body.appendChild(d); SNDED.panel(d); });
  await pg.waitForTimeout(800); await pg.evaluate(() => document.querySelector('#sedt [data-pick="horn"]').click()); await pg.waitForTimeout(500);
  const [fc] = await Promise.all([pg.waitForEvent('filechooser'), pg.evaluate(() => document.querySelector('#sedt [data-act="upload"]').click())]); await fc.setFiles({ name: 'beep.wav', mimeType: 'audio/wav', buffer: wav });
  await pg.waitForFunction(() => { const o = __dbg.SFX.shared.set.horn; return o && o.takes && o.takes.length === 2; }, null, { timeout: 15000 }).catch(() => {});
  await pg.evaluate(() => { const s = document.querySelector('#sedt [data-f="lvl"]'); s.value = '0.5'; s.dispatchEvent(new Event('input', { bubbles: true })); });
  await pg.evaluate(() => document.querySelector('#sedt [data-take="0"][data-do="del"]').click()); await pg.waitForTimeout(300);
  await pg.waitForFunction(() => { const c = document.querySelector('#sedt [data-wave="0"]'); return c && +c.dataset.len > 0; }, null, { timeout: 15000 }).catch(() => {});
  { const bb = await pg.locator('#sedt [data-wave="0"]').boundingBox(); await pg.mouse.move(bb.x + 2, bb.y + bb.height / 2); await pg.mouse.down(); await pg.mouse.move(bb.x + bb.width * .2, bb.y + bb.height / 2, { steps: 5 }); await pg.mouse.up(); await pg.waitForTimeout(300); }   // drag the start in to a fifth
  await pg.evaluate(() => document.querySelector('#sedt [data-act="save"]').click());
  await pg.waitForFunction(() => /SAVED FOR EVERYONE|NOT SAVED/.test(document.querySelector('#sedt .ssay').textContent), null, { timeout: 15000, polling: 200 }).catch(() => {});
  const e1 = await pg.evaluate(async () => { const S = __dbg.SFX, o = S.shared.set.horn, c = S.live(); await new Promise(r => setTimeout(r, 1500)); const v = S.take(c, o.takes[0]); return { takes: o.takes.length, up: !!o.takes[0].f, lvl: o.lvl, level: S.fxLevel('horn'), len: v && +v.L.toFixed(2), played: !!S.play('horn', { vol: .01 }), say: document.querySelector('#sedt .ssay').textContent }; });
  const kept = STORE['sounds.json'] && JSON.parse(STORE['sounds.json'].data.toString());
  ok(e1.takes === 1 && e1.up && e1.lvl === .5 && Math.abs(e1.level - .5) < .01 && e1.len > .35 && e1.len < .42 && e1.played && /SAVED FOR EVERYONE/.test(e1.say) && kept && kept.set.horn.takes[0].f && Object.keys(STORE).some(k => /^snd-.*\.wav$/.test(k)),
    'the sound editor: upload a take, delete the old one, trim, level 0.5, saved for everyone: ' + JSON.stringify({ ...e1, kept: kept && kept.set }));
  const pg2 = await b.newPage(); await pg2.goto(pg.url(), { waitUntil: 'commit' }); await pg2.waitForFunction(() => window.__started, null, { timeout: 400000, polling: 500 });
  const e2 = await pg2.evaluate(async () => { await __dbg.SFX.loadShared(); const o = __dbg.SFX.shared.set.horn; return { takes: o && o.takes.length, lvl: __dbg.SFX.fxLevel('horn') }; }); await pg2.close();
  ok(e2.takes === 1 && Math.abs(e2.lvl - .5) < .01, 'another player\'s page gets the saved sounds: ' + JSON.stringify(e2));
  await pg.evaluate(() => document.getElementById('sedt').remove());
  await pg.evaluate(() => { __dbg.UI.toggleMenu(); }); await pg.waitForTimeout(600);
  const tab = await pg.evaluate(() => { const p = document.querySelector('.panes>[data-p="sound"]'); return !!p && !!document.querySelector('#dvol'); });
  ok(tab, 'the menu has its SOUND pane');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('sound: all ok');
})();
