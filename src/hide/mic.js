// DEAD END's microphone: how loud your own room is, which the thing hears as a sound from your mouth; only a loudness is read, nothing is recorded or sent
import { clamp } from './core.js';
import { A } from './sound.js';
import { PL } from './player.js';

const MIC = { on: false, why: '', level: 0, floor: .004, t: 0, fake: null };
let an = null, buf = null;
MIC.open = async () => { if (MIC.on || !A.ctx) return MIC.on; MIC.why = '';
  try { const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } }); an = A.ctx.createAnalyser(); an.fftSize = 1024; buf = new Float32Array(1024); A.ctx.createMediaStreamSource(st).connect(an); MIC.on = true; }
  catch (e) { MIC.why = (e && e.name) || 'refused'; } return MIC.on; };
// the room's steady hum is learnt and ignored; what rises well over it is a noise at your head, at most twice a second
MIC.step = (dt, hunted) => { if (!MIC.on) return; let r = MIC.fake;
  if (r == null) { an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; r = Math.sqrt(s / buf.length); }
  MIC.level = r; MIC.floor = clamp(MIC.floor + (r - MIC.floor) * dt * (r < MIC.floor ? 2 : .05), .002, .05); MIC.t -= dt;
  if (hunted && MIC.t <= 0 && r > .012 && r > MIC.floor * 2.5) { MIC.t = .5; const loud = clamp(r * 5, .1, 1); PL.noise(PL.head, loud, loud > .45 ? 'a human voice' : loud > .2 ? 'a human murmur' : 'a whisper or a breath from a mouth'); } };
export { MIC };
