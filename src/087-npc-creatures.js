// THE CREATURES: the park's wild things at their real sizes, each living as its kind does (wasps from a nest to the flowers, spiders in webs, bats at dusk, frogs by the pond, a basking snake, rats along walls at night); CREATS lists them.
import {SHARED, THREE} from './003-shx.js';
import {SKIN} from './003a-skin.js';
import {BINS, CLOCK, FLORA, FLOW, PARK, POND, PONDS, SFX, VIS, WALKS, WX} from './003b-systems.js';
import {MAPG, MODS, SOL, SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {makeNPC, STHOLE} from './076-npc-map.js';
import {CREATURES, CREATURESREADY} from './086-npc-fox.js';
import {FARM} from './086a-farm.js';
const CREATS=[]; window.CREATS=CREATS;
{ const C=CREATURES, geomOf=M=>SKIN.geom(M), rigOf=R=>SKIN.rig(R), clipsOf=D=>SKIN.clips(D.clips,D.rig.names);
  const M=SHARED.BOD.MAP, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, PARKL={x0:X(PARK.x0+PARK.ox+2.2),x1:X(PARK.x1+PARK.ox-2.2),z0:Z(PARK.y0+PARK.oy+2.2),z1:Z(PARK.y1+PARK.oy-2.2)}, ALL={x0:X(M.x0+2),x1:X(M.x1-2),z0:Z(-76.3),z1:Z(PARK.y1+PARK.oy-1)},
    HOLE=STHOLE, FREE=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R)&&!FOUNT.wet(x,z,R)&&!PONDS.wet(x,z,R);
  const FL=()=>FLORA&&FLORA.cover?FLORA:{bushes:[],beds:[],cover:()=>null}, WU=TILE/.84, rnd=(a,b)=>a+Math.random()*(b-a), WXN=()=>WX&&WX.now||{}, inL=(L,x,z)=>x>L.x0&&x<L.x1&&z>L.z0&&z<L.z1;
  const OUT={always:()=>true,night:()=>CLOCK.dark(),bat:()=>CLOCK.dark()&&!(WXN().rain>.4||WXN().wind>.8),
    wasp:()=>!CLOCK.dark()&&!(WXN().rain>.2||WXN().snow>.1||WXN().wind>.7),snake:()=>!CLOCK.dark()&&!(WXN().rain>.1||WXN().snow>.05)};
  const KIND={Rat:{walk:'Rat_Walk',run:'Rat_Run',idle:'Rat_Idle',pace:3,lane:ALL,beh:'rat',out:OUT.night,flee:3,dart:2},Frog:{walk:'Frog_Jump',idle:'Frog_Idle',pace:2.4,lane:PARKL,hop:[.33,.78],beh:'frog',flee:1.6},Slime:{walk:'Slime_Walk',idle:'Slime_Idle',pace:1.2,lane:PARKL,turn:-Math.PI/2,big:1},
    Snake:{walk:'Snake_Walk',idle:'Snake_Idle',pace:2,lane:PARKL,beh:'snake',out:OUT.snake,flee:2.5},Spider:{walk:'Spider_Walk',idle:'Spider_Idle',pace:3,lane:PARKL,beh:'spider',once:['Spider_Attack','Spider_Hit','Spider_Death']},
    Bat:{walk:'Bat_Flying',idle:'Bat_Flying',pace:3,lane:PARKL,beh:'bat',fly:1,out:OUT.bat,v:5},Wasp:{walk:'Wasp_Flying',idle:'Wasp_Flying',pace:3,lane:PARKL,beh:'wasp',fly:1,out:OUT.wasp,v:2.5}};
  const PAINT=(()=>{ const hh=(x,y,z)=>{ const v=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return v-Math.floor(v); }, vn=(x,y,z)=>{ const i=Math.floor(x), j=Math.floor(y), k=Math.floor(z), f=x-i, g=y-j, e=z-k, s=t=>t*t*(3-2*t), u=s(f), v=s(g), w=s(e), L=(a,b,t)=>a+(b-a)*t;
      return L(L(L(hh(i,j,k),hh(i+1,j,k),u),L(hh(i,j+1,k),hh(i+1,j+1,k),u),v),L(L(hh(i,j,k+1),hh(i+1,j,k+1),u),L(hh(i,j+1,k+1),hh(i+1,j+1,k+1),u),v),w); };
    const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
    const K={
      Spider:(q,n,c,r,P)=>{ if(r===1)return c; const d=Math.hypot(q[0]-.5,q[2]-.48), body=d<.2&&q[1]>.25, abd=body&&q[2]<.45;
        let o=[58,44,34]; if(!body){ o=Math.floor(d*30+vn(P[0]*2,0,P[2]*2)*.6)%3===0?[132,100,66]:[50,38,30]; }
        else if(abd&&n[1]>.2){ const ch=Math.abs(q[0]-.5)*6+q[2]*10; if((ch%1)<.28&&Math.abs(q[0]-.5)<.09)o=[168,136,92]; else if(Math.abs(q[0]-.5)<.02)o=[118,90,62]; }
        return mul(o,.86+.28*vn(P[0]*6,P[1]*6,P[2]*6)); },
      Frog:(q,n,c,r,P)=>{ if(r>=2)return c; const belly=n[1]<-.25||q[1]<.2;
        if(r===1||belly)return mul(mix([226,214,160],[200,190,128],vn(P[0]*4,P[1]*4,P[2]*4)),1);
        const b=vn(P[0]*2.2+3,P[1]*2.2,P[2]*2.2), side=n[1]<.35; let o=b>.62?[40,78,34]:b>.55?[56,96,42]:[92,146,58]; if(side)o=mix(o,[150,160,84],.35);
        if(Math.abs(q[0]-.5)<.03&&n[1]>.5)o=[150,178,90]; return mul(o,.9+.2*vn(P[0]*9,P[1]*9,P[2]*9)); },
      Snake:(q,n,c,r,P)=>{ if(r>=2&&r!==3)return c; if(r===3)return c; const belly=n[1]<-.3;
        if(belly)return [214,200,150]; const a=P[1]*3.2+Math.atan2(P[2]-.3,P[0])*.8, d=Math.abs((a%1+1)%1-.5)*2, l=Math.abs(n[0])*1.1;
        const dm=d+l*.6; return dm<.55?[52,66,36]:dm<.7?[176,160,96]:mul([96,120,62],.9+.2*vn(P[0]*5,P[1]*5,P[2]*5)); },
      Bat:(q,n,c,r,P)=>{ if(r>=2)return c; const wing=Math.abs(q[0]-.5)>.18;
        if(wing){ const v=Math.abs(Math.sin(Math.atan2(P[1]-3,P[0])*7))<.14; return v?[24,18,28]:mix([62,44,58],[86,62,70],vn(P[0]*3,P[1]*3,P[2]*3)); }
        return r===1?mix([140,104,70],[170,130,84],vn(P[0]*6,P[1]*6,P[2]*6)):mix([60,44,40],[84,62,52],vn(P[0]*6,P[1]*6,P[2]*6)); },
      Slime:(q,n,c,r,P)=>{ if(r===1)return c; const b=vn(P[0]*3,P[1]*3,P[2]*3); let o=mix([70,150,64],[136,214,104],q[1]); if(b>.68)o=[176,236,150]; if(n[1]>.75&&q[1]>.8)o=[214,250,196]; return o; } };
    return (key,g)=>{ const f=K[key]; if(!f)return g; g=g.toNonIndexed(); const p=g.attributes.position.array, c=g.attributes.color.array, R=g.attributes.reg.array;
      let lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let i=0;i<p.length;i+=3)for(let j=0;j<3;j++){ lo[j]=Math.min(lo[j],p[i+j]); hi[j]=Math.max(hi[j],p[i+j]); }
      const A=new THREE.Vector3(), B=new THREE.Vector3(), C_=new THREE.Vector3();
      for(let t=0;t<p.length/9;t++){ const i=t*9; A.fromArray(p,i); B.fromArray(p,i+3); C_.fromArray(p,i+6); const P=[(A.x+B.x+C_.x)/3,(A.y+B.y+C_.y)/3,(A.z+B.z+C_.z)/3], N=B.clone().sub(A).cross(C_.clone().sub(A)).normalize();
        const q=[0,1,2].map(j=>(P[j]-lo[j])/Math.max(1e-6,hi[j]-lo[j])), col=[c[i],c[i+1],c[i+2]].map(v=>v*(c instanceof Uint8Array?1:255)), o=f(q,[N.x,N.y,N.z],col,Math.round(R[t*3]),P);
        const dep=(.68+.32*Math.min(1,q[1]*1.6))*(N.y>.5?1.06:N.y<-.3?.78:1);
        for(let k=0;k<3;k++)for(let j=0;j<3;j++){ const v=Math.max(0,Math.min(255,o[j]*dep)); c[i+k*3+j]=c instanceof Uint8Array?Math.round(v):v/255; } }
      g.attributes.color.needsUpdate=true; return g; }; })();
  const CH=[];   // (the park's own creatures are pets at the pet store; the subway's rats stay)
  for(const r of SHARED.METRO.rats){ const L=r.lane; CH.push(['Rat','RAT',.08,null,.9,0,{lv:'down',group:'down',lane:L,free:(x,z,R)=>x>L.x0&&x<L.x1&&z>L.z0&&z<L.z1&&!SOL.down.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R),ground:(x,z)=>MODS.station.ground(x,z),x:r.x,z:r.z,out:OUT.always}]); }
  const SHARE={nest:null,webs:null,beds:null};
  const itemsOf=m=>m&&m.userData&&m.userData.items||[], plants=()=>itemsOf(PARK.under).concat(FL().bushes.map(b=>({x:b.x,y:b.y,z:b.z,top:b.y+b.h,r:b.r}))).filter(o=>o.top!=null&&inL(PARKL,o.x,o.z));
  const parkBushes=()=>SHARE.bush||(SHARE.bush=(L=>L.length?L:null)(plants().filter(o=>o.top-o.y>.35*WU&&o.top-o.y<2.5*WU).map(o=>({x:o.x,y:o.y,z:o.z,h:o.top-o.y,r:Math.max(.15*WU,Math.min(o.r||.4*WU,1.2*WU))}))))||[];
  const coverOf=(x,z,px,pz)=>{ let best=null, bd=1e9; for(const b of parkBushes()){ const d=Math.hypot(b.x-x,b.z-z); if(d>10*WU)continue; const dp=Math.hypot(b.x-px,b.z-pz); if(dp<Math.hypot(x-px,z-pz))continue; if(d<bd){ bd=d; best=b; } } return best; };
  const nestOf=()=>{ '@later'; if(SHARE.nest)return SHARE.nest; const B=(PARK.treeItems?PARK.treeItems():[]).filter(t=>inL(PARKL,t.x,t.z)&&t.top-t.y>3*WU); if(!B.length)return null; const b=B[Math.floor(B.length*.37)];
    const o=Math.min(b.tr||.25*WU,.6*WU)+.2*WU, n=SHARE.nest={x:b.x+o*.8,z:b.z+o*.6,y:b.y+Math.min(2.3*WU,(b.top-b.y)*.4),tree:b}; CREATS.nest=n;
    const pts=[[0,-.13],[.05,-.11],[.085,-.06],[.095,0],[.08,.06],[.05,.1],[.02,.12],[.015,.15]].map(([r,y])=>new THREE.Vector2(r*WU,y*WU)), G=new THREE.LatheGeometry(pts,9), c=[];
    for(let i=0;i<G.attributes.position.count;i++){ const y=G.attributes.position.getY(i)/WU, k=.82+.18*Math.sin(y*90); c.push(.62*k,.58*k,.5*k); } G.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
    const me=new THREE.Mesh(G,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})); me.position.set(n.x,n.y,n.z); me.castShadow=true; MAPG.park.add(me); n.mesh=me; return n; };
  const foodOf=n=>{ '@later'; if(!SHARE.beds)SHARE.beds=FL().beds.filter(d=>d.p&&d.p.length&&Math.hypot(d.x-n.x,d.z-n.z)<30*WU); const L=SHARE.beds;
    if(L.length){ const d=L[Math.floor(Math.random()*L.length)], p=d.p[Math.floor(Math.random()*d.p.length)]; return {x:p[0],y:p[1],z:p[2]}; }
    const B=parkBushes().filter(b=>Math.hypot(b.x-n.x,b.z-n.z)<30*WU), b=B[Math.floor(Math.random()*B.length)]; return b?{x:b.x,y:b.y+b.h,z:b.z}:{x:n.x+rnd(-3,3)*WU,y:n.y-.5*WU,z:n.z+rnd(-3,3)*WU}; };
  const webGeo=(()=>{ let G=null; return ()=>{ '@later'; if(G)return G; const v=[], R=.16*WU, S=9; for(let i=0;i<S;i++){ const a=i/S*Math.PI*2; v.push(0,0,0,Math.cos(a)*R,Math.sin(a)*R,0); }
    for(let r=1;r<=7;r++){ const rr=R*r/7.4; for(let i=0;i<S;i++){ const a=i/S*Math.PI*2, b=(i+1)/S*Math.PI*2; v.push(Math.cos(a)*rr,Math.sin(a)*rr,0,Math.cos(b)*rr,Math.sin(b)*rr,0); } }
    G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); return G; }; })();
  const webMat=new THREE.LineBasicMaterial({color:0xe8ecf0,transparent:true,opacity:.35,depthWrite:false});
  const fliers=new Set(['wasp','bat']);
  const BEH={
    wasp:(dt,you,st,N,S,K)=>{ '@later'; const n=S.set&&nestOf(); if(!n)return; const out=K.out(), at=(x,z)=>Math.hypot(st.x-x,st.z-z)<.08*WU;
      if(S.mode==='in'){ N.body.visible=false; st.to=null; if((S.c-=dt)<=0&&out){ S.mode='go'; S.food=foodOf(n); S.y=n.y-N.ground(n.x,n.z); N.body.visible=true; } return; }
      if(!out&&S.mode!=='home'){ S.mode='home'; st.to=null; }
      if(S.mode==='go'){ st.v=K.v*WU; S.hy=Math.max(.8*WU,S.food.y-N.ground(st.x,st.z)+.4*WU); if(!st.to)st.to={x:S.food.x,z:S.food.z}; if(at(S.food.x,S.food.z)){ S.mode='hover'; S.c=rnd(3,10); S.d=0; st.to=null; } }
      else if(S.mode==='hover'){ st.v=.6*WU; if((S.d-=dt)<=0){ S.d=rnd(.25,.9); st.to={x:S.food.x+rnd(-.15,.15)*WU,z:S.food.z+rnd(-.15,.15)*WU}; S.hy=S.food.y-N.ground(S.food.x,S.food.z)+rnd(.02,.18)*WU; }
        if((S.c-=dt)<=0){ if(Math.random()<.45){ S.mode='go'; S.food=foodOf(n); } else S.mode='home'; st.to=null; } }
      else if(S.mode==='home'){ st.v=K.v*WU; S.hy=n.y-N.ground(n.x,n.z); if(!st.to)st.to={x:n.x,z:n.z}; if(at(n.x,n.z)){ S.mode='in'; S.c=rnd(6,25); st.to=null; N.body.visible=false; } } },
    bat:(dt,you,st,N,S,K)=>{ '@later'; const out=K.out(); N.body.visible=out; if(!out){ st.to=null; return; } st.v=K.v*WU;
      if(!S.hubs){ const P=POND, H=[]; if(P&&P.c)H.push({x:P.c.x,z:P.c.z}); for(const d of FL().beds)if(inL(PARKL,d.x,d.z))H.push({x:d.x,z:d.z}); if(!H.length)H.push({x:(PARKL.x0+PARKL.x1)/2,z:(PARKL.z0+PARKL.z1)/2}); S.hubs=H; S.hub=H[Math.floor(Math.random()*H.length)]; S.sw=rnd(15,40); }
      if((S.sw-=dt)<=0){ S.sw=rnd(15,40); S.hub=S.hubs[Math.floor(Math.random()*S.hubs.length)]; }
      if((S.d-=dt)<=0||!st.to){ S.d=rnd(.4,1.3); const a=Math.random()*Math.PI*2, r=rnd(0,5)*WU; st.to={x:Math.max(PARKL.x0,Math.min(PARKL.x1,S.hub.x+Math.cos(a)*r)),z:Math.max(PARKL.z0,Math.min(PARKL.z1,S.hub.z+Math.sin(a)*r))}; S.hy=rnd(2.5,7)*WU; } },
    spider:(dt,you,st,N,S,K)=>{ st.to=null; },
    frog:(dt,you,st,N,S,K)=>{ '@later'; const P=POND; if(!S.set||!P||!P.c)return;
      if(!st.goIn&&st.inT==null&&Math.hypot(you.x-st.x,you.z-st.z)<K.flee*WU){ const a=Math.atan2(st.z-P.c.z,st.x-P.c.x); st.to={x:P.c.x+Math.cos(a)*P.r*.9,z:P.c.z+Math.sin(a)*P.r*.9}; st.goIn=true; S.fled=1; SFX.play&&SFX.play('splash'); } },
    snake:(dt,you,st,N,S,K)=>{ '@later'; const out=K.out(); if(!out){ N.body.visible=false; st.to=null; st.hold=true; return; } if(!N.body.visible&&st.inT==null){ N.body.visible=true; st.hold=false; }
      if(!st.goIn&&st.inT==null&&Math.hypot(you.x-st.x,you.z-st.z)<K.flee*WU){ const b=coverOf(st.x,st.z,you.x,you.z); if(b){ st.to={x:b.x,z:b.z}; st.goIn=true; st.v=1.2*WU; } } },
    rat:(dt,you,st,N,S,K)=>{ const out=(N.ex&&N.ex.out||K.out)(); if(!out){ N.body.visible=false; st.to=null; st.hold=true; return; } if(!N.body.visible){ N.body.visible=true; st.hold=false; }
      if(Math.hypot(you.x-st.x,you.z-st.z)<K.flee*WU&&!S.fl){ const a=Math.atan2(st.z-you.z,st.x-you.x); for(let k=0;k<8;k++){ const b=a+rnd(-.8,.8), r=rnd(3,6)*WU, p={x:st.x+Math.cos(b)*r,z:st.z+Math.sin(b)*r}; if(N.free(p.x,p.z,st.R)&&inL(N.lane,p.x,p.z)){ st.to=p; S.fl=1; break; } } }
      st.v=(S.fl?K.dart*1.6:K.dart)*WU; if(!st.to)S.fl=0; } };
  const SET={
    spider:(N,S)=>{ '@later'; const st=N.st; if(!SHARE.webs){ const T=(PARK.treeItems?PARK.treeItems():[]).filter(t=>inL(PARKL,t.x,t.z)); if(!T.length&&!parkBushes().length)return; const h=o=>Math.sin(o.x*12.9898+o.z*78.233)*43758.5453%1;
        SHARE.webs=parkBushes().concat(T.sort((p,q)=>h(p)-h(q)).map(t=>({x:t.x,y:t.y,z:t.z,h:2.4*WU,r:Math.max(.12*WU,Math.min(t.tr||.25*WU,.6*WU))}))); }
      const B=SHARE.webs, i=S.i, b=B[i%B.length], a=i*2.399+Math.floor(i/B.length)*1.7;
      const x=b.x+Math.sin(a)*(b.r+.06*WU), z=b.z+Math.cos(a)*(b.r+.06*WU), y=b.y+Math.min(b.h*.6,1.1*WU); st.x=x; st.z=z; st.h=a; S.hy=y-N.ground(x,z); S.y=S.hy;
      const w=new THREE.LineSegments(webGeo(),webMat); w.position.set(x,y+.02*WU,z); w.rotation.y=a; w.raycast=()=>{}; MAPG.park.add(w); S.web=w; N.web={x,y,z,a}; return true; },
    frog:N=>{ const P=POND; if(!P||!P.ready||!P.c)return false; const e=P.edge(); N.st.x=e.x; N.st.z=e.z; return true; },
    bat:(N,S)=>{ const P=POND; if(!P||!P.ready||!P.c)return false; const a=Math.random()*Math.PI*2, r=rnd(0,4)*WU; N.st.x=P.c.x+Math.cos(a)*r; N.st.z=P.c.z+Math.sin(a)*r; return true; },
    wasp:(N,S)=>{ const n=nestOf(); if(!n)return false; S.mode='in'; S.c=rnd(0,15); N.st.x=n.x; N.st.z=n.z; N.body.visible=false; return true; } };
  const PICK={
    frog:(st,N,S)=>{ '@later'; const P=POND; if(!P||!P.c||Math.random()<.65){ st.to=null; st.wait=rnd(6,22); return; } const a=Math.atan2(st.z-P.c.z,st.x-P.c.x)+rnd(-.12,.12), r=P.r+rnd(.25,1.1)*WU; st.to={x:P.c.x+Math.cos(a)*r,z:P.c.z+Math.sin(a)*r}; if(!N.free(st.to.x,st.to.z,st.R)){ st.to=null; st.wait=2; } },
    snake:(st,N,S)=>{ '@later'; if(S.moved){ S.moved=0; st.to=null; st.wait=rnd(40,120); return; } st.v=.3*WU; for(let k=0;k<12;k++){ const a=Math.random()*Math.PI*2, r=rnd(1.5,6)*WU, p={x:st.x+Math.cos(a)*r,z:st.z+Math.sin(a)*r}; if(inL(PARKL,p.x,p.z)&&N.free(p.x,p.z,st.R)){ st.to=p; S.moved=1; return; } } st.wait=3; },
    rat:(st,N,S)=>{ if(S.moved){ S.moved=0; st.to=null; st.wait=rnd(.4,2.5); if(S.bin){ st.face={x:S.bin.x,z:S.bin.z}; st.wait=rnd(4,10); S.bin=null; } return; } st.face=null; const sol=SOL[N.lv]||SOL.up; let best=null, bs=1e9;
      if(Math.random()<.35)for(const b of (window.BINS&&BINS.list)||[]){ const p=b.G.position; if(b.G.parent&&Math.hypot(p.x-st.x,p.z-st.z)<15*WU){ const a=Math.random()*Math.PI*2, x=p.x+Math.cos(a)*.45*WU, z=p.z+Math.sin(a)*.45*WU; if(inL(N.lane,x,z)&&N.free(x,z,st.R)){ st.to={x,z}; S.moved=1; S.bin={x:p.x,z:p.z}; return; } } }
      for(let k=0;k<10;k++){ const a=Math.random()*Math.PI*2, r=rnd(1.5,5)*WU, x=st.x+Math.cos(a)*r, z=st.z+Math.sin(a)*r; if(!inL(N.lane,x,z)||!N.free(x,z,st.R))continue;
        let w=1e9; for(const b of sol){ const dx=Math.max(b[0]-x,0,x-b[2]), dz=Math.max(b[1]-z,0,z-b[3]); if(dx<3*WU&&dz<3*WU)w=Math.min(w,Math.hypot(dx,dz)); } const s=w+Math.random()*.3*WU; if(s<bs){ bs=s; best={x,z}; } }
      if(best){ st.to=best; S.moved=1; } else st.wait=1; } };
  let si=0; const spawn=([key,name,metres,tp,speed,turn,ex])=>{ const D=C[key], K=Object.assign({},KIND[key],ex&&{lane:ex.lane}), rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])), free=K.fly&&K.beh?()=>true:ex?ex.free:(K.free||FREE), [tx,tz]=tp||[0,0], tiny=metres<.2&&!K.big;
    const S={t:Math.random()*10,y:0,hy:0,i:K.beh==='spider'?si++:0,fly:Array.isArray(K.fly)?K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]):0,hid:false}; let cur=null; const beh=BEH[K.beh], pk=PICK[K.beh];
    const N=makeNPC(null,{key:key.toLowerCase(),name,names:D.mesh.parts,lv:ex?ex.lv:'up',group:ex?ex.group:K.lane===PARKL?'park':'bodega',geo:PAINT(key,geomOf(D.mesh)),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres,x:ex?ex.x:K.lane===PARKL?rnd(PARKL.x0,PARKL.x1):X(tx),z:ex?ex.z:K.lane===PARKL?rnd(PARKL.z0,PARKL.z1):Z(tz),lane:K.lane,free,ground:ex?ex.ground:(x,z)=>MODS.bodega.ground(x,z),radius:tiny?.03:.12,fly:!!K.fly,speed,stride:0,rock:0,bob:0,
      brain:beh?((dt,you,st)=>{ if(!S.set&&SET[K.beh])S.set=SET[K.beh](N,S); else S.set=1; beh(dt,you,st,N,S,K); }):K.farm?(dt=>N.life&&N.life.drive(dt)):null,
      pick:st=>{ if(pk)return pk(st,N,S); if(WALKS.pick&&WALKS.pick(st))return; if(Array.isArray(K.fly)){ const L=K.lane; st.to={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; S.fly=K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]); return; } const P=POND, L=K.lane; S.drink=false; st.face=null; if(P&&P.ready&&K.lane===PARKL&&Math.random()<.4){ const e=P.edge(); if(free(e.x,e.z,.12*TILE)){ st.to=e; S.drink=true; return; } }
          for(let k=0;k<12;k++){ const p={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; if(free(p.x,p.z,.12*TILE)){ st.to=p; return; } } st.to=null; st.wait=1; },
      anim:(dt,moving,st,sc)=>{ S.t+=dt; if(!beh){ const dark=CLOCK.dark(), out=K.night===1?dark:K.day?!dark:true; if(out===S.hid){ S.hid=!out; VIS.hide(N.g,'away',!out); st.hold=!out; if(!out)st.to=null; } if(!out)return; } if(!N.body.visible)return;
        if(S.drink&&!st.to&&POND&&POND.c){ st.face={x:POND.c.x,z:POND.c.z}; st.wait=Math.max(st.wait||0,6); S.drink=false; }
        if(N.life)S.rest=N.life.clip; else if(moving)S.rest=undefined; else if(S.rest===undefined){ S.rest=null; let u=Math.random(); for(const [c,p,nt] of K.rest||[])if((!nt||CLOCK.dark())&&C[key].clips[c]&&(u-=p)<0){ S.rest=c; st.wait=Math.max(st.wait||0,6+Math.random()*10); break; } }   // stopped: now and then it sits, grazes, barks, howls at night or sleeps a while
        const run=K.run&&moving&&st.v>1.2*TILE, want=moving?(run?K.run:K.walk):S.rest||K.idle; if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        if(K.hop){ const a=act(cur), ph=(a.time/a.getClip().duration)%1, air=moving&&ph>K.hop[0]&&ph<K.hop[1]; st.v=speed*TILE*(S.fled?3:1)*(air?1/(K.hop[1]-K.hop[0]):.004); a.timeScale=S.fled?2:1; }
        else act(cur).timeScale=K.fly&&K.beh?1.6:moving?Math.min(4,Math.max(.6,st.v/(K.pace*sc))):1; if(N.life)N.life.anim(dt,mixer); else mixer.update(dt);
        S.y+=(S.hy-S.y)*Math.min(1,dt*(K.beh==='bat'?3:2)); if(S.fly)N.g.position.y+=S.fly*WU*.5+Math.sin(S.t*2.1)*.15; if(S.hy||S.y)N.g.position.y+=S.y+(K.fly?Math.sin(S.t*(K.beh==='wasp'?9:2.1))*(K.beh==='wasp'?.01:.15)*WU:0);
        if(K.fly)N.body.rotation.z=moving?Math.sin(S.t*(K.beh==='bat'?4:1.3))*.25:0; }});
    N.g.rotation.order='YXZ'; N.me.rotation.y=turn+(K.turn||0); N.me.position.set(0,0,0); if(K.beh==='spider')N.me.rotation.x=-Math.PI/2;
    if(K.beh&&K.beh!=='frog'&&K.beh!=='snake'&&K.beh!=='rat')N.st.hold=true;
    if(K.fly&&!K.beh){ N.st.v=speed*TILE; } if(tiny||K.fly){ N.blocks=()=>false; N.push=()=>{}; } if(tiny){ N.push=()=>{}; N.selfSh=false; N.me.castShadow=false; } N.ex=ex; N.kind=key; N.wild=S; if(SET[K.beh])N.farMove=()=>{ if(!S.set&&PARK.ready)S.set=SET[K.beh](N,S); };
    if(ex)N.g.position.set(N.st.x,ex.ground(N.st.x,N.st.z),N.st.z);
    N.mixer=mixer; N.lane=K.lane; N.restless=()=>!!K.fly; if(!ex&&(K.lane===PARKL||K.park))N.park=true; N.pack(); CREATS.push(N);
    if(K.farm&&!ex)N.life=FARM.join(N,[...key].reduce((a,c)=>(a*31+c.charCodeAt(0))%9973,0)+(FARMN[key]=(FARMN[key]||0)+1)*7,D.clips,rig,D.rig.names,key);   // the farm's animals live by the farm's day (086a), the same for everyone
    else if(!K.beh&&!K.fly&&!ex){ const L=K.lane; N.wkey='an:'+key+':'+(SEEN[key]=(SEEN[key]||0)+1); WSH.push([N,{v:speed*TILE*.5,auto:0,mode:{b:{band:[[L.x0,L.z0,L.x1,L.z1]]}}}]); } };   // an animal on the ground walks where the section's walks say: the same for everyone
  const SEEN={}, WSH=[], FARMN={}; let shareT=0; SYS.every(()=>{ if(!WSH.length||!WALKS.on||!WALKS.reg||!(window.LOAD))return; if(shareT)return; shareT=1; LOAD('later').then(()=>{ for(const [N,m] of WSH.splice(0))WALKS.reg(N,m); shareT=0; }); },2000,'087 animals walk shared');
  CREATURESREADY.then(()=>{ for(const e of CH)spawn(e); });
  // the Drive's animals (owner, 3 Nov 2026): the park's woods, its farm, its zoo and its dinosaur valley, bugs in the grass, cats and a dog on the street
  { const R=(x0,y0,x1,y1)=>({x0:X(x0),x1:X(x1),z0:Z(y0),z1:Z(y1),park:1}), WOOD=PARKL, FARML=FARM.pen, ZOO=R(-20,104,22,134), DINO=R(62,132,104,176), LAKE=R(140,-2,166,22);
    const DRY=(x,z,R)=>FREE(x,z,R)&&!((FLOW&&FLOW.waters)||[]).some(w=>w.has&&w.has(x,z));
    const k=(n,lane,pace,o={})=>KIND[n]=Object.assign({walk:n+'_Walk',run:n+'_Run',idle:n+'_Idle',pace,lane,park:lane!==ALL,free:lane===LAKE?FREE:DRY},o), fly=(n,lane,f,o)=>k(n,lane,3,Object.assign({walk:n+'_Fly',run:null,idle:n+'_Fly',fly:f},o));
    const RS=(n,...L)=>L.map(([c,p,nt])=>[n+'_'+c,p,nt]);   // what it does when it stops, now and then: [clip, chance, night only]
    k('Fox',WOOD,3,{night:.5,rest:RS('Fox',['Sit',.35],['Howl',.2,1])}); k('Deer',WOOD,2.4); k('Wolf',WOOD,3,{night:1,rest:RS('Wolf',['Howl',.4,1],['Sit',.3])}); k('Bear',WOOD,2); k('Crow',ALL,2.5); fly('Owl',WOOD,[5,9],{night:1}); k('Duck',LAKE,2,{run:null});
    k('Cat',ALL,2.5); k('BlackCat',ALL,2.5,{night:1}); k('Dog',ALL,3,{rest:RS('Dog',['Sit',.45],['Bark',.2])});
    for(const n of ['Cow','Pig','Horse','WildHorse','Mule','Ibex'])k(n,FARML,2.4,{farm:1}); for(const n of ['Lion','Elephant','Giraffe','Zebra','Camel'])k(n,ZOO,2.4); k('Penguin',LAKE,2,{run:null});
    k('Raptor',DINO,3); k('Stego',DINO,2); k('Brachio',DINO,1.6,{run:null}); fly('Ptera',DINO,[8,14]);
    for(const n of ['AntQueen','WoodAnt','Aphid','Ladybird','Hopper','Beetle','Mantis'])k(n,WOOD,3); for(const n of ['Caterpillar','Slug','Snail'])k(n,WOOD,1.5,{walk:n+'_Crawl',run:null}); k('Crab',LAKE,2);
    fly('Bee',WOOD,[.6,1.6],{day:1}); fly('Bumblebee',WOOD,[.6,1.6],{day:1}); fly('Firefly',WOOD,[.5,1.8],{night:1});
    // [key, NAME, metres tall, how many, speed]
    const FA=[['Fox','FOX',.45,2,1],['Deer','DEER',1.2,3,1],['Wolf','WOLF',.8,2,1.1],['Bear','BLACK BEAR',1,1,.8],['Crow','CROW',.3,4,.8],['Owl','OWL',.32,2,1.2],['Duck','DUCK',.45,4,.6],
      ['Cat','CAT',.28,2,.9],['BlackCat','BLACK CAT',.3,1,.9],['Dog','DOG',.6,1,1.1],['Cow','COW',1.4,3,.6],['Pig','PIG',.9,3,.6],['Horse','HORSE',1.6,2,1],['WildHorse','WILD HORSE',1.5,2,1],['Mule','MULE',1.4,1,.7],['Ibex','IBEX',1,2,.9],
      ['Lion','LION',1.1,2,.9],['Elephant','ELEPHANT',3,2,.6],['Giraffe','GIRAFFE',5,2,.6],['Zebra','ZEBRA',1.4,3,.9],['Camel','CAMEL',2,2,.6],['Penguin','PENGUIN',.6,4,.4],
      ['Raptor','VELOCIRAPTOR',.9,3,1.4],['Stego','STEGOSAURUS',3.5,2,.5],['Brachio','BRACHIOSAURUS',11,1,.4],['Ptera','PTERANODON',1.6,2,1.4],
      ['AntQueen','ANT QUEEN',.015,2,.05],['WoodAnt','WOOD ANT',.008,6,.06],['Aphid','APHID',.004,6,.005],['Ladybird','LADYBIRD',.008,4,.03],['Hopper','GRASSHOPPER',.02,4,.2],['Beetle','STAG BEETLE',.03,2,.05],['Mantis','PRAYING MANTIS',.04,2,.03],
      ['Caterpillar','CATERPILLAR',.01,3,.01],['Slug','LEOPARD SLUG',.02,3,.01],['Snail','SNAIL',.025,3,.01],['Crab','HERMIT CRAB',.04,3,.1],['Bee','HONEYBEE',.015,6,.8],['Bumblebee','BUMBLEBEE',.02,3,.7],['Firefly','FIREFLY',.012,5,.4]];
    const PARKKEEP=new Set(['Crow','Owl','Duck','Penguin','Bee','Bumblebee','Firefly','Cow','Pig','Horse','Mule','Deer']);   // the rest are pets at the pet shops; the farm animals graze the farm's paddock; deer in the woods to tame and ride (146zjd)
    CREATS.FA=FA; const FL=__LAZY__("data/fauna.json"), hs=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); }, inv=(L,x,z)=>[(x-X(0))/(X(1)-X(0)),(z-Z(0))/(Z(1)-Z(0))];
    CREATURESREADY.then(()=>FL()).then(J=>{ Object.assign(C,J); FA.forEach(([key,name,m,n,sp],i)=>{ if(!C[key]||!PARKKEEP.has(key))return; const L=KIND[key].lane; for(let j=0;j<n;j++){ const x=L.x0+hs(i,j)*(L.x1-L.x0), z=L.z0+hs(j,i+7)*(L.z1-L.z0); spawn([key,name,m,inv(L,x,z),sp,0]); } }); }).catch(e=>console.warn('FAUNA',e)); }
  window.CREATNEW=MODS.creatNew=(key,id,metres,X={})=>{ '@later'; const D=C[key], K=KIND[key], rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); let cur=null, cn;
    const N=makeNPC(null,{key:id,name:id.toUpperCase(),names:D.mesh.parts,lv:'up',group:'bodega',geo:X.paint?X.paint(geomOf(D.mesh)):PAINT(key,geomOf(D.mesh)),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres,x:0,z:0,lane:K.lane,free:()=>true,radius:.12,speed:1,stride:0,rock:0,bob:0,...X.npc,
      anim:(dt)=>{ const want=N.clip||K.idle; if(want!==cur||N.clipN!==cn){ const a=act(want), one=!!(K.once&&K.once.includes(want)); a.reset().setLoop(one?THREE.LoopOnce:THREE.LoopRepeat,Infinity).fadeIn(.15).play(); a.clampWhenFinished=one; if(cur&&cur!==want)act(cur).fadeOut(.15); cur=want; cn=N.clipN; } act(cur).timeScale=N.clipK||1; mixer.update(dt); }});
    N.g.rotation.order='YXZ'; N.me.rotation.y=K.turn||0; N.me.position.set(0,0,0); N.mixer=mixer; return N; };
  window.CREATDBG=()=>CREATS.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.body.visible})); }

const PAWNS=__LAZY__("data/pawns.json");
export {CREATS, PAWNS};
