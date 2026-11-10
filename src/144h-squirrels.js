// SQUIRRELS: grey squirrels by day in the park, each about its home tree: they bound over the grass, stop, bury acorns and run up the trunk when you come near; double click one to watch it for your journal, and dig up a cache they left for a few acorns.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, PARK, pos, UI, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
import {WILD} from './144f-wild.js';
{ const T=TILE, WU=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), rnd=(a,b)=>a+Math.random()*(b-a), NS=6, MAXC=6;
  WILD.add('squirrel',['EASTERN GREY SQUIRREL','Sciurus carolinensis','forage',15,0]);
  FORAGE.add({names:{nut_acorn:'ACORNS (A HANDFUL)'},prices:{nut_acorn:2}}); FORAGE.sell('nut_acorn');
  const geo=(()=>{ let G=null; return ()=>{ '@later'; if(G)return G; const P=[], C=[], put=(g,m,c)=>{ g=g.toNonIndexed(); g.applyMatrix4(m); const a=g.attributes.position.array; for(let i=0;i<a.length;i++)P.push(a[i]); for(let i=0;i<a.length/3;i++)C.push(...c); };
    const M=(x,y,z,sx=1,sy=1,sz=1,rx=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,0,0)),new THREE.Vector3(sx,sy,sz)), g1=[.52,.5,.48], g2=[.66,.63,.6], b=[.86,.82,.76], e=[.08,.07,.07];
    put(new THREE.SphereGeometry(1,8,6),M(0,.06,0,.045,.05,.09),g1); put(new THREE.SphereGeometry(1,7,5),M(0,.05,.03,.035,.035,.05),b);
    put(new THREE.SphereGeometry(1,7,5),M(0,.1,.085,.032,.032,.038),g1); put(new THREE.ConeGeometry(.012,.03,4),M(.018,.135,.08),g2); put(new THREE.ConeGeometry(.012,.03,4),M(-.018,.135,.08),g2);
    put(new THREE.SphereGeometry(1,4,3),M(.022,.108,.112,.006,.006,.006),e); put(new THREE.SphereGeometry(1,4,3),M(-.022,.108,.112,.006,.006,.006),e);
    put(new THREE.SphereGeometry(1,7,6),M(0,.1,-.11,.035,.09,.04,-.35),g2); put(new THREE.SphereGeometry(1,7,6),M(0,.19,-.08,.035,.05,.04,.5),g2);
    G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.Float32BufferAttribute(P.map(v=>v*WU),3)); G.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); G.computeVertexNormals(); return G; }; })();
  const MAT=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}), HB=new THREE.BoxGeometry(.5*T,.4*T,.5*T), HM=new THREE.MeshBasicMaterial({visible:false});
  const MOUND=new THREE.SphereGeometry(.07*WU,7,4,0,Math.PI*2,0,Math.PI/2), MM=new THREE.MeshLambertMaterial({color:0x5a4430,flatShading:true});
  const out=()=>!CLOCK.dark()&&!(WX.now&&(WX.now.rain>.4||WX.now.snow>.3));
  let SQ=null; const CACHES=[];
  const gy=(x,z)=>SHARED.groundY?SHARED.groundY(x,z):0;
  const build=()=>{ if(!PARK.ready||!PARK.treeItems)return false; const TR=PARK.treeItems().filter(t=>t.top-t.y>3*WU&&PARK.within&&PARK.within(t.x,t.z)); if(!TR.length)return false;
    SQ=[]; for(let i=0;i<NS;i++){ const tr=TR[Math.floor((i*.618+.13)%1*TR.length)], g=new THREE.Group(), me=new THREE.Mesh(geo(),MAT); me.castShadow=true; g.add(me); const hb=new THREE.Mesh(HB,HM); hb.position.y=.1*T; g.add(hb); MAPG.park.add(g);
      const q={key:'squirrel',tr,g,me,st:{x:tr.x+rnd(1,4)*WU,z:tr.z+rnd(-3,3)*WU},body:me,mode:'forage',wait:rnd(0,3),to:null,u:0,h:Math.random()*6,y:0,ph:0};
      q.th={name:'A GREY SQUIRREL',obj:hb,reach:2.6*T,near:3*T,tall:.3*T,act:()=>WILD.watch(q)}; UI.thing(q.th); SQ.push(q); } return true; };
  const trunk=q=>{ const r=Math.min(q.tr.tr||.25*WU,.6*WU)+.03*WU, a=Math.atan2(q.st.z-q.tr.z,q.st.x-q.tr.x); return {x:q.tr.x+Math.cos(a)*r,z:q.tr.z+Math.sin(a)*r}; };
  const cache=q=>{ if(CACHES.length>=MAXC)return; const x=q.st.x, z=q.st.z, me=new THREE.Mesh(MOUND,MM); me.position.set(x,gy(x,z),z); MAPG.park.add(me);
    const c={x,z,me}; c.th={name:"A SQUIRREL'S CACHE",obj:me,reach:1.6*T,near:2.5*T,tall:.15*T,act:()=>dig(c)}; UI.thing(c.th); CACHES.push(c); };
  const dig=c=>{ '@later'; if(Math.hypot(c.x-pos.x,c.z-pos.z)>2*T)return say('GO NEARER.','#c8a090'); MAPG.park.remove(c.me); CACHES.splice(CACHES.indexOf(c),1); const j=UI.things.indexOf(c.th); if(j>=0)UI.things.splice(j,1);
    if(FORAGE.use('forage',0,40)){ FORAGE.give('nut_acorn',1); say('ACORNS A SQUIRREL BURIED. YOU TAKE A HANDFUL AND LEAVE THE REST.','#e8d0a0'); } else say('YOU DIG, BUT THE SQUIRREL HAS ALREADY MOVED THEM.','#c8a090'); FORAGE.draw&&FORAGE.draw(); };
  let t=0; SYS.add('life',dt=>{ if(!dt)return; if(!SQ&&!build())return; const show=PARK.in&&SHARED.LVL==='up'&&out(); t+=dt;
    for(const q of SQ){ q.g.visible=show; if(!show)continue; const d=Math.hypot(q.st.x-pos.x,q.st.z-pos.z); if(d>30*T)continue;
      if(q.mode!=='tree'&&q.mode!=='flee'&&d<3*WU*(1-Math.min(.6,FORAGE.sk('forage')/150))&&!(WILD.watching()&&d>1.2*WU)){ q.mode='flee'; q.to=trunk(q); }
      if(q.mode==='tree'){ q.y=Math.min(q.y+dt*1.5*WU,2.6*WU); if((q.wait-=dt)<=0&&d>5*WU){ q.y=Math.max(0,q.y-dt*3*WU); if(q.y<=0){ q.mode='forage'; q.wait=rnd(1,3); } } }
      else if(q.to){ const ex=q.to.x-q.st.x, ez=q.to.z-q.st.z, L=Math.hypot(ex,ez), v=(q.mode==='flee'?4:1.6)*WU*dt; q.h=Math.atan2(ex,ez);
        if(L<=v){ q.st.x=q.to.x; q.st.z=q.to.z; q.to=null; if(q.mode==='flee'){ q.mode='tree'; q.wait=rnd(10,20); } else { q.wait=rnd(.5,3); if(Math.random()<.3){ q.mode='dig'; q.wait=2; } } }
        else { q.st.x+=ex/L*v; q.st.z+=ez/L*v; q.ph+=dt*9; } }
      else if(q.mode==='dig'){ if((q.wait-=dt)<=0){ cache(q); q.mode='forage'; q.wait=rnd(1,3); } }
      else if((q.wait-=dt)<=0){ const a=Math.random()*Math.PI*2, r=rnd(1,5)*WU; q.to={x:q.tr.x+Math.cos(a)*r,z:q.tr.z+Math.sin(a)*r}; }
      const hop=q.to?Math.abs(Math.sin(q.ph))*.06*WU:0, climb=q.mode==='tree'||q.y>0; q.g.position.set(q.st.x,gy(q.st.x,q.st.z)+hop+q.y,q.st.z); q.g.rotation.set(climb?-Math.PI/2:q.mode==='dig'?.5:0,climb?Math.atan2(q.tr.x-q.st.x,q.tr.z-q.st.z):q.h,0,'YXZ'); } },'144h-squirrels');
  window.SQDBG2=()=>({built:!!SQ,n:SQ?SQ.length:0,modes:SQ?SQ.map(q=>q.mode):[],caches:CACHES.length,shown:!!(SQ&&SQ[0]&&SQ[0].g.visible)});
  FORAGE.HELP.push('SQUIRRELS: grey squirrels about the park trees by day. Keep back or they run up their tree; double click one to watch it; a little mound where one dug is its cache of acorns.'); }
