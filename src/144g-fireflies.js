// FIREFLIES: blinking swarms by the park's pond and plants at night; double click one to cup a firefly and let it go, or fill an empty butterfly jar that glows while you carry it and lets them out at dawn.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, PARK, POND, pos, UI, W3, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
import {WILD} from './144f-wild.js';
{ const T=TILE, WU=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), KEY='fireflies', JARS=['jar_s','jar_m','jar_l'], N=10, rnd=(a,b)=>a+Math.random()*(b-a);
  const S={v:1,jar:null}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} };
  WILD.add('firefly',['FIREFLY','Photinus pyralis','ento',10,0]);
  FORAGE.add({names:{jar_fly:'A JAR OF FIREFLIES'}});
  const out=()=>CLOCK.dark()&&!(WX.now&&(WX.now.rain>.3||WX.now.wind>.8));
  let SW=null, pts=null; const glowMat=()=>new THREE.PointsMaterial({size:5,sizeAttenuation:false,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const build=()=>{ const P=POND; if(!P||!P.ready||!P.c||!PARK.ready)return false; const C=[];
    for(let i=0;i<3;i++){ const a=i*2.1+.4, r=P.r+rnd(1,3.5)*WU; C.push({x:P.c.x+Math.cos(a)*r,z:P.c.z+Math.sin(a)*r}); }
    const U=(PARK.under&&PARK.under.userData.items||[]).filter(o=>o.top!=null); for(let i=0;i<3&&U.length;i++){ const o=U[Math.floor((i*.37+.11)*U.length)%U.length]; C.push({x:o.x+rnd(-1,1)*WU,z:o.z+rnd(-1,1)*WU}); }
    const G=new THREE.BufferGeometry(), n=C.length*N; G.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3)); G.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));
    pts=new THREE.Points(G,glowMat()); pts.frustumCulled=false; pts.raycast=()=>{}; MAPG.park.add(pts);
    const HB=new THREE.BoxGeometry(2.2*T,1.2*T,2.2*T), HM=new THREE.MeshBasicMaterial({visible:false});
    SW=C.map((c,j)=>{ '@later'; const y=SHARED.groundY?SHARED.groundY(c.x,c.z):0, hb=new THREE.Mesh(HB,HM); hb.position.set(c.x,y+.6*WU,c.z); MAPG.park.add(hb);
      const sw={x:c.x,z:c.z,y,hb,f:[...Array(N)].map(()=>({a:Math.random()*6.3,b:Math.random()*6.3,r:rnd(.3,2)*WU,h:rnd(.3,1.8)*WU,s:rnd(.2,.5),ph:Math.random()*6,next:rnd(0,5),on:0}))};
      UI.thing({name:'FIREFLIES',obj:hb,reach:2.5*T,near:3.5*T,tall:.6*T,act:()=>catchOne(sw)}); return sw; }); return true; };
  const catchOne=sw=>{ '@later'; if(!out())return say('NO FIREFLIES NOW. THEY COME OUT AT NIGHT.','#c8a090'); if(Math.hypot(sw.x-pos.x,sw.z-pos.z)>3.5*T)return say('GO NEARER.','#c8a090');
    const first=!WILD.seen('firefly'), jar=JARS.find(j=>FORAGE.has(j));
    if(!FORAGE.use('ento',-15,40))return say('IT BLINKS OUT AND IS GONE FROM YOUR HANDS.','#c8a090');
    if(jar&&!FORAGE.has('jar_fly')){ FORAGE.take(jar,1); FORAGE.give('jar_fly',1); S.jar=jar; save(); say('A FEW FIREFLIES GO IN YOUR JAR. IT GLOWS. THEY GO FREE AT DAWN, OR WHEN YOU OPEN IT.','#e8f08a'); }
    else say('YOU CUP A FIREFLY IN YOUR HANDS. IT BLINKS, AND YOU LET IT GO.','#e8f08a');
    if(first)WILD.log('firefly'); FORAGE.draw&&FORAGE.draw(); };
  const free=quiet=>{ if(!FORAGE.has('jar_fly'))return; FORAGE.take('jar_fly',FORAGE.has('jar_fly')); FORAGE.give(S.jar||'jar_s',1); S.jar=null; save(); if(!quiet)say('YOU OPEN THE JAR. THE FIREFLIES DRIFT OUT, BLINKING.','#e8f08a'); FORAGE.draw&&FORAGE.draw(); };
  FORAGE.ROWB.push(id=>id==='jar_fly'?[['LET THEM GO','fflyfree']]:[]); FORAGE.ACT.fflyfree=()=>free();
  let lamp=null; const L0=new THREE.Vector3(), DB=new THREE.Vector2();
  // a glow d metres across seen from the camera, in screen pixels (never more than mx, never under one): small from far off or high up
  const px=(d,x,y,z,mx)=>{ const c=SHARED.cam; if(!c)return mx; renderer.getDrawingBufferSize(DB); const ppu=c.isOrthographicCamera?DB.y*c.zoom/(c.top-c.bottom):DB.y/(2*Math.tan(c.fov*Math.PI/360)*Math.max(.01,Math.hypot(c.position.x-x,c.position.y-y,c.position.z-z))); px.last=[DB.y,+ppu.toFixed(1)]; return Math.max(1,Math.min(mx,d*WU*ppu)); };
  let fa=0, t=0; SYS.add('life',dt=>{ if(!dt)return; t+=dt; const has=FORAGE.has('jar_fly')>0, dark=CLOCK.dark();
    if(has&&!dark){ free(true); say('THE SUN COMES UP. YOUR FIREFLIES SLIP OUT OF THE JAR.','#e8f08a'); }
    if(has&&dark){ if(!lamp){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3)); g.setAttribute('color',new THREE.Float32BufferAttribute([1,1,.5],3)); lamp=new THREE.Points(g,glowMat()); lamp.material.size=9; lamp.frustumCulled=false; lamp.raycast=()=>{}; scene.add(lamp); }
      const p=W3.group.position, hd=SHARED.heading||0; lamp.position.set(p.x+Math.cos(hd)*.25*WU,p.y+.85*WU,p.z-Math.sin(hd)*.25*WU); lamp.visible=true; lamp.material.opacity=.75+.25*Math.sin(t*3.1); lamp.material.size=px(.08,lamp.position.x,lamp.position.y,lamp.position.z,9); }
    else if(lamp)lamp.visible=false;
    if(!SW&&!build())return; const show=PARK.in&&SHARED.LVL==='up'&&out(); pts.visible=show; for(const sw of SW)sw.hb.visible=show; if(!show)return; if((fa+=dt)<1/30)return; const k=fa; fa=0; { let bd=1e18, b=SW[0]; for(const sw of SW){ const d=(sw.x-pos.x)**2+(sw.z-pos.z)**2; if(d<bd){ bd=d; b=sw; } } pts.material.size=px(.03,b.x,b.y+WU,b.z,5); }
    const P=pts.geometry.attributes.position, C=pts.geometry.attributes.color; let i=0;
    for(const sw of SW)for(const f of sw.f){ f.a+=k*f.s; f.b+=k*f.s*.7; const x=sw.x+Math.cos(f.a)*f.r, z=sw.z+Math.sin(f.b)*f.r, y=sw.y+f.h+Math.sin(f.a*1.3+f.ph)*.25*WU;
      if((f.next-=k)<=0){ f.on=.45; f.next=rnd(2.5,6); } const v=f.on>0?Math.sin((f.on-=k)/.45*Math.PI)*.95+.05:.04; P.setXYZ(i,x,y,z); C.setXYZ(i,.85*v,1*v,.35*v); i++; }
    P.needsUpdate=true; C.needsUpdate=true; },'144g-fireflies');
  window.FFLYDBG=()=>({built:!!SW,swarms:SW?SW.length:0,shown:!!(pts&&pts.visible),jar:FORAGE.has('jar_fly'),lamp:!!(lamp&&lamp.visible),size:pts&&+pts.material.size.toFixed(2),ppu:px.last});
  FORAGE.HELP.push('FIREFLIES: by the park pond and its plants at night. Double click to cup one and let it go; with an empty butterfly jar you carry a glowing jar that you open, or that opens itself at dawn.'); }
