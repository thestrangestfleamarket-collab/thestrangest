// SKIRMISH TABLE's page (/chess): the board, its pieces, the screen and AR controls, and the link to the match's room
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as G from './game.js';
import { makeStone, makeWood, makeEnvironment, makeBackdrop } from './procedural.js';
import { FX } from './fx.js';
import { Sound } from './audio.js';
import { loadCharacters, makeCharacter } from './characters.js';

const $ = id => document.getElementById(id);
const AR_SCALE = 0.06; // one tile = 6 cm on your real table
const TEAM = [0x2bb3a3, 0xf08a3c];
const FACE_ANGLE = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };

// ---------------------------------------------------------------- state
let ws = null, me = -1, code = null, state = null;
let started = false, present = [false, false], deadline = null, skew = 0;
let selected = null, inspected = null;

function getToken() {
  try {
    let t = sessionStorage.getItem('token');
    if (!t) {
      t = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
      sessionStorage.setItem('token', t);
    }
    return t;
  } catch { return String(Math.random()).slice(2) + Date.now(); }
}
const token = getToken();
const myTurn = () => started && state && state.winner === null && state.turn === me;

// ---------------------------------------------------------------- scene
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const BG = makeBackdrop();
const FOG = new THREE.FogExp2(0x0a0b0e, 0.018);
scene.background = BG;
scene.fog = FOG;
scene.environment = makeEnvironment(renderer); // reflections for metal and stone
scene.environmentIntensity = 0.28;
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.01, 200);
camera.position.set(0, 10, 10.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = 1.45;
controls.minDistance = 4;
controls.maxDistance = 30;
controls.enablePan = false;

const world = new THREE.Group(); // everything that sits on the table
scene.add(world);

// Lighting: a warm key light with shadows (parented to the board so it follows it in AR), plus a dim cool fill.
scene.add(new THREE.HemisphereLight(0x8fa0c0, 0x2a2018, 0.25));
const sun = new THREE.DirectionalLight(0xffe2c0, 3.0);
sun.position.set(8, 9, 1); // from the side, so shadows are visible from both players' seats
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
world.add(sun, sun.target);
function setShadowScale(k) { // shadow volume is in real units, so it must shrink with the board in AR
  const c = sun.shadow.camera;
  c.left = -9 * k; c.right = 9 * k; c.top = 9 * k; c.bottom = -9 * k; c.near = 1 * k; c.far = 32 * k;
  c.updateProjectionMatrix();
  sun.shadow.normalBias = 0.03 * k;
  sun.shadow.bias = -0.0004;
}
setShadowScale(1);
const tilesGroup = new THREE.Group(), unitsGroup = new THREE.Group(), arrowsGroup = new THREE.Group(), panel = new THREE.Group();
world.add(tilesGroup, unitsGroup, arrowsGroup, panel);
const pickRoots = [tilesGroup, unitsGroup, arrowsGroup, panel];

const tx = x => x - (G.COLS - 1) / 2;
const tz = y => y - (G.ROWS - 1) / 2;

// Board
const wood = makeWood(11);
for (const t of Object.values(wood)) t.repeat.set(3, 3);
const woodMat = new THREE.MeshStandardMaterial({ ...wood, color: 0xffffff });
const slab = new THREE.Mesh(new THREE.BoxGeometry(G.COLS + 0.7, 0.24, G.ROWS + 0.7), woodMat);
slab.position.y = -0.22;
slab.receiveShadow = true;
world.add(slab);
// A big round table under the board, only for the flat-screen view (in AR your real table does this job).
const tableWood = makeWood(23);
for (const t of Object.values(tableWood)) t.repeat.set(5, 5);
const table = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 0.4, 56), new THREE.MeshStandardMaterial({ ...tableWood, color: 0x9a8a7a }));
table.position.y = -0.55;
table.receiveShadow = true;
world.add(table);
const stone = [makeStone(3), makeStone(8)];
const tiles = [];
const tileGeo = new THREE.BoxGeometry(0.95, 0.1, 0.95);
for (let y = 0; y < G.ROWS; y++) {
  for (let x = 0; x < G.COLS; x++) {
    const m = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ ...stone[(x * 7 + y * 3) % 2], normalScale: new THREE.Vector2(1.2, 1.2) }));
    m.position.set(tx(x), -0.05, tz(y));
    m.receiveShadow = true;
    m.userData.pick = { kind: 'tile', x, y };
    tilesGroup.add(m);
    tiles.push(m);
  }
}
const tileAt = (x, y) => tiles[y * G.COLS + x];

// ---------------------------------------------------------------- text helpers
function textTexture(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx: canvas.getContext('2d'), tex };
}

function makeLabel() {
  const t = textTexture(256, 96);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, depthTest: false, transparent: true }));
  sprite.scale.set(1.25, 0.47, 1);
  sprite.position.y = 1.85;
  sprite.renderOrder = 5;
  sprite.raycast = () => {};
  sprite.userData.t = t;
  return sprite;
}

function drawLabel(sprite, u) {
  const { ctx, tex } = sprite.userData.t;
  const type = G.TYPES[u.type];
  ctx.clearRect(0, 0, 256, 96);
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff';
  ctx.strokeText(type.name, 128, 30); ctx.fillText(type.name, 128, 30);
  ctx.fillStyle = '#000'; ctx.fillRect(28, 42, 200, 18);
  ctx.fillStyle = u.owner === 0 ? '#2bb3a3' : '#f08a3c';
  ctx.fillRect(30, 44, 196 * Math.max(0, u.hp) / type.hp, 14);
  const tag = u.snare > 0 ? `snared ${u.snare}` : u.rec > 0 ? `resting ${u.rec}` : '';
  if (tag) {
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = u.snare > 0 ? '#d7a6ff' : '#ffd66b';
    ctx.strokeText(tag, 128, 88); ctx.fillText(tag, 128, 88);
  }
  tex.needsUpdate = true;
}

// ---------------------------------------------------------------- unit models (primitive shapes)
function buildUnit(u) {
  const g = new THREE.Group();
  const team = new THREE.MeshStandardMaterial({ color: TEAM[u.owner], roughness: 0.45, metalness: 0.25 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.95, roughness: 0.28 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0xece6d8, roughness: 0.95 });
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  add(new THREE.CylinderGeometry(0.36, 0.38, 0.06, 24), team, 0, 0.03, 0);
  const nose = add(new THREE.ConeGeometry(0.12, 0.22, 3), steel, 0, 0.06, -0.42); // points the way the unit faces
  nose.rotation.x = -Math.PI / 2;
  const ch = makeCharacter(u.type); // animated model once loaded; simple shapes until then
  if (ch) g.add(ch.object);
  else switch (u.type) {
    case 'bulwark':
      add(new THREE.BoxGeometry(0.42, 0.62, 0.36), steel, 0, 0.42, 0.02);
      add(new THREE.SphereGeometry(0.17, 12, 10), steel, 0, 0.88, 0.02);
      add(new THREE.BoxGeometry(0.5, 0.56, 0.07), team, 0, 0.44, -0.24);
      break;
    case 'lancer': {
      add(new THREE.CylinderGeometry(0.15, 0.2, 0.62, 12), team, 0, 0.42, 0);
      add(new THREE.SphereGeometry(0.15, 12, 10), cloth, 0, 0.86, 0);
      const pike = add(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6), steel, 0.2, 0.62, -0.3);
      pike.rotation.x = -Math.PI / 2.4;
      break;
    }
    case 'strider': {
      const body = add(new THREE.ConeGeometry(0.2, 0.7, 10), new THREE.MeshStandardMaterial({ color: 0x30343c }), 0, 0.45, 0);
      body.rotation.x = -0.25;
      add(new THREE.SphereGeometry(0.14, 12, 10), team, 0, 0.86, -0.1);
      add(new THREE.BoxGeometry(0.04, 0.04, 0.34), steel, 0.2, 0.5, -0.2);
      break;
    }
    case 'slinger': {
      add(new THREE.CylinderGeometry(0.16, 0.2, 0.6, 12), cloth, 0, 0.4, 0);
      add(new THREE.SphereGeometry(0.15, 12, 10), team, 0, 0.84, 0);
      const bow = add(new THREE.TorusGeometry(0.26, 0.025, 6, 14, Math.PI), steel, 0.24, 0.5, -0.12);
      bow.rotation.set(0, Math.PI / 2, -Math.PI / 2);
      break;
    }
    case 'ember':
      add(new THREE.ConeGeometry(0.26, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x8a2f2f }), 0, 0.5, 0);
      add(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffa23a, emissive: 0xff5a1f, emissiveIntensity: 1.2 }), 0, 1.02, 0);
      break;
    case 'mender':
      add(new THREE.CylinderGeometry(0.14, 0.26, 0.7, 12), cloth, 0, 0.45, 0);
      add(new THREE.SphereGeometry(0.15, 12, 10), cloth, 0, 0.92, 0);
      add(new THREE.BoxGeometry(0.3, 0.09, 0.05), new THREE.MeshStandardMaterial({ color: 0x3fae6a, emissive: 0x1d6b3c }), 0, 0.5, -0.2);
      add(new THREE.BoxGeometry(0.09, 0.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x3fae6a, emissive: 0x1d6b3c }), 0, 0.5, -0.2);
      break;
    case 'hexbinder':
      add(new THREE.ConeGeometry(0.24, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0x4b3a7a }), 0, 0.45, 0);
      add(new THREE.OctahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: 0xc08bff, emissive: 0x7a3fd0, emissiveIntensity: 1 }), 0, 1.05, 0);
      break;
  }
  g.traverse(o => { if (o.isMesh) o.userData.base = o.material.color.clone(); });
  const label = makeLabel();
  g.add(label);
  g.userData = { ch, type: u.type, pick: { kind: 'unit', id: u.id }, label, key: '', target: new THREE.Vector3(tx(u.x), 0, tz(u.y)), angle: FACE_ANGLE[u.facing] };
  g.position.copy(g.userData.target);
  g.rotation.y = g.userData.angle;
  return g;
}

const unitMeshes = new Map();
const dying = []; // units playing their fall-over animation before removal
function syncUnits() {
  const alive = new Set();
  for (const u of state.units) {
    alive.add(u.id);
    let g = unitMeshes.get(u.id);
    if (!g) { g = buildUnit(u); unitMeshes.set(u.id, g); unitsGroup.add(g); }
    g.userData.target.set(tx(u.x), 0, tz(u.y));
    g.userData.angle = FACE_ANGLE[u.facing];
    const key = `${u.hp}|${u.rec}|${u.snare}`;
    if (key !== g.userData.key) {
      g.userData.key = key;
      drawLabel(g.userData.label, u);
      const dim = u.rec > 0 || u.snare > 0 ? 0.4 : 1;
      g.traverse(o => { if (o.isMesh) o.material.color.copy(o.userData.base).multiplyScalar(dim); });
    }
  }
  for (const [id, g] of unitMeshes) {
    if (!alive.has(id)) { unitMeshes.delete(id); g.userData.pick = null; g.userData.label.visible = false; if (g.userData.ch) g.userData.ch.once('death'); dying.push({ g, t: 0 }); }
  }
}

// ---------------------------------------------------------------- facing arrows
const arrowMat = new THREE.MeshStandardMaterial({ color: 0xffd23a, emissive: 0x8a6a00 });
for (const [dir, [dx, dy]] of Object.entries(G.DIRS)) {
  const a = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 4), arrowMat);
  a.position.set(dx * 0.62, 2.1, dy * 0.62);
  a.rotation.set(Math.PI / 2, 0, 0);
  a.rotation.order = 'YXZ';
  a.rotation.y = Math.atan2(dx, dy);
  a.userData.pick = { kind: 'face', dir };
  arrowsGroup.add(a);
}
arrowsGroup.visible = false;
panel.visible = false; // only shown in AR; the HTML bar does this job on a flat screen

// ---------------------------------------------------------------- table-side panel (works in AR, where there is no HTML)
const statusT = textTexture(1024, 160);
const statusPlane = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.1), new THREE.MeshBasicMaterial({ map: statusT.tex, transparent: true }));
statusPlane.position.set(0, 0.6, 0.2);
statusPlane.rotation.x = -0.9;
statusPlane.raycast = () => {};
panel.add(statusPlane);

function makeButton(text, color, x, kind) {
  const t = textTexture(256, 96);
  t.ctx.fillStyle = color; t.ctx.fillRect(0, 0, 256, 96);
  t.ctx.fillStyle = '#fff'; t.ctx.font = 'bold 38px system-ui, sans-serif'; t.ctx.textAlign = 'center'; t.ctx.textBaseline = 'middle';
  t.ctx.fillText(text, 128, 50);
  t.tex.needsUpdate = true;
  const side = new THREE.MeshStandardMaterial({ color });
  const top = new THREE.MeshBasicMaterial({ map: t.tex });
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 0.86), [side, side, top, side, side, side]);
  b.position.set(x, 0.05, 1.25);
  b.userData.pick = { kind };
  panel.add(b);
  return b;
}
const endButton3D = makeButton('END TURN', '#2f6fed', -1.3, 'end');
const recenterButton3D = makeButton('RECENTER', '#3a404b', 1.3, 'recenter');

function placePanel() {
  const seat = me === 1 ? 1 : 0;
  panel.rotation.y = seat === 1 ? Math.PI : 0;
  panel.position.set(0, 0, (seat === 1 ? -1 : 1) * (G.ROWS / 2 + 0.5));
}

let lastStatus = '';
function drawStatus(line1, line2) {
  const key = line1 + '\n' + line2;
  if (key === lastStatus) return;
  lastStatus = key;
  const { ctx, tex } = statusT;
  ctx.clearRect(0, 0, 1024, 160);
  ctx.fillStyle = 'rgba(20,23,28,0.85)';
  ctx.fillRect(0, 0, 1024, 160);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText(line1, 512, 62);
  ctx.fillStyle = '#c3c9d3'; ctx.font = '32px system-ui, sans-serif';
  ctx.fillText(line2, 512, 124);
  tex.needsUpdate = true;
}

// ---------------------------------------------------------------- floating combat text
const floaters = [];
function floatText(pos, text, color) {
  const t = textTexture(256, 64);
  t.ctx.font = 'bold 44px system-ui, sans-serif'; t.ctx.textAlign = 'center';
  t.ctx.lineWidth = 8; t.ctx.strokeStyle = '#000'; t.ctx.fillStyle = color;
  t.ctx.strokeText(text, 128, 46); t.ctx.fillText(text, 128, 46);
  t.tex.needsUpdate = true;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, depthTest: false, transparent: true }));
  s.scale.set(1.6, 0.4, 1);
  s.position.copy(pos).setY(2.0);
  s.renderOrder = 10;
  s.raycast = () => {};
  s.userData.life = 1.4;
  world.add(s);
  floaters.push(s);
}

// ---------------------------------------------------------------- effects + sound for game events
const fx = new FX(world);
const sound = new Sound();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const worldPos = local => world.localToWorld(local.clone()); // board space -> room space, for 3D audio
const later = (t, fn) => (t > 0 ? setTimeout(fn, t * 1000) : fn());
const IMPACT_DELAY = { melee: 0.16, line: 0.18, ranged: 0.4, blast: 0.5, heal: 0.25, snare: 0.3 };
let shake = 0;

function explode(t) {
  const wp = worldPos(t);
  fx.flash({ pos: t.clone().setY(0.5), tex: 'light_01', color: 0xffc070, size: 3.5, life: 0.25, grow: 0.8 });
  fx.burst({ pos: t.clone().setY(0.2), tex: 'fire_01', color: 0xff8a30, count: 22, size: 0.9, life: 0.6, speed: 2.6, up: 0.9, drag: 3, grow: 0.8, spread: 0.8 });
  fx.burst({ pos: t.clone().setY(0.3), tex: 'spark_01', color: 0xffd080, count: 18, size: 0.22, life: 0.9, speed: 5, up: 0.9, gravity: 9, drag: 0.6 });
  fx.burst({ pos: t.clone().setY(0.3), tex: 'smoke_07', color: 0x2a2622, count: 9, size: 1.2, life: 1.8, speed: 0.8, up: 1.4, drag: 1, grow: 1.2, additive: false, opacity: 0.55, spread: 0.8 });
  fx.decal({ pos: t, tex: 'scorch_02', size: 2.8 });
  fx.lightFlash(t, 0xff8a30, 60, 0.5);
  sound.play('boom*', { pos: wp, vol: 1 });
  sound.play('rumble', { pos: wp, vol: 0.8 });
  shake = 0.25;
}

// With animated characters the effect waits for the wind-up of the attack animation.
const LEAD = { melee: 0.3, line: 0.4, ranged: 0.3, blast: 0.4, heal: 0.35, snare: 0.4 };
const leadTime = (kind, g) => (g && g.userData.ch ? LEAD[kind] : 0);

function castFx(kind, g, a, t) {
  const dir = t.clone().sub(a).setY(0);
  if (g && dir.lengthSq() > 0) g.userData.angle = Math.atan2(-dir.x, -dir.z);
  if (g && g.userData.ch) g.userData.ch.once('attack');
  later(leadTime(kind, g), () => castFxNow(kind, g, a, t));
}

function castFxNow(kind, g, a, t) {
  const dir = t.clone().sub(a).setY(0);
  if (dir.lengthSq() > 0) dir.normalize();
  const wp = worldPos(a);
  if (kind === 'melee' || kind === 'line') {
    if (g) g.position.addScaledVector(dir, g.userData.ch ? 0.25 : 0.45); // lunge; the unit springs back on its own
    sound.play('swing*', { pos: wp, vol: 0.9 });
    sound.whoosh({ pos: wp, dur: 0.18, from: 900, to: 3000, vol: 0.25 });
    if (kind === 'melee') {
      fx.flash({ pos: a.clone().addScaledVector(dir, 0.7).setY(0.7), tex: 'slash_02', size: 1.3, life: 0.22, grow: 0.4, rotation: Math.random() * 6.28 });
    } else {
      for (const d of [1, 2]) fx.flash({ pos: a.clone().addScaledVector(dir, d).setY(0.65), tex: 'flare_01', color: 0xe8f0ff, size: 0.9, life: 0.2 + d * 0.05, grow: 0.8 });
    }
  } else if (kind === 'ranged') {
    sound.play('bow', { pos: wp, vol: 0.8, rate: 1.4 });
    sound.whoosh({ pos: wp, dur: 0.38, from: 1500, to: 600, vol: 0.3 });
    fx.projectile({ from: a.clone().setY(0.9), to: t.clone().setY(0.6), arc: 1.1, dur: 0.4, tex: 'spark_05', color: 0xfff2c0, size: 0.35, trailTex: 'circle_05', trailColor: 0xcfd8ff, trailSize: 0.12 });
  } else if (kind === 'blast') {
    sound.whoosh({ pos: wp, dur: 0.5, from: 200, to: 1200, vol: 0.6, q: 0.8 });
    fx.flash({ pos: a.clone().setY(1.1), tex: 'flare_01', color: 0xff7a20, size: 1.2, life: 0.3 });
    fx.projectile({ from: a.clone().setY(1.1), to: t.clone().setY(0.3), arc: 2.2, dur: 0.5, tex: 'fire_01', color: 0xffa040, size: 0.8, trailTex: 'flame_05', trailColor: 0xff6a20, trailSize: 0.45, onHit: () => explode(t) });
  } else if (kind === 'heal') {
    sound.play('heal*', { pos: worldPos(t), vol: 0.8 });
    fx.flash({ pos: a.clone().setY(1.0), tex: 'light_01', color: 0x7dffa8, size: 1, life: 0.4 });
    later(0.2, () => {
      fx.burst({ pos: t.clone().setY(0.2), tex: 'star_06', color: 0x7dffa8, count: 14, size: 0.28, life: 1.0, speed: 0.6, up: 2.2, drag: 1, spread: 0.4 });
      fx.flash({ pos: t.clone().setY(0.6), tex: 'twirl_01', color: 0x7dffa8, size: 1.4, life: 0.7, spin: 4 });
    });
  } else if (kind === 'snare') {
    sound.play('snare*', { pos: worldPos(t), vol: 0.7 });
    fx.projectile({ from: a.clone().setY(1.1), to: t.clone().setY(0.7), arc: 0.4, dur: 0.3, tex: 'magic_05', color: 0xc08bff, size: 0.5, trailTex: 'magic_03', trailColor: 0x9a5cff, trailSize: 0.3,
      onHit: () => {
        fx.flash({ pos: t.clone().setY(0.6), tex: 'twirl_01', color: 0xb070ff, size: 1.8, life: 0.8, spin: -5 });
        fx.burst({ pos: t.clone().setY(0.4), tex: 'magic_03', color: 0xb070ff, count: 12, size: 0.3, life: 0.9, speed: 1.2, up: 0.6, drag: 2, spread: 0.3 });
      } });
  }
}

function hitFx(g, e, kind, a) {
  if (!g || !g.parent) return;
  const p = g.position.clone(), wp = worldPos(p);
  const away = p.clone().sub(a).setY(0);
  if (away.lengthSq() > 0) away.normalize();
  g.position.addScaledVector(away, 0.22);
  if (!(g.userData.ch && g.userData.ch.once('hit'))) g.scale.setScalar(1.18);
  floatText(p, `-${e.dmg}`, '#ff6b5e');
  const armored = G.TYPES[g.userData.type].armor > 0;
  if (kind === 'blast') { sound.play('flesh*', { pos: wp, vol: 0.5 }); return; }
  sound.play(armored ? 'armor*' : kind === 'ranged' ? 'thud*' : 'flesh*', { pos: wp, vol: 1 });
  fx.flash({ pos: p.clone().setY(0.7), tex: 'spark_05', color: armored ? 0xfff0c0 : 0xff5a4a, size: 0.9, life: 0.18, grow: 0.8 });
  if (armored) fx.burst({ pos: p.clone().setY(0.7), tex: 'spark_01', color: 0xffe0a0, count: 10, size: 0.16, life: 0.6, speed: 3.5, up: 0.8, gravity: 9, drag: 0.8 });
  else fx.burst({ pos: p.clone().setY(0.7), tex: 'dirt_02', color: 0xb02a20, count: 7, size: 0.3, life: 0.5, speed: 1.6, up: 0.8, gravity: 6, additive: false, opacity: 0.8 });
}

function blockFx(g) {
  if (!g || !g.parent) return;
  const p = g.position.clone();
  g.scale.setScalar(1.12); // brace
  floatText(p, 'Blocked', '#ffffff');
  sound.play('block*', { pos: worldPos(p), vol: 1 });
  fx.flash({ pos: p.clone().setY(0.75), tex: 'star_06', size: 1.1, life: 0.2, grow: 0.9 });
  fx.burst({ pos: p.clone().setY(0.75), tex: 'spark_01', color: 0xffffff, count: 14, size: 0.16, life: 0.6, speed: 4, up: 0.7, gravity: 9, drag: 0.8 });
}

function deathFx(g) {
  if (!g) return;
  const p = g.position.clone(), wp = worldPos(p);
  sound.play('fall*', { pos: wp, vol: 1 });
  sound.play('drop', { pos: wp, vol: 0.5, delay: 0.25 });
  fx.burst({ pos: p.clone().setY(0.3), tex: 'smoke_04', color: 0x555048, count: 8, size: 0.9, life: 1.4, speed: 0.7, up: 1, drag: 1.5, grow: 1, additive: false, opacity: 0.5, spread: 0.4 });
}

function moveFx(g) {
  const p = g.position.clone(), wp = worldPos(p);
  for (let i = 0; i < 3; i++) sound.play('step*', { pos: wp, vol: 0.5, delay: i * 0.13 });
  fx.burst({ pos: p.clone().setY(0.08), tex: 'dirt_02', color: 0x8a7a66, count: 5, size: 0.4, life: 0.6, speed: 0.6, up: 0.5, drag: 2, grow: 0.8, additive: false, opacity: 0.4, spread: 0.2 });
}

// Starts the effects for one batch of server events. Returns how long (seconds) the board
// should wait before showing the result (health bars, removed units).
function playEvents(events) {
  let impact = 0, kind = null, a = null, wait = 0;
  for (const e of events) {
    const g = unitMeshes.get(e.id);
    if (e.t === 'move') { if (g) moveFx(g); }
    else if (e.t === 'act') {
      kind = e.kind;
      const t = V(tx(e.x), 0, tz(e.y));
      a = g ? g.userData.target.clone() : t.clone();
      castFx(kind, g, a, t);
      impact = leadTime(kind, g) + IMPACT_DELAY[kind]; wait = impact + 0.1;
    }
    else if (e.t === 'hit') later(impact, () => hitFx(g, e, kind, a));
    else if (e.t === 'block') later(impact, () => blockFx(g));
    else if (e.t === 'heal') later(impact, () => g && g.parent && floatText(g.position, `+${e.amt}`, '#6be08f'));
    else if (e.t === 'snare') later(impact, () => g && g.parent && floatText(g.position, 'Snared', '#d7a6ff'));
    else if (e.t === 'die') { later(impact + 0.12, () => deathFx(g)); wait = impact + 0.2; }
    else if (e.t === 'turn') { if (e.player === me) later(wait + 0.15, () => sound.play('turn', { vol: 0.5 })); }
    else if (e.t === 'over') later(wait + 0.4, () => sound.play(e.winner === me ? 'win' : 'lose', { vol: 0.7 }));
  }
  return wait;
}

// ---------------------------------------------------------------- atmosphere: braziers, dust, quality
const braziers = [];
const ironMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.9, roughness: 0.5 });
for (const [sx, sz] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) {
  const pos = V(sx * (G.COLS / 2 + 0.75), 0, sz * (G.ROWS / 2 + 0.75));
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.0, 8), ironMat);
  post.position.copy(pos).setY(0.4);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.12, 0.16, 12), ironMat);
  bowl.position.copy(pos).setY(0.95);
  post.castShadow = bowl.castShadow = true;
  post.raycast = bowl.raycast = () => {};
  world.add(post, bowl);
  fx.flame(pos.clone().setY(1.0));
  const b = { pos: pos.clone().setY(1.2), light: null };
  if (braziers.length < 2) { // two real lights (opposite corners) are enough and keep shading cheap
    b.light = new THREE.PointLight(0xff9a4a, 5, 16, 1.5);
    b.light.position.copy(b.pos);
    world.add(b.light);
  }
  braziers.push(b);
}

const MOTES = 140;
const moteGeo = new THREE.BufferGeometry();
const motePos = new Float32Array(MOTES * 3);
for (let i = 0; i < MOTES; i++) { motePos[i * 3] = (Math.random() - 0.5) * 16; motePos[i * 3 + 1] = Math.random() * 6; motePos[i * 3 + 2] = (Math.random() - 0.5) * 18; }
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ map: fx.tex.circle_05, color: 0xffd9a0, size: 0.1, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));
motes.raycast = () => {};
world.add(motes);

let quality = 'high';
try { quality = localStorage.getItem('quality') || 'high'; } catch { /* storage blocked */ }
function applyQuality() {
  const high = quality === 'high';
  sun.castShadow = high;
  motes.visible = high && !renderer.xr.isPresenting;
  if (!renderer.xr.isPresenting) renderer.setPixelRatio(high ? Math.min(devicePixelRatio, 2) : 1);
  $('qualityBtn').textContent = `Quality: ${quality}`;
}

// ---------------------------------------------------------------- UI refresh
const has = (list, x, y) => list.some(p => p.x === x && p.y === y);

function statusLines() {
  if (!state) return ['', ''];
  let l1;
  if (state.winner !== null) {
    l1 = state.winner === -1 ? 'Draw' : me < 0 ? `Player ${state.winner + 1} wins` : state.winner === me ? 'You win!' : 'You lose';
  } else if (!started) {
    l1 = `Room ${code} - waiting for opponent`;
  } else {
    const secs = deadline ? Math.max(0, Math.ceil((deadline - (Date.now() + skew)) / 1000)) : 0;
    const who = me < 0 ? `Player ${state.turn + 1}'s turn` : myTurn() ? 'Your turn' : "Opponent's turn";
    l1 = `${who} - ${secs}s`;
    if (me >= 0 && !present[1 - me]) l1 += ' (opponent offline)';
  }
  let l2 = `Room ${code}` + (me < 0 ? ' - spectating' : '');
  const u = inspected && G.unitById(state, inspected);
  if (u) {
    const t = G.TYPES[u.type];
    l2 = `${t.name}: HP ${u.hp}/${t.hp}, power ${t.pow}, armour ${t.armor}%, block ${t.block}%, move ${t.move}, rest ${t.rec}`;
  }
  return [l1, l2];
}

function refresh() {
  if (!state) return;
  const sel = selected && G.unitById(state, selected);
  const usable = sel && G.canUse(state, me, sel);
  const moves = usable && !(state.active && state.active.moved) ? G.reachable(state, sel) : [];
  const hits = usable && !(state.active && state.active.acted) ? G.targets(state, sel) : [];
  const heal = sel && G.TYPES[sel.type].kind === 'heal';
  for (const m of tiles) {
    const { x, y } = m.userData.pick;
    let c = (x + y) % 2 ? 0xd8d4cc : 0x8f8b85, e = 0x000000; // tints multiply the stone texture
    if (sel && sel.x === x && sel.y === y) { c = 0xffe08a; e = 0x5a4600; }
    else if (has(hits, x, y)) { c = heal ? 0xa8ffc4 : 0xff9a9a; e = heal ? 0x0f5a2a : 0x7a1010; }
    else if (has(moves, x, y)) { c = 0x9cc0ff; e = 0x12409a; }
    m.material.color.setHex(c);
    m.material.emissive.setHex(e);
  }
  arrowsGroup.visible = !!usable;
  if (usable) arrowsGroup.position.set(tx(sel.x), 0, tz(sel.y));
  endButton3D.visible = myTurn();
  $('endBtn').disabled = !myTurn();
  $('endBtn').textContent = state.active ? 'End turn' : 'Pass turn';
  $('quitBtn').textContent = state.winner !== null || me < 0 ? 'Leave' : 'Surrender';
  const [l1, l2] = statusLines();
  drawStatus(l1, l2);
  $('status').textContent = l1;
  const u = inspected && G.unitById(state, inspected);
  $('info').innerHTML = u ? `<b>${G.TYPES[u.type].name}</b> - ${l2.split(': ')[1]}. ${G.TYPES[u.type].info}` :
    (myTurn() ? 'Pick one of your units, move (blue), act (red), then tap a yellow arrow to choose its facing and end the turn.' : '');
}

// ---------------------------------------------------------------- input
function sendAction(action) { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'act', action })); }

function handlePick(p) {
  if (!state) return;
  if (!p) { if (!state.active) selected = null; inspected = null; refresh(); return; }
  if (p.kind === 'recenter') { needPlace = true; return; }
  if (p.kind === 'end') { if (myTurn()) { sound.play('end', { vol: 0.5 }); sendAction({ type: 'end' }); } return; }
  if (p.kind === 'face') { if (myTurn() && selected) { sound.play('end', { vol: 0.5 }); sendAction({ type: 'end', unit: selected, facing: p.dir }); } return; }
  let x, y;
  if (p.kind === 'unit') { const u = G.unitById(state, p.id); if (!u) return; x = u.x; y = u.y; }
  else { x = p.x; y = p.y; }
  const u = G.unitAt(state, x, y);
  const sel = selected && G.unitById(state, selected);
  if (sel && G.canUse(state, me, sel)) {
    if (!(state.active && state.active.acted) && has(G.targets(state, sel), x, y)) return sendAction({ type: 'act', unit: sel.id, x, y });
    if (!u && !(state.active && state.active.moved) && has(G.reachable(state, sel), x, y)) return sendAction({ type: 'move', unit: sel.id, x, y });
  }
  if (u) {
    inspected = u.id;
    if (G.canUse(state, me, u)) { if (selected !== u.id) sound.play('select', { vol: 0.4 }); selected = u.id; }
    else if (!state.active) selected = null;
  } else {
    inspected = null;
    if (!state.active) selected = null;
  }
  refresh();
}

const raycaster = new THREE.Raycaster();
function pickFromRay() {
  for (const h of raycaster.intersectObjects(pickRoots, true)) {
    let o = h.object, hidden = false;
    for (let p = o; p; p = p.parent) if (!p.visible) hidden = true;
    if (hidden) continue;
    while (o && !o.userData.pick) o = o.parent;
    if (o) return { pick: o.userData.pick, point: h.point };
  }
  return null;
}

let downAt = null;
renderer.domElement.addEventListener('pointerdown', e => { sound.init(); downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt || renderer.xr.isPresenting) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return; // that was a camera drag
  raycaster.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = pickFromRay();
  handlePick(hit && hit.pick);
});

$('endBtn').onclick = () => { sound.play('end', { vol: 0.5 }); sendAction({ type: 'end' }); };
$('soundBtn').onclick = () => { sound.init(); sound.setMuted(!sound.muted); $('soundBtn').textContent = sound.muted ? 'Sound off' : 'Sound on'; };
$('soundBtn').textContent = sound.muted ? 'Sound off' : 'Sound on';
$('qualityBtn').onclick = () => {
  quality = quality === 'high' ? 'low' : 'high';
  try { localStorage.setItem('quality', quality); } catch { /* storage blocked */ }
  applyQuality();
};
applyQuality();
$('quitBtn').onclick = () => {
  if (state && state.winner === null && me >= 0) {
    if (confirm('Surrender this match?')) sendAction({ type: 'surrender' });
  } else {
    location.href = location.pathname;
  }
};
$('copyBtn').onclick = async () => {
  const link = `${location.origin}${location.pathname}?room=${code}`;
  try { await navigator.clipboard.writeText(link); $('copyBtn').textContent = 'Link copied'; }
  catch { prompt('Share this link with your opponent:', link); }
};

// ---------------------------------------------------------------- AR (Quest passthrough)
let needPlace = false, xrFrames = 0, grab = null;
const controllers = [];
const tmpM = new THREE.Matrix4(), tmpV = new THREE.Vector3();

function rayFromController(c) {
  tmpM.identity().extractRotation(c.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmpM);
}

for (const i of [0, 1]) {
  const c = renderer.xr.getController(i);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
  line.scale.z = 1.5;
  c.add(line);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd23a }));
  dot.visible = false;
  scene.add(dot);
  c.userData = { line, dot };
  c.addEventListener('select', () => { sound.init(); rayFromController(c); const hit = pickFromRay(); handlePick(hit && hit.pick); });
  c.addEventListener('squeezestart', () => { grab = { c, offset: world.position.clone().sub(tmpV.setFromMatrixPosition(c.matrixWorld)) }; });
  c.addEventListener('squeezeend', () => { if (grab && grab.c === c) grab = null; });
  c.visible = false;
  scene.add(c);
  controllers.push(c);
}

function placeBoardInFront() {
  const pos = new THREE.Vector3(), dir = new THREE.Vector3();
  const cam = renderer.xr.getCamera();
  cam.getWorldPosition(pos);
  cam.getWorldDirection(dir);
  dir.y = 0;
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1);
  dir.normalize();
  world.position.copy(pos).addScaledVector(dir, 0.55);
  world.position.y = Math.max(0.4, pos.y - 0.5);
  world.rotation.y = Math.atan2(-dir.x, -dir.z) + (me === 1 ? Math.PI : 0); // your own rows end up nearest you
}

renderer.xr.addEventListener('sessionstart', () => {
  scene.background = null;
  scene.fog = null;
  table.visible = false;
  motes.visible = false;
  world.scale.setScalar(AR_SCALE);
  setShadowScale(AR_SCALE);
  sound.refDistance = 0.7;
  controls.enabled = false;
  panel.visible = true;
  controllers.forEach(c => { c.visible = true; });
  needPlace = true; xrFrames = 0;
});
renderer.xr.addEventListener('sessionend', () => {
  scene.background = BG;
  scene.fog = FOG;
  table.visible = true;
  world.scale.setScalar(1);
  setShadowScale(1);
  sound.refDistance = 14;
  applyQuality();
  world.position.set(0, 0, 0);
  world.rotation.y = 0;
  controls.enabled = true;
  panel.visible = false;
  controllers.forEach(c => { c.visible = false; c.userData.dot.visible = false; });
  grab = null;
  resetCamera();
});

if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-ar').then(ok => { $('arBtn').hidden = !ok; }).catch(() => {});
}
$('arBtn').onclick = async () => {
  try {
    sound.init();
    const session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'], optionalFeatures: ['hand-tracking'] });
    await renderer.xr.setSession(session);
  } catch (err) { alert('Could not start AR: ' + err.message); }
};

// ---------------------------------------------------------------- render loop
function resetCamera() {
  camera.position.set(0, 10, me === 1 ? -10.5 : 10.5);
  controls.target.set(0, 0, 0);
  controls.update();
}

const clock = new THREE.Clock();
const ONE = new THREE.Vector3(1, 1, 1), camPos = new THREE.Vector3(), camDir = new THREE.Vector3(), camUp = new THREE.Vector3();
let nextCrackle = 0;
let lastSecond = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const k = 1 - Math.exp(-7 * dt), now = clock.elapsedTime;
  for (const g of unitMeshes.values()) {
    const far = Math.hypot(g.position.x - g.userData.target.x, g.position.z - g.userData.target.z);
    g.position.lerp(g.userData.target, k);
    const ch = g.userData.ch;
    if (ch) { ch.setMoving(far > 0.12); ch.update(dt); }
    else if (far > 0.12) g.position.y = Math.abs(Math.sin(now * 13 + g.id)) * 0.14; // walking bob
    g.scale.lerp(ONE, k);
    let d = g.userData.angle - g.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.rotation.y += d * k;
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const s = floaters[i];
    s.userData.life -= dt;
    s.position.y += dt * 0.9;
    s.material.opacity = Math.min(1, s.userData.life * 2);
    if (s.userData.life <= 0) { world.remove(s); s.material.map.dispose(); s.material.dispose(); floaters.splice(i, 1); }
  }
  arrowsGroup.children.forEach(a => { a.position.y = 2.1 + Math.sin(clock.elapsedTime * 4) * 0.06; });
  for (let i = dying.length - 1; i >= 0; i--) { // fall over, lie there, then shrink away
    const d = dying[i];
    d.t += dt;
    const f = Math.min(1, d.t / 0.6), ch = d.g.userData.ch, hold = ch ? 2.6 : 1.2;
    if (ch) ch.update(dt); // plays its own death animation
    else { d.g.rotation.x = -f * f * 1.45; d.g.position.y = 0.12 * f; }
    if (d.t > hold) d.g.scale.setScalar(Math.max(0.01, 1 - (d.t - hold) / 0.5));
    if (d.t > hold + 0.5) { unitsGroup.remove(d.g); dying.splice(i, 1); }
  }
  fx.update(dt);
  for (let i = 0; i < braziers.length; i++) {
    const l = braziers[i].light;
    if (l) l.intensity = 5 * (0.82 + 0.12 * Math.sin(now * 11 + i * 2) + 0.08 * Math.sin(now * 23.7 + i));
  }
  if (motes.visible) {
    for (let i = 0; i < MOTES; i++) {
      motePos[i * 3 + 1] += dt * 0.12;
      motePos[i * 3] += Math.sin(now * 0.3 + i) * dt * 0.05;
      if (motePos[i * 3 + 1] > 6) motePos[i * 3 + 1] = 0;
    }
    moteGeo.attributes.position.needsUpdate = true;
  }
  if (now > nextCrackle) {
    nextCrackle = now + 0.1 + Math.random() * 0.5;
    sound.crackle(worldPos(braziers[Math.floor(Math.random() * braziers.length)].pos));
  }
  const viewCam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  viewCam.getWorldPosition(camPos);
  viewCam.getWorldDirection(camDir);
  camUp.set(0, 1, 0).applyQuaternion(viewCam.quaternion);
  sound.setListener(camPos, camDir, camUp);

  if (renderer.xr.isPresenting) {
    xrFrames++;
    if (needPlace && xrFrames > 10) { placeBoardInFront(); needPlace = false; }
    if (grab) world.position.copy(tmpV.setFromMatrixPosition(grab.c.matrixWorld)).add(grab.offset);
    for (const c of controllers) {
      rayFromController(c);
      const hit = pickFromRay();
      c.userData.dot.visible = !!hit;
      if (hit) c.userData.dot.position.copy(hit.point);
    }
  } else {
    controls.update();
    if (shake > 0) { // explosion rattles the table (flat view only)
      shake = Math.max(0, shake - dt);
      world.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake * 0.6, (Math.random() - 0.5) * shake);
      if (shake === 0) world.position.set(0, 0, 0);
    }
  }
  const sec = Math.floor(Date.now() / 1000);
  if (sec !== lastSecond) { lastSecond = sec; refresh(); } // keeps the turn clock ticking
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  if (renderer.xr.isPresenting) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------- network + lobby
function connect(first) {
  const query = first.t === 'create' ? 'create=1' : 'room=' + encodeURIComponent(first.code);
  ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/chess/ws?' + query);
  ws.onopen = () => ws.send(JSON.stringify(first));
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.t === 'error') {
      if (!code) { $('lobbyMsg').textContent = m.msg; ws.close(); }
      return;
    }
    if (m.t === 'joined') {
      const firstJoin = code === null;
      code = m.code; me = m.you;
      $('lobby').style.display = 'none';
      $('hud').style.display = 'flex';
      history.replaceState(null, '', `${location.pathname}?room=${code}`);
      placePanel();
      if (firstJoin) resetCamera();
      return;
    }
    if (m.t === 'state') {
      const turnChanged = !state || state.turn !== m.state.turn;
      const wait = playEvents(m.events || []);
      state = m.state;
      started = m.started; present = m.present; deadline = m.deadline; skew = m.now - Date.now();
      if (state.active && myTurn()) selected = state.active.id;
      else if (turnChanged || state.winner !== null) selected = null;
      if (wait > 0) setTimeout(() => { syncUnits(); refresh(); }, wait * 1000); // let the hit land first
      else syncUnits();
      refresh();
    }
  };
  ws.onclose = () => {
    if (code) setTimeout(() => connect({ t: 'join', code, token }), 1500); // rejoin the same seat
  };
}

$('createBtn').onclick = () => { sound.init(); $('lobbyMsg').textContent = ''; connect({ t: 'create', token }); };
$('joinBtn').onclick = () => {
  sound.init();
  const c = $('codeInput').value.trim().toUpperCase();
  if (c.length !== 4) { $('lobbyMsg').textContent = 'Enter the 4-letter room code'; return; }
  $('lobbyMsg').textContent = '';
  connect({ t: 'join', code: c, token });
};
$('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('joinBtn').click(); });

const roomParam = new URLSearchParams(location.search).get('room');
if (roomParam) { $('codeInput').value = roomParam.toUpperCase(); $('joinBtn').click(); }

// Load the animated characters in the background; rebuild any stand-in units once they arrive.
loadCharacters().then(() => {
  for (const g of unitMeshes.values()) unitsGroup.remove(g);
  unitMeshes.clear();
  if (state) { syncUnits(); refresh(); }
}).catch(err => console.warn('Character models failed to load; using simple shapes.', err));

// Hooks for automated tests.
window.__t = { handlePick, castFx, explode, V, camera, controls, fx, sun, renderer, scene, get state() { return state; }, get me() { return me; }, get code() { return code; }, get selected() { return selected; } };
