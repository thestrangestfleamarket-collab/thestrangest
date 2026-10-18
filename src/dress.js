// ---- THE STREET DRESSED (owner, 17 Oct 2026: "start fleshing it out with our available assets to make it come to life"; then: "delete
// everything you added except for the new building, street lights, and trash can and bus stop"): the city kit's pieces (kit.js) that stay:
// trash cans at the kerb, street lights and lamp posts, all built here from blocks (the bus stop and its bench removed) ----
const DRESS={};
{ const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const sw=zc-.5, far=zf+.6, AX=BOD.X(MODS.apts.A.x1), AX0=BOD.X(MODS.apts.A.x0), BX0=BOD.X(BOD.B0.x0);   // the kerb, the far kerb; the house's east wall, the bodega's west wall
  DRESS.kerb={sw,far}; DRESS.cans=[];   // (the kerb lines and the cans: the city's vehicles and its trash round, vehicles.js, duties.js)
  // PIXEL ART, NOT 3D (owner, 17 Oct 2026, his picture of the kit street light's foot, smooth-shaded and smeared: "i dont want things to look so 3d and
  // glitchy, more pixel art vibes"): the street's pieces are built here from plain blocks in flat colours, each face its fixed shade by its facing
  // (the world's shader), as the game's own things are; the kit's models are no longer used on the street. One draw for every block
  // (ROUND THINGS ROUND, owner 18 Oct 2026: "the pole is just a recentage not round": the poles, their feet and collars and the cans eight-sided,
  // flat-faced (each side its shade), one more instanced draw; some 30 triangles a piece where a box was 12)
  const CY=[], cyl=(x,y,z,r,h,c)=>CY.push([x,y,z,r*2,h,r*2,c]);
  const BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), solid=(x,z,r,h)=>{ SOL.up.push([x-r,z-r,x+r,z+r]); FIX.up.push([x-r,z-r,G(x,z),x+r,z+r,G(x,z)+h]); };
  // (owner, 17 Oct 2026, after the first dressing: "delete everything you added except for the new building, street lights, and trash can and
  // bus stop", "dont remove the dragon either"): the cans at the kerb, the bus stop with its bench, the street light; nothing else of the kit
  { const M=1/.84*TILE; for(const [x,c] of [[BX0-1.2,0x2f4a3a],[AX0-1.5,0x2f4a3a],[BOD.XS(AVE.x0)-2.2,0x2f4a3a]]){ const z=sw-.25*M, y=G(x,z), w=.56*M, h=.9*M; DRESS.cans.push({x,z});   // (the corner's wire basket: dark green, a darker band at its rim and foot, rubbish heaped in it)
    cyl(x,y+.05*M,z,w*.43,.1*M,0x1c2a22); cyl(x,y+h/2,z,w/2,h*.8,c); cyl(x,y+h-.04*M,z,w*.52,.08*M,0x1c2a22); blk(x-.05*M,y+h+.03*M,z+.04*M,w*.7,.1*M,w*.6,0x8a8478); blk(x+.1*M,y+h+.07*M,z-.08*M,w*.3,.08*M,w*.35,0xb8452f); solid(x,z,w/2,h); } }
  // (the bus stop and its bench: removed, owner 17 Oct 2026, "remove the bus stop and bus bench")
  // STREET LIGHTS AND LAMP POSTS (owner, 17 Oct 2026: "lets add a street light and lamp posts where they would go"): as a New York street has
  // them, the tall street lights at both kerbs, staggered, about every 30 m (built of blocks, its arm over the road), each a light at its head; the
  // old cast-iron lamp posts (a post and a lantern, built here) along the park's side of the far sidewalk, a pair at the gate; each lamp a light
  // (LITE lights the 8 nearest you, the rest only glow), solid at its foot. Cost: some 2,000 triangles the lights, 130 the posts, no shadows of their own
  { const M=1/.84*TILE, SP=26*M, SX0=BOD.XS(BOD.MAP.x0), SX1=BOD.XS(BOD.MAP.x1), n=Math.floor((SX1-SX0-8)/SP)+1, x0=(SX0+SX1)/2-(n-1)*SP/2,   /* (the street's own run, not the bound: the force field's is wider) */ warm=new THREE.Color(1,.88,.68);
    // a street light: a stepped foot, the grey pole, the arm out over the road (d: which way), the head at its end (the lit lamp under it: heads)
    const sl=(x,z,d,ax='z',ring)=>{ const y=G(x,z), GR=0x5d6266, DK=0x3f4448, X_=ax==='x'; cyl(x,y+.3*M,z,.17*M,.6*M,DK); cyl(x,y+.66*M,z,.12*M,.14*M,GR); cyl(x,y+3.05*M,z,.075*M,4.7*M,GR);
      cyl(x,y+5.45*M,z,.06*M,.14*M,DK); if(X_){ blk(x+d*.55*M,y+5.86*M,z,1.1*M,.1*M,.1*M,GR); blk(x+d*1.3*M,y+5.98*M,z,.62*M,.16*M,.36*M,DK); } else { blk(x,y+5.86*M,z+d*.55*M,.1*M,.1*M,1.1*M,GR); blk(x,y+5.98*M,z+d*1.3*M,.36*M,.16*M,.62*M,DK); }
      solid(x,z,.18*M,6*M); const P={x,z,d,ax,ring:ring||(d>0?'outer':'inner'),y:y+5.45*M,h:heads.length}; POLES.push(P); return P; };   // (ax: the way its arm reaches; ring: the loop's outer kerb or its inner one, for the power grid's two rings)   // (the pole's top, for the power grid: grid.js)
    const heads=[], pools=[], POLES=[], POSTS=[], hsh=n=>{ const v=Math.sin(n*12.9898+78.233)*43758.5453; return v-Math.floor(v); },
      light=(x,y,z,i,r)=>{ const L=new THREE.PointLight(warm,i,r,1.6); L.position.set(x,y,z); L.userData.i0=i; scene.add(L); const P=[L,x,z,r*.2]; P.on=1.5-hsh(pools.length)*4; pools.push(P); return L; };   // (P.on: the sun's height at which this one comes on)
    // EVERY LAMP'S POOL (owner, 17 Oct 2026, his picture: "some dont glow"): only the 8 lamps nearest you light the world (the budget), so every
    // lamp lays a pool of light on the ground: a disc in three hard steps, its edges broken by a grain (no halftone), added over the ground, warm;
    // under every lamp, lit for real or not, so they all look alike; at night only, gone with the lamp switched off. One draw a pool, 2 triangles
    const poolTex=(()=>{ const N=48, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), im=g.createImageData(N,N), h=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); };
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const d0=Math.hypot((i+.5)/N*2-1,(j+.5)/N*2-1), d=d0+(SMOOTH||CEL?0:(h(i,j)-.5)*.1), a=SMOOTH?Math.max(0,1-d0)**1.6*.24:d<.38?.2:d<.68?.11:d<.96?.05:0, q=(j*N+i)*4; im.data[q]=255; im.data[q+1]=214; im.data[q+2]=150; im.data[q+3]=Math.round(a*255); }
      g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=SMOOTH?THREE.LinearFilter:THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2}), poolGeo=new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2);
    // THE CORNER'S LIGHT (owner, 18 Oct 2026: "put one large tall street light on corner. lighst in both directions, functions correctly"): on the
    // park's corner of the main street and the Avenue, just in from the kerb's curve (bodega.js's rounded corner), so no other light stands within
    // four of it; every other light only where there's sidewalk (none on a corner's curve of road)
    const RC=BOD.road.CORN.find(c=>c.x===AVE.r0&&c.y===BOD.FAR), CK=(BOD.road.KR-.45)/Math.SQRT2, CP={x:BOD.XS(RC.cx-RC.sx*CK),z:BOD.ZS(RC.cy-RC.sy*CK)}, ok=(x,z)=>G(x,z)>-.01&&Math.hypot(x-CP.x,z-CP.z)>4*M;
    for(let i=0;i<n;i++){ const x=x0+i*SP;   // (the near kerb's, then the far kerb's half a span along: staggered)
      sl(x,sw-.25*M,1).L=light(x,5.8*M,sw+1.4*M,40,13*TILE); heads.push([x,5.8*M,sw+1.4*M]);
      const xf=x+SP/2; if(xf<SX1-3&&ok(xf,far+.25*M)&&!(xf>BOD.XS(AVE.r0)-1&&xf<BOD.XS(AVE.r1)+1)&&!(xf>BOD.XS(RING.wr0)-1&&xf<BOD.XS(RING.wr1)+1)){ sl(xf,far+.25*M,-1).L=light(xf,5.8*M,far-1.4*M,40,13*TILE); heads.push([xf,5.8*M,far-1.4*M]); } }
    // THE LOOP'S OTHER THREE SIDES (17 Oct 2026, owner: "have the power lines go around the block"): street lights on both kerbs of the west
    // street, the north street and the Avenue, staggered as the main street's, each arm over its road; the power grid strings them (grid.js)
    { const XS=BOD.XS, ZS=BOD.ZS, R=RING, A=AVE, put=(x,z,d,ax,ring)=>{ if(!ok(x,z))return; const P=sl(x,z,d,ax,ring), hx=ax==='x'?x+d*1.3*M:x, hz=ax==='x'?z:z+d*1.3*M; P.L=light(hx,5.8*M,hz,40,13*TILE); heads.push([hx,5.8*M,hz]); };
      const runZ=(xo,xi,z0,z1)=>{ for(let z=z0,k=0;z<z1;z+=SP/2,k++){ if(k&1)put(xi,z,-1,'x','inner'); else put(xo,z,1,'x','outer'); } };   // (a street along z: outer kerb at xo, its arm +x; inner at xi, -x; or as d says)
      { const xo=XS(R.wr0)-.25*M, xi=XS(R.wr1)+.25*M, z0=ZS(BOD.FAR)+2*M, z1=ZS(R.nr0)-1*M; for(let z=z0,k=0;z<z1;z+=SP/2,k++){ if(k&1)put(xi,z,-1,'x','inner'); else put(xo,z,1,'x','outer'); } }   // (the west street: its outer kerb the west one)
      { const xo=XS(A.r1)+.25*M, xi=XS(A.r0)-.25*M, z0=ZS(BOD.FAR)+2*M, z1=ZS(R.nr0)-1*M; for(let z=z0+SP/4,k=0;z<z1;z+=SP/2,k++){ if(k&1)put(xi,z,1,'x','inner'); else put(xo,z,-1,'x','outer'); } }   // (the Avenue: its outer kerb the east one)
      { const zo=ZS(R.nr1)+.25*M, zi=ZS(R.nr0)-.25*M, x0=XS(R.wr1)+2*M, x1=XS(A.r0)-2*M; for(let x=x0,k=0;x<x1;x+=SP/2,k++){ if(k&1)put(x,zi,1,'z','inner'); else put(x,zo,-1,'z','outer'); } } }   // (the north street: its outer kerb the north one)
    // (the pole: a stepped cast foot, a collar, a pole a third taller than the others, thinner up top, a finial; two arms at its top, one out over
    // each road (-z over the main street, +x over the Avenue), each with a brace under it, a long head at its end and the lamp lit under it; two
    // lamps of LITE's (each its pool, on at dusk with the rest), solid at its foot, one pole of the power grid's inner ring with both its lamps)
    { const x=CP.x, z=CP.z, y=G(x,z), GR=0x5d6266, DK=0x3f4448, T8=8.2*M, AL=2.7*M, L2=[];
      cyl(x,y+.35*M,z,.3*M,.7*M,DK); cyl(x,y+.78*M,z,.2*M,.16*M,GR); cyl(x,y+.86*M+2.6*M,z,.12*M,5.2*M,GR); cyl(x,y+6.06*M+1.05*M,z,.09*M,2.1*M,GR); cyl(x,y+T8+.1*M,z,.13*M,.2*M,DK); cyl(x,y+T8+.3*M,z,.05*M,.2*M,DK);
      for(const [dx,dz] of [[0,-1],[1,0]]){ const ex=x+dx*AL, ez=z+dz*AL, ay=y+T8-.15*M;
        blk(x+dx*AL/2,ay,z+dz*AL/2,dx?AL:.12*M,.12*M,dz?AL:.12*M,GR); blk(x+dx*AL*.28,ay-.42*M,z+dz*AL*.28,dx?AL*.5:.07*M,.07*M,dz?AL*.5:.07*M,GR); blk(x+dx*.06*M,ay-.22*M,z+dz*.06*M,.1*M,.5*M,.1*M,DK);
        blk(ex,ay+.02*M,ez,dx?.9*M:.44*M,.2*M,dz?.9*M:.44*M,DK); const h=heads.length, L=light(ex,ay-.25*M,ez,55,16*TILE); heads.push([ex,ay-.06*M,ez]); L2.push([L,h]); }
      solid(x,z,.3*M,T8); POLES.push({x,z,d:-1,ax:'z',ring:'inner',y:y+T8-.6*M,h:L2[0][1],h2:L2[1][1],L:L2[0][0],L2:L2[1][0],corner:1}); DRESS.corner={x,z,y,lamps:L2.map(q=>q[0])}; }
    // the lamp posts: the far sidewalk's park side (the wall's line, a little in front of it)
    const wz=BOD.ZS(PARK.y0+PARK.oy), pz=far+(wz-far)*.7, g0=BOD.XS(PARK.gate[0]+PARK.ox), g1=BOD.XS(PARK.gate[1]+PARK.ox), pts=[[g0-.9*M,pz],[g1+.9*M,pz]], px1=BOD.XS(PARK.x1+PARK.ox)-2;
    for(let x=g0-14*M;x>BOD.XS(PARK.x0+PARK.ox)+2;x-=14*M)pts.push([x,pz]); for(let x=g1+14*M;x<px1;x+=14*M)pts.push([x,pz]);
    // (and up the Avenue's west sidewalk, the park's side, from its mouth to its end: owner, 17 Oct 2026)
    { const ax=BOD.XS(AVE.x0)+(BOD.XS(AVE.r0)-BOD.XS(AVE.x0))*.35, z0=BOD.ZS(BOD.MAP.y1)+5*M, z1=BOD.ZS(AVE.y1)-2; for(let z=z0;z<z1;z+=14*M)pts.push([ax,z]); }
    const xs=pts.map(p=>p[0]);
    const H=4.2*M, pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.055*M,.07*M,H,8).translate(0,H/2,0),new THREE.MeshLambertMaterial({color:0x22262b,flatShading:true}),xs.length*2),
      lant=new THREE.InstancedMesh(new THREE.BoxGeometry(.34*M,.5*M,.34*M),new THREE.MeshBasicMaterial({color:0xffe4b0}),xs.length), m4=new THREE.Matrix4(), y0=G(xs[0],pz);
    pts.forEach(([x,pz],i)=>{ const y=G(x,pz); pole.setMatrixAt(i*2,m4.makeTranslation(x,y,pz)); pole.setMatrixAt(i*2+1,m4.makeScale(2.4,.06,2.4).setPosition(x,y,pz));   // (the post and its foot)
      lant.setMatrixAt(i,m4.makeTranslation(x,y+H+.25*M,pz)); POSTS.push({x,z:pz,y:y+H+.5*M,i,L:light(x,y+H+.2*M,pz,18,9*TILE)});
      SOL.up.push([x-.12*M,pz-.12*M,x+.12*M,pz+.12*M]); FIX.up.push([x-.12*M,pz-.12*M,y,x+.12*M,pz+.12*M,y+H]); });
    const hd=new THREE.InstancedMesh(new THREE.BoxGeometry(.5*M,.08*M,.26*M),lant.material,heads.length); heads.forEach(([x,y,z],i)=>hd.setMatrixAt(i,m4.makeTranslation(x,y-.08*M,z))); scene.add(hd);   // (each street light's lamp, lit under its head)
    for(const P of pools){ const [L,x,z,r]=P, me=new THREE.Mesh(poolGeo,poolMat); me.scale.set(r,1,r); me.position.set(x,G(x,z)+.03,z); me.renderOrder=1; me.visible=false; scene.add(me); P.push(me); }
    DRESS.pools=pools;
    // ON ONE BY ONE AT DUSK (owner, 17 Oct 2026, "1-3"): each street light and lamp post comes on at its own moment as the sun goes down (between
    // 1.5° up and 2.5° under: some twenty minutes of the evening), its lamp lit (the head's or the lantern's colour), its light and its pool with it;
    // off again as the sun comes up. By day they're dark and light nothing
    const LIT=new THREE.Color(0xffe4b0), DIM=new THREE.Color(0x4a4238);
    DRESS.tick=()=>{ const e=CLOCK.elev(), k=Math.max(0,Math.min(1,(3-e)/8)), up=LVL!=='down'&&!ROOMS.cur; poolMat.opacity=k;
      pools.forEach((P,j)=>{ const [L,,,,me]=P, on=e<P.on; if(on!==P.lit){ P.lit=on; L.intensity=on?L.userData.i0:0; const c=on?LIT:DIM; if(j<heads.length){ hd.setColorAt(j,c); hd.instanceColor.needsUpdate=true; } else { lant.setColorAt(j-heads.length,c); lant.instanceColor.needsUpdate=true; } }
        me.visible=up&&k>0&&on&&!L.userData.off; }); };
    pole.castShadow=true; scene.add(pole,lant);
    // THE COMMUNITY GARDEN'S FENCE (owner, 17 Oct 2026, mockup 1): a low wooden fence along the lot's front between the apartment house and the
    // bodega, posts every two tiles, two rails, its gate open between the cottage and the butterfly garden; solid but for the gate
    if(!AWAY.has('garden')){ const z=-.35*TILE, x0=AX+.15, x1=BX0-.15,   /* (only with the garden on the map: AWAY, map-pre.js, owner 18 Oct 2026) */ gx0=-5.6*TILE, gx1=-3.6*TILE, sx0=BOD.XS(MAPSTAIR.x0)-.3, sx1=BOD.XS(MAPSTAIR.x1)+.3, WD=0x4a3b2a, RL=0x6b573f, H=1.05*M;   // (on the lot's line, a hair behind the sidewalk; open where the subway stairs' well cuts the line)
      const post=(x,h)=>{ const y=G(x,z); blk(x,y+h/2,z,.09*M,h,.09*M,WD); };
      const runs=[[x0,sx0],[sx1,gx0],[gx1,x1]];
      for(const [a,b] of runs){ for(let x=a;x<b-.5;x+=2*TILE)post(x,H); post(b,H); } post(gx0,H*1.2); post(gx1,H*1.2);
      const rail=(a,b)=>{ const y=G((a+b)/2,z); for(const h of [.42*M,.9*M])blk((a+b)/2,y+h,z,b-a,.06*M,.05*M,RL); SOL.up.push([a,z-.06*M,b,z+.06*M]); FIX.up.push([a,z-.06*M,y,b,z+.06*M,y+H]); };
      for(const [a,b] of runs)rail(a,b); }
    { const me=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.5,1,8),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),CY.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
      CY.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; scene.add(me); DRESS.rounds=me; }
    { const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
      BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; scene.add(me); DRESS.blocks=me; } DRESS.posts=xs.length; DRESS.lights=n*2+xs.length+2; DRESS.poles=POLES; DRESS.lampposts=POSTS; DRESS.heads=hd; DRESS.lant=lant; }   // (the poles, the posts, their lamps' heads: the power grid hangs its wires on them, grid.js)
}
