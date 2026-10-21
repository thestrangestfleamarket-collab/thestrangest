await grab('dungeon',async()=>{});
{ const K=BOD.KC, KP=BOD.K.PROPS, Kc=K.CATALOG, sh=BOD.K.sh, X=BOD.XS, Z=BOD.ZS, Y=BOD.YS, {faceTex,bq,C}=BOD, P0=K.DGP, D0=K.DGN, dy=STN.DY, T=.1, NL=5, GAP=40, G=MAPG.dungeon;
  const iX=x=>(x-X(0))/TILE, iZ=z=>(z-Z(0))/TILE, lot=n=>({x0:900+(n-1)*GAP,y0:-20,x1:914+(n-1)*GAP,y1:-6.8,h:130});
  const lotAt=(x,z)=>{ const gx=iX(x), gy=iZ(z), n=Math.floor((gx-900)/GAP)+1; if(n<1||n>NL)return 0; const B=lot(n); return gx>B.x0&&gx<B.x1&&gy>B.y0&&gy<B.y1?n:0; };
  const lay=n=>{ const B=lot(n), m=!(n&1), R={...D0,b:B,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:(B.x0+B.x1)/2,cy:(B.y0+B.y1)/2,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T],
      door:{w:'-'},slit:{w:'-'},tally:{w:'-'},banners:[],holes:D0.holes.filter(h=>h.w!=='b'),torches:[{w:'l',u:3.4},{w:'l',u:9.6},{w:'r',u:3.4},{w:'r',u:9.6}]};
    const lx=(a,b)=>m?[R.x1-b,R.x1-a]:[R.x0+a,R.x0+b], [ux0,ux1]=lx(2.2,4.2), [dx0,dx1]=lx(9.6,11.6);
    const up={x0:ux0,x1:ux1,y0:R.y0,y1:R.y0+3,n:6,rise:8,up:1}, dn=n<NL?{x0:dx0,x1:dx1,y0:R.y0+6.6,y1:R.y0+10.2,n:6,rise:10,up:0}:null;
    return {n,B,R,up,dn,atUp:{x:X((up.x0+up.x1)/2),z:Z(up.y1+.6),h:0},atDn:dn&&{x:X((dn.x0+dn.x1)/2),z:Z(dn.y0-.6),h:Math.PI}}; };
  const tread=(S,gx,gy)=>S&&gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1?Math.min(S.n,Math.floor((S.up?S.y1-gy:gy-S.y0)/((S.y1-S.y0)/S.n))+1):0;
  const ground=(x,z)=>{ const n=lotAt(x,z); if(!n)return dy; const L=lay(n), gx=iX(x), gy=iZ(z), u=tread(L.up,gx,gy), d=tread(L.dn,gx,gy); return dy+Y(u?u*L.up.rise:d?-d*L.dn.rise:0); };
  const PL={}, SIDE={b:[0,1],f:[0,-1],w:[1,0],e:[-1,0]}; for(const k in SIDE)PL['K'+k]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  let cur=0, busy=false, mine=null; const HK=[];
  const clear=()=>{ '@later'; if(!mine)return; const M=mine; mine=null; cur=0;
    for(const o of M.objs){ G.remove(o); o.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material&&c.material!==MODS.castleStairMat)for(const q of [].concat(c.material)){ if(q.map)q.map.dispose(); if(q.emissiveMap)q.emissiveMap.dispose(); q.dispose(); } }); }
    const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } };
    out(SOL.down,M.sol); out(FIX.down,M.fix); out(LITE.recs,M.lights); out(FLAME.src,M.fl); out(cutWalls,M.cuts); LITE.t=0; for(const f of HK)f(0); };
  const build=n=>{ '@dungeon'; clear(); const L=lay(n), {R,up,dn}=L, s0=scene.children.length, n0=KP.length, l0=K.LAMPS.length, f0=FLAME.src.length, keep=BATCH.items.splice(0), M={objs:[],sol:[],fix:[],lights:[],fl:[],cuts:[]};
    const arch=(nx,ny,Xp,Yp,z)=>{ if(ny<=0||Math.abs(Yp-R.y0)>.06||Xp<up.x0-.2||Xp>up.x1+.2)return null; const hw=(up.x1-up.x0)*12, d=Math.abs(Xp-(up.x0+up.x1)/2)*24, sp=up.n*up.rise+30, r=Math.hypot(d,Math.max(0,z-sp));
      return r<hw-3?P0.dark:r<hw+2?sh(P0.hi,.8):null; };
    const wall=(x0,y0,x1,y1)=>({x0,y0,x1,y1,z0:0,z1:R.H+4,c:P0.st[1],top:()=>P0.lo,fs:(nx,ny,Xp,Yp,z,k)=>arch(nx,ny,Xp,Yp,z)||K.dungeonWall(null,nx,ny,Xp,Yp,z,k,R)});
    const B=L.B, WB=[['Kb',wall(B.x0-T,B.y0-T,B.x1+T,B.y0+T)],['Kf',wall(B.x0-T,B.y1-T,B.x1+T,B.y1+T)],['Kw',wall(B.x0-T,B.y0+T,B.x0+T,B.y1-T)],['Ke',wall(B.x1-T,B.y0+T,B.x1+T,B.y1-T)]];
    const floor=(x0,y0,x1,y1)=>{ if(x1-x0<.01||y1-y0<.01)return; bq([X(x0),Y(.3)+dy,Z(y1)],[X(x1),Y(.3)+dy,Z(y1)],[X(x1),Y(.3)+dy,Z(y0)],[X(x0),Y(.3)+dy,Z(y0)],faceTex(Math.round((x1-x0)*24),Math.round((y1-y0)*24),(i,j)=>C(K.dungeonFloorCol(x0+(i+.5)/24,y0+(j+.5)/24,R))),'L'); };
    if(dn){ floor(R.x0,R.y0,R.x1,dn.y0); floor(R.x0,dn.y1,R.x1,R.y1); floor(R.x0,dn.y0,dn.x0,dn.y1); floor(dn.x1,dn.y0,R.x1,dn.y1); } else floor(R.x0,R.y0,R.x1,R.y1);
    for(const t of R.torches){ const [x,y]=t.w==='l'?[R.x0+.16,R.y0+t.u]:[R.x1-.16,R.y0+t.u]; Kc['wall torch'](x,y,t.w); }
    const made=KP.slice(n0); KP.length=n0; BATCH.meshes={}; BATCH.cast=true; for(const [k,b] of WB)gboxS(b,k,dy); for(const p of made)for(const b of p.boxes)gboxS(b,'L',dy);
    BATCH.build((k,map,emap)=>castleMat(k,map,emap,PL[k])); BATCH.cast=false;
    for(const k in PL)for(const me of BATCH.all(BATCH.meshes,k)){ const s=SIDE[k[1]], w={pl:PL[k],nx:s[0],nz:s[1],foot:dy+Y(6),me,when:()=>LVL==='down'&&cur>0}; cutWalls.push(w); M.cuts.push(w); } BATCH.meshes={}; BATCH.items=keep;
    const P=[], Cc=[], c3=new THREE.Color(), ST=[88,84,78], ST2=[74,70,66];
    const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
    const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0)+dy,Y(z1)+dy], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
      quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const sol=(x0,y0,x1,y1,z1)=>{ const s=[X(x0),Z(y0),X(x1),Z(y1)], f=[X(x0),Z(y0),dy,X(x1),Z(y1),dy+Y(z1)]; SOL.down.push(s); FIX.down.push(f); M.sol.push(s); M.fix.push(f); };
    { const S=up, rn=(S.y1-S.y0)/S.n, a=X(S.x0), b=X(S.x1);
      for(let k=1;k<=S.n;k++){ const yA=S.y1-k*rn, yB=S.y1-(k-1)*rn, h=Y(k*S.rise)+dy, h0=Y((k-1)*S.rise)+dy;
        quad([a,h,Z(yB)],[b,h,Z(yB)],[b,h,Z(yA)],[a,h,Z(yA)],(k&1)?ST:ST2); quad([a,h0,Z(yB)],[b,h0,Z(yB)],[b,h,Z(yB)],[a,h,Z(yB)],ST2.map(v=>v*.82));
        for(const x of [S.x0-.2,S.x1])box(x,yA,0,x+.2,yB,k*S.rise+6,ST2); }
      for(const x of [S.x0-.2,S.x1])sol(x,S.y0,x+.2,S.y1,S.n*S.rise+6); }
    if(dn){ const S=dn, rn=(S.y1-S.y0)/S.n, a=X(S.x0), b=X(S.x1), bot=Y(-(S.n*S.rise+24))+dy, top=Y(.3)+dy, z1=Z(S.y1), DK=P0.dark;
      for(let k=1;k<=S.n;k++){ const yA=S.y0+(k-1)*rn, yB=S.y0+k*rn, h=Y(-k*S.rise)+dy, h0=Y(-(k-1)*S.rise)+dy;
        quad([a,h,Z(yB)],[b,h,Z(yB)],[b,h,Z(yA)],[a,h,Z(yA)],(k&1)?ST:ST2); quad([b,h,Z(yA)],[a,h,Z(yA)],[a,h0,Z(yA)],[b,h0,Z(yA)],ST2.map(v=>v*.82)); }
      quad([a,bot,Z(S.y0)],[a,bot,z1],[a,top,z1],[a,top,Z(S.y0)],ST2.map(v=>v*.7)); quad([b,bot,z1],[b,bot,Z(S.y0)],[b,top,Z(S.y0)],[b,top,z1],ST2.map(v=>v*.7));
      const mid=Y(-S.rise*2)+dy; quad([b,mid,z1],[a,mid,z1],[a,top,z1],[b,top,z1],ST2.map(v=>v*.6)); quad([b,bot,z1],[a,bot,z1],[a,mid,z1],[b,mid,z1],DK);
      for(const x of [S.x0-.2,S.x1]){ box(x,S.y0,0,x+.2,S.y1+.2,8,ST2); sol(x,S.y0,x+.2,S.y1+.2,8); } box(S.x0,S.y1,0,S.x1,S.y1+.2,8,ST2); sol(S.x0,S.y1,S.x1,S.y1+.2,8); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const sm=new THREE.Mesh(geo,MODS.castleStairMat); sm.receiveShadow=true; sm.castShadow=true; scene.add(sm);
    for(const [,b] of WB)sol(b.x0,b.y0,b.x1,b.y1,R.H);
    const LF=[], light=l=>{ const cm=Math.max(...l.c), Lt=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),22*cm*Math.min(1.2,l.r/5),l.r*TILE*1.4,1.6);
      Lt.position.set(X(l.x),Y(l.z)+dy,Z(l.y)); Lt.userData.i0=Lt.intensity; Lt.userData.grp=G; LITE.recs.push(Lt); M.lights.push(Lt); return Lt; };
    for(const l of K.LAMPS.slice(l0)){ const Lt=light(l); if(l.flick)LF.push(Lt); } K.LAMPS.length=l0;
    light({x:R.cx,y:R.cy,z:70,r:11,c:[.4,.46,.6]});
    FLAME.props(made,X,z=>Y(z)+dy,Z,LF); M.fl=FLAME.src.slice(f0);
    for(const o of scene.children.slice(s0)){ G.add(o); M.objs.push(o); }
    mine=M; cur=n; LITE.t=0; for(const f of HK)f(n); return L; };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const S=CASTLE.stair, top={x:((S.x0+S.x1)/2-72)*TILE,z:(S.y0-.5+77)*TILE};
  const bnd=n=>{ const B=lot(n); return {x0:X(B.x0),x1:X(B.x1),z0:Z(B.y0),z1:Z(B.y1)}; };
  const go=async(n,how)=>{ if(busy)return; busy=true; await FADE.run(n?(cur||how==='load'&&n>1?'':'ENTERING ')+'DUNGEON — LEVEL '+n:'LEAVING DUNGEON',async()=>{
    if(n){ await LOAD('dungeon'); const L=build(n), a=how==='below'?L.atDn:L.atUp; if(how!=='load'){ UI.goTo(a.x,a.z,'down'); heading=a.h; } BOUND=bnd(n); }
    else{ clear(); UI.goTo(top.x,top.z,'up'); heading=Math.PI; }
    if(typeof PH!=='undefined')PH.hd=heading; },{hold:140}); busy=false; };
  MODS.dunDoor=(py,p)=>{ if(busy||UI.freeCam||METRO.doorBusy()||(typeof RAG!=='undefined'&&RAG.on))return; const m=LVL==='down'?lotAt(p.x,p.z):0;
    if(!m){ if(cur&&!busy)clear(); if(LVL!=='down'){ const gx=p.x/TILE+72, gy=p.z/TILE-77; if(gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1)go(1,'top'); } return; }
    if(m!==cur)return go(m,'load');
    const L=lay(cur), gx=iX(p.x), gy=iZ(p.z); if(tread(L.up,gx,gy))go(cur-1,'below'); else if(tread(L.dn,gx,gy))go(cur+1,'top'); };
  MODS.dungeon={get B(){ return lot(cur||1); },ground,inside:(x,z)=>lotAt(x,z)>0,bound:(x,z)=>bnd(lotAt(x,z)||1),arrive:n=>lay(n).atUp,lay,hook:f=>HK.push(f),tick(){}};
  window.DUNGEON={get level(){ return cur; },go:n=>go(Math.max(0,Math.min(NL,n|0)),'top'),spawn:async n=>{ if(n&&n!==cur){ await go(n,'top'); } return SKELGO(); },levels:NL};
  window.DUNDBG=()=>({level:cur,lv:LVL,busy,lot:typeof pos!=='undefined'?lotAt(pos.x,pos.z):0,objs:mine?mine.objs.length:0,lights:mine?mine.lights.length:0,sol:mine?mine.sol.length:0,
    tris:mine?mine.objs.reduce((a,o)=>{ let t=0; o.traverse(c=>{ if(c.geometry&&c.geometry.attributes.position)t+=(c.geometry.index?c.geometry.index.count:c.geometry.attributes.position.count)/3; }); return a+t; },0):0,skel:!!SKELGO.p}); }
