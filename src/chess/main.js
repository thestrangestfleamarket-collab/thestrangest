// SKIRMISH TABLE's page (/chess): the board, its pieces, the screen and AR controls, and the link to the match's room
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as G from './game.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeBoard, makeTable } from './board.js';
import { Labels } from './labels.js';
import { makeDungeon } from './dungeon.js';
import { LEVELS } from './ai.js';
import { CAMPAIGN, nodeOf, budgetFor, isOpen, finished } from './campaign.js';
import { FX } from './fx.js';
import { Sound } from './audio.js';
import { loadCharacters, makeCharacter, charactersReady, typeReady, typesReady, trisOf, sizeOf, clipsOf, need, Crowd } from './characters.js';
import { stepSound, strikeSound, abilitySound, hitSound, fallSound, shatterSound } from './voices.js';

const $ = id => document.getElementById(id);
const AR_SCALE = 0.06; // one tile = 6 cm on your real table
const FACE_ANGLE = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };

// ---------------------------------------------------------------- state
let ws = null, me = -1, code = null, state = null;
let started = false, present = [false, false], deadline = null, skew = 0;
let selected = null, inspected = null, inspectedTile = null;
let solo = null, campNode = null, camp = { done: [] }, company = [], inCamp = false, campSel = null, companyTried = false, afterShown = false;
let prog = { xp: {}, ups: {} }, openMatch = false, gained = null;
let aim = false, page = 'fighter'; // aim: the picked unit's power is pointed at empty ground; page: the group of unit types the table's chips show
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
let quality = 'high', lean = 0; // lean: how far the headset has been eased (govern)
try { quality = localStorage.getItem('quality') || 'high'; } catch { /* storage blocked */ }
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(quality === 'high' ? Math.min(devicePixelRatio, 2) : 1);
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.xr.setFramebufferScaleFactor(1); // the headset's picture keeps one size from start to end
renderer.xr.setFoveation(0.7);
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const BG = new THREE.Color(0x0d0d10), FOG = new THREE.FogExp2(0x0d0d10, 0.014);
scene.background = BG;
scene.fog = FOG;
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.01, 200);
camera.position.set(0, 10, 10.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = 1.45;
controls.minDistance = 4;
controls.maxDistance = 30;
controls.enablePan = false;
controls.enableDamping = true; // the view glides to rest
controls.dampingFactor = 0.12;

const world = new THREE.Group(); // everything that sits on the table
scene.add(world);

// Light: one sun and the sky's fill, for the pieces only (the board's light is in its picture). Parented to the board so it follows it in AR.
const hemi = new THREE.HemisphereLight(0xd3d9e6, 0x8c7b6a, 1.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffeedc, 2.1);
sun.position.set(8, 9, 1); // from the side, so both seats see the same shading
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 32 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
world.add(sun, sun.target);
const fieldGroup = new THREE.Group(), unitsGroup = new THREE.Group(), arrowsGroup = new THREE.Group(), panel = new THREE.Group();
world.add(fieldGroup, unitsGroup, arrowsGroup, panel);
const pickRoots = [fieldGroup, unitsGroup, arrowsGroup, panel];
// Real shadows are a screen's, on HIGH: this unseen sheet over the board catches them. In the headset no shadow is ever drawn; each piece has its soft shade (Crowd).
const catcher = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0.008, 0), new THREE.ShadowMaterial({ opacity: 0.34 }));
catcher.receiveShadow = true; catcher.raycast = () => {}; catcher.renderOrder = 2;
world.add(catcher);
const dungeon = makeDungeon(renderer); // the board's setting: still, baked, three draws
world.add(dungeon.group);

// The battlefield (maps.js), built when the match's state first names it; on a screen a round table under it (in AR your real table does this job).
let cols = G.COLS, rows = G.ROWS, field = null, table = null;
const tx = x => x - (cols - 1) / 2;
const tz = y => y - (rows - 1) / 2;
const ty = (x, y) => (field ? field.yAt(x, y) : 0);
function setField(id) {
  if (!G.MAPS[id]) id = 'board';
  if (field && field.id === id) return;
  if (field) field.dispose();
  if (table) { table.userData.free(); table.removeFromParent(); table.geometry.dispose(); table.material.map.dispose(); table.material.dispose(); }
  const m = G.MAPS[id];
  cols = m.cols; rows = m.rows;
  field = makeBoard(m, { id, renderer });
  fieldGroup.add(field.group);
  table = makeTable(m, renderer); table.visible = !renderer.xr.isPresenting;
  world.add(table);
  catcher.scale.set(cols + 0.7, 1, rows + 0.7);
  applyQuality(); placePanel();
  if (!renderer.xr.isPresenting) resetCamera();
}

// ---------------------------------------------------------------- text helpers
function textTexture(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return { canvas, ctx: canvas.getContext('2d'), tex };
}

// ---------------------------------------------------------------- the pieces: a group each (its place, its facing, what a pointer finds); what is drawn is shared (characters.js Crowd, labels.js)
const crowd = new Crowd(unitsGroup), labels = new Labels(world, renderer);
const pickGeo = new THREE.CylinderGeometry(0.36, 0.38, 1.0, 10).translate(0, 0.5, 0), pickMat = new THREE.MeshBasicMaterial({ visible: false });
let crowdDirty = true;
function buildUnit(u) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(pickGeo, pickMat));
  g.userData = { ch: null, live: false, rested: false, rest: false, type: u.type, owner: u.owner, pick: { kind: 'unit', id: u.id }, target: new THREE.Vector3(tx(u.x), ty(u.x, u.y), tz(u.y)), angle: FACE_ANGLE[u.facing] };
  g.position.copy(g.userData.target);
  g.rotation.y = g.userData.angle;
  return g;
}
// A piece's bones and clips, made the first time it has to move.
function rigOf(g) {
  const d = g.userData;
  if (!d.ch && typeReady(d.type)) { d.ch = makeCharacter(d.type); d.ch.mesh.visible = false; crowd.tint(d.ch.mesh, d.rested, d.owner); g.add(d.ch.mesh); }
  return d.ch;
}

const unitMeshes = new Map();
const dying = []; // units playing their fall-over animation before removal
function clearUnits() {
  for (const g of unitMeshes.values()) unitsGroup.remove(g);
  unitMeshes.clear(); labels.clear(); crowdDirty = true;
}
// Ground that burns for a while (state.pools): one still glow a tile, all in one draw.
const pools = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.05, 1.05).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.5, depthWrite: false }), 48);
  m.count = 0; m.frustumCulled = false; m.raycast = () => {}; m.renderOrder = 1; m.visible = false; m.setColorAt(0, new THREE.Color(1, 1, 1));
  world.add(m); return m;
})();
const POOL_COLOR = { fire: 0xe8782a, pitch: 0x9a4a1c };
function syncPools() {
  const list = (state && state.pools) || [], M = new THREE.Matrix4(), C = new THREE.Color();
  list.forEach((p, i) => { pools.setMatrixAt(i, M.makeTranslation(tx(p.x), ty(p.x, p.y) + 0.02, tz(p.y))); pools.setColorAt(i, C.setHex(POOL_COLOR[p.k] || POOL_COLOR.fire)); });
  pools.count = list.length; pools.visible = list.length > 0; pools.instanceMatrix.needsUpdate = true; pools.instanceColor.needsUpdate = true;
}
function syncUnits() {
  const alive = new Set();
  need(state.units.flatMap(u => [u.type, G.TYPES[u.type].summon]).filter(Boolean)).catch(() => {});
  syncPools();
  for (const u of state.units) {
    alive.add(u.id);
    let g = unitMeshes.get(u.id);
    if (g && g.userData.type !== u.type) { unitsGroup.remove(g); unitMeshes.delete(u.id); g = null; }
    if (!g) { g = buildUnit(u); unitMeshes.set(u.id, g); unitsGroup.add(g); }
    const d = g.userData, t = G.stats(u), stars = u.up ? Object.keys(u.up).length : 0, rested = u.rec > 0 || u.snare > 0;
    const tag = [u.snare > 0 ? `snared ${u.snare}` : u.rec > 0 ? `resting ${u.rec}` : '', u.frozen > 0 ? `frozen ${u.frozen}` : '', u.empty ? 'unloaded' : '', u.life > 0 ? `fades in ${u.life}` : ''].filter(Boolean).join(', ');
    d.target.set(tx(u.x), ty(u.x, u.y), tz(u.y));
    d.angle = FACE_ANGLE[u.facing]; d.owner = u.owner;
    labels.set(u.id, { name: t.name + (stars ? ' ' + '★'.repeat(Math.min(3, stars)) : ''), hp: u.hp / t.hp, owner: u.owner, tag });
    if (rested !== d.rested) { d.rested = rested; if (d.ch) crowd.tint(d.ch.mesh, rested, d.owner); }
  }
  for (const [id, g] of unitMeshes) {
    if (alive.has(id)) continue;
    unitMeshes.delete(id); labels.drop(id);
    if (state.phase === 'setup') { unitsGroup.remove(g); continue; }
    g.userData.pick = null;
    const ch = rigOf(g); if (ch) { ch.once('death'); ch.mesh.visible = true; g.userData.live = true; }
    dying.push({ g, t: 0 });
  }
  crowdDirty = true;
}

// ---------------------------------------------------------------- facing arrows: four still wedges on the ground round the picked piece, one mesh
const DIR_KEYS = Object.keys(G.DIRS);
const arrowGeo = mergeGeometries(DIR_KEYS.map(k => { const [dx, dy] = G.DIRS[k]; return new THREE.ConeGeometry(0.2, 0.34, 3).rotateX(Math.PI / 2).scale(1, 0.22, 1).rotateY(Math.atan2(dx, dy)).translate(dx * 0.66, 0.07, dy * 0.66); }));
const arrows = new THREE.Mesh(arrowGeo, new THREE.MeshLambertMaterial({ color: 0xe0bf6c }));
arrows.userData.pickFace = f => ({ kind: 'face', dir: DIR_KEYS[Math.floor(f / (arrowGeo.index.count / 12))] });
arrowsGroup.add(arrows);
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
  const t = textTexture(Math.round(w / 0.86 * 96), 96);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.86).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t.tex, transparent: true }));
  b.position.set(x, 0.06, z);
  b.userData.pick = typeof pick === 'string' ? { kind: pick } : pick;
  b.userData.label = (text, color, small) => {
    const key = text + color + small; if (b.userData.key === key) return; b.userData.key = key;
    const W = t.canvas.width, c = t.ctx, lines = String(text).split('\n');
    c.clearRect(0, 0, W, 96); c.fillStyle = color; c.beginPath(); c.roundRect(2, 2, W - 4, 92, 14); c.fill();
    c.fillStyle = '#f0ede6'; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => { c.font = `600 ${lines.length > 1 ? (i ? 24 : 27) : small ? 30 : 38}px system-ui, sans-serif`; c.fillText(l, W / 2, lines.length > 1 ? 30 + i * 36 : 50, W - 16); });
    t.tex.needsUpdate = true;
  };
  b.userData.label(text, color);
  panel.add(b);
  return b;
}
const endButton3D = makeButton('END TURN', '#3f66b8', -1.3, 'end');
const fight3D = makeButton('FIGHT', '#3f8656', -1.3, 'fight'), after3D = makeButton('MENU', '#3f66b8', 0, 'after', 2.3, 2.2);
fight3D.visible = after3D.visible = false;
const recenterButton3D = makeButton('RECENTER', '#3d434e', 1.3, 'recenter');
// Setting out, in the headset: a chip a unit type, then REMOVE, DEFAULT, SAVED (the next saved team) and READY.
// The unit types are shown a group at a time (the tabs), five chips to a row.
const GROUP_KEYS = Object.keys(G.GROUPS), typesIn = k => Object.keys(G.TYPES).filter(t => G.TYPES[t].group === k);
const tabs3D = GROUP_KEYS.map((k, i) => makeButton(G.GROUPS[k].toUpperCase(), '#3d434e', (i - 1.5) * 1.75, { kind: 'page', page: k }, 1.65, 2.2));
const chips3D = GROUP_KEYS.flatMap(k => typesIn(k).map((type, i, a) => makeButton('', '#3d434e', (i % 5 - (Math.min(5, a.length - Math.floor(i / 5) * 5) - 1) / 2) * 1.4, { kind: 'chip', type }, 1.34, 3.15 + Math.floor(i / 5) * 0.95)));
const setup3D = [['remove', 'REMOVE'], ['default', 'DEFAULT'], ['saved', 'SAVED'], ['ready', 'READY']].map(([act, text], i) => makeButton(text, '#3d434e', (i - 1.5) * 1.75, { kind: 'setup', act }, 1.65, 5.05));
for (const b of tabs3D) b.visible = false;
// The campaign's battles, in the headset: a button each, two abreast.
const nodes3D = CAMPAIGN.nodes.map((n, i) => makeButton('', '#3d434e', (i % 2 ? 1.72 : -1.72), { kind: 'node', id: n.id }, 3.3, 2.2 + Math.floor(i / 2) * 0.95));
for (const b of nodes3D) b.visible = false;

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
  ctx.fillStyle = 'rgba(24,26,31,0.84)';
  ctx.beginPath(); ctx.roundRect(0, 0, 1024, 160, 22); ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ece8df'; ctx.font = '600 52px system-ui, sans-serif';
  ctx.fillText(line1, 512, 62, 980);
  ctx.fillStyle = '#b9bec8'; ctx.font = '34px system-ui, sans-serif';
  ctx.fillText(line2, 512, 124, 980);
  tex.needsUpdate = true;
}

// ---------------------------------------------------------------- floating combat text
const floaters = [];
function floatText(pos, text, color) {
  const t = textTexture(256, 64);
  t.ctx.font = '600 42px system-ui, sans-serif'; t.ctx.textAlign = 'center'; t.ctx.lineJoin = 'round';
  t.ctx.lineWidth = 7; t.ctx.strokeStyle = 'rgba(24,26,31,0.85)'; t.ctx.fillStyle = color;
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
const fx = new FX(world, renderer);
const sound = new Sound();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const up = (v, h) => v.clone().setY(v.y + h); // a point this high above the ground under v
const worldPos = local => world.localToWorld(local.clone()); // board space -> room space, for 3D audio
const later = (t, fn) => (t > 0 ? setTimeout(fn, t * 1000) : fn());
const IMPACT_DELAY = { melee: 0.16, line: 0.18, ranged: 0.4, blast: 0.5, heal: 0.25, snare: 0.3, bolt: 0.3, chain: 0.14, cone: 0.32, flask: 0.5, summon: 0.3, reload: 0 };

function explode(t) {
  const wp = worldPos(t);
  fx.flash({ pos: up(t, 0.5), tex: 'light_01', color: 0xffc896, size: 2.2, life: 0.45, grow: 0.5, opacity: 0.5 });
  fx.burst({ pos: up(t, 0.2), tex: 'fire_01', color: 0xee9058, count: 10, size: 0.85, life: 0.75, speed: 2.0, up: 0.9, drag: 3, grow: 0.8, spread: 0.7, opacity: 0.55 });
  fx.burst({ pos: up(t, 0.3), tex: 'spark_01', color: 0xf2cc8e, count: 8, size: 0.2, life: 0.9, speed: 4, up: 0.9, gravity: 9, drag: 0.6, opacity: 0.55 });
  fx.burst({ pos: up(t, 0.3), tex: 'smoke_07', color: 0x34302c, count: 5, size: 1.2, life: 1.8, speed: 0.8, up: 1.4, drag: 1, grow: 1.2, additive: false, opacity: 0.4, spread: 0.8 });
  fx.decal({ pos: t, tex: 'scorch_02', size: 2.6 });
  sound.play('boom*', { pos: wp, vol: 1 });
  sound.play('rumble', { pos: wp, vol: 0.8 });
}

// With animated characters the effect waits for the wind-up of the attack animation.
const LEAD = { melee: 0.3, line: 0.4, ranged: 0.3, blast: 0.4, heal: 0.35, snare: 0.4, bolt: 0.4, chain: 0.4, cone: 0.35, flask: 0.4, summon: 0.4, reload: 0 };
const leadTime = (kind, g) => (g && g.userData.ch && kind !== 'reload' ? g.userData.ch.lead || LEAD[kind] || 0 : 0);   // each strike's own moment (the bake found where its clip reaches furthest)
// lightning: one quick pale streak from a point to a point, no flash
const streak = (from, to) => fx.projectile({ from, to, arc: 0.05, dur: 0.12, tex: 'trace_01', color: 0xcfdcff, size: 0.42, trailTex: 'spark_05', trailColor: 0xb4c6f4, trailSize: 0.2 });

function castFx(kind, g, a, t) {
  const dir = t.clone().sub(a).setY(0);
  if (g && dir.lengthSq() > 0) g.userData.angle = Math.atan2(-dir.x, -dir.z);
  const ch = g && rigOf(g);
  if (ch) ch.once(kind === 'reload' ? 'reload' : 'attack');
  later(leadTime(kind, g), () => castFxNow(kind, g, a, t));
}

function castFxNow(kind, g, a, t) {
  const dir = t.clone().sub(a).setY(0);
  if (dir.lengthSq() > 0) dir.normalize();
  const wp = worldPos(a);
  strikeSound(sound, g ? g.userData.type : '', kind, wp);
  if (kind === 'melee' || kind === 'line') {
    if (g) g.position.addScaledVector(dir, g.userData.ch ? 0.25 : 0.45); // lunge; the unit springs back on its own
    if (kind === 'melee') {
      fx.flash({ pos: up(a, 0.7).addScaledVector(dir, 0.7), tex: 'slash_02', color: 0xe8e4da, size: 1.2, life: 0.3, grow: 0.4, rotation: Math.random() * 6.28 });
    } else {
      for (const d of [1, 2]) fx.flash({ pos: up(a, 0.65).addScaledVector(dir, d), tex: 'flare_01', color: 0xdfe4ee, size: 0.9, life: 0.28 + d * 0.05, grow: 0.8 });
    }
  } else if (kind === 'ranged') {
    fx.projectile({ from: up(a, 0.9), to: up(t, 0.6), arc: 1.1, dur: 0.4, tex: 'spark_05', color: 0xf0e4c0, size: 0.35, trailTex: 'circle_05', trailColor: 0xc4cce6, trailSize: 0.12 });
  } else if (kind === 'blast') {
    fx.flash({ pos: up(a, 1.1), tex: 'flare_01', color: 0xee8a48, size: 1.1, life: 0.36 });
    fx.projectile({ from: up(a, 1.1), to: up(t, 0.3), arc: 2.2, dur: 0.5, tex: 'fire_01', color: 0xf2a25a, size: 0.75, trailTex: 'flame_05', trailColor: 0xe87c40, trailSize: 0.42, onHit: () => explode(t) });
  } else if (kind === 'heal') {
    fx.flash({ pos: up(a, 1.0), tex: 'light_01', color: 0x8fdcaa, size: 1, life: 0.5 });
    later(0.2, () => {
      fx.burst({ pos: up(t, 0.2), tex: 'star_06', color: 0x8fdcaa, count: 8, size: 0.28, life: 1.0, speed: 0.6, up: 2.2, drag: 1, spread: 0.4 });
      fx.flash({ pos: up(t, 0.6), tex: 'twirl_01', color: 0x8fdcaa, size: 1.4, life: 0.9, spin: 1.6 });
    });
  } else if (kind === 'bolt') {
    fx.projectile({ from: up(a, 1.1), to: up(t, 0.7), arc: 0.2, dur: 0.3, tex: 'star_06', color: 0xa8dcff, size: 0.45, trailTex: 'circle_05', trailColor: 0x8cc8f0, trailSize: 0.22,
      onHit: () => {
        fx.flash({ pos: up(t, 0.6), tex: 'star_06', color: 0xbfe6ff, size: 1.5, life: 0.9, grow: 0.3, opacity: 0.5 });
        fx.burst({ pos: up(t, 0.5), tex: 'spark_05', color: 0xcfeaff, count: 8, size: 0.22, life: 1.0, speed: 0.9, up: 0.3, drag: 2, spread: 0.4, opacity: 0.6 });
      } });
  } else if (kind === 'chain') {
    fx.flash({ pos: up(a, 1.3), tex: 'flare_01', color: 0xbfd0ff, size: 0.9, life: 0.4, opacity: 0.5 });
    streak(up(a, 1.3), up(t, 0.8));
  } else if (kind === 'cone') {
    const side = V(-dir.z, 0, dir.x);
    [t.clone(), a.clone().addScaledVector(dir, 2), a.clone().addScaledVector(dir, 2).add(side), a.clone().addScaledVector(dir, 2).sub(side)].forEach((p, i) => fx.projectile({ from: up(a, 1.1), to: up(p, 0.35), arc: 0.12, dur: 0.3 + i * 0.03, tex: 'fire_01', color: 0xf2a25a, size: 0.6, trailTex: 'flame_05', trailColor: 0xe87c40, trailSize: 0.34,
      onHit: () => fx.burst({ pos: up(p, 0.25), tex: 'fire_01', color: 0xee9058, count: 4, size: 0.6, life: 0.6, speed: 0.8, up: 0.8, drag: 3, grow: 0.6, spread: 0.3, opacity: 0.5 }) }));
  } else if (kind === 'flask') {
    fx.projectile({ from: up(a, 1.2), to: up(t, 0.1), arc: 1.6, dur: 0.5, tex: 'circle_05', color: 0x7ae08a, size: 0.3, trailTex: 'circle_05', trailColor: 0x58c06a, trailSize: 0.1,
      onHit: () => {
        shatterSound(sound, worldPos(t));
        fx.burst({ pos: up(t, 0.2), tex: 'fire_01', color: 0xee9058, count: 7, size: 0.6, life: 0.7, speed: 1.2, up: 0.8, drag: 3, grow: 0.7, spread: 0.4, opacity: 0.5 });
        fx.burst({ pos: up(t, 0.2), tex: 'smoke_07', color: 0x34302c, count: 3, size: 0.9, life: 1.4, speed: 0.5, up: 1.1, drag: 1, grow: 1, additive: false, opacity: 0.35, spread: 0.5 });
      } });
  } else if (kind === 'summon') {
    const c = g && g.userData.type === 'necro' ? 0xa8e07a : 0x9adfd6;
    fx.flash({ pos: up(a, 1.2), tex: 'magic_05', color: c, size: 0.9, life: 0.5 });
    later(0.15, () => {
      fx.flash({ pos: up(t, 0.5), tex: 'twirl_01', color: c, size: 1.8, life: 1.1, spin: 1.4, opacity: 0.6 });
      fx.burst({ pos: up(t, 0.1), tex: 'magic_03', color: c, count: 9, size: 0.3, life: 1.1, speed: 0.5, up: 1.6, drag: 1, spread: 0.4 });
    });
  } else if (kind === 'reload') {
    if (g) floatText(g.position, 'Reloaded', '#e6e2d8');
  } else if (kind === 'snare') {
    fx.projectile({ from: up(a, 1.1), to: up(t, 0.7), arc: 0.4, dur: 0.3, tex: 'magic_05', color: 0xc0a0ea, size: 0.5, trailTex: 'magic_03', trailColor: 0xa684de, trailSize: 0.3,
      onHit: () => {
        fx.flash({ pos: up(t, 0.6), tex: 'twirl_01', color: 0xb294e4, size: 1.7, life: 1.0, spin: -1.8 });
        fx.burst({ pos: up(t, 0.4), tex: 'magic_03', color: 0xb294e4, count: 7, size: 0.3, life: 0.9, speed: 1.2, up: 0.6, drag: 2, spread: 0.3 });
      } });
  }
}

function hitFx(g, e, kind, a) {
  if (!g || !g.parent) return;
  const p = g.position.clone(), wp = worldPos(p);
  const away = a ? p.clone().sub(a).setY(0) : V(0, 0, 0);
  if (away.lengthSq() > 0) away.normalize();
  g.position.addScaledVector(away, 0.22);
  const ch = rigOf(g);
  if (!(ch && ch.once('hit'))) g.scale.setScalar(1.14);
  floatText(p, `-${e.dmg}`, '#e88f80');
  const armored = G.TYPES[g.userData.type].armor > 0;
  if (kind === 'burn') fx.burst({ pos: up(p, 0.3), tex: 'fire_01', color: 0xee9058, count: 4, size: 0.5, life: 0.6, speed: 0.6, up: 0.9, drag: 3, grow: 0.6, spread: 0.3, opacity: 0.5 });
  hitSound(sound, g.userData.type, kind, armored, wp);
  if (kind === 'blast' || kind === 'cone' || kind === 'flask' || kind === 'chain' || kind === 'bolt' || kind === 'burn') return;
  fx.flash({ pos: up(p, 0.7), tex: 'spark_05', color: armored ? 0xf0e4c0 : 0xe0705e, size: 0.85, life: 0.28, grow: 0.8 });
  if (armored) fx.burst({ pos: up(p, 0.7), tex: 'spark_01', color: 0xf0d8a4, count: 6, size: 0.16, life: 0.6, speed: 3.5, up: 0.8, gravity: 9, drag: 0.8 });
  else fx.burst({ pos: up(p, 0.7), tex: 'dirt_02', color: 0x9c3a30, count: 5, size: 0.3, life: 0.5, speed: 1.6, up: 0.8, gravity: 6, additive: false, opacity: 0.8 });
}

function blockFx(g) {
  if (!g || !g.parent) return;
  const p = g.position.clone();
  g.scale.setScalar(1.1); // brace
  floatText(p, 'Blocked', '#e6e2d8');
  sound.play('block*', { pos: worldPos(p), vol: 1 });
  fx.flash({ pos: up(p, 0.75), tex: 'star_06', color: 0xe8e4da, size: 1.0, life: 0.3, grow: 0.9 });
  fx.burst({ pos: up(p, 0.75), tex: 'spark_01', color: 0xe8e4da, count: 7, size: 0.16, life: 0.6, speed: 4, up: 0.7, gravity: 9, drag: 0.8 });
}

function deathFx(g) {
  if (!g) return;
  const p = g.position.clone(), wp = worldPos(p);
  fallSound(sound, g.userData.type, wp);
  fx.burst({ pos: up(p, 0.3), tex: 'smoke_04', color: 0x555048, count: 5, size: 0.9, life: 1.4, speed: 0.7, up: 1, drag: 1.5, grow: 1, additive: false, opacity: 0.5, spread: 0.4 });
}

// Footsteps by what is stepped onto (a ground's `foot` in maps.js, or the map's own bare ground): [the step's pitch, its loudness, what goes with it]:
// soft in grass, a rustle in the wood, hollow on the bridge, a splash in the ford, a crunch in snow and cinder, a hard tick on ice and stone, a puff in ash.
const FOOT = { grass: [0.82, 0.4, 'rustle'], leaves: [0.78, 0.4, 'rustle'], moss: [0.7, 0.3, 'rustle'], dirt: [1, 0.5], wood: [1.3, 0.6, 'thud'], water: [0.7, 0.3, 'splash'],
  snow: [0.7, 0.34, 'crunch'], gravel: [1.05, 0.45, 'crunch'], cinder: [0.95, 0.42, 'crunch'], ice: [1.5, 0.42, 'tick'], stone: [1.22, 0.55, 'tick'], ash: [0.62, 0.26, 'puff'] };
function moveFx(g, e) {
  const p = g.position.clone(), wp = worldPos(p), m = G.mapOf(state.map), k = m.tiles ? m.tiles[e.y][e.x] : null, own = m.look && m.look.foot, d = g.userData;
  const [rate, vol, more] = FOOT[k && ((own && own[k]) || G.TERRAIN[k].foot)] || [1, 0.5];
  // it walks there at its own stride's speed (a long way a little quicker, the stride quickened with it), so its feet do not slide
  d.target.set(tx(e.x), ty(e.x, e.y), tz(e.y));
  const ch = rigOf(g), far = Math.hypot(p.x - d.target.x, p.z - d.target.z), pace = ch ? ch.pick(far) : 3;
  d.hurry = Math.min(1.5, Math.max(1, far / pace / 1.5)); d.pace = pace * d.hurry; d.walk = far > 0.05;
  const secs = far / d.pace, steps = stepSound(sound, d.type, wp, secs, [rate, vol]);
  for (let i = 0; i < steps; i++) { const delay = (i + 0.3) * secs / steps;
    if (more === 'splash') sound.whoosh({ pos: wp, dur: 0.22, from: 2600, to: 500, vol: 0.22, q: 0.6, delay: delay + 0.03 });
    else if (more === 'rustle') sound.whoosh({ pos: wp, dur: 0.12, from: 5000, to: 2500, vol: 0.05, q: 0.5, delay });
    else if (more === 'thud') sound.play('thud*', { pos: wp, vol: 0.12, rate: 1.5, delay });
    else if (more === 'crunch') sound.whoosh({ pos: wp, dur: 0.16, from: 1500, to: 520, vol: 0.2, q: 0.7, delay: delay + 0.01 });
    else if (more === 'puff') sound.whoosh({ pos: wp, dur: 0.24, from: 520, to: 240, vol: 0.14, q: 0.5, delay });
  }
  fx.burst({ pos: up(p, 0.08), tex: 'dirt_02', color: 0x8a7a66, count: 4, size: 0.4, life: 0.6, speed: 0.6, up: 0.5, drag: 2, grow: 0.8, additive: false, opacity: 0.4, spread: 0.2 });
}
// how long until a walking piece is on its tile (seconds)
const arrives = g => { const d = g && g.userData; if (!d || !d.walk) return 0; return Math.min(3, Math.hypot(g.position.x - d.target.x, g.position.z - d.target.z) / (d.pace || 3)); };

// Starts the effects for one batch of server events. Returns how long (seconds) the board
// should wait before showing the result (health bars, removed units).
function playEvents(events) {
  let impact = 0, kind = 'burn', a = null, wait = 0;   // a wound with no act before it is the ground's fire
  const say = (g, at, text, color) => later(at, () => g && g.parent && floatText(g.position, text, color));
  for (const e of events) {
    const g = unitMeshes.get(e.id);
    if (e.t === 'brace') { say(g, Math.max(0, impact - 0.2), 'Braced', '#e6e2d8'); const ch = g && rigOf(g); if (ch) ch.once('ability'); if (g) abilitySound(sound, g.userData.type, worldPos(g.position)); }
    else if (e.t === 'immune') say(g, impact, 'No effect', '#b9bec8');
    else if (e.t === 'frozen') say(g, impact, 'Frozen', '#a8dcff');
    else if (e.t === 'arc') { const f = V(tx(e.fx), ty(e.fx, e.fy), tz(e.fy)); impact += 0.16; const at = impact - 0.12; later(at, () => g && g.parent && streak(up(f, 0.8), up(g.position, 0.8))); wait = impact + 0.1; }
    else if (e.t === 'summon') wait = Math.max(wait, impact + 0.35);
    else if (e.t === 'fade') say(g, 0, 'Fades', '#9adfd6');
    else if (e.t === 'rout') later(impact + 0.6, () => floatText(V(0, 0.4, 0), 'Leaderless', '#e6c36c'));
    else if (e.t === 'skip') later(wait + 0.5, () => floatText(V(0, 0.4, 0), 'Turn lost', '#e6c36c'));
    if (e.t === 'move') { if (g) moveFx(g, e); }
    else if (e.t === 'act') {
      kind = e.kind;
      const t = V(tx(e.x), ty(e.x, e.y), tz(e.y));
      a = g ? g.userData.target.clone() : t.clone();
      const lag = arrives(g);   // a piece still walking strikes when it is there
      if (g) rigOf(g);
      if (lag) later(lag, () => castFx(kind, g, a, t)); else castFx(kind, g, a, t);
      impact = lag + leadTime(kind, g) + IMPACT_DELAY[kind]; wait = impact + 0.1;
    }
    else if (e.t === 'hit') later(impact, () => hitFx(g, e, kind, a));
    else if (e.t === 'block') later(impact, () => blockFx(g));
    else if (e.t === 'heal') later(impact, () => g && g.parent && floatText(g.position, `+${e.amt}`, '#8fd3a6'));
    else if (e.t === 'snare') later(impact, () => g && g.parent && floatText(g.position, 'Snared', '#cdb2ea'));
    else if (e.t === 'free') later(impact + 0.3, () => g && g.parent && floatText(g.position, 'Freed', '#8fd3a6'));
    else if (e.t === 'die') { later(impact + 0.12, () => deathFx(g)); wait = impact + 0.2; }
    else if (e.t === 'turn') { if (e.player === me) later(wait + 0.15, () => sound.play('turn', { vol: 0.5 })); }
    else if (e.t === 'over') later(wait + 0.4, () => sound.play(e.winner === me ? 'win' : 'lose', { vol: 0.7 }));
  }
  return wait;
}

// ---------------------------------------------------------------- quality: HIGH on a screen is the sun's real shadows and the full picture; in the headset neither changes
function applyQuality() {
  const xr = renderer.xr.isPresenting, shadows = quality === 'high' && !xr;
  sun.castShadow = shadows; catcher.visible = shadows; crowd.shadows(shadows);
  for (const g of unitMeshes.values()) if (g.userData.ch) crowd.tint(g.userData.ch.mesh, g.userData.rested);
  if (!xr) renderer.setPixelRatio(quality === 'high' ? Math.min(devicePixelRatio, 2) : 1);
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
    const t = G.stats(u);
    l2 = `${t.name}: HP ${u.hp}/${t.hp}, power ${t.pow}, armour ${t.armor}%, block ${t.block}%, move ${t.move}, rest ${t.rec}`;
  } else if (inspectedTile) l2 = groundLine(inspectedTile.x, inspectedTile.y);
  return [l1, l2];
}

function refresh() {
  if (inCamp) return drawCamp();
  if (!state || !field) return;
  const setup = inSetup();
  const sel = setup ? setupSel && G.unitById(state, setupSel) : selected && G.unitById(state, selected);
  const usable = !setup && sel && G.canUse(state, me, sel);
  if (!usable) aim = false;
  const { moves, hits } = usable ? options(sel) : { moves: [], hits: [] };
  const heal = sel && (kindly(G.TYPES[sel.type].kind) || sel.empty);
  field.clear();
  if (setup && !ready[me] && (held || sel)) for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (G.inZone(state, me, y) && !G.ground(state, x, y).solid && !G.unitAt(state, x, y)) field.mark(x, y, 'move');
  for (const p of moves) field.mark(p.x, p.y, 'move');
  for (const p of hits) field.mark(p.x, p.y, heal ? 'heal' : 'hit');
  if (sel) field.mark(sel.x, sel.y, 'sel');
  field.flush();
  if (!renderer.xr.isPresenting) field.aim(inspectedTile ? inspectedTile.x : null, inspectedTile && inspectedTile.y);
  arrowsGroup.visible = !!usable && !(sel.frozen > 0);
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
  $('info').innerHTML = ht ? `<b>${ht.name}</b> - ${ht.cost} points, at most ${ht.limit}: HP ${ht.hp}, power ${ht.pow}, armour ${ht.armor}%, block ${ht.block}%, move ${ht.move}, rest ${ht.rec}. ${ht.info}` : u ? `<b>${G.TYPES[u.type].name}</b> - ${l2.split(': ')[1]}. ${G.TYPES[u.type].info}` : inspectedTile && G.mapOf(state.map).tiles ? l2 :
    setup ? (ready[me] ? 'You are ready. Stand down to change your team.' : 'Pick a unit type, then a tile on your own rows to place it. Tap a placed unit to move or remove it. READY when done.') :
    (myTurn() ? (usable && GROUND(G.TYPES[sel.type].kind) && !(state.active && state.active.acted) ? (aim ? 'Aiming: tap a marked tile, or tap the unit again to move instead.' : 'Tap the unit again to aim its power at empty ground.') + ' ' : usable && sel.empty ? 'Tap the unit again to reload. ' : '') + 'Pick one of your units, move (blue), act (red), then tap a yellow arrow to choose its facing and end the turn.' : '');
}

// What the picked unit may do now. A power that lands on empty ground (a flask, a summons, a breath of fire) shows its empty tiles only while aiming (tap the unit again), or once the unit has moved, so a tile is never both a move and a target.
const GROUND = k => k === 'flask' || k === 'summon' || k === 'cone', kindly = k => k === 'heal' || k === 'summon';
function options(sel) {
  const moves = aim || (state.active && state.active.moved) ? [] : G.reachable(state, sel), all = state.active && state.active.acted ? [] : G.targets(state, sel);
  return { moves, hits: all.filter(p => aim || !moves.length || G.unitAt(state, p.x, p.y)) };
}
// ---------------------------------------------------------------- input
function sendAction(action) { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'act', action })); }

function handlePick(p) {
  if (p && p.kind === 'after') return afterGo();
  if (inCamp) {
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
    const o = options(sel);
    if (has(o.hits, x, y)) { aim = false; return sendAction({ type: 'act', unit: sel.id, x, y }); }
    if (u && u.id === sel.id && GROUND(G.TYPES[sel.type].kind) && !(state.active && state.active.acted)) { aim = !aim; sound.play('select', { vol: 0.4 }); return refresh(); }
    if (!u && has(o.moves, x, y)) return sendAction({ type: 'move', unit: sel.id, x, y });
  }
  aim = false;
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
  if (p && p.kind === 'page') { if (page !== p.page) sound.play('select', { vol: 0.4 }); page = p.page; return refresh(); }
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
  if (j && j.rec) { signedIn = true; teams = j.rec.teams || []; company = j.rec.company || []; camp = j.rec.camp || { done: [] }; prog = { xp: j.rec.xp || {}, ups: j.rec.ups || {} }; }
  else { try { const p = JSON.parse(localStorage.getItem('chess-prog')); if (p && typeof p === 'object') prog = { xp: p.xp || {}, ups: G.tidyUps(p.ups, p.xp || {}) }; } catch { /* storage blocked */ }
    try { teams = JSON.parse(localStorage.getItem('chess-teams')) || []; company = JSON.parse(localStorage.getItem('chess-company')) || []; camp = JSON.parse(localStorage.getItem('chess-camp')) || { done: [] }; } catch { teams = []; } }
  if (!Array.isArray(camp.done)) camp = { done: [] };
  drawTeams();
  if (inCamp) drawCamp();
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
for (const k of GROUP_KEYS) { const h = document.createElement('h3'); h.textContent = G.GROUPS[k]; $('roster').appendChild(h);
  for (const type of typesIn(k)) { const b = document.createElement('button'); b.className = 'secondary chip'; b.dataset.type = type; b.onclick = () => handlePick({ kind: 'chip', type }); $('roster').appendChild(b); b.title = G.TYPES[type].info; } }
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
  for (const b of [...tabs3D, ...setup3D]) b.visible = on;
  for (const b of chips3D) b.visible = on && G.TYPES[b.userData.pick.type].group === page;
  $('copyBtn').hidden = !!solo;
  if (!on) return;
  const mine = state.units.filter(u => u.owner === me), cost = G.teamCost(mine), rd = ready[me];
  $('budget').textContent = `${cost} / ${state.budget ?? G.BUDGET} points - ${mine.length} unit${mine.length === 1 ? '' : 's'}`;
  for (const b of $('roster').querySelectorAll('button')) { const t = G.TYPES[b.dataset.type], n = mine.filter(u => u.type === b.dataset.type).length;
    b.textContent = `${t.name} - ${t.cost} pts - ${n}/${t.limit}`; b.classList.toggle('held', held === b.dataset.type); b.disabled = rd; }
  chips3D.forEach(b => { const type = b.userData.pick.type, t = G.TYPES[type], n = mine.filter(u => u.type === type).length; if (b.visible) b.userData.label(`${t.name}\n${t.cost} pts  ${n}/${t.limit}`, held === type ? '#9a7a2c' : '#3d434e'); });
  tabs3D.forEach(b => b.userData.label(G.GROUPS[b.userData.pick.page].toUpperCase(), b.userData.pick.page === page ? '#9a7a2c' : '#3d434e'));
  setup3D[3].userData.label(rd ? 'STAND DOWN' : 'READY', rd ? '#8a4040' : '#3f8656');
  setup3D[2].userData.label(teams.length ? (teamAt >= 0 ? teams[teamAt].name.toUpperCase().slice(0, 9) : 'SAVED') : 'NO SAVED', '#3d434e');
  $('readyBtn').textContent = rd ? 'Stand down' : 'Ready'; $('readyBtn').className = rd ? 'danger' : '';
  $('removeBtn').disabled = rd || !setupSel; $('defaultBtn').disabled = rd; $('teamSel').disabled = rd;
  $('setupMsg').textContent = setupNote;
  $('fairNote').textContent = openMatch ? 'Your upgrades count in this match.' : 'A fair match: upgrades are not used.';
}

// ---------------------------------------------------------------- the campaign: its battles as a list (the page's on a screen, the table's buttons in the headset), then the battle against the computer
for (const n of CAMPAIGN.nodes) { const b = document.createElement('button'); b.dataset.id = n.id; b.onclick = () => handlePick({ kind: 'node', id: n.id }); $('campList').appendChild(b); }
function drawCamp() {
  const n = campSel && nodeOf(campSel), open = n && isOpen(n.id, camp.done), won = n && camp.done.includes(n.id), total = CAMPAIGN.nodes.length, ar = renderer.xr.isPresenting;
  $('camp').hidden = !inCamp || ar; $('setup').hidden = true;
  for (const b of [...chips3D, ...tabs3D, ...setup3D, endButton3D]) b.visible = false;
  fight3D.visible = !!open; arrowsGroup.visible = false;
  CAMPAIGN.nodes.forEach((q, i) => {
    const w = camp.done.includes(q.id), o = isOpen(q.id, camp.done), text = (w ? '✓ ' : '') + q.name + (q.optional ? ' (side)' : ''), b = $('campList').children[i];
    b.textContent = text + (w ? '' : o ? '' : ' - not open yet'); b.className = 'node' + (q.id === campSel ? ' sel' : '') + (w ? ' won' : o ? '' : ' shut');
    nodes3D[i].visible = inCamp; nodes3D[i].userData.label(text.toUpperCase(), q.id === campSel ? '#9a7a2c' : w ? '#3f7a55' : o ? '#3d5f9a' : '#34373e', true);
  });
  const l1 = `${CAMPAIGN.name} - ${camp.done.length} of ${total} battles won` + (finished(camp.done) ? ' - the beacon burns' : '');
  $('status').textContent = l1; $('info').textContent = '';
  drawStatus(n ? n.name : l1, n ? (open ? (won ? 'Won. FIGHT to fight it again.' : 'FIGHT to begin.') : 'Not open yet.') : 'Point at a battle and pull the trigger.');
  $('campName').textContent = n ? n.name + (n.optional ? ' (a side battle)' : '') : CAMPAIGN.name;
  $('campText').textContent = n ? (won ? n.won : n.text) : CAMPAIGN.intro;
  const count = {}; if (n) for (const [type] of n.enemy) count[G.TYPES[type].name] = (count[G.TYPES[type].name] || 0) + 1;
  $('campFoe').textContent = n ? 'Against you: ' + Object.entries(count).map(([k, v]) => (v > 1 ? v + ' ' + k + 's' : 'a ' + k)).join(', ') + '.' : '';
  $('campPts').textContent = n ? (open ? `You field ${budgetFor(camp.done)} points.` + (n.gain && !won ? ` Winning adds ${n.gain}.` : '') : 'Not open yet: win ' + n.needs.filter(q => !camp.done.includes(q)).map(q => nodeOf(q).name).join(' and ') + ' first.') : `You field ${budgetFor(camp.done)} points. Fallen units are back for the next battle.`;
  $('fightBtn').hidden = !n; $('fightBtn').disabled = !open; $('fightBtn').textContent = won ? 'Fight again' : 'Fight';
  $('endBtn').hidden = true; $('copyBtn').hidden = true; $('quitBtn').textContent = 'Leave';
}
function openCampaign() {
  inCamp = true; state = null; code = null; me = -1; started = false; campSel = null; campNode = null; solo = null; companyTried = false; afterShown = false;
  if (ws) { const w = ws; ws = null; w.onclose = null; w.close(); }
  clearUnits();
  $('lobby').style.display = 'none'; $('hud').style.display = 'flex'; $('after').hidden = true; after3D.visible = false;
  setField('board'); me = 0; placePanel(); resetCamera(); me = -1;
  if (field) { field.clear(); field.flush(); }
  drawCamp();
  history.replaceState(null, '', location.pathname + '?camp=1');
}
function startBattle() {
  if (!campSel || !isOpen(campSel, camp.done)) return;
  sound.play('end', { vol: 0.5 });
  inCamp = false; for (const b of nodes3D) b.visible = false; fight3D.visible = false; $('camp').hidden = true; companyTried = false; afterShown = false;
  connect({ t: 'create', token, camp: campSel, done: camp.done, prog });
}
function keepProg() {
  prog.ups = G.tidyUps(prog.ups, prog.xp);
  if (signedIn) post('/chess/save', { ups: prog.ups }); else { try { localStorage.setItem('chess-prog', JSON.stringify(prog)); } catch { /* storage blocked */ } }
}
// The upgrade trees: a row a unit type, its level and experience, the upgrades it may take.
function drawUnits() {
  const box = $('unitRows'); box.innerHTML = '';
  for (const [type, t] of Object.entries(G.TYPES)) {
    const xp = prog.xp[type] || 0, lvl = G.levelOf(xp), mine = prog.ups[type] || [], next = G.LEVELS_XP[lvl], row = document.createElement('div');
    row.className = 'urow'; row.dataset.type = type;
    row.innerHTML = `<div class="uhead"><b>${t.name}</b> level ${lvl} <span>${next ? xp + ' / ' + next + ' experience' : xp + ' experience (highest level)'}</span> <i>${lvl - mine.length} point${lvl - mine.length === 1 ? '' : 's'} to spend</i></div>`;
    for (const u of G.UPGRADES[type]) {
      const has = mine.includes(u.id), can = !has && G.tidyUps({ [type]: [...mine, u.id] }, prog.xp)[type]?.includes(u.id), b = document.createElement('button');
      b.className = 'up ' + (has ? 'has' : can ? '' : 'secondary'); b.disabled = !has && !can; b.dataset.id = u.id;
      b.innerHTML = `<b>${u.name}</b><br>${u.info}<br><small>${has ? 'taken (tap to give back)' : 'level ' + u.tier}</small>`;
      b.onclick = () => { prog.ups[type] = has ? mine.filter(q => q !== u.id) : [...mine, u.id]; keepProg(); drawUnits(); };
      row.appendChild(b);
    }
    box.appendChild(row);
  }
  $('unitsNote').textContent = (signedIn ? 'Kept with your login.' : 'Kept in this browser; sign in on the website to keep it and to earn experience in duels.') + ' Upgrades count against the computer and in an open match; a fair match ignores them.';
}
$('unitsBtn').onclick = $('campUnits').onclick = () => { drawUnits(); $('units').hidden = false; };
$('unitsClose').onclick = () => { $('units').hidden = true; };
// When a match ends: what happened, what your units earned, and the way on.
function showAfter() {
  if (afterShown || !state || state.winner === null || me < 0) return;
  afterShown = true;
  gained = G.earned(state, me); if (solo && !campNode) for (const k in gained) gained[k] = Math.ceil(gained[k] / 2);
  const keeps = signedIn || solo || campNode;   // a duel's experience is written by the website, for a login
  if (keeps) { for (const k in gained) prog.xp[k] = Math.min(999, (prog.xp[k] || 0) + gained[k]); if (!signedIn) { try { localStorage.setItem('chess-prog', JSON.stringify(prog)); } catch { /* storage blocked */ } } }
  $('afterXp').textContent = Object.keys(gained).length ? (keeps ? 'Experience: ' + Object.entries(gained).map(([k, n]) => `${G.TYPES[k].name} +${n}`).join(', ') + '.' : 'Sign in on the website to earn experience in duels.') : '';
  const won = state.winner === me, n = campNode && nodeOf(campNode);
  if (n && won && !camp.done.includes(n.id)) { camp.done.push(n.id); if (!signedIn) { try { localStorage.setItem('chess-camp', JSON.stringify(camp)); } catch { /* storage blocked */ } } }
  $('afterTitle').textContent = n ? (won ? n.name + ': won' : n.name + ': lost') : won ? 'You win' : state.winner === -1 ? 'A draw' : 'You lose';
  $('afterText').textContent = n ? (won ? n.won + (n.gain ? ` You may field ${n.gain} more points.` : '') + (n.last ? ' The campaign is won.' : '') : 'The company falls back to its camp. Everyone will be on their feet to try again.') : '';
  $('afterBtn').textContent = n ? 'Back to the campaign' : 'Menu';
  $('after').hidden = renderer.xr.isPresenting; after3D.visible = true; after3D.userData.label(n ? 'CAMPAIGN' : 'MENU', '#3f66b8');
}
function afterGo() { if (campNode || inCamp) openCampaign(); else location.href = location.pathname; }
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
let needPlace = false, xrFrames = 0, grab = null, aimedUnit = null;
let arScale = AR_SCALE; // the table's size is yours: a grip and its thumbstick change it, and it is kept
try { const k = +localStorage.getItem('chess-ar-scale'); if (k >= 0.03 && k <= 0.12) arScale = k; } catch { /* storage blocked */ }
const controllers = [];
const tmpM = new THREE.Matrix4(), tmpV = new THREE.Vector3();

function rayFromController(c) {
  c.updateMatrixWorld(); // this frame's pose: the scene only brings it up to date when it is drawn
  tmpM.identity().extractRotation(c.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmpM);
}

for (const i of [0, 1]) {
  const c = renderer.xr.getController(i);
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.0018, 0.0018, 1).translate(0, 0, -0.5), new THREE.MeshBasicMaterial({ color: 0xdfe3ea, transparent: true, opacity: 0.3 }));   // a soft pointer, not a hard line
  line.scale.z = 0.8; line.raycast = () => {};
  c.add(line);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshBasicMaterial({ color: 0xe9cf8a }));
  dot.visible = false; dot.raycast = () => {};
  scene.add(dot);
  c.userData = { line, dot, hand: true, src: null };
  c.addEventListener('connected', e => { c.userData.src = e.data; });
  c.addEventListener('disconnected', () => { c.userData.src = null; });
  c.addEventListener('select', () => { sound.init(); rayFromController(c); const hit = pickFromRay(); handlePick(hit && hit.pick); });
  c.addEventListener('squeezestart', () => { c.updateMatrixWorld(); grab = { c, offset: world.position.clone().sub(tmpV.setFromMatrixPosition(c.matrixWorld)) }; });
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
  world.position.copy(pos).addScaledVector(dir, 0.62);
  world.position.y = Math.max(0.4, pos.y - 0.5);
  world.rotation.y = Math.atan2(-dir.x, -dir.z) + (me === 1 ? Math.PI : 0); // your own rows end up nearest you
}

renderer.xr.addEventListener('sessionstart', () => {
  scene.background = null;
  scene.fog = null;
  if (table) table.visible = false;
  world.scale.setScalar(arScale);
  slowMs = slowT = lean = 0;
  renderer.xr.setFoveation(0.7);
  applyQuality(); warm();
  sound.refDistance = 0.7;
  controls.enabled = false;
  panel.visible = true;
  controllers.forEach(c => { c.visible = true; });
  needPlace = true; xrFrames = 0;
});
renderer.xr.addEventListener('sessionend', () => {
  scene.background = BG;
  scene.fog = FOG;
  if (table) table.visible = true;
  world.scale.setScalar(1);
  sound.refDistance = 14;
  lean = 0;
  applyQuality(); warm();
  world.position.set(0, 0, 0);
  world.rotation.y = 0;
  controls.enabled = true;
  panel.visible = false;
  controllers.forEach(c => { c.visible = false; c.userData.dot.visible = false; });
  grab = null; aimedUnit = null;
  if (field) field.aim(null);
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
  const k = Math.max(cols / 9, rows / 11);
  camera.position.set(0, 10 * k, (me === 1 ? -10.5 : 10.5) * k);
  controls.target.set(0, 0, 0);
  controls.update();
}
// The skinned pieces' shader is made ready before the first piece moves, so that move does not stall a frame.
function warm() {
  const any = Object.keys(G.TYPES).find(typeReady);
  if (!any) return;
  const ch = makeCharacter(any);
  for (const owner of [0, 1]) for (const rested of [false, true]) { crowd.tint(ch.mesh, rested, owner); renderer.compile(ch.mesh, camera, scene); }
}

// In the headset a late frame is a jump in the room (a drawn frame is only turned to follow the head, never moved),
// so the frame rate is held: when frames run long, first 72 a second, then the edges of the view are drawn coarser. Nothing else changes: there are no shadows to drop.
let slowMs = 0, slowT = 0;
function govern(dt) {
  const ses = renderer.xr.isPresenting && renderer.xr.getSession();
  if (!ses || lean > 1) return;
  const hz = ses.frameRate || 72;
  slowMs += (dt * 1000 - slowMs) * 0.05;
  slowT = slowMs > 1150 / hz ? slowT + dt : 0;
  if (slowT < 2) return;
  slowT = 0;
  if (lean === 0 && hz > 72 && ses.updateTargetFrameRate) { lean = 1; ses.updateTargetFrameRate(72).catch(() => {}); }
  else { lean = 2; renderer.xr.setFoveation(1); }
}
const ONE = new THREE.Vector3(1, 1, 1), camLocal = new THREE.Vector3(), camPos = new THREE.Vector3(), camDir = new THREE.Vector3(), camUp = new THREE.Vector3(), eyeR = new THREE.Vector3(), eyeU = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
const drawn = [], named = new Set(), placeOf = id => { const g = unitMeshes.get(id); return g && g.position; };
let nextCrackle = 0;
let lastSecond = 0;
let lastTime = 0, now = 0;
renderer.setAnimationLoop(time => {
  const dt = lastTime ? Math.min(Math.max(time - lastTime, 0) / 1000, 0.1) : 0; // the frame's own time (the headset's display time), not when this code got to run
  lastTime = time; now += dt;
  govern(dt);
  const k = 1 - Math.exp(-7 * dt);
  for (const g of unitMeshes.values()) {   // a piece at rest costs nothing here: no bones, no matrices
    const d = g.userData, t = d.target, far = Math.hypot(g.position.x - t.x, g.position.z - t.z);
    let a = d.angle - g.rotation.y;
    a = Math.atan2(Math.sin(a), Math.cos(a));
    if (d.walk) {   // walking to its tile, facing the way it goes, as fast as its stride covers the ground
      const step = (d.pace || 3) * dt;
      if (far <= step || !far) { g.position.x = t.x; g.position.z = t.z; d.walk = false; }
      else { let w = Math.atan2(-(t.x - g.position.x), -(t.z - g.position.z)) - g.rotation.y; w = Math.atan2(Math.sin(w), Math.cos(w)); g.rotation.y += w * Math.min(1, k * 1.6); g.position.x += (t.x - g.position.x) / far * step; g.position.z += (t.z - g.position.z) / far * step; }
      g.position.y += (t.y - g.position.y) * k; g.scale.lerp(ONE, k); d.rest = false; crowdDirty = true;
    }
    else if (far > 0.003 || Math.abs(a) > 0.003 || Math.abs(g.scale.x - 1) > 0.003 || Math.abs(g.position.y - t.y) > 0.003) { g.position.lerp(t, k); g.scale.lerp(ONE, k); g.rotation.y += a * k; d.rest = false; crowdDirty = true; }
    else if (!d.rest) { d.rest = true; g.position.copy(t); g.scale.copy(ONE); g.rotation.y = d.angle; crowdDirty = true; }
    const ch = d.walk ? rigOf(g) : d.ch;
    if (!ch) continue;
    ch.setMoving(!!d.walk, d.hurry || 1);
    if (ch.busy) ch.update(dt);
    if (ch.busy !== d.live) { d.live = ch.busy; ch.mesh.visible = d.live; crowdDirty = true; }
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const s = floaters[i];
    s.userData.life -= dt;
    s.position.y += dt * 0.55;
    s.material.opacity = Math.min(1, s.userData.life * 2, (1.4 - s.userData.life) * 6);
    if (s.userData.life <= 0) { world.remove(s); s.material.map.dispose(); s.material.dispose(); floaters.splice(i, 1); }
  }
  for (let i = dying.length - 1; i >= 0; i--) { // fall over, lie there, then shrink away
    const d = dying[i];
    d.t += dt; crowdDirty = true;
    const f = Math.min(1, d.t / 0.6), ch = d.g.userData.ch, hold = ch ? 2.6 : 1.2;
    if (ch) ch.update(dt); // plays its own death animation
    else { d.g.rotation.x = -f * f * 1.45; d.g.position.y = 0.12 * f; }
    if (d.t > hold) d.g.scale.setScalar(Math.max(0.01, 1 - (d.t - hold) / 0.5));
    if (d.t > hold + 0.5) { unitsGroup.remove(d.g); dying.splice(i, 1); }
  }
  if (crowdDirty) { crowdDirty = false; drawn.length = 0; for (const g of unitMeshes.values()) drawn.push(g); for (const d of dying) drawn.push(d.g); crowd.sync(drawn); }
  if (field && field.fires.length && now > nextCrackle) {
    nextCrackle = now + 0.4 + Math.random() * 1.2;
    sound.crackle(worldPos(field.fires[Math.floor(Math.random() * field.fires.length)]));
  }

  if (renderer.xr.isPresenting) {
    xrFrames++;
    if (needPlace && xrFrames > 10) { placeBoardInFront(); needPlace = false; }
    if (grab) {
      grab.c.updateMatrixWorld(); world.position.copy(tmpV.setFromMatrixPosition(grab.c.matrixWorld)).add(grab.offset);
      const pad = grab.c.userData.src && grab.c.userData.src.gamepad, ax = pad && pad.axes.length >= 4 ? pad.axes : null;   // with the grip held, the thumbstick sizes and turns the table
      if (ax && Math.abs(ax[3]) > 0.25) { arScale = Math.min(0.12, Math.max(0.03, arScale * (1 - ax[3] * dt * 0.7))); world.scale.setScalar(arScale); try { localStorage.setItem('chess-ar-scale', arScale.toFixed(4)); } catch { /* storage blocked */ } }
      if (ax && Math.abs(ax[2]) > 0.25) world.rotation.y -= ax[2] * dt * 1.2;
    }
    let aimed = null; aimedUnit = null;
    for (const c of controllers) {
      rayFromController(c);
      const hit = pickFromRay();
      if (hit && hit.pick && hit.pick.kind === 'tile') aimed = hit.pick;
      if (hit && hit.pick && hit.pick.kind === 'unit') aimedUnit = hit.pick.id;
      c.userData.dot.visible = !!hit;
      if (hit) c.userData.dot.position.copy(hit.point);
    }
    if (field) field.aim(aimed ? aimed.x : null, aimed && aimed.y);
  } else controls.update();

  // the eye, in the room and in the board's own space: the sounds, the labels and the effects all turn to it
  const viewCam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  world.updateMatrixWorld();
  viewCam.getWorldPosition(camPos);
  world.worldToLocal(camLocal.copy(camPos));
  viewCam.getWorldDirection(camDir);
  camUp.set(0, 1, 0).applyQuaternion(viewCam.quaternion);
  sound.setListener(camPos, camDir, camUp);
  tmpQ.copy(world.quaternion).invert();
  eyeU.copy(camUp).applyQuaternion(tmpQ); eyeR.set(1, 0, 0).applyQuaternion(viewCam.quaternion).applyQuaternion(tmpQ);
  fx.update(dt, eyeR, eyeU);
  dungeon.tick(now);
  named.clear(); if (selected) named.add(selected); if (inspected) named.add(inspected); if (setupSel) named.add(setupSel); if (aimedUnit) named.add(aimedUnit);
  labels.update(placeOf, camLocal, charsFailed || window.__names ? true : named, renderer.xr.isPresenting ? null : eyeR, renderer.xr.isPresenting ? 1.5 : 1);

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
      openMatch = !!m.open;
      if (state.winner !== null && me >= 0) setTimeout(showAfter, wait * 1000 + 1200);
      ready = m.ready || [true, true]; seated = m.seated || present;
      if (state.phase !== 'setup') { held = null; setupSel = null; }
      if (turnChanged) aim = false;
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

{ const many = Object.keys(G.MAPS).length > 1; $('mapSel').hidden = $('mapInfo').hidden = !many; $('helpBtn').hidden = !Object.values(G.MAPS).some(m => m.tiles); }   // one battlefield for now: nothing to choose, no ground rules to read
for (const [id, m] of Object.entries(G.MAPS)) { const o = document.createElement('option'); o.value = id; o.textContent = m.name; $('mapSel').appendChild(o); }
const mapNote = () => { $('mapInfo').textContent = G.MAPS[$('mapSel').value].info; try { localStorage.setItem('map', $('mapSel').value); } catch { /* storage blocked */ } };
try { const m = localStorage.getItem('map'); if (G.MAPS[m]) $('mapSel').value = m; } catch { /* storage blocked */ }
$('mapSel').onchange = mapNote; mapNote();
$('rules').innerHTML = Object.values(G.TERRAIN).filter(t => t.info).map(t => `<b>${t.name}</b> ${t.info}`).join('<br>') + '<br><b>High ground</b> Stepping up a level costs one more move point; two levels at once cannot be climbed. Whatever works at range reaches one tile further at targets below it.';
$('helpBtn').onclick = () => { $('help').hidden = !$('help').hidden; };
$('help').onclick = () => { $('help').hidden = true; };
for (const [k, l] of Object.entries(LEVELS)) { const o = document.createElement('option'); o.value = k; o.textContent = l.name; $('levelSel').appendChild(o); }
$('levelSel').value = 'hard';
$('soloBtn').onclick = () => { sound.init(); $('lobbyMsg').textContent = ''; connect({ t: 'create', token, map: $('mapSel').value, solo: $('levelSel').value, prog }); };
$('campBtn').onclick = () => { sound.init(); openCampaign(); };
$('createBtn').onclick = () => { sound.init(); $('lobbyMsg').textContent = ''; connect({ t: 'create', token, map: $('mapSel').value, open: $('openChk').checked }); };
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

// The people load in the background; until they arrive a piece is its base and its bar.
let charsFailed = false;
let warmed = false;
loadCharacters(renderer, () => { crowdDirty = true; if (!warmed && Object.keys(G.TYPES).some(typeReady)) { warmed = true; warm(); } }).then(() => { crowdDirty = true; }).catch(err => { charsFailed = true; console.warn('Character models failed to load; pieces are shown as their bases and names.', err); });

// Hooks for automated tests.
// A map on the table with no match behind it (for pictures and checks): ?show=river, or __t.show('river').
function show(id, setup, full) {
  state = G.newGame(id, { setup: !!setup }); me = 0; code = 'SHOW'; started = false; ready = [false, false];
  if (setup) state.units = state.units.filter(u => u.owner === 0);
  if (full) for (const owner of [0, 1]) for (const type of ['bulwark', 'slinger']) {   // twelve a side, the most a team may be
    const free = []; for (let y = 0; y < state.rows; y++) for (let x = 0; x < state.cols; x++) if (G.inZone(state, owner, y) && !G.unitAt(state, x, y)) free.push({ x, y });
    const at = free[owner ? 0 : free.length - 1], like = state.units.find(u => u.owner === owner);
    state.units.push({ ...like, id: Math.max(...state.units.map(u => u.id)) + 1, type, x: at.x, y: at.y, hp: G.TYPES[type].hp });
  }
  $('lobby').style.display = 'none'; $('hud').style.display = 'flex';
  clearUnits();
  setField(state.map); syncUnits(); refresh();
}
// Any pieces on the plain board with no match behind them (for pictures and checks): [{ type, owner, x, y, facing?, ...what a piece carries }]; play: it is that side's turn.
function stage(units, play) {
  state = G.newGame('board'); me = 0; code = 'SHOW'; started = play !== undefined; ready = [false, false]; present = [true, true];
  state.units = units.map((u, i) => ({ id: i + 1, facing: u.owner ? 'S' : 'N', hp: G.TYPES[u.type].hp, rec: 0, snare: 0, ...u }));
  if (play !== undefined) { state.turn = play; me = play; }
  $('lobby').style.display = 'none'; $('hud').style.display = 'flex';
  clearUnits(); selected = inspected = null; aim = false;
  setField(state.map); syncUnits(); refresh();
  return need(units.map(u => u.type));
}
// A rule played on a staged board, as a match would show it: the action judged, its events played, the board brought up to date.
function act(player, action, rand) {
  const r = G.apply(state, player, action, rand); if (!r.ok) return r;
  const wait = playEvents(r.events);
  setTimeout(() => { syncUnits(); refresh(); }, wait * 1000);
  return r;
}
if (new URLSearchParams(location.search).get('camp')) openCampaign();
if (new URLSearchParams(location.search).get('show')) show(new URLSearchParams(location.search).get('show'), new URLSearchParams(location.search).get('setup'), new URLSearchParams(location.search).get('full'));
window.__t = { stage, act, need, typesReady, trisOf, sizeOf, clipsOf, sound, rigOf, playEvents, get page() { return page; }, get aim() { return aim; }, tabs3D, chips3D, pools, handlePick, show, world, G, drawUnits, get prog() { return prog; }, get openMatch() { return openMatch; }, openCampaign, CAMPAIGN, get camp() { return camp; }, get inCamp() { return inCamp; }, get unitsReady() { return charactersReady() && !crowdDirty && (!state || typesReady(state.units.map(u => u.type))); }, dungeon, crowd, labels, hemi, get table() { return table; }, get arScale() { return arScale; }, unitMeshes, get campSel() { return campSel; }, get solo() { return solo; }, get campNode() { return campNode; }, saveTeam, loadTeam, get teams() { return teams; }, get held() { return held; }, get ready() { return ready; }, get setupSel() { return setupSel; }, get field() { return field; }, castFx, explode, V, camera, controls, fx, sun, renderer, scene, get state() { return state; }, get me() { return me; }, get code() { return code; }, get selected() { return selected; }, get lean() { return lean; } };
