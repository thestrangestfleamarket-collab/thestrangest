// ---- THE RESIDENTS (owner, 17 Oct 2026, the gameplan's second step: "2 - residents in the apartment house, bare minimum"): four of the
// pawns live in the apartment house, a flat each (1A, 1B, 2A, 2B). Each has his hours: out of the door in the morning, home in the evening
// (staggered, so someone is always coming or going). Leaving, he steps out of the front door and goes on an errand of the day (the bodega,
// the park's gate, the diner, the bar, Ghost Street: the spine's routes, city.js), then walks the street as the others do; at his hour he
// walks home and goes in (inside he is hidden and still: the house has no flights of stairs yet, so the flats themselves aren't walked to).
// The game opens at 7pm with the clock stopped: two are home, two on their way; RUN the clock (the menu's TIME) and the day turns. Nothing
// drawn that wasn't; one home costs nothing a frame. CITY.residents lists them; RESDBG() a test's look ----
{ const T=TILE, HOUSE=()=>CITY.place('house'), OUT=['bodega','park','store:diner','store:bar','dojo'];
  const R=[['hero_m','1A',7.5,18.2],['hero_f','1B',8.1,19.0],['villager_m','2A',8.7,19.6],['villager_f','2B',9.3,20.4]].map(([key,flat,leave,home])=>({key,flat,leave,home,state:'',N:null}));
  CITY.residents=R;
  const inside=()=>{ const H=HOUSE(); return H&&{x:H.at.x,z:H.at.z-1.3*T}; };   // (just inside the door, in the entrance passage)
  const isOut=(r,h)=>h>=r.leave&&h<r.home;
  const goIn=r=>{ const N=r.N, p=inside(); CITY.stop(N); r.state='home'; N.mode='hidden'; N.g.visible=false; N.st.hold=true; N.st.to=null; if(p){ N.st.x=p.x; N.st.z=p.z; N.g.position.x=p.x; N.g.position.z=p.z; } };
  const goOut=r=>{ const N=r.N, H=HOUSE(); if(!H)return; r.state='out'; delete N.mode; N.g.visible=true; N.fv=true; N.st.hold=false; N.st.x=H.door.x; N.st.z=H.door.z; N.g.position.x=N.st.x; N.g.position.z=N.st.z; N.st.h=Math.PI;
    const P=CITY.place(OUT[(r.n=(r.n||0)+1)%OUT.length]); if(P&&!P.stacked)CITY.send(N,P.door,{then:()=>{ N.st.wait=6+Math.random()*10; r.back=N.st.wait+1; }}); };   // (his errand; a while there, then back to the street, which he walks as the others do)
  const street=N=>{ for(let k=0;k<12;k++){ const p={x:STLANE.x0+Math.random()*(STLANE.x1-STLANE.x0),z:STLANE.z0+Math.random()*(STLANE.z1-STLANE.z0)}; if(N.free(p.x,p.z,N.st.R)){ CITY.send(N,p); return; } } };
  const goHome=r=>{ const N=r.N, H=HOUSE(); if(!H)return; r.state='homing'; delete N.mode; N.g.visible=true; N.st.hold=false; CITY.send(N,H.door,{then:ok=>{ if(r.state!=='homing')return; if(ok)goIn(r); else { r.state='out'; r.again=20; } }}); };   // (no way home found: out a little longer, then tried again)
  // set at the start by the hour; then each of his hours as the clock passes it
  const start=()=>{ for(const r of R){ r.N=NPCS.find(n=>n.key===r.key); if(!r.N)continue; if(isOut(r,CLOCK.h)){ r.state='out'; } else goIn(r);
      CITY.at(r.leave,()=>{ if(r.state!=='out')goOut(r); },r.key+' leaves'); CITY.at(r.home,()=>{ if(r.state==='out')goHome(r); },r.key+' home'); } };
  setTimeout(start,0);
  // a jump of the clock past both hours at once (the slider, N): put right at the next tick
  const t0=CITY.tick; CITY.tick=(dt,you)=>{ t0(dt,you); for(const r of R){ if(!r.N)continue; if(r.again>0&&(r.again-=dt)>0)continue; if(r.back>0&&(r.back-=dt)<=0&&r.state==='out'&&!r.N.errand)street(r.N); const out=isOut(r,CLOCK.h); if(out&&r.state==='home')goOut(r); else if(!out&&r.state==='out'&&!r.N.errand)goHome(r); } };
  window.RESDBG=()=>R.map(r=>({key:r.key,flat:r.flat,state:r.state,vis:r.N&&r.N.g.visible,mode:r.N&&r.N.mode,x:r.N&&+(r.N.st.x/T).toFixed(1),z:r.N&&+(r.N.st.z/T).toFixed(1),errand:!!(r.N&&r.N.errand)}));
}
