// ---- THE BODEGA BUILT (bodega.js made its plan from the game's own code): its walls round their door and windows, the glass, the roof, the
// ground (the shop's floor, the sidewalk, the kerb, the street, the grass), every object's boxes painted by the game's painters, the goods on the
// shelves, the lights. Its walls cut down to their foot only while you're inside, as the game does ----
const BODB={};
{ const {X,Y,Z,B0,BODOFF}=BOD, {bodegaWall,grain,speck,COPE,hash}=BOD.g, H=B0.h, KINDS={};
  const inside=()=>BOD.inside(pos.x,pos.z); BODB.inside=inside;
  const paint=(w,s,u,z)=>{ const nx=w.ax==='y'?s:0, ny=w.ax==='x'?s:0, Xw=w.ax==='y'?w.at+s*.1:u, Yw=w.ax==='x'?w.at+s*.1:u;
    return (!w.outer||s===w.inS)?bodegaWall(null,nx,ny,Xw,Yw,z,1):BOD.facade(nx,ny,Xw,Yw,z,1,w.H); };
  const wallPt=(w,s,a,z)=>w.ax==='x'?[X(a),Y(z),Z(w.at+s*.1)]:[X(w.at+s*.1),Y(z),Z(a)];
  // THE WALLS: each face in pieces round its holes, its top, its holes' edges (the frames), the glass in the shop front
  const planes={}; for(const w of BOD.WALLS)planes[w.id]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const glassMat=new THREE.MeshLambertMaterial({color:new THREE.Color(.5,.62,.7),transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false});
  for(const w of BOD.WALLS){ const as=new Set([w.a0,w.a1]), zs=new Set([0,w.H]), kind='W'+w.id;
    for(const h of w.holes){ as.add(Math.max(w.a0,h.a0)); as.add(Math.min(w.a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
    const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
    for(const s of [-1,1])for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const a0=A[i], a1=A[i+1], z0=Zs[j], z1=Zs[j+1];
      if(w.holes.some(h=>(a0+a1)/2>h.a0&&(a0+a1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
      BOD.bq(wallPt(w,s,a0,z0),wallPt(w,s,a1,z0),wallPt(w,s,a1,z1),wallPt(w,s,a0,z1),BOD.faceTex((a1-a0)*24,z1-z0,(ii,jj)=>BOD.C(paint(w,s,a0+(ii+.5)/24,z1-jj-.5))),kind); }
    const pt=(a,z,o)=>w.ax==='x'?[X(a),Y(z),Z(w.at+o)]:[X(w.at+o),Y(z),Z(a)], fr=(P,len,hg,c)=>BOD.bq(...P,BOD.faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind);
    fr([pt(w.a0,w.H,-.1),pt(w.a1,w.H,-.1),pt(w.a1,w.H,.1),pt(w.a0,w.H,.1)],w.a1-w.a0,5,COPE);
    for(const h of w.holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,BOD.FRAME);
      fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,BOD.FRAME); if(h.z0>0)fr([pt(h.a0,h.z0,-.1),pt(h.a1,h.z0,-.1),pt(h.a1,h.z0,.1),pt(h.a0,h.z0,.1)],h.a1-h.a0,5,BOD.FRAME);
      if(h.glass&&!h.door){ const m=new THREE.Mesh(new THREE.PlaneGeometry((h.a1-h.a0)*TILE,Y(h.z1)-Y(h.z0)),glassMat.clone()); m.material.clippingPlanes=[planes[w.id]];
        if(w.ax==='x')m.position.set(X((h.a0+h.a1)/2),Y((h.z0+h.z1)/2),Z(w.at)); else{ m.position.set(X(w.at),Y((h.z0+h.z1)/2),Z((h.a0+h.a1)/2)); m.rotation.y=Math.PI/2; } scene.add(m); } } }
  // THE ROOF (tar, the cope round it), hidden while you're inside
  const roofCol=(x,y)=>{ const n=grain(x,y,61,1.4); return speck(n<.35?[50,50,52]:n>.7?[66,64,62]:[58,57,57],x,y,63); };
  // (a ground wider or deeper than 80 tiles in pieces: the atlas is 2048 texels across, and a wider picture ran over into its next rows, the
  // sidewalk in long streaks from where the street was lengthened: owner, 18 Oct 2026, "the sidewalk is long streaks instead of tiles")
  const flat=(x0,y0,x1,y1,z,col,kind,S)=>{ if(x1-x0>80||y1-y0>80){ for(let a=x0;a<x1;a+=80)for(let b=y0;b<y1;b+=80)flat0(a,b,Math.min(x1,a+80),Math.min(y1,b+80),z,col,kind,S); return; } return flat0(x0,y0,x1,y1,z,col,kind,S); };
  const flat0=(x0,y0,x1,y1,z,col,kind,S)=>{ const X=S?BOD.XS:BOD.X, Y=S?BOD.YS:BOD.Y, Z=S?BOD.ZS:BOD.Z; return BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),kind); };   // (S: on the street, its size as it was; else the building's)
  // (row 0 of the picture at y0, as bq lays it: it was painted from y1, every ground mirrored front to back, and with it the holes for the
  // stairs down: the Metro's opening drew as grass over the flight and a hole behind it, 18 Oct 2026)
  flat(B0.x0,B0.y0,B0.x1,B0.y1,H,roofCol,'R');
  // THE GROUND, and the kerbs' faces down to the street
  for(const g of BOD.grounds)flat(g.x0,g.y0,g.x1,g.y1,g.z,g.col,'G',!g.bld);
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS; for(const k of BOD.kerbs){ const P=(a,z)=>k.ax==='y'?[X(k.at),Y(z),Z(a)]:[X(a),Y(z),Z(k.at)]; for(let a0=k.a0;a0<k.a1;a0+=80){ const a1=Math.min(k.a1,a0+80), H=k.z1-k.z0; BOD.bq(P(a0,k.z0),P(a1,k.z0),P(a1,k.z1),P(a0,k.z1),BOD.faceTex((a1-a0)*24,H,(i,j)=>BOD.kerbFaceAt(k,a0+(i+.5)/24,H-1-j,H)),'G'); } }   // (a drain's inlet where it has one: bodega.js)
    // (the rounded corners' curves, owner 18 Oct 2026, "rounded": each a few straight pieces along its arc, the granite's joints carried round it)
    for(const k of BOD.kerbArcs){ const H=k.z1-k.z0; let s=0; for(let i=0;i+1<k.P.length;i++){ const [x0,y0]=k.P[i], [x1,y1]=k.P[i+1], L=Math.hypot(x1-x0,y1-y0), s0=s; s+=L;
      BOD.bq([X(x0),Y(k.z0),Z(y0)],[X(x1),Y(k.z0),Z(y1)],[X(x1),Y(k.z1),Z(y1)],[X(x0),Y(k.z1),Z(y0)],BOD.faceTex(L*24,H,(ii,j)=>BOD.g.kerbFace(k.P[0][0]*7+s0+(ii+.5)/24,H-1-j,H)),'G'); } } }   // (in lengths of 80 tiles at most: the atlas's width; its granite lengths, lit top, grimy foot: gamekit.js)   // (a kerb along x, or along y: the Avenue's)
  // THE KERB RAMPS (bodega.js's BOD.ramps; owner, 18 Oct 2026, "go all"): each a slope from the road's level at the kerb's line up to the
  // sidewalk RPD in, its picture the ramp's (the warning pad at its foot), and the two triangles of kerb face closing its sides
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS, {RP,D,col}=BOD.ramps, RD=BOD.RD, H=-RD;
    for(const r of RP){ const P=(u,w,z)=>{ const q=r.ax==='x'?[u,r.e+r.dir*w]:[r.e+r.dir*w,u]; return [X(q[0]),Y(z),Z(q[1])]; }, W=r.u1-r.u0;
      const a=P(r.u0,0,RD), b=P(r.u1,0,RD), c=P(r.u1,D,0), d=P(r.u0,D,0), up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0, tx=BOD.faceTex(W*24,D*24,(i,j)=>col((i+.5)/24,D-(j+.5)/24,W));   // (row 0 along the top edge, as bq lays it)
      if(up)BOD.bq(a,b,c,d,tx,'G'); else BOD.bq(b,a,d,c,tx,'G');   // (wound so its normal is up, as the ground's: the lying snow reads it, map-pre.js)
      for(const u of [r.u0,r.u1])BOD.bq(P(u,0,RD),P(u,D,0),P(u,D,0),P(u,0,0),BOD.faceTex(D*24,H,(i,j)=>BOD.g.kerbFace(u*7+i/24,H-1-j,H)),'G'); } }
  // THE STREET'S SIGNS (bodega.js's BOD.signs; owner, 18 Oct 2026, "NYC markings and street signs"): thin boxes in the street's tiles (z art
  // px), every face painted: a blade's or a plate's words in a 3x5 pixel letter, read left to right from either side (the way along a face, r, is
  // its normal turned a quarter: (ny, -nx), as the game's boxes read); a texel left empty is cut out (the batch's alpha test: the STOP octagon)
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS, G3={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',
      G:'011100101101011',H:'101101111101101',I:'111010010010111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',
      P:'110101110100100',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',Y:'101101010010010',
      2:'110001010100111',5:'111100110001110'};
    const txt=(s,i,j,sc=1)=>{ i=Math.floor(i/sc); j=Math.floor(j/sc); const c=Math.floor(i/4), g=G3[s[c]]; return !!g&&i%4<3&&j>=0&&j<5&&g[j*3+i%4]==='1'; }, tw=(s,sc=1)=>(s.length*4-1)*sc;
    const sbox=(x0,y0,x1,y1,z0,z1,face,c)=>{ const H=Math.max(1,Math.round(z1-z0)), F=(nx,ny,w)=>(i,j)=>face?face(nx,ny,i,j,Math.max(1,Math.round(w*24)),H):c;
      for(const nx of [-1,1]){ const x=nx<0?x0:x1; BOD.bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],BOD.faceTex((y1-y0)*24,H,F(nx,0,y1-y0)),'L'); }
      for(const ny of [-1,1]){ const y=ny<0?y0:y1; BOD.bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],BOD.faceTex((x1-x0)*24,H,F(0,ny,x1-x0)),'L'); }
      BOD.bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,()=>c),'L'); };
    // the column from the reader's left on a face (gbox lays column 0 at the far end of r): i counts from that end, so turn it round
    const GALV=[150,154,158], pole=(x,y,h)=>sbox(x-.04,y-.04,x+.04,y+.04,0,h,(nx,ny,i,j,w,H)=>j<3?[120,124,128]:H-j<6?[110,112,114]:i===0?[172,176,180]:GALV,GALV);
    // a plate along the axis whose normal is n ([1,0]: the plate across x, its faces to +x and -x), w tiles wide, z0..z1; paint(u, row, W, H) both faces
    const plate=(x,y,n,w,z0,z1,paint)=>{ const t=.02, edge=[96,100,104], P=(nx,ny,i,j,W,H)=>(n[0]&&nx||n[1]&&ny)?paint(W-1-i,j,W,H):edge;
      n[0]?sbox(x-t,y-w/2,x+t,y+w/2,z0,z1,P,edge):sbox(x-w/2,y-t,x+w/2,y+t,z0,z1,P,edge); };
    const GRN=[22,104,62], WH=[236,238,232], RED=[196,36,40], BLK=[24,24,26];
    const blade=s=>(u,j,W,H)=>{ if(j===0||j===H-1||u===0||u===W-1)return WH; const o=Math.floor((W-tw(s))/2); return txt(s,u-o,j-1-Math.floor((H-7)/2))&&u>=o?WH:GRN; };
    BATCH.tag=OBJ('street','street signs');
    for(const g of BOD.signs){ const {x,y}=g;
      if(g.kind==='name'){ const o=g.np?48:0; if(!g.np){ pole(x,y,124); sbox(x-.05,y-.05,x+.05,y+.05,124,127,null,GALV); } plate(x,y,[0,1],1.75,104+o,113+o,blade(g.ax)); plate(x,y,[1,0],1.75,114+o,123+o,blade(g.ay)); }   // (np: on the traffic light's pole, higher, dress.js)
      else if(g.kind==='stop'){ pole(x,y,82); plate(x,y,g.n,.8,82,103,(u,j,W,H)=>{ const cx=(W-1)/2, cy=(H-1)/2, dx=Math.abs(u-cx)/cx, dy=Math.abs(j-cy)/cy; if(dx+dy>1.45)return null; if(dx>.9||dy>.9||dx+dy>1.3)return WH;
          const o=Math.floor((W-tw('STOP'))/2); return txt('STOP',u-o,j-Math.floor((H-5)/2))&&u>=o?WH:RED; }); }
      else if(g.kind==='nopark'){ pole(x,y,88); plate(x,y,g.n,.55,70,88,(u,j,W,H)=>{ if(u===0||j===0||u===W-1||j===H-1)return RED; const cx=(W-1)/2, cy=(H-1)/2, r=Math.hypot((u-cx)*1.2,j-cy);
          if(r>4.6&&r<6.2||r<6.2&&Math.abs((u-cx)*1.2+(j-cy))<1.1)return RED; return txt('P',u-Math.floor(cx-1),j-Math.floor(cy-2))&&u>=Math.floor(cx-1)?BLK:WH; }); }
      else if(g.kind==='speed'){ pole(x,y,92); plate(x,y,g.n,1,62,92,(u,j,W,H)=>{ if(u===0||j===0||u===W-1||j===H-1)return BLK; if(u===1||j===1||u===W-2||j===H-2)return WH;
          for(const [s,r,sc] of [['SPEED',3,1],['LIMIT',9,1],['25',16,2]]){ const o=Math.floor((W-tw(s,sc))/2); if(u>=o&&txt(s,u-o,j-r,sc))return BLK; } return WH; }); } }
    BATCH.tag=null; }
  // THE OBJECTS: every box of every one, painted by the game's own painters, into the atlas
  BOD.paintProps();
  BATCH.cast=true;
  BATCH.build((k,map,emap)=>{ const pl=k[0]==='W'||k[0]==='H'?planes[k.slice(1)]:null, cp=pl?{clippingPlanes:[pl]}:{};
    if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,...cp});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.4}:{}),...cp}); });
  BATCH.cast=false; Object.assign(KINDS,BATCH.meshes); BATCH.meshes={};
  if(KINDS.G)KINDS.G.castShadow=false;
  if(KINDS.U){ const O=BOD.O, zs=Object.values(O).filter(p=>/fluorescent tube/.test(p.name||'')).flatMap(p=>p.boxes.map(b=>b.z0)); OVERHEAD.push({o:KINDS.U,y:BOD.Y(Math.min(...zs))}); }   // (the tubes: shown only from under them)
  BODB.roof=[KINDS.R].filter(Boolean);
  // the cutaway: each wall (and what hangs on it) cut to its foot when it stands between you and the camera, while you're inside
  const NRM={front:[0,-1],back:[0,1],west:[1,0],east:[-1,0],office:[0,1]};
  for(const w of BOD.WALLS){ const me=KINDS['W'+w.id]; if(me)cutWalls.push({pl:planes[w.id],nx:NRM[w.id][0],nz:NRM[w.id][1],foot:Y(8),me,when:inside}); }
  // THE GOODS ON THE SHELVES (47-physics-5-goods' rows: along each fixture from one end, at its front, on each shelf; the counter's), one mesh
  { const {GOOD,GLAY}=BOD, O=BOD.O, list=[];
    const row=(p,f,zpx,items)=>{ const along=f[0]?1:0, a1=along?p.y1:p.x1, yaw=Math.atan2(-f[0],f[1]); let a=(along?p.y0:p.x0)+.08, last=null;
      for(const [k,n,...args] of items){ if(last&&last!==k)a+=.04; last=k;
        for(let i=0;i<n;i++){ const g=GOOD[k](...args), e=g.parts.map(q=>q.t==='box'?[q.h[0],q.h[1]]:[q.r,q.r]), w=Math.max(...e.map(v=>v[0])), d=Math.max(...e.map(v=>v[1]));
          if(a+2*w>a1-.06)return; const fr=f[0]+f[1]>0?(along?p.x1:p.y1)-.04-d:(along?p.x0:p.y0)+.04+d;
          list.push({g,x:along?fr:a+w,y:along?a+w:fr,z:zpx+.05,yaw:yaw+(hash(list.length,k.length,5)-.5)*.12}); a+=2*w+.015; } } };
    const lay=(k,f,zs,rows)=>{ const p=O[k]; if(p)rows.forEach((r,i)=>row(p,f,zs[i],r)); };
    const SZ=[14,32,50,68], FZ=[7,23,36,49];
    for(const i of [1,2,3])lay('fridge'+i,[1,0],FZ,GLAY['fridge'+i]);
    lay('wl1',[1,0],SZ,GLAY.aisle1a); lay('wl2',[1,0],SZ,GLAY.aisle1b); lay('wr1',[-1,0],SZ,GLAY.aisle2a); lay('wb3',[0,1],SZ,GLAY.aisle2b); lay('wl3',[1,0],SZ,GLAY.aisle2a);
    lay('wb1',[0,1],SZ,GLAY.back1); lay('wb2',[0,1],SZ,GLAY.back2);
    { const c=O.counter, F=BOD.food, z=30; for(let i=0;i<3;i++)list.push({g:GOOD.fishfood(),x:F.x-.08+i*.16*(i%2?1:.5),y:F.y+(i===2?.15:0),z,yaw:0});
      const along=c.y1-c.y0>c.x1-c.x0, cx=(c.x0+c.x1)/2, cy=(c.y0+c.y1)/2; let a=(along?c.y0:c.x0)+.95;
      for(const [k,n,...args] of GLAY.counter)for(let i=0;i<n;i++){ list.push({g:GOOD[k](...args),x:along?cx-.12+i*.02:a,y:along?a:cy,z,yaw:along?Math.PI/2:0}); a+=(k==='bananas'?.36:.09); } }
    const P=[], N=[], Cc=[], col=new THREE.Color();
    const emit=(it,pa,tri)=>{ const cs=Math.cos(it.yaw), sn=Math.sin(it.yaw), q=[0,1,2].map(i=>tri[i][0]).reduce((s,v)=>[s[0]+v[0]/3,s[1]+v[1]/3,s[2]+v[2]/3],[0,0,0]);
      const c=pa.mat(q,tri[0][1])||[200,200,200]; col.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace);
      for(const [p,n] of tri){ const lx=p[0]+pa.c[0], ly=p[1]+pa.c[1], lz=p[2]+pa.c[2], gx=it.x+lx*cs-ly*sn, gy=it.y+lx*sn+ly*cs;
        P.push(X(gx),Y(it.z+lz*24),Z(gy)); N.push(n[0]*cs-n[1]*sn,n[2],n[0]*sn+n[1]*cs); Cc.push(col.r,col.g,col.b); } };
    const quad=(it,pa,a,b,c,d,n)=>{ emit(it,pa,[[a,n],[b,n],[c,n]]); emit(it,pa,[[a,n],[c,n],[d,n]]); };
    for(const it of list)for(const pa of it.g.parts){
      if(pa.t==='box'){ const [hx,hy,hz]=pa.h, NZ=6, NA=3;
        for(const [ax,s] of [[0,1],[0,-1],[1,1],[1,-1]]){ const n=ax?[0,s,0]:[s,0,0], ha=ax?hx:hy;
          for(let i=0;i<NA;i++)for(let j=0;j<NZ;j++){ const u0=-ha+2*ha*i/NA, u1=-ha+2*ha*(i+1)/NA, z0=-hz+2*hz*j/NZ, z1=-hz+2*hz*(j+1)/NZ; const pt=(u,z)=>ax?[u,s*hy,z]:[s*hx,u,z]; quad(it,pa,pt(u0,z0),pt(u1,z0),pt(u1,z1),pt(u0,z1),n); } }
        for(const s of [1,-1])quad(it,pa,[-hx,-hy,s*hz],[hx,-hy,s*hz],[hx,hy,s*hz],[-hx,hy,s*hz],[0,0,s]); }
      else if(pa.t==='cyl'){ const r=pa.r, hh=pa.hh, NS=10, NZ=6;
        for(let i=0;i<NS;i++){ const a0=i/NS*2*Math.PI, a1=(i+1)/NS*2*Math.PI, am=(a0+a1)/2, n=[Math.cos(am),Math.sin(am),0];
          for(let j=0;j<NZ;j++){ const z0=-hh+2*hh*j/NZ, z1=-hh+2*hh*(j+1)/NZ; quad(it,pa,[Math.cos(a0)*r,Math.sin(a0)*r,z0],[Math.cos(a1)*r,Math.sin(a1)*r,z0],[Math.cos(a1)*r,Math.sin(a1)*r,z1],[Math.cos(a0)*r,Math.sin(a0)*r,z1],n); }
          for(const s of [1,-1])emit(it,pa,[[[0,0,s*hh],[0,0,s]],[[Math.cos(a0)*r,Math.sin(a0)*r,s*hh],[0,0,s]],[[Math.cos(a1)*r,Math.sin(a1)*r,s*hh],[0,0,s]]]); } } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
    const me=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); me.receiveShadow=true; me.userData.splitOK=true; scene.add(me); }   // (splitOK: its faces inside a room split off and drawn only from in there: src/perf.js)
  // THE LIGHTS: the game's lamps (the tubes, the coolers, the neon, the street light), each where its object put it, its reach and its colour;
  // (no shadows of their own: a lamp in the shop lights only the shop, map-post.js's LITE, so its light stays in the shop)
  for(const l of BOD.LAMPS){ const cm=Math.max(...l.c); if(!(cm>0))continue; const L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),7*cm*Math.min(1.2,l.r/5),l.r*TILE*1.25,1.6);
    L.position.set(X(l.x),Y(l.z),Z(l.y)); L.userData.i0=L.intensity; L.userData.both=!!l.neon; scene.add(L); lamps.push(L); }   // (the neon in the window lights the shop and the pavement both)
}
