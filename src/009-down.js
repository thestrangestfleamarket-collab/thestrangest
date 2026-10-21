// UNDER THE STREET: the water's shader, the station and platform under the street (grab('down')), the day's start and FADE.
import {SHARED, THREE} from './003-shx.js';
import {keys, LINES, pos, RAG, SFX, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {cutWalls, FADE, FIX, grab, LAMPD, LAMPI, lamps, MAPG, MAPSTAIR, MODS, QS, SOL, STN, TILE, ZU} from './006-map-pre.js';
import {BATCH, OBJ} from './008-batch.js';
const WATER={drops:[], uH:{value:null}, uWB:{value:new THREE.Vector4()}, uLevel:{value:0}, uGrid:{value:new THREE.Vector2()}, uCK:{value:+(QS0=>QS0.get('ck')||160)(new URLSearchParams(location.search))}, mats:[]};
WATER.caustic=m=>{ '@later'; m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uH:WATER.uH,uWB:WATER.uWB,uLevel:WATER.uLevel,uGrid:WATER.uGrid,uCK:WATER.uCK});
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
WATER.step=(renderer,dt)=>{ '@later'; WATER.t+=dt;
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
WATER.hAt=(x,z)=>{ '@later'; const GX=WATER.GX, GY=WATER.GY, fx=Math.max(0,Math.min(GX-1.001,(x-WATER.X0)/WATER.W*GX-.5)), fz=Math.max(0,Math.min(GY-1.001,(z-WATER.Z0)/WATER.D*GY-.5)), i=fx|0, j=fz|0, u=fx-i, v=fz-j,
  H=(a,b)=>THREE.DataUtils.fromHalfFloat(WATER.rb[(b*GX+a)*4]); return H(i,j)*(1-u)*(1-v)+H(i+1,j)*u*(1-v)+H(i,j+1)*(1-u)*v+H(i+1,j+1)*u*v; };
WATER.slope=(x,z)=>{ const e=WATER.dx; return [(WATER.hAt(x+e,z)-WATER.hAt(x-e,z))/(2*e),(WATER.hAt(x,z+e)-WATER.hAt(x,z-e))/(2*e)]; };
WATER.over=(x,z)=>x>WATER.X0&&x<WATER.X0+WATER.W&&z>WATER.Z0&&z<WATER.Z0+WATER.D;
WATER.SP={n:0,max:600,p:new Float32Array(600*3),v:new Float32Array(600*3)};
WATER.splash=(x,y,z,n,sp)=>{ const S=WATER.SP; for(let k=0;k<n&&S.n<S.max;k++){ const i=S.n++, a=Math.random()*Math.PI*2, up=0.5+Math.random()*0.8, out=Math.random()*0.7;
  S.p.set([x+(Math.random()-.5)*0.2,y+0.02,z+(Math.random()-.5)*0.2],i*3); S.v.set([Math.cos(a)*out*sp,up*sp,Math.sin(a)*out*sp],i*3); } };
WATER.spray=dt=>{ '@later'; const S=WATER.SP, g=9.81/WATER.MPU; let k=0; dt=Math.min(dt,1/30);
  for(let i=0;i<S.n;i++){ const p=S.p, v=S.v; v[i*3+1]-=g*dt; for(let q=0;q<3;q++)p[i*3+q]+=v[i*3+q]*dt;
    const x=p[i*3], y=p[i*3+1], z=p[i*3+2], wet=WATER.over(x,z);
    if(wet&&y<WATER.lvl+WATER.hAt(x,z)&&v[i*3+1]<0){ WATER.drop(x,z,0.07,0.0025); continue; } if(!wet&&y<0)continue;
    if(k!==i){ for(let q=0;q<3;q++){ p[k*3+q]=p[i*3+q]; v[k*3+q]=v[i*3+q]; } } k++; }
  S.n=k; const a=WATER.spg.attributes.position; a.array.set(S.p.subarray(0,k*3)); a.needsUpdate=true; WATER.spg.setDrawRange(0,k); };
WATER.under=(renderer,scene,cam,lamps)=>{ '@later'; const w=renderer.domElement.width, h=renderer.domElement.height; if(WATER.rt.width!==w||WATER.rt.height!==h)WATER.rt.setSize(w,h);
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
const WSUB=(()=>{ const ox=-90, oy=-105;
  const AVE=60+ox, PLAT=66+ox, TW=70.4+ox, SY0=19.2+oy, SY1=44.7+oy, END=64+oy, TUN=24, E_PLAT=108+ox, E_AVE=114+ox, ETW=103.6+ox;
  const W={o:[ox,oy],AVE,PLAT,TW,SY0,SY1,END,TUN,TUN0:PLAT,TUN1:TW,E_PLAT,E_AVE,ETW,LOOPW:TW-PLAT,
    TRACKS:[68.1+ox,E_PLAT-(68.1-PLAT)],
    TSTEPS:[[SY0+.4,SY0+1.6],[SY1-1.6,SY1-.4]],
    D1Y:32+oy, CARL:22.4, CARW:1.8, LDR:[-5.9,0,5.8],
    SCAR:{x0:-11.2,y0:-20,x1:11.2,y1:-16.4}};
  const mod=(a,n)=>((a%n)+n)%n;
  W.art=(Wd,H,draw)=>{ const a=new Array(Wd*H).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<Wd&&y<H)a[y*Wd+x]=c; }); return (x,y)=>x>=0&&y>=0&&x<Wd&&y<H?a[y*Wd+x]:null; };
  const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011'};
  W.txt=(put,s,x0,y0,c,k=2)=>{ [...s].forEach((ch,i)=>{ const g=F3[ch]; if(!g)return; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')for(let a=0;a<k;a++)for(let b=0;b<k;b++)put(x0+(i*4+q)*k+a,y0+r*k+b,c); }); };
  W.fzAt=(x,y)=>x<PLAT+.75&&W.TSTEPS.some(([a,b])=>y>=a&&y<b)?-8*(1+Math.floor((x-PLAT)/.25)):-32;
  W.platformCol=(x,y)=>{ const e=x>=E_PLAT-.5?x-E_PLAT:PLAT-x;
    if(e<=.06)return mt('lines',[214,180,72]); if(e<=.8){ const u=mod(x*6,1)-.5, v=mod(y*6,1)-.5; return mt('lines',u*u+v*v<.08?[176,148,74]:[150,124,56]); }
    const i=Math.floor(x), j=Math.floor(y); if(x-i<.04||y-j<.04)return mt('platform',[158,161,166]);
    const n=hash(Math.floor(x*5),Math.floor(y*5),101), c=(i+j)&1?[216,218,222]:[188,191,198]; return mt('platform',n<.035?sh(c,.84):n>.93?sh(c,.97):c); };
  W.platEdge=(u,z)=>sh(mt('concrete',[128,126,120]),z>-3?1:.7);
  W.tracksCol=(x,y)=>{ for(const t of W.TRACKS){ const d=Math.abs(x-t), r=Math.abs(d-.7);
      if(r<.07)return mt('rails',r<.025?[200,202,208]:[120,122,128]); if(r<.13&&mod(y,1.25)<.32)return mt('rails',[128,72,44]); if(d<.95&&mod(y,1.25)<.32)return mt('ballast',[74,44,32]); }
    const n=hash(Math.floor(x*10),Math.floor(y*10),103); return mt('ballast',n<.3?[30,30,34]:n<.6?[22,22,26]:[40,40,44]); };
  W.tile=(u,z,f)=>{ const T6=.63*24, i=Math.floor(u*24/T6), k=Math.floor((z+32)/T6), g=(u*24/T6-i)<.11||((z+32)/T6-k)<.11, low=z<36;
    const c=low?(g?[40,42,46]:[60,62,68]):(g?[142,146,152]:[186,190,197]); return sh(mt('subtile',c),f*(.95+.1*hash(i,k,107))); };
  const PW=4.5, PZ0=17, PZ1=64, POSTERS=[[SY0+1.55,'car'],[SY0+9.96,'sea'],[SY0+18.35,'comic']];
  const posterCol=(kind,a,z)=>{ const w=PW*24, h=PZ1-PZ0, x=a*24, y=PZ1-z;
    if(x<1.2||x>w-1.2||y<1.2||y>h-1.2)return [24,24,28]; if(x<2.4||x>w-2.4||y<2.4||y>h-2.4)return [92,94,100];
    const u=x/w, v=y/h, n=hash(Math.floor(x),Math.floor(y),151);
    if(kind==='car'){ const r=Math.hypot((u-.62)*2.2,(v-.55)*1.4); return r<.42?(r<.3?[60,190,180]:[30,120,130]):v>.78?[22,40,70]:n<.06?[120,170,220]:[18,30,62]; }
    if(kind==='sea'){ const wv=Math.sin(u*40+v*8)*.5+Math.sin(u*13-v*21); return v<.32?[150,166,176]:Math.hypot(u-.55,v-.6)<.04?[220,180,90]:wv>.9?[132,150,160]:v<.5?[92,112,124]:[70,90,104]; }
    return v<.28?(u>.15&&u<.75&&Math.floor(u*w/5)%2===0&&v>.08&&v<.22?[230,190,30]:[244,240,232]):Math.hypot(u-.62,v-.62)<.22?(u>.62?[200,50,40]:[40,80,170]):u<.3&&v>.5?[230,140,40]:[244,240,232]; };
  W.tube=(u,z,f,posters)=>{ if(posters)for(const [a0,k] of POSTERS)if(u>=a0&&u<a0+PW&&z>=PZ0&&z<PZ1)return sh(posterCol(k,u-a0,z),f);
    if(z<-8&&z>-28){ if(Math.abs(z+14)<.8||Math.abs(z+20)<.8)return sh([150,40,34],f); if(mod(u,3.2)<.15)return sh([30,30,34],f); }
    const t=Math.max(0,Math.min(1,(z+32)/(94+32))), bend=.82+.18*Math.sin(Math.PI*t);
    return sh(W.tile(u,z,1),f*bend); };
  W.wallPaint=kind=>kind==='stile'?(nx,ny,X,Y,z)=>W.tile(nx?Y:X,z,nx?.8:1):kind==='tube'||kind==='tubeP'?(nx,ny,X,Y,z)=>W.tube(nx?Y:X,z,nx?.8:1,kind==='tubeP'):(nx,ny,X,Y,z)=>sh(concreteCol(nx?Y:X,z/24),nx?.8:1);
  const SZ=-UH, SC6={steel:[136,140,148],steelL:[176,180,188],dark:[38,38,44],cap:[16,16,20],cam:[62,64,70],lens:[10,10,14],board:[14,12,12],dot:[255,168,40],dotDim:[60,36,14]};
  const LED35={P:'111101111100100',L:'100100100100111',E:'111100110100111',A:'010101111101101',S:'011100010001110',M:'101111111101101',I:'111010010010111',O:'111101101101111',U:'101101101101111',
    N:'101111111111101',D:'110101101101110',T:'111010010010010',H:'101101111101101',G:'011100101101011',R:'110101110101101',V:'101101101101010',W:'101101111111101',' ':'000000000000000',C:'111100100100111',K:'101101110101101',
    Y:'101101010010010',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001011001111',4:'101101111001001',':':'000010000010000','^':'010111010010010'};
  const LEDTXT=['PLEASE MIND THE GAP','TRAIN ARRIVING','14:03'];
  W.column=(x0,y0)=>{ PNAME='station column'; const x1=x0+.7, y1=y0+.7, tile=(u,z,f)=>sh(W.tile(u,z-SZ,1),f), by0=y1+.12, by1=by0+1.6, bx=x0+.3, LW=by1-by0;
    const led=(nx,Y,z)=>{ let a=(Y-by0)*24*2; if(nx>0)a=LW*48-a; const r=Math.floor((SZ+74-z)*2);
      for(let l=0;l<3;l++){ const t=LEDTXT[l], w=t.length*4, x=Math.floor(a-(LW*48-w)/2), yy=r-6-l*9; if(yy<0||yy>=5||x<0||x>=w)continue;
        const g=LED35[t[Math.floor(x/4)]], q=x%4; return q<3&&g&&g[yy*3+q]==='1'?SC6.dot:SC6.dotDim; } return SC6.board; };
    return prop([sided({x0,y0,x1,y1,z0:SZ,z1:-6,c:[186,190,197],foot:1,top:()=>SC6.cap,fs:(nx,ny,X,Y,zr)=>tile(nx?Y:X,zr+SZ,nx?.8:1)}),
      {x0,y0,x1,y1,z0:-6,z1:0,c:SC6.cap,foot:1},
      {x0:x0-.09,y0:y0+.27,x1:x0,y1:y0+.43,z0:SZ+66,z1:SZ+72,c:SC6.cam,fi:(y,z)=>Math.hypot((y-y0-.35)*24,z-68.5)<1.6?SC6.lens:sh(SC6.cam,.7),fj:()=>sh(SC6.cam,.85),foot:0},
      {x0:bx-.02,y0:y1,x1:bx+.02,y1:by0,z0:SZ+71,z1:SZ+73,c:SC6.dark,foot:0},
      sided({x0:bx-.07,y0:by0,x1:bx+.07,y1:by1,z0:SZ+56,z1:SZ+74,c:SC6.board,em:1,foot:0,top:()=>SC6.board,fs:(nx,ny,X,Y,zr)=>nx?led(nx,Y,zr+SZ+56):SC6.board})],null,{lv:-1}); };
  W.bench=(x,y0)=>{ PNAME='station bench'; const y1=y0+2.8, c=SC6, slat=(u,z,f)=>sh(Math.floor(u*24/1.5)%2?c.steel:c.steelL,f);
    const leg=y=>({x0:x+.1,y0:y,x1:x+.6,y1:y+.1,z0:SZ,z1:SZ+11,c:c.dark,foot:1}), arm=y=>({x0:x+.06,y0:y,x1:x+.66,y1:y+.06,z0:SZ+13,z1:SZ+17,c:c.dark,foot:0});
    return prop([leg(y0+.25),leg(y1-.35),
      {x0:x+.08,y0,x1:x+.66,y1,z0:SZ+11,z1:SZ+13,c:c.steel,foot:1,top:(X,Y)=>Math.floor((Y-y0)*24/1.5)%2?c.steel:c.steelL,fi:()=>sh(c.steel,.7),fj:()=>sh(c.steel,.85)},
      {x0:x,y0,x1:x+.08,y1,z0:SZ+13,z1:SZ+24,c:c.steel,fi:(Y,z)=>slat(Y,z,.75),fj:(X,z)=>slat(X,z,.9),foot:0},
      arm(y0),arm(y0+1.37),arm(y1-.06)],null,{lv:-1}); };
  const plate=(W0,H0,s,ink,bg,rim)=>{ const a=new Array(W0*H0).fill(null), x0=Math.floor((W0-s.length*4+1)/2), y0=Math.floor((H0-5)/2);
    for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)a[y*W0+x]=x<1||x>=W0-1||y<1||y>=H0-1?rim:bg;
    [...s].forEach((ch,i)=>{ const g=LED35[ch]; if(g)for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')a[(y0+r)*W0+x0+i*4+q]=ink; });
    return (x,y)=>x>=0&&y>=0&&x<W0&&y<H0?a[y*W0+x]:null; };
  const faceX=(y0,len,zt,A,els)=>(v,z)=>A(Math.floor((ROT<2?y0+len-v:v-y0)*24),Math.floor(zt-z))||els(v,z);
  const QS={iron:[40,42,48],plate:[16,16,20],ink:[236,236,230],red:[236,44,40],lamp:[30,30,34]};
  W.litSign=(x,y,t)=>{ PNAME='lit sign'; const w=t.length*4+5, H=12, L=w/24, y0=y-L/2, A=plate(w,H,t,QS.ink,QS.plate,QS.iron);
    return prop([{x0:x-.03,y0,x1:x+.03,y1:y0+L,z0:80,z1:80+H,c:QS.plate,em:1,foot:1,fs:(nx,ny,X,Y,zr)=>nx?A(Math.floor((nx>0?y0+L-Y:Y-y0)*24),Math.floor(H-zr))||QS.plate:QS.iron,top:()=>QS.iron},
      ...[y0+.15,y0+L-.2].map(p=>({x0:x-.015,x1:x+.015,y0:p,y1:p+.05,z0:80+H,z1:UH,c:QS.iron,foot:0}))],null,{walk:true}); };
  W.signal=(x,y,n)=>{ PNAME='tunnel signal'; return prop([{x0:x-.05,y0:y-.05,x1:x+.05,y1:y+.05,z0:0,z1:44,c:QS.iron},{x0:x-.14,y0:y-.1,x1:x+.14,y1:y+.1,z0:44,z1:60,c:QS.lamp,foot:1},
      {x0:x-.08,y0:n?y+.1:y-.14,x1:x+.08,y1:n?y+.14:y-.1,z0:48,z1:56,c:QS.red,em:1,foot:1}],null,{walk:true}); };
  const Q4={steel:[132,136,142],steelD:[84,88,94],bin:[56,66,60],binD:[36,44,40],binR:[28,30,34],frame:[36,36,40],cable:[172,36,32],cableD:[120,24,22],bracket:[52,54,60],redD:[70,16,16],mach:[58,68,90],machT:[78,90,114],machD:[46,54,72],scr:[150,214,244,1],slot:[20,22,28]};
  W.mach=(x0,y0)=>{ PNAME='passport machine'; const x1=x0+.54, y1=y0+.7;
    return prop([{x0,y0,x1,y1,z0:0,z1:46,foot:1,c:Q4.mach,top:()=>Q4.machT,fj:()=>Q4.machD,fi:(v,z)=>z>26&&z<40&&v>y0+.12&&v<y1-.12?Q4.scr:z>15&&z<18&&v>y0+.2&&v<y1-.2?Q4.slot:Q4.mach}]); };
  W.bin=(x,y)=>{ PNAME='trash bin'; const x0=x-.25, y0=y-.25, side=(a,z,f)=>sh(z>26?Q4.binR:z%9<1?Q4.binD:Q4.bin,f);
    return prop([{x0,y0,x1:x0+.5,y1:y0+.5,z0:0,z1:30,c:Q4.bin,top:(u,v)=>Math.max(Math.abs(u-x),Math.abs(v-y))<.14?[12,12,14]:Q4.binR,fi:(v,z)=>side(v,z,.8),fj:(u,z)=>side(u,z,1)}]); };
  W.poster=(x,y,k)=>{ PNAME='station poster'; const Wd=29, H=28, A=W.art(Wd,H,put=>{ for(let yy=0;yy<H;yy++)for(let a=0;a<Wd;a++){ let c;
        if(k===0)c=yy<4?[232,120,60]:yy<7?[170,80,80]:yy<16?[90,40,90]:(a%5<3&&yy<22+(a*7)%5)?[24,20,34]:hash(a,yy,1)<.3?[240,220,120]:[24,20,34];
        else if(k===1){ const d=Math.hypot(a-14,yy-13); c=d<7?[200,40,40]:d<8?[120,20,20]:yy>20&&a%2?[60,60,70]:[232,224,200]; }
        else c=mod(a+yy,8)<3?[232,232,224]:yy>18&&a>18?[220,180,40]:[40,60,130];
        put(a,yy,a<2||a>=Wd-2||yy<2||yy>=H-2?Q4.frame:c); } });
    return prop([{x0:x,y0:y,x1:x+.04,y1:y+Wd/24,z0:44,z1:44+H,c:Q4.frame,foot:1,fi:faceX(y,Wd/24,44+H,A,()=>Q4.frame),fj:()=>Q4.frame,top:()=>Q4.frame}]); };
  W.namePlate=(x,y,t)=>{ PNAME='station sign'; const Wd=t.length*4+7, H=13, A=plate(Wd,H,t,QS.ink,QS.plate,QS.ink);
    return prop([{x0:x,y0:y,x1:x+.04,y1:y+Wd/24,z0:58,z1:58+H,c:QS.plate,foot:1,fi:faceX(y,Wd/24,58+H,A,()=>QS.plate),fj:()=>QS.plate,top:()=>QS.plate}]); };
  W.cables=(x,y0,y1)=>{ PNAME='cable run'; const bs=[81,86].map(z=>({x0:x,y0,x1:x+.08,y1,z0:z,z1:z+3,c:Q4.cable,foot:1,fi:()=>Q4.cableD,fj:()=>Q4.cableD,top:()=>Q4.cable}));
    for(let p=y0+.5;p<y1-.2;p+=2)bs.push({x0:x,y0:p,x1:x+.16,y1:p+.1,z0:79,z1:91,c:Q4.bracket,foot:1}); return prop(bs); };
  W.gate=(x,y,n)=>{ PNAME='no entry gate'; const L=1.4, x0=x-L/2, yy=n?y:y-.06, bar=(z0,z1)=>({x0,y0:yy,x1:x0+L,y1:yy+.06,z0,z1,c:QS.iron,foot:1}), bs=[bar(0,4),bar(36,39),bar(70,74)];
    for(let a=x0+.1;a<x0+L-.05;a+=.2)bs.push({x0:a,x1:a+.05,y0:yy,y1:yy+.06,z0:4,z1:70,c:QS.iron,foot:1});
    const Wd=37, H=11, A=plate(Wd,H,'NO ENTRY',QS.ink,QS.red,QS.ink), w=Wd/24, py=n?yy+.06:yy-.04, u0=x-w/2;
    bs.push({x0:u0,x1:x+w/2,y0:py,y1:py+.04,z0:44,z1:44+H,c:QS.red,foot:1,fs:(nx,ny,X,Y,zr)=>ny?A(Math.floor((ny>0?X-u0:u0+w-X)*24),Math.floor(H-zr))||QS.red:Q4.redD,top:()=>Q4.redD}); return prop(bs); };
  const CC={side:[104,108,118],sheen:[150,156,168],seam:[78,82,90],band:[70,80,46],bandL:[96,108,62],eave:[34,36,42],glass:[28,36,50],glassL:[92,110,138],rim:[196,202,212],
    under:[26,26,30],ribL:[116,122,134],ribD:[56,58,66],cap:[150,156,168],inside:[226,214,160],red:[240,56,40],head:[255,222,140],frame:[60,62,70]};
  const CQ=c=>c.length>3?c:c.map(v=>v&~7);
  W.carBoxes=(f,e=0)=>{
    const L=W.CARL/2, Wd=W.CARW, DR=W.LDR, DW=.62, open=f/4*.56, EAVE=78, CREST=96;
    const side=(a,z,plat)=>{ for(const m of DR){ const d=Math.abs(a-m);
        if(d<DW&&z>=32&&z<76){ if(plat&&d<open)return CC.inside; const dd=(d-open)*24, lw=(DW-open)*24; if(dd<.7||dd>lw-.7||z>75)return CC.frame;
          return z>=50&&z<70&&dd>2.4&&dd<lw-2.4?((dd+z)%11<2?CC.glassL:CC.glass):CC.side; } }
      if(z<34)return CC.under; if(z>=EAVE-1)return CC.eave; if(z>=36&&z<42)return z>=40?CC.bandL:CC.band;
      for(let k=0;k<DR.length+1;k++){ const a0=(k?DR[k-1]+DW:-L)+.55, a1=(k<DR.length?DR[k]-DW:L)-.55; if(a1-a0<.8||a<a0||a>a1||z<50||z>=70)continue;
        const e2=Math.min(a-a0,a1-a)*24, ez=Math.min(z-50,69.9-z); if(e2<2.5&&ez<2.5&&Math.hypot(2.5-e2,2.5-ez)>2.5)continue;
        return e2<.9||ez<.9?CC.rim:((a*24+z)%13<2?CC.glassL:CC.glass); }
      if(Math.abs(((a+L)%2.86+2.86)%2.86)<.05)return CC.seam; return z>=70?CC.sheen:CC.side; };
    const end=(b,z,nose)=>{ const p=Math.abs(b)*24; if(z<34)return CC.under; if(p>Wd*24-1.2)return CC.rim;
      if(p<6&&z>=32&&z<76)return z>=52&&z<70&&p<4.5?CC.glass:CC.frame;
      if(z>=52&&z<70&&p>8&&p<Wd*24-4)return Math.abs(p-(8+Wd*24-4)/2)<.7?CC.rim:CC.glass;
      if(Math.hypot(p-Wd*24+8,z-48)<2.2)return [...CC.red,1]; if(nose&&Math.hypot(p-Wd*24+8,z-40)<2.2)return [...CC.head,1]; return CC.side; };
    const box=(x0,x1,y0,y1,z0,z1,c,o={})=>sided({x0,x1,y0,y1,z0,z1,c,top:o.top||(()=>c),fs:(nx,ny,X,Y,zr)=>{ const z=zr+z0, v=(nx?o.side&&o.side(Y,z,e?nx>0:nx<0):o.end&&o.end(X,z,ny<0))||c; return CQ(v.length>3?v:sh(v,nx?.74:.88)); }});
    const out=[];
    for(const m of [-7.8,7.8])out.push(box(-Wd+.4,Wd-.4,m-1.6,m+1.6,0,12,CC.under,{side:(a,z)=>[m-1.2,m+1.2].some(c=>Math.hypot((a-c)*24,z-6)<5.5)?[44,44,50]:CC.under}));
    out.push(box(-1.45,1.45,-L+.6,L-.6,7,34,CC.under,{side:(a,z)=>hash(Math.floor(a*2),Math.floor(z/8),161)<.3?[40,40,46]:CC.under}));
    out.push(box(-Wd,Wd,-L,L,30,EAVE,CC.side,{side,end}));
    for(let z=EAVE;z<CREST;z+=3){ const t=(z+1.5-EAVE)/(CREST-EAVE), w=Wd*Math.sqrt(Math.max(.02,1-t*t)), r=.3+.35*t;
      out.push(box(-w,w,-L+r,L-r,z,Math.min(CREST,z+3),CC.ribL,{side:()=>CC.ribD,end:()=>CC.cap,top:(X,Y)=>{ const e2=Math.min(Y+L,L-Y); return e2<1.4?(e2<.7?CC.rim:CC.cap):Math.floor((X+Wd)*24/4.8)%2?CC.ribL:CC.ribD; }})); }
    return out; };
  return W; })();

  const W=WSUB, {AVE,PLAT,TW,SY0,SY1,TUN0,TUN1}=W, T=.25, OY=W.D1Y, SZ=-UH, SM=MAPSTAIR, HW=(SM.x1-SM.x0)/2, A0=OY-HW, A1=OY+HW, TE=36, H2=2*UH;
  const XC=((SM.x0+SM.x1)/2-72)*TILE, ZB=(SM.y0+77)*TILE, Y=z=>(z-SZ)*ZU+STN.DY, V=(x,y,z)=>[XC+(y-OY)*TILE,Y(z),ZB-(x-AVE)*TILE];
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
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P-ox,Q-oy,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q-oy,z-SZ):ny&&b.fj?b.fj(P-ox,z-SZ):b.c);
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; bq(V(x,nx<0?y1:y0,z0),V(x,nx<0?y0:y1,z0),V(x,nx<0?y0:y1,z1),V(x,nx<0?y1:y0,z1),
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),lit,true,chara); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; bq(V(ny<0?x0:x1,y,z0),V(ny<0?x1:x0,y,z0),V(ny<0?x1:x0,y,z1),V(ny<0?x0:x1,y,z1),
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),lit,true,chara); }
    bq(V(x0,y1,z1),V(x1,y1,z1),V(x1,y0,z1),V(x0,y0,z1),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24-ox,y0+(j+.5)/24-oy):b.c)),lit,true,chara); }
  const put=(p,name,dz=-UH)=>{ BATCH.tag=OBJ('station',name); p.boxes.forEach(b=>gbox(b,dz)); BATCH.tag=null; };
  const floor=(x0,y0,x1,y1,z,col)=>quad(V(x0,y1,z+SZ),V(x1,y1,z+SZ),V(x1,y0,z+SZ),V(x0,y0,z+SZ),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))),true,false);
  const PB=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), cutaway=(me,nx,nz,foot,pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6))=>{ me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx:nz,nz:-nx,foot:Y(foot+SZ),me}); return me; };
  const wallY=(x,y0,y1,z0,z1,paint)=>quad(V(x,y0,z0+SZ),V(x,y1,z0+SZ),V(x,y1,z1+SZ),V(x,y0,z1+SZ),faceTex((y1-y0)*24,z1-z0,(i,j)=>C(paint(y0+(i+.5)/24,z1-j-.5))),true);
  const wallX=(y,x0,x1,z0,z1,paint)=>quad(V(x0,y,z0+SZ),V(x1,y,z0+SZ),V(x1,y,z1+SZ),V(x0,y,z1+SZ),faceTex((x1-x0)*24,z1-z0,(i,j)=>C(paint(x0+(i+.5)/24,z1-j-.5))),true);
  const solid=(x0,y0,x1,y1,zt)=>{ const a=V(x0,y0,0), b=V(x1,y1,0), q=[Math.min(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[0],b[0]),Math.max(a[2],b[2])]; solids.push(q); fixed.push([q[0],q[1],0,q[2],q[3],Math.max(.05,zt*ZU)]); };
  const stile=W.wallPaint('stile'), tubeP=W.wallPaint('tubeP'), dark=()=>[14,14,16];
  floor(AVE,SY0,PLAT,SY1,0,W.platformCol);
  wallY(PLAT,SY0,SY1,-32,0,(u,z)=>W.platEdge(u,z));
  floor(PLAT,SY0-TE,TW,SY1+TE,-32,W.tracksCol);
  for(const [a,b] of [[SY0,A0],[A1,SY1]])cutaway(wallY(AVE,a,b,0,H2,(u,z)=>stile(1,0,AVE,u,z)),1,0,8,PB); cutaway(wallY(AVE,A0,A1,UH,H2,(u,z)=>stile(1,0,AVE,u,z)),1,0,8,PB);
  cutaway(wallY(TW,SY0,SY1,-32,H2,(u,z)=>tubeP(-1,0,TW,u,z)),-1,0,-24);
  const c0=(TUN0+TUN1)/2, half=(TUN1-TUN0)/2, inArch=(u,z)=>{ const d=Math.abs(u-c0)/half; return d<1&&z+32<40+88*Math.sqrt(1-d*d); };
  for(const y of [SY0,SY1]){ const n=y===SY0?1:-1; cutaway(wallX(y,AVE,PLAT,0,H2,(u,z)=>stile(0,n,u,y,z)),0,n,8); cutaway(wallX(y,PLAT,TW+2*T,-32,H2,(u,z)=>inArch(u,z)?null:stile(0,n,u,y,z)),0,n,-24); }
  const tun=(u,z)=>sh(concreteCol(u,z/24),.34);
  for(const [a,b] of [[SY0-TE,SY0],[SY1,SY1+TE]])for(const x of [TUN0,TUN1])cutaway(wallY(x,a,b,-32,96,tun),x===TUN0?1:-1,0,-24);
  for(const y of [SY0-TE,SY1+TE])cutaway(wallX(y,TUN0,TUN1,-32,96,dark),0,y<SY0?1:-1,-24);
  for(const [a,b] of W.TSTEPS)for(let k=0;k<3;k++){ const c=[150,146,138]; gbox({x0:PLAT+k*.25,x1:PLAT+(k+1)*.25,y0:a,y1:b,z0:-UH-32,z1:-UH-8*(k+1),c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)}); }
  const CX=TW-8.03, BX=TW-8.05;
  for(const r of [-7.75,7.05]){ const cl=W.column(CX,OY+r); cl.boxes[0]={...cl.boxes[0],z1:cl.boxes[0].z1+UH}; put(cl,'column',0); solid(CX,OY+r,CX+.7,OY+r+.7,H2); }
  for(const r of [-11.2,-6.5,4,8.4]){ put(W.bench(BX,OY+r),'bench',0); solid(BX,OY+r,BX+.66,OY+r+2.8,24); }
  const MX=AVE+.08, MY=OY+2.5; put(W.mach(MX,MY),'passport machine'); solid(AVE,MY,MX+.54,MY+.7,46);
  for(const r of [-12,12]){ put(W.bin(BX+.3,OY+r),'trash bin'); solid(BX+.05,OY+r-.25,BX+.55,OY+r+.25,30); }
  put(W.litSign(AVE+1.6,OY,'TO STREET ^'),'sign');
  put(W.gate(AVE+3,SY0,1),'no entry gate'); put(W.gate(AVE+3,SY1,0),'no entry gate');
  put(W.signal(TUN0+.35,SY0-1.4,1),'signal',-UH-32); put(W.signal(TUN0+.35,SY1+1.4,0),'signal',-UH-32);
  BATCH.tag=OBJ('station','train car'); W.carBoxes(0,0).map(b=>({...b,z0:b.z0*1.5,z1:b.z1*1.5,fs:(nx,ny,P,Q,z,f)=>b.fs(nx,ny,P,Q,z/1.5,f)})).forEach(b=>gbox(b,-UH-32,W.TRACKS[0],OY,true)); BATCH.tag=null; solid(W.TRACKS[0]-W.CARW,OY-W.CARL/2,W.TRACKS[0]+W.CARW,OY+W.CARL/2,144-32);
  for(let y=SY0+3.2;y<SY1;y+=6.4)for(const x of [AVE+2.6,AVE+8.4]){ const L=new THREE.PointLight(new THREE.Color(.5,.54,.64),LAMPI*1.3,14*TILE,LAMPD); L.position.set(...V(x,y,SZ+H2-14)); scene.add(L); lamps.push(L); }
  { const lid=(x0,y0,x1,y1,z,c)=>{ const g=new THREE.BufferGeometry(), p=[V(x0,y0,z+SZ),V(x1,y0,z+SZ),V(x1,y1,z+SZ),V(x0,y1,z+SZ)]; g.setAttribute('position',new THREE.Float32BufferAttribute([...p[0],...p[1],...p[2],...p[0],...p[2],...p[3]],3)); g.computeVertexNormals();
      if(g.attributes.normal.getY(0)>0){ g.index=null; const a=g.attributes.position.array; for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++){ const t=a[i+3+k]; a[i+3+k]=a[i+6+k]; a[i+6+k]=t; } g.computeVertexNormals(); }
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,clippingPlanes:[new THREE.Plane(new THREE.Vector3(0,-1,0),1e6)]})); me.receiveShadow=true; scene.add(me); return me; };
    lid(AVE,SY0,TW,SY1,H2,0x8a8e96); lid(TUN0,SY0-TE,TUN1,SY0,96,0x141416); lid(TUN0,SY1,TUN1,SY1+TE,96,0x141416); lid(AVE-(SM.y1-SM.y0)-1,A0,AVE,A1,UH-.5,0x000000); }
  solid(AVE-1,SY0-1,AVE,A0,UH); solid(AVE-1,A1,AVE,SY1+1,UH); solid(AVE,SY0-1,PLAT,SY0,UH); solid(AVE,SY1,PLAT,SY1+1,UH);
  solid(TW,SY0-TE,TW+1,SY1+TE,UH); solid(TUN0-1,SY0-TE,TUN0,SY0,UH); solid(TUN0-1,SY1,TUN0,SY1+TE,UH); solid(TUN0,SY0-TE-1,TUN1,SY0-TE,UH); solid(TUN0,SY1+TE,TUN1,SY1+TE+1,UH);
  { let y=SY0; for(const [a,b] of W.TSTEPS){ if(a>y)solid(PLAT-.05,y,PLAT+.05,a,0); y=b; } if(y<SY1)solid(PLAT-.05,y,PLAT+.05,SY1,0); }
  { const a=V(TW+.5,SY0-TE,0), b=V(AVE,SY1+TE,0); BOUND={x0:a[0],x1:b[0],z0:a[2],z1:(SM.y1+77)*TILE+.5}; }
  BATCH.build((k,map,emap)=>k==='C'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  for(const [r,k] of [[-10.3,0],[-5,1],[5.2,2],[10,0]])put(W.poster(AVE+.01,OY+r,k),'poster');
  for(const r of [-8,7.7])put(W.namePlate(AVE+.01,OY+r,'MARKET ST'),'name plate');
  for(const [a,b] of [[SY0+.2,A0-.3],[A1+.3,SY1-.2]])put(W.cables(AVE+.01,a,b),'cables');
  BATCH.build((k,map)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[PB]})); for(const me of BATCH.all(BATCH.meshes,'L'))cutWalls.push({pl:PB,nx:0,nz:-1,foot:Y(SZ+8),me});
  const TX=z=>AVE+(ZB-z)/TILE, TY=x=>OY+(x-XC)/TILE, at=(x,y)=>{ const p=V(x,y,0); return {x:p[0],z:p[2]}; }, box=(x0,y0,x1,y1)=>{ const a=at(x0,y0), b=at(x1,y1); return {x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)}; };
  const M=window.METRO=SHARED.METRO={V,Y,TX,TY,at,DY:Y(SZ),OY,A0,A1,AVE,PLAT,XC,ZB,MACH:{x:MX+.27,y:MY+.35}};
  M.inside=(x,z)=>x>BOUND.x0&&x<BOUND.x1&&z>BOUND.z0&&z<ZB+.01;
  M.ground=(x,z)=>{ const tx=TX(z); return Y(SZ+(tx<PLAT?0:W.fzAt(tx,TY(x)))); };
  M.plat=at(AVE+4.2,OY-8.5); M.foot=at(AVE+1.1,OY); M.street={x:XC,z:(SM.y1+77)*TILE+1.4*TILE};
  M.lane=box(AVE+.6,SY0+.6,PLAT-.2,SY1-.6); M.edge=box(PLAT-.7,SY0+.6,PLAT-.15,SY1-.6);
  M.rats=[[M.lane,AVE+4.6,OY-9.6],[M.lane,AVE+3.6,OY+10.6],[M.edge,PLAT-.4,OY-4.6]].map(([lane,x,y])=>({lane,...at(x,y)}));
  M.path=[[SM.y1-.3,0],[SM.y0+.3,1]].map(([y,d])=>d?{x:XC,z:(y+77)*TILE,lv:'down'}:{x:XC,z:(y+77)*TILE}).concat([at(AVE+1.2,OY),at(AVE+4,OY-4),M.plat].map(p=>({...p,lv:'down'})));
// THE STATION'S END AND THE BODEGA'S START: closes grab('down') (the platform under the street) and sets up BOD, the bodega's bag of makers.
  M.exit=()=>{ const S=SM, X=x=>(x-72)*TILE, Z=y=>(y+77)*TILE, n=S.steps, rise=S.depth/n, run=(S.y1-S.y0)/n, c3=new THREE.Color(), TR=[[],[]], WL=[[],[]];
    const q4=(B,a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ B[0].push(...v); B[1].push(c3.r,c3.g,c3.b); } };
    const bx=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[z0*ZU,z1*ZU], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
      q4(WL,[a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); q4(WL,[a,e,d],[b,e,d],[b,f,d],[a,f,d],col); q4(WL,[b,e,c],[a,e,c],[a,f,c],[b,f,c],col); q4(WL,[a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); q4(WL,[b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const CON=[132,128,120], CON2=[118,114,108], TL=[186,190,197], RAIL=[52,84,62];
    for(let k=0;k<n;k++){ const yA=S.y1-(k+1)*run, yB=S.y1-k*run, zt=-(k+1)*rise*ZU, zr=-k*rise*ZU, a=X(S.x0), b=X(S.x1);
      q4(TR,[a,zt,Z(yB)],[b,zt,Z(yB)],[b,zt,Z(yA)],[a,zt,Z(yA)],(k&1)?CON:CON2); q4(TR,[a,zt,Z(yB)],[b,zt,Z(yB)],[b,zr,Z(yB)],[a,zr,Z(yB)],CON2.map(v=>v*.82));
      q4(TR,[a,zt,Z(yB-.03)],[b,zt,Z(yB-.03)],[b,zt+1.2*ZU,Z(yB-.03)],[a,zt+1.2*ZU,Z(yB-.03)],[196,170,64]); }
    for(const x of [S.x0-.2,S.x1]){ for(let k=0;k<n;k++)bx(x,S.y1-(k+1)*run,-(k+1)*rise-2,x+.2,S.y1-k*run,0,TL); bx(x+.05,S.y0,27,x+.15,S.y1,30,RAIL); bx(x+.07,S.y0,14,x+.13,S.y1,16,RAIL); for(let y=S.y0;y<S.y1;y+=(S.y1-S.y0)/5)bx(x+.06,y,0,x+.14,y+.08,27,RAIL); bx(x+.06,S.y1-.08,0,x+.14,S.y1,27,RAIL); }
    bx(S.x0-.15,S.y0-.15,27,S.x1+.15,S.y0-.05,30,RAIL); bx(S.x0-.15,S.y0-.13,14,S.x1+.15,S.y0-.07,16,RAIL); for(let x=S.x0+1;x<S.x1;x+=1)bx(x-.04,S.y0-.14,0,x+.04,S.y0-.06,27,RAIL);
    MODS.stairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); const SW=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    const mk=(B,pl)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(B[0],3)); g.setAttribute('color',new THREE.Float32BufferAttribute(B[1],3)); g.computeVertexNormals();
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:pl})); me.receiveShadow=me.castShadow=true; scene.add(me); return me; };
    mk(TR,[MODS.stairCut]); cutWalls.push({pl:SW,nx:0,nz:0,foot:Y(SZ+8),me:mk(WL,[MODS.stairCut,SW]),get always(){ return SHARED.LVL==='down'&&MODS.inStair(pos.x,pos.z)==null; }});
    for(const [y,z,c,i] of [[S.y1-.3,60,[1,.92,.78],5],[S.y0+.6,-40,[.5,.54,.64],6]]){ const L=new THREE.PointLight(new THREE.Color(...c),i,7*TILE,1.6); L.position.set(XC,z*ZU,Z(y)); L.userData.i0=i; scene.add(L); lamps.push(L); }
    const sol=(lv,x0,y0,x1,y1,h)=>{ SOL[lv].push([X(x0),Z(y0),X(x1),Z(y1)]); FIX[lv].push([X(x0),Z(y0),0,X(x1),Z(y1),h]); };
    for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1])sol(lv,x,S.y0,x+.2,S.y1,30*ZU);
    sol('up',S.x0-.2,S.y0-.2,S.x1+.2,S.y0,30*ZU); };
  { const run=(SM.y1-SM.y0)/SM.steps, tread=(x,z)=>{ const gx=x/TILE+72, gy=z/TILE-77; return gx>=SM.x0&&gx<SM.x1&&gy>=SM.y0&&gy<SM.y1?Math.min(SM.steps,Math.floor((SM.y1-gy)/run)+1):null; };
    const lid=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x000000,fog:false}));
    lid.scale.set((SM.x1-SM.x0)*TILE,1,(SM.y1-SM.y0)*TILE); lid.position.set(XC,-6*SM.depth/SM.steps*ZU+.012,(SM.y0+SM.y1)/2*TILE+77*TILE); M.lid=lid;
    const el=document.createElement('div'); el.id='subfade';
    el.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .32s steps(4);z-index:60;display:flex;align-items:center;justify-content:center;color:#d8d2c4;font:14px/1 monospace;letter-spacing:3px';
    document.body.appendChild(el);
    FADE.el=el; FADE.run=async(text,work,o={})=>{ const tr=el.style.transition, w=ms=>new Promise(r=>setTimeout(r,ms)), fr=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
      const live=window.__started&&!o.silent, was=el.style.opacity==='1'; FADE.busy=(FADE.busy||0)+1;
      if(live){ el.textContent=text||''; el.style.pointerEvents='auto'; el.style.transition=o.cut?'none':'opacity .3s steps(4)'; el.style.opacity='1'; if(!o.cut&&!was)await w(320); }
      if(keys.clear)keys.clear(); try{ SHARED.target=null; }catch(e){}
      try{ if(o.cut)await fr(2); if(work)await work(); }catch(e){ console.warn('FADE: '+(text||'')+' did not finish',e); }
      if(live){ await fr(o.cut?2:3); if(o.hold)await w(o.hold); if(FADE.busy===1){ el.style.transition=o.cut?'none':'opacity .4s steps(5)'; el.style.opacity='0'; el.style.pointerEvents='none'; if(!o.cut)await w(420); el.style.transition=tr; } }
      FADE.busy--; };
    const qy=QS.get('subyaw'); M.YAW=-Math.PI/4+(qy!=null?+qy:0)*Math.PI/2;
    let busy=false, lidT=0; const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
    const go=async dir=>{ '@later'; busy=true; await FADE.run(dir==='in'?'ENTERING SUBWAY':'LEAVING SUBWAY',()=>{
      const p=dir==='in'?M.foot:M.street; UI.goTo(p.x,p.z,dir==='in'?'down':'up');
      if(UI.view==='iso'||UI.view==='map'){ if(dir==='in'){ SHARED.yaw=SHARED.yawTo=M.YAW; } else if(UI.isoTo){ UI.isoTo(); SHARED.yaw=SHARED.yawTo; } } },{hold:120}); busy=false; };
    M.door=(py,p)=>{ lid.visible=SHARED.LVL==='up'; if(!lidT++){ const top=MAPG.bodega; if(top)top.add(lid); } if(busy||UI.freeCam||(RAG.on))return; const k=tread(p.x,p.z);
      if(SHARED.LVL!=='down'&&k!=null&&k>=3)go('in'); else if(SHARED.LVL==='down'&&k!=null&&k<=SM.steps-5)go('out'); };
    M.doorBusy=()=>busy; window.SUBGO=(x,z,lv)=>UI.goTo(x,z,lv); }
  { const G=new THREE.Group(), lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c}), R=.2, H=46*ZU, S0=Y(SZ)+H+R+.02, SAY='THANK YOU FOR YOUR COOPERATION.';
    const BODY=lam(0xb8bec8), RIM=lam(0x3a3e48), DK=lam(0x2a2d34), LENS=flat(0x4dff86), TALK=flat(0x9be8ff), BEAM=new THREE.MeshBasicMaterial({color:0x5dff8e,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.35,16).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x5dff8e,side:THREE.DoubleSide})), CG=new THREE.ConeGeometry(1,1,12,1,true).translate(0,-.5,0).rotateX(-Math.PI/2);
    ring.visible=false; G.add(ring); scene.add(G);
    const D=[-.2,.2].map((o,i)=>{ const g=new THREE.Group(), body=new THREE.Mesh(new THREE.IcosahedronGeometry(R,1),BODY), band=new THREE.Mesh(new THREE.CylinderGeometry(R*1.02,R*1.02,R*.22,10),RIM), lens=new THREE.Mesh(new THREE.BoxGeometry(R*.5,R*.3,R*.2),LENS);
      lens.position.set(0,-R*.15,R*.92); const rot=new THREE.Group(), mast=new THREE.Mesh(new THREE.BoxGeometry(R*.12,R*.5,R*.12),DK), blade=new THREE.Mesh(new THREE.BoxGeometry(R*2.2,R*.06,R*.16),DK);
      mast.position.y=R*1.1; blade.position.y=R*1.35; rot.add(blade); g.add(body,band,lens,mast,rot); const home=new THREE.Vector3(...V(M.MACH.x,M.MACH.y+o,0)).setY(S0); g.position.copy(home); const cone=new THREE.Mesh(CG,BEAM); cone.visible=false; G.add(g,cone);
      return {i,g,lens,rot,cone,home,st:'perch',t:0,N:{g,st:{x:home.x,z:home.z},lv:'down',H:R*2,key:'security drone '+i}}; });
    const mach=new THREE.Vector3(...V(M.MACH.x,M.MACH.y,0)), tv=new THREE.Vector3(); let seen=false;
    const home=()=>{ for(const d of D){ d.st='perch'; d.t=0; d.g.position.copy(d.home); d.g.rotation.set(0,0,0); d.lens.material=LENS; d.cone.visible=false; } ring.visible=false; };
    M.drones=D; M.tick=(dt,you)=>{ if(!MAPG.down.visible||SHARED.LVL!=='down'){ if(SHARED.LVL!=='down'){ seen=false; if(D.some(d=>d.st!=='perch'))home(); } return; }
      if(!seen&&M.inside(you.x,you.z)&&Math.hypot(you.x-mach.x,you.z-mach.z)<4*TILE&&Math.abs(SHARED.py-M.DY)<.3){ seen=true; for(const d of D){ d.st='wait'; d.t=-d.i*.7; } SFX.play('chirp',{at:{x:mach.x,z:mach.z}}); }
      if(D.every(d=>d.st==='perch'))return;
      const rx=Math.cos(SHARED.yaw), rz=-Math.sin(SHARED.yaw); let scan=null;
      for(const d of D){ d.t+=dt; const p=d.g.position, sd=d.i?-.62:.62, out=d.st==='go'||d.st==='scan'||d.st==='say';
        if(d.st==='wait'&&d.t>1){ d.st='go'; d.t=0; }
        if(d.st==='wait')continue;
        if(out)tv.set(you.x+rx*sd,SHARED.py+1.85+.35,you.z+rz*sd); else tv.copy(d.home);
        const dx=tv.x-p.x, dz=tv.z-p.z, l=Math.hypot(dx,dz), s=Math.min(l,1.8*dt*(d.st==='go'||d.st==='home'?1:2)); if(l>1e-6){ p.x+=dx/l*s; p.z+=dz/l*s; } p.y+=(tv.y-p.y)*Math.min(1,dt*2);
        if(d.st!=='home')p.y+=Math.sin(d.t*3)*.004; d.rot.rotation.y+=dt*40; d.g.rotation.y=Math.atan2(you.x-p.x,you.z-p.z);
        if(d.st==='go'&&l<.12){ d.st='scan'; d.t=0; if(!d.i&&typeof SFX!=='undefined')SFX.play('scan',{at:{x:p.x,z:p.z}}); }
        else if(d.st==='scan'&&d.t>6){ d.st=d.i?'home':'say'; d.t=0; if(!d.i){ d.lens.material=TALK; LINES.say(d.N,SAY); } }
        else if(d.st==='say'&&d.t>3){ d.st='home'; d.t=0; d.lens.material=LENS; }
        else if(d.st==='home'&&l<.05&&Math.abs(tv.y-p.y)<.04){ d.st='perch'; p.copy(d.home); d.g.rotation.set(0,0,0); }
        d.N.st.x=p.x; d.N.st.z=p.z; d.cone.visible=d.st==='scan'; if(d.cone.visible&&(!scan||d.t>scan.t))scan=d; }
      ring.visible=!!scan; if(scan){ const h=(1-Math.abs(((scan.t/3)%1)*2-1))*1.85; ring.position.set(you.x,SHARED.py+h+.02,you.z);
        for(const d of D)if(d.cone.visible){ const a=d.g.position; d.cone.position.copy(a); d.cone.lookAt(ring.position); d.cone.scale.set(.32,.32,a.distanceTo(ring.position)); } } };
    M.droneScan=()=>{ seen=false; }; }
}
MODS.station={BOUND,ground:(x,z)=>SHARED.METRO.inside(x,z)?SHARED.METRO.ground(x,z):STN.DY,DY:SHARED.METRO.DY,plat:SHARED.METRO.plat,lane:SHARED.METRO.lane,path:SHARED.METRO.path};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>SHARED.LVL==='down'; for(const L of SHL)L.removeFromParent(); });
SHARED.BOD={meshes:[], walls:{}, lamps:[]};
export {WATER};
