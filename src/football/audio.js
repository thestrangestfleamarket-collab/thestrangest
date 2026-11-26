// FOURTH & LONG's sounds: the hits, falls and throws are SKIRMISH TABLE's recordings (/chess-assets/sfx/, docs/chess-sounds.md); the whistle, the snap, the kick and the crowd are made in the page, as are the others until the recordings arrive
export class Sound {
  constructor() { this.ac = null; this.crowdG = null; }
  start() { if (this.ac) { this.ac.resume(); return; } const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const ac = this.ac = new AC(), n = ac.sampleRate * 2, buf = this.noise = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 0.4; const g = this.crowdG = ac.createGain(); g.gain.value = 0; src.connect(f).connect(g).connect(ac.destination); src.start();
    this.rec = {}; for (const n of ['bodyfall', 'thud0', 'thud1', 'punch0', 'punch1', 'grunt', 'woosh0', 'armor0', 'armor1']) fetch('/chess-assets/sfx/' + n + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).then(b => b && ac.decodeAudioData(b)).then(b => { if (b) this.rec[n] = b; }).catch(() => {}); }
  play(names, vol = 0.6) { const n = names[Math.floor(Math.random() * names.length)], b = this.rec && this.rec[n]; if (!b) return false; const s = this.ac.createBufferSource(), g = this.ac.createGain(); s.buffer = b; g.gain.value = vol; s.playbackRate.value = 0.92 + Math.random() * 0.16; s.connect(g).connect(this.ac.destination); s.start(); return true; }
  crowd(v) { if (this.crowdG) this.crowdG.gain.setTargetAtTime(v, this.ac.currentTime, 0.6); }
  cheer(v = 0.25, s = 2.5) { if (!this.crowdG) return; const t = this.ac.currentTime, g = this.crowdG.gain, base = this.base || 0; g.cancelScheduledValues(t); g.setTargetAtTime(base + v, t, 0.15); g.setTargetAtTime(base, t + s, 0.9); }
  tone(f, dur, type = 'sine', vol = 0.15, f2) { if (!this.ac) return; const t = this.ac.currentTime, o = this.ac.createOscillator(), g = this.ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(this.ac.destination); o.start(t); o.stop(t + dur + 0.02); }
  thud(vol = 0.5, f = 260, dur = 0.16) { if (!this.ac) return; const t = this.ac.currentTime, s = this.ac.createBufferSource(), fl = this.ac.createBiquadFilter(), g = this.ac.createGain(); s.buffer = this.noise; fl.type = 'lowpass'; fl.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(fl).connect(g).connect(this.ac.destination); s.start(t, Math.random()); s.stop(t + dur + 0.02); }
  whistle() { this.tone(2900, 0.5, 'square', 0.05); this.tone(3150, 0.5, 'square', 0.04); }
  hit() { if (this.play(['thud0', 'thud1', 'punch0', 'punch1', 'armor0', 'armor1'], 0.7)) { this.play(['bodyfall', 'grunt'], 0.5); return; } this.thud(0.7, 300, 0.2); this.tone(90, 0.15, 'sine', 0.3, 50); }
  snap() { this.tone(180, 0.09, 'sawtooth', 0.12); this.thud(0.3, 900, 0.07); }
  catch() { this.thud(0.4, 1500, 0.05); }
  kick() { this.tone(140, 0.2, 'sine', 0.5, 45); this.thud(0.5, 500, 0.08); }
  swish() { if (!this.play(['woosh0'], 0.4)) this.thud(0.15, 2500, 0.25); }
}
