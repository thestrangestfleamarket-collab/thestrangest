// EDGE OF 88: the whole game (the lift, the plank, the city at sunset, fear, sound); three 0.147 is put in ahead of it by tools/edge.cjs
(() => {
'use strict';
const T = THREE;
const $ = id => document.getElementById(id);

// ---------- helpers ----------
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
let maxAniso=4;
function tex(c,rep,srgb=true){const t=new T.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;}t.anisotropy=maxAniso;if(srgb)t.encoding=T.sRGBEncoding;return t;}
function worldBox(x0,x1,y0,y1,z0,z1,cu,cv){
  const g=new T.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    if(Math.abs(n.getX(i))>.5)uv.setXY(i,z/cu,y/cv);else if(Math.abs(n.getY(i))>.5)uv.setXY(i,x/cu,z/cu);else uv.setXY(i,x/cu,y/cv);}
  return g;
}
const mergeGeo=gs=>T.BufferGeometryUtils.mergeBufferGeometries(gs,false);

// ---------- renderer ----------
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const PR=Math.min(window.devicePixelRatio||1,1.75);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=.6;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.xr.enabled=true;
renderer.xr.setReferenceSpaceType('local-floor');
if(renderer.xr.setFoveation)renderer.xr.setFoveation(1);
maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());

// ---------- sky + sun ----------
const SUN=new T.Vector3().setFromSphericalCoords(1,T.MathUtils.degToRad(90-2.6),T.MathUtils.degToRad(146));
function makeSky(){const s=new T.Sky();const u=s.material.uniforms;u.turbidity.value=10;u.rayleigh.value=3;u.mieCoefficient.value=.006;u.mieDirectionalG.value=.88;u.sunPosition.value.copy(SUN);s.frustumCulled=false;return s;}
const skyScene=new T.Scene();const skyProbe=makeSky();skyProbe.scale.setScalar(10);skyScene.add(skyProbe);

// sample the sky at the horizon so the haze matches it exactly
const FOG=new T.Color(.12,.09,.10),SUNHAZE=new T.Color(.5,.3,.18);
(function probe(){
  try{
    const rt=new T.WebGLRenderTarget(4,4,{type:T.FloatType});const cam=new T.PerspectiveCamera(3,1,.1,100);
    const tm=renderer.toneMapping;renderer.toneMapping=T.NoToneMapping;
    const read=(az)=>{const d=new T.Vector3().setFromSphericalCoords(1,T.MathUtils.degToRad(89),az);cam.position.set(0,0,0);cam.lookAt(d);
      renderer.setRenderTarget(rt);renderer.render(skyScene,cam);const b=new Float32Array(16*4);renderer.readRenderTargetPixels(rt,0,0,4,4,b);
      let r=0,g=0,bl=0;for(let i=0;i<16;i++){r+=b[i*4];g+=b[i*4+1];bl+=b[i*4+2];}return new T.Color(r/16,g/16,bl/16);};
    const sAz=Math.atan2(SUN.x,SUN.z);
    const away=read(sAz+Math.PI),side1=read(sAz+Math.PI/2),side2=read(sAz-Math.PI/2),toward=read(sAz+.35);
    renderer.setRenderTarget(null);renderer.toneMapping=tm;rt.dispose();
    const c=new T.Color().copy(away).add(side1).add(side2).multiplyScalar(1/3);
    if(isFinite(c.r)&&c.r+c.g+c.b>1e-4){FOG.copy(c);SUNHAZE.copy(toward);const m=Math.max(SUNHAZE.r,SUNHAZE.g,SUNHAZE.b),lim=Math.max(c.r,c.g,c.b)*4;if(m>lim)SUNHAZE.multiplyScalar(lim/m);}
  }catch(e){renderer.setRenderTarget(null);}
})();

// altitude-dependent aerial haze, applied in linear HDR before tone mapping
(function installHaze(){
  const v3=c=>{const a=c.isVector3?[c.x,c.y,c.z]:[c.r,c.g,c.b];return`vec3(${a.map(v=>v.toFixed(5)).join(',')})`;};
  const SC=T.ShaderChunk;
  SC.fog_pars_vertex='#ifdef USE_FOG\nvarying float vFogDepth;\nvarying vec3 vFogWorld;\n#endif';
  SC.fog_vertex='#ifdef USE_FOG\nvFogDepth=-mvPosition.z;\nvec4 fogP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfogP=instanceMatrix*fogP;\n#endif\nvFogWorld=(modelMatrix*fogP).xyz;\n#endif';
  SC.fog_pars_fragment='#ifdef USE_FOG\nuniform vec3 fogColor;\nvarying float vFogDepth;\nvarying vec3 vFogWorld;\n#ifdef FOG_EXP2\nuniform float fogDensity;\n#else\nuniform float fogNear;\nuniform float fogFar;\n#endif\n#endif';
  SC.fog_fragment='';
  SC.tonemapping_fragment=`#if defined(USE_FOG) && defined(FOG_EXP2)
  {
    vec3 fRay=vFogWorld-cameraPosition;float fDist=length(fRay);vec3 fDir=fRay/max(fDist,1e-3);
    float camH=max(cameraPosition.y-fogDensity,0.0);
    const float FA=0.00085;const float FB=0.0032;
    float dy=fDir.y*FB*fDist;float e0=FA*exp(-FB*camH);
    float amt=abs(dy)>1e-4?e0*fDist*(1.0-exp(-dy))/dy:e0*fDist;
    float ff=1.0-exp(-max(amt,0.0));
    float sa=pow(max(dot(fDir,${v3(SUN)}),0.0),5.0);
    vec3 fc=mix(fogColor,${v3(SUNHAZE)},sa);
    #ifdef FOG_FADE
    gl_FragColor.rgb*=1.0-ff;
    #else
    gl_FragColor.rgb=mix(gl_FragColor.rgb,fc,ff);
    #endif
  }
  #endif
  #if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
  #endif`;
})();

const scene=new T.Scene();
scene.fog=new T.FogExp2(FOG,0);
const sky=makeSky();sky.scale.setScalar(20);sky.renderOrder=-10;scene.add(sky);
const pmrem=new T.PMREMGenerator(renderer);
const envRT=pmrem.fromScene(skyScene,0,.1,100);
scene.environment=envRT.texture;

const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,.06,22000);
camera.rotation.order='YXZ';
const rig=new T.Group();rig.add(camera);scene.add(rig);
camera.position.set(0,1.65,0);

const sunL=new T.DirectionalLight(0xffb07a,3.2);
sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);
const sc=sunL.shadow.camera;sc.left=-26;sc.right=26;sc.top=26;sc.bottom=-26;sc.near=1;sc.far=220;
sunL.shadow.bias=-.0003;sunL.shadow.normalBias=.03;
sunL.target.position.set(0,-6,-2);sunL.position.copy(sunL.target.position).addScaledVector(SUN,110);
scene.add(sunL,sunL.target);
scene.add(new T.HemisphereLight(0x6f7fb0,0x3a2a22,.25));

// sun glare sprite (also visible in VR, where there's no bloom)
function glowCanvas(soft){const c=cnv(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(soft?.08:.22,'rgba(255,255,255,'+(soft?.5:.75)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c;}
const glowT=tex(glowCanvas(false),false,false),softT=tex(glowCanvas(true),false,false);
const sunGlow=new T.Sprite(new T.SpriteMaterial({map:softT,color:0xffc890,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));
sunGlow.scale.setScalar(2600);scene.add(sunGlow);

// ---------- textures ----------
function facadeTextures(style){
  // style 0: office grid, 1: glass curtain wall, 2: stone with punched windows
  const S=16,P=32,r=rng(11+style*7),C=S*P,m=cnv(C,C),e=cnv(C,C),q=cnv(C,C),gm=m.getContext('2d'),ge=e.getContext('2d'),gq=q.getContext('2d');
  const litP=[.12,.06,.14][style];
  const wall=['#8a8178','#2c3036','#b3a48e'][style],wallR=[210,140,235][style];
  gm.fillStyle=wall;gm.fillRect(0,0,C,C);ge.fillStyle='#000';ge.fillRect(0,0,C,C);gq.fillStyle=`rgb(0,${wallR},0)`;gq.fillRect(0,0,C,C);
  if(style===2){for(let i=0;i<2600;i++){gm.fillStyle=`rgba(${r()<.5?'70,60,50':'220,205,185'},${r()*.12})`;gm.fillRect(r()*C,r()*C,2+r()*10,1+r()*3);}}
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const L=r()<litP?(r()<.75?1:r()<.6?2:3):0;
    let wx,wy,ww,wh;
    if(style===0){wx=x*P+3;wy=y*P+4;ww=P-6;wh=P-9;}
    else if(style===1){wx=x*P+1;wy=y*P+1;ww=P-2;wh=P-6;}
    else{wx=x*P+9;wy=y*P+6;ww=P-18;wh=P-13;}
    const glass=style===1?['#5d6b7c','#66778a','#56626f','#6e7d8e'][Math.floor(r()*4)]:(r()<.5?'#2a3140':'#343c4a');
    gm.fillStyle=L?'#4a3c2c':glass;gm.fillRect(wx,wy,ww,wh);
    if(style===1){gm.fillStyle='rgba(20,24,30,.9)';gm.fillRect(x*P,y*P+P-6,P,6);}
    if(style===2){gm.fillStyle='rgba(60,52,44,.5)';gm.fillRect(wx-2,wy+wh,ww+4,3);}
    gq.fillStyle=L?'rgb(0,110,0)':'rgb(0,'+(5+Math.floor(r()*(style===1?8:20)))+',0)';gq.fillRect(wx,wy,ww,wh);
    if(L){ge.fillStyle=L===1?'#ffb868':L===2?'#bcd4ff':'#ff9248';const blind=r()<.35?wh*(.3+r()*.4):0;ge.fillRect(wx,wy+blind,ww,wh-blind);}}
  return{map:tex(m,true),em:tex(e,true),rough:tex(q,true,false)};
}
function towerTextures(){
  const C=8,P=64,r=rng(5),C2=C*P,m=cnv(C2,C2),e=cnv(C2,C2),q=cnv(C2,C2),g=m.getContext('2d'),ge=e.getContext('2d'),gq=q.getContext('2d');
  ge.fillStyle='#000';ge.fillRect(0,0,C2,C2);g.fillStyle='#4a4640';g.fillRect(0,0,C2,C2);gq.fillStyle='rgb(0,120,0)';gq.fillRect(0,0,C2,C2);
  for(let y=0;y<C;y++)for(let x=0;x<C;x++){
    g.fillStyle='#68717e';g.fillRect(x*P+3,y*P+3,P-6,P-14);
    gq.fillStyle='rgb(0,'+(6+Math.floor(r()*10))+',0)';gq.fillRect(x*P+3,y*P+3,P-6,P-14);
    g.fillStyle='#3a3d42';g.fillRect(x*P+3,y*P+P-11,P-6,8); // spandrel
    if(r()<.18){ge.fillStyle=r()<.7?'#5a4226':'#3a465a';ge.fillRect(x*P+3,y*P+3,P-6,P-14);}
  }
  return{map:tex(m,true),em:tex(e,true),rough:tex(q,true,false)};
}
function noiseCanvas(w,h,base,amp,streak,seed=3){
  const c=cnv(w,h),g=c.getContext('2d'),d=g.createImageData(w,h),r=rng(seed);
  const cols=[];for(let x=0;x<w;x++)cols.push(r());
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=streak?(cols[x]*.7+r()*.3):r();const v=(n-.5)*amp;
    d.data[i]=clamp(base[0]+v,0,255);d.data[i+1]=clamp(base[1]+v,0,255);d.data[i+2]=clamp(base[2]+v,0,255);d.data[i+3]=255;}
  g.putImageData(d,0,0);return c;
}
function woodCanvas(bump){
  const w=128,h=2048,c=cnv(w,h),g=c.getContext('2d'),r=rng(21);
  g.fillStyle=bump?'#808080':'#8b6942';g.fillRect(0,0,w,h);
  for(let i=0;i<120;i++){const x=r()*w,wd=.6+r()*2.6;
    g.strokeStyle=bump?`rgba(${r()<.5?'40,40,40':'200,200,200'},${.2+r()*.4})`:`rgba(${r()<.5?'58,36,16':'176,138,92'},${.15+r()*.35})`;g.lineWidth=wd;
    g.beginPath();g.moveTo(x,0);const ph=r()*6,amp=1+r()*4;for(let y=0;y<=h;y+=24)g.lineTo(x+Math.sin(y*.004+ph)*amp,y);g.stroke();}
  for(let k=0;k<4;k++){const kx=16+r()*96,ky=r()*h;for(let ring=14;ring>0;ring-=3){g.strokeStyle=bump?'rgba(30,30,30,.5)':'rgba(52,32,14,.45)';g.lineWidth=1.5;g.beginPath();g.ellipse(kx,ky,ring*.6,ring*1.6,0,0,7);g.stroke();}}
  for(let i=0;i<140;i++){g.fillStyle=bump?`rgba(60,60,60,${r()*.25})`:`rgba(28,20,12,${r()*.14})`;g.fillRect(r()*w,r()*h,4+r()*18,2+r()*8);}
  // weathered ends + nail holes
  for(const y of[60,h-50]){for(const x of[24,104]){g.fillStyle=bump?'#202020':'#22160c';g.beginPath();g.arc(x,y,3.5,0,7);g.fill();}}
  if(!bump){g.save();g.translate(64,170);g.rotate(Math.PI/2);g.fillStyle='rgba(232,216,186,.7)';g.font='bold 26px monospace';g.textAlign='center';g.fillText('MAX 1 PERSON',0,9);g.restore();}
  return c;
}
function cloudCanvas(seed){const c=cnv(256,256),g=c.getContext('2d'),r=rng(seed);
  for(let i=0;i<46;i++){const x=56+r()*144,y=56+r()*144,rad=18+r()*64;const gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(255,255,255,.2)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}
  return c;}
function groundCanvas(){
  const N=1024,c=cnv(N,N),g=c.getContext('2d'),s=Math.round(16/76*N/2),side=Math.round(3.5/76*N),r=rng(77);
  g.fillStyle='#232326';g.fillRect(0,0,N,N);
  // asphalt patches
  for(let i=0;i<300;i++){g.fillStyle=`rgba(${r()<.5?'10,10,12':'60,58,58'},${r()*.18})`;const px=r()*N,py=r()*N;g.fillRect(px,py,8+r()*40,4+r()*20);}
  g.fillStyle='#57524d';g.fillRect(s,s,N-2*s,N-2*s);
  g.fillStyle='#3e3b38';g.fillRect(s+side,s+side,N-2*s-2*side,N-2*s-2*side);
  for(let i=0;i<400;i++){g.fillStyle=`rgba(${r()<.5?'20,20,20':'90,86,80'},${r()*.25})`;g.fillRect(s+side+r()*(N-2*s-2*side-20),s+side+r()*(N-2*s-2*side-20),6+r()*30,6+r()*30);}
  g.fillStyle='rgba(225,200,120,.6)';
  for(let i=0;i<N;i+=26){g.fillRect(i,0,13,3);g.fillRect(i,N-3,13,3);g.fillRect(0,i,3,13);g.fillRect(N-3,i,3,13);}
  g.fillStyle='rgba(230,230,230,.45)';
  for(let i=0;i<8;i++){g.fillRect(s+10+i*12,0,6,s-6);g.fillRect(s+10+i*12,N-s+6,6,s-6);g.fillRect(0,s+10+i*12,s-6,6);g.fillRect(N-s+6,s+10+i*12,s-6,6);}
  return c;
}
function rippleNormal(){
  const N=256,c=cnv(N,N),g=c.getContext('2d'),d=g.createImageData(N,N),r=rng(5);
  const waves=[];for(let i=0;i<9;i++)waves.push([r()*6.28,1+Math.floor(r()*6),1+Math.floor(r()*6),r()*6.28,.3+r()*.7]);
  const h=(x,y)=>{let v=0;for(const w of waves)v+=Math.sin((x*w[1]*Math.cos(w[0])+y*w[2]*Math.sin(w[0]))*6.283/N*2+w[3])*w[4];return v;};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=h(x+1,y)-h(x-1,y),dy=h(x,y+1)-h(x,y-1);const n=new T.Vector3(-dx,-dy,2.5).normalize();const i=(y*N+x)*4;
    d.data[i]=(n.x*.5+.5)*255;d.data[i+1]=(n.y*.5+.5)*255;d.data[i+2]=(n.z*.5+.5)*255;d.data[i+3]=255;}
  g.putImageData(d,0,0);return tex(c,true,false);
}

// ---------- city ----------
const city=new T.Group();scene.add(city);
const BLOCK=76,HALF=30,STREET=38,RIVER_Z=-722,RIVER_HALF=48;
const PARKS={'1,-1':1,'-3,-4':1,'4,2':1,'-5,3':1};
const facT=[0,1,2].map(facadeTextures);
const fadeMat=p=>{const m=new T.PointsMaterial(p);m.defines={FOG_FADE:''};return m;};
const beaconMat=fadeMat({color:0xff2414,size:5,map:glowT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
(function buildCity(){
  const r=rng(1987);
  const GEO=[0,1,2].map(()=>({pos:[],uv:[],col:[],idx:[],vi:0}));let cur=GEO[0],CU=2.2*16;const CUS=[2.2*16,1.6*16,3*16];
  const rpos=[],rcol=[],ridx=[];let rvi=0;
  const aviation=[],trees=[];
  const CV=3.6*16;
  function quad(a,b,c,d,u0,v0,u1,v1,t){const G=cur;G.pos.push(...a,...b,...c,...d);G.uv.push(u0,v0,u1,v0,u1,v1,u0,v1);for(let k=0;k<4;k++)G.col.push(t[0],t[1],t[2]);G.idx.push(G.vi,G.vi+1,G.vi+2,G.vi,G.vi+2,G.vi+3);G.vi+=4;}
  function roof(x0,x1,z0,z1,h,t){rpos.push(x0,h,z1,x1,h,z1,x1,h,z0,x0,h,z0);for(let k=0;k<4;k++)rcol.push(t[0]*.55,t[1]*.55,t[2]*.55);ridx.push(rvi,rvi+1,rvi+2,rvi,rvi+2,rvi+3);rvi+=4;}
  function box(x,z,w,d,h,t,y0=0,windows=true){
    const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,uo=Math.floor(r()*16)/16,vo=Math.floor(r()*16)/16,s=windows?1:.0001,vy0=vo+y0/CV*s;
    quad([x0,y0,z1],[x1,y0,z1],[x1,h,z1],[x0,h,z1],uo,vy0,uo+w/CU*s,vo+h/CV*s,t);
    quad([x1,y0,z0],[x0,y0,z0],[x0,h,z0],[x1,h,z0],uo+.3,vy0,uo+.3+w/CU*s,vo+h/CV*s,t);
    quad([x1,y0,z1],[x1,y0,z0],[x1,h,z0],[x1,h,z1],uo+.6,vy0,uo+.6+d/CU*s,vo+h/CV*s,t);
    quad([x0,y0,z0],[x0,y0,z1],[x0,h,z1],[x0,h,z0],uo+.1,vy0,uo+.1+d/CU*s,vo+h/CV*s,t);
    roof(x0,x1,z0,z1,h,t);
  }
  function tint(){const k=.6+r()*.55,w=r();if(r()<.18)return[k*.75,k*.85,k*1.05];return[k*(1+w*.18),k*(1+w*.06),k*(1-w*.1)];}
  function building(x,z,w,d,h){
    const st=h>170?(r()<.7?1:0):(r()<.38?0:r()<.5?1:2);cur=GEO[st];CU=CUS[st];
    const t=st===1?[.85+r()*.3,.9+r()*.25,1+r()*.15]:tint();box(x,z,w,d,h,t);
    if(h>60&&r()<.5){const sw=w*(.55+r()*.25),sd=d*(.55+r()*.25),sh=h+h*(.08+r()*.25);box(x+(r()-.5)*(w-sw)*.5,z+(r()-.5)*(d-sd)*.5,sw,sd,sh,t,h);h=sh;}
    cur=GEO[0];CU=CUS[0];const units=r()<.7?1+Math.floor(r()*3):0;for(let i=0;i<units;i++){const tw=2+r()*4;box(x+(r()-.5)*w*.6,z+(r()-.5)*d*.6,tw,tw*(.6+r()*.8),h+1.5+r()*3,[.42,.4,.38],h,false);}
    if(h>140){aviation.push(x,h+3,z);if(h>220)aviation.push(x-w*.4,h+1,z-d*.4,x+w*.4,h+1,z+d*.4);}
  }
  const specials={'-1,-1':262,'1,-2':232,'-2,-3':348,'2,0':150,'-2,1':186,'3,-4':291,'0,-1':22,'0,-2':34,'-1,0':48,'1,0':64};
  const R=1180;
  for(let k=-16;k<=16;k++)for(let m=-16;m<=16;m++){
    const bx=k*BLOCK,bz=m*BLOCK,dist=Math.hypot(bx,bz);if(dist>R)continue;if(k===0&&m===0)continue;
    if(Math.abs(bz-RIVER_Z)<80)continue;
    const key=k+','+m;
    if(PARKS[key]){for(let i=0;i<70;i++)trees.push([bx+(r()-.5)*52,bz+(r()-.5)*52,3+r()*3.5]);continue;}
    if(specials[key]){building(bx,bz,44,44,specials[key]);continue;}
    const core=1+1.6*Math.exp(-dist/420);
    const lots=r()<.3?1:r()<.5?2:4;const inner=HALF-2;
    const make=(cx,cz,w,d)=>{const sw=w*(.75+r()*.22),sd=d*(.75+r()*.22);let h=(10+Math.pow(r(),2.3)*120)*core;if(r()<.035)h=200+r()*160;building(cx+(r()-.5)*(w-sw),cz+(r()-.5)*(d-sd),sw,sd,h);};
    if(lots===1)make(bx,bz,inner*2,inner*2);
    else if(lots===2){if(r()<.5){make(bx-inner/2,bz,inner,inner*2);make(bx+inner/2,bz,inner,inner*2);}else{make(bx,bz-inner/2,inner*2,inner);make(bx,bz+inner/2,inner*2,inner);}}
    else{for(const a of[-1,1])for(const b of[-1,1])make(bx+a*inner/2,bz+b*inner/2,inner,inner);}
  }
  GEO.forEach((G,i)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(G.pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(G.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(G.col,3));g.setIndex(G.idx);g.computeVertexNormals();
    city.add(new T.Mesh(g,new T.MeshStandardMaterial({map:facT[i].map,emissiveMap:facT[i].em,emissive:0xffffff,emissiveIntensity:.7,roughnessMap:facT[i].rough,roughness:1,metalness:i===1?.45:0,vertexColors:true,envMapIntensity:i===1?1.5:1.2})));});
  const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(rpos,3));rg.setAttribute('color',new T.Float32BufferAttribute(rcol,3));rg.setIndex(ridx);rg.computeVertexNormals();
  city.add(new T.Mesh(rg,new T.MeshStandardMaterial({color:0x6a625c,vertexColors:true,roughness:.92,envMapIntensity:.6})));
  const ag=new T.BufferGeometry();ag.setAttribute('position',new T.Float32BufferAttribute(aviation,3));
  city.add(new T.Points(ag,beaconMat));
  // ground
  const gt=tex(groundCanvas(),true);const GS=16000;gt.repeat.set(GS/BLOCK,GS/BLOCK);const off=.5-((GS/2/BLOCK)%1);gt.offset.set(off,off);
  const ground=new T.Mesh(new T.PlaneGeometry(GS,GS),new T.MeshStandardMaterial({map:gt,roughness:.95,envMapIntensity:.5}));ground.rotation.x=-Math.PI/2;city.add(ground);
  // river
  const rn=rippleNormal();rn.repeat.set(160,2.5);
  const water=new T.Mesh(new T.PlaneGeometry(GS,RIVER_HALF*2),new T.MeshStandardMaterial({color:0x061018,roughness:.04,metalness:0,normalMap:rn,normalScale:new T.Vector2(.25,.25),envMapIntensity:1.6}));
  water.rotation.x=-Math.PI/2;water.position.set(0,.4,RIVER_Z);city.add(water);city.userData.water=rn;
  // embankment walls
  for(const s of[-1,1])city.add(new T.Mesh(new T.BoxGeometry(GS,3,2).translate(0,1,RIVER_Z+s*(RIVER_HALF+1)),new T.MeshStandardMaterial({color:0x6b645c,roughness:.95})));
  // parks
  const grass=new T.MeshStandardMaterial({color:0x2c3a22,roughness:1,envMapIntensity:.4});
  for(const key in PARKS){const[k,m]=key.split(',').map(Number);const p=new T.Mesh(new T.PlaneGeometry(56,56),grass);p.rotation.x=-Math.PI/2;p.position.set(k*BLOCK,.08,m*BLOCK);city.add(p);}
  const tg=new T.IcosahedronGeometry(1,1),tm=new T.MeshStandardMaterial({color:0x2e3d20,roughness:1,flatShading:true,envMapIntensity:.4});
  const tim=new T.InstancedMesh(tg,tm,trees.length),dm=new T.Object3D();
  trees.forEach((t,i)=>{dm.position.set(t[0],t[2]*1.4,t[1]);dm.scale.set(t[2],t[2]*1.15,t[2]);dm.rotation.y=r()*6;dm.updateMatrix();tim.setMatrixAt(i,dm.matrix);});city.add(tim);
  // streetlights
  const sl=[];for(let k=-16;k<=15;k++){const L=STREET+k*BLOCK;for(let s=-R;s<=R;s+=28){for(const side of[-9,9]){if(Math.hypot(L,s)<R){if(Math.abs(L-RIVER_Z)>50)sl.push(s,7,L+side);sl.push(L+side,7,s);}}}}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sl,3));
  city.add(new T.Points(sg,fadeMat({color:0xffa850,size:1.5,map:glowT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})));
})();

// traffic
const NC=900,cars=[];
const headP=new Float32Array(NC*3),tailP=new Float32Array(NC*3);
(function(){const r=rng(42);while(cars.length<NC){const axis=r()<.5?0:1,k=Math.floor(r()*31)-15,dir=r()<.5?-1:1,line=STREET+k*BLOCK+dir*3;if(axis===0&&Math.abs(line-RIVER_Z)<50)continue;cars.push({axis,line,dir,p:(r()*2-1)*1150,v:6+r()*10});}})();
const headG=new T.BufferGeometry();headG.setAttribute('position',new T.BufferAttribute(headP,3));
const tailG=new T.BufferGeometry();tailG.setAttribute('position',new T.BufferAttribute(tailP,3));
headG.boundingSphere=new T.Sphere(new T.Vector3(),3000);tailG.boundingSphere=headG.boundingSphere;
city.add(new T.Points(headG,fadeMat({color:0xfff0d8,size:1.7,map:glowT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})));
city.add(new T.Points(tailG,fadeMat({color:0xff2418,size:1.4,map:glowT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})));
function updateCars(dt){
  for(let i=0;i<NC;i++){const c=cars[i];c.p+=c.v*c.dir*dt;if(c.p>1150)c.p=-1150;if(c.p<-1150)c.p=1150;
    const hp=c.p+c.dir*2,tp=c.p-c.dir*2,j=i*3;
    if(c.axis===0){headP[j]=hp;headP[j+1]=1;headP[j+2]=c.line;tailP[j]=tp;tailP[j+1]=1;tailP[j+2]=c.line;}
    else{headP[j]=c.line;headP[j+1]=1;headP[j+2]=hp;tailP[j]=c.line;tailP[j+1]=1;tailP[j+2]=tp;}}
  headG.attributes.position.needsUpdate=true;tailG.attributes.position.needsUpdate=true;
}

// cloud deck under the top floors
const clouds=[];
(function(){const r=rng(9);const cts=[1,2,3].map(s=>tex(cloudCanvas(s)));
  for(let i=0;i<18;i++){const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:cts[i%3],transparent:true,depthWrite:false,side:T.DoubleSide,color:new T.Color(1.3,.9,.78),opacity:.45}));
    const s=180+r()*340;m.scale.set(s,s*.7,1);m.rotation.x=-Math.PI/2;m.rotation.z=r()*6.28;
    const a=r()*6.28,d=140+r()*1400;m.position.set(Math.cos(a)*d,212+r()*40,Math.sin(a)*d);city.add(m);clouds.push(m);}})();

// gulls circling below you
const birds=[];
(function(){const r=rng(31);const bm=new T.MeshStandardMaterial({color:0x2a2726,roughness:.9,side:T.DoubleSide});
  const wing=new T.BufferGeometry();wing.setAttribute('position',new T.Float32BufferAttribute([0,0,.18, 0,0,-.12, .75,.05,-.05],3));wing.computeVertexNormals();
  for(let i=0;i<16;i++){const b=new T.Group();const body=new T.Mesh(new T.BoxGeometry(.12,.1,.5),bm);const wl=new T.Mesh(wing,bm),wr=new T.Mesh(wing,bm);wr.scale.x=-1;b.add(body,wl,wr);b.scale.setScalar(1.6);
    b.userData={wl,wr,r:40+r()*70,a:r()*6.28,s:(.12+r()*.1)*(r()<.5?1:-1),alt:r(),cx:30+r()*60,cz:-80-r()*80,ph:r()*6};city.add(b);birds.push(b);}})();
function updateBirds(dt){
  for(const b of birds){const u=b.userData;u.a+=u.s*dt;const y=H*(.42+u.alt*.25)+Math.sin(time*.3+u.ph)*4;
    b.position.set(u.cx+Math.cos(u.a)*u.r,Math.max(8,y),u.cz+Math.sin(u.a)*u.r);
    b.rotation.set(0,-u.a-(u.s>0?0:Math.PI),u.s>0?-.35:.35);
    const f=Math.sin(time*7+u.ph);const glide=Math.sin(time*.5+u.ph)>.2?.15:1;u.wl.rotation.z=f*.6*glide;u.wr.rotation.z=-f*.6*glide;}
}

// ---------- the tower you're standing in ----------
const towerT=towerTextures();
const towerMat=new T.MeshStandardMaterial({map:towerT.map,emissiveMap:towerT.em,emissive:0xffffff,emissiveIntensity:1.2,roughnessMap:towerT.rough,roughness:1,metalness:.55,envMapIntensity:1.4});
const finMat=new T.MeshStandardMaterial({color:0x4a443d,metalness:.7,roughness:.42,envMapIntensity:.9});
const tower=new T.Group();scene.add(tower);
function buildTower(H){
  tower.children.forEach(c=>c.geometry.dispose());tower.clear();
  const top=46,CU=24,CV=28,y0=-H;
  const add=(g,m=towerMat)=>{const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;tower.add(mesh);};
  add(worldBox(-18,-0.65,y0,top,0,0.4,CU,CV));
  add(worldBox(0.65,18,y0,top,0,0.4,CU,CV));
  add(worldBox(-0.65,0.65,2.4,top,0,0.4,CU,CV));
  if(H>0.4)add(worldBox(-0.65,0.65,y0,-0.36,0,0.4,CU,CV));
  add(worldBox(-18,18,y0,top,0.4,28,CU,CV));
  // aluminium fins and floor-slab bands: these are what make the drop read as a drop
  const parts=[];
  for(let x=-17.25;x<=17.3;x+=1.5){if(Math.abs(x)<1)continue;parts.push(new T.BoxGeometry(.06,H+top,.18).translate(x,(top-H)/2,-.09));}
  for(let k=Math.ceil(-H/3.5);k<=13;k++){const y=k*3.5;
    if(k===0){parts.push(new T.BoxGeometry(17,.16,.14).translate(-9.5,y-.08,-.07));parts.push(new T.BoxGeometry(17,.16,.14).translate(9.5,y-.08,-.07));}
    else parts.push(new T.BoxGeometry(36,.16,.14).translate(0,y-.08,-.07));}
  // window-washing davit track at the roofline
  parts.push(new T.BoxGeometry(36.4,.4,.5).translate(0,top-.2,-.25));
  add(mergeGeo(parts),finMat);
}

// ---------- elevator ----------
const steel=tex(noiseCanvas(512,64,[150,152,156],22,true),true);
const steelMat=new T.MeshStandardMaterial({map:steel,color:0xc9ccd0,roughness:.38,metalness:.6,envMapIntensity:.25});
const doorMat=new T.MeshStandardMaterial({map:steel,color:0xb8bcc2,roughness:.3,metalness:.7,envMapIntensity:.3});
const floorMat=new T.MeshStandardMaterial({map:tex(noiseCanvas(128,128,[44,44,46],30,false,8),true),roughness:.95,envMapIntensity:.2});
const concreteC=noiseCanvas(256,256,[132,126,118],70,false,4);
const concrete=new T.MeshStandardMaterial({map:tex(concreteC,true),bumpMap:tex(concreteC,true,false),bumpScale:.004,roughness:1});
const elev=new T.Group();scene.add(elev);
[[-0.65,0.65,-0.1,0,0,0.4,floorMat],[-1,1,-0.1,0,0.4,2.4,floorMat],[-1,1,2.6,2.7,0.4,2.5,steelMat],[-1,1,0,2.6,2.4,2.5,steelMat],[-1.1,-1,0,2.6,0.4,2.4,steelMat],[1,1.1,0,2.6,0.4,2.4,steelMat],
 [-1,-0.65,0,2.6,0.38,0.4,steelMat],[0.65,1,0,2.6,0.38,0.4,steelMat],[-0.65,0.65,2.4,2.6,0.38,0.4,steelMat]
].forEach(b=>{const m=new T.Mesh(worldBox(b[0],b[1],b[2],b[3],b[4],b[5],1.2,1.2),b[6]);m.receiveShadow=true;m.castShadow=true;elev.add(m);});
elev.add(new T.Mesh(new T.CylinderGeometry(.02,.02,1.8,12).rotateZ(Math.PI/2).translate(0,.95,2.33),steelMat));
// door sill track
elev.add(new T.Mesh(new T.BoxGeometry(1.3,.012,.12).translate(0,.006,.18),new T.MeshStandardMaterial({color:0x8a8d92,metalness:.9,roughness:.3})));
const ceilLight=new T.Mesh(new T.PlaneGeometry(1.2,.5),new T.MeshBasicMaterial({color:new T.Color(2.2,2.0,1.7),toneMapped:true}));ceilLight.rotation.x=Math.PI/2;ceilLight.position.set(0,2.595,1.4);elev.add(ceilLight);
const elevLight=new T.PointLight(0xffecd2,1.6,6,2);elevLight.position.set(0,2.3,1.4);elev.add(elevLight);
const doorL=new T.Mesh(worldBox(-0.33,0.33,0,2.4,0.15,0.2,1.2,1.2),doorMat),doorR=doorL.clone();doorL.castShadow=doorR.castShadow=true;elev.add(doorL,doorR);
let doorOpen=0,doorTarget=0;
function placeDoors(){const o=.33+.645*doorOpen;doorL.position.x=-o;doorR.position.x=o;}
// floor display
const dispC=cnv(512,128),dispT=tex(dispC);
const disp=new T.Mesh(new T.PlaneGeometry(.72,.18),new T.MeshBasicMaterial({map:dispT,color:new T.Color(1.6,1.6,1.6)}));disp.position.set(0,2.5,0.372);elev.add(disp);
function drawDisplay(main,sub){const g=dispC.getContext('2d');g.fillStyle='#0b0706';g.fillRect(0,0,512,128);g.fillStyle='#ff8a2a';g.shadowColor='#ff6a00';g.shadowBlur=14;
  g.font='600 76px "IBM Plex Mono",monospace';g.textBaseline='middle';g.textAlign='left';g.fillText(main,26,68);
  if(sub){g.font='600 26px "IBM Plex Mono",monospace';g.textAlign='right';g.fillText(sub,488,68);}dispT.needsUpdate=true;}
// button panel
const FLOORS=[{id:'88',n:88},{id:'40',n:40},{id:'12',n:12},{id:'L',n:0}];
const heightOf=f=>f.n===0?0.25:f.n*3.5;
const panel=new T.Group();panel.position.set(0.985,1.25,0.95);panel.rotation.y=-Math.PI/2;elev.add(panel);
panel.add(new T.Mesh(new T.PlaneGeometry(.2,.6),new T.MeshStandardMaterial({color:0x26282c,roughness:.4,metalness:.5})));
function btnTex(label,state){const c=cnv(128,128),g=c.getContext('2d');g.fillStyle='#2a2c30';g.fillRect(0,0,128,128);
  g.beginPath();g.arc(64,64,58,0,7);g.fillStyle=state===2?'#ffb24a':state===1?'#6a6e74':'#3c3f44';g.fill();
  g.lineWidth=6;g.strokeStyle=state===2?'#ffe1a8':'#9aa0a8';g.stroke();g.fillStyle=state===2?'#1a1207':'#f0ede6';
  g.font='600 '+(label.length>1?52:60)+'px "IBM Plex Mono",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(label,64,68);return tex(c);}
let ride=null,curFloor=FLOORS[0];
const buttons=FLOORS.map((f,i)=>{const m=new T.Mesh(new T.CircleGeometry(.05,28),new T.MeshBasicMaterial());m.position.set(0,.2-i*.13,.006);m.userData={floor:f,tex:[btnTex(f.id,0),btnTex(f.id,1),btnTex(f.id,2)],state:-1};panel.add(m);return m;});
function refreshButtons(hover){buttons.forEach(b=>{const s=(ride&&ride.to===b.userData.floor)||(!ride&&b.userData.floor===curFloor)?2:b===hover?1:0;if(s!==b.userData.state){b.userData.state=s;b.material.map=b.userData.tex[s];b.material.needsUpdate=true;}});}
const signC=cnv(256,96);const signT=tex(signC);const sign=new T.Mesh(new T.PlaneGeometry(.24,.09),new T.MeshStandardMaterial({map:signT,roughness:.6}));sign.position.set(0.985,1.68,0.95);sign.rotation.y=-Math.PI/2;elev.add(sign);
(function(){const g=signC.getContext('2d');g.fillStyle='#1c1e22';g.fillRect(0,0,256,96);g.fillStyle='#d8d2c6';g.font='600 30px "IBM Plex Mono",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('SERVICE',128,34);g.font='400 22px "IBM Plex Mono",monospace';g.fillText('CAR 3 · 1600 KG',128,68);signT.needsUpdate=true;})();

// ledge + plank
const ledge=new T.Mesh(worldBox(-0.75,0.75,-0.36,-0.045,-0.36,0,1,1),concrete);ledge.castShadow=ledge.receiveShadow=true;elev.add(ledge);
const plankPivot=new T.Group();scene.add(plankPivot);
const woodMap=tex(woodCanvas(false)),woodBump=tex(woodCanvas(true),false,false);
const plankGeo=new T.BoxGeometry(.3,.045,4.9);plankGeo.translate(0,-0.0225,0.3-2.45);
const plank=new T.Mesh(plankGeo,new T.MeshStandardMaterial({map:woodMap,bumpMap:woodBump,bumpScale:.0025,roughness:.82,metalness:0,envMapIntensity:.7}));
plank.castShadow=plank.receiveShadow=true;plankPivot.add(plank);
const clampMat=new T.MeshStandardMaterial({color:0x2b2b2e,roughness:.55,metalness:.7});
for(const x of[-.17,.17]){const c=new T.Mesh(new T.BoxGeometry(.03,.09,.08).translate(x,-.02,-.12),clampMat);c.castShadow=true;plankPivot.add(c);}
const xC=cnv(128,128);(function(){const g=xC.getContext('2d');g.strokeStyle='rgba(245,240,230,.8)';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(22,24);g.lineTo(104,106);g.moveTo(106,22);g.lineTo(24,104);g.stroke();})();
const chalk=new T.Mesh(new T.PlaneGeometry(.26,.26),new T.MeshStandardMaterial({map:tex(xC),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,roughness:1}));
chalk.rotation.x=-Math.PI/2;chalk.position.set(0,.001,-4.32);chalk.receiveShadow=true;plankPivot.add(chalk);

// dust in the sunlight around your head
const NDUST=260,dustP=new Float32Array(NDUST*3);(function(){const r=rng(13);for(let i=0;i<NDUST*3;i++)dustP[i]=(r()-.5)*8;})();
const dustG=new T.BufferGeometry();dustG.setAttribute('position',new T.BufferAttribute(dustP,3));dustG.boundingSphere=new T.Sphere(new T.Vector3(),1e4);
const dust=new T.Points(dustG,new T.PointsMaterial({color:0xffd9a8,size:.012,map:glowT,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
scene.add(dust);
function updateDust(dt){const g=.6+.4*Math.sin(time*.37);for(let i=0;i<NDUST;i++){const j=i*3;dustP[j]+=dt*(.5+g*.9);dustP[j+1]+=Math.sin(time*.7+i)*dt*.05;if(dustP[j]>4)dustP[j]-=8;}
  dust.position.set(head.x,head.y,head.z);dustG.attributes.position.needsUpdate=true;dust.material.opacity=head.z<.4?.7:.7*doorOpen*.3;}

// ---------- head-locked layers: HUD, fear vignette, fade ----------
const hudC=cnv(1024,200),hudT=tex(hudC);
const hud=new T.Mesh(new T.PlaneGeometry(.78,.152),new T.MeshBasicMaterial({map:hudT,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
hud.position.set(0,-.27,-.9);hud.renderOrder=1002;hud.visible=false;camera.add(hud);
const vign=new T.Mesh(new T.SphereGeometry(.2,48,24),new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:T.BackSide,
  uniforms:{inner:{value:1.2},amt:{value:0}},
  vertexShader:'varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform float inner,amt;varying vec3 vL;void main(){float a=acos(clamp(-normalize(vL).z,-1.0,1.0));float v=smoothstep(inner,inner+.55,a);gl_FragColor=vec4(0.02,0.0,0.0,v*amt);}'}));
vign.renderOrder=1000;camera.add(vign);
const fade=new T.Mesh(new T.SphereGeometry(.18,16,8),new T.MeshBasicMaterial({color:0,transparent:true,opacity:0,side:T.BackSide,depthTest:false,depthWrite:false}));
fade.renderOrder=1001;camera.add(fade);
let hudMsg='',hudSub='',hudUntil=0;
function setHud(msg,sub='',secs=0){hudMsg=msg;hudSub=sub;hudUntil=secs?time+secs:0;drawHud();}
function drawHud(){const g=hudC.getContext('2d');g.clearRect(0,0,1024,200);if(!hudMsg){hud.visible=false;return;}hud.visible=true;
  g.font='600 40px "IBM Plex Mono",monospace';const w=Math.min(1000,Math.max(g.measureText(hudMsg).width,hudSub?g.measureText(hudSub).width*0.75:0)+80);
  g.fillStyle='rgba(6,8,12,.72)';g.fillRect(512-w/2,hudSub?20:50,w,hudSub?160:100);
  g.fillStyle='#f1ece2';g.textAlign='center';g.textBaseline='middle';g.fillText(hudMsg,512,hudSub?78:100,980);
  if(hudSub){g.font='400 30px "IBM Plex Mono",monospace';g.fillStyle='#ffb24a';g.fillText(hudSub,512,136,980);}hudT.needsUpdate=true;}

// ---------- desktop / phone post-processing (VR renders direct) ----------
const composer=new T.EffectComposer(renderer,new T.WebGLRenderTarget(innerWidth*PR,innerHeight*PR,{type:T.HalfFloatType,samples:4}));
composer.setPixelRatio(PR);composer.setSize(innerWidth,innerHeight);
composer.addPass(new T.RenderPass(scene,camera));
const bloom=new T.UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.55,.65,.78);composer.addPass(bloom);
const lens=new T.ShaderPass({
  uniforms:{tDiffuse:{value:null},res:{value:new T.Vector2(innerWidth*PR,innerHeight*PR)},time:{value:0},grain:{value:.03},ca:{value:.006},blur:{value:0},desat:{value:0},radial:{value:0},vig:{value:.32}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 res;uniform float time,grain,ca,blur,desat,radial,vig;varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 toSRGB(vec3 c){c=max(c,0.0);return mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(0.0031308,c));}
  void main(){vec2 c=vUv-.5;float asp=res.x/res.y;float r=length(c*vec2(asp,1.0));
    float k=ca*r*r;vec3 col;col.r=texture2D(tDiffuse,vUv-c*k).r;col.g=texture2D(tDiffuse,vUv).g;col.b=texture2D(tDiffuse,vUv+c*k).b;
    float pb=blur*smoothstep(.22,.75,r);
    if(pb>.001){vec3 acc=col;float px=pb*7.0/res.y;for(int i=0;i<12;i++){float a=float(i)*.5236;float d=(i<6)?1.0:2.0;acc+=texture2D(tDiffuse,vUv+vec2(cos(a)/asp,sin(a))*px*d*res.y/res.y).rgb;}col=acc/13.0;}
    if(radial>.001){vec3 acc=col;for(int i=1;i<12;i++){acc+=texture2D(tDiffuse,vUv-c*radial*float(i)/12.0).rgb;}col=acc/12.0;}
    float l=dot(col,vec3(.2126,.7152,.0722));col=mix(col,vec3(l),desat);
    col*=1.0-vig*smoothstep(.35,1.05,r);
    col=toSRGB(col);
    col+=(hash(vUv*res+fract(time*61.0)*137.0)-.5)*grain;
    gl_FragColor=vec4(col,1.0);}`
});
composer.addPass(lens);

// ---------- audio ----------
let ac=null;const A={};
function noiseBuf(sec,brown){const n=ac.sampleRate*sec,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}return b;}
function initAudio(){
  if(ac){ac.resume&&ac.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{ac=new AC();}catch(e){ac=null;return;}
  A.master=ac.createGain();A.master.gain.value=.85;A.master.connect(ac.destination);
  A.out=ac.createBiquadFilter();A.out.type='lowpass';A.out.frequency.value=500;A.out.connect(A.master);
  A.white=noiseBuf(3,false);A.brown=noiseBuf(4,true);
  const loop=(buf,type,f,q,dest)=>{const s=ac.createBufferSource();s.buffer=buf;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ac.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(dest);s.start();return{f:fl,g};};
  A.wind=loop(A.white,'bandpass',450,.6,A.out);
  A.whistle=loop(A.white,'bandpass',1700,10,A.out);
  A.city=loop(A.brown,'lowpass',240,.7,A.out);
  A.rumble=loop(A.brown,'lowpass',130,.8,A.master);
  const hum=ac.createOscillator();hum.type='sawtooth';hum.frequency.value=47;const hf=ac.createBiquadFilter();hf.type='lowpass';hf.frequency.value=150;A.humG=ac.createGain();A.humG.gain.value=0;hum.connect(hf);hf.connect(A.humG);A.humG.connect(A.master);hum.start();
}
function tone(f0,f1,dur,type,peak,dest,delay=0,filt){if(!ac)return;const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let n=o;if(filt){const fl=ac.createBiquadFilter();fl.type=filt[0];fl.frequency.value=filt[1];fl.Q.value=filt[2]||1;o.connect(fl);n=fl;}n.connect(g);g.connect(dest||A.master);o.start(t);o.stop(t+dur+.05);}
function burst(dur,type,f,q,peak,dest,delay=0){if(!ac)return;const t=ac.currentTime+delay,s=ac.createBufferSource();s.buffer=A.white;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ac.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(dest||A.master);s.start(t,Math.random()*2);s.stop(t+dur+.05);}
const sfx={
  ding(){tone(1046,1040,1.6,'sine',.22);tone(784,780,1.9,'sine',.18,null,.32);},
  creak(){const f=110+Math.random()*90;tone(f,f*.6,.35+Math.random()*.3,'sawtooth',.05+Math.random()*.04,A.master,0,['bandpass',500+Math.random()*500,5]);},
  thump(v){tone(62,38,.16,'sine',.25*v);tone(55,36,.14,'sine',.16*v,null,.17);},
  crack(){burst(.09,'highpass',1800,.7,.6);burst(.35,'lowpass',350,.8,.6,null,.01);tone(80,28,.5,'sine',.5,null,.01);tone(160,70,.7,'sawtooth',.06,A.master,.05,['bandpass',420,6]);},
  horn(v){tone(392,390,.3,'square',.03*v,A.out,0,['lowpass',1300,1]);tone(466,464,.3,'square',.025*v,A.out,0,['lowpass',1300,1]);},
  gull(v){tone(1500,900,.25,'triangle',.02*v,A.out,0,['bandpass',1200,3]);tone(1400,800,.3,'triangle',.018*v,A.out,.32,['bandpass',1200,3]);},
  door(){burst(.9,'bandpass',300,2,.05);}
};
function setG(node,v,tc=.15){if(node)node.gain.setTargetAtTime(v,ac.currentTime,tc);}

// ---------- state ----------
let time=0,state='preview',started=false,xrActive=false;
let H=heightOf(FLOORS[0]);
let theta=-.004,thetaV=0,slipDrop=0,slipDone=false,slipAt=0,stepAcc=0;
let edgeT=0,edgeDone=false,fallT=0,fallV=0,nextBeat=0,nextHorn=5,nextGull=9,beatPulse=0;
let yaw=0,pitch=0,fear=0,expo=.6;
const keys={};
const head=new T.Vector3(),lastHead=new T.Vector3(),fwd=new T.Vector3();
let cleared={};try{cleared=JSON.parse(localStorage.getItem('edge88-cleared')||'{}')||{};}catch(e){cleared={};}
function showCleared(){const ids=FLOORS.filter(f=>cleared[f.id]&&f.n).map(f=>f.id);const el=$('cleared');if(ids.length){el.hidden=false;el.textContent='Floors cleared: '+ids.join(' · ');}else el.hidden=true;}
showCleared();

function setFloorInstant(f){curFloor=f;H=heightOf(f);city.position.y=-H;scene.fog.density=-H;buildTower(H);drawDisplay(f.id,f.n?f.n*3.5+' M':'');}
function getHead(){if(renderer.xr.isPresenting)head.setFromMatrixPosition(camera.matrixWorld);else{rig.updateMatrixWorld();camera.updateMatrixWorld();head.setFromMatrixPosition(camera.matrixWorld);}return head;}
function haptic(v,ms){const s=renderer.xr.getSession&&renderer.xr.getSession();if(!s)return;for(const src of s.inputSources){const a=src.gamepad&&src.gamepad.hapticActuators&&src.gamepad.hapticActuators[0];if(a&&a.pulse)a.pulse(v,ms).catch(()=>{});}}

function resetPlayer(){rig.position.set(0,0,1.2);rig.rotation.set(0,0,0);yaw=0;pitch=0;if(!xrActive)camera.position.set(0,1.65,0);}
function beginPlay(){
  if(!started){started=true;setFloorInstant(FLOORS[3]);doorOpen=doorTarget=0;placeDoors();resetPlayer();expo=1.6;
    setHud(xrActive?'Press a floor button on your right wall':'Look right and press a floor button','88 is the top floor',0);}
  state='play';
}

function pressFloor(f){
  if(state!=='play'||ride)return;
  getHead();if(head.z<0.45){setHud('Step back inside to use the elevator','',3);return;}
  if(f===curFloor){doorTarget=1;return;}
  ride={from:curFloor,to:f,phase:'closing',t:0,dur:2.6+Math.min(6,Math.abs(heightOf(f)-H)/55)};
  doorTarget=0;sfx.door();setHud('','');tone(1500,1500,.06,'square',.04);
}
function updateRide(dt){
  if(!ride)return;ride.t+=dt;
  if(ride.phase==='closing'&&doorOpen<=0.001){ride.phase='moving';ride.t=0;}
  if(ride.phase==='moving'){
    const k=clamp(ride.t/ride.dur,0,1),n=Math.round(lerp(ride.from.n,ride.to.n,ease(k)));
    drawDisplay(n===0?'L':String(n),ride.to.n>ride.from.n?'▲':'▼');
    if(ac){const a=Math.sin(Math.PI*k);setG(A.rumble.g,.22*a+.05,.2);setG(A.humG,.05*a+.01,.2);}
    if(!xrActive){camera.position.x=(Math.random()-.5)*.003*Math.sin(Math.PI*k);}
    if(k>=1){setFloorInstant(ride.to);ride.phase='arrive';ride.t=0;sfx.ding();slipDone=false;edgeT=0;edgeDone=false;if(ac){setG(A.rumble.g,0,.3);setG(A.humG,0,.3);}}
  }else if(ride.phase==='arrive'&&ride.t>.6){
    doorTarget=1;sfx.door();const f=ride.to;ride=null;camera.position.x=0;
    if(f.n)setHud('Floor '+f.n+' · '+(f.n*3.5)+' m','Walk to the X at the end. Stand on it for 10 seconds.',7);
    else setHud('Ground floor','Practice on the plank, then pick a floor.',6);
  }
}

function startFall(){
  state='fall';fallT=0;fallV=0;setHud('','');
  if(ac){sfx.crack();setG(A.wind.g,1.2,.4);A.wind.f.frequency.setTargetAtTime(1600,ac.currentTime,.5);setG(A.whistle.g,.25,.3);}
  haptic(1,600);
}
function updateFall(dt){
  fallT+=dt;const doFall=$('fallToggle').checked;
  if(doFall){fallV+=9.8*dt;rig.position.y-=fallV*dt;if(!xrActive){pitch=lerp(pitch,-1.3,dt*1.5);camera.rotation.z=Math.sin(fallT*7)*.15*fallT;}}
  const fadeStart=doFall?1.5:0,fadeEnd=doFall?2.1:.35;
  fade.material.opacity=clamp((fallT-fadeStart)/(fadeEnd-fadeStart),0,1);
  if(fallT>fadeEnd+.4){
    const from=curFloor;setFloorInstant(FLOORS[3]);resetPlayer();camera.rotation.z=0;doorOpen=doorTarget=0;placeDoors();theta=-.004;thetaV=0;slipDrop=0;
    state='play';fallT=-1;expo=1.6;
    setHud('You fell from floor '+from.n+'.','Choose a floor to try again.',0);
  }
}

function updatePlank(dt){
  getHead();
  const onPlank=head.z<-0.36;const s=onPlank?clamp(-head.z,0,4.6):0;
  const target=-(.003+.019*Math.pow(s/4.6,1.6))-slipDrop;
  thetaV+=(140*(target-theta)-5*thetaV)*dt;theta+=thetaV*dt;
  if(state==='play'&&onPlank&&H>2){theta+=Math.sin(time*1.7)*.0006*(H/308)*(s/4.6)*dt*10;}
  plankPivot.rotation.x=theta;
  if(state!=='fall')rig.position.y=head.z<0?-head.z*Math.sin(theta):0;
  const moved=Math.hypot(head.x-lastHead.x,head.z-lastHead.z);lastHead.copy(head);
  if(onPlank&&state==='play'&&moved<.5){stepAcc+=moved;if(stepAcc>.5){stepAcc=0;thetaV-=.05+.07*(s/4.6);if(Math.random()<.65)sfx.creak();haptic(.25,40);}}
  if(state==='play'&&H>=100&&!slipDone&&head.z<-2.7){slipDone=true;slipAt=time+.25;}
  if(slipAt&&time>=slipAt){slipAt=0;slipDrop=.013;thetaV-=.3;sfx.crack();haptic(1,250);beatPulse=1;fear=Math.min(1,fear+.35);}
  slipDrop=Math.max(slipDrop>0?.005:0,slipDrop-dt*.004);
}

function updateGame(dt){
  if(state!=='play')return;
  getHead();
  if(fallT<0){fade.material.opacity=Math.max(0,fade.material.opacity-dt*1.2);if(fade.material.opacity<=0)fallT=0;}
  if(hudUntil&&time>hudUntil){hudUntil=0;hudMsg='';drawHud();}
  if(ride||H<2)return;
  const x=head.x,z=head.z;
  const inside=z>=0,ledge=z<0&&z>=-0.36&&Math.abs(x)<0.75,onPlank=z<-0.36&&z>=-4.62&&Math.abs(x)<0.3;
  if(!(inside||ledge||onPlank)){startFall();return;}
  if(onPlank&&z<-4.08&&!edgeDone){edgeT+=dt;const left=Math.max(0,10-edgeT);
    if(Math.floor(edgeT*10)!==Math.floor((edgeT-dt)*10))setHud(left.toFixed(1),'Stay on the X',0);
    if(edgeT>=10){edgeDone=true;sfx.ding();cleared[curFloor.id]=1;try{localStorage.setItem('edge88-cleared',JSON.stringify(cleared));}catch(e){}showCleared();
      setHud('Ten seconds at '+(curFloor.n*3.5)+' m.','Walk back into the elevator.',8);haptic(.6,300);}
  }else if(edgeT>0&&!edgeDone){edgeT=0;setHud('Step back on the X to restart the count','',3);}
}

// ---------- vision: fear, eye adaptation, post ----------
const camQ=new T.Quaternion(),tmpV=new T.Vector3(),tmpS=new T.Vector3();
function updateVision(dt){
  getHead();
  camera.matrixWorld.decompose(tmpV,camQ,tmpS);fwd.set(0,0,-1).applyQuaternion(camQ);
  const fx=$('fxToggle').checked;
  const outside=head.z<0,prog=outside?clamp(-head.z/4.6,0,1):0,hf=clamp(H/308,0,1);
  const lookDown=clamp(-fwd.y,0,1);
  const lean=outside?clamp((Math.abs(head.x)-.08)/.2,0,1):0;
  let target=0;
  if(state==='play'&&!ride){target=outside?hf*(.25+.45*prog+.3*lookDown*lookDown+.25*lean):hf*doorOpen*.12*lookDown;}
  if(state==='fall')target=1;
  if(!fx)target=0;
  fear+= (target-fear)*(1-Math.exp(-dt/(target>fear?.9:2.2)));
  beatPulse=Math.max(0,beatPulse-dt*3.2);
  const f=fear,p=beatPulse*f;
  vign.material.uniforms.inner.value=lerp(1.05,.42,f)-p*.08;
  vign.material.uniforms.amt.value=fx?clamp(f*.8+p*.15,0,.9):0;
  // eye adaptation: dim cabin vs. sunset glare outside
  const inside=head.z>.38;
  const tgtE=state==='preview'?.55:inside?lerp(1.55,.75,doorOpen*doorOpen):.55;
  expo=Math.exp(lerp(Math.log(expo),Math.log(tgtE),1-Math.exp(-dt/1.6)));
  renderer.toneMappingExposure=expo*(1+p*.06);
  // desktop lens
  const u=lens.uniforms;u.time.value=time;u.blur.value=fx?f*.55+p*.15:0;u.desat.value=fx?f*.28:0;u.ca.value=.005+(fx?f*.012:0);
  u.radial.value=state==='fall'&&$('fallToggle').checked?clamp((fallT-.2)*.05,0,.08):0;
  u.vig.value=.3+(fx?f*.25:0);
  // hearing it too
  if(ac&&state==='play'&&outside&&H>=40&&time>nextBeat&&fx){const bpm=70+95*f;sfx.thump(.2+.8*f);beatPulse=1;nextBeat=time+60/bpm;}
}

// ---------- input ----------
const pad=$('pad');const isTouch=matchMedia('(pointer:coarse)').matches;
addEventListener('keydown',e=>{if(state==='play'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
pad.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();e.stopPropagation();keys[k]=true;};const off=e=>{e.stopPropagation();keys[k]=false;};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);});
let drag=null;
canvas.addEventListener('pointerdown',e=>{if(xrActive)return;drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
  if(drag&&drag.id===e.pointerId){const s=e.pointerType==='touch'?.006:.0045;yaw-=(e.clientX-drag.x)*s;pitch=clamp(pitch-(e.clientY-drag.y)*s,-1.45,1.45);drag.x=e.clientX;drag.y=e.clientY;}
  else if(state==='play'&&!xrActive){const b=pickAt(e.clientX,e.clientY);canvas.style.cursor=b?'pointer':'grab';refreshButtons(b);}
});
canvas.addEventListener('pointerup',e=>{if(!drag)return;const moved=Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy);drag=null;if(moved<7){const b=pickAt(e.clientX,e.clientY);if(b)pressFloor(b.userData.floor);}});
canvas.addEventListener('pointercancel',()=>{drag=null;});
const ray=new T.Raycaster(),ndc=new T.Vector2();
function pickAt(cx,cy){const r=canvas.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObjects(buttons,false)[0];return h&&h.distance<3?h.object:null;}

function moveRig(dx,dz){
  getHead();let nx=head.x+dx,nz=head.z+dz;
  if(nz>0.38){nx=clamp(nx,-.85,.85);nz=Math.min(nz,2.25);if(doorOpen<.95&&head.z>=.38)nz=Math.max(nz,.45);}
  else if(nz>=0){nx=clamp(nx,-.5,.5);}
  rig.position.x+=nx-head.x;rig.position.z+=nz-head.z;
}
let breathT=0;
function updateFlat(dt){
  if(xrActive)return;
  if(state==='preview'){
    const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
    rig.position.set(0,0,-4.25);yaw=rm?.15:.22*Math.sin(time*.09);pitch=-.8+(rm?0:.05*Math.sin(time*.13));
  }
  // breathing and a slight unsteady sway that grows with fear
  breathT+=dt*(1+fear*1.4);const sway=fear*.006;
  camera.rotation.x=pitch+Math.sin(breathT*1.3)*.004+Math.sin(time*2.3)*sway;camera.rotation.y=yaw+Math.sin(time*1.7+1)*sway;
  camera.rotation.z=state==='fall'?camera.rotation.z:Math.sin(time*.8)*sway*2;
  if(state!=='play'||ride)return;
  let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  let by=0;
  if(f||s){const sp=(keys.ShiftLeft?1.6:1.0)*(1-fear*.45)*dt,l=Math.hypot(f,s);f/=l;s/=l;
    moveRig((-Math.sin(yaw)*f+Math.cos(yaw)*s)*sp,(-Math.cos(yaw)*f-Math.sin(yaw)*s)*sp);by=Math.sin(time*8)*.012;}
  camera.position.y=1.65+by+Math.sin(breathT*1.3)*.004;
  getHead();const k=head.z<-.36&&H>2?clamp(-head.z/4.6,0,1)*(H/308):0;
  const fov=72-7*k*clamp(-pitch,0,1);if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
}

// XR controllers
const ctrls=[0,1].map(i=>{const c=renderer.xr.getController(i);
  const lineG=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,0,-1)]);
  const line=new T.Line(lineG,new T.LineBasicMaterial({color:0xffb24a,transparent:true,opacity:.7,toneMapped:false}));line.scale.z=2;c.add(line);
  c.add(new T.Mesh(new T.BoxGeometry(.03,.03,.12),new T.MeshStandardMaterial({color:0x333438,roughness:.5})));
  c.userData.line=line;c.addEventListener('selectstart',()=>{const b=c.userData.hover;if(b)pressFloor(b.userData.floor);});
  rig.add(c);return c;});
const tmpM=new T.Matrix4();let snapReady=true;
function updateXR(dt){
  if(!xrActive)return;
  let hover=null;
  for(const c of ctrls){tmpM.identity().extractRotation(c.matrixWorld);ray.ray.origin.setFromMatrixPosition(c.matrixWorld);ray.ray.direction.set(0,0,-1).applyMatrix4(tmpM);
    const h=ray.intersectObjects(buttons,false)[0];c.userData.hover=h&&h.distance<2.5?h.object:null;c.userData.line.scale.z=c.userData.hover?h.distance:.35;if(c.userData.hover)hover=c.userData.hover;}
  refreshButtons(hover);
  const s=renderer.xr.getSession();if(!s||state!=='play'||ride)return;
  let mv=null,turn=null;
  for(const src of s.inputSources){const gp=src.gamepad;if(!gp||gp.axes.length<4)continue;if(src.handedness==='right')turn=gp;else mv=gp;}
  if(!mv)mv=turn;
  if(mv){const ax=mv.axes[2],ay=mv.axes[3];if(Math.hypot(ax,ay)>.15){
    const fw=new T.Vector3(0,0,-1).applyQuaternion(new T.Quaternion().setFromRotationMatrix(tmpM.extractRotation(camera.matrixWorld)));fw.y=0;fw.normalize();
    const rt=new T.Vector3(-fw.z,0,fw.x);const sp=.9*(1-fear*.4)*dt;moveRig((fw.x*-ay+rt.x*ax)*sp,(fw.z*-ay+rt.z*ax)*sp);}}
  if(turn&&turn!==mv){const tx=turn.axes[2];if(Math.abs(tx)>.7&&snapReady){snapReady=false;const a=tx>0?-Math.PI/6:Math.PI/6;getHead();const p=head.clone();
      rig.position.sub(p).applyAxisAngle(new T.Vector3(0,1,0),a).add(p);rig.rotation.y+=a;}else if(Math.abs(tx)<.3)snapReady=true;}
}

// ---------- audio mix ----------
function updateAudio(dt){
  if(!ac)return;
  getHead();const hf=clamp(H/308,0,1),outside=head.z<0,prog=outside?clamp(-head.z/4.6,0,1):0;
  const g=.55+.25*Math.sin(time*.37)+.2*Math.sin(time*1.13+1)+.1*Math.sin(time*2.7+2);
  if(state==='fall')return;
  const open=doorOpen;
  A.out.frequency.setTargetAtTime(outside?18000:300+16000*open*open,ac.currentTime,.1);
  const lvl=outside?(.15+.65*hf)*(.75+.5*prog):open*(.1+.3*hf);
  setG(A.wind.g,lvl*g*.55,.25);A.wind.f.frequency.setTargetAtTime(260+1000*g*Math.min(1,lvl+.2),ac.currentTime,.3);
  setG(A.whistle.g,lvl*Math.max(0,g-.5)*.12,.3);
  setG(A.city.g,(.3/(1+H/60))*(outside?1:.2+.8*open),.3);
  if(time>nextHorn){nextHorn=time+6+Math.random()*14;if(open>.5)sfx.horn(1/(1+H/90));}
  if(time>nextGull){nextGull=time+10+Math.random()*16;if(open>.5&&H>20)sfx.gull(.7);}
}

// ---------- loop ----------
const clock=new T.Clock();
function frame(){
  const dt=Math.min(clock.getDelta(),.05);time+=dt;
  doorOpen=clamp(doorOpen+(doorTarget>doorOpen?1:-1)*dt/1.15,Math.min(doorTarget,doorOpen),Math.max(doorTarget,doorOpen));placeDoors();
  updateFlat(dt);updateXR(dt);updateRide(dt);
  if(state==='fall')updateFall(dt);
  updatePlank(dt);updateGame(dt);updateVision(dt);updateCars(dt);updateBirds(dt);updateDust(dt);updateAudio(dt);
  for(const c of clouds){c.position.x+=dt*2.2;if(c.position.x>1500)c.position.x=-1500;}
  beaconMat.opacity=.15+.85*Math.max(0,Math.sin(time*2.2));
  city.userData.water.offset.x+=dt*.004;city.userData.water.offset.y+=dt*.0015;
  getHead();sky.position.copy(head);sunGlow.position.copy(head).addScaledVector(SUN,4000);
  if(renderer.xr.isPresenting)renderer.render(scene,camera);else composer.render(dt);
}

setFloorInstant(FLOORS[0]);doorOpen=doorTarget=1;placeDoors();
renderer.setAnimationLoop(frame);
$('loading').hidden=true;
if(document.fonts&&document.fonts.load)document.fonts.load('600 40px "IBM Plex Mono"').then(()=>{drawDisplay(curFloor.id,curFloor.n?curFloor.n*3.5+' M':'');buttons.forEach(b=>{b.userData.tex=[btnTex(b.userData.floor.id,0),btnTex(b.userData.floor.id,1),btnTex(b.userData.floor.id,2)];b.userData.state=-1;});refreshButtons(null);drawHud();}).catch(()=>{});
refreshButtons(null);

addEventListener('resize',()=>{if(xrActive)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);lens.uniforms.res.value.set(innerWidth*PR,innerHeight*PR);});

// ---------- menu ----------
const overlay=$('overlay'),vrBtn=$('vrBtn'),flatBtn=$('flatBtn'),vrNote=$('vrNote'),menuBtn=$('menuBtn');
function hideMenu(){overlay.hidden=true;menuBtn.hidden=xrActive;pad.hidden=!(isTouch&&!xrActive);}
flatBtn.addEventListener('click',()=>{initAudio();xrActive=false;hideMenu();beginPlay();flatBtn.textContent='Resume';});
menuBtn.addEventListener('click',()=>{overlay.hidden=false;menuBtn.hidden=true;pad.hidden=true;for(const k in keys)keys[k]=false;});
if(navigator.xr&&navigator.xr.isSessionSupported){
  navigator.xr.isSessionSupported('immersive-vr').then(ok=>{
    if(ok){vrBtn.disabled=false;vrBtn.textContent='Enter VR';}
    else{vrBtn.textContent='No VR headset found';vrNote.textContent='In a headset, open this page’s link directly in the headset’s browser (for example Meta Quest Browser).';}
  }).catch(()=>{vrBtn.textContent='VR blocked here';vrNote.textContent='This view doesn’t allow VR. Open the page’s link directly in your headset’s browser.';});
}else{vrBtn.textContent='No VR in this browser';vrNote.textContent='For VR, open this page’s link in your headset’s browser. Desktop and phone play works here.';}
vrBtn.addEventListener('click',async()=>{
  initAudio();
  try{
    const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});
    await renderer.xr.setSession(session);
    xrActive=true;camera.position.set(0,0,0);camera.rotation.set(0,0,0);camera.fov=72;
    hideMenu();beginPlay();
    session.addEventListener('end',()=>{xrActive=false;camera.position.set(0,1.65,0);overlay.hidden=false;pad.hidden=true;menuBtn.hidden=true;
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);vrBtn.textContent='Re-enter VR';});
  }catch(e){vrNote.textContent='Couldn’t start VR here ('+(e&&e.message?e.message:'blocked')+'). Open the page’s link directly in your headset’s browser.';}
});


window.game={get time(){return time;},get state(){return state;},get H(){return H;},get ride(){return ride;},get doorOpen(){return doorOpen;},get fear(){return fear;},get cleared(){return cleared;},get xr(){return xrActive;},FLOORS,rig,camera,renderer,head,getHead,pressFloor};
})();
