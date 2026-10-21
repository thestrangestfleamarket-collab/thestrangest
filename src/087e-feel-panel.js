// THE FEEL PANEL: the panel of sliders that tunes FEEL's movement, animation and camera settings.
import {SHARED, THREE} from './003-shx.js';
import {FEEL, pos, UI} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {QS} from './006-map-pre.js';
{ const MH=FEEL.MH, MV=FEEL.MV;
  const ROWS=[['MOVE',[['walk','WALK m/s',.1],['run','RUN m/s',.1],['accel','ACCELERATION m/s²',1],['brake','BRAKING m/s²',1],['reverse','REVERSAL BRAKING m/s²',1],['grip','TURN GRIP m/s²',1]]],
    ['AIR',[['gravity','GRAVITY m/s²',.5],['jumpH','JUMP HEIGHT m',.05],['fallMax','MAX FALL m/s',.5],['airAccel','AIR CONTROL m/s²',.5],['airBrake','AIR DRAG m/s²',.5],['coyote','COYOTE TIME s',.01],['buffer','JUMP BUFFER s',.01],['variable','SHORT HOP ON RELEASE (0/1)',1],['jumpCut','SHORT HOP KEEPS',.05]]],
    ['TURN AND BODY',[['turn','TURN °/s',10],['airTurn','TURN IN AIR ×',.05],['lean','LEAN AND LANDING (0/1)',1],['leanMax','LEAN MAX °',.5],['land','LANDING CLIP',.05]]],
    ['ANIMATION',[['fade','CROSSFADE s',.01],['animK','ANIMATION SPEED ×',.05],['walkRef','WALK CLIP m/s',.05],['jogRef','JOG CLIP m/s',.05],['sprintRef','SPRINT CLIP m/s',.05]]],
    ['CAMERA',[['camDist','DISTANCE m',.1],['camPitch','ANGLE rad',.01],['camH','TARGET HEIGHT m',.05],['camDamp','TURN DAMPING',.5],['camFollow','FOLLOW DAMPING',.5],['camClear','WALL CLEARANCE m',.05],['camBack','RECOVER SPEED',.5]]],
    ['COLLISION',[['radius','CAPSULE RADIUS m',.01],['height','CAPSULE HEIGHT m (0 = HIS)',.01],['slope','MAX SLOPE °',1],['step','STEP HEIGHT m',.01],['stepOn','STEPS (0/1)',1],['snap','GROUND SNAP m',.01]]]];
  const css=`#feelp{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:52px;z-index:15;width:min(300px,calc(100vw - 24px));max-height:calc(100vh - 120px);overflow:auto;font:10px/1.6 var(--pixel);letter-spacing:.5px;color:var(--fg);background:rgba(11,13,19,.94);border:2px solid var(--line);padding:8px 10px;box-sizing:border-box}
#feelp[data-min="1"] .bd{display:none}#feelp h3{margin:0;font:inherit;font-size:11px;color:var(--key);display:flex;justify-content:space-between;align-items:center;cursor:pointer}
#feelp h4{margin:10px 0 2px;font:inherit;color:var(--dim)}#feelp .r{display:grid;grid-template-columns:1fr 54px;gap:0 6px;align-items:center}#feelp .r span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#feelp input[type=range]{grid-column:1/3;width:100%;margin:0 0 2px;accent-color:#f2c14e}#feelp input[type=number]{width:54px;font:inherit;color:var(--fg);background:#0e1016;border:1px solid #3a3f4e;padding:1px 3px;box-sizing:border-box}
#feelp button{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:3px 6px;margin:2px 2px 0 0;cursor:pointer}#feelp button[aria-pressed=true]{color:var(--key);border-color:#6b6f80}
#feelp textarea{width:100%;height:70px;font:9px ui-monospace,monospace;color:var(--fg);background:#0e1016;border:1px solid #3a3f4e;box-sizing:border-box;margin-top:4px}#feelp .msg{color:var(--dim);min-height:1.6em}
#feeld{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:14;font:10px/1.5 var(--pixel);color:var(--fg);background:rgba(11,13,19,.86);border:2px solid var(--line);padding:6px 9px;white-space:pre;pointer-events:none;font-variant-numeric:tabular-nums}`;
  const st_=document.createElement('style'); st_.textContent=css; document.head.appendChild(st_);
  const P=document.createElement('div'); P.id='feelp'; P.hidden=true; document.body.appendChild(P);
  const D=document.createElement('div'); D.id='feeld'; D.hidden=true; document.body.appendChild(D);
  for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.key!=='Escape')e.stopPropagation(); });
  P.addEventListener('pointerup',e=>{ const t=e.target; if(t&&t.type==='range')setTimeout(()=>t.blur(),0); });
  const msg=t=>{ const m=P.querySelector('.msg'); if(m)m.textContent=t; };
  const btn=(a,t,on)=>`<button type="button" data-a="${a}"${on===undefined?'':` aria-pressed="${!!on}"`}>${t}</button>`;
  const draw=()=>{ '@later'; const c=FEEL.cfg, R=FEEL.RANGE; let o=`<h3 data-a="min"><span>FEEL LAB</span><span>${P.dataset.min==='1'?'+':'–'}</span></h3><div class="bd">`;
    o+=`<div>${btn('on','NEW CONTROLLER ON THE STREET',FEEL.on)}${btn('dbg','DEBUG (O)',FEEL.dbg)}${btn('shadow','SHADOWS',renderer.shadowMap.enabled)}</div>`;
    o+=`<h4>THE YARD (T: BACK TO SPAWN)</h4><div>${FEEL.yard.spots().map((s,i)=>btn('spot'+i,s.n)).join('')}${btn('street','BACK TO THE STREET')}</div>`;
    o+=`<h4>PRESETS</h4><div>${Object.keys(FEEL.PRE).map(n=>btn('pre'+n,n)).join('')}</div>`;
    for(const [h,rows] of ROWS){ o+=`<h4>${h}</h4>`; for(const [k,lab,s] of rows)o+=`<div class="r"><span title="${k}">${lab}</span><input type="number" data-k="${k}" step="${s}" min="${R[k][0]}" max="${R[k][1]}" value="${+c[k].toFixed(3)}"><input type="range" data-k="${k}" step="${s}" min="${R[k][0]}" max="${R[k][1]}" value="${c[k]}"></div>`; }
    o+=`<h4>SETTINGS</h4><div>${btn('reset','RESET DEFAULTS')}${btn('save','SAVE')}${btn('export','EXPORT JSON')}${btn('import','IMPORT')}${btn('file','LOAD FILE')}</div><textarea spellcheck="false" placeholder="PASTE SETTINGS JSON HERE, THEN IMPORT"></textarea><div class="msg"></div></div>`;
    P.innerHTML=o; };
  const sync=()=>{ for(const el of P.querySelectorAll('[data-k]')){ const v=FEEL.cfg[el.dataset.k]; if(document.activeElement!==el)el.value=el.type==='number'?+v.toFixed(3):v; } };
  P.addEventListener('input',e=>{ const k=e.target.dataset&&e.target.dataset.k; if(!k)return; const v=parseFloat(e.target.value); if(!isFinite(v))return; const err=FEEL.set({[k]:v}); if(err.length)msg(err[0]); else msg(''); if(k==='camDist'||k==='camPitch')FEEL.applyCam(); sync(); });
  const file=document.createElement('input'); file.type='file'; file.accept='application/json,.json';
  file.onchange=()=>{ const f=file.files[0]; if(!f)return; f.text().then(t=>{ P.querySelector('textarea').value=t; imp(); }); file.value=''; };
  const imp=()=>{ '@later'; let o; try{ o=JSON.parse(P.querySelector('textarea').value); }catch(e){ msg('NOT VALID JSON'); return; } const r=FEEL.check(o); if(r.err.length){ msg('NOT IMPORTED: '+r.err.join('; ')); return; } FEEL.cfg={...FEEL.DEF,...r.cfg}; FEEL.applyCam(); sync(); msg('IMPORTED '+Object.keys(r.cfg).length+' SETTINGS'); };
  FEEL.imp=t=>{ draw(); P.querySelector('textarea').value=t; imp(); return msg&&P.querySelector('.msg').textContent; };
  FEEL.exp=()=>JSON.stringify(FEEL.cfg,null,1);
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('[data-a]'); if(!b)return; const a=b.dataset.a; b.blur();
    if(a==='min'){ P.dataset.min=P.dataset.min==='1'?'0':'1'; draw(); return; }
    if(a==='on'){ FEEL.setOn(!FEEL.on); draw(); return; }
    if(a==='dbg'){ FEEL.setDbg(!FEEL.dbg); draw(); return; }
    if(a==='shadow'){ renderer.shadowMap.enabled=!renderer.shadowMap.enabled; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); draw(); return; }
    if(a.startsWith('spot')){ FEEL.load(); FEEL.yard.go(+a.slice(4)); return; }
    if(a==='street'){ UI.goPlace('CENTRAL PARK'); FEEL.S.sync=true; return; }
    if(a.startsWith('pre')){ FEEL.preset(a.slice(3)); FEEL.applyCam(); sync(); msg(a.slice(3)+' PRESET'); return; }
    if(a==='reset'){ FEEL.cfg={...FEEL.DEF}; FEEL.applyCam(); sync(); msg('DEFAULTS'); return; }
    if(a==='save'){ msg(FEEL.save()?'SAVED IN THIS BROWSER':'COULD NOT SAVE'); return; }
    if(a==='export'){ const t=FEEL.exp(); P.querySelector('textarea').value=t; try{ navigator.clipboard&&navigator.clipboard.writeText(t); }catch(e){}
      try{ const u=URL.createObjectURL(new Blob([t],{type:'application/json'})), l=document.createElement('a'); l.href=u; l.download='feel-settings.json'; l.click(); setTimeout(()=>URL.revokeObjectURL(u),1000); }catch(e){} msg('EXPORTED (FILE, CLIPBOARD, BOX)'); return; }
    if(a==='import'){ imp(); return; }
    if(a==='file'){ file.click(); return; } });
  FEEL.panel=on=>{ P.hidden=!(on??P.hidden); if(!P.hidden){ FEEL.load(); draw(); } };
  const G=new THREE.Group(); G.visible=false; G.scale.set(MH,MV,MH); scene.add(G);
  const LM=new THREE.LineBasicMaterial({color:0x7cf2a0,depthTest:false,transparent:true}), cap=new THREE.LineSegments(new THREE.BufferGeometry(),LM); cap.renderOrder=999; G.add(cap); let capK='';
  const aG=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),1,0x7cc8f2), aW=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),1,0xf27c7c); G.add(aG,aW);
  for(const a of [aG,aW])a.traverse(o=>{ if(o.material){ o.material.depthTest=false; o.renderOrder=999; } });
  const camL=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xf2c14e,depthTest:false})); camL.renderOrder=999; G.add(camL);
  const wire=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:0x7cf2a0,wireframe:true,transparent:true,opacity:.25,depthWrite:false})); G.add(wire); let wireSrc=null;
  FEEL.setDbg=on=>{ FEEL.dbg=on; D.hidden=!on; G.visible=on; };
  let fN=0, fT=0, fps=0, ms=0;
  FEEL.ui=dt=>{ FEEL.yard.tick(); fN++; fT+=dt; if(fT>.5){ fps=fN/fT; ms=fT/fN*1000; fN=0; fT=0; } if(!P.hidden&&Math.random()<.1)sync(); if(!FEEL.dbg)return;
    const S=FEEL.S, A=FEEL.A, c=FEEL.cfg, on=FEEL.take(), h=FEEL.hgt(), r=c.radius, k=r.toFixed(3)+h.toFixed(3);
    if(k!==capK){ capK=k; cap.geometry.dispose(); cap.geometry=new THREE.WireframeGeometry(new THREE.CapsuleGeometry(r,Math.max(.01,h-2*r),3,10)); }
    const px=pos.x/MH, pz=pos.z/MH, pyy=SHARED.py/MV; cap.position.set(px,pyy+h/2,pz); cap.visible=on;
    aG.visible=on&&S.gnd; aG.position.set(px,pyy,pz); aG.setDirection(S.gN); aW.visible=on&&S.wall; aW.position.set(px,pyy+.5,pz); aW.setDirection(S.wN);
    const Y=FEEL.yard, src=Y.bvh&&Y.in(px,pz)?Y.geo:FEEL.street&&FEEL.street.geo; if(src!==wireSrc){ wireSrc=src; wire.geometry=src||new THREE.BufferGeometry(); } wire.visible=!!src&&on;
    const R=FEEL.camRays; if(R&&FEEL.camHit!=null){ const a=[]; for(const [p,q] of R)a.push(p.x,p.y,p.z,q.x,q.y,q.z); camL.geometry.setAttribute('position',new THREE.Float32BufferAttribute(a,3)); camL.visible=true; } else camL.visible=false;
    const w=A&&A.C?Object.entries(A.w).filter(([,v])=>v>.01).map(([n,v])=>n.replace(/_Loop|_Fwd/g,'').toUpperCase()+' '+v.toFixed(2)).join(' · '):'-';
    D.textContent=`${fps.toFixed(0)} FPS · ${ms.toFixed(1)} MS A FRAME\nCONTROLLER ${on?(Y.bvh&&Y.in(px,pz)?'YARD':'STREET'):'OLD (OFF)'} · ${FEEL.ready?'BVH READY':'BVH LOADING'}\nSTATE ${on&&A?A.mode.toUpperCase():'-'} · ${S.gnd?'GROUNDED':'IN THE AIR'}${S.wall?' · WALL':''}${S.ceil?' · CEILING':''}\nSPEED ${Math.hypot(S.v.x,S.v.z).toFixed(2)} m/s (MOVED ${FEEL.hs.toFixed(2)}) · UP ${S.v.y.toFixed(2)} m/s\nCOYOTE ${Math.max(0,c.coyote-(S.t-S.lastG)).toFixed(2)} · BUFFER ${S.buf>=0?Math.max(0,c.buffer-(S.t-S.buf)).toFixed(2):'-'} · STEPS ${S.steps}\nCLIPS ${w}\nCAMERA ${FEEL.camHit?'PULLED IN':'CLEAR'}`; };
  FEEL.key=(k,e)=>{ if(e.repeat)return false; if(k==='l'){ FEEL.panel(); return true; } if(k==='o'){ FEEL.setDbg(!FEEL.dbg); return true; } if(k==='t'&&FEEL.take()&&FEEL.yard.in(pos.x/MH,pos.z/MH)){ FEEL.respawn(); return true; } return false; };
  if(QS.get('feel')!=null){ FEEL.load(); FEEL.panel(QS.get('feelpanel')!=='0'); }
}
