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
const PR=Math.min(window.devicePixelRatio||1,1.5);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=.4;
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
const model=n=>count(new Promise((ok,no)=>gltfL.load(BASE+'m/'+n+'.glb',g=>{g.scene.userData.clips=g.animations;ok(g.scene);},null,()=>no(new Error('model '+n)))));
const jget=f=>count(fetch(BASE+f).then(r=>r.json()));
const TREES=['island_tree_01','island_tree_02','island_tree_03','tree_small_02','jacaranda_tree','shrub_02'];
let A0;
try{
  const names=['hero','ally','foe','seat','console','display','switchbox','radio','helmet','barn','cars','pipes','sconce','ammobox','rocks','h6','row','h9','shop','cork','flats','white','cottage','villa','mill','works','church','watertower','silos','stacks','mast','pylon','pole','stonewall','lamp','hay','brokenwall','rubble','trabant','lada','van','tractor','truck','busstop','binos','hand_l','hand_r','crag','deadtree','sandbags','hedgehog','wreck','grenade','pistol','soldier','breech'];
  const[sky,skyS,SKY,TREEJ,MODJ,grass,dry,soil,plate,paint,leather,cards,models]=await Promise.all([
    count(new Promise((ok,no)=>texL.load(BASE+'sky/sky.jpg',ok,null,()=>no(new Error('sky'))))),count(new Promise((ok,no)=>texL.load(BASE+'sky/sky_s.jpg',ok,null,()=>no(new Error('sky'))))),jget('sky/sky.json'),jget('trees.json'),jget('models.json'),
    pbr('leafy_grass',1),tex('sparse_grass_d.jpg',{srgb:1}),pbr('farm_soil',1),pbr('metal_plate',1),pbr('green_metal_rust',1),pbr('fabric_leather_02',1),
    Promise.all(TREES.map(n=>Promise.all([0,1].map(v=>Promise.all([tex(n+'_'+v+'_d.webp',{srgb:1,clamp:1})]))))),
    Promise.all(names.map(model))]);
  A0={sky,skyS,SKY,TREEJ,MODJ,grass,dry,soil,plate,paint,leather,cards,M:Object.fromEntries(names.map((n,i)=>[n,models[i]]))};
}catch(e){$('loading').textContent='Could not load the game’s files ('+e.message+'). Reload to try again.';return;}
const{SKY,TREEJ,MODJ}=A0,M=A0.M;

// ---------- sky + sun ----------
const sunPhi=SKY.u*Math.PI*2,SUN=new T.Vector3(-Math.cos(sunPhi)*Math.cos(SKY.el),Math.sin(SKY.el),Math.sin(sunPhi)*Math.cos(SKY.el)).normalize();
const FOG=new T.Color(lin(SKY.hor[0]),lin(SKY.hor[1]),lin(SKY.hor[2])).multiplyScalar(1.05).lerp(new T.Color(.2,.23,.27),.3),SUNHAZE=new T.Color(lin(SKY.sunhor[0]),lin(SKY.sunhor[1]),lin(SKY.sunhor[2])).multiplyScalar(2.9);
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
    const float FA=0.0019;const float FB=0.0105;
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
const sky=new T.Mesh(new T.SphereGeometry(5000,48,18,0,Math.PI*2,0,Math.PI*SKY.cut),new T.MeshBasicMaterial({map:A0.sky,side:T.BackSide,fog:false,depthWrite:false,color:new T.Color(1.3,1.24,1.22)}));
sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
A0.skyS.encoding=T.sRGBEncoding;A0.skyS.mapping=T.EquirectangularReflectionMapping;
const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(A0.skyS).texture;

const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,.06,9000);
camera.rotation.order='YXZ';
const rig=new T.Group();rig.add(camera);

const sunL=new T.DirectionalLight(0xffc48a,3.4);
sunL.castShadow=true;sunL.shadow.mapSize.set(1024,1024);sunL.shadow.autoUpdate=false;
const shc=sunL.shadow.camera;shc.left=-26;shc.right=26;shc.top=26;shc.bottom=-26;shc.near=1;shc.far=400;
sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.06;
scene.add(sunL,sunL.target);
const hemiL=new T.HemisphereLight(0x8ea4c6,0x40382c,.5);scene.add(hemiL);const ENV=scene.environment;

function glowCanvas(soft){const c=cnv(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(soft?.08:.22,'rgba(255,255,255,'+(soft?.5:.75)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c;}
function smokeCanvas(){const c=cnv(128,128),g=c.getContext('2d'),r=rng(4);for(let i=0;i<34;i++){const x=38+r()*52,y=38+r()*52,rad=12+r()*26,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(255,255,255,.2)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}return c;}
const ctex=c=>{const t=new T.CanvasTexture(c);t.anisotropy=maxAniso;return t;};
const glowT=ctex(glowCanvas(false)),softT=ctex(glowCanvas(true)),smokeT=ctex(smokeCanvas());
const sunGlow=new T.Sprite(new T.SpriteMaterial({map:softT,color:0xffd9a8,transparent:true,opacity:.3,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));
sunGlow.scale.setScalar(2200);sunGlow.material.opacity=.42;scene.add(sunGlow);

// ---------- the land ----------
const hsh=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
function vn(x,z){const xi=Math.floor(x),zi=Math.floor(z),u=smooth(x-xi),v=smooth(z-zi);return lerp(lerp(hsh(xi,zi),hsh(xi+1,zi),u),lerp(hsh(xi,zi+1),hsh(xi+1,zi+1),u),v);}
function fbm(x,z,o){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vn(x*f,z*f);a*=.5;f*=2.03;}return s;}
const SITES=[[150,300,120,230,0],[-480,-640,70,170,0],[420,-560,55,150,0],[0,0,14,60,0]],ROAD=[[150,300],[60,120],[-120,-150],[-330,-420],[-480,-640]];
function h0(x,z){let h=hRaw(x,z);const pd=pondAt(x,z);if(pd){const d=Math.hypot(x-pd[0],z-pd[1])/pd[2];h=d<1?pd[3]-2.4*(1-d*d)-.2:lerp(pd[3]-.2,h,smooth(clamp((d-1)/.7,0,1)));}for(const s of SITES){const d=Math.hypot(x-s[0],z-s[1]);if(d<s[3])h=lerp(h,s[4],1-smooth(clamp((d-s[2])/(s[3]-s[2]),0,1)));}return h;}
function roadDist(x,z){let m=1e9;for(let i=0;i<ROAD.length-1;i++){const a=ROAD[i],b=ROAD[i+1],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);m=Math.min(m,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return m;}
const PONDS=[[-70,-190,34,0],[235,-125,28,0],[-300,-70,40,0],[335,-300,30,0],[95,-345,26,0],[-175,175,32,0],[300,130,30,0]];
function pondAt(x,z){for(const p of PONDS)if(Math.hypot(x-p[0],z-p[1])<p[2]*1.7)return p;return null;}
function hRaw(x,z){const r=Math.hypot(x,z);const rd=Math.abs(fbm(x/1100+5.5,z/1100+1.5,3)-.5)*2;return 80*(fbm(x/560+3.1,z/560+7.7,4)-.46)+16*(fbm(x/140+1.3,z/140+4.2,3)-.44)+.5*(vn(x/14,z/14)-.5)+smooth(clamp((r-800)/2600,0,1))*(40+330*Math.pow(1-rd,2.2)*(.35+fbm(x/2300,z/2300,2)));}
for(const s of SITES)s[4]=hRaw(s[0],s[1]);for(const q of PONDS)q[3]=hRaw(q[0],q[1])-1.2;
const GN=170,GS=10,G0=-850,HG=new Float32Array((GN+1)*(GN+1));
for(let j=0;j<=GN;j++)for(let i=0;i<=GN;i++)HG[j*(GN+1)+i]=h0(G0+i*GS,G0+j*GS);
function hAt(x,z){if(Math.abs(x)>=-G0||Math.abs(z)>=-G0)return h0(x,z);const fx=(x-G0)/GS,fz=(z-G0)/GS,i=Math.min(GN-1,fx|0),j=Math.min(GN-1,fz|0),u=fx-i,v=fz-j,k=j*(GN+1)+i;
  return lerp(lerp(HG[k],HG[k+1],u),lerp(HG[k+GN+1],HG[k+GN+2],u),v);}
function los(ax,ay,az,bx,by,bz){const n=Math.max(8,Math.ceil(Math.hypot(bx-ax,bz-az)/7));for(let i=1;i<n;i++){const t=i/n;if(hAt(ax+(bx-ax)*t,az+(bz-az)*t)>ay+(by-ay)*t)return t;}return -1;}
// the fields: a turned grid of plots, each grass, dry stubble or ploughed soil (the land's shader draws the same grid)
const FA_=.47,FCS=Math.cos(FA_),FSN=Math.sin(FA_),FW=190,FD=140;
function field(x,z){const qx=FCS*x+FSN*z,qz=-FSN*x+FCS*z,cx=Math.floor(qx/FW),cz=Math.floor(qz/FD),r=hsh(cx*1.37+.5,cz*2.11+.25),fx=qx/FW-cx,fz=qz/FD-cz;
  return{cx,cz,r,kind:r<.4?0:r<.6?1:r<.72?2:3,edge:Math.min(Math.min(fx,1-fx)*FW,Math.min(fz,1-fz)*FD)};}
const land=new T.Group();scene.add(land);
const openAt=(x,z,m)=>roadDist(x,z)>m&&Math.hypot(x-150,z-300)>160+m&&Math.hypot(x,z)>46+m&&Math.hypot(x+480,z+640)>90+m&&Math.hypot(x-420,z+560)>70+m&&!pondAt(x,z);
// something in every field: clumps of bush, stands of trees, rock piles, great rocks, crags, fallen and dead trees, debris
const FEAT={bush:[],tree:[],rockS:[],rockB:[],crag:[],log:[],dead:[],bags:[],hog:[],wreck:[]};
(function(){const r=rng(4711);for(let cx=-6;cx<=6;cx++)for(let cz=-8;cz<=8;cz++){const n=4+Math.floor(r()*4);for(let i=0;i<n;i++){const qx=(cx+r())*FW,qz=(cz+r())*FD,x=FCS*qx-FSN*qz,z=FSN*qx+FCS*qz,t=r();if(Math.hypot(x,z)>980)continue;
    if(t<.3){if(openAt(x,z,5))for(let k=0;k<6+r()*5;k++)FEAT.bush.push([x+(r()-.5)*13,z+(r()-.5)*13]);}
    else if(t<.5){if(openAt(x,z,8))for(let k=0;k<3+r()*4;k++)FEAT.tree.push([x+(r()-.5)*26,z+(r()-.5)*26]);}
    else if(!openAt(x,z,14))continue;
    else if(t<.66)for(let k=0;k<2+r()*2;k++)FEAT.rockS.push([x+(r()-.5)*9,z+(r()-.5)*9,r()*6.28,.7+r()*1.1]);
    else if(t<.76)FEAT.rockB.push([x,z,r()*6.28,3+r()*4]);else if(t<.85)FEAT.crag.push([x,z,r()*6.28,1.1+r()*1.5]);else if(t<.91)FEAT.log.push([x,z,r()*6.28,.8+r()*.5]);else if(t<.95)FEAT.dead.push([x,z,r()*6.28,.9+r()*.6]);
    else if(t<.975)FEAT.bags.push([x,z,r()*6.28]);else if(t<.99)FEAT.hog.push([x,z,r()*6.28]);else FEAT.wreck.push([x,z,r()*6.28]);}}})();
const landMat=new T.MeshLambertMaterial({map:A0.grass.d,vertexColors:true});
landMat.onBeforeCompile=s=>{s.uniforms.tDry={value:A0.dry};s.uniforms.tSoil={value:A0.soil.d};s.uniforms.uT=landMat.userData.uT={value:0};s.uniforms.tShade=landMat.userData.tShade={value:null};s.uniforms.uShadeM=landMat.userData.uShadeM={value:new T.Matrix4()};const seg=(a,b)=>`rd=min(rd,sdS(wp,vec2(${a[0]}.,${a[1]}.),vec2(${b[0]}.,${b[1]}.)));`;
  s.fragmentShader=s.fragmentShader.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\nuniform sampler2D tDry;uniform sampler2D tSoil;uniform sampler2D tShade;uniform mat4 uShadeM;uniform float uT;\nfloat shadeAt(vec3 w){vec4 c=uShadeM*vec4(w,1.);vec3 q=c.xyz*.5+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return 1.;float s=0.;for(int i=0;i<4;i++){vec2 o=vec2(i<2?-.6:.6,mod(float(i),2.)<.5?-.6:.6)/2048.;s+=step(q.z-.0016,unpackRGBAToDepth(texture2D(tShade,q.xy+o)));}return s*.25;}\nfloat fh(vec2 p){return fract(sin(p.x*127.1+p.y*311.7)*43758.5453);}\nfloat sdS(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}\nfloat pondD(vec2 p){float m=9.;'+PONDS.map(q=>`m=min(m,(length(p-vec2(${q[0]}.,${q[1]}.))-${q[2]}.)/9.+1.);`).join('')+'return m;}')
   .replace('#include <map_fragment>',`vec2 wp=vFogWorld.xz;vec2 q=vec2(${FCS.toFixed(5)}*wp.x+${FSN.toFixed(5)}*wp.y,${(-FSN).toFixed(5)}*wp.x+${FCS.toFixed(5)}*wp.y);vec2 fs=vec2(${FW}.0,${FD}.0);vec2 cell=floor(q/fs);vec2 ff=fract(q/fs);
    float fr=fh(vec2(cell.x*1.37+.5,cell.y*2.11+.25));float edge=min(min(ff.x,1.-ff.x)*fs.x,min(ff.y,1.-ff.y)*fs.y);float inF=smoothstep(2.5,5.5,edge+2.*(texture2D(map,wp*.02).g-.4));
    vec3 g1=texture2D(map,wp/5.3).rgb;vec3 g2=texture2D(map,wp/31.).rgb;vec3 gr=g1*(.55+1.1*g2);
    vec3 dr=texture2D(tDry,q/6.1).rgb*vec3(1.25,1.12,.8);vec3 so=texture2D(tSoil,vec2(q.x/4.7,q.y/4.7)).rgb*vec3(.8,.72,.66);
    float kd=step(.4,fr)*step(fr,.6)*inF,ks=step(.6,fr)*step(fr,.72)*inF,kw=step(.72,fr)*inF;float farK=smoothstep(1100.,2200.,length(wp));
    vec3 gc=mix(mix(mix(gr,dr,kd),so,ks),gr*vec3(.62,.66,.5),kw);float wood=smoothstep(.5,.62,texture2D(map,wp/2900.).g+.25*texture2D(map,wp/700.).r);gc=mix(gc,mix(gr,vec3(.16,.2,.11),wood*.85),farK);float rd=1e9;${ROAD.slice(0,-1).map((a,i)=>seg(a,ROAD[i+1])).join('')}
    vec3 tar=texture2D(tSoil,wp/3.3).rgb*vec3(.5,.5,.52)+.05;float town=min(1.-smoothstep(70.,115.,length(wp-vec2(150.,300.))),1.)*.75+(1.-smoothstep(40.,75.,length(wp-vec2(-480.,-640.))))*.8+(1.-smoothstep(35.,60.,length(wp-vec2(420.,-560.))))*.7;
    gc=mix(gc,so*vec3(.95,.9,.82),(1.-smoothstep(4.5,7.5,rd))*.6);gc=mix(gc,tar,max(1.-smoothstep(2.8,3.6,rd+.6*(g1.g-.4)),town*smoothstep(.2,.5,g2.r+.3)));
    float cl=texture2D(map,wp/1700.+vec2(uT*.0021,uT*.0009)).g*.6+texture2D(map,wp/640.-vec2(uT*.003,0.)).r*.4;gc*=mix(.34,1.08,smoothstep(.3,.56,cl))*vec3(.9,.93,.9);gc*=mix(vec3(.34,.38,.46),vec3(1.),shadeAt(vFogWorld));
    float wet=1.-smoothstep(0.,1.,pondD(wp));gc=mix(gc,gc*vec3(.35,.33,.3),wet);diffuseColor.rgb*=gc;`);};
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
const TSCALE=[4.2,5.2,6.4,4.6,1.05,1.5];
(function buildTrees(){
  const r=rng(1944),spots=TREES.map(()=>[]);const put=(k,x,z,s)=>{if(Math.hypot(x,z)<30||Math.hypot(x,z)>1700||roadDist(x,z)<9||Math.hypot(x-150,z-300)<150||Math.hypot(x+480,z+640)<95||Math.hypot(x-420,z+560)<70||Math.hypot(x,z)<55||pondAt(x,z)&&Math.hypot(x-pondAt(x,z)[0],z-pondAt(x,z)[1])<pondAt(x,z)[2]*1.05)return;spots[k].push([x,z,s*(.75+r()*.5),Math.atan2(SUN.x,SUN.z)+(r()-.5)*1.2+(r()<.5?Math.PI:0)]);};
  for(let cx=-9;cx<=9;cx++)for(let cz=-12;cz<=12;cz++){
    const o=(u,v)=>{const qx=(cx+u)*FW,qz=(cz+v)*FD;return[FCS*qx-FSN*qz,FSN*qx+FCS*qz];},f=field(...o(.5,.5));
    if(f.kind===3){const[mx,mz]=o(.5,.5),n=Math.hypot(mx,mz)<950?34:12;for(let i=0;i<n;i++){const[x,z]=o(.04+r()*.92,.04+r()*.92);put(r()<.25?4:Math.floor(r()*4),x,z,1.1);}for(let i=0;i<n/3;i++){const[x,z]=o(r(),r());put(5,x,z,1.2);}}
    for(const[side,len]of[[0,FW],[1,FD]]){const h=hsh(cx*3.1+side*7.7,cz*5.3+1.9);if(h>.82)continue;const gap=.15+hsh(cx+side,cz*1.7)*.6;
      for(let d=3;d<len-3;d+=7+r()*11){const t=d/len;if(Math.abs(t-gap)<.07)continue;const[x,z]=side?o(0,t):o(t,0);const jx=(r()-.5)*3,jz=(r()-.5)*3;if(r()<.55)put(5,x+jx,z+jz,1);else put(h<.3?Math.floor(r()*4):3,x+jx,z+jz,.9);}}
    if(f.kind<3&&r()<.55){const[x,z]=o(.2+r()*.6,.2+r()*.6);put(r()<.3?4:Math.floor(r()*3),x,z,1.3);}}
  for(const[x,z]of FEAT.bush)put(5,x,z,1.25);for(const[x,z]of FEAT.tree)put(r()<.2?4:Math.floor(r()*4),x,z,1.15);
  for(const q of PONDS)for(let i=0;i<26;i++){const a=r()*6.28,d=q[2]*(1.08+r()*.5);put(r()<.75?5:3,q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d,r()<.75?1.3:1);}
  for(let i=0;i<1500;i++){const a2=r()*6.28,d=1700+Math.pow(r(),1.4)*2600,x=Math.cos(a2)*d,z=Math.sin(a2)*d;if(fbm(x/700+3,z/700+8,2)<.5)continue;spots[Math.floor(r()*4)].push([x,z,2.2+r()*1.6,Math.atan2(SUN.x,SUN.z)+(r()-.5)]);}
  const dm=new T.Object3D();let n_=0;
  TREES.forEach((n,k)=>{const J=TREEJ[n],S=TSCALE[k],all=spots[k];if(!all.length)return;const near=all.filter(t=>Math.hypot(t[0],t[1])<620),far=all.filter(t=>Math.hypot(t[0],t[1])>=620);
    for(let v=0;v<2;v++)for(const[list,sh]of v?[[near,true]]:[[near,true],[far,false]]){if(!list.length)continue;const g=new T.PlaneGeometry(J.w*S,J.h*S);g.translate(0,J.h*S/2-.15,0);if(v)g.rotateY(Math.PI/2);
      const mat=new T.MeshLambertMaterial({map:A0.cards[k][v][0],alphaTest:.42,side:T.DoubleSide,color:new T.Color(.8,.84,.7),emissive:new T.Color(.1,.11,.08),emissiveMap:A0.cards[k][v][0]});
      const im=new T.InstancedMesh(g,mat,list.length);list.forEach((t,i)=>{dm.position.set(t[0],hAt(t[0],t[1]),t[1]);dm.rotation.set(0,t[3],0);dm.scale.setScalar(t[2]);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);});
      im.frustumCulled=false;im.castShadow=sh;land.add(im);n_+=list.length;}});
})();
const cheapOf=new Map(),cheap=m=>{if(!cheapOf.has(m))cheapOf.set(m,new T.MeshLambertMaterial({map:m.map,color:m.color,alphaTest:m.alphaTest,side:m.side,transparent:m.transparent,opacity:m.opacity}));return cheapOf.get(m);};
const prep=(o,f)=>{o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(f)f(m.material,m);}});return o;};
const solids=[];
(function buildScenery(){
  const lots=new Map(),place=(src,x,z,ry,s=1,r=0,h=0)=>{(lots.get(src)||lots.set(src,[]).get(src)).push([x,z,ry,s,-.1]);if(r)solids.push({x,z,r,h});};
  for(const n of['barn','cars','rocks','h6','row','h9','shop','cork','flats','white','cottage','villa','mill','works','church','watertower','silos','stacks','mast','pylon','pole','stonewall','lamp','hay','brokenwall','rubble','trabant','lada','van','tractor','truck','busstop'])prep(M[n]);
  place(M.barn,-150,-230,.5,1,7,7);place(M.barn,250,-360,1.9,.9,7,7);place(M.barn,-330,160,2.6,1,7,7);place(M.cars,-128,-218,1.1);place(M.tractor,262,-338,.3);
  const r=rng(77),dm=new T.Object3D(),mx=new T.Matrix4();
  // many of one model drawn as one: [x, z, turn, size, lift, lean, tall]
  const many=(src,list)=>{if(!list.length)return;src.updateMatrixWorld(true);src.traverse(m=>{if(!m.isMesh)return;const im=new T.InstancedMesh(m.geometry,m.material,list.length);list.forEach((t,i)=>{dm.position.set(t[0],hAt(t[0],t[1])+(t[4]||0),t[1]);dm.rotation.set(0,t[2],t[5]||0);dm.scale.set(t[3],t[3]*(t[6]||1),t[3]);dm.updateMatrix();im.setMatrixAt(i,mx.multiplyMatrices(dm.matrix,m.matrixWorld));});im.material=cheap(m.material);im.castShadow=im.receiveShadow=true;im.frustumCulled=false;land.add(im);});};
  prep(M.crag,m=>{m.envMapIntensity=.3;m.color.setRGB(.62,.6,.55);});prep(M.deadtree,m=>{m.envMapIntensity=.2;m.side=T.DoubleSide;m.alphaTest=.4;});prep(M.sandbags,m=>{m.envMapIntensity=.2;m.color.setRGB(.6,.58,.5);});prep(M.hedgehog,m=>{m.color.setRGB(.25,.16,.12);m.envMapIntensity=.3;});prep(M.wreck,m=>{m.envMapIntensity=.3;m.color.multiplyScalar(.55);});
  many(M.rocks,FEAT.rockS.map(t=>[t[0],t[1],t[2],t[3],-t[3]*.2]));many(M.rocks,FEAT.rockB.map(t=>[t[0],t[1],t[2],t[3],-t[3]*.3,0,1.6]));many(M.crag,FEAT.crag.map(t=>[t[0],t[1],t[2],t[3],-.6]));
  many(M.deadtree,FEAT.dead.map(t=>[t[0],t[1],t[2],t[3],-.5]));many(M.deadtree,FEAT.log.map(t=>[t[0],t[1],t[2],t[3],.9,1.45]));many(M.sandbags,FEAT.bags.flatMap(t=>[0,1,2,3,4].map(k=>[t[0]+Math.cos(t[2])*k*1.5,t[1]+Math.sin(t[2])*k*1.5,-t[2],1.15,0])));
  many(M.hedgehog,FEAT.hog.flatMap(t=>[0,1,2].map(k=>[t[0]+Math.cos(t[2])*k*3.2,t[1]+Math.sin(t[2])*k*3.2,t[2]+k,1,-.1])));for(const t of FEAT.wreck)place(M.wreck,t[0],t[1],t[2],1,2.6,2.6);
  land.userData.flush=()=>{for(const[src,list]of lots)many(src,list);};
  for(const t of FEAT.rockB)solids.push({x:t[0],z:t[1],r:t[3]*2.4,h:t[3]*2.4});for(const t of FEAT.crag)solids.push({x:t[0],z:t[1],r:t[3]*2.2,h:t[3]*7});for(const t of FEAT.dead)solids.push({x:t[0],z:t[1],r:.5,h:6});
  // the ponds: still dark water in the hollows
  {const wm=new T.MeshStandardMaterial({color:0x0c1416,roughness:.06,metalness:.3,envMapIntensity:1.5,transparent:true,opacity:.93});for(const q of PONDS){const w=new T.Mesh(new T.CircleGeometry(q[2]*1.03,40).rotateX(-Math.PI/2),wm);w.position.set(q[0],q[3]-.55,q[1]);w.receiveShadow=true;land.add(w);}}
  // farms out in the fields
  for(const[fx,fz,fy]of[[-260,-330,.4],[210,-250,2.1],[380,60,1.2],[-420,-40,2.8],[60,-520,.2],[-200,330,1.7],[560,-220,.9]]){const c=Math.cos(fy),sn=Math.sin(fy),at=(u,v)=>[fx+c*u+sn*v,fz-sn*u+c*v];
    let[x,z]=at(0,0);place(M.barn,x,z,fy,1,7,7);[x,z]=at(22,6);place(r()<.5?M.cottage:M.villa,x,z,fy+1.57,1,5,9);[x,z]=at(-4,-18);place(M.hay,x,z,r()*6,1,1.6,1.8);[x,z]=at(3,-21);place(M.hay,x,z,r()*6,1,1.6,1.8);
    [x,z]=at(12,-10);place(r()<.5?M.tractor:M.lada,x,z,fy+r()*3,1,1.8,2);for(let k=0;k<6;k++){[x,z]=at(-14+k*5,16);place(M.stonewall,x,z,fy,1,2,1.5);}}
  // the village on the far right
  {const VX=420,VZ=-560;[['h6',-28,-9,0],['white',-6,-10,0],['cottage',8,-9,0],['shop',26,-12,0],['row',-20,12,3.14],['villa',4,11,3.14],['h9',20,12,3.14],['cork',40,10,3.14]].forEach(([n,u,v,ry])=>{const S=MODJ[n].box;place(M[n],VX+u,VZ+v,ry+({h9:3.14,shop:3.14,white:3.14,cork:1.57,villa:-1.57}[n]||0),1,Math.min(S[1][0]-S[0][0],S[1][2]-S[0][2])*.55,S[1][1]);});
   place(M.church,VX-46,VZ+30,2.2,.8,8,20);place(M.trabant,VX+2,VZ-1,1.5,1,1.6,1.5);for(let k=0;k<3;k++)place(M.lamp,VX-24+k*24,VZ-3,0,1,.25,6);}
  const SUP=[96,150];place(M.truck,SUP[0],SUP[1],2.2,1,2.4,3.2);place(M.ammobox,SUP[0]+3,SUP[1]+2.5,.4,3);place(M.ammobox,SUP[0]+3.6,SUP[1]+1.2,1.3,3);place(M.hay,SUP[0]-4,SUP[1]+3,1,1,1.6,1.8);land.userData.supply=SUP;
  for(const[x,z]of[[-170,-260],[-190,-250],[-175,-240],[230,-330],[300,180],[310,190],[-360,120],[-350,135],[420,-80]])place(M.hay,x,z,r()*6.28,1,1.6,1.8);
  // the town: two terraces down the road, a square with the church, lamps, walls, cars
  const TX=150,TZ=300,dx=-.447,dz=-.894,nx=.894,nz=-.447,FRONT={h6:0,row:0,cottage:0,h9:Math.PI,flats:Math.PI,shop:Math.PI,cork:Math.PI/2,white:Math.PI,villa:-Math.PI/2};
  const size=n=>{const b=MODJ[n].box,turned=Math.abs(Math.sin(FRONT[n]||0))>.5;return{w:turned?b[1][2]-b[0][2]:b[1][0]-b[0][0],d:turned?b[1][0]-b[0][0]:b[1][2]-b[0][2],h:b[1][1]};};
  const terrace=(list,side,from,ox=TX,oz=TZ,ax=dx,az=dz,px=nx,pz=nz)=>{let t=from;for(const n of list){const S=size(n),c=t+S.w/2,off=side*(7.5+S.d/2),x=ox+ax*c+px*off,z=oz+az*c+pz*off;
    place(M[n],x,z,Math.atan2(px*side,pz*side)+(FRONT[n]||0),1,Math.min(S.w,S.d)*.55,S.h);if(S.w>14)solids.push({x:x+ax*S.w*.27,z:z+az*S.w*.27,r:S.d*.5,h:S.h},{x:x-ax*S.w*.27,z:z-az*S.w*.27,r:S.d*.5,h:S.h});t+=S.w+.3+(r()<.2?4:0);}};
  terrace(['row','h9','shop','white','h6','cork','cottage'],1,-95);terrace(['h6','flats','villa','row','shop','h9'],-1,-98);
  terrace(['cottage','white','h6','villa'],1,14,TX+dx*-20,TZ+dz*-20,nx,nz,-dx,-dz);terrace(['h9','row','cottage'],-1,16,TX+dx*-20,TZ+dz*-20,nx,nz,-dx,-dz);
  terrace(['villa','h6','white'],1,-70,TX+dx*-20,TZ+dz*-20,nx,nz,-dx,-dz);terrace(['shop','cottage','row'],-1,-74,TX+dx*-20,TZ+dz*-20,nx,nz,-dx,-dz);
  place(M.church,TX+dx*22+nx*-48,TZ+dz*22+nz*-48,.9,1,9,24);
  for(let t=-95;t<=75;t+=28)for(const sd of[-1,1])place(M.lamp,TX+dx*t+nx*sd*6.2,TZ+dz*t+nz*sd*6.2,Math.atan2(nx*sd,nz*sd)+Math.PI/2,1,.25,6);
  place(M.busstop,TX+dx*34+nx*6.8,TZ+dz*34+nz*6.8,Math.atan2(-nx,-nz),1,1.2,2.6);place(M.trabant,TX+dx*-30+nx*4.6,TZ+dz*-30+nz*4.6,Math.atan2(dx,dz),1,1.6,1.5);place(M.lada,TX+dx*12+nx*-4.6,TZ+dz*12+nz*-4.6,Math.atan2(-dx,-dz),1,1.6,1.5);
  place(M.van,TX+dx*52+nx*4.8,TZ+dz*52+nz*4.8,Math.atan2(dx,dz)+Math.PI/2,1,1.8,2.2);place(M.truck,TX+dx*108+nx*-5,TZ+dz*108+nz*-5,Math.atan2(-dx,-dz),1,2.4,3.2);
  for(let i=0;i<9;i++){const a=3.9+i*.13;place(M.stonewall,TX+Math.cos(a)*132,TZ+Math.sin(a)*132,-a+Math.PI/2+(r()-.5)*.1,1,2,1.5);}
  for(let i=0;i<4;i++)place(M.brokenwall,TX+dx*(118+i*7)+nx*(16+i*3),TZ+dz*(118+i*7)+nz*(16+i*3),Math.atan2(nx,nz)+.4*i,1,2.4,2.4);for(let i=0;i<5;i++)place(M.rubble,TX+dx*(112+r()*24)+nx*(r()-.5)*40,TZ+dz*(112+r()*24)+nz*(r()-.5)*40,r()*6.28,1+r()*.6);
  // the works on the far side: the mill and its chimney, the sheds, silos, stacks, a water tower
  const WX=-480,WZ=-640;place(M.mill,WX,WZ,.6,1,10,22);place(M.works,WX+38,WZ+14,2.2,1,9,15);place(M.silos,WX-30,WZ+26,.3,1,6,14);place(M.stacks,WX+12,WZ-34,1.1,1,2,33);place(M.watertower,WX-52,WZ-18,0,1,3,16);place(M.truck,WX+16,WZ+30,2.6,1,2.4,3.2);
  place(M.mast,640,-930,0,1,2,46);place(M.watertower,TX+nx*96+dx*-60,TZ+nz*96+dz*-60,0,1,3,16);
  // the power line across the fields, and the poles along the road
  const PY=[[-950,-250],[-690,-285],[-430,-300],[-170,-330],[90,-345],[350,-380],[610,-400],[870,-440]],wp=[];
  PY.forEach(([x,z],i)=>{place(M.pylon,x,z,.12,1,2.5,26);if(i){const[ax,az]=PY[i-1];for(const off of[-4.6,4.6])for(let k=0;k<16;k++){const t0=k/16,t1=(k+1)/16,sag=t=>-9*4*t*(1-t);wp.push(lerp(ax,x,t0),lerp(hAt(ax,az),hAt(x,z),t0)+21+sag(t0),lerp(az,z,t0)+off,lerp(ax,x,t1),lerp(hAt(ax,az),hAt(x,z),t1)+21+sag(t1),lerp(az,z,t1)+off);}}});
  const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(wp,3));const wires=new T.LineSegments(wg,new T.LineBasicMaterial({color:0x1a1a1a,transparent:true,opacity:.7}));wires.frustumCulled=false;land.add(wires);
  for(let i=0;i<ROAD.length-1;i++){const a=ROAD[i],b=ROAD[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;for(let d=i?20:130;d<L-(i===ROAD.length-2?80:0);d+=55)place(M.pole,a[0]+ux*d-uz*7,a[1]+uz*d+ux*7,Math.atan2(ux,uz),1,.3,8);}
  land.userData.flush();
  // the still world's shadow, drawn once from the sun: trees, buildings, rocks and the hills themselves
  {const R=980,cam=new T.OrthographicCamera(-R,R,R,-R,10,9000);cam.position.copy(SUN).multiplyScalar(4000);cam.lookAt(0,0,0);cam.updateMatrixWorld();cam.updateProjectionMatrix();
   const rt=new T.WebGLRenderTarget(2048,2048,{minFilter:T.NearestFilter,magFilter:T.NearestFilter}),keep=new Map(),dep=new Map();
   land.traverse(m=>{if(!m.isMesh&&!m.isInstancedMesh)return;keep.set(m,m.material);const a=m.material;if(a.transparent&&!a.alphaTest){m.visible=false;return;}let d=dep.get(a);if(!d){d=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:a.alphaTest?a.map:null,alphaTest:a.alphaTest||0,side:T.DoubleSide});dep.set(a,d);}m.material=d;});
   const vis=[];scene.children.forEach(c=>{if(c!==land){vis.push([c,c.visible]);c.visible=false;}});land.traverse(o=>{if(o.isLine){vis.push([o,o.visible]);o.visible=false;}});const tm=renderer.toneMapping,cc=renderer.getClearColor(new T.Color()).clone(),ca=renderer.getClearAlpha(),fg=scene.fog;scene.fog=null;
   renderer.toneMapping=T.NoToneMapping;renderer.setClearColor(0xffffff,1);renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,cam);renderer.setRenderTarget(null);renderer.setClearColor(cc,ca);renderer.toneMapping=tm;scene.fog=fg;
   for(const[c,v]of vis)c.visible=v;for(const[m,a]of keep){m.material=a;m.visible=true;m.castShadow=false;}
   landMat.userData.shade={tex:rt.texture,m:new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)};}
})();

// ---------- air: mist lying in the hollows, smoke standing on the horizon, guns flashing beyond it ----------
const mist=[],farFlash=[];
(function buildAir(){
  const r=rng(31),mc=FOG.clone().multiplyScalar(.75);
  for(let i=0;i<18;i++){let bx=0,bz=0,bh=1e9;for(let k=0;k<7;k++){const a=r()*6.28,d=80+r()*650,x=Math.cos(a)*d,z=Math.sin(a)*d,h=hAt(x,z);if(h<bh){bh=h;bx=x;bz=z;}}
    const s=new T.Sprite(new T.SpriteMaterial({map:smokeT,color:mc,transparent:true,opacity:.2+r()*.14,depthWrite:false,fog:false}));const sc=110+r()*150;s.scale.set(sc,sc*.34,1);s.position.set(bx,bh+sc*.1,bz);s.userData={x:bx,ph:r()*6,sp:.3+r()*.5};scene.add(s);mist.push(s);}
  for(let i=0;i<7;i++){const a=r()*6.28,d=2200+r()*2200,x=Math.cos(a)*d,z=Math.sin(a)*d,y=h0(x,z);
    for(let k=0;k<7;k++){const s=new T.Sprite(new T.SpriteMaterial({map:smokeT,color:new T.Color(.1,.1,.11).lerp(FOG,.35+k*.07),transparent:true,opacity:.75-k*.07,depthWrite:false,fog:false}));const sc=120+k*70;s.scale.set(sc,sc*1.3,1);s.position.set(x+k*k*9,y+60+k*95,z+k*k*4);scene.add(s);}
    const f=new T.Sprite(new T.SpriteMaterial({map:glowT,color:new T.Color(3,1.9,.9),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));f.scale.setScalar(420);f.position.set(x+(r()-.5)*900,y+30,z+(r()-.5)*900);f.userData={t:9,next:2+r()*8};scene.add(f);farFlash.push(f);}
})();
function updateAir(dt){
  if(landMat.userData.uT){landMat.userData.uT.value=time;if(landMat.userData.shade&&!landMat.userData.tShade.value){landMat.userData.tShade.value=landMat.userData.shade.tex;landMat.userData.uShadeM.value.copy(landMat.userData.shade.m);}}
  for(const s of mist){s.position.x=s.userData.x+Math.sin(time*.02*s.userData.sp+s.userData.ph)*40;}
  for(const f of farFlash){const u=f.userData;u.t+=dt;if(u.t>u.next){u.t=0;u.next=3+Math.random()*11;play('boom_far',.16+Math.random()*.12,'out',5+Math.random()*5,.7+Math.random()*.3);}f.material.opacity=u.t<.3?(1-u.t/.3)*.8:0;}
}

// ---------- your tank ----------
const tank=new T.Group();scene.add(tank);
const ext=new T.Group();tank.add(ext);
prep(M.hero,m=>{m.envMapIntensity=.7;m.color.multiplyScalar(.82);});
const heroProto=M.ally;heroProto.traverse(m=>{if(m.isMesh){m.material=new T.MeshLambertMaterial({map:m.material.map,color:new T.Color(.8,.8,.8),emissive:new T.Color(0,0,0)});m.castShadow=false;}});heroProto.getObjectByName('hull').add(new T.Mesh(new T.BoxGeometry(3.4,.75,6.7).translate(0,.4,.5),new T.MeshLambertMaterial({color:0x14140f})));
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
const monitorMat=new T.ShaderMaterial({uniforms:{map:{value:null},gain:{value:1},thermal:{value:0},snow:{value:0},time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D map;uniform float gain,thermal,snow,time;varying vec2 vUv;
  float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec2 u=vUv;u.x+=snow*.02*(hh(vec2(floor(u.y*60.),floor(time*20.)))-.5);vec3 c=texture2D(map,u).rgb;c=c/(1.+c*.6);
    if(thermal>.5){float l=dot(c,vec3(.3,.5,.2));l=smoothstep(.02,.9,l*1.25);c=vec3(l*.8,l,l*.8);}
    c=mix(c,vec3(hh(u*vec2(640.,480.)+fract(time)*91.)),snow*.55);c*=.94+.06*sin(u.y*480.*3.14159);gl_FragColor=vec4(c*gain,1.);
#include <tonemapping_fragment>
#include <encodings_fragment>
  }`}),statC=cnv(512,320),statT=ctex(statC),fcsC=cnv(256,192),fcsT=ctex(fcsC);
const sightRT=new T.WebGLRenderTarget(512,384,{type:T.HalfFloatType});monitorMat.uniforms.map.value=sightRT.texture;
const breech=new T.Group(),breechSlide=new T.Group();
(function buildInside(){
  const CEIL=ROOF-.12,H=CEIL-FLOOR,mk=(t,rep,o)=>{const m=new T.MeshStandardMaterial(Object.assign({map:t.d.clone(),normalMap:t.n.clone(),roughnessMap:t.a.clone(),metalnessMap:t.a.clone(),envMapIntensity:.18},o));for(const k of['map','normalMap','roughnessMap','metalnessMap']){m[k].repeat.set(rep,rep);m[k].needsUpdate=true;}return m;};
  // the turret's white paint: the green paint's picture with its colour taken out and lifted
  const white=(()=>{const im=A0.paint.d.image,c=cnv(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let i=0;i<a.length;i+=4){const l=a[i]*.3+a[i+1]*.5+a[i+2]*.2,v=Math.min(255,70+l*1.75);a[i]=v*.97;a[i+1]=v;a[i+2]=v*.93;}g.putImageData(d,0,0);const t=ctex(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;return{d:t,n:A0.paint.n,a:A0.paint.a};})();
  const wallMat=mk(white,.55,{color:0x5e645a,metalness:.1,roughness:.8,side:T.DoubleSide}),frame=mk(white,.8,{color:0x50564c,metalness:.15,roughness:.7}),dark=mk(A0.paint,1.5,{color:0x30352c,metalness:.4,roughness:.7}),
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
  {const bm=M.breech;bm.traverse(m=>{if(m.isMesh){m.material.envMapIntensity=.25;m.material.color.multiplyScalar(.8);}});bm.rotation.y=Math.PI;bm.scale.setScalar(1.25);bm.position.set(.06,-1.15,.42);breechSlide.add(bm);
   add(new T.BoxGeometry(.7,.62,.1).translate(0,0,.05),dark,breech);}
  // the gunner's sight: a hooded screen on an arm, the picture the gun's own camera sends
  const sight=new T.Group();sight.position.set(HX,FLOOR+EYE-.03,HZ-.86);inside.add(sight);
  const box=(w,h,d,m,x,y,z,p)=>{const o=add(new T.BoxGeometry(w,h,d),m,p||sight);o.position.set(x,y,z);return o;};
  box(.56,.44,.2,dark,0,0,-.11);box(.5,.37,.012,rubberM,0,0,-.006);const scr=add(new T.PlaneGeometry(.46,.345),monitorMat,sight);scr.position.z=.002;
  box(.58,.03,.16,dark,0,.235,.07);box(.03,.44,.14,dark,-.29,0,.06);box(.03,.44,.14,dark,.29,0,.06);box(.3,.05,.05,pad,0,.2,.15);
  for(let i=0;i<5;i++){box(.034,.022,.012,olive,-.21+i*.105,-.2,.004);const led=add(new T.CircleGeometry(.004,8),new T.MeshBasicMaterial({color:i===1?new T.Color(.3,2.4,.5):new T.Color(1.6,.9,.2)}),sight);led.position.set(-.21+i*.105,-.183,.012);}
  box(.05,.05,.5,steel,.2,.3,-.2).rotation.x=.5;box(.05,.05,.5,steel,-.2,.3,-.2).rotation.x=.5;
  const rc=cnv(640,480),rT=ctex(rc);inside.userData.reticle=()=>{const g=rc.getContext('2d');g.clearRect(0,0,640,480);const col=P.thermal?'rgba(10,20,10,.95)':'rgba(8,8,6,.92)';g.strokeStyle=col;g.fillStyle=col;g.lineWidth=2;
    g.beginPath();g.moveTo(150,240);g.lineTo(296,240);g.moveTo(344,240);g.lineTo(490,240);g.moveTo(320,96);g.lineTo(320,216);g.moveTo(320,264);g.lineTo(320,384);g.stroke();g.beginPath();g.arc(320,240,3,0,7);g.fill();g.lineWidth=1;g.beginPath();g.arc(320,240,24,0,7);g.stroke();
    for(let i=1;i<=4;i++)for(const sx of[-1,1]){g.fillRect(320+sx*i*34-1,234,2,12);}
    const vg=g.createRadialGradient(320,240,215,320,240,315);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.9)');g.fillStyle=vg;g.fillRect(0,0,640,480);
    g.font='600 20px monospace';g.textBaseline='middle';g.fillStyle='#7dff9c';g.textAlign='left';g.fillText(fcsLine(0),110,414);g.textAlign='right';g.fillText(fcsLine(1),530,414);g.textAlign='center';g.fillText(fcsLine(2),320,70);rT.needsUpdate=true;};
  add(new T.PlaneGeometry(.46,.345),new T.MeshBasicMaterial({map:rT,transparent:true,toneMapped:false,depthWrite:false}),sight).position.z=.004;
  // the commander's panel on the right: armour, gun, rounds, the plot
  const mfd=new T.Group();mfd.position.set(1.16,FLOOR+EYE-.12,HZ-.62);mfd.rotation.y=-1.02;inside.add(mfd);
  box(.44,.3,.1,dark,0,0,-.055,mfd);box(.4,.26,.01,rubberM,0,0,-.004,mfd);add(new T.PlaneGeometry(.37,.231),new T.MeshBasicMaterial({map:statT,toneMapped:false,color:0x9a9a9a}),mfd).position.z=.003;
  for(let i=0;i<4;i++)box(.022,.03,.012,olive,-.205,.09-i*.06,.004,mfd);
  // real kit: the seat, the consoles, the switch box, the radio, a crew helmet, the ready rounds, pipes, the lamp
  const dress=(src,x,y,z,ry,f,s=1)=>{const o=src.clone();o.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.envMapIntensity=.2;if(f)f(m.material);}});o.position.set(x,y,z);o.rotation.y=ry;o.scale.setScalar(s);inside.add(o);return o;};
  dress(M.seat,HX,FLOOR-.02,HZ+.1,Math.PI,m=>{m.color.multiplyScalar(.75);});
  dress(M.console,HX+.02,FLOOR-.3,HZ-1.42,0,m=>{m.color.setRGB(.4,.45,.4);m.emissiveMap=m.map;m.emissive=new T.Color(.3,.24,.2);},.86);
  const cov=add(new T.PlaneGeometry(.25,.225),new T.MeshBasicMaterial({map:fcsT,toneMapped:false,color:0x8a8a8a}));cov.position.set(HX-.2,FLOOR+.582,HZ-1.293);cov.rotation.x=-.21;
  dress(M.display,1.27,FLOOR+EYE+.02,HZ+.12,-Math.PI/2,m=>{m.color.setRGB(.3,.33,.29);m.emissiveMap=m.map;m.emissive=new T.Color(.25,.32,.34);},.9);
  dress(M.switchbox,1.3,FLOOR+.7,HZ+.75,-Math.PI/2,m=>{m.color.multiplyScalar(.8);m.emissiveMap=m.map;m.emissive=new T.Color(.3,.3,.3);});
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
  L.dome=new T.SpotLight(0xff9a62,0,7,1.25,.6,1.6);L.dome.position.set(-.2,CEIL-.12,.2);L.dome.target.position.set(.1,FLOOR,.15);L.dome.castShadow=true;L.dome.shadow.mapSize.set(512,512);L.dome.shadow.autoUpdate=false;L.dome.shadow.camera.near=.08;L.dome.shadow.camera.far=4;L.dome.shadow.bias=-.002;L.dome.shadow.normalBias=.02;
  L.screen=new T.PointLight(0x9fd8b8,0,2.4,2);L.screen.position.set(HX,FLOOR+EYE,HZ-.55);L.mfd=new T.PointLight(0x8fe0a8,0,1.6,2);L.mfd.position.set(1.0,FLOOR+EYE-.1,HZ-.45);
  L.alarm=new T.PointLight(0xff2a14,0,3.5,2);L.alarm.position.set(.6,CEIL-.2,-.7);
  L.day=new T.SpotLight(0xfff0dc,0,6,.5,.7,1.2);L.day.position.set(HX,CEIL+1.2,HZ);L.day.target.position.set(HX-.15,FLOOR,HZ+.2);
  inside.add(L.dome,L.dome.target,L.screen,L.mfd,L.alarm,L.day,L.day.target);
  L.lid=new T.Group();L.lid.position.set(HX,CEIL+.13,HZ+.35);inside.add(L.lid);add(new T.CylinderGeometry(.35,.35,.04,28).translate(0,0,-.35),dark,L.lid);add(new T.TorusGeometry(.07,.012,8,16).translate(0,-.05,-.35),steel,L.lid);add(new T.CylinderGeometry(.3,.3,.02,28).translate(0,-.03,-.35),pad,L.lid);
  const beacon=add(new T.SphereGeometry(.022,12,8),new T.MeshBasicMaterial({color:0x300a06}));beacon.position.copy(L.alarm.position);L.beacon=beacon;
  inside.traverse(m=>{if(m.isMesh&&!m.material.isMeshBasicMaterial){m.castShadow=true;m.receiveShadow=true;}});

})();

const NDUST=160,dustP=new Float32Array(NDUST*3);(function(){const r=rng(13);for(let i=0;i<NDUST;i++){dustP[i*3]=(r()-.5)*2.2;dustP[i*3+1]=FLOOR+r()*1.6;dustP[i*3+2]=(r()-.5)*2.6;}})();
const dustG=new T.BufferGeometry();dustG.setAttribute('position',new T.BufferAttribute(dustP,3));dustG.boundingSphere=new T.Sphere(new T.Vector3(),6);
const dust=new T.Points(dustG,new T.PointsMaterial({color:0xffdcb0,size:.008,map:glowT,transparent:true,opacity:.45,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
inside.add(dust);
function updateDust(dt){for(let i=0;i<NDUST;i++){const j=i*3;dustP[j]+=Math.sin(time*.5+i)*dt*.02+P.shake*(Math.random()-.5)*.02;dustP[j+1]-=dt*.012;if(dustP[j+1]<FLOOR)dustP[j+1]=FLOOR+1.6;}dustG.attributes.position.needsUpdate=true;}

// ---------- your arms and gloved hands (the WebXR hand mesh, its fingers curled by five numbers), and what they hold ----------
const CHAINS=(()=>{const F=n=>[n+'-finger-metacarpal',n+'-finger-phalanx-proximal',n+'-finger-phalanx-intermediate',n+'-finger-phalanx-distal',n+'-finger-tip'];
  return[[['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip'],[.3,.55,.9,0]],[F('index'),[0,1.25,1.5,.95,0]],[F('middle'),[0,1.3,1.5,.95,0]],[F('ring'),[0,1.3,1.5,.95,0]],[F('pinky'),[0,1.3,1.45,.9,0]]];})();
const gloveMat=new T.MeshStandardMaterial({color:0x2a2c24,roughness:.9,envMapIntensity:.2}),sleeveMat=new T.MeshStandardMaterial({map:A0.leather.d,color:0x6d7352,roughness:1,envMapIntensity:.1});
function makeHand(src,side){
  const root=new T.Group(),bones={},h={root,side,curl:[.2,.15,.15,.15,.15],cur:[.2,.15,.15,.15,.15]};
  src.traverse(o=>{if(o.isBone||o.name==='wrist'||CHAINS.some(c=>c[0].includes(o.name)))bones[o.name]=o;if(o.isMesh){o.material=gloveMat;o.frustumCulled=false;o.castShadow=true;}});
  const Wb=bones.wrist,wq=Wb.quaternion.clone(),wp=Wb.position.clone(),iq=wq.clone().invert(),rest={};
  for(const n in bones)rest[n]={p:bones[n].position.clone().sub(wp).applyQuaternion(iq),q:iq.clone().multiply(bones[n].quaternion)};
  const fix=new T.Group();fix.quaternion.copy(iq);fix.position.copy(wp).applyQuaternion(iq).negate();fix.add(src);root.add(fix);
  const q=new T.Quaternion(),d=new T.Quaternion(),ax=new T.Vector3(),pp=new T.Vector3(),o2=new T.Vector3();
  h.update=dt=>{const k=Math.min(1,dt*20);for(let i=0;i<5;i++)h.cur[i]+=(h.curl[i]-h.cur[i])*k;
    CHAINS.forEach(([names,bend],f)=>{const c=h.cur[f];d.identity();pp.copy(rest[names[0]].p);
      for(let i=0;i<names.length;i++){const r=rest[names[i]],b=bones[names[i]];if(!b||!r)return;if(bend[i]){ax.set(1,0,0).applyQuaternion(r.q).applyQuaternion(d);d.premultiply(q.setFromAxisAngle(ax,-bend[i]*c));}
        b.position.copy(pp).applyQuaternion(wq).add(wp);b.quaternion.copy(wq).multiply(q.copy(d).multiply(r.q));if(i+1<names.length)pp.add(o2.copy(rest[names[i+1]].p).sub(r.p).applyQuaternion(d));}});};
  h.update(1);return h;
}
const hands={left:makeHand(M.hand_l,'L'),right:makeHand(M.hand_r,'R')},arms={};
for(const k of['left','right']){const seg=(r0,r1)=>{const m=new T.Mesh(new T.CylinderGeometry(r0,r1,1,12),sleeveMat);m.castShadow=true;m.visible=false;rig.add(m);return m;};arms[k]={up:seg(.052,.046),fore:seg(.044,.036)};hands[k].root.visible=false;rig.add(hands[k].root);}
const binos=prep(M.binos,m=>{m.envMapIntensity=.4;});binos.visible=false;rig.add(binos);
const view={yaw:0,pitch:0};
const span=(m,a,b)=>{m.position.copy(a).add(b).multiplyScalar(.5);m.scale.set(1,a.distanceTo(b),1);m.quaternion.setFromUnitVectors(UP,vc.copy(b).sub(a).normalize());m.visible=true;};
const sh=new T.Vector3(),el=new T.Vector3(),pole=new T.Vector3();
// an arm from the shoulder under your head to the wrist: the elbow bends down and out
function arm(k,wrist){const sgn=k==='left'?-1:1,cy=camera.rotation.y,cs=Math.cos(cy),sn=Math.sin(cy);
  sh.set(camera.position.x+cs*.19*sgn,camera.position.y-.23,camera.position.z-sn*.19*sgn);const L1=.3,L2=.27,d=Math.max(.05,Math.min(L1+L2-.005,sh.distanceTo(wrist))),mid=.5*d+(L1*L1-L2*L2)/(2*d),hgt=Math.sqrt(Math.max(0,L1*L1-mid*mid));
  vb.copy(wrist).sub(sh).normalize();pole.set(cs*.6*sgn,-1,-sn*.6*sgn);pole.addScaledVector(vb,-pole.dot(vb)).normalize();el.copy(sh).addScaledVector(vb,mid).addScaledVector(pole,hgt);
  span(arms[k].up,sh,el);span(arms[k].fore,el,wrist);}
function toggleBinos(){if(state!=='play'||xrActive)return;if(P.headIn){setHud('Open the hatch to use the binoculars','',2.5);return;}P.item=P.item==='bino'?null:'bino';view.yaw=P.aimYaw;view.pitch=P.aimPitch;play('switch',.3);syncUi();}
// where you are looking, in the world: through the binoculars it is your own eyes, otherwise the gun
function lookRay(o,d){tank.updateMatrixWorld();if(P.item==='bino'){camera.getWorldPosition(o);camera.getWorldQuaternion(qa);}else{muzzle.getWorldPosition(o);gunN.getWorldQuaternion(qa);}d.set(0,0,-1).applyQuaternion(qa);}
function layGun(){lookRay(va,vb);if(xrActive)xr.slew={yaw:Math.atan2(-vb.x,-vb.z),pitch:Math.asin(clamp(vb.y,-1,1))};else{P.aimYaw=view.yaw;P.aimPitch=view.pitch;}lase();setHud('Gunner: traversing','The gun is coming on to where you are looking.',2.5);}
function updateBody(dt){
  if(P.headIn&&P.item){P.item=null;syncUi();}
  for(const k of['left','right']){const h=hands[k],c=xr.ctrl[k];h.update(dt);
    if(xrActive&&c){h.root.visible=true;h.root.position.copy(c.position).add(vc.set(0,-.01,.06).applyQuaternion(c.quaternion));h.root.quaternion.copy(c.quaternion).multiply(qa.setFromAxisAngle(vb.set(0,0,1),k==='left'?Math.PI/2:-Math.PI/2));
      const g=xr.grip[k]||0,t=xr.trig[k]||0;h.curl[0]=.2+.5*g;h.curl[1]=.15+.8*t;h.curl[2]=h.curl[3]=h.curl[4]=.2+.75*g;wr.copy(h.root.position);arm(k,wr);}
    else{h.root.visible=false;arms[k].up.visible=arms[k].fore.visible=false;}}
  // the binoculars: in your left hand in the headset, to your eyes when you bring them up
  const bh=xrActive&&!P.headIn&&xr.grip.left>.5&&xr.ctrl.left;binos.visible=!!bh;
  if(bh){const c=xr.ctrl.left;binos.position.copy(c.position).add(vc.set(.03,.03,-.04).applyQuaternion(c.quaternion));binos.quaternion.copy(c.quaternion);if(c.position.distanceTo(camera.position)<.24)P.item='bino';else if(P.item==='bino')P.item=null;}else if(xrActive&&P.item==='bino')P.item=null;
  if(xrActive&&xr.ctrl.right){const c=xr.ctrl.right;if(xr.last)xr.vel=(xr.vel||new T.Vector3()).copy(c.position).sub(xr.last).multiplyScalar(1/Math.max(dt,1e-3));xr.last=(xr.last||new T.Vector3()).copy(c.position);}
}
const wr=new T.Vector3();

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
const binoCam=new T.PerspectiveCamera(8.5,4/3,1,9000);camera.add(binoCam);
const binoView=new T.Mesh(new T.PlaneGeometry(.4,.3),new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{map:{value:sightRT.texture},gain:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D map;uniform float gain;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*vec2(4./3.,1.);float m=min(length(p-vec2(-.2,0.)),length(p-vec2(.2,0.)));vec3 c=texture2D(map,vUv).rgb;c=c/(1.+c*.6)*gain;c*=1.-smoothstep(.4,.44,m);gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <encodings_fragment>
  }`}));binoView.position.z=-.16;binoView.renderOrder=999;binoView.visible=false;camera.add(binoView);
const binoBack=new T.Mesh(new T.SphereGeometry(.3,12,8),new T.MeshBasicMaterial({color:0,side:T.BackSide,depthTest:false,depthWrite:false}));binoBack.renderOrder=998;binoBack.visible=false;camera.add(binoBack);
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
composer.addPass(new T.UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.6,.8,.72));
const lens=new T.ShaderPass({
  uniforms:{tDiffuse:{value:null},thermal:{value:0},res:{value:new T.Vector2(innerWidth*PR,innerHeight*PR)},time:{value:0},grain:{value:.045},ca:{value:.005},blur:{value:0},desat:{value:0},vig:{value:.3}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 res;uniform float time,grain,ca,blur,desat,vig,thermal;varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 toSRGB(vec3 c){c=max(c,0.0);return mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(0.0031308,c));}
  void main(){vec2 c=vUv-.5;float asp=res.x/res.y;float r=length(c*vec2(asp,1.0));
    float k=ca*r*r;vec3 col;col.r=texture2D(tDiffuse,vUv-c*k).r;col.g=texture2D(tDiffuse,vUv).g;col.b=texture2D(tDiffuse,vUv+c*k).b;
    float pb=blur*smoothstep(.12,.7,r);
    if(pb>.001){vec3 acc=col;float px=pb*7.0/res.y;for(int i=0;i<12;i++){float a=float(i)*.5236;float d=(i<6)?1.0:2.0;acc+=texture2D(tDiffuse,vUv+vec2(cos(a)/asp,sin(a))*px*d).rgb;}col=acc/13.0;}
    float l=dot(col,vec3(.2126,.7152,.0722));col=mix(col,vec3(l),desat+.16);col=mix(col*vec3(.9,.98,1.06),col*vec3(1.08,1.0,.88),smoothstep(.02,.5,l));col=pow(col,vec3(1.08));
    if(thermal>.5){float t=smoothstep(.02,.9,dot(col,vec3(.3,.5,.2))*1.25);col=vec3(t*.8,t,t*.8);}
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
for(let i=0;i<240;i++){const s=new T.Sprite(new T.SpriteMaterial({map:smokeT,transparent:true,depthWrite:false,fog:false}));s.visible=false;s.userData={t:1,life:1};scene.add(s);parts.push(s);}
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
const qa=new T.Quaternion(),va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3();
function normalAt(x,z,out){return out.set(-(hAt(x+2,z)-hAt(x-2,z))/4,1,-(hAt(x,z+2)-hAt(x,z-2))/4).normalize();}
function placeFoe(e,k){e.y=hAt(e.x,e.z);e.n.lerp(normalAt(e.x,e.z,va),k).normalize();e.g.position.set(e.x,e.y,e.z);e.g.quaternion.setFromUnitVectors(UP,e.n).multiply(qa.setFromAxisAngle(UP,e.yaw));e.t.rotation.y=e.tyaw;}
function killFoe(e){if(distTo(e.x,e.z)<340&&!NET.peer)for(let k=0;k<2+(Math.random()<.4?1:0);k++){const a=Math.random()*6.28;addCrew(e.x+Math.cos(a)*4,e.z+Math.sin(a)*4);}
  e.state='dead';e.g.traverse(m=>{if(m.isMesh)m.material=wreckOf(m.material);});e.t.rotation.z=.1;e.t.position.x=.25;explode(e.x,e.y+1.5,e.z,true,false);
  for(let i=0;i<7;i++)puff(e.x,e.y+2,e.z,{add:true,c:[3,1.4,.4],s0:3,s1:9,life:.5+Math.random()*.6,vy:4+Math.random()*5,vx:(Math.random()-.5)*4,vz:(Math.random()-.5)*4});}
function foeFire(e){
  const yw=e.yaw+e.tyaw,mx=e.x-Math.sin(yw)*5,mz=e.z-Math.cos(yw)*5,my=e.y+2.2;
  const d=distTo(e.x,e.z),hullMasked=los(mx,my,mz,P.x,P.y+.75,P.z)>=0;
  let pHit=clamp(1.05-d/600,.15,.8)*(Math.abs(P.v)>2?.5:1)*(hullMasked?.35:1)*(time<P.smokeT?.12:1);if(e.shots===0)pHit=0;e.shots++;
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
      else{e.blind=0;if(e.fireT<=0&&Math.abs(diff)<.03&&state==='play'){e.fireT=6+Math.random()*3.5;const f=friends.filter(f=>f.hp>0&&los(e.x,e.y+2.1,e.z,f.x,f.y+2,f.z)<0);if(f.length&&Math.random()<.2*f.length+(time<P.smokeT?.5:0))foeAtFriend(e,f[Math.floor(Math.random()*f.length)]);else foeFire(e);}}
    }
    placeFoe(e,Math.min(1,dt*3));
  }
}

// ---------- your platoon: two more tanks that hold the line with you
const friends=[];
function resetFriends(){
  for(const f of friends)scene.remove(f.g);friends.length=0;if(NET.peer)return;
  [['Two-One',-85,18],['Two-Two',90,30]].forEach(([name,x,z])=>{const g=heroProto.clone(true);g.traverse(m=>{if(m.isMesh)m.castShadow=false;});scene.add(g);const f={name,g,t:g.getObjectByName('turret'),x,z,y:hAt(x,z),yaw:0,tyaw:0,hp:3,fireT:5+Math.random()*5,smokeT:0};
    g.position.set(x,f.y,z);g.quaternion.setFromUnitVectors(UP,normalAt(x,z,va));friends.push(f);});
}
function straight(from,to,done){const s=shell(false);s.p.copy(from);s.from=from.clone();s.to=to.clone();s.T=from.distanceTo(to)/600;s.done=done;return s;}
function foeAtFriend(e,f){e.shots++;const yw=e.yaw+e.tyaw,m=new T.Vector3(e.x-Math.sin(yw)*5,e.y+2.2,e.z-Math.cos(yw)*5);puff(m.x,m.y,m.z,{add:true,c:[3,2,1],s0:3,s1:9,life:.14});play('gun_far',clamp(1.1/(1+distTo(e.x,e.z)/170),0,1),'out',distTo(e.x,e.z)/340);
  const hit=Math.random()<.35,to=new T.Vector3(f.x+(hit?0:(Math.random()-.5)*24),f.y+(hit?1.8:0),f.z+(hit?0:(Math.random()-.5)*24));
  straight(m,to,()=>{explode(to.x,to.y,to.z,false,!hit);if(hit&&f.hp>0){f.hp--;if(f.hp<=0){f.g.traverse(o=>{if(o.isMesh)o.material=wreckOf(o.material);});explode(f.x,f.y+1.5,f.z,true,false);setHud(f.name+' is knocked out','',4);}else setHud(f.name+': we are hit, still in the fight','',3);}});}
function updateFriends(dt){
  for(const f of friends){
    if(f.hp<=0){f.smokeT-=dt;if(f.smokeT<=0){f.smokeT=.3;puff(f.x,f.y+2,f.z,{c:[.04,.04,.04],s0:2.5,s1:14,life:5,vy:3.5,vx:1.2,op:.8});}continue;}
    let best=null,bd=900;for(const e of foes){if(e.state==='dead')continue;const d=Math.hypot(e.x-f.x,e.z-f.z);if(d<bd&&los(f.x,f.y+2.3,f.z,e.x,e.y+1.5,e.z)<0){bd=d;best=e;}}
    if(!best){f.fireT=Math.max(f.fireT,2);continue;}
    const want=wrap(Math.atan2(-(best.x-f.x),-(best.z-f.z))-f.yaw-f.tyaw);f.tyaw+=clamp(want,-.5*dt,.5*dt);f.t.rotation.y=f.tyaw;f.fireT-=dt;
    if(f.fireT<=0&&Math.abs(want)<.04&&state==='play'){f.fireT=8+Math.random()*5;const yw=f.yaw+f.tyaw,m=new T.Vector3(f.x-Math.sin(yw)*6,f.y+2.1,f.z-Math.cos(yw)*6);
      puff(m.x,m.y,m.z,{add:true,c:[3.2,2.1,1],s0:3,s1:11,life:.14});puff(m.x,m.y,m.z,{c:[.5,.48,.44],s0:2,s1:9,life:2.2,vy:1,op:.6});const d=distTo(f.x,f.z);play('gun_out',clamp(1/(1+d/60),0,.9),'out',d/340);
      const e=best,hit=Math.random()<clamp(.75-bd/900,.15,.6),to=new T.Vector3(e.x+(hit?0:(Math.random()-.5)*20),e.y+(hit?1.5:0),e.z+(hit?0:(Math.random()-.5)*20));
      straight(m,to,()=>{if(hit&&e.state!=='dead'){e.hp--;if(e.hp<=0){killFoe(e);setHud(f.name+': target destroyed',live()?live()+' left':'',3);}else explode(to.x,to.y,to.z,false,false);}else explode(to.x,to.y,to.z,false,true);});}
  }
}

// ---------- the lobby: one room for everyone; a second player in turns the battle into one against one ----------
const NET={ws:null,on:false,bc:null,id:'',slot:0,peer:null,score:[0,0],sendT:0,opened:false};
const SPAWN=[[0,0],[-95,-410]];
const rem={g:heroProto.clone(true),x:0,z:0,yaw:0,tyaw:0,elev:0,tx:0,tz:0,tyw:0,tty:0,tel:0,armour:100,alive:false,on:false,smokeT:0};rem.t=rem.g.getObjectByName('turret');rem.gun=rem.g.getObjectByName('gun');rem.g.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.setRGB(.45,.4,.36);m.castShadow=false;}});rem.g.visible=false;scene.add(rem.g);
function netSend(m){if(NET.bc)NET.bc.postMessage({from:NET.id,m});else if(NET.on&&NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify(m));}
const netOn={
  welcome(m){NET.on=true;NET.slot=m.slot|0;if(m.peers&&m.peers.length)duelStart(m.peers[0].id,false);},
  'peer-join'(m){NET.slot=m.slot===0?1:NET.slot;duelStart(m.id,true);},
  'peer-leave'(){duelEnd();},
  full(){setHud('The lobby is full','Two are already fighting. You are on your own against the waves.',6);},
  pose(m){const p=m.p;rem.tx=p[0];rem.tz=p[1];rem.tyw=p[2];rem.tty=p[3];rem.tel=p[4];rem.armour=p[6];rem.alive=p[6]>0;if(!rem.on){rem.on=true;rem.x=p[0];rem.z=p[1];rem.yaw=p[2];}},
  fire(m){const s=shell(true);s.ghost=true;s.kind=m.k;s.p.fromArray(m.o);s.v.fromArray(m.v);const d=distTo(m.o[0],m.o[2]);puff(m.o[0],m.o[1],m.o[2],{add:true,c:[3.2,2.1,1],s0:3,s1:11,life:.14});puff(m.o[0],m.o[1],m.o[2],{c:[.5,.48,.44],s0:2,s1:9,life:2.2,vy:1,op:.6});play('gun_far',clamp(1.2/(1+d/170),0,1),'out',d/340);},
  hit(m){if(state==='play'&&NET.peer)hurtPlayer((m.d||22)/22/TY.hurt*TY.hurt);},
  dead(){NET.score[0]++;rem.alive=false;explode(rem.x,hAt(rem.x,rem.z)+1.5,rem.z,true,false);P.kills++;setHud('You knocked them out','You '+NET.score[0]+' : '+NET.score[1]+' them. They are coming back.',6);},
  mine(m){layMine(m.o[0],m.o[1],false);},
  smoke(){rem.smokeT=time+22;for(let i=0;i<8;i++){const a=rem.yaw+rem.tyaw+(i-3.5)*.16,d=40,x=rem.x-Math.sin(a)*d,z=rem.z-Math.cos(a)*d,y=hAt(x,z);for(let k=0;k<5;k++)puff(x+(Math.random()-.5)*8,y+1+k*1.6,z+(Math.random()-.5)*8,{c:[.78,.78,.76],s0:5,s1:26,life:18,vy:.25,op:.95});}}
};
function netOpen(){
  if(NET.opened)return;NET.opened=true;const q=new URLSearchParams(location.search);
  if(q.has('local')){const bc=NET.bc=new BroadcastChannel('tank-local'),id=NET.id='p'+Math.random().toString(36).slice(2,8),slot=+q.get('slot')||0;
    bc.onmessage=e=>{const d=e.data;if(!d||d.from===id)return;if(d.hello){netOn['peer-join']({id:d.from,slot:d.slot});if(d.hello===1)bc.postMessage({from:id,hello:2,slot});return;}if(d.bye)return netOn['peer-leave']();if(netOn[d.m.t])netOn[d.m.t](d.m);};
    NET.on=true;NET.slot=slot;bc.postMessage({from:id,hello:1,slot});addEventListener('pagehide',()=>bc.postMessage({from:id,bye:1}));return;}
  if(location.protocol==='file:')return;let retry=1500;
  const open=()=>{let ws;try{ws=new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/parties/tank/public');}catch(e){return;}NET.ws=ws;
    ws.onopen=()=>{retry=1500;ws.send('{"t":"join"}');};ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(err){return;}if(m.t==='full')NET.full=true;if(netOn[m.t])netOn[m.t](m);};
    ws.onclose=()=>{const was=NET.on;NET.on=false;if(was&&NET.peer)duelEnd();if(!NET.full)setTimeout(open,retry=Math.min(retry*2,20000));};ws.onerror=()=>{};};open();
}
function duelPlace(){const a=SPAWN[NET.slot],b=SPAWN[1-NET.slot];P.x=a[0];P.z=a[1];P.y=hAt(P.x,P.z);P.yaw=P.aimYaw=Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]));P.tyaw=0;P.v=0;}
function duelStart(id,joined){
  NET.peer=id;NET.score=[0,0];rem.on=false;rem.alive=true;
  if(state==='play'||state==='over'||state==='dead'){reset();state='play';duelPlace();syncUi();}
  setHud(joined?'Another player has joined':'Another player is here','One against one. They are '+Math.round(Math.hypot(SPAWN[1][0]-SPAWN[0][0],SPAWN[1][1]-SPAWN[0][1]))+' m off, dead ahead. Find them first.',9);
}
function duelEnd(){if(!NET.peer)return;NET.peer=null;rem.on=false;rem.g.visible=false;if(state==='play'||state==='dead'||state==='over'){reset();state='play';syncUi();}setHud('The other player has left','Back to the waves.',6);}
function updateNet(dt){
  if(!NET.peer){rem.g.visible=false;return;}
  NET.sendT-=dt;if(NET.sendT<=0&&state!=='preview'){NET.sendT=.1;netSend({t:'pose',p:[P.x,P.z,P.yaw,P.tyaw,P.elev,P.hatch,state==='play'?P.armour:0,P.v]});}
  if(!rem.on)return;const k=Math.min(1,dt*9);rem.x=lerp(rem.x,rem.tx,k);rem.z=lerp(rem.z,rem.tz,k);rem.yaw+=wrap(rem.tyw-rem.yaw)*k;rem.tyaw+=wrap(rem.tty-rem.tyaw)*k;rem.elev=lerp(rem.elev,rem.tel,k);
  rem.g.visible=true;rem.g.position.set(rem.x,hAt(rem.x,rem.z),rem.z);rem.g.quaternion.setFromUnitVectors(UP,normalAt(rem.x,rem.z,va)).multiply(qa.setFromAxisAngle(UP,rem.yaw));rem.t.rotation.y=rem.tyaw;rem.gun.rotation.x=rem.elev;
  if(!rem.alive&&Math.random()<dt*4)puff(rem.x,hAt(rem.x,rem.z)+2,rem.z,{c:[.04,.04,.04],s0:2.5,s1:14,life:5,vy:3.5,vx:1.2,op:.8});
}

// ---------- on foot: the crews that bail out, and what you carry for them (a pistol, grenades, mines for the ground) ----------
const crews=[],nades=[],mines=[];
prep(M.soldier,m=>{m.envMapIntensity=.3;});prep(M.pistol,m=>{m.envMapIntensity=.5;});prep(M.grenade,m=>{m.envMapIntensity=.4;m.color.setRGB(.5,.55,.42);});
const mineGeo=new T.LatheGeometry([[0,0],[.155,0],[.16,.02],[.16,.07],[.13,.09],[.05,.09],[.05,.105],[0,.105]].map(q=>new T.Vector2(q[0],q[1])),28),mineMat=new T.MeshStandardMaterial({map:A0.paint.d,normalMap:A0.paint.n,color:0x6a7350,roughness:.8,metalness:.3,envMapIntensity:.3});
const clip=n=>M.soldier.userData.clips.find(c=>c.name===n);
function addCrew(x,z){
  const g=T.SkeletonUtils.clone(M.soldier);g.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});scene.add(g);
  const c={g,x,z,y:hAt(x,z),mx:new T.AnimationMixer(g),act:null,state:'run',fireT:1+Math.random()*2,near:0,dead:0,want:20+Math.random()*12};
  c.play=(n,once)=>{const a=c.mx.clipAction(clip(n));if(c.act===a)return;if(c.act)c.act.fadeOut(.2);a.reset().fadeIn(.2).play();if(once){a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;}c.act=a;};c.play('sprint');crews.push(c);return c;
}
function killCrew(c){if(c.state==='dead')return;c.state='dead';c.dead=0;c.play('death',true);P.crewKills=(P.crewKills||0)+1;}
function blast(x,y,z,r){for(const c of crews)if(c.state!=='dead'&&Math.hypot(c.x-x,c.z-z)<r)killCrew(c);}
function updateCrews(dt){
  for(let i=crews.length-1;i>=0;i--){const c=crews[i];c.mx.update(dt);
    if(c.state==='dead'){c.dead+=dt;if(c.dead>25){scene.remove(c.g);crews.splice(i,1);}continue;}
    const dx=P.x-c.x,dz=P.z-c.z,d=Math.hypot(dx,dz);c.g.rotation.y=Math.atan2(dx,dz);
    if(d<2.4&&Math.abs(P.v)>1.5){killCrew(c);continue;}
    if(c.state==='run'){if(d>c.want){c.x+=dx/d*4.6*dt;c.z+=dz/d*4.6*dt;}else{c.state='shoot';c.play('crouch');}}
    else{if(d>c.want+14){c.state='run';c.play('sprint');}c.fireT-=dt;
      if(c.fireT<=0&&state==='play'){c.fireT=1.3+Math.random()*1.6;const out=!P.headIn;va.set(c.x,c.y+1.1,c.z);vb.set(P.x+(Math.random()-.5)*2,P.y+2.6+(Math.random()-.5),P.z+(Math.random()-.5)*2);straight(va,vb,()=>{}).T=.08;
        play('crack',clamp(.5/(1+d/30),0,.5),'out',d/340,1.6);if(out&&Math.random()<.2){P.armour=Math.max(1,P.armour-5);P.hurt=.6;P.shake=.5;play('rico',.5);setHud('You are hit','Rifle fire. Shoot back or close the hatch.',3);}else if(Math.random()<.4)play('rico',.25,'out',0,1.2);}
      if(d<12&&P.headIn){c.near+=dt;if(c.near>7){c.near=0;P.dmg.tracks=Math.max(P.dmg.tracks,10);P.armour=Math.max(1,P.armour-12);P.shake=1.2;P.hurt=.8;explode(P.x+2,P.y+.4,P.z,false,true);play('clang',.8);setHud('They put a charge under your track','Men on foot at your hull. Get your head out and deal with them.',5);}}else c.near=0;}
    c.y=hAt(c.x,c.z);c.g.position.set(c.x,c.y,c.z);
  }
}
// the things in your hand when your head is out
const INV={pistol:8,mags:3,grenade:4,mine:3,reload:0,kick:0};
const vm=new T.Group();vm.position.set(.2,-.19,-.42);camera.add(vm);vm.visible=false;
const held={pistol:M.pistol.clone(),grenade:M.grenade.clone(),mine:new T.Mesh(mineGeo,mineMat)};held.pistol.position.set(0,-.085,-.02);held.grenade.position.set(0,-.02,-.04);held.mine.position.set(0,-.05,-.06);held.mine.rotation.x=.5;for(const k in held){held[k].visible=false;vm.add(held[k]);}
const vmArm=new T.Mesh(new T.CylinderGeometry(.036,.044,1,12),sleeveMat);camera.add(vmArm);vmArm.visible=false;
function takeItem(k){if(state!=='play')return;if(P.headIn){setHud('Open the hatch first','Your pistol, grenades and mines are for when your head is out.',2.5);return;}P.item=P.item===k?null:k;view.yaw=P.aimYaw;view.pitch=P.aimPitch;play('switch',.3);syncUi();}
function useItem(){
  const it=P.item;if(!it||it==='bino')return;const vr=xrActive&&xr.ctrl.right;tank.updateMatrixWorld();
  if(vr){xr.ctrl.right.getWorldPosition(va);xr.ctrl.right.getWorldQuaternion(qa);}else{camera.getWorldPosition(va);camera.getWorldQuaternion(qa);}vb.set(0,0,-1).applyQuaternion(qa);
  if(it==='pistol'){if(INV.reload>0)return;if(INV.pistol<=0){reloadPistol();return;}INV.pistol--;INV.kick=1;play('crack',.9,'dry',0,1.35);haptic(.7,60);puff(va.x+vb.x*.4,va.y+vb.y*.4,va.z+vb.z*.4,{add:true,c:[3,2,1],s0:.15,s1:.5,life:.06});
    let best=null,bt=75;for(const c of crews){if(c.state==='dead')continue;vc.set(c.x-va.x,c.y+1.0-va.y,c.z-va.z);const t=vc.dot(vb);if(t>0&&t<bt&&vc.addScaledVector(vb,-t).length()<.5+t*.012){bt=t;best=c;}}
    if(best){killCrew(best);setHud('Man down','',1.5);}vc.copy(va).addScaledVector(vb,best?bt:60);straight(va,vc,()=>{}).T=.06;}
  else if(it==='grenade'){if(INV.grenade<=0){setHud('No grenades left','',2);return;}INV.grenade--;const g=M.grenade.clone();g.scale.setScalar(1.6);scene.add(g);g.position.copy(va).addScaledVector(vb,.4);
    const v=vr&&xr.vel?xr.vel.clone().multiplyScalar(1.7).applyQuaternion(tank.getWorldQuaternion(qa)):vb.clone().multiplyScalar(15).add(vc.set(0,5,0));nades.push({g,v,t:3.2});play('latch',.5);if(!INV.grenade)P.item=null;}
  else if(it==='mine'){if(INV.mine<=0){setHud('No mines left','',2);return;}INV.mine--;layMine(va.x+vb.x*5.5,va.z+vb.z*5.5,true);play('thump',.5);setHud('Mine laid','It arms in three seconds. Mind where you drive.',3);if(!INV.mine)P.item=null;}
  syncUi();
}
function reloadPistol(){if(INV.reload>0||INV.pistol>=8)return;if(INV.mags<=0){setHud('No pistol magazines left','',2);return;}INV.mags--;INV.reload=1.6;play('latch',.6);play('breech',.3,'dry',1.1,1.8);}
function layMine(x,z,mine){const m=new T.Mesh(mineGeo,mineMat);m.position.set(x,hAt(x,z)+.01,z);m.castShadow=true;scene.add(m);mines.push({m,x,z,t:3,mine});if(mine&&NET.peer)netSend({t:'mine',o:[x,z]});}
function updateCarry(dt){
  INV.kick=Math.max(0,INV.kick-dt*7);if(INV.reload>0){INV.reload-=dt;if(INV.reload<=0){INV.reload=0;INV.pistol=8;}}
  const it=P.item&&P.item!=='bino'?P.item:null,flat=!xrActive&&it;vm.visible=!!flat;vmArm.visible=!!flat;for(const k in held)held[k].visible=false;
  if(flat){held[it].visible=true;vm.rotation.x=INV.kick*.18-(INV.reload>0?.7*Math.sin(Math.PI*(1-INV.reload/1.6)):0);const h=hands.right;if(h.root.parent!==vm)vm.add(h.root);h.root.visible=true;h.root.position.set(.012,-.075,.07);h.root.rotation.set(0,0,-Math.PI/2);h.curl[0]=.5;h.curl[1]=it==='pistol'?.55:.8;h.curl[2]=h.curl[3]=h.curl[4]=.85;
    va.set(.2,-.26,-.34);vb.set(.34,-.62,.05);span(vmArm,vb,va);}
  else if(hands.right.root.parent===vm){rig.add(hands.right.root);}
  if(xrActive&&it&&xr.ctrl.right){const o=held[it];if(o.parent!==xr.ctrl.right)xr.ctrl.right.add(o);o.visible=true;o.position.set(0,it==='pistol'?-.1:-.03,it==='pistol'?-.04:-.05);}else for(const k in held)if(held[k].parent!==vm)vm.add(held[k]);
  for(let i=nades.length-1;i>=0;i--){const n=nades[i];n.t-=dt;n.v.y-=9.8*dt;n.g.position.addScaledVector(n.v,dt);n.g.rotation.x+=dt*9;const gy=hAt(n.g.position.x,n.g.position.z)+.07;if(n.g.position.y<gy){n.g.position.y=gy;n.v.y*=-.3;n.v.x*=.5;n.v.z*=.5;}
    if(n.t<=0){const q=n.g.position;explode(q.x,q.y,q.z,false,true);blast(q.x,q.y,q.z,9);for(const e of foes)if(e.state!=='dead'&&Math.hypot(e.x-q.x,e.z-q.z)<3.5){e.hp-=1;if(e.hp<=0){killFoe(e);P.kills++;}}if(distTo(q.x,q.z)<7&&!P.headIn){P.armour=Math.max(1,P.armour-10);P.hurt=.8;}scene.remove(n.g);nades.splice(i,1);}}
  for(let i=mines.length-1;i>=0;i--){const m=mines[i];m.t-=dt;if(m.t>0)continue;let hit=false;
    for(const e of foes)if(e.state!=='dead'&&Math.hypot(e.x-m.x,e.z-m.z)<3.3){e.hp-=2;hit=true;if(e.hp<=0){killFoe(e);P.kills++;setHud('Your mine got one',live()?live()+' left':'',3);}}
    if(!hit&&distTo(m.x,m.z)<3&&state==='play'&&(!m.mine||m.left)){hit=true;P.dmg.tracks=Math.max(P.dmg.tracks,12);hurtPlayer(1.6);}if(m.mine&&distTo(m.x,m.z)>8)m.left=true;
    if(hit){explode(m.x,hAt(m.x,m.z)+.3,m.z,true,true);blast(m.x,0,m.z,7);scene.remove(m.m);mines.splice(i,1);}}
}
// the coaxial gun beside the cannon: for men on foot
let coaxT=0;
function updateCoax(dt){
  const on=state==='play'&&P.headIn&&(keys.KeyC||xrActive&&xr.trig.left>.5&&P.item!=='bino');coaxT-=dt;if(!on||coaxT>0)return;coaxT=.085;
  tank.updateMatrixWorld();muzzle.getWorldPosition(va);gunN.getWorldQuaternion(qa);vb.set((Math.random()-.5)*.012,(Math.random()-.5)*.012,-1).applyQuaternion(qa).normalize();va.addScaledVector(vb,-4.2);va.y+=.1;
  let R=600;for(let d=10;d<600;d+=8){if(va.y+vb.y*d<hAt(va.x+vb.x*d,va.z+vb.z*d)){R=d;break;}}
  for(const c of crews){if(c.state==='dead')continue;vc.set(c.x-va.x,c.y+1-va.y,c.z-va.z);const t=vc.dot(vb);if(t>0&&t<R&&vc.addScaledVector(vb,-t).length()<.7+t*.006&&Math.random()<.5)killCrew(c);}
  vc.copy(va).addScaledVector(vb,R);straight(va,vc,()=>{}).T=R/900;play('crack',.3*(1.1-outside()),'dry',0,1.9);play('crack',.3*outside(),'out',0,1.9);if(Math.random()<.3)puff(vc.x,vc.y+.2,vc.z,{c:[.4,.36,.28],s0:.4,s1:1.8,life:.6,vy:1,op:.5});P.shake=Math.max(P.shake,.08);
}

// ---------- state ----------
let time=0,state='preview',xrActive=false,wave=0,waveT=0,endT=0,statT2=0,cover='';
const WAVES=[2,3,4,5];
const P={x:0,z:0,y:0,yaw:0,v:0,tyaw:0,elev:.03,aimYaw:0,aimPitch:0,armour:100,rounds:40,reload:0,shake:0,hurt:0,hatch:0,hatchOpen:false,sight:false,recoil:0,kills:0,shots:0,hits:0,n:new T.Vector3(0,1,0),ammo:{S:22,H:18},loaded:'S',next:'S',range:400,lased:-99,zoom:0,thermal:false,smoke:2,smokeT:-99,power:1,dmg:{tracks:0,trav:0,sight:0,fire:0}};
const AMMO={S:{name:'SABOT',v:900},H:{name:'HEAT',v:450}};
// the three tanks: what each gives and what it costs
const TYPES={heavy:{name:'CHALLENGER',speed:9,turn:.5,trav:.6,hurt:1,reload:1,S:22,H:18,smoke:2,reach:380,zoom:3,tint:[.82,.82,.82]},
  light:{name:'SCIMITAR',speed:14.5,turn:.8,trav:.95,hurt:1.7,reload:.72,S:14,H:12,smoke:4,reach:230,zoom:3.6,tint:[.5,.6,.42]},
  hunter:{name:'ARCHER',speed:6.4,turn:.36,trav:.34,hurt:1.3,reload:1.45,S:14,H:6,smoke:1,reach:5000,zoom:1.9,tint:[.86,.74,.52]}};
let TY=TYPES.heavy,tyKey='heavy';
const myMats=[];M.hero.traverse(m=>{if(m.isMesh&&!myMats.includes(m.material))myMats.push(m.material);});
function setType(k){tyKey=TYPES[k]?k:'heavy';TY=TYPES[tyKey];for(const m of myMats)m.color.setRGB(TY.tint[0],TY.tint[1],TY.tint[2]);try{localStorage.setItem('hulldown-tank',tyKey);}catch(e){}document.querySelectorAll('[data-tank]').forEach(b=>b.classList.toggle('on',b.dataset.tank===tyKey));}
const fcsLine=i=>i===0?'RNG '+String(Math.round(P.range)).padStart(4,'0')+(time-P.lased<12?' LRF':' BS'):i===1?(P.loaded?AMMO[P.loaded].name:'LOADING')+' '+(P.zoom?'x'+Math.round(72/TY.zoom):'x8'):(P.thermal?'TI WHT':'DAY')+(P.dmg.sight>0?' · SIGHT DAMAGED':'');
let expo=.62;
const keys={};
let best=0;try{best=+localStorage.getItem('hulldown-best')||0;}catch(e){}
function showBest(){const el=$('best');el.hidden=!best;el.textContent='Most tanks knocked out in one battle: '+best;}
showBest();
function haptic(v,ms){const s=renderer.xr.getSession&&renderer.xr.getSession();if(!s)return;for(const src of s.inputSources){const a=src.gamepad&&src.gamepad.hapticActuators&&src.gamepad.hapticActuators[0];if(a&&a.pulse)a.pulse(v,ms).catch(()=>{});}}
const live=()=>foes.filter(e=>e.state!=='dead').length;

function reset(){
  for(const e of foes)scene.remove(e.g);foes.length=0;while(shells.length)dropShell(shells[0]);for(const c of crews)scene.remove(c.g);crews.length=0;for(const n of nades)scene.remove(n.g);nades.length=0;for(const m of mines)scene.remove(m.m);mines.length=0;Object.assign(INV,{pistol:8,mags:3,grenade:4,mine:3,reload:0});
  Object.assign(P,{x:0,z:0,yaw:0,v:0,tyaw:0,elev:.03,aimYaw:0,aimPitch:0,armour:100,rounds:40,reload:0,shake:0,hurt:0,hatch:0,hatchOpen:false,sight:false,recoil:0,kills:0,shots:0,hits:0,ammo:{S:TY.S,H:TY.H},rounds:TY.S+TY.H,loaded:'S',next:'S',range:400,lased:-99,zoom:0,thermal:false,smoke:TY.smoke,smokeT:-99,power:1,dmg:{tracks:0,trav:0,sight:0,fire:0}});
  resetFriends();
  wave=0;waveT=5;endT=0;deathFade=0;expo=.7;
}
function spawnWave(){
  const n=WAVES[wave],base=P.yaw+P.tyaw,spread=[.7,1.3,2.1,3.1][wave];
  for(let i=0;i<n;i++){const a=base+(Math.random()-.5)*2*spread,d=540+Math.random()*110,hold=i===n-1?110+Math.random()*50:300+Math.random()*120,a2=a+(Math.random()-.5)*.3;
    addFoe(P.x-Math.sin(a)*d,P.z-Math.cos(a)*d,P.x-Math.sin(a2)*hold,P.z-Math.cos(a2)*hold);}
  setHud('Wave '+(wave+1)+' of '+WAVES.length+' · '+n+' tanks','They are on the plot. Find a crest and lay the gun.',7);
}
function beginPlay(){
  netOpen();
  if(state==='preview'||state==='over'){reset();state='play';if(NET.peer)duelPlace();
    setHud(xrActive?'The screen ahead is your gunsight':'F is the gunsight. H opens the hatch.',xrActive?'Right stick lays the gun. Left trigger lases, right trigger fires.':'R lases the range, Space fires. 1 and 2 pick the round.',9);}
  syncUi();
}
function toggleHatch(){if(state!=='play')return;P.hatchOpen=!P.hatchOpen;if(P.hatchOpen)P.sight=false;else P.item=null;play(P.hatchOpen?'hatch':'slam',.8);syncUi();}
function toggleZoom(){if(state!=='play')return;P.zoom=P.zoom?0:1;play('switch',.4);}
function toggleThermal(){if(state!=='play')return;if(P.dmg.sight>0){setHud('Sight damaged','',2);return;}P.thermal=!P.thermal;play('switch',.5);}
function toggleSight(){if(state!=='play'||xrActive)return;P.item=null;P.sight=!P.sight;play('switch',.6);syncUi();}
function syncUi(){const flat=!xrActive&&state!=='preview'&&$('overlay').hidden;$('scope').hidden=!(flat&&P.sight);$('bino').hidden=!(flat&&P.item==='bino');$('inv').hidden=!(flat&&P.item&&P.item!=='bino');$('inv').textContent=P.item==='pistol'?'PISTOL  '+INV.pistol+' / '+INV.mags+' mags   R reloads':P.item==='grenade'?'GRENADES  '+INV.grenade:'MINES  '+INV.mine;$('dot').hidden=$('gunmark').hidden=!(flat&&!P.sight&&state==='play'&&P.item!=='bino');$('stat').hidden=!flat;}
function fire(){
  if(state!=='play'||P.reload>0||!P.loaded)return false;
  const kind=P.loaded,v=AMMO[kind].v;P.ammo[kind]--;P.rounds=P.ammo.S+P.ammo.H;P.loaded=null;P.shots++;P.reload=(kind==='S'?3.6:4.2)*TY.reload;P.reloadFull=P.reload;P.recoil=1;P.shake=Math.max(P.shake,.8);
  tank.updateMatrixWorld();muzzle.getWorldPosition(va);gunN.getWorldQuaternion(qa);vb.set(0,0,-1).applyQuaternion(qa);
  vb.applyAxisAngle(vc.set(1,0,0).applyQuaternion(qa),.5*Math.asin(clamp(9.8*P.range/(v*v),0,1))+hAtAim());
  const s=shell(true);s.kind=kind;s.p.copy(va);s.v.copy(vb).multiplyScalar(v);if(NET.peer)netSend({t:'fire',o:va.toArray(),v:s.v.toArray(),k:kind});
  puff(va.x,va.y,va.z,{add:true,c:[3.4,2.2,1.1],s0:3,s1:12,life:.13});
  for(let i=0;i<7;i++)puff(va.x+vb.x*i,va.y+vb.y*i,va.z+vb.z*i,{c:[.5,.47,.42],s0:1.5,s1:8+i,life:2+Math.random()*1.5,vx:vb.x*(7-i),vy:.8,vz:vb.z*(7-i),op:.6});
  for(let i=0;i<6;i++){const a=Math.random()*6.28;puff(P.x+Math.cos(a)*3,P.y+.3,P.z+Math.sin(a)*3,{c:[.38,.33,.25],s0:1.5,s1:7,life:2.4,vx:Math.cos(a)*3,vz:Math.sin(a)*3,vy:.6,op:.4});}
  const o=outside();play('gun_in',1.1*(1.05-o));play('gun_out',o,'out');play('crack',.8*o,'out');play('breech',.6,'dry',.9);play('thump',.5,'dry',2.0);play('latch',.5,'dry',3.2);
  haptic(1,180);return true;
}
// the gun sits a little under the sight's line: nothing to add on level ground
function hAtAim(){return 0;}
function selectAmmo(k){if(state!=='play'||!P.ammo[k])return;P.next=k;play('switch',.5);setHud('Next round: '+AMMO[k].name,P.loaded&&P.loaded!==k?'The '+AMMO[P.loaded].name+' in the breech goes first.':'',2.5);}
function lase(){
  if(state!=='play')return;lookRay(va,vb);let R=0;
  for(let d=20;d<3200&&!R;d+=4){const x=va.x+vb.x*d,y=va.y+vb.y*d,z=va.z+vb.z*d;if(y<hAt(x,z)){R=d;break;}if(NET.peer&&rem.on){const dx=x-rem.x,dz=z-rem.z;if(dx*dx+dz*dz<9&&Math.abs(y-hAt(rem.x,rem.z)-1.4)<1.8){R=d;break;}}for(const e of foes){const dx=x-e.x,dz=z-e.z,dy=y-(e.y+1.4);if(dx*dx+dz*dz<9&&Math.abs(dy)<1.8){R=d;break;}}}
  play('beep',.6,'dry',0,1.5);if(!R){setHud('No return','Lay the sight on the ground or the target and lase again.',2);return;}P.range=clamp(R,50,3000);P.lased=time;
}
function popSmoke(){
  if(state!=='play')return;if(P.smoke<=0){setHud('Smoke dischargers empty','',2);return;}P.smoke--;if(NET.peer)netSend({t:'smoke'});P.smokeT=time+22;play('thump',.9);play('crack',.4,'out',.1);
  const yw=P.yaw+P.tyaw;for(let i=0;i<8;i++){const a=yw+(i-3.5)*.16,d=38+Math.random()*10,x=P.x-Math.sin(a)*d,z=P.z-Math.cos(a)*d,y=hAt(x,z);
    for(let k=0;k<5;k++)puff(x+(Math.random()-.5)*8,y+1+k*1.6,z+(Math.random()-.5)*8,{c:[.78,.78,.76],s0:5,s1:24+Math.random()*8,life:16+Math.random()*8,vy:.25,op:.95});}
  setHud('Smoke out','They cannot lay on you for twenty seconds. Move.',3);
}
function extinguish(){if(P.dmg.fire>0){P.dmg.fire=0;play('whizz',.5,'dry',0,2);setHud('Fire out','',2);}}
function hurtPlayer(by){
  const dmg=Math.round((P.hatch>.5?34:22)*TY.hurt*(by||1));P.armour=Math.max(0,P.armour-dmg);P.shake=1.4;P.hurt=1;play('clang',1);play('boom',.8);haptic(1,400);
  if(P.armour<=0){state='dead';endT=0;setHud('','');if(NET.peer)netSend({t:'dead'});return;}
  const r=Math.random();let what='';
  if(r<.2){P.dmg.tracks=12;what='Track hit. Crew repairing: 12 seconds, you cannot move.';}
  else if(r<.36){P.dmg.trav=16;what='Turret drive damaged. Traverse is slow.';}
  else if(r<.5){P.dmg.sight=12;what='Sight damaged. Picture breaking up.';}
  else if(r<.66){P.dmg.fire=7;what='Engine fire! Press X for the extinguisher.';}
  setHud('Hit · armour '+P.armour+'%',what||(P.hatch>.5?'You were head out. Close the hatch under fire.':cover==='EXPOSED'?'Your hull is showing. Back down behind a crest.':''),5);
}
function updateShells(dt){
  for(let i=shells.length-1;i>=0;i--){const s=shells[i];s.t+=dt;
    if(!s.mine){const k=s.t/s.T;if(k>=1){dropShell(s);if(s.done){s.done();continue;}
        if(s.hit&&state==='play'){explode(s.to.x,s.to.y,s.to.z,false,false);hurtPlayer();}
        else{explode(s.to.x,s.to.y,s.to.z,false,true);const d=distTo(s.to.x,s.to.z);if(d<26&&state==='play'){P.shake=Math.max(P.shake,.5);haptic(.4,120);}}
        continue;}
      if(!s.done&&!s.whizz&&k>.55&&state==='play'){s.whizz=1;play('whizz',.7,'out',0,1.2);}
      s.p.lerpVectors(s.from,s.to,k);s.p.y+=Math.sin(k*Math.PI)*s.T*s.T*1.2;}
    else{let gone=false;const steps=Math.max(1,Math.ceil(s.v.length()*dt/2.5)),h=dt/steps;
      for(let n=0;n<steps&&!gone;n++){s.v.y-=9.8*h;s.p.addScaledVector(s.v,h);
        if(NET.peer&&rem.on&&rem.alive&&!s.ghost){const dx=s.p.x-rem.x,dz=s.p.z-rem.z,dy=s.p.y-(hAt(rem.x,rem.z)+1.3);if(dx*dx+dz*dz<8&&Math.abs(dy)<1.5){const side=(-Math.sin(rem.yaw)*s.v.x-Math.cos(rem.yaw)*s.v.z)/Math.hypot(s.v.x,s.v.z)>-.5,d=(s.kind==='S'?(s.t*900<TY.reach?40:26):24)*(side?1.5:1);
          netSend({t:'hit',d:Math.round(d)});P.hits++;gone=true;explode(s.p.x,s.p.y,s.p.z,false,false);setHud('Hit',side?'Into their side.':'On their front plate.',3);}}
        if(s.ghost){const dx=s.p.x-P.x,dz=s.p.z-P.z;if(dx*dx+dz*dz<9&&Math.abs(s.p.y-(P.y+1.3))<1.6)gone=true;}
        if(!gone)for(const e of foes){if(e.state==='dead')continue;const dx=s.p.x-e.x,dz=s.p.z-e.z,dy=s.p.y-(e.y+1.3);
          if(dx*dx+dz*dz<7.3&&Math.abs(dy)<1.5){const side=(-Math.sin(e.yaw)*s.v.x-Math.cos(e.yaw)*s.v.z)/Math.hypot(s.v.x,s.v.z)>-.5;
            e.hp-=side||(s.kind==='S'&&s.t*900<TY.reach)?2:1;P.hits++;gone=true;
            if(e.hp<=0){killFoe(e);P.kills++;setHud('Target destroyed',live()?live()+' left':'',3);}
            else{explode(s.p.x,s.p.y,s.p.z,false,false);play('rico',.5,'out',distTo(e.x,e.z)/340);e.fireT=Math.max(e.fireT,2.5);setHud('Hit','Front armour held. Hit it again.',3);}
            break;}}
        if(!gone)for(const o of solids){const ox=s.p.x-o.x,oz=s.p.z-o.z;if(ox*ox+oz*oz<o.r*o.r&&s.p.y<hAt(o.x,o.z)+o.h){explode(s.p.x,s.p.y,s.p.z,s.kind==='H',false);gone=true;break;}}
        if(!gone&&s.p.y<hAt(s.p.x,s.p.z)){explode(s.p.x,s.p.y,s.p.z,s.kind==='H',true);if(!s.ghost)blast(s.p.x,s.p.y,s.p.z,s.kind==='H'?10:3);gone=true;}
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
      const ks=(P.sight?(P.zoom?.04:.12):.9)*dt;P.aimYaw+=((keys.ArrowLeft||keys.KeyQ?1:0)-(keys.ArrowRight||keys.KeyE?1:0))*ks;P.aimPitch=clamp(P.aimPitch+((keys.ArrowUp?1:0)-(keys.ArrowDown?1:0))*ks,-1.2,1.2);}
    else{thr=xr.thr;steer=xr.steer;trav=xr.trav;elv=xr.elv;}
  }
  P.thr=thr;
  for(const k in P.dmg)if(P.dmg[k]>0){P.dmg[k]=Math.max(0,P.dmg[k]-dt);if(k==='fire'){P.armour=Math.max(1,P.armour-2.2*dt);if(Math.random()<dt*8)puff(P.x+Math.sin(P.yaw)*3.6,P.y+1.8,P.z+Math.cos(P.yaw)*3.6,{add:true,c:[2.6,1,.3],s0:.8,s1:2.6,life:.5,vy:2.5});}}
  if(P.dmg.tracks>0)thr=0;P.power=P.dmg.fire>0?.6:1;
  const vT=thr>0?TY.speed*thr:TY.speed*.45*thr;P.v+=clamp(vT-P.v,-6*dt,(Math.abs(vT)>Math.abs(P.v)?3:6)*dt);
  P.yaw+=steer*TY.turn*dt*(P.v<-.5?-1:1);
  let nx=P.x-Math.sin(P.yaw)*P.v*dt,nz=P.z-Math.cos(P.yaw)*P.v*dt;const r=Math.hypot(nx,nz);
  if(r>640){nx*=640/r;nz*=640/r;P.v*=.5;if(play_&&!hudUntil)setHud('Edge of the sector','Turn back.',3);}
  {const pd=pondAt(nx,nz);if(pd&&Math.hypot(nx-pd[0],nz-pd[1])<pd[2]*.9)P.v*=1-Math.min(1,dt*2.2);}
  for(const o of solids){const ox=nx-o.x,oz=nz-o.z,d=Math.hypot(ox,oz),m=o.r+2.1;if(d<m&&d>1e-3){nx=o.x+ox/d*m;nz=o.z+oz/d*m;P.v*=.6;}}
  P.x=nx;P.z=nz;
  const bump=Math.abs(P.v)*.004*Math.sin(time*13);
  P.y=lerp(P.y,hAt(P.x,P.z),Math.min(1,dt*8))+bump*dt*8;
  const level=xrActive&&$('levelToggle').checked;
  if(level)P.n.lerp(UP,Math.min(1,dt*3)).normalize();else P.n.lerp(normalAt(P.x,P.z,va),Math.min(1,dt*2.5)).normalize();
  tank.position.set(P.x,P.y,P.z);tank.quaternion.setFromUnitVectors(UP,P.n).multiply(qa.setFromAxisAngle(UP,P.yaw));
  const before=P.tyaw;
  const tr=(P.dmg.trav>0?.3:1)*TY.trav/.6;
  if(xrActive){if(trav||elv)xr.slew=null;if(xr.slew){P.tyaw=wrap(P.tyaw+clamp(wrap(xr.slew.yaw-P.yaw-P.tyaw),-.6*tr*dt,.6*tr*dt));P.elev=toward(P.elev,clamp(xr.slew.pitch,-.14,.32),.25*dt);}
    else{P.tyaw=wrap(P.tyaw-trav*.55*tr*dt);P.elev=clamp(P.elev+elv*.22*dt,-.14,.32);}}
  else if(play_||state==='preview'){P.tyaw=wrap(P.tyaw+clamp(wrap(P.aimYaw-P.yaw-P.tyaw),-.6*tr*dt,.6*tr*dt));P.elev=toward(P.elev,clamp(P.aimPitch,-.14,.32),.25*dt);}
  P.turning=Math.abs(wrap(P.tyaw-before))/Math.max(dt,1e-3);
  turret.rotation.y=P.tyaw;gunN.rotation.x=P.elev;breech.rotation.x=P.elev;
  P.recoil=Math.max(0,P.recoil-dt*(P.recoil>.6?9:1.4));const rc=.4*Math.sin(Math.min(1,P.recoil)*Math.PI*.5);gunN.position.set(TRUN.x,TRUN.y,TRUN.z+rc);breechSlide.position.z=rc;
  if(P.reload>0){P.reload-=dt;if(P.reload<=0){P.reload=0;P.loaded=P.ammo[P.next]?P.next:P.ammo.S?'S':P.ammo.H?'H':null;if(P.loaded){play('switch',.5);haptic(.3,60);}else setHud('Out of rounds','',4);}}
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
  if(state==='play'&&!NET.peer){
    if(!live()){
      if(wave>=WAVES.length&&foes.length){state='over';endT=0;best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();
        setHud('Sector held · '+P.kills+' tanks',P.shots+' rounds fired, '+P.hits+' hits. Fire to fight again.',0);}
      else{waveT-=dt;if(waveT<=0){spawnWave();wave++;waveT=7;}}
    }
  }else if(state==='dead'){
    endT+=dt;deathFade=clamp(endT/1.6,0,1);
    if(endT>2.4&&NET.peer){NET.score[1]++;reset();duelPlace();state='play';syncUi();setHud('Knocked out','You '+NET.score[0]+' : '+NET.score[1]+' them. Back at your start line.',6);}
    else if(endT>2.4){best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();const k=P.kills,w=wave;reset();state='over';
      setHud('Knocked out on wave '+w+' · '+k+' tanks','Fire to fight again.',0);}
  }
  if(state==='play'){const sp=land.userData.supply,near=Math.hypot(P.x-sp[0],P.z-sp[1])<16&&Math.abs(P.v)<1,need=P.ammo.S<TY.S||P.ammo.H<TY.H||P.smoke<TY.smoke||P.armour<100;
    if(near&&need){P.supT=(P.supT||0)+dt;if(P.supT>5){P.supT=0;P.ammo.S=TY.S;P.ammo.H=TY.H;P.rounds=TY.S+TY.H;P.smoke=TY.smoke;P.armour=Math.min(100,P.armour+45);for(const k in P.dmg)P.dmg[k]=0;if(!P.loaded&&P.reload<=0)P.loaded=P.next;play('breech',.7);play('thump',.6,'dry',.4);setHud('Rearmed and patched up','Rounds and smoke full, armour '+Math.round(P.armour)+'%.',4);}else if(!hudUntil||hudUntil-time<1)setHud('Rearming at the supply truck','Hold still: '+Math.ceil(5-P.supT)+' seconds.',1.2);}else P.supT=0;}
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
  g.fillStyle=P.reload>0?'#8a8474':'#b9d36a';g.fillRect(84,50,92*(1-P.reload/(P.reloadFull||3.6)),16);
  g.fillStyle='#dfe8d8';g.font='600 13px "IBM Plex Mono",monospace';g.fillText('S '+P.ammo.S+'  H '+P.ammo.H+'  SMK '+P.smoke,84,94);g.fillText(NET.peer?'1 v 1 · '+NET.score[0]+' : '+NET.score[1]:Math.max(1,wave)+'/'+WAVES.length+' · '+live()+' LEFT',84,124);g.font='600 15px "IBM Plex Mono",monospace';
  {const d=P.dmg,w=[d.tracks>0&&'TRACK '+Math.ceil(d.tracks),d.trav>0&&'TRAVERSE',d.sight>0&&'SIGHT',d.fire>0&&'FIRE'].filter(Boolean).join(' ');if(w){g.fillStyle='#ff5a3c';g.font='600 12px "IBM Plex Mono",monospace';g.fillText(w,12,140);g.font='600 15px "IBM Plex Mono",monospace';}}
  if(cover){g.fillStyle=cover==='EXPOSED'?'#ff5a3c':'#b9d36a';g.fillRect(12,150,164,34);g.fillStyle='#10120c';g.textAlign='center';g.fillText(cover,94,168);}
  const cx=248,cy=100,R=58;g.strokeStyle='rgba(190,230,190,.4)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();g.beginPath();g.arc(cx,cy,R/2,0,7);g.stroke();
  g.strokeStyle='#e0b04a';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-R);g.stroke();
  const hy=-P.tyaw;g.strokeStyle='rgba(220,235,215,.7)';g.strokeRect(cx-4,cy-6,8,12);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-Math.sin(hy)*14,cy-Math.cos(hy)*14);g.stroke();
  for(const e of foes){const rel=wrap(Math.atan2(-(e.x-P.x),-(e.z-P.z))-P.yaw-P.tyaw),d=Math.min(1,distTo(e.x,e.z)/700)*R;
    g.fillStyle=e.state==='dead'?'rgba(160,154,140,.5)':'#ff5a3c';g.beginPath();g.arc(cx-Math.sin(rel)*d,cy-Math.cos(rel)*d,e.state==='dead'?2.5:4,0,7);g.fill();}
  if(NET.peer&&rem.on&&time>rem.smokeT){const rel=wrap(Math.atan2(-(rem.x-P.x),-(rem.z-P.z))-P.yaw-P.tyaw),d=Math.min(1,distTo(rem.x,rem.z)/700)*R;g.fillStyle=rem.alive?'#ff5a3c':'rgba(160,154,140,.5)';g.beginPath();g.arc(cx-Math.sin(rel)*d,cy-Math.cos(rel)*d,5,0,7);g.fill();}
  for(const f of friends){const rel=wrap(Math.atan2(-(f.x-P.x),-(f.z-P.z))-P.yaw-P.tyaw),d=Math.min(1,distTo(f.x,f.z)/700)*R;g.fillStyle=f.hp>0?'#7dff9c':'rgba(160,154,140,.5)';g.fillRect(cx-Math.sin(rel)*d-3,cy-Math.cos(rel)*d-3,6,6);}
  {const sp=land.userData.supply,rel=wrap(Math.atan2(-(sp[0]-P.x),-(sp[1]-P.z))-P.yaw-P.tyaw),d=Math.min(1,distTo(sp[0],sp[1])/700)*R;g.strokeStyle='#7fd0ff';g.lineWidth=2;g.strokeRect(cx-Math.sin(rel)*d-4,cy-Math.cos(rel)*d-4,8,8);}
  statT.needsUpdate=true;inside.userData.reticle();$('fcs').textContent=fcsLine(0)+'   '+fcsLine(1)+'   '+fcsLine(2);
  const f=fcsC.getContext('2d');f.fillStyle='#030a05';f.fillRect(0,0,256,192);f.fillStyle='#4fe08a';f.font='600 22px monospace';f.textBaseline='top';
  ['FCS  '+(P.loaded?AMMO[P.loaded].name:'LOADING'),'RNG  '+Math.round(P.range)+(time-P.lased<12?' L':' B'),'TRV  '+String(Math.round((((-P.tyaw*180/Math.PI)%360)+360)%360)).padStart(3,'0'),'ELV '+(P.elev>=0?'+':'-')+Math.abs(P.elev*180/Math.PI).toFixed(1),'SPD  '+Math.abs(P.v*3.6).toFixed(0)+' KPH'].forEach((s,i)=>f.fillText(s,14,14+i*34));fcsT.needsUpdate=true;
}

// ---------- seeing: eye adaptation, hit effects ----------
function updateVision(dt){
  const fx=$('fxToggle').checked,out=!P.headIn,dmg=1-P.armour/100;
  const tgtE=state==='preview'||out||(P.sight&&!xrActive)?.4:lerp(.8,.55,P.hatch);
  expo=Math.exp(lerp(Math.log(expo),Math.log(tgtE),1-Math.exp(-dt/(P.sight&&!xrActive?.3:1.5))));
  renderer.toneMappingExposure=expo*(1+P.recoil*.25);
  {const mu=monitorMat.uniforms;mu.gain.value=1.15/expo;mu.thermal.value=P.thermal?1:0;mu.snow.value=P.dmg.sight>0?1:0;mu.time.value=time;}
  vign.visible=xrActive&&fx&&P.hurt>.01;vign.material.uniforms.amt.value=P.hurt*.8;
  const u=lens.uniforms;u.time.value=time;u.blur.value=fx?P.hurt*.7+P.shake*.12:0;u.ca.value=.004+(fx?P.hurt*.02+dmg*.005:0);u.desat.value=fx?dmg*.35+P.hurt*.3:0;u.vig.value=.28+(fx?P.hurt*.3:0);
  applyFade();
}

// ---------- input ----------
const isTouch=matchMedia('(pointer:coarse)').matches;
addEventListener('keydown',e=>{if(state==='play'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;keys[e.code]=true;
  if($('overlay').hidden&&!xrActive){if(e.code==='Space')trigger();if(e.code==='KeyF')toggleSight();if(e.code==='KeyH')toggleHatch();if(e.code==='KeyR'){if(P.item==='pistol')reloadPistol();else lase();}if(e.code==='KeyB')toggleBinos();if(e.code==='Digit3')takeItem('pistol');if(e.code==='Digit4')takeItem('grenade');if(e.code==='Digit5')takeItem('mine');if(e.code==='KeyZ')toggleZoom();if(e.code==='KeyT')toggleThermal();if(e.code==='KeyG')popSmoke();if(e.code==='KeyX')extinguish();if(e.code==='Digit1')selectAmmo('S');if(e.code==='Digit2')selectAmmo('H');}});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
$('pad').querySelectorAll('button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();e.stopPropagation();keys[k]=true;};const off=e=>{e.stopPropagation();keys[k]=false;};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);});
$('fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();trigger();});$('sightBtn').addEventListener('click',toggleSight);$('hatchBtn').addEventListener('click',toggleHatch);
function trigger(){if(state==='over'){state='preview';beginPlay();return;}if(P.item==='bino'){layGun();return;}if(P.item){useItem();return;}fire();}
function aimBy(dx,dy,touch){if(P.item){const k=(touch?.006:.0028)*(P.item==='bino'?.13:1);view.yaw-=dx*k;view.pitch=clamp(view.pitch-dy*k,-1.2,1.2);return;}const s=(touch?.006:.0028)*(P.sight?(P.zoom?.05:.14):1);P.aimYaw-=dx*s;P.aimPitch=clamp(P.aimPitch-dy*s,-1.2,1.2);}
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
  if(P.item)camera.rotation.set(view.pitch,wrap(view.yaw-P.yaw-P.tyaw),0);else camera.rotation.set(P.aimPitch+(Math.random()-.5)*.012*sh,wrap(P.aimYaw-P.yaw-P.tyaw),0);
  const fov=state==='preview'?60:P.item==='bino'?8.5:72;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  if(!$('gunmark').hidden){tank.updateMatrixWorld();gunN.getWorldQuaternion(qa);muzzle.getWorldPosition(mark).add(vb.set(0,0,-400).applyQuaternion(qa));camera.updateMatrixWorld();mark.project(camera);
    const el=$('gunmark');el.style.display=mark.z<1?'':'none';el.style.left=(mark.x*.5+.5)*100+'%';el.style.top=(-mark.y*.5+.5)*100+'%';}
}

// headset
const xr={thr:0,steer:0,trav:0,elv:0,cx:0,cz:0,centre:0,held:{},ctrl:{},grip:{},trig:{},slew:null};
const xrC=[0,1].map(i=>{const c=renderer.xr.getController(i);rig.add(c);return c;});
function updateXR(dt){
  xr.thr=xr.steer=xr.trav=xr.elv=0;xr.ctrl.left=xr.ctrl.right=null;if(!xrActive)return;
  const s=renderer.xr.getSession();if(!s)return;
  if(xr.centre>0&&camera.position.y>.3&&--xr.centre===0){xr.cx-=camera.position.x;xr.cz-=camera.position.z;}
  const dz=v=>Math.abs(v)>.15?v:0;
  let ci=0;for(const src of s.inputSources){const gp=src.gamepad,c=xrC[ci++];if(!gp)continue;if(c&&(src.handedness==='left'||src.handedness==='right')){xr.ctrl[src.handedness]=c;xr.grip[src.handedness]=gp.buttons[1]?gp.buttons[1].value:0;xr.trig[src.handedness]=gp.buttons[0]?gp.buttons[0].value:0;}const h=src.handedness,ax=dz(gp.axes[2]||0),ay=dz(gp.axes[3]||0);
    if(h==='left'){xr.thr=-ay;xr.steer=-ax;}else{xr.trav=ax;xr.elv=-ay;}
    const edge=(n,fn)=>{const on=!!(gp.buttons[n]&&gp.buttons[n].pressed),k=h+n;if(on&&!xr.held[k])fn();xr.held[k]=on;};
    if(h==='right'){edge(0,trigger);edge(1,()=>{if(P.headIn)lase();else{const o=[null,'pistol','grenade','mine'],k=o[(o.indexOf(P.item==='bino'?null:P.item)+1)%4];P.item=k;play('switch',.3);}});edge(4,toggleHatch);edge(5,toggleZoom);edge(3,()=>{xr.cx=xr.cz=0;xr.centre=1;});}
    else{edge(0,()=>{if(P.item==='bino')layGun();else if(!P.headIn)lase();});edge(1,()=>{if(P.headIn)popSmoke();});edge(4,()=>selectAmmo(P.next==='S'?'H':'S'));edge(5,toggleThermal);edge(3,extinguish);}}
}

// ---------- sound mix ----------
function updateAudio(dt){
  if(!ac)return;const sp=Math.min(1.3,Math.abs(P.v)/9),th=Math.abs(P.thr||0),o=outside(),on=state==='preview'?.5:1;
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
  updateXR(dt);updateTank(dt);updateBody(dt);updateFlat(dt);updateFoes(dt);updateFriends(dt);updateCrews(dt);updateCarry(dt);updateCoax(dt);updateNet(dt);updateAir(dt);updateShells(dt);updateGame(dt);updateParts(dt);updateDust(dt);updateVision(dt);updateAudio(dt);
  tank.updateMatrixWorld();camera.getWorldPosition(headW);sky.position.copy(headW);sunGlow.position.copy(headW).addScaledVector(SUN,3000);
  const vr=renderer.xr.isPresenting,flatSight=!vr&&P.sight&&state==='play',inNow=P.headIn&&!flatSight,L=inside.userData.L;
  const heat=on=>{const h=on&&P.thermal?1:0;if(heat.h===h)return;heat.h=h;M.foe.traverse(m=>{if(m.isMesh){m.material.emissive.setScalar(h*1.4);}});for(const w of wreckMats.values())w.emissive.setScalar(h*.5);heroProto.traverse(m=>{if(m.isMesh)m.material.emissive.setScalar(h*.7);});};
  gunCam.fov=P.zoom?TY.zoom:9;
  const lights=inn=>{sunL.intensity=inn?0:3.4;sunL.castShadow=!inn;hemiL.intensity=inn?.003+.02*P.hatch:.5;scene.environment=ENV;
    const fl=P.shake>.05?.55+.45*Math.sin(time*90)*Math.sin(time*37):1,pw=inn?(P.power==null?1:P.power)*fl:0,low=P.armour<40?1:0;
    L.dome.intensity=pw*.028;L.dome.castShadow=inn;if(inn&&frameN%8===0)L.dome.shadow.needsUpdate=true;L.screen.intensity=inn?(P.dmg.sight>0?.25:.7)*(.92+.08*Math.sin(time*23))*(P.thermal?.8:1):0;L.screen.color.setRGB(P.thermal?.6:.75,1,P.thermal?.7:.86);L.mfd.intensity=inn?.38:0;
    L.alarm.intensity=inn?(P.hurt>.02?1.6*P.hurt:0)+low*.9*(.5+.5*Math.sin(time*7)):0;L.beacon.material.color.setRGB(.2+L.alarm.intensity,.04,.03);L.day.intensity=inn?P.hatch*3:0;L.lid.rotation.x=clamp(P.hatch*2.2,0,1)*1.9;if(!inn&&(frameN&1))sunL.shadow.needsUpdate=true;};
  if(inNow&&state!=='preview'&&(!vr||frameN%3===0)){
    inside.visible=false;ext.visible=turN.visible=true;lights(false);heat(true);
    const prev=renderer.getRenderTarget(),xe=renderer.xr.enabled;renderer.xr.enabled=false;
    gunCam.aspect=4/3;gunCam.updateProjectionMatrix();renderer.setRenderTarget(sightRT);renderer.render(scene,gunCam);
    renderer.setRenderTarget(prev);renderer.xr.enabled=xe;}
  const vb2=vr&&P.item==='bino';binoView.visible=binoBack.visible=false;
  if(vb2){lights(false);const prev=renderer.getRenderTarget(),xe=renderer.xr.enabled;renderer.xr.enabled=false;renderer.setRenderTarget(sightRT);renderer.render(scene,binoCam);renderer.setRenderTarget(prev);renderer.xr.enabled=xe;binoView.visible=binoBack.visible=true;binoView.material.uniforms.gain.value=.9/expo;}
  inside.visible=inNow;ext.visible=turN.visible=!inNow;hatchLid.visible=!inNow;lights(inNow);heat(flatSight);lens.uniforms.thermal.value=flatSight&&P.thermal?1:0;
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

{let k='heavy';try{k=localStorage.getItem('hulldown-tank')||'heavy';}catch(e){}setType(k);}document.querySelectorAll('[data-tank]').forEach(b=>b.addEventListener('click',()=>{if(state==='preview'||state==='over')setType(b.dataset.tank);}));
P.y=hAt(0,0);P.hatch=1;P.hatchOpen=true;
drawStat();renderer.setAnimationLoop(frame);
$('loading').hidden=true;
if(document.fonts&&document.fonts.load)document.fonts.load('600 40px "IBM Plex Mono"').then(drawStat).catch(()=>{});

window.game={get time(){return time;},get state(){return state;},get wave(){return wave;},get cover(){return cover;},get xr(){return xrActive;},get expo(){return expo;},P,foes,shells,WAVES,ROOF,FLOOR,hAt,los,tank,inside,friends,crews,mines,nades,INV,addCrew,takeItem,useItem,NET,rem,TYPES,setType,get type(){return tyKey;},hands,view,toggleBinos,layGun,supply:land.userData.supply,fire,trigger,lase,popSmoke,selectAmmo,toggleZoom,toggleThermal,extinguish,hurt:hurtPlayer,toggleHatch,toggleSight,addFoe,live,renderer,camera,rig,sounds:A,
  skip(){waveT=0;},kill(e){killFoe(e);P.kills++;}};
})();
