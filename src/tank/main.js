// HULL DOWN: the whole game (the photographed sky, the farmland, your tank and its turret's inside, the gunsight, the enemy's armour, shells, recorded sound); three 0.147 is put in ahead of it by tools/edge.cjs, its models, pictures and sounds come from tank-assets/
(async () => {
'use strict';
const T = THREE;
const $ = id => document.getElementById(id);
const BASE = 'tank-assets/';

// ---------- helpers ----------
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const wrap=a=>{a=(a+Math.PI)%(Math.PI*2);if(a<0)a+=Math.PI*2;return a-Math.PI;};
const toward=(a,b,m)=>a+clamp(b-a,-m,m);
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
const UP=new T.Vector3(0,1,0);
const lin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);

// ---------- renderer ----------
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const PR=Math.min(window.devicePixelRatio||1,1.75);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=.62;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.xr.enabled=true;
renderer.xr.setReferenceSpaceType('local-floor');
if(renderer.xr.setFoveation)renderer.xr.setFoveation(1);
const maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());

// ---------- loading ----------
let loadN=0,loadD=0;const tick=()=>{loadD++;$('loading').textContent='Rolling out… '+Math.round(100*loadD/Math.max(1,loadN))+'%';};
const count=p=>{loadN++;return p.then(v=>{tick();return v;});};
const texL=new T.TextureLoader(),gltfL=new T.GLTFLoader();
function tex(file,o={}){return count(new Promise((ok,no)=>texL.load(BASE+'tex/'+file,t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=maxAniso;if(o.srgb)t.encoding=T.sRGBEncoding;if(o.clamp)t.wrapS=t.wrapT=T.ClampToEdgeWrapping;ok(t);},null,()=>no(new Error('picture '+file)))));}
const pbr=async(n,rep)=>{const[d,nm,a]=await Promise.all([tex(n+'_d.jpg',{srgb:1}),tex(n+'_n.jpg'),tex(n+'_a.jpg')]);for(const t of[d,nm,a])t.repeat.set(rep,rep);return{d,n:nm,a};};
const model=n=>count(new Promise((ok,no)=>gltfL.load(BASE+'m/'+n+'.glb',g=>ok(g.scene),null,()=>no(new Error('model '+n)))));
const jget=f=>count(fetch(BASE+f).then(r=>r.json()));
const TREES=['island_tree_01','island_tree_02','island_tree_03','tree_small_02','jacaranda_tree','shrub_02'];
let A0;
try{
  const names=['hero','foe','seat','console','display','switchbox','radio','helmet','barn','cars','pipes','sconce','ammobox','rocks'];
  const[sky,skyS,SKY,TREEJ,MODJ,grass,dry,soil,plate,paint,leather,cards,models]=await Promise.all([
    count(new Promise((ok,no)=>texL.load(BASE+'sky/sky.jpg',ok,null,()=>no(new Error('sky'))))),count(new Promise((ok,no)=>texL.load(BASE+'sky/sky_s.jpg',ok,null,()=>no(new Error('sky'))))),jget('sky/sky.json'),jget('trees.json'),jget('models.json'),
    pbr('leafy_grass',1),tex('sparse_grass_d.jpg',{srgb:1}),pbr('farm_soil',1),pbr('metal_plate',1),pbr('green_metal_rust',1),pbr('fabric_leather_02',1),
    Promise.all(TREES.map(n=>Promise.all([0,1].map(v=>Promise.all([tex(n+'_'+v+'_d.webp',{srgb:1,clamp:1}),tex(n+'_'+v+'_n.webp',{clamp:1})]))))),
    Promise.all(names.map(model))]);
  A0={sky,skyS,SKY,TREEJ,MODJ,grass,dry,soil,plate,paint,leather,cards,M:Object.fromEntries(names.map((n,i)=>[n,models[i]]))};
}catch(e){$('loading').textContent='Could not load the game’s files ('+e.message+'). Reload to try again.';return;}
const{SKY,TREEJ,MODJ}=A0,M=A0.M;

// ---------- sky + sun ----------
const sunPhi=SKY.u*Math.PI*2,SUN=new T.Vector3(-Math.cos(sunPhi)*Math.cos(SKY.el),Math.sin(SKY.el),Math.sin(sunPhi)*Math.cos(SKY.el)).normalize();
const FOG=new T.Color(lin(SKY.hor[0]),lin(SKY.hor[1]),lin(SKY.hor[2])).multiplyScalar(1.5),SUNHAZE=new T.Color(lin(SKY.sunhor[0]),lin(SKY.sunhor[1]),lin(SKY.sunhor[2])).multiplyScalar(2.6);
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
    const float FA=0.00062;const float FB=0.0046;
    float dy=fDir.y*FB*fDist;float e0=FA*exp(-FB*camH);
    float amt=abs(dy)>1e-4?e0*fDist*(1.0-exp(-dy))/dy:e0*fDist;
    float ff=1.0-exp(-max(amt,0.0));
    float sa=pow(max(dot(fDir,${v3(SUN)}),0.0),6.0);
    vec3 fc=mix(fogColor,${v3(SUNHAZE)},sa);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,fc,ff);
  }
  #endif
  #if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
  #endif`;
})();

const scene=new T.Scene();
scene.fog=new T.FogExp2(FOG,-40);
A0.sky.encoding=T.sRGBEncoding;A0.sky.wrapS=T.RepeatWrapping;A0.sky.anisotropy=maxAniso;
const sky=new T.Mesh(new T.SphereGeometry(5000,48,18,0,Math.PI*2,0,Math.PI*SKY.cut),new T.MeshBasicMaterial({map:A0.sky,side:T.BackSide,fog:false,depthWrite:false,color:new T.Color(2.1,2.1,2.1)}));
sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
A0.skyS.encoding=T.sRGBEncoding;A0.skyS.mapping=T.EquirectangularReflectionMapping;
const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(A0.skyS).texture;

const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,.06,9000);
camera.rotation.order='YXZ';
const rig=new T.Group();rig.add(camera);

const sunL=new T.DirectionalLight(0xffd9ae,3.3);
sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);
const shc=sunL.shadow.camera;shc.left=-46;shc.right=46;shc.top=46;shc.bottom=-46;shc.near=1;shc.far=400;
sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.06;
scene.add(sunL,sunL.target);
const hemiL=new T.HemisphereLight(0x9db4d8,0x5a5140,.55);scene.add(hemiL);const ENV=scene.environment;

function glowCanvas(soft){const c=cnv(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(soft?.08:.22,'rgba(255,255,255,'+(soft?.5:.75)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c;}
function smokeCanvas(){const c=cnv(128,128),g=c.getContext('2d'),r=rng(4);for(let i=0;i<34;i++){const x=38+r()*52,y=38+r()*52,rad=12+r()*26,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(255,255,255,.2)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}return c;}
const ctex=c=>{const t=new T.CanvasTexture(c);t.anisotropy=maxAniso;return t;};
const glowT=ctex(glowCanvas(false)),softT=ctex(glowCanvas(true)),smokeT=ctex(smokeCanvas());
const sunGlow=new T.Sprite(new T.SpriteMaterial({map:softT,color:0xffd9a8,transparent:true,opacity:.3,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));
sunGlow.scale.setScalar(1500);scene.add(sunGlow);

// ---------- the land ----------
const hsh=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
function vn(x,z){const xi=Math.floor(x),zi=Math.floor(z),u=smooth(x-xi),v=smooth(z-zi);return lerp(lerp(hsh(xi,zi),hsh(xi+1,zi),u),lerp(hsh(xi,zi+1),hsh(xi+1,zi+1),u),v);}
function fbm(x,z,o){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vn(x*f,z*f);a*=.5;f*=2.03;}return s;}
function h0(x,z){const r=Math.hypot(x,z);const rd=Math.abs(fbm(x/1100+5.5,z/1100+1.5,3)-.5)*2;return 58*(fbm(x/560+3.1,z/560+7.7,4)-.46)+11*(fbm(x/140+1.3,z/140+4.2,3)-.44)+.5*(vn(x/14,z/14)-.5)+smooth(clamp((r-800)/2600,0,1))*(40+330*Math.pow(1-rd,2.2)*(.35+fbm(x/2300,z/2300,2)));}
const GN=170,GS=10,G0=-850,HG=new Float32Array((GN+1)*(GN+1));
for(let j=0;j<=GN;j++)for(let i=0;i<=GN;i++)HG[j*(GN+1)+i]=h0(G0+i*GS,G0+j*GS);
function hAt(x,z){if(Math.abs(x)>=-G0||Math.abs(z)>=-G0)return h0(x,z);const fx=(x-G0)/GS,fz=(z-G0)/GS,i=Math.min(GN-1,fx|0),j=Math.min(GN-1,fz|0),u=fx-i,v=fz-j,k=j*(GN+1)+i;
  return lerp(lerp(HG[k],HG[k+1],u),lerp(HG[k+GN+1],HG[k+GN+2],u),v);}
function los(ax,ay,az,bx,by,bz){const n=Math.max(8,Math.ceil(Math.hypot(bx-ax,bz-az)/7));for(let i=1;i<n;i++){const t=i/n;if(hAt(ax+(bx-ax)*t,az+(bz-az)*t)>ay+(by-ay)*t)return t;}return -1;}
// the fields: a turned grid of plots, each grass, dry stubble or ploughed soil (the land's shader draws the same grid)
const FA_=.47,FCS=Math.cos(FA_),FSN=Math.sin(FA_),FW=190,FD=140;
function field(x,z){const qx=FCS*x+FSN*z,qz=-FSN*x+FCS*z,cx=Math.floor(qx/FW),cz=Math.floor(qz/FD),r=hsh(cx*1.37+.5,cz*2.11+.25),fx=qx/FW-cx,fz=qz/FD-cz;
  return{cx,cz,r,kind:r<.46?0:r<.7?1:r<.84?2:3,edge:Math.min(Math.min(fx,1-fx)*FW,Math.min(fz,1-fz)*FD)};}
const land=new T.Group();scene.add(land);
const landMat=new T.MeshStandardMaterial({map:A0.grass.d,normalMap:A0.grass.n,normalScale:new T.Vector2(.9,.9),vertexColors:true,roughness:1,envMapIntensity:.3});
landMat.onBeforeCompile=s=>{s.uniforms.tDry={value:A0.dry};s.uniforms.tSoil={value:A0.soil.d};
  s.fragmentShader=s.fragmentShader.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\nuniform sampler2D tDry;uniform sampler2D tSoil;\nfloat fh(vec2 p){return fract(sin(p.x*127.1+p.y*311.7)*43758.5453);}')
   .replace('#include <map_fragment>',`vec2 wp=vFogWorld.xz;vec2 q=vec2(${FCS.toFixed(5)}*wp.x+${FSN.toFixed(5)}*wp.y,${(-FSN).toFixed(5)}*wp.x+${FCS.toFixed(5)}*wp.y);vec2 fs=vec2(${FW}.0,${FD}.0);vec2 cell=floor(q/fs);vec2 ff=fract(q/fs);
    float fr=fh(vec2(cell.x*1.37+.5,cell.y*2.11+.25));float edge=min(min(ff.x,1.-ff.x)*fs.x,min(ff.y,1.-ff.y)*fs.y);float inF=smoothstep(2.5,5.5,edge+2.*(texture2D(map,wp*.02).g-.4));
    vec3 g1=texture2D(map,wp/5.3).rgb;vec3 g2=texture2D(map,wp/31.).rgb;vec3 gr=g1*(.55+1.1*g2);
    vec3 dr=texture2D(tDry,q/6.1).rgb*vec3(1.25,1.12,.8);vec3 so=texture2D(tSoil,vec2(q.x/4.7,q.y/4.7)).rgb*vec3(.8,.72,.66);
    float kd=step(.46,fr)*step(fr,.7)*inF,ks=step(.7,fr)*step(fr,.84)*inF,kw=step(.84,fr)*inF;float farK=smoothstep(1100.,2200.,length(wp));
    vec3 gc=mix(mix(mix(gr,dr,kd),so,ks),gr*vec3(.62,.66,.5),kw);float wood=smoothstep(.5,.62,texture2D(map,wp/2900.).g+.25*texture2D(map,wp/700.).r);gc=mix(gc,mix(gr,vec3(.16,.2,.11),wood*.85),farK);diffuseColor.rgb*=gc;`);};
(function buildLand(){
  const g=new T.PlaneGeometry(GN*GS,GN*GS,GN,GN);g.rotateX(-Math.PI/2);
  const tint=(x,z,out,k)=>{const n=fbm(x/260+9,z/260+2,3),m=vn(x/55,z/55);out[k]=lerp(.72,1.12,n)*lerp(.92,1.06,m);out[k+1]=lerp(.8,1.08,n)*lerp(.94,1.05,m);out[k+2]=lerp(.7,.98,n);};
  const p=g.attributes.position,col=new Float32Array(p.count*3),uv=g.attributes.uv;
  for(let k=0;k<p.count;k++){const x=p.getX(k),z=p.getZ(k);p.setY(k,HG[k]);uv.setXY(k,x/4.1,z/4.1);tint(x,z,col,k*3);}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();
  const m=new T.Mesh(g,landMat);m.receiveShadow=true;land.add(m);
  // the far land out to the horizon, coarse
  const RN=40,RS=120,rp=[],rc=[],ru=[],ri=[];
  for(let j=0;j<=RN;j++){const r=820+Math.pow(j/RN,1.7)*6600;for(let i=0;i<=RS;i++){const a=i/RS*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r;rp.push(x,h0(x,z)-(j===0?2.5:0),z);ru.push(x/4.1,z/4.1);const c=[0,0,0];tint(x,z,c,0);rc.push(c[0],c[1],c[2]);}}
  for(let j=0;j<RN;j++)for(let i=0;i<RS;i++){const a=j*(RS+1)+i,b=a+RS+1;ri.push(a,a+1,b,b,a+1,b+1);}
  const fg=new T.BufferGeometry();fg.setAttribute('position',new T.Float32BufferAttribute(rp,3));fg.setAttribute('uv',new T.Float32BufferAttribute(ru,2));fg.setAttribute('color',new T.Float32BufferAttribute(rc,3));fg.setIndex(ri);fg.computeVertexNormals();
  const far=new T.Mesh(fg,landMat);far.frustumCulled=false;land.add(far);
})();
// trees and hedges: each a pair of crossed cards drawn from the real tree
const TSCALE=[2.4,2.9,3.6,2.6,.62,1.1];
(function buildTrees(){
  const r=rng(1944),spots=TREES.map(()=>[]);const put=(k,x,z,s)=>{if(Math.hypot(x,z)<30||Math.hypot(x,z)>1700)return;spots[k].push([x,z,s*(.75+r()*.5),Math.atan2(SUN.x,SUN.z)+(r()-.5)*1.2+(r()<.5?Math.PI:0)]);};
  for(let cx=-9;cx<=9;cx++)for(let cz=-12;cz<=12;cz++){
    const o=(u,v)=>{const qx=(cx+u)*FW,qz=(cz+v)*FD;return[FCS*qx-FSN*qz,FSN*qx+FCS*qz];},f=field(...o(.5,.5));
    if(f.kind===3){for(let i=0;i<90;i++){const[x,z]=o(.06+r()*.88,.06+r()*.88);put(r()<.2?4:Math.floor(r()*4),x,z,1.15);}}
    for(const[side,len]of[[0,FW],[1,FD]]){const h=hsh(cx*3.1+side*7.7,cz*5.3+1.9);if(h>.62)continue;const gap=.15+hsh(cx+side,cz*1.7)*.6;
      for(let d=3;d<len-3;d+=5+r()*9){const t=d/len;if(Math.abs(t-gap)<.07)continue;const[x,z]=side?o(0,t):o(t,0);const jx=(r()-.5)*3,jz=(r()-.5)*3;if(r()<.55)put(5,x+jx,z+jz,1);else put(h<.3?Math.floor(r()*4):3,x+jx,z+jz,.9);}}
    if(f.kind<3&&r()<.55){const[x,z]=o(.2+r()*.6,.2+r()*.6);put(r()<.3?4:Math.floor(r()*3),x,z,1.3);}}
  for(let i=0;i<5200;i++){const a2=r()*6.28,d=1700+Math.pow(r(),1.4)*2600,x=Math.cos(a2)*d,z=Math.sin(a2)*d;if(fbm(x/700+3,z/700+8,2)<.5)continue;spots[Math.floor(r()*4)].push([x,z,2.2+r()*1.6,Math.atan2(SUN.x,SUN.z)+(r()-.5)]);}
  const dm=new T.Object3D();
  TREES.forEach((n,k)=>{const J=TREEJ[n],S=TSCALE[k],list=spots[k];if(!list.length)return;
    for(let v=0;v<2;v++){const g=new T.PlaneGeometry(J.w*S,J.h*S);g.translate(0,J.h*S/2-.15,0);if(v)g.rotateY(Math.PI/2);
      const mat=new T.MeshStandardMaterial({map:A0.cards[k][v][0],normalMap:A0.cards[k][v][1],alphaTest:.42,side:T.DoubleSide,roughness:.95,envMapIntensity:.5,color:new T.Color(.9,.94,.8),emissive:new T.Color(.2,.22,.15),emissiveMap:A0.cards[k][v][0],normalScale:new T.Vector2(.6,.6)});
      const im=new T.InstancedMesh(g,mat,list.length);list.forEach((t,i)=>{dm.position.set(t[0],hAt(t[0],t[1]),t[1]);dm.rotation.set(0,t[3],0);dm.scale.setScalar(t[2]);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);});
      im.frustumCulled=false;im.castShadow=true;land.add(im);}});
})();
const prep=(o,f)=>{o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(f)f(m.material,m);}});return o;};
(function buildScenery(){
  const place=(src,x,z,ry,s=1)=>{const o=src.clone();o.position.set(x,hAt(x,z)-.12,z);o.rotation.y=ry;o.scale.setScalar(s);land.add(o);return o;};
  prep(M.barn,m=>{m.envMapIntensity=.3;});prep(M.cars,m=>{m.envMapIntensity=.4;});prep(M.rocks,m=>{m.envMapIntensity=.3;});
  place(M.barn,-150,-230,.5);place(M.barn,250,-360,1.9,.9);place(M.barn,-330,160,2.6);place(M.cars,-128,-218,1.1);place(M.cars,262,-338,.3);
  const r=rng(77);for(let i=0;i<14;i++){const a=r()*6.28,d=60+r()*600;place(M.rocks,Math.cos(a)*d,Math.sin(a)*d,r()*6.28,.5+r()*.8);}
})();

// ---------- your tank ----------
const tank=new T.Group();scene.add(tank);
const ext=new T.Group();tank.add(ext);
prep(M.hero,m=>{m.envMapIntensity=.7;m.color.multiplyScalar(.82);});
const hullN=M.hero.getObjectByName('hull'),turret=new T.Group(),turN=M.hero.getObjectByName('turret'),gunN=M.hero.getObjectByName('gun');
ext.add(hullN);tank.add(turret);turret.add(turN);
const TRUN=new T.Vector3().fromArray(MODJ.hero.trunnion);
const muzzle=new T.Object3D();muzzle.position.set(0,0,MODJ.hero.muzzle[2]-.1);gunN.add(muzzle);
const gunCam=new T.PerspectiveCamera(9,4/3,1.6,9000);gunCam.position.set(.62,.42,-.5);gunN.add(gunCam);
// where the roof is: most of the turret's points lie under it, its aerials above
const ROOF=(()=>{const ys=[];turN.traverse(m=>{if(m.isMesh&&m.parent!==gunN){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i+=3)ys.push(p.getY(i));}});ys.sort((a,b)=>a-b);return ys[Math.floor(ys.length*.9)];})();
const HX=.62,HZ=.55,EYE=1.2,FLOOR=ROOF-.12-1.62,SEAT=new T.Vector3(HX,FLOOR,HZ),LIFT=ROOF+.5-(FLOOR+EYE),CAMH=EYE;
rig.position.copy(SEAT);turret.add(rig);
const hatchLid=new T.Group();hatchLid.position.set(HX,ROOF+.02,HZ+.36);turret.add(hatchLid);
{const lm=new T.MeshStandardMaterial({map:A0.paint.d,normalMap:A0.paint.n,roughnessMap:A0.paint.a,metalnessMap:A0.paint.a,metalness:.5,color:0x8a8f6a,envMapIntensity:.6});
 const lid=new T.Mesh(new T.CylinderGeometry(.36,.36,.05,24).translate(0,.025,-.36),lm);lid.castShadow=true;hatchLid.add(lid);
 const hole=new T.Mesh(new T.CircleGeometry(.33,24).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x030303,fog:false}));hole.position.set(HX,ROOF+.012,HZ);turret.add(hole);hatchLid.userData.hole=hole;}

// ---------- inside the turret ----------
const inside=new T.Group();turret.add(inside);
const monitorMat=new T.MeshBasicMaterial({color:0xffffff}),statC=cnv(512,320),statT=ctex(statC),fcsC=cnv(256,192),fcsT=ctex(fcsC);
const sightRT=new T.WebGLRenderTarget(640,480,{type:T.HalfFloatType});monitorMat.map=sightRT.texture;
const breech=new T.Group(),breechSlide=new T.Group();
(function buildInside(){
  const CEIL=ROOF-.12,H=CEIL-FLOOR,mk=(t,rep,o)=>{const m=new T.MeshStandardMaterial(Object.assign({map:t.d.clone(),normalMap:t.n.clone(),roughnessMap:t.a.clone(),metalnessMap:t.a.clone(),envMapIntensity:.18},o));for(const k of['map','normalMap','roughnessMap','metalnessMap']){m[k].repeat.set(rep,rep);m[k].needsUpdate=true;}return m;};
  // the turret's white paint: the green paint's picture with its colour taken out and lifted
  const white=(()=>{const im=A0.paint.d.image,c=cnv(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){const l=a[i]*.3+a[i+1]*.5+a[i+2]*.2,v=Math.min(255,70+l*1.75);a[i]=v*.97;a[i+1]=v;a[i+2]=v*.93;}g.putImageData(d,0,0);const t=ctex(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;return{d:t,n:A0.paint.n,a:A0.paint.a};})();
  const wallMat=mk(white,.55,{color:0x9aa196,metalness:.1,roughness:.8,side:T.DoubleSide}),frame=mk(white,.8,{color:0x858c80,metalness:.15,roughness:.7}),dark=mk(A0.paint,1.5,{color:0x30352c,metalness:.4,roughness:.7}),
    olive=mk(A0.paint,1.2,{color:0x8c9478,metalness:.3,roughness:.75}),floorMat=mk(A0.plate,1.6,{color:0x6b6e66,metalness:.6,roughness:.8}),pad=mk(A0.leather,3,{color:0x2a2622,metalness:0,roughness:1}),
    steel=new T.MeshStandardMaterial({color:0x44474a,metalness:.85,roughness:.4,normalMap:A0.paint.n,normalScale:new T.Vector2(.35,.35),envMapIntensity:.45}),bright=new T.MeshStandardMaterial({color:0x9a9da0,metalness:1,roughness:.22,envMapIntensity:.6}),
    brass=new T.MeshStandardMaterial({color:0xb08a3a,metalness:1,roughness:.32,envMapIntensity:.5}),rubberM=new T.MeshStandardMaterial({color:0x0c0c0c,roughness:.7}),glass=new T.MeshStandardMaterial({color:0x06100c,roughness:.08,metalness:.2,envMapIntensity:.5});
  const add=(g,m,p)=>{const o=new T.Mesh(g,m);(p||inside).add(o);return o;};
  // the shell: an eight-sided room, a floor, a roof with the hatch's hole
  const out=[[-1.12,-.95],[-.7,-1.3],[.95,-1.3],[1.32,-.9],[1.32,1.05],[.95,1.5],[-.7,1.5],[-1.12,1.1]];
  out.forEach((a,i)=>{const b=out[(i+1)%out.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),g=new T.PlaneGeometry(len,H,1,1);const uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*len,uv.getY(k)*H);
    const w=add(g,wallMat);w.position.set((a[0]+b[0])/2,FLOOR+H/2,(a[1]+b[1])/2);w.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
    add(new T.BoxGeometry(.07,H,.05),frame).position.set(a[0]*.985,FLOOR+H/2,a[1]*.985);
    for(const y of[.32,.98]){const s=add(new T.BoxGeometry(len,.05,.035),frame);s.position.set((a[0]+b[0])/2*.99,FLOOR+H*y,(a[1]+b[1])/2*.99);s.rotation.y=w.rotation.y;}});
  const sh=new T.Shape(out.map(p=>new T.Vector2(p[0],-p[1])));const fl=add(new T.ShapeGeometry(sh),floorMat);fl.rotation.x=-Math.PI/2;fl.position.y=FLOOR;
  const sh2=new T.Shape(out.map(p=>new T.Vector2(p[0],-p[1])));const hp=new T.Path();hp.absarc(HX,-HZ,.34,0,Math.PI*2,true);sh2.holes.push(hp);const cl=add(new T.ShapeGeometry(sh2,24),wallMat);cl.rotation.x=-Math.PI/2;cl.position.y=CEIL;
  add(new T.TorusGeometry(.36,.035,10,28).rotateX(Math.PI/2),pad).position.set(HX,CEIL-.02,HZ);add(new T.CylinderGeometry(.345,.345,.14,28,1,true),steel).position.set(HX,CEIL+.07,HZ);
  for(let i=0;i<6;i++){const a=i/6*6.28+.4,c=Math.cos(a),s=Math.sin(a),pb=add(new T.BoxGeometry(.13,.05,.03),steel);pb.position.set(HX+c*.47,CEIL-.03,HZ+s*.47);pb.rotation.y=-a+Math.PI/2;
    const gl=add(new T.BoxGeometry(.11,.012,.004),glass);gl.position.set(HX+c*.454,CEIL-.03,HZ+s*.454);gl.rotation.y=-a+Math.PI/2;}
  // rivets along the frames
  {const rv=new T.InstancedMesh(new T.SphereGeometry(.009,6,4),steel,out.length*16),dm=new T.Object3D();let n=0;out.forEach(a=>{for(let k=0;k<16;k++){dm.position.set(a[0]*.975,FLOOR+.06+k*(H-.12)/15,a[1]*.975);dm.updateMatrix();rv.setMatrixAt(n++,dm.matrix);}});inside.add(rv);}
  // the gun's breech, its guard and cradle (they rise and fall with the gun and run back when it fires)
  breech.position.set(TRUN.x,TRUN.y,-1.3);inside.add(breech);breech.add(breechSlide);
  add(new T.BoxGeometry(.62,.56,.34).translate(0,0,.17),olive,breech);add(new T.CylinderGeometry(.3,.3,.1,32).rotateX(Math.PI/2).translate(0,0,.36),steel,breech);
  add(new T.CylinderGeometry(.16,.18,.5,32).rotateX(Math.PI/2).translate(0,0,.66),bright,breechSlide);add(new T.CylinderGeometry(.215,.215,.3,32).rotateX(Math.PI/2).translate(0,0,1.02),steel,breechSlide);
  add(new T.BoxGeometry(.3,.5,.26).translate(0,0,1.02),steel,breechSlide);add(new T.TorusGeometry(.085,.012,10,28).translate(0,0,1.172),brass,breechSlide);add(new T.CircleGeometry(.075,24).translate(0,0,1.171),new T.MeshStandardMaterial({color:0x101112,metalness:.9,roughness:.3}),breechSlide);
  add(new T.BoxGeometry(.06,.28,.18).translate(.2,0,1.02),dark,breechSlide);add(new T.CylinderGeometry(.016,.016,.22,10).rotateZ(Math.PI/2).translate(.33,.06,1.02),bright,breechSlide);add(new T.SphereGeometry(.028,14,10).translate(.45,.06,1.02),rubberM,breechSlide);
  for(const sx of[-1,1]){add(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(sx*.27,.2,.3),new T.Vector3(sx*.29,.22,1.1),new T.Vector3(sx*.29,.16,1.72),new T.Vector3(sx*.29,-.2,1.78),new T.Vector3(sx*.29,-.27,1.1),new T.Vector3(sx*.27,-.25,.3)]),36,.016,8),frame,breech);
    add(new T.CylinderGeometry(.05,.05,.52,18).rotateX(Math.PI/2).translate(sx*.2,-.33,.56),bright,breech);add(new T.CylinderGeometry(.062,.062,.2,18).rotateX(Math.PI/2).translate(sx*.2,-.33,.4),steel,breech);}
  add(new T.BoxGeometry(.6,.015,.5).translate(0,-.29,1.5),steel,breech);add(new T.BoxGeometry(.03,.42,.03).translate(0,-.02,1.76),frame,breech);
  // the gunner's sight: a hooded screen on an arm, the picture the gun's own camera sends
  const sight=new T.Group();sight.position.set(HX,FLOOR+EYE-.03,HZ-.86);inside.add(sight);
  const box=(w,h,d,m,x,y,z,p)=>{const o=add(new T.BoxGeometry(w,h,d),m,p||sight);o.position.set(x,y,z);return o;};
  box(.56,.44,.2,dark,0,0,-.11);box(.5,.37,.012,rubberM,0,0,-.006);const scr=add(new T.PlaneGeometry(.46,.345),monitorMat,sight);scr.position.z=.002;
  box(.58,.03,.16,dark,0,.235,.07);box(.03,.44,.14,dark,-.29,0,.06);box(.03,.44,.14,dark,.29,0,.06);box(.3,.05,.05,pad,0,.2,.15);
  for(let i=0;i<5;i++){box(.034,.022,.012,olive,-.21+i*.105,-.2,.004);const led=add(new T.CircleGeometry(.004,8),new T.MeshBasicMaterial({color:i===1?new T.Color(.3,2.4,.5):new T.Color(1.6,.9,.2)}),sight);led.position.set(-.21+i*.105,-.183,.012);}
  box(.05,.05,.5,steel,.2,.3,-.2).rotation.x=.5;box(.05,.05,.5,steel,-.2,.3,-.2).rotation.x=.5;
  const rc=cnv(640,480),g=rc.getContext('2d');g.strokeStyle='rgba(8,8,6,.9)';g.fillStyle='rgba(8,8,6,.9)';g.lineWidth=2;
  g.beginPath();g.moveTo(120,240);g.lineTo(295,240);g.moveTo(345,240);g.lineTo(520,240);g.moveTo(320,75);g.lineTo(320,215);g.stroke();
  g.lineWidth=1;g.beginPath();g.moveTo(320,248);g.lineTo(320,375);g.stroke();g.font='600 15px monospace';g.textBaseline='middle';
  [[2,14.8],[4,29.5],[6,44.3]].forEach(([n,y])=>{g.fillRect(298,240+y-1,44,2);g.fillText(String(n),352,240+y);});
  const vg=g.createRadialGradient(320,240,215,320,240,315);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.9)');g.fillStyle=vg;g.fillRect(0,0,640,480);
  add(new T.PlaneGeometry(.46,.345),new T.MeshBasicMaterial({map:ctex(rc),transparent:true,toneMapped:false,depthWrite:false}),sight).position.z=.004;
  // the commander's panel on the right: armour, gun, rounds, the plot
  const mfd=new T.Group();mfd.position.set(1.16,FLOOR+EYE-.12,HZ-.62);mfd.rotation.y=-1.02;inside.add(mfd);
  box(.44,.3,.1,dark,0,0,-.055,mfd);box(.4,.26,.01,rubberM,0,0,-.004,mfd);add(new T.PlaneGeometry(.37,.231),new T.MeshBasicMaterial({map:statT,toneMapped:false}),mfd).position.z=.003;
  for(let i=0;i<4;i++)box(.022,.03,.012,olive,-.205,.09-i*.06,.004,mfd);
  // real kit: the seat, the consoles, the switch box, the radio, a crew helmet, the ready rounds, pipes, the lamp
  const dress=(src,x,y,z,ry,f,s=1)=>{const o=src.clone();o.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.envMapIntensity=.2;if(f)f(m.material);}});o.position.set(x,y,z);o.rotation.y=ry;o.scale.setScalar(s);inside.add(o);return o;};
  dress(M.seat,HX,FLOOR-.02,HZ+.1,Math.PI,m=>{m.color.multiplyScalar(.75);});
  dress(M.console,HX+.02,FLOOR-.3,HZ-1.42,0,m=>{m.color.setRGB(.62,.7,.6);},.86);
  const cov=add(new T.PlaneGeometry(.25,.225),new T.MeshBasicMaterial({map:fcsT,toneMapped:false}));cov.position.set(HX-.2,FLOOR+.582,HZ-1.293);cov.rotation.x=-.21;
  dress(M.display,1.27,FLOOR+EYE+.02,HZ+.12,-Math.PI/2,m=>{m.color.setRGB(.5,.54,.46);},.9);
  dress(M.switchbox,1.3,FLOOR+.7,HZ+.75,-Math.PI/2,m=>{m.color.multiplyScalar(.8);});
  box(.9,.03,.34,olive,.25,FLOOR+.86,1.32,inside);dress(M.radio,.42,FLOOR+.875,1.3,Math.PI,null);dress(M.helmet,-.1,FLOOR+.875,1.3,2.6,null);
  dress(M.ammobox,-.5,FLOOR+.875,1.3,1.2,null,1.6);dress(M.ammobox,-.6,FLOOR,-.55,.3,null,2.2);dress(M.ammobox,-.85,FLOOR,-.8,-.5,null,2.2);
  {const pr=[[0,0],[.058,0],[.062,.012],[.06,.02],[.06,.5],[.056,.56],[.052,.6]],pj=[[.052,.6],[.058,.61],[.058,.66],[.052,.67],[.05,.82],[.03,.97],[.008,1.04],[0,1.045]];
   const cg=new T.LatheGeometry(pr.map(p=>new T.Vector2(p[0],p[1])),20).rotateZ(-Math.PI/2),pg=new T.LatheGeometry(pj.map(p=>new T.Vector2(p[0],p[1])),20).rotateZ(-Math.PI/2),pm=new T.MeshStandardMaterial({color:0x1c1f1c,metalness:.6,roughness:.45,envMapIntensity:.5});
   const n=10,ci=new T.InstancedMesh(cg,brass,n),pi=new T.InstancedMesh(pg,pm,n),dm=new T.Object3D();for(let k=0;k<n;k++){dm.position.set(-1.1,FLOOR+.3+(k>4?.5:0),.18+(k%5)*.19);dm.updateMatrix();ci.setMatrixAt(k,dm.matrix);pi.setMatrixAt(k,dm.matrix);}inside.add(ci,pi);
   for(const y of[.2,.7])for(const x of[-1.0,-.45])for(let k=0;k<5;k++){const c=add(new T.TorusGeometry(.068,.008,6,16,Math.PI),steel);c.position.set(x,FLOOR+y+.1,.18+k*.19);c.rotation.y=Math.PI/2;}}
  box(.72,.025,1.1,frame,-.76,FLOOR+.2,.6,inside);box(.72,.025,1.1,frame,-.76,FLOOR+.7,.6,inside);
  dress(M.pipes,-1.08,FLOOR+.95,.2,Math.PI/2,null,.4);const lamp=dress(M.sconce,-.2,CEIL-.01,.2,0,m=>{if(m.emissive)m.emissive.setRGB(.5,.38,.2);});lamp.rotation.x=Math.PI;
  for(const pts of[[[1.28,FLOOR+1.15,.2],[1.3,CEIL-.06,.3],[.9,CEIL-.03,-.4],[HX+.25,FLOOR+EYE+.3,HZ-.98]],[[1.3,FLOOR+.9,HZ+.75],[1.31,FLOOR+.5,.5],[1.2,FLOOR+.2,-.4],[.9,FLOOR+.25,-1.0]],[[.42,FLOOR+.95,1.42],[.8,FLOOR+1.2,1.46],[1.2,FLOOR+1.1,1.2],[1.3,FLOOR+.95,HZ+.8]]])
    add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),24,.011,6),rubberM);
  const L=inside.userData.L={};
  L.dome=new T.SpotLight(0xffd9ac,0,7,1.25,.6,1.6);L.dome.position.set(-.2,CEIL-.12,.2);L.dome.target.position.set(.1,FLOOR,.15);L.dome.castShadow=true;L.dome.shadow.mapSize.set(1024,1024);L.dome.shadow.camera.near=.08;L.dome.shadow.camera.far=4;L.dome.shadow.bias=-.002;L.dome.shadow.normalBias=.02;
  L.fill=new T.PointLight(0xffd0a0,0,4,2);L.fill.position.set(-.2,CEIL-.35,.2);
  L.screen=new T.PointLight(0x9fd8b8,0,2.4,2);L.screen.position.set(HX,FLOOR+EYE,HZ-.55);L.mfd=new T.PointLight(0x8fe0a8,0,1.6,2);L.mfd.position.set(1.0,FLOOR+EYE-.1,HZ-.45);
  L.alarm=new T.PointLight(0xff2a14,0,3.5,2);L.alarm.position.set(.6,CEIL-.2,-.7);
  L.day=new T.SpotLight(0xfff0dc,0,6,.5,.7,1.2);L.day.position.set(HX,CEIL+1.2,HZ);L.day.target.position.set(HX-.15,FLOOR,HZ+.2);
  inside.add(L.dome,L.dome.target,L.fill,L.screen,L.mfd,L.alarm,L.day,L.day.target);
  const beacon=add(new T.SphereGeometry(.022,12,8),new T.MeshBasicMaterial({color:0x300a06}));beacon.position.copy(L.alarm.position);L.beacon=beacon;
  inside.traverse(m=>{if(m.isMesh&&!m.material.isMeshBasicMaterial){m.castShadow=true;m.receiveShadow=true;}});

})();

const NDUST=160,dustP=new Float32Array(NDUST*3);(function(){const r=rng(13);for(let i=0;i<NDUST;i++){dustP[i*3]=(r()-.5)*2.2;dustP[i*3+1]=FLOOR+r()*1.6;dustP[i*3+2]=(r()-.5)*2.6;}})();
const dustG=new T.BufferGeometry();dustG.setAttribute('position',new T.BufferAttribute(dustP,3));dustG.boundingSphere=new T.Sphere(new T.Vector3(),6);
const dust=new T.Points(dustG,new T.PointsMaterial({color:0xffdcb0,size:.008,map:glowT,transparent:true,opacity:.45,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
inside.add(dust);
function updateDust(dt){for(let i=0;i<NDUST;i++){const j=i*3;dustP[j]+=Math.sin(time*.5+i)*dt*.02+P.shake*(Math.random()-.5)*.02;dustP[j+1]-=dt*.012;if(dustP[j+1]<FLOOR)dustP[j+1]=FLOOR+1.6;}dustG.attributes.position.needsUpdate=true;}

// ---------- head-locked layers (the headset's messages, hit flash, fade) ----------
const hudC=cnv(1024,200),hudT=ctex(hudC);
const hud=new T.Mesh(new T.PlaneGeometry(.78,.152),new T.MeshBasicMaterial({map:hudT,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
hud.position.set(0,-.2,-.9);hud.renderOrder=1002;hud.visible=false;camera.add(hud);
const vign=new T.Mesh(new T.SphereGeometry(.2,48,24),new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:T.BackSide,
  uniforms:{inner:{value:.5},amt:{value:0}},
  vertexShader:'varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform float inner,amt;varying vec3 vL;void main(){float a=acos(clamp(-normalize(vL).z,-1.0,1.0));float v=smoothstep(inner,inner+.55,a);gl_FragColor=vec4(0.25,0.02,0.0,v*amt);}'}));
vign.renderOrder=1000;vign.visible=false;camera.add(vign);
const fade=new T.Mesh(new T.SphereGeometry(.18,16,8),new T.MeshBasicMaterial({color:0,transparent:true,opacity:0,side:T.BackSide,depthTest:false,depthWrite:false}));
fade.renderOrder=1001;fade.visible=false;camera.add(fade);
let hudUntil=0,deathFade=0,blink=0;
function setHud(msg,sub='',secs=0){hudUntil=secs?time+secs:0;
  const el=$('msg');el.hidden=!msg||xrActive||state==='preview';el.firstElementChild.textContent=msg;el.lastElementChild.textContent=sub;
  const g=hudC.getContext('2d');g.clearRect(0,0,1024,200);hud.visible=!!msg&&xrActive;if(!msg)return;
  g.font='600 40px "IBM Plex Mono",monospace';const w=Math.min(1000,Math.max(g.measureText(msg).width,sub?g.measureText(sub).width*.75:0)+80);
  g.fillStyle='rgba(7,8,6,.72)';g.fillRect(512-w/2,sub?20:50,w,sub?160:100);
  g.fillStyle='#ece8dc';g.textAlign='center';g.textBaseline='middle';g.fillText(msg,512,sub?78:100,980);
  if(sub){g.font='400 30px "IBM Plex Mono",monospace';g.fillStyle='#e0b04a';g.fillText(sub,512,136,980);}hudT.needsUpdate=true;
  if(state==='play')radio();}
function applyFade(){const v=Math.max(deathFade,blink);fade.material.opacity=v;fade.visible=v>0&&xrActive;$('fade').style.opacity=xrActive?0:v;}

// ---------- flat screens: bloom and the lens ----------
const composer=new T.EffectComposer(renderer,new T.WebGLRenderTarget(innerWidth*PR,innerHeight*PR,{type:T.HalfFloatType,samples:4}));
composer.setPixelRatio(PR);composer.setSize(innerWidth,innerHeight);
const renderPass=new T.RenderPass(scene,camera);composer.addPass(renderPass);
composer.addPass(new T.UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.4,.6,.85));
const lens=new T.ShaderPass({
  uniforms:{tDiffuse:{value:null},res:{value:new T.Vector2(innerWidth*PR,innerHeight*PR)},time:{value:0},grain:{value:.028},ca:{value:.005},blur:{value:0},desat:{value:0},vig:{value:.3}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 res;uniform float time,grain,ca,blur,desat,vig;varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 toSRGB(vec3 c){c=max(c,0.0);return mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(0.0031308,c));}
  void main(){vec2 c=vUv-.5;float asp=res.x/res.y;float r=length(c*vec2(asp,1.0));
    float k=ca*r*r;vec3 col;col.r=texture2D(tDiffuse,vUv-c*k).r;col.g=texture2D(tDiffuse,vUv).g;col.b=texture2D(tDiffuse,vUv+c*k).b;
    float pb=blur*smoothstep(.12,.7,r);
    if(pb>.001){vec3 acc=col;float px=pb*7.0/res.y;for(int i=0;i<12;i++){float a=float(i)*.5236;float d=(i<6)?1.0:2.0;acc+=texture2D(tDiffuse,vUv+vec2(cos(a)/asp,sin(a))*px*d).rgb;}col=acc/13.0;}
    float l=dot(col,vec3(.2126,.7152,.0722));col=mix(col,vec3(l),desat);
    col*=1.0-vig*smoothstep(.35,1.05,r);
    col=toSRGB(col);
    col+=(hash(vUv*res+fract(time*61.0)*137.0)-.5)*grain;
    gl_FragColor=vec4(col,1.0);}`
});
composer.addPass(lens);

// ---------- sound: recordings, mixed by where your head is ----------
let ac=null;const A={buf:{},loop:{}};
const LOOPS={eng_idle:'in',eng_run:'in',turbine:'in',tracks:'in',servo:'dry',fan:'dry',hum:'dry',wind:'out',birds:'out',battle:'out',fire:'out',static:'dry'};
const SHOTS=['gun_in','gun_out','crack','gun_far','boom','boom_far','whizz','clang','rico','hatch','slam','breech','latch','thump','switch','beep'];
function initAudio(){
  if(ac){ac.resume&&ac.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{ac=new AC();}catch(e){ac=null;return;}
  A.master=ac.createGain();A.master.gain.value=.9;const comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=6;A.master.connect(comp);comp.connect(ac.destination);
  A.dry=ac.createGain();A.dry.connect(A.master);
  A.out=ac.createBiquadFilter();A.out.type='lowpass';A.out.frequency.value=420;A.outG=ac.createGain();A.out.connect(A.outG);A.outG.connect(A.master);
  A.in=ac.createBiquadFilter();A.in.type='lowpass';A.in.frequency.value=700;A.in.connect(A.master);
  const get=n=>fetch(BASE+'snd/'+n+'.mp3').then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>ac.decodeAudioData(b,ok,no))).then(b=>{A.buf[n]=b;return b;}).catch(()=>null);
  for(const[n,bus]of Object.entries(LOOPS))get(n).then(b=>{if(!b)return;const s=ac.createBufferSource();s.buffer=b;s.loop=true;const g=ac.createGain();g.gain.value=0;s.connect(g);g.connect(A[bus]);s.start(0,Math.random()*b.duration);A.loop[n]={s,g};});
  SHOTS.forEach(get);
}
function play(n,v=1,bus='dry',delay=0,rate=1){if(!ac||!A.buf[n]||v<.004)return;const s=ac.createBufferSource();s.buffer=A.buf[n];s.playbackRate.value=rate;const g=ac.createGain();g.gain.value=Math.min(1.5,v);s.connect(g);g.connect(A[bus]);s.start(ac.currentTime+delay);}
function setL(n,v,tc=.2,rate){const l=A.loop[n];if(!l)return;l.g.gain.setTargetAtTime(v,ac.currentTime,tc);if(rate)l.s.playbackRate.setTargetAtTime(rate,ac.currentTime,.25);}
let radioT=0;function radio(){if(!ac||time<radioT)return;radioT=time+1.5;play('beep',.5);const l=A.loop.static;if(l){l.g.gain.cancelScheduledValues(ac.currentTime);l.g.gain.setValueAtTime(.16,ac.currentTime+.05);l.g.gain.setTargetAtTime(0,ac.currentTime+.5,.12);}}
const outside=()=>.12+.88*P.hatch*P.hatch;

// ---------- particles, shells ----------
const parts=[];
for(let i=0;i<160;i++){const s=new T.Sprite(new T.SpriteMaterial({map:smokeT,transparent:true,depthWrite:false,fog:false}));s.visible=false;s.userData={t:1,life:1};scene.add(s);parts.push(s);}
let partI=0;
function puff(x,y,z,o){const s=parts[partI=(partI+1)%parts.length],u=s.userData,m=s.material;
  u.t=0;u.life=o.life;u.vx=o.vx||0;u.vy=o.vy||0;u.vz=o.vz||0;u.s0=o.s0;u.s1=o.s1;u.op=o.op==null?1:o.op;
  m.map=o.add?glowT:smokeT;m.blending=o.add?T.AdditiveBlending:T.NormalBlending;m.color.setRGB(o.c[0],o.c[1],o.c[2]);m.rotation=Math.random()*6;m.needsUpdate=true;
  s.position.set(x,y,z);s.scale.setScalar(o.s0);s.visible=true;}
function updateParts(dt){for(const s of parts){if(!s.visible)continue;const u=s.userData;u.t+=dt;const k=u.t/u.life;if(k>=1){s.visible=false;continue;}
  s.position.x+=u.vx*dt+dt*.9*k;s.position.y+=u.vy*dt;s.position.z+=u.vz*dt;u.vx*=1-dt*.8;u.vz*=1-dt*.8;s.scale.setScalar(lerp(u.s0,u.s1,1-(1-k)*(1-k)));s.material.opacity=u.op*(1-k)*Math.min(1,k*12);}}
function distTo(x,z){return Math.hypot(x-P.x,z-P.z);}
function explode(x,y,z,big,dirt){
  puff(x,y+.5,z,{add:true,c:[3,2,1.1],s0:big?5:2.5,s1:big?16:8,life:.16});
  for(let i=0;i<(big?10:6);i++){const a=Math.random()*6.28,v=1+Math.random()*(big?5:3);
    puff(x,y+.4,z,{c:dirt?[.3,.26,.19]:[.07,.07,.07],s0:2,s1:(big?12:7)+Math.random()*4,life:1.8+Math.random()*2.4,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:1.5+Math.random()*3.5,op:.85});}
  const d=distTo(x,z);play(d<150?'boom':'boom_far',clamp(1.3/(1+d/70),0,1.2),'out',d/340,.9+Math.random()*.2);
}
const shells=[];
const shellGeo=new T.SphereGeometry(1,8,6);
function shell(mine){const m=new T.Mesh(shellGeo,new T.MeshBasicMaterial({color:mine?new T.Color(3.2,1.8,.7):new T.Color(3.2,.9,.5),fog:false}));scene.add(m);const s={m,mine,p:m.position,v:new T.Vector3(),t:0};shells.push(s);return s;}
function dropShell(s){scene.remove(s.m);shells.splice(shells.indexOf(s),1);}

// ---------- the enemy ----------
prep(M.foe,m=>{m.envMapIntensity=.5;m.color.setRGB(.42,.44,.36);});
const wreckMats=new Map(),wreckOf=m=>{if(!wreckMats.has(m)){const w=m.clone();w.color.setRGB(.05,.05,.05);w.roughness=1;w.metalness=.1;w.envMapIntensity=.1;w.roughnessMap=w.metalnessMap=null;wreckMats.set(m,w);}return wreckMats.get(m);};
const foes=[];
function addFoe(x,z,dx,dz){
  const g=M.foe.clone(),t=g.getObjectByName('turret');scene.add(g);
  const yaw=Math.atan2(-(dx-x),-(dz-z));
  const e={g,t,x,z,y:hAt(x,z),yaw,tyaw:0,dx,dz,hp:2,state:'advance',fireT:3+Math.random()*3,shots:0,blind:0,smokeT:0,n:new T.Vector3(0,1,0)};
  placeFoe(e,1);foes.push(e);return e;
}
const qa=new T.Quaternion(),va=new T.Vector3(),vb=new T.Vector3();
function normalAt(x,z,out){return out.set(-(hAt(x+2,z)-hAt(x-2,z))/4,1,-(hAt(x,z+2)-hAt(x,z-2))/4).normalize();}
function placeFoe(e,k){e.y=hAt(e.x,e.z);e.n.lerp(normalAt(e.x,e.z,va),k).normalize();e.g.position.set(e.x,e.y,e.z);e.g.quaternion.setFromUnitVectors(UP,e.n).multiply(qa.setFromAxisAngle(UP,e.yaw));e.t.rotation.y=e.tyaw;}
function killFoe(e){e.state='dead';e.g.traverse(m=>{if(m.isMesh)m.material=wreckOf(m.material);});e.t.rotation.z=.1;e.t.position.x=.25;explode(e.x,e.y+1.5,e.z,true,false);
  for(let i=0;i<7;i++)puff(e.x,e.y+2,e.z,{add:true,c:[3,1.4,.4],s0:3,s1:9,life:.5+Math.random()*.6,vy:4+Math.random()*5,vx:(Math.random()-.5)*4,vz:(Math.random()-.5)*4});}
function foeFire(e){
  const yw=e.yaw+e.tyaw,mx=e.x-Math.sin(yw)*5,mz=e.z-Math.cos(yw)*5,my=e.y+2.2;
  const d=distTo(e.x,e.z),hullMasked=los(mx,my,mz,P.x,P.y+.75,P.z)>=0;
  let pHit=clamp(1.05-d/600,.15,.8)*(Math.abs(P.v)>2?.5:1)*(hullMasked?.35:1);if(e.shots===0)pHit=0;e.shots++;
  puff(mx,my,mz,{add:true,c:[3,2,1],s0:3,s1:9,life:.14});puff(mx,my,mz,{c:[.5,.48,.44],s0:2,s1:9,life:2.2,vy:1,op:.7});
  play('gun_far',clamp(1.1/(1+d/170),0,1),'out',d/340,.85+Math.random()*.2);
  const s=shell(false);s.p.set(mx,my,mz);s.hit=Math.random()<pHit;s.from=new T.Vector3(mx,my,mz);
  if(s.hit)s.to=new T.Vector3(P.x,P.y+2,P.z);
  else if(hullMasked&&Math.random()<.6){const t=los(mx,my,mz,P.x,P.y+.75,P.z);s.to=new T.Vector3(lerp(mx,P.x,t),0,lerp(mz,P.z,t));s.to.y=hAt(s.to.x,s.to.z);}
  else{const a=Math.random()*6.28,r=6+Math.random()*14;s.to=new T.Vector3(P.x+Math.cos(a)*r,0,P.z+Math.sin(a)*r);s.to.y=hAt(s.to.x,s.to.z);}
  s.T=s.from.distanceTo(s.to)/450;
}
let fireNear=1e9;
function updateFoes(dt){
  fireNear=1e9;
  for(const e of foes){
    if(e.state==='dead'){const d=distTo(e.x,e.z);fireNear=Math.min(fireNear,d);e.smokeT-=dt;if(e.smokeT<=0&&d<1000){e.smokeT=.28;puff(e.x+(Math.random()-.5),e.y+2,e.z+(Math.random()-.5),{c:[.04,.04,.04],s0:2.5,s1:15,life:5.5,vy:3.5,vx:1.2,op:.8});
      if(Math.random()<.5)puff(e.x,e.y+1.9,e.z,{add:true,c:[2.6,1,.3],s0:1.5,s1:3.5,life:.5,vy:2});}continue;}
    const toP=Math.atan2(-(P.x-e.x),-(P.z-e.z));
    if(e.state==='advance'){
      const dx=e.dx-e.x,dz=e.dz-e.z,d=Math.hypot(dx,dz);
      if(d<6){e.state='hold';e.blind=0;}
      else{e.yaw+=clamp(wrap(Math.atan2(-dx,-dz)-e.yaw),-.5*dt,.5*dt);e.x-=Math.sin(e.yaw)*8*dt;e.z-=Math.cos(e.yaw)*8*dt;
        if(Math.random()<dt*4)puff(e.x+Math.sin(e.yaw)*3,e.y+.4,e.z+Math.cos(e.yaw)*3,{c:[.4,.36,.28],s0:1.5,s1:8,life:2.6,vy:.8,op:.4});}
      e.tyaw+=clamp(wrap(toP-e.yaw-e.tyaw),-.5*dt,.5*dt);
    }else{
      const diff=wrap(toP-e.yaw-e.tyaw);e.tyaw+=clamp(diff,-.6*dt,.6*dt);e.fireT-=dt;
      const seen=los(e.x,e.y+2.1,e.z,P.x,P.y+2.3,P.z)<0;
      if(!seen){e.blind+=dt;if(e.blind>7){const d=Math.max(140,distTo(e.x,e.z)-90),a=Math.atan2(e.x-P.x,e.z-P.z)+(Math.random()-.5)*.5;e.dx=P.x+Math.sin(a)*d;e.dz=P.z+Math.cos(a)*d;e.state='advance';}}
      else{e.blind=0;if(e.fireT<=0&&Math.abs(diff)<.03&&state==='play'){e.fireT=6+Math.random()*3.5;foeFire(e);}}
    }
    placeFoe(e,Math.min(1,dt*3));
  }
}

// ---------- state ----------
let time=0,state='preview',xrActive=false,wave=0,waveT=0,endT=0,statT2=0,cover='';
const WAVES=[2,3,4,5];
const P={x:0,z:0,y:0,yaw:0,v:0,tyaw:0,elev:.03,aimYaw:0,aimPitch:0,armour:100,rounds:40,reload:0,shake:0,hurt:0,hatch:0,hatchOpen:false,sight:false,recoil:0,kills:0,shots:0,hits:0,n:new T.Vector3(0,1,0)};
let expo=.62;
const keys={};
let best=0;try{best=+localStorage.getItem('hulldown-best')||0;}catch(e){}
function showBest(){const el=$('best');el.hidden=!best;el.textContent='Most tanks knocked out in one battle: '+best;}
showBest();
function haptic(v,ms){const s=renderer.xr.getSession&&renderer.xr.getSession();if(!s)return;for(const src of s.inputSources){const a=src.gamepad&&src.gamepad.hapticActuators&&src.gamepad.hapticActuators[0];if(a&&a.pulse)a.pulse(v,ms).catch(()=>{});}}
const live=()=>foes.filter(e=>e.state!=='dead').length;

function reset(){
  for(const e of foes)scene.remove(e.g);foes.length=0;while(shells.length)dropShell(shells[0]);
  Object.assign(P,{x:0,z:0,yaw:0,v:0,tyaw:0,elev:.03,aimYaw:0,aimPitch:0,armour:100,rounds:40,reload:0,shake:0,hurt:0,hatch:0,hatchOpen:false,sight:false,recoil:0,kills:0,shots:0,hits:0});
  wave=0;waveT=5;endT=0;deathFade=0;expo=1.0;
}
function spawnWave(){
  const n=WAVES[wave],base=P.yaw+P.tyaw,spread=[.7,1.3,2.1,3.1][wave];
  for(let i=0;i<n;i++){const a=base+(Math.random()-.5)*2*spread,d=540+Math.random()*110,hold=300+Math.random()*120,a2=a+(Math.random()-.5)*.3;
    addFoe(P.x-Math.sin(a)*d,P.z-Math.cos(a)*d,P.x-Math.sin(a2)*hold,P.z-Math.cos(a2)*hold);}
  setHud('Wave '+(wave+1)+' of '+WAVES.length+' · '+n+' tanks','They are on the plot. Find a crest and lay the gun.',7);
}
function beginPlay(){
  if(state==='preview'||state==='over'){reset();state='play';
    setHud(xrActive?'The screen ahead is your gunsight':'F is the gunsight. H opens the hatch.',xrActive?'Right stick lays the gun. Trigger fires. A opens the hatch.':'The mouse lays the gun. Space fires.',8);}
  syncUi();
}
function toggleHatch(){if(state!=='play')return;P.hatchOpen=!P.hatchOpen;if(P.hatchOpen)P.sight=false;play(P.hatchOpen?'hatch':'slam',.8);syncUi();}
function toggleSight(){if(state!=='play'||xrActive)return;P.sight=!P.sight;play('switch',.6);syncUi();}
function syncUi(){const flat=!xrActive&&state!=='preview'&&$('overlay').hidden;$('scope').hidden=!(flat&&P.sight);$('dot').hidden=$('gunmark').hidden=!(flat&&!P.sight&&state==='play');$('stat').hidden=!flat;}
function fire(){
  if(state!=='play'||P.reload>0)return false;
  if(P.rounds<=0){setHud('Out of rounds','',3);return false;}
  P.rounds--;P.shots++;P.reload=3.6;P.recoil=1;P.shake=Math.max(P.shake,.8);
  tank.updateMatrixWorld();muzzle.getWorldPosition(va);gunN.getWorldQuaternion(qa);vb.set(0,0,-1).applyQuaternion(qa);
  const s=shell(true);s.p.copy(va);s.v.copy(vb).multiplyScalar(450);
  puff(va.x,va.y,va.z,{add:true,c:[3.4,2.2,1.1],s0:3,s1:12,life:.13});
  for(let i=0;i<7;i++)puff(va.x+vb.x*i,va.y+vb.y*i,va.z+vb.z*i,{c:[.5,.47,.42],s0:1.5,s1:8+i,life:2+Math.random()*1.5,vx:vb.x*(7-i),vy:.8,vz:vb.z*(7-i),op:.6});
  for(let i=0;i<6;i++){const a=Math.random()*6.28;puff(P.x+Math.cos(a)*3,P.y+.3,P.z+Math.sin(a)*3,{c:[.38,.33,.25],s0:1.5,s1:7,life:2.4,vx:Math.cos(a)*3,vz:Math.sin(a)*3,vy:.6,op:.4});}
  const o=outside();play('gun_in',1.1*(1.05-o));play('gun_out',o,'out');play('crack',.8*o,'out');play('breech',.6,'dry',.9);play('thump',.5,'dry',2.0);play('latch',.5,'dry',3.2);
  haptic(1,180);return true;
}
function hurtPlayer(){
  const dmg=P.hatch>.5?34:22;P.armour=Math.max(0,P.armour-dmg);P.shake=1.4;P.hurt=1;play('clang',1);play('boom',.8);haptic(1,400);
  if(P.armour<=0){state='dead';endT=0;setHud('','');return;}
  setHud('Hit · armour '+P.armour+'%',P.hatch>.5?'You were head out. Close the hatch under fire.':cover==='EXPOSED'?'Your hull is showing. Back down behind a crest.':'',4);
}
function updateShells(dt){
  for(let i=shells.length-1;i>=0;i--){const s=shells[i];s.t+=dt;
    if(!s.mine){const k=s.t/s.T;if(k>=1){dropShell(s);
        if(s.hit&&state==='play'){explode(s.to.x,s.to.y,s.to.z,false,false);hurtPlayer();}
        else{explode(s.to.x,s.to.y,s.to.z,false,true);const d=distTo(s.to.x,s.to.z);if(d<26&&state==='play'){P.shake=Math.max(P.shake,.5);haptic(.4,120);}}
        continue;}
      if(!s.whizz&&k>.55&&state==='play'){s.whizz=1;play('whizz',.7,'out',0,1.2);}
      s.p.lerpVectors(s.from,s.to,k);s.p.y+=Math.sin(k*Math.PI)*s.T*s.T*1.2;}
    else{let gone=false;const steps=Math.max(1,Math.ceil(450*dt/2.5)),h=dt/steps;
      for(let n=0;n<steps&&!gone;n++){s.v.y-=9.8*h;s.p.addScaledVector(s.v,h);
        for(const e of foes){if(e.state==='dead')continue;const dx=s.p.x-e.x,dz=s.p.z-e.z,dy=s.p.y-(e.y+1.3);
          if(dx*dx+dz*dz<7.3&&Math.abs(dy)<1.5){const side=(-Math.sin(e.yaw)*s.v.x-Math.cos(e.yaw)*s.v.z)/Math.hypot(s.v.x,s.v.z)>-.5;
            e.hp-=side?2:1;P.hits++;gone=true;
            if(e.hp<=0){killFoe(e);P.kills++;setHud('Target destroyed',live()?live()+' left':'',3);}
            else{explode(s.p.x,s.p.y,s.p.z,false,false);play('rico',.5,'out',distTo(e.x,e.z)/340);e.fireT=Math.max(e.fireT,2.5);setHud('Hit','Front armour held. Hit it again.',3);}
            break;}}
        if(!gone&&s.p.y<hAt(s.p.x,s.p.z)){explode(s.p.x,s.p.y,s.p.z,false,true);gone=true;}
        if(!gone&&s.t>6)gone=true;}
      if(gone){dropShell(s);continue;}}
    s.m.scale.setScalar(Math.max(.1,distTo(s.p.x,s.p.z)*.0035));
  }
}

function updateTank(dt){
  const play_=state==='play';
  let thr=0,steer=0,trav=0,elv=0;
  if(play_){
    if(!xrActive){thr=(keys.KeyW?1:0)-(keys.KeyS?1:0);steer=(keys.KeyA?1:0)-(keys.KeyD?1:0);
      const ks=(P.sight?.12:.9)*dt;P.aimYaw+=((keys.ArrowLeft||keys.KeyQ?1:0)-(keys.ArrowRight||keys.KeyE?1:0))*ks;P.aimPitch=clamp(P.aimPitch+((keys.ArrowUp?1:0)-(keys.ArrowDown?1:0))*ks,-1.2,1.2);}
    else{thr=xr.thr;steer=xr.steer;trav=xr.trav;elv=xr.elv;}
  }
  P.thr=thr;
  const vT=thr>0?9*thr:4*thr;P.v+=clamp(vT-P.v,-6*dt,(Math.abs(vT)>Math.abs(P.v)?3:6)*dt);
  P.yaw+=steer*.5*dt*(P.v<-.5?-1:1);
  let nx=P.x-Math.sin(P.yaw)*P.v*dt,nz=P.z-Math.cos(P.yaw)*P.v*dt;const r=Math.hypot(nx,nz);
  if(r>640){nx*=640/r;nz*=640/r;P.v*=.5;if(play_&&!hudUntil)setHud('Edge of the sector','Turn back.',3);}
  P.x=nx;P.z=nz;
  const bump=Math.abs(P.v)*.004*Math.sin(time*13);
  P.y=lerp(P.y,hAt(P.x,P.z),Math.min(1,dt*8))+bump*dt*8;
  const level=xrActive&&$('levelToggle').checked;
  if(level)P.n.lerp(UP,Math.min(1,dt*3)).normalize();else P.n.lerp(normalAt(P.x,P.z,va),Math.min(1,dt*2.5)).normalize();
  tank.position.set(P.x,P.y,P.z);tank.quaternion.setFromUnitVectors(UP,P.n).multiply(qa.setFromAxisAngle(UP,P.yaw));
  const before=P.tyaw;
  if(xrActive){P.tyaw=wrap(P.tyaw-trav*.55*dt);P.elev=clamp(P.elev+elv*.22*dt,-.14,.32);}
  else if(play_||state==='preview'){P.tyaw=wrap(P.tyaw+clamp(wrap(P.aimYaw-P.yaw-P.tyaw),-.6*dt,.6*dt));P.elev=toward(P.elev,clamp(P.aimPitch,-.14,.32),.25*dt);}
  P.turning=Math.abs(wrap(P.tyaw-before))/Math.max(dt,1e-3);
  turret.rotation.y=P.tyaw;gunN.rotation.x=P.elev;breech.rotation.x=P.elev;
  P.recoil=Math.max(0,P.recoil-dt*(P.recoil>.6?9:1.4));const rc=.4*Math.sin(Math.min(1,P.recoil)*Math.PI*.5);gunN.position.set(TRUN.x,TRUN.y,TRUN.z+rc);breechSlide.position.z=rc;
  if(P.reload>0){P.reload-=dt;if(P.reload<=0){P.reload=0;play('switch',.5);haptic(.3,60);}}
  P.hatch=toward(P.hatch,P.hatchOpen?1:0,dt/1.2);
  hatchLid.rotation.x=clamp(P.hatch*2.2,0,1)*1.9;hatchLid.userData.hole.visible=P.hatch>.02;
  const up=LIFT*smooth(clamp((P.hatch-.3)/.7,0,1));
  rig.position.set(SEAT.x+xr.cx,SEAT.y+up,SEAT.z+xr.cz);
  const headY=FLOOR+up+(xrActive?camera.position.y:CAMH);P.headIn=headY<ROOF+.05;blink=clamp(1-Math.abs(headY-(ROOF+.05))/.13,0,1);
  P.shake=Math.max(0,P.shake-dt*2.2);P.hurt=Math.max(0,P.hurt-dt*.6);
  if(Math.abs(P.v)>2&&Math.random()<dt*7)puff(P.x+Math.sin(P.yaw)*4+(Math.random()-.5)*3,P.y+.3,P.z+Math.cos(P.yaw)*4,{c:[.4,.36,.28],s0:1.2,s1:7,life:2.4,vy:.7,op:.4});
  if(Math.random()<dt*(4+Math.abs(P.thr)*10))puff(P.x+Math.sin(P.yaw)*4.2,P.y+1.5,P.z+Math.cos(P.yaw)*4.2,{c:[.12,.12,.12],s0:.5,s1:2.5,life:1.2,vy:1.6,op:.25+Math.abs(P.thr)*.3});
  sunL.target.position.set(P.x,P.y,P.z);sunL.position.copy(sunL.target.position).addScaledVector(SUN,160);
}

function updateGame(dt){
  if(hudUntil&&time>hudUntil)setHud('');
  if(state==='play'){
    if(!live()){
      if(wave>=WAVES.length&&foes.length){state='over';endT=0;best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();
        setHud('Sector held · '+P.kills+' tanks',P.shots+' rounds fired, '+P.hits+' hits. Fire to fight again.',0);}
      else{waveT-=dt;if(waveT<=0){spawnWave();wave++;waveT=7;}}
    }
  }else if(state==='dead'){
    endT+=dt;deathFade=clamp(endT/1.6,0,1);
    if(endT>2.4){best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();const k=P.kills,w=wave;reset();state='over';
      setHud('Knocked out on wave '+w+' · '+k+' tanks','Fire to fight again.',0);}
  }
  statT2-=dt;if(statT2<=0){statT2=.2;drawStat();}
}
function drawStat(){
  let seen=0,masked=0;
  for(const e of foes){if(e.state==='dead')continue;if(los(e.x,e.y+2,e.z,P.x,P.y+2.3,P.z)<0){seen++;if(los(e.x,e.y+2,e.z,P.x,P.y+.75,P.z)>=0)masked++;}}
  cover=!live()?'':!seen?'IN DEFILADE':masked===seen?'HULL DOWN':'EXPOSED';
  const g=statC.getContext('2d');g.setTransform(1.6,0,0,1.6,0,0);g.clearRect(0,0,320,200);g.fillStyle='rgba(5,9,6,.92)';g.fillRect(0,0,320,200);
  g.font='600 15px "IBM Plex Mono",monospace';g.textBaseline='middle';g.textAlign='left';g.fillStyle='#8fa08c';g.fillText('ARMOUR',12,22);g.fillText('GUN',12,58);g.fillText('ROUNDS',12,94);g.fillText('WAVE',12,124);
  g.fillStyle='#1c241c';g.fillRect(84,14,92,16);g.fillRect(84,50,92,16);
  g.fillStyle=P.armour>50?'#e0b04a':'#ff5a3c';g.fillRect(84,14,92*P.armour/100,16);
  g.fillStyle=P.reload>0?'#8a8474':'#b9d36a';g.fillRect(84,50,92*(1-P.reload/3.6),16);
  g.fillStyle='#dfe8d8';g.fillText(String(P.rounds),84,94);g.fillText(Math.max(1,wave)+'/'+WAVES.length+' · '+live()+' LEFT',84,124);
  if(cover){g.fillStyle=cover==='EXPOSED'?'#ff5a3c':'#b9d36a';g.fillRect(12,150,164,34);g.fillStyle='#10120c';g.textAlign='center';g.fillText(cover,94,168);}
  const cx=248,cy=100,R=58;g.strokeStyle='rgba(190,230,190,.4)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();g.beginPath();g.arc(cx,cy,R/2,0,7);g.stroke();
  g.strokeStyle='#e0b04a';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-R);g.stroke();
  const hy=-P.tyaw;g.strokeStyle='rgba(220,235,215,.7)';g.strokeRect(cx-4,cy-6,8,12);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-Math.sin(hy)*14,cy-Math.cos(hy)*14);g.stroke();
  for(const e of foes){const rel=wrap(Math.atan2(-(e.x-P.x),-(e.z-P.z))-P.yaw-P.tyaw),d=Math.min(1,distTo(e.x,e.z)/700)*R;
    g.fillStyle=e.state==='dead'?'rgba(160,154,140,.5)':'#ff5a3c';g.beginPath();g.arc(cx-Math.sin(rel)*d,cy-Math.cos(rel)*d,e.state==='dead'?2.5:4,0,7);g.fill();}
  statT.needsUpdate=true;
  const f=fcsC.getContext('2d');f.fillStyle='#030a05';f.fillRect(0,0,256,192);f.fillStyle='#4fe08a';f.font='600 22px monospace';f.textBaseline='top';
  ['FCS  '+(P.reload>0?'LOADING':'READY'),'TRV  '+String(Math.round((((-P.tyaw*180/Math.PI)%360)+360)%360)).padStart(3,'0'),'ELV '+(P.elev>=0?'+':'-')+Math.abs(P.elev*180/Math.PI).toFixed(1),'RDS  '+P.rounds,'SPD  '+Math.abs(P.v*3.6).toFixed(0)+' KPH'].forEach((s,i)=>f.fillText(s,14,14+i*34));fcsT.needsUpdate=true;
}

// ---------- seeing: eye adaptation, hit effects ----------
function updateVision(dt){
  const fx=$('fxToggle').checked,out=!P.headIn,dmg=1-P.armour/100;
  const tgtE=state==='preview'||out||(P.sight&&!xrActive)?.62:lerp(1.05,.85,P.hatch);
  expo=Math.exp(lerp(Math.log(expo),Math.log(tgtE),1-Math.exp(-dt/(P.sight&&!xrActive?.3:1.5))));
  renderer.toneMappingExposure=expo*(1+P.recoil*.25);
  monitorMat.color.setScalar(.7/expo*(.96+.04*Math.sin(time*37)));
  vign.visible=xrActive&&fx&&P.hurt>.01;vign.material.uniforms.amt.value=P.hurt*.8;
  const u=lens.uniforms;u.time.value=time;u.blur.value=fx?P.hurt*.7+P.shake*.12:0;u.ca.value=.004+(fx?P.hurt*.02+dmg*.005:0);u.desat.value=fx?dmg*.35+P.hurt*.3:0;u.vig.value=.28+(fx?P.hurt*.3:0);
  applyFade();
}

// ---------- input ----------
const isTouch=matchMedia('(pointer:coarse)').matches;
addEventListener('keydown',e=>{if(state==='play'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;keys[e.code]=true;
  if($('overlay').hidden&&!xrActive){if(e.code==='Space')trigger();if(e.code==='KeyF')toggleSight();if(e.code==='KeyH')toggleHatch();}});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
$('pad').querySelectorAll('button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();e.stopPropagation();keys[k]=true;};const off=e=>{e.stopPropagation();keys[k]=false;};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);});
$('fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();trigger();});$('sightBtn').addEventListener('click',toggleSight);$('hatchBtn').addEventListener('click',toggleHatch);
function trigger(){if(state==='over'){state='preview';beginPlay();return;}fire();}
function aimBy(dx,dy,touch){const s=(touch?.006:.0028)*(P.sight?.14:1);P.aimYaw-=dx*s;P.aimPitch=clamp(P.aimPitch-dy*s,-1.2,1.2);}
let drag=null;
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(xrActive)return;
  if(e.pointerType==='mouse'){if(e.button===2){toggleSight();return;}if(document.pointerLockElement===canvas){trigger();return;}if(canvas.requestPointerLock&&state!=='preview'){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(err){}}}
  drag={x:e.clientX,y:e.clientY,id:e.pointerId};try{canvas.setPointerCapture(e.pointerId);}catch(err){}});
canvas.addEventListener('pointermove',e=>{if(xrActive||state==='preview')return;
  if(document.pointerLockElement===canvas)aimBy(e.movementX,e.movementY,false);
  else if(drag&&drag.id===e.pointerId){aimBy(e.clientX-drag.x,e.clientY-drag.y,e.pointerType==='touch');drag.x=e.clientX;drag.y=e.clientY;}});
canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});

const mark=new T.Vector3();
function updateFlat(dt){
  if(xrActive)return;
  if(state==='preview'){P.hatchOpen=true;P.aimYaw=.5*Math.sin(time*.07);P.aimPitch=-.02;}
  const sh=$('fxToggle').checked?P.shake:0;
  camera.position.set((Math.random()-.5)*.03*sh,CAMH+(Math.random()-.5)*.03*sh+Math.sin(time*1.3)*.003,0);
  camera.rotation.set(P.aimPitch+(Math.random()-.5)*.012*sh,wrap(P.aimYaw-P.yaw-P.tyaw),0);
  const fov=state==='preview'?60:72;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  if(!$('gunmark').hidden){tank.updateMatrixWorld();gunN.getWorldQuaternion(qa);muzzle.getWorldPosition(mark).add(vb.set(0,0,-400).applyQuaternion(qa));camera.updateMatrixWorld();mark.project(camera);
    const el=$('gunmark');el.style.display=mark.z<1?'':'none';el.style.left=(mark.x*.5+.5)*100+'%';el.style.top=(-mark.y*.5+.5)*100+'%';}
}

// headset
const xr={thr:0,steer:0,trav:0,elv:0,cx:0,cz:0,centre:0,held:{}};
[0,1].forEach(i=>{const c=renderer.xr.getController(i);c.add(new T.Mesh(new T.BoxGeometry(.035,.035,.13),new T.MeshStandardMaterial({color:0x2c2e2a,roughness:.5})));rig.add(c);});
function updateXR(dt){
  xr.thr=xr.steer=xr.trav=xr.elv=0;if(!xrActive)return;
  const s=renderer.xr.getSession();if(!s)return;
  if(xr.centre>0&&camera.position.y>.3&&--xr.centre===0){xr.cx-=camera.position.x;xr.cz-=camera.position.z;}
  const dz=v=>Math.abs(v)>.15?v:0;
  for(const src of s.inputSources){const gp=src.gamepad;if(!gp)continue;const h=src.handedness,ax=dz(gp.axes[2]||0),ay=dz(gp.axes[3]||0);
    if(h==='left'){xr.thr=-ay;xr.steer=-ax;}else{xr.trav=ax;xr.elv=-ay;}
    const edge=(n,fn)=>{const on=!!(gp.buttons[n]&&gp.buttons[n].pressed),k=h+n;if(on&&!xr.held[k])fn();xr.held[k]=on;};
    edge(0,trigger);edge(4,toggleHatch);edge(3,()=>{xr.cx=xr.cz=0;xr.centre=1;});}
}

// ---------- sound mix ----------
function updateAudio(dt){
  if(!ac)return;const sp=Math.abs(P.v)/9,th=Math.abs(P.thr||0),o=outside(),on=state==='preview'?.5:1;
  A.out.frequency.setTargetAtTime(420+17000*P.hatch*P.hatch,ac.currentTime,.12);A.outG.gain.setTargetAtTime(.35+.65*o,ac.currentTime,.15);
  A.in.frequency.setTargetAtTime(650+9000*P.hatch*P.hatch,ac.currentTime,.15);
  setL('eng_idle',(.5-.3*sp)*on,.3,.8+th*.25+sp*.15);setL('eng_run',(.1+sp*.55+th*.2)*on,.3,.85+sp*.3);setL('turbine',(.06+th*.1+sp*.08)*on,.4,.8+sp*.35+th*.2);
  setL('tracks',sp*.5,.2,.75+sp*.5);setL('servo',clamp((P.turning||0)*1.6,0,.34),.06,.8+clamp(P.turning||0,0,.6)*.6);
  setL('fan',.2*(1-.75*P.hatch),.4);setL('hum',.3*(1-.8*P.hatch),.4);
  setL('wind',.25+.3*sp,.5);setL('birds',.3*(1-sp*.5),.6);setL('battle',live()?.22:.07,1.5);setL('fire',clamp(1.2/(1+fireNear/25),0,.9),.5);
}

// ---------- loop ----------
const clock=new T.Clock(),headW=new T.Vector3();let frameN=0;
function frame(){
  const dt=Math.min(clock.getDelta(),.05);time+=dt;frameN++;
  updateXR(dt);updateTank(dt);updateFlat(dt);updateFoes(dt);updateShells(dt);updateGame(dt);updateParts(dt);updateDust(dt);updateVision(dt);updateAudio(dt);
  tank.updateMatrixWorld();camera.getWorldPosition(headW);sky.position.copy(headW);sunGlow.position.copy(headW).addScaledVector(SUN,3000);
  const vr=renderer.xr.isPresenting,flatSight=!vr&&P.sight&&state==='play',inNow=P.headIn&&!flatSight,L=inside.userData.L;
  const lights=inn=>{sunL.intensity=inn?0:3.3;sunL.castShadow=!inn;hemiL.intensity=inn?.02:.55;scene.environment=ENV;
    const fl=P.shake>.05?.55+.45*Math.sin(time*90)*Math.sin(time*37):1,pw=inn?(P.power==null?1:P.power)*fl:0,low=P.armour<40?1:0;
    L.dome.intensity=pw*2.1*(1-.6*low);L.dome.castShadow=inn;L.fill.intensity=pw*.16;L.screen.intensity=inn?.5+.1*Math.sin(time*23):0;L.mfd.intensity=inn?.3:0;
    L.alarm.intensity=inn?(P.hurt>.02?2.4*P.hurt:0)+low*1.6*(.5+.5*Math.sin(time*7)):0;L.beacon.material.color.setRGB(.2+L.alarm.intensity,.04,.03);L.day.intensity=inn?P.hatch*5:0;};
  if(inNow&&state!=='preview'&&(!vr||frameN&1)){
    inside.visible=false;ext.visible=turN.visible=true;lights(false);
    const prev=renderer.getRenderTarget(),xe=renderer.xr.enabled;renderer.xr.enabled=false;
    gunCam.aspect=4/3;gunCam.updateProjectionMatrix();renderer.setRenderTarget(sightRT);renderer.render(scene,gunCam);
    renderer.setRenderTarget(prev);renderer.xr.enabled=xe;}
  inside.visible=inNow;ext.visible=turN.visible=!inNow;hatchLid.visible=!inNow;lights(inNow);
  if(vr)renderer.render(scene,camera);
  else{if(flatSight){gunCam.aspect=innerWidth/innerHeight;gunCam.updateProjectionMatrix();}renderPass.camera=flatSight?gunCam:camera;composer.render(dt);}
}

addEventListener('resize',()=>{if(xrActive)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);lens.uniforms.res.value.set(innerWidth*PR,innerHeight*PR);});

// ---------- menu ----------
const overlay=$('overlay'),vrBtn=$('vrBtn'),flatBtn=$('flatBtn'),vrNote=$('vrNote'),menuBtn=$('menuBtn');
$('stat').appendChild(statC);
function hideMenu(){overlay.hidden=true;menuBtn.hidden=xrActive;$('pad').hidden=$('acts').hidden=!(isTouch&&!xrActive);}
function showMenu(){overlay.hidden=false;menuBtn.hidden=true;$('pad').hidden=$('acts').hidden=true;for(const k in keys)keys[k]=false;if(document.exitPointerLock)document.exitPointerLock();syncUi();$('msg').hidden=true;}
flatBtn.addEventListener('click',()=>{initAudio();xrActive=false;hideMenu();if(state==='preview'){P.hatchOpen=false;P.hatch=0;P.aimYaw=P.yaw+P.tyaw;}beginPlay();flatBtn.textContent='Resume';});
menuBtn.addEventListener('click',showMenu);
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
    xrActive=true;camera.position.set(0,0,0);camera.rotation.set(0,0,0);camera.fov=72;xr.cx=xr.cz=0;xr.centre=20;
    if(state==='preview'){P.hatchOpen=false;P.hatch=0;}
    hideMenu();beginPlay();
    session.addEventListener('end',()=>{xrActive=false;xr.cx=xr.cz=0;hud.visible=false;showMenu();
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);vrBtn.textContent='Re-enter VR';});
  }catch(e){vrNote.textContent='Couldn’t start VR here ('+(e&&e.message?e.message:'blocked')+'). Open the page’s link directly in your headset’s browser.';}
});

P.y=hAt(0,0);P.hatch=1;P.hatchOpen=true;
drawStat();renderer.setAnimationLoop(frame);
$('loading').hidden=true;
if(document.fonts&&document.fonts.load)document.fonts.load('600 40px "IBM Plex Mono"').then(drawStat).catch(()=>{});

window.game={get time(){return time;},get state(){return state;},get wave(){return wave;},get cover(){return cover;},get xr(){return xrActive;},get expo(){return expo;},P,foes,shells,WAVES,ROOF,FLOOR,hAt,los,tank,inside,fire,trigger,toggleHatch,toggleSight,addFoe,live,renderer,camera,rig,sounds:A,
  skip(){waveT=0;},kill(e){killFoe(e);P.kills++;}};
})();
