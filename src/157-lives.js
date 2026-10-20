const LIVES={on:QS.has('lives')?QS.get('lives')!=='0':CITY.on,ready:false,ms:0,stepMs:0,list:[],force:null,skips:0};
{ const T=TILE, X=BOD.XS, Z=BOD.ZS, XB=BOD.X, ZB=BOD.Z, M=BOD.MAP, LS=BOD.K.LSEED, HZ=.25, R=.3, d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const ZS_=Z(LS.street-1.5), ZR=Z((LS.street+LS.grass)/2), ZF=Z((LS.grass+M.y1)/2), HOLE=[X(MAPSTAIR.x0-.6),Z(MAPSTAIR.y0),X(MAPSTAIR.x1+.6),Z(MAPSTAIR.y1+.6)];
  const inHole=(x,z)=>x>HOLE[0]&&x<HOLE[2]&&z>HOLE[1]&&z<HOLE[3];
  const P={}; const place=(id,o)=>{ P[id]=Object.assign({id,lv:'up',walls:false,reach:1.5*T,path:[]},o); return P[id]; };
  const bx=(Xf,Zf,r)=>({x0:Math.min(Xf(r[0]),Xf(r[2])),z0:Math.min(Zf(r[1]),Zf(r[3])),x1:Math.max(Xf(r[0]),Xf(r[2])),z1:Math.max(Zf(r[1]),Zf(r[3]))});
  const mid=(Xf,Zf,r)=>({x:(Xf(r[0])+Xf(r[2]))/2,z:(Zf(r[1])+Zf(r[3]))/2});
  LIVES.build=()=>{
    place('street',{door:null,reach:0});
    { const B=BOD.B0, dx=XB((B.x0+B.x1)/2); place('bodega',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:ZB(B.y1)+.6*T},{x:dx,z:ZB(B.y1)-3.4}],box:bx(XB,ZB,[B.x0+1,BOD.BODOFF+1,B.x1-1,B.y1-1]),reach:2.5*T}); }
    
    if(BOD.GD){ const G=BOD.GD, dx=XB(G.door[0]); place('dojo',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:ZB(G.door[1])+.8*T},{x:dx,z:ZB(G.door[1])-1.5*T},mid(XB,ZB,G.floor||G.r)],box:bx(XB,ZB,G.floor?[G.floor[0]+1.2,G.floor[1]+.3,G.floor[2]-1.2,G.floor[3]-.6]:[G.r[0]+1.2,G.r[1]+1.2,G.r[2]-1.2,G.r[3]-1.2]),reach:3*T}); }
    for(const [id,nm] of [['diner','diner'],['bar','bar']]){ const Rr=STORE.rooms.find(r=>r.id===nm); if(!Rr||Rr.fy)continue;
      place(id,{walls:true,door:{x:Rr.at.x,z:ZS_},path:[{x:Rr.at.x,z:Rr.z1+.6*T},{x:Rr.at.x,z:Rr.at.z}],box:{x0:Rr.x0+.8*T,z0:Rr.z0+.8*T,x1:Rr.x1-.8*T,z1:Rr.z1-.8*T},reach:3*T}); }
    { const gx=X((PARK.gate[0]+PARK.gate[1])/2+PARK.ox), gz=Z(PARK.y0+PARK.oy), rd={x:X(PARK.round[0]+PARK.ox),z:Z(PARK.round[1]+PARK.oy)};
      place('park',{door:{x:gx,z:ZF},path:[{x:gx,z:gz+.9*T},{x:gx,z:gz-1.2*T},rd],reach:5*T,grass:true});
      place('stalls',{door:{x:gx,z:ZF},path:[{x:gx,z:gz+.9*T},{x:gx,z:gz-1.2*T},{x:gx+2.5*T,z:gz-4*T}],reach:2.5*T,grass:true});
      const C=CASTLE, cg={x:X(C.gate),z:Z(C.b[2])}, bail={x:X(C.gate),z:Z((C.b[2]+C.b[3])/2+1)};
      const up=[{x:gx,z:gz+.9*T},{x:gx,z:gz-1.2*T},rd,{x:cg.x+1.5*T,z:rd.z},{x:cg.x+1.5*T,z:cg.z-2.5*T},{x:cg.x,z:cg.z-2.5*T},{x:cg.x,z:cg.z+1.5*T}];
      place('castle',{door:{x:gx,z:ZF},path:[...up,bail],reach:3*T,grass:true});
      const S=C.stair, Hh=C.hall, sx=X((S.x0+S.x1)/2), hm={x:X((Hh.x0+Hh.x1)/2),z:Z((Hh.y0+Hh.y1)/2)};
      place('dungeon',{lv:'down',door:{x:gx,z:ZF},path:[...up,{x:sx,z:Z(S.y0)-.35*T},{x:sx,z:Z(S.y0)+.3*T},{x:sx,z:Z(S.y1)-.3*T,lv:'down'},{x:sx,z:Z(S.y1)+.55*T,lv:'down'},{x:hm.x,z:Z(S.y1)+.55*T,lv:'down'},{...hm,lv:'down'}],box:{x0:X(Hh.x0+1.5),z0:Z(Hh.y0+1.5),x1:X(Hh.x1-1.5),z1:Z(Hh.y1-1.5)},reach:3*T}); }
    { const S=MAPSTAIR, sx=X((S.x0+S.x1)/2), plat=MODS.station.plat;
      if(MODS.station.path)place('subway',{lv:'down',door:{x:sx,z:ZS_},path:[{x:sx,z:Z(S.y1)+.5*T},...MODS.station.path],reach:4*T});
      else place('subway',{lv:'down',door:{x:sx,z:ZS_},path:[{x:sx,z:Z(S.y1)+.5*T},{x:sx,z:Z(S.y1)-.3*T},{x:sx,z:Z(S.y0)+.3*T,lv:'down'},{x:sx,z:Z(S.y0)-1.5*T,lv:'down'},{x:X(S.x0+2),z:Z(S.y0-16),lv:'down'},{...plat,lv:'down'}],reach:4*T}); } };
  const freeAt=(N,x,z,stair)=>!CLIP.hit(SOL[N.lv]||SOL.up,x,z,N.st.R)&&(stair||N.lv==='down'||!inHole(x,z));
  const lineFree=(N,a,b)=>{ const n=Math.ceil(d2(a,b)/(.33*T)); for(let k=1;k<=n;k++){ const t=k/n; if(!freeAt(N,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false; } return true; };
  const gnd=(N,x,z)=>{ const s=inStair(x,z,N.lv); if(s){ const S=s.S; if(S.ground)return S.ground(x,z,N.lv); const t=S.dir>0?s.gy-S.y0:S.y1-s.gy, k=Math.min(S.steps,Math.max(1,Math.floor(t/((S.y1-S.y0)/S.steps))+1)); return -k*S.depth/S.steps*ZU; }
    return N.lv==='down'?(MODS.dungeon&&MODS.dungeon.inside(x,z)?MODS.dungeon.ground(x,z):MODS.station.ground(x,z)):MODS.bodega.ground(x,z); };
  const level=N=>{ const y=gnd(N,N.st.x,N.st.z), lv=y<-1.6?'down':'up'; if(lv!==N.lv){ N.lv=lv; const g=lv==='down'?(MODS.dungeon&&MODS.dungeon.inside(N.st.x,N.st.z)&&MAPG.dungeon?MAPG.dungeon:MAPG.down):MAPG.bodega; if(N.g.parent!==g)g.add(N.g); } return y; };
  const side=(N,from,n,g)=>{ const dx=g.x-from.x, dz=g.z-from.z, l=Math.hypot(dx,dz)||1, px=-dz/l, pz=dx/l;
    for(const k of [.5,-.5,1,-1,1.6,-1.6,2.3,-2.3]){ const q={x:n.x+px*k*T,z:n.z+pz*k*T}; if(freeAt(N,q.x,q.z,true)&&lineFree(N,from,q))return q; } return null; };
  const route=(N,to)=>{ const L=N.life, st=N.st, wp=[], at=P[L.at];
    if(at&&at.path.length){ for(let k=Math.min(L.k,at.path.length)-1;k>=0;k--)wp.push({x:at.path[k].x,z:at.path[k].z,in:at.id}); wp.push({x:at.door.x,z:at.door.z,in:null}); }
    const from=wp.length?wp[wp.length-1]:{x:st.x,z:st.z}, dest=P[to], door=dest.door;
    if(door){ const lane=wp.length?from.z:(Math.abs(st.z-ZF)<Math.abs(st.z-ZS_)?ZF:ZS_);
      if(Math.abs(from.z-lane)>.05)wp.push({x:from.x,z:lane,in:null}); if(Math.abs(from.x-door.x)>.05)wp.push({x:door.x,z:lane,in:null}); if(Math.abs(lane-door.z)>.05)wp.push({x:door.x,z:door.z,in:null});
      for(const p of dest.path)wp.push({x:p.x,z:p.z,in:dest.id}); }
    else{ const lane=Math.abs(st.z-ZF)<Math.abs(st.z-ZS_)?ZF:ZS_; wp.push({x:from.x,z:lane,in:null},{x:from.x+(Math.random()-.5)*8*T,z:lane,in:null}); }
    L.wp=wp; L.i=0; L.tmp=null; L.stuck=0; L.to=to; L.state='walking'; };
  const wander=N=>{ const L=N.life, st=N.st, pl=P[L.at]; for(let k=0;k<8;k++){ let q;
      if(pl.id==='street'){ const r=(Math.random()<.5?-1:1)*(2+Math.random()*7)*T; q={x:Math.max(X(M.x0+2),Math.min(X(M.x1-2),st.x+r)),z:[ZS_,ZR,ZF][Math.floor(Math.random()*3)]}; }
      else if(pl.box){ const b=pl.box; q={x:b.x0+Math.random()*(b.x1-b.x0),z:b.z0+Math.random()*(b.z1-b.z0)}; }
      else{ const s=pl.path[pl.path.length-1], a=Math.random()*6.283, r=Math.random()*pl.reach; q={x:s.x+Math.sin(a)*r,z:s.z+Math.cos(a)*r}; }
      if(d2(q,st)<.5*T||!freeAt(N,q.x,q.z)||!lineFree(N,st,q))continue; L.wp=[{x:q.x,z:q.z,in:pl.walls?pl.id:null}]; L.i=0; L.tmp=null; L.stuck=0; L.state='walking'; return; } };
  const plan=(L,h)=>{ const t=(h-L.s+24)%24;
    if(t<7)return [L.home,'sleeping']; if(t<8)return [L.home,'standing']; if(t<9)return [L.meal,'sitting']; if(t<12)return [L.work,'standing']; if(t<13)return [L.meal,'sitting'];
    if(t<17)return [L.work,'standing']; if(t<19)return [L.eve,'standing']; if(t<22)return [L.night,L.night==='bar'?'sitting':'standing']; return [L.home,'sleeping']; };
  const lifeOf=(N,i)=>{ const k=N.key, pick=(a,b)=>i%2?a:b, s=((i*7)%9-4)*.2, has=id=>!!P[id];
    const L={s,home:has('lobby')?pick('lobby','hallway'):'street',meal:has('diner')?'diner':'street',work:'bodega',eve:pick('park','street'),night:'street',at:null,k:0,wp:null,i:0,state:'standing',to:null,wt:0};
    if(/^skeleton/.test(k)){ L.work='castle'; L.home=has('dungeon')?'dungeon':L.home; L.eve='park'; }
    else if(/^ogre/.test(k)){ L.work=has('dojo')?'dojo':'street'; }
    else if(/^hero/.test(k)){ L.work='park'; L.eve='stalls'; }
    else if(/^villager/.test(k)){ L.work=pick('bodega','stalls'); }
    else if(k==='mushroom'){ L.work='stalls'; L.eve='street'; }
    else if(k==='Gold'){ L.work='subway'; L.home='subway'; L.eve='street'; }
    if(i%4===1&&has('bar'))L.night='bar';
    return L; };
  const livesFor=N=>!('mode' in N)&&!N.guard&&!N.sheet&&!N.st.hold&&N.lv==='up'&&!(window.CREATS&&CREATS.includes(N))&&N.key!=='fox'&&N.key!=='scooterfrog'&&N.key!=='mushroom'&&N.key!=='bear'&&!N.errand&&!N.walker;
  LIVES.init=()=>{ if(!LIVES.on)return; LIVES.build(); let i=0; for(const N of NPCS)N.v0=N.st.v;
    for(const N of NPCS){ if(!livesFor(N))continue; const L=N.life=lifeOf(N,i++); N.st.hold=true; N.st.to=null;
      N.free=(x,z,R)=>freeAt(N,x,z,true); N.ground=(x,z)=>gnd(N,x,z);
      const [to,state]=plan(L,CLOCK.h), pl=P[to]; L.at=to; L.k=pl.path.length; L.state=state; L.to=to; L.inside=pl.walls?pl.id:null;
      const s=pl.path.length?pl.path[pl.path.length-1]:{x:N.st.x,z:N.st.z}; let put=null;
      for(let k=0;k<30&&!put;k++){ const a=Math.random()*6.283, r=k?Math.random()*pl.reach:0, q={x:s.x+Math.sin(a)*r,z:s.z+Math.cos(a)*r}; if(!CLIP.hit(SOL[pl.lv]||SOL.up,q.x,q.z,N.st.R)&&!NPCS.some(o=>o!==N&&o.life&&d2(o.st,q)<o.st.R+N.st.R))put=q; }
      if(put){ N.st.x=put.x; N.st.z=put.z; } N.lv=pl.lv; level(N); N.st.h=Math.random()*6.283; N.g.position.set(N.st.x,gnd(N,N.st.x,N.st.z),N.st.z); N.g.rotation.y=N.st.h; }
    LIVES.ready=true; };
  const within=(b,x,z,e)=>x>b.x0-e&&x<b.x1+e&&z>b.z0-e&&z<b.z1+e;
  LIVES.hidden=N=>{ const L=N.life; if(!L)return false; const cur=ROOMS.cur; if(cur&&!FREE)return !within(cur,N.st.x,N.st.z,.4*T);
    const inn=L.inside?P[L.inside]:null; return !!(inn&&inn.walls&&(N.lv!=='down'||LVL==='down')); };
  const passed=(N,g)=>{ const L=N.life; if(L.tmp){ L.tmp=null; return; } L.i++; L.inside=g.in; L.at=g.in||'street';
    if(g.in){ const j=P[g.in].path.findIndex(p=>p.x===g.x&&p.z===g.z); if(j>=0)L.k=g.in===L.to?j+1:j; } };
  const stepFar=(N,dt)=>{ const L=N.life, st=N.st, g=L.tmp||(L.wp&&L.wp[L.i]); if(!g){ arrive(N,dt); return; }
    const d=d2(g,st); if(d<.1*T){ passed(N,g); return; }
    const s=Math.min(d,st.v*dt), nx=st.x+(g.x-st.x)/d*s, nz=st.z+(g.z-st.z)/d*s;
    if(freeAt(N,nx,nz,true)&&!NPCS.some(q=>q!==N&&q.lv===N.lv&&!q.far&&q.blocks&&q.blocks(nx,nz,st.R))){ st.x=nx; st.z=nz; st.h=Math.atan2(g.x-st.x,g.z-st.z); L.stuck=0; }
    else{ const q=side(N,st,{x:nx,z:nz},g); if(q)L.tmp=q; else if((L.stuck+=dt)>8){ L.stuck=0; LIVES.skips++; st.x=g.x; st.z=g.z; } }
    level(N); N.g.position.set(st.x,gnd(N,st.x,st.z),st.z); N.g.rotation.y=st.h; };
  const stepNear=(N,dt)=>{ const L=N.life, st=N.st, g=L.tmp||(L.wp&&L.wp[L.i]); if(!g){ arrive(N,dt); return; }
    const d=d2(g,st); if(d<.12*T){ st.to=null; passed(N,g); return; }
    if(st.to){ L.stuck=0; return; }
    if((L.wt-=dt)>0)return; L.wt=.4;
    if(L.gave&&L.gave.x===g.x&&L.gave.z===g.z){ const dx=g.x-st.x, dz=g.z-st.z, l=Math.hypot(dx,dz), q=side(N,st,{x:st.x+dx/l*.6*T,z:st.z+dz/l*.6*T},g); if(q){ L.tmp=q; st.to={x:q.x,z:q.z}; st.wait=0; return; } if((L.stuck+=1)>12){ L.stuck=0; L.tmp=null; L.i++; LIVES.skips++; return; } }
    st.to={x:g.x,z:g.z}; st.wait=0; L.gave=g; };
  const arrive=(N,dt)=>{ const L=N.life, st=N.st; if(L.wp){ L.wp=null; L.at=L.to; L.k=P[L.at].path.length; L.inside=P[L.at].walls?L.at:null; L.state=plan(L,CLOCK.h)[1]; st.to=null; st.wait=1e9; L.wt=4+Math.random()*8; return; }
    if(L.state==='walking')L.state=plan(L,CLOCK.h)[1]; if(L.state==='standing'&&(L.wt-=dt)<=0){ L.wt=6+Math.random()*8; wander(N); } };
  let acc=0, n=0;
  LIVES.tick=(dt,you)=>{ if(!LIVES.ready)return; const t0=performance.now(); acc+=dt; const step=acc>=HZ; if(step)acc-=HZ;
    for(const N of NPCS){ const L=N.life;
      if(!L){ if(step&&N.far)beat(N,HZ); continue; }
      if(step){ const [to,state]=plan(L,CLOCK.h); if(to!==L.to)route(N,to); else if(!L.wp)L.state=state; if(N.far)stepFar(N,HZ); }
      if(!N.far)stepNear(N,dt); }
    const ms=performance.now()-t0; LIVES.ms+=(ms-LIVES.ms)*.02; if(step)LIVES.stepMs+=(ms-LIVES.stepMs)*.1; if(step&&PANEL)PANEL(); };
  const beat=(N,dt)=>{ const st=N.st; if(st.hold&&!N.guard)return; if(!st.to){ if((st.wait-=dt)>0)return; if(N.pick)N.pick(); if(!st.to)return; }
    if(!(st.v>.05*T))st.v=N.v0;
    const d=d2(st.to,st); if(d<.1*T){ st.to=null; st.wait=N.guard?2.5:1.5+Math.random()*4; return; } const s=Math.min(d,st.v*dt), nx=st.x+(st.to.x-st.x)/d*s, nz=st.z+(st.to.z-st.z)/d*s;
    if(N.free&&!N.free(nx,nz,st.R)){ st.to=null; st.wait=1; return; } st.h=Math.atan2(st.to.x-st.x,st.to.z-st.z); st.x=nx; st.z=nz; N.g.position.set(st.x,N.ground(st.x,st.z),st.z); N.g.rotation.y=st.h; };
  LIVES.dbg=()=>NPCS.map(N=>{ const L=N.life, dr=N.key==='dragon'; return {key:N.key,state:L?L.state:dr?'flying':N.guard?(N.st.to?'walking':'standing'):N.st.to?'walking':'standing',place:L?(L.wp?'to '+L.to:L.at):dr?'the sky':N.guard?'beat':N.lv==='down'?'platform':'street',drawn:!N.far&&N.g.visible&&N.g.parent.visible&&(N.lv===LVL||N.g.parent.visible),far:!!N.far,lv:N.lv,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),y:+N.g.position.y.toFixed(2)}; });
  LIVES.places=()=>Object.values(P).map(p=>({id:p.id,lv:p.lv,door:p.door,path:p.path,box:p.box}));
  LIVES.lineFree=(key,a,b,lv)=>{ const N=NPCS.find(n=>n.key===key), l0=N.lv; if(lv)N.lv=lv; const r=lineFree(N,a,b); N.lv=l0; return r; };
  LIVES.legHit=(key,a,b,lv)=>{ const N=NPCS.find(n=>n.key===key), L=SOL[lv||N.lv], n=Math.ceil(d2(a,b)/(.33*T)); for(let k=1;k<=n;k++){ const t=k/n, h=CLIP.hit(L,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,N.st.R); if(h)return {box:h,at:[a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t]}; } return null; };
  LIVES.send=(key,to)=>{ const N=NPCS.find(n=>n.key===key); if(N&&N.life&&P[to]){ N.life.to=null; route(N,to); N.life.to=to; } };
  let PANEL=null;
  if(QS.get('lives')==='1'){ const d=document.createElement('div'); d.id='lives'; d.style.cssText='position:fixed;right:8px;top:8px;max-height:92vh;overflow:auto;font:10px monospace;color:#cfd3dc;background:rgba(10,12,18,.85);padding:6px 8px;z-index:40;white-space:pre;line-height:1.25'; document.body.appendChild(d);
    PANEL=()=>{ let s='LIVES '+LIVES.ms.toFixed(3)+' ms/frame  '+CLOCK.h.toFixed(2)+'h\nKEY              STATE     PLACE          DRAWN\n'; for(const r of LIVES.dbg())s+=(r.key+'                ').slice(0,16)+' '+(r.state+'         ').slice(0,9)+' '+(r.place+'              ').slice(0,14)+' '+(r.drawn?'yes':'-')+'\n'; d.textContent=s; }; } }
