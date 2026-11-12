// THE TRAFFIC: cars driving both ways along Market St and flying cars and small spacecraft above them, from the shared clock so every player sees the same ones; the park gate's crossing light (built in 069-dress) turns on a timer or its button, the cars stop at its line and for anyone in the road.
import {SHARED, THREE} from './003-shx.js';
import {CARLAMPS, CLOCK, CULL, DRESS, ONLINE, PARK, pos, SFX, SPEED, UI, VLOOK, WALKS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {LEVEL, MODS, OUT, SOL, SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {TLX} from './069-dress.js';
import {BIGCAT} from './111ei-bigcat.js';
const TRAFFIC={lanes:[],skew:0}; window.TRAFFIC=TRAFFIC;
{ const TD=__LAZY__("data/traffic.json"), T=TILE, M0=T/.84, M1=M0*1.4, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const now=()=>(TRAINS.now?TRAINS.now():Date.now()/1000)+TRAFFIC.skew;
  // LOW: hover cars that keep to the road lanes, a hand over the ground; PACE: each model's own speed, a share of its lane's
  const LOW=['taxi-pod','station-wagon-70s'], HOV={'taxi-pod':.3,'station-wagon-70s':.8}, PACE={'muscle-car-60s':1.15,'wedge-coupe-80s':1.2,'station-wagon-70s':.95,'convertible-60s':1.05,'camper-van':.8,'police-cruiser-80s':1.1,'taxi-pod':1,'town-car':1,hatchback:.95,suv:1,minivan:.9,pickup:.9,'kei-van':.85,interceptor:1.25,'escape-pod':.85,'taxi-coupe':1.05,ambulance:1.15,'police-flier':1.3};
  const GAME=['muscle-car-60s','convertible-60s','station-wagon-70s','wedge-coupe-80s','camper-van','police-cruiser-80s'];
  const zs=Z(SHARED.BOD.CURB), zp=Z(SHARED.BOD.FAR), zm=(zs+zp)/2, xW=X(-129), xE=X(261), SPAN=xE-xW, OFF=130*M0, LC=SPAN+OFF, HO=OFF/2;
  const gx0=X(PARK.gate[0]+PARK.ox), gx1=X(PARK.gate[1]+PARK.ox);
  // the lanes: right-hand traffic, westbound on the shops' side; the fliers 8 m over the same lanes, stopping at the fliers' light over the crossing light
  const LANES=[{dir:-1,z:(zs+zm)/2,fly:0,v:7.5*M0,n:6,seed:0},{dir:1,z:(zp+zm)/2,fly:0,v:7.5*M0,n:6,seed:3},{dir:-1,z:(zs+zm)/2,fly:8*M0,v:10.5*M0,n:4,seed:5},{dir:1,z:(zp+zm)/2,fly:8*M0,v:10.5*M0,n:4,seed:8}];
  // the kei vans, a fifth their size, on the two sidewalks (tiny life): no light, no body to walk into, stopping only for a player in their way
  LANES.push({dir:1,z:Z(SHARED.BOD.CURB-3.2),fly:0,v:2.2*M0,n:8,seed:2,tiny:1,only:['kei-van']},{dir:-1,z:Z(SHARED.BOD.FAR+3.2),fly:0,v:2.2*M0,n:8,seed:6,tiny:1,only:['kei-van']});
  for(const L of LANES){ L.stop=L.dir<0?(xE-gx1)-1.6*M0:(gx0-xW)-1.6*M0; L.cars=[]; for(let i=0;i<L.n;i++)L.cars.push({i,u:null,sp:L.v,model:null,m:null,lap:-1,sol:null}); }
  TRAFFIC.lanes=LANES;
  // the owner's extra vehicles (VLOOK.more: model -> how many more, ADMIN > VEHICLE EDITOR), each one more in a lane of its kind, its model kept; the lanes spaced again
  for(const L of LANES)L.n0=L.n;
  const fleet=()=>{ const M=VLOOK.more||{}, fly=k=>!LOW.includes(k)&&(!!(D&&D[k]&&D[k].fly)||!!(MODS.cars&&MODS.cars.flies&&MODS.cars.flies(k))), add=LANES.map(()=>[]);
    for(const k in M){ const ls=LANES.map((L,i)=>i).filter(i=>!LANES[i].tiny&&!!LANES[i].fly===fly(k)); if(!ls.length)continue; for(let j=0;j<Math.min(20,M[k]|0);j++)add[ls[j%ls.length]].push(k); }
    LANES.forEach((L,i)=>{ const want=add[i].join(), had=L.cars.filter(C=>C.fixed).map(C=>C.fixed).join(); if(want===had)return; for(const C of L.cars){ give(C); if(C.sol)C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; }
      L.cars=L.cars.filter(C=>!C.fixed); for(const k of add[i])L.cars.push({i:0,u:null,sp:L.v,model:k,fixed:k,m:null,lap:-1,sol:null}); L.n=L.cars.length; L.cars.forEach((C,j)=>{ C.i=j; C.u=null; }); }); };
  TRAFFIC.fleet=fleet;
  // a look changed: the copies on the road are made again from their model
  VLOOK.on(()=>{ if(!D)return; for(const L of LANES)for(const C of L.cars)give(C); for(const R of RINGS)R.m.forEach((m,i)=>{ if(m){ m.visible=false; (POOL[R.models[i]+'~0']||(POOL[R.models[i]+'~0']=[])).push(m); R.m[i]=null; } }); for(const k in POOL){ for(const m of POOL[k])GRP.remove(m); POOL[k]=[]; } fleet(); });
  // the owner's speeds (SPEED.of('traffic'), SPEED.of('fliers')): a change moves every car's place on the clock by whole laps, so each keeps where it is and eases to its new place
  const speeds=()=>{ const t=now(); for(const L of LANES){ L.v0=L.v0||L.v; const v=L.v0*SPEED.of(L.fly?'fliers':'traffic'); if(v===L.v)continue; const sh=Math.round(t*(v-L.v)/LC)*LC; L.v=v; for(const C of L.cars)if(C.u!=null)C.u+=sh; } };
  speeds(); SPEED.on(speeds);

  /* ---------- the light: green, then on a timer (or sooner by the button) amber and red with WALK, everyone's the same from the clock ---------- */
  const CY=90, P0=()=>+((ONLINE.world||{})['xing:gate'])||0;
  const light=t=>WALKS.sim.light(t,P0());   // one clock with the walkers on the server (worker/folk.js)
  TRAFFIC.light=()=>light(now()); if(TLX)TLX.gate=TRAFFIC.light; if(SHARED.BOD.road)SHARED.BOD.road.walk=()=>TRAFFIC.light().x==='w';   // walkers wait for it (076 pedHold)
  TRAFFIC.press=()=>{ const t=now(), r=((t%CY)+CY)%CY, L=light(t); if(L.m!=='g')return say(L.x==='w'?'WALK.':'WAIT FOR THE WALK.'); if(t-P0()<35||r>=47)return say('THE LIGHT CHANGES SOON.'); ONLINE.put('xing:gate',String(Math.round(t*10)/10)); say('YOU PRESS THE BUTTON. WAIT FOR THE WALK.'); };

  /* ---------- the buttons: a yellow box on each crossing light's pole ---------- */
  { const bm=new THREE.MeshLambertMaterial({color:0xf2c418}), dm=new THREE.MeshLambertMaterial({color:0x1a1b1e}), bg=new THREE.BoxGeometry(.2*M0,.28*M0,.12*M0), pg=new THREE.CylinderGeometry(.05*M0,.05*M0,.04*M0,10).rotateX(Math.PI/2);
    for(const S of DRESS.sig||[]){ const g=new THREE.Group(), b=new THREE.Mesh(bg,bm), p=new THREE.Mesh(pg,dm); p.position.z=-.07*M0; g.add(b,p); g.position.set(...S.btn); g.rotation.y=S.sd>0?0:Math.PI; scene.add(g); OUT.add(g,'open');
      UI.thing({name:'CROSSING BUTTON',obj:g,reach:1.2*T,near:3*T,tall:.4*M0,act:()=>TRAFFIC.press()}); } }

  /* ---------- the vehicles: the game's own cars (150p) and Polyfork's (data/traffic.json), one model made once and copied ---------- */
  let D=null; const TPL={}, POOL={}, GRP=new THREE.Group(); GRP.userData.parkFar=true; scene.add(GRP); CLOCK.movers.push(()=>[GRP]);
  const MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  // the Polyfork models' own looks (owner, 12 Nov 2026): a colour swapped for another as the model is made, one of its looks by v
  const TLIV={pickup:[null,{'69aab0':0xe8735a},{'69aab0':0xf0d878},{'69aab0':0x8fc0e0},{'69aab0':0xc23a30},{'69aab0':0xa8dcc0}],rover:[{'3f4149':0xb9bfc8,'5f656f':0x9aa1ab,'454f67':0x8d94a0}]};
  const looks=k=>TLIV[k]?TLIV[k].length:MODS.cars&&MODS.cars.looks?MODS.cars.looks(k):1;
  const geo=(Q,map)=>{ const q=new Int16Array(Uint8Array.from(atob(Q.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(Q.c),c=>c.charCodeAt(0)), b=Q.b, P=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<q.length;i++){ const a=i%3; P[i]=b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]); }
    for(let i=0;i<col.length;i+=3){ const t=map&&map[(col[i]<<16|col[i+1]<<8|col[i+2]).toString(16).padStart(6,'0')]; if(t!=null)c.setHex(t,THREE.SRGBColorSpace); else c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const SCALE={'kei-van':.2,interceptor:.5,'escape-pod':.5};
  const lid=k=>D&&D[k]?'tr:'+k:'car:'+k, size=k=>{ const G=MODS.cars&&MODS.cars.data&&MODS.cars.data(), s=D&&D[k]?D[k].size:G&&G.cars[k]?G.cars[k].size:[2,1.4,4.9], l=VLOOK.scaleOf(lid(k))*(SCALE[k]||1); return l===1?s:s.map(v=>v*l); };
  const body=(Q,k,v)=>{ const g=new THREE.Group(), map=TLIV[k]&&TLIV[k][(v|0)%TLIV[k].length]; for(const n in Q.parts){ const q=Q.parts[n], me=new THREE.Mesh(geo(q,map),MAT); me.name=n; me.position.set(...q.at); me.castShadow=true; g.add(me); } g.scale.setScalar(M1*(SCALE[k]||1)); return VLOOK.dress('tr:'+k,g); };
  const tpl=(k,v)=>{ const key=k+'~'+(v|0); if(TPL[key])return TPL[key]; let g=null; if(D[k])g=body(D[k],k,v); else if(MODS.cars&&MODS.cars.build)g=MODS.cars.build(k,v); if(g)g.traverse(o=>{ o.userData.anyRoom=false; }); return TPL[key]=g; };
  const take=(k,v)=>{ const key=k+'~'+(v|0), P=POOL[key]||(POOL[key]=[]); if(P.length)return P.pop(); const t=tpl(k,v); if(!t)return null; const m=t.clone(); GRP.add(m); if(MODS.cars&&MODS.cars.cab)MODS.cars.cab(m); return m; };
  const give=C=>{ if(!C.m)return; C.m.visible=false; const key=C.model+'~'+(C.v|0); (POOL[key]||(POOL[key]=[])).push(C.m); C.m=null; };
  // the patrol (owner, 9 Nov 2026: "one that drives by every 60 seconds"): the first car to set out after each minute's mark is the police cruiser, one way one minute, the other the next
  const PAT='police-cruiser-80s', patrol=(li,i,lap)=>{ const L=LANES[li], t0=(lap*LC-i*LC/L.n)/L.v, m=Math.floor(t0/60); return m>Math.floor((t0-LC/L.v/L.n)/60)&&(((m%2)+2)%2)===li; };
  TRAFFIC.patrol=patrol;
  const pick=(L,C,lap)=>{ if(C.fixed)return C.fixed; if(L.pat&&patrol(LANES.indexOf(L),C.i,lap))return PAT; const list=L.only||(L.fly?L.FL:L.GR); return list[(C.i*7+lap*3+L.seed*5)%list.length]; };

  /* ---------- driving: each car keeps to its place on the clock, slowing for the light, the car ahead and anyone in the road, then catching up ---------- */
  const xOf=(L,s)=>L.dir>0?xW+s:xE-s;
  const blockers=()=>{ const B=[{x:pos.x,z:pos.z}]; for(const o of (ONLINE.others&&ONLINE.others.values())||[])if(o.p&&!o.dead)B.push({x:o.p.x,z:o.p.z}); if(MODS.cars&&MODS.cars.cars)for(const C of MODS.cars.cars.values()){ if(!C.by){ if(C.mesh)B.push({x:C.x,z:C.z,r:2.4*M1}); continue; } if(MODS.cars.flies(C.model))continue;
      const o=C.by===(ONLINE.me||'me')?pos:(ONLINE.others&&ONLINE.others.get(C.by)||{}).p; if(o)B.push({x:o.x,z:o.z,r:2.4*M1}); }
    const cat=BIGCAT.road&&BIGCAT.road(); if(cat)B.push({x:cat.x,z:cat.z,r:3*M0}); return B; };   // THE BIG CAT crossing holds up the lanes he is in   // a car being driven is where its driver is
  const room=(L,C,u)=>{ let r=Infinity; for(const A of L.cars){ if(A===C||A.u==null)continue; const d=(((A.u-u)%LC)+LC)%LC; r=Math.min(r,Math.min(d,LC-d)-(size(C.model)[2]+size(A.model)[2])*M1/2-2*M0); } return r; };
  // a car's place on the clock: it is mid-street at the same moment whatever its pace, a fast one setting out later and a slow one sooner, both out of sight
  const lapOf=u=>Math.floor((u+HO)/LC), NM={u:0,v:0,hid:false};
  const nomOf=(L,C,t)=>{ const U=t*L.v+C.i*LC/L.n, lap=Math.floor(U/LC), f=Math.max(SPAN/LC+.03,PACE[pick(L,C,lap)]||1), s=Math.max(-HO,Math.min(SPAN+HO,SPAN/2+(U-lap*LC-LC/2)*f)); NM.u=lap*LC+s; NM.v=s>-HO&&s<SPAN+HO?f*L.v:0; NM.hid=s<0||s>=SPAN; return NM; };
  TRAFFIC.pace=PACE;
  const step=dt=>{ const t=now(), Lt=light(t), B=LANES[0].GR?blockers():[], R=Math.max(90*T,(window.CULL&&CULL.R)||0), up=OUT.open&&!(PARK.within&&PARK.within(pos.x,pos.z))&&SHARED.LVL==='up';
    for(const L of LANES){ if(!L.GR)continue; const hw=L.tiny?.8*M0:Math.abs(zs-zm)/2+.6*M0;
      const nom=C=>nomOf(L,C,t).u;
      // an unseen car far off its place goes back to it only where the road is clear (at rest if another car is close)
      for(const C of L.cars){ const N=nomOf(L,C,t), n=N.u, nv=N.v, hid=N.hid; if(C.u==null){ C.u=n; C.sp=nv; continue; } if(C.m||!C.re&&Math.abs(n-C.u)<=(hid?M0:LC*.8))continue; const r=room(L,C,n); if(r>0){ C.u=n; C.sp=r>L.v*L.v/(8*M0)?nv:0; C.re=0; } }
      L.cars.forEach(C=>{ const N=nomOf(L,C,t), nu=N.u, nv=N.v, s=C.u-lapOf(C.u)*LC, len=size(C.model)[2]*M1/2; let lim=Infinity;
        if(!L.tiny&&Lt.m!=='g'&&s+len<=L.stop){ const g=L.stop-(s+len); if(Lt.m==='r'||g>C.sp*C.sp/(2*5*M0))lim=Math.min(lim,g); }
        for(const A of L.cars)if(A!==C)lim=Math.min(lim,(((A.u-C.u)%LC)+LC)%LC-len-size(A.model)[2]*M1/2-2*M0);   // the car ahead on the road, whatever lap either is on
        if(!L.fly){ if(s>=0&&s<SPAN){ const x=xOf(L,s); C.blk=false; for(const b of B){ if(L.tiny&&(b.l||b.r))continue; if(b.l?b.l!==L.dir:Math.abs(b.z-L.z)>hw+(b.r||0))continue; const d=(b.x-x)*L.dir-(b.r||.5*M0); if(d>-len&&d<len+(L.tiny?5:28)*M0){ lim=Math.min(lim,d-len-2*M0); if(!b.r&&d<len+8*M0)C.blk=true; } } } }
        const want=Math.min(Math.max(s>=0?.5*L.v:0,nv+Math.max(-.5*L.v,Math.min(.6*L.v,(nu-C.u)*.25))),lim<Infinity?Math.sqrt(2*4*M0*Math.max(0,lim)):1e9);
        C.sp+=Math.max(-9*M0*dt,Math.min(3*M0*dt,want-C.sp)); if(C.sp<0)C.sp=0; if(lim<.05*M0&&lim<Infinity)C.sp=Math.min(C.sp,0); C.u+=C.sp*dt;
        const lap=lapOf(C.u), s2=C.u-lap*LC, on=s2>=0&&s2<SPAN, x=xOf(L,s2), near=on&&up&&Math.abs(x-pos.x)<R&&Math.abs(L.z-pos.z)<R;
        if(lap!==C.lap||C.model==null){ give(C); C.lap=lap; C.model=pick(L,C,lap); C.v=(C.i*3+lap+L.seed)%looks(C.model); }
        if(near&&!C.m){ C.m=take(C.model,C.v); } if(!near&&C.m)give(C);
        if(!L.tiny&&C.blk&&C.m&&C.sp<.15*L.v&&t-(L.hk||-99)>12){ L.hk=t; SFX.play('horn',{at:{x,z:L.z},far:40*T,vol:.6,pitch:.85+(C.i%4)*.07,delay:.3}); }   // stopped for someone in the road: a honk
        if(C.m){ const y=L.fly?SHARED.groundY(x,L.z)+L.fly+Math.sin(t*1.3+C.i*2)*.25*M0:SHARED.groundY(x,L.z)+(LOW.includes(C.model)?(HOV[C.model]+Math.sin(t*1.3+C.i*2)*.06)*M0:0); C.m.visible=true; C.m.position.set(x,y,L.z); C.m.rotation.set(0,L.dir>0?Math.PI/2:-Math.PI/2,L.fly?Math.sin(t*.9+C.i)*.04:0); }
        if(!L.fly&&!L.tiny){ if(!C.sol){ C.sol=[-1e7,-1e7,-1e7,-1e7]; SOL.up.push(C.sol); } const w=size(C.model)[0]*M1/2; if(C.m){ C.sol[0]=x-len; C.sol[2]=x+len; C.sol[1]=L.z-w; C.sol[3]=L.z+w; } else C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; } }); } };
  /* ---------- the rounds: fliers on a closed way of their own, from the shared clock alone (the police fliers over the sidewalks and across the park, the small craft round the park) ---------- */
  const ROUND=['police-flier','interceptor','escape-pod','rover'], RINGS=[]; TRAFFIC.rings=RINGS;
  { const a=PARK.x0+PARK.ox, b=PARK.x1+PARK.ox, c=PARK.y0+PARK.oy, e=PARK.y1+PARK.oy, ks=SHARED.BOD.CURB-2.5, kp=SHARED.BOD.FAR+2.5, w=b-a, d=e-c, xa=a+12, xb=b-12;
    const way=P=>{ const cv=new THREE.CatmullRomCurve3(P.map(q=>new THREE.Vector3(X(q[0]),q[2]*M0,Z(q[1]))),true,'centripetal'); cv.arcLengthDivisions=600; return cv; };
    const pol=[]; for(let i=0;i<=6;i++)pol.push([-120+i*(b-10+120)/6,ks,10]); for(let i=0;i<=5;i++)pol.push([b-10-i*(b-10-xa)/5,kp,10]);
    for(let r=0;r<4;r++){ const y=c+d*(.14+r*.24), L=r%2===0; for(let i=0;i<=3;i++)pol.push([L?xa+i*(xb-xa)/3:xb-i*(xb-xa)/3,y,26]); }
    pol.push([a+4,c+d*.5,26],[a+4,c+10,24],[-90,ks+12,16]);
    RINGS.push({id:'police',cv:way(pol),v:9*M0,dir:1,models:['police-flier','police-flier','police-flier','police-flier'],m:[]});
    const rim=[[xa,c+14],[a+w*.5,c+10],[xb,c+14],[b-8,c+d*.5],[xb,e-14],[a+w*.5,e-10],[xa,e-14],[a+8,c+d*.5]].map(q=>[q[0],q[1],34]);
    RINGS.push({id:'craft',cv:way(rim),v:11*M0,dir:-1,models:['interceptor','escape-pod','interceptor','escape-pod'],m:[]});
    // the rovers keep to the park's paths: along the cross path and back, up the long path and down it, round again
    { const Q=LEVEL.paths||[], long=Q.slice().sort((p,q)=>Math.hypot(q.b[0]-q.a[0],q.b[1]-q.a[1])-Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1])).slice(0,2), pts=[]; for(const q of long){ const n=8; for(let i=0;i<=n;i++)pts.push([q.a[0]+(q.b[0]-q.a[0])*i/n,q.a[1]+(q.b[1]-q.a[1])*i/n,0]); for(let i=n-1;i>0;i--)pts.push([q.a[0]+(q.b[0]-q.a[0])*i/n+1.6,q.a[1]+(q.b[1]-q.a[1])*i/n+1.6,0]); }
      if(pts.length>4)RINGS.push({id:'rover',ground:1,cv:way(pts),v:1.8*M0,dir:1,models:['rover','rover'],m:[]}); }
    for(const R of RINGS)R.len=R.cv.getLength(); }
  const RP=new THREE.Vector3(), RT=new THREE.Vector3();
  const ringAt=(R,i,t,o)=>{ const u=(((t*R.v*SPEED.of(R.ground?'traffic':'fliers')*R.dir+i*R.len/R.models.length)/R.len)%1+1)%1; R.cv.getPointAt(u,RP); R.cv.getTangentAt(u,RT); o.x=RP.x; o.y=RP.y; o.z=RP.z; o.r=Math.atan2(RT.x*R.dir,RT.z*R.dir); return o; };
  TRAFFIC.ringAt=(id,i,t)=>ringAt(RINGS.find(R=>R.id===id),i,t==null?now():t,{});
  const RO={}; SYS.add('life',()=>{ if(!D||!LANES[0].GR)return; const t=now(), Rr=Math.max(90*T,(window.CULL&&CULL.R)||0)*1.5, up=OUT.open&&SHARED.LVL==='up';
    for(const R of RINGS)R.models.forEach((k,i)=>{ if(!D[k]&&!carsIn())return; ringAt(R,i,t,RO); const near=up&&Math.abs(RO.x-pos.x)<Rr&&Math.abs(RO.z-pos.z)<Rr; let m=R.m[i];
      if(near&&!m)m=R.m[i]=take(k,0); if(!near&&m){ m.visible=false; (POOL[k+'~0']||(POOL[k+'~0']=[])).push(m); R.m[i]=null; return; } if(!m)return;
      m.visible=true; m.position.set(RO.x,SHARED.groundY(RO.x,RO.z)+RO.y+(R.ground?0:Math.sin(t*1.1+i*2)*.3*M0),RO.z); m.rotation.set(0,RO.r,R.ground?0:Math.sin(t*.8+i)*.05); }); },'150pb-traffic');
  // the airship (owner, 9 Nov 2026: "make the blimp 7x bigger and floating around the city high up"): one, seven times the size, on a slow round over the section from the shared clock
  const BLIMP={k:'sky-tender',m:null,T:300,h:75*M0,at:t=>{ const a=t/BLIMP.T*Math.PI*2, cx=(xW+xE)/2, cz=zm+110*T; return {x:cx+Math.cos(a)*150*T,z:cz+Math.sin(a)*120*T,r:Math.atan2(-Math.sin(a)*150,Math.cos(a)*120)}; }}; TRAFFIC.blimp=BLIMP;
  SYS.add('life',()=>{ if(!D||!D[BLIMP.k])return; if(!BLIMP.m){ const g=new THREE.Group(); g.add(body(D[BLIMP.k],BLIMP.k)); g.scale.setScalar(7); g.traverse(o=>{ o.userData.anyRoom=false; o.frustumCulled=false; }); GRP.add(g); BLIMP.m=g; }
    const t=now(), p=BLIMP.at(t), m=BLIMP.m; m.visible=!!OUT.open&&SHARED.LVL==='up'; m.position.set(p.x,BLIMP.h+Math.sin(t*.25)*1.5*M0,p.z); m.rotation.set(0,p.r,Math.sin(t*.2)*.03); },'150pb-traffic');
  let tP=null; SYS.add('life',()=>{ if(!D)return; const t=now(); let d=tP==null?0:t-tP; tP=t; if(d<0||d>30){ for(const L of LANES)for(const C of L.cars)if(!C.m)C.re=1; d=0; }
    const n=Math.min(120,Math.max(1,Math.ceil(d/.06))); for(let k=0;k<n;k++)step(d/n); },'150pb-traffic');

  /* ---------- the kit fetched after the start, the game's cars once theirs are in ---------- */
  const carsIn=()=>!!(MODS.cars&&MODS.cars.dbg&&MODS.cars.build&&MODS.cars.dbg().loaded);
  let asked=false; SYS.add('life',()=>{ if(asked||!SYS.started)return; asked=true; TD().then(d=>{ D=d; const ks=Object.keys(d).filter(k=>d[k]&&d[k].parts);
      const fl=ks.filter(k=>d[k].fly&&k!==BLIMP.k&&!ROUND.includes(k)), gr=ks.filter(k=>!d[k].fly&&k!=='kei-van'&&!ROUND.includes(k)), ready=()=>{ const g=carsIn()?gr.concat(GAME.filter(k=>k!==PAT),LOW):gr; const f=carsIn()&&MODS.cars.fliers?fl.concat(MODS.cars.fliers().filter(k=>!LOW.includes(k)&&!ROUND.includes(k))):fl; LANES.forEach((L,i)=>{ L.FL=f; L.GR=g; L.pat=!L.fly&&i<2&&carsIn(); }); };
      for(const k of ks)VLOOK.kind('tr:'+k,{name:d[k].name,grp:d[k].fly?'FLYING TRAFFIC':'ROAD TRAFFIC',make:i=>body(d[k],k,i),traffic:k,...(TLIV[k]&&TLIV[k].length>1?{vname:'LOOK',variants:()=>TLIV[k].map((q,i)=>'LOOK '+(i+1))}:{})});
      ready(); fleet(); let n=0; const again=()=>{ if(carsIn()){ for(const L of LANES)for(const C of L.cars){ give(C); C.lap=-1e9; C.model=null; } ready(); } else if(++n<30)setTimeout(again,2000); }; setTimeout(again,2000);
    }).catch(e=>console.warn('TRAFFIC: the vehicles did not load',e)); },'150pb-traffic');
  // their lamps (150pc): every car on the road, measured once from its model
  const DIM={}, dimOf=k=>DIM[k]||(DIM[k]=(()=>{ const t=tpl(k); if(!t)return null; const b=new THREE.Box3().setFromObject(t); return [b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z,b.min.y]; })());
  CARLAMPS.src.push(out=>{ for(const R of RINGS)R.m.forEach((m,i)=>{ const d=m&&m.visible&&dimOf(R.models[i]); if(d)out.push({x:m.position.x,y:m.position.y,z:m.position.z,r:m.rotation.y,dim:d,fly:!R.ground,own:!!(MODS.cars&&MODS.cars.own&&MODS.cars.own(R.models[i])),sp:R.v}); }); for(const L of LANES)for(const C of L.cars){ if(!C.m||!C.m.visible)continue; const d=dimOf(C.model); if(d)out.push({x:C.m.position.x,y:C.m.position.y,z:C.m.position.z,r:C.m.rotation.y,dim:d,fly:!!L.fly,own:!!(MODS.cars&&MODS.cars.own&&MODS.cars.own(C.model)),sp:C.sp}); } });
  TRAFFIC.dbg=()=>({loaded:!!D,rings:RINGS.map(R=>({id:R.id,len:R.len/M0,models:R.models,shown:R.m.filter(m=>m&&m.visible).length})),park:[PARK.x0+PARK.ox,PARK.x1+PARK.ox,PARK.y0+PARK.oy,PARK.y1+PARK.oy],tiny:LANES.filter(L=>L.tiny).map(L=>({z:L.z,cars:L.cars.map(C=>({model:C.model,sp:C.sp,shown:!!C.m,s:C.m?C.m.scale.x:0}))})),clip:LANES.reduce((n,L)=>n+L.cars.filter(C=>C.u!=null&&room(L,C,C.u)<-2*M0).length,0),lap:LC,m1:M1,light:light(now()),cross:[gx0,gx1],lanes:LANES.filter(L=>!L.tiny).map(L=>({dir:L.dir,fly:!!L.fly,z:L.z,stop:xOf(L,L.stop),cars:L.cars.map(C=>({model:C.model,x:xOf(L,((C.u%LC)+LC)%LC),on:(((C.u%LC)+LC)%LC)<SPAN,len:size(C.model)[2]*M1/2,s:+((((C.u%LC)+LC)%LC)/T).toFixed(1),sp:+(C.sp/M0).toFixed(1),shown:!!(C.m&&C.m.visible)}))}))});
}
export {TRAFFIC};
