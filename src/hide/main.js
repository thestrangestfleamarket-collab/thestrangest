// DEAD END: sixty seconds to hide in a dead-end alley, then something comes in to look for you. This file is the round (ready, hide, seek, the end), the signs you read, and the loop that moves everything.
import { CLOCK, THREE, Q, clamp, lerp, rnd, renderer, scene, camera, rig, P, initPhysics, loadAssets, reflect, ray } from './core.js';
import { WORLD, build } from './world.js';
import { PL } from './player.js';
import { SK } from './seeker.js';
import { A } from './sound.js';
import { SPOTS } from './spots.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
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
const KEYS = () => renderer.xr.isPresenting ? 'RIGHT TRIGGER' : 'E';

/* each night is a little different: the rain, the fog, a lamp out, a lid chained, the shutter down, and where the key lies */
const plain = () => ({ rain: .55, fog: 1.25, lampOut: false, locked: '', shutter: false, key: 0 });
function rollNight() { return { ...plain(), key: Q.get('night') === 'plain' ? 0 : Math.floor(Math.random() * 8) }; }   // one night only: fog. The key lies somewhere different each time
function applyNight(N) { WORLD.night = N; scene.fog.density = .075 * N.fog; A.rain(N.rain); SK.cfg.mask = N.rain; WORLD.shutter(N.shutter); WORLD.setPower(true);
  for (const id in P.lids) { const d = P.lids[id]; if (d.was0 === undefined) d.was0 = d.was; d.locked = false; d.was = d.was0; if (id === N.locked) { d.set(false); d.was = false; d.locked = true; } }
  const k = N.shutter && N.key === 4 ? 0 : N.key, at = WORLD.keySpots[k], T = WORLD.key; T.o.visible = true; T.b.setTranslation({ x: at[0], y: at[1] + .04, z: at[2] }, true); T.b.setLinvel({ x: 0, y: 0, z: 0 }, true); T.b.setAngvel({ x: 0, y: 0, z: 0 }, true); T.o.position.copy(T.b.translation()); }
const nightWords = N => [N.rain > 1.2 ? 'heavy rain (it hears less)' : N.rain < .8 ? 'the rain is easing (it hears more)' : '', N.fog > 1.2 ? 'thick fog' : '', N.lampOut ? 'the big lamp is out' : '', N.locked ? { dumpster1: 'the near dumpster is chained shut', dumpster2: 'the far dumpster is chained shut', locker: 'the locker is chained shut' }[N.locked] : '', N.shutter ? 'the shutter is down' : ''].filter(Boolean).join(' · ') || 'an ordinary night';
let noteT = 0; const hudNote = (t, secs = 2.5) => { const g = hud.g; g.clearRect(0, 0, 512, 256); g.textAlign = 'center'; g.shadowColor = '#000'; g.shadowBlur = 10; g.fillStyle = '#d8d2c2'; g.font = '500 36px ui-monospace,Menlo,monospace'; g.fillText(t, 256, 150); hud.t.needsUpdate = true; hud.m.visible = true; noteT = secs; };
function ready(roll = true) { G.mode = 'ready'; G.t = 0; hudSay('', ''); PL.frozen = false; black.material.color.set(0); if (roll || !WORLD.night) G.night = rollNight(); applyNight(G.night); const HIDE = hideT();
  boardSay('DEAD END', [['You have ' + HIDE + ' seconds to hide. Then it comes in through the gate behind you.'], ['It hears steps, breath and anything you knock; sees breath in its light, wet prints, and what has moved. Throw something to draw it off. Somewhere there is a key to the cellar door.'],  [renderer.xr.isPresenting ? 'LEFT STICK walk · RIGHT STICK turn, down to crouch · GRIP carry or climb · RIGHT TRIGGER open/shut · A climb over · LEFT TRIGGER hold your breath' : 'WASD walk · SHIFT run · C crouch/lie · MOUSE carry · E open/shut · SPACE climb over · Q hold your breath', '#77736a'], ['Its mind: ' + (SK.mode === 'claude' ? 'Claude Haiku' : 'instinct only' + (G.mindNote ? ' (' + G.mindNote + ')' : '')), '#77736a']], KEYS() + ' TO START'); }
const hideT = () => +Q.get('t') || 60;
function startRound() { if (G.mode !== 'ready') return; const HIDE = hideT(); G.unlock = 0; G.mode = 'hide'; G.t = 0; G.left = HIDE; G.rounds++; board.m.visible = false; A.start(); A.flat('heart', .5); hudSay(String(HIDE), 'HIDE'); }
// how it came out: caught, outlasted, or out through the cellar; and where you were is something it will remember
function end(won, how) { G.mode = 'end'; G.t = 0; G.won = won; G.how = how || (won ? 'gaveup' : 'caught'); PL.frozen = !won; hudSay('', ''); if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  let near = null, nd = 2.6; for (const sp of SPOTS) { const g = WORLD.GEO[sp.id], d = Math.hypot(g.look[0] - PL.pos.x, g.look[2] - PL.pos.z); if (d < nd) { nd = d; near = sp.id; } } G.spot = near;
  if (near && G.how === 'caught') { SK.habits[near] = (SK.habits[near] || 0) + 1; keep('deadend.habits', JSON.stringify(SK.habits)); if (SK.mode === 'claude' && location.protocol.startsWith('http')) fetch('/hide/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ remember: near }) }).catch(() => {}); }
  const th = SK.thoughts.slice(-7).map(t => [t.at + 's  "' + t.text + '"', t.action === 'spotted' || t.action === 'caught' ? '#c2452f' : '#a9a497']);
  boardSay(G.how === 'escaped' ? 'YOU GOT OUT' : won ? 'IT GAVE UP' : 'IT FOUND YOU', [[G.how === 'escaped' ? 'Through the cellar door, with it still looking.' : won ? 'You outlasted it. It searched ' + Object.keys(SK.searched).length + ' of ' + SPOTS.length + ' places.' : 'Caught after ' + Math.round(SK.t) + ' seconds of hunting.', '#d8d2c2'], ['What it was thinking:', '#77736a'], ...th], KEYS() + ' TO PLAY AGAIN', won ? '#d8d2c2' : '#c2452f'); }
function reset() { for (const T of P.things) { T.b.setTranslation(T.home.p, false); T.b.setRotation(T.home.q, false); T.b.setLinvel({ x: 0, y: 0, z: 0 }, false); T.b.setAngvel({ x: 0, y: 0, z: 0 }, false); T.b.sleep(); T.o.position.copy(T.home.p); T.o.quaternion.copy(T.home.q); }
  for (const id in P.lids) { P.lids[id].home(); } WORLD.cloth.reset(); SK.reset(); PL.place(0, 0, -2.6, renderer.xr.isPresenting ? rig.rotation.y : 0); PL.update(.016); ready(); }
// the breaker box cuts the alley's own lamps (not the street's, the moon's or its torch): darkness for you, and a loud clunk that tells it where you were
WORLD.setPower = on => { if (WORLD.power === on) return; WORLD.power = on; A.at('lid', WORLD.breaker, .9, 1.7); for (const L of WORLD.slow) L.shadow.needsUpdate = true; };
PL.onUse = () => { if (G.mode === 'ready') { startRound(); return true; } if (G.mode === 'end' && G.t > 1.5) { reset(); return true; }
  if ((G.mode === 'hide' || G.mode === 'seek') && PL.head.distanceTo(WORLD.breaker) < 1.6) { WORLD.setPower(!WORLD.power); PL.noise(WORLD.breaker, .9, 'the breaker thrown'); hudNote(WORLD.power ? 'THE LAMPS COME BACK' : 'THE LAMPS GO OUT'); return true; }
  if (G.mode === 'hide' || G.mode === 'seek') for (const d of WORLD.doors.slice(1)) if (PL.head.distanceTo(d) < 1.5) { hudNote('LOCKED'); A.at(['metal1', 'metal2'], d, .4, 1.6); PL.noise(d, .35, 'a door rattled'); return true; }
  if ((G.mode === 'hide' || G.mode === 'seek') && PL.head.distanceTo(WORLD.door) < 1.7) { if (PL.key) { if (!G.unlock) { G.unlock = .01; A.at('gate', WORLD.door, .5, 2); PL.noise(WORLD.door, .5, 'a lock turning'); } } else { hudNote('LOCKED. THERE IS A KEY SOMEWHERE.'); A.at(['metal1', 'metal2'], WORLD.door, .4, 1.6); PL.noise(WORLD.door, .35, 'a door rattled'); } return true; } return false; };
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
let comp = null, bokeh = null, focus = 4; const DOF = Q.get('dof') !== '0' && Q.get('q') !== 'low';
function draw(dt) { if (renderer.xr.isPresenting || !DOF || G.mode === 'title') return renderer.render(scene, camera);
  if (!comp) { comp = new EffectComposer(renderer); comp.addPass(new RenderPass(scene, camera)); bokeh = new BokehPass(scene, camera, { focus: 4, aperture: .0009, maxblur: .006 }); comp.addPass(bokeh); comp.addPass(new OutputPass()); addEventListener('resize', () => comp.setSize(innerWidth, innerHeight)); }
  const h = ray(PL.head, PL.fwd, 30); focus = lerp(focus, h ? clamp(h.t, .4, 30) : 30, 1 - Math.exp(-dt * 5)); bokeh.uniforms.focus.value = focus; comp.render(dt); }
function frame(time) { const dt = clamp((time - last) / 1000 || .016, .001, 1 / 20); last = time; if (G.mode !== 'title' && !G.paused) tick(dt); draw(dt); }

function tick(dt) { G.t += dt; CLOCK.t += dt; PL.update(dt); SK.update(dt); for (const u of WORLD.updaters) u(dt, A); WORLD.mist(PL.head, dt, movers()); physics(dt); A.frame();
  // the big fixed lamps redraw their shadows in turn, one every other frame, not all on every frame
  // and only if something has moved where that lamp shines: a still alley costs no shadow work at all
  G.fr = (G.fr || 0) + 1; if (G.fr % 2 === 0) { const L = WORLD.slow[(G.fr / 2) % WORLD.slow.length], m = movers(); if (L) { const [x, z, r] = L.userData.reach; for (let i = 0; i < m.length; i += 4) if (m[i + 3] > .03 && Math.hypot(m[i] - x, m[i + 2] - z) < r) { L.shadow.needsUpdate = true; break; } } }
  // the leaking joint blows for a few seconds, rests, blows again; while it blows nothing can be seen through the plume
  { const S = WORLD.steam; S.t -= dt; if (S.t < 0) { S.on = !S.on; S.t = S.on ? rnd(5, 8) : rnd(4, 7); S.veil.setEnabled(S.on); if (S.on) A.hiss(S.at, S.t); } if (S.on) WORLD.puff(S.at, dt); }
  if (noteT > 0 && (noteT -= dt) <= 0 && !G.bar && G.mode !== 'hide') hudSay('', '');
  if (G.unlock > 0 && (G.mode === 'hide' || G.mode === 'seek')) { if (PL.head.distanceTo(WORLD.door) > 1.9) { G.unlock = 0; hudNote('YOU LET GO OF THE LOCK'); } else { G.unlock += dt; if (G.unlock > 2.4) { A.at('lid', WORLD.door, .8, .8); end(true, 'escaped'); } } }
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
  G.odd -= dt; if (G.odd < 0) { G.odd = rnd(9, 24); const z = PL.pos.z + (Math.random() < .5 ? -1 : 1) * rnd(7, 15), at = { x: rnd(-2.3, 2.3), y: .1, z: clamp(z, -33, 6) }, r = Math.random(); if (r < .3) A.at('rat', at, .5, rnd(.9, 1.2)); else if (r < .45) A.at('glass', at, .3, rnd(.7, 1)); else if (r < .58) A.at(['metal1', 'metal2'], { x: rnd(-9, 9), y: 2, z: 12 }, .35, .5); else if (r < .7) A.siren(); else { G.gust = 1; } }
  G.gust = Math.max(0, (G.gust || 0) - dt * .22); A.wind(.25 + Math.sin(CLOCK.t * .23) * .12 + G.gust * .6);
  G.drip -= dt; if (G.drip < 0) { G.drip = rnd(.6, 3); A.at('drip', { x: rnd(-2.4, 2.4), y: .1, z: PL.pos.z + rnd(-7, 7) }, rnd(.2, .5), rnd(.8, 1.3)); }
  G.storm -= dt; if (G.storm < 0) { G.storm = rnd(35, 80); G.flash = 1; setTimeout(() => A.flat('thunder', .55, rnd(.8, 1)), 900); } G.flash = Math.max(0, G.flash - dt * 2.8); WORLD.flash = G.flash * (Math.random() < .7 ? 1 : .3); scene.fog.color.setRGB(.014 + G.flash * .05, .018 + G.flash * .055, .026 + G.flash * .07); scene.backgroundIntensity = .16 + G.flash * .5;
  black.material.opacity = Math.max(PL.blind, SK.state === 'caught' && SK.st > 1.35 ? 1 : G.mode === 'end' && !G.won ? .85 : 0); black.visible = black.material.opacity > .01; }

async function boot() { const bar = $('bar'), note = $('note'); let a = 0, b = 0; const show = () => { bar.style.transform = 'scaleX(' + (a * .9 + b * .1) + ')'; };
  try { await initPhysics(); await Promise.all([loadAssets(v => { a = v; show(); }), A.load().then(() => { b = 1; show(); })]); build(); PL.init(); SK.init(); for (const T of P.things) T.b.wakeUp(); for (let i = 0; i < 260; i++) P.world.step(); for (const T of P.things) { T.home = { p: { ...T.b.translation() }, q: { ...T.b.rotation() } }; T.b.setLinvel({ x: 0, y: 0, z: 0 }, false); T.b.setAngvel({ x: 0, y: 0, z: 0 }, false); T.b.sleep(); T.o.position.copy(T.home.p); T.o.quaternion.copy(T.home.q); } SK.buildNav(); for (const u of WORLD.updaters) u(.016); reflect(); PL.update(.016);
    if (Q.get('mind') !== 'local' && location.protocol.startsWith('http')) try { const r = await fetch('/hide/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }), j = await r.json(); if (r.ok && j.why === 'nothing sensed') SK.mode = 'claude'; else G.mindNote = r.status === 401 ? 'log in on this site for Claude' : (j.why || '').slice(0, 60); } catch (e) { G.mindNote = ''; }
  } catch (e) { note.textContent = 'It would not load: ' + (e && e.message || e); console.error(e); return; }
window.__hide = { G, PL, SK, P, WORLD, A, THREE, SPOTS, camera, rig, scene, renderer, applyNight, ready, startRound, end, reset, physics, sim: (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) tick(dt); } };
  try { Object.assign(SK.habits, JSON.parse(keep('deadend.habits') || '{}')); } catch (e) {} 
  renderer.setAnimationLoop(frame);
  $('load').hidden = true; $('mind').textContent = SK.mode === 'claude' ? 'Hunted by Claude Haiku.' : 'Hunted by instinct' + (G.mindNote ? ': ' + G.mindNote + '.' : '.');
  const go = () => { $('ui').hidden = true; A.resume(); A.buzz({ x: -2.05, y: 5.5, z: -8.2 }); A.start(); ready(); };
  $('bdesk').disabled = false; $('bdesk').onclick = () => { go(); renderer.domElement.requestPointerLock && renderer.domElement.requestPointerLock(); }; renderer.domElement.addEventListener('click', () => { if (G.mode !== 'title' && !renderer.xr.isPresenting && renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock(); });
  if (navigator.xr && await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)) { $('bvr').disabled = false; $('bvr').onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] }); await renderer.xr.setSession(s); go(); s.addEventListener('end', () => { $('ui').hidden = false; G.mode = 'title'; }); } catch (e) { note.textContent = 'The headset would not start: ' + e.message; } }; }
  else $('vrnote').textContent = 'No headset found: open this page in the Quest browser for VR.';
}
boot();
