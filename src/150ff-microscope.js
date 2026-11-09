// THE MICROSCOPE: a compound microscope on a lab desk in every apartment, its slide box of public-domain micrographs (data/scope.json) and a drop of pond water whose microbes swim in code; double-click for the eyepiece: objectives 4x to 100x, coarse and fine focus, light, diaphragm, the mechanical stage. Nothing loads before you look.
import {THREE} from './003-shx.js';
import {SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
const MIC={open:false,data:null,ext:[]}; window.MIC=MIC;   // ext: what later files add ({slides, panel, click, over, tap, open, close}, 150fi on)
{ const SCJ=__LAZY__("data/scope.json");
  const SLF={"flea":__FILE__("data/scope/slides/flea.jpg"),"flea-sem":__FILE__("data/scope/slides/flea-sem.jpg"),"cork":__FILE__("data/scope/slides/cork.jpg"),"snowflake":__FILE__("data/scope/slides/snowflake.jpg"),"snow-sem":__FILE__("data/scope/slides/snow-sem.jpg"),"radiolaria":__FILE__("data/scope/slides/radiolaria.jpg"),"diatoms":__FILE__("data/scope/slides/diatoms.jpg"),"diatom":__FILE__("data/scope/slides/diatom.jpg"),"pollen":__FILE__("data/scope/slides/pollen.jpg"),"spores":__FILE__("data/scope/slides/spores.jpg"),"stomata":__FILE__("data/scope/slides/stomata.jpg"),"aphid":__FILE__("data/scope/slides/aphid.jpg"),"grasshopper":__FILE__("data/scope/slides/grasshopper.jpg"),"weevil":__FILE__("data/scope/slides/weevil.jpg"),"firefly":__FILE__("data/scope/slides/firefly.jpg"),"flyeye":__FILE__("data/scope/slides/flyeye.jpg"),"bedbug":__FILE__("data/scope/slides/bedbug.jpg"),"mite":__FILE__("data/scope/slides/mite.jpg"),"varroa":__FILE__("data/scope/slides/varroa.jpg"),"butterfly":__FILE__("data/scope/slides/butterfly.jpg"),"tardigrade":__FILE__("data/scope/slides/tardigrade.jpg"),"amoeba":__FILE__("data/scope/slides/amoeba.jpg"),"volvox":__FILE__("data/scope/slides/volvox.jpg"),"onion":__FILE__("data/scope/slides/onion.jpg"),"cheek":__FILE__("data/scope/slides/cheek.jpg"),"blood":__FILE__("data/scope/slides/blood.jpg"),"ecoli":__FILE__("data/scope/slides/ecoli.jpg"),"penicillium":__FILE__("data/scope/slides/penicillium.jpg"),"yeast":__FILE__("data/scope/slides/yeast.jpg"),"sand":__FILE__("data/scope/slides/sand.jpg"),"hair":__FILE__("data/scope/slides/hair.jpg"),"fishscale":__FILE__("data/scope/slides/fishscale.jpg")};   // each photo a file of its own, fetched when it goes on the stage
  MIC.files=SLF;

  /* ---------- the desk, the microscope, the slide box and the stool, against the back wall of your study ---------- */
  for(const k of ['LAB DESK', 'LAB STOOL'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid,thing,bake,R}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const U0=1.2, V0=c.Ly-.36, DW=1.5, DD=.62, DH=.76;
    const oak=mat([150,104,62]), oakD=mat([104,70,40]), black=mat([30,30,32]), cream=mat([226,222,210]), chrome=mat([186,188,192]), brass=mat([176,140,70]), glassM=mat([200,220,230],{transparent:true,opacity:.5,depthWrite:false});
    cap('LAB DESK',()=>{ const g=new THREE.Group(); g.position.set(U0,0,V0); g.rotation.y=Math.PI; cur().add(g);
      // the desk: a thick oak top, a drawer pedestal on the right, square legs on the left
      p(rbox(DW,.04,DD,.006),oak,0,DH-.02,0,0,g); p(rbox(.42,DH-.06,DD-.04,.006),oakD,DW/2-.23,(DH-.06)/2,0,0,g);
      for(let i=0;i<3;i++){ p(rbox(.38,.2,.012,.004),oak,DW/2-.23,.12+i*.23,DD/2-.012,0,g); p(rbox(.08,.012,.016,.003),brass,DW/2-.23,.14+i*.23,DD/2-.002,0,g); }
      for(const t of [-1,1])p(rbox(.05,DH-.04,.05,.006),oakD,-DW/2+.04,(DH-.04)/2,t*(DD/2-.04),0,g); p(rbox(DW-.5,.06,.02,.004),oakD,-.2,DH-.08,-DD/2+.03,0,g);
      // the microscope: foot, arm, stage with clips and the mechanical stage's knobs, the turret of four objectives, the binocular head, the focus knobs, the lamp in the foot
      const S=new THREE.Group(); S.position.set(-.18,DH,.02); g.add(S);
      p(rbox(.2,.035,.26,.012),cream,0,.018,-.02,0,S); p(rbox(.07,.2,.07,.012),cream,0,.13,-.1,0,S); p(rbox(.07,.06,.17,.012),cream,0,.25,-.05,-0,S);
      p(rbox(.07,.18,.06,.012),cream,0,.16,-.12,0,S); keep(p(new THREE.CylinderGeometry(.018,.022,.012,16),new THREE.MeshBasicMaterial({color:0xfff2c8}),0,.041,.03,0,S,false)).userData.lamp=1;
      p(new THREE.CylinderGeometry(.03,.026,.04,16),black,0,.06,.03,0,S); p(rbox(.13,.008,.12,.003),black,0,.115,.03,0,S); p(rbox(.026,.02,.01,.003),chrome,0,.122,.07,0,S);
      for(const s of [-1,1])p(rbox(.04,.002,.008,.001),chrome,s*.03,.12,.035,0,S); keep(p(rbox(.075,.0015,.026,.0005),glassM,0,.1205,.03,0,S,false)).userData.slide=1;
      p(new THREE.CylinderGeometry(.01,.01,.03,10).rotateX(Math.PI/2),chrome,.075,.1,.02,0,S); p(new THREE.CylinderGeometry(.012,.012,.012,12).rotateZ(Math.PI/2),black,.075,.085,.03,0,S); p(new THREE.CylinderGeometry(.009,.009,.012,12).rotateZ(Math.PI/2),black,.075,.068,.03,0,S);
      for(const s of [-1,1]){ p(new THREE.CylinderGeometry(.03,.03,.016,20).rotateZ(Math.PI/2),black,s*.05,.09,-.12,0,S); p(new THREE.CylinderGeometry(.018,.018,.014,16).rotateZ(Math.PI/2),chrome,s*.065,.09,-.12,0,S); }
      const T=new THREE.Group(); T.position.set(0,.2,.03); T.rotation.x=-.25; S.add(T); p(new THREE.CylinderGeometry(.035,.04,.02,20),chrome,0,0,0,0,T);
      [[.02,.5,brass],[.022,.8,mat([200,60,50])],[.024,.9,mat([220,190,60])],[.026,1,mat([90,120,200])]].forEach(([L,k,ring],i)=>{ const a=i*Math.PI/2+.4, x=Math.sin(a)*.02, z=Math.cos(a)*.02, o=new THREE.Group(); o.position.set(x,-.01,z); o.rotation.set(Math.cos(a)*.35,0,-Math.sin(a)*.35); T.add(o);
        p(new THREE.CylinderGeometry(.008,.01,.035+L*k,12),chrome,0,-.02-L*k/2,0,0,o); p(new THREE.CylinderGeometry(.0102,.0102,.004,12),ring,0,-.018,0,0,o); });
      const H=new THREE.Group(); H.position.set(0,.29,-.03); S.add(H); p(rbox(.07,.05,.09,.01),cream,0,0,0,0,H);
      for(const s of [-1,1]){ const e=new THREE.Group(); e.position.set(s*.024,.03,.03); e.rotation.x=-.7; H.add(e); p(new THREE.CylinderGeometry(.011,.011,.07,14),black,0,.035,0,0,e); p(new THREE.CylinderGeometry(.014,.014,.012,14),black,0,.074,0,0,e); }
      // the slide box: a small oak box, its lid propped open on a row of slides
      const B=new THREE.Group(); B.position.set(.24,DH,.06); B.rotation.y=-.2; g.add(B); p(rbox(.2,.05,.1,.004),oakD,0,.025,0,0,B);
      for(let i=0;i<14;i++)p(rbox(.004,.04,.08,.001),i%5===0?mat([220,200,170]):glassM,-.085+i*.013,.03,0,0,B); const lid=new THREE.Group(); lid.position.set(0,.05,-.05); lid.rotation.x=-1.9; B.add(lid); p(rbox(.2,.008,.1,.003),oakD,0,0,.05,0,lid);
      // a lab notebook and a dropper bottle of pond water
      p(rbox(.18,.012,.24,.003),mat([60,90,70]),.48,DH+.006,.02,.1,g); p(new THREE.CylinderGeometry(.02,.022,.06,14),mat([90,120,90],{transparent:true,opacity:.7}),.12,DH+.03,-.12,0,g); p(new THREE.CylinderGeometry(.008,.012,.035,10),black,.12,DH+.077,-.12,0,g);
      solid(U0-DW/2,V0-DD/2,U0+DW/2,V0+DD/2,DH+.002); },{wire:'micro',bake:true});
    // a round lab stool, a loose thing you can sit on and push
    { const sg=thing(U0-.2,0,V0-.62,0), wd=mat([130,88,52]); const P=(geo,m,x,y,z)=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; sg.add(me); return me; };
      P(new THREE.CylinderGeometry(.17,.17,.04,22),wd,0,.6,0); for(let i=0;i<3;i++){ const a=i*2.09, l=P(new THREE.CylinderGeometry(.014,.018,.6,8),mat([40,40,44]),Math.sin(a)*.12,.3,Math.cos(a)*.12); l.rotation.set(Math.cos(a)*.18,0,-Math.sin(a)*.18); }
      P(new THREE.TorusGeometry(.12,.008,6,20).rotateX(Math.PI/2),mat([40,40,44]),0,.22,0); bake(sg); R.loose.push([sg,'LAB STOOL',3,true]); } });

  ROOMK.wires.micro=(un,c)=>{ let lamp=null; un.obj.traverse(o=>{ if(o.userData.lamp){ o.material=o.material.clone(); lamp=o; } });
    c.hit(un,()=>'LOOK IN THE MICROSCOPE',()=>{ MIC.show(); if(SFX)SFX.play('click',{vol:.5,vary:.2}); });
    un.tick=()=>{ if(lamp)lamp.material.color.setScalar(MIC.open?1:.25); }; };

  MIC.show=async()=>{ try{ if(typeof LOAD==='function')await LOAD('micro'); if(!MIC.data)MIC.data=await SCJ(); view(); }catch(e){ console.warn('MICROSCOPE: did not load',e); } };

  /* ---------- the eyepiece: the optics and the stage, worked out in micrometres ---------- */
  // objectives: magnification, numerical aperture, depth of field (µm, for green light ~0.55 µm: λ·n/NA² + n·e/(M·NA)), working colour ring
  const OBJ=[{m:4,na:.10,dof:55},{m:10,na:.25,dof:8.5},{m:40,na:.65,dof:1.0},{m:100,na:1.25,dof:.4}], FN=18000;   // field number 18 mm
  const V={};   // the eyepiece's state, filled the first time you look
  const view=()=>{ '@micro';
    if(!V.el){ const el=document.createElement('div'); el.id='micp'; el.hidden=true;
      el.style.cssText='position:fixed;inset:0;z-index:30;background:#0b0a09;display:flex;align-items:center;justify-content:center;gap:18px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;flex-wrap:wrap;overflow:auto;padding:10px;box-sizing:border-box';
      const css=document.createElement('style'); css.textContent='#micp .pan{width:min(320px,92vw);background:#ece5d3;border:3px solid #3b2a1e;padding:10px 12px;max-height:94vh;overflow:auto;box-sizing:border-box;zoom:var(--uiz,1)} #micp .row{display:flex;align-items:center;gap:5px;margin:7px 0;flex-wrap:wrap} #micp .row>span:first-child{width:78px} #micp input[type=range]{flex:1} #micp .btn{font:inherit;padding:4px 7px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #micp .btn.on{background:#3b2a1e;color:#ece5d3} #micp .box{max-height:190px;overflow:auto;border:2px solid #3b2a1e;background:#f6f1e4} #micp .sl{padding:4px 6px;cursor:pointer;border-bottom:1px solid #d8cfba} #micp .sl.on{background:#3b2a1e;color:#ece5d3} #micp .ab{margin-top:6px;color:#6a4a32;line-height:1.5} #micp canvas{border-radius:50%;cursor:grab;touch-action:none;max-width:94vw;max-height:94vh}';
      document.head.appendChild(css); document.body.appendChild(el);
      const cv=document.createElement('canvas'), pan=document.createElement('div'); pan.className='pan ml'; el.appendChild(cv); el.appendChild(pan);
      Object.assign(V,{el,cv,g:cv.getContext('2d'),pan,obj:0,zf:0,light:.7,diaph:.6,sx:0,sy:0,vx:0,vy:0,blurT:0,slide:null,img:null,org:null,t:0,keys:new Set(),drag:null,loads:{}});
      const q=a=>pan.querySelector('[data-a="'+a+'"]');
      V.draw=()=>{ const s=V.slide, O=OBJ[V.obj];
        pan.innerHTML=`<div><b>THE MICROSCOPE</b> <button class="btn" style="float:right" data-a="x">DONE</button></div>
          <div class="ab" style="margin:4px 0 6px">SLIDE BOX</div><div class="box">${MIC.slides().map(x=>`<div class="sl ${s&&s.id===x.id?'on':''}" data-s="${x.id}">${esc(x.name)}${x.mag?' · '+esc(x.mag):''}</div>`).join('')}</div>
          ${MIC.ext.map(x=>x.panel?x.panel()||'':'').join('')}<div class="row"><span>OBJECTIVE</span>${OBJ.map((o,i)=>`<button class="btn ${i===V.obj?'on':''}" data-o="${i}">${o.m}X</button>`).join('')}</div>
          <div class="row"><span>COARSE</span><button class="btn" data-f="-50">-</button><button class="btn" data-f="50">+</button><span style="width:auto">FINE</span><button class="btn" data-f="-1">-</button><button class="btn" data-f="1">+</button></div>
          <div class="row"><span>LIGHT</span><input type="range" min="0" max="100" value="${Math.round(V.light*100)}" data-k="light"></div>
          <div class="row"><span>DIAPHRAGM</span><input type="range" min="0" max="100" value="${Math.round(V.diaph*100)}" data-k="diaph"></div>
          <div class="row"><span>STAGE</span><button class="btn" data-m="-1,0">&lt;</button><button class="btn" data-m="0,-1">^</button><button class="btn" data-m="0,1">v</button><button class="btn" data-m="1,0">&gt;</button></div>
          <div class="ab">${O.m*10}X · FIELD ${fov()>=1000?(fov()/1000).toFixed(2)+' MM':Math.round(fov())+' µM'} · NA ${O.na}<br>${s?`<b>${esc(s.name)}</b><br>${esc(s.about||'')}${s.credit?'<br><span style="color:#8a7a62">'+esc(s.credit)+'</span>':''}`:'PICK A SLIDE FROM THE BOX.'}</div>
          <div class="ab" style="color:#8a7a62">DRAG OR WASD: STAGE · WHEEL: FINE FOCUS (SHIFT: COARSE) · 1-4: OBJECTIVE · ESC: DONE</div>`; };
      pan.addEventListener('click',e=>{ const x0=e.target.closest('[data-x]'); if(x0){ for(const x of MIC.ext)if(x.click&&x.click(x0))break; V.draw(); return; } const b=e.target.closest('[data-a],[data-o],[data-f],[data-m],[data-s]'); if(!b)return; const d=b.dataset;
        if(d.a==='x')return MIC.close(); if(d.o!=null)MIC.objective(+d.o); if(d.f!=null)MIC.focus(+d.f); if(d.m!=null){ const [x,y]=d.m.split(',').map(Number); V.vx+=x*fov()*.8; V.vy+=y*fov()*.8; } if(d.s!=null)MIC.place(d.s); });
      pan.addEventListener('input',e=>{ const k=e.target.dataset.k; if(k)V[k]=+e.target.value/100; for(const x of MIC.ext)if(x.input)x.input(e.target); });
      cv.addEventListener('wheel',e=>{ e.preventDefault(); MIC.focus((e.deltaY>0?-1:1)*(e.shiftKey?50:1)); },{passive:false});
      cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); V.drag=[e.clientX,e.clientY,performance.now()]; V.tap=[e.clientX,e.clientY]; cv.style.cursor='grabbing'; });
      cv.addEventListener('pointermove',e=>{ if(!V.drag)return; const k=fov()/cv.clientWidth, dx=e.clientX-V.drag[0], dy=e.clientY-V.drag[1], t=performance.now(), dt=Math.max(1,t-V.drag[2])/1000;
        // the image in a microscope moves opposite to the slide: dragging the picture right pushes the slide left
        V.sx-=dx*k; V.sy-=dy*k; V.vx=-dx*k/dt*.5; V.vy=-dy*k/dt*.5; V.drag=[e.clientX,e.clientY,t]; edge(); });
      const up=e=>{ V.drag=null; cv.style.cursor='grab'; const t=V.tap; V.tap=null; if(t&&e&&e.type==='pointerup'&&Math.hypot(e.clientX-t[0],e.clientY-t[1])<5){ const r=cv.getBoundingClientRect(), k=cv.width/fov()*r.width/cv.width, ux=V.sx+(e.clientX-r.left-r.width/2)/k, uy=V.sy+(e.clientY-r.top-r.height/2)/k; for(const x of MIC.ext)if(x.tap)x.tap(ux,uy); } }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
      addEventListener('keydown',e=>{ if(el.hidden)return; if(e.target&&e.target.closest&&e.target.closest('input'))return; e.stopImmediatePropagation(); const k=e.key.toLowerCase();
        if(k==='escape')return MIC.close(); if('1234'.includes(k)&&k)MIC.objective(+k-1); V.keys.add(k); },true);
      addEventListener('keyup',e=>{ if(el.hidden)return; e.stopImmediatePropagation(); V.keys.delete(e.key.toLowerCase()); },true);
      addEventListener('resize',()=>{ if(!el.hidden)size(); }); }
    V.el.hidden=false; MIC.open=true; if(!UI.gamewin)UI.gamewin='micro'; size(); if(!V.slide)MIC.place('pond'); V.draw(); for(const x of MIC.ext)if(x.open)x.open(); };
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const size=()=>{ const s=Math.round(Math.min(innerHeight*.9,innerWidth*.94,720)); V.cv.width=V.cv.height=s; V.cv.style.width=V.cv.style.height=s+'px'; };
  const fov=()=>FN/OBJ[V.obj].m;   // the real field of view at the specimen, in µm
  MIC.close=()=>{ if(!V.el)return; V.el.hidden=true; MIC.open=false; if(UI.gamewin==='micro')UI.gamewin=null; V.keys.clear(); V.org=null; for(const x of MIC.ext)if(x.close)x.close(); };
  MIC.redraw=()=>{ if(V.draw)V.draw(); };
  MIC.slides=()=>[{id:'pond',name:'POND WATER (LIVE)',mag:'',about:'A fresh drop from the park pond under a cover slip, about 100 µm deep. Everything in it is alive.',credit:''}].concat(((MIC.data&&MIC.data.slides)||[]).filter(s=>SLF[s.id]),MIC.ext.flatMap(x=>x.slides?x.slides():[]));
  // a slide's real width in µm: its own figure if it has one, else its picture read as a 100 mm print at the magnification given
  const widthOf=s=>{ if(s.um)return +s.um; if(s.src)return widthOf(MIC.slides().find(x=>x.id===s.src)||{}); const m=parseFloat(String(s.mag||'').replace(/[^0-9.]/g,''))||100; return 1e5/m; };
  MIC.place=id=>{ '@later'; const s=MIC.slides().find(x=>x.id===id); if(!s)return; V.slide=s; V.sx=V.sy=V.vx=V.vy=0; V.zf=(Math.random()<.5?-1:1)*(10+Math.random()*25); V.blurT=.5; V.img=null; V.org=null;
    if(id==='pond'||s.live)pond(s.live); else if(s.draw){ V.W=V.H=+s.um||4000; } else { V.W=widthOf(s); const im=new Image(); im.decoding='async'; im.onload=()=>{ if(V.slide===s){ V.img=im; V.H=V.W*im.naturalHeight/im.naturalWidth; } }; im.src=SLF[s.src||id]; V.loads[id]=(V.loads[id]||0)+1; }
    V.draw(); if(SFX)SFX.play('click',{vol:.4,vary:.3}); };
  MIC.objective=i=>{ if(!V.el||i===V.obj||!OBJ[i])return; V.obj=i; V.blurT=.45; V.zf+=(Math.random()-.5)*OBJ[i].dof*3; V.draw(); if(SFX)SFX.play('click',{vol:.5,vary:.2}); };   // parfocal, nearly: a touch of fine focus after each turn
  MIC.focus=d=>{ if(!V.el)return; V.zf+=d*(Math.abs(d)>=10?1:Math.min(1,OBJ[V.obj].dof*.4+.1)); };
  // the stage's travel ends where the specimen does: a stop at each edge, the knob's spring giving a little
  const edge=()=>{ '@later'; const lv=V.slide&&(V.slide.id==='pond'||V.slide.live), w=lv?V.PW:V.W||0, h=lv?V.PW:V.H||w; if(!w)return; const hx=w/2, hy=h/2;
    if(V.sx>hx){ V.sx=hx; V.vx=-Math.abs(V.vx)*.15; } if(V.sx<-hx){ V.sx=-hx; V.vx=Math.abs(V.vx)*.15; } if(V.sy>hy){ V.sy=hy; V.vy=-Math.abs(V.vy)*.15; } if(V.sy<-hy){ V.sy=-hy; V.vy=Math.abs(V.vy)*.15; } };

  /* ---------- the pond water: every organism at its real size (µm), speed and depth; small things jostled by the water's molecules ---------- */
  const KT=4.11e-21, ETA=1.0e-3;   // thermal energy at 25 °C (J), water's viscosity (Pa·s)
  const KINDS={
    paramecium:{len:200,wid:55,spd:900,n:[2,5],z:[10,90]}, euglena:{len:55,wid:12,spd:120,n:[3,8],z:[5,95]}, amoeba:{len:300,wid:300,spd:4,n:[0,2],z:[92,99]},
    rotifer:{len:280,wid:90,spd:0,n:[1,3],z:[85,99]}, volvox:{len:420,wid:420,spd:90,n:[1,3],z:[20,80]}, diatom:{len:70,wid:14,spd:12,n:[6,14],z:[94,99]},
    daphnia:{len:1500,wid:900,spd:0,n:[0,1],z:[30,70]}, tardigrade:{len:350,wid:110,spd:25,n:[0,1],z:[93,99]}};
  const rnd=s=>()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
  const pond=live=>{ '@later'; const r=rnd((Date.now()%2147483646)+1), PW=V.PW=2400, O=[], pick=(a,b)=>a+Math.floor(r()*(b-a+1)), at=()=>[(r()-.5)*PW,(r()-.5)*PW];   // live: how many of each kind (a jar's drop, 150fi), else a drop from the park pond
    for(const k in KINDS){ const K=KINDS[k], n=live?Math.round(live[k]||0):pick(...K.n); for(let i=0;i<n;i++){ const [x,y]=at(); O.push({k,x,y,z:K.z[0]+r()*(K.z[1]-K.z[0]),a:r()*6.28,len:K.len*(.8+r()*.4),ph:r()*6.28,t:0,rev:0,hop:0,vx:0,vy:0,seed:r()}); } }
    if(!live&&r()<.12){ const [x,y]=at(); O.push({k:'tardigrade',x,y,z:96,a:r()*6.28,len:350,ph:0,t:0}); }
    // bacteria, yeast and silt, 0.5 to 6 µm: no motion of their own, only Brownian
    const P=[]; for(let i=0;i<(live&&live.silt||2400);i++){ const d=.5+Math.pow(r(),2)*5.5; P.push({x:(r()-.5)*PW,y:(r()-.5)*PW,z:r()*100,d,c:r()<.7?0:1}); }
    V.org=O; V.part=P; V.rand=r; };
  const brown=(d,dt,g)=>Math.sqrt(2*KT/(6*Math.PI*ETA*d/2*1e-6)*dt)*1e6*g;   // rms step per axis in µm: √(2·D·dt), D = kT/(6πηr)
  const gauss=r=>{ let u=0; for(let i=0;i<6;i++)u+=r(); return (u-3)/Math.SQRT2; };
  const swim=dt=>{ '@later'; const O=V.org, r=V.rand, PW=V.PW, H=PW/2;
    for(const o of O){ const K=KINDS[o.k]; o.t+=dt; if(V.still)continue; o.ph+=dt;   // still: stained and dead (150fi); only the water's molecules move them now
      if(o.k==='paramecium'){ if(o.rev>0){ o.rev-=dt; o.x-=Math.cos(o.a)*K.spd*.4*dt; o.y-=Math.sin(o.a)*K.spd*.4*dt; if(o.rev<=0)o.a+=1+r()*1.5; } else { o.a+=Math.sin(o.ph*2.2)*.9*dt+(r()-.5)*.3*dt; o.x+=Math.cos(o.a)*K.spd*dt; o.y+=Math.sin(o.a)*K.spd*dt; } o.z+=Math.sin(o.ph*1.3)*8*dt; }
      else if(o.k==='euglena'){ o.a+=(r()-.5)*1.4*dt; o.x+=Math.cos(o.a)*K.spd*dt; o.y+=Math.sin(o.a)*K.spd*dt; }
      else if(o.k==='amoeba'){ o.a+=(r()-.5)*.4*dt; o.x+=Math.cos(o.a)*K.spd*dt; o.y+=Math.sin(o.a)*K.spd*dt; }
      else if(o.k==='volvox'){ o.a+=(r()-.5)*.2*dt; o.x+=Math.cos(o.a)*K.spd*dt; o.y+=Math.sin(o.a)*K.spd*dt; o.rot=(o.rot||0)+dt*.9; }
      else if(o.k==='diatom'){ if(((o.t/6)|0)%2)o.x+=Math.cos(o.a)*K.spd*dt,o.y+=Math.sin(o.a)*K.spd*dt; else o.x-=Math.cos(o.a)*K.spd*dt,o.y-=Math.sin(o.a)*K.spd*dt; }
      else if(o.k==='tardigrade'){ o.a+=(r()-.5)*.3*dt; const st=Math.max(0,Math.sin(o.ph*3)); o.x+=Math.cos(o.a)*K.spd*st*dt; o.y+=Math.sin(o.a)*K.spd*st*dt; }
      else if(o.k==='daphnia'){ o.hop-=dt; if(o.hop<=0){ o.hop=.6+r()*1.4; o.vy=-(300+r()*500); o.vx=(r()-.5)*400; } o.x+=o.vx*dt; o.y+=o.vy*dt; o.vx*=Math.pow(.15,dt); o.vy=o.vy*Math.pow(.15,dt)+60*dt; }   // a stroke of the antennae, then it sinks
      // the cover slip's edge: they turn back (a paramecium backs off, its avoiding reaction)
      if(Math.abs(o.x)>H||Math.abs(o.y)>H){ o.x=Math.max(-H,Math.min(H,o.x)); o.y=Math.max(-H,Math.min(H,o.y)); if(o.k==='paramecium'&&!(o.rev>0))o.rev=.5; else o.a+=Math.PI*(.6+r()*.4); }
      o.z=Math.max(1,Math.min(99,o.z)); }
    // two paramecia bumping: both reverse
    for(let i=0;i<O.length;i++){ const a=O[i]; if(V.still||a.k!=='paramecium'||a.rev>0)continue; for(const b of O){ if(b===a)continue; const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<(a.len+b.len)*.35){ a.rev=.4; break; } } }
    for(const p of V.part){ const s=brown(p.d,dt,1); p.x+=gauss(r)*s; p.y+=gauss(r)*s; p.z+=gauss(r)*s; }
    // the rotifers' crowns draw the nearby silt toward their mouths
    for(const o of O){ if(o.k!=='rotifer')continue; const mx=o.x+Math.cos(o.a)*o.len*.5, my=o.y+Math.sin(o.a)*o.len*.5; for(const p of V.part){ const dx=mx-p.x, dy=my-p.y, d=Math.hypot(dx,dy); if(d<120&&d>4){ p.x+=dx/d*40*dt; p.y+=dy/d*40*dt; } } } };

  /* ---------- what you see: the bright field, the specimen at its scale, blurred by its distance from the focal plane ---------- */
  const blurOf=dz=>{ const O=OBJ[V.obj], e=Math.max(0,Math.abs(dz)-O.dof/2)/O.dof; return Math.min(14,e*1.6)*(1+V.diaph*.3)/(1+V.diaph*.6)+(MIC.haze?MIC.haze(O,V):0); };
  const frame=dt=>{ '@later'; if(!V.el||V.el.hidden)return; const g=V.g, S=V.cv.width, F=fov(), k=S/F, O=OBJ[V.obj]; V.t+=dt;
    // the stage: knobs (WASD/arrows) push it, it coasts a moment and stops at its ends
    const KY=V.keys, ax=(KY.has('d')||KY.has('arrowright')?1:0)-(KY.has('a')||KY.has('arrowleft')?1:0), ay=(KY.has('s')||KY.has('arrowdown')?1:0)-(KY.has('w')||KY.has('arrowup')?1:0);
    if(ax||ay){ V.vx+=ax*F*2.5*dt; V.vy+=ay*F*2.5*dt; } if(!V.drag){ V.sx+=V.vx*dt; V.sy+=V.vy*dt; } const f=Math.pow(.02,dt); V.vx*=f; V.vy*=f; edge();
    V.blurT=Math.max(0,V.blurT-dt); const lamp=.25+V.light*.95, con=.8+(1-V.diaph)*.6;
    g.save(); g.fillStyle='#000'; g.fillRect(0,0,S,S); g.beginPath(); g.arc(S/2,S/2,S/2,0,7); g.clip();
    g.fillStyle=`rgb(${Math.round(250*Math.min(1,lamp))},${Math.round(244*Math.min(1,lamp))},${Math.round(222*Math.min(1,lamp))})`; g.fillRect(0,0,S,S);
    const tb=V.blurT>0?V.blurT*16:0, filt=(b)=>`blur(${(b+tb).toFixed(1)}px) brightness(${lamp.toFixed(2)}) contrast(${con.toFixed(2)})`;
    g.translate(S/2,S/2);
    if(V.slide&&(V.slide.id==='pond'||V.slide.live)&&V.org){ swim(Math.min(.05,dt)); const cx=V.sx, cy=V.sy;
      g.filter=`brightness(${lamp.toFixed(2)}) contrast(${con.toFixed(2)})`;
      for(const p of V.part){ const px=(p.x-cx)*k, py=(p.y-cy)*k, r0=p.d/2*k, r=Math.max(.6,r0); if(r0<.3||Math.abs(px)>S/2+r||Math.abs(py)>S/2+r)continue; const b=blurOf(p.z-50-V.zf)+tb, a=Math.max(.05,.55/(1+b*.5));
        g.fillStyle=p.c?`rgba(120,96,60,${a})`:`rgba(70,80,70,${a})`; g.beginPath(); g.arc(px,py,r+b*.6,0,7); g.fill(); }
      for(const o of V.org){ const px=(o.x-cx)*k, py=(o.y-cy)*k, L=o.len*k; if(Math.abs(px)-L>S/2||Math.abs(py)-L>S/2)continue; g.filter=filt(blurOf(o.z-50-V.zf)); g.save(); g.translate(px,py); g.rotate(o.a); DRAW[o.k](g,o,L,k); g.restore(); }
      g.filter='none'; }
    else if(V.img){ const im=V.img, w=V.W*k, h=V.H*k, ppx=w/im.naturalWidth, soft=Math.max(0,Math.log2(ppx)-1)*1.2;   // past about 2 screen pixels to a photo pixel the picture has no more to give: it softens (empty magnification)
      g.filter=filt(blurOf(-V.zf)+soft); g.imageSmoothingEnabled=true; g.drawImage(im,-V.sx*k-w/2,-V.sy*k-h/2,w,h); g.filter='none'; }
    else if(V.slide&&V.slide.draw){ g.filter=filt(blurOf(-V.zf)); V.slide.draw(g,{k,S,F,sx:V.sx,sy:V.sy,t:V.t,V}); g.filter='none'; }
    else if(V.slide){ g.fillStyle='rgba(60,50,40,.5)'; g.font='14px monospace'; g.textAlign='center'; g.fillText('PUTTING THE SLIDE ON THE STAGE…',0,0); }
    for(const x of MIC.ext)if(x.over)x.over(g,{S,k,F,V});
    g.restore();
    // the eyepiece's edge, dust on the lens, and the scale bar (a reticle in µm)
    const vg=g.createRadialGradient(S/2,S/2,S*.36,S/2,S/2,S*.5); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.85)'); g.fillStyle=vg; g.beginPath(); g.arc(S/2,S/2,S/2,0,7); g.fill();
    const bar=scaleBar(F), bw=bar*k; g.fillStyle='rgba(20,20,20,.85)'; g.fillRect(S/2-bw/2,S*.86,bw,3); g.font='bold 11px monospace'; g.textAlign='center'; g.fillText(bar>=1000?(bar/1000)+' mm':bar+' µm',S/2,S*.86-5);
    V.bar=bar; V.barPx=bw; };
  const scaleBar=F=>{ const t=F/4, p=Math.pow(10,Math.floor(Math.log10(t))); for(const m of [5,2,1])if(m*p<=t)return m*p; return p; };
  MIC.frame=frame; MIC.K={OBJ,KINDS,V,fov:()=>fov(),blurOf:z=>blurOf(z),DRAW:null};

  // the microbes, drawn at their size L (px) along their long axis, facing +x
  const ell=(g,a,b)=>{ g.beginPath(); g.ellipse(0,0,a,b,0,0,7); };
  const DRAW={
    paramecium:(g,o,L)=>{ '@later'; const W=L*.27; ell(g,L/2,W/2); g.fillStyle='rgba(150,170,140,.35)'; g.fill(); g.strokeStyle='rgba(60,80,60,.8)'; g.lineWidth=Math.max(.6,L*.012); g.stroke();
      g.strokeStyle='rgba(60,80,60,.35)'; g.lineWidth=Math.max(.4,L*.004); for(let i=0;i<40;i++){ const a=i/40*6.28, x=Math.cos(a)*L/2, y=Math.sin(a)*W/2, w=Math.sin(o.ph*40+i)*L*.02; g.beginPath(); g.moveTo(x,y); g.lineTo(x*1.06+w,y*1.12); g.stroke(); }
      g.fillStyle='rgba(90,110,90,.4)'; g.beginPath(); g.ellipse(-L*.05,0,L*.12,W*.25,0,0,7); g.fill(); g.strokeStyle='rgba(90,120,160,.6)'; for(const s of [-.28,.28]){ g.beginPath(); g.arc(L*s,0,W*.12+W*.06*Math.sin(o.ph*4+s*9),0,7); g.stroke(); } },
    euglena:(g,o,L)=>{ '@later'; const f=1+.25*Math.sin(o.ph*3); g.save(); g.scale(1/f,f); ell(g,L/2,L*.12); g.fillStyle='rgba(80,160,70,.55)'; g.fill(); g.strokeStyle='rgba(40,90,40,.8)'; g.lineWidth=Math.max(.5,L*.015); g.stroke(); g.restore();
      g.fillStyle='rgba(220,60,40,.8)'; g.beginPath(); g.arc(L*.38,L*.03,Math.max(.6,L*.03),0,7); g.fill(); g.strokeStyle='rgba(40,80,40,.5)'; g.lineWidth=Math.max(.4,L*.01); g.beginPath(); g.moveTo(L/2,0); for(let i=1;i<=10;i++)g.lineTo(L/2+i*L*.08,Math.sin(o.ph*14-i)*L*.06); g.stroke(); },
    amoeba:(g,o,L)=>{ '@later'; g.beginPath(); for(let i=0;i<=24;i++){ const a=i/24*6.28, r=L*.32*(1+.35*Math.sin(a*3+o.ph*.4+o.seed*9)+.2*Math.sin(a*5-o.ph*.25)); g.lineTo(Math.cos(a)*r,Math.sin(a)*r); } g.closePath(); g.fillStyle='rgba(170,170,150,.35)'; g.fill(); g.strokeStyle='rgba(90,90,80,.7)'; g.lineWidth=Math.max(.5,L*.006); g.stroke();
      g.fillStyle='rgba(100,100,90,.4)'; for(let i=0;i<14;i++){ const a=o.seed*50+i*2.4, r=L*.18*((i*.37)%1); g.beginPath(); g.arc(Math.cos(a+o.ph*.1)*r,Math.sin(a+o.ph*.1)*r,Math.max(.4,L*.012),0,7); g.fill(); } g.fillStyle='rgba(80,80,70,.5)'; g.beginPath(); g.arc(L*.05,0,L*.05,0,7); g.fill(); },
    rotifer:(g,o,L)=>{ '@later'; g.beginPath(); g.moveTo(-L/2,0); g.quadraticCurveTo(-L*.1,L*.2,L*.35,L*.15); g.lineTo(L*.35,-L*.15); g.quadraticCurveTo(-L*.1,-L*.2,-L/2,0); g.fillStyle='rgba(190,180,150,.4)'; g.fill(); g.strokeStyle='rgba(100,90,70,.75)'; g.lineWidth=Math.max(.5,L*.01); g.stroke();
      for(const s of [-1,1]){ g.beginPath(); g.arc(L*.4,s*L*.1,L*.08,0,7); g.stroke(); for(let i=0;i<10;i++){ const a=i/10*6.28+o.ph*12*s; g.beginPath(); g.moveTo(L*.4+Math.cos(a)*L*.08,s*L*.1+Math.sin(a)*L*.08); g.lineTo(L*.4+Math.cos(a)*L*.11,s*L*.1+Math.sin(a)*L*.11); g.stroke(); } }
      g.fillStyle='rgba(120,100,70,.5)'; g.beginPath(); g.arc(L*.05,0,L*.06*(1+.3*Math.sin(o.ph*5)),0,7); g.fill(); },
    volvox:(g,o,L)=>{ '@later'; ell(g,L/2,L/2); g.fillStyle='rgba(90,170,80,.18)'; g.fill(); g.strokeStyle='rgba(50,120,50,.6)'; g.lineWidth=Math.max(.5,L*.008); g.stroke(); g.fillStyle='rgba(60,140,60,.7)';
      for(let i=0;i<90;i++){ const a=i*2.4+(o.rot||0), r=L*.48*Math.sqrt((i+.5)/90); if(r<L*.42)continue; g.beginPath(); g.arc(Math.cos(a)*r,Math.sin(a)*r,Math.max(.4,L*.01),0,7); g.fill(); }
      g.fillStyle='rgba(40,120,40,.45)'; for(let i=0;i<4;i++){ const a=i*1.57+o.seed*6+(o.rot||0)*.3; g.beginPath(); g.arc(Math.cos(a)*L*.2,Math.sin(a)*L*.2,L*.08,0,7); g.fill(); } },
    diatom:(g,o,L)=>{ '@later'; ell(g,L/2,L*.1); g.fillStyle='rgba(180,150,80,.45)'; g.fill(); g.strokeStyle='rgba(120,90,40,.85)'; g.lineWidth=Math.max(.4,L*.02); g.stroke(); g.strokeStyle='rgba(120,90,40,.4)'; g.lineWidth=Math.max(.3,L*.006);
      for(let i=-8;i<=8;i++){ g.beginPath(); g.moveTo(i*L*.055,-L*.08); g.lineTo(i*L*.055,L*.08); g.stroke(); } g.beginPath(); g.moveTo(-L*.45,0); g.lineTo(L*.45,0); g.stroke(); },
    daphnia:(g,o,L)=>{ '@later'; g.beginPath(); g.ellipse(0,L*.05,L*.42,L*.28,0,0,7); g.fillStyle='rgba(200,170,120,.3)'; g.fill(); g.strokeStyle='rgba(120,90,60,.7)'; g.lineWidth=Math.max(.6,L*.006); g.stroke();
      g.fillStyle='rgba(20,20,20,.85)'; g.beginPath(); g.arc(L*.36,-L*.12,L*.035,0,7); g.fill(); const hb=1+.35*Math.max(0,Math.sin(o.ph*2*Math.PI*4));   // its heart beats about four times a second
      g.fillStyle='rgba(200,80,60,.5)'; g.beginPath(); g.arc(L*.12,-L*.12,L*.03*hb,0,7); g.fill(); g.strokeStyle='rgba(120,90,60,.6)'; const sw=Math.max(0,o.hop-0.4)*2;
      for(const s of [-1,1]){ g.beginPath(); g.moveTo(L*.3,-L*.15); g.lineTo(L*.1,-L*.15+s*L*(.35-sw*.15)); g.stroke(); } g.beginPath(); g.moveTo(-L*.4,L*.1); g.lineTo(-L*.62,L*.25); g.stroke(); g.fillStyle='rgba(120,140,60,.35)'; g.beginPath(); g.ellipse(-L*.05,L*.08,L*.25,L*.05,0,0,7); g.fill(); },
    tardigrade:(g,o,L)=>{ '@later'; g.beginPath(); g.ellipse(0,0,L/2,L*.16,0,0,7); g.fillStyle='rgba(190,170,140,.5)'; g.fill(); g.strokeStyle='rgba(110,90,70,.8)'; g.lineWidth=Math.max(.5,L*.012); g.stroke();
      g.strokeStyle='rgba(110,90,70,.6)'; for(let i=0;i<4;i++){ const x=-L*.36+i*L*.24, sw=Math.sin(o.ph*3+i*1.2)*L*.04; for(const s of [-1,1]){ g.beginPath(); g.moveTo(x,s*L*.14); g.lineTo(x+sw,s*L*.24); g.stroke(); } }
      g.fillStyle='rgba(40,30,30,.8)'; for(const s of [-1,1]){ g.beginPath(); g.arc(L*.42,s*L*.05,Math.max(.5,L*.015),0,7); g.fill(); } }};
  MIC.dbg=()=>V.el?{open:MIC.open,obj:V.obj,mag:OBJ[V.obj].m*10,fov:fov(),bar:V.bar,barPx:V.barPx,S:V.cv.width,slide:V.slide&&V.slide.id,img:!!V.img,W:V.W,H:V.H,sx:V.sx,sy:V.sy,zf:V.zf,blur:+blurOf(-V.zf).toFixed(2),loads:V.loads,
    org:V.org?V.org.map(o=>({k:o.k,x:+o.x.toFixed(1),y:+o.y.toFixed(1),len:o.len})):null,pxPerUm:V.cv.width/fov()}:{open:false};
  MIC.K.DRAW=DRAW; MIC.blurAt=dz=>V.el?blurOf(dz):null; MIC.setFocus=z=>{ if(V.el)V.zf=z; };
  SYS.add('places',dt=>{ if(MIC.open&&MIC.frame)MIC.frame(dt||0); if(MIC.open&&!(MODS.apts&&MODS.apts.inReal))MIC.close(); },'150ff-microscope');
  window.MICDBG=()=>MIC.dbg();
}
export {MIC};
