// THE GARAGE: a drum kit in a small garage, for a headset or a screen. The page's start, its loop, the controllers, the keys, the guide.
import * as THREE from 'three';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Sound } from './sound.js';
import { buildKit, SEAT, EYES, FEET } from './kit.js';
import { Sticks, TIP, speedToVel } from './sticks.js';
import { loadAssets, kitTextures } from './assets.js';
import { buildGarage } from './garage.js';
import { GripHand, Body } from './hands.js';
import { startLife } from './life.js';
import { buildGun, RACK, BOX } from './gun.js';
import { buildTeach } from './teach.js';
import { installAir } from '../sushi/air.js';
import { ROOM } from './garage.js';

installAir(); // THE MARKET's haze and ground mist, in every material, before any is drawn

const Q = new URLSearchParams(location.search), LOW = Q.has('low');
const $ = (id) => document.getElementById(id);
const LINES = +Q.get('lines') || 360; // a screen is drawn this many lines tall and stretched soft, as an old console on a tube was
const SAVE = 'drums1';
const set = Object.assign({ tilt: 0, height: 0, lead: 0, bpm: 100, body: 0 }, (() => { try { return JSON.parse(localStorage.getItem(SAVE)) || {}; } catch (e) { return {}; } })());
const keep = () => { try { localStorage.setItem(SAVE, JSON.stringify(set)); } catch (e) { /* private window */ } };

const canvas = $('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true;
renderer.xr.setFramebufferScaleFactor(0.7); // small eyes: the same look in the headset, and the frame never late
renderer.xr.setFoveation(1);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb7c6d2);
const camera = new THREE.PerspectiveCamera(72, 1, 0.03, 900);
const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);
let composer = null;
const size = () => {
  if (renderer.xr.isPresenting) return;
  const h = LINES, w = Math.max(64, Math.round(h * innerWidth / innerHeight));
  renderer.setSize(w, h, false);
  if (composer) composer.setSize(w, h);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
addEventListener('resize', size);
size();

const sound = new Sound();
const stats = { hits: 0, frames: 0, slow: 0 };
const D = (window.__drums = { renderer, scene, camera, rig, sound, stats, set, mode: 'menu', ready: false });

// ---------- the guide: a name on each piece until you have played it, and one card of the controls ----------
const KEYS = { kick: 'SPACE', snare: 'S', hat: 'A', tom1: 'D', tom2: 'F', floor: 'G', crash1: 'W', crash2: 'T', ride: 'E' };
const NAMES = { kick: 'KICK', snare: 'SNARE', hat: 'HI-HAT', tom1: 'TOM 1', tom2: 'TOM 2', floor: 'FLOOR TOM', crash1: 'CRASH', crash2: 'CRASH 2', ride: 'RIDE' };
function label(text, sub) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(8,8,10,.78)'; g.fillRect(0, 0, 256, 96);
  g.fillStyle = '#f2efe6'; g.textAlign = 'center'; g.font = '700 38px system-ui,sans-serif'; g.fillText(text, 128, sub ? 44 : 60);
  if (sub) { g.fillStyle = '#ffb347'; g.font = '600 28px system-ui,sans-serif'; g.fillText(sub, 128, 82); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, fog: false, toneMapped: false }));
  s.scale.set(0.15, 0.056, 1);
  s.renderOrder = 20;
  return s;
}
const guide = { labels: {}, card: null, on: true };
function card(lines, w = 0.86) {
  const c = document.createElement('canvas');
  c.width = 768; c.height = 44 + lines.length * 46;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(8,8,10,.82)'; g.fillRect(0, 0, c.width, c.height);
  g.font = '700 30px system-ui,sans-serif';
  const col = Math.max(300, ...lines.map(([a, b]) => b ? g.measureText(a).width + 52 : 0));
  lines.forEach(([a, b], i) => {
    const y = 58 + i * 46;
    g.font = '700 30px system-ui,sans-serif'; g.textAlign = 'left'; g.fillStyle = '#ffb347'; g.fillText(a, 28, y);
    g.font = '500 30px system-ui,sans-serif'; g.fillStyle = '#f2efe6'; g.fillText(b, col, y, c.width - col - 16);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * c.height / c.width), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, fog: false, toneMapped: false }));
  m.renderOrder = 19;
  return m;
}
const VR_GUIDE = [['RIGHT TRIGGER', 'kick drum'], ['LEFT TRIGGER', 'open the hi-hat'], ['GRIP ON A CYMBAL', 'choke it'], ['RIGHT STICK  ↕', 'stick angle'], ['RIGHT GRIP + STICK  ↕', 'body forward / back'], ['LEFT STICK  ↕', 'seat height'],
  ['LEFT STICK  ↔', 'timing: earlier / later'], ['RIGHT STICK  ↔ / CLICK', 'metronome tempo / on-off'], ['LEFT STICK  CLICK', 'garage door up / down'], ['HOLD A', 'talk to a neighbour'], ['X', 'stand up / sit down at the stool'], ['ON YOUR FEET', 'left stick walks, right stick turns'], ['YOUR FEET, or a pedal', 'the kick (and hi-hat) where the headset sees them'], ['BOTH TRIGGERS, 3 s', 'send a picture of what you see'], ['RIGHT GRIP + STICK  ↔', 'television: volume, off at nothing'], ['Y', 'lessons (left stick ↔ picks one)'], ['B', 'hide this guide']];

// a small readout that shows only while a setting is being changed
const readout = (() => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const g = c.getContext('2d'), t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.094), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, fog: false, toneMapped: false }));
  m.renderOrder = 21; m.visible = false;
  let until = 0, last = '';
  return {
    mesh: m,
    show(text, now) {
      until = now + 1.6;
      if (text !== last) { last = text; g.clearRect(0, 0, 512, 96); g.fillStyle = 'rgba(8,8,10,.82)'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#f2efe6'; g.font = '700 40px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(text, 256, 62); t.needsUpdate = true; }
      const el = $('readout'); if (el) { el.textContent = text; el.hidden = false; }
    },
    tick(now) { m.visible = now < until && renderer.xr.isPresenting; const el = $('readout'); if (el && now >= until) el.hidden = true; },
  };
})();

// ---------- build ----------
const head = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
let kit, sticks, garage, body, hands, metro, life, gun, teach;
// on your feet: where they are and which way you face (a screen); in a headset the rig is moved under you
const walk = { on: false, pos: new THREE.Vector3(0, 0, 0.5), bob: 0 };
const mkHand = () => ({ pos: new THREE.Vector3(), quat: new THREE.Quaternion(), grip: false, gripDown: false, gripUp: false, trigDown: false });
const ginp = { vr: false, R: mkHand(), L: mkHand(), head, feet: new THREE.Vector3(), screen: { fire: false, reload: false, pump: false, use: false } };
D.walk = walk; D.head = head;
const handMat = new THREE.MeshStandardMaterial({ color: 0xd9a984, roughness: 0.62 });
const seat = Object.assign(new THREE.Vector3(), { feet: [new THREE.Vector3(), new THREE.Vector3()] });

async function build() {
  const bar = $('bar'), prog = [0, 0], show = () => { bar.style.width = Math.round((prog[0] * 0.5 + prog[1] * 0.5) * 100) + '%'; };
  sound.start();
  const snd = sound.load((p) => { prog[1] = p; show(); }).catch((e) => { console.warn('no sound', e); });
  await loadAssets((p) => { prog[0] = p; show(); }, 2);
  const T = kitTextures(LOW);
  garage = buildGarage(scene, LOW);
  life = startLife({ scene, garage, sound, low: LOW, Q, readout, $ });
  D.life = life; D.street = life.street;
  kit = buildKit(T, LOW);
  scene.add(kit.group);
  sticks = new Sticks(kit, T);
  scene.add(sticks.left.obj, sticks.right.obj);
  hands = { left: new GripHand('left', handMat), right: new GripHand('right', handMat) };
  sticks.left.obj.add(hands.left.group); sticks.right.obj.add(hands.right.group);
  body = new Body(!LOW);
  scene.add(body.group);
  for (const p of kit.pieces) {
    const s = label(NAMES[p.name], KEYS[p.name]);
    s.position.copy(p.wc).add(new THREE.Vector3(0, p.name === 'kick' ? 0.36 : p.kind === 'cymbal' ? 0.12 : 0.1, p.name === 'kick' ? 0.25 : 0));
    scene.add(s);
    guide.labels[p.name] = s;
  }
  guide.card = card(VR_GUIDE);
  guide.card.position.set(0.1, 1.72, -1.75);
  guide.card.rotation.x = 0.12;
  guide.card.visible = false;
  scene.add(guide.card);
  readout.mesh.position.set(0.1, 1.2, -1.2);
  scene.add(readout.mesh);
  sticks.lead = set.lead / 1000;
  sticks.onHit = onHit;
  sticks.onClick = (v) => { sound.click(v); for (const s of ['left', 'right']) { pulse(s, 0.4 + 0.6 * v, 10); rumble(s, 0.3 + 0.5 * v, 0.025); if (hands[s]) hands[s].kick = 0.6; } };
  // the room's own reflections, pictured once from where you sit
  const pm = new THREE.PMREMGenerator(renderer);
  kit.group.visible = false;
  for (const n in guide.labels) guide.labels[n].visible = false;
  const env = pm.fromScene(scene, 0.02, 0.1, 60, { position: EYES });
  kit.group.visible = true;
  scene.environment = env.texture;
  scene.environmentIntensity = 0.22;
  // metal is what it mirrors: the kit's chrome and bronze are given the room itself to reflect, at full strength
  for (const k of ['chrome', 'brass']) { kit.M[k].envMap = env.texture; kit.M[k].envMapIntensity = k === 'chrome' ? 1.5 : 0.9; kit.M[k].needsUpdate = true; }
  pm.dispose();
  // a screen's finish: light that blooms off the panes and the sunlit slab, darker corners of the picture, a little grain
  if (!LOW) {
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }));
    composer.setPixelRatio(1);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.1, 0.35, 5));
    composer.addPass(new OutputPass());
    D.film = new ShaderPass({ uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
        void main(){ vec4 c = texture2D(tDiffuse, vUv); float v = smoothstep(0.9, 0.3, length(vUv - 0.5)); c.rgb *= mix(0.7, 1.0, v);
          c.rgb = mix(c.rgb, c.rgb * c.rgb * (3.0 - 2.0 * c.rgb), 0.3);
          float n = fract(sin(dot(gl_FragCoord.xy + time * 61.0, vec2(12.9898, 78.233))) * 43758.5453); c.rgb += (n - 0.5) * 0.03; gl_FragColor = c; }` });
    composer.addPass(D.film);
    size();
  }
  gun = buildGun(scene, garage, life.street, sound, kit, T, { readout: (t) => readout.show(t, clock.elapsedTime), pulse, kit: (n, v, z, r) => onHit(n, v, z, r, 0, 0, null) });
  D.gun = gun;
  teach = buildTeach(scene, kit, sound, set, keep); D.teach = teach;
  if (set.tv !== undefined) garage.tv.vol = set.tv;
  guide.gun = card([['THE SHOTGUN', ''], ['RIGHT GRIP', 'take it; let go here to hang it up'], ['LEFT GRIP at the box', 'shells onto your belt'], ['LEFT GRIP at your hip', 'a shell in your hand'], ['PUSH IT IN under the gun', 'loads the tube (five)'], ['LEFT GRIP on the fore-end', 'pull back, push forward: pump'], ['RIGHT TRIGGER', 'fire']], 0.8);
  guide.gun.position.set(RACK.x, 2.12, ROOM.z1 - 0.03); guide.gun.rotation.y = Math.PI; scene.add(guide.gun);
  D.kit = kit; D.sticks = sticks; D.garage = garage; D.body = body; D.hands = hands; D.guide = guide;
  placeRig();
  garage.sun.shadow.needsUpdate = true;
  await snd;
  SEAT_HELP = $('help').innerHTML;
  $('load').hidden = true; $('go').hidden = false;
  D.ready = true;
}

// ---------- a hit ----------
const lastHand = { left: -1, right: -1 };
function pulse(side, v, ms) { xr.src[side]?.gamepad?.hapticActuators?.[0]?.pulse?.(Math.min(1, v), ms); }
// what a hit feels like after its first knock: a drum's short thud, a cymbal's long shiver, dying away in the hand
const buzz = { left: 0, right: 0 }, fade = { left: 0.05, right: 0.05 };
function rumble(side, amp, tau) { if (amp > buzz[side]) { buzz[side] = Math.min(1, amp); fade[side] = tau; } }
function feel(dt) { for (const s of ['left', 'right']) { if (buzz[s] > 0.03) { pulse(s, buzz[s], dt * 1000 + 6); buzz[s] *= Math.exp(-dt / fade[s]); } else buzz[s] = 0; } }
const shake = { v: 0 };
function onHit(piece, vel, zone, r, lx, lz, side) {
  sound.hit(piece, vel, zone, r);
  kit.strike(piece, vel, lx, lz);
  stats.hits++;
  stats.last = { piece, vel, zone, r, side };
  const cym = kit.P[piece]?.kind === 'cymbal';
  if (side) {
    pulse(side, 0.3 + 0.7 * vel, 8 + vel * 14);
    rumble(side, cym ? 0.2 + 0.6 * vel : zone === 'rimshot' || zone === 'rim' || zone === 'cross' ? 0.5 + 0.4 * vel : 0.15 + 0.4 * vel, cym ? (piece === 'hat' ? 0.05 + 0.08 * sound.hat : 0.14) : 0.03);
    if (hands[side]) hands[side].kick = 1;
  }
  life.note(vel);
  teach.hit(piece, vel, side);
  if (vel > 0.5) garage.jolt((vel - 0.5) * (cym ? 0.5 : 1));
  shake.v = Math.max(shake.v, vel * (piece === 'kick' ? 1 : 0.4));
  const l = guide.labels[piece];
  if (l) l.played = true;
}
function kick(vel) { onHit('kick', vel, 'head', 0, 0, 0, null); rumble('right', 0.35 + 0.45 * vel, 0.06); rumble('left', 0.15 + 0.25 * vel, 0.05); }

// ---------- your feet, where the headset reports a body: the right foot's tap is the kick, the left foot lifted opens the hi-hat ----------
const feet = { seen: false, key: false, r: { y: 0, v: 0, low: 0, armed: true }, l: { y: 0, base: null }, told: false };
function readFeet(dt, now) {
  const frame = renderer.xr.getFrame && renderer.xr.getFrame(), ref = renderer.xr.getReferenceSpace(), body = frame && frame.body;
  if (!body || !ref || walk.on) return;
  const y = (name) => { const sp = body.get && body.get(name); if (!sp) return null; const p = frame.getPose(sp, ref); return p ? p.transform.position.y : null; };
  const ry = y('right-foot-ball') ?? y('right-foot-ankle'), ly = y('left-foot-ball') ?? y('left-foot-ankle');
  if (ry == null) return;
  if (!feet.told) { feet.told = true; readout.show('FEET SEEN: TAP YOUR RIGHT FOOT FOR THE KICK', now); }
  feet.seen = true;
  const R = feet.r, v = (ry - R.y) / Math.max(dt, 0.004); R.y = ry; R.v += (v - R.v) * 0.6;
  if (R.v < -0.25) R.low = Math.max(R.low, -R.v);
  // the foot coming down and stopping is the beater on the head; it must lift again before the next
  if (R.armed && R.low > 0.25 && R.v > -0.05) { R.armed = false; kick(Math.min(1, 0.25 + R.low / 2.2)); R.low = 0; }
  if (R.v > 0.2) { R.armed = true; R.low = 0; }
  if (ly != null && !feet.key && !ginp.L.grip) { const Lf = feet.l; Lf.base = Lf.base == null ? ly : Math.min(Lf.base + dt * 0.002, ly); const open = Math.min(1, Math.max(0, (ly - Lf.base - 0.015) / 0.05)); if ((xr.prev.left.trig || 0) < 0.05) { sound.setHat(open, 6); kit.setHat(open); } }
}

// ---------- a picture of what you see, sent to the owners' queue (both triggers held three seconds; P on a screen) ----------
const snapper = { hold: 0, sent: false, busy: false };
function snap() { // one more look from your eyes into a picture: the headset's own picture cannot be read back
  const W = 960, H = 600, rt = new THREE.WebGLRenderTarget(W, H), cam = new THREE.PerspectiveCamera(88, W / H, 0.03, 70), x = renderer.xr, was = x.enabled, keepT = renderer.getRenderTarget();
  rt.texture.colorSpace = THREE.SRGBColorSpace; cam.position.copy(head.pos); cam.quaternion.copy(head.quat); cam.updateMatrixWorld(true);
  const buf = new Uint8Array(W * H * 4); x.enabled = false;
  try { renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.readRenderTargetPixels(rt, 0, 0, W, H, buf); } finally { renderer.setRenderTarget(keepT); x.enabled = was; rt.dispose(); }
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
  for (let y = 0; y < H; y++) im.data.set(buf.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  g.putImageData(im, 0, 0); return c.toDataURL('image/jpeg', 0.72);
}
async function sendPicture(now) {
  if (snapper.busy) return; snapper.busy = true; readout.show('PICTURE TAKEN, SENDING', now);
  const jpg = snap(), ctx = { game: 'drums', mode: D.mode, hour: +life.hour.toFixed(1), door: +garage.door.open.toFixed(2), set, hits: stats.hits, last: stats.last || null, slow: Math.round(stats.slow), lamp: lampOn, lean: !!garage.lean, latency: +sound.latency.toFixed(3), near: life.street.nearest()?.id || '', ua: navigator.userAgent.slice(0, 160) };
  D.lastShot = jpg.length;
  try { const r = await fetch('/sushi/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jpg, context: ctx }) }), j = r.ok ? await r.json() : null;
    readout.show(j && j.ok ? 'PICTURE SENT' : r.status === 401 ? 'SIGN IN TO SEND A PICTURE' : 'PICTURE NOT SENT', clock.elapsedTime); } catch (e) { readout.show('PICTURE NOT SENT', clock.elapsedTime); }
  snapper.busy = false;
}

const WALK_HELP = '<b>W A S D</b> walk · <b>DRAG</b> look · <b>E</b> take the shotgun, the shells, the television · <b>R</b> load a shell · <b>F</b> pump · <b>CLICK</b> fire · <b>O</b> door · <b>ENTER</b> talk · <b>TAB</b> sit at the stool';
let SEAT_HELP = '';
// ---------- on your feet: what stops you, standing up and sitting down ----------
const BODY_R = 0.28;
function blocked(x, z) {
  if (Math.abs(x) > 62 || z < ROOM.z0 - 24.3 || z > 8 || (x > ROOM.x1 + 0.3 && z > 1.5)) return true;
  const hit = (b) => x > b[0] - BODY_R && x < b[2] + BODY_R && z > b[1] - BODY_R && z < b[3] + BODY_R;
  for (const b of garage.solids) if (hit(b)) return true;
  for (const b of life.street.solids) if (hit(b)) return true;
  return garage.door.open < 0.85 && hit(garage.doorGap);
}
// a step from (x, z): each way tried on its own, so a wall is slid along
function step(x, z, dx, dz) { if (blocked(x, z)) return [dx, dz]; if (blocked(x + dx, z)) dx = 0; if (blocked(x + dx, z + dz)) dz = 0; return [dx, dz]; }
function stand(now) {
  if (walk.on) return;
  walk.on = true; sound.setHat(0); kit.setHat(0); kit.setPedal(0);
  if (renderer.xr.isPresenting) { const c = camera, y = _a.copy(c.getWorldPosition(_a)).y - rig.position.y; rig.position.y = y < 1.35 ? 1.62 - y : 0; rig.position.x += SEAT.x - _a.x; rig.position.z += SEAT.z + 0.45 - _a.z; }
  else { walk.pos.set(SEAT.x, 0, SEAT.z + 0.45); scr.pitch = 0; }
  readout.show('ON YOUR FEET', now);
}
function sit(now) {
  if (!walk.on) return;
  if (Math.hypot(head.pos.x - SEAT.x, head.pos.z - SEAT.z) > 1.5) { readout.show('GO TO THE STOOL TO SIT', now); return; }
  walk.on = false; if (gun.held) { gun.held = false; gun.where = 'rack'; }
  scr.yaw = 0; scr.pitch = -0.42; placeRig(); readout.show('SEATED', now);
}
D.stand = stand; D.sit = sit;

// ---------- where you sit ----------
function placeRig() {
  // the headset's own position inside the rig is taken out, so your eyes are where the drummer's are whatever your chair
  if (renderer.xr.isPresenting) {
    const c = renderer.xr.getCamera(), p = new THREE.Vector3(), q = new THREE.Quaternion();
    rig.position.set(0, 0, 0); rig.rotation.set(0, 0, 0); rig.updateMatrixWorld(true);
    c.getWorldPosition(p); c.getWorldQuaternion(q);
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(q), yaw = Math.atan2(-f.x, -f.z);
    rig.rotation.y = -yaw;
    p.applyAxisAngle(new THREE.Vector3(0, 1, 0), -yaw);
    rig.position.set(EYES.x - p.x, EYES.y + set.height - p.y, EYES.z - p.z);
  } else {
    rig.rotation.set(0, 0, 0);
    rig.position.set(0, 0, 0);
    camera.position.copy(EYES);
  }
  rig.updateMatrixWorld(true);
}

// ---------- the headset ----------
const xr = { src: {}, slots: [], prev: { left: {}, right: {} }, hold: 0, seated: 0 };
const handFactory = new XRHandModelFactory(null, (o) => o.traverse((m) => { if (m.isMesh) { m.material = handMat; m.castShadow = true; } }));
handFactory.setPath('/jam-assets/');
for (let i = 0; i < 2; i++) {
  const grip = renderer.xr.getControllerGrip(i), hand = renderer.xr.getHand(i), slot = { grip, hand, source: null };
  grip.addEventListener('connected', (e) => { slot.source = e.data; });
  grip.addEventListener('disconnected', () => { slot.source = null; });
  hand.add(handFactory.createHandModel(hand, 'mesh'));
  rig.add(grip, hand);
  xr.slots.push(slot);
}
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _t = new THREE.Quaternion(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _m = new THREE.Matrix4();
const AX = new THREE.Vector3(1, 0, 0), UP = new THREE.Vector3(0, 1, 0);

function vrInput(dt, now) {
  xr.src = {};
  let any = { left: false, right: false };
  for (const slot of xr.slots) {
    const src = slot.source;
    if (!src || (src.handedness !== 'left' && src.handedness !== 'right')) continue;
    const side = src.handedness;
    xr.src[side] = src;
    if (src.hand) {
      // bare hands: a stick laid from the heel of the hand out through thumb and forefinger (controllers are truer)
      const j = slot.hand.joints, a = j['index-finger-phalanx-intermediate'], b = j['thumb-tip'], c = j['pinky-finger-metacarpal'], w = j.wrist;
      if (!a || !b || !c || !w || !w.visible) continue;
      a.getWorldPosition(_a); b.getWorldPosition(_b); c.getWorldPosition(_c);
      _a.add(_b).multiplyScalar(0.5);
      _b.copy(_a).sub(_c).normalize();
      _m.lookAt(_c, _a, _p.set(0, 1, 0).applyQuaternion(w.getWorldQuaternion(_q)));
      _q.setFromRotationMatrix(_m);
      sticks.set(side, _a.addScaledVector(_b, -0.05), _q, true);
      hands[side].group.visible = false;
      any[side] = true;
      continue;
    }
    if (!slot.grip.visible) continue;
    slot.grip.getWorldPosition(_p);
    slot.grip.getWorldQuaternion(_q);
    const I = side === 'right' ? ginp.R : ginp.L; I.pos.copy(_p); I.quat.copy(_q);
    _q.multiply(_t.setFromAxisAngle(AX, set.tilt));
    const free = !gun.held && !gun.shell;
    sticks.set(side, _p, _q, free);
    hands[side].group.visible = free;
    any[side] = true;
    const g = src.gamepad, B = g?.buttons || [], A = g?.axes || [], P = xr.prev[side];
    const trig = B[0]?.value || 0, sq = B[1]?.value || 0, sx = A[2] || 0, sy = A[3] || 0, a = !!B[4]?.pressed, b = !!B[5]?.pressed, th = !!B[3]?.pressed;
    I.grip = sq > 0.5; I.gripDown = sq > 0.6 && !P.sq; I.gripUp = sq < 0.4 && !!P.sq; P.sq = sq > 0.6 ? true : sq < 0.4 ? false : P.sq;
    I.trigDown = trig > 0.5 && !P.td; P.td = trig > 0.5 ? true : trig < 0.3 ? false : P.td;
    if (I.gripDown && !gun.held && _p.distanceTo(garage.tv.at) < 0.35) garage.tvToggle();
    if (walk.on) {
      // on your feet: the left stick walks you the way you face, the right turns you a step at a time
      if (side === 'left' && (Math.abs(sx) > 0.15 || Math.abs(sy) > 0.15)) { const yaw = Math.atan2(-_b.set(0, 0, -1).applyQuaternion(head.quat).x, -_b.z), c = Math.cos(yaw), n = Math.sin(yaw), v = 2.4 * dt;
        const [mx, mz] = step(head.pos.x, head.pos.z, (sx * c + sy * n) * v, (sy * c - sx * n) * v); rig.position.x += mx; rig.position.z += mz; }
      if (side === 'right') { if (Math.abs(sx) > 0.7 && !P.turn) { P.turn = true; const a = -Math.sign(sx) * Math.PI / 6; _a.copy(head.pos).sub(rig.position).applyAxisAngle(UP, a); rig.rotation.y += a; rig.position.x = head.pos.x - _a.x; rig.position.z = head.pos.z - _a.z; } if (Math.abs(sx) < 0.3) P.turn = false; }
    } else if (side === 'right') {
      // the kick: sounds as the trigger passes a third of its pull, as hard as it was pulled
      if (gun.held) P.down = true;
      kit.setPedal(gun.held ? 0 : trig);
      if (trig > 0.33 && !P.down) { P.down = true; kick(Math.min(1, Math.max(0.2, Math.pow(Math.max(0, (trig - (P.trig || 0)) / Math.max(dt, 0.004) - 2) / 34, 0.7)))); }
      if (trig < 0.2) P.down = false;
      // with the grip held, the same stick slides your body forward or back under your head
      if (sq > 0.6 && Math.abs(sy) > 0.5) { set.body = Math.max(-0.3, Math.min(0.3, set.body + sy * dt * 0.15)); readout.show('BODY ' + (set.body > 0 ? 'BACK ' : 'FORWARD ') + Math.abs(Math.round(set.body * 100)) + ' cm', now); keep(); }
      else if (Math.abs(sy) > 0.5) { set.tilt = Math.max(-0.9, Math.min(0.9, set.tilt - sy * dt * 0.5)); readout.show('STICK ANGLE ' + Math.round(set.tilt * 57.3) + '°', now); keep(); }
      if (sq > 0.6 && Math.abs(sx) > 0.6 && Math.abs(sy) < 0.4) { set.tv = garage.tvVol(sx * dt * 0.5); readout.show(set.tv > 0.01 ? 'TELEVISION ' + Math.round(set.tv * 100) + '%' : 'TELEVISION OFF', now); keep(); }
      else if (Math.abs(sx) > 0.6 && Math.abs(sy) < 0.4) { set.bpm = Math.max(40, Math.min(240, set.bpm + sx * dt * 30)); readout.show('TEMPO ' + Math.round(set.bpm), now); keep(); }
      if (th && !P.th) toggleMetro(now);
    } else {
      // the hi-hat: the trigger lifts the top cymbal; letting go shuts it with the pedal's chick
      const rate = ((P.trig || 0) - trig) / Math.max(dt, 0.004);
      if ((P.trig || 0) > 0.12 && trig <= 0.12) rumble('left', 0.3, 0.03);
      if (!(feet.seen && trig < 0.05) && !feet.key) { sound.setHat(trig, rate); kit.setHat(trig); }
      if (Math.abs(sy) > 0.5 && Math.abs(sx) < 0.4) { set.height = Math.max(-0.4, Math.min(0.4, set.height - sy * dt * 0.2)); placeRig(); readout.show('SEAT ' + (set.height >= 0 ? '+' : '') + Math.round(set.height * 100) + ' cm', now); keep(); }
      if (teach.on) { if (Math.abs(sx) > 0.7 && !P.step) { P.step = true; teach.go(Math.sign(sx)); } if (Math.abs(sx) < 0.3) P.step = false; }
      else if (Math.abs(sx) > 0.6 && Math.abs(sy) < 0.4) { set.lead = Math.max(0, Math.min(80, set.lead + sx * dt * 25)); sticks.lead = set.lead / 1000; readout.show('HITS ' + Math.round(set.lead) + ' ms EARLY', now); keep(); }
    }
    if (side === 'left') { if (a && !P.a) { if (walk.on) sit(now); else stand(now); } if (th && !P.th) { garage.toggleDoor(); readout.show(garage.door.want > 0.5 ? 'DOOR UP' : 'DOOR DOWN', now); } }
    else if (a !== !!P.a) life.listen(a);
    P.a = a;
    if (b && !P.b) { if (side === 'left') { teach.start(); readout.show(teach.on ? 'LESSONS' : 'LESSONS OFF', now); } else guide.on = !guide.on; }
    // a cymbal held is a cymbal stopped
    if (sq > 0.6) for (const p of kit.pieces) if (p.kind === 'cymbal') {
      _a.copy(_p).applyMatrix4(p.inv);
      const rho = Math.hypot(_a.x, _a.z);
      if (Math.abs(rho - p.radius) < 0.11 && Math.abs(_a.y) < 0.09) { p.grab = 1; if (!P.choke) { sound.choke(p.name, 0.05); rumble(side, 0.45, 0.05); } P.choke = true; }
    }
    if (sq < 0.4) P.choke = false;
    P.trig = trig; P.th = th; P.b = b;
  }
  for (const s of ['left', 'right']) if (!any[s]) sticks.set(s, _p, _q, false);
  ginp.vr = true;
  // both triggers held three seconds: a picture of what you see goes to the owners
  if ((xr.prev.left.trig || 0) > 0.8 && (xr.prev.right.trig || 0) > 0.8) { snapper.hold += dt; if (snapper.hold > 0.4 && !snapper.sent) readout.show('PICTURE IN ' + Math.max(1, Math.ceil(3 - snapper.hold)), now); if (snapper.hold >= 3 && !snapper.sent) { snapper.sent = true; sendPicture(now); } } else { snapper.hold = 0; snapper.sent = false; }
}

// ---------- a screen: keys and the mouse ----------
const scr = { yaw: 0, pitch: -0.42, keys: new Set(), st: { left: null, right: null }, hatOpen: false };
D.scr = scr;
const ANCHOR = { left: new THREE.Vector3(-0.3, 0.98, 0.02), right: new THREE.Vector3(0.3, 0.98, 0.02) };
const HAND_OF = { hat: 'right', ride: 'right', crash2: 'right', floor: 'right', tom2: 'right', snare: 'left', crash1: 'left', tom1: 'left' };
const KEYMAP = { KeyS: ['snare', 'head', 0.3], KeyX: ['snare', 'cross', 1], KeyC: ['snare', 'rimshot', 0.35], KeyA: ['hat', 'bow', 0.6], KeyD: ['tom1', 'head', 0.3], KeyF: ['tom2', 'head', 0.3], KeyG: ['floor', 'head', 0.3],
  KeyW: ['crash1', 'edge', 0.9], KeyT: ['crash2', 'edge', 0.9], KeyE: ['ride', 'bow', 0.55], KeyR: ['ride', 'bell', 0.1] };
function strokeAt(piece, world, side, vel, now) {
  if (!side) { side = HAND_OF[piece] || 'right'; const o = side === 'left' ? 'right' : 'left'; if (now - lastHand[side] < 0.12 && now - lastHand[o] > 0.06) side = o; }
  lastHand[side] = now;
  scr.st[side] = { piece, at: world.clone(), n: kit.P[piece].wn.clone(), t: now, vel };
  return side;
}
function playKey(code, now) {
  const k = KEYMAP[code];
  if (!k) return false;
  const [piece, zone, r] = k, p = kit.P[piece], vel = (scr.keys.has('ShiftLeft') || scr.keys.has('ShiftRight') ? 1 : scr.keys.has('KeyV') ? 0.22 : 0.68) * (0.94 + Math.random() * 0.12);
  const lz = r * p.radius, w = new THREE.Vector3(0, kit.height(p, lz), lz).applyMatrix4((piece === 'hat' ? p.top : p.group).matrixWorld);
  const side = strokeAt(piece, w, null, vel, now);
  onHit(piece, Math.min(1, vel), zone, r, 0, lz, side);
  return true;
}
addEventListener('keydown', (e) => {
  if (D.mode === 'vr' && !walk.on && !e.repeat) { if (e.code === 'Space' || e.code === 'KeyB' || e.code === 'PageDown') { kick(0.75); e.preventDefault(); } else if (e.code === 'KeyV' || e.code === 'PageUp') { sound.setHat(1); kit.setHat(1); feet.key = true; } return; }
  if (D.mode !== 'screen') return;
  if (e.target === $('say')) { if (e.code === 'Enter') { life.say($('say').value); $('say').value = ''; $('say').blur(); $('say').hidden = true; } else if (e.code === 'Escape') { $('say').blur(); $('say').hidden = true; } return; }
  if (e.code === 'Tab') { e.preventDefault(); if (!e.repeat) { if (walk.on) sit(clock.elapsedTime); else stand(clock.elapsedTime); } return; }
  if (walk.on) { scr.keys.add(e.code); if (!e.repeat) { if (e.code === 'KeyE') ginp.screen.use = true; else if (e.code === 'KeyR') ginp.screen.reload = true; else if (e.code === 'KeyF') ginp.screen.pump = true; else if (e.code === 'KeyO') garage.toggleDoor(); else if (e.code === 'KeyN') life.skip(); else if (e.code === 'KeyP') sendPicture(clock.elapsedTime); else if (e.code === 'KeyH') guide.on = !guide.on; else if (e.code === 'Enter') { const b = $('say'); b.hidden = false; b.focus(); e.preventDefault(); } } if (/^(Space|Arrow)/.test(e.code)) e.preventDefault(); return; }
  if (e.repeat) { if (KEYMAP[e.code] || e.code === 'Space') e.preventDefault(); return; }
  scr.keys.add(e.code);
  const now = performance.now() / 1000;
  if (e.code === 'Space') { kick(e.shiftKey ? 1 : 0.7); e.preventDefault(); }
  else if (e.code === 'KeyQ') { sound.setHat(1); kit.setHat(1); }
  else if (e.code === 'KeyH') guide.on = !guide.on;
  else if (e.code === 'KeyO') { garage.toggleDoor(); readout.show(garage.door.want > 0.5 ? 'DOOR UP' : 'DOOR DOWN', now); }
  else if (e.code === 'KeyN') life.skip();
  else if (e.code === 'KeyL') { teach.start(); readout.show(teach.on ? 'LESSONS' : 'LESSONS OFF', now); }
  else if (e.code === 'Comma' || e.code === 'Period') teach.go(e.code === 'Comma' ? -1 : 1);
  else if (e.code === 'Minus' || e.code === 'Equal') { set.tv = garage.tvVol(e.code === 'Minus' ? -0.1 : 0.1); readout.show(set.tv > 0.01 ? 'TELEVISION ' + Math.round(set.tv * 100) + '%' : 'TELEVISION OFF', now); keep(); }
  else if (e.code === 'KeyK') { garage.tvToggle(); readout.show(garage.tv.on ? 'TELEVISION ON' : 'TELEVISION OFF', now); }
  else if (e.code === 'KeyP') sendPicture(now);
  else if (e.code === 'Enter') { const b = $('say'); b.hidden = false; b.focus(); e.preventDefault(); }
  else if (e.code === 'KeyM') toggleMetro(now);
  else if (e.code === 'BracketLeft' || e.code === 'BracketRight') { set.bpm = Math.max(40, Math.min(240, set.bpm + (e.code === 'BracketLeft' ? -4 : 4))); readout.show('TEMPO ' + set.bpm, now); keep(); }
  else if (playKey(e.code, now)) e.preventDefault();
});
addEventListener('keyup', (e) => { if (D.mode === 'vr' && feet.key && (e.code === 'KeyV' || e.code === 'PageUp')) { feet.key = false; sound.setHat(0, 6); kit.setHat(0); } scr.keys.delete(e.code); if (e.code === 'KeyQ' && D.mode === 'screen') { sound.setHat(0, 6); kit.setHat(0); } });
addEventListener('blur', () => scr.keys.clear());
let drag = null;
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; });
addEventListener('pointermove', (e) => {
  if (!drag || D.mode !== 'screen') return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
  scr.yaw = walk.on ? scr.yaw - dx * 0.004 : Math.max(-1.6, Math.min(1.6, scr.yaw - dx * 0.004)); scr.pitch = Math.max(-1.3, Math.min(0.9, scr.pitch - dy * 0.004));
});
// a click on the kit strikes it exactly there
const ray = new THREE.Raycaster(), nd = new THREE.Vector2();
addEventListener('pointerup', (e) => {
  const d = drag; drag = null;
  if (!d || d.moved > 6 || D.mode !== 'screen' || !kit) return;
  if (walk.on) { if (gun.held) ginp.screen.fire = true; return; }
  nd.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(nd, camera);
  let best = null;
  for (const p of kit.pieces) {
    _a.copy(ray.ray.origin).applyMatrix4(p.inv); _b.copy(ray.ray.direction).transformDirection(p.inv);
    if (_b.y >= -1e-4) continue;
    // the first place along the click's line that is under the surface: stepped from above the piece's highest point down to its rim's plane, then closed in on
    const t0 = -(_a.y - 0.045) / _b.y, t1 = -_a.y / _b.y, f = (tt) => { _c.copy(_a).addScaledVector(_b, tt); return _c.y - kit.height(p, Math.hypot(_c.x, _c.z)); };
    let lo = t0, hi = t1, found = false;
    for (let i = 1; i <= 24; i++) { const tt = t0 + (t1 - t0) * i / 24; if (f(tt) <= 0) { hi = tt; found = true; break; } lo = tt; }
    if (!found) continue;
    for (let i = 0; i < 8; i++) { const m = (lo + hi) / 2; if (f(m) <= 0) hi = m; else lo = m; }
    const t = hi; f(t);
    const rho = Math.hypot(_c.x, _c.z);
    if (t > 0 && rho <= p.radius + (p.kind === 'drum' ? 0.02 : 0) && (!best || t < best.t)) best = { p, t, pt: _c.clone(), rho };
  }
  if (!best) return;
  const { p, pt, rho } = best, u = rho / p.radius, now = performance.now() / 1000, vel = e.shiftKey ? 1 : 0.7;
  if (p.name === 'kick') return kick(vel);
  const zone = p.kind === 'cymbal' ? (u < 0.24 ? 'bell' : u > 0.82 ? 'edge' : 'bow') : u > 1 ? 'rim' : 'head';
  const side = strokeAt(p.name, pt.clone().applyMatrix4((p.name === 'hat' ? p.top : p.group).matrixWorld), null, vel, now);
  onHit(p.name, vel, zone, Math.min(1, u), pt.x, pt.z, side);
});

// the drawn stroke on a screen: the tip is on the surface the instant the key goes down, comes up off it as a stick does, and waits above
const REST = { left: 'snare', right: 'floor' };
function screenSticks(now) {
  if (walk.on) { for (const side of ['left', 'right']) sticks.set(side, _p, _q, false); return; }
  for (const side of ['left', 'right']) {
    let s = scr.st[side];
    if (!s) { const p = kit.P[REST[side]], lz = p.radius * 0.4; s = scr.st[side] = { piece: p.name, at: new THREE.Vector3(0, kit.height(p, lz), lz).applyMatrix4((p.name === 'hat' ? p.top : p.group).matrixWorld), n: p.wn.clone(), t: -9, vel: 0.3 }; }
    const t = now - s.t, peak = 0.05 + 0.22 * s.vel, up = t < 0.11 ? peak * Math.sin(t / 0.11 * Math.PI / 2) : 0.07 + (peak - 0.07) * Math.exp(-(t - 0.11) * 7);
    const tip = _a.copy(s.at).addScaledVector(s.n, 0.006 + up);
    // the hand sits back toward the shoulder, above the surface, the stick sloping down to its tip
    const back = _b.copy(ANCHOR[side]).sub(s.at); back.y = 0; back.normalize();
    const hand = _c.copy(s.at).addScaledVector(back, TIP * 0.93).addScaledVector(UP, TIP * 0.3 + up * 0.35 + 0.02);
    _m.lookAt(hand, tip, UP);
    _q.setFromRotationMatrix(_m);
    _q.multiply(_t.setFromAxisAngle(_p.set(0, 0, 1), side === 'right' ? 0.9 : -0.9));
    hand.copy(tip).addScaledVector(_p.set(0, 0, 1).applyQuaternion(_q), TIP);
    sticks.set(side, hand, _q, true);
    hands[side].group.visible = true;
  }
}

// ---------- the metronome ----------
metro = { on: false, next: 0, beat: 0 };
function toggleMetro(now) { metro.on = !metro.on; metro.next = 0; metro.beat = 0; readout.show(metro.on ? 'METRONOME ' + Math.round(set.bpm) : 'METRONOME OFF', now); }
function metroTick() {
  if (!metro.on || !sound.ctx) return;
  const t = sound.ctx.currentTime;
  if (!metro.next) metro.next = t + 0.1;
  while (metro.next < t + 0.12) { sound.tick(metro.next, metro.beat % 4 === 0); metro.beat++; metro.next += 60 / set.bpm; }
}

// ---------- start ----------
async function enter(vr) {
  sound.start();
  garage.tvStart(sound);
  $('start').hidden = true;
  if (vr) {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'hand-tracking', 'body-tracking'] });
    renderer.xr.setReferenceSpaceType('local-floor');
    await renderer.xr.setSession(session);
    // the most frames the headset will give: every frame is a fresh reading of the sticks
    try { const r = session.supportedFrameRates; if (r && session.updateTargetFrameRate) await session.updateTargetFrameRate(Math.max(...r.filter((x) => x <= 90), ...(r.length ? [r[0]] : []))); } catch (e) { /* its own rate */ }
    D.mode = 'vr';
    xr.t0 = performance.now();
    guide.card.visible = true;
    session.addEventListener('end', () => { D.mode = 'screen'; walk.on = false; size(); placeRig(); $('help').hidden = false; });
  } else {
    D.mode = 'screen';
    $('help').hidden = false;
  }
}
$('vr').addEventListener('click', () => enter(true));
$('screen').addEventListener('click', () => enter(false));
if (navigator.xr?.isSessionSupported) navigator.xr.isSessionSupported('immersive-vr').then((ok) => { $('vr').disabled = !ok; if (!ok) $('vrnote').textContent = 'No headset found: open this page in a headset\'s browser for VR.'; }).catch(() => { });
else $('vrnote').textContent = 'No headset found: open this page in a headset\'s browser for VR.';

// ---------- the loop ----------
const clock = new THREE.Clock();
let seatedOnce = false, lampOn = true;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1), now = clock.elapsedTime;
  if (!D.ready) return;
  stats.frames++;
  const vr = renderer.xr.isPresenting;
  kit.update(dt);
  kit.updateWorld();
  if (vr) {
    if (!seatedOnce && performance.now() - xr.t0 > 600) { placeRig(); seatedOnce = true; }
    vrInput(dt, now);
    readFeet(dt, now);
    feel(dt);
  } else {
    // on a screen the kick is felt as a knock of the picture (never in a headset: the world must not move there)
    shake.v *= Math.exp(-dt * 14);
    if (walk.on) {
      // on your feet on a screen: W A S D or the arrows walk the way you look
      const K = scr.keys, fx = (K.has('KeyD') || K.has('ArrowRight') ? 1 : 0) - (K.has('KeyA') || K.has('ArrowLeft') ? 1 : 0), fz = (K.has('KeyS') || K.has('ArrowDown') ? 1 : 0) - (K.has('KeyW') || K.has('ArrowUp') ? 1 : 0);
      if (fx || fz) { const c = Math.cos(scr.yaw), n = Math.sin(scr.yaw), v = (K.has('ShiftLeft') ? 4.2 : 2.4) * dt / Math.hypot(fx, fz), [mx, mz] = step(walk.pos.x, walk.pos.z, (fx * c + fz * n) * v, (fz * c - fx * n) * v); walk.pos.x += mx; walk.pos.z += mz; walk.bob += dt * 9; }
      if (!D.free) { camera.rotation.set(scr.pitch, scr.yaw, 0, 'YXZ'); camera.position.set(walk.pos.x, 1.66 + 0.02 * Math.sin(walk.bob), walk.pos.z); }
    } else if (!D.free) { camera.rotation.set(scr.pitch + shake.v * 0.006 * Math.sin(now * 90), scr.yaw, 0, 'YXZ'); camera.position.set(EYES.x, EYES.y - shake.v * 0.004, EYES.z); }
    if (D.mode === 'screen' || D.mode === 'menu') screenSticks(now);
  }
  sticks.detect = vr;
  sticks.update(dt);
  if (!teach.on) metroTick();
  teach.update();
  // your body: seated, the arms ending at the hands on the sticks
  const cam = camera;   // (in the headset too: the page's own camera is the one that stands in the rig, so the head goes where the rig is walked)
  cam.getWorldPosition(head.pos); cam.getWorldQuaternion(head.quat);
  // your hips sit under your own neck, wherever your chair is, so the body is upright; set.body slides it forward or back
  seat.copy(SEAT); seat.y += 0.04;
  if (vr) { _a.set(0, 0, 0.04 + set.body).applyAxisAngle(UP, Math.atan2(-_b.set(0, 0, -1).applyQuaternion(head.quat).x, -_b.z)); seat.x = head.pos.x + _a.x; seat.z = head.pos.z + _a.z; }
  for (let k = 0; k < 2; k++) { seat.feet[k].copy(FEET[k]); seat.feet[k].y += kit.foot[k]; }
  ginp.vr = vr; ginp.feet.set(head.pos.x, 0, head.pos.z);
  gun.update(dt, now, ginp); ginp.screen.fire = ginp.screen.reload = ginp.screen.pump = ginp.screen.use = false;
  garage.ear.copy(head.pos);
  if ($('aim').hidden !== !(gun.held && !vr)) $('aim').hidden = !(gun.held && !vr);
  sticks.left.obj.updateMatrixWorld(true); sticks.right.obj.updateMatrixWorld(true);
  for (const s of ['left', 'right']) { const h = hands[s]; h.kick = Math.max(0, (h.kick || 0) - dt * 7); if (h.ready) { h.curl(h.kick); h.update(); } }
  if (body.ready && hands.left.ready && hands.right.ready) {
    if (!body.skinned) { handMat.color.copy(body.skin); body.skinned = true; }
    // the arms end at the hands on the sticks, or at the hands themselves when they hold something else, or hang at your sides
    const side = (sx) => { const yaw = Math.atan2(-_c.set(0, 0, -1).applyQuaternion(head.quat).x, -_c.z); return new THREE.Vector3(sx * 0.27, -0.78, -0.08).applyAxisAngle(UP, yaw).add(head.pos); };
    const wl = sticks.left.active ? hands.left.wrist : vr ? ginp.L.pos : gun.held ? _a.set(-0.1, -0.22, -0.5).applyQuaternion(head.quat).add(head.pos) : side(-1);
    const wr = sticks.right.active ? hands.right.wrist : vr ? ginp.R.pos : gun.held ? _b.set(0.17, -0.24, -0.25).applyQuaternion(head.quat).add(head.pos) : side(1);
    body.pose(head.pos, head.quat, wl, wr, walk.on ? null : seat, dt);
  }
  life.update(dt, now, head.pos);
  garage.update(dt, now);
  garage.haloM.opacity = vr ? 0.12 : 0; // a pane's glow: the bloom does it on a screen
  for (const n in guide.labels) guide.labels[n].visible = guide.on && !walk.on && !guide.labels[n].played;
  if (D.mode === 'screen' && D.walking !== walk.on) { D.walking = walk.on; $('help').innerHTML = walk.on ? WALK_HELP : SEAT_HELP; }
  guide.card.visible = vr && guide.on && !walk.on && !teach.on;
  guide.gun.visible = guide.on;
  readout.tick(now);
  // the lamp's shadows follow the sticks; given up first if a frame ever runs long
  if (vr) { if (dt > 0.02) stats.slow++; else stats.slow = Math.max(0, stats.slow - 0.02); if (stats.slow > 90 && lampOn) { lampOn = false; garage.lamp.shadow.autoUpdate = false; stats.slow = 0; } else if (stats.slow > 90 && !garage.lean) garage.thin(); }
  if (LOW && lampOn) { lampOn = false; garage.lamp.shadow.autoUpdate = false; }
  if (!vr && composer) { D.film.uniforms.time.value = now % 10; composer.render(); } else renderer.render(scene, camera);
});

build().catch((e) => { console.error(e); $('load').textContent = 'Could not load: ' + e.message; });
