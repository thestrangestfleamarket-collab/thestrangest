// THE FEEL: FEEL tunes how the player moves: speed, grip, jumps, slopes, steps and the follow camera.
import {SHARED, THREE} from './003-shx.js';
import {BOAT, ED, FEEL, keys, NPCS, pos, RAG, st, UI, VIT, W3} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {QS, TILE, ZU} from './006-map-pre.js';
Object.assign(FEEL,{on:false,dbg:false,ready:false,lib:null,S:null,go:0,ev:{jump:0,land:0,imp:0},hs:0});
window.FEEL=FEEL;
{ const V=THREE.Vector3, MH=TILE/.84, MV=MH*ZU*24/TILE, H=1/60, D2R=Math.PI/180;
  FEEL.MH=MH; FEEL.MV=MV; FEEL.H=H;
  const DEF={walk:2,run:5,accel:25,brake:40,reverse:55,grip:40,airAccel:6,airBrake:2,turn:720,airTurn:.5,
    gravity:22,jumpH:1,fallMax:25,jumpCut:.45,coyote:.1,buffer:.12,variable:1,slope:45,step:.25,stepOn:1,snap:.3,radius:.34,height:0,
    fade:.15,animK:1,walkRef:1.2,jogRef:7,sprintRef:10.7,lean:1,leanMax:7,land:1,
    camDist:4,camPitch:.25,camH:1.6,camDamp:12,camFollow:14,camClear:.25,camBack:4};
  const RANGE={walk:[.5,6],run:[1,12],accel:[1,120],brake:[1,160],reverse:[1,200],grip:[1,160],airAccel:[0,40],airBrake:[0,40],turn:[90,2000],airTurn:[0,1],
    gravity:[4,60],jumpH:[.1,4],fallMax:[2,80],jumpCut:[0,1],coyote:[0,.4],buffer:[0,.4],variable:[0,1],slope:[5,80],step:[0,.6],stepOn:[0,1],snap:[0,.8],radius:[.15,.6],height:[0,3.5],
    fade:[.02,.6],animK:[.25,3],walkRef:[.3,4],jogRef:[1,12],sprintRef:[2,16],lean:[0,1],leanMax:[0,20],land:[0,1],
    camDist:[1.2,22],camPitch:[-.6,1.5],camH:[.3,3],camDamp:[1,40],camFollow:[1,60],camClear:[0,1],camBack:[.5,20]};
  const PRE={RESPONSIVE:{accel:40,brake:60,reverse:80,grip:60,airAccel:10,turn:1000,gravity:26,jumpH:1,fade:.12,camFollow:20},
    BALANCED:{},
    FLOATY:{accel:12,brake:14,reverse:20,grip:16,airAccel:4,airBrake:1,turn:420,gravity:14,jumpH:1.25,fallMax:18,fade:.22,camFollow:7}};
  FEEL.DEF=DEF; FEEL.RANGE=RANGE; FEEL.PRE=PRE; FEEL.cfg={...DEF};
  FEEL.check=o=>{ '@later'; if(!o||typeof o!=='object'||Array.isArray(o))return {err:['not a JSON object']}; const out={}, err=[];
    for(const [k,v] of Object.entries(o)){ if(!(k in DEF)){ err.push('unknown: '+k); continue; } if(typeof v!=='number'||!isFinite(v)){ err.push(k+': not a number'); continue; }
      const [a,b]=RANGE[k]; if(v<a||v>b){ err.push(k+': '+v+' outside '+a+'..'+b); continue; } out[k]=v; } return {cfg:out,err}; };
  FEEL.set=o=>{ const r=FEEL.check(o); Object.assign(FEEL.cfg,r.cfg); FEEL.cfgd=true; return r.err; };
  FEEL.preset=n=>{ FEEL.cfg={...DEF,...PRE[n]}; FEEL.cfgd=true; };
  FEEL.save=()=>{ try{ SAVE.set('feel-cfg',JSON.stringify(FEEL.cfg)); return true; }catch(e){ return false; } };
  try{ const s=JSON.parse(SAVE.get('feel-cfg')||'null'); if(s)FEEL.set(s); }catch(e){}
  try{ FEEL.on=SAVE.get('feel')==='1'; }catch(e){}
  if(QS.get('feel')!=null)FEEL.on=QS.get('feel')!=='0';
  FEEL.setOn=on=>{ FEEL.on=on; try{ SAVE.set('feel',on?'1':'0'); }catch(e){} if(on)FEEL.load(); };
  FEEL.load=()=>{ if(FEEL.lib)return; FEEL.lib=true;
    import('https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.8.3/build/index.module.js').then(m=>{ FEEL.lib=m; FEEL.ready=true; }).catch(e=>{ console.warn('FEEL: three-mesh-bvh did not load',e); FEEL.lib=null; }); };
  const S=FEEL.S={p:new V(),v:new V(),prev:new V(),face:0,facePrev:0,gnd:false,gN:new V(0,1,0),wN:new V(),wall:false,ceil:false,lastG:-1,buf:-1,held:false,jumped:false,cut:false,air:0,t:0,acc:0,sync:true,steps:0};
  const IN={x:0,z:0,run:false,press:0};
  FEEL.press=()=>{ IN.press++; };
  const K=()=>FEEL.cfg, hgt=FEEL.hgt=()=>K().height||1.85*(W3.SZ||1)-.04, cosS=()=>Math.cos(K().slope*D2R);
  const seg=new THREE.Line3(), box=new THREE.Box3(), tp=new V(), cp=new V(), dn=new V(), nh=new V(), fn=new V(), ray=new THREE.Ray(), tv=new V();
  let col=null;
  const GF=(x,z)=>SHARED.groundY(x*MH,z*MH)/MV, YC={bvh:null,gf:null}, SC={bvh:null,gf:GF};
  const colAt=()=>{ const Y=FEEL.yard; if(Y&&Y.bvh&&Y.in(S.p.x,S.p.z)){ YC.bvh=Y.bvh; return YC; }
    if(!FEEL.street||FEEL.street.src!==SHARED.solids||FEEL.street.n!==SHARED.solids.length)FEEL.street=FEEL.boxes(SHARED.solids);
    SC.bvh=FEEL.street.bvh; return SC; };
  FEEL.boxes=list=>{ '@later'; const P=[], q=(a,b,c,d)=>P.push(...a,...b,...c,...a,...c,...d);
    for(const [x0,z0,x1,z1] of list){ const a=x0/MH, b=x1/MH, c=z0/MH, d=z1/MH, lo=-60, hi=60;
      q([a,lo,c],[b,lo,c],[b,hi,c],[a,hi,c]); q([b,lo,d],[a,lo,d],[a,hi,d],[b,hi,d]); q([a,lo,d],[a,lo,c],[a,hi,c],[a,hi,d]); q([b,lo,c],[b,lo,d],[b,hi,d],[b,hi,c]); }
    if(!P.length)P.push(1e5,0,1e5,1e5+1,0,1e5,1e5,0,1e5+1);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); return {src:list,n:list.length,geo:g,bvh:new FEEL.lib.MeshBVH(g)}; };
  const segAt=p=>{ const r=K().radius; seg.start.set(p.x,p.y+r,p.z); seg.end.set(p.x,p.y+Math.max(r,hgt()-r),p.z); };
  const resolve=p=>{ '@later'; const r=K().radius, cs=cosS(); let pushed=false;
    for(let it=0;it<4;it++){ let moved=false; segAt(p); box.makeEmpty(); box.expandByPoint(seg.start); box.expandByPoint(seg.end); box.min.addScalar(-r); box.max.addScalar(r);
      col.bvh.shapecast({intersectsBounds:b=>b.intersectsBox(box),intersectsTriangle:t=>{ const d=t.closestPointToSegment(seg,tp,cp); if(d>=r+.015)return false;
        if(d>1e-6)dn.subVectors(cp,tp).divideScalar(d); else t.getNormal(dn); const dep=r-d; t.getNormal(fn); if(fn.dot(dn)<0)fn.negate(); const wk=dn.y>=cs||(fn.y>=cs&&fn.dot(dn)>.85);
        if(dep<=1e-4){ if(wk){ S.gnd=true; S.gN.copy(dn.y>=cs?dn:fn); } else if(dn.y>-.3&&!(K().stepOn&&S.canStep&&Math.max(t.a.y,t.b.y,t.c.y)-p.y<=K().step+1e-3)){ nh.set(dn.x,0,dn.z); const L=nh.length(); if(L>1e-4){ S.wall=true; S.wN.copy(nh.divideScalar(L)); } } return false; }
        if(wk){ const up=Math.min(dep/Math.max(dn.y,.5),dep*3); p.y+=up; seg.start.y+=up; seg.end.y+=up; S.gnd=true; S.gN.copy(dn.y>=cs?dn:fn); }
        else if(dn.y>-.3){ const top=Math.max(t.a.y,t.b.y,t.c.y), c=K();
          if(c.stepOn&&S.canStep&&top>p.y+.002&&top-p.y<=c.step+1e-3){ const hx=Math.hypot(tp.x-p.x,tp.z-p.z); if(hx<r){ const up=tp.y+Math.sqrt(r*r-hx*hx)-(p.y+r); if(up>0){ p.y+=up; seg.start.y+=up; seg.end.y+=up; S.gnd=true; S.gN.set(0,1,0); S.stepped=true; moved=pushed=true; return false; } } }
          nh.set(dn.x,0,dn.z); const L=nh.length(); if(L<1e-4)return false; nh.divideScalar(L); const k=Math.min(dep/L,dep*4); p.addScaledVector(nh,k); seg.start.addScaledVector(nh,k); seg.end.addScaledVector(nh,k); S.wall=true; S.wN.copy(nh); if(S.v.x*nh.x+S.v.z*nh.z<0){ const vd=S.v.x*nh.x+S.v.z*nh.z; S.v.x-=nh.x*vd; S.v.z-=nh.z*vd; } }
        else { p.addScaledVector(dn,dep); seg.start.addScaledVector(dn,dep); seg.end.addScaledVector(dn,dep); S.ceil=true; if(S.v.y>0)S.v.y=0; }
        moved=pushed=true; return false; }});
      if(!moved)break; } return pushed; };
  const down=(p,max)=>{ const r=K().radius; ray.origin.set(p.x,p.y+r,p.z); ray.direction.set(0,-1,0); const h=col.bvh.raycastFirst(ray,THREE.DoubleSide); if(!h||h.distance>r+max)return null;
    const f=h.face; tv.copy(f.normal); if(tv.y<0)tv.negate(); return {d:h.distance-r,n:tv,y:h.point.y}; };
  const groundFn=(p,wasG)=>{ if(!col.gf)return; const gy=col.gf(p.x,p.z); if(p.y<=gy+1e-4||(wasG&&S.v.y<=0&&!S.jumpT&&p.y-gy<=K().snap)){ p.y=gy; S.gnd=true; S.gN.set(0,1,0); if(S.v.y<0)S.v.y=0; } };
  const sim=dt=>{ '@later'; const c=K(), p=S.p, v=S.v; S.t+=dt; const wasG=S.gnd, vy0=v.y;
    let ix=IN.x, iz=IN.z, il=Math.hypot(ix,iz); if(il>1){ ix/=il; iz/=il; il=1; } const fx=ix, fz=iz, fl=il;
    if(S.wallP&&il>0){ const d=ix*S.wN.x+iz*S.wN.z; if(d<0){ ix-=S.wN.x*d; iz-=S.wN.z*d; il=Math.hypot(ix,iz); } }
    const sp=IN.run?c.run:c.walk, tx=ix*sp, tz=iz*sp, G=wasG;
    if(il<1e-3){ const L=Math.hypot(v.x,v.z), m=(G?c.brake:c.airBrake)*dt, k=L<=m?0:(L-m)/L; v.x*=k; v.z*=k; }
    else{ const dx=ix/il, dz=iz/il, along=v.x*dx+v.z*dz, px=v.x-dx*along, pz=v.z-dz*along, tgt=sp*il;
      const ra=G?(along<0?c.reverse:along>tgt?c.brake:c.accel):c.airAccel, nA=along+Math.max(-ra*dt,Math.min(ra*dt,tgt-along));
      const rg=G?c.grip:c.airAccel, pl=Math.hypot(px,pz), np=Math.max(0,pl-rg*dt), k=pl>1e-6?np/pl:0;
      v.x=dx*nA+px*k; v.z=dz*nA+pz*k; }
    if(wasG){ S.lastG=S.t; S.jumped=false; }
    while(IN.press>0){ IN.press--; S.buf=S.t; }
    const canJ=!S.jumped&&S.t-S.lastG<=c.coyote+1e-9;
    if(S.buf>=0&&S.t-S.buf<=c.buffer+1e-9&&canJ){ v.y=Math.sqrt(2*c.gravity*c.jumpH); S.jumped=true; S.cut=false; S.buf=-1; S.gnd=false; S.jumpT=.12; S.jt=S.t; FEEL.ev.jump++; }
    if(S.jumpT)S.jumpT=Math.max(0,S.jumpT-dt);
    if(S.jumped&&!S.cut&&c.variable&&!S.held&&v.y>0&&S.t-S.jt>=.05){ v.y*=c.jumpCut; S.cut=true; }
    const vyA=v.y; if(!S.gnd||v.y>0){ v.y-=c.gravity*dt; if(v.y<-c.fallMax)v.y=-c.fallMax; } else v.y=0;
    S.canStep=wasG&&v.y<=.5; S.stepped=false;
    const ox=p.x, oz=p.z, ddx=v.x*dt, ddy=(vyA+v.y)/2*dt, ddz=v.z*dt, L=Math.hypot(ddx,ddy,ddz), n=Math.max(1,Math.ceil(L/(c.radius*.5)));
    S.gnd=false; S.wall=false; S.ceil=false;
    for(let i=0;i<n;i++){ p.x+=ddx/n; p.y+=ddy/n; p.z+=ddz/n; S.wall=false; resolve(p); }
    if(S.stepped)S.steps++; S.wallP=S.wall;
    if(!S.gnd&&wasG&&v.y<=0&&!S.jumpT&&!col.gf){ const g=down(p,c.snap); if(g&&g.n.y>=cosS()){ p.y-=g.d; resolve(p); } }
    groundFn(p,wasG);
    if(S.gnd&&v.y<0)v.y=0;
    if(!S.gnd)S.air+=dt; else { if(!wasG&&S.air>.06){ FEEL.ev.land++; FEEL.ev.imp=Math.max(0,-vy0); } S.air=0; }
    if(col.gf){ const B=SHARED.BOUND; if(B&&B.x1>B.x0){ p.x=Math.max(B.x0/MH,Math.min(B.x1/MH,p.x)); p.z=Math.max(B.z0/MH,Math.min(B.z1/MH,p.z)); }
      { const q={x:p.x*MH,z:p.z*MH}; for(const N of NPCS)if(N.lv===SHARED.LVL&&!N.far)N.push(q); p.x=q.x/MH; p.z=q.z/MH; } }
    if(p.y<-40){ FEEL.respawn(); return; }
    FEEL.hsRaw=Math.hypot(p.x-ox,p.z-oz)/dt;
    if(fl>.05){ let d=Math.atan2(fx,fz)-S.face; d=Math.atan2(Math.sin(d),Math.cos(d)); const m=c.turn*D2R*dt*(S.gnd?1:c.airTurn); S.face+=Math.max(-m,Math.min(m,d)); S.face=Math.atan2(Math.sin(S.face),Math.cos(S.face)); } };
  const W={x:0,y:0,z:0,h:0};
  FEEL.sync=()=>{ S.p.set(pos.x/MH,SHARED.py/MV,pos.z/MH); S.prev.copy(S.p); S.v.set(0,0,0); S.face=S.facePrev=SHARED.heading; S.acc=0; S.air=0; S.gnd=true; S.lastG=S.t; S.jumped=false; S.buf=-1; S.sync=false; };
  FEEL.take=()=>(FEEL.on||!!(FEEL.yard&&FEEL.yard.in(pos.x/MH,pos.z/MH)))&&!RAG.on&&!(BOAT&&BOAT.on)&&!(st.water&&st.water.in)&&!UI.fly&&!UI.freeCam&&!st.sit&&!st.climb&&!ED.on;
  FEEL.input=(mx,mz,run,held)=>{ IN.x=mx; IN.z=mz; IN.run=run; S.held=held; };
  FEEL.step=(dt,mx,mz)=>{ '@later'; if(!FEEL.lib)FEEL.load(); FEEL.go=0; if(!FEEL.ready||FEEL.hold)return;
    if(FEEL.yard&&!FEEL.yard.bvh)FEEL.yard.build();
    if(S.sync||Math.abs(pos.x-W.x)>1e-6||Math.abs(pos.z-W.z)>1e-6||Math.abs(SHARED.py-W.y)>1e-6)FEEL.sync();
    if(Math.abs(SHARED.heading-W.h)>1e-6){ S.face=S.facePrev=SHARED.heading; }
    FEEL.input(mx,mz,(keys.has('shift')||st.runTarget>0)&&!VIT.tired,keys.has(' '));
    S.acc=Math.min(S.acc+dt,H*6); const x0=S.p.x, z0=S.p.z;
    while(S.acc>=H){ S.acc-=H; S.prev.copy(S.p); S.facePrev=S.face; col=colAt(); sim(H); }
    const a=S.acc/H; let df=S.face-S.facePrev; df=Math.atan2(Math.sin(df),Math.cos(df));
    pos.x=(S.prev.x+(S.p.x-S.prev.x)*a)*MH; pos.z=(S.prev.z+(S.p.z-S.prev.z)*a)*MH; SHARED.py=(S.prev.y+(S.p.y-S.prev.y)*a)*MV; SHARED.heading=S.facePrev+df*a;
    W.x=pos.x; W.y=SHARED.py; W.z=pos.z; W.h=SHARED.heading; FEEL.go=Math.hypot(S.p.x-x0,S.p.z-z0)*MH;
    const hs=FEEL.hsRaw||0; FEEL.hs+=(hs-FEEL.hs)*(1-Math.exp(-dt*14)); };
  FEEL.spawn=null;
  FEEL.respawn=()=>{ const s=FEEL.spawn||(FEEL.yard&&FEEL.yard.spawn); if(s){ pos.x=s.x*MH; pos.z=s.z*MH; SHARED.py=s.y*MV; SHARED.heading=s.h||0; } S.sync=true; SHARED.target=null; };
  FEEL.sim=(n,input,dt=H)=>{ col=colAt(); const out=[]; for(let i=0;i<n;i++){ if(input)input(i,IN,S); S.prev.copy(S.p); S.facePrev=S.face; sim(dt); out.push({x:S.p.x,y:S.p.y,z:S.p.z,vx:S.v.x,vy:S.v.y,vz:S.v.z,g:S.gnd,w:S.wall,c:S.ceil,f:S.face}); } return out; };
  FEEL.IN=IN;
  const cr=new V(), cu=new V(), cd=new V(), co=new V(), tm=new V(), OFS=[[0,0],[1,0],[-1,0],[0,1],[0,-1]], CR=FEEL.camRays=OFS.map(()=>[new V(),new V()]); let camD=null;
  FEEL.eye=new V(); let eyeOk=false, ct=0, cdt=0;
  FEEL.camT=T=>{ const n=performance.now(); cdt=ct?Math.min(.1,(n-ct)/1000):0; ct=n; if(!eyeOk||T.distanceTo(FEEL.eye)>8*MH){ FEEL.eye.copy(T); eyeOk=true; } else FEEL.eye.lerp(T,1-Math.exp(-cdt*K().camFollow)); return FEEL.eye; };
  FEEL.applyCam=()=>{ if(typeof UI==='undefined'||!UI.persp||UI.view==='first')return; UI.dist=K().camDist*MH; SHARED.pitchTo=UI.clampV(K().camPitch); };
  FEEL.cam=(T,C)=>{ '@later'; const dt=cdt, Y=FEEL.yard; if(!FEEL.ready||!Y||!Y.bvh||!Y.in(T.x/MH,T.z/MH)){ camD=null; FEEL.camHit=null; const g=SHARED.groundY(C.x,C.z)+.6*MV; if(C.y<g)C.y=g; return; }
    tm.set(T.x/MH,T.y/MV,T.z/MH); cd.set(C.x/MH,C.y/MV,C.z/MH).sub(tm); const len=cd.length(); if(len<1e-4)return; cd.divideScalar(len);
    cr.crossVectors(cd,tv.set(0,1,0)); if(cr.lengthSq()<1e-6)cr.set(1,0,0); cr.normalize(); cu.crossVectors(cr,cd).normalize();
    const cl=K().camClear; let hit=len;
    for(let i=0;i<5;i++){ const [a,b]=OFS[i], R=CR[i]; co.copy(tm).addScaledVector(cr,a*cl*.7).addScaledVector(cu,b*cl*.7); ray.origin.copy(co); ray.direction.copy(cd);
      const h=Y.bvh.raycastFirst(ray,THREE.DoubleSide); const d=h&&h.distance<len+cl?h.distance:len+cl; hit=Math.min(hit,d-cl); R[0].copy(co); R[1].copy(co).addScaledVector(cd,Math.min(d,len)); }
    const want=Math.max(.3,Math.min(len,hit)); if(camD===null||want<camD)camD=want; else camD+=(want-camD)*(1-Math.exp(-dt*K().camBack));
    FEEL.camHit=hit<len; C.set((tm.x+cd.x*camD)*MH,(tm.y+cd.y*camD)*MV,(tm.z+cd.z*camD)*MH); };
}
