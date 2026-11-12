// THE OCEAN'S WAVES: OCEAN, Ultra-Water's FFT ocean (Humpalumps, MIT, docs/licences/ultra-water.txt) cut to three cascades, and a grid of the drawn surface's heights read back for things afloat.
import {THREE} from './003-shx.js';
const OCEAN={N:128,L:[600,85,12]};
// the surface's displacement as the river's vertex shader and the height grid both work it out (units in, units out); damped where the bed is shallow
OCEAN.GLSL=`uniform sampler2D uD0,uD1,uD2,uBedO; uniform vec4 uBedRO; uniform vec3 uFL,uFLod; uniform float uFK;
  vec3 oDamp(vec2 p){ vec2 bu=clamp((p-uBedRO.xy)/max(uBedRO.zw,vec2(1e-3)),0.,1.); float dm=texture(uBedO,bu).r*12.75; return vec3(smoothstep(1.,7.,dm),mix(.45,1.,smoothstep(.8,4.,dm)),mix(.7,1.,smoothstep(.5,2.,dm))); }
  vec3 oDisp(vec2 p){ vec3 k=oDamp(p); return (textureLod(uD0,p/uFL.x,uFLod.x).xyz*k.x+textureLod(uD1,p/uFL.y,uFLod.y).xyz*k.y+textureLod(uD2,p/uFL.z,uFLod.z).xyz*k.z)*uFK; }`;
OCEAN.make=(renderer,o)=>{ '@later';
  const N=OCEAN.N, LOG=Math.log2(N), CL=OCEAN.L, NC=CL.length, G=9.81, ST=7.4e-5, LOOP=300, H=N*NC;
  const VS='in vec3 position; void main(){ gl_Position=vec4(position.xy,0.,1.); }';
  const tri=new THREE.BufferGeometry(); tri.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
  const cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1), quad=new THREE.Mesh(tri); quad.frustumCulled=false;
  const pass=(fs,u)=>new THREE.RawShaderMaterial({glslVersion:THREE.GLSL3,vertexShader:VS,fragmentShader:fs,uniforms:u,depthTest:false,depthWrite:false});
  const draw=(m,t)=>{ quad.material=m; renderer.setRenderTarget(t); renderer.render(quad,cam); };
  const C=`precision highp float; precision highp int;
    #define N ${N}
    #define NC ${NC}
    #define PI 3.14159265359
    #define G ${G.toFixed(2)}
    #define ST ${ST.toExponential()}
    vec2 cmul(vec2 a,vec2 b){ return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x); }
    float omega(float k){ return sqrt(G*k+ST*k*k*k); }`;
  const INIT=C+`uniform vec4 uSpecA[2],uSpecB[2]; uniform vec3 uLength; uniform vec2 uCut; uniform uint uSeed; out vec4 outColor;
    uvec2 pcg2d(uvec2 v){ v=v*1664525u+1013904223u; v.x+=v.y*1664525u; v.y+=v.x*1664525u; v^=v>>16u; v.x+=v.y*1664525u; v.y+=v.x*1664525u; v^=v>>16u; return v; }
    vec2 gauss(ivec2 id,int c){ uvec2 h=pcg2d(uvec2(id)+uvec2(uint(c)*7919u,uint(c)*104729u)+uSeed); float u1=(float(h.x)+1.)/4294967296., u2=float(h.y)/4294967296.; return sqrt(-2.*log(u1))*vec2(cos(2.*PI*u2),sin(2.*PI*u2)); }
    float jonswap(float w,vec4 a,vec4 b){ float wp=b.y, sg=w<=wp?.07:.09, r=exp(-(w-wp)*(w-wp)/(2.*sg*sg*wp*wp)), iw=1./w, q=wp*iw; return a.x*b.x*G*G*iw*iw*iw*iw*iw*exp(-1.25*q*q*q*q)*pow(b.z,r); }
    float nrm(float s){ float s2=s*s,s3=s2*s,s4=s3*s; if(s<5.)return -.000564*s4+.00776*s3-.044*s2+.192*s+.163; return -4.8e-8*s4+1.07e-5*s3-9.53e-4*s2+5.9e-2*s+.393; }
    float dirn(float th,float w,vec4 a,vec4 b){ float x=w/b.y, s=x>1.?9.77*pow(x,-2.5):6.97*pow(x,5.); s+=16.*tanh(min(x,20.))*a.w*a.w; float t=th-a.y; return mix(2./PI*cos(t)*cos(t),nrm(s)*pow(abs(cos(.5*t)),2.*s),a.z); }
    vec2 h0(ivec2 id,int c){ float L=uLength[c], dk=2.*PI/L; vec2 k=vec2(id-N/2)*dk; float kl=length(k), lo=c==0?1e-4:uCut[c-1], hi=c==NC-1?1e4:uCut[c]; if(kl<lo||kl>hi)return vec2(0.);
      float w=omega(kl), dw=(G+3.*ST*kl*kl)/(2.*w), th=atan(k.y,k.x), S=0.; for(int i=0;i<2;i++){ if(uSpecA[i].x<=0.)continue; S+=jonswap(w,uSpecA[i],uSpecB[i])*dirn(th,w,uSpecA[i],uSpecB[i])*exp(-uSpecB[i].w*uSpecB[i].w*kl*kl); }
      return gauss(id,c)*sqrt(2.*S*dw/kl*dk*dk); }
    void main(){ ivec2 p=ivec2(gl_FragCoord.xy); int c=p.y/N; ivec2 id=ivec2(p.x,p.y-c*N); vec2 a=h0(id,c), b=h0((N-id)%N,c); outColor=vec4(a,b.x,-b.y); }`;
  const EVOLVE=C+`uniform highp sampler2D uH0; uniform vec3 uLength; uniform float uTime; layout(location=0) out vec4 out0; layout(location=1) out vec4 out1;
    vec2 pack2(vec2 a,vec2 b){ return vec2(a.x-b.y,a.y+b.x); }
    void main(){ ivec2 p=ivec2(gl_FragCoord.xy); int c=p.y/N; vec2 k=vec2(ivec2(p.x,p.y-c*N)-N/2)*(2.*PI/uLength[c]); float kl=length(k), ik=kl>1e-6?1./kl:0.;
      const float W0=2.*PI/${LOOP.toFixed(1)}; float ph=2.*PI*fract(floor(omega(kl)/W0)*(uTime/${LOOP.toFixed(1)})); vec2 e=vec2(cos(ph),sin(ph));
      vec4 h0=texelFetch(uH0,p,0); vec2 h=cmul(h0.xy,e)+cmul(h0.zw,vec2(e.x,-e.y)), ih=vec2(-h.y,h.x);
      vec2 dx=ih*k.x*ik, dz=ih*k.y*ik, dxdx=-h*k.x*k.x*ik, dzdz=-h*k.y*k.y*ik, dxdz=-h*k.x*k.y*ik, dydx=ih*k.x, dydz=ih*k.y;
      out0=vec4(pack2(dx,dz),pack2(h,dxdz)); out1=vec4(pack2(dydx,dydz),pack2(dxdx,dzdz)); }`;
  const FFT=C+`uniform highp sampler2D uIn0,uIn1; uniform int uSub,uVertical; layout(location=0) out vec4 out0; layout(location=1) out vec4 out1;
    void main(){ ivec2 p=ivec2(gl_FragCoord.xy); int i=uVertical==1?p.y%N:p.x, hs=uSub>>1, e=(i/uSub)*hs+(i&(hs-1)); ivec2 pe,po;
      if(uVertical==1){ int b=p.y-i; pe=ivec2(p.x,b+e); po=ivec2(p.x,b+e+N/2); } else { pe=ivec2(e,p.y); po=ivec2(e+N/2,p.y); }
      float a=2.*PI*float(i&(uSub-1))/float(uSub); vec2 tw=vec2(cos(a),sin(a)); vec4 e0=texelFetch(uIn0,pe,0), o0=texelFetch(uIn0,po,0), e1=texelFetch(uIn1,pe,0), o1=texelFetch(uIn1,po,0);
      out0=vec4(e0.xy+cmul(tw,o0.xy),e0.zw+cmul(tw,o0.zw)); out1=vec4(e1.xy+cmul(tw,o1.xy),e1.zw+cmul(tw,o1.zw)); }`;
  const ASM=C+`uniform highp sampler2D uIn0,uIn1; uniform sampler2D uPrev; uniform int uCascade; uniform float uLambda,uDt,uRec; layout(location=0) out vec4 outDisp; layout(location=1) out vec4 outSlope;
    void main(){ ivec2 id=ivec2(gl_FragCoord.xy), p=id+ivec2(0,uCascade*N); float s=((id.x+id.y)&1)==0?1.:-1.; vec4 a=texelFetch(uIn0,p,0)*s, b=texelFetch(uIn1,p,0)*s;
      float dxx=uLambda*b.z, dzz=uLambda*b.w, dxz=uLambda*a.w, jac=(1.+dxx)*(1.+dzz)-dxz*dxz; vec2 sl=b.xy/max(vec2(1.+dxx,1.+dzz),vec2(.2));
      float turb=min(jac,texelFetch(uPrev,id,0).w+uDt*uRec/max(jac,.5)); outDisp=vec4(uLambda*a.x,a.z,uLambda*a.y,turb); outSlope=vec4(sl,sl*sl); }`;
  const fft={type:THREE.FloatType,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false,generateMipmaps:false};
  const h0RT=new THREE.WebGLRenderTarget(N,H,fft), half={...fft,type:THREE.HalfFloatType,count:2}, ping=new THREE.WebGLRenderTarget(N,H,half), pong=new THREE.WebGLRenderTarget(N,H,half);
  const outO={type:THREE.HalfFloatType,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter,wrapS:THREE.RepeatWrapping,wrapT:THREE.RepeatWrapping,generateMipmaps:true,anisotropy:Math.min(8,renderer.capabilities.getMaxAnisotropy()),depthBuffer:false,count:2};
  const OUT=CL.map(()=>[new THREE.WebGLRenderTarget(N,N,outO),new THREE.WebGLRenderTarget(N,N,outO)]);
  const cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), rt0=renderer.getRenderTarget(); renderer.setClearColor(0x000000,1); for(const pr of OUT)for(const t of pr){ renderer.setRenderTarget(t); renderer.clear(true,false,false); } renderer.setClearColor(cc,ca); renderer.setRenderTarget(rt0);
  const LEN=new THREE.Vector3(...CL);
  const initM=pass(INIT,{uSpecA:{value:[new THREE.Vector4(),new THREE.Vector4()]},uSpecB:{value:[new THREE.Vector4(),new THREE.Vector4()]},uLength:{value:LEN},uCut:{value:new THREE.Vector2(...CL.slice(1).map(L=>2*Math.PI/L*6))},uSeed:{value:1337}});
  const evoM=pass(EVOLVE,{uH0:{value:h0RT.texture},uLength:{value:LEN},uTime:{value:0}});
  const fftM=pass(FFT,{uIn0:{value:null},uIn1:{value:null},uSub:{value:2},uVertical:{value:0}});
  const asmM=pass(ASM,{uIn0:{value:null},uIn1:{value:null},uPrev:{value:null},uCascade:{value:0},uLambda:{value:1},uDt:{value:0},uRec:{value:.7}});
  const jon=(ws,fk)=>{ const f=fk*1000; return {a:.076*Math.pow(G*f/(ws*ws),-.22),w:22*Math.pow(ws*f/(G*G),-.33)}; };
  const S={time:0,dirty:true,par:0,P:{wind:6,fetch:20,dir:85,spread:.85,windSwell:.25,gamma:3.3,fade:.04,scale:1,swell:.5,swellWind:7,swellDir:100,swellFetch:600,chop:.85,rec:.7,...(o||{})},
    disp:OUT.map(p=>p[0].textures[0]),slope:OUT.map(p=>p[0].textures[1])};
  S.set=p=>{ Object.assign(S.P,p); S.dirty=true; };
  S.update=dt=>{ const p=S.P, rt=renderer.getRenderTarget();
    if(S.dirty){ const u=initM.uniforms, w=jon(p.wind,p.fetch), s=jon(p.swellWind,p.swellFetch), r=THREE.MathUtils.degToRad;
      u.uSpecA.value[0].set(p.scale,r(p.dir),p.spread,p.windSwell); u.uSpecB.value[0].set(w.a,w.w,p.gamma,p.fade);
      u.uSpecA.value[1].set(p.swell*p.scale,r(p.swellDir),1,1); u.uSpecB.value[1].set(s.a,s.w,p.gamma,p.fade); draw(initM,h0RT); S.dirty=false; }
    S.time=(S.time+dt)%LOOP; evoM.uniforms.uTime.value=S.time; draw(evoM,ping);
    let a=ping, b=pong; const fu=fftM.uniforms;
    for(let d=0;d<2;d++){ fu.uVertical.value=d; for(let s=1;s<=LOG;s++){ fu.uSub.value=1<<s; fu.uIn0.value=a.textures[0]; fu.uIn1.value=a.textures[1]; draw(fftM,b); [a,b]=[b,a]; } }
    const au=asmM.uniforms; au.uIn0.value=a.textures[0]; au.uIn1.value=a.textures[1]; au.uLambda.value=p.chop; au.uDt.value=dt; au.uRec.value=p.rec; const nx=S.par^1;
    for(let c=0;c<NC;c++){ au.uCascade.value=c; au.uPrev.value=OUT[c][S.par].textures[0]; draw(asmM,OUT[c][nx]); S.disp[c]=OUT[c][nx].textures[0]; S.slope[c]=OUT[c][nx].textures[1]; }
    S.par=nx; renderer.setRenderTarget(rt); };
  // the heights of the surface as drawn, on a grid (GX by GZ points from its corner, a step apart), read back a frame or three late: a point on the surface came from p where p + its sideways push = q
  const GX=96, GZ=96, ok=renderer.capabilities.isWebGL2&&renderer.extensions.has('EXT_color_buffer_float');
  const Q={ok,GX,GZ,h:new Float32Array(GX*GZ),x0:0,z0:0,st:1,have:false,busy:0,bufs:[new Float32Array(GX*GZ*4),new Float32Array(GX*GZ*4)],nb:0};
  const qRT=new THREE.WebGLRenderTarget(GX,GZ,{type:THREE.FloatType,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false,generateMipmaps:false});
  const qU={uO:{value:new THREE.Vector3()}};
  const qM=pass(`precision highp float; precision highp int; ${OCEAN.GLSL} uniform vec3 uO; out vec4 outColor;
    void main(){ vec2 q=uO.xy+floor(gl_FragCoord.xy)*uO.z, p=q; for(int i=0;i<14;i++){ vec3 d=oDisp(p); p+=.55*(q-(p+d.xz)); } outColor=vec4(oDisp(p),1.); }`,qU);
  S.query=(U,x0,z0,st)=>{ if(!ok||Q.busy>=2||!Number.isFinite(x0+z0+st)||Math.abs(x0)>1e7)return; Object.assign(qU,U,{uO:qU.uO}); qM.uniforms=qU; qU.uO.value.set(x0,z0,st); const rt=renderer.getRenderTarget(); draw(qM,qRT); renderer.setRenderTarget(rt);
    Q.busy++; const buf=Q.bufs[Q.nb++%2];
    renderer.readRenderTargetPixelsAsync(qRT,0,0,GX,GZ,buf).then(()=>{ for(let i=0;i<GX*GZ;i++){ const v=buf[i*4+1]; Q.h[i]=Number.isFinite(v)?v:0; } Q.x0=x0; Q.z0=z0; Q.st=st; Q.have=true; }).catch(()=>{}).finally(()=>{ Q.busy--; }); };
  S.hAt=(x,z)=>{ if(!Q.have)return 0; const fx=(x-Q.x0)/Q.st, fz=(z-Q.z0)/Q.st; if(fx<0||fz<0||fx>GX-1||fz>GZ-1)return 0;
    const i=Math.min(GX-2,fx|0), j=Math.min(GZ-2,fz|0), u=fx-i, v=fz-j, h=Q.h, k=j*GX+i; return (h[k]*(1-u)+h[k+1]*u)*(1-v)+(h[k+GX]*(1-u)+h[k+GX+1]*u)*v; };
  S.Q=Q;
  S.dispose=()=>{ for(const t of [h0RT,ping,pong,qRT,...OUT.flat()])t.dispose(); for(const m of [initM,evoM,fftM,asmM,qM])m.dispose(); tri.dispose(); };
  return S; };
export {OCEAN};
