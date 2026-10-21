// THE PAGE: renderer, scene, camera, the shared painters (tex, hash3) and the loading of the data files.

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

const stage=document.getElementById('stage'), statEl=document.getElementById('stat');
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'}); renderer.info.autoReset=false;
renderer.setPixelRatio(1); renderer.localClippingEnabled=true; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.BasicShadowMap;
stage.appendChild(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{ '@later'; e.preventDefault(); let d=document.getElementById('ctxlost'); if(!d){ d=document.createElement('div'); d.id='ctxlost'; d.style.cssText='position:fixed;inset:0;place-items:center;font:12px Silkscreen,monospace;letter-spacing:2px;color:#8a8f9c;background:#0e1016;z-index:60'; d.textContent='THE PICTURE WAS LOST, BRINGING IT BACK'; document.body.append(d); } d.style.display='grid'; });
renderer.domElement.addEventListener('webglcontextrestored',()=>{ renderer.shadowMap.needsUpdate=true; const d=document.getElementById('ctxlost'); if(d)d.style.display='none'; });
const scene=new THREE.Scene();
SHARED.composer=null;
const PPU=30;
let PXS=Math.max(2,Math.round(2*(devicePixelRatio||1)));
let RW=0,RH=0;
SHARED.cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,800); const OCAM=SHARED.cam, PCAM=new THREE.PerspectiveCamera(60,1,.05,600);
const FRAMEK=(()=>{ const q=+new URLSearchParams(location.search).get('frame'); return q>0&&q<=1?q:.866; })();
function resize(){ const dpr=devicePixelRatio||1, pw=innerWidth*FRAMEK*dpr, ph=innerHeight*FRAMEK*dpr; document.body.style.background=document.documentElement.style.background='#000';
  const S=pxS(); SCL=S; RW=Math.ceil(pw/S/2)*2; RH=Math.ceil(ph/S/2)*2;
  renderer.setSize(RW,RH,false); if(SHARED.composer)SHARED.composer.setSize(RW,RH);
  const c=renderer.domElement, cw=RW*S/dpr, ch=RH*S/dpr; c.style.width=cw+'px'; c.style.height=ch+'px';
  c.style.left=Math.floor((innerWidth-cw)/2)+'px'; c.style.top=Math.floor((innerHeight-ch)/2)+'px'; c.style.borderRadius=FRAMEK<1?'18px':'0';
  frustum(); }
let SCL=1; SHARED.ppu=PPU; SHARED.RESI=2;
const FULLRES=+(new URLSearchParams(location.search).get('fullres')||0); if(FULLRES)SHARED.RESI=FULLRES;
const RESL=[.5,.75,1,1.5,2,3,4,6,8,12,16,24,32,48,64], V0=PPU*PXS;
const ZUPX=6, RES=()=>RESL[Math.min(RESL.length-1,SHARED.RESI+(V0*SHARED.ppu/PPU/(PPU*RESL[SHARED.RESI])>=ZUPX?1:0))];
const MINPX=()=>Math.max(1,Math.round(PXS/RES())), ZMAX=PPU*80;
const RESMAX=FULLRES?10:3, vpu=()=>V0*SHARED.ppu/PPU, art=()=>PPU*RES(), PCAP=()=>Math.max(1,Math.round(PXS/RESL[SHARED.RESI])), pxS=()=>Math.min(Math.max(MINPX(),PCAP()),Math.max(MINPX(),Math.round(vpu()/art()))), rppu=()=>{ const r=Math.round(vpu()/art()); return r<MINPX()||r>Math.max(MINPX(),PCAP())?vpu()/pxS():art(); };
function frustum(){ const u=rppu(); SHARED.cam.left=-RW/2/u; SHARED.cam.right=RW/2/u; SHARED.cam.top=RH/2/u; SHARED.cam.bottom=-RH/2/u; SHARED.cam.updateProjectionMatrix(); }
addEventListener('resize',resize);

const hash3=(x,y,s)=>{ let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,982451653))|0; h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; };
const vnoise=(x,y,p,s)=>{ const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),m=a=>((a%p)+p)%p;
  const a=hash3(m(xi),m(yi),s),b=hash3(m(xi+1),m(yi),s),c=hash3(m(xi),m(yi+1),s),d=hash3(m(xi+1),m(yi+1),s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
const fbm=(x,y,px,py,s)=>vnoise(x,y,px,s)*.55+vnoise(x*2,y*2,px*2,s+1)*.3+vnoise(x*4,y*4,px*4,s+2)*.15;
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5], dith=(x,y)=>B4[(y&3)*4+(x&3)]/16-.47;
const rgb=h=>[h>>16&255,h>>8&255,h&255];
function tone(n,x,y,pal){ const k=Math.floor(((n-.5)*2.4+.5)*pal.length+dith(x,y)*.9); return pal[Math.max(0,Math.min(pal.length-1,k))]; }
function tex(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), im=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const [r,gg,b]=rgb(fn(x,y)), i=(y*w+x)*4; im.data[i]=r; im.data[i+1]=gg; im.data[i+2]=b; im.data[i+3]=255; }
  g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.generateMipmaps=true;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; }
const grainT=tex(64,64,(x,y)=>hash3(x,y,51)<.03?0xc4c4c4:tone(fbm(x/16,y/16,4,4,50),x,y,[0xd2d2d2,0xe0e0e0,0xeeeeee,0xffffff]));

const grad=new THREE.DataTexture(new Uint8Array([70,140,205,255]),4,1,THREE.RedFormat); grad.magFilter=grad.minFilter=THREE.NearestFilter; grad.needsUpdate=true;
const mcache={};
function M(color,map=grainT,o={}){ const k=color+'|'+(map?map.id:0)+'|'+JSON.stringify(o); return mcache[k]||(mcache[k]=new THREE.MeshToonMaterial({color,map,gradientMap:grad,...o})); }

const TEXTURES=__DATA__("data/textures.json");
const KITD=__DATA__("data/kit.json");
