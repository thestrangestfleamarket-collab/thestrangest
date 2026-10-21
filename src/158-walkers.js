Object.assign(WALKERS,{list:[],on:QS.get('walkers')==='1'}); window.WALKERS=WALKERS;
if(WALKERS.on){ const T=TILE, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, rnd=Math.random, pick=a=>a[Math.floor(rnd()*a.length)], R=(a,b)=>a+rnd()*(b-a);
  const GAIT={stroll:['walk_b',1.6,[.75,1]],walk:['UAL_Walk_Loop',1.6,[1,1.3]],brisk:['walk_a',1.6,[1.3,1.7]],formal:['UAL_Walk_Formal_Loop',1.5,[1,1.25]],jog:['UAL_Jog_Fwd_Loop',3.4,[2.4,3]],run:['run_a',5,[3.4,4.2]]};
  const KIND={
    parkgoer:{w:3,gaits:['stroll','walk','stroll'],stay:[8,26],idles:['sit_floor_idle_a','UAL_Idle_Loop','idle_b','found_item_idle_a'],to:()=>rnd()<.75?'park':'place'},
    explorer:{w:3,gaits:['walk','brisk','formal'],stay:[3,9],idles:['idle_a','found_item_idle_a','UAL_Idle_Loop'],to:()=>rnd()<.6?'city':rnd()<.5?'park':'place'},
    shopper:{w:2,gaits:['walk','stroll'],stay:[6,16],idles:['UAL_Idle_Talking_Loop','idle_a','UAL_Idle_Loop'],to:()=>rnd()<.8?'shop':'city'},
    jogger:{w:1,gaits:['jog','jog','run'],stay:[1,3],idles:['UAL_Idle_Loop','idle_b'],to:()=>'lap'},
    loiterer:{w:1,gaits:['stroll'],stay:[15,40],idles:['UAL_Idle_Talking_Loop','idle_b','cheer_idle_a','sit_floor_idle_a'],to:()=>'near'},
    commuter:{w:2,gaits:['brisk','formal'],stay:[10,22],idles:['UAL_Idle_Loop','idle_a'],to:()=>'commute'},
    golem:{w:0,gaits:['stroll'],stay:[20,60],idles:['UAL_Idle_Talking_Loop','sit_floor_idle_a','idle_b','cheer_idle_a','UAL_Idle_Loop'],to:()=>window.GCAVE&&GCAVE.ready?GCAVE.haunt():'round'}};
  const KW=Object.entries(KIND).flatMap(([k,v])=>Array(v.w).fill(k));
  const P0=()=>({x0:X(PARK.x0+PARK.ox+2),x1:X(PARK.x1+PARK.ox-2),z0:Z(PARK.y0+PARK.oy+2),z1:Z(PARK.y1+PARK.oy-2)});
  const inPark=(x,z)=>{ const p=P0(); return x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1; };
  const places=()=>CITY.places().filter(p=>p.lv==='up'&&!p.stacked&&p.door);
  const SHOPS=['bodega','store:diner','store:bar','dojo','park'].filter(id=>!/^store:/.test(id)||!AWAY.has(id.slice(6)));
  const CORNERS=[[RING.wx0+1.6,SHARED.BOD.FAR+.6],[RING.wx0+1.6,RING.cf.y1-1.4],[RING.wx0+1.6,SHARED.BOD.FAR+.6],[RING.cf.x1-1.6,SHARED.BOD.FAR+.6]];
  const spot=(N,W,what)=>{ '@later'; const st=N.st, ok=p=>p&&N.free(p.x,p.z,st.R);
    for(let k=0;k<16;k++){ let p=null;
      if(what==='park'){ const b=P0(); p={x:R(b.x0,b.x1),z:R(b.z0,b.z1)}; }
      else if(what==='city'){ const L=STLANE; p={x:R(L.x0,L.x1),z:R(L.z0,L.z1)}; }
      else if(what==='place'){ const P=pick(places()); p=P&&{x:P.door.x+R(-.6,.6)*T,z:P.door.z+R(-.3,.3)*T}; }
      else if(what==='shop'){ const P=CITY.place(pick(SHOPS)); p=P&&{x:P.door.x+R(-1,1)*T,z:P.door.z+R(-.4,.4)*T}; }
      else if(what==='lap'){ W.lap=((W.lap??Math.floor(rnd()*4))+1)%4; const c=CORNERS[W.lap]; p={x:X(c[0])+R(-.4,.4)*T,z:Z(c[1])+R(-.4,.4)*T}; }
      else if(what==='round'){ const [cx,cy,r]=PARK.round, a=rnd()*Math.PI*2, d=R(.3,1)*(r+1.5); p={x:X(cx+PARK.ox+Math.cos(a)*d),z:Z(cy+PARK.oy+Math.sin(a)*d)}; }
      else if(what==='cave'||what==='mouth'){ p=GCAVE.spot(what); }
      else if(what==='near'){ p={x:W.home.x+R(-6,6)*T,z:W.home.z+R(-6,6)*T}; }
      else if(what==='mailbox'){ const s=W.home.step||W.home.b.step; p={x:s.x+R(-.3,.3)*T,z:s.z+R(-.2,.2)*T}; }
      else if(what==='commute'){ W.leg^=1; const P=W.ends[W.leg]; p=P&&{x:P.door.x+R(-.6,.6)*T,z:P.door.z+R(-.3,.3)*T}; }
      if(ok(p))return p; }
    return null; };
  const next=(N,W)=>{ '@later'; const K=KIND[W.kind], mail=W.home&&window.MAIL&&MAIL.ready&&MAIL.waiting(W.home)&&rnd()<.6, to=mail?spot(N,W,'mailbox'):spot(N,W,K.to()); W.state='going'; N.dwell=null; W.mail=!!(mail&&to); if(!to){ W.state='wait'; W.t=2; return; }
    W.where=to; CITY.send(N,to,{v:W.v,then:ok=>{ if(N.errand)return; if(!ok){ W.state='wait'; W.t=1+rnd()*2; return; }
      if(W.mail){ W.mail=false; const got=MAIL.take(W.home.id,N.name); W.state='stay'; W.t=4+got.length*2.5; N.dwell='found_item_idle_a'; N.st.hold=true; N.st.to=null; const F=W.home.b.F; N.st.face={x:N.st.x-F.n.x,z:N.st.z-F.n.z}; return; }
      W.state='stay'; W.t=R(...K.stay)*(W.kind==='jogger'?1:R(.7,1.3)); N.dwell=inPark(N.st.x,N.st.z)||(W.kind!=='parkgoer'&&W.kind!=='golem')?pick(K.idles):'UAL_Idle_Loop'; if(N.dwell==='sit_floor_idle_a'&&!inPark(N.st.x,N.st.z))N.dwell='UAL_Idle_Loop';
      N.st.hold=true; N.st.to=null; const a=rnd()*Math.PI*2; N.st.face={x:N.st.x+Math.sin(a),z:N.st.z+Math.cos(a)}; }}) ; };
  const start=()=>{ '@later'; let i=0;
    for(const N of (window.PAWNL||[])){ if(N.staff||N.lv==='down'||N.sheet)continue; const kind=/_\d$/.test(N.key)?'golem':KW[Math.floor(rnd()*KW.length)], K=KIND[kind], g=pick(K.gaits), G=GAIT[g];
      const W={N,kind,gait:g,v:R(...G[2]),state:'wait',t:R(0,4),home:{x:N.st.x,z:N.st.z},leg:0,lap:null};
      if(kind==='loiterer'){ const s=spot(N,W,rnd()<.5?'park':'city'); if(s)W.home=s; }
      if(kind==='commuter'){ const ps=places(); W.ends=[pick(ps),pick(ps)]; }
      if(kind==='golem'){ const f0=N.free; N.free=(x,z,R)=>window.GCAVE&&GCAVE.ready&&GCAVE.inBox(x,z,R)?!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R):f0(x,z,R); }
      N.walker=W; N.gait=G[0]; N.gaitU=G[1]; N.idle=pick(K.idles.filter(c=>c!=='sit_floor_idle_a')); N.name=(N.name||'').replace(/_\d+$/,'')+' ('+kind+')';
      WALKERS.list.push(W); i++; } };
  setTimeout(start,0);
  let acc=0; SYS.add('city',(dt,you)=>{ '@later'; for(const W of WALKERS.list){ const N=W.N; if(W.job&&W.job.state&&W.job.state!=='off')continue; if(W.state==='going'&&!N.errand){ W.state='wait'; W.t=.5; } if(W.state==='going')continue; if((W.t-=dt)<=0){ N.st.face=null; next(N,W); } }
    if((acc+=dt)<1)return; acc=0; const S=WALKERS.list.filter(W=>W.state==='stay'&&!(W.job&&W.job.state&&W.job.state!=='off'));
    for(const A of S)for(const B of S){ if(A===B||A.talk||B.talk)continue; const a=A.N.st, b=B.N.st; if(Math.hypot(a.x-b.x,a.z-b.z)<2.2*T&&A.N.dwell!=='sit_floor_idle_a'&&B.N.dwell!=='sit_floor_idle_a'){ A.talk=B.talk=true; A.N.dwell=B.N.dwell='UAL_Idle_Talking_Loop'; a.face={x:b.x,z:b.z}; b.face={x:a.x,z:a.z}; const m=Math.max(A.t,B.t); A.t=B.t=m; } }
    for(const W of WALKERS.list)if(W.state!=='stay')W.talk=false; },'158-walkers');
  window.WALKDBG=()=>WALKERS.list.map(W=>({key:W.N.key,kind:W.kind,gait:W.gait,v:+W.v.toFixed(2),state:W.state,dwell:W.N.dwell,x:+(W.N.st.x/T+72).toFixed(1),y:+(W.N.st.z/T-77).toFixed(1),park:inPark(W.N.st.x,W.N.st.z),vis:W.N.g.visible}));
}
