// THE RIVER: RIVER builds the river, its banks and its moving water past the edge of town.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FLOW, LITE, pos, ROOMS, SFX, SKY, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {BLOCK, FADE, FIX, LEVEL, MODS, OUT, RING, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
const RIVER={way:'fluid',wi:0,step:true,t:0,on:false};
Object.assign(RIVER,{onBuild:[],pickers:[],feed:()=>false,over:()=>false,clamp:()=>{},tick:()=>{},pre:()=>{},post:()=>{},hud:()=>{},pick:()=>false,swim:false,shown:false}); window.RIVER=RIVER;
const RIVERG=new THREE.Group(); RIVERG.name='river'; RIVERG.visible=false; scene.add(RIVERG);
// the water surface's shader, every water's (the river's, the lake's), and what every surface shares (the sun, the sky, the lamps, the clock, FLOW's ripples), kept out here so a lake can wear the river's water before the river is built
const SURF=(()=>{ const T=TILE, MPU=.84/T, NW=8, GLN=`float rh(vec2 p){ p=fract(p*vec2(.1031,.1030)); p+=dot(p,p.yx+33.33); return fract((p.x+p.y)*p.x); }
    float rn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(rh(i),rh(i+vec2(1.,0.)),f.x),mix(rh(i+vec2(0.,1.)),rh(i+vec2(1.,1.)),f.x),f.y); }
    float rf(vec2 p){ return rn(p)*.5+rn(p*2.1+5.)*.3+rn(p*4.3+9.)*.2; }`;
  return {gln:GLN,NW,
    vertexShader:`uniform float uT,uAmp,uRT,uRipOn,uMode; uniform vec4 uWA[${NW}],uWB[${NW}],uWin,uRect,uPier; uniform int uNW; uniform sampler2D uRip; uniform vec2 uBank;
      varying vec3 vW; varying vec2 vP0; varying float vVz, vH;
      void main(){ vec4 w=modelMatrix*vec4(position,1.); vec2 p=w.xz; vP0=p;
        float fe=uAmp*clamp(min(p.x-uWin.x,uWin.y-p.x)/${(10*T).toFixed(3)},0.,1.), fz=clamp(min(p.y-uBank.x,uBank.y-p.y)/${(1.5*T).toFixed(3)},0.,1.);
        if(uMode>1.5){ vec2 q=(p-uRect.xy)/uRect.zw; fe*=1.-.7*clamp(min(min(q.x,1.-q.x),min(q.y,1.-q.y))*uRect.z/${(4*T).toFixed(3)},0.,1.); }
        { vec2 q=max(max(uPier.xy-p,p-uPier.zw),0.); fe*=.15+.85*clamp(length(q)/${(4*T).toFixed(3)},0.,1.); }   // the swell lies low under and by the pier, never up through its deck (owner, 8 Nov 2026: "there is also a large gap in the floor pier")
        vec3 d=vec3(0.); for(int i=0;i<${NW};i++){ if(i>=uNW)break; vec4 a=uWA[i], b=uWB[i]; float th=a.z*dot(a.xy,p)-a.w*uT+b.z, c=cos(th), s=sin(th);
          d.x+=b.y*b.x*a.x*c*fz; d.z+=b.y*b.x*a.y*c*fz; d.y+=b.x*s; }
        d*=fe; vec2 ru=(p-uRect.xy)/uRect.zw; if(uRipOn>0.&&ru.x>0.&&ru.y>0.&&ru.x<1.&&ru.y<1.)d.y+=texture2D(uRip,ru).r;
        w.xyz+=d; vW=w.xyz; vH=d.y; vec4 mv=viewMatrix*w; vVz=mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`#include <packing>
      uniform float uUW,uUWF; uniform vec3 uUWC; uniform vec2 uMe; uniform float uT,uAmp,uRT,uRipOn,uNear,uFar,uMode,uFoam,uRefr,uLv,uStep,uRefl; uniform vec3 uHi; uniform vec4 uWA[${NW}],uWB[${NW}],uWin,uRect,uBedR; uniform int uNW; uniform vec2 uRes,uBank;
      uniform sampler2D uRip,uScene,uDepth,uBed; uniform vec3 uSig,uScat,uSunD,uSunC,uAmb,uSkyH,uSkyZ,uCamD,uLP[8],uLC[8];
      varying vec3 vW; varying vec2 vP0; varying float vVz, vH;
      ${GLN}
      float vz(float d){ return isOrthographic?orthographicDepthToViewZ(d,uNear,uFar):perspectiveDepthToViewZ(d,uNear,uFar); }
      vec3 sky(float y){ return mix(uSkyH,uSkyZ,pow(clamp(y,0.,1.),.7)); }
      void main(){ vec2 p=vP0; float fe=uAmp*(.3+1.4*rf(p*${(.03/T).toFixed(5)}+vec2(uT*.011,-uT*.008)));   // the swell comes and goes across the water, so the waves never read as one pattern (owner, 8 Nov 2026: "the water is just one big pattern repeated")   // the waves' look (normals, glints, foam) everywhere the water is, near or far; only the near strip's surface rises and falls (owner, 7 Nov 2026: "the water looks the same as far as you can see it")
        if(uMode>1.5){ vec2 q=(p-uRect.xy)/uRect.zw; fe*=1.-.7*clamp(min(min(q.x,1.-q.x),min(q.y,1.-q.y))*uRect.z/${(4*T).toFixed(3)},0.,1.); }
        vec3 n=vec3(0.,1.,0.); float jxx=1.,jzz=1.,jxz=0.;
        // the water moves only near you (owner, 8 Nov 2026: "the water should not be nonstop moving from this far. only do motion of water near you"): moving within 30 tiles, still past 60, both worked out between and blended
        float kM=smoothstep(${(30*T).toFixed(3)},${(60*T).toFixed(3)},length(vW.xz-uMe));
        for(int ps=0;ps<2;ps++){ float wq=ps==0?1.-kM:kM, tt=ps==0?uT:0.; if(wq<=0.)continue;
        for(int i=0;i<${NW};i++){ if(i>=uNW)break; vec4 a=uWA[i], b=uWB[i]; float th=a.z*dot(a.xy,p)-a.w*tt+b.z, c=cos(th), s=sin(th), wa=a.z*b.x*fe*wq;
          n.x-=a.x*wa*c; n.z-=a.y*wa*c; n.y-=b.y*wa*s; jxx-=b.y*wa*a.x*a.x*s; jzz-=b.y*wa*a.y*a.y*s; jxz-=b.y*wa*a.x*a.y*s; } }
        float rip=0.; vec2 ru=(p-uRect.xy)/uRect.zw; if(uRipOn>0.&&ru.x>0.&&ru.y>0.&&ru.x<1.&&ru.y<1.){ rip=texture2D(uRip,ru).r; float e=uRect.z*uRT;
          n.x-=(texture2D(uRip,ru+vec2(uRT,0.)).r-texture2D(uRip,ru-vec2(uRT,0.)).r)/(2.*e); n.z-=(texture2D(uRip,ru+vec2(0.,uRT)).r-texture2D(uRip,ru-vec2(0.,uRT)).r)/(2.*e); }
        if(uAmp>0.)n.xz+=(vec2(rn(p*${(.9/T).toFixed(4)}+vec2(uT*.35,0.)),rn(p*${(1.3/T).toFixed(4)}+vec2(7.,-uT*.3)))-.5)*.16;
        n=normalize(n); bool up=gl_FrontFacing; if(!up)n=-n;
        vec3 V=isOrthographic?-uCamD:normalize(cameraPosition-vW); float vd=max(dot(n,V),0.);
        vec3 inC=uScat*(uAmb*.8+uSunC*max(uSunD.y,0.)*.6);
        vec3 col; float alpha=1.;
        if(!up){ col=inC*1.6+sky(1.)*.12*pow(vd,2.); }
        else {
          if(uMode>2.5){ col=inC*1.25; }   // the far water (mode 3): the same surface, its colour the water's own (nothing seen through it at that distance)
          else if(uMode<.5||uMode>1.5){
            vec2 s=gl_FragCoord.xy/uRes; float th=max(0.,vVz-vz(texture2D(uDepth,s).r));
            vec2 r=clamp(s+n.xz*.035*uRefr*min(th*${MPU.toFixed(4)},2.),.001,.999); float th2=vVz-vz(texture2D(uDepth,r).r); if(th2<0.){ r=s; th2=th; }
            float m=min(th2*${MPU.toFixed(4)},40.); vec3 Tr=exp(-uSig*m); col=texture2D(uScene,r).rgb*Tr+inC*(1.-Tr); }
          else {
            vec2 bu=(p-uBedR.xy)/uBedR.zw; float dm=texture2D(uBed,vec2(bu.x,bu.y)).r*255./20.; float path=dm/max(abs(V.y),.25);
            alpha=1.-exp(-dot(uSig,vec3(.333))*path); col=inC; }
          vec3 R=reflect(-V,n); float F=clamp(.02+.98*pow(1.-vd,5.),0.,1.)*uRefl; vec3 sk=sky(R.y); col=mix(col,sk,F); alpha=mix(alpha,1.,F);
          float sp=uSunD.y>0.?pow(max(dot(R,uSunD),0.),600.):0.; if(sp>.55){ col+=vec3(.75,.95,1.)*.8; alpha=1.; }
          col+=inC*clamp((vH*${MPU.toFixed(4)}-.15)*1.2,0.,.6)*1.5;
          { float sh=clamp((n.x*.6-n.z*.8)*16.,-1.,1.); col*=1.+.22*sh; col+=uHi*max(sh-.55,0.)*1.6; }
          for(int i=0;i<8;i++){ vec3 lc=uLC[i]; if(lc.r+lc.g+lc.b<.001)continue; vec3 dl=uLP[i]-vW; float dd=length(dl), dm=dd*${MPU.toFixed(4)}; dl/=dd;
            float ls=pow(max(dot(R,dl),0.),90.)*3./(1.+dm*.3), pool=.12/(1.+dm*dm*.25); col+=lc*(ls+pool); alpha=max(alpha,min(1.,ls*2.)); }
          float J=jxx*jzz-jxz*jxz, fo=clamp((.62-J)*2.2,0.,1.)*uFoam+clamp(abs(rip)*${(2.5*MPU).toFixed(4)}-.12,0.,.9);
          if(fo>.25+.5*rf(floor(vW.xz/${(T/12).toFixed(4)})*.37+uT*.15)){ col=mix(col,.93*(uAmb+uSunC*.8),.85); alpha=1.; }
        }
        if(uStep>0.)col=floor(col*24.+.5)/24.;
        if(uUW>0.)col=mix(col,uUWC,clamp(length(vW-cameraPosition)/uUWF,0.,1.)); if(uUW>0.)alpha=1.;
        gl_FragColor=vec4(col,alpha); }`}; })();
const SH={uPier:{value:new THREE.Vector4(1e9,1e9,1e9,1e9)},uMe:{value:new THREE.Vector2()},uT:{value:0},uSunD:{value:new THREE.Vector3()},uSunC:{value:new THREE.Color()},uAmb:{value:new THREE.Color()},uSkyH:{value:new THREE.Color()},uSkyZ:{value:new THREE.Color()},uCamD:{value:new THREE.Vector3()},uLP:{value:Array.from({length:8},()=>new THREE.Vector3())},uLC:{value:Array.from({length:8},()=>new THREE.Vector3())},uStep:{value:0},uRipOn:{value:0},uUW:{value:0},uUWF:{value:1},uUWC:{value:new THREE.Color()}};
const WATERS=[
 {key:'a',name:'A · HUDSON',desc:'The Hudson by the pier: dark, a slow low swell.',
  sig:[0.62,0.24,0.26],scat:[0.008,0.026,0.018],deep:7,bed:0,foam:0.06,refr:.7,refl:.2,hi:[.07,.17,.08],tm:.55,fish:false,far:[.014,.03,.02],sky:.16,   // dark: nothing seen down in it (owner, 5 Nov 2026)
  waves:[[8,0.035,265,.25],[4.6,0.022,250,.3],[2.8,0.012,285,.3],[1.7,0.006,240,.3]]},
 {key:'b',name:'B · OPEN SEA',desc:'A long swell under a wind sea: crests a metre high that break white. A rock bed.',
  sig:[0.3,0.06,0.045],scat:[0.03,0.13,0.26],deep:8,bed:1,foam:1,refr:1.2,far:[.06,.16,.2],sky:.32,
  waves:[[18,0.42,268,.5],[11,0.24,255,.6],[7,0.14,280,.7],[4,0.08,245,.8],[2.5,0.05,290,.8],[1.6,0.025,230,.7],[5.5,0.09,262,.7]]},
 {key:'c',name:'C · CLEAR COVE',desc:'Glassy and clear: the sand rippled eight metres down, light dancing over it, bright fish.',
  sig:[0.36,0.05,0.04],scat:[0.03,0.34,0.38],deep:8,bed:2,foam:0.15,refr:1.4,far:[.06,.16,.2],sky:.32,
  waves:[[9,0.07,268,.3],[3.5,0.016,240,.4],[2.2,0.01,290,.4],[1.4,0.006,255,.4]]}];
RIVER.WATERS=WATERS;
try{ const s=JSON.parse(SAVE.get('river')||'null'); if(s&&s.v===2){ RIVER.way=s.way||RIVER.way; RIVER.wi=s.wi|0; } }catch(e){}
const setWater=U=>{ const Wt=WATERS[RIVER.wi]; U.uSig.value.set(...Wt.sig); U.uScat.value.set(...Wt.scat); U.uFoam.value=Wt.foam; U.uRefr.value=Wt.refr; U.uRefl.value=Wt.refl||.45; U.uHi.value.setRGB(...(Wt.hi||[.05,.22,.22])); };
const SURFS=[]; RIVER.surface=o=>{ '@later'; const U={uUW:SH.uUW,uUWF:SH.uUWF,uUWC:SH.uUWC,uT:SH.uT,uMe:SH.uMe,uPier:SH.uPier,uWA:{value:Array.from({length:SURF.NW},()=>new THREE.Vector4(1,0,0,0))},uWB:{value:Array.from({length:SURF.NW},()=>new THREE.Vector4())},uNW:{value:0},uAmp:{value:1},uWin:{value:new THREE.Vector4(-1e7,1e7,0,0)},uRip:FLOW.tex,uRect:FLOW.rect,uRipOn:SH.uRipOn,uRT:{value:1/FLOW.G},uScene:{value:null},uDepth:{value:null},uRes:{value:new THREE.Vector2(4,4)},uNear:{value:.1},uFar:{value:800},uMode:{value:1},uBed:{value:o.bed},uBedR:{value:o.bedR},
    uSig:{value:new THREE.Vector3()},uScat:{value:new THREE.Vector3()},uFoam:{value:0},uRefr:{value:1},uLv:{value:o.lv},uBank:{value:new THREE.Vector2(-1e7,1e7)},uSunD:SH.uSunD,uSunC:SH.uSunC,uAmb:SH.uAmb,uSkyH:SH.uSkyH,uSkyZ:SH.uSkyZ,uCamD:SH.uCamD,uLP:SH.uLP,uLC:SH.uLC,uStep:SH.uStep,uRefl:{value:.45},uHi:{value:new THREE.Color()}};
  const m=new THREE.ShaderMaterial({uniforms:U,side:THREE.DoubleSide,fog:false,transparent:true,depthWrite:false,vertexShader:SURF.vertexShader,fragmentShader:SURF.fragmentShader}); SURFS.push(U); setWater(U); return m; };
// once a frame (the river's tick, or the lake's while the river is not built): the shared uniforms from the clock, the sky and the lamps
RIVER.shade=()=>{ SH.uMe.value.set(pos.x,pos.z); if(SH.uPier.value.x>1e8){ const P=(RIVER.decks||[]).find(q=>q.pier); if(P){ const R=P.r; SH.uPier.value.set(Math.min(...R.map(r=>Math.min(r[0],r[2]))),Math.min(...R.map(r=>Math.min(r[1],r[3]))),Math.max(...R.map(r=>Math.max(r[0],r[2]))),Math.max(...R.map(r=>Math.max(r[1],r[3])))); } } if(!CLOCK.sun)return; if(!RIVER.on){ SH.uT.value=RIVER.t; SH.uRipOn.value=FLOW.on.value?1:0; SHARED.cam.getWorldDirection(SH.uCamD.value); }
  const S=CLOCK.sun; SH.uSunD.value.copy(CLOCK.sunV); SH.uSunC.value.copy(S.color).multiplyScalar(Math.min(1.4,S.intensity)); if(window.SKY&&SKY.U){ SH.uSkyH.value.copy(SKY.U.uH.value); SH.uSkyZ.value.copy(SKY.U.uZ.value); }
  SH.uAmb.value.copy(SH.uSkyZ.value).multiplyScalar(.55).addScalar(.03); LITE.pool.forEach((Lp,i)=>{ if(i>=8)return; SH.uLP.value[i].copy(Lp.position); SH.uLC.value[i].set(Lp.color.r,Lp.color.g,Lp.color.b).multiplyScalar(Math.min(1,Lp.intensity/3)); }); SH.uStep.value=RIVER.step?1:0; };
RIVER.build=()=>{ if(RIVER.on)return; const n0=scene.children.length; const R=RING, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, T=TILE, QSr=new URLSearchParams(location.search);
  const MPU=0.84/T, WU=1/MPU;
  const L=MODS.landR, lx0=L.x0*T, lx1=L.x1*T, rz0=Math.min(ZS(R.river.y0),ZS(R.river.y1)), rz1=Math.max(ZS(R.river.y0),ZS(R.river.y1));
  RIVER.mouth={x:XS(117.5),z:(rz0+rz1)/2};
  const fx0=XS(R.ff.x0), fx1=XS(R.ff.x1);
  const LVm=-1.0, LV=LVm*WU;
  RIVER.box={x0:lx0,x1:lx1,z0:rz0,z1:rz1,lv:LV};
  const cl=(v,a,b)=>v<a?a:v>b?b:v;
  const hash=(x,y)=>{ let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y)=>{ const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,y)=>vn(x,y)*0.5+vn(x*2.1+5,y*2.1+3)*0.3+vn(x*4.3+9,y*4.3+1)*0.2;
  // the very deep holes (owner, 28 Oct 2026: "make the lake and hudson go very deep in certain spots"): along the channel, 60 to 110 m more, black without a light
  const RW=(lx1-lx0)*MPU, HOLES=[[.18,.55,7,70],[.47,.7,9,110],[.79,.5,6,60]].map(([f,u,r,d])=>[(lx0*MPU)/RW+f,u,r,d]);
  // the scour basin the wreck lies in (owner, 7 Nov 2026: "very far down at bottom of hudson, should take like 30 seconds"): flat, 55 m down, off the pier, as long as the ship and a little wider
  const BASIN={x:XS(40)*MPU,z:(rz0+rz1)/2*MPU,rx:42,rz:13,d:55}; RIVER.basin=BASIN;
  const depthAt=(x,z)=>{ const Wt=WATERS[RIVER.wi], xm=x*MPU, zm=z*MPU, e=(rz1-z)*MPU, t=cl(e/16,0,1);
    let d=1.3+(Wt.deep-1.3)*Math.pow(t,1.1)-(fbm(xm*0.25,zm*0.25)-0.5)*1.8;
    if(Wt.bed===2)d-=Math.sin(xm*2.7+fbm(xm*0.55,zm*0.55)*6)*0.07;
    if(Wt.bed===1)d-=Math.max(0,fbm(xm*0.55+3,zm*0.55)-0.52)*6;
    if(Wt.bed===0)d-=(vn(xm*1.6,zm*1.6)-0.5)*0.25;
    const u=e/((rz1-rz0)*MPU), mx=(x-RIVER.mouth.x)*MPU, mz=(z-RIVER.mouth.z)*MPU, near=Math.exp(-mx*mx/1600), m=(2+8*cl(vn(xm/70+.3,3.7)*1.5-.25,0,1))*(1-near)+3*near;   // two to ten times deeper out in the channel; the cavern's pit mid-river
    d*=1+(m-1)*cl((u-.2)/.35,0,1)*cl((u-.2)/.35,0,1); d+=6*Math.exp(-(mx*mx+mz*mz)/49); for(const [px,pu,r,dd] of HOLES){ const hx=xm-px*RW, hz=(u-pu)*(rz1-rz0)*MPU; d+=dd*Math.exp(-(hx*hx+hz*hz)/(r*r)); }
    { const B=BASIN, ex=(xm-B.x)/B.rx, ez=(zm-B.z)/B.rz, r=Math.hypot(ex,ez); if(r<1.5){ const k=r<1?1:1-(r-1)/.5, t=k*k*(3-2*k); d+=(B.d-d)*t; } }   // the wreck's scour basin: flat at its depth, its sides easing up
    return Math.max(1.2,d); };
  RIVER.depthAt=depthAt;
  const NW=8, WA=Array.from({length:NW},()=>new THREE.Vector4()), WB=Array.from({length:NW},()=>new THREE.Vector4()); let WV=[];
  const setWaves=()=>{ const ws=WATERS[RIVER.wi].waves, n=ws.length, tm=WATERS[RIVER.wi].tm||1; WV=ws.map(([lam,A,deg,st],m)=>{ const k=2*Math.PI/lam, a=deg*Math.PI/180; return {dx:Math.cos(a),dz:-Math.sin(a),k:k*MPU,w:Math.sqrt(9.81*k)*tm,A:A*WU,Q:st/(k*A*n),ph:m*1.7}; });
    for(let i=0;i<NW;i++){ const w=WV[i]; if(w){ WA[i].set(w.dx,w.dz,w.k,w.w); WB[i].set(w.A,w.Q,w.ph,0); } else { WA[i].set(1,0,0,0); WB[i].set(0,0,0,0); } } };
  const ampAt=x=>RIVER.way==='flat'?0:cl(Math.min(x-(RIVER.cx-WIN/2),RIVER.cx+WIN/2-x)/(10*T),0,1);
  const hAt=(x,z)=>{ const f=ampAt(x); if(!f)return 0; let h=0; for(const w of WV)h+=w.A*Math.sin(w.k*(w.dx*x+w.dz*z)-w.w*RIVER.t+w.ph); return h*f; };
  const slopeAt=(x,z)=>{ const f=ampAt(x); let sx=0,sz=0; for(const w of WV){ const c=w.k*w.A*Math.cos(w.k*(w.dx*x+w.dz*z)-w.w*RIVER.t+w.ph); sx+=w.dx*c; sz+=w.dz*c; } return [sx*f,sz*f]; };
  RIVER.hAt=hAt;

  const WIN=88*T, CELL=T, NX=Math.round(WIN/CELL), DZ=rz1-rz0, NZ=Math.round(DZ/CELL); RIVER.cx=1e9;
  const snapX=x=>Math.round(cl(x,lx0+WIN/2,lx1-WIN/2)/(8*T))*8*T;
  const SW=48*T, uRipOn=SH.uRipOn;   // the water round you is FLOW's (065a): the one simulation every water shares
  RIVER.drop=(x,z,r,s)=>{ if(RIVER.way!=='full'&&RIVER.way!=='fluid')return; FLOW.drop(x,z,r,s); };

  const ND=16*T, PG=(d,nx,nz,o)=>{ const g=new THREE.PlaneGeometry(WIN,d,nx,nz); g.rotateX(-Math.PI/2); g.translate(0,0,o); return g; };
  const BN=[Math.round(WIN/(2*T)),Math.round(DZ/(2*T))];
  const uT0=SH.uT, uBedK={value:0}, uCau={value:1}, uLvW={value:LV}, uSunD=SH.uSunD;
  const GLN=SURF.gln;
  const uAmbB={value:new THREE.Color()}, uSunCB={value:new THREE.Color()};
  const UWU={uUW:SH.uUW,uUWF:SH.uUWF,uUWC:SH.uUWC};   // the murk on the river's own water, bed and sheets, seen from under it
  const bedMat=new THREE.ShaderMaterial({uniforms:{uT:uT0,uBedK,uCau,uLvW,uSunD,uSunC:uSunCB,uAmb:uAmbB,...UWU},
    vertexShader:'varying vec3 vRw,vN; void main(){ vec4 w=modelMatrix*vec4(position,1.); vRw=w.xyz; vN=normal; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform float uUW,uUWF; uniform vec3 uUWC; uniform float uT,uBedK,uCau,uLvW; uniform vec3 uSunD,uSunC,uAmb; varying vec3 vRw,vN;
    ${GLN}
    float cau(vec2 p,float t){ vec2 i=p; float c=1.; for(int n=0;n<4;n++){ float tt=t*(1.-(3.5/float(n+1))); i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x)); vec2 q=vec2(sin(i.x+tt),cos(i.y+tt)); q=sign(q)*max(abs(q),vec2(1e-3)); c+=1./max(length(vec2(p.x/(q.x/.005),p.y/(q.y/.005))),1e-4); } c/=4.; c=1.17-pow(max(c,0.),1.4); return min(pow(abs(c),8.),4.); }
    void main(){ vec2 q=floor(vRw.xz/${(TILE/12).toFixed(4)})*${(TILE/12*MPU).toFixed(4)}; float v=rf(q*2.), h=rh(floor(q*14.)); vec3 c;
      if(uBedK<.5){ c=vec3(.33,.29,.21)*(.78+.44*v); if(h>.94)c=vec3(.24,.22,.19); else if(h>.925)c=vec3(.55,.53,.46); }
      else if(uBedK<1.5){ float r=rf(q*.55+3.); if(r>.55){ float k=.75+.45*rn(q*4.); c=vec3(.40,.40,.38)*k; if(rn(q*7.)>.82)c=vec3(.22); if(h>.9)c=vec3(.5,.3,.32); } else c=vec3(.6,.56,.46)*(.82+.3*v); }
      else { float s=sin(q.x*5.5+rf(q*.7)*5.); c=vec3(.86,.8,.62)*(.86+.2*v)*(.93+.07*s); if(h>.96)c=vec3(.95,.9,.82); if(h<.01)c=vec3(.72,.5,.45); }
      vec3 n=normalize(vN); vec3 L=uAmb*.7+uSunC*max(dot(n,uSunD),0.)*.32; c*=L;
      float d=uLvW-vRw.y; c*=max(.1,exp(-max(d,0.)*${MPU.toFixed(4)}*.07)); if(d>0.&&uCau>0.){ vec2 p=vRw.xz*${MPU.toFixed(4)}*.62+uSunD.xz*d*${MPU.toFixed(4)}*.5; float k=cau(mod(p,6.2831),uT*.5)+.6*cau(mod(p*1.7+1.3,6.2831),uT*.4); float kk=clamp(k*1.6,0.,1.4); c*=.72+uCau*.9*kk*exp(-d*${MPU.toFixed(4)}*.1); c+=vec3(.25,.55,.55)*uCau*kk*.35*exp(-d*${MPU.toFixed(4)}*.1); }
      if(uUW>0.)c=mix(c,uUWC,clamp(length(vRw-cameraPosition)/uUWF,0.,1.)); gl_FragColor=vec4(c,1.); }`});
  const bed=new THREE.Mesh(PG(ND,BN[0],Math.round(ND/(2*T)),(DZ-ND)/2),bedMat), bedF=new THREE.Mesh(PG(DZ-ND,BN[0],12,-ND/2),bedMat);
  bed.frustumCulled=bedF.frustumCulled=false; bed.add(bedF); scene.add(bed);
  const bedTex=new THREE.DataTexture(new Uint8Array((BN[0]+1)*(BN[1]+1)*4),BN[0]+1,BN[1]+1); bedTex.magFilter=bedTex.minFilter=THREE.LinearFilter;
  const buildBed=()=>{ const a=bedTex.image.data; for(const m of [bed,...bed.children]){ const g=m.geometry, p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i)+RIVER.cx, z=p.getZ(i)+(rz0+rz1)/2, d=depthAt(x,z); p.setY(i,LV-d*WU); } p.needsUpdate=true; g.computeVertexNormals(); }
    for(let j=0;j<=BN[1];j++)for(let i=0;i<=BN[0];i++){ const x=RIVER.cx-WIN/2+i/BN[0]*WIN, z=rz0+j/BN[1]*DZ, k=(j*(BN[0]+1)+i)*4; a[k]=Math.min(255,depthAt(x,z)*20); a[k+3]=255; }
    bedTex.needsUpdate=true; bed.position.set(RIVER.cx,0,(rz0+rz1)/2); if(typeof seedGrass!=='undefined')seedGrass(); };

  const RT=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType}); RT.depthTexture=new THREE.DepthTexture(4,4); RT.depthTexture.type=THREE.FloatType;
  const SU={...UWU,uT:uT0,uMe:SH.uMe,uPier:SH.uPier,uWA:{value:WA},uWB:{value:WB},uNW:{value:0},uAmp:{value:1},uWin:{value:new THREE.Vector4()},uRip:FLOW.tex,uRect:FLOW.rect,uRipOn:uRipOn,uRT:{value:1/FLOW.G},
    uScene:{value:RT.texture},uDepth:{value:RT.depthTexture},uRes:{value:new THREE.Vector2(4,4)},uNear:{value:.1},uFar:{value:800},uMode:{value:0},uBed:{value:bedTex},uBedR:{value:new THREE.Vector4()},
    uSig:{value:new THREE.Vector3()},uScat:{value:new THREE.Vector3()},uFoam:{value:0},uRefr:{value:1},uLv:{value:LV},uBank:{value:new THREE.Vector2(rz0,rz1)},
    uSunD:uSunD,uSunC:SH.uSunC,uAmb:SH.uAmb,uSkyH:SH.uSkyH,uSkyZ:SH.uSkyZ,uCamD:SH.uCamD,
    uLP:SH.uLP,uLC:SH.uLC,uStep:SH.uStep,uRefl:{value:.45},uHi:{value:new THREE.Color(.05,.22,.22)}};
  const surfMat=new THREE.ShaderMaterial({uniforms:SU,side:THREE.DoubleSide,fog:false,vertexShader:SURF.vertexShader,fragmentShader:SURF.fragmentShader});
  const farMat=surfMat.clone(); farMat.uniforms={...SU,uMode:{value:3},uScene:{value:bedTex},uDepth:{value:bedTex}}; RIVER.farMat=farMat;   // (it reads neither; not bound to the picture it is drawn into)
  const surf=new THREE.Mesh(PG(ND,NX,Math.round(ND/CELL),(DZ-ND)/2),surfMat), surfF=new THREE.Mesh(PG(DZ-ND+T,1,1,(T-ND)/2),surfMat); surf.frustumCulled=surfF.frustumCulled=false; surf.add(surfF); scene.add(surf);
  const FU={...UWU,uT:uT0,uMe:SH.uMe,uSky:{value:new THREE.Color(.5,.62,.75)},uDay:{value:1},uDeep:{value:new THREE.Color(.06,.16,.2)},uSkyK:{value:.32}};
  const flatMat=new THREE.ShaderMaterial({uniforms:FU,fog:false,
    vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform float uUW,uUWF; uniform vec3 uUWC; uniform vec2 uMe; uniform float uT,uDay,uSkyK; uniform vec3 uSky,uDeep; varying vec3 vW;
      float h(vec2 p){ p=fract(p*vec2(.1031,.1030)); p+=dot(p,p.yx+33.33); return fract((p.x+p.y)*p.x); }
      void main(){ float tt=h(floor(vW.xz/${(.5*T).toFixed(3)})+.5)<smoothstep(${(30*T).toFixed(3)},${(60*T).toFixed(3)},length(vW.xz-uMe))?0.:uT; vec2 p=floor(vec2(vW.x+tt*${(1.6*T).toFixed(3)},vW.z)/${(.5*T).toFixed(3)});
        float g=step(.988,h(p+floor(tt*1.3)*vec2(0.,7.))), band=step(.7,h(vec2(floor(vW.z/${(1.4*T).toFixed(3)}),floor(tt*.6))));
        vec3 deep=uDeep*(.35+.65*uDay), c=mix(deep,uSky*.55,uSkyK)+band*.025; c+=g*(.28+.4*uDay)*vec3(.85,.95,1.); if(uUW>0.)c=mix(c,uUWC,clamp(length(vW-cameraPosition)/uUWF,0.,1.)); gl_FragColor=vec4(c,1.); }`});
  const sheet=()=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,DZ).rotateX(-Math.PI/2),farMat); m.position.set(0,LV,(rz0+rz1)/2); scene.add(m); return m; };
  const flatAll=sheet(), flatL=sheet(), flatR=sheet();
  // the water past the river ends at the far shore, the far city standing on it (owner, 8 Nov 2026: "the buildings should not be in middle of hudson, they should be at back and go on for 3x as long"; data/world.json edge.far.shore and .ends, in tiles)
  const FARE=LEVEL.edge&&LEVEL.edge.far||{}, shz=FARE.shore!=null?ZS(FARE.shore):rz0-900, sx0=FARE.ends?XS(FARE.ends[0]):lx0-200, sx1=FARE.ends?XS(FARE.ends[1]):lx1+200, SD=Math.max(10,rz0-shz);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(sx1-sx0,SD).rotateX(-Math.PI/2),farMat); sea.position.set((sx0+sx1)/2,LV-0.05,rz0-SD/2); sea.renderOrder=-1; sea.visible=false; scene.add(sea); RIVER.sea=sea;
  if(FARE.shore!=null){ const LD=220*T, land=new THREE.Mesh(new THREE.PlaneGeometry(sx1-sx0,LD).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x3e3c37})); land.position.set(0,-LV+.05-.1*T,-SD/2-LD/2); land.receiveShadow=false; sea.add(land); RIVER.farLand=land;
    const bank=new THREE.Mesh(new THREE.PlaneGeometry(sx1-sx0,-LV+.2*T),new THREE.MeshLambertMaterial({color:0x2e2c29})); bank.position.set(0,(-LV+.2*T)/2-.15*T,-SD/2); sea.add(bank); }   // (the land a little above the street's level, its bank down to the water)
  for(const [a,b] of [[lx0-200,lx0+2*T],[lx1-2*T,lx1+200]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(b-a,rz1-rz0).rotateX(-Math.PI/2),farMat); m.position.set((a+b)/2-sea.position.x,0,(rz0+rz1)/2-sea.position.z); m.renderOrder=-1; sea.add(m); }   // past both ends of the river too: open water, not a hole
  const setFlats=()=>{ flatAll.scale.x=lx1-lx0; flatAll.position.x=(lx0+lx1)/2; const a=RIVER.cx-WIN/2, b=RIVER.cx+WIN/2;
    flatL.scale.x=Math.max(.01,a-lx0); flatL.position.x=(lx0+a)/2; flatR.scale.x=Math.max(.01,lx1-b); flatR.position.x=(b+lx1)/2; };

  { const H=(9.5+1)*WU, rows=Math.round(H/T*24), c=document.createElement('canvas'); c.width=96; c.height=rows; const g=c.getContext('2d'), im=g.createImageData(96,rows), wl=Math.round(-LV/H*rows);
    for(let y=0;y<rows;y++)for(let x=0;x<96;x++){ const by=Math.floor(y/12), bx=Math.floor((x+(by%2)*12)/24), mort=y%12===0||(x+(by%2)*12)%24===0, t=.85+.25*hash(bx,by), k=(y*96+x)*4;
      let col=mort?[.27,.27,.27]:[.56*t,.54*t,.5*t]; if(y>wl-2){ const al=cl((y-wl)/18+.4,0,1); col=[col[0]*(1-al)+.16*al,col[1]*(1-al)+.3*al,col[2]*(1-al)+.14*al]; if(y>wl+40)col=col.map(q=>q*.6); }
      if(Math.abs(y-wl)<3&&hash(x,y)>.6)col=[.7,.7,.62]; im.data[k]=col[0]*255; im.data[k+1]=col[1]*255; im.data[k+2]=col[2]*255; im.data[k+3]=255; }
    g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(c); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace; tx.wrapS=THREE.RepeatWrapping; tx.repeat.set((lx1-lx0)/(4*T),1);
    const wm=new THREE.MeshLambertMaterial({map:tx,emissiveMap:tx,emissive:new THREE.Color(.42,.42,.42)});
    { const w=new THREE.Mesh(new THREE.PlaneGeometry(lx1-lx0,H),wm); w.position.set((lx0+lx1)/2,-H/2,rz1); w.rotation.y=Math.PI; w.receiveShadow=true; scene.add(w); RIVER.wallN=w; } RIVER.wallS=null;
    { const CU=new THREE.MeshBasicMaterial({color:new THREE.Color(.03,.08,.1),side:THREE.DoubleSide}), HU=200*WU, cu=(w,x,z,ry)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,HU),CU); m.position.set(x,LV-.1*T-HU/2,z); m.rotation.y=ry; m.userData.anyRoom=true; scene.add(m); return m; };   // under the surface only: the far edge and both ends closed below, so the clear water never shows the empty space past them
      RIVER.curtain=[cu(lx1-lx0,(lx0+lx1)/2,rz0,0),cu(rz1-rz0,lx0,(rz0+rz1)/2,Math.PI/2),cu(rz1-rz0,lx1,(rz0+rz1)/2,Math.PI/2)]; } }
  const selfLit=m=>{ m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.5;'); }; return m; };
  const cope=new THREE.Mesh(new THREE.BoxGeometry(lx1-lx0,.12*T,.45*T),selfLit(new THREE.MeshLambertMaterial({color:0x8c8a82}))); cope.position.set((lx0+lx1)/2,.06*T-.5*ZU,rz1+.22*T); cope.receiveShadow=true; scene.add(cope);
  const LAD=[]; for(let x=fx0+10*T;x<fx1-4*T;x+=10*T)LAD.push(x); RIVER.ladders=LAD;   // ladders close along the quay so one is always within reach
  const PL=9*T, PW=1.2*T, PX=XS((BLOCK.hudson[0]+BLOCK.hudson[1])/2), FP=LAD.reduce((b,x)=>Math.abs(x-PX)<Math.abs(b-PX)?x:b,LAD[0]), PIERS=[]; RIVER.piers=PIERS; RIVER.fpier=FP;   // the small decks are gone (owner); only the long fishing pier remains, at the foot of the way through (6 Nov 2026)
  const POSTS=[]; RIVER.posts=POSTS; for(const px of PIERS)for(let k=0;k<4;k++)for(const o of [-1,1])POSTS.push([px+o*1.0*T,rz1-(1.2+2.4*k)*T,.16*T]);
  FLOW.add({name:'hudson',kind:'river',shown:()=>RIVER.shown&&RIVER.way!=='flat',box:[lx0,rz0,lx1,rz1],has:(x,z)=>x>lx0&&x<lx1&&z>rz0&&z<rz1,bed:(x,z)=>LV-depthAt(x,z)*WU,rest:()=>LV,swell:true,solid:(x,z)=>POSTS.some(([px,pz,r])=>Math.hypot(x-px,z-pz)<r)});
  const DECKS=RIVER.decks=PIERS.map(px=>({r:[[px-PW,rz1-PL,px+PW,rz1]],lad:[px,rz1-PL-.55*T,px,rz1-PL+.8*T]}));   // walkable decks over the water: their rectangles, and a ladder (in the water, out on the deck); the long pier adds its own (066b)
  const onPier=RIVER.onPier=(x,z,m=0)=>DECKS.some(d=>d.r.some(r=>x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m));
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
    // (no railing along the quay: owner, 7 Nov 2026)
    const geo=new THREE.BoxGeometry(1,1,1), im=new THREE.InstancedMesh(geo,selfLit(new THREE.MeshLambertMaterial({color:0xffffff})),B.length), M=new THREE.Matrix4(), C=new THREE.Color();
    B.forEach((b,i)=>{ M.makeScale(b[3]-b[0],b[4]-b[1],b[5]-b[2]); M.setPosition((b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2); im.setMatrixAt(i,M); im.setColorAt(i,C.setRGB(...b[6])); });
    im.castShadow=true; im.receiveShadow=true; scene.add(im); RIVER.kit=im; RIVER.kitN=B.length; }

  const buoyG=new THREE.Group(); { const red=new THREE.MeshLambertMaterial({color:0xb0302a}), white=new THREE.MeshLambertMaterial({color:0xece9e2}), dark=new THREE.MeshLambertMaterial({color:0x1b1c1f}), r=.32*T;
    const add=(g,m,y)=>{ const o=new THREE.Mesh(g,m); o.position.y=y; buoyG.add(o); };
    add(new THREE.CylinderGeometry(r,r*.85,.35*T,8),red,0); add(new THREE.CylinderGeometry(r*.9,r,.18*T,8),white,.26*T); add(new THREE.ConeGeometry(r*.9,.5*T,8),red,.6*T); add(new THREE.CylinderGeometry(.03*T,.03*T,.4*T,4),dark,1.0*T); }
  const BUOYS=[]; for(let x=fx0+25*T;x<fx1;x+=45*T){ const b=buoyG.clone(); b.traverse(o=>{ if(o.isMesh)o.castShadow=true; }); scene.add(b); const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0x2a2622})); ln.frustumCulled=false; scene.add(ln); BUOYS.push({m:b,ln,x,z:rz1-14*T}); }
  const junk=new THREE.Group(); scene.add(junk);
  const seedJunk=()=>{ while(junk.children.length)junk.remove(junk.children[0]); if(!RIVER.deep||WATERS[RIVER.wi].bed!==0)return; const tyre=new THREE.MeshLambertMaterial({color:0x1a1a1c}), glass=new THREE.MeshLambertMaterial({color:0x3f7a4c});
    for(let x=fx0+12*T;x<fx1;x+=31*T){ const z=rz1-(6+((x/T)%11))*T, t=new THREE.Mesh(new THREE.TorusGeometry(.3*T,.12*T,5,10),tyre); t.rotation.x=Math.PI/2; t.position.set(x,LV-depthAt(x,z)*WU+.1*T,z); junk.add(t);
      for(let k=0;k<3;k++){ const bx=x+(k*2.3-2)*T, bz=z-(k*1.7+1)*T, b=new THREE.Mesh(new THREE.CylinderGeometry(.06*T,.06*T,.3*T,5),glass); b.rotation.z=Math.PI/2; b.rotation.y=k; b.position.set(bx,LV-depthAt(bx,bz)*WU+.06*T,bz); junk.add(b); } } };

  const NGR=900, grG=new THREE.BufferGeometry(); grG.setAttribute('position',new THREE.Float32BufferAttribute([-.04,0,0, .04,0,0, 0,1,0],3)); grG.computeVertexNormals();
  const grMat=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}); grMat.onBeforeCompile=sh=>{ sh.uniforms.uT=uT0; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    { vec4 o=instanceMatrix*vec4(0.,0.,0.,1.); float k=position.y*position.y; transformed.x+=k*.35*sin(uT*.9+o.x*.7+o.z*.3); transformed.z+=k*.25*sin(uT*1.3+o.x*.4); }`); };
  const grass=new THREE.InstancedMesh(grG,grMat,NGR); grass.frustumCulled=false; scene.add(grass);
  const seedGrass=()=>{ const Wt=WATERS[RIVER.wi], M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), Sc=new THREE.Vector3(), C=new THREE.Color(); let n=0;
    for(let i=0;i<NGR;i++){ const cI=i>>3, x=RIVER.cx+(hash(cI,(RIVER.cx/T)|0)-.5)*WIN*.6+(hash(i,11)-.5)*.9*T, z=rz1-(.6+Math.pow(hash(cI,77),1.6)*22)*T+(hash(i,12)-.5)*.9*T, d=depthAt(x,z); if(Wt.bed===1&&hash(i,5)<.6||!RIVER.deep&&z<rz1-ND)continue;
      const h=(Wt.bed===1?3+hash(i,9)*3:.25+hash(i,9)*.35)*WU; Q.setFromAxisAngle(V.set(0,1,0),hash(i,3)*6.3); M.compose(V.set(x,LV-d*WU,z),Q,Sc.set(WU*2.2,h,WU*2.2)); grass.setMatrixAt(n,M);
      const g=Wt.bed===2?[.22,.5,.2]:Wt.bed===1?[.42,.34,.13]:[.3,.38,.18]; grass.setColorAt(n,C.setRGB(g[0]*(.8+.4*hash(i,4)),g[1]*(.8+.4*hash(i,4)),g[2])); n++; }
    grass.count=n; grass.instanceMatrix.needsUpdate=true; if(grass.instanceColor)grass.instanceColor.needsUpdate=true; };
  const SP={n:0,max:400,p:new Float32Array(1200),v:new Float32Array(1200)}, spg=new THREE.BufferGeometry(); spg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(1200),3)); spg.setDrawRange(0,0);
  const spm=new THREE.Points(spg,new THREE.PointsMaterial({color:0xdff3ff,size:2,sizeAttenuation:false})); spm.frustumCulled=false; scene.add(spm);
  const splash=(x,y,z,n,sp)=>{ for(let k=0;k<n&&SP.n<SP.max;k++){ const i=SP.n++, a=Math.random()*Math.PI*2, up=.5+Math.random()*.8, out=Math.random()*.7; SP.p.set([x,y+.02,z],i*3); SP.v.set([Math.cos(a)*out*sp,up*sp,Math.sin(a)*out*sp],i*3); } };
  const spray=dt=>{ const g=9.81*WU; let k=0; for(let i=0;i<SP.n;i++){ const p=SP.p, v=SP.v; v[i*3+1]-=g*dt; for(let q=0;q<3;q++)p[i*3+q]+=v[i*3+q]*dt; const x=p[i*3], y=p[i*3+1], z=p[i*3+2];
      if(y<LV+hAt(x,z)&&v[i*3+1]<0){ RIVER.drop(x,z,.12*T,.004*WU); continue; } if(k!==i)for(let q=0;q<3;q++){ p[k*3+q]=p[i*3+q]; v[k*3+q]=v[i*3+q]; } k++; }
    SP.n=k; spg.attributes.position.array.set(SP.p.subarray(0,k*3)); spg.attributes.position.needsUpdate=true; spg.setDrawRange(0,k); };
  const sound=(s,muff)=>{ '@later'; try{ const c=SFX.live&&SFX.live(); if(!c||!SFX.on)return; const n=Math.floor(c.sampleRate*.8), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); let l=0; for(let i=0;i<n;i++){ l=(l+.05*(Math.random()*2-1))/1.05; d[i]=l*4*Math.exp(-i/n*(5-s*2)); }
    const src=c.createBufferSource(); src.buffer=b; const f=c.createBiquadFilter(); f.type=muff?'lowpass':'bandpass'; f.frequency.value=muff?300:1300; f.Q.value=.6; const G=c.createGain(); G.gain.value=(.25+s*.5)*SFX.vol; src.connect(f).connect(G).connect(c.destination); src.start(); }catch(e){} };

  RIVER.deep=false; let dbusy=false;
  const deepGo=()=>{ if(RIVER.deep)return; RIVER.deep=true; for(const [m,c,g] of [[surf,surfF,PG(DZ,NX,NZ,0)],[bed,bedF,PG(DZ,BN[0],BN[1],0)]]){ m.remove(c); c.geometry.dispose(); m.geometry.dispose(); m.geometry=g; }
    seedJunk(); RIVER.cx=1e9; };
  RIVER.load=async()=>{ if(RIVER.deep||dbusy)return; dbusy=true; await FADE.run('LOADING...',()=>deepGo(),{keep:true}); dbusy=false; };
  RIVER.over=(x,z)=>SHARED.LVL==='up'&&x>lx0&&x<lx1&&z>rz0&&z<rz1;
  RIVER.level=(x,z)=>RIVER.over(x,z)?LV+hAt(x,z):null;   // the water's surface here, or null off the river
  RIVER.dep=0; RIVER.bot=0; let wasIn=false, wake=0, wasUnder=false;
  RIVER.feed=(st,pos,dt,go,keys)=>{ if(!RIVER.over(pos.x,pos.z)||!RIVER.swim&&onPier(pos.x,pos.z)){ RIVER.swim=false; if(wasIn)wasIn=false; return false; }
    const h=hAt(pos.x,pos.z)+(RIVER.swim?FLOW.carry(pos,dt):0), lvl=(LV+h)/ZU, floor=(LV-depthAt(pos.x,pos.z)*WU)/ZU;
    const W=RIG.water(st,{level:lvl,floor}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0; RIVER.swim=W.in;
    const under=W.in&&W.y<lvl-34;   // your air is VIT.air (103-vitals): one breath for every water
    RIVER.dep=Math.max(0,(lvl-34-W.y)*ZU*MPU); RIVER.bot=(lvl-floor)*ZU*MPU;
    if(under!==wasUnder){ wasUnder=under; if(!under&&W.in)sound(.1,false); }
    if(W.in&&!wasIn){ RIVER.drop(pos.x,pos.z,.55*T,.09*WU); splash(pos.x,LV+h,pos.z,70,2.6); sound(.8,false); }
    wasIn=W.in;
    for(const e of W.events)if(e.k==='splash'){ RIVER.drop(pos.x,pos.z,.5*T,Math.min(.14,.02+e.v*.0009)*WU); splash(pos.x,LV+h,pos.z,Math.min(90,20+e.v*.5),Math.min(3,1+e.v*.015)); sound(Math.min(1,e.v/120),false); } W.events.length=0;
    wake-=dt; if(W.in&&wake<0){ wake=.07; const s=(go?.016:.006)*(1+W.fast)*WU*.6; RIVER.drop(pos.x+(Math.random()-.5)*.25,pos.z+(Math.random()-.5)*.25,.35*T,s); if(go&&!W.dive&&Math.random()<.35)splash(pos.x,LV+h,pos.z,3+(W.fast?4:0),1.1); }
    if(W.in&&keys.has(' ')&&W.y>lvl-40){ const dk=DECKS.find(d=>d.lad&&Math.abs(d.lad[0]-pos.x)<1.1*T&&Math.abs(d.lad[1]-pos.z)<1.0*T), pe=dk?dk.lad:null; if(pe!=null){ W.in=false; W.dive=false; st.water.level=null; pos.x=pe[2]; pos.z=pe[3]; RIVER.swim=false; wasIn=false; sound(.05,false); if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; }
      const lx=pos.z>rz1-2.0*T?LAD.reduce((b,x)=>Math.abs(x-pos.x)<Math.abs(b-pos.x)?x:b,LAD[0]):null; if(pe==null&&lx!=null&&Math.abs(lx-pos.x)<6*T){ W.in=false; W.dive=false; st.water.level=null; pos.x=lx; pos.z=rz1+.7*T; RIVER.swim=false; wasIn=false; sound(.05,false); if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; } }   // near the quay, SPACE climbs you out at the nearest ladder
    return true; };
  RIVER.clamp=pos=>{ const m=.35*T; pos.x=cl(pos.x,lx0+m,lx1-m); pos.z=cl(pos.z,rz0+m,rz1-m); for(const [x,z,r] of POSTS){ const dx=pos.x-x, dz=pos.z-z, d=Math.hypot(dx,dz), R0=r+.3*T; if(d<R0&&d>1e-4){ pos.x=x+dx/d*R0; pos.z=z+dz/d*R0; } } };

  const save=()=>{ try{ SAVE.set('river',JSON.stringify({v:2,way:RIVER.way,wi:RIVER.wi,step:RIVER.step})); }catch(e){} };
  RIVER.step=true;
  if(QSr.get('river'))RIVER.way=QSr.get('river'); if(QSr.get('water'))RIVER.wi=Math.max(0,'abc'.indexOf(QSr.get('water')));
  const applyWater=()=>{ const Wt=WATERS[RIVER.wi]; setWaves(); SU.uNW.value=WV.length; setWater(SU); for(const U of SURFS)setWater(U); uBedK.value=Wt.bed; FU.uDeep.value.setRGB(...Wt.far); FU.uSkyK.value=Wt.sky;
    uCau.value=Wt.bed===0?.6:Wt.bed===1?.7:1; RIVER.cx=1e9; FLOW.rest(); seedJunk(); };
  RIVER.set=(o={})=>{ if(o.way)RIVER.way=o.way; if(o.wi!=null){ RIVER.wi=o.wi; applyWater(); } if(o.step!=null)RIVER.step=o.step; save(); RIVER.panel&&RIVER.panel(); };
  applyWater();

  const F=new THREE.Frustum(), M4=new THREE.Matrix4(), bb=new THREE.Box3();
  RIVER.tick=(dt,pos)=>{ RIVER.t+=Math.min(+dt||0,.1); uT0.value=RIVER.t; const up=OUT.world, way=RIVER.way;   // the river moves again (owner, 7 Nov 2026: "the water just doesnt move at all"; supersedes 30 Oct's still water)
    const cx=snapX(pos.x); if(Math.abs(cx-RIVER.cx)>1){ RIVER.cx=cx; buildBed(); setFlats(); surf.position.set(cx,LV,(rz0+rz1)/2); SU.uWin.value.set(cx-WIN/2,cx+WIN/2,0,0); SU.uBedR.value.set(cx-WIN/2,rz0,WIN,DZ); }
    const real=way!=='flat'; surf.visible=up&&real; bed.visible=up&&real; flatL.visible=flatR.visible=up&&real; flatAll.visible=up&&!real; junk.visible=grass.visible=up&&real;
    if(!RIVER.deep&&up&&RIVER.over(pos.x,pos.z)&&(pos.z<rz1-10*T||RIVER.swim&&RIVER.dep>2.5))RIVER.load();
    RIVER.wallN.visible=up; if(RIVER.sea)RIVER.sea.visible=up; for(const c of RIVER.curtain)c.visible=up; cope.visible=RIVER.kit.visible=spm.visible=up; for(const B of BUOYS)B.m.visible=B.ln.visible=up;
    surfMat.transparent=way==='swell'; surfMat.depthWrite=way!=='swell'; SU.uMode.value=way==='swell'?1:way==='fluid'?2:0; SU.uStep.value=RIVER.step?1:0;
    SU.uAmp.value=1;
    RIVER.shade(); if(window.SKY&&SKY.U)FU.uSky.value.copy(SKY.U.uH.value);
    uAmbB.value.copy(SU.uSkyZ.value).multiplyScalar(.6).add(SU.uSkyH.value.clone().multiplyScalar(.25)); uSunCB.value.copy(SU.uSunC.value).multiplyScalar(.75); FU.uDay.value=cl((CLOCK.elev()+4)/14,.15,1);
    for(const B of BUOYS){ const h=hAt(B.x,B.z), [sx,sz]=slopeAt(B.x,B.z); B.m.position.set(B.x,LV+h-.12*T,B.z); B.m.rotation.set(-sz*.8,0,sx*.8); const a=B.ln.geometry.attributes.position; a.setXYZ(0,B.x,LV+h-.2*T,B.z); a.setXYZ(1,B.x+.8*T,LV-depthAt(B.x,B.z)*WU,B.z-.5*T); a.needsUpdate=true; }
    spray(Math.min(dt,1/30)); };

  const UF=new THREE.Fog(0x000000,0,1), bg0=new THREE.Color(); let fog0=null, uw=false, dome=true;
  const RQ=[[-1,-1],[1,-1],[1,1],[-1,1]], V8=new THREE.Vector3(), SEE=()=>{ if(!SHARED.cam.isOrthographicCamera)return F.intersectsBox(bb); const Q=[]; for(let k=0;k<8;k++){ V8.set(k&1?bb.max.x:bb.min.x,k&2?bb.max.y:bb.min.y,k&4?bb.max.z:bb.min.z).applyMatrix4(M4); Q.push([V8.x,V8.y]); }
    for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){ const nx=Q[j][1]-Q[i][1], ny=Q[i][0]-Q[j][0]; if(!nx&&!ny)continue; const d=p=>p[0]*nx+p[1]*ny, a=Q.map(d), lo=Math.min(...a), hi=Math.max(...a), r=RQ.map(d); if(r.every(x=>x<lo)||r.every(x=>x>hi))return false; }
    return !(Q.every(p=>p[0]>1)||Q.every(p=>p[0]<-1)||Q.every(p=>p[1]>1)||Q.every(p=>p[1]<-1)); };
  RIVER.pre=(renderer,scene,cam,dt,pos)=>{ const up=OUT.world;
    const fl=RIVER.way==='fluid'; uRipOn.value=(RIVER.way==='full'||fl)&&FLOW.on.value?1:0; FLOW.wa.value=WA; FLOW.wb.value=WB; FLOW.nw.value=fl?WV.length:0; FLOW.time=RIVER.t;   // the sea's swell comes in at FLOW's rim
    if(surf.visible){ M4.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(M4); bb.min.set(RIVER.cx-WIN/2,LV-WU,rz0); bb.max.set(RIVER.cx+WIN/2,LV+2*WU,rz1); if(cam.position.y>LV+2*WU&&!SEE()){ surf.visible=bed.visible=junk.visible=grass.visible=false; } }
    if((RIVER.way==='full'||fl)&&surf.visible){
      if(cam.position.y<=LV+2*WU||SEE()){ const w=renderer.domElement.width, h=renderer.domElement.height; if(RT.width!==w||RT.height!==h)RT.setSize(w,h); SU.uRes.value.set(w,h); SU.uNear.value=cam.near; SU.uFar.value=cam.far; cam.getWorldDirection(SU.uCamD.value);
        surf.visible=false; spm.visible=false; renderer.setRenderTarget(RT); renderer.render(scene,cam); renderer.setRenderTarget(null); surf.visible=true; spm.visible=true; } }
    else cam.getWorldDirection(SU.uCamD.value);
    const cp=cam.position; uw=up&&RIVER.over(cp.x,cp.z)&&cp.y<LV+hAt(cp.x,cp.z); if(uw){ const Wt=WATERS[RIVER.wi], k=SU.uScat.value, a=SU.uAmb.value, s=SU.uSunC.value, dm=Math.max(0,(LV-cp.y)*MPU), see=FLOW.see(dm,.8/Math.min(...Wt.sig.slice(1))), dk=see.k;   // darker the deeper you go
      UF.color.setRGB(Math.min(.62,k.x*(a.r+s.r*.7)*9*dk),Math.min(.78,k.y*(a.g+s.g*.7)*9*dk),Math.min(.8,k.z*(a.b+s.b*.7)*9*dk));   // twice as bright near the top as it was; still dark deep down (owner, 7 Nov 2026: "its way too dark under the water")
      UF.near=0; UF.far=see.far*WU; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color); UF.uw=true; UWU.uUW.value=1; UWU.uUWF.value=UF.far; UWU.uUWC.value.copy(UF.color);   // under water you see some ten metres (owner: "the water should not be so clear underwater"); goggles further
      if(window.SKY&&SKY.dome){ dome=SKY.dome.visible; SKY.dome.visible=false; } } };
  RIVER.post=scene=>{ UWU.uUW.value=0; if(uw){ scene.fog=fog0; scene.background.copy(bg0); if(window.SKY&&SKY.dome)SKY.dome.visible=dome; uw=false; } };

  const css=document.createElement('style'); css.textContent=`#rvhud{position:fixed;left:12px;bottom:64px;z-index:20;background:#0e1016;border:2px solid #3a3f4e;padding:6px 10px;font:12px Silkscreen,monospace;color:#9aa3b5;display:none}
    #rvhud b{color:#8fe3d6;font-weight:400}    #rvpan{position:fixed;left:12px;top:12px;z-index:30;width:300px;background:#0e1016;border:2px solid #3a3f4e;padding:10px 12px 12px;font:12px Silkscreen,monospace;color:#cfd6e4;max-height:calc(100vh - 24px);overflow:auto}
    #rvpan h3{margin:0 30px 2px 0;font:14px Silkscreen,monospace;color:#f2c14e} #rvpan .d{color:#8a8f9c;margin:2px 0 8px;line-height:1.45;font-size:11px;font-family:ui-sans-serif,system-ui,sans-serif}
    #rvpan .r{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0} #rvpan .l{color:#8a8f9c;margin-top:8px} #rvpan button{font:11px Silkscreen,monospace;color:#cfd6e4;background:#161a24;border:2px solid #3a3f4e;padding:5px 7px;cursor:pointer}
    #rvpan button.on{border-color:#8fe3d6;color:#8fe3d6;background:#1b2b30} #rvpan button:hover{border-color:#f2c14e}`;
  document.head.appendChild(css);
  const hud=document.createElement('div'); hud.id='rvhud'; hud.innerHTML='depth <b id="rvd">0.0 m</b> &nbsp;bed <span id="rvb">0.0 m</span>'; document.body.appendChild(hud);
  const pan=document.createElement('div'); pan.id='rvpan'; document.body.appendChild(pan);   const WAYS=[['flat','FLAT','The river as it was: one painted sheet, glints drifting. You can still swim. 2 triangles.'],
    ['swell','SWELL','Waves on the graphics card (the mockup\'s swell and chop), the sky and the sun in them, foam on the crests; the murk laid over the bed by its depth. ~8,000 triangles, no extra pass.'],
    ['fluid','FLUID','Completely fluid: the water round you (48 tiles) is the one water every lake and stream shares, real flow and waves. The sea\'s waves come in at its open sides, slow over the shallows, bend, steepen, come back off the quay and round the pier\'s posts, and meet your splashes and wakes; seen through, bent, coloured by the depth; caustics on the bed. ~8,000 triangles + one extra scene pass.'],
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
  RIVER.pick=(ray,pos)=>{ if(SHARED.LVL!=='up')return false; if(!ray.intersectPlane(pl,ph)||!RIVER.over(ph.x,ph.z)||onPier(ph.x,ph.z)||Math.hypot(ph.x-pos.x,ph.z-pos.z)>40*T){ if(!RIVER.pickers.some(f=>f(ray,pos)))return false; } pan.hidden=false; return true; };
  RIVER.hud=()=>{ if(!RIVER.swim){ hud.style.display='none'; return; } hud.style.display='block'; document.getElementById('rvd').textContent=RIVER.dep.toFixed(1)+' m'; document.getElementById('rvb').textContent=RIVER.bot.toFixed(1)+' m';
    };
  RIVER.U={SU,uCau,uRipOn,surf,bed,grass,kit:RIVER.kit}; RIVER.on=true;
  for(const f of RIVER.onBuild)f();
  for(const o of scene.children.slice(n0))if(o!==RIVERG)RIVERG.add(o);
  { const nl=[]; RIVERG.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)nl.push(o); }); for(const L of nl){ L.userData.grp=RIVERG; L.castShadow=false; L.removeFromParent(); LITE.recs.push(L); } }
  const t0=RIVER.tick, p0=RIVER.pre; RIVER.tick=(dt,pos)=>{ if(RIVER.shown)t0(dt,pos); }; RIVER.pre=(...a)=>{ if(RIVER.shown)p0(...a); };
  if(window.CLIP)window.CLIP.run(); };
{ const zA=()=>Math.min(SHARED.BOD.ZS(BLOCK.alley[0]),SHARED.BOD.ZS(BLOCK.alley[1])), zN=()=>Math.max(SHARED.BOD.ZS(BLOCK.alley[0]),SHARED.BOD.ZS(BLOCK.alley[1])); let busy=false;
  // the river's side of the map, but not the places built off the map there (your fire escape, the night market) nor your apartment
  const offMap=(x,z)=>{ '@later'; if(MODS.apts&&MODS.apts.inReal||ROOMS.boxAt&&ROOMS.boxAt(x,z))return true; const X=SHARED.BOD.X, Z=SHARED.BOD.Z; for(const n in STORE.off||{}){ const [a,b,c,d]=STORE.off[n].lot, x0=Math.min(X(a),X(c)), x1=Math.max(X(a),X(c)), z0=Math.min(Z(b),Z(d)), z1=Math.max(Z(b),Z(d)); if(x>x0&&x<x1&&z>z0&&z<z1)return true; } return false; };
  RIVER.inZone=(x,z)=>SHARED.LVL==='up'&&z<Math.min(zA(),SHARED.BOD.ZS(BLOCK.row2[0]))&&!offMap(x,z);
  // seen from near too (owner, 4 Nov 2026: "why isnt the hudson showing"): within NEAR of its side it is built quietly and drawn
  RIVER.zLine=()=>Math.min(zA(),SHARED.BOD.ZS(BLOCK.row2[0])); const NEAR=60*TILE;
  // and from the air whenever it is in view (owner, 9 Nov 2026, flying over Market St: "entire hudson vanishes"): a camera over the roofs that sees anything south of the river's line
  const SF=new THREE.Frustum(), SM=new THREE.Matrix4(), SB=new THREE.Box3(), seen=()=>{ const c=SHARED.cam; if(!c||!UI.persp||c.position.y<20*TILE||MODS.apts&&MODS.apts.inReal)return false; SM.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse); SF.setFromProjectionMatrix(SM); SB.min.set(-1e5,-10*TILE,-1e5); SB.max.set(1e5,0,RIVER.zLine()); return SF.intersectsBox(SB); };
  SYS.add('places',()=>{ if(!window.__started||busy||ROOMS.cur)return; const p=pos, inz=RIVER.inZone(p.x,p.z), near=SHARED.LVL==='up'&&(p.z-RIVER.zLine()<NEAR||seen());
    if(inz&&!RIVER.on){ busy=true; FADE.run('ENTERING THE HUDSON',()=>RIVER.build()).then(()=>{ busy=false; }); return; }
    if(near&&!RIVER.on){ busy=true; LOAD('later').then(()=>{ RIVER.build(); }).finally(()=>{ busy=false; }); return; }
    const show=RIVER.on&&(inz||p.z<zN()||near); if(show!==RIVER.shown){ RIVER.shown=show; RIVERG.visible=show; } },'066-river'); }
export {RIVER};
