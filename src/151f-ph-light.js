// THE PLAYHOUSE'S LIGHTING: the rig (lanterns on a bar over the stalls, the wall booms, four electrics that fly with their bars, the wing booms, the follow spot at the back of the stalls, the footlights, the cyclorama's floods), the few real lights they stand for, their beams in the haze, and the board: named states (cues) each channel fades to; a lighting board beside the follow spot to play them when no show is on.
import {THREE} from './003-shx.js';
import {SAY} from './003d-say.js';
import {PHX} from './151b-ph-kit.js';
PHX.parts.push({make:K=>{ '@playhouse';
  const D=K.D, M=K.M, PI=Math.PI, SY=D.SY, V3=THREE.Vector3, Q=new THREE.Quaternion(), E=new THREE.Euler(), M4=new THREE.Matrix4(), S1=new V3(1,1,1);
  const LX=K.lx={ch:{},fix:[],beams:[],t:0};
  // a lantern's body: a black barrel, its yoke, the clamp, the colour frame, barn doors on the fresnels (one geometry; aimed down its -z)
  const body=fres=>K.merge([[new THREE.CylinderGeometry(.13,.15,.42,12),K.mx(0,0,0,PI/2)],[new THREE.CylinderGeometry(.16,.16,.06,12),K.mx(0,0,-.2,PI/2)],[new THREE.BoxGeometry(.04,.36,.04),K.mx(-.19,.1,0)],[new THREE.BoxGeometry(.04,.36,.04),K.mx(.19,.1,0)],
    [new THREE.BoxGeometry(.42,.04,.04),K.mx(0,.28,0)],[new THREE.BoxGeometry(.06,.1,.08),K.mx(0,.34,0)],[new THREE.BoxGeometry(.36,.36,.02),K.mx(0,0,-.25)],
    ...(fres?[[new THREE.BoxGeometry(.34,.02,.16),K.mx(0,.18,-.32,-.5)],[new THREE.BoxGeometry(.34,.02,.16),K.mx(0,-.18,-.32,.5)],[new THREE.BoxGeometry(.02,.34,.14),K.mx(.18,0,-.31,0,-.5)],[new THREE.BoxGeometry(.02,.34,.14),K.mx(-.18,0,-.31,0,.5)]]:[])]);
  const BODY={f:body(1),p:body(0)}, LENS=new THREE.CircleGeometry(.12,14);
  const lensM=new THREE.MeshBasicMaterial({color:0xffffff}), bodyM=M.black;
  // hang lanterns on a parent (a bar that may fly): each [x,y,z] aimed at a point on the stage, its channel
  const hang=(parent,list,fres=1)=>{ const n=list.length, B=new THREE.InstancedMesh(fres?BODY.f:BODY.p,bodyM,n), Ln=new THREE.InstancedMesh(LENS,lensM,n), dummy=new THREE.Object3D();
    list.forEach(([x,y,z,aim,ch],i)=>{ dummy.position.set(x,y,z); dummy.lookAt(new V3(x+(x-aim[0]),y+(y-aim[1]),z+(z-aim[2]))); dummy.updateMatrix(); B.setMatrixAt(i,dummy.matrix);
      const lp=new V3(0,0,-.231).applyQuaternion(dummy.quaternion).add(dummy.position); dummy.position.copy(lp); dummy.updateMatrix(); const m2=dummy.matrix.clone(); Ln.setMatrixAt(i,m2.multiply(new THREE.Matrix4().makeRotationY(PI)));
      Ln.setColorAt(i,new THREE.Color(0,0,0)); LX.fix.push({ln:Ln,i,ch}); });
    B.castShadow=true; B.receiveShadow=true; Ln.castShadow=false; parent.add(B); parent.add(Ln); B.instanceMatrix.needsUpdate=true; Ln.instanceMatrix.needsUpdate=true; return B; };
  const FB=[8.2,10.4], FS=[-8.4,D.FY,13.9], CZ=K.fly.byId.cyc.z, E3=K.fly.byId.e3.z;
  // the front of house: twelve on a bar hung from the stalls' ceiling; a boom on each side wall
  { const g=new THREE.Group(); K.G.add(g); const L=[]; for(let i=0;i<12;i++){ const x=-8.25+i*1.5; L.push([x,FB[0]-.3,FB[1],[x*.35,SY+1.2,-2.5],i<6?'fohL':'fohR']); }
    K.rod([-8.6,FB[0],FB[1]],[8.6,FB[0],FB[1]],.024,M.steel); for(const x of [-6,6])K.rod([x,FB[0],FB[1]],[x,D.HOUSE,FB[1]],.012,M.steel); hang(g,L,0);
    const B=[]; for(const s of [-1,1]){ K.rod([s*9.6,5.8,3],[s*9.6,8.4,3],.024,M.steel); for(let k=0;k<3;k++)B.push([s*9.6,6.1+k*.75,3,[-s*2,SY+1.2,-3],'side']); } hang(g,B,0); }
  // the electrics: eight lanterns on each, hung from the bar (they fly with it)
  for(const s of K.fly.sets.filter(s=>s.kind==='elec')){ const L=[], id=s.id; for(let i=0;i<8;i++){ const x=-7+i*2; const ch=id==='e1'?'wash':id==='e2'?(i%2?'washC':'wash'):id==='e3'?'back':'cyc'; const aim=id==='e4'?[x,SY+4,CZ-.1-s.z]:id==='e3'?[x*.6,SY,-3-s.z+4.5]:[x*.6,SY,-2.5-s.z];
      L.push([x,-.32,0,[aim[0],aim[1]-s.y,aim[2]],ch]); } hang(s.g,L,id!=='e4');
    K.tube([[-9.6,.02,.04],[-4,.06,.04],[0,.02,.04],[4,.06,.04],[9.6,.02,.04]].map(p=>p),.03,M.matte,{p:s.g}); }
  // the wing booms, stage right behind the legs (stage left is the lock rail's): pipes on bases, three lanterns each, low and from the side
  for(const s of [-1])for(const z of [-2.0,-4.2,-6.6]){ const g=new THREE.Group(); K.G.add(g); K.rod([s*7.4,SY,z],[s*7.4,SY+4.2,z],.03,M.steel); K.cyl(.2,.2,.05,M.iron,s*7.4,SY+.03,z,{seg:16});
    hang(g,[[s*7.4,SY+1.1,z,[-s*3,SY+1,z],'side'],[s*7.4,SY+2.3,z,[-s*3,SY+1.3,z],'side'],[s*7.4,SY+3.6,z,[-s*4,SY+.8,z],'side']],0); K.solid(s*7.4-.2,z-.2,s*7.4+.2,z+.2); }
  // the follow spot on its stand at the back of the stalls; its operator's stool
  { const [x,y,z]=FS; K.lathe([[0,0],[.35,0],[.35,.04],[.05,.08],[.05,1.25],[0,1.25]],M.iron,x,y,z,{seg:12});
    const g=new THREE.Group(); g.position.set(x,y+1.45,z); K.G.add(g); const bar=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,1.3,16),M.black); bar.rotation.x=PI/2; g.add(bar);
    const lens=new THREE.Mesh(new THREE.CircleGeometry(.18,16),lensM.clone()); lens.position.z=-.66; lens.rotation.y=PI; g.add(lens); LX.followHead={g,lens};
    K.lathe([[0,0],[.18,0],[.03,.05],[.03,.65],[.2,.68],[.2,.72],[0,.72]],M.iron,x+.8,y,z+.4,{seg:10}); K.solid(x-.45,z-.45,x+.45,z+.45); }
  // the footlights along the apron: their bulbs behind the brass hood
  { const P=K.foot.filter((_,i)=>i%2===0).map(p=>[p[0],p[1]-.02,p[2]+.05]); LX.footI=K.inst(new THREE.SphereGeometry(.04,8,6),lensM.clone(),P,{cast:false}); LX.footI.material=new THREE.MeshBasicMaterial({color:0}); }
  // the cyclorama's ground row: a trough of floods along the foot of the cyc
  { const g=new THREE.Group(); K.G.add(g); const L=[]; for(let i=0;i<10;i++){ const x=-8.55+i*1.9; L.push([x,SY+.2,CZ+.5,[x,SY+6,CZ-.1],'cyc']); } hang(g,L,0); K.boxA(-9.4,SY,CZ+.3,9.4,SY+.4,CZ+.7,M.black); }

  /* ---------- the real lights the rig stands for ---------- */
  const spot=(p,t,ang,pen,i,dist,shadow)=>{ const l=new THREE.SpotLight(0xffffff,0,dist*K.MH,ang,pen,1.2); l.position.set(...p); l.target.position.set(...t); K.G.add(l); K.G.add(l.target);
    if(shadow){ l.castShadow=true; l.shadow.mapSize.set(1024,1024); l.shadow.bias=-.0008; l.shadow.normalBias=.04; l.shadow.camera.near=1; l.shadow.camera.far=60*K.MH; } return {l,i}; };
  const ch=(k,o)=>{ LX.ch[k]={v:0,c:new THREE.Color(0),to:{v:0,c:new THREE.Color(0)},from:null,t0:0,dur:0,...o}; };
  ch('fohL',{L:[spot([-6,FB[0]-.3,FB[1]-.2],[-.5,SY+1,-3],.32,.55,0,0,true)],I:560,dist:45});
  ch('fohR',{L:[spot([6,FB[0]-.3,FB[1]-.2],[.5,SY+1,-3],.32,.55,0,0)],I:440,dist:45});
  ch('wash',{L:[spot([0,11,-1.7],[0,SY,-4],.75,.7,0,0)],I:320,dist:30});
  ch('washC',{L:[]});
  ch('back',{L:[spot([0,11,E3],[0,SY,-3],.7,.6,0,0)],I:300,dist:30});
  ch('side',{L:[spot([-7.4,SY+2.3,-4.2],[3,SY+1.2,-4],.55,.6,0,0)],I:260,dist:24});
  ch('follow',{L:[spot([FS[0],FS[1]+1.45,FS[2]],[0,SY+1,-3],.055,.35,0,0,true)],I:2600,dist:60});
  ch('cyc',{L:[],pt:[]}); { const l=new THREE.PointLight(0,0,16*K.MH,1.2); l.userData.pool=true; l.position.set(0,SY+5,CZ+1.8); K.G.add(l); LX.ch.cyc.pt.push({l,i:60}); }
  ch('foot',{L:[]}); ch('house',{}); ch('prac',{L:[]});
  for(const k of ['fohL','fohR','wash','back','side','follow'])for(const e of LX.ch[k].L)e.l.userData.ch=k;
  // the beams in the haze: a soft cone from each big lantern to where it lands
  const beam=(from,to,r0,r1,k,op)=>{ const A=new V3(...from), B=new V3(...to), L=A.distanceTo(B), g=new THREE.CylinderGeometry(r1,r0,L,20,1,true), m=new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    { const p=g.attributes.position, c=new Float32Array(p.count*3); for(let i=0;i<p.count;i++){ const f=.5-p.getY(i)/L; c.set([.35+.65*f,.35+.65*f,.35+.65*f],i*3); } g.setAttribute('color',new THREE.BufferAttribute(c,3)); m.vertexColors=true; }
    const me=new THREE.Mesh(g,m); me.position.copy(A).add(B).multiplyScalar(.5); me.quaternion.setFromUnitVectors(new V3(0,1,0),B.clone().sub(A).normalize()); me.renderOrder=5; me.castShadow=false; me.receiveShadow=false; K.G.add(me); LX.beams.push({me,k,op}); return me; };
  for(let i=0;i<8;i++){ const x=-7+i*2; beam([x,10.3,-1.75],[x*.6,SY,-2.6],.06,1.4,i%2?'washC':'wash',.022); beam([x,10.3,E3-.05],[x*.6,SY,-4.2],.06,1.2,'back',.028); }
  LX.fbeam=beam([FS[0],FS[1]+1.45,FS[2]-.6],[0,SY,-3],.1,.5,'follow',.03);

  /* ---------- the board: named looks, each channel's level and colour; a cue fades from where things are to its look ---------- */
  const W='#ffd9a0', CO='#a8c4ff', MO='#6c86ff', DU='#ff9a50', VI='#a070ff', GR='#5cd88a', CA='#ffae50', WH='#fff4e4', AM='#ffb870';
  LX.LOOKS={
    work:{house:1,wash:[.35,WH],back:[0,WH],fohL:[0,W],fohR:[0,CO],side:[0,W],follow:[0,WH],cyc:[0,WH],foot:[0,W],prac:0},
    preset:{house:1,wash:[0,W],cyc:[.06,MO],foot:[.18,AM],fohL:[0,W],fohR:[0,CO],side:[0,W],back:[0,W],follow:[0,WH],prac:0},
    halfHouse:{house:.35,foot:[.35,AM],cyc:[.1,MO]},
    out:{house:0,wash:[0,W],washC:[0,CO],back:[0,W],fohL:[0,W],fohR:[0,CO],side:[0,W],follow:[0,WH],cyc:[0,MO],foot:[0,AM],prac:0},
    dusk:{house:0,fohL:[.9,DU],fohR:[.55,'#ffb080'],wash:[.7,'#ffb070'],washC:[.4,VI],back:[.5,'#ff7a50'],side:[.55,DU],cyc:[1,'#ff8a5a'],foot:[.25,AM],prac:1},
    dusk2:{house:0,fohL:[.7,'#ffa070'],fohR:[.6,'#c8a0ff'],wash:[.55,'#e090a0'],washC:[.5,VI],back:[.5,VI],side:[.45,'#ff8a70'],cyc:[.9,'#a060d0'],foot:[.2,AM],prac:1},
    court:{house:0,fohL:[.75,'#d8c8ff'],fohR:[.8,CO],wash:[.5,'#a8b8ff'],washC:[.6,MO],back:[.75,MO],side:[.6,'#b0c0ff'],cyc:[.8,'#3048b8'],foot:[.15,'#c0c8ff'],prac:1},
    court2:{house:0,fohL:[.55,'#c0c0ff'],fohR:[.65,CO],wash:[.3,MO],washC:[.45,MO],back:[.85,'#7088ff'],side:[.7,'#a0b8ff'],cyc:[.7,'#2034a0'],foot:[.08,CO],prac:1},
    lovers:{house:0,fohL:[.35,'#c8c0ff'],fohR:[.35,CO],wash:[.15,MO],washC:[.25,MO],back:[.8,'#7a90ff'],side:[.35,MO],cyc:[.55,'#1a2a80'],follow:[.75,'#e8e0ff'],foot:[0,AM],prac:.7},
    helena:{house:0,fohL:[.15,'#c8c0ff'],fohR:[.15,CO],wash:[.05,MO],washC:[.1,MO],back:[.6,MO],side:[.15,MO],cyc:[.35,'#14205a'],follow:[1,'#f0e8ff'],foot:[0,AM],prac:.5},
    wood:{house:0,fohL:[.4,'#a8ffd0'],fohR:[.45,'#90c0ff'],wash:[.25,'#6ad0a0'],washC:[.45,'#4060c0'],back:[.9,'#80ffb0'],side:[.6,GR],cyc:[.7,'#0c3a40'],follow:[.6,'#e8fff0'],foot:[0,AM],prac:.8},
    shop:{house:0,fohL:[.75,CA],fohR:[.5,'#ffc890'],wash:[.6,CA],washC:[.25,'#ff9a60'],back:[.4,'#ffb070'],side:[.6,CA],cyc:[.15,'#3a2010'],foot:[.3,AM],prac:1},
    shopNight:{house:0,fohL:[.45,'#9ab0ff'],fohR:[.4,CO],wash:[.25,MO],washC:[.35,MO],back:[.6,'#7a90ff'],side:[.5,'#ffb070'],cyc:[.35,'#101a50'],foot:[.05,AM],prac:1},
    flats:{house:0,fohL:[1,'#ffe8c0'],fohR:[1,'#ffd0e0'],wash:[.9,'#fff0d0'],washC:[.7,'#ffb0d0'],back:[.5,'#ffe0a0'],side:[.8,'#ff90c0'],cyc:[1,'#7ac0ff'],foot:[1,'#ffe090'],prac:1},
    bump:{fohL:[1,'#fff0d0'],fohR:[1,'#fff0d0'],foot:[1,'#ffe090']},
    call:{house:.15,fohL:[1,W],fohR:[1,'#ffe0c0'],wash:[.9,W],washC:[.6,'#ffd0a0'],back:[.7,W],side:[.7,W],cyc:[.8,'#2a3ab0'],foot:[.8,AM],follow:[0,WH],prac:.6} };
  LX.cue=(name,dur=3)=>{ const L=LX.LOOKS[name]; if(!L)return; LX.now=name; const t=LX.t; for(const [k,v] of Object.entries(L)){ const c=LX.ch[k]; if(!c)continue; c.from={v:c.v,c:c.c.clone()}; c.t0=t; c.dur=Math.max(.01,dur);
      if(typeof v==='number')c.to={v,c:c.to.c.clone()}; else c.to={v:v[0],c:new THREE.Color(v[1])}; } };
  LX.followAt=[0,SY+1,-3];   // the follow spot's pick: a point on stage (metres), or a function giving one
  LX.cue('work',.01);
  // the board itself: a desk of faders by the follow spot; double-click it for the next look
  { const x=-6, z=14, y=D.FY; K.boxA(x-.6,y,z-.35,x+.6,y+.85,z+.35,M.mahog); K.box(1.15,.06,.6,M.black,x,y+.92,z,{rx:-.25}); const fd=[]; for(let i=0;i<16;i++)fd.push([x-.5+i*.066,y+.97,z+.02-(i%2)*.02]); K.inst(new THREE.BoxGeometry(.02,.03,.05),M.chrome,fd,{cast:false});
    const order=['work','preset','dusk','court','lovers','helena','wood','shop','shopNight','flats','call','out']; let k=0;
    K.thing('THE LIGHTING BOARD',x,y+.9,z,1.3,.7,.8,()=>{ if(PHX.show&&PHX.show.running&&PHX.show.running())return; k=(k+1)%order.length; LX.cue(order[k],2.5); SAY('LIGHTS: '+order[k].toUpperCase()); },{reach:1.8,near:3}); K.solid(x-.65,z-.4,x+.65,z+.4); }
},
tick:(dt,K,now,inn)=>{ '@later'; const LX=K.lx; if(!LX)return; LX.t+=dt; const ease=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
  for(const c of Object.values(LX.ch)){ if(!c.from)continue; const k=ease((LX.t-c.t0)/c.dur); c.v=c.from.v+(c.to.v-c.from.v)*k; c.c.copy(c.from.c).lerp(c.to.c,k); if(k>=1)c.from=null; }
  const C=LX.ch, flick=1+.04*Math.sin(LX.t*23)*Math.sin(LX.t*7.3);
  PHX.houseLevel=C.house.v;
  for(const k of ['fohL','fohR','wash','back','side','follow'])for(const e of C[k].L){ e.l.intensity=C[k].I*(k==='wash'?Math.max(C.wash.v,C.washC.v):C[k].v); e.l.color.copy(C[k].c); if(k==='wash'&&C.washC.v>0)e.l.color.lerp(C.washC.c,C.washC.v/(C.wash.v+C.washC.v+1e-6)); }
  for(const e of C.cyc.pt){ e.l.intensity=e.i*C.cyc.v; e.l.color.copy(C.cyc.c); }
  if(K.cycMat)K.cycMat.color.copy(C.cyc.c).multiplyScalar(.08+.72*C.cyc.v);
  const tmp=new THREE.Color(); for(const f of LX.fix){ const c=C[f.ch]||C.wash; tmp.copy(c.c).multiplyScalar(Math.min(1,c.v*1.6)+.03); f.ln.setColorAt(f.i,tmp); f.ln.instanceColor.needsUpdate=true; }
  if(LX.footI)LX.footI.material.color.copy(C.foot.c).multiplyScalar(C.foot.v*flick);
  for(const b of LX.beams){ const c=C[b.k]; b.me.material.color.copy(c.c).multiplyScalar(c.v*b.op*14); b.me.visible=c.v>.02; }
  // the follow spot turns to its pick
  const fa=typeof LX.followAt==='function'?LX.followAt():LX.followAt; if(fa&&C.follow.L[0]){ const T=C.follow.L[0].l.target.position; T.x+=(fa[0]-T.x)*Math.min(1,dt*3); T.y+=(fa[1]-T.y)*Math.min(1,dt*3); T.z+=(fa[2]-T.z)*Math.min(1,dt*3);
    if(LX.fbeam){ const A=C.follow.L[0].l.position, V=new THREE.Vector3(T.x-A.x,T.y-A.y,T.z-A.z), L=V.length(); LX.fbeam.position.set((A.x+T.x)/2,(A.y+T.y)/2,(A.z+T.z)/2); LX.fbeam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),V.normalize()); LX.fbeam.scale.set(1,L/LX.fbeam.geometry.parameters.height,1); }
    if(LX.followHead)LX.followHead.g.lookAt(K.G.localToWorld(new THREE.Vector3(2*LX.followHead.g.position.x-T.x,2*LX.followHead.g.position.y-T.y,2*LX.followHead.g.position.z-T.z))); }
  if(LX.followHead)LX.followHead.lens.material.color.copy(C.follow.c).multiplyScalar(.2+C.follow.v);
  if(inn&&((LX.sh=(LX.sh||0)+1)%3===0))K.shadowDue=true; }});
