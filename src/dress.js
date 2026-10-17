// ---- THE STREET DRESSED (owner, 17 Oct 2026: "start fleshing it out with our available assets to make it come to life"; then: "delete
// everything you added except for the new building, street lights, and trash can and bus stop"): the city kit's pieces (kit.js) that stay:
// trash cans at the kerb, street lights and lamp posts, all built here from blocks (the bus stop and its bench removed) ----
const DRESS={};
{ const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const sw=zc-.5, far=zf+.6, AX=BOD.X(MODS.apts.A.x1), AX0=BOD.X(MODS.apts.A.x0), BX0=BOD.X(BOD.B0.x0);   // the kerb, the far kerb; the house's east wall, the bodega's west wall
  // PIXEL ART, NOT 3D (owner, 17 Oct 2026, his picture of the kit street light's foot, smooth-shaded and smeared: "i dont want things to look so 3d and
  // glitchy, more pixel art vibes"): the street's pieces are built here from plain blocks in flat colours, each face its fixed shade by its facing
  // (the world's shader), as the game's own things are; the kit's models are no longer used on the street. One draw for every block
  const BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), solid=(x,z,r,h)=>{ SOL.up.push([x-r,z-r,x+r,z+r]); FIX.up.push([x-r,z-r,G(x,z),x+r,z+r,G(x,z)+h]); };
  // (owner, 17 Oct 2026, after the first dressing: "delete everything you added except for the new building, street lights, and trash can and
  // bus stop", "dont remove the dragon either"): the cans at the kerb, the bus stop with its bench, the street light; nothing else of the kit
  { const M=1/.84*TILE; for(const [x,c] of [[BX0-1.2,0x2f4a3a],[AX0-1.5,0x2f4a3a],[BOUND.x1-2.2,0x2f4a3a]]){ const z=sw-.25*M, y=G(x,z), w=.56*M, h=.9*M;   // (the corner's wire basket: dark green, a darker band at its rim and foot, rubbish heaped in it)
    blk(x,y+.05*M,z,w*.86,.1*M,w*.86,0x1c2a22); blk(x,y+h/2,z,w,h*.8,w,c); blk(x,y+h-.04*M,z,w*1.04,.08*M,w*1.04,0x1c2a22); blk(x-.05*M,y+h+.03*M,z+.04*M,w*.7,.1*M,w*.6,0x8a8478); blk(x+.1*M,y+h+.07*M,z-.08*M,w*.3,.08*M,w*.35,0xb8452f); solid(x,z,w/2,h); } }
  // (the bus stop and its bench: removed, owner 17 Oct 2026, "remove the bus stop and bus bench")
  // STREET LIGHTS AND LAMP POSTS (owner, 17 Oct 2026: "lets add a street light and lamp posts where they would go"): as a New York street has
  // them, the tall street lights at both kerbs, staggered, about every 30 m (built of blocks, its arm over the road), each a light at its head; the
  // old cast-iron lamp posts (a post and a lantern, built here) along the park's side of the far sidewalk, a pair at the gate; each lamp a light
  // (LITE lights the 8 nearest you, the rest only glow), solid at its foot. Cost: some 2,000 triangles the lights, 130 the posts, no shadows of their own
  { const M=1/.84*TILE, SP=26*M, n=Math.floor((BOUND.x1-BOUND.x0-8)/SP)+1, x0=(BOUND.x0+BOUND.x1)/2-(n-1)*SP/2, warm=new THREE.Color(1,.88,.68);
    // a street light: a stepped foot, the grey pole, the arm out over the road (d: which way), the head at its end (the lit lamp under it: heads)
    const sl=(x,z,d)=>{ const y=G(x,z), GR=0x5d6266, DK=0x3f4448; blk(x,y+.3*M,z,.34*M,.6*M,.34*M,DK); blk(x,y+.66*M,z,.24*M,.14*M,.24*M,GR); blk(x,y+3.05*M,z,.15*M,4.7*M,.15*M,GR);
      blk(x,y+5.45*M,z,.12*M,.14*M,.12*M,DK); blk(x,y+5.86*M,z+d*.55*M,.1*M,.1*M,1.1*M,GR); blk(x,y+5.98*M,z+d*1.3*M,.36*M,.16*M,.62*M,DK); solid(x,z,.18*M,6*M); const P={x,z,d,y:y+5.45*M,h:heads.length}; POLES.push(P); return P; };   // (the pole's top, for the power grid: grid.js)
    const heads=[], pools=[], POLES=[], POSTS=[], light=(x,y,z,i,r)=>{ const L=new THREE.PointLight(warm,i,r,1.6); L.position.set(x,y,z); L.userData.i0=i; scene.add(L); pools.push([L,x,z,r*.2]); return L; };
    // EVERY LAMP'S POOL (owner, 17 Oct 2026, his picture: "some dont glow"): only the 8 lamps nearest you light the world (the budget), so every
    // lamp lays a pool of light on the ground: a disc in three hard steps, its edges broken by a grain (no halftone), added over the ground, warm;
    // under every lamp, lit for real or not, so they all look alike; at night only, gone with the lamp switched off. One draw a pool, 2 triangles
    const poolTex=(()=>{ const N=48, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), im=g.createImageData(N,N), h=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); };
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const d0=Math.hypot((i+.5)/N*2-1,(j+.5)/N*2-1), d=d0+(SMOOTH?0:(h(i,j)-.5)*.1), a=SMOOTH?Math.max(0,1-d0)**1.6*.24:d<.38?.2:d<.68?.11:d<.96?.05:0, q=(j*N+i)*4; im.data[q]=255; im.data[q+1]=214; im.data[q+2]=150; im.data[q+3]=Math.round(a*255); }
      g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=SMOOTH?THREE.LinearFilter:THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2}), poolGeo=new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2);
    for(let i=0;i<n;i++){ const x=x0+i*SP;   // (the near kerb's, then the far kerb's half a span along: staggered)
      sl(x,sw-.25*M,1).L=light(x,5.8*M,sw+1.4*M,40,13*TILE); heads.push([x,5.8*M,sw+1.4*M]);
      const xf=x+SP/2; if(xf<BOUND.x1-3){ sl(xf,far+.25*M,-1).L=light(xf,5.8*M,far-1.4*M,40,13*TILE); heads.push([xf,5.8*M,far-1.4*M]); } }
    // the lamp posts: the far sidewalk's park side (the wall's line, a little in front of it)
    const wz=BOD.ZS(PARK.y0+PARK.oy), pz=far+(wz-far)*.7, g0=BOD.XS(PARK.gate[0]+PARK.ox), g1=BOD.XS(PARK.gate[1]+PARK.ox), xs=[g0-.9*M,g1+.9*M];
    for(let x=g0-14*M;x>BOUND.x0+2;x-=14*M)xs.push(x); for(let x=g1+14*M;x<BOUND.x1-2;x+=14*M)xs.push(x);
    const H=4.2*M, pole=new THREE.InstancedMesh(new THREE.BoxGeometry(.13*M,H,.13*M).translate(0,H/2,0),new THREE.MeshLambertMaterial({color:0x22262b}),xs.length*2),
      lant=new THREE.InstancedMesh(new THREE.BoxGeometry(.34*M,.5*M,.34*M),new THREE.MeshBasicMaterial({color:0xffe4b0}),xs.length), m4=new THREE.Matrix4(), y0=G(xs[0],pz);
    xs.forEach((x,i)=>{ const y=G(x,pz); pole.setMatrixAt(i*2,m4.makeTranslation(x,y,pz)); pole.setMatrixAt(i*2+1,m4.makeScale(2.6,.06,2.6).setPosition(x,y,pz));   // (the post and its foot)
      lant.setMatrixAt(i,m4.makeTranslation(x,y+H+.25*M,pz)); POSTS.push({x,z:pz,y:y+H+.5*M,i,L:light(x,y+H+.2*M,pz,18,9*TILE)});
      SOL.up.push([x-.12*M,pz-.12*M,x+.12*M,pz+.12*M]); FIX.up.push([x-.12*M,pz-.12*M,y,x+.12*M,pz+.12*M,y+H]); });
    const hd=new THREE.InstancedMesh(new THREE.BoxGeometry(.5*M,.08*M,.26*M),lant.material,heads.length); heads.forEach(([x,y,z],i)=>hd.setMatrixAt(i,m4.makeTranslation(x,y-.08*M,z))); scene.add(hd);   // (each street light's lamp, lit under its head)
    for(const P of pools){ const [L,x,z,r]=P, me=new THREE.Mesh(poolGeo,poolMat); me.scale.set(r,1,r); me.position.set(x,G(x,z)+.03,z); me.renderOrder=1; me.visible=false; scene.add(me); P.push(me); }
    DRESS.pools=pools; DRESS.tick=()=>{ const k=Math.max(0,Math.min(1,(3-CLOCK.elev())/8)), up=LVL!=='down'&&!ROOMS.cur; poolMat.opacity=k; for(const [L,,,,me] of pools)me.visible=up&&k>0&&!L.userData.off; };
    pole.castShadow=true; scene.add(pole,lant);
    { const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
      BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; scene.add(me); DRESS.blocks=me; } DRESS.posts=xs.length; DRESS.lights=n*2+xs.length; DRESS.poles=POLES; DRESS.lampposts=POSTS; DRESS.heads=hd; DRESS.lant=lant; }   // (the poles, the posts, their lamps' heads: the power grid hangs its wires on them, grid.js)
}
