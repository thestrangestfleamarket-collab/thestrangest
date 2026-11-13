// THE CANTINA's band: the house track (the owner's karaoke recording, data/wave/rock.mp3) from the stage, the octopus's sticks on its stomps and claps, the words on the board.
import * as THREE from 'three';
import { REST } from './octopus.js';
export class Band {
  constructor(game, track) {
    this.game = game; this.track = track; this.on = false; this.t = 0;
    this.el = new Audio('cantina-assets/rock.mp3'); this.el.loop = true; this.el.preload = 'auto'; this.el.crossOrigin = 'anonymous';
    this.listener = new THREE.AudioListener(); game.camera.add(this.listener);
    this.sound = new THREE.PositionalAudio(this.listener); this.sound.setRefDistance(5); this.sound.setRolloffFactor(1.4); this.sound.setVolume(0.8);
    this.wired = false; this.bar = 0;
  }
  start() {
    if (!this.wired) { try { this.sound.setMediaElementSource(this.el); this.wired = true; } catch (e) { } }
    if (this.listener.context.state === 'suspended') this.listener.context.resume();
    this.el.play().then(() => { this.on = true; }).catch(() => { });
  }
  place(world) { const s = world.stage; this.sound.removeFromParent(); this.sound.position.set(s.x, s.y + 1.5, s.z + 1); world.root.add(this.sound); }
  // where in the bar the song is: 0..1, and which bar
  phase(t) { const B = this.track.bars; let i = this.bar; if (i >= B.length || B[i] > t) i = 0; while (i + 1 < B.length && B[i + 1] <= t) i++; this.bar = i;
    const len = i + 1 < B.length ? B[i + 1] - B[i] : this.track.barLen; return t < B[0] || t > B[B.length - 1] + len ? -1 : Math.min(0.999, (t - B[i]) / len); }
  update(dt, world) {
    const tr = this.track, t = this.on ? this.el.currentTime : (this.t += dt) % tr.duration, p = this.phase(t), oct = world.band.octopus;
    // two stomps and a clap in every bar: the right stick and the kick take the stomps, the left the clap
    const sw = (at) => { const d = ((at - p + 1) % 1) * tr.barLen, since = ((p - at + 1) % 1) * tr.barLen; return d < 0.16 ? Math.round((d / 0.16) * 3) : since < 0.1 ? Math.round((since / 0.1) * 2) : 3; };
    if (p < 0) oct.userData.draw(REST);
    else { const r = Math.min(sw(0), sw(0.25)), l = sw(0.5), kick = (p < 0.06 || (p > 0.25 && p < 0.31)) ? 1 : 0;
      oct.userData.draw({ L: [1, l], R: [4, r], A: [6, 3], B: [5, 3], puff: 0, sip: 0, kick, hat: 0, nod: p < 0.12 || (p > 0.25 && p < 0.37) ? 1 : 0 }); }
    const beat = p < 0 ? 0 : Math.max(0, 1 - Math.min((p % 0.25) * 4, 1) * 3) * (p < 0.75 ? 1 : 0);
    for (const m of world.band.members || []) { m.G.position.y = m.y + (m.kind === 'stomp' ? beat * 0.07 : beat * 0.015); if (m.kind === 'sing') m.G.rotation.y = m.rot + Math.sin(t * 1.4) * 0.12; }
    let line = '';
    for (const [at, words] of tr.karaoke) { if (at <= t + 0.2) line = words; else break; }
    world.words(p < 0 && t > tr.duration - 4 ? '' : line);
  }
}
