// Everyone in the pub talks. On a website that has minds for them (thestrangest's POST /crumbs/talk, Claude Haiku, one mind and one
'use strict';
// memory of you per character), a regular says its own line when it orders and when it is served, a patron greets you when you come
// by, and you can talk to anyone: T on a screen (type it), hold Y in a headset (say it; POST /holmes/hear writes it down). Each has
// its own voice (POST /sushi/say, ElevenLabs). Anywhere else (a file, no login) they keep their written lines and nothing is sent.
(function () {
const T = MC.talk = { url: null, voice: null, hear: null, off: false, greeted: new Set(), greetT: 0, greets: 0 };
const G = MC.game, PL = MC.player, W = MC.world, $ = MC.$, V3 = MC.V3;
if (MC.params.has('talk')) T.url = MC.params.get('talk');
else if (/^https?:/.test(location.protocol) && /^\/(crumbs|holo)/.test(location.pathname)) { T.url = '/crumbs/talk'; T.voice = '/sushi/say'; T.hear = '/holmes/hear'; }
const cast = id => (MC.castOf && MC.castOf(id)) || {};
// someone you can talk to: a regular at the bar (with its order) or a patron of the pub
const ofOrder = o => ({ id: o.reg, name: o.R.name, kind: o.R.kind, pos: new V3(o.seat.cust.x, o.seat.cust.y + 0.6, o.seat.cust.z), o });
const ofPatron = P => ({ id: P.cast.id, name: P.cast.name, kind: P.cast.kind, pos: P.pos, P });
const here = t => t.o ? G.orders.includes(t.o) : (W.patrons || []).includes(t.P);
const state = t => { const a = MC.events.active, o = t.o, c = cast(t.id), L = [G.cfg && G.cfg.title ? G.cfg.title : '', 'the hour ' + (G.clockText ? G.clockText() : ''), 'you are a ' + t.kind];
  if (o) L.push('you are at the bar and ordered ' + (o.rec && o.rec.name), 'your patience ' + Math.round(100 * o.pat / o.maxPat) + ' of 100', 'the cook has served you ' + (o.mem && o.mem.n || 0) + ' times before' + (o.mem && o.mem.last ? ', last time ' + o.mem.last : ''));
  else L.push(c.where === 'band' ? 'you are on the little stage with the band' : c.where === 'walk' ? 'you are on your feet about the pub' : c.where === 'booth' ? 'you are in the booth by the hearth' : 'you are at a table with a thimble of dew', 'the cook is run off their feet: ' + G.orders.filter(q => q.state === 'wait').length + ' waiting at the bar');
  L.push('kitchen noise ' + Math.round(G.noise) + ' of 100', 'the cook has ' + MC.money(G.tips) + ' in tips tonight'); if (a) L.push(a.type === 'cat' ? 'Biscuit the cat is prowling the kitchen' : a.type === 'snacker' ? 'Mrs. Thistle is down in the kitchen' : 'going on in the house: ' + a.type);
  return L.filter(Boolean).join(', '); };
T.ask = async function (t, say) {
  if (!T.url || T.off) return null;
  try {
    const r = await fetch(T.url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ who: t.id, say, state: state(t) }) });
    if (r.status === 401 || r.status === 404 || r.status === 403) { T.off = true; return null; }   // no login or no minds here: written lines from now on
    const j = await r.json(); return j && j.say ? String(j.say).slice(0, 240) : null;
  } catch (e) { return null; }
};
let audioQ = Promise.resolve();
T.speak = function (t, text) {
  if (!T.voice || T.off || !MC.audio.ctx || MC.opt.volume === 0) return;
  audioQ = audioQ.then(async () => {
    try {
      const c = cast(t.id), r = await fetch(T.voice, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, speaker: c.spk || 'orion', pin: 'stock' }) });
      if (!r.ok || !/pcm/.test(r.headers.get('content-type') || '')) return;
      const rate = +r.headers.get('x-rate') || 24000, buf = new Int16Array(await r.arrayBuffer()), ctx = MC.audio.ctx, ab = ctx.createBuffer(1, buf.length, rate), ch = ab.getChannelData(0);
      for (let i = 0; i < buf.length; i++) ch[i] = buf[i] / 32768;
      const src = ctx.createBufferSource(), pan = ctx.createPanner(); src.buffer = ab; src.playbackRate.value = c.rate || 1.1;   // each a little smaller and quicker in its own way: they are bugs
      pan.positionX.value = t.pos.x; pan.positionY.value = t.pos.y; pan.positionZ.value = t.pos.z; pan.refDistance = 4;
      src.connect(pan).connect(MC.audio.out || ctx.destination); if (t.P) t.P.talkT = ab.duration / (c.rate || 1.1) + 1; src.start(); await new Promise(res => { src.onended = res; });
    } catch (e) { }
  });
};
const show = (t, words, dur) => MC.say(t.name + ': “' + words + '”', dur || Math.min(9, 3 + words.length / 22));
async function line(t, say, written) {
  if (t.P) t.P.talkT = 6;
  const got = await T.ask(t, say);
  if (!got) { if (written && here(t) && G.mode === 'play') show(t, written, 4); return; }
  if (!here(t) || G.mode !== 'play') return; show(t, got); T.speak(t, got);
}
MC.on('order', o => { line(ofOrder(o), '[You have just sat down at the bar and ordered ' + o.rec.name + '. Say hello to the cook.]'); });
MC.on('served', o => { if (!o || !o.rec) return; const t = ofOrder(o); if (o.mem) o.mem.last = 'they served you ' + o.rec.name; line(t, '[The cook has just served you ' + o.rec.name + (o.tip ? ' and you tipped ' + MC.money(o.tip) : '') + '. React to the food.]'); });
MC.on('night:start', () => { T.greeted.clear(); T.greets = 0; T.greetT = 6; });

// who is nearest: a patron or a regular within a few steps
T.near = function (max = 3.2) {
  let best = null, bd = max; const c = t => { const d = PL.head.distanceTo(t.pos); if (d < bd) { bd = d; best = t; } };
  for (const o of G.orders) if (o.state !== 'out' && o.seat) c(ofOrder(o)); if (PL.head.z < -7.5) for (const P of W.patrons || []) if (P.cast) c(ofPatron(P)); return best;
};
// a patron you come up to says hello (once each a night, not all at once); with no mind to ask, its written line
T.update = function (dt) {
  if (G.mode !== 'play' || MC.paused) return; T.greetT -= dt; if (T.greetT > 0 || T.greets >= 8) return;
  const t = T.near(2.3); if (!t || !t.P || T.greeted.has(t.id)) return; T.greeted.add(t.id); T.greets++; T.greetT = 14;
  line(t, '[The cook has just come over to you in the pub. Greet them in your own way.]', cast(t.id).hello);
};
const tick0 = MC.tick; MC.tick = function (dt) { tick0(dt); T.update(dt); vr(dt); };

// ---------- on a screen: T opens a note to write on ----------
const box = document.createElement('div'); box.id = 'talkbox'; box.className = 'card recipe'; box.hidden = true;
box.innerHTML = '<i class="pin"></i><div class="who"></div><input maxlength="160" placeholder="Say something…"><small>Enter to say it · Esc to leave</small>';
document.body.appendChild(box); const inp = box.querySelector('input');
T.open = function () {
  const t = T.near(); if (!t || MC.isXR()) return false;
  if (!T.url || T.off) { const h = cast(t.id).hello; if (h) show(t, h, 4); return false; }
  T.t = t; box.querySelector('.who').textContent = 'To ' + t.name + ' the ' + t.kind; box.hidden = false; inp.value = ''; T.wasPaused = MC.paused; MC.paused = true; PL.noLock = true; if (document.exitPointerLock) document.exitPointerLock(); setTimeout(() => inp.focus(), 0); return true;
};
T.close = function () { box.hidden = true; MC.paused = !!T.wasPaused; PL.noLock = !!MC.params.has('nolock'); if (!MC.paused && PL.lockMouse) PL.lockMouse(); };
inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') T.close(); else if (e.key === 'Enter') { const s = inp.value.trim(), t = T.t; T.close(); if (s && t) { MC.say('You: “' + s + '”', 3); line(t, s); } } });
MC.on('key', code => { if (code === 'KeyT' && G.mode === 'play' && !MC.paused && box.hidden) T.open(); });
MC.talkHint = () => { if (MC.isXR() || G.mode !== 'play') return ''; const t = T.near(); return t ? 'T: talk to ' + t.name + ' the ' + t.kind : ''; };

// ---------- in a headset: hold Y (left controller) by someone and say it ----------
let rec = null, yPrev = false;
function vr() {
  if (!MC.isXR() || !T.hear || T.off) return; const s = MC.renderer.xr.getSession(); if (!s) return; let y = false;
  for (const src of s.inputSources) if (src.handedness === 'left' && src.gamepad && src.gamepad.buttons[5]) y = src.gamepad.buttons[5].pressed;
  if (y && !yPrev && !rec) { const t = T.near(3.5); if (t && navigator.mediaDevices && window.MediaRecorder) { rec = { t, parts: [], mr: null }; PL.wristNote('Listening… let go of Y when you have said it.');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(st => { if (!rec) return st.getTracks().forEach(x => x.stop()); const mr = rec.mr = new MediaRecorder(st), mine = rec; mr.ondataavailable = e => mine.parts.push(e.data);
      mr.onstop = async () => { st.getTracks().forEach(x => x.stop()); try { const r = await fetch(T.hear, { method: 'POST', credentials: 'same-origin', body: new Blob(mine.parts, { type: mr.mimeType }) }), j = await r.json(), said = j && j.text; if (said) { MC.say('You: “' + said + '”', 3); line(mine.t, said); } else MC.say('They did not catch that.', 2); } catch (e) { } };
      mr.start(); }).catch(() => { rec = null; }); } }
  if (!y && yPrev && rec) { const r = rec; rec = null; if (r.mr && r.mr.state !== 'inactive') r.mr.stop(); }
  if (rec) PL.wristNote('Listening… let go of Y when you have said it.');
  yPrev = y;
}
})();
