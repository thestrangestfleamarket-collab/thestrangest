// THE FOLK'S WALKS ON YOUR SCREEN: WALKS gives every walker on the street its place and its way from the section's server (worker/folk.js, stepped there whoever is logged in) or, off the website, from the same walks run here; the characters only walk to what it says, so everyone sees the same street and nobody starts over when you log in.
import {SHARED} from './003-shx.js';
import {CITY, NPCS, ONLINE, VIS, WALKS} from './003b-systems.js';
import {QS, SYS, TILE} from './006-map-pre.js';
import {HOMES, pedfree, ROAM} from './076-npc-map.js';
__CODE__("worker/folk.js")
Object.assign(WALKS,{on:QS.get('folk')==='1',remote:false,by:new Map(),S:null,sim:FOLKSIM,sent:0}); window.WALKS=WALKS;
{ const T=TILE, R0=.3*T, TELE=2.5*T, NUDGE=.6*T, S=WALKS.S=FOLKSIM.make(); S.T=T; S.freeFn=(x,z)=>pedfree(x,z,R0); S.routeFn=(a,b)=>{ const r=CITY.route&&CITY.route('up',a,b,pedfree); return r?r.pts:null; };   // off the road but on a crosswalk (076)
  S.walk=()=>!SHARED.BOD.road||!SHARED.BOD.road.walk||SHARED.BOD.road.walk();
  const stamp=()=>String(__BUILDV__)+':'+((SHARED.MAPLIVE&&SHARED.MAPLIVE.at)||''); WALKS.stamp=stamp;
  let batch=[], gateSet=false, bake=null, scanT=0, ready=false, castHave='', castSent='';
  SYS.onStart(()=>{ (typeof LOAD==='function'?LOAD('later'):Promise.resolve()).then(()=>{ ready=true; },()=>{ ready=true; }); },'111db-walks');   // the scan reads the homes' doors (in the later chunk)
  const gate=()=>{ if(gateSet||!ROAM.gate)return; gateSet=true; S.gate={z:ROAM.wallZ,x0:ROAM.gate[0],x1:ROAM.gate[1]}; const R=SHARED.BOD.road, w=R&&R.xw&&R.xw.find(q=>q.lit), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS; if(w)S.xl={x0:X(w.a0),x1:X(w.a1),z0:Math.min(Z(w.l0),Z(w.h0)),z1:Math.max(Z(w.l0),Z(w.h0))}; };
  const send=(k,m)=>{ FOLKSIM.set(S,k,m); if(WALKS.remote)batch.push([k,m]); };
  const flush=()=>{ if(batch.length&&WALKS.remote&&ONLINE.on){ ONLINE.send({t:'folk',set:batch}); WALKS.sent+=batch.length; } batch=[]; };
  WALKS.key=N=>N.wkey||(N.st&&N.st.home&&N.st.home.id)||N.key;
  // a walker joins the walks: where it stands now, its pace, its mode (worker/folk.js: a home range, an area, free roaming, a shop door, standing)
  WALKS.reg=(N,m)=>{ '@later'; const k=WALKS.key(N); let r=WALKS.by.get(k); if(r){ if(m.mode)WALKS.mode(N,m.mode); return r; } const st=N.st;
    r={k,N,E:null,t:0,v:m.v||.3*T,auto:m.auto?1:0,mode:JSON.stringify(m.mode||null),goal:null,then:null,gid:'',t0:0,hid:false}; WALKS.by.set(k,r); st.folk=r;
    send(k,{x:st.x,z:st.z,hd:st.hd??st.h??0,v:r.v,R:st.R||R0,auto:r.auto,mode:m.mode||null}); return r; };
  WALKS.has=N=>!!(N.st&&N.st.folk);
  WALKS.mode=(N,mode,out)=>{ const r=N.st&&N.st.folk; if(!r)return; const j=JSON.stringify(mode||null); if(j===r.mode&&!out)return; r.mode=j; send(r.k,{mode,out:out?1:0}); };
  // an errand: walk to a door or a spot (now: be there), in: stay hidden inside on arriving (seconds, or until told out); then(ok) when it is there
  WALKS.errand=(N,at,o={})=>{ const r=N.st&&N.st.folk; if(!r)return false; r.then=o.then||null; r.gid=String(o.gid||''); r.t0=performance.now(); r.goal={goal:{gid:r.gid,at:{x:at.x,z:at.z},in:o.in?(o.in>0?o.in:1):0,now:o.now?1:0}}; send(r.k,r.goal); return true; };
  WALKS.pick=st=>!!st.folk;   // a walker in the walks never picks its own way
  // every character that walks by its home range or roams, on the street, with no mind of its own, joins; the cast's jobs (159-jobs) bring theirs
  const scan=()=>{ '@later'; for(const N of NPCS.all()){ if(!N.st||N.st.folk||!N.walk||!N.walk.auto||(N.lv||'up')!=='up'||N.on===false||N.board)continue; const h=N.st.home; if(!h||!(h.r>0))continue;
      if(N.walk.roam)WALKS.reg(N,{v:N.walk.v,auto:1,mode:{roam:1}});
      else { let d=null; try{ d=HOMES.door(h); }catch(e){} const L=N.walk.lane; WALKS.reg(N,{v:N.walk.v,auto:1,mode:{b:{x:h.x,z:h.z,r:h.r},lane:L?[L.x0,L.z0,L.x1,L.z1]:null,shop:d?{x:d.x,z:d.z}:null}}); } } };
  const hide=(N,v)=>{ if(v){ N.mode='hidden'; VIS.hide(N.g,'away'); } else { delete N.mode; VIS.hide(N.g,'away',false); } };
  // where the walks say a walker is: the server's last word walked on since it came (its pace along its way), or the walks run here
  const V={x:0,z:0,tx:null,tz:null,st:0,done:''};
  const view=r=>{ '@later'; if(WALKS.remote){ const e=r.E; if(!e)return null; let x=e.x, z=e.z; if(e.st===1&&e.tx!=null){ const s=Math.min(Math.hypot(e.tx-x,e.tz-z),r.v*(performance.now()-r.t)/1000), d=Math.hypot(e.tx-x,e.tz-z); if(d>1e-6){ x+=(e.tx-x)/d*s; z+=(e.tz-z)/d*s; } } V.x=x; V.z=z; V.tx=e.tx; V.tz=e.tz; V.st=e.st; V.done=e.done; return V; }
    const E=S.by[r.k]; if(!E)return null; V.x=E.x; V.z=E.z; V.tx=E.to?E.to.x:null; V.tz=E.to?E.to.z:null; V.st=E.in?2:E.to?1:E.mode.hold?3:0; V.done=E.done; return V; };
  // the character follows: it walks to the walks' next point itself (turning, stepping, pushed by you as ever), is eased over when a little off, put there when far off or out of sight, hidden while in a shop
  const drive=(r,dt)=>{ '@later'; const N=r.N, st=N.st; if(N.rag)return; const e=view(r); if(!e)return;
    if(r.then&&(e.done===r.gid||performance.now()-r.t0>180000)){ const f=r.then; r.then=null; r.goal=null; f(e.done===r.gid); }
    if(r.auto){ if(e.st===2){ if(!r.hid){ r.hid=true; hide(N,true); } st.x=e.x; st.z=e.z; st.to=null; st.next=null; return; } if(r.hid){ r.hid=false; hide(N,false); st.x=e.x; st.z=e.z; } }
    if(st.pin)return;
    const gap=Math.hypot(e.x-st.x,e.z-st.z);
    if(N.far||gap>TELE){ st.x=e.x; st.z=e.z; st.to=null; st.next=null; if(N.g){ N.g.position.x=e.x; N.g.position.z=e.z; } return; }
    if(gap>NUDGE){ const k=Math.min(1,dt*1.5); st.x+=(e.x-st.x)*k; st.z+=(e.z-st.z)*k; }
    if(e.st===1){ if(!st.to||st.to.x!==e.tx||st.to.z!==e.tz){ st.to={x:e.tx,z:e.tz}; st.next=null; } st.wait=0; }
    else { if(st.to&&Math.hypot(st.to.x-e.x,st.to.z-e.z)<.5*T)return; st.to=gap>.3*T?{x:e.x,z:e.z}:null; st.next=null; } };
  // the walk grid for the server: the street's free ground in half-tile cells (as the city's pathfinder sees it), baked a few rows a frame when the server's is from another build or map, then sent
  WALKS.bake=()=>{ gate(); const b=CITY.bounds('up'), c=T/2, w=Math.ceil((b[2]-b[0])/c), h=Math.ceil((b[3]-b[1])/c), m=new Uint8Array(w*h); return {b,c,w,h,m,j:0,done(){ return {v:stamp(),x0:b[0],z0:b[1],c,w,h,rle:FOLKSIM.pack(m,w*h),T,gate:S.gate,xl:S.xl}; }}; };
  const bakeSome=()=>{ const B=bake, {b,c,w,h,m}=B; const j1=Math.min(h,B.j+16); for(let j=B.j;j<j1;j++)for(let i=0;i<w;i++)if(pedfree(b[0]+(i+.5)*c,b[1]+(j+.5)*c,R0))m[j*w+i]=1; B.j=j1; if(j1>=h){ const G=B.done(); bake=null; if(ONLINE.on)ONLINE.send({t:'folk',grid:G}); WALKS.grid=G; } };
  ONLINE.hear.folk=m=>{ '@later'; if(!WALKS.on)return; if(m.need&&!bake)bake=WALKS.bake(); if(!Array.isArray(m.n))return; const now=performance.now();
    for(const a of m.n){ if(!Array.isArray(a))continue; const k=String(a[0]), r=WALKS.by.get(k), e={x:+a[1]||0,z:+a[2]||0,tx:a[3]===''||a[3]==null?null:+a[3],tz:a[4]===''||a[4]==null?null:+a[4],hd:+a[5]||0,st:a[6]|0,done:String(a[7]||''),in:+a[8]||0}; if(r){ r.E=e; r.t=now; }
      const L=S.by[k]; if(L){ L.x=e.x; L.z=e.z; L.hd=e.hd; L.to=e.tx!=null?{x:e.tx,z:e.tz}:null; L.next=null; L.path=null; if(e.st===2){ if(!L.in)L.in=e.in||-1; } else L.in=0; } } };
  // on the website the section's server runs the walks: it is told of every walker here (it keeps those it has), and asked for nothing else; off it, or cut off, they run here from where the server last had them
  SYS.add('hi',m=>{ '@later'; if(!WALKS.on)return; WALKS.remote=true; batch=[]; for(const r of WALKS.by.values()){ const st=r.N.st; batch.push([r.k,{x:st.x,z:st.z,hd:st.hd??st.h??0,v:r.v,R:st.R||R0,auto:r.auto,mode:JSON.parse(r.mode)}]); if(r.goal)batch.push([r.k,r.goal]); } flush();
    if(m.folk)ONLINE.hear.folk(m.folk); if(m.fv!=null&&m.fv!==stamp()&&!bake)bake=WALKS.bake(); castHave=String(m.fc||''); castSent=''; },'111db-walks');
  // the cast's table (159-jobs) goes up when the server's is from another build or has fewer of them
  const castUp=()=>{ '@later'; if(!WALKS.remote||!ONLINE.on||!WALKS.cast)return; const n=WALKS.castN(); if(!n)return; const fc=stamp()+':'+n; if(fc===castHave||fc===castSent)return; const [hv,hn]=castHave.split(':'); if(hv===stamp()&&+hn>=n){ castSent=fc; return; } castSent=fc; const t=WALKS.cast(); ONLINE.send({t:'folk',cast:{v:stamp(),...t}}); };
  SYS.add('city',dt=>{ if(!WALKS.on)return; dt=dt||0; gate(); if(WALKS.remote&&!ONLINE.on)WALKS.remote=false; if(ready&&(scanT-=dt)<=0){ scanT=2; scan(); castUp(); } if(!WALKS.remote)FOLKSIM.step(S,dt); for(const r of WALKS.by.values())drive(r,dt); if(bake)bakeSome(); flush(); },'111db-walks');
  window.WALKSDBG=k=>k?{r:WALKS.by.get(k)&&{mode:WALKS.by.get(k).mode,E:WALKS.by.get(k).E,goal:WALKS.by.get(k).goal},S:S.by[k]}:{n:WALKS.by.size,remote:WALKS.remote,sent:WALKS.sent,grid:!!WALKS.grid,keys:[...WALKS.by.keys()]};
}
