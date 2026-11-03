// THE CARS: the racing-cars kit's six cars (data/cars.json, CC0) parked on Market St (their spots in data/world.json's cars); double-click one to get in and drive it (a RIDE kind boarded where it stands, on VEH: W goes, S brakes and backs, A and D steer); GET OUT (or F) parks it where it stands. The section's server keeps where each car is parked and who drives it, so everyone sees the same cars, one driver a car.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, PB, pos, RIDE, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
import {VEH} from './150o-physmore.js';
const CARD=__LAZY__("data/cars.json");
{ const T=TILE, M1=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS;
  const CARS=new Map(), KINDS={}; let DATA=null, mine=null, want=null;
  const CAR={cars:CARS,kinds:KINDS,get driving(){ return mine; }}; window.CARS=CAR;
  for(const c of LEVEL.cars||[])CARS.set(c.id,{id:c.id,model:c.model,x:X(c.x),z:Z(c.y),hd:(c.hd||0)*Math.PI/180,by:null,mesh:null,sol:null});

  /* ---------- the kit's meshes: a part's groups by material (int16 positions over its box, int8 normals, sRGB colours, uint16 indices) ---------- */
  const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const part=G=>{ const g=new THREE.Group(); for(const q of G){ const P=new Int16Array(b64(q.p).buffer), Nn=new Int8Array(b64(q.n).buffer), Cc=b64(q.c), I=new Uint16Array(b64(q.i).buffer), n=P.length/3, p=new Float32Array(n*3), nn=new Float32Array(n*3), c=new Float32Array(n*3);
      for(let v=0;v<n;v++)for(let k=0;k<3;k++){ p[v*3+k]=P[v*3+k]*q.s[k]+q.o[k]; nn[v*3+k]=Nn[v*3+k]/127; c[v*3+k]=Math.pow(Cc[v*3+k]/255,2.2); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nn,3)); geo.setAttribute('color',new THREE.BufferAttribute(c,3)); geo.setIndex(new THREE.BufferAttribute(I,1));
      const mat=new THREE.MeshLambertMaterial({vertexColors:true,...(q.e?{emissive:new THREE.Color(q.e[0],q.e[1],q.e[2]),emissiveIntensity:Math.min(2,q.k||1)}:{})}), me=new THREE.Mesh(geo,mat); me.castShadow=me.receiveShadow=true; g.add(me); } return g; };
  // a car in metres under one group scaled to the world: its body, a wheel at each corner (fl, fr, rl, rr; the right ones turned round), forward +z
  const build=model=>{ const D=DATA.cars[model], G=new THREE.Group(), B=part(D.body); G.add(B); const W=part(D.wheel), wh=D.wheels.map((w,i)=>{ const o=new THREE.Group(); o.position.set(w[0],w[1],w[2]); const inner=i?W.clone():W; if(i===1||i===3)inner.rotation.y=Math.PI; o.add(inner); G.add(o); return o; });
    G.userData.wh=wh; G.scale.setScalar(M1); return G; };

  /* ---------- each model a RIDE kind boarded where it stands, on VEH ---------- */
  const POSE={k:'kart',steer:0,z:0};
  const kindFor=model=>{ if(KINDS[model])return KINDS[model]; const D=DATA.cars[model], [w,h,L]=D.size, r=D.r, rest=.15, top=D.low+h;
    const V=VEH.make({half:[w*.46*M1,(top-.25)/2*M1,L*.47*M1],cy:((top+.25)/2-r)*M1,lift:(r+.05)*M1,mass:1200,wheels:D.wheels.map(q=>[q[0]*M1,(q[1]-r+rest)*M1,q[2]*M1]),r:r*M1,rest:rest*M1,travel:.12*M1,stiff:30,grip:3,
      engine:2400*M1,reverse:1200*M1,vmax:20*M1,vback:4*M1,brake:50*M1,idle:5*M1,steer:.55,steerFade:8*M1,knockR:1.6*M1,down:r*M1,wy:D.wheels[0][1],unit:M1});
    const k=KINDS[model]={name:D.name,world:true,hide:true,V,make:()=>build(model),lift:.001,acc:4,turn:1.4,drag:1.2,knock:99,hop:false,ease:20,
      on:()=>{ if(!PB.R)PB.load(); }, off:()=>V.drop(),
      pose:R=>{ POSE.steer=V.on?V.steer*2:0; return POSE; },
      step:(R,dt)=>{ if(!V.step(R))return false; st.ride=POSE; return true; },
      place:(m,R,t)=>{ const w=m.userData.wh; if(R===RIDE&&V.place(m,w))return; m.position.y=SHARED.groundY(m.position.x,m.position.z); for(let i=0;i<4;i++)w[i].rotation.x+=(R.v||0)*.02; } };
    RIDE.kind('car:'+model,k); return k; };

  /* ---------- parked: drawn where the section says, solid, a thing to double-click ---------- */
  const at=C=>{ if(!C.mesh)return; C.mesh.position.set(C.x,SHARED.groundY(C.x,C.z),C.z); C.mesh.rotation.set(0,C.hd,0); C.mesh.visible=!C.by;
    const D=DATA.cars[C.model], hw=D.size[0]/2*M1, hl=D.size[2]/2*M1, c=Math.abs(Math.cos(C.hd)), s=Math.abs(Math.sin(C.hd)), ex=hw*c+hl*s, ez=hw*s+hl*c;
    if(!C.sol){ C.sol=[0,0,0,0]; SOL.up.push(C.sol); } if(C.by){ C.sol[0]=C.sol[2]=C.sol[1]=C.sol[3]=-1e7; return; } C.sol[0]=C.x-ex; C.sol[1]=C.z-ez; C.sol[2]=C.x+ex; C.sol[3]=C.z+ez; };
  const show=()=>{ for(const C of CARS.values()){ if(!DATA.cars[C.model])continue; kindFor(C.model); if(!C.mesh){ C.mesh=build(C.model); C.mesh.userData.anyRoom=false; scene.add(C.mesh); const D=DATA.cars[C.model];
        UI.thing({name:D.name,obj:C.mesh,reach:1.8*M1+D.size[2]/2*M1,near:3*M1+D.size[2]/2*M1,tall:D.size[1]*M1,act:()=>getIn(C.id)}); } at(C); } };
  const fromWorld=(k,v)=>{ const C=CARS.get(k.slice(4)); if(!C||typeof v!=='string')return; const a=v.split(',').map(Number); if(a.length<3||!a.every(isFinite))return; C.x=a[0]; C.z=a[1]; C.hd=a[2]; at(C); };
  SYS.add('world',(k,v)=>{ if(typeof k==='string'&&k.startsWith('car:'))fromWorld(k,v); },'150p-cars');
  SYS.add('hi',m=>{ for(const C of CARS.values())C.by=m.cars&&m.cars[C.id]||null; for(const k in ONLINE.world||{})if(k.startsWith('car:'))fromWorld(k,ONLINE.world[k]); if(DATA)for(const C of CARS.values())at(C); },'150p-cars');

  /* ---------- in and out ---------- */
  const HUD=document.createElement('div'); HUD.id='carhud'; HUD.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:12;display:none;gap:10px;align-items:center;padding:6px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ece5d3;background:#0e1016e0;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  HUD.innerHTML='<span></span><button style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">GET OUT (F)</button>'; document.body.appendChild(HUD); HUD.querySelector('button').onclick=()=>getOut();
  const board=id=>{ const C=CARS.get(id), k=C&&kindFor(C.model); if(!k)return; C.by=ONLINE.me||'me'; at(C); pos.x=C.x; pos.z=C.z; SHARED.py=SHARED.groundY(C.x,C.z); SHARED.heading=C.hd; k.V.x=C.x; k.V.z=C.z; k.V.hd=C.hd;
    if(!RIDE.mount('car:'+C.model)){ C.by=null; at(C); if(ONLINE.on)ONLINE.send({t:'car',k:id,on:0}); return; } k.V.x=k.V.z=k.V.hd=null; mine=C; HUD.querySelector('span').textContent=k.name+' · W GO · S BRAKE · A D STEER'; HUD.style.display='flex'; say('YOU GET IN THE '+k.name+'.'); };
  const getIn=id=>{ const C=CARS.get(id); if(!C||!DATA)return; if(mine)return; if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(C.by&&C.by!==ONLINE.me)return say('SOMEONE IS DRIVING IT.','#c8a090');
    if(ONLINE.on&&ONLINE.me){ want=id; ONLINE.send({t:'car',k:id,on:1}); setTimeout(()=>{ if(want===id){ want=null; say('THE CAR DID NOT ANSWER. TRY AGAIN.','#c8a090'); } },4000); } else board(id); };
  const getOut=()=>{ const C=mine; if(!C)return; mine=null; HUD.style.display='none'; C.x=pos.x; C.z=pos.z; C.hd=SHARED.heading; C.by=null; RIDE.off('YOU GET OUT AND LEAVE IT PARKED.'); if(ONLINE.on)ONLINE.send({t:'car',k:C.id,on:0,at:[C.x,C.z,C.hd]}); at(C);
    const D=DATA.cars[C.model], s=(D.size[0]/2+.7)*M1; pos.x=C.x-Math.cos(C.hd)*s; pos.z=C.z+Math.sin(C.hd)*s; SHARED.py=SHARED.groundY(pos.x,pos.z); };
  CAR.getIn=getIn; CAR.getOut=getOut;
  ONLINE.hear.car=m=>{ const C=CARS.get(m.k); if(!C)return; if(m.no){ if(want===m.k){ want=null; say('SOMEONE IS DRIVING IT.','#c8a090'); } C.by=m.by; if(DATA)at(C); return; }
    if(typeof m.at==='string')fromWorld('car:'+m.k,m.at); if(m.by&&m.by===ONLINE.me){ if(want===m.k){ want=null; board(m.k); } return; } if(mine===C&&!m.by)return; C.by=m.by||null; if(DATA)at(C); };
  addEventListener('keydown',e=>{ if(!mine||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; if((e.key||'').toLowerCase()==='f'){ e.preventDefault(); getOut(); } });
  // the ride ended some other way (a fall, a crash): the car parks where it stopped
  SYS.add('life',()=>{ if(mine&&!(RIDE.on&&RIDE.on==='car:'+mine.model)){ const C=mine; mine=null; HUD.style.display='none'; C.x=pos.x; C.z=pos.z; C.hd=SHARED.heading; C.by=null; if(ONLINE.on)ONLINE.send({t:'car',k:C.id,on:0,at:[C.x,C.z,C.hd]}); if(DATA)at(C); } },'150p-cars');

  // the ground's height is only true near you: a parked car within reach is set on it again now and then
  let gT=0; SYS.add('life',dt=>{ if(!DATA||(gT-=dt||0)>0)return; gT=.5; for(const C of CARS.values())if(C.mesh&&C.mesh.visible&&Math.hypot(C.x-pos.x,C.z-pos.z)<60*T)C.mesh.position.y=SHARED.groundY(C.x,C.z); },'150p-cars');
  /* ---------- the kit fetched after the start ---------- */
  let asked=false; SYS.add('life',()=>{ if(asked||!window.__started)return; asked=true; CARD().then(d=>{ DATA=d; show(); }).catch(e=>console.warn('CARS: the kit did not load',e)); },'150p-cars');
  CAR.dbg=()=>({loaded:!!DATA,cars:[...CARS.values()].map(C=>({id:C.id,model:C.model,x:+(C.x/T+SHARED.BOD.OX).toFixed(1),z:+(C.z/T+SHARED.BOD.OY).toFixed(1),hd:+C.hd.toFixed(2),by:C.by,shown:!!(C.mesh&&C.mesh.visible)})),driving:mine&&mine.id,veh:mine?!!KINDS[mine.model].V.on:false,rb:mine&&KINDS[mine.model].V.rb?(()=>{ const V=KINDS[mine.model].V, p=V.rb.translation(), r=V.rb.rotation(); return {p:[p.x/T+SHARED.BOD.OX,p.y/T,p.z/T+SHARED.BOD.OY].map(v=>+v.toFixed(2)),r:[r.x,r.y,r.z,r.w].map(v=>+v.toFixed(2)),sp:+(V.sp/T).toFixed(2)}; })():null,v:+((RIDE.v||0)/T).toFixed(2)});
}
