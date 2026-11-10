// UNDER THE STREET: the water's shader, the station and platform under the street (grab('down')), the day's start and FADE.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CULL, keys, LEVELS, pos, RAG, ROOMS, SHAD, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {cutWalls, FADE, FIX, grab, LAMPD, LAMPI, lamps, MAPSTAIR, MODS, QS, SECTIONS, SOL, STN, SYS, TILE, ZU} from './006-map-pre.js';
import {OBJ} from './008-batch.js';
const WATER={drops:[], uH:{value:null}, uWB:{value:new THREE.Vector4()}, uLevel:{value:0}, uGrid:{value:new THREE.Vector2()}, uCK:{value:+(QS0=>QS0.get('ck')||160)(new URLSearchParams(location.search))}, mats:[]};
WATER.caustic=m=>{ '@later'; m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uH:WATER.uH,uWB:WATER.uWB,uLevel:WATER.uLevel,uGrid:WATER.uGrid,uCK:WATER.uCK});
  sh.vertexShader='varying vec3 vWp;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWp=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader='uniform sampler2D uH; uniform vec4 uWB; uniform float uLevel,uCK; uniform vec2 uGrid; varying vec3 vWp;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
  if(vWp.y<uLevel){ vec2 uv=(vWp.xz-uWB.xy)/(uWB.zw-uWB.xy); uv=clamp(uv,0.,1.); vec2 t=1./uGrid; float c=texture2D(uH,uv).r;
    float lap=texture2D(uH,uv+vec2(t.x,0.)).r+texture2D(uH,uv-vec2(t.x,0.)).r+texture2D(uH,uv+vec2(0.,t.y)).r+texture2D(uH,uv-vec2(0.,t.y)).r-4.*c;
    float k=clamp(-lap*uCK,-0.45,1.6)*smoothstep(0.,0.4,uLevel-vWp.y); gl_FragColor.rgb+=gl_FragColor.rgb*k*vec3(.75,.92,1.); }`); }; m.needsUpdate=true; WATER.mats.push(m); };
const waterBody=(WATER,cfg)=>{ '@later'; const {X0,X1,Z0,Z1,lvl,GX,GY}=cfg, W=X1-X0, D=Z1-Z0;
  WATER.uWB.value.set(X0,Z0,X1,Z1); WATER.uLevel.value=lvl; WATER.uGrid.value.set(GX,GY); Object.assign(WATER,{X0,Z0,W,D,lvl});
  const o={type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,wrapS:THREE.ClampToEdgeWrapping,wrapT:THREE.ClampToEdgeWrapping,depthBuffer:false};
  WATER.A=new THREE.WebGLRenderTarget(GX,GY,o); WATER.B=new THREE.WebGLRenderTarget(GX,GY,o); WATER.uH.value=WATER.A.texture;
  const MPU=0.84/TILE, dep=new Float32Array(GX*GY*4);
  for(let j=0;j<GY;j++)for(let i=0;i<GX;i++)dep[(j*GX+i)*4]=cfg.dep((i+.5)/GX,(j+.5)/GY);
  const depT=new THREE.DataTexture(dep,GX,GY,THREE.RGBAFormat,THREE.FloatType); depT.needsUpdate=true; Object.assign(WATER,{MPU,GX,GY,dx:W/GX});
  WATER.simMat=new THREE.ShaderMaterial({uniforms:{uPrev:{value:null},uDep:{value:depT},uT:{value:new THREE.Vector2(1/GX,1/GY)},uSize:{value:new THREE.Vector2(W,D)},uDrop:{value:Array.from({length:8},()=>new THREE.Vector4())},uN:{value:0},
      uDt:{value:1/120},uDx:{value:W/GX},uMpu:{value:MPU},uK:{value:2*Math.PI/1.2},uDamp:{value:2.2}},
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy*2.,0.,1.); }`,
    fragmentShader:`uniform sampler2D uPrev,uDep; uniform vec2 uT,uSize; uniform vec4 uDrop[8]; uniform int uN; uniform float uDt,uDx,uMpu,uK,uDamp; varying vec2 vUv;
    void main(){ vec4 c=texture2D(uPrev,vUv), e=texture2D(uPrev,vUv+vec2(uT.x,0.)), w=texture2D(uPrev,vUv-vec2(uT.x,0.)), n=texture2D(uPrev,vUv+vec2(0.,uT.y)), s=texture2D(uPrev,vUv-vec2(0.,uT.y));
      vec4 lp=(e+w+n+s-4.*c)/(uDx*uDx); float lap=lp.r;
      float d=texture2D(uDep,vUv).r, cm=sqrt(9.81/uK*min(1.,tanh(min(uK*d,8.)))), cw=cm/uMpu;
      c.g+=uDt*(cw*cw*lap+0.01*lp.g); c.g*=exp(-uDamp*uDt); c.r+=uDt*c.g; c.r*=0.99995;
      c.r=clamp(c.r,-0.6,0.6); c.g=clamp(c.g,-8.,8.); if(!(c.r==c.r)||!(c.g==c.g)) c=vec4(0.);
      for(int i=0;i<8;i++){ if(i>=uN)break; vec4 d=uDrop[i]; float r=length((vUv-d.xy)*uSize); if(r<d.z) c.r-=d.w*(0.5+0.5*cos(3.14159*r/d.z)); }
      gl_FragColor=c; }`});
  WATER.simScene=new THREE.Scene(); WATER.simCam=new THREE.Camera(); WATER.simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),WATER.simMat));
  WATER.rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType}); WATER.rt.depthTexture=new THREE.DepthTexture(4,4); WATER.rt.depthTexture.type=THREE.FloatType;
  const g=new THREE.PlaneGeometry(W,D,GX-1,GY-1); g.rotateX(-Math.PI/2);
  WATER.mat=new THREE.ShaderMaterial({uniforms:{uH:WATER.uH,uScene:{value:WATER.rt.texture},uDepth:{value:WATER.rt.depthTexture},uRes:{value:new THREE.Vector2(4,4)},uGrid:WATER.uGrid,
      uAmp:{value:1},uCell:{value:new THREE.Vector2(W/GX,D/GY)},uNear:{value:0.1},uFar:{value:800},uRefr:{value:0.05},uAbs:{value:+(new URLSearchParams(location.search).get('abs')||0.55)},
      uCam:{value:new THREE.Vector3()},uDeep:{value:new THREE.Color(0.1,0.62,0.68)},uGlow:{value:new THREE.Color(0.02,0.16,0.18)},uRoom:{value:new THREE.Color(0.05,0.07,0.1)},uLP:{value:Array.from({length:12},()=>new THREE.Vector3())},uLC:{value:Array.from({length:12},()=>new THREE.Vector3())},uNL:{value:0}},
    vertexShader:`uniform sampler2D uH; uniform float uAmp; varying vec2 vS; varying vec3 vWp; varying float vVz;
      void main(){ vS=vec2(uv.x,1.-uv.y); vec3 p=position; p.y+=texture2D(uH,vS).r*uAmp; vec4 w=modelMatrix*vec4(p,1.); vWp=w.xyz; vec4 mv=viewMatrix*w; vVz=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform sampler2D uH,uScene,uDepth; uniform vec2 uRes,uGrid,uCell; uniform float uAmp,uNear,uFar,uRefr,uAbs; uniform vec3 uCam,uDeep,uRoom,uGlow; uniform vec3 uLP[12],uLC[12]; uniform int uNL;
      varying vec2 vS; varying vec3 vWp; varying float vVz;
      float lin(vec2 u){ return uNear+texture2D(uDepth,u).r*(uFar-uNear); }
      void main(){ vec2 t=1./uGrid;
        float hx=(texture2D(uH,vS+vec2(t.x,0.)).r-texture2D(uH,vS-vec2(t.x,0.)).r)*uAmp/(2.*uCell.x), hz=(texture2D(uH,vS+vec2(0.,t.y)).r-texture2D(uH,vS-vec2(0.,t.y)).r)*uAmp/(2.*uCell.y);
        vec3 n=normalize(vec3(-hx,1.,-hz)), V=-uCam;
        vec2 s=gl_FragCoord.xy/uRes; float th=max(0.,lin(s)-vVz);
        vec2 r=clamp(s+n.xz*uRefr*min(th,2.),0.001,0.999); if(lin(r)<vVz) r=s;
        float th2=max(0.,lin(r)-vVz); vec3 ab=exp(-th2*vec3(0.26,0.05,0.04)*uAbs);
        vec3 col=texture2D(uScene,r).rgb*ab+uDeep*(1.-ab)+uGlow*min(th2,4.)*.25;
        float fr=0.02+0.98*pow(1.-max(dot(n,V),0.),5.); col=mix(col,uRoom,fr*0.7);
        for(int i=0;i<12;i++){ if(i>=uNL)break; vec3 dl=uLP[i]-vWp; float d=length(dl); vec3 H=normalize(dl/d+V); col+=uLC[i]*pow(max(dot(n,H),0.),70.)*4.5/(1.+d*d*0.12); }
        gl_FragColor=vec4(col,1.); }`});
  WATER.mesh=new THREE.Mesh(g,WATER.mat); WATER.mesh.position.set(X0+W/2,lvl,Z0+D/2); scene.add(WATER.mesh);
  { g.computeBoundingBox(); const B=g.boundingBox; B.min.y-=TILE; B.max.y+=TILE; g.boundingSphere=B.getBoundingSphere(new THREE.Sphere()); }
  WATER.t=0; WATER.stir=0; WATER.rb=new Uint16Array(GX*GY*4);
  WATER.spg=new THREE.BufferGeometry(); WATER.spg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(600*3),3)); WATER.spg.setDrawRange(0,0);
  const spm=new THREE.Points(WATER.spg,new THREE.PointsMaterial({color:0xdff3ff,size:2,sizeAttenuation:false})); spm.frustumCulled=false; scene.add(spm);
WATER.drop=(x,z,r,s)=>{ if(WATER.drops.length<8)WATER.drops.push([(x-WATER.X0)/WATER.W,(z-WATER.Z0)/WATER.D,r,s]); };
WATER.step=(renderer,dt)=>{ WATER.t+=dt;
  if(WATER.drops.length)WATER.calm=false; if(WATER.calm){ if(WATER.SP.n)WATER.spray(dt); return; }
  const u=WATER.simMat.uniforms;
  const H=1/180; WATER.acc=Math.min((WATER.acc||0)+dt,8*H); const n=Math.floor(WATER.acc/H); WATER.acc-=n*H; u.uDt.value=H;
  for(let k=0;k<n;k++){ u.uN.value=k?0:WATER.drops.length; if(!k)WATER.drops.forEach((d,i)=>u.uDrop.value[i].set(...d)); u.uPrev.value=WATER.A.texture;
    renderer.setRenderTarget(WATER.B); renderer.render(WATER.simScene,WATER.simCam); [WATER.A,WATER.B]=[WATER.B,WATER.A]; }
  WATER.drops.length=0; WATER.uH.value=WATER.A.texture;
  const gl=renderer.getContext(), A=WATER.async||(WATER.async={buf:gl.createBuffer(),sync:null,init:false});
  if(A.sync){ const r=gl.clientWaitSync(A.sync,0,0); if(r===gl.ALREADY_SIGNALED||r===gl.CONDITION_SATISFIED){ gl.bindBuffer(gl.PIXEL_PACK_BUFFER,A.buf); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,WATER.rb); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null); gl.deleteSync(A.sync); A.sync=null;
      const rb=WATER.rb, HR=THREE.DataUtils.toHalfFloat(.002), HG=THREE.DataUtils.toHalfFloat(.01); let mv=false; for(let i=0;i<rb.length;i+=4)if((rb[i]&0x7fff)>HR||(rb[i+1]&0x7fff)>HG){ mv=true; break; }
      WATER.quiet=mv?0:(WATER.quiet||0)+dt;
      if(WATER.quiet>.33&&!WATER.drops.length){ const cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(); renderer.setClearColor(0,0);
        for(const T of [WATER.A,WATER.B]){ renderer.setRenderTarget(T); renderer.clear(true,false,false); } renderer.setClearColor(cc,ca); renderer.setRenderTarget(null);
        rb.fill(0); WATER.calm=true; WATER.quiet=0; WATER.spray(dt); return; } } }
  if(!A.sync){ renderer.setRenderTarget(WATER.A); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,A.buf); if(!A.init){ gl.bufferData(gl.PIXEL_PACK_BUFFER,WATER.rb.byteLength,gl.STREAM_READ); A.init=true; }
    gl.readPixels(0,0,WATER.GX,WATER.GY,gl.RGBA,gl.HALF_FLOAT,0); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null); A.sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0); gl.flush(); }
  renderer.setRenderTarget(null);
  WATER.spray(dt); };
WATER.hAt=(x,z)=>{ const GX=WATER.GX, GY=WATER.GY, fx=Math.max(0,Math.min(GX-1.001,(x-WATER.X0)/WATER.W*GX-.5)), fz=Math.max(0,Math.min(GY-1.001,(z-WATER.Z0)/WATER.D*GY-.5)), i=fx|0, j=fz|0, u=fx-i, v=fz-j,
  H=(a,b)=>THREE.DataUtils.fromHalfFloat(WATER.rb[(b*GX+a)*4]); return H(i,j)*(1-u)*(1-v)+H(i+1,j)*u*(1-v)+H(i,j+1)*(1-u)*v+H(i+1,j+1)*u*v; };
WATER.slope=(x,z)=>{ const e=WATER.dx; return [(WATER.hAt(x+e,z)-WATER.hAt(x-e,z))/(2*e),(WATER.hAt(x,z+e)-WATER.hAt(x,z-e))/(2*e)]; };
WATER.over=(x,z)=>x>WATER.X0&&x<WATER.X0+WATER.W&&z>WATER.Z0&&z<WATER.Z0+WATER.D;
WATER.SP={n:0,max:600,p:new Float32Array(600*3),v:new Float32Array(600*3)};
WATER.splash=(x,y,z,n,sp)=>{ const S=WATER.SP; for(let k=0;k<n&&S.n<S.max;k++){ const i=S.n++, a=Math.random()*Math.PI*2, up=0.5+Math.random()*0.8, out=Math.random()*0.7;
  S.p.set([x+(Math.random()-.5)*0.2,y+0.02,z+(Math.random()-.5)*0.2],i*3); S.v.set([Math.cos(a)*out*sp,up*sp,Math.sin(a)*out*sp],i*3); } };
WATER.spray=dt=>{ const S=WATER.SP, g=9.81/WATER.MPU; let k=0; dt=Math.min(dt,1/30);
  for(let i=0;i<S.n;i++){ const p=S.p, v=S.v; v[i*3+1]-=g*dt; for(let q=0;q<3;q++)p[i*3+q]+=v[i*3+q]*dt;
    const x=p[i*3], y=p[i*3+1], z=p[i*3+2], wet=WATER.over(x,z);
    if(wet&&y<WATER.lvl+WATER.hAt(x,z)&&v[i*3+1]<0){ WATER.drop(x,z,0.07,0.0025); continue; } if(!wet&&y<0)continue;
    if(k!==i){ for(let q=0;q<3;q++){ p[k*3+q]=p[i*3+q]; v[k*3+q]=v[i*3+q]; } } k++; }
  S.n=k; const a=WATER.spg.attributes.position; a.array.set(S.p.subarray(0,k*3)); a.needsUpdate=true; WATER.spg.setDrawRange(0,k); };
WATER.under=(renderer,scene,cam,lamps)=>{ const w=renderer.domElement.width, h=renderer.domElement.height; if(WATER.rt.width!==w||WATER.rt.height!==h)WATER.rt.setSize(w,h);
  const u=WATER.mat.uniforms; u.uRes.value.set(w,h); u.uGlow.value.setRGB(.02,.16,.18).multiplyScalar(WATER.glowK==null?1:WATER.glowK); u.uNear.value=cam.near; u.uFar.value=cam.far; cam.getWorldDirection(u.uCam.value);
  lamps.slice(0,12).forEach((L,i)=>{ u.uLP.value[i].copy(L.position); u.uLC.value[i].set(L.color.r,L.color.g,L.color.b).multiplyScalar(Math.min(1,(L.userData.i0||L.intensity)/3)); }); u.uNL.value=Math.min(12,lamps.length);
  const v0=WATER.mesh.visible; WATER.mesh.visible=false; renderer.setRenderTarget(WATER.rt); renderer.render(scene,cam); renderer.setRenderTarget(null); WATER.mesh.visible=v0; };
};
WATER.extra=[]; WATER.body=cfg=>{ const W={drops:[],uH:{value:null},uWB:{value:new THREE.Vector4()},uLevel:{value:0},uGrid:{value:new THREE.Vector2()},mats:[],name:cfg.name}; waterBody(W,cfg); WATER.extra.push(W); return W; };
WATER.tickAll=(renderer,dt,pos)=>{ for(const w of WATER.extra){ w.on=SHARED.LVL==='up'&&Math.hypot(pos.x-(w.X0+w.W/2),pos.z-(w.Z0+w.D/2))<14*TILE; if(w.on)w.step(renderer,dt); } };
WATER.FR=new THREE.Frustum(); WATER.PM=new THREE.Matrix4();
WATER.seen=(m,cam)=>{ if(!m||!m.visible)return false; if(!m.userData.bb)m.userData.bb=new THREE.Box3().setFromObject(m); WATER.PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); WATER.FR.setFromProjectionMatrix(WATER.PM); return WATER.FR.intersectsBox(m.userData.bb); };
WATER.underAll=(renderer,scene,cam,lamps)=>{ for(const w of WATER.extra)if(w.on&&WATER.seen(w.mesh,cam))w.under(renderer,scene,cam,lamps); };
WATER.feed=st=>RIG.water(st,{level:null,floor:0});

await grab('down',async()=>{ const solids=SOL.down, fixed=FIX.down, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;
{
  const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const sh=(c,f)=>[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)], mt=(k,c)=>c, UH=98, ROT=0; let PNAME='';
  const concreteCol=(x,z)=>{ const n=hash(Math.floor(x*24),Math.floor(z*24),97), c=[124,122,116]; return n<.3?sh(c,.93):n>.85?sh(c,1.05):c; };
  const prop=(boxes,_,o)=>({boxes,...o}), sided=b=>b;
  const mod=(a,n)=>((a%n)+n)%n, mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const vn=(x,y,c)=>{ const i=Math.floor(x), j=Math.floor(y), u=x-i, v=y-j, su=u*u*(3-2*u), sv=v*v*(3-2*v), a=hash(i,j,c), b=hash(i+1,j,c), d=hash(i,j+1,c), e=hash(i+1,j+1,c); return (a+(b-a)*su)*(1-sv)+(d+(e-d)*su)*sv; };
  const fbm=(x,y,c)=>vn(x,y,c)*.55+vn(x*2.7,y*2.7,c+1)*.3+vn(x*7.3,y*7.3,c+2)*.15;
const SL=(()=>{ const W={TK:4.4,P0:4.4,P1:17.4,XW:21.8,L:29,TE:0,H:196,XS:12.4,TR:[2.2,19.6],MY0:-46.6,EAST:258,WN:-31.5,WS:-44.5,TOP:186};
  W.MID=(W.P0+W.P1)/2; W.COLX=[W.P0+1.5,W.P1-2.2]; W.COLY=[3.15,14.15,25.15]; W.FIXY=[6.25,11.75,17.25,22.75];
  W.BENCH=[7.7,18.7]; W.BINS=[13.6,24.9]; W.STEPS=[[[W.L-1.6,W.L-.4]],[[.6,1.8],[W.L-1.6,W.L-.4]]]; W.EX0=W.XS-1.5; W.EX1=W.XS+1.5; W.ED=3;
  W.fzAt=(x,y)=>{ const e=x<W.P0?W.P0-x:x-W.P1, s=W.STEPS[x<W.P0?0:1]; return e<.75&&s.some(([a,b])=>y>=a&&y<b)?-8*(1+Math.floor(e/.25)):-32; };
  return W; })();
const GRAF=(()=>{ const P={yel:[246,208,44],ora:[246,132,38],red:[224,48,52],grn:[64,204,84],lim:[168,232,64],blu:[48,122,236],sky:[84,196,244],pur:[152,72,212],pnk:[246,100,180],wht:[242,242,234],blk:[18,18,22],cyn:[44,212,200]};
  const css=c=>'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')';
  const G={P,WORDS:['RIP','PURGE','HELP','GHOST','KAOS','SOFA','ODD','FLEA','NOVA','ZOOT','SEEN','DIZ','LOST','REVS','ESPO','SAKE','VERT','MOOSE','THIS WAY','HOPELESS','FATE','DUSK','OMEN'],
    BRIGHT:['yel','ora','red','grn','lim','blu','sky','pur','pnk','cyn'].map(k=>P[k]),TAGC:[P.blk,P.blk,P.blk,P.red,P.blu,P.wht,P.grn,P.pur,P.yel]};
  G.mk=(w,h,seed,draw)=>{ const W0=Math.max(1,Math.round(w)), H0=Math.max(1,Math.round(h)), cv=document.createElement('canvas'); cv.width=W0; cv.height=H0; const g=cv.getContext('2d');
    let s=(Math.imul(seed|0,2654435761)^0x9e3779b9)>>>0||7; const r=()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }, pick=a=>a[Math.floor(r()*a.length)];
    g.lineCap='round'; g.lineJoin='round'; draw(g,r,pick,W0,H0); const d=g.getImageData(0,0,W0,H0).data;
    return (x,y)=>{ x=Math.floor(x); y=Math.floor(y); if(x<0||y<0||x>=W0||y>=H0)return null; const k=(y*W0+x)*4; return d[k+3]>120?[d[k],d[k+1],d[k+2]]:null; }; };
  G.tag=(g,r,pick,x,y,sz,c,word)=>{ const t=word||pick(G.WORDS); g.save(); g.translate(x,y); g.transform(1,0,-.15-.3*r(),1,0,0); g.rotate((r()-.5)*.3);
    g.font='bold '+Math.round(sz)+'px sans-serif'; g.strokeStyle=css(c); g.lineWidth=Math.max(1,sz/7); g.strokeText(t,0,0); const w=g.measureText(t).width;
    if(r()<.55){ g.beginPath(); g.moveTo(-2,sz*.25); g.bezierCurveTo(w*.3,sz*.6,w*.7,-sz*.05,w+sz*.5,sz*.3); g.stroke(); } g.restore(); return w; };
  G.bubble=(g,r,pick,x,y,sz,word,c1,c2,line)=>{ const t=word||pick(G.WORDS); g.save(); g.translate(x,y); g.rotate((r()-.5)*.12); g.font='900 '+Math.round(sz)+'px sans-serif';
    const o=sz*.09; g.lineWidth=sz*.34; g.strokeStyle=g.fillStyle=css(P.blk); g.strokeText(t,o,o); g.fillText(t,o,o);
    g.lineWidth=sz*.26; g.strokeStyle=css(line||P.blk); g.strokeText(t,0,0); g.lineWidth=sz*.12; g.strokeStyle=css(P.wht); g.strokeText(t,0,0);
    const gr=g.createLinearGradient(0,-sz*.75,0,0); gr.addColorStop(0,css(c1)); gr.addColorStop(1,css(c2||c1)); g.fillStyle=gr; g.fillText(t,0,0);
    const w=g.measureText(t).width; g.fillStyle=css(P.wht); for(let k=0;k<4;k++)g.fillRect(r()*w,-sz*.6+r()*sz*.2,Math.max(1,sz*.07),Math.max(1,sz*.16));
    g.fillStyle=css(c2||c1); for(let k=0;k<4;k++)g.fillRect(r()*w,0,Math.max(1,sz*.05),sz*(.12+r()*.35)); g.restore(); return w; };
  const ink=(g,c,lw)=>{ g.strokeStyle=g.fillStyle=css(c); g.lineWidth=lw; g.beginPath(); };
  G.star=(g,x,y,R,c,lw=1)=>{ ink(g,c,lw); for(let k=0;k<6;k++){ const a=-Math.PI/2+k*4*Math.PI/5; g[k?'lineTo':'moveTo'](x+Math.cos(a)*R,y+Math.sin(a)*R); } g.stroke(); };
  G.ghost=(g,x,y,R,c,lw=1)=>{ ink(g,c,lw); g.moveTo(x-R,y+R); g.lineTo(x-R,y); g.arc(x,y,R,Math.PI,0); g.lineTo(x+R,y+R); for(let k=0;k<4;k++)g.lineTo(x+R-(k+.5)*R/2,y+R*(k%2?1:.65)); g.closePath(); g.stroke();
    g.fillRect(x-R*.5,y-R*.3,Math.max(1,R*.28),Math.max(2,R*.4)); g.fillRect(x+R*.22,y-R*.3,Math.max(1,R*.28),Math.max(2,R*.4)); };
  G.heart=(g,x,y,R,c,lw=1)=>{ ink(g,c,lw); g.moveTo(x,y+R); g.bezierCurveTo(x-R*1.6,y-R*.2,x-R*.6,y-R*1.3,x,y-R*.3); g.bezierCurveTo(x+R*.6,y-R*1.3,x+R*1.6,y-R*.2,x,y+R); g.stroke(); };
  G.arrow=(g,x,y,L,c,lw=1)=>{ ink(g,c,lw); g.moveTo(x,y); g.lineTo(x+L,y-L*.1); g.moveTo(x+L*.72,y-L*.32); g.lineTo(x+L,y-L*.1); g.lineTo(x+L*.76,y+L*.14); g.stroke(); };
  G.scrib=(g,r,x,y,w,h,c,lw=1)=>{ ink(g,c,lw); g.moveTo(x,y); for(let k=0;k<8;k++)g.lineTo(x+r()*w,y+r()*h); g.stroke(); };
  G.wall=(g,r,pick,w,h,n,y0,y1)=>{ for(let k=0;k<n;k++){ const x=r()*w, y=y0+r()*(y1-y0), q=r();
    if(q<.58)G.tag(g,r,pick,x,y,7+r()*9,pick(G.TAGC)); else if(q<.68)G.star(g,x,y,4+r()*6,pick(G.TAGC)); else if(q<.76)G.heart(g,x,y,3+r()*3,pick(G.BRIGHT));
    else if(q<.84)G.ghost(g,x,y,4+r()*3,pick(G.BRIGHT)); else if(q<.9)G.arrow(g,x,y,10+r()*10,pick(G.BRIGHT),2); else G.scrib(g,r,x,y,10+r()*24,6+r()*6,pick(G.TAGC)); } };
  return G; })();
const SSUB=(()=>{ const W={};
  W.tile=(u,z,f)=>sh([186,190,197],f);
  const LED35={P:'111101111100100',L:'100100100100111',E:'111100110100111',A:'010101111101101',S:'011100010001110',B:'110101110101110',M:'101111111101101',I:'111010010010111',O:'111101101101111',U:'101101101101111',
    N:'101111111111101',D:'110101101101110',T:'111010010010010',H:'101101111101101',G:'011100101101011',R:'110101110101101',V:'101101101101010',W:'101101111111101',' ':'000000000000000',C:'111100100100111',K:'101101110101101',
    Y:'101101010010010',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001011001111',4:'101101111001001',':':'000010000010000','^':'010111010010010','>':'100010001010100',X:'101101010101101','<':'001010100010001'};
  W.text=(s,k,ink,bg,rim,pad)=>{ const w=(s.length*4-1)*k+2*pad, h=5*k+2*pad, a=new Array(w*h).fill(bg);
    if(rim)for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<1||y<1||x>=w-1||y>=h-1)a[y*w+x]=rim;
    [...s].forEach((ch,i)=>{ const g=LED35[ch]; if(g)for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')for(let u=0;u<k;u++)for(let v=0;v<k;v++)a[(pad+r*k+v)*w+pad+(i*4+q)*k+u]=ink; });
    return {w,h,at:(x,y)=>x>=0&&y>=0&&x<w&&y<h?a[y*w+x]:null}; };
  W.LED=LED35;
  const QS={iron:[40,42,48],plate:[16,16,20],ink:[236,236,230],red:[236,44,40],lamp:[30,30,34]};
  W.signal=(x,y,n)=>{ PNAME='tunnel signal'; return prop([{x0:x-.05,y0:y-.05,x1:x+.05,y1:y+.05,z0:0,z1:44,c:QS.iron},{x0:x-.14,y0:y-.1,x1:x+.14,y1:y+.1,z0:44,z1:60,c:QS.lamp,foot:1},
      {x0:x-.08,y0:n?y+.1:y-.14,x1:x+.08,y1:n?y+.14:y-.1,z0:48,z1:56,c:QS.red,em:1,foot:1}],null,{walk:true}); };
  const Q4={mach:[58,68,90],machT:[78,90,114],machD:[46,54,72],scr:[150,214,244,1],slot:[20,22,28]};
  W.mach=(x0,y0)=>{ PNAME='passport machine'; const x1=x0+.54, y1=y0+.7;
    return prop([{x0,y0,x1,y1,z0:0,z1:46,foot:1,c:Q4.mach,top:()=>Q4.machT,fj:()=>Q4.machD,fi:(v,z)=>z>26&&z<40&&v>y0+.12&&v<y1-.12?Q4.scr:z>15&&z<18&&v>y0+.2&&v<y1-.2?Q4.slot:Q4.mach}]); };
  return W; })();
  const W=SSUB, SZ=-UH, SM=MAPSTAIR, H2=SL.H, {P0,P1,XW,L:LEN,TE,MID}=SL, LT=SL.TR[0];
  const XC=((SM.x0+SM.x1)/2-72)*TILE, ZB=(SM.y0+77)*TILE, ZT=(SM.y1+77)*TILE, Y=z=>(z-SZ)*ZU+STN.DY, XS0=(SM.x0+SM.x1)/2-SL.L/2, V=(x,y,z)=>[(XS0+y-72)*TILE,Y(z),(SL.MY0-x+77)*TILE];
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const im=new ImageData(w,h), d=im.data; let ie=null, e=null;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v)continue; d[k]=Math.round(v[0]); d[k+1]=Math.round(v[1]); d[k+2]=Math.round(v[2]); d[k+3]=255;
      if(v.length>3){ if(!ie){ ie=new ImageData(w,h); e=ie.data; } e[k]=d[k]; e[k+1]=d[k+1]; e[k+2]=d[k+2]; e[k+3]=255; } }
    const mk=cv=>{ const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; return t; };
    return {map:mk(im),em:ie?mk(ie):null}; };
  const quad=(a,b,c,d,tx,lit,shadow=false,chara=false)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals();
    const m=chara?new THREE.MeshBasicMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):lit?new THREE.MeshLambertMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide,...(tx.em?{emissiveMap:tx.em,emissive:0xffffff,emissiveIntensity:1.6}:{})})
      :new THREE.MeshBasicMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide});
    const me=new THREE.Mesh(g,m); me.castShadow=shadow; me.receiveShadow=true; scene.add(me); return me; };
  const C=v=>v;
  const bq=(a,b,c,d,tx,lit,shadow,chara)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,tx.em?tx.em.image:null,chara?'C':lit?'L':'B');
  function gbox(b,dz=0,ox=0,oy=0,chara=false){ const x0=b.x0+ox, x1=b.x1+ox, y0=b.y0+oy, y1=b.y1+oy, z0=b.z0+dz, z1=b.z1+dz, lit=!b.em, k=b.em?2:1, H=(z1-z0)*k;
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P-ox,Q-oy,z-z0,b):nx&&b.fi?b.fi(Q-oy,z-SZ):ny&&b.fj?b.fj(P-ox,z-SZ):b.c);
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; bq(V(x,nx<0?y1:y0,z0),V(x,nx<0?y0:y1,z0),V(x,nx<0?y0:y1,z1),V(x,nx<0?y1:y0,z1),
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),lit,true,chara); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; bq(V(ny<0?x0:x1,y,z0),V(ny<0?x1:x0,y,z0),V(ny<0?x1:x0,y,z1),V(ny<0?x0:x1,y,z1),
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),lit,true,chara); }
    if(!b.noTop)bq(V(x0,y1,z1),V(x1,y1,z1),V(x1,y0,z1),V(x0,y0,z1),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24-ox,y0+(j+.5)/24-oy):b.c)),lit,true,chara);
    if(b.bot)bq(V(x0,y0,z0),V(x1,y0,z0),V(x1,y1,z0),V(x0,y1,z0),faceTex((x1-x0)*24*k,(y1-y0)*24*k,(i,j)=>C(b.bot(x0+(i+.5)/24/k-ox,y0+(j+.5)/24/k-oy))),lit,true,chara); }
  const put=(p,name,dz=SZ)=>{ BATCH.tag=OBJ('station',name); p.boxes.forEach(b=>gbox(b,dz)); BATCH.tag=null; };
  const solid=(x0,y0,x1,y1,zt)=>{ const a=V(x0,y0,0), b=V(x1,y1,0), q=[Math.min(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[0],b[0]),Math.max(a[2],b[2])]; solids.push(q); fixed.push([q[0],q[1],0,q[2],q[3],Math.max(.05,zt*ZU)]); };
  const plane=()=>new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const cutaway=(me,nx,ny,foot,pl=plane())=>{ me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx:ny,nz:-nx,foot:Y(foot+SZ),me}); return me; };
  const wallY=(x,y0,y1,z0,z1,paint,r=24)=>quad(V(x,y0,z0+SZ),V(x,y1,z0+SZ),V(x,y1,z1+SZ),V(x,y0,z1+SZ),faceTex((y1-y0)*r,z1-z0,(i,j)=>C(paint(y0+(i+.5)/r,z1-j-.5))),true);
  const wallX=(y,x0,x1,z0,z1,paint,r=24)=>quad(V(x0,y,z0+SZ),V(x1,y,z0+SZ),V(x1,y,z1+SZ),V(x0,y,z1+SZ),faceTex((x1-x0)*r,z1-z0,(i,j)=>C(paint(x0+(i+.5)/r,z1-j-.5))),true);
  const flat=(x0,y0,x1,y1,z,col,r=24,down=false)=>{ const p=down?[V(x0,y0,z+SZ),V(x1,y0,z+SZ),V(x1,y1,z+SZ),V(x0,y1,z+SZ)]:[V(x0,y1,z+SZ),V(x1,y1,z+SZ),V(x1,y0,z+SZ),V(x0,y0,z+SZ)];
    return quad(...p,faceTex((x1-x0)*r,(y1-y0)*r,(i,j)=>C(col(x0+(i+.5)/r,down?y1-(j+.5)/r:y0+(j+.5)/r))),true,false); };
  const seen=(nx,ny,X,Y0,b)=>nx>0?(b.y1-Y0)*24:nx<0?(Y0-b.y0)*24:ny>0?(X-b.x0)*24:(b.x1-X)*24;
  const tileWall=(u,z,s)=>{ const px=u*24, tx=Math.floor(px/6), tz=Math.floor((z+32)/7), gx=px-tx*6, gz=(z+32)-tz*7, grout=gx<1||gz<1;
    const c=z<0?(grout?[52,54,52]:[80,82,78]):z>=96&&z<112?(grout?[16,16,18]:[30,32,32]):(grout?[160,166,160]:[194,200,192]);
    const m=fbm(u*.35,z/40,s+5), st=vn(px/2.5,.5,s+9); let g=(.93+.1*hash(tx,tz,s))*(.8+.28*m);
    g*=1-.28*Math.max(0,1-(z+32)/80); g*=1-.32*Math.max(0,Math.min(1,(z-140)/56))*(.6+.4*m);
    if(st>.74)g*=1-.3*(st-.74)/.26*Math.max(0,Math.min(1,(160-z)/110));
    return sh(c,g); };
  const hallWall=(len,seed,o={})=>{ const G=GRAF.mk(len*24,228,seed,(g,r,pick,w,h)=>{ GRAF.wall(g,r,pick,w,h,Math.round(len*(o.tags||.6)),196-(o.t1||80),196-(o.t0||8)); if(o.big)o.big(g,r,pick,w,h); });
    const pl=(o.plates||[]).map(u0=>({u0,a:W.text(SECTIONS.station,2,[238,238,230],[24,24,28],[206,204,190],4)}));
    return (u,z)=>{ if(o.hole&&o.hole(u,z))return null;
      for(const p of pl){ const c=p.a.at(Math.floor((u-p.u0)*24),Math.floor(82-z)); if(c)return sh(c,.86+.14*hash(Math.floor(u*24),Math.floor(z),5)); }
      const b=tileWall(u,z,seed), gr=G(u*24,196-z); return gr?mix(gr,b,.12+.3*vn(u*6,z/6,seed+3)):b; }; };
  const floorPaint=(()=>{ const D=[{k:'paper',x:7.4,y:23.3,w:1,h:.7,a:.35},{k:'pud',x:13.6,y:19.2,w:1.2,h:.6},{k:'pud',x:16.2,y:12.5,w:.6,h:.4}];
    const deco=(x,y,c)=>{ for(const d of D){ const dx=x-d.x, dy=y-d.y;
        if(d.k==='paper'){ const ca=Math.cos(d.a), sa=Math.sin(d.a), u=(dx*ca+dy*sa)/d.w+.5, v=(-dx*sa+dy*ca)/d.h+.5; if(u<0||u>1||v<0||v>1)continue;
          const px=Math.floor(u*24*d.w), py=Math.floor(v*24*d.h); if(Math.abs(u-.5)<.012)return [150,148,140];
          if(v<.2)return py%3===0?[214,212,204]:[36,36,40]; if(u>.55&&v>.3&&v<.65)return [110,112,116]; return py%2===0&&hash(px>>2,py,7)<.8&&(px%24)>1?[96,96,100]:[218,216,206]; }
        const r=Math.hypot(dx/d.w,dy/d.h); if(r>=1)continue;
        if(d.k==='pud'){ const sp=Math.abs(dy+dx*.3)<.05&&r<.75; return sp?[176,198,190]:mix(sh(c,.55),[40,62,62],.35); }
        if(d.k==='spill')return mix(c,[112,30,26],.55*(1-r)); } return null; };
    return (x,y)=>{ const e=Math.min(x-P0,P1-x), gm=.76+.32*fbm(x*.3,y*.3,71);
      if(e<.12)return sh([156,152,140],gm*(.9+.1*hash(Math.floor(x*24),Math.floor(y*24),3)));
      if(e<.9){ if(e>.84)return sh([40,40,36],gm); const n=hash(Math.floor(x*24),Math.floor(y*24),77); let c=sh([228,198,46],gm*(n<.05?.82:1)); const d=deco(x,y,c); return d||c; }
      const lx=x-P0, i=Math.floor(lx), j=Math.floor(y), gx=(lx-i)*24, gy=(y-j)*24, grout=gx<1.2||gy<1.2;
      let c=grout?[94,102,98]:sh([150,163,156],.92+.12*hash(i,j,61)); c=sh(c,gm);
      if(vn(x*1.6,y*1.6,81)>.76)c=sh(c,.84);
      if(!grout&&hash(i,j,93)<.14&&Math.abs(gx-gy*(.4+hash(i,j,94))-4-hash(i,j,95)*10)<.6)c=sh(c,.62);
      if(hash(Math.floor(x*24),Math.floor(y*24),91)<.006)c=[58,60,58];
      return deco(x,y,c)||c; }; })();
  const trackPaint=(x,y)=>{ for(const t of SL.TR){ const d=x-t, ad=Math.abs(d), r=Math.abs(ad-.7), out=t<MID?-1:1;
      if(r<.07)return r<.025?[202,204,208]:sh([116,112,108],.85+.2*vn(y*2,t,7));
      if(r<.14&&mod(y,1.1)<.34)return [70,52,40];
      const tr=Math.abs(x-(t+out*1.42)); if(tr<.12)return tr<.08?sh([150,118,64],.8+.25*vn(y*3,t,9)):[40,36,32];
      if(ad<.98&&mod(y,1.1)<.34)return sh([96,66,44],.7+.35*hash(Math.floor(y/1.1),Math.floor(t),11)*(.7+.3*vn(x*9,y*9,12))); }
    const n=hash(Math.floor(x*14),Math.floor(y*14),103); if(hash(Math.floor(x*24),Math.floor(y*24),104)<.004)return [196,192,180];
    return sh(n<.3?[34,32,34]:n<.6?[26,25,26]:[46,42,40],.8+.4*vn(x*.7,y*.7,105)); };
  const edgePaint=(u,z)=>{ const g=.72+.34*fbm(u*.6,z/30,131); if(z>-3)return sh([170,160,120],g); if(z>-7)return sh([36,36,34],g); const st=vn(u*14,.5,133)>.78&&z>-26?.7:1; return sh([98,98,92],g*st*(.9+.1*hash(Math.floor(u*24),Math.floor(z/3),134))); };
  const ceilPaint=(x,y)=>{ const g=.68+.4*fbm(x*.25,y*.25,121), over=x<P0||x>P1?.62:1, jt=mod(y,2.5)<.08||mod(x-P0,4.33)<.06;
    let c=sh([104,108,106],g*over*(jt?.6:1)); const ring=vn(x*.5,y*.5,123); if(ring>.78&&ring<.81)c=sh(c,.72);
    for(const fy of SL.FIXY)if(Math.abs(x-MID)<1.2&&Math.abs(y-fy)<2.2)c=sh(c,.7+.3*Math.min(1,Math.abs(x-MID)/1.2)); return c; };
  const tun=(u,z)=>sh(concreteCol(u,z/24),.34*(.8+.4*vn(u*.5,z/30,141)));
  const dark=()=>[14,14,16];
  const colFace=(ci)=>{ const G=[0,1,2,3].map(f=>GRAF.mk(17,196,ci*7+f+11,(g,r,pick,w,h)=>{ if(r()<.7)GRAF.tag(g,r,pick,1+r()*3,70+r()*60,6+r()*5,pick(GRAF.TAGC)); if(r()<.35)GRAF.tag(g,r,pick,1,120+r()*30,5+r()*3,pick(GRAF.TAGC)); if(r()<.3)GRAF.scrib(g,r,2,18+r()*10,12,10,GRAF.P.red); if(r()<.2)GRAF.star(g,8,90+r()*30,5,pick(GRAF.TAGC)); }));
    return (nx,ny,X,Yy,zr,b)=>{ const z=zr, f=nx>0?0:nx<0?1:ny>0?2:3, cx=seen(nx,ny,X,Yy,b); if(z>180)return sh([28,28,30],.9+.2*hash(Math.floor(cx),Math.floor(z/4),ci));
      if(z<5)return sh([46,46,44],.9+.2*hash(Math.floor(cx),0,ci));
      const tx=Math.floor(cx/4.25), tz=Math.floor(z/5), grout=cx-tx*4.25<1||z-tz*5<1, m=fbm(cx/9+ci*3,z/26,151+f);
      let c=grout?[146,152,146]:[178,184,178]; c=sh(c,(.9+.14*hash(tx,tz,ci*4+f))*(.72+.36*m)*(1-.3*Math.max(0,1-z/60))*(1-.25*Math.max(0,(z-150)/30)));
      const gr=G[f](cx,196-z); return gr?mix(gr,c,.15+.25*vn(cx/3,z/5,ci)):c; }; };
  const woodC=(u,v,s)=>{ const pl=Math.floor(v), t=.82+.26*hash(pl,s,7), gr=.9+.1*Math.sin(u*38+hash(pl,s,9)*20+vn(u*2.5,pl,s)*5), wx=fbm(u*.8,v*.3,s+13);
    return mix(sh([176,126,72],t*gr),[124,118,106],Math.max(0,wx-.55)*1.4); };
  const benchBoxes=(xc,y0,len,seed)=>{ PNAME='station bench'; const y1=y0+len, xa=xc-.75, xb=xc+.75, MET=[40,40,42];
    const GB=[0,1].map(s=>GRAF.mk(len*24,24,seed*5+s,(g,r,pick,w,h)=>{ for(let k=0;k<2+r()*2;k++)GRAF.tag(g,r,pick,r()*w*.8,8+r()*14,6+r()*4,r()<.8?GRAF.P.blk:pick(GRAF.TAGC)); }));
    const GE=[0,1].map(s=>GRAF.mk(36,20,seed*5+s+2,(g,r,pick,w,h)=>{ GRAF.tag(g,r,pick,3,13,9,GRAF.P.blk,seed===1&&s===1?'PURGE':null); if(r()<.4)GRAF.heart(g,28,6,3,GRAF.P.blk); }));
    const pl=(nx,ny,X,Yy,zr,b)=>{ const z=zr+b.z0, cx=seen(nx,ny,X,Yy,b); let c=woodC(cx/24,z/4,seed+(nx||ny*3));
      if(b.k==='end'){ const gr=GE[ny>0?1:0](cx*36/((b.x1-b.x0)*24),20-z); if(gr&&ny)c=mix(gr,c,.18); }
      if(b.k==='back'&&nx&&z>16){ const gr=GB[nx>0?1:0](cx,36-z+4); if(gr)c=mix(gr,c,.2); } return c; };
    const top=(X,Yy)=>woodC((Yy-y0),(X-xa)*6,seed+5);
    const bs=[{k:'end',x0:xa,x1:xb,y0,y1:y0+.12,z0:0,z1:21,fs:pl,top},{k:'end',x0:xa,x1:xb,y0:y1-.12,y1,z0:0,z1:21,fs:pl,top},
      {k:'seat',x0:xa+.02,x1:xc-.1,y0:y0+.12,y1:y1-.12,z0:12,z1:15,fs:pl,top},{k:'seat',x0:xc+.1,x1:xb-.02,y0:y0+.12,y1:y1-.12,z0:12,z1:15,fs:pl,top},
      {k:'back',x0:xc-.1,x1:xc+.1,y0:y0+.12,y1:y1-.12,z0:15,z1:36,fs:pl,top},
      {x0:xc-.55,x1:xc+.55,y0:y0+len/2-.06,y1:y0+len/2+.06,z0:0,z1:12,c:MET}];
    for(let k=1;k<4;k++){ const y=y0+.12+k*(len-.24)/4; bs.push({x0:xa+.06,x1:xc-.12,y0:y-.03,y1:y+.03,z0:15,z1:21,c:MET},{x0:xc+.12,x1:xb-.06,y0:y-.03,y1:y+.03,z0:15,z1:21,c:MET}); }
    return prop(bs); };
  const PB=plane(), PF=plane();
  flat(P0,0,P1,LEN,0,floorPaint);
  for(const [x0,x1] of [[0,P0],[P1,XW]])flat(x0,0,x1,LEN,-32,trackPaint,16);
  wallY(P0,0,LEN,-32,0,edgePaint); wallY(P1,0,LEN,-32,0,edgePaint);
  const portal=(u,z,c)=>{ const d=Math.abs(u-c)/2.05; return d<1&&z<110+30*Math.sqrt(1-d*d); };
  const lw=hallWall(LEN,401,{plates:[LEN-22.5,LEN-11.5],t0:-24,t1:60}), rw=hallWall(LEN,402,{plates:[8.5,20.5],t0:-24,t1:60,tags:.4});
  cutaway(wallY(0,0,LEN,-32,H2,(u,z)=>lw(LEN-u,z)),1,0,-24); cutaway(wallY(XW,0,LEN,-32,H2,(u,z)=>rw(u,z)),-1,0,-24);
  const exitHole=(u,z)=>u>SL.EX0&&u<SL.EX1&&z<72+14*Math.sqrt(Math.max(0,1-((u-SL.XS)/1.5)**2)), exSign=W.text('EXIT TO STREET',2,[255,250,236,1],[16,110,60,1],[200,230,210],4);
  const ew0=hallWall(XW,403,{tags:1.2,t0:4,t1:96,hole:(u,z)=>portal(u,z,LT)||portal(u,z,SL.TR[1])||exitHole(u,z)}), ew=(u,z)=>{ if(exitHole(u,z))return null; const c=exSign.at(Math.floor((u-(SL.XS-exSign.w/48))*24),Math.floor(118-z)); return c||ew0(u,z); };
  const fw=hallWall(XW,404,{tags:1.4,t0:4,t1:96,hole:(u,z)=>portal(u,z,XW-LT)||portal(u,z,XW-SL.TR[1]),big:(g,r,pick,w,h)=>{ g.save(); g.font='900 58px sans-serif'; g.lineWidth=2; g.strokeStyle='rgb(14,14,16)'; g.transform(1,0,-.2,1,0,0); g.strokeText('EPPIE',w*.36,196-62); g.restore(); GRAF.arrow(g,w*.55,196-70,40,GRAF.P.blk,2); }});
  cutaway(wallX(0,0,XW,-32,H2,(u,z)=>ew(u,z)),0,1,-24); cutaway(wallX(LEN,0,XW,-32,H2,(u,z)=>fw(XW-u,z)),0,-1,-24);
  { const X0=SL.EX0, X1=SL.EX1, D=SL.ED, dk=(u,z)=>sh(tileWall(u+D,z,409),.32+.2*Math.max(0,(u+D)/D));
    cutaway(wallY(X0,-D,0,0,86,dk),0,1,-24); cutaway(wallY(X1,-D,0,0,86,dk),0,1,-24);
    flat(X0,-D,X1,0,0,(x,y)=>sh(floorPaint(x,y+8),.4+.35*Math.max(0,(y+D)/D)));
    cutaway(wallX(-D,X0,X1,0,86,()=>[6,6,8]),0,1,-24); }
  for(const [a,b] of [[0,SL.STEPS[0]],[1,SL.STEPS[1]]])for(const [y0,y1] of b)for(let k=0;k<3;k++){ const c=[150,146,138], e=a?P1:P0, s=a?1:-1, xa=e+s*k*.25, xb=e+s*(k+1)*.25; gbox({x0:Math.min(xa,xb),x1:Math.max(xa,xb),y0,y1,z0:-32,z1:-8*(k+1),c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)},SZ); }
  BATCH.cast=true;
  SL.COLX.forEach((cx,i)=>SL.COLY.forEach((cy,j)=>{ const p=colFace(i*10+j); put(prop([{x0:cx,y0:cy,x1:cx+.7,y1:cy+.7,z0:0,z1:H2,noTop:true,fs:(nx,ny,X,Yy,zr,b)=>p(nx,ny,X,Yy,zr,b)}]),'column'); solid(cx,cy,cx+.7,cy+.7,H2); }));
  BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  const sBlob=SHAD.mat({alpha:.5}), blobAt=(x0,y0,x1,y1)=>{ const v=V((x0+x1)/2,(y0+y1)/2,SZ); SHAD.blob(scene,v[0],v[1],v[2],(y1-y0)*TILE*1.1,(x1-x0)*TILE*1.3,{mat:sBlob}); };   // a soft contact shadow grounds each platform prop
  SL.BENCH.forEach((y,i)=>{ put(benchBoxes(MID,y,3.2,i+1),'bench'); solid(MID-.75,y,MID+.75,y+3.2,36); blobAt(MID-.75,y,MID+.75,y+3.2); });
  SL.BINS.forEach(y=>solid(MID-.28,y-.28,MID+.28,y+.28,32));
  const MX=SL.EX0-.95, MY=.06; put(W.mach(MX,MY),'passport machine'); solid(MX,MY,MX+.56,MY+.7,46); blobAt(MX,MY,MX+.56,MY+.7);
  put(W.signal(XW-.35,-1.4,1),'signal',SZ-32); put(W.signal(XW-.35,LEN+1.4,0),'signal',SZ-32); put(W.signal(.35,LEN+1.4,0),'signal',SZ-32);
  BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  BATCH.cast=false;
  const SC6={dark:[38,38,44],board:[14,12,12],dot:[255,168,40,1],dotDim:[60,36,14],cam:[62,64,70],lens:[10,10,14]};
  for(const cx of SL.COLX)put(prop([{x0:cx-.1,x1:cx+.8,y0:0,y1:LEN,z0:184,z1:H2,noTop:true,c:[70,72,72],fs:(nx,ny,X,Yy,zr)=>sh([84,86,86],.75+.3*fbm(Yy*.4,zr/6,211)),bot:(X,Yy)=>sh([78,80,80],.75+.3*fbm(X*2,Yy*.4,213))}]),'beam');
  const FIXL=SL.FIXY.map((fy,i)=>{ const xa=MID-.18, xb=MID+.18, ya=fy-1.5, yb=fy+1.5;
    put(prop([{x0:xa,x1:xb,y0:ya,y1:yb,z0:150,z1:157,c:[58,60,60],bot:(X,Yy)=>{ const e=Math.min(X-xa,xb-X,Yy-ya,yb-Yy)*24; return e<1.5?[46,48,48]:[226,246,236,1]; }},
      ...[ya+.3,yb-.3].map(ry=>({x0:MID-.02,x1:MID+.02,y0:ry-.02,y1:ry+.02,z0:157,z1:H2,c:[50,52,54]}))]),'light fixture');
    const Lp=new THREE.PointLight(new THREE.Color(.74,1,.8),LAMPI*1.9,17*TILE,LAMPD); Lp.position.set(...V(MID,fy,SZ+140)); Lp.userData.i0=Lp.intensity; scene.add(Lp); lamps.push(Lp); return {L:Lp,fy}; });
  { const LEDTXT=['PLEASE MIND THE GAP','TRAIN ARRIVING','14:03'], xa=MID-.9, xb=MID+.9, yb=7.6, LW=xb-xa;
    const led=(cx,z)=>{ const r=Math.floor((150-z)*2); for(let l=0;l<3;l++){ const t=LEDTXT[l], w=t.length*4, x=Math.floor(cx-(LW*48-w)/2), yy=r-6-l*9; if(yy<0||yy>=5||x<0||x>=w)continue;
        const g=W.LED[t[Math.floor(x/4)]], q=x%4; return q<3&&g&&g[yy*3+q]==='1'?SC6.dot:SC6.dotDim; } return SC6.board; };
    put(prop([{x0:.02,x1:.12,y0:yb-LW/2,y1:yb+LW/2,z0:122,z1:150,c:SC6.board,em:1,fs:(nx,ny,X,Yy,zr,b)=>nx>0?led(seen(nx,ny,X,Yy,b)*2,zr+122):SC6.board}]),'arrival board');
    const cy=SL.COLY[1]+.7, cx=SL.COLX[0]+.25; put(prop([{x0:cx,x1:cx+.2,y0:cy,y1:cy+.16,z0:150,z1:157,c:SC6.cam,fj:(X,z)=>Math.hypot((X-cx-.1)*24,z-153.5)<1.6?SC6.lens:sh(SC6.cam,.7)}]),'camera'); }
  BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[PF]}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[PF],...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  { const c=flat(0,0,XW,LEN,H2,ceilPaint,12,true); c.material.side=THREE.FrontSide; c.material.clippingPlanes=[PF]; }
  const lid=(x0,y0,x1,y1,z,c)=>{ const g=new THREE.BufferGeometry(), p=[V(x0,y0,z+SZ),V(x1,y0,z+SZ),V(x1,y1,z+SZ),V(x0,y1,z+SZ)]; g.setAttribute('position',new THREE.Float32BufferAttribute([...p[0],...p[1],...p[2],...p[0],...p[2],...p[3]],3)); g.computeVertexNormals();
      if(g.attributes.normal.getY(0)>0){ const a=g.attributes.position.array; for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++){ const t=a[i+3+k]; a[i+3+k]=a[i+6+k]; a[i+6+k]=t; } g.computeVertexNormals(); }
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,clippingPlanes:[plane()]})); me.receiveShadow=true; scene.add(me); return me; };
  lid(SL.EX0,-SL.ED,SL.EX1,0,86,0x050506);
  { const BEAM=new THREE.MeshBasicMaterial({color:new THREE.Color(.5,.62,.56),transparent:true,opacity:.014,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,clippingPlanes:[PF]});
    const g=new THREE.BufferGeometry(), P=[], q=(a,b,c,d)=>P.push(...a,...b,...c,...a,...c,...d);
    for(const {fy} of FIXL){ const t=[V(MID-.18,fy-1.5,SZ+150),V(MID+.18,fy-1.5,SZ+150),V(MID+.18,fy+1.5,SZ+150),V(MID-.18,fy+1.5,SZ+150)], b=[V(MID-1.1,fy-2.2,SZ),V(MID+1.1,fy-2.2,SZ),V(MID+1.1,fy+2.2,SZ),V(MID-1.1,fy+2.2,SZ)];
      for(let k=0;k<4;k++)q(t[k],t[(k+1)%4],b[(k+1)%4],b[k]); }
    g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); const me=new THREE.Mesh(g,BEAM); me.renderOrder=5; scene.add(me); }
  cutWalls.push({pl:PF,nx:0,nz:0,foot:Y(SZ+100),always:true,me:null});
  solid(-1,0,0,LEN,UH*2); solid(XW,0,XW+1,LEN,UH*2); solid(P0,-1,SL.EX0,0,UH*2); solid(SL.EX1,-1,P1,0,UH*2); solid(SL.EX0,-SL.ED-1,SL.EX1,-SL.ED,UH*2); solid(P0,LEN,P1,LEN+1,UH*2);
  { const PT=plane();
    BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[PT]}));
    cutWalls.push({pl:PT,nx:0,nz:0,foot:Y(SZ+40),always:true,me:null}); }
  { const P=[[-1,-SL.ED-2],[XW+1,LEN+1]]; const Q=P.map(([x,y])=>V(x,y,0)); BOUND={x0:Math.min(...Q.map(q=>q[0])),x1:Math.max(...Q.map(q=>q[0])),z0:Math.min(...Q.map(q=>q[2])),z1:Math.max(...Q.map(q=>q[2]))}; }
  const TX=(wx,wz)=>SL.MY0-SHARED.BOD.MY(wz), TY=(wx,wz)=>SHARED.BOD.MX(wx)-XS0, at=(x,y)=>{ const p=V(x,y,0); return {x:p[0],z:p[2]}; }, box=(x0,y0,x1,y1)=>{ const a=at(x0,y0), b=at(x1,y1); return {x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)}; };
  const M=window.METRO=SHARED.METRO={V,Y,TX,TY,at,DY:Y(SZ),XC,ZB,SL,MACH:{x:MX+.28,y:MY+.35}};
  LEVELS.of.station={name:'THE SUBWAY STATION',label:()=>M.label?M.label():'THE SUBWAY STATION',floor:'down',base:true,groups:['down'],ceil:Y(SZ+H2)};
  const inSta=(tx,ty)=>tx>-1&&tx<XW+1&&ty>-SL.ED-1&&ty<LEN+1;
  M.more=[]; M.inside=(x,z)=>{ const tx=TX(x,z), ty=TY(x,z); return inSta(tx,ty)||M.more.some(m=>m.inside(x,z)); };
  M.ground=(x,z)=>{ for(const m of M.more){ const g=m.ground(x,z); if(g!=null)return g; } const tx=TX(x,z), ty=TY(x,z); return Y(SZ+(inSta(tx,ty)&&ty>=-SL.ED-.5&&ty<=LEN&&tx>=P0&&tx<=P1?0:inSta(tx,ty)&&ty>=0&&ty<=LEN?SL.fzAt(tx,ty):-32)); };
  M.GRAF=GRAF;
  M.plat=at(8.2,16); M.foot=at(SL.XS,1.1); M.street={x:XC,z:(SM.y1+77)*TILE+1.4*TILE};
  M.lane=box(P0+.6,7.5,P1-.6,LEN-.6); M.edge=box(P1-.75,7,P1-.15,LEN-.6); M.track=box(P1+.3,1,XW-.3,LEN-1);
  M.rats=[[M.lane,8.6,27.2],[M.lane,13.8,19.6],[M.edge,P1-.4,25],[M.track,SL.TR[1],15]].map(([lane,x,y])=>({lane,...at(x,y)}));
  M.path=[{x:XC,z:(SM.y1-.3+77)*TILE},{x:XC,z:(SM.y0+.3+77)*TILE,lv:'down'}].concat([at(SL.XS,7.4),at(SL.XS-3.2,10.6),M.plat].map(p=>({...p,lv:'down'})));
  {
    let ft=0, fon=1; const FL=FIXL[2]; M.flick=dt=>{ if(SHARED.LVL!=='down')return; ft-=dt; if(ft<=0){ fon=Math.random()<.82?1:Math.random()<.5?.25:0; ft=fon===1?.4+Math.random()*3.5:.04+Math.random()*.12; } FL.L.intensity=FL.L.userData.i0*fon; }; }
// THE STATION'S END AND THE BODEGA'S START: closes grab('down') (the platform under the street) and sets up BOD, the bodega's bag of makers.
  M.exit=()=>{ const S=SM, X=x=>(x-72)*TILE, Z=y=>(y+77)*TILE, n=S.steps, rise=S.depth/n, run=(S.y1-S.y0)/n, c3=new THREE.Color(), TR=[[],[]], WL=[[],[]];
    const q4=(B,a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ B[0].push(...v); B[1].push(c3.r,c3.g,c3.b); } };
    const boxer=Q=>(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[z0*ZU,z1*ZU], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
      Q([a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); Q([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); Q([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); Q([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); Q([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); }, bx=boxer((...p)=>q4(WL,...p));
    const CON=[124,80,68], CON2=[108,68,58], TL=[186,190,197], RAIL=[40,92,72], GRN=[142,142,138], PNL=[30,32,40];
    for(let k=0;k<n;k++){ const yA=S.y1-(k+1)*run, yB=S.y1-k*run, zt=-(k+1)*rise*ZU, zr=-k*rise*ZU, a=X(S.x0), b=X(S.x1);
      q4(TR,[a,zt,Z(yB)],[b,zt,Z(yB)],[b,zt,Z(yA)],[a,zt,Z(yA)],((k&1)?CON:CON2).map(v=>v*(1-.3*k/n))); q4(TR,[a,zt,Z(yB)],[b,zt,Z(yB)],[b,zr,Z(yB)],[a,zr,Z(yB)],CON2.map(v=>v*.82));
      q4(TR,[a,zt,Z(yB-.03)],[b,zt,Z(yB-.03)],[b,zt+1.2*ZU,Z(yB-.03)],[a,zt+1.2*ZU,Z(yB-.03)],[86,52,44]); }
    const EX=[[],[]], E=4, J=6, yL=S.y0-E*run, LD=S.x1-S.x0, zL=-S.depth-E*rise, xE=S.x1+J*run, xm=(S.x0+S.x1)/2, CC=[138,136,130], CR=[104,102,98], CW=[120,118,112], CK=[84,84,82];
    const dim=v=>{ const x=SHARED.BOD.MX(v[0]), y=SHARED.BOD.MY(v[2]), d=Math.max(0,S.y0-Math.max(y,yL))+Math.max(0,x-xm)+Math.max(0,yL-y)*.4; return Math.max(0,1-Math.min(10,d)/10)**1.5; };
    const qe=(a,b,c,d,col)=>{ for(const v of [a,b,c,a,c,d]){ const k=dim(v); c3.setRGB(col[0]/255*k,col[1]/255*k,col[2]/255*k,THREE.SRGBColorSpace); EX[0].push(...v); EX[1].push(c3.r,c3.g,c3.b); } }, be=boxer(qe);
    for(let k=0;k<E;k++){ const yA=S.y0-(k+1)*run, yB=S.y0-k*run, zt=(-S.depth-(k+1)*rise)*ZU, zr=zt+rise*ZU, a=X(S.x0), b=X(S.x1);
      qe([a,zt,Z(yB)],[b,zt,Z(yB)],[b,zt,Z(yA)],[a,zt,Z(yA)],CC); qe([a,zt,Z(yB)],[b,zt,Z(yB)],[b,zr,Z(yB)],[a,zr,Z(yB)],CR); }
    { const a=X(S.x0), b=X(S.x1), z=zL*ZU; qe([a,z,Z(yL)],[b,z,Z(yL)],[b,z,Z(yL-LD)],[a,z,Z(yL-LD)],CC); }
    for(let j=0;j<J;j++){ const xA=S.x1+j*run, xB=xA+run, zt=(zL-(j+1)*rise)*ZU, zr=zt+rise*ZU, zc=Math.min(-30,zL-(j+1)*rise+100);
      qe([X(xA),zt,Z(yL)],[X(xB),zt,Z(yL)],[X(xB),zt,Z(yL-LD)],[X(xA),zt,Z(yL-LD)],CC); qe([X(xA),zt,Z(yL)],[X(xA),zt,Z(yL-LD)],[X(xA),zr,Z(yL-LD)],[X(xA),zr,Z(yL)],CR);
      be(xA,yL-LD,zc,xB,yL,zc+4,CK); }
    const zD=zL-J*rise-2;
    be(S.x0-.2,yL-LD,zL-2,S.x0,S.y0,-30,CW); be(S.x1,yL,zL-2,S.x1+.2,S.y0,-30,CW); be(S.x1,yL,zD,xE,yL+.2,-30,CW); be(S.x0-.2,yL-LD-.2,zD,xE+.2,yL-LD,-30,CW); be(xE,yL-LD,zD,xE+.2,yL,-30,[0,0,0]);
    be(S.x0-.2,yL-LD-.2,-34,S.x1+.2,S.y0,-30,CK); be(S.x0-.2,S.y0-.3,-30,S.x1+.2,S.y0,0,CW);
    const P=.3, xl=S.x0-P/2, xr=S.x1+P/2, yb=S.y0-P/2, LP=[[xl,S.y1-.08],[xr,S.y1-.08],[xl,yb],[xr,yb]];
    for(const x of [S.x0-.2,S.x1])for(let k=0;k<n;k++)bx(x,S.y1-(k+1)*run,-(k+1)*rise-2,x+.2,S.y1-k*run,0,TL);
    bx(S.x0-P,S.y0-P,0,S.x0,S.y1,5,GRN); bx(S.x1,S.y0-P,0,S.x1+P,S.y1,5,GRN); bx(S.x0,S.y0-P,0,S.x1,S.y0,5,GRN);
    const fence=(ax,c,a,b,sg)=>{ const B=(u0,u1,v0,v1,z0,z1,col)=>ax==='y'?bx(c+v0,u0,z0,c+v1,u1,z1,col):bx(u0,c+v0,z0,u1,c+v1,z1,col);
      B(a,b,-.04,.04,7,9,RAIL); B(a,b,-.05,.05,33,36,RAIL); B(a,b,-.03,.03,29,30,RAIL);
      for(let u=a+.2;u<b-.1;u+=.2)if(Math.abs(u-(a+b)/2)>sg/2)B(u-.02,u+.02,-.02,.02,9,33,RAIL);
      B((a+b)/2-sg/2,(a+b)/2+sg/2,-.03,.03,11,29,PNL); B((a+b)/2-sg/2-.04,(a+b)/2+sg/2+.04,-.035,.035,10,11,RAIL); B((a+b)/2-sg/2-.04,(a+b)/2+sg/2+.04,-.035,.035,29,30.2,RAIL);
      for(const u of [a+(b-a)/3,a+2*(b-a)/3])if(Math.abs(u-(a+b)/2)>sg/2+.05)B(u-.05,u+.05,-.06,.06,5,38,RAIL); };
    fence('y',xl,yb,S.y1-.08,2.2); fence('y',xr,yb,S.y1-.08,2.2); fence('x',yb,xl,xr,3.2);
    for(const [x,y] of LP){ bx(x-.1,y-.1,5,x+.1,y+.1,14,RAIL); bx(x-.06,y-.06,14,x+.06,y+.06,100,RAIL); bx(x-.08,y-.08,96,x+.08,y+.08,103,RAIL); bx(x-.09,y-.09,113,x+.09,y+.09,116,RAIL); bx(x-.03,y-.03,116,x+.03,y+.03,120,RAIL); }
    MODS.stairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); const SW=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    const mk=(B,pl)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(B[0],3)); g.setAttribute('color',new THREE.Float32BufferAttribute(B[1],3)); g.computeVertexNormals();
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:pl})); me.receiveShadow=me.castShadow=true; scene.add(me); return me; };
    mk(TR,[MODS.stairCut]); M.deep=mk(EX,[MODS.stairCut]); cutWalls.push({pl:SW,nx:0,nz:0,foot:Y(SZ+8),me:mk(WL,[MODS.stairCut,SW]),get always(){ return SHARED.LVL==='down'&&MODS.inStair(pos.x,pos.z)==null; }});
    { const CL=[MODS.stairCut,SW], ink=[244,242,232,1], DOT=[[250,196,40,1],[244,128,40,1],[40,104,200,1],[230,52,44,1],[150,70,170,1],[40,150,80,1]];
      const tex=(s,w,h,dots)=>{ const t=W.text(s,2,ink,null,null,0), ox=Math.round((w-t.w)/2), oy=dots?2:Math.round((h-t.h)/2)-1;
        return faceTex(w,h,(i,j)=>{ const c=t.at(i-ox,j-oy); if(c)return c; if(dots&&j>=14&&j<17){ const k=Math.floor((i-ox)/5), r=(i-ox)%5; if(k>=0&&k<DOT.length&&r<3)return DOT[k]; }
          if(j===h-3&&i>=ox&&i<w-ox)return [200,200,196]; return j<1||j>=h-1||i<1||i>=w-1?[58,60,68]:[30,32,40]; }); };
      const sign=(ax,c,m,L,z0,z1,tx)=>{ for(const s of [-1,1]){ const o=c+s*.034, a=m+s*L/2*(ax==='y'?1:-1), b=m-s*L/2*(ax==='y'?1:-1), P=(u,z)=>ax==='y'?[X(o),z*ZU,Z(u)]:[X(u),z*ZU,Z(o)];
          const me=quad(P(a,z0),P(b,z0),P(b,z1),P(a,z1),tx,true); me.material.clippingPlanes=CL; } };
      const SUB=tex('SUBWAY',57,17), STA=tex(SECTIONS.station,83,21,1), ym=(yb+S.y1-.08)/2;
      sign('y',xl,ym,2.2,11,29,SUB); sign('y',xr,ym,2.2,11,29,SUB); sign('x',yb,(xl+xr)/2,3.2,11,29,STA);
      const gm=new THREE.MeshBasicMaterial({color:0xdcf3dc,clippingPlanes:CL}), gg=new THREE.SphereGeometry(.13*TILE,10,8);
      for(const [x,y] of LP){ const g=new THREE.Mesh(gg,gm); g.position.set(X(x),107*ZU,Z(y)); scene.add(g); } }
    for(const [y,z,c,i] of [[S.y1-.3,100,[.9,1,.9],5],[S.y0+.6,-40,[.5,.54,.64],6]]){ const L=new THREE.PointLight(new THREE.Color(...c),i,7*TILE,1.6); L.position.set(XC,z*ZU,Z(y)); L.userData.i0=i; scene.add(L); lamps.push(L); }
    const sol=(lv,x0,y0,x1,y1,h)=>{ SOL[lv].push([X(x0),Z(y0),X(x1),Z(y1)]); FIX[lv].push([X(x0),Z(y0),0,X(x1),Z(y1),h]); };
    for(const x of [S.x0-.3,S.x1])sol('up',x,S.y0,x+.3,S.y1,36*ZU);
    sol('up',S.x0-.3,S.y0-.3,S.x1+.3,S.y0,36*ZU); };
  { const run=(SM.y1-SM.y0)/SM.steps, tread=(x,z)=>{ const gx=SHARED.BOD.MX(x), gy=SHARED.BOD.MY(z); return gx>=SM.x0&&gx<SM.x1&&gy>=SM.y0&&gy<SM.y1?Math.min(SM.steps,Math.floor((SM.y1-gy)/run)+1):null; };
    const el=document.createElement('div'); el.id='subfade';
    el.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .32s steps(4);z-index:60;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;color:#d8d2c4;font:14px/1 monospace;letter-spacing:3px';
    el.innerHTML='<div class="ft"></div><div class="fb" style="width:min(360px,70vw);height:10px;border:2px solid #4a4a52;padding:2px;visibility:hidden"><div style="height:100%;width:0;background:#d8d2c4"></div></div><div class="fl" style="font-size:11px;letter-spacing:2px;color:#8a8478;min-height:11px;text-align:center;max-width:80vw"></div>';
    document.body.appendChild(el);
    // the loading screens' bar (owner, 7 Nov 2026: "showing loading progress bars that show what is loading on every loading screen"): what the work says it is doing (FADE.note), the files coming down (__LDG, the website), the squares still to paint near you (BATCH.left)
    const ft=el.querySelector('.ft'), fb=el.querySelector('.fb'), fbi=fb.firstChild, fl=el.querySelector('.fl'); let B0=null, NOTE=null;
    FADE.note=(what,i,n)=>{ NOTE=what?{what,i,n}:null; }; FADE.left=()=>BATCH.left&&!(ROOMS.offIn&&ROOMS.offIn())?BATCH.left(FADE.R()):0;   // (never asked from a room off the map: its windows' answer is fixed the first time it is asked)
    const bar=()=>{ if(!B0)return; const L=window.__LDG, net=L?L.n-B0.n:0, netD=L?L.d-B0.d:0, pl=FADE.left(); B0.p=Math.max(B0.p,pl);
      // (each source keeps its own share; the bar follows the one the line names first that is not done: building, then downloading, then painting)
      const parts=[], S=B0.s, put=(k,v)=>{ S[k]=Math.max(S[k]||0,Math.min(1,v)); }; if(NOTE){ parts.push(NOTE.what+(NOTE.n?' '+NOTE.i+' / '+NOTE.n:'')); if(NOTE.n)put('note',NOTE.i/NOTE.n); }
      if(L&&L.now.size)parts.push('DOWNLOADING '+[...new Set(L.now.values())].slice(0,3).join(', ').toUpperCase()); if(net>0)put('net',netD/net);
      if(pl)parts.push('PAINTING '+pl+' SQUARE'+(pl>1?'S':'')+' NEAR YOU'); if(B0.p)put('paint',1-pl/B0.p);
      const live_=['note','net','paint'].filter(k=>k in S&&S[k]<1), k=live_.length?S[live_[0]]:Object.keys(S).length?1:0; B0.k=k; fbi.style.width=(B0.k*100).toFixed(1)+'%'; fb.style.visibility='visible'; fl.textContent=parts.join(' · ')||(B0.k>=1?'READY':'LOADING'); };
    let barT=0; const barOn=on=>{ if(on){ if(!B0){ const L=window.__LDG; B0={n:L?L.n:0,d:L?L.d:0,p:0,k:0,s:{}}; } if(!barT)barT=setInterval(bar,250); bar(); } else { clearInterval(barT); barT=0; B0=null; NOTE=null; fb.style.visibility='hidden'; fbi.style.width='0'; fl.textContent=''; } };
    // settled: nothing downloading and every square within reach painted (a view's switch waits for it, at most 20 s; the painting goes faster behind the black)
    FADE.R=()=>{ const D=CULL.drawD&&CULL.drawD(); return (D||40*TILE)+8*TILE; };   // (with the draw distance ALL, the near ring a view needs first: the old 40 tiles)   // (what the view draws: the draw distance and a little; past it the squares paint on in the background)
    // every loading screen that ends in a close-up view lifts once that view is painted (owner, 7 Nov 2026)
    FADE.settle=async(max=20000)=>{ const t0=performance.now(); for(const f of FADE.arrive)try{ await f(); }catch(e){ SYS.fail('arrive',e); } for(;;){ const L=window.__LDG, R=FADE.R(); if(!(L&&L.now.size)&&!FADE.left()){ if(CULL.rush)CULL.rush(); return true; } if(performance.now()-t0>max)return false; BATCH.rush(60,R); await new Promise(r=>requestAnimationFrame(r)); } };
    FADE.el=el; FADE.run=async(text,work,o={})=>{ const tr=el.style.transition, w=ms=>new Promise(r=>setTimeout(r,ms)), fr=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
      const live=SYS.started&&!o.silent, was=el.style.opacity==='1'; FADE.busy=(FADE.busy||0)+1;
      if(live){ ft.textContent=text||''; barOn(true); el.style.pointerEvents='auto'; el.style.transition=o.cut?'none':'opacity .3s steps(4)'; el.style.opacity='1'; if(!o.cut&&!was)await w(320); }
      if(keys.clear&&!o.keep)keys.clear(); try{ SHARED.target=null; }catch(e){}
      try{ if(o.cut)await fr(2); if(work)await work(); if(live&&o.settle!==false&&FADE.R())await FADE.settle(); }catch(e){ console.warn('FADE: '+(text||'')+' did not finish',e); }
      if(live){ await fr(o.cut?2:3); if(o.hold)await w(o.hold); if(FADE.busy===1){ if(B0){ bar(); B0.k=1; fbi.style.width='100%'; } el.style.transition=o.cut?'none':'opacity .4s steps(5)'; el.style.opacity='0'; el.style.pointerEvents='none'; if(!o.cut)await w(420); el.style.transition=tr; if(FADE.busy===1)barOn(false); } }
      FADE.busy--; };
    const qy=QS.get('subyaw'); M.YAW=-Math.PI/4+(qy!=null?+qy:0)*Math.PI/2;
    let busy=false;
    const go=async dir=>{ '@later'; busy=true; await FADE.run(dir==='in'?'ENTERING SUBWAY':'LEAVING SUBWAY',()=>{
      const p=dir==='in'?M.foot:M.street; UI.goTo(p.x,p.z,dir==='in'?'down':'up');
      if(UI.view==='iso'||UI.view==='map'){ if(dir==='in'){ SHARED.yaw=SHARED.yawTo=M.YAW; } else if(UI.isoTo){ UI.isoTo(); SHARED.yaw=SHARED.yawTo; } } },{hold:120}); busy=false; };
    const inExit=p=>{ const tx=TX(p.x,p.z), ty=TY(p.x,p.z); return tx>SL.EX0&&tx<SL.EX1&&ty<-2.5&&ty>-SL.ED-1; };
    M.door=(py,p)=>{ if(M.deep)M.deep.visible=SHARED.LVL==='up'; if(busy||UI.freeCam||(RAG.on))return; const k=tread(p.x,p.z);
      if(SHARED.LVL!=='down'&&k!=null&&k>=3)go('in'); else if(SHARED.LVL==='down'&&inExit(p))go('out'); };
    { const S=SM; S.has=(x,z)=>{ if(SHARED.LVL==='down')return false; const gx=SHARED.BOD.MX(x), gy=SHARED.BOD.MY(z); return gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1; }; }
    M.doorBusy=()=>busy; window.SUBGO=MODS.subGo=(x,z,lv)=>UI.goTo(x,z,lv); }
  M.tick=dt=>{ M.flick(dt); };
}
MODS.station={BOUND,ground:(x,z)=>SHARED.METRO.inside(x,z)?SHARED.METRO.ground(x,z):STN.DY,DY:SHARED.METRO.DY,plat:SHARED.METRO.plat,lane:SHARED.METRO.lane,path:SHARED.METRO.path};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>SHARED.LVL==='down'; for(const L of SHL)L.removeFromParent(); });
SHARED.BOD={meshes:[], walls:{}, lamps:[]};
export {WATER};
