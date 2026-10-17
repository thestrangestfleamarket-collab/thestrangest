// ---- THE OWNER'S CHARACTERS FROM HIS MODELS (owner, 16 Oct 2026: the goldfish in his raincoat, "create this character and put him in subway";
// the bear in his jacket, "import the bear 3d model"): each the owner's own model (Meshy AI), cut down to some thousands of triangles and
// coloured face by face (the goldfish from his picture, the bear from his model's own texture).
// Each wanders the platform's back (between the wall and the benches), turns before he goes and goes at his own pace, rocking as he walks,
// stops now and then, and turns to look at you when you come near; you can't walk through him, nor he through you or the other.
// Shaded as the Walker is (walker3d): each part in close tones, light to dark, from the Walker's light (up and to the left of the screen,
// turning with the view), soft, never lines (owner: "less harsh", "fish shouldnt have lines"); two tones, four, or four and his own shadow
// (SELF), as the SHADOWS menu says; lit as a character by the light where he stands ----
const NPCS=[];
function makeNPC(D,o){ const N={key:o.key,name:o.name,names:o.names}; const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), geo=new THREE.BufferGeometry();
  const P=new Float32Array(b(D.p).buffer), RG=b(D.r); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(b(D.c),3,true));
  geo.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(RG),1)); geo.computeVertexNormals();
  // smooth normals (each corner the average of the faces that meet there), so his tones fall in bands across him, not face by face
  N.renorm=()=>{ geo.computeVertexNormals(); const P=geo.attributes.position.array, Nn=geo.attributes.normal.array, acc=new Map(), key=i=>Math.round(P[i]*2e3)+','+Math.round(P[i+1]*2e3)+','+Math.round(P[i+2]*2e3);
    for(let i=0;i<P.length;i+=3){ const k=key(i), a=acc.get(k)||[0,0,0]; a[0]+=Nn[i]; a[1]+=Nn[i+1]; a[2]+=Nn[i+2]; acc.set(k,a); }
    for(let i=0;i<P.length;i+=3){ const a=acc.get(key(i)), l=Math.hypot(...a)||1; Nn[i]=a[0]/l; Nn[i+1]=a[1]/l; Nn[i+2]=a[2]/l; } geo.attributes.normal.needsUpdate=true; geo.computeBoundingSphere(); geo.computeBoundingBox(); };
  geo.computeBoundingBox(); geo.translate(0,-geo.boundingBox.min.y,0);   // (his feet at the ground)
  const tall=geo.boundingBox.max.y-geo.boundingBox.min.y;
  N.renorm();
  // the clothes' shadows (owner, 17 Oct 2026, "coat had a shadow on the shirt ... makes look like more depth"): each part has a layer (o.rank:
  // outer clothes over inner over him), and where an outer layer lies just over an inner one (above it, on its outside) the inner one is in its
  // shadow; worked out once here, so a frame pays only a check a pixel: two steps, a mid tone, then a dark one right under the edge
  { const P=geo.attributes.position.array, Nn=geo.attributes.normal.array, n=P.length/3, rk=o.rank, SH=new Float32Array(n), w=tall*.07, grid=new Map(),
      C=i=>[Math.floor(P[i*3]/w),Math.floor(P[i*3+1]/w),Math.floor(P[i*3+2]/w)];
    for(let i=0;i<n;i++){ const k=C(i).join(); (grid.get(k)||grid.set(k,[]).get(k)).push(i); }
    for(let i=0;i<n;i++){ const r=rk[RG[i]]||0, [cx,cy,cz]=C(i); let best=0;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){ const L=grid.get((cx+a)+','+(cy+b)+','+(cz+c)); if(!L)continue;
        for(const j of L){ if((rk[RG[j]]||0)<=r)continue; const dx=P[j*3]-P[i*3], dy=P[j*3+1]-P[i*3+1], dz=P[j*3+2]-P[i*3+2], d=Math.hypot(dx,dy,dz);
          if(d>=w||dy<-w*.25||dx*Nn[i*3]+dy*Nn[i*3+1]+dz*Nn[i*3+2]<-w*.15)continue; best=Math.max(best,1-d/w); } }   // (near, not below, not behind)
      SH[i]=best; }
    geo.setAttribute('sh',new THREE.BufferAttribute(SH,1)); }
  N.sm=new THREE.WebGLRenderTarget(256,256); N.sm.depthTexture=new THREE.DepthTexture(256,256); N.smCam=new THREE.OrthographicCamera(-1.8,1.8,1.8,-1.8,.1,14); N.LVP={value:new THREE.Matrix4()};
  const mat=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uL:{value:W3.Lw},uTint:{value:W3.tint},uLv:W3.lv,uSM:{value:N.sm.depthTexture},uLVP:N.LVP},
    vertexShader:`attribute vec3 color; attribute float sh; varying vec3 vC,vN,vW; varying float vS; void main(){ vS=sh; vC=pow(color,vec3(2.2)); vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`uniform vec3 uL,uTint; uniform float uLv; uniform sampler2D uSM; uniform mat4 uLVP; varying vec3 vC,vN,vW; varying float vS;
      void main(){ float l=dot(normalize(vN)*(gl_FrontFacing?1.:-1.),uL); vec3 c0=min(vec3(1.),vC*1.1), c1=vC, c2=vC*.84*vec3(.95,.97,1.04), cd=vC*.7*vec3(.92,.95,1.06), c;
        if(uLv<.5)c=l>-.3?c1:c2;
        else{ int t=l>.55?0:l>.05?1:l>-.4?2:3;
          if(uLv>1.5&&t<2){ vec4 p=uLVP*vec4(vW,1.); vec3 q=p.xyz/p.w*.5+.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-.004>texture2D(uSM,q.xy).r)t=2; }
          c=t==0?c0:t==1?c1:t==2?c2:cd; }
        if(vS>.15)c=vC*.6*vec3(.95,.97,1.05); if(vS>.55)c=vC*.36*vec3(.9,.94,1.12);   // (the clothes' shadows)
        gl_FragColor=vec4(c*uTint,1.); }`});
  N.depthMat=new THREE.MeshDepthMaterial({side:THREE.DoubleSide});
  // lit by the lamps, as the Walker (walker3d.js): its own colours (as the model has them), the clothes' shadows on them, the scene's lights in three steps
  const toon=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.G3,side:THREE.DoubleSide});
  toon.onBeforeCompile=s=>{ s.vertexShader='attribute float sh; varying float vS;\n'+s.vertexShader.replace('#include <color_vertex>','vColor=pow(color,vec3(2.2)); vS=sh;');
    s.fragmentShader='varying float vS;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=vS>.55?.36:vS>.15?.6:1.;').replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;'); };
  toon.customProgramCacheKey=()=>'npctoon';
  const me=new THREE.Mesh(geo,mat); me.castShadow=true; me.receiveShadow=true; N.me=me; N.flat=mat; N.toon=toon;
  const H=o.metres/.84*TILE, s=H/tall, body=new THREE.Group(), g=new THREE.Group(); body.add(me); body.scale.set(s,s*ZU*24/TILE,s); g.add(body); MAPG.down.add(g);   // (his height as the world's verticals are drawn)
  // the platform's back lane, between the wall and the benches (tiles: x the platform's depth, y along it), in the scene
  const TX=x=>(x+27)*TILE+STN.DX, TZ=y=>(y+73)*TILE+STN.DZ, LX0=TX(-29.5), LX1=TX(-28.6), LZ0=TZ(-84.2), LZ1=TZ(-61.9), QS=new URLSearchParams(location.search);
  const st={x:TX(-29),z:TZ(o.at),h:Math.PI/2,to:null,wait:+(QS.get('npcwait')||2),ph:Math.random()*6,R:o.radius*TILE,v:o.speed*TILE};
  const pick=()=>{ st.to={x:LX0+Math.random()*(LX1-LX0),z:Math.max(LZ0,Math.min(LZ1,st.z+(Math.random()<.5?-1:1)*(2+Math.random()*7)*TILE))}; };
  const block=(x,z,R)=>Math.hypot(x-st.x,z-st.z)<st.R+R;
  N.tick=(dt,you)=>{ const dx=you.x-st.x, dz=you.z-st.z, near=Math.hypot(dx,dz)<3.5*TILE; let want=st.h, moving=false;
    if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez); if(d<.05){ st.to=null; st.wait=1.5+Math.random()*4; }
      else{ want=Math.atan2(ex,ez); const turn=Math.abs(((want-st.h+Math.PI*3)%(Math.PI*2))-Math.PI);
        if(turn<.5){ const step=Math.min(d,st.v*dt), nx=st.x+ex/d*step, nz=st.z+ez/d*step;
          // (he waits for you, or for the other, to be out of his way; held up long, he goes somewhere else)
          if(Math.hypot(you.x-nx,you.z-nz)<st.R+.35||NPCS.some(q=>q!==N&&q.blocks(nx,nz,st.R))){ if((st.held=(st.held||0)+dt)>2){ st.to=null; st.held=0; st.wait=1; } }
          else{ st.x=nx; st.z=nz; moving=true; st.held=0; } } } }
    else{ if(near)want=Math.atan2(dx,dz); if((st.wait-=dt)<=0&&!near)pick(); }
    let dh=((want-st.h+Math.PI*3)%(Math.PI*2))-Math.PI; st.h+=dh*Math.min(1,dt*5);
    st.ph+=dt*(moving?o.stride:1.6);
    // the walk: rocking side to side, a bob each step; standing, a slow breath
    const rock=moving?Math.sin(st.ph)*o.rock:Math.sin(st.ph)*.02, bob=moving?Math.abs(Math.sin(st.ph))*o.bob:0;
    g.position.set(st.x,MODS.station.ground(st.x,st.z)+bob,st.z); g.rotation.set(0,st.h,0); body.rotation.set(0,0,rock); body.scale.y=s*ZU*24/TILE*(moving?1:1+Math.sin(st.ph)*.012); };
  N.blocks=(x,z,R)=>block(x,z,R);
  // push you out of him (collide's last step)
  N.push=p=>{ const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz), R=st.R+.3; if(d<R&&d>1e-4){ p.x=st.x+dx/d*R; p.z=st.z+dz/d*R; } };
  // SELF: his depth from his light each frame (only at that level), the camera looking down the light at him
  N.shadowPass=renderer=>{ if(W3.lv.value<1.5)return; const mid=new THREE.Vector3(st.x,g.position.y+H*.45,st.z); N.smCam.position.copy(mid).addScaledVector(W3.Lw,7); N.smCam.lookAt(mid); N.smCam.updateMatrixWorld();
    N.LVP.value.multiplyMatrices(N.smCam.projectionMatrix,N.smCam.matrixWorldInverse); const m0=me.material; me.material=N.depthMat; renderer.setRenderTarget(N.sm); renderer.clear(); renderer.render(g,N.smCam); renderer.setRenderTarget(null); me.material=m0; };
  { const s0=W3.shadowPass; W3.shadowPass=r=>{ s0(r); N.shadowPass(r); }; }
  N.g=g; N.st=st; N.body=body; N.H=H; NPCS.push(N); return N; }
const FISH=makeNPC(GOLDFISH,{key:'fish',name:'GOLDFISH',names:['eyes','eye rims','head','hood','lips','chin','raincoat','fins and tail'],metres:.95,rank:[0,0,0,2,0,0,2,0],at:-77,radius:.42,speed:.55,stride:9,rock:.14,bob:.05});
const BEAR=makeNPC(BEARD,{key:'bear',name:'BEAR',names:BEARD.names,metres:1.9,rank:[0,0,0,0,2,3,0,1,0],at:-67,radius:.45,speed:.7,stride:5.5,rock:.05,bob:.035});
