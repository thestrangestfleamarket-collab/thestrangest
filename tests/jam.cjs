// THE JAM CHECK: node tests/jam.cjs [dist/jam.html] [folder for screenshots]. STADIUM JAM loads its avatars and samples, the keys play the kit and the guitar, a crash lights the crowd; then the same page in an emulated Quest 3 (IWER): the sticks strike the pads, the trigger kicks, the orb swaps to the guitar, a strum plays six strings; then with tracked hands: the jointed hand meshes load and a fingertip plays the snare.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=jam::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/jam.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
const quest = mode => IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0.3,1.25,0.2);xrDevice.primaryInputMode="' + mode + '";';
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?low&crowd=0.03&room=check';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  let n = 0; const shot = async (pg, name) => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 120000 }); };
  const open = async init => { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [], miss = [];
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => miss.push(r.url().split('/').pop())); pg.on('console', m => { if (m.type() === 'error' && !/WebSocket|parties/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
    if (init) await pg.addInitScript(init); await pg.goto(FILE, { waitUntil: 'commit', timeout: 120000 }); await pg.waitForFunction(() => !!window.__jam, null, { timeout: 420000 }).catch(() => {});
    return { pg, errs, miss, ev: (f, a) => pg.evaluate(f, a), wait: (f, ms = 120000) => pg.waitForFunction(f, null, { timeout: ms }).then(() => true, () => false) }; };

  // on a screen
  { const { pg, errs, miss, ev, wait } = await open(); await shot(pg, 'lobby');
    await ev(() => document.getElementById('play-desktop').click());
    ok(await wait(() => __jam.myBody.ready && __jam.me.samples), 'PLAY ON DESKTOP starts it: the avatar is built and the samples are in');
    const s = await ev(() => ({ ...__jam.me.samples, crowd: __jam.stadium.crowdCount, inst: __jam.me.inst }));
    ok(s.drums && s.guitar && s.crowd > 300 && s.inst === 'drums', 'the recorded kit and guitar loaded, the crowd is in: ' + JSON.stringify(s));
    for (const k of ['Space', 'KeyS', 'KeyA', 'KeyD', 'KeyJ', 'KeyH']) await pg.keyboard.press(k);
    ok(await wait(() => __jam.stats.drums >= 6 && __jam.energy > .15, 30000), 'six keys play six drums and the crowd warms up'); await shot(pg, 'drums');
    await pg.keyboard.press('Tab'); await pg.keyboard.press('Digit5'); await pg.keyboard.press('Space');
    ok(await wait(() => __jam.me.inst === 'guitar' && __jam.guitarPlayer.chord === 'A' && __jam.stats.plucks >= 6, 30000), 'TAB takes the guitar; the fifth fret strummed is an A on six strings'); await shot(pg, 'guitar');
    ok(miss.filter(m => !/parties|check/.test(m)).length === 0 && errs.length === 0, 'no missing file, no page error' + (miss.length || errs.length ? ': ' + miss.concat(errs).join(' | ') : '')); await pg.close(); }

  // in the headset, controllers
  const drive = () => { window.reach = async (ctrl, hand, key, world) => { const J = __jam; for (let i = 0; i < 3; i++) { const e = J.rig.worldToLocal(world.clone()).sub(J.rig.worldToLocal(hand[key].clone())); ctrl.position.x += e.x; ctrl.position.y += e.y; ctrl.position.z += e.z; await new Promise(r => setTimeout(r, 150)); } };
    window.strike = async (ctrl, hand, pad) => { const J = __jam, c = J.kit.pads[pad].wc, b = J.stats.drums; for (const dy of [.12, .05, -.04, -.08]) { const w = c.clone(); w.y += dy; await reach(ctrl, hand, 'tip', w); } return J.stats.drums - b; }; };
  { const { pg, errs, ev, wait } = await open(quest('controller')); await wait(() => !document.getElementById('enter-vr').disabled); await ev(drive);
    await pg.click('#enter-vr'); ok(await wait(() => __jam.renderer.xr.isPresenting && __jam.input.hands.right.active && Math.abs(__jam.rig.position.x + 2.3) < .05, 60000), 'ENTER VR starts the session and stands you at your mark, facing the crowd');
    const hits = await ev(async () => { const c = xrDevice.controllers.right, h = __jam.input.hands.right, o = []; for (const p of [1, 3, 6]) o.push(await strike(c, h, p)); return o; });
    ok(hits.join() === '1,1,1', 'a stick through the snare, a tom and the crash plays each once: ' + hits);
    const kick = await ev(async () => { const b = __jam.stats.drums; xrDevice.controllers.right.updateButtonValue('trigger', 1); await new Promise(r => setTimeout(r, 400)); xrDevice.controllers.right.updateButtonValue('trigger', 0); await new Promise(r => setTimeout(r, 300)); return __jam.stats.drums - b; });
    ok(kick === 1, 'the trigger is the kick drum'); await shot(pg, 'vr-drums');
    const g = await ev(async () => { const J = __jam, H = J.input.hands, c = xrDevice.controllers, orb = J.rig.position.clone(); J.station.children.find(o => o.children.length === 2 && o.children[1].isSprite).getWorldPosition(orb);
      await reach(c.right, H.right, 'tip', orb); await new Promise(r => setTimeout(r, 900)); const m = J.guitarPlayer.guitar.group, at = (x, y) => { m.updateMatrixWorld(true); return orb.clone().set(x, y, .03).applyMatrix4(m.matrixWorld); };
      await reach(c.left, H.left, 'pick', at(.36, 0)); const b = J.stats.plucks; for (const y of [.07, .03, -.01, -.05, -.08]) await reach(c.right, H.right, 'pick', at(.05, y)); return { inst: J.me.inst, fret: J.guitarPlayer.fret, plucks: J.stats.plucks - b }; });
    ok(g.inst === 'guitar' && g.fret === 9 && g.plucks === 6, 'touching the orb takes the guitar; a hand at the ninth fret and a strum plays six strings: ' + JSON.stringify(g)); await shot(pg, 'vr-guitar');
    ok(errs.length === 0, 'no page error in the headset' + (errs.length ? ': ' + errs.join(' | ') : '')); await pg.close(); }

  // in the headset, tracked hands
  { const { pg, errs, ev, wait } = await open(quest('hand')); await wait(() => !document.getElementById('enter-vr').disabled); await ev(drive);
    await pg.click('#enter-vr'); ok(await wait(() => __jam.renderer.xr.isPresenting && __jam.input.hands.right.isHand && __jam.input.hands.left.isHand && __jam.myBody.ready, 60000), 'with the controllers down, both hands are tracked');
    ok(await wait(() => { let k = 0; for (const s of __jam.input.slots) s.hand.traverse(o => { if (o.isSkinnedMesh && o.skeleton.bones.length === 25) k++; }); return k === 2; }, 60000), 'each hand is a jointed mesh of 25 bones');
    const s = await ev(async () => { const J = __jam, hits = await strike(xrDevice.hands.right, J.input.hands.right, 1); return { hits, gap: +J.myBody.bones[8].position.distanceTo(J.input.hands.right.pos).toFixed(3), own: J.myBody.mesh.geometry.drawRange.count < J.myBody.allCount }; });
    ok(s.hits === 1 && s.gap < .01 && s.own, 'a fingertip plays the snare; the arm ends at the tracked wrist and the avatar\'s own hands are put away: ' + JSON.stringify(s)); await shot(pg, 'vr-hands');
    ok(errs.length === 0, 'no page error with hands' + (errs.length ? ': ' + errs.join(' | ') : '')); await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the jam check passed'); process.exit(fails.length ? 1 : 0);
})();
