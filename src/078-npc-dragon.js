// THE DRAGON: the green dragon that flies over the town, breathes fire and lights its own glow.
import {SHARED, THREE} from './003-shx.js';
import {SKIN} from './003a-skin.js';
import {BLAZE, CLOCK, DRESS, NPCS, PARK, pos, SFX, VIT, WEEDS} from './003b-systems.js';
import {MAPG, MODS, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {WIRES} from './069b-poles.js';
import {makeNPC} from './076-npc-map.js';
import {DRAGON} from './077-npc-skel.js';
{ const DFL=[0,1].map(()=>{ const L=new THREE.PointLight(0xff8a30,0,7*TILE,1.6); MAPG.bodega.add(L); return L; }), DGO=S=>{
  const BN=S.rig.names, JI=Object.fromEntries(BN.map((n,i)=>[n,i]));
  const geomOf=M=>SKIN.geom(M,true,false), rigOf=()=>SKIN.rig(S.rig), CLIPS=SKIN.clips(S.clips,BN);
  const M=S.chars.Dragon, GR=['#0d2410','#163a19','#225023','#2f6630'].map(h=>new THREE.Color(h));
  const greenGeo=()=>{ const g=geomOf(M), c=g.attributes.color, n=c.count, L=new Float32Array(n); for(let i=0;i<n;i++)L[i]=c.getX(i)*.3+c.getY(i)*.59+c.getZ(i)*.11;
    const so=[...L].sort((a,b)=>a-b), q=[so[Math.floor(n*.25)],so[Math.floor(n*.5)],so[Math.floor(n*.75)]], arr=new Uint8Array(n*3);
    for(let i=0;i<n;i++){ const k=L[i]<q[0]?0:L[i]<q[1]?1:L[i]<q[2]?2:3, C=GR[k]; arr[i*3]=C.r*255; arr[i*3+1]=C.g*255; arr[i*3+2]=C.b*255; }
    g.setAttribute('color',new THREE.BufferAttribute(arr,3,true)); return g; };
  const B0=SHARED.BOD.B0, TI=TILE, PER=[
    {x:SHARED.BOD.X(MODS.apts.A.x0+3.7),z:SHARED.BOD.Z(MODS.apts.A.y1)-.6*TI,y:SHARED.BOD.Y(650),h:0},{x:SHARED.BOD.X((B0.x0+B0.x1)/2),z:SHARED.BOD.Z(B0.y1)-.6*TI,y:SHARED.BOD.Y(B0.h),h:0},
    ...WIRES.perch];
  const gy=(x,z)=>{ const t=window.WEEDS&&WEEDS.top&&WEEDS.top(x,z); return typeof t==='number'?t:MODS.bodega.ground(x,z); };
  const TREES=[PARK.trees,DRESS.trees].filter(Boolean).flatMap(m=>m.userData.items||[]).filter(o=>o.top-o.y>2*TI&&o.r>.5*TI);
  const spot=(o,a,k)=>({x:o.x+Math.sin(a)*o.r*k,z:o.z+Math.cos(a)*o.r*k,y:o.y+(o.top-o.y)*(k>.8?.58:.64),h:a,tree:o});
  const HOMES=TREES.map((o,i)=>[Math.sin(i*91.7+o.x)*43758.5%1,o]).sort((a,b)=>a[0]-b[0]).map(q=>q[1]);
  const sky=()=>{ const r=Math.random(), x=SHARED.BOUND.x0+Math.random()*(SHARED.BOUND.x1-SHARED.BOUND.x0);
    return r<.4?{x,z:SHARED.BOUND.z0-(4+Math.random()*22)*TI}:r<.75?{x,z:SHARED.BOUND.z1+(3+Math.random()*20)*TI}:{x,z:SHARED.BOUND.z0+Math.random()*(SHARED.BOUND.z1-SHARED.BOUND.z0)}; };
  const ease=(a,b,k)=>a+(b-a)*k, turnTo=(h,want,max)=>{ let d=((want-h+Math.PI*3)%(Math.PI*2))-Math.PI; d=Math.max(-max,Math.min(max,d)); return [h+d,d]; };
  const haloTex=(c,W)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d'), im=g.createImageData(W,W), Bm=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let j=0;j<W;j++)for(let i=0;i<W;i++){ const d=Math.hypot((i+.5)/W*2-1,(j+.5)/W*2-1), t=(Bm[(j%4)*4+i%4]+.5)/16, a=d<.35+(t-.5)*.1?.9:d<.6+(t-.5)*.12?.45:d<.95+(t-.5)*.1?.15:0, q=(j*W+i)*4; im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=a*255; }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const HT=haloTex([255,150,40],24), FL=DFL;
  const FB=[];
  const fire=(from,dir)=>{ '@later'; let f=FB.find(f=>!f.on); if(!f){ f={g:new THREE.Group()};
      const h=new THREE.Mesh(new THREE.PlaneGeometry(1.6*TI,1.6*TI),new THREE.MeshBasicMaterial({map:HT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); h.onBeforeRender=(r,s,cm)=>{ h.quaternion.copy(cm.quaternion); h.updateMatrixWorld(); };
      f.g.add(h); MAPG.bodega.add(f.g); f.fl=FLAME.add({kind:'ball',x:0,y:0,z:0,w:.95*TI,h:.95*TI,parent:f.g}); FB.push(f); }
    f.on=f.fl.on=true; f.t=0; f.g.visible=true; f.g.position.copy(from); f.v=dir.clone(); };
  const spark=(p,v,life)=>FLAME.part(4,p.x,p.y,p.z,v.x,v.y,v.z,life,.11*TI,undefined,G*1.6);
  const burst=p=>{ '@later'; SFX.play('boom',{at:p,far:40*TI,vol:.9,vary:.2}); for(let k=0;k<18;k++){ const a=Math.random()*Math.PI*2, u=Math.random(); spark(p,new THREE.Vector3(Math.cos(a)*u*3*TI,(1+Math.random()*2.5)*TI,Math.sin(a)*u*3*TI),.6+Math.random()*.6); }
    for(let k=0;k<4;k++)FLAME.puff(p.x+(Math.random()-.5)*.5*TI,p.y+.2*TI,p.z+(Math.random()-.5)*.5*TI,2.2);
    if(window.BLAZE)BLAZE.land(p); const hit=(x,z)=>Math.hypot(x-p.x,z-p.z)<1.3*TI; if(SHARED.LVL==='up'&&hit(pos.x,pos.z)&&!SHARED.fireproof)VIT.hurt(.25); for(const N of NPCS)if(N.lv==='up'&&N.key!=='dragon'&&N.g.visible&&hit(N.st.x,N.st.z))N.hp=Math.max(0,N.hp-.25); };
  const G=9.8/.84*TI*.35;
  SHARED.FIRE={tick:dt=>{ let li=0;
    for(const f of FB){ if(!f.on)continue; f.t+=dt; f.v.y-=G*dt; f.g.position.addScaledVector(f.v,dt); const q=f.g.position; f.fl.x=q.x; f.fl.y=q.y; f.fl.z=q.z;
      if(Math.random()<dt*30)spark(q,new THREE.Vector3((Math.random()-.5)*.6*TI,.4*TI,(Math.random()-.5)*.6*TI),.4);
      if(li<2){ FL[li].position.copy(f.g.position); FL[li].intensity=6; li++; }
      const gg=gy(f.g.position.x,f.g.position.z); if(f.g.position.y<=gg+.2*TI||f.t>6){ f.on=f.fl.on=false; f.g.visible=false; burst(f.g.position.clone().setY(gg+.1)); } }
    for(;li<2;li++)FL[li].intensity=0;
  }};
  const GLC=new THREE.Color(), UP=new THREE.Vector3(0,1,0), qa=new THREE.Quaternion(), wq=new THREE.Quaternion(), ax=new THREE.Vector3();
  const bend=(b,axis,ang)=>{ if(!b||!ang)return; wq.copy(b.quaternion); for(let p=b.parent;p;p=p.parent)wq.premultiply(p.quaternion); ax.copy(axis).applyQuaternion(wq.invert()).normalize(); b.quaternion.multiply(qa.setFromAxisAngle(ax,ang)); };
  const make=(i,o={})=>{ const rig=rigOf(), mixer=new THREE.AnimationMixer(rig.bones[0]), act=n=>mixer.clipAction(CLIPS[n]);
    const idle=act('Idle'), sleep=act('Sleep'), fly=act('Fly_Flap'), hover=act('Hover'), lift=act('Take_Off'), ffire=act('Fly_Fire'), pfire=act('Fire_Breath'), FX={Fly_Fire:.75,Fire_Breath:1};
    idle.play(); sleep.play(); fly.play(); hover.play(); [ffire,pfire].forEach(a=>{ a.setLoop(THREE.LoopOnce); a.clampWhenFinished=true; }); fly.time=Math.random()*CLIPS.Fly_Flap.duration; lift.setLoop(THREE.LoopOnce); lift.clampWhenFinished=true;
    const D={mode:'fly',p:PER[i%PER.length],t:0,y:0,bank:0,pitch:0,v:.8*TI,to:sky(),fly:60+Math.random()*100,cruise:SHARED.BOD.Y(240+Math.random()*420),breath:40+Math.random()*200,pw:0,peek:false,pk:5,next:null,fx:null,asleep:false,zz:-6-Math.random()*14,style:'climb',bt:Math.random()*3,turn:0,climb:0,tw:0}; D.y=D.cruise;
    const BN_=n=>rig.bones.find(b=>b.name===n), TAIL=['Tail','Tail_001','Tail_002','Tail_003','Tail_004'].map(BN_), NECK=['Head','Head_001','Head_002'].map(BN_), FW=new THREE.Vector3(), RT=new THREE.Vector3();
    let wI=0, wF=1, wL=0, wH=0, wS=0; const s0=sky(), HT0=HOMES.length?HOMES[i%HOMES.length]:null, ha=i*2.4+1;
    if(HT0){ D.home=spot(HT0,ha,.42); D.p=D.home; }
    const nearTree=o=>{ const c=TREES.filter(q=>q!==o&&Math.hypot(q.x-o.x,q.z-o.z)<40*TI); return c.length?c[Math.floor(Math.random()*c.length)]:null; };
    const nextOf=()=>{ '@later'; const P=D.p, r=Math.random();
      if(!D.home||P!==D.home)return D.home&&Math.random()<.9?D.home:null;
      if(r<.4){ const o=nearTree(P.tree); if(o)return spot(o,Math.random()*6.28,.5); }
      if(r<.75){ const o=P.tree, a=Math.random()*6.28, d=o.r*(1.1+Math.random()*.6)+.5*TI, x=o.x+Math.sin(a)*d, z=o.z+Math.cos(a)*d; if(MODS.bodega.ground(x,z)>-.01)return {x,z,y:gy(x,z),h:a,ground:1}; }
      return null; };
    const breathe=(a,go)=>{ a.reset().play(); const c=a.getClip(); D.fx={a,t:0,at:FX[c.name],dur:c.duration,go:()=>{ D.shots=(D.shots||0)+1; go(); }}; };
    const spit=aim=>{ const [hp,v]=aim(), vy=v.y, h=Math.max(0,hp.y-gy(hp.x,hp.z)), t=(vy+Math.sqrt(vy*vy+2*G*h))/G, lx=hp.x+v.x*t, lz=hp.z+v.z*t;
      if(SHARED.LVL==='up'&&Math.hypot(lx-pos.x,lz-pos.z)<4*TI)return false; breathe(D.mode==='perch'?pfire:ffire,()=>fire(...aim())); return true; };
    const N=makeNPC(null,{key:'dragon',name:'A DRAGON',names:M.parts,lv:'up',group:'bodega',geo:greenGeo(),skin:rig,tall:M.tall,eye:-1,rank:[0],metres:o.m||.64,x:s0.x,z:s0.z,lane:{x0:s0.x,x1:s0.x,z0:s0.z,z1:s0.z},ground:()=>0,radius:.3,speed:0,stride:0,rock:0,bob:0,noSelf:true,
      anim:(dt)=>{ const k=Math.min(1,dt*3); wI=ease(wI,D.mode==='perch'?1:0,k); wF=ease(wF,D.mode==='fly'||D.mode==='come'?1:0,k); wL=ease(wL,D.mode==='lift'?1:0,Math.min(1,dt*8));
        wH=ease(wH,D.mode==='come'&&Math.hypot(D.p.x-st.x,D.p.z-st.z)<3*TI?1:0,Math.min(1,dt*2));
        wS=ease(wS,D.asleep?1:0,Math.min(1,dt*.6)); const fw=D.fx?Math.max(0,Math.min(1,D.fx.t/.2,(D.fx.dur-D.fx.t)/.3)):0, kf=1-fw;
        idle.setEffectiveWeight(wI*(1-wS)*kf); sleep.setEffectiveWeight(wI*wS*kf); fly.setEffectiveWeight(wF*(1-wH)*kf); hover.setEffectiveWeight(wF*wH*kf); lift.setEffectiveWeight(wL*kf);
        ffire.setEffectiveWeight(D.fx&&D.fx.a===ffire?fw:0); pfire.setEffectiveWeight(D.fx&&D.fx.a===pfire?fw:0);
        fly.timeScale=D.mode==='come'?.21:.26; hover.timeScale=.36; idle.timeScale=.6;
        mixer.update(dt);
        if(D.mode==='perch'&&D.p.tree){ const c=(1-D.pw)*(1-wS); RT.set(Math.cos(st.h),0,-Math.sin(st.h)); TAIL.forEach(b=>bend(b,UP,.34*c)); NECK.forEach(b=>bend(b,RT,.2*c)); }
        if(D.mode!=='perch'){ FW.set(Math.sin(st.h),0,Math.cos(st.h)); RT.set(Math.cos(st.h),0,-Math.sin(st.h)); D.tw+=dt;
          TAIL.forEach((b,k)=>{ bend(b,UP,-D.turn*.18*(k+1)/3+Math.sin(D.tw*1.1+k*.7)*.05); bend(b,RT,D.climb*.08); });
          NECK.forEach((b,k)=>bend(b,UP,D.turn*.12)); } } });
    N.push=()=>{}; N.blocks=()=>false; N.pack();
    const tick0=N.tick, st=N.st; st.hold=true; st.h=Math.random()*6; N.g.rotation.order='YXZ'; if(D.home){ D.mode='perch'; D.t=5+Math.random()*80; st.x=D.home.x; st.z=D.home.z; N.home={x:D.home.x,z:D.home.z,r:0,id:N.home&&N.home.id}; D.y=D.home.y; wI=1; wF=0; }
    N.tick=(dt,you)=>{ st.to=null; st.face=null; tick0(dt,you); let turn=0;
      if(D.fx){ D.fx.t+=dt; if(!D.fx.done&&D.fx.t>=D.fx.at){ D.fx.done=1; D.fx.go(); } if(D.fx.t>=D.fx.dur){ D.fx.a.stop(); D.fx=null; } }
      { const g=CLOCK.dark()?.35:0; N.toon.emissive.lerp(GLC.setRGB(.04*g,.2*g,.06*g),Math.min(1,dt*.5)); }
      const y0=D.y;
      D.breath-=dt;
      if(D.mode==='perch'){ const P=D.p; let x=P.x, z=P.z, y=P.y, h=P.h;
        if(P.sign){ const dx=pos.x-st.x, dz=pos.z-st.z, d=Math.hypot(dx,dz); D.cool-=dt;
          if(SHARED.LVL==='up'&&d<9*TI){ h=Math.atan2(dx,dz); if(D.cool<=0&&d>3*TI&&Math.abs(turnTo(st.h,h,9)[1])<.3){
            breathe(pfire,()=>{ '@later'; const hp=new THREE.Vector3(st.x,D.y+.12*TI,st.z).addScaledVector(new THREE.Vector3(Math.sin(st.h),0,Math.cos(st.h)),.25*TI), dx=pos.x-st.x, dz=pos.z-st.z, d=Math.max(.5*TI,Math.hypot(dx,dz)), tx=pos.x-dx/d*2*TI, tz=pos.z-dz/d*2*TI, fall=Math.max(.3*TI,hp.y-gy(tx,tz)), t=Math.sqrt(2*fall/G); fire(hp,new THREE.Vector3((tx-hp.x)/t,0,(tz-hp.z)/t)); }); D.cool=18+Math.random()*20; } } }
        if(P===D.home&&P.tree){ const near=SHARED.LVL==='up'&&Math.hypot(pos.x-st.x,pos.z-st.z)<5*TI;
          if(D.asleep){ if(near||D.t<4){ D.asleep=false; D.zz=-15-Math.random()*20; } }
          else if(!near&&D.t>12&&!D.fx&&D.pw<.1&&(D.zz+=dt)>0){ D.asleep=true; D.peek=false; } }
        else D.asleep=false;
        if(P.tree){ if(!D.asleep&&(D.pk-=dt)<=0){ D.peek=!D.peek; D.pk=D.peek?3+Math.random()*5:8+Math.random()*16; } D.pw=ease(D.pw,D.peek?1:0,Math.min(1,dt*1.2));
          const o=P.tree, a=P.h, k=.42+(.95-.42)*D.pw; x=o.x+Math.sin(a)*o.r*k; z=o.z+Math.cos(a)*o.r*k; y=P.y-(o.top-o.y)*.06*D.pw; h=a+(1-D.pw)*1.9+D.pw*Math.sin(D.t*.6)*.5;
          if(D.breath<=0&&D.pw>.85&&!D.asleep){ D.breath=spit(()=>{ const fw=new THREE.Vector3(Math.sin(st.h),0,Math.cos(st.h)); return [new THREE.Vector3(st.x,D.y+.15*TI,st.z).addScaledVector(fw,.4*TI),fw.multiplyScalar(2.4*TI).add(new THREE.Vector3(0,-.5*TI,0))]; })?150+Math.random()*210:12; } }
        else D.pw=0;
        st.x=ease(st.x,x,Math.min(1,dt*3)); st.z=ease(st.z,z,Math.min(1,dt*3)); st.h=turnTo(st.h,h,dt*1.5)[0]; D.y=ease(D.y,y,Math.min(1,dt*4)); D.v=0;
        if((D.t-=dt)<=0&&D.pw<.3&&wS<.2){ P.on=0; D.next=nextOf(); D.mode='lift'; lift.reset(); lift.play(); D.t=0; } }
      else if(D.mode==='lift'){ D.t+=dt; D.y+=dt*.6*TI; D.v=ease(D.v,.5*TI,dt); if(D.t>CLIPS.Take_Off.duration){ lift.stop(); if(D.next){ D.p=D.next; D.next=null; D.mode='come'; } else{ D.mode='fly'; D.to=sky(); D.fly=40+Math.random()*60; } } }
      else if(D.mode==='fly'){ D.fly-=dt; D.v=ease(D.v,(D.style==='sink'?.95:.8)*TI,dt*.5); const want=Math.atan2(D.to.x-st.x,D.to.z-st.z), r=turnTo(st.h,want,.28*dt); st.h=r[0]; turn=r[1]/Math.max(dt,1e-3);
        if((D.bt-=dt)<=0||D.style==='sink'&&D.y<D.cruise-1.6*TI){ D.style=D.style==='climb'?'sink':'climb'; D.bt=D.style==='sink'?4+Math.random()*7:2.5+Math.random()*3; }
        D.y+=(D.style==='climb'?.22:-.16)*TI*dt; D.y=ease(D.y,Math.max(D.cruise-1.8*TI,Math.min(D.cruise+1.8*TI,D.y)),dt); if(Math.hypot(D.to.x-st.x,D.to.z-st.z)<3*TI)D.to=sky();
        if(D.breath<=0){ D.breath=spit(()=>{ const fw=new THREE.Vector3(Math.sin(st.h),0,Math.cos(st.h)); return [new THREE.Vector3(st.x,D.y+.2*TI,st.z).addScaledVector(fw,.5*TI),fw.multiplyScalar(4.5*TI).add(new THREE.Vector3(0,-1.2*TI,0))]; })?150+Math.random()*210:10; }
        if(D.fly<=0){ const fr=PER.filter(p=>!p.on); D.p=D.home&&(Math.random()<.9||!fr.length)?D.home:fr[Math.floor(Math.random()*fr.length)]||PER[0]; D.mode='come'; D.style='climb'; } }
      else if(D.mode==='come'){ const dx=D.p.x-st.x, dz=D.p.z-st.z, d=Math.hypot(dx,dz);
        if(d>.2*TI){ const r=turnTo(st.h,Math.atan2(dx,dz),(d<3*TI?.7:.3)*dt); st.h=r[0]; turn=r[1]/Math.max(dt,1e-3); D.v=ease(D.v,d<3*TI?Math.max(.15*TI,d*.25):.8*TI,dt*1.2); D.y=ease(D.y,D.p.y+Math.min(d,5*TI)*.3,dt*.8); }
        else{ D.mode='perch'; D.p.on=1; D.pw=0; D.peek=false; D.zz=-6-Math.random()*14; D.pk=6+Math.random()*10; D.t=D.p===D.home?50+Math.random()*70:D.p.tree?20+Math.random()*25:D.p.ground?8+Math.random()*12:40+Math.random()*70; } }
      if(D.mode==='come'&&D.p.ground&&Math.hypot(D.p.x-st.x,D.p.z-st.z)<3*TI&&!D.p.ok){ D.p.ok=1; D.p.y=gy(D.p.x,D.p.z); }
      if(D.mode!=='perch'){ st.x+=Math.sin(st.h)*D.v*dt; st.z+=Math.cos(st.h)*D.v*dt; }
      D.turn=ease(D.turn,turn,Math.min(1,dt*2)); D.climb=ease(D.climb,(D.y-y0)/Math.max(dt,1e-3)/TI,Math.min(1,dt*2));
      D.bank=ease(D.bank,Math.max(-.5,Math.min(.5,-turn*1.4)),Math.min(1,dt*1.5));
      N.g.position.set(st.x,D.y,st.z); N.g.rotation.set(D.mode==='perch'?0:-Math.max(-.3,Math.min(.3,D.climb*.5)),st.h,D.mode==='perch'?0:D.bank); };
    N.mixer=mixer; N.D=D; N.restless=()=>true; return N; };
  const DR=[]; for(let i=0;i<10;i++)DR.push(make(i));
  // a small dragon perched on the park's sign: it turns to watch you go by and breathes real fire your way
  { const SG=PARK.sign; if(SG&&SG.top){ const N=make(10,{m:.7}), D=N.D, st=N.st; D.home=D.p={x:SG.x,z:SG.z,y:SG.top,h:Math.atan2(SG.out[0]-SG.x,SG.out[1]-SG.z),sign:1}; D.mode='perch'; D.t=1e9; D.cool=6;
    st.x=SG.x; st.z=SG.z; st.h=D.p.h; D.y=SG.top; N.home={x:SG.x,z:SG.z,r:0,id:N.home&&N.home.id}; DR.push(N); PARK.signDragon=N; } }
  window.DRAGONPERCH=(i,k)=>{ const N=DR[i], D=N.D; D.p=PER[k]; D.p.on=1; D.mode='perch'; D.t=999; N.st.x=D.p.x; N.st.z=D.p.z; D.y=D.p.y; return PER.length; };
  window.DRAGONHOME=i=>{ const N=DR[i], D=N.D; if(!D.home)return null; D.p=D.home; D.mode='perch'; D.t=999; N.st.x=D.p.x; N.st.z=D.p.z; D.y=D.p.y; return {x:D.p.x,z:D.p.z,y:D.p.y}; };
  window.DRAGONDBG=()=>DR.map(N=>({mode:N.D.mode,asleep:N.D.asleep,fx:N.D.fx&&N.D.fx.a.getClip().name,tree:!!N.D.p.tree,ground:!!N.D.p.ground,peek:+N.D.pw.toFixed(2),breath:Math.round(N.D.breath),x:+N.st.x.toFixed(1),y:+N.D.y.toFixed(1),z:+N.st.z.toFixed(1)}));
}; SYS.onStart(()=>DRAGON().then(DGO).catch(e=>console.warn('DRAGONS',e)),'078-npc-dragon'); }
