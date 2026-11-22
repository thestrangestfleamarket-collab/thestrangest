// WebAudio mixer driven by the sound manifest (real recordings; see assets/audio/CREDITS.md).
export class AudioSys {
  constructor() { this.ctx = null; this.buf = {}; this.loops = {}; this.manifest = {}; this.ready = false; this.volume = 0.9; }
  async init() {
    if (this.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = this.volume; const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; this.master.connect(comp); comp.connect(c.destination);
    this.cabin = c.createGain(); this.cabin.connect(this.master);                 // sounds made inside the cabin
    this.outFilter = c.createBiquadFilter(); this.outFilter.type = 'lowpass'; this.outFilter.frequency.value = 20000; this.outGain = c.createGain(); this.outFilter.connect(this.outGain); this.outGain.connect(this.master); // the outside world, muffled when shut in
    try { this.manifest = await fetch('/drive-assets/audio/manifest.json').then(r => r.ok ? r.json() : {}); } catch { this.manifest = {}; }
    await Promise.all(Object.entries(this.manifest).filter(([id, m]) => m && m.file).map(async ([id, m]) => { try { const ab = await fetch('/drive-assets/audio/' + m.file).then(r => r.arrayBuffer()); this.buf[id] = await c.decodeAudioData(ab); } catch (e) { console.warn('audio missing', id); } }));
    for (const id of ['motor_whine', 'road_roll', 'wind', 'tire_skid', 'night_ambience', 'rain_on_car', 'horn_loop', 'window_motor_loop']) this.startLoop(id, id === 'horn_loop' || id === 'window_motor_loop' || id === 'motor_whine' ? this.cabin : this.outFilter);
    this.startLoop('city', this.outFilter); this.startLoop('birds', this.outFilter); this.startLoop('road_roll', this.outFilter, 'passby'); this.startLoop('motor_whine', this.outFilter, 'passwhine');
    this.ready = true;
  }
  // the car radio: public-domain recordings (Library of Congress National Jukebox), one long file a station, played from the
  // station's own clock so everyone tuned in hears the same moment; heard through a small-speaker filter
  async initRadio() { if (this.radio || !this.ctx) return; try { const j = await fetch('/drive-assets/radio/radio.json').then(r => r.json()); const c = this.ctx; const el = new Audio(); el.crossOrigin = 'anonymous'; el.loop = true; el.preload = 'none'; const src = c.createMediaElementSource(el); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; const g = c.createGain(); g.gain.value = 0; src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.cabin); this.radio = { el, g, stations: j.stations, i: -1 }; } catch (e) { console.warn('radio unavailable', e); } }
  radioTune(i, nowSec) { const R = this.radio; if (!R) return null; R.i = i; if (i < 0) { R.el.pause(); R.g.gain.value = 0; return null; } const st = R.stations[i]; R.el.src = '/drive-assets/radio/' + st.id + '.mp3'; const at = ((nowSec % st.len) + st.len) % st.len; const go = () => { try { R.el.currentTime = at; } catch { } R.el.play().catch(() => { }); }; R.el.addEventListener('loadedmetadata', go, { once: true }); R.el.load(); return st; }
  radioNow(nowSec) { const R = this.radio; if (!R || R.i < 0) return null; const st = R.stations[R.i]; const t = R.el.currentTime || (((nowSec % st.len) + st.len) % st.len); let tr = st.tracks[0]; for (const k of st.tracks) if (k.at <= t) tr = k; return { call: st.call, name: st.name, title: tr.title, year: tr.year }; }
  resume() { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume(); }
  startLoop(id, dest, key) { const b = this.buf[id]; if (!b) return; id = key || id; const c = this.ctx; const s = c.createBufferSource(); s.buffer = b; s.loop = true; const g = c.createGain(); g.gain.value = 0; s.connect(g); g.connect(dest); s.start(0, Math.random() * b.duration); this.loops[id] = { s, g }; }
  set(id, gain, rate) { const l = this.loops[id]; if (!l) return; const t = this.ctx.currentTime; l.g.gain.setTargetAtTime(Math.max(0, gain), t, 0.06); if (rate !== undefined) l.s.playbackRate.setTargetAtTime(Math.max(0.2, Math.min(4, rate)), t, 0.06); }
  play(id, gain = 1, rate = 1, outside = false) { if (!this.ready) return; let b = id === 'footstep' ? null : this.buf[id]; if (!b) { const alts = Object.keys(this.buf).filter(k => k.startsWith(id + '_')); if (!alts.length) return; b = this.buf[alts[Math.floor(Math.random() * alts.length)]]; } const c = this.ctx; const s = c.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; const g = c.createGain(); g.gain.value = gain; s.connect(g); g.connect(outside ? this.outFilter : this.cabin); s.start(); return s; }
  // st: {inside, openness 0..1, speed m/s, torque -1..1, rpm, skid 0..1, surface 0..2, rain 0..1, horn, windowMoving, power}
  update(st) {
    if (!this.ready) return; const t = this.ctx.currentTime;
    const open = st.inside ? st.openness : 1; this.outFilter.frequency.setTargetAtTime(600 + 19000 * open * open, t, 0.1); this.outGain.gain.setTargetAtTime(0.45 + 0.55 * open, t, 0.1);
    const v = st.speed; const tq = Math.abs(st.torque);
    this.set('motor_whine', st.power ? (0.02 + 0.2 * tq + 0.08 * Math.min(1, v / 25)) * Math.min(1, v / 2 + tq * 2) * (st.inside ? 1 : 0.6) : 0, 0.5 + st.rpm / 5200);
    const grass = Math.max(0, st.surface - 1);
    this.set('road_roll', Math.min(1, Math.pow(v / 30, 1.15)) * (0.75 + grass * 0.5), 0.72 + v / 55 - grass * 0.15);
    this.set('wind', Math.min(1, (v / 36) ** 2) * (0.5 + 0.5 * open), 0.8 + v / 80);
    this.set('tire_skid', st.skid * 0.8, 0.9 + st.skid * 0.25);
    this.set('night_ambience', st.night ? 0.5 : 0.25, 1); this.set('city', st.night ? 0.3 : 0.42, 1); this.set('birds', st.night || st.rain > 0 ? 0 : 0.4, 1); this.set('passby', Math.min(0.9, st.passby || 0), 0.9 + (st.passSpeed || 0) / 40); this.set('passwhine', Math.min(0.25, (st.passby || 0) * 0.3), 0.7 + (st.passSpeed || 0) / 30); this.set('rain_on_car', st.rain * (st.inside ? 0.9 : 0.5), 1);
    if (this.radio && this.radio.i >= 0) this.radio.g.gain.setTargetAtTime(st.power ? (st.inside ? 0.5 : 0.12 * (0.3 + st.openness)) : 0, t, 0.2);
    this.set('horn_loop', st.horn ? 0.9 : 0, 1); this.set('window_motor_loop', st.windowMoving ? 0.5 : 0, 1);
  }
}
