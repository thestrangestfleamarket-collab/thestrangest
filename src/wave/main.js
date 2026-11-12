// SHARDWAVE: a VR rhythm game on its own page (/wave); shares no code with THE MARKET
import * as THREE from 'three';

// ───────────────────────── constants ─────────────────────────
const qs = new URLSearchParams(location.search);
const AUTOPLAY = qs.has('autoplay'), FORCE_WALLS = qs.has('walls');
const COL = { left: 0xffa51f, right: 0x28d7ff, any: 0xffffff };
const HITZ = -0.9;          // where shards are meant to be cut
const BLADE_LEN = 0.95;
const HIT_R = 0.27;
const LEAD = 2.0;           // seconds a shard is visible before its beat
const S2 = Math.SQRT1_2;
const DIRS = { D: [0, -1], U: [0, 1], DL: [-S2, -S2], DR: [S2, -S2], UL: [-S2, S2], UR: [S2, S2], A: null };
const DIFFS = {
  easy: { label: 'Easy', speed: 9, fail: false },
  normal: { label: 'Normal', speed: 12, fail: true },
  hard: { label: 'Hard', speed: 15, fail: true },
};
const COLS_X = [-0.675, -0.225, 0.225, 0.675];

const rngFrom = seed => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const store = {
  get(k) { try { return +localStorage.getItem('shardwave_' + k) || 0; } catch { return 0; } },
  set(k, v) { try { localStorage.setItem('shardwave_' + k, v); } catch { /* storage unavailable */ } },
};

// ───────────────────────── renderer / scene ─────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06041a);
scene.fog = new THREE.Fog(0x06041a, 18, 75);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 400);
camera.position.set(0, 1.6, 0.8);
scene.add(new THREE.HemisphereLight(0xffffff, 0x3a2a90, 1.3));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
sunLight.position.set(1, 2, 3);
scene.add(sunLight);
addEventListener('resize', () => {
  if (renderer.xr.isPresenting) return;
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function makeCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return { c, g: c.getContext('2d'), tex };
}

// ───────────────────────── environment ─────────────────────────
const env = {};
{
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 90), new THREE.MeshBasicMaterial({ color: 0x0c0930 }));
  runway.rotation.x = -Math.PI / 2; runway.position.set(0, 0, -43); scene.add(runway);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x6a4cff });
  for (const x of [-1.2, -0.45, 0, 0.45, 1.2]) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(x) > 1 ? 0.05 : 0.015, 90), lineMat);
    l.rotation.x = -Math.PI / 2; l.position.set(x, 0.006, -43); scene.add(l);
  }
  // stripes that scroll toward the player
  env.stripeGeo = new THREE.PlaneGeometry(2.4, 0.05).rotateX(-Math.PI / 2);
  env.stripes = new THREE.InstancedMesh(env.stripeGeo, new THREE.MeshBasicMaterial({ color: 0x3a2aa8 }), 24);
  env.stripes.frustumCulled = false; scene.add(env.stripes); env.scroll = 0;
  // platform
  const plat = new THREE.Mesh(new THREE.CircleGeometry(1.3, 6), new THREE.MeshBasicMaterial({ color: 0x15104a }));
  plat.rotation.x = -Math.PI / 2; plat.position.y = 0.004; scene.add(plat);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.36, 6), new THREE.MeshBasicMaterial({ color: 0xff4fa3 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.008; scene.add(ring);
  // pillars that pulse with the bass
  const rnd = rngFrom(7);
  env.pillarMat = new THREE.MeshBasicMaterial({ color: 0x241a80 });
  env.pillars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), env.pillarMat, 36);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 36; i++) {
    const side = i % 2 ? 1 : -1, h = 2 + rnd() * 9;
    m.makeScale(0.8 + rnd() * 0.8, h, 0.8 + rnd() * 0.8);
    m.setPosition(side * (3.2 + rnd() * 3.5), 0, -3 - Math.floor(i / 2) * 4.2 - rnd() * 2);
    env.pillars.setMatrixAt(i, m);
  }
  scene.add(env.pillars);
  // striped sun on the horizon
  const s = makeCanvas(512, 512), g = s.g;
  const grad = g.createLinearGradient(0, 40, 0, 480);
  grad.addColorStop(0, '#ffe07a'); grad.addColorStop(0.55, '#ff7a3d'); grad.addColorStop(1, '#ff2d95');
  g.fillStyle = grad; g.beginPath(); g.arc(256, 256, 230, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 7; i++) g.clearRect(0, 280 + i * 32, 512, 5 + i * 3);
  s.tex.needsUpdate = true;
  env.sun = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshBasicMaterial({ map: s.tex, transparent: true, fog: false, depthWrite: false }));
  env.sun.position.set(0, 16, -260); scene.add(env.sun);
  // stars
  const sp = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++) {
    const a = rnd() * Math.PI * 2, e = 0.05 + rnd() * 1.4, r = 300;
    sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfc8ff, size: 1.3, fog: false, sizeAttenuation: true })));
}

// ───────────────────────── audio ─────────────────────────
let ctx, master, analyser, freqData, noiseBuf, musicBus, sfxBus, delaySend;
function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; freqData = new Uint8Array(analyser.frequencyBinCount);
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    newMusicBus();
  }
  if (ctx.state === 'suspended' && state !== 'paused') ctx.resume();
}
function newMusicBus() {
  if (musicBus) musicBus.disconnect();
  if (delaySend) delaySend.disconnect();
  musicBus = ctx.createGain(); musicBus.connect(master);
  delaySend = ctx.createGain(); delaySend.gain.value = 0.3;
  const dl = ctx.createDelay(1), fb = ctx.createGain(); dl.delayTime.value = 0.33; fb.gain.value = 0.35;
  delaySend.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(musicBus);
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function kick(t, out, v = 1) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  o.connect(g).connect(out); o.start(t); o.stop(t + 0.34);
}
function noiseHit(t, out, type, freq, v, d) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  s.connect(f).connect(g).connect(out); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
}
function tone(t, outs, type, freq, v, a, d, cut) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  o.connect(f).connect(g); for (const out of outs) g.connect(out);
  o.start(t); o.stop(t + a + d + 0.05);
}

// ───────────────────────── built-in tracks ─────────────────────────
const SEC_LEVEL = { intro: 1, verse: 2, build: 2, drop: 3, break: 1, outro: 1 };
const TRACKS = [
  { id: 'glass', name: 'Glass Horizon', bpm: 104, seed: 11, root: 45, prog: [[0, 'm'], [-4, 'M'], [3, 'M'], [-2, 'M']],
    kick: 'x.....x...x.....', bass: 'x..x..x.x..x..x.',
    sections: [['intro', 4], ['verse', 8], ['build', 4], ['drop', 8], ['break', 4], ['drop', 8], ['outro', 4]] },
  { id: 'undertow', name: 'Neon Undertow', bpm: 126, seed: 23, root: 43, prog: [[0, 'm'], [3, 'M'], [-2, 'M'], [-4, 'M']],
    kick: 'x...x...x...x...', bass: '..x...x...x...x.',
    sections: [['intro', 4], ['verse', 8], ['build', 4], ['drop', 8], ['break', 8], ['build', 4], ['drop', 12], ['outro', 4]] },
  { id: 'redline', name: 'Redline Bloom', bpm: 150, seed: 37, root: 40, prog: [[0, 'm'], [-4, 'M'], [-2, 'M'], [3, 'M']],
    kick: 'x.....x.x.....x.', bass: 'x.x...x.x.x...x.',
    sections: [['intro', 4], ['verse', 8], ['build', 4], ['drop', 16], ['break', 8], ['build', 4], ['drop', 16], ['outro', 4]] },
];
for (const tr of TRACKS) {
  tr.synth = true;
  tr.stepDur = 60 / tr.bpm / 4;
  tr.bars = [];
  for (const [type, n] of tr.sections) for (let i = 0; i < n; i++) tr.bars.push({ type, i, n });
  tr.duration = tr.bars.length * 16 * tr.stepDur;
  // 8-bar lead melody, a seeded walk over the minor pentatonic
  const rnd = rngFrom(tr.seed), pent = [0, 3, 5, 7, 10, 12, 15, 17];
  let idx = 3; tr.lead = [];
  for (let b = 0; b < 8; b++) {
    const bar = new Array(16).fill(null);
    for (let s = 0; s < 16; s += 2) {
      if (rnd() < (s % 4 === 0 ? 0.8 : 0.5)) {
        idx = clamp(idx + Math.floor(rnd() * 5) - 2, 0, pent.length - 1);
        bar[s] = tr.root + 24 + pent[idx];
      }
    }
    tr.lead.push(bar);
  }
}
function scheduleStep(tr, step, t) {
  const bar = Math.floor(step / 16), s = step % 16, sec = tr.bars[bar];
  if (!sec) return;
  const ty = sec.type, [cr, ct] = tr.prog[bar % 4], root = tr.root + cr, out = musicBus;
  const K = ty !== 'intro' && ty !== 'break', S = ty === 'verse' || ty === 'drop';
  const B = ty === 'verse' || ty === 'drop' || ty === 'build' || ty === 'outro', L = ty === 'drop' || ty === 'break';
  if (K && tr.kick[s] === 'x') kick(t, out, ty === 'outro' ? 0.7 : 1);
  if (S && (s === 4 || s === 12)) { noiseHit(t, out, 'bandpass', 1800, 0.55, 0.16); tone(t, [out], 'triangle', 185, 0.25, 0.002, 0.08, 2000); }
  if (ty === 'build') {
    const every = sec.i >= sec.n - 1 ? 1 : sec.i >= sec.n - 2 ? 2 : 4;
    if (s % every === 0) noiseHit(t, out, 'bandpass', 1800, 0.2 + 0.35 * (sec.i * 16 + s) / (sec.n * 16), 0.1);
  }
  if (ty === 'drop') noiseHit(t, out, 'highpass', 7000, s % 2 ? 0.07 : 0.14, 0.04);
  else if (ty !== 'outro' && s % 4 === 2) noiseHit(t, out, 'highpass', 7000, 0.12, 0.05);
  if (B && tr.bass[s] === 'x') tone(t, [out], 'sawtooth', mtof(root), 0.26, 0.005, tr.stepDur * 1.6, 520);
  if (s === 0) {
    const third = ct === 'm' ? 3 : 4, len = tr.stepDur * 16;
    for (const n of [12, 12 + third, 19]) tone(t, [out], 'sawtooth', mtof(root + n), ty === 'drop' ? 0.035 : 0.05, 0.25, len, 800);
  }
  const ln = tr.lead[bar % 8][s];
  if (L && ln != null) tone(t, [out, delaySend], 'square', mtof(ln), ty === 'drop' ? 0.07 : 0.05, 0.005, 0.24, 2400);
}

const RHYTHM = {
  easy: { 1: [[0], [0, 8]], 2: [[0, 8], [0, 8, 12]], 3: [[0, 4, 8, 12], [0, 8, 12]] },
  normal: { 1: [[0, 8]], 2: [[0, 4, 8, 12], [0, 4, 8]], 3: [[0, 4, 8, 10, 12], [0, 4, 6, 8, 12], [0, 2, 4, 8, 12, 14]] },
  hard: { 1: [[0, 4, 8, 12]], 2: [[0, 4, 6, 8, 12, 14], [0, 2, 4, 8, 10, 12]], 3: [[0, 2, 4, 6, 8, 10, 12, 14], [0, 2, 4, 6, 8, 12, 14], [0, 3, 6, 8, 10, 12, 14]] },
};
function synthMap(tr, dk, withObstacles) {
  const rnd = rngFrom(tr.seed * 100 + Object.keys(DIFFS).indexOf(dk));
  const events = [], obstacles = [], barDur = tr.stepDur * 16;
  const pDbl = { easy: 0, normal: 0.25, hard: 0.4 }[dk];
  let wallSide = 0;
  tr.bars.forEach((sec, bar) => {
    if (bar === 0 || bar === tr.bars.length - 1) return;
    let level = SEC_LEVEL[sec.type];
    if (sec.type === 'build' && sec.i === sec.n - 1) level = 3;
    const pats = RHYTHM[dk][level], pat = pats[Math.floor(rnd() * pats.length)];
    for (const s of pat) events.push({ t: (bar * 16 + s) * tr.stepDur, dbl: level === 3 && s === 0 && rnd() < pDbl });
    if (withObstacles && dk !== 'easy') {
      if ((sec.type === 'verse' && sec.i === 2) || (sec.type === 'drop' && sec.i % 8 === 4))
        obstacles.push({ t: bar * barDur, dur: barDur, type: wallSide++ % 2 ? 'left' : 'right' });
      if (sec.type === 'break' && sec.i === 1) obstacles.push({ t: bar * barDur + barDur / 2, dur: 0.25, type: 'duck' });
    }
  });
  return { events, obstacles, duration: tr.duration, rnd };
}

// ───────────────────────── your own songs ─────────────────────────
function analyze(buf) {
  const sr = buf.sampleRate, hop = 512, frames = Math.floor(buf.length / hop);
  const c0 = buf.getChannelData(0), c1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : null;
  const eL = new Float32Array(frames), eF = new Float32Array(frames), a = 1 - Math.exp(-2 * Math.PI * 150 / sr);
  let lp = 0;
  for (let f = 0; f < frames; f++) {
    let sl = 0, sf = 0; const o = f * hop;
    for (let i = 0; i < hop; i++) {
      const x = c1 ? (c0[o + i] + c1[o + i]) * 0.5 : c0[o + i];
      lp += a * (x - lp); sl += lp * lp; sf += x * x;
    }
    eL[f] = Math.log(1 + 1000 * sl / hop); eF[f] = Math.log(1 + 1000 * sf / hop);
  }
  const flux = new Float32Array(frames), ps = new Float32Array(frames + 1);
  for (let f = 1; f < frames; f++) flux[f] = Math.max(0, eL[f] - eL[f - 1]) * 1.5 + Math.max(0, eF[f] - eF[f - 1]);
  for (let f = 0; f < frames; f++) ps[f + 1] = ps[f] + flux[f];
  const W = Math.round(0.5 * sr / hop), peaks = [];
  for (let f = 3; f < frames - 3; f++) {
    const lo = Math.max(0, f - W), hi = Math.min(frames, f + W), mean = (ps[hi] - ps[lo]) / (hi - lo), v = flux[f];
    if (v < mean * 1.6 + 0.05) continue;
    let top = true;
    for (let k = -3; k <= 3; k++) if (flux[f + k] > v) { top = false; break; }
    if (top) peaks.push({ t: f * hop / sr, s: v - mean });
  }
  return peaks;
}
function customMap(tr, dk, withObstacles) {
  const rnd = rngFrom(99 + Object.keys(DIFFS).indexOf(dk));
  const gap = { easy: 0.55, normal: 0.33, hard: 0.2 }[dk];
  const byStrength = tr.peaks.filter(p => p.t > 1.5 && p.t < tr.duration - 1).sort((a, b) => b.s - a.s);
  const strong = byStrength.length ? byStrength[Math.floor(byStrength.length * 0.12)].s : 0;
  const kept = [];
  for (const p of byStrength) if (!kept.some(k => Math.abs(k.t - p.t) < gap)) kept.push(p);
  kept.sort((a, b) => a.t - b.t);
  const events = kept.map(p => ({ t: p.t, dbl: dk !== 'easy' && p.s >= strong && rnd() < 0.3 }));
  const obstacles = [];
  if (withObstacles && dk !== 'easy')
    for (let t = 14, i = 0; t < tr.duration - 6; t += 18, i++) obstacles.push({ t, dur: 2, type: i % 2 ? 'left' : 'right' });
  return { events, obstacles, duration: tr.duration, rnd };
}
const customTracks = [];
async function loadCustom(file) {
  ensureAudio();
  const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
  const tr = { id: 'custom_' + file.name, name: file.name.replace(/\.[^.]+$/, '').slice(0, 26), buffer, duration: buffer.duration, peaks: analyze(buffer) };
  customTracks.unshift(tr); customTracks.length = Math.min(customTracks.length, 2);
  sel.track = tr; buildMenu();
  return tr;
}

// ───────────────────────── note pattern generator ─────────────────────────
function generateNotes({ events, obstacles, rnd }, dk) {
  const notes = [], st = { left: { up: true, last: -9 }, right: { up: true, last: -9 } };
  const pDiag = { easy: 0, normal: 0.25, hard: 0.4 }[dk], pAny = { easy: 0.4, normal: 0.1, hard: 0.04 }[dk];
  const add = (t, side) => {
    const s = st[side], up = !s.up; s.up = up; s.last = t;
    let dir = up ? 'U' : 'D';
    const r = rnd();
    if (r < pAny) dir = 'A';
    else if (r < pAny + pDiag) dir += (rnd() < 0.7) === (side === 'left') ? 'L' : 'R';
    let cols = side === 'left' ? [0, 1, 1] : [2, 2, 3];
    const wall = obstacles.find(o => o.type !== 'duck' && t > o.t - 0.3 && t < o.t + o.dur + 0.3);
    if (wall) cols = wall.type === 'left' ? [2, 3] : [0, 1];
    const col = cols[Math.floor(rnd() * cols.length)];
    let row = dir === 'A' ? Math.floor(rnd() * 2) : up ? 1 + Math.floor(rnd() * 2) : Math.floor(rnd() * 2);
    const clash = notes.find(n => Math.abs(n.t - t) < 0.12 && n.col === col && n.row === row);
    if (clash) row = (row + 1) % 3;
    notes.push({ t, side, col, row, dir: DIRS[dir] });
  };
  let next = 'right';
  for (const e of events) {
    if (obstacles.some(o => o.type === 'duck' && e.t > o.t - 0.5 && e.t < o.t + o.dur + 0.35)) continue;
    if (e.dbl) { add(e.t, 'left'); add(e.t, 'right'); continue; }
    let side = next;
    const other = side === 'left' ? 'right' : 'left';
    if (rnd() < 0.15 && e.t - st[other].last > 0.5) side = other;
    add(e.t, side);
    next = side === 'left' ? 'right' : 'left';
  }
  return notes;
}

// ───────────────────────── blades / hands ─────────────────────────
const TRAIL_N = 12;
function makeHand(i) {
  const group = new THREE.Group();
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const shape = r => new THREE.CylinderGeometry(r, r, BLADE_LEN, 8).rotateX(-Math.PI / 2).translate(0, 0, -0.05 - BLADE_LEN / 2);
  group.add(new THREE.Mesh(shape(0.011), coreMat), new THREE.Mesh(shape(0.03), glowMat));
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.15, 10).rotateX(Math.PI / 2).translate(0, 0, 0.025), new THREE.MeshBasicMaterial({ color: 0x2a2a3a }));
  group.add(grip);
  const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1, 6).rotateX(-Math.PI / 2).translate(0, 0, -0.5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, fog: false }));
  laser.position.z = -1; group.add(laser);
  scene.add(group);
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 6), 3));
  tg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 6), 3));
  const ix = [];
  for (let k = 0; k < TRAIL_N - 1; k++) { const a = k * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  tg.setIndex(ix);
  const trail = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  trail.frustumCulled = false; scene.add(trail);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  dot.visible = false; scene.add(dot);
  const h = {
    i, group, coreMat, glowMat, laser, trail, dot, side: 'any', color: new THREE.Color(),
    src: null, input: null, connected: false, valid: false, reset: true, btnPrev: false, hover: null,
    base: new THREE.Vector3(), tip: new THREE.Vector3(), pBase: new THREE.Vector3(), pTip: new THREE.Vector3(), vel: new THREE.Vector3(),
  };
  setSide(h, i === 0 ? 'left' : 'right');
  return h;
}
function setSide(h, side) {
  h.side = side; h.color.setHex(COL[side]);
  h.glowMat.color.copy(h.color); h.coreMat.color.copy(h.color).lerp(new THREE.Color(0xffffff), 0.55);
}
const hands = [makeHand(0), makeHand(1)];
for (const h of hands) {
  const c = renderer.xr.getController(h.i); h.src = c; scene.add(c);
  c.addEventListener('connected', e => {
    h.input = e.data; h.connected = true; h.reset = true;
    if (e.data.handedness === 'left' || e.data.handedness === 'right') {
      setSide(h, e.data.handedness);
      const o = hands[1 - h.i]; if (o.side === h.side) setSide(o, h.side === 'left' ? 'right' : 'left');
    }
  });
  c.addEventListener('disconnected', () => { h.input = null; h.connected = false; });
  c.addEventListener('selectstart', () => { ensureAudio(); if (h.hover) h.hover.fn(); });
}
function buzz(h, power, ms) {
  const gp = h.input && h.input.gamepad; if (!gp) return;
  try {
    if (gp.hapticActuators && gp.hapticActuators[0]) gp.hapticActuators[0].pulse(power, ms);
    else if (gp.vibrationActuator) gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: power, weakMagnitude: power });
  } catch { /* haptics unsupported */ }
}

// ───────────────────────── shards, debris, particles, popups ─────────────────────────
const gemGeo = new THREE.OctahedronGeometry(0.21).scale(1, 1, 0.62);
const gemMat = {};
for (const s of ['left', 'right']) gemMat[s] = new THREE.MeshLambertMaterial({ color: COL[s], emissive: COL[s], emissiveIntensity: 0.5, flatShading: true });
const arrowShape = new THREE.Shape(); arrowShape.moveTo(-0.1, -0.05); arrowShape.lineTo(0.1, -0.05); arrowShape.lineTo(0, 0.1); arrowShape.closePath();
const arrowGeo = new THREE.ShapeGeometry(arrowShape), ringGeo = new THREE.RingGeometry(0.035, 0.065, 20);
const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const notePool = [];
function getNoteMesh() {
  let m = notePool.find(x => !x.visible);
  if (!m) {
    m = new THREE.Group();
    m.gem = new THREE.Mesh(gemGeo, gemMat.left); m.arrow = new THREE.Mesh(arrowGeo, markMat); m.ring = new THREE.Mesh(ringGeo, markMat);
    m.arrow.position.z = m.ring.position.z = 0.14;
    m.add(m.gem, m.arrow, m.ring); scene.add(m); notePool.push(m);
  }
  m.visible = true; return m;
}
const debrisGeo = new THREE.TetrahedronGeometry(0.15), debris = [];
for (let i = 0; i < 32; i++) {
  const mesh = new THREE.Mesh(debrisGeo, gemMat.left); mesh.visible = false; scene.add(mesh);
  debris.push({ mesh, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0 });
}
const P_N = 400, pPos = new Float32Array(P_N * 3).fill(-999), pCol = new Float32Array(P_N * 3), pVel = new Float32Array(P_N * 3), pLife = new Float32Array(P_N);
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
particles.frustumCulled = false; scene.add(particles);
let pNext = 0, dNext = 0;
const tmpC = new THREE.Color();
function burst(x, y, z, hex, dx, dy) {
  tmpC.setHex(hex);
  for (let k = 0; k < 16; k++) {
    const i = pNext = (pNext + 1) % P_N;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    pVel[i * 3] = dx * 2 + (Math.random() - 0.5) * 4; pVel[i * 3 + 1] = dy * 2 + (Math.random() - 0.5) * 4; pVel[i * 3 + 2] = Math.random() * 4;
    pCol[i * 3] = tmpC.r; pCol[i * 3 + 1] = tmpC.g; pCol[i * 3 + 2] = tmpC.b; pLife[i] = 0.5;
  }
  for (const sgn of [-1, 1]) {
    const d = debris[dNext = (dNext + 1) % debris.length];
    d.mesh.material = gemMat[hex === COL.left ? 'left' : 'right']; d.mesh.visible = true; d.mesh.scale.setScalar(1);
    d.mesh.position.set(x - dy * 0.08 * sgn, y + dx * 0.08 * sgn, z);
    d.vel.set(-dy * 2.4 * sgn + dx * 1.5, dx * 2.4 * sgn + dy * 1.5, 4);
    d.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8); d.life = 0.55;
  }
}
const popTex = {};
for (const [label, color] of [['PERFECT', '#fff3a8'], ['GREAT', '#9ff3ff'], ['GOOD', '#d6d0ff'], ['MISS', '#ff5c7f'], ['BAD CUT', '#ff5c7f']]) {
  const L = makeCanvas(256, 64); L.g.font = '800 44px system-ui, sans-serif'; L.g.textAlign = 'center'; L.g.textBaseline = 'middle';
  L.g.fillStyle = color; L.g.fillText(label, 128, 34); L.tex.needsUpdate = true; popTex[label] = L.tex;
}
const pops = [];
for (let i = 0; i < 8; i++) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: popTex.GOOD, transparent: true, depthWrite: false, fog: false }));
  sp.scale.set(0.56, 0.14, 1); sp.visible = false; scene.add(sp); pops.push({ sp, life: 0 });
}
let popNext = 0;
function popup(label, x, y) {
  const p = pops[popNext = (popNext + 1) % pops.length];
  p.sp.material.map = popTex[label]; p.sp.position.set(x, y, -1.3); p.sp.visible = true; p.life = 0.7;
}

// ───────────────────────── UI panels ─────────────────────────
const FONT = 'system-ui, sans-serif';
let allBtns = [];
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
class Btn {
  constructor(parent, x, y, w, h, label, fn, o = {}) {
    Object.assign(this, { root: parent, label, fn, sub: o.sub || '', accent: o.accent || '#8f7bff', selected: false, hov: false });
    this.L = makeCanvas(512, Math.round(512 * h / w));
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: this.L.tex, transparent: true, fog: false }));
    this.mesh.position.set(x, y, 0); this.mesh.userData.btn = this; this.mesh.material.color.setScalar(0.8);
    parent.add(this.mesh); allBtns.push(this); this.draw();
  }
  draw() {
    const { c, g } = this.L, W = c.width, H = c.height;
    g.clearRect(0, 0, W, H);
    rr(g, 4, 4, W - 8, H - 8, 22); g.fillStyle = this.selected ? this.accent : 'rgba(20,14,70,0.92)'; g.fill();
    g.lineWidth = 6; g.strokeStyle = this.accent; g.stroke();
    g.fillStyle = this.selected ? '#12092e' : '#f1eeff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let size = Math.min(H * 0.42, 58); g.font = `700 ${size}px ${FONT}`;
    while (g.measureText(this.label).width > W - 50 && size > 18) g.font = `700 ${size -= 2}px ${FONT}`;
    g.fillText(this.label, W / 2, this.sub ? H * 0.4 : H / 2 + 2);
    if (this.sub) { g.font = `500 ${Math.min(H * 0.2, 26)}px ${FONT}`; g.fillText(this.sub, W / 2, H * 0.75); }
    this.L.tex.needsUpdate = true;
  }
  setHover(v) { if (v === this.hov) return; this.hov = v; this.mesh.scale.setScalar(v ? 1.05 : 1); this.mesh.material.color.setScalar(v ? 1 : 0.8); }
}
function panel(parent, x, y, w, h, pxW = 1024) {
  const L = makeCanvas(pxW, Math.round(pxW * h / w));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, fog: false, depthWrite: false }));
  mesh.position.set(x, y, 0); parent.add(mesh);
  return L;
}
function clearGroup(grp) {
  allBtns = allBtns.filter(b => b.root !== grp);
  for (const ch of [...grp.children]) { grp.remove(ch); ch.material.map.dispose(); ch.material.dispose(); ch.geometry.dispose(); }
}

const sel = { track: TRACKS[0], diff: 'normal' };
const menuGroup = new THREE.Group(); menuGroup.position.set(0, 0, -2.4); scene.add(menuGroup);
function buildMenu() {
  clearGroup(menuGroup);
  const T = panel(menuGroup, 0, 2.42, 2.6, 0.5), g = T.g;
  g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.font = `800 110px ${FONT}`;
  g.fillText('S H A R D W A V E', 512, 108);
  g.fillStyle = '#b9b2e6'; g.font = `500 30px ${FONT}`; g.fillText('Cut each shard with the matching blade, the way its arrow points', 512, 168);
  T.tex.needsUpdate = true;
  const list = [...TRACKS, ...customTracks];
  list.forEach((tr, i) => {
    const mins = Math.floor(tr.duration / 60) + ':' + String(Math.floor(tr.duration % 60)).padStart(2, '0');
    const b = new Btn(menuGroup, -0.72, 1.92 - i * 0.31, 1.35, 0.27, tr.name, () => { sel.track = tr; buildMenu(); },
      { sub: (tr.synth ? tr.bpm + ' BPM · ' : 'Your song · ') + mins });
    b.selected = sel.track === tr; b.draw();
  });
  Object.entries(DIFFS).forEach(([k, d], i) => {
    const b = new Btn(menuGroup, 0.78, 1.92 - i * 0.31, 1.05, 0.27, d.label, () => { sel.diff = k; buildMenu(); },
      { accent: '#28d7ff', sub: k === 'easy' ? 'No fail, no walls' : k === 'normal' ? 'Walls and doubles' : 'Fast and dense' });
    b.selected = sel.diff === k; b.draw();
  });
  const best = store.get(sel.track.id + '_' + sel.diff);
  const play = new Btn(menuGroup, 0.78, 0.88, 1.05, 0.4, 'PLAY', () => startSong(sel.track, sel.diff),
    { accent: '#ffa51f', sub: best ? 'Best ' + best.toLocaleString() : 'No score yet' });
  play.selected = true; play.draw();
}
const pauseGroup = new THREE.Group(); pauseGroup.position.set(0, 0, -1.9); pauseGroup.visible = false; scene.add(pauseGroup);
new Btn(pauseGroup, 0, 1.75, 1.1, 0.26, 'Resume', () => resume(), { accent: '#ffa51f' });
new Btn(pauseGroup, 0, 1.43, 1.1, 0.26, 'Restart', () => startSong(cur.track, cur.dk));
new Btn(pauseGroup, 0, 1.11, 1.1, 0.26, 'Song menu', () => toMenu());
const resultGroup = new THREE.Group(); resultGroup.position.set(0, 0, -2.2); resultGroup.visible = false; scene.add(resultGroup);
function buildResults(failed) {
  clearGroup(resultGroup);
  const R = panel(resultGroup, 0, 1.85, 2.2, 1.1), g = R.g, total = cur.notes.length;
  const ratio = total ? cur.raw / (total * 115) : 0;
  const rank = failed ? '–' : ratio >= 0.85 ? 'S' : ratio >= 0.7 ? 'A' : ratio >= 0.55 ? 'B' : ratio >= 0.4 ? 'C' : 'D';
  const key = cur.track.id + '_' + cur.dk, prev = store.get(key), isBest = !failed && cur.score > prev;
  if (isBest) store.set(key, cur.score);
  rr(g, 6, 6, 1012, 500, 30); g.fillStyle = 'rgba(14,9,54,0.94)'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#8f7bff'; g.stroke();
  g.textAlign = 'center'; g.fillStyle = failed ? '#ff5c7f' : '#ffffff'; g.font = `800 64px ${FONT}`;
  g.fillText(failed ? 'OUT OF ENERGY' : 'TRACK CLEAR', 512, 90);
  g.fillStyle = '#b9b2e6'; g.font = `500 34px ${FONT}`; g.fillText(cur.track.name + ' · ' + DIFFS[cur.dk].label, 512, 140);
  g.fillStyle = '#ffa51f'; g.font = `800 150px ${FONT}`; g.fillText(rank, 190, 350);
  g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = `700 72px ${FONT}`; g.fillText(cur.score.toLocaleString(), 360, 265);
  g.fillStyle = '#d6d0ff'; g.font = `500 38px ${FONT}`;
  g.fillText(`Cut ${cur.hits} of ${total}`, 360, 330); g.fillText(`Longest combo ${cur.maxCombo}`, 360, 385);
  g.fillStyle = isBest ? '#fff3a8' : '#8f88c8'; g.fillText(isBest ? 'New best!' : 'Best ' + Math.max(prev, 0).toLocaleString(), 360, 440);
  R.tex.needsUpdate = true;
  new Btn(resultGroup, -0.58, 1.05, 1.0, 0.28, 'Play again', () => startSong(cur.track, cur.dk), { accent: '#ffa51f' });
  new Btn(resultGroup, 0.58, 1.05, 1.0, 0.28, 'Song menu', () => toMenu());
}

// HUD
const hudGroup = new THREE.Group(); hudGroup.position.set(0, 0, -7); hudGroup.visible = false; scene.add(hudGroup);
const hud = panel(hudGroup, 0, 3.25, 4.2, 0.5);
const barBack = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.07), new THREE.MeshBasicMaterial({ color: 0x1c1560, fog: false }));
barBack.position.set(0, 2.88, -0.01); hudGroup.add(barBack);
const unitGeo = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0);
const energyBar = new THREE.Mesh(unitGeo, new THREE.MeshBasicMaterial({ color: 0x5dff9b, fog: false }));
energyBar.position.set(-1.2, 2.88, 0); energyBar.scale.set(1.2, 0.07, 1); hudGroup.add(energyBar);
const progBar = new THREE.Mesh(unitGeo, new THREE.MeshBasicMaterial({ color: 0x8f7bff, fog: false }));
progBar.position.set(-1.2, 2.81, 0); progBar.scale.set(0.001, 0.018, 1); hudGroup.add(progBar);
function drawHud() {
  const g = hud.g; g.clearRect(0, 0, 1024, 122);
  g.textBaseline = 'middle'; g.font = `800 76px ${FONT}`; g.textAlign = 'center'; g.fillStyle = '#ffffff';
  g.fillText(cur.score.toLocaleString(), 512, 64);
  g.font = `700 50px ${FONT}`; g.textAlign = 'left'; g.fillStyle = '#ffa51f'; g.fillText('COMBO ' + cur.combo, 20, 66);
  g.textAlign = 'right'; g.fillStyle = '#28d7ff'; g.fillText('×' + mult(), 1004, 66);
  hud.tex.needsUpdate = true;
}

// ───────────────────────── game state ─────────────────────────
let state = 'menu';
const cur = { notes: [], obstacles: [], score: 0, raw: 0, hits: 0, combo: 0, maxCombo: 0, energy: 0.5 };
let active = [], t0 = 0, songT = 0, hudDirty = true, wallHit = false;
const mult = () => (cur.combo >= 28 ? 8 : cur.combo >= 12 ? 4 : cur.combo >= 4 ? 2 : 1);
const inXR = () => renderer.xr.isPresenting;
const headPos = new THREE.Vector3();
const obMat = new THREE.MeshBasicMaterial({ color: 0xff2d6f, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
const obLine = new THREE.LineBasicMaterial({ color: 0xff7aa5 });
const obGeo = new THREE.BoxGeometry(1, 1, 1), obEdges = new THREE.EdgesGeometry(obGeo);

function clearPlayfield() {
  for (const m of notePool) m.visible = false;
  for (const o of cur.obstacles) if (o.mesh) scene.remove(o.mesh);
  for (const d of debris) d.mesh.visible = false;
  for (const p of pops) p.sp.visible = false;
  active = [];
}
function stopMusic() { if (ctx) { if (cur.src) { try { cur.src.stop(); } catch { /* already stopped */ } cur.src = null; } newMusicBus(); } }
function show(which) {
  menuGroup.visible = which === 'menu'; pauseGroup.visible = which === 'paused'; resultGroup.visible = which === 'results';
  hudGroup.visible = which === 'playing' || which === 'paused';
  state = which;
}
function startSong(track, dk) {
  ensureAudio(); stopMusic(); clearPlayfield();
  if (ctx.state === 'suspended') ctx.resume();
  const headY = inXR() ? clamp(renderer.xr.getCamera().position.y, 1.0, 2.1) : 1.6;
  const map = track.synth ? synthMap(track, dk, inXR() || FORCE_WALLS) : customMap(track, dk, inXR() || FORCE_WALLS);
  Object.assign(cur, {
    track, dk, speed: DIFFS[dk].speed, rowsY: [headY - 0.85, headY - 0.5, headY - 0.15], headY,
    notes: generateNotes(map, dk), obstacles: map.obstacles, duration: map.duration,
    next: 0, step: 0, score: 0, raw: 0, hits: 0, combo: 0, maxCombo: 0, energy: 0.5, src: null,
  });
  for (const o of cur.obstacles) {
    if (o.type === 'duck') Object.assign(o, { x0: -1.5, x1: 1.5, y0: headY - 0.3, y1: headY + 0.7 });
    else Object.assign(o, o.type === 'left' ? { x0: -1.6, x1: -0.05 } : { x0: 0.05, x1: 1.6 }, { y0: 0, y1: 3.2 });
    o.mesh = new THREE.Mesh(obGeo, obMat); o.mesh.add(new THREE.LineSegments(obEdges, obLine));
    o.mesh.visible = false; scene.add(o.mesh);
  }
  t0 = ctx.currentTime + 2.6;
  if (!track.synth) { cur.src = ctx.createBufferSource(); cur.src.buffer = track.buffer; cur.src.connect(musicBus); cur.src.start(t0); }
  hudDirty = true; show('playing');
}
function pause() { if (state !== 'playing') return; ctx.suspend(); show('paused'); }
function resume() { if (state !== 'paused') return; show('playing'); ctx.resume(); }
function toMenu() { stopMusic(); clearPlayfield(); show('menu'); buildMenu(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
function finish(failed) { stopMusic(); clearPlayfield(); buildResults(failed); show('results'); }

function loseCombo(amount) {
  cur.combo = 0; cur.energy -= amount; hudDirty = true;
  if (cur.energy <= 0) { cur.energy = 0; if (DIFFS[cur.dk].fail) finish(true); }
}
function miss(n, label) {
  n.done = true; n.mesh.visible = false;
  popup(label, n.x, n.y);
  if (ctx) tone(ctx.currentTime, [sfxBus], 'sawtooth', 70, 0.3, 0.005, 0.18, 400);
  loseCombo(label === 'MISS' ? 0.07 : 0.06);
}
function goodCut(n, h, acc, speed, dx, dy) {
  n.done = true; n.mesh.visible = false;
  const pts = Math.round(60 + 40 * acc + Math.min(15, (speed - 1.3) * 4));
  cur.combo++; cur.maxCombo = Math.max(cur.maxCombo, cur.combo); cur.hits++; cur.raw += pts; cur.score += pts * mult();
  cur.energy = Math.min(1, cur.energy + 0.015); hudDirty = true;
  popup(acc > 0.75 ? 'PERFECT' : acc > 0.45 ? 'GREAT' : 'GOOD', n.x, n.y + 0.25);
  burst(n.x, n.y, n.z, COL[n.side], dx, dy);
  noiseHit(ctx.currentTime, sfxBus, 'highpass', 3500, 0.35, 0.07);
  buzz(h, 0.8, 60);
}
const tA = new THREE.Vector3(), tB = new THREE.Vector3(), tP = new THREE.Vector3(), tQ = new THREE.Vector3(), nPos = new THREE.Vector3();
function distToSeg(p, a, b, out) {
  tQ.subVectors(b, a); const t = clamp(tP.subVectors(p, a).dot(tQ) / tQ.lengthSq(), 0, 1);
  out.copy(a).addScaledVector(tQ, t); return out.distanceTo(p);
}
const hitPt = new THREE.Vector3(), bestPt = new THREE.Vector3();
function checkCuts(h) {
  for (const n of active) {
    if (n.done || n.z < -2.4) continue;
    nPos.set(n.x, n.y, n.z);
    let best = 9;
    for (let k = 0; k <= 3; k++) {
      tA.lerpVectors(h.pBase, h.base, k / 3); tB.lerpVectors(h.pTip, h.tip, k / 3);
      const d = distToSeg(nPos, tA, tB, hitPt); if (d < best) { best = d; bestPt.copy(hitPt); }
    }
    if (best > HIT_R) continue;
    const speed = h.vel.length(); if (speed < 1.3) continue;
    const vx = h.vel.x, vy = h.vel.y, l = Math.hypot(vx, vy);
    if (h.side !== 'any' && h.side !== n.side) { buzz(h, 1, 150); miss(n, 'BAD CUT'); continue; }
    if (n.dir) {
      if (l < 0.6) continue;
      if ((vx * n.dir[0] + vy * n.dir[1]) / l < 0.25) { buzz(h, 1, 150); miss(n, 'BAD CUT'); continue; }
    }
    const off = l > 0.6 ? Math.abs((n.x - bestPt.x) * vy / l - (n.y - bestPt.y) * vx / l) : HIT_R * 0.5;
    goodCut(n, h, clamp(1 - off / HIT_R, 0, 1), speed, l > 0.01 ? vx / l : 0, l > 0.01 ? vy / l : -1);
    if (state !== 'playing') return;
  }
}

// ───────────────────────── desktop input / autoplay ─────────────────────────
const mouse = new THREE.Vector2(0, -0.3), ray = new THREE.Raycaster();
addEventListener('pointermove', e => mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1));
renderer.domElement.addEventListener('pointerdown', () => { ensureAudio(); if (!inXR() && hands[0].hover) hands[0].hover.fn(); });
addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'p') state === 'playing' ? pause() : resume(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
function desktopPose(h) {
  h.group.quaternion.identity();
  if (AUTOPLAY && state === 'playing') {
    const n = active.find(x => !x.done && x.side === h.side && Math.abs(x.t - songT) < 0.12);
    if (n) {
      const d = n.dir || DIRS.D, f = -(n.t - songT) / 0.12 * 0.5;
      if (h.target !== n) { h.target = n; h.reset = true; }
      h.group.position.set(n.x + d[0] * f, n.y + d[1] * f, HITZ + 0.5);
    } else {
      if (h.target) h.reset = true; h.target = null;
      h.group.position.set(h.side === 'left' ? -0.35 : 0.35, 0.5, 0.2);
    }
    return true;
  }
  if (h.i === 1) return false;
  ray.setFromCamera(mouse, camera);
  const o = ray.ray.origin, d = ray.ray.direction, t = (HITZ - o.z) / d.z;
  h.group.position.set(o.x + d.x * t, o.y + d.y * t, HITZ + 0.5);
  return true;
}

// ───────────────────────── per-frame update ─────────────────────────
const fwd = new THREE.Vector3(), tv = new THREE.Vector3(), im = new THREE.Matrix4();
function updateHand(h, dt) {
  let ok;
  if (inXR()) {
    ok = h.connected && h.src.visible;
    if (ok) { h.group.position.copy(h.src.position); h.group.quaternion.copy(h.src.quaternion); }
  } else {
    const want = AUTOPLAY ? (h.i === 0 ? 'left' : 'right') : 'any';
    if (h.side !== want) setSide(h, want);
    ok = desktopPose(h);
  }
  h.group.visible = h.trail.visible = ok;
  if (!ok) { h.valid = false; h.hover = null; h.dot.visible = false; return; }
  fwd.set(0, 0, -1).applyQuaternion(h.group.quaternion);
  h.base.copy(h.group.position).addScaledVector(fwd, 0.05);
  h.tip.copy(h.group.position).addScaledVector(fwd, 0.05 + BLADE_LEN);
  const fresh = !h.valid || h.reset;
  if (fresh) { h.vel.set(0, 0, 0); h.pBase.copy(h.base); h.pTip.copy(h.tip); }
  else h.vel.lerp(tv.subVectors(h.tip, h.pTip).divideScalar(dt), 0.6);
  // trail
  const pa = h.trail.geometry.attributes.position, ca = h.trail.geometry.attributes.color, P = pa.array, C = ca.array;
  if (fresh) for (let k = 0; k < TRAIL_N; k++) { h.base.toArray(P, k * 6); h.tip.toArray(P, k * 6 + 3); }
  else { P.copyWithin(6, 0, (TRAIL_N - 1) * 6); h.base.toArray(P, 0); h.tip.toArray(P, 3); }
  for (let k = 0; k < TRAIL_N; k++) {
    const f = Math.pow(1 - k / (TRAIL_N - 1), 2) * 0.55;
    for (let j = 0; j < 2; j++) { C[k * 6 + j * 3] = h.color.r * f; C[k * 6 + j * 3 + 1] = h.color.g * f; C[k * 6 + j * 3 + 2] = h.color.b * f; }
  }
  pa.needsUpdate = ca.needsUpdate = true;

  if (state === 'playing' && !fresh) checkCuts(h);
  h.pBase.copy(h.base); h.pTip.copy(h.tip); h.valid = true; h.reset = false;

  // menus: point and click
  const pointing = state !== 'playing';
  h.laser.visible = pointing && inXR();
  let hit = null;
  if (pointing) {
    if (inXR()) ray.set(h.tip, fwd); else ray.setFromCamera(mouse, camera);
    const meshes = allBtns.filter(b => b.root.visible).map(b => b.mesh);
    hit = ray.intersectObjects(meshes, false)[0] || null;
    h.laser.scale.z = hit ? hit.distance : 6;
  }
  const btn = hit ? hit.object.userData.btn : null;
  if (h.hover && h.hover !== btn && !hands.some(o => o !== h && o.hover === h.hover)) h.hover.setHover(false);
  h.hover = btn; if (btn) btn.setHover(true);
  h.dot.visible = !!hit && inXR(); if (hit) h.dot.position.copy(hit.point);
  // pause with any face button
  const gp = inXR() && h.input && h.input.gamepad;
  if (gp) {
    const down = !!((gp.buttons[4] && gp.buttons[4].pressed) || (gp.buttons[5] && gp.buttons[5].pressed));
    if (down && !h.btnPrev) { if (state === 'playing') pause(); else if (state === 'paused') resume(); }
    h.btnPrev = down;
  }
}

function updatePlay(dt) {
  const tr = cur.track, v = cur.speed, lat = ctx.outputLatency || 0;
  if (tr.synth) while (cur.step < tr.bars.length * 16 && t0 + cur.step * tr.stepDur < ctx.currentTime + 0.3) {
    const t = t0 + cur.step * tr.stepDur; if (t > ctx.currentTime - 0.03) scheduleStep(tr, cur.step, t); cur.step++;
  }
  songT = ctx.currentTime - t0 - lat;
  while (cur.next < cur.notes.length && cur.notes[cur.next].t - songT < LEAD) {
    const n = cur.notes[cur.next++]; n.done = false; n.x = COLS_X[n.col]; n.y = cur.rowsY[n.row];
    const m = n.mesh = getNoteMesh(); m.gem.material = gemMat[n.side];
    m.arrow.visible = !!n.dir; m.ring.visible = !n.dir;
    if (n.dir) m.arrow.rotation.z = Math.atan2(n.dir[1], n.dir[0]) - Math.PI / 2;
    active.push(n);
  }
  for (const n of active) {
    if (n.done) continue;
    n.z = HITZ - (n.t - songT) * v;
    n.mesh.position.set(n.x, n.y, n.z);
    n.mesh.scale.setScalar(clamp((LEAD - (n.t - songT)) * 4, 0.01, 1));
    if (n.z > 0.7) { miss(n, 'MISS'); if (state !== 'playing') return; }
  }
  active = active.filter(n => !n.done);
  // walls and beams
  if (inXR()) headPos.copy(renderer.xr.getCamera().position); else headPos.set(0, 1.6, 0);
  let inside = false;
  for (const o of cur.obstacles) {
    const front = -(o.t - songT) * v, back = front - o.dur * v;
    o.mesh.visible = front > -LEAD * v && back < 3;
    if (!o.mesh.visible) continue;
    o.mesh.position.set((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, (front + back) / 2);
    o.mesh.scale.set(o.x1 - o.x0, o.y1 - o.y0, front - back);
    if (headPos.z < front + 0.1 && headPos.z > back - 0.1 && headPos.x > o.x0 - 0.1 && headPos.x < o.x1 + 0.1 && headPos.y + 0.1 > o.y0 && headPos.y - 0.1 < o.y1) inside = true;
  }
  if (inside) {
    if (!wallHit) { for (const h of hands) buzz(h, 1, 200); loseCombo(0.06); }
    else { cur.energy -= dt * 0.25; if (cur.energy <= 0) loseCombo(0); }
    if (state !== 'playing') return;
  }
  wallHit = inside; obMat.opacity = inside ? 0.6 : 0.3;
  // HUD
  if (hudDirty) { drawHud(); hudDirty = false; }
  energyBar.scale.x = Math.max(0.001, cur.energy * 2.4);
  energyBar.material.color.setHex(cur.energy < 0.25 ? 0xff5c7f : 0x5dff9b);
  progBar.scale.x = clamp(songT / cur.duration, 0.001, 1) * 2.4;
  if (songT > cur.duration + 0.8) finish(false);
}

let lastT = 0, pulse = 0;
renderer.setAnimationLoop(time => {
  const dt = clamp((time - lastT) / 1000, 0.001, 0.05); lastT = time;
  if (state === 'playing') updatePlay(dt);
  for (const h of hands) updateHand(h, dt);
  // effects keep animating in every state except pause
  if (state !== 'paused') {
    for (let i = 0; i < P_N; i++) {
      if (pLife[i] <= 0) continue;
      pLife[i] -= dt;
      if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; continue; }
      pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
    }
    pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = true;
    for (const d of debris) {
      if (!d.mesh.visible) continue;
      d.life -= dt; if (d.life <= 0) { d.mesh.visible = false; continue; }
      d.mesh.position.addScaledVector(d.vel, dt);
      d.mesh.rotation.x += d.spin.x * dt; d.mesh.rotation.y += d.spin.y * dt; d.mesh.scale.setScalar(d.life / 0.55);
    }
    for (const p of pops) {
      if (!p.sp.visible) continue;
      p.life -= dt; if (p.life <= 0) { p.sp.visible = false; continue; }
      p.sp.position.y += dt * 0.5; p.sp.material.opacity = Math.min(1, p.life * 3);
    }
    let bass = 0;
    if (analyser) { analyser.getByteFrequencyData(freqData); bass = (freqData[1] + freqData[2] + freqData[3]) / 765; }
    pulse = Math.max(bass, pulse - dt * 2.5);
    env.pillarMat.color.setHSL(0.7 + pulse * 0.1, 0.75, 0.14 + pulse * 0.16);
    env.sun.scale.setScalar(1 + pulse * 0.05);
    env.scroll = (env.scroll + dt * (state === 'playing' ? cur.speed : 2)) % 3.2;
    for (let i = 0; i < 24; i++) { im.makeTranslation(0, 0.01, -76 + i * 3.2 + env.scroll); env.stripes.setMatrixAt(i, im); }
    env.stripes.instanceMatrix.needsUpdate = true;
  }
  renderer.render(scene, camera);
});

// ───────────────────────── page controls ─────────────────────────
const $ = id => document.getElementById(id);
const msg = $('msg'), vrBtn = $('vr');
if (navigator.xr && navigator.xr.isSessionSupported) {
  navigator.xr.isSessionSupported('immersive-vr').then(ok => {
    vrBtn.disabled = !ok;
    msg.textContent = ok ? 'Headset ready. Stand in a clear space, arms free.' : 'No VR headset found — playing in desktop mode.';
  }).catch(() => { msg.textContent = 'VR is blocked on this page — playing in desktop mode.'; });
} else msg.textContent = location.protocol === 'https:' || location.hostname === 'localhost'
  ? 'This browser has no WebXR — playing in desktop mode.' : 'VR needs this page to be served over https.';
vrBtn.addEventListener('click', async () => {
  ensureAudio();
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
    session.addEventListener('visibilitychange', () => { if (session.visibilityState !== 'visible') pause(); });
    await renderer.xr.setSession(session);
  } catch (e) { msg.textContent = 'Could not start VR: ' + e.message; }
});
renderer.xr.addEventListener('sessionstart', () => { for (const h of hands) { h.reset = true; setSide(h, h.i === 0 ? 'left' : 'right'); } });
renderer.xr.addEventListener('sessionend', () => { pause(); for (const h of hands) h.reset = true; });
$('file').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  msg.textContent = 'Reading ' + f.name + '…';
  try { const tr = await loadCustom(f); msg.textContent = `Added "${tr.name}" — found ${tr.peaks.length} beats. Pick it in the song list.`; }
  catch (err) { msg.textContent = 'Could not read that audio file (' + err.message + ').'; }
  e.target.value = '';
});

buildMenu();
window.__sw = { cur, hands, get state() { return state; }, get songT() { return songT; }, start: (i, dk) => startSong([...TRACKS, ...customTracks][i], dk), loadCustom, pause, resume, TRACKS };
