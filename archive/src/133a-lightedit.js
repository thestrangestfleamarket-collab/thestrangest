// THE LIGHTING EDITOR: LIGHTED, the global render-system and quality panel (cel is the floor, its band count here too); EDITORS (shift+0).
import {THREE} from './003-shx.js';
import {LIGHTED, PS2} from './003b-systems.js';
import {renderer, resize, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {CEL} from './006-map-pre.js';
import {TPANE} from './087dz-tpane.js';
{ const SHAD={basic:THREE.BasicShadowMap,pcf:THREE.PCFShadowMap,soft:THREE.PCFShadowMap,vsm:THREE.VSMShadowMap};
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
  #led{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:340px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20;padding:4px;box-sizing:border-box}
  #led[hidden]{display:none} #led .dim{color:var(--dim);font-size:10px;line-height:1.5;padding:4px 6px}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='led'; P.hidden=true; P.innerHTML='<div class="tp"></div><div class="dim">Cel is the floor. High tiers are for finding a look; take the top ones out after. LIGHT BANDS: the cel shading\'s steps; reloads the page.</div><div class="dim" id="lmsg"></div>'; document.body.appendChild(P);
  let pane=null;
  const sync=()=>queueMicrotask(()=>pane&&pane.refresh());
  const set=(k,heavy)=>v=>{ if(st[k]===v)return; st[k]=v; st.q='custom'; apply(heavy); save(); sync(); };
  const draw=async()=>{ '@later'; if(pane){ pane.refresh(); return; }
    const V=TPANE.live({q:[()=>st.q,v=>{ if(v===st.q||!TIERS[v])return; st.q=v; Object.assign(st,TIERS[v]); apply(true); save(); sync(); }],
      ps2:[()=>!!PS2.on,v=>{ if(v!==!!PS2.on)PS2.set(v); }],
      shadows:[()=>!!st.shadows,set('shadows',true)],shadowType:[()=>st.shadowType,set('shadowType',true)],tone:[()=>st.tone,set('tone',false)],
      exposure:[()=>+st.exposure,v=>set('exposure',false)(+(+v).toFixed(2))],
      bands:[()=>CEL,v=>{ if(v===CEL)return; try{ SAVE.set('bands',String(v)); SAVE.del('shade'); }catch(e){} location.reload(); }]});
    pane=await TPANE.make(P.querySelector('.tp'),{title:'LIGHTING — GLOBAL'});
    pane.addBinding(V,'q',{label:'QUALITY',options:{...Object.fromEntries(Object.keys(TIERS).map(k=>[k.toUpperCase(),k])),CUSTOM:'custom'}});
    pane.addBinding(V,'ps2',{label:'PS2 FILTER'}); pane.addBinding(V,'shadows',{label:'SHADOWS'});
    pane.addBinding(V,'shadowType',{label:'SHADOW EDGE',options:{HARD:'basic',PCF:'pcf',SOFT:'soft',VSM:'vsm'}});
    pane.addBinding(V,'tone',{label:'TONE MAP',options:{NONE:'none',LINEAR:'linear',REINHARD:'reinhard',CINEON:'cineon',ACES:'aces'}});
    pane.addBinding(V,'exposure',{label:'EXPOSURE',min:.3,max:2,step:.01});
    pane.addBinding(V,'bands',{label:'LIGHT BANDS',options:{3:3,4:4,5:5}});
    pane.addButton({title:'RESET TO CEL'}).on('click',()=>{ Object.assign(st,D(),{q:'lowest',shadowType:'basic',tone:'none',exposure:1,shadows:true}); apply(true); save(); sync(); });
    pane.addButton({title:'EXPORT'}).on('click',()=>{ const blob=new Blob([JSON.stringify(st,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='lighting.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); P.querySelector('#lmsg').textContent='exported lighting.json'; });
    const dn=pane.addButton({title:'DONE'}); dn.on('click',()=>LIGHTED.toggle()); dn.element.querySelector('button').id='lgdone'; };
  for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
  let busy=Promise.resolve();
  LIGHTED.toggle=()=>{ LIGHTED.on=!LIGHTED.on; P.hidden=!LIGHTED.on; if(LIGHTED.on)return busy=busy.then(draw).catch(e=>{ P.querySelector('#lmsg').textContent='PANEL DID NOT LOAD: '+e.message; }); };
}
