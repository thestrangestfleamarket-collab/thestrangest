// STADIUM JAM's sound: the recorded kit and guitar through an amp model, a stadium reverb and PA echo, a synthesized crowd, and synthesis as the fallback

const TONES = [
  { name: 'Clean', drive: 1.3, level: 0.85, cab: 6500 },
  { name: 'Crunch', drive: 7, level: 0.42, cab: 5200 },
  { name: 'Lead', drive: 34, level: 0.3, cab: 4300 },
];
export const TONE_NAMES = TONES.map((t) => t.name);

export const PADS = ['kick', 'snare', 'hat', 'tom1', 'tom2', 'floor', 'crash', 'ride'];

function makeNoiseBuffer(ctx, seconds) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function makeStadiumIR(ctx) {
  const sr = ctx.sampleRate, len = Math.floor(sr * 3.2);
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    const pre = Math.floor(sr * 0.03);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      const a = Math.min(0.9, 0.25 + t * 0.35); // air absorption: tail gets darker
      lp = lp * a + (Math.random() * 2 - 1) * (1 - a);
      d[i] = lp * Math.exp(-t * 2.4);
    }
    // slap-back from the far stands
    for (const [delay, gain] of [[0.19 + ch * 0.013, 0.5], [0.36 - ch * 0.02, 0.28], [0.61, 0.14]]) {
      const start = Math.floor(sr * delay);
      let l2 = 0;
      for (let i = 0; i < sr * 0.05 && start + i < len; i++) {
        l2 = l2 * 0.6 + (Math.random() * 2 - 1) * 0.4;
        d[start + i] += l2 * gain * Math.exp(-i / (sr * 0.012));
      }
    }
  }
  return buf;
}

function makeDriveCurve() {
  const n = 2048, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    // slightly asymmetric soft clip, like a tube stage
    curve[i] = Math.tanh(3 * x + 0.15) - Math.tanh(0.15);
  }
  return curve;
}

export class AudioEngine {
  constructor(opts = {}) {
    const ctx = (this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }));
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -9;
    this.limiter.knee.value = 6;
    this.limiter.ratio.value = 14;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.18;
    this.master = ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.limiter).connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeStadiumIR(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    this.reverb.connect(wet).connect(this.master);

    // far-field PA slap: your own sound coming back off the far stands
    this.pa = ctx.createDelay(1);
    this.pa.delayTime.value = 0.27;
    const paLp = ctx.createBiquadFilter();
    paLp.type = 'lowpass'; paLp.frequency.value = 2100;
    const paGain = ctx.createGain();
    paGain.gain.value = 0.17;
    this.pa.connect(paLp).connect(paGain).connect(this.master);
    paGain.connect(this.reverb);

    this.noise = makeNoiseBuffer(ctx, 2);
    this.kit = renderKit(ctx, opts.low);
    this.driveCurve = makeDriveCurve();
    this.ksCache = new Map();
    this.crowd = new CrowdSound(this);
  }

  // the recorded kit and guitar (docs/jam-credits.md); synthesis stays as the fallback
  async loadSamples() {
    const load = async (name) => {
      const [index, data] = await Promise.all([
        fetch(`/jam-assets/${name}.json`).then((r) => r.json()),
        fetch(`/jam-assets/${name}.mp3`).then((r) => r.arrayBuffer()),
      ]);
      return { index, buffer: await this.ctx.decodeAudioData(data) };
    };
    const [d, g] = await Promise.allSettled([load('drums'), load('guitar')]);
    if (d.status === 'fulfilled') {
      this.drumSamples = { buffer: d.value.buffer, map: new Map(d.value.index.s.map(([n, t, len]) => [n, [t, len]])) };
    }
    if (g.status === 'fulfilled') this.guitarSamples = { buffer: g.value.buffer, notes: g.value.index.s };
    return { drums: !!this.drumSamples, guitar: !!this.guitarSamples };
  }

  resume() {
    if (this.ctx.state !== 'running') this.ctx.resume();
  }

  // A channel is where an instrument plugs in. Remote players get a spatialized one.
  createChannel(positional) {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const send = ctx.createGain();
    send.gain.value = positional ? 0.5 : 0.35;
    input.connect(send).connect(this.reverb);
    input.connect(this.pa);
    let panner = null;
    if (positional) {
      panner = ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 2.5;
      panner.rolloffFactor = 0.8;
      input.connect(panner).connect(this.master);
    } else {
      input.connect(this.master);
    }
    return {
      input,
      setPosition(x, y, z) {
        if (!panner) return;
        if (panner.positionX) {
          const t = ctx.currentTime;
          panner.positionX.setTargetAtTime(x, t, 0.05);
          panner.positionY.setTargetAtTime(y, t, 0.05);
          panner.positionZ.setTargetAtTime(z, t, 0.05);
        } else panner.setPosition(x, y, z);
      },
      dispose() {
        input.disconnect();
        send.disconnect();
        panner?.disconnect();
      },
    };
  }

  setListener(pos, fwd, up) {
    const l = this.ctx.listener;
    if (l.positionX) {
      l.positionX.value = pos.x; l.positionY.value = pos.y; l.positionZ.value = pos.z;
      l.forwardX.value = fwd.x; l.forwardY.value = fwd.y; l.forwardZ.value = fwd.z;
      l.upX.value = up.x; l.upY.value = up.y; l.upZ.value = up.z;
    } else {
      l.setPosition(pos.x, pos.y, pos.z);
      l.setOrientation(fwd.x, fwd.y, fwd.z, up.x, up.y, up.z);
    }
  }

  // Distant firework: thump, air burst and crackle, delayed by the speed of sound.
  firework(delay, gain = 0.5) {
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const out = ctx.createGain();
    out.gain.value = gain;
    out.connect(this.master);
    out.connect(this.reverb);
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(75, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.5);
    const og = ctx.createGain();
    og.gain.setValueAtTime(1.2, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(og).connect(out);
    o.start(t); o.stop(t + 0.75);
    const burst = (at, dur, type, freq, g) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(g, at);
      ng.gain.exponentialRampToValueAtTime(0.0008, at + dur);
      src.connect(f).connect(ng).connect(out);
      src.start(at, Math.random() * 1.5);
      src.stop(at + dur + 0.02);
    };
    burst(t, 0.9, 'lowpass', 500, 1.1);
    for (let i = 0; i < 14; i++) burst(t + 0.25 + Math.random() * 0.9, 0.03, 'highpass', 3500, 0.12 + Math.random() * 0.15);
  }

  // Karplus-Strong string, rendered once per pitch and cached.
  stringBuffer(midi) {
    let hit = this.ksCache.get(midi);
    if (hit) return hit;
    const ctx = this.ctx, sr = ctx.sampleRate;
    const f = 440 * 2 ** ((midi - 69) / 12);
    const u = Math.min(1, Math.max(0, (midi - 40) / 40));
    const b = 0.5 - 0.3 * u; // loop filter blend: brighter loop for higher strings
    const N = Math.max(2, Math.round(sr / f - b));
    const dur = 4.2 - 1.8 * u;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const y = buf.getChannelData(0);
    // excitation: low-passed noise, combed by pick position
    const ex = new Float32Array(N);
    let lp = 0, mean = 0;
    for (let i = 0; i < N; i++) {
      lp = lp * 0.45 + (Math.random() * 2 - 1) * 0.55;
      ex[i] = lp;
    }
    const pickPos = Math.max(1, Math.round(N * 0.14));
    for (let i = 0; i < N; i++) {
      y[i] = ex[i] - ex[(i - pickPos + N) % N];
      mean += y[i];
    }
    mean /= N;
    for (let i = 0; i < N; i++) y[i] -= mean;
    const T60 = 5.5 - 3 * u;
    const decay = 10 ** (-3 / (f * T60));
    for (let i = N + 1; i < len; i++) y[i] = decay * ((1 - b) * y[i - N] + b * y[i - N - 1]);
    let peak = 0;
    for (let i = 0; i < Math.min(len, sr * 0.3); i++) peak = Math.max(peak, Math.abs(y[i]));
    const fade = Math.floor(sr * 0.2);
    for (let i = 0; i < len; i++) {
      y[i] /= peak || 1;
      if (i > len - fade) y[i] *= (len - i) / fade;
    }
    hit = { buf, rate: (f * (N + b)) / sr };
    this.ksCache.set(midi, hit);
    return hit;
  }
}

export class GuitarVoice {
  constructor(engine, channel, { hum = false } = {}) {
    this.engine = engine;
    const ctx = engine.ctx;
    this.in = ctx.createGain();
    if (hum) { // a live amp is never silent: faint mains hum and hiss, louder with more gain
      const h = ctx.createOscillator();
      h.frequency.value = 60;
      const h2 = ctx.createOscillator();
      h2.frequency.value = 120;
      const hg = ctx.createGain();
      hg.gain.value = 0.0005;
      const n = ctx.createBufferSource();
      n.buffer = engine.noise; n.loop = true;
      const ng = ctx.createGain();
      ng.gain.value = 0.0007;
      h.connect(hg); h2.connect(hg); hg.connect(this.in);
      n.connect(ng).connect(this.in);
      h.start(); h2.start(); n.start();
    }
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 95;
    this.pre = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    shaper.curve = engine.driveCurve;
    shaper.oversample = '4x';
    const dc = ctx.createBiquadFilter();
    dc.type = 'highpass'; dc.frequency.value = 30;
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking'; mid.frequency.value = 2300; mid.Q.value = 0.9; mid.gain.value = 4;
    this.cab = ctx.createBiquadFilter();
    this.cab.type = 'lowpass'; this.cab.Q.value = 0.8;
    const cab2 = ctx.createBiquadFilter();
    cab2.type = 'lowpass'; cab2.frequency.value = 7000;
    this.level = ctx.createGain();
    this.in.connect(hp).connect(this.pre).connect(shaper).connect(dc).connect(mid)
      .connect(this.cab).connect(cab2).connect(this.level).connect(channel.input);
    this.strings = new Array(6).fill(null);
    this.setTone(1);
  }

  setTone(i) {
    const tone = TONES[i] || TONES[1];
    const t = this.engine.ctx.currentTime;
    this.pre.gain.setTargetAtTime(tone.drive, t, 0.02);
    this.level.gain.setTargetAtTime(tone.level, t, 0.02);
    this.cab.frequency.setTargetAtTime(tone.cab, t, 0.02);
    this.tone = i;
  }

  pluck(s, midi, vel) {
    const ctx = this.engine.ctx, t = ctx.currentTime;
    this.dampString(s, 0.01);
    const src = ctx.createBufferSource();
    const smp = this.engine.guitarSamples;
    let offset = 0, length;
    if (smp) { // nearest recorded note, repitched
      let best = smp.notes[0];
      for (const n of smp.notes) if (Math.abs(n[0] - midi) < Math.abs(best[0] - midi)) best = n;
      src.buffer = smp.buffer;
      src.playbackRate.value = 2 ** ((midi - best[0]) / 12) * (1 + (Math.random() - 0.5) * 0.0015);
      offset = best[1];
      length = best[2];
    } else {
      const { buf, rate } = this.engine.stringBuffer(midi);
      src.buffer = buf;
      src.playbackRate.value = rate * (1 + (Math.random() - 0.5) * 0.0015);
    }
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400 + vel * 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime((0.25 + 0.75 * vel) * (smp ? 1.6 : 1), t);
    src.connect(lp).connect(g).connect(this.in);
    if (smp) {
      const dur = length / src.playbackRate.value;
      g.gain.setValueAtTime((0.25 + 0.75 * vel) * 1.6, t + dur - 0.08);
      g.gain.linearRampToValueAtTime(0, t + dur - 0.01);
      src.start(t, offset, length - 0.01);
    } else src.start(t);
    const pk = ctx.createBufferSource(); // plectrum click
    pk.buffer = this.engine.noise;
    const pf = ctx.createBiquadFilter();
    pf.type = 'bandpass'; pf.frequency.value = 2800 + midi * 30; pf.Q.value = 1.5;
    const pg = ctx.createGain();
    pg.gain.setValueAtTime(0.1 * vel, t);
    pg.gain.exponentialRampToValueAtTime(0.0005, t + 0.012);
    pk.connect(pf).connect(pg).connect(this.in);
    pk.start(t, Math.random()); pk.stop(t + 0.02);
    const voice = { src, g };
    this.strings[s] = voice;
    src.onended = () => {
      g.disconnect();
      if (this.strings[s] === voice) this.strings[s] = null;
    };
  }

  dampString(s, release = 0.08) {
    const v = this.strings[s];
    if (!v) return;
    const t = this.engine.ctx.currentTime;
    v.g.gain.cancelScheduledValues(t);
    v.g.gain.setTargetAtTime(0, t, release / 3);
    v.src.stop(t + release + 0.05);
    this.strings[s] = null;
  }

  damp(release) {
    for (let s = 0; s < 6; s++) this.dampString(s, release);
  }
}

// ---- drum kit: rendered once by modal synthesis, then played back like samples ----
function resonators(d, sr, partials) {
  for (const [f, a, dec, ph] of partials) {
    const w = (2 * Math.PI * f) / sr, r = Math.exp(-1 / (dec * sr));
    const k = 2 * r * Math.cos(w), r2 = r * r;
    const n = Math.min(d.length, Math.ceil(Math.log(2e-4) / Math.log(r)));
    let s2 = a * Math.sin(ph), s1 = a * r * Math.sin(w + ph);
    d[0] += s2; d[1] += s1;
    for (let i = 2; i < n; i++) { const s0 = k * s1 - r2 * s2; d[i] += s0; s2 = s1; s1 = s0; }
  }
}
// decaying noise through a one-pole low/high pass
function noiseHit(d, sr, amp, tau, lpCoef, highpass, start = 0) {
  let lp = 0;
  const n = Math.min(d.length - start, Math.floor(tau * sr * 8));
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 2 - 1;
    lp += (x - lp) * lpCoef;
    d[start + i] += (highpass ? x - lp : lp) * amp * Math.exp(-i / (tau * sr));
  }
}
// circular membrane modes with a pitch drop after the strike
const MEMBRANE = [[1, 1], [1.59, 0.5], [2.14, 0.3], [2.3, 0.22], [2.65, 0.16], [2.92, 0.1], [3.16, 0.08]];
function membrane(d, sr, f0, decay, glide, glideT, amp = 1, modes = MEMBRANE.length) {
  for (let m = 0; m < modes; m++) {
    const [ratio, a] = MEMBRANE[m];
    const dec = decay / Math.sqrt(ratio * (m ? 1.6 : 1));
    let ph = Math.random() * 0.5;
    const n = Math.min(d.length, Math.floor(dec * sr * 7));
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      ph += (2 * Math.PI * f0 * ratio * (1 + glide * Math.exp(-t / glideT))) / sr;
      d[i] += Math.sin(ph) * a * amp * Math.exp(-t / dec);
    }
  }
}
function cymbal(d, sr, n, lo, hi, decay, attack) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const f = lo * (hi / lo) ** Math.random();
    p.push([f, (f / 1000) ** -0.35 * (0.4 + Math.random()), decay * (1000 / f) ** 0.5 * (0.5 + Math.random()), Math.random() * 6.28]);
  }
  resonators(d, sr, p);
  noiseHit(d, sr, attack, 0.006, 0.35, true);
}

function renderKit(ctx, low) {
  const sr = ctx.sampleRate, q = low ? 0.5 : 1;
  const mk = (dur, fn, clip) => {
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr);
    const d = buf.getChannelData(0);
    fn(d);
    let peak = 0;
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    const fade = Math.floor(sr * 0.03);
    for (let i = 0; i < d.length; i++) {
      let v = d[i] / (peak || 1);
      if (clip) v = Math.tanh(v * clip) / Math.tanh(clip);
      if (i > d.length - fade) v *= (d.length - i) / fade;
      d[i] = v * 0.95;
    }
    return buf;
  };
  return {
    kick: mk(0.7, (d) => {
      membrane(d, sr, 50, 0.22, 2.4, 0.02, 1, 1);
      membrane(d, sr, 96, 0.1, 1.2, 0.02, 0.3, 2);
      noiseHit(d, sr, 0.5, 0.004, 0.5, true); // beater click
      noiseHit(d, sr, 0.35, 0.03, 0.03, false); // shell thud
    }, 1.8),
    snare: mk(0.6, (d) => {
      membrane(d, sr, 186, 0.1, 0.25, 0.015, 0.8, 5);
      noiseHit(d, sr, 0.9, 0.003, 0.5, true); // crack
      noiseHit(d, sr, 0.75, 0.085, 0.22, true); // snare wires
      noiseHit(d, sr, 0.16, 0.22, 0.3, true); // wire rattle tail
    }, 1.3),
    tom1: mk(0.9, (d) => { membrane(d, sr, 172, 0.3, 0.35, 0.05); noiseHit(d, sr, 0.35, 0.006, 0.25, false); }, 1.2),
    tom2: mk(1.0, (d) => { membrane(d, sr, 132, 0.36, 0.35, 0.055); noiseHit(d, sr, 0.35, 0.007, 0.22, false); }, 1.2),
    floor: mk(1.4, (d) => { membrane(d, sr, 84, 0.5, 0.32, 0.06); noiseHit(d, sr, 0.35, 0.008, 0.18, false); }, 1.2),
    hat: mk(0.16, (d) => cymbal(d, sr, 110 * q, 2800, 16000, 0.03, 0.5)),
    hatOpen: mk(1.1, (d) => cymbal(d, sr, 140 * q, 2500, 16000, 0.3, 0.4)),
    crash: mk(3.2, (d) => cymbal(d, sr, 260 * q, 320, 15500, 1.25, 0.6)),
    ride: mk(2.8, (d) => {
      cymbal(d, sr, 150 * q, 420, 12000, 1.5, 0.25);
      const ping = [];
      for (let i = 0; i < 8; i++) ping.push([2600 + Math.random() * 2800, 5, 0.2 + Math.random() * 0.2, Math.random() * 6]);
      ping.push([528, 2.5, 1.4, 0], [792, 2, 1.1, 1]);
      resonators(d, sr, ping);
    }),
  };
}

const SAMPLE_KEY = { kick: 'k', snare: 's', tom1: 't1', tom2: 't2', floor: 'ft', hat: 'hc', hatOpen: 'ho', crash: 'cr', ride: 'rd' };
const SAMPLE_GAIN = { kick: 1.5, snare: 1.25, tom1: 1.2, tom2: 1.2, floor: 1.2, hat: 0.9, hatOpen: 0.9, crash: 1.0, ride: 0.9 };
const PAD_GAIN = { kick: 1.35, snare: 1.0, tom1: 1.0, tom2: 1.0, floor: 1.05, hat: 0.5, hatOpen: 0.5, crash: 0.75, ride: 0.6 };

export class DrumVoice {
  constructor(engine, channel) {
    this.engine = engine;
    const ctx = engine.ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.95;
    this.out.connect(channel.input);
    this.openHat = null;
  }

  hit(pad, vel, open) {
    const ctx = this.engine.ctx, t = ctx.currentTime;
    const name = pad === 'hat' && open ? 'hatOpen' : pad;
    const smp = this.engine.drumSamples;
    const buf = smp ? smp.buffer : this.engine.kit[name];
    if (!buf) return;
    if (pad === 'hat' && this.openHat) { // closing the hats chokes the ring
      this.openHat.gain.cancelScheduledValues(t);
      this.openHat.gain.setTargetAtTime(0, t, 0.012);
      this.openHat = null;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.02 + (vel - 0.6) * 0.012; // harder hits ring slightly sharp
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200 + vel * vel * 19000; // soft hits are darker, like a real drum
    const g = ctx.createGain();
    src.connect(lp).connect(g).connect(this.out);
    if (smp) { // three recorded velocity layers, two takes each, alternated
      const layer = vel < 0.4 ? 0 : vel < 0.75 ? 1 : 2;
      this.rr = (this.rr || 0) ^ 1;
      const [at, len] = smp.map.get(`${SAMPLE_KEY[name]}.${layer}.${this.rr}`);
      const lo = [0, 0.4, 0.75][layer], hi = [0.4, 0.75, 1][layer];
      const level = SAMPLE_GAIN[name] * (0.55 + 0.45 * ((vel - lo) / (hi - lo))) * [0.45, 0.75, 1][layer];
      lp.frequency.value = 6000 + vel * 14000;
      g.gain.setValueAtTime(level, t);
      g.gain.setValueAtTime(level, t + len - 0.06);
      g.gain.linearRampToValueAtTime(0, t + len - 0.005);
      src.start(t, at, len);
    } else {
      g.gain.value = PAD_GAIN[name] * (0.1 + 0.9 * vel ** 1.5);
      src.start(t);
    }
    src.onended = () => g.disconnect();
    if (name === 'hatOpen') this.openHat = g;
  }
}

// Crowd bed: a roar layer, a cheer layer and baked applause, all following "energy".
class CrowdSound {
  constructor(engine) {
    this.engine = engine;
    const ctx = engine.ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.9;
    this.out.connect(engine.master);
    const send = ctx.createGain();
    send.gain.value = 0.25;
    this.out.connect(send).connect(engine.reverb);

    const pink = this._pinkLoop(9);
    this.roar = this._layer(pink, 'bandpass', 480, 0.45);
    this.cheerGain = this._layer(pink, 'bandpass', 1250, 0.6, 3.1);
    this.applause = this._layer(this._applauseLoop(7), 'highpass', 700, 0.5);
    this.nextWhoop = 0;
    this.boost = 0;
    this.chant = null;
    this._renderChant();
    this.setEnergy(0);
  }

  _layer(buffer, type, freq, q, offset = 0) {
    const ctx = this.engine.ctx;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(f).connect(g).connect(this.out);
    src.start(0, offset);
    return g;
  }

  _pinkLoop(seconds) {
    const ctx = this.engine.ctx, sr = ctx.sampleRate, len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(2, len, sr);
    const xf = Math.floor(sr * 0.5);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      const tmp = new Float32Array(len + xf);
      let b0 = 0, b1 = 0, b2 = 0;
      const ph = [Math.random() * 6, Math.random() * 6, Math.random() * 6];
      for (let i = 0; i < tmp.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        const t = i / sr;
        // slow swells so it sounds like a breathing mass of people, not static hiss
        const swell = 0.7 + 0.14 * Math.sin(t * 1.3 + ph[0]) + 0.1 * Math.sin(t * 3.1 + ph[1]) + 0.06 * Math.sin(t * 7.3 + ph[2]);
        tmp[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2 * swell;
      }
      for (let i = 0; i < len; i++) d[i] = tmp[i];
      for (let i = 0; i < xf; i++) {
        const a = i / xf;
        d[i] = tmp[i] * a + tmp[len + i] * (1 - a);
      }
    }
    return buf;
  }

  _applauseLoop(seconds) {
    const ctx = this.engine.ctx, sr = ctx.sampleRate, len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let n = 0; n < 9000; n++) {
        const start = Math.floor(Math.random() * len);
        const amp = 0.02 + Math.random() * 0.06;
        const tau = sr * (0.0015 + Math.random() * 0.003);
        let lp = 0;
        const k = 0.3 + Math.random() * 0.5;
        for (let i = 0; i < tau * 6; i++) {
          lp = lp * k + (Math.random() * 2 - 1) * (1 - k);
          d[(start + i) % len] += lp * amp * Math.exp(-i / tau);
        }
      }
    }
    return buf;
  }

  _whoop() {
    const ctx = this.engine.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    const f = 1500 + Math.random() * 900;
    o.frequency.setValueAtTime(f, t);
    o.frequency.linearRampToValueAtTime(f * 1.5, t + 0.25);
    o.frequency.linearRampToValueAtTime(f * 1.15, t + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.012 + Math.random() * 0.012, t + 0.08);
    g.gain.linearRampToValueAtTime(0, t + 0.7);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 2 - 1;
    o.connect(g).connect(pan).connect(this.engine.reverb);
    o.start(t);
    o.stop(t + 0.75);
  }

  // A mass "ohhh" sung by the crowd, rendered offline from detuned voices through vowel formants.
  async _renderChant() {
    try {
      const sr = this.engine.ctx.sampleRate, dur = 7;
      const off = new OfflineAudioContext(2, sr * dur, sr);
      const mix = off.createGain();
      mix.gain.value = 0.05;
      for (const [f, q, g] of [[520, 5, 1], [880, 6, 0.6], [2600, 8, 0.15]]) {
        const bp = off.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
        const fg = off.createGain();
        fg.gain.value = g;
        mix.connect(bp).connect(fg).connect(off.destination);
      }
      const notes = [110, 110, 165, 220, 220, 138.6];
      for (let i = 0; i < 42; i++) {
        const o = off.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = notes[i % notes.length] * (1 + (Math.random() - 0.5) * 0.05);
        const lfo = off.createOscillator();
        lfo.frequency.value = 4 + Math.random() * 2.5;
        const lg = off.createGain();
        lg.gain.value = o.frequency.value * 0.012;
        lfo.connect(lg).connect(o.frequency);
        const pan = off.createStereoPanner();
        pan.pan.value = Math.random() * 2 - 1;
        o.connect(pan).connect(mix);
        o.start(Math.random() * 0.2); lfo.start();
      }
      const buf = await off.startRendering();
      const xf = Math.floor(sr * 0.8), len = buf.length - xf;
      const loop = this.engine.ctx.createBuffer(2, len, sr);
      for (let ch = 0; ch < 2; ch++) {
        const a = buf.getChannelData(ch), d = loop.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = a[i];
        for (let i = 0; i < xf; i++) { const k = i / xf; d[i] = a[i] * k + a[len + i] * (1 - k); }
      }
      this.chant = this._layer(loop, 'lowpass', 3500, 0.5);
    } catch { /* chant is optional */ }
  }

  // A short roar on top of the bed, e.g. when a crash lands or someone joins.
  cheer(amount = 0.5) {
    this.boost = Math.min(1, this.boost + amount);
    for (let i = 0; i < 3; i++) setTimeout(() => this._whoop(), Math.random() * 600);
  }

  setEnergy(e) {
    const t = this.engine.ctx.currentTime;
    this.boost *= 0.985;
    e = Math.min(1, e + this.boost * 0.5);
    this.chant?.gain.setTargetAtTime(Math.max(0, e - 0.55) * 0.7, t, 0.8);
    this.roar.gain.setTargetAtTime(0.1 + 0.3 * e, t, 0.4);
    this.cheerGain.gain.setTargetAtTime(0.01 + 0.28 * e * e, t, 0.4);
    this.applause.gain.setTargetAtTime(0.02 + 0.5 * e * e, t, 0.5);
    if (e > 0.45 && t > this.nextWhoop) {
      this._whoop();
      this.nextWhoop = t + 0.3 + Math.random() * 2.5 * (1.2 - e);
    }
  }
}
