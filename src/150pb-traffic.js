// THE TRAFFIC: cars driving both ways along Market St, flying cars and small spacecraft above them and the kei vans roaming its pavements, from the shared clock so every player sees the same ones; the park gate's crossing light (built in 069-dress) turns on a timer or its button, the cars stop at its line and for anyone in the road.
import {SHARED, THREE} from './003-shx.js';
import {CARLAMPS, CLOCK, CULL, DRESS, ONLINE, PARK, pos, SFX, SPEED, UI, VLOOK, WALKS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {LEVEL, MODS, OUT, SOL, SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {TLX} from './069-dress.js';
const TRAFFIC={lanes:[],skew:0}; window.TRAFFIC=TRAFFIC;
{ const TD=SYS.far(__LAZY__("data/traffic.json")), T=TILE, M0=T/.84, M1=M0*1.4, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const now=()=>(TRAINS.now?TRAINS.now():Date.now()/1000)+TRAFFIC.skew;
  // LOW: hover cars that keep to the road lanes, a hand over the ground; PACE: each model's own speed, a share of its lane's
  const LOW=['taxi-pod','station-wagon-70s'], HOV={'taxi-pod':.3,'station-wagon-70s':.8}, PACE={'muscle-car-60s':1.15,'wedge-coupe-80s':1.2,'station-wagon-70s':.95,'convertible-60s':1.05,'camper-van':.8,'police-cruiser-80s':1.1,'taxi-pod':1,'town-car':1,hatchback:.95,suv:1,minivan:.9,pickup:.9,interceptor:1.25,'escape-pod':.85,'taxi-coupe':1.05,ambulance:1.15,'police-flier':1.3};
  const GAME=['muscle-car-60s','convertible-60s','station-wagon-70s','wedge-coupe-80s','camper-van','police-cruiser-80s'];
  const zs=Z(SHARED.BOD.CURB), zp=Z(SHARED.BOD.FAR), zm=(zs+zp)/2, xW=X(-129), xE=X(261), SPAN=xE-xW, OFF=130*M0, LC=SPAN+OFF, HO=OFF/2;
  const gx0=X(PARK.gate[0]+PARK.ox), gx1=X(PARK.gate[1]+PARK.ox);
  // the lanes: right-hand traffic, westbound on the shops' side; the fliers 8 m over the same lanes, stopping at the fliers' light over the crossing light
  const LANES=[{dir:-1,z:(zs+zm)/2,fly:0,v:7.5*M0,n:6,seed:0},{dir:1,z:(zp+zm)/2,fly:0,v:7.5*M0,n:6,seed:3},{dir:-1,z:(zs+zm)/2,fly:8*M0,v:10.5*M0,n:4,seed:5},{dir:1,z:(zp+zm)/2,fly:8*M0,v:10.5*M0,n:4,seed:8}];
  for(const L of LANES){ L.stop=L.dir<0?(xE-gx1)-1.6*M0:(gx0-xW)-1.6*M0; L.cars=[]; for(let i=0;i<L.n;i++)L.cars.push({i,u:null,sp:L.v,model:null,m:null,lap:-1,sol:null}); }
  TRAFFIC.lanes=LANES; TRAFFIC.road={x0:xW,x1:xE,z0:Math.min(zs,zp),z1:Math.max(zs,zp)};
  // the owner's extra vehicles (VLOOK.more: model -> how many more, ADMIN > VEHICLE EDITOR), each one more in a lane of its kind, its model kept; the lanes spaced again
  for(const L of LANES)L.n0=L.n;
  const fleet=()=>{ const M=VLOOK.more||{}, fly=k=>!LOW.includes(k)&&(!!(D&&D[k]&&D[k].fly)||!!(MODS.cars&&MODS.cars.flies&&MODS.cars.flies(k))), add=LANES.map(()=>[]);
    for(const k in M){ const ls=LANES.map((L,i)=>i).filter(i=>!!LANES[i].fly===fly(k)); if(!ls.length)continue; for(let j=0;j<Math.min(20,M[k]|0);j++)add[ls[j%ls.length]].push(k); }
    LANES.forEach((L,i)=>{ const want=add[i].join(), had=L.cars.filter(C=>C.fixed).map(C=>C.fixed).join(); if(want===had)return; for(const C of L.cars){ give(C); if(C.sol)C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; }
      L.cars=L.cars.filter(C=>!C.fixed); for(const k of add[i])L.cars.push({i:0,u:null,sp:L.v,model:k,fixed:k,m:null,lap:-1,sol:null}); L.n=L.cars.length; L.cars.forEach((C,j)=>{ C.i=j; C.u=null; }); }); };
  TRAFFIC.fleet=fleet;
  // a look changed: the copies on the road are made again from their model
  VLOOK.on(()=>{ if(!D)return; for(const L of LANES)for(const C of L.cars)give(C); for(const V of KEI)give(V); for(const R of RINGS)R.m.forEach((m,i)=>{ if(m){ m.visible=false; (POOL[R.models[i]+'~0']||(POOL[R.models[i]+'~0']=[])).push(m); R.m[i]=null; } }); for(const k in POOL){ for(const m of POOL[k])GRP.remove(m); POOL[k]=[]; } fleet(); });
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
  // the Polyfork models' own looks (owner, 12 Nov 2026): a colour swapped for another as the model is made, one of its looks by v; the kei vans' 1980s paints (cream, harvest gold, avocado, burnt orange, powder blue, brick red, brown, forest green, silver, teal, navy, mustard)
  const TLIV={'kei-van':[0xefe6cf,0xd8a032,0x7b8a3a,0xc4612a,0x8db4d4,0xa63a2e,0x6a4630,0x3d6847,0xb7bcc2,0x2c7c84,0x2d3c62,0xe2c25a].map(c=>({f5f6f7:c,_only:/BODY/})),pickup:[null,{'69aab0':0xe8735a},{'69aab0':0xf0d878},{'69aab0':0x8fc0e0},{'69aab0':0xc23a30},{'69aab0':0xa8dcc0}],rover:[{'3f4149':0xb9bfc8,'5f656f':0x9aa1ab,'454f67':0x8d94a0}],'town-car':[{d6d5d0:0x17181b,c4c3bd:0x222327,_only:/BODY/}]};
  const looks=k=>TLIV[k]?TLIV[k].length:MODS.cars&&MODS.cars.looks?MODS.cars.looks(k):1;
  const geo=(Q,map)=>{ const q=new Int16Array(Uint8Array.from(atob(Q.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(Q.c),c=>c.charCodeAt(0)), b=Q.b, P=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<q.length;i++){ const a=i%3; P[i]=b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]); }
    for(let i=0;i<col.length;i+=3){ const t=map&&map[(col[i]<<16|col[i+1]<<8|col[i+2]).toString(16).padStart(6,'0')]; if(t!=null)c.setHex(t,THREE.SRGBColorSpace); else c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const SCALE={'kei-van':.2,interceptor:.5,'escape-pod':.5};
  const lid=k=>D&&D[k]?'tr:'+k:'car:'+k, size=k=>{ const G=MODS.cars&&MODS.cars.data&&MODS.cars.data(), s=D&&D[k]?D[k].size:G&&G.cars[k]?G.cars[k].size:[2,1.4,4.9], l=VLOOK.scaleOf(lid(k))*(SCALE[k]||1); return l===1?s:s.map(v=>v*l); };
  const body=(Q,k,v)=>{ const g=new THREE.Group(), map=TLIV[k]&&TLIV[k][(v|0)%TLIV[k].length]; for(const n in Q.parts){ const q=Q.parts[n], me=new THREE.Mesh(geo(q,map&&map._only&&!map._only.test(n)?null:map),MAT); me.name=n; me.position.set(...q.at); me.castShadow=true; g.add(me); } g.scale.setScalar(M1*(SCALE[k]||1)); return VLOOK.dress('tr:'+k,g); };
  const tpl=(k,v)=>{ const key=k+'~'+(v|0); if(TPL[key])return TPL[key]; let g=null; if(D[k])g=body(D[k],k,v); else if(MODS.cars&&MODS.cars.build)g=MODS.cars.build(k,v); if(g)g.traverse(o=>{ o.userData.anyRoom=false; }); return TPL[key]=g; };
  const take=(k,v)=>{ const key=k+'~'+(v|0), P=POOL[key]||(POOL[key]=[]); if(P.length)return P.pop(); const t=tpl(k,v); if(!t)return null; const m=t.clone(); GRP.add(m); if(MODS.cars&&MODS.cars.cab)MODS.cars.cab(m); return m; };
  const give=C=>{ if(!C.m)return; C.m.visible=false; const key=C.model+'~'+(C.v|0); (POOL[key]||(POOL[key]=[])).push(C.m); C.m=null; };
  // the patrol (owner, 9 Nov 2026: "one that drives by every 60 seconds"): the first car to set out after each minute's mark is the police cruiser, one way one minute, the other the next
  const PAT='police-cruiser-80s', patrol=(li,i,lap)=>{ const L=LANES[li], t0=(lap*LC-i*LC/L.n)/L.v, m=Math.floor(t0/60); return m>Math.floor((t0-LC/L.v/L.n)/60)&&(((m%2)+2)%2)===li; };
  TRAFFIC.patrol=patrol;
  const pick=(L,C,lap)=>{ if(C.fixed)return C.fixed; if(L.pat&&patrol(LANES.indexOf(L),C.i,lap))return PAT; const list=L.fly?L.FL:L.GR; return list[(C.i*7+lap*3+L.seed*5)%list.length]; };

  /* ---------- driving: each car keeps to its place on the clock, slowing for the light, the car ahead and anyone in the road, then catching up ---------- */
  const xOf=(L,s)=>L.dir>0?xW+s:xE-s;
  const blockers=()=>{ const B=[{x:pos.x,z:pos.z}]; for(const o of (ONLINE.others&&ONLINE.others.values())||[])if(o.p&&!o.dead)B.push({x:o.p.x,z:o.p.z}); if(MODS.cars&&MODS.cars.cars)for(const C of MODS.cars.cars.values()){ if(!C.by){ if(C.mesh)B.push({x:C.x,z:C.z,r:2.4*M1,w:2.6*M1}); continue; }   // (w: a parked car holds up only the lane it stands in, so one at the kerb is passed) if(MODS.cars.flies(C.model))continue;
      const o=C.by===(ONLINE.me||'me')?pos:(ONLINE.others&&ONLINE.others.get(C.by)||{}).p; if(o)B.push({x:o.x,z:o.z,r:2.4*M1}); }
    for(const V of KEI)if(V.road)B.push({x:V.x,z:V.z,r:.35*M0,kei:1}); return B; };   // a kei van crossing holds up the lanes it is in; a car being driven is where its driver is
  const room=(L,C,u)=>{ let r=Infinity; for(const A of L.cars){ if(A===C||A.u==null)continue; const d=(((A.u-u)%LC)+LC)%LC; r=Math.min(r,Math.min(d,LC-d)-(size(C.model)[2]+size(A.model)[2])*M1/2-2*M0); } return r; };
  // a car's place on the clock: it is mid-street at the same moment whatever its pace, a fast one setting out later and a slow one sooner, both out of sight
  const lapOf=u=>Math.floor((u+HO)/LC), NM={u:0,v:0,hid:false};
  const nomOf=(L,C,t)=>{ const U=t*L.v+C.i*LC/L.n, lap=Math.floor(U/LC), f=Math.max(SPAN/LC+.03,PACE[pick(L,C,lap)]||1), s=Math.max(-HO,Math.min(SPAN+HO,SPAN/2+(U-lap*LC-LC/2)*f)); NM.u=lap*LC+s; NM.v=s>-HO&&s<SPAN+HO?f*L.v:0; NM.hid=s<0||s>=SPAN; return NM; };
  TRAFFIC.pace=PACE;
  // the cars on the road that f(x,z) picks pull over for secs (a player's horn, 150pf)
  TRAFFIC.pull=(f,secs)=>{ const t=now(); let n=0; for(const L of LANES){ if(L.fly)continue; for(const C of L.cars){ if(!C.m||C.u==null)continue; const s=C.u-lapOf(C.u)*LC; if(s<0||s>=SPAN||!f(xOf(L,s),L.z))continue; C.over=t+secs; n++; } } return n; };
  const step=dt=>{ const t=now(), Lt=light(t), B=LANES[0].GR?blockers():[], R=Math.max(90*T,(window.CULL&&CULL.R)||0), up=OUT.open&&!(PARK.within&&PARK.within(pos.x,pos.z))&&SHARED.LVL==='up';
    for(const L of LANES){ if(!L.GR)continue; const hw=Math.abs(zs-zm)/2+.6*M0;
      const nom=C=>nomOf(L,C,t).u;
      // an unseen car far off its place goes back to it only where the road is clear (at rest if another car is close)
      for(const C of L.cars){ const N=nomOf(L,C,t), n=N.u, nv=N.v, hid=N.hid; if(C.u==null){ C.u=n; C.sp=nv; continue; } if(C.m||!C.re&&Math.abs(n-C.u)<=(hid?M0:LC*.8))continue; const r=room(L,C,n); if(r>0){ C.u=n; C.sp=r>L.v*L.v/(8*M0)?nv:0; C.re=0; } }
      L.cars.forEach(C=>{ const N=nomOf(L,C,t), nu=N.u, nv=N.v, s=C.u-lapOf(C.u)*LC, len=size(C.model)[2]*M1/2; let lim=Infinity;
        if(Lt.m!=='g'&&s+len<=L.stop){ const g=L.stop-(s+len); if(Lt.m==='r'||g>C.sp*C.sp/(2*5*M0))lim=Math.min(lim,g); }
        for(const A of L.cars)if(A!==C)lim=Math.min(lim,(((A.u-C.u)%LC)+LC)%LC-len-size(A.model)[2]*M1/2-2*M0);   // the car ahead on the road, whatever lap either is on
        if(!L.fly){ if(s>=0&&s<SPAN){ const x=xOf(L,s); C.blk=false; for(const b of B){ if(b.l?b.l!==L.dir:Math.abs(b.z-L.z)>(b.w||hw+(b.r||0)))continue; const d=(b.x-x)*L.dir-(b.r||.5*M0); if(d>-len&&d<len+28*M0){ lim=Math.min(lim,d-len-2*M0); if(d<len+(b.r?12:8)*M0)C.blk=true; } } } }
        const ov=!L.fly&&C.over>t; if(ov)lim=Math.min(lim,0); { const to=ov?Math.sign((L.dir<0?zs:zp)-L.z)*Math.abs(zs-zm)/2:0, d=to-(C.oz||0); C.oz=(C.oz||0)+Math.max(-2.2*M0*dt,Math.min(2.2*M0*dt,d)); }   // pulled over for a player's horn: half up its kerb, stopped, then back into its lane
        const want=Math.min(Math.max(s>=0?.5*L.v:0,nv+Math.max(-.5*L.v,Math.min(.6*L.v,(nu-C.u)*.25))),lim<Infinity?Math.sqrt(2*4*M0*Math.max(0,lim)):1e9);
        C.sp+=Math.max(-9*M0*dt,Math.min(3*M0*dt,want-C.sp)); if(C.sp<0)C.sp=0; if(lim<.05*M0&&lim<Infinity)C.sp=Math.min(C.sp,0); C.u+=C.sp*dt;
        const lap=lapOf(C.u), s2=C.u-lap*LC, on=s2>=0&&s2<SPAN, x=xOf(L,s2), near=on&&up&&Math.abs(x-pos.x)<R&&Math.abs(L.z-pos.z)<R;
        if(lap!==C.lap||C.model==null){ give(C); C.lap=lap; C.model=pick(L,C,lap); C.v=(C.i*3+lap+L.seed)%looks(C.model); }
        if(near&&!C.m){ C.m=take(C.model,C.v); } if(!near&&C.m)give(C);
        if(C.blk&&C.m&&Lt.x!=='w'&&C.sp<.15*L.v&&t-(L.hk||-99)>6){ L.hk=t; SFX.play('horn',{at:{x,z:L.z},far:40*T,vol:.6,pitch:.85+(C.i%4)*.07,delay:.3}); SYS.run('honk',{x,z:L.z,dx:L.dir,dz:0,by:null}); }   // stopped for something in the road: a honk, and what it is gets out of the way (150pf)
        if(C.m){ const y=L.fly?SHARED.groundY(x,L.z)+L.fly+Math.sin(t*1.3+C.i*2)*.25*M0:SHARED.groundY(x,L.z)+(LOW.includes(C.model)?(HOV[C.model]+Math.sin(t*1.3+C.i*2)*.06)*M0:0); C.m.visible=true; C.m.position.set(x,y,L.z+(C.oz||0)); C.m.rotation.set(0,L.dir>0?Math.PI/2:-Math.PI/2,L.fly?Math.sin(t*.9+C.i)*.04:0); }
        if(!L.fly){ if(!C.sol){ C.sol=[-1e7,-1e7,-1e7,-1e7]; SOL.up.push(C.sol); } const w=size(C.model)[0]*M1/2; if(C.m){ const z=L.z+(C.oz||0); C.sol[0]=x-len; C.sol[2]=x+len; C.sol[1]=z-w; C.sol[3]=z+w; } else C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; } }); } };
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
  /* ---------- the kei vans (owner, 14 Nov 2026: "dif colors and drive around ferely not in a stritch patch, driving aroudn diff speeds, diff styles"): a dozen, a fifth their size, each its own paint, pace and way of driving (cautious, normal, fast), each roaming its own stretch of the pavements: runs, stops and pulling out, U-turns, weaving, crossing at the crosswalks; from the shared clock, a cycle at a time; one waits at the kerb for the walk or a gap in the cars, and for a player or the van ahead, then catches up ---------- */
  const KEI=[], KCW=((SHARED.BOD.road&&SHARED.BOD.road.xw)||[]).filter(w=>w.ax==='x').map(w=>({x:X((w.a0+w.a1)/2),lit:!!w.lit})); TRAFFIC.kei=KEI;
  { const B=SHARED.BOD, PAV=[[Z(B.CURB-.9),Z(B.CURB-5.6)],[Z(B.FAR+.9),Z(B.FAR+4.2)]], zOf=(sd,o)=>PAV[sd][0]+o*(PAV[sd][1]-PAV[sd][0]);   // (o 0 at the kerb, 1 by the shops or the park wall)
    const KST={cautious:{v:[1.2,1.7],stop:.4,dw:[3,9],ut:.1,cross:.15,weave:0,pull:.35},normal:{v:[1.9,2.5],stop:.22,dw:[2,5],ut:.15,cross:.3,weave:.3,pull:.6},fast:{v:[3,4.2],stop:.08,dw:[1,2.5],ut:.22,cross:.45,weave:.9,pull:1}}, STY=Object.keys(KST);
    const rnd=a=>()=>{ a=a+0x6D2B79F5|0; let q=Math.imul(a^a>>>15,1|a); q=q+Math.imul(q^q>>>7,61|q)^q; return ((q^q>>>14)>>>0)/4294967296; };
    const N=TLIV['kei-van'].length; for(let i=0;i<N;i++){ const r=rnd(i*7919+11), st=STY[i%3], S=KST[st], h0=xW+(i+.5)/N*SPAN, lo=Math.max(xW+3*M0,h0-45*M0), hi=Math.min(xE-3*M0,h0+45*M0);
      KEI.push({i,st,S,model:'kei-van',v:i,hs:i%2,ho:.25+r()*.5,hd:r()<.5?1:-1,hx:Math.max(lo+12*M0,Math.min(hi-12*M0,h0)),lo,hi,P:240+Math.floor(r()*120),pace:.9+r()*.2,ret:(hi-lo+30*M0)/(S.v[0]*.9*M0)+20,C:{},lag:0,held:0,hk:-99,m:null,x:null,z:0,h:0,r:0,mv:0,road:false}); }
    // one cycle of a van's day: from its home spot and back to it in P seconds, every turn of it from its own seed
    const gen=(V,k)=>{ const r=rnd(V.i*7919+k*104729+5), S=V.S, t0=k*V.P, end=t0+V.P, K=[]; let t=t0, x=V.hx, sd=V.hs, o=V.ho, d=V.hd, slow=0;
      const sp=()=>(S.v[0]+r()*(S.v[1]-S.v[0]))*V.pace*M0, pt=(px,pz)=>K.push({t,x:px,z:pz,w:-1}), to=(px,pz,v)=>{ const p=K[K.length-1]; t+=Math.hypot(px-p.x,pz-p.z)/v; pt(px,pz); };
      const drive=(nx,no)=>{ const v=sp(); if(slow){ slow=0; const ax=x+d*Math.min(1.2*M0,Math.abs(nx-x)/2); to(ax,zOf(sd,o),v*S.pull); x=ax; }   // pulling out, slowly
        if(no!==o){ const ax=x+d*Math.min(2.5*M0,Math.abs(nx-x)/2); to(ax,zOf(sd,no),v*.9); x=ax; o=no; }   // over to another line
        to(nx,zOf(sd,o),v); x=nx; };
      const uturn=()=>{ const v=sp()*.6, o2=o<.5?Math.min(1,o+.6):Math.max(0,o-.6), z0=zOf(sd,o), z1=zOf(sd,o2), R=Math.abs(z1-z0)/2, zc=(z0+z1)/2, g=Math.sign(z1-z0); for(let a=1;a<=6;a++){ const A=a/6*Math.PI; to(x+d*R*Math.sin(A),zc-g*R*Math.cos(A),v); } o=o2; d=-d; };
      const cross=c=>{ drive(c.x-d*1.2*M0,Math.min(o,.2)); const v=sp()*.8; to(c.x,zOf(sd,0),v); K[K.length-1].w=KCW.indexOf(c); sd=1-sd; to(c.x,zOf(sd,0),v); x=c.x; d=r()<.5?1:-1; o=.25; to(x+d*1.2*M0,zOf(sd,o),v); x+=d*1.2*M0; };   // (the road begins at the marked point)
      const inR=c=>c.x>V.lo+5*M0&&c.x<V.hi-5*M0;
      pt(x,zOf(sd,o));
      for(let n=0;t<end-V.ret&&n<400;n++){ const a=r();
        if(a<S.stop){ t+=S.dw[0]+r()*(S.dw[1]-S.dw[0]); pt(x,zOf(sd,o)); slow=1; continue; }   // parked a while
        if(a<S.stop+S.ut&&(d>0?V.hi-x:x-V.lo)>3*M0){ uturn(); continue; }
        const c=KCW.find(c=>inR(c)&&(c.x-x)*d>3*M0&&(c.x-x)*d<40*M0); if(c&&r()<S.cross){ cross(c); continue; }
        const nx=x+d*(6+r()*22)*M0, lim=d>0?V.hi-3*M0:V.lo+3*M0; if((nx-lim)*d>0){ if((lim-x)*d>.5*M0)drive(lim,o); uturn(); continue; }
        drive(nx,r()<S.weave?+(.1+r()*.8).toFixed(2):o); }
      // home: back over the road if it crossed, then round to come up to its spot facing its way
      if(sd!==V.hs){ const c=KCW.filter(inR).sort((p,q)=>Math.abs(p.x-x)-Math.abs(q.x-x))[0]; if(c){ const a=(c.x-x)*d; if(a<3*M0){ if(a>-3*M0)drive(x+d*5*M0,o); uturn(); } cross(c); } }
      { const A=V.hx-V.hd*6*M0, a=(A-x)*d; if(a<.5*M0){ if(a>-3*M0)drive(x+d*4*M0,o); uturn(); } drive(A,o); if(d!==V.hd)uturn(); drive(V.hx,V.ho); }
      if(t>end-.5){ const f=(end-.5-t0)/(t-t0); for(const q of K)q.t=t0+(q.t-t0)*f; }   // (a long cycle driven a little quicker to be home in time)
      t=end; pt(V.hx,zOf(V.hs,V.ho));
      let h=V.hd>0?Math.PI/2:-Math.PI/2; for(let j=0;j<K.length;j++){ const n=K[j+1]; if(n&&Math.hypot(n.x-K[j].x,n.z-K[j].z)>1e-3)h=Math.atan2(n.x-K[j].x,n.z-K[j].z); K[j].h=h; }
      return K; };
    const at=(V,tau,o)=>{ const k=Math.floor(tau/V.P); let K=V.C[k]; if(!K){ K=V.C[k]=gen(V,k); for(const q in V.C)if(+q<k-1||+q>k+1)delete V.C[q]; }
      let a=0, b=K.length-1; while(b-a>1){ const m=(a+b)>>1; if(K[m].t<=tau)a=m; else b=m; } const p=K[a], n=K[b], f=n.t>p.t?Math.max(0,Math.min(1,(tau-p.t)/(n.t-p.t))):0;
      o.x=p.x+(n.x-p.x)*f; o.z=p.z+(n.z-p.z)*f; o.h=p.h; o.seg=p; o.mv=n.t>p.t?Math.hypot(n.x-p.x,n.z-p.z)/(n.t-p.t):0; return o; };
    TRAFFIC.keiAt=(i,t)=>{ const o=at(KEI[i],t==null?now():t,{}); return {x:o.x,z:o.z,h:o.h,mv:o.mv,road:o.seg.w>=0}; };
    const busy=x=>LANES.some(L=>!L.fly&&L.cars.some(C=>{ if(C.u==null)return false; const s=C.u-lapOf(C.u)*LC; if(s<0||s>=SPAN)return false; const dx=(x-xOf(L,s))*L.dir; return Math.abs(dx)<3*M0||dx>0&&dx<14*M0&&C.sp>.2*M0; }));
    const KO={}; let kT=null;
    SYS.add('life',()=>{ if(!D||!D['kei-van'])return; const t=now(); let dt=kT==null?0:t-kT; kT=t; if(dt<0||dt>30){ for(const V of KEI)if(!V.m)V.lag=0; dt=0; } dt=Math.min(dt,.5);
      const Lt=light(t), BL=LANES[0].GR?blockers():[], R=Math.max(90*T,(window.CULL&&CULL.R)||0), up=OUT.open&&SHARED.LVL==='up';
      for(const V of KEI){ at(V,t-V.lag,KO); const fx=Math.sin(KO.h), fz=Math.cos(KO.h); let why=0;
        if(KO.mv>0)for(const b of BL){ if(b.kei||b.l)continue; const dx=b.x-KO.x, dz=b.z-KO.z, f=dx*fx+dz*fz, s=Math.abs(dx*fz-dz*fx), rr=b.r||.4*M0; if(f>-.2*M0&&f<rr+1.3*M0&&s<rr+.45*M0){ why=1; break; } }   // someone in its way
        if(!why&&KO.mv>0)for(const W of KEI){ if(W===V||W.x==null)continue; const dx=W.x-KO.x, dz=W.z-KO.z, f=dx*fx+dz*fz; if(f>0&&f<1.1*M0&&Math.abs(dx*fz-dz*fx)<.5*M0&&Math.cos(W.h-KO.h)>.3){ why=2; break; } }   // the van ahead going its way
        if(!why&&KO.seg.w>=0&&t-V.lag-KO.seg.t<.8){ const c=KCW[KO.seg.w]; if(c.lit?Lt.x!=='w':busy(c.x)){ why=3; V.lag=t-KO.seg.t; } }   // at the kerb: the walk, or a gap in the cars
        if(why){ if(why<3)V.lag+=dt; V.held+=dt; } else { V.held=0; if(V.lag>0)V.lag=Math.max(0,V.lag-dt*.5); }
        if(V.lag>90&&!V.m)V.lag=0;
        at(V,t-V.lag,KO); V.x=KO.x; V.z=KO.z; V.h=KO.h; V.mv=why?0:KO.mv; V.road=KO.z>Math.min(zs,zp)&&KO.z<Math.max(zs,zp);
        if(why===1&&V.st==='fast'&&V.held>1.2&&t-V.hk>5&&V.m){ V.hk=t; SFX.play('horn',{at:{x:V.x,z:V.z},far:18*T,vol:.22,pitch:1.7,delay:.1}); }   // a fast one beeps at whoever is in its way
        const near=up&&Math.abs(V.x-pos.x)<R&&Math.abs(V.z-pos.z)<R;
        if(near&&!V.m){ V.m=take(V.model,V.v); V.r=V.h; } if(!near&&V.m)give(V); if(!V.m)continue;
        const e=Math.atan2(Math.sin(V.h-V.r),Math.cos(V.h-V.r)); V.r+=e*Math.min(1,dt*7);
        V.m.visible=true; V.m.position.set(V.x,SHARED.groundY(V.x,V.z),V.z); V.m.rotation.set(0,V.r,0); } },'150pb-traffic'); }
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
  CARLAMPS.src.push(out=>{ for(const R of RINGS)R.m.forEach((m,i)=>{ const d=m&&m.visible&&dimOf(R.models[i]); if(d)out.push({x:m.position.x,y:m.position.y,z:m.position.z,r:m.rotation.y,dim:d,fly:!R.ground,own:!!(MODS.cars&&MODS.cars.own&&MODS.cars.own(R.models[i])),sp:R.v}); }); for(const L of LANES)for(const C of L.cars){ if(!C.m||!C.m.visible)continue; const d=dimOf(C.model); if(d)out.push({x:C.m.position.x,y:C.m.position.y,z:C.m.position.z,r:C.m.rotation.y,dim:d,fly:!!L.fly,own:!!(MODS.cars&&MODS.cars.own&&MODS.cars.own(C.model)),sp:C.sp}); }
    for(const V of KEI){ if(!V.m||!V.m.visible)continue; const d=dimOf(V.model); if(d)out.push({x:V.m.position.x,y:V.m.position.y,z:V.m.position.z,r:V.m.rotation.y,dim:d,fly:false,own:false,sp:V.mv}); } });
  TRAFFIC.dbg=()=>({loaded:!!D,rings:RINGS.map(R=>({id:R.id,len:R.len/M0,models:R.models,shown:R.m.filter(m=>m&&m.visible).length})),park:[PARK.x0+PARK.ox,PARK.x1+PARK.ox,PARK.y0+PARK.oy,PARK.y1+PARK.oy],kei:KEI.map(V=>({style:V.st,look:V.v,x:+(V.x/M0).toFixed(1),z:+(V.z/M0).toFixed(1),shown:!!V.m,s:V.m?V.m.scale.x:0,lag:+V.lag.toFixed(1)})),cw:KCW.length,clip:LANES.reduce((n,L)=>n+L.cars.filter(C=>C.u!=null&&room(L,C,C.u)<-2*M0).length,0),lap:LC,m1:M1,light:light(now()),cross:[gx0,gx1],lanes:LANES.map(L=>({dir:L.dir,fly:!!L.fly,z:L.z,stop:xOf(L,L.stop),cars:L.cars.map(C=>({model:C.model,x:xOf(L,((C.u%LC)+LC)%LC),on:(((C.u%LC)+LC)%LC)<SPAN,len:size(C.model)[2]*M1/2,s:+((((C.u%LC)+LC)%LC)/T).toFixed(1),sp:+(C.sp/M0).toFixed(1),shown:!!(C.m&&C.m.visible)}))}))});
}
export {TRAFFIC};
