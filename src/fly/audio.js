// WebAudio: engine / wind loops driven by the flight model, weapons, warnings, cockpit clicks, distance-delayed explosions.
const FILES = ['prop_loop', 'radial_loop', 'rotary_loop', 'jet_cockpit', 'jet_ext', 'afterburner', 'ab_ignite', 'wind', 'mg_heavy', 'mg_light', 'vulcan', 'missile', 'explosion2', 'explosion_far', 'gear', 'pullup', 'stall', 'jet_start', 'prop_start', 'hit', 'switch', 'lever', 'button', 'flyby', 'crash'];
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export class Audio {
  constructor() { this.buf = {}; this.ready = false; this.loops = {}; this.lastFly = 0; this.lastHit = 0; }
  async init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = 0.9;
    const comp = this.ctx.createDynamicsCompressor(); this.master.connect(comp); comp.connect(this.ctx.destination);
    this.engineBus = this.ctx.createBiquadFilter(); this.engineBus.type = 'lowpass'; this.engineBus.frequency.value = 20000; this.engineBus.connect(this.master);
    await Promise.all(FILES.map(async n => { try { const r = await fetch(`fly-assets/audio/${n}.mp3`); this.buf[n] = await this.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { } }));
    this.ready = true;
  }
  loop(name, key = name, dest = this.master) { if (!this.ready || !this.buf[name]) return null; if (this.loops[key]) return this.loops[key]; const s = this.ctx.createBufferSource(); s.buffer = this.buf[name]; s.loop = true; const b = s.buffer; s.loopStart = Math.min(0.3, b.duration * 0.1); s.loopEnd = b.duration - Math.min(0.3, b.duration * 0.1);
    const g = this.ctx.createGain(); g.gain.value = 0; s.connect(g); g.connect(dest); s.start(0, Math.random() * b.duration * 0.5); return this.loops[key] = { s, g, name }; }
  stopLoop(key) { const l = this.loops[key]; if (!l) return; try { l.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05); l.s.stop(this.ctx.currentTime + 0.3); } catch (e) { } delete this.loops[key]; }
  stopAll() { for (const k of Object.keys(this.loops)) this.stopLoop(k); }
  set(l, gain, rate) { if (!l) return; const t = this.ctx.currentTime; l.g.gain.setTargetAtTime(gain, t, 0.08); if (rate) l.s.playbackRate.setTargetAtTime(rate, t, 0.08); }
  play(name, gain = 1, rate = 1, delay = 0) { if (!this.ready || !this.buf[name]) return; const s = this.ctx.createBufferSource(); s.buffer = this.buf[name]; s.playbackRate.value = rate; const g = this.ctx.createGain(); g.gain.value = gain; s.connect(g); g.connect(this.master); s.start(this.ctx.currentTime + delay); }
  ui(kind) { const m = { switch: ['switch', 0.7, 1], button: ['button', 0.6, 1.1], lever: ['lever', 0.7, 1], gear: ['gear', 0.7, 1], jet_start: ['jet_start', 0.5, 1], prop_start: ['prop_start', 0.5, 1] }[kind]; if (m) this.play(...m); }
  explosionAt(pos, scale) { if (!this.ready || !this.listener) return; const d = pos.distanceTo(this.listener); if (d > 14000) return; const far = d > 1800; this.play(far ? 'explosion_far' : Math.random() < 0.5 && this.buf.explosion1 ? 'explosion1' : 'explosion2', clamp(scale * 420 / (d + 300), 0.03, 1.2), 0.9 + Math.random() * 0.2, Math.min(d / 340, 12)); }
  crash() { this.play('crash', 0.9); }
  hit() { const t = performance.now(); if (t - this.lastHit < 90) return; this.lastHit = t; this.play('hit', 0.35, 0.9 + Math.random() * 0.4); }
  // per-frame mix for the player's aircraft
  update(dt, pl, cockpitView, others, camPos) {
    if (!this.ready) return; this.listener = camPos; const fm = pl.fm, spec = pl.spec, jet = spec.engine === 'jet', alive = pl.alive && !pl.removed;
    if (this.plane !== pl) { this.stopAll(); this.plane = pl; }
    const closed = cockpitView && spec.kit !== 'ww1'; this.engineBus.frequency.setTargetAtTime(closed ? (jet ? 900 : 1500) : 20000, this.ctx.currentTime, 0.1);
    const rpm = fm.rpm, eg = alive ? 1 : 0;
    if (jet) { this.set(this.loop('jet_ext', 'eng', this.engineBus), eg * (0.12 + rpm * 0.5) * (closed ? 0.8 : 1), spec.sndPitch * (0.55 + rpm * 0.6)); this.set(this.loop('jet_cockpit', 'cab'), eg * (closed ? 0.5 : 0.1), 0.9 + rpm * 0.2);
      this.set(this.loop('afterburner', 'ab', this.engineBus), eg * fm.ab * 0.75, 1); if (fm.ab > 0.5 && !this.abOn) this.play('ab_ignite', 0.6); this.abOn = fm.ab > 0.5; }
    else this.set(this.loop(spec.snd, 'eng', this.engineBus), eg * (0.25 + rpm * 0.6) * (rpm > 0.15 ? 1 : rpm * 6), spec.sndPitch * (0.45 + rpm * 0.75));
    const q = clamp(fm.ias / (jet ? 330 : 170), 0, 1.4); this.set(this.loop('wind', 'wind'), eg * q * q * (closed ? 0.35 : 0.9) + Math.min(0.5, fm.stallShake * 0.6), 0.7 + q * 0.6);
    const firing = pl.firing && pl.ammo > 0 && pl.masterArm && alive; this.set(this.loop(spec.gun.snd, 'gun'), firing ? 0.85 : 0, spec.gun.snd === 'mg_light' ? 1.15 : 1);
    this.set(this.loop('stall', 'stall'), alive && fm.aoaStall > 0.35 && !fm.onGround && spec.kit !== 'ww1' ? 0.4 : 0, 1);
    const pull = alive && jet && spec.kit !== 'jet1' && fm.agl < 280 && fm.vs < -fm.agl / 6 && !fm.onGround && fm.gearPos < 0.5; if (pull && performance.now() - (this.lastPull || 0) > 2600) { this.lastPull = performance.now(); this.play('pullup', 0.8); }
    // other aircraft: fly-by whoosh and gunfire
    let gun = 0; for (const o of others) { if (o === pl || o.removed) continue; const d = o.fm.pos.distanceTo(camPos); if (o.firing && o.ammo > 0 && d < 1500) gun = Math.max(gun, 1 - d / 1500);
      if (d < 160 && o.alive && performance.now() - this.lastFly > 2500) { this.lastFly = performance.now(); this.play(o.spec.engine === 'jet' ? 'flyby' : 'prop_loop', o.spec.engine === 'jet' ? 0.7 : 0.5, o.spec.engine === 'jet' ? 1 : 1.3); } }
    this.set(this.loop('mg_heavy', 'gun2'), gun * 0.4, 0.9);
  }
}
