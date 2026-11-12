// THE BALLOON: black balloons (sold on the bodega's shelves) — hold one and click: it lifts you over fences, cars, water and the golems (not buildings), WASD drifts you along; click again to come down; a balloon has two minutes of air, then it sinks you gently and is gone.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ITEMS, pos, RIDE, SFX, SPEED, st} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const BALLOON={AIR:120}; window.BALLOON=BALLOON;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K, say=(t,c)=>SAY(t,c||'#e8e2cc'), prop=(id,k)=>ITEMS.prop?ITEMS.prop(id,k):undefined;
  FORAGE.add({names:{balloon:'BLACK BALLOON'}});
  // the air left in your balloon carries over between flights
  let air=null; const airGet=()=>{ if(air==null){ const v=OWNED.get('balloonair'); air=v==null?BALLOON.AIR:+v; if(!(air>=0))air=BALLOON.AIR; } return air; }, airSet=v=>{ air=v; try{ OWNED.set('balloonair',v.toFixed(1)); }catch(e){} };

  /* ---------- the balloon: glossy black, a knot, a white ribbon curling down to your hands ---------- */
  const balloon=(s=1)=>{ '@later'; const G=new THREE.Group(), blk=new THREE.MeshStandardMaterial({color:0x0c0c10,roughness:.18,metalness:.1}), rib=new THREE.MeshStandardMaterial({color:0xf2f0ea,roughness:.6});
    const b=new THREE.Mesh(new THREE.SphereGeometry(.42,32,24),blk); b.scale.set(1,1.18,1); b.position.y=2.75; G.add(b); const kn=new THREE.Mesh(new THREE.ConeGeometry(.05,.08,12),blk); kn.position.y=2.25; kn.rotation.x=Math.PI; G.add(kn);
    const pts=[]; for(let i=0;i<=24;i++){ const u=i/24; pts.push(new THREE.Vector3(Math.sin(u*14)*.05*(1-u),2.22-u*.62,Math.cos(u*14)*.05*(1-u))); }
    G.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.008,6),rib)); G.userData.b=b; G.scale.setScalar(T*s); return G; };
  BALLOON.mesh=balloon;

  /* ---------- riding it: you rise, then drift; a wall of a building stops you, a bench or a car does not ---------- */
  const TOP=3.2;
  const fly=p=>{ '@later'; const B=SHARED.BOUND, r=.36; p.x=Math.max(B.x0,Math.min(B.x1,p.x)); p.z=Math.max(B.z0,Math.min(B.z1,p.z));
    for(const [x0,z0,x1,z1] of SHARED.solids){ const w=x1-x0, d=z1-z0; if(Math.min(w,d)<2.5*T&&w*d<12*T*T)continue; const cx=Math.max(x0,Math.min(x1,p.x)), cz=Math.max(z0,Math.min(z1,p.z)), dx=p.x-cx, dz=p.z-cz, d2=dx*dx+dz*dz;
      if(d2>=r*r)continue; if(d2>1e-8){ const q=Math.sqrt(d2); p.x=cx+dx/q*r; p.z=cz+dz/q*r; } else { const o=[p.x-x0+r,x1-p.x+r,p.z-z0+r,z1-p.z+r], m=Math.min(...o); if(m===o[0])p.x=x0-r; else if(m===o[1])p.x=x1+r; else if(m===o[2])p.z=z0-r; else p.z=z1+r; } } };
  const POSE={k:'zip',z:0,sway:0};
  RIDE.kind('lift',{name:'BLACK BALLOON',cat:'balloon',hint:'E AND IT LIFTS YOU. WASD DRIFTS. E BRINGS YOU DOWN.',onSay:'THE BALLOON TUGS. YOUR FEET LEAVE THE GROUND.',held:.5,dry:true,hop:false,ease:6,
    make:()=>balloon(),
    on:R=>{ R.h=0; R.down=SHARED.LVL!=='up'; R.vx=0; R.vz2=0; R.warned=false; const a=airGet(); say('THE BALLOON HAS AIR FOR '+Math.ceil(a)+' S.','#d8d8e8'); },
    leave:R=>{ if(!R.down){ R.down=true; say('YOU LET A LITTLE AIR OUT. YOU SINK.','#d8d8e8'); } },
    step:(R,dt,I)=>{ '@later'; const id=R.on; let a=airGet(); if(R.h>.05*T)a=Math.max(0,a-dt); air=a; if((R.saveT=(R.saveT||0)-dt)<=0){ R.saveT=3; airSet(a); }
      if(a<15&&!R.warned){ R.warned=true; say('THE BALLOON IS GOING SOFT.','#c8a090'); }
      const sinking=R.down||a<=0, want=sinking?0:TOP*T; R.h=Math.max(0,R.h+Math.max(-(a<=0?.6:1.1)*T*dt,Math.min(1.4*T*dt,want-R.h)));
      if(sinking&&R.h<=0){ if(a<=0){ FORAGE.take(id,1); if(FORAGE.draw)FORAGE.draw(); airSet(BALLOON.AIR); RIDE.off('THE BALLOON WRINKLES AND IS DONE.'); if(SFX.play)SFX.play('click',{vol:.5,pitch:.4}); } else { airSet(a); RIDE.off('YOUR FEET FIND THE GROUND.'); } return true; }
      const up=Math.min(1,R.h/(1.5*T)), vmax=(+prop(id,'speed')||5)*T*up*SPEED.of('balloon'), k=Math.min(1,dt*1.6);
      R.vx+=((I.ml?I.mx/I.ml*vmax:0)-R.vx)*k; R.vz2+=((I.ml?I.mz/I.ml*vmax:0)-R.vz2)*k;
      pos.x+=R.vx*dt; pos.z+=R.vz2*dt; fly(pos); R.v=Math.hypot(R.vx,R.vz2); if(R.v>.3*T)R.hd=Math.atan2(R.vx,R.vz2); SHARED.heading=R.hd;
      const t=performance.now()/1000; R.lift=R.h+Math.sin(t*1.3)*.06*T*up; POSE.sway=Math.sin(t*1.1)*.06*up-R.vx/T*.02; st.ride=POSE; return true; },
    pose:()=>POSE,
    place:(m,R,t)=>{ m.position.y+=.15*T; m.rotation.z=Math.sin(t*1.1)*.05; m.rotation.x=-Math.min(.25,(R.v||0)/T*.03); },
    floor:(g,R)=>g+(R.lift||0), off:()=>{} });
  BALLOON.air=()=>airGet();
}
