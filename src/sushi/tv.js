// the television sets: one on a bracket under the cart's roof that you work by its knobs, and the TV shop's window of sets across the street, all on THE MARKET's channels (data/tv.json, the Internet Archive through /film)
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, mergeStatic } from './ctx.js';
import TVD from '../../data/tv.json';

const CH = TVD.channels.filter((c) => !c.live && c.shows.length && c.shows[0].file);
const at = (c) => { let t = (Date.now() / 1000) % c.shows.reduce((a, s) => a + s.len, 0); for (const s of c.shows) { if (t < s.len) return { s, off: t }; t -= s.len; } return { s: c.shows[0], off: 0 }; }; // what is on now: every set on a channel shows the same moment
export function buildTV(scene, shops) {
  const root = new THREE.Group(); scene.add(root);
  const sc = document.createElement('canvas'); sc.width = 64; sc.height = 48; const sg = sc.getContext('2d'), snow = new THREE.CanvasTexture(sc); snow.colorSpace = THREE.SRGBColorSpace; snow.magFilter = THREE.NearestFilter;
  const drawSnow = () => { const im = sg.createImageData(64, 48); for (let i = 0; i < 64 * 48; i++) { const v = (Math.random() * 200) | 0; im.data[i * 4] = im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v + 14; im.data[i * 4 + 3] = 255; } sg.putImageData(im, 0, 0); snow.needsUpdate = true; }; drawSnow();
  const off = new THREE.MeshBasicMaterial({ color: 0x050608 });
  // a tube: one picture off the air, shown on every set tuned to it
  const tube = (ch, loud) => { const v = document.createElement('video'); v.playsInline = true; v.preload = 'none'; v.muted = !loud; v.loop = false; const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
    const t = { v, tex, ch, src: '', dead: false, on: true, sets: [], m: new THREE.MeshBasicMaterial({ map: snow, color: new THREE.Color(1.35, 1.35, 1.45), toneMapped: false }), chk: 0 };
    v.addEventListener('error', () => { t.dead = true; }); v.addEventListener('ended', () => tune(t)); return t; };
  const tune = (t) => { if (!t.on) { t.v.pause(); return; } const { s, off: o } = at(CH[t.ch % CH.length]), u = '/film/' + s.id + '/' + s.file; if (u !== t.src) { t.src = u; t.dead = false; t.v.src = u; t.flash = 0.5; } try { if (Math.abs(t.v.currentTime - o) > 4) t.v.currentTime = o; } catch (e) { /* not ready */ } const p = t.v.play(); if (p && p.catch) p.catch(() => { }); };
  const set = (w, t, kind, x, y, z, ry) => { const g = new THREE.Group(), h = w * 0.8, d = w * 0.85, body = mat({ color: kind === 'red' ? 0xa8281c : kind === 'wood' ? 0x5a3a22 : 0x2a2a2e, roughness: 0.5 });
    box(w, h, d, body, 0, h / 2, 0, g); box(w * 0.74, h * 0.8, 0.012, mat({ color: 0x101012 }), -w * 0.1, h / 2, d / 2 + 0.004, g); box(w * 0.18, h * 0.8, 0.012, mat({ color: 0x3a3a3e }), w * 0.38, h / 2, d / 2 + 0.004, g);
    for (let i = 0; i < 5; i++) box(w * 0.12, 0.004, 0.006, mat({ color: 0x111111 }), w * 0.38, h * (0.3 - i * 0.035), d / 2 + 0.012, g);
    if (kind !== 'wood') for (const s of [-1, 1]) cyl(0.002, 0.002, w * 1.1, mat({ color: 0xd0d0d0 }), s * w * 0.22, h + w * 0.45, -d * 0.2, g, 4).rotation.z = -s * 0.5;
    const scr = mesh(new THREE.PlaneGeometry(w * 0.68, h * 0.72), t.m, -w * 0.1, h / 2, d / 2 + 0.012, g); scr.userData.keep = true; scr.castShadow = false; t.sets.push(scr);
    g.position.set(x, y, z); g.rotation.y = ry; g.traverse((o) => { if (o !== scr && o !== g) { o.userData.nopick = true; o.castShadow = false; } }); root.add(g); return { g, w, h, d, scr }; };
  const tubes = [];
  // the cart's own set, on its bracket by the front right post
  const mine = tube(0, true); tubes.push(mine); mine.vol = 0.3;
  const S = set(0.34, mine, 'black', 0.98, 1.92, -0.5, -0.75); box(0.4, 0.02, 0.34, mat({ color: 0x1a1a1c }), 0.98, 1.91, -0.5, root).rotation.y = -0.75; box(0.03, 0.4, 0.03, mat({ color: 0x1a1a1c }), 1.1, 2.1, -0.62, root);
  const glow = new THREE.PointLight(0x9ab8ff, 0.45, 1.7, 2); glow.position.set(-0.034, 0.14, 0.36); S.g.add(glow);
  const knob = (i, name, press) => { const k = cyl(S.w * 0.05, S.w * 0.05, 0.022, mat({ color: 0xc8c8c8, roughness: 0.4 }), S.w * 0.38, S.h * (0.74 - i * 0.2), S.d / 2 + 0.018, S.g, 12); k.rotation.x = Math.PI / 2; k.userData.dyn = true; const wp = new THREE.Vector3(), b = { getPos: () => k.getWorldPosition(wp), r: 0.04, name, press: () => { press(); k.rotation.y += 0.9; G.audio.play('click'); } }; k.userData.button = b; G.buttons.push(b); return k; };
  const tv = { root, mine, tubes, channels: CH, get on() { return mine.on; }, get ch() { return CH[mine.ch % CH.length]; } };
  tv.power = (on = !mine.on) => { mine.on = on; glow.visible = on; if (on) tune(mine); else mine.v.pause(); G.talk?.seen?.(on ? 'switch the little television on' : 'switch the television off'); };
  tv.next = () => { if (!mine.on) tv.power(true); mine.ch = (mine.ch + 1) % CH.length; mine.flash = 0.6; tune(mine); };
  tv.louder = () => { mine.vol = mine.vol >= 0.9 ? 0 : mine.vol + 0.3; if (mine.gain) mine.gain.gain.value = mine.vol; };
  knob(0, 'TV power', () => tv.power()); knob(1, 'TV channel', () => tv.next()); knob(2, 'TV volume', () => tv.louder());
  // the shop across the street: its window sets, every one of them playing
  const shop = (shops || []).filter((s) => s.type === 'tv').sort((a, b) => Math.abs(a.p.x) - Math.abs(b.p.x))[0];
  if (shop) { const far = shop.p.z < -8, z = shop.p.z + (far ? -1.25 : 1.25), ry = far ? 0 : Math.PI, two = [tube(3, false), tube(6, false)]; tubes.push(...two);
    [0.5, 0.36, 0.62, 0.4, 0.5].forEach((w, k) => set(w, two[k % 2], ['black', 'wood', 'black', 'red', 'wood'][k], shop.p.x - 1.15 + k * 0.58, 0.55, z, ry)); }
  mergeStatic(root);
  let started = false, snowT = 0;
  tv.update = (dt) => {
    if (!started) { if (!G.audio?.ctx || !G.mode) return; started = true; // sound from the set itself, once the page may make sound
      try { const ac = G.audio.ctx, src = ac.createMediaElementSource(mine.v), g = (mine.gain = ac.createGain()), pan = ac.createPanner(); g.gain.value = mine.vol; pan.panningModel = 'HRTF'; pan.refDistance = 0.8; pan.rolloffFactor = 1.2; pan.positionX.value = 0.98; pan.positionY.value = 2.05; pan.positionZ.value = -0.4; src.connect(g); g.connect(pan); pan.connect(G.audio.master); } catch (e) { /* silent set */ }
      tubes.forEach(tune); }
    if ((snowT -= dt) <= 0) { snowT = 0.09; drawSnow(); }
    for (const t of tubes) { t.flash = Math.max(0, (t.flash || 0) - dt); const live = t.on && !t.dead && t.v.readyState >= 2 && t.flash <= 0, want = !t.on ? null : live ? t.tex : snow; if (t.m.map !== want) { t.m.map = want; t.m.color.setRGB(want ? 1.35 : 0.02, want ? 1.35 : 0.02, want ? 1.45 : 0.03); t.m.needsUpdate = true; }
      if (t.on && (t.chk -= dt) <= 0) { t.chk = 6; if (t.dead) { t.src = ''; } tune(t); } }
    glow.intensity = mine.on ? 0.32 + Math.sin(G.t * 23) * 0.05 + Math.sin(G.t * 7.3) * 0.08 : 0;
  };
  G.tv = tv; return tv;
}
