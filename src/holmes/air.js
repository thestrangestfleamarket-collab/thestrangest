// THE SPECKLED BAND's air: each place's sounds made here (no files): the fire, the wind, a clock, night insects, birds, the train, the street, a hiss.
let ctx = null, noise = null, layers = [], timer = 0, want = {}, out = null;
const mkNoise = () => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = w * .5 + last * 6; } return b; };
const bed = (type, freq, q, gain) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 1.5); s.connect(f).connect(g).connect(out); s.start(); layers.push({ s, g, f }); return { g, f }; };
const blip = (f0, f1, dur, gain, type = 'sine') => { const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + .02); };
const click = (freq, gain) => { const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 3; const g = ctx.createGain(), t = ctx.currentTime; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + .07); };
export const AIR = { on: true,
  start() { if (ctx) { ctx.resume(); return; } const A = window.AudioContext || window.webkitAudioContext; if (!A) return; ctx = new A(); noise = mkNoise(); out = ctx.createGain(); out.gain.value = .9; out.connect(ctx.destination); AIR.set(want); },
  duck(v) { if (out) out.gain.setTargetAtTime(v ? .3 : .9, ctx.currentTime, .2); },
  set(S) { want = S || {}; if (!ctx) return; for (const l of layers) { l.g.gain.setTargetAtTime(0, ctx.currentTime, .3); const s = l.s; setTimeout(() => { try { s.stop(); } catch (e) {} }, 1500); } layers = []; AIR.wind = null;
    if (want.fire) bed('lowpass', 420, .5, .05 * want.fire); if (want.wind) AIR.wind = bed('bandpass', 380, .7, .035 * want.wind); if (want.street) bed('lowpass', 160, .4, .06 * want.street); if (want.train) bed('lowpass', 110, .6, .22); if (want.hiss) bed('highpass', 5200, .5, .012); if (want.night) bed('bandpass', 2400, .3, .004 * want.night); },
  tick(t, dt) { if (!ctx || ctx.state !== 'running') return; timer += dt; const W = want, r = Math.random;
    if (AIR.wind) AIR.wind.g.gain.setTargetAtTime(.035 * W.wind * (.6 + .5 * Math.sin(t * .23) * Math.sin(t * .071)), ctx.currentTime, .5);
    if (W.fire && r() < dt * 5) click(900 + r() * 2600, .05 + r() * .1);
    if (W.clock && Math.floor(t) !== Math.floor(t - dt)) click(Math.floor(t) % 2 ? 2600 : 2100, .07);
    if (W.clockfar && Math.floor(t / 14) !== Math.floor((t - dt) / 14)) { blip(196, 190, 2.4, .05); }
    if (W.night && r() < dt * 1.6) { const f = 4200 + r() * 600; for (let i = 0; i < 3; i++) setTimeout(() => ctx && blip(f, f * .98, .035, .012 * W.night, 'triangle'), i * 55); }
    if (W.birds && r() < dt * .7 * W.birds) { const f = 2200 + r() * 2200, n = 1 + Math.floor(r() * 4); for (let i = 0; i < n; i++) setTimeout(() => ctx && blip(f, f * (1.15 + r() * .5), .07 + r() * .06, .02), i * 130); }
    if (W.train && Math.floor(t / .62) !== Math.floor((t - dt) / .62)) { click(240, .2); setTimeout(() => ctx && click(200, .16), 110); } } };
