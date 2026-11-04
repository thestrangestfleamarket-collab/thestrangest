// THE MAP: Shift+M opens the map in its own window, and again closes it (no item needed; the old MAP item is taken out of a pack that still has one).
import {FORAGE, UI} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
{ SYS.onStart(async()=>{ await LOAD('later'); if(FORAGE.has('map'))FORAGE.take('map',FORAGE.has('map')); },'141e-map');
  addEventListener('keydown',e=>{ if(e.repeat||!e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||(e.key||'').toLowerCase()!=='m')return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    e.preventDefault(); e.stopImmediatePropagation(); if(UI.menuOpen){ UI.toggleMenu(); return; } UI.mapWindow(); },true); }
