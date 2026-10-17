// ---- THE APARTMENT HOUSE (owner, 17 Oct 2026: "i want the apartment building from the last old tsfm repo and flesh it out. thats where the
// resident will live. i want them all to have fire escapes on back and front windows. 2 apartments per floor. real textures and nyc design,
// lived in"): the old game's walk-up brought over (its plan: 21-world-map-5-land's hall between two apartments a floor, each a living room, a
// kitchen, a bathroom and a bedroom; its furniture 26-apartments' pieces, the game's own studio set, made by the game's catalog as the bodega's
// things are) and rebuilt as a New York tenement on the lot west of the subway stairs: five storeys of red brick (the owner's brick texture,
// shrunk to the game's texels), stone sills and lintels, a storey band, the cornice; three windows a floor front and back, their glass lit warm
// behind curtains where someone's home; a fire escape across the front and the back on every floor up, with its ladders; the door at the side
// with its stoop, lamp and number; drainpipes, window ACs; on the roof the water tower, the bulkhead, vents, an antenna, pots.
// Inside: the entrance passage to the stair hall in the middle, a straight flight each floor (switching back), two apartments a floor (front and
// back, mirror images): the door into the kitchen as a railroad flat has it, the living room across the windows, the bathroom, the bedroom;
// every room furnished and a little different (a poster or two, a vacuum left out, a washing machine, a radio); plaster walls, a baseboard,
// tiles in the kitchen and bath, boards in the rooms; warm lights. When you're inside, the floors above you and the roof are cut away and the
// walls between you and the camera cut to their feet (the bodega's way); the floor under you is the one you're on (stairs carry you up) ----
const APTS={};
{ const {X,Y,Z,gbox,faceTex,bq,C,facade,FRAME,place}=BOD, {speck,hash}=BOD.g, {MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh}=BOD.K, S=STORY, ST=5, AH=ST*S, W=LSEED.walk, T=.1;
  const A={x0:50.4,x1:57.9,y0:W-14,y1:W}, m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, hm=(H.y0+H.y1)/2, DW=.78, DH=94;   // the lot, the hall, the doors 1.56 x 94 as the bodega's
  APTS.A=A; APTS.H=H; const TEX={}; for(const k in TEXTURES)TEX[k]={w:TEXTURES[k].w,h:TEXTURES[k].h,c:Uint8Array.from(atob(TEXTURES[k].c),c=>c.charCodeAt(0))};   // (the owner's textures, their bytes)
  const tex=(nm,i,j)=>{ const t=TEX[nm], k=(((j%t.h)+t.h)%t.h)*t.w+(((i%t.w)+t.w)%t.w), c=t.c; return [c[k*3],c[k*3+1],c[k*3+2]]; };
  // ---- the outside: the owner's brick, a concrete plinth, a stone band each storey, the cornice; round a hole its lintel and sill
  const STONE=[176,168,152], brick=(u,z,f,cap,holes)=>{ if(z>=cap-20)return facade(0,1,u,0,z,f,cap);
    if(z<10)return sh(speck(tex('concrete',Math.floor(u*24),Math.floor(z)),u,z/24,95),f*(z<1?.8:1));
    const s=z%S; if(z>S-4&&(s<4||s>=S-2)){ const t=sh(STONE,f); return s>=S-2?sh(t,.6):s===3?sh(t,1.12):s===0?sh(t,.8):t; }
    for(const h of holes){ if(u>h.a0-.14&&u<h.a1+.14){ if(z>=h.z1&&z<h.z1+5)return sh(STONE,f*(z===h.z1+4?1.1:.95)); if(z<h.z0&&z>=h.z0-4)return sh(STONE,f*(z===h.z0-1?1.1:.9)); } }
    return sh(tex('brick',Math.floor(u*24),Math.floor(z)),f*(.96+.08*hash(Math.floor(u*24/9),Math.floor(z/5),11))); };
  // ---- inside: plaster over a baseboard; tiles to the shoulder in a kitchen or a bath
  const plaster=(u,z,f,tiled)=>{ if(z<6)return sh([96,70,48],f*(z<1?.7:z>4?1.15:1)); if(z>S-10)return sh([200,196,186],f*.9);
    if(tiled&&z<60){ const i=Math.floor(u*24/9), k=Math.floor((z-6)/9), g=(u*24/9-i)<.12||((z-6)/9-k)<.12; return sh(g?[190,188,180]:(i+k)&1?[236,234,226]:[228,226,216],f); }
    const n=hash(Math.floor(u*24),Math.floor(z),33); return sh(n<.04?[206,200,186]:n>.97?[224,218,206]:[214,208,196],f); };
  // ---- a wall: ax 'x' (along x at y=at) or 'y'; its holes (door: to the floor); painted both sides (paint(side, u, z)); a separate mesh with its
  // cut planes when it cuts away (the outer walls and the rooms' walls), else into the batch
  const HP=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); APTS.HP=HP; const WALLM=[];
  const pt=(w,s,a,z)=>w.ax==='x'?[X(a),Y(z),Z(w.at+s*T)]:[X(w.at+s*T),Y(z),Z(a)];
  const wallMesh=(a,b,c,d,tx,planes)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3)); g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals();
    const mk=cv=>{ const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.colorSpace=THREE.SRGBColorSpace; return t; };
    const mat=new THREE.MeshLambertMaterial({map:mk(tx.map.image),alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:planes,...(tx.em?{emissiveMap:mk(tx.em.image),emissive:0xffffff,emissiveIntensity:1.2}:{})});
    const me=new THREE.Mesh(g,mat); me.receiveShadow=true; me.castShadow=true; scene.add(me); WALLM.push(me); return me; };
  function wall(w){ const as=new Set([w.a0,w.a1]), zs=new Set([w.z0,w.z1]); for(const h of w.holes){ as.add(Math.max(w.a0,h.a0)); as.add(Math.min(w.a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
    const Aa=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q), pl=w.cut?new THREE.Plane(new THREE.Vector3(0,-1,0),1e6):null, planes=pl?[pl,HP]:[HP];
    for(const s of [-1,1])for(let i=0;i+1<Aa.length;i++)for(let j=0;j+1<Zs.length;j++){ const a0=Aa[i], a1=Aa[i+1], z0=Zs[j], z1=Zs[j+1];
      if(w.holes.some(h=>(a0+a1)/2>h.a0&&(a0+a1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
      const tx=faceTex((a1-a0)*24,z1-z0,(ii,jj)=>C(w.paint(s,a0+(ii+.5)/24,z1-jj-.5)));
      if(w.cut)wallMesh(pt(w,s,a0,z0),pt(w,s,a1,z0),pt(w,s,a1,z1),pt(w,s,a0,z1),tx,planes); else bq(pt(w,s,a0,z0),pt(w,s,a1,z0),pt(w,s,a1,z1),pt(w,s,a0,z1),tx,'A'); }
    // the holes' edges and the top
    const fr=(P,len,hg,c)=>bq(...P,faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),'A'), e=(a,z,o)=>w.ax==='x'?[X(a),Y(z),Z(w.at+o)]:[X(w.at+o),Y(z),Z(a)];
    fr([e(w.a0,w.z1,-T),e(w.a1,w.z1,-T),e(w.a1,w.z1,T),e(w.a0,w.z1,T)],w.a1-w.a0,5,w.cut?STONE:[200,196,186]);
    for(const h of w.holes){ for(const a of [h.a0,h.a1])fr([e(a,h.z0,-T),e(a,h.z0,T),e(a,h.z1,T),e(a,h.z1,-T)],.2,h.z1-h.z0,h.door?[88,62,44]:FRAME);
      fr([e(h.a0,h.z1,-T),e(h.a1,h.z1,-T),e(h.a1,h.z1,T),e(h.a0,h.z1,T)],h.a1-h.a0,5,h.door?[88,62,44]:FRAME); if(h.z0>0)fr([e(h.a0,h.z0,-T),e(h.a1,h.z0,-T),e(h.a1,h.z0,T),e(h.a0,h.z0,T)],h.a1-h.a0,5,FRAME); }
    if(pl)cutWalls.push({pl,nx:w.nx,nz:w.nz,foot:Y(w.foot||8),when:()=>APTS.in}); return w; }
  // ---- the glass in a window: a pane lit warm behind curtains where someone is home (glows), else dark with the room's dim behind it
  const pane=(w,h,lit,seed)=>{ const cur=hash(seed,2,7)<.5, cc=[[220,200,170],[180,120,110],[150,170,200],[230,230,220]][seed%4];
    bq(pt(w,0,h.a0,h.z0),pt(w,0,h.a1,h.z0),pt(w,0,h.a1,h.z1),pt(w,0,h.a0,h.z1),faceTex((h.a1-h.a0)*24,h.z1-h.z0,(i,j)=>{ const W_=(h.a1-h.a0)*24, u=i/W_, bar=Math.abs(u-.5)<.03||Math.abs(j-(h.z1-h.z0)/2)<1.5;
      if(bar)return [40,38,36]; if(cur&&(u<.22||u>.78))return lit?[cc[0]*.8,cc[1]*.8,cc[2]*.8,1]:sh(cc,.35); if(lit)return [255,214,150,1]; return (i+j)%7===0?[54,60,70]:[34,38,46]; }),'A'); };
  // ---- the fire escape: a platform across the outer windows, its railing, the ladder down to the one below (out: which side of the wall it hangs)
  const steel=[52,54,58], ESC=[];
  const escape=(y,out,z,x0,x1,ladder)=>{ const d=.75, Y0=out>0?y:y-d, Y1=out>0?y+d:y, B=(a,b,c,dd,z0,z1,col)=>gbox({x0:a,y0:c,x1:b,y1:dd,z0,z1,c:col,foot:0,top:(u,v)=>(Math.floor(u*8)&1)?sh(col,.8):col},'A');
    B(x0,x1,Y0,Y1,z,z+3,steel); for(const [a,b] of [[x0,x0+.04],[x1-.04,x1]])B(a,b,Y0,Y1,z+3,z+32,steel);
    const Yo=out>0?[Y1-.04,Y1]:[Y0,Y0+.04]; B(x0,x1,Yo[0],Yo[1],z+30,z+33,steel); for(let u=x0+.2;u<x1-.1;u+=.22)B(u,u+.03,Yo[0],Yo[1],z+3,z+30,steel);
    if(ladder){ const lx=x1-.5, Yl=out>0?[Y1-.14,Y1-.1]:[Y0+.1,Y0+.14]; B(lx,lx+.04,Yl[0],Yl[1],z-ladder,z+2,steel); B(lx+.36,lx+.4,Yl[0],Yl[1],z-ladder,z+2,steel); for(let k=z-ladder+6;k<z;k+=9)B(lx,lx+.4,Yl[0],Yl[1],k,k+2,steel); }
    ESC.push([x0,x1,Y0,Y1,z]); };
  // ---- the plan: the outer walls and their holes
  const WIN=(z)=>[A.x0+1.5,m,A.x1-1.5].map(x=>({a0:x-.55,a1:x+.55,z0:z+42,z1:z+94})), holesF=[], holesB=[];
  const door={a0:A.x1-1.0-DW,a1:A.x1-1.0+DW,z0:0,z1:DH,door:true};
  holesF.push(door,...[A.x0+1.5,m].map(x=>({a0:x-.55,a1:x+.55,z0:42,z1:94}))); for(let lv=1;lv<ST;lv++)holesF.push(...WIN(lv*S)); for(let lv=0;lv<ST;lv++)holesB.push(...WIN(lv*S));
  const outer=(id,ax,at,a0,a1,holes,inS,nx,nz)=>wall({id,ax,at,a0,a1,z0:0,z1:AH,holes,cut:true,nx,nz,paint:(s,u,z)=>s===inS?plaster(u,z%S,ax==='x'?.84:.68,false):brick(u,z,ax==='x'?1:.8,AH,holes)});
  outer('front','x',A.y1,A.x0,A.x1,holesF,-1,0,-1); outer('back','x',A.y0,A.x0,A.x1,holesB,1,0,1); outer('west','y',A.x0,A.y0-T,A.y1+T,[],1,1,0); outer('east','y',A.x1,A.y0-T,A.y1+T,[],-1,-1,0);
  let seed=3; for(const h of holesF)if(!h.door)pane({ax:'x',at:A.y1},h,hash(seed++,1,9)<.55,seed); for(const h of holesB)pane({ax:'x',at:A.y0},h,hash(seed++,1,9)<.55,seed);
  for(let lv=1;lv<ST;lv++){ escape(A.y1,1,lv*S+38,A.x0+.9,A.x1-.9,lv===1?70:S-36); escape(A.y0,-1,lv*S+38,A.x0+.9,A.x1-.9,lv===1?70:S-36); }
  // ---- the floors (a slab each storey: boards, tiles in the kitchen and bath, lino in the hall; its ceiling under), and the roof
  const boards=(x,y)=>{ const i=Math.floor(y*8), j=Math.floor(x*.7+i*.37), n=hash(j,i,41); return sh([150,112,76],.86+.22*n+(y*8-i<.08?-.2:0)); };
  const lino=(x,y)=>{ const n=hash(Math.floor(x*12),Math.floor(y*12),43); return n<.1?[96,100,96]:[112,116,110]; };
  const tiles=(x,y)=>{ const i=Math.floor(x*3), j=Math.floor(y*3); return (x*3-i<.06||y*3-j<.06)?[150,150,146]:(i+j)&1?[212,210,200]:[196,194,186]; };
  const roofCol=(x,y)=>{ const n=hash(Math.floor(x*6),Math.floor(y*6),61); return n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const flat=(x0,y0,x1,y1,z,col,up=true)=>bq(...(up?[[X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)]]:[[X(x0),Y(z),Z(y0)],[X(x1),Y(z),Z(y0)],[X(x1),Y(z),Z(y1)],[X(x0),Y(z),Z(y1)]]),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),'A');
  // the rooms of the front apartment (the back's are its mirror in y about the hall's middle); lv 0's bedroom gives up the passage to the door
  const rooms=lv=>{ const x0=A.x0, x1=A.x1, yl=A.y1-3, bx1=lv===0?A.x1-1.5:A.x1; return {liv:{x0,x1:bx1,y0:yl,y1:A.y1},kit:{x0,x1:x0+3.2,y0:H.y1,y1:yl},bath:{x0:x0+3.2,x1:x0+4.6,y0:H.y1,y1:yl},bed:{x0:x0+4.6,x1:bx1,y0:H.y1,y1:yl},pass:lv===0?{x0:bx1,x1,y0:H.y1,y1:A.y1}:null}; };
  const STX=[A.x0+.5,A.x1-.5], STY=[H.y0+.1,H.y0+1.3];   // the flight: along the hall's back, the whole width; up toward +x on even floors
  for(let lv=0;lv<ST;lv++){ const z=lv*S, R=rooms(lv), Ym=y=>2*hm-y;
    { const zf=lv>0?z:1; for(const [r,col] of [[R.liv,boards],[R.bed,boards],[R.kit,tiles],[R.bath,tiles]]){ flat(r.x0,r.y0,r.x1,r.y1,zf,col); flat(r.x0,Ym(r.y1),r.x1,Ym(r.y0),zf,col); }
      if(lv>0){ flat(A.x0,H.y0,A.x1,STY[0],z,lino); flat(A.x0,STY[1],A.x1,H.y1,z,lino); for(const [a,b] of [[A.x0,STX[0]],[STX[1],A.x1]])flat(a,STY[0],b,STY[1],z,lino); } else flat(A.x0,H.y0,A.x1,H.y1,1,lino);   // (the hall, but over the flight below; the ground floor's a hair up, over the lot's grass)
      if(R.pass)flat(R.pass.x0,R.pass.y0,R.pass.x1,R.pass.y1,zf,lino); }
    flat(A.x0,A.y0,A.x1,A.y1,z+S-4,()=>[228,226,220],false);   // the ceiling
    // the flight up from this floor (none from the top): a ramp of treads, its side
    if(lv<ST-1){ const up=lv%2===0, xa=up?STX[0]:STX[1], xb=up?STX[1]:STX[0], tread=(x,y)=>{ const t=Math.abs(x-xa)/(STX[1]-STX[0]), k=Math.floor(t*16), e=t*16-k; return sh(e<.12?[70,54,40]:[128,96,66],.9+.1*(k&1)); };
      bq([X(xa),Y(z),Z(STY[1])],[X(xb),Y(z+S),Z(STY[1])],[X(xb),Y(z+S),Z(STY[0])],[X(xa),Y(z),Z(STY[0])],faceTex((STX[1]-STX[0])*24,(STY[1]-STY[0])*24,(i,j)=>C(tread(xa+(up?1:-1)*(i+.5)/24,0))),'A');
      bq([X(xa),Y(z),Z(STY[1])],[X(xb),Y(z+S),Z(STY[1])],[X(xb),Y(z),Z(STY[1])],[X(xa),Y(z),Z(STY[1])],faceTex((STX[1]-STX[0])*24,S,()=>[110,84,60]),'A');
      gbox({x0:STX[0],x1:STX[1],y0:STY[1],y1:STY[1]+.05,z0:z+40,z1:z+43,c:[70,54,40],foot:0},'A'); }   // (a hand rail along its open side, low: the flight stands at the hall's back)
    // the rooms' walls (cut to their feet between you and the camera, as the outer ones): the hall's two, the living rooms' partitions, the
    // kitchen's and the bathroom's, the passage's; each with its door
    const room=(id,ax,at,a0,a1,holes,tiledA,tiledB,nx,nz)=>wall({id:id+lv,ax,at,a0,a1,z0:z,z1:z+S-4,holes:holes.map(h=>({...h,z0:h.z0+z,z1:h.z1+z})),cut:true,nx,nz,foot:z+8,paint:(s,u,zz)=>plaster(u,zz-z,ax==='x'?.84:.68,s>0?tiledA:tiledB)});
    const dr=a=>({a0:a-DW,a1:a+DW,z0:0,z1:DH,door:true}), yl=R.liv.y0;
    room('hallF','x',H.y1,A.x0+T,A.x1-T,[dr(A.x0+1.5),...(R.pass?[dr(A.x1-.75)]:[])],true,false,0,1); room('hallB','x',H.y0,A.x0+T,A.x1-T,[dr(A.x1-1.5)],false,true,0,-1);
    for(const f of [1,-1]){ const Yf=y=>f>0?y:Ym(y), yL=Yf(yl), s=f>0?1:-1, bx1=R.bed.x1;
      room('liv'+f,'x',yL,A.x0+T,bx1-T,[dr(A.x0+1.6),dr(A.x0+3.9),dr(A.x0+5.4)],f<0,f>0,0,s);
      room('kit'+f,'y',R.kit.x1,Math.min(yL,Yf(H.y1)),Math.max(yL,Yf(H.y1)),[],true,true,1,0); room('bath'+f,'y',R.bath.x1,Math.min(yL,Yf(H.y1)),Math.max(yL,Yf(H.y1)),[],true,false,-1,0);
      if(R.pass&&f>0)room('pass','y',R.pass.x0,H.y1,A.y1-T,[],false,false,-1,0); } }
  flat(A.x0,A.y0,A.x1,A.y1,AH,roofCol); flat(A.x0,A.y0,A.x1,A.y1,AH-4,()=>[228,226,220],false);
  // ---- the things on the walls, the stoop, the roof: the old game's makers (its street kit, the bodega's), painted into the batch
  { const M=MKS, n0=PROPS.length; M.pipe(A.x0+.2,W,AH-6); M.pipe(A.x1-.2,W,AH-6); M.number(A.x1-1.0,W,DH+6,'24'); M.walllamp(A.x1-1.0-DW-.35,W,DH-10); M.meterbox(A.x0+.6,W,30); M.moss(A.x0+.2,A.x0+2.5,W);
    M.ac(A.x0+1.5,W,S*2+42); M.ac(m,W,S*3+42); M.ac(A.x1-1.5,W,S*4+42); M.stoop(A.x1-1.0-.8,W+.1);
    const R=(f,x,y,...a)=>{ const p=f(x,y,AH,W,...a); p.solids=[]; return p; }; R(M.watertank,A.x0+2.2,A.y0+3.5); R(M.vent,A.x1-1.4,A.y1-2.5); R(M.antenna,A.x1-.8,A.y0+1.2); R(M.roofpots,m-1.4,A.y1-1.3); R(M.roofac,m+.6,H.y0+.6);
    gbox({x0:m-.2,x1:m+1.4,y0:H.y0,y1:H.y0+1.4,z0:AH,z1:AH+40,c:[110,66,52],foot:0,fj:(u,zz)=>Math.abs(u-m-.6)<.25&&zz<AH+32?[50,46,44]:brick(u,zz-AH+30,1,1e9,[]),fi:(u,zz)=>brick(u,zz-AH+30,.8,1e9,[]),top:()=>[70,66,62]},'A');   // (the bulkhead over the stairs: the game's, but in the house's own brick)
    for(const p of PROPS.slice(n0)){ BATCH.tag=OBJ('apartments',p.name); for(const b of p.boxes)gbox(b,'A'); } BATCH.tag=null; }
  // ---- THE FURNITURE: the game's studio set by the catalog, each piece made facing a way (STUDIO.face) as 26-apartments does, placed as the
  // bodega's things are (place), its boxes painted into the batch lifted to its floor; what stands on the floor blocks on that floor
  const FD={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}, SOLS=[]; APTS.sol=SOLS; const LIGHTS=[]; APTS.lights=LIGHTS;
  const put=(kind,x,y,d,z,lv,sol)=>{ const f=CATALOG[kind]; if(!f){ console.warn('no',kind); return null; } const n0=PROPS.length; STUDIO.face(d?FD[d]:null,z); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ STUDIO.face(null); } if(!p)return null; place(p,0);
    const add0=BATCH.add, dy=Y(lv*S); BATCH.add=(pos,...r)=>{ for(let i=1;i<18;i+=3)pos[i]+=dy; add0(pos,...r); }; BATCH.tag=OBJ('apartments',p.name); try{ for(const b of p.boxes)gbox(b,'A'); }finally{ BATCH.add=add0; BATCH.tag=null; }
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(bs.length&&sol!==false){ const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))}; SOLS[lv].push([X(r.x0),Z(r.y0),X(r.x1),Z(r.y1)]); }
    PROPS.length=n0; return p; };
  for(let lv=0;lv<ST;lv++){ SOLS[lv]=[]; const R=rooms(lv), x0=A.x0, yl=R.liv.y0, y1=A.y1, hy=H.y1, bx1=R.bed.x1, k=lv*7;
    for(const f of [1,-1]){ const Yf=y=>f>0?y:2*hm-y, Df=d=>f>0?d:d==='N'?'S':d==='S'?'N':d, P=(kind,x,y,d,z,sol)=>put(kind,x,Yf(y),d?Df(d):null,z,lv,sol), v=hash(lv,f+2,5), v2=hash(lv,f+4,6);
      // the living room: the TV on the west wall across the rug from the sofa, the bookcase on the back wall, the desk under the window
      P('TV on a low stand',x0+.32,y1-1.5,'E'); P('rug',x0+1.5,y1-1.5,'E',null,false); P('coffee table',x0+1.5,y1-1.5,'E',null,false); P('sofa',x0+2.75,y1-1.5,'W'); P('bookcase',x0+5.2,yl+.3,'S');
      if(bx1>A.x1-1){ P('desk',bx1-1.2,y1-.8,'N'); P('office chair',bx1-1.2,y1-1.85,'S'); P('home computer',bx1-1.2,y1-.7,'N',null,false); P('radio',bx1-.3,y1-.55,'N',30,false); }
      P('poster',x0+.06,y1-2.5,'E',null,false); if(v>.3)P('wall shelf with plant',x0+.15,y1-.45,'E',null,false); P('floor lamp',x0+4.1,y1-.4,null,null,false); if(v2<.35)P('vacuum',x0+6.3,yl+.4,'W');
      // the kitchen along its back wall, a table for two; the mat inside the door
      P('fridge',x0+.5,hy+.6,'S'); P('stove',x0+1.55,hy+.42,'S'); P('sink and counter',x0+2.6,hy+.42,'S'); if(v2>.6)P('washing machine',x0+2.75,yl-.45,'N'); P('dining table',x0+1.8,yl-.9,'N'); P('stool',x0+1.0,yl-.9,'E'); P('stool',x0+2.6,yl-.9,'W'); P('entrance mat',x0+1.5,hy+.5,'N',null,false);
      // the bathroom, the bedroom
      P('bath',x0+4.15,hy+1.3,'W'); P('toilet',x0+3.65,yl-.45,'N'); P('bathroom sink',x0+3.7,hy+.42,'S'); P('towel rail',x0+3.25,hy+1.9,'E',null,false);
      P('single bed',bx1-.9,hy+1.3,'N'); if(bx1-x0>3)P('wardrobe',x0+4.95,hy+1.3,'E'); if(v>.55&&bx1-x0>3)P('floor lamp',bx1-.4,yl-.4,null,null,false);
      // the lights: the living room's (warm), the kitchen's
      LIGHTS.push({x:X(x0+2.6),y:Y(lv*S+S-14),z:Z(Yf(y1-1.5)),c:0xffd9a8,i:5},{x:X(x0+1.6),y:Y(lv*S+S-14),z:Z(Yf(hy+1.2)),c:0xfff2dc,i:3}); }
    LIGHTS.push({x:X(m),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:3}); }
  // ---- built: the batch (the pieces of this house: lit, clipped above the ceiling you're under), its solids (the outer walls but the door; the
  // rooms' walls and what stands in them, floor by floor), its lights (only on while you're inside, but the door's), the cutaway each frame
  BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,clippingPlanes:[HP]}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[HP],...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})}));
  const AM=Object.values(BATCH.meshes); BATCH.meshes={}; APTS.meshes=AM.concat(WALLM); for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  sol(A.x0-T,A.y1-T,door.a0,A.y1+T,AH); sol(door.a1,A.y1-T,A.x1+T,A.y1+T,AH); sol(A.x0-T,A.y0-T,A.x1+T,A.y0+T,AH); sol(A.x0-T,A.y0,A.x0+T,A.y1,AH); sol(A.x1-T,A.y0,A.x1+T,A.y1,AH);
  // the rooms' walls as solids on their floor (their doors left open)
  for(let lv=0;lv<ST;lv++){ const R=rooms(lv), yl=R.liv.y0, seg=(ax,at,a0,a1,holes)=>{ let a=a0; for(const h of [...holes].sort((p,q)=>p.a0-q.a0)){ if(h.a0>a)SOLS[lv].push(ax==='x'?[X(a),Z(at-T),X(h.a0),Z(at+T)]:[X(at-T),Z(a),X(at+T),Z(h.a0)]); a=h.a1; } if(a1>a)SOLS[lv].push(ax==='x'?[X(a),Z(at-T),X(a1),Z(at+T)]:[X(at-T),Z(a),X(at+T),Z(a1)]); };
    const dr=a=>({a0:a-DW,a1:a+DW}); seg('x',H.y1,A.x0,A.x1,[dr(A.x0+1.5),...(R.pass?[dr(A.x1-.75)]:[])]); seg('x',H.y0,A.x0,A.x1,[dr(A.x1-1.5)]);
    for(const f of [1,-1]){ const Yf=y=>f>0?y:2*hm-y, yL=Yf(yl), ya=Math.min(yL,Yf(H.y1)), yb=Math.max(yL,Yf(H.y1)); seg('x',yL,A.x0,R.bed.x1,[dr(A.x0+1.6),dr(A.x0+3.9),dr(A.x0+5.4)]); seg('y',R.kit.x1,ya,yb,[]); seg('y',R.bath.x1,ya,yb,[]); if(R.pass&&f>0)seg('y',R.pass.x0,H.y1,A.y1,[]); } }
  for(const L of LIGHTS){ const P=new THREE.PointLight(L.c,0,5.5*TILE,1.6); P.position.set(L.x,L.y,L.z); P.userData.i0=L.i; scene.add(P); L.light=P; }
  { const P=new THREE.PointLight(0xffe2b0,LAMPI,6*TILE,LAMPD); P.position.set(X(A.x1-1.0-DW-.35),Y(DH-4),Z(W+.35)); scene.add(P); lamps.push(P); }   // (the door's lamp: the street's, always on)
  // where you stand in it: the floor under you (the flight carries you between floors), which rooms' solids count, the clip above your ceiling
  const SY=Y(S), x0s=X(A.x0), x1s=X(A.x1), z0s=Z(A.y0), z1s=Z(A.y1), sx0=X(STX[0]), sx1=X(STX[1]), sz0=Z(STY[0]), sz1=Z(STY[1]);
  APTS.inside=(x,z)=>x>x0s&&x<x1s&&z>z0s&&z<z1s;
  APTS.floor=()=>Math.max(0,Math.min(ST-1,Math.floor(py/SY+.08)));
  APTS.ground=(x,z)=>{ if(x>sx0&&x<sx1&&z>sz0&&z<sz1){ const lv=Math.min(ST-2,Math.max(0,Math.floor(py/SY+.08))), t=Math.max(0,Math.min(1,lv%2===0?(x-sx0)/(sx1-sx0):(sx1-x)/(sx1-sx0))); return SY*(lv+t); } return SY*APTS.floor(); };
  APTS.in=false; let was=false, lvWas=-1;
  APTS.tick=()=>{ const inside=APTS.inside(pos.x,pos.z), lv=APTS.floor(); APTS.in=inside;
    if(inside!==was||lv!==lvWas){ was=inside; lvWas=lv; HP.constant=inside?SY*lv+SY*.93:1e6; for(const L of LIGHTS)L.light.intensity=inside?L.i:0; return inside?SOL.up.concat(SOLS[lv]):SOL.up; } return null; };   // (what blocks you: this floor's walls and things, or the street's; the loop sets it)
  window.APTSDBG=()=>({in:APTS.in,floor:APTS.floor(),py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],box:[+x0s.toFixed(1),+z0s.toFixed(1),+x1s.toFixed(1),+z1s.toFixed(1)],hall:[+Z(H.y0).toFixed(1),+Z(H.y1).toFixed(1)],door:+X((door.a0+door.a1)/2).toFixed(1)});   // (a test's look)
  MODS.apts=APTS; }
