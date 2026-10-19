
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

const stage=document.getElementById('stage'), statEl=document.getElementById('stat');
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'}); renderer.info.autoReset=false;
renderer.setPixelRatio(1); renderer.localClippingEnabled=true; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.BasicShadowMap;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
let composer=null;
const PPU=30;
let PXS=Math.max(2,Math.round(2*(devicePixelRatio||1)));
let RW=0,RH=0;
let cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,800); const OCAM=cam, PCAM=new THREE.PerspectiveCamera(60,1,.05,600);
const FRAMEK=(()=>{ const q=+new URLSearchParams(location.search).get('frame'); return q>0&&q<=1?q:.866; })();
function resize(){ const dpr=devicePixelRatio||1, pw=innerWidth*FRAMEK*dpr, ph=innerHeight*FRAMEK*dpr; document.body.style.background=document.documentElement.style.background='#000';
  const S=pxS(); SCL=S; RW=Math.ceil(pw/S/2)*2; RH=Math.ceil(ph/S/2)*2;
  renderer.setSize(RW,RH,false); if(composer)composer.setSize(RW,RH);
  const c=renderer.domElement, cw=RW*S/dpr, ch=RH*S/dpr; c.style.width=cw+'px'; c.style.height=ch+'px';
  c.style.left=Math.floor((innerWidth-cw)/2)+'px'; c.style.top=Math.floor((innerHeight-ch)/2)+'px'; c.style.borderRadius=FRAMEK<1?'18px':'0';
  frustum(); }
let ppu=PPU, SCL=1, RESI=2;
const FULLRES=+(new URLSearchParams(location.search).get('fullres')||0); if(FULLRES)RESI=FULLRES;
const RESL=[.5,.75,1,1.5,2,3,4,6,8,12,16,24,32,48,64], V0=PPU*PXS;
const ZUPX=6, RES=()=>RESL[Math.min(RESL.length-1,RESI+(V0*ppu/PPU/(PPU*RESL[RESI])>=ZUPX?1:0))];
const MINPX=()=>Math.max(1,Math.round(PXS/RES())), MAXPX=8, ZMAX=PPU*80;
const RESMAX=FULLRES?10:3, vpu=()=>V0*ppu/PPU, art=()=>PPU*RES(), PCAP=()=>Math.max(1,Math.round(PXS/RESL[RESI])), pxS=()=>Math.min(Math.max(MINPX(),PCAP()),Math.max(MINPX(),Math.round(vpu()/art()))), rppu=()=>{ const r=Math.round(vpu()/art()); return r<MINPX()||r>Math.max(MINPX(),PCAP())?vpu()/pxS():art(); };
function frustum(){ const u=rppu(); cam.left=-RW/2/u; cam.right=RW/2/u; cam.top=RH/2/u; cam.bottom=-RH/2/u; cam.updateProjectionMatrix(); }
addEventListener('resize',resize);

const hash=(x,y,s)=>{ let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,982451653))|0; h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; };
const vnoise=(x,y,p,s)=>{ const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),m=a=>((a%p)+p)%p;
  const a=hash(m(xi),m(yi),s),b=hash(m(xi+1),m(yi),s),c=hash(m(xi),m(yi+1),s),d=hash(m(xi+1),m(yi+1),s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
const fbm=(x,y,px,py,s)=>vnoise(x,y,px,s)*.55+vnoise(x*2,y*2,px*2,s+1)*.3+vnoise(x*4,y*4,px*4,s+2)*.15;
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5], dith=(x,y)=>B4[(y&3)*4+(x&3)]/16-.47;
const rgb=h=>[h>>16&255,h>>8&255,h&255];
function tone(n,x,y,pal){ const k=Math.floor(((n-.5)*2.4+.5)*pal.length+dith(x,y)*.9); return pal[Math.max(0,Math.min(pal.length-1,k))]; }
function tex(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), im=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const [r,gg,b]=rgb(fn(x,y)), i=(y*w+x)*4; im.data[i]=r; im.data[i+1]=gg; im.data[i+2]=b; im.data[i+3]=255; }
  g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.generateMipmaps=true;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; }
const S=256, CL=8;
const nz=(x,y,s,c=CL)=>fbm(x/S*c,y/S*c,c,c,s);
const grassT=tex(S,S,(x,y)=>{ const tuft=hash(x,y,7)<.03||hash(x,(y+1)&255,7)<.03, fl=hash(x>>1,y>>1,9);
  if(fl<.0015)return (hash(x>>1,y>>1,10)<.5)?0xe8d36a:0xf2efe2; if(tuft)return nz(x,y,3)>.5?0x8cbb57:0x76a646;
  return tone(nz(x,y,1),x,y,[0x3c6628,0x48782f,0x568a37,0x659b41]); });
const asphaltT=tex(S,S,(x,y)=>{ const h=hash(x,y,21); if(h<.03)return 0x56575d; if(h<.05)return 0x222327; return tone(nz(x,y,20),x,y,[0x2e2f34,0x35363c,0x3c3d43,0x44454c]); });
const concreteT=tex(S,S,(x,y)=>{ if(x%32===0||y%32===0)return 0x85807a; const h=hash(x,y,31); if(h<.012)return 0x8e8981;
  return tone(nz(x,y,30),x,y,[0x9d988e,0xa9a498,0xb3aea2,0xbcb7ab]); });
const earthT=tex(S,S,(x,y)=>{ const s=hash(x>>1,y>>1,41); if(s<.03)return hash(x>>1,y>>1,42)<.5?0xa89c88:0x8f8573; if(hash(x,y,43)<.04)return 0x5f4930;
  return tone(nz(x,y,40),x,y,[0x6e5337,0x7a5e3e,0x866947,0x917352]); });
const grainT=tex(64,64,(x,y)=>hash(x,y,51)<.03?0xc4c4c4:tone(fbm(x/16,y/16,4,4,50),x,y,[0xd2d2d2,0xe0e0e0,0xeeeeee,0xffffff]));
const woodT=tex(64,64,(x,y)=>tone(fbm(x/32,y/5,2,13,60),x,y,[0xb9b9b9,0xcfcfcf,0xe4e4e4,0xf6f6f6]));
const stripeT=(a,b)=>tex(16,16,(x,y)=>(x>>2&1)?a:b);

const grad=new THREE.DataTexture(new Uint8Array([70,140,205,255]),4,1,THREE.RedFormat); grad.magFilter=grad.minFilter=THREE.NearestFilter; grad.needsUpdate=true;
const mcache={};
function M(color,map=grainT,o={}){ const k=color+'|'+(map?map.id:0)+'|'+JSON.stringify(o); return mcache[k]||(mcache[k]=new THREE.MeshToonMaterial({color,map,gradientMap:grad,...o})); }
function worldUV(g,upt){ const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){ const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)); let u,v;
    if(ax>.5){u=p.getZ(i);v=p.getY(i);} else if(ay>.5){u=p.getX(i);v=p.getZ(i);} else {u=p.getX(i);v=p.getY(i);} uv.setXY(i,u/upt,v/upt); } uv.needsUpdate=true; }
function box(w,h,d,mat,x,y,z,parent=scene,upt=4){ const g=new THREE.BoxGeometry(w,h,d); if(upt)worldUV(g,upt);
  const m=new THREE.Mesh(g,mat); m.position.set(x,y+h/2,z); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
function cyl(r,h,seg,mat,x,y,z,parent=scene){ const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat); m.position.set(x,y+h/2,z); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
function plane(x0,z0,x1,z1,y,t,color=0xffffff){ const w=x1-x0,d=z1-z0,g=new THREE.PlaneGeometry(w,d); g.rotateX(-Math.PI/2);
  const p=g.attributes.position,uv=g.attributes.uv; for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+x0+w/2)/16,-(p.getZ(i)+z0+d/2)/16);
  const m=new THREE.Mesh(g,M(color,t)); m.position.set(x0+w/2,y,z0+d/2); m.receiveShadow=true; scene.add(m); return m; }

const TEXTURES=__DATA__("data/textures.json");
const KITD=__DATA__("data/kit.json");
