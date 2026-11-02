// THE NEWSREEL: a living camera (his kind see through lenses grown from their heads, so he is allowed: no static cameras at the market) who walks Central Park and Market St taking real photographs — the world drawn from his lens as it is that moment — and sells them; bought, a photo is yours to frame in your apartment (150g).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, NPCS, pos, ROOMS, UI, ZONES} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const PHOTOS={stock:[],mine:[],price:10,sitting:15}; window.PHOTOS=PHOTOS;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc');
  try{ PHOTOS.mine=JSON.parse(OWNED.get('photos')||'[]')||[]; }catch(e){ PHOTOS.mine=[]; }
  const nameOf=p=>'PHOTO: '+p.cap; const reg=()=>FORAGE.add({names:Object.fromEntries(PHOTOS.mine.map(p=>[p.id,nameOf(p)]))}); reg();
  PHOTOS.save=()=>{ try{ OWNED.set('photos',JSON.stringify(PHOTOS.mine.slice(-40))); }catch(e){} };

  /* ---------- his body: a pitted white body like coral, ribbed tendrils, thick jointed arms; red knobbly antennae fanned over a blue-grey camera head with three black lenses; the big zoom lens in his hands ---------- */
  const COR='plain:#e6e1d6', CORD='plain:#c9c2b2', CAM='plastic:#5e7a8a', CAMD='plastic:#3a4c58', LENS='glass:#0c0c0e', RED='skin:#b24a3c';
  const model=()=>{ const sk=MERCH.skel({hipY:.78,neck:.46,shX:.2,shY:.36,upper:.26,fore:.24,thigh:.36,shin:.36,hipX:.1}), {B}=sk;
    mk(B.torso,drape(LATHE([[.17,-.08],[.21,.06],[.23,.2],[.22,.32],[.17,.4],[.1,.45]],28,.85),.012),COR);
    for(let i=0;i<14;i++){ const a=(i/14)*Math.PI*1.4-.7+Math.PI, x=Math.sin(a)*.2, z=Math.cos(a)*.17; const g=grp(B.torso,[x,.38,z]); for(let k=0;k<9;k++)mk(g,new THREE.TorusGeometry(.026-k*.0012,.011,8,16),k%2?CORD:COR,[0,-k*.045,0],[Math.PI/2,0,0]); }
    for(let i=0;i<20;i++)mk(B.torso,SPH(.008,8,6),'plain:#9a9282',[Math.sin(i*2.1)*.2,.05+((i*37)%30)/100,Math.cos(i*2.1)*.17+.01]);
    mk(B.hips,LATHE([[.19,.02],[.2,-.1],[.17,-.2],[.1,-.24]],24,.85),COR);
    const H=grp(B.head,[0,.15,.02]); mk(H,new THREE.BoxGeometry(.26,.24,.22,4,4,4),CAM,[0,0,0]); mk(H,SPH(.14,28,14,0,Math.PI*2,0,Math.PI/2),'plain:#e2e0da',[0,.1,-.01],[0,0,0],[1,.55,.85]);
    for(const [x,y,r] of [[-.06,.03,.05],[.06,.03,.05]]){ mk(H,new THREE.CylinderGeometry(r,r,.06,24),CAMD,[x,y,.13],[Math.PI/2,0,0]); mk(H,SPH(r*.85,20,12),LENS,[x,y,.16],[0,0,0],[1,1,.4]); }
    mk(H,new THREE.CylinderGeometry(.045,.045,.07,24),CAMD,[.15,.02,.02],[0,0,Math.PI/2]); mk(H,SPH(.038,18,12),LENS,[.19,.02,.02],[0,0,0],[.4,1,1]);
    for(let i=0;i<5;i++)mk(H,new THREE.BoxGeometry(.012,.07,.005),CAMD,[-.04+i*.02,-.07,.111]);
    for(let i=0;i<5;i++){ const a=(i-2)*.5, g=grp(H,[Math.sin(a)*.09,.15,-.02+Math.cos(a)*.03],[ -.2,0,-a*.9]); let p=g; for(let k=0;k<7;k++){ const q=grp(p,[0,.045,0],[.06,0,-a*.08]); mk(q,new THREE.CapsuleGeometry(.017-k*.0014,.03,6,12),RED,[0,0,0]); p=q; } }
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],new THREE.CylinderGeometry(.065,.06,.26,20),COR,[0,-.12,0]); mk(B['upperArm'+n],SPH(.075,18,12),COR); for(let i=0;i<3;i++)mk(B['forearm'+n],new THREE.TorusGeometry(.058,.012,8,20),CORD,[0,-.03-i*.02,0],[Math.PI/2,0,0]);
      mk(B['forearm'+n],new THREE.CylinderGeometry(.058,.05,.24,20),COR,[0,-.12,0]); const h=grp(B['hand'+n]); h.rotation.y=-s*Math.PI/2; mk(h,SPH(.05,16,12),COR,[0,-.04,0],[1.1,1,.8]);
      for(let i=0;i<3;i++){ const f=grp(h,[-.025+i*.025,-.08,.01],[-.6,0,0]); mk(f,new THREE.CapsuleGeometry(.014,.04,4,10),COR,[0,-.025,0]); }
      mk(B['thigh'+n],new THREE.CylinderGeometry(.08,.07,.36,20),COR,[0,-.17,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.068,.06,.36,20),COR,[0,-.17,0]); mk(B['shoe'+n],SPH(.07,18,12),COR,[0,-.05,.04],[0,0,0],[1,.6,1.4]); }
    return sk; };
  const LENSG={g:null}, V=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0);
  const lensMesh=()=>{ const G=new THREE.Group(), m=new THREE.MeshStandardMaterial({color:0x141416,roughness:.4}), r=new THREE.MeshStandardMaterial({color:0x2a2a2e,roughness:.7});
    const b=new THREE.Mesh(new THREE.CylinderGeometry(.075,.06,.26,24),m); b.rotation.x=Math.PI/2; b.position.z=.13; G.add(b); for(let i=0;i<3;i++){ const q=new THREE.Mesh(new THREE.TorusGeometry(.074,.008,8,24),r); q.position.z=.05+i*.07; G.add(q); }
    const gl=new THREE.Mesh(new THREE.CircleGeometry(.06,24),new THREE.MeshStandardMaterial({color:0x10141a,metalness:.4,roughness:.05})); gl.position.z=.262; G.add(gl); return G; };
  let snapT=0;
  MERCH.add({key:'newsreel',label:'THE NEWSREEL',height:1.62,model,size:9,
    idle:t=>{ const up=snapT>0; return MERCH.pose({nod:up?-4:6+Math.sin(t*.8)*5,yaw:Math.sin(t*.4)*14,L:{ua:[up?80:44,-18],fa:[up?70:80,-30]},R:{ua:[up?78:40,-22],fa:[up?66:84,-28]}}); },
    after:(B,N)=>{ if(!LENSG.g){ LENSG.g=lensMesh(); N.g.parent.add(LENSG.g); } const G=LENSG.g; G.visible=N.g.visible; N.g.updateMatrixWorld(); MERCH.at(N,'handR',[0,-.06,.03],V); G.position.copy(V); G.quaternion.setFromAxisAngle(UP,N.st.hd); if(snapT<=0)G.rotateX(.5); G.scale.setScalar(T); }});

  /* ---------- a photograph: the world from his lens, small, warm, grained; kept as a picture you can buy ---------- */
  let rt=null, cam=null, buf=null; const W=192, H=144;
  PHOTOS.take=(x,y,z,hd,pitch=-.12,cap)=>{ if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); cam=new THREE.PerspectiveCamera(48,W/H,.05,400); buf=new Uint8Array(W*H*4); }
    cam.position.set(x+Math.sin(hd)*.45*T,y,z+Math.cos(hd)*.45*T); cam.rotation.set(pitch,hd+Math.PI,0,'YXZ'); cam.updateMatrixWorld(); const prev=renderer.getRenderTarget(), pc=renderer.localClippingEnabled, ps=renderer.shadowMap.autoUpdate, keep=LENSG.g&&LENSG.g.visible;
    if(LENSG.g)LENSG.g.visible=false; const me=NPCS.extra.find(q=>q.key==='newsreel'), mv=me&&me.g.visible; if(me)me.g.visible=false;
    try{ renderer.localClippingEnabled=false; renderer.shadowMap.autoUpdate=false; renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene,cam); renderer.readRenderTargetPixels(rt,0,0,W,H,buf); }
    finally{ renderer.setRenderTarget(prev); renderer.localClippingEnabled=pc; renderer.shadowMap.autoUpdate=ps; if(LENSG.g)LENSG.g.visible=keep; if(me)me.g.visible=mv; }
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), im=g.createImageData(W,H); let lum=0;
    for(let i=0;i<W*H;i++)lum+=buf[i*4]+buf[i*4+1]+buf[i*4+2]; const gain=Math.max(1,Math.min(1.7,95/(lum/(W*H*3)+1)));
    for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){ const s=((H-1-yy)*W+xx)*4, d=(yy*W+xx)*4, vx=(xx/W-.5), vy=(yy/H-.5), vig=1-(vx*vx+vy*vy)*1.1, n=(Math.random()-.5)*16;
      const r=Math.pow(buf[s]/255,1/2.2)*255*gain, gg=Math.pow(buf[s+1]/255,1/2.2)*255*gain, b=Math.pow(buf[s+2]/255,1/2.2)*255*gain;
      im.data[d]=Math.min(255,(r*1.06+12)*vig+n); im.data[d+1]=Math.min(255,(gg*1.0+6)*vig+n); im.data[d+2]=Math.min(255,(b*.86)*vig+n); im.data[d+3]=255; }
    g.putImageData(im,0,0); const where=cap||((()=>{ try{ return ZONES.at(x,z,'up').name; }catch(e){ return 'THE MARKET'; } })()||'THE MARKET'), time=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}).toUpperCase();
    return {id:'photo_'+Date.now().toString(36)+Math.floor(Math.random()*1e3),cap:String(where).toUpperCase().slice(0,24)+' · '+time,src:cv.toDataURL('image/jpeg',.82)}; };
  // he stops and shoots now and then while you are near enough to see; up to six on offer, the newest first
  let waitT=8;
  SYS.add('life',dt=>{ const N=NPCS.extra.find(q=>q.key==='newsreel'); if(!N||!N.on)return; if(snapT>0)snapT-=dt||0;
    const near=!ROOMS.cur&&SHARED.LVL==='up'&&Math.hypot(pos.x-N.st.x,pos.z-N.st.z)<24*T; if(!near||N.st.to)return; if((waitT-=dt||0)>0)return; waitT=35+Math.random()*30; snapT=1.4;
    setTimeout(()=>{ try{ const p=PHOTOS.take(N.st.x,(N.st.y||0)+1.35*T,N.st.z,N.st.hd); PHOTOS.stock.unshift(p); PHOTOS.stock.length=Math.min(6,PHOTOS.stock.length); if(PANEL&&!PANEL.hidden)draw(); }catch(e){ console.warn('photo',e); } },600); },'146m-newsreel');

  /* ---------- what a double-click on him gives: his photos to buy, or one of you ---------- */
  const PANEL=document.createElement('div'); PANEL.hidden=true; PANEL.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(560px,94vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(PANEL); PANEL.addEventListener('keydown',e=>{ if(e.key==='Escape')PANEL.hidden=true; e.stopPropagation(); }); PANEL.addEventListener('keyup',e=>e.stopPropagation());
  const Bt='style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer"';
  const draw=()=>{ PANEL.innerHTML=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE NEWSREEL</h3><div style="color:#9b9584;margin-bottom:8px">"HOLD IT. Okay. You want a print? Real light, real place, real now."</div><div style="margin-bottom:8px">YOU HAVE $${Math.round(INV.cash||0)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${PHOTOS.stock.map((p,i)=>`<div style="width:164px"><img src="${p.src}" style="width:160px;border:2px solid #e8e0cc;image-rendering:auto"><div style="color:#9b9584;margin:2px 0">${p.cap}</div><button ${Bt} data-buy="${i}">BUY $${PHOTOS.price}</button></div>`).join('')||'<div style="color:#9b9584">NOTHING YET. HE IS WAITING FOR THE LIGHT.</div>'}</div>
      <div style="margin-top:10px"><button ${Bt} data-me>A PHOTO OF YOU $${PHOTOS.sitting}</button> <button ${Bt} data-x>CLOSE</button></div>`; };
  const own=p=>{ PHOTOS.mine.push(p); PHOTOS.save(); reg(); FORAGE.give(p.id,1); if(FORAGE.draw)FORAGE.draw(); if(PHOTOS.onBuy)PHOTOS.onBuy(p); };
  PANEL.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.x!==undefined){ PANEL.hidden=true; return; }
    if(b.dataset.buy){ const p=PHOTOS.stock[+b.dataset.buy]; if(!p)return; if((INV.cash||0)<PHOTOS.price)return say('YOU CANNOT AFFORD THAT.','#c8a090'); INV.cash-=PHOTOS.price; PHOTOS.stock.splice(+b.dataset.buy,1); own(p); say('A PRINT, STILL WARM. FRAME IT AT HOME (DECORATE).','#e8e2cc'); draw(); return; }
    if(b.dataset.me!==undefined){ const N=NPCS.extra.find(q=>q.key==='newsreel'); if(!N)return; if((INV.cash||0)<PHOTOS.sitting)return say('YOU CANNOT AFFORD THAT.','#c8a090'); INV.cash-=PHOTOS.sitting;
      const hd=Math.atan2(pos.x-N.st.x,pos.z-N.st.z); N.st.hd=hd; snapT=1.4; setTimeout(()=>{ const p=PHOTOS.take(N.st.x,(N.st.y||0)+1.3*T,N.st.z,hd,-.18,'YOU'); own(p); say('CLICK. "DON\'T BLINK. TOO LATE."','#e8e2cc'); draw(); },700); } });
  { NPCS.when('newsreel',N=>{
      const hb=new THREE.Mesh(new THREE.BoxGeometry(28,56,28),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=28; N.g.add(hb); UI.thing({name:'THE NEWSREEL',npc:N,obj:hb,reach:2.2*T,near:3*T,tall:1.8*T,act:()=>{ PANEL.hidden=false; draw(); }}); }); }
  window.PHOTODBG=()=>({stock:PHOTOS.stock.map(p=>p.cap),mine:PHOTOS.mine.length,size:PHOTOS.stock[0]&&PHOTOS.stock[0].src.length});
}
export {PHOTOS};
