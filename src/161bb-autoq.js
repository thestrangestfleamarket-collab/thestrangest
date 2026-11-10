// AUTO QUALITY: AUTOQ steps the picture's resolution down (whole, nine tenths, four fifths) when frames run long and back up when they run short, measured over seconds, not frames (4 Nov 2026, from Nevaland); AUTO QUALITY in GRAPHICS, on unless turned off.
import {SHARED} from './003-shx.js';
import {GPUT} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
const AUTOQ={};
{ const STEPS=[1,.9,.8], SLOW=24, FAST=13; let on=false, i=0, acc=0, n=0, slowS=0, fastS=0, t0=null;
  const apply=k=>{ i=Math.max(0,Math.min(STEPS.length-1,k)); acc=0; n=0; slowS=0; fastS=0; SHARED.RESK=STEPS[i]; if(SHARED.resize)SHARED.resize(); for(const f of AUTOQ.onchange)f(); };
  // one second of frames at a time: two slow seconds step down, eight quick ones step up
  AUTOQ.feed=ms=>{ acc+=ms; n++; if(acc<1000)return; const avg=acc/n; acc=0; n=0; if(avg>SLOW){ fastS=0; if(++slowS>=2){ slowS=0; if(i<STEPS.length-1)apply(i+1); } } else if(avg<FAST){ slowS=0; if(++fastS>=8){ fastS=0; if(i>0)apply(i-1); } } else { slowS=0; fastS=0; } };
  SYS.add('life',dt=>{ if(!on||renderer.xr.isPresenting||!SYS.started)return; if(t0===null)t0=performance.now(); if(performance.now()-t0<10000)return; AUTOQ.feed(Math.max(dt*1000,GPUT.on?GPUT.frame:0)); },'161b-autoq');   // the first ten seconds after the start are the loading's, not the frame's; the GPU's frame counts when it is the slower
  AUTOQ.onchange=[]; AUTOQ.step=()=>i; AUTOQ.set=k=>apply(k); AUTOQ.isOn=()=>on; AUTOQ.on=v=>{ on=!!v; SAVE.set('autoq',on?'1':'0'); if(!on)apply(0); for(const f of AUTOQ.onchange)f(); };
  const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#dautoq'))return;
    const B=document.createElement('div'); B.innerHTML='<h3>AUTO QUALITY</h3><div class="row"><label><input type="checkbox" id="dautoq"> ON</label><span id="dautoqv"></span></div><div class="dim">when frames run long the picture is drawn a little smaller for a while, then back; off keeps the resolution you set</div>';
    P.appendChild(B); const R=B.querySelector('#dautoq'), V=B.querySelector('#dautoqv'), show=()=>{ R.checked=on; V.textContent=on?(i?'DRAWING AT '+Math.round(STEPS[i]*100)+'%':'FULL'):''; }; R.onchange=()=>AUTOQ.on(R.checked); AUTOQ.onchange.push(show); show(); };
 window.AUTOQ=AUTOQ; }
export {AUTOQ};
