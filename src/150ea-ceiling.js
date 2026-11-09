// THE CEILING LIGHTS: four flush domes overhead in your apartment, set from a panel on the wall by the front door (on, brightness, warmth, colour); the fittings hide with the ceiling, their light stays.
import {THREE} from './003-shx.js';
import {ED, SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
const RE=()=>window.ROOMED||{};   // the room editor (150d, later in the page): its saving and who is visiting
const CEIL={ids:['ceil1','ceil2','ceil3','ceil4'],shells:[],th:null}; window.CEIL=CEIL;
{ const P=document.createElement('div'); P.id='ceilp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:16%;transform:translateX(-50%);width:min(340px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#ceilp .row{display:flex;align-items:center;gap:8px;margin:8px 0} #ceilp .row span:first-child{width:92px} #ceilp input[type=range]{flex:1} #ceilp .btn{font:inherit;padding:5px 9px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #ceilp .btn.on{background:#3b2a1e;color:#ece5d3} #ceilp .mclose{float:right}';
  document.head.appendChild(css); document.body.appendChild(P);
  const A=()=>ROOMK.api, first=()=>{ const a=A(); return a&&a.lightGet(CEIL.ids[0]); };
  let saveT=0; const save=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>{ if(RE().snapshot&&RE().HOME&&!RE().HOME.guest)RE().HOME.save(RE().snapshot()); },1200); };
  const set=o=>{ const a=A(); if(!a)return; for(const id of CEIL.ids)a.light(id,o); save(); };
  const draw=()=>{ '@later'; const L=first(); if(!L){ P.hidden=true; return; } const tone=L.tone??3200, k=Math.round((L.k??1)*100), tint=Math.round((L.tint??0)*100);
    P.innerHTML=`<div><b>CEILING LIGHTS</b> <button class="btn mclose" data-a="close">DONE</button></div>
      <div class="row"><span>POWER</span><button class="btn ${L.on?'on':''}" data-a="on">ON</button><button class="btn ${L.on?'':'on'}" data-a="off">OFF</button></div>
      <div class="row"><span>BRIGHTNESS</span><input type="range" min="0" max="200" value="${k}" data-k="k"><span>${k}%</span></div>
      <div class="row"><span>WARMTH</span><input type="range" min="2000" max="6500" step="50" value="${tone}" data-k="tone"><span>${tone}K</span></div>
      <div class="row"><span>COLOUR</span><input type="color" value="${L.col||'#ffffff'}" data-k="col"><input type="range" min="0" max="100" value="${tint}" data-k="tint"><span>${tint}%</span></div>`; };
  CEIL.open=()=>{ if(!first())return; draw(); P.hidden=false; }; CEIL.close=()=>{ P.hidden=true; };
  P.addEventListener('click',e=>{ const b=e.target.closest('button[data-a]'); if(!b)return; const a=b.dataset.a; if(a==='close')return CEIL.close(); if(RE().HOME&&RE().HOME.guest)return; set({on:a==='on'}); if(SFX)SFX.play('click',{vol:.8,vary:.2}); draw(); });
  P.addEventListener('input',e=>{ '@later'; const t=e.target, k=t.dataset.k; if(!k||(RE().HOME&&RE().HOME.guest))return; const o={}; if(k==='k')o.k=+t.value/100; else if(k==='tone')o.tone=+t.value; else if(k==='tint'){ o.tint=+t.value/100; if(!first().col)o.col='#ffffff'; } else if(k==='col'){ o.col=t.value; if(!(first().tint>0))o.tint=1; }
    set(o); if(t.nextElementSibling&&t.type==='range')t.nextElementSibling.textContent=t.value+(k==='tone'?'K':'%'); });
  ROOMK.parts.push(c=>{ '@apts'; const {apt,R,Lx,Ly,HW,hit,mat,rbox,V3,du,fw,WW}=c, K=R.kinds['FLUSH DOME']; if(!K)return; CEIL.shells=[]; P.hidden=true;
    [[.25,.25],[.75,.25],[.25,.75],[.75,.75]].forEach(([fu,fv],i)=>{ const g=new THREE.Group(); g.position.set(Lx*fu,HW,Ly*fv); apt.add(g); const sh=K.tpl.clone(true); let L=null; const B=[];
      sh.traverse(o=>{ if(o.isLight&&!L)L=o; if(o.userData.bulb){ o.material=o.material.clone(); B.push(o.material); } }); if(!L)return; L.removeFromParent(); L.position.set(0,-.14,0); g.add(L); L.userData.on=true; g.add(sh); sh.userData.B=B; sh.userData.L=L; CEIL.shells.push(sh);
      R.ceil.push({id:CEIL.ids[i],name:'CEILING LIGHT '+(i+1),L}); });
    const u=Math.abs(du+.8-fw[0])<WW*.5+.2||Math.abs(du+.8-fw[1])<WW*.5+.2?du-.8:du+.8, g=new THREE.Group(); g.position.set(u,1.35,.012); apt.add(g);
    const plate=new THREE.Mesh(rbox(.12,.16,.012,.004),mat([236,230,214],{roughness:.6})); plate.position.z=.006; g.add(plate);
    for(let i=0;i<4;i++){ const d=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.006,12),mat([58,42,30],{roughness:.4})); d.rotation.x=Math.PI/2; d.position.set(-.03+.06*(i%2),.035-.07*Math.floor(i/2),.015); g.add(d); }
    const un={obj:g,th:[],name:'CEILING LIGHTS'}; CEIL.th=hit(un,()=>'CEILING LIGHTS',()=>{ CEIL.open(); },[.16,.2,.08,0,0,.01]); });
  SYS.add('places',()=>{ const on=!!(MODS.apts&&MODS.apts.inReal), vis=on&&!!(MODS.apts.ceil&&MODS.apts.ceil.visible); if(!on&&!P.hidden)P.hidden=true;
    for(const sh of CEIL.shells){ sh.visible=vis; const L=sh.userData.L, u=L.userData, lit=u.on!==false; for(const m of sh.userData.B){ m.emissive.copy(L.color); m.emissiveIntensity=lit?1.3*Math.min(1.6,Math.max(.25,u.k??1)):.03; } } },'150ea-ceiling');
  window.CEILDBG=()=>{ const a=A(); return {n:CEIL.shells.length,vis:CEIL.shells.map(s=>s.visible),i:CEIL.shells.map(s=>+s.userData.L.intensity.toFixed(2)),set:a?CEIL.ids.map(id=>a.lightGet(id)):null,panel:!P.hidden,thing:UI.things.some(t=>t.name==='CEILING LIGHTS')}; };
}
