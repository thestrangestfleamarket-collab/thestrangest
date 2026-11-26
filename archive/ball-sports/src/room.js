// THE CLUBHOUSE: the room you start in, furnished with THE MARKET's own furniture. Three doors lead out (basketball, bowling, tennis); the table games are played where they stand: ping pong (rally.js), air hockey (airsim.js, THE MARKET's rules), skee-ball (THE MARKET's cabinet, as it is) and pool (THE LAST CHANCE's table, as it is). In passthrough one of them stands alone in your room
import { makeRally } from './rally.js';
import { AIR } from './airsim.js';
import { SKEE } from '../146yz-skee.js';
import { buildPool } from '../saloon/pool.js';
import { G as SG, R as SR, LOOK } from './shim-saloon.js';
export function makeRoom(K) {
  const T = K.THREE, V3 = K.V3, O = new V3(0, 0, 300), HX = 7, HZ = 9, H = 3.8, g = new T.Group(); g.position.copy(O); g.visible = false; K.scene.add(g);
  const hall = new T.Group(), ppG = new T.Group(), airG = new T.Group(); g.add(hall, ppG, airG);
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .9, ...o }), box = (w, h, d, m, x, y, z, p = hall) => { const q = K.shadowOn(new T.Mesh(new T.BoxGeometry(w, h, d), m)); q.position.set(x, y, z); p.add(q); return q; };
  const sign = (txt, w, h, col = '#e9c46a', bg = '#16130f') => { const c = K.cv(512, Math.round(512 * h / w)), x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); x.strokeStyle = col; x.lineWidth = 6; x.strokeRect(8, 8, c.width - 16, c.height - 16);
    x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; const L = txt.split('\n'); x.font = '700 ' + Math.floor(Math.min(c.height / (L.length + .6), 1000 / Math.max(...L.map(l => l.length)))) + 'px Arial'; L.forEach((l, i) => x.fillText(l, 256, c.height * (i + 1) / (L.length + 1)));
    return new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: K.tex(c), roughness: .8 })); };
  const scan = (n, rx, ry, o = {}) => new T.MeshStandardMaterial({ map: K.ptex(n + '_d', rx, ry), normalMap: K.ptex(n + '_n', rx, ry, false), roughness: 1, ...o });
  // ---- the hall: plaster, a painted dado, a boarded floor and ceiling, lit by its three lamps alone
  const lamps = [];
  { const fl = new T.Mesh(new T.PlaneGeometry(2 * HX, 2 * HZ).rotateX(-Math.PI / 2), scan('floor', 7, 9, { roughness: .8 })); fl.receiveShadow = true; hall.add(fl);
    const dado = std(0x2f4a3e), dark = std(0x2a2623);
    for (const [w, x, z, ry] of [[2 * HX, 0, -HZ, 0], [2 * HX, 0, HZ, Math.PI], [2 * HZ, -HX, 0, Math.PI / 2], [2 * HZ, HX, 0, -Math.PI / 2]]) {
      const a = new T.Mesh(new T.PlaneGeometry(w, H), scan('plaster', w / 2.5, H / 2.5, { color: 0xe6dfd0 })); a.position.set(x, H / 2, z); a.rotation.y = ry; a.receiveShadow = true; hall.add(a);
      const b = new T.Mesh(new T.PlaneGeometry(w, 1.05), dado); b.position.set(x * .998, .525, z * .998); b.rotation.y = ry; b.receiveShadow = true; hall.add(b);
      const r = new T.Mesh(new T.PlaneGeometry(w, .06), dark); r.position.set(x * .997, 1.08, z * .997); r.rotation.y = ry; hall.add(r); }
    const ce = new T.Mesh(new T.PlaneGeometry(2 * HX, 2 * HZ).rotateX(Math.PI / 2), scan('ceiling', 7, 9, { color: 0x8a7a66 })); ce.position.y = H; hall.add(ce);
    for (let z = -6; z <= 6; z += 6) { box(2 * HX, .22, .18, dark, 0, H - .11, z); box(2 * HX, .22, .18, dark, 0, H - .11, z + 3);
      const l = new T.SpotLight(0xffe2b8, 130, 16, 1.22, .65, 1.7); l.position.set(0, H - .62, z); l.target.position.set(0, 0, z); l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0005; l.shadow.normalBias = .02; l.shadow.camera.near = .4; l.shadow.camera.far = 9; hall.add(l, l.target); lamps.push(l);
      const sh = new T.Mesh(new T.ConeGeometry(.3, .25, 16, 1, true), new T.MeshStandardMaterial({ color: 0x1d5a48, side: T.DoubleSide, roughness: .6 })); sh.position.set(0, H - .55, z); hall.add(sh);
      const bulb = new T.Mesh(new T.SphereGeometry(.06, 10, 8), new T.MeshBasicMaterial({ color: 0xfff1cf })); bulb.position.set(0, H - .64, z); hall.add(bulb); }
    hall.add(new T.HemisphereLight(0xfff0dc, 0x4a3c2c, .5));
    const title = sign('THE CLUBHOUSE', 4.2, .7); title.position.set(0, 3.1, HZ - .02); title.rotation.y = Math.PI; hall.add(title); }
  // ---- the doors out
  const doors = [['hoops', 'BASKETBALL', -3.6], ['bowl', 'BOWLING', 0], ['tennis', 'TENNIS', 3.6]].map(([id, name, x]) => { box(1.9, 2.5, .12, std(0x15110e), x, 1.25, -HZ + .05); box(1.6, 2.3, .06, std(0x0c1a16), x, 1.15, -HZ + .1);
    const s = sign(name, 1.9, .5); s.position.set(x, 2.85, -HZ + .12); hall.add(s); box(1.3, .012, .8, std(0x6b2f25), x, .006, -HZ + 1.1); return { id, x }; });
  // ---- ping pong: a 9 ft table, the house at the far end
  const PX = -3.4, PZ = .4, PT = .76; { const blue = std(0x1f4f8f, { roughness: .7 }), leg = std(0x1a1a1c, { metalness: .5, roughness: .6 });
    box(1.525, .03, 2.74, blue, PX, PT - .015, PZ, ppG); const wl = std(0xf2f0e8);
    for (const [w, d, x, z] of [[1.525, .02, 0, -1.36], [1.525, .02, 0, 1.36], [.02, 2.74, -.7525, 0], [.02, 2.74, .7525, 0], [.006, 2.74, 0, 0]]) { const m = new T.Mesh(new T.PlaneGeometry(w, d).rotateX(-Math.PI / 2), wl); m.position.set(PX + x, PT + .0012, PZ + z); m.receiveShadow = true; ppG.add(m); }
    for (const sx of [-.6, .6]) for (const sz of [-1.1, 1.1]) box(.05, PT - .03, .05, leg, PX + sx, (PT - .03) / 2, PZ + sz, ppG);
    const nc = K.cv(32, 32), x = nc.getContext('2d'); x.strokeStyle = '#0d0f10'; x.lineWidth = 2; for (let i = 0; i <= 32; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 32); x.moveTo(0, i); x.lineTo(32, i); x.stroke(); }
    const net = new T.Mesh(new T.PlaneGeometry(1.83, .1525), new T.MeshStandardMaterial({ map: K.tex(nc, { rep: [60, 5] }), transparent: true, side: T.DoubleSide })); net.position.set(PX, PT + .076, PZ); ppG.add(net);
    for (const sx of [-.915, .915]) box(.02, .17, .02, leg, PX + sx, PT + .08, PZ, ppG); }
  K.solids.push({ x0: O.x + PX - .78, x1: O.x + PX + .78, z0: O.z + PZ - 1.4, z1: O.z + PZ + 1.4 }, { x0: O.x + 3.5 - .66, x1: O.x + 3.5 + .66, z0: O.z + .6 - 1.22, z1: O.z + .6 + 1.22 }, { x0: O.x - 5.4 - .42, x1: O.x - 5.4 + .42, z0: O.z + 5.3 - 1.7, z1: O.z + 5.3 + 1.05 });
  const lit = t => new T.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .45, roughness: .7 });
  const ppC = K.cv(256, 128), ppT = K.tex(ppC); { const m = new T.Mesh(new T.PlaneGeometry(1.4, .7), lit(ppT)); m.position.set(-HX + .03, 2.2, PZ); m.rotation.y = Math.PI / 2; hall.add(m);
    const s = sign('PING PONG', 1.4, .34); s.position.set(-HX + .03, 2.78, PZ); s.rotation.y = Math.PI / 2; hall.add(s); }
  const led = (c, t, a, b) => { const x = c.getContext('2d'); x.fillStyle = '#07090a'; x.fillRect(0, 0, c.width, c.height); x.textAlign = 'center'; x.fillStyle = '#d8d6cc'; x.font = '700 ' + c.height * .16 + 'px Arial'; x.fillText(a, c.width / 2, c.height * .22); x.fillStyle = '#ffb629'; x.font = '700 ' + c.height * .46 + 'px "Courier New",monospace'; x.fillText(b, c.width / 2, c.height * .72); t.needsUpdate = true; };
  const PP = makeRally(K, { O: new V3(O.x + PX, 0, O.z + PZ), parent: K.scene, rules: 'pp', to: 11, table: true, y0: PT, hw: .7625, hl: 1.37, net: .1525, netPost: .1525, netW: .915, R: .02, kd: .14, km: 3.3e-3, e: .9, mu: .35, clear: .05, dT: .03,
    vmax: 24, vmaxR: 12, boost: 1, pitch: 5.5, reachP: 1.7, autoMove: false, ballMat: new T.MeshStandardMaterial({ color: 0xf6f2e6, roughness: .7 }), foeColor: 0x2f6f8e,
    racket: { L: .135, a: .08, b: .075, th: .008, grip: .013, solid: true, e: .78, mu: .4, spin: .55, color: 0xb3261e, color2: 0x1c1c1e },
    ai: { home: 1.95, near: 1.75, wide: .5, reach: 1.0, high: .9, after: .11, hitY: .3, T: .5, spin: 60, tx: .5, tz0: .45, tz1: 1.15,
      levels: [{ speed: 1.4, miss: .14, aim: .6, pace: .9 }, { speed: 2.1, miss: .06, aim: .85, pace: 1 }, { speed: 3, miss: .02, aim: 1, pace: 1.12 }] },
    board: (S, sc) => led(ppC, ppT, S.over ? 'GAME OVER' : (S.server === 'P' ? 'YOUR SERVE' : 'HOUSE SERVES'), sc) });
  // ---- air hockey: THE MARKET's table rules; your mallet under your hand
  const AX = 3.5, AZ = .6, AT = .8, air = { s: AIR.create(), on: false, score: [0, 0], pause: 0, acc: 0, ev: [], over: false };
  const aC = K.cv(256, 128), aT = K.tex(aC), puck = new T.Mesh(new T.CylinderGeometry(AIR.PR, AIR.PR, .012, 28), std(0xd4271f, { roughness: .6 })), mal = [0, 1].map(i => { const m = new T.Group(), c = std(i ? 0x2b6cc4 : 0xe9a21f, { roughness: .6 });
    const a = K.shadowOn(new T.Mesh(new T.CylinderGeometry(AIR.MR, AIR.MR, .02, 28), c)); a.position.y = .01; const b = new T.Mesh(new T.CylinderGeometry(.018, .024, .06, 16), c); b.position.y = .05; m.add(a, b); airG.add(m); return m; }); airG.add(puck);
  { const cab = std(0x122a5c, { roughness: .7 }), rail = std(0x141518, { roughness: .6 }), W = AIR.W, L = AIR.L; box(2 * W + .16, AT - .06, 2 * L + .16, cab, AX, (AT - .06) / 2, AZ, airG); box(2 * W, .03, 2 * L, std(0xeef0f2, { roughness: .5 }), AX, AT - .015, AZ, airG);
    for (const sx of [-1, 1]) box(.06, .05, 2 * L + .12, rail, AX + sx * (W + .03), AT + .01, AZ, airG); for (const sz of [-1, 1]) for (const sx of [-1, 1]) box(W - AIR.GH, .05, .06, rail, AX + sx * (AIR.GH + (W - AIR.GH) / 2), AT + .01, AZ + sz * (L + .03), airG);
    const ln = std(0xc41f2a); const mid = new T.Mesh(new T.PlaneGeometry(2 * W, .012).rotateX(-Math.PI / 2), ln); mid.position.set(AX, AT + .001, AZ); airG.add(mid); const ring = new T.Mesh(new T.RingGeometry(.15, .16, 32).rotateX(-Math.PI / 2), ln); ring.position.set(AX, AT + .001, AZ); airG.add(ring);
    const b = new T.Mesh(new T.PlaneGeometry(1.2, .6), lit(aT)); b.position.set(HX - .03, 2.2, AZ); b.rotation.y = -Math.PI / 2; hall.add(b);
    const s = sign('AIR HOCKEY', 1.4, .34); s.position.set(HX - .03, 2.72, AZ); s.rotation.y = -Math.PI / 2; hall.add(s); }
  const airBoard = () => led(aC, aT, air.over ? (air.score[0] > air.score[1] ? 'YOU WIN' : 'THE HOUSE WINS') : 'FIRST TO 7', air.score[0] + ' - ' + air.score[1]);
  const airStart = () => { air.score = [0, 0]; air.over = false; air.s = AIR.create(); AIR.faceoff(air.s, 1); air.pause = .6; airBoard(); };
  const _p = new V3(), _d = new V3(), hand = () => K.mode ? (K.hands.find(q => q.src && q.src.handedness === K.racketHand) || K.hands.find(q => q.src)) : null;
  function airFrame(dt) { const s = air.s, me = s.m[0], h = hand();
    if (h) { me.tx = h.pos.x - O.x - AX; me.tz = h.pos.z - O.z - AZ; } else { K.camera.getWorldPosition(_p); K.camera.getWorldDirection(_d); if (_d.y < -.05) { const k = (_p.y - AT) / -_d.y; me.tx = _p.x + _d.x * k - O.x - AX; me.tz = _p.z + _d.z * k - O.z - AZ; } }
    if (air.pause > 0) { air.pause -= dt; if (air.pause <= 0 && !air.over) s.live = true; }
    air.acc = Math.min(.1, air.acc + dt); while (air.acc >= 1 / 240) { air.acc -= 1 / 240; AIR.think(s, s.m[1], AIR.LEVELS.medium, 1 / 240); if (air.pause > 0) s.live = false; AIR.step(s, 1 / 240, air.ev); }
    for (const e of air.ev) { _p.set(O.x + AX + s.puck.x, AT, O.z + AZ + s.puck.z); if (e.k === 'goal') { const i = e.into > 0 ? 1 : 0; air.score[i]++; K.snd('board', _p, 5); K.flash(i ? 'HOUSE SCORES' : 'GOAL');
          if (air.score[i] >= 7) { air.over = true; air.pause = 1e9; } else { AIR.faceoff(s, e.into); air.pause = 1; } airBoard(); }
      else K.snd(e.k === 'mallet' ? 'catch' : 'step', _p, e.k === 'mallet' ? e.s * 2.5 : e.s * 3, e.k === 'mallet' ? 2.2 : 3); } air.ev.length = 0;
    puck.position.set(AX + s.puck.x, AT + .006, AZ + s.puck.z); puck.visible = s.live || air.pause < 1e8; s.m.forEach((m, i) => mal[i].position.set(AX + m.x, AT, AZ + m.z)); }
  // ---- skee-ball: THE MARKET's own cabinet and ball physics, stood on a plinth
  const KX = -5.4, KZ = 5.3, KY = .72, sk = SKEE.make({ lights: false, font: 'bold sans-serif' }), skG = new T.Group(); skG.position.set(KX, KY, KZ); skG.add(sk.group); g.add(skG); { const pl = box(.8, KY, 2.7, std(0x241a3a), 0, -KY / 2, -.3, skG); pl.receiveShadow = true; }
  { const s = sign('SKEE-BALL', 1.4, .34); s.position.set(-HX + .03, 2.72, KZ - .3); s.rotation.y = Math.PI / 2; hall.add(s); }
  sk.on('score', e => { K.flash(e.pts + '!'); K.snd('rim', _p.set(O.x + KX, 1.5, O.z + KZ - 1.4), 4, 1.6); }).on('gutter', () => K.flash('GUTTER')).on('throw', () => K.snd('bounce', _p.set(O.x + KX, KY, O.z + KZ), 3, .8)).on('gameover', e => K.flash('SKEE-BALL ' + e.score));
  const skee = { t0: -1, prev: new V3(), has: false };
  function skeeFrame(dt) { const h = hand();
    if (sk.state.mode === 'aim') { if (h) { skG.updateMatrixWorld(true); const l = sk.group.worldToLocal(_p.copy(h.pos)); sk.setAim(l.x, l.z);
        if (skee.has && dt > 0) { const vz = (l.z - skee.prev.z) / dt, vx = (l.x - skee.prev.x) / dt; if (vz < -1.3 && l.z < 1.0 && l.y < .5) { sk.throwBall(Math.hypot(vx, vz) * 1.15, Math.atan2(vx, -vz)); K.buzz(h, .5, 40); } } skee.prev.copy(l); skee.has = true; }
      else { K.camera.getWorldPosition(_p); K.camera.getWorldDirection(_d); sk.aimWithRay(new T.Ray(_p.clone(), _d.clone())); } } else skee.has = false; }
  // ---- pool: THE LAST CHANCE's 8 ft table, its balls' own sums, its cue and its game to eight against the house
  const QX = 3.4, QZ = 5.4; SR.pool = { x: O.x + QX, z: O.z + QZ }; SG.camera = K.camera; LOOK.walnut = K.ptex('wood_d', 2, 2); LOOK.velvet = K.ptex('felt_d', 6, 6); LOOK.velvetN = K.ptex('felt_n', 6, 6, false);
  SG.audio = { play: (n, k) => K.snd(n === 'pocket' ? 'step' : 'bounce', _p.set(O.x + QX, .85, O.z + QZ), n === 'pocket' ? 5 : 1.5 + k * 5, n === 'cushion' ? 2.5 : 4.5) };
  const pool = buildPool(K.scene, { solids: K.solids }), cue = pool.cues[0]; for (const c of pool.cues) { K.scene.add(c.obj); c.obj.visible = false; } pool.group.visible = false; pool.auto = true;
  const qC = K.cv(256, 128), qT = K.tex(qC); { const m = new T.Mesh(new T.PlaneGeometry(1.2, .6), lit(qT)); m.position.set(HX - .03, 2.2, QZ); m.rotation.y = -Math.PI / 2; hall.add(m);
    const s = sign('POOL', 1.0, .34); s.position.set(HX - .03, 2.72, QZ); s.rotation.y = -Math.PI / 2; hall.add(s); }
  const pq = { held: false, use: false, sig: '' }, hd = { xr: false, use: false, pulse() { }, vs: new V3() };
  function poolFrame(dt, on) { SG.t = K.t; pool.update(dt); const st = pool.state(), sig = st.on + st.turn + st.you + st.them; if (sig !== pq.sig) { pq.sig = sig; led(qC, qT, st.on ? (st.turn === 'you' ? 'YOUR SHOT' : 'THE HOUSE SHOOTS') : 'FIRST TO 8', st.you + ' - ' + st.them); }
    if (!on) { if (pq.held) { pq.held = false; cue.goHome(); } return; }
    if (!pq.held) { pq.held = true; cue.onGrab({ xr: !!K.mode }); if (!st.on) pool.challenge('house', 0, .5); }
    const h = hand(); hd.xr = !!h; hd.use = pq.use; hd.pulse = (a, ms) => K.buzz(h, a, ms);
    if (h) { const o = K.hands.find(q => q !== h && q.src), ob = cue.obj; if (o && o.pos.distanceTo(h.pos) < 1.1 && o.pos.distanceTo(h.pos) > .15) { _d.subVectors(o.pos, h.pos).normalize(); ob.quaternion.setFromUnitVectors(_p.set(0, 0, -1), _d); }   // the other hand is the bridge: the cue lies along the two
      else h.grip.getWorldQuaternion(ob.quaternion); _d.set(0, 0, 1).applyQuaternion(ob.quaternion); ob.position.copy(h.pos).addScaledVector(_d, .22); }
    pool.cueHeld(cue, dt, hd); }
  // ---- THE MARKET's furniture (its bookstore's and its bar's, picked by the build into market.json): a lounge by the television, shelves of books
  const tvC = K.cv(160, 120), tvT = K.tex(tvC, { aniso: false }), tv = { v: null, on: false, t: 0 };
  { const cab = scan('wood', 1, 1, { color: 0x8a6a4a, roughness: .8 }), tg = new T.Group(); tg.position.set(5.9, 0, -7.9); tg.rotation.y = -Math.PI / 4; hall.add(tg);
    box(.95, .55, .5, cab, 0, .275, 0, tg); box(.86, .66, .5, cab, 0, .9, 0, tg); const scr = new T.Mesh(new T.PlaneGeometry(.6, .46), new T.MeshBasicMaterial({ map: tvT })); scr.position.set(-.08, .92, .256); tg.add(scr); box(.12, .46, .01, std(0x2a2623), .32, .92, .256, tg);
    for (const y of [1.04, .9]) { const k = new T.Mesh(new T.CylinderGeometry(.025, .025, .02, 12).rotateX(Math.PI / 2), std(0xb9b2a2, { metalness: .6, roughness: .5 })); k.position.set(.32, y, .27); tg.add(k); }
    const glow = new T.PointLight(0x9fb8e8, 1.6, 4, 2); glow.position.set(0, .95, .8); tg.add(glow);
    const x = tvC.getContext('2d'), snow = () => { const d = x.createImageData(160, 120); for (let i = 0; i < d.data.length; i += 4) { const v = 30 + Math.random() * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); tvT.needsUpdate = true; }; snow(); tv.snow = snow; tv.x = x;
    // THE MARKET's channels (data/tv.json), each show streamed from the website; snow where it cannot come
    fetch('ball-assets/tv.json').then(r => r.json()).then(ch => { const shows = ch.flatMap(c => c.shows || []); if (!shows.length) return; let i = Math.floor(Date.now() / 6e5) % shows.length;
      const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.playsInline = true; v.muted = true; v.preload = 'none'; const next = () => { const s = shows[i++ % shows.length]; v.src = '/film/' + s.id + '/' + s.file; v.play().catch(() => { }); }; v.addEventListener('ended', next); v.addEventListener('playing', () => { tv.on = true; }); v.addEventListener('error', () => { tv.on = false; });
      tv.v = v; K.gesture.push(next); }).catch(() => { }); }
  fetch('ball-assets/market.json').then(r => r.json()).then(j => { const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)), M = new T.MeshStandardMaterial({ vertexColors: true, roughness: .9 }), col = new T.Color(), geo = {};
    for (const n in j) { const q = j[n], s = new Int16Array(b64(q.p).buffer), P = new Float32Array(s.length), c8 = b64(q.c), C = new Float32Array(c8.length); for (let i = 0; i < s.length; i++) P[i] = (s[i] + 32500) * q.sc + q.lo[i % 3];
      for (let i = 0; i < c8.length; i += 3) { col.setRGB(c8[i] / 255, c8[i + 1] / 255, c8[i + 2] / 255, T.SRGBColorSpace); C[i] = col.r; C[i + 1] = col.g; C[i + 2] = col.b; }
      let b = new T.BufferGeometry(); b.setAttribute('position', new T.BufferAttribute(P, 3)); b.setAttribute('color', new T.BufferAttribute(C, 3)); b.setIndex(new T.BufferAttribute(q.i32 ? new Uint32Array(b64(q.i).buffer) : new Uint16Array(b64(q.i).buffer), 1)); b = b.toNonIndexed(); b.computeVertexNormals(); b.computeBoundingBox();
      const bb = b.boundingBox; b.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); geo[n] = b; }
    const put = (n, x, z, ry = 0, y = 0, solid) => { if (!geo[n]) return; const m = K.shadowOn(new T.Mesh(geo[n], M)); m.position.set(x, y, z); m.rotation.y = ry; hall.add(m); if (solid) K.solids.push({ x0: O.x + x - solid, x1: O.x + x + solid, z0: O.z + z - solid, z1: O.z + z + solid }); return m; };
    put('rug2', 4.6, -6.2, .78, .004); put('armchair', 3.6, -6.9, 1.9, 0, .4); put('armchair', 5.2, -5.0, 2.9, 0, .4); put('sidetable', 4.2, -5.4, 0, 0, .25); put('bookstack', 4.2, -5.4, .5, .51); put('floorlamp', 6.5, -5.8, 0); put('plant', 6.4, -8.4, 0);
    // the shelves' books: stood on each shelf the model has, one draw a case
    const lv = []; if (geo.alcove) { const P = geo.alcove.attributes.position, N = geo.alcove.attributes.normal, seen = {}; for (let i = 0; i < P.count; i += 3) { const y = Math.round(P.getY(i) * 50) / 50; if (N.getY(i) > .9 && y > .5 && y < 1.95 && Math.abs(P.getX(i) - P.getX(i + 1)) + Math.abs(P.getX(i) - P.getX(i + 2)) > .5) seen[y] = 1; } for (const y in seen) lv.push(+y); lv.sort((a, b) => a - b); }
    const bookG = new T.BoxGeometry(1, 1, 1), bookM = new T.MeshStandardMaterial({ roughness: .95 }), rnd = (a, b) => a + Math.random() * (b - a), mm = new T.Matrix4(), qq = new T.Quaternion(), ss = new V3(), pp = new V3();
    for (let k = 0; k < 4; k++) { const a = put('alcove', -HX + .19, -7.6 + k * 1.02, Math.PI / 2); if (!a || !lv.length) continue; const list = [];
      lv.forEach((y, li) => { const top = (lv[li + 1] || y + .3) - y - .04; for (let x = -.43; x < .41;) { if (Math.random() < .12) { x += rnd(.04, .12); continue; } const w = rnd(.022, .05), hh = Math.min(top, rnd(.17, .25)); list.push([x + w / 2, y + hh / 2, w, hh, rnd(.12, .16)]); x += w + .003; } });
      const im = new T.InstancedMesh(bookG, bookM, list.length); list.forEach(([x, y, w, hh, d], i) => { mm.compose(pp.set(x, y, -.02), qq, ss.set(w, hh, d)); im.setMatrixAt(i, mm); im.setColorAt(i, col.setHSL(Math.random(), rnd(.25, .55), rnd(.18, .42))); }); im.castShadow = im.receiveShadow = true; a.add(im); }
    for (const [x, y, z] of [[6.5, 1.5, -5.8], [-HX + .3, 1.2, -1.5]]) { const l = new T.PointLight(0xffc98a, 9, 6, 2); l.position.set(x, y, z); hall.add(l); }   // the floor lamp and the table lamp are lit
    K.patchMat(bookM); put('tubchair', -5.7, -3.0, 1.2, 0, .38); put('sideboard', -HX + .3, -1.9, Math.PI / 2, 0); put('globe', -HX + .3, -2.1, 0, .85); put('tablelamp', -HX + .3, -1.5, 0, .85);
    put('jukebox', -1.8, HZ - .34, Math.PI, 0, .45); put('palm', -6.3, 8.3, 0); put('palm', 6.3, 8.3, 1); put('radiator', HX - .06, -3.2, -Math.PI / 2, .1); put('clock', 0, -HZ + .07, 0, 3.15); put('stool', 5.0, 2.6, 0); put('stool', 1.9, 6.6, 0); put('stool', 5.2, 7.4, 0);
    K.patchMat(M); furnished = true; }).catch(() => { });
  let at = '', furnished = false;
  const near = (hp, x, z, r) => Math.hypot(hp.x - O.x - x, hp.z - O.z - z) < r, SPOT = { pp: [PX, PZ + 2.0], air: [AX, AZ + AIR.L + .4], skee: [KX, KZ + 1.3], pool: [QX, QZ + 1.9] };
  function show(only) { hall.visible = !only; ppG.visible = !only || only === 'pp'; airG.visible = !only || only === 'air'; skG.visible = !only || only === 'skee'; const q = !only || only === 'pool'; pool.group.visible = q; for (const c of pool.cues) c.obj.visible = q; }
  return { name: 'Clubhouse', help: 'walk through a door, or up to a table · click or <kbd>Space</kbd> plays (hold for power at skee-ball and pool)', touch: 'Walk through a door or up to a table; <b>Swing</b> plays, held for power.', PP, air, O, doors, sk, pool, lamps, tv, hall, get furnished() { return furnished; },
    action() { if (at === 'pp') PP.action(); else if (at === 'air' && air.over) airStart(); else if (at === 'skee') { if (sk.state.mode === 'aim') skee.t0 = K.t; else if (sk.state.balls <= 0) sk.startGame(); } else if (at === 'pool') { pq.use = true; if (!pool.state().on && !pool.busy()) pool.challenge('house', 0, .5); } },
    release() { if (at === 'skee' && skee.t0 >= 0) { sk.throwBall(2.5 + 2.2 * Math.min(1, (K.t - skee.t0) / 1.1), 0); skee.t0 = -1; } pq.use = false; },
    step(hs) { if (at === 'pp') PP.step(hs); }, sim(dt) { if (at === 'pp') PP.sim(dt); }, get at() { return at; },
    frame(t, dt) { const hp = K.headPos(), ar = K.mode === 'ar'; if (!ar) for (const d of doors) if (near(hp, d.x, -HZ + .9, .75)) { K.setSport(d.id); return; }
      const want = ar ? K.arPick : near(hp, PX, PZ + 2.1, 1.5) ? 'pp' : near(hp, AX, AZ + AIR.L + .45, 1.1) ? 'air' : near(hp, KX, KZ + 1.25, .9) ? 'skee' : near(hp, QX, QZ, 2.3) && !near(hp, AX, AZ + AIR.L + .45, 1.1) ? 'pool' : at === 'skee' && near(hp, KX, KZ + 1.25, 1.5) ? 'skee' : at === 'pp' && near(hp, PX, PZ + 2.1, 2.4) ? 'pp' : at === 'air' && near(hp, AX, AZ + AIR.L + .45, 1.7) ? 'air' : '';
      if (want !== at) { if (at === 'pp') PP.setOn(false); at = want; if (at === 'pp') PP.setOn(true); if (at === 'air') { airStart(); K.flash('AIR HOCKEY'); } if (at === 'skee' && (sk.state.balls <= 0 || sk.state.mode === 'over' || !sk.state.throws)) { sk.startGame(); K.flash('SKEE-BALL'); } if (at === 'pool') K.flash('POOL'); }
      if (at === 'pp') PP.frame(t, dt); if (at === 'air') airFrame(dt); if (skG.visible) sk.update(dt); if (at === 'skee') skeeFrame(dt); if (pool.group.visible) poolFrame(dt, at === 'pool');
      if (hall.visible && t - tv.t > .1) { tv.t = t; if (tv.on && tv.v && tv.v.readyState >= 2) { try { tv.x.drawImage(tv.v, 0, 0, 160, 120); tvT.needsUpdate = true; } catch (e) { tv.on = false; } } else tv.snow(); } },
    enter() { const ar = K.mode === 'ar', only = ar ? (SPOT[K.arPick] ? K.arPick : 'pp') : ''; K.venue = 'room'; g.visible = true; show(only); K.BND.cx = O.x; K.BND.cz = O.z; K.BND.x = HX - .4; K.BND.z = HZ - .4;
      if (only) K.rig.position.set(O.x + SPOT[only][0], 0, O.z + SPOT[only][1]); else K.rig.position.set(O.x, 0, O.z + 7.4); lamps.forEach((l, i) => { l.castShadow = K.mode ? i === 1 : !K.coarse; }); airBoard(); led(ppC, ppT, 'WALK UP TO PLAY', '0 - 0'); if (tv.v && !ar) tv.v.play().catch(() => { }); },
    leave() { g.visible = false; show(''); pool.group.visible = false; for (const c of pool.cues) c.obj.visible = false; if (at === 'pp') PP.setOn(false); pq.held = false; cue.goHome(); at = ''; if (tv.v) tv.v.pause(); },
    goto(w) { const p = SPOT[w]; K.rig.position.set(O.x + p[0], 0, O.z + p[1]); } };
}
