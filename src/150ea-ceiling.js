// THE LIGHT SWITCH AND THE CEILING LIGHTS: four flush domes overhead in your apartment; the switch on the wall by the front door sets every light in the room, the overhead ones, or any one (on, brightness, warmth, colour, all round or a beam); the fittings hide with the ceiling, their light stays.
import {THREE} from './003-shx.js';
import {SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
const CRE=()=>MODS.roomed||{};   // the room editor (150d, later in the page): its saving and who is visiting
const CEIL={ids:['ceil1','ceil2','ceil3','ceil4'],shells:[],th:null}; window.CEIL=CEIL;
{ const P=document.createElement('div'); P.id='ceilp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:16%;transform:translateX(-50%);width:min(340px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#ceilp .row{display:flex;align-items:center;gap:8px;margin:8px 0} #ceilp .row{flex-wrap:wrap} #ceilp .row span:first-child{width:92px} #ceilp .which .btn{font-size:10px;padding:3px 6px} #ceilp input[type=range]{flex:1} #ceilp .btn{font:inherit;padding:5px 9px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #ceilp .btn.on{background:#3b2a1e;color:#ece5d3} #ceilp .mclose{float:right}';
  document.head.appendChild(css); document.body.appendChild(P);
  const A=()=>ROOMK.api; let SEL='ceil';   // which lights the switch sets: every light, the overhead ones, or one
  const ids=()=>{ const a=A(); if(!a)return []; const all=a.lightsAll(); return SEL==='all'?all.map(q=>q.id):SEL==='ceil'?CEIL.ids.filter(id=>all.some(q=>q.id===id)):all.some(q=>q.id===SEL)?[SEL]:(SEL='ceil',CEIL.ids); };
  const first=()=>{ const a=A(), i=ids(); return a&&i.length?a.lightGet(i[0]):null; };
  let saveT=0; const save=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>{ if(CRE().snapshot&&CRE().HOME&&!CRE().HOME.guest)CRE().HOME.save(CRE().snapshot()); },1200); };
  const set=o=>{ const a=A(); if(!a)return; for(const id of ids())a.light(id,o); save(); };
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const draw=()=>{ '@later'; const a=A(), L=first(); if(!a||!L){ P.hidden=true; return; } const tone=L.tone??3200, k=Math.round((L.k??1)*100), tint=Math.round((L.tint??0)*100), all=a.lightsAll(), one=SEL!=='all'&&SEL!=='ceil';
    const lb=(v,n)=>`<button class="btn ${SEL===v?'on':''}" data-s="${esc(v)}">${esc(n)}</button>`, seen={};
    P.innerHTML=`<div><b>LIGHT SWITCH</b> <button class="btn mclose" data-a="close">DONE</button></div>
      <div class="row which">${lb('all','EVERY LIGHT')}${lb('ceil','OVERHEAD')}${all.filter(q=>!CEIL.ids.includes(q.id)).map(q=>{ seen[q.name]=(seen[q.name]||0)+1; return lb(q.id,q.name+(seen[q.name]>1?' '+seen[q.name]:'')); }).join('')}</div>
      <div class="row"><span>POWER</span><button class="btn ${L.on?'on':''}" data-a="on">ON</button><button class="btn ${L.on?'':'on'}" data-a="off">OFF</button></div>
      <div class="row"><span>BRIGHTNESS</span><input type="range" min="0" max="200" value="${k}" data-k="k"><span>${k}%</span></div>
      <div class="row"><span>WARMTH</span><input type="range" min="2000" max="6500" step="50" value="${tone}" data-k="tone"><span>${tone}K</span></div>
      <div class="row"><span>COLOUR</span><input type="color" value="${L.col||'#ffffff'}" data-k="col"><input type="range" min="0" max="100" value="${tint}" data-k="tint"><span>${tint}%</span></div>
      ${one?`<div class="row"><span>LIGHT</span><button class="btn ${L.type==='point'?'on':''}" data-t="point">ALL ROUND</button><button class="btn ${L.type==='spot'?'on':''}" data-t="spot">A BEAM</button></div>`:''}
      ${one&&L.type==='spot'?`<div class="row"><span>BEAM WIDTH</span><input type="range" min="10" max="80" value="${Math.round(L.angle)}" data-k="angle"><span>${Math.round(L.angle)}°</span></div><div class="row"><span>SOFTNESS</span><input type="range" min="0" max="100" value="${Math.round(L.soft*100)}" data-k="soft"><span>${Math.round(L.soft*100)}%</span></div>`:''}`; };
  CEIL.open=()=>{ if(!first())return; draw(); P.hidden=false; }; CEIL.close=()=>{ P.hidden=true; }; CEIL.pick=s=>{ SEL=s; draw(); };
  P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.s!=null){ SEL=b.dataset.s; return draw(); } const a=b.dataset.a; if(a==='close')return CEIL.close(); if(CRE().HOME&&CRE().HOME.guest)return;
    if(b.dataset.t)set({type:b.dataset.t}); else if(a)set({on:a==='on'}); if(SFX)SFX.play('click',{vol:.8,vary:.2}); draw(); });
  P.addEventListener('input',e=>{ '@later'; const t=e.target, k=t.dataset.k; if(!k||(CRE().HOME&&CRE().HOME.guest))return; const o={}; if(k==='k')o.k=+t.value/100; else if(k==='tone')o.tone=+t.value; else if(k==='angle')o.angle=+t.value; else if(k==='soft')o.soft=+t.value/100; else if(k==='tint'){ o.tint=+t.value/100; if(!first().col)o.col='#ffffff'; } else if(k==='col'){ o.col=t.value; if(!(first().tint>0))o.tint=1; }
    set(o); if(t.nextElementSibling&&t.type==='range')t.nextElementSibling.textContent=t.value+(k==='tone'?'K':k==='angle'?'°':'%'); });
  ROOMK.parts.push(c=>{ '@apts'; const {apt,R,Lx,Ly,HW,hit,mat,rbox,V3,du,fw,WW}=c, K=R.kinds['FLUSH DOME']; if(!K||R.loft)return; CEIL.shells=[]; P.hidden=true;
    [[.25,.25],[.75,.25],[.25,.75],[.75,.75]].forEach(([fu,fv],i)=>{ const g=new THREE.Group(); g.position.set(Lx*fu,HW,Ly*fv); apt.add(g); const sh=K.tpl.clone(true); let L=null; const B=[];
      sh.traverse(o=>{ if(o.isLight&&!L)L=o; if(o.userData.bulb){ o.material=o.material.clone(); B.push(o.material); } }); if(!L)return; L.removeFromParent(); L.position.set(0,-.14,0); g.add(L); L.userData.on=true; g.add(sh); sh.userData.B=B; sh.userData.L=L; CEIL.shells.push(sh);
      R.ceil.push({id:CEIL.ids[i],name:'CEILING LIGHT '+(i+1),L}); });
    const u=fw.some(f=>Math.abs(du+1-f)<WW*.5+.2)?du-1:du+1, g=new THREE.Group(); g.position.set(u,1.35,.012); apt.add(g);
    const plate=new THREE.Mesh(rbox(.12,.16,.012,.004),mat([236,230,214],{roughness:.6})); plate.position.z=.006; g.add(plate);
    for(let i=0;i<4;i++){ const d=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.006,12),mat([58,42,30],{roughness:.4})); d.rotation.x=Math.PI/2; d.position.set(-.03+.06*(i%2),.035-.07*Math.floor(i/2),.015); g.add(d); }
    const un={obj:g,th:[],name:'LIGHT SWITCH'}; CEIL.th=hit(un,()=>'LIGHT SWITCH',()=>{ CEIL.open(); },[.16,.2,.08,0,0,.01]); });
  SYS.add('places',()=>{ const on=!!(MODS.apts&&MODS.apts.inReal), vis=on&&!!(MODS.apts.ceil&&MODS.apts.ceil.visible); if(!on&&!P.hidden)P.hidden=true;
    for(const sh of CEIL.shells){ sh.visible=vis; const L=sh.userData.L, u=L.userData, lit=u.on!==false; for(const m of sh.userData.B){ m.emissive.copy(L.color); m.emissiveIntensity=lit?1.3*Math.min(1.6,Math.max(.25,u.k??1)):.03; } } },'150ea-ceiling');
  window.CEILDBG=()=>{ const a=A(); return {n:CEIL.shells.length,vis:CEIL.shells.map(s=>s.visible),i:CEIL.shells.map(s=>+s.userData.L.intensity.toFixed(2)),set:a?CEIL.ids.map(id=>a.lightGet(id)):null,panel:!P.hidden,thing:UI.things.some(t=>t.name==='LIGHT SWITCH')}; };
}
