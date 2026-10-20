const NPCS=[], NOYOU={x:1e6,y:0,z:1e6};
const DENIM_GLSL=`vec3 denim(vec3 c,vec3 p){ float u=(p.x+p.z)*0.7071+p.y*0.5, v=(p.x-p.z)*0.7071-p.y*0.5;
  float rib=step(0.5,fract(u*170.)), weft=step(0.55,fract(v*240.)), slub=step(0.93,fract(sin(dot(floor(vec2(u,v)*300.),vec2(12.9898,78.233)))*43758.5));
  vec3 warp=c*vec3(1.22,1.18,1.1), weftc=c*0.78; vec3 o=mix(weftc,warp,rib*0.55+weft*0.25); return mix(o,c*1.3,slub*0.5); }
vec3 rkh(vec3 p){ p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453); }
vec3 rock(vec3 c,vec3 p0,float sd){ vec3 p=p0*3.+sd*17.3, i=floor(p), f=fract(p), id=i; float d1=9., d2=9.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){ vec3 g=vec3(x,y,z), r=g+rkh(i+g)*.85-f; float d=dot(r,r); if(d<d1){ d2=d1; d1=d; id=i+g; } else if(d<d2)d2=d; }
  vec3 h=rkh(id+3.1); float edge=sqrt(d2)-sqrt(d1), tone=.72+.16*floor(h.x*4.);
  vec3 o=c*tone*(h.y<.5?vec3(1.05,1.,.92):vec3(.95,.98,1.04));
  float g=rkh(floor(p*13.)).x; o*=g<.14?.78:g>.9?1.16:1.;
  float ls=rkh(floor(p*4.)+7.).z; if(h.z<.22&&ls<.4)o=c*vec3(.62,.78,.5)*(g<.5?.9:1.);
  if(p0.y<.55&&ls<.3+(.55-p0.y)*.6)o=c*vec3(.45,.6,.38)*(g<.5?.85:1.);
  if(edge<.07)o=c*(edge<.035?.3:.5);
  return o; }`;
const NPCMID=new THREE.Vector3();
function makeNPC(D,o){ const N={key:o.key,name:o.name,names:o.names,lv:o.lv||'down',hp:1,sta:1}; const b=B64, geo=o.geo||new THREE.BufferGeometry();
  if(!o.geo){ const P=new Float32Array(b(D.p).buffer); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(b(D.c),3,true)); geo.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(b(D.r)),1)); }
  const RG=geo.attributes.reg.array; geo.computeVertexNormals();
  N.renorm=()=>{ geo.computeVertexNormals(); const P=geo.attributes.position.array, Nn=geo.attributes.normal.array, acc=new Map(), key=i=>Math.round(P[i]*2e3)+','+Math.round(P[i+1]*2e3)+','+Math.round(P[i+2]*2e3);
    for(let i=0;i<P.length;i+=3){ const k=key(i), a=acc.get(k)||[0,0,0]; a[0]+=Nn[i]; a[1]+=Nn[i+1]; a[2]+=Nn[i+2]; acc.set(k,a); }
    for(let i=0;i<P.length;i+=3){ const a=acc.get(key(i)), l=Math.hypot(...a)||1; Nn[i]=a[0]/l; Nn[i+1]=a[1]/l; Nn[i+2]=a[2]/l; } geo.attributes.normal.needsUpdate=true; geo.computeBoundingSphere(); geo.computeBoundingBox(); };
  geo.computeBoundingBox(); if(!o.skin)geo.translate(0,-geo.boundingBox.min.y,0);
  const tall=o.tall||geo.boundingBox.max.y-geo.boundingBox.min.y;
  N.renorm();
  { const P=geo.attributes.position.array, Nn=geo.attributes.normal.array, n=P.length/3, rk=o.rank, SH=new Float32Array(n), w=tall*.07, grid=new Map(),
      C=i=>[Math.floor(P[i*3]/w),Math.floor(P[i*3+1]/w),Math.floor(P[i*3+2]/w)];
    for(let i=0;i<n;i++){ const k=C(i).join(); (grid.get(k)||grid.set(k,[]).get(k)).push(i); }
    for(let i=0;i<n;i++){ const r=rk[RG[i]]||0, [cx,cy,cz]=C(i); let best=0;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){ const L=grid.get((cx+a)+','+(cy+b)+','+(cz+c)); if(!L)continue;
        for(const j of L){ if((rk[RG[j]]||0)<=r)continue; const dx=P[j*3]-P[i*3], dy=P[j*3+1]-P[i*3+1], dz=P[j*3+2]-P[i*3+2], d=Math.hypot(dx,dy,dz);
          if(d>=w||dy<-w*.25||dx*Nn[i*3]+dy*Nn[i*3+1]+dz*Nn[i*3+2]<-w*.15)continue; best=Math.max(best,1-d/w); } }
      SH[i]=best; }
    geo.setAttribute('sh',new THREE.BufferAttribute(SH,1)); if(!geo.attributes.fab)geo.setAttribute('fab',new THREE.BufferAttribute(new Float32Array(n),1)); }
  N.sm=new THREE.WebGLRenderTarget(256,256); N.sm.depthTexture=new THREE.DepthTexture(256,256); N.smCam=new THREE.OrthographicCamera(-1.8,1.8,1.8,-1.8,.1,14); N.LVP={value:new THREE.Matrix4()};
  const EYEC=new THREE.Vector3(...(o.eyeC||'1.,.9,.3').split(',').map(Number));
  const mat=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uL:{value:W3.Lw},uTint:{value:W3.tint},uLv:W3.lv,uSM:{value:N.sm.depthTexture},uLVP:N.LVP,uEye:{value:o.eye??-1},uEyeC:{value:EYEC}},
    vertexShader:`attribute vec3 color; attribute float sh; attribute float reg; attribute float fab; varying vec3 vC,vN,vW,vO; varying float vS,vR,vF;
      #include <skinning_pars_vertex>
      void main(){ vS=sh; vR=reg; vF=fab; vO=position; vC=pow(color,vec3(2.2)); vec3 transformed=position, objectNormal=normal;
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <skinning_vertex>
        vN=normalize(mat3(modelMatrix)*objectNormal); vec4 w=modelMatrix*vec4(transformed,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`uniform vec3 uL,uTint,uEyeC; uniform float uLv,uEye; uniform sampler2D uSM; uniform mat4 uLVP; varying vec3 vC,vN,vW,vO; varying float vS,vR,vF;
      ${DENIM_GLSL}
      void main(){ if(abs(vR-uEye)<.5){ gl_FragColor=vec4(uEyeC,1.); return; } vec3 vC=vF>1.5?rock(vC,vO,fract(vF)):vF>.5?denim(vC,vO):vC; float l=dot(normalize(vN)*(gl_FrontFacing?1.:-1.),uL); vec3 c0=min(vec3(1.),vC*1.1), c1=vC, c2=vC*.84*vec3(.95,.97,1.04), cd=vC*.7*vec3(.92,.95,1.06), c;
        if(uLv<.5)c=l>-.3?c1:c2;
        else{ int t=l>.55?0:l>.05?1:l>-.4?2:3;
          if(uLv>1.5&&t<2){ vec4 p=uLVP*vec4(vW,1.); vec3 q=p.xyz/p.w*.5+.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-.004>texture2D(uSM,q.xy).r)t=2; }
          c=t==0?c0:t==1?c1:t==2?c2:cd; }
        if(vS>.15)c=vC*.6*vec3(.95,.97,1.05); if(vS>.55)c=vC*.36*vec3(.9,.94,1.12);
        gl_FragColor=vec4(c*uTint,1.); }`});
  N.depthMat=new THREE.MeshDepthMaterial({side:THREE.DoubleSide});
  const toon=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
  toon.onBeforeCompile=s=>{ s.uniforms.uEye={value:o.eye??-1}; s.uniforms.uEyeC={value:EYEC}; s.vertexShader='attribute float sh; attribute float reg; attribute float fab; varying float vS,vR,vF; varying vec3 vO;\n'+s.vertexShader.replace('#include <color_vertex>','vColor=pow(color,vec3(2.2)); vS=sh; vR=reg; vF=fab; vO=position;');
    s.uniforms.uLv=W3.lv; s.uniforms.uLVP=N.LVP; s.uniforms.uSM={value:N.sm.depthTexture}; s.uniforms.uSelf=W3.uSelf; s.uniforms.uMine={value:o.noSelf?0:1};
    s.vertexShader='varying vec3 vWW;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWW=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader='uniform float uLv,uSelf,uMine; uniform mat4 uLVP; uniform sampler2D uSM; varying vec3 vWW;\n'+s.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(uLv>1.5&&uMine>.5){ vec4 sp=uLVP*vec4(vWW,1.); vec3 q=sp.xyz/sp.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) gl_FragColor.rgb*=uSelf; }');
    s.fragmentShader='uniform float uEye; uniform vec3 uEyeC; varying float vS,vR,vF; varying vec3 vO;\n'+DENIM_GLSL+'\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n if(vF>1.5)diffuseColor.rgb=rock(diffuseColor.rgb,vO,fract(vF)); else if(vF>.5)diffuseColor.rgb=denim(diffuseColor.rgb,vO); diffuseColor.rgb*=vS>.55?.36:vS>.15?.6:1.;').replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;')
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(abs(vR-uEye)<.5)gl_FragColor=vec4(uEyeC,1.);').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.025;'); };
  toon.customProgramCacheKey=()=>'npctoon';
  const me=o.skin?new THREE.SkinnedMesh(geo,mat):new THREE.Mesh(geo,mat); me.castShadow=true; me.receiveShadow=true; N.me=me; N.flat=mat; N.toon=toon; if(o.skin){ me.add(o.skin.bones[0]); me.bind(o.skin.skeleton); me.frustumCulled=false; }
  const H=o.metres/.84*TILE, s=H/tall, body=new THREE.Group(), g=new THREE.Group(); body.add(me); body.scale.set(s,s*ZU*24/TILE,s); g.add(body); MAPG[o.group||'down'].add(g);
  const TX=x=>(x+27)*TILE+STN.DX, TZ=y=>(y+73)*TILE+STN.DZ, LN=o.lane||{x0:TX(-29.5),x1:TX(-28.6),z0:TZ(-84.2),z1:TZ(-61.9)}, LX0=LN.x0, LX1=LN.x1, LZ0=LN.z0, LZ1=LN.z1, QS=new URLSearchParams(location.search), ground=o.ground||MODS.station.ground, longX=LX1-LX0>LZ1-LZ0;
  const st={x:o.x??TX(-29),z:o.z??TZ(o.at),h:Math.PI/2,to:null,wait:+(QS.get('npcwait')||2),ph:Math.random()*6,R:o.radius*TILE,v:o.speed*TILE};
  { const SH=QS.get('sheet'), NA=QS.get('npcat')||(SH&&SH+',field'); if(NA){ const [k,x,z]=NA.split(','); if(k===N.key){ if(x==='field'){ st.x=SH?BOUND.x1-.5*TILE:BOD.XS(BOD.MAP.x1+14); st.z=BOD.ZS((BOD.MAP.y0+BOD.MAP.y1)/2); } else{ st.x=+x; st.z=+z; } st.hold=true;
    if(SH===N.key){ N.sheet=true; st.face={x:st.x+1,z:st.z+1}; st.h=Math.PI/4; } } } }
  const free=N.free=o.free||((x,z,R)=>!CLIP.hit(SOL[N.lv]||SOL.up,x,z,R)); N.ground=ground;
  N.pick=()=>pick();
  const pick=()=>{ '@later'; if(o.pick){ o.pick(st); return; } if(o.roam){ if(!ROAM.pick(st,free)){ st.to=null; st.wait=1; } return; } for(let k=0;k<12;k++){
    const r=(Math.random()<.5?-1:1)*(2+Math.random()*7)*TILE; st.to=longX?{x:Math.max(LX0,Math.min(LX1,st.x+r)),z:LZ0+Math.random()*(LZ1-LZ0)}:{x:LX0+Math.random()*(LX1-LX0),z:Math.max(LZ0,Math.min(LZ1,st.z+r))}; if(free(st.to.x,st.to.z,st.R))return; } st.to=null; st.wait=1; };
  const block=(x,z,R)=>Math.hypot(x-st.x,z-st.z)<st.R+R;
  N.tick=(dt,you)=>{ if(N.sheet&&!N.sheetOn){ N.sheetOn=true; UI.setFree(true); UI.camT.set(st.x,g.position.y+tall*s*ZU*24/TILE*.5,st.z); ppu=ppuTo=PPU*4; window.SHEETTURN=d=>{ yaw=yawTo=d*Math.PI/180; };
      for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s.background&&s.background.isColor)s.background.set(0); r0(s,c); }; }
    if(o.brain)o.brain(dt,VIT.dead?NOYOU:you,st,N);
    if(N.mode==='hidden'&&!g.visible)return;
    if(st.sx||st.sz){ const nx=st.x+st.sx*dt, nz=st.z+st.sz*dt; if(N.free(nx,nz,st.R)){ st.x=nx; st.z=nz; } const k=Math.max(0,1-dt*6); st.sx*=k; st.sz*=k; if(Math.abs(st.sx)+Math.abs(st.sz)<.01)st.sx=st.sz=0; }
    let want=st.h, moving=false;
    if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez); if(d<.05){ st.to=st.next||null; st.next=null; st.wait=st.to?0:1.5+Math.random()*4; }
      else{ want=Math.atan2(ex,ez); const turn=Math.abs(((want-st.h+Math.PI*3)%(Math.PI*2))-Math.PI);
        if(turn<.5){ const step=Math.min(d,st.v*dt), nx=st.x+ex/d*step, nz=st.z+ez/d*step;
          if(!N.free(nx,nz,st.R)){ st.to=null; st.wait=.5; }
          else if(!VIT.dead&&Math.hypot(you.x-nx,you.z-nz)<st.R+.35&&Math.abs(py-g.position.y)<2||NPCS.some(q=>q!==N&&!q.far&&q.lv===N.lv&&q.key!=='dragon'&&q.mode!=='hidden'&&q.blocks(nx,nz,st.R)&&q.gap(nx,nz)<q.gap(st.x,st.z))){ if((st.held=(st.held||0)+dt)>2){ st.to=null; st.held=0; st.wait=1; } }
          else{ st.x=nx; st.z=nz; moving=true; st.held=0; } } } }
    else{ if(st.face)want=Math.atan2(st.face.x-st.x,st.face.z-st.z); if(!st.hold&&(st.wait-=dt)<=0)pick(); }
    let dh=((want-st.h+Math.PI*3)%(Math.PI*2))-Math.PI; st.h+=dh*Math.min(1,dt*5);
    st.ph+=dt*(moving?o.stride:1.6);
    const hold=ASTEP.rest(N,dt,moving), ad=ASTEP.gate(N,dt); if(N.mixer)N.mixer.timeScale=hold?0:1;
    if(ad){ N._rk=o.skin?0:moving?Math.sin(st.ph)*o.rock:0; N._bb=o.skin?0:moving?Math.abs(Math.sin(st.ph))*o.bob:0; }
    const gy=N.ground(st.x,st.z)+(N._bb||0); g.position.set(st.x,gy,st.z); g.rotation.set(0,st.h,0); body.rotation.set(0,0,N._rk||0); if(!o.skin)body.scale.y=s*ZU*24/TILE;
    if(ad){ if(o.anim)o.anim(ad,moving,st,s); N._ao=g.position.y-gy; } else if(N._ao)g.position.y+=N._ao; };
  N.blocks=(x,z,R)=>block(x,z,R); N.gap=(x,z)=>Math.hypot(x-st.x,z-st.z);
  N.push=p=>{ '@later'; const dx=p.x-st.x, dz=p.z-st.z, d=Math.hypot(dx,dz), R=st.R+.3; if(!(d<R&&d>1e-4))return;
    const ux=dx/d, uz=dz/d, sp=Math.hypot(p.x-pos.x,p.z-pos.z), k=Math.min(.75,.4+sp*3/TILE), nx=st.x-ux*(R-d)*k, nz=st.z-uz*(R-d)*k;
    if(N.free(nx,nz,st.R)){ st.x=nx; st.z=nz; } if(sp>.05*TILE&&!(st.sx||st.sz)){ const v=Math.min(sp,.12*TILE)*28; st.sx=-ux*v; st.sz=-uz*v; } p.x=st.x+ux*R; p.z=st.z+uz*R; };
  N.shadowPass=renderer=>{ if(W3.lv.value<1.5||N.far||!g.visible||!g.parent.visible)return; if(typeof SELFSH!=='undefined'&&!SELFSH.use(N)){ N.LVP.value.copy(SELFSH.off); return; } const mid=NPCMID.set(g.position.x,g.position.y+H*.45,g.position.z); N.smCam.position.copy(mid).addScaledVector(W3.Lw,7); N.smCam.up.set(0,Math.abs(W3.Lw.y)>.6?0:1,Math.abs(W3.Lw.y)>.6?1:0); N.smCam.lookAt(mid); N.smCam.updateMatrixWorld();
    N.LVP.value.multiplyMatrices(N.smCam.projectionMatrix,N.smCam.matrixWorldInverse); const ms=[]; g.traverse(o=>{ if(o.isMesh){ ms.push([o,o.material]); o.material=N.depthMat; } });
    renderer.setRenderTarget(N.sm); renderer.clear(); renderer.render(g,N.smCam); renderer.setRenderTarget(null); for(const [o,m] of ms)o.material=m; };
  if(!o.noSelf){ const s0=W3.shadowPass; W3.shadowPass=r=>{ s0(r); N.shadowPass(r); }; }
  N.g=g; N.st=st; N.body=body; N.H=H; NPCS.push(N); return N; }
const STLANE={x0:BOD.XS(BOD.MAP.x0+2),x1:Math.min(BOD.XS(BOD.MAP.x1-2),RINGX.bound.x1-TILE),z0:BOD.ZS(-76.3),z1:Math.min(BOD.ZS(RING.ny1-1),RINGX.bound.z1-TILE)}, STHOLE=[BOD.XS(MAPSTAIR.x0-.6),BOD.ZS(MAPSTAIR.y0),BOD.XS(MAPSTAIR.x1+.6),BOD.ZS(MAPSTAIR.y1+.6)],
  CSHOLE=[BOD.XS(CASTLE.stair.x0-.6),BOD.ZS(CASTLE.stair.y0-.6),BOD.XS(CASTLE.stair.x1+.6),BOD.ZS(CASTLE.stair.y1+.6)], CSB=[BOD.XS(CASTLE.b[0]-.5),BOD.ZS(CASTLE.b[2]-.5),BOD.XS(CASTLE.b[1]+.5),BOD.ZS(CASTLE.b[3]+.5)],
  inBox=(b,x,z,R)=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R,
  inBuilding=(x,z,R)=>ROOMS.boxes().some(b=>b.y0<1&&x>b.x0-R&&x<b.x1+R&&z>b.z0-R&&z<b.z1+R)||(MODS.apts&&MODS.apts.inside&&MODS.apts.inside(x,z))||inBox(CSB,x,z,R),
  stfree=(x,z,R)=>RINGX.inside(x,z,R)&&!inBox(STHOLE,x,z,R)&&!inBox(CSHOLE,x,z,R)&&!inBuilding(x,z,R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R)&&!FOUNT.wet(x,z,R);
const ROAM={L:STLANE,wallZ:BOD.ZS(PARK.y0+PARK.oy),gate:[BOD.XS(PARK.gate[0]+PARK.ox+.8),BOD.XS(PARK.gate[1]+PARK.ox-.8)]};
window.ROAMDBG=()=>ROAM; window.STFREE=stfree;
const DUN=()=>{ const D=MODS.dungeon; if(!D)return null; const B=D.B, X=BOD.XS, Z=BOD.ZS, lane={x0:X(B.x0+1.2),x1:X(B.x1-1.2),z0:Z(B.y0+1.2),z1:Z(B.y1-1.2)},
    free=(x,z,R)=>x>lane.x0&&x<lane.x1&&z>lane.z0&&z<lane.z1&&!SOL.down.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R);
  let p={x:(lane.x0+lane.x1)/2,z:(lane.z0+lane.z1)/2}; for(let k=0;k<60;k++){ const q={x:lane.x0+Math.random()*(lane.x1-lane.x0),z:lane.z0+Math.random()*(lane.z1-lane.z0)}; if(free(q.x,q.z,.4*TILE)){ p=q; break; } }
  return {lv:'down',group:MAPG.dungeon?'dungeon':'down',lane,free,ground:(x,z)=>D.ground(x,z),roam:false,x:p.x,z:p.z,dun:true}; };
ROAM.pick=(st,free)=>{ '@later'; const L=ROAM.L; for(let k=0;k<12;k++){ let to;
    if(Math.random()<.25)to={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)};
    else{ const a=Math.random()*Math.PI*2, r=(2+Math.random()*7)*TILE; to={x:Math.max(L.x0,Math.min(L.x1,st.x+Math.sin(a)*r)),z:Math.max(L.z0,Math.min(L.z1,st.z+Math.cos(a)*r))}; }
    if(!free(to.x,to.z,st.R))continue;
    if((st.z<ROAM.wallZ)!==(to.z<ROAM.wallZ)){ st.next=to; st.to={x:ROAM.gate[0]+Math.random()*(ROAM.gate[1]-ROAM.gate[0]),z:ROAM.wallZ}; } else{ st.to=to; st.next=null; } return true; } return false; };
{ const FR=new THREE.Frustum(), M4=new THREE.Matrix4(), SP=new THREE.Sphere(), V=new THREE.Vector3(); NPCS.extra=[];
  NPCS.tick=(dt,you)=>{ M4.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); FR.setFromProjectionMatrix(M4); const R=25*TILE, LV=LIVES.on;
    for(const N of NPCS){ const p=N.g.position, d=Math.hypot(p.x-you.x,p.z-you.z), seen=FR.intersectsSphere(SP.set(p,Math.max(2*TILE,N.cullR||0)));
      const far=N.park&&!PARK.in||(LIVES.force==='near'?false:LIVES.force==='half'&&!('mode' in N)?!!(NPCS.indexOf(N)&1):!('mode' in N)&&!N.sheet&&(!N.g.parent.visible||(LV?(LIVES.ready&&LIVES.hidden(N))||d>4*TILE&&!FR.intersectsSphere(SP.set(p,3*TILE)):d>R&&!seen)));
      N.far=far; N.hid=!N.sheet&&(far||!seen);
      if(!far)N.tick(dt,you); else if(N.farMove)N.farMove(dt); }
    for(const X of NPCS.extra){ const a=X.at; X.hid=!!a&&!FR.intersectsSphere(SP.set(V.set(a.x,(a.y||0)+1,a.z),2*TILE)); }
    LIVES.tick(dt,you); };
  NPCS.cull=on=>{ const one=(o,g)=>{ if(on){ if(o.hid&&g.visible){ g.visible=false; o._cv=true; } } else if(o._cv){ g.visible=true; o._cv=false; } };
    for(const N of NPCS)one(N,N.g); for(const X of NPCS.extra)if(X.g)one(X,X.g); PXSNAP(on); }; }
const PXSNAP=on=>{ const L=PXSNAP.L;
  if(!on){ for(let i=0;i<L.length;i+=4){ const p=L[i].position; p.x-=L[i+1]; p.y-=L[i+2]; p.z-=L[i+3]; } L.length=0; return; }
  if(UI.persp||!UI.snR)return; PXSNAP.u=rppu(); const one=PXSNAP.one;
  if(typeof W3!=='undefined'&&W3.group&&one(W3.group,UI.snD)){ const c=W3.smCam, M=W3.LVP, n=L.length, dx=L[n-3], dy=L[n-2], dz=L[n-1];
    c.position.x+=dx; c.position.y+=dy; c.position.z+=dz; L.push(c,dx,dy,dz); c.updateMatrixWorld(); if(M)M.value.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse); }
  for(const N of NPCS)if(!N.far)one(N.g);
  for(const X of NPCS.extra)if(X.g)one(X.g); };
PXSNAP.one=(o,D)=>{ if(!o||!o.visible)return false; const u=PXSNAP.u, cr=UI.snR, cu=UI.snU, p=o.position, x=p.dot(cr), y=p.dot(cu), a=Math.round(x*u)/u-x, b=Math.round(y*u)/u-y, dx=D?D.x:cr.x*a+cu.x*b, dy=D?D.y:cr.y*a+cu.y*b, dz=D?D.z:cr.z*a+cu.z*b;
  p.x+=dx; p.y+=dy; p.z+=dz; PXSNAP.L.push(o,dx,dy,dz); return true; };
PXSNAP.L=[]; window.PXSNAP=PXSNAP;
