// bakes YATAI '86's patrons' motion from the Microsoft Rocketbox library (MIT) into data/sushi/anim/*.json: node tools/sushi-anim.cjs (PWCHROME=chromium; fetches each .fbx from GitHub, keeps none)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), http = require('http'), https = require('https');
const SRC = 'https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/Animations/all_animations_max_motextr_static/', OUT = path.join(__dirname, '../data/sushi/anim/'), ROOT = path.join(__dirname, '..');
// [file in the library, our name, 'body' a seated whole body | 'top' the trunk, arms and head only (laid over a seated body), longest seconds kept]
const JOBS = [['sit_table_idle_cough', 'cough', 'body', 8], ['sit_table_idle_roll_head', 'roll', 'body', 8], ['sit_table_idle_scratch_head', 'scratch', 'body', 8], ['sit_table_idle_touch_face', 'face', 'body', 8], ['sit_table_idle_touch_hair', 'hair', 'body', 8], ['sit_table_idle_yawn', 'yawn', 'body', 8], ['sit_table_idle_relaxed_01', 'relaxed', 'body', 10], ['sit_table_gestic_shrug_01', 'shrug', 'body', 6], ['sit_table_gestic_thoughtful', 'think', 'body', 8],
  ['gestic_talk_neutral_01', 'talk1', 'top', 8], ['gestic_talk_relaxed_01', 'talk2', 'top', 8], ['gestic_talk_excited_01', 'talk3', 'top', 8], ['gestic_listen_accept_01', 'nod', 'top', 5], ['gestic_listen_deny_01', 'no', 'top', 5], ['gestic_laugh_low', 'laugh', 'top', 5], ['idle_neutral_01', 'stand', 'body', 10], ['idle_look_around_01', 'gaze', 'body', 8], ['wave_01', 'wave', 'top', 4]];
const ONLY = process.argv.slice(2);
const TOP = /Spine1|Spine2|Neck|Head|Clavicle|UpperArm|Forearm|Hand|Finger/;
const PAGE = `<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script><script type="module">import * as THREE from 'three'; import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'; const m = new THREE.LoadingManager(); m.setURLModifier((u) => /\\.(tga|png|jpg)$/i.test(u) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' : u); window.load = (u) => new FBXLoader(m).loadAsync(u); window.ready = true;</script>`;
const get = (u) => new Promise((res, rej) => { const a = process.env.HTTPS_PROXY ? null : null; require('child_process').execFile('curl', ['-sSL', '-m', '120', u], { encoding: 'buffer', maxBuffer: 1 << 28 }, (e, out) => (e ? rej(e) : res(out))); });
(async () => {
  const mem = {}, srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(PAGE); } if (mem[u]) { r.writeHead(200); return r.end(mem[u]); } fs.readFile(path.join(ROOT, u), (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': u.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(d); }); });
  await new Promise((res) => srv.listen(0, '127.0.0.1', res));
  const b = await chromium.launch({ executablePath: process.env.PWCHROME }), p = await b.newPage(); p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto('http://127.0.0.1:' + srv.address().port + '/'); await p.waitForFunction('window.ready');
  for (const g of ['m', 'f']) for (const [src, name, kind, max] of JOBS) { if (ONLY.length && !ONLY.includes(name)) continue;
    const key = `/_a/${g}_${src}.fbx`; try { mem[key] = await get(SRC + `${g}_${src}.max.fbx`); } catch (e) { console.log('no', g, src); continue; } if (mem[key].length < 10000) { console.log('missing', g, src); delete mem[key]; continue; }
    const json = await p.evaluate(async ([url, top, max, TOPS]) => {
      const o = await load(url), c = o.animations[o.animations.length - 1], re = new RegExp(TOPS), out = { duration: 0, tracks: [] }, r = (v, d) => +v.toFixed(d);
      for (const tr of c.tracks) { const [bone, prop] = tr.name.split('.'); if (bone.includes('Footsteps') || prop !== 'quaternion' || (top && !re.test(bone))) continue;
        const times = [], values = []; for (let i = 0; i < tr.times.length; i += 2) { const t = tr.times[i]; if (t > max) break; times.push(r(t, 3)); for (let k = 0; k < 4; k++) values.push(r(tr.values[i * 4 + k], 4)); }
        let same = true; for (let i = 4; i < values.length; i++) if (Math.abs(values[i] - values[i % 4]) > 0.0015) { same = false; break; } if (same) { times.length = 1; values.length = 4; }
        out.tracks.push({ n: bone, p: 'q', t: times, v: values }); out.duration = Math.max(out.duration, times[times.length - 1]); }
      return JSON.stringify(out);
    }, [key, kind === 'top', max, TOP.source]);
    delete mem[key]; fs.writeFileSync(OUT + `${g}_${name}.json`, json); console.log(g, name, (json.length / 1024).toFixed(0) + ' KB', JSON.parse(json).duration + ' s', JSON.parse(json).tracks.length + ' tracks');
  }
  await b.close(); srv.close();
})();
