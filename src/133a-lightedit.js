// THE LIGHTING EDITOR: LIGHTED, the global render-system and quality panel (cel is the floor); shift+5.
import {THREE} from './003-shx.js';
import {LIGHTED} from './003b-systems.js';
import {renderer, resize, scene} from './004-main.js';
import {SAVE} from './005-save.js';
{ const SHAD={basic:THREE.BasicShadowMap,pcf:THREE.PCFShadowMap,soft:THREE.PCFSoftShadowMap,vsm:THREE.VSMShadowMap};
  const TONE={none:THREE.NoToneMapping,linear:THREE.LinearToneMapping,reinhard:THREE.ReinhardToneMapping,cineon:THREE.CineonToneMapping,aces:THREE.ACESFilmicToneMapping};
  const D=()=>({q:'lowest',shadows:renderer.shadowMap.enabled,shadowType:'basic',tone:'none',exposure:1});
  const TIERS={ lowest:{shadows:true,shadowType:'basic',tone:'none',exposure:1},
    low:{shadows:true,shadowType:'pcf',tone:'none',exposure:1},
    med:{shadows:true,shadowType:'pcf',tone:'reinhard',exposure:1},
    high:{shadows:true,shadowType:'soft',tone:'aces',exposure:1.1},
    max:{shadows:true,shadowType:'vsm',tone:'aces',exposure:1.2} };
  const st=D(); try{ Object.assign(st,JSON.parse(SAVE.get('lighting')||'{}')); }catch(e){}
  const recompile=()=>{ scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); renderer.shadowMap.needsUpdate=true; };
  function apply(heavy){
    renderer.shadowMap.enabled=!!st.shadows; renderer.shadowMap.type=SHAD[st.shadowType]??THREE.BasicShadowMap;
    renderer.toneMapping=TONE[st.tone]??THREE.NoToneMapping; renderer.toneMappingExposure=+st.exposure||1;
    if(heavy)recompile(); if(resize)resize(); }
  const save=()=>{ try{ SAVE.set('lighting',JSON.stringify(st)); }catch(e){} };
  apply(st.shadowType!=='basic'||!st.shadows||st.tone!=='none');
  const css=document.createElement('style'); css.textContent=`
  #led{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:300px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #led[hidden]{display:none} #led h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #led .pane{padding:10px 14px}
  #led .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0} #led .lab{width:92px;color:var(--dim)}
  #led .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer} #led .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #led input[type=range]{flex:1;min-width:90px} #led .dim{color:var(--dim);font-size:10px;line-height:1.5}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='led'; P.hidden=true; document.body.appendChild(P);
  const tierBtns=o=>Object.keys(TIERS).map(k=>`<button class="btn" data-q="${k}" aria-pressed="${st.q===k}">${k.toUpperCase()}</button>`).join('');
  const sel=(k,opts)=>opts.map(([v,n])=>`<button class="btn" data-${k}="${v}" aria-pressed="${st[k==='sh'?'shadowType':k==='tn'?'tone':k]===v}">${n}</button>`).join('');
  function draw(){ '@later'; P.innerHTML=`<h2>LIGHTING — GLOBAL</h2><div class="pane">
    <div class="dim">Cel is the floor. High tiers are for finding a look; take the top ones out after.</div>
    <div class="row"><span class="lab">QUALITY</span>${tierBtns()}</div>
    <div class="row"><span class="lab">SHADOWS</span><button class="btn" data-shadows="1" aria-pressed="${!!st.shadows}">ON</button><button class="btn" data-shadows="0" aria-pressed="${!st.shadows}">OFF</button></div>
    <div class="row"><span class="lab">SHADOW EDGE</span>${sel('sh',[['basic','HARD'],['pcf','PCF'],['soft','SOFT'],['vsm','VSM']])}</div>
    <div class="row"><span class="lab">TONE MAP</span>${sel('tn',[['none','NONE'],['linear','LINEAR'],['reinhard','REINHARD'],['cineon','CINEON'],['aces','ACES']])}</div>
    <div class="row"><span class="lab">EXPOSURE</span><input type="range" id="lexp" min="0.3" max="2" step="0.01" value="${st.exposure}"><span id="lexpv">${(+st.exposure).toFixed(2)}</span></div>
    <div class="row"><button class="btn" id="lreset">RESET TO CEL</button><button class="btn" id="lexport">EXPORT</button><button class="btn" id="ldone">DONE</button></div>
    <div class="dim" id="lmsg"></div></div>`; }
  const refresh=()=>{ draw(); };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.dataset.q){ st.q=b.dataset.q; Object.assign(st,TIERS[st.q]); apply(true); save(); refresh(); return; }
    if(b.dataset.shadows!==undefined){ st.shadows=b.dataset.shadows==='1'; st.q='custom'; apply(true); save(); refresh(); return; }
    if(b.dataset.sh){ st.shadowType=b.dataset.sh; st.q='custom'; apply(true); save(); refresh(); return; }
    if(b.dataset.tn){ st.tone=b.dataset.tn; st.q='custom'; apply(false); save(); refresh(); return; }
    if(b.id==='lreset'){ Object.assign(st,D(),{q:'lowest',shadowType:'basic',tone:'none',exposure:1,shadows:true}); apply(true); save(); refresh(); return; }
    if(b.id==='ldone'){ LIGHTED.toggle(); return; }
    if(b.id==='lexport'){ const blob=new Blob([JSON.stringify(st,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='lighting.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); P.querySelector('#lmsg').textContent='exported lighting.json'; return; } });
  P.addEventListener('input',e=>{ '@later'; if(e.target.id==='lexp'){ st.exposure=+e.target.value; st.q='custom'; P.querySelector('#lexpv').textContent=st.exposure.toFixed(2); apply(false); save(); } });
  for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
  LIGHTED.toggle=()=>{ LIGHTED.on=!LIGHTED.on; if(LIGHTED.on)draw(); P.hidden=!LIGHTED.on; };
}
