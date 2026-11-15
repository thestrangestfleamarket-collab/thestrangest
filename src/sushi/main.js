// YATAI '86, the night ramen cart at /sushi (a headset game): the renderer in a PlayStation 2 look, the loop, the way in
import * as THREE from 'three';
import { G, clamp, mergeStatic } from './ctx.js';
import { buildAlley, FOG } from './alley.js';
import { buildCart } from './cart.js';
import { buildFx } from './fx.js';
import { buildGame } from './game.js';
import { buildInput } from './input.js';
import { updateItems } from './items.js';
import * as Items from './items.js';
import { GameAudio } from './audio.js';
import { loadAvatars, makePerson } from './avatars.js';
import { PF } from './pf.js';
import { buildLife } from './life.js';
import { buildTalk } from './talk.js';
import { buildGrit } from './grit.js';
import { buildGuide } from './guide.js';
import { buildMenu } from './menu.js';
import { buildReport } from './report.js';
import { buildTV } from './tv.js';
import { buildLive } from './live.js';
import { buildCook } from './cook.js';
import { PH } from './physics.js';
import * as T from './tex.js';

const params = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation?.(1); renderer.xr.setFramebufferScaleFactor?.(0.9);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(FOG, 0.022); scene.background = new THREE.Color(0x05060c);
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
const city = buildAlley(scene);
const cart = buildCart(scene, city);
if (PH.ready) PH.statics(cart);
const game = buildGame(scene);
const input = buildInput(renderer, rig, camera, canvas);
const life = buildLife(scene, city, cart);
const talk = buildTalk(scene);
const grit = buildGrit(scene, city, cart);
const guide = buildGuide(scene, cart);
T.metreUV(cart.group);
G.baked = mergeStatic(cart.group) + mergeStatic(city.group);
const tv = buildTV(scene, city.shops), live = buildLive(), cook = buildCook();

// on a screen: the scene is drawn small, then enlarged with ordered dither and a short palette, as that console's output looked
const LOWH = 540; let lowRT = null;
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tD: { value: null }, res: { value: new THREE.Vector2(512, LOWH) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D tD; uniform vec2 res; varying vec2 vUv;
    float B2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
    void main(){ vec2 px = floor(vUv * res); vec3 c = texture2D(tD, (px + 0.5) / res).rgb;
      c = 1.0 - exp(-c * 1.5); c = pow(c, vec3(1.0 / 2.2));
      float d = B2(0.5 * px) * 0.25 + B2(px);
      c = floor(c * 63.0 + d) / 63.0;
      gl_FragColor = vec4(c, 1.0); }` }));
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); quadScene.add(quad); quad.frustumCulled = false;
function sizeLow() { const w = Math.max(64, Math.round(LOWH * innerWidth / innerHeight)); lowRT?.dispose(); lowRT = new THREE.WebGLRenderTarget(w, LOWH, { type: THREE.HalfFloatType, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter }); quad.material.uniforms.res.value.set(w, LOWH); quad.material.uniforms.tD.value = lowRT.texture; }
sizeLow();
function render() {
  if (renderer.xr.isPresenting) return renderer.render(scene, camera);
  renderer.setRenderTarget(lowRT); renderer.render(scene, camera); renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
}
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); sizeLow(); });

// ---------- the way in ----------
function begin() { G.audio.init(); if (!G.audio.radioOn) G.audio.setRadio(true); talk.listen(true); }
function startDesktop() { begin(); G.mode = 'desktop'; menu.style.display = 'none'; hud.style.display = 'block'; rig.position.set(0, 0, 0.3); }
deskBtn.onclick = startDesktop;
async function startVR() {
  begin();
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] });
    rig.position.set(0, 0, 0.3); rig.rotation.set(0, 0, 0); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
    await renderer.xr.setSession(session); G.mode = 'vr'; menu.style.display = 'none'; hud.style.display = 'none';
    session.addEventListener('end', () => { G.mode = 'menu'; menu.style.display = 'flex'; });
  } catch (e) { vrBtn.textContent = 'VR failed: ' + e.message; console.error(e); }
}
fetch('/sushi/say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => { if (r.status === 401) $('login').style.display = 'inline-block'; else G.live?.join(); }).catch(() => { }); // the patrons' voices are a login's: say so before the headset goes on
vrBtn.onclick = async () => { if (await talk.needPrime()) { vrBtn.textContent = 'Allow the microphone…'; const ok = await talk.prime(); vrBtn.textContent = ok ? 'Enter VR' : 'Enter VR (no microphone)'; return; } startVR(); }; // the microphone is asked for on its own press: a prompt cannot be answered inside the headset view
if (navigator.xr?.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { vrBtn.disabled = !ok; vrBtn.textContent = ok ? 'Enter VR' : 'No headset here'; if (!ok) { vrBtn.classList.remove('primary'); deskBtn.classList.add('primary'); } }).catch(() => { vrBtn.textContent = 'VR unavailable'; });
else vrBtn.textContent = location.protocol === 'https:' || location.hostname === 'localhost' ? 'Open this page in a VR headset' : 'VR needs HTTPS';

// ---------- loop ----------
function tick(dt) {
  G.t += dt;
  input.update(dt);
  updateItems(dt);
  const boil = cart.update(dt, G.t);
  game.update(dt, G.t);
  city.update(dt, G.t);
  life.update(dt, G.t);
  talk.update(dt); tv.update(dt); live.update(dt); cook.update(dt);
  grit.update(dt, G.t);
  guide.update(dt, G.t); gameMenu.update(dt); report.update(dt);
  G.fx.update(dt);
  G.audio.update(boil, life.env);
}
let last = performance.now(), frames = 0, statT = 0;
// if frames still run long, shadows go (the costliest thing left)
let emaMs = 14, slowT = 0; G.quality = params.has('low') ? 1 : 0;
const shadowLights = []; scene.traverse((o) => { if (o.isLight && o.castShadow) shadowLights.push(o); });
function applyQuality() { shadowLights.forEach((l) => (l.castShadow = G.quality < 1)); if (G.set) G.set.shadows = G.quality < 1; }
function govern(dt) { if (frames < 120 || G.frozen || G.quality >= 1) return; emaMs += (dt * 1000 - emaMs) * 0.05; G.emaMs = emaMs; slowT = emaMs > (renderer.xr.isPresenting ? 16 : 30) ? slowT + dt : 0; if (slowT > 3) { G.quality = 1; applyQuality(); } }
if (G.quality) applyQuality();
const report = buildReport(scene, camera, renderer, talk);
const gameMenu = buildMenu(scene, cart, guide, talk, shadowLights, report);
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
  if (G.mode === 'menu' && !renderer.xr.isPresenting && !G.manualCam) { const a = G.t * 0.05; camera.position.set(2.9 + Math.sin(a) * 0.9, 1.75, -5.4 + Math.cos(a) * 0.4); rig.position.set(0, 0, 0); camera.lookAt(0, 1.6, -0.4); }
  if (!G.frozen) tick(dt);
  if (frames === 2) { city.bakeFar(renderer); city.reflect(renderer, scene); }
  govern(dt); frames++;
  render();
  if (G.afterRender) { const f = G.afterRender; G.afterRender = null; f(); }
  if (G.mode === 'desktop') { $('hover').textContent = G.hoverText || ''; statT -= dt; if (statT <= 0) { statT = 0.5; $('stat').textContent = G.guideText || G.hint; } }
}
renderer.setAnimationLoop(frame);

G.debug = { Items, PH, person: makePerson, PF, city, guide, menu: gameMenu, report, tick, frame, render, input, startDesktop, startVR, THREE };
window.G = G;
{ const box = $('say'); // on a screen: M the settings board, G the guide, T to type what you say if you would rather not speak it
  addEventListener('keydown', (e) => { if (G.mode !== 'desktop' || e.repeat) return; if (e.target === box) { if (e.code === 'Enter') { const t = box.value.trim(); box.value = ''; box.style.display = 'none'; box.blur(); if (t) talk.cookSays(t); } else if (e.code === 'Escape') { box.value = ''; box.style.display = 'none'; box.blur(); } return; }
    if (e.code === 'KeyM') gameMenu.toggle(); else if (e.code === 'KeyG') guide.set(!guide.on); else if (e.code === 'KeyT') { e.preventDefault(); document.exitPointerLock?.(); box.style.display = 'block'; box.focus(); } }); }
if (params.has('desktop')) startDesktop();
