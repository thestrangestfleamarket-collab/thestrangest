// THE JETS: the flamethrower and the freeze ray every player owns from the start, held in the hand (WIELD), the mouse held down to fire: real fire (FLAME) that lights a BLAZE wherever it lands and burns whoever it touches; a freezing mist that puts fires out, frosts the ground, freezes water to ice you can walk on (ICE) and locks people in ice; both seen and felt online (jet, zap).
import {SHARED, THREE} from './003-shx.js';
import {BLAZE, FORAGE, ICE, INV, LEVELS, NPCS, ONLINE, pos, RAG, ROOMS, st, VIT, VR, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {QS, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
{ const T=TILE, M=T/.84, V3=THREE.Vector3, rnd=Math.random, say=SAY, RF=7*M, RI=7*M, now=()=>performance.now();
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

  /* ---------- the streams' physics: the flamethrower's fuel is thrown (about 14 m/s), falls under gravity and drags in the air, so its stream arcs; the freeze ray's beam runs straight ---------- */
  const G=9.8*M, KD=.07/M, FUEL=.28, ray=new THREE.Raycaster(), seen=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group)return false; return !o.userData.wield&&!o.userData.iceShell&&!(o.material&&(o.material.visible===false||o.material.transparent&&o.material.opacity<.05)); };
  const wet=o=>{ for(let q=o;q;q=q.parent)if(/river|water|pond|lake|brook|pool|sea|harbo/i.test(q.name||''))return true; const u=o.material&&o.material.uniforms; return !!(u&&(u.uWA||u.uH||u.uLevel)); };
  const path=S=>{ const P=S.P; P.length=0; P.push(S.tip.clone()); if(S.k!=='f'){ P.push(S.tip.clone().addScaledVector(S.dir,S.R)); return; }
    const p=S.tip.clone(), v=S.dir.clone().multiplyScalar(14*M); let s=0; const h=.02; for(let t=0;t<FUEL*3&&s<S.R;t+=h){ v.y-=G*h; v.multiplyScalar(1/(1+KD*v.length()*h)); const d=v.length()*h; p.addScaledVector(v,h); s+=d; if(Math.round(t/h)%3===2)P.push(p.clone()); } P.push(p.clone()); };
  const cast=S=>{ path(S); ray.camera=SHARED.cam; S.end=null; S.what=''; let s=0; const P=S.P, D=new V3();
    const gy=(x,z)=>SHARED.groundY?SHARED.groundY(x,z):-1e9;
    for(let i=1;i<P.length;i++){ D.subVectors(P[i],P[i-1]); let l=D.length(); if(l<1e-6)continue; const g1=gy(P[i].x,P[i].z), under=P[i].y<g1; if(under){ const g0=gy(P[i-1].x,P[i-1].z), a=P[i-1].y-g0, b=g1-P[i].y, u=a/Math.max(1e-6,a+b); l*=u; } ray.set(P[i-1],D.normalize()); ray.far=l;
      let h=null; try{ h=ray.intersectObjects(scene.children,true).find(h=>(s+h.distance)>.25*M&&seen(h.object)); }catch(e){}
      if(h){ S.end=h.point.clone(); S.what=h.object===iceMe?'ice':wet(h.object)?'water':Math.abs(h.point.y-gy(h.point.x,h.point.z))<.35*M?'ground':'wall'; P.length=i; P.push(S.end.clone()); s+=h.distance; break; }
      if(under){ S.end=P[i-1].clone().addScaledVector(D,l); S.end.y=gy(S.end.x,S.end.z); S.what='ground'; P.length=i; P.push(S.end.clone()); s+=l; break; } s+=l; }
    S.len=s; };
  const along=(S,x,y,z)=>{ let best=1e9; const P=S.P; for(let i=1;i<P.length;i++){ const a=P[i-1], b=P[i], dx=b.x-a.x, dy=b.y-a.y, dz=b.z-a.z, l2=dx*dx+dy*dy+dz*dz||1, t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy+(z-a.z)*dz)/l2)); best=Math.min(best,Math.hypot(a.x+dx*t-x,a.y+dy*t-y,a.z+dz*t-z)); } return best; };

  /* ---------- the people a stream touches: you, the other players near you, the characters ---------- */
  const bodies=()=>{ const L=[{id:'me',x:pos.x,y:SHARED.py,z:pos.z,root:W3.group}];
    for(const o of ONLINE.others.values()){ if(o.why!=='near you'||o.dead||!o.fig||!o.fig.g||!o.p)continue; const p=o.p; L.push({id:o.id,x:p.x,y:p.y??o.fig.g.position.y,z:p.z,o,root:o.fig.g}); }
    for(const N of NPCS.all?NPCS.all():[]){ if(!N.g||!N.g.visible||N.far||!N.st||N.lv&&N.lv!==SHARED.LVL)continue; L.push({id:'npc:'+(N.key||'')+(N.uid||''),x:N.st.x,y:N.g.position.y,z:N.st.z,N,root:N.g}); } return L; };
  const touches=(S,b)=>Math.min(along(S,b.x,b.y+.4*M,b.z),along(S,b.x,b.y+M,b.z),along(S,b.x,b.y+1.6*M,b.z))<.5*M;

  /* ---------- on fire: flames that ride a body. Frozen: a shell of ice over the body's own shape, held in the pose it was caught in, a timer over it till it thaws ---------- */
  const SRC=[], flameSrc=()=>{ let s=SRC.find(s=>s.free); if(!s){ s=FLAME.add({kind:'bed',name:'burning',x:0,y:-1e4,z:0,w:.5*M,h:1.2*M,embers:3,smoke:1.4}); SRC.push(s); } s.free=false; s.on=true; return s; };
  const SW=new V3(), shellMat=(src,k)=>{ const U={value:k}, A={value:.62}, m=new THREE.MeshPhongMaterial({color:0xcfeeff,specular:0xffffff,shininess:140,emissive:0x16384a,transparent:true,opacity:.62,depthWrite:false});
    m.onBeforeCompile=(sh,r)=>{ if(src&&src.onBeforeCompile)src.onBeforeCompile.call(src,sh,r); sh.uniforms.uIceK=U; sh.uniforms.uIceA=A;
      sh.vertexShader='uniform float uIceK;\n'+sh.vertexShader.replace('#include <project_vertex>','transformed+=normalize(objectNormal)*uIceK;\n#include <project_vertex>');
      sh.fragmentShader='uniform float uIceA;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n { float fr=1.-abs(dot(normalize(vViewPosition),normal)); gl_FragColor.rgb+=vec3(.55,.8,1.)*pow(fr,2.)*.8; gl_FragColor.a=uIceA*(.55+.45*fr); }'); };
    m.customProgramCacheKey=()=>'iceshell'+(src&&src.customProgramCacheKey?src.customProgramCacheKey():''); m.U=U; m.A=A; return m; };
  const freezeShape=root=>{ const L=[]; root.traverse(o=>{ if(o.isMesh&&!o.isInstancedMesh&&!o.userData.iceShell&&!o.userData.wield&&o.geometry&&o.geometry.attributes.normal&&!(o.material&&(o.material.isShaderMaterial||o.material.transparent))&&!(o.morphTargetInfluences&&o.morphTargetInfluences.length)){ let v=true; for(let q=o;q&&q!==root.parent;q=q.parent)if(!q.visible)v=false; if(v)L.push(o); } });
    return L.map(o=>{ const src=Array.isArray(o.material)?o.material[0]:o.material, mat=shellMat(src,.035*M/Math.max(1e-6,o.getWorldScale(SW).x)), s=o.isSkinnedMesh?new THREE.SkinnedMesh(o.geometry,mat):new THREE.Mesh(o.geometry,mat);
      if(o.isSkinnedMesh)s.bind(o.skeleton,o.bindMatrix); s.userData.iceShell=1; s.raycast=()=>{}; s.frustumCulled=false; s.renderOrder=3; s.onBeforeRender=o.onBeforeRender; o.add(s); return s; }); };
  const thaw=sh=>{ for(const s of sh){ s.removeFromParent(); s.material.dispose(); } };
  const tag=()=>{ const c=document.createElement('canvas'); c.width=160; c.height=48; const t=new THREE.CanvasTexture(c), sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true})); sp.scale.set(1*M,.3*M,1); sp.renderOrder=9; sp.raycast=()=>{}; sp.userData.anyRoom=1; scene.add(LEVELS.own(sp,'*')); sp.c=c; sp.t=t; sp.n=-1; return sp; };
  const tagSet=(sp,v)=>{ const n=Math.ceil(v*10); if(n===sp.n)return; sp.n=n; const g=sp.c.getContext('2d'); g.clearRect(0,0,160,48); g.font='bold 30px monospace'; g.textAlign='center'; g.lineWidth=6; g.strokeStyle='#0a1a26'; const s='ICE '+(n/10).toFixed(1); g.strokeText(s,80,35); g.fillStyle='#bff0ff'; g.fillText(s,80,35); sp.t.needsUpdate=true; };
  const fx=(id)=>{ let e=JET.E.get(id); if(!e){ e={fire:0,ice:0,cold:0,burn:null,sh:null,tg:null}; JET.E.set(id,e); } return e; };
  const bodyFx=(dt,L)=>{ const by=new Map(L.map(b=>[b.id,b]));
    for(const [id,e] of JET.E){ const b=by.get(id), me=id==='me';
      if(me){ e.fire=JET.burnT; e.ice=SHARED.frozen||0; }
      else{ e.fire=Math.max(0,e.fire-dt); e.ice=Math.max(0,e.ice-dt); e.cold=Math.max(0,e.cold-dt*.5); if(b&&b.N)b.N.frozen=e.ice; if(b&&b.o)b.o.frozen=e.ice; }
      const on=!!b&&e.fire>0, ic=!!b&&e.ice>0;
      if(on&&!e.burn)e.burn=flameSrc(); if(!on&&e.burn){ e.burn.on=false; e.burn.free=true; e.burn.y=-1e4; e.burn=null; }
      if(e.burn){ e.burn.x=b.x; e.burn.y=b.y+.15*M; e.burn.z=b.z; e.burn.a.position.set(b.x,b.y,b.z); }
      if(ic&&!e.sh){ e.sh=freezeShape(b.root); e.tg=tag(); }
      if(!ic&&e.sh){ thaw(e.sh); e.sh=null; e.tg.removeFromParent(); e.tg.material.map.dispose(); e.tg.material.dispose(); e.tg=null; for(let k=0;k<14;k++)FLAME.part(8,b?b.x:0,(b?b.y:0)+rnd()*1.7*M,b?b.z:0,(rnd()-.5)*3*M,(.5+rnd()*2)*M,(rnd()-.5)*3*M,.9,.04*M,rnd()*9,G); }
      if(e.sh){ const a=.25+.37*Math.min(1,e.ice/1.5); for(const s of e.sh)s.material.A.value=a; e.tg.position.set(b.x,b.y+2.15*M,b.z); tagSet(e.tg,e.ice); }
      if(!b&&!e.burn&&!e.sh&&!me)JET.E.delete(id); } };
  fx('me');

  /* ---------- you, burnt and frozen: through VIT.hurt as any blow; frozen, you cannot move or act till it thaws ---------- */
  JET.burnT=0; SHARED.frozen=0; let dotT=0, immune=0, coldIn=0;
  const burnMe=(d,from)=>{ if(VIT.dead)return; if(SHARED.frozen>0){ SHARED.frozen=Math.max(0,SHARED.frozen-.6); return; } VIT.hurt(d,from); JET.burnT=Math.max(JET.burnT,3); };
  const freezeMe=k=>{ if(VIT.dead||immune>0)return; JET.burnT=0; coldIn+=k; if(coldIn>=.9&&!(SHARED.frozen>0)){ SHARED.frozen=4; coldIn=0; SHARED.target=null; say('YOU ARE FROZEN SOLID!','#9fe6ff'); } else if(SHARED.frozen>0)SHARED.frozen=Math.min(5,SHARED.frozen+.15); };
  const selfTick=dt=>{ coldIn=Math.max(0,coldIn-dt*.4); immune=Math.max(0,immune-dt);
    if(SHARED.frozen>0){ SHARED.frozen-=dt; if(VIT.dead)SHARED.frozen=0; if(SHARED.frozen<=0){ SHARED.frozen=0; immune=2.5; say('THE ICE CRACKS AND YOU ARE FREE.','#9fe6ff'); } }
    if(JET.burnT>0){ if(st.water&&st.water.in){ JET.burnT=0; for(let k=0;k<4;k++)FLAME.puff(pos.x,SHARED.py+.8*M,pos.z,1.2,6); } else { JET.burnT-=dt; if((dotT-=dt)<=0){ dotT=.5; if(!VIT.dead)VIT.hurt(.01); } } } };
  ONLINE.hear.zap=m=>{ '@later'; fx('me'); const f=Array.isArray(m.from)?{x:+m.from[0],z:+m.from[1]}:null; if(m.k==='i')freezeMe(.3); else burnMe(.025,f); };

  /* ---------- the beam of the freeze ray: a bright core with frost running down it ---------- */
  const uT={value:0}, beamMat=new THREE.ShaderMaterial({uniforms:{uT},toneMapped:false,side:THREE.DoubleSide,vertexShader:'varying vec2 vU; varying float vL; void main(){ vU=uv; vL=length((modelMatrix*vec4(0.,1.,0.,0.)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'uniform float uT; varying vec2 vU; varying float vL; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); } void main(){ ivec2 bq=ivec2(mod(gl_FragCoord.xy,4.)); float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.), th=(bt[bq.x+bq.y*4]+.5)/16.;'+
      ' float y=vU.y*vL*6., band=.5+.5*sin(y*3.-uT*28.+sin(vU.x*25.+uT*7.)*1.5), n=h(floor(vec2(vU.x*12.,y*2.-uT*20.))), a=(.45+.55*band)*(.6+.4*n)*smoothstep(0.,.08,vU.y); if(a<th)discard; gl_FragColor=vec4(mix(vec3(.45,.85,1.),vec3(1.),band*.7+.2),1.); }'});
  const beamG=new THREE.CylinderGeometry(1,1,1,8,1,true).translate(0,.5,0), BM=[], beam=()=>{ let b=BM.find(b=>!b.visible); if(!b){ b=new THREE.Mesh(beamG,beamMat); b.raycast=()=>{}; b.frustumCulled=false; b.userData.anyRoom=1; scene.add(LEVELS.own(b,'*')); BM.push(b); } b.visible=true; return b; };
  const UP=new V3(0,1,0);

  /* ---------- the streams: yours from your nozzle, theirs from theirs as they say they fire ---------- */
  const mk=(id,k)=>({id,k,tip:new V3(),dir:new V3(0,0,1),R:k==='f'?RF:RI,P:[],len:0,end:null,what:'',cT:0,eA:0,lT:0,zT:{},at:now(),bm:null});
  const tipOf=(g,S)=>{ if(!g||!g.visible||!g.parent)return false; S.tip.copy(g.tipL).applyMatrix4(g.matrix); const e=g.matrix.elements; S.dir.set(e[4],e[5],e[6]).normalize(); return true; };
  // where you aim: the point under the mouse (on your ground, or out along the ray), from the nozzle; no mouse (the headset): the way the tool points
  const AIMP=new V3(), aimMine=S=>{ if(JET.aim){ S.dir.copy(JET.aim); return; } const r=WIELD.ray; if(!r||VR.on)return; const c=r.origin, d=r.direction, far=c.distanceTo(S.tip)+S.R;
    let t=d.y<-1e-3?(SHARED.py-c.y)/d.y:far; if(!(t>0)||t>far)t=far; AIMP.copy(c).addScaledVector(d,t).sub(S.tip); if(AIMP.lengthSq()>.01*M*M)S.dir.copy(AIMP.normalize()); };
  const drop=S=>{ if(S.bm)S.bm.visible=false; JET.S.delete(S.id); };
  ONLINE.hear.jet=m=>{ '@later'; const S=JET.S.get(m.id); if(m.k==='f'||m.k==='i'){ let T=S; if(!T||T.k!==m.k){ if(T)drop(T); JET.S.set(m.id,T=mk(m.id,m.k)); } else T.at=now(); if(Array.isArray(m.v)){ T.rv=(T.rv||new V3()).set(+m.v[0]||0,+m.v[1]||0,+m.v[2]||1); if(T.rv.lengthSq()<1e-4)T.rv=null; else T.rv.normalize(); } } else if(S)drop(S); };
  const PL=[];
  // each drop or puff is born somewhere inside the frame (its own age), so the stream is whole however long the frame was
  const emit=(S,dt)=>{ const f=S.k==='f', rate=f?260:150; S.eA+=dt*rate; while(S.eA>=1){ S.eA-=1; const a=rnd()*dt, sp=(f?14:12)*M*(.9+rnd()*.2), j=f?.05:.04;
      const vx=(S.dir.x+(rnd()-.5)*j)*sp, vy=(S.dir.y+(rnd()-.5)*j)*sp, vz=(S.dir.z+(rnd()-.5)*j)*sp, x=S.tip.x+vx*a, y=S.tip.y+vy*a-(f?G*a*a/2:0), z=S.tip.z+vz*a;
      const kind=f?3:rnd()<.3?8:7, q=kind===3?FLAME.part(3,x,y,z,vx,vy,vz,.6+rnd()*.35,(.13+rnd()*.08)*M):kind===8?FLAME.part(8,x,y,z,vx,vy,vz,.7+rnd()*.4,.022*M,rnd()*9,G):FLAME.part(7,x,y,z,vx,vy,vz,.6+rnd()*.4,(.09+rnd()*.06)*M);
      if(q){ q.t=a; PL.push({q,L:S.len*(.92+rnd()*.12),s:sp*a,kind,ph:0}); } } };
  // fuel: gravity and air drag till it lands; then it burns as gas: dragged to a stop, rising as hot air does. Frost mist sinks as cold air does; ice crystals fall and bounce
  const parts=dt=>{ for(let i=PL.length-1;i>=0;i--){ const p=PL[i], q=p.q; if(q.t>=q.life){ PL.splice(i,1); continue; } const v=Math.hypot(q.vx,q.vy,q.vz);
      if(p.ph===0){ p.s+=v*dt; const gy=SHARED.groundY?SHARED.groundY(q.x,q.z):-1e9, low=q.y<gy+.03*M;
        if(p.s>=p.L||low||(p.kind===3&&q.t>FUEL*2)){ p.ph=1; if(low)q.y=gy+.03*M; const s=v*(p.kind===3?.16:.1);
          if(p.kind===8){ q.vy=Math.abs(q.vy)*.25; q.vx*=.35; q.vz*=.35; } else { const a=rnd()*6.28; q.vx=Math.cos(a)*s+q.vx*.08; q.vz=Math.sin(a)*s+q.vz*.08; q.vy=p.kind===3?(.4+rnd()*.8)*M:.05*M; } continue; }
        if(p.kind===3){ q.vy-=G*dt; const k=1/(1+KD*v*dt); q.vx*=k; q.vy*=k; q.vz*=k; } else if(p.kind===7){ const k=Math.max(0,1-.6*dt); q.vx*=k; q.vy=q.vy*k-.4*M*dt; q.vz*=k; } continue; }
      if(p.kind===8){ const gy=SHARED.groundY?SHARED.groundY(q.x,q.z):-1e9; if(q.y<gy+.02*M&&q.vy<0){ q.y=gy+.02*M; q.vy=-q.vy*.3; q.vx*=.5; q.vz*=.5; } continue; }
      const k=Math.max(0,1-(p.kind===3?3:2)*dt); q.vx*=k; q.vz*=k; q.vy=q.vy*k+(p.kind===3?4.5*M:-.5*M)*dt; } };

  /* ---------- what a stream does where it lands and to whom it touches ---------- */
  const out=()=>SHARED.LVL==='up'&&!ROOMS.cur;
  const land=(S,dt,mine)=>{ const E=S.end; if(!E)return; const f=S.k==='f', P=S.P, B=P.length>1?P[P.length-2]:S.tip, bx=E.x-B.x, bz=E.z-B.z, bl=Math.hypot(bx,bz)||1;
    if(f){ if(S.what==='ice'){ ICE.melt(E.x,E.z,dt); if((S.lT-=dt)<=0){ S.lT=.25; FLAME.puff(E.x,E.y+.1*M,E.z,1,6); } return; }
      if(S.what==='water'){ if((S.lT-=dt)<=0){ S.lT=.2; FLAME.puff(E.x,E.y+.1*M,E.z,1.2,6); } return; }
      frostOff(E.x,E.z,dt); if((S.lT-=dt)>0)return; S.lT=.45; for(let k=0;k<3;k++)FLAME.ember(E.x,E.y+.05*M,E.z,1.4); if(rnd()<.6)FLAME.puff(E.x,E.y+.4*M,E.z,1.2,5);
      if(out()&&BLAZE.start){ const x=E.x-bx/bl*.25*M, z=E.z-bz/bl*.25*M, burns=BLAZE.burnable(x,z), b=BLAZE.start(x,z,true); if(b&&!burns){ b.life=12+rnd()*10; b.sp=1e9; } } return; }
    for(const b of BLAZE.F)if(Math.hypot(b.x-E.x,b.z-E.z)<1.4*M||along(S,b.x,b.y+.3*M,b.z)<.7*M)b.wet+=dt*2.6;
    if(S.what==='water'||S.what==='ice'){ if(out())ICE.grow(E.x,E.y,E.z,dt); return; }
    if(S.what==='ground'&&(S.lT-=dt)<=0){ S.lT=.3; frostAt(E.x,E.y,E.z); } };
  const hits=(S,dt,L,mine)=>{ for(const b of L){ if(b.id===S.id||b.id==='me'&&mine||!touches(S,b))continue; const e=fx(b.id);
      if(S.k==='f'){ e.ice=Math.max(0,e.ice-dt*2); e.cold=0; if(b.id!=='me')e.fire=Math.max(e.fire,3); }
      else{ e.fire=0; if(b.id!=='me'){ e.cold+=dt; if(e.cold>=.9&&e.ice<=0){ e.ice=4; e.cold=-2; } else if(e.ice>0)e.ice=Math.min(5,e.ice+dt*.3); } }
      if(mine&&b.o){ const t=now(); if(t-(S.zT[b.id]||0)>300){ S.zT[b.id]=t; ONLINE.send({t:'zap',to:b.id,k:S.k}); } } } };
  const FL=new THREE.PointLight(new THREE.Color(1,.55,.2),0,8*M,1.6); FL.userData.fire=1; scene.add(FL);
  const firing=()=>{ const id=WIELD.on, g=WIELD.held&&WIELD.held(); if((id!=='flamer'&&id!=='frost')||!g||!g.visible||VIT.dead||VIT.out>0||RAG.on||SHARED.frozen>0)return ''; if(VR.on&&JET.burst<=0)JET.hold=false; return JET.hold||JET.burst>0?(id==='flamer'?'f':'i'):''; };
  const pilots=new Map();
  SYS.add('life',dt=>{ dt=Math.min(dt||0,.25); JET.burst=Math.max(0,JET.burst-dt); selfTick(dt);
    const k=firing(); { let S=JET.S.get('me'); if(k){ if(!S||S.k!==k){ if(S)drop(S); JET.S.set('me',S=mk('me',k)); } S.at=now(); } else if(S)drop(S); } JET.on=k;
    if(ONLINE.on&&(k!==JET.sent||k&&now()-JET.sentT>160)){ const S=JET.S.get('me'), r=v=>Math.round(v*100)/100; JET.sent=k; JET.sentT=now(); ONLINE.send(k&&S?{t:'jet',k,v:[r(S.dir.x),r(S.dir.y),r(S.dir.z)]}:{t:'jet',k}); }
    for(const g of HELD){ if(g.kind!=='f')continue; let s=pilots.get(g); const on=g.visible&&!!g.parent; if(on&&!s){ s=FLAME.add({kind:'candle',name:'pilot light',x:0,y:0,z:0,w:.03*M,h:.06*M}); pilots.set(g,s); }
      if(s){ s.on=on; if(on){ p3.copy(g.tipL).applyMatrix4(g.matrix); s.x=p3.x; s.y=p3.y-.02*M; s.z=p3.z; s.a.position.copy(p3); } } }
    const L=JET.S.size||JET.E.size?bodies():null; let lb=(30*M)**2, lp=null;
    for(const [id,S] of JET.S){ const mine=id==='me', g=mine?WIELD.held():WIELD.theirG&&WIELD.theirG(id);
      if(!mine&&now()-S.at>2500){ drop(S); continue; } if(!tipOf(g,S)){ if(S.bm)S.bm.visible=false; continue; } if(mine)aimMine(S); else if(S.rv)S.dir.copy(S.rv);
      if((S.cT-=dt)<=0||!S.P.length){ S.cT=.12; cast(S); } else S.P[0].copy(S.tip);
      if(S.k==='i'){ const b=S.bm||(S.bm=beam()); b.visible=true; b.position.copy(S.tip); b.quaternion.setFromUnitVectors(UP,S.dir); b.scale.set(.045*M,Math.max(.01,S.len),.045*M); } else if(S.bm){ S.bm.visible=false; S.bm=null; }
      if(S.k==='f'){ const d=(S.tip.x-pos.x)**2+(S.tip.z-pos.z)**2; if(d<lb){ lb=d; lp=S.P[Math.floor(S.P.length/2)]||S.tip; } }
      emit(S,dt); land(S,dt,mine); if(L)hits(S,dt,L,mine); }
    if(lp){ FL.position.copy(lp); FL.position.y+=.3*M; FL.intensity=14*FLAME.flick(3); } else FL.intensity=0; uT.value=now()/1000%1000;
    parts(dt); if(L)bodyFx(dt,L); iceTick(dt); frostTick(dt); },'146hb-jets');
  window.JETDBG=()=>({on:JET.on,streams:[...JET.S].map(([id,S])=>({id,k:S.k,len:+(S.len/M).toFixed(2),what:S.what,tip:[S.tip.x,S.tip.y,S.tip.z].map(v=>+v.toFixed(2)),dir:[S.dir.x,S.dir.y,S.dir.z].map(v=>+v.toFixed(2)),near:bodies().map(b=>[b.id,+(along(S,b.x,b.y+M,b.z)/M).toFixed(2),+b.x.toFixed(1),+b.y.toFixed(1),+b.z.toFixed(1)])})),parts:PL.length,ice:IL.map(c=>({x:c.x,z:c.z,y:c.y,r:c.r/M})),frost:FM.length,frozen:SHARED.frozen,burn:JET.burnT,fx:[...JET.E].map(([id,e])=>({id,fire:e.fire,ice:e.ice})),M}); }
