// Tiny synthesized sound effects (no audio files needed).
export class Sfx {
  constructor(listenerPos) {
    this.ctx = null;
    this.listener = listenerPos; // () => THREE.Vector3
  }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const len = this.ctx.sampleRate * 0.25;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  gainAt(pos) {
    if (!pos) return 1;
    const l = this.listener();
    const d = Math.hypot((pos.x ?? 0) - l.x, (pos.y ?? 0) - l.y, (pos.z ?? 0) - l.z);
    return 1 / (1 + d * d * 0.35);
  }
  burst(vol, freq, dur, delayMs = 0) {
    if (!this.ctx || this.ctx.state !== 'running' || vol < 0.01) return;
    const t = this.ctx.currentTime + delayMs / 1000;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t, Math.random() * 0.1, dur + 0.02);
  }
  card(pos, vol = 0.7, delayMs = 0) { this.burst(0.35 * vol * this.gainAt(pos), 2600 + Math.random() * 900, 0.07, delayMs); }
  shuffle(pos) { const g = this.gainAt(pos); for (let i = 0; i < 16; i++) this.burst(0.18 * g, 3200, 0.04, i * 28 + Math.random() * 10); }
  click(pos) { this.burst(0.4 * this.gainAt(pos), 900, 0.05); }
}
