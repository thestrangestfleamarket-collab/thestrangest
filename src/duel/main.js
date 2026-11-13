// Bootstrap: lobby, rendering, input (headset controllers or keyboard+mouse), calibration.
import * as THREE from 'three';
import { Game } from './game.js';
import { WEAPONS, ORDER } from './weapons.js';
import { FX, Avatar, CanvasSprite, COLORS, makeShield, makeGun } from './fx.js';
import { World, THEMES, THEME_ORDER } from './world.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { connect, randomCode } from './net.js';
import { Bot } from './bot.js';
import { initAudio, sfx, setAmbience } from './audio.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

// ---- renderer / scene -------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.03, 400);
camera.rotation.order = 'YXZ';
scene.add(camera);

// Everything in the game lives under `arena`; calibration moves this one group.
const arena = new THREE.Group();
scene.add(arena);
const fx = new FX(arena);
const world = new World({ scene, arena, renderer });
fx.wallHit = (p) => world.wallHit(p);

// Bloom for flat-screen play. Headsets render directly (post-processing is too costly there),
// and get their glow from sprites instead.
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.5, 0.92));
composer.addPass(new OutputPass());
const useBloom = !params.has('nobloom');

const banner = new CanvasSprite(1024, 384, 1.7);       // round/score text at arena centre
banner.sprite.position.set(0, 1.75, 0);
arena.add(banner.sprite);
const notice = new CanvasSprite(1024, 256, 0.8);       // head-locked instructions/warnings
notice.sprite.position.set(0, -0.12, -1.1);
camera.add(notice.sprite);
const hud = new CanvasSprite(512, 256, 0.3);          // HP / shield / weapon
const flash = new THREE.Mesh(new THREE.PlaneGeometry(4, 4),
  new THREE.MeshBasicMaterial({ color: 0xff0022, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
flash.position.z = -0.3; flash.renderOrder = 998;
camera.add(flash);

// Weapon in your hand, with a short sight line.
const { group: gun, glowMat: gunGlow, waveGuide } = makeGun();
const myShield = makeShield();
myShield.material.uniforms.uOpacity.value = 0.55;   // your own shield stays see-through
myShield.visible = false;
arena.add(myShield);
let avatarShieldFlash = 0, myShieldFlash = 0;

// ---- state ------------------------------------------------------------------------

let game = null, link = null, bot = null, avatar = null;
let localId = 0, isBot = false;
let playMode = null;            // 'desktop' | 'xr'
let isAR = false;
let stage = 'lobby';            // lobby | place | calibA | calibB | play
let calibA = null;
let hostWidth = null;           // arena width sent by host
let flashAmt = 0, poseTimer = 0, lastT = 0, disconnected = false;
let waveVertical = false;

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const dirV = new THREE.Vector3(), axisV = new THREE.Vector3(), originV = new THREE.Vector3();

// ---- optional in-room effects (rain, embers, snow) ----------------------------------------------------------------------

let themeName = THEME_ORDER.includes(params.get('theme')) ? params.get('theme') : (localStorage.getItem('arduel-fx') || 'none');
if (!THEMES[themeName]) themeName = 'none';
function setTheme(name) {
  themeName = name;
  world.setTheme(name);
  try { localStorage.setItem('arduel-fx', name); } catch { /* private mode */ }
  for (const b of document.querySelectorAll('#themes button')) b.classList.toggle('on', b.dataset.theme === name);
  if (playMode) setAmbience(THEMES[name].ambience);
}
function cycleTheme() { setTheme(THEME_ORDER[(THEME_ORDER.indexOf(themeName) + 1) % THEME_ORDER.length]); sfx('swap'); }
for (const name of THEME_ORDER) {
  const b = document.createElement('button');
  b.textContent = THEMES[name].label; b.dataset.theme = name;
  b.onclick = () => setTheme(name);
  $('themes').appendChild(b);
}
setTheme(themeName);

// ---- lobby ------------------------------------------------------------------------

const status = (s) => { $('status').textContent = s || ''; };
function show(step) {
  for (const el of document.querySelectorAll('.step')) el.classList.toggle('on', el.id === step);
}

function createGame() {
  game = new Game({
    root: arena, fx, localId, botId: isBot ? 1 : null,
    send: link ? (m) => link.send(m) : null,
    hooks: {
      onHurt: (amt) => { flashAmt = Math.min(0.6, 0.25 + amt / 60); pulse('left', 0.9, 160); pulse('right', 0.9, 160); },
      onBlock: () => pulse('left', 1, 80),
      onFrozen: () => { pulse('right', 1, 300); },
      onShieldHit: (id) => { if (id === localId) myShieldFlash = 1; else avatarShieldFlash = 1; },
    },
  });
  if (isBot) bot = new Bot(game, 1);
  avatar = new Avatar(arena, COLORS.foe);
  world.build(game.bounds);
  if (link) {
    link.onmessage = (m) => {
      if (m?.t === 'cfg') { hostWidth = m.w; if (localId === 1 && stage === 'play') setWidth(m.w); return; }
      game.onMessage(m);
    };
    link.onclose = () => { disconnected = true; };
  }
  window.__duel = { game, arena, camera, desk, world, get stage() { return stage; } };
}

function setWidth(w) {
  game.bounds.hx = Math.max(1, Math.min(4, w / 2));
  world.build(game.bounds);
}

async function startOnline(host, code) {
  initAudio();
  status('Connecting...');
  if (host) { $('code').textContent = code; show('step-wait'); }
  try {
    link = await connect({ code, host, local: params.has('local'), onStatus: status });
  } catch (err) { status(err.message); show('step-menu'); return; }
  localId = host ? 0 : 1;
  isBot = false;
  createGame();
  status('');
  $('enter-text').textContent = 'Connected! Choose how to play on this device.';
  show('step-enter');
  if (params.has('auto')) startDesktop();
}

$('btn-bot').onclick = () => {
  initAudio();
  localId = 0; isBot = true;
  createGame();
  $('enter-text').textContent = 'Practice against a bot. Choose how to play.';
  show('step-enter');
};
$('btn-host').onclick = () => startOnline(true, randomCode());
$('btn-join').onclick = () => {
  const code = $('join-code').value.trim();
  if (code.length !== 4) { status('Enter the 4-letter room code.'); return; }
  startOnline(false, code);
};
$('btn-cancel').onclick = () => location.reload();
$('btn-desktop').onclick = startDesktop;
$('btn-xr').onclick = startXR;

let xrMode = null;
(async () => {
  if (!navigator.xr) { $('btn-xr').textContent = 'AR not available in this browser'; return; }
  if (await navigator.xr.isSessionSupported('immersive-ar').catch(() => false)) xrMode = 'immersive-ar';
  else if (await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)) xrMode = 'immersive-vr';
  if (xrMode) {
    $('btn-xr').disabled = false;
    $('btn-xr').textContent = xrMode === 'immersive-ar' ? 'Enter AR (headset)' : 'Enter VR (no passthrough here)';
  } else $('btn-xr').textContent = 'AR not available on this device';
})();


// ---- entering play ----------------------------------------------------------------

function startDesktop() {
  initAudio();
  playMode = 'desktop'; isAR = false; stage = 'play';
  $('lobby').classList.add('hidden');
  $('help').style.display = 'block'; $('cross').style.display = 'block';
  world.setAR(false); setAmbience(THEMES[themeName].ambience);
  arena.position.set(0, 0, 0); arena.rotation.set(0, 0, 0);
  const side = localId === 0 ? 1 : -1;
  desk.pos.set(0, 1.6, side * 1.8); desk.yaw = localId === 0 ? 0 : Math.PI; desk.pitch = 0;
  camera.add(gun); gun.position.set(0.17, -0.16, -0.3); gun.rotation.set(0, 0, 0);
  camera.add(hud.sprite); hud.sprite.position.set(-0.42, -0.3, -0.8);
  avatar.setHuman(false);
  if (link && localId === 0) link.send({ t: 'cfg', w: game.bounds.hx * 2 });
  if (hostWidth && localId === 1) setWidth(hostWidth);
  if (params.has('auto')) game.setReady(localId, 1.6);
}

async function startXR() {
  initAudio();
  let session;
  try {
    session = await navigator.xr.requestSession(xrMode, { requiredFeatures: ['local-floor'] });
  } catch (err) { status('Could not start: ' + err.message); return; }
  await renderer.xr.setSession(session);
  playMode = 'xr'; isAR = xrMode === 'immersive-ar';
  $('lobby').classList.add('hidden');
  world.setAR(isAR); setAmbience(THEMES[themeName].ambience);
  avatar.setHuman(isAR && !isBot);   // a real opponent is seen directly through passthrough
  camera.remove(gun, hud.sprite);
  arena.visible = false;             // nothing to show until the arena is placed
  stage = isBot ? 'place' : 'calibA';
  session.addEventListener('end', () => {
    playMode = null; stage = 'lobby'; arena.visible = true;
    $('lobby').classList.remove('hidden');
    status('Session ended. Enter again to keep playing (you will re-place the arena).');
  });
}

// ---- XR controllers ---------------------------------------------------------------

const ctrls = [0, 1].map((i) => {
  const c = renderer.xr.getController(i);
  c.addEventListener('connected', (e) => { c.userData.src = e.data; });
  c.addEventListener('disconnected', () => { c.userData.src = null; });
  scene.add(c);
  return c;
});
const hand = (h) => ctrls.find((c) => c.userData.src?.handedness === h) || null;
const prevBtn = {};
function btn(c, i) { return !!c?.userData.src?.gamepad?.buttons[i]?.pressed; }
function edge(name, down) { const was = prevBtn[name]; prevBtn[name] = down; return down && !was; }
function pulse(h, strength, ms) {
  try { hand(h)?.userData.src?.gamepad?.hapticActuators?.[0]?.pulse(strength, ms); } catch { /* optional */ }
}

// Arena placement from two real-world points on the centre line (same two spots for both players).
function calibrate(A, B) {
  const ax = A.x, az = A.z, bx = B.x, bz = B.z;
  arena.position.set((ax + bx) / 2, 0, (az + bz) / 2);
  arena.rotation.set(0, Math.atan2(-(bz - az), bx - ax), 0);
  arena.updateMatrixWorld(true);
  const w = Math.hypot(bx - ax, bz - az);
  if (localId === 0) { setWidth(w); link?.send({ t: 'cfg', w: game.bounds.hx * 2 }); }
  else setWidth(hostWidth || w);
}

// Practice: drop the arena in front of where you're looking, you at your start spot.
function placeInFront() {
  camera.getWorldDirection(_v); _v.y = 0;
  if (_v.lengthSq() < 1e-4) _v.set(0, 0, -1);
  _v.normalize();
  arena.position.set(camera.position.x + _v.x * 1.5, 0, camera.position.z + _v.z * 1.5);
  arena.rotation.set(0, Math.atan2(-_v.x, -_v.z), 0);
  arena.updateMatrixWorld(true);
}

// Both players calibrate on the same line but may tap the ends in opposite order.
// Each device makes sure its own player is on its own side, which resolves that.
function fixSide() {
  const z = arena.worldToLocal(_v.copy(camera.position)).z;
  if (localId === 0 ? z < 0 : z > 0) { arena.rotation.y += Math.PI; arena.updateMatrixWorld(true); }
}

function readXR(dt) {
  const R = hand('right'), L = hand('left');
  const a = game.local;
  const trigR = edge('rt', btn(R, 0));
  const trigAny = trigR | edge('lt', btn(L, 0));

  if (stage === 'place') {
    if (trigAny) { placeInFront(); arena.visible = true; stage = 'play'; sfx('beep'); }
    return;
  }
  if (stage === 'calibA' || stage === 'calibB') {
    if (trigAny) {
      const c = btn(R, 0) ? R : L;
      const pt = c.getWorldPosition(new THREE.Vector3());
      sfx('beep'); pulse('right', 0.6, 60);
      if (stage === 'calibA') { calibA = pt; stage = 'calibB'; }
      else if (pt.distanceTo(calibA) > 0.8) { calibrate(calibA, pt); arena.visible = true; stage = 'play'; }
    }
    return;
  }

  // Attach the gun and wrist HUD to whichever controllers are present.
  if (R && gun.parent !== R) { R.add(gun); gun.position.set(0, 0, 0); }
  const hudHost = L || R;
  if (hudHost && hud.sprite.parent !== hudHost) { hudHost.add(hud.sprite); hud.sprite.position.set(0, 0.16, 0); }

  arena.updateMatrixWorld(true);
  _q.copy(arena.quaternion).invert();
  arena.worldToLocal(a.head.copy(camera.position));
  if (L) arena.worldToLocal(L.getWorldPosition(a.lh)); else a.lh.copy(a.head).y -= 0.4;
  if (R) {
    arena.worldToLocal(R.getWorldPosition(a.rh));
    R.getWorldQuaternion(_q2).premultiply(_q);
    dirV.set(0, 0, -1).applyQuaternion(_q2);
    axisV.set(1, 0, 0).applyQuaternion(_q2);   // wave bar follows your wrist roll
  } else {
    a.rh.copy(a.head).y -= 0.3;
    dirV.set(0, 0, -1).applyQuaternion(_q2.copy(camera.quaternion).premultiply(_q));
    axisV.set(1, 0, 0);
  }
  a.aim.copy(dirV);

  // Weapon switch: right stick left/right, or A / B.
  const sx = R?.userData.src?.gamepad?.axes[2] || 0;
  if (edge('next', sx > 0.6 || btn(R, 4))) switchWeapon(1);
  if (edge('prev', sx < -0.6 || btn(R, 5))) switchWeapon(-1);

  if (edge('theme', btn(L, 3))) cycleTheme();   // click the left stick to change the room effect
  const wantShield = btn(L, 0) || btn(L, 1) || btn(R, 1);
  act(trigR, wantShield, dt);
}

// ---- desktop input ----------------------------------------------------------------

const desk = { pos: new THREE.Vector3(0, 1.6, 1.8), yaw: 0, pitch: 0, fire: false, shield: false };
const keys = {};
addEventListener('keydown', (e) => {
  if (playMode !== 'desktop') return;
  keys[e.code] = true;
  if (e.code === 'KeyE') switchWeapon(1);
  else if (e.code === 'KeyQ') switchWeapon(-1);
  else if (e.code === 'KeyR') waveVertical = !waveVertical;
  else if (e.code === 'KeyT') cycleTheme();
  else if (/^Digit[1-6]$/.test(e.code)) switchWeapon(0, +e.code[5] - 1);
  else if (e.code === 'Enter') game?.setReady(localId, 1.6);
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
renderer.domElement.addEventListener('mousedown', (e) => {
  if (playMode !== 'desktop') return;
  if (document.pointerLockElement !== renderer.domElement && !params.has('nolock')) {
    renderer.domElement.requestPointerLock?.();   // first click only captures the mouse
    return;
  }
  if (e.button === 0) desk.fire = true;
  if (e.button === 2) desk.shield = true;
});
addEventListener('mouseup', (e) => { if (e.button === 2) desk.shield = false; });
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('mousemove', (e) => {
  if (playMode !== 'desktop' || document.pointerLockElement !== renderer.domElement) return;
  if (Math.abs(e.movementX) > 250 || Math.abs(e.movementY) > 250) return;   // browsers can report a bogus jump on lock
  desk.yaw -= e.movementX * 0.0023;
  desk.pitch = Math.max(-1.4, Math.min(1.4, desk.pitch - e.movementY * 0.0023));
});
addEventListener('wheel', (e) => { if (playMode === 'desktop') switchWeapon(e.deltaY > 0 ? 1 : -1); });

function readDesktop(dt) {
  const a = game.local, B = game.bounds, side = localId === 0 ? 1 : -1;
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const sin = Math.sin(desk.yaw), cos = Math.cos(desk.yaw);
  desk.pos.x += (-sin * f + cos * s) * 2.4 * dt;
  desk.pos.z += (-cos * f - sin * s) * 2.4 * dt;
  desk.pos.x = Math.max(-B.hx + 0.25, Math.min(B.hx - 0.25, desk.pos.x));
  const z = Math.max(0.3, Math.min(B.hz - 0.25, desk.pos.z * side));
  desk.pos.z = z * side;
  const wantY = keys.KeyC || keys.ControlLeft ? 0.95 : 1.6;
  desk.pos.y += (wantY - desk.pos.y) * Math.min(1, dt * 12);
  camera.position.copy(desk.pos);
  camera.rotation.set(desk.pitch, desk.yaw, 0);
  if (fx.shake > 0) {
    const k = fx.shake * fx.shake * 0.035;
    camera.position.x += (Math.random() - 0.5) * k; camera.position.y += (Math.random() - 0.5) * k;
  }

  a.head.copy(desk.pos);
  a.rh.set(0.17, -0.16, -0.3).applyQuaternion(camera.quaternion).add(desk.pos);
  a.lh.set(-0.2, -0.15, -0.6).applyQuaternion(camera.quaternion).add(desk.pos);
  camera.getWorldDirection(_v);
  dirV.copy(desk.pos).addScaledVector(_v, 6).sub(a.rh).normalize();
  if (waveVertical) axisV.set(0, 1, 0); else axisV.set(1, 0, 0).applyQuaternion(camera.quaternion);
  a.aim.copy(_v);
  const fire = desk.fire; desk.fire = false;
  act(fire, desk.shield || keys.ShiftLeft, dt);
}

// ---- shared actions ---------------------------------------------------------------

function switchWeapon(delta, absolute) {
  if (!game) return;
  const a = game.local;
  a.weapon = absolute ?? (a.weapon + delta + ORDER.length) % ORDER.length;
  sfx('swap'); pulse('right', 0.3, 30);
}

function onMySide() {
  const z = game.local.head.z;
  return localId === 0 ? z > 0.12 : z < -0.12;
}

function act(firePressed, wantShield, dt) {
  const a = game.local;
  game.setShield(localId, wantShield, dt);
  if (!firePressed) return;
  if (game.phase === 'waiting' || game.phase === 'matchEnd') {
    if (playMode === 'xr') { fixSide(); game.setReady(localId, Math.max(1.2, Math.min(2.0, a.head.y))); }
    return;
  }
  if (!onMySide()) { sfx('deny'); return; }
  const type = ORDER[a.weapon];
  originV.copy(a.rh).addScaledVector(dirV, 0.4); originV.y += 0.008;   // the launcher's muzzle
  const res = game.fire(localId, type, originV, dirV, axisV);
  if (res) pulse('right', res === 'detonated' ? 1 : 0.5, res === 'detonated' ? 120 : 50);
  else if (game.phase === 'fight') sfx('deny');
}

// ---- per-frame UI -----------------------------------------------------------------

function bannerText() {
  const me = localId, s = game.score;
  const tally = `YOU ${s[me]}  -  ${s[1 - me]} ${isBot ? 'BOT' : 'RIVAL'}`;
  const readyHow = playMode === 'xr' ? 'PULL TRIGGER' : 'PRESS ENTER';
  switch (game.phase) {
    case 'waiting':
      return game.ready[me] ? ['WAITING FOR RIVAL', '#ffcc33'] : [`${readyHow} WHEN READY\nstand on your side of the yellow line`, '#35e0ff'];
    case 'countdown': return [`${Math.max(1, Math.ceil(game.timer))}\nROUND ${game.round}`, '#ffffff'];
    case 'fight': return game.fightTime < 0.8 ? ['FIGHT!', '#ffcc33'] : [''];
    case 'roundEnd': return game.winner === me ? [`ROUND WON\n${tally}`, '#66ff99'] : [`ROUND LOST\n${tally}`, '#ff4466'];
    case 'matchEnd': {
      const again = game.ready[me] ? 'waiting for rival...' : `${readyHow.toLowerCase()} for a rematch`;
      return game.winner === me ? [`VICTORY\n${tally}\n${again}`, '#66ff99'] : [`DEFEAT\n${tally}\n${again}`, '#ff4466'];
    }
  }
  return [''];
}

function noticeText() {
  if (disconnected) return 'RIVAL DISCONNECTED';
  if (stage === 'place') return 'FACE AN OPEN SPACE\npull the trigger to place the arena';
  if (stage === 'calibA') return 'CENTRE LINE: END 1\ntouch a controller to one end of the line\nbetween your two halves, pull trigger';
  if (stage === 'calibB') return 'CENTRE LINE: END 2\nnow the other end - both players must\nuse the same two spots';
  if (stage === 'play' && game.phase === 'fight' && !onMySide()) return 'STEP BACK\nstay on your side of the line';
  if (stage === 'play' && game.phase === 'fight' && game.local.frozen > 0) return 'LAUNCHER FROZEN';
  return '';
}

function drawHud() {
  const a = game.local, type = ORDER[a.weapon], W = WEAPONS[type];
  const cd = game.cdFrac(localId, type);
  const liveOrb = W.detonate && game.liveOf(localId, type).length > 0;
  const key = [a.hp, a.energy >> 1, a.weapon, Math.round(cd * 24), liveOrb, a.shieldLock].join('|');
  hud.draw(key, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(5,8,16,0.78)';
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, 28); ctx.fill();
    const bar = (y, frac, color, label) => {
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(110, y, w - 134, 30);
      ctx.fillStyle = color; ctx.fillRect(110, y, (w - 134) * frac, 30);
      ctx.fillStyle = '#e8ecf4'; ctx.font = '700 26px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(label, 24, y + 16);
    };
    bar(24, a.hp / 100, a.hp > 35 ? '#44dd77' : '#ff4466', 'HP');
    bar(68, a.energy / 100, a.shieldLock ? '#666f80' : '#55aaff', 'SHLD');
    ctx.fillStyle = '#' + W.color.toString(16).padStart(6, '0');
    ctx.font = '800 44px system-ui, sans-serif';
    ctx.fillText(`${a.weapon + 1}. ${W.name}`, 24, 142);
    ctx.fillStyle = '#9aa6bd'; ctx.font = '500 22px system-ui, sans-serif';
    ctx.fillText(liveOrb ? 'FIRE AGAIN TO DETONATE' : W.hint, 24, 184, w - 48);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(24, 214, w - 48, 16);
    ctx.fillStyle = cd > 0 ? '#ffcc33' : '#44dd77'; ctx.fillRect(24, 214, (w - 48) * (1 - cd), 16);
  });
}

// ---- main loop --------------------------------------------------------------------

renderer.setAnimationLoop((t) => {
  const dt = Math.min(0.05, Math.max(0.001, (t - lastT) / 1000));
  lastT = t;
  if (game && playMode) {
    if (playMode === 'xr') readXR(dt); else readDesktop(dt);
    if (stage === 'play') {
      bot?.update(dt);
      game.update(dt);
      poseTimer += dt;
      if (link && poseTimer > 1 / 30) { poseTimer = 0; link.send(game.poseMessage()); }

      avatar.update(game.remote, game.time);
      myShield.visible = game.local.shieldUp;
      myShield.position.copy(game.local.lh);
      const W = WEAPONS[ORDER[game.local.weapon]];
      const iced = game.local.frozen > 0;
      gunGlow.color.setHex(iced ? 0xdff6ff : W.color).multiplyScalar(iced ? 0.6 + 0.6 * Math.abs(Math.sin(game.time * 12)) : 1.8);
      if (iced && Math.random() < 0.4) fx.smoke.emit(game.local.rh, 0, -0.1, 0, { color: 0xd8f0ff, size: 0.05, endSize: 0.18, life: 0.7, alpha: 0.3 });
      myShield.material.uniforms.uTime.value = game.time;
      myShieldFlash = Math.max(0, myShieldFlash - dt * 4); avatarShieldFlash = Math.max(0, avatarShieldFlash - dt * 4);
      myShield.material.uniforms.uFlash.value = myShieldFlash;
      avatar.shield.material.uniforms.uFlash.value = avatarShieldFlash;
      waveGuide.visible = !!W.bar;
      if (playMode === 'desktop') waveGuide.rotation.z = waveVertical ? Math.PI / 2 : 0;
      drawHud();
      const [text, color] = bannerText();
      banner.text(text, color);
    }
    notice.text(noticeText(), '#ffcc33');
    fx.update(dt);
    world.update(dt, t / 1000);
    flashAmt = Math.max(0, flashAmt - dt * 1.4);
    flash.material.opacity = flashAmt;
    flash.visible = flashAmt > 0.01;
  } else {
    flash.visible = false;
    notice.sprite.visible = false;
    banner.sprite.visible = false;
  }
  if (useBloom && !renderer.xr.isPresenting && playMode === 'desktop') composer.render();
  else renderer.render(scene, camera);
});

addEventListener('resize', () => {
  if (renderer.xr.isPresenting) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

// URL shortcuts: ?bot, ?host=CODE, ?join=CODE (+ &auto to skip the menu, &local for same-browser tabs)
if (params.has('join')) $('join-code').value = params.get('join');
if (params.has('bot')) { $('btn-bot').onclick(); if (params.has('auto')) startDesktop(); }
else if (params.has('host')) startOnline(true, params.get('host'));
else if (params.has('join') && params.has('auto')) startOnline(false, params.get('join'));
