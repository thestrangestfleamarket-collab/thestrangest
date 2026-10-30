// THE MAP: an item you carry (every player starts with one for now; the merchants sell them); Shift+M opens it in its own window, and again closes it.
import {FORAGE, UI} from './003b-systems.js';
{ FORAGE.add({names:{map:'MAP OF THE SECTION'},prices:{map:15}}); FORAGE.SELLS.push(['map',15,()=>!FORAGE.has('map')]);
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); await LOAD('later'); if(!FORAGE.has('map'))FORAGE.give('map'); })();
  FORAGE.ACT.map=()=>UI.mapWindow();
  addEventListener('keydown',e=>{ if(e.repeat||!e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||(e.key||'').toLowerCase()!=='m')return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    e.preventDefault(); e.stopImmediatePropagation(); if(UI.menuOpen){ UI.toggleMenu(); return; } if(!FORAGE.has('map')){ FORAGE.say('YOU HAVE NO MAP. THE MERCHANTS SELL THEM.','#c8a090'); return; } UI.mapWindow(); },true); }
