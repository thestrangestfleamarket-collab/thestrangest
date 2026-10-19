const RIVER={way:'fluid',wi:2,step:false,t:0,on:false};
{ const R=RING, XS=BOD.XS, ZS=BOD.ZS, T=TILE, QSr=new URLSearchParams(location.search);
  const MPU=0.84/T, WU=1/MPU;
  const L=MODS.landR, lx0=L.x0*T, lx1=L.x1*T, rz0=Math.min(ZS(R.river.y0),ZS(R.river.y1)), rz1=Math.max(ZS(R.river.y0),ZS(R.river.y1));
  const fx0=XS(R.ff.x0), fx1=XS(R.ff.x1);
  const LVm=-1.0, LV=LVm*WU;
  RIVER.box={x0:lx0,x1:lx1,z0:rz0,z1:rz1,lv:LV};
  const WATERS=[
   {key:'a',name:'A · HARBOR',desc:'The Hudson by the river walk: green and murky, a light chop off the wind, a tyre and bottles in the mud.',
    sig:[0.55,0.24,0.33],scat:[0.10,0.20,0.15],deep:7,bed:0,foam:0.35,refr:1.0,fish:[[0.66,0.7,0.7],[0.62,0.66,0.66],[0.45,0.48,0.34]],
    waves:[[6.5,0.09,265,.45],[4.0,0.07,250,.6],[2.6,0.05,285,.6],[1.7,0.035,240,.5],[3.1,0.04,300,.5],[1.2,0.02,270,.5]]},
   {key:'b',name:'B · OPEN SEA',desc:'A long swell under a wind sea: crests a metre high that break white. A rock bed.',
    sig:[0.42,0.10,0.06],scat:[0.03,0.13,0.26],deep:8,bed:1,foam:1,refr:1.2,fish:[[0.55,0.66,0.76],[0.7,0.78,0.85]],
    waves:[[18,0.42,268,.5],[11,0.24,255,.6],[7,0.14,280,.7],[4,0.08,245,.8],[2.5,0.05,290,.8],[1.6,0.025,230,.7],[5.5,0.09,262,.7]]},
   {key:'c',name:'C · CLEAR COVE',desc:'Glassy and clear: the sand rippled eight metres down, light dancing over it, bright fish.',
    sig:[0.62,0.16,0.12],scat:[0.03,0.34,0.38],deep:8,bed:2,foam:0.15,refr:1.4,fish:[[0.96,0.82,0.22],[0.28,0.48,0.92],[0.95,0.52,0.22]],
    waves:[[9,0.07,268,.3],[3.5,0.016,240,.4],[2.2,0.01,290,.4],[1.4,0.006,255,.4]]}];
  RIVER.WATERS=WATERS;
  const cl=(v,a,b)=>v<a?a:v>b?b:v;
  const hash=(x,y)=>{ let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y)=>{ const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,y)=>vn(x,y)*0.5+vn(x*2.1+5,y*2.1+3)*0.3+vn(x*4.3+9,y*4.3+1)*0.2;
  const depthAt=(x,z)=>{ const Wt=WATERS[RIVER.wi], xm=x*MPU, zm=z*MPU, e=Math.min((rz1-z)*MPU,(z-rz0)*MPU), t=cl(e/16,0,1);
    let d=1.3+(Wt.deep-1.3)*Math.pow(t,1.1)-(fbm(xm*0.25,zm*0.25)-0.5)*1.8;
    if(Wt.bed===2)d-=Math.sin(xm*2.7+fbm(xm*0.55,zm*0.55)*6)*0.07;
    if(Wt.bed===1)d-=Math.max(0,fbm(xm*0.55+3,zm*0.55)-0.52)*6;
    if(Wt.bed===0)d-=(vn(xm*1.6,zm*1.6)-0.5)*0.25;
    return Math.max(1.2,d); };
  RIVER.depthAt=depthAt;
  const NW=8, WA=Array.from({length:NW},()=>new THREE.Vector4()), WB=Array.from({length:NW},()=>new THREE.Vector4()); let WV=[];
  const setWaves=()=>{ const ws=WATERS[RIVER.wi].waves, n=ws.length; WV=ws.map(([lam,A,deg,st],m)=>{ const k=2*Math.PI/lam, a=deg*Math.PI/180; return {dx:Math.cos(a),dz:-Math.sin(a),k:k*MPU,w:Math.sqrt(9.81*k),A:A*WU,Q:st/(k*A*n),ph:m*1.7}; });
    for(let i=0;i<NW;i++){ const w=WV[i]; if(w){ WA[i].set(w.dx,w.dz,w.k,w.w); WB[i].set(w.A,w.Q,w.ph,0); } else { WA[i].set(1,0,0,0); WB[i].set(0,0,0,0); } } };
  const ampAt=x=>RIVER.way==='flat'?0:cl(Math.min(x-(RIVER.cx-WIN/2),RIVER.cx+WIN/2-x)/(10*T),0,1);
  const hAt=(x,z)=>{ const f=ampAt(x); if(!f)return 0; let h=0; for(const w of WV)h+=w.A*Math.sin(w.k*(w.dx*x+w.dz*z)-w.w*RIVER.t+w.ph); return h*f; };
  const slopeAt=(x,z)=>{ const f=ampAt(x); let sx=0,sz=0; for(const w of WV){ const c=w.k*w.A*Math.cos(w.k*(w.dx*x+w.dz*z)-w.w*RIVER.t+w.ph); sx+=w.dx*c; sz+=w.dz*c; } return [sx*f,sz*f]; };
  RIVER.hAt=hAt;

  const WIN=88*T, CELL=T, NX=Math.round(WIN/CELL), DZ=rz1-rz0, NZ=Math.round(DZ/CELL); RIVER.cx=1e9;
  const snapX=x=>Math.round(cl(x,lx0+WIN/2,lx1-WIN/2)/(8*T))*8*T;
  const SG=192, SW=48*T, SIM={x0:0,z0:0,sx:0,sz:0,drops:[],acc:0,quiet:99};
  const sopt={type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,wrapS:THREE.ClampToEdgeWrapping,wrapT:THREE.ClampToEdgeWrapping,depthBuffer:false};
  SIM.A=new THREE.WebGLRenderTarget(SG,SG,sopt); SIM.B=new THREE.WebGLRenderTarget(SG,SG,sopt);
  const uRip={value:SIM.A.texture}, uRect={value:new THREE.Vector4(0,0,SW,SW)}, uRipOn={value:0}, uForce={value:0}, uPost={value:Array.from({length:16},()=>new THREE.Vector3())}, uNPost={value:0};
  const simMat=new THREE.ShaderMaterial({uniforms:{uPrev:{value:null},uT:{value:1/SG},uDt:{value:1/120},uDx:{value:SW/SG},uDamp:{value:1-0.25/120},uShift:{value:new THREE.Vector2()},
      uDrop:{value:Array.from({length:8},()=>new THREE.Vector4())},uN:{value:0},uRect:uRect,uBank:{value:rz1},uFar:{value:rz0},uG:{value:SG},uForce:uForce,uPost:uPost,uNPost:uNPost,
      uBed:{value:null},uBedR:{value:new THREE.Vector4()},uWA:{value:null},uWB:{value:null},uNW:{value:0},uTime:{value:0},uWU:{value:WU}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy*2.,0.,1.); }',
    fragmentShader:`uniform sampler2D uPrev,uBed; uniform float uT,uDt,uDx,uDamp,uBank,uFar,uG,uForce,uTime,uWU; uniform vec2 uShift; uniform vec4 uDrop[8],uRect,uBedR,uWA[${NW}],uWB[${NW}]; uniform vec3 uPost[16]; uniform int uN,uNPost,uNW; varying vec2 vUv;
    vec2 wp(vec2 u){ return uRect.xy+u*uRect.zw; }
    bool solid(vec2 u){ vec2 w=wp(u); return w.y>uBank||w.y<uFar; }
    float post(vec2 w){ float m=0.; for(int i=0;i<16;i++){ if(i>=uNPost)break; m=max(m,1.-smoothstep(uPost[i].z,uPost[i].z+uDx,length(w-uPost[i].xy))); } return m; }
    float at(vec2 u,float h){ return solid(u)?h:texture2D(uPrev,u).r; }
    float sea(vec2 w){ float h=0.; for(int i=0;i<${NW};i++){ if(i>=uNW)break; vec4 a=uWA[i], b=uWB[i]; h+=b.x*sin(a.z*dot(a.xy,w)-a.w*uTime+b.z); } return h; }
    void main(){ vec2 u=vUv+uShift; if(u.x<0.||u.y<0.||u.x>1.||u.y>1.){ gl_FragColor=vec4(0.); return; }
      vec2 w=wp(vUv); if(solid(vUv)){ gl_FragColor=vec4(0.); return; }
      vec4 c=texture2D(uPrev,u); float h=c.r, pv=c.g;
      vec2 bu=(w-uBedR.xy)/uBedR.zw; float d=clamp(texture2D(uBed,bu).r*255./20.,.3,12.), k=2.*3.14159/3., cm=sqrt(9.81/k*tanh(k*d)), cw=cm*uWU*uDt/uDx;
      float s=at(u-vec2(uT,0.),h)+at(u+vec2(uT,0.),h)+at(u-vec2(0.,uT),h)+at(u+vec2(0.,uT),h);
      float nv=(2.*h-pv+cw*cw*(s-4.*h))*uDamp;
      float e=min(min(vUv.x,1.-vUv.x),vUv.y)*uG; if(e<16.){ float k2=(16.-e)/16.; k2*=k2*.12; if(uForce>0.)nv=mix(nv,sea(w),k2); else nv*=1.-k2; }
      for(int i=0;i<8;i++){ if(i>=uN)break; vec4 dr=uDrop[i]; float r=length((vUv-dr.xy)*uRect.zw); if(r<dr.z)nv-=dr.w*(.5+.5*cos(3.14159*r/dr.z)); }
      nv*=1.-.85*post(w); nv=clamp(nv,-3.,3.); if(!(nv==nv))nv=0.; gl_FragColor=vec4(nv,h,0.,1.); }`});
  const simScene=new THREE.Scene(), simCam=new THREE.Camera(); simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),simMat));
  RIVER.drop=(x,z,r,s)=>{ if(RIVER.way!=='full'&&RIVER.way!=='fluid')return; if(SIM.drops.length<8)SIM.drops.push([(x-SIM.x0)/SW,(z-SIM.z0)/SW,r,s]); };

  const BN=[Math.round(WIN/(2*T)),Math.round(DZ/(2*T))], bedG=new THREE.PlaneGeometry(WIN,DZ,BN[0],BN[1]); bedG.rotateX(-Math.PI/2);
  const uT0={value:0}, uBedK={value:0}, uCau={value:1}, uLvW={value:LV}, uSunD={value:new THREE.Vector3()};
  const GLN=`float rh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float rn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(rh(i),rh(i+vec2(1.,0.)),f.x),mix(rh(i+vec2(0.,1.)),rh(i+vec2(1.,1.)),f.x),f.y); }
    float rf(vec2 p){ return rn(p)*.5+rn(p*2.1+5.)*.3+rn(p*4.3+9.)*.2; }`;
  const uAmbB={value:new THREE.Color()}, uSunCB={value:new THREE.Color()};
  const bedMat=new THREE.ShaderMaterial({uniforms:{uT:uT0,uBedK,uCau,uLvW,uSunD,uSunC:uSunCB,uAmb:uAmbB},
    vertexShader:'varying vec3 vRw,vN; void main(){ vec4 w=modelMatrix*vec4(position,1.); vRw=w.xyz; vN=normal; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform float uT,uBedK,uCau,uLvW; uniform vec3 uSunD,uSunC,uAmb; varying vec3 vRw,vN;
    ${GLN}
    float cau(vec2 p,float t){ vec2 i=p; float c=1.; for(int n=0;n<4;n++){ float tt=t*(1.-(3.5/float(n+1))); i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x)); vec2 q=vec2(sin(i.x+tt),cos(i.y+tt)); q=sign(q)*max(abs(q),vec2(1e-3)); c+=1./max(length(vec2(p.x/(q.x/.005),p.y/(q.y/.005))),1e-4); } c/=4.; c=1.17-pow(max(c,0.),1.4); return min(pow(abs(c),8.),4.); }
    void main(){ vec2 q=floor(vRw.xz/${(TILE/12).toFixed(4)})*${(TILE/12*MPU).toFixed(4)}; float v=rf(q*2.), h=rh(floor(q*14.)); vec3 c;
      if(uBedK<.5){ c=vec3(.33,.29,.21)*(.78+.44*v); if(h>.94)c=vec3(.24,.22,.19); else if(h>.925)c=vec3(.55,.53,.46); }
      else if(uBedK<1.5){ float r=rf(q*.55+3.); if(r>.55){ float k=.75+.45*rn(q*4.); c=vec3(.40,.40,.38)*k; if(rn(q*7.)>.82)c=vec3(.22); if(h>.9)c=vec3(.5,.3,.32); } else c=vec3(.6,.56,.46)*(.82+.3*v); }
      else { float s=sin(q.x*5.5+rf(q*.7)*5.); c=vec3(.86,.8,.62)*(.86+.2*v)*(.93+.07*s); if(h>.96)c=vec3(.95,.9,.82); if(h<.01)c=vec3(.72,.5,.45); }
      vec3 n=normalize(vN); vec3 L=uAmb*.7+uSunC*max(dot(n,uSunD),0.)*.32; c*=L;
      float d=uLvW-vRw.y; if(d>0.&&uCau>0.){ vec2 p=vRw.xz*${MPU.toFixed(4)}*.62+uSunD.xz*d*${MPU.toFixed(4)}*.5; float k=cau(mod(p,6.2831),uT*.5)+.6*cau(mod(p*1.7+1.3,6.2831),uT*.4); float kk=clamp(k*1.6,0.,1.4); c*=.72+uCau*.9*kk*exp(-d*${MPU.toFixed(4)}*.1); c+=vec3(.25,.55,.55)*uCau*kk*.35*exp(-d*${MPU.toFixed(4)}*.1); }
      gl_FragColor=vec4(c,1.); }`});
  const bed=new THREE.Mesh(bedG,bedMat); bed.receiveShadow=false;
  bed.frustumCulled=false; scene.add(bed);
  const bedTex=new THREE.DataTexture(new Uint8Array((BN[0]+1)*(BN[1]+1)*4),BN[0]+1,BN[1]+1); bedTex.magFilter=bedTex.minFilter=THREE.LinearFilter;
  const buildBed=()=>{ const p=bedG.attributes.position, a=bedTex.image.data; for(let i=0;i<p.count;i++){ const x=p.getX(i)+RIVER.cx, z=p.getZ(i)+(rz0+rz1)/2, d=depthAt(x,z); p.setY(i,LV-d*WU); }
    for(let j=0;j<=BN[1];j++)for(let i=0;i<=BN[0];i++){ const x=RIVER.cx-WIN/2+i/BN[0]*WIN, z=rz0+j/BN[1]*DZ, k=(j*(BN[0]+1)+i)*4; a[k]=Math.min(255,depthAt(x,z)*20); a[k+3]=255; }
    p.needsUpdate=true; bedG.computeVertexNormals(); bedTex.needsUpdate=true; bed.position.set(RIVER.cx,0,(rz0+rz1)/2); if(typeof seedGrass!=='undefined')seedGrass(); };

  const surfG=new THREE.PlaneGeometry(WIN,DZ,NX,NZ); surfG.rotateX(-Math.PI/2); surfG.boundingSphere=new THREE.Sphere(new THREE.Vector3(),WIN);
  const RT=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType}); RT.depthTexture=new THREE.DepthTexture(4,4); RT.depthTexture.type=THREE.FloatType;
  const SU={uT:uT0,uWA:{value:WA},uWB:{value:WB},uNW:{value:0},uAmp:{value:1},uWin:{value:new THREE.Vector4()},uRip:uRip,uRect:uRect,uRipOn:uRipOn,uRT:{value:1/SG},
    uScene:{value:RT.texture},uDepth:{value:RT.depthTexture},uRes:{value:new THREE.Vector2(4,4)},uNear:{value:.1},uFar:{value:800},uMode:{value:0},uBed:{value:bedTex},uBedR:{value:new THREE.Vector4()},
    uSig:{value:new THREE.Vector3()},uScat:{value:new THREE.Vector3()},uFoam:{value:0},uRefr:{value:1},uLv:{value:LV},uBank:{value:new THREE.Vector2(rz0,rz1)},
    uSunD:uSunD,uSunC:{value:new THREE.Color()},uAmb:{value:new THREE.Color()},uSkyH:{value:new THREE.Color()},uSkyZ:{value:new THREE.Color()},uCamD:{value:new THREE.Vector3()},
    uLP:{value:Array.from({length:8},()=>new THREE.Vector3())},uLC:{value:Array.from({length:8},()=>new THREE.Vector3())},uStep:{value:0}};
  const surfMat=new THREE.ShaderMaterial({uniforms:SU,side:THREE.DoubleSide,fog:false,
    vertexShader:`uniform float uT,uAmp,uRT,uRipOn,uMode; uniform vec4 uWA[${NW}],uWB[${NW}],uWin,uRect; uniform int uNW; uniform sampler2D uRip; uniform vec2 uBank;
      varying vec3 vW; varying vec2 vP0; varying float vVz, vH;
      void main(){ vec4 w=modelMatrix*vec4(position,1.); vec2 p=w.xz; vP0=p;
        float fe=uAmp*clamp(min(p.x-uWin.x,uWin.y-p.x)/${(10*T).toFixed(3)},0.,1.), fz=clamp(min(p.y-uBank.x,uBank.y-p.y)/${(1.5*T).toFixed(3)},0.,1.);
        if(uMode>1.5){ vec2 q=(p-uRect.xy)/uRect.zw; fe*=1.-.7*clamp(min(min(q.x,1.-q.x),min(q.y,1.-q.y))*uRect.z/${(4*T).toFixed(3)},0.,1.); }
        vec3 d=vec3(0.); for(int i=0;i<${NW};i++){ if(i>=uNW)break; vec4 a=uWA[i], b=uWB[i]; float th=a.z*dot(a.xy,p)-a.w*uT+b.z, c=cos(th), s=sin(th);
          d.x+=b.y*b.x*a.x*c*fz; d.z+=b.y*b.x*a.y*c*fz; d.y+=b.x*s; }
        d*=fe; vec2 ru=(p-uRect.xy)/uRect.zw; if(uRipOn>0.&&ru.x>0.&&ru.y>0.&&ru.x<1.&&ru.y<1.)d.y+=texture2D(uRip,ru).r;
        w.xyz+=d; vW=w.xyz; vH=d.y; vec4 mv=viewMatrix*w; vVz=mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`#include <packing>
      uniform float uT,uAmp,uRT,uRipOn,uNear,uFar,uMode,uFoam,uRefr,uLv,uStep; uniform vec4 uWA[${NW}],uWB[${NW}],uWin,uRect,uBedR; uniform int uNW; uniform vec2 uRes,uBank;
      uniform sampler2D uRip,uScene,uDepth,uBed; uniform vec3 uSig,uScat,uSunD,uSunC,uAmb,uSkyH,uSkyZ,uCamD,uLP[8],uLC[8];
      varying vec3 vW; varying vec2 vP0; varying float vVz, vH;
      ${GLN}
      float vz(float d){ return isOrthographic?orthographicDepthToViewZ(d,uNear,uFar):perspectiveDepthToViewZ(d,uNear,uFar); }
      vec3 sky(float y){ return mix(uSkyH,uSkyZ,pow(clamp(y,0.,1.),.7)); }
      void main(){ vec2 p=vP0; float fe=uAmp*clamp(min(p.x-uWin.x,uWin.y-p.x)/${(10*T).toFixed(3)},0.,1.);
        if(uMode>1.5){ vec2 q=(p-uRect.xy)/uRect.zw; fe*=1.-.7*clamp(min(min(q.x,1.-q.x),min(q.y,1.-q.y))*uRect.z/${(4*T).toFixed(3)},0.,1.); }
        vec3 n=vec3(0.,1.,0.); float jxx=1.,jzz=1.,jxz=0.;
        for(int i=0;i<${NW};i++){ if(i>=uNW)break; vec4 a=uWA[i], b=uWB[i]; float th=a.z*dot(a.xy,p)-a.w*uT+b.z, c=cos(th), s=sin(th), wa=a.z*b.x*fe;
          n.x-=a.x*wa*c; n.z-=a.y*wa*c; n.y-=b.y*wa*s; jxx-=b.y*wa*a.x*a.x*s; jzz-=b.y*wa*a.y*a.y*s; jxz-=b.y*wa*a.x*a.y*s; }
        float rip=0.; vec2 ru=(p-uRect.xy)/uRect.zw; if(uRipOn>0.&&ru.x>0.&&ru.y>0.&&ru.x<1.&&ru.y<1.){ rip=texture2D(uRip,ru).r; float e=uRect.z*uRT;
          n.x-=(texture2D(uRip,ru+vec2(uRT,0.)).r-texture2D(uRip,ru-vec2(uRT,0.)).r)/(2.*e); n.z-=(texture2D(uRip,ru+vec2(0.,uRT)).r-texture2D(uRip,ru-vec2(0.,uRT)).r)/(2.*e); }
        n=normalize(n); bool up=gl_FrontFacing; if(!up)n=-n;
        vec3 V=isOrthographic?-uCamD:normalize(cameraPosition-vW); float vd=max(dot(n,V),0.);
        vec3 inC=uScat*(uAmb*.8+uSunC*max(uSunD.y,0.)*.6);
        vec3 col; float alpha=1.;
        if(!up){ col=inC*1.6+sky(1.)*.12*pow(vd,2.); }
        else {
          if(uMode<.5||uMode>1.5){
            vec2 s=gl_FragCoord.xy/uRes; float th=max(0.,vVz-vz(texture2D(uDepth,s).r));
            vec2 r=clamp(s+n.xz*.035*uRefr*min(th*${MPU.toFixed(4)},2.),.001,.999); float th2=vVz-vz(texture2D(uDepth,r).r); if(th2<0.){ r=s; th2=th; }
            float m=min(th2*${MPU.toFixed(4)},40.); vec3 Tr=exp(-uSig*m); col=texture2D(uScene,r).rgb*Tr+inC*(1.-Tr); }
          else {
            vec2 bu=(p-uBedR.xy)/uBedR.zw; float dm=texture2D(uBed,vec2(bu.x,bu.y)).r*255./20.; float path=dm/max(abs(V.y),.25);
            alpha=1.-exp(-dot(uSig,vec3(.333))*path); col=inC; }
          vec3 R=reflect(-V,n); float F=clamp(.02+.98*pow(1.-vd,5.),0.,1.)*.45; vec3 sk=sky(R.y); col=mix(col,sk,F); alpha=mix(alpha,1.,F);
          float sp=uSunD.y>0.?pow(max(dot(R,uSunD),0.),600.):0.; if(sp>.55){ col+=vec3(.75,.95,1.)*.8; alpha=1.; }
          col+=inC*clamp((vH*${MPU.toFixed(4)}-.15)*1.2,0.,.6)*1.5;
          { float sh=clamp((n.x*.6-n.z*.8)*16.,-1.,1.); col*=1.+.22*sh; col+=vec3(.05,.22,.22)*max(sh-.55,0.)*1.6; }
          for(int i=0;i<8;i++){ vec3 lc=uLC[i]; if(lc.r+lc.g+lc.b<.001)continue; vec3 dl=uLP[i]-vW; float dd=length(dl), dm=dd*${MPU.toFixed(4)}; dl/=dd;
            float ls=pow(max(dot(R,dl),0.),90.)*3./(1.+dm*.3), pool=.12/(1.+dm*dm*.25); col+=lc*(ls+pool); alpha=max(alpha,min(1.,ls*2.)); }
          float J=jxx*jzz-jxz*jxz, fo=clamp((.62-J)*2.2,0.,1.)*uFoam+clamp(abs(rip)*${(2.5*MPU).toFixed(4)}-.12,0.,.9);
          if(fo>.25+.5*rf(floor(vW.xz/${(T/12).toFixed(4)})*.37+uT*.15)){ col=mix(col,.93*(uAmb+uSunC*.8),.85); alpha=1.; }
        }
        if(uStep>0.)col=floor(col*24.+.5)/24.;
        gl_FragColor=vec4(col,alpha); }`});
  const surf=new THREE.Mesh(surfG,surfMat); surf.frustumCulled=false; scene.add(surf);
  const FU={uT:uT0,uSky:{value:new THREE.Color(.5,.62,.75)},uDay:{value:1}};
  const flatMat=new THREE.ShaderMaterial({uniforms:FU,fog:false,
    vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform float uT,uDay; uniform vec3 uSky; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){ vec2 p=floor(vec2(vW.x+uT*${(1.6*T).toFixed(3)},vW.z)/${(.5*T).toFixed(3)});
        float g=step(.988,h(p+floor(uT*1.3)*vec2(0.,7.))), band=step(.7,h(vec2(floor(vW.z/${(1.4*T).toFixed(3)}),floor(uT*.6))));
        vec3 deep=vec3(.06,.16,.2)*(.35+.65*uDay), c=mix(deep,uSky*.55,.32)+band*.025; c+=g*(.28+.4*uDay)*vec3(.85,.95,1.); gl_FragColor=vec4(c,1.); }`});
  const sheet=()=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,DZ).rotateX(-Math.PI/2),flatMat); m.position.set(0,LV,(rz0+rz1)/2); scene.add(m); return m; };
  const flatAll=sheet(), flatL=sheet(), flatR=sheet();
  const setFlats=()=>{ flatAll.scale.x=lx1-lx0; flatAll.position.x=(lx0+lx1)/2; const a=RIVER.cx-WIN/2, b=RIVER.cx+WIN/2;
    flatL.scale.x=Math.max(.01,a-lx0); flatL.position.x=(lx0+a)/2; flatR.scale.x=Math.max(.01,lx1-b); flatR.position.x=(b+lx1)/2; };

  { const H=(9.5+1)*WU, rows=Math.round(H/T*24), c=document.createElement('canvas'); c.width=96; c.height=rows; const g=c.getContext('2d'), im=g.createImageData(96,rows), wl=Math.round(-LV/H*rows);
    for(let y=0;y<rows;y++)for(let x=0;x<96;x++){ const by=Math.floor(y/12), bx=Math.floor((x+(by%2)*12)/24), mort=y%12===0||(x+(by%2)*12)%24===0, t=.85+.25*hash(bx,by), k=(y*96+x)*4;
      let col=mort?[.27,.27,.27]:[.56*t,.54*t,.5*t]; if(y>wl-2){ const al=cl((y-wl)/18+.4,0,1); col=[col[0]*(1-al)+.16*al,col[1]*(1-al)+.3*al,col[2]*(1-al)+.14*al]; if(y>wl+40)col=col.map(q=>q*.6); }
      if(Math.abs(y-wl)<3&&hash(x,y)>.6)col=[.7,.7,.62]; im.data[k]=col[0]*255; im.data[k+1]=col[1]*255; im.data[k+2]=col[2]*255; im.data[k+3]=255; }
    g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(c); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace; tx.wrapS=THREE.RepeatWrapping; tx.repeat.set((lx1-lx0)/(4*T),1);
    const wm=new THREE.MeshLambertMaterial({map:tx,emissiveMap:tx,emissive:new THREE.Color(.42,.42,.42)});
    for(const [z,f] of [[rz1,1],[rz0,-1]]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(lx1-lx0,H),wm); w.position.set((lx0+lx1)/2,-H/2,z); w.rotation.y=f>0?Math.PI:0; w.receiveShadow=true; scene.add(w); RIVER['wall'+(f>0?'N':'S')]=w; } }
  const selfLit=m=>{ m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.5;'); }; return m; };
  const cope=new THREE.Mesh(new THREE.BoxGeometry(lx1-lx0,.12*T,.45*T),selfLit(new THREE.MeshLambertMaterial({color:0x8c8a82}))); cope.position.set((lx0+lx1)/2,.06*T-.5*ZU,rz1+.22*T); cope.receiveShadow=true; scene.add(cope);
  const LAD=[]; for(let x=fx0+10*T;x<fx1-4*T;x+=20*T)LAD.push(x); RIVER.ladders=LAD;
  const PL=9*T, PW=1.2*T, PIERS=LAD.filter((x,i)=>i%3===1); RIVER.piers=PIERS; const POSTS=[]; for(const px of PIERS)for(let k=0;k<4;k++)for(const o of [-1,1])POSTS.push([px+o*1.0*T,rz1-(1.2+2.4*k)*T,.16*T]);
  const onPier=(x,z)=>PIERS.some(px=>Math.abs(x-px)<PW&&z>rz1-PL&&z<rz1);
  { const B=[]; const steel=[.5,.52,.55], iron=[.17,.18,.2], box=(x0,y0,z0,x1,y1,z1,c)=>B.push([x0,y0,z0,x1,y1,z1,c]);
    const rz=rz1+.3*T, m=1/WU;
    const wood=[.42,.31,.2];
    for(const px of PIERS){ for(let z=rz1-PL;z<rz1;z+=.5*T)box(px-PW,-.14*WU,z+.02*T,px+PW,0,z+.48*T,[wood[0]*(.85+.3*hash(px|0,z*7|0)),wood[1]*(.85+.3*hash(px|0,z*7|0)),wood[2]*(.85+.3*hash(px|0,z*7|0))]);
      for(const [x,z,r] of POSTS)if(Math.abs(x-px)<2*T)box(x-r,LV-10*WU,z-r,x+r,-.14*WU,z+r,[.3,.22,.15]);
      for(const o of [-.32,.32])box(px+o*T-.03*T,LV-1.6*WU,rz1-PL-.07*T,px+o*T+.03*T,1.0*WU,rz1-PL-.01*T,steel); for(let y=LV-1.4*WU;y<-.05*WU;y+=.3*WU)box(px-.32*T,y,rz1-PL-.07*T,px+.32*T,y+.04*WU,rz1-PL-.01*T,steel); }
    for(const lx of LAD){ for(const o of [-.32,.32]){ const x=lx+o*T; box(x-.03*T,LV-1.6*WU,rz1-.09*T,x+.03*T,1.0*WU,rz1-.03*T,steel); }
      for(let y=LV-1.4*WU;y<-.05*WU;y+=.3*WU)box(lx-.32*T,y,rz1-.09*T,lx+.32*T,y+.04*WU,rz1-.03*T,steel); }
    let a=fx0; const span=(a,b)=>{ if(b-a<.3*T)return; for(let x=a;x<=b+1e-6;x+=Math.max(.5*T,(b-a)/Math.ceil((b-a)/(2.5*T))))box(x-.05*T,0,rz-.05*T,x+.05*T,1.0*WU,rz+.05*T,iron);
      box(a,.92*WU,rz-.04*T,b,1.0*WU,rz+.04*T,iron); box(a,.45*WU,rz-.03*T,b,.5*WU,rz+.03*T,iron); SOL.up.push([a,rz-.1*T,b,rz+.1*T]); FIX.up.push([a,rz-.1*T,0,b,rz+.1*T,1.0*WU]); };
    for(const lx of LAD){ const g=PIERS.includes(lx)?PW+.1*T:.9*T; span(a,lx-g); a=lx+g; } span(a,fx1);
    const geo=new THREE.BoxGeometry(1,1,1), im=new THREE.InstancedMesh(geo,selfLit(new THREE.MeshLambertMaterial({color:0xffffff})),B.length), M=new THREE.Matrix4(), C=new THREE.Color();
    B.forEach((b,i)=>{ M.makeScale(b[3]-b[0],b[4]-b[1],b[5]-b[2]); M.setPosition((b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2); im.setMatrixAt(i,M); im.setColorAt(i,C.setRGB(...b[6])); });
    im.castShadow=true; im.receiveShadow=true; scene.add(im); RIVER.kit=im; RIVER.kitN=B.length; }

  const fishG=(()=>{ const s=.26*T, P=[[s,0,0],[0,.35*s,0],[0,0,.18*s],[0,-.3*s,0],[0,0,-.18*s],[-.9*s,0,0],[-1.3*s,.3*s,0],[-1.3*s,-.3*s,0]],
      F=[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4],[5,6,7],[5,7,6]], pos=[]; for(const f of F)for(const v of f)pos.push(...P[v]);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.computeVertexNormals(); return g; })();
  const NF=36, fishM=new THREE.InstancedMesh(fishG,new THREE.MeshBasicMaterial({color:0xffffff}),NF); fishM.frustumCulled=false; scene.add(fishM);
  const FISH=[], SCH=[]; const seedFish=()=>{ FISH.length=0; SCH.length=0; const Wt=WATERS[RIVER.wi], C=new THREE.Color();
    for(let s=0;s<3;s++)SCH.push({x:0,z:0,y:0,tx:0,tz:0,ty:0,t:0,set:false});
    for(let i=0;i<NF;i++){ FISH.push({s:SCH[i%3],x:0,y:0,z:0,vx:0,vy:0,vz:0,o:[Math.random()*2-1,Math.random()*2-1,Math.random()-.5],big:Wt.bed===0&&i===NF-1}); fishM.setColorAt(i,C.setRGB(...Wt.fish[i%Wt.fish.length])); }
    fishM.instanceColor.needsUpdate=true; };
  const buoyG=new THREE.Group(); { const red=new THREE.MeshLambertMaterial({color:0xb0302a}), white=new THREE.MeshLambertMaterial({color:0xece9e2}), dark=new THREE.MeshLambertMaterial({color:0x1b1c1f}), r=.32*T;
    const add=(g,m,y)=>{ const o=new THREE.Mesh(g,m); o.position.y=y; buoyG.add(o); };
    add(new THREE.CylinderGeometry(r,r*.85,.35*T,8),red,0); add(new THREE.CylinderGeometry(r*.9,r,.18*T,8),white,.26*T); add(new THREE.ConeGeometry(r*.9,.5*T,8),red,.6*T); add(new THREE.CylinderGeometry(.03*T,.03*T,.4*T,4),dark,1.0*T); }
  const BUOYS=[]; for(let x=fx0+25*T;x<fx1;x+=45*T){ const b=buoyG.clone(); b.traverse(o=>{ if(o.isMesh)o.castShadow=true; }); scene.add(b); const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0x2a2622})); ln.frustumCulled=false; scene.add(ln); BUOYS.push({m:b,ln,x,z:rz1-14*T}); }
  const junk=new THREE.Group(); scene.add(junk);
  const seedJunk=()=>{ while(junk.children.length)junk.remove(junk.children[0]); if(WATERS[RIVER.wi].bed!==0)return; const tyre=new THREE.MeshLambertMaterial({color:0x1a1a1c}), glass=new THREE.MeshLambertMaterial({color:0x3f7a4c});
    for(let x=fx0+12*T;x<fx1;x+=31*T){ const z=rz1-(6+((x/T)%11))*T, t=new THREE.Mesh(new THREE.TorusGeometry(.3*T,.12*T,5,10),tyre); t.rotation.x=Math.PI/2; t.position.set(x,LV-depthAt(x,z)*WU+.1*T,z); junk.add(t);
      for(let k=0;k<3;k++){ const bx=x+(k*2.3-2)*T, bz=z-(k*1.7+1)*T, b=new THREE.Mesh(new THREE.CylinderGeometry(.06*T,.06*T,.3*T,5),glass); b.rotation.z=Math.PI/2; b.rotation.y=k; b.position.set(bx,LV-depthAt(bx,bz)*WU+.06*T,bz); junk.add(b); } } };

  const NGR=900, grG=new THREE.BufferGeometry(); grG.setAttribute('position',new THREE.Float32BufferAttribute([-.04,0,0, .04,0,0, 0,1,0],3)); grG.computeVertexNormals();
  const grMat=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}); grMat.onBeforeCompile=sh=>{ sh.uniforms.uT=uT0; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    { vec4 o=instanceMatrix*vec4(0.,0.,0.,1.); float k=position.y*position.y; transformed.x+=k*.35*sin(uT*.9+o.x*.7+o.z*.3); transformed.z+=k*.25*sin(uT*1.3+o.x*.4); }`); };
  const grass=new THREE.InstancedMesh(grG,grMat,NGR); grass.frustumCulled=false; scene.add(grass);
  const seedGrass=()=>{ const Wt=WATERS[RIVER.wi], M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), Sc=new THREE.Vector3(), C=new THREE.Color(); let n=0;
    for(let i=0;i<NGR;i++){ const cI=i>>3, x=RIVER.cx+(hash(cI,(RIVER.cx/T)|0)-.5)*WIN*.6+(hash(i,11)-.5)*.9*T, z=rz1-(.6+Math.pow(hash(cI,77),1.6)*22)*T+(hash(i,12)-.5)*.9*T, d=depthAt(x,z); if(Wt.bed===1&&hash(i,5)<.6)continue;
      const h=(Wt.bed===1?3+hash(i,9)*3:.25+hash(i,9)*.35)*WU; Q.setFromAxisAngle(V.set(0,1,0),hash(i,3)*6.3); M.compose(V.set(x,LV-d*WU,z),Q,Sc.set(WU*2.2,h,WU*2.2)); grass.setMatrixAt(n,M);
      const g=Wt.bed===2?[.22,.5,.2]:Wt.bed===1?[.42,.34,.13]:[.3,.38,.18]; grass.setColorAt(n,C.setRGB(g[0]*(.8+.4*hash(i,4)),g[1]*(.8+.4*hash(i,4)),g[2])); n++; }
    grass.count=n; grass.instanceMatrix.needsUpdate=true; if(grass.instanceColor)grass.instanceColor.needsUpdate=true; };
  const SP={n:0,max:400,p:new Float32Array(1200),v:new Float32Array(1200)}, spg=new THREE.BufferGeometry(); spg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(1200),3)); spg.setDrawRange(0,0);
  const spm=new THREE.Points(spg,new THREE.PointsMaterial({color:0xdff3ff,size:2,sizeAttenuation:false})); spm.frustumCulled=false; scene.add(spm);
  const splash=(x,y,z,n,sp)=>{ for(let k=0;k<n&&SP.n<SP.max;k++){ const i=SP.n++, a=Math.random()*Math.PI*2, up=.5+Math.random()*.8, out=Math.random()*.7; SP.p.set([x,y+.02,z],i*3); SP.v.set([Math.cos(a)*out*sp,up*sp,Math.sin(a)*out*sp],i*3); } };
  const spray=dt=>{ const g=9.81*WU; let k=0; for(let i=0;i<SP.n;i++){ const p=SP.p, v=SP.v; v[i*3+1]-=g*dt; for(let q=0;q<3;q++)p[i*3+q]+=v[i*3+q]*dt; const x=p[i*3], y=p[i*3+1], z=p[i*3+2];
      if(y<LV+hAt(x,z)&&v[i*3+1]<0){ RIVER.drop(x,z,.12*T,.004*WU); continue; } if(k!==i)for(let q=0;q<3;q++){ p[k*3+q]=p[i*3+q]; v[k*3+q]=v[i*3+q]; } k++; }
    SP.n=k; spg.attributes.position.array.set(SP.p.subarray(0,k*3)); spg.attributes.position.needsUpdate=true; spg.setDrawRange(0,k); };
  const sound=(s,muff)=>{ try{ const c=SFX.live&&SFX.live(); if(!c||!SFX.on)return; const n=Math.floor(c.sampleRate*.8), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); let l=0; for(let i=0;i<n;i++){ l=(l+.05*(Math.random()*2-1))/1.05; d[i]=l*4*Math.exp(-i/n*(5-s*2)); }
    const src=c.createBufferSource(); src.buffer=b; const f=c.createBiquadFilter(); f.type=muff?'lowpass':'bandpass'; f.frequency.value=muff?300:1300; f.Q.value=.6; const G=c.createGain(); G.gain.value=(.25+s*.5)*SFX.vol; src.connect(f).connect(G).connect(c.destination); src.start(); }catch(e){} };

  RIVER.over=(x,z)=>LVL==='up'&&x>lx0&&x<lx1&&z>rz0&&z<rz1;
  RIVER.air=1; RIVER.dep=0; RIVER.bot=0; let wasIn=false, wake=0, noAir=false, wasUnder=false;
  RIVER.feed=(st,pos,dt,go,keys)=>{ if(!RIVER.over(pos.x,pos.z)||!RIVER.swim&&onPier(pos.x,pos.z)){ RIVER.swim=false; if(wasIn)wasIn=false; return false; }
    const h=hAt(pos.x,pos.z), lvl=(LV+h)/ZU, floor=(LV-depthAt(pos.x,pos.z)*WU)/ZU;
    const W=RIG.water(st,{level:lvl,floor}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0; RIVER.swim=W.in;
    const under=W.in&&W.y<lvl-34; RIVER.air=under?Math.max(0,RIVER.air-dt/24):Math.min(1,RIVER.air+dt/3); if(RIVER.air<=0)noAir=true; if(noAir&&RIVER.air>.33)noAir=false; if(noAir)W.dive=false;
    RIVER.dep=Math.max(0,(lvl-34-W.y)*ZU*MPU); RIVER.bot=(lvl-floor)*ZU*MPU;
    if(under!==wasUnder){ wasUnder=under; if(!under&&W.in)sound(.1,false); }
    if(W.in&&!wasIn){ RIVER.drop(pos.x,pos.z,.55*T,.09*WU); splash(pos.x,LV+h,pos.z,70,2.6); sound(.8,false); }
    wasIn=W.in;
    for(const e of W.events)if(e.k==='splash'){ RIVER.drop(pos.x,pos.z,.5*T,Math.min(.14,.02+e.v*.0009)*WU); splash(pos.x,LV+h,pos.z,Math.min(90,20+e.v*.5),Math.min(3,1+e.v*.015)); sound(Math.min(1,e.v/120),false); } W.events.length=0;
    wake-=dt; if(W.in&&wake<0){ wake=.07; const s=(go?.016:.006)*(1+W.fast)*WU*.6; RIVER.drop(pos.x+(Math.random()-.5)*.25,pos.z+(Math.random()-.5)*.25,.35*T,s); if(go&&!W.dive&&Math.random()<.35)splash(pos.x,LV+h,pos.z,3+(W.fast?4:0),1.1); }
    if(W.in&&keys.has(' ')&&pos.z>rz1-1.1*T&&W.y>lvl-40){ const pe=PIERS.find(x=>Math.abs(x-pos.x)<.8*T&&pos.z<rz1-PL&&pos.z>rz1-PL-1.1*T); if(pe!=null){ W.in=false; W.dive=false; st.water.level=null; pos.x=pe; pos.z=rz1-PL+.8*T; RIVER.swim=false; wasIn=false; sound(.05,false); if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; }
      const lx=LAD.find(x=>Math.abs(x-pos.x)<.8*T); if(pe==null&&lx!=null){ W.in=false; W.dive=false; st.water.level=null; pos.x=lx; pos.z=rz1+.7*T; RIVER.swim=false; wasIn=false; sound(.05,false); if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; } }
    return true; };
  RIVER.clamp=pos=>{ const m=.35*T; pos.x=cl(pos.x,lx0+m,lx1-m); pos.z=cl(pos.z,rz0+m,rz1-m); for(const [x,z,r] of POSTS){ const dx=pos.x-x, dz=pos.z-z, d=Math.hypot(dx,dz), R0=r+.3*T; if(d<R0&&d>1e-4){ pos.x=x+dx/d*R0; pos.z=z+dz/d*R0; } } };

  const save=()=>{ try{ SAVE.set('river',JSON.stringify({way:RIVER.way,wi:RIVER.wi,step:RIVER.step})); }catch(e){} };
  try{ const s=JSON.parse(SAVE.get('river')||'null'); if(s){ RIVER.way=s.way||RIVER.way; RIVER.wi=s.wi|0; } }catch(e){} RIVER.step=true;
  if(QSr.get('river'))RIVER.way=QSr.get('river'); if(QSr.get('water'))RIVER.wi=Math.max(0,'abc'.indexOf(QSr.get('water')));
  const applyWater=()=>{ const Wt=WATERS[RIVER.wi]; setWaves(); SU.uNW.value=WV.length; SU.uSig.value.set(...Wt.sig); SU.uScat.value.set(...Wt.scat); SU.uFoam.value=Wt.foam; SU.uRefr.value=Wt.refr; uBedK.value=Wt.bed;
    uCau.value=Wt.bed===0?.35:Wt.bed===1?.7:1; RIVER.cx=1e9; seedFish(); seedJunk(); };
  RIVER.set=(o={})=>{ if(o.way)RIVER.way=o.way; if(o.wi!=null){ RIVER.wi=o.wi; applyWater(); } if(o.step!=null)RIVER.step=o.step; save(); RIVER.panel&&RIVER.panel(); };
  applyWater();

  const F=new THREE.Frustum(), M4=new THREE.Matrix4(), bb=new THREE.Box3();
  RIVER.tick=(dt,pos)=>{ RIVER.t+=dt; uT0.value=RIVER.t; const up=OUT.world, way=RIVER.way;
    const cx=snapX(pos.x); if(Math.abs(cx-RIVER.cx)>1){ RIVER.cx=cx; buildBed(); setFlats(); surf.position.set(cx,LV,(rz0+rz1)/2); SU.uWin.value.set(cx-WIN/2,cx+WIN/2,0,0); SU.uBedR.value.set(cx-WIN/2,rz0,WIN,DZ); }
    const real=way!=='flat'; surf.visible=up&&real; bed.visible=up&&real; flatL.visible=flatR.visible=up&&real; flatAll.visible=up&&!real; fishM.visible=junk.visible=grass.visible=up&&real;
    for(const k of ['wallN','wallS'])RIVER[k].visible=up; cope.visible=RIVER.kit.visible=spm.visible=up; for(const B of BUOYS)B.m.visible=B.ln.visible=up;
    surfMat.transparent=way==='swell'; surfMat.depthWrite=way!=='swell'; SU.uMode.value=way==='swell'?1:way==='fluid'?2:0; SU.uStep.value=RIVER.step?1:0;
    SU.uAmp.value=1; uRipOn.value=way==='full'||way==='fluid'?1:0;
    const S=CLOCK.sun; uSunD.value.copy(CLOCK.sunV); SU.uSunC.value.copy(S.color).multiplyScalar(Math.min(1.4,S.intensity)); if(window.SKY&&SKY.U){ SU.uSkyH.value.copy(SKY.U.uH.value); SU.uSkyZ.value.copy(SKY.U.uZ.value); FU.uSky.value.copy(SKY.U.uH.value); }
    SU.uAmb.value.copy(SU.uSkyZ.value).multiplyScalar(.55).addScalar(.03); uAmbB.value.copy(SU.uSkyZ.value).multiplyScalar(.6).add(SU.uSkyH.value.clone().multiplyScalar(.25)); uSunCB.value.copy(SU.uSunC.value).multiplyScalar(.75); FU.uDay.value=cl((CLOCK.elev()+4)/14,.15,1);
    LITE.pool.forEach((Lp,i)=>{ if(i>=8)return; SU.uLP.value[i].copy(Lp.position); SU.uLC.value[i].set(Lp.color.r,Lp.color.g,Lp.color.b).multiplyScalar(Math.min(1,Lp.intensity/3)); });
    if(real&&up){ const C=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), Sv=new THREE.Vector3(), Pv=new THREE.Vector3();
      for(const s of SCH){ s.t-=dt; if(!s.set||s.t<=0||Math.abs(s.x-pos.x)>26*T){ s.t=3+Math.random()*4; s.tx=cl(pos.x+(Math.random()*2-1)*14*T,lx0+2*T,lx1-2*T); s.tz=rz1-(2+Math.random()*16)*T; if(!s.set){ s.x=s.tx; s.z=s.tz; s.set=true; s.y=LV-1.5*WU; } }
        const bz=LV-depthAt(s.tx,s.tz)*WU; s.ty=bz+(LV-bz)*(.3+.4*Math.sin(RIVER.t*.1+s.tx)); s.x+=(s.tx-s.x)*dt*.25; s.z+=(s.tz-s.z)*dt*.25; s.y+=(s.ty-s.y)*dt*.3; }
      FISH.forEach((f,i)=>{ const s=f.s, tx=s.x+f.o[0]*1.4*T, tz=s.z+f.o[1]*1.4*T, ty=s.y+f.o[2]*WU; let ax=(tx-f.x)*1.2, ay=(ty-f.y)*1.2, az=(tz-f.z)*1.2;
        if(RIVER.swim){ const dx=f.x-pos.x, dy=f.y-(LV-1*WU), dz=f.z-pos.z, d=Math.hypot(dx,dy,dz)+1e-3; if(d<3*T){ ax+=dx/d*9*T; ay+=dy/d*4*T; az+=dz/d*9*T; } }
        if(!f.x&&!f.z){ f.x=tx; f.y=ty; f.z=tz; }
        const k=Math.exp(-1.2*dt); f.vx=(f.vx+ax*dt)*k; f.vy=(f.vy+ay*dt)*k; f.vz=(f.vz+az*dt)*k; f.x+=f.vx*dt; f.y+=f.vy*dt; f.z=cl(f.z+f.vz*dt,rz0+.4*T,rz1-.4*T);
        f.y=cl(f.y,LV-depthAt(f.x,f.z)*WU+.3*WU,LV-.35*WU); E.set(0,Math.atan2(-f.vz,f.vx),cl(f.vy/(Math.hypot(f.vx,f.vz)+1e-3),-.6,.6)); Q.setFromEuler(E); const sc=f.big?2.2:1; C.compose(Pv.set(f.x,f.y,f.z),Q,Sv.set(sc,sc,sc)); fishM.setMatrixAt(i,C); });
      fishM.instanceMatrix.needsUpdate=true; }
    for(const B of BUOYS){ const h=hAt(B.x,B.z), [sx,sz]=slopeAt(B.x,B.z); B.m.position.set(B.x,LV+h-.12*T,B.z); B.m.rotation.set(-sz*.8,0,sx*.8); const a=B.ln.geometry.attributes.position; a.setXYZ(0,B.x,LV+h-.2*T,B.z); a.setXYZ(1,B.x+.8*T,LV-depthAt(B.x,B.z)*WU,B.z-.5*T); a.needsUpdate=true; }
    spray(Math.min(dt,1/30)); };

  const UF=new THREE.Fog(0x000000,0,1), bg0=new THREE.Color(); let fog0=null, uw=false;
  const RQ=[[-1,-1],[1,-1],[1,1],[-1,1]], V8=new THREE.Vector3(), SEE=()=>{ if(!cam.isOrthographicCamera)return F.intersectsBox(bb); const Q=[]; for(let k=0;k<8;k++){ V8.set(k&1?bb.max.x:bb.min.x,k&2?bb.max.y:bb.min.y,k&4?bb.max.z:bb.min.z).applyMatrix4(M4); Q.push([V8.x,V8.y]); }
    for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){ const nx=Q[j][1]-Q[i][1], ny=Q[i][0]-Q[j][0]; if(!nx&&!ny)continue; const d=p=>p[0]*nx+p[1]*ny, a=Q.map(d), lo=Math.min(...a), hi=Math.max(...a), r=RQ.map(d); if(r.every(x=>x<lo)||r.every(x=>x>hi))return false; }
    return !(Q.every(p=>p[0]>1)||Q.every(p=>p[0]<-1)||Q.every(p=>p[1]>1)||Q.every(p=>p[1]<-1)); };
  RIVER.pre=(renderer,scene,cam,dt,pos)=>{ const up=OUT.world;
    const fl=RIVER.way==='fluid'; if((RIVER.way==='full'||fl)&&up&&RIVER.over(pos.x,Math.min(pos.z,rz1-1))&&pos.z<rz1+30*T){ const c=SG/SW, want=[Math.round((pos.x-SW/2)*c)/c,Math.round((Math.max(rz0,Math.min(pos.z,rz1))-SW/2)*c)/c];
      if(SIM.drops.length)SIM.quiet=0; else SIM.quiet+=dt;
      if(Math.abs(want[0]-SIM.x0)>8*T||Math.abs(want[1]-SIM.z0)>8*T){ simMat.uniforms.uShift.value.set((want[0]-SIM.x0)/SW,(want[1]-SIM.z0)/SW); SIM.x0=want[0]; SIM.z0=want[1]; uRect.value.set(SIM.x0,SIM.z0,SW,SW); SIM.acc=1/120; }
      { const near=POSTS.filter(q=>Math.abs(q[0]-pos.x)<26*T).slice(0,16); near.forEach((q,i)=>uPost.value[i].set(q[0],q[1],q[2])); uNPost.value=near.length; }
      if(fl)SIM.quiet=0; const su=simMat.uniforms; su.uBed.value=bedTex; su.uBedR.value=SU.uBedR.value; su.uWA.value=WA; su.uWB.value=WB; su.uNW.value=WV.length; uForce.value=fl?1:0;
      if(SIM.quiet<6){ const H=1/120; SIM.acc=Math.min(SIM.acc+dt,6*H); const u=simMat.uniforms;
        while(SIM.acc>=H){ SIM.acc-=H; u.uN.value=SIM.drops.length; SIM.drops.forEach((d,i)=>u.uDrop.value[i].set(...d)); SIM.drops.length=0; u.uPrev.value=SIM.A.texture; RIVER.st=(RIVER.st||0)+H; u.uTime.value=RIVER.t;
          renderer.setRenderTarget(SIM.B); renderer.render(simScene,simCam); [SIM.A,SIM.B]=[SIM.B,SIM.A]; u.uShift.value.set(0,0); }
        uRip.value=SIM.A.texture; }
      else if(SIM.quiet<7){ const cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(); renderer.setClearColor(0,0); for(const Tg of [SIM.A,SIM.B]){ renderer.setRenderTarget(Tg); renderer.clear(true,false,false); } renderer.setClearColor(cc,ca); renderer.setRenderTarget(null); SIM.quiet=99; } }
    else SIM.drops.length=0;
    if(surf.visible){ M4.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(M4); bb.min.set(RIVER.cx-WIN/2,LV-WU,rz0); bb.max.set(RIVER.cx+WIN/2,LV+2*WU,rz1); if(cam.position.y>LV+2*WU&&!SEE())surf.visible=bed.visible=fishM.visible=junk.visible=grass.visible=false; }
    if((RIVER.way==='full'||fl)&&surf.visible){
      if(cam.position.y<=LV+2*WU||SEE()){ const w=renderer.domElement.width, h=renderer.domElement.height; if(RT.width!==w||RT.height!==h)RT.setSize(w,h); SU.uRes.value.set(w,h); SU.uNear.value=cam.near; SU.uFar.value=cam.far; cam.getWorldDirection(SU.uCamD.value);
        surf.visible=false; spm.visible=false; renderer.setRenderTarget(RT); renderer.render(scene,cam); renderer.setRenderTarget(null); surf.visible=true; spm.visible=true; } }
    else cam.getWorldDirection(SU.uCamD.value);
    const cp=cam.position; uw=up&&RIVER.over(cp.x,cp.z)&&cp.y<LV+hAt(cp.x,cp.z); if(uw){ const Wt=WATERS[RIVER.wi], k=SU.uScat.value, a=SU.uAmb.value, s=SU.uSunC.value;
      UF.color.setRGB(k.x*(a.r+s.r*.7)*1.3,k.y*(a.g+s.g*.7)*1.3,k.z*(a.b+s.b*.7)*1.3); UF.near=0; UF.far=(2.2/Math.min(...Wt.sig.slice(1)))*WU; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color); } };
  RIVER.post=scene=>{ if(uw){ scene.fog=fog0; scene.background.copy(bg0); uw=false; } };

  const css=document.createElement('style'); css.textContent=`#rvhud{position:fixed;left:12px;bottom:64px;z-index:20;background:#0e1016;border:2px solid #3a3f4e;padding:6px 10px;font:12px Silkscreen,monospace;color:#9aa3b5;display:none}
    #rvhud b{color:#8fe3d6;font-weight:400} #rvhud .air{width:140px;height:8px;border:2px solid #3a3f4e;margin-top:5px} #rvhud .air i{display:block;height:100%;background:#8fe3d6} #rvhud .air.low i{background:#f0b45a}
    #rvpan{position:fixed;left:12px;top:12px;z-index:30;width:300px;background:#0e1016;border:2px solid #3a3f4e;padding:10px 12px 12px;font:12px Silkscreen,monospace;color:#cfd6e4;max-height:calc(100vh - 24px);overflow:auto}
    #rvpan h3{margin:0 30px 2px 0;font:14px Silkscreen,monospace;color:#f2c14e} #rvpan .d{color:#8a8f9c;margin:2px 0 8px;line-height:1.45;font-size:11px;font-family:ui-sans-serif,system-ui,sans-serif}
    #rvpan .r{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0} #rvpan .l{color:#8a8f9c;margin-top:8px} #rvpan button{font:11px Silkscreen,monospace;color:#cfd6e4;background:#161a24;border:2px solid #3a3f4e;padding:5px 7px;cursor:pointer}
    #rvpan button.on{border-color:#8fe3d6;color:#8fe3d6;background:#1b2b30} #rvpan button:hover{border-color:#f2c14e}`;
  document.head.appendChild(css);
  const hud=document.createElement('div'); hud.id='rvhud'; hud.innerHTML='depth <b id="rvd">0.0 m</b> &nbsp;bed <span id="rvb">0.0 m</span><div class="air" id="rva"><i id="rvai"></i></div>'; document.body.appendChild(hud);
  const pan=document.createElement('div'); pan.id='rvpan'; document.body.appendChild(pan);   const WAYS=[['flat','FLAT','The river as it was: one painted sheet, glints drifting. You can still swim. 2 triangles.'],
    ['swell','SWELL','Waves on the graphics card (the mockup\'s swell and chop), the sky and the sun in them, foam on the crests; the murk laid over the bed by its depth. ~8,000 triangles, no extra pass.'],
    ['fluid','FLUID','Completely fluid: the water round you (48 tiles) is a wave simulation. The sea\'s waves come in at its open sides, slow over the shallows, bend, steepen, come back off the quay and round the pier\'s posts, and meet your splashes and wakes; seen through, bent, coloured by the depth; caustics on the bed. ~8,000 triangles + one extra scene pass.'],
    ['full','FULL','All of the mockup: the waves, ripples round you (splashes, wakes, back off the wall), the bed and you seen through it, bent and coloured by the depth, caustics on the bed. ~8,000 triangles + one extra scene pass while it shows.']];
  const HOURS=[['DAY',13],['DUSK',18.2],['NIGHT',22.5]];
  RIVER.panel=()=>{ const Wt=WATERS[RIVER.wi], wy=WAYS.find(w=>w[0]===RIVER.way)||WAYS[2];
    pan.innerHTML=`<h3>THE HUDSON · REAL WATER</h3><div class="d">Ways of doing the river, side by side (double click the water to bring this back). Walk off the quay (or jump) to swim; SPACE dives, SPACE at a ladder climbs out.</div>
      <div class="l">WAY</div><div class="r">${WAYS.map(w=>`<button data-w="${w[0]}" class="${w[0]===RIVER.way?'on':''}">${w[1]}</button>`).join('')}</div><div class="d">${wy[2]}</div>
      <div class="l">WATER</div><div class="r">${WATERS.map((w,i)=>`<button data-i="${i}" class="${i===RIVER.wi?'on':''}">${w.name}</button>`).join('')}</div><div class="d">${Wt.desc}</div>
      <div class="l">LOOK</div><div class="r"><button data-s="1" class="${RIVER.step?'on':''}">24 STEPS</button></div>
      <div class="l">TIME</div><div class="r">${HOURS.map(h=>`<button data-h="${h[1]}">${h[0]}</button>`).join('')}</div>
      <div class="r" style="margin-top:10px"><button data-go="1">GO TO THE RIVER</button><button data-go="2">INTO THE WATER</button></div>`;
    const x=document.createElement('button'); x.className='pX'; x.textContent='X'; x.onclick=()=>{ pan.hidden=true; }; pan.appendChild(x);
    pan.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>RIVER.set({way:b.dataset.w}));
    pan.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>RIVER.set({wi:+b.dataset.i}));
    pan.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>RIVER.set({step:b.dataset.s==='1'}));
    pan.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{ CLOCK.h=+b.dataset.h; });
    pan.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ const x=cl(pos.x,fx0+12*T,fx1-12*T), lx=PIERS.reduce((a,c)=>Math.abs(c-x)<Math.abs(a-x)?c:a,PIERS[0]);
      if(b.dataset.go==='1')STORE.goTo(lx-3*T,rz1+1.6*T,'up'); else STORE.goTo(lx-3*T,rz1-4*T,'up'); if(UI.view==='iso'&&UI.isoTurn)UI.isoTurn(Math.PI*3/4); }); };
  RIVER.panel(); pan.hidden=QSr.get('rvpanel')!=='1';
  const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-LV), ph=new THREE.Vector3();
  RIVER.pick=(ray,pos)=>{ if(LVL!=='up'||!ray.intersectPlane(pl,ph)||!RIVER.over(ph.x,ph.z)||onPier(ph.x,ph.z)||Math.hypot(ph.x-pos.x,ph.z-pos.z)>40*T)return false; pan.hidden=false; return true; };
  RIVER.hud=()=>{ if(!RIVER.swim){ hud.style.display='none'; return; } hud.style.display='block'; document.getElementById('rvd').textContent=RIVER.dep.toFixed(1)+' m'; document.getElementById('rvb').textContent=RIVER.bot.toFixed(1)+' m';
    document.getElementById('rvai').style.width=(RIVER.air*100).toFixed(0)+'%'; document.getElementById('rva').classList.toggle('low',RIVER.air<.3); };
  RIVER.U={SU,uCau,uRipOn,SIM,surf,bed,grass,kit:RIVER.kit}; RIVER.on=true; window.RIVER=RIVER; }
