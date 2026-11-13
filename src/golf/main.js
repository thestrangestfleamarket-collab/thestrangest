// Halcyon Greens — VR / desktop mini golf.
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { createTextures } from './textures.js';
import { COURSES } from './courses.js';
import { buildHole, BALL_R } from './holes.js';
import { buildEnvironment, loadAssets } from './environment.js';
import { makeBall } from './physics.js';
import { GameAudio } from './audio.js';
import { Panel, textSprite } from './ui.js';
import { Net } from './net.js';
import { makePost } from './post.js';
import { clamp, lerp } from './util.js';

const V3 = THREE.Vector3;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const MP = !!window.GOLF_MP; // only the standalone server.js relays rooms; the website has none yet

// ------------------------------------------------------------------ settings
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { } },
};
const BALLS = [['Pearl', 0xf4f4f0], ['Sunset', 0xff7a3c], ['Lagoon', 0x35c6d6], ['Lime', 0xa6e03a], ['Rose', 0xff5c8a], ['Violet', 0x9a6cff], ['Gold', 0xf2c230]];
const NAME_A = ['Mossy', 'Breezy', 'Lucky', 'Sandy', 'Dapper', 'Mellow', 'Sunny', 'Swift', 'Jolly', 'Quiet'];
const NAME_B = ['Otter', 'Heron', 'Fox', 'Badger', 'Finch', 'Marmot', 'Gecko', 'Puffin', 'Lynx', 'Wren'];
const randName = () => NAME_A[Math.random() * 10 | 0] + ' ' + NAME_B[Math.random() * 10 | 0];
const settings = Object.assign({
  quality: 'medium', turn: 'snap45', hand: 'right', autoPutter: true, putterLen: 0.9, power: 1, master: 0.8, ambience: 0.6,
  music: 0.3, strokeLimit: 10, guide: true, ball: 0, name: randName(), room: 1, vignette: false, practice: false,
}, JSON.parse(store.get('halcyon-settings') || '{}'));
if (params.get('name')) settings.name = params.get('name').slice(0, 20);
const save = () => store.set('halcyon-settings', JSON.stringify(settings));
const QUALITY = {
  low: { pr: 0.8, shadows: false, shadowSize: 1024, terrainSeg: 180, propScale: 0.5, fb: 0.9, fov: 1, grass: 45000, trees: 6, treeKinds: 2, farTrees: 300, mist: 14, fireflies: 90, bloom: false },
  medium: { pr: 1, shadows: true, shadowSize: 1024, terrainSeg: 260, propScale: 0.8, fb: 1.0, fov: 0.6, grass: 120000, trees: 12, treeKinds: 4, farTrees: 700, mist: 26, fireflies: 160, bloom: true },
  high: { pr: 2, shadows: true, shadowSize: 2048, terrainSeg: 340, propScale: 1, fb: 1.2, fov: 0.2, grass: 240000, trees: 16, treeKinds: 5, farTrees: 1400, mist: 40, fireflies: 240, bloom: true },
};
const Q = () => QUALITY[settings.quality] || QUALITY.high;

// ------------------------------------------------------------------ renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, Q().pr));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.xr.enabled = true;
renderer.xr.setFramebufferScaleFactor(Q().fb);
try { renderer.xr.setFoveation(Q().fov); } catch { }
document.body.prepend(renderer.domElement);
const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.03, 10000);
const rig = new THREE.Group(); rig.add(camera); scene.add(rig);
const post = makePost(renderer, scene, camera);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); post.setSize(innerWidth, innerHeight); });

const tex = createTextures();
const assets = await loadAssets(renderer, (f) => { $('loading').textContent = 'HALCYON GREENS · ' + Math.round(f * 100) + '%'; });
const audio = new GameAudio();
Object.assign(audio.vol, { master: settings.master, ambience: settings.ambience, music: settings.music });
const net = new Net();
const now = () => (net.now() % 3600000) / 1000;

function makeMats(e) {
  const S = (o) => new THREE.MeshStandardMaterial(o);
  return {
    tex,
    green: S({ map: tex.felt.map, normalMap: tex.felt.normalMap, color: e.green, roughness: 0.96, envMapIntensity: 0.35 }),
    sand: S({ map: tex.sand.map, normalMap: tex.sand.normalMap, color: 0xe6cf9c, roughness: 1, envMapIntensity: 0.3 }),
    ice: new THREE.MeshPhysicalMaterial({ map: tex.ice.map, normalMap: tex.ice.normalMap, color: 0xcfeaff, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.1 }),
    wall: S({ map: assets.wood.map, normalMap: assets.wood.normalMap, roughnessMap: assets.wood.arm, aoMap: assets.wood.arm, color: e.wall, roughness: 1 }),
    under: S({ map: assets.wood.map, normalMap: assets.wood.normalMap, roughnessMap: assets.wood.arm, color: e.under, roughness: 1 }),
    obst: S({ color: e.accent, roughness: 0.42, metalness: 0.05 }),
    metal: S({ color: 0xb9bec6, roughness: 0.3, metalness: 0.9 }),
    bumper: S({ color: 0x20242c, roughness: 0.35, metalness: 0.3 }),
    glow: new THREE.MeshBasicMaterial({ color: e.flag }),
    cup: S({ color: 0x15171a, roughness: 0.6, metalness: 0.4, side: THREE.BackSide }),
    cupBottom: S({ color: 0x0c0d0f, roughness: 0.9 }),
    rim: S({ color: 0xf2f2f2, roughness: 0.4, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    flag: S({ color: e.flag, roughness: 0.8, side: THREE.DoubleSide, emissive: e.flag, emissiveIntensity: 0.12 }),
    tee: S({ color: 0x1c1f24, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  };
}

// ------------------------------------------------------------------ game state
const game = {
  course: -1, holes: [], env: null, hole: null, holeIdx: 0, phase: 'menu', strokes: 0, moving: false, moveT: 0,
  menu: true, page: 'main', scores: new Map(), last: new V3(), courseGroup: null, holedT: 0,
};
game.scores.set('me', { name: settings.name, color: BALLS[settings.ball][1], s: [] });
const ball = makeBall(BALL_R);
const ev = { impact: 0, kind: '' };

function ballTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = 'rgba(0,0,0,0.07)';
  for (let y = 0; y < 14; y++) for (let x = 0; x < 28; x++) { g.beginPath(); g.arc(x * 9.2 + (y % 2) * 4.6, y * 9.4 + 4, 2.6, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(96, 64); g.lineTo(160, 64); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const ballTex = ballTexture();
const ballGeo = new THREE.SphereGeometry(BALL_R, 32, 20);
const makeBallMesh = (color) => {
  const m = new THREE.Mesh(ballGeo, new THREE.MeshPhysicalMaterial({ map: ballTex, color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 }));
  m.castShadow = true; return m;
};
const ballMesh = makeBallMesh(BALLS[settings.ball][1]); scene.add(ballMesh);
const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3, 8, 1, true).translate(0, 1.5, 0),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
scene.add(beacon);

// aim guide (desktop)
const guide = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false, fog: false }));
scene.add(guide);

// confetti
const CONF = 220;
const confGeo = new THREE.BufferGeometry();
confGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CONF * 3), 3));
const confCol = new Float32Array(CONF * 3); for (let i = 0; i < CONF; i++) new THREE.Color().setHSL(Math.random(), 0.9, 0.6).toArray(confCol, i * 3);
confGeo.setAttribute('color', new THREE.BufferAttribute(confCol, 3));
const confetti = new THREE.Points(confGeo, new THREE.PointsMaterial({ size: 0.03, vertexColors: true, toneMapped: false }));
confetti.frustumCulled = false; confetti.visible = false; scene.add(confetti);
const confVel = new Float32Array(CONF * 3); let confT = 0;
function burst(p) {
  const a = confGeo.attributes.position.array;
  for (let i = 0; i < CONF; i++) {
    a[i * 3] = p.x; a[i * 3 + 1] = p.y + 0.05; a[i * 3 + 2] = p.z;
    const an = Math.random() * 6.283, s = 0.4 + Math.random() * 1.6;
    confVel[i * 3] = Math.cos(an) * s; confVel[i * 3 + 1] = 2.5 + Math.random() * 3; confVel[i * 3 + 2] = Math.sin(an) * s;
  }
  confT = 3.5; confetti.visible = true;
}

// ------------------------------------------------------------------ HUD / toast
let toastTimer = 0, vrToast = null;
function toast(msg, secs = 2.6) {
  $('toast').textContent = msg; $('toast').classList.add('show'); toastTimer = secs;
  if (vrToast) { camera.remove(vrToast); vrToast.material.map.dispose(); vrToast.material.dispose(); vrToast = null; }
  if (renderer.xr.isPresenting) { vrToast = textSprite(msg, { height: 0.085 }); vrToast.position.set(0, 0.22, -1.4); camera.add(vrToast); }
}
const scoreName = (d, strokes) => strokes === 1 ? 'Hole in one!' : d <= -3 ? 'Albatross!' : d === -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : d === 2 ? 'Double bogey' : `+${d}`;
let hudKey = '';
function updateHud() {
  const h = game.hole; let html = '', wrist = '';
  if (h && game.phase !== 'menu') {
    const c = COURSES[game.course];
    const tot = total('me');
    html = `<span class="dim">${c.name}</span><br><b>Hole ${h.index + 1}</b> · ${h.name}<br>Par ${h.par} · Strokes <b>${game.strokes}</b><br><span class="dim">Total ${tot.s} (${tot.d >= 0 ? '+' : ''}${tot.d})${net.connected ? ' · Room ' + net.room + ' · ' + (net.peers.size + 1) + ' players' : ''}</span>`;
    wrist = `${h.index + 1}|${h.par}|${game.strokes}|${tot.d}`;
  }
  const key = html + game.phase;
  if (key === hudKey) return; hudKey = key;
  $('top').innerHTML = html; $('top').style.display = html ? '' : 'none';
  $('bNext').style.display = game.phase === 'holed' ? '' : 'none';
  $('bBall').style.display = game.phase === 'play' ? '' : 'none';
  $('hint').textContent = game.phase === 'play' ? 'Drag: aim · Wheel: zoom · Hold SPACE: power, release to putt · C: aim at cup · R: reset ball · M: menu'
    : game.phase === 'holed' ? 'Press N or ENTER to continue' : '';
  drawWrist(wrist);
}
function total(id) {
  const sc = game.scores.get(id); let s = 0, d = 0;
  if (sc) sc.s.forEach((v, i) => { if (v != null && game.holes[i]) { s += v; d += v - game.holes[i].par; } });
  return { s, d };
}

// ------------------------------------------------------------------ course loading
function loadCourse(i, holeIdx = 0, keepScores = false) {
  if (game.env) { game.env.dispose(); scene.remove(game.courseGroup); game.courseGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const def = COURSES[i], mats = makeMats(def.env);
  game.course = i;
  game.courseGroup = new THREE.Group(); scene.add(game.courseGroup);
  game.holes = def.holes.map((h, k) => { const b = buildHole(h, k, mats); game.courseGroup.add(b.group); return b; });
  game.env = buildEnvironment(def.env, renderer, scene, game.holes, mats, Q(), assets);
  panel.accent = '#' + new THREE.Color(def.env.lanterns || def.env.flag).getHexString();
  audio.setAmbience(def.env.kind); audio.water(game.env.sounds);
  if (!keepScores) for (const sc of game.scores.values()) sc.s = [];
  gotoHole(holeIdx);
}

function placeBall(p) {
  ball.x = p.x; ball.y = p.y + BALL_R + 0.002; ball.z = p.z; ball.vx = ball.vy = ball.vz = 0;
  ball.holed = false; ball.atRest = false; ball.restT = 0; game.moving = false;
}
function gotoHole(i) {
  const h = game.hole = game.holes[i]; game.holeIdx = i;
  game.strokes = 0; game.phase = game.menu && game.phase === 'menu' ? 'menu' : 'play';
  placeBall(h.tee); game.last.copy(h.tee);
  game.env.focus(h.center); game.env.lightHole(h);
  orbit.yaw = Math.atan2(-h.teeDir.x, -h.teeDir.z); orbit.pitch = 0.32; orbit.dist = 2.8;
  camTarget.set(ball.x, ball.y, ball.z);
  if (renderer.xr.isPresenting) teleportToBall();
  if (game.phase === 'play') toast(`Hole ${i + 1} · ${h.name} · Par ${h.par}`);
  sendScore();
}
function startCourse(i, fromNet = false) {
  game.phase = 'play'; game.menu = false; panel.mesh.visible = false;
  loadCourse(i, 0);
  if (!fromNet) net.send({ t: 'goto', course: i, hole: 0 });
}
function nextHole(fromNet = false) {
  if (game.phase === 'menu' || game.phase === 'done') return;
  const me = game.scores.get('me');
  if (me.s[game.holeIdx] == null) me.s[game.holeIdx] = Math.min(settings.strokeLimit || 99, game.strokes + 2);
  const n = game.holeIdx + 1;
  if (n >= game.holes.length) return finishCourse(); // finishing is per-player; others keep playing
  game.phase = 'play'; gotoHole(n); audio.whoosh();
  if (!fromNet) net.send({ t: 'goto', course: game.course, hole: n });
}
function finishCourse() {
  game.phase = 'done'; const t = total('me');
  const k = 'halcyon-best-' + game.course, best = +store.get(k) || 0;
  if (!best || t.s < best) store.set(k, t.s);
  sendScore(); audio.result(-1, true);
  toast(`Course complete — ${t.s} (${t.d >= 0 ? '+' : ''}${t.d})`, 5);
  openMenu('score');
}

function hit(dx, dz, speed) {
  if (game.phase !== 'play' || !ball.atRest) return false;
  game.last.set(ball.x, ball.y - BALL_R, ball.z);
  ball.vx = dx * speed; ball.vz = dz * speed; ball.vy = 0; ball.atRest = false; ball.restT = 0;
  game.moving = true; game.moveT = 0; game.strokes++;
  audio.putt(speed); net.send({ t: 'hit', v: +speed.toFixed(2) });
  return true;
}
function resetBall(penalty, msg) {
  if (game.phase !== 'play') return;
  if (penalty && !settings.practice) game.strokes++;
  placeBall(game.strokes === 0 ? game.hole.tee : game.last);
  if (msg) toast(msg);
  checkLimit();
}
function checkLimit() {
  if (settings.strokeLimit && game.strokes >= settings.strokeLimit && game.phase === 'play' && !settings.practice) {
    finishHole(settings.strokeLimit, `Stroke limit (${settings.strokeLimit}) — moving on`);
  }
}
function finishHole(strokes, msg) {
  game.phase = 'holed'; game.holedT = 0;
  game.scores.get('me').s[game.holeIdx] = strokes;
  const d = strokes - game.hole.par;
  toast(msg || scoreName(d, strokes), 3.5);
  if (!msg) { audio.result(d, strokes === 1); if (d < 0 || strokes === 1) burst(game.hole.cup); }
  sendScore(); net.send({ t: 'holed', n: strokes, hole: game.holeIdx });
}
function sendScore() { const me = game.scores.get('me'); net.send({ t: 'score', s: me.s, name: settings.name, color: me.color }); }

// ------------------------------------------------------------------ menu panel
const panel = new Panel(1024, 768, 1.0);
scene.add(panel.mesh);
function openMenu(page = 'main') { game.menu = true; game.page = page; panel.mesh.visible = true; panel.dirty = true; placePanel = true; }
function closeMenu() { if (game.phase === 'menu') return; game.menu = false; panel.mesh.visible = false; }
let placePanel = true;
const cyc = (key, list) => { settings[key] = list[(list.indexOf(settings[key]) + 1) % list.length]; save(); applySettings(key); };
function applySettings(key) {
  Object.assign(audio.vol, { master: settings.master, ambience: settings.ambience, music: settings.music }); audio.applyVolumes();
  if (key === 'ball') { const c = BALLS[settings.ball][1]; ballMesh.material.color.set(c); game.scores.get('me').color = c; sendScore(); }
  if (key === 'quality') {
    renderer.setPixelRatio(Math.min(devicePixelRatio, Q().pr));
    if (game.course >= 0) { const p = game.phase, s = game.strokes, b = { ...ball }; loadCourse(game.course, game.holeIdx, true); game.phase = p; game.strokes = s; Object.assign(ball, b); }
  }
}
function drawMenu() {
  const p = panel, W = 1024; p.begin();
  const back = (to = 'main') => p.button('‹ Back', 40, 40, 150, 60, () => { game.page = to; }, { size: 26 });
  const inGame = game.phase !== 'menu';
  if (game.page === 'main') {
    p.text('HALCYON GREENS', W / 2, 110, 76, '#fff', 'center', '700');
    p.text('VR MINI GOLF', W / 2, 172, 28, p.accent, 'center', '600');
    const L = 92, R = 532, bw = 400, bh = 86; let y = 240;
    if (inGame) p.button('Resume', L, y, bw, bh, closeMenu, { active: true }); else p.button('Play', L, y, bw, bh, () => startCourse(0), { active: true });
    p.button('Multiplayer', R, y, bw, bh, () => { game.page = 'mp'; }, { sub: !MP ? 'Coming soon' : net.connected ? `Room ${net.room} · ${net.peers.size + 1} players` : '', disabled: !MP }); y += 106;
    p.button('Restart hole', L, y, bw, bh, () => startCourse(0), { disabled: !inGame });
    p.button('Settings', R, y, bw, bh, () => { game.page = 'settings'; }); y += 106;
    p.button('Scorecard', L, y, bw, bh, () => { game.page = 'score'; }, { disabled: !inGame });
    p.button('How to play', R, y, bw, bh, () => { game.page = 'help'; }); y += 106;
    p.button('Reset ball (+1)', L, y, bw, bh, () => { resetBall(true, 'Ball reset'); closeMenu(); }, { disabled: game.phase !== 'play' });
    p.button(game.phase === 'holed' ? 'Next hole' : 'Skip hole', R, y, bw, bh, () => { closeMenu(); nextHole(); }, { disabled: !(game.phase === 'play' || game.phase === 'holed') });
    p.text(`Playing as ${settings.name}`, W / 2, 712, 22, '#8fa0b5', 'center');
  } else if (game.page === 'courses') {
    back(); p.text('Choose a course', W / 2, 70, 44, '#fff', 'center', '700');
    COURSES.forEach((c, i) => {
      const x = 44 + i * 318, y = 140, w = 300, h = 540;
      p.button('', x, y, w, h, () => startCourse(i), { radius: 24, active: false });
      const col = '#' + new THREE.Color(c.env.fog[0]).lerp(new THREE.Color(c.env.green), 0.35).getHexString();
      p.rr(x + 16, y + 16, w - 32, 170, 16); const g = p.g.createLinearGradient(0, y, 0, y + 190);
      g.addColorStop(0, '#' + new THREE.Color(c.env.hemi[0]).getHexString()); g.addColorStop(0.7, col); g.addColorStop(1, '#' + new THREE.Color(c.env.green).getHexString());
      p.g.fillStyle = g; p.g.fill();
      p.text(c.name, x + w / 2, y + 230, 32, '#fff', 'center', '700');
      p.text(c.difficulty.toUpperCase(), x + w / 2, y + 272, 20, p.accent, 'center', '700');
      const words = c.blurb.split(' '); let line = '', ly = y + 320;
      p.g.font = '500 21px "Segoe UI", system-ui, sans-serif';
      for (const wd of words) { if (p.g.measureText(line + wd).width > w - 44) { p.text(line, x + w / 2, ly, 21, '#b8c4d2', 'center'); ly += 28; line = ''; } line += wd + ' '; }
      p.text(line, x + w / 2, ly, 21, '#b8c4d2', 'center');
      const par = c.holes.reduce((a, h) => a + h.par, 0), best = store.get('halcyon-best-' + i);
      p.text(`${c.holes.length} holes · Par ${par}`, x + w / 2, y + 458, 22, '#e8edf4', 'center');
      p.text(best ? `Best: ${best}` : 'Not played yet', x + w / 2, y + 494, 22, best ? '#8fe0a0' : '#8fa0b5', 'center');
    });
  } else if (game.page === 'settings') {
    back(); p.text('Settings', W / 2, 70, 44, '#fff', 'center', '700');
    const pct = (v) => Math.round(v * 100) + '%';
    const rows = [
      ['Graphics', settings.quality, () => cyc('quality', ['low', 'medium', 'high'])],
      ['Turning', { snap30: 'Snap 30°', snap45: 'Snap 45°', smooth: 'Smooth' }[settings.turn], () => cyc('turn', ['snap30', 'snap45', 'smooth'])],
      ['Putter hand', settings.hand, () => cyc('hand', ['right', 'left'])],
      ['Putter length', settings.autoPutter ? 'Auto-fit to ground' : settings.putterLen.toFixed(2) + ' m', () => {
        if (settings.autoPutter) { settings.autoPutter = false; settings.putterLen = 0.7; } else if (settings.putterLen >= 1.19) settings.autoPutter = true; else settings.putterLen = +(settings.putterLen + 0.1).toFixed(2); save(); }],
      ['Putt power', pct(settings.power), () => cyc('power', [0.75, 1, 1.25, 1.5])],
      ['Stroke limit', settings.strokeLimit || 'None', () => cyc('strokeLimit', [6, 8, 10, 0])],
      ['Master volume', pct(settings.master), () => cyc('master', [0, 0.2, 0.4, 0.6, 0.8, 1])],
      ['Ambience', pct(settings.ambience), () => cyc('ambience', [0, 0.3, 0.6, 1])],
      ['Music', pct(settings.music), () => cyc('music', [0, 0.15, 0.3, 0.6])],
      ['Ball', BALLS[settings.ball][0], () => cyc('ball', BALLS.map((_, i) => i))],
      ['Aim guide (desktop)', settings.guide ? 'On' : 'Off', () => cyc('guide', [true, false])],
      ['Practice mode', settings.practice ? 'On — no penalties' : 'Off', () => cyc('practice', [false, true])],
    ];
    rows.forEach((r, i) => {
      const x = 44 + (i % 2) * 478, y = 130 + (i >> 1) * 100;
      p.button('', x, y, 458, 86, r[2]);
      p.text(r[0], x + 24, y + 44, 26, '#b8c4d2'); p.text(String(r[1]), x + 434, y + 44, 27, '#fff', 'right', '700');
    });
  } else if (game.page === 'mp') {
    back(); p.text('Multiplayer', W / 2, 70, 44, '#fff', 'center', '700');
    const st = { offline: 'Not connected', connecting: 'Connecting…', online: `Connected to room ${net.room}`, full: 'That room is full (8 max)' }[net.status];
    p.text(st, W / 2, 150, 28, net.connected ? '#8fe0a0' : '#b8c4d2', 'center');
    p.text('Everyone who joins the same room number plays together.', W / 2, 192, 22, '#8fa0b5', 'center');
    p.button('−', 262, 240, 90, 90, () => { settings.room = Math.max(1, settings.room - 1); save(); }, { size: 48, disabled: net.connected });
    p.text('Room ' + settings.room, W / 2, 286, 54, '#fff', 'center', '700');
    p.button('+', 672, 240, 90, 90, () => { settings.room = Math.min(99, settings.room + 1); save(); }, { size: 48, disabled: net.connected });
    if (net.connected || net.status === 'connecting') p.button('Leave room', 312, 360, 400, 84, () => net.leave());
    else p.button('Join room', 312, 360, 400, 84, () => net.join(String(settings.room), settings.name, '#' + new THREE.Color(BALLS[settings.ball][1]).getHexString()), { active: true });
    p.button(`Name: ${settings.name}  ↻`, 262, 468, 500, 64, () => { settings.name = randName(); game.scores.get('me').name = settings.name; save(); }, { size: 24, disabled: net.connected });
    let y = 572; p.text('Players', 120, y, 24, p.accent, 'left', '700'); y += 36;
    const list = [[settings.name + ' (you)', BALLS[settings.ball][1]], ...[...net.peers.values()].map(q => [q.name, q.color])];
    list.slice(0, 8).forEach((q, i) => {
      const x = 120 + (i % 2) * 420, yy = y + (i >> 1) * 34;
      p.g.fillStyle = typeof q[1] === 'number' ? '#' + new THREE.Color(q[1]).getHexString() : q[1]; p.g.beginPath(); p.g.arc(x + 10, yy, 10, 0, 7); p.g.fill();
      p.text(q[0], x + 32, yy, 24);
    });
  } else if (game.page === 'score') {
    back(); p.text(game.course >= 0 ? COURSES[game.course].name : 'Scorecard', W / 2, 70, 44, '#fff', 'center', '700');
    const n = game.holes.length, x0 = 300, cw = 84; let y = 160;
    p.text('Hole', 60, y, 24, '#8fa0b5'); for (let i = 0; i < n; i++) p.text(String(i + 1), x0 + i * cw, y, 26, i === game.holeIdx ? p.accent : '#8fa0b5', 'center', '700');
    p.text('Total', x0 + n * cw + 40, y, 24, '#8fa0b5', 'center'); y += 44;
    p.text('Par', 60, y, 24, '#8fa0b5'); let pt = 0; game.holes.forEach((h, i) => { pt += h.par; p.text(String(h.par), x0 + i * cw, y, 24, '#8fa0b5', 'center'); });
    p.text(String(pt), x0 + n * cw + 40, y, 24, '#8fa0b5', 'center'); y += 20;
    p.g.fillStyle = 'rgba(255,255,255,0.15)'; p.g.fillRect(50, y, W - 100, 2); y += 40;
    for (const [id, sc] of game.scores) {
      p.g.fillStyle = '#' + new THREE.Color(sc.color).getHexString(); p.g.beginPath(); p.g.arc(70, y, 11, 0, 7); p.g.fill();
      p.text(sc.name.slice(0, 13), 94, y, 26, '#fff', 'left', id === 'me' ? '700' : '500');
      for (let i = 0; i < n; i++) {
        const v = sc.s[i]; if (v == null) { p.text('·', x0 + i * cw, y, 26, '#556', 'center'); continue; }
        const d = v - game.holes[i].par;
        p.text(String(v), x0 + i * cw, y, 28, d < 0 ? '#8fe0a0' : d === 0 ? '#fff' : '#ff9d8a', 'center', '700');
      }
      const t = total(id); p.text(`${t.s} (${t.d >= 0 ? '+' : ''}${t.d})`, x0 + n * cw + 40, y, 26, '#fff', 'center', '700');
      y += 50;
    }
    if (game.phase === 'done') p.button('Play again', 312, 650, 400, 76, () => startCourse(0), { active: true });
  } else if (game.page === 'help') {
    back(); p.text('How to play', W / 2, 70, 44, '#fff', 'center', '700');
    const lines = [
      ['IN VR', ''],
      ['Putt', 'Swing the putter through the ball — speed is what you swing.'],
      ['Grip (hold)', 'Ghost putter for practice swings.'],
      ['A / X', 'Teleport to your ball (putter hand) · next hole (other hand).'],
      ['Thumbstick', 'Putter hand: turn, push forward to teleport. Other hand: glide.'],
      ['B / Y', 'Open or close this menu. Point and pull the trigger to select.'],
      ['ON DESKTOP', ''],
      ['Mouse', 'Drag to aim, wheel to zoom, C aims at the cup.'],
      ['Space', 'Hold to charge power, release to putt.'],
      ['RULES', ''],
      ['', 'Fewest strokes wins. Off the course = +1 and replay from where you hit.'],
      ['', 'The stroke limit ends a hole automatically (change it in Settings).'],
    ];
    let y = 140;
    for (const [a, b] of lines) {
      if (!b) { p.text(a, 60, y + 6, 22, p.accent, 'left', '700'); y += 40; continue; }
      p.text(a, 60, y, 23, '#fff', 'left', '700'); p.text(b, a ? 240 : 60, y, 22, '#b8c4d2'); y += 42;
    }
  }
  p.end();
}

// ------------------------------------------------------------------ desktop input
const orbit = { yaw: 0, pitch: 0.32, dist: 2.8 };
const camTarget = new V3();
const mouse = new THREE.Vector2(); const ray = new THREE.Raycaster();
let drag = null, charging = false, chargeT = 0, power = 0;
const dom = renderer.domElement;
const firstGesture = () => audio.init();
addEventListener('pointerdown', firstGesture); addEventListener('keydown', firstGesture);
dom.addEventListener('pointermove', (e) => {
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (drag && !game.menu) {
    orbit.yaw -= (e.clientX - drag.x) * 0.005; orbit.pitch = clamp(orbit.pitch + (e.clientY - drag.y) * 0.004, 0.06, 1.35);
    drag.x = e.clientX; drag.y = e.clientY;
  }
});
dom.addEventListener('pointerdown', (e) => {
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (game.menu) { pointDesktop(); if (panel.click()) audio.click(); return; }
  drag = { x: e.clientX, y: e.clientY }; dom.setPointerCapture(e.pointerId);
});
addEventListener('pointerup', () => { drag = null; });
dom.addEventListener('wheel', (e) => { orbit.dist = clamp(orbit.dist * (1 + Math.sign(e.deltaY) * 0.1), 0.7, 14); }, { passive: true });
function pointDesktop() {
  ray.setFromCamera(mouse, camera);
  const hitP = ray.intersectObject(panel.mesh)[0];
  dom.style.cursor = panel.point(hitP ? hitP.uv : null) ? 'pointer' : '';
}
const startCharge = () => { if (!game.menu && game.phase === 'play' && ball.atRest && !charging) { charging = true; chargeT = 0; } };
const endCharge = () => {
  if (!charging) return; charging = false;
  const sp = (0.35 + Math.pow(power, 1.5) * 8.2) * settings.power;
  hit(-Math.sin(orbit.yaw), -Math.cos(orbit.yaw), sp);
};
addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Space') { e.preventDefault(); startCharge(); }
  else if (e.code === 'KeyM' || e.code === 'Escape') { game.menu ? closeMenu() : openMenu(); }
  else if (e.code === 'KeyN' || e.code === 'Enter') { if (game.phase === 'holed') nextHole(); }
  else if (e.code === 'KeyR') resetBall(true, 'Ball reset');
  else if (e.code === 'KeyC' && game.hole) orbit.yaw = Math.atan2(ball.x - game.hole.cup.x, ball.z - game.hole.cup.z);
  else if (e.code === 'Tab') { e.preventDefault(); game.menu ? closeMenu() : openMenu('score'); }
});
addEventListener('keyup', (e) => { if (e.code === 'Space') endCharge(); });
$('putt').addEventListener('pointerdown', (e) => { e.preventDefault(); startCharge(); });
$('putt').addEventListener('pointerup', endCharge);
$('bMenu').onclick = () => game.menu ? closeMenu() : openMenu();
$('bNext').onclick = () => nextHole();
$('bBall').onclick = () => resetBall(true, 'Ball reset');

// ------------------------------------------------------------------ VR rig, controllers, putter
const handMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: 0.5 });
const laserGeo = new THREE.BufferGeometry().setFromPoints([new V3(), new V3(0, 0, -1)]);
const ctrls = [0, 1].map((i) => {
  const c = renderer.xr.getController(i); rig.add(c);
  const hand = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.09, 4, 10).rotateX(Math.PI / 2), handMat); hand.position.z = 0.04; c.add(hand);
  const laser = new THREE.Line(laserGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, fog: false })); laser.scale.z = 2; laser.visible = false; c.add(laser);
  c.userData = { src: null, btn: [], was: [], laser, stickX: 0, aiming: false, hover: false };
  c.addEventListener('connected', (e) => { c.userData.src = e.data; });
  c.addEventListener('disconnected', () => { c.userData.src = null; });
  return c;
});
const putter = new THREE.Group();
const shaftMat = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 1, roughness: 0.22 });
const headMat = new THREE.MeshStandardMaterial({ color: 0x30343c, metalness: 0.9, roughness: 0.3, transparent: true });
const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.0075, 1, 10).rotateX(Math.PI / 2).translate(0, 0, -0.5), shaftMat);
const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.24, 10).rotateX(Math.PI / 2).translate(0, 0, 0.0), new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.9 }));
const head = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.115, 0.032), headMat); head.castShadow = true;
putter.add(shaft, grip, head); putter.visible = false;
let putterL = 0.9; const headHist = []; let hitCooldown = 0;
const HEAD_A = new V3(), HEAD_B = new V3(), pA = new V3(), pB = new V3(); let havePrev = false;

// teleport arc
const arcGeo = new THREE.BufferGeometry(); arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(40 * 3), 3));
const arc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0x7fe0ff, fog: false })); arc.frustumCulled = false; arc.visible = false; scene.add(arc);
const marker = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x7fe0ff, fog: false, depthTest: false })); marker.visible = false; scene.add(marker);
const tpTarget = new V3(); let tpValid = false;

// wrist HUD
const wristC = document.createElement('canvas'); wristC.width = 384; wristC.height = 192;
const wristT = new THREE.CanvasTexture(wristC); wristT.colorSpace = THREE.SRGBColorSpace;
const wrist = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.065), new THREE.MeshBasicMaterial({ map: wristT, transparent: true, toneMapped: false, fog: false }));
wrist.position.set(0, 0.05, 0.05); wrist.rotation.x = -1.0; wrist.visible = false;
function drawWrist(s) {
  const g = wristC.getContext('2d'); g.clearRect(0, 0, 384, 192); if (!s) { wristT.needsUpdate = true; return; }
  const [h, par, st, d] = s.split('|');
  g.fillStyle = 'rgba(10,14,22,0.85)'; g.beginPath(); g.roundRect(0, 0, 384, 192, 28); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 84px system-ui'; g.fillText(st, 290, 84); g.font = '500 24px system-ui'; g.fillStyle = '#9fb0c4'; g.fillText('STROKES', 290, 150);
  g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '700 44px system-ui'; g.fillText('Hole ' + h, 26, 56);
  g.font = '500 30px system-ui'; g.fillStyle = '#9fb0c4'; g.fillText('Par ' + par, 26, 106); g.fillText('Total ' + (d >= 0 ? '+' : '') + d, 26, 148);
  wristT.needsUpdate = true;
}

const surfaceY = (x, z, y) => Math.max(game.hole ? game.hole.world.heightAt(x, z, y + 0.6) : -1e9, game.env ? Math.max(game.env.terrainH(x, z), game.env.waterAt(x, z)) : 0);
const tmpV = new V3(), tmpV2 = new V3(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(0, 0, 0, 'YXZ');
function headYawLocal() { tmpE.setFromQuaternion(camera.quaternion, 'YXZ'); return tmpE.y; }
// Move the rig so the player's head is above (x,z) with feet at y; optionally face `yaw`.
function placeHead(x, y, z, yaw = null) {
  if (yaw != null) rig.rotation.y = yaw - headYawLocal();
  tmpV.copy(camera.position).setY(0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rig.rotation.y);
  rig.position.set(x - tmpV.x, y, z - tmpV.z); rig.updateMatrixWorld(true);
}
function turnRig(a) {
  camera.getWorldPosition(tmpV2); const hx = tmpV2.x, hz = tmpV2.z;
  rig.rotation.y += a; placeHead(hx, rig.position.y, hz);
}
function teleportToBall() {
  if (!game.hole) return;
  const h = game.hole;
  let ax = h.cup.x - ball.x, az = h.cup.z - ball.z; const l = Math.hypot(ax, az) || 1; ax /= l; az /= l;
  if (l < 0.15 || ball.holed) { ax = h.teeDir.x; az = h.teeDir.z; }
  const s = settings.hand === 'left' ? -1 : 1;
  const fx = -az * s, fz = ax * s; // facing direction: target is on the player's lead side
  const by = ball.holed ? h.cup.y : ball.y - BALL_R;
  placeHead(ball.x - fx * 0.6, by, ball.z - fz * 0.6, Math.atan2(-fx, -fz));
  audio.whoosh();
}

function updateXR(dt) {
  const domC = ctrls.find(c => c.userData.src && c.userData.src.handedness === settings.hand) || ctrls.find(c => c.userData.src);
  const offC = ctrls.find(c => c !== domC && c.userData.src);
  for (const c of ctrls) {
    const u = c.userData, gp = u.src && u.src.gamepad;
    u.was = u.btn; u.btn = gp ? gp.buttons.map(b => b.pressed) : [];
    u.ax = gp ? [gp.axes[2] || 0, gp.axes[3] || 0] : [0, 0];
    u.down = (i) => u.btn[i] && !u.was[i]; u.up = (i) => !u.btn[i] && u.was[i];
    c.updateMatrixWorld(true);
  }
  for (const c of ctrls) if (c.userData.src && c.userData.down(5)) { game.menu ? closeMenu() : openMenu(); break; }
  if (offC && wrist.parent !== offC) offC.add(wrist);
  wrist.visible = !!offC && game.phase !== 'menu';
  if (domC && putter.parent !== domC) domC.add(putter);

  if (game.menu) {
    putter.visible = false; arc.visible = marker.visible = false;
    if (placePanel) {
      camera.getWorldPosition(tmpV); camera.getWorldDirection(tmpV2); tmpV2.y = 0; tmpV2.normalize();
      panel.mesh.position.copy(tmpV).addScaledVector(tmpV2, 1.25); panel.mesh.position.y -= 0.08; panel.mesh.lookAt(tmpV); placePanel = false;
    }
    let any = null;
    for (const c of ctrls) {
      const u = c.userData; u.laser.visible = !!u.src; if (!u.src) continue;
      tmpV.setFromMatrixPosition(c.matrixWorld); tmpV2.set(0, 0, -1).transformDirection(c.matrixWorld);
      ray.set(tmpV, tmpV2); const h = ray.intersectObject(panel.mesh)[0];
      u.laser.scale.z = h ? h.distance : 2;
      if (h && !any) any = { h, c };
    }
    panel.point(any ? any.h.uv : null);
    if (any && any.c.userData.down(0) && panel.click()) { audio.click(); pulse(any.c, 0.4, 30); }
    return;
  }
  for (const c of ctrls) c.userData.laser.visible = false;

  // --- locomotion ---
  if (domC) {
    const u = domC.userData, x = u.ax[0];
    if (settings.turn === 'smooth') { if (Math.abs(x) > 0.2) turnRig(-x * 1.8 * dt); }
    else { const step = settings.turn === 'snap30' ? Math.PI / 6 : Math.PI / 4; if (Math.abs(x) > 0.7 && Math.abs(u.stickX) <= 0.7) turnRig(-Math.sign(x) * step); }
    u.stickX = x;
    if (u.down(4)) teleportToBall();
  }
  if (offC) {
    const u = offC.userData;
    if (Math.hypot(u.ax[0], u.ax[1]) > 0.2 && !u.btn[0]) {
      camera.getWorldDirection(tmpV); tmpV.y = 0; tmpV.normalize(); tmpV2.set(-tmpV.z, 0, tmpV.x);
      rig.position.addScaledVector(tmpV, -u.ax[1] * 1.6 * dt).addScaledVector(tmpV2, u.ax[0] * 1.6 * dt);
      camera.getWorldPosition(tmpV); const sy = surfaceY(tmpV.x, tmpV.z, rig.position.y);
      if (sy > -100 && Math.abs(sy - rig.position.y) < 0.8) rig.position.y = lerp(rig.position.y, sy, 1 - Math.exp(-dt * 10));
    }
    if (u.down(4)) { if (game.phase === 'holed') nextHole(); else teleportToBall(); }
  }
  // teleport aim: putter-hand stick forward, or other-hand trigger
  let aimC = null;
  if (domC && domC.userData.ax[1] < -0.7) aimC = domC; else if (offC && offC.userData.btn[0]) aimC = offC;
  const wasAiming = ctrls.find(c => c.userData.aiming);
  if (aimC) {
    aimC.userData.aiming = true;
    tmpV.setFromMatrixPosition(aimC.matrixWorld); tmpV2.set(0, 0, -1).transformDirection(aimC.matrixWorld).multiplyScalar(6.5);
    const a = arcGeo.attributes.position.array; let n = 0; tpValid = false;
    for (let i = 0; i < 40; i++) {
      a[n * 3] = tmpV.x; a[n * 3 + 1] = tmpV.y; a[n * 3 + 2] = tmpV.z; n++;
      const sy = surfaceY(tmpV.x, tmpV.z, tmpV.y);
      if (tmpV.y <= sy) { tpTarget.set(tmpV.x, sy, tmpV.z); tpValid = true; break; }
      tmpV.addScaledVector(tmpV2, 0.035); tmpV2.y -= 9.8 * 0.035;
    }
    arcGeo.setDrawRange(0, n); arcGeo.attributes.position.needsUpdate = true; arc.visible = true;
    marker.visible = tpValid; if (tpValid) marker.position.copy(tpTarget).y += 0.02;
  } else {
    if (wasAiming && tpValid) { placeHead(tpTarget.x, tpTarget.y, tpTarget.z); audio.whoosh(); }
    for (const c of ctrls) c.userData.aiming = false;
    arc.visible = marker.visible = false; tpValid = false;
  }

  // --- putter ---
  putter.visible = !!domC && game.phase !== 'menu';
  hitCooldown -= dt;
  if (!domC) { havePrev = false; return; }
  domC.updateMatrixWorld(true);
  const ghost = !!domC.userData.btn[1] || !!domC.userData.aiming;
  tmpV.setFromMatrixPosition(domC.matrixWorld); tmpV2.set(0, 0, -1).transformDirection(domC.matrixWorld);
  let target = settings.putterLen;
  if (settings.autoPutter && tmpV2.y < -0.25) {
    const near = Math.hypot(tmpV.x - ball.x, tmpV.z - ball.z) < 2.5;
    const gy = near && !ball.holed ? ball.y - BALL_R : rig.position.y;
    target = clamp((tmpV.y - gy - 0.018) / -tmpV2.y, 0.35, 1.5);
  }
  putterL = lerp(putterL, target, 1 - Math.exp(-dt * 14));
  shaft.scale.z = putterL; head.position.set(0, 0.038, -putterL + 0.016);
  headMat.opacity = ghost ? 0.3 : 1;
  putter.updateMatrixWorld(true);
  HEAD_A.set(0, -0.02, -putterL + 0.016).applyMatrix4(domC.matrixWorld);
  HEAD_B.set(0, 0.095, -putterL + 0.016).applyMatrix4(domC.matrixWorld);
  const mid = HEAD_A.clone().add(HEAD_B).multiplyScalar(0.5);
  headHist.push({ p: mid, t: performance.now() / 1000 }); if (headHist.length > 5) headHist.shift();
  if (havePrev && !ghost && hitCooldown <= 0 && game.phase === 'play' && ball.atRest) {
    const bp = tmpV.set(ball.x, ball.y, ball.z); let touch = false;
    for (let k = 0; k <= 8 && !touch; k++) {
      const f = k / 8, a = tmpV2.copy(pA).lerp(HEAD_A, f), b = pB.clone().lerp(HEAD_B, f);
      const ab = b.sub(a), t = clamp(bp.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
      if (a.addScaledVector(ab, t).distanceTo(bp) < BALL_R + 0.02) touch = true;
    }
    if (touch) {
      const h0 = headHist[0], h1 = headHist[headHist.length - 1], T = Math.max(h1.t - h0.t, 1e-3);
      const vx = (h1.p.x - h0.p.x) / T, vz = (h1.p.z - h0.p.z) / T, sp = Math.hypot(vx, vz);
      if (sp > 0.12) {
        const out = clamp(sp * 1.5 * settings.power, 0.2, 13);
        if (hit(vx / sp, vz / sp, out)) { pulse(domC, clamp(0.3 + out / 6, 0, 1), 60); hitCooldown = 0.5; }
      }
    }
  }
  pA.copy(HEAD_A); pB.copy(HEAD_B); havePrev = true;
}
function pulse(c, s, ms) { try { c.userData.src.gamepad.hapticActuators[0].pulse(s, ms); } catch { } }

renderer.xr.addEventListener('sessionstart', () => { audio.init(); placePanel = true; needTp = true; guide.visible = false; });
renderer.xr.addEventListener('sessionend', () => { rig.position.set(0, 0, 0); rig.rotation.set(0, 0, 0); putter.visible = false; wrist.visible = false; arc.visible = marker.visible = false; for (const c of ctrls) c.userData.laser.visible = false; });
let needTp = false;

// ------------------------------------------------------------------ multiplayer avatars
const avatars = new Map();
function avatar(id) {
  let a = avatars.get(id); if (a) return a;
  const info = net.peers.get(id) || { name: 'Golfer', color: '#ffffff' };
  const col = new THREE.Color(info.color);
  const g = new THREE.Group(); scene.add(g);
  const headM = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })); headM.castShadow = true;
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.112, 24, 12, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.22).rotateX(-Math.PI / 2 + 0.25), new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.15, metalness: 0.6 }));
  headM.add(visor);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.28, 4, 12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, transparent: true, opacity: 0.85 })); body.castShadow = true;
  const club = new THREE.Group();
  const cs = new THREE.Mesh(shaft.geometry, shaftMat), ch = new THREE.Mesh(head.geometry, headMat.clone()); ch.material.opacity = 1;
  club.add(cs, ch, new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), handMat)); club.visible = false;
  const b = makeBallMesh(col);
  const label = textSprite(info.name, { height: 0.07 });
  g.add(headM, body, club, b, label);
  a = { g, headM, body, club, cs, ch, b, label, hp: new V3(), hq: new THREE.Quaternion(), cp: new V3(), cq: new THREE.Quaternion(), bp: new V3(), init: false, hole: -1 };
  avatars.set(id, a); return a;
}
function dropAvatar(id) { const a = avatars.get(id); if (!a) return; scene.remove(a.g); avatars.delete(id); }
net.on.status = () => { panel.dirty = true; hudKey = ''; };
net.on.welcome = (m) => {
  toast(`Joined room ${net.room}`);
  if (m.state && m.peers.length) { game.phase = 'play'; game.menu = false; panel.mesh.visible = false; loadCourse(m.state.course, Math.min(m.state.hole, COURSES[m.state.course].holes.length - 1)); }
  else if (game.phase !== 'menu') net.send({ t: 'goto', course: game.course, hole: game.holeIdx });
  sendScore();
};
net.on.join = (p) => { toast(`${p.name} joined`); game.scores.set(p.id, { name: p.name, color: p.color, s: [] }); sendScore(); if (game.phase !== 'menu') net.send({ t: 'goto', course: game.course, hole: game.holeIdx }); };
net.on.leave = (id) => { dropAvatar(id); game.scores.delete(id); panel.dirty = true; };
net.on.msg = (m) => {
  if (m.t === 'pose') {
    const a = avatar(m.from);
    a.hp.fromArray(m.h); a.hq.fromArray(m.h, 3); a.bp.fromArray(m.b); a.hole = m.hole;
    if (m.c) { a.cp.fromArray(m.c); a.cq.fromArray(m.c, 3); a.L = m.L; } a.hasClub = !!m.c;
    if (!a.init) { a.headM.position.copy(a.hp); a.b.position.copy(a.bp); a.club.position.copy(a.cp); a.init = true; }
  } else if (m.t === 'score') {
    const p = net.peers.get(m.from); game.scores.set(m.from, { name: m.name || p?.name || 'Golfer', color: m.color || p?.color || '#fff', s: m.s || [] }); panel.dirty = true;
  } else if (m.t === 'goto') {
    if (m.course !== game.course || game.phase === 'menu' || game.phase === 'done') { if (m.hole < COURSES[m.course].holes.length) { startCourse(m.course, true); if (m.hole) gotoHole(m.hole); } }
    else if (m.hole === game.holeIdx + 1) nextHole(true);
    else if (m.hole !== game.holeIdx && m.hole < game.holes.length) { game.phase = 'play'; gotoHole(m.hole); }
  } else if (m.t === 'holed') { const p = net.peers.get(m.from); if (p) toast(`${p.name} holed out in ${m.n}`); }
};
let poseT = 0;
const r3 = (n) => Math.round(n * 1000) / 1000;
function sendPose(dt) {
  if (!net.connected || (poseT += dt) < 1 / 15) return; poseT = 0;
  camera.getWorldPosition(tmpV); camera.getWorldQuaternion(tmpQ);
  const m = { t: 'pose', h: [tmpV.x, tmpV.y, tmpV.z, tmpQ.x, tmpQ.y, tmpQ.z, tmpQ.w].map(r3), b: [ball.x, ball.y, ball.z].map(r3), hole: game.phase === 'menu' ? -1 : game.holeIdx };
  if (renderer.xr.isPresenting && putter.parent && putter.visible) {
    putter.parent.getWorldPosition(tmpV); putter.parent.getWorldQuaternion(tmpQ);
    m.c = [tmpV.x, tmpV.y, tmpV.z, tmpQ.x, tmpQ.y, tmpQ.z, tmpQ.w].map(r3); m.L = r3(putterL);
  }
  net.send(m);
}
function updateAvatars(dt) {
  const k = 1 - Math.exp(-dt * 14);
  for (const a of avatars.values()) {
    a.g.visible = a.init && a.hole === game.holeIdx && game.phase !== 'menu';
    if (!a.g.visible) continue;
    a.headM.position.lerp(a.hp, k); a.headM.quaternion.slerp(a.hq, k);
    a.body.position.copy(a.headM.position).y -= 0.42;
    a.label.position.copy(a.headM.position).y += 0.24;
    a.b.position.lerp(a.bp, k);
    a.club.visible = !!a.hasClub;
    if (a.hasClub) { a.club.position.lerp(a.cp, k); a.club.quaternion.slerp(a.cq, k); a.cs.scale.z = a.L || 0.9; a.ch.position.set(0, 0.038, -(a.L || 0.9) + 0.016); }
  }
}

// ------------------------------------------------------------------ main loop
let lastT = performance.now();
const rollAxis = new V3(), rollQ = new THREE.Quaternion();
let menuAngle = 0;

function physics(dt) {
  const h = game.hole; if (!h) return;
  h.world.updateMovers(dt);
  if (game.phase === 'menu' || game.phase === 'done') return;
  ev.impact = 0; ev.kind = '';
  const px = ball.x, py = ball.y, pz = ball.z;
  h.world.step(ball, dt, ev);
  if (ev.impact > 0.35) audio.knock(ev.impact, ev.kind);
  // roll the mesh
  const dx = ball.x - px, dy = ball.y - py, dz = ball.z - pz, d = Math.hypot(dx, dy, dz);
  if (d > 1e-6 && ball.grounded) { rollAxis.set(ball.gnx, ball.gny, ball.gnz).cross(tmpV.set(dx, dy, dz)).normalize(); rollQ.setFromAxisAngle(rollAxis, d / BALL_R); ballMesh.quaternion.premultiply(rollQ); }
  ballMesh.position.set(ball.x, ball.y, ball.z);

  if (ball.holed && game.phase === 'play') { audio.cupDrop(); finishHole(Math.max(1, game.strokes)); return; }
  if (game.phase !== 'play') return;
  // out of bounds
  const wet = game.env.waterAt(ball.x, ball.z), floor = Math.max(game.env.terrainH(ball.x, ball.z), wet);
  if (ball.y - BALL_R < floor || ball.y < h.world.minY - 12) {
    if (floor === wet) audio.splash(); else audio.knock(2, 'ground');
    game.moving = false;
    resetBall(true, settings.practice ? 'Out of bounds' : 'Out of bounds  +1');
    return;
  }
  if (game.moving) {
    game.moveT += dt;
    if (game.moveT > 25) { ball.vx = ball.vy = ball.vz = 0; }
    if (ball.atRest) { game.moving = false; checkLimit(); }
  }
}

function desktopCamera(dt) {
  if (game.phase === 'menu') {
    menuAngle += dt * 0.05;
    const c = game.hole.center; camera.position.set(c.x + Math.cos(menuAngle) * 11, c.y + 3.2, c.z + Math.sin(menuAngle) * 11); camera.lookAt(c.x, c.y + 0.4, c.z);
  } else {
    const h = game.hole;
    const tgt = ball.holed ? h.cup : tmpV.set(ball.x, ball.y, ball.z);
    camTarget.lerp(tgt, 1 - Math.exp(-dt * 8));
    const cp = Math.cos(orbit.pitch);
    camera.position.set(camTarget.x + Math.sin(orbit.yaw) * cp * orbit.dist, camTarget.y + Math.sin(orbit.pitch) * orbit.dist + 0.1, camTarget.z + Math.cos(orbit.yaw) * cp * orbit.dist);
    camera.lookAt(camTarget.x, camTarget.y + 0.12, camTarget.z);
  }
  if (game.menu) {
    camera.updateMatrixWorld(true); camera.getWorldDirection(tmpV2);
    panel.mesh.position.copy(camera.position).addScaledVector(tmpV2, 1.35); panel.mesh.quaternion.copy(camera.quaternion);
    const s = Math.min(1, camera.aspect * 1.25); panel.mesh.scale.setScalar(s);
    pointDesktop();
  }
  // power meter + aim guide
  if (charging) { chargeT += dt; power = 0.5 - 0.5 * Math.cos(chargeT * 2.4); $('power').firstElementChild.style.width = power * 100 + '%'; }
  $('power').classList.toggle('show', charging);
  const show = settings.guide && game.phase === 'play' && ball.atRest && !game.menu;
  guide.visible = show;
  if (show) { guide.position.set(ball.x, ball.y - BALL_R + 0.004, ball.z); guide.rotation.y = orbit.yaw; guide.scale.z = charging ? 0.4 + power * 2.2 : 0.8; }
}

const startLoop = () => renderer.setAnimationLoop(() => {
  const nowMs = performance.now(), dt = Math.min((nowMs - lastT) / 1000, 1 / 20), t = now(); lastT = nowMs;
  const xr = renderer.xr.isPresenting;
  for (const h of game.holes) if (h === game.hole || h.center.distanceToSquared(camera.position) < 2500 || xr) h.update(t);
  physics(dt);
  if (xr) {
    if (needTp && camera.position.lengthSq() > 0.01) { needTp = false; if (game.phase === 'menu') placeHead(game.holes[0].tee.x, game.holes[0].tee.y, game.holes[0].tee.z + 0.8); else teleportToBall(); placePanel = true; }
    panel.mesh.scale.setScalar(1);
    updateXR(dt);
  } else desktopCamera(dt);
  // ball beacon when far away
  camera.getWorldPosition(tmpV);
  beacon.visible = game.phase === 'play' && Math.hypot(tmpV.x - ball.x, tmpV.z - ball.z) > 3.5;
  beacon.position.set(ball.x, ball.y, ball.z);
  ballMesh.visible = game.phase !== 'menu';
  if (game.env) game.env.update(dt, t, tmpV);
  audio.listen(camera);
  if (confT > 0) {
    confT -= dt; const a = confGeo.attributes.position.array;
    for (let i = 0; i < CONF; i++) { confVel[i * 3 + 1] -= 6 * dt; for (let k = 0; k < 3; k++) { confVel[i * 3 + k] *= 1 - dt * 1.2; a[i * 3 + k] += confVel[i * 3 + k] * dt; } }
    confGeo.attributes.position.needsUpdate = true; if (confT <= 0) confetti.visible = false;
  }
  if (toastTimer > 0 && (toastTimer -= dt) <= 0) { $('toast').classList.remove('show'); if (vrToast) { camera.remove(vrToast); vrToast = null; } }
  audio.update(dt);
  sendPose(dt); updateAvatars(dt);
  updateHud();
  if (game.menu && panel.dirty) drawMenu();
  if (xr || !Q().bloom) renderer.render(scene, camera); else post.render(dt);
});

// ------------------------------------------------------------------ boot
loadCourse(0);
game.phase = 'menu'; drawMenu();
startLoop();
$('loading').style.opacity = 0; setTimeout(() => $('loading').remove(), 700);
if (MP && params.get('room')) { settings.room = clamp(parseInt(params.get('room')) || 1, 1, 99); net.join(String(settings.room), settings.name, '#' + new THREE.Color(BALLS[settings.ball][1]).getHexString()); }
window.__game = { game, ball, hit, nextHole, startCourse, gotoHole, orbit, settings, net, openMenu, closeMenu };
