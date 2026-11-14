// LASER TAG's sounds, made on the spot: the gun's shot, the supercharged whine, the pack's tag alarm, beeps, and the pack's spoken calls
let ctx = null, out = null;
export function initAudio() {
  if (ctx) { ctx.resume(); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination); } catch { ctx = null; }
}

function tone({ type = 'square', f0, f1 = f0, dur, vol = 0.3, at = 0, am = 0 }) {
  if (!ctx) return;
  const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  if (am) { const lfo = ctx.createOscillator(), lg = ctx.createGain(), mix = ctx.createGain(); lfo.frequency.value = am; lg.gain.value = 0.5; mix.gain.value = 0.5;
    lfo.connect(lg); lg.connect(mix.gain); g.connect(mix); mix.connect(out); lfo.start(t); lfo.stop(t + dur); }
  else g.connect(out);
  o.start(t); o.stop(t + dur + 0.02);
}

export const sfx = {
  shot: (at = 0) => { tone({ f0: 2200, f1: 380, dur: 0.16, vol: 0.22, at }); tone({ type: 'sawtooth', f0: 1100, f1: 200, dur: 0.12, vol: 0.08, at }); },
  whine: () => tone({ type: 'sine', f0: 2600, f1: 4200, dur: 0.45, vol: 0.12 }),
  tagged: () => { tone({ type: 'sawtooth', f0: 320, f1: 150, dur: 0.7, vol: 0.32, am: 28 }); tone({ type: 'square', f0: 980, f1: 760, dur: 0.25, vol: 0.12 }); },
  good: () => { tone({ f0: 1320, dur: 0.07, vol: 0.18 }); tone({ f0: 1760, dur: 0.1, vol: 0.18, at: 0.08 }); },
  dry: () => tone({ f0: 180, dur: 0.06, vol: 0.12 }),
  beep: () => tone({ f0: 880, dur: 0.08, vol: 0.15 }),
  warn: () => { tone({ f0: 700, dur: 0.12, vol: 0.16 }); tone({ f0: 700, dur: 0.12, vol: 0.16, at: 0.25 }); },
  count: (hi) => tone({ f0: hi ? 1400 : 700, dur: hi ? 0.4 : 0.12, vol: 0.18 }),
  over: () => { for (let i = 0; i < 4; i++) tone({ f0: 600 - i * 100, dur: 0.22, vol: 0.18, at: i * 0.24 }); },
};

// the pack's voice: short calls, the newest one wins
let voice = null;
export function say(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (!voice) voice = speechSynthesis.getVoices().find(v => /en(-|_)?(US|GB)/i.test(v.lang)) || null;
    if (voice) u.voice = voice;
    u.rate = 1.15; u.pitch = 0.55; u.volume = 1;
    speechSynthesis.speak(u);
  } catch { /* no voice here */ }
}
