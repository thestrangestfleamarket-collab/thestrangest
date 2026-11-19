// RAMEN, a ramen cart on a downtown New York pavement in 1985 at /ramen (a headset game), one day and one night: the renderer in THE MARKET's look below full resolution, the resolution governed by the frame time (its sky, air, weather and shadows: sky.js, air.js, weather.js), the loop, the way in
import * as THREE from 'three';
import { G, clamp, mergeStatic } from './ctx.js';
import { buildAlley, FOG } from './alley.js';
import { buildCart, DRINKS } from './cart.js';
import { buildFx } from './fx.js';
import { buildGame } from './game.js';
import { buildClock } from './clock.js';
import { buildStory } from './story.js';
import { buildInput } from './input.js';
import { updateItems } from './items.js';
import * as Items from './items.js';
import { GameAudio } from './audio.js';
import { loadAvatars, makePerson } from './avatars.js';
import { PF } from './pf.js';
import { tenantFigure } from './tenant.js';
import { buildLife } from './life.js';
import { buildShade } from './shade.js';
import { buildTalk } from './talk.js';
import { buildGrit } from './grit.js';
import { buildGuide } from './guide.js';
import { buildMenu } from './menu.js';
import { buildBoards } from './boards.js';
import { buildReport } from './report.js';
import { buildTank } from './tank.js';
import { buildTV } from './tv.js';
import { buildLive } from './live.js';
import { buildCook } from './cook.js';
import { buildShare } from './share.js';
import { buildGuest } from './guest.js';
import { buildDawn } from './dawn.js';
import { buildProgress } from './progress.js';
import { buildRush } from './rush.js';
import { buildRegulars } from './regulars.js';
import { buildEvents } from './events.js';
import { buildShop } from './shop.js';
import { NET } from '../holo/net.js';
import { PH } from './physics.js';
import * as T from './tex.js';
import { installAir } from './air.js';
import { buildWeather } from './weather.js';

const params = new URLSearchParams(location.search);
G.guest = params.has('guest');   // a tenant of THE MARKET walking the alley as themselves (guest.js), not the cook
const canvas = document.getElementById('c');
installAir();   // (before any material is drawn)
// a headset (or ?low) takes the lean path: coarser shadows, fewer raindrops; a screen the richer one (owner, 17 Nov 2026: THE MARKET's look, full resolution, holding the headset's frame rate)
const lean = params.has('low') || !!(await (navigator.xr?.isSessionSupported?.('immersive-vr') || Promise.resolve(false)).catch(() => false)); G.rich = !lean;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
// drawn below the screen's resolution and scaled up smoothly by the browser (owner, 17 Nov 2026: "lower quality of render"); G.rscale moves with the frame time (govern)
const RS = { min: 0.5, max: G.rich ? 0.8 : 0.75 }; G.rscale = +params.get('scale') || 0.7;
const ratio = () => Math.min(devicePixelRatio || 1, 1) * G.rscale;
renderer.setPixelRatio(ratio()); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation?.(0.5); renderer.xr.setFramebufferScaleFactor?.(0.8);   // in the headset a little under its own resolution, the edges blurred a little more (easier on the frame rate)
// in the headset the governor shrinks each eye's picture inside that buffer (the browser's viewport scaling, where it has it)
if (globalThis.XRWebGLLayer && !XRWebGLLayer.prototype.__rs) { const gv = XRWebGLLayer.prototype.getViewport; XRWebGLLayer.prototype.getViewport = function (v) { if (v && v.requestViewportScale) v.requestViewportScale(G.vrScale || 1); return gv.call(this, v); }; XRWebGLLayer.prototype.__rs = 1; }

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(FOG, 0.006); scene.background = new THREE.Color(0x05060c);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.03, 600);
const rig = new THREE.Group(); rig.position.set(0, 0, 0.3); rig.add(camera); scene.add(rig);
Object.assign(G, { scene, camera, rig, renderer });
G.pickRoot = new THREE.Group(); scene.add(G.pickRoot);
G.itemRoot = new THREE.Group(); G.pickRoot.add(G.itemRoot);
G.peopleRoot = new THREE.Group(); scene.add(G.peopleRoot);
G.audio = new GameAudio();

const $ = (id) => document.getElementById(id), menu = $('menu'), hud = $('hud'), vrBtn = $('vr'), deskBtn = $('desk');
const photos = T.loadPhotos();
{ const l = vrBtn.textContent; await loadAvatars((f) => { vrBtn.textContent = `Loading… ${Math.round(f * 100)}%`; }); vrBtn.textContent = l; }
try { await PH.init(); } catch (e) { console.warn('physics engine unavailable, simple falling instead', e); }

await photos;
buildFx(scene);
const city = buildAlley(scene, { rich: G.rich });
const weather = buildWeather(scene, { lean });
const cart = buildCart(scene, city);
if (PH.ready) PH.statics(cart);
buildClock(params);
const prog = buildProgress(params), rush = buildRush();   // the run across days and the day's pressure (before the game: its menu and stock are theirs)
const game = buildGame(scene);
const regs = buildRegulars(), events = buildEvents(); buildShop(); prog.on(game.restock); prog.apply();
const input = buildInput(renderer, rig, camera, canvas);
const life = buildLife(scene, city, cart), shade = buildShade(scene, city);
const talk = buildTalk(scene);
const grit = buildGrit(scene, city, cart);
const boards = buildBoards(), guide = buildGuide(scene, cart);
T.metreUV(cart.group);
G.baked = mergeStatic(cart.group) + mergeStatic(city.group);
for (const g of [cart.group, city.group]) g.traverse((o) => { if (o.isMesh && !o.userData.dyn && !o.userData.item && o.castShadow) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) > 0.12) o.layers.enable(2); } });   // the still street and cart cast the sun's shadows (not their small things)
const tank = buildTank(scene), tv = buildTV(scene, city.shops), live = buildLive(), cook = buildCook(), story = buildStory(scene);
if (G.guest) G.buttons.length = 0;   // (the cart's knobs, switch and boards are the cook's)
const share = buildShare(live), guest = G.guest ? buildGuest(live) : null;
const dawn = buildDawn(scene);   // the run's end at dawn: its card

function render() { renderer.render(scene, camera); }   // straight to the screen at its own resolution (THE MARKET's look: no PlayStation 2 pass, owner 17 Nov 2026)
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(ratio()); renderer.setSize(innerWidth, innerHeight); });

// ---------- the way in ----------
function begin() { G.audio.init(); if (!G.audio.radioOn) G.audio.setRadio(true); if (G.guest) { if (guide.on) guide.set(false); } else talk.listen(true); }
function startDesktop() { begin(); G.mode = 'desktop'; menu.style.display = 'none'; hud.style.display = 'block'; rig.position.set(0, 0, 0.3); if (guest) guest.start(); }
deskBtn.onclick = startDesktop;
async function startVR() {
  begin();
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] });
    rig.position.set(0, 0, 0.3); rig.rotation.set(0, 0, 0); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
    await renderer.xr.setSession(session); G.mode = 'vr'; renderer.xr.setFoveation?.(G.set && G.set.easy ? 0.25 : 0.5);
    if (session.updateTargetFrameRate && session.supportedFrameRates) { const r = [...session.supportedFrameRates].filter((x) => x <= 90); if (r.length) session.updateTargetFrameRate(Math.max(...r)).catch(() => { }); }   // 90 a second where the headset can menu.style.display = 'none'; hud.style.display = 'none';
    session.addEventListener('end', () => { G.mode = 'menu'; menu.style.display = 'flex'; });
  } catch (e) { vrBtn.textContent = 'VR failed: ' + e.message; console.error(e); }
}
NET.tok().then(() => fetch('/sushi/say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).then((r) => { if (r.status === 401) $('login').style.display = 'inline-block'; else G.live?.join(); }).catch(() => { }); prog.load(); // the patrons' voices are a login's: say so before the headset goes on
vrBtn.onclick = async () => { if (await talk.needPrime()) { vrBtn.textContent = 'Allow the microphone…'; const ok = await talk.prime(); vrBtn.textContent = ok ? 'Enter VR' : 'Enter VR (no microphone)'; return; } startVR(); }; // the microphone is asked for on its own press: a prompt cannot be answered inside the headset view
window.G_STARTED = true;
if (navigator.xr?.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { vrBtn.disabled = !ok; vrBtn.textContent = ok ? 'Enter VR' : 'No headset here'; if (!ok) { vrBtn.classList.remove('primary'); deskBtn.classList.add('primary'); } }).catch(() => { vrBtn.textContent = 'VR unavailable'; });
else vrBtn.textContent = location.protocol === 'https:' || location.hostname === 'localhost' ? 'Open this page in a VR headset' : 'VR needs HTTPS';

// ---------- loop ----------
function tick(dt) {
  G.t += dt;
  input.update(dt); if (guest) guest.update(dt);
  G.clock.update(dt); weather.update(dt);
  updateItems(dt);
  const boil = cart.update(dt, G.t);
  game.update(dt, G.t); rush.update(); regs.update(dt); events.update(dt);
  city.update(dt, G.t);
  life.update(dt, G.t); shade.update();
  talk.update(dt); tv.update(dt); tank.update(dt); story.update(dt); live.update(dt); share.update(dt); if (!guest) cook.update(dt);
  grit.update(dt, G.t);
  guide.update(dt, G.t); gameMenu.update(dt); boards.update(); report.update(dt);
  G.fx.update(dt);
  G.audio.update(boil, life.env);
}
let last = performance.now(), frames = 0, statT = 0;
// if frames still run long, shadows go (the costliest thing left)
let emaMs = 14, slowT = 0; G.quality = params.has('low') ? 1 : 0;
const shadowLights = []; scene.traverse((o) => { if (o.isLight && o.castShadow) shadowLights.push(o); });
const spotSh = shadowLights.filter((l) => l.isSpotLight); spotSh.forEach((l) => { l.shadow.autoUpdate = false; l.shadow.needsUpdate = true; });   // the cart's lamp's shadows: only while it burns, laid every other frame
const CART = new THREE.Vector3(0, 1, 0), _ce = new THREE.Vector3();
function lean2() { for (const l of spotSh) if (l.castShadow && l.intensity > 0.05 && !(frames & 1)) l.shadow.needsUpdate = true;
  G.itemRoot.visible = camera.getWorldPosition(_ce).distanceTo(CART) < 20; }   // the cart's small loose things are not drawn from far up the street (lost in the haze there)
function applyQuality() { shadowLights.forEach((l) => (l.castShadow = G.quality < 1)); if (G.set) G.set.shadows = G.quality < 1; }
// the resolution follows the frame time: down a step when frames run long for a moment, up a step after a while with room to spare (steps, never a pulse)
let rsT = 0; G.vrScale = 1;
function governScale(dt) { if (frames < 60 || G.frozen || params.has('scale')) return; const ses = renderer.xr.isPresenting && renderer.xr.getSession(), hz = (ses && ses.frameRate) || 60, budget = 1000 / hz, ms = G.emaMs || emaMs;
  rsT += dt; if (rsT < (ms > budget * 1.08 ? 1 : 4)) return; rsT = 0;
  if (ses) { const v = G.vrScale; G.vrScale = ms > budget * 1.08 ? Math.max(0.6, v - 0.1) : ms < budget * 0.8 ? Math.min(1, v + 0.05) : v; return; }
  const r = G.rscale, n = ms > budget * 1.08 ? Math.max(RS.min, r - 0.1) : ms < budget * 0.75 ? Math.min(RS.max, r + 0.05) : r;
  if (Math.abs(n - r) > 0.001) { G.rscale = +n.toFixed(2); renderer.setPixelRatio(ratio()); } }
function govern(dt) { emaMs += (dt * 1000 - emaMs) * 0.05; G.emaMs = emaMs; governScale(dt); if (frames < 120 || G.frozen || G.quality >= 1) return; const ses = renderer.xr.isPresenting && renderer.xr.getSession(), hz = (ses && ses.frameRate) || 72; slowT = emaMs > (ses ? 1150 / hz : 30) ? slowT + dt : 0;
  if (slowT > 3) { slowT = 0; if (ses && hz > 72 && ses.updateTargetFrameRate) ses.updateTargetFrameRate(72).catch(() => { }); else { G.quality = 1; applyQuality(); } } }   // too slow: first back to 72 a second, then the shadows go
if (G.quality) applyQuality();
const report = buildReport(scene, camera, renderer, talk);
const gameMenu = buildMenu(scene, cart, guide, talk, shadowLights, report);
// on a screen: whether the cart is linked to THE MARKET, and who is in its alley (the settings board says the same in the headset): shown for a few seconds when it changes, then put away (a guest's stays)
{ const tag = document.createElement('div'); tag.style.cssText = 'position:fixed;top:10px;right:12px;font:600 13px var(--ui);color:#ffd9a0;background:rgba(10,10,14,.7);padding:6px 10px;border-radius:6px;pointer-events:none;z-index:5;transition:opacity 1.2s'; document.body.appendChild(tag); let was = '', until = 0;
  setInterval(() => { const s = live.status(), now = performance.now(); if (s !== was) { was = s; until = now + (/CONNECTING|…/.test(s) ? 7000 : 5000); } tag.textContent = 'THE MARKET: ' + s; tag.style.display = G.mode === 'desktop' ? 'block' : 'none'; tag.style.opacity = G.guest || now < until ? 1 : 0; }, 1000); }
// the strip of keys fades after the first minute; H shows it again for a while
{ const keys = $('keys'); keys.style.transition = 'opacity 2s'; let show = 60; setInterval(() => { if (G.mode !== 'desktop') return; show -= 1; keys.style.opacity = show > 0 ? 1 : 0; }, 1000); addEventListener('keydown', (e) => { if (e.code === 'KeyH' && e.target.tagName !== 'INPUT') show = show > 0 ? 0 : 30; }); G.keysShown = () => show > 0; }
// what is written small in the world (a ticket, the menu board, a label), read sharp: on a screen, looked at from close, it is shown again beside the crosshair at the page's own resolution, whatever the picture's is
{ const rd = document.createElement('canvas'); rd.id = 'read'; rd.style.cssText = 'position:fixed;right:14px;top:50%;transform:translateY(-50%);max-width:36vw;max-height:60vh;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,.6);pointer-events:none;z-index:4;display:none;opacity:.97'; document.body.appendChild(rd);
  const ray = new THREE.Raycaster(), mid = new THREE.Vector2(0, 0); ray.far = 3.2; let shown = null, at = 0, cand = null, labels = null; const _n = new THREE.Vector3(), _e = new THREE.Vector3();
  // (a board with nothing on it, a display that is off, is not worth showing again: an empty dark box by the crosshair)
  const bc = document.createElement('canvas'); bc.width = bc.height = 32; const bg = bc.getContext('2d', { willReadFrequently: true }), blankOf = new WeakMap();
  const blank = (t) => { const k = blankOf.get(t); if (k && k.v === t.version) return k.e; let e = true; try { bg.clearRect(0, 0, 32, 32); bg.drawImage(t.image, 0, 0, 32, 32); const d = bg.getImageData(0, 0, 32, 32).data; let lo = 255, hi = 0; for (let i = 0; i < d.length; i += 4) { const l = (d[i] * 3 + d[i + 1] * 6 + d[i + 2]) / 10 * (d[i + 3] / 255); if (l < lo) lo = l; if (l > hi) hi = l; } e = hi - lo < 30; } catch (err) { e = false; } blankOf.set(t, { v: t.version, e }); return e; };
  const written = (o) => { const map = o && o.visible && o.material && !Array.isArray(o.material) && o.material.map, img = map && map.image; return !!(img && img.getContext && img.width >= 200 && o.geometry.type === 'PlaneGeometry' && !o.userData.noread && !blank(map)); };
  setInterval(() => { if (G.mode !== 'desktop' || G.ended || (G.set && G.set.reader === false)) { if (shown) { shown = null; rd.style.display = 'none'; } return; }
    if (!labels && G.t > 3) { labels = []; cart.group.traverse((o) => { if (o.isMesh && written(o)) labels.push(o); }); }
    ray.setFromCamera(mid, camera); const tickets = game.customers.map((c) => c.ticket).filter(Boolean), hit = ray.intersectObjects([cart.group, ...tickets], true).find((h) => h.object.visible && !h.object.isSprite); let ok = hit && written(hit.object) ? hit.object : null;
    if (!ok && labels) { camera.getWorldPosition(_e); let best = 0.13; for (const o of [...labels, ...tickets]) { if (!written(o)) continue; o.getWorldPosition(_n); if (_n.distanceTo(_e) > 2.3) continue; _n.project(camera); if (_n.z > 1) continue; const d = Math.hypot(_n.x, _n.y * 0.6); if (d < best) { best = d; ok = o; } } }   // (a small label beside the crosshair counts as looked at)
    if (ok) { const w = ok.geometry.parameters.width / 2, a = _n.set(-w, 0, 0).applyMatrix4(ok.matrixWorld).project(camera).x, b = _e.set(w, 0, 0).applyMatrix4(ok.matrixWorld).project(camera).x, seen = Math.abs(b - a) * innerWidth / 2, im = ok.material.map.image; if (Math.min(im.width, 720, innerWidth * 0.36) < seen * 1.15) ok = null; }   // (what is already drawn larger than its copy would be is left alone: the menu board from close)
    if (ok !== cand) { cand = ok; at = performance.now(); } const want = cand && performance.now() - at > 350 ? cand : null;
    if (want) { const im = want.material.map.image, k = Math.min(1, 720 / im.width); if (shown !== want || rd.width !== Math.round(im.width * k)) { rd.width = Math.round(im.width * k); rd.height = Math.round(im.height * k); } rd.getContext('2d').drawImage(im, 0, 0, rd.width, rd.height); rd.style.display = 'block'; shown = want; } else if (shown) { shown = null; rd.style.display = 'none'; } }, 180); }
// easy on the eyes (the settings board, on unless turned off): more fill light, the bright points and their halos lower, thin rain, a dim television, less edge blur in the headset
G.eyes = (on) => { city.setEasy(on); G.cart.lamps?.(G.cart.lampK || 0); if (renderer.xr.isPresenting) renderer.xr.setFoveation?.(on ? 0.25 : 0.5); };   // easy on the eyes (the settings board, on unless turned off): more fill light, the lanterns and their halos lower, less edge blur in the headset
G.eyes(G.set.easy);
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
  if (G.mode === 'menu' && !renderer.xr.isPresenting && !G.manualCam) { const a = G.t * 0.05; camera.position.set(2.9 + Math.sin(a) * 0.9, 1.75, -5.4 + Math.cos(a) * 0.4); rig.position.set(0, 0, 0); camera.lookAt(0, 1.6, -0.4); }
  if (!G.frozen) tick(dt);
  govern(dt); frames++; lean2();
  render();
  if (G.afterRender) { const f = G.afterRender; G.afterRender = null; f(); }
  if (G.mode === 'desktop') { $('hover').textContent = G.ended ? '' : G.hoverText || ''; statT -= dt; if (statT <= 0) { statT = 0.5; $('stat').textContent = G.ended ? '' : G.guideText || G.hint; } }
}
renderer.setAnimationLoop(frame);

G.debug = { boards, weather, dawn, tv, Items, DRINKS, PH, person: makePerson, PF, tenant: tenantFigure, city, guide, menu: gameMenu, report, tick, frame, render, input, startDesktop, startVR, THREE, share, guest, tank };
if (G.guest) { menu.querySelector('h2').textContent = 'RAMEN, as yourself: walk the block up to the ramen cart, take a stool, order a bowl and pay for it. The cook, the customers and everyone passing are the same people every page on the block sees.'; $('help').innerHTML = '<div><b>Browser</b> WASD walk · mouse look · V first / third person · E sit at a stool or get up · click the menu to order · M settings</div><div><b>VR</b> left stick walk · right stick turn · trigger by a stool to sit · step away to get up · poke the menu to order</div><div><b>Back</b> walk out at the end of the street, or LEAVE, to THE MARKET</div>'; $('keys').textContent = 'WASD walk · V view · E sit / get up · click: order · M settings · Esc: free mouse'; deskBtn.textContent = 'Walk the block in this browser'; }
window.G = G;
{ const box = $('say'); // on a screen: M the settings board, G the guide, T to type what you say if you would rather not speak it
  addEventListener('keydown', (e) => { if (G.mode !== 'desktop' || e.repeat) return; if (e.target === box) { if (e.code === 'Enter') { const t = box.value.trim(); box.value = ''; box.style.display = 'none'; box.blur(); if (t) talk.cookSays(t); } else if (e.code === 'Escape') { box.value = ''; box.style.display = 'none'; box.blur(); } return; }
    if (e.code === 'KeyM') gameMenu.toggle(); else if (e.code === 'KeyG') guide.set(!guide.on); else if (e.code === 'KeyT') { e.preventDefault(); document.exitPointerLock?.(); box.style.display = 'block'; box.focus(); } }); }
if (params.has('desktop')) startDesktop();
