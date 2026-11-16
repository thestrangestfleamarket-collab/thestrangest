// Talking regulars: on a website that has a mind for them (thestrangest's POST /crumbs/talk, Claude Haiku), each regular says its own
'use strict';
// line when it sits down and when it is served, and on a screen you can walk up and press T to talk to one. Their voices are
// POST /sushi/say (ElevenLabs). Anywhere else (a file, no login) they keep their written lines and nothing is sent.
(function () {
const T = MC.talk = { url: null, voice: null, busy: false, off: false };
const G = MC.game, PL = MC.player, $ = MC.$;
if (MC.params.has('talk')) T.url = MC.params.get('talk');
else if (/^https?:/.test(location.protocol) && /^\/(crumbs|holo)/.test(location.pathname)) { T.url = '/crumbs/talk'; T.voice = '/sushi/say'; }
// each regular's voice on the website's speaker list
const SPK = { bo: 'zeus', moth: 'luna', joe: 'angus', antony: 'perseus', web: 'orpheus', dot: 'stella', fidd: 'helios', buzz: 'arcas', rollo: 'orion', lumen: 'asteria', pinch: 'hera', gregor: 'athena' };
const state = o => { const R = o.R, a = MC.events.active; return [G.cfg && G.cfg.name ? 'the night: ' + G.cfg.name : '', 'the hour ' + (G.clockText ? G.clockText() : ''), 'you are a ' + R.kind, 'your order: ' + (o.rec && o.rec.name), 'your patience ' + Math.round(100 * o.pat / o.maxPat) + ' of 100', 'served here ' + (o.mem && o.mem.n || 0) + ' times before', 'kitchen noise ' + Math.round(G.noise) + ' of 100', a && a.type === 'cat' ? 'the cat is prowling' : '', a && a.type !== 'cat' ? 'going on: ' + a.type : ''].filter(Boolean).join(', '); };
T.ask = async function (o, say) {
  if (!T.url || T.off) return null;
  try {
    const r = await fetch(T.url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ who: o.reg, say, state: state(o) }) });
    if (r.status === 401 || r.status === 404 || r.status === 403) { T.off = true; return null; }   // no login or no mind here: written lines from now on
    const j = await r.json(); return j && j.say ? String(j.say).slice(0, 240) : null;
  } catch (e) { return null; }
};
let audioQ = Promise.resolve();
T.speak = function (o, text) {
  if (!T.voice || !MC.audio.ctx || MC.opt.volume === 0) return;
  audioQ = audioQ.then(async () => {
    try {
      const r = await fetch(T.voice, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, speaker: SPK[o.reg] || 'orion', pin: 'stock' }) });
      if (!r.ok || !/pcm/.test(r.headers.get('content-type') || '')) return;
      const rate = +r.headers.get('x-rate') || 24000, buf = new Int16Array(await r.arrayBuffer()), ctx = MC.audio.ctx, ab = ctx.createBuffer(1, buf.length, rate), ch = ab.getChannelData(0);
      for (let i = 0; i < buf.length; i++) ch[i] = buf[i] / 32768;
      const src = ctx.createBufferSource(), pan = ctx.createPanner(); src.buffer = ab; src.playbackRate.value = 1.12;   // a little smaller and quicker: they are bugs
      pan.positionX.value = o.seat.cust.x; pan.positionY.value = o.seat.cust.y + 0.6; pan.positionZ.value = o.seat.cust.z; pan.refDistance = 4;
      src.connect(pan).connect(MC.audio.out || ctx.destination); src.start(); await new Promise(res => { src.onended = res; });
    } catch (e) { }
  });
};
async function line(o, say) {
  const got = await T.ask(o, say); if (!got || !G.orders.includes(o) || G.mode !== 'play') return;
  MC.say(o.R.name + ': “' + got + '”', Math.min(9, 3 + got.length / 22)); T.speak(o, got);
}
MC.on('order', o => { line(o, '[You have just sat down at the counter and ordered ' + o.rec.name + '. Say hello to the cook.]'); });
MC.on('served', o => { line(o, '[The cook has just served you ' + o.rec.name + (o.tip ? ' and you tipped ' + MC.money(o.tip) : '') + '. React to the food.]'); });

// ---------- on a screen: T at a seated regular opens a note to write on ----------
const box = document.createElement('div'); box.id = 'talkbox'; box.className = 'card recipe'; box.hidden = true;
box.innerHTML = '<i class="pin"></i><div class="who"></div><input maxlength="160" placeholder="Say something…"><small>Enter to say it · Esc to leave</small>';
document.body.appendChild(box); const inp = box.querySelector('input');
T.near = function () {
  let best = null, bd = 3.2; for (const o of G.orders) { if (o.state === 'out' || !o.seat) continue; const d = PL.head.distanceTo(new THREE.Vector3(o.seat.cust.x, o.seat.cust.y + 0.5, o.seat.cust.z)); if (d < bd) { bd = d; best = o; } } return best;
};
T.open = function () {
  const o = T.near(); if (!o || !T.url || T.off || MC.isXR()) return false;
  T.o = o; box.querySelector('.who').textContent = 'To ' + o.R.name + ' the ' + o.R.kind; box.hidden = false; inp.value = ''; T.wasPaused = MC.paused; MC.paused = true; PL.noLock = true; if (document.exitPointerLock) document.exitPointerLock(); setTimeout(() => inp.focus(), 0); return true;
};
T.close = function () { box.hidden = true; MC.paused = !!T.wasPaused; PL.noLock = !!MC.params.has('nolock'); if (!MC.paused && PL.lockMouse) PL.lockMouse(); };
inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') T.close(); else if (e.key === 'Enter') { const s = inp.value.trim(), o = T.o; T.close(); if (s && o) { MC.say('You: “' + s + '”', 3); line(o, s); } } });
MC.on('key', code => { if (code === 'KeyT' && G.mode === 'play' && !MC.paused && box.hidden) T.open(); });
// a hint when you stand by a regular and can talk
MC.talkHint = () => T.url && !T.off && !MC.isXR() && G.mode === 'play' && T.near() ? 'T: talk to ' + T.near().R.name : '';
})();
