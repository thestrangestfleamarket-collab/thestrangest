// THE TRAFFIC: cars driving both ways along Market St and flying cars and small spacecraft above them, from the shared clock so every player sees the same ones; the park gate's crossing light (built in 069-dress) turns on a timer or its button, the cars stop at its line and for anyone in the road.
import {SHARED, THREE} from './003-shx.js';
import {CARLAMPS, CULL, DRESS, ONLINE, PARK, pos, SPEED, UI, VLOOK, WALKS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OUT, SOL, SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {TLX} from './069-dress.js';
const TRAFFIC={lanes:[],skew:0}; window.TRAFFIC=TRAFFIC;
{ const TD=__LAZY__("data/traffic.json"), T=TILE, M0=T/.84, M1=M0*1.4, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const now=()=>(TRAINS.now?TRAINS.now():Date.now()/1000)+TRAFFIC.skew;
  const GAME=['muscle-car-60s','convertible-60s','station-wagon-70s','pickup-truck-70s','wedge-coupe-80s','camper-van'];
  const zs=Z(SHARED.BOD.CURB), zp=Z(SHARED.BOD.FAR), zm=(zs+zp)/2, xW=X(-129), xE=X(261), SPAN=xE-xW, OFF=40*M0, LC=SPAN+OFF;
  const gx0=X(PARK.gate[0]+PARK.ox), gx1=X(PARK.gate[1]+PARK.ox);
  // the lanes: right-hand traffic, westbound on the shops' side; the fliers 8 m over the same lanes, stopping at the fliers' light over the crossing light
  const LANES=[{dir:-1,z:(zs+zm)/2,fly:0,v:10*M0,n:5,seed:0},{dir:1,z:(zp+zm)/2,fly:0,v:10*M0,n:5,seed:3},{dir:-1,z:(zs+zm)/2,fly:8*M0,v:14*M0,n:3,seed:5},{dir:1,z:(zp+zm)/2,fly:8*M0,v:14*M0,n:3,seed:8}];
  for(const L of LANES){ L.stop=L.dir<0?(xE-gx1)-1.6*M0:(gx0-xW)-1.6*M0; L.cars=[]; for(let i=0;i<L.n;i++)L.cars.push({i,u:null,sp:L.v,model:null,m:null,lap:-1,sol:null}); }
  TRAFFIC.lanes=LANES;
  // the owner's extra vehicles (VLOOK.more: model -> how many more, ADMIN > VEHICLE EDITOR), each one more in a lane of its kind, its model kept; the lanes spaced again
  for(const L of LANES)L.n0=L.n;
  const fleet=()=>{ const M=VLOOK.more||{}, fly=k=>!!(D&&D[k]&&D[k].fly), add=LANES.map(()=>[]);
    for(const k in M){ const ls=LANES.map((L,i)=>i).filter(i=>!!LANES[i].fly===fly(k)); for(let j=0;j<Math.min(20,M[k]|0);j++)add[ls[j%ls.length]].push(k); }
    LANES.forEach((L,i)=>{ const want=add[i].join(), had=L.cars.filter(C=>C.fixed).map(C=>C.fixed).join(); if(want===had)return; for(const C of L.cars){ give(C); if(C.sol)C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; }
      L.cars=L.cars.filter(C=>!C.fixed); for(const k of add[i])L.cars.push({i:0,u:null,sp:L.v,model:k,fixed:k,m:null,lap:-1,sol:null}); L.n=L.cars.length; L.cars.forEach((C,j)=>{ C.i=j; C.u=null; }); }); };
  TRAFFIC.fleet=fleet;
  // a look changed: the copies on the road are made again from their model
  VLOOK.on(()=>{ if(!D)return; for(const L of LANES)for(const C of L.cars)give(C); for(const k in POOL){ for(const m of POOL[k])GRP.remove(m); POOL[k]=[]; } fleet(); });
  // the owner's speeds (SPEED.of('traffic'), SPEED.of('fliers')): a change moves every car's place on the clock by whole laps, so each keeps where it is and eases to its new place
  const speeds=()=>{ const t=now(); for(const L of LANES){ L.v0=L.v0||L.v; const v=L.v0*SPEED.of(L.fly?'fliers':'traffic'); if(v===L.v)continue; const sh=Math.round(t*(v-L.v)/LC)*LC; L.v=v; for(const C of L.cars)if(C.u!=null)C.u+=sh; } };
  speeds(); SPEED.on(speeds);

  /* ---------- the light: green, then on a timer (or sooner by the button) amber and red with WALK, everyone's the same from the clock ---------- */
  const CY=90, P0=()=>+((ONLINE.world||{})['xing:gate'])||0;
  const light=t=>WALKS.sim.light(t,P0());   // one clock with the walkers on the server (worker/folk.js)
  TRAFFIC.light=()=>light(now()); if(window.TLX)TLX.gate=TRAFFIC.light; if(SHARED.BOD.road)SHARED.BOD.road.walk=()=>TRAFFIC.light().x==='w';   // walkers wait for it (076 pedHold)
  TRAFFIC.press=()=>{ const t=now(), r=((t%CY)+CY)%CY, L=light(t); if(L.m!=='g')return say(L.x==='w'?'WALK.':'WAIT FOR THE WALK.'); if(t-P0()<35||r>=47)return say('THE LIGHT CHANGES SOON.'); ONLINE.put('xing:gate',String(Math.round(t*10)/10)); say('YOU PRESS THE BUTTON. WAIT FOR THE WALK.'); };

  /* ---------- the buttons: a yellow box on each crossing light's pole ---------- */
  { const bm=new THREE.MeshLambertMaterial({color:0xf2c418}), dm=new THREE.MeshLambertMaterial({color:0x1a1b1e}), bg=new THREE.BoxGeometry(.2*M0,.28*M0,.12*M0), pg=new THREE.CylinderGeometry(.05*M0,.05*M0,.04*M0,10).rotateX(Math.PI/2);
    for(const S of DRESS.sig||[]){ const g=new THREE.Group(), b=new THREE.Mesh(bg,bm), p=new THREE.Mesh(pg,dm); p.position.z=-.07*M0; g.add(b,p); g.position.set(...S.btn); g.rotation.y=S.sd>0?0:Math.PI; scene.add(g); OUT.add(g,'open');
      UI.thing({name:'CROSSING BUTTON',obj:g,reach:1.2*T,near:3*T,tall:.4*M0,act:()=>TRAFFIC.press()}); } }

  /* ---------- the vehicles: the game's own cars (150p) and Polyfork's (data/traffic.json), one model made once and copied ---------- */
  let D=null; const TPL={}, POOL={}, GRP=new THREE.Group(); scene.add(GRP);
  const MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const geo=Q=>{ const q=new Int16Array(Uint8Array.from(atob(Q.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(Q.c),c=>c.charCodeAt(0)), b=Q.b, P=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<q.length;i++){ const a=i%3; P[i]=b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]); }
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const lid=k=>D&&D[k]?'tr:'+k:'car:'+k, size=k=>{ const s=D&&D[k]?D[k].size:[2,1.4,4.9], l=VLOOK.scaleOf(lid(k)); return l===1?s:s.map(v=>v*l); };
  const tpl=k=>{ if(TPL[k])return TPL[k]; let g=null; if(D[k]){ g=new THREE.Group(); const me=new THREE.Mesh(geo(D[k].parts.body),MAT); me.name='BODY'; me.castShadow=true; g.add(me); g.scale.setScalar(M1); VLOOK.dress('tr:'+k,g); } else if(window.CARS&&CARS.build)g=CARS.build(k); if(g)g.traverse(o=>{ o.userData.anyRoom=false; }); return TPL[k]=g; };
  const take=k=>{ const P=POOL[k]||(POOL[k]=[]); if(P.length)return P.pop(); const t=tpl(k); if(!t)return null; const m=t.clone(); GRP.add(m); return m; };
  const give=C=>{ if(!C.m)return; C.m.visible=false; (POOL[C.model]||(POOL[C.model]=[])).push(C.m); C.m=null; };
  const pick=(L,C,lap)=>{ if(C.fixed)return C.fixed; const list=L.fly?L.FL:L.GR; return list[(C.i*7+lap*3+L.seed*5)%list.length]; };

  /* ---------- driving: each car keeps to its place on the clock, slowing for the light, the car ahead and anyone in the road, then catching up ---------- */
  const xOf=(L,s)=>L.dir>0?xW+s:xE-s;
  const blockers=()=>{ const B=[{x:pos.x,z:pos.z}]; for(const o of (ONLINE.others&&ONLINE.others.values())||[])if(o.p&&!o.dead)B.push({x:o.p.x,z:o.p.z}); if(window.CARS&&CARS.cars)for(const C of CARS.cars.values())if(!C.by&&C.mesh)B.push({x:C.x,z:C.z,r:2.4*M1}); return B; };
  const step=dt=>{ const t=now(), Lt=light(t), B=LANES[0].GR?blockers():[], R=Math.max(90*T,(window.CULL&&CULL.R)||0), up=OUT.open&&!(PARK.within&&PARK.within(pos.x,pos.z))&&SHARED.LVL==='up';
    for(const L of LANES){ if(!L.GR)continue; const hw=Math.abs(zs-zm)/2+.6*M0;
      const nom=C=>t*L.v+C.i*LC/L.n;
      for(const C of L.cars){ if(C.u==null||!C.m&&Math.abs(nom(C)-C.u)>LC*.8){ C.u=nom(C); C.sp=L.v; } }
      const ord=L.cars.slice().sort((a,b)=>b.u-a.u);
      ord.forEach((C,j)=>{ const s=((C.u%LC)+LC)%LC, len=size(C.model)[2]*M1/2; let lim=Infinity;
        if(Lt.m!=='g'&&s+len<=L.stop){ const g=L.stop-(s+len); if(Lt.m==='r'||g>C.sp*C.sp/(2*5*M0))lim=Math.min(lim,g); }
        { const A=ord[j-1]||ord[ord.length-1]; if(A!==C){ let g=A.u-C.u; if(g<0)g+=LC; g-=len+size(A.model)[2]*M1/2+2*M0; lim=Math.min(lim,g); } }
        if(!L.fly){ if(s<SPAN){ const x=xOf(L,s); for(const b of B){ if(Math.abs(b.z-L.z)>hw+(b.r||0))continue; const d=(b.x-x)*L.dir-(b.r||.5*M0); if(d>-len&&d<len+28*M0)lim=Math.min(lim,d-len-2*M0); } } }
        const want=Math.min(L.v+Math.max(-.5*L.v,Math.min(.6*L.v,(nom(C)-C.u)*.25)),lim<Infinity?Math.sqrt(2*4*M0*Math.max(0,lim)):1e9);
        C.sp+=Math.max(-9*M0*dt,Math.min(3*M0*dt,want-C.sp)); if(C.sp<0)C.sp=0; if(lim<.05*M0&&lim<Infinity)C.sp=Math.min(C.sp,0); C.u+=C.sp*dt;
        const s2=((C.u%LC)+LC)%LC, lap=Math.floor(C.u/LC), on=s2<SPAN, x=xOf(L,s2), near=on&&up&&Math.abs(x-pos.x)<R&&Math.abs(L.z-pos.z)<R;
        if(lap!==C.lap&&!on){ give(C); C.lap=lap; C.model=pick(L,C,lap); } if(C.model==null){ C.lap=lap; C.model=pick(L,C,lap); }
        if(near&&!C.m){ C.m=take(C.model); } if(!near&&C.m)give(C);
        if(C.m){ const y=L.fly?SHARED.groundY(x,L.z)+L.fly+Math.sin(t*1.3+C.i*2)*.25*M0:SHARED.groundY(x,L.z); C.m.visible=true; C.m.position.set(x,y,L.z); C.m.rotation.set(0,L.dir>0?Math.PI/2:-Math.PI/2,L.fly?Math.sin(t*.9+C.i)*.04:0); }
        if(!L.fly){ if(!C.sol){ C.sol=[-1e7,-1e7,-1e7,-1e7]; SOL.up.push(C.sol); } const w=size(C.model)[0]*M1/2; if(C.m){ C.sol[0]=x-len; C.sol[2]=x+len; C.sol[1]=L.z-w; C.sol[3]=L.z+w; } else C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; } }); } };
  let tP=null; SYS.add('life',()=>{ if(!D)return; const t=now(); let d=tP==null?0:t-tP; tP=t; if(d<0||d>30){ for(const L of LANES)for(const C of L.cars)if(!C.m)C.u=null; d=0; }
    const n=Math.min(120,Math.max(1,Math.ceil(d/.06))); for(let k=0;k<n;k++)step(d/n); },'150pb-traffic');

  /* ---------- the kit fetched after the start, the game's cars once theirs are in ---------- */
  const carsIn=()=>!!(window.CARS&&CARS.dbg&&CARS.build&&CARS.dbg().loaded);
  let asked=false; SYS.add('life',()=>{ if(asked||!window.__started)return; asked=true; TD().then(d=>{ D=d; const ks=Object.keys(d).filter(k=>d[k]&&d[k].parts);
      const fl=ks.filter(k=>d[k].fly), gr=ks.filter(k=>!d[k].fly), ready=()=>{ const g=carsIn()?gr.concat(GAME):gr; for(const L of LANES){ L.FL=fl; L.GR=g; } };
      for(const k of ks)VLOOK.kind('tr:'+k,{name:d[k].name,grp:d[k].fly?'FLYING TRAFFIC':'ROAD TRAFFIC',make:()=>{ const g=new THREE.Group(), me=new THREE.Mesh(geo(d[k].parts.body),MAT); me.name='BODY'; g.add(me); g.scale.setScalar(M1); return VLOOK.dress('tr:'+k,g); },traffic:k});
      ready(); fleet(); let n=0; const again=()=>{ if(carsIn()){ for(const L of LANES)for(const C of L.cars){ give(C); C.lap=-1; C.model=null; } ready(); } else if(++n<30)setTimeout(again,2000); }; setTimeout(again,2000);
    }).catch(e=>console.warn('TRAFFIC: the vehicles did not load',e)); },'150pb-traffic');
  // their lamps (150pc): every car on the road, measured once from its model
  const DIM={}, dimOf=k=>DIM[k]||(DIM[k]=(()=>{ const t=tpl(k); if(!t)return null; const b=new THREE.Box3().setFromObject(t); return [b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z,b.min.y]; })());
  CARLAMPS.src.push(out=>{ for(const L of LANES)for(const C of L.cars){ if(!C.m||!C.m.visible)continue; const d=dimOf(C.model); if(d)out.push({x:C.m.position.x,y:C.m.position.y,z:C.m.position.z,r:C.m.rotation.y,dim:d,fly:!!L.fly}); } });
  TRAFFIC.dbg=()=>({loaded:!!D,light:light(now()),cross:[gx0,gx1],lanes:LANES.map(L=>({dir:L.dir,fly:!!L.fly,z:L.z,stop:xOf(L,L.stop),cars:L.cars.map(C=>({model:C.model,x:xOf(L,((C.u%LC)+LC)%LC),on:(((C.u%LC)+LC)%LC)<SPAN,len:size(C.model)[2]*M1/2,s:+((((C.u%LC)+LC)%LC)/T).toFixed(1),sp:+(C.sp/M0).toFixed(1),shown:!!(C.m&&C.m.visible)}))}))});
}
