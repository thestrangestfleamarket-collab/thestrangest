// SKIRMISH TABLE's page (/chess): the board, its pieces, the screen and AR controls, and the link to the match's room
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as G from './game.js';
import { makeWood, makeEnvironment, makeBackdrop } from './procedural.js';
import { makeBoard } from './board.js';
import { makeLand } from './land.js';
import { LEVELS } from './ai.js';
import { CAMPAIGN, nodeOf, budgetFor, isOpen, finished } from './campaign.js';
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
let selected = null, inspected = null, inspectedTile = null;
let solo = null, campNode = null, camp = { done: [] }, company = [], overland = false, campSel = null, companyTried = false, afterShown = false;
let held = null, setupSel = null, ready = [false, false], seated = [false, false], teams = [], teamAt = -1, setupNote = '', signedIn = false;

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
const inSetup = () => !!state && state.phase === 'setup' && me >= 0 && state.winner === null;

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
const HALL_BG = makeBackdrop();
let BG = HALL_BG;
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
controls.maxDistance = 44;
controls.enablePan = false;

const world = new THREE.Group(); // everything that sits on the table
scene.add(world);

// Lighting: a warm key light with shadows (parented to the board so it follows it in AR), plus a dim cool fill.
const hemi = new THREE.HemisphereLight(0x8fa0c0, 0x2a2018, 0.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2c0, 3.0);
sun.position.set(8, 9, 1); // from the side, so shadows are visible from both players' seats
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
world.add(sun, sun.target);
let shadowExtent = 9;
function setShadowScale(k) { // shadow volume is in real units, so it must shrink with the board in AR
  const c = sun.shadow.camera;
  const e = shadowExtent;
  c.left = -e * k; c.right = e * k; c.top = e * k; c.bottom = -e * k; c.near = 1 * k; c.far = (e > 9 ? 44 : 32) * k;
  c.updateProjectionMatrix();
  sun.shadow.normalBias = 0.03 * k;
  sun.shadow.bias = -0.0004;
}
setShadowScale(1);
const fieldGroup = new THREE.Group(), unitsGroup = new THREE.Group(), arrowsGroup = new THREE.Group(), panel = new THREE.Group();
world.add(fieldGroup, unitsGroup, arrowsGroup, panel);
const nodesGroup = new THREE.Group(); // the campaign's banners on its overland map
world.add(nodesGroup);
const pickRoots = [fieldGroup, unitsGroup, arrowsGroup, panel, nodesGroup];

// The battlefield: the plain board or a landscaped map (maps.js), built when the match's state first names it.
let cols = G.COLS, rows = G.ROWS, field = null;
const tx = x => x - (cols - 1) / 2;
const tz = y => y - (rows - 1) / 2;
const ty = (x, y) => (field ? field.yAt(x, y) : 0);
// A big round table under the board, only for the flat-screen view (in AR your real table does this job).
const tableWood = makeWood(23);
for (const t of Object.values(tableWood)) t.repeat.set(5, 5);
const table = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 0.4, 56), new THREE.MeshStandardMaterial({ ...tableWood, color: 0x9a8a7a }));
table.position.y = -0.55;
table.receiveShadow = true;
table.raycast = () => {};
world.add(table);

const HALL = { sun: [0xffe2c0, 3.0], dir: [8, 9, 1], hemi: [0x8fa0c0, 0x2a2018, 0.25], fog: [0x0a0b0e, 0.018], exposure: 1.05, env: 0.28, mote: 0xffd9a0 };
function skyBackdrop(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 256;
  const ctx = canvas.getContext('2d'), g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, stops[0]); g.addColorStop(0.5, stops[1]); g.addColorStop(0.68, stops[2]); g.addColorStop(0.8, '#2a2622'); g.addColorStop(1, '#0c0b0a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
// The hour's light for the map on the table: sun, sky light, haze and backdrop.
function applyLook() {
  const L = (field && field.look) || HALL, land = !!(field && field.land), ar = renderer.xr.isPresenting;
  sun.color.setHex(L.sun[0]); sun.intensity = L.sun[1];
  sun.position.set(...L.dir); if (land) sun.position.normalize().multiplyScalar(18);
  hemi.color.setHex(L.hemi[0]); hemi.groundColor.setHex(L.hemi[1]); hemi.intensity = L.hemi[2];
  FOG.color.setHex(L.fog[0]); FOG.density = L.fog[1];
  BG = land ? skyBackdrop(L.sky) : HALL_BG;
  scene.background = ar ? null : BG;
  renderer.toneMappingExposure = L.exposure;
  scene.environmentIntensity = L.env;
  shadowExtent = land ? Math.hypot(cols + 2 * field.border, rows + 2 * field.border) / 2 + 0.5 : 9;
  setShadowScale(world.scale.x);
  if (field) field.setFog(ar ? 0 : L.fog[1]);
}
function setField(id, own) {
  if (!own && !G.MAPS[id]) id = 'board';
  if (field && field.id === id) return;
  if (field) field.dispose();
  const m = own || G.MAPS[id];
  cols = m.cols; rows = m.rows;
  field = (m.tiles ? makeLand : makeBoard)(m, { fx, id });
  fieldGroup.add(field.group);
  applyLook(); applyQuality(); placePanel();
  motes.material.color.setHex(((field.look || HALL).mote));
  if (!renderer.xr.isPresenting) resetCamera();
  ambience();
}
// The map's standing sounds, where they are in the room: the river, the birds, the leaves.
function ambience() {
  if (!field) return;
  sound.ambience({ river: field.river && worldPos(field.river), birds: field.look && field.look.birds && field.woods ? worldPos(field.woods) : null, leaves: field.woods && worldPos(field.woods) });
}

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
  g.userData = { ch, type: u.type, pick: { kind: 'unit', id: u.id }, label, key: '', target: new THREE.Vector3(tx(u.x), ty(u.x, u.y), tz(u.y)), angle: FACE_ANGLE[u.facing] };
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
    if (g && g.userData.type !== u.type) { unitsGroup.remove(g); unitMeshes.delete(u.id); g = null; }
    if (!g) { g = buildUnit(u); unitMeshes.set(u.id, g); unitsGroup.add(g); }
    g.userData.target.set(tx(u.x), ty(u.x, u.y), tz(u.y));
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
    if (!alive.has(id) && state.phase === 'setup') { unitMeshes.delete(id); unitsGroup.remove(g); continue; }
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

function makeButton(text, color, x, pick, w = 2.3, z = 1.25) {
  const t = textTexture(Math.round(w / 0.86 * 96), 96), side = new THREE.MeshStandardMaterial({ color }), top = new THREE.MeshBasicMaterial({ map: t.tex });
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, 0.86), [side, side, top, side, side, side]);
  b.position.set(x, 0.05, z);
  b.userData.pick = typeof pick === 'string' ? { kind: pick } : pick;
  b.userData.label = (text, color, small) => {
    const key = text + color + small; if (b.userData.key === key) return; b.userData.key = key;
    const W = t.canvas.width, c = t.ctx, lines = String(text).split('\n');
    c.fillStyle = color; c.fillRect(0, 0, W, 96); side.color.set(color);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => { c.font = `bold ${lines.length > 1 ? (i ? 24 : 26) : 38}px system-ui, sans-serif`; c.fillText(l, W / 2, lines.length > 1 ? 30 + i * 36 : 50, W - 10); });
    t.tex.needsUpdate = true;
  };
  b.userData.label(text, color);
  panel.add(b);
  return b;
}
const endButton3D = makeButton('END TURN', '#2f6fed', -1.3, 'end');
const fight3D = makeButton('FIGHT', '#2f8f4a', 0, 'fight', 2.3, 2.2), after3D = makeButton('MAP', '#2f6fed', 0, 'after', 2.3, 2.2);
fight3D.visible = after3D.visible = false;
const recenterButton3D = makeButton('RECENTER', '#3a404b', 1.3, 'recenter');
// Setting out, in the headset: a chip a unit type, then REMOVE, DEFAULT, SAVED (the next saved team) and READY.
const chips3D = Object.keys(G.TYPES).map((type, i) => makeButton('', '#3a404b', (i - 3) * 1.0, { kind: 'chip', type }, 0.95, 2.2));
const setup3D = [['remove', 'REMOVE'], ['default', 'DEFAULT'], ['saved', 'SAVED'], ['ready', 'READY']].map(([act, text], i) => makeButton(text, '#3a404b', (i - 1.5) * 1.75, { kind: 'setup', act }, 1.65, 3.15));

function placePanel() {
  const seat = me === 1 ? 1 : 0;
  panel.rotation.y = seat === 1 ? Math.PI : 0;
  panel.position.set(0, 0, (seat === 1 ? -1 : 1) * (rows / 2 + (field ? field.border : 0.35) + 0.15));
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
  s.position.copy(pos).setY(pos.y + 2.0);
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
const up = (v, h) => v.clone().setY(v.y + h); // a point this high above the ground under v
const worldPos = local => world.localToWorld(local.clone()); // board space -> room space, for 3D audio
const later = (t, fn) => (t > 0 ? setTimeout(fn, t * 1000) : fn());
const IMPACT_DELAY = { melee: 0.16, line: 0.18, ranged: 0.4, blast: 0.5, heal: 0.25, snare: 0.3 };
let shake = 0;

function explode(t) {
  const wp = worldPos(t);
  fx.flash({ pos: up(t, 0.5), tex: 'light_01', color: 0xffc070, size: 3.5, life: 0.25, grow: 0.8 });
  fx.burst({ pos: up(t, 0.2), tex: 'fire_01', color: 0xff8a30, count: 22, size: 0.9, life: 0.6, speed: 2.6, up: 0.9, drag: 3, grow: 0.8, spread: 0.8 });
  fx.burst({ pos: up(t, 0.3), tex: 'spark_01', color: 0xffd080, count: 18, size: 0.22, life: 0.9, speed: 5, up: 0.9, gravity: 9, drag: 0.6 });
  fx.burst({ pos: up(t, 0.3), tex: 'smoke_07', color: 0x2a2622, count: 9, size: 1.2, life: 1.8, speed: 0.8, up: 1.4, drag: 1, grow: 1.2, additive: false, opacity: 0.55, spread: 0.8 });
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
      fx.flash({ pos: up(a, 0.7).addScaledVector(dir, 0.7), tex: 'slash_02', size: 1.3, life: 0.22, grow: 0.4, rotation: Math.random() * 6.28 });
    } else {
      for (const d of [1, 2]) fx.flash({ pos: up(a, 0.65).addScaledVector(dir, d), tex: 'flare_01', color: 0xe8f0ff, size: 0.9, life: 0.2 + d * 0.05, grow: 0.8 });
    }
  } else if (kind === 'ranged') {
    sound.play('bow', { pos: wp, vol: 0.8, rate: 1.4 });
    sound.whoosh({ pos: wp, dur: 0.38, from: 1500, to: 600, vol: 0.3 });
    fx.projectile({ from: up(a, 0.9), to: up(t, 0.6), arc: 1.1, dur: 0.4, tex: 'spark_05', color: 0xfff2c0, size: 0.35, trailTex: 'circle_05', trailColor: 0xcfd8ff, trailSize: 0.12 });
  } else if (kind === 'blast') {
    sound.whoosh({ pos: wp, dur: 0.5, from: 200, to: 1200, vol: 0.6, q: 0.8 });
    fx.flash({ pos: up(a, 1.1), tex: 'flare_01', color: 0xff7a20, size: 1.2, life: 0.3 });
    fx.projectile({ from: up(a, 1.1), to: up(t, 0.3), arc: 2.2, dur: 0.5, tex: 'fire_01', color: 0xffa040, size: 0.8, trailTex: 'flame_05', trailColor: 0xff6a20, trailSize: 0.45, onHit: () => explode(t) });
  } else if (kind === 'heal') {
    sound.play('heal*', { pos: worldPos(t), vol: 0.8 });
    fx.flash({ pos: up(a, 1.0), tex: 'light_01', color: 0x7dffa8, size: 1, life: 0.4 });
    later(0.2, () => {
      fx.burst({ pos: up(t, 0.2), tex: 'star_06', color: 0x7dffa8, count: 14, size: 0.28, life: 1.0, speed: 0.6, up: 2.2, drag: 1, spread: 0.4 });
      fx.flash({ pos: up(t, 0.6), tex: 'twirl_01', color: 0x7dffa8, size: 1.4, life: 0.7, spin: 4 });
    });
  } else if (kind === 'snare') {
    sound.play('snare*', { pos: worldPos(t), vol: 0.7 });
    fx.projectile({ from: up(a, 1.1), to: up(t, 0.7), arc: 0.4, dur: 0.3, tex: 'magic_05', color: 0xc08bff, size: 0.5, trailTex: 'magic_03', trailColor: 0x9a5cff, trailSize: 0.3,
      onHit: () => {
        fx.flash({ pos: up(t, 0.6), tex: 'twirl_01', color: 0xb070ff, size: 1.8, life: 0.8, spin: -5 });
        fx.burst({ pos: up(t, 0.4), tex: 'magic_03', color: 0xb070ff, count: 12, size: 0.3, life: 0.9, speed: 1.2, up: 0.6, drag: 2, spread: 0.3 });
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
  fx.flash({ pos: up(p, 0.7), tex: 'spark_05', color: armored ? 0xfff0c0 : 0xff5a4a, size: 0.9, life: 0.18, grow: 0.8 });
  if (armored) fx.burst({ pos: up(p, 0.7), tex: 'spark_01', color: 0xffe0a0, count: 10, size: 0.16, life: 0.6, speed: 3.5, up: 0.8, gravity: 9, drag: 0.8 });
  else fx.burst({ pos: up(p, 0.7), tex: 'dirt_02', color: 0xb02a20, count: 7, size: 0.3, life: 0.5, speed: 1.6, up: 0.8, gravity: 6, additive: false, opacity: 0.8 });
}

function blockFx(g) {
  if (!g || !g.parent) return;
  const p = g.position.clone();
  g.scale.setScalar(1.12); // brace
  floatText(p, 'Blocked', '#ffffff');
  sound.play('block*', { pos: worldPos(p), vol: 1 });
  fx.flash({ pos: up(p, 0.75), tex: 'star_06', size: 1.1, life: 0.2, grow: 0.9 });
  fx.burst({ pos: up(p, 0.75), tex: 'spark_01', color: 0xffffff, count: 14, size: 0.16, life: 0.6, speed: 4, up: 0.7, gravity: 9, drag: 0.8 });
}

function deathFx(g) {
  if (!g) return;
  const p = g.position.clone(), wp = worldPos(p);
  sound.play('fall*', { pos: wp, vol: 1 });
  sound.play('drop', { pos: wp, vol: 0.5, delay: 0.25 });
  fx.burst({ pos: up(p, 0.3), tex: 'smoke_04', color: 0x555048, count: 8, size: 0.9, life: 1.4, speed: 0.7, up: 1, drag: 1.5, grow: 1, additive: false, opacity: 0.5, spread: 0.4 });
}

// Footsteps by the ground stepped onto: soft in grass, a rustle in the wood, hollow on the bridge, a splash in the ford.
const STEP = { '.': [0.82, 0.4], f: [0.78, 0.4], d: [1, 0.5], b: [1.3, 0.6], s: [0.7, 0.3] };
function moveFx(g, e) {
  const p = g.position.clone(), wp = worldPos(p), k = field && field.land ? field.ground(e.x, e.y) : null, [rate, vol] = STEP[k] || [1, 0.5];
  for (let i = 0; i < 3; i++) {
    sound.play('step*', { pos: wp, vol, rate, delay: i * 0.13 });
    if (k === 's') sound.whoosh({ pos: wp, dur: 0.22, from: 2600, to: 500, vol: 0.22, q: 0.6, delay: i * 0.13 + 0.03 });
    else if (k === 'f' || k === '.') sound.whoosh({ pos: wp, dur: 0.12, from: 5000, to: 2500, vol: 0.05, q: 0.5, delay: i * 0.13 });
    else if (k === 'b') sound.play('thud*', { pos: wp, vol: 0.12, rate: 1.5, delay: i * 0.13 });
  }
  fx.burst({ pos: up(p, 0.08), tex: 'dirt_02', color: 0x8a7a66, count: 5, size: 0.4, life: 0.6, speed: 0.6, up: 0.5, drag: 2, grow: 0.8, additive: false, opacity: 0.4, spread: 0.2 });
}

// Starts the effects for one batch of server events. Returns how long (seconds) the board
// should wait before showing the result (health bars, removed units).
function playEvents(events) {
  let impact = 0, kind = null, a = null, wait = 0;
  for (const e of events) {
    const g = unitMeshes.get(e.id);
    if (e.t === 'move') { if (g) moveFx(g, e); }
    else if (e.t === 'act') {
      kind = e.kind;
      const t = V(tx(e.x), ty(e.x, e.y), tz(e.y));
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

// ---------------------------------------------------------------- atmosphere: dust, quality
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
  if (field) field.setDetail(high, renderer.xr.isPresenting);
  if (!renderer.xr.isPresenting) renderer.setPixelRatio(high ? Math.min(devicePixelRatio, 2) : 1);
  $('qualityBtn').textContent = `Quality: ${quality}`;
}

// ---------------------------------------------------------------- UI refresh
const has = (list, x, y) => list.some(p => p.x === x && p.y === y);

function groundLine(x, y) {
  const g = G.ground(state, x, y), h = G.high(state, x, y);
  return g.name + (h ? `, level ${h}` : '') + (g.info ? ': ' + g.info : '') + (h ? ' High ground: +1 reach at targets below, +1 move point to climb.' : '');
}
function statusLines() {
  if (!state) return ['', ''];
  let l1;
  if (state.winner !== null) {
    l1 = state.winner === -1 ? 'Draw' : me < 0 ? `Player ${state.winner + 1} wins` : state.winner === me ? 'You win!' : 'You lose';
  } else if (state.phase === 'setup') {
    l1 = me < 0 ? `Room ${code} - the sides are setting out` : ready[me] ? `Ready - waiting for ${seated[1 - me] ? 'the other side' : 'an opponent'}` : `Choose your team - ${G.teamCost(state.units)}/${state.budget ?? G.BUDGET} points`;
  } else if (!started) {
    l1 = `Room ${code} - waiting for opponent`;
  } else {
    const secs = deadline ? Math.max(0, Math.ceil((deadline - (Date.now() + skew)) / 1000)) : 0;
    const who = me < 0 ? `Player ${state.turn + 1}'s turn` : myTurn() ? 'Your turn' : solo ? 'The computer is moving' : "Opponent's turn";
    l1 = deadline ? `${who} - ${secs}s` : who;
    if (me >= 0 && !present[1 - me]) l1 += ' (opponent offline)';
  }
  let l2 = campNode ? nodeOf(campNode).name : solo ? `Against the computer (${LEVELS[solo].name})` : `Room ${code}` + (me < 0 ? ' - spectating' : '');
  const u = inspected && G.unitById(state, inspected);
  if (u) {
    const t = G.TYPES[u.type];
    l2 = `${t.name}: HP ${u.hp}/${t.hp}, power ${t.pow}, armour ${t.armor}%, block ${t.block}%, move ${t.move}, rest ${t.rec}`;
  } else if (inspectedTile) l2 = groundLine(inspectedTile.x, inspectedTile.y);
  return [l1, l2];
}

function refresh() {
  if (overland) return drawCamp();
  if (!state || !field) return;
  const setup = inSetup();
  const sel = setup ? setupSel && G.unitById(state, setupSel) : selected && G.unitById(state, selected);
  const usable = !setup && sel && G.canUse(state, me, sel);
  const moves = usable && !(state.active && state.active.moved) ? G.reachable(state, sel) : [];
  const hits = usable && !(state.active && state.active.acted) ? G.targets(state, sel) : [];
  const heal = sel && G.TYPES[sel.type].kind === 'heal';
  const keep = [];
  field.clear();
  if (setup && !ready[me] && (held || sel)) for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (G.inZone(state, me, y) && !G.ground(state, x, y).solid && !G.unitAt(state, x, y)) { field.mark(x, y, 'move'); keep.push(x + ',' + y); }
  for (const p of moves) { field.mark(p.x, p.y, 'move'); keep.push(p.x + ',' + p.y); }
  for (const p of hits) field.mark(p.x, p.y, heal ? 'heal' : 'hit');
  if (sel) field.mark(sel.x, sel.y, 'sel');
  field.flush();
  for (const u of state.units) keep.push(u.x + ',' + u.y);
  field.cut(keep);
  arrowsGroup.visible = !!usable;
  if (usable) arrowsGroup.position.set(tx(sel.x), ty(sel.x, sel.y), tz(sel.y));
  endButton3D.visible = myTurn();
  drawSetup(setup);
  $('endBtn').disabled = !myTurn(); $('endBtn').hidden = setup;
  $('endBtn').textContent = state.active ? 'End turn' : 'Pass turn';
  $('quitBtn').textContent = state.winner !== null || me < 0 ? 'Leave' : 'Surrender';
  const [l1, l2] = statusLines();
  drawStatus(l1, l2);
  $('status').textContent = l1;
  const u = inspected && G.unitById(state, inspected);
  const ht = setup && held && G.TYPES[held];
  $('info').innerHTML = ht ? `<b>${ht.name}</b> - ${ht.cost} points, at most ${ht.limit}: HP ${ht.hp}, power ${ht.pow}, armour ${ht.armor}%, block ${ht.block}%, move ${ht.move}, rest ${ht.rec}. ${ht.info}` : u ? `<b>${G.TYPES[u.type].name}</b> - ${l2.split(': ')[1]}. ${G.TYPES[u.type].info}` : inspectedTile && field.land ? l2 :
    setup ? (ready[me] ? 'You are ready. Stand down to change your team.' : 'Pick a unit type, then a tile on your own rows to place it. Tap a placed unit to move or remove it. READY when done.') :
    (myTurn() ? 'Pick one of your units, move (blue), act (red), then tap a yellow arrow to choose its facing and end the turn.' : '');
}

// ---------------------------------------------------------------- input
function sendAction(action) { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'act', action })); }

function handlePick(p) {
  if (p && p.kind === 'after') return afterGo();
  if (overland) {
    if (p && p.kind === 'recenter') { needPlace = true; return; }
    if (p && p.kind === 'fight') return startBattle();
    if (p && p.kind === 'node') { if (campSel !== p.id) sound.play('select', { vol: 0.4 }); campSel = p.id; } else campSel = null;
    return drawCamp();
  }
  if (!state) return;
  if (inSetup() && !(p && p.kind === 'recenter')) return setupPick(p);
  if (!p) { if (!state.active) selected = null; inspected = null; inspectedTile = null; refresh(); return; }
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
  inspectedTile = u ? null : { x, y };
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

// ---------------------------------------------------------------- setting out: a team under the budget, placed on your own rows
const myTeam = () => state.units.filter(u => u.owner === me).map(u => ({ type: u.type, x: u.x, y: u.y }));
function sendTeam(units) {
  const e = G.checkTeam(state, me, units);
  setupNote = e || '';
  if (e) { sound.play('thud*', { vol: 0.3 }); refresh(); return false; }
  if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'team', units }));
  else { G.setTeam(state, me, units); syncUnits(); }   // a map shown with no room behind it
  return true;
}
function setupAct(act) {
  if (act === 'ready' && campNode && !ready[me]) { company = relTeam(); if (signedIn) post('/chess/save', { company }); else { try { localStorage.setItem('chess-company', JSON.stringify(company)); } catch { /* storage blocked */ } } }   // the company you field carries to the next battle
  if (act === 'ready') { sound.play('end', { vol: 0.5 }); if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'ready', on: !ready[me] })); return; }
  if (ready[me]) return;
  if (act === 'remove') { const u = setupSel && G.unitById(state, setupSel); if (u) { setupSel = null; sendTeam(myTeam().filter(m => !(m.x === u.x && m.y === u.y))); } }
  else if (act === 'default') { setupSel = null; sendTeam(G.defaultTeam(state.map, me)); }
  else if (act === 'saved' && teams.length) { teamAt = (teamAt + 1) % teams.length; loadTeam(teams[teamAt]); }
  refresh();
}
function setupPick(p) {
  if (p && p.kind === 'setup') return setupAct(p.act);
  if (ready[me]) return;
  if (!p) { held = null; setupSel = null; return refresh(); }
  if (p.kind === 'chip') { if (held !== p.type) sound.play('select', { vol: 0.4 }); held = held === p.type ? null : p.type; setupSel = null; return refresh(); }
  let x, y;
  if (p.kind === 'unit') { const u = G.unitById(state, p.id); if (!u) return; x = u.x; y = u.y; } else if (p.kind === 'tile') { x = p.x; y = p.y; } else return;
  const u = G.unitAt(state, x, y), team = myTeam();
  if (u) { setupSel = setupSel === u.id ? null : u.id; held = null; inspected = u.id; sound.play('select', { vol: 0.4 }); }
  else if (held) { if (sendTeam([...team, { type: held, x, y }])) sound.play('drop', { vol: 0.4 }); }
  else if (setupSel) { const m = G.unitById(state, setupSel), i = m ? team.findIndex(q => q.x === m.x && q.y === m.y) : -1; if (i >= 0) { team[i] = { type: team[i].type, x, y }; if (sendTeam(team)) sound.play('step*', { vol: 0.4 }); } }
  refresh();
}
// A saved team is kept by where each unit stands from the middle column and the back row, so it fits any map and either seat.
const relTeam = () => myTeam().map(m => ({ type: m.type, dx: (me === 0 ? m.x : cols - 1 - m.x) - Math.floor(cols / 2), r: me === 0 ? rows - 1 - m.y : m.y }));
function loadTeam(t) {
  const zone = G.MAPS[state.map].zone, free = [], out = [], mid = Math.floor(cols / 2);
  for (let r = 0; r < zone; r++) for (let c = 0; c < cols; c++) { const x = me === 0 ? c : cols - 1 - c, y = me === 0 ? rows - 1 - r : r; if (!G.ground(state, x, y).solid) free.push({ c, r, x, y }); }
  for (const m of t.units) {
    let best = -1, bd = 1e9;
    free.forEach((f, i) => { const d = Math.abs(f.c - mid - m.dx) + Math.abs(f.r - m.r); if (d < bd) { bd = d; best = i; } });
    if (best < 0) break;
    out.push({ type: m.type, x: free[best].x, y: free[best].y }); free.splice(best, 1);
  }
  while (out.length > 1 && G.teamCost(out) > (state.budget ?? G.BUDGET)) out.pop();
  setupSel = null;
  return sendTeam(out);
}
const post = (path, body) => fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(r => (r.ok ? r.json() : null)).catch(() => null);
// Saved teams: kept on the website for a login, in this browser otherwise.
async function loadTeams() {
  const j = await post('/chess/load', {});
  if (j && j.rec) { signedIn = true; teams = j.rec.teams || []; company = j.rec.company || []; camp = j.rec.camp || { done: [] }; }
  else { try { teams = JSON.parse(localStorage.getItem('chess-teams')) || []; company = JSON.parse(localStorage.getItem('chess-company')) || []; camp = JSON.parse(localStorage.getItem('chess-camp')) || { done: [] }; } catch { teams = []; } }
  if (!Array.isArray(camp.done)) camp = { done: [] };
  drawTeams();
  if (overland) { drawNodes(); drawCamp(); }
}
function keepTeams() {
  if (signedIn) post('/chess/save', { teams }); else { try { localStorage.setItem('chess-teams', JSON.stringify(teams)); } catch { /* storage blocked */ } }
  drawTeams();
}
function drawTeams() {
  const sel = $('teamSel'); sel.innerHTML = '';
  const o = document.createElement('option'); o.value = ''; o.textContent = teams.length ? 'Saved teams…' : 'No saved teams'; sel.appendChild(o);
  teams.forEach((t, i) => { const q = document.createElement('option'); q.value = i; q.textContent = t.name; sel.appendChild(q); });
  $('teamNote').textContent = signedIn ? 'Kept with your login.' : 'Kept in this browser.';
}
function saveTeam(name) {
  name = String(name || '').trim().slice(0, 24); if (!name || !inSetup()) return false;
  const t = { name, units: relTeam() }, i = teams.findIndex(q => q.name === name);
  if (i >= 0) teams[i] = t; else { if (teams.length >= 12) teams.shift(); teams.push(t); }
  keepTeams(); return true;
}
for (const [type, t] of Object.entries(G.TYPES)) { const b = document.createElement('button'); b.className = 'secondary chip'; b.dataset.type = type; b.onclick = () => handlePick({ kind: 'chip', type }); $('roster').appendChild(b); b.title = t.info; }
$('removeBtn').onclick = () => setupAct('remove');
$('defaultBtn').onclick = () => setupAct('default');
$('readyBtn').onclick = () => { sound.init(); setupAct('ready'); };
$('teamSel').onchange = () => { const t = teams[+$('teamSel').value]; if ($('teamSel').value !== '' && t && !ready[me]) { loadTeam(t); refresh(); } };
$('saveTeamBtn').onclick = () => { if (saveTeam(prompt('Name this team:', 'My team'))) setupNote = 'Team saved.'; refresh(); };
$('delTeamBtn').onclick = () => { const i = +$('teamSel').value; if ($('teamSel').value !== '' && teams[i]) { teams.splice(i, 1); keepTeams(); } };
loadTeams();
// The setting-out panel (the page's on a screen, the table's in the headset) as the state stands.
function drawSetup(on) {
  $('setup').hidden = !on || renderer.xr.isPresenting;
  for (const b of [...chips3D, ...setup3D]) b.visible = on;
  $('copyBtn').hidden = !!solo;
  if (!on) return;
  const mine = state.units.filter(u => u.owner === me), cost = G.teamCost(mine), rd = ready[me];
  $('budget').textContent = `${cost} / ${state.budget ?? G.BUDGET} points - ${mine.length} unit${mine.length === 1 ? '' : 's'}`;
  for (const b of $('roster').children) { const t = G.TYPES[b.dataset.type], n = mine.filter(u => u.type === b.dataset.type).length;
    b.textContent = `${t.name} - ${t.cost} pts - ${n}/${t.limit}`; b.classList.toggle('held', held === b.dataset.type); b.disabled = rd; }
  chips3D.forEach(b => { const type = b.userData.pick.type, t = G.TYPES[type], n = mine.filter(u => u.type === type).length; b.userData.label(`${t.name}\n${t.cost} pts  ${n}/${t.limit}`, held === type ? '#b8860b' : '#3a404b'); });
  setup3D[3].userData.label(rd ? 'STAND DOWN' : 'READY', rd ? '#8a2f2f' : '#2f8f4a');
  setup3D[2].userData.label(teams.length ? (teamAt >= 0 ? teams[teamAt].name.toUpperCase().slice(0, 9) : 'SAVED') : 'NO SAVED', '#3a404b');
  $('readyBtn').textContent = rd ? 'Stand down' : 'Ready'; $('readyBtn').className = rd ? 'danger' : '';
  $('removeBtn').disabled = rd || !setupSel; $('defaultBtn').disabled = rd; $('teamSel').disabled = rd;
  $('setupMsg').textContent = setupNote;
}

// ---------------------------------------------------------------- the campaign: the overland map, a banner a battle, then the battle against the computer
function drawNodes() {
  nodesGroup.clear();
  if (!overland || !field) return;
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.8 });
  for (const n of CAMPAIGN.nodes) {
    const won = camp.done.includes(n.id), open = isOpen(n.id, camp.done), g = new THREE.Group(), big = n.last ? 1.35 : 1;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.7 * big, 8), wood); pole.position.y = 0.85 * big; pole.castShadow = true;
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.62 * big, 0.4 * big), new THREE.MeshStandardMaterial({ color: won ? 0x3fae6a : open ? 0xffc23a : 0x6a6f7a, side: THREE.DoubleSide, roughness: 0.9, emissive: open && !won ? 0x4a3000 : 0 }));
    flag.position.set(0.33 * big, 1.45 * big, 0); flag.castShadow = true;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.06, 20), new THREE.MeshStandardMaterial({ color: n.id === campSel ? 0xffe08a : 0x2c2018, roughness: 0.7 })); base.position.y = 0.03;
    const t = textTexture(512, 96), label = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, depthTest: false, transparent: true }));
    t.ctx.font = 'bold 40px system-ui, sans-serif'; t.ctx.textAlign = 'center'; t.ctx.lineWidth = 7; t.ctx.strokeStyle = '#000'; t.ctx.fillStyle = won ? '#9be8b4' : open ? '#fff' : '#a0a6b0';
    const text = (won ? '\u2713 ' : '') + n.name + (n.optional ? ' (side)' : ''); t.ctx.strokeText(text, 256, 60, 500); t.ctx.fillText(text, 256, 60, 500); t.tex.needsUpdate = true;
    label.scale.set(2.6, 0.49, 1); label.position.y = 2.15 * big; label.renderOrder = 5; label.raycast = () => {};
    g.add(pole, flag, base, label); g.position.set(tx(n.at[0]), ty(n.at[0], n.at[1]), tz(n.at[1])); g.userData.pick = { kind: 'node', id: n.id };
    nodesGroup.add(g);
  }
}
function drawCamp() {
  const n = campSel && nodeOf(campSel), open = n && isOpen(n.id, camp.done), won = n && camp.done.includes(n.id), total = CAMPAIGN.nodes.length, ar = renderer.xr.isPresenting;
  $('camp').hidden = !overland || ar; $('setup').hidden = true;
  for (const b of [...chips3D, ...setup3D, endButton3D]) b.visible = false;
  fight3D.visible = !!open; arrowsGroup.visible = false;
  for (const g of nodesGroup.children) g.children[2].material.color.setHex(g.userData.pick.id === campSel ? 0xffe08a : 0x2c2018);
  const l1 = `${CAMPAIGN.name} - ${camp.done.length} of ${total} battles won` + (finished(camp.done) ? ' - the beacon burns' : '');
  $('status').textContent = l1; $('info').textContent = n ? '' : 'Pick a banner on the map to see the battle there.';
  drawStatus(n ? n.name : l1, n ? (open ? (won ? 'Won. FIGHT to fight it again.' : 'FIGHT to begin.') : 'Not open yet.') : 'Point at a banner and pull the trigger.');
  $('campName').textContent = n ? n.name + (n.optional ? ' (a side battle)' : '') : CAMPAIGN.name;
  $('campText').textContent = n ? (won ? n.won : n.text) : CAMPAIGN.intro;
  const count = {}; if (n) for (const [type] of n.enemy) count[G.TYPES[type].name] = (count[G.TYPES[type].name] || 0) + 1;
  $('campFoe').textContent = n ? 'Against you: ' + Object.entries(count).map(([k, v]) => (v > 1 ? v + ' ' + k + 's' : 'a ' + k)).join(', ') + '. On ' + G.MAPS[n.map].name + '.' : '';
  $('campPts').textContent = n ? (open ? `You field ${budgetFor(camp.done)} points.` + (n.gain && !won ? ` Winning adds ${n.gain}.` : '') : 'Not open yet: win ' + n.needs.filter(q => !camp.done.includes(q)).map(q => nodeOf(q).name).join(' and ') + ' first.') : `You field ${budgetFor(camp.done)} points. Fallen units are back for the next battle.`;
  $('fightBtn').hidden = !n; $('fightBtn').disabled = !open; $('fightBtn').textContent = won ? 'Fight again' : 'Fight';
  $('endBtn').hidden = true; $('copyBtn').hidden = true; $('quitBtn').textContent = 'Leave';
}
function openCampaign() {
  overland = true; state = null; code = null; me = -1; started = false; campSel = null; campNode = null; solo = null; companyTried = false; afterShown = false;
  if (ws) { const w = ws; ws = null; w.onclose = null; w.close(); }
  for (const g of unitMeshes.values()) unitsGroup.remove(g);
  unitMeshes.clear();
  $('lobby').style.display = 'none'; $('hud').style.display = 'flex'; $('after').hidden = true; after3D.visible = false;
  setField('@camp', CAMPAIGN.map); me = 0; resetCamera(); me = -1;
  drawNodes(); drawCamp();
  history.replaceState(null, '', location.pathname + '?camp=1');
}
function startBattle() {
  if (!campSel || !isOpen(campSel, camp.done)) return;
  sound.play('end', { vol: 0.5 });
  overland = false; nodesGroup.clear(); fight3D.visible = false; $('camp').hidden = true; companyTried = false; afterShown = false;
  connect({ t: 'create', token, camp: campSel, done: camp.done });
}
// When a match against the computer ends: what happened, and the way on.
function showAfter() {
  if (afterShown || !state || state.winner === null || !(solo || campNode)) return;
  afterShown = true;
  const won = state.winner === me, n = campNode && nodeOf(campNode);
  if (n && won && !camp.done.includes(n.id)) { camp.done.push(n.id); if (!signedIn) { try { localStorage.setItem('chess-camp', JSON.stringify(camp)); } catch { /* storage blocked */ } } }
  $('afterTitle').textContent = n ? (won ? n.name + ': won' : n.name + ': lost') : won ? 'You win' : state.winner === -1 ? 'A draw' : 'You lose';
  $('afterText').textContent = n ? (won ? n.won + (n.gain ? ` You may field ${n.gain} more points.` : '') + (n.last ? ' The campaign is won.' : '') : 'The company falls back to its camp. Everyone will be on their feet to try again.') : '';
  $('afterBtn').textContent = n ? 'Back to the map' : 'Menu';
  $('after').hidden = renderer.xr.isPresenting; after3D.visible = true; after3D.userData.label(n ? 'MAP' : 'MENU', '#2f6fed');
}
function afterGo() { if (campNode || overland) openCampaign(); else location.href = location.pathname; }
$('afterBtn').onclick = afterGo;
$('fightBtn').onclick = startBattle;
$('campBack').onclick = () => { location.href = location.pathname; };

const raycaster = new THREE.Raycaster();
function pickFromRay() {
  for (const h of raycaster.intersectObjects(pickRoots, true)) {
    let o = h.object, hidden = false;
    for (let p = o; p; p = p.parent) if (!p.visible) hidden = true;
    if (hidden) continue;
    while (o && !o.userData.pick && !o.userData.pickFace) o = o.parent;
    if (o) return { pick: o.userData.pick || o.userData.pickFace(h.faceIndex), point: h.point };
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
  if (field) field.setFog(0);
  table.visible = false;
  motes.visible = false;
  world.scale.setScalar(AR_SCALE);
  setShadowScale(AR_SCALE);
  applyQuality();
  sound.refDistance = 0.7;
  controls.enabled = false;
  panel.visible = true;
  controllers.forEach(c => { c.visible = true; });
  needPlace = true; xrFrames = 0;
});
renderer.xr.addEventListener('sessionend', () => {
  scene.fog = FOG;
  table.visible = true;
  world.scale.setScalar(1);
  applyLook();
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
  const k = Math.max(cols / 9, rows / 11) * (field && field.land ? 1.1 : 1);
  camera.position.set(0, 10 * k, (me === 1 ? -10.5 : 10.5) * k);
  controls.target.set(0, 0, 0);
  controls.update();
}

const clock = new THREE.Clock();
const ONE = new THREE.Vector3(1, 1, 1), camLocal = new THREE.Vector3(), camPos = new THREE.Vector3(), camDir = new THREE.Vector3(), camUp = new THREE.Vector3();
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
    else if (far > 0.12) g.position.y = g.userData.target.y + Math.abs(Math.sin(now * 13 + g.id)) * 0.14; // walking bob
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
  if (motes.visible) {
    for (let i = 0; i < MOTES; i++) {
      motePos[i * 3 + 1] += dt * 0.12;
      motePos[i * 3] += Math.sin(now * 0.3 + i) * dt * 0.05;
      if (motePos[i * 3 + 1] > 6) motePos[i * 3 + 1] = 0;
    }
    moteGeo.attributes.position.needsUpdate = true;
  }
  if (field && field.fires.length && now > nextCrackle) {
    nextCrackle = now + 0.1 + Math.random() * 0.5;
    sound.crackle(worldPos(field.fires[Math.floor(Math.random() * field.fires.length)]));
  }
  const viewCam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  viewCam.getWorldPosition(camPos);
  if (field) field.update(dt, now, world.worldToLocal(camLocal.copy(camPos)));
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
  if (sec !== lastSecond) { lastSecond = sec; refresh(); if (renderer.xr.isPresenting) ambience(); } // keeps the turn clock ticking
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
      else if (inSetup()) { setupNote = m.msg; refresh(); }
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
      if (!state || state.map !== m.state.map) { state = m.state; setField(m.state.map); }
      const wait = playEvents(m.events || []);
      state = m.state;
      started = m.started; present = m.present; deadline = m.deadline; skew = m.now - Date.now(); solo = m.solo || null; campNode = m.camp || null;
      if (campNode && state.phase === 'setup' && !companyTried) { companyTried = true; if (company.length && !(m.ready || [])[me]) loadTeam({ units: company }); }
      if (state.winner !== null && (solo || campNode)) setTimeout(showAfter, wait * 1000 + 1200);
      ready = m.ready || [true, true]; seated = m.seated || present;
      if (state.phase !== 'setup') { held = null; setupSel = null; }
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

for (const [id, m] of Object.entries(G.MAPS)) { const o = document.createElement('option'); o.value = id; o.textContent = m.name; $('mapSel').appendChild(o); }
const mapNote = () => { $('mapInfo').textContent = G.MAPS[$('mapSel').value].info; try { localStorage.setItem('map', $('mapSel').value); } catch { /* storage blocked */ } };
try { const m = localStorage.getItem('map'); if (G.MAPS[m]) $('mapSel').value = m; } catch { /* storage blocked */ }
$('mapSel').onchange = mapNote; mapNote();
$('rules').innerHTML = Object.values(G.TERRAIN).filter(t => t.info).map(t => `<b>${t.name}</b> ${t.info}`).join('<br>') + '<br><b>High ground</b> Stepping up a level costs one more move point; two levels at once cannot be climbed. Whatever works at range reaches one tile further at targets below it.';
$('helpBtn').onclick = () => { $('help').hidden = !$('help').hidden; };
$('help').onclick = () => { $('help').hidden = true; };
for (const [k, l] of Object.entries(LEVELS)) { const o = document.createElement('option'); o.value = k; o.textContent = l.name; $('levelSel').appendChild(o); }
$('levelSel').value = 'hard';
$('soloBtn').onclick = () => { sound.init(); $('lobbyMsg').textContent = ''; connect({ t: 'create', token, map: $('mapSel').value, solo: $('levelSel').value }); };
$('campBtn').onclick = () => { sound.init(); openCampaign(); };
$('createBtn').onclick = () => { sound.init(); $('lobbyMsg').textContent = ''; connect({ t: 'create', token, map: $('mapSel').value }); };
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
// A map on the table with no match behind it (for pictures and checks): ?show=river, or __t.show('river').
function show(id, setup) {
  state = G.newGame(id, { setup: !!setup }); me = 0; code = 'SHOW'; started = false; ready = [false, false];
  if (setup) state.units = state.units.filter(u => u.owner === 0);
  $('lobby').style.display = 'none'; $('hud').style.display = 'flex';
  for (const g of unitMeshes.values()) unitsGroup.remove(g);
  unitMeshes.clear();
  setField(state.map); syncUnits(); refresh();
}
if (new URLSearchParams(location.search).get('camp')) openCampaign();
if (new URLSearchParams(location.search).get('show')) show(new URLSearchParams(location.search).get('show'), new URLSearchParams(location.search).get('setup'));
window.__t = { handlePick, show, world, G, openCampaign, CAMPAIGN, get camp() { return camp; }, get overland() { return overland; }, get campSel() { return campSel; }, get solo() { return solo; }, get campNode() { return campNode; }, saveTeam, loadTeam, get teams() { return teams; }, get held() { return held; }, get ready() { return ready; }, get setupSel() { return setupSel; }, get field() { return field; }, castFx, explode, V, camera, controls, fx, sun, renderer, scene, get state() { return state; }, get me() { return me; }, get code() { return code; }, get selected() { return selected; } };
