// THE PHYSICS EXTRAS' SETTINGS: PHYS holds what the Rapier extras do (shapes, impacts, precise hits, zones, swaying things, standing on things, vehicles, ragdolls) and their PHYSICS rows in GRAPHICS.
import {PHYS} from './003b-systems.js';
import {SAVE} from './005-save.js';
{ const ROWS=[['shape','SHAPES','pick',2,['BOXES','ROUND','TRUE']],['impact','IMPACTS','lv',5],['rays','PRECISE HITS','on',1],['zones','TRIGGER ZONES','on',1],
    ['joints','SWAYING THINGS','lv',5],['ctrl','STAND ON THINGS','lv',5],['veh','VEHICLE PHYSICS','on',1],['rag','RAGDOLLS','on',1]];
  const C={}; for(const [k,,,d] of ROWS)C[k]=d; try{ Object.assign(C,JSON.parse(SAVE.get('physx')||'{}')); }catch(e){}
  Object.assign(PHYS,{cfg:C,rows:ROWS,on:k=>+C[k]>0,lv:k=>+C[k]||0,onchange:[],set:(k,v)=>{ C[k]=v; try{ SAVE.set('physx',JSON.stringify(C)); }catch(e){} for(const f of PHYS.onchange)try{ f(k,v); }catch(e){} }}); window.PHYS=PHYS;
  const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#dphx'))return;
    const B=document.createElement('div'); B.id='dphx'; B.innerHTML='<h3>PHYSICS</h3>'+ROWS.map(([k,n,t,,o])=>t==='on'?`<button class="btn" data-px="${k}">${n}</button>`:
      t==='pick'?`<div class="row"><span>${n}</span>${o.map((s,i)=>`<button class="btn" data-px="${k}" data-pv="${i}">${s}</button>`).join('')}</div>`:
      `<div class="row"><span>${n}</span><input type="range" data-px="${k}" min="0" max="10" step="1"><span data-pxv="${k}"></span></div>`).join('').replace(/(<button class="btn" data-px="[a-z]+">[^<]*<\/button>)+/g,m=>'<div class="row">'+m+'</div>')+'<div class="dim">the physics engine\'s extras; 0 or off turns one off. IMPACTS: how hard knocks break, sound and hurt. SWAYING THINGS: how much hanging things give. STAND ON THINGS: how high a step up onto loose things</div>';
    P.appendChild(B); const show=()=>{ for(const e of B.querySelectorAll('[data-px]')){ const k=e.dataset.px; if(e.type==='range'){ e.value=C[k]; B.querySelector(`[data-pxv="${k}"]`).textContent=C[k]?C[k]:'OFF'; e.style.setProperty('--p',C[k]*10+'%'); }
      else e.setAttribute('aria-pressed',String(e.dataset.pv!=null?+e.dataset.pv===+C[k]:+C[k]>0)); } };
    for(const e of B.querySelectorAll('[data-px]')){ const k=e.dataset.px; if(e.type==='range')e.oninput=()=>{ PHYS.set(k,+e.value); show(); }; else e.onclick=()=>{ PHYS.set(k,e.dataset.pv!=null?+e.dataset.pv:(+C[k]>0?0:1)); show(); }; }
    show(); };
  gfx(); }
