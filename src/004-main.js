// THE PAGE: renderer, scene, camera, the shared painters (tex, hash3) and the loading of the data files.
import {SHARED, THREE} from './003-shx.js';
import {BUGS, PS2} from './003b-systems.js';

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

const stage=document.getElementById('stage'), statEl=document.getElementById('stat');
// the lighter picture (kept on this device; ?lite=1 or 0 sets it): no shadows and the graphics card left to the browser's choice, for a machine that keeps losing the picture
const LIGHTER=(()=>{ try{ const q=new URLSearchParams(location.search).get('lite'); if(q==='1'||q==='0')localStorage.setItem('lite-picture',q); return localStorage.getItem('lite-picture')==='1'; }catch(e){ return false; } })(); SHARED.lite=LIGHTER;
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:LIGHTER?'default':'high-performance',alpha:true}); renderer.setClearAlpha(1); renderer.info.autoReset=false;
renderer.setPixelRatio(1); renderer.localClippingEnabled=true; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.enabled=!LIGHTER; renderer.shadowMap.type=THREE.BasicShadowMap;
stage.appendChild(renderer.domElement);
// the picture lost (a phone in the background, a graphics card that gave up): it says so and comes back; lost three times in two minutes, or not back in fifteen seconds, it stops trying and offers a reload, or a reload with the lighter picture
{ let n=0, t0=0, tm=0, up=false; const TXT='THE PICTURE WAS LOST, BRINGING IT BACK';
  const box=()=>{ let d=document.getElementById('ctxlost'); if(!d){ d=document.createElement('div'); d.id='ctxlost'; d.style.cssText='position:fixed;inset:0;place-items:center;place-content:center;gap:14px;text-align:center;padding:20px;font:12px Silkscreen,monospace;letter-spacing:2px;color:#8a8f9c;background:#0e1016;z-index:60'; d.textContent=TXT; document.body.append(d); } return d; };
  const giveUp=()=>{ '@later'; if(up)return; up=true; const d=box(), B='font:12px Silkscreen,monospace;letter-spacing:2px;color:#ece5d3;background:#1b1f2a;border:2px solid #3a3f4e;padding:10px 16px;cursor:pointer';
    d.innerHTML='<div>THE PICTURE KEEPS GETTING LOST</div><div style="max-width:520px;line-height:1.7">CLOSE OTHER TABS AND GAMES THAT DRAW 3D, THEN RELOAD. IF IT GOES ON, RESTART THE BROWSER.</div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button data-r style="'+B+'">RELOAD</button><button data-l style="'+B+'">RELOAD WITH A LIGHTER PICTURE</button></div>'; d.style.display='grid';
    d.querySelector('[data-r]').onclick=()=>location.reload(); d.querySelector('[data-l]').onclick=()=>{ try{ localStorage.setItem('lite-picture','1'); }catch(e){} location.reload(); };
    try{ const g=renderer.getContext(), x=g.getExtension('WEBGL_debug_renderer_info'); if(window.BUGS&&BUGS.err)BUGS.err('the picture kept getting lost ('+n+' times'+(LIGHTER?', lighter picture':'')+'): '+(x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):'?')); }catch(e){} };
  renderer.domElement.addEventListener('webglcontextlost',e=>{ e.preventDefault(); const now=performance.now(); if(now-t0>120000)n=0; if(!n)t0=now; n++; if(!up){ box().style.display='grid'; clearTimeout(tm); if(n>=3)giveUp(); else tm=setTimeout(giveUp,15000); } });
  renderer.domElement.addEventListener('webglcontextrestored',()=>{ clearTimeout(tm); renderer.shadowMap.needsUpdate=true; if(up)return; const d=document.getElementById('ctxlost'); if(d)d.style.display='none'; }); }
const scene=new THREE.Scene();
SHARED.composer=null;
const PPU=30;
let PXS=Math.max(2,Math.round(2*(devicePixelRatio||1)));
let RW=0,RH=0;
SHARED.cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,800); const OCAM=SHARED.cam, PCAM=new THREE.PerspectiveCamera(60,1,.05,1500);
const FRAMEK=(()=>{ const q=+new URLSearchParams(location.search).get('frame'); return q>0&&q<=1?q:.866; })();
function resize(){ const dpr=devicePixelRatio||1, pw=innerWidth*FRAMEK*dpr, ph=innerHeight*FRAMEK*dpr; document.body.style.background=document.documentElement.style.background='#000';
  const S=pxS(); SCL=S; RW=Math.ceil(pw/S/2)*2; RH=Math.ceil(ph/S/2)*2;
  renderer.setSize(RW,RH,false); if(SHARED.composer)SHARED.composer.setSize(RW,RH);
  const c=renderer.domElement, cw=RW*S/dpr, ch=RH*S/dpr; c.style.width=cw+'px'; c.style.height=ch+'px'; c.style.imageRendering=S>1?'pixelated':'';
  c.style.left=Math.floor((innerWidth-cw)/2)+'px'; c.style.top=Math.floor((innerHeight-ch)/2)+'px'; document.documentElement.style.setProperty('--fx',c.style.left); document.documentElement.style.setProperty('--fy',c.style.top); c.style.borderRadius=FRAMEK<1?'18px':'0';
  frustum(); }
let SCL=1; SHARED.ppu=PPU; SHARED.RESI=+(new URLSearchParams(location.search).get('res')??0)>=2?1:0;   // ?res=2 and up is HIGH (the tests' old numbering)
const V0=PPU*PXS, ZMAX=PPU*80;
const RESN=['LOW','HIGH'], RESLN=[360,480];   // the lines the picture is drawn at, LOW the default (owner, 12 Nov 2026); an effect that shows fewer lines draws fewer
const vpu=()=>V0*SHARED.ppu/PPU, art=vpu, pxS=()=>{ const L0=RESLN[SHARED.RESI], L=Math.min(L0,PS2.draw||PS2.cap||L0); const K=SHARED.RESK||1; return L?Math.max(1,Math.round(innerHeight*FRAMEK*(devicePixelRatio||1)/L))+(K<1?1:0):1/K; }, rppu=()=>vpu()/pxS();   // a whole number of the screen's pixels for each of the picture's, so walking never shifts which columns are doubled (6 Nov 2026: "every single pixel is changing when i walk")
function frustum(){ const u=rppu(); let hw=RW/2/u, hh=RH/2/u; const mw=SHARED.camMaxW; if(mw>0&&2*hw>mw){ const k=mw/(2*hw); hw*=k; hh*=k; } SHARED.cam.left=-hw; SHARED.cam.right=hw; SHARED.cam.top=hh; SHARED.cam.bottom=-hh; SHARED.cam.updateProjectionMatrix(); }   // the visible width is capped at SHARED.camMaxW (set by the UI) so zooming all the way out shows the same extent at every resolution
addEventListener('resize',resize); SHARED.resize=resize;

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
export {EffectComposer, frustum, hash3, KITD, OCAM, OutputPass, PCAM, PPU, pxS, Reflector, renderer, RenderPass, resize, RESN, RH, rppu, RW, scene, SCL, ShaderPass, statEl, V0};
