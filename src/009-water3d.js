const WATER={drops:[], uH:{value:null}, uWB:{value:new THREE.Vector4()}, uLevel:{value:0}, uGrid:{value:new THREE.Vector2()}, uCK:{value:+(QS0=>QS0.get('ck')||160)(new URLSearchParams(location.search))}, mats:[]};
WATER.caustic=m=>{ m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uH:WATER.uH,uWB:WATER.uWB,uLevel:WATER.uLevel,uGrid:WATER.uGrid,uCK:WATER.uCK});
  sh.vertexShader='varying vec3 vWp;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWp=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader='uniform sampler2D uH; uniform vec4 uWB; uniform float uLevel,uCK; uniform vec2 uGrid; varying vec3 vWp;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
  if(vWp.y<uLevel){ vec2 uv=(vWp.xz-uWB.xy)/(uWB.zw-uWB.xy); uv=clamp(uv,0.,1.); vec2 t=1./uGrid; float c=texture2D(uH,uv).r;
    float lap=texture2D(uH,uv+vec2(t.x,0.)).r+texture2D(uH,uv-vec2(t.x,0.)).r+texture2D(uH,uv+vec2(0.,t.y)).r+texture2D(uH,uv-vec2(0.,t.y)).r-4.*c;
    float k=clamp(-lap*uCK,-0.45,1.6)*smoothstep(0.,0.4,uLevel-vWp.y); gl_FragColor.rgb+=gl_FragColor.rgb*k*vec3(.75,.92,1.); }`); }; m.needsUpdate=true; WATER.mats.push(m); };
const waterBody=(WATER,cfg)=>{ const {X0,X1,Z0,Z1,lvl,GX,GY}=cfg, W=X1-X0, D=Z1-Z0;
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
WATER.build=()=>{ const P=POOLR; waterBody(WATER,{X0:P.X(P.bx0),X1:P.X(P.bx1),Z0:P.Z(P.by0),Z1:P.Z(P.by1),lvl:P.Y(P.level),GX:208,GY:80,dep:u=>Math.max(0.02,(P.level-P.bedAt(u*P.LX))/24*0.84)}); };
WATER.extra=[]; WATER.body=cfg=>{ const W={drops:[],uH:{value:null},uWB:{value:new THREE.Vector4()},uLevel:{value:0},uGrid:{value:new THREE.Vector2()},mats:[],name:cfg.name}; waterBody(W,cfg); WATER.extra.push(W); return W; };
WATER.tickAll=(renderer,dt,pos)=>{ for(const w of WATER.extra){ w.on=LVL==='up'&&Math.hypot(pos.x-(w.X0+w.W/2),pos.z-(w.Z0+w.D/2))<14*TILE; if(w.on)w.step(renderer,dt); } };
WATER.underAll=(renderer,scene,cam,lamps)=>{ for(const w of WATER.extra)if(w.on)w.under(renderer,scene,cam,lamps); };
WATER.feed=(st,pos,dt,go,keys)=>{ if(!WATER.mesh)return RIG.water(st,{level:null,floor:0});
  const b=POOLR.inBasin(pos.x,pos.z), in0=st.water&&st.water.in;
  WATER.rise=in0?0.065/(POOLR.LX*POOLR.LY*0.84*0.84)/WATER.MPU:0; WATER.mesh.position.y=WATER.lvl+WATER.rise;
  const W=RIG.water(st,b?{level:POOLR.level*BLDK+(WATER.hAt(pos.x,pos.z)+WATER.rise)/ZU,floor:POOLR.bedAt(b[0])*BLDK}:{level:null,floor:0});
  W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
  if(W.in&&W.floor>=W.level-30&&!st.move&&!W.dive){ W.in=false; if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:0.4}; }
  const was=WATER.wasIn; WATER.wasIn=W.in; if(W.in&&!was){ WATER.drop(pos.x,pos.z,0.5,0.09); WATER.splash(pos.x,WATER.lvl,pos.z,70,2.6); }
  for(const e of W.events)if(e.k==='splash'){ WATER.drop(pos.x,pos.z,0.45,Math.min(0.14,0.02+e.v*0.0009)); WATER.splash(pos.x,WATER.lvl,pos.z,Math.min(90,20+e.v*0.5),Math.min(3,1+e.v*0.015)); } W.events.length=0;
  WATER.wake=(WATER.wake||0)-dt; if(b&&(W.in||W.floor<W.level)&&WATER.wake<0){ WATER.wake=0.07; const s=W.in?(go?0.016:0.006)*(1+W.fast):(go?0.012:0);
    if(s)WATER.drop(pos.x+(Math.random()-.5)*0.25,pos.z+(Math.random()-.5)*0.25,W.in?0.32:0.22,s); if(W.in&&go&&!W.dive&&Math.random()<0.35)WATER.splash(pos.x,WATER.lvl,pos.z,3+(W.fast?4:0),1.1); }
  return W; };

await grab('down',async()=>{ const solids=SOL.down, fixed=FIX.down, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;
if(AWAY.has('station')){
