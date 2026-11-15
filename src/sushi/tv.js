// the television sets: a 1980s portable on its shelf by the cart's front right post that you work by its knobs, and the TV shop's window of sets across the street, all on THE MARKET's channels (data/tv.json) and the cart's own, the late movie and classic TV (data/sushi/films.json), from the Internet Archive through /film; the sets are Poly Haven's models
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { G, mat, mesh, box, cyl, mergeStatic } from './ctx.js';
import TVD from '../../data/tv.json';
import FILMS from '../../data/sushi/films.json';

const CH = [...TVD.channels, ...FILMS.channels].filter((c) => !c.live && c.shows.length && c.shows[0].file);
const at = (c) => { let t = (Date.now() / 1000) % c.shows.reduce((a, s) => a + s.len, 0); for (const s of c.shows) { if (t < s.len) return { s, off: t }; t -= s.len; } return { s: c.shows[0], off: 0 }; }; // what is on now: every set on a channel shows the same moment
// a model off the shelf, once per file, in the game's one cheap material; every copy shares it
const gl = new GLTFLoader(), got = {};
export const glb = (file, tint = 0xa8a8a8) => (got[file] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { d.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: tint }); o.castShadow = false; o.userData.nopick = true; } }); return d.scene; }));
// the sets' own measures (metres, standing on their feet, facing +z): width, the glass's middle and size, and how far forward the glass stands
const SETS = { television_01: { w: 0.6, sx: -0.0625, sy: 0.2575, sw: 0.375, sh: 0.285, sz: 0.197 }, television_02: { w: 0.4, sx: -0.0015, sy: 0.257, sw: 0.313, sh: 0.23, sz: 0.125 } };

export function buildTV(scene, shops) {
  const root = new THREE.Group(); scene.add(root);
  const sc = document.createElement('canvas'); sc.width = 64; sc.height = 48; const sg = sc.getContext('2d'), snow = new THREE.CanvasTexture(sc); snow.colorSpace = THREE.SRGBColorSpace; snow.magFilter = THREE.NearestFilter;
  const drawSnow = () => { const im = sg.createImageData(64, 48); for (let i = 0; i < 64 * 48; i++) { const v = (Math.random() * 200) | 0; im.data[i * 4] = im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v + 14; im.data[i * 4 + 3] = 255; } sg.putImageData(im, 0, 0); snow.needsUpdate = true; }; drawSnow();
  // a tube: one picture off the air, shown on every set tuned to it
  const tube = (ch, loud) => { const v = document.createElement('video'); v.playsInline = true; v.preload = 'none'; v.muted = !loud; v.loop = false; const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
    const t = { v, tex, ch, src: '', dead: false, on: true, sets: [], m: new THREE.MeshBasicMaterial({ map: snow, color: new THREE.Color(1.35, 1.35, 1.45), toneMapped: false }), chk: 0 };
    v.addEventListener('error', () => { t.dead = true; }); v.addEventListener('ended', () => tune(t)); return t; };
  const tune = (t) => { if (!t.on) { t.v.pause(); return; } const { s, off: o } = at(CH[t.ch % CH.length]), u = '/film/' + s.id + '/' + s.file; if (u !== t.src) { t.src = u; t.dead = false; t.v.src = u; t.flash = 0.5; } try { if (Math.abs(t.v.currentTime - o) > 4) t.v.currentTime = o; } catch (e) { /* not ready */ } const p = t.v.play(); if (p && p.catch) p.catch(() => { }); };
  // a set: the model, scaled to its width, and the picture on its glass
  const set = (file, w, t, x, y, z, ry) => { const M = SETS[file], k = w / M.w, g = new THREE.Group(), body = new THREE.Group(); body.scale.setScalar(k); g.add(body);
    const scr = mesh(new THREE.PlaneGeometry(M.sw, M.sh), t.m, M.sx, M.sy, M.sz, body); scr.userData.keep = true; scr.castShadow = false; t.sets.push(scr);
    glb(file).then((m) => { body.add(m.clone()); tv.models = (tv.models || 0) + 1; }).catch(() => box(M.w, M.sy * 2, M.sz * 2, mat({ color: 0x2a2a2e }), 0, M.sy, 0, body));   // no model: a plain box behind the glass
    g.position.set(x, y, z); g.rotation.y = ry; root.add(g); return { g, body, k, M }; };
  const tubes = [], tv = { root, tubes, channels: CH };
  // the cart's own set: a wood-cased portable on a shelf at the front right post, below the ticket rail and turned to the cook
  const mine = tube(0, true); tubes.push(mine); mine.vol = 0.3;
  const S = set('television_01', 0.456, mine, 0.9, 1.625, -0.38, -0.75), shelf = mat({ color: 0x1a1a1c, roughness: 0.6 });
  box(0.5, 0.02, 0.4, shelf, 0, -0.01, -0.02, S.g); const arm = box(0.3, 0.02, 0.03, shelf, 1.03, 1.615, -0.47, root); arm.rotation.y = 0.6;
  const glow = new THREE.PointLight(0x9ab8ff, 0.45, 1.7, 2); glow.position.set(-0.03, 0.2, 0.3); S.g.add(glow);
  const knob = (x, y, r, name, press) => { const k = cyl(r, r, 0.012, mat({ color: 0x1c1c1e, roughness: 0.5 }), x, y, 0.218, S.body, 16); k.rotation.x = Math.PI / 2; box(r * 0.25, 0.004, r * 0.9, mat({ color: 0xd8d8d0 }), 0, 0.007, -r * 0.45, k); k.userData.dyn = true;
    const wp = new THREE.Vector3(), b = { getPos: () => k.getWorldPosition(wp), r: 0.04, name, press: () => { press(); k.rotation.y += 0.9; G.audio.play('click'); } }; k.userData.button = b; G.buttons.push(b); return k; };
  Object.assign(tv, { mine }); Object.defineProperties(tv, { on: { get: () => mine.on }, ch: { get: () => CH[mine.ch % CH.length] } });
  tv.power = (on = !mine.on) => { mine.on = on; glow.visible = on; if (on) tune(mine); else mine.v.pause(); G.talk?.seen?.(on ? 'switch the little television on' : 'switch the television off'); };
  tv.next = () => { if (!mine.on) tv.power(true); mine.ch = (mine.ch + 1) % CH.length; mine.flash = 0.6; tune(mine); };
  tv.louder = () => { mine.vol = mine.vol >= 0.9 ? 0 : mine.vol + 0.3; if (mine.gain) mine.gain.gain.value = mine.vol; };
  knob(0.247, 0.204, 0.012, 'TV power', () => tv.power()); knob(0.212, 0.345, 0.034, 'TV channel', () => tv.next()); knob(0.212, 0.265, 0.034, 'TV volume', () => tv.louder());
  // the shop across the street: its window sets, every one of them playing
  const shop = (shops || []).filter((s) => s.type === 'tv').sort((a, b) => Math.abs(a.p.x) - Math.abs(b.p.x))[0];
  if (shop) { const far = shop.p.z < -8, z = shop.p.z + (far ? -1.25 : 1.25), ry = far ? 0 : Math.PI, two = [tube(3, false), tube(6, false)]; tubes.push(...two);
    [0.5, 0.36, 0.62, 0.4, 0.5].forEach((w, k) => set(k % 2 ? 'television_02' : 'television_01', w, two[k % 2], shop.p.x - 1.15 + k * 0.58, 0.55, z, ry)); }
  mergeStatic(root);
  let started = false, snowT = 0;
  tv.update = (dt) => {
    if (!started) { if (!G.audio?.ctx || !G.mode) return; started = true; // sound from the set itself, once the page may make sound
      try { const ac = G.audio.ctx, src = ac.createMediaElementSource(mine.v), g = (mine.gain = ac.createGain()), pan = ac.createPanner(); g.gain.value = mine.vol; pan.panningModel = 'HRTF'; pan.refDistance = 0.8; pan.rolloffFactor = 1.2; pan.positionX.value = 0.9; pan.positionY.value = 1.8; pan.positionZ.value = -0.36; src.connect(g); g.connect(pan); pan.connect(G.audio.master); } catch (e) { /* silent set */ }
      tubes.forEach(tune); }
    if ((snowT -= dt) <= 0) { snowT = 1.5; drawSnow(); }   // a still, dim snow that changes slowly: nothing flashes
    for (const t of tubes) { t.flash = Math.max(0, (t.flash || 0) - dt); const live = t.on && !t.dead && t.v.readyState >= 2 && t.flash <= 0, want = !t.on ? null : live ? t.tex : snow; if (t.m.map !== want) { t.m.map = want; t.m.needsUpdate = true; } { const easy = G.set && G.set.easy, k = !want ? 0.02 : want === snow ? (easy ? 0.05 : 0.45) : easy ? 0.95 : 1.35; t.m.color.setRGB(k, k, k * 1.07); }   // easy on the eyes: no static to speak of, a picture no brighter than the room
      if (t.on && (t.chk -= dt) <= 0) { t.chk = 6; if (t.dead) { t.src = ''; } tune(t); } }
    glow.intensity = mine.on ? 0.32 : 0;
  };
  G.tv = tv; return tv;
}
