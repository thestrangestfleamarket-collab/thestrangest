// SPACE FLEET's sound: recorded effects placed where they happen (each has a spot in the room), the engines' and deep space's loops under them; quiet until the files are in
const NAMES = ['gun', 'gun2', 'cannon', 'beam', 'hit', 'hit2', 'boom_s', 'boom_m', 'boom_l', 'boom_xl', 'mine', 'engine', 'thrust', 'ambience', 'ui_click', 'ui_deny', 'select', 'order', 'build', 'alarm', 'capture', 'lost', 'win', 'lose'];
let ctx = null, master = null; const buf = {}, last = {}, loops = {}; let voices = 0;

function initAudio(base) {
  if (ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createDynamicsCompressor(); master.threshold.value = -14; master.ratio.value = 6; const out = ctx.createGain(); out.gain.value = 0.9; master.connect(out).connect(ctx.destination);
  for (const n of NAMES) fetch(base + 'snd/' + n + '.mp3').then(r => (r.ok ? r.arrayBuffer() : null)).then(a => a && ctx.decodeAudioData(a)).then(b => { if (!b) return; buf[n] = b; if (loops[n] && !loops[n].src) loop(n, loops[n].want); }).catch(() => {});
}
// a sound at a place in the room (metres); gap: no nearer than this many ms to the last of its kind
function sfx(name, pos, vol = 1, rate = 1, gap = 45) {
  if (!ctx || !buf[name] || voices > 22) return; const now = performance.now(); if (now - (last[name] || 0) < gap) return; last[name] = now;
  const s = ctx.createBufferSource(); s.buffer = buf[name]; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12); const g = ctx.createGain(); g.gain.value = vol; s.connect(g);
  if (pos) { const p = ctx.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 0.6; p.rolloffFactor = 1.2; p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z; g.connect(p).connect(master); } else g.connect(master);
  voices++; s.onended = () => { voices--; }; s.start();
}
function loop(name, vol) {
  const L = loops[name] || (loops[name] = { want: 0 }); L.want = vol; if (!ctx || !buf[name]) return;
  if (!L.src) { L.src = ctx.createBufferSource(); L.src.buffer = buf[name]; L.src.loop = true; L.g = ctx.createGain(); L.g.gain.value = 0; L.src.connect(L.g).connect(master); L.src.start(); }
  L.g.gain.setTargetAtTime(vol, ctx.currentTime, 0.4);
}
function listen(camera, f, u) {
  if (!ctx) return; if (ctx.state === 'suspended') ctx.resume().catch(() => {}); const l = ctx.listener, p = camera.position;
  if (l.positionX) { l.positionX.value = p.x; l.positionY.value = p.y; l.positionZ.value = p.z; l.forwardX.value = f.x; l.forwardY.value = f.y; l.forwardZ.value = f.z; l.upX.value = u.x; l.upY.value = u.y; l.upZ.value = u.z; }
  else { l.setPosition(p.x, p.y, p.z); l.setOrientation(f.x, f.y, f.z, u.x, u.y, u.z); }
}
export { initAudio, sfx, loop, listen };
