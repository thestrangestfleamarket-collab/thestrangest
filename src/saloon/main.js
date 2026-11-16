// THE LAST CHANCE, a saloon in Perdition, Arizona Territory, 1881, at /saloon (a headset game, or a screen): the renderer, the loop, the way in
import * as THREE from 'three';
import { G, clamp } from '../sushi/ctx.js';
import { buildFx } from '../sushi/fx.js';
import { buildInput } from '../sushi/input.js';
import { updateItems } from '../sushi/items.js';
import { PH } from '../sushi/physics.js';
import { PF, loadCast } from '../sushi/pf.js';
import { NET } from '../holo/net.js';
import { SaloonAudio } from './audio.js';
import { BODIES } from './cast.js';
import { loadKit, BASE, cheap } from './kit.js';
import { buildRoom } from './room.js';
import { buildLook } from './look.js';
import { buildInspect } from './inspect.js';
import { buildBar } from './bar.js';
import { buildFolk } from './folk.js';
import { buildStory } from './story.js';
import { buildTalk } from './talk.js';
import { buildGuns } from './guns.js';
import { buildPool } from './pool.js';
import { buildDarts } from './darts.js';
import { buildPosters } from './posters.js';

const params = new URLSearchParams(location.search), $ = (id) => document.getElementById(id);
const canvas = $('c'), menu = $('menu'), hud = $('hud'), vrBtn = $('vr'), deskBtn = $('desk');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation?.(0.5); renderer.xr.setFramebufferScaleFactor?.(1);

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060a); scene.fog = new THREE.FogExp2(0x0e0c0a, 0.05);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.03, 120);
const rig = new THREE.Group(); rig.position.set(0, 0, 0.3); rig.add(camera); scene.add(rig);
Object.assign(G, { scene, camera, rig, renderer, params });
G.pickRoot = new THREE.Group(); scene.add(G.pickRoot);
G.itemRoot = new THREE.Group(); G.pickRoot.add(G.itemRoot);
G.peopleRoot = new THREE.Group(); scene.add(G.peopleRoot);
G.audio = new SaloonAudio(); G.game = {};
Object.assign(PF, BODIES);

{ const l = vrBtn.textContent, say = (f) => { vrBtn.textContent = `Loading… ${Math.round(f * 100)}%`; };
  await Promise.all([loadKit((f) => say(f * 0.9)), loadCast(`${BASE}cast.json`).then(() => { G.castReady = true; }).catch((e) => console.warn('the people did not load', e))]); vrBtn.textContent = l; }
try { await PH.init(); } catch (e) { console.warn('physics engine unavailable, simple falling instead', e); }

buildFx(scene);
const room = (G.room = buildRoom(scene));
const input = buildInput(renderer, rig, camera, canvas);
const bar = (G.bar = buildBar(scene, room));
const folk = (G.folk = buildFolk(scene, room));
const story = (G.story = buildStory(room));
const talk = (G.talk = buildTalk(scene));
const guns = (G.guns = buildGuns(scene, room));
const pool = (G.pool = buildPool(scene, room));
const darts = (G.darts = buildDarts(scene, room));
const posters = (G.posters = buildPosters(scene, room));
const look = (G.look = buildLook(scene, room, renderer, camera));
cheap(scene); cheap(G.itemRoot, true);
const inspect = (G.inspect = buildInspect(scene, room, look, renderer, camera));
const shadowLights = []; scene.traverse((o) => { if (o.isLight && o.castShadow) shadowLights.push(o); });

addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// ---------- the way in ----------
function begin() { G.audio.init(); talk.listen(true); story.begin(); }
function startDesktop() { begin(); G.mode = 'desktop'; menu.style.display = 'none'; hud.style.display = 'block'; rig.position.set(0, 0, 0.3); }
deskBtn.onclick = startDesktop;
async function startVR() {
  begin();
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] });
    rig.position.set(0, 0, 0.3); rig.rotation.set(0, 0, 0); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
    await renderer.xr.setSession(session); G.mode = 'vr'; menu.style.display = 'none'; hud.style.display = 'none';
    if (session.updateTargetFrameRate && session.supportedFrameRates) { const r = [...session.supportedFrameRates].filter((x) => x <= 90); if (r.length) session.updateTargetFrameRate(Math.max(...r)).catch(() => { }); }
    session.addEventListener('end', () => { G.mode = 'menu'; menu.style.display = 'flex'; });
  } catch (e) { vrBtn.textContent = 'VR failed: ' + e.message; console.error(e); }
}
NET.tok().then(() => fetch('/saloon/talk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).then((r) => { if (r.status === 401) $('login').style.display = 'inline-block'; }).catch(() => { }); // the voices are a login's: say so before the headset goes on
vrBtn.onclick = async () => { if (await talk.needPrime()) { vrBtn.textContent = 'Allow the microphone…'; const ok = await talk.prime(); vrBtn.textContent = ok ? 'Enter VR' : 'Enter VR (no microphone)'; return; } startVR(); };
if (navigator.xr?.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { vrBtn.disabled = !ok; vrBtn.textContent = ok ? 'Enter VR' : 'No headset here'; if (!ok) { vrBtn.classList.remove('primary'); deskBtn.classList.add('primary'); } }).catch(() => { vrBtn.textContent = 'VR unavailable'; });
else vrBtn.textContent = location.protocol === 'https:' || location.hostname === 'localhost' ? 'Open this page in a VR headset' : 'VR needs HTTPS';

// ---------- loop ----------
function tick(dt) {
  G.t += dt;
  input.update(dt); room.walk(rig, camera, dt);
  updateItems(dt);
  room.update(dt, G.t); look.update(dt, G.t); bar.update(dt, G.t); folk.update(dt, G.t); story.update(dt, G.t); talk.update(dt);
  guns.update(dt, G.t); pool.update(dt, G.t); darts.update(dt, G.t); posters.update(dt, G.t);
  for (const f of G.updaters) f(dt, G.t);
  if ((G.t * 2 | 0) !== cheapT) { cheapT = G.t * 2 | 0; cheap(G.itemRoot, true); cheap(G.peopleRoot); }
  G.fx.update(dt);
  G.audio.update(dt, folk.crowd());
}
let cheapT = -1, last = performance.now(), frames = 0, statT = 0, ema = 14, slow = 0;
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
  if (G.mode === 'menu' && !renderer.xr.isPresenting && !G.manualCam) { const a = G.t * 0.04; rig.position.set(0, 0, 0); camera.position.set(7.5 + Math.sin(a) * 1.2, 1.7, -3.6 + Math.cos(a) * 0.8); camera.lookAt(-1, 1.3, -0.4); }
  if (!G.frozen) tick(dt);
  if (frames++ > 120 && (G.quality || 0) < shadowLights.length && !G.frozen) { ema += (dt * 1000 - ema) * 0.05; const ses = renderer.xr.isPresenting && renderer.xr.getSession(), hz = (ses && ses.frameRate) || 72; slow = ema > (ses ? 1150 / hz : 34) ? slow + dt : 0; if (slow > 3) { slow = 0; shadowLights[shadowLights.length - 1 - (G.quality || 0)].castShadow = false; G.quality = (G.quality || 0) + 1; } }   // frames running long: the lamps stop throwing shadows one at a time, the moon's first
  look.render(); inspect.update();
  if (G.afterRender) { const f = G.afterRender; G.afterRender = null; f(); }
  if (G.mode === 'desktop') { $('hover').textContent = G.hoverText || ''; statT -= dt; if (statT <= 0) { statT = 0.5; $('stat').textContent = G.hint || ''; } }
}
renderer.setAnimationLoop(frame);

G.debug = { PH, PF, room, bar, folk, story, talk, guns, pool, darts, posters, look, tick, frame, input, startDesktop, startVR, THREE };
window.G = G;
{ const box = $('say'); // on a screen: T to type what you say if you would rather not speak it
  addEventListener('keydown', (e) => { if (G.mode !== 'desktop' || e.repeat) return; if (e.target === box) { if (e.code === 'Enter') { const t = box.value.trim(); box.value = ''; box.style.display = 'none'; box.blur(); if (t) talk.youSay(t); } else if (e.code === 'Escape') { box.value = ''; box.style.display = 'none'; box.blur(); } return; }
    if (e.code === 'KeyI') inspect.open(); else if (e.code === 'KeyT') { e.preventDefault(); document.exitPointerLock?.(); box.style.display = 'block'; box.focus(); } }); }
if (params.has('desktop')) startDesktop();
if (params.has('inspect')) inspect.open();
