// the asylum's sound: recorded steps, doors, breath, growls and screams (snd.js), placed in the rooms; only the tubes' hum, sparks, the heart and the surge are made in the page
import { SND } from './snd.js';

let ac = null, out, wet, noiseBuf, voices = {}, lastStep = -1;
const B = {}, now = () => ac.currentTime, pick = (n, k) => n + (Math.random() * k | 0);
export const A = { on: false, ready: false, init, listener, step, creak, slam, rattle, bang, sting, scream, whisper, pickup, click, spark, squeak, drawer, surge, alarm, heart, breath, buzz, tv, boiler, drip, thud, stopAll, mute, croak, gasp, ring };

function init() {
  if (ac) { ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)(); A.on = true;
  out = ac.createGain(); out.gain.value = .9; const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; out.connect(comp).connect(ac.destination);
  const n = ac.sampleRate * 2; noiseBuf = ac.createBuffer(1, n, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const ir = ac.createBuffer(2, ac.sampleRate * 3.2, ac.sampleRate); for (let c = 0; c < 2; c++) { const b = ir.getChannelData(c); let lp = 0; for (let i = 0; i < b.length; i++) { lp += ((Math.random() * 2 - 1) - lp) * .35; b[i] = lp * Math.pow(1 - i / b.length, 3.2) * (i < 900 ? i / 900 : 1); } }
  const conv = ac.createConvolver(); conv.buffer = ir; wet = ac.createGain(); wet.gain.value = .55; wet.connect(conv).connect(out);
  voices.heart = { rate: 0, next: 0, br: 0 };
  voices.buzz = [0, 1, 2].map(() => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 120; return loop(o, { type: 'bandpass', f: 2400, q: 1.5 }, [0, 0, 0]); });
  voices.tv = loop(noise(), { type: 'highpass', f: 1800, q: .5 }, [22.3, 1, 18.5]);
  const k1 = ac.createOscillator(), k2 = ac.createOscillator(), kg = ac.createGain(), kf = ac.createBiquadFilter(), gate = ac.createOscillator(), gg = ac.createGain(); k1.type = k2.type = 'sawtooth'; k1.frequency.value = 392; k2.frequency.value = 415; kf.type = 'bandpass'; kf.frequency.value = 900; kf.Q.value = 1.2;
  gate.type = 'square'; gate.frequency.value = .9; gg.gain.value = .5; kg.gain.value = .5; gate.connect(gg).connect(kg.gain); voices.alarm = ac.createGain(); voices.alarm.gain.value = 0; k1.connect(kf); k2.connect(kf); kf.connect(kg).connect(voices.alarm); voices.alarm.connect(out); voices.alarm.connect(wet); k1.start(); k2.start(); gate.start();
  Promise.all(Object.entries(SND).map(([k, u8]) => ac.decodeAudioData(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)).then(b => { B[k] = b; }, () => {}))).then(() => {
    A.ready = true; voices.amb = bed('amb', .5); voices.hell = bed('hell', 0); voices.machine = loop(src('machine'), { type: 'lowpass', f: 1200, q: .5 }, [33.3, 1, 5]); voices.patient = null; });
}
function mute(m) { if (ac) out.gain.setTargetAtTime(m ? 0 : .9, now(), .1); }
function noise() { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.loopStart = Math.random(); return s; }
function src(name) { const s = ac.createBufferSource(); s.buffer = B[name]; s.loop = true; return s; }
function bed(name, g) { const s = src(name), gn = ac.createGain(); gn.gain.value = g; s.connect(gn); gn.connect(out); gn.connect(wet); s.start(); return gn; }
function panner(p) { const pn = ac.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 1.2; pn.rolloffFactor = 1.6; pn.maxDistance = 40; place(pn, p); return pn; }
function place(pn, p) { if (pn.positionX) { const t = now(); pn.positionX.setTargetAtTime(p[0], t, .05); pn.positionY.setTargetAtTime(p[1], t, .05); pn.positionZ.setTargetAtTime(p[2], t, .05); } else pn.setPosition(p[0], p[1], p[2]); }
function loop(s, f, p) { const fl = ac.createBiquadFilter(); fl.type = f.type; fl.frequency.value = f.f; fl.Q.value = f.q; const g = ac.createGain(); g.gain.value = 0; const pn = panner(p); s.connect(fl).connect(g).connect(pn); pn.connect(out); pn.connect(wet); s.start(); return { g, pn, fl }; }
function dest(p) { if (!p) return out; const pn = panner(p); pn.connect(out); pn.connect(wet); return pn; }
function play(name, p, gain = 1, rate = 1, delay = 0, lp = 0) {
  if (!ac || !B[name]) return 0; const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = B[name]; s.playbackRate.value = rate * (.96 + Math.random() * .08); g.gain.value = gain; let node = s;
  if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; node.connect(f); node = f; } node.connect(g); const d = dest(p); g.connect(d); if (!p) { const w = ac.createGain(); w.gain.value = .35; g.connect(w).connect(wet); } s.start(now() + delay); return B[name].duration / rate;
}
function burst(p, { dur = .2, f = 800, q = 1, type = 'bandpass', gain = .5, attack = .005 }) {
  if (!ac) return; const s = noise(), fl = ac.createBiquadFilter(), g = ac.createGain(), t = now(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur); s.connect(fl).connect(g).connect(dest(p)); s.start(t); s.stop(t + dur + .05);
}
function tone(p, { type = 'sine', f = 200, f2 = 0, dur = .3, gain = .3, attack = .005 }) {
  if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = now(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(g).connect(dest(p)); o.start(t); o.stop(t + dur + .05);
}
const sub = (p, g = 1) => tone(p, { f: 62, f2: 30, dur: .7, gain: .9 * g });
function listener(pos, fwd) {
  if (!ac) return; const l = ac.listener, t = now();
  if (l.positionX) { l.positionX.setTargetAtTime(pos.x, t, .03); l.positionY.setTargetAtTime(pos.y, t, .03); l.positionZ.setTargetAtTime(pos.z, t, .03); l.forwardX.setTargetAtTime(fwd.x, t, .03); l.forwardY.setTargetAtTime(fwd.y, t, .03); l.forwardZ.setTargetAtTime(fwd.z, t, .03); l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0; }
  else { l.setPosition(pos.x, pos.y, pos.z); l.setOrientation(fwd.x, fwd.y, fwd.z, 0, 1, 0); }
  const h = voices.heart; if (h.rate > .3 && t > h.br) h.br = t + Math.max(.9, play(pick('breath', 6), null, .12 + h.rate * .3, .9 + h.rate * .25) + .5 - h.rate * .4);
  if (h.rate > .05 && t > h.next) { h.next = t + 1.05 - h.rate * .62; tone(null, { f: 52, f2: 36, dur: .13, gain: .22 + .4 * h.rate }); setTimeout(() => ac && tone(null, { f: 46, f2: 33, dur: .12, gain: .14 + .3 * h.rate }), 140); }
}
function step(run) { let k; do k = Math.random() * 3 | 0; while (k === lastStep); lastStep = k; play('step' + k, null, run ? .5 : .3, run ? 1.08 : .92, 0, 3200); }
function creak(p, long) { long ? play(pick('creak', 2), p, 1.1, .8) : play(Math.random() < .5 ? 'dooropen' : 'creak1', p, .7, .95); }
function slam(p) { play('slam0', p, 1.5, .7); play('doorclose', p, 1, .8); sub(p); }
function rattle(p) { play('rattle', p, .9); play('lock', p, .6, 1, .18); play('lock', p, .5, 1.1, .36); }
function bang(p, g = 1) { play('slam1', p, 1.4 * g, .62); play('metalhit', p, .5 * g, .6); sub(p, g); }
function thud(p) { play('hit', p, .8, .6); tone(p, { f: 70, f2: 40, dur: .25, gain: .4 }); }
function sting(level = 1) { sub(null, level); play('stab', null, .9 * level, .5); play('metalhit', null, .7 * level, .32); play('bone', null, .5 * level, .7, .05); for (const f of [1244, 1319, 1865]) tone(null, { f, f2: f * .985, dur: 2.2 * level, gain: .035 * level, attack: .02 }); if (level >= 1) setTimeout(() => ac && ring(), 700); }
function scream(p) { if (p) { play('monster5', p, 1.7, .9); play('zombie0', p, 1, .8, .1); } else { play('monster3', null, 1.5, .85); play('monster0', null, 1.2, 1.1, .15); play(Math.random() < .5 ? 'scream0' : 'scream1', null, .8, 1, .25); play('bone', null, .9, .8, .5); } }
function whisper(p) { play(pick('breath', 6), p, .7, .55, 0, 2600); play(pick('breath', 6), p, .6, .5, .9, 2200); play('zombie3', p, .25, .5, 1.6, 1800); }
function pickup() { play('item', null, .45); }
function click(p) { play('click', p, .5); }
function spark(p) { for (let i = 0; i < 6; i++) setTimeout(() => burst(p, { dur: .03 + Math.random() * .07, f: 4500 + Math.random() * 3000, q: 1, type: 'highpass', gain: .5 }), i * 40 + Math.random() * 40); play('metalhit', p, .35, 1.6); }
function squeak(p) { play('creak1', p, .22, 1.9 + Math.random() * .3); }
function drawer(p) { play('metal', p, .9, .55); play('creak0', p, .6, 1.2, .1); setTimeout(() => thud(p), 1050); }
function surge() { tone(null, { type: 'sawtooth', f: 50, f2: 180, dur: 2.2, gain: .16, attack: 1.7 }); burst(null, { dur: 2.2, f: 300, q: .7, gain: .3, attack: 1.9 }); }
function alarm(on) { if (!ac) return; voices.alarm.gain.setTargetAtTime(on ? .07 : 0, now(), .05); if (voices.hell) voices.hell.gain.setTargetAtTime(on ? .6 : 0, now(), .5); }
function heart(rate) { if (!ac) return; voices.heart.rate = rate; if (voices.hell && voices.alarm.gain.value < .01) voices.hell.gain.setTargetAtTime(rate * rate * .5, now(), .6); }
function breath(p, level) { if (!ac || !A.ready) return; const t = now(); if (level > .12 && t > (voices.pt || 0)) voices.pt = t + play(pick('zombie', 5), p, .25 + level * .6, .62 + Math.random() * .12, 0, 2400) + 1.2 + Math.random() * 2.5; }
function buzz(list) { if (!ac) return; voices.buzz.forEach((v, i) => { const t = list[i]; v.g.gain.setTargetAtTime(t ? .018 : 0, now(), .04); if (t) place(v.pn, [t.x, 2.7, t.z]); }); }
function tv(on) { if (ac) voices.tv.g.gain.setTargetAtTime(on ? .1 : 0, now(), .05); }
function boiler(on) { if (ac && voices.machine) voices.machine.g.gain.setTargetAtTime(on ? 1.6 : 0, now(), .5); }
function drip(p) { play(pick('drip', 4), p, .8); }
function croak(p) { play(Math.random() < .25 ? 'monster2' : pick('zombie', 5), p, 1, .75 + Math.random() * .2); if (Math.random() < .4) play('bone', p, .5, .9, .2); }
function gasp() { play('breath0', null, .9, 1.1); }
function ring() { tone(null, { f: 6100, dur: 3.2, gain: .03, attack: .4 }); tone(null, { f: 6230, dur: 2.6, gain: .018, attack: .6 }); }
function stopAll() { if (!ac) return; alarm(false); heart(0); buzz([]); tv(false); boiler(false); if (voices.amb) voices.amb.gain.setTargetAtTime(.1, now(), 1); if (voices.hell) voices.hell.gain.setTargetAtTime(0, now(), .5); }
