// THE DUNGEON'S GROUND: each room's uneven floor (slopes, ledges with a ramp up, pits with a rubble slope out), its rock walls and vaulted ceiling, and Polyfork's cave pieces where a cave would put them: drips, rockfalls, moss, the old sewer's pipes, a subway's track, a cistern's columns (owner, 8 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {pos, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MODS, STN, SYS, TILE} from './006-map-pre.js';
{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, dy=STN.DY, RS=.5, STEP=14, DROP=30;
  const rng=s=>()=>{ s=s*16807%2147483647; return (s-1)/2147483646; }, sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  const hs=(a,b,c)=>{ const q=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return q-Math.floor(q); };
  const vn=(x,y,s)=>{ const i=Math.floor(x), j=Math.floor(y), u=sm(x-i), v=sm(y-j), a=hs(i,j,s), b=hs(i+1,j,s), c=hs(i,j+1,s), d=hs(i+1,j+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const THEMES=['cave','sewer','subway','cistern'], theme=L=>L.k===1?'cave':THEMES[(L.k*7+3)%4];
  const dSeg=(x,y,ax,ay,bx,by)=>{ const vx=bx-ax, vy=by-ay, t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy||1))); return Math.hypot(x-ax-vx*t,y-ay-vy*t); };
  // how free a spot is to rise or sink: walls, doorways, the stair, traps and props stay on the flat
  const maskOf=(L,avoid)=>{ const {R,B,ds,up}=L, op=[]; for(const [a,b] of ds.b)op.push([a,B.y0,b,B.y0]); for(const [a,b] of ds.f)op.push([a,B.y1,b,B.y1]); for(const [a,b] of ds.w)op.push([B.x0,a,B.x0,b]); for(const [a,b] of ds.e)op.push([B.x1,a,B.x1,b]);
    return (x,y)=>{ let m=sm((Math.min(x-R.x0,R.x1-x,y-R.y0,R.y1-y)-.9)/1.4); if(m<=0)return 0;
      for(const s of op){ m*=sm((dSeg(x,y,...s)-1.8)/2.2); if(m<=0)return 0; }
      if(up)m*=sm((Math.max(up.x0-1.2-x,x-up.x1-1.2,y-up.y1-1.2,0)-.2)/2);
      for(const a of avoid){ const d=a.r!=null?Math.hypot(x-a.x,y-a.y)-a.r:Math.max(a.x0-x,x-a.x1,a.y0-y,y-a.y1,0); m*=sm((d-.4)/1.2); if(m<=0)return 0; } return m; }; };
  const avoidOf=L=>{ const A=[]; for(const h of L.hz)A.push(h.t==='web'?{x:h.cx,y:h.cy,r:h.r}:{x0:h.x0,y0:h.y0,x1:h.x1,y1:h.y1}); for(const t of L.took||[])A.push({x:t[0],y:t[1],r:t[2]+.4});
    if(theme(L)==='subway'){ const {R}=L, w=R.x1-R.x0>R.y1-R.y0; L.track=w?{x0:R.x0+1.5,x1:R.x1-1.5,y0:L.R.cy-.9,y1:L.R.cy+.9,w}:{x0:R.cx-.9,x1:R.cx+.9,y0:R.y0+1.5,y1:R.y1-1.5,w}; A.push(L.track); } return A; };
  const corridorMask=L=>{ const {B,ds}=L, op=[]; for(const [a,b] of ds.b)op.push([a,B.y0,b,B.y0]); for(const [a,b] of ds.f)op.push([a,B.y1,b,B.y1]); for(const [a,b] of ds.w)op.push([B.x0,a,B.x0,b]); for(const [a,b] of ds.e)op.push([B.x1,a,B.x1,b]);
    return (x,y)=>{ let m=1; for(const q of op){ m*=sm((dSeg(x,y,...q)-1.2)/1.6); if(m<=0)return 0; } return m; }; };   // a corridor's floor rolls too, flat only where it meets a room
  const make=L=>{ const {R,n}=L, r=rng(L.seed*613+11), A=L.c?[]:avoidOf(L), M=L.c?corridorMask(L):maskOf(L,A), W=R.x1-R.x0, H=R.y1-R.y0, area=W*H, F=[];
    const fits=(cx,cy,rx,ry)=>{ if(M(cx,cy)<.8)return false; let lo=0; for(let k=0;k<12;k++){ const a=k/12*6.283; if(M(cx+Math.cos(a)*rx*.8,cy+Math.sin(a)*ry*.8)<.5)lo++; } if(lo>3)return false; return !F.some(f=>Math.hypot(cx-f.cx,cy-f.cy)<Math.max(rx,ry)+Math.max(f.rx,f.ry)+1.6); };
    const add=(h)=>{ for(let t=0;t<90;t++){ const rx=1.5+r()*(Math.min(W,H)>12?2.6:1.4), ry=Math.max(1.3,rx*(.6+r()*.6)), cx=R.x0+rx+2.4+r()*Math.max(0,W-2*rx-4.8), cy=R.y0+ry+2.4+r()*Math.max(0,H-2*ry-4.8);
      if(fits(cx,cy,rx,ry)){ F.push({cx,cy,rx,ry,h,ramp:Math.atan2(R.cy-cy,R.cx-cx)+(r()-.5)*1.2}); return; } } };   // the way up (or out) faces into the room, never into a wall
    const ledges=L.c?0:L.k===1?1:area>320?2:area>110?1:0, pits=L.c?0:L.k===1?0:area>260?2:area>120?1:(n>2&&area>80?1:0);
    for(let i=0;i<ledges;i++)add(30+r()*16); for(let i=0;i<pits;i++)add(-(38+r()*18));
    const x0=R.x0, y0=R.y0, nx=Math.ceil(W/RS)+1, ny=Math.ceil(H/RS)+1, g=new Float32Array(nx*ny), s=L.seed;
    const at=(x,y)=>{ const m=M(x,y); if(m<=0)return 0; let v=8*(vn(x*.33,y*.33,s)-.5)*2+3*(vn(x*1.1,y*1.1,s+9)-.5);
      for(const f of F){ const u=(x-f.cx)/f.rx, w=(y-f.cy)/f.ry, a=Math.atan2(w*f.ry,u*f.rx), d=Math.hypot(u,w)+.1*(vn(Math.cos(a)*3+f.cx,Math.sin(a)*3+f.cy,s+3)-.5), e=(d-1)*Math.min(f.rx,f.ry);
        const ramp=sm((Math.cos(a-f.ramp)-.45)/.3), wd=.35+ramp*3.4; v+=e<=0?f.h:f.h*(1-sm(e/wd)); } return v*m; };
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)g[j*nx+i]=at(x0+i*RS,y0+j*RS);
    L.T={x0,y0,nx,ny,g,F,M,theme:theme(L)}; return L.T; };
  const h=(L,gx,gy)=>{ const T=L&&L.T; if(!T)return 0; const fx=Math.max(0,Math.min(T.nx-1.001,(gx-T.x0)/RS)), fy=Math.max(0,Math.min(T.ny-1.001,(gy-T.y0)/RS)), i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j, G=T.g, N=T.nx;
    return G[j*N+i]*(1-u)*(1-v)+G[j*N+i+1]*u*(1-v)+G[(j+1)*N+i]*(1-u)*v+G[(j+1)*N+i+1]*u*v; };
  const TINT={cave:[1,1,1.02],sewer:[1.06,.96,.86],subway:[.94,.94,.96],cistern:[.9,1,.98]};
  // the floor's own colour: bedrock and grit, darker where it is wet, moss up against the damp walls, a few loose stones (no laid cobbles: it is a cave)
  const floorCol=(x,y,R,th)=>{ const s=(R.x0*7+R.y0*13)|0, n=vn(x*.7,y*.7,s), n2=vn(x*3.1,y*3.1,s+5), d=Math.min(x-R.x0,R.x1-x,y-R.y0,R.y1-y);
    let c=[58+30*n+10*n2,54+26*n+8*n2,50+20*n+6*n2]; if(hs(Math.round(x*10),Math.round(y*10),s)>.93)c=c.map(v=>v+26);
    if(vn(x*.35,y*.35,s+9)>.7)c=c.map((v,q)=>v*(q===2?.82:.72));
    const mo=(th==='cistern'||th==='sewer'?1:.6)*sm((1.6-d)/1.4)*sm((vn(x*.9,y*.9,s+13)-.35)/.3); if(mo>.25)c=[46+20*n2,66+30*n2,32+12*n2];
    if(th==='sewer'&&vn(x*.5,y*.5,s+17)>.62)c=[52,46,34]; return c; };
  // the floor: a sheet over the heights, its colour the room's stones, rock where it is steep, darker and wet down a pit
  const mesh=(L,quad,FC)=>{ const T=L.T, {x0,y0,nx,ny,g}=T, tn=TINT[T.theme], ROCK=[86,84,90];
    for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){ const a=g[(j+1)*nx+i], b=g[(j+1)*nx+i+1], c=g[j*nx+i+1], d=g[j*nx+i], xa=x0+i*RS, xb=Math.min(L.R.x1,xa+RS), ya=y0+j*RS, yb=Math.min(L.R.y1,ya+RS);
      if(xb<=xa||yb<=ya)continue; const lo=Math.min(a,b,c,d), sl=Math.max(a,b,c,d)-lo; let col=floorCol(xa+RS/2,ya+RS/2,L.R,T.theme);
      const k=hs(i,j,L.seed); if(sl>7){ const t=Math.min(1,(sl-7)/14); col=col.map((v,q)=>v*(1-t)+ROCK[q]*(.82+.3*k)*t); if(k>.93)col=[150,150,160]; }
      if(lo<-20)col=col.map(v=>v*Math.max(.5,1+lo/120)); col=col.map((v,q)=>Math.min(255,v*tn[q]*(.94+.12*k)));
      quad([X(xa),Y(a+.3)+dy,Z(yb)],[X(xb),Y(b+.3)+dy,Z(yb)],[X(xb),Y(c+.3)+dy,Z(ya)],[X(xa),Y(d+.3)+dy,Z(ya)],col); } };
  // rock bulging out of the walls and filling the corners, so a room reads as a cave and not a box
  const lump=(P,Cc,cx,cy,z0,rx,ry,hz,base,seed,bx)=>{ const g=new THREE.IcosahedronGeometry(1,1), p=g.attributes.position, c3=new THREE.Color();
    for(let i=0;i<p.count;i++){ const vx=p.getX(i), vy=p.getY(i), vz=p.getZ(i), k=.88+.22*hs(Math.round(vx*9),Math.round(vy*9),Math.round(vz*9)+seed); let gx=cx+vx*rx*k, gz=cy+vz*ry*k; if(bx){ gx=Math.max(bx.x0,Math.min(bx.x1,gx)); gz=Math.max(bx.y0,Math.min(bx.y1,gz)); } p.setXYZ(i,X(gx),Y(z0+Math.max(-.2,vy)*hz*k)+dy,Z(gz)); }
    const ng=g.index?g.toNonIndexed():g, q=ng.attributes.position; for(let i=0;i<q.count;i+=3){ const t=hs(i,seed,7), sh=t>.94?1.5:.82+.3*t; c3.setRGB(Math.min(1,base[0]*sh/255),Math.min(1,base[1]*sh/255),Math.min(1,base[2]*sh/255),THREE.SRGBColorSpace);
      for(let v=0;v<3;v++){ P.push(q.getX(i+v),q.getY(i+v),q.getZ(i+v)); Cc.push(c3.r,c3.g,c3.b); } } g.dispose(); if(ng!==g)ng.dispose(); };
  const box3=(P,Cc,x0,y0,z0,x1,y1,z1,col)=>{ const c3=new THREE.Color(), [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0)+dy,Y(z1)+dy];
    const q=(A,B,C,D,k)=>{ c3.setRGB(Math.min(1,col[0]*k/255),Math.min(1,col[1]*k/255),Math.min(1,col[2]*k/255),THREE.SRGBColorSpace); for(const v of [A,B,C,A,C,D]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
    q([a,f,d],[b,f,d],[b,f,c],[a,f,c],1.08); q([a,e,d],[b,e,d],[b,f,d],[a,f,d],1); q([b,e,c],[a,e,c],[a,f,c],[b,f,c],.9); q([a,e,c],[a,e,d],[a,f,d],[a,f,c],.8); q([b,e,d],[b,e,c],[b,f,c],[b,f,d],.85); };
  const SCHIST=[96,94,100];
  // the walls: Manhattan schist, banded and tilted, quartz veins and mica glints, cracks, damp streaks with rust under them, moss creeping up from the floor and down the wet runs, soot over the torches
  const wall=(nx,ny,Xp,Yp,z,R)=>{ const u=nx?Yp:Xp, sd=nx?(nx>0?1:2):(ny>0?3:4), H=R.H+4, w=nx>0?'l':nx<0?'r':ny>0?'b':'f', o=nx?R.y0:R.x0;
    const f=z*.04+vn(u*.5,z*.015,sd)*1.8, band=vn(u*.22,f*1.4,7+sd), warm=vn(u*.12,z*.008,11);
    let c=[70+44*band+18*warm,68+40*band+10*warm,74+30*band];
    if(Math.abs(vn(u*.8+z*.025,z*.01,13)-.5)<.014)c=[176,172,164];
    if(hs(Math.round(u*24),Math.round(z),sd)>.988)c=c.map(v=>v+55);
    if(Math.abs(vn(u*1.6,z*.05,17)-.5)<.011)c=c.map(v=>v*.42);
    const st=vn(u*1.3,0,19), wet=st>.66?Math.min(1,(st-.66)*4)*(1-.5*z/H):0; if(wet>0){ c=[c[0]*(1-.35*wet),c[1]*(1-.3*wet),c[2]*(1-.18*wet)]; if(st>.8&&vn(u*3,z*.07,23)>.62)c=[112,72,46]; }
    const moss=Math.max(sm((64-z)/52)*sm((vn(u*.45,z*.03,29)-.38)/.25),wet>.4&&z<H*.45?sm((vn(u*2.2,z*.09,31)-.45)/.2)*wet:0);
    if(moss>.35){ const g=vn(u*3,z*.2,37); c=[48+30*g,72+40*g,34+18*g].map((v,q)=>v*(.75+.5*moss)*(q===1?1:.95)); }
    for(const t of R.torches||[])if(t.w===w){ const du=Math.abs(u-o-t.u); if(du<.9&&z>88&&z<240)c=c.map(v=>v*(1-.6*sm((.9-du)/.9)*sm((240-z)/150))); }
    if(z<6)c=c.map(v=>v*.7); return c.map(v=>Math.max(0,Math.min(255,Math.round(v)))); };
  // the ceiling: rock vaulting up and hanging down, highest over the middle, its low points where the water drips
  const ceil=(L,P,Cc)=>{ const {R}=L, s=L.seed, top=R.H+4, x0=R.x0, y0=R.y0, nx=Math.max(2,Math.ceil(R.x1-x0)+1), ny=Math.max(2,Math.ceil(R.y1-y0)+1), g=new Float32Array(nx*ny), c3=new THREE.Color(), low=[];
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const x=Math.min(R.x1,x0+i), y=Math.min(R.y1,y0+j), e=sm((Math.min(x-R.x0,R.x1-x,y-R.y0,R.y1-y)-.2)/3), b=vn(x*.21,y*.21,s+41), d=vn(x*.7,y*.7,s+43);
      g[j*nx+i]=top-(L.c?40:150)*e*sm((b-.25)/.6)-14*d*e+(L.c?0:60*e*sm((.45-b)/.3)); }
    for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){ const xa=Math.min(R.x1,x0+i), xb=Math.min(R.x1,x0+i+1), ya=Math.min(R.y1,y0+j), yb=Math.min(R.y1,y0+j+1); if(xb<=xa||yb<=ya)continue;
      const a=g[(j+1)*nx+i], b=g[(j+1)*nx+i+1], c=g[j*nx+i+1], d=g[j*nx+i], lo=Math.min(a,b,c,d), k=hs(i,j,s), sh=(.7+.35*k)*(1-.3*sm((top-lo)/150));
      const wt=vn(xa*.4,ya*.4,s+47); c3.setRGB(.4*sh,.38*sh,(.4+.06*wt)*sh,THREE.SRGBColorSpace); if(wt>.72)c3.setRGB(.22*sh,.3*sh,.18*sh,THREE.SRGBColorSpace); if(k>.97)c3.setRGB(.6,.58,.55,THREE.SRGBColorSpace);   // damp rock, moss where the water seeps through
      for(const v of [[xa,d,ya],[xb,c,ya],[xb,b,yb],[xa,d,ya],[xb,b,yb],[xa,a,yb]]){ P.push(X(v[0]),Y(v[1])+dy,Z(v[2])); Cc.push(c3.r,c3.g,c3.b); }
      if(top-lo>95&&i>1&&j>1&&i<nx-3&&j<ny-3)low.push([xa+.5,ya+.5,lo]); }
    low.sort((p,q)=>p[2]-q[2]); const pick=[]; for(const p of low)if(!pick.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<3.2))pick.push(p); return pick; };
  // Polyfork's cave pieces (data/dunpf.json, tools/dun-pf-bake.py), each at its real size and where a cave would put it
  const DATA=__LAZY__("data/dunpf.json"); let PF=null; const ready=()=>PF?Promise.resolve():DATA().then(d=>{ PF=d; }).catch(e=>{ console.warn('DUNPF',e); PF={}; });
  const model=k=>{ const D=PF&&PF[k]; if(!D)return null; if(D.m)return D.m; const q=I16(D.p), n=D.n, P=new Float32Array(n*3), C=new Float32Array(n*3), col=B64(D.c), c=new THREE.Color();
    for(let i=0;i<n*3;i++)P[i]=(q[i]+32500)*D.sc+D.lo[i%3]; for(let i=0;i<n*3;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    let y0=1e9; for(let i=1;i<n*3;i+=3)y0=Math.min(y0,P[i]); return D.m={P,C,I:D.i32?new Uint32Array(B64(D.i).buffer):U16(D.i),n,y0,size:D.size}; };
  const MPT=TILE/.84;   // a metre
  // a rock piece takes the colour of the rock round it (its own shading kept), and fades into what it grows from: a stalactite into the ceiling at its root, a stalagmite or a heap into the floor (owner, 8 Nov 2026: "the color rock they are next should fit the color, or at least fade out")
  const LIN=c=>{ const q=new THREE.Color(); q.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [q.r,q.g,q.b]; };
  const ROCKY={stalactites:[.9,'top'],stalagmite:[.9,'bottom'],rubble:[.85,'bottom'],scree:[.85,'bottom'],rock:[.8,'bottom'],smallrock:[.8,'bottom'],boulder:[.8,'bottom'],ledge:[.8,'bottom'],column:[.45,'bottom'],masonry:[.35,null],ashlar:[.35,null],pipe:[.85,null],pipejoint:[.85,null],grate:[.7,null],rails:[.6,null],cart:[.55,null]};
  const put=(G,k,gx,gy,zu,rot,sc,o={})=>{ const m=model(k); if(!m)return null; const ca=Math.cos(rot), sa=Math.sin(rot), x=X(gx), z=Z(gy), y=Y(zu)+dy, base=G.P.length/3, fl=o.flip?-1:1, tint=o.tint||[1,1,1];
    const rk=ROCKY[k], rb=rk&&LIN(o.rock||SCHIST), ft=rk&&rk[1]&&LIN(o.fadeTo||(rk[1]==='top'?[98,94,98]:[72,66,58])), hy=m.size[1]||1;
    for(let i=0;i<m.n;i++){ const px=m.P[i*3]*MPT*sc, ly=m.P[i*3+1]-(o.flip?0:m.y0), py=ly*MPT*sc*fl, pz=m.P[i*3+2]*MPT*sc; G.P.push(x+px*ca+pz*sa,y+py,z-px*sa+pz*ca);
      let cr=m.C[i*3]*tint[0], cg=m.C[i*3+1]*tint[1], cb=m.C[i*3+2]*tint[2];
      if(rk){ const lum=Math.min(1.6,(.3*cr+.59*cg+.11*cb)/.12+.35), K=rk[0]; cr=cr*(1-K)+rb[0]*lum*K; cg=cg*(1-K)+rb[1]*lum*K; cb=cb*(1-K)+rb[2]*lum*K;
        if(ft){ const t=ly/hy, w=rk[1]==='top'?sm((t-.55)/.45):sm((.35-t)/.35); cr+=(ft[0]-cr)*w; cg+=(ft[1]-cg)*w; cb+=(ft[2]-cb)*w; } }
      G.C.push(cr,cg,cb); }
    for(let i=0;i<m.I.length;i+=3)fl<0?G.I.push(base+m.I[i],base+m.I[i+2],base+m.I[i+1]):G.I.push(base+m.I[i],base+m.I[i+1],base+m.I[i+2]); return {r:Math.max(m.size[0],m.size[2])*sc/.84/2,h:m.size[1]*sc*24/.84}; };
  const PFM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
  const dress=(L,ctx)=>{ '@dungeon'; const {R,B,ds}=L, r=rng(L.seed*331+5), th=L.T?L.T.theme:theme(L), {own,PL,sol,light}=ctx, SD={Kb:[[],[]],Kf:[[],[]],Kw:[[],[]],Ke:[[],[]]}, CP=[], CC=[];
    const G0={P:[],C:[],I:[]}, GS={Kb:{P:[],C:[],I:[]},Kf:{P:[],C:[],I:[]},Kw:{P:[],C:[],I:[]},Ke:{P:[],C:[],I:[]}};
    const hot=(w,u)=>(L.R.torches||[]).some(t=>t.w===w&&Math.abs(t.u-u)<1.1);
    const gaps=(s,u)=>(s==='b'?ds.b:s==='f'?ds.f:s==='w'?ds.w:ds.e).some(([a,b])=>u>a-1.4&&u<b+1.4);
    const sides=[['Kw','l',B.y0,B.y1,y=>[R.x0,y],[1,0]],['Ke','r',B.y0,B.y1,y=>[R.x1,y],[-1,0]],['Kb','b',B.x0,B.x1,x=>[x,R.y0],[0,1]],['Kf','f',B.x0,B.x1,x=>[x,R.y1],[0,-1]]];
    const gy=(x,y)=>h(L,x,y), took=(L.took||[]).map(t=>[t[0],t[1],t[2]]), M=L.T&&L.T.M;
    const flat=(x,y,rad)=>{ const z=gy(x,y); for(const [dx,dy] of [[rad,0],[-rad,0],[0,rad],[0,-rad]])if(Math.abs(gy(x+dx,y+dy)-z)>5)return false; return true; };
    const free=(x,y,rad,need)=>x>R.x0+rad&&x<R.x1-rad&&y>R.y0+rad&&y<R.y1-rad&&!took.some(t=>Math.hypot(x-t[0],y-t[1])<t[2]+rad)&&(!M||M(x,y)>(need??.5)||need===0)&&!(L.up&&y<L.up.y1+2.5&&x>L.up.x0-2&&x<L.up.x1+2);
    const spot=(rad,o={})=>{ for(let k=0;k<40;k++){ let x,y; if(o.wall){ const w=(r()*4)|0; x=w===0?R.x0+rad+.2:w===1?R.x1-rad-.2:R.x0+rad+r()*(R.x1-R.x0-2*rad); y=w===2?R.y0+rad+.2:w===3?R.y1-rad-.2:R.y0+rad+r()*(R.y1-R.y0-2*rad); }
        else if(o.near){ const a=r()*6.283, d=o.near[2]*(1+r()*.6); x=o.near[0]+Math.cos(a)*d; y=o.near[1]+Math.sin(a)*d; } else { x=R.x0+rad+r()*(R.x1-R.x0-2*rad); y=R.y0+rad+r()*(R.y1-R.y0-2*rad); }
        if(o.anyFree?x>R.x0+rad&&x<R.x1-rad&&y>R.y0+rad&&y<R.y1-rad&&!took.some(t=>Math.hypot(x-t[0],y-t[1])<t[2]+rad):free(x,y,rad,o.wall?0:o.need)&&(o.slope||flat(x,y,rad*.7))){ took.push([x,y,rad]); return [x,y]; } } return null; };
    const pf=(k,x,y,sc,o={})=>{ const z=o.z??gy(x,y)-1, q=put(o.G||G0,k,x,y,z,o.rot??r()*6.283,sc,o); if(q&&o.solid)sol(x-q.r*o.solid,y-q.r*o.solid,x+q.r*o.solid,y+q.r*o.solid,z+q.h); return q; };
    if(!L.c)for(const [k,w,a0,a1,at,[nx,ny]] of sides){ const S=SD[k]; for(let u=a0+1.2;u<a1-1.2;u+=3.4+r()*2.4){ const tu=u-(w==='l'||w==='r'?R.y0:R.x0); if(hot(w,tu)||gaps(k[1],u))continue;   // rock bulging from the wall, in tiers up its height
        if(L.up&&k==='Kb'&&u>L.up.x0-1.6&&u<L.up.x1+1.6)continue; const rr=.6+r()*.8, [wx,wy]=at(u), cx=wx+nx*rr*.15, cy=wy+ny*rr*.15, hz=18+r()*44;
        lump(S[0],S[1],cx,cy,0,nx?rr*.9:rr*1.3,ny?rr*.9:rr*1.3,hz,SCHIST,L.seed+Math.round(u*7),R); sol(Math.min(wx,cx+nx*rr*.6)-(ny?rr*.8:0),Math.min(wy,cy+ny*rr*.6)-(nx?rr*.8:0),Math.max(wx,cx+nx*rr*.6)+(ny?rr*.8:0),Math.max(wy,cy+ny*rr*.6)+(nx?rr*.8:0),hz*.8);
        } }   // (the skin does the rest of the wall)
    // a skin of rock over every wall, corridors too: it bulges out by different amounts all the way up, flares at the floor, swells by a doorway and tapers into it, and keeps clear of the torches (owner, 8 Nov 2026: "still too many straight lines, this place isnt man made")
    { const du=.62, ZS=[0,8,20,36,56,82,114,155,210,280,R.H+4], sd=L.seed+71, TW={Kw:'l',Ke:'r',Kb:'b',Kf:'f'}, SK={Kb:[[],[]],Kf:[[],[]],Kw:[[],[]],Ke:[[],[]]};
      for(const [k,w,a0,a1,at,[nx,ny]] of sides){ const ops=(k==='Kb'?ds.b:k==='Kf'?ds.f:k==='Kw'?ds.w:ds.e), segs=[]; let a=a0; for(const [p,q] of ops){ if(p>a)segs.push([a,p]); a=Math.max(a,q); } if(a1>a)segs.push([a,a1]);
        const tor=(L.R.torches||[]).filter(t=>t.w===TW[k]).map(t=>(w==='l'||w==='r'?R.y0:R.x0)+t.u), S=SD[k];
        const D=(u,z,s0,s1)=>{ const e=Math.min(u-s0,s1-u); let d=.14+.5*vn(u*.55,z*.011,sd)+.22*vn(u*1.6,z*.035,sd+2)+.34*sm((36-z)/36); d*=(1+.7*sm((1.3-e)/1.3))*sm(e/.3);
          for(const tu of tor){ const q=Math.hypot((u-tu)/.95,(z-86)/62); if(q<1)d=d*(1-.82*sm((1-q)/.6))+.03; } if(L.up&&k==='Kb'&&u>L.up.x0-.6&&u<L.up.x1+.6)d=0; return Math.min(d,L.c?.55:.95); };   // (a rounded hollow round each torch, not a flat cut)
        for(const [s0,s1] of segs){ if(s1-s0<.3)continue; const us=[]; for(let u=s0;u<s1-1e-6;u+=du)us.push(u); us.push(s1);
          const SKk=SK[k], c3=new THREE.Color(), V=(u,z)=>{ const [x,y]=at(u), d=D(u,z,s0,s1), col=wall(nx,ny,x,y,z,R); c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); return [X(x+nx*d),Y(z)+dy,Z(y+ny*d),c3.r,c3.g,c3.b]; };
          for(let i=0;i<us.length-1;i++){ for(let j=0;j<ZS.length-1;j++){ const u0=us[i], u1=us[i+1], z0=ZS[j], z1=ZS[j+1], A=V(u0,z0), Bq=V(u1,z0), Cq=V(u1,z1), Dq=V(u0,z1);
              const ex=Bq[0]-A[0], ey=Bq[1]-A[1], ez=Bq[2]-A[2], fx=Cq[0]-A[0], fy=Cq[1]-A[1], fz=Cq[2]-A[2], cx=ey*fz-ez*fy, cz=ex*fy-ey*fx, out=cx*nx+cz*ny>0;   // wound to face into the room, so a camera behind it sees through
              for(const v of out?[A,Bq,Cq,A,Cq,Dq]:[A,Cq,Bq,A,Dq,Cq]){ SKk[0].push(v[0],v[1],v[2]); SKk[1].push(v[3],v[4],v[5]); } }
            const dm=D((us[i]+us[i+1])/2,8,s0,s1); if(dm>.22){ const [x,y]=at(us[i]), [x2,y2]=at(us[i+1]); sol(Math.min(x,x2,x+nx*dm*.8),Math.min(y,y2,y+ny*dm*.8),Math.max(x,x2,x+nx*dm*.8),Math.max(y,y2,y+ny*dm*.8),60); } } } }
      for(const k in SK){ const [P,C]=SK[k]; if(!P.length)continue; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals();
        const m=SKM.clone(); m.clippingPlanes=[PL[k]]; const me=new THREE.Mesh(g,m); me.receiveShadow=true; own(me); } }
    if(!L.c)for(const [k,w,a0,a1,at,[nx,ny]] of sides){ const ops=(k==='Kb'?ds.b:k==='Kf'?ds.f:k==='Kw'?ds.w:ds.e), S=SD[k];   // each doorway's edges rounded off by a tall mass of rock, so no straight edge shows where the wall ends
      for(const [p,q] of ops)for(const u of [p,q]){ if(u<=a0+.05||u>=a1-.05)continue; const [wx,wy]=at(u), rr=.5+r()*.25, bx=nx?{x0:R.x0,x1:R.x1,y0:-1e9,y1:1e9}:{x0:-1e9,x1:1e9,y0:R.y0,y1:R.y1};
        lump(S[0],S[1],wx+nx*rr*.35,wy+ny*rr*.35,0,rr,rr,R.H*(.55+r()*.35),SCHIST,L.seed+Math.round(u*13),bx); sol(wx-rr*.55,wy-rr*.55,wx+rr*.55,wy+rr*.55,80); } }
    if(!L.c)for(const [cx,cy,k] of [[R.x0,R.y0,'Kb'],[R.x1,R.y0,'Kb'],[R.x0,R.y1,'Kf'],[R.x1,R.y1,'Kf']]){ if(L.up&&cy===R.y0&&Math.abs(cx-(L.up.x0+L.up.x1)/2)<3)continue; const rr=1+r()*.8;
      lump(SD[k][0],SD[k][1],cx,cy,0,rr,rr,60+r()*90,SCHIST,L.seed+cx,R); sol(cx-rr*.6,cy-rr*.6,cx+rr*.6,cy+rr*.6,90); }
    const drips=ceil(L,CP,CC), n=L.n||1, big=(R.x1-R.x0)*(R.y1-R.y0);
    if(PF&&!L.c){
      for(const [x,y,lo] of drips.slice(0,2+Math.min(4,Math.floor(big/90)))){ const sc=.9+r()*.9, q=put(G0,'stalactites',x,y,lo-1.8*sc*24/.84+2,r()*6.283,sc);   // a stalactite where the vault hangs lowest, and under it the stalagmite its drips built
        if(free(x,y,.7)&&flat(x,y,.5)&&!(L.T&&L.T.F.some(f=>Math.hypot((x-f.cx)/f.rx,(y-f.cy)/f.ry)<1.5))){ took.push([x,y,.7]); pf('stalagmite',x,y,.35+r()*.45,{solid:.35}); } }   // (never down a pit or on a ledge, where it would bar the way)
      if(L.T)for(const f of L.T.F){ if(f.h>0){ const a=f.ramp+Math.PI+(r()-.5)*1.2, x=f.cx+Math.cos(a)*f.rx*1.35, y=f.cy+Math.sin(a)*f.ry*1.35; if(free(x,y,.9,0))pf(r()<.5?'scree':'rubble',x,y,.5+r()*.35,{z:gy(x,y)-3}); }   // what broke off the ledge lies at its foot
        else { pf(r()<.5?'bones':'bonescatter',f.cx+(r()-.5)*f.rx*.6,f.cy+(r()-.5)*f.ry*.6,.9,{z:gy(f.cx,f.cy)-1}); if(th!=='cistern'&&r()<.6)pf('smallrock',f.cx+(r()-.5)*f.rx*.5,f.cy+(r()-.5)*f.ry*.5,.8); } }   // and down a pit, what fell in
      for(let k=0;k<3+n;k++){ const s=spot(.5,{wall:1}); if(s)pf(r()<.3?'rock':'smallrock',...s,.5+r()*.7,{solid:r()<.4?.4:0}); }   // fallen stone along the walls
      if(r()<.7){ const s=spot(1.3,{wall:1}); if(s)pf('rubble',...s,.55+r()*.3,{solid:.45}); }   // a roof fall in a corner
      const damp=th==='cistern'||th==='sewer'?6:3; for(let k=0;k<damp;k++){ const s=spot(.5,{wall:1,slope:1}); if(s)pf(r()<.5?'moss':'clubmoss',...s,.8+r()*.8,{tint:[.85,1,.85]}); }
      for(let k=0;k<1+(r()*2|0);k++){ const s=spot(.4,{wall:1}); if(s)pf('mushrooms',...s,1+r()*.8); }
      if(th==='cave'&&big>150){ const s=spot(.8,{wall:1}); if(s){ pf('glowcap',...s,.22+r()*.08,{solid:.25}); light({x:s[0],y:s[1],z:40,r:3.2,c:[.35,.95,.85],flick:0}); } }   // a pale cap that glows in the dark
      if(n>=4)for(let k=0;k<1+(r()*3|0);k++){ const s=spot(.6,{wall:1}); if(s){ pf(r()<.7?'crystals':'crystalcol',...s,.6+r()*.6,{solid:.3}); if(k===0)light({x:s[0],y:s[1],z:20,r:2.4,c:[.75,.45,1],flick:0}); } }   // the deep rooms grow crystal
      for(const [cx,cy,a] of [[R.x0+.4,R.y0+.4,Math.PI*.25],[R.x1-.4,R.y1-.4,Math.PI*1.25]])if(r()<.6)put(G0,'cobweb',cx,cy,70+r()*60,a,1.2+r()*.6);   // webs strung across a corner
      if(L.camp){ pf('lantern',L.camp.x+.4,L.camp.y,1); pf('pickaxe',L.camp.x-.3,L.camp.y+.4,1,{z:gy(L.camp.x,L.camp.y)}); }
      if(th==='sewer'){ const k=R.x1-R.x0>=R.y1-R.y0?'Kb':'Kw', S=GS[k], w=k==='Kb';   // the old sewer: iron pipes along the long wall, drains in the floor, fallen masonry
        for(let a=(w?R.x0:R.y0)+1.5;a<(w?R.x1:R.y1)-4.5;a+=4.8){ if(gaps(k[1],a+2.4))continue; put(S,'pipe',w?a+2.4:R.x0+.55,w?R.y0+.55:a+2.4,38,w?0:Math.PI/2,1,{rock:[88,62,48]}); }   // (old iron, rusted the colour of the water that runs down it)
        for(let k2=0;k2<2+(big>200);k2++){ const s=spot(1.2,{need:.9}); if(s)pf('grate',...s,.9,{z:gy(...s)+.2,rock:[70,64,60]}); }
        for(let k2=0;k2<4;k2++){ const s=spot(.4,{wall:1}); if(s)pf(r()<.5?'masonry':'ashlar',...s,.9+r()*.5,{rot:r()*6.283}); } }
      if(th==='subway'&&L.track){ const T=L.track, w=T.w, c0=w?(T.y0+T.y1)/2:(T.x0+T.x1)/2, a1=(w?T.x1:T.y1)-r()*3;   // a forgotten stretch of track, its far end torn up; a cart left on it
        for(let a=(w?T.x0:T.y0)+1.2;a<a1;a+=2.38)pf('rails',w?a:c0,w?c0:a,1,{rot:w?Math.PI/2:0,z:gy(w?a:c0,w?c0:a)});
        const ca=(w?T.x0:T.y0)+2+r()*Math.max(1,a1-(w?T.x0:T.y0)-5); pf('cart',w?ca:c0,w?c0:ca,1,{rot:w?Math.PI/2:0,solid:.4,z:gy(w?ca:c0,w?c0:ca)+4});
        const s=spot(1,{wall:1}); if(s)pf('railstack',...s,.8,{rot:w?Math.PI/2:0,solid:.3}); }
      if(th==='cistern'){ const sx=Math.max(4,(R.x1-R.x0)/Math.max(1,Math.round((R.x1-R.x0)/5))), sy=Math.max(4,(R.y1-R.y0)/Math.max(1,Math.round((R.y1-R.y0)/5)));   // the cistern's columns in their rows, some fallen short
        for(let x=R.x0+sx;x<R.x1-1.5;x+=sx)for(let y=R.y0+sy;y<R.y1-1.5;y+=sy){ if(!free(x,y,.8)||!flat(x,y,.6))continue; took.push([x,y,.8]); const sc=.8+r()*.5; pf('column',x,y,sc,{solid:.32,rot:(r()*4|0)*Math.PI/2});
          if(r()<.5)pf(r()<.5?'ashlar':'masonry',x+(r()-.5)*1.6,y+(r()-.5)*1.6,1+r()*.4); }
        for(let k=0;k<2;k++){ const s=spot(.9,{need:.9}); if(s)pf('pool',...s,1+r()*.8,{z:gy(...s)+.3}); } } }
    if(th==='cistern'&&L.T){ for(const f of L.T.F)if(f.h<0){ const wl=new THREE.Mesh(new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x1e4a48,transparent:true,opacity:.78,emissive:0x061414}));   // a pit holds the dark water that seeps in
        wl.scale.set(f.rx*TILE*1.05,1,f.ry*TILE*1.05); wl.position.set(X(f.cx),Y(f.h*.55+.3)+dy,Z(f.cy)); own(wl); } }
    for(const k in SD){ const [P,C]=SD[k]; if(!P.length)continue; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals();
      const m=MODS.castleStairMat.clone(); m.clippingPlanes=[PL[k]]; const me=new THREE.Mesh(g,m); me.receiveShadow=true; own(me); }   // cut with their wall where it opens toward you (no shadows of their own: the torch's shadow map would draw them six times over)
    const mk=(G,mat,sh)=>{ if(!G.P.length)return; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(G.P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(G.C,3)); if(G.I)g.setIndex(G.I); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat); me.castShadow=me.receiveShadow=!!sh; own(me); };
    mk(G0,PFM,false); for(const k in GS){ const m=PFM.clone(); m.clippingPlanes=[PL[k]]; mk(GS[k],m,false); }
    if(CP.length)mk({P:CP,C:CC},CEILM,false); };
  const CEILM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});   // seen only from below
  const SKM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});   // the rock skin: one-sided, facing the room
  // where the ground is a cliff: boxes (world x0,z0,x1,z1), one run of steep cells to a row, that routes and the monsters keep out of
  const cliffs=L=>{ const T=L.T; if(!T)return []; if(T.cl)return T.cl; const {x0,y0,nx,ny,g}=T, out=[], st=(i,j)=>{ const v=g[j*nx+i]; return (i+1<nx&&Math.abs(g[j*nx+i+1]-v)>11)||(j+1<ny&&Math.abs(g[(j+1)*nx+i]-v)>11); };
    for(let j=0;j<ny;j++){ let a=-1; for(let i=0;i<=nx;i++){ const s=i<nx&&st(i,j); if(s&&a<0)a=i; if(!s&&a>=0){ const gx0=x0+a*RS-RS*.5, gx1=x0+(i-1)*RS+RS*.5, gy0=y0+j*RS-RS*.5, gy1=y0+j*RS+RS*.5, xa=X(gx0), xb=X(gx1), za=Z(gy0), zb=Z(gy1); out.push([Math.min(xa,xb),Math.min(za,zb),Math.max(xa,xb),Math.max(za,zb)]); a=-1; } } }
    return T.cl=out; };
  MODS.dunTerr={make,h,mesh,dress,theme,cliffs,wall,floorCol,ready,STEP,DROP};
  window.DUNTERRDBG=()=>{ const D=MODS.dungeon; return {here:D&&D.ground?+(D.ground(pos.x,pos.z)-dy).toFixed(3):null,step:Y(STEP),drop:Y(DROP)}; };
  // a drop off a ledge or into a pit: a big one hurts
  let lastG=null, lx=0, lz=0, fall=0; SYS.add('life',()=>{ const D=MODS.dungeon; if(SHARED.LVL!=='down'||!D||!D.inside||!D.inside(pos.x,pos.z)){ lastG=null; fall=0; return; } const g=D.ground(pos.x,pos.z), mv=Math.hypot(pos.x-lx,pos.z-lz)/TILE; lx=pos.x; lz=pos.z;
    if(lastG!=null&&mv<.6){ const d=(lastG-g)/Y(1); if(d>22*mv+.5)fall+=d; else { if(fall>DROP&&!VIT.dead){ const k=fall/40; VIT.hurt(Math.min(.25,.03*k*k)); SAY('YOU DROP DOWN.','#d8c8a8'); } fall=0; } }   // down over a cliff, added up while it lasts: a big drop hurts
    lastG=g; },'062c-dunterrain'); }
