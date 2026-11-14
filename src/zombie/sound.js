// EYES DOWN's sound, all made here: rain on the glass, the fridge, the radiator, the set, the phone, their wet movement, your heart; and voices spoken by the browser
import { THREE, rnd, pick, clamp } from './core.js';

const A = { c: null, on: false, beds: {}, voice: true };
const R = Math.random;
A.init = function () {
  if (this.c) { this.c.resume(); return; }
  const c = this.c = new (window.AudioContext || window.webkitAudioContext)(); this.on = true;
  this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -14; this.comp.ratio.value = 4; this.comp.connect(c.destination); this.master = this.g(.9, this.comp);
  const len = c.sampleRate * 1.2 | 0, ir = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / len, 3.5); }
  this.rev = c.createConvolver(); this.rev.buffer = ir; this.rev.connect(this.g(.5, this.master));
  const nb = this.nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = R() * 2 - 1;
  const bb = this.bn = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), bd = bb.getChannelData(0); let l = 0; for (let i = 0; i < bd.length; i++) { l = (l + .02 * (R() * 2 - 1)) / 1.02; bd[i] = l * 3.5; }
  // beds: rain at the big window and the small one, the city, the fridge, the neighbour's set through the wall, the clock
  this.beds.rain = this.bed(new THREE.Vector3(3.3, 1.6, -.1), .55, d => { this.n(this.f('highpass', 600, .5, this.f('lowpass', 7000, .4, d))); const p = this.g(.4, d); this.n(this.f('bandpass', 2500, 2, p)); });
  this.beds.rain2 = this.bed(new THREE.Vector3(5.5, 1.6, -.1), .3, d => this.n(this.f('highpass', 900, .5, d)));
  this.beds.city = this.bed(null, .12, d => { this.n(this.f('lowpass', 180, .7, d), this.bn); this.o('sine', 55, this.g(.04, d)); });
  this.beds.fridge = this.bed(new THREE.Vector3(.4, .3, .5), .09, d => { this.o('sawtooth', 50, this.f('lowpass', 160, 1, d)); this.o('sine', 100, this.g(.4, d)); });
  this.beds.neighbour = this.bed(new THREE.Vector3(-1, 1.3, 3), .05, d => { const bp = this.f('bandpass', 420, 2.5, d); const g = this.g(0, bp); this.n(g); const lfo = this.o('sine', 3.1, this.g(.5, g.gain)); this.o('square', .45, this.g(.4, g.gain)); });
  this.beds.tv = this.bed(new THREE.Vector3(4.45, .95, 3.9), 0, d => { const bp = this.f('bandpass', 900, 1.4, d), g = this.g(0, bp); this.n(g); this.tvG = g; this.tvSyl = this.o('square', 4.2, this.g(.5, g.gain)); this.tvNoise = this.g(0, d); this.n(this.f('highpass', 1500, .3, this.tvNoise)); });
  this.beds.heart = { g: this.g(0, this.master) };
  this.beds.hum = this.bed(new THREE.Vector3(5.75, 2, 3.2), .03, d => { this.o('sawtooth', 120, this.f('highpass', 800, .7, d)); });
  // the radio: a station a little off the dial (a chord that changes, a beat, static); the blender; the tap
  this.beds.radio = this.bed(new THREE.Vector3(.3, 1.05, 1.85), 0, d => { const bp = this.f('bandpass', 1100, .6, d); this.radioO = [0, 1, 2].map(() => this.o('sawtooth', 220, this.g(.05, bp))); this.radioBus = bp; this.n(this.f('highpass', 3000, .5, this.g(.04, d))); });
  this.beds.blender = this.bed(new THREE.Vector3(2.28, 1.05, .3), 0, d => { this.o('sawtooth', 118, this.f('lowpass', 2400, 1, this.g(.25, d))); this.n(this.f('bandpass', 1800, .8, this.g(.6, d))); this.o('square', 236, this.f('bandpass', 900, 3, this.g(.1, d))); });
  this.beds.tap = this.bed(new THREE.Vector3(1.85, .9, .15), 0, d => { this.n(this.f('bandpass', 2200, .5, d)); this.n(this.f('lowpass', 500, .7, this.g(.5, d))); });
  this.chord = 0; this.radioBeat = 0;
  this.tick = 0; this.beat = 0; this.sirenT = rnd(20, 60); this.clank = rnd(30, 90);
};
A.g = function (v, d) { const n = this.c.createGain(); n.gain.value = v; if (d) n.connect(d); return n; };
A.f = function (t, fr, q, d) { const n = this.c.createBiquadFilter(); n.type = t; n.frequency.value = fr; n.Q.value = q; if (d) n.connect(d); return n; };
A.o = function (t, fr, d, t0, dur) { const n = this.c.createOscillator(); n.type = t; n.frequency.value = fr; if (d) n.connect(d); n.start(t0 || 0); if (dur) n.stop((t0 || this.c.currentTime) + dur); return n; };
A.n = function (d, buf, t0, dur) { const s = this.c.createBufferSource(); s.buffer = buf || this.nb; s.loop = true; s.connect(d); s.start(t0 || 0, R() * 1.5); if (dur) s.stop((t0 || this.c.currentTime) + dur); return s; };
A.pan = function (pos, wet = .25) { const p = this.c.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = .8; p.rolloffFactor = 1.3; p.maxDistance = 40; this.setP(p, pos); p.connect(this.master); p.connect(this.g(wet, this.rev)); return p; };
A.setP = function (p, v) { if (p.positionX) { p.positionX.value = v.x; p.positionY.value = v.y; p.positionZ.value = v.z; } else p.setPosition(v.x, v.y, v.z); };
A.bed = function (pos, vol, fill) { const g = this.g(vol); if (pos) g.connect(this.pan(pos, .15)); else g.connect(this.master); fill(g); return { g, v: vol }; };
A.out = function (pos, vol = 1, wet = .3) { const g = this.g(vol); if (pos) g.connect(this.pan(pos, wet)); else { g.connect(this.master); g.connect(this.g(wet, this.rev)); } return g; };
A.env = function (p, t, a, pk, d) { p.setValueAtTime(.0001, t); p.linearRampToValueAtTime(pk, t + a); p.exponentialRampToValueAtTime(.0001, t + a + d); };
A.burst = function (d, type, fr, q, dur, vol, t) { t = t || this.c.currentTime; const g = this.g(0, d); this.env(g.gain, t, .004, vol, dur); this.n(this.f(type, fr, q, g), null, t, dur + .1); };
A.thump = function (d, f0, f1, dur, vol, t) { t = t || this.c.currentTime; const g = this.g(0, d); this.env(g.gain, t, .004, vol, dur); const o = this.o('sine', f0, g, t, dur + .1); o.frequency.exponentialRampToValueAtTime(f1, t + dur); };
A.listen = function (p, f) { if (!this.c) return; const l = this.c.listener; if (l.positionX) { l.positionX.value = p.x; l.positionY.value = p.y; l.positionZ.value = p.z; l.forwardX.value = f.x; l.forwardY.value = f.y; l.forwardZ.value = f.z; l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0; } else { l.setPosition(p.x, p.y, p.z); l.setOrientation(f.x, f.y, f.z, 0, 1, 0); } };

// one-off sounds by name
A.play = function (name, pos, vol = 1) {
  if (!this.c) return; const t = this.c.currentTime, d = this.out(pos, vol);
  switch (name) {
    case 'click': this.burst(d, 'bandpass', 3000, 3, .02, .4); this.thump(d, 900, 300, .02, .2); break;
    case 'fridgeOpen': this.burst(d, 'lowpass', 500, .7, .25, .4); this.thump(d, 120, 60, .1, .5); break;
    case 'fridgeShut': this.thump(d, 90, 45, .18, 1); this.burst(d, 'lowpass', 800, .7, .08, .5); break;
    case 'doorOpen': for (let i = 0; i < 3; i++) { const o = this.o('sawtooth', rnd(300, 500), this.f('bandpass', 1200, 6, this.g(.03, d)), t + i * .12, .2); o.frequency.linearRampToValueAtTime(rnd(200, 700), t + i * .12 + .2); } break;
    case 'doorShut': this.thump(d, 110, 40, .2, 1.2); this.burst(d, 'lowpass', 1200, .7, .06, .6); break;
    case 'chain': for (let i = 0; i < 6; i++) this.burst(d, 'bandpass', rnd(3500, 6000), 8, .03, .25, t + i * .04 + R() * .02); break;
    case 'knock': for (let i = 0; i < 3; i++) { this.thump(d, 160, 80, .09, 1.1, t + i * .28); this.burst(d, 'lowpass', 900, 1, .05, .6, t + i * .28); } break;
    case 'slither': { const g = this.g(0, d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.7, t + .3); g.gain.linearRampToValueAtTime(0, t + 1.6); const f = this.f('bandpass', 700, 2, g); this.n(f, null, t, 1.8); this.o('sine', 9, this.g(400, f.frequency), t, 1.7); break; }
    case 'wetclick': this.burst(d, 'bandpass', 1800, 6, .05, .9); this.thump(d, 400, 120, .06, .6, t + .03); break;
    case 'breathe': { const g = this.g(0, d); for (let i = 0; i < 3; i++) { g.gain.setValueAtTime(0, t + i * 1.4); g.gain.linearRampToValueAtTime(.5, t + i * 1.4 + .5); g.gain.linearRampToValueAtTime(0, t + i * 1.4 + 1.2); } this.n(this.f('bandpass', 600, 1.2, g), null, t, 4.4); break; }
    case 'drip': this.thump(d, rnd(900, 1400), 300, .04, .25); break;
    case 'shriek': { const g = this.g(0, d); this.env(g.gain, t, .05, 1.4, 2.2); for (const f of [520, 690, 913, 1380]) { const o = this.o('sawtooth', f, this.f('bandpass', f * 1.5, 2, g), t, 2.4); o.frequency.exponentialRampToValueAtTime(f * .6, t + 2.2); } this.n(this.f('highpass', 2000, .5, g), null, t, 2.3); break; }
    case 'scare': { const g = this.g(0, d); this.env(g.gain, t, .01, 2, 1.4); this.n(this.f('lowpass', 3000, .5, g), null, t, 1.5); for (const f of [80, 113, 166]) this.o('sawtooth', f, this.g(.3, g), t, 1.5); break; }
    case 'thunder': { const g = this.g(0, this.master); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9 * vol, t + .4); g.gain.exponentialRampToValueAtTime(.001, t + 6); this.n(this.f('lowpass', 140, .7, g), this.bn, t, 6.2); break; }
    case 'siren': { const g = this.g(0, d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 3); g.gain.linearRampToValueAtTime(0, t + 12); const o = this.o('triangle', 700, this.f('lowpass', 1500, .5, g), t, 12.5); for (let i = 0; i < 12; i++) { o.frequency.setValueAtTime(700, t + i); o.frequency.linearRampToValueAtTime(960, t + i + .5); o.frequency.linearRampToValueAtTime(700, t + i + 1); } break; }
    case 'clank': for (let i = 0; i < 3; i++) { const tt = t + i * rnd(.15, .5); this.burst(d, 'bandpass', rnd(1200, 2200), 12, .25, .4, tt); this.thump(d, 220, 120, .15, .4, tt); } break;
    case 'ring': for (let i = 0; i < 2; i++) { const g = this.g(0, d); g.gain.setValueAtTime(0, t + i * .5); g.gain.linearRampToValueAtTime(.18, t + i * .5 + .01); g.gain.setValueAtTime(.18, t + i * .5 + .4); g.gain.linearRampToValueAtTime(0, t + i * .5 + .42); const o1 = this.o('square', 440, this.f('lowpass', 2500, .5, g), t + i * .5, .45), o2 = this.o('square', 480, this.f('lowpass', 2500, .5, g), t + i * .5, .45); const am = this.o('square', 20, this.g(.5, g.gain), t + i * .5, .45); } break;
    case 'alarm': for (let i = 0; i < 8; i++) { const g = this.g(0, d); this.env(g.gain, t + i * .25, .005, .25, .18); this.o('square', 2400, this.f('bandpass', 2600, 4, g), t + i * .25, .22); } break;
    case 'hit': this.thump(d, rnd(140, 260), 70, .06, vol); this.burst(d, 'bandpass', rnd(800, 2500), 2, .05, vol * .6); break;
    case 'glass': for (let i = 0; i < 4; i++) { const g = this.g(0, d); this.env(g.gain, t, .002, .15, .35); this.o('sine', rnd(2500, 5000), g, t, .4); } this.burst(d, 'highpass', 4000, 1, .2, .5); break;
    case 'boil': this.burst(d, 'bandpass', 1200, 1, 2.5, .15); break;
    case 'water': this.burst(d, 'bandpass', 1600, .7, 3, .3); break;
    case 'step': this.burst(d, 'lowpass', rnd(300, 500), .7, .07, .12); break;
    case 'whoosh': this.burst(d, 'bandpass', 500, .8, .5, .5); break;
  }
};
// the heart: faster and louder as they suspect you
A.update = function (dt, tense, tvOn, tvK, sleeping) {
  if (!this.c) return; const t = this.c.currentTime;
  if (this.tvG) { this.tvG.gain.setTargetAtTime(tvOn ? .05 : 0, t, .1); this.tvNoise.gain.setTargetAtTime(tvOn && tvK > .55 ? .02 : 0, t, .1); this.beds.tv.g.gain.setTargetAtTime(tvOn ? .9 : 0, t, .2); }
  this.beat -= dt; const bpm = 64 + tense * 70; if (tense > .12 && this.beat < 0) { this.beat = 60 / bpm; const g = this.g(0, this.master); this.env(g.gain, t, .01, .25 * tense, .12); this.o('sine', 52, g, t, .2); this.env(g.gain, t + .18, .01, .16 * tense, .12); this.o('sine', 46, g, t + .18, .2); }
  this.sirenT -= dt; if (this.sirenT < 0) { this.sirenT = rnd(60, 160); this.play('siren', new THREE.Vector3(rnd(-20, 20), -60, -60), 1); }
  this.clank -= dt; if (this.clank < 0) { this.clank = rnd(40, 120); this.play('clank', new THREE.Vector3(3.3, .5, .15), .8); }
  this.beds.city.g.gain.setTargetAtTime(sleeping ? .06 : .12, t, 1);
};
// the things left running
const CH = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [247, 311, 370]];
A.devices = function (dt, st) { if (!this.c) return; const t = this.c.currentTime;
  this.beds.radio.g.gain.setTargetAtTime(st.radio ? .5 : 0, t, .05); this.beds.blender.g.gain.setTargetAtTime(st.blender ? .7 : 0, t, .03); this.beds.tap.g.gain.setTargetAtTime(st.tap ? .35 : 0, t, .08);
  if (st.radio) { this.chord -= dt; if (this.chord < 0) { this.chord = 2.2; const c = CH[Math.floor(R() * CH.length)]; this.radioO.forEach((o, i) => o.frequency.setTargetAtTime(c[i], t, .03)); }
    this.radioBeat -= dt; if (this.radioBeat < 0) { this.radioBeat = .27; this.burst(this.radioBus, 'highpass', 6000, .5, .03, .25); if ((this.rb = (this.rb || 0) + 1) % 2) this.thump(this.radioBus, 120, 50, .1, .8); } } };
A.duck = function (v) { if (this.master) this.master.gain.setTargetAtTime(v, this.c.currentTime, .3); };

/* voices: the browser speaks; a whisper is low, slow and soft */
let voices = []; const loadV = () => { try { voices = speechSynthesis.getVoices(); } catch (e) {} }; try { loadV(); speechSynthesis.onvoiceschanged = loadV; } catch (e) {}
A.say = function (text, o = {}) {
  A.onSay && A.onSay(text, o); if (!A.voice) return;
  try { const u = new SpeechSynthesisUtterance(text); const en = voices.filter(v => /^en/i.test(v.lang)); const v = o.who === 'mom' ? en.find(v => /female|samantha|victoria|zira|karen|moira/i.test(v.name)) : en.find(v => /male|daniel|fred|alex|david/i.test(v.name)); if (v || en[0]) u.voice = v || en[0];
    u.pitch = o.pitch ?? (o.whisper ? .1 : 1); u.rate = o.rate ?? (o.whisper ? .62 : .95); u.volume = o.volume ?? (o.whisper ? .55 : .8); if (o.cancel !== false) speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  if (o.whisper && this.c) { const d = this.out(o.pos, .5, .4), t = this.c.currentTime, n = text.split(/\s+/).length; for (let i = 0; i < n; i++) this.burst(d, 'bandpass', rnd(1800, 3200), 1.5, .22, .25, t + i * .32); }
};
A.hush = () => { try { speechSynthesis.cancel(); } catch (e) {} };
export { A };
