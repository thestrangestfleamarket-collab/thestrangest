// THE OPTICS: the binoculars (8x42) and the camera (a 35 mm rangefinder) every player owns from the start, held in the hand and raised to the eye: real fields of view, a hand that shakes with breath, pulse and movement, focus by distance, a rangefinder, the birds' field guide; the camera's exposure from the scene's light, its prints into the Newsreel's photos (146m).
import {SHARED, THREE} from './003-shx.js';
import {BIRDS, CLOCK, FORAGE, INV, NPCS, pos, RAG, ROOMS, SFX, st, UI, VIT, W3, WIELD, WX, ZONES} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {PCAM, renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, QS, SYS, TILE} from './006-map-pre.js';
import {PHOTOS} from './146m-prints.js';
{ const T=TILE, M=T/.84, V3=THREE.Vector3, say=SAY, cl=(v,a,b)=>v<a?a:v>b?b:v, D2R=Math.PI/180;
  const OPTIC={up:null,fov0:60,view0:null,dist:null,what:'',sharp:1}; window.OPTIC=OPTIC;
  FORAGE.add({names:{binoc:'BINOCULARS (8X42)',camera:'CAMERA (35 MM)'}});

  /* ---------- everyone owns a pair and a camera from the start (once a player; kept on the server with the rest of the pack) ---------- */
  if(!OWNED.get('optics')||QS.get('fresh')){ if(!INV.items.binoc)INV.items.binoc=1; if(!INV.items.camera)INV.items.camera=1; INV.save(); OWNED.set('optics','1'); }

  /* ---------- the hand: one shake for both, a damped spring (about 1.5 Hz) pushed by breathing, the pulse, a fine tremor and your own movement ---------- */
  const SH={x:0,y:0,vx:0,vy:0,t:0,beat:0,rms:0,w:0,px:null,pz:0,sp:0}; OPTIC.shake=SH;
  const gauss=()=>{ let u=0; for(let i=0;i<4;i++)u+=Math.random(); return (u-2)*1.73; };
  SH.step=dt=>{ if(!(dt>0))return; dt=Math.min(dt,.05); SH.t+=dt; if(SH.px==null){ SH.px=pos.x; SH.pz=pos.z; } SH.sp+=(Math.hypot(pos.x-SH.px,pos.z-SH.pz)/M/dt-SH.sp)*Math.min(1,dt*6); SH.px=pos.x; SH.pz=pos.z; const sp=SH.sp, still=sp<.05&&!(st.w>.3), run=st.run>.3&&!still;
    const ex=cl(1-(VIT.sta??1),0,1)+(run?.6:0), calm=st.sit?.45:1, K=89, C=9.4;
    const hz=(70+80*ex)/60; SH.beat-=dt*hz; let kick=0; if(SH.beat<=0){ SH.beat+=1; kick=.0012*(1+2*ex); }
    const br=.0008*(1+3*ex)*Math.sin(SH.t*2*Math.PI*(.25+.2*ex)), noise=(.03+(still?0:.25+sp*.12)+(run?1.2:0))*calm, step=still?0:.004*Math.sin(SH.t*2*Math.PI*(run?2.6:1.8))*(run?3:1);
    const fx=-K*SH.x-C*SH.vx+noise*gauss()/Math.sqrt(dt)*.06, fy=-K*(SH.y-br-step)-C*SH.vy+noise*gauss()/Math.sqrt(dt)*.06;
    SH.vx+=fx*dt; SH.vy+=fy*dt+kick; SH.x+=SH.vx*dt; SH.y+=SH.vy*dt; SH.w=Math.hypot(SH.vx,SH.vy); SH.rms+=(Math.hypot(SH.x,SH.y)-SH.rms)*Math.min(1,dt*2); };

  /* ---------- what is at the centre of the view: its distance in metres (a ray into the world) and its name (a bird, a character, a place) ---------- */
  const ray=new THREE.Raycaster(), FWD=new V3(), TO=new V3(), C0=new THREE.Vector2(0,0);
  const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group)return false; return o.isMesh&&!(o.material&&(o.material.visible===false||o.material.transparent&&o.material.opacity<.05)); };
  const near=(x,y,z,max)=>{ const c=SHARED.cam.position; TO.set(x-c.x,y-c.y,z-c.z); const d=TO.length(); if(d<.3*T||d>max)return null; return {d,a:Math.acos(cl(TO.dot(FWD)/d,-1,1))}; };
  OPTIC.look=()=>{ '@later'; const cam=SHARED.cam; cam.getWorldDirection(FWD); ray.setFromCamera(C0,cam); ray.far=400*M; let d=null;
    try{ const h=ray.intersectObjects(scene.children,true).find(h=>h.distance>1.2*M&&shown(h.object)&&!(WIELD.on&&h.object.userData.wield)); if(h)d=h.distance; }catch(e){}
    const max=d==null?400*M:d+.6*T, tol=1.2*D2R; let best=null;
    for(const b of BIRDS.list||[]){ const q=near(b.x,b.y+.1*T,b.z,max); if(q&&q.a<tol&&(!best||q.a<best.a))best={...q,bird:b,name:BIRDS.K[b.k][0],latin:BIRDS.K[b.k][1]}; }
    if(!best)for(const N of NPCS.all()){ if(!N.g||!N.g.visible||!N.st)continue; const q=near(N.st.x,(N.st.y||SHARED.py)+.9*T,N.st.z,max); const nm=N.name||N.def&&N.def.name||N.key; if(q&&nm&&q.a<tol*1.5&&(!best||q.a<best.a))best={...q,name:String(nm).toUpperCase()}; }
    if(best){ OPTIC.dist=best.d/M; OPTIC.what=best.name; OPTIC.bird=best.bird||null; OPTIC.latin=best.latin||''; return; }
    OPTIC.bird=null; OPTIC.latin=''; OPTIC.dist=d==null?null:d/M; OPTIC.what='';
    if(d!=null){ const p=ray.ray.at(d,TO); try{ const z=ZONES.at(p.x,p.z,SHARED.LVL||'up'); OPTIC.what=z&&z.name?String(z.name).toUpperCase():''; }catch(e){} } };

  /* ---------- the light: the scene's exposure value (EV at ISO 100) from the sun's height, the sky and where you stand ---------- */
  OPTIC.ev=()=>{ '@later'; const inside=!!(ROOMS.cur||SHARED.LVL==='down'||MODS.apts&&MODS.apts.inReal); if(inside)return 6.5;
    const e=CLOCK.elev(), W=WX.now||{}, cloud=W.cloud||0, rain=W.rain||0, fog=W.fog||0;
    const day=e>=10?15:e>-6?7+8*(e+6)/16:4.5;   // full sun, the golden hour and twilight, a lamp-lit street by night
    return day-(e>-6?2.2*cloud+1*rain+1*fog:0); };
  OPTIC.evSet=(N,t,iso)=>Math.log2(N*N/t)-Math.log2(iso/100);   // what the camera's settings expose for

  /* ---------- the two things in the hand ---------- */
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), HELD=[];   // the things in the hand: hidden while at the eye, so they never fill the view
  const glasses={name:'BINOCULARS',hint:'CLICK TO RAISE THEM TO YOUR EYES; THE WHEEL FOCUSES. CLICK AGAIN TO LOWER.',
    make:()=>{ '@later'; const g=new THREE.Group(), r=lam(0x1c1d20), m=lam(0x6a6c70); for(const s of [-1,1]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.034*M,.03*M,.15*M,10),r); b.rotation.x=Math.PI/2; b.position.set(s*.045*M,.08*M,0); g.add(b);
        const o=new THREE.Mesh(new THREE.CylinderGeometry(.03*M,.03*M,.01*M,10),m); o.rotation.x=Math.PI/2; o.position.set(s*.045*M,.08*M,-.078*M); g.add(o); }
      const br=new THREE.Mesh(new THREE.BoxGeometry(.05*M,.02*M,.06*M),m); br.position.y=.09*M; g.add(br); g.traverse(o=>{ o.userData.wield=1; }); HELD.push(g); g.tipL=new V3(0,.08*M,-.09*M); g.head=g.tipL; return g; },
    use:()=>OPTIC.toggle('binoc') };
  const box={name:'CAMERA',hint:'CLICK TO RAISE IT TO YOUR EYE; CLICK AGAIN TO TAKE THE PICTURE. THE WHEEL FOCUSES. ESC LOWERS IT.',
    make:()=>{ '@later'; const g=new THREE.Group(), body=new THREE.Mesh(new THREE.BoxGeometry(.14*M,.08*M,.035*M),lam(0x2a2a2c)), top=new THREE.Mesh(new THREE.BoxGeometry(.14*M,.02*M,.036*M),lam(0xb8b8bc));
      body.position.y=.06*M; top.position.y=.11*M; const lens=new THREE.Mesh(new THREE.CylinderGeometry(.024*M,.026*M,.05*M,12),lam(0x111113)); lens.rotation.x=Math.PI/2; lens.position.set(0,.06*M,-.04*M); g.add(body,top,lens);
      g.traverse(o=>{ o.userData.wield=1; }); HELD.push(g); g.tipL=new V3(0,.06*M,-.07*M); g.head=g.tipL; return g; },
    use:()=>OPTIC.up==='camera'?OPTIC.shoot():OPTIC.toggle('camera') };
  for(const [id,k] of [['binoc',glasses],['camera',box]]){ (WIELD.pend=WIELD.pend||[]).push([id,k]); if(WIELD.kind)WIELD.kind(id,k); }

  /* ---------- raising and lowering: the eye goes to the glass (first person), the field narrows to the optic's own ---------- */
  let view=null;   // the eyepiece or finder, built the first time (its chunk fetched then)
  const views={binoc:()=>LOAD('binocs').then(()=>binocsView()),camera:()=>LOAD('camera').then(()=>cameraView())}, made={};
  OPTIC.fovOf=()=>OPTIC.up==='binoc'?7.5:OPTIC.up==='camera'?2*Math.atan(12/OPTIC.cam.f)/D2R:OPTIC.fov0;
  OPTIC.toggle=async id=>{ '@later'; if(OPTIC.up){ OPTIC.lower(); return; } if(OPTIC.busy)return; OPTIC.busy=true;
    try{ view=made[id]||(made[id]=await views[id]()); } catch(e){ OPTIC.busy=false; say('IT WILL NOT COME UP RIGHT NOW. TRY AGAIN.','#c8a090'); return; } OPTIC.busy=false;
    if(WIELD.on!==id)return; OPTIC.up=id; OPTIC.fov0=PCAM.fov; OPTIC.view0=UI.view; if(UI.view!=='first')UI.setView('first'); PCAM.fov=OPTIC.fovOf(); PCAM.updateProjectionMatrix(); UI.lookK=OPTIC.fovOf()/OPTIC.fov0; view.show(true); };
  OPTIC.lower=()=>{ if(!OPTIC.up)return; const was=OPTIC.up; OPTIC.up=null; PCAM.fov=OPTIC.fov0; PCAM.updateProjectionMatrix(); UI.lookK=1; renderer.domElement.style.filter=''; if(made[was])made[was].show(false); if(OPTIC.view0&&OPTIC.view0!=='first'&&UI.view==='first')UI.setView(OPTIC.view0); };
  addEventListener('keydown',e=>{ if(OPTIC.up&&e.key==='Escape'){ e.stopPropagation(); e.preventDefault(); OPTIC.lower(); } },true);
  addEventListener('wheel',e=>{ if(!OPTIC.up||!view)return; e.preventDefault(); e.stopPropagation(); view.focus(e.deltaY>0?1:-1); },{capture:true,passive:false});

  // each frame: the hand moves the view, what is centred is found five times a second, and the optic comes down when it must
  let lookT=0, yaw0=0;
  SYS.add('cam',dt=>{ SH.step(dt||0); for(const g of HELD)for(const c of g.children)c.visible=!OPTIC.up; if(!OPTIC.up)return;
    if(WIELD.on!==OPTIC.up||VIT.dead||RAG.on||SHARED.drive||UI.view!=='first'){ OPTIC.lower(); return; }
    if(Math.abs(PCAM.fov-OPTIC.fovOf())>1e-3){ PCAM.fov=OPTIC.fovOf(); PCAM.updateProjectionMatrix(); }
    SHARED.cam.rotateY(SH.x); SHARED.cam.rotateX(SH.y); SHARED.cam.updateMatrixWorld();
    OPTIC.turn=Math.abs(SHARED.yaw-yaw0)/Math.max(dt||.016,.001); yaw0=SHARED.yaw;
    if((lookT-=dt||0)<=0){ lookT=.2; OPTIC.look(); }
    if(view)view.tick(dt||0); },'146ma-optics');

  /* ---------- the eyepieces: two overlapping round fields, a mil scale, the rangefinder, the focus wheel; a bird held centred and sharp goes into the field guide ---------- */
  OPTIC.guide=(()=>{ try{ return JSON.parse(OWNED.get('fieldguide')||'{}')||{}; }catch(e){ return {}; } })();
  const binocsView=()=>{ '@binocs'; const cv=document.createElement('canvas'); cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:19;pointer-events:none;display:none'; document.body.appendChild(cv);
    const bar=document.createElement('div'); bar.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:20;display:none;gap:6px;font:11px Silkscreen,monospace;color:#ece5d3';
    bar.innerHTML='<button data-a="n">FOCUS NEAR</button><button data-a="f">FOCUS FAR</button><button data-a="g">FIELD GUIDE</button><button data-a="x">LOWER</button>';
    for(const b of bar.children){ b.className='mlb'; b.style.cssText='font:inherit;color:#ece5d3;background:rgba(14,16,22,.85);border:2px solid #3a3f4e;padding:4px 8px;cursor:pointer'; } document.body.appendChild(bar);
    const list=document.createElement('div'); list.className='ml'; list.style.cssText='position:fixed;left:50%;top:12%;transform:translateX(-50%);z-index:21;width:min(380px,92vw);max-height:70vh;overflow:auto;display:none;padding:12px;font:11px Silkscreen,monospace;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e'; document.body.appendChild(list);
    let dpt=.05, hold=0, txt='';   // focus in dioptres (1/m): .05 is 20 m; 0 is infinity
    const drawList=()=>{ const K=BIRDS.K||[]; list.innerHTML='<b>YOUR FIELD GUIDE</b> ('+Object.keys(OPTIC.guide).length+' OF '+K.length+')<br><br>'+K.map((k,i)=>OPTIC.guide[k[0]]?`<div>✔ ${k[0]} <i style="color:#7a6a5a">${k[1]}</i></div>`:`<div style="color:#a09080">· ? ? ?</div>`).join('')+'<br><button data-c>CLOSE</button>'; };
    list.addEventListener('click',e=>{ if(e.target.closest('[data-c]'))list.style.display='none'; });
    bar.addEventListener('click',e=>{ const a=e.target.closest('button')&&e.target.closest('button').dataset.a; if(a==='n')V.focus(-1); if(a==='f')V.focus(1); if(a==='x')OPTIC.lower(); if(a==='g'){ drawList(); const on=list.style.display==='none'||list.hidden; list.hidden=false; list.style.display=on?'block':'none'; } });
    const draw=()=>{ const W=innerWidth, H=innerHeight; if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; } const g=cv.getContext('2d'); g.clearRect(0,0,W,H);
      g.fillStyle='#000'; g.fillRect(0,0,W,H); g.globalCompositeOperation='destination-out'; const r=H*.47;
      for(const cx of [W/2-r*.42,W/2+r*.42]){ const gr=g.createRadialGradient(cx,H/2,r*.9,cx,H/2,r); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(cx,H/2,r,0,7); g.fill(); }
      g.globalCompositeOperation='source-over'; const pm=H/(7.5*D2R*1000);   // pixels a mil: the field is 7.5 degrees top to bottom
      g.strokeStyle='rgba(20,20,20,.85)'; g.fillStyle='rgba(20,20,20,.85)'; g.lineWidth=1.5; g.beginPath(); g.moveTo(W/2-20*pm,H/2); g.lineTo(W/2+20*pm,H/2); g.moveTo(W/2,H/2-10*pm); g.lineTo(W/2,H/2+10*pm);
      for(let m=-20;m<=20;m+=5){ const L=m%10?2*pm:4*pm; g.moveTo(W/2+m*pm,H/2-L/2); g.lineTo(W/2+m*pm,H/2+L/2); } g.stroke();
      g.font='12px Silkscreen,monospace'; g.textAlign='center'; g.fillStyle='rgba(236,229,211,.95)'; g.fillText(txt,W/2,H/2+14*pm); };
    const V={show:on=>{ cv.style.display=bar.style.display=on?'block':'none'; if(on)bar.style.display='flex'; else list.style.display='none'; if(on)draw(); },
      focus:k=>{ dpt=cl(dpt+k*-.02,0,.5); },
      tick:dt=>{ const d=OPTIC.dist, err=d==null?dpt:Math.abs(1/Math.max(d,.5)-dpt), px=cl(err*14,0,6); OPTIC.sharp=1-cl(err/.3,0,1); renderer.domElement.style.filter=px>.3?'blur('+px.toFixed(1)+'px)':'';
        txt=(d==null?'---':d<1000?Math.round(d)+' M':'FAR')+'  ·  FOCUS '+(dpt<.002?'∞':Math.round(1/dpt)+' M')+(OPTIC.what?'  ·  '+OPTIC.what:'');
        const b=OPTIC.bird; if(b&&err<.06){ hold+=dt; if(hold>1.5&&!OPTIC.guide[OPTIC.what]){ OPTIC.guide[OPTIC.what]=new Date().toISOString().slice(0,10); OWNED.set('fieldguide',JSON.stringify(OPTIC.guide)); say('INTO YOUR FIELD GUIDE: '+OPTIC.what+' ('+OPTIC.latin+').','#9fe0a0'); } } else hold=0;
        draw(); }};
    OPTIC.dpt=()=>dpt; return V; };

  /* ---------- the camera: frame lines for the lens, the rangefinder's focus patch, the light meter's needle; the shutter exposes the frame as it is lit ---------- */
  const LENS=[28,35,50,90,135], STOPS=[2,2.8,4,5.6,8,11,16], TIMES=[1/1000,1/500,1/250,1/125,1/60,1/30,1/15,1/8,1/4,1/2,1], ISOS=[100,400], DISTS=[.7,1,1.5,2,3,5,10,Infinity];
  OPTIC.cam=(()=>{ let o={}; try{ o=JSON.parse(OWNED.get('camera')||'{}')||{}; }catch(e){} return {f:50,N:8,t:1/125,iso:400,s:5,left:24,...o}; })();
  const saveCam=()=>OWNED.set('camera',JSON.stringify(OPTIC.cam));
  // the circle of confusion on the film (mm) for a subject at s metres with the lens focused at sf metres
  OPTIC.coc=(f,N,sf,s)=>{ const S=s*1000, F=sf===Infinity?1e9:sf*1000; return f*f/N*Math.abs(S-F)/(S*Math.max(F-f,1)); };
  OPTIC.shoot=()=>{ '@later'; const C=OPTIC.cam; if(OPTIC.up!=='camera')return; if(C.left<=0)return say('THE ROLL IS FINISHED. HOLD R TO WIND IN A NEW ONE.','#c8a090');
    const dEV=OPTIC.ev()-OPTIC.evSet(C.N,C.t,C.iso), H=144, W=216, fov=2*Math.atan(12/C.f), cam=SHARED.cam;
    const blurM=(SH.w+OPTIC.turn)*C.t/fov*H, dist=OPTIC.dist??1000, blurD=OPTIC.coc(C.f,C.N,DISTS[C.s],Math.max(dist,.5))/24*H;
    const fx=(g,cv)=>{ if(blurD>.4){ const c2=document.createElement('canvas'); c2.width=W; c2.height=H; const g2=c2.getContext('2d'); g2.filter='blur('+Math.min(8,blurD/2).toFixed(1)+'px)'; g2.drawImage(cv,0,0); g.drawImage(c2,0,0); }
      if(blurM>.8){ const n=Math.min(12,Math.ceil(blurM)), c2=document.createElement('canvas'); c2.width=W; c2.height=H; const g2=c2.getContext('2d'), a=Math.atan2(SH.vy,SH.vx+OPTIC.turn*.001);
        for(let i=0;i<n;i++){ g2.globalAlpha=1/(i+1); g2.drawImage(cv,Math.cos(a)*i*blurM/n,Math.sin(a)*i*blurM/n); } g.drawImage(c2,0,0); } };
    let p=null; try{ p=PHOTOS.take(cam.position.x,cam.position.y,cam.position.z,0,0,null,{from:cam,fov:fov/D2R,W,H,gain:cl(Math.pow(2,dEV/2.2),.02,12),fx}); }catch(e){ console.warn('camera',e); return; }
    C.left--; saveCam(); if(PHOTOS.rate)PHOTOS.rate(p,{dEV,blurM,blurD,fov,cam}); PHOTOS.own(p); if(SFX)SFX.play('click',{vol:.8,vary:.1}); if(made.camera)made.camera.flash();
    OPTIC.last={dEV,blurM,blurD,id:p.id}; say('CLICK. '+(Math.abs(dEV)>1.5?(dEV>0?'IT WILL COME OUT WASHED OUT. ':'IT WILL COME OUT DARK. '):'')+C.left+' LEFT ON THE ROLL. THE PRINT IS IN YOUR PACK'+(p.v>1?', WORTH $'+p.v:'')+'.','#e8e2cc'); };
  let rT=0; addEventListener('keydown',e=>{ if(OPTIC.up==='camera'&&(e.key==='r'||e.key==='R')&&!e.repeat){ rT=performance.now(); e.stopPropagation(); } },true);
  addEventListener('keyup',e=>{ if(OPTIC.up==='camera'&&(e.key==='r'||e.key==='R')&&rT&&performance.now()-rT>800){ OPTIC.cam.left=24; saveCam(); say('YOU WIND IN A FRESH ROLL: 24 FRAMES.','#e8e2cc'); } rT=0; },true);
  const cameraView=()=>{ '@camera'; const C=OPTIC.cam, cv=document.createElement('canvas'); cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:19;pointer-events:none;display:none'; document.body.appendChild(cv);
    const bar=document.createElement('div'); bar.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:20;display:none;gap:4px;flex-wrap:wrap;justify-content:center;font:11px Silkscreen,monospace;color:#ece5d3'; document.body.appendChild(bar);
    let fl=0; const step=(arr,v,k)=>arr[cl(arr.indexOf(v)+k,0,arr.length-1)];
    const drawBar=()=>{ const B=(a,t)=>`<button data-a="${a}" style="font:inherit;color:#ece5d3;background:rgba(14,16,22,.85);border:2px solid #3a3f4e;padding:4px 7px;cursor:pointer">${t}</button>`;
      bar.innerHTML=B('f-','&lt;')+`<span style="padding:4px">${C.f}MM</span>`+B('f+','&gt;')+B('N-','&lt;')+`<span style="padding:4px">F/${C.N}</span>`+B('N+','&gt;')+B('t-','&lt;')+`<span style="padding:4px">${C.t>=1?'1':'1/'+Math.round(1/C.t)}</span>`+B('t+','&gt;')+B('i',`ISO ${C.iso}`)+B('x','LOWER'); };
    bar.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const a=b.dataset.a;
      if(a==='f-')C.f=step(LENS,C.f,-1); if(a==='f+')C.f=step(LENS,C.f,1); if(a==='N-')C.N=step(STOPS,C.N,-1); if(a==='N+')C.N=step(STOPS,C.N,1);
      if(a==='t-')C.t=step(TIMES,C.t,1); if(a==='t+')C.t=step(TIMES,C.t,-1); if(a==='i')C.iso=C.iso===100?400:100; if(a==='x')return OPTIC.lower(); saveCam(); drawBar(); });
    const draw=()=>{ const W=innerWidth, H=innerHeight; if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; } const g=cv.getContext('2d'); g.clearRect(0,0,W,H);
      const fw=Math.min(W*.9,H*.9*1.5), fh=fw/1.5, x0=(W-fw)/2, y0=(H-fh)/2; g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(0,0,W,y0); g.fillRect(0,y0+fh,W,H-y0-fh); g.fillRect(0,y0,x0,fh); g.fillRect(x0+fw,y0,W-x0-fw,fh);
      g.strokeStyle='rgba(255,250,230,.85)'; g.lineWidth=2; g.strokeRect(x0,y0,fw,fh);
      // the focus patch: two images that meet when the lens is focused on what is in it (their split grows with the focus error)
      const d=OPTIC.dist??1000, sf=DISTS[C.s], err=Math.abs(1/Math.max(d,.5)-(sf===Infinity?0:1/sf)), off=cl(err*60,0,30), pw=W*.06, ph=H*.05;
      g.fillStyle='rgba(255,220,120,.18)'; g.fillRect(W/2-pw/2,H/2-ph/2,pw,ph); g.strokeStyle='rgba(255,220,120,.9)'; g.beginPath(); g.moveTo(W/2-off,H/2-ph/2); g.lineTo(W/2-off,H/2+ph/2); g.moveTo(W/2+off,H/2-ph/2); g.lineTo(W/2+off,H/2+ph/2); g.stroke();
      // the meter's needle: over or under, in stops
      const dEV=OPTIC.ev()-OPTIC.evSet(C.N,C.t,C.iso), mx=x0+fw+14, my=H/2; g.strokeStyle='rgba(255,250,230,.8)'; g.beginPath(); g.moveTo(mx,my-60); g.lineTo(mx,my+60); for(let k=-3;k<=3;k++){ g.moveTo(mx-4,my-k*20); g.lineTo(mx+4,my-k*20); } g.stroke();
      g.fillStyle=Math.abs(dEV)<.7?'#7dff8a':'#ff7a5a'; g.beginPath(); g.moveTo(mx+6,my-cl(dEV,-3,3)*20); g.lineTo(mx+16,my-cl(dEV,-3,3)*20-5); g.lineTo(mx+16,my-cl(dEV,-3,3)*20+5); g.fill();
      g.font='12px Silkscreen,monospace'; g.fillStyle='rgba(255,250,230,.95)'; g.textAlign='left'; g.fillText((dEV>=0?'+':'')+dEV.toFixed(1),mx+20,my+4);
      g.textAlign='center'; g.fillText('FOCUS '+(sf===Infinity?'∞':sf+' M')+'  ·  '+(OPTIC.dist==null?'':Math.round(OPTIC.dist)+' M AWAY  ·  ')+C.left+' LEFT',W/2,y0+fh-10);
      if(fl>0){ g.fillStyle='rgba(255,255,255,'+(fl*.8).toFixed(2)+')'; g.fillRect(0,0,W,H); } };
    return {show:on=>{ cv.style.display=on?'block':'none'; bar.style.display=on?'flex':'none'; if(on){ drawBar(); draw(); } },
      focus:k=>{ C.s=cl(C.s+(k>0?1:-1),0,DISTS.length-1); saveCam(); },
      tick:dt=>{ fl=Math.max(0,fl-dt*4); draw(); },
      flash:()=>{ fl=1; }}; };
  OPTIC.metre=M; window.OPTICBOX=(p,s)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),new THREE.MeshBasicMaterial({color:0xff00ff})); b.position.copy(p); b.lookAt(SHARED.cam.position); scene.add(b); b.updateMatrixWorld(); return b; };   // the check's target
  window.OPTICDBG=()=>({up:OPTIC.up,fov:+PCAM.fov.toFixed(2),rms:SH.rms,dist:OPTIC.dist,what:OPTIC.what,own:{binoc:FORAGE.has('binoc'),camera:FORAGE.has('camera')},cam:{...OPTIC.cam},ev:OPTIC.ev(),guide:Object.keys(OPTIC.guide).length,photos:PHOTOS.mine.length});
}
