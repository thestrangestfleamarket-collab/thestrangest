// VESPER WARD: a VR scare game on its own page (/scare): the ward, its three monsters, the props' physics, the weapons and all sound
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

/* ───────────────────────── basics ───────────────────────── */
const R=Math.random, rr=(a,b)=>a+R()*(b-a), pick=a=>a[(R()*a.length)|0];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const MAP=[
'#################',
'#S..#.....#.....#',
'#.#.#.###.#.###.#',
'#.#...#.....#...#',
'#.#####.#.###.#.#',
'#.....#.#.....#.#',
'###.#.#.#####.#.#',
'#...#...#...#...#',
'#.#####.#.#.###.#',
'#.....#...#...#.#',
'#.###.#####.#.#.#',
'#.#.......#.#...#',
'#.#.#####.#.#.###',
'#...#.......#..E#',
'#################'];
const CS=3,H=2.9,ROWS=MAP.length,COLS=MAP[0].length;
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const open=(x,z)=>z>=0&&z<ROWS&&x>=0&&x<COLS&&MAP[z][x]!=='#';
let START,LIFT;
for(let z=0;z<ROWS;z++)for(let x=0;x<COLS;x++){if(MAP[z][x]==='S')START={x,z};if(MAP[z][x]==='E')LIFT={x,z};}
const walk=(x,z)=>open(x,z)&&!(x===LIFT.x&&z===LIFT.z);
const cc=(x,z)=>new THREE.Vector3(x*CS+CS/2,0,z*CS+CS/2);
const cellOf=p=>({x:Math.floor(p.x/CS),z:Math.floor(p.z/CS)});
const LN=(()=>{for(const[dx,dz]of DIRS)if(walk(LIFT.x+dx,LIFT.z+dz))return{x:LIFT.x+dx,z:LIFT.z+dz};})();
const CELLS=[];for(let z=0;z<ROWS;z++)for(let x=0;x<COLS;x++)if(walk(x,z))CELLS.push({x,z});

function bfs(from){ // distance map over walkable cells
  const d=new Int16Array(ROWS*COLS).fill(-1),q=[from.x+from.z*COLS];d[q[0]]=0;
  for(let i=0;i<q.length;i++){const k=q[i],x=k%COLS,z=(k/COLS)|0;
    for(const[dx,dz]of DIRS){const nx=x+dx,nz=z+dz,nk=nx+nz*COLS;if(walk(nx,nz)&&d[nk]<0){d[nk]=d[k]+1;q.push(nk);}}}
  return d;
}
function pathTo(from,to){ // list of cells from→to (excluding from)
  if(!walk(to.x,to.z)||!walk(from.x,from.z))return[];
  const d=bfs(to);let k=from.x+from.z*COLS;if(d[k]<0)return[];const out=[];
  while(d[k]>0){const x=k%COLS,z=(k/COLS)|0;for(const[dx,dz]of DIRS){const nk=x+dx+(z+dz)*COLS;if(walk(x+dx,z+dz)&&d[nk]===d[k]-1){k=nk;out.push({x:x+dx,z:z+dz});break;}}}
  return out;
}
function los(a,b){const dx=b.x-a.x,dz=b.z-a.z,n=Math.ceil(Math.hypot(dx,dz)/.25);
  for(let i=1;i<n;i++){const x=a.x+dx*i/n,z=a.z+dz*i/n;if(!open(Math.floor(x/CS),Math.floor(z/CS)))return false;}return true;}

/* ───────────────────────── renderer ───────────────────────── */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
try{renderer.xr.setFoveation(1);}catch(e){}
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0);scene.fog=new THREE.FogExp2(0x000000,.085);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,60);camera.rotation.order='YXZ';
const rig=new THREE.Group();rig.add(camera);scene.add(rig);camera.position.set(0,1.65,0);
addEventListener('resize',()=>{if(renderer.xr.isPresenting)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
scene.add(new THREE.AmbientLight(0x1a2226,.24));

/* ───────────────────────── procedural textures ───────────────────────── */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d',{willReadFrequently:true})];}
function tex(c,rep=true){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
function grain(x,w,h,a){const d=x.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(R()-.5)*a;p[i]+=n;p[i+1]+=n;p[i+2]+=n;}x.putImageData(d,0,0);}
function blot(x,w,h,n,col,r0,r1,a){for(let i=0;i<n;i++){const px=R()*w,py=R()*h,r=rr(r0,r1),g=x.createRadialGradient(px,py,0,px,py,r);
  g.addColorStop(0,`rgba(${col},${a*R()})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r);}}
function crack(x,px,py,len,col,lw){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();x.moveTo(px,py);let a=rr(0,6.28);
  for(let i=0;i<len;i++){a+=rr(-.6,.6);px+=Math.cos(a)*rr(3,9);py+=Math.sin(a)*rr(3,9);x.lineTo(px,py);}x.stroke();}

const wallTex=(()=>{const W=2048,Hh=1024,[c,x]=cv(W,Hh);
  x.fillStyle='#8d8873';x.fillRect(0,0,W,Hh);
  const split=Hh*.57;x.fillStyle='#4a5a4b';x.fillRect(0,split,W,Hh-split);
  x.fillStyle='#2c342c';x.fillRect(0,split-6,W,12);
  blot(x,W,Hh,260,'40,34,22',30,220,.22);blot(x,W,Hh,120,'12,14,10',20,140,.3);
  for(let i=0;i<70;i++){const px=R()*W,l=rr(80,520),w=rr(4,26),g=x.createLinearGradient(0,0,0,l);g.addColorStop(0,'rgba(28,22,12,.45)');g.addColorStop(1,'rgba(28,22,12,0)');x.fillStyle=g;x.save();x.translate(px,0);x.fillRect(0,0,w,l);x.restore();}
  for(let i=0;i<26;i++){const px=R()*W,py=R()*Hh,n=7+(R()*6|0),r=rr(20,90);x.beginPath();for(let k=0;k<n;k++){const a=k/n*6.28,rd=r*rr(.5,1.2);x[k?'lineTo':'moveTo'](px+Math.cos(a)*rd,py+Math.sin(a)*rd*.8);}x.closePath();
    x.fillStyle=`rgba(${150+R()*20|0},${145+R()*15|0},${128+R()*14|0},${rr(.25,.5)})`;x.fill();x.strokeStyle='rgba(25,22,16,.28)';x.lineWidth=1.5;x.stroke();}
  for(let i=0;i<34;i++)crack(x,R()*W,R()*Hh,rr(12,50),'rgba(14,12,9,.45)',rr(.6,1.4));
  blot(x,W,Hh*.2,140,'8,12,6',10,60,.55);x.save();x.translate(0,Hh*.86);blot(x,W,Hh*.14,260,'6,9,5',8,70,.7);x.restore();
  for(let i=0;i<9;i++){const px=R()*W,py=Hh*rr(.4,.62);x.save();x.translate(px,py);x.rotate(rr(-.5,.5));for(let f=0;f<4;f++){const l=rr(40,110),g=x.createLinearGradient(0,0,0,l);g.addColorStop(0,'rgba(38,12,8,.34)');g.addColorStop(1,'rgba(38,12,8,0)');x.fillStyle=g;x.fillRect(f*9-18+rr(-2,2),rr(-6,6),rr(4,7),l);}x.restore();}
  grain(x,W,Hh,26);return tex(c);})();
const floorTex=(()=>{const S=1024,[c,x]=cv(S,S),n=16,t=S/n;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const b=((i+j)&1)?[124,124,112]:[82,92,84],k=rr(.82,1.08),miss=R()<.035;
    x.fillStyle=miss?'#2a2824':`rgb(${b[0]*k|0},${b[1]*k|0},${b[2]*k|0})`;x.fillRect(i*t,j*t,t,t);}
  x.strokeStyle='rgba(18,17,14,.9)';x.lineWidth=2;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*t,0);x.lineTo(i*t,S);x.moveTo(0,i*t);x.lineTo(S,i*t);x.stroke();}
  blot(x,S,S,90,'30,24,14',30,160,.35);blot(x,S,S,22,'6,6,5',40,150,.95);
  for(let i=0;i<8;i++){x.save();x.translate(R()*S,R()*S);x.rotate(R()*6.28);const g=x.createLinearGradient(0,0,rr(200,500),0);g.addColorStop(0,'rgba(30,8,6,.6)');g.addColorStop(1,'rgba(30,8,6,0)');x.fillStyle=g;x.fillRect(0,-rr(8,22),500,rr(16,40));x.restore();}
  for(let i=0;i<20;i++)crack(x,R()*S,R()*S,rr(10,40),'rgba(10,10,8,.8)',1.5);
  grain(x,S,S,22);return tex(c);})();
const ceilTex=(()=>{const S=512,[c,x]=cv(S,S),n=5,t=S/n;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const k=rr(.8,1),miss=R()<.1;x.fillStyle=miss?'#080808':`rgb(${118*k|0},${115*k|0},${104*k|0})`;x.fillRect(i*t,j*t,t,t);}
  x.strokeStyle='rgba(20,20,18,.95)';x.lineWidth=5;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*t,0);x.lineTo(i*t,S);x.moveTo(0,i*t);x.lineTo(S,i*t);x.stroke();}
  blot(x,S,S,40,'52,36,14',20,110,.5);blot(x,S,S,30,'10,10,8',10,60,.5);grain(x,S,S,34);return tex(c);})();
const skinTex=(()=>{const S=256,[c,x]=cv(S,S);x.fillStyle='#857f77';x.fillRect(0,0,S,S);
  blot(x,S,S,70,'58,50,74',10,50,.5);blot(x,S,S,40,'20,18,18',8,40,.5);blot(x,S,S,30,'40,24,26',6,34,.5);blot(x,S,S,30,'170,165,150',8,30,.3);
  for(let i=0;i<10;i++)crack(x,R()*S,R()*S,rr(8,22),'rgba(46,40,62,.22)',rr(.6,1.2));grain(x,S,S,16);return tex(c);})();
const metalTex=(()=>{const S=256,[c,x]=cv(S,S);x.fillStyle='#6d706c';x.fillRect(0,0,S,S);
  for(let i=0;i<400;i++){x.fillStyle=`rgba(${R()<.5?20:200},${R()<.5?20:200},190,.04)`;x.fillRect(0,R()*S,S,1);}
  blot(x,S,S,40,'70,34,14',6,40,.7);blot(x,S,S,20,'10,10,10',10,50,.5);grain(x,S,S,18);return tex(c);})();
const sheetTex=(()=>{const S=256,[c,x]=cv(S,S);x.fillStyle='#8f8c80';x.fillRect(0,0,S,S);
  blot(x,S,S,16,'60,36,14',20,70,.6);blot(x,S,S,6,'44,10,8',16,60,.8);blot(x,S,S,30,'20,20,18',10,50,.25);grain(x,S,S,16);return tex(c);})();
const doorTex=(()=>{const W=256,Hh=512,[c,x]=cv(W,Hh);x.fillStyle='#4a5357';x.fillRect(0,0,W,Hh);
  blot(x,W,Hh,50,'16,18,18',10,70,.5);x.save();x.translate(0,Hh*.8);blot(x,W,Hh*.2,60,'70,36,14',8,40,.8);x.restore();
  for(let i=0;i<60;i++){x.strokeStyle='rgba(150,150,140,.25)';x.lineWidth=1;x.beginPath();const px=R()*W,py=R()*Hh;x.moveTo(px,py);x.lineTo(px+rr(-30,30),py+rr(-50,50));x.stroke();}
  grain(x,W,Hh,20);return tex(c,false);})();

const M={
  wall:new THREE.MeshStandardMaterial({map:wallTex,bumpMap:wallTex,bumpScale:1.6,roughness:.86}),
  floor:new THREE.MeshStandardMaterial({map:floorTex,bumpMap:floorTex,bumpScale:.8,roughnessMap:floorTex,roughness:3.2,metalness:.04}),
  ceil:new THREE.MeshStandardMaterial({map:ceilTex,bumpMap:ceilTex,bumpScale:1.2,roughness:.95}),
  metal:new THREE.MeshStandardMaterial({map:metalTex,bumpMap:metalTex,bumpScale:.5,roughness:.5,metalness:.75}),
  sheet:new THREE.MeshStandardMaterial({map:sheetTex,bumpMap:sheetTex,bumpScale:.6,roughness:.92}),
  door:new THREE.MeshStandardMaterial({map:doorTex,bumpMap:doorTex,bumpScale:.6,roughness:.6,metalness:.2}),
  dark:new THREE.MeshStandardMaterial({color:0x0b0c0c,roughness:.25,metalness:.3}),
  black:new THREE.MeshBasicMaterial({color:0}),
  skin:new THREE.MeshStandardMaterial({map:skinTex,color:0x8f959a,bumpMap:skinTex,bumpScale:1.0,roughness:.55}),
  gown:new THREE.MeshStandardMaterial({map:sheetTex,color:0x6d6b62,bumpMap:sheetTex,bumpScale:1.2,roughness:.95,side:THREE.DoubleSide}),
  hair:new THREE.MeshStandardMaterial({color:0x070606,roughness:.7,side:THREE.DoubleSide}),
};

/* ───────────────────────── level geometry ───────────────────────── */
const colliders=[],bedBodies=[]; // static prop circles {x,z,r}; bed slots for the covered-body prop
(function buildLevel(){
  const F={p:[],u:[]},C={p:[],u:[]},W={p:[],u:[]};
  const quad=(g,a,b,c,d,ua,ub,uc,ud)=>{g.p.push(...a,...b,...c,...a,...c,...d);g.u.push(...ua,...ub,...uc,...ua,...uc,...ud);};
  const wall=(bl,br)=>{const u=R();quad(W,bl,br,[br[0],H,br[2]],[bl[0],H,bl[2]],[u,0],[u+.5,0],[u+.5,1],[u,1]);};
  for(let z=0;z<ROWS;z++)for(let x=0;x<COLS;x++){if(!open(x,z))continue;
    const x0=x*CS,x1=x0+CS,z0=z*CS,z1=z0+CS,f=6,g=3;
    quad(F,[x0,0,z1],[x1,0,z1],[x1,0,z0],[x0,0,z0],[x0/f,z1/f],[x1/f,z1/f],[x1/f,z0/f],[x0/f,z0/f]);
    quad(C,[x0,H,z0],[x1,H,z0],[x1,H,z1],[x0,H,z1],[x0/g,z0/g],[x1/g,z0/g],[x1/g,z1/g],[x0/g,z1/g]);
    if(!open(x,z-1))wall([x0,0,z0],[x1,0,z0]);if(!open(x,z+1))wall([x1,0,z1],[x0,0,z1]);
    if(!open(x-1,z))wall([x0,0,z1],[x0,0,z0]);if(!open(x+1,z))wall([x1,0,z0],[x1,0,z1]);}
  for(const[g,m,cast]of[[F,M.floor,false],[C,M.ceil,false],[W,M.wall,true]]){const b=new THREE.BufferGeometry();
    b.setAttribute('position',new THREE.Float32BufferAttribute(g.p,3));b.setAttribute('uv',new THREE.Float32BufferAttribute(g.u,2));b.computeVertexNormals();
    const me=new THREE.Mesh(b,m);me.receiveShadow=true;me.castShadow=cast;scene.add(me);}
  // lintel beams + pipes
  const lint=[];for(const c of CELLS){if(walk(c.x+1,c.z)&&R()<.3)lint.push([(c.x+1)*CS,c.z*CS+CS/2,Math.PI/2]);if(walk(c.x,c.z+1)&&R()<.3)lint.push([c.x*CS+CS/2,(c.z+1)*CS,0]);}
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(CS,.4,.34),M.wall,lint.length),d=new THREE.Object3D();
  lint.forEach((l,i)=>{d.position.set(l[0],H-.2,l[1]);d.rotation.y=l[2];d.updateMatrix();im.setMatrixAt(i,d.matrix);});im.castShadow=im.receiveShadow=true;scene.add(im);
  const pipes=[];for(const c of CELLS){if(R()<.45){const ns=walk(c.x,c.z-1)||walk(c.x,c.z+1);pipes.push([c.x*CS+CS/2+(ns?rr(.9,1.2)*(R()<.5?-1:1):0),c.z*CS+CS/2+(ns?0:rr(.9,1.2)*(R()<.5?-1:1)),ns]);}}
  const pm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.05,.05,CS,8),M.metal,pipes.length);
  pipes.forEach((p,i)=>{d.position.set(p[0],H-.12,p[1]);d.rotation.set(p[2]?Math.PI/2:0,0,p[2]?0:Math.PI/2);d.updateMatrix();pm.setMatrixAt(i,d.matrix);});pm.castShadow=true;scene.add(pm);
  // scattered papers
  const pp=new THREE.InstancedMesh(new THREE.PlaneGeometry(.21,.3),new THREE.MeshStandardMaterial({color:0x8d8a7c,roughness:.9}),90);
  for(let i=0;i<90;i++){const c=pick(CELLS);d.position.set(c.x*CS+rr(.3,2.7),.006+i*.0002,c.z*CS+rr(.3,2.7));d.rotation.set(-Math.PI/2,0,R()*6.28);d.updateMatrix();pp.setMatrixAt(i,d.matrix);}pp.receiveShadow=true;scene.add(pp);
})();
function wallSides(c){const o=[];DIRS.forEach(([dx,dz],i)=>{if(!open(c.x+dx,c.z+dz))o.push(i);});return o;}
function onWall(obj,c,dir,h,off=.0){const p=cc(c.x,c.z),[dx,dz]=DIRS[dir];obj.position.set(p.x+dx*(CS/2-off),h,p.z+dz*(CS/2-off));obj.rotation.y=[0,-Math.PI/2,Math.PI,Math.PI/2][dir];return obj;}
const box=(w,h,d,m)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.castShadow=me.receiveShadow=true;return me;};

/* doors (decor, some bang) */
const doors=[];
(function(){const cand=[];for(const c of CELLS)for(const s of wallSides(c))if(!(c.x===START.x&&c.z===START.z)&&!(c.x===LN.x&&c.z===LN.z))cand.push([c,s]);
  cand.sort(()=>R()-.5);const used=new Set();
  for(const[c,s]of cand){if(doors.length>=13)break;const k=c.x+','+c.z;if(used.has(k))continue;used.add(k);
    const g=new THREE.Group();const fr=box(1.08,2.16,.1,M.dark);fr.position.y=1.08;g.add(fr);
    const slab=box(.94,2.06,.06,M.door);slab.position.set(0,1.04,.05);g.add(slab);
    const win=box(.22,.36,.02,M.dark);win.position.set(0,.5,.035);slab.add(win);
    const hd=box(.04,.14,.06,M.metal);hd.position.set(.36,-.05,.05);slab.add(hd);
    onWall(g,c,s,0,.0);scene.add(g);doors.push({g,slab,pos:g.position.clone().setY(1.2),shake:0,cool:0});}
})();

/* ceiling fixtures */
const fixtures=[];
(function(){const used=[];const cs=[...CELLS].sort(()=>R()-.5);
  for(const c of cs){if(fixtures.length>=15)break;if(used.some(u=>Math.abs(u.x-c.x)+Math.abs(u.z-c.z)<3))continue;used.push(c);
    const mat=new THREE.MeshStandardMaterial({color:0x30332e,emissive:0xcfe6c6,emissiveIntensity:0,roughness:.4});
    const me=new THREE.Mesh(new THREE.BoxGeometry(1.25,.05,.28),mat);const p=cc(c.x,c.z);me.position.set(p.x,H-.03,p.z);me.rotation.y=R()<.5?0:Math.PI/2;
    if(R()<.25){me.rotation.z=.25;me.position.y-=.14;}scene.add(me);
    fixtures.push({me,mat,pos:new THREE.Vector3(p.x,H-.25,p.z),alive0:false,alive:false,kind:0,a:rr(.5,1.6),b:rr(.7,2.2),ph:R()*10,burst:0,lvl:0});}
})();
const pool=[0,1].map(()=>{const l=new THREE.PointLight(0xcfe6c6,0,9,1.8);scene.add(l);return l;});
const emLight=new THREE.PointLight(0xd01808,0,11,1.6);scene.add(emLight);

/* beds & props */
function bed(c,dir,body){ // bedBodies/bedList are filled here and used once assets + physics exist
 const g=new THREE.Group();
  const fr=box(.92,.05,2,M.metal);fr.position.y=.55;g.add(fr);
  for(const[a,b]of[[-.42,-.95],[.42,-.95],[-.42,.95],[.42,.95]]){const l=box(.04,.55,.04,M.metal);l.position.set(a,.275,b);g.add(l);}
  const mt=box(.86,.12,1.9,M.sheet);mt.position.y=.64;g.add(mt);
  const hb=box(.92,.5,.04,M.metal);hb.position.set(0,.85,-.98);g.add(hb);
  if(body){const h=new THREE.Group();g.add(h);bedBodies.push(h);}
  const p=cc(c.x,c.z),[dx,dz]=DIRS[dir];g.position.set(p.x+dx*.95,0,p.z+dz*.95);g.rotation.y=(dx?0:Math.PI/2)+(R()<.5?Math.PI:0)+rr(-.12,.12);
  scene.add(g);bedList.push({x:g.position.x,z:g.position.z,ry:g.rotation.y});for(const s of[-.55,.55])colliders.push({x:g.position.x+(dx?0:s),z:g.position.z+(dx?s:0),r:.52});return g;}
const propCells=new Set(),bedList=[];
(function(){const cs=[...CELLS].sort(()=>R()-.5);let n=0;
  for(const c of cs){if(n>=9)break;const ws=wallSides(c);if(ws.length<2||(Math.abs(c.x-START.x)+Math.abs(c.z-START.z)<2)||(c.x===LN.x&&c.z===LN.z))continue;
    if(doors.some(d=>{const dc=cellOf(d.pos);return dc.x===c.x&&dc.z===c.z;}))continue;
    bed(c,pick(ws),R()<.55);propCells.add(c.x+','+c.z);n++;}
})();

/* notes */
function note(lines,w,h,font=30){const[c,x]=cv(512,Math.round(512*h/w));x.fillStyle='#b9b29c';x.fillRect(0,0,c.width,c.height);blot(x,c.width,c.height,14,'70,50,24',20,90,.35);
  x.fillStyle='#16130f';let y=font*1.7;for(const l of lines){x.font=(l.startsWith('!')?'bold ':'italic ')+font+'px Georgia,serif';x.fillText(l.replace(/^!/,''),28,y);y+=font*1.42;}
  grain(x,c.width,c.height,14);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex(c,false),roughness:.9}));m.receiveShadow=true;return m;}
(function(){const ws=wallSides(START);const d=ws.includes(0)?0:ws[0];
  const n=note(['!NIGHT STAFF','Power is out again. The lift','will not move without it.','Three fuses. Maintenance left','them on the carts with the','amber lamps. The breaker is','beside the lift doors.','','!If you hear it clicking:','light off. Stand still.','It turns toward light.','It turns toward running.','Security left guns. Shots','carry a long way down here.'],.74,1.18,28);
  onWall(n,START,d,1.5,.012);n.position.x-=.45;n.rotation.z=.03;scene.add(n);
  const k=note(['!CONTROLS','L stick    walk','L grip     run','L trigger  torch','R stick    turn','R trigger  fire','R grip     reload','A          switch'],.5,.6,34);
  onWall(k,START,d,1.45,.012);k.position.x+=.42;k.rotation.z=-.04;scene.add(k);
})();

/* lift + breaker */
const lift={g:new THREE.Group(),a:null,b:null,open:0,target:0,pos:null};
const breaker={g:new THREE.Group(),leds:[],fuses:[],pos:null};
(function(){const a=cc(LN.x,LN.z),b=cc(LIFT.x,LIFT.z),mid=a.clone().add(b).multiplyScalar(.5);lift.pos=mid.clone().setY(1.4);
  lift.g.position.copy(mid);if(LIFT.x!==LN.x)lift.g.rotation.y=Math.PI/2;
  lift.a=box(CS/2,H,.1,M.metal);lift.b=box(CS/2,H,.1,M.metal);lift.a.position.set(-CS/4,H/2,0);lift.b.position.set(CS/4,H/2,0);lift.g.add(lift.a,lift.b);scene.add(lift.g);
  const ws=wallSides(LN);const d=ws[0];const g=breaker.g;const bx=box(.5,.7,.12,M.metal);g.add(bx);
  const lb=note(['!LIFT POWER'],.4,.1,44);lb.position.set(0,.27,.062);g.add(lb);
  for(let i=0;i<3;i++){const s=box(.07,.2,.03,M.dark);s.position.set(-.14+i*.14,0,.062);g.add(s);
    const led=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshBasicMaterial({color:0x550000}));led.position.set(-.14+i*.14,-.2,.065);g.add(led);breaker.leds.push(led);
    const f=fuseMesh();f.scale.setScalar(.8);f.position.set(-.14+i*.14,0,.085);f.visible=false;g.add(f);breaker.fuses.push(f);}
  onWall(g,LN,d,1.35,.06);scene.add(g);breaker.pos=g.position.clone();
})();
function fuseMesh(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.13,10),new THREE.MeshStandardMaterial({color:0xb9b4a0,roughness:.35}));
  const c1=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.03,10),new THREE.MeshStandardMaterial({color:0xa07a32,roughness:.3,metalness:.9}));const c2=c1.clone();c1.position.y=.06;c2.position.y=-.06;g.add(b,c1,c2);return g;}

/* fuse carts (rebuilt on reset) */
const carts=[];
function buildCarts(){for(const c of carts){scene.remove(c.g);PW.removeBody(c.pb);colliders.splice(colliders.indexOf(c.col),1);}carts.length=0;
  const ds=bfs(START);let cand=CELLS.filter(c=>ds[c.x+c.z*COLS]>=6&&!propCells.has(c.x+','+c.z)&&!dynCells.has(c.x+','+c.z)&&!(c.x===LN.x&&c.z===LN.z)&&wallSides(c).length>=2);
  cand.sort(()=>R()-.5);cand.sort((a,b)=>wallSides(b).length-wallSides(a).length+rr(-.6,.6));const chosen=[];
  for(const c of cand){if(chosen.length>=3)break;if(chosen.every(o=>Math.abs(o.x-c.x)+Math.abs(o.z-c.z)>=6))chosen.push(c);}
  for(const c of cand){if(chosen.length>=3)break;if(!chosen.includes(c))chosen.push(c);}
  for(const c of chosen){const g=new THREE.Group();const top=box(.6,.03,.42,M.metal);top.position.y=.9;g.add(top);const sh=box(.6,.03,.42,M.metal);sh.position.y=.35;g.add(sh);
    for(const[a,b]of[[-.28,-.19],[.28,-.19],[-.28,.19],[.28,.19]]){const l=box(.03,.9,.03,M.metal);l.position.set(a,.45,b);g.add(l);}
    const tray=box(.2,.04,.14,M.dark);tray.position.set(.05,.935,0);g.add(tray);
    const f=fuseMesh();f.rotation.z=Math.PI/2;f.position.set(.05,.98,0);g.add(f);
    const led=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),new THREE.MeshBasicMaterial({color:0xffa020}));led.position.set(-.2,.93,.12);g.add(led);
    const p=cc(c.x,c.z),s=pick(wallSides(c)),[dx,dz]=DIRS[s];g.position.set(p.x+dx*1.05,0,p.z+dz*1.05);g.rotation.y=(dx?Math.PI/2:0)+rr(-.2,.2);scene.add(g);
    const col={x:g.position.x,z:g.position.z,r:.42};colliders.push(col);
    carts.push({g,f,led,col,pb:sBody(new CANNON.Box(new CANNON.Vec3(.32,.47,.32)),g.position.x,.47,g.position.z,g.rotation.y),taken:false,pos:new THREE.Vector3(g.position.x,.98,g.position.z),ph:R()*6});}
}

/* ───────────────────────── flashlight ───────────────────────── */
const flash=new THREE.Group();
const spot=new THREE.SpotLight(0xfff0d8,0,28,.72,.6,1.0);
(function(){const[c,x]=cv(256,256);x.fillStyle='#000';x.fillRect(0,0,256,256);const g=x.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,'#fff');g.addColorStop(.3,'#f1ead8');g.addColorStop(.4,'#b5ae9c');g.addColorStop(.7,'#958f80');g.addColorStop(.78,'#b0aa98');g.addColorStop(.92,'#4a4740');g.addColorStop(1,'#000');
  x.fillStyle=g;x.fillRect(0,0,256,256);blot(x,256,256,10,'0,0,0',6,26,.5);const t=tex(c,false);spot.map=t;
  spot.castShadow=true;spot.shadow.mapSize.set(1024,1024);spot.shadow.camera.near=.12;spot.shadow.camera.far=24;spot.shadow.bias=-.0012;spot.shadow.normalBias=.03;
  spot.position.set(0,0,-.09);spot.target.position.set(0,0,-4);flash.add(spot,spot.target);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.018,.016,.16,12),new THREE.MeshStandardMaterial({color:0x151515,roughness:.5,metalness:.6}));body.rotation.x=Math.PI/2;body.position.z=.02;
  const head=new THREE.Mesh(new THREE.CylinderGeometry(.027,.019,.05,12),body.material);head.rotation.x=Math.PI/2;head.position.z=-.07;
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.023,12),new THREE.MeshBasicMaterial({color:0xfff2d6}));lens.position.z=-.0955;lens.rotation.y=Math.PI;flash.add(body,head,lens);flash.userData.lens=lens;})();
const DESK=new THREE.Vector3(-.2,-.22,-.12);camera.add(flash);flash.position.copy(DESK);
const fl={on:true,dead:0,flick:1,base:36};

/* wrist tag (VR) */
const wrist=(()=>{const[c,x]=cv(256,96);const t=tex(c,false);const m=new THREE.Mesh(new THREE.PlaneGeometry(.085,.032),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.75,fog:false}));
  m.position.set(0,.03,.07);m.rotation.set(-1.1,0,0);m.userData={c,x,t};return m;})();
const hud=document.getElementById('hud');
function setHud(){const s='FUSES '+'I'.repeat(G.fuses+G.placed)+'·'.repeat(3-G.fuses-G.placed)+(G.placed?'  SET '+G.placed:'');hud.textContent=s;
  const{c,x,t}=wrist.userData;x.clearRect(0,0,256,96);x.fillStyle='#0c0d0c';x.fillRect(0,0,256,96);x.fillStyle='#b9a36a';x.font='600 34px monospace';x.fillText('FUSE',14,60);
  for(let i=0;i<3;i++){x.fillStyle=i<G.placed?'#4f8f4a':i<G.placed+G.fuses?'#d9b860':'#2a2a26';x.fillRect(120+i*42,26,28,44);}t.needsUpdate=true;}

const ctrls=[0,1].map(i=>{const c=renderer.xr.getController(i);rig.add(c);
  c.addEventListener('connected',e=>{c.userData.hand=e.data.handedness;c.userData.gp=!!e.data.gamepad;if(!e.data.gamepad)return;
    if(e.data.handedness==='left'){c.add(flash);flash.position.set(0,0,0);c.add(wrist);}
    if(e.data.handedness==='right'){c.add(gunRoot);gunRoot.position.set(0,0,0);}});
  c.addEventListener('disconnected',()=>{if(flash.parent===c){camera.add(flash);flash.position.copy(DESK);}if(wrist.parent===c)c.remove(wrist);if(gunRoot.parent===c){camera.add(gunRoot);gunRoot.position.copy(GDESK);}c.userData.hand=null;});
  return c;});

/* dust in the beam */
const dust=(()=>{const n=420,p=new Float32Array(n*3),s=new Float32Array(n);for(let i=0;i<n;i++){p[i*3]=R()*8;p[i*3+1]=R()*3;p[i*3+2]=R()*8;s[i]=R()*100;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('seed',new THREE.BufferAttribute(s,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{lp:{value:new THREE.Vector3()},ld:{value:new THREE.Vector3(0,0,-1)},on:{value:1},ct:{value:new THREE.Vector3()},t:{value:0}},
    vertexShader:`uniform vec3 lp,ld,ct;uniform float on,t;attribute float seed;varying float a;
      void main(){vec3 q=position+vec3(sin(t*.13+seed),t*.02+cos(t*.1+seed*2.)*.3,cos(t*.11+seed*1.7))*.5;
      q.xz=mod(q.xz-ct.xz+4.,8.)-4.+ct.xz;q.y=mod(q.y,2.9);vec3 L=q-lp;float d=length(L);float c=dot(L/d,ld);
      a=smoothstep(.9,.975,c)*on/(1.+d*d*.25)*smoothstep(.15,.6,d);vec4 mv=viewMatrix*vec4(q,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(9./-mv.z,1.,5.);}`,
    fragmentShader:`varying float a;void main(){vec2 p=gl_PointCoord-.5;float f=smoothstep(.5,.1,length(p));gl_FragColor=vec4(vec3(1.,.93,.8)*a*f*.9,1.);}`});
  const pts=new THREE.Points(g,m);pts.frustumCulled=false;scene.add(pts);return m;})();

/* fade + message, parented to the head */
const fadeMat=new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:1,side:THREE.BackSide,depthTest:false,depthWrite:false,fog:false});
const fadeS=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),fadeMat);fadeS.renderOrder=998;camera.add(fadeS);let fadeT=1,fadeSpd=1;
const msg=(()=>{const[c,x]=cv(1024,384);const t=tex(c,false);const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.5625),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false}));
  m.position.set(0,0,-1.7);m.renderOrder=999;m.userData={x,t};camera.add(m);return m;})();
function setMsg(a,b){const{x,t}=msg.userData;x.clearRect(0,0,1024,384);x.textAlign='center';x.fillStyle='#b5ae9c';x.font='400 84px Georgia,serif';x.fillText(a,512,170);
  x.fillStyle='#6a665b';x.font='400 34px monospace';x.fillText(b,512,270);t.needsUpdate=true;}

/* ───────────────────────── monsters: rigged models, retargeted mocap, procedural layers ───────────────────────── */
const ASSET='scare-assets/';
const cr={g:new THREE.Group(),state:'hidden',t:0,yaw:0,path:[],repath:0,alert:0,lose:0,stepAcc:0,tw:0,twz:0,twy:0,tilt:0,last:null,rattleT:0,scream:0,sub:0,dst:null,seen:0,
  form:null,crawl:false,ceil:false,spd:0,aimW:0,out:0,bl:0,blT:0,pv:new THREE.Vector3(),vel:new THREE.Vector3()};
cr.pos=cr.g.position;cr.g.visible=false;scene.add(cr.g);
const forms={};const mnorm=n=>n.replace(/^mixamorig\d*:?/,'').replace(/_\d+$/,'');
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_q3=new THREE.Quaternion(),_v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3(),_v4=new THREE.Vector3();
// Bake a mocap clip onto a skeleton with different bone orientations: carry each bone's world-space delta from the rest pose across.
function retarget(cl,scenes,root){
  const first=cl.tracks[0].name.split('.')[0],sc=scenes.find(s=>s.getObjectByName(first));if(!sc)return cl;
  const tb={},map=[];root.traverse(o=>{if(o.isBone)tb[o.name]=o;});
  sc.traverse(o=>{const b=tb[mnorm(o.name)];if(b&&!map.find(m=>m.t===b))map.push({s:o,t:b});});
  const depth=o=>{let d=0;while(o.parent){d++;o=o.parent;}return d;};map.sort((x,y)=>depth(x.t)-depth(y.t));
  const hip=map.find(m=>m.t.name==='Hips');sc.updateMatrixWorld(true);root.updateMatrixWorld(true);
  const q=()=>new THREE.Quaternion(),sQ=hip.s.parent.getWorldQuaternion(q()).invert(),tQ=hip.t.parent.getWorldQuaternion(q()).invert();
  for(const m of map){const rs=sQ.clone().multiply(m.s.getWorldQuaternion(q())),rt=tQ.clone().multiply(m.t.getWorldQuaternion(q()));m.k=rs.invert().multiply(rt);m.par=map.find(x=>x.t===m.t.parent);m.v=[];m.w=q();}
  const ratio=hip.t.position.y/hip.s.position.y,mixer=new THREE.AnimationMixer(sc);mixer.clipAction(cl).play();
  const n=Math.max(2,Math.round(cl.duration*30)+1),times=new Float32Array(n),hp=new Float32Array(n*3),tq=q();
  for(let i=0;i<n;i++){times[i]=i/(n-1)*cl.duration;mixer.setTime(Math.min(cl.duration-1e-4,times[i]));sc.updateMatrixWorld(true);
    for(const m of map){m.w.copy(sQ).multiply(m.s.getWorldQuaternion(tq)).multiply(m.k);const l=m.par?m.par.w.clone().invert().multiply(m.w):m.w;m.v.push(l.x,l.y,l.z,l.w);}
    hp[i*3]=hip.s.position.x*ratio;hp[i*3+1]=hip.s.position.y*ratio;hp[i*3+2]=hip.s.position.z*ratio;}
  mixer.stopAllAction();mixer.uncacheRoot(sc);
  const dx=hp[(n-1)*3]-hp[0],dz=hp[(n-1)*3+2]-hp[2],x0=hp[0],z0=hp[2];
  for(let i=0;i<n;i++){const f=i/(n-1);hp[i*3]+=hip.t.position.x-dx*f-x0;hp[i*3+2]+=hip.t.position.z-dz*f-z0;}
  const tr=map.map(m=>new THREE.QuaternionKeyframeTrack(m.t.name+'.quaternion',times,m.v));tr.push(new THREE.VectorKeyframeTrack('Hips.position',times,hp));
  const c2=new THREE.AnimationClip(cl.name,cl.duration,tr);c2.speed=Math.hypot(dx,dz)/cl.duration;return c2;}
function inPlace(cl,hip){const t=cl.tracks.find(t=>t.name===hip+'.position');if(!t)return 0;const v=t.values,n=v.length/3,dx=v[(n-1)*3]-v[0],dz=v[(n-1)*3+2]-v[2];
  for(let i=0;i<n;i++){const f=i/(n-1);v[i*3]-=dx*f;v[i*3+2]-=dz*f;}return Math.hypot(dx,dz)/cl.duration;}
function makeForm(name,root,clips,o){
  const f={name,root,o,mixer:new THREE.AnimationMixer(root),acts:{},speed:{},cur:null,acc:0,b:{}};
  root.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.frustumCulled=false;const mt=m.material;mt.transparent=false;mt.depthWrite=true;mt.alphaTest=o.alphaTest||0;mt.metalness=0;mt.roughness=o.rough;
    if(mt.normalScale)mt.normalScale.setScalar(o.nrm||1);if(o.glow&&mt.map){mt.emissive=new THREE.Color(0xffffff);mt.emissiveMap=mt.map;mt.emissiveIntensity=o.glow;}if(o.tint)mt.color.set(o.tint);});
  for(const k in o.bones)f.b[k]=root.getObjectByName(o.bones[k]);
  root.updateMatrixWorld(true);for(const k of['neck','head'])if(f.b[k])f.b[k].userData.fwd=new THREE.Vector3(0,0,1).applyQuaternion(f.b[k].getWorldQuaternion(_q1).invert());
  for(const c of clips){f.acts[c.name]=f.mixer.clipAction(c);f.speed[c.name]=c.speed||0;}
  f.acts.idle.play();f.mixer.setTime(.01);root.updateMatrixWorld(true);const s=o.headY/f.b.head.getWorldPosition(_v1).y;root.scale.setScalar(s);for(const k in f.speed)f.speed[k]*=s;
  f.mixer.stopAllAction();
  f.ov=['spine','neck','head','armL','armR','foreL','foreR','jaw'].map(k=>f.b[k]).filter(Boolean).map(b=>({b,q:b.quaternion.clone()}));
  f.springs=[['spine',70,9,.3],['head',45,6,.3],['armL',22,3.2,-.8],['armR',22,3.2,-.8],['foreL',30,4,-.5],['foreR',30,4,-.5]].filter(s=>f.b[s[0]]).map(s=>({b:f.b[s[0]],k:s[1],c:s[2],g:s[3],x:0,z:0,vx:0,vz:0}));
  root.visible=false;cr.g.add(root);forms[name]=f;return f;}
function setForm(n,crawl=false,ceil=false){const f=forms[n];if(!f)return;if(cr.stun===undefined){cr.stun=0;cr.hp=120;}for(const k in forms)forms[k].root.visible=false;f.root.visible=true;
  if(cr.form!==f||cr.crawl!==crawl){f.mixer.stopAllAction();f.cur=null;}cr.form=f;cr.crawl=crawl;cr.ceil=ceil;for(const s of f.springs)s.x=s.z=s.vx=s.vz=0;
  f.root.position.y=ceil?H-.03:0;f.root.rotation.z=ceil?Math.PI:0;}
function playClip(f,name,fade,ts){const a=f.acts[name]||f.acts.idle;if(f.cur!==a){a.reset();const once=name==='slam'||name==='rage';a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=true;
    if(name==='attack')a.time=a.getClip().duration*.28;if(f.cur)a.crossFadeFrom(f.cur,fade,false);a.play();f.cur=a;}a.timeScale=ts;}
function wrot(b,qd){b.getWorldQuaternion(_q1).premultiply(qd);b.parent.getWorldQuaternion(_q2).invert();b.quaternion.copy(_q2.multiply(_q1));}
function aim(f,target,w,max){for(const[k,sh]of[['neck',.45],['head',1]]){const b=f.b[k];if(!b)continue;b.getWorldQuaternion(_q3);_v1.copy(b.userData.fwd).applyQuaternion(_q3);b.getWorldPosition(_v2);_v2.subVectors(target,_v2).normalize();
    const ang=_v1.angleTo(_v2);if(ang<.01)continue;_v3.crossVectors(_v1,_v2);if(_v3.lengthSq()<1e-8)continue;_q3.setFromAxisAngle(_v3.normalize(),Math.min(ang,max)*w*sh);wrot(b,_q3);}}
function poseCreature(dt,moving,hunting){
  const f=cr.form;if(!f)return;const n=f.name,sp=cr.spd||0,kill=cr.state==='kill';let clip='idle',ts=1;
  if(n==='girl'){if(kill){clip='attack';ts=1.7;}else if(cr.crawl){clip='crawl';ts=moving?clamp(sp/2.4,.6,2.4):.03;}
    else if(moving){if(hunting){clip='run';ts=clamp(sp/f.speed.run,.7,2.4);}else if(sp>1.1){clip='stride';ts=clamp(sp/f.speed.stride,.7,1.8);}else{clip='walk';ts=clamp(sp/f.speed.walk,.8,2.4);}}
    else clip=cr.scream>.5?'agony':(cr.state==='appar'||cr.state==='front')?'scratch':'idle';}
  else if(n==='pale'){ts=.55;}
  else{clip=kill?'attack':cr.stun>.3?'taunt':cr.state==='rage'?'rage':cr.state==='stuck'?'slam':moving?(sp>2?'run':'walk'):'idle';if(moving&&sp>2)ts=clamp(sp/(f.speed.run||4.2),.8,1.7);if(kill)ts=1.4;}
  playClip(f,clip,kill?.08:.22,ts);
  for(const o of f.ov)o.b.quaternion.copy(o.q);            // strip last frame's procedural layer
  f.acc+=dt;const step=(n==='brute'||hunting||kill||cr.crawl)?0:(n==='pale'?1/9:1/12); // stalking forms move on dropped frames
  if(!step||f.acc>=step){f.mixer.update(f.acc);f.acc=0;if(n==='girl'&&!kill&&f.cur&&R()<(hunting?.015:.05))f.cur.time=Math.max(0,f.cur.time-rr(.06,.2));}
  for(const o of f.ov)o.q.copy(o.b.quaternion);
  // inertia: springs driven by the body's change in velocity
  const idt=1/Math.max(dt,1e-3);_v4.subVectors(cr.pos,cr.pv).multiplyScalar(idt);cr.pv.copy(cr.pos);if(_v4.lengthSq()>225)_v4.copy(cr.vel);
  const dvx=clamp(_v4.x-cr.vel.x,-4,4),dvz=clamp(_v4.z-cr.vel.z,-4,4);cr.vel.copy(_v4);
  const cy=Math.cos(cr.yaw),sy=Math.sin(cr.yaw),dl=dvx*cy-dvz*sy,df=dvx*sy+dvz*cy;_v2.set(sy,0,cy);_v3.set(cy,0,-sy);
  for(const s of f.springs){s.vx+=(-s.k*s.x-s.c*s.vx)*dt+dl;s.vz+=(-s.k*s.z-s.c*s.vz)*dt-df;s.x=clamp(s.x+s.vx*dt,-1.2,1.2);s.z=clamp(s.z+s.vz*dt,-1.2,1.2);
    if(Math.abs(s.x)+Math.abs(s.z)>.004){_q3.setFromAxisAngle(_v2,s.x*s.g);wrot(s.b,_q3);_q3.setFromAxisAngle(_v3,s.z*s.g);wrot(s.b,_q3);}}
  // head tracking
  const st=cr.state;let w=0;if(kill||n==='pale'||st==='appar'||st==='front'||st==='behind')w=1;else if(cr.crawl)w=.9;else if(st==='hunt'||st==='finale'||st==='rush')w=.85;else if(cr.alert>.15||st==='search')w=.8;
  cr.aimW=lerp(cr.aimW,w,Math.min(1,dt*(w>cr.aimW?6:2)));if(cr.aimW>.02)aim(f,head,cr.aimW,kill?1.7:1.15);
  cr.tw-=dt;if(cr.tw<0){cr.tw=hunting?rr(.05,.35):rr(.5,3);const k=kill?.14:hunting?.28:(R()<.3?.42:.04);cr.twz=rr(-k,k);cr.twy=rr(-k,k)*.5;}
  if(f.b.head&&Math.abs(cr.twz+cr.tilt)+Math.abs(cr.twy)>.003){_q3.setFromAxisAngle(_v2,cr.twz+cr.tilt);wrot(f.b.head,_q3);_q3.setFromAxisAngle(_v1.set(0,1,0),cr.twy);wrot(f.b.head,_q3);}
  if(f.b.jaw&&cr.scream>.01)f.b.jaw.rotateX(cr.scream*(f.o.jaw||.5));
}
function faceCreature(to,snap){const y=Math.atan2(to.x-cr.pos.x,to.z-cr.pos.z);if(snap)cr.yaw=y;else{let d=y-cr.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));cr.yaw+=clamp(d,-.12,.12);}cr.g.rotation.y=cr.yaw;}
let assetsReady=false;
async function loadAssets(onp){
  const L=new GLTFLoader(),names=['girl','pale','brute','anims','body'];let done=0;
  const[girl,pale,brute,anims,body]=await Promise.all(names.map(n=>L.loadAsync(ASSET+n+'.glb').then(g=>{onp(++done/names.length);return g;})));
  const MX=p=>({head:p+'Head',neck:p+'Neck',spine:p+'Spine2',armL:p+'LeftArm',armR:p+'RightArm',foreL:p+'LeftForeArm',foreR:p+'RightForeArm'});
  makeForm('girl',girl.scene,anims.animations.map(c=>retarget(c,anims.scenes,girl.scene)),{headY:1.6,rough:.48,glow:.012,bones:MX('')});
  const pidle=THREE.AnimationUtils.subclip(pale.animations[0],'idle',0,Math.round(3.8*30),30);
  makeForm('pale',pale.scene,[pidle],{headY:2.12,rough:.5,glow:.022,tint:0xd9d9d4,jaw:.55,bones:{head:'head_062',neck:'neck_061',spine:'chest_013',armL:'L_arm_015',armR:'R_arm_039',foreL:'L_elbow_016',foreR:'R_elbow_040',jaw:'jaw_065'}});
  for(const c of brute.animations)c.speed=inPlace(c,'mixamorigHips');
  makeForm('brute',brute.scene,brute.animations,{headY:2.02,rough:.58,glow:.008,bones:MX('mixamorig')});
  const bx=new THREE.Box3().setFromObject(body.scene),sz=bx.getSize(new THREE.Vector3()),ct=bx.getCenter(new THREE.Vector3()),long=Math.max(sz.x,sz.y,sz.z),k=1.8/long;
  for(const b of bedBodies){const m=body.scene.clone(true),h=new THREE.Group();m.position.copy(ct).multiplyScalar(-1);h.add(m);
    if(sz.x===long)h.rotation.y=Math.PI/2;else if(sz.y===long)h.rotation.x=Math.PI/2;const s=new THREE.Group();s.add(h);s.scale.setScalar(k);
    const thin=Math.min(sz.x,sz.y,sz.z)*k;s.position.set(0,.7+thin/2,0);s.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.material.metalness=0;o.material.roughness=.85;}});b.add(s);}
  assetsReady=true;
}

/* ───────────────────────── audio (all synthesized) ───────────────────────── */
const A={c:null,
  init(){if(this.c){this.c.resume();return;}const c=this.c=new(window.AudioContext||window.webkitAudioContext)();
    this.comp=c.createDynamicsCompressor();this.comp.threshold.value=-16;this.comp.ratio.value=5;this.comp.connect(c.destination);
    this.master=this.g(.95,this.comp);
    const len=c.sampleRate*3.4|0,ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(R()*2-1)*Math.pow(1-i/len,2.8)*Math.min(1,i/400);}
    this.rev=c.createConvolver();this.rev.buffer=ir;const rl=this.f('lowpass',3200,.5,this.g(.6,this.master));this.rev.connect(rl);
    const nb=this.nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=R()*2-1;
    this.amb=this.g(1,this.master);this.ambience();
    this.cp=this.pan(new THREE.Vector3(0,-50,0));this.cb=this.g(1,this.cp); // creature bus
    // tension strings
    this.ten=this.g(0,this.master);const tf=this.f('lowpass',1500,.7,this.ten);this.g(.5,this.rev).gain.value=.5;const tw=this.g(.6,this.rev);this.ten.connect(tw);
    for(const fq of[233,246.5,261,277.5,466,494.5,523.5]){const o=this.o('sawtooth',fq*rr(.995,1.005),this.g(.14,tf));const l=this.o('sine',rr(4,6.5),this.g(fq*.006,o.frequency));}
    const sub=this.o('sine',37,this.g(.9,this.ten));const tr=this.g(.5,this.ten);this.o('sine',31,tr);
    // breath
    this.brF=this.f('bandpass',900,.9,this.brG=this.g(0,this.master));this.n(this.brF);
    // fixture hum ×2
    this.hum=[0,1].map(()=>{const p=this.pan(new THREE.Vector3()),g=this.g(0,p),hp=this.f('highpass',700,.7,g);this.o('sawtooth',100,hp);this.o('square',50,this.g(.4,hp));const lo=this.o('sine',100,this.g(.5,g));return{p,g};});
  },
  now(){return this.c.currentTime;},
  g(v,d){const n=this.c.createGain();n.gain.value=v;if(d)n.connect(d);return n;},
  f(t,fr,q,d){const n=this.c.createBiquadFilter();n.type=t;n.frequency.value=fr;n.Q.value=q;if(d)n.connect(d);return n;},
  o(t,fr,d,t0,dur){const n=this.c.createOscillator();n.type=t;n.frequency.value=fr;if(d)n.connect(d);n.start(t0||0);if(dur)n.stop((t0||this.now())+dur);return n;},
  n(d,t0,dur){const s=this.c.createBufferSource();s.buffer=this.nb;s.loop=true;s.connect(d);s.start(t0||0,R()*1.5);if(dur)s.stop((t0||this.now())+dur);return s;},
  env(p,t,a,pk,d){p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(pk,t+a);p.exponentialRampToValueAtTime(.0001,t+a+d);},
  pan(pos,wet=.55){const p=this.c.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=1.6;p.rolloffFactor=1.5;p.maxDistance=60;
    this.setP(p,pos);p.connect(this.master);p.connect(this.g(wet,this.rev));return p;},
  setP(p,v){if(p.positionX){p.positionX.value=v.x;p.positionY.value=v.y;p.positionZ.value=v.z;}else p.setPosition(v.x,v.y,v.z);},
  bus(pos,vol=1,wet=.5){const g=this.g(vol);if(pos)g.connect(this.pan(pos,wet));else{g.connect(this.master);g.connect(this.g(wet,this.rev));}return g;},
  listen(p,f){const l=this.c.listener;if(l.positionX){l.positionX.value=p.x;l.positionY.value=p.y;l.positionZ.value=p.z;l.forwardX.value=f.x;l.forwardY.value=f.y;l.forwardZ.value=f.z;l.upX.value=0;l.upY.value=1;l.upZ.value=0;}
    else{l.setPosition(p.x,p.y,p.z);l.setOrientation(f.x,f.y,f.z,0,1,0);}},
  ambience(){const a=this.amb;this.o('sine',41,this.g(.16,a));this.o('sine',43.6,this.g(.13,a));this.o('sine',61.7,this.g(.04,a));
    const r=this.f('lowpass',110,.6,this.g(.5,a));this.n(r);
    const air=this.g(.012,a),af=this.f('bandpass',2300,.6,air);this.n(af);this.o('sine',.07,this.g(.008,air.gain));this.o('sine',.11,this.g(700,af.frequency));
    const w=this.g(.02,this.rev),wf=this.f('bandpass',420,3,w);this.n(wf);this.o('sine',.05,this.g(160,wf.frequency));this.o('sine',.083,this.g(.015,w.gain));},
  duck(d){const t=this.now(),g=this.amb.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(.02,t+.25);g.setValueAtTime(.02,t+d);g.linearRampToValueAtTime(1,t+d+3);},
  thump(dest,f0,f1,dur,vol,t){t=t||this.now();const g=this.g(0,dest);this.env(g.gain,t,.004,vol,dur);const o=this.o('sine',f0,g,t,dur+.1);o.frequency.exponentialRampToValueAtTime(f1,t+dur);},
  burst(dest,type,fr,q,dur,vol,t){t=t||this.now();const g=this.g(0,dest);this.env(g.gain,t,.003,vol,dur);this.n(this.f(type,fr,q,g),t,dur+.1);},
  step(run){const b=this.bus(null,1,.35);this.burst(b,'lowpass',rr(380,620),.8,run?.09:.07,run?.2:.1);this.burst(b,'bandpass',rr(1800,2600),1.5,.02,.025);},
  crStep(v=1,p=1){this.burst(this.cb,'lowpass',rr(200,300)*p,.8,.12,.9*v);this.burst(this.cb,'bandpass',rr(900,1500)*p,2,.035,.25*v);this.thump(this.cb,70*p,40*p,.12/p,.6*v);},
  clatter(pos,kind,s){const b=this.bus(pos,.5+s*1.7,.7),t=this.now();if(kind==='box'){this.burst(b,'lowpass',320,.8,.09,.9,t);return;}
    const f=kind==='can'?rr(2600,4200):kind==='bucket'?rr(380,620):kind==='ivstand'?rr(900,1500):kind==='tile'?rr(500,800):rr(140,260),dec=kind==='can'?.09:kind==='tile'?.05:kind==='gurney'?.5:.35;
    [1,2.32,3.87,5.9].forEach((m,i)=>{const g=this.g(0,b);this.env(g.gain,t,.002,.35/(i+1),dec*rr(.6,1.2));this.o('sine',f*m*rr(.98,1.02),g,t,dec*1.5+.1);});this.burst(b,kind==='tile'?'lowpass':'bandpass',kind==='tile'?700:f*2.2,1.2,.035,.4,t);},
  rattle(dur,vol=1,dest){dest=dest||this.cb;const t=this.now();let tt=t;const br=this.g(0,dest);this.env(br.gain,t,dur*.3,.12*vol,dur*.7);this.n(this.f('lowpass',300,1,br),t,dur+.2);
    while(tt<t+dur){const k=(tt-t)/dur;this.burst(dest,'bandpass',rr(480,900),9,.028,rr(.5,1)*1.6*vol*(.4+Math.sin(k*3.14)),tt);tt+=lerp(.11,.036,Math.sin(k*3.14))*rr(.85,1.2);}},
  shriek(dest,dur=1.2,vol=.7,pitch=1){const c=this.c,t=this.now(),out=this.g(0,dest);out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(vol,t+.03);out.gain.setValueAtTime(vol,t+dur*.65);out.gain.exponentialRampToValueAtTime(.001,t+dur);
    const ws=c.createWaveShaper(),cu=new Float32Array(256);for(let i=0;i<256;i++)cu[i]=Math.tanh((i/128-1)*3.5);ws.curve=cu;ws.connect(out);
    const f1=this.f('bandpass',1250*Math.sqrt(pitch),2.5,ws),f2=this.f('bandpass',2950*Math.sqrt(pitch),3.5,ws);
    for(const b0 of[410,633,921]){const b=b0*pitch;const o=this.o('sawtooth',b,null,t,dur);const arr=new Float32Array(36);for(let i=0;i<36;i++)arr[i]=b*(1+i/36*.25)*(1+(R()-.5)*.42);o.frequency.setValueCurveAtTime(arr,t,dur);o.connect(f1);o.connect(f2);}
    this.n(this.f('highpass',4200,.5,this.g(.35,ws)),t,dur);this.n(this.g(.5,f2),t,dur);},
  stinger(vol=1){const t=this.now(),b=this.bus(null,vol,.5);this.thump(b,120,26,1.1,1.1,t);this.burst(b,'highpass',1100,.5,.4,.55,t);
    const g=this.g(0,this.f('lowpass',5200,.5,b));this.env(g.gain,t,.004,.11,1.3);for(let i=0;i<8;i++)this.o('sawtooth',rr(560,2500),g,t,1.5);},
  boom(vol=.7){const b=this.bus(null,vol,.7);this.thump(b,70,24,1.8,1);this.burst(b,'lowpass',160,.7,1.2,.6);},
  clang(pos){const b=this.bus(pos,1.3,1.1),t=this.now(),f=rr(150,330);[1,2.76,5.4,8.93,11.3].forEach((m,i)=>{const g=this.g(0,b);this.env(g.gain,t,.003,.5/(i+1),rr(1.2,3));this.o('sine',f*m*rr(.99,1.01),g,t,3.4);});this.burst(b,'bandpass',2500,1,.04,.3,t);},
  knock(pos){const b=this.bus(pos,1.4,1),t=this.now(),n=2+(R()*3|0);for(let i=0;i<n;i++){this.thump(b,rr(150,190),90,.09,.8,t+i*rr(.22,.4));this.burst(b,'bandpass',700,2,.03,.3,t+i*.3);}},
  scrape(pos){const b=this.bus(pos,1.2,1),t=this.now(),d=rr(1.5,3.2),g=this.g(0,b);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.3);g.gain.linearRampToValueAtTime(0,t+d);
    const tr=this.g(.5,g);this.o('sawtooth',rr(13,22),tr.gain,t,d);const f=this.f('bandpass',rr(500,1100),5,tr);this.n(f,t,d);f.frequency.linearRampToValueAtTime(rr(400,900),t+d);},
  bang(pos,vol=1){const b=this.bus(pos,2.2*vol,.8);this.thump(b,95,42,.3,1.2);this.burst(b,'lowpass',240,.8,.22,1.2);this.burst(b,'bandpass',2100,3,.09,.35);this.burst(b,'bandpass',3400,6,.16,.12);},
  whisper(){const c=this.c,t=this.now(),d=rr(2.2,3.6),sp=c.createStereoPanner(),g=this.g(0,sp);sp.connect(this.master);sp.connect(this.g(.5,this.rev));const s=R()<.5?-1:1;sp.pan.setValueAtTime(s,t);sp.pan.linearRampToValueAtTime(-s,t+d);
    const f1=this.f('bandpass',1700,5,g),f2=this.f('bandpass',3300,6,g);this.n(f1,t,d);this.n(f2,t,d);let tt=t;g.gain.setValueAtTime(0,t);
    while(tt<t+d-.2){const l=rr(.09,.26);g.gain.linearRampToValueAtTime(rr(.05,.14),tt+l*.3);g.gain.linearRampToValueAtTime(.004,tt+l);f1.frequency.setValueAtTime(rr(900,2300),tt);f2.frequency.setValueAtTime(rr(2600,4200),tt);tt+=l+(R()<.2?rr(.1,.3):0);}
    g.gain.linearRampToValueAtTime(0,t+d);},
  runAbove(a,bp){const t=this.now(),n=11;for(let i=0;i<n;i++){const p=a.clone().lerp(bp,i/(n-1));p.y=H+.6;const b=this.bus(p,1.6,.7);this.thump(b,100,50,.08,1,t+i*.13);this.burst(b,'lowpass',300,.8,.06,.7,t+i*.13);}},
  pop(pos){const b=this.bus(pos,1.6,.6),t=this.now();this.burst(b,'highpass',1800,.5,.05,1.2,t);this.thump(b,200,60,.08,.6,t);for(let i=0;i<7;i++){const g=this.g(0,b),tt=t+.05+R()*.5;this.env(g.gain,tt,.002,.08,rr(.05,.2));this.o('sine',rr(3000,7500),g,tt,.3);}},
  gun(k){const b=this.bus(null,1,.9),t=this.now(),P=k==='shotgun'?[1.6,.3,70,800]:k==='smg'?[.85,.1,115,1900]:[1.15,.17,95,1400];
    this.burst(b,'highpass',P[3],.5,P[1]*.5,P[0]*1.1,t);this.burst(b,'lowpass',750,.7,P[1],P[0]*1.3,t);this.thump(b,P[2]*1.7,P[2]*.4,P[1],P[0]*1.3,t);this.burst(b,'bandpass',2900,2,.018,.7,t);},
  dry(){this.burst(this.bus(null,1,.15),'bandpass',1900,3,.02,.35);},
  reload(d){const b=this.bus(null,1,.25),t=this.now();for(const[k,f]of[[.05,1400],[.45,900],[.92,2100]]){this.burst(b,'bandpass',f,3,.03,.3,t+d*k);this.thump(b,220,120,.03,.25,t+d*k);}},
  hitFlesh(pos){const b=this.bus(pos,1.5,.3);this.burst(b,'lowpass',520,.9,.07,1);this.burst(b,'bandpass',1500,1.5,.05,.4);},
  ric(pos){const b=this.bus(pos,.9,.6),t=this.now(),g=this.g(0,b);this.env(g.gain,t,.002,.2,.12);const o=this.o('sine',rr(2600,4800),g,t,.2);o.frequency.exponentialRampToValueAtTime(rr(1200,2000),t+.15);this.burst(b,'highpass',3000,.5,.02,.3,t);},
  click(){this.burst(this.bus(null,1,.1),'highpass',2500,.5,.012,.18);},
  clink(){const b=this.bus(null,1,.3),t=this.now();for(const f of[2140,3410,5120]){const g=this.g(0,b);this.env(g.gain,t,.002,.05,.12);this.o('sine',f,g,t,.2);}this.burst(b,'lowpass',500,.7,.05,.1,t);},
  relay(pos){const b=this.bus(pos,2,.8);this.thump(b,140,45,.25,1.2);this.burst(b,'bandpass',1500,2,.05,.6);},
  grind(pos,d){const b=this.bus(pos,1.6,.6),t=this.now(),g=this.g(0,b);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.6,t+.2);g.gain.setValueAtTime(.6,t+d-.15);g.gain.linearRampToValueAtTime(0,t+d);
    const tr=this.g(.6,g);this.o('sawtooth',17,tr.gain,t,d);this.n(this.f('lowpass',420,2,tr),t,d);this.o('sawtooth',58,this.g(.12,g),t,d);this.n(this.f('bandpass',2600,8,this.g(.08,g)),t,d);},
  heart(v){const b=this.bus(null,v,.1),t=this.now();this.thump(b,62,36,.11,.9,t);this.thump(b,54,34,.1,.6,t+.17);},
  liftHum(){const t=this.now(),g=this.g(0,this.master);g.gain.linearRampToValueAtTime(.25,t+1.5);g.gain.linearRampToValueAtTime(0,t+9);this.o('sawtooth',48,this.f('lowpass',220,1,g),t,9);this.o('sine',96.5,g,t,9);},
};

/* ───────────────────────── physics: rigid props the player and the monsters knock around ───────────────────────── */
const PW=new CANNON.World({gravity:new CANNON.Vec3(0,-9.82,0)});PW.allowSleep=true;PW.broadphase=new CANNON.SAPBroadphase(PW);PW.solver.iterations=7;
PW.defaultContactMaterial.friction=.42;PW.defaultContactMaterial.restitution=.2;
const gnd=new CANNON.Material('gnd'),slick=new CANNON.Material('slick');PW.addContactMaterial(new CANNON.ContactMaterial(slick,gnd,{friction:.03,restitution:.1}));
const sBody=(shape,x,y,z,ry=0)=>{const b=new CANNON.Body({mass:0,material:gnd});b.addShape(shape);b.position.set(x,y,z);b.quaternion.setFromEuler(0,ry,0);PW.addBody(b);return b;};
{const f=new CANNON.Body({mass:0,material:gnd});f.addShape(new CANNON.Plane());f.quaternion.setFromEuler(-Math.PI/2,0,0);PW.addBody(f);
 const c=new CANNON.Body({mass:0,material:gnd});c.addShape(new CANNON.Plane());c.quaternion.setFromEuler(Math.PI/2,0,0);c.position.set(0,H,0);PW.addBody(c);
 const wb=new CANNON.Box(new CANNON.Vec3(CS/2,H/2,CS/2));
 for(let z=0;z<ROWS;z++)for(let x=0;x<COLS;x++){if(open(x,z))continue;let adj=false;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(open(x+a,z+b))adj=true;if(adj)sBody(wb,x*CS+CS/2,H/2,z*CS+CS/2);}
 const bb=new CANNON.Box(new CANNON.Vec3(.47,.38,1.02));for(const b of bedList)sBody(bb,b.x,.38,b.z,b.ry);}
const liftBody=sBody(new CANNON.Box(new CANNON.Vec3(.12,H/2,CS/2)),lift.pos.x,H/2,lift.pos.z,lift.g.rotation.y+Math.PI/2);
const props=[],dynCells=new Set();
const M2={card:new THREE.MeshStandardMaterial({color:0x5d4c34,roughness:.95,bumpMap:sheetTex,bumpScale:.8}),
  can:new THREE.MeshStandardMaterial({color:0x8a8d88,roughness:.35,metalness:.85,map:metalTex})};
function addProp(kind,mesh,shapes,mass,x,y,z,ry,o={}){
  const b=new CANNON.Body({mass,material:o.mat||null,linearDamping:o.ld??.1,angularDamping:o.ad??.25,allowSleep:true,sleepSpeedLimit:o.sl??.3,sleepTimeLimit:.5});
  for(const[s,off]of shapes)b.addShape(s,off);b.position.set(x,y,z);b.quaternion.setFromEuler(0,ry,0);if(o.upright)b.angularFactor.set(0,1,0);PW.addBody(b);
  mesh.traverse(m=>{if(m.isMesh)m.castShadow=m.receiveShadow=true;});scene.add(mesh);mesh.position.set(x,y,z);mesh.rotation.y=ry;
  const p={kind,mesh,b,home:[x,y,z,ry],snd:0,temp:!!o.temp};b.addEventListener('collide',e=>onHit(p,e));props.push(p);return p;}
const cyl=(r1,r2,h,m,seg=10,open=false)=>new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg,1,open),m);
function mkIV(x,z){const g=new THREE.Group(),pole=cyl(.012,.012,1.75,M.metal,6);pole.position.y=.875;g.add(pole);
  for(const r of[0,Math.PI/2]){const l=box(.5,.025,.04,M.metal);l.position.y=.02;l.rotation.y=r;g.add(l);}
  const hk=box(.2,.012,.012,M.metal);hk.position.y=1.72;g.add(hk);const bag=box(.1,.17,.035,M.sheet);bag.position.set(.09,1.6,0);g.add(bag);
  return addProp('ivstand',g,[[new CANNON.Box(new CANNON.Vec3(.2,.02,.2)),new CANNON.Vec3(0,.02,0)],[new CANNON.Box(new CANNON.Vec3(.02,.86,.02)),new CANNON.Vec3(0,.88,0)]],3.2,x,.005,z,R()*6.28);}
function mkBucket(x,z){const g=new THREE.Group(),m=M.metal.clone();m.side=THREE.DoubleSide;const s=cyl(.14,.11,.26,m,12,true);g.add(s);const bt=cyl(.11,.11,.01,m,12);bt.position.y=-.125;g.add(bt);
  return addProp('bucket',g,[[new CANNON.Cylinder(.14,.11,.26,10),new CANNON.Vec3()]],1,x,.14,z,R()*6.28);}
function mkBox(x,z,y=.16){const w=rr(.3,.45),h=rr(.22,.32),d=rr(.25,.35);return addProp('box',box(w,h,d,M2.card),[[new CANNON.Box(new CANNON.Vec3(w/2,h/2,d/2)),new CANNON.Vec3()]],.9,x,y,z,R()*6.28);}
function mkCan(x,z){return addProp('can',cyl(.033,.033,.12,M2.can,8),[[new CANNON.Cylinder(.033,.033,.12,8),new CANNON.Vec3()]],.15,x,.07,z,R()*6.28,{ad:.5,ld:.35,sl:.7});}
function mkGurney(x,z,ry){const g=new THREE.Group(),fr=box(.72,.04,1.86,M.metal);fr.position.y=.3;g.add(fr);const mt=box(.68,.09,1.8,M.sheet);mt.position.y=.37;g.add(mt);
  for(const[a,b]of[[-.32,-.85],[.32,-.85],[-.32,.85],[.32,.85]]){const l=box(.03,.68,.03,M.metal);l.position.set(a,-.06,b);g.add(l);const w=cyl(.05,.05,.03,M.dark,10);w.rotation.z=Math.PI/2;w.position.set(a,-.39,b);g.add(w);}
  const rail=box(.72,.3,.03,M.metal);rail.position.set(0,.5,-.92);g.add(rail);
  return addProp('gurney',g,[[new CANNON.Box(new CANNON.Vec3(.37,.42,.94)),new CANNON.Vec3()]],24,x,.445,z,ry,{mat:slick,upright:true,ld:.25,ad:.5});}
(function(){const cs=CELLS.filter(c=>!propCells.has(c.x+','+c.z)&&!(c.x===START.x&&c.z===START.z)&&!(c.x===LN.x&&c.z===LN.z)).sort(()=>R()-.5);let i=0;
  const spot=(c,r=.9)=>{const p=cc(c.x,c.z);return[p.x+rr(-r,r),p.z+rr(-r,r)];};
  for(let k=0;k<4&&i<cs.length;k++,i++){const c=cs[i],ns=walk(c.x,c.z-1)||walk(c.x,c.z+1),p=cc(c.x,c.z);mkGurney(p.x+(ns?rr(.5,.8)*(R()<.5?-1:1):rr(-.3,.3)),p.z+(ns?rr(-.3,.3):rr(.5,.8)*(R()<.5?-1:1)),ns?rr(-.15,.15):Math.PI/2+rr(-.15,.15));dynCells.add(c.x+','+c.z);}
  for(let k=0;k<7&&i<cs.length;k++,i++){const c=cs[i];mkIV(...spot(c));dynCells.add(c.x+','+c.z);}
  for(let k=0;k<6&&i<cs.length;k++,i++){const c=cs[i];mkBucket(...spot(c));if(R()<.5)mkCan(...spot(c));dynCells.add(c.x+','+c.z);}
  for(let k=0;k<5&&i<cs.length;k++,i++){const c=cs[i],[x,z]=spot(c,.7);mkBox(x,z);mkBox(x+rr(-.3,.3),z+rr(.36,.5));if(R()<.6)mkBox(x,z,.5);dynCells.add(c.x+','+c.z);}
  for(let k=0;k<16;k++)mkCan(...spot(pick(cs),1.1));
})();
const kBody=(r)=>{const b=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,allowSleep:false,collisionFilterGroup:2});b.addShape(new CANNON.Sphere(r));b.position.set(0,-60,0);PW.addBody(b);return b;};
const pBody=kBody(.3),mBody=kBody(.42),bBody=kBody(.78),hBody=[kBody(.07),kBody(.07)];
function kin(b,x,y,z,dt){const dx=x-b.position.x,dy=y-b.position.y,dz=z-b.position.z;if(dx*dx+dy*dy+dz*dz>1){b.position.set(x,y,z);b.velocity.set(0,0,0);}else b.velocity.set(dx/dt,dy/dt,dz/dt);}
function park(b){b.position.set(0,-60,0);b.velocity.set(0,0,0);}
function onHit(p,e){if(G.mode==='title')return;const v=Math.abs(e.contact.getImpactVelocityAlongNormal()),now=clock.elapsedTime;if(v<.9||now-p.snd<.13)return;p.snd=now;
  const pos=new THREE.Vector3(p.b.position.x,p.b.position.y,p.b.position.z);if(A.c&&pos.distanceTo(head)<22)A.clatter(pos,p.kind,Math.min(1,v/6));if(v>1.4&&p.kind!=='box')noiseAt(pos,v);}
function noiseAt(pos,v){ // loud things bring it over
  if((cr.state!=='roam'&&cr.state!=='search')||cr.pos.distanceTo(pos)>5+v*2.2)return;const c=cellOf(pos);if(!walk(c.x,c.z))return;cr.path=pathTo(cellOf(cr.pos),c);cr.state='search';cr.t=0;}
function stepPhysics(dt){
  kin(pBody,head.x,.75,head.z,dt);const f=cr.form;
  if(cr.g.visible&&!cr.ceil&&f&&f.name!=='pale'){const b=f.name==='brute'?bBody:mBody;kin(b,cr.pos.x,f.name==='brute'?.95:(cr.crawl?.45:.8),cr.pos.z,dt);park(b===mBody?bBody:mBody);}else{park(mBody);park(bBody);}
  ctrls.forEach((c,i)=>{if(c.userData.hand&&renderer.xr.isPresenting){c.getWorldPosition(_v1);kin(hBody[i],_v1.x,_v1.y,_v1.z,dt);}else park(hBody[i]);});
  liftBody.position.y=lift.open>.75?-60:H/2;
  PW.step(1/60,dt,3);
  for(const p of props){const b=p.b;if(b.sleepState===2&&p.synced)continue;p.mesh.position.set(b.position.x,b.position.y,b.position.z);p.mesh.quaternion.set(b.quaternion.x,b.quaternion.y,b.quaternion.z,b.quaternion.w);p.synced=b.sleepState===2;
    if(b.position.y<-5)homeProp(p);}
}
function homeProp(p){const[x,y,z,ry]=p.home,b=p.b;b.position.set(x,y,z);b.quaternion.setFromEuler(0,ry,0);b.velocity.set(0,0,0);b.angularVelocity.set(0,0,0);b.wakeUp();p.synced=false;}
function resetProps(){for(let i=props.length-1;i>=0;i--){const p=props[i];if(p.temp){PW.removeBody(p.b);scene.remove(p.mesh);props.splice(i,1);}else homeProp(p);}}
function stomp(pos,r,amt){for(const p of props){const dx=p.b.position.x-pos.x,dz=p.b.position.z-pos.z,d=Math.hypot(dx,dz);if(d>r||p.kind==='gurney')continue;p.b.wakeUp();const k=amt*(1-d/r);p.b.velocity.y+=k*rr(.6,1.2);p.b.angularVelocity.x+=rr(-2,2)*k;p.b.angularVelocity.z+=rr(-2,2)*k;}}
function physEvent(kind){
  const P=p=>new THREE.Vector3(p.b.position.x,p.b.position.y,p.b.position.z);
  if(kind==='throw'){const c=props.filter(p=>p.kind!=='gurney'&&!p.temp&&(()=>{const q=P(p),d=q.distanceTo(head);return d>2.2&&d<9&&los(head,q);})());if(!c.length)return false;
    const p=pick(c),q=P(p);_v1.set(head.x-q.x,0,head.z-q.z).normalize();_v2.set(-_v1.z,0,_v1.x).multiplyScalar(rr(.25,.6)*(R()<.5?-1:1));_v1.add(_v2).normalize();
    const sp=rr(7,10);p.b.wakeUp();p.b.velocity.set(_v1.x*sp,rr(2.2,3.6),_v1.z*sp);p.b.angularVelocity.set(rr(-9,9),rr(-9,9),rr(-9,9));A.c&&A.thump(A.bus(q,1.6,.6),90,40,.2,1);return true;}
  if(kind==='tile'){_v1.copy(head).addScaledVector(vflat,rr(1.8,3.2));const c=cellOf(_v1);if(!walk(c.x,c.z)||props.filter(p=>p.temp).length>5)return false;
    const p=addProp('tile',box(.58,.02,.58,M.ceil),[[new CANNON.Box(new CANNON.Vec3(.29,.012,.29)),new CANNON.Vec3()]],.5,_v1.x,H-.06,_v1.z,R()*6.28,{temp:true,ad:.05});
    p.b.angularVelocity.set(rr(-3,3),0,rr(-3,3));p.b.velocity.set(0,-1,0);A.c&&A.burst(A.bus(new THREE.Vector3(_v1.x,H,_v1.z),1.4,.6),'bandpass',900,1,.08,1);return true;}
  if(kind==='roll'){const c=props.filter(p=>p.kind==='gurney'&&(()=>{const q=P(p),d=q.distanceTo(head);return d>3.5&&d<11&&los(head,q);})());if(!c.length)return false;
    const p=pick(c),q=P(p);_v1.set(head.x-q.x,0,head.z-q.z).normalize();p.b.wakeUp();p.b.velocity.set(_v1.x*2.4,0,_v1.z*2.4);p.b.angularVelocity.set(0,rr(-.4,.4),0);return true;}
  return false;}

/* ───────────────────────── game state ───────────────────────── */
const G={mode:'title',t:0,fuses:0,placed:0,power:false,place:true,stamina:1,stepAcc:0,fear:0,heartT:0,brPh:0,envT:0,crT:0,ambT:5,lastEv:'',evN:0,endT:0,deadT:0,winT:0,powT:0};
const head=new THREE.Vector3(),view=new THREE.Vector3(),vflat=new THREE.Vector3(),tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),lastOK=new THREE.Vector3();
const inp={mx:0,mz:0,run:false,turn:0,trig:false,any:false};const keys={};let trigPrev=false,snapReady=true,anyPrev=true,fPrev=false;
addEventListener('keydown',e=>{keys[e.code]=true;});addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('mousemove',e=>{if(document.pointerLockElement!==renderer.domElement||renderer.xr.isPresenting)return;rig.rotation.y-=e.movementX*.0022;camera.rotation.x=clamp(camera.rotation.x-e.movementY*.0022,-1.4,1.4);});
renderer.domElement.addEventListener('click',()=>{if(G.mode!=='title'&&!renderer.xr.isPresenting)lockPtr();});
function lockPtr(){try{const p=renderer.domElement.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}

function reset(){
  G.mode='play';G.t=0;G.fuses=0;G.placed=0;G.power=false;G.place=true;G.stamina=1;G.fear=0;G.envT=rr(16,24);G.crT=rr(38,50);G.lastEv='';G.evN=0;G.endT=0;G.deadT=0;G.winT=0;G.powT=0;
  cr.state='hidden';cr.g.visible=false;cr.scream=0;cr.tilt=0;cr.alert=0;cr.ceil=false;cr.g.position.set(0,0,0);resetProps();
  fl.on=true;fl.dead=0;lift.open=0;lift.target=0;emLight.intensity=0;
  fixtures.forEach((f,i)=>{f.alive=R()<.42;f.kind=R()<.65?0:1;f.burst=0;});
  breaker.leds.forEach(l=>l.material.color.set(0x550000));breaker.fuses.forEach(f=>f.visible=false);doors.forEach(d=>{d.cool=0;d.shake=0;});
  buildCarts();resetWeapons();fadeT=0;fadeSpd=.5;msg.material.opacity=0;
  if(!renderer.xr.isPresenting){rig.rotation.y=0;camera.rotation.set(0,0,0);camera.position.set(0,1.65,0);}
}
function headNow(out){rig.updateMatrixWorld();return out.copy(camera.position).applyMatrix4(rig.matrixWorld);}
const solidP=(x,z)=>{if(G.mode==='ending')return!(x===LIFT.x&&z===LIFT.z);if(x===LIFT.x&&z===LIFT.z)return lift.open<.75;return!open(x,z);};
function resolve(p){const r=.3,cx=Math.floor(p.x/CS),cz=Math.floor(p.z/CS);if(solidP(cx,cz)){p.x=lastOK.x;p.z=lastOK.z;return;}
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,z=cz+dz;if(!solidP(x,z))continue;const nx=clamp(p.x,x*CS,x*CS+CS),nz=clamp(p.z,z*CS,z*CS+CS),ex=p.x-nx,ez=p.z-nz,d2=ex*ex+ez*ez;
    if(d2<r*r&&d2>1e-9){const d=Math.sqrt(d2);p.x=nx+ex/d*r;p.z=nz+ez/d*r;}}
  for(const c of colliders){const ex=p.x-c.x,ez=p.z-c.z,d=Math.hypot(ex,ez);if(d<c.r+.2&&d>1e-5){p.x=c.x+ex/d*(c.r+.2);p.z=c.z+ez/d*(c.r+.2);}}
  lastOK.copy(p);}

let mouseFire=false,swapPrev=false,relPrev=false;
addEventListener('mousedown',e=>{if(e.button===0&&document.pointerLockElement===renderer.domElement)mouseFire=true;});addEventListener('mouseup',()=>{mouseFire=false;});
function pollInput(){inp.mx=inp.mz=inp.turn=0;inp.run=false;let trig=false,any=false,f=false,fire=false,swap=false,rel=false;
  const s=renderer.xr.getSession();
  if(s){for(const src of s.inputSources){const gp=src.gamepad;if(!gp)continue;const ax=gp.axes,sx=ax.length>=4?ax[2]:(ax[0]||0),sy=ax.length>=4?ax[3]:(ax[1]||0),b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);
      if(b(0)||b(4)||b(5))any=true;
      if(src.handedness==='left'){inp.mx=sx;inp.mz=sy;inp.run=b(1)||b(3);if(b(0))trig=true;}else{inp.turn=sx;fire=b(0);rel=b(1)||b(5);swap=b(4);}}}
  else{inp.mx=(keys.KeyD?1:0)-(keys.KeyA?1:0);inp.mz=(keys.KeyS?1:0)-(keys.KeyW?1:0);inp.run=!!(keys.ShiftLeft||keys.ShiftRight);f=!!keys.KeyF;any=!!(keys.Space||keys.Enter);fire=mouseFire;rel=!!keys.KeyR;swap=!!keys.KeyQ;
    for(const[kc,w]of[['Digit1','pistol'],['Digit2','shotgun'],['Digit3','smg']])if(keys[kc]&&W.have[w]&&W.cur!==w&&W.rel<=0)equip(w);}
  inp.trig=(trig&&!trigPrev)||(f&&!fPrev);trigPrev=trig;fPrev=f;inp.any=any&&!anyPrev;anyPrev=any;inp.fire=fire;inp.swap=swap&&!swapPrev;swapPrev=swap;inp.reload=rel&&!relPrev;relPrev=rel;}

function movePlayer(dt){
  if(renderer.xr.isPresenting){if(Math.abs(inp.turn)>.6&&snapReady){snapReady=false;headNow(tmp);rig.rotation.y-=Math.sign(inp.turn)*Math.PI/6;headNow(tmp2);rig.position.x+=tmp.x-tmp2.x;rig.position.z+=tmp.z-tmp2.z;}
    if(Math.abs(inp.turn)<.3)snapReady=true;}
  camera.getWorldDirection(view);vflat.set(view.x,0,view.z);if(vflat.lengthSq()<1e-4)vflat.set(0,0,-1);vflat.normalize();
  let mx=Math.abs(inp.mx)>.15?inp.mx:0,mz=Math.abs(inp.mz)>.15?inp.mz:0;const mag=Math.min(1,Math.hypot(mx,mz));
  const running=inp.run&&mag>.3&&G.stamina>.02;G.running=running;
  G.stamina=clamp(G.stamina+(running?-dt/5.5:dt/9),0,1);
  const sp=(running?3.7:1.85)*mag;let moved=0;
  if(mag>0){const n=Math.hypot(mx,mz);mx/=n;mz/=n;const dx=(vflat.x*-mz+(-vflat.z)*mx)*sp*dt,dz=(vflat.z*-mz+vflat.x*mx)*sp*dt;rig.position.x+=dx;rig.position.z+=dz;moved=Math.hypot(dx,dz);}
  headNow(head);tmp.copy(head);resolve(tmp);rig.position.x+=tmp.x-head.x;rig.position.z+=tmp.z-head.z;head.x=tmp.x;head.z=tmp.z;
  G.stepAcc+=moved;if(G.stepAcc>(running?1.0:.72)){G.stepAcc=0;A.step(running);}
}
function updateFlash(dt){
  if(inp.trig&&(G.mode==='play'||G.mode==='ending')){fl.on=!fl.on;A.click();}
  fl.dead=Math.max(0,fl.dead-dt);
  const d=cr.g.visible?cr.pos.distanceTo(head):99;let k=1;
  if(d<9&&R()<(9-d)*.035)k=rr(.05,.7);if(fl.dead>0)k=(fl.sput&&R()<.12)?.3:0;if(R()<.004)k=.6;
  fl.flick=lerp(fl.flick,k,.6);const lit=fl.on?fl.flick:0;spot.intensity=fl.base*lit;flash.userData.lens.material.color.setScalar(lit>.05?1:.03);
  flash.getWorldPosition(dust.uniforms.lp.value);flash.getWorldDirection(tmp).negate();dust.uniforms.ld.value.copy(tmp);dust.uniforms.on.value=lit;dust.uniforms.ct.value.copy(head);
}
const lightOn=()=>fl.on&&fl.dead<=0;
function blackout(d,sput){fl.dead=Math.max(fl.dead,d);fl.sput=!!sput;}

/* ───────────────────────── creature brain ───────────────────────── */
function hideCr(wait){cr.state='hidden';cr.g.visible=false;cr.scream=0;cr.tilt=0;cr.alert=0;cr.ceil=false;G.crT=wait!==undefined?wait:Math.max(14,rr(26,44)-G.fuses*7-G.placed*3);}
function showCr(p,st,form='girl',crawl=false,ceil=false){setForm(form,crawl,ceil);cr.pos.set(p.x,0,p.z);cr.pv.copy(cr.pos);cr.vel.set(0,0,0);cr.g.visible=true;cr.state=st;cr.t=0;cr.path=[];cr.sub=0;cr.seen=0;cr.spd=0;cr.scream=0;cr.tilt=0;cr.aimW=0;cr.rattleT=1.5;cr.stun=0;cr.hp=form==='brute'?700:crawl?90:120;faceCreature(head,true);}
function corridor(minN,maxN,cross){ // straight run ahead of the player
  const pc=cellOf(head);let best=null,bd=.72;for(const d of DIRS){const dot=d[0]*vflat.x+d[1]*vflat.z;if(dot>bd){bd=dot;best=d;}}if(!best)return null;
  let out=null;for(let n=1;n<=maxN;n++){const x=pc.x+best[0]*n,z=pc.z+best[1]*n;if(!walk(x,z))break;
    if(n>=minN){if(cross){const a={x:x+best[1],z:z+best[0]},b={x:x-best[1],z:z-best[0]};if(walk(a.x,a.z)&&walk(b.x,b.z))return{c:{x,z},a,b};}else out={c:{x,z}};}}
  return out;}
function startHunt(loud=true){cr.state='hunt';cr.lose=0;cr.repath=0;cr.last=cellOf(head);if(loud){A.shriek(A.cb,1.3,1.6);A.boom(.6);}}
function creatureEvent(){
  const opts=[],ap=corridor(3,5,false),da=corridor(2,4,true),n=G.fuses+G.placed;
  if(ap&&lightOn())opts.push('appar');if(da)opts.push('dash');
  if(G.evN>=1){tmp.copy(head).addScaledVector(vflat,-1.15);const c=cellOf(tmp);if(walk(c.x,c.z)&&los(head,tmp))opts.push('behind');opts.push('front');if(ap&&G.evN>=2)opts.push('ceil');}
  let ev;const roamP=G.evN<1?0:.34+.14*n;
  if(R()<roamP||!opts.length)ev=G.evN<1?null:'roam';else{const o=opts.filter(e=>e!==G.lastEv);ev=pick(o.length?o:opts);}
  if(G.forceRoam&&G.evN>=1){ev='roam';}G.forceRoam=false;
  if(!ev){G.crT=4;return;}G.lastEv=ev;G.evN++;
  if(ev==='appar'){const pale=R()<.55;showCr(cc(ap.c.x,ap.c.z),'appar',pale?'pale':'girl');cr.out=R();}
  else if(ev==='dash'){showCr(cc(da.a.x,da.a.z),'dash','girl',R()<.6);cr.dst=cc(da.b.x,da.b.z);faceCreature(cr.dst,true);}
  else if(ev==='ceil'){showCr(cc(ap.c.x,ap.c.z),'ceil','girl',true,true);A.scrape(cr.pos.clone().setY(H));}
  else if(ev==='behind'){tmp.copy(head).addScaledVector(vflat,-1.15);showCr(tmp,'behind','pale');A.duck(5);}
  else if(ev==='front'){cr.state='front';cr.t=0;cr.sub=0;cr.with=R()<.65;cr.g.visible=false;blackout(3.6,true);A.click();}
  else if(ev==='roam'){const ds=bfs(cellOf(head));const c=CELLS.filter(c=>{const d=ds[c.x+c.z*COLS];return d>=5&&d<=9&&!los(head,cc(c.x,c.z));});
    if(!c.length){G.crT=5;return;}const s=pick(c);showCr(cc(s.x,s.z),'roam','girl',n>=1&&R()<.3);cr.t=rr(50,80)+G.placed*10;cr.rattleT=2;}
}
function walkSound(d,speed){cr.stepAcc+=d;const br=cr.form&&cr.form.name==='brute';if(cr.stepAcc>(br?1.5:cr.crawl?.5:speed>2.5?1.05:.7)){cr.stepAcc=0;
    if(br){A.crStep(2.2,.55);stomp(cr.pos,6,1.3);}else A.crStep(cr.crawl?.45:speed>2.5?1:.55,cr.crawl?1.5:1);}}
function moveAlong(dt,speed){ // follow cr.path; returns true while moving
  if(!cr.path.length){cr.spd=0;return false;}const tgt=cc(cr.path[0].x,cr.path[0].z);tmp.copy(tgt).sub(cr.pos).setY(0);const d=tmp.length();
  if(d<.12){cr.path.shift();return cr.path.length>0;}cr.spd=speed;tmp.multiplyScalar(Math.min(1,speed*dt/d));cr.pos.add(tmp);faceCreature(tgt);walkSound(speed*dt,speed);return true;}
function straight(dt,to,speed){tmp.copy(to).sub(cr.pos).setY(0);const d=tmp.length();cr.spd=speed;if(d>.01){tmp.multiplyScalar(Math.min(1,speed*dt/d));cr.pos.add(tmp);faceCreature(to);walkSound(speed*dt,speed);}return d;}
function die(){G.mode='dying';G.deadT=0;const br=cr.form&&cr.form.name==='brute';if(!br)setForm('girl');cr.g.visible=true;cr.state='kill';A.stinger(1.2);A.shriek(A.master,1.5,.9,br?.34:1);}
function updateCreature(dt){
  const s=cr.state;if(s==='hidden'){if(!G.power){G.crT-=dt;if(G.crT<=0)creatureEvent();}return;}
  cr.t+=dt;if(A.c&&cr.g.visible)A.setP(A.cp,tmp2.copy(cr.pos).setY(cr.ceil?H:cr.crawl?.5:1.6));
  const d=Math.hypot(cr.pos.x-head.x,cr.pos.z-head.z),sees=cr.g.visible&&d<40&&los(cr.pos,head);
  tmp2.set(cr.pos.x-head.x,0,cr.pos.z-head.z).normalize();const looking=vflat.dot(tmp2); // player looking at it
  const n=G.fuses+G.placed;
  if(s==='appar'){const pale=cr.form.name==='pale';cr.tilt=Math.min(.3,cr.t*.07);
    if(cr.sub===0){poseCreature(dt,false,false);faceCreature(head);if(looking>.9&&lightOn()&&sees)cr.seen+=dt;
      if(cr.seen>1.1||d<7||cr.t>13){if(cr.t>13&&cr.seen<.2){hideCr();return;}
        if(pale){if(cr.out<.45||d<4.5){blackout(.55);A.boom(.5);hideCr();}else{cr.sub=2;cr.bl=0;cr.blT=.3;}}
        else if(cr.out<.4||d<4){blackout(.55);A.boom(.5);hideCr();}
        else if(cr.out<.75||n<1){cr.sub=1;cr.tilt=0;A.shriek(A.cb,1.1,1.5);}
        else{cr.tilt=0;startHunt();}}}
    else if(cr.sub===1){poseCreature(dt,true,true);if(straight(dt,head,8)<1.7||cr.t>20){blackout(.8);A.stinger(.8);hideCr();}}
    else{ // the pale one only gets closer while the light is out
      poseCreature(dt,false,false);faceCreature(head);cr.blT-=dt;
      if(cr.blT<=0){if(cr.bl<3){cr.bl++;cr.blT=rr(.5,.85);blackout(.13);A.thump(A.bus(null,.9,.3),52,30,.22,.9);tmp.set(head.x-cr.pos.x,0,head.z-cr.pos.z);const dd=tmp.length(),st=Math.max(0,Math.min(dd*.45,dd-1.45));cr.pos.addScaledVector(tmp.normalize(),st);cr.pv.copy(cr.pos);}
        else if(cr.bl===3){cr.bl=4;cr.blT=.42;cr.scream=1;cr.tilt=0;A.stinger(.9);A.shriek(A.cb,.9,1.5,1.55);}
        else{blackout(.8);hideCr();}}}
    return;}
  if(s==='dash'){poseCreature(dt,true,true);tmp.copy(cr.dst);if(straight(dt,tmp,cr.crawl?6:7.5)<.2)hideCr();return;}
  if(s==='ceil'){poseCreature(dt,true,true);tmp.set(head.x,0,head.z);if(straight(dt,tmp,2.6)<3.1||cr.t>10||!sees){blackout(.7);if(sees)A.stinger(.8);hideCr();}return;}
  if(s==='behind'){poseCreature(dt,false,false);faceCreature(head);
    if(cr.sub===0){if(cr.t>1.4&&cr.rattleT<=0){A.rattle(2.2,.45);cr.rattleT=2.6;}cr.rattleT-=dt;
      if(d>3.2||!sees){hideCr();return;}
      if(looking>.5){cr.sub=1;cr.t=0;A.stinger(1);A.shriek(A.cb,.9,1.6,1.55);}else if(cr.t>9)hideCr();}
    else{cr.scream=Math.min(1,cr.scream+dt*10);if(d>.8){tmp.set(head.x,0,head.z).sub(cr.pos).setY(0).normalize();cr.pos.addScaledVector(tmp,3.2*dt);}if(cr.t>.45){blackout(.9);hideCr();}}
    return;}
  if(s==='front'){ // torch dies; maybe something is there when it returns
    if(cr.sub===0&&cr.t>2.4){cr.sub=1;tmp.copy(head).addScaledVector(vflat,2.2);const c=cellOf(tmp);
      if(cr.with&&walk(c.x,c.z)&&los(head,tmp)){const t0=cr.t;showCr(tmp,'front',R()<.6?'pale':'girl');cr.t=t0;cr.sub=1;cr.tilt=.25;}else{A.setP(A.cp,tmp.setY(1.5));A.rattle(1.6,.5);}}
    if(cr.g.visible){poseCreature(dt,false,false);faceCreature(head);
      if(cr.sub===1&&fl.dead<=0){cr.sub=2;cr.t=0;}
      if(cr.sub===2&&cr.t>.6){cr.scream=1;A.stinger(.9);A.shriek(A.cb,.8,1.5,cr.form.name==='pale'?1.55:1);blackout(.7);hideCr();}
      if(d>6)hideCr();}
    else if(cr.t>4.2)hideCr(rr(18,30));
    return;}
  if(s==='kill')return;
  if(s==='rage'){poseCreature(dt,false,false);if(cr.t>3.3)cr.state='finale';return;}
  if(cr.stun>0){cr.stun-=dt;cr.spd=0;const sc=cr.scream;cr.scream=1;poseCreature(dt,false,false);cr.scream=sc;return;} // staggered by a hit
  // physical states: roam / search / hunt / finale
  const front=Math.cos(cr.yaw-Math.atan2(head.x-cr.pos.x,head.z-cr.pos.z));
  const sight=sees&&((lightOn()&&d<13&&(front>-.2||looking>.8))||(d<3.4&&front>.1)||d<1.8);
  const pc=cellOf(head),mc=cellOf(cr.pos);
  cr.rattleT-=dt;if(cr.rattleT<=0&&s!=='finale'){A.rattle(rr(1.4,2.6),s==='hunt'?1:.75);cr.rattleT=s==='hunt'?rr(2,3.5):rr(4,8);}
  if(s==='roam'||s==='search'){
    cr.alert=clamp(cr.alert+(sight?dt*(lightOn()?1.5:.9)*(d<5?2:1):-dt*.3),0,1);
    if(cr.alert>=1){startHunt();return;}
    if(G.running&&d<11&&walk(pc.x,pc.z)){cr.path=pathTo(mc,pc);cr.state='search';cr.t=0;}
    const moving=moveAlong(dt,s==='search'?(cr.crawl?2.2:1.6):(cr.crawl?1.1:.62+.06*G.placed));poseCreature(dt,moving,false);
    if(!moving){if(s==='search'&&cr.t>9){cr.state='roam';cr.t=rr(15,25);}
      else{const ds=bfs(pc),near=CELLS.filter(c=>{const k=ds[c.x+c.z*COLS];return k>=1&&k<=4;});if(near.length)cr.path=pathTo(mc,pick(near));}}
    if(s==='roam'){cr.t-=2*dt;if(cr.t<=0&&!sees&&d>8)hideCr();}
    if(d<.8)die();return;}
  if(s==='hunt'||s==='finale'){
    const fin=s==='finale',sp=fin?4.3:3.05+.2*n+(cr.crawl?.3:0);
    if(sight||fin){cr.lose=0;cr.last=pc;}else cr.lose+=dt;
    if(!fin&&cr.lose>5.5){cr.state='search';cr.t=0;cr.alert=.3;cr.path=pathTo(mc,cr.last);return;}
    const slow=!fin&&cr.lose>1.4;
    cr.repath-=dt;if(cr.repath<=0){cr.repath=.35;const tgt=slow?cr.last:pc;if(walk(tgt.x,tgt.z))cr.path=pathTo(mc,tgt);}
    let moving=true;if(sees&&d<4.2&&!slow)straight(dt,head,sp);else moving=moveAlong(dt,slow?1.6:sp);
    poseCreature(dt,moving,!slow);
    if(d<(fin?1.05:.85)&&G.mode==='play')die();return;}
}

/* ───────────────────────── environment events ───────────────────────── */
function around(r0,r1){const a=R()*6.28,r=rr(r0,r1);return new THREE.Vector3(head.x+Math.cos(a)*r,rr(.5,2.5),head.z+Math.sin(a)*r);}
function envEvent(){
  const o=['whisper','run','knock'];const dr=doors.filter(d=>d.cool<=0&&d.pos.distanceTo(head)<5.5&&los(head,d.pos.clone().lerp(head,.15)));if(dr.length)o.push('bang','bang');
  const fx=fixtures.filter(f=>f.alive&&f.pos.distanceTo(head)<5);if(fx.length)o.push('pop','pop');if(G.t>60&&cr.state==='hidden')o.push('dark');if(G.t>30)o.push('throw','throw','tile','roll');
  const e=pick(o.filter(x=>x!==G.lastEnv));G.lastEnv=e;
  if(e==='whisper')A.whisper();
  else if(e==='run'){const a=tmp.copy(head).addScaledVector(vflat,7).clone(),b=tmp2.copy(head).addScaledVector(vflat,-6).clone();A.runAbove(R()<.5?a:b,R()<.5?b:a);}
  else if(e==='knock')A.knock(around(3,7));
  else if(e==='bang'){const d=pick(dr);d.cool=60;d.seq=[0,rr(.35,.5),rr(.8,1.1),rr(1.9,2.6)];d.sq=0;}
  else if(e==='pop'){const f=pick(fx);f.burst=.18;}
  else if(e==='dark'){blackout(rr(1.2,2.4),true);if(R()<.5)A.scrape(around(2,4));}
  else if(e==='throw'||e==='tile'||e==='roll'){if(!physEvent(e)){G.envT=rr(3,6);return;}}
  G.envT=Math.max(9,rr(16,30)-(G.fuses+G.placed)*3);
}
function updateEnv(dt){
  G.envT-=dt;if(G.envT<=0)envEvent();
  G.ambT-=dt;if(G.ambT<=0){G.ambT=rr(6,15);const k=R();if(k<.4)A.clang(around(12,26));else if(k<.7)A.scrape(around(9,18));else A.knock(around(10,20));}
  for(const d of doors){d.cool-=dt;if(d.seq){d.sq+=dt;while(d.seq.length&&d.sq>=d.seq[0]){d.seq.shift();A.bang(d.pos);d.shake=1;}if(!d.seq.length)d.seq=null;}
    if(d.shake>0){d.shake=Math.max(0,d.shake-dt*4);d.slab.position.z=.05+Math.sin(d.shake*40)*.025*d.shake;d.slab.rotation.y=Math.sin(d.shake*31)*.02*d.shake;}}
  // fuses
  for(const c of carts){c.led.visible=!c.taken&&((G.t*1.1+c.ph)%1.6)<.12;if(c.taken)continue;let near=Math.hypot(c.pos.x-head.x,c.pos.z-head.z)<1.05;
    for(const h of ctrls)if(h.userData.hand&&h.getWorldPosition(tmp).distanceTo(c.pos)<.4)near=true;
    if(near){c.taken=true;c.f.visible=false;G.fuses++;A.clink();setHud();G.crT=Math.min(G.crT,rr(5,12));G.envT=Math.min(G.envT,rr(3,7));}}
  // breaker
  if(G.fuses>0&&!G.power&&Math.hypot(breaker.pos.x-head.x,breaker.pos.z-head.z)<1.5){
    G.insT=(G.insT||0)-dt;if(G.insT<=0){G.insT=.7;breaker.fuses[G.placed].visible=true;breaker.leds[G.placed].material.color.set(0x30d040);G.placed++;G.fuses--;A.relay(breaker.pos);setHud();
      if(G.placed===3)powerOn();}}
  // lift
  if(lift.open!==lift.target){lift.open=clamp(lift.open+Math.sign(lift.target-lift.open)*dt/(lift.target?5.5:1.0),0,1);}
  lift.a.position.x=-CS/4-lift.open*1.42;lift.b.position.x=CS/4+lift.open*1.42;
  if(G.power){G.powT+=dt;const p=cc(LN.x,LN.z);emLight.position.set(p.x,H-.4,p.z);emLight.intensity=G.mode==='ending'&&G.endT>1.3?0:(Math.sin(G.powT*5)>0?7:.6);
    if(G.mode==='play'){const lc=cc(LIFT.x,LIFT.z);if(Math.hypot(head.x-lc.x,head.z-lc.z)<1.05)endLift();}}
}
function powerOn(){G.power=true;G.powT=0;lift.target=1;A.boom(1);A.grind(lift.pos,5.5);
  const ds=bfs(LN),far=CELLS.filter(c=>{const k=ds[c.x+c.z*COLS];return k>=10&&k<=13;});const c=far.length?pick(far):pick(CELLS);
  showCr(cc(c.x,c.z),'rage','brute');setTimeout(()=>{if(G.power&&G.mode==='play'){A.shriek(A.cb,2.6,3,.3);A.boom(.8);}},700);}
function endLift(){G.mode='ending';G.endT=0;lift.target=0;A.grind(lift.pos,1.0);
  const ds=bfs(LN),ln=cc(LN.x,LN.z);const c=CELLS.filter(c=>{const k=ds[c.x+c.z*COLS];return k>=2&&k<=3&&los(cc(c.x,c.z),ln);});
  if(cr.form!==forms.brute)setForm('brute');
  if(cr.pos.distanceTo(ln)>8||!los(cr.pos,ln)){const s=c.length?pick(c):LN;cr.pos.copy(cc(s.x,s.z));cr.pv.copy(cr.pos);}cr.g.visible=true;cr.state='rush';A.shriek(A.cb,1.4,2.4,.32);}
function updateEnding(dt){G.endT+=dt;movePlayer(dt);updateFlash(dt);updateWeapons(dt);updateEnv(dt);
  if(cr.state==='stuck')poseCreature(dt,false,false);
  if(cr.state==='rush'){tmp.copy(lift.pos).setY(0);cr.scream=1;poseCreature(dt,true,true);A.setP(A.cp,tmp2.copy(cr.pos).setY(1.6));
    if(straight(dt,tmp,9.5)<.7&&lift.open<=.02){cr.state='stuck';A.bang(lift.pos,1.6);A.stinger(1);blackout(1.2);}}
  if(lift.open<=0&&cr.state==='rush'&&G.endT>2.2){cr.state='stuck';A.bang(lift.pos,1.6);A.stinger(1);}
  if(cr.state==='stuck'&&!G.won&&G.endT>1.5){G.won=true;G.winT=0;}
  if(G.won){G.winT+=dt;if(G.winT>.7&&G.winT<.7+dt*1.5)A.bang(lift.pos,1);if(G.winT>1.6&&!G.hum){G.hum=true;A.liftHum();fadeT=1;fadeSpd=.4;A.duck(8);}
    if(G.winT>5){G.mode='win';cr.g.visible=false;setMsg('You got out.','trigger / space to go back down');}}
}

/* ───────────────────────── weapons: found, loaded, upgraded ───────────────────────── */
const WDEF={pistol:{dmg:22,mag:8,rate:.26,auto:false,reload:1.3,spread:.012,pellets:1,kick:.1,box:8,name:'PISTOL',mz:-.16},
  shotgun:{dmg:9,mag:4,rate:.9,auto:false,reload:2.3,spread:.075,pellets:9,kick:.24,box:4,name:'SHOTGUN',mz:-.68},
  smg:{dmg:11,mag:30,rate:.085,auto:true,reload:2.0,spread:.03,pellets:1,kick:.04,box:30,name:'MACHINE GUN',mz:-.34}};
const WORDER=['pistol','shotgun','smg'];
const W={cur:null,have:{},lvl:{},mag:{},res:{},cool:0,rel:0,kick:0,flash:0,fireHeld:false,firePrev:false};
const wMag=k=>Math.round(WDEF[k].mag*(1+.25*(W.lvl[k]||0))),wDmg=k=>WDEF[k].dmg*(1+.25*(W.lvl[k]||0)),wRel=k=>WDEF[k].reload*(1-.12*(W.lvl[k]||0));
const gunRoot=new THREE.Group(),gunPivot=new THREE.Group();gunRoot.add(gunPivot);const GDESK=new THREE.Vector3(.2,-.19,-.34);camera.add(gunRoot);gunRoot.position.copy(GDESK);
const gm={metal:new THREE.MeshStandardMaterial({color:0x1b1c1e,roughness:.38,metalness:.85}),grip:new THREE.MeshStandardMaterial({color:0x17130f,roughness:.85}),wood:new THREE.MeshStandardMaterial({color:0x3a2516,roughness:.6})};
const gb=(w,h,d,m,x,y,z,rx=0)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);me.rotation.x=rx;return me;};
const gc=(r,l,m,x,y,z)=>{const me=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,10),m);me.rotation.x=Math.PI/2;me.position.set(x,y,z);return me;};
const guns={};
{const p=new THREE.Group();p.add(gb(.028,.032,.18,gm.metal,0,.02,-.07),gb(.022,.022,.16,gm.metal,0,-.004,-.06),gb(.026,.1,.042,gm.grip,0,-.05,.015,.28),gb(.006,.03,.05,gm.metal,0,-.03,-.03),gc(.006,.02,gm.metal,0,.02,-.165),gb(.004,.008,.004,gm.metal,0,.04,-.15));guns.pistol=p;
 const s=new THREE.Group();s.add(gc(.013,.56,gm.metal,0,.028,-.4),gc(.012,.42,gm.metal,0,.0,-.34),gb(.042,.062,.2,gm.metal,0,.012,-.03),gb(.05,.042,.15,gm.wood,0,-.004,-.32),gb(.034,.07,.27,gm.wood,0,-.03,.2,-.14),gb(.026,.08,.04,gm.wood,0,-.05,.06,.35));guns.shotgun=s;
 const m=new THREE.Group();m.add(gb(.04,.062,.27,gm.metal,0,.01,-.06),gc(.011,.16,gm.metal,0,.016,-.27),gc(.018,.07,gm.metal,0,.016,-.31),gb(.024,.17,.04,gm.metal,0,-.1,-.08,.1),gb(.026,.09,.04,gm.grip,0,-.06,.05,.3),gb(.012,.012,.2,gm.metal,0,.02,.17),gb(.03,.07,.012,gm.metal,0,-.005,.27),gb(.012,.02,.1,gm.metal,0,.05,-.08));guns.smg=m;}
const ammoTag=(()=>{const[c,x]=cv(128,64),t=tex(c,false),m=new THREE.Mesh(new THREE.PlaneGeometry(.036,.018),new THREE.MeshBasicMaterial({map:t,fog:false}));m.position.set(0,.052,.03);m.rotation.x=-.9;m.userData={x,t};gunPivot.add(m);return m;})();
const mflash=(()=>{const[c,x]=cv(64,64),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.3,'#ffd9a0');g.addColorStop(1,'rgba(255,120,30,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  const mt=new THREE.MeshBasicMaterial({map:tex(c,false),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),g2=new THREE.Group();
  for(const r of[0,Math.PI/2]){const q=new THREE.Mesh(new THREE.PlaneGeometry(.22,.22),mt);q.rotation.y=Math.PI/2;q.rotation.x=r;g2.add(q);}const f=new THREE.Mesh(new THREE.PlaneGeometry(.2,.2),mt);g2.add(f);g2.visible=false;gunPivot.add(g2);return g2;})();
for(const k in guns){guns[k].visible=false;gunPivot.add(guns[k]);}
const toast=(()=>{const[c,x]=cv(1024,128),t=tex(c,false),m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.1125),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false}));m.position.set(0,-.4,-1.3);m.renderOrder=997;m.userData={x,t,life:0};camera.add(m);return m;})();
function say(s){const{x,t}=toast.userData;x.clearRect(0,0,1024,128);x.textAlign='center';x.fillStyle='#c9c2ad';x.font='500 46px monospace';x.fillText(s,512,80);t.needsUpdate=true;toast.userData.life=2.6;}
function wHud(){const k=W.cur,{x,t}=ammoTag.userData;x.fillStyle='#050505';x.fillRect(0,0,128,64);ammoTag.visible=!!k;
  if(k){x.fillStyle=W.mag[k]?'#d9b860':'#b0302a';x.font='600 40px monospace';x.textAlign='center';x.fillText(W.mag[k]+'/'+W.res[k],64,46);t.needsUpdate=true;}
  setHud();if(k)hud.textContent+='   '+WDEF[k].name+' '+W.mag[k]+'/'+W.res[k]+(W.lvl[k]?'  MK'+(W.lvl[k]+1):'');}
function equip(k){if(!W.have[k])return;W.cur=k;W.rel=0;W.cool=.25;for(const n in guns)guns[n].visible=n===k;mflash.position.set(0,.02,WDEF[k].mz-.06);wHud();A.c&&A.click();document.getElementById('xh').hidden=renderer.xr.isPresenting;}
function nextWeapon(){const h=WORDER.filter(k=>W.have[k]);if(h.length<2)return;equip(h[(h.indexOf(W.cur)+1)%h.length]);}
function startReload(){const k=W.cur;if(!k||W.rel>0||W.mag[k]>=wMag(k)||W.res[k]<=0)return;W.rel=wRel(k);A.reload(W.rel);}
// pooled effects
const decals=[],drops=[],sparks=[];let decI=0,sparkI=0;
{const g=new THREE.CircleGeometry(.022,8),m=new THREE.MeshBasicMaterial({color:0x030303,fog:true,polygonOffset:true,polygonOffsetFactor:-2});for(let i=0;i<48;i++){const d=new THREE.Mesh(g,m);d.visible=false;scene.add(d);decals.push(d);}
 const bm=new THREE.MeshStandardMaterial({color:0x2a0303,roughness:.25}),bg=new THREE.SphereGeometry(.014,5,4);for(let i=0;i<22;i++){const d=new THREE.Mesh(bg,bm);d.visible=false;d.userData={v:new THREE.Vector3(),life:0};scene.add(d);drops.push(d);}
 const sm=new THREE.SpriteMaterial({map:mflash.children[0].material.map,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false});for(let i=0;i<8;i++){const s=new THREE.Sprite(sm);s.visible=false;s.userData={life:0};scene.add(s);sparks.push(s);}}
function blood(p,dir,n=7){let c=0;for(const d of drops){if(d.userData.life>0)continue;d.position.copy(p);d.userData.v.set(-dir.x*rr(.2,1.6)+rr(-1.2,1.2),rr(.2,2.2),-dir.z*rr(.2,1.6)+rr(-1.2,1.2));d.userData.life=rr(.35,.7);d.scale.setScalar(rr(.6,1.8));d.visible=true;if(++c>=n)break;}}
const _ray=new CANNON.RaycastResult(),_ro=new CANNON.Vec3(),_rt=new CANNON.Vec3(),_o=new THREE.Vector3(),_d=new THREE.Vector3(),_a=new THREE.Vector3(),_b=new THREE.Vector3(),_w=new THREE.Vector3(),_hp=new THREE.Vector3();
function raySeg(o,d,a,b){ // closest approach of a ray to a segment → [t along ray, distance, u along segment]
  _w.subVectors(b,a);const w0x=o.x-a.x,w0y=o.y-a.y,w0z=o.z-a.z,bb=d.dot(_w),c=_w.lengthSq(),dd=d.x*w0x+d.y*w0y+d.z*w0z,e=_w.x*w0x+_w.y*w0y+_w.z*w0z,den=c-bb*bb;
  let u=den>1e-6?clamp((e-bb*dd)/den,0,1):0;let t=Math.max(0,bb*u-dd);u=c>1e-6?clamp((e+bb*t)/c,0,1):0;t=Math.max(0,bb*u-dd);
  const px=o.x+d.x*t-(a.x+_w.x*u),py=o.y+d.y*t-(a.y+_w.y*u),pz=o.z+d.z*t-(a.z+_w.z*u);return[t,Math.sqrt(px*px+py*py+pz*pz),u];}
function shootRay(o,d,k){
  _ro.set(o.x,o.y,o.z);_rt.set(o.x+d.x*45,o.y+d.y*45,o.z+d.z*45);_ray.reset();PW.raycastClosest(_ro,_rt,{skipBackfaces:true,collisionFilterMask:1},_ray);
  const wd=_ray.hasHit?_ray.distance:45;const f=cr.form;
  if(cr.g.visible&&f&&cr.state!=='kill'){const br=f.name==='brute';f.b.head.getWorldPosition(_a);_a.y+=.06;_b.set(cr.pos.x,cr.ceil?H-.2:.15,cr.pos.z);
    if(cr.crawl){const s=Math.sin(cr.yaw),c=Math.cos(cr.yaw);_b.set(cr.pos.x-s*.7,cr.ceil?H-.3:.3,cr.pos.z-c*.7);}
    const[t,dist,u]=raySeg(o,d,_a,_b);if(t<wd&&dist<(br?.5:.3)){_hp.copy(o).addScaledVector(d,t);const hs=u<.14;hitMonster(wDmg(k)*(hs?2.2:1),_hp,d,k,hs);return;}}
  if(!_ray.hasHit)return;const hp=_ray.hitPointWorld,hn=_ray.hitNormalWorld,b=_ray.body;
  if(b.mass>0){b.wakeUp();const j=wDmg(k)*.035;b.applyImpulse(new CANNON.Vec3(d.x*j,d.y*j+.1,d.z*j),new CANNON.Vec3(hp.x-b.position.x,hp.y-b.position.y,hp.z-b.position.z));}
  else{const dc=decals[decI=(decI+1)%decals.length];dc.position.set(hp.x+hn.x*.006,hp.y+hn.y*.006,hp.z+hn.z*.006);dc.lookAt(hp.x+hn.x,hp.y+hn.y,hp.z+hn.z);dc.scale.setScalar(rr(.7,1.5));dc.visible=true;}
  const s=sparks[sparkI=(sparkI+1)%sparks.length];s.position.set(hp.x+hn.x*.03,hp.y+hn.y*.03,hp.z+hn.z*.03);s.scale.setScalar(rr(.08,.16));s.userData.life=.07;s.visible=true;
  if(A.c&&R()<.5)A.ric(new THREE.Vector3(hp.x,hp.y,hp.z));}
function hitMonster(dmg,p,dir,k,hs){
  const f=cr.form,s=cr.state;if(f.name==='pale'){blackout(.45);A.boom(.4);hideCr();return;} // nothing there to hit
  const br=f.name==='brute';blood(p,dir,hs?11:6);A.hitFlesh(p);
  if(s==='appar'||s==='dash'||s==='ceil'||s==='front'||s==='behind'){if(s==='ceil')setForm('girl',true,false);cr.tilt=0;startHunt();} // it was real after all
  else if(s==='roam'||s==='search')startHunt();
  cr.hp-=dmg;cr.stun=Math.min(br?.25:.8,cr.stun+dmg/(br?400:60));
  if(k==='shotgun'&&!br){_w.set(dir.x,0,dir.z).normalize().multiplyScalar(.12);_a.copy(cr.pos).add(_w);const c=cellOf(_a);if(walk(c.x,c.z)){cr.pos.copy(_a);cr.pv.copy(cr.pos);}}
  if(cr.hp<=0){if(br){cr.hp=700;cr.stun=4.5;A.shriek(A.cb,1.6,2.4,.3);}
    else if(!cr.crawl){setForm('girl',true);cr.hp=90;cr.stun=1.1;A.shriek(A.cb,1.1,1.5,.8);} // her legs give out; she keeps coming
    else{blackout(.5);A.shriek(A.cb,1.3,1.2,.7);A.boom(.5);hideCr(rr(55,85));say('IT IS GONE. FOR NOW.');}}
}
function fire(){const k=W.cur,d=WDEF[k];
  if(W.mag[k]<=0){A.dry();W.cool=.3;if(W.res[k]>0)startReload();else say('NO AMMUNITION');return;}
  W.mag[k]--;W.cool=d.rate;W.kick=d.kick;W.flash=.06;mflash.visible=true;mflash.rotation.z=R()*6.28;
  gunPivot.updateWorldMatrix(true,false);_o.set(0,.02,d.mz).applyMatrix4(gunPivot.matrixWorld);
  if(renderer.xr.isPresenting){gunRoot.getWorldDirection(_d).negate();}else{camera.getWorldPosition(_o);_d.copy(view);}
  for(let i=0;i<d.pellets;i++){_b.set(_d.x+rr(-1,1)*d.spread,_d.y+rr(-1,1)*d.spread,_d.z+rr(-1,1)*d.spread).normalize();shootRay(_o,_b.clone(),k);}
  A.gun(k);wHud();
  // it hears that
  if(cr.state==='roam'||cr.state==='search')startHunt(false);else if(cr.state==='hidden'&&!G.power){G.crT=Math.min(G.crT,rr(4,9));G.forceRoam=true;}
}
// pickups
const picks=[];
function mkPick(kind,type,c){const g=new THREE.Group(),p=cc(c.x,c.z),ws=wallSides(c),s=ws.length?pick(ws):0,[dx,dz]=DIRS[s],off=ws.length?rr(.9,1.1):0;
  const led=(col)=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.1,.012,.012),new THREE.MeshBasicMaterial({color:col}));return l;};
  if(kind==='weapon'){const cr8=box(.5,.42,.36,M2.card);cr8.position.y=.21;g.add(cr8);const m=guns[type].clone(true);m.visible=true;m.rotation.set(0,rr(0,6.28),Math.PI/2);m.position.set(0,.44,0);g.add(m);const l=led(0x50ff90);l.position.set(0,.3,.185);g.add(l);}
  else if(kind==='ammo'){const b=box(.16,.09,.1,new THREE.MeshStandardMaterial({color:type==='pistol'?0x5a4a1c:type==='shotgun'?0x5a1c18:0x1c2c4a,roughness:.7}));b.position.y=.045;g.add(b);const l=led(type==='pistol'?0xffc040:type==='shotgun'?0xff4030:0x4090ff);l.position.set(0,.092,0);g.add(l);}
  else{const b=box(.3,.14,.16,gm.metal);b.position.y=.07;g.add(b);const h=box(.14,.03,.02,gm.metal);h.position.y=.16;g.add(h);const l=led(0xffffff);l.position.set(0,.1,.085);g.add(l);}
  g.position.set(p.x+dx*off+rr(-.2,.2)*Math.abs(dz),0,p.z+dz*off+rr(-.2,.2)*Math.abs(dx));g.rotation.y=[0,-Math.PI/2,Math.PI,Math.PI/2][s]+Math.PI;scene.add(g);
  picks.push({kind,type,g,taken:false,pos:new THREE.Vector3(g.position.x,kind==='weapon'?.45:.08,g.position.z)});}
function buildPicks(){for(const p of picks)scene.remove(p.g);picks.length=0;
  const ds=bfs(START),D=c=>ds[c.x+c.z*COLS],used=new Set(carts.map(c=>{const k=cellOf(c.pos);return k.x+','+k.z;}));
  const free=CELLS.filter(c=>!propCells.has(c.x+','+c.z)&&!dynCells.has(c.x+','+c.z)&&!used.has(c.x+','+c.z)&&!(c.x===LN.x&&c.z===LN.z)&&D(c)>=1).sort(()=>R()-.5);
  const take=(f)=>{const i=free.findIndex(f);const c=i>=0?free.splice(i,1)[0]:free.pop();return c;};const mx=Math.max(...CELLS.map(D));
  mkPick('weapon','pistol',take(c=>D(c)>=2&&D(c)<=4));mkPick('weapon','shotgun',take(c=>D(c)>=mx*.35&&D(c)<=mx*.6));mkPick('weapon','smg',take(c=>D(c)>=mx*.7));
  for(const t of['pistol','pistol','pistol','pistol','shotgun','shotgun','shotgun','smg','smg','smg'])mkPick('ammo',t,take(c=>D(c)>=3));
  for(let i=0;i<5;i++)mkPick('parts',null,take(c=>D(c)>=5));}
function resetWeapons(){W.cur=null;W.have={};W.lvl={};W.mag={};W.res={};W.cool=0;W.rel=0;W.kick=0;for(const k in guns)guns[k].visible=false;for(const d of decals)d.visible=false;document.getElementById('xh').hidden=true;buildPicks();wHud();}
function takePick(p){p.taken=true;p.g.visible=false;
  if(p.kind==='weapon'){const k=p.type;W.have[k]=true;W.lvl[k]=W.lvl[k]||0;W.mag[k]=wMag(k);W.res[k]=(W.res[k]||0)+WDEF[k].box;equip(k);say(WDEF[k].name);A.c&&A.reload(.5);}
  else if(p.kind==='ammo'){const k=p.type;W.res[k]=(W.res[k]||0)+WDEF[k].box;say('+'+WDEF[k].box+' '+WDEF[k].name+' ROUNDS');A.c&&A.clink();}
  else{const k=W.cur&&W.lvl[W.cur]<3?W.cur:WORDER.find(k=>W.have[k]&&W.lvl[k]<3);if(!k){p.taken=false;p.g.visible=true;if(!p.told){p.told=true;say(W.cur?'NOTHING LEFT TO UPGRADE':'PARTS. FIND A WEAPON FIRST');}return;}
    W.lvl[k]++;say(WDEF[k].name+' UPGRADED · MARK '+(W.lvl[k]+1));A.c&&A.relay(head);}
  wHud();}
function updateWeapons(dt){
  for(const p of picks){if(p.taken)continue;let near=Math.hypot(p.pos.x-head.x,p.pos.z-head.z)<1.0;for(const h of ctrls)if(h.userData.hand&&h.getWorldPosition(tmp).distanceTo(p.pos)<.4)near=true;if(near)takePick(p);else p.told=false;}
  const k=W.cur;W.cool-=dt;W.kick=Math.max(0,W.kick-dt*(W.kick*9+.25));
  if(W.flash>0){W.flash-=dt;if(W.flash<=0)mflash.visible=false;}
  if(k){if(W.rel>0){W.rel-=dt;if(W.rel<=0){const n=Math.min(wMag(k)-W.mag[k],W.res[k]);W.mag[k]+=n;W.res[k]-=n;wHud();}}
    else{if(inp.reload)startReload();if(inp.swap)nextWeapon();
      const want=WDEF[k].auto?inp.fire:(inp.fire&&!W.firePrev);if(want&&W.cool<=0&&G.mode==='play')fire();}
    W.firePrev=inp.fire;
    gunPivot.rotation.x=W.kick*2.2-(W.rel>0?Math.min(.7,Math.sin(Math.min(1,W.rel/wRel(k))*Math.PI)*.9):0);gunPivot.position.z=W.kick*.35;}
  for(const d of drops){const u=d.userData;if(u.life<=0)continue;u.life-=dt;u.v.y-=9.8*dt;d.position.addScaledVector(u.v,dt);if(u.life<=0||d.position.y<.01)d.visible=false,u.life=0;}
  for(const s of sparks){if(s.userData.life>0){s.userData.life-=dt;if(s.userData.life<=0)s.visible=false;}}
  const tu=toast.userData;if(tu.life>0){tu.life-=dt;toast.material.opacity=clamp(tu.life*1.5,0,.9);}else toast.material.opacity=0;
}

/* ───────────────────────── frame ───────────────────────── */
const clock=new THREE.Clock();
function frame(){
  const dt=Math.min(.05,clock.getDelta());pollInput();
  if(G.place&&G.mode!=='title'){const s=cc(START.x,START.z);headNow(tmp);if(renderer.xr.isPresenting?clock.elapsedTime>G.placeAt:true){rig.position.x+=s.x-tmp.x;rig.position.z+=s.z-tmp.z;lastOK.set(s.x,0,s.z);G.place=false;}}
  if(G.mode==='play'){G.t+=dt;movePlayer(dt);updateFlash(dt);updateWeapons(dt);updateCreature(dt);if(G.mode==='play'||G.mode==='ending')updateEnv(dt);}
  else if(G.mode==='ending')updateEnding(dt);
  else if(G.mode==='dying'){G.deadT+=dt;headNow(head);camera.getWorldDirection(view);
    if(G.deadT<1.15){cr.scream=1;poseCreature(dt,false,true);const hb=cr.form.b.head,br=cr.form.name==='brute';
      for(let k=0;k<2;k++){cr.yaw=Math.atan2(head.x-cr.pos.x,head.z-cr.pos.z);cr.g.rotation.y=cr.yaw;cr.g.updateMatrixWorld(true);hb.getWorldPosition(tmp2);tmp.copy(head).addScaledVector(view,br?.62:.48);tmp.y-=br?.12:.07;cr.pos.add(tmp.sub(tmp2));}
      cr.pos.x+=rr(-.01,.01);cr.pos.y+=rr(-.01,.01);cr.pv.copy(cr.pos);
      spot.intensity=fl.base*(R()<.6?1:.1);if(!lightOn()){spot.intensity=fl.base*(R()<.5?.8:0);}}
    else{fadeT=1;fadeSpd=30;cr.g.visible=false;spot.intensity=0;}
    if(G.deadT>2.6&&G.mode==='dying'){G.mode='dead';setMsg('It found you.','trigger / space to wake again');}}
  else if(G.mode==='dead'||G.mode==='win'){msg.material.opacity=Math.min(1,msg.material.opacity+dt*.6);if(inp.any||inp.trig){G.won=false;G.hum=false;reset();}}
  if(G.mode!=='title')stepPhysics(dt);
  // fixtures
  const t=clock.elapsedTime;const al=[];
  for(const f of fixtures){let l=0;if(f.alive){if(f.burst>0){f.burst-=dt;l=4;if(f.burst<=0){f.alive=false;A.c&&A.pop(f.pos);}}
      else if(f.kind===0){const n=Math.sin(t*f.a)+Math.sin(t*f.b*2.3+f.ph)+Math.sin(t*13.7+f.ph*3);l=n>1.3?rr(.5,1):.015;}
      else l=.42+(R()<.04?-.35:0)+Math.sin(t*f.a*3+f.ph)*.05;}
    f.lvl=l;f.mat.emissiveIntensity=l*2.2;if(f.alive){f.d=f.pos.distanceTo(head);al.push(f);}}
  al.sort((a,b)=>a.d-b.d);
  pool.forEach((p,i)=>{const f=al[i];if(f){p.position.copy(f.pos);p.intensity=f.lvl*9*clamp((22-f.d)/6,0,1);}else p.intensity=0;
    if(A.c){const h=A.hum[i];if(f)A.setP(h.p,f.pos);h.g.gain.value=f?Math.min(.05,f.lvl*.04):0;}});
  if(W.flash>0){gunPivot.getWorldPosition(pool[1].position);pool[1].color.set(0xffc27a);pool[1].intensity=22;}else pool[1].color.set(0xcfe6c6);
  if(G.mode==='dying'&&G.deadT<1.15){pool[0].position.copy(head);pool[0].intensity=R()<.75?2.2:.2;}
  // fear / audio
  if(A.c&&G.mode!=='title'){headNow(head);camera.getWorldDirection(view);A.listen(head,view);
    const d=cr.g.visible?cr.pos.distanceTo(head):99;let f=0;if(cr.state==='hunt'||cr.state==='finale'||cr.state==='rush'||cr.state==='rage')f=1;else if(cr.g.visible)f=clamp(1-d/11,0,.75);if(G.mode!=='play'&&G.mode!=='ending')f=0;
    G.fear=lerp(G.fear,f,dt*(f>G.fear?2.5:.35));A.ten.gain.setTargetAtTime(G.fear*.085,A.now(),.3);
    G.heartT-=dt;if(G.heartT<=0&&G.fear>.12){G.heartT=lerp(1.05,.4,G.fear);A.heart(.5+G.fear*.9);}
    const ex=Math.max(G.fear*.7,1-G.stamina);G.brPh+=dt*lerp(1.6,5.2,ex);const s=Math.sin(G.brPh);A.brG.gain.value=ex*.07*Math.pow(Math.abs(s),1.6);A.brF.frequency.value=s>0?1250:720;}
  dust.uniforms.t.value=t;
  fadeMat.opacity=clamp(fadeMat.opacity+Math.sign(fadeT-fadeMat.opacity)*dt*fadeSpd,0,1);fadeS.visible=fadeMat.opacity>.002;
  renderer.render(scene,camera);
}
renderer.setAnimationLoop(frame);

/* ───────────────────────── start / UI ───────────────────────── */
const ui=document.getElementById('ui'),bvr=document.getElementById('bvr'),bdesk=document.getElementById('bdesk'),noteEl=document.getElementById('note');
function begin(){A.init();ui.hidden=true;G.placeAt=clock.elapsedTime+.4;reset();}
bdesk.addEventListener('click',()=>{begin();hud.hidden=false;lockPtr();});
bvr.addEventListener('click',async()=>{try{A.init();const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});
    await renderer.xr.setSession(s);hud.hidden=true;begin();
    s.addEventListener('end',()=>{G.mode='title';ui.hidden=false;fadeT=1;fadeSpd=5;camera.position.set(0,1.65,0);camera.rotation.set(0,0,0);if(A.c)A.c.suspend();});
  }catch(e){noteEl.textContent='Could not start VR: '+e.message;}});
let xrOK=false;const loadEl=document.getElementById('load');
loadAssets(p=>{loadEl.textContent='Loading creatures… '+Math.round(p*100)+'%';}).then(()=>{loadEl.hidden=true;bdesk.disabled=false;if(xrOK)bvr.disabled=false;}).catch(e=>{loadEl.textContent='Could not load the creature models ('+e.message+'). Try again.';console.error(e);});
if(navigator.xr&&navigator.xr.isSessionSupported){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(ok){xrOK=true;bvr.disabled=!assetsReady;}else noteEl.textContent='No VR headset found in this browser. Open this page in the Quest browser to play in VR.';}).catch(()=>{noteEl.textContent='VR is blocked in this frame. Host the file over HTTPS and open it in the Quest browser.';});}
else noteEl.textContent='This browser has no WebXR. Open the page in the Quest browser to play in VR.';
fadeMat.opacity=1;
window.__scare={ctrls,flash,gunRoot,W,WDEF,picks,takePick,fire,equip,hitMonster,updateWeapons,inp,forms,props,physEvent,setForm,PW,poseCreature,G,cr,A,fl,rig,camera,head,THREE,scene,renderer,carts,fixtures,doors,lift,breaker,cc,cellOf,bfs,CELLS,showCr,hideCr,startHunt,creatureEvent,envEvent,powerOn,die,LN,LIFT,START,spot};
