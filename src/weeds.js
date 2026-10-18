// ---- WEEDS AT THE FOOT OF EVERYTHING (owner, 18 Oct 2026: "put natural weeds and grass around places like this all around map ... realistically
// lived in"): where anything stands on the ground out of doors (a wall, a post, a building's side, a lamp's pole, a bench: every solid box the
// map has, FIX), tufts of grass and weeds grow along its foot, a little out from it, thick where a broad noise says the corner is damp and
// neglected, none where it says swept; now and then a dandelion's yellow head. Each tuft two crossed cards painted with blades (see-through
// between), still till someone walks through them (they part round his feet: WEEDS.PART; owner, 18 Oct 2026, no wind on them). Nothing indoors, nothing between two boxes that touch. Derived from
// whatever stands on the map when the game opens, so a place moved or added elsewhere gets its weeds with no one placing them. Cut into map
// chunks of 32 tiles, each its own draw, so only the ones in the picture are drawn. Cost: some 4 triangles a tuft; no lights, one program ----
const WEEDS=window.WEEDS={};
// (who's walking through: up to eight near you, you first, each x, z, his reach and on; the weeds and the lawn's grass part round them, still otherwise)
WEEDS.movers=[...Array(8)].map(()=>new THREE.Vector4(0,0,0,0)); WEEDS.UMV={value:WEEDS.movers};
WEEDS.PART=(T,k)=>'{ vec4 w0=modelMatrix*instanceMatrix*vec4(transformed,1.); vec3 dw=vec3(0.); for(int i=0;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; vec2 d=w0.xz-m.xy; float l=length(d), f=1.-l/m.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dw.xz+=d/max(l,.001)*f*'+(.22*T).toFixed(4)+'; dw.y-=f*'+(.05*T).toFixed(4)+'; } transformed+=inverse(mat3(instanceMatrix))*dw*'+k+'; }';
WEEDS.init=()=>{ WEEDS.dbg=f=>f({FIX,SOL,TILE,MODS}); const T=TILE, hsh=(a,b,s)=>{ let h=(Math.floor(a)*374761393+Math.floor(b)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy); return (hsh(xi,yi,s)*(1-u)+hsh(xi+1,yi,s)*u)*(1-v)+(hsh(xi,yi+1,s)*(1-u)+hsh(xi+1,yi+1,s)*u)*v; };
  const B=(FIX.up||[]).filter(b=>b[5]-b[2]>.25*T&&b[2]<.6*T), RB=typeof ROOMS!=='undefined'&&ROOMS.boxes?ROOMS.boxes():[];
  const inside=(x,z)=>RB.some(b=>b.y0<1&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)||(MODS.apts&&MODS.apts.inside&&MODS.apts.inside(x,z));
  const solidAt=(x,z)=>B.some(b=>x>b[0]&&x<b[3]&&z>b[1]&&z<b[4]);
  const gy=(x,z)=>MODS.bodega&&MODS.bodega.ground?MODS.bodega.ground(x,z):0;
  const TUFT=[], FLOW=[]; WEEDS.drop=[0,0,0];
  for(const b of B){ const [x0,z0,,x1,z1]=b, edges=[[x0,z0,x1,z0,0,-1],[x1,z0,x1,z1,1,0],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0]];
    for(const [ax,az,bx,bz,nx,nz] of edges){ const L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/(.2*T)));
      for(let i=0;i<n;i++){ const t=(i+hsh(ax*7+i,az*3,11))/n, ex=ax+(bx-ax)*t, ez=az+(bz-az)*t, wild=vn(ex/(3*T),ez/(3*T),13);
        if(wild<.3||hsh(ex*13,ez*17,15)>wild*1.7){ WEEDS.drop[0]++; continue; }   // (swept here, neglected there)
        const out=(.03+hsh(ex*5,ez*9,17)*.12)*T, x=ex+nx*out, z=ez+nz*out; if(inside(x,z)){ WEEDS.drop[1]++; continue; } if(solidAt(x,z)){ WEEDS.drop[2]++; continue; }
        const s=(.28+hsh(ex*3,ez*11,19)*.34)*T*(.7+.6*wild); TUFT.push([x,gy(x,z),z,s,hsh(ex,ez,21)*3.14,hsh(ez,ex,23)]);
        if(hsh(ex*19,ez*23,25)<.07)FLOW.push([x+(hsh(ex,ez,27)-.5)*.1*T,gy(x,z)+s*.75,z]); } } }
  if(!TUFT.length)return;
  // the tuft's picture: nine blades, each its own lean and height, darker at the root, lit at the tip, see-through between
  const cv=document.createElement('canvas'); cv.width=cv.height=48; const g=cv.getContext('2d'), id=g.createImageData(48,48);
  for(let k=0;k<9;k++){ const bx=5+k*4.6+Math.sin(k*7)*1.5, lean=(hsh(k,1,41)-.5)*.7, top=Math.floor(48-(18+26*hsh(k,2,42))), wide=hsh(k,3,43)<.25;
    for(let y=top;y<48;y++){ const yy=47-y, px=bx+lean*yy, tt=yy/(47-top||1), w=(wide?3:2.2)*(1-tt*.7); for(let x=Math.floor(px-w);x<=Math.ceil(px+w);x++){ if(x<0||x>47||Math.abs(x-px)>w)continue; const i=(y*48+x)*4; id.data[i]=30+70*tt; id.data[i+1]=58+92*tt; id.data[i+2]=20+30*tt; id.data[i+3]=255; } } }
  g.putImageData(id,0,0); const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.magFilter=THREE.NearestFilter;
  const card=new THREE.PlaneGeometry(1,1).translate(0,.5,0), c2=card.clone().rotateY(Math.PI/2), geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([...card.attributes.position.array,...c2.attributes.position.array],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([...card.attributes.uv.array,...c2.attributes.uv.array],2));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(new Array(16).fill(0).flatMap(()=>[0,1,0]).slice(0,24),3)); geo.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);
  const mat=new THREE.MeshLambertMaterial({map:tx,alphaTest:.5,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uMv=WEEDS.UMV; sh.vertexShader='uniform vec4 uMv[8];\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+WEEDS.PART(T,'position.y')); };   // (still till someone walks through: owner, 18 Oct 2026)
  mat.customProgramCacheKey=()=>'weedsway';
  // the tufts by chunk, each chunk its own mesh with its own bounds (drawn only when in the picture)
  const CH=new Map(), cs=32*T; for(const t of TUFT){ const k=Math.floor(t[0]/cs)+','+Math.floor(t[2]/cs); if(!CH.has(k))CH.set(k,[]); CH.get(k).push(t); }
  const M=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color(); WEEDS.meshes=[];
  for(const list of CH.values()){ const me=new THREE.InstancedMesh(geo,mat,list.length);
    list.forEach(([x,y,z,s,a,c],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(up,a),new THREE.Vector3(s*1.1,s*.5,s*1.1)); me.setMatrixAt(i,M); me.setColorAt(i,col.setHSL(.24+c*.08,.35+c*.25,.42+c*.2)); });
    me.computeBoundingSphere(); me.receiveShadow=true; scene.add(me); WEEDS.meshes.push(me); }
  if(FLOW.length){ const fm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.05*T,0),new THREE.MeshLambertMaterial({color:0xf0cc30,emissive:0x2a1c00}),FLOW.length);
    FLOW.forEach(([x,y,z],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.identity(),new THREE.Vector3(1,1,1)); fm.setMatrixAt(i,M); }); fm.computeBoundingSphere(); scene.add(fm); WEEDS.meshes.push(fm); }
  WEEDS.n=TUFT.length; WEEDS.flowers=FLOW.length; };
// ---- THE LAWN'S GRASS: FLAT AND SWAYING (owner, 18 Oct 2026, of the blocky grass mockups https://claude.ai/artifact/WfQ5tdKVCmb1jJEAeAEXL5:
// "Only swaying smooth", his option 3; never leafy; then "i only want the grass moving when someone is walking through it or disrupting it. make it
// 50% les tall over all": no wind now, half the height): over every lawn you can see (the land's sheet and the park's hills: wherever a ray straight
// down meets one of them first, so never on a way, a sidewalk, a plaza, a floor or under a building), long thick blades of flat colour lying nearly
// down, combed one way, four to a clump, in the lawn's own greens; still till someone walks through (they part round his feet and stand back up behind him); lit in the world's flat bands (no smooth light). Made only
// round you, in chunks of 8 tiles, a chunk a moment as you come (a tiny picture from above says which half-tile squares are lawn and how high, two
// clumps in each), thrown away 3 chunks off; each chunk one instanced draw with its own bounds, so only those in the picture are drawn. Cost: 8
// clumps a tile, 16 triangles a clump (a blade its top and one side: 4); one program; no light; building a chunk some 15 ms (the cloud: two small draws and a read back) ----
WEEDS.lawnInit=()=>{ const T=TILE, CS=8*T, CELL=.5*T, PER=2, hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  // a clump in a tile's units: four blades from roots in a small spread, each .75-1.1 long, .14 wide, its tip 6-14 degrees up off the ground, all
  // pointing within 13 degrees of the comb (+x); aT 0 at the root to 1 at the tip (how far the wind carries it)
  const P=[], AT=[], H1=(a,b,s)=>hsh(a/97,b/89,s);
  for(let k=0;k<4;k++){ const ox=(H1(k,1,51)-.6)*.5, oz=(H1(k,2,52)-.5)*.7, L=.75+.35*H1(k,3,53), w=.07, an=(H1(k,4,54)-.5)*.45, up=(6+8*H1(k,5,55))*Math.PI/180, th=.04;
    const c=Math.cos(an), sn=Math.sin(an), tx=c*L*Math.cos(up), tz=sn*L*Math.cos(up), ty=L*Math.sin(up), nx=-sn*w, nz=c*w;
    const r0=[ox+nx,th,oz+nz], r1=[ox-nx,th,oz-nz], t0=[ox+tx+nx*.6,ty+th,oz+tz+nz*.6], t1=[ox+tx-nx*.6,ty+th,oz+tz-nz*.6], s0=[ox+nx,0,oz+nz], s1=[ox+tx+nx*.6,ty,oz+tz+nz*.6];
    for(const [v,t] of [[r0,0],[r1,0],[t0,1],[r1,0],[t1,1],[t0,1],[s0,0],[r0,0],[s1,1],[r0,0],[t0,1],[s1,1]]){ P.push(...v); AT.push(t); } }   // (its top, then its side down to the ground)
  const LG=[[62,100,50],[76,116,58],[90,132,66],[104,146,74]];   // (the lawn's four greens, gamekit.js's GRASSP: that one lives in the bodega's scope)
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('aT',new THREE.Float32BufferAttribute(AT,1)); geo.computeVertexNormals();
  const mat=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
  // (still unless someone is in it: up to eight walkers near you (you first), each parting the blades round his feet, their tips pushed out from him and
  // pressed down, the nearer the more; as he walks on they stand back up where he was. No wind)
  const MV=WEEDS.movers, SWAY=WEEDS.PART(T,'aT');
  mat.onBeforeCompile=sh=>{ sh.uniforms.uMv=WEEDS.UMV; sh.vertexShader='attribute float aT; uniform vec4 uMv[8];\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+SWAY); };
  const near=[]; WEEDS.moveTick=()=>{ near.length=0; near.push([pos.x,pos.z,0]); if(typeof NPCS!=='undefined')for(const N of NPCS){ if(N.lv!=='up'||N.far||!N.g.visible||!N.st)continue; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<14*T)near.push([N.st.x,N.st.z,d]); }
    near.sort((a,b)=>a[2]-b[2]); for(let i=0;i<8;i++){ const n=near[i]; if(n)MV[i].set(n[0],n[1],.55*T,1); else MV[i].w=0; } };
  mat.customProgramCacheKey=()=>'lawnflat';
  const M=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color(), V=new THREE.Vector3(), S=new THREE.Vector3();
  const lawn=o=>o===MODS.land||(typeof POND!=='undefined'&&o===POND.hills);
  const skip=o=>o.isInstancedMesh||o.isSkinnedMesh||o.isPoints||o.isSprite||o.isLine||(o.material&&(o.material.transparent||o.material.depthWrite===false||o.material.side===THREE.BackSide));
  const CH=new Map(); WEEDS.chunks=CH; WEEDS.lawnN=0;
  // (which squares are lawn, and how high: one tiny picture of the chunk from straight above, twice: first everything but the lawn, in black,
  // its depth kept; then the lawn alone (the land's sheet, the hills: layer 5 for the moment) where it's still the top, its height in the green.
  // A ray a square tested every triangle under it, 1.3 s a chunk; this is two small draws)
  const R=CS/CELL, RT=new THREE.WebGLRenderTarget(R,R,{depthBuffer:true}), CAM=new THREE.OrthographicCamera(-CS/2,CS/2,CS/2,-CS/2,.1,80*T), PIX=new Uint8Array(R*R*4);
  const VS='varying float vY; void main(){ vec4 w=modelMatrix*vec4(position,1.);'+'\n#ifdef USE_INSTANCING\n w=modelMatrix*instanceMatrix*vec4(position,1.);\n#endif\n vY=w.y; gl_Position=projectionMatrix*viewMatrix*w; }';
  const M0=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(0.); }',side:THREE.DoubleSide});
  const M1=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(1.,clamp((vY+.5)/4.,0.,1.),0.,1.); }',side:THREE.DoubleSide});
  const build=(cx,cz)=>{ const L=[], x0=cx*CS, z0=cz*CS, LW=[MODS.land,typeof POND!=='undefined'?POND.hills:null].filter(Boolean), hid=[];
    scene.traverseVisible(o=>{ if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&skip(o))hid.push(o); }); hid.forEach(o=>o.visible=false);
    const lm=LW.map(o=>o.layers.mask); LW.forEach(o=>o.layers.set(5));
    const rt0=renderer.getRenderTarget(), ac=renderer.autoClear, ov=scene.overrideMaterial, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), bg=scene.background, fg=scene.fog;
    CAM.position.set(x0+CS/2,40*T,z0+CS/2); CAM.up.set(0,0,-1); CAM.lookAt(x0+CS/2,0,z0+CS/2); CAM.updateMatrixWorld();
    renderer.setRenderTarget(RT); renderer.setClearColor(0,0); scene.background=null; scene.fog=null; renderer.autoClear=false; renderer.clear();
    CAM.layers.set(0); scene.overrideMaterial=M0; renderer.render(scene,CAM); CAM.layers.set(5); scene.overrideMaterial=M1; renderer.render(scene,CAM);
    renderer.readRenderTargetPixels(RT,0,0,R,R,PIX);
    scene.overrideMaterial=ov; renderer.setRenderTarget(rt0); renderer.autoClear=ac; renderer.setClearColor(cc,ca); scene.background=bg; scene.fog=fg;
    LW.forEach((o,i)=>o.layers.mask=lm[i]); hid.forEach(o=>o.visible=true);
    for(let r=0;r<R;r++)for(let u=0;u<R;u++){ const k=(r*R+u)*4; if(PIX[k]<128)continue; const x=x0+(u+.5)*CELL, z=z0+CS-(r+.5)*CELL, y=PIX[k+1]/255*4-.5;
      for(let n=0;n<PER;n++){ const r1=hsh(x,z,n*3+1), r2=hsh(z,x,n*3+2), r3=hsh(x+z,x-z,n*3+3); L.push([x+(r1-.5)*CELL*.8,y,z+(r2-.5)*CELL*.8,(.32+.1*r3)*T,.6+(r1-.5)*.4,r2]); } }   // (combed one way, a clump's turn within 23 degrees of it)
    if(!L.length)return null; const me=new THREE.InstancedMesh(geo,mat,L.length);
    L.forEach(([x,y,z,s,a,c],i)=>{ M.compose(V.set(x,y,z),q.setFromAxisAngle(up,a),S.set(s,s*.5,s)); me.setMatrixAt(i,M); const g1=LG[Math.floor(c*4)%4], g2=LG[Math.floor(c*28)%4]; me.setColorAt(i,col.setRGB((g1[0]+g2[0])/510,(g1[1]+g2[1])/510,(g2[2]+g1[2])/510,THREE.SRGBColorSpace)); });   // (the lawn's own four greens, two mixed)
    me.computeBoundingSphere(); me.receiveShadow=true; MAPG.bodega.add(me); WEEDS.lawnN+=L.length; return me; };
  let busy=0; WEEDS.lawnTick=()=>{ if(LVL!=='up'||(ROOMS&&ROOMS.cur))return; const pcx=Math.floor(pos.x/CS), pcz=Math.floor(pos.z/CS);
    for(const [k,me] of CH){ const [a,b]=k.split(',').map(Number); if(Math.max(Math.abs(a-pcx),Math.abs(b-pcz))>3){ if(me){ MAPG.bodega.remove(me); me.dispose(); WEEDS.lawnN-=me.count; } CH.delete(k); } }
    // the nearest missing chunk within 2, one a moment
    let best=null, bd=1e9; for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){ const k=(pcx+a)+','+(pcz+b); if(CH.has(k))continue; const d=a*a+b*b; if(d<bd){ bd=d; best=[pcx+a,pcz+b,k]; } }
    if(best){ const t0=performance.now(); CH.set(best[2],build(best[0],best[1])); busy=performance.now()-t0; WEEDS.busy=busy; } };
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); WEEDS.lawnTick(); WEEDS.moveTick(); }; };
