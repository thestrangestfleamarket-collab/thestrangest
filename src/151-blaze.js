// THE BLAZE: BLAZE starts fires that spread through grass and brush and go out in the wet.
import {SHARED, THREE} from './003-shx.js';
import {BLAZE, DRESS, DRONE, GPH, PARK, pos, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MAPG, MODS, QS, RING, SOL, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {GCAVE} from './060-cave.js';
import {FOUNT} from './060a-fount.js';

{ const T=TILE, M=1/.84*T, G=(x,z)=>MODS.bodega.ground(x,z), F=BLAZE.F, rnd=Math.random, MAX=+(QS.get('fires')||12), WET=3.2, HOLD=240, FADE=360, V3=THREE.Vector3;
  const its=L=>L.filter(Boolean).flatMap(m=>m.userData.items||[]).filter(o=>!/rock|stone|pillar/i.test(o.k)), ITEMS=its([PARK.trees,PARK.under,PARK.underStill,DRESS.trees,DRESS.plants]); PARK.later(()=>ITEMS.push(...its([PARK.trees,PARK.ring,PARK.under,PARK.underStill])));
  const top=(x,z)=>WEEDS.top?WEEDS.top(x,z):undefined, surf=(x,z)=>{ const t=top(x,z); return typeof t==='number'?t:G(x,z); };
  const lawn=(x,z)=>{ if(!PARK.in||!WEEDS.inPark||!WEEDS.inPark(x,z,1))return false; const a=x/T+SHARED.BOD.OX-PARK.ox, b=z/T+SHARED.BOD.OY-PARK.oy; return !PARK.path(a,b)&&!(PARK.brook&&PARK.brook.wet(a,b,.6))&&!(FOUNT.lake&&FOUNT.lake(a,b)<1.5); };
  const brush=(x,z)=>ITEMS.some(o=>Math.hypot(o.x-x,o.z-z)<Math.max(.5*T,o.r*.6));
  const burnable=BLAZE.burnable=(x,z)=>{ if(G(x,z)<-.01||[PARK.fire,GCAVE&&GCAVE.fire].some(c=>c&&Math.hypot(c.x-x,c.z-z)<2*T))return false; const t=top(x,z); return typeof t==='number'||t===undefined&&lawn(x,z)||brush(x,z); };
  const cc=new THREE.Color(), geo=(fn)=>{ const P=[], N=[], C=[]; fn((w,h,d,c,x,y,z,ry=0)=>{ const g=new THREE.BoxGeometry(w,h,d).rotateY(ry).translate(x,y,z).toNonIndexed(); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); cc.setHex(c); for(let i=0;i<g.attributes.position.count;i++)C.push(cc.r,cc.g,cc.b); });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); return g; };
  const VC=new THREE.MeshLambertMaterial({vertexColors:true}), BAS=new THREE.MeshBasicMaterial({color:0xffffff}), m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), e3=new THREE.Euler(0,0,0,'YXZ'), s3=new V3(), p3=new V3(), Z0=new THREE.Matrix4().makeScale(0,0,0);
  const BM=[];
  const mk=(()=>{ const n=16, P=[], C=[], N=[], h=k=>{ const v=Math.sin(k*12.9898+3.1)*43758.5453; return v-Math.floor(v); }, A=k=>(k%n)/n*Math.PI*2, pt=(r,k)=>[Math.cos(A(k))*r,0,Math.sin(A(k))*r];
    const R=[[],[],[]]; for(let k=0;k<n;k++){ const o=.5*(.66+.34*h(k)); R[2].push(o); R[1].push(o*(.62+.18*h(k+40))); R[0].push(o*(.3+.16*h(k+80))); }
    const tri=(a,b,c,col)=>{ if((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])<0)[b,c]=[c,b]; P.push(...a,...b,...c); cc.setHex(col); for(let i=0;i<3;i++){ C.push(cc.r,cc.g,cc.b); N.push(0,1,0); } };
    const COL=[0x14110f,0x2a221b,0x4a3b29];
    for(let k=0;k<n;k++){ tri([0,0,0],pt(R[0][k],k),pt(R[0][(k+1)%n],k+1),COL[0]); for(let r=1;r<3;r++){ const a=pt(R[r-1][k],k), b=pt(R[r-1][(k+1)%n],k+1), c=pt(R[r][(k+1)%n],k+1), d=pt(R[r][k],k); tri(a,b,c,COL[r]); tri(a,c,d,COL[r]); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const NM=64, aA=new THREE.InstancedBufferAttribute(new Float32Array(NM),1); aA.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aA',aA);
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
    mat.onBeforeCompile=sh=>{ sh.vertexShader='attribute float aA; varying float vA;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vA=aA;');
      sh.fragmentShader='varying float vA;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n { ivec2 bq=ivec2(mod(gl_FragCoord.xy,4.)); float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); if(vA<=(bt[bq.x+bq.y*4]+.5)/16.)discard; }'); };
    mat.customProgramCacheKey=()=>'burnmark';
    const me=new THREE.InstancedMesh(g,mat,NM); me.count=0; me.receiveShadow=true; me.frustumCulled=false; me.name='burn marks'; me.raycast=()=>{}; MAPG.bodega.add(me);
    for(let i=0;i<NM;i++){ me.setMatrixAt(i,Z0); BM.push(null); } return {me,aA,NM}; })();
  const mark=(x,z,y)=>{ '@later'; let i=BM.indexOf(null); if(i<0){ let o=1e9; BM.forEach((m,j)=>{ if(m.t>=0&&m.a<o){ o=m.a; i=j; } }); if(i<0)i=0; }
    const m={i,x,z,y,a:.05,a0:0,t:-1,fix:top(x,z)===undefined}; BM[i]=m; mk.me.setMatrixAt(i,m4.compose(p3.set(x,y+.03*T,z),q4.setFromAxisAngle(s3.set(0,1,0),rnd()*6.28),s3.set(1,1,1).multiplyScalar((1.05+rnd()*.5)*T)));
    mk.me.instanceMatrix.needsUpdate=true; mk.me.count=Math.max(mk.me.count,i+1); return m; };
  const remark=m=>{ mk.me.getMatrixAt(m.i,m4); m4.elements[13]=m.y+.03*T; mk.me.setMatrixAt(m.i,m4); mk.me.instanceMatrix.needsUpdate=true; };
  const SRC=[], src=()=>{ let s=SRC.find(s=>s.free); if(s){ s.free=false; s.on=true; return s; } s=FLAME.add({kind:'bed',name:'grass fire',x:0,y:0,z:0,w:.5*T,h:.6*T,embers:2,smoke:1}); SRC.push(s); return s; };
  const L=new THREE.PointLight(new THREE.Color(1,.55,.2),0,7*T,1.6); L.userData.fire=1; scene.add(L);
  const start=BLAZE.start=(x,z,force)=>{ '@later'; if(F.length>=MAX||F.some(f=>Math.hypot(f.x-x,f.z-z)<.7*T)||!force&&!burnable(x,z))return null;
    const y=surf(x,z), s=src(); s.x=x; s.y=y; s.z=z; s.a.position.set(x,y,z); s.w=s.h=0; s.sd=rnd()*50; s.steam=5;
    const f={x,z,y,s,age:0,life:70+rnd()*60,sp:20+rnd()*20,wet:0,by:null,m:mark(x,z,y),sz:.85+rnd()*.35,fix:top(x,z)===undefined,out:false}; F.push(f); return f; };
  BLAZE.land=p=>{ if(burnable(p.x,p.z)&&rnd()<.6)start(p.x,p.z); };
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'_'), burns=BLAZE.burns=id=>!!(ITEMS&&ITEMS.prop&&ITEMS.prop(norm(id),'burnable'));
  const end=f=>{ f.out=true; f.s.on=false; f.s.free=true; f.m.t=0; f.m.a0=Math.max(.6,f.m.a); for(let k=0;k<4;k++)FLAME.puff(f.x+(rnd()-.5)*.4*T,f.y+.2*T,f.z+(rnd()-.5)*.4*T,1.3,f.wet>=WET?6:5); };
  BLAZE.douse=(x,z,r)=>{ let n=0; for(const f of F)if(Math.hypot(f.x-x,f.z-z)<r&&f.wet<WET){ f.wet=WET; n++; } return n; };
  let fixT=0;
  const fireTick=dt=>{ fixT-=dt; const fx=fixT<=0; if(fx)fixT=2;
    for(let i=F.length-1;i>=0;i--){ const f=F[i]; f.age+=dt;
      if(fx&&f.fix&&top(f.x,f.z)!==undefined){ f.fix=false; f.y=surf(f.x,f.z); f.s.y=f.y; f.s.a.position.y=f.y; f.m.y=f.y; f.m.fix=false; remark(f.m); }
      const k=f.sz*Math.min(1,f.age/6)*Math.max(0,Math.min(1,(f.life-f.age)/15))*Math.max(0,1-f.wet/WET); f.s.w=.62*T*k; f.s.h=.78*T*k; f.s.embers=2.4*k; f.s.smoke=f.wet>0?2.6:1.1; f.s.steam=f.wet>0?6:5;
      f.m.a=Math.max(f.m.a,.1+.9*Math.min(1,f.age/30));
      if((f.sp-=dt)<=0&&f.wet<=0){ f.sp=20+rnd()*20; if(rnd()<.75){ const a=rnd()*6.28, d=(.8+rnd()*.45)*T; start(f.x+Math.cos(a)*d,f.z+Math.sin(a)*d); } }
      if(f.age>=f.life||f.wet>=WET){ end(f); F.splice(i,1); } }
    if(fx&&F.length&&GPH&&GPH.loose){ try{ for(const it of GPH.loose()){ if(!it||it._burnt)continue; const p=it.t||(it.c&&{x:it.c[0],z:it.c[2]}); if(!p||!burns(it.name))continue; if(F.some(f=>!f.out&&Math.hypot(f.x-p.x,f.z-p.z)<1.2*T)){ it._burnt=1; start(p.x,p.z,true); if(GPH.burn)GPH.burn(it); } } }catch(e){} }
    let ch=false; for(const m of BM){ if(!m)continue; if(fx&&m.fix&&top(m.x,m.z)!==undefined){ m.fix=false; m.y=surf(m.x,m.z); remark(m); }
      const a=m.t<0?m.a:(m.t+=dt)<HOLD?m.a0:m.a0*(1-(m.t-HOLD)/FADE); if(a<=0){ BM[m.i]=null; mk.me.setMatrixAt(m.i,Z0); mk.me.instanceMatrix.needsUpdate=true; mk.aA.array[m.i]=0; ch=true; continue; }
      if(Math.abs(mk.aA.array[m.i]-a)>.004){ mk.aA.array[m.i]=a; ch=true; } }
    if(ch)mk.aA.needsUpdate=true; let n=0; BM.forEach((m,i)=>{ if(m)n=i+1; }); mk.me.count=n; mk.me.visible=n>0;
    let b=null, bd=(30*T)**2; for(const f of F){ const d=(f.x-pos.x)**2+(f.z-pos.z)**2; if(d<bd){ bd=d; b=f; } }
    if(b){ L.position.set(b.x,b.y+.5*T,b.z); L.intensity=16*Math.min(1,b.s.w/(.62*T))*FLAME.flick(b.s.sd); } else L.intensity=0; };
  const KR=SHARED.BOD.road.KR, CN0=SHARED.BOD.road.CORN.filter(c=>c.cv&&c.x===RING.wr1), CN=CN0.length?CN0:[{cx:RING.wr1+KR,cy:SHARED.BOD.FAR+KR}], PH=2.8*M, ST=CN.map(c=>{ const x=SHARED.BOD.XS(c.cx), z=SHARED.BOD.ZS(c.cy); return {x,z,y:G(x,z)}; });
  for(const s of ST){ SOL.up.push([s.x-.12*M,s.z-.12*M,s.x+.12*M,s.z+.12*M]); FIX.up.push([s.x-.12*M,s.z-.12*M,s.y,s.x+.12*M,s.z+.12*M,s.y+PH]); }
  { const g=geo(add=>{ for(const s of ST){ const a=(w,h,d,c,x,y,z)=>add(w*M,h*M,d*M,c,s.x+x*M,s.y+y*M,s.z+z*M);
      a(.55,.12,.55,0x8a8a84,0,.06,0); a(.13,2.7,.13,0xa8261e,0,1.4,0); a(.22,.06,.22,0x2a2c30,0,2.72,0); a(1.05,.07,1.05,0x2c2e32,0,2.8,0);
      for(const [w,d,x,z] of [[1.09,.06,0,.52],[1.09,.06,0,-.52],[.06,1.09,.52,0],[.06,1.09,-.52,0]])a(w,.06,d,0xc8302a,x,2.86,z);
      a(.62,.012,.12,0xe8e6de,0,2.84,0); a(.12,.012,.62,0xe8e6de,0,2.84,0); a(.34,.42,.22,0xc8302a,0,1.2,.16); a(.26,.06,.01,0xe8e6de,0,1.3,.275); } });
    const me=new THREE.Mesh(g,VC); me.castShadow=me.receiveShadow=true; me.name='fire drone docks'; MAPG.bodega.add(me); }
  const DR0=.18, DG=DRONE.ballGeo({R:DR0,body:0xc22a20,band:0xece8e0,more:[[.04,.04,.16,0x2a2c30,0,-.12,.2]]});
  const ND=ST.length, DB=new THREE.InstancedMesh(DG,VC,Math.max(1,ND)), LP=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.035,.05),BAS,Math.max(1,ND*2));
  const NDROP=140, DROP=new THREE.InstancedMesh(new THREE.BoxGeometry(.045*M,.09*M,.045*M),BAS,NDROP), DR=BLAZE.D, DROPS=[], GV=9.8*M;
  for(const [me,n] of [[DB,ND],[LP,ND*2],[DROP,0]]){ me.frustumCulled=false; me.raycast=()=>{}; me.count=n; MAPG.bodega.add(me); }
  DB.castShadow=true; DB.name='fire drones'; DROP.name='drone spray'; DROP.visible=false;
  for(let i=0;i<NDROP;i++)DROP.setColorAt(i,cc.setHex(i%3?0xe6f2ff:0x86c4ff));
  ST.forEach((s,i)=>{ const h=new V3(s.x,s.y+(2.835+DR0)*M,s.z); DR.push({i,home:h,p:h.clone(),v:new V3(),a:new V3(),yaw:i*1.57,st:'home',legs:[],f:null,sp:0,sa:0,dirty:true});
    LP.setMatrixAt(ND+i,m4.compose(p3.set(s.x+.42*M,s.y+2.91*M,s.z+.42*M),q4.identity(),s3.set(M,M,M))); });
  const CRUISE=Math.min(20*M,Math.max(9*M,...ITEMS.filter(o=>o.top-o.y>2*T).map(o=>o.top-o.y+1.2*M)));
  const hover=(d,f)=>{ const dx=d.p.x-f.x, dz=d.p.z-f.z, l=Math.hypot(dx,dz)||1; return new V3(f.x+dx/l*2.2*M,f.y+2.6*M,f.z+dz/l*2.2*M); };
  const send=(d,f)=>{ d.f=f; f.by=d; const h=hover(d,f), c=Math.max(G(f.x,f.z),G(d.p.x,d.p.z))+CRUISE; d.legs=d.st==='spray'?[h]:[new V3(d.p.x,Math.max(d.p.y,c),d.p.z),new V3(h.x,c,h.z),h]; d.st='go'; };
  const home=d=>{ d.f=null; const c=Math.max(d.p.y,d.home.y+CRUISE*.7); d.legs=[new V3(d.p.x,c,d.p.z),new V3(d.home.x,c,d.home.z),d.home.clone()]; d.st='back'; };
  const fly=(d,dt)=>{ '@later'; const g=d.legs[0]; if(!g)return true; const dv=p3.subVectors(g,d.p), dist=dv.length(), last=d.legs.length===1, vm=Math.min(7*M,dist*(last?1.1:2.5));
    if(dist>1e-4)dv.multiplyScalar(vm/dist); dv.y=Math.max(-2.5*M,Math.min(3*M,dv.y)); const ac=s3.subVectors(dv,d.v).multiplyScalar(2.2), al=ac.length(), AM=5*M; if(al>AM)ac.multiplyScalar(AM/al);
    d.v.addScaledVector(ac,dt); d.p.addScaledVector(d.v,dt); d.a.lerp(ac,Math.min(1,dt*4));
    if(dist<(last?.06*M:1.2*M)&&(!last||d.v.length()<.5*M)){ d.legs.shift(); if(last){ d.p.copy(g); d.v.set(0,0,0); return true; } } return false; };
  const BM4=new THREE.Matrix4(), HM=new THREE.Matrix4(), RM=new THREE.Matrix4();
  let dsp=0, tt=0;
  const droneTick=dt=>{ tt+=dt;
    if((dsp-=dt)<=0){ dsp=.5; for(const f of F){ if(f.by||f.out)continue; let b=null, bd=1e18; for(const d of DR){ if(d.st!=='home'&&d.st!=='back')continue; const q=(d.p.x-f.x)**2+(d.p.z-f.z)**2; if(q<bd){ bd=q; b=d; } } if(b)send(b,f); } }
    for(const d of DR){ if(d.st==='home'&&!d.dirty)continue;
      if(d.st!=='home'){ if(d.f&&d.f.out){ const f=d.f; d.f=null; let n=null, nd=(12*T)**2; for(const g of F){ if(g.by||g.out)continue; const q=(g.x-f.x)**2+(g.z-f.z)**2; if(q<nd){ nd=q; n=g; } } if(n){ d.st='spray'; send(d,n); } else home(d); }
        const arrived=fly(d,dt);
        if(d.st==='go'&&arrived)d.st='spray';
        if(d.st==='spray'&&d.f){ const f=d.f; f.wet+=dt; d.sa+=dt*48; const nz=p3.set(0,-.12*M,.22*M).applyEuler(e3.set(0,d.yaw,0)).add(d.p);
          while(d.sa>=1){ d.sa-=1; if(DROPS.length>=NDROP)continue; const tf=.45+rnd()*.15, tx=f.x+(rnd()-.5)*.5*T, tz=f.z+(rnd()-.5)*.5*T, ty=f.y+.05*T; DROPS.push({x:nz.x,y:nz.y,z:nz.z,vx:(tx-nz.x)/tf,vy:(ty-nz.y)/tf+.5*GV*tf,vz:(tz-nz.z)/tf,gy:ty,t:0}); }
          if(rnd()<dt*3)FLAME.puff(f.x+(rnd()-.5)*.4*T,f.y+.15*T,f.z+(rnd()-.5)*.4*T,1.1,6); }
        if(d.st==='back'&&arrived){ d.st='home'; d.p.copy(d.home); d.v.set(0,0,0); d.a.set(0,0,0); }
        const tgt=d.st==='spray'&&d.f?Math.atan2(d.f.x-d.p.x,d.f.z-d.p.z):Math.hypot(d.v.x,d.v.z)>1.2*M?Math.atan2(d.v.x,d.v.z):d.yaw, dy=((tgt-d.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
        d.yaw+=Math.max(-2.4*dt,Math.min(2.4*dt,dy)); d.sp=Math.min(1,d.sp+dt*1.5); }
      else d.sp=Math.max(0,d.sp-dt*.8);
      d.dirty=d.st!=='home'||d.sp>0;
      const hv=d.st==='spray'?Math.sin(tt*2.1+d.i)*.04*M:0, fw=d.a.x*Math.sin(d.yaw)+d.a.z*Math.cos(d.yaw), rt=d.a.x*Math.cos(d.yaw)-d.a.z*Math.sin(d.yaw), cl=v=>Math.max(-.42,Math.min(.42,v/M*.09));
      q4.setFromEuler(e3.set(cl(fw),d.yaw,-cl(rt))); BM4.compose(p3.copy(d.p).setY(d.p.y+hv),q4,s3.set(M,M,M)); DB.setMatrixAt(d.i,BM4);
      LP.setMatrixAt(d.i,HM.copy(BM4).multiply(RM.makeTranslation(0,-DR0*.36,DR0*.86)));
      DB.instanceMatrix.needsUpdate=LP.instanceMatrix.needsUpdate=true; }
    if(LP.instanceColor==null||(tt*4|0)!==LP.bk){ LP.bk=tt*4|0; for(const d of DR){ const out=d.st!=='home'; LP.setColorAt(d.i,cc.setHex(out?LP.bk%2?0xff3a2a:0x3a7aff:0x3cff6a)); LP.setColorAt(ND+d.i,cc.setHex(out?0xffb030:0x3cff6a)); } LP.instanceColor.needsUpdate=true; }
    for(let i=DROPS.length-1;i>=0;i--){ const q=DROPS[i]; q.t+=dt; q.vy-=GV*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.z+=q.vz*dt; if(q.y<q.gy||q.t>1.2)DROPS.splice(i,1); }
    let n=0; for(const q of DROPS)DROP.setMatrixAt(n++,m4.compose(p3.set(q.x,q.y,q.z),q4.identity(),s3.set(1,1,1)));
    DROP.count=n; DROP.visible=n>0; if(n)DROP.instanceMatrix.needsUpdate=true; };
  droneTick(0);
  { SYS.add('life',(dt)=>{ if(!(dt>0))return; dt=Math.min(dt,.1); fireTick(dt); droneTick(dt); },'151-blaze'); }
  window.FIREAT=(x,z)=>{ const f=start(x,z,true); return f?{x:+f.x.toFixed(2),y:+f.y.toFixed(2),z:+f.z.toFixed(2)}:null; };
  window.BLAZEDBG=()=>({fires:F.map(f=>({x:+f.x.toFixed(1),z:+f.z.toFixed(1),age:Math.round(f.age),wet:+f.wet.toFixed(1),by:f.by?f.by.i:null})),drones:DR.map(d=>({st:d.st,x:+d.p.x.toFixed(1),y:+d.p.y.toFixed(1),z:+d.p.z.toFixed(1)})),marks:BM.filter(Boolean).length,docks:ST.length,cruise:+CRUISE.toFixed(1),light:+L.intensity.toFixed(1)});
  if(QS.get('fire')==='1')SYS.onStart(()=>setTimeout(()=>window.FIREAT(pos.x+2.4*T,pos.z+1.6*T),1500),'151-blaze');
}
