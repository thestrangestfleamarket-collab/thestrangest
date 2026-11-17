// Up to four players in one house: a room on the website (thestrangest's Crumbs room, /parties/crumbs/<code>). Each runs their own
'use strict';
// pub on the same night (same guests, same orders, same events' timing) and raids the same kitchen: you see the other mice, and the
// tips board says who is winning. The room's first player picks the night for everyone. With no website (a file), it plays solo.
(function () {
const N = MC.net = { room: null, id: null, slot: 0, host: false, peers: new Map(), connected: false, name: '', scores: {} };
const G = MC.game, PL = MC.player, W = MC.world, V3 = MC.V3;
const COLS = [0xd94f4f, 0x4f8ad9, 0xf2c14e, 0x6fb043];
const ok = /^https?:/.test(location.protocol);
N.code = () => { const A = 'abcdefghjkmnpqrstuvwxyz'; let s = ''; for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
let ws = null, retry = 1000, sendT = 0, scoreT = 0, remote = false;
const send = m => { if (N.connected && ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };

// ---------- the other mice ----------
function makeMouse(slot, name) {
  const g = new THREE.Group(), fur = new THREE.MeshStandardMaterial({ color: MC.col(0x8a8178), roughness: 1 }), pink = MC.M.pink, S = new THREE.SphereGeometry(1, 16, 12);
  const part = (mat, x, y, z, sx, sy, sz, parent = g) => { const m = new THREE.Mesh(S, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; parent.add(m); return m; };
  part(fur, 0, 0.42, 0.1, 0.34, 0.36, 0.5);                                   // body
  const head = new THREE.Group(); head.position.set(0, 0.78, -0.32); g.add(head);
  part(fur, 0, 0, 0, 0.25, 0.23, 0.28, head); part(fur, 0, -0.04, -0.26, 0.11, 0.1, 0.14, head); part(pink, 0, -0.03, -0.4, 0.04, 0.035, 0.035, head);
  for (const sd of [-1, 1]) { part(fur, sd * 0.2, 0.2, 0.05, 0.15, 0.16, 0.05, head); part(pink, sd * 0.2, 0.2, 0.02, 0.1, 0.11, 0.04, head); part(new THREE.MeshBasicMaterial({ color: 0x050505 }), sd * 0.11, 0.05, -0.2, 0.035, 0.04, 0.03, head); }
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0, 0.3, 0.55), new V3(0.1, 0.12, 0.95), new V3(-0.1, 0.1, 1.4), new V3(0.05, 0.25, 1.8)]), 16, 0.035, 6), pink); g.add(tail);
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16), new THREE.MeshStandardMaterial({ color: MC.col(COLS[slot % 4]), roughness: 1 })); scarf.position.set(0, 0.62, -0.2); scarf.rotation.x = Math.PI / 2 - 0.4; g.add(scarf);
  const paws = [-1, 1].map(sd => part(fur, sd * 0.3, 0.5, -0.35, 0.08, 0.07, 0.1));
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.font = 'bold 34px sans-serif'; x.textAlign = 'center'; x.fillStyle = 'rgba(20,14,10,0.7)'; x.fillRect(0, 8, 256, 48); x.fillStyle = '#' + COLS[slot % 4].toString(16).padStart(6, '0'); x.fillText(name, 128, 44);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, transparent: true, fog: false })); tag.scale.set(1.2, 0.3, 1); tag.position.y = 1.5; g.add(tag);
  const carry = part(new THREE.MeshStandardMaterial({ color: MC.col(0xd8b06a), roughness: 0.9 }), 0, 0.62, -0.5, 0.13, 0.11, 0.13); carry.visible = false;
  MC.scene.add(g); return { g, head, paws, carry, to: new V3(0, -50, 0), yaw: 0, pitch: 0, held: 0, lp: [new V3(), new V3()], t: 0 };
}
function drop(id) { const p = N.peers.get(id); if (!p) return; if (p.av) MC.scene.remove(p.av.g); N.peers.delete(id); delete N.scores[id]; MC.emit('net'); }
function peer(m) { if (N.peers.has(m.id)) return N.peers.get(m.id); const p = { id: m.id, slot: m.slot | 0, name: m.name || 'Mouse', av: null }; N.peers.set(m.id, p); MC.emit('net'); return p; }
const isHost = () => { let lo = N.slot; for (const p of N.peers.values()) lo = Math.min(lo, p.slot); return lo === N.slot; };

// ---------- the line ----------
const H = {
  welcome(m) { N.connected = true; N.id = m.id; N.slot = m.slot; for (const q of m.peers || []) peer(q); N.host = isHost(); MC.emit('net'); if (m.night) H.start(m.night); },
  'peer-join'(m) { peer(m); N.host = isHost(); if (N.host && N.night && G.mode === 'play') send({ t: 'start', n: N.night, at: Math.round(G.len - G.t) }); MC.say((m.name || 'A mouse') + ' has come into the house.', 3); },
  'peer-leave'(m) { const p = N.peers.get(m.id); if (p) MC.say(p.name + ' has gone.', 3); drop(m.id); N.host = isHost(); },
  full() { MC.say('That house is full (four mice).', 4); N.leave(); },
  pose(m) { const p = N.peers.get(m.id); if (!p) return; if (!p.av) p.av = makeMouse(p.slot, p.name); const a = m.p, v = p.av; v.to.set(a[0], a[1], a[2]); v.yaw = a[3]; v.pitch = a[4]; v.held = a[5]; v.lp[0].set(a[6], a[7], a[8]); v.lp[1].set(a[9], a[10], a[11]); v.t = 0; },
  score(m) { N.scores[m.id] = { tips: m.tips | 0, served: m.served | 0, done: !!m.done }; MC.emit('net'); },
  // the host has opened a night: everyone plays the same one
  start(m) { const n = m.n || m; N.night = n; const cfg = n.k === 'daily' ? MC.cfgDaily() : n.k === 'long' ? MC.cfgLong(n.h | 0) : MC.cfgCareer(Math.max(0, Math.min(29, n.i | 0))); N.scores = {}; remote = true; try { MC.startNight(cfg); } finally { remote = false; } MC.say('The house is open for all of you: most tips by dawn wins.', 5); },
};
function open() {
  if (!N.room) return; try { ws = new WebSocket((location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/parties/crumbs/' + encodeURIComponent(N.room)); } catch (e) { return; }
  const mine = ws;
  ws.onopen = () => { retry = 1000; mine.send(JSON.stringify({ t: 'join', name: N.name })); };
  ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } if (H[m.t]) H[m.t](m); };
  ws.onclose = () => { if (ws !== mine) return; N.connected = false; for (const id of [...N.peers.keys()]) drop(id); MC.emit('net'); if (N.room) { setTimeout(open, retry); retry = Math.min(retry * 2, 15000); } };
  ws.onerror = () => { };
}
N.available = ok;
N.join = function (room, name) { N.leave(); N.room = String(room || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24); if (!N.room || !ok) { N.room = null; return false; } N.name = String(name || 'Mouse').slice(0, 14); try { history.replaceState(null, '', location.pathname + '?room=' + N.room); } catch (e) { } open(); MC.emit('net'); return true; };
N.leave = function () { N.room = null; N.night = null; if (ws) { try { ws.close(); } catch (e) { } ws = null; } N.connected = false; for (const id of [...N.peers.keys()]) drop(id); MC.emit('net'); };
// the tips board: you and the others, best first
N.board = function () { const rows = [{ name: N.name || 'You', slot: N.slot, tips: G.tips, served: G.served, me: true }]; for (const p of N.peers.values()) { const s = N.scores[p.id] || {}; rows.push({ name: p.name, slot: p.slot, tips: s.tips || 0, served: s.served || 0 }); } return rows.sort((a, b) => b.tips - a.tips); };
N.color = s => '#' + COLS[s % 4].toString(16).padStart(6, '0');

// a night you open while in a room opens for everyone (only the host's choice counts; the others' menus say so)
const start0 = MC.startNight;
MC.startNight = function (cfg) {
  if (N.connected && N.peers.size && !remote) {
    if (!N.host) { MC.say('The first mouse in the house picks the night.', 3); return; }
    N.night = cfg.daily ? { k: 'daily' } : cfg.long ? { k: 'long', h: cfg.home } : { k: 'career', i: cfg.career | 0 }; send({ t: 'start', n: N.night });
  }
  return start0(cfg);
};
MC.on('served', () => { scoreT = 0; });
MC.on('night:end', () => { send({ t: 'score', tips: G.tips, served: G.served, done: 1 }); });
const _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
N.update = function (dt) {
  for (const p of N.peers.values()) { const v = p.av; if (!v) continue; v.t += dt; v.g.visible = v.t < 5 && v.to.y > -40; if (!v.g.visible) continue;
    const k = Math.min(1, dt * 12); v.g.position.lerp(v.to, k); let d = v.yaw - v.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); v.g.rotation.y += d * k; v.head.rotation.x += (v.pitch - v.head.rotation.x) * k; v.carry.visible = !!v.held;
    for (let i = 0; i < 2; i++) if (v.lp[i].lengthSq() > 0) v.paws[i].position.lerp(v.g.worldToLocal(v.lp[i].clone()), k); }
  if (!N.connected) return;
  sendT -= dt; if (sendT <= 0 && N.peers.size && G.mode !== 'menu') { sendT = 0.1; const r = MC.rig.position, hp = PL.hands.map(h => h.paw.pos), f = PL.fwdFull; MC.camera.getWorldQuaternion(_q); _e.setFromQuaternion(_q);
    const R = v => Math.round(v * 100) / 100; send({ t: 'pose', p: [R(r.x), R(r.y), R(r.z), R(Math.atan2(-f.x, -f.z)), R(_e.x), PL.hands.some(h => h.item) ? 1 : 0, R(hp[0].x), R(hp[0].y), R(hp[0].z), R(hp[1].x), R(hp[1].y), R(hp[1].z)] }); }
  scoreT -= dt; if (scoreT <= 0 && G.mode === 'play') { scoreT = 2; send({ t: 'score', tips: G.tips, served: G.served }); board(); }
};
// the tips board on a screen, and the result at dawn
const bd = document.createElement('div'); bd.id = 'board'; bd.hidden = true; document.body.appendChild(bd);
function board() { const on = N.connected && N.peers.size > 0 && (G.mode === 'play' || G.mode === 'dawn'); bd.hidden = !on; if (on) bd.innerHTML = N.board().map((r, i) => '<div' + (r.me ? ' class="me"' : '') + '><b style="color:' + N.color(r.slot) + '">' + (i + 1) + '</b> ' + r.name.replace(/[<>&]/g, '') + ' <span>' + MC.money(r.tips) + '</span></div>').join(''); }
MC.on('net', board); MC.on('served', board); MC.on('menu', board);
MC.on('night:end', () => { setTimeout(() => { if (!N.peers.size || G.mode !== 'dawn') return; const b = N.board(), el = MC.$('e-extra'); if (el) el.innerHTML = '<b>' + (b[0].me ? 'You win the house!' : b[0].name.replace(/[<>&]/g, '') + ' wins the house.') + '</b><br>' + b.map((r, i) => (i + 1) + '. ' + r.name.replace(/[<>&]/g, '') + ' ' + MC.money(r.tips)).join(' · ') + '<br>' + el.innerHTML; }, 4300); });
const tick0 = MC.tick; MC.tick = function (dt) { tick0(dt); N.update(dt); };
// a link with ?room=code joins it once the kitchen is built
MC.ready.then(() => { const r = MC.params.get('room'); if (r && ok) N.join(r, (MC.save && MC.save.name) || 'Mouse ' + (1 + Math.floor(Math.random() * 99))); });
})();
