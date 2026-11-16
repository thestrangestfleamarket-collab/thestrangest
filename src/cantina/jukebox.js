// THE CANTINA's jukebox: the only music in the room. Its records are the car radio's (data/radio/, Library of Congress National Jukebox recordings, public domain), chosen by title; the sound comes from the jukebox.
import * as THREE from 'three';
const nice = (s) => String(s || '').replace(/\b[a-z]/g, (c) => c.toUpperCase());
export class Jukebox {
  constructor(game, stations) {
    this.game = game; this.open = false; this.cur = -1; this.src = '';
    this.songs = stations.flatMap((st) => st.tracks.map((t) => ({ st: st.id, shelf: st.name, title: nice(t.title), by: nice((t.by || [])[0] || ''), year: t.year, at: t.at, len: t.len })));
    this.el = new Audio(); this.el.preload = 'auto'; this.el.crossOrigin = 'anonymous';
    this.listener = new THREE.AudioListener(); game.camera.add(this.listener);
    this.sound = new THREE.PositionalAudio(this.listener); this.sound.setRefDistance(4); this.sound.setRolloffFactor(1.3); this.sound.setVolume(0.75);
    this.wired = false;
    this.box = document.getElementById('juke'); this.list = document.getElementById('jukeList'); this.now = document.getElementById('jukeNow');
    let shelf = '';
    this.songs.forEach((s, i) => {
      if (s.shelf !== shelf) { shelf = s.shelf; const h = document.createElement('h4'); h.textContent = shelf; this.list.append(h); }
      const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i; b.textContent = `${s.title} · ${s.by}, ${s.year}`; b.addEventListener('click', () => this.play(i)); this.list.append(b);
    });
    document.getElementById('jukeStop').addEventListener('click', () => this.stop());
    document.getElementById('jukeClose').addEventListener('click', () => this.close());
    this.el.addEventListener('loadedmetadata', () => { if (this.cur >= 0) this.el.currentTime = this.songs[this.cur].at; });
  }
  place(world) { const j = world.jukebox; this.sound.removeFromParent(); this.sound.position.set(j.x, j.y, j.z + 0.3); world.root.add(this.sound); }
  // the first gesture lets the page make sound; a record is already on when you walk in
  start() {
    if (!this.wired) { try { this.sound.setMediaElementSource(this.el); this.wired = true; } catch (e) { } }
    if (this.listener.context.state === 'suspended') this.listener.context.resume();
    if (this.cur < 0) this.play(Math.floor(Math.random() * this.songs.length));
  }
  play(i) {
    const s = this.songs[i], src = `cantina-assets/radio/${s.st}.mp3`; this.cur = i;
    if (this.src !== src) { this.src = src; this.el.src = src; } else this.el.currentTime = s.at;
    this.el.play().catch(() => { });
    this.show();
  }
  next() { this.play((this.cur + 1) % this.songs.length); }
  stop() { this.el.pause(); this.cur = -1; this.show(); }
  playing() { return this.cur >= 0 ? this.songs[this.cur] : null; }
  show() { const s = this.playing(); this.now.textContent = s ? `Playing: ${s.title} · ${s.by}, ${s.year}` : 'Nothing is playing.';
    for (const b of this.list.querySelectorAll('button')) b.classList.toggle('sel', +b.dataset.i === this.cur); }
  panel() { this.open = true; this.box.hidden = false; document.exitPointerLock?.(); this.show(); }
  close() { this.open = false; this.box.hidden = true; }
  // a record ends: the next one on the list drops. Until the file can be sought to the record it is silent, never the wrong tune
  update() {
    const s = this.playing(), el = this.el; if (!s || el.readyState < 1) return;
    const t = el.currentTime, off = t < s.at - 0.6 || t > s.at + s.len + 2.5;
    el.muted = off;
    if (off) { const k = el.seekable; for (let i = 0; i < k.length; i++) if (k.start(i) <= s.at && k.end(i) > s.at) { el.currentTime = s.at; break; } }
    else if (!el.paused && t >= s.at + s.len - 0.4) this.next();
  }
}
