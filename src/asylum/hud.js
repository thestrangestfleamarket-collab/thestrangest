// the asylum's words in front of your eyes: the prompt, what is said, a note held up, the battery, the fade to black
import * as T from 'three';
import { G } from './state.js';

const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 640; const g = cv.getContext('2d'), tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace;
const mesh = new T.Mesh(new T.PlaneGeometry(1.28, .8), new T.MeshBasicMaterial({ map: tx, transparent: true, depthTest: false, depthWrite: false, fog: false })); mesh.position.set(0, -.04, -1.1); mesh.renderOrder = 999;
const fade = new T.Mesh(new T.SphereGeometry(.3, 12, 8), new T.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, side: T.BackSide, depthTest: false, depthWrite: false, fog: false })); fade.renderOrder = 998;
let prompt = '', sub = '', subUntil = 0, note = null, batt = -1, dirty = true, shown = '';
export const HUD = { mesh, fade, fadeTo: 0, say, prompt: p => { if (p !== prompt) { prompt = p; dirty = true; } }, read, close, reading: () => !!note, tick, text: () => ({ prompt, sub: G.t < subUntil ? sub : '', note: note && note.title }) };
function say(t, secs = 5) { sub = t; subUntil = G.t + secs; dirty = true; }
function read(title, body, foot) { note = { title, body, foot }; dirty = true; }
function close() { note = null; dirty = true; }
function wrap(text, x, y, w, lh, align = 'center') {
  g.textAlign = align; let yy = y;
  for (const para of text.split('\n')) { let line = ''; for (const word of para.split(' ')) { const t = line ? line + ' ' + word : word; if (g.measureText(t).width > w && line) { g.fillText(line, x, yy); yy += lh; line = word; } else line = t; } g.fillText(line, x, yy); yy += lh; }
  return yy;
}
function tick(dt) {
  const f = fade.material; f.opacity += Math.sign(HUD.fadeTo - f.opacity) * Math.min(Math.abs(HUD.fadeTo - f.opacity), dt * 2.2); fade.visible = f.opacity > .003;
  const b = Math.ceil(G.batt * 5), s = G.t < subUntil ? sub : ''; if (b !== batt || s !== shown) dirty = true; if (!dirty) return; dirty = false; batt = b; shown = s;
  g.clearRect(0, 0, 1024, 640); g.textBaseline = 'middle';
  if (note) {
    g.fillStyle = 'rgba(190,184,160,.97)'; g.fillRect(212, 30, 600, 540); g.strokeStyle = '#3a3528'; g.lineWidth = 3; g.strokeRect(222, 40, 580, 520);
    g.fillStyle = '#1c1a12'; g.font = 'bold 28px Georgia,serif'; wrap(note.title, 512, 82, 520, 32); g.font = '23px Georgia,serif'; wrap(note.body, 250, 140, 524, 30, 'left');
    g.font = 'italic 19px Georgia,serif'; g.fillStyle = '#4a4434'; g.textAlign = 'center'; g.fillText(note.foot || '', 512, 540);
  } else {
    if (s) { g.font = '30px Georgia,serif'; g.shadowColor = '#000'; g.shadowBlur = 8; g.fillStyle = '#d9d6c6'; wrap(s, 512, 470, 900, 38); g.shadowBlur = 0; }
    if (prompt) { g.font = 'bold 26px sans-serif'; const w = g.measureText(prompt).width + 36; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(512 - w / 2, 372, w, 44); g.fillStyle = '#e8e4d0'; g.textAlign = 'center'; g.fillText(prompt, 512, 395); }
    g.fillStyle = 'rgba(232,228,208,.75)'; g.fillRect(511, 319, 3, 3);
  }
  g.strokeStyle = 'rgba(232,228,208,.7)'; g.lineWidth = 2; g.strokeRect(473, 600, 74, 26); g.fillStyle = 'rgba(232,228,208,.7)'; g.fillRect(547, 607, 5, 12);
  for (let i = 0; i < b; i++) { g.fillStyle = b <= 1 ? 'rgba(200,60,40,.9)' : 'rgba(232,228,208,.75)'; g.fillRect(477 + i * 14, 604, 11, 18); }
  tx.needsUpdate = true;
}
