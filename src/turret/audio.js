// SWIVEL's sound: recordings (SPACE FLEET's, /turret-assets/snd/) played from where things are, so you can hear which way to turn
const BASE = '/turret-assets/snd/', NAMES = ['gun', 'gun2', 'cannon', 'boom_s', 'boom_m', 'boom_l', 'boom_xl', 'hit', 'hit2', 'alarm', 'ambience', 'engine', 'order', 'win', 'lose', 'ui_deny', 'ui_click', 'thrust'];
export class Sound {
  constructor() { this.buf = {}; this.ctx = null; }
  // call from a press: browsers only start sound then
  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    try { const c = this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.out = c.createGain(); this.out.gain.value = 0.8; this.out.connect(c.destination); } catch { return; }
    Promise.all(NAMES.map(async n => { try { this.buf[n] = await this.ctx.decodeAudioData(await (await fetch(BASE + n + '.mp3')).arrayBuffer()); } catch { } })).then(() => { this.loop('ambience', 0.35); this.loop('engine', 0.22); });
  }
  loop(name, vol) { if (!this.buf[name]) return; const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); s.buffer = this.buf[name]; s.loop = true; g.gain.value = vol; s.connect(g); g.connect(this.out); s.start(); }
  play(name, vol = 1, p = null, rate = 1) {
    const c = this.ctx, b = this.buf[name]; if (!c || !b || c.state !== 'running') return;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12); g.gain.value = vol; s.connect(g);
    if (p) { const pan = c.createPanner(); pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = 90; pan.rolloffFactor = 1; pan.positionX.value = p[0]; pan.positionY.value = p[1]; pan.positionZ.value = p[2]; g.connect(pan); pan.connect(this.out); }
    else g.connect(this.out);
    s.start();
  }
  // the ears follow the head
  hear(pos, fwd, up) { const c = this.ctx; if (!c) return; const l = c.listener; if (l.positionX) { l.positionX.value = pos.x; l.positionY.value = pos.y; l.positionZ.value = pos.z; l.forwardX.value = fwd.x; l.forwardY.value = fwd.y; l.forwardZ.value = fwd.z; l.upX.value = up.x; l.upY.value = up.y; l.upZ.value = up.z; }
    else { l.setPosition(pos.x, pos.y, pos.z); l.setOrientation(fwd.x, fwd.y, fwd.z, up.x, up.y, up.z); } }
}
