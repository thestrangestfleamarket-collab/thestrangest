// THE JETS: the flamethrower and the freeze ray every player owns from the start, held in the hand (WIELD), the mouse held down to fire: real fire (FLAME) that lights a BLAZE wherever it lands and burns whoever it touches; a freezing mist that puts fires out, frosts the ground, freezes water to ice you can walk on (ICE) and locks people in ice; both seen and felt online (jet, zap).
import {SHARED, THREE} from './003-shx.js';
import {BLAZE, FORAGE, ICE, INV, LEVELS, NPCS, ONLINE, pos, RAG, ROOMS, st, VIT, VR, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {QS, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
{ const T=TILE, M=T/.84, V3=THREE.Vector3, rnd=Math.random, say=SAY, RF=4.5*M, RI=6.5*M, now=()=>performance.now();
  FORAGE.add({names:{flamer:'FLAMETHROWER',frost:'FREEZE RAY'}});
  if(!OWNED.get('jets')||QS.get('fresh')){ if(!INV.items.flamer)INV.items.flamer=1; if(!INV.items.frost)INV.items.frost=1; INV.save(); OWNED.set('jets','1'); }
  const JET={hold:false,burst:0,on:'',sent:'',sentT:0,S:new Map(),E:new Map()}; window.JETS=JET;

  /* ---------- the two things in the hand, along the forearm (+y), the nozzle at the top ---------- */
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), cyl=(r0,r1,h,m,y,z=0)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r0*M,r1*M,h*M,10),m); o.position.set(0,y*M,z*M); return o; }, box=(w,h,d,m,y,z=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w*M,h*M,d*M),m); o.position.set(0,y*M,z*M); return o; };
  const HELD=[], held=(g,kind)=>{ g.traverse(o=>{ o.userData.wield=1; o.castShadow=true; }); g.kind=kind; HELD.push(g); return g; };
  const flamer={name:'FLAMETHROWER',hint:'HOLD THE MOUSE DOWN TO SHOOT FIRE WHERE YOU AIM. IT LIGHTS WHAT IT HITS AND BURNS WHO IT TOUCHES.',
    make:()=>{ '@later'; const g=new THREE.Group(), st=lam(0x2a2b2e), red=lam(0xa82a1e), br=lam(0xb08a4a);
      g.add(cyl(.022,.022,.62,st,.3),cyl(.03,.024,.08,br,.62),cyl(.065,.065,.3,red,.16,.08),cyl(.066,.066,.02,st,.31,.08),cyl(.012,.012,.12,st,.38,.06),box(.03,.12,.05,lam(0x3a2a1e),-.03,.02));
      g.tipL=new V3(0,.67*M,0); g.head=g.tipL; return held(g,'f'); },
    aim:(dt,a)=>{ if(JET.aim)a.copy(JET.aim); return false; }, use:()=>{ JET.hold=true; JET.burst=.3; } };
  const frost={name:'FREEZE RAY',hint:'HOLD THE MOUSE DOWN TO SHOOT FREEZING MIST. IT PUTS OUT FIRES, FROSTS THE GROUND, FREEZES WATER AND PEOPLE.',
    make:()=>{ '@later'; const g=new THREE.Group(), wh=lam(0xd8dde4), cy=new THREE.MeshBasicMaterial({color:0x7fe8ff}), dk=lam(0x30343c);
      g.add(box(.05,.12,.06,dk,-.02),cyl(.04,.05,.26,wh,.18),cyl(.018,.03,.12,dk,.36),new THREE.Mesh(new THREE.SphereGeometry(.026*M,10,8),cy));
      g.children[3].position.y=.43*M; for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.052*M,.008*M,5,14),cy); r.rotation.x=Math.PI/2; r.position.y=(.1+i*.07)*M; g.add(r); }
      g.tipL=new V3(0,.45*M,0); g.head=g.tipL; return held(g,'i'); },
    aim:(dt,a)=>{ if(JET.aim)a.copy(JET.aim); return false; }, use:()=>{ JET.hold=true; JET.burst=.3; } };
  for(const [id,k] of [['flamer',flamer],['frost',frost]]){ (WIELD.pend=WIELD.pend||[]).push([id,k]); if(WIELD.kind)WIELD.kind(id,k); }
  addEventListener('pointerup',e=>{ if(e.button===0)JET.hold=false; }); addEventListener('blur',()=>{ JET.hold=false; });

  /* ---------- the ice on water: patches that grow while the ray is on them, hold you up, and melt ---------- */
  const IN=32, iceMat=new THREE.MeshPhongMaterial({color:0xcfeeff,specular:0xffffff,shininess:90,emissive:0x0c1a24}), iceG=(()=>{ const g=new THREE.CylinderGeometry(1,1,1,22,1), p=g.attributes.position;
      for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i), r=Math.hypot(x,z); if(r>.5){ const a=Math.atan2(z,x), k=.86+.14*Math.sin(a*5.3+1)*Math.sin(a*2.1); p.setX(i,x*k); p.setZ(i,z*k); } } g.computeVertexNormals(); return g; })();
  const iceMe=new THREE.InstancedMesh(iceG,iceMat,IN); iceMe.count=0; iceMe.name='ice'; iceMe.receiveShadow=true; iceMe.frustumCulled=false; iceMe.userData.anyRoom=1; scene.add(LEVELS.own(iceMe,'up'));
  const IL=[], m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), s3=new V3(), p3=new V3(), TH=.06*M;
  const iceDraw=()=>{ IL.forEach((c,i)=>iceMe.setMatrixAt(i,m4.compose(p3.set(c.x,c.y-TH/2+.01*M,c.z),q4.setFromAxisAngle(s3.set(0,1,0),c.a),s3.set(c.r,TH,c.r)))); iceMe.count=IL.length; iceMe.instanceMatrix.needsUpdate=true; iceMe.visible=IL.length>0; };
  Object.assign(ICE,{list:IL,
    at:(x,z)=>{ let y=null; for(const c of IL)if(c.r>.3*M&&Math.hypot(c.x-x,c.z-z)<c.r*.86-.1*M&&(y==null||c.y>y))y=c.y; return y; },
    grow:(x,y,z,dt)=>{ let c=IL.find(c=>Math.abs(c.y-y)<.4*M&&Math.hypot(c.x-x,c.z-z)<c.r+.3*M);
      if(!c){ if(IL.length>=IN){ let o=0; IL.forEach((q,i)=>{ if(q.t>IL[o].t)o=i; }); IL.splice(o,1); } c={x,y,z,r:.25*M,a:rnd()*6.28,t:0}; IL.push(c); }
      c.r=Math.min(2.6*M,c.r+dt*.8*M/Math.max(1,c.r/M)); c.t=0; const k=Math.min(1,dt*.6); c.x+=(x-c.x)*k*.3; c.z+=(z-c.z)*k*.3; },
    melt:(x,z,dt)=>{ for(const c of IL)if(Math.hypot(c.x-x,c.z-z)<c.r+.4*M){ c.r-=dt*.9*M; c.t=Math.max(c.t,60); } },
    feed:(st,pos)=>{ const y=ICE.at(pos.x,pos.z); if(y==null||SHARED.LVL!=='up'||SHARED.py>y+.6*M)return false; RIG.water(st,{level:null,floor:0}); return true; },
    floor:g=>{ const y=IL.length&&SHARED.LVL==='up'?ICE.at(pos.x,pos.z):null; return y!=null&&y>g&&SHARED.py<y+.6*M?y:g; }});
  const iceTick=dt=>{ if(!IL.length)return; for(let i=IL.length-1;i>=0;i--){ const c=IL[i]; c.t+=dt; if(c.t>90)c.r-=dt*.02*M; if(c.r<.15*M)IL.splice(i,1); } iceDraw(); };

  /* ---------- frost on the ground: the burn mark's twin, white and blue, dithered away ---------- */
  const FN=48, FM=[], frostMe=(()=>{ const n=14, P=[], C=[], c=new THREE.Color(), h=k=>{ const v=Math.sin(k*91.7+2.3)*43758.5453; return v-Math.floor(v); }, A=k=>(k%n)/n*Math.PI*2;
      const R=[...Array(n)].map((_,k)=>.5*(.6+.4*h(k))), R1=R.map((r,k)=>r*(.45+.2*h(k+30))), tri=(a,b,d,col)=>{ P.push(...a,...d,...b); c.setHex(col); for(let i=0;i<3;i++)C.push(c.r,c.g,c.b); }, pt=(r,k)=>[Math.cos(A(k))*r,0,Math.sin(A(k))*r];
      for(let k=0;k<n;k++){ tri([0,0,0],pt(R1[k],k),pt(R1[(k+1)%n],k+1),0xf4fbff); const a=pt(R1[k],k), b=pt(R1[(k+1)%n],k+1), d=pt(R[(k+1)%n],k+1), e=pt(R[k],k); tri(a,b,d,0xc6e4f4); tri(a,d,e,0xc6e4f4); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals();
      const aA=new THREE.InstancedBufferAttribute(new Float32Array(FN),1); aA.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aA',aA);
      const mat=new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x1a2630,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
      mat.onBeforeCompile=sh=>{ sh.vertexShader='attribute float aA; varying float vA;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vA=aA;');
        sh.fragmentShader='varying float vA;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n { ivec2 bq=ivec2(mod(gl_FragCoord.xy,4.)); float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); if(vA<=(bt[bq.x+bq.y*4]+.5)/16.)discard; }'); };
      mat.customProgramCacheKey=()=>'frostmark';
      const me=new THREE.InstancedMesh(g,mat,FN); me.count=0; me.frustumCulled=false; me.receiveShadow=true; me.name='frost'; me.raycast=()=>{}; scene.add(LEVELS.own(me,'*')); me.aA=aA; return me; })();
  const frostAt=(x,y,z)=>{ let m=FM.find(m=>Math.hypot(m.x-x,m.z-z)<.5*M&&Math.abs(m.y-y)<.3*M); if(m){ m.a=Math.min(1,m.a+.25); m.t=0; return; }
    if(FM.length>=FN){ let o=0; FM.forEach((q,i)=>{ if(q.t>FM[o].t)o=i; }); FM.splice(o,1); } FM.push({x,y,z,a:.35,t:0,s:(.8+rnd()*.6)*M,r:rnd()*6.28}); };
  const frostOff=(x,z,dt)=>{ for(const m of FM)if(Math.hypot(m.x-x,m.z-z)<1*M)m.a-=dt*2; };
  const frostTick=dt=>{ for(let i=FM.length-1;i>=0;i--){ const m=FM[i]; m.t+=dt; if(m.t>60)m.a-=dt/60; if(m.a<=0)FM.splice(i,1); }
    FM.forEach((m,i)=>{ frostMe.setMatrixAt(i,m4.compose(p3.set(m.x,m.y+.02*M,m.z),q4.setFromAxisAngle(s3.set(0,1,0),m.r),s3.set(m.s,1,m.s))); frostMe.aA.array[i]=m.a; });
    frostMe.count=FM.length; frostMe.visible=FM.length>0; if(FM.length){ frostMe.instanceMatrix.needsUpdate=true; frostMe.aA.needsUpdate=true; } };

  /* ---------- where a stream ends: a ray from the nozzle into the world (a few times a second), what it struck: water, ice, the ground, a wall ---------- */
  const ray=new THREE.Raycaster(), seen=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group)return false; return !o.userData.wield&&!(o.material&&(o.material.visible===false||o.material.transparent&&o.material.opacity<.05)); };
  const wet=o=>{ for(let q=o;q;q=q.parent)if(/river|water|pond|lake|brook|pool|sea|harbo/i.test(q.name||''))return true; const u=o.material&&o.material.uniforms; return !!(u&&(u.uWA||u.uH||u.uLevel)); };
  const cast=S=>{ ray.set(S.tip,S.dir); ray.far=S.R; ray.camera=SHARED.cam; S.end=null; S.what='';
    try{ const h=ray.intersectObjects(scene.children,true).find(h=>h.distance>.25*M&&seen(h.object)); if(h){ S.end=h.point.clone(); S.what=h.object===iceMe?'ice':wet(h.object)?'water':Math.abs(h.point.y-SHARED.groundY(h.point.x,h.point.z))<.35*M?'ground':'wall'; } }catch(e){}
    S.len=S.end?S.tip.distanceTo(S.end):S.R; };

  /* ---------- the people a stream touches: you, the other players near you, the characters ---------- */
  const bodies=()=>{ const L=[{id:'me',x:pos.x,y:SHARED.py,z:pos.z}];
    for(const o of ONLINE.others.values()){ if(o.why!=='near you'||o.dead||!o.fig||!o.fig.g)continue; const p=o.fig.g.position; L.push({id:o.id,x:p.x,y:p.y,z:p.z,o}); }
    for(const N of NPCS.all?NPCS.all():[]){ if(!N.g||!N.g.visible||N.far||!N.st||N.lv&&N.lv!==SHARED.LVL)continue; L.push({id:'npc:'+(N.key||'')+(N.uid||''),x:N.st.x,y:N.g.position.y,z:N.st.z,N}); } return L; };
  const touches=(S,b)=>{ const n=10; for(let i=1;i<=n;i++){ const t=S.len*i/n, x=S.tip.x+S.dir.x*t, y=S.tip.y+S.dir.y*t, z=S.tip.z+S.dir.z*t; if(y>b.y-.1*M&&y<b.y+1.9*M&&Math.hypot(x-b.x,z-b.z)<(.32+.05*i/n*3)*M)return true; } return false; };

  /* ---------- on fire, frozen: flames that ride a body, a block of ice round it ---------- */
  const SRC=[], flameSrc=()=>{ let s=SRC.find(s=>s.free); if(!s){ s=FLAME.add({kind:'bed',name:'burning',x:0,y:-1e4,z:0,w:.5*M,h:1.2*M,embers:3,smoke:1.4}); SRC.push(s); } s.free=false; s.on=true; return s; };
  const blockMat=new THREE.MeshPhongMaterial({color:0xbfe6ff,specular:0xffffff,shininess:100,transparent:true,opacity:.5,depthWrite:false}), blockG=new THREE.BoxGeometry(.8*M,1.95*M,.8*M).translate(0,.95*M,0), BLK=[];
  const block=()=>{ let b=BLK.find(b=>!b.visible); if(!b){ b=new THREE.Mesh(blockG,blockMat); b.raycast=()=>{}; b.userData.anyRoom=1; scene.add(LEVELS.own(b,'*')); BLK.push(b); } b.visible=true; b.rotation.y=rnd()*6.28; return b; };
  const fx=(id)=>{ let e=JET.E.get(id); if(!e){ e={fire:0,ice:0,cold:0,burn:null,blk:null}; JET.E.set(id,e); } return e; };
  const bodyFx=(dt,L)=>{ const by=new Map(L.map(b=>[b.id,b]));
    for(const [id,e] of JET.E){ const b=by.get(id), me=id==='me';
      if(me){ e.fire=JET.burnT; e.ice=SHARED.frozen||0; }
      else{ e.fire=Math.max(0,e.fire-dt); e.ice=Math.max(0,e.ice-dt); e.cold=Math.max(0,e.cold-dt*.5); if(b&&b.N)b.N.frozen=e.ice; }
      const on=!!b&&e.fire>0, ic=!!b&&e.ice>0;
      if(on&&!e.burn)e.burn=flameSrc(); if(!on&&e.burn){ e.burn.on=false; e.burn.free=true; e.burn.y=-1e4; e.burn=null; }
      if(e.burn){ e.burn.x=b.x; e.burn.y=b.y+.15*M; e.burn.z=b.z; e.burn.a.position.set(b.x,b.y,b.z); }
      if(ic&&!e.blk)e.blk=block(); if(!ic&&e.blk){ e.blk.visible=false; e.blk=null; for(let k=0;k<6;k++)FLAME.part(8,b?b.x:0,(b?b.y:0)+rnd()*1.6*M,b?b.z:0,(rnd()-.5)*2*M,rnd()*1.5*M,(rnd()-.5)*2*M,.6,.035*M,rnd()*9,2*M); }
      if(e.blk)e.blk.position.set(b.x,b.y,b.z);
      if(!b&&!e.burn&&!e.blk&&!me)JET.E.delete(id); } };
  fx('me');

  /* ---------- you, burnt and frozen: through VIT.hurt as any blow; frozen, you cannot move or act till it thaws ---------- */
  JET.burnT=0; SHARED.frozen=0; let dotT=0, immune=0, coldIn=0;
  const burnMe=(d,from)=>{ if(VIT.dead)return; if(SHARED.frozen>0){ SHARED.frozen=Math.max(0,SHARED.frozen-.6); return; } VIT.hurt(d,from); JET.burnT=Math.max(JET.burnT,3); };
  const freezeMe=k=>{ if(VIT.dead||immune>0)return; JET.burnT=0; coldIn+=k; if(coldIn>=.9&&!(SHARED.frozen>0)){ SHARED.frozen=4; coldIn=0; SHARED.target=null; say('YOU ARE FROZEN SOLID!','#9fe6ff'); } else if(SHARED.frozen>0)SHARED.frozen=Math.min(5,SHARED.frozen+.15); };
  const selfTick=dt=>{ coldIn=Math.max(0,coldIn-dt*.4); immune=Math.max(0,immune-dt);
    if(SHARED.frozen>0){ SHARED.frozen-=dt; if(VIT.dead)SHARED.frozen=0; if(SHARED.frozen<=0){ SHARED.frozen=0; immune=2.5; say('THE ICE CRACKS AND YOU ARE FREE.','#9fe6ff'); } }
    if(JET.burnT>0){ if(st.water&&st.water.in){ JET.burnT=0; for(let k=0;k<4;k++)FLAME.puff(pos.x,SHARED.py+.8*M,pos.z,1.2,6); } else { JET.burnT-=dt; if((dotT-=dt)<=0){ dotT=.5; if(!VIT.dead)VIT.hurt(.01); } } } };
  ONLINE.hear.zap=m=>{ '@later'; fx('me'); const f=Array.isArray(m.from)?{x:+m.from[0],z:+m.from[1]}:null; if(m.k==='i')freezeMe(.3); else burnMe(.025,f); };

  /* ---------- the streams: yours from your nozzle, theirs from theirs as they say they fire ---------- */
  const mk=(id,k)=>({id,k,tip:new V3(),dir:new V3(0,0,1),R:k==='f'?RF:RI,len:0,end:null,what:'',cT:0,eA:0,lT:0,zT:{},at:now()});
  const tipOf=(g,S)=>{ if(!g||!g.visible||!g.parent)return false; S.tip.copy(g.tipL).applyMatrix4(g.matrix); const e=g.matrix.elements; S.dir.set(e[4],e[5],e[6]).normalize(); return true; };
  ONLINE.hear.jet=m=>{ '@later'; if(m.k==='f'||m.k==='i'){ const S=JET.S.get(m.id); if(!S||S.k!==m.k)JET.S.set(m.id,mk(m.id,m.k)); else S.at=now(); } else JET.S.delete(m.id); };
  const PL=[];
  const emit=(S,dt)=>{ const f=S.k==='f', rate=f?70:80; S.eA+=dt*rate; while(S.eA>=1){ S.eA-=1; const sp=(f?10:12)*M*(.85+rnd()*.3), j=f?.07:.05;
      const vx=(S.dir.x+(rnd()-.5)*j)*sp, vy=(S.dir.y+(rnd()-.5)*j)*sp, vz=(S.dir.z+(rnd()-.5)*j)*sp, x=S.tip.x+S.dir.x*.05*M, y=S.tip.y+S.dir.y*.05*M, z=S.tip.z+S.dir.z*.05*M;
      const q=f?FLAME.part(3,x,y,z,vx,vy,vz,.45+rnd()*.25,(.1+rnd()*.05)*M):rnd()<.25?FLAME.part(8,x,y,z,vx,vy,vz,.4+rnd()*.3,.022*M,rnd()*9,.6*M):FLAME.part(7,x,y,z,vx,vy,vz,.5+rnd()*.3,(.07+rnd()*.04)*M);
      if(q)PL.push({q,L:S.len*(.9+rnd()*.2),x,y,z,f,hit:false}); } };
  const parts=dt=>{ for(let i=PL.length-1;i>=0;i--){ const p=PL[i], q=p.q; if(q.t>=q.life){ PL.splice(i,1); continue; }
      if(!p.hit&&Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z)>=p.L){ p.hit=true; const s=Math.hypot(q.vx,q.vy,q.vz)*.12; q.vx=(rnd()-.5)*2*s+q.vx*.05; q.vz=(rnd()-.5)*2*s+q.vz*.05; q.vy=p.f?.8*M:.1*M; }
      const dr=Math.max(0,1-(p.hit?4:1.1)*dt); q.vx*=dr; q.vz*=dr; q.vy=q.vy*dr+(p.f?1.6*M:-.5*M)*dt; } };

  /* ---------- what a stream does where it lands and to whom it touches ---------- */
  const out=()=>SHARED.LVL==='up'&&!ROOMS.cur;
  const land=(S,dt,mine)=>{ const E=S.end; if(!E)return; const f=S.k==='f';
    if(f){ if(S.what==='ice'){ ICE.melt(E.x,E.z,dt); if((S.lT-=dt)<=0){ S.lT=.25; FLAME.puff(E.x,E.y+.1*M,E.z,1,6); } return; }
      if(S.what==='water'){ if((S.lT-=dt)<=0){ S.lT=.2; FLAME.puff(E.x,E.y+.1*M,E.z,1.2,6); } return; }
      frostOff(E.x,E.z,dt); if((S.lT-=dt)>0)return; S.lT=.45; for(let k=0;k<2;k++)FLAME.ember(E.x,E.y+.05*M,E.z,1.4); if(rnd()<.5)FLAME.puff(E.x,E.y+.3*M,E.z,1,5);
      if(out()&&BLAZE.start){ const x=E.x-S.dir.x*.25*M, z=E.z-S.dir.z*.25*M, burns=BLAZE.burnable(x,z), b=BLAZE.start(x,z,true); if(b&&!burns){ b.life=12+rnd()*10; b.sp=1e9; } } return; }
    for(const b of BLAZE.F)if(Math.hypot(b.x-E.x,b.z-E.z)<1.4*M||along(S,b.x,b.y+.3*M,b.z)<.7*M)b.wet+=dt*2.6;
    if(S.what==='water'||S.what==='ice'){ if(out())ICE.grow(E.x,E.y,E.z,dt); return; }
    if(S.what==='ground'&&(S.lT-=dt)<=0){ S.lT=.3; frostAt(E.x,E.y,E.z); } };
  const along=(S,x,y,z)=>{ const dx=x-S.tip.x, dy=y-S.tip.y, dz=z-S.tip.z, t=Math.max(0,Math.min(S.len,dx*S.dir.x+dy*S.dir.y+dz*S.dir.z)); return Math.hypot(dx-S.dir.x*t,dy-S.dir.y*t,dz-S.dir.z*t); };
  const hits=(S,dt,L,mine)=>{ for(const b of L){ if(b.id===S.id||b.id==='me'&&mine||!touches(S,b))continue; const e=fx(b.id);
      if(S.k==='f'){ e.ice=Math.max(0,e.ice-dt*2); e.cold=0; if(b.id!=='me')e.fire=Math.max(e.fire,3); }
      else{ e.fire=0; if(b.id!=='me'){ e.cold+=dt; if(e.cold>=.9&&e.ice<=0){ e.ice=4; e.cold=-2; } else if(e.ice>0)e.ice=Math.min(5,e.ice+dt*.3); } }
      if(mine&&b.o){ const t=now(); if(t-(S.zT[b.id]||0)>300){ S.zT[b.id]=t; ONLINE.send({t:'zap',to:b.id,k:S.k}); } } } };

  /* ---------- each frame ---------- */
  const firing=()=>{ const id=WIELD.on, g=WIELD.held&&WIELD.held(); if((id!=='flamer'&&id!=='frost')||!g||!g.visible||VIT.dead||VIT.out>0||RAG.on||SHARED.frozen>0)return ''; if(VR.on&&JET.burst<=0)JET.hold=false; return JET.hold||JET.burst>0?(id==='flamer'?'f':'i'):''; };
  const pilots=new Map();
  SYS.add('life',dt=>{ dt=Math.min(dt||0,.05); JET.burst=Math.max(0,JET.burst-dt); selfTick(dt);
    const k=firing(); if(k){ let S=JET.S.get('me'); if(!S||S.k!==k)JET.S.set('me',S=mk('me',k)); S.at=now(); } else JET.S.delete('me'); JET.on=k;
    if(ONLINE.on&&(k!==JET.sent||k&&now()-JET.sentT>1500)){ JET.sent=k; JET.sentT=now(); ONLINE.send({t:'jet',k}); }
    for(const g of HELD){ if(g.kind!=='f')continue; let s=pilots.get(g); const on=g.visible&&!!g.parent; if(on&&!s){ s=FLAME.add({kind:'candle',name:'pilot light',x:0,y:0,z:0,w:.03*M,h:.06*M}); pilots.set(g,s); }
      if(s){ s.on=on; if(on){ p3.copy(g.tipL).applyMatrix4(g.matrix); s.x=p3.x; s.y=p3.y-.02*M; s.z=p3.z; s.a.position.copy(p3); } } }
    const L=JET.S.size||JET.E.size?bodies():null;
    for(const [id,S] of JET.S){ const mine=id==='me', g=mine?WIELD.held():WIELD.theirG&&WIELD.theirG(id);
      if(!mine&&now()-S.at>2500){ JET.S.delete(id); continue; } if(!tipOf(g,S))continue;
      if((S.cT-=dt)<=0){ S.cT=.15; cast(S); } else S.len=S.end?S.tip.distanceTo(S.end):S.R;
      emit(S,dt); land(S,dt,mine); if(L)hits(S,dt,L,mine); }
    parts(dt); if(L)bodyFx(dt,L); iceTick(dt); frostTick(dt); },'146hb-jets');
  window.JETDBG=()=>({on:JET.on,streams:[...JET.S].map(([id,S])=>({id,k:S.k,len:+(S.len/M).toFixed(2),what:S.what})),parts:PL.length,ice:IL.map(c=>({x:c.x,z:c.z,y:c.y,r:c.r/M})),frost:FM.length,frozen:SHARED.frozen,burn:JET.burnT,fx:[...JET.E].map(([id,e])=>({id,fire:e.fire,ice:e.ice})),M}); }
