// THE CITY: CITY lists the town's places and keeps the day, jobs and schedules of its people.
import {SHARED} from './003-shx.js';
import {CITY, CLIP, CLOCK, DN, MAPED, NPCS, PARK} from './003b-systems.js';
import {CASTLE, MAPSTAIR, MODS, QS, SOL, STORE, TILE} from './006-map-pre.js';
import {STHOLE} from './076-npc-map.js';
Object.assign(CITY,{on:QS.get('city')==='1',jobs:[],sched:[],day:DN.day?DN.day():0,nj:0,extra:[]}); window.CITY=CITY;
{ const T=TILE, R0=.3*T, C=T/2;
  CITY.places=()=>{ const P=[], add=(id,name,x,z,dz,lv='up',o={})=>P.push(Object.assign({id,name,lv,at:{x,z},door:{x,z:z+dz}},o));
    { const B=SHARED.BOD.B0; add('bodega','THE BODEGA',SHARED.BOD.X((B.x0+B.x1)/2),SHARED.BOD.Z(B.y1),T); }
    
    if(MODS.apts&&MODS.apts.A){ const A=MODS.apts.A; add('house','APARTMENT HOUSE',SHARED.BOD.X(MODS.apts.DX),SHARED.BOD.Z(A.y1),T); }
    if(SHARED.BOD.GD)add('dojo','THE BATH HOUSE',SHARED.BOD.X(SHARED.BOD.GD.door[0]),SHARED.BOD.Z(SHARED.BOD.GD.door[1]),T);
    add('park','CENTRAL PARK',SHARED.BOD.XS((PARK.gate[0]+PARK.gate[1])/2+PARK.ox),SHARED.BOD.ZS(PARK.y0+PARK.oy),-T);
    add('castle','THE CASTLE',SHARED.BOD.XS(CASTLE.gate),SHARED.BOD.ZS(CASTLE.b[2]),-1.5*T);
    add('subway','THE SUBWAY',SHARED.BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),SHARED.BOD.ZS(MAPSTAIR.y1),.8*T);
    add('platform','THE PLATFORM',MODS.station.plat.x,MODS.station.plat.z,0,'down');
    for(const [n,x,z,lv,off] of STORE.places)if((x||z)&&!off)add('store:'+n.toLowerCase().replace(/^the /,'').replace(/\s+/g,'-'),n,x,z,0,lv,{inside:true,stacked:typeof lv==='number'});
    for(const e of CITY.extra)P.push(e);
    return P; };
  CITY.place=id=>CITY.places().find(p=>p.id===id||p.name===String(id).toUpperCase());
  const GRID=new Map();
  const bounds=lv=>{ if(lv==='down'){ const L=SOL.down; let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const b of L){ x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); } return [x0-2*T,z0-2*T,x1+2*T,z1+2*T]; }
    let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const k of ['bodega','house','apartments','ghost','park','castle','subway']){ const b=MAPED.box&&MAPED.box(k); if(!b)continue; x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); }
    for(const e of CITY.extra)if(e.box){ x0=Math.min(x0,e.box[0]); z0=Math.min(z0,e.box[1]); x1=Math.max(x1,e.box[2]); z1=Math.max(z1,e.box[3]); }
    return [x0-4*T,z0-4*T,x1+4*T,z1+4*T]; };
  const grid=(lv,free,part)=>{ '@later'; const L=SOL[lv], NL=L.length+((CITY.extra&&CITY.extra[lv])||[]).length, gk=lv+':'+(free?free.name||'f':''), GK=part?(free?free.name||'f':'')+lv+':'+part:free||lv; let g=GRID.get(GK); if(g&&g.n===NL)return g; const b=part==='dun'?dunB():bounds(lv), w=Math.ceil((b[2]-b[0])/C), h=Math.ceil((b[3]-b[1])/C);
    g={n:NL,lv,free,x0:b[0],z0:b[1],w,h,m:new Uint8Array(w*h),cell:(x,z)=>[Math.floor((x-b[0])/C),Math.floor((z-b[1])/C)],at:(i,j)=>({x:b[0]+(i+.5)*C,z:b[1]+(j+.5)*C})};
    g.free=(i,j)=>{ if(i<0||j<0||i>=w||j>=h)return false; const k=j*w+i; let v=g.m[k]; if(!v){ const p=g.at(i,j); v=g.m[k]=CITY.blocked(lv,p.x,p.z,free)?2:1; } return v===1; }; g.mark=(x,z)=>{ const [i,j]=g.cell(x,z); if(i>=0&&j>=0&&i<w&&j<h)g.m[j*w+i]=2; }; GRID.set(GK,g); return g; };
  const dunB=()=>{ const q=MODS.dungeon.bound(), x0=Math.min(q.x0,q.x1), x1=Math.max(q.x0,q.x1), z0=Math.min(q.z0,q.z1), z1=Math.max(q.z0,q.z1); return [x0-2*T,z0-2*T,x1+2*T,z1+2*T]; };   // the dungeon's own grid, not one over the whole of the underground
  CITY.blocked=(lv,x,z,free)=>{ if(free)return !free(x,z,R0); if(lv==='up'&&typeof STHOLE!=='undefined'){ const H=STHOLE, R=R0; if(x>H[0]-R&&x<H[2]+R&&z>H[1]-R&&z<H[3]+R)return true; } return !!CLIP.hit(SOL[lv],x,z,R0)||!!(CITY.extra&&CITY.extra[lv]&&CITY.extra[lv].length&&CLIP.hit(CITY.extra[lv],x,z,R0)); };   // CITY.extra: places a route keeps out of but you can still walk (a dungeon's cliff edges)
  const clear=(lv,a,b,free)=>{ const d=Math.hypot(b.x-a.x,b.z-a.z), n=Math.max(1,Math.ceil(d/(T/8))); for(let k=1;k<n;k++){ const t=k/n; if(CITY.blocked(lv,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,free))return false; } return true; };
  const nearFree=(g,x,z)=>{ const [i0,j0]=g.cell(x,z); for(let r=0;r<=4;r++)for(let i=i0-r;i<=i0+r;i++)for(let j=j0-r;j<=j0+r;j++)if((Math.abs(i-i0)===r||Math.abs(j-j0)===r)&&g.free(i,j))return [i,j]; return null; };
  CITY.route=(lv,a,b,free)=>{ '@later'; const D=MODS.dungeon, inD=p=>{ const q=D.bound(), m=3*T; return p.x>Math.min(q.x0,q.x1)-m&&p.x<Math.max(q.x0,q.x1)+m&&p.z>Math.min(q.z0,q.z1)-m&&p.z<Math.max(q.z0,q.z1)+m; }, part=lv==='down'&&D&&D.bound&&(inD(a)||inD(b))?'dun':'', t0=performance.now(), g=grid(lv,free,part), s=nearFree(g,a.x,a.z), e=nearFree(g,b.x,b.z); if(!s||!e)return null;
    const W=g.w, key=(i,j)=>j*W+i, ks=key(s[0],s[1]), ke=key(e[0],e[1]), G=new Map([[ks,0]]), F=new Map(), from=new Map(), open=[ks], inO=new Set([ks]), closed=new Set();
    const h=k=>{ const di=Math.abs(k%W-e[0]), dj=Math.abs(Math.floor(k/W)-e[1]); return Math.max(di,dj)+.4142*Math.min(di,dj); }; F.set(ks,h(ks));
    const up=k=>{ let i=open.length-1; while(i>0){ const p=(i-1)>>1; if(F.get(open[p])<=F.get(open[i]))break; [open[p],open[i]]=[open[i],open[p]]; i=p; } };
    const pop=()=>{ const r=open[0], l=open.pop(); if(open.length){ open[0]=l; let i=0; for(;;){ const a=2*i+1, b=a+1; let m=i; if(a<open.length&&F.get(open[a])<F.get(open[m]))m=a; if(b<open.length&&F.get(open[b])<F.get(open[m]))m=b; if(m===i)break; [open[m],open[i]]=[open[i],open[m]]; i=m; } } return r; };
    let found=false, steps=0; while(open.length&&steps++<400000){ const k=pop(); inO.delete(k); if(k===ke){ found=true; break; } closed.add(k); const i=k%W, j=Math.floor(k/W), gk=G.get(k);
      for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){ if(!di&&!dj)continue; const ni=i+di, nj=j+dj; if(!g.free(ni,nj))continue; if(di&&dj&&!(g.free(i+di,j)&&g.free(i,j+dj)))continue;
        const nk=key(ni,nj); if(closed.has(nk))continue; const ng=gk+(di&&dj?1.4142:1); if(ng<(G.get(nk)??1e18)){ G.set(nk,ng); F.set(nk,ng+h(nk)); from.set(nk,k); if(!inO.has(nk)){ open.push(nk); inO.add(nk); up(); } } } }
    if(!found)return null; const cells=[]; for(let k=ke;k!==undefined;k=from.get(k))cells.push(g.at(k%W,Math.floor(k/W))); cells.reverse(); cells[0]={x:a.x,z:a.z}; cells[cells.length-1]={x:b.x,z:b.z};
    const pts=[cells[0]]; let i=0; while(i<cells.length-1){ let j=cells.length-1; while(j>i+1&&!clear(lv,cells[i],cells[j],free))j--; pts.push(cells[j]); i=j; }
    let len=0; for(let k=1;k<pts.length;k++)len+=Math.hypot(pts[k].x-pts[k-1].x,pts[k].z-pts[k-1].z); CITY.ms=performance.now()-t0; return {lv,pts,len,cells:cells.length}; };
  CITY.bounds=bounds; CITY.clear=clear; CITY.R0=R0;
  const SENT=[];
  CITY.send=(N,to,o={})=>{ CITY.stop(N); const r=CITY.route(N.lv||'up',{x:N.st.x,z:N.st.z},to,N.free); if(!r){ o.then&&o.then(false); return null; }
    N.errand={r,i:1,to,v:(o.v||0)*T,v0:N.st.v,then:o.then,stuck:0,re:0}; SENT.push(N); if(o.v)N.st.v=N.errand.v; N.st.hold=false; return r; };
  CITY.stop=N=>{ const i=SENT.indexOf(N); if(i>=0)SENT.splice(i,1); if(N.errand){ N.st.to=null; if(N.errand.v)N.st.v=N.errand.v0; N.errand=null; } };
  CITY.tick=(dt,you)=>{ for(const N of SENT.slice()){ const E=N.errand, st=N.st; if(!E){ CITY.stop(N); continue; } const p=E.r.pts[E.i];
      if(!p){ CITY.stop(N); st.wait=1; E.then&&E.then(true); continue; }
      if(N.far||(N.free&&!N.free(st.x,st.z,st.R))){ const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz), s=Math.min(d,st.v*dt); if(d>1e-6){ st.x+=dx/d*s; st.z+=dz/d*s; st.h=Math.atan2(dx,dz); } N.g.position.x=st.x; N.g.position.z=st.z; st.to={x:p.x,z:p.z}; st.wait=0; if(d<=s+1e-6)E.i++; continue; }
      if(Math.hypot(p.x-st.x,p.z-st.z)<.12*T){ E.i++; const q=E.r.pts[E.i]; if(q){ st.to={x:q.x,z:q.z}; st.wait=0; } else st.to=null; continue; }
      if(st.to&&st.held>.6&&(E.side=(E.side||0))<6){ const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz)||1, px=-dz/d, pz=dx/d; for(const k of [1,-1,1.8,-1.8]){ const q={x:st.x+px*k*T+dx/d*.4*T,z:st.z+pz*k*T+dz/d*.4*T}; if(N.free(q.x,q.z,st.R)&&!NPCS.some(o=>o!==N&&o.lv===N.lv&&o.mode!=='hidden'&&o.blocks(q.x,q.z,st.R*1.5))){ E.r.pts.splice(E.i,0,q); E.side++; st.to={x:q.x,z:q.z}; st.held=0; break; } } }
      if(!st.to){ if(++E.stuck>8){ E.stuck=0; if(++E.re>5){ CITY.stop(N); E.then&&E.then(false); continue; } const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz)||1; grid(N.lv||'up',N.free).mark(st.x+dx/d*.5*T,st.z+dz/d*.5*T); const r=CITY.route(N.lv||'up',{x:st.x,z:st.z},E.to,N.free,true); if(!r){ CITY.stop(N); E.then&&E.then(false); continue; } E.r=r; E.i=1; }
        st.to={x:p.x,z:p.z}; st.wait=0; st.hold=false; if(E.v)st.v=E.v; } }
    const h=CLOCK.h, l=CITY.lastH??h; if(DN.day)CITY.day=DN.day(); else if(h<l-12)CITY.day++;
    for(const e of CITY.sched){ const hit=h>=l?(e.h>l&&e.h<=h):(e.h>l||e.h<=h); if(hit&&e.fired!==CITY.day+':'+e.h){ e.fired=CITY.day+':'+e.h; try{ e.fn(e); }catch(err){ console.warn('CITY.at',e.name,err); } } }
    CITY.lastH=h; };
  CITY.setHour=h=>CLOCK.set(h); CITY.hour=()=>CLOCK.h;
  CITY.at=(h,fn,name='')=>{ const e={h:((h%24)+24)%24,fn,name}; CITY.sched.push(e); return e; };
  CITY.off=e=>{ const i=CITY.sched.indexOf(e); if(i>=0)CITY.sched.splice(i,1); };
  CITY.post=(kind,at,data)=>{ const p=typeof at==='string'?CITY.place(at):null, j={id:++CITY.nj,kind,at:p?p.door:at,place:p?p.id:(at&&at.place)||null,data:data||{},state:'open',posted:CLOCK.h,day:CITY.day}; CITY.jobs.push(j); return j; };
  CITY.open=kind=>CITY.jobs.filter(j=>j.state==='open'&&(!kind||j.kind===kind));
  CITY.take=(kind,by,from)=>{ let best=null, bd=1e18; for(const j of CITY.open(kind)){ const d=from&&j.at?Math.hypot(j.at.x-from.x,j.at.z-from.z):0; if(d<bd){ bd=d; best=j; } } if(best){ best.state='taken'; best.by=by||null; best.taken=CLOCK.h; } return best; };
  CITY.done=j=>{ if(typeof j==='number')j=CITY.jobs.find(q=>q.id===j); if(j){ j.state='done'; j.finished=CLOCK.h; } if(CITY.jobs.length>300)CITY.jobs=CITY.jobs.filter(q=>q.state!=='done').concat(CITY.jobs.filter(q=>q.state==='done').slice(-100)); return j; };
  CITY.errand=(key,place,v)=>{ const N=NPCS.find(n=>n.key===key), P=CITY.place(place); if(!N||!P)return null; const j=CITY.post('errand',P.id,{who:key}); j.state='taken'; j.by=key;
    return CITY.send(N,P.door,{v,then:ok=>{ if(ok)CITY.done(j); else j.state='failed'; }}); };
  { const q=QS.get('errand'); if(q){ const [k,p,v]=q.split(','); setTimeout(()=>CITY.errand(k,p||'bodega',v?+v:0),400); } }
}
