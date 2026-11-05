// THE DUTIES: the town staff's calls out, putting out fires, treating the hurt and picking up the trash.
import {SHARED, THREE} from './003-shx.js';
import {B64, SKIN} from './003a-skin.js';
import {CITY, CIVIC, CLOCK, DRESS, LITE, NPCS, pos, VIT, WX} from './003b-systems.js';
import {MAPG, MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
const VEHD=__DATA__("data/trashbag.json");
if(CITY.on){ const T=TILE, S_=CIVIC.staff, H_=CIVIC.house, log=CIVIC.note, G=(x,z)=>MODS.bodega.ground(x,z);
  const far=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z)>18*T;
  const dispatch=(S,veh,spot,then,v)=>{ S.state='on a call'; CIVIC.go(S,spot,then,(v||2.2)*(far(S.N.st,spot)?1.5:1)); };
  const back=(S,veh)=>CIVIC.home(S);
  const K=DRESS.kerb, PATROL=null, TRUCK=null, VAN=null, AMB=null;
  const bagGeo=(()=>{ '@later'; const M=VEHD.trashbag; if(!M)return null; const b=B64, P=SKIN.pts(M);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(new Uint16Array(b(M.i).buffer),1)); g.computeVertexNormals(); g.computeBoundingBox(); return g; })();
  const BAGMAT=new THREE.MeshLambertMaterial({vertexColors:true});
  CIVIC.cans=(DRESS.cans||[]).map((c,i)=>{ '@later'; const can={id:'can'+(i+1),x:c.x,z:c.z,fill:0,heap:null}; if(bagGeo){ const bb=bagGeo.boundingBox, s=1/.84*T*.8, me=new THREE.Mesh(bagGeo,BAGMAT); me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); const body=new THREE.Group(); body.add(me); body.scale.set(s,s*ZU*24/TILE,s); const g=new THREE.Group(); g.add(body); g.position.set(c.x+.9*T,G(c.x,c.z),c.z-.1*T); g.visible=false; MAPG.bodega.add(g); can.heap=g; } return can; });
  CIVIC.nearCan=(x,z)=>CIVIC.cans.find(c=>Math.hypot(c.x-x,c.z-z)<6*T);
  CIVIC.fillCan=(c,n)=>{ c.fill+=n; if(c.fill>=4&&c.heap&&!c.heap.visible){ c.heap.visible=true; CITY.post('trash',{x:c.x,z:c.z-.8*T,place:c.id},{can:c.id}); log('a can is overflowing','street'); } };
  CIVIC.emptyCan=c=>{ c.fill=0; if(c.heap)c.heap.visible=false; for(const j of CITY.open('trash'))if(j.data.can===c.id)CITY.done(j); };
  CIVIC.tryCan=()=>{ const c=CIVIC.cans[0]; if(c)CIVIC.fillCan(c,4); };
  const worksJob=()=>{ '@later'; const S=S_.works; if(!S||S.state!=='free')return; const j=CITY.take('restock',S.id,S.N.st)||CITY.take('trash',S.id,S.N.st)||CITY.take('power',S.id,S.N.st); if(!j)return; S.job=j;
    if(j.kind==='restock'){ const P=CITY.place(j.place); CIVIC.carry(S,0x8a6a3a); dispatch(S,VAN,P.door,ok=>{ if(ok){ const Sh=CIVIC.shops[j.place]; Sh.stock+=12; Sh.low=Sh.stock<8; log('a crate delivered to '+j.place+' (stock '+Sh.stock+')',j.place); if(CIVIC.restocked)CIVIC.restocked(j.place); } CITY.done(j); CIVIC.carry(S,null); back(S,VAN); }); }
    else if(j.kind==='trash'){ const c=CIVIC.cans.find(c=>c.id===j.data.can); dispatch(S,VAN,{x:c.x,z:c.z-.9*T},ok=>{ if(ok){ CIVIC.emptyCan(c); log('a can emptied','street'); } CITY.done(j); back(S,VAN); }); }
    else if(j.kind==='power'){ CIVIC.carry(S,0xd8b030); dispatch(S,VAN,j.at,ok=>{ S.busy=8; S.after=()=>{ CIVIC.power(true,j.data.x0,j.data.x1); log('power back on','street'); CITY.done(j); CIVIC.carry(S,null); back(S,VAN); }; }); } };
  CITY.at(6.5,()=>{ '@later'; const S=S_.works; if(!S||S.state!=='free'||!CIVIC.cans.length)return; S.state='on the round'; S.job={kind:'trash round'}; log('the trash round began','depot'); const cans=CIVIC.cans.slice();
    const next=()=>{ const c=cans.shift(); if(!c){ log('the trash round is done','depot'); back(S,VAN); return; } const go=()=>CIVIC.go(S,{x:c.x,z:c.z-.9*T},ok=>{ if(ok)CIVIC.emptyCan(c); S.N.st.wait=1; setTimeout(next,1200); },1.8);
      go(); }; next(); },'the trash round');
  CIVIC.power=(on,x0,x1)=>{ for(const [L] of DRESS.pools||[])if(L.position.x>=x0&&L.position.x<=x1)L.userData.off=!on; LITE.t=0; };
  CIVIC.outage=x=>{ const x0=x-12*T, x1=x+12*T; CIVIC.power(false,x0,x1); if(!CITY.open('power').some(j=>j.data.x0===x0))CITY.post('power',{x,z:(K?K.sw:0)-.6*T,place:'street'},{x0,x1}); log('the lights went out along the street','street'); };
  CIVIC.tryOutage=()=>CIVIC.outage(SHARED.BOD.X((SHARED.BOD.B0.x0+SHARED.BOD.B0.x1)/2));
  const SPOTS=()=>{ '@later'; const s=CIVIC.cans.map(c=>({x:c.x,z:c.z,what:'a trash can'})); if(SHARED.BOD.GD)s.push({x:SHARED.BOD.X(SHARED.BOD.GD.door[0])+2.5*T,z:SHARED.BOD.Z(SHARED.BOD.GD.door[1])+1.5*T,what:'the bath house\'s forecourt'}); const p=CITY.place('park'); if(p)s.push({x:p.door.x+3*T,z:p.door.z-5*T,what:'the grass by the gate'}); return s; };
  CIVIC.fire=(spot,why)=>{ '@later'; if(CIVIC.fires.some(f=>Math.hypot(f.x-spot.x,f.z-spot.z)<3*T))return null; const y=G(spot.x,spot.z), s=FLAME.add({kind:'bed',x:spot.x,y,z:spot.z,w:.5*T,h:.6*T,embers:3,smoke:1.2}); const f={x:spot.x,z:spot.z,y,s,age:0,k:1,what:spot.what,out:false};
    CIVIC.fires.push(f); CITY.post('fire',{x:spot.x,z:spot.z+1.6*T,place:'street'},{what:spot.what}); log('FIRE: '+spot.what+(why?' ('+why+')':''),'street'); return f; };
  CIVIC.spots=SPOTS; CIVIC.lampsOff=()=>(DRESS.pools||[]).filter(p=>p[0].userData.off).length;
  CIVIC.tryFire=()=>{ const s=SPOTS(); CIVIC.fire(s[Math.floor(Math.random()*s.length)],'a test'); };
  const fireTick=dt=>{ '@later'; for(const f of CIVIC.fires.slice()){ if(f.out){ if((f.age+=dt)>3){ f.s.on=false; CIVIC.fires.splice(CIVIC.fires.indexOf(f),1); } continue; } f.age+=dt; if(!f.hosed)f.k=Math.min(2.4,f.k+dt/50); f.hosed=false; f.s.w=.5*T*f.k; f.s.h=.6*T*f.k;
      if(SHARED.LVL==='up'&&Math.hypot(pos.x-f.x,pos.z-f.z)<1.1*T*f.k)VIT.hurt(dt*.12); for(const N of NPCS)if(N.lv==='up'&&N.g.visible&&!N.mode&&Math.hypot(N.st.x-f.x,N.st.z-f.z)<1.1*T*f.k)N.hp=Math.max(0,N.hp-dt*.12);
      if(f.age>240){ f.out=true; f.age=0; f.s.smoke=3; log('the fire burnt itself out: '+f.what,'street'); for(const j of CITY.open('fire'))if(Math.hypot(j.at.x-f.x,j.at.z-f.z)<3*T)CITY.done(j); } } };
  const JET={n:60,d:[],k:0}; { const me=new THREE.InstancedMesh(new THREE.BoxGeometry(.07*T,.07*T,.07*T),new THREE.MeshLambertMaterial({color:0x9cd4f0}),JET.n); me.frustumCulled=false; me.count=0; MAPG.bodega.add(me); JET.me=me; for(let i=0;i<JET.n;i++)JET.d.push({on:false,p:new THREE.Vector3(),v:new THREE.Vector3(),t:0}); }
  const m4=new THREE.Matrix4(), GR=9.8*T/.84;
  const spray=(N,f)=>{ '@later'; const d=JET.d[JET.k=(JET.k+1)%JET.n], hx=N.st.x+Math.sin(N.st.h)*.35*T, hz=N.st.z+Math.cos(N.st.h)*.35*T, hy=N.g.position.y+N.H*.62, tt=.55+Math.random()*.15;
    const tx=f.x+(Math.random()-.5)*.5*T, tz=f.z+(Math.random()-.5)*.5*T, ty=f.y+.2*T; d.on=true; d.t=0; d.p.set(hx,hy,hz); d.v.set((tx-hx)/tt,(ty-hy+.5*GR*tt*tt)/tt,(tz-hz)/tt); };
  const jetTick=dt=>{ let n=0; for(const d of JET.d){ if(!d.on)continue; d.t+=dt; d.v.y-=GR*dt; d.p.addScaledVector(d.v,dt); if(d.t>1.1||d.p.y<G(d.p.x,d.p.z)){ d.on=false; continue; } JET.me.setMatrixAt(n++,m4.makeTranslation(d.p.x,d.p.y,d.p.z)); } JET.me.count=n; if(n)JET.me.instanceMatrix.needsUpdate=true; };
  const BEAM=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x60ff90,toneMapped:false})); BEAM.visible=false; MAPG.bodega.add(BEAM);
  const beamTo=(N,to,ph)=>{ const a=new THREE.Vector3(N.st.x+Math.sin(N.st.h)*.3*T,N.g.position.y+N.H*.6,N.st.z+Math.cos(N.st.h)*.3*T), l=a.distanceTo(to); BEAM.position.copy(a).add(to).multiplyScalar(.5); BEAM.lookAt(to); const w=(.03+.015*Math.sin(ph*20))*T; BEAM.scale.set(w,w,l); BEAM.visible=true; };
  CIVIC.jet=JET; CIVIC.beam=BEAM;
  const hose=(S,f,dt)=>{ '@later'; if(f.out||!f.s.on)return true; f.hosed=true; if(S.N&&Math.random()<dt*40)spray(S.N,f); f.k=Math.max(.3,f.k-dt*.25); f.s.w=.5*T*f.k; f.s.h=.6*T*f.k; if(Math.random()<dt*12)FLAME.puff(f.x+(Math.random()-.5)*.6*T,f.y+.3*T,f.z+(Math.random()-.5)*.6*T,.7); if(f.k<=.3){ f.out=true; f.age=0; f.s.smoke=2.5; return true; } return false; };
  const fireJob=()=>{ '@later'; for(const id of ['fire1','fire2']){ const S=S_[id]; if(!S||S.state!=='free')continue; const j=CITY.take('fire',id,S.N.st); if(!j)return; S.job=j; const f=CIVIC.fires.find(f=>Math.hypot(f.x-j.at.x,f.z-j.at.z)<3*T); log(S.name+' answered the call: '+j.data.what,'firehouse');
      dispatch(S,TRUCK,j.at,ok=>{ if(!ok||!f){ CITY.done(j); back(S,TRUCK); return; } S.state='hosing'; S.N.st.face={x:f.x,z:f.z}; S.hose=f; S.after=()=>{ log('the fire is out: '+f.what,'street'); CITY.done(j); back(S,TRUCK); }; },2.6); const O=S_[id==='fire1'?'fire2':'fire1']; if(O&&O.state==='free'){ O.job=j; O.state='on a call'; dispatch(O,null,{x:j.at.x+1.2*T,z:j.at.z},ok=>{ O.state='standing by'; O.after=()=>back(O,null); O.busy=0; O.wait=f; },2.6); } } };
  let faintJob=null; const medTick=()=>{ '@later'; if(VIT.out>0&&!VIT.dead&&!faintJob&&SHARED.LVL==='up'){ faintJob=CITY.post('medical',{x:pos.x,z:pos.z,place:'street'},{}); log('someone fainted on the street','street'); } if(faintJob&&VIT.out<=0&&faintJob.state==='open'){ CITY.done(faintJob); faintJob=null; }
    const S=S_.medic; if(S&&S.state==='free'){ const j=CITY.take('medical',S.id,S.N.st); if(j){ S.job=j; CIVIC.carry(S,0xe8e8e0); dispatch(S,AMB,{x:pos.x,z:pos.z+.8*T},ok=>{ S.busy=4; S.after=()=>{ if(VIT.out>0)VIT.out=.1; VIT.heal(Math.max(0,.7-VIT.hp)); log('the medic brought you round','street'); CITY.done(j); faintJob=null; CIVIC.carry(S,null); back(S,AMB); }; },2.8); } } };
  CIVIC.tryFaint=()=>VIT.hurt(1);
  for(const id of ['officer1','officer2']){ const S=S_[id]; if(S){ S.N.st.hold=false; S.state='on the beat'; } }
  CIVIC.free=id=>{ const S=S_[id]; return S&&(S.state==='free'||S.state==='on the beat'); };
  const h=CLOCK.h; CITY.at(CIVIC.ledger.curfew[0],()=>log('curfew: the street is the police\'s till '+CIVIC.ledger.curfew[1]+':00','precinct'),'curfew');
  let flashed=false; const wxTick=()=>{ '@later'; const W=window.WX&&WX.now; if(!W)return; if(W.flash&&!flashed){ flashed=true; const r=Math.random(); if(r<.25)CIVIC.outage(SHARED.BOD.X((SHARED.BOD.B0.x0+SHARED.BOD.B0.x1)/2)+(Math.random()-.5)*40*T); else if(r<.4){ const s=SPOTS(); CIVIC.fire(s[Math.floor(Math.random()*s.length)],'lightning'); } } if(!W.flash)flashed=false; };
  for(let hh=0;hh<24;hh++)CITY.at(hh+.25,()=>{ if(Math.random()<.06){ const s=SPOTS(); CIVIC.fire(s[Math.floor(Math.random()*s.length)],'an accident'); } },'fire chance');
  let acc=0; SYS.add('city',(dt,you)=>{ '@later'; fireTick(dt); wxTick();
    jetTick(dt); BEAM.visible=false; for(const S of Object.values(S_)){ S.pose=S.state==='hosing'?'hosing':S.busy>0?({medic:'beam',officer1:'beam',works:'kneel'}[S.id]||null):S.state==='on the round'&&S.N.st.wait>0?'hand':null; if(S.id==='medic'&&S.busy>0&&SHARED.LVL==='up')beamTo(S.N,new THREE.Vector3(pos.x,G(pos.x,pos.z)+.4*T,pos.z),S.busy); }
    for(const S of Object.values(S_)){ if(S.state==='hosing'&&S.hose){ if(hose(S,S.hose,dt)){ S.hose=null; S.state='on a call'; const f=S.after; S.after=null; f&&f(); } }
      else if(S.state==='standing by'&&S.wait&&(S.wait.out||!S.wait.s.on)){ S.wait=null; const f=S.after; S.after=null; f&&f(); }
      else if(S.busy>0){ S.busy-=dt; if(S.busy<=0){ const f=S.after; S.after=null; f&&f(); } } }
    if((acc+=dt)>1){ acc=0; worksJob(); fireJob(); medTick(); } },'156-duties');
  window.CIVDBG=()=>({staff:Object.values(S_).map(S=>[S.id,S.state,S.job&&S.job.kind,+(S.N.st.x/T).toFixed(1),+(S.N.st.z/T).toFixed(1),S.N.g.visible]),fires:CIVIC.fires.map(f=>[+(f.x/T).toFixed(1),+(f.z/T).toFixed(1),+f.k.toFixed(2),f.out]),cans:CIVIC.cans.map(c=>[c.id,c.fill,c.heap&&c.heap.visible]),jobs:CITY.jobs.map(j=>j.kind+':'+j.state),bag:CIVIC.mail.bag.length,boxes:Object.fromEntries(Object.entries(CIVIC.mail.boxes).map(([k,v])=>[k,v.length])),treasury:CIVIC.ledger.treasury,log:CIVIC.log.slice(0,6).map(e=>e.what)});
}
