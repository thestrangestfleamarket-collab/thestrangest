// THE BEHAVIOUR EDITOR: BEHAV edits how a character acts — its home range for now (shift+8).
import {SHARED, THREE} from './003-shx.js';
import {BEHAV, LEVELS, NPCS, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
{ const T=TILE; let sel=null, ring=null;
  const B=()=>SHARED.BOD;
  const ix=w=>{ const b=B(); if(!b||!b.XS)return w; const a=b.XS(0),c=b.XS(1); return +((w-a)/(c-a)).toFixed(2); };
  const iz=w=>{ const b=B(); if(!b||!b.ZS)return w; const a=b.ZS(0),c=b.ZS(1); return +((w-a)/(c-a)).toFixed(2); };
  const sx=t=>{ const b=B(); return b&&b.XS?b.XS(t):t; }, sz=t=>{ const b=B(); return b&&b.ZS?b.ZS(t):t; };
  const store=(()=>{ try{ return JSON.parse(SAVE.get('behav')||'{}'); }catch(e){ return {}; } })();
  const save=()=>{ try{ SAVE.set('behav',JSON.stringify(store)); }catch(e){} };
  const rec=N=>{ const h=N&&N.home; if(!h||!h.id)return; store[h.id]=[ix(h.x),iz(h.z),+(h.r/T).toFixed(2)]; save(); };
  const applyStore=()=>{ for(const N of NPCS){ const h=N.home; if(!h||!h.id)continue; const s=store[h.id]; if(s)N.home={id:h.id,x:sx(s[0]),z:sz(s[1]),r:(s[2]||0)*T}; } };
  { const go=()=>{ if(!window.__started)return setTimeout(go,500); applyStore(); }; if(Object.keys(store).length)go(); }
  const mkRing=()=>{ const pts=[]; for(let i=0;i<=64;i++){ const a=i/64*6.2832; pts.push(new THREE.Vector3(Math.cos(a),0,Math.sin(a))); } ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffbf5e})); ring.renderOrder=999; ring.frustumCulled=false; scene.add(LEVELS.own(ring,'*')); ring.visible=false; };
  const showRing=()=>{ if(!ring)mkRing(); const h=sel&&sel.home; if(!h||!(h.r>0)){ ring.visible=false; return; } const y=((sel.g&&sel.g.position.y)||0)+.1; ring.position.set(h.x,y,h.z); ring.scale.set(h.r,1,h.r); ring.visible=true; };
  const setHome=(x,z,r)=>{ if(!sel)return; const h=sel.home||{}; sel.home={id:h.id,x:x==null?h.x:x,z:z==null?h.z:z,r:r==null?h.r:r}; rec(sel); showRing(); draw(); };
  const css=document.createElement('style'); css.textContent=`
  #beh{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:300px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #beh[hidden]{display:none} #beh h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #beh .pane{padding:10px 14px}
  #beh .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0} #beh .lab{width:84px;color:var(--dim)} #beh .dim{color:var(--dim);font-size:10px;line-height:1.5}
  #beh select,#beh .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 7px;cursor:pointer} #beh select{flex:1;min-width:140px} #beh input[type=range]{flex:1;min-width:90px}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='beh'; P.hidden=true; document.body.appendChild(P); const $=s=>P.querySelector(s);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function draw(){ const idx=sel?NPCS.indexOf(sel):-1;
    P.innerHTML=`<h2>BEHAVIOUR — HOME</h2><div class="pane">
      <div class="dim">A character keeps to a home range — a circle it is usually found in. Every character has one.</div>
      <div class="row"><span class="lab">WHO</span><select id="bsel"><option value="-1">pick a character…</option>${NPCS.map((N,i)=>`<option value="${i}"${i===idx?' selected':''}>${esc(N.name||N.key||'someone')}</option>`).join('')}</select></div>
      ${sel?(()=>{ const h=sel.home||{r:0}; const rt=+(h.r/T).toFixed(1); return `
      <div class="row"><button class="btn" id="bhere">SET HOME WHERE I STAND</button></div>
      <div class="row"><span class="lab">RANGE</span><input type="range" id="brad" min="0" max="30" step="0.5" value="${rt}"><span id="bradv">${rt} tiles</span></div>
      <div class="row"><button class="btn" id="bput">STAYS PUT</button><button class="btn" id="bshow">SHOW RANGE</button></div>
      <div class="dim">home now near ${ix(h.x)}, ${iz(h.z)} (map tiles)</div>`; })():''}
      <div class="row" style="margin-top:10px"><button class="btn" id="bexp">EXPORT</button><button class="btn" id="bdone">DONE</button></div>
      <div class="dim">Export writes behaviour.json; drop it in data/ to ship. Routine, job and gait: later.</div></div>`; }
  P.addEventListener('change',e=>{ if(e.target.id==='bsel'){ const i=+e.target.value; sel=i>=0?NPCS[i]:null; showRing(); draw(); } });
  P.addEventListener('input',e=>{ if(e.target.id==='brad'){ const v=+e.target.value; $('#bradv').textContent=v+' tiles'; if(sel)setHome(null,null,v*T); } });
  P.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.id==='bhere'){ setHome(pos.x,pos.z,(sel.home&&sel.home.r)||6*T); return; }
    if(b.id==='bput'){ setHome(null,null,0); return; }
    if(b.id==='bshow'){ showRing(); return; }
    if(b.id==='bexp'){ const blob=new Blob([JSON.stringify(store,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='behaviour.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); return; }
    if(b.id==='bdone'){ BEHAV.toggle(); return; } });
  for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea,select'))e.stopPropagation(); });
  BEHAV.toggle=()=>{ BEHAV.on=!BEHAV.on; if(BEHAV.on)draw(); else if(ring)ring.visible=false; P.hidden=!BEHAV.on; };
}
