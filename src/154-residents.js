{ const T=TILE, HOUSE=()=>CITY.place('house'), OUT0=['bodega','park','store:diner','store:bar','dojo'], OUT=OUT0.filter(id=>!/^store:/.test(id)||!AWAY.has(id.slice(6)));
  const R=[['hero_m','3B',7.5,18.2],['hero_f','3D',8.1,19.0],['villager_m','4A',8.7,19.6],['villager_f','5C',9.3,20.4]].map(([key,flat,leave,home])=>({key,flat,leave,home,state:'',N:null}));
  CITY.residents=R;
  const inside=()=>{ const H=HOUSE(); return H&&{x:H.at.x,z:H.at.z-1.3*T}; };
  const isOut=(r,h)=>h>=r.leave&&h<r.home;
  const AP=()=>MODS.apts, flatOf=r=>AP()&&AP().flat&&AP().flat(r.flat);
  const indoor=(r,way,then)=>{ const N=r.N, A=AP(); CITY.stop(N); N.mode='indoor'; if(!r.k0){ r.k0={free:N.free,ground:N.ground,push:N.push}; } r.y=r.y||0;
    N.free=()=>true; N.ground=(x,z)=>(r.y=A.gnd(x,z,r.y)); N.push=p=>{ if(r.shown)r.k0.push(p); }; r.way=way; r.wi=0; r.then=then; N.st.hold=false; N.st.wait=0; N.st.to=null; N.st.face=null; };
  const outdoor=r=>{ const N=r.N; if(r.k0){ Object.assign(N,r.k0); r.k0=null; } delete N.mode; r.y=0; r.way=null; r.shown=false; N.g.visible=true; };
  const step=(r,dt)=>{ const N=r.N, st=N.st, A=AP(), f=A.lvOf(r.y); r.shown=!!A.in&&A.floor()===f; N.mode=r.shown?'indoor':'hidden'; N.g.visible=r.shown;
    if(!r.way)return; const F=flatOf(r); if(F&&Math.hypot(st.x-F.at.x,st.z-F.at.z)<1.6*T)F.by=.6;
    const p=r.way[r.wi]; if(!p){ r.way=null; st.to=null; const th=r.then; r.then=null; th&&th(); return; }
    const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz); if(d<.1*T){ r.wi++; st.to=null; return; } st.to={x:p.x,z:p.z}; st.wait=0; st.hold=false;
    if(st.held>1){ const k=Math.min(d,st.v*dt); st.x+=dx/d*k; st.z+=dz/d*k; st.h=Math.atan2(dx,dz); } };
  const settle=r=>{ const N=r.N, F=flatOf(r); r.state='home'; N.st.hold=true; N.st.to=null; if(F){ const s=F.sd; N.st.face={x:N.st.x+s*BOD.X(1)-s*BOD.X(0),z:N.st.z}; } };
  const goIn=r=>{ const N=r.N, F=flatOf(r); if(F){ const w=AP().way(F), h=w[w.length-1]; indoor(r,null); N.st.x=h.x; N.st.z=h.z; r.y=AP().lvY(F.lv); N.g.position.set(h.x,r.y,h.z); settle(r); return; }
    const p=inside(); CITY.stop(N); r.state='home'; N.mode='hidden'; N.g.visible=false; N.st.hold=true; N.st.to=null; if(p){ N.st.x=p.x; N.st.z=p.z; N.g.position.x=p.x; N.g.position.z=p.z; } };
  const goOut=r=>{ const N=r.N, H=HOUSE(); if(!H)return; if(r.state==='home'&&N.mode&&flatOf(r)&&r.k0){ r.state='down'; indoor(r,AP().way(flatOf(r)).reverse().concat([{x:H.door.x,z:H.door.z}]),()=>{ outdoor(r); r.state='home'; goOut2(r); }); return; } goOut2(r); };
  const goOut2=r=>{ const N=r.N, H=HOUSE(); if(!H)return; r.state='out'; delete N.mode; if(r.k0)outdoor(r); N.g.visible=true; N.fv=true; N.st.hold=false; if(Math.hypot(N.st.x-H.door.x,N.st.z-H.door.z)>.5*T){ N.st.x=H.door.x; N.st.z=H.door.z; N.g.position.x=N.st.x; N.g.position.z=N.st.z; N.st.h=Math.PI; }
    const C=window.CIVIC, want=C&&C.wants&&C.wants(r), P=CITY.place(want||OUT[(r.n=(r.n||0)+1)%OUT.length]); if(P&&!P.stacked)CITY.send(N,P.door,{then:ok=>{ if(ok&&CITY.onArrive)CITY.onArrive(r,P); N.st.wait=6+Math.random()*10; r.back=N.st.wait+1; }}); };
  const street=N=>{ for(let k=0;k<12;k++){ const p={x:STLANE.x0+Math.random()*(STLANE.x1-STLANE.x0),z:STLANE.z0+Math.random()*(STLANE.z1-STLANE.z0)}; if(N.free(p.x,p.z,N.st.R)){ CITY.send(N,p); return; } } };
  const goHome=r=>{ const N=r.N, H=HOUSE(); if(!H)return; r.state='homing'; delete N.mode; N.g.visible=true; N.st.hold=false; CITY.send(N,H.door,{then:ok=>{ if(r.state!=='homing')return; if(!ok){ r.state='out'; r.again=20; return; } const F=flatOf(r); if(!F){ goIn(r); return; } r.state='up'; indoor(r,AP().way(F),()=>settle(r)); }}); };
  const start=()=>{ for(const r of R){ r.N=NPCS.find(n=>n.key===r.key); if(!r.N)continue; if(isOut(r,CLOCK.h)){ r.state='out'; } else goIn(r);
      CITY.at(r.leave,()=>{ if(r.state!=='out')goOut(r); },r.key+' leaves'); CITY.at(r.home,()=>{ if(r.state==='out')goHome(r); },r.key+' home'); } };
  setTimeout(start,0);
  const t0=CITY.tick; CITY.tick=(dt,you)=>{ t0(dt,you); for(const r of R){ if(!r.N)continue; if(r.k0)step(r,dt); if(r.again>0&&(r.again-=dt)>0)continue; if(r.back>0&&(r.back-=dt)<=0&&r.state==='out'&&!r.N.errand)street(r.N); const out=isOut(r,CLOCK.h); if(out&&r.state==='home')goOut(r); else if(!out&&r.state==='out'&&!r.N.errand)goHome(r); } };
  window.RESDBG=()=>R.map(r=>({key:r.key,flat:r.flat,state:r.state,floor:r.k0?Math.floor((r.y||0)/AP().SY+.08):null,wi:r.way?r.wi+'/'+r.way.length:null,vis:r.N&&r.N.g.visible,mode:r.N&&r.N.mode,x:r.N&&+(r.N.st.x/T).toFixed(1),z:r.N&&+(r.N.st.z/T).toFixed(1),errand:!!(r.N&&r.N.errand)}));
}

const VEHD=__DATA__("data/trashbag.json");

