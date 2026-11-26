// JUNGLE COURT: a regulation basketball court in a jungle clearing, for a headset or a screen (/ball): the court, weather and sky, four balls and their physics, hands, sounds
import * as THREE from 'three';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { Hand } from '../cantina/hands.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeGym } from './gym.js';

const $=id=>document.getElementById(id);
const V3=THREE.Vector3;
let seed=1337; const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const rr=(a,b)=>a+rnd()*(b-a);
const FT=0.3048;

/* ---------- regulation dimensions (metres) ---------- */
const CL=28.65, CW=15.24;            // 94 ft x 50 ft
const HL=CL/2, HW=CW/2;
const SLAB_W=CW+4, SLAB_L=CL+4;      // 2 m run-off
const RIM_H=3.048, RIM_R=0.2286, RIM_TUBE=0.008; // 10 ft, 18 in inner dia
const BOARD_W=1.829, BOARD_H=1.067, BOARD_FACE=HL-1.219; // 72x42 in, 4 ft from baseline
const RIM_Z=BOARD_FACE-0.151-RIM_R;
const BALL_R=0.1194;                 // size 7, 29.5 in circumference
const FENCE_H=3.2, FX=SLAB_W/2, FZ=SLAB_L/2;
const EYE=1.75;

/* ---------- renderer ---------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
const coarse=matchMedia('(pointer:coarse)').matches, basePR=Math.min(devicePixelRatio||1,coarse?1.5:2);
renderer.setPixelRatio(basePR);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
renderer.xr.enabled=true; renderer.xr.setFoveation(1); renderer.xr.setReferenceSpaceType('local-floor');
const MAXA=renderer.capabilities.getMaxAnisotropy();

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(68,1,0.06,1500);
const rig=new THREE.Group(); scene.add(rig); rig.add(camera);
const env=new THREE.Group(); scene.add(env);        // everything hidden in AR

function resize(){ if(renderer.xr.isPresenting) return; const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
addEventListener('resize',resize); resize();

/* ---------- canvas texture helpers ---------- */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function tex(c,{rep=null,srgb=true,aniso=true}={}){const t=new THREE.CanvasTexture(c); if(srgb)t.colorSpace=THREE.SRGBColorSpace;
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);} if(aniso)t.anisotropy=MAXA; return t}
function noiseCanvas(n,lo,hi,alpha=255){const c=cv(n,n),x=c.getContext('2d'),d=x.createImageData(n,n);
  for(let i=0;i<n*n;i++){const v=lo+rnd()*(hi-lo);d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=alpha}x.putImageData(d,0,0);return c}
// coarse+fine aggregate grain, tiling
function grainCanvas(n){const c=cv(n,n),x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,n,n);
  for(let i=0;i<n*n/5;i++){const g=60+rnd()*140|0,r=rr(.6,2.4),px=rnd()*n,py=rnd()*n;x.fillStyle=`rgba(${g},${g},${g},${rr(.35,.9)})`;
    for(const ox of[0,n,-n])for(const oy of[0,n,-n]){x.beginPath();x.arc(px+ox,py+oy,r,0,7);x.fill()}}return c}

/* ---------- scanned surface textures (Poly Haven, CC0) ---------- */
const IMG={};
await Promise.all(['asphalt_d','asphalt_n','bark_d','bark_n','ground_d','ground_n','rust_d','rust_n','concrete_d','concrete_n','wood_d','wood_n','metal_d','metal_n','floor_d','floor_n','plaster_d','plaster_n','ceiling_d'].map(n=>new Promise(r=>{
  const i=new Image(); i.onload=()=>{IMG[n]=i;r()}; i.onerror=()=>r(); i.src='ball-assets/'+n+'.jpg'; })));
function ptex(n,rx=1,ry=rx,srgb=true){ const i=IMG[n]; if(!i) return null; const t=new THREE.Texture(i); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry);
  if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=MAXA; t.needsUpdate=true; return t; }

/* ---------- sky, sun and moon, fog ---------- */
const anim=[], lamps=[], lampPos=[], glows=[]; const mistG=new THREE.Group(); env.add(mistG);
const W={night:1,wet:.6,wind:.5,rain:0,flash:0,lampOn:true};                 // world state shared by effects
const U={time:{value:0},lampK:{value:.012},wind:{value:.5}};                  // uniforms shared by patched materials
const FOGC=new THREE.Color(0x0d171d);
const fog=new THREE.FogExp2(FOGC,0.017); scene.fog=fog;
const moonDir=new V3(-0.42,0.56,-0.71).normalize(), sunDir=new V3(0.52,0.62,0.42).normalize();
const skyU={bodyDir:{value:moonDir.clone()},fogC:{value:FOGC},zenC:{value:new THREE.Color(.004,.009,.026)},bodyC:{value:new THREE.Color(.92,.95,1)},discA:{value:.99993},haloK:{value:.45},
  starK:{value:1},cloudC:{value:new THREE.Color(.008,.013,.018)},cloudK:{value:.75},flash:{value:0},time:U.time};
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyU,
vertexShader:`varying vec3 vDir;void main(){vDir=position;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;}`,
fragmentShader:`varying vec3 vDir;uniform vec3 bodyDir;uniform vec3 fogC;uniform vec3 zenC;uniform vec3 bodyC;uniform vec3 cloudC;uniform float discA;uniform float haloK;uniform float starK;uniform float cloudK;uniform float flash;uniform float time;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n2(p);p=p*2.03+7.1;a*=.5;}return s;}
void main(){vec3 d=normalize(vDir);float h=max(d.y,0.);
 vec3 col=mix(fogC,zenC,smoothstep(0.,.6,h));
 vec3 g=floor(d*240.);float r=h3(g);float st=step(.9972,r)*(.55+.45*sin(time*2.2+r*900.));
 col+=vec3(.8,.87,1.)*st*smoothstep(.14,.5,d.y)*(.4+h3(g+3.)*1.2)*starK;
 float s=max(dot(d,bodyDir),0.);
 col+=bodyC*smoothstep(discA-.00005,discA,s)*2.4*(.75+.25*n2(d.xy*160.));
 col+=bodyC*haloK*(pow(s,400.)*.7+pow(s,40.)*.22+pow(s,6.)*.07);
 float m=0.;
 if(d.y>.01){vec2 p=d.xz/(d.y+.15)*1.2+vec2(time*.006,0.);m=smoothstep(.42,.78,fbm(p*1.4));
  col=mix(col,cloudC+bodyC*haloK*.3*pow(s,3.),m*cloudK*smoothstep(.01,.3,d.y));}
 col+=flash*vec3(.5,.6,.9)*(.2+.8*m);
 if(d.y<0.)col=fogC+flash*.1;
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(900,32,16),skyMat); sky.frustumCulled=false; sky.userData.dyn=true; env.add(sky);
const sun=new THREE.DirectionalLight(0xfff0dc,3.3);
sun.position.copy(sunDir).multiplyScalar(70); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); const sc=sun.shadow.camera; sc.left=-26;sc.right=26;sc.top=26;sc.bottom=-26;sc.near=5;sc.far=160;
sun.shadow.bias=-0.0003; sun.shadow.normalBias=0.03; scene.add(sun,sun.target);
const arHemi=new THREE.HemisphereLight(0xbcd4ff,0x55604a,1.1); scene.add(arHemi);
const moon=new THREE.DirectionalLight(0x8fa9dc,0.5); moon.position.copy(moonDir).multiplyScalar(50); env.add(moon);
const hemi=new THREE.HemisphereLight(0x2c3b55,0x0a120d,0.9); env.add(hemi);
const bolt=new THREE.DirectionalLight(0xbfd0ff,0); bolt.position.set(-30,40,10); env.add(bolt);
function radial(n,stops){const c=cv(n,n),x=c.getContext('2d'),g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);stops.forEach(([o,k])=>g.addColorStop(o,k));x.fillStyle=g;x.fillRect(0,0,n,n);return tex(c,{aniso:false})}
const dotT=radial(32,[[0,'rgba(255,255,255,1)'],[.35,'rgba(255,255,255,.7)'],[1,'rgba(255,255,255,0)']]);

/* ---------- court surface ---------- */
const grain=grainCanvas(512);
function courtTexture(gym){
  const S=108, W=Math.round(SLAB_W*S), H=Math.round(SLAB_L*S), c=cv(W,H), x=c.getContext('2d');
  x.fillStyle=gym?'#f0d2a2':'#2f5d43'; x.fillRect(0,0,W,H);           // green acrylic run-off; indoors maple boards
  if(gym&&IMG.floor_d){ x.globalCompositeOperation='multiply'; x.globalAlpha=.7; x.save(); x.scale(.5,.5); x.fillStyle=x.createPattern(IMG.floor_d,'repeat'); x.fillRect(0,0,W*2,H*2); x.restore(); x.globalCompositeOperation='source-over'; x.globalAlpha=1; }
  x.save(); x.translate(W/2,H/2); x.scale(S,S);
  if(gym){ x.fillStyle='rgba(60,36,14,.22)'; x.fillRect(-FX,-FZ,2*FX,FZ-HL); x.fillRect(-FX,HL,2*FX,FZ-HL); x.fillRect(-FX,-HL,FX-HW,CL); x.fillRect(HW,-HL,FX-HW,CL); } else { x.fillStyle='#35608c'; x.fillRect(-HW,-HL,CW,CL); }   // blue playing surface
  const half=()=>{ // drawn for hoop at -z
    x.fillStyle=gym?'rgba(24,58,112,.88)':'#9c4a35'; x.fillRect(-2.438,-HL,4.877,5.791);      // 16 ft key, 19 ft deep
    x.strokeStyle='#eeece4'; x.lineWidth=0.051; x.lineCap='butt';
    x.strokeRect(-2.438,-HL,4.877,5.791);
    x.beginPath(); x.arc(0,-HL+5.791,1.829,0,Math.PI); x.stroke();  // free-throw circle
    x.setLineDash([0.39,0.39]); x.beginPath(); x.arc(0,-HL+5.791,1.829,Math.PI,2*Math.PI); x.stroke(); x.setLineDash([]);
    x.beginPath(); x.arc(0,-RIM_Z,1.219,0,Math.PI); x.stroke();     // restricted area
    const R3=7.239, cx=6.706, dz=Math.sqrt(R3*R3-cx*cx), a0=Math.atan2(dz,cx); // 23'9" arc, 22' corners
    x.beginPath(); x.moveTo(cx,-HL); x.lineTo(cx,-RIM_Z+dz); x.arc(0,-RIM_Z,R3,a0,Math.PI-a0); x.lineTo(-cx,-HL); x.stroke();
    for(const sx of[-1,1]) for(const d of[2.13,3.35,4.27,5.18]){ x.beginPath(); x.moveTo(sx*2.438,-HL+d); x.lineTo(sx*2.59,-HL+d); x.stroke(); }
    x.beginPath(); x.moveTo(-0.9,-HL+1.219); x.lineTo(0.9,-HL+1.219); x.stroke(); // backboard shadow line
  };
  half(); x.save(); x.scale(1,-1); half(); x.restore();
  x.strokeStyle='#eeece4'; x.lineWidth=0.051; x.strokeRect(-HW,-HL,CW,CL);
  x.beginPath(); x.moveTo(-HW,0); x.lineTo(HW,0); x.stroke();
  x.beginPath(); x.arc(0,0,1.829,0,7); x.stroke(); x.beginPath(); x.arc(0,0,0.61,0,7); x.stroke();
  if(gym){ x.fillStyle='rgba(24,58,112,.88)'; x.beginPath(); x.arc(0,0,1.8,0,7); x.fill(); x.restore(); return c; }
  // ---- weathering ----
  for(let i=0;i<260;i++){ const px=rr(-FX,FX),pz=rr(-FZ,FZ),r=rr(.4,2.6),g=x.createRadialGradient(px,pz,0,px,pz,r);
    const light=rnd()<.55; g.addColorStop(0,light?`rgba(235,230,215,${rr(.03,.10)})`:`rgba(20,22,24,${rr(.04,.13)})`); g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g; x.fillRect(px-r,pz-r,2*r,2*r); }
  for(const s of[-1,1]) for(let i=0;i<70;i++){ // paint worn through under each basket and at the line
    const px=rr(-2.6,2.6),pz=s*(HL-rr(.6,6.4)),r=rr(.25,1.1),g=x.createRadialGradient(px,pz,0,px,pz,r);
    g.addColorStop(0,`rgba(70,72,74,${rr(.08,.2)})`); g.addColorStop(1,'rgba(70,72,74,0)'); x.fillStyle=g; x.fillRect(px-r,pz-r,2*r,2*r); }
  const crack=(px,pz,ang,len,w,col)=>{ x.strokeStyle=col; x.lineWidth=w; x.lineJoin='round'; x.beginPath(); x.moveTo(px,pz);
    let n=len/.12; while(n-->0){ ang+=rr(-.5,.5); px+=Math.cos(ang)*.12; pz+=Math.sin(ang)*.12; x.lineTo(px,pz);
      if(rnd()<.04&&len>2) { x.stroke(); crack(px,pz,ang+rr(-1.2,1.2),len*.35,w*.7,col); x.strokeStyle=col;x.lineWidth=w; x.beginPath(); x.moveTo(px,pz);} } x.stroke(); };
  for(let i=0;i<9;i++) crack(rr(-FX,FX),rr(-FZ,FZ),rr(0,6.3),rr(3,11),0.012,'rgba(18,18,18,.75)');
  for(let i=0;i<4;i++) crack(rr(-FX,FX),rr(-FZ,FZ),rr(0,6.3),rr(4,9),0.045,'rgba(24,24,26,.9)'); // tar-sealed repairs
  for(let i=0;i<500;i++){ x.fillStyle=`rgba(${rnd()<.5?'30,30,30':'210,205,190'},${rr(.05,.25)})`; x.beginPath(); x.ellipse(rr(-FX,FX),rr(-FZ,FZ),rr(.005,.04),rr(.005,.03),rr(0,3),0,7); x.fill(); }
  for(let i=0;i<40;i++){ const px=rr(-FX,FX),pz=rr(-FZ,FZ),a=rr(0,6.3),l=rr(.1,.5); x.strokeStyle=`rgba(15,15,15,${rr(.08,.22)})`; x.lineWidth=rr(.01,.03); // sneaker scuffs
    x.beginPath(); x.moveTo(px,pz); x.quadraticCurveTo(px+Math.cos(a)*l*.5+rr(-.05,.05),pz+Math.sin(a)*l*.5+rr(-.05,.05),px+Math.cos(a)*l,pz+Math.sin(a)*l); x.stroke(); }
  // damp surface: standing water in the low spots drives both colour and gloss
  const rc=cv(W>>2,H>>2), r=rc.getContext('2d'); r.fillStyle='rgb(205,205,205)'; r.fillRect(0,0,rc.width,rc.height);
  r.globalAlpha=.5; r.fillStyle=r.createPattern(noiseCanvas(128,90,210),'repeat'); r.fillRect(0,0,rc.width,rc.height); r.globalAlpha=1;
  r.translate(rc.width/2,rc.height/2); r.scale(S/4,S/4);
  for(let i=0;i<9;i++){ const cx0=rr(-FX+.5,FX-.5), cz0=rr(-FZ+.5,FZ-.5);
    for(let k=0;k<7;k++){ const px=cx0+rr(-1.1,1.1),pz=cz0+rr(-1.1,1.1),rad=rr(.35,1.15);
      let g=r.createRadialGradient(px,pz,rad*.55,px,pz,rad); g.addColorStop(0,'rgba(60,60,60,1)'); g.addColorStop(1,'rgba(60,60,60,0)'); r.fillStyle=g; r.fillRect(px-rad,pz-rad,2*rad,2*rad);
      g=x.createRadialGradient(px,pz,rad*.4,px,pz,rad*1.15); g.addColorStop(0,'rgba(0,0,0,.34)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(px-rad*1.2,pz-rad*1.2,2.4*rad,2.4*rad); } }
  courtTexture.rough=rc;
  x.restore();
  x.globalCompositeOperation='overlay'; x.globalAlpha=IMG.asphalt_d?.8:.55; x.save(); x.scale(.42,.42); x.fillStyle=x.createPattern(IMG.asphalt_d||grain,'repeat'); x.fillRect(0,0,W/.42,H/.42); x.restore();
  x.globalCompositeOperation='multiply'; x.globalAlpha=.25; x.fillStyle=x.createPattern(noiseCanvas(256,150,255),'repeat'); x.fillRect(0,0,W,H);
  x.globalCompositeOperation='source-over'; x.globalAlpha=1;
  return c;
}
const courtMap=tex(courtTexture());
const courtMat=new THREE.MeshStandardMaterial({map:courtMap,roughnessMap:tex(courtTexture.rough,{srgb:false}),...(IMG.asphalt_n?{normalMap:ptex('asphalt_n',SLAB_W/2,SLAB_L/2,false),normalScale:new THREE.Vector2(1.1,1.1)}:{bumpMap:tex(grain,{rep:[SLAB_W/0.45,SLAB_L/0.45],srgb:false}),bumpScale:1.2}),roughness:1,metalness:0,envMapIntensity:1});
const edgeMat=new THREE.MeshStandardMaterial({color:0x4a4b4c,roughness:.95});
const slab=new THREE.Mesh(new THREE.BoxGeometry(SLAB_W,.08,SLAB_L),[edgeMat,edgeMat,courtMat,edgeMat,edgeMat,edgeMat]);
slab.position.y=-.04; slab.receiveShadow=true; env.add(slab);

/* ---------- ground: concrete apron + grass ---------- */
{ const c=cv(512,512),x=c.getContext('2d'); x.fillStyle='#7f8273'; x.fillRect(0,0,512,512); if(IMG.concrete_d){ x.globalAlpha=.75; x.drawImage(IMG.concrete_d,0,0,512,512); x.globalAlpha=1; }
  x.globalCompositeOperation='overlay'; x.fillStyle=x.createPattern(grain,'repeat'); x.fillRect(0,0,512,512); x.globalCompositeOperation='source-over';
  x.strokeStyle='rgba(60,60,58,.8)'; x.lineWidth=3; x.strokeRect(0,0,512,512);
  for(let i=0;i<30;i++){x.fillStyle=`rgba(40,40,38,${rr(.03,.1)})`;x.beginPath();x.arc(rnd()*512,rnd()*512,rr(8,50),0,7);x.fill()}
  for(let i=0;i<70;i++){x.fillStyle=`rgba(${rr(30,60)|0},${rr(70,100)|0},30,${rr(.08,.3)})`;x.beginPath();x.ellipse(rnd()*512,rnd()*512,rr(6,40),rr(4,22),rr(0,3),0,7);x.fill()}
  const apron=new THREE.Mesh(new THREE.PlaneGeometry(SLAB_W+2.6,SLAB_L+2.6),new THREE.MeshStandardMaterial({map:tex(c,{rep:[(SLAB_W+2.6)/1.5,(SLAB_L+2.6)/1.5]}),normalMap:ptex('concrete_n',(SLAB_W+2.6)/1.5,(SLAB_L+2.6)/1.5,false),roughness:.9}));
  apron.rotation.x=-Math.PI/2; apron.position.y=-.07; apron.receiveShadow=true; env.add(apron);
}
/* ---------- jungle hills ---------- */
const hsh=(x,z)=>{const q=Math.sin(x*127.1+z*311.7)*43758.5453;return q-Math.floor(q)};
const vn=(x,z)=>{const ix=Math.floor(x),iz=Math.floor(z);let fx=x-ix,fz=z-iz;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);
  const a=hsh(ix,iz),b=hsh(ix+1,iz),c=hsh(ix,iz+1),d=hsh(ix+1,iz+1);return a+(b-a)*fx+(c-a)*fz+(a-b-c+d)*fx*fz};
const fbm2=(x,z)=>{let a=.5,q=0;for(let i=0;i<4;i++){q+=a*vn(x,z);x=x*2.03+5.3;z=z*2.03+1.7;a*=.5}return q};
const sstep=THREE.MathUtils.smoothstep;
function terrainH(x,z){const d=Math.hypot(x,z);
  return -.1+sstep(d,24,100)*(5+70*Math.pow(fbm2(x*.012+3.1,z*.012+7.7),1.7))+sstep(d,22,42)*(fbm2(x*.07,z*.07)-.47)*2.2}
{ const g=cv(512,512),y=g.getContext('2d'); y.fillStyle='#1d2a17'; y.fillRect(0,0,512,512);
  for(let i=0;i<9000;i++){const px=rnd()*512,py=rnd()*512;y.fillStyle=`hsl(${rr(40,120)},${rr(20,50)}%,${rr(6,24)}%)`;y.beginPath();y.ellipse(px,py,rr(3,9),rr(1.5,4),rr(0,3.2),0,7);y.fill()}
  const tg=new THREE.PlaneGeometry(640,640,128,128); tg.rotateX(-Math.PI/2); const p=tg.attributes.position;
  for(let i=0;i<p.count;i++) p.setY(i,terrainH(p.getX(i),p.getZ(i))); tg.computeVertexNormals();
  const terrain=new THREE.Mesh(tg,new THREE.MeshLambertMaterial({map:ptex('ground_d',170)||tex(g,{rep:[220,220]}),color:0x8f9a84}));
  terrain.receiveShadow=true; env.add(terrain);
}

/* ---------- materials ---------- */
const galv=new THREE.MeshStandardMaterial({color:0x9a9fa3,metalness:.85,roughness:.45,normalMap:ptex('metal_n',1,3,false),normalScale:new THREE.Vector2(.5,.5)});
const blackSteel=new THREE.MeshStandardMaterial({color:0x1b1c1e,metalness:.6,roughness:.5});
const rustSteel=new THREE.MeshStandardMaterial({map:ptex('rust_d',2,6),normalMap:ptex('rust_n',2,6,false),color:0x8d8d8d,metalness:.55,roughness:.72});
const shadowOn=m=>{m.castShadow=true;m.receiveShadow=true;return m};

/* ---------- hoops ---------- */
const boxes=[], cyls=[];       // static colliders
function boardTexture(){ const c=cv(1024,598),x=c.getContext('2d'); x.fillStyle='#e9e8e2'; x.fillRect(0,0,1024,598);
  const px=1024/BOARD_W; x.strokeStyle='#c2391b'; x.lineWidth=.051*px;
  x.strokeRect((BOARD_W/2-.305)*px,598-(0.15+.457)*px+.025*px,.61*px,.457*px);   // 24x18 in shooter's square
  x.strokeStyle='#c2391b'; x.lineWidth=.05*px; x.strokeRect(.025*px,.025*px,1024-.05*px,598-.05*px);
  for(let i=0;i<900;i++){x.fillStyle=`rgba(${rnd()<.3?'120,70,30':'40,40,40'},${rr(.03,.16)})`;x.beginPath();x.arc(rnd()*1024,rnd()*598,rr(.5,5),0,7);x.fill()}
  for(let i=0;i<60;i++){const bx=rr(250,774),by=rr(250,560);const g=x.createRadialGradient(bx,by,0,bx,by,rr(15,40));g.addColorStop(0,'rgba(60,45,35,.10)');g.addColorStop(1,'rgba(60,45,35,0)');x.fillStyle=g;x.fillRect(bx-40,by-40,80,80)} // ball marks
  for(let i=0;i<30;i++){const ex=rnd()<.5?rr(0,60):rr(964,1024),ey=rr(0,598),g=x.createRadialGradient(ex,ey,0,ex,ey,rr(20,70));g.addColorStop(0,'rgba(120,62,24,.55)');g.addColorStop(1,'rgba(120,62,24,0)');x.fillStyle=g;x.fillRect(ex-70,ey-70,140,140)} // rust creeping in from the edges
  for(let i=0;i<5;i++){const dx=rr(120,900),dy=rr(60,300),g=x.createRadialGradient(dx-4,dy-4,2,dx,dy,rr(14,26));g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(.6,'rgba(90,90,90,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(dx-30,dy-30,60,60)} // dents
  for(const [sxp,syp,col,txt] of [[70,470,'#f2c230','PLAY'],[880,90,'#2c7fb8','JNGL'],[820,500,'#d43d5a','★']]){x.save();x.translate(sxp,syp);x.rotate(rr(-.3,.3));x.fillStyle=col;x.fillRect(-42,-24,84,48);x.fillStyle='#fff';x.font='700 26px Arial';x.textAlign='center';x.fillText(txt,0,9);x.restore()} // stickers
  for(let i=0;i<14;i++){const sx=rr(0,1024);const g=x.createLinearGradient(0,0,0,598);g.addColorStop(0,'rgba(110,70,35,.22)');g.addColorStop(1,'rgba(110,70,35,0)');x.fillStyle=g;x.fillRect(sx,0,rr(2,7),rr(120,500))} // rust runs
  return c; }
const boardTex=tex(boardTexture());
const rimMat=new THREE.MeshStandardMaterial({color:0xd4521c,metalness:.55,roughness:.45});
const hoops=[];
function makeHoop(s){ // built for the -z end, mirrored by rotation
  const g=new THREE.Group(); if(s>0) g.rotation.y=Math.PI; scene.add(g);
  const zP=-(HL+0.55);
  const curve=new THREE.CatmullRomCurve3([new V3(0,-.05,zP),new V3(0,1.4,zP),new V3(0,2.75,zP),new V3(0,3.42,zP+.42),new V3(0,3.56,zP+1.1),new V3(0,3.52,-BOARD_FACE-.06)],false,'catmullrom',.35);
  g.add(shadowOn(new THREE.Mesh(new THREE.TubeGeometry(curve,48,.07,14),IMG.rust_d?rustSteel:blackSteel)));
  for(const [yy,col,a] of [[1.25,'#e9d24a',.4],[1.55,'#3a8fd0',-1.1],[1.05,'#e05a4a',2.2]]){ const sc2=cv(64,64),sx2=sc2.getContext('2d'); sx2.fillStyle=col; sx2.beginPath(); sx2.arc(32,32,30,0,7); sx2.fill(); sx2.fillStyle='#fff'; sx2.font='700 22px Arial'; sx2.textAlign='center'; sx2.fillText('23',32,40);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.072,.072,.09,12,1,true,a,.9),new THREE.MeshStandardMaterial({map:tex(sc2),roughness:.5})); st.position.set(0,yy,zP); g.add(st); }
  const top=new THREE.Group(); g.add(top); const rimPivot=new THREE.Group(); rimPivot.position.set(0,RIM_H,-BOARD_FACE); top.add(rimPivot);
  const base=shadowOn(new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.03,20),galv)); base.position.set(0,.015,zP); g.add(base);
  const board=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(BOARD_W,BOARD_H,.04),[1,1,1,1,0,1].map(i=>i?new THREE.MeshStandardMaterial({color:0xb9b9b3,metalness:.5,roughness:.6}):new THREE.MeshStandardMaterial({map:boardTex,metalness:.25,roughness:.5}))));
  const bY=RIM_H-.152+BOARD_H/2; board.position.set(0,bY,-BOARD_FACE-.02); top.add(board);
  for(const yy of[bY+.3,bY-.3]){const b=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(1.5,.05,.05),blackSteel));b.position.set(0,yy,-BOARD_FACE-.065);top.add(b)}
  for(const xx of[-.5,.5]){const b=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.05,.9,.05),blackSteel));b.position.set(xx,bY,-BOARD_FACE-.065);top.add(b)}
  const rim=shadowOn(new THREE.Mesh(new THREE.TorusGeometry(RIM_R+RIM_TUBE,RIM_TUBE,10,48),rimMat)); rim.rotation.x=Math.PI/2; rim.position.set(0,0,BOARD_FACE-RIM_Z); rimPivot.add(rim);
  const plate=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.2,.13,.008),rimMat)); plate.position.set(0,-.05,.004); rimPivot.add(plate);
  const neck=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.13,.012,.16),rimMat)); neck.position.set(0,-.004,.08); rimPivot.add(neck);
  for(const xx of[-.06,.06]){const br=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.3,6),rimMat);br.position.set(xx*2.2,-.06,.13);br.rotation.x=1.05;br.rotation.z=-xx*6;rimPivot.add(br)}
  const h={s,g,top,rimPivot,flex:0,flexV:0,flexT:0,shake:0,netV:new V3(),rim:new V3(0,RIM_H,s*RIM_Z),active:true};
  const zf=s*BOARD_FACE, zb=s*(BOARD_FACE+.04);
  h.cols=[{min:new V3(-BOARD_W/2,bY-BOARD_H/2,Math.min(zf,zb)),max:new V3(BOARD_W/2,bY+BOARD_H/2,Math.max(zf,zb)),e:.62,snd:'board',h},
          {min:new V3(-.07,RIM_H-.06,Math.min(zf,s*(BOARD_FACE-.15))),max:new V3(.07,RIM_H+.006,Math.max(zf,s*(BOARD_FACE-.15))),e:.5,snd:'rim',h}];
  boxes.push(...h.cols); cyls.push({x:0,z:s*(HL+.55),r:.07,h:2.9,hoop:h});
  hoops.push(h); return h;
}
makeHoop(-1); makeHoop(1);

/* ---------- chain-link fence ---------- */
const fences=[];   // order: z-, z+, x-, x+
{ const c=cv(256,256),x=c.getContext('2d'); x.strokeStyle='#b7bcc0'; x.lineWidth=5;
  for(let i=-4;i<=8;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64+256,256);x.moveTo(i*64,0);x.lineTo(i*64-256,256);x.stroke()}
  x.strokeStyle='rgba(70,74,78,.8)'; x.lineWidth=1.5; for(let i=-4;i<=8;i++){x.beginPath();x.moveTo(i*64+3,0);x.lineTo(i*64+259,256);x.stroke()}
  const base=tex(c); const fg=new THREE.Group(); env.add(fg); fg.userData.sides=[];
  const side=(len,px,pz,ry)=>{ const t=base.clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(len/.2,FENCE_H/.2); t.needsUpdate=true;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(len,FENCE_H,Math.round(len/.45),7),new THREE.MeshStandardMaterial({map:t,transparent:true,side:THREE.DoubleSide,metalness:.7,roughness:.5,depthWrite:false}));
    m.userData.dyn=true; fences.push({m,ry,out:(px+pz)>0?1:-1,amp:0,av:0,u:0,v:0,live:false});
    m.position.set(px,FENCE_H/2,pz); m.rotation.y=ry; fg.add(m);
    for(const yy of[.05,FENCE_H]){const r=shadowOn(new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,len,8),galv));r.rotation.z=Math.PI/2;r.rotation.y=ry;r.position.set(px,yy,pz);fg.add(r)} };
  side(SLAB_W,0,-FZ,0); side(SLAB_W,0,FZ,0); side(SLAB_L,-FX,0,Math.PI/2); side(SLAB_L,FX,0,Math.PI/2);
  const pts=[]; for(let xx=-FX;xx<=FX+.01;xx+=SLAB_W/6){pts.push([xx,-FZ],[xx,FZ])} for(let zz=-FZ+SLAB_L/10;zz<FZ-.01;zz+=SLAB_L/10){pts.push([-FX,zz],[FX,zz])}
  const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.035,FENCE_H+.12,10),galv,pts.length); const M=new THREE.Matrix4();
  pts.forEach((p,i)=>{M.makeTranslation(p[0],(FENCE_H+.12)/2-.04,p[1]);im.setMatrixAt(i,M)}); im.castShadow=true; fg.add(im);
}

/* ---------- park furniture ---------- */
const wood=new THREE.MeshStandardMaterial({color:IMG.wood_d?0xb8a48c:0x7a5a3a,map:ptex('wood_d',.25,2),normalMap:ptex('wood_n',.25,2,false),roughness:.8});
function bench(x,z){ const g=new THREE.Group(); g.position.set(x,0,z); env.add(g);
  for(let i=0;i<4;i++){const s=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.09,.035,2),wood));s.position.set(-.17+i*.115,.45,0);g.add(s)}
  for(let i=0;i<3;i++){const s=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.03,.09,2),wood));s.position.set(-.26*Math.sign(x)*-1*0-.25*Math.sign(x)*-1, .58+i*.12,0); s.position.x=Math.sign(x)*.25; g.add(s)}
  for(const zz of[-.8,.8]){const l=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.5,.43,.05),blackSteel));l.position.set(0,.215,zz);g.add(l);
    const b=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.04,.5,.05),blackSteel));b.position.set(Math.sign(x)*.27,.66,zz);g.add(b)}
  boxes.push({min:new V3(x-.3,0,z-1),max:new V3(x+.3,.47,z+1),e:.4,snd:'thud'}); }
bench(-FX+.55,-4.5); bench(-FX+.55,4.5); bench(FX-.55,-4.5);
{ const can=shadowOn(new THREE.Mesh(new THREE.CylinderGeometry(.27,.24,.85,18,1,true),new THREE.MeshStandardMaterial({color:0x4f6a58,map:ptex('rust_d',2,1),metalness:.5,roughness:.65,side:THREE.DoubleSide})));
  can.position.set(FX-.6,.425,2.5); env.add(can); cyls.push({x:FX-.6,z:2.5,r:.27,h:.85}); }
{ // light standards, switched on
  const glowT=radial(128,[[0,'rgba(255,244,215,1)'],[.12,'rgba(255,236,190,.55)'],[.45,'rgba(180,190,200,.10)'],[1,'rgba(0,0,0,0)']]);
  const mothM=new THREE.PointsMaterial({map:dotT,color:0xfff2cc,size:.05,sizeAttenuation:true,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const lens=new THREE.MeshBasicMaterial({color:0xfff6e0,fog:false}); W.lens=lens;
  [[-FX+.25,-9.5],[FX-.25,-9.5],[-FX+.25,9.5],[FX-.25,9.5]].forEach(([lx,lz],idx)=>{ const sx=Math.sign(lx), hx=lx-sx*1.05;
    const p=shadowOn(new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,7.5,12),galv)); p.position.set(lx,3.75,lz); env.add(p);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(1.1,.06,.06),galv); arm.position.set(lx-sx*.5,7.45,lz); env.add(arm);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,.3),blackSteel); head.position.set(hx,7.4,lz); env.add(head);
    const l=new THREE.Mesh(new THREE.BoxGeometry(.46,.02,.22),lens); l.position.set(hx,7.33,lz); env.add(l);
    const sl=new THREE.SpotLight(0xfff0d2,400,75,1.1,.8,2); sl.position.set(hx,7.3,lz); sl.target.position.set(lx*.2,0,lz*.55); env.add(sl,sl.target);
    sl.shadow.mapSize.set(1024,1024); sl.shadow.bias=-.0004; sl.shadow.normalBias=.02; sl.shadow.camera.near=2; sl.shadow.camera.far=40; lamps.push(sl); lampPos.push(new V3(hx,7.3,lz));
    for(const [sx2,sy2,op] of [[1.5,1.5,.8]]){ const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true,opacity:op})); gl.scale.set(sx2,sy2,1); gl.position.set(hx,7.3,lz); gl.userData.op=op; env.add(gl); glows.push(gl); } // core, bloom halo and lens streaks
    const ma=new Float32Array(42); for(let i=0;i<42;i++) ma[i]=rr(-.7,.7)*(i%3===1?.6:1);
    const moths=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(ma,3)),mothM); moths.position.set(hx,6.9,lz); env.add(moths); glows.push(moths);
    anim.push(t=>{ moths.rotation.set(Math.sin(t*1.7+idx)*.5,t*(2.1+idx*.3),Math.cos(t*2.3+idx)*.5); });
    cyls.push({x:lx,z:lz,r:.08,h:7.5}); }); }

/* ---------- scoreboard + rules sign on the fence ---------- */
const sbC=cv(512,256), sbT=tex(sbC);
{ const m=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.08,1.2,2.4),[new THREE.MeshStandardMaterial({color:0x111}),new THREE.MeshStandardMaterial({map:sbT,emissive:0xffffff,emissiveMap:sbT,emissiveIntensity:.6,roughness:.6}),blackSteel,blackSteel,blackSteel,blackSteel]));
  m.position.set(FX-.09,2.35,0); env.add(m);
  const c=cv(512,640),x=c.getContext('2d'); x.fillStyle='#1d4a34'; x.fillRect(0,0,512,640); x.strokeStyle='#e9e6da'; x.lineWidth=6; x.strokeRect(12,12,488,616);
  x.fillStyle='#e9e6da'; x.textAlign='center'; x.font='700 44px Arial'; x.fillText('COURT RULES',256,78);
  x.font='600 22px Arial'; const L=['GRIP or TRIGGER — grab the ball','Point + GRIP — pull the ball in','Swing and let go — shoot','A / X — ball to your hand','LEFT STICK — walk','RIGHT STICK — turn · push to teleport','B taller · Y shorter','CLICK A STICK — the menu','HANDS — pinch or grip the ball','HANDS — hold a pinch to teleport'];
  L.forEach((s,i)=>x.fillText(s,256,140+i*48));
  for(let i=0;i<300;i++){x.fillStyle=`rgba(0,0,0,${rr(.02,.12)})`;x.beginPath();x.arc(rnd()*512,rnd()*640,rr(1,7),0,7);x.fill()}
  const sign=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.02,1.25,1),[blackSteel,new THREE.MeshStandardMaterial({map:tex(c),roughness:.6,metalness:.2}),blackSteel,blackSteel,blackSteel,blackSteel]));
  sign.position.set(FX-.06,1.7,-2.4); env.add(sign);
}
const stats={pts:0,made:0,shots:0,line:''};
function drawScore(){ const x=sbC.getContext('2d'); x.fillStyle='#07090a'; x.fillRect(0,0,512,256); x.strokeStyle='#3a3d40'; x.lineWidth=8; x.strokeRect(4,4,504,248);
  x.textAlign='center'; x.fillStyle='#d8d6cc'; x.font='700 26px Arial'; x.fillText('POINTS',140,50); x.fillText('MADE / SHOTS',366,50);
  x.fillStyle='#ffb629'; x.font='700 130px "Courier New",monospace'; x.fillText(String(stats.pts).padStart(2,'0'),140,190);
  x.font='700 84px "Courier New",monospace'; x.fillText(stats.made+'/'+stats.shots,366,176);
  if(stats.line){ x.fillStyle='#d8d6cc'; x.font='700 24px Arial'; x.fillText(stats.line,256,238); }
  sbT.needsUpdate=true; $('pts').textContent=stats.pts; $('fg').textContent=stats.made+' / '+stats.shots; $('gm').textContent=stats.line||'free play'; }
drawScore();

/* ---------- jungle ---------- */
{ const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),P=new V3(),S=new V3(),C=new THREE.Color();
  const clear=(x,z,m)=>Math.abs(x)<FX+m&&Math.abs(z)<FZ+m;
  const lc=cv(256,256),lx=lc.getContext('2d'); lx.fillStyle='#1f3a16'; lx.fillRect(0,0,256,256);
  for(let i=0;i<2600;i++){lx.fillStyle=`hsl(${rr(80,135)},${rr(35,60)}%,${rr(10,36)}%)`;lx.beginPath();lx.ellipse(rnd()*256,rnd()*256,rr(3,9),rr(1.5,4),rr(0,3.2),0,7);lx.fill()}
  const lt=tex(lc,{rep:[5,3]});
  const leafM=new THREE.MeshLambertMaterial({map:lt}); leafM.userData.wind='.03';
  const bark=new THREE.MeshLambertMaterial({map:ptex('bark_d',3,5),color:IMG.bark_d?0x9c9388:0x3a2f24});
  const blob=()=>{const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position,o=rr(0,50);for(let i=0;i<p.count;i++){const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i);
    const k=1+.16*Math.sin(X*5+o)*Math.cos(Y*6+o*2)+.12*Math.sin(Z*9+X*4+o)+.06*Math.sin(Y*17+Z*13);p.setXYZ(i,X*k,Y*k*.7,Z*k)}g.attributes.normal.copy(g.attributes.position);g.normalizeNormals();return g};
  // broadleaf canopy trees
  const NT=230, tg=new THREE.CylinderGeometry(.55,1,1,7); tg.translate(0,.5,0);
  const trunks=new THREE.InstancedMesh(tg,bark,NT), can=[0,1,2].map(()=>new THREE.InstancedMesh(blob(),leafM,NT));
  for(let i=0;i<NT;i++){ let x,z; do{ const a=rr(0,6.283),r=13+Math.pow(rnd(),1.4)*95; x=Math.cos(a)*r; z=Math.sin(a)*r; }while(clear(x,z,2.2));
    const y=terrainH(x,z)-.3,h=rr(9,24),w=.3+h*.02; E.set(rr(-.06,.06),rr(0,6.3),rr(-.06,.06)); Q.setFromEuler(E);
    M.compose(P.set(x,y,z),Q,S.set(w,h*.8,w)); trunks.setMatrixAt(i,M);
    for(let k=0;k<3;k++){ const r=h*rr(.24,.4); E.set(0,rr(0,6.3),0); Q.setFromEuler(E);
      M.compose(P.set(x+rr(-1,1)*h*.2,y+h*rr(.72,1.0),z+rr(-1,1)*h*.2),Q,S.set(r,r,r)); can[k].setMatrixAt(i,M);
      can[k].setColorAt(i,C.setHSL(rr(.24,.36),rr(.3,.6),rr(.35,.7))); } }
  env.add(trunks,...can);
  // near trees get real silhouettes: limbs plus sprays of individual leaves breaking the canopy outline
  const sc3=cv(256,256),sx3=sc3.getContext('2d');
  for(let k=0;k<7;k++){ const a0=-Math.PI/2+rr(-1.2,1.2); let px=128,py=250; sx3.strokeStyle='#3a3020'; sx3.lineWidth=3; sx3.beginPath(); sx3.moveTo(px,py);
    for(let q=0;q<9;q++){ const a=a0+rr(-.25,.25); px+=Math.cos(a)*24; py+=Math.sin(a)*24; sx3.lineTo(px,py);
      for(const sd of[-1,1]){ const la=a+sd*rr(.7,1.3),ll=rr(22,40); sx3.save(); sx3.translate(px,py); sx3.rotate(la); sx3.fillStyle=`hsl(${rr(85,130)},${rr(40,62)}%,${rr(14,36)}%)`;
        sx3.beginPath(); sx3.moveTo(0,0); sx3.quadraticCurveTo(ll*.5,-ll*.3,ll,0); sx3.quadraticCurveTo(ll*.5,ll*.3,0,0); sx3.fill(); sx3.strokeStyle='rgba(160,190,90,.5)'; sx3.lineWidth=1; sx3.beginPath(); sx3.moveTo(0,0); sx3.lineTo(ll,0); sx3.stroke(); sx3.restore(); } }
    sx3.strokeStyle='#3a3020'; sx3.lineWidth=3; sx3.stroke(); }
  const cardM=new THREE.MeshLambertMaterial({map:tex(sc3),alphaTest:.45,side:THREE.DoubleSide}); cardM.userData.wind='uv.y*.14';
  const cg2=new THREE.PlaneGeometry(1,1,1,2); cg2.translate(0,.5,0);
  const near=[]; for(let i=0;i<NT;i++){ trunks.getMatrixAt(i,M); P.setFromMatrixPosition(M); if(Math.hypot(P.x,P.z)<42) near.push(i); }
  const CPT=16, cards=new THREE.InstancedMesh(cg2,cardM,near.length*CPT*3), limbs=new THREE.InstancedMesh(tg,bark,near.length*3); let cn=0,ln=0; const T0=new V3(),B0=new V3(),D0=new V3();
  for(const i of near){ trunks.getMatrixAt(i,M); M.decompose(T0,Q,S); const hgt=S.y;
    for(let k=0;k<3;k++){ can[k].getMatrixAt(i,M); M.decompose(B0,Q,S); const rad=S.x;
      T0.y+=hgt*rr(.55,.8); D0.subVectors(B0,T0); const len=D0.length(); Q.setFromUnitVectors(new V3(0,1,0),D0.normalize()); M.compose(T0,Q,S.set(.16,len,.16)); limbs.setMatrixAt(ln++,M); T0.y-=hgt*.6; T0.y=Math.max(T0.y,terrainH(T0.x,T0.z));
      for(let c=0;c<CPT;c++){ D0.set(rr(-1,1),rr(-.5,1),rr(-1,1)).normalize(); P.copy(B0).addScaledVector(D0,rad*.72); E.set(rr(-.9,.9),rr(0,6.3),rr(-.9,.9)); Q.setFromEuler(E); const sz=rr(2.2,3.8);
        M.compose(P,Q,S.set(sz,sz,sz)); cards.setMatrixAt(cn,M); cards.setColorAt(cn,C.setHSL(rr(.24,.34),.5,rr(.45,.8))); cn++; } } }
  cards.count=cn; limbs.count=ln; env.add(cards,limbs);
  // frond geometry shared by palms and undergrowth
  const fc=cv(128,512),fx=fc.getContext('2d'); fx.lineCap='round';
  for(let y=500;y>8;y-=7){ const t=1-y/512, len=58*Math.sin(Math.min(1,t*1.15+.08)*Math.PI)**.6; fx.strokeStyle=`hsl(${rr(85,125)},${rr(40,60)}%,${rr(16,34)}%)`; fx.lineWidth=5.5;
    for(const sg of[-1,1]){fx.beginPath();fx.moveTo(64,y);fx.lineTo(64+sg*len,y-len*.55);fx.stroke()} }
  fx.strokeStyle='#5d6b2c'; fx.lineWidth=5; fx.beginPath(); fx.moveTo(64,512); fx.lineTo(64,4); fx.stroke();
  const fg=new THREE.PlaneGeometry(1,1,2,7); fg.translate(0,.5,0); { const p=fg.attributes.position; for(let i=0;i<p.count;i++){const t=p.getY(i);p.setZ(i,t*t*.55+Math.abs(p.getX(i))*.3)} fg.computeVertexNormals(); }
  const frondM=new THREE.MeshLambertMaterial({map:tex(fc),alphaTest:.5,side:THREE.DoubleSide}); frondM.userData.wind='uv.y*uv.y*.09';
  const NP=90, FP=11, NU=300, FU=6;
  const ptr=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({map:ptex('bark_d',1,6),color:0x8a8272}),NP), fr=new THREE.InstancedMesh(fg,frondM,NP*FP+NU*FU); let n=0;
  const QA=new THREE.Quaternion(),UP=new V3(0,1,0),XA=new V3(1,0,0);
  const fronds=(x,y,z,cnt,L0,L1,t0,t1,w)=>{ const o=rr(0,6.3); for(let k=0;k<cnt;k++){ Q.setFromAxisAngle(UP,o+k/cnt*6.283+rr(-.25,.25)); QA.setFromAxisAngle(XA,rr(t0,t1)); Q.multiply(QA);
      const L=rr(L0,L1); M.compose(P.set(x,y,z),Q,S.set(L*w,L,L)); fr.setMatrixAt(n,M); fr.setColorAt(n,C.setHSL(rr(.22,.33),.5,rr(.4,.75))); n++; } };
  for(let i=0;i<NP;i++){ let x,z; do{ const a=rr(0,6.283),r=12+Math.pow(rnd(),1.6)*60; x=Math.cos(a)*r; z=Math.sin(a)*r; }while(clear(x,z,1.6));
    const y=terrainH(x,z)-.2,h=rr(6,13); E.set(rr(-.14,.14),rr(0,6.3),rr(-.14,.14)); Q.setFromEuler(E); M.compose(P.set(x,y,z),Q,S.set(.2,h,.2)); ptr.setMatrixAt(i,M);
    P.set(0,h,0).applyQuaternion(Q); fronds(x+P.x,y+P.y,z+P.z,FP,2.8,4.2,.75,1.55,.3); }
  for(let i=0;i<NU;i++){ let x,z; do{ x=rr(-FX-30,FX+30); z=rr(-FZ-30,FZ+30); }while(clear(x,z,.35)||(rnd()<.6&&!clear(x,z,9)));
    fronds(x,terrainH(x,z)-.05,z,FU,.9,2.3,.45,1.15,.38); }
  env.add(ptr,fr);
  // drifting ground mist
  const mt=radial(128,[[0,'rgba(255,255,255,1)'],[.5,'rgba(255,255,255,.35)'],[1,'rgba(255,255,255,0)']]), mist=[];
  for(let i=0;i<16;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:mt,color:0x93a7b6,transparent:true,opacity:rr(.035,.08),depthWrite:false,fog:false}));
    sp.scale.set(rr(14,30),rr(4,8),1); sp.position.set(rr(-38,38),rr(.8,3.4),rr(-40,40)); sp.userData.v=rr(.15,.5)*(rnd()<.5?-1:1); mistG.add(sp); mist.push(sp); }
  // fireflies
  const flies=[0,1,2].map(k=>{ const a=new Float32Array(45*3); for(let i=0;i<45;i++){ let x,z; do{ x=rr(-FX-14,FX+14); z=rr(-FZ-14,FZ+14); }while(clear(x,z,-1)&&rnd()<.8); a[i*3]=x; a[i*3+1]=rr(.4,3.2); a[i*3+2]=z; }
    const pts=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(a,3)),new THREE.PointsMaterial({map:dotT,color:0xd6ff5e,size:.11,sizeAttenuation:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    pts.frustumCulled=false; env.add(pts); return pts; });
  W.flies=flies;
  anim.push((t,dt)=>{ for(const m of mist){ m.position.x+=m.userData.v*dt; if(m.position.x>42)m.position.x=-42; if(m.position.x<-42)m.position.x=42; }
    flies.forEach((f,k)=>{ f.material.opacity=W.night*Math.max(0,Math.sin(t*(.9+k*.23)+k*2.1))**2; f.position.set(Math.sin(t*.21+k)*.6,Math.sin(t*.33+k*1.7)*.25,Math.cos(t*.17+k*2)*.6); }); });
}

/* ---------- vines, gate, path, bike ---------- */
function tube(a,b,r,mat,parent=env){ const d=new V3().subVectors(b,a),len=d.length(),m=shadowOn(new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),mat));
  m.position.copy(a).addScaledVector(d,.5); m.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize()); parent.add(m); return m; }
{ const ic=cv(512,512),x=ic.getContext('2d');
  for(let k=0;k<16;k++){ let px=rr(20,492),py=0,a=Math.PI/2; x.strokeStyle='#33401f'; x.lineWidth=rr(2,4); x.beginPath(); x.moveTo(px,py); const L=rr(180,500);
    while(py<L){ a=Math.PI/2+rr(-.7,.7); px+=Math.cos(a)*14; py+=Math.sin(a)*14; x.lineTo(px,py);
      if(rnd()<.85){ x.save(); x.translate(px,py); x.rotate(rr(0,6.3)); const ll=rr(11,24); x.fillStyle=`hsl(${rr(88,128)},${rr(38,60)}%,${rr(13,34)}%)`;
        x.beginPath(); x.moveTo(0,0); x.bezierCurveTo(ll*.2,-ll*.8,ll,-ll*.5,ll,0); x.bezierCurveTo(ll,ll*.5,ll*.2,ll*.8,0,0); x.fill(); x.restore(); } }
    x.stroke(); }
  const ivy=new THREE.MeshLambertMaterial({map:tex(ic),alphaTest:.4,side:THREE.DoubleSide}); ivy.userData.wind='(1.-uv.y)*.035';
  for(let i=0;i<22;i++){ const onX=rnd()<.6, sgn=rnd()<.5?-1:1, w=rr(1.8,3.6), hgt=rr(1.4,FENCE_H), along=onX?rr(-FZ+2,FZ-2):rr(-FX+2,FX-2);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,hgt,4,1),ivy); m.position.set(onX?sgn*(FX+.03):along,FENCE_H-hgt/2+.05,onX?along:sgn*(FZ+.03)); m.rotation.y=onX?Math.PI/2:0; env.add(m); }
  // gate in the west fence, with a worn path leading out between the trees
  const gz=11.2; for(const zz of[gz-.6,gz+.6]) tube(new V3(-FX-.02,0,zz),new V3(-FX-.02,2.25,zz),.04,galv);
  tube(new V3(-FX-.02,2.25,gz-.6),new V3(-FX-.02,2.25,gz+.6),.03,galv); tube(new V3(-FX-.02,.12,gz-.57),new V3(-FX-.02,2.2,gz+.57),.018,galv); tube(new V3(-FX-.02,.12,gz-.6),new V3(-FX-.02,.12,gz+.6),.025,galv);
  const latch=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.05,.1,.14),blackSteel)); latch.position.set(-FX+.02,1.1,gz+.55); env.add(latch);
  const pc=cv(64,256),px2=pc.getContext('2d'),pg=px2.createLinearGradient(0,0,64,0); pg.addColorStop(0,'rgba(92,74,52,0)'); pg.addColorStop(.3,'rgba(92,74,52,.95)'); pg.addColorStop(.7,'rgba(84,68,48,.95)'); pg.addColorStop(1,'rgba(92,74,52,0)'); px2.fillStyle=pg; px2.fillRect(0,0,64,256);
  for(let i=0;i<300;i++){px2.fillStyle=`rgba(${rnd()<.5?'40,32,22':'140,120,92'},${rr(.1,.4)})`;px2.fillRect(rr(12,52),rnd()*256,rr(1,4),rr(1,4))}
  const pgm=new THREE.PlaneGeometry(1.7,44,1,44); pgm.rotateX(-Math.PI/2); const pp=pgm.attributes.position;
  for(let i=0;i<pp.count;i++){ const t=(pp.getZ(i)+22)/44, cx=-FX-1.2-t*40, cz=gz+Math.sin(t*5)*4*t, side=pp.getX(i); const X=cx, Z=cz+side; pp.setXYZ(i,X,terrainH(X,Z)+.06,Z); }
  pgm.computeVertexNormals(); env.add(new THREE.Mesh(pgm,new THREE.MeshLambertMaterial({map:tex(pc,{rep:[1,12]}),transparent:true,depthWrite:false})));
  // bike leaned on the fence by the gate
  const bk=new THREE.Group(); bk.position.set(-FX+.42,0,gz-2.3); bk.rotation.z=-.2; env.add(bk);
  const tyre=new THREE.MeshStandardMaterial({color:0x121212,roughness:.9}), paint=new THREE.MeshStandardMaterial({color:0x2e6f8e,metalness:.5,roughness:.4,map:ptex('rust_d',1,1)});
  for(const zz of[-.52,.52]){ const wh=shadowOn(new THREE.Mesh(new THREE.TorusGeometry(.33,.02,8,28),tyre)); wh.position.set(0,.35,zz); wh.rotation.y=Math.PI/2; bk.add(wh);
    for(let k=0;k<8;k++){ const a=k/8*Math.PI; tube(new V3(0,.35+Math.sin(a)*.32,zz+Math.cos(a)*.32),new V3(0,.35-Math.sin(a)*.32,zz-Math.cos(a)*.32),.003,galv,bk); } }
  const A=new V3(0,.35,-.52),B=new V3(0,.35,.52),BB=new V3(0,.33,-.05),ST=new V3(0,.86,-.2),HT=new V3(0,.9,.38);
  tube(A,BB,.014,paint,bk); tube(BB,ST,.016,paint,bk); tube(A,ST,.011,paint,bk); tube(ST,HT,.016,paint,bk); tube(BB,HT,.018,paint,bk); tube(HT,B,.014,paint,bk);
  tube(new V3(-.24,.98,.4),new V3(.24,.98,.4),.012,blackSteel,bk); tube(HT,new V3(0,.98,.4),.014,galv,bk);
  const seat=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.13,.04,.26),tyre)); seat.position.set(0,.93,-.22); bk.add(seat); tube(ST,new V3(0,.92,-.21),.012,galv,bk);
  boxes.push({min:new V3(-FX+.15,0,gz-3.25),max:new V3(-FX+.6,1.0,gz-1.35),e:.35,snd:'fence'});
}

/* ---------- AR shadow catcher ---------- */
const catcher=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.ShadowMaterial({opacity:.35}));
catcher.rotation.x=-Math.PI/2; catcher.position.set(0,.002,-RIM_Z+2); catcher.receiveShadow=true; catcher.visible=false; scene.add(catcher);

/* ---------- audio (synthesised) ---------- */
let AC=null,master,noiseBuf,revIn,amb=null,rainG=null; const lastSnd={};
function setAmb(){ if(!amb) return; const g=venue==='gym'; amb.gain.setTargetAtTime(g?.05:1,AC.currentTime,.4); revIn.gain.setTargetAtTime(g?.75:.3,AC.currentTime,.4); }
function setRain(v){ if(rainG) rainG.gain.setTargetAtTime(v*.11,AC.currentTime,.8); }
function initAudio(){ if(AC){ if(AC.state!=='running') AC.resume(); return; }
  if(typeof K!=='undefined'){ for(const f of K.gesture.splice(0)) try{ f(); }catch(e){} }
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; comp.attack.value=.003; comp.release.value=.2; comp.connect(AC.destination);
  master=AC.createGain(); master.gain.value=.9; master.connect(comp); const sr=AC.sampleRate;
  noiseBuf=AC.createBuffer(1,sr*2,sr); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  // the clearing's acoustics: slap-back off the tree line and a short diffuse tail
  const ir=AC.createBuffer(2,sr*1.1|0,sr); for(let ch=0;ch<2;ch++){ const b=ir.getChannelData(ch); for(let i=0;i<b.length;i++){ const tt=i/sr; b[i]=tt<.02?0:(Math.random()*2-1)*Math.exp(-tt/.2)*.45; }
    for(const [tt,g] of [[.085+ch*.011,.5],[.13-ch*.008,.38],[.21+ch*.017,.25],[.33,.14]]){ const k=tt*sr|0; for(let j=0;j<60;j++) b[k+j]+=(Math.random()*2-1)*g*(1-j/60); } }
  const conv=AC.createConvolver(); conv.buffer=ir; revIn=AC.createGain(); revIn.gain.value=.3; revIn.connect(conv); conv.connect(master);
  amb=AC.createGain(); amb.connect(master); setAmb();
  const bed=(type,freq,q,gain,lfoHz,depth)=>{ const n=AC.createBufferSource(); n.buffer=noiseBuf; n.loop=true; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q; const g=AC.createGain(); g.gain.value=gain;
    const l=AC.createOscillator(); l.frequency.value=lfoHz; const lg=AC.createGain(); lg.gain.value=depth; l.connect(lg); lg.connect(g.gain); l.start(); n.connect(f); f.connect(g); g.connect(amb); n.start(0,Math.random()); };
  bed('lowpass',380,.5,.02,.09,.012);        // wind
  bed('bandpass',2600,.6,.007,.13,.006);     // leaves
  bed('highpass',6000,.5,.0025,.21,.002);    // canopy hiss
  { const n=AC.createBufferSource(); n.buffer=noiseBuf; n.loop=true; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3200; f.Q.value=.35; const f2=AC.createBiquadFilter(); f2.type='lowpass'; f2.frequency.value=700; const g2=AC.createGain(); g2.gain.value=.6;
    rainG=AC.createGain(); rainG.gain.value=W.rain*.11; n.connect(f); f.connect(rainG); n.connect(f2); f2.connect(g2); g2.connect(rainG); rainG.connect(master); n.start(); } // rain on leaves and court
  for(const [f,rate,gv] of [[4150,31,.011],[4720,26,.008],[5600,38,.005]]){ const o=AC.createOscillator(),cg=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain(),sl=AC.createOscillator(),sg=AC.createGain(),og=AC.createGain();
    o.frequency.value=f; cg.gain.value=gv; l.type='square'; l.frequency.value=rate; lg.gain.value=gv; l.connect(lg); lg.connect(cg.gain);
    og.gain.value=.5; sl.frequency.value=.25+Math.random()*.45; sg.gain.value=.5; sl.connect(sg); sg.connect(og.gain); o.connect(cg); cg.connect(og); og.connect(amb); o.start(); l.start(); sl.start(); } // crickets
  for(const lp of lampPos){ const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=120; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=480; f.Q.value=1.2; const g=AC.createGain(); g.gain.value=.05; o.connect(f); f.connect(g); g.connect(out(lp,1.2)); o.start(); } // ballast hum
  const night=()=>{ if(AC.state==='running'&&venue!=='gym'){ const a=Math.random()*6.283,p=out(new V3(Math.cos(a)*(16+Math.random()*14),.5,Math.sin(a)*(20+Math.random()*14)));
      if(Math.random()<.2){ p.positionY.value=12; for(const [dl,du] of [[0,.35],[.5,.18],[.75,.5]]){ const t0=AC.currentTime+dl,o=AC.createOscillator(),g=AC.createGain(); o.frequency.setValueAtTime(355,t0); o.frequency.linearRampToValueAtTime(330,t0+du);
          g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(.5,t0+.05); g.gain.linearRampToValueAtTime(0,t0+du); o.connect(g); g.connect(p); o.start(t0); o.stop(t0+du+.05); } } // owl
      else { const k=2+(Math.random()*3|0),f0=170+Math.random()*250; for(let i=0;i<k;i++){ tone(p,'sawtooth',f0,f0*.8,.5,.16,i*.32); tone(p,'square',f0*2.02,f0*1.7,.18,.12,i*.32); } } }
    setTimeout(night,2500+Math.random()*6500); }; setTimeout(night,2000);
}
function out(pos,ref=2.5){ const p=AC.createPanner(); p.panningModel='HRTF'; p.distanceModel='inverse'; p.refDistance=ref; p.rolloffFactor=1.1;
  p.positionX.value=pos.x; p.positionY.value=pos.y; p.positionZ.value=pos.z; p.connect(master); p.connect(revIn); return p; }
function tone(p,type,f0,f1,g,dur,t0=0){ const t=AC.currentTime+t0,o=AC.createOscillator(),gg=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  gg.gain.setValueAtTime(g,t); gg.gain.exponentialRampToValueAtTime(.0008,t+dur); o.connect(gg); gg.connect(p); o.start(t); o.stop(t+dur+.02); }
function burst(p,ftype,f0,f1,q,g,dur,t0=0){ const t=AC.currentTime+t0,n=AC.createBufferSource(); n.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type=ftype; f.Q.value=q;
  f.frequency.setValueAtTime(f0,t); f.frequency.exponentialRampToValueAtTime(f1,t+dur); const gg=AC.createGain(); gg.gain.setValueAtTime(g,t); gg.gain.exponentialRampToValueAtTime(.0008,t+dur);
  n.connect(f); f.connect(gg); gg.connect(p); n.start(t,Math.random()); n.stop(t+dur+.02); }
function snd(kind,pos,speed,pm=1){ if(!AC||AC.state!=='running') return; const now=AC.currentTime; if(now-(lastSnd[kind]||0)<.04) return;
  const a=Math.pow(Math.min(1,speed/8),1.25); if(a<.012) return; lastSnd[kind]=now; const p=out(pos,kind==='thunder'?30:2.5), j=(.95+Math.random()*.1)*pm;
  if(kind==='bounce'){ tone(p,'sine',175*j,52,a*1.5,.14); burst(p,'lowpass',320,120,.7,a*.9,.09);              // slab thump
    tone(p,'triangle',(330+speed*14)*j,(300+speed*9)*j,a*.3,.27); tone(p,'sine',(670+speed*22)*j,640*j,a*.08,.13); // air-cavity ring of the ball
    burst(p,'bandpass',1900,600,.9,a*.8,.045); }                                                                   // rubber slap
  else if(kind==='rim'){ for(const [f,g,d] of [[512,.5,.55],[873,.35,.42],[1361,.25,.3],[2140,.15,.2],[3320,.07,.12]]) tone(p,'sine',f*j,f*j*.997,a*g,d);
    burst(p,'highpass',3000,2000,.5,a*.4,.03); tone(p,'sine',120,80,a*.5,.1);
    if(speed>2) for(const [dl,g] of [[.07,.4],[.15,.22],[.24,.1]]){ tone(p,'sine',512*j,510*j,a*g*.5,.25,dl); tone(p,'sine',1361*j,1355*j,a*g*.3,.14,dl); burst(p,'highpass',3500,2500,.5,a*g*.3,.02,dl); } } // rim chatter
  else if(kind==='board'){ tone(p,'sine',140*j,68,a*1.4,.17); burst(p,'lowpass',900,300,.7,a*1.0,.14); tone(p,'sine',233*j,229*j,a*.25,.5); tone(p,'sine',587*j,580*j,a*.14,.4); tone(p,'sine',1190*j,1180*j,a*.06,.25);
    for(const [dl,g] of [[.06,.35],[.13,.18]]) burst(p,'bandpass',700,500,2,a*g,.05,dl); }                        // steel plate and bracket rattle
  else if(kind==='swish'){ burst(p,'bandpass',3200,900,1.2,.9,.33); burst(p,'highpass',5000,2500,.5,.3,.2); burst(p,'bandpass',1500,700,2,.25,.2,.12); }
  else if(kind==='fence'){ burst(p,'bandpass',3400,2200,3,a*.9,.55); burst(p,'bandpass',6100,5000,5,a*.5,.7); burst(p,'bandpass',2500,2100,6,a*.4,.5,.09); tone(p,'sine',95,70,a*.4,.1); }
  else if(kind==='chain'||kind==='rimchain'){ const g0=kind==='chain'?.5:a*.3; for(let i=0;i<(kind==='chain'?9:4);i++){ const dl=i*.035+Math.random()*.02; burst(p,'bandpass',5200+Math.random()*2500,4200,7,g0*(1-i*.09),.09,dl); tone(p,'sine',2300+Math.random()*1800,2200,g0*.12,.06,dl); }
    if(kind==='rimchain'){ for(const [f,g,d] of [[512,.5,.55],[873,.35,.42],[1361,.25,.3]]) tone(p,'sine',f*j,f*j*.997,a*g,d); tone(p,'sine',120,80,a*.5,.1); } }
  else if(kind==='thunder'){ burst(p,'lowpass',160,40,.6,a*5,2.8); burst(p,'lowpass',420,70,.5,a*3,1.3); burst(p,'bandpass',900,200,.4,a*1.6,.35); for(let i=1;i<4;i++) burst(p,'lowpass',120,45,.7,a*2.2/i,1.4,i*.6+Math.random()*.3); }
  else if(kind==='catch'){ burst(p,'lowpass',1600,500,.7,a*1.2,.05); tone(p,'sine',210*j,120,a*.6,.07); }
  else if(kind==='step'){ burst(p,'bandpass',620*j,260,.8,.2,.08); burst(p,'highpass',3600,2600,.5,.035,.05); }
  else { tone(p,'sine',150,70,a,.1); burst(p,'lowpass',700,300,.7,a*.6,.07); } }

/* ---------- shared scratch ---------- */
const _n=new V3(),_t=new V3(),_c=new V3(),_a=new V3(),_b=new V3(),_d=new V3(),_e=new V3(),_s=new V3(),_hp=new V3(),UPV=new V3(0,1,0);
const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_m4=new THREE.Matrix4(),_f=new V3(),_r=new V3(),_col=new THREE.Color();
const _eul=new THREE.Euler(), rr2=(a,b)=>a+Math.random()*(b-a);
let mode=null; // null = browser, 'vr', 'ar'
let sport='hoops', venue='clearing', arPick='hoops'; const SPORTS={}, BND={cx:0,cz:0,x:FX-.4,z:FZ-.4}, SOLIDS=[];
function headPos(){ return camera.getWorldPosition(_hp); }
const world={hour:22,wx:'mist',net:'nylon',pref:0,court:'jungle'}, CEIL=9; let GYM=null;
function seg(m,a,b){ _d.subVectors(b,a); const L=_d.length()||1e-4; m.position.copy(a); m.quaternion.setFromUnitVectors(UPV,_d.multiplyScalar(1/L)); m.scale.set(1,L,1); }

/* ---------- balls: four kinds on a rack ---------- */
const BT=[{name:'Rubber',e:.9,mu:.7,pitch:1,rough:.72,c:['#b9541a','#c9651f','#b24f18'],seam:'#17110d',dot:'70,25,5',dirt:120,label:'STREET  29.5'},
  {name:'Leather',e:.86,mu:.82,pitch:.9,rough:.58,c:['#7c3f1c','#8f4a22','#74391a'],seam:'#0e0a08',dot:'40,15,5',dirt:60,label:'GAME  29.5'},
  {name:'Worn',e:.8,mu:.58,pitch:.82,rough:.88,c:['#a8794f','#b98a5e','#9c6e48'],seam:'#3a2c22',dot:'90,60,40',dirt:340,label:''},
  {name:'Tricolor',e:.9,mu:.7,pitch:1.05,rough:.7,c:null,seam:'#111111',dot:'30,30,40',dirt:90,label:''}];
function ballTextures(T){ const c=cv(1024,512),x=c.getContext('2d'),b=cv(1024,512),y=b.getContext('2d');
  if(T.c){ const g=x.createLinearGradient(0,0,0,512); g.addColorStop(0,T.c[0]); g.addColorStop(.5,T.c[1]); g.addColorStop(1,T.c[2]); x.fillStyle=g; x.fillRect(0,0,1024,512); }
  else ['#b5262b','#e8e4d8','#1f3f8a','#e8e4d8'].forEach((k,i)=>{ for(const o of[0,512]){ x.fillStyle=k; x.fillRect(o+i*128,0,128,512); } });
  y.fillStyle='#6a6a6a'; y.fillRect(0,0,1024,512);
  for(let i=0;i<26000;i++){const px=rnd()*1024,py=rnd()*512,st=1/Math.max(.25,Math.sin(py/512*Math.PI));
    x.fillStyle=`rgba(${T.dot},${rr(.10,.28)})`; x.beginPath(); x.ellipse(px,py,1.5*st,1.5,0,0,7); x.fill();
    y.fillStyle='#b8b8b8'; y.beginPath(); y.ellipse(px+1,py+1,1.7*st,1.7,0,0,7); y.fill(); }
  for(let i=0;i<T.dirt;i++){const px=rnd()*1024,py=rnd()*512,r=rr(15,70),gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,`rgba(40,25,15,${rr(.05,.16)})`);gr.addColorStop(1,'rgba(40,25,15,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,2*r,2*r)}
  const seams=(k,col,w)=>{k.strokeStyle=col;k.lineWidth=w;k.beginPath();k.moveTo(0,256);k.lineTo(1024,256);
    for(const u of[0,512,1024]){k.moveTo(u,0);k.lineTo(u,512)} k.stroke();
    for(const u of[256,768]){k.beginPath();k.ellipse(u,256,150,188,0,0,7);k.stroke()} };
  seams(y,'#000',10); seams(x,T.seam,8);
  if(T.label){ x.fillStyle='rgba(20,14,10,.8)'; x.font='700 30px Arial'; x.textAlign='center'; x.fillText(T.label,512,215); }
  return [c,b]; }
const ballGeo=new THREE.SphereGeometry(BALL_R,40,28), blobGeo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const blobT=radial(64,[[0,'rgba(255,255,255,1)'],[.45,'rgba(255,255,255,.6)'],[1,'rgba(255,255,255,0)']]);
const balls=[], noBake=[];
const RACK={x:FX-.8,z:5.9,y:.98};
function mkBall(ti,i){ const T=BT[ti],[c,bm]=ballTextures(T), x=RACK.x, y=RACK.y, z=RACK.z+i*.3;
  const mesh=shadowOn(new THREE.Mesh(ballGeo,new THREE.MeshStandardMaterial({map:tex(c),bumpMap:tex(bm,{srgb:false}),bumpScale:1.4,roughness:T.rough,metalness:0})));
  const G=new THREE.Group(); G.add(mesh); scene.add(G); noBake.push(G);
  const blob=new THREE.Mesh(blobGeo,new THREE.MeshBasicMaterial({map:blobT,color:0x000000,transparent:true,depthWrite:false})); blob.renderOrder=1; scene.add(blob);
  const b={T,ti,G,mesh,blob,home:new V3(x,y,z),p:new V3(x,y,z),pp:new V3(x,y,z),v:new V3(),w:new V3(),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(0,6),rr(0,6),0)),sq:0,sqN:new V3(0,1,0),
    holder:null,holder2:null,pull:false,hover:0,rest:true,off:false,prevY:y,scored:false,from:new V3(),cool:0,live:false,dunk:false,twoT:-9,twoV:new V3()}; balls.push(b); return b; }
[0,1,2,3].forEach(mkBall);
let cur=balls[0];
{ const rk=new THREE.Group(); env.add(rk); W.rack=rk; const z0=RACK.z-.25, z1=RACK.z+1.15, ry=RACK.y-BALL_R*.78;
  for(const dx of[-.085,.085]){ tube(new V3(RACK.x+dx,ry,z0),new V3(RACK.x+dx,ry,z1),.014,galv,rk); for(const zz of[z0,z1]) tube(new V3(RACK.x+dx,0,zz),new V3(RACK.x+dx,ry+.25,zz),.016,galv,rk); }
  for(const zz of[z0,z1]) tube(new V3(RACK.x-.085,ry+.25,zz),new V3(RACK.x+.085,ry+.25,zz),.014,galv,rk);
  rk.traverse(o=>{ o.userData.dyn=true; }); boxes.push({min:new V3(RACK.x-.1,0,z0),max:new V3(RACK.x+.1,ry-.02,z1),e:.4,snd:'rim'}); }

/* ---------- wet ball marks ---------- */
const marks=Array.from({length:24},()=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0x070b10,transparent:true,opacity:0,depthWrite:false})); m.visible=false; m.userData.age=99; m.renderOrder=1; scene.add(m); return m; }); let markN=0;
function wetMark(x,y,z,size,board){ if(W.wet<.3) return; const m=marks[markN++%marks.length]; m.visible=true; m.userData.age=0; m.scale.setScalar(size);
  if(board){ m.rotation.set(0,board>0?Math.PI:0,0); m.position.set(x,y,z-board*.003); } else { m.rotation.set(-Math.PI/2,0,rr(0,6)); m.position.set(x,.005,z); } }

/* ---------- fallen leaves that scatter ---------- */
const LN=150, lf={p:new Float32Array(LN*3),v:new Float32Array(LN*3),r:new Float32Array(LN*3),on:new Uint8Array(LN),mesh:null};
{ const c=cv(64,32),x=c.getContext('2d'); x.fillStyle='#fff'; x.beginPath(); x.moveTo(2,16); x.quadraticCurveTo(30,-6,62,16); x.quadraticCurveTo(30,38,2,16); x.fill(); x.strokeStyle='rgba(0,0,0,.35)'; x.beginPath(); x.moveTo(2,16); x.lineTo(62,16); x.stroke();
  const g=new THREE.PlaneGeometry(.11,.055); g.rotateX(-Math.PI/2);
  lf.mesh=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({map:tex(c),alphaTest:.5,side:THREE.DoubleSide}),LN); lf.mesh.frustumCulled=false; env.add(lf.mesh);
  for(let i=0;i<LN;i++){ lf.p[i*3]=rr(-FX+.3,FX-.3); lf.p[i*3+1]=.004; lf.p[i*3+2]=rr(-FZ+.3,FZ-.3); lf.r[i*3+1]=rr(0,6.3); lf.mesh.setColorAt(i,_col.setHSL(rr(.06,.22),rr(.4,.7),rr(.18,.42))); leafM(i); } }
function leafM(i){ _q.setFromEuler(_eul.set(lf.r[i*3],lf.r[i*3+1],lf.r[i*3+2])); _m4.compose(_a.set(lf.p[i*3],lf.p[i*3+1],lf.p[i*3+2]),_q,_s.set(1,1,1)); lf.mesh.setMatrixAt(i,_m4); }
function kickLeaves(x,z,rad,str,dx=0,dz=0){ for(let i=0;i<LN;i++){ const ex=lf.p[i*3]-x, ez=lf.p[i*3+2]-z, d=Math.hypot(ex,ez); if(d>rad) continue; const k=str*(1-d/rad)/(d+.05);
    lf.v[i*3]+=ex*k*.5+dx*.3; lf.v[i*3+2]+=ez*k*.5+dz*.3; lf.v[i*3+1]+=str*rr(.3,.9)*(1-d/rad); lf.on[i]=1; } }
function stepLeaves(t,dt){ let any=false; for(let i=0;i<LN;i++){ if(!lf.on[i]) continue; any=true; const k=i*3;
    lf.v[k+1]-=3.2*dt; const dr=1-2.6*dt; lf.v[k]=lf.v[k]*dr+Math.sin(t*7+i)*1.2*dt; lf.v[k+2]=lf.v[k+2]*dr+Math.cos(t*6+i*2)*1.2*dt; lf.v[k+1]*=dr;
    lf.p[k]=THREE.MathUtils.clamp(lf.p[k]+lf.v[k]*dt,-FX+.1,FX-.1); lf.p[k+1]+=lf.v[k+1]*dt; lf.p[k+2]=THREE.MathUtils.clamp(lf.p[k+2]+lf.v[k+2]*dt,-FZ+.1,FZ-.1);
    lf.r[k]+=lf.v[k+2]*4*dt; lf.r[k+2]+=lf.v[k]*4*dt; lf.r[k+1]+=dt;
    if(lf.p[k+1]<=.004&&lf.v[k+1]<0){ lf.p[k+1]=.004; lf.r[k]=lf.r[k+2]=0; lf.v[k+1]=0; if(Math.hypot(lf.v[k],lf.v[k+2])<.25){ lf.v[k]=lf.v[k+2]=0; lf.on[i]=0; } }
    leafM(i); } if(any) lf.mesh.instanceMatrix.needsUpdate=true; }

/* ---------- string nets (Verlet), nylon or chain ---------- */
const NR=12, NH=6, netGeo=new THREE.CylinderGeometry(1,1,1,5,1,true); netGeo.translate(0,.5,0);
const netMats={nylon:new THREE.MeshStandardMaterial({color:0xe9e6dc,roughness:.95}),chain:new THREE.MeshStandardMaterial({color:0xa9adb2,metalness:.9,roughness:.35})};
for(const h of hoops){ const P=[],PP=[],L=[],cons=[]; const id=(r,i)=>r*NR+((i%NR)+NR)%NR;
  for(let r=0;r<NH;r++) for(let i=0;i<NR;i++){ const a=(i+(r%2)*.5)/NR*Math.PI*2, rad=r?THREE.MathUtils.lerp(RIM_R*.94,.125,(r-1)/(NH-2)):RIM_R, lp=new V3(Math.cos(a)*rad,-r*.085,Math.sin(a)*rad);
    L.push(lp); P.push(new V3(h.rim.x+lp.x,h.rim.y+lp.y,h.rim.z+lp.z)); PP.push(P[P.length-1].clone()); }
  for(let r=0;r<NH-1;r++) for(let i=0;i<NR;i++){ for(const j of [i,i+(r%2?1:-1)]){ const a=id(r,i),b=id(r+1,j); cons.push([a,b,L[a].distanceTo(L[b]),1]); } }
  for(let i=0;i<NR;i++){ const a=id(NH-1,i),b=id(NH-1,i+1); cons.push([a,b,L[a].distanceTo(L[b]),.25]); }
  const mesh=new THREE.InstancedMesh(netGeo,netMats.nylon,cons.length); mesh.frustumCulled=false; mesh.castShadow=true; scene.add(mesh);
  h.netS={P,PP,L,cons,mesh,quiet:0,pv:new V3(0,RIM_H,h.s*BOARD_FACE)}; }
function stepNet(h,dt){ const N=h.netS, chain=world.net==='chain'; let near=false; for(const b of balls) if(!b.off&&Math.abs(b.p.x-h.rim.x)<.6&&Math.abs(b.p.z-h.rim.z)<.6&&Math.abs(b.p.y-RIM_H+.2)<.7) near=true;
  if(!near&&N.quiet>90&&Math.abs(h.flexV)<.01) return; const sdt=dt/2, damp=chain?.985:.972, cf=Math.cos(h.flex), sf=Math.sin(h.flex); let move=0;
  for(let k=0;k<2;k++){
    for(let i=0;i<NR;i++){ const l=N.L[i], zl=(BOARD_FACE-RIM_Z)+(h.s<0?l.z:-l.z), xl=h.s<0?l.x:-l.x; const y2=-zl*sf, z2=zl*cf; N.P[i].set(h.s<0?xl:-xl,RIM_H+y2,N.pv.z+(h.s<0?z2:-z2)); }   // top loops ride the flexing rim
    for(let i=NR;i<N.P.length;i++){ const p=N.P[i],pp=N.PP[i]; _a.subVectors(p,pp).multiplyScalar(damp); move+=_a.lengthSq(); pp.copy(p); p.add(_a); p.y-=9.81*sdt*sdt; }
    for(let it=0;it<5;it++) for(const c of N.cons){ const a=N.P[c[0]],b=N.P[c[1]]; _a.subVectors(b,a); const d=_a.length(); if(d<=c[2]&&c[3]===1) continue; const f=(d-c[2])/d*c[3];
      if(c[0]<NR) b.addScaledVector(_a,-f); else { a.addScaledVector(_a,f*.5); b.addScaledVector(_a,-f*.5); } }
    if(near) for(const b of balls){ if(b.off) continue; const R=BALL_R+.007; for(let i=NR;i<N.P.length;i++){ const p=N.P[i]; _a.subVectors(p,b.p); const d=_a.length(); if(d<R&&d>1e-5) p.addScaledVector(_a,(R-d)/d); } } }
  N.quiet=move<1e-7?N.quiet+1:0; const rad=chain?.0046:.003;
  N.cons.forEach((c,k)=>{ const a=N.P[c[0]],b=N.P[c[1]]; _d.subVectors(b,a); const len=_d.length()||1e-4; _q.setFromUnitVectors(UPV,_d.multiplyScalar(1/len)); _m4.compose(a,_q,_s.set(rad,len,rad)); N.mesh.setMatrixAt(k,_m4); });
  N.mesh.instanceMatrix.needsUpdate=true; }

/* ---------- fence that gives when hit ---------- */
function bulge(i,u,y,sp){ const f=fences[i]; f.u=u; f.v=y-FENCE_H/2; f.av=Math.min(5,f.av+sp*.5); f.live=true; }
function stepFences(dt){ for(const f of fences){ if(!f.live) continue; f.av+=(-260*f.amp-9*f.av)*dt; f.amp+=f.av*dt; const p=f.m.geometry.attributes.position, done=Math.abs(f.amp)<.002&&Math.abs(f.av)<.03;
    for(let i=0;i<p.count;i++){ const dx=p.getX(i)-f.u, dy=p.getY(i)-f.v; p.setZ(i,done?0:f.out*f.amp*Math.exp(-(dx*dx+dy*dy)/.9)*Math.cos(p.getY(i)/FENCE_H*Math.PI)); }
    p.needsUpdate=true; if(done){ f.live=false; f.amp=f.av=0; } } }

/* ---------- rain, puddle ripples, rim drips ---------- */
const RN=1600, rainU={uK:{value:0},uC:{value:new V3()},uT:U.time};
const rain=(()=>{ const pos=new Float32Array(RN*6), e=new Float32Array(RN*2); for(let i=0;i<RN;i++){ const x=rr(-12,12),y=rr(0,14),z=rr(-12,12); pos.set([x,y,z,x,y,z],i*6); e[i*2+1]=1; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('e',new THREE.BufferAttribute(e,1));
  const m=new THREE.LineSegments(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:rainU,
    vertexShader:`attribute float e;uniform float uT;uniform vec3 uC;varying float vA;void main(){vec3 p=position;float sp=9.+fract(p.x*7.3)*3.;p.y=mod(p.y-uT*sp,14.);p.xz=mod(p.xz-uC.xz+12.,24.)-12.;vec3 w=vec3(p.x+uC.x,p.y+e*.4,p.z+uC.z);w.x+=e*.06;vA=e;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
    fragmentShader:`uniform float uK;varying float vA;void main(){gl_FragColor=vec4(.75,.8,.9,(.08+.24*vA)*uK);}`})); m.frustumCulled=false; m.visible=false; env.add(m); noBake.push(m); return m; })();
const ripples=Array.from({length:26},()=>{ const m=new THREE.Mesh(new THREE.RingGeometry(.86,1,22).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xc8d4de,transparent:true,opacity:0,depthWrite:false})); m.userData.l=Math.random(); m.userData.dyn=true; m.position.y=.007; m.visible=false; env.add(m); return m; });
const drips=hoops.flatMap(h=>[0,1,2].map(k=>{ const m=new THREE.Mesh(new THREE.SphereGeometry(.007,6,5),new THREE.MeshBasicMaterial({color:0xcfe0ee})); const a=k*2.1+h.s; m.userData={dyn:true,x:h.rim.x+Math.cos(a)*RIM_R,z:h.rim.z+Math.sin(a)*RIM_R,vy:0,w:rr(0,3)}; m.position.set(m.userData.x,RIM_H,m.userData.z); m.visible=false; env.add(m); return m; }));
function stepWeatherFx(t,dt){ headPos(); rainU.uC.value.copy(_hp); const on=W.rain>0;
  for(const m of ripples){ m.visible=on; if(!on) continue; m.userData.l+=dt*1.6; if(m.userData.l>1){ m.userData.l=Math.random()*-.6/Math.max(.2,W.rain); m.position.x=THREE.MathUtils.clamp(_hp.x+rr2(-9,9),-FX,FX); m.position.z=THREE.MathUtils.clamp(_hp.z+rr2(-9,9),-FZ,FZ); }
    const l=Math.max(0,m.userData.l); m.scale.setScalar(.02+l*.2); m.material.opacity=l>0?(1-l)*.45:0; }
  for(const m of drips){ const u=m.userData; m.visible=W.wet>.5; if(!m.visible) continue; if(u.w>0){ u.w-=dt; m.position.y=RIM_H-.012; u.vy=0; continue; } u.vy+=9.81*dt; m.position.y-=u.vy*dt; if(m.position.y<0){ u.w=rr2(.6,4)/W.wet; } } }

/* ---------- bats by night, birds by day ---------- */
const flyers=Array.from({length:7},(_,i)=>{ const g=new THREE.Group(), wg=new THREE.BufferGeometry().setFromPoints([new V3(0,0,.05),new V3(.24,0,.07),new V3(.2,0,-.1),new V3(0,0,-.06)]); wg.setIndex([0,1,2,0,2,3]);
  const mat=new THREE.MeshBasicMaterial({color:0x06080a,side:THREE.DoubleSide}); const L=new THREE.Mesh(wg,mat), R=new THREE.Mesh(wg,mat); L.userData.dyn=R.userData.dyn=true; R.scale.x=-1; g.add(L,R); env.add(g);
  g.userData={L,R,cx:rr(-10,10),cz:rr(-14,14),rad:rr(9,26),h:rr(8,15),sp:rr(.35,.8)*(i%2?1:-1),ph:rr(0,6)}; return g; });
function stepFlyers(t){ const bat=W.night>.5; for(const g of flyers){ const u=g.userData, a=t*u.sp*(bat?1.5:1)+u.ph, wob=bat?Math.sin(t*3.1+u.ph)*1.6:0;
    g.position.set(u.cx+Math.cos(a)*(u.rad+wob),u.h+Math.sin(t*(bat?2.3:.5)+u.ph)*(bat?1.2:.5),u.cz+Math.sin(a)*(u.rad+wob)); g.rotation.y=-a+(u.sp>0?0:Math.PI);
    const fl=Math.sin(t*(bat?26:9)+u.ph)*.9; u.L.rotation.z=fl; u.R.rotation.z=-fl; g.scale.setScalar(bat?.8:1.5); } }

/* ---------- player body ---------- */
const body=new THREE.Group(); scene.add(body); noBake.push(body);
const bodyP=(()=>{ const jersey=new THREE.MeshStandardMaterial({color:0x1f5d57,roughness:.85}), shorts=new THREE.MeshStandardMaterial({color:0x14171a,roughness:.9}), skin=new THREE.MeshStandardMaterial({color:0xc6957a,roughness:.65}), shoe=new THREE.MeshStandardMaterial({color:0xe9e6df,roughness:.6});
  const cyl=(r,m)=>{ const g=new THREE.CylinderGeometry(r,r*.85,1,12); g.translate(0,.5,0); const o=shadowOn(new THREE.Mesh(g,m)); body.add(o); return o; };
  const torso=shadowOn(new THREE.Mesh(new THREE.CapsuleGeometry(.165,.32,6,14),jersey)); torso.scale.z=.72; body.add(torso);
  const hips=shadowOn(new THREE.Mesh(new THREE.CapsuleGeometry(.17,.14,6,14),shorts)); hips.scale.z=.75; body.add(hips);
  const legs=[cyl(.075,skin),cyl(.075,skin)], shoes=[0,1].map(()=>{ const g=new THREE.Group(), a=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.105,.075,.29),shoe)), b=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.108,.03,.3),new THREE.MeshStandardMaterial({color:0xb8332b,roughness:.7}))); a.position.set(0,.06,-.05); b.position.set(0,.015,-.05); g.add(a,b); body.add(g); return g; });
  const arms=[0,1].map(()=>({up:cyl(.05,jersey),fore:cyl(.042,skin)}));
  return {torso,hips,legs,shoes,arms}; })();
const player={x:0,z:0,top:1.6}; const _sh=new V3(),_el=new V3(),_hip=new V3(),_ft=new V3();
function arm(k,S,H){ const A=bodyP.arms[k], L1=.3, L2=.28; _d.subVectors(H,S); let d=_d.length(); if(d<1e-3){ A.up.visible=A.fore.visible=false; return; } A.up.visible=A.fore.visible=true; _d.multiplyScalar(1/d); d=Math.min(d,L1+L2-.005);
  const a=(L1*L1-L2*L2+d*d)/(2*d), hh=Math.sqrt(Math.max(L1*L1-a*a,0)); _e.set(0,-1,0).addScaledVector(_r,(k?1:-1)*.5).addScaledVector(_f,-.35); _e.addScaledVector(_d,-_e.dot(_d)).normalize();
  _el.copy(S).addScaledVector(_d,a).addScaledVector(_e,hh); seg(A.up,S,_el); seg(A.fore,_el,H); }
function stepBody(t,sp){ body.visible=mode!=='ar'; if(!body.visible) return; headPos(); camera.getWorldDirection(_f); _f.y=0; if(_f.lengthSq()<1e-4) _f.set(0,0,-1); _f.normalize(); _r.crossVectors(_f,UPV);
  const feetY=mode?yExtra:0, hipY=Math.max(feetY+.3,_hp.y-.8), shY=_hp.y-.25, cx=_hp.x-_f.x*.09, cz=_hp.z-_f.z*.09, yawA=Math.atan2(-_f.x,-_f.z);
  player.x=cx; player.z=cz; player.top=_hp.y-.1;
  bodyP.torso.position.set(cx,(shY+hipY)/2,cz); bodyP.torso.scale.y=Math.max(.3,(shY-hipY)/.62); bodyP.torso.rotation.y=yawA;
  bodyP.hips.position.set(cx,hipY-.04,cz); bodyP.hips.rotation.y=yawA;
  for(let k=0;k<2;k++){ const sd=k?1:-1, sw=Math.sin(stride/.74*Math.PI)*sd*.16*Math.min(1,sp/2.5);
    _hip.set(cx+_r.x*sd*.095,hipY-.08,cz+_r.z*sd*.095); _ft.set(cx+_r.x*sd*.11+_f.x*sw,Math.max(feetY,hipY-1.0)+.09,cz+_r.z*sd*.11+_f.z*sw); seg(bodyP.legs[k],_hip,_ft);
    bodyP.shoes[k].position.set(_ft.x,_ft.y-.09,_ft.z); bodyP.shoes[k].rotation.y=yawA;
    _sh.set(cx+_r.x*sd*.2,shY,cz+_r.z*sd*.2); const h=mode?hands.find(q=>q.src&&q.src.handedness===(k?'right':'left')):null;
    if(h) arm(k,_sh,h.isHand?h.jp[0]:h.pos); else bodyP.arms[k].up.visible=bodyP.arms[k].fore.visible=false; } }

/* ---------- the 60 second game (HOOP FEVER's rules on a full court) ---------- */
const GT=60, game={on:false,t:0,sec:-1,score:0,streak:0,best:0}; try{ game.best=+localStorage.getItem('ball-best')||0; }catch(e){}
function flash(m){ const f=$('flash'); f.textContent=m; f.style.opacity=1; clearTimeout(flash.t); flash.t=setTimeout(()=>f.style.opacity=0,1100); }
function gameLine(){ stats.line=game.on?Math.floor(game.t/60)+':'+String(Math.ceil(game.t)%60).padStart(2,'0')+(game.t<=20?'  DOUBLE':'')+(game.streak>=2?'  STREAK '+game.streak:''):(game.best?'BEST '+game.best:''); drawScore(); }
function startGame(){ game.on=true; game.t=GT; game.sec=-1; game.score=game.streak=0; stats.pts=stats.made=stats.shots=0; flash('60 SECONDS'); snd('rim',hoops[0].rim,3); gameLine(); drawBox(); }
function endGame(){ game.on=false; if(game.score>game.best){ game.best=game.score; try{ localStorage.setItem('ball-best',game.best); }catch(e){} } flash('TIME  '+game.score); for(const h of hoops) snd('board',h.rim,6); gameLine(); drawBox(); }
function stepGame(dt){ if(!game.on) return; game.t-=dt; if(game.t<=0){ game.t=0; endGame(); return; } const sc=Math.ceil(game.t); if(sc!==game.sec){ game.sec=sc; gameLine(); if(sc<=5) snd('step',hoops[0].rim,6); } }

/* ---------- physics ---------- */
const grip=()=>1-.42*W.wet;
function hit(b,n,pen,e,mu,kind,hp){ // sphere response with friction + spin transfer
  b.p.addScaledVector(n,pen); const vn=b.v.dot(n); if(vn>=0) return;
  const sp=-vn; e*=b.T.e/.9; e=sp<.22?0:Math.max(.6*e,e*(1-.009*sp)); mu*=b.T.mu/.7*grip();          // harder landings lose more; wet surfaces grip less
  _c.crossVectors(b.w,_a.copy(n).multiplyScalar(-BALL_R)).add(b.v);
  _t.copy(_c).addScaledVector(n,-_c.dot(n)); const vt=_t.length();
  const jn=-(1+e)*vn; b.v.addScaledVector(n,jn);
  if(vt>1e-4){ _t.multiplyScalar(1/vt); const jt=Math.min(.4*vt,mu*jn); b.v.addScaledVector(_t,-jt); _a.crossVectors(n,_t); b.w.addScaledVector(_a,jt*1.5/BALL_R); }
  if(hp) b.clean=false; if(kind==='bounce'&&b.live&&!b.scored){ b.live=false; if(game.on&&game.streak){ game.streak=0; gameLine(); } }
  if(sp>.3){ snd(kind==='rim'&&hp&&world.net==='chain'&&sp>1.5?'rimchain':kind,b.p,sp,b.T.pitch); if(sp>1){ const q=Math.min(.16,sp*.013); if(q>b.sq){ b.sq=q; b.sqN.copy(n); } }
    if(kind==='bounce'&&sp>2){ wetMark(b.p.x,0,b.p.z,.06+sp*.008); kickLeaves(b.p.x,b.p.z,.7,sp*.18); }
    if(hp){ if(kind==='rim'){ hp.flexV+=sp*Math.max(0,n.y)*.35; hp.shake=Math.min(1.5,hp.shake+sp*.08); } else { hp.shake=Math.min(1.5,hp.shake+sp*.25); if(sp>2) wetMark(b.p.x,b.p.y,hp.s*BOARD_FACE,.05+sp*.007,hp.s); } hp.netS.quiet=0; } } }
function step(b,dt){
  if(b.off||b.holder||b.hover>0||b.rest) return;
  b.v.y-=9.81*dt; const sp=b.v.length();
  b.v.multiplyScalar(1-.022*sp*dt);
  _a.crossVectors(b.w,b.v).multiplyScalar(.0035*dt); b.v.add(_a);
  b.w.multiplyScalar(1-.12*dt);
  b.prevY=b.p.y; b.pp.copy(b.p); b.p.addScaledVector(b.v,dt);
  if(b.p.y<BALL_R){ hit(b,_n.set(0,1,0),BALL_R-b.p.y,.9,.7,'bounce');
    if(Math.abs(b.v.y)<.25){ const hs=Math.hypot(b.v.x,b.v.z);
      if(hs<.04&&b.w.lengthSq()<.2){ b.v.set(0,0,0); b.w.set(0,0,0); }
      else if(hs>0){ const k=Math.max(0,hs-.3*dt)/hs; b.v.x*=k; b.v.z*=k; b.w.y*=1-3*dt; b.w.x+=(b.v.z/BALL_R-b.w.x)*Math.min(1,8*dt); b.w.z+=(-b.v.x/BALL_R-b.w.z)*Math.min(1,8*dt); } } }
  for(const o of boxes){ if(o.h&&!o.h.active) continue; if(mode==='ar'&&!o.h) continue; _c.copy(b.p).clamp(o.min,o.max); _n.subVectors(b.p,_c); const d=_n.length(); if(d<BALL_R&&d>1e-6){ _n.multiplyScalar(1/d); hit(b,_n,BALL_R-d,o.e,.5,o.snd,o.h); } }
  if(mode!=='ar'){ for(const c of cyls){ if(b.p.y>c.h+BALL_R) continue; const dx=b.p.x-c.x,dz=b.p.z-c.z,d=Math.hypot(dx,dz); if(d<c.r+BALL_R&&d>1e-6) hit(b,_n.set(dx/d,0,dz/d),c.r+BALL_R-d,.5,.4,'rim'); }
    if(b.cool<.3&&b.p.y<player.top+BALL_R){ const dx=b.p.x-player.x,dz=b.p.z-player.z,d=Math.hypot(dx,dz); if(d<.2+BALL_R&&d>1e-6) hit(b,_n.set(dx/d,0,dz/d),.2+BALL_R-d,.35,.6,'catch'); } }   // your own body
  for(const h of hoops){ if(!h.active) continue; const dx=b.p.x-h.rim.x,dz=b.p.z-h.rim.z,dh=Math.hypot(dx,dz),dy=b.p.y-RIM_H;
    if(Math.abs(dy)<BALL_R+RIM_TUBE+.01&&dh>1e-5){ const k=(RIM_R+RIM_TUBE)/dh; _n.set(dx-dx*k,dy,dz-dz*k); const d=_n.length();
      if(d<BALL_R+RIM_TUBE&&d>1e-6){ _n.multiplyScalar(1/d); hit(b,_n,BALL_R+RIM_TUBE-d,.56*(1-Math.min(.3,Math.abs(h.flexV)*.2)),.4,'rim',h); } }
    if(dh<RIM_R&&dy<0&&dy>-.45){ const k=1-(world.net==='chain'?8:5)*dt; b.v.x*=k; b.v.z*=k; b.v.y*=1-(world.net==='chain'?2.6:1.6)*dt; h.netS.quiet=0; }
    if(b.prevY>=RIM_H&&b.p.y<RIM_H&&dh<RIM_R-.02&&b.v.y<0&&!b.scored&&b.live){ b.scored=true; score(h,b,false); } }
  if(mode!=='ar'&&venue==='gym'){ const lx=FX-BALL_R, lz=FZ-BALL_R; if(b.p.x>lx) hit(b,_n.set(-1,0,0),b.p.x-lx,.7,.5,'bounce'); if(b.p.x<-lx) hit(b,_n.set(1,0,0),-lx-b.p.x,.7,.5,'bounce'); if(b.p.z>lz) hit(b,_n.set(0,0,-1),b.p.z-lz,.6,.5,'bounce'); if(b.p.z<-lz) hit(b,_n.set(0,0,1),-lz-b.p.z,.6,.5,'bounce'); if(b.p.y>CEIL-BALL_R) hit(b,_n.set(0,-1,0),b.p.y-CEIL+BALL_R,.6,.5,'bounce'); }
  else if(mode!=='ar'&&b.p.y<FENCE_H+BALL_R){ const lx=FX-BALL_R-.02, lz=FZ-BALL_R-.02;
    if(Math.abs(b.p.x)<FX+.3&&Math.abs(b.p.z)<FZ+.3){ const s0=b.v.length();
      if(b.p.x>lx){ bulge(3,-b.p.z,b.p.y,Math.max(0,b.v.x)); hit(b,_n.set(-1,0,0),b.p.x-lx,.3,.6,'fence'); } if(b.p.x<-lx){ bulge(2,-b.p.z,b.p.y,Math.max(0,-b.v.x)); hit(b,_n.set(1,0,0),-lx-b.p.x,.3,.6,'fence'); }
      if(b.p.z>lz){ bulge(1,b.p.x,b.p.y,Math.max(0,b.v.z)); hit(b,_n.set(0,0,-1),b.p.z-lz,.3,.6,'fence'); } if(b.p.z<-lz){ bulge(0,b.p.x,b.p.y,Math.max(0,-b.v.z)); hit(b,_n.set(0,0,1),-lz-b.p.z,.3,.6,'fence'); } } }
}
function pairs(){ for(let i=0;i<balls.length;i++){ const a=balls[i]; if(a.off) continue; for(let j=i+1;j<balls.length;j++){ const b=balls[j]; if(b.off) continue;
    const af=!a.holder&&a.hover<=0&&!a.rest, bf=!b.holder&&b.hover<=0&&!b.rest; if(!af&&!bf) continue;
    _n.subVectors(b.p,a.p); const d=_n.length(); if(d>=2*BALL_R||d<1e-6) continue; _n.multiplyScalar(1/d); const pen=2*BALL_R-d, vn=_a.subVectors(b.v,a.v).dot(_n);
    if(af&&bf){ a.p.addScaledVector(_n,-pen/2); b.p.addScaledVector(_n,pen/2); if(vn<0){ const k=-.9*vn; a.v.addScaledVector(_n,-k); b.v.addScaledVector(_n,k); snd('bounce',a.p,-vn*.8,1.35); } }
    else { const m=af?a:b, o=af?b:a, sg=af?-1:1; m.p.addScaledVector(_n,sg*pen); if(sg*vn<0){ const vr=sg*vn; m.v.addScaledVector(_n,-1.8*vr*sg); snd('bounce',m.p,-vr*.8,1.35);
        if(o.rest&&vr<-1){ o.rest=false; o.v.copy(_n).multiplyScalar(vr*.5*sg); } } } } } }
function score(h,b,dunk){ const d=Math.hypot(b.from.x-h.rim.x,b.from.z-h.rim.z), three=!dunk&&(d>7.239||(Math.abs(b.from.x)>6.706&&Math.abs(b.from.z)>RIM_Z-.2)), swish=!dunk&&b.clean;
  let pts=three?3:2; if(game.on){ game.streak++; if(game.streak>=3) pts++; if(game.t<=20) pts*=2; game.score+=pts; }
  stats.pts+=pts; stats.made++; if(dunk) stats.shots++; if(game.on) gameLine(); else drawScore(); snd(world.net==='chain'?'chain':'swish',h.rim,7); h.netS.quiet=0;
  flash((dunk?'DUNK  ':swish?'SWISH  ':three?'THREE  ':'')+'+'+pts); hands.forEach(q=>buzz(q,.9,120)); }
function launched(b){ b.scored=false; b.live=true; b.clean=true; b.from.copy(headPos()); b.cool=.7; cur=b; if(b.v.length()>3.2&&b.v.y>.5){ stats.shots++; drawScore(); } }

/* ---------- XR hands: controllers or tracked hands ---------- */
const FING=['thumb','index-finger','middle-finger','ring-finger','pinky-finger'], JN=['wrist'], BONES=[];
FING.forEach((f,k)=>{ let prev=0; for(const sg of (k?['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip']:['metacarpal','phalanx-proximal','phalanx-distal','tip'])){ JN.push(f+'-'+sg); BONES.push([prev,JN.length-1]); prev=JN.length-1; } });
const TIPS=FING.map(f=>JN.indexOf(f+'-tip')), KN=FING.slice(1).map(f=>JN.indexOf(f+'-phalanx-proximal')), MIDK=KN[1];
for(let k=0;k<3;k++) BONES.push([KN[k],KN[k+1]]);
const skinM=new THREE.MeshStandardMaterial({color:0xc6957a,roughness:.6}), nailM=new THREE.MeshStandardMaterial({color:0xe6c4b6,roughness:.25});
const boneG=new THREE.CylinderGeometry(1,1,1,10,1,true); boneG.translate(0,.5,0); const nailG=new THREE.SphereGeometry(1,10,6);
const hands=[0,1].map(i=>{ const ctrl=renderer.xr.getController(i), grip=renderer.xr.getControllerGrip(i), handObj=renderer.xr.getHand(i); rig.add(ctrl,grip,handObj);
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(.05,20,14),new THREE.MeshStandardMaterial({color:0x22252a,roughness:.6})); proxy.scale.set(.75,.45,1.1); proxy.castShadow=true; grip.add(proxy);
  const ray=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(0,0,-.05),new V3(0,0,-2.5)]),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.25})); ctrl.add(ray);
  const sph=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),skinM,JN.length), cyl=new THREE.InstancedMesh(boneG,skinM,BONES.length), skin=new THREE.Group();
  sph.frustumCulled=cyl.frustumCulled=false; sph.castShadow=cyl.castShadow=true; skin.add(sph,cyl); skin.visible=false; scene.add(skin); noBake.push(skin);
  const h={ctrl,grip,handObj,proxy,ray,skin,sph,cyl,src:null,hist:[],pressed:false,a:false,turned:false,pos:new V3(),vel:new V3(),angVel:new V3(),qPrev:new THREE.Quaternion(),
    jp:JN.map(()=>new V3()),jprev:JN.map(()=>new V3()),tv:TIPS.map(()=>new V3()),jr:new Float32Array(JN.length).fill(.009),isHand:false,wasHand:false,pinch:1,tpArm:0,anchor:grip,local:new V3(0,-.03,-.11),
    ball:null,hang:null,hangP:new V3(),model:null,modelOK:false,nails:false,boxT:0,cHand:null,fp:new V3(),fd:new V3(),fon:false};
  ctrl.addEventListener('connected',e=>{ h.src=e.data; if(!e.data.hand&&!h.cHand&&e.data.handedness!=='none'){ const R=e.data.handedness==='right'; h.cHand=new Hand(R?'R':'L'); h.cHand.root.rotation.z=R?-1.35:1.35; h.cHand.root.position.set(0,-.015,.09); grip.add(h.cHand.root); } }); ctrl.addEventListener('disconnected',()=>{h.src=null; h.skin.visible=false; if(h.ball) drop(h); h.hang=null; if(tp.h===h) tpEnd();}); return h; });
{ const f=new XRHandModelFactory(); f.setPath('cantina-assets/hand/'); for(const h of hands){ h.model=f.createHandModel(h.handObj,'mesh'); h.handObj.add(h.model); } }
function readHand(h,dt){ const J=h.handObj.joints; if(!h.src||!h.src.hand||!J||!J.wrist||!J.wrist.visible) return false;
  for(let k=0;k<JN.length;k++){ const j=J[JN[k]]; h.jprev[k].copy(h.jp[k]); if(j){ j.getWorldPosition(h.jp[k]); if(j.jointRadius) h.jr[k]=j.jointRadius; } }
  if(!h.wasHand) for(let k=0;k<JN.length;k++) h.jprev[k].copy(h.jp[k]);
  TIPS.forEach((k,i)=>{ _a.subVectors(h.jp[k],h.jprev[k]).multiplyScalar(1/dt); if(_a.lengthSq()>64) _a.setLength(8); h.tv[i].lerp(_a,.5); });
  if(!h.nails&&J[JN[TIPS[1]]]){ h.nails=true; for(const k of TIPS){ const n=new THREE.Mesh(nailG,nailM); n.scale.set(.0062,.0016,.0075); n.position.set(0,.0052,.009); J[JN[k]].add(n); } }
  if(h.model&&!h.modelOK){ h.model.traverse(o=>{ if(o.isSkinnedMesh){ h.modelOK=true; o.material=skinM; o.castShadow=true; o.frustumCulled=false; } }); }
  if(h.modelOK) return true;
  for(let k=0;k<JN.length;k++){ _m4.compose(h.jp[k],_q2.identity(),_s.setScalar(h.jr[k])); h.sph.setMatrixAt(k,_m4); }
  for(let k=0;k<BONES.length;k++){ const a=BONES[k][0],b=BONES[k][1]; _d.subVectors(h.jp[b],h.jp[a]); const len=_d.length()||1e-4; _q2.setFromUnitVectors(UPV,_d.multiplyScalar(1/len));
    const r=(h.jr[a]+h.jr[b])*.5; _m4.compose(h.jp[a],_q2,_s.set(r,len,r)); h.cyl.setMatrixAt(k,_m4); }
  h.sph.instanceMatrix.needsUpdate=h.cyl.instanceMatrix.needsUpdate=true; return true; }
function buzz(h,s=.5,ms=40){ if(!h) return; try{ h.src?.gamepad?.hapticActuators?.[0]?.pulse(s,ms); }catch(e){} }
function holdPoint(h,out){ if(h.isHand) return out.copy(h.pos); out.set(0,-.03,-.11); return h.grip.localToWorld(out); }
function setHold(h,b,near){ // where the ball sits relative to the hand while held
  if(h.isHand){ h.anchor=h.handObj.joints.wrist;
    if(near){ _a.subVectors(b.p,h.pos); const d=_a.length()||1; _a.multiplyScalar(Math.min(d,BALL_R+.045)/d).add(h.pos); }
    else { headPos(); _a.subVectors(h.pos,_hp).normalize().multiplyScalar(BALL_R+.03).add(h.pos); }
    h.anchor.updateWorldMatrix(true,false); h.local.copy(_a); h.anchor.worldToLocal(h.local); }
  else { h.anchor=h.grip; h.local.set(0,-.03,-.11); } }
function take(b,h,near){ if(b.holder==='cam') camB=null; b.holder=h; b.holder2=null; h.ball=b; b.pull=!near; b.hover=0; b.rest=false; b.live=false; b.dunk=false; cur=b; setHold(h,b,near);
  if(near){ buzz(h); snd('catch',b.p,3+b.v.length(),b.T.pitch); } }
function tryGrab(h){ if(h.ball) return;
  if(mode==='vr') for(const hp of hoops){ if(!hp.active) continue; const dh=Math.hypot(h.pos.x-hp.rim.x,h.pos.z-hp.rim.z); if(Math.hypot(dh-RIM_R,h.pos.y-RIM_H)<.13){ h.hang=hp; h.hangP.copy(h.pos); fallV=0; buzz(h,.8,60); snd('rim',hp.rim,2.5); return; } }  // grab the rim and hang
  let best=null,bd=.4; for(const b of balls){ if(b.off) continue; const d=b.p.distanceTo(h.pos); if(d<bd){ bd=d; best=b; } }
  if(best){ if(best.holder&&best.holder!=='cam'&&best.holder!==h&&!best.holder2){ best.holder2=h; h.ball=best; buzz(h); snd('catch',best.p,3,best.T.pitch); return; }   // second hand joins: two-handed hold
    if(!best.holder||best.holder==='cam') take(best,h,true); return; }
  h.ctrl.getWorldPosition(_a); h.ctrl.getWorldDirection(_b).negate(); let bdot=Math.cos(.21); best=null;
  for(const b of balls){ if(b.off||b.holder) continue; _c.subVectors(b.p,_a); const dist=_c.length(); if(dist>40) continue; const dt=_c.multiplyScalar(1/dist).dot(_b); if(dt>bdot){ bdot=dt; best=b; } }
  if(best) take(best,h,false); }
function throwVel(h,out){ const H=h.hist, now=H[H.length-1]; let old=now; for(let i=H.length-1;i>=0;i--){ old=H[i]; if(now.t-H[i].t>.07) break; }
  out.subVectors(now.p,old.p).multiplyScalar(1.22/Math.max(now.t-old.t,1/120)); if(out.length()>16) out.setLength(16); return out; }
function drop(h){ const b=h.ball; h.ball=null; if(!b) return; if(b.holder2===h){ b.holder2=null; return; } if(b.holder===h){ if(b.holder2){ b.holder=b.holder2; b.holder2=null; setHold(b.holder,b,true); } else { b.holder=null; b.v.set(0,0,0); } } }
function release(h,t){ const b=h.ball; if(!b) return; h.ball=null;
  if(b.holder2===h){ b.holder2=null; setHold(b.holder,b,true); b.twoT=t; throwVel(h,b.twoV); return; }
  if(b.holder2){ const o=b.holder2; b.holder=o; b.holder2=null; setHold(o,b,true); b.twoT=t; throwVel(h,b.twoV); return; }   // other hand carries on; remember this hand's push
  b.holder=null; if(b.pull){ b.pull=false; b.v.set(0,0,0); return; }
  throwVel(h,b.v); if(t-b.twoT<.14) b.v.add(b.twoV).multiplyScalar(.5);                                                      // two-handed shot: both hands contribute
  _a.set(b.v.x,0,b.v.z); const hs=_a.length(); if(hs>.3){ _a.multiplyScalar(1/hs); b.w.crossVectors(_a,UPV).multiplyScalar(Math.min(b.v.length(),8)*1.1); } else b.w.set(0,0,0);
  if(h.isHand){ _c.set(0,0,0); _e.set(0,0,0); TIPS.forEach((k,i)=>{ if(i){ _c.add(h.jp[k]); _e.add(h.tv[i]); } }); _c.multiplyScalar(.25).sub(b.p); _e.multiplyScalar(.25).sub(h.vel);
    _a.crossVectors(_c,_e).multiplyScalar(1/Math.max(_c.lengthSq(),.006)); if(_a.length()>45) _a.setLength(45); b.w.add(_a); }                                               // spin rolled off the fingertips
  else b.w.addScaledVector(h.angVel,.9);                                                                                     // wrist snap on a controller
  buzz(h,.3,25); launched(b); }
function freeBall(){ return balls.find(b=>!b.off&&!b.holder&&b.ti===world.pref)||(cur&&!cur.holder&&!cur.off?cur:null)||balls.find(b=>!b.off&&!b.holder); }
function summon(h){ const b=freeBall(); if(!b) return; b.pull=false; b.v.set(0,0,0); b.w.set(0,0,0); b.live=false; b.rest=false; cur=b;
  if(h){ h.ctrl.getWorldDirection(_b).negate(); b.p.copy(h.pos).addScaledVector(_b,.3); b.hover=4; }
  else if(mode){ camera.getWorldDirection(_b); _b.y=0; _b.normalize(); b.p.copy(headPos()).addScaledVector(_b,.55); b.p.y=Math.max(.9,b.p.y-.45); b.hover=6; }
  else if(!camB){ b.holder='cam'; camB=b; } }
function touch(h,p,v,r){ for(const b of balls){ if(b.off||b.holder||b.hover>0||b.cool>=.4) continue; _n.subVectors(b.p,p); const d=_n.length(), R=BALL_R+r; if(d>=R||d<1e-5) continue; _n.multiplyScalar(1/d);
    if(v.lengthSq()>49) v.setLength(7); const vn=_a.subVectors(b.v,v).dot(_n); b.p.addScaledVector(_n,R-d); b.rest=false;
    if(vn<0){ b.v.addScaledVector(_n,-1.35*vn); _t.copy(_a).addScaledVector(_n,-vn); b.v.addScaledVector(_t,-.25); b.w.addScaledVector(_c.crossVectors(_n,_t),.25/BALL_R); snd('catch',b.p,-vn*1.4,b.T.pitch); buzz(h,Math.min(1,-vn*.2),30); } } }

/* ---------- teleport ---------- */
const tpMat=new THREE.LineBasicMaterial({color:0x6fe3ff,transparent:true,opacity:.85,fog:false});
const tp={h:null,valid:false,pt:new V3(),line:new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(32*3),3)),tpMat),
  ring:new THREE.Mesh(new THREE.RingGeometry(.26,.34,36).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x6fe3ff,transparent:true,opacity:.9,fog:false,depthWrite:false}))};
tp.line.frustumCulled=false; tp.line.visible=tp.ring.visible=false; scene.add(tp.line,tp.ring);
function tpAim(h){ h.ctrl.getWorldPosition(_a); h.ctrl.getWorldDirection(_b).negate().multiplyScalar(7.5); const p=tp.line.geometry.attributes.position; let hitG=false;
  for(let i=0;i<32;i++){ if(!hitG){ const py=_a.y; _a.addScaledVector(_b,.045); _b.y-=9.81*.045; if(_a.y<=0){ const k=py/(py-_a.y); _a.addScaledVector(_b,-.045*(1-k)); _a.y=0; hitG=true; tp.pt.copy(_a); } } p.setXYZ(i,_a.x,_a.y+.02,_a.z); }
  headPos(); tp.valid=hitG&&(mode==='ar'?Math.hypot(tp.pt.x-_hp.x,tp.pt.z-_hp.z)<8:(Math.abs(tp.pt.x-BND.cx)<BND.x&&Math.abs(tp.pt.z-BND.cz)<BND.z));
  p.needsUpdate=true; tp.line.visible=true; tpMat.opacity=tp.valid?.85:.25; tp.ring.visible=tp.valid; tp.ring.position.set(tp.pt.x,.025,tp.pt.z); }
function tpEnd(){ tp.h=null; tp.line.visible=tp.ring.visible=false; }
function tpGo(){ if(tp.valid){ headPos(); rig.position.x+=tp.pt.x-_hp.x; rig.position.z+=tp.pt.z-_hp.z; vel.set(0,0,0); yExtra=0; rig.updateMatrixWorld(true); snd('step',tp.pt,4); } tp.valid=false; tpEnd(); }

/* ---------- time of day and weather ---------- */
const NIGHT={zen:[.004,.009,.026],fg:[.0045,.0085,.012],sI:0,sC:[1,.9,.8],mI:.5,hS:[.027,.045,.09],hG:[.004,.006,.004],hI:.9,st:1,ex:1.1,de:.017,cc:[.008,.013,.018]},
  DAY={zen:[.10,.27,.66],fg:[.42,.56,.72],sI:8.5,sC:[1,.93,.84],mI:0,hS:[.5,.66,1],hG:[.24,.28,.17],hI:1.7,st:0,ex:.95,de:.006,cc:[.95,.95,.95]};
const TK=[{h:0,...NIGHT},{h:5,...NIGHT},{h:6.3,zen:[.07,.12,.30],fg:[.30,.22,.20],sI:3.2,sC:[1,.55,.3],mI:.1,hS:[.5,.45,.5],hG:[.16,.15,.11],hI:1.0,st:0,ex:1,de:.012,cc:[.8,.5,.4]},{h:9,...DAY},{h:16.5,...DAY},
  {h:18.8,zen:[.08,.10,.30],fg:[.36,.20,.15],sI:3.2,sC:[1,.45,.2],mI:.1,hS:[.5,.4,.5],hG:[.15,.12,.1],hI:.95,st:.05,ex:1,de:.011,cc:[.9,.45,.3]},{h:20.3,...NIGHT},{h:24,...NIGHT}];
const WXP={clear:{fog:.45,wet:.15,rain:0,wind:.35,cloud:.3},mist:{fog:1.35,wet:.55,rain:0,wind:.45,cloud:.75},drizzle:{fog:1,wet:.85,rain:.4,wind:.75,cloud:.95},storm:{fog:1.15,wet:1,rain:1,wind:1.7,cloud:1}};
const fogBase=new THREE.Color(), bodyDir=skyU.bodyDir.value; let bakeAt=.01, nextBolt=8;
function sampleTK(hr){ let i=0; while(i<TK.length-2&&TK[i+1].h<=hr) i++; const a=TK[i],b=TK[i+1],f=THREE.MathUtils.clamp((hr-a.h)/(b.h-a.h),0,1), o={};
  for(const k in a){ o[k]=Array.isArray(a[k])?a[k].map((v,j)=>v+(b[k][j]-v)*f):a[k]+(b[k]-a[k])*f; } return o; }
function labels(){ const g=venue==='gym'; $('bWx').textContent=g?'Weather: indoors':'Weather: '+world.wx; $('bWx').disabled=g; $('bCourt').textContent='Court: '+(g?'indoor':'jungle'); $('bNet').textContent='Net: '+world.net; $('bBall').textContent='Get ball: '+BT[world.pref].name; $('bGame').textContent=game.on?'Stop the game':'60 second game'; $('todV').textContent=hh(world.hour); }
function applyWorld(){ env.visible=venue==='clearing'&&mode!=='ar'; if(GYM) GYM.g.visible=venue==='gym'&&mode!=='ar';
  if(mode==='ar'){ scene.fog=null; sun.position.copy(sunDir).multiplyScalar(70).add(rig.position); sun.target.position.copy(rig.position); sun.color.set(0xfff0dc); sun.intensity=3.3; sun.visible=sun.castShadow=true; arHemi.visible=true; U.lampK.value=0; renderer.toneMappingExposure=1; rain.visible=false; W.rain=0; W.wet=0; if(typeof setRain==='function') setRain(0); catcher.position.set(rig.position.x,.002,rig.position.z-2); drawBox(); return; }
  if(venue==='gym'&&GYM){ const dayK=THREE.MathUtils.clamp(Math.sin((world.hour-6)/12*Math.PI)*3+.15,0,1); scene.fog=null; sun.position.set(4,30,6); sun.target.position.set(0,0,0); sun.color.set(0xfff3e0); sun.intensity=1.5; sun.visible=sun.castShadow=true; arHemi.visible=false;
    GYM.win.color.setRGB(.05+.75*dayK,.07+.85*dayK,.12+.9*dayK); GYM.hemi.intensity=1.15+.3*dayK; W.lampOn=false; W.night=0; W.wet=0; W.rain=0; U.lampK.value=0; U.wind.value=0; renderer.toneMappingExposure=1; rain.visible=false; if(typeof setRain==='function') setRain(0);
    for(const b of balls) b.mesh.material.roughness=Math.min(1,b.T.rough+.12); setShadows(); bakeAt=last+.3; drawBox(); labels(); return; }
  const ar=mode==='ar', k=sampleTK(world.hour), P=WXP[world.wx], a=(world.hour-6)/12*Math.PI, up=Math.sin(a), day=up>.03, dull=1-.5*P.cloud*(1-k.st);
  skyU.zenC.value.setRGB(k.zen[0]*dull,k.zen[1]*dull,k.zen[2]*dull); fogBase.setRGB(k.fg[0]*dull,k.fg[1]*dull,k.fg[2]*dull); FOGC.copy(fogBase); fog.density=k.de*P.fog; scene.fog=ar?null:fog;
  if(day){ bodyDir.set(Math.cos(a)*.75,up,.45).normalize(); skyU.bodyC.value.setRGB(k.sC[0]*5,k.sC[1]*5,k.sC[2]*5); skyU.discA.value=.99996; skyU.haloK.value=.16*(1-.6*P.cloud); }
  else { bodyDir.copy(moonDir); skyU.bodyC.value.setRGB(.92,.95,1); skyU.discA.value=.99993; skyU.haloK.value=.45*(1-.7*P.cloud); }
  skyU.starK.value=k.st*(1-P.cloud*.7); skyU.cloudK.value=P.cloud; const cd=world.wx==='storm'?.4:world.wx==='drizzle'?.65:1; skyU.cloudC.value.setRGB(k.cc[0]*cd,k.cc[1]*cd,k.cc[2]*cd);
  if(ar){ sun.position.copy(sunDir).multiplyScalar(70); sun.color.set(0xfff0dc); sun.intensity=3.3; sun.visible=true; }
  else { sun.position.copy(bodyDir).multiplyScalar(70); sun.color.setRGB(k.sC[0],k.sC[1],k.sC[2]); sun.intensity=k.sI*(1-.65*P.cloud); sun.visible=day&&sun.intensity>.03; }
  sun.castShadow=sun.visible; arHemi.visible=ar; moon.intensity=k.mI*(1-.5*P.cloud); hemi.color.setRGB(k.hS[0],k.hS[1],k.hS[2]); hemi.groundColor.setRGB(k.hG[0],k.hG[1],k.hG[2]); hemi.intensity=k.hI;
  W.lampOn=!ar&&(world.hour<6.6||world.hour>18.4); lamps.forEach(l=>l.visible=W.lampOn); glows.forEach(g=>g.visible=W.lampOn); W.lens.color.set(W.lampOn?0xfff6e0:0x4a4f52);
  U.lampK.value=W.lampOn&&qLevel<3?.7*fog.density:0; W.night=k.st; W.wet=P.wet; W.rain=P.rain; U.wind.value=P.wind; renderer.toneMappingExposure=k.ex;
  courtMat.envMapIntensity=.15+.4*P.wet; rain.visible=P.rain>0; rainU.uK.value=P.rain>0?.5+.5*P.rain:0; rain.geometry.setDrawRange(0,Math.round(RN*(P.rain>.5?1:.4)*(qLevel>=2?.5:1))*2);
  for(const b of balls) b.mesh.material.roughness=Math.min(1,b.T.rough+.12-.15*P.wet);
  if(typeof setRain==='function') setRain(P.rain); setShadows(); if(!ar) bakeAt=last+.3; drawBox(); labels(); }
const hh=h=>String(Math.floor(h)%24).padStart(2,'0')+':'+String(Math.round(h%1*60)).padStart(2,'0');
// reflections: bake the lit court and jungle into the environment map so puddles mirror the lamps
const cubeRT=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType}), cubeCam=new THREE.CubeCamera(.3,400,cubeRT), pmrem=new THREE.PMREMGenerator(renderer); let envRT=null; cubeCam.position.set(0,1.7,0); scene.add(cubeCam);
function bakeEnv(){ const hid=noBake.filter(o=>o.visible); hid.forEach(o=>o.visible=false); const tm=renderer.toneMapping; renderer.toneMapping=THREE.NoToneMapping;
  cubeCam.update(renderer,scene); renderer.toneMapping=tm; hid.forEach(o=>o.visible=true);
  const rt=pmrem.fromCubemap(cubeRT.texture); scene.environment=rt.texture; if(envRT) envRT.dispose(); envRT=rt; }
function stepSky(t,dt){ if(world.wx==='storm'&&mode!=='ar'){ if(t>nextBolt){ nextBolt=t+rr2(5,16); W.flash=1; const a=rr2(0,6.28); bolt.position.set(Math.cos(a)*40,35,Math.sin(a)*40);
      const far=rr2(.4,3); setTimeout(()=>snd('thunder',_a.set(Math.cos(a)*30,10,Math.sin(a)*30),8/far),far*1000); setTimeout(()=>{ W.flash=Math.max(W.flash,.7); },110); } }
  if(W.flash>.002){ W.flash*=Math.exp(-7*dt); skyU.flash.value=W.flash; bolt.intensity=W.flash*4; FOGC.copy(fogBase).addScalar(W.flash*.1); } else if(bolt.intensity){ bolt.intensity=0; skyU.flash.value=0; FOGC.copy(fogBase); }
  if(W.rain>.5&&Math.random()<dt*.4) kickLeaves(rr2(-FX,FX),rr2(-FZ,FZ),2.5,.5,rr2(-2,2),rr2(-2,2)); }

/* ---------- court-side control box (touch it in VR) ---------- */
const boxC=cv(512,512), boxT=tex(boxC), BOXZ=3.7, BOXY=1.75;
{ const m=shadowOn(new THREE.Mesh(new THREE.BoxGeometry(.05,.8,.8),[blackSteel,new THREE.MeshStandardMaterial({map:boxT,emissive:0xffffff,emissiveMap:boxT,emissiveIntensity:.5,roughness:.5}),blackSteel,blackSteel,blackSteel,blackSteel])); m.position.set(FX-.1,BOXY-.4,BOXZ); env.add(m); }
const TODS=[22,6.2,12,19.2];
function drawBox(){ const x=boxC.getContext('2d'); x.fillStyle='#0b0e10'; x.fillRect(0,0,512,512); x.textAlign='center';
  const ar=mode==='ar', gy=venue==='gym'; [['WEATHER',ar||gy?'—':world.wx],['TIME',ar?'—':hh(world.hour)],['NET',world.net],['GET BALL',BT[world.pref].name],['60 SECOND GAME',game.on?'stop':'start'],['COURT',ar?'—':gy?'indoor':'jungle']].forEach(([a,b],i)=>{ x.fillStyle='#1b2a2e'; x.fillRect(14,i*84+8,484,72); x.fillStyle='#8fa3a8'; x.font='700 19px Arial'; x.fillText(a,256,i*84+32); x.fillStyle='#ffb629'; x.font='700 34px Arial'; x.fillText(String(b).toUpperCase(),256,i*84+68); }); boxT.needsUpdate=true; }
function setCourt(v){ if(mode==='ar') return; world.court=v==='gym'?'gym':'jungle'; venue=v==='gym'?'gym':'clearing'; if(venue==='gym'&&!GYM){ K.gymMap=tex(courtTexture(true)); GYM=makeGym(K); GYM.g.traverse(o=>{ const m=o.material; if(Array.isArray(m)) m.forEach(patchMat); else patchMat(m); }); }
  try{ localStorage.setItem('ball-court',world.court); }catch(e){} setAmb(); applyWorld(); flash(venue==='gym'?'INDOOR COURT':'JUNGLE COURT'); }
function boxAct(i){ if(i===5) setCourt(world.court==='gym'?'jungle':'gym'); if(i===0&&venue!=='gym') world.wx=Object.keys(WXP)[(Object.keys(WXP).indexOf(world.wx)+1)%4]; if(i===1){ const k=TODS.findIndex(v=>Math.abs(v-world.hour)<.3); world.hour=TODS[(k+1)%4]; $('tod').value=world.hour; }
  if(i===2){ world.net=world.net==='nylon'?'chain':'nylon'; for(const h of hoops){ h.netS.mesh.material=netMats[world.net]; h.netS.quiet=0; } } if(i===3) world.pref=(world.pref+1)%BT.length; if(i===4){ if(game.on) endGame(); else startGame(); } snd('catch',menu.visible?menu.position:_a.set(FX-.1,1.4,BOXZ),4); applyWorld(); }
function boxTouch(h,p,t){ if(t<h.boxT||p.x<FX-.24||Math.abs(p.z-BOXZ)>.38) return; const i=Math.floor((BOXY-p.y)/(.8/6)); if(i<0||i>5) return; h.boxT=t+.8; buzz(h,.7,40); boxAct(i); }

/* ---------- the headset's menu: click a stick (or touch the tab on your left wrist) and the board comes up in front of you; point and pull the trigger, or poke a row ---------- */
const menu=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),new THREE.MeshBasicMaterial({map:boxT,fog:false,toneMapped:false})); menu.visible=false; menu.userData.dyn=true; scene.add(menu); noBake.push(menu);
const menuHi=new THREE.Mesh(new THREE.PlaneGeometry(.48,.5/6-.008),new THREE.MeshBasicMaterial({color:0xffb629,transparent:true,opacity:.28,depthWrite:false,fog:false})); menuHi.position.z=.002; menuHi.visible=false; menu.add(menuHi);
const menuRay=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3)),new THREE.LineBasicMaterial({color:0xffb629,fog:false})); menuRay.frustumCulled=false; menuRay.visible=false; scene.add(menuRay); noBake.push(menuRay);
const wristTab=new THREE.Mesh(new THREE.SphereGeometry(.016,12,8),new THREE.MeshBasicMaterial({color:0xffb629,fog:false})); wristTab.visible=false; scene.add(wristTab); noBake.push(wristTab); let tabT=0;
function menuToggle(on=!menu.visible){ menu.visible=on; menuHi.visible=menuRay.visible=false; if(on){ headPos(); camera.getWorldDirection(_f); _f.y=0; if(_f.lengthSq()<1e-4) _f.set(0,0,-1); _f.normalize(); menu.position.set(_hp.x+_f.x*.55,_hp.y-.18,_hp.z+_f.z*.55); menu.lookAt(_hp.x,_hp.y-.18,_hp.z); menu.updateMatrixWorld(true); drawBox(); } snd('catch',menu.position,3); }
function menuHand(h,t,trig){ let x,y,press=false; // true while this hand is on the menu
  if(h.isHand){ menu.worldToLocal(_c.copy(h.jp[TIPS[1]])); if(_c.z>.07||_c.z<-.1) return false; x=_c.x; y=_c.y; press=_c.z<.012; }
  else { h.ctrl.getWorldPosition(_a); h.ctrl.getWorldDirection(_b).negate(); _c.copy(_a).addScaledVector(_b,1); menu.worldToLocal(_a); menu.worldToLocal(_c); _c.sub(_a); if(_c.z>-1e-3) return false; const k=-_a.z/_c.z; if(k<0||k>4) return false; x=_a.x+_c.x*k; y=_a.y+_c.y*k; press=trig; }
  if(Math.abs(x)>.25||Math.abs(y)>.25) return false; const i=Math.min(5,Math.floor((.25-y)/(.5/6))); menuHi.visible=true; menuHi.position.y=.25-(i+.5)*(.5/6);
  if(!h.isHand){ const p=menuRay.geometry.attributes.position; h.ctrl.getWorldPosition(_a); menu.localToWorld(_c.set(x,y,0)); p.setXYZ(0,_a.x,_a.y,_a.z); p.setXYZ(1,_c.x,_c.y,_c.z); p.needsUpdate=true; menuRay.visible=true; }
  if(press&&t>=h.boxT){ h.boxT=t+(h.isHand?.8:.2); buzz(h,.7,40); boxAct(i); } return true; }

/* ---------- browser controls ---------- */
let yaw=0,pitch=.08,yawT=0,pitchT=.08,dragD=0,eyeH=EYE,hOff=0,yExtra=0,fallV=0,camB=null; const keys={}; let charge=0,charging=false; const joy={id:null,x0:0,y0:0,x:0,y:0}; const look={id:null,x:0,y:0};
addEventListener('keydown',e=>{ if(e.target&&e.target.tagName==='INPUT') return; keys[e.code]=true; initAudio(); if(e.code==='Space'){ e.preventDefault(); if(!e.repeat) startCharge(); } if(e.code==='KeyR') summon(null);
  if(e.code==='KeyF'&&!mode){ camera.getWorldDirection(_f); if(_f.y<-.04){ headPos(); const k=Math.min(_hp.y/-_f.y,22); rig.position.x=THREE.MathUtils.clamp(_hp.x+_f.x*k,BND.cx-BND.x,BND.cx+BND.x); rig.position.z=THREE.MathUtils.clamp(_hp.z+_f.z*k,BND.cz-BND.z,BND.cz+BND.z); vel.set(0,0,0); snd('step',_a.set(rig.position.x,.05,rig.position.z),4); } } });
addEventListener('keyup',e=>{ keys[e.code]=false; if(e.code==='Space') endCharge(); });
canvas.addEventListener('pointerdown',e=>{ initAudio(); canvas.setPointerCapture(e.pointerId);
  if(e.pointerType==='touch'&&e.clientX<innerWidth*.4&&joy.id===null){ joy.id=e.pointerId; joy.x0=e.clientX; joy.y0=e.clientY; joy.x=joy.y=0; }
  else if(look.id===null){ look.id=e.pointerId; look.x=e.clientX; look.y=e.clientY; dragD=0; } });
canvas.addEventListener('pointermove',e=>{ if(e.pointerId===joy.id){ joy.x=THREE.MathUtils.clamp((e.clientX-joy.x0)/50,-1,1); joy.y=THREE.MathUtils.clamp((e.clientY-joy.y0)/50,-1,1); }
  else if(e.pointerId===look.id){ const k=e.pointerType==='touch'?.005:.0032; dragD+=Math.abs(e.clientX-look.x)+Math.abs(e.clientY-look.y); yawT-=(e.clientX-look.x)*k; pitchT=THREE.MathUtils.clamp(pitchT-(e.clientY-look.y)*k,-1.2,1.3); look.x=e.clientX; look.y=e.clientY; } });
const up=e=>{ if(e.pointerId===joy.id){ joy.id=null; joy.x=joy.y=0; } if(e.pointerId===look.id) look.id=null; };
canvas.addEventListener('pointerup',up); canvas.addEventListener('pointercancel',up);
const locked=()=>document.pointerLockElement===canvas;
canvas.addEventListener('click',e=>{ if(e.pointerType==='touch'||locked()||dragD>6||mode) return; try{ const r=canvas.requestPointerLock(); if(r&&r.catch) r.catch(()=>{}); }catch(_){} });
document.addEventListener('mousemove',e=>{ if(locked()){ yawT-=e.movementX*.0021; pitchT=THREE.MathUtils.clamp(pitchT-e.movementY*.0021,-1.2,1.3); } });
canvas.addEventListener('mousedown',e=>{ if(locked()&&e.button===0) startCharge(); });
addEventListener('mouseup',e=>{ if(locked()&&e.button===0) endCharge(); });
function startCharge(){ initAudio(); if(SPORTS[sport].action){ SPORTS[sport].action(); return; } if(camB){ charging=true; charge=0; $('meter').hidden=false; } else summon(null); }
function endCharge(){ if(SPORTS[sport].release) SPORTS[sport].release(); if(!charging) return; charging=false; $('meter').hidden=true; arc.visible=false; const b=camB; if(!b) return;
  camB=null; b.holder=null; shotVel(b.v); camera.getWorldDirection(_a); _a.y=0; _a.normalize(); b.w.crossVectors(_a,_b.set(0,1,0)).multiplyScalar(11); launched(b); }
function shotVel(out){ camera.getWorldDirection(out); out.y+=.62; out.normalize().multiplyScalar(4.5+charge*8.5); return out; }
const sb=$('shoot'); sb.addEventListener('pointerdown',e=>{ e.preventDefault(); sb.setPointerCapture(e.pointerId); startCharge(); }); sb.addEventListener('pointerup',endCharge); sb.addEventListener('pointercancel',endCharge);
$('recall').addEventListener('click',()=>{ initAudio(); summon(null); });
$('btnSet').addEventListener('click',()=>{ $('panel').hidden=!$('panel').hidden; });
$('tod').addEventListener('input',e=>{ world.hour=+e.target.value; applyWorld(); });
$('bGame').addEventListener('click',()=>boxAct(4)); $('bWx').addEventListener('click',()=>boxAct(0)); $('bNet').addEventListener('click',()=>boxAct(2)); $('bBall').addEventListener('click',()=>boxAct(3)); $('bCourt').addEventListener('click',()=>boxAct(5));
const arc=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(60*3),3)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.55}));
arc.frustumCulled=false; arc.visible=false; scene.add(arc);

/* ---------- XR session ---------- */
function applyMode(){ const ar=mode==='ar'; catcher.visible=ar;
  for(const el of ['xr','help','pad']) $(el).hidden=!!mode;
  vig.visible=false; vig.material.uniforms.uA.value=0; camera.position.set(0,mode?0:eyeH,0); camera.quaternion.identity();
  for(const h of hands){ h.ball=null; h.hang=null; } camB=null; if(!mode) resize(); menu.visible=menuHi.visible=menuRay.visible=wristTab.visible=false; setSport('hoops'); }
function hoopsShow(on){ const ar=mode==='ar'; hoops.forEach((h,i)=>{ const v=on&&(!ar||i===0); h.g.visible=v; h.active=v; h.netS.mesh.visible=v; }); W.rack.visible=on;
  if(!on){ if(game.on) endGame(); camB=null; for(const h of hands) h.ball=null; balls.forEach(b=>{ b.off=true; b.G.visible=false; b.blob.visible=false; b.holder=b.holder2=null; }); } }
SPORTS.hoops={ name:'Basketball', help:'hold click or <kbd>Space</kbd> to set power, release to shoot · <kbd>R</kbd> get ball',
  enter(){ const ar=mode==='ar'; venue=world.court==='gym'&&GYM?'gym':'clearing'; hoopsShow(true); courtMat.map=courtMap; BND.cx=BND.cz=0; BND.x=FX-.4; BND.z=FZ-.4; rig.position.set(0,0,ar?-RIM_Z+3.2:-RIM_Z+4.6);
    balls.forEach((b,i)=>{ b.holder=b.holder2=null; b.v.set(0,0,0); b.w.set(0,0,0); b.live=false; b.off=ar&&i>0; b.G.visible=!b.off; b.blob.visible=false; if(i){ b.p.copy(b.home); b.rest=true; } });
    const b=balls[0]; cur=b; b.rest=false; if(mode){ b.p.set(.25,1.15,rig.position.z-.6); b.hover=30; } else { b.holder='cam'; camB=b; b.hover=0; } gameLine(); },
  leave(){ hoopsShow(false); } };
function setSport(id){ if(SPORTS[sport]&&SPORTS[sport].leave) SPORTS[sport].leave(); sport=id; yaw=yawT=0; pitch=pitchT=.08; vel.set(0,0,0); rig.rotation.set(0,0,0); hOff=0; yExtra=0; tpEnd();
  if(id!=='hoops') hoopsShow(false); SPORTS[id].enter(); env.visible=venue==='clearing'&&mode!=='ar'; if(mode==='ar'&&id!=='hoops') hoopsShow(false); applyWorld(); drawBox();
  $('score').hidden=!!mode||id!=='hoops'; $('recall').hidden=id!=='hoops'; $('shoot').textContent=id==='hoops'?'Shoot':'Swing';
  $('help').innerHTML=coarse?'Drag left side to walk, right side to look. '+(SPORTS[id].touch||'Hold <b>Shoot</b> to play.'):'<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk · click to capture the mouse · '+SPORTS[id].help+' · <kbd>F</kbd> teleport where you look · <kbd>Q</kbd>/<kbd>E</kbd> height'; }
async function enter(kind){ initAudio();
  try{ const s=await navigator.xr.requestSession(kind,{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
    mode=kind==='immersive-ar'?'ar':'vr'; applyMode(); s.addEventListener('end',()=>{ mode=null; applyMode(); }); await renderer.xr.setSession(s);
  }catch(e){ mode=null; applyMode(); note('Could not start the headset session: '+(e.message||e.name)); } }
function note(t){ const n=$('xrnote'); n.textContent=t; n.hidden=false; }
$('btnVR').addEventListener('click',()=>enter('immersive-vr')); $('btnAR').addEventListener('click',()=>enter('immersive-ar'));
(async()=>{ let vr=false,ar=false; try{ if(navigator.xr){ vr=await navigator.xr.isSessionSupported('immersive-vr'); ar=await navigator.xr.isSessionSupported('immersive-ar'); } }catch(e){}
  $('btnVR').hidden=!vr; $('btnAR').hidden=!ar;
  if(!vr&&!ar) note('No headset found: playing on this screen.'); })();

/* ---------- main loop ---------- */
let last=0,tAcc=0; const vel=new V3(),_tg=new V3(); let stride=0,inX=0,inZ=0,fN=0,fT=0,qLevel=0;
function setShadows(){ const size=(mode||coarse)?1024:2048; let on=mode?[0,3]:[0,1,2,3]; if(qLevel>=1) on=[0,3]; if(qLevel>=2) on=[0]; if(!W.lampOn) on=[];
  lamps.forEach((l,i)=>{ if(l.shadow.mapSize.x!==size){ l.shadow.mapSize.set(size,size); if(l.shadow.map){ l.shadow.map.dispose(); l.shadow.map=null; } } l.castShadow=on.includes(i); });
  mistG.visible=qLevel<2; }
function applyQuality(){ if(!mode){ renderer.setPixelRatio(Math.max(.6,basePR*[1,.8,.65,.5][qLevel])); resize(); } applyWorld(); }
function solidPush(){headPos(); for(const q of SOLIDS){ const m=.22, x=_hp.x, z=_hp.z; if(x>q.x0-m&&x<q.x1+m&&z>q.z0-m&&z<q.z1+m){ const a=x-q.x0+m, b=q.x1+m-x, c=z-q.z0+m, d=q.z1+m-z, k=Math.min(a,b,c,d); if(k===a) rig.position.x-=a; else if(k===b) rig.position.x+=b; else if(k===c) rig.position.z-=c; else rig.position.z+=d; _hp.x=1e9; } }   }   // a table is not walked through
function applyMove(dt,speed,rate){ camera.getWorldDirection(_f); _f.y=0; _f.normalize(); _r.crossVectors(_f,_a.set(0,1,0));
  const m=Math.hypot(inX,inZ); if(m>1){ inX/=m; inZ/=m; }
  _tg.set(0,0,0).addScaledVector(_f,-inZ*speed).addScaledVector(_r,inX*speed);
  vel.lerp(_tg,1-Math.exp(-rate*dt)); const sp=vel.length(); if(mode!=='ar') solidPush(); if(sp<.01) return 0;
  rig.position.addScaledVector(vel,dt);
  if(mode!=='ar'){ rig.position.x=THREE.MathUtils.clamp(rig.position.x,BND.cx-BND.x,BND.cx+BND.x); rig.position.z=THREE.MathUtils.clamp(rig.position.z,BND.cz-BND.z,BND.cz+BND.z);
    stride+=sp*dt; if(stride>.74){ stride=0; headPos(); snd('step',_a.set(_hp.x,.05,_hp.z),sp); kickLeaves(_hp.x,_hp.z,.45,sp*.12,vel.x,vel.z); } }
  return sp; }
function stepHoop(h,t,dt){ h.flexV+=(-900*(h.flex-h.flexT)-16*h.flexV)*dt; h.flex=THREE.MathUtils.clamp(h.flex+h.flexV*dt,-.03,.16); h.rimPivot.rotation.x=h.flex;
  h.shake*=Math.exp(-7*dt); h.top.position.set(Math.sin(t*83)*h.shake*.003,0,Math.sin(t*61)*h.shake*.006); stepNet(h,dt); }
function simulate(sec){ const hs=1/240, SS=SPORTS[sport].step; let t=last; for(let k=Math.round(sec*240);k>0;k--){ for(const b of balls){ b.cool-=hs; step(b,hs); } pairs(); if(SS) SS(hs); if(k%4===0){ t+=4*hs; if(SPORTS[sport].sim) SPORTS[sport].sim(4*hs); for(const h of hoops) if(h.active) stepHoop(h,t,4*hs); stepGame(4*hs); } } }
// comfort: the view narrows while the stick moves you
const vig=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms:{uA:{value:0}},
  vertexShader:`varying vec2 v;void main(){v=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 v;uniform float uA;void main(){gl_FragColor=vec4(0.,0.,0.,smoothstep(.2,.46,length(v))*uA);}`}));
vig.position.z=-.35; vig.renderOrder=99; vig.frustumCulled=false; vig.visible=false; camera.add(vig); noBake.push(vig);
function frame(ms){ const t=ms/1000, raw=t-last||.016, dt=Math.min(.05,raw); last=t; U.time.value=t; if(mode!=='ar'&&venue==='clearing') for(const f of anim) f(t,dt);
  if(t>5&&raw<.25){ fN++; fT+=raw; if(fN>=150){ const fps=fN/fT; fN=fT=0; if(fps<(mode?62:42)&&qLevel<3){ qLevel++; applyQuality(); } } } // shed load if the device can't keep up
  inX=inZ=0; let moveSp=0;
  if(mode){ // ---- headset input
    const hanging=hands.some(h=>h.hang);
    if(!hanging&&yExtra>0){ fallV+=9.81*dt; yExtra-=fallV*dt; if(yExtra<=0){ yExtra=0; headPos(); snd('step',_a.set(_hp.x,.05,_hp.z),7); fallV=0; } }
    rig.position.y=mode==='vr'?hOff+yExtra:0;
    for(const h of hands){ const gp=h.src&&!h.src.hand&&h.src.gamepad; if(!gp) continue;
      const ax=gp.axes.length>=4?gp.axes[2]:gp.axes[0]||0, ay=gp.axes.length>=4?gp.axes[3]:gp.axes[1]||0;
      if(gp.buttons[5]?.pressed&&mode==='vr') hOff=THREE.MathUtils.clamp(hOff+(h.src.handedness==='left'?-1:1)*.6*dt,-.7,1.3);   // B taller, Y shorter
      if(h.src.handedness==='left'){ if(Math.hypot(ax,ay)>.15&&!hanging){ inX+=ax; inZ+=ay; } }
      else { if(tp.h===h){ if(ay>-.3) tpGo(); } else if(ay<-.65&&Math.abs(ax)<.5&&!tp.h&&!hanging) tp.h=h;
        if(Math.abs(ax)>.6&&!h.turned&&!tp.h){ h.turned=true; const before=headPos().clone(); rig.rotation.y-=Math.sign(ax)*Math.PI/6; rig.updateMatrixWorld(true); camera.updateMatrixWorld(true); rig.position.add(before.sub(headPos())); rig.position.y=mode==='vr'?hOff+yExtra:0; }
        if(Math.abs(ax)<.3) h.turned=false; } }
    moveSp=applyMove(dt,3.2,10); rig.updateMatrixWorld(true);
    { const u=vig.material.uniforms.uA; u.value+=((moveSp>.4&&mode==='vr'?.9:0)-u.value)*Math.min(1,dt*8); vig.visible=u.value>.02; }
    for(const h of hands){ if(!h.src){ h.skin.visible=false; continue; }
      h.isHand=readHand(h,dt); h.skin.visible=h.isHand&&!h.modelOK; h.proxy.visible=!h.isHand&&!h.cHand;
      if(h.cHand){ h.cHand.root.visible=!h.isHand; if(!h.isHand){ const gp0=h.src.gamepad, tr=gp0?gp0.buttons[0]?.value||0:0, sq=gp0?gp0.buttons[1]?.value||0:0, hb=h.ball?.42:0; h.cHand.curl=[Math.max(hb,.15+sq*.5),Math.max(hb,.1+tr*.9),Math.max(hb,.1+sq*.9),Math.max(hb,.1+sq*.9),Math.max(hb,.1+sq*.9)]; h.cHand.update(dt); } }
      if(h.isHand){ _a.addVectors(h.jp[0],h.jp[MIDK]).multiplyScalar(.5); if(!h.fon||h.fp.distanceTo(_a)>.3){ h.fp.copy(_a); h.fd.set(0,0,0); h.fon=true; }
        else { _b.subVectors(_a,h.fp).multiplyScalar(1/dt); h.fd.lerp(_b,1-Math.exp(-dt*6.3)); const fc=1.2+18*h.fd.length(); h.fp.lerp(_a,1-Math.exp(-dt*6.283*fc)); } h.pos.copy(h.fp); }   // a one-euro filter: still when held still, no lag when it moves
      else { h.fon=false; h.grip.getWorldPosition(h.pos); h.grip.getWorldQuaternion(_q); _q2.copy(h.qPrev).invert().premultiply(_q); h.qPrev.copy(_q); const ang=2*Math.acos(Math.min(1,Math.abs(_q2.w))), sn=Math.sqrt(1-_q2.w*_q2.w)||1;
        _a.set(_q2.x,_q2.y,_q2.z).multiplyScalar((_q2.w<0?-1:1)*ang/(sn*dt)); if(_a.length()>40) _a.setLength(40); h.angVel.lerp(_a,.4); }
      h.wasHand=h.isHand;
      const o=h.hist.length<12?{t:0,p:new V3()}:h.hist.shift(); o.t=t; o.p.copy(h.pos); h.hist.push(o);
      let old=o; for(let i=h.hist.length-1;i>=0;i--){ old=h.hist[i]; if(t-old.t>.045) break; }
      if(old!==o) h.vel.subVectors(o.p,old.p).multiplyScalar(1/Math.max(t-old.t,.005));
      let g=false,a=false; const gp=h.src.gamepad;
      if(h.isHand){ h.pinch=h.jp[TIPS[0]].distanceTo(h.jp[TIPS[1]]); let curl=0; for(let k=1;k<5;k++) curl+=h.jp[TIPS[k]].distanceTo(h.jp[0]); curl/=4;
        g=h.pressed?(h.pinch<.045||curl<.15):(h.pinch<.022||curl<.12); }
      else if(gp){ g=!!(gp.buttons[0]?.pressed||gp.buttons[1]?.pressed); a=!!gp.buttons[4]?.pressed; }
      else continue;
      if(menu.visible&&!h.ball){ const tr=!h.isHand&&!!gp?.buttons[0]?.pressed; if(menuHand(h,t,tr&&!h.trP)) g=false; h.trP=tr; }
      if(!h.isHand&&gp){ const sc=!!gp.buttons[3]?.pressed; if(sc&&!h.sc) menuToggle(); h.sc=sc; }
      if(g&&!h.pressed){ tryGrab(h); if(h.isHand&&!h.ball&&!h.hang&&h.pinch<.03) h.tpArm=t; }
      if(!g&&h.pressed){ if(h.ball) release(h,t); if(h.hang){ h.hang.flexT=0; h.hang=null; } if(h.isHand&&tp.h===h) tpGo(); h.tpArm=0; }
      if(h.isHand&&g&&h.tpArm&&!h.ball&&!tp.h&&t-h.tpArm>.35) tp.h=h;
      if(tp.h===h) tpAim(h);
      if(h.hang){ _a.subVectors(h.hangP,h.pos); rig.position.x+=_a.x; rig.position.z+=_a.z; yExtra=Math.max(0,yExtra+_a.y); h.hang.flexT=.075; vel.set(0,0,0); }   // hanging on the rim: the world stays put around your hand
      h.pressed=g; if(a&&!h.a) summon(h); h.a=a;
      if(h.isHand){ TIPS.forEach((k,i)=>touch(h,h.jp[k],_b.copy(h.tv[i]),.011)); touch(h,h.pos,_b.copy(h.vel),.034); boxTouch(h,h.jp[TIPS[1]],t); }
      else { if(!h.ball) touch(h,h.pos,_b.copy(h.vel),.055); boxTouch(h,h.pos,t); }
      h.ray.visible=!h.ball&&tp.h!==h; }
    { const L=hands.find(h=>h.src&&h.isHand&&h.src.handedness==='left'), Rh=hands.find(h=>h.src&&h.isHand&&h.src.handedness==='right'); wristTab.visible=!!L; if(L){ wristTab.position.copy(L.jp[0]); wristTab.position.y+=.05; if(Rh&&t>tabT&&Rh.jp[TIPS[1]].distanceTo(wristTab.position)<.035){ tabT=t+1; buzz(Rh,.7,40); menuToggle(); } } }
    for(const b of balls){ const h=b.holder; if(!h||h==='cam') continue; b.prevY=b.p.y;
      if(b.holder2){ holdPoint(h,_a); holdPoint(b.holder2,_b); if(_a.distanceTo(_b)>.6){ b.holder2.ball=null; b.holder2=null; setHold(h,b,true); } else b.p.addVectors(_a,_b).multiplyScalar(.5); b.pull=false; }
      else { _a.copy(h.local); h.anchor.localToWorld(_a); if(b.pull){ b.p.lerp(_a,1-Math.exp(-11*dt)); if(b.p.distanceTo(_a)<.1){ b.pull=false; buzz(h); snd('catch',b.p,5,b.T.pitch); } } else b.p.copy(_a); }
      b.v.copy(h.vel); b.w.multiplyScalar(.9);
      for(const hp of hoops){ if(!hp.active) continue; const dh=Math.hypot(b.p.x-hp.rim.x,b.p.z-hp.rim.z);                                // dunk: carry the ball down through the rim
        if(!b.dunk&&b.prevY>=RIM_H&&b.p.y<RIM_H&&dh<RIM_R-.02){ b.dunk=true; hp.flexV+=2.2; hp.shake=1.2; score(hp,b,true); snd('rim',hp.rim,6); } if(b.p.y>RIM_H+.2) b.dunk=false; } }
  } else { // ---- browser input
    const ks=1-Math.exp(-38*dt); yaw+=(yawT-yaw)*ks; pitch+=(pitchT-pitch)*ks;
    rig.rotation.y=yaw; camera.rotation.set(pitch,0,0);
    inX=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x; inZ=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+joy.y;
    rig.updateMatrixWorld(true); moveSp=applyMove(dt,keys.ShiftLeft||keys.ShiftRight?6:3.6,9);
    eyeH=THREE.MathUtils.clamp(eyeH+((keys.KeyE?1:0)-(keys.KeyQ?1:0))*.9*dt,.9,2.9);
    camera.position.y=eyeH+Math.sin(stride/.74*Math.PI)*.02*Math.min(1,moveSp/3);
    if(camB){ const b=camB; if(charging){ charge=Math.min(1,charge+dt/1.3); $('meterFill').style.width=(charge*100)+'%'; }
      _a.set(.2,-.3+charge*.12,-.62); rig.updateMatrixWorld(true); camera.localToWorld(_a); b.p.copy(_a); b.v.copy(vel);
      if(charging){ shotVel(_b); const p=arc.geometry.attributes.position; let px=_a.x,py=_a.y,pz=_a.z,vx=_b.x,vy=_b.y,vz=_b.z;
        for(let i=0;i<60;i++){ p.setXYZ(i,px,py,pz); if(py>BALL_R){ const s=Math.hypot(vx,vy,vz),k=1-.022*s*.04; vy-=9.81*.04; vx*=k;vy*=k;vz*=k; px+=vx*.04;py+=vy*.04;pz+=vz*.04; } }
        p.needsUpdate=true; arc.visible=true; } }
    else { headPos(); for(const b of balls){ if(b.off||b.holder||b.cool>0) continue; if(Math.hypot(_hp.x-b.p.x,_hp.z-b.p.z)<.9&&b.p.y<2.1){ snd('catch',b.p,3+b.v.length(),b.T.pitch); b.holder='cam'; camB=b; b.live=false; b.rest=false; cur=b; break; } } }
  }
  if(SPORTS[sport].frame) SPORTS[sport].frame(t,dt);
  stepBody(t,moveSp);
  for(const b of balls){ b.cool-=dt; if(b.hover>0){ b.hover-=dt; b.v.set(0,0,0); } b.pp.copy(b.p); }
  tAcc+=dt; const hs=1/240; let n=0; const SS=SPORTS[sport].step; while(tAcc>=hs&&n++<14){ for(const b of balls) step(b,hs); pairs(); if(SS) SS(hs); tAcc-=hs; } if(n>=14) tAcc=0;
  const hp=headPos(), al=Math.min(1,tAcc/hs);
  for(const b of balls){ if(b.off) continue;
    if(!b.holder){ const wl=b.w.length(); if(wl>1e-4){ _q.setFromAxisAngle(_a.copy(b.w).multiplyScalar(1/wl),wl*dt); b.q.premultiply(_q); } }
    if(!b.holder&&!b.rest&&(b.p.y<-3||b.p.distanceTo(hp)>(mode==='ar'?12:70)||(mode!=='ar'&&(Math.abs(b.p.x)>FX+.3||Math.abs(b.p.z)>FZ+.3)&&b.p.y<.4&&b.v.length()<1))){ b.p.copy(b.home); b.v.set(0,0,0); b.w.set(0,0,0); b.rest=true; if(mode==='ar'||b===cur) summon(null); }
    if(b.holder||b.hover>0||b.rest) b.G.position.copy(b.p); else b.G.position.lerpVectors(b.pp,b.p,al);
    b.sq*=Math.exp(-26*dt);
    if(b.sq>.003){ _q.setFromUnitVectors(UPV,b.sqN); b.G.quaternion.copy(_q); b.G.scale.set(1+b.sq*.5,1-b.sq,1+b.sq*.5); b.mesh.quaternion.copy(_q).invert().multiply(b.q); b.G.position.addScaledVector(b.sqN,-BALL_R*b.sq); }
    else { b.G.quaternion.identity(); b.G.scale.set(1,1,1); b.mesh.quaternion.copy(b.q); }
    const bh=Math.max(0,b.G.position.y-BALL_R), over=mode==='ar'||(Math.abs(b.G.position.x)<FX&&Math.abs(b.G.position.z)<FZ);
    b.blob.visible=false; if(b.blob.visible){ const k=BALL_R*(2.2+bh*2.4); b.blob.position.set(b.G.position.x,.006,b.G.position.z); b.blob.scale.set(k,1,k); b.blob.material.opacity=.62*(1-bh/1.4)**2; } }
  for(const h of hoops) if(h.active) stepHoop(h,t,dt);
  stepGame(dt);
  for(const m of marks){ if(!m.visible) continue; m.userData.age+=dt; const l=m.userData.age/(10+20*W.wet); if(l>=1) m.visible=false; else m.material.opacity=.3*(1-l); }
  if(mode!=='ar'&&venue==='clearing'){ stepFences(dt); stepLeaves(t,dt); stepWeatherFx(t,dt); stepFlyers(t); stepSky(t,dt); }
  if(mode!=='ar'&&bakeAt&&t>bakeAt){ bakeAt=0; bakeEnv(); }
  sky.position.copy(hp);
  if(AC&&AC.state==='running'){ const L=AC.listener; camera.getWorldDirection(_f); if(L.positionX){ L.positionX.value=hp.x;L.positionY.value=hp.y;L.positionZ.value=hp.z;L.forwardX.value=_f.x;L.forwardY.value=_f.y;L.forwardZ.value=_f.z;L.upY.value=1; } else { L.setPosition(hp.x,hp.y,hp.z); L.setOrientation(_f.x,_f.y,_f.z,0,1,0); } }
  renderer.render(scene,camera);
}

/* ---------- material patch: lamp-lit fog (analytic in-scatter) and wind sway ---------- */
const LGL=lampPos.map(p=>`vec3(${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)})`).join(',');
function patchMat(m){ if(!m||m.isShaderMaterial||m.isShadowMaterial||m.userData.fx) return; m.userData.fx=true; const wind=m.userData.wind||'';
  m.onBeforeCompile=sh=>{ sh.uniforms.uLampK=U.lampK; sh.uniforms.uTime=U.time; sh.uniforms.uWind=U.wind;
    sh.vertexShader=sh.vertexShader.replace('#include <fog_pars_vertex>','#include <fog_pars_vertex>\n#ifdef USE_FOG\nvarying vec3 vWP;\n#endif\nuniform float uTime;uniform float uWind;')
      .replace('#include <fog_vertex>','#include <fog_vertex>\n#ifdef USE_FOG\nvWP=(inverse(viewMatrix)*mvPosition).xyz;\n#endif');
    if(wind) sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat wph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.23;\n#else\nfloat wph=position.x*.5;\n#endif\nfloat wam=(${wind})*uWind;transformed.x+=sin(uTime*1.7+wph+position.y*2.)*wam;transformed.z+=cos(uTime*1.3+wph*1.3)*wam*.7;`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <fog_pars_fragment>','#include <fog_pars_fragment>\n#ifdef USE_FOG\nvarying vec3 vWP;uniform float uLampK;\n#endif')
      .replace('#include <fog_fragment>',`#include <fog_fragment>\n#ifdef USE_FOG\nif(uLampK>0.){vec3 LP[4]=vec3[4](${LGL});vec3 rd=vWP-cameraPosition;float TT=length(rd);rd/=TT;float gl=0.;for(int i=0;i<4;i++){vec3 q=LP[i]-cameraPosition;float tc=dot(q,rd);float hh=sqrt(max(dot(q,q)-tc*tc,.09));gl+=(atan((TT-tc)/hh)+atan(tc/hh))/hh;}gl_FragColor.rgb+=vec3(1.,.93,.78)*gl*uLampK;}\n#endif\ngl_FragColor.rgb=clamp(gl_FragColor.rgb,0.,48.);`); };
  m.customProgramCacheKey=()=>'fx'+wind; m.needsUpdate=true; }
// the still scenery as one mesh a material: far fewer draws
{ const by=new Map(); env.updateMatrixWorld(true);
  env.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||o.userData.dyn||Array.isArray(o.material)||o.material.isShaderMaterial||!o.visible||!o.geometry.attributes.normal||!o.geometry.attributes.uv) return;
    const k=o.material.uuid+(o.castShadow?'c':'')+(o.receiveShadow?'r':''); if(!by.has(k)) by.set(k,[]); by.get(k).push(o); });
  for(const list of by.values()){ if(list.length<2) continue; const gs=list.map(o=>{ let g=o.geometry.clone(); if(g.index) g=g.toNonIndexed(); for(const a of Object.keys(g.attributes)) if(a!=='position'&&a!=='normal'&&a!=='uv') g.deleteAttribute(a); g.applyMatrix4(o.matrixWorld); return g; });
    const mg=mergeGeometries(gs); if(!mg) continue; const m=new THREE.Mesh(mg,list[0].material); m.castShadow=list[0].castShadow; m.receiveShadow=list[0].receiveShadow; env.add(m); for(const o of list) o.removeFromParent(); } }
scene.traverse(o=>{ const m=o.material; if(Array.isArray(m)) m.forEach(patchMat); else patchMat(m); }); Object.values(netMats).forEach(patchMat);

// what the other sports' files are handed
const K={THREE,V3,scene,env,camera,rig,renderer,hands,BND,W,cv,tex,ptex,radial,shadowOn,galv,blackSteel,wood,tube,noBake,patchMat,snd:(...a)=>snd(...a),flash,buzz,headPos:()=>headPos(),setSport:id=>setSport(id),
  courtMat,courtMap,FX,FZ,CEIL,RACK,BALL_R,sbT,boxT,BOXY,BOXZ,stats,drawScore,board:null,racketHand:'right',get mode(){return mode},get t(){return last},get sport(){return sport},set venue(v){venue=v},get coarse(){return coarse},vel,solids:SOLIDS,gesture:[],get arPick(){return arPick},set arPick(v){arPick=v}};
K.board=lines=>{ const x=sbC.getContext('2d'); x.fillStyle='#07090a'; x.fillRect(0,0,512,256); x.strokeStyle='#3a3d40'; x.lineWidth=8; x.strokeRect(4,4,504,248); x.textAlign='center';
  lines.forEach((l,i)=>{ x.fillStyle=i%2?'#ffb629':'#d8d6cc'; x.font=i%2?'700 62px "Courier New",monospace':'700 24px Arial'; x.fillText(l,256,i%2?46+i*52:22+i*56); }); sbT.needsUpdate=true; };
scene.traverse(o=>{ const m=o.material; if(Array.isArray(m)) m.forEach(patchMat); else patchMat(m); });
applyMode(); try{ if(localStorage.getItem('ball-court')==='gym') setCourt('gym'); }catch(e){}
window.__ball={TIPS,setCourt,menu,menuToggle,boxAct,get venue(){return venue},get gym(){return GYM},setSport,SPORTS,K,env,get sport(){return sport},get ball(){return cur},balls,simulate,game,startGame,endGame,hands,tp,vig,get mode(){return mode},get t(){return last},get yExtra(){return yExtra},rig,stats,camera,renderer,scene,world,applyWorld,hoops,set(y,p){yaw=yawT=y;pitch=pitchT=p},get q(){return qLevel},set q(v){qLevel=v;applyQuality()},launched,THREE,
  free(b){ if(camB===b) camB=null; b.holder=null; b.hover=0; b.rest=false; }};
renderer.setAnimationLoop(frame);
