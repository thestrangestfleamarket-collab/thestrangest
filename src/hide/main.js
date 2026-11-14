// DEAD END: sixty seconds to hide in a dead-end alley, then something comes in to look for you. This file is the round (ready, hide, seek, the end), the signs you read, and the loop that moves everything.
import { CLOCK, THREE, Q, clamp, lerp, rnd, renderer, scene, camera, rig, P, initPhysics, loadAssets, reflect, ray } from './core.js';
import { WORLD, build } from './world.js';
import { PL } from './player.js';
import { SK } from './seeker.js';
import { A } from './sound.js';
import { SPOTS } from './spots.js';

const $ = id => document.getElementById(id), HIDE = +Q.get('t') || 60;
const G = { mode: 'title', t: 0, left: HIDE, won: false, rounds: 0, beat: 0, drip: 2, odd: 8, storm: rnd(20, 45), flash: 0 };
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

function ready() { G.mode = 'ready'; G.t = 0; hudSay('', ''); PL.frozen = false; black.material.color.set(0);
  boardSay('DEAD END', [['You have ' + HIDE + ' seconds to hide. Then it comes in through the gate behind you.'], ['It hears footsteps, breathing and anything you knock over. It sees your breath in its light, your wet prints, and whatever is not where it was.'], [renderer.xr.isPresenting ? 'LEFT STICK walk · RIGHT STICK turn, down to crouch · GRIP carry or climb · RIGHT TRIGGER open/shut · A climb over · LEFT TRIGGER hold your breath' : 'WASD walk · SHIFT run · C crouch/lie · MOUSE carry · E open/shut · SPACE climb over · Q hold your breath', '#77736a'], ['Its mind: ' + (SK.mode === 'claude' ? 'Claude Haiku' : 'instinct only' + (G.mindNote ? ' (' + G.mindNote + ')' : '')), '#77736a']], KEYS() + ' TO START'); }
function startRound() { if (G.mode !== 'ready') return; G.mode = 'hide'; G.t = 0; G.left = HIDE; G.rounds++; board.m.visible = false; A.start(); A.flat('heart', .5); hudSay(String(HIDE), 'HIDE'); }
function end(won) { G.mode = 'end'; G.t = 0; G.won = won; PL.frozen = !won; hudSay('', ''); const th = SK.thoughts.slice(-7).map(t => [t.at + 's  "' + t.text + '"', t.action === 'spotted' || t.action === 'caught' ? '#c2452f' : '#a9a497']);
  boardSay(won ? 'IT GAVE UP' : 'IT FOUND YOU', [[won ? 'You outlasted it. It searched ' + Object.keys(SK.searched).length + ' of 20 places.' : 'Caught after ' + Math.round(SK.t) + ' seconds of hunting.', '#d8d2c2'], ['What it was thinking:', '#77736a'], ...th], KEYS() + ' TO PLAY AGAIN', won ? '#d8d2c2' : '#c2452f'); }
function reset() { for (const T of P.things) { T.b.setTranslation(T.home.p, false); T.b.setRotation(T.home.q, false); T.b.setLinvel({ x: 0, y: 0, z: 0 }, false); T.b.setAngvel({ x: 0, y: 0, z: 0 }, false); T.b.sleep(); T.o.position.copy(T.home.p); T.o.quaternion.copy(T.home.q); }
  for (const id in P.lids) { P.lids[id].home(); } WORLD.cloth.reset(); SK.reset(); PL.place(0, 0, -2.6, renderer.xr.isPresenting ? rig.rotation.y : 0); PL.update(.016); ready(); }
PL.onUse = () => { if (G.mode === 'ready') { startRound(); return true; } if (G.mode === 'end' && G.t > 1.5) { reset(); return true; } return false; };
addEventListener('keydown', e => { if (e.code === 'Enter') PL.onUse(); });

/* things striking things: the sound you hear is the noise it hears */
const balls = [];
function physics(dt) { for (const T of P.things) if (!T.b.isSleeping()) { const v = T.b.linvel(), w = T.b.angvel(); T.v = Math.hypot(v.x, v.y, v.z) + Math.hypot(w.x, w.y, w.z) * .25; } else T.v = 0;
  P.world.timestep = dt; P.world.step(P.eq); const t = CLOCK.t;
  const hits = []; P.eq.drainContactForceEvents(e => { hits.push(e.collider1(), e.collider2()); }); { for (const h of hits) { const T = P.byCol.get(h); if (!T || T.fixed || t - T.lastHit < .16) continue; const v2 = T.b.linvel(), v = Math.max(T.v || 0, Math.hypot(v2.x, v2.y, v2.z)); if (v < .45) continue; T.lastHit = t;
      const p = T.b.translation(), loud = clamp(v / 4.5, .05, 1) * clamp(T.mass / 6, .35, 1.25), carried = A.hit(T.kind, p, loud); const mine = (t - (T.plT || -99) < 8 && !(T.monT > T.plT)) || Math.hypot(p.x - PL.pos.x, p.z - PL.pos.z) < 1 || PL.hands.some(H => H.on && Math.hypot(p.x - H.pos.x, p.y - H.pos.y, p.z - H.pos.z) < .4); if (G.mode === 'seek' && mine) PL.noise(p, carried, T.name + ' struck'); } }
  for (const T of P.things) if (!T.b.isSleeping()) { T.o.position.copy(T.b.translation()); T.o.quaternion.copy(T.b.rotation()); }
  WORLD.cloth.step(dt, PL.balls(balls)); }

let last = 0;
function frame(time) { const dt = clamp((time - last) / 1000 || .016, .001, 1 / 20); last = time; if (G.mode !== 'title' && !G.paused) tick(dt); renderer.render(scene, camera); }
function tick(dt) { G.t += dt; CLOCK.t += dt; PL.update(dt); SK.update(dt); for (const u of WORLD.updaters) u(dt, A); physics(dt); A.frame();
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
  G.storm -= dt; if (G.storm < 0) { G.storm = rnd(35, 80); G.flash = 1; setTimeout(() => A.flat('thunder', .55, rnd(.8, 1)), 900); } G.flash = Math.max(0, G.flash - dt * 2.8); WORLD.flash = G.flash * (Math.random() < .7 ? 1 : .3); scene.fog.color.setRGB(.018 + G.flash * .05, .022 + G.flash * .055, .03 + G.flash * .07); scene.background.copy(scene.fog.color);
  black.material.opacity = Math.max(PL.blind, SK.state === 'caught' && SK.st > 1.35 ? 1 : G.mode === 'end' && !G.won ? .85 : 0); black.visible = black.material.opacity > .01; }

async function boot() { const bar = $('bar'), note = $('note'); let a = 0, b = 0; const show = () => { bar.style.transform = 'scaleX(' + (a * .9 + b * .1) + ')'; };
  try { await initPhysics(); await Promise.all([loadAssets(v => { a = v; show(); }), A.load().then(() => { b = 1; show(); })]); build(); PL.init(); SK.init(); for (const T of P.things) T.b.wakeUp(); for (let i = 0; i < 260; i++) P.world.step(); for (const T of P.things) { T.home = { p: { ...T.b.translation() }, q: { ...T.b.rotation() } }; T.b.setLinvel({ x: 0, y: 0, z: 0 }, false); T.b.setAngvel({ x: 0, y: 0, z: 0 }, false); T.b.sleep(); T.o.position.copy(T.home.p); T.o.quaternion.copy(T.home.q); } SK.buildNav(); for (const u of WORLD.updaters) u(.016); reflect(); PL.update(.016);
    if (Q.get('mind') !== 'local' && location.protocol.startsWith('http')) try { const r = await fetch('/hide/mind', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }), j = await r.json(); if (r.ok && j.why === 'nothing sensed') SK.mode = 'claude'; else G.mindNote = r.status === 401 ? 'log in on this site for Claude' : (j.why || '').slice(0, 60); } catch (e) { G.mindNote = ''; }
  } catch (e) { note.textContent = 'It would not load: ' + (e && e.message || e); console.error(e); return; }
window.__hide = { G, PL, SK, P, WORLD, A, THREE, SPOTS, camera, rig, scene, renderer, ready, startRound, end, reset, physics, sim: (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) tick(dt); } };
  renderer.setAnimationLoop(frame);
  $('load').hidden = true; $('mind').textContent = SK.mode === 'claude' ? 'Hunted by Claude Haiku.' : 'Hunted by instinct' + (G.mindNote ? ': ' + G.mindNote + '.' : '.');
  const go = () => { $('ui').hidden = true; A.resume(); A.buzz({ x: -2.05, y: 5.5, z: -8.2 }); A.start(); ready(); };
  $('bdesk').disabled = false; $('bdesk').onclick = () => { go(); renderer.domElement.requestPointerLock && renderer.domElement.requestPointerLock(); }; renderer.domElement.addEventListener('click', () => { if (G.mode !== 'title' && !renderer.xr.isPresenting && renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock(); });
  if (navigator.xr && await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)) { $('bvr').disabled = false; $('bvr').onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] }); await renderer.xr.setSession(s); go(); s.addEventListener('end', () => { $('ui').hidden = false; G.mode = 'title'; }); } catch (e) { note.textContent = 'The headset would not start: ' + e.message; } }; }
  else $('vrnote').textContent = 'No headset found: open this page in the Quest browser for VR.';
}
boot();
