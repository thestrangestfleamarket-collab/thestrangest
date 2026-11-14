// YATAI '86, the night ramen cart at /sushi: the renderer, the loop, the menu, the desktop picture's lens and grain
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { G, clamp } from './ctx.js';
import { buildCity, FOG } from './city.js';
import { buildCart } from './cart.js';
import { buildFx } from './fx.js';
import { buildGame } from './game.js';
import { buildInput } from './input.js';
import { updateItems } from './items.js';
import * as Items from './items.js';
import { GameAudio } from './audio.js';
import { loadAvatars } from './avatars.js';
import { buildLife } from './life.js';
import { buildTalk } from './talk.js';
import { buildGrit } from './grit.js';
import { PH } from './physics.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const params = new URLSearchParams(location.search);

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor'); renderer.xr.setFoveation?.(1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(FOG, 0.017); scene.background = new THREE.Color(0x05040a);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.03, 900);
const rig = new THREE.Group(); rig.position.set(0, 0, 0.3); rig.add(camera); scene.add(rig);
Object.assign(G, { scene, camera, rig, renderer });
G.pickRoot = new THREE.Group(); scene.add(G.pickRoot);
G.itemRoot = new THREE.Group(); G.pickRoot.add(G.itemRoot);
G.peopleRoot = new THREE.Group(); scene.add(G.peopleRoot);
G.audio = new GameAudio();

{ const vb = document.getElementById('vr'), db = document.getElementById('desk'), dl = db.textContent; db.disabled = true;
  await loadAvatars((f) => { db.textContent = `Loading people… ${Math.round(f * 100)}%`; }); db.textContent = dl; db.disabled = false; }

try { await PH.init(); } catch (e) { console.warn('physics engine unavailable, simple falling instead', e); }

buildFx(scene);
const city = buildCity(scene);
const cart = buildCart(scene, city);
if (PH.ready) PH.statics(cart);
const game = buildGame(scene);
const input = buildInput(renderer, rig, camera, canvas);
const life = buildLife(scene, city, cart);
const talk = buildTalk(scene);
const grit = buildGrit(scene, city, cart);

// image-based lighting captured from the scene itself (reflections on steel, broth, wet street)
function bakeEnv() {
  const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.3, 500, rt); cc.position.set(0, 1.55, -1.9);
  const vis = cart.group.visible; cart.group.visible = false; G.itemRoot.visible = false;
  cc.update(renderer, scene);
  cart.group.visible = vis; G.itemRoot.visible = true;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromCubemap(rt.texture).texture; scene.environmentIntensity = 0.8;
  pm.dispose(); rt.dispose();
}

// desktop post chain: depth of field -> bloom -> tone map
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 1.2, aperture: 0.0006, maxblur: 0.0032 }); composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.34, 0.75, 0.92); composer.addPass(bloom);
// a cheap-lens, pushed-film look: grain, soft corners, fringing, muted colour, lifted blacks
const film = new ShaderPass({ uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time * 7.13) * 43758.5453); }
    void main(){ vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 c = vec3(texture2D(tDiffuse, vUv + d * r2 * 0.012).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - d * r2 * 0.012).b);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 0.8); c = c * vec3(1.03, 0.99, 0.93) + vec3(0.010, 0.011, 0.013);
      c *= 1.0 - r2 * 1.15;
      float g = h(gl_FragCoord.xy) + h(gl_FragCoord.xy * 0.5 + 3.0) - 1.0; c += g * (0.022 + 0.04 * sqrt(max(l, 0.0)));
      gl_FragColor = vec4(max(c, 0.0), 1.0); }` });
composer.addPass(film);
composer.addPass(new OutputPass());
if (params.has('nopost')) G.noPost = true;
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });

// ---------- menu / modes ----------
const $ = (id) => document.getElementById(id);
const menu = $('menu'), hud = $('hud'), vrBtn = $('vr');
function startDesktop() { G.audio.init(); G.mode = 'desktop'; menu.style.display = 'none'; hud.style.display = 'block'; rig.position.set(0, 0, 0.3); }
$('desk').onclick = startDesktop;
async function startVR() {
  G.audio.init();
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] });
    rig.position.set(0, 0, 0.3); rig.rotation.set(0, 0, 0); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
    await renderer.xr.setSession(session); G.mode = 'vr'; menu.style.display = 'none'; hud.style.display = 'none';
    session.addEventListener('end', () => { G.mode = 'menu'; menu.style.display = 'flex'; });
  } catch (e) { vrBtn.textContent = 'VR failed: ' + e.message; console.error(e); }
}
vrBtn.onclick = startVR;
if (navigator.xr?.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { vrBtn.disabled = !ok; vrBtn.textContent = ok ? 'Enter VR' : 'VR headset not detected'; }).catch(() => { vrBtn.textContent = 'VR unavailable'; });
else vrBtn.textContent = location.protocol === 'https:' || location.hostname === 'localhost' ? 'WebXR not supported in this browser' : 'VR needs HTTPS';

// ---------- loop ----------
function tick(dt) {
  G.t += dt;
  input.update(dt);
  updateItems(dt);
  const boil = cart.update(dt, G.t);
  game.update(dt, G.t);
  city.update(dt, G.t);
  life.update(dt, G.t);
  talk.update(dt);
  grit.update(dt, G.t);
  G.fx.update(dt);
  G.audio.update(boil, life.env);
}
let last = performance.now(), frames = 0, statT = 0;
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
  if (G.mode === 'menu' && !renderer.xr.isPresenting && !G.manualCam) { // attract camera from the street
    const a = G.t * 0.05; camera.position.set(2.9 + Math.sin(a) * 0.9, 1.75, -5.4 + Math.cos(a) * 0.4); rig.position.set(0, 0, 0); camera.lookAt(0, 1.35, -0.4);
  }
  if (!G.frozen) tick(dt);
  if (frames === 2) bakeEnv();
  frames++;
  if (renderer.xr.isPresenting || G.noPost) renderer.render(scene, camera);
  else { bokeh.uniforms.focus.value = G.mode === 'desktop' ? G.desk.focus : (G.focus || 6); film.uniforms.time.value = G.t % 100; composer.render(); }
  if (G.afterRender) { const f = G.afterRender; G.afterRender = null; f(); }
  if (G.mode === 'desktop') {
    $('hover').textContent = G.hoverText || '';
    statT -= dt; if (statT <= 0) { statT = 0.5; $('stat').textContent = G.hint; }
  }
}
renderer.setAnimationLoop(frame);

// debug / test hooks
G.debug = { Items, PH, film, tick, frame, input, composer, bokeh, bloom, bakeEnv, startDesktop, startVR, THREE };
window.G = G;
if (params.has('desktop')) startDesktop();
