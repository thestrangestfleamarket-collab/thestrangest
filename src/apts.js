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
  const A=(o=>({x0:50.4+o.x/BLDK,x1:57.9+o.x/BLDK,y0:W-14+o.y/BLDK,y1:W+o.y/BLDK}))(LAY.o('house')), m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, hm=(H.y0+H.y1)/2, DW=.78, DH=94;   // the lot, the hall, the doors 1.56 x 94 as the bodega's
  const HOLLOW=false;   // (the main apartment building's one floor of boards: superseded by LOBBY below)
  // THE LOBBY PLAN (owner, 18 Oct 2026: "bring back entrance lobby elevator stairs and hallway from 1st game and make it fit in new apartment 1st
  // floor"; his pick: the cottage on the 2nd floor and a hallway with apartment doors on the floors over it): the old game's square, fitted to this
  // house: on the ground floor the lobby across the front (its black and white tiles, the mailboxes, a bench, a plant, the directory), a hall back
  // from it to the core; at the back the core on every floor: the U-shaped stairs (two flights a storey, a landing between: the old game's 21-stairs)
  // and the freight elevator in its shaft (a cabin you stand in and ride, its doors on each floor: the old game's 47-zz-elevator); the 2nd floor
  // THE COTTAGE (the core behind its back wall); the 3rd to 5th floors a carpeted hall with four apartments' doors (shut: not built)
  const LOBBY=true, CORE={st:[0,0,2.55,4.15],el:[5,0,7.5,2.55]};   // (in tiles from the house's back-west corner: the stairwell, the shaft)
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
    if(pl){ const o={pl,foot:Y(w.foot||8),when:()=>APTS.in};
      // (an inner wall has a room on both sides, so its inside is the side you're on: cut when the camera is across it from you; the outer walls keep their one inside)
      if(w.inner){ const at=w.ax==='x'?Z(w.at):X(w.at); if(w.ax==='x'){ o.nx=0; Object.defineProperty(o,'nz',{get:()=>Math.sign(pos.z-at)||1}); } else { o.nz=0; Object.defineProperty(o,'nx',{get:()=>Math.sign(pos.x-at)||1}); } } else { o.nx=w.nx; o.nz=w.nz; }
      cutWalls.push(o); } return w; }
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
  // (the ground floor's inside the cottage's: moss-green plaster in its three greens over an oak skirting, the trim's line at the top; HOLLOW only)
  const moss=(u,z,f)=>{ if(z<6)return sh([110,92,58],f*(z<1?.7:z>4?1.15:1)); if(z>S-6)return sh([162,138,90],f*(z>S-2?.8:1)); const n=hash(Math.floor(u*24/3),Math.floor(z/3),37), m2=hash(Math.floor(u*24),Math.floor(z),38); return sh(n<.3?[67,77,36]:n>.8?[102,112,58]:[85,96,47],f*(m2<.05?.9:1)); };
  const outer=(id,ax,at,a0,a1,holes,inS,nx,nz)=>wall({id,ax,at,a0,a1,z0:0,z1:AH,holes,cut:true,nx,nz,paint:(s,u,z)=>s===inS?(HOLLOW&&z<S?moss(u,z,ax==='x'?.84:.68):plaster(u,z%S,ax==='x'?.84:.68,false)):brick(u,z,ax==='x'?1:.8,AH,holes)});
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
  // THE MAIN APARTMENT BUILDING, HOLLOW (owner, 18 Oct 2026: "i want this to be the main apartment building. the inside is completely empty (no
  // walls, furn, doors etc)"): its outer walls, windows, fire escapes and front door as they were; inside one floor of boards over the whole of it,
  // no rooms' walls, no doors, no floors or ceilings above, two lamps so it isn't black (HOLLOW false: the floors and rooms as they were)
  APTS.floors=HOLLOW?1:ST;
  const SOLS=[]; APTS.sol=SOLS; for(let lv=0;lv<ST;lv++)SOLS[lv]=[];
  if(LOBBY){ const U=u=>A.x0+u, V=v=>A.y0+v, sol=(lv,u0,v0,u1,v1)=>{ const b=[X(U(u0)),Z(V(v0)),X(U(u1)),Z(V(v1))]; SOLS[lv].push([Math.min(b[0],b[2]),Math.min(b[1],b[3]),Math.max(b[0],b[2]),Math.max(b[1],b[3])]); return SOLS[lv][SOLS[lv].length-1]; };
    APTS.U=U; APTS.V=V; APTS.lsol=sol;
    // the floors' pictures: the lobby's black and white tiles, the halls' carpet (a burgundy runner on grey), the cottage's boards, the core's concrete
    const check=(x,y)=>{ const i=Math.floor((x-A.x0)*2), j=Math.floor((y-A.y0)*2), e=((x-A.x0)*2-i)<.07||((y-A.y0)*2-j)<.07; return e?[120,118,112]:(i+j)&1?[30,30,32]:[226,224,216]; };
    const carpet=(x,y)=>{ const u=x-A.x0, n=hash(Math.floor(x*12),Math.floor(y*12),71), run=u>2.95&&u<4.55, edge=Math.abs(u-2.95)<.06||Math.abs(u-4.55)<.06; return edge?[176,140,70]:run?(n<.2?[110,30,36]:[128,36,42]):(n<.2?[92,90,88]:[104,102,98]); };
    const conc=(x,y)=>{ const n=hash(Math.floor(x*10),Math.floor(y*10),73); return n<.2?[118,118,114]:[132,132,128]; };
    // a slab with the core's holes in it (the stairwell's and the shaft's), pieces round them; the ground floor whole
    const slab=(lv,col)=>{ const z=lv?lv*S:1; if(!lv){ flat(A.x0,A.y0,A.x1,A.y1,z,col); return; }
      flat(U(0),V(4.15),U(7.5),V(14),z,col); flat(U(2.55),V(0),U(5),V(4.15),z,conc); flat(U(5),V(2.55),U(7.5),V(4.15),z,conc); };
    const ceil=lv=>{ const z=lv*S+S-4, c=()=>[228,226,220]; if(lv===ST-1)return;   /* (the top floor's ceiling is the roof's underside, below) */ flat(U(0),V(4.15),U(7.5),V(14),z,c,false); flat(U(2.55),V(0),U(5),V(4.15),z,c,false); flat(U(5),V(2.55),U(7.5),V(4.15),z,c,false); };
    // an inside wall: its painted doors (shut, a number on each), its openings; cut to its foot between you and the camera as the outer ones
    const fdoor=(u,z,dd)=>{ for(const d of dd){ if(u>d.a0&&u<d.a1&&z<DH){ const fr=u-d.a0<.08||d.a1-u<.08||z>DH-5; if(fr)return [70,52,38]; if(Math.abs(u-(d.a1-.18))<.05&&Math.abs(z-46)<3)return [200,170,90];
        if(d.n&&Math.abs(u-(d.a0+d.a1)/2)<.16&&Math.abs(z-74)<5)return (Math.floor((u-d.a0)*24)+Math.floor(z))%3===0?[220,200,120]:[96,70,50]; return [110,78,52]; } } return null; };
    const iw=(lv,id,ax,at,a0,a1,holes,dd,nx,nz,look)=>{ const z=lv*S; wall({id:id+lv,ax,at,a0,a1,z0:z,z1:z+S-4,holes:holes.map(h=>({...h,z0:z,z1:z+DH,door:true})),cut:true,inner:true,nx,nz,foot:z+8,
      paint:(sd,u,zz)=>{ const d=fdoor(u,zz-z,dd); return d?sh(d,ax==='x'?.84:.68):look?look(u,zz-z,ax==='x'?.84:.68):plaster(u,zz-z,ax==='x'?.84:.68,false); }}); };
    const wsol=(lv,ax,at,a0,a1,holes)=>{ let a=a0; for(const h of [...holes].sort((p,q)=>p.a0-q.a0)){ if(h.a0>a)(ax==='x'?sol(lv,a-A.x0,at-A.y0-T,h.a0-A.x0,at-A.y0+T):sol(lv,at-A.x0-T,a-A.y0,at-A.x0+T,h.a0-A.y0)); a=h.a1; } if(a1>a)(ax==='x'?sol(lv,a-A.x0,at-A.y0-T,a1-A.x0,at-A.y0+T):sol(lv,at-A.x0-T,a-A.y0,at-A.x0+T,a1-A.y0)); };
    const wainscot=(u,z,f)=>z<6?sh([60,44,34],f):z<40?sh((Math.floor(u*24/6)&1)?[118,84,56]:[126,90,60],f*(z>37?1.15:1)):plaster(u,z,f,false);
    for(let lv=0;lv<ST;lv++){ const z=lv*S;
      slab(lv,lv===0?check:lv===1?boards:carpet); ceil(lv);
      // THE STAIRS: flight A up toward the back (u .15-1.25), the landing across the back, flight B up toward the front (u 1.45-2.55); ten steps a flight
      if(lv<ST-1){ const N=10, L=2.8, h=S/2, step=c=>(x,y)=>c;
        for(let i=0;i<N;i++){ gbox({x0:U(.15),x1:U(1.25),y0:V(4.15-(i+1)*L/N),y1:V(4.15-i*L/N),z0:z,z1:z+(i+1)*h/N,c:[150,146,138]},'A');
          gbox({x0:U(1.45),x1:U(2.55),y0:V(1.35+i*L/N),y1:V(1.35+(i+1)*L/N),z0:z+h-8+i*h/N,z1:z+h+(i+1)*h/N,c:[150,146,138]},'A'); }
        gbox({x0:U(.15),x1:U(2.55),y0:V(.15),y1:V(1.35),z0:z+h-8,z1:z+h,c:[140,136,128]},'A');
        gbox({x0:U(1.25),x1:U(1.45),y0:V(1.35),y1:V(4.15),z0:z,z1:z+h+44,c:[96,70,52]},'A'); }
      gbox({x0:U(2.55),x1:U(2.61),y0:V(.15),y1:V(4.15),z0:z,z1:z+40,c:[60,50,44]},'A');   // (the rail along the stairwell's side)
      sol(lv,1.25,1.35,1.45,4.15); sol(lv,2.53,.15,2.63,4.1); if(lv===ST-1)sol(lv,.15,4.1,1.3,4.25);   // (the wall between the flights, the rail; the top floor: no flight A up)
      // THE SHAFT'S WALLS (its door's leaves and the cabin: below)
      iw(lv,'shaftW','y',U(5),V(0),V(2.55),[],[],1,0,(u,zz,f)=>sh([92,96,102],f)); wsol(lv,'y',U(5),V(0),V(2.55),[]);
      iw(lv,'shaftF','x',V(2.55),U(5),U(7.5),[{a0:U(5.3),a1:U(7.2)}],[],0,1,(u,zz,f)=>zz<DH+10&&u>U(5.2)&&u<U(7.3)?sh([150,152,156],f):sh([92,96,102],f)); wsol(lv,'x',V(2.55),U(5),U(7.5),[{a0:U(5.3),a1:U(7.2)}]);
      if(lv===0){ // the ground floor: the lobby across the front (open to the hall), the hall back to the core; two shut rooms beside the hall
        iw(0,'gL','y',U(2.65),V(5.3),V(8),[],[{a0:V(6),a1:V(7.2),n:1}],1,0); wsol(0,'y',U(2.65),V(5.3),V(8),[]);
        iw(0,'gLf','x',V(8),U(0),U(2.65),[],[{a0:U(.7),a1:U(1.9),n:1}],0,1); wsol(0,'x',V(8),U(0),U(2.65),[]);
        iw(0,'gLb','x',V(5.3),U(0),U(2.65),[],[],0,-1); wsol(0,'x',V(5.3),U(1.3),U(2.65),[]);
        iw(0,'gR','y',U(4.85),V(3.7),V(8),[],[{a0:V(4.6),a1:V(5.8),n:1}],-1,0); wsol(0,'y',U(4.85),V(3.7),V(8),[]);
        iw(0,'gRf','x',V(8),U(4.85),U(7.5),[],[],0,1); wsol(0,'x',V(8),U(4.85),U(7.5),[]);
        iw(0,'gRb','x',V(3.7),U(4.85),U(7.5),[],[],0,-1); wsol(0,'x',V(3.7),U(4.85),U(7.5),[]); }
      else if(lv===1){ // the cottage's back wall: the core behind it, a door through it in the middle
        iw(1,'cot','x',V(5.3),U(0),U(7.5),[{a0:U(3.05),a1:U(4.45)}],[],0,1,(u,zz,f)=>zz<S-6&&zz>5?sh([85,96,47],f*(hash(Math.floor(u*8),Math.floor(zz/3),37)<.3?.85:1)):sh([110,92,58],f)); wsol(1,'x',V(5.3),U(0),U(7.5),[{a0:U(3.05),a1:U(4.45)}]); }
      else { // the halls: walls either side from the core's front to the front, two apartments' doors in each, numbered
        const nm=lv+1;
        iw(lv,'hL','y',U(2.65),V(5.3),V(14),[],[{a0:V(7),a1:V(8.2),n:1},{a0:V(11.2),a1:V(12.4),n:1}],1,0,wainscot); wsol(lv,'y',U(2.65),V(5.3),V(14),[]);
        iw(lv,'hLb','x',V(5.3),U(0),U(2.65),[],[],0,-1,wainscot); wsol(lv,'x',V(5.3),U(1.3),U(2.65),[]);
        iw(lv,'hR','y',U(4.85),V(3.7),V(14),[],[{a0:V(6.2),a1:V(7.4),n:1},{a0:V(11.2),a1:V(12.4),n:1}],-1,0,wainscot); wsol(lv,'y',U(4.85),V(3.7),V(14),[]);
        iw(lv,'hRb','x',V(3.7),U(4.85),U(7.5),[],[],0,-1,wainscot); wsol(lv,'x',V(3.7),U(4.85),U(7.5),[]); } }
    // the lobby's things: the mailboxes on the west wall (brass, a grid of little doors), a bench, a plant in a pot, the directory by the hall
    for(let r=0;r<4;r++)for(let c=0;c<5;c++)gbox({x0:U(.02),x1:U(.1),y0:V(9+c*.3),y1:V(9.28+c*.3),z0:40+r*12,z1:50+r*12,c:(r+c)%3?[176,140,64]:[190,152,72]},'A');
    gbox({x0:U(.1),x1:U(.6),y0:V(11.4),y1:V(13),z0:0,z1:18,c:[90,62,40]},'A'); gbox({x0:U(.1),x1:U(.25),y0:V(11.4),y1:V(13),z0:18,z1:40,c:[90,62,40]},'A'); sol(0,.1,11.4,.6,13);
    gbox({x0:U(4.95),x1:U(5.45),y0:V(8.2),y1:V(8.7),z0:0,z1:16,c:[150,80,50]},'A'); gbox({x0:U(4.9),x1:U(5.5),y0:V(8.15),y1:V(8.75),z0:16,z1:44,c:[46,110,52]},'A'); sol(0,4.95,8.2,5.45,8.7);
    gbox({x0:U(2.6),x1:U(2.66),y0:V(8.3),y1:V(9.1),z0:40,z1:78,c:[30,30,34]},'A');
    APTS.floorsBuilt=true; }
  for(let lv=0;lv<ST;lv++){ if(LOBBY)continue; if(HOLLOW){ if(lv===0)flat(A.x0,A.y0,A.x1,A.y1,1,boards); continue; } const z=lv*S, R=rooms(lv), Ym=y=>2*hm-y;
    { const zf=lv>0?z:1; for(const [r,col] of [[R.liv,boards],[R.bed,boards],[R.kit,tiles],[R.bath,tiles]]){ flat(r.x0,r.y0,r.x1,r.y1,zf,col); flat(r.x0,Ym(r.y1),r.x1,Ym(r.y0),zf,col); }
      flat(A.x0,H.y0,A.x1,H.y1,lv>0?z:1,lino);   // (the hall's floor whole: no flight, owner 17 Oct 2026)   // (the hall, but over the flight below; the ground floor's a hair up, over the lot's grass)
      if(R.pass)flat(R.pass.x0,R.pass.y0,R.pass.x1,R.pass.y1,zf,lino); }
    flat(A.x0,A.y0,A.x1,A.y1,z+S-4,()=>[228,226,220],false);   // the ceiling
    // (no flight up: the house emptied, owner, 17 Oct 2026: "empty out the new building completely of furniture and stairs and items. only leave the
    // building doors and fire escapes")
    // the rooms' walls (cut to their feet between you and the camera, as the outer ones): the hall's two, the living rooms' partitions, the
    // kitchen's and the bathroom's, the passage's; each with its door
    const room=(id,ax,at,a0,a1,holes,tiledA,tiledB,nx,nz)=>wall({id:id+lv,ax,at,a0,a1,z0:z,z1:z+S-4,holes:holes.map(h=>({...h,z0:h.z0+z,z1:h.z1+z})),cut:true,inner:true,nx,nz,foot:z+8,paint:(s,u,zz)=>plaster(u,zz-z,ax==='x'?.84:.68,s>0?tiledA:tiledB)});
    const dr=a=>({a0:a-DW,a1:a+DW,z0:0,z1:DH,door:true}), yl=R.liv.y0;
    room('hallF','x',H.y1,A.x0+T,A.x1-T,[dr(A.x0+1.5),...(R.pass?[dr(A.x1-.75)]:[])],true,false,0,1); room('hallB','x',H.y0,A.x0+T,A.x1-T,[dr(A.x1-1.5)],false,true,0,-1);
    for(const f of [1,-1]){ const Yf=y=>f>0?y:Ym(y), yL=Yf(yl), s=f>0?1:-1, bx1=R.bed.x1;
      room('liv'+f,'x',yL,A.x0+T,bx1-T,[dr(A.x0+1.6),dr(A.x0+3.9),dr(A.x0+5.4)],f<0,f>0,0,s);
      room('kit'+f,'y',R.kit.x1,Math.min(yL,Yf(H.y1)),Math.max(yL,Yf(H.y1)),[],true,true,1,0); room('bath'+f,'y',R.bath.x1,Math.min(yL,Yf(H.y1)),Math.max(yL,Yf(H.y1)),[],true,false,-1,0);
      if(R.pass&&f>0)room('pass','y',R.pass.x0,H.y1,A.y1-T,[],false,false,-1,0); } }
  flat(A.x0,A.y0,A.x1,A.y1,AH,roofCol); flat(A.x0,A.y0,A.x1,A.y1,AH-4,()=>[228,226,220],false);
  // (the things on its walls, its stoop, the things on its roof and the stairs' bulkhead: gone with the rest, owner, 17 Oct 2026)
  // ---- THE FURNITURE: the game's studio set by the catalog, each piece made facing a way (STUDIO.face) as 26-apartments does, placed as the
  // bodega's things are (place), its boxes painted into the batch lifted to its floor; what stands on the floor blocks on that floor
  const FD={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}; const LIGHTS=[]; APTS.lights=LIGHTS;
  const put=(kind,x,y,d,z,lv,sol)=>{ const f=CATALOG[kind]; if(!f){ console.warn('no',kind); return null; } const n0=PROPS.length; STUDIO.face(d?FD[d]:null,z); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ STUDIO.face(null); } if(!p)return null; place(p,0);
    const add0=BATCH.add, dy=Y(lv*S); BATCH.add=(pos,...r)=>{ for(let i=1;i<18;i+=3)pos[i]+=dy; add0(pos,...r); }; BATCH.tag=OBJ('apartments',p.name); try{ for(const b of p.boxes)gbox(b,'A'); }finally{ BATCH.add=add0; BATCH.tag=null; }
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(bs.length&&sol!==false){ const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))}; SOLS[lv].push([X(r.x0),Z(r.y0),X(r.x1),Z(r.y1)]); }
    PROPS.length=n0; return p; };
  // (the furniture: gone, owner, 17 Oct 2026; the rooms' ceiling lights stay)
  if(LOBBY){ const U=APTS.U, V=APTS.V, L=(lv,u,v,c,i)=>LIGHTS.push({x:X(U(u)),y:Y(lv*S+S-14),z:Z(V(v)),c,i});
    L(0,2,11,0xf6ecd8,8); L(0,5.5,11,0xf6ecd8,8); L(0,3.75,6,0xf2ead6,6); for(let lv=0;lv<ST;lv++)L(lv,3.75,2.2,0xf2ead6,5);   // (the lobby's, the ground hall's, the core's on every floor)
    for(let lv=2;lv<ST;lv++){ L(lv,3.75,7.5,0xf2ead6,6); L(lv,3.75,12,0xf2ead6,6); } }
  for(let lv=0;lv<ST;lv++){ if(LOBBY)continue; if(HOLLOW){ if(lv===0)for(const [fx,i] of [[.3,8],[.7,8]])LIGHTS.push({x:X(A.x0+(A.x1-A.x0)*fx),y:Y(S-14),z:Z(hm),c:0xf2ead6,i}); continue; } const R=rooms(lv), x0=A.x0, yl=R.liv.y0, y1=A.y1, hy=H.y1, bx1=R.bed.x1, k=lv*7;
    for(const f of [1,-1]){ const Yf=y=>f>0?y:2*hm-y;
      // the lights: the living room's (warm), the kitchen's
      LIGHTS.push({x:X(x0+2.6),y:Y(lv*S+S-14),z:Z(Yf(y1-1.5)),c:0xffd9a8,i:9},{x:X(x0+1.6),y:Y(lv*S+S-14),z:Z(Yf(hy+1.2)),c:0xfff2dc,i:6}); }
    LIGHTS.push({x:X(m),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:7},{x:X(x0+1.2),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:5},{x:X(A.x1-1.2),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:5}); }   // (brighter, and the hall lit end to end: the upper floors were very dark, 17 Oct 2026)
  // ---- built: the batch (the pieces of this house: lit, clipped above the ceiling you're under), its solids (the outer walls but the door; the
  // rooms' walls and what stands in them, floor by floor), its lights (only on while you're inside, but the door's), the cutaway each frame
  BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,clippingPlanes:[HP]}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[HP],...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})}));
  const AM=Object.values(BATCH.meshes); BATCH.meshes={}; APTS.meshes=AM.concat(WALLM); for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  sol(A.x0-T,A.y1-T,door.a0,A.y1+T,AH); sol(door.a1,A.y1-T,A.x1+T,A.y1+T,AH); sol(A.x0-T,A.y0-T,A.x1+T,A.y0+T,AH); sol(A.x0-T,A.y0,A.x0+T,A.y1,AH); sol(A.x1-T,A.y0,A.x1+T,A.y1,AH);
  // the rooms' walls as solids on their floor (their doors left open)
  for(let lv=0;lv<ST;lv++){ if(HOLLOW||LOBBY)continue; const R=rooms(lv), yl=R.liv.y0, seg=(ax,at,a0,a1,holes)=>{ let a=a0; for(const h of [...holes].sort((p,q)=>p.a0-q.a0)){ if(h.a0>a)SOLS[lv].push(ax==='x'?[X(a),Z(at-T),X(h.a0),Z(at+T)]:[X(at-T),Z(a),X(at+T),Z(h.a0)]); a=h.a1; } if(a1>a)SOLS[lv].push(ax==='x'?[X(a),Z(at-T),X(a1),Z(at+T)]:[X(at-T),Z(a),X(at+T),Z(a1)]); };
    const dr=a=>({a0:a-DW,a1:a+DW}); seg('x',H.y1,A.x0,A.x1,[dr(A.x0+1.5),...(R.pass?[dr(A.x1-.75)]:[])]); seg('x',H.y0,A.x0,A.x1,[dr(A.x1-1.5)]);
    for(const f of [1,-1]){ const Yf=y=>f>0?y:2*hm-y, yL=Yf(yl), ya=Math.min(yL,Yf(H.y1)), yb=Math.max(yL,Yf(H.y1)); seg('x',yL,A.x0,R.bed.x1,[dr(A.x0+1.6),dr(A.x0+3.9),dr(A.x0+5.4)]); seg('y',R.kit.x1,ya,yb,[]); seg('y',R.bath.x1,ya,yb,[]); if(R.pass&&f>0)seg('y',R.pass.x0,H.y1,A.y1,[]); } }
  // ---- THE COTTAGE, EVERYONE'S START (owner, 18 Oct 2026: "i want this to be the default room people start in ... the one with the fire
  // escapes"; "make it anyone's cottage who starts ... fill entire floor of apartment"; his picks: one big cottage room, in the game's pixel style):
  // the old game's Herb Cottage, its own pieces from its own makers ("Preset Herb Cottage 1", the page rooms' kit), set out over the whole ground
  // floor (7.5 x 14 tiles where the cottage was 9 x 12): each piece that stood against a wall still against the same wall, the rest spread with
  // the room; its walls, roof, floor, ivy and door step left out (the house has its own); its window's branch rod with the hanging pothos and its
  // green drapes at every one of the floor's five windows, narrowed to them; the cabinet and the folding screen moved where they'd block nothing
  // (a window, the door). Its candles live flames (fire.js), its lamps the floor's own (lit only while you're in). All in the batch (drawn only
  // near the door: interiors.js)
  if(HOLLOW||LOBBY){ const CL=LOBBY?1:0, CY0=LOBBY?A.y0+5.4:A.y0, dz=Y(CL*S)-Y(0), K=BOD.STOREK, CAT=K.CATALOG, PRE=K.PRESETS['Preset Herb Cottage 1']||[], WX=A.x1-A.x0, WY=A.y1-CY0, E=1.1, n0=K.LAMPS.length, MADE=[];
    APTS.cotLv=CL; APTS.cotS=CL*S;   // (the cottage's floor: the 2nd in the lobby plan; the drone's window and the computer go with it: drone.js)
    const mu=(c,h,L,W)=>c-h<E?c:c+h>L-E?W-(L-c):E+(c-E)*(W-2*E)/(L-2*E);   // (a wall's piece keeps its distance from that wall; the rest spread)
    const put=(k,x,y,rot=0,sx=1)=>{ const f=CAT[k]; if(!f)return null; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null;
      if(sx!==1){ const sc=v=>x+(v-x)*sx; for(const b of p.boxes){ b.x0=sc(b.x0); b.x1=sc(b.x1); } p.x0=sc(p.x0); p.x1=sc(p.x1); if(p.solids)for(const b of p.solids){ b.x0=sc(b.x0); b.x1=sc(b.x1); } }
      p.kind=k; place(p,rot); const add0=BATCH.add; if(dz)BATCH.add=(ps,...r)=>{ for(let i=1;i<18;i+=3)ps[i]+=dz; add0(ps,...r); }; BATCH.tag=OBJ('apartments','cottage: '+k); try{ for(const b of p.boxes)gbox(b,'A'); }finally{ BATCH.add=add0; BATCH.tag=null; } MADE.push(p); return p; };
    const SKIP=/herb cottage (floor|wall|roof)|ivy along|door step|window sill and branch rod|green drapes/, MOVE=LOBBY?{'apothecary cabinet':[A.x1-.06,CY0+5.2,1],'folding screen':[A.x1-.2,A.y1-2.1,1],'framed flower print':[A.x0+1.4,CY0+.03,0],'cottage wall clock':[A.x0+2.62,A.y1-.04,0],'shelf with jars and a candle':[A.x0+5,A.y1-.15,0],'writing desk with a pink lamp':[A.x0+5.6,CY0+.5,0]}:{'apothecary cabinet':[A.x1-.06,A.y0+9.8,1],'folding screen':[A.x1-.2,A.y0+11.9,1],'framed flower print':[A.x0+2.62,A.y0+.03,0],'cottage wall clock':[A.x0+2.62,A.y1-.04,0],'shelf with jars and a candle':[A.x0+5,A.y1-.15,0]};
    for(const [k,x,y] of PRE){ if(SKIP.test(k))continue; if(MOVE[k]){ put(k,...MOVE[k]); continue; } const f=CAT[k]; if(!f)continue; const p0=f(0,0); if(!p0)continue; const cx=A.x0+mu(x,(p0.x1-p0.x0)/2,9,WX), cy=CY0+mu(y,(p0.y1-p0.y0)/2,12,WY); if(LOBBY&&cx>A.x0+2.9&&cx<A.x0+4.6&&cy<CY0+1.6)continue; put(k,cx,cy); }   // (in the lobby plan nothing in the way of the door from the core)
    // the windows' greenery: the branch rod and its pothos, the drapes, each narrowed to its window (back: as made; front: turned to face in)
    for(const [x,back] of LOBBY?[[A.x0+1.5,0],[m,0],[A.x1-1.5,0]]:[[A.x0+1.5,1],[m,1],[A.x1-1.5,1],[A.x0+1.5,0],[m,0]]){ const y=back?A.y0:A.y1; put('window sill and branch rod',x,back?y+.08:y-.08,back?0:2,.56); put('green drapes',x,back?y+.045:y-.045,back?0:2,.6); }
    // the floor's own light warmer for a cottage; its candles' and lamps' light, the strongest six, lit only while you're in
    if(LOBBY){ for(const [u,v] of [[2,4],[5.5,4],[3.75,7.5]])LIGHTS.push({x:X(A.x0+u),y:Y(S+S-14),z:Z(CY0+v),c:0xffd2a0,i:6}); } else for(const L of LIGHTS){ L.c=0xffd2a0; L.i=6; }
    K.LAMPS.slice(n0).filter(l=>!l.off&&l.r>0&&Math.max(...l.c)>0).sort((a,b)=>b.r-a.r).slice(0,6).forEach(l=>{ const cm=Math.max(...l.c); LIGHTS.push({x:X(l.x),y:Y(l.z+CL*S),z:Z(l.y),c:new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm).getHex(),i:5*cm*Math.min(1.2,l.r/5),flame:1}); });
    K.LAMPS.length=n0; APTS.made=MADE;
    // where a new player first stands: in the middle of the cottage, facing the front windows
    APTS.home={x:X(A.x0+WX*.42),z:Z(CY0+WY*.55),y:Y(CL*S)-Y(0),hd:0}; }
  for(const L of LIGHTS){ const P=new THREE.PointLight(L.c,0,(L.flame?4:6.5)*TILE,1.6); P.position.set(L.x,L.y,L.z); P.userData.i0=L.i; P.userData.in=cur=>!!cur&&APTS.in&&P.position.y>cur.y0-.3&&P.position.y<cur.y1-.5; scene.add(P); L.light=P; }   // (in: the whole floor's lamps light your room, not just the one in it: the rooms were dark; map-post.js's LITE)
  if(HOLLOW&&APTS.made&&typeof FLAME!=='undefined'&&FLAME.props)FLAME.props(APTS.made,X,z=>Y(z+(APTS.cotS||0)),Z,LIGHTS.filter(L=>L.flame).map(L=>L.light));   // (the cottage's candles' flames, live, each flickering with its own light)
  // ---- THE ELEVATOR (the old game's freight lift, 47-zz-elevator: "an elevator you can ride up (use real box area that you are in, not just
  // teleport)"): its cabin a real box in the shaft (a steel floor you stand on, walls, a ceiling, its panel), riding up and down at a lift's pace
  // with you on it; on every floor its door's two steel leaves slide open when the cabin is there. A double click on the call button by its door
  // brings it to your floor; step in and its panel comes up: a floor, the leaves shut, up or down it goes, they open. Its door's gap blocks you
  // unless the cabin's there with its leaves open. Cost: some 200 triangles, no light, nothing a frame at rest
  let ELV=null;
  if(LOBBY){ const U=APTS.U, V=APTS.V, mat=c=>new THREE.MeshLambertMaterial({color:c,clippingPlanes:[HP]}), bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(Math.abs(w),Math.abs(h),Math.abs(d)),m);
    const STEEL=mat(0x8c9098), DARKS=mat(0x5a5e66), cx=(X(U(5.05))+X(U(7.35)))/2, cz=(Z(V(.2))+Z(V(2.5)))/2, W=Math.abs(X(U(7.35))-X(U(5.05))), D=Math.abs(Z(V(2.5))-Z(V(.2))), fz=Math.sign(Z(V(2.5))-Z(V(.2)))||1, HH=Y(S-16)-Y(0), th=Y(3)-Y(0);
    const cab=new THREE.Group(); const fl=bx(W,th,D,STEEL); fl.position.y=th/2; const bk=bx(W,HH,.04,DARKS); bk.position.set(0,HH/2,-fz*D/2);
    const sl=bx(.04,HH,D,DARKS); sl.position.set(-W/2,HH/2,0); const sr=sl.clone(); sr.position.x=W/2; const cl=bx(W,.04,D,STEEL); cl.position.y=HH;
    const pnl=bx(.03,Y(26)-Y(0),.18,mat(0x2a2c30)); pnl.position.set(W/2-.03,Y(48)-Y(0),fz*D/2-.25);
    for(let i=0;i<ST;i++){ const b=bx(.035,.05,.05,new THREE.MeshBasicMaterial({color:0xffd27a,clippingPlanes:[HP]})); b.position.set(W/2-.05,Y(38+i*5)-Y(0),fz*D/2-.25); cab.add(b); }
    cab.add(fl,bk,sl,sr,cl,pnl); cab.position.set(cx,Y(1),cz); scene.add(cab);
    // each floor's two leaves, and the bit of its solids that is the door's gap
    const dx0=X(U(5.3)), dx1=X(U(7.2)), lw=Math.abs(dx1-dx0)/2, dzl=Z(V(2.55)), leaves=[], gaps=[];
    for(let lv=0;lv<ST;lv++){ const a=bx(lw,Y(DH)-Y(0),.05,STEEL), b=bx(lw,Y(DH)-Y(0),.05,STEEL), y=Y(lv*S+DH/2)+(lv?0:Y(1)-Y(0)); a.position.set(Math.min(dx0,dx1)+lw/2,y,dzl); b.position.set(Math.max(dx0,dx1)-lw/2,y,dzl); scene.add(a,b); leaves.push([a,b]);
      gaps.push(APTS.lsol(lv,5.3,2.45,7.2,2.65)); }
    const G0=gaps.map(g=>g.slice());
    ELV={z:1,to:null,ph:'idle',door:0,wait:0,at:0,last:performance.now(),cab};
    const setDoors=()=>{ for(let lv=0;lv<ST;lv++){ const o=lv===ELV.at?ELV.door:0, [a,b]=leaves[lv]; a.position.x=Math.min(dx0,dx1)+lw/2-o*lw*.95; b.position.x=Math.max(dx0,dx1)-lw/2+o*lw*.95; const g=gaps[lv];
      if(o>.85){ g[0]=g[2]=1e9; } else { g[0]=G0[lv][0]; g[2]=G0[lv][2]; } } };
    ELV.call=lv=>{ if(ELV.ph==='moving'||ELV.ph==='closing')return; if(ELV.at===lv){ ELV.ph='opening'; ELV.wait=0; } else { ELV.to=lv; ELV.ph=ELV.door>0?'closing':'moving'; } };
    ELV.go=lv=>{ if(lv===ELV.at){ ELV.ph='opening'; return; } ELV.to=lv; ELV.ph='closing'; };
    const inCab=()=>{ const x=pos.x, z=pos.z; return Math.abs(py-(Y(ELV.z)-Y(0)))<SY*.5&&x>cx-W/2&&x<cx+W/2&&z>cz-D/2&&z<cz+D/2; };
    // the panel in the cabin (shown while you're in it at rest), the call buttons by each door
    const css=document.createElement('style'); css.textContent='#elevp{position:fixed;right:24px;top:50%;transform:translateY(-50%);font:12px var(--pixel,monospace);color:#ffe3a6;background:#1c1d21;border:2px solid #6a6e78;padding:10px 12px;z-index:15;flex-direction:column;gap:6px;user-select:none}#elevp:not([hidden]){display:flex}#elevp[hidden]{display:none}#elevp .btn{min-width:110px}';
    document.head.appendChild(css); const P=document.createElement('div'); P.id='elevp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Elevator');
    P.innerHTML='<div>ELEVATOR</div>'+[...Array(ST)].map((_,i)=>`<button class="btn" data-f="${i}">${i?['','2ND','3RD','4TH','5TH'][i]+' FLOOR':'LOBBY'}</button>`).join(''); document.body.appendChild(P);
    P.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>ELV.go(+b.dataset.f));
    for(let lv=0;lv<ST;lv++){ const hb=bx(.35,Y(30)-Y(0),.25,new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(U(7.1)),Y(lv*S+48),Z(V(2.7))); scene.add(hb);
      const bt=bx(.06,Y(12)-Y(0),.03,mat(0xcaa860)); bt.position.set(X(U(7.05)),Y(lv*S+48),Z(V(2.58))+fz*.02); scene.add(bt);
      const reg=()=>{ try{ UI.thing({name:'ELEVATOR',obj:hb,reach:1.1*TILE,near:2.4*TILE,tall:1*TILE,act:()=>{ if(APTS.floor()===lv)ELV.call(lv); }}); }catch(e){ setTimeout(reg,400); } }; setTimeout(reg,0); }   // (the menu's UI is made after the places: asked again till it's there)
    ELV.tick=(lv,inside)=>{ const now=performance.now(), dt=Math.min(.1,(now-ELV.last)/1000); ELV.last=now;
      if(ELV.ph==='opening'){ ELV.door=Math.min(1,ELV.door+dt/.9); if(ELV.door>=1){ ELV.ph='open'; ELV.wait=0; } }
      else if(ELV.ph==='open'){ ELV.wait+=dt; if(ELV.wait>6&&!inCab())ELV.ph='closingIdle'; }
      else if(ELV.ph==='closing'||ELV.ph==='closingIdle'){ ELV.door=Math.max(0,ELV.door-dt/.9); if(ELV.door<=0)ELV.ph=ELV.ph==='closing'&&ELV.to!=null?'moving':'idle'; }
      else if(ELV.ph==='moving'){ const tz=ELV.to*S+1, d=tz-ELV.z, st=60*dt; if(Math.abs(d)<=st){ ELV.z=tz; ELV.at=ELV.to; ELV.to=null; ELV.ph='opening'; } else { ELV.z+=Math.sign(d)*st; ELV.at=Math.round((ELV.z-1)/S); } }
      cab.position.y=Y(ELV.z); setDoors();
      P.hidden=!(inside&&inCab()&&(ELV.ph==='open'||ELV.ph==='idle')); };
    window.ELVDBG=()=>({z:ELV.z,ph:ELV.ph,at:ELV.at,door:+ELV.door.toFixed(2)}); window.ELV=ELV; }
  // where you stand in it: the floor under you (the flight carries you between floors), which rooms' solids count, the clip above your ceiling
  const SY=Y(S), x0s=X(A.x0), x1s=X(A.x1), z0s=Z(A.y0), z1s=Z(A.y1), sx0=X(STX[0]), sx1=X(STX[1]), sz0=Z(STY[0]), sz1=Z(STY[1]);
  APTS.inside=(x,z)=>x>x0s&&x<x1s&&z>z0s&&z<z1s;
  APTS.floor=()=>HOLLOW?0:Math.max(0,Math.min(ST-1,Math.floor(py/SY+.08)));
  // the ground under you: a floor's; on the stairs, the flight's slope (which storey's flight: the one whose height there is nearest yours, so
  // up and down run on smoothly); in the shaft, the cabin's floor
  const tz=v=>Z(A.y0+v), ux=u=>X(A.x0+u), su0=Math.min(ux(0),ux(2.55)), su1=Math.max(ux(0),ux(2.55)), sv0=Math.min(tz(0),tz(4.15)), sv1=Math.max(tz(0),tz(4.15));
  const eu0=Math.min(ux(5),ux(7.5)), eu1=Math.max(ux(5),ux(7.5)), ev0=Math.min(tz(0),tz(2.55)), ev1=Math.max(tz(0),tz(2.55)), U1=X(A.x0+1)-X(A.x0), V1=Z(A.y0+1)-Z(A.y0);
  APTS.ground=(x,z)=>{ if(!LOBBY||x==null)return SY*APTS.floor();
    if(x>su0&&x<su1&&z>sv0&&z<sv1){ const u=(x-X(A.x0))/U1, v=(z-Z(A.y0))/V1, h=S/2; let h0;
      if(v<=1.35)h0=h; else if(u<1.35)h0=Math.max(0,Math.min(1,(4.15-v)/2.8))*h; else h0=h+Math.max(0,Math.min(1,(v-1.35)/2.8))*h;
      const lv=Math.max(0,Math.min(ST-2,Math.round((py-(Y(h0)-Y(0)))/SY))); return Y(h0+lv*S)-Y(0)+(lv===0&&h0<1?Y(1)-Y(0):0); }
    if(ELV&&x>eu0&&x<eu1&&z>ev0&&z<ev1)return Y(ELV.z)-Y(0)+.02;
    const f=APTS.floor(); return SY*f+(f===0?Y(1)-Y(0):0); };
  APTS.SY=SY; APTS.in=false; let was=false, lvWas=-1;   // (SY: a floor's height, for the hitboxes' pass: clip.js)
  APTS.tick=()=>{ const inside=APTS.inside(pos.x,pos.z), lv=APTS.floor(); APTS.in=inside; if(ELV)ELV.tick(lv,inside);
    if(inside!==was||lv!==lvWas){ was=inside; lvWas=lv; HP.constant=inside?SY*lv+SY*.93:1e6; for(const L of LIGHTS)L.light.intensity=inside?L.i:0; return inside?SOL.up.concat(SOLS[lv]):SOL[LVL]||SOL.up; } return null; };   /* (out: the level you're on's: a jump from the house to the Metro by the menu had left the street's solids under the platform, 18 Oct 2026) */   // (what blocks you: this floor's walls and things, or the street's; the loop sets it)
  window.APTSDBG=()=>({in:APTS.in,floor:APTS.floor(),py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],box:[+x0s.toFixed(1),+z0s.toFixed(1),+x1s.toFixed(1),+z1s.toFixed(1)],hall:[+Z(H.y0).toFixed(1),+Z(H.y1).toFixed(1)],door:+X((door.a0+door.a1)/2).toFixed(1)});   // (a test's look)
  APTS.rects=lv=>{ if(LOBBY)return [[A.x0,A.y0,A.x1,A.y1]]; if(HOLLOW)return lv?[]:[[A.x0,A.y0,A.x1,A.y1]]; const R=rooms(lv), Ym=y=>2*hm-y, out=[[A.x0,H.y0,A.x1,H.y1]]; for(const k of ['liv','kit','bath','bed','pass']){ const r=R[k]; if(!r)continue; out.push([r.x0,r.y0,r.x1,r.y1]); if(k!=='pass')out.push([r.x0,Ym(r.y1),r.x1,Ym(r.y0)]); } return out; };   // (its rooms on a floor, for ROOMS)
  MODS.apts=APTS; }
