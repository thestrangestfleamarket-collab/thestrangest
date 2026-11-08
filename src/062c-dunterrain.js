// THE DUNGEON'S GROUND: each room's uneven floor (slopes, ledges with a ramp up, pits with a rubble slope out), rock bulging from its walls, and what the city above left down there (brick sewers, an old subway, cisterns) (owner, 8 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
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
  const make=L=>{ const {R,n}=L, r=rng(L.seed*613+11), A=avoidOf(L), M=maskOf(L,A), W=R.x1-R.x0, H=R.y1-R.y0, area=W*H, F=[];
    const fits=(cx,cy,rx,ry)=>{ if(M(cx,cy)<.8)return false; let lo=0; for(let k=0;k<12;k++){ const a=k/12*6.283; if(M(cx+Math.cos(a)*rx*.8,cy+Math.sin(a)*ry*.8)<.5)lo++; } if(lo>3)return false; return !F.some(f=>Math.hypot(cx-f.cx,cy-f.cy)<Math.max(rx,ry)+Math.max(f.rx,f.ry)+1.6); };
    const add=(h)=>{ for(let t=0;t<90;t++){ const rx=1.5+r()*(Math.min(W,H)>12?2.6:1.4), ry=Math.max(1.3,rx*(.6+r()*.6)), cx=R.x0+rx+2.4+r()*Math.max(0,W-2*rx-4.8), cy=R.y0+ry+2.4+r()*Math.max(0,H-2*ry-4.8);
      if(fits(cx,cy,rx,ry)){ F.push({cx,cy,rx,ry,h,ramp:r()*6.283}); return; } } };
    const ledges=L.k===1?1:area>320?2:area>110?1:0, pits=L.k===1?0:area>260?2:area>120?1:(n>2&&area>80?1:0);
    for(let i=0;i<ledges;i++)add(30+r()*16); for(let i=0;i<pits;i++)add(-(38+r()*18));
    const x0=R.x0, y0=R.y0, nx=Math.ceil(W/RS)+1, ny=Math.ceil(H/RS)+1, g=new Float32Array(nx*ny), s=L.seed;
    const at=(x,y)=>{ const m=M(x,y); if(m<=0)return 0; let v=8*(vn(x*.33,y*.33,s)-.5)*2+3*(vn(x*1.1,y*1.1,s+9)-.5);
      for(const f of F){ const u=(x-f.cx)/f.rx, w=(y-f.cy)/f.ry, a=Math.atan2(w*f.ry,u*f.rx), d=Math.hypot(u,w)+.1*(vn(Math.cos(a)*3+f.cx,Math.sin(a)*3+f.cy,s+3)-.5), e=(d-1)*Math.min(f.rx,f.ry);
        const ramp=sm((Math.cos(a-f.ramp)-.72)/.22), wd=.35+ramp*2.8; v+=e<=0?f.h:f.h*(1-sm(e/wd)); } return v*m; };
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)g[j*nx+i]=at(x0+i*RS,y0+j*RS);
    L.T={x0,y0,nx,ny,g,F,theme:theme(L)}; return L.T; };
  const h=(L,gx,gy)=>{ const T=L&&L.T; if(!T)return 0; const fx=Math.max(0,Math.min(T.nx-1.001,(gx-T.x0)/RS)), fy=Math.max(0,Math.min(T.ny-1.001,(gy-T.y0)/RS)), i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j, G=T.g, N=T.nx;
    return G[j*N+i]*(1-u)*(1-v)+G[j*N+i+1]*u*(1-v)+G[(j+1)*N+i]*(1-u)*v+G[(j+1)*N+i+1]*u*v; };
  const TINT={cave:[1,1,1.02],sewer:[1.06,.96,.86],subway:[.94,.94,.96],cistern:[.9,1,.98]};
  // the floor: a sheet over the heights, its colour the room's stones, rock where it is steep, darker and wet down a pit
  const mesh=(L,quad,FC)=>{ const T=L.T, {x0,y0,nx,ny,g}=T, tn=TINT[T.theme], ROCK=[86,84,90];
    for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){ const a=g[(j+1)*nx+i], b=g[(j+1)*nx+i+1], c=g[j*nx+i+1], d=g[j*nx+i], xa=x0+i*RS, xb=Math.min(L.R.x1,xa+RS), ya=y0+j*RS, yb=Math.min(L.R.y1,ya+RS);
      if(xb<=xa||yb<=ya)continue; const lo=Math.min(a,b,c,d), sl=Math.max(a,b,c,d)-lo; let col=FC(xa+RS/2,ya+RS/2,L.R); col=Array.isArray(col)?col:[70,66,62];
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
  const SCHIST=[96,94,100], BRICK=[128,62,46], RUST=[112,66,40];
  const dress=(L,ctx)=>{ '@dungeon'; const {R,B,ds}=L, r=rng(L.seed*331+5), th=L.T?L.T.theme:theme(L), {own,PL,sol}=ctx, SD={Kb:[[],[]],Kf:[[],[]],Kw:[[],[]],Ke:[[],[]]}, FP=[], FC=[];
    const hot=(w,u)=>(L.R.torches||[]).some(t=>t.w===w&&Math.abs(t.u-u)<1.1);
    const gaps=(s,u)=>(s==='b'?ds.b:s==='f'?ds.f:s==='w'?ds.w:ds.e).some(([a,b])=>u>a-1.4&&u<b+1.4);
    const sides=[['Kw','l',B.y0,B.y1,y=>[R.x0,y],[1,0]],['Ke','r',B.y0,B.y1,y=>[R.x1,y],[-1,0]],['Kb','b',B.x0,B.x1,x=>[x,R.y0],[0,1]],['Kf','f',B.x0,B.x1,x=>[x,R.y1],[0,-1]]];
    if(!L.c)for(const [k,w,a0,a1,at,[nx,ny]] of sides){ const S=SD[k]; for(let u=a0+1.2;u<a1-1.2;u+=2+r()*1.6){ const tu=u-(w==='l'||w==='r'?R.y0:R.x0); if(hot(w,tu)||gaps(k[1],u))continue;
        if(L.up&&k==='Kb'&&u>L.up.x0-1.6&&u<L.up.x1+1.6)continue; const rr=.6+r()*.8, [wx,wy]=at(u), cx=wx+nx*rr*.15, cy=wy+ny*rr*.15, hz=18+r()*44;
        lump(S[0],S[1],cx,cy,0,nx?rr*.9:rr*1.3,ny?rr*.9:rr*1.3,hz,SCHIST,L.seed+Math.round(u*7),R); sol(Math.min(wx,cx+nx*rr*.6)-(ny?rr*.8:0),Math.min(wy,cy+ny*rr*.6)-(nx?rr*.8:0),Math.max(wx,cx+nx*rr*.6)+(ny?rr*.8:0),Math.max(wy,cy+ny*rr*.6)+(nx?rr*.8:0),hz*.8); } }
    if(!L.c)for(const [cx,cy,k] of [[R.x0,R.y0,'Kb'],[R.x1,R.y0,'Kb'],[R.x0,R.y1,'Kf'],[R.x1,R.y1,'Kf']]){ if(L.up&&cy===R.y0&&Math.abs(cx-(L.up.x0+L.up.x1)/2)<3)continue; const rr=1+r()*.8;
      lump(SD[k][0],SD[k][1],cx,cy,0,rr,rr,40+r()*50,SCHIST,L.seed+cx,R); sol(cx-rr*.6,cy-rr*.6,cx+rr*.6,cy+rr*.6,90); }
    const gy=(x,y)=>h(L,x,y), longK=R.x1-R.x0>=R.y1-R.y0;
    if(th==='sewer'&&!L.c){ const k=longK?'Kb':'Kw', S=SD[k];   // two old pipes run along the long wall, flanged every few metres, and brick shows where the rock fell away
      for(const [z,rad,col] of [[34,.11,RUST],[50,.08,[70,72,78]]]){ if(longK){ box3(S[0],S[1],R.x0+.6,R.y0+.05,z-rad*24,R.x1-.6,R.y0+.05+rad*2,z+rad*24,col); for(let x=R.x0+2;x<R.x1-1;x+=3)box3(S[0],S[1],x,R.y0+.03,z-rad*34,x+.12,R.y0+.1+rad*2,z+rad*34,col.map(v=>v*.8)); }
        else { box3(S[0],S[1],R.x0+.05,R.y0+.6,z-rad*24,R.x0+.05+rad*2,R.y1-.6,z+rad*24,col); for(let y=R.y0+2;y<R.y1-1;y+=3)box3(S[0],S[1],R.x0+.03,y,z-rad*34,R.x0+.1+rad*2,y+.12,z+rad*34,col.map(v=>v*.8)); } }
      for(let p=0;p<2;p++){ const kk=p?'Ke':'Kf', S2=SD[kk], u0=(p?R.y0:R.x0)+2+r()*Math.max(1,(p?R.y1-R.y0:R.x1-R.x0)-7), z0=10+r()*30;
        for(let row=0;row<8;row++)for(let c=0;c<10;c++){ const o=(row&1)*.12, a=u0+c*.25+o, zz=z0+row*5, col=BRICK.map(v=>v*(.8+.35*hs(c,row,p)));
          if(p)box3(S2[0],S2[1],R.x1-.04,a,zz,R.x1,a+.22,zz+4.2,col); else box3(S2[0],S2[1],a,R.y1-.04,zz,a+.22,R.y1,zz+4.2,col); } } }
    if(th==='subway'&&L.track){ const T=L.track, w=T.w, SL=[58,44,34], RL=[120,92,74];   // a forgotten stretch of track: sleepers and two rusted rails, the far end broken off
      const a0=w?T.x0:T.y0, a1=(w?T.x1:T.y1)-r()*2, c0=w?(T.y0+T.y1)/2:(T.x0+T.x1)/2;
      for(let a=a0;a<a1;a+=.62)w?box3(FP,FC,a,c0-.75,0,a+.28,c0+.75,4,SL):box3(FP,FC,c0-.75,a,0,c0+.75,a+.28,4,SL);
      for(const o of [-.45,.45])w?box3(FP,FC,a0,c0+o-.05,4,a1,c0+o+.05,9,RL):box3(FP,FC,c0+o-.05,a0,4,c0+o+.05,a1,9,RL);
      const k=w?'Kb':'Kw', S=SD[k], u0=(w?R.x0:R.y0)+3, u1=Math.min(u0+7,(w?R.x1:R.y1)-3);   // white station tiles with their green band, cracked through
      for(let u=u0;u<u1;u+=.25)for(let zz=16;zz<72;zz+=6){ if(hs(u*4,zz,L.seed)<.12)continue; const col=zz>=46&&zz<52?[40,96,70]:[214,212,200].map(v=>v*(.86+.14*hs(u,zz,3)));
        w?box3(S[0],S[1],u,R.y0,zz,u+.22,R.y0+.04,zz+5,col):box3(S[0],S[1],R.x0,u,zz,R.x0+.04,u+.22,zz+5,col); } }
    if(th==='cistern'&&L.T){ for(const f of L.T.F)if(f.h<0){ const wl=new THREE.Mesh(new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x1e4a48,transparent:true,opacity:.78,emissive:0x061414}));   // a pit holds the dark water that seeps in
        wl.scale.set(f.rx*TILE*1.05,1,f.ry*TILE*1.05); wl.position.set(X(f.cx),Y(f.h*.55+.3)+dy,Z(f.cy)); own(wl); }
      for(let k=0;k<4+(r()*3|0);k++){ const x=R.x0+2+r()*(R.x1-R.x0-4), y=R.y0+2+r()*(R.y1-R.y0-4), z=gy(x,y); if(Math.abs(z)>4||L.T.F.some(f=>Math.hypot((x-f.cx)/f.rx,(y-f.cy)/f.ry)<1.4))continue;
        const hz=20+r()*60; box3(FP,FC,x-.32,y-.32,z,x+.32,y+.32,z+hz,[118,112,104]); box3(FP,FC,x-.42,y-.42,z+hz,x+.42,y+.42,z+hz+5,[132,126,116]); sol(x-.32,y-.32,x+.32,y+.32,hz); } }
    if(th==='cave'&&L.T&&!L.c){ for(let k=0;k<6+(r()*6|0);k++){ const x=R.x0+1.5+r()*(R.x1-R.x0-3), y=R.y0+1.5+r()*(R.y1-R.y0-3), z=gy(x,y), sl=Math.abs(gy(x+.4,y)-z)+Math.abs(gy(x,y+.4)-z);   // stalagmites where the ground is level
        if(sl>4||(L.took||[]).some(t=>Math.hypot(x-t[0],y-t[1])<t[2]+.8))continue; const rr=.12+r()*.22; lump(FP,FC,x,y,z-2,rr,rr,16+r()*44,[110,104,96],k+L.seed); sol(x-rr*.6,y-rr*.6,x+rr*.6,y+rr*.6,30); } }
    for(const k in SD){ const [P,C]=SD[k]; if(!P.length)continue; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals();
      const m=MODS.castleStairMat.clone(); m.clippingPlanes=[PL[k]]; const me=new THREE.Mesh(g,m); me.castShadow=me.receiveShadow=true; own(me); }   // cut with their wall where it opens toward you
    if(FP.length){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(FP,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(FC,3)); g.computeVertexNormals(); const me=new THREE.Mesh(g,MODS.castleStairMat); me.castShadow=me.receiveShadow=true; own(me); } };
  MODS.dunTerr={make,h,mesh,dress,theme,STEP,DROP};
  window.DUNTERRDBG=()=>{ const D=MODS.dungeon; return {here:D&&D.ground?+(D.ground(pos.x,pos.z)-dy).toFixed(3):null,step:Y(STEP),drop:Y(DROP)}; };
  // a drop off a ledge or into a pit: a big one hurts
  let lastG=null, lx=0, lz=0, fall=0; SYS.add('life',()=>{ const D=MODS.dungeon; if(SHARED.LVL!=='down'||!D||!D.inside||!D.inside(pos.x,pos.z)){ lastG=null; fall=0; return; } const g=D.ground(pos.x,pos.z), mv=Math.hypot(pos.x-lx,pos.z-lz)/TILE; lx=pos.x; lz=pos.z;
    if(lastG!=null&&mv<.6){ const d=(lastG-g)/Y(1); if(d>22*mv+.5)fall+=d; else { if(fall>DROP&&!VIT.dead){ const k=fall/40; VIT.hurt(Math.min(.25,.03*k*k)); SAY('YOU DROP DOWN.','#d8c8a8'); } fall=0; } }   // down over a cliff, added up while it lasts: a big drop hurts
    lastG=g; },'062c-dunterrain'); }
