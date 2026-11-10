// YOUR PRINTS: the photographs you own (your camera, 146ma), kept in your owned things; each a framed print for your apartment (150g). The store the Newsreel used, kept when he was archived (5 Nov 2026).
import {THREE} from './003-shx.js';
import {FORAGE, ITEMS, ZONES} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {TILE} from './006-map-pre.js';
const PHOTOS={mine:[]}; window.PHOTOS=PHOTOS;
{ const T=TILE;
  try{ PHOTOS.mine=JSON.parse(OWNED.get('photos')||'[]')||[]; }catch(e){ PHOTOS.mine=[]; }
  const nameOf=p=>'PHOTO: '+p.cap; const reg=()=>FORAGE.add({names:Object.fromEntries(PHOTOS.mine.map(p=>[p.id,nameOf(p)]))}); reg();
  ITEMS.reg('photo',{sellable:true}); FORAGE.NM.photo='A PHOTOGRAPH'; ITEMS.cls.push({is:id=>id.startsWith('photo_'),as:'photo',calc:{value:id=>{ const p=PHOTOS.mine.find(p=>p.id===id); return p&&p.v||1; }}});
  PHOTOS.save=()=>{ try{ OWNED.set('photos',JSON.stringify(PHOTOS.mine.slice(-40))); }catch(e){} };
  // a photograph of the world: o.from (a camera), fov, W/H, gain (exposure), fx(g,cv) (blur after developing)
  const RTS={}; let cam=null;
  PHOTOS.take=(x,y,z,hd,pitch=-.12,cap,o)=>{ '@later'; o=o||{}; const W=o.W||192, H=o.H||144, k=W+'x'+H, R=RTS[k]||(RTS[k]={rt:new THREE.WebGLRenderTarget(W,H),buf:new Uint8Array(W*H*4)}), rt=R.rt, buf=R.buf; if(!cam)cam=new THREE.PerspectiveCamera(48,4/3,.05,400);
    cam.fov=o.fov||48; cam.aspect=W/H; cam.updateProjectionMatrix();
    if(o.from){ cam.position.copy(o.from.position); cam.quaternion.copy(o.from.quaternion); } else { cam.position.set(x+Math.sin(hd)*.45*T,y,z+Math.cos(hd)*.45*T); cam.rotation.set(pitch,hd+Math.PI,0,'YXZ'); } cam.updateMatrixWorld(); const prev=renderer.getRenderTarget(), pc=renderer.localClippingEnabled, ps=renderer.shadowMap.autoUpdate;
    try{ renderer.localClippingEnabled=false; renderer.shadowMap.autoUpdate=false; renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene,cam); renderer.readRenderTargetPixels(rt,0,0,W,H,buf); }
    finally{ renderer.setRenderTarget(prev); renderer.localClippingEnabled=pc; renderer.shadowMap.autoUpdate=ps; }
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), im=g.createImageData(W,H); let lum=0;
    for(let i=0;i<W*H;i++)lum+=buf[i*4]+buf[i*4+1]+buf[i*4+2]; const gain=o.gain!=null?o.gain:Math.max(1,Math.min(1.7,95/(lum/(W*H*3)+1)));
    for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){ const s=((H-1-yy)*W+xx)*4, d=(yy*W+xx)*4, vx=(xx/W-.5), vy=(yy/H-.5), vig=1-(vx*vx+vy*vy)*1.1, n=(Math.random()-.5)*16;
      const r=Math.pow(buf[s]/255,1/2.2)*255*gain, gg=Math.pow(buf[s+1]/255,1/2.2)*255*gain, b=Math.pow(buf[s+2]/255,1/2.2)*255*gain;
      im.data[d]=Math.min(255,(r*1.06+12)*vig+n); im.data[d+1]=Math.min(255,(gg*1.0+6)*vig+n); im.data[d+2]=Math.min(255,(b*.86)*vig+n); im.data[d+3]=255; }
    g.putImageData(im,0,0); if(o.fx)o.fx(g,cv); const where=cap||((()=>{ try{ return ZONES.at(x,z,'up').name; }catch(e){ return 'THE MARKET'; } })()||'THE MARKET'), time=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}).toUpperCase();
    return {id:'photo_'+Date.now().toString(36)+Math.floor(Math.random()*1e3),cap:String(where).toUpperCase().slice(0,24)+' · '+time,src:cv.toDataURL('image/jpeg',.82)}; };
  PHOTOS.own=p=>{ PHOTOS.mine.push(p); PHOTOS.save(); reg(); FORAGE.give(p.id,1); if(FORAGE.draw)FORAGE.draw(); if(PHOTOS.onBuy)PHOTOS.onBuy(p); };
}
export {PHOTOS};
