// DEAD END: sixty seconds to hide in an empty school at night, then something comes in to look for you. This file is the round (ready, hide, seek, the end), the signs you read, and the loop that moves everything.
import { CLOCK, THREE, Q, clamp, lerp, rnd, renderer, scene, camera, rig, P, initPhysics, loadAssets, reflect, ray } from './core.js';
import { WORLD, build } from './world.js';
import { PL } from './player.js';
import { SK } from './seeker.js';
import { A } from './sound.js';
import { SPOTS } from './spots.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = id => document.getElementById(id), keep = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };
const G = { unlock: 0, mode: 'title', t: 0, left: 60, won: false, rounds: 0, beat: 0, drip: 2, odd: 8, storm: rnd(20, 45), flash: 0 };
document.body.appendChild(renderer.domElement);

/* signs: a small one that rides at the top of your sight (the count), a large one that stands in the alley (start, the end) */
const sign = (w, h, pw, ph) => { const c = document.createElement('canvas'); c.width = pw; c.height = ph; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, fog: false })); m.renderOrder = 50; m.visible = false; return { m, g: c.getContext('2d'), t, c }; };
const hud = sign(.42, .21, 512, 256), board = sign(1.5, 1.125, 1024, 768); hud.m.position.set(0, .2, -1); camera.add(hud.m); scene.add(board.m);
const black = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0, side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, fog: false })); black.renderOrder = 60; camera.add(black);
function hudSay(big, small, col = '#d8d2c2') { const g = hud.g; g.clearRect(0, 0, 512, 256); hud.m.visible = !!(big || small); if (!hud.m.visible) return; g.textAlign = 'center'; g.shadowColor = '#000'; g.shadowBlur = 12; g.fillStyle = col; g.font = '600 150px ui-monospace,Menlo,monospace'; g.fillText(big, 256, 160); g.font = '500 34px ui-monospace,Menlo,monospace'; g.fillStyle = '#9a958a'; g.fillText(small || '', 256, 222); hud.t.needsUpdate = true; }
function boardSay(title, lines, foot, col = '#d8d2c2') { const g = board.g; g.clearRect(0, 0, 1024, 768); g.fillStyle = 'rgba(4,5,6,.86)'; g.fillRect(0, 0, 1024, 768); g.strokeStyle = '#3a3830'; g.lineWidth = 3; g.strokeRect(14, 14, 996, 740); g.textAlign = 'left'; g.fillStyle = col; g.font = '500 84px Georgia,serif'; g.fillText(title, 60, 130);
  g.font = '400 31px ui-monospace,Menlo,monospace'; let y = 200; for (const [txt, c] of lines) { g.fillStyle = c || '#a9a497'; const words = String(txt).split(' '); let row = ''; for (const w of words) { if (g.measureText(row + w).width > 900) { g.fillText(row, 60, y); y += 40; row = ''; } row += w + ' '; } g.fillText(row, 60, y); y += 50; if (y > 660) break; }
  g.fillStyle = '#d8d2c2'; g.font = '500 30px ui-monospace,Menlo,monospace'; g.fillText(foot, 60, 722); board.t.needsUpdate = true; board.m.visible = true;
  const f = PL.fwd.clone().setY(0).normalize(); if (f.lengthSq() < .1) f.set(0, 0, -1); const p = PL.head.clone().addScaledVector(f, 1.35); for (let d = 1.35; d > .5; d -= .15) { p.copy(PL.head).addScaledVector(f, d); if (PL.fits(.5, p.x, Math.max(.1, PL.head.y - .3), p.z)) break; } board.m.position.set(p.x, Math.max(1.05, PL.head.y), p.z); board.m.lookAt(PL.head.x, board.m.position.y, PL.head.z); }
const KEYS = () => renderer.xr.isPresenting ? 'TRIGGER' : 'E';

/* each night is a little different: the rain, the fog, a lamp out, a lid chained, the shutter down, and where the key lies */
const plain = () => ({ rain: 1, fog: 1, lampOut: false, locked: '', shutter: false, key: 0 });
function rollNight() { return { ...plain(), key: Q.get('night') === 'plain' ? 0 : Math.floor(Math.random() * 8) }; }   // one night only: fog. The key lies somewhere different each time
function applyNight(N) { WORLD.night = N; scene.fog.density = .07 * N.fog; SK.cfg.mask = 1; WORLD.shutter(N.shutter); WORLD.setPower(true);
  for (const id in P.lids) { const d = P.lids[id]; if (d.was0 === undefined) d.was0 = d.was; d.locked = false; d.was = d.was0; d.ang0 = d.ang00; if (id === N.locked) { d.set(false); d.was = false; d.ang0 = 0; d.locked = true; } }
  const k = N.shutter && N.key === 4 ? 0 : N.key, at = WORLD.keySpots[k], T = WORLD.key; T.o.visible = true; T.b.setTranslation({ x: at[0], y: at[1] + .04, z: at[2] }, true); T.b.setLinvel({ x: 0, y: 0, z: 0 }, true); T.b.setAngvel({ x: 0, y: 0, z: 0 }, true); T.o.position.copy(T.b.translation()); }
const nightWords = N => [N.rain > 1.2 ? 'heavy rain (it hears less)' : N.rain < .8 ? 'the rain is easing (it hears more)' : '', N.fog > 1.2 ? 'thick fog' : '', N.lampOut ? 'the big lamp is out' : '', N.locked ? { dumpster1: 'the near dumpster is chained shut', dumpster2: 'the far dumpster is chained shut', locker: 'the locker is chained shut' }[N.locked] : '', N.shutter ? 'the shutter is down' : ''].filter(Boolean).join(' · ') || 'an ordinary night';
let noteT = 0; const hudNote = (t, secs = 2.5) => { const g = hud.g; g.clearRect(0, 0, 512, 256); g.textAlign = 'center'; g.shadowColor = '#000'; g.shadowBlur = 10; g.fillStyle = '#d8d2c2'; g.font = '500 36px ui-monospace,Menlo,monospace'; g.fillText(t, 256, 150); hud.t.needsUpdate = true; hud.m.visible = true; noteT = secs; };
function ready(roll = true) { G.mode = 'ready'; G.t = 0; hudSay('', ''); PL.frozen = false; black.material.color.set(0); if (roll || !WORLD.night) G.night = rollNight(); applyNight(G.night); const HIDE = hideT();
  boardSay('DEAD END', [['An empty school. You have ' + HIDE + ' seconds to hide. Then it comes in through the doors behind you.'], ['It hears steps, breath and anything you knock; sees breath in its light, your footprints in the dust of the rooms, a torn cobweb, and what has moved or been shut. Throw something to draw it off. Somewhere there is a key to the chained fire door at the far end.'],
    [renderer.xr.isPresenting ? 'LEFT STICK walk · RIGHT STICK turn, pull down to crouch · TRIGGER (either hand) take hold: carry, throw, swing a door, pull yourself up · a hand over your mouth holds your breath' : 'WASD walk · SHIFT run · C crouch/lie · MOUSE take hold: carry, throw, swing a door · E open/shut · SPACE climb over · Q hold your breath', '#77736a'], ['Its mind: ' + (SK.mode === 'claude' ? 'Claude Haiku' : 'instinct only' + (G.mindNote ? ' (' + G.mindNote + ')' : '')), '#77736a']], (renderer.xr.isPresenting ? 'TRIGGER' : 'CLICK OR E') + ' TO START'); }
const hideT = () => +Q.get('t') || 60;
function startRound() { if (G.mode !== 'ready') return; const HIDE = hideT(); G.unlock = 0; G.mode = 'hide'; G.t = 0; G.left = HIDE; G.rounds++; board.m.visible = false; A.start(); A.flat('heart', .5); hudSay(String(HIDE), 'HIDE'); }
// how it came out: caught, outlasted, or out through the cellar; and where you were is something it will remember
function end(won, how) { G.mode = 'end'; G.t = 0; G.won = won; G.how = how || (won ? 'gaveup' : 'caught'); PL.frozen = !won; hudSay('', ''); if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  let near = null, nd = 2.6; for (const sp of SPOTS) { const g = WORLD.GEO[sp.id], d = Math.hypot(g.look[0] - PL.pos.x, g.look[2] - PL.pos.z); if (d < nd) { nd = d; near = sp.id; } } G.spot = near;
  if (near && G.how === 'caught') { SK.habits[near] = (SK.habits[near] || 0) + 1; keep('deadend.habits', JSON.stringify(SK.habits)); if (SK.mode === 'claude' && location.protocol.startsWith('http')) fetch('/hide/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ remember: near }) }).catch(() => {}); }
  const th = SK.thoughts.slice(-7).map(t => [t.at + 's  "' + t.text + '"', t.action === 'spotted' || t.action === 'caught' ? '#c2452f' : '#a9a497']);
  boardSay(G.how === 'escaped' ? 'YOU GOT OUT' : won ? 'IT GAVE UP' : 'IT FOUND YOU', [[G.how === 'escaped' ? 'Out through the fire door, with it still looking.' : won ? 'You outlasted it. It searched ' + Object.keys(SK.searched).length + ' of ' + SPOTS.length + ' places.' : 'Caught after ' + Math.round(SK.t) + ' seconds of hunting.', '#d8d2c2'], ['What it was thinking:', '#77736a'], ...th], KEYS() + ' TO PLAY AGAIN', won ? '#d8d2c2' : '#c2452f'); }
function reset() { for (const T of P.things) { T.b.setTranslation(T.home.p, false); T.b.setRotation(T.home.q, false); T.b.setLinvel({ x: 0, y: 0, z: 0 }, false); T.b.setAngvel({ x: 0, y: 0, z: 0 }, false); T.b.sleep(); T.o.position.copy(T.home.p); T.o.quaternion.copy(T.home.q); }
  for (const id in P.lids) { P.lids[id].home(); } WORLD.cloth.reset(); WORLD.webReset(); SK.reset(); PL.place(0, 0, -2.6, renderer.xr.isPresenting ? rig.rotation.y : 0); PL.update(.016); ready(); }
// the breaker box cuts the alley's own lamps (not the street's, the moon's or its torch): darkness for you, and a loud clunk that tells it where you were
WORLD.setPower = on => { if (WORLD.power === on) return; WORLD.power = on; A.at('lid', WORLD.breaker, .9, 1.7); for (const L of WORLD.slow) L.shadow.needsUpdate = true; };
PL.onUse = (at = PL.head) => { if (at === PL.head) at = PL.head.clone().addScaledVector(PL.fwd, .7); if (G.mode === 'ready') { startRound(); return true; } if (G.mode === 'end' && G.t > 1.5) { reset(); return true; }
  if ((G.mode === 'hide' || G.mode === 'seek') && at.distanceTo(WORLD.breaker) < .9) { WORLD.setPower(!WORLD.power); PL.noise(WORLD.breaker, .9, 'the breaker thrown'); hudNote(WORLD.power ? 'THE LAMPS COME BACK' : 'THE LAMPS GO OUT'); return true; }
  if (G.mode === 'hide' || G.mode === 'seek') for (const d of WORLD.doors.slice(1)) if (at.distanceTo(d) < .9) { hudNote('LOCKED'); A.at(['metal1', 'metal2'], d, .4, 1.6); PL.noise(d, .35, 'a door rattled'); return true; }
  if ((G.mode === 'hide' || G.mode === 'seek') && at.distanceTo(WORLD.door) < 1.3) { if (PL.key) { if (!G.unlock) { G.unlock = .01; A.at('gate', WORLD.door, .5, 2); PL.noise(WORLD.door, .5, 'a lock turning'); } } else { hudNote('CHAINED. THERE IS A KEY SOMEWHERE.'); A.at(['metal1', 'metal2'], WORLD.door, .4, 1.6); PL.noise(WORLD.door, .35, 'a door rattled'); } return true; } return false; };
addEventListener('keydown', e => { if (e.code === 'Enter') PL.onUse(); });

/* things striking things: the sound you hear is the noise it hears */
const balls = [];
function physics(dt) { for (const T of P.things) if (!T.b.isSleeping()) { const v = T.b.linvel(), w = T.b.angvel(); T.v = Math.hypot(v.x, v.y, v.z) + Math.hypot(w.x, w.y, w.z) * .25; } else T.v = 0;
  P.world.timestep = dt; P.world.step(P.eq); const t = CLOCK.t;
  const hits = []; P.eq.drainContactForceEvents(e => { hits.push(e.collider1(), e.collider2()); }); { for (const h of hits) { const T = P.byCol.get(h); if (!T || T.fixed || t - T.lastHit < .16) continue; const v2 = T.b.linvel(), v = Math.max(T.v || 0, Math.hypot(v2.x, v2.y, v2.z)); if (v < .45) continue; T.lastHit = t;
      const p = T.b.translation(), loud = clamp(v / 4.5, .05, 1) * clamp(T.mass / 6, .35, 1.25), carried = A.hit(T.kind, p, loud); const mine = !(T.monT && t - T.monT < 1.5) && ((t - (T.plT || -99) < 8 && !(T.monT > T.plT)) || Math.hypot(p.x - PL.pos.x, p.z - PL.pos.z) < 1 || PL.hands.some(H => H.on && Math.hypot(p.x - H.pos.x, p.y - H.pos.y, p.z - H.pos.z) < .4)); if (G.mode === 'seek' && mine) PL.noise(p, carried, T.name + ' struck'); } }
  for (const T of P.things) if (!T.b.isSleeping()) { T.o.position.copy(T.b.translation()); T.o.quaternion.copy(T.b.rotation()); }
  WORLD.cloth.step(dt, PL.balls(balls)); }

let last = 0; const mv = [], movers = () => { mv.length = 0; mv.push(PL.pos.x, PL.pos.y + .9, PL.pos.z, PL.speed); if (SK.g.visible) mv.push(SK.pos.x, 1.1, SK.pos.z, SK.state === 'chase' ? 3.3 : SK.path.length ? 1.25 : 0); for (const T of P.things) if (T.v > .05) { const p = T.b.translation(); mv.push(p.x, p.y, p.z, T.v > 1.2 ? Math.min(6, T.v) : .1); } return mv; };
// on a screen the eye focuses where you look and the rest goes soft (a headset's own lenses do that, and its two pictures cannot be post-processed)
const LENS = { uniforms: { tDiffuse: { value: null }, t: { value: 0 }, px: { value: new THREE.Vector2(1 / 1280, 1 / 720) } }, vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float t; uniform vec2 px; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + t * 37.) * 43758.5453); }
    void main(){ vec2 c = vUv - .5; float r2 = dot(c, c); vec2 f = c * r2 * .012;
      vec3 a = vec3(texture2D(tDiffuse, vUv + f).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - f).b);
      vec3 s = (texture2D(tDiffuse, vUv + px * vec2(1.2, .5)).rgb + texture2D(tDiffuse, vUv + px * vec2(-.5, 1.2)).rgb + texture2D(tDiffuse, vUv + px * vec2(-1.2, -.5)).rgb + texture2D(tDiffuse, vUv + px * vec2(.5, -1.2)).rgb) * .25;
      a = mix(a, s, .3 + r2 * 1.2); a *= 1. - r2 * .9; float l = dot(a, vec3(.3, .6, .1)); a += (h(gl_FragCoord.xy) - .5) * (.05 + .05 * (1. - l)); a = mix(vec3(l), a, .88); gl_FragColor = vec4(max(a, 0.), 1.); }` };
// grain rides in front of the eyes, in a headset too: a sensor in the dark is never clean
const grainT = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() + Math.random() - 1) * 110; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t; })();
const grain = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: grainT, transparent: true, opacity: .045, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); grain.position.z = -.3; grain.renderOrder = 60; grain.frustumCulled = false; grain.visible = false; camera.add(grain);
let comp = null, bokeh = null, lens = null, focus = 4; const DOF = Q.get('dof') !== '0' && Q.get('q') !== 'low';
function draw(dt) { const xr = renderer.xr.isPresenting; grain.visible = xr; if (xr) grainT.offset.set(Math.random(), Math.random()); if (xr || !DOF || G.mode === 'title') return renderer.render(scene, camera);
  if (!comp) { comp = new EffectComposer(renderer); comp.addPass(new RenderPass(scene, camera)); bokeh = new BokehPass(scene, camera, { focus: 4, aperture: .002, maxblur: .009 }); comp.addPass(bokeh); comp.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), .38, .9, .72)); comp.addPass(new OutputPass()); lens = new ShaderPass(LENS); comp.addPass(lens); const rs = () => { comp.setSize(innerWidth, innerHeight); lens.uniforms.px.value.set(1 / innerWidth, 1 / innerHeight); }; rs(); addEventListener('resize', rs); }
  const h = ray(PL.head, PL.fwd, 30); focus = lerp(focus, h ? clamp(h.t, .4, 30) : 30, 1 - Math.exp(-dt * 5)); bokeh.uniforms.focus.value = focus; lens.uniforms.t.value = (lens.uniforms.t.value + dt) % 10; comp.render(dt); }
function frame(time) { const dt = clamp((time - last) / 1000 || .016, .001, 1 / 20); last = time; if (G.mode !== 'title' && !G.paused) tick(dt); draw(dt); }

function tick(dt) { G.t += dt; CLOCK.t += dt; PL.update(dt); SK.update(dt); WORLD.webStep(PL.pos, SK.g.visible ? SK.pos : null); for (const u of WORLD.updaters) u(dt, A); WORLD.mist(PL.head, dt, movers()); physics(dt); A.frame();
  // the big fixed lamps redraw their shadows in turn, one every other frame, not all on every frame
  // and only if something has moved where that lamp shines: a still alley costs no shadow work at all
  G.fr = (G.fr || 0) + 1; if (G.fr % 2 === 0) { const L = WORLD.slow[(G.fr / 2) % WORLD.slow.length], m = movers(); if (L) { const [x, z, r] = L.userData.reach; for (let i = 0; i < m.length; i += 4) if (m[i + 3] > .03 && Math.hypot(m[i] - x, m[i + 2] - z) < r) { L.shadow.needsUpdate = true; break; } } }
  if (noteT > 0 && (noteT -= dt) <= 0 && !G.bar && G.mode !== 'hide') hudSay('', '');
  if (G.unlock > 0 && (G.mode === 'hide' || G.mode === 'seek')) { if (PL.head.distanceTo(WORLD.door) > 2.2) { G.unlock = 0; hudNote('YOU LET GO OF THE LOCK'); } else { G.unlock += dt; if (G.unlock > 2.4) { A.at('lid', WORLD.door, .8, .8); end(true, 'escaped'); } } }
  if (G.mode === 'hide') { const was = Math.ceil(G.left); G.left -= dt; const n = Math.ceil(G.left); if (n !== was && n >= 0) { hudSay(String(n), n <= 10 ? 'IT IS COMING' : 'HIDE', n <= 10 ? '#c2452f' : '#d8d2c2'); if (n <= 10) A.flat('heart', .7, 1); }
    if (G.left <= 0) { G.mode = 'seek'; G.t = 0; hudSay('', ''); PL.noises.length = 0; SK.enter(); } }
  else if (G.mode === 'seek') { if (SK.state === 'caught' && SK.st > 1.75) end(false); else if (SK.state === 'gone') end(true);
    const B = PL.breath; if (B.holding) { hud.m.visible = true; const g = hud.g; g.clearRect(0, 0, 512, 256); g.fillStyle = 'rgba(216,210,194,.25)'; g.fillRect(156, 120, 200, 8); g.fillStyle = B.air < .25 ? '#c2452f' : '#d8d2c2'; g.fillRect(156, 120, 200 * B.air, 8); hud.t.needsUpdate = true; G.bar = true; } else if (G.bar) { G.bar = false; hudSay('', ''); }
    const d = SK.g.visible ? SK.pos.distanceTo(PL.pos) : 30, fear = SK.state === 'caught' ? 0 : clamp(clamp(1 - d / 12, 0, 1) * .85 + Math.min(1, SK.aware) * .4, 0, 1); G.fear = lerp(G.fear || 0, fear, 1 - Math.exp(-dt * 2)); G.beat -= dt * (1 + fear * 1.6); if (G.beat < 0 && SK.state !== 'caught') { G.beat = 1; A.flat('heart', .12 + fear * .75, 1); PL.buzz(.15 + fear * .5, 60); }
    WORLD.dread = SK.g.visible ? clamp(1 - Math.min(Math.hypot(SK.pos.x + .3, SK.pos.z + 8.5), Math.hypot(SK.pos.x - 2, SK.pos.z + 13.5)) / 7, 0, 1) : 0; if (SK.stepped) { SK.stepped = false; PL.buzz(clamp(1.2 - d / 9, 0, 1) * .8, 70); } }
  else { G.fear = lerp(G.fear || 0, G.mode === 'hide' && G.left < 10 ? .5 : 0, 1 - Math.exp(-dt)); WORLD.dread = 0; }
  A.tension(G.fear || 0);
  // shut in (lid down, door shut, under the tarp) the world sounds dull: rays up and to the four sides all stop short
  G.box = (G.box || 0) - dt; if (G.box < 0) { G.box = .25; let n = 0; for (const [x, y, z] of [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]) if (ray(PL.head, { x, y, z }, y ? 1.1 : 1.3)) n++; G.shut = n >= 5 ? 1 : 0; } G.muf = lerp(G.muf || 0, G.shut || 0, 1 - Math.exp(-dt * 5)); A.muffle(G.muf * .62);
  // the alley is never quite still: something small far off, a gust, a siren
  G.odd -= dt; if (G.odd < 0) { G.odd = rnd(8, 22); const z = PL.pos.z + (Math.random() < .5 ? -1 : 1) * rnd(8, 18), at = { x: rnd(-7, 7), y: rnd(.1, 2.5), z: clamp(z, -39, 4) }, r = Math.random(); if (r < .25) A.at('rat', at, .5, rnd(.9, 1.2)); else if (r < .4) A.at('glass', at, .25, rnd(.7, 1)); else if (r < .62) A.at('wood', at, .5, rnd(.35, .55)); else if (r < .76) A.at('lid', at, .35, rnd(.45, .6)); else if (r < .86) A.siren(); else G.gust = 1; }
  G.gust = Math.max(0, (G.gust || 0) - dt * .22); A.wind(.25 + Math.sin(CLOCK.t * .23) * .12 + G.gust * .6);
  G.drip -= dt; if (G.drip < 0) { G.drip = rnd(.6, 3); const pd = WORLD.puddles[Math.floor(Math.random() * WORLD.puddles.length)]; A.at('drip', { x: pd.x + rnd(-.3, .3), y: .1, z: pd.z + rnd(-.3, .3) }, rnd(.3, .6), rnd(.8, 1.3)); }
  black.material.opacity = Math.max(PL.blind, SK.state === 'caught' && SK.st > 1.35 ? 1 : G.mode === 'end' && !G.won ? .85 : 0); black.visible = black.material.opacity > .01; }

async function boot() { const bar = $('bar'), note = $('note'); let a = 0, b = 0; const show = () => { bar.style.transform = 'scaleX(' + (a * .9 + b * .1) + ')'; };
  try { await initPhysics(); await Promise.all([loadAssets(v => { a = v; show(); }), A.load().then(() => { b = 1; show(); })]); build(); PL.init(); SK.init(); for (const T of P.things) T.b.wakeUp(); for (let i = 0; i < 260; i++) P.world.step(); for (const k in P.lids) { const L = P.lids[k]; L.was = L.want = L.isOpen(); L.ang00 = L.ang0 = Math.max(0, L.angle() < .14 ? 0 : L.angle()); L.a0 = Math.max(0, L.angle() < .14 ? 0 : L.angle()); L.hold(L.a0); } for (const T of P.things) { T.home = { p: { ...T.b.translation() }, q: { ...T.b.rotation() } }; T.b.setLinvel({ x: 0, y: 0, z: 0 }, false); T.b.setAngvel({ x: 0, y: 0, z: 0 }, false); T.b.sleep(); T.o.position.copy(T.home.p); T.o.quaternion.copy(T.home.q); } SK.buildNav(); for (const u of WORLD.updaters) u(.016); reflect(); PL.update(.016);
    if (Q.get('mind') !== 'local' && location.protocol.startsWith('http')) try { const r = await fetch('/hide/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }), j = await r.json(); if (r.ok && j.why === 'nothing sensed') SK.mode = 'claude'; else G.mindNote = r.status === 401 ? 'log in on this site for Claude' : (j.why || '').slice(0, 60); } catch (e) { G.mindNote = ''; }
  } catch (e) { note.textContent = 'It would not load: ' + (e && e.message || e); console.error(e); return; }
window.__hide = { draw, G, PL, SK, P, WORLD, A, THREE, SPOTS, camera, rig, scene, renderer, applyNight, ready, startRound, end, reset, physics, sim: (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) tick(dt); } };
  try { Object.assign(SK.habits, JSON.parse(keep('deadend.habits') || '{}')); } catch (e) {} 
  renderer.setAnimationLoop(frame);
  $('load').hidden = true; $('mind').textContent = SK.mode === 'claude' ? 'Hunted by Claude Haiku.' : 'Hunted by instinct' + (G.mindNote ? ': ' + G.mindNote + '.' : '.');
  const go = () => { $('ui').hidden = true; A.resume(); for (const t of WORLD.tubes) A.buzz(t); A.start(); ready(); };
  $('bdesk').disabled = false; $('bdesk').onclick = () => { go(); renderer.domElement.requestPointerLock && renderer.domElement.requestPointerLock(); }; renderer.domElement.addEventListener('click', () => { if (G.mode !== 'title' && !renderer.xr.isPresenting && renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock(); });
  if (navigator.xr && await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)) { $('bvr').disabled = false; $('bvr').onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] }); await renderer.xr.setSession(s); go(); s.addEventListener('end', () => { $('ui').hidden = false; G.mode = 'title'; }); } catch (e) { note.textContent = 'The headset would not start: ' + e.message; } }; }
  else $('vrnote').textContent = 'No headset found: open this page in the Quest browser for VR.';
}
boot();
