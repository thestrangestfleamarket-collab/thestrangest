// ---- THE BUILDINGS' OUTSIDES MADE REAL (owner, 18 Oct 2026: "Let's add realistic exterior like pipes going up on corners, rooftops being
// realistic, etc."; his pick: all three on the main street): on the apartment house, the bodega and Ghost Street, the things a New York street
// front carries. DRAINPIPES (leaders) up the corners, each from a scupper through the parapet into its leader head, down the wall on brackets
// to a shoe at the pavement (the house's painted dark, the bodega's galvanized, Ghost Street's copper). THE FLAT ROOFS: a parapet with its
// coping round the edge; on the house the wooden water tank on its steel stand (hoops, a pointed lid, a ladder), the stair bulkhead over the
// stairwell with its door, the elevator's machine room over the shaft, two chimneys, mushroom vents and soil stacks, a TV antenna; on the
// bodega its air-conditioning unit (the fan on top), an exhaust fan, a skylight, vent pipes. Ghost Street's tiled roof keeps itself: its
// leaders only. Plain blocks and eight-sided rounds in the flat bands, two instanced draws; some 3,600 triangles; no lamp, no program ----
const ROOFS=window.ROOFS={};
ROOFS.init=()=>{ if(typeof BOD==='undefined'||!MODS.apts||!MODS.apts.A)return;
  const X=BOD.X, Y=BOD.Y, Z=BOD.Z, MH=TILE/.84, MV=BOD.YS(24)/.84;   // (a metre across and up, in the world's units)
  const BX=[], CY=[], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3, col=new THREE.Color();
  // b: a box by its middle and size in world units; c: an eight-sided round (r across, h up) standing on y, its tilt optional
  const b=(x,y,z,sx,sy,sz,c)=>BX.push([x,y,z,sx,sy,sz,c]), cyl=(x,y,z,r,h,c,cone=0)=>CY.push([x,y,z,r,h,c,cone]);
  const rnd=(()=>{ let t=19; return ()=>{ t=(t*16807)%2147483647; return t/2147483647; }; })();
  // a leader down a corner: (x,z) the pipe's foot, (ox,oz) out from the wall, from the ground to the roof's top
  const leader=(x,z,ox,oz,top,c)=>{ const r=.07*MH, h=top-.15*MV; b(x,h/2,z,r*2,h,r*2,c);
    b(x,top-.3*MV,z,.32*MH,.4*MV,.28*MH,c); b(x-ox*.1*MH,top-.05*MV,z-oz*.1*MH,.18*MH,.12*MV,.18*MH,c);   // (the leader head, the scupper's lip over it)
    for(let y=.6*MV;y<h-.6*MV;y+=2.4*MV)b(x-ox*.06*MH,y,z-oz*.06*MH,(ox?.06:.26)*MH,.05*MV,(oz?.06:.26)*MH,0x3a3c3e);   // (its brackets)
    b(x+ox*.12*MH,.08*MV,z+oz*.12*MH,(ox?.36:.16)*MH,.16*MV,(oz?.36:.16)*MH,c); };   // (the shoe, turned out onto the pavement)
  // a parapet round a flat roof, its coping on top; its height in metres
  const parapet=(x0,z0,x1,z1,top,ph,c,cc)=>{ const t=.3*MH, h=ph*MV;
    for(const [ax,az,lx,lz] of [[(x0+x1)/2,z0+t/2,x1-x0,t],[(x0+x1)/2,z1-t/2,x1-x0,t],[x0+t/2,(z0+z1)/2,t,z1-z0-2*t],[x1-t/2,(z0+z1)/2,t,z1-z0-2*t]]){ b(ax,top+h/2,az,lx,h,lz,c); b(ax,top+h+.05*MV,az,lx+.08*MH,.1*MV,lz+.08*MH,cc); } };
  const vent=(x,y,z)=>{ cyl(x,y,z,.18*MH,.55*MV,0x8a8e90); cyl(x,y+.55*MV,z,.3*MH,.18*MV,0x9a9ea0,1); };
  const stack=(x,y,z)=>cyl(x,y,z,.06*MH,.7*MV,0x4a4c4e);
  const box=(xa,xb,za,zb,ya,yb,c)=>b((xa+xb)/2,(ya+yb)/2,(za+zb)/2,Math.abs(xb-xa),yb-ya,Math.abs(zb-za),c);

  // ---- THE APARTMENT HOUSE (its front at A.y1, the street side)
  { const H=MODS.apts, A=H.A, x0=Math.min(X(A.x0),X(A.x1)), x1=Math.max(X(A.x0),X(A.x1)), z0=Math.min(Z(A.y0),Z(A.y1)), z1=Math.max(Z(A.y0),Z(A.y1)), top=Y(5*BOD.K.STORY);
    const fz=Z(A.y1)>Z(A.y0)?1:-1, front=fz>0?z1:z0, back=fz>0?z0:z1, BRK=0x7a3a2c, COP=0xb8b2a6, PIPE=0x3e4448;
    parapet(x0,z0,x1,z1,top,1,BRK,COP);
    for(const [x,ox] of [[x0+.25*MH,-1],[x1-.25*MH,1]]){ leader(x,front+fz*.1*MH,0,fz,top,PIPE); leader(x,back-fz*.1*MH,0,-fz,top,PIPE); }
    const U=u=>X(A.x0+u), Vv=v=>Z(A.y0+v);   // (the plan's tiles: the stairwell at its back-west corner, the shaft beside it: apts.js's CORE)
    // the stair bulkhead: brick over the stairwell, its door on the roof's side, its cap
    box(U(.1),U(2.55),Vv(.15),Vv(4.15),top,top+2.7*MV,BRK); box(U(0),U(2.65),Vv(.05),Vv(4.25),top+2.7*MV,top+2.9*MV,COP);
    box(U(2.55),U(2.6),Vv(1.6),Vv(2.7),top,top+2.1*MV,0x4a3a2c); box(U(2.6),U(2.64),Vv(2.5),Vv(2.6),top+1*MV,top+1.1*MV,0xc8b070);
    // the elevator's machine room over the shaft, a louvre in its side
    box(U(5),U(7.4),Vv(.15),Vv(2.55),top,top+3*MV,BRK); box(U(4.9),U(7.5),Vv(.05),Vv(2.65),top+3*MV,top+3.2*MV,COP);
    for(let k=0;k<4;k++)box(U(5.6),U(6.8),Vv(2.55),Vv(2.6),top+1.2*MV+k*.25*MV,top+1.35*MV+k*.25*MV,0x5a5e62);
    // the water tank on its stand, over the back middle
    const tx=U(3.9), tz=Vv(2.2), r=1.5*MH, legH=3.2*MV;
    for(const [a,c] of [[-1,-1],[1,-1],[-1,1],[1,1]])b(tx+a*r*.7,top+legH/2,tz+c*r*.7,.16*MH,legH,.16*MH,0x2c2e30);
    for(const y of [top+1.1*MV,top+2.3*MV]){ b(tx,y,tz-r*.7,r*1.4,.1*MV,.1*MH,0x2c2e30); b(tx,y,tz+r*.7,r*1.4,.1*MV,.1*MH,0x2c2e30); b(tx-r*.7,y,tz,.1*MH,.1*MV,r*1.4,0x2c2e30); b(tx+r*.7,y,tz,.1*MH,.1*MV,r*1.4,0x2c2e30); }
    b(tx,top+legH+.08*MV,tz,r*2,.16*MV,r*2,0x5a4a38);   // (its deck)
    cyl(tx,top+legH+.16*MV,tz,r,3.4*MV,0x7a5a3a); for(const k of [.5,1.4,2.3,3.1])cyl(tx,top+legH+.16*MV+k*MV,tz,r*1.03,.1*MV,0x2e2a28);
    cyl(tx,top+legH+3.56*MV,tz,r*1.08,1.3*MV,0x3c3430,1);
    for(let k=0;k<9;k++)b(tx+r*1.05,top+legH+.3*MV+k*.42*MV,tz,.04*MH,.04*MV,.4*MH,0x2c2e30); b(tx+r*1.05,top+legH+1.9*MV,tz-.2*MH,.04*MH,3.6*MV,.04*MH,0x2c2e30); b(tx+r*1.05,top+legH+1.9*MV,tz+.2*MH,.04*MH,3.6*MV,.04*MH,0x2c2e30);
    // chimneys on the west wall, their caps; vents and soil stacks; a TV antenna toward the front
    for(const v of [6,10.5]){ box(U(.35),U(1.25),Vv(v),Vv(v+.9),top,top+1.8*MV,0x6e3428); box(U(.25),U(1.35),Vv(v-.1),Vv(v+1),top+1.8*MV,top+1.95*MV,COP); cyl((U(.55)+U(.75))/2,top+1.95*MV,Vv(v+.45),.12*MH,.3*MV,0x5a3a30); }
    for(const [u,v] of [[3,6.5],[5.6,8.2],[2.4,11.6],[6.2,12.4]])vent(U(u),top,Vv(v)); for(const [u,v] of [[4.4,5.6],[3.3,9.4],[5.2,10.8]])stack(U(u),top,Vv(v));
    { const ax=U(5.8), az=Vv(12.8), h=3.2*MV; b(ax,top+h/2,az,.05*MH,h,.05*MH,0x9aa0a6); for(const [y,w] of [[.75,1.4],[.88,1.1],[.97,.8]])b(ax,top+h*y,az,w*MH,.03*MV,.04*MH,0x9aa0a6); } }

  // ---- THE BODEGA (B0, one storey, its front at B0.y1)
  { const B=BOD.B0, x0=Math.min(X(B.x0),X(B.x1)), x1=Math.max(X(B.x0),X(B.x1)), z0=Math.min(Z(B.y0),Z(B.y1)), z1=Math.max(Z(B.y0),Z(B.y1)), top=Y(B.h||130);
    const fz=Z(B.y1)>Z(B.y0)?1:-1, front=fz>0?z1:z0, GALV=0x8a8e92, mx=(x0+x1)/2, mz=(z0+z1)/2;
    parapet(x0,z0,x1,z1,top,.8,0x8a4636,0xa8a296);
    for(const x of [x0+.22*MH,x1-.22*MH])leader(x,front+fz*.1*MH,0,fz,top,GALV);
    // the air-conditioning unit on its rails, its fan on top
    box(mx-1.2*MH,mx+.6*MH,mz-.8*MH,mz+.6*MH,top,top+.12*MV,0x4a4c4e); box(mx-1.1*MH,mx+.5*MH,mz-.7*MH,mz+.5*MH,top+.12*MV,top+1.2*MV,0xb4b8b6);
    for(let k=0;k<5;k++)box(mx-1.1*MH,mx+.5*MH,mz+.5*MH,mz+.52*MH,top+.3*MV+k*.18*MV,top+.36*MV+k*.18*MV,0x7a7e80);
    cyl(mx-.3*MH,top+1.2*MV,mz-.1*MH,.5*MH,.06*MV,0x2a2c2e); cyl(mx-.3*MH,top+1.26*MV,mz-.1*MH,.12*MH,.05*MV,0x8a8e90);
    // the exhaust fan, the skylight, vent pipes
    box(x0+1.4*MH,x0+2.2*MH,z0+1.6*MH,z0+2.4*MH,top,top+.5*MV,0x9a9ea0); cyl(x0+1.8*MH,top+.5*MV,z0+2*MH,.38*MH,.3*MV,0x8a8e90,1);
    box(x1-2.6*MH,x1-1.2*MH,mz+1*MH,mz+2.2*MH,top,top+.45*MV,0xa8a296); box(x1-2.5*MH,x1-1.3*MH,mz+1.1*MH,mz+2.1*MH,top+.45*MV,top+.52*MV,0x8ab8c8);
    vent(x0+3*MH,top,z1-2.5*MH); stack(x1-1.6*MH,top,z0+1.5*MH); stack(mx+1.8*MH,top,mz-2*MH); }

  // ---- GHOST STREET: copper leaders at the dojo's front corners, up to its eave
  if(BOD.GD&&BOD.GD.r){ const [a0,b0,a1,b1]=BOD.GD.r, x0=Math.min(X(a0),X(a1))-.15*MH, x1=Math.max(X(a0),X(a1))+.15*MH, fzz=Math.max(Z(b0),Z(b1))+.15*MH, top=Y(100);
    for(const x of [x0+.12*MH,x1-.12*MH])leader(x,fzz+.1*MH,0,1,top,0x9a6a40); }
  // ---- GHOST STREET'S TILED ROOF (owner, 18 Oct 2026, "go all": "a vent pipe, a lightning rod, a small chimney with a cap"): read off its own
  // roof's slices (the shop roof's boxes, as gdShape left them: the ridge along x at the middle of their depth), so each thing stands on the slope
  // where it is: a brick chimney through the back slope near the east gable, its stone cap and a clay pot; a lead vent pipe up the front slope
  // west of the middle with its collar and hood; a copper lightning rod on the ridge's west end, its ball and the cable down the gable
  { const R=(BOD.GHOSTST||[]).find(p=>/shop roof/.test(p.name||p.key||'')); if(R&&R.boxes&&R.boxes.length){ const bs=R.boxes, xa=Math.min(...bs.map(o=>o.x0)), xb=Math.max(...bs.map(o=>o.x1)), ya=Math.min(...bs.map(o=>o.y0)), yb=Math.max(...bs.map(o=>o.y1)), ze=Math.min(...bs.map(o=>o.z0)), zr=Math.max(...bs.map(o=>o.z1));
    const ym=(ya+yb)/2, half=(yb-ya)/2, zAt=y=>zr-(zr-ze)*Math.min(1,Math.abs(y-ym)/half), back=Z(ya)<Z(yb)?-1:1, yB=y=>ym+(ya<yb?-1:1)*y, yF=y=>ym-(ya<yb?-1:1)*y;   // (zAt: the slope's height over a spot; yB/yF: so far back or toward the street from the ridge)
    // the chimney: brick from below the slope to over the ridge, its stone cap, a pot
    { const cx=xb-(xb-xa)*.2, c0=yB(half*.25), c1=yB(half*.25+.5), lo=zAt(Math.max(Math.abs(c0-ym),Math.abs(c1-ym))*(1)+ym)-2, hi=zr+16;
      box(X(cx-.3),X(cx+.3),Z(c0),Z(c1),Y(lo),Y(hi),0x7a3a2c); box(X(cx-.36),X(cx+.36),Z(c0)-back*.06*MH,Z(c1)+back*.06*MH,Y(hi),Y(hi+2.5),0xa8a296); cyl(X(cx),Y(hi+2.5),(Z(c0)+Z(c1))/2,.12*MH,.35*MV,0xa0563a); }
    // the vent pipe: up from the front slope, a collar where it goes in, a hood
    { const vx=xa+(xb-xa)*.38, vy=yF(half*.45), z0=zAt(vy); cyl(X(vx),Y(z0-1),Z(vy),.2*MH,.12*MV,0x4a4c4e); cyl(X(vx),Y(z0-1),Z(vy),.08*MH,.9*MV,0x6a6e70); cyl(X(vx),Y(z0-1)+.9*MV,Z(vy),.17*MH,.15*MV,0x6a6e70,1); }
    // the lightning rod on the ridge's west end: its foot, the rod, a glass ball, the cable down the gable
    { const lx=xa+.25; b(X(lx),Y(zr)+.08*MV,Z(ym),.12*MH,.16*MV,.12*MH,0x9a6a40); b(X(lx),Y(zr)+1.1*MV,Z(ym),.03*MH,2*MV,.03*MH,0xb07a48); b(X(lx),Y(zr)+1.6*MV,Z(ym),.14*MH,.14*MV,.14*MH,0x6aa0b0);
      b(X(xa)-.02*MH,(Y(ze)+Y(zr))/2,Z(ym),.03*MH,Y(zr)-Y(ze),.03*MH,0x9a6a40); } } }

  // ---- two instanced draws: the blocks, the rounds (a cone for a lid or a cap)
  const geo=new THREE.BoxGeometry(1,1,1), lam=new THREE.MeshLambertMaterial({color:0xffffff});
  const BM=new THREE.InstancedMesh(geo,lam,BX.length); BX.forEach(([x,y,z,sx,sy,sz,c],i)=>{ BM.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(Math.max(.001,sx),Math.max(.001,sy),Math.max(.001,sz)))); BM.setColorAt(i,col.setHex(c)); });
  const CG=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0), KG=new THREE.ConeGeometry(1,1,8).translate(0,.5,0);
  const cy=CY.filter(c=>!c[6]), co=CY.filter(c=>c[6]), mk=(G,L)=>{ const M=new THREE.InstancedMesh(G,lam,Math.max(1,L.length)); L.forEach(([x,y,z,r,h,c],i)=>{ M.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(r,h,r))); M.setColorAt(i,col.setHex(c)); }); M.count=L.length; return M; };
  const CM=mk(CG,cy), KM=mk(KG,co);
  for(const M of [BM,CM,KM]){ M.castShadow=M.receiveShadow=true; scene.add(M); }
  ROOFS.tris=BX.length*12+cy.length*32+co.length*16; window.ROOFSDBG=()=>({boxes:BX.length,rounds:cy.length,cones:co.length,tris:ROOFS.tris}); };
