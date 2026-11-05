// THE DETAIL SCALE: LODS sets SHARED.lodK, the one scale every detail-by-distance switch reads (the park's whole trees, the townsfolk's draw and shade distances, how many self-shadow), from the player's DETAIL DISTANCE in GRAPHICS and AUTO QUALITY's step (5 Nov 2026, from Nevaland's LOD scheduler); the anchor is where you stand.
import {SHARED} from './003-shx.js';
import {NPCS} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {AUTOQ} from './161bb-autoq.js';
const LODS={};
{ let k=1; try{ const v=+SAVE.get('detail'); if(v>0)k=v; }catch(e){} const STEP=[1,.85,.7];
  LODS.scale=()=>k*STEP[AUTOQ.step()]; LODS.set=v=>{ k=Math.max(.5,Math.min(1.5,+v||1)); SAVE.set('detail',String(k)); apply(); }; LODS.get=()=>k;
  const apply=()=>{ const s=LODS.scale(); SHARED.lodK=s; NPCS.R=25*TILE*s; NPCS.DRAW=30*TILE*s; NPCS.SHADE=40*TILE*s; };
  apply(); AUTOQ.onchange.push(apply); LODS.dists=()=>[NPCS.R,NPCS.DRAW,NPCS.SHADE];
  const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#ddetail'))return;
    const B=document.createElement('div'); B.innerHTML='<h3>DETAIL DISTANCE</h3><div class="row"><span>NEAR</span><input type="range" id="ddetail" min="50" max="150" step="10"><span>FAR</span><span id="ddetailv"></span></div><div class="dim">how far things keep their full detail (whole trees, townsfolk, self-shadows); auto quality draws it in a little when frames run long</div>';
    P.appendChild(B); const R=B.querySelector('#ddetail'), V=B.querySelector('#ddetailv'), show=()=>{ R.value=Math.round(k*100); V.textContent=Math.round(LODS.scale()*100)+'%'; }; R.oninput=e=>{ LODS.set(+e.target.value/100); show(); }; AUTOQ.onchange.push(show); show(); };
  gfx(); window.LODS=LODS; }
