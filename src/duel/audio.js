// Tiny synthesized sound set — no audio files needed.
let ctx, master;

export function initAudio() {
  if (ctx) { ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
}

function tone(f0, f1, dur, type = 'sine', vol = 1, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol = 1, lp = 1200) {
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start();
}

const S = {
  pulse: () => tone(900, 300, 0.12, 'square', 0.25),
  orb: () => tone(160, 90, 0.4, 'sawtooth', 0.35),
  missile: () => { noise(0.35, 0.3, 2500); tone(300, 700, 0.35, 'sawtooth', 0.2); },
  bouncer: () => tone(500, 1000, 0.12, 'triangle', 0.35),
  wave: () => tone(220, 440, 0.3, 'sawtooth', 0.3),
  mine: () => tone(700, 500, 0.1, 'square', 0.25),
  explode: () => { noise(0.6, 0.9, 700); tone(120, 35, 0.5, 'sine', 0.8); },
  hurt: () => tone(180, 60, 0.25, 'square', 0.5),
  hit: () => tone(1200, 1600, 0.08, 'sine', 0.4),
  block: () => tone(1500, 900, 0.1, 'triangle', 0.4),
  parry: () => { tone(1400, 2400, 0.15, 'triangle', 0.5); tone(2100, 2800, 0.15, 'sine', 0.3, 0.05); },
  bounce: () => tone(700, 500, 0.05, 'sine', 0.2),
  beep: () => tone(660, 660, 0.12, 'sine', 0.4),
  go: () => tone(990, 990, 0.35, 'sine', 0.5),
  win: () => { tone(523, 523, 0.15, 'triangle', 0.4); tone(659, 659, 0.15, 'triangle', 0.4, 0.15); tone(784, 784, 0.3, 'triangle', 0.4, 0.3); },
  lose: () => tone(400, 200, 0.5, 'sawtooth', 0.3),
  deny: () => tone(150, 140, 0.06, 'square', 0.2),
  swap: () => tone(800, 1000, 0.04, 'sine', 0.2),
  freeze: () => { tone(2400, 500, 0.5, 'triangle', 0.35); tone(3200, 900, 0.35, 'sine', 0.25, 0.04); noise(0.3, 0.25, 6000); },
  sizzle: () => noise(0.25, 0.18, 5000),
  whoosh: () => { noise(0.7, 0.5, 500); tone(90, 50, 0.6, 'sine', 0.4); },
  thunder: () => { noise(2.2, 0.9, 260); tone(70, 28, 1.6, 'sine', 0.5, 0.05); },
};

export function sfx(name) {
  try { S[name]?.(); } catch { /* audio is optional */ }
}

// Looping background bed per theme: filtered noise (rain, wind, rumble) or a low drone.
let amb = null;
const AMBIENCE = {
  rain: { type: 'highpass', freq: 1800, vol: 0.10 },
  wind: { type: 'lowpass', freq: 420, vol: 0.22, lfo: 0.13 },
  rumble: { type: 'lowpass', freq: 110, vol: 0.5, lfo: 0.3 },
  drone: { type: 'lowpass', freq: 160, vol: 0.12, drone: 55 },
};
export function setAmbience(name) {
  if (!ctx) return;
  if (amb) { amb.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); const old = amb; setTimeout(() => old.nodes.forEach((n) => { try { n.stop(); } catch { /* done */ } }), 700); amb = null; }
  const A = AMBIENCE[name];
  if (!A) return;
  const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const f = ctx.createBiquadFilter(); f.type = A.type; f.frequency.value = A.freq;
  const gain = ctx.createGain(); gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(A.vol, ctx.currentTime + 1.5);
  src.connect(f); f.connect(gain); gain.connect(master);
  const nodes = [src];
  if (A.lfo) {
    const l = ctx.createOscillator(), lg = ctx.createGain();
    l.frequency.value = A.lfo; lg.gain.value = A.freq * 0.5;
    l.connect(lg); lg.connect(f.frequency); l.start(); nodes.push(l);
  }
  if (A.drone) {
    for (const mult of [1, 1.503]) {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = A.drone * mult; og.gain.value = 0.25;
      o.connect(og); og.connect(f); o.start(); nodes.push(o);
    }
  }
  src.start();
  amb = { gain, nodes };
}
