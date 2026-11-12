// SHARDWAVE: a VR rhythm game on its own page (/wave); shares no code with THE MARKET
import * as THREE from 'three';
import rockMp3 from '../../data/wave/rock.mp3';

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
renderer.xr.setFramebufferScaleFactor(1.1);
renderer.localClippingEnabled = true;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020108);
scene.fog = new THREE.Fog(0x020108, 14, 95);
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
const SEC_TINT = { intro: 0x5a48ff, verse: 0x3f6bff, build: 0x9a4dff, drop: 0xff3ec8, break: 0x2fd6a8, outro: 0x5a48ff };
const env = { tint: new THREE.Color(0x5a48ff), target: new THREE.Color(0x5a48ff), wave: 99, lastBass: 0, beatT: 0, scroll: 0, flash: 0 };
const addMat = (color, opacity = 1, map = null) => new THREE.MeshBasicMaterial({ color, map, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
const glowTex = (() => {
  const L = makeCanvas(128, 128), g = L.g, gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); L.tex.needsUpdate = true; return L.tex;
})();
const ringTex = (() => {
  const L = makeCanvas(128, 128), g = L.g, gr = g.createRadialGradient(64, 64, 34, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); L.tex.needsUpdate = true; return L.tex;
})();
const stripTex = (() => {
  const L = makeCanvas(64, 4), g = L.g, gr = g.createLinearGradient(0, 0, 64, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 4); L.tex.needsUpdate = true; return L.tex;
})();
{
  const rnd = rngFrom(7);
  const flat = (w, l, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m; };
  // sky: a dome that glows at the horizon in the scene's colour
  const sk = makeCanvas(4, 256), sg = sk.g.createLinearGradient(0, 0, 0, 256);
  sg.addColorStop(0, '#000'); sg.addColorStop(0.36, '#050505'); sg.addColorStop(0.47, '#3a3a3a'); sg.addColorStop(0.5, '#8a8a8a'); sg.addColorStop(0.53, '#2a2a2a'); sg.addColorStop(0.7, '#000');
  sk.g.fillStyle = sg; sk.g.fillRect(0, 0, 4, 256); sk.tex.needsUpdate = true;
  env.sky = new THREE.Mesh(new THREE.SphereGeometry(350, 24, 16), new THREE.MeshBasicMaterial({ map: sk.tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(env.sky);
  // runway: a floating slab with a faint etched pattern and lit edges
  const rw = makeCanvas(256, 256), g = rw.g;
  g.fillStyle = '#05041a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,110,255,${rnd() * 0.07})`; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1); }
  g.strokeStyle = 'rgba(110,95,255,0.22)'; g.lineWidth = 2;
  for (let y = 0; y <= 256; y += 64) for (let x = (y / 64) % 2 ? -32 : 0; x < 256; x += 64) { g.beginPath(); g.moveTo(x, y + 32); g.lineTo(x + 32, y); g.lineTo(x + 64, y + 32); g.stroke(); }
  rw.tex.wrapS = rw.tex.wrapT = THREE.RepeatWrapping; rw.tex.repeat.set(2, 80); rw.tex.anisotropy = 8; rw.tex.needsUpdate = true;
  env.runTex = rw.tex;
  flat(2.6, 120, new THREE.MeshBasicMaterial({ map: rw.tex }), 0, 0, -58);
  const under = flat(2.6, 120, new THREE.MeshBasicMaterial({ color: 0x010006 }), 0, -0.12, -58); under.rotation.x = Math.PI / 2;
  env.edgeMat = addMat(0xffffff, 1); env.softMat = addMat(0xffffff, 0.4, stripTex);
  for (const x of [-1.3, 1.3]) { flat(0.04, 120, env.edgeMat, x, 0.008, -58); flat(0.9, 120, env.softMat, x, 0.006, -58); }
  const laneMat = addMat(0x3a30a0, 0.7);
  for (const x of [-0.45, 0, 0.45]) flat(0.012, 120, laneMat, x, 0.005, -58);
  env.stripes = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.6, 0.06).rotateX(-Math.PI / 2), addMat(0x4a3ad0, 0.55), 24);
  env.stripes.frustumCulled = false; scene.add(env.stripes);
  // platform
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.1, 0.14, 6), new THREE.MeshLambertMaterial({ color: 0x0b0930, flatShading: true }));
  plat.position.y = -0.07; scene.add(plat);
  const rim = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.36, 6), env.edgeMat); rim.rotation.x = -Math.PI / 2; rim.rotation.z = Math.PI / 6; rim.position.y = 0.012; scene.add(rim);
  env.platGlow = flat(5, 5, addMat(0xffffff, 0.25, glowTex), 0, 0.004, 0);
  // gates: light races down them on every kick
  env.gates = [];
  const gateGeo = new THREE.RingGeometry(5.7, 5.86, 6, 1), gateSoft = new THREE.RingGeometry(5.3, 6.3, 6, 1);
  { const uv = gateSoft.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, i < uv.count / 2 ? 0 : 1, 0.5); }
  for (let i = 0; i < 16; i++) {
    const mat = addMat(0xffffff, 0.3), soft = addMat(0xffffff, 0.2, stripTex), m = new THREE.Mesh(gateGeo, mat);
    m.add(new THREE.Mesh(gateSoft, soft)); m.position.set(0, 2.1, -8 - i * 7); m.rotation.z = Math.PI / 6 + i * 0.1;
    scene.add(m); env.gates.push({ m, mat, soft });
  }
  // light beams that sweep at the sides
  env.beams = [];
  const beamGeo = new THREE.PlaneGeometry(0.7, 90).translate(0, 45, 0);
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, mat = addMat(COL[side < 0 ? 'left' : 'right'], 0.2, stripTex), m = new THREE.Mesh(beamGeo, mat);
    m.position.set(side * 7.5, -6, -14 - Math.floor(i / 2) * 12); scene.add(m); env.beams.push({ m, mat, side, ph: i * 0.9 });
  }
  // drifting monoliths: big dark shards that catch the scene's light
  env.rocks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1), new THREE.MeshLambertMaterial({ color: 0x1b1840, flatShading: true }), 54);
  env.rockData = [];
  for (let i = 0; i < 54; i++) {
    const side = i % 2 ? 1 : -1;
    env.rockData.push({ x: side * (9 + rnd() * 26), y: -9 + rnd() * 26, z: -6 - rnd() * 130, sx: 0.8 + rnd() * 2.2, sy: 2 + rnd() * 7, rx: rnd() * 0.5, rz: (rnd() - 0.5) * 0.9, sp: (rnd() - 0.5) * 0.25, ph: rnd() * 6 });
  }
  scene.add(env.rocks);
  // skyline of crystal peaks against the horizon glow
  const pts = [], N = 160;
  for (let i = 0; i <= N; i++) {
    const a = i / N * Math.PI * 2, r = 300, h = 4 + Math.pow(rnd(), 2.2) * 46 * (0.4 + 0.6 * Math.abs(Math.sin(a * 3 + 1)));
    const a2 = (i + 0.5) / N * Math.PI * 2;
    pts.push(Math.cos(a) * r, -30, Math.sin(a) * r, Math.cos(a2) * r, h, Math.sin(a2) * r, Math.cos((i + 1) / N * Math.PI * 2) * r, -30, Math.sin((i + 1) / N * Math.PI * 2) * r);
  }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
  scene.add(new THREE.Mesh(sgeo, new THREE.MeshBasicMaterial({ color: 0x010005, fog: false, side: THREE.DoubleSide })));
  // striped sun and its haze
  const s = makeCanvas(512, 512), c = s.g;
  const grad = c.createLinearGradient(0, 40, 0, 480);
  grad.addColorStop(0, '#fff1b0'); grad.addColorStop(0.5, '#ff8a3d'); grad.addColorStop(1, '#ff2d95');
  c.fillStyle = grad; c.beginPath(); c.arc(256, 256, 230, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 8; i++) c.clearRect(0, 262 + i * 30, 512, 4 + i * 3);
  s.tex.needsUpdate = true;
  env.haze = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), addMat(0xffffff, 0.5, glowTex)); env.haze.position.set(0, 14, -290); scene.add(env.haze);
  env.sun = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), new THREE.MeshBasicMaterial({ map: s.tex, transparent: true, fog: false, depthWrite: false }));
  env.sun.position.set(0, 15, -280); scene.add(env.sun);
  // stars, and motes that streak past
  const sp = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const a = rnd() * Math.PI * 2, e = 0.08 + rnd() * 1.45, r = 330;
    sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
  }
  const stg = new THREE.BufferGeometry(); stg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(stg, new THREE.PointsMaterial({ color: 0xcfc8ff, size: 1.6, map: glowTex, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })));
  env.moteN = 320; env.motes = new Float32Array(env.moteN * 3);
  for (let i = 0; i < env.moteN; i++) {
    const a = rnd() * Math.PI * 2, r = 2.4 + rnd() * 12;
    env.motes[i * 3] = Math.cos(a) * r; env.motes[i * 3 + 1] = 2 + Math.sin(a) * r * 0.7; env.motes[i * 3 + 2] = -110 + rnd() * 116;
  }
  env.moteGeo = new THREE.BufferGeometry(); env.moteGeo.setAttribute('position', new THREE.BufferAttribute(env.motes, 3));
  env.moteMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, map: glowTex, transparent: true, opacity: 0.7, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
  const mp = new THREE.Points(env.moteGeo, env.moteMat); mp.frustumCulled = false; scene.add(mp);
}

// ───────────────────────── audio ─────────────────────────
let ctx, master, analyser, freqData, noiseBuf, musicBus, sfxBus, delaySend, reverb, reverbSend, pumpBus, drumBus;
function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; freqData = new Uint8Array(analyser.frequencyBinCount);
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
    reverb = ctx.createConvolver();
    const ir = ctx.createBuffer(2, ctx.sampleRate * 2.6, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const b = ir.getChannelData(c); for (let i = 0; i < b.length; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / b.length, 2.6); }
    reverb.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.5; reverb.connect(wet); wet.connect(master);
    const sfxWet = ctx.createGain(); sfxWet.gain.value = 0.25; sfxBus.connect(sfxWet); sfxWet.connect(reverb);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    newMusicBus();
  }
  if (ctx.state === 'suspended' && state !== 'paused') ctx.resume();
}
function newMusicBus() {
  for (const n of [musicBus, delaySend, reverbSend, pumpBus, drumBus]) if (n) n.disconnect();
  musicBus = ctx.createGain(); musicBus.connect(master);
  pumpBus = ctx.createGain(); pumpBus.connect(musicBus); drumBus = ctx.createGain(); drumBus.connect(musicBus);
  reverbSend = ctx.createGain(); reverbSend.gain.value = 0.5; reverbSend.connect(reverb);
  delaySend = ctx.createGain(); delaySend.gain.value = 0.3;
  const dl = ctx.createDelay(1), fb = ctx.createGain(); dl.delayTime.value = 0.33; fb.gain.value = 0.35;
  delaySend.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(musicBus); dl.connect(reverbSend);
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

function supersaw(t, outs, freq, v, d, cut) {
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4;
  f.frequency.setValueAtTime(cut * 2.2, t); f.frequency.exponentialRampToValueAtTime(cut * 0.5, t + d);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  for (const det of [-14, -5, 0, 6, 13]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det; o.connect(f); o.start(t); o.stop(t + d + 0.05); }
  f.connect(g); for (const out of outs) g.connect(out);
}
function sweep(t, out, from, to, d, v) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + d);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * 0.95); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.05);
  s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + d + 0.1);
}
function pluck(freq, pan, v) {
  const t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'triangle'; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq * 2;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g); o2.connect(g);
  if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p).connect(sfxBus); } else g.connect(sfxBus);
  o.start(t); o2.start(t); o.stop(t + 0.25); o2.stop(t + 0.25);
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
  const ty = sec.type, [cr, ct] = tr.prog[bar % 4], root = tr.root + cr, out = drumBus, mel = pumpBus;
  const K = ty !== 'intro' && ty !== 'break', S = ty === 'verse' || ty === 'drop';
  const B = ty === 'verse' || ty === 'drop' || ty === 'build' || ty === 'outro', L = ty === 'drop' || ty === 'break';
  if (K && tr.kick[s] === 'x') {
    kick(t, out, ty === 'outro' ? 0.7 : 1);
    if (ty === 'drop' || ty === 'verse') { pumpBus.gain.setValueAtTime(ty === 'drop' ? 0.35 : 0.6, t); pumpBus.gain.linearRampToValueAtTime(1, t + tr.stepDur * 1.8); }
  }
  if (s === 0 && sec.i === 0 && (ty === 'drop' || ty === 'break')) { noiseHit(t, reverbSend, 'highpass', 4500, 0.5, 1.8); noiseHit(t, out, 'highpass', 6000, 0.25, 1.2); if (ty === 'drop') tone(t, [out], 'sine', 55, 0.9, 0.004, 0.9, 200); }
  if (s === 0 && ty === 'build' && sec.i === sec.n - 1) sweep(t, reverbSend, 300, 9000, tr.stepDur * 16, 0.4);
  if (S && (s === 4 || s === 12)) { noiseHit(t, out, 'bandpass', 1800, 0.55, 0.16); noiseHit(t, reverbSend, 'bandpass', 2400, 0.3, 0.22); tone(t, [out], 'triangle', 185, 0.25, 0.002, 0.08, 2000); }
  if (ty === 'build') {
    const every = sec.i >= sec.n - 1 ? 1 : sec.i >= sec.n - 2 ? 2 : 4;
    if (s % every === 0) noiseHit(t, out, 'bandpass', 1800, 0.2 + 0.35 * (sec.i * 16 + s) / (sec.n * 16), 0.1);
  }
  if (ty === 'drop') noiseHit(t, out, 'highpass', 7000, s % 2 ? 0.07 : 0.14, 0.04);
  else if (ty !== 'outro' && s % 4 === 2) noiseHit(t, out, 'highpass', 7000, 0.12, 0.05);
  if (B && tr.bass[s] === 'x') { tone(t, [mel], 'sawtooth', mtof(root), 0.24, 0.005, tr.stepDur * 1.6, ty === 'drop' ? 700 : 480); tone(t, [mel], 'sine', mtof(root - 12), 0.3, 0.005, tr.stepDur * 1.8, 300); }
  if (s === 0) {
    const third = ct === 'm' ? 3 : 4, len = tr.stepDur * 16;
    for (const n of [12, 12 + third, 19, 24]) tone(t, [mel, reverbSend], 'sawtooth', mtof(root + n), ty === 'drop' ? 0.03 : 0.045, 0.25, len, ty === 'intro' || ty === 'break' ? 1100 : 800);
  }
  const ln = tr.lead[bar % 8][s];
  if (L && ln != null) { if (ty === 'drop') supersaw(t, [mel, delaySend, reverbSend], mtof(ln), 0.05, 0.3, 2600); else tone(t, [mel, delaySend, reverbSend], 'triangle', mtof(ln), 0.09, 0.005, 0.4, 3000); }
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
const BUNDLED = [{ id: 'rock', name: 'We Will Rock You', bytes: rockMp3, duration: 124.7, karaoke: [
  [12.5, "Buddy you're a boy make a big noise\nPlayin' in the street gonna be a big man some day!"], [17.5, "You got mud on yo' face\nYou big disgrace"],
  [20, "Kickin' your can all over the place, singin'"], [25, 'We will we will rock you!'],
  [35, "Buddy you're a young man hard man\nShoutin' in the street gonna take on the world some day"], [42.5, "You got blood on yo' face\nYou big disgrace!"],
  [45, "Wavin' your banner all over the place"], [47.5, 'We will we will rock you!'], [52.5, "Singin' We will we will rock you!"],
  [60, "Buddy you're an old man poor man\nPleadin' with your eyes gonna make you some peace some day"], [65, 'You got mud on your face\nYou big disgrace!'],
  [67.5, 'Somebody better put you back into your place!'], [72.5, 'We will we will rock you!'], [75, "Singin'"], [77.5, 'We will we will rock you!'],
  [82.5, 'Everybody! We will we will rock you!'], [90, 'We will we will rock you!'], [93, ''], [95, '* ROCK OUT!!! *'], [121, ''] ] }];
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
  const pDiag = { easy: 0, normal: 0.25, hard: 0.4 }[dk], pAny = { easy: 1, normal: 0.1, hard: 0.04 }[dk];
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
const TRAIL_N = 18;
function makeHand(i) {
  const group = new THREE.Group();
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const shape = r => new THREE.CylinderGeometry(r, r, BLADE_LEN, 8).rotateX(-Math.PI / 2).translate(0, 0, -0.05 - BLADE_LEN / 2);
  const glow2 = glowMat.clone(); glow2.opacity = 0.13;
  const tipGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7, fog: false })); tipGlow.position.z = -0.05 - BLADE_LEN; tipGlow.scale.setScalar(0.22);
  group.add(new THREE.Mesh(shape(0.011), coreMat), new THREE.Mesh(shape(0.03), glowMat), new THREE.Mesh(shape(0.065), glow2), tipGlow);
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
    i, group, coreMat, glowMat, glow2, tipGlow, laser, trail, dot, side: 'any', color: new THREE.Color(),
    src: null, input: null, connected: false, valid: false, reset: true, btnPrev: false, hover: null,
    base: new THREE.Vector3(), tip: new THREE.Vector3(), pBase: new THREE.Vector3(), pTip: new THREE.Vector3(), vel: new THREE.Vector3(),
  };
  setSide(h, i === 0 ? 'left' : 'right');
  return h;
}
function setSide(h, side) {
  h.side = side; h.color.setHex(COL[side]);
  h.glowMat.color.copy(h.color); h.glow2.color.copy(h.color); h.tipGlow.material.color.copy(h.color); h.coreMat.color.copy(h.color).lerp(new THREE.Color(0xffffff), 0.55);
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
const gemGeo = new THREE.OctahedronGeometry(0.21).scale(1, 1, 0.62), gemEdges = new THREE.EdgesGeometry(gemGeo);
const gemMat = {}, edgeMat = {}, haloMat = {}, floorMat = {}, flashMat = {};
for (const s of ['left', 'right']) {
  gemMat[s] = new THREE.MeshLambertMaterial({ color: new THREE.Color(COL[s]).multiplyScalar(0.3), emissive: COL[s], emissiveIntensity: 0.22, flatShading: true });
  edgeMat[s] = new THREE.LineBasicMaterial({ color: new THREE.Color(COL[s]).lerp(new THREE.Color(0xffffff), 0.35), fog: false });
  haloMat[s] = new THREE.SpriteMaterial({ map: glowTex, color: COL[s], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6, fog: false });
  floorMat[s] = addMat(COL[s], 0.4, glowTex);
}
const floorGeo = new THREE.PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2);
const arrowShape = new THREE.Shape(); arrowShape.moveTo(-0.1, -0.05); arrowShape.lineTo(0.1, -0.05); arrowShape.lineTo(0, 0.1); arrowShape.closePath();
const arrowGeo = new THREE.ShapeGeometry(arrowShape), ringGeo = new THREE.RingGeometry(0.035, 0.065, 20);
const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
const notePool = [];
function getNoteMesh() {
  let m = notePool.find(x => !x.visible);
  if (!m) {
    m = new THREE.Group();
    m.body = new THREE.Group();
    m.gem = new THREE.Mesh(gemGeo, gemMat.left); m.edges = new THREE.LineSegments(gemEdges, edgeMat.left); m.edges.scale.setScalar(1.02);
    m.arrow = new THREE.Mesh(arrowGeo, markMat); m.ring = new THREE.Mesh(ringGeo, markMat);
    m.arrow.position.z = m.ring.position.z = 0.14;
    m.halo = new THREE.Sprite(haloMat.left); m.halo.scale.setScalar(1.05); m.floor = new THREE.Mesh(floorGeo, floorMat.left);
    m.body.add(m.gem, m.edges, m.arrow, m.ring); m.add(m.body, m.halo, m.floor); scene.add(m); notePool.push(m);
  }
  m.visible = true; return m;
}
const debris = [];
for (let i = 0; i < 24; i++) {
  const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25, flatShading: true, side: THREE.DoubleSide, clippingPlanes: [plane], fog: false });
  const mesh = new THREE.Mesh(gemGeo, mat); mesh.add(new THREE.LineSegments(gemEdges, new THREE.LineBasicMaterial({ color: 0xffffff, clippingPlanes: [plane], fog: false })));
  mesh.visible = false; scene.add(mesh);
  debris.push({ mesh, mat, plane, n: new THREE.Vector3(), vel: new THREE.Vector3(), spin: 0, life: 0 });
}
const flashes = [];
for (let i = 0; i < 8; i++) {
  const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  ring.visible = core.visible = false; scene.add(ring, core); flashes.push({ ring, core, life: 0 });
}
let fNext = 0;
const P_N = 600, pPos = new Float32Array(P_N * 3).fill(-999), pCol = new Float32Array(P_N * 3), pVel = new Float32Array(P_N * 3), pLife = new Float32Array(P_N);
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.1, map: glowTex, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
particles.frustumCulled = false; scene.add(particles);
let pNext = 0, dNext = 0;
const tmpC = new THREE.Color();
function burst(x, y, z, hex, dx, dy) {
  tmpC.setHex(hex);
  const fl = flashes[fNext = (fNext + 1) % flashes.length];
  fl.ring.material.color.setHex(hex); fl.core.material.color.setHex(hex); fl.ring.position.set(x, y, z); fl.core.position.set(x, y, z);
  fl.ring.visible = fl.core.visible = true; fl.life = 0.28;
  for (let k = 0; k < 26; k++) {
    const i = pNext = (pNext + 1) % P_N;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    const along = (Math.random() - 0.3) * 7; pVel[i * 3] = dx * along + (Math.random() - 0.5) * 2.5; pVel[i * 3 + 1] = dy * along + (Math.random() - 0.5) * 2.5; pVel[i * 3 + 2] = Math.random() * 5;
    pCol[i * 3] = tmpC.r; pCol[i * 3 + 1] = tmpC.g; pCol[i * 3 + 2] = tmpC.b; pLife[i] = 0.3 + Math.random() * 0.4;
  }
  for (const sgn of [-1, 1]) {
    const d = debris[dNext = (dNext + 1) % debris.length];
    d.mat.color.setHex(hex).multiplyScalar(0.35); d.mat.emissive.setHex(hex); d.mesh.children[0].material.color.setHex(hex).lerp(new THREE.Color(0xffffff), 0.5);
    d.mesh.visible = true; d.mesh.scale.setScalar(1); d.mesh.rotation.set(0, 0, 0);
    d.mesh.position.set(x, y, z); d.n.set(-dy * sgn, dx * sgn, 0);
    d.vel.set(-dy * 1.9 * sgn + dx * 1.2, dx * 1.9 * sgn + dy * 1.2, 1.5);
    d.spin = (Math.random() - 0.5) * 5; d.life = 0.6;
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
  setHover(v) { if (v === this.hov) return; this.hov = v; if (v && ctx && ctx.state === 'running' && state !== 'playing') tone(ctx.currentTime, [sfxBus], 'sine', 1320, 0.05, 0.003, 0.05, 4000); this.mesh.scale.setScalar(v ? 1.05 : 1); this.mesh.material.color.setScalar(v ? 1 : 0.8); }
}
function panel(parent, x, y, w, h, pxW = 1024) {
  const L = makeCanvas(pxW, Math.round(pxW * h / w));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, fog: false, depthWrite: false }));
  mesh.position.set(x, y, 0); parent.add(mesh); L.mesh = mesh;
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
  const list = [...TRACKS, ...BUNDLED, ...customTracks];
  list.forEach((tr, i) => {
    const mins = Math.floor(tr.duration / 60) + ':' + String(Math.floor(tr.duration % 60)).padStart(2, '0');
    const b = new Btn(menuGroup, -0.72, 1.92 - i * 0.31, 1.35, 0.27, tr.name, () => { sel.track = tr; buildMenu(); },
      { sub: (tr.synth ? tr.bpm + ' BPM · ' : tr.karaoke ? 'Karaoke · ' : 'Your song · ') + mins });
    b.selected = sel.track === tr; b.draw();
  });
  Object.entries(DIFFS).forEach(([k, d], i) => {
    const b = new Btn(menuGroup, 0.78, 1.92 - i * 0.31, 1.05, 0.27, d.label, () => { sel.diff = k; buildMenu(); },
      { accent: '#28d7ff', sub: k === 'easy' ? 'Cut any way, no fail' : k === 'normal' ? 'Walls and doubles' : 'Fast and dense' });
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

// HUD: combo to the left of the lane, score to the right, energy at your feet
const hudGroup = new THREE.Group(); hudGroup.visible = false; scene.add(hudGroup);
const hudL = panel(hudGroup, -2.5, 1.55, 1.5, 0.75, 512), hudR = panel(hudGroup, 2.5, 1.55, 1.5, 0.75, 512);
hudL.mesh.position.z = hudR.mesh.position.z = -5.2; hudL.mesh.rotation.y = 0.42; hudR.mesh.rotation.y = -0.42;
const feet = new THREE.Group(); feet.position.set(0, 0.03, -1.55); feet.rotation.x = -Math.PI / 2; hudGroup.add(feet);
const barBack = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.07), new THREE.MeshBasicMaterial({ color: 0x1c1560, fog: false })); barBack.position.z = -0.002; feet.add(barBack);
const unitGeo = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0);
const energyBar = new THREE.Mesh(unitGeo, addMat(0x5dff9b, 1)); energyBar.position.set(-0.85, 0, 0); energyBar.scale.set(0.85, 0.07, 1); feet.add(energyBar);
const progBar = new THREE.Mesh(unitGeo, addMat(0x8f7bff, 1)); progBar.position.set(-0.85, 0.07, 0); progBar.scale.set(0.001, 0.016, 1); feet.add(progBar);
const lyric = panel(hudGroup, 0, 3.15, 5.2, 0.9, 1024); lyric.mesh.position.z = -7; let lyricIdx = -2;
function drawLyric(text) {
  const g = lyric.g; g.clearRect(0, 0, 1024, 178); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff';
  const lines = text ? text.split('\n') : [];
  lines.forEach((ln, i) => { let size = 56; g.font = `700 ${size}px ${FONT}`; while (g.measureText(ln).width > 1000 && size > 20) g.font = `700 ${size -= 2}px ${FONT}`; g.fillText(ln, 512, 89 + (i - (lines.length - 1) / 2) * 66); });
  lyric.tex.needsUpdate = true;
}
let lastMult = 1, multPop = 0;
function drawHud() {
  let g = hudL.g; g.clearRect(0, 0, 512, 256); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#b9b2e6'; g.font = `600 40px ${FONT}`; g.fillText('COMBO', 256, 46);
  g.fillStyle = '#ffffff'; g.font = `800 150px ${FONT}`; g.fillText(cur.combo, 256, 160);
  hudL.tex.needsUpdate = true;
  g = hudR.g; g.clearRect(0, 0, 512, 256); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#ffffff'; g.font = `800 84px ${FONT}`; g.fillText(cur.score.toLocaleString(), 256, 70);
  g.fillStyle = mult() >= 8 ? '#ff3ec8' : mult() >= 4 ? '#ffa51f' : '#28d7ff'; g.font = `800 110px ${FONT}`; g.fillText('×' + mult(), 256, 180);
  hudR.tex.needsUpdate = true;
  if (mult() > lastMult) multPop = 1; lastMult = mult();
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
  for (const f of flashes) f.ring.visible = f.core.visible = false;
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
  ensureAudio();
  if (!track.synth && !track.buffer) {
    if (track.loading) return; track.loading = true;
    const b = track.bytes;
    ctx.decodeAudioData(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)).then(buf => {
      Object.assign(track, { buffer: buf, duration: buf.duration, peaks: analyze(buf), loading: false }); if (state === 'menu') startSong(track, dk);
    }, () => { track.loading = false; });
    return;
  }
  stopMusic(); clearPlayfield();
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
  hudDirty = true; lyricIdx = -2; show('playing');
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
  if (ctx) { tone(ctx.currentTime, [sfxBus], 'sawtooth', 70, 0.3, 0.005, 0.18, 400); noiseHit(ctx.currentTime, sfxBus, 'lowpass', 500, 0.3, 0.2); }
  loseCombo(label === 'MISS' ? 0.07 : 0.06);
}
function goodCut(n, h, acc, speed, dx, dy) {
  n.done = true; n.mesh.visible = false;
  const pts = Math.round(60 + 40 * acc + Math.min(15, (speed - 1.3) * 4));
  cur.combo++; cur.maxCombo = Math.max(cur.maxCombo, cur.combo); cur.hits++; cur.raw += pts; cur.score += pts * mult();
  cur.energy = Math.min(1, cur.energy + 0.015); hudDirty = true;
  popup(acc > 0.75 ? 'PERFECT' : acc > 0.45 ? 'GREAT' : 'GOOD', n.x, n.y + 0.25);
  burst(n.x, n.y, n.z, COL[n.side], dx, dy);
  noiseHit(ctx.currentTime, sfxBus, 'highpass', 3500, 0.3, 0.06); noiseHit(ctx.currentTime, sfxBus, 'bandpass', 900, 0.25, 0.09);
  pluck(mtof((cur.track.root || 45) + 36 + [0, 3, 5, 7, 10, 12, 15, 17][(cur.combo - 1) % 8]), clamp(n.x * 1.2, -1, 1), 0.16);
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
const fwd = new THREE.Vector3(), tv = new THREE.Vector3(), im = new THREE.Matrix4(), zAxis = new THREE.Vector3(0, 0, 1);
const rq = new THREE.Quaternion(), re = new THREE.Euler(), rs = new THREE.Vector3(), rp = new THREE.Vector3();
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
    const f = Math.pow(1 - k / (TRAIL_N - 1), 2) * 0.7;
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
  if (tr.synth) { const sec = tr.bars[clamp(Math.floor(songT / (tr.stepDur * 16)), 0, tr.bars.length - 1)]; env.target.setHex(SEC_TINT[sec.type]); }
  else env.target.setHSL((0.68 + songT * 0.012) % 1, 0.85, 0.6);
  while (cur.next < cur.notes.length && cur.notes[cur.next].t - songT < LEAD) {
    const n = cur.notes[cur.next++]; n.done = false; n.x = COLS_X[n.col]; n.y = cur.rowsY[n.row];
    const m = n.mesh = getNoteMesh(); m.gem.material = gemMat[n.side]; m.edges.material = edgeMat[n.side]; m.halo.material = haloMat[n.side]; m.floor.material = floorMat[n.side];
    m.arrow.visible = !!n.dir; m.ring.visible = !n.dir;
    if (n.dir) m.arrow.rotation.z = Math.atan2(n.dir[1], n.dir[0]) - Math.PI / 2;
    active.push(n);
  }
  for (const n of active) {
    if (n.done) continue;
    n.z = HITZ - (n.t - songT) * v;
    const k = clamp((LEAD - (n.t - songT)) / 0.45, 0, 1), e = 1 - Math.pow(1 - k, 3), m = n.mesh, sc = 0.25 + 0.75 * e;
    m.position.set(n.x, n.y - (1 - e) * 1.4, n.z - (1 - e) * 9); m.scale.setScalar(sc);
    m.body.rotation.z = (1 - e) * Math.PI * (n.side === 'left' ? 1 : -1);
    m.body.rotation.y = Math.sin(songT * 3 + n.t * 7) * 0.12 * e;
    m.floor.position.y = (0.015 - m.position.y) / sc; m.halo.material.opacity = 0.45 + pulse * 0.35;
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
  const kl = tr.karaoke; let li = -1;
  if (kl) for (let i = 0; i < kl.length && kl[i][0] <= songT; i++) li = i;
  if (li !== lyricIdx) { lyricIdx = li; drawLyric(li >= 0 ? kl[li][1] : ''); }
  energyBar.scale.x = Math.max(0.001, cur.energy * 1.7);
  energyBar.material.color.setHex(cur.energy < 0.25 ? 0xff5c7f : 0x5dff9b);
  multPop = Math.max(0, multPop - dt * 3); hudR.mesh.scale.setScalar(1 + multPop * 0.25);
  progBar.scale.x = clamp(songT / cur.duration, 0.001, 1) * 1.7;
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
      d.mesh.position.addScaledVector(d.vel, dt); d.vel.y -= dt * 3;
      d.mesh.rotation.z += d.spin * dt; d.mesh.scale.setScalar(Math.min(1, d.life / 0.25));
      tv.copy(d.n).applyAxisAngle(zAxis, d.mesh.rotation.z); d.plane.setFromNormalAndCoplanarPoint(tv, d.mesh.position);
    }
    for (const f of flashes) {
      if (!f.ring.visible) continue;
      f.life -= dt; if (f.life <= 0) { f.ring.visible = f.core.visible = false; continue; }
      const k = 1 - f.life / 0.28; f.ring.scale.setScalar(0.3 + k * 1.5); f.ring.material.opacity = 1 - k;
      f.core.scale.setScalar(1.0 - k * 0.4); f.core.material.opacity = (1 - k) * 0.8;
    }
    for (const p of pops) {
      if (!p.sp.visible) continue;
      p.life -= dt; if (p.life <= 0) { p.sp.visible = false; continue; }
      p.sp.position.y += dt * 0.5; p.sp.material.opacity = Math.min(1, p.life * 3);
    }
    let bass = 0;
    if (analyser) { analyser.getByteFrequencyData(freqData); bass = (freqData[1] + freqData[2] + freqData[3]) / 765; }
    if (bass > 0.4 && bass > env.lastBass + 0.07 && time - env.beatT > 170) { env.wave = 0; env.beatT = time; env.flash = 1; }
    env.lastBass = bass; env.wave += dt * 45; env.flash = Math.max(0, env.flash - dt * 4);
    pulse = Math.max(bass, pulse - dt * 2.5);
    if (state === 'menu' || state === 'results') env.target.setHex(SEC_TINT.intro);
    const T = env.tint.lerp(env.target, Math.min(1, dt * 2.5));
    scene.fog.color.copy(T).multiplyScalar(0.05 + pulse * 0.05); scene.background.copy(scene.fog.color);
    env.sky.material.color.copy(T).multiplyScalar(0.55 + pulse * 0.5);
    sunLight.color.copy(T).lerp(tmpC.setHex(0xffffff), 0.35); sunLight.intensity = 1.6 + pulse * 2.2;
    env.edgeMat.color.copy(T).lerp(tmpC.setHex(0xffffff), 0.3 + env.flash * 0.5).multiplyScalar(0.8 + pulse * 0.5);
    env.softMat.color.copy(T); env.softMat.opacity = 0.22 + pulse * 0.35;
    env.platGlow.material.color.copy(T); env.platGlow.material.opacity = 0.15 + pulse * 0.25;
    env.haze.material.color.copy(T); env.haze.scale.setScalar(300 * (1 + pulse * 0.12));
    env.sun.scale.setScalar(1 + pulse * 0.04);
    env.gates.forEach((gt, i) => {
      const w = Math.exp(-((i - env.wave) ** 2) / 3.5), o = 0.1 + 0.9 * w;
      gt.mat.color.copy(T).lerp(tmpC.setHex(0xffffff), w * 0.6); gt.mat.opacity = o; gt.soft.color.copy(T); gt.soft.opacity = 0.05 + 0.45 * w;
      gt.m.rotation.z += dt * 0.06 * (i % 2 ? 1 : -1);
    });
    for (const b of env.beams) {
      b.m.rotation.z = -b.side * 0.55 + Math.sin(time * 0.0006 + b.ph) * 0.5;
      b.mat.opacity = state === 'playing' ? 0.04 + pulse * 0.32 : 0.05;
    }
    const speed = state === 'playing' ? cur.speed : 2;
    env.scroll = (env.scroll + dt * speed) % 3.2;
    for (let i = 0; i < 24; i++) { im.makeTranslation(0, 0.01, -76 + i * 3.2 + env.scroll); env.stripes.setMatrixAt(i, im); }
    env.stripes.instanceMatrix.needsUpdate = true;
    env.runTex.offset.y = (env.runTex.offset.y + dt * speed * 80 / 120) % 1;
    for (let i = 0; i < env.moteN; i++) { env.motes[i * 3 + 2] += dt * speed * 1.6; if (env.motes[i * 3 + 2] > 6) env.motes[i * 3 + 2] -= 116; }
    env.moteGeo.attributes.position.needsUpdate = true; env.moteMat.color.copy(T).lerp(tmpC.setHex(0xffffff), 0.5);
    env.rockData.forEach((r, i) => {
      r.z += dt * speed * 0.35; if (r.z > 8) r.z -= 138;
      re.set(r.rx, time * 0.0001 * (i % 5 + 1) + r.ph, r.rz + time * 0.00008 * r.sp * 10);
      im.compose(rp.set(r.x, r.y + Math.sin(time * 0.0004 + r.ph) * 0.6, r.z), rq.setFromEuler(re), rs.set(r.sx, r.sy, r.sx));
      env.rocks.setMatrixAt(i, im);
    });
    env.rocks.instanceMatrix.needsUpdate = true;
    if (!inXR()) {
      camera.position.set(mouse.x * 0.12, 1.6 + mouse.y * 0.05, 0.8); camera.fov = 70 + pulse * 1.2; camera.updateProjectionMatrix();
    }
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
window.__sw = { cur, hands, get state() { return state; }, get songT() { return songT; }, start: (i, dk) => startSong([...TRACKS, ...BUNDLED, ...customTracks][i], dk), loadCustom, pause, resume, TRACKS };
