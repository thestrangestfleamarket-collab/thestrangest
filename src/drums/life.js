// THE GARAGE's day: the hour going round, the street's people and what they think of you, talking with them (Claude Haiku and a spoken voice for a login, their own written lines otherwise), and what is kept of it all
import * as THREE from 'three';
import { buildStreet, relWord } from './street.js';
import { buildWeather } from './weather.js';
import { dressLand } from './land.js';
import CAST from './cast.json';

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const LOCAL = 'drums-street';

export function startLife({ scene, garage, sound, low, Q, readout, $ }) {
  const street = buildStreet(scene, low), weather = buildWeather(scene, low, Q.has('hold') ? 0.2 : undefined);
  const land = dressLand(scene, street, garage, low);
  const L = { street, garage, land, login: false, hour: 12, energy: 0, lastHit: -99, loud: 0, playing: false, said: [], spoken: 0, ear: null, listening: false };
  // one game hour a real minute, from the hour on your own clock
  const d0 = new Date(), start = Q.has('hour') ? +Q.get('hour') : d0.getHours() + d0.getMinutes() / 60, hold = Q.has('hold');
  let offset = 0, t0 = null, dirty = 0, lastDay = 0;

  // ---- what is kept: how you stand with each neighbour; a login's on the website, anyone else's in this browser ----
  const apply = (v) => { for (const p of street.people) { p.rel = +(v.rel && v.rel[p.id]) || 0; p.met = !!(v.met && v.met[p.id]); } L.days = v.days | 0; list(); };
  const state = () => ({ rel: Object.fromEntries(street.people.map((p) => [p.id, p.rel])), met: Object.fromEntries(street.people.map((p) => [p.id, p.met])), days: L.days | 0 });
  const save = () => { dirty = 0; const s = state(); try { localStorage.setItem(LOCAL, JSON.stringify(s)); } catch (e) { /* private window */ } if (L.login) post('/drums/save', s).catch(() => { }); };
  function list() { const el = $('folk'); if (!el) return; el.innerHTML = ''; for (const p of street.people) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = p.c.name; dd.textContent = p.met ? relWord(p.rel).toLowerCase() : 'not met yet'; el.append(dt, dd); } }
  L.ready = (async () => {
    let v = null;
    try { const r = await post('/drums/load', {}); if (r.ok) { v = await r.json(); L.login = true; } } catch (e) { /* off the website */ }
    if (!v) { try { v = JSON.parse(localStorage.getItem(LOCAL)) || {}; } catch (e) { v = {}; } }
    apply(v);
    const n = $('lognote'); if (n) n.textContent = L.login ? 'Signed in: your neighbours talk with you and remember you.' : 'Not signed in: neighbours use their own short lines.';
  })();

  // ---- a neighbour's voice: the website's, played from where they stand; nothing if it has none ----
  async function speak(p, text) {
    const sub = $('sub'); if (sub) { sub.textContent = p.c.name + ': ' + text; sub.hidden = false; clearTimeout(L.subT); L.subT = setTimeout(() => { sub.hidden = true; }, 2500 + text.length * 60); }
    if (!L.login || !sound.ctx || L.mute) return;
    try {
      const r = await post('/sushi/say', { text, speaker: p.c.speaker, pin: 'stock' }), type = r.headers.get('content-type') || '';
      if (!r.ok || !/audio/.test(type)) return;
      const raw = await r.arrayBuffer(), ac = sound.ctx; let buf;
      if (/pcm/.test(type)) { const i16 = new Int16Array(raw, 0, raw.byteLength >> 1), rate = +r.headers.get('x-rate') || 24000; buf = ac.createBuffer(1, i16.length, rate); const f = buf.getChannelData(0); for (let i = 0; i < i16.length; i++) f[i] = i16[i] / 32768; }
      else buf = await ac.decodeAudioData(raw);
      const src = ac.createBufferSource(), g = ac.createGain(), dist = Math.hypot(p.pos.x, p.pos.z);
      src.buffer = buf; g.gain.value = Math.min(1.4, 5 / Math.max(3, dist)) * (0.35 + 0.65 * garage.door.open);
      src.connect(g).connect(sound.out); src.start(); L.spoken++;
    } catch (e) { /* the words are still over their head */ }
  }

  // ---- you speak: to the caller at the door, or whoever is passing ----
  L.say = async (text) => {
    text = String(text || '').trim().slice(0, 240); if (!text) return;
    const p = street.nearest(); if (!p) { readout.show('NOBODY IS NEAR', L.now); return; }
    street.heard(p); p.busy = true; L.said.push({ to: p.id, text });
    const hh = Math.floor(L.hour), night = hh >= 22 || hh < 7;
    const st = `the hour is ${hh}:00, ${night ? 'night' : hh < 12 ? 'morning' : hh < 18 ? 'afternoon' : 'evening'}; you two stand at ${Math.round(p.rel)} out of 10 (${relWord(p.rel).toLowerCase()}); the drummer ${L.playing ? (L.loud > 0.45 ? 'has just been playing loudly' : 'has just been playing gently') : 'is not playing just now'}; the garage door is ${garage.door.open > 0.6 ? 'up' : 'mostly down'}; you ${p.state === 'visit' ? 'walked up the drive to the door' : 'are on the pavement'}`;
    let out = null;
    if (L.login) { try { const r = await post('/drums/talk', { who: p.id, say: text, state: st }); out = await r.json(); } catch (e) { out = null; } }
    p.busy = false; p.t = 0; p.hear = 22;
    if (out && out.say) { street.say(p, out.say, 'talk'); if (out.feel) street.warm(p, out.feel * 0.8); }
    else { street.say(p, street.line(p, L.playing ? 'nice' : 'hi') || '...', 'talk'); if (!p.greeted) { p.greeted = true; street.warm(p, 0.2); } if (out && out.why) readout.show(String(out.why).toUpperCase().slice(0, 40), L.now); }
    p.met = true;
  };
  // hold to talk: the browser's own recognition where it has one, else a recording written down by the website
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  L.listen = (on) => {
    if (on === L.listening) return; L.listening = on;
    if (on) {
      if (!street.nearest()) { readout.show('NOBODY IS NEAR', L.now); L.listening = false; return; }
      readout.show('LISTENING...', L.now);
      if (SR) { const r = new SR(); r.lang = 'en-US'; r.onresult = (e) => L.say(e.results[0][0].transcript); r.onerror = () => { }; try { r.start(); } catch (e) { /* already */ } L.ear = { stop: () => { try { r.stop(); } catch (e) { /* */ } } }; }
      else if (navigator.mediaDevices && window.MediaRecorder && L.login) navigator.mediaDevices.getUserMedia({ audio: true }).then((stm) => { const rec = new MediaRecorder(stm), parts = []; rec.ondataavailable = (e) => parts.push(e.data);
        rec.onstop = async () => { stm.getTracks().forEach((x) => x.stop()); try { const R = await (await fetch('/holmes/hear', { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: new Blob(parts, { type: rec.mimeType }) })).json(); if (R.text) L.say(R.text); else readout.show('NOT HEARD', L.now); } catch (e) { readout.show('NOT HEARD', L.now); } };
        rec.start(); L.ear = { stop: () => { try { rec.stop(); } catch (e) { /* */ } } }; if (!L.listening) L.ear.stop(); }).catch(() => readout.show('NO MICROPHONE', L.now));
      else readout.show(L.login ? 'NO MICROPHONE' : 'SIGN IN TO TALK ALOUD', L.now);
    } else if (L.ear) { L.ear.stop(); L.ear = null; }
  };

  // ---- a car going by: road noise through the wall, louder with the door up ----
  let carG = null;
  const carSound = () => { const ac = sound.ctx, n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let v = 0; for (let i = 0; i < n; i++) { v += (Math.random() * 2 - 1 - v) * 0.08; d[i] = v; }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(); s.buffer = b; s.loop = true; f.type = 'lowpass'; f.frequency.value = 520; carG = ac.createGain(); carG.gain.value = 0; s.connect(f).connect(carG).connect(sound.out); s.start(); };

  L.note = (vel) => { L.energy += vel; L.lastHit = L.now; };
  L.skip = () => { offset += 1; readout.show('AN HOUR ON', L.now); };
  L.now = 0; L.days = 0;
  L.weather = weather;
  L.update = (dt, now, cam) => {
    L.now = now; if (t0 === null) t0 = now;
    L.hour = (start + offset + (hold ? 0 : (now - t0) / 60)) % 24;
    const day = Math.floor((start + offset + (hold ? 0 : (now - t0) / 60)) / 24);
    if (day !== lastDay) { lastDay = day; street.dayN = day; L.days++; dirty = 1; }
    L.energy *= Math.exp(-dt / 6); L.loud = Math.min(1, L.energy / 9); L.playing = now - L.lastHit < 8;
    weather.update(dt, now, L.hour, day, cam || garage.ear);
    garage.setHour(L.hour, now, weather.now);
    land.update(dt, now, garage.sunV, garage.day, garage.dim, weather.now);
    street.update(dt, now, L.hour, { loud: L.loud, playing: L.playing, door: garage.door.open, day: garage.day });
    for (const e of street.events.splice(0)) {
      if (e.t === 'say') speak(e.p, e.text);
      else if (e.t === 'rel') { dirty = dirty || now; if (Math.abs(e.d) >= 0.3) readout.show(e.p.c.name.split(' ')[0].toUpperCase() + (e.d > 0 ? ' LIKES YOU MORE' : ' LIKES YOU LESS'), now); list(); }
    }
    if (dirty && now - dirty > 4) save();
    if (sound.ctx && sound.ctx.state === 'running') { if (!carG) carSound(); const g = Math.max(0, 1 - street.carNear / 38); carG.gain.value = g * g * (0.05 + 0.3 * garage.door.open); }
  };
  L.cast = CAST;
  return L;
}
