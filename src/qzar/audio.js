// SLOWFIRE DUEL's sounds, all synthesized: each weapon's shot, pickups, the shield, hits, near misses, steps, the count and the arena's hum, panned to where they happen
let ctx = null, master = null, hiss = null;

function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  try {
    ctx = new AC(); const comp = ctx.createDynamicsCompressor(); master = ctx.createGain(); master.gain.value = .55; master.connect(comp); comp.connect(ctx.destination);
    hiss = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = hiss.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    hum();
  } catch { ctx = null; }
}
function bus(pan, vol) {
  const g = ctx.createGain(); g.gain.value = vol;
  if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(master); } else g.connect(master);
  return g;
}
function tone(to, type, f0, f1, dur, vol, wait = 0) {
  const t = ctx.currentTime + wait, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(to); o.start(t); o.stop(t + dur + .03);
}
function rush(to, kind, f0, f1, dur, vol, q = 1, wait = 0) {
  const t = ctx.currentTime + wait, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = hiss; s.loop = true;
  f.type = kind; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(to); s.start(t, Math.random() * .8); s.stop(t + dur + .03);
}
function hum() {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
  s.buffer = hiss; s.loop = true; f.type = 'lowpass'; f.frequency.value = 170; g.gain.value = .0001; g.gain.linearRampToValueAtTime(.2, ctx.currentTime + 3);
  l.frequency.value = .09; lg.gain.value = 60; l.connect(lg); lg.connect(f.frequency); s.connect(f); f.connect(g); g.connect(master); s.start(); l.start();
  for (const hz of [55, 82.6]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = hz; og.gain.value = .035; o.connect(og); og.connect(f); o.start(); }
}

const S = {
  fire_pip: b => { tone(b, 'square', 1350, 360, .11, .2); tone(b, 'sine', 2300, 900, .06, .16); rush(b, 'highpass', 3200, 3200, .05, .18); },
  fire_needle: b => { tone(b, 'sawtooth', 3400, 850, .17, .16); tone(b, 'sine', 5400, 2400, .09, .14); rush(b, 'bandpass', 6500, 2200, .08, .32, 2); tone(b, 'sine', 150, 55, .13, .35); },
  fire_scatter: b => { rush(b, 'lowpass', 2600, 280, .24, .8); tone(b, 'triangle', 230, 62, .21, .55); tone(b, 'square', 720, 240, .08, .1); },
  fire_drifter: b => { tone(b, 'sine', 62, 150, .75, .55); tone(b, 'sawtooth', 108, 216, .65, .1); rush(b, 'bandpass', 280, 950, .65, .28, 3); },
  pickup: b => { tone(b, 'triangle', 520, 1040, .07, .25); tone(b, 'sine', 1560, 1560, .09, .14, .05); rush(b, 'highpass', 4200, 4200, .03, .14); },
  empty: b => { rush(b, 'bandpass', 2400, 1200, .04, .22, 3); tone(b, 'square', 240, 160, .04, .1, .03); },
  shield: b => { tone(b, 'sawtooth', 170, 540, .26, .14); tone(b, 'sine', 660, 990, .32, .2); rush(b, 'bandpass', 900, 2600, .3, .12, 4); },
  block: b => { tone(b, 'triangle', 1850, 900, .12, .3); tone(b, 'sine', 2750, 2750, .22, .12); rush(b, 'bandpass', 5200, 5200, .05, .2, 4); },
  hurt: b => { tone(b, 'sine', 155, 42, .32, .75); rush(b, 'lowpass', 950, 180, .2, .55); tone(b, 'square', 330, 105, .15, .14); },
  hit: b => { tone(b, 'sine', 1400, 1950, .07, .3); tone(b, 'triangle', 2100, 2100, .13, .15, .04); },
  pop: b => rush(b, 'bandpass', 2600, 750, .09, .25, 2),
  whoosh: b => rush(b, 'bandpass', 420, 1900, .3, .5, 1.4),
  step: b => { rush(b, 'lowpass', 520, 190, .07, .2); tone(b, 'sine', 115, 68, .05, .12); },
  tick: b => tone(b, 'sine', 620, 620, .1, .3),
  go: b => { tone(b, 'sine', 990, 990, .32, .35); tone(b, 'triangle', 1485, 1485, .32, .15); },
  win: b => [523, 659, 784, 1047].forEach((f, i) => tone(b, 'triangle', f, f, i === 3 ? .4 : .14, .3, i * .12)),
  lose: b => [392, 330, 262].forEach((f, i) => tone(b, 'sawtooth', f, f * .97, i === 2 ? .5 : .18, .16, i * .16)),
  draw: b => { tone(b, 'triangle', 440, 440, .2, .25); tone(b, 'triangle', 440, 440, .3, .25, .25); }
};
function sfx(name, pan = 0, vol = 1) { if (!ctx || !S[name]) return; try { S[name](bus(pan, vol)); } catch { /* sound is optional */ } }

export { initAudio, sfx };
