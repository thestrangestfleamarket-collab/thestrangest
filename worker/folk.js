// THE FOLK'S WALKS: where every walker on the street is and where it is going, one path for the page (run there off the website) and the section's server (worker/door.js Block, stepped whoever is logged in): wandering a home range or an area, out through the park gate, in and out of a shop door, errands to a door or a spot along the walk grid.
const FOLKSIM={};
{ const F=FOLKSIM, fin=v=>typeof v==='number'&&isFinite(v), N=(v,d=0)=>fin(v)?v:fin(+v)?+v:d, R2=v=>Math.round(v*100)/100;
  F.make=()=>({t:0,at:0,H:null,T:1,gate:null,g:null,by:{}});
  F.load=r=>{ const S=F.make(); if(!r||typeof r!=='object')return S; S.t=N(r.t); S.H=fin(r.H)?r.H:null; S.T=N(r.T,1)||1; S.gate=r.gate||null; if(r.g)F.grid(S,r.g);
    if(r.by&&typeof r.by==='object')for(const k in r.by){ const e=r.by[k]; if(!e||!fin(e.x)||!fin(e.z))continue; const E=S.by[k]={k,x:e.x,z:e.z,hd:N(e.hd),v:N(e.v,1)||1,v0:N(e.v0,0)||N(e.v,1)||1,R:N(e.R,.3)||.3,to:e.to&&fin(e.to.x)?{x:e.to.x,z:e.to.z}:null,next:e.next&&fin(e.next.x)?{x:e.next.x,z:e.next.z}:null,path:null,i:0,wait:N(e.wait),in:N(e.in),goal:e.goal&&e.goal.at?{gid:String(e.goal.gid||''),at:{x:N(e.goal.at.x),z:N(e.goal.at.z)},in:N(e.goal.in),b:e.goal.b,hold:e.goal.hold}:null,done:String(e.done||''),stuck:0,auto:e.auto?1:0,mode:mode(e.mode)};
      if(Array.isArray(e.p)&&e.p.length){ E.path=[{x:E.x,z:E.z}].concat(e.p.map(q=>({x:N(q[0]),z:N(q[1])}))); E.i=1; E.to={x:E.path[1].x,z:E.path[1].z}; } } return S; };
  // kept small: the rest of an errand's way as pairs, a decimal each
  F.save=S=>{ const by={}; for(const k in S.by){ const E=S.by[k], o={x:E.x,z:E.z,hd:E.hd,v:E.v,v0:E.v0,R:E.R,to:E.to,next:E.next,wait:E.wait,in:E.in,goal:E.goal,done:E.done,auto:E.auto,mode:E.mode}; if(E.path&&E.i<E.path.length)o.p=E.path.slice(E.i).map(q=>[Math.round(q.x*10)/10,Math.round(q.z*10)/10]); by[k]=o; }
    return {t:S.t,H:S.H,T:S.T,gate:S.gate,g:S.g&&{v:S.g.v,x0:S.g.x0,z0:S.g.z0,c:S.g.c,w:S.g.w,h:S.g.h,rle:S.g.rle,xl:S.xl},by}; };
  // the park gate's crossing light (owner, 9 Nov 2026), one clock for the page's light (150pb) and the walkers here: green, then on a 90 s timer (or 23 s after its button, p0) amber and red, WALK, then flashing
  F.light=(t,p0)=>{ const d=t-(+p0||0); if(d>=0&&d<23)return d<1?{m:'g',x:'h'}:d<4?{m:'y',x:'h'}:{m:'r',x:d<5?'h':d<15?'w':d<19?(Math.floor(d*2)&1?'h':'-'):'h'};
    const r=((t%90)+90)%90; return r<70?{m:'g',x:'h'}:r<73?{m:'y',x:'h'}:{m:'r',x:r<74?'h':r<84?'w':r<88?(Math.floor(r*2)&1?'h':'-'):'h'}; };
  // a walker steps onto the lit crossing (S.xl) only on WALK (S.walk on the page; the server's clock and button, S.now and S.p0)
  const inXL=(S,x,z)=>{ const b=S.xl; return !!b&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1; }, kerb=(S,E,x,z)=>!inXL(S,E.x,E.z)&&inXL(S,x,z)&&!(S.walk?S.walk():S.now==null||F.light(S.now,S.p0).x==='w');
  // the walk grid: the page's free ground in half-tile cells (rle: runs of blocked, free, blocked... in base 36), decoded when first read
  F.grid=(S,G)=>{ if(!G||!(G.w>0)||!(G.h>0)||typeof G.rle!=='string'){ S.g=null; return false; } if(G.w*G.h>4e6||G.rle.length>4e5)return false;
    S.g={v:String(G.v||''),x0:N(G.x0),z0:N(G.z0),c:N(G.c,1)||1,w:G.w|0,h:G.h|0,rle:G.rle,m:null}; if(G.T>0)S.T=+G.T; if(G.gate)S.gate={z:N(G.gate.z),x0:N(G.gate.x0),x1:N(G.gate.x1)}; if(G.xl)S.xl={x0:N(G.xl.x0),z0:N(G.xl.z0),x1:N(G.xl.x1),z1:N(G.xl.z1)}; return true; };
  F.pack=(m,n)=>{ const r=[]; let v=0, run=0; for(let k=0;k<n;k++){ const b=m[k]?1:0; if(b===v)run++; else { r.push(run.toString(36)); v=b; run=1; } } r.push(run.toString(36)); return r.join(','); };
  const cells=g=>{ if(g.m)return g.m; const m=new Uint8Array(g.w*g.h); let k=0, v=0; for(const r of g.rle.split(',')){ const n=parseInt(r,36)||0; if(v)m.fill(1,k,Math.min(m.length,k+n)); k+=n; v^=1; } g.m=m; return m; };
  F.free=(S,x,z)=>{ if(S.freeFn)return !!S.freeFn(x,z); const g=S.g; if(!g)return false; const i=Math.floor((x-g.x0)/g.c), j=Math.floor((z-g.z0)/g.c); if(i<0||j<0||i>=g.w||j>=g.h)return false; return cells(g)[j*g.w+i]===1; };
  // a way from a to b over the grid (the city's own pathfinder on the page, S.routeFn): A* over the cells, then the corners only
  const gridOf=g=>({w:g.w,h:g.h,cell:(x,z)=>[Math.floor((x-g.x0)/g.c),Math.floor((z-g.z0)/g.c)],at:(i,j)=>({x:g.x0+(i+.5)*g.c,z:g.z0+(j+.5)*g.c}),free:(i,j)=>i>=0&&j>=0&&i<g.w&&j<g.h&&cells(g)[j*g.w+i]===1});
  F.route=(S,a,b)=>{ if(S.routeFn)return S.routeFn(a,b); if(!S.g)return null; const g=gridOf(S.g), W=g.w;
    const nearFree=(x,z)=>{ const [i0,j0]=g.cell(x,z); for(let r=0;r<=4;r++)for(let i=i0-r;i<=i0+r;i++)for(let j=j0-r;j<=j0+r;j++)if((Math.abs(i-i0)===r||Math.abs(j-j0)===r)&&g.free(i,j))return [i,j]; return null; };
    const s=nearFree(a.x,a.z), e=nearFree(b.x,b.z); if(!s||!e)return null;
    const key=(i,j)=>j*W+i, ks=key(s[0],s[1]), ke=key(e[0],e[1]), G=new Map([[ks,0]]), Fs=new Map(), from=new Map(), open=[ks], inO=new Set([ks]), closed=new Set();
    const h=k=>{ const di=Math.abs(k%W-e[0]), dj=Math.abs(Math.floor(k/W)-e[1]); return Math.max(di,dj)+.4142*Math.min(di,dj); }; Fs.set(ks,h(ks));
    const up=()=>{ let i=open.length-1; while(i>0){ const p=(i-1)>>1; if(Fs.get(open[p])<=Fs.get(open[i]))break; [open[p],open[i]]=[open[i],open[p]]; i=p; } };
    const pop=()=>{ const r=open[0], l=open.pop(); if(open.length){ open[0]=l; let i=0; for(;;){ const a=2*i+1, b=a+1; let m=i; if(a<open.length&&Fs.get(open[a])<Fs.get(open[m]))m=a; if(b<open.length&&Fs.get(open[b])<Fs.get(open[m]))m=b; if(m===i)break; [open[m],open[i]]=[open[i],open[m]]; i=m; } } return r; };
    let found=false, steps=0; while(open.length&&steps++<300000){ const k=pop(); inO.delete(k); if(k===ke){ found=true; break; } closed.add(k); const i=k%W, j=Math.floor(k/W), gk=G.get(k);
      for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){ if(!di&&!dj)continue; const ni=i+di, nj=j+dj; if(!g.free(ni,nj))continue; if(di&&dj&&!(g.free(i+di,j)&&g.free(i,j+dj)))continue;
        const nk=key(ni,nj); if(closed.has(nk))continue; const ng=gk+(di&&dj?1.4142:1); if(ng<(G.get(nk)??1e18)){ G.set(nk,ng); Fs.set(nk,ng+h(nk)); from.set(nk,k); if(!inO.has(nk)){ open.push(nk); inO.add(nk); up(); } } } }
    if(!found)return null; const pts=[]; for(let k=ke;k!==undefined;k=from.get(k))pts.push(g.at(k%W,Math.floor(k/W))); pts.reverse(); pts[0]={x:a.x,z:a.z}; pts[pts.length-1]={x:b.x,z:b.z};
    const clear=(p,q)=>{ const d=Math.hypot(q.x-p.x,q.z-p.z), n=Math.max(1,Math.ceil(d/(S.g.c/2))); for(let k=1;k<n;k++){ const t=k/n; if(!F.free(S,p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t))return false; } return true; };
    const out=[pts[0]]; let i=0; while(i<pts.length-1){ let j=pts.length-1; while(j>i+1&&!clear(pts[i],pts[j]))j--; out.push(pts[j]); i=j; } return out; };
  // a walker's mode: b a home range {x,z,r} or an area {band:[x0,z0,x1,z1]} (or null: nowhere to go), lane a box to keep to, shop a door it goes into now and then, roam free over the street, hold stand still
  const mode=m=>{ const o={b:null,lane:null,shop:null,roam:0,hold:0}; if(!m||typeof m!=='object')return o;
    if(m.b&&typeof m.b==='object'){ const B=m.b.band; if(Array.isArray(B)){ const L=(B.length===4&&!Array.isArray(B[0])?[B]:B).filter(r=>Array.isArray(r)&&r.length===4).map(r=>r.map(v=>N(v))); if(L.length)o.b={band:L}; } else if(fin(m.b.x)&&fin(m.b.z))o.b={x:m.b.x,z:m.b.z,r:Math.max(0,N(m.b.r))}; }
    if(Array.isArray(m.lane)&&m.lane.length===4)o.lane=m.lane.map(v=>N(v)); if(m.shop&&fin(m.shop.x)&&fin(m.shop.z))o.shop={x:m.shop.x,z:m.shop.z}; o.roam=m.roam?1:0; o.hold=m.hold?1:0; return o; };
  const arrive=(S,E,rnd)=>{ const G=E.goal; E.path=null; E.to=null; E.next=null; if(G){ E.done=G.gid; E.goal=null; if(G.b!==undefined||G.hold!=null){ E.mode.b=G.b||null; E.mode.hold=G.hold?1:0; } if(G.in){ E.in=G.in>0?G.in:-1; E.wait=1; return; } } E.wait=1.5+rnd()*4; };
  const errand=(S,E,at,rnd)=>{ const p=F.route(S,{x:E.x,z:E.z},at); if(!p||p.length<2){ E.x=at.x; E.z=at.z; arrive(S,E,rnd); return; } E.path=p; E.i=1; E.to={x:p[1].x,z:p[1].z}; E.next=null; E.stuck=0; };
  // what the page tells of a walker: where it starts (x, z, only when new), its pace v, radius R, its mode, a goal {gid, at:{x,z} (none: stay), in (hidden on arriving: seconds, or 1 until told out), now (be there), b and hold (its mode on arriving), fast (a jog)}, out (come out of where it is)
  F.set=(S,k,m,rnd=Math.random)=>{ if(typeof k!=='string'||!k||k.length>48||!m||typeof m!=='object')return null; let E=S.by[k];
    if(!E){ if(!fin(m.x)||!fin(m.z)||Object.keys(S.by).length>=600)return null; E=S.by[k]={k,x:m.x,z:m.z,hd:N(m.hd),v:1,v0:1,R:.3,to:null,next:null,path:null,i:0,wait:rnd()*3,in:0,goal:null,done:'',stuck:0,auto:0,mode:mode(null)}; }
    if(m.v>0)E.v0=E.v=Math.min(m.v,20); if(m.R>0)E.R=Math.min(m.R,5); if(m.auto!=null)E.auto=m.auto?1:0; if(m.mode)E.mode=mode(m.mode); if(m.out&&E.in)E.in=0;
    const G=m.goal; if(G&&typeof G==='object'&&typeof G.gid==='string'&&G.gid.length<=64&&(G.at==null||fin(G.at.x)&&fin(G.at.z))&&G.gid!==E.done&&!(E.goal&&E.goal.gid===G.gid)){
      const M=G.b!==undefined||G.hold!=null?mode({b:G.b}):null; E.goal={gid:G.gid,at:G.at?{x:G.at.x,z:G.at.z}:null,in:G.in===1||G.in<0?-1:G.in>0?Math.min(N(G.in),3600):0,b:M?M.b:undefined,hold:G.hold!=null?(G.hold?1:0):null}; E.in=0; E.v=G.fast?(E.v0||E.v)*2.2:E.v0||E.v;
      if(!G.at)arrive(S,E,rnd); else if(G.now){ E.x=G.at.x; E.z=G.at.z; arrive(S,E,rnd); } else errand(S,E,E.goal.at,rnd); }
    return E; };
  F.drop=(S,k)=>{ delete S.by[k]; };
  const inBand=(b,x,z)=>x>=b[0]&&x<=b[2]&&z>=b[1]&&z<=b[3];
  // the next place to wander to: in a home range (clamped to the lane), over an area, or anywhere free a few tiles off (over the park wall only through its gate); now and then a shop door, in for a while
  const pick=(S,E,rnd)=>{ const M=E.mode, T=S.T, R=E.R; if(M.hold)return false;
    if(M.shop&&E.auto&&rnd()<.3){ E.goal={gid:'shop',at:M.shop,in:20+rnd()*40}; E.done=''; errand(S,E,M.shop,rnd); return true; }
    const b=M.b; if(b&&b.band){ for(let k=0;k<10;k++){ const r=b.band[Math.floor(rnd()*b.band.length)], to={x:r[0]+rnd()*(r[2]-r[0]),z:r[1]+rnd()*(r[3]-r[1])}; if(Math.hypot(to.x-E.x,to.z-E.z)<30*T&&F.free(S,to.x,to.z)){ E.to=to; E.next=null; return true; } }
      for(let k=0;k<10;k++){ const r=b.band.find(q=>E.x>=q[0]&&E.x<=q[2]&&E.z>=q[1]&&E.z<=q[3])||b.band[0], a=rnd()*Math.PI*2, d=(1.5+rnd()*8)*T, to={x:Math.max(r[0],Math.min(r[2],E.x+Math.sin(a)*d)),z:Math.max(r[1],Math.min(r[3],E.z+Math.cos(a)*d))};   // a wide area: a short walk from where it stands
        if(F.free(S,to.x,to.z)){ E.to=to; E.next=null; return true; } } return false; }
    if(b&&!(b.r>0)&&!M.roam)return false;
    if(M.roam){ for(let k=0;k<12;k++){ const a=rnd()*Math.PI*2, r=(2+rnd()*7)*T, to={x:E.x+Math.sin(a)*r,z:E.z+Math.cos(a)*r}; if(!F.free(S,to.x,to.z))continue;
      const g=S.gate; if(g&&(E.z<g.z)!==(to.z<g.z)){ E.next=to; E.to={x:g.x0+rnd()*(g.x1-g.x0),z:g.z}; } else { E.to=to; E.next=null; } return true; } return false; }
    if(b){ for(let k=0;k<12;k++){ const a=rnd()*Math.PI*2, r=Math.sqrt(rnd())*b.r; let to={x:b.x+Math.sin(a)*r,z:b.z+Math.cos(a)*r}; const L=M.lane; if(L)to={x:Math.max(L[0],Math.min(L[2],to.x)),z:Math.max(L[1],Math.min(L[3],to.z))}; if(F.free(S,to.x,to.z)){ E.to=to; E.next=null; return true; } } }
    return false; };
  const sub=(S,E,dt,rnd)=>{
    if(E.in){ if(E.in<0)return; if((E.in-=dt)>0)return; E.in=0; E.wait=1+rnd()*3; return; }
    if(E.to){ const ex=E.to.x-E.x, ez=E.to.z-E.z, d=Math.hypot(ex,ez), step=E.v*dt;
      if(d<=Math.max(step,.05)){ E.x=E.to.x; E.z=E.to.z; if(E.path&&++E.i<E.path.length){ E.to={x:E.path[E.i].x,z:E.path[E.i].z}; return; } if(E.path||E.goal){ arrive(S,E,rnd); return; } E.to=E.next||null; E.next=null; if(!E.to)E.wait=1.5+rnd()*4; return; }
      const nx=E.x+ex/d*step, nz=E.z+ez/d*step; E.hd=Math.atan2(ex,ez);
      if(kerb(S,E,nx,nz))return;
      if(inway(S,E,nx,nz)&&(E.held=(E.held||0)+dt)<3)return; E.held=0;
      if(F.free(S,nx,nz)||!F.free(S,E.x,E.z)){ E.x=nx; E.z=nz; E.stuck=0; } else if(E.path){ if((E.stuck+=dt)>3){ E.x=E.to.x; E.z=E.to.z; E.stuck=0; } } else { E.to=null; E.next=null; E.wait=.5; } return; }
    if(E.mode.hold)return; if((E.wait-=dt)>0)return; if(!pick(S,E,rnd))E.wait=1; };
  // someone in the way (8 Nov 2026): another walker out on the street where this one would step, and closer than now; it waits for them (three seconds at most, so nobody is stuck for good)
  const CW=2, cellK=(S,x,z)=>Math.floor(x/(CW*S.T))+','+Math.floor(z/(CW*S.T));
  const inway=(S,E,x,z)=>{ const H=S.hash; if(!H)return false; const i=Math.floor(x/(CW*S.T)), j=Math.floor(z/(CW*S.T));
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ const L=H.get((i+a)+','+(j+b)); if(!L)continue; for(const Q of L){ if(Q===E||Q.in)continue; const r=E.R+Q.R, d=Math.hypot(Q.x-x,Q.z-z); if(d<r&&d<Math.hypot(Q.x-E.x,Q.z-E.z))return true; } } return false; };
  const hash=S=>{ const H=new Map(); for(const k in S.by){ const E=S.by[k]; if(E.in)continue; const c=cellK(S,E.x,E.z); let L=H.get(c); if(!L)H.set(c,L=[]); L.push(E); } return H; };
  // everyone one step on, a second at a time at most (a long gap since the last step is walked through, not jumped)
  F.step=(S,dt,rnd=Math.random)=>{ dt=Math.max(0,Math.min(600,N(dt))); while(dt>0){ const h=Math.min(1,dt); dt-=h; S.t+=h; S.hash=hash(S); for(const k in S.by){ const E=S.by[k]; try{ sub(S,E,h,rnd); }catch(e){ E.to=null; E.path=null; E.goal=null; E.wait=1; } } } S.hash=null; };
  // what the page is told, a second at a time: every walker's place, where it is walking to (or nothing), which way it faces, its state (0 waiting, 1 walking, 2 in, 3 held), the last errand it finished
  F.snap=S=>{ const n=[]; for(const k in S.by){ const E=S.by[k], st=E.in?2:E.to?1:E.mode.hold?3:0; n.push([k,R2(E.x),R2(E.z),E.to?R2(E.to.x):'',E.to?R2(E.to.z):'',R2(E.hd),st,E.done||'',E.in>0?Math.ceil(E.in):0]); } return {at:R2(S.t),n}; };
}
export {FOLKSIM};
