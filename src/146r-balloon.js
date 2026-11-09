// THE BALLOON WITCH: a tiny witch carried over Market St by her black balloon, who sells black balloons — hold one and click: it lifts you over fences, cars, water and the golems (not buildings), WASD drifts you along; click again to come down; a balloon has two minutes of air, then it sinks you gently and is gone.
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

  /* ---------- her: tiny, all black — a wide pointed hat, a cloak to her feet, gloved hands out like wings, small boots dangling; her balloon held high ---------- */
  const BLK='cloth:#16141a', HAT='cloth:#1c1a22', SKN='skin:#ecdccc', BOOT='leather:#121014';
  const model=()=>{ const sk=MERCH.skel({hipY:.62,neck:.36,shX:.15,shY:.3,upper:.2,fore:.19,hipX:.07,thigh:.28,shin:.27}), {B}=sk;
    mk(B.torso,drape(LATHE([[.1,-.04],[.12,.1],[.12,.22],[.1,.3],[.06,.36]],28,.85),.008),BLK);
    mk(B.torso,drape(new THREE.LatheGeometry([[.05,.38],[.14,.3],[.2,.1],[.25,-.2],[.3,-.55]].map(p=>new THREE.Vector2(p[0],p[1])),32,Math.PI*.35,Math.PI*1.3),.01),BLK,[0,0,-.01]);
    mk(B.hips,drape(LATHE([[.11,.04],[.15,-.1],[.2,-.35],[.24,-.5]],32,.9),.01),BLK);
    const H=grp(B.head,[0,.12,0]); mk(H,SPH(.1,32,24),SKN,[0,0,.005],[0,0,0],[.95,1,.95]);
    for(const s of [1,-1]){ mk(H,SPH(.016,14,10),'plain:#141216',[.035*s,.0,.088],[0,0,0],[1,1.2,.5]); mk(H,SPH(.005,8,6),'plain:#f4f4f4',[.03*s,.008,.095]); }
    mk(H,SPH(.104,32,20,0,Math.PI*2,0,Math.PI*.5),BLK,[0,.012,-.008],[-.25,0,0],[1,.9,1.05]); for(const s of [1,-1])mk(H,new THREE.CapsuleGeometry(.04,.12,6,12),BLK,[.085*s,-.06,-.02],[0,0,s*.08]);
    mk(H,new THREE.CylinderGeometry(.24,.24,.012,40),HAT,[0,.08,0],[-.12,0,0]); mk(H,LATHE([[.13,0],[.105,.12],[.075,.26],[.045,.4],[.02,.52],[0,.6]],28,1),HAT,[0,.085,-.01],[-.22,0,.16]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],new THREE.CylinderGeometry(.04,.038,.2,16),BLK,[0,-.09,0]); mk(B['upperArm'+n],SPH(.045,14,10),BLK);
      mk(B['forearm'+n],drape(new THREE.CylinderGeometry(.036,.07,.19,18,4,true),.006),BLK,[0,-.09,0]); mk(B['hand'+n],new THREE.CapsuleGeometry(.024,.035,6,12),'leather:#141216',[0,-.04,0],[0,0,0],[1.1,1,.6]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.04,.034,.28,14),BLK,[0,-.13,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.032,.03,.27,14),'cloth:#2a2830',[0,-.13,0]); mk(B['shoe'+n],new THREE.CapsuleGeometry(.032,.07,6,12),BOOT,[0,-.04,.025],[Math.PI/2,0,0]); }
    return sk; };
  const HB={g:null}, V=new THREE.Vector3();
  MERCH.add({key:'balloonwitch',label:'THE BALLOON WITCH',height:1.1,model,size:5,hd:0,
    lift:t=>(1.5+Math.sin(t*.9)*.12)*T,
    idle:t=>MERCH.pose({nod:-6+Math.sin(t*.7)*4,bend:4,L:{ua:[30,62+Math.sin(t*1.3)*6],fa:[14,10],th:[12+Math.sin(t*1.1)*8,4],sh:[18+Math.sin(t*1.1+1)*10,0],foot:-30},R:{ua:[172,8],fa:[176,4],th:[6+Math.sin(t*1.1+2)*8,4],sh:[26+Math.sin(t*1.1+3)*10,0],foot:-30}}),
    after:(B,N)=>{ if(!HB.g){ HB.g=balloon(1.25); N.g.parent.add(HB.g); } HB.g.visible=N.g.visible; MERCH.at(N,'handR',[0,-.05,0],V); HB.g.position.set(V.x,V.y-1.6*1.25*T,V.z); HB.g.rotation.z=Math.sin(performance.now()/900)*.04; }});
}
