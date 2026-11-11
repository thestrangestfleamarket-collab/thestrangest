// THE VOICE CHECK: node tests/voice.cjs dist/market.html. Two pages stand side by side, their handshake handed between them as the Block would: they link, the one holding the talk key is heard by the other (a fake microphone's tone), shown by ((·)) on their tag; silent when let go; unlinked when one walks off.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), os = require('os');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=voice::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const wav = path.join(os.tmpdir(), 'voice-tone.wav'); { const n = 48000 * 3, B = Buffer.alloc(44 + n * 2); B.write('RIFF', 0); B.writeUInt32LE(36 + n * 2, 4); B.write('WAVEfmt ', 8); B.writeUInt32LE(16, 16); B.writeUInt16LE(1, 20); B.writeUInt16LE(1, 22); B.writeUInt32LE(48000, 24); B.writeUInt32LE(96000, 28); B.writeUInt16LE(2, 32); B.writeUInt16LE(16, 34); B.write('data', 36); B.writeUInt32LE(n * 2, 40); for (let i = 0; i < n; i++) { const t = i / 48000, f = 140 + 60 * Math.sin(t * 5), e = Math.abs(Math.sin(t * Math.PI * 3)); let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f * h * t + h) / h; B.writeInt16LE(Math.round(9000 * e * v), 44 + i * 2); } fs.writeFileSync(wav, B); }   // syllables of a low voice for the fake microphone (a steady tone is taken for noise and removed)
  const L = () => chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--use-file-for-fake-audio-capture=' + wav, '--autoplay-policy=no-user-gesture-required'] }), BS = [];
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10&online=0', errs = [];
  const open = async () => { const b = await L(); BS.push(b); const cx = await b.newContext({ viewport: { width: 800, height: 500 }, permissions: ['microphone'] }), pg = await cx.newPage(); pg.on('pageerror', e => errs.push((e.stack || e.message).slice(0, 400))); await pg.goto(url, { waitUntil: 'commit' }); return pg; };
  const P = { a: await open(), b: await open() };
  const up = async pg => { for (let i = 0; i < 80; i++) { if (await pg.evaluate(() => !!window.__started).catch(() => false)) return true; await pg.waitForTimeout(3000); } return false; };
  const st = (await up(P.a)) && (await up(P.b)); ok(st, 'both pages start');
  if (st) {
    for (const [me, them] of [['a', 'b'], ['b', 'a']]) {
      await P[me].exposeFunction('__hand', m => P[them].evaluate(([f, m]) => ONLINE.feed({ ...m, from: f }), [me, m]).catch(() => {}));
      await P[me].evaluate(([me, them]) => { ONLINE.send = m => { if (m && m.t === 'rtc') window.__hand({ t: 'rtc', d: m.d }); }; ONLINE.on = true;
        const Y = __dbg.you(); ONLINE.feed({ t: 'hi', you: me, all: [{ id: them, name: them.toUpperCase(), look: 'w00', at: [Y.x + 2, Y.z, SHARED.py, 0, SHARED.LVL, ''] }] }); }, [me, them]);
    }
    const linked = async () => { for (let i = 0; i < 40; i++) { const r = await Promise.all([P.a, P.b].map(pg => pg.evaluate(() => VOICEDBG().peers.map(p => p.state).join()))); if (r.every(s => s === 'connected')) return r; await P.a.waitForTimeout(500); } return Promise.all([P.a, P.b].map(pg => pg.evaluate(() => JSON.stringify(VOICEDBG())))); };
    const l = await linked(); ok(l.every(s => s === 'connected'), 'two players near each other link for voice (' + l.join(' | ') + ')');
    const heard = () => P.b.evaluate(() => { const o = ONLINE.others.get('a'); return { vt: o.vt && performance.now() - o.vt < 1000, tag: o.lab ? o.lab.el.textContent : '', v: VOICEDBG() }; });
    await P.b.keyboard.press('Shift');   // (a page's sound starts at its first key or click)
    await P.b.waitForTimeout(1500); const h0 = await heard(); ok(!h0.vt, 'nobody is heard while no key is held (' + JSON.stringify(h0) + ')');
    await P.a.keyboard.down('m');
    let h1 = null, vt = false, tag = false; for (let i = 0; i < 40 && !(vt && tag); i++) { await P.b.waitForTimeout(250); h1 = await heard(); vt = vt || !!h1.vt; tag = tag || /\(\(·\)\)/.test(h1.tag); }
    const me = await P.a.evaluate(() => ({ ...VOICEDBG(), hud: (document.getElementById('vtalk') || {}).textContent || '' }));
    ok(me.talking && me.mic && /TALKING/.test(me.hud), 'holding M opens your microphone and says so (' + JSON.stringify(me) + ')');
    ok(vt && tag, 'the other player hears you, ((·)) by your name (' + JSON.stringify(h1) + ')');
    await P.a.keyboard.up('m'); await P.b.waitForTimeout(2500); const h2 = await heard();
    ok(!h2.vt && !(await P.a.evaluate(() => VOICEDBG().talking)), 'letting go goes quiet (' + JSON.stringify(h2) + ')');
    await P.b.evaluate(() => { const Y = __dbg.you(); ONLINE.feed({ t: 'mv', id: 'a', at: [Y.x + 60, Y.z, SHARED.py, 0, SHARED.LVL, ''] }); });
    let gone = []; for (let i = 0; i < 30; i++) { await P.b.waitForTimeout(500); gone = await Promise.all([P.a, P.b].map(pg => pg.evaluate(() => VOICEDBG().peers.length))); if (!gone[0] && !gone[1]) break; }
    ok(gone[0] === 0 && gone[1] === 0, 'walking off far unlinks both (' + gone + ')');
    const set = await P.b.evaluate(() => { const B = document.getElementById('dvoice'); return B ? B.textContent : ''; });
    ok(set === 'ON', 'VOICE in the menu\'s CHAT (' + set + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.join(' | ') + ')');
  for (const b of BS) await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
