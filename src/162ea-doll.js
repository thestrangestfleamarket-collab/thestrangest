// THE PAPER DOLL (owner, 9 Nov 2026: "the avatar screen in game like UO ... comes up when you 2x click yourself"; "if you click on yourself you see all the options you need. if you click on someone else you just see them"; his pick G): yours is you, what you wear and your buttons; another player's the same, with their own buttons ("this should look exactly like your own just dont have the same buttons - add MESSAGE, TRADE, etc.").
import {THREE} from './003-shx.js';
import {BAG, CHARP, DOLL, EQUIP, FORAGE, INV, ITEMS, LOOKS, MOTION, ONLINE, PASSPORT, PS2, TEXT, UI, VIT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {pxS, renderer, scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {SWAP} from './159i-trade.js';
{ const esc=TEXT.esc, W=CHARP.W||256, H=CHARP.H||384, say=(t,c)=>SAY(t,c||'#c8a090');
  const SL=[['head','HEAD'],['eyes','EYES'],['body','BODY'],['legs','LEGS'],['back','BACK'],['hand','HAND']];
  const css=document.createElement('style'); css.textContent=`
  .doll{position:fixed;top:70px;right:150px;z-index:31;width:470px;background:rgba(16,18,26,.82);padding:10px 12px;box-sizing:border-box}
  #dollo{right:190px;top:90px}
  .doll .dl-hd{display:flex;justify-content:space-between;gap:10px;padding:0 30px 8px 0;border-bottom:2px solid #3aa866;margin-bottom:10px}
  .doll .dl-hd i{font-style:normal;color:#3aa866!important}
  .doll .dl-body{display:flex;gap:12px}
  .doll canvas{display:block;width:280px;height:420px;cursor:grab;image-rendering:pixelated}
  .doll .dl-pic{border:2px solid #3aa866;background:radial-gradient(ellipse at 50% 92%,#0d3a1f,#020a06 70%)}
  .doll .dl-side{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
  .doll .dl-btns{display:flex;flex-direction:column;gap:5px}
  .doll .dl-btns button{box-shadow:inset 0 0 0 2px #3aa866!important;text-align:center;padding:5px 0!important}
  .doll .dl-bar{margin-top:6px;color:#3aa866!important} .doll .dl-bar i{display:block;height:8px;box-shadow:inset 0 0 0 1px #2d5a40;padding:1px;margin-top:2px} .doll .dl-bar b{display:block;height:100%}
  .doll .dl-pack{margin-top:auto;align-self:flex-end;width:74px;height:74px;box-shadow:inset 0 0 0 2px #3aa866!important;padding:0!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
  .doll .dl-pack span{width:38px;height:34px;background:#5a3a1a;border-radius:9px 9px 3px 3px;box-shadow:inset 0 -6px 0 #3a2410}
  .doll .dl-slots{display:flex;gap:6px;margin-top:10px}
  .doll .dl-slots button{width:56px;height:58px;box-shadow:inset 0 0 0 2px #3aa866!important;padding:2px!important;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;line-height:1}
  .doll .dl-slots button.on{background:#0d3a1f!important} #dollo .dl-slots button{cursor:default}
  .doll .dl-slots img{width:30px;height:30px;image-rendering:pixelated;object-fit:contain}
  .doll .dl-slots small,.doll .dl-pack small{font-size:11px!important;color:#3aa866}
  .doll .dl-pick{margin-top:8px;box-shadow:inset 0 0 0 2px #3aa866;padding:6px;display:flex;flex-wrap:wrap;gap:4px}
  .doll .dl-pick[hidden]{display:none} .doll .dl-pick input{flex:1;min-width:0;padding:3px 6px}`;
  document.head.appendChild(css);
  // one doll for both: your own and another player's are the same window, each with its own buttons
  const win=(id,pack)=>{ const el=document.createElement('div'); el.id=id; el.hidden=true; el.className='doll ml'; el.dataset.ml='1';
    el.innerHTML=`<div class="dl-hd"><span class="dl-nm"></span><i>DRAG TO TURN</i></div>
    <div class="dl-body"><div class="dl-pic"><canvas width="${W}" height="${H}"></canvas></div>
    <div class="dl-side"><div class="dl-btns"></div><div class="dl-bars"></div>${pack?'<button class="dl-pack" type="button" title="your bag"><span></span><small>BACKPACK</small></button>':''}</div></div>
    <div class="dl-slots"></div><div class="dl-pick" hidden></div><button class="mclose" type="button">CLOSE</button>`;
    document.body.appendChild(el); el.querySelector('.mclose').onclick=()=>{ el.hidden=true; }; el.addEventListener('keydown',e=>e.stopPropagation());
    const cv=el.querySelector('canvas'), d={el,cv,g:cv.getContext('2d'),spin:0,q:s=>el.querySelector(s)};
    let dx=null; cv.addEventListener('pointerdown',e=>{ dx=e.clientX; cv.setPointerCapture(e.pointerId); e.stopPropagation(); }); cv.addEventListener('pointermove',e=>{ if(dx==null)return; d.spin+=(e.clientX-dx)*.025; dx=e.clientX; }); const up=()=>{ dx=null; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    return d; };
  const btns=B=>B.map((b,i)=>b[2]&&!b[2]()?'':`<button type="button" data-b="${i}">${b[0]}</button>`).join('');
  const bar=(n,w,c,t)=>`<div class="dl-bar">${n} <span>${t}</span><i><b style="width:${w};background:${c}"></b></i></div>`;
  const slots=(by,click)=>SL.map(([s,n])=>{ const id=by[s]; return `<button type="button" data-s="${s}" class="${id?'on':''}" title="${id?esc(FORAGE.name(id))+(click?' · click to take off':''):click?'click to put something on':''}">${id?`<img src="${BAG.icon?BAG.icon(id):''}" alt="">`:''}<small>${n}</small></button>`; }).join('');

  // yours: you as you are (the studio's picture), your slots, your buttons, the backpack
  const A=win('doll',true); let pick=null;
  const worn=s=>s==='hand'?WIELD.on||null:EQUIP.by[s]||null;
  const fits=s=>s==='hand'?(WIELD.LIST||[]).filter(id=>FORAGE.has(id)):Object.keys(INV.items||{}).filter(id=>ITEMS.prop&&ITEMS.prop(id,'slot')===s);
  const put=(s,id)=>{ if(s==='hand')WIELD.set(id); else if(id)EQUIP.wear(id); else EQUIP.off(s); pick=null; draw(); };
  const BT=[['WEAR',()=>DOLL.looks('wear')],['WORDS',()=>DOLL.looks('words')],['SKILLS',()=>UI.menuTab('pack','skills')],['JOURNAL',()=>UI.menuTab('pack','journal')],['EMOTES',()=>MOTION.toggle&&MOTION.toggle()],['PASSPORT',()=>PASSPORT.open&&PASSPORT.open()],['RESURRECT',()=>{ if(VIT.revive)VIT.revive(); },()=>VIT.dead],['LOG OUT',()=>CHARP.logout&&CHARP.logout()]];
  const hud=k=>{ const i=document.getElementById('v'+k), n=document.getElementById('v'+k+'n'); return [i&&i.style.width||'100%',n?n.textContent:'']; };
  const bars=()=>{ const h=hud('hp'), t=hud('st'); A.q('.dl-bars').innerHTML=bar('HP',h[0],'#7dffa8',h[1])+bar('STA',t[0],'#d8ff7d',t[1]); };
  const draw=()=>{ A.q('.dl-nm').textContent=(LOOKS.L&&LOOKS.L.name||'TENANT').toUpperCase(); A.q('.dl-btns').innerHTML=btns(BT);
    A.q('.dl-slots').innerHTML=slots(Object.fromEntries(SL.map(([s])=>[s,worn(s)])),true);
    const P=A.q('.dl-pick'); if(!pick){ P.hidden=true; } else { const L=fits(pick); P.hidden=false; P.innerHTML=L.length?L.map(id=>`<button type="button" data-w="${esc(id)}">${esc(FORAGE.name(id))}</button>`).join(''):`<span>NOTHING YOU CARRY GOES ON YOUR ${SL.find(x=>x[0]===pick)[1]}.</span>`; }
    bars(); };
  A.el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const d=b.dataset;
    if(d.b)BT[+d.b][1]();
    else if(d.s){ if(worn(d.s))put(d.s,null); else { pick=pick===d.s?null:d.s; draw(); } }
    else if(d.w)put(pick,d.w);
    else if(b.classList.contains('dl-pack')&&BAG.toggle)BAG.toggle(true); });

  // another player: the same doll, them alone in the street's own light, what they wear, their health; MESSAGE, TRADE, VISIT
  const O=win('dollo',false); let who=null, msg=false;
  const OB=[['MESSAGE',()=>{ msg=!msg; drawO(); if(msg)setTimeout(()=>{ const i=O.q('.dl-pick input'); if(i)i.focus(); },0); }],['TRADE',()=>SWAP.ask&&SWAP.ask(who)],['VISIT',()=>{ if(ONLINE.visit)ONLINE.visit(who.id,who.name); },()=>ONLINE.visit&&!(who.x&&who.x.noapt)]];
  const send=()=>{ const i=O.q('.dl-pick input'), t=i&&i.value.trim(); if(!t)return; if(ONLINE.pm&&ONLINE.pm(who,t)){ i.value=''; msg=false; drawO(); } };
  const drawO=()=>{ const o=who; if(!o)return; O.q('.dl-nm').textContent=(o.name||'TENANT').toUpperCase()+(o.x&&o.x.title?' the '+String(o.x.title).toUpperCase():'');
    O.q('.dl-btns').innerHTML=btns(OB); const hp=o.dead?0:o.hp==null?1:o.hp; O.q('.dl-bars').innerHTML=bar('HP',Math.round(hp*100)+'%','#7dffa8',o.dead?'GHOST':Math.round(hp*100)+'%');
    O.q('.dl-slots').innerHTML=slots(EQUIP.decode?EQUIP.decode(String(o.key||o.look||'').split('.')[3]):{},false);
    const P=O.q('.dl-pick'); P.hidden=!msg; if(msg&&!P.querySelector('input'))P.innerHTML=`<input type="text" maxlength="200" placeholder="a message to ${esc(o.name||'them')}"><button type="button" data-send="1">SEND</button>`; if(!msg)P.innerHTML=''; };
  O.el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.b)OB[+b.dataset.b][1](); else if(b.dataset.send)send(); });
  O.el.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.tagName==='INPUT')send(); });
  let rt=null, cam=null; const B3=new THREE.Box3(), C=new THREE.Vector3(), S=new THREE.Vector3(), CC=new THREE.Color();
  const see=()=>{ const o=who, f=o&&o.fig; if(!f||!f.th||!f.th.obj){ O.el.hidden=true; who=null; return; }
    if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,100); }
    B3.setFromObject(f.th.obj); B3.getCenter(C); B3.getSize(S); const hh=S.y*1.14, ww=hh*W/H, dp=Math.max(S.x,S.z), d=S.y*3, a=f.g.rotation.y+O.spin;
    cam.left=-ww/2; cam.right=ww/2; cam.top=hh/2; cam.bottom=-hh/2; cam.near=d-dp*2; cam.far=d+dp*2; cam.updateProjectionMatrix();
    cam.position.set(C.x+Math.sin(a)*d,C.y,C.z+Math.cos(a)*d); cam.up.set(0,1,0); cam.lookAt(C); cam.updateMatrixWorld(true);
    const bg=scene.background, fog=scene.fog, off=scene.children.filter(c=>c.visible&&c!==f.g&&!c.isLight); scene.background=null; scene.fog=null; for(const c of off)c.visible=false; renderer.getClearColor(CC); const ca=renderer.getClearAlpha();   // only them, in the street's own light
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000,0); renderer.clear(); renderer.render(scene,cam); renderer.setRenderTarget(null); renderer.setClearColor(CC,ca); scene.background=bg; scene.fog=fog; for(const c of off)c.visible=true;
    const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px); PS2.page(px,W,H,O.cv.getBoundingClientRect().height||420,pxS());
    const im=O.g.createImageData(W,H); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); O.g.putImageData(im,0,0); };

  let last=0, lastUi=0;
  SYS.add('win',t=>{ if(A.el.hidden&&O.el.hidden)return; if(t-last<80)return; last=t;
    if(!A.el.hidden&&CHARP.draw)CHARP.draw(A.cv,A.g,A.spin); if(!O.el.hidden)see();
    if(t-lastUi>500){ lastUi=t; if(!A.el.hidden){ if(!pick)draw(); else bars(); } if(!O.el.hidden&&!msg)drawO(); } },'162ea-doll');

  const front=el=>{ for(const x of [A.el,O.el])x.style.zIndex=x===el?32:31; };
  Object.assign(DOLL,{
    me:()=>{ if(!A.el.hidden){ A.el.hidden=true; return; } A.spin=0; pick=null; draw(); A.el.hidden=false; front(A.el); },
    see:o=>{ if(!o||!o.fig)return; if(who!==o)msg=false; who=o; O.spin=0; drawO(); O.el.hidden=false; front(O.el); see(); },
    who:()=>who,
    // the YOU window without its LOOK (the look is set on the first day; ADMIN's AVATAR changes it after): WEAR and WORDS; the barber's chair opens all of it
    looks:t=>{ LOOKS.only=t==='look'?null:new Set(['wear','words']); LOOKS.open(); LOOKS.tab(t); },
    // something dragged out of the bag onto your doll is put on, if it is worn or held
    drop:id=>{ const s=ITEMS.prop&&ITEMS.prop(id,'slot'); if(s&&s!=='hand'&&SL.some(x=>x[0]===s)){ EQUIP.wear(id); draw(); return true; } if((WIELD.LIST||[]).includes(id)){ WIELD.set(id); draw(); return true; } say('THE '+FORAGE.name(id)+' IS NOT SOMETHING YOU WEAR.'); return true; } });
  window.DOLL=DOLL; }
