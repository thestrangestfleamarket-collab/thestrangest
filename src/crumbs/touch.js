// Basic touch controls for tablets: left half = move stick, right half = look (or pull while gripping), buttons for both paws, pack and hop.
'use strict';
(function () {
const PL = MC.player, I = MC.input, G = MC.game;
const touchy = ('ontouchstart' in window) && (matchMedia('(pointer: coarse)').matches || MC.params.has('touch'));
if (!touchy && !MC.params.has('touch')) return;
PL.noLock = true;
const root = document.createElement('div'); root.id = 'touch'; root.hidden = true;
root.innerHTML = '<div id="t-move"><div id="t-knob"></div></div><div id="t-look"></div>' +
  '<button class="t-btn" id="t-pawL" aria-label="Left paw">L</button><button class="t-btn" id="t-pawR" aria-label="Right paw">R</button>' +
  '<button class="t-btn sm" id="t-pack" aria-label="Backpack">🎒</button><button class="t-btn sm" id="t-hop" aria-label="Hop">⤒</button><button class="t-btn sm" id="t-pause" aria-label="Pause">⏸</button>';
document.body.appendChild(root);
const $ = id => document.getElementById(id), knob = $('t-knob');
let moveId = null, mx0 = 0, my0 = 0, lookId = null, lx = 0, ly = 0;
const stop = e => { e.preventDefault(); e.stopPropagation(); };
$('t-move').addEventListener('touchstart', e => { stop(e); const t = e.changedTouches[0]; moveId = t.identifier; mx0 = t.clientX; my0 = t.clientY; }, { passive: false });
$('t-look').addEventListener('touchstart', e => { stop(e); const t = e.changedTouches[0]; lookId = t.identifier; lx = t.clientX; ly = t.clientY; MC.audio.init(); }, { passive: false });
addEventListener('touchmove', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === moveId) { stop(e); const dx = t.clientX - mx0, dy = t.clientY - my0, r = 55, l = Math.hypot(dx, dy), k = l > r ? r / l : 1; I.mx = dx * k / r; I.mz = -dy * k / r; knob.style.transform = 'translate(' + dx * k + 'px,' + dy * k + 'px)'; }
    if (t.identifier === lookId) { stop(e); const dx = (t.clientX - lx) * 1.6, dy = (t.clientY - ly) * 1.6; lx = t.clientX; ly = t.clientY; if (PL.activeGrip()) { I.pullX += dx; I.pullY += dy; } else { I.lookX += dx; I.lookY += dy; } }
  }
}, { passive: false });
const end = e => { for (const t of e.changedTouches) { if (t.identifier === moveId) { moveId = null; I.mx = I.mz = 0; knob.style.transform = ''; } if (t.identifier === lookId) lookId = null; } };
addEventListener('touchend', end); addEventListener('touchcancel', end);
const hold = (id, h) => { const b = $(id); b.addEventListener('touchstart', e => { stop(e); MC.audio.init(); PL.pawDown(h); b.classList.add('on'); }, { passive: false }); b.addEventListener('touchend', e => { stop(e); PL.pawUp(h); b.classList.remove('on'); }, { passive: false }); };
hold('t-pawL', 0); hold('t-pawR', 1);
$('t-pack').addEventListener('touchstart', e => { stop(e); I.q.push({ t: 'pack' }); }, { passive: false });
$('t-hop').addEventListener('touchstart', e => { stop(e); I.jump = true; }, { passive: false });
$('t-pause').addEventListener('touchstart', e => { stop(e); if (G.mode === 'play') { MC.paused = !MC.paused; MC.ui.show('pause', MC.paused); } }, { passive: false });
setInterval(() => { root.hidden = !(G.mode === 'play' && !MC.isXR()); }, 250);
})();
