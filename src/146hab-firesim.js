// THE FIRE SIM: FIRESIM is real fire as a fluid on the GPU: a 64x32x64 grid (12.5 cm cells, 8 x 4 x 8 m) that follows the fire it is given, stepping velocity, heat, fuel and smoke (fuel burns into heat and soot, heat rises, the swirl is kept, the air is made incompressible), drawn as one glowing volume in slices facing the camera so walls and people hide it.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {TILE} from './006-map-pre.js';
{ const NX=64, NY=32, NZ=64, TX=8, AW=NX*TX, AH=NZ*(NY/TX), HM=.125, M=TILE/.84, H=HM*M, NE=24, V3=THREE.Vector3;
  const FS={on:false,idle:9,O:new V3(),ci:[0,0,0]}; window.FIRESIM=FS;
  const HEAD=`precision highp float; precision highp sampler2D; out vec4 fragOut;
const float NX=${NX}., NY=${NY}., NZ=${NZ}., TX=${TX}.; const vec2 AT=vec2(${AW}.,${AH}.);
ivec2 at(ivec3 c){ return ivec2((c.y%${TX})*${NX}+c.x,(c.y/${TX})*${NZ}+c.z); }
vec4 F(sampler2D t,ivec3 c){ c=clamp(c,ivec3(0),ivec3(${NX-1},${NY-1},${NZ-1})); return texelFetch(t,at(c),0); }
vec2 uvOf(vec2 xz,float s){ return (vec2(mod(s,TX),floor(s/TX))*vec2(NX,NZ)+xz)/AT; }
vec4 S(sampler2D t,vec3 c){ c=clamp(c,vec3(.5),vec3(NX-.5,NY-.5,NZ-.5)); float y=c.y-.5, y0=floor(y), f=y-y0, y1=min(y0+1.,NY-1.); return mix(texture(t,uvOf(c.xz,y0)),texture(t,uvOf(c.xz,y1)),f); }
ivec3 cellI(){ ivec2 p=ivec2(gl_FragCoord.xy); return ivec3(p.x%${NX},p.x/${NX}+(p.y/${NZ})*${TX},p.y%${NZ}); }
`;
  const VS='void main(){ gl_Position=vec4(position.xy*2.,0.,1.); }';
  const U={uV:{value:null},uD:{value:null},uC:{value:null},uP:{value:null},uDiv:{value:null},uDt:{value:1/30},uShift:{value:new V3()},uE:{value:[...Array(NE)].map(()=>new THREE.Vector4())},uEV:{value:[...Array(NE)].map(()=>new THREE.Vector4())},uN:{value:0}};
  const pass=fs=>new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:HEAD+fs,glslVersion:THREE.GLSL3,depthTest:false,depthWrite:false});
  // the swirl (curl), to keep the small eddies the grid would smooth away
  const mCurl=pass(`uniform sampler2D uV; void main(){ ivec3 c=cellI(); vec3 L=F(uV,c-ivec3(1,0,0)).xyz, R=F(uV,c+ivec3(1,0,0)).xyz, D=F(uV,c-ivec3(0,1,0)).xyz, Up=F(uV,c+ivec3(0,1,0)).xyz, B=F(uV,c-ivec3(0,0,1)).xyz, Fw=F(uV,c+ivec3(0,0,1)).xyz;
  vec3 w=.5*vec3((Up.z-D.z)-(Fw.y-B.y),(Fw.x-B.x)-(R.z-L.z),(R.y-L.y)-(Up.x-D.x)); fragOut=vec4(w,length(w)); }`);
  // velocity (xyz, cells a second) and heat (w): carried by the flow; fuel burning heats it; hot air rises, smoke sinks; the swirl kept; the jets of fuel push it
  const EMIT=`for(int i=0;i<${NE};i++){ if(i>=uN)break; vec3 e=uE[i].xyz; float rr=uE[i].w, dd=length(p-e); if(dd<rr){ float k=1.-dd/rr;`;
  const mVel=pass(`uniform sampler2D uV,uD,uC; uniform float uDt; uniform vec3 uShift; uniform vec4 uE[${NE}], uEV[${NE}]; uniform int uN;
void main(){ ivec3 c=cellI(); vec3 p=vec3(c)+.5; vec4 v0=F(uV,c); vec3 q=p+uShift-v0.xyz*uDt; vec4 v=S(uV,q), d=S(uD,q);
  float burn=min(d.r,7.*uDt), T=v.w+burn*.9; T-=uDt*T*(.55+.35*T); T=max(T,0.); vec3 vel=v.xyz;
  vel.y+=(42.*T-3.*d.g)*uDt;
  float l=F(uC,c-ivec3(1,0,0)).w, r=F(uC,c+ivec3(1,0,0)).w, dn=F(uC,c-ivec3(0,1,0)).w, up=F(uC,c+ivec3(0,1,0)).w, b=F(uC,c-ivec3(0,0,1)).w, f=F(uC,c+ivec3(0,0,1)).w;
  vec3 g=vec3(r-l,up-dn,f-b); float gl=length(g); if(gl>1e-5)vel+=7.*cross(g/gl,F(uC,c).xyz)*uDt;
  ${EMIT} vel=mix(vel,uEV[i].xyz,clamp(k*1.6,0.,1.)); T=max(T,.35*k); } }
  vel*=1.-.25*uDt; if(c.y==0)vel.y=max(vel.y,0.); if(c.x==0||c.x==${NX-1}||c.z==0||c.z==${NZ-1}||c.y==${NY-1})vel*=.6;
  fragOut=vec4(vel,T); }`);
  // fuel (r), soot (g) and how fast it burns here (b): carried by the new flow; fuel burns to soot; the jets lay fuel
  const mDen=pass(`uniform sampler2D uV,uD; uniform float uDt; uniform vec3 uShift; uniform vec4 uE[${NE}], uEV[${NE}]; uniform int uN;
void main(){ ivec3 c=cellI(); vec3 p=vec3(c)+.5; vec4 v=F(uV,c); vec3 q=p+uShift-v.xyz*uDt; vec4 d=S(uD,q);
  float burn=min(d.r,7.*uDt); d.r-=burn; d.g+=burn*.22; d.g*=1.-.7*uDt; d.b=mix(d.b,burn/max(uDt,1e-4),.6);
  ${EMIT} d.r+=uEV[i].w*k*uDt; } } d.r=min(d.r,3.); fragOut=d; }`);
  // incompressible air: the divergence, the pressure that cancels it (Jacobi), its gradient taken off
  const mDiv=pass(`uniform sampler2D uV; void main(){ ivec3 c=cellI(); float d=.5*((F(uV,c+ivec3(1,0,0)).x-F(uV,c-ivec3(1,0,0)).x)+(F(uV,c+ivec3(0,1,0)).y-F(uV,c-ivec3(0,1,0)).y)+(F(uV,c+ivec3(0,0,1)).z-F(uV,c-ivec3(0,0,1)).z)); fragOut=vec4(d,0.,0.,1.); }`);
  const mJac=pass(`uniform sampler2D uP,uDiv; void main(){ ivec3 c=cellI(); float s=F(uP,c+ivec3(1,0,0)).x+F(uP,c-ivec3(1,0,0)).x+F(uP,c+ivec3(0,1,0)).x+F(uP,c-ivec3(0,1,0)).x+F(uP,c+ivec3(0,0,1)).x+F(uP,c-ivec3(0,0,1)).x; fragOut=vec4((s-F(uDiv,c).x)/6.,0.,0.,1.); }`);
  const mGrad=pass(`uniform sampler2D uV,uP; void main(){ ivec3 c=cellI(); vec4 v=F(uV,c); v.xyz-=.5*vec3(F(uP,c+ivec3(1,0,0)).x-F(uP,c-ivec3(1,0,0)).x,F(uP,c+ivec3(0,1,0)).x-F(uP,c-ivec3(0,1,0)).x,F(uP,c+ivec3(0,0,1)).x-F(uP,c-ivec3(0,0,1)).x); fragOut=v; }`);
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(1,1)), sc=new THREE.Scene(), cam=new THREE.Camera(); quad.frustumCulled=false; sc.add(quad);
  let RT=null; const rt=()=>new THREE.WebGLRenderTarget(AW,AH,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false});
  const make=()=>{ '@later'; RT={V:[rt(),rt()],D:[rt(),rt()],P:[rt(),rt()],C:rt(),Div:rt()}; const r0=renderer.getRenderTarget(); for(const k in RT)for(const t of [].concat(RT[k])){ renderer.setRenderTarget(t); renderer.clear(true,false,false); } renderer.setRenderTarget(r0); };
  const run=(m,to)=>{ quad.material=m; renderer.setRenderTarget(to); renderer.render(sc,cam); };
  const sw=a=>{ const t=a[0]; a[0]=a[1]; a[1]=t; };

  /* ---------- drawn: slices facing the camera through the box, back to front, each lit by the heat and dimmed by the soot it holds ---------- */
  const NS=72, RU={uV:{value:null},uD:{value:null},uO:{value:FS.O},uH:{value:H}};
  const rMat=new THREE.ShaderMaterial({uniforms:RU,glslVersion:THREE.GLSL3,transparent:true,depthWrite:false,depthTest:true,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,toneMapped:false,side:THREE.DoubleSide,
    vertexShader:'out vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:HEAD+`uniform sampler2D uV,uD; uniform vec3 uO; uniform float uH; in vec3 vW;
vec3 ramp(float h){ vec3 c=mix(vec3(.42,.035,.01),vec3(1.,.26,.03),smoothstep(.02,.32,h)); c=mix(c,vec3(1.,.62,.12),smoothstep(.28,.6,h)); return mix(c,vec3(1.,.93,.66),smoothstep(.62,.92,h)); }
void main(){ vec3 c=(vW-uO)/uH; if(any(lessThan(c,vec3(0.)))||any(greaterThan(c,vec3(NX,NY,NZ))))discard; float T=S(uV,c).w; vec4 d=S(uD,c); float fire=T+d.b*.05, sm=d.g;
  float a=1.-exp(-(fire*.55+sm*.35)*${(Math.sqrt(NX*NX+NY*NY+NZ*NZ)/NS).toFixed(3)}); if(a<.004)discard;
  vec3 e=ramp(clamp(fire*.55,0.,1.))*(.6+1.6*min(fire,1.6)), s=vec3(.06,.055,.05); vec3 col=mix(s,e,clamp(fire/(fire+sm*.8+1e-3),0.,1.));
  fragOut=vec4(col*a,a); }`});
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NS*4*3),3)); sg.attributes.position.setUsage(THREE.DynamicDrawUsage);
  { const I=[]; for(let i=0;i<NS;i++){ const a=i*4; I.push(a,a+1,a+2,a,a+2,a+3); } sg.setIndex(I); }
  const vol=new THREE.Mesh(sg,rMat); vol.frustumCulled=false; vol.raycast=()=>{}; vol.renderOrder=6; vol.visible=false; vol.name='fire volume'; vol.userData.anyRoom=1; scene.add(LEVELS.own(vol,'*'));
  const C3=new V3(), F3=new V3(), R3=new V3(), U3=new V3(), Q3=new V3();
  const slices=()=>{ const camO=SHARED.cam.position; C3.copy(FS.O).add(Q3.set(NX*H/2,NY*H/2,NZ*H/2)); const half=Math.hypot(NX,NY,NZ)*H/2; F3.subVectors(C3,camO).normalize(); R3.crossVectors(F3,Q3.set(0,1,0)); if(R3.lengthSq()<1e-6)R3.set(1,0,0); R3.normalize(); U3.crossVectors(R3,F3);
    const P=sg.attributes.position.array; for(let i=0;i<NS;i++){ const o=half*(1-2*(i+.5)/NS); for(let k=0;k<4;k++){ const sx=k===0||k===3?-1:1, sy=k<2?-1:1, j=(i*4+k)*3;
        P[j]=C3.x+F3.x*o+(R3.x*sx+U3.x*sy)*half; P[j+1]=C3.y+F3.y*o+(R3.y*sx+U3.y*sy)*half; P[j+2]=C3.z+F3.z*o+(R3.z*sx+U3.z*sy)*half; } } sg.attributes.position.needsUpdate=true; };

  /* ---------- a step: the box follows the fire (moved whole cells, the field carried with it), the fire's jets are laid in, the fluid steps ---------- */
  // focus {x,y,z,dx,dz}: where the fire is and which way it runs; jets [{x,y,z,vx,vy,vz,r,f}] in world units (r the jet's radius, f fuel a second)
  FS.step=(dt,focus,jets)=>{ '@later'; if(focus){ FS.idle=0; } else FS.idle+=dt; FS.on=FS.idle<4; vol.visible=FS.on; if(!FS.on)return; if(!RT)make();
    if(focus){ const gx=focus.x+focus.dx*3.3*M-NX*H/2, gz=focus.z+focus.dz*3.3*M-NZ*H/2, gy=focus.y-.3*M, ci=[Math.round(gx/H),Math.round(gy/H),Math.round(gz/H)];
      if(!FS.set){ FS.set=1; FS.ci=ci; } const s=[ci[0]-FS.ci[0],ci[1]-FS.ci[1],ci[2]-FS.ci[2]]; U.uShift.value.set(s[0],s[1],s[2]); FS.ci=ci; } else U.uShift.value.set(0,0,0);
    FS.O.set(FS.ci[0]*H,FS.ci[1]*H,FS.ci[2]*H);
    let n=0; for(const j of jets||[]){ if(n>=NE)break; const x=(j.x-FS.O.x)/H, y=(j.y-FS.O.y)/H, z=(j.z-FS.O.z)/H; if(x<-2||y<-2||z<-2||x>NX+2||y>NY+2||z>NZ+2)continue;
      U.uE.value[n].set(x,y,z,Math.max(1.3,j.r/H)); U.uEV.value[n].set(j.vx/H,j.vy/H,j.vz/H,j.f); n++; } U.uN.value=n;
    U.uDt.value=Math.min(dt,1/20); const r0=renderer.getRenderTarget(), ac=renderer.autoClear; renderer.autoClear=false;
    try{ U.uV.value=RT.V[0].texture; run(mCurl,RT.C); U.uC.value=RT.C.texture; U.uD.value=RT.D[0].texture; run(mVel,RT.V[1]); sw(RT.V);
      U.uV.value=RT.V[0].texture; run(mDen,RT.D[1]); sw(RT.D); U.uShift.value.set(0,0,0);
      run(mDiv,RT.Div); U.uDiv.value=RT.Div.texture; for(let i=0;i<14;i++){ U.uP.value=RT.P[0].texture; run(mJac,RT.P[1]); sw(RT.P); }
      U.uP.value=RT.P[0].texture; run(mGrad,RT.V[1]); sw(RT.V); }
    finally{ renderer.setRenderTarget(r0); renderer.autoClear=ac; }
    RU.uV.value=RT.V[0].texture; RU.uD.value=RT.D[0].texture; slices(); };
  FS.box=()=>({O:FS.O.toArray().map(v=>+v.toFixed(2)),size:[NX*H,NY*H,NZ*H],on:FS.on}); }
