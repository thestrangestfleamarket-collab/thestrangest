// THE PAPER DOLL (owner, 9 Nov 2026: "the avatar screen in game like UO ... comes up when you 2x click yourself"; "if you click on yourself you see all the options you need. if you click on someone else you just see them"; his pick G): yours is you, what you wear and your buttons; another player's is only them and their name.
import {THREE} from './003-shx.js';
import {BAG, CHARP, DOLL, EQUIP, FORAGE, INV, ITEMS, LOOKS, MOTION, PASSPORT, PS2, TEXT, UI, VIT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {pxS, renderer, scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
{ const esc=TEXT.esc, W=CHARP.W||256, H=CHARP.H||384, say=(t,c)=>SAY(t,c||'#c8a090');
  const SL=[['head','HEAD'],['eyes','EYES'],['body','BODY'],['legs','LEGS'],['back','BACK'],['hand','HAND']];
  const css=document.createElement('style'); css.textContent=`
  #doll,#dollo{position:fixed;top:70px;z-index:31;background:rgba(16,18,26,.82);padding:10px 12px;box-sizing:border-box}
  #doll{right:150px;width:470px} #dollo{right:180px;width:300px}
  #doll .dl-hd,#dollo .dl-hd{display:flex;justify-content:space-between;gap:10px;padding:0 30px 8px 0;border-bottom:2px solid #3aa866;margin-bottom:10px}
  #doll .dl-hd i,#dollo .dl-hd i{font-style:normal;color:#3aa866!important}
  #doll .dl-body{display:flex;gap:12px}
  #doll canvas,#dollo canvas{display:block;width:280px;height:420px;cursor:grab;image-rendering:pixelated}
  #doll .dl-pic{border:2px solid #3aa866;background:radial-gradient(ellipse at 50% 92%,#0d3a1f,#020a06 70%)}
  #dollo .dl-pic{border:2px solid #3aa866;border-radius:140px 140px 0 0;overflow:hidden;background:#020a06}
  #dollo canvas{width:272px;height:408px}
  #doll .dl-side{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
  #doll .dl-btns{display:flex;flex-direction:column;gap:5px}
  #doll .dl-btns button{box-shadow:inset 0 0 0 2px #3aa866!important;text-align:center;padding:5px 0!important}
  #doll .dl-bar{margin-top:6px;color:#3aa866!important} #doll .dl-bar i{display:block;height:8px;box-shadow:inset 0 0 0 1px #2d5a40;padding:1px;margin-top:2px} #doll .dl-bar b{display:block;height:100%}
  #doll .dl-pack{margin-top:auto;align-self:flex-end;width:74px;height:74px;box-shadow:inset 0 0 0 2px #3aa866!important;padding:0!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
  #doll .dl-pack span{width:38px;height:34px;background:#5a3a1a;border-radius:9px 9px 3px 3px;box-shadow:inset 0 -6px 0 #3a2410}
  #doll .dl-slots{display:flex;gap:6px;margin-top:10px}
  #doll .dl-slots button{width:56px;height:58px;box-shadow:inset 0 0 0 2px #3aa866!important;padding:2px!important;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;line-height:1}
  #doll .dl-slots button.on{background:#0d3a1f!important}
  #doll .dl-slots img{width:30px;height:30px;image-rendering:pixelated;object-fit:contain}
  #doll .dl-slots small,#doll .dl-pack small{font-size:11px!important;color:#3aa866}
  #doll .dl-pick{margin-top:8px;box-shadow:inset 0 0 0 2px #3aa866;padding:6px;display:flex;flex-wrap:wrap;gap:4px}
  #doll .dl-pick[hidden]{display:none}
  #dollo .dl-plate{margin-top:8px;text-align:center;box-shadow:inset 0 0 0 2px #3aa866;padding:8px}
  #doll.over,#dollo.over{box-shadow:0 0 0 2px #7dffa8!important}`;
  document.head.appendChild(css);
  const win=(id,html)=>{ const el=document.createElement('div'); el.id=id; el.hidden=true; el.className='ml'; el.dataset.ml='1'; el.innerHTML=html+'<button class="mclose" type="button">CLOSE</button>'; document.body.appendChild(el);
    el.querySelector('.mclose').onclick=()=>{ el.hidden=true; }; el.addEventListener('keydown',e=>e.stopPropagation()); return el; };
  const turn=(cv,on)=>{ let dx=null; cv.addEventListener('pointerdown',e=>{ dx=e.clientX; cv.setPointerCapture(e.pointerId); e.stopPropagation(); }); cv.addEventListener('pointermove',e=>{ if(dx==null)return; on((e.clientX-dx)*.025); dx=e.clientX; }); const up=()=>{ dx=null; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); };

  // yours: you as you are (the studio's picture), your slots, your buttons, the backpack
  const M=win('doll',`<div class="dl-hd"><span id="dlnm"></span><i>DRAG TO TURN</i></div>
    <div class="dl-body"><div class="dl-pic"><canvas id="dlcv" width="${W}" height="${H}"></canvas></div>
    <div class="dl-side"><div class="dl-btns" id="dlbtns"></div>
      <div class="dl-bar">HP <span id="dlhpn"></span><i><b id="dlhp" style="background:#7dffa8"></b></i></div><div class="dl-bar">STA <span id="dlstn"></span><i><b id="dlst" style="background:#d8ff7d"></b></i></div>
      <button class="dl-pack" id="dlpack" type="button" title="your bag"><span></span><small>BACKPACK</small></button></div></div>
    <div class="dl-slots" id="dlslots"></div><div class="dl-pick" id="dlpick" hidden></div>`);
  const cv=M.querySelector('#dlcv'), g2=cv.getContext('2d'); let spin=0, pick=null; turn(cv,d=>spin+=d);
  const worn=s=>s==='hand'?WIELD.on||null:EQUIP.by[s]||null;
  const fits=s=>s==='hand'?(WIELD.LIST||[]).filter(id=>FORAGE.has(id)):Object.keys(INV.items||{}).filter(id=>ITEMS.prop&&ITEMS.prop(id,'slot')===s);
  const put=(s,id)=>{ if(s==='hand')WIELD.set(id); else if(id)EQUIP.wear(id); else EQUIP.off(s); pick=null; draw(); };
  const BT=[['WEAR',()=>DOLL.looks('wear')],['WORDS',()=>DOLL.looks('words')],['SKILLS',()=>UI.menuTab('pack','skills')],['JOURNAL',()=>UI.menuTab('pack','journal')],['EMOTES',()=>MOTION.toggle&&MOTION.toggle()],['PASSPORT',()=>PASSPORT.open&&PASSPORT.open()],['RESURRECT',()=>{ if(VIT.revive)VIT.revive(); },()=>VIT.dead],['LOG OUT',()=>CHARP.logout&&CHARP.logout()]];
  const bars=()=>{ for(const k of ['hp','st']){ const i=document.getElementById('v'+k), n=document.getElementById('v'+k+'n'); M.querySelector('#dl'+k).style.width=i?i.style.width||'100%':'100%'; M.querySelector('#dl'+k+'n').textContent=n?n.textContent:''; } };
  const draw=()=>{ M.querySelector('#dlnm').textContent=(LOOKS.L&&LOOKS.L.name||'TENANT').toUpperCase();
    M.querySelector('#dlbtns').innerHTML=BT.map((b,i)=>b[2]&&!b[2]()?'':`<button type="button" data-b="${i}">${b[0]}</button>`).join('');
    M.querySelector('#dlslots').innerHTML=SL.map(([s,n])=>{ const id=worn(s); return `<button type="button" data-s="${s}" class="${id?'on':''}" title="${id?esc(FORAGE.name(id))+' · click to take off':'click to put something on'}">${id?`<img src="${BAG.icon?BAG.icon(id):''}" alt="">`:''}<small>${n}</small></button>`; }).join('');
    const P=M.querySelector('#dlpick'); if(!pick){ P.hidden=true; } else { const L=fits(pick); P.hidden=false; P.innerHTML=L.length?L.map(id=>`<button type="button" data-w="${esc(id)}">${esc(FORAGE.name(id))}</button>`).join(''):`<span>NOTHING YOU CARRY GOES ON YOUR ${SL.find(x=>x[0]===pick)[1]}.</span>`; }
    bars(); };
  M.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const d=b.dataset;
    if(d.b)BT[+d.b][1]();
    else if(d.s){ if(worn(d.s))put(d.s,null); else { pick=pick===d.s?null:d.s; draw(); } }
    else if(d.w)put(pick,d.w);
    else if(b.id==='dlpack'&&BAG.toggle)BAG.toggle(true); });

  // another player: only them, as they stand in the street (their own light), their name and title
  const O=win('dollo',`<div class="dl-hd"><span id="donm"></span></div><div class="dl-pic"><canvas id="docv" width="${W}" height="${H}"></canvas></div><div class="dl-plate" id="dott"></div>`);
  const ocv=O.querySelector('#docv'), og=ocv.getContext('2d'); let who=null, ospin=0; turn(ocv,d=>ospin+=d);
  let rt=null, cam=null; const B3=new THREE.Box3(), C=new THREE.Vector3(), S=new THREE.Vector3(), CC=new THREE.Color();
  const see=()=>{ const o=who, f=o&&o.fig; if(!f||!f.th||!f.th.obj){ O.hidden=true; who=null; return; }
    if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,100); }
    B3.setFromObject(f.th.obj); B3.getCenter(C); B3.getSize(S); const hh=S.y*1.14, ww=hh*W/H, dp=Math.max(S.x,S.z), d=S.y*3, a=f.g.rotation.y+ospin;
    cam.left=-ww/2; cam.right=ww/2; cam.top=hh/2; cam.bottom=-hh/2; cam.near=d-dp*2; cam.far=d+dp*2; cam.updateProjectionMatrix();
    cam.position.set(C.x+Math.sin(a)*d,C.y,C.z+Math.cos(a)*d); cam.up.set(0,1,0); cam.lookAt(C); cam.updateMatrixWorld(true);
    const bg=scene.background, fog=scene.fog, off=scene.children.filter(c=>c.visible&&c!==f.g&&!c.isLight); scene.background=null; scene.fog=null; for(const c of off)c.visible=false; renderer.getClearColor(CC); const ca=renderer.getClearAlpha();   // only them, in the street's own light
    renderer.setRenderTarget(rt); renderer.setClearColor(0x020a06,1); renderer.clear(); renderer.render(scene,cam); renderer.setRenderTarget(null); renderer.setClearColor(CC,ca); scene.background=bg; scene.fog=fog; for(const c of off)c.visible=true;
    const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px); PS2.page(px,W,H,ocv.getBoundingClientRect().height||400,pxS());
    const im=og.createImageData(W,H); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); og.putImageData(im,0,0); };

  let last=0, lastUi=0;
  SYS.add('win',t=>{ if(M.hidden&&O.hidden)return; if(t-last<80)return; last=t;
    if(!M.hidden&&CHARP.draw)CHARP.draw(cv,g2,spin); if(!O.hidden)see();
    if(!M.hidden&&t-lastUi>500){ lastUi=t; if(!pick)draw(); else bars(); } },'162ea-doll');

  const front=el=>{ for(const x of [M,O])x.style.zIndex=x===el?32:31; };
  Object.assign(DOLL,{
    me:()=>{ if(!M.hidden){ M.hidden=true; return; } spin=0; pick=null; draw(); M.hidden=false; front(M); },
    see:o=>{ if(!o||!o.fig)return; who=o; ospin=0; O.querySelector('#donm').textContent=(o.name||'TENANT').toUpperCase(); O.querySelector('#dott').textContent=(o.name||'TENANT')+(o.x&&o.x.title?' the '+o.x.title:''); O.hidden=false; front(O); see(); },
    who:()=>who,
    // the YOU window without its LOOK (the look is set on the first day; ADMIN's AVATAR changes it after): WEAR and WORDS; the barber's chair opens all of it
    looks:t=>{ LOOKS.only=t==='look'?null:new Set(['wear','words']); LOOKS.open(); LOOKS.tab(t); },
    // something dragged out of the bag onto your doll is put on, if it is worn or held
    drop:id=>{ const s=ITEMS.prop&&ITEMS.prop(id,'slot'); if(s&&s!=='hand'&&SL.some(x=>x[0]===s)){ EQUIP.wear(id); draw(); return true; } if((WIELD.LIST||[]).includes(id)){ WIELD.set(id); draw(); return true; } say('THE '+FORAGE.name(id)+' IS NOT SOMETHING YOU WEAR.'); return true; } });
  window.DOLL=DOLL; }
