// THE CANTINA: a two-storey bar of strange regulars with card tables you sit at and a jukebox; its own page (/cantina), desktop and VR. This file is the page's glue: the look for the hour, the loop, the menu.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TABLES, SPAWN, seatInfo } from './layout.js';
import { buildBar, THEMES } from './room.js';
import { CardSystem } from './cards.js';
import { Avatar, makePose } from './avatar.js';
import { Local } from './local.js';
import { Sfx } from './audio.js';
import { DesktopControls } from './desktop.js';
import { XRControls } from './xr.js';
import { Jukebox } from './jukebox.js';
import { Talk } from './talk.js';

const $ = (id) => document.getElementById(id), q = new URLSearchParams(location.search);
const standalone = /OculusBrowser|Quest|Pico|Android/i.test(navigator.userAgent);
const Q = { low: standalone || q.get('quality') === 'low', shadows: !standalone && q.get('quality') !== 'low' };

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q.low ? 1 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = Q.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.03, 60);
const dolly = new THREE.Group();
dolly.position.set(SPAWN.x, 0, SPAWN.z);
dolly.add(camera); scene.add(dolly);
camera.position.y = 1.65;
camera.add(new THREE.PointLight(0xfff0e0, 0.3, 1.4, 1.5));
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { samples: 4, type: THREE.HalfFloatType }));
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.32, 0.6, 0.96));
composer.addPass(new OutputPass());

const game = { renderer, scene, camera, dolly, started: false, me: { id: 1, seat: null, pose: makePose(), avatar: null }, players: new Map(), world: null };
game.net = new Local(game);
game.sfx = new Sfx(() => game.me.pose.head.p);
game.talk = new Talk(game);
Q.names = game.talk.names();

// the look follows the hour (Central time, as THE MARKET's clock): the Barrel House by day, the Onyx Room in the evening, After Hours late
const hour = () => q.has('hour') ? +q.get('hour') : +new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hourCycle: 'h23' }).format(new Date());
const lookAt = (h) => h >= 6 && h < 17 ? 'B' : h >= 17 && h < 23 ? 'A' : 'C';
let pick = q.get('style') || 'auto';
try { pick = q.get('style') || localStorage.getItem('cantina-style') || 'auto'; } catch (e) { }
const wanted = () => THEMES[pick] ? pick : lookAt(hour());
const fade = $('fade');
let building = false;
async function setLook(key) {
  if (building || (game.world && game.world.key === key)) return;
  building = true; fade.classList.add('on');
  await new Promise((r) => setTimeout(r, game.world ? 450 : 0));
  if (game.world) game.world.dispose();
  game.world = null;
  game.world = await buildBar(scene, renderer, key, Q);
  juke.place(game.world);
  $('look').textContent = THEMES[key].name;
  for (const b of document.querySelectorAll('[data-style]')) b.classList.toggle('sel', b.dataset.style === pick);
  fade.classList.remove('on'); building = false;
}

game.handObj = (pid, side) => (pid === game.me.id && game.me.avatar ? game.me.avatar.hands[side].root : null);
game.seatTaken = () => false;
game.nearestFreeSeat = (x, z, max, y = 0) => {
  let best = null, bd = max;
  TABLES.forEach((T, t) => { if (Math.abs(T.base - y) > 1) return; for (const s of T.free) { const si = seatInfo(t, s), d = Math.hypot(si.x - x, si.z - z); if (d < bd) { bd = d; best = { t, s }; } } });
  return best;
};
game.sit = (t, s) => { game.net.send({ op: 'sit', t, s }); };
game.stand = () => { game.net.send({ op: 'stand' }); };
game.pressButton = (t, which) => { game.world.press(t, which); game.sfx.click(game.world.buttonMeshes[t * 2 + which].position); game.net.send({ op: 'btn', t, which }); };
const hintEl = $('hint');
let hintText = '';
game.hint = (text) => { if (text !== hintText) { hintText = text; hintEl.textContent = text; } };
game.state = () => { const h = hour(), s = game.me.seat; return `the look tonight: ${game.world ? game.world.theme.name : ''}; the hour: ${h}; the jukebox is ${juke.playing() ? 'playing ' + juke.playing().title + ' (' + juke.playing().year + ')' : 'silent'}; the visitor is ${s ? 'sitting at ' + (s.t ? 'the loft card table' : 'the long card table') : 'standing'}`; };
// nearest thing along a ray: cards on tables and decks, table buttons, seat markers
game.pick = (ray, markers) => {
  const w = game.world; if (!w) return null;
  let best = null;
  const consider = (hits, make) => { if (hits.length && (!best || hits[0].distance < best.dist)) best = { dist: hits[0].distance, point: hits[0].point, ...make(hits[0].object) }; };
  consider(ray.intersectObjects(game.cards.pickList(), false), (o) => ({ type: 'card', id: game.cards.resolvePick(o.userData.card) }));
  consider(ray.intersectObjects(w.buttonMeshes, false), (o) => ({ type: 'button', ...o.userData.button }));
  if (markers) {
    const list = []; for (const row of w.seatMarkers) for (const m of row) if (m.visible) list.push(m);
    consider(ray.intersectObjects(list, false), (o) => ({ type: 'seat', ...o.userData.seat }));
    if (w.standMarker.visible) consider(ray.intersectObject(w.standMarker, false), () => ({ type: 'stand' }));
  }
  consider(ray.intersectObject(w.jukebox.obj, true), () => ({ type: 'jukebox' }));
  return best && best.type === 'card' && best.id < 0 ? null : best;
};

game.cards = new CardSystem(game);
const N = game.net;
N.on('seat', (m) => { game.me.seat = m.seat; });
N.on('deckset', (m) => game.cards.deckSet(m.t, m.deck, m.shuffle));
N.on('dealt', (m) => game.cards.dealt(m.items));
const juke = game.juke = new Jukebox(game, __RADIO__);
const desk = new DesktopControls(game), xrc = new XRControls(game);
game.me.avatar = new Avatar(scene, { id: 1, name: '', color: 0x29a19c, local: true });

function begin() {
  game.sfx.unlock(); juke.start();
  if (!game.started) { game.started = true; for (let t = 0; t < TABLES.length; t++) game.net.send({ op: 'btn', t, which: 0 }); }
}
$('play').addEventListener('click', () => { begin(); $('menu').hidden = true; $('hud').hidden = false; renderer.domElement.requestPointerLock?.(); });
if (navigator.xr) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { $('vr').disabled = !ok; }).catch(() => { });
$('vr').addEventListener('click', async () => {
  let session;
  try { session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] }); } catch (e) { $('status').textContent = 'Could not start VR: ' + e.message; return; }
  begin(); document.exitPointerLock?.(); camera.fov = 70; camera.position.set(0, 1.6, 0); camera.rotation.set(0, 0, 0);
  await renderer.xr.setSession(session);
  dolly.position.copy(desk.pos); dolly.rotation.set(0, desk.yaw, 0); xrc.begin();
  $('menu').hidden = true; $('hud').hidden = true;
  session.addEventListener('end', () => { xrc.end(); desk.adopt(game.me.pose.head.p, xrc.headYaw()); camera.rotation.set(0, 0, 0); $('menu').hidden = false; });
});
for (const b of document.querySelectorAll('[data-style]')) b.addEventListener('click', () => { pick = b.dataset.style; try { localStorage.setItem('cantina-style', pick); } catch (e) { } setLook(wanted()); });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && game.started && !renderer.xr.isPresenting && !game.talk.open && !juke.open) { $('menu').hidden = false; $('hud').hidden = true; } });
window.addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight); });

let last = 0, lookT = 0;
renderer.setAnimationLoop((time) => {
  const now = performance.now(), dt = Math.min((now - (last || now)) / 1000, 0.05); last = now;
  const w = game.world;
  if (w) {
    if (game.started) {
      if (renderer.xr.isPresenting) xrc.update(dt); else desk.update(dt);
      const av = game.me.avatar; av.pose = game.me.pose; av.showArms = !renderer.xr.isPresenting; av.apply(dt);
    } else {
      const a = time * 0.00006; dolly.position.set(2 + Math.sin(a) * 4.5, 0, 2.5 + Math.cos(a) * 3.5); dolly.rotation.set(0, a + 0.4, 0); camera.position.set(0, 3.2, 0); camera.rotation.set(-0.28, 0, 0);
      dolly.updateMatrixWorld(true); camera.matrixWorld.decompose(game.me.pose.head.p, game.me.pose.head.q, new THREE.Vector3());
    }
    juke.update();
    game.cards.update(dt);
    w.update(dt, time, game.me.pose.head.p);
  }
  if ((lookT += dt) > 20) { lookT = 0; if (w && !building && wanted() !== w.key && !game.me.seat) setLook(wanted()); }
  if (renderer.xr.isPresenting || Q.low) renderer.render(scene, camera); else composer.render();
});

await setLook(wanted());
$('loading').hidden = true; $('menu').hidden = false;
window.__game = game; window.__desk = desk; window.__xrc = xrc; window.__juke = juke; window.__setLook = setLook;
