// the television sets: a 1980s portable on its shelf by the cart's front right post that you work by its knobs (it comes on by itself at dusk: THE LATE MOVIE), and a TV repair shop's window of sets where the street has one; the channel knob steps through what is on the air (data/sushi/films.json): CREATURE FEATURE, Night of the Living Dead from a small copy of our own (data/sushi/film/), and THE MARKET's own channels of public-domain cartoons, shows and films from before 1985 (data/tv.json), streamed from the Internet Archive; our own film runs on the real clock, a streamed channel's line-up too (which programme is on), each programme from its beginning (the Archive sends a whole file, never a part), the next when it ends; snow while a picture comes; a picture is drawn small, twelve times a second, with the channel's number over it for a moment after the knob is turned; the sets are Poly Haven's models; each picture on a tube's curved glass (crt: its lines and phosphor stripes seen up close, dark rounded corners, the lamps' shine on the glass); a picture's light is steady and dim (nothing flashes)
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, mergeStatic } from './ctx.js';
import { glb } from './models.js';
import FILMS from '../../data/sushi/films.json';
import MARKET from '../../data/tv.json';

const IA = 'https://archive.org/cors/',   // (the Archive's door for other sites' pages: it answers them, but only with a whole file from its start)
   TAKE = (FILMS.market && FILMS.market.take) || [];
const CH = [...MARKET.channels.filter((c) => TAKE.includes(c.ch) && !c.live && c.shows.length).map((c) => ({ ch: c.ch, name: c.name, sub: c.sub, stream: true, shows: c.shows.map((x) => ({ id: x.id, len: x.len, title: x.title, src: IA + x.id + '/' + x.file })) })),
  ...FILMS.channels.filter((c) => c.shows.length && (c.shows[0].src || c.shows[0].file))].sort((a, b) => a.ch - b.ch);   // by their numbers, as the knob turns
const at = (c) => { let t = (Date.now() / 1000) % c.shows.reduce((a, s) => a + s.len, 0); for (const s of c.shows) { if (t < s.len) return { s, off: t }; t -= s.len; } return { s: c.shows[0], off: 0 }; }; // what is on now: every set on a channel shows the same moment
// the sets' own measures (metres, standing on their feet, facing +z): width, the glass's middle and size, and how far forward the glass stands
const SETS = { television_01: { w: 0.6, sx: -0.0625, sy: 0.2575, sw: 0.375, sh: 0.285, sz: 0.197 }, television_02: { w: 0.4, sx: -0.0015, sy: 0.257, sw: 0.313, sh: 0.23, sz: 0.125 } };

// a tube's face: the glass bulges toward you; up close the picture is lines of three-coloured phosphor, fading to a plain picture with distance (so nothing shimmers); the corners are rounded and a little darker
const face = (w, h, bulge) => { const g = new THREE.PlaneGeometry(w, h, 16, 12), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2); p.setZ(i, bulge * (1 - 0.5 * (x * x + y * y))); } g.computeVertexNormals(); return g; };
const crt = (m) => { m.onBeforeCompile = (s) => {
  s.vertexShader = s.vertexShader.replace('void main() {', 'varying vec2 vCrt;\nvoid main() {\n  vCrt = uv;');
  s.fragmentShader = s.fragmentShader.replace('void main() {', 'varying vec2 vCrt;\nvoid main() {').replace('#include <map_fragment>', `#include <map_fragment>
  { vec2 cu = vCrt * 2.0 - 1.0; vec2 cq = abs(cu) - vec2(0.84); float rd = length(max(cq, 0.0)) / 0.16;
    float ly = vCrt.y * 220.0, lx = vCrt.x * 280.0, near = clamp(1.0 - max(fwidth(ly), fwidth(lx)) * 1.7, 0.0, 1.0);
    float scan = 0.74 + 0.26 * (0.5 + 0.5 * cos(ly * 6.2832));
    vec3 tri = 0.78 + 0.22 * (0.5 + 0.5 * cos(6.2832 * (lx - vec3(0.0, 0.3333, 0.6667)))) * 1.9;
    diffuseColor.rgb *= mix(vec3(1.0), scan * tri * 1.18, near);
    diffuseColor.rgb *= (1.0 - 0.42 * pow(dot(cu, cu) * 0.5, 1.5)) * (1.0 - smoothstep(0.8, 1.0, rd)); }`); };
  m.customProgramCacheKey = () => 'crt'; return m; };

export function buildTV(scene, shops) {
  const root = new THREE.Group(); scene.add(root);
  const sc = document.createElement('canvas'); sc.width = 64; sc.height = 48; const sg = sc.getContext('2d'), snow = new THREE.CanvasTexture(sc); snow.colorSpace = THREE.SRGBColorSpace; snow.magFilter = THREE.NearestFilter;
  const drawSnow = () => { const im = sg.createImageData(64, 48); for (let i = 0; i < 64 * 48; i++) { const v = (Math.random() * 200) | 0; im.data[i * 4] = im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v + 14; im.data[i * 4 + 3] = 255; } sg.putImageData(im, 0, 0); snow.needsUpdate = true; }; drawSnow();
  const glass = new THREE.MeshPhongMaterial({ color: 0x000000, emissive: 0x04050a, specular: 0x1a1c20, shininess: 46, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  // a tube: one picture off the air, shown on every set tuned to it
  const tube = (ch, loud) => { const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.playsInline = true; v.preload = 'none'; v.muted = !loud; v.loop = false; const pc = document.createElement('canvas'); pc.width = 160; pc.height = 120; const tex = new THREE.CanvasTexture(pc); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
    const t = { v, tex, pc, pg: pc.getContext('2d'), acc: 0, osd: 0, ch, loud, src: '', dead: false, on: true, sets: [], m: crt(new THREE.MeshBasicMaterial({ map: snow, color: new THREE.Color(0.05, 0.05, 0.053), toneMapped: false })), chk: 0 };
    v.addEventListener('error', () => { t.dead = true; }); v.addEventListener('ended', () => { t.k++; tune(t); }); return t; };
  const tune = (t) => { if (!t.on) { t.v.pause(); return; } const c = CH[t.ch % CH.length]; let s, o = -1;
    if (c.stream) { if (t.cur !== c) { t.cur = c; t.k = c.shows.indexOf(at(c).s); } s = c.shows[t.k % c.shows.length]; } else { t.cur = c; ({ s, off: o } = at(c)); }
    const u = s.src || '/film/' + s.id + '/' + s.file; if (u !== t.src) { t.src = u; t.dead = false; t.v.src = u; t.flash = 0.5; t.title = s.title; } try { if (o >= 0 && Math.abs(t.v.currentTime - o) > 4) t.v.currentTime = o; } catch (e) { /* not ready */ } const p = t.v.play(); if (p && p.catch) p.catch(() => { }); };
  // a set: the model, scaled to its width, and the picture on its glass
  const set = (file, w, t, x, y, z, ry) => { const M = SETS[file], k = w / M.w, g = new THREE.Group(), body = new THREE.Group(); body.scale.setScalar(k); g.add(body);
    const fg = face(M.sw, M.sh, M.sw * 0.045), scr = mesh(fg, t.m, M.sx, M.sy, M.sz - M.sw * 0.012, body); scr.userData.keep = true; scr.castShadow = false; t.sets.push(scr);
    if (t.loud) { const gl = mesh(fg, glass, M.sx, M.sy, M.sz - M.sw * 0.012 + 0.0015, body); gl.userData.keep = true; gl.castShadow = false; gl.renderOrder = 2; }   // the cart's own set: the lamps shine on its glass
    glb(file).then((m) => { body.add(m.clone()); tv.models = (tv.models || 0) + 1; }).catch(() => box(M.w, M.sy * 2, M.sz * 2, mat({ color: 0x2a2a2e }), 0, M.sy, 0, body));   // no model: a plain box behind the glass
    g.position.set(x, y, z); g.rotation.y = ry; root.add(g); return { g, body, k, M }; };
  const tubes = [], tv = { root, tubes, channels: CH };
  // the cart's own set: a wood-cased portable on a shelf at the front right post, below the ticket rail and turned to the cook
  const mine = tube(Math.max(0, CH.findIndex((c) => c.name === 'CREATURE FEATURE')), true); tubes.push(mine); mine.vol = 0.3; mine.on = false;   // dark by day; at dusk it comes on to the creature feature
  const S = set('television_01', 0.82, mine, 1.1, 1.625, -0.38, -0.75), shelf = mat({ color: 0x1a1a1c, roughness: 0.6 });
  box(0.9, 0.02, 0.72, shelf, 0, -0.01, -0.04, S.g); const arm = box(0.5, 0.02, 0.03, shelf, 1.3, 1.615, -0.52, root); arm.rotation.y = 0.6;
  const glow = new THREE.PointLight(0x9ab8ff, 0.45, 2.4, 2); glow.position.set(-0.06, 0.4, 0.6); S.g.add(glow);
  const knob = (x, y, r, name, press) => { const k = cyl(r, r, 0.012, mat({ color: 0x1c1c1e, roughness: 0.5 }), x, y, 0.218, S.body, 16); k.rotation.x = Math.PI / 2; box(r * 0.25, 0.004, r * 0.9, mat({ color: 0xd8d8d0 }), 0, 0.007, -r * 0.45, k); k.userData.dyn = true;
    const wp = new THREE.Vector3(), b = { getPos: () => k.getWorldPosition(wp), r: 0.04, name, press: () => { press(); k.rotation.y += 0.9; G.audio.play('click'); } }; k.userData.button = b; G.buttons.push(b); return k; };
  Object.assign(tv, { mine }); Object.defineProperties(tv, { on: { get: () => mine.on }, ch: { get: () => CH[mine.ch % CH.length] } });
  tv.auto = (on) => { if (mine.on === on) return; mine.on = on; glow.visible = on; if (on) tune(mine); else mine.v.pause(); };   // (the hour's doing, not the cook's)
  tv.power = (on = !mine.on) => { mine.on = on; glow.visible = on; if (on) tune(mine); else mine.v.pause(); G.talk?.seen?.(on ? 'switch the little television on' : 'switch the television off'); };
  tv.next = (d = 1) => { if (!mine.on) tv.power(true); mine.ch = (mine.ch + d + CH.length) % CH.length; mine.flash = 0.6; mine.osd = 4; tune(mine); plate(); G.talk?.seen?.('turn the television to ' + CH[mine.ch].name.toLowerCase()); };
  tv.louder = () => { mine.vol = mine.vol >= 0.85 ? 0 : Math.round(mine.vol * 10 + 3) / 10; if (mine.gain) mine.gain.gain.value = mine.vol; };   // 0.3, 0.6, 0.9, then off
  const ptex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 40; const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; })(), plate = () => { const g = ptex.image.getContext('2d'), c = CH[mine.ch % CH.length]; g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, 128, 40); g.fillStyle = '#e8e2c8'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText('CH ' + c.ch, 64, 29); ptex.needsUpdate = true; };
  { const pl = mesh(new THREE.PlaneGeometry(0.07, 0.022), new THREE.MeshBasicMaterial({ map: ptex, color: 0xb0b0b0 }), 0.212, 0.398, 0.2125, S.body); pl.userData.keep = true; pl.userData.dyn = true; pl.userData.noread = true; pl.castShadow = false; plate(); }   // which channel the knob is on, written over it
  knob(0.247, 0.204, 0.012, 'TV power', () => tv.power()); knob(0.212, 0.345, 0.034, 'TV channel', () => tv.next()); knob(0.212, 0.265, 0.034, 'TV volume', () => tv.louder());
  // the shop across the street: its window sets, every one of them playing
  const shop = (shops || []).filter((s) => s.type === 'tv').sort((a, b) => Math.abs(a.p.x) - Math.abs(b.p.x))[0];
  if (shop) { const far = shop.p.z < -8, z = shop.p.z + (far ? -1.25 : 1.25), ry = far ? 0 : Math.PI, two = [tube(3, false), tube(6, false)]; tubes.push(...two);
    [0.5, 0.36, 0.62, 0.4, 0.5].forEach((w, k) => set(k % 2 ? 'television_02' : 'television_01', w, two[k % 2], shop.p.x - 1.15 + k * 0.58, 0.55, z, ry)); }
  mergeStatic(root);
  let started = false, snowT = 0;
  tv.update = (dt) => {
    if (!started) { if (!G.audio?.ctx || !G.mode) return; started = true; // sound from the set itself, once the page may make sound
      try { const ac = G.audio.ctx, src = ac.createMediaElementSource(mine.v), g = (mine.gain = ac.createGain()), sp = G.audio.spatial('tv'); g.gain.value = mine.vol; S.g.updateMatrixWorld(true); sp.at = S.body.localToWorld(new THREE.Vector3(S.M.sx, S.M.sy, S.M.sz)); src.connect(g); g.connect(sp.input); } catch (e) { /* silent set */ }
      tubes.forEach(tune); }
    if ((snowT -= dt) <= 0) { snowT = 1.5; drawSnow(); }   // a still, dim snow that changes slowly: nothing flashes
    for (const t of tubes) { t.flash = Math.max(0, (t.flash || 0) - dt); t.osd = Math.max(0, t.osd - dt); const live = t.on && !t.dead && t.v.readyState >= 2 && t.flash <= 0, want = !t.on ? null : live ? t.tex : snow;
      if (live && (t.acc += dt) >= 1 / 12) { t.acc = 0; try { const g = t.pg, vw = t.v.videoWidth || 160, vh = t.v.videoHeight || 120, k = Math.min(160 / vw, 120 / vh), w = vw * k, h = vh * k; if (w < 159 || h < 119) { g.fillStyle = '#000'; g.fillRect(0, 0, 160, 120); } g.drawImage(t.v, (160 - w) / 2, (120 - h) / 2, w, h);
        if (t.osd > 0) { const c = CH[t.ch % CH.length]; g.font = 'bold 13px monospace'; g.textAlign = 'left'; g.fillStyle = '#000'; g.fillText(c.ch + ' ' + c.name, 9, 19, 142); g.fillStyle = '#38e850'; g.fillText(c.ch + ' ' + c.name, 8, 18, 142); } t.tex.needsUpdate = true; } catch (e) { t.dead = true; } } if (t.m.map !== want) { t.m.map = want; t.m.needsUpdate = true; } { const easy = G.set && G.set.easy, k = !want ? 0.02 : want === snow ? (easy ? 0.05 : 0.45) : easy ? 0.95 : 1.35; t.m.color.setRGB(k, k, k * 1.07); }   // easy on the eyes: no static to speak of, a picture no brighter than the room
      if (t.on && (t.chk -= dt) <= 0) { t.chk = 6; if (t.dead) { t.src = ''; if (t.cur && t.cur.stream) t.k++; } tune(t); } }   // (a programme that will not come gives way to the next)
    glow.intensity = mine.on ? 0.32 : 0;
  };
  if (G.clock) { G.clock.on('dusk', () => tv.auto(true)); G.clock.on('night', () => tv.auto(true)); G.clock.on('reset', () => tv.auto(false)); G.clock.on('end', () => tv.auto(false)); }
  G.tv = tv; return tv;
}
