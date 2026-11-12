// the asylum's sound, all made in the page: the drone, the tubes, steps, doors, the patient's breath, the stings
let ac = null, out, wet, noiseBuf, voices = {};
const now = () => ac.currentTime;
export const A = { on: false, init, listener, step, creak, slam, rattle, bang, sting, scream, whisper, pickup, click, spark, squeak, drawer, surge, alarm, heart, breath, buzz, tv, boiler, drip, thud, stopAll, mute };

function init() {
  if (ac) { ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)(); A.on = true;
  out = ac.createGain(); out.gain.value = .9; const comp = ac.createDynamicsCompressor(); out.connect(comp).connect(ac.destination);
  const n = ac.sampleRate * 2; noiseBuf = ac.createBuffer(1, n, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const ir = ac.createBuffer(2, ac.sampleRate * 2.6, ac.sampleRate); for (let c = 0; c < 2; c++) { const b = ir.getChannelData(c); for (let i = 0; i < b.length; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / b.length, 2.6); }
  const conv = ac.createConvolver(); conv.buffer = ir; wet = ac.createGain(); wet.gain.value = .5; wet.connect(conv).connect(out);
  drone(); voices.heart = { rate: 0, next: 0 };
  voices.breath = loop(noise(), { type: 'bandpass', f: 700, q: 2 }, [0, 0, 0]);
  voices.buzz = [0, 1, 2].map(() => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 120; const v = loop(o, { type: 'bandpass', f: 2400, q: 1.5 }, [0, 0, 0]); return v; });
  voices.tv = loop(noise(), { type: 'highpass', f: 1800, q: .5 }, [22.3, 1, 18.5]);
  voices.boiler = loop(noise(), { type: 'lowpass', f: 90, q: 2 }, [33.3, 1, 5]); voices.boiler.g.gain.value = 1.6;
  const al = ac.createOscillator(); al.type = 'square'; al.frequency.value = 520; al.start(); voices.alarm = ac.createGain(); voices.alarm.gain.value = 0; const af = ac.createBiquadFilter(); af.type = 'lowpass'; af.frequency.value = 1400; al.connect(af).connect(voices.alarm); voices.alarm.connect(out); voices.alarm.connect(wet);
  voices.alarmOsc = al;
}
function mute(m) { if (ac) out.gain.setTargetAtTime(m ? 0 : .9, now(), .1); }
function noise() { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.loopStart = Math.random(); return s; }
function panner(p) { const pn = ac.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 1.2; pn.rolloffFactor = 1.6; pn.maxDistance = 40; place(pn, p); return pn; }
function place(pn, p) { if (pn.positionX) { const t = now(); pn.positionX.setTargetAtTime(p[0], t, .05); pn.positionY.setTargetAtTime(p[1], t, .05); pn.positionZ.setTargetAtTime(p[2], t, .05); } else pn.setPosition(p[0], p[1], p[2]); }
function loop(src, f, p) { const fl = ac.createBiquadFilter(); fl.type = f.type; fl.frequency.value = f.f; fl.Q.value = f.q; const g = ac.createGain(); g.gain.value = 0; const pn = panner(p); src.connect(fl).connect(g).connect(pn); pn.connect(out); pn.connect(wet); src.start(); return { g, pn, fl }; }
function lfo(param, rate, min, max) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = rate; g.gain.value = (max - min) / 2; o.connect(g).connect(param); o.start(); return o; }
function dest(p) { if (!p) return out; const pn = panner(p); pn.connect(out); pn.connect(wet); return pn; }
function burst(p, { dur = .2, f = 800, q = 1, type = 'bandpass', gain = .5, attack = .005, f2 = 0 }) {
  if (!ac) return; const s = noise(), fl = ac.createBiquadFilter(), g = ac.createGain(), t = now();
  fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  s.connect(fl).connect(g).connect(dest(p)); s.start(t); s.stop(t + dur + .05);
}
function tone(p, { type = 'sine', f = 200, f2 = 0, dur = .3, gain = .3, attack = .005, vib = 0 }) {
  if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = now(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  if (vib) { const v = lfo(o.frequency, vib, -f * .06, f * .06); v.stop(t + dur + .1); }
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(g).connect(dest(p)); o.start(t); o.stop(t + dur + .05);
}
function drone() {
  const g = ac.createGain(); g.gain.value = .11; g.connect(out); g.connect(wet); voices.drone = g;
  for (const f of [41, 41.6, 55.3, 82.9]) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; lfo(o.frequency, .03 + Math.random() * .05, -.4, .4); o.connect(g); o.start(); }
  const w = noise(), fl = ac.createBiquadFilter(), wg = ac.createGain(); fl.type = 'bandpass'; fl.frequency.value = 260; fl.Q.value = 3; lfo(fl.frequency, .07, -120, 120); wg.gain.value = .5; lfo(wg.gain, .11, -.3, .3); w.connect(fl).connect(wg).connect(g); w.start();
  voices.tense = ac.createGain(); voices.tense.gain.value = 0; voices.tense.connect(out); voices.tense.connect(wet);
  for (const f of [233, 247, 466.5, 495]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; lfo(o.frequency, .2 + Math.random() * .3, -3, 3); const fl2 = ac.createBiquadFilter(); fl2.type = 'lowpass'; fl2.frequency.value = 900; o.connect(fl2).connect(voices.tense); o.start(); }
}
function listener(pos, fwd) {
  if (!ac) return; const l = ac.listener, t = now();
  if (l.positionX) { l.positionX.setTargetAtTime(pos.x, t, .03); l.positionY.setTargetAtTime(pos.y, t, .03); l.positionZ.setTargetAtTime(pos.z, t, .03); l.forwardX.setTargetAtTime(fwd.x, t, .03); l.forwardY.setTargetAtTime(fwd.y, t, .03); l.forwardZ.setTargetAtTime(fwd.z, t, .03); l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0; }
  else { l.setPosition(pos.x, pos.y, pos.z); l.setOrientation(fwd.x, fwd.y, fwd.z, 0, 1, 0); }
  const h = voices.heart; if (h.rate > .02 && t > h.next) { h.next = t + 1.1 - h.rate * .7; tone(null, { f: 58, f2: 38, dur: .16, gain: .5 * h.rate + .15 }); setTimeout(() => ac && tone(null, { f: 50, f2: 34, dur: .14, gain: .35 * h.rate + .1 }), 130); }
}
function step(run, wet2) { burst(null, { dur: .09, f: wet2 ? 500 : 240 + Math.random() * 120, q: 1.2, type: 'lowpass', gain: run ? .34 : .2 }); burst(null, { dur: .03, f: 2600, q: 2, gain: run ? .08 : .04 }); }
function creak(p, long) { const d = long ? 2.4 : .9; tone(p, { type: 'sawtooth', f: 240 + Math.random() * 80, f2: 420 + Math.random() * 200, dur: d, gain: .09, vib: 9 }); tone(p, { type: 'square', f: 610, f2: 380, dur: d * .8, gain: .03, vib: 13 }); }
function slam(p) { burst(p, { dur: .5, f: 140, type: 'lowpass', gain: 1.6 }); burst(p, { dur: .12, f: 1800, gain: .5 }); tone(p, { f: 70, f2: 36, dur: .5, gain: .9 }); }
function rattle(p) { for (let i = 0; i < 4; i++) setTimeout(() => burst(p, { dur: .05, f: 1900 + Math.random() * 800, q: 4, gain: .3 }), i * 70); }
function bang(p, g = 1) { burst(p, { dur: .35, f: 200, type: 'lowpass', gain: 1.5 * g }); tone(p, { f: 95, f2: 48, dur: .4, gain: .8 * g }); burst(p, { dur: .2, f: 3000, q: 3, gain: .15 * g }); }
function thud(p) { burst(p, { dur: .3, f: 110, type: 'lowpass', gain: .9 }); }
function sting(level = 1) { for (const f of [311, 329, 622, 698, 1244]) tone(null, { type: 'sawtooth', f: f * (1 + Math.random() * .02), f2: f * .97, dur: 1.6 * level, gain: .12 * level, attack: .01, vib: 6 }); burst(null, { dur: .7 * level, f: 3200, q: .7, gain: .5 * level }); tone(null, { f: 60, f2: 30, dur: 1.2, gain: .8 * level }); }
function scream(p) { for (const [f, f2] of [[880, 540], [1320, 700], [1790, 900], [2600, 1400]]) tone(p, { type: 'sawtooth', f: f * (1 + Math.random() * .04), f2, dur: 1.3, gain: .22, attack: .02, vib: 17 }); burst(p, { dur: 1.2, f: 2400, q: .8, gain: .9, f2: 900 }); burst(p, { dur: .4, f: 150, type: 'lowpass', gain: 1.4 }); }
function whisper(p) { for (let i = 0; i < 7; i++) setTimeout(() => burst(p, { dur: .12 + Math.random() * .2, f: 1400 + Math.random() * 2600, q: 5, gain: .22, attack: .04 }), i * 190 + Math.random() * 80); }
function pickup() { tone(null, { f: 660, f2: 990, dur: .12, gain: .12 }); burst(null, { dur: .06, f: 3000, q: 2, gain: .1 }); }
function click(p) { burst(p, { dur: .03, f: 2400, q: 3, gain: .3 }); }
function spark(p) { for (let i = 0; i < 5; i++) setTimeout(() => burst(p, { dur: .04 + Math.random() * .08, f: 4000 + Math.random() * 3000, q: 1, type: 'highpass', gain: .5 }), i * 45 + Math.random() * 40); tone(p, { type: 'sawtooth', f: 100, dur: .35, gain: .25 }); }
function squeak(p) { tone(p, { type: 'triangle', f: 1500 + Math.random() * 500, f2: 1900 + Math.random() * 500, dur: .22, gain: .07, vib: 30 }); burst(p, { dur: .3, f: 300, type: 'lowpass', gain: .1 }); }
function drawer(p) { burst(p, { dur: 1.1, f: 900, f2: 300, q: 2, gain: .45, attack: .2 }); tone(p, { type: 'sawtooth', f: 180, f2: 150, dur: 1.1, gain: .08, vib: 14 }); setTimeout(() => thud(p), 1050); }
function surge() { tone(null, { type: 'sawtooth', f: 50, f2: 240, dur: 2.2, gain: .3, attack: 1.6 }); burst(null, { dur: 2.2, f: 200, f2: 3000, q: 1, gain: .4, attack: 1.8 }); }
function alarm(on) { if (!ac) return; voices.alarm.gain.setTargetAtTime(on ? .09 : 0, now(), .05); if (on && !voices.alarmLfo) { voices.alarmLfo = lfo(voices.alarmOsc.frequency, 1.1, -130, 130); } }
function heart(rate) { if (ac) { voices.heart.rate = rate; voices.tense.gain.setTargetAtTime(rate * rate * .045, now(), .3); } }
function breath(p, level) { if (!ac) return; place(voices.breath.pn, p); voices.breath.g.gain.setTargetAtTime(level * .5, now(), .2); voices.breath.fl.frequency.setTargetAtTime(500 + level * 600, now(), .2); }
function buzz(list) { if (!ac) return; voices.buzz.forEach((v, i) => { const t = list[i]; v.g.gain.setTargetAtTime(t ? .02 : 0, now(), .04); if (t) place(v.pn, [t.x, 2.7, t.z]); }); }
function tv(on) { if (ac) voices.tv.g.gain.setTargetAtTime(on ? .12 : 0, now(), .05); }
function boiler(on) { if (ac) voices.boiler.g.gain.setTargetAtTime(on ? 2.2 : 0, now(), .5); }
function drip(p) { tone(p, { f: 1500 + Math.random() * 900, f2: 700, dur: .09, gain: .12 }); }
function stopAll() { if (!ac) return; alarm(false); heart(0); breath([0, 0, 0], 0); buzz([]); tv(false); boiler(false); voices.drone.gain.setTargetAtTime(.02, now(), 1); }
