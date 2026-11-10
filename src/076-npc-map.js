// NPCs: makeNPC builds a body with self-shading and its cel material; the NPC list, culling and the street lane.
import {SHARED, THREE} from './003-shx.js';
import {ARCH, CHARS, CLIP, CULL, LEVELS, NPCS, ONLINE, PARK, PONDS, pos, ROOMS, SELFSH, UI, VIT, W3, WALKS, WINDOWS} from './003b-systems.js';
import {PPU, renderer, scene} from './004-main.js';
import {ASTEP, CASTLE, LEVEL, MAPG, MAPSTAIR, MODS, RING, SKINCULL, SOL, STN, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {RINGX} from './065-ring.js';
const NOYOU={x:1e6,y:0,z:1e6}, FOOT=new WeakMap();
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
function makeNPC(D,o){ const N={key:o.key,name:o.name,names:o.names,lv:o.lv||'down',hp:1,sta:1}; const geo=o.geo;
  const RG=geo.attributes.reg.array; geo.computeVertexNormals();
  N.renorm=()=>{ geo.computeVertexNormals(); const P=geo.attributes.position.array, Nn=geo.attributes.normal.array, acc=new Map(); let mx=0; for(let i=0;i<P.length;i++)mx=Math.max(mx,Math.abs(P[i]));
    const key=mx*2e3<65000?i=>((Math.round(P[i]*2e3)+65536)*131072+Math.round(P[i+1]*2e3)+65536)*131072+Math.round(P[i+2]*2e3)+65536:i=>Math.round(P[i]*2e3)+','+Math.round(P[i+1]*2e3)+','+Math.round(P[i+2]*2e3);
    for(let i=0;i<P.length;i+=3){ const k=key(i), a=acc.get(k)||[0,0,0]; a[0]+=Nn[i]; a[1]+=Nn[i+1]; a[2]+=Nn[i+2]; acc.set(k,a); }
    for(let i=0;i<P.length;i+=3){ const a=acc.get(key(i)), l=Math.hypot(...a)||1; Nn[i]=a[0]/l; Nn[i+1]=a[1]/l; Nn[i+2]=a[2]/l; } geo.attributes.normal.needsUpdate=true; geo.computeBoundingSphere(); geo.computeBoundingBox(); };
  geo.computeBoundingBox(); if(!o.skin)geo.translate(0,-geo.boundingBox.min.y,0);
  const tall=o.tall||geo.boundingBox.max.y-geo.boundingBox.min.y;
  N.renorm();
  { const n0=geo.attributes.position.count; geo.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n0),1)); if(!geo.attributes.fab)geo.setAttribute('fab',new THREE.BufferAttribute(new Float32Array(n0),1)); }
  // weld bit-identical vertices (toNonIndexed left many), keeping every attribute: no visual change, less memory. Returns the kept original indices (ascending), or null if not worth it. Safe only when nothing reshapes the body by its original vertex ranges after this.
  N.pack=ranges=>{ if(geo.index)return null; const A=geo.attributes, keys=Object.keys(A), KA=keys.map(nm=>({a:A[nm].array,sz:A[nm].itemSize})), n=A.position.count, buckets=new Map(), idx=new Uint32Array(n), uq=[];
    const eq=(i,j)=>{ for(const {a,sz} of KA)for(let c=0;c<sz;c++)if(a[i*sz+c]!==a[j*sz+c])return false; return true; }, PA=A.position.array;   // a spatial hash on position buckets likely-equal vertices; the exact compare keeps the weld lossless
    for(let i=0;i<n;i++){ const o=i*3, h=(Math.imul(PA[o]*4096|0,73856093)^Math.imul(PA[o+1]*4096|0,19349663)^Math.imul(PA[o+2]*4096|0,83492791))>>>0; let bk=buckets.get(h), u=-1; if(bk){ for(let x=0;x<bk.length;x++)if(eq(i,uq[bk[x]])){ u=bk[x]; break; } } else buckets.set(h,bk=[]); if(u<0){ u=uq.length; uq.push(i); bk.push(u); } idx[i]=u; }
    if(uq.length>n*0.95)return null;
    for(const nm of keys){ const a=A[nm], sz=a.itemSize, src=a.array, dst=new src.constructor(uq.length*sz); for(let j=0;j<uq.length;j++){ const s=uq[j]*sz, d=j*sz; for(let c=0;c<sz;c++)dst[d+c]=src[s+c]; } geo.setAttribute(nm,new THREE.BufferAttribute(dst,sz,a.normalized)); }
    geo.setIndex(new THREE.BufferAttribute(uq.length>65535?idx:Uint16Array.from(idx),1));
    if(ranges){ const lb=x=>{ let lo=0,hi=uq.length; while(lo<hi){ const m=(lo+hi)>>1; if(uq[m]<x)lo=m+1; else hi=m; } return lo; }; for(const nm in ranges){ const r=ranges[nm], s=lb(r.start); r.count=lb(r.start+r.count)-s; r.start=s; } }   // the per-part vertex ranges, remapped into the welded layout (parts stay contiguous: reg is in the weld key, so parts never share a vertex)
    return uq; };
  N.shade=()=>{ if(N.shaded)return; N.shaded=true; const P=geo.attributes.position.array, Nn=geo.attributes.normal.array, n=P.length/3, rk=o.rank, SH=geo.attributes.sh.array, w=tall*.07, grid=new Map(),
      CI=new Int32Array(n*3); let cm=0; for(let i=0;i<n*3;i++){ CI[i]=Math.floor(P[i]/w); cm=Math.max(cm,Math.abs(CI[i])); }
    const ck=cm<500?(x,y,z)=>((x+512)*1024+y+512)*1024+z+512:(x,y,z)=>x+','+y+','+z, RK=new Float64Array(n), w2=w*w*1.000001;
    for(let i=0;i<n;i++){ RK[i]=rk[RG[i]]||0; const k=ck(CI[i*3],CI[i*3+1],CI[i*3+2]); (grid.get(k)||grid.set(k,[]).get(k)).push(i); }
    for(let i=0;i<n;i++){ const r=RK[i], cx=CI[i*3], cy=CI[i*3+1], cz=CI[i*3+2], px=P[i*3], py=P[i*3+1], pz=P[i*3+2], nx=Nn[i*3], ny=Nn[i*3+1], nz=Nn[i*3+2]; let best=0;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){ const L=grid.get(ck(cx+a,cy+b,cz+c)); if(!L)continue;
        for(let q=0;q<L.length;q++){ const j=L[q]; if(RK[j]<=r)continue; const dx=P[j*3]-px, dy=P[j*3+1]-py, dz=P[j*3+2]-pz;
          if(dy<-w*.25||dx*nx+dy*ny+dz*nz<-w*.15||dx*dx+dy*dy+dz*dz>=w2)continue; const d=Math.hypot(dx,dy,dz); if(d>=w)continue; best=Math.max(best,1-d/w); } }
      SH[i]=best; }
    geo.attributes.sh.needsUpdate=true; };
  N.smCam=new THREE.OrthographicCamera(-1.8,1.8,1.8,-1.8,.1,14); N.LVP={value:new THREE.Matrix4()}; N.smU={value:W3.sm.depthTexture};   // its own shadow map only once its shadow pass runs (most characters never get one)
  const smOf=()=>{ if(!N.sm){ N.sm=new THREE.WebGLRenderTarget(256,256); N.sm.depthTexture=new THREE.DepthTexture(256,256); N.smU.value=N.sm.depthTexture; } return N.sm; };
  const EYEC=new THREE.Vector3(...(o.eyeC||'1.,.9,.3').split(',').map(Number));
  N.ct=new THREE.Color(1,1,1);
  const mat=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uL:{value:W3.Lw},uTint:{value:W3.tint},uCTint:{value:N.ct},uLv:W3.lv,uSM:N.smU,uLVP:N.LVP,uEye:{value:o.eye??-1},uEyeC:{value:EYEC}},
    vertexShader:`attribute vec3 color; attribute float sh; attribute float reg; attribute float fab; varying vec3 vC,vN,vW,vO; varying float vS,vR,vF;
      #include <skinning_pars_vertex>
      void main(){ vS=sh; vR=reg; vF=fab; vO=position; vC=pow(color,vec3(2.2)); vec3 transformed=position, objectNormal=normal;
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <skinning_vertex>
        vN=normalize(mat3(modelMatrix)*objectNormal); vec4 w=modelMatrix*vec4(transformed,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`uniform vec3 uL,uTint,uEyeC,uCTint; uniform float uLv,uEye; uniform sampler2D uSM; uniform mat4 uLVP; varying vec3 vC,vN,vW,vO; varying float vS,vR,vF;
      ${DENIM_GLSL}
      void main(){ if(abs(vR-uEye)<.5){ gl_FragColor=vec4(uEyeC,1.); return; } vec3 vC=vF>1.5?rock(vC,vO,fract(vF)):vF>.5?denim(vC,vO):vC; float l=dot(normalize(vN)*(gl_FrontFacing?1.:-1.),uL); vec3 c0=min(vec3(1.),vC*1.1), c1=vC, c2=vC*.84*vec3(.95,.97,1.04), cd=vC*.7*vec3(.92,.95,1.06), c;
        if(uLv<.5)c=l>-.3?c1:c2;
        else{ int t=l>.55?0:l>.05?1:l>-.4?2:3;
          if(uLv>1.5&&t<2){ vec4 p=uLVP*vec4(vW,1.); vec3 q=p.xyz/p.w*.5+.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-.004>texture2D(uSM,q.xy).r)t=2; }
          c=t==0?c0:t==1?c1:t==2?c2:cd; }
        if(vS>.15)c=vC*.6*vec3(.95,.97,1.05); if(vS>.55)c=vC*.36*vec3(.9,.94,1.12);
        gl_FragColor=vec4(c*uTint*uCTint,1.); }`});
  N.depthMat=new THREE.MeshDepthMaterial({side:THREE.DoubleSide});
  const toon=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide}); toon.color=N.ct;
  toon.onBeforeCompile=s=>{ s.uniforms.uEye={value:o.eye??-1}; s.uniforms.uEyeC={value:EYEC}; s.vertexShader='attribute float sh; attribute float reg; attribute float fab; varying float vS,vR,vF; varying vec3 vO;\n'+s.vertexShader.replace('#include <color_vertex>','vColor=vec4(pow(color,vec3(2.2)),1.); vS=sh; vR=reg; vF=fab; vO=position;');
    s.uniforms.uLv=W3.lv; s.uniforms.uLVP=N.LVP; s.uniforms.uSM=N.smU; s.uniforms.uSelf=W3.uSelf; s.uniforms.uMine={value:o.noSelf?0:1};
    s.vertexShader='varying vec3 vWW;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWW=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader='uniform float uLv,uSelf,uMine; uniform mat4 uLVP; uniform sampler2D uSM; varying vec3 vWW;\n'+s.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(uLv>1.5&&uMine>.5){ vec4 sp=uLVP*vec4(vWW,1.); vec3 q=sp.xyz/sp.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) gl_FragColor.rgb*=uSelf; }');
    s.fragmentShader='uniform float uEye; uniform vec3 uEyeC; varying float vS,vR,vF; varying vec3 vO;\n'+DENIM_GLSL+'\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n if(vF>1.5)diffuseColor.rgb=rock(diffuseColor.rgb,vO,fract(vF)); else if(vF>.5)diffuseColor.rgb=denim(diffuseColor.rgb,vO); diffuseColor.rgb*=vS>.55?.36:vS>.15?.6:1.;').replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;')
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(abs(vR-uEye)<.5)gl_FragColor=vec4(uEyeC,1.);'); W3.rim(s); };
  toon.customProgramCacheKey=()=>'npctoon';
  const me=o.skin?new THREE.SkinnedMesh(geo,mat):new THREE.Mesh(geo,mat); me.castShadow=true; me.receiveShadow=true; N.me=me; N.flat=mat; N.toon=toon; if(o.skin){ me.add(o.skin.bones[0]); me.bind(o.skin.skeleton); SKINCULL(me); }
  const H=o.metres/.84*TILE, s=H/tall, body=new THREE.Group(), g=new THREE.Group(); body.add(me); body.scale.set(s,s*ZU*24/TILE,s); g.add(body); MAPG[o.group||'down'].add(g);
  const TX=x=>(x+27)*TILE+STN.DX, TZ=y=>(y+73)*TILE+STN.DZ, LN=o.lane||{x0:TX(-29.5),x1:TX(-28.6),z0:TZ(-84.2),z1:TZ(-61.9)}, LX0=LN.x0, LX1=LN.x1, LZ0=LN.z0, LZ1=LN.z1, QS=new URLSearchParams(location.search), ground=o.ground||MODS.station.ground, longX=LX1-LX0>LZ1-LZ0;
  const st={x:o.x??TX(-29),z:o.z??TZ(o.at),h:Math.PI/2,to:null,wait:+(QS.get('npcwait')||2),ph:Math.random()*6,R:o.radius*TILE,v:o.speed*TILE};
  // the room a body takes (8 Nov 2026): its own width and length low on the body (never less than the radius it was given), a long one a capsule along its heading; a flyer or a body too small to trip over takes none
  { const F=FOOT.get(geo)||(()=>{ const A=geo.attributes.position; let y0=1e9,y1=-1e9; for(let i=0;i<A.count;i++){ const y=A.getY(i); if(y<y0)y0=y; if(y>y1)y1=y; } let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
      for(let i=0;i<A.count;i++){ const f=(A.getY(i)-y0)/(y1-y0||1); if(f<.1||f>.6)continue; const x=A.getX(i), z=A.getZ(i); if(x<x0)x0=x; if(x>x1)x1=x; if(z<z0)z0=z; if(z>z1)z1=z; } const r={w:x1-x0,l:z1-z0,c:(z0+z1)/2,h:y1-y0}; FOOT.set(geo,r); return r; })();
    if(F.w>0&&F.l>0){ const w=F.w*s, l=F.l*s; st.R=Math.max(st.R,.45*Math.min(w,l)); st.L=Math.max(0,.45*l-st.R); st.LZ=F.c*s; } N.tall=F.h*s*ZU*24/TILE; N.fly=!!o.fly; N.tiny=N.tall<.2; }
  { const SH=QS.get('sheet'), NA=QS.get('npcat')||(SH&&SH+',field'); if(NA){ const [k,x,z]=NA.split(','); if(k===N.key){ if(x==='field'){ st.x=SH?SHARED.BOUND.x1-.5*TILE:SHARED.BOD.XS(SHARED.BOD.MAP.x1+14); st.z=SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2); } else{ st.x=+x; st.z=+z; } st.hold=true;
    if(SH===N.key){ N.sheet=true; st.face={x:st.x+1,z:st.z+1}; st.h=Math.PI/4; } } } }
  const free=N.free=o.free||((x,z,R)=>!CLIP.hit(SOL[N.lv]||SOL.up,x,z,R)); N.ground=ground;
  Object.defineProperty(N,'home',{get:()=>st.home,set:v=>{ st.home=v&&{r:0,...v}; },enumerable:true}); HOMES.assign(st,N.key,o,free); N.walk={auto:!o.pick&&!o.brain,roam:!!o.roam,lane:LN,v:st.v};
  N.pick=()=>pick();
  const pick=()=>{ if(o.pick){ o.pick(st); return; } if(!o.roam&&HOMES.pick(st,free,LN))return; if(o.roam){ if(!ROAM.pick(st,free)){ st.to=null; st.wait=1; } return; } for(let k=0;k<12;k++){
    const r=(Math.random()<.5?-1:1)*(2+Math.random()*7)*TILE; st.to=longX?{x:Math.max(LX0,Math.min(LX1,st.x+r)),z:LZ0+Math.random()*(LZ1-LZ0)}:{x:LX0+Math.random()*(LX1-LX0),z:Math.max(LZ0,Math.min(LZ1,st.z+r))}; if(free(st.to.x,st.to.z,st.R))return; } st.to=null; st.wait=1; };
  // the nearest point of the body's spine to x,z (its middle, or along its length for a long one), from where it stands or from cx,cz
  const SP={x:0,z:0}, spine=(x,z,cx=st.x,cz=st.z)=>{ const L=st.L||0, c=st.LZ||0, sx=Math.sin(st.h), sz=Math.cos(st.h); cx+=sx*c; cz+=sz*c; const t=L?Math.max(-L,Math.min(L,(x-cx)*sx+(z-cz)*sz)):0; SP.x=cx+sx*t; SP.z=cz+sz*t; return SP; };
  const gap=(x,z,cx,cz)=>{ const p=spine(x,z,cx,cz); return Math.hypot(x-p.x,z-p.z); }, block=(x,z,R)=>gap(x,z)<st.R+R;
  N.nose=(cx,cz)=>{ const k=(st.LZ||0)+(st.L||0); return {x:cx+Math.sin(st.h)*k,z:cz+Math.cos(st.h)*k}; };
  N.tick=(dt,you)=>{ if(N.sheet&&!N.sheetOn){ N.sheetOn=true; UI.setFree(true); UI.camT.set(st.x,g.position.y+tall*s*ZU*24/TILE*.5,st.z); SHARED.ppu=SHARED.ppuTo=PPU*4; window.SHEETTURN=d=>{ SHARED.yaw=SHARED.yawTo=d*Math.PI/180; };
      for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s.background&&s.background.isColor)s.background.set(0); r0(s,c); }; }
    if(o.brain)o.brain(dt,VIT.dead?NOYOU:you,st,N);
    if(st.inT!=null){ if((st.inT-=dt)>0)return; st.inT=null; body.visible=true; st.wait=1+Math.random()*3; }
    if(N.mode==='hidden'&&!g.visible)return;
    const goIn=()=>{ st.goIn=null; st.to=null; st.inT=20+Math.random()*40; body.visible=false; };
    if(st.goIn&&st.to&&Math.hypot(st.to.x-st.x,st.to.z-st.z)<st.R+.6*TILE){ goIn(); return; }
    if(st.sx||st.sz){ const nx=st.x+st.sx*dt, nz=st.z+st.sz*dt; if(N.free(nx,nz,st.R)&&!NPCS.inway(N,nx,nz)){ st.x=nx; st.z=nz; } const k=Math.max(0,1-dt*6); st.sx*=k; st.sz*=k; if(Math.abs(st.sx)+Math.abs(st.sz)<.01)st.sx=st.sz=0; }
    let want=st.h, moving=false;
    if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez); if(d<.05){ st.to=st.next||null; st.next=null; st.wait=st.to?0:1.5+Math.random()*4; }
      else{ want=Math.atan2(ex,ez); const turn=Math.abs(((want-st.h+Math.PI*3)%(Math.PI*2))-Math.PI);
        if(turn<.5){ const step=Math.min(d,st.v*dt), nx=st.x+ex/d*step, nz=st.z+ez/d*step;
          const ns=st.L?N.nose(nx,nz):null; if(!N.free(nx,nz,st.R)||ns&&!N.free(ns.x,ns.z,st.R)){ if(st.goIn&&d<st.R+1.6*TILE){ goIn(); return; } st.to=null; st.wait=.5; }
          else if(!N.fly&&!N.tiny&&(N.lv||'up')==='up'&&pedHold(st.x,st.z,nx,nz)){ st.held=0; }
          else if(!N.fly&&!N.tiny&&(!VIT.dead&&gap(you.x,you.z,nx,nz)<st.R+.35&&gap(you.x,you.z,nx,nz)<gap(you.x,you.z)&&Math.abs(SHARED.py-g.position.y)<2||NPCS.inway(N,nx,nz))){ if((st.held=(st.held||0)+dt)>2){ st.to=null; st.held=0; st.wait=1; } }
          else{ st.x=nx; st.z=nz; moving=true; st.held=0; } } } }
    else{ if(st.face)want=Math.atan2(st.face.x-st.x,st.face.z-st.z); if(!st.hold&&(st.wait-=dt)<=0)pick(); }
    let dh=((want-st.h+Math.PI*3)%(Math.PI*2))-Math.PI; st.h+=dh*Math.min(1,dt*5);
    st.ph+=dt*(moving?o.stride:1.6);
    const hold=ASTEP.rest(N,dt,moving), ad=ASTEP.gate(N,dt); if(N.mixer)N.mixer.timeScale=hold?0:1;
    if(ad){ N._rk=o.skin?0:moving?Math.sin(st.ph)*o.rock:0; N._bb=o.skin?0:moving?Math.abs(Math.sin(st.ph))*o.bob:0; }
    const gy=N.ground(st.x,st.z)+(N._bb||0); g.position.set(st.x,gy,st.z); g.rotation.set(0,st.h,0); body.rotation.set(0,0,N._rk||0); if(!o.skin)body.scale.y=s*ZU*24/TILE;
    if(ad){ if(o.anim)o.anim(ad,moving,st,s); N._ao=g.position.y-gy; } else if(N._ao)g.position.y+=N._ao; };
  N.blocks=(x,z,R)=>st.inT==null&&block(x,z,R); N.gap=(x,z)=>gap(x,z);
  N.push=p=>{ if(st.inT!=null)return; { const J=N.rig&&N.rig.job; if(J&&(J.tray||J.broom||J.item)){ const hx=st.x+Math.sin(st.h)*.42*TILE, hz=st.z+Math.cos(st.h)*.42*TILE, dx=p.x-hx, dz=p.z-hz, d=Math.hypot(dx,dz), R=.3*TILE+.3; if(d<R&&d>1e-4){ p.x=hx+dx/d*R; p.z=hz+dz/d*R; } } }
    if(N.fly||N.tiny||Math.abs(g.position.y-SHARED.py)>2*TILE)return;
    const q=spine(p.x,p.z), qx=q.x, qz=q.z, dx=p.x-qx, dz=p.z-qz, d=Math.hypot(dx,dz), R=st.R+.3; if(!(d<R&&d>1e-4))return;
    const ux=dx/d, uz=dz/d, sp=Math.hypot(p.x-pos.x,p.z-pos.z), k=st.R>.45?0:Math.min(.75,.4+sp*3/TILE), nx=st.x-ux*(R-d)*k, nz=st.z-uz*(R-d)*k;
    if(k&&N.free(nx,nz,st.R)&&!NPCS.inway(N,nx,nz)){ st.x=nx; st.z=nz; } if(k&&sp>.05*TILE&&!(st.sx||st.sz)){ const v=Math.min(sp,.12*TILE)*28; st.sx=-ux*v; st.sz=-uz*v; } const e=spine(p.x,p.z); p.x=e.x+ux*R; p.z=e.z+uz*R; };
  N.shadowPass=renderer=>{ if(W3.lv.value<1.5||N.far||st.inT!=null||!g.visible||!g.parent.visible)return; if(!SELFSH.use(N)){ N.LVP.value.copy(SELFSH.off); return; } const mid=NPCMID.set(g.position.x,g.position.y+H*.45,g.position.z); N.smCam.position.copy(mid).addScaledVector(W3.Lw,7); N.smCam.up.set(0,Math.abs(W3.Lw.y)>.6?0:1,Math.abs(W3.Lw.y)>.6?1:0); N.smCam.lookAt(mid); N.smCam.updateMatrixWorld();
    N.LVP.value.multiplyMatrices(N.smCam.projectionMatrix,N.smCam.matrixWorldInverse); const ms=[]; g.traverse(o=>{ if(o.isMesh){ ms.push([o,o.material]); o.material=N.depthMat; } });
    renderer.setRenderTarget(smOf()); renderer.clear(); renderer.render(g,N.smCam); renderer.setRenderTarget(null); for(const [o,m] of ms)o.material=m; };
  N.selfSh=!o.noSelf;
  N.g=g; N.st=st; N.body=body; N.H=H; if(CHARS.apply)CHARS.apply(N); if(ARCH.has(N.key)){ g.visible=false; N.archived=true; (ARCH.built=ARCH.built||[]).push(N.key); return N; } NPCS.push(N); return N; }
SYS.add('shadow',r=>{ for(const N of NPCS)if(N.selfSh)try{ N.shadowPass(r); }catch(e){ if(!N.shErr){ N.shErr=1; console.warn('NPC shadow',N.key,e); } } },'npc shadows');
const STLANE={x0:SHARED.BOD.XS(SHARED.BOD.MAP.x0+2),x1:Math.min(SHARED.BOD.XS(SHARED.BOD.MAP.x1-2),RINGX.bound.x1-TILE),z0:SHARED.BOD.ZS(-76.3),z1:Math.min(SHARED.BOD.ZS(RING.wy1-1),RINGX.bound.z1-TILE)}, STHOLE=[SHARED.BOD.XS(MAPSTAIR.x0-.6),SHARED.BOD.ZS(MAPSTAIR.y0),SHARED.BOD.XS(MAPSTAIR.x1+.6),SHARED.BOD.ZS(MAPSTAIR.y1+.6)],
  CSHOLE=[SHARED.BOD.XS(CASTLE.stair.x0-.6),SHARED.BOD.ZS(CASTLE.stair.y0-.6),SHARED.BOD.XS(CASTLE.stair.x1+.6),SHARED.BOD.ZS(CASTLE.stair.y1+.6)], CSB=[SHARED.BOD.XS(CASTLE.b[0]-.5),SHARED.BOD.ZS(CASTLE.b[2]-.5),SHARED.BOD.XS(CASTLE.b[1]+.5),SHARED.BOD.ZS(CASTLE.b[3]+.5)],
  inBox=(b,x,z,R)=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R,
  inBuilding=(x,z,R)=>ROOMS.boxes().some(b=>b.y0<1&&x>b.x0-R&&x<b.x1+R&&z>b.z0-R&&z<b.z1+R)||(MODS.apts&&MODS.apts.inside&&MODS.apts.inside(x,z))||inBox(CSB,x,z,R),
  stfree=(x,z,R)=>RINGX.inside(x,z,R)&&!inBox(STHOLE,x,z,R)&&!inBox(CSHOLE,x,z,R)&&!inBuilding(x,z,R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R)&&!FOUNT.wet(x,z,R)&&!PONDS.wet(x,z,R);
// the rules of the street (owner, 9 Nov 2026: "they should know not to stand in the street , rules of the city"): a walker keeps to the sidewalks and paths, crosses Market St only on a crosswalk, and at the park gate's only on WALK
const RDX=x=>(x-SHARED.BOD.XS(0))/(SHARED.BOD.XS(1)-SHARED.BOD.XS(0)), RDZ=z=>(z-SHARED.BOD.ZS(0))/(SHARED.BOD.ZS(1)-SHARED.BOD.ZS(0)),
  xingAt=(x,y)=>{ const R=SHARED.BOD.road; return R&&R.xw?R.xw.find(w=>{ const u=w.ax==='x'?x:y, v=w.ax==='x'?y:x; return u>=w.a0&&u<=w.a1&&v>=w.l0-.5&&v<=w.h0+.5; }):null; },
  inRoad=(x,z)=>{ const R=SHARED.BOD.road; return !!(R&&R.at(RDX(x),RDZ(z))); },
  stroad=(x,z)=>inRoad(x,z)&&!xingAt(RDX(x),RDZ(z)),
  pedfree=(x,z,R)=>stfree(x,z,R)&&!stroad(x,z),
  // stepping off the kerb onto the lit crossing while it does not say WALK: wait
  pedHold=(x0,z0,x1,z1)=>{ if(inRoad(x0,z0)||!inRoad(x1,z1))return false; const w=xingAt(RDX(x1),RDZ(z1)), R=SHARED.BOD.road; return !!(w&&w.lit&&R.walk&&!R.walk()); };
window.PEDFREE=pedfree; window.STROAD=stroad;
const ROAM={L:STLANE,wallZ:SHARED.BOD.ZS(PARK.y0+PARK.oy),gate:[SHARED.BOD.XS(PARK.gate[0]+PARK.ox+.8),SHARED.BOD.XS(PARK.gate[1]+PARK.ox-.8)]};
window.ROAMDBG=()=>ROAM;
// a walk to the other side of Market St: to the nearest crosswalk's near end, then its far end
ROAM.across=(a,b)=>{ const R=SHARED.BOD.road; if(!R||!R.xw)return null; const ya=RDZ(a.z), yb=RDZ(b.z), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS; let best=null, bd=1e9;
  for(const w of R.xw){ if(w.ax!=='x'||!((ya<w.l0&&yb>w.h0)||(ya>w.h0&&yb<w.l0)))continue; const u=(w.a0+w.a1)/2, d=Math.abs(u-RDX(a.x))+Math.abs(u-RDX(b.x)); if(d<bd){ bd=d; best=[{x:X(u),z:Z(ya<w.l0?w.l0-.6:w.h0+.6)},{x:X(u),z:Z(ya<w.l0?w.h0+.6:w.l0-.6)}]; } }
  return best; };
// HOME RANGES: every character has a home, a circle it is usually found in (st.home, also N.home: {x, z, r, id, shop}; r 0 stays put). A home near a building's door (HOMES.doors: every inside but your apartment) has that building as its shop: now and then the character walks to the door and goes in for a while, hidden, its work skipped.
// The level file can place it (LEVEL.homes[id] = [x, y, r, shop] in map tiles, shop optional (null for none); id is the key, then key#2, key#3 for more of the same);
// otherwise a character first put on Market St takes the next street spot, spread along both sidewalks, and anyone else keeps the spot it was made at.
const HOMES={R:6,seen:{},slots:null,next:0};
HOMES.id=key=>{ const n=HOMES.seen[key]=(HOMES.seen[key]||0)+1; return n>1?key+'#'+n:key; };
HOMES.band=()=>{ const B=SHARED.BOD, M=LEVEL.streets.market, X=B.XS, Z=B.ZS, wall=PARK.y0+PARK.oy; return {x0:X(M.x0+6),x1:X(M.x1-6),z0:Z(B.OY),z1:Z(wall),rows:[Z((B.OY+B.CURB)/2),Z(B.FAR+3)]}; };
HOMES.street=(x,z)=>{ const b=HOMES.band(); return x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1; };
HOMES.slot=()=>{ if(!HOMES.slots){ const b=HOMES.band(), T=TILE, gap=14*T, all=[];
    for(let x=b.x0, i=0;x<=b.x1;x+=gap, i++){ all.push({x,z:b.rows[i%2]}); if(x+gap/2<=b.x1)all.push({x:x+gap/2,z:b.rows[(i+1)%2]}); }
    const n=all.length, ord=[], seen=new Set(); for(let i=0;ord.length<n&&i<n*16;i++){ let r=0, h=.5, k=i; while(k){ r+=h*(k&1); k>>=1; h/=2; } const j=Math.floor(r*n); if(!seen.has(j)){ seen.add(j); ord.push(j); } }
    for(let j=0;j<n;j++)if(!seen.has(j))ord.push(j); HOMES.slots=ord.map(j=>all[j]); }
  return HOMES.slots[HOMES.next++%HOMES.slots.length]; };
HOMES.inside=h=>{ const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*h.r; return {x:h.x+Math.sin(a)*r,z:h.z+Math.cos(a)*r}; };
HOMES.assign=(st,key,o={},free)=>{ const id=HOMES.id(key||'someone'), H=LEVEL.homes&&LEVEL.homes[id], T=TILE; let h;
  if(H)h={x:SHARED.BOD.XS(H[0]),z:SHARED.BOD.ZS(H[1]),r:(H[2]??HOMES.R)*T,...(H[3]!==undefined?{shop:H[3]}:{})};
  else if(o.home)h={r:HOMES.R*T,...o.home};
  else if((o.lv||'down')==='up'&&!o.pick&&!o.brain&&HOMES.street(st.x,st.z)){ const s=HOMES.slot(); h={x:s.x,z:s.z,r:HOMES.R*T}; }
  else h={x:st.x,z:st.z,r:(o.range??HOMES.R)*T};
  h.id=id; st.home=h;
  if(!(h.r>0)){ if(Math.hypot(st.x-h.x,st.z-h.z)>1e-6){ st.x=h.x; st.z=h.z; st.to=st.next=null; } }
  else if(Math.hypot(st.x-h.x,st.z-h.z)>h.r)for(let k=0;k<24;k++){ const p=k<23?HOMES.inside(h):h; if(k===23||!free||(()=>{ try{ return free(p.x,p.z,st.R||.3*T); }catch(e){ return true; } })()){ st.x=p.x; st.z=p.z; st.to=null; break; } } };
// a keeper whose home is in a shop off the map (059i) stands there, behind its counter facing the door, instead of working a stall outdoors
HOMES.keeper=N=>{ const H=LEVEL.homes&&LEVEL.homes[N.key], R=H&&H[3]&&ROOMS.off[H[3]]; if(!R)return false; HOMES.assign(N.st,N.key); Object.assign(N.st,{to:null,next:null,hold:true,face:{x:R.spawn[0],z:R.spawn[1]}}); return true; };
HOMES.IN=.3; HOMES.NEAR=4;
HOMES.doors=()=>{ '@later'; const B=SHARED.BOD, L=[]; for(const id in ROOMS.off){ const o=ROOMS.off[id]; if(o.door&&!o.mine)L.push({id,x:o.door[0],z:o.door[2]}); }
  for(const id in STORE.inside||{}){ const R=STORE.inside[id]; if(R.th)L.push({id,x:R.th.obj.position.x,z:R.th.obj.position.z}); }
  if(B.GD&&B.GD.door)L.push({id:'bath',x:B.X(B.GD.door[0]),z:B.Z(B.GD.door[1]+(B.GDK&&B.GDK.flip?-.35:.35))}); return L; };
HOMES.door=h=>{ '@later'; if(h.shop===null)return null; const L=HOMES.doors(); if(!L.length)return null;
  if(h.shop===undefined){ let b=null, bd=h.r+HOMES.NEAR*TILE; for(const d of L){ const k=Math.hypot(d.x-h.x,d.z-h.z); if(k<bd){ bd=k; b=d; } } h.shop=b?b.id:null; return b; }
  return L.find(d=>d.id===h.shop)||null; };
HOMES.goIn=st=>{ const h=st.home; st.goIn=null; if(!h||!(h.r>0)||Math.random()>=HOMES.IN)return false; const d=HOMES.door(h); if(!d)return false; st.to={x:d.x,z:d.z}; st.next=null; st.goIn=d.id; return true; };
HOMES.pick=(st,free,lane)=>{ '@later'; const h=st.home; if(!h||!(h.r>0))return false; if(WALKS.pick&&WALKS.pick(st))return true; if(HOMES.goIn(st))return true;
  for(let k=0;k<12;k++){ let to=HOMES.inside(h); if(lane)to={x:Math.max(lane.x0,Math.min(lane.x1,to.x)),z:Math.max(lane.z0,Math.min(lane.z1,to.z))}; if(free(to.x,to.z,st.R)&&!stroad(to.x,to.z)){ st.to=to; st.next=null; return true; } } return false; };
window.HOMES=HOMES; window.STFREE=stfree;
window.HOMESDBG=wake=>NPCS.filter(N=>{ if(wake&&N.st)N.st.wait=0; return true; }).filter(N=>N.st&&N.st.home&&N.st.home.r>0).map(N=>[N.key,N.st.home.shop===undefined?'?':N.st.home.shop,N.st.goIn||'',N.st.inT!=null?+N.st.inT.toFixed(0):'',N.far?'far':'near']);
const DUN=()=>{ const D=MODS.dungeon; if(!D)return null; const B=D.B, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, lane={x0:X(B.x0+1.2),x1:X(B.x1-1.2),z0:Z(B.y0+1.2),z1:Z(B.y1-1.2)},
    free=(x,z,R)=>x>lane.x0&&x<lane.x1&&z>lane.z0&&z<lane.z1&&!SOL.down.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R);
  let p={x:(lane.x0+lane.x1)/2,z:(lane.z0+lane.z1)/2}; for(let k=0;k<60;k++){ const q={x:lane.x0+Math.random()*(lane.x1-lane.x0),z:lane.z0+Math.random()*(lane.z1-lane.z0)}; if(free(q.x,q.z,.4*TILE)){ p=q; break; } }
  return {lv:'down',group:MAPG.dungeon?'dungeon':'down',lane,free,ground:(x,z)=>D.ground(x,z),roam:false,x:p.x,z:p.z,dun:true}; };
ROAM.pick=(st,free)=>{ '@later'; if(st.home&&!(st.home.r>0))return false; if(WALKS.pick&&WALKS.pick(st))return true; for(let k=0;k<12;k++){ const a=Math.random()*Math.PI*2, r=(2+Math.random()*7)*TILE, to={x:st.x+Math.sin(a)*r,z:st.z+Math.cos(a)*r};
    if(!free(to.x,to.z,st.R)||stroad(to.x,to.z))continue;
    const X=ROAM.across(st,to); if(X){ st.to=X[0]; st.next=X[1]; return true; }
    if((st.z<ROAM.wallZ)!==(to.z<ROAM.wallZ)){ st.next=to; st.to={x:ROAM.gate[0]+Math.random()*(ROAM.gate[1]-ROAM.gate[0]),z:ROAM.wallZ}; } else{ st.to=to; st.next=null; } return true; } return false; };
NPCS.SHADE=40*TILE; NPCS.near=(x,z,r=NPCS.SHADE)=>{ for(const N of NPCS)if(!N.shaded&&N.lv===SHARED.LVL&&Math.hypot(N.st.x-x,N.st.z-z)<r)N.shade(); };
SYS.add('near',(x,z)=>NPCS.near(x,z),'npc shading');
{ const FR=new THREE.Frustum(), M4=new THREE.Matrix4(), SP=new THREE.Sphere(), V=new THREE.Vector3(); NPCS.extra=[]; NPCS.all=()=>NPCS.concat(NPCS.extra);
  NPCS.when=(key,fn)=>SYS.onStart(()=>{ const t=()=>{ const N=NPCS.all().find(q=>q.key===key); if(N&&N.g&&N.st)fn(N); else setTimeout(t,800); }; t(); },'npc '+key);   // run fn with a character once the start is done and its body stands
  NPCS.tick=(dt,you)=>{ let shadeN=0; M4.multiplyMatrices(SHARED.cam.projectionMatrix,SHARED.cam.matrixWorldInverse); FR.setFromProjectionMatrix(M4); const R=25*TILE;
    for(const N of NPCS){ const p=N.st?V.set(N.st.x,N.g.position.y,N.st.z):N.g.position, d=Math.hypot(p.x-you.x,p.z-you.z), seen=FR.intersectsSphere(SP.set(p,Math.max(2*TILE,N.cullR||0)));
      const far=N.park&&!PARK.in||!('mode' in N)&&!N.sheet&&(!N.g.parent.visible||!LEVELS.drawn(N.g)||d>R&&!seen&&!WINDOWS.near(p.x,p.z));
      // far off (owner, 8 Nov 2026: "i want to make sure arent rendering things are levels we dont need to from things far away"): past NPCS.LOD a character is its plain shape (two boxes its own size, its colours), not posed or drawn whole; it still walks where it goes
      const lod=seen&&!far&&!N.sheet&&d>NPCS.LOD*(SHARED.lodK||1)&&!!N.g.parent.visible&&LEVELS.drawn(N.g); N.lod=lod;
      N.far=far||lod; N.hid=lod||!N.sheet&&(!seen||far&&!N.shaded||CULL.past(p.x,p.z,Math.max(TILE,N.cullR||0))); if(!N.shaded&&(!far||d<NPCS.SHADE)&&shadeN<2){ N.shade(); shadeN++; }
      if(!far&&!lod){ if(!(N.frozen>0))N.tick(dt,you); } else{ if(N.farMove&&!(N.frozen>0))N.farMove(dt); if(N.st){ N.g.position.x=N.st.x; N.g.position.z=N.st.z; if(!N.hid&&N.ground)N.g.position.y=N.ground(N.st.x,N.st.z)+(N._bb||0); } } }   // a body not ticked still stands where its character is (and on its ground, if it is drawn)
    NPCS.lodDraw();
    for(const X of NPCS.extra){ const a=X.at; X.hid=!!a&&(!FR.intersectsSphere(SP.set(V.set(a.x,(a.y||0)+1,a.z),2*TILE))||CULL.past(a.x,a.z,2*TILE)); } };
  // the far characters' plain shapes: a body box and a head box each, as tall and wide as the character's own body (measured once), one draw for all
  { const NB=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), mk=()=>{ const m=new THREE.InstancedMesh(NB,new THREE.MeshLambertMaterial({color:0xffffff}),2048); m.count=0; m.frustumCulled=false; m.castShadow=true; m.name='farfolk'; scene.add(m); return m; };
    let BODY=null, HEAD=null; const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), S3=new THREE.Vector3(), P3=new THREE.Vector3(), C=new THREE.Color(), BX=new THREE.Box3(), CL=[[.18,.2,.26],[.34,.24,.2],[.2,.3,.42],[.4,.38,.34],[.5,.2,.2],[.22,.36,.24],[.6,.55,.45],[.12,.12,.14]];
    NPCS.LOD=90*TILE;
    NPCS.lodDraw=()=>{ if(!BODY){ BODY=mk(); HEAD=mk(); } let n=0;
      for(const N of NPCS){ if(!N.lod||n>=2048)continue; if(!N.lodSz){ const v=N.g.visible; N.g.visible=true; BX.setFromObject(N.g); N.g.visible=v; const sz=BX.isEmpty()?null:BX.getSize(new THREE.Vector3()); N.lodSz=sz&&sz.y>.05?[Math.min(sz.x,sz.z,sz.y*.45),sz.y]:[.5*TILE,1.9*TILE]; }
        const [w,h]=N.lodSz, k=(N.key||'').length*7+(N.key||'').charCodeAt(0), c=CL[k%CL.length], hy=N.g.position.y;
        BODY.setMatrixAt(n,M.compose(P3.set(N.g.position.x,hy,N.g.position.z),Q.setFromAxisAngle(S3.set(0,1,0),N.g.rotation.y||0),S3.set(w,h*.82,w*.6))); BODY.setColorAt(n,C.setRGB(c[0],c[1],c[2]));
        HEAD.setMatrixAt(n,M.compose(P3.set(N.g.position.x,hy+h*.82,N.g.position.z),Q,S3.set(w*.55,h*.18,w*.55))); HEAD.setColorAt(n,C.setRGB(.78,.6,.48)); n++; }
      for(const m of [BODY,HEAD]){ m.count=n; m.instanceMatrix.needsUpdate=true; if(m.instanceColor)m.instanceColor.needsUpdate=true; } };
    window.FARFOLK=()=>({lod:NPCS.filter(N=>N.lod).length,all:NPCS.length,tris:(BODY?BODY.count:0)*24}); }
  // someone in the way (8 Nov 2026): would N standing at x,z overlap another character, a standing body or a player near you, and closer than it is now (so two who overlap can always part)
  const live=X=>X.on!==false&&X.st&&X.g&&(X.g.visible||X._cv)&&X.mode!=='hidden'&&!X.rag&&!X.far&&!X.fly&&!X.tiny&&X.st.inT==null;
  NPCS.inway=(N,x,z)=>{ const st=N.st, lv=N.lv||'up', R=st.R, ns=N.nose?N.nose(x,z):null;
    for(const q of NPCS){ if(q===N||q.far||q.lv!==lv||q.key==='dragon'||q.fly||q.tiny||q.mode==='hidden'||!q.blocks)continue; if((q.blocks(x,z,R)||ns&&q.blocks(ns.x,ns.z,R))&&q.gap(x,z)<q.gap(st.x,st.z))return true; }
    for(const X of NPCS.extra){ if(X===N||!live(X)||(X.lv||'up')!==lv)continue; const s=X.st, r=(s.R||.3)+R, d=Math.hypot(s.x-x,s.z-z); if(d<r&&d<Math.hypot(s.x-st.x,s.z-st.z))return true; }
    if(ONLINE.others&&lv===SHARED.LVL)for(const o of ONLINE.others.values()){ if(o.why!=='near you'||!o.p||o.dead)continue; const d=Math.hypot(o.p.x-x,o.p.z-z); if(d<R+.3&&d<Math.hypot(o.p.x-st.x,o.p.z-st.z))return true; }
    return false; };
  // you are kept out of the standing bodies (the cast's, NPCS.extra) as out of every other character
  NPCS.pushX=p=>{ for(const X of NPCS.extra){ if(!live(X)||(X.lv||'up')!==SHARED.LVL)continue; const s=X.st, dx=p.x-s.x, dz=p.z-s.z, d=Math.hypot(dx,dz), R=(s.R||.3)+.3; if(d<R&&d>1e-4){ p.x=s.x+dx/d*R; p.z=s.z+dz/d*R; } } };
  NPCS.R=25*TILE; NPCS.DRAW=30*TILE; NPCS.seen=(x,y,z,r)=>FR.intersectsSphere(SP.set(V.set(x,y,z),r||2*TILE)); NPCS.live=(x,y,z,r)=>Math.hypot(x-pos.x,z-pos.z)<NPCS.R&&NPCS.seen(x,y,z,r);
  NPCS.cull=on=>{ const one=(o,g)=>{ if(on){ if(o.hid&&g.visible){ g.visible=false; o._cv=true; } } else if(o._cv){ g.visible=true; o._cv=false; } };
    for(const N of NPCS)one(N,N.g); for(const X of NPCS.extra)if(X.g)one(X,X.g); }; }
export {CSB, CSHOLE, DUN, HOMES, makeNPC, pedfree, ROAM, stfree, STHOLE, STLANE};
