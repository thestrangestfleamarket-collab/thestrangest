// THE MARKET's own people for RAMEN: node tools/ramen-folk.cjs  (after SKIP=g python3 build.py; PWCHROME the browser; ffmpeg for the song)  ->  data/sushi/folk.json, data/sushi/snd/busker.mp3
// opens dist/market.html and has the market itself make each body (the octopus busker, the mushroom seller, the badger, the big cat) and pose it with the player's rig: the same figure and the same standing, walking and sitting a tenant takes to RAMEN (src/146bg-yatai.js pack and clips; drawn there by src/sushi/tenant.js), all 15 bones, its colours as the market has them. What a body wears apart from its mesh (the seller's skull and hair, the octopus's guitar) comes as held things; the octopus's playing is read off him as he plays on the platform, and his piece recorded from the market's own guitar.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist'), OUT = path.join(ROOT, 'data/sushi'), KEYS = ['octobusk', 'mushroom', 'w_badger', 'bigcat'], NOSONG = process.argv.includes('--nosong');
const srv = require('http').createServer((q, r) => { const f = path.join(DIST, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });

const bake = async ({ KEYS, song }) => { const TALL = { w_badger: 1.5 };
  const D = __dbg, T = D.THREE, MW = D.cv().TILE / 0.84, Y = D.MAPK.MODS.yatai, out = { folk: {}, log: [] }, wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const b64 = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const r4 = (v) => Math.round(v * 1e4) / 1e4, m12 = (e) => [r4(e[0]), r4(e[1]), r4(e[2]), r4(e[4]), r4(e[5]), r4(e[6]), r4(e[8]), r4(e[9]), r4(e[10]), Math.round(e[12] * 10) / 10, Math.round(e[13] * 10) / 10, Math.round(e[14] * 10) / 10];
  const enc = (x) => Math.max(0, Math.min(255, Math.round(255 * x)));
  await LOAD('later'); try { await WORKERS.make('bar'); for (let i = 0; i < 30 && !BODIES.by.w_badger; i++) await wait(500); } catch (e) { out.log.push('the badger: ' + e.message); }
  for (let i = 0; i < 40 && !(BODIES.by.mushroom && BODIES.by.mushroom.npc); i++) await wait(500);
  const bodyMesh = (N) => { let me = null; if (N && N.g) N.g.traverse((o) => { if (!me && o.isMesh && o.geometry.attributes.bi) me = o; }); return me; };
  // a thing worn or held: its points (in the frame given by inv) and colours, as tenant.js takes them
  const thing = (root, inv, tint) => { const P = [], C = [], I = [], v = new T.Vector3(), M = new T.Matrix4(), cv = document.createElement('canvas'), cg = cv.getContext('2d', { willReadFrequently: true }); root.updateMatrixWorld(true);
    root.traverse((o) => { if (!o.isMesh || !o.geometry.attributes.position || o.visible === false) return; const g = o.geometry, A = g.attributes, m = [].concat(o.material)[0], base = P.length / 3; if (!m || m.visible === false || (m.transparent && m.opacity < 0.3)) return; if (inv) M.multiplyMatrices(inv, o.matrixWorld); else M.identity();
      let px = null, pw = 0, ph = 0; const im = m.map && m.map.image; if (im && A.uv && (im.width || 0) > 0) { try { pw = cv.width = Math.min(256, im.width); ph = cv.height = Math.min(256, im.height); cg.drawImage(im, 0, 0, pw, ph); px = cg.getImageData(0, 0, pw, ph).data; } catch (e) { px = null; } }
      const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)), mc = m.color || { r: 1, g: 1, b: 1 };
      for (let i = 0; i < A.position.count; i++) { v.fromBufferAttribute(A.position, i).applyMatrix4(M); P.push(v.x, v.y, v.z); let r = mc.r, g2 = mc.g, b = mc.b; if (A.color && m.vertexColors) { r *= A.color.getX(i); g2 *= A.color.getY(i); b *= A.color.getZ(i); }
        if (px) { const u = ((A.uv.getX(i) % 1) + 1) % 1, w = ((A.uv.getY(i) % 1) + 1) % 1, k = (Math.min(ph - 1, Math.floor((m.map.flipY ? 1 - w : w) * ph)) * pw + Math.min(pw - 1, Math.floor(u * pw))) * 4; r *= lin(px[k] / 255); g2 *= lin(px[k + 1] / 255); b *= lin(px[k + 2] / 255); }
        if (tint) { r *= tint[0]; g2 *= tint[1]; b *= tint[2]; } C.push(enc(r), enc(g2), enc(b)); }
      const n = g.index ? g.index.count : A.position.count; for (let i = 0; i < n; i++) I.push(base + (g.index ? g.index.getX(i) : i)); });
    const n = P.length / 3; if (!n || n > 65535) return null; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i++) { const a = i % 3; if (P[i] < lo[a]) lo[a] = P[i]; if (P[i] > hi[a]) hi[a] = P[i]; }
    const q = new Uint16Array(P.length); for (let i = 0; i < P.length; i++) { const a = i % 3; q[i] = Math.round(((P[i] - lo[a]) / Math.max(1e-6, hi[a] - lo[a])) * 65535); }
    return { n, lo, hi, p: b64(q), c: b64(Uint8Array.from(C)), i: b64(Uint16Array.from(I)), tris: I.length / 3 }; };
  const real = ONLINE.self;
  for (const k of KEYS) { const body = BODIES.by[k]; if (!body) { out.folk[k] = null; out.log.push(k + ': the market has no such body'); continue; }
    const M = BODIES.mesh(body), N = body.npc, me = bodyMesh(N); let sc = [MW, MW, MW]; if (me) { N.g.updateMatrixWorld(true); const v = me.getWorldScale(new T.Vector3()); sc = [v.x, v.y, v.z]; } else out.log.push(k + ': not standing anywhere, taken at one metre to the metre');
    { M.me.geometry.computeBoundingBox(); const bb = M.me.geometry.boundingBox, ext = bb.max.y - bb.min.y, h = ext * sc[1] / MW;  }   // (a body met only indoors, where the market draws its rooms at another size, is given its height: the page brings it to it)
    const S = { k: 'b:' + k, kind: 'b', me: M.me, PM: M.PM, body, scale: sc }; ONLINE.self = () => S; let fig = null, clips = null; try { fig = Y.pack(); clips = Y.clips(); } catch (e) { out.log.push(k + ': ' + e.message); } finally { ONLINE.self = real; }
    out.folk[k] = { ...(TALL[k] ? { tall: TALL[k] } : {}), label: body.label, height: body.height, tris: typeof body.tris === 'function' ? body.tris() : 0, fig, clips, x: [] }; }
  // the mushroom seller's skull and hair ride his head
  { const F = out.folk.mushroom, HI = BODIES.BONES.indexOf('head'), N = BODIES.by.mushroom && BODIES.by.mushroom.npc, me = bodyMesh(N), ex = []; await wait(6000);
    if (F && N) { N.g.traverse((o) => { if (o.isMesh && o !== me && o.visible && o.geometry.attributes.position && (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) > 60) ex.push(o); });
      for (const o of ex) { const t = thing(o, null, null); if (t) F.x.push({ name: 'head ' + F.x.length, bone: HI, ...t }); else out.log.push('mushroom: a thing of too many points'); } out.log.push('mushroom wears ' + ex.length + ' things on his head'); } }
  // the octopus: go down to him, let him play, read his bones and where his guitar is, eight times a second
  { const F = out.folk.octobusk, N = OCTOBUSK.N; if (F && N) { const s = N.st; STORE.goTo(s.x + 2.2 * MW, s.z + 1.2 * MW, N.lv || 'down'); for (let i = 0; i < 60 && !OCTOBUSK.now(); i++) await wait(500); out.log.push('octobusk plays: ' + OCTOBUSK.now());
      const me = bodyMesh(N), G = OCTOBUSK.play && OCTOBUSK.play.guitar, inv = new T.Matrix4(), rel = new T.Matrix4(); F.play = []; F.gx = [];
      if (G) { G.updateMatrixWorld(true); const t = thing(G, new T.Matrix4().copy(G.matrixWorld).invert(), null); if (t) F.x.push({ name: 'guitar', bone: -1, ...t }); }
      for (let f = 0; f < 40; f++) { await wait(125); N.g.updateMatrixWorld(true); const m = []; for (const X of N.PM.value) m.push(...m12(X.elements)); F.play.push(m); if (G && me) { G.updateMatrixWorld(true); rel.multiplyMatrices(inv.copy(me.matrixWorld).invert(), G.matrixWorld); const e = rel.elements; F.gx.push([e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10], e[12], e[13], e[14]].map((x) => +x.toFixed(4))); } } } }
  // his piece, from the market's own guitar: a voice of its own, tapped where it joins the rest
  if (song) try { await GUITAR.loadSongs(); let hi = 0; GUITAR.BOOK.forEach((t, i) => { const B = GUITAR.BOOK[hi]; if ((t.lvl || 0) > (B.lvl || 0) || ((t.lvl || 0) === (B.lvl || 0) && (t.secs || 0) > (B.secs || 0))) hi = i; }); const B = GUITAR.BOOK[hi]; out.song = { name: B.name, by: B.by, secs: B.secs, credit: B.credit };
    D.SFX.set(true, 1); D.SFX.wake(); const GS = GUITAR.GSND; if (GS.wake) GS.wake(); const ctx = GS.ctx || D.SFX.ctx; if (ctx.state !== 'running') await ctx.resume();
    const E0 = window.__edges.length, V = GUITAR.npc('ramen-busker'), you = D.you(); V.play(hi); for (let i = 0; i < 12; i++) { V.tick(you.x, you.z, 1); await wait(30); }
    const mine = window.__edges.slice(E0), made = new Set(mine.map((e) => e[0])), tail = [...new Set(mine.filter((e) => !made.has(e[1]) || e[1] === ctx.destination).map((e) => e[0]))]; out.log.push('voice edges ' + mine.length + ', tails ' + tail.length + ' ' + tail.map((n) => n.constructor.name).join(','));
    const dest = ctx.createMediaStreamDestination(); for (const n of tail) window.__connect.call(n, dest);
    const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 160000 }), parts = []; rec.ondataavailable = (e) => parts.push(e.data); rec.start(500);
    V.stop(); await wait(400); V.play(hi); const t0 = performance.now(); while (performance.now() - t0 < (B.secs + 6) * 1000) { V.tick(you.x, you.z, 1); await wait(30); if (!V.playing() && performance.now() - t0 > 5000) break; }
    await wait(2500); rec.stop(); await new Promise((r) => { rec.onstop = r; }); const buf = new Uint8Array(await new Blob(parts).arrayBuffer()); out.webm = b64(buf); out.log.push('recorded ' + buf.length + ' bytes over ' + Math.round((performance.now() - t0) / 1000) + ' s'); } catch (e) { out.log.push('the song: ' + e.message); }
  return out; };

(async () => {
  await new Promise((res) => srv.listen(0, '127.0.0.1', res)); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 480, height: 270 } }); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
  await p.addInitScript(() => { window.__edges = []; const c = AudioNode.prototype.connect; window.__connect = c; AudioNode.prototype.connect = function (d, ...a) { if (d instanceof AudioNode) window.__edges.push([this, d]); return c.call(this, d, ...a); }; });
  await p.goto(`${base}/market.html?fresh=1&at=-101.70,40.34&hour=13&view=first`); await p.waitForFunction('window.__started', null, { timeout: 900000 }); await p.waitForTimeout(25000);
  const r = await p.evaluate(bake, { KEYS, song: !NOSONG }); await b.close(); srv.close();
  for (const l of r.log) console.log(l);
  // a body the market draws with flat faces comes with every corner its own point: the same points are told once here (flat: the page parts them again before it lights them)
  const weld = (f) => { const D = JSON.parse(f.fig.D), old = D.i ? new Uint16Array(Uint8Array.from(Buffer.from(D.i, 'base64')).buffer) : null; if (D.n < 2.5 * (old ? old.length / 3 : D.n / 3)) return; const P = Buffer.from(D.p, 'base64'), C = Buffer.from(D.c, 'base64'), B = Buffer.from(D.b, 'base64'), seen = new Map(), idx = [], keep = [];
    for (let i = 0; i < D.n; i++) { const key = P.toString('latin1', i * 6, i * 6 + 6) + C.toString('latin1', i * 3, i * 3 + 3) + B.toString('latin1', i * 3, i * 3 + 3); let j = seen.get(key); if (j == null) { seen.set(key, j = keep.length); keep.push(i); } idx.push(j); }
    if (keep.length > 65535 || keep.length > D.n * 0.8) return; const map = idx.slice(), tri = old ? Array.from(old, (i) => map[i]) : map; idx.length = 0; idx.push(...tri); const pick = (S, w) => Buffer.concat(keep.map((i) => S.subarray(i * w, i * w + w))).toString('base64');
    D.p = pick(P, 6); D.c = pick(C, 3); D.b = pick(B, 3); D.i = Buffer.from(Uint16Array.from(idx).buffer).toString('base64'); D.n = keep.length; D.flat = 1; f.fig.D = JSON.stringify(D); };
  const folk = {}; for (const [k, f] of Object.entries(r.folk)) { if (!f || !f.fig || !f.clips) { console.log(k, 'did not come'); continue; } weld(f); folk[k] = f; console.log(k, f.label, 'height', f.height, 'triangles', f.tris, 'figure', f.fig.D.length, 'bytes', 'held', f.x.map((x) => x.name + ' ' + x.tris).join(', '), f.play ? 'playing frames ' + f.play.length : ''); }
  const s = JSON.stringify({ note: "THE MARKET's own bodies as RAMEN draws them (tools/ramen-folk.cjs): each a tenant's figure (src/sushi/tenant.js) and its poses", song: r.song || null, folk }); fs.writeFileSync(path.join(OUT, 'folk.json'), s); console.log('data/sushi/folk.json', s.length, 'bytes');
  if (r.webm) { const tmp = path.join(require('os').tmpdir(), 'ramen-busker.webm'); fs.writeFileSync(tmp, Buffer.from(r.webm, 'base64')); cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-18:TP=-2,apad=pad_dur=3', '-ac', '1', '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '64k', path.join(OUT, 'snd/busker.mp3')]); fs.unlinkSync(tmp); console.log('data/sushi/snd/busker.mp3', fs.statSync(path.join(OUT, 'snd/busker.mp3')).size, 'bytes:', r.song && r.song.name); }
})();
