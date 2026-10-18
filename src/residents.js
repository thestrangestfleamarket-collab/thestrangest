// ---- THE RESIDENTS (owner, 17 Oct 2026, the gameplan's second step: "2 - residents in the apartment house, bare minimum"): four of the
// pawns live in the apartment house, a flat each (1A, 1B, 2A, 2B). Each has his hours: out of the door in the morning, home in the evening
// (staggered, so someone is always coming or going). Leaving, he steps out of the front door and goes on an errand of the day (the bodega,
// the park's gate, the diner, the bar, Ghost Street: the spine's routes, city.js), then walks the street as the others do; at his hour he
// walks home and goes in (inside he is hidden and still: the house has no flights of stairs yet, so the flats themselves aren't walked to).
// The game opens at 7pm with the clock stopped: two are home, two on their way; RUN the clock (the menu's TIME) and the day turns. Nothing
// drawn that wasn't; one home costs nothing a frame. CITY.residents lists them; RESDBG() a test's look (18 Oct 2026, "go all": the residents
// going up: the house has its stairs and its flats now (apts.js), so each lives in a flat on the 3rd to 5th floor (3B, 3D, 4A, 5C); coming home he
// walks in at the front door, through the lobby and the hall, up the U stairs a storey at a time to his floor, along its hall, his flat's door
// swinging in for him, and stands about inside; in the morning the same way down and out. Seen only while you're in the house on his floor (else
// he goes on unseen, walked all the same); the stairs' slope under him from APTS.gnd ----
{ const T=TILE, HOUSE=()=>CITY.place('house'), OUT0=['bodega','park','store:diner','store:bar','dojo'], OUT=OUT0.filter(id=>!/^store:/.test(id)||!AWAY.has(id.slice(6)));   // (not to a place off the map, owner 18 Oct 2026: AWAY, map-pre.js)
  const R=[['hero_m','3B',7.5,18.2],['hero_f','3D',8.1,19.0],['villager_m','4A',8.7,19.6],['villager_f','5C',9.3,20.4]].map(([key,flat,leave,home])=>({key,flat,leave,home,state:'',N:null}));
  CITY.residents=R;
  const inside=()=>{ const H=HOUSE(); return H&&{x:H.at.x,z:H.at.z-1.3*T}; };   // (just inside the door, in the entrance passage)
  const isOut=(r,h)=>h>=r.leave&&h<r.home;
  // INDOORS: his own way (APTS.way: the lobby, the stairs, his hall, his door), walked by his own steps (st.to, a point at a time); nothing in the
  // house stops him (it's his way), the floor under him the one at his height, his push on you only on your floor; shown only from there
  const AP=()=>MODS.apts, flatOf=r=>AP()&&AP().flat&&AP().flat(r.flat);
  const indoor=(r,way,then)=>{ const N=r.N, A=AP(); CITY.stop(N); N.mode='indoor'; if(!r.k0){ r.k0={free:N.free,ground:N.ground,push:N.push}; } r.y=r.y||0;
    N.free=()=>true; N.ground=(x,z)=>(r.y=A.gnd(x,z,r.y)); N.push=p=>{ if(r.shown)r.k0.push(p); }; r.way=way; r.wi=0; r.then=then; N.st.hold=false; N.st.wait=0; N.st.to=null; N.st.face=null; };
  const outdoor=r=>{ const N=r.N; if(r.k0){ Object.assign(N,r.k0); r.k0=null; } delete N.mode; r.y=0; r.way=null; r.shown=false; N.g.visible=true; };
  const step=r=>{ const N=r.N, st=N.st, A=AP(), f=Math.max(0,Math.floor(r.y/A.SY+.08)); r.shown=!!A.in&&A.floor()===f; N.mode=r.shown?'indoor':'hidden'; N.g.visible=r.shown;
    if(!r.way)return; const F=flatOf(r); if(F&&Math.hypot(st.x-F.at.x,st.z-F.at.z)<1.6*T)F.by=.6;   // (his door opens as he comes to it)
    const p=r.way[r.wi]; if(!p){ r.way=null; st.to=null; const th=r.then; r.then=null; th&&th(); return; }
    if(Math.hypot(p.x-st.x,p.z-st.z)<.1*T){ r.wi++; st.to=null; return; } st.to={x:p.x,z:p.z}; st.wait=0; st.hold=false; };
  const settle=r=>{ const N=r.N, F=flatOf(r); r.state='home'; N.st.hold=true; N.st.to=null; if(F){ const s=F.sd; N.st.face={x:N.st.x+s*BOD.X(1)-s*BOD.X(0),z:N.st.z}; } };   // (home, looking into his flat)
  const goIn=r=>{ const N=r.N, F=flatOf(r); if(F){ const w=AP().way(F), h=w[w.length-1]; indoor(r,null); N.st.x=h.x; N.st.z=h.z; r.y=F.lv*AP().SY; N.g.position.set(h.x,r.y,h.z); settle(r); return; }   // (home at the start: in his flat already)
    const p=inside(); CITY.stop(N); r.state='home'; N.mode='hidden'; N.g.visible=false; N.st.hold=true; N.st.to=null; if(p){ N.st.x=p.x; N.st.z=p.z; N.g.position.x=p.x; N.g.position.z=p.z; } };
  const goOut=r=>{ const N=r.N, H=HOUSE(); if(!H)return; if(r.state==='home'&&N.mode&&flatOf(r)&&r.k0){ r.state='down'; indoor(r,AP().way(flatOf(r)).reverse().concat([{x:H.door.x,z:H.door.z}]),()=>{ outdoor(r); r.state='home'; goOut2(r); }); return; } goOut2(r); };   // (from his flat: down the stairs and out of the front door first)
  const goOut2=r=>{ const N=r.N, H=HOUSE(); if(!H)return; r.state='out'; delete N.mode; if(r.k0)outdoor(r); N.g.visible=true; N.fv=true; N.st.hold=false; if(Math.hypot(N.st.x-H.door.x,N.st.z-H.door.z)>.5*T){ N.st.x=H.door.x; N.st.z=H.door.z; N.g.position.x=N.st.x; N.g.position.z=N.st.z; N.st.h=Math.PI; }
    const C=window.CIVIC, want=C&&C.wants&&C.wants(r), P=CITY.place(want||OUT[(r.n=(r.n||0)+1)%OUT.length]); if(P&&!P.stacked)CITY.send(N,P.door,{then:ok=>{ if(ok&&CITY.onArrive)CITY.onArrive(r,P); N.st.wait=6+Math.random()*10; r.back=N.st.wait+1; }}); };   // (hungry, he goes for food; there, he buys: civic.js)   // (his errand; a while there, then back to the street, which he walks as the others do)
  const street=N=>{ for(let k=0;k<12;k++){ const p={x:STLANE.x0+Math.random()*(STLANE.x1-STLANE.x0),z:STLANE.z0+Math.random()*(STLANE.z1-STLANE.z0)}; if(N.free(p.x,p.z,N.st.R)){ CITY.send(N,p); return; } } };
  const goHome=r=>{ const N=r.N, H=HOUSE(); if(!H)return; r.state='homing'; delete N.mode; N.g.visible=true; N.st.hold=false; CITY.send(N,H.door,{then:ok=>{ if(r.state!=='homing')return; if(!ok){ r.state='out'; r.again=20; return; } const F=flatOf(r); if(!F){ goIn(r); return; } r.state='up'; indoor(r,AP().way(F),()=>settle(r)); }}); };   // (in at the door, up to his flat)   // (no way home found: out a little longer, then tried again)
  // set at the start by the hour; then each of his hours as the clock passes it
  const start=()=>{ for(const r of R){ r.N=NPCS.find(n=>n.key===r.key); if(!r.N)continue; if(isOut(r,CLOCK.h)){ r.state='out'; } else goIn(r);
      CITY.at(r.leave,()=>{ if(r.state!=='out')goOut(r); },r.key+' leaves'); CITY.at(r.home,()=>{ if(r.state==='out')goHome(r); },r.key+' home'); } };
  setTimeout(start,0);
  // a jump of the clock past both hours at once (the slider, N): put right at the next tick
  const t0=CITY.tick; CITY.tick=(dt,you)=>{ t0(dt,you); for(const r of R){ if(!r.N)continue; if(r.k0)step(r); if(r.again>0&&(r.again-=dt)>0)continue; if(r.back>0&&(r.back-=dt)<=0&&r.state==='out'&&!r.N.errand)street(r.N); const out=isOut(r,CLOCK.h); if(out&&r.state==='home')goOut(r); else if(!out&&r.state==='out'&&!r.N.errand)goHome(r); } };
  window.RESDBG=()=>R.map(r=>({key:r.key,flat:r.flat,state:r.state,floor:r.k0?Math.floor((r.y||0)/AP().SY+.08):null,wi:r.way?r.wi+'/'+r.way.length:null,vis:r.N&&r.N.g.visible,mode:r.N&&r.N.mode,x:r.N&&+(r.N.st.x/T).toFixed(1),z:r.N&&+(r.N.st.z/T).toFixed(1),errand:!!(r.N&&r.N.errand)}));
}
