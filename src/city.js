// ---- THE CITY'S SPINE (owner, 17 Oct 2026: a gameplan "to get the world fully functional ... all police, fire, government, mail and delivery
// handled by bots"; then "1 - minimal on map only bare minimum required"): the four things every service will need, at their least, nothing
// drawn. ADDRESSES: each place of the map with the spot before its door (CITY.places). WAYS: a route over the level's ground from any spot
// to any other, round every solid (CITY.route: A* over half-tile cells, each cell tested with the hitboxes' own test as it's first looked
// at, the found path pulled straight where it can be). WALKING: any character without a mind of his own sent along a route (CITY.send:
// his steps are the rig's own; far from you, not drawn, he's moved along it all the same, so an errand across the map finishes). THE BOARD:
// jobs posted, taken and done (CITY.post, CITY.take, CITY.done). THE SCHEDULE: something at an hour of the clock, every day (CITY.at).
// Doors stay as they are (doorways, no leaves). ?errand=<key>,<place> sends one to a door as a look (?errand=villager_m,bodega); the
// console's CITY.errand the same. Checked by tests/worldcheck.cjs. Cost: nothing a frame while no one is sent; a route some milliseconds
// once ----
const CITY={jobs:[],sched:[],day:0,nj:0}; window.CITY=CITY;
{ const T=TILE, R0=.3*T, C=T/2;   // (R0: a walker's girth; C: a cell)
  // ---- ADDRESSES: id, name, the level, the spot a tile before the door (door), the door's own place (at)
  CITY.places=()=>{ const P=[], add=(id,name,x,z,dz,lv='up',o={})=>P.push(Object.assign({id,name,lv,at:{x,z},door:{x,z:z+dz}},o));
    { const B=BOD.B0; add('bodega','THE BODEGA',BOD.X((B.x0+B.x1)/2),BOD.Z(B.y1),T); }
    add('apartments','THE APARTMENTS',POOLR.X((21.97+23.53)/2),POOLR.Z(POOLR.y1),T);   // (the lobby's front door: pool.js's D_)
    if(MODS.apts&&MODS.apts.A){ const A=MODS.apts.A; add('house','APARTMENT HOUSE',BOD.X(A.x1-1.0),BOD.Z(A.y1),T); }
    if(BOD.GD)add('dojo','GHOST STREET',BOD.X(BOD.GD.door[0]),BOD.Z(BOD.GD.door[1]),T);
    add('park','CENTRAL PARK',BOD.XS((PARK.gate[0]+PARK.gate[1])/2+PARK.ox),BOD.ZS(PARK.y0+PARK.oy),-T);   // (the gate in the wall, the street before it)
    add('castle','THE CASTLE',BOD.XS(CASTLE.gate),BOD.ZS(CASTLE.b[2]),-1.5*T);   // (the gatehouse, facing the street)
    add('subway','THE SUBWAY',BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),BOD.ZS(MAPSTAIR.y1),.8*T);   // (the top of the stairs)
    add('platform','THE PLATFORM',-12.4+LAY.o('subway').x*T,-24.9+LAY.o('subway').y*T,0,'down');
    for(const [n,x,z,lv] of STORE.places)if(x||z)add('store:'+n.toLowerCase().replace(/^the /,'').replace(/\s+/g,'-'),n,x,z,0,lv,{inside:true,stacked:typeof lv==='number'});   // (a stored room's spot is just inside its door; one stacked on the apartments (lv its floor's height) has no way to it on foot)
    return P; };
  CITY.place=id=>CITY.places().find(p=>p.id===id||p.name===String(id).toUpperCase());
  // ---- WAYS: the level's ground in half-tile cells over the places' reach; a cell is free when no solid of the level holds a walker there
  // (the hitboxes' test; the subway's stair hole counted on the street). Looked at only as a route needs it; forgotten when the level's solids grow
  const GRID=new Map();   // (one grid a level and a test: the level's own, or a character's own say of where he may stand)
  const bounds=lv=>{ if(lv==='down'){ const L=SOL.down; let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const b of L){ x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); } return [x0-2*T,z0-2*T,x1+2*T,z1+2*T]; }
    let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const k of ['bodega','house','apartments','ghost','park','castle','subway']){ const b=typeof MAPED!=='undefined'&&MAPED.box&&MAPED.box(k); if(!b)continue; x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); }
    return [x0-4*T,z0-4*T,x1+4*T,z1+4*T]; };
  const grid=(lv,free)=>{ const L=SOL[lv], gk=lv+':'+(free?free.name||'f':''); let g=GRID.get(free||lv); if(g&&g.n===L.length)return g; const b=bounds(lv), w=Math.ceil((b[2]-b[0])/C), h=Math.ceil((b[3]-b[1])/C);
    g={n:L.length,lv,free,x0:b[0],z0:b[1],w,h,m:new Uint8Array(w*h),cell:(x,z)=>[Math.floor((x-b[0])/C),Math.floor((z-b[1])/C)],at:(i,j)=>({x:b[0]+(i+.5)*C,z:b[1]+(j+.5)*C})};
    g.free=(i,j)=>{ if(i<0||j<0||i>=w||j>=h)return false; const k=j*w+i; let v=g.m[k]; if(!v){ const p=g.at(i,j); v=g.m[k]=CITY.blocked(lv,p.x,p.z,free)?2:1; } return v===1; }; g.mark=(x,z)=>{ const [i,j]=g.cell(x,z); if(i>=0&&j>=0&&i<w&&j<h)g.m[j*w+i]=2; }; GRID.set(free||lv,g); return g; };
  CITY.blocked=(lv,x,z,free)=>{ if(free)return !free(x,z,R0); if(lv==='up'&&typeof STHOLE!=='undefined'){ const H=STHOLE, R=R0; if(x>H[0]-R&&x<H[2]+R&&z>H[1]-R&&z<H[3]+R)return true; } return !!CLIP.hit(SOL[lv],x,z,R0); };
  // a straight way between two spots, clear of every solid (a sample each quarter tile)
  const clear=(lv,a,b,free)=>{ const d=Math.hypot(b.x-a.x,b.z-a.z), n=Math.max(1,Math.ceil(d/(T/8))); for(let k=1;k<n;k++){ const t=k/n; if(CITY.blocked(lv,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,free))return false; } return true; };
  // the nearest free cell to a spot (the spot's own, or a ring round it up to two tiles out: a door's spot a little into a mat or a step)
  const nearFree=(g,x,z)=>{ const [i0,j0]=g.cell(x,z); for(let r=0;r<=4;r++)for(let i=i0-r;i<=i0+r;i++)for(let j=j0-r;j<=j0+r;j++)if((Math.abs(i-i0)===r||Math.abs(j-j0)===r)&&g.free(i,j))return [i,j]; return null; };
  // A*: eight ways a cell, a corner never cut; the way back pulled straight
  CITY.route=(lv,a,b,free)=>{ const t0=performance.now(), g=grid(lv,free), s=nearFree(g,a.x,a.z), e=nearFree(g,b.x,b.z); if(!s||!e)return null;   // (free: the walker's own test of a spot, so his way is judged as his steps will be)
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
  // ---- WALKING: a character sent to a spot (one whose mind is the rig's own: not a guard, a droid, the dragons or the Fox); o.v his pace in tiles a second; o.then when he's there (or false, no way)
  const SENT=[];
  CITY.send=(N,to,o={})=>{ CITY.stop(N); const r=CITY.route(N.lv||'up',{x:N.st.x,z:N.st.z},to,N.free); if(!r){ o.then&&o.then(false); return null; }
    N.errand={r,i:1,to,v:(o.v||0)*T,v0:N.st.v,then:o.then,stuck:0,re:0}; SENT.push(N); if(o.v)N.st.v=N.errand.v; N.st.hold=false; return r; };
  CITY.stop=N=>{ const i=SENT.indexOf(N); if(i>=0)SENT.splice(i,1); if(N.errand){ N.st.to=null; if(N.errand.v)N.st.v=N.errand.v0; N.errand=null; } };   // (his own pace back)
  CITY.tick=(dt,you)=>{ for(const N of SENT.slice()){ const E=N.errand, st=N.st; if(!E){ CITY.stop(N); continue; } const p=E.r.pts[E.i];
      if(!p){ CITY.stop(N); st.wait=1; E.then&&E.then(true); continue; }
      if(N.far||(N.free&&!N.free(st.x,st.z,st.R))){ const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz), s=Math.min(d,st.v*dt); if(d>1e-6){ st.x+=dx/d*s; st.z+=dz/d*s; st.h=Math.atan2(dx,dz); } N.g.position.x=st.x; N.g.position.z=st.z; if(d<=s+1e-6)E.i++; continue; }   // (out of sight: along the way without a step drawn; standing where his own rule lets him take no step (the stair hole's margin, where a pawn is set down), eased along it till he's clear)
      if(Math.hypot(p.x-st.x,p.z-st.z)<.12*T){ E.i++; const q=E.r.pts[E.i]; if(q){ st.to={x:q.x,z:q.z}; st.wait=0; } else st.to=null; continue; }   // (the next turn at once: never a moment with nowhere to go, which his own wandering would fill)
      if(!st.to){ if(++E.stuck>8){ E.stuck=0; if(++E.re>5){ CITY.stop(N); E.then&&E.then(false); continue; } const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz)||1; grid(N.lv||'up',N.free).mark(st.x+dx/d*.5*T,st.z+dz/d*.5*T); const r=CITY.route(N.lv||'up',{x:st.x,z:st.z},E.to,N.free); if(!r){ CITY.stop(N); E.then&&E.then(false); continue; } E.r=r; E.i=1; }   // (held up again and again: the spot ahead counted blocked, the way found afresh)
        st.to={x:p.x,z:p.z}; st.wait=0; st.hold=false; if(E.v)st.v=E.v; } }
    // ---- THE SCHEDULE: each entry once as the clock passes its hour (the day's turn counted)
    const h=CLOCK.h, l=CITY.lastH??h; if(h<l-12)CITY.day++;
    for(const e of CITY.sched){ const hit=h>=l?(e.h>l&&e.h<=h):(e.h>l||e.h<=h); if(hit&&e.fired!==CITY.day+':'+e.h){ e.fired=CITY.day+':'+e.h; try{ e.fn(e); }catch(err){ console.warn('CITY.at',e.name,err); } } }
    CITY.lastH=h; };
  CITY.setHour=h=>CLOCK.set(h); CITY.hour=()=>CLOCK.h;   // (a test's reach)
  CITY.at=(h,fn,name='')=>{ const e={h:((h%24)+24)%24,fn,name}; CITY.sched.push(e); return e; };
  CITY.off=e=>{ const i=CITY.sched.indexOf(e); if(i>=0)CITY.sched.splice(i,1); };
  // ---- THE BOARD: a job is a kind, a spot (or a place's id) and what it's about; posted open, taken by someone, done
  CITY.post=(kind,at,data)=>{ const p=typeof at==='string'?CITY.place(at):null, j={id:++CITY.nj,kind,at:p?p.door:at,place:p?p.id:(at&&at.place)||null,data:data||{},state:'open',posted:CLOCK.h,day:CITY.day}; CITY.jobs.push(j); return j; };
  CITY.open=kind=>CITY.jobs.filter(j=>j.state==='open'&&(!kind||j.kind===kind));
  CITY.take=(kind,by,from)=>{ let best=null, bd=1e18; for(const j of CITY.open(kind)){ const d=from&&j.at?Math.hypot(j.at.x-from.x,j.at.z-from.z):0; if(d<bd){ bd=d; best=j; } } if(best){ best.state='taken'; best.by=by||null; best.taken=CLOCK.h; } return best; };
  CITY.done=j=>{ if(typeof j==='number')j=CITY.jobs.find(q=>q.id===j); if(j){ j.state='done'; j.finished=CLOCK.h; } if(CITY.jobs.length>300)CITY.jobs=CITY.jobs.filter(q=>q.state!=='done').concat(CITY.jobs.filter(q=>q.state==='done').slice(-100)); return j; };
  // ---- a look: one of the street's walkers sent to a door (?errand=villager_m,bodega; CITY.errand('villager_m','park',3))
  CITY.errand=(key,place,v)=>{ const N=NPCS.find(n=>n.key===key), P=CITY.place(place); if(!N||!P)return null; const j=CITY.post('errand',P.id,{who:key}); j.state='taken'; j.by=key;
    return CITY.send(N,P.door,{v,then:ok=>{ if(ok)CITY.done(j); else j.state='failed'; }}); };
  { const q=QS.get('errand'); if(q){ const [k,p,v]=q.split(','); setTimeout(()=>CITY.errand(k,p||'bodega',v?+v:0),400); } }
}
