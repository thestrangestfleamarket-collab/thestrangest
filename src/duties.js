// ---- THE SERVICES AT WORK (owner, 17 Oct 2026: "police, fire, government, mail and delivery handled by bots ... minimal for now"): each
// service a small mind over the spine (city.js: jobs, routes, the schedule) and the civic row (civic.js: the staff, the ledger, the vehicles).
// THE MAIL: at 9:30 the carrier takes the bag round, a letter to each address (the residents' house, your box in the apartments' lobby,
// the shops), and home; a resident reads his letters when he's home. PUBLIC WORKS (the one crew, the works van): the trash round at 6:30
// (the street's three cans emptied; a can filled by passers-by gets a heap of bags beside it, the Drive's own trashbag piece, and asks to be
// emptied), deliveries when a shop runs low (a crate from the depot to its door, the stock back up), the power crew when a storm's lightning
// trips a stretch of lamps (dark till he's been). THE FIRE DEPARTMENT (two, the fire truck): a fire is a live flame (fire.js) that grows where
// it starts (a trash can, the dojo's wooden forecourt, by the park's campfire: lightning, a chance each hour, or TRY in the menu); it burns
// anyone close; the crew drive to it, hose it (a jet of steam puffs) till it's out, and drive back. THE MEDIC (the ambulance): when you faint,
// he comes and brings you round. THE POLICE (two officers, the patrol car): on the beat along the street; a troublemaker up the stairs is a
// call, the nearer officer comes (by car if far), and if the guards have him down he's taken in (a log line: there are no cells yet), else
// seen off; curfew hours noted. Not yet: the subway's train, the train's timetable, doors that open, wet roads, snow lying ----
{ const T=TILE, S_=CIVIC.staff, H_=CIVIC.house, log=CIVIC.note, G=(x,z)=>MODS.bodega.ground(x,z);
  const far=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z)>18*T;
  // a staff member goes to a spot: by his vehicle to the kerb nearest it when far, then on foot; then(ok)
  const dispatch=(S,veh,spot,then,v)=>{ S.state='on a call'; const walk=()=>CIVIC.go(S,spot,then,v||2.2);
    if(veh&&far(S.N.st,spot)&&!veh.rider&&veh.to==null){ veh.alarm=true; const walkToCar=()=>{ VEH.ride(S.N,veh,spot.x,()=>{ walk(); }); }; if(Math.hypot(S.N.st.x-veh.x,S.N.st.z-veh.z)>3*T)CIVIC.go(S,{x:veh.x,z:(DRESS.kerb?DRESS.kerb.sw:veh.z)-.6*T},ok=>walkToCar(),2.4); else walkToCar(); } else walk(); };
  const back=(S,veh)=>{ if(veh&&far(S.N.st,S.N.home)&&!veh.rider){ CIVIC.go(S,{x:veh.x,z:(DRESS.kerb?DRESS.kerb.sw:veh.z)-.6*T},()=>VEH.ride(S.N,veh,veh.home,()=>{ veh.alarm=false; CIVIC.home(S); }),2); } else { if(veh)veh.alarm=false; CIVIC.home(S); } };
  // ---- THE VEHICLES at their houses' kerbs
  const K=DRESS.kerb, carAt=id=>H_(id).x;
  const PATROL=VEH.make('patrol','THE PATROL CAR','Toyoyo_Highlight',[.12,.16,.4],.7,{bar:true,x:carAt('precinct')}), TRUCK=VEH.make('fire','THE FIRE TRUCK','Landyroamer',[.8,.12,.08],.75,{bar:true,x:carAt('firehouse')}),
    VAN=VEH.make('works','THE WORKS VAN','Beatall',[.95,.5,.1],.7,{x:carAt('depot')}), AMB=VEH.make('ambulance','THE AMBULANCE','docLorean',[.95,.95,.92],.8,{bar:true,x:carAt('clinic')});
  for(const v of VEH.list)v.alarm=false;
  // ---- THE MAIL
  const MAILTO=to=>CITY.residents.find(r=>r.key===to)?'house':to==='you'?'apartments':CIVIC.shops[to]?to:to;   // (where a letter goes: the residents' house, your box in the lobby, a shop's door)
  CITY.at(9.5,()=>{ const S=S_.carrier; if(!S||S.state!=='free'||!CIVIC.mail.bag.length)return; const bag=CIVIC.mail.bag.splice(0); S.state='on the round'; S.job={kind:'mail',n:bag.length}; CIVIC.carry(S,0x3a6ac8); log('the carrier left with '+bag.length+' letter'+(bag.length>1?'s':''),'post');
    const stops=[...new Set(bag.map(l=>MAILTO(l.to)))]; const next=()=>{ const id=stops.shift(); if(!id){ CIVIC.carry(S,null); log('the carrier\'s round is done','post'); back(S,null); return; } const P=CITY.place(id); if(!P||P.stacked){ next(); return; }
      CIVIC.go(S,P.door,ok=>{ for(const l of bag)if(MAILTO(l.to)===id){ l.state='delivered'; CIVIC.box(l.to).push(l); } log('mail delivered at '+P.name.toLowerCase(),id); S.N.st.wait=1.5; setTimeout(next,1500); },1.8); }; next(); },'the mail round');
  // a resident reads his letters once home (the owed rent he knows of)
  const r0=CITY.tick; CITY.tick=(dt,you)=>{ r0(dt,you); for(const r of CITY.residents)if(r.state==='home'){ const B=CIVIC.box(r.key); for(const l of B)if(l.state==='delivered'){ l.state='read'; } } };
  // ---- PUBLIC WORKS: the cans, the trash round, deliveries, the power crew; one crew, one job at a time
  const bagGeo=(()=>{ const M=VEHD.trashbag; if(!M)return null; const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), q=new Int16Array(b(M.p).buffer), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(new Uint16Array(b(M.i).buffer),1)); g.computeVertexNormals(); g.computeBoundingBox(); return g; })();
  CIVIC.cans=(DRESS.cans||[]).map((c,i)=>{ const can={id:'can'+(i+1),x:c.x,z:c.z,fill:0,heap:null}; if(bagGeo){ const bb=bagGeo.boundingBox, s=1/.84*T*.8, me=new THREE.Mesh(bagGeo,VEH.mat); me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); const body=new THREE.Group(); body.add(me); body.scale.set(s,s*ZU*24/TILE,s); const g=new THREE.Group(); g.add(body); g.position.set(c.x+.9*T,G(c.x,c.z),c.z-.1*T); g.visible=false; MAPG.bodega.add(g); can.heap=g; } return can; });
  CIVIC.nearCan=(x,z)=>CIVIC.cans.find(c=>Math.hypot(c.x-x,c.z-z)<6*T);
  CIVIC.fillCan=(c,n)=>{ c.fill+=n; if(c.fill>=4&&c.heap&&!c.heap.visible){ c.heap.visible=true; CITY.post('trash',{x:c.x,z:c.z-.8*T,place:c.id},{can:c.id}); log('a can is overflowing','street'); } };
  CIVIC.emptyCan=c=>{ c.fill=0; if(c.heap)c.heap.visible=false; for(const j of CITY.open('trash'))if(j.data.can===c.id)CITY.done(j); };
  CIVIC.tryCan=()=>{ const c=CIVIC.cans[0]; if(c)CIVIC.fillCan(c,4); };
  const worksJob=()=>{ const S=S_.works; if(!S||S.state!=='free')return; const j=CITY.take('restock',S.id,S.N.st)||CITY.take('trash',S.id,S.N.st)||CITY.take('power',S.id,S.N.st); if(!j)return; S.job=j;
    if(j.kind==='restock'){ const P=CITY.place(j.place); CIVIC.carry(S,0x8a6a3a); dispatch(S,VAN,P.door,ok=>{ if(ok){ const Sh=CIVIC.shops[j.place]; Sh.stock+=12; Sh.low=Sh.stock<8; log('a crate delivered to '+j.place+' (stock '+Sh.stock+')',j.place); } CITY.done(j); CIVIC.carry(S,null); back(S,VAN); }); }
    else if(j.kind==='trash'){ const c=CIVIC.cans.find(c=>c.id===j.data.can); dispatch(S,VAN,{x:c.x,z:c.z-.9*T},ok=>{ if(ok){ CIVIC.emptyCan(c); log('a can emptied','street'); } CITY.done(j); back(S,VAN); }); }
    else if(j.kind==='power'){ CIVIC.carry(S,0xd8b030); dispatch(S,VAN,j.at,ok=>{ S.busy=8; S.after=()=>{ CIVIC.power(true,j.data.x0,j.data.x1); log('power back on','street'); CITY.done(j); CIVIC.carry(S,null); back(S,VAN); }; }); } };
  CITY.at(6.5,()=>{ const S=S_.works; if(!S||S.state!=='free'||!CIVIC.cans.length)return; S.state='on the round'; S.job={kind:'trash round'}; log('the trash round began','depot'); const cans=CIVIC.cans.slice(); let first=true;
    const next=()=>{ const c=cans.shift(); if(!c){ log('the trash round is done','depot'); back(S,VAN); return; } const go=()=>CIVIC.go(S,{x:c.x,z:c.z-.9*T},ok=>{ if(ok)CIVIC.emptyCan(c); S.N.st.wait=1; setTimeout(next,1200); },1.8);
      if(first){ first=false; VAN.alarm=false; CIVIC.go(S,{x:VAN.x,z:(K?K.sw:VAN.z)-.6*T},()=>VEH.ride(S.N,VAN,c.x,go),2); } else go(); }; next(); },'the trash round');
  // the power: a stretch of the street's lamps off (L.userData.off: LITE leaves them out, their pools go), till the crew has been
  CIVIC.power=(on,x0,x1)=>{ for(const [L] of DRESS.pools||[])if(L.position.x>=x0&&L.position.x<=x1)L.userData.off=!on; LITE.t=0; };
  CIVIC.outage=x=>{ const x0=x-12*T, x1=x+12*T; CIVIC.power(false,x0,x1); if(!CITY.open('power').some(j=>j.data.x0===x0))CITY.post('power',{x,z:(K?K.sw:0)-.6*T,place:'street'},{x0,x1}); log('the lights went out along the street','street'); };
  CIVIC.tryOutage=()=>CIVIC.outage(BOD.X((BOD.B0.x0+BOD.B0.x1)/2));
  // ---- THE FIRE DEPARTMENT: fires that grow, the crew that puts them out
  const SPOTS=()=>{ const s=CIVIC.cans.map(c=>({x:c.x,z:c.z,what:'a trash can'})); if(BOD.GD)s.push({x:BOD.X(BOD.GD.door[0])+2.5*T,z:BOD.Z(BOD.GD.door[1])+1.5*T,what:'Ghost Street\'s forecourt'}); const p=CITY.place('park'); if(p)s.push({x:p.door.x+3*T,z:p.door.z-5*T,what:'the grass by the gate'}); return s; };
  CIVIC.fire=(spot,why)=>{ if(CIVIC.fires.some(f=>Math.hypot(f.x-spot.x,f.z-spot.z)<3*T))return null; const y=G(spot.x,spot.z), s=FLAME.add({kind:'bed',x:spot.x,y,z:spot.z,w:.5*T,h:.6*T,embers:3,smoke:1.2}); const f={x:spot.x,z:spot.z,y,s,age:0,k:1,what:spot.what,out:false};
    CIVIC.fires.push(f); CITY.post('fire',{x:spot.x,z:spot.z+1.6*T,place:'street'},{what:spot.what}); log('FIRE: '+spot.what+(why?' ('+why+')':''),'street'); return f; };
  CIVIC.spots=SPOTS; CIVIC.lampsOff=()=>(DRESS.pools||[]).filter(p=>p[0].userData.off).length;   // (a test's reach)
  CIVIC.tryFire=()=>{ const s=SPOTS(); CIVIC.fire(s[Math.floor(Math.random()*s.length)],'a test'); };
  const fireTick=dt=>{ for(const f of CIVIC.fires.slice()){ if(f.out){ if((f.age+=dt)>3){ f.s.on=false; CIVIC.fires.splice(CIVIC.fires.indexOf(f),1); } continue; } f.age+=dt; if(!f.hosed)f.k=Math.min(2.4,f.k+dt/50); f.hosed=false; f.s.w=.5*T*f.k; f.s.h=.6*T*f.k;   /* (grows unless being hosed this frame) */
      if(LVL==='up'&&Math.hypot(pos.x-f.x,pos.z-f.z)<1.1*T*f.k)VIT.hurt(dt*.12); for(const N of NPCS)if(N.lv==='up'&&N.g.visible&&!N.mode&&Math.hypot(N.st.x-f.x,N.st.z-f.z)<1.1*T*f.k)N.hp=Math.max(0,N.hp-dt*.12);
      if(f.age>240){ f.out=true; f.age=0; f.s.smoke=3; log('the fire burnt itself out: '+f.what,'street'); for(const j of CITY.open('fire'))if(Math.hypot(j.at.x-f.x,j.at.z-f.z)<3*T)CITY.done(j); } } };
  const hose=(S,f,dt)=>{ if(f.out||!f.s.on)return true; f.hosed=true; f.k=Math.max(.3,f.k-dt*.25); f.s.w=.5*T*f.k; f.s.h=.6*T*f.k; if(Math.random()<dt*12)FLAME.puff(f.x+(Math.random()-.5)*.6*T,f.y+.3*T,f.z+(Math.random()-.5)*.6*T,.7); if(f.k<=.3){ f.out=true; f.age=0; f.s.smoke=2.5; return true; } return false; };
  const fireJob=()=>{ for(const id of ['fire1','fire2']){ const S=S_[id]; if(!S||S.state!=='free')continue; const j=CITY.take('fire',id,S.N.st); if(!j)return; S.job=j; const f=CIVIC.fires.find(f=>Math.hypot(f.x-j.at.x,f.z-j.at.z)<3*T); log(S.name+' answered the call: '+j.data.what,'firehouse');
      dispatch(S,TRUCK,j.at,ok=>{ if(!ok||!f){ CITY.done(j); back(S,TRUCK); return; } S.state='hosing'; S.N.st.face={x:f.x,z:f.z}; S.hose=f; S.after=()=>{ log('the fire is out: '+f.what,'street'); CITY.done(j); back(S,TRUCK); }; },2.6); const O=S_[id==='fire1'?'fire2':'fire1']; if(O&&O.state==='free'){ O.job=j; O.state='on a call'; dispatch(O,null,{x:j.at.x+1.2*T,z:j.at.z},ok=>{ O.state='standing by'; O.after=()=>back(O,null); O.busy=0; O.wait=f; },2.6); } } };
  // ---- THE MEDIC: you, fainted
  let faintJob=null; const medTick=()=>{ if(VIT.out>0&&!faintJob&&LVL==='up'){ faintJob=CITY.post('medical',{x:pos.x,z:pos.z,place:'street'},{}); log('someone fainted on the street','street'); } if(faintJob&&VIT.out<=0&&faintJob.state==='open'){ CITY.done(faintJob); faintJob=null; }
    const S=S_.medic; if(S&&S.state==='free'){ const j=CITY.take('medical',S.id,S.N.st); if(j){ S.job=j; CIVIC.carry(S,0xe8e8e0); dispatch(S,AMB,{x:pos.x,z:pos.z+.8*T},ok=>{ S.busy=4; S.after=()=>{ if(VIT.out>0)VIT.out=.1; VIT.hp=Math.max(VIT.hp,.7); log('the medic brought you round','street'); CITY.done(j); faintJob=null; CIVIC.carry(S,null); back(S,AMB); }; },2.8); } } };
  CIVIC.tryFaint=()=>VIT.hurt(1);   // (the menu's TRY, a test)
  // ---- THE POLICE: the beat, the calls
  for(const id of ['officer1','officer2']){ const S=S_[id]; if(S){ S.N.st.hold=false; S.state='on the beat'; } }   // (free to walk the street as the pawns do: his lane is the street's)
  CIVIC.free=id=>{ const S=S_[id]; return S&&(S.state==='free'||S.state==='on the beat'); };
  const seen=new Set(); const policeTick=()=>{ const TR=window.GUARDX&&GUARDX.TROUBLE||[]; for(const t of TR){ if((t.mode==='come'||t.mode==='fight')&&!seen.has(t)){ seen.add(t); CITY.post('crime',{x:t.st.x,z:t.st.z,place:'street'},{who:t}); log('a troublemaker on the street: a call to the precinct','street'); } if(t.mode==='hidden')seen.delete(t); }
    for(const id of ['officer1','officer2']){ const S=S_[id]; if(!S||!CIVIC.free(id))continue; const j=CITY.take('crime',id,S.N.st); if(!j)return; S.job=j; const t=j.data.who; S.N.st.hold=false;
      dispatch(S,PATROL,{x:t.st.x,z:t.st.z+.9*T},ok=>{ const live=t.mode&&t.mode!=='hidden'; if(live&&t.mode==='down'){ log(S.name+' took the troublemaker in','street'); t.mode='flee'; } else if(live){ log(S.name+' saw the troublemaker off','street'); t.mode='flee'; } else log(S.name+' found the street quiet','street'); CITY.done(j); S.busy=2; S.after=()=>{ back(S,PATROL); }; }); } };
  const h=CLOCK.h; CITY.at(CIVIC.ledger.curfew[0],()=>log('curfew: the street is the police\'s till '+CIVIC.ledger.curfew[1]+':00','precinct'),'curfew');
  // ---- WEATHER'S HAND: lightning trips the lamps, or starts a fire; a small chance of a fire each hour of the clock
  let flashed=false; const wxTick=()=>{ const W=window.WX&&WX.now; if(!W)return; if(W.flash&&!flashed){ flashed=true; const r=Math.random(); if(r<.25)CIVIC.outage(BOD.X((BOD.B0.x0+BOD.B0.x1)/2)+(Math.random()-.5)*40*T); else if(r<.4){ const s=SPOTS(); CIVIC.fire(s[Math.floor(Math.random()*s.length)],'lightning'); } } if(!W.flash)flashed=false; };
  for(let hh=0;hh<24;hh++)CITY.at(hh+.25,()=>{ if(Math.random()<.06){ const s=SPOTS(); CIVIC.fire(s[Math.floor(Math.random()*s.length)],'an accident'); } },'fire chance');
  // ---- each frame: the busy timers (a job's work on the spot), the fires, the minds
  let acc=0; const d0=CITY.tick; CITY.tick=(dt,you)=>{ d0(dt,you); fireTick(dt); wxTick();
    for(const S of Object.values(S_)){ if(S.state==='hosing'&&S.hose){ if(hose(S,S.hose,dt)){ S.hose=null; S.state='on a call'; const f=S.after; S.after=null; f&&f(); } }
      else if(S.state==='standing by'&&S.wait&&(S.wait.out||!S.wait.s.on)){ S.wait=null; const f=S.after; S.after=null; f&&f(); }
      else if(S.busy>0){ S.busy-=dt; if(S.busy<=0){ const f=S.after; S.after=null; f&&f(); } } }
    if((acc+=dt)>1){ acc=0; worksJob(); fireJob(); medTick(); policeTick(); } };
  window.CIVDBG=()=>({staff:Object.values(S_).map(S=>[S.id,S.state,S.job&&S.job.kind,+(S.N.st.x/T).toFixed(1),+(S.N.st.z/T).toFixed(1),S.N.g.visible]),fires:CIVIC.fires.map(f=>[+(f.x/T).toFixed(1),+(f.z/T).toFixed(1),+f.k.toFixed(2),f.out]),cans:CIVIC.cans.map(c=>[c.id,c.fill,c.heap&&c.heap.visible]),jobs:CITY.jobs.map(j=>j.kind+':'+j.state),bag:CIVIC.mail.bag.length,boxes:Object.fromEntries(Object.entries(CIVIC.mail.boxes).map(([k,v])=>[k,v.length])),treasury:CIVIC.ledger.treasury,log:CIVIC.log.slice(0,6).map(e=>e.what)});
}
