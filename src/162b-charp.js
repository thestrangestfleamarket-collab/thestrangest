// THE CHARACTER PAGE: the menu's home (ESC) — your live avatar, drag-drop gear, and the menu buttons.
import {THREE} from './003-shx.js';
import {CHARP, CINEMA, EQUIP, FORAGE, INV, ITEMS, LOOKS, PS2, UI, VIT, W3, WIELD} from './003b-systems.js';
import {pxS, renderer} from './004-main.js';
import {DESIGN} from './102b-designer.js';
{ const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const CLOG=__CHANGELOG__;   // [date, summary] of every HISTORY update, newest first; baked by build.py
  const SLOTS=[['head','HEAD'],['eyes','EYES'],['body','BODY'],['hand','HAND']];
  const name=id=>(FORAGE.NM&&FORAGE.NM[id])||id, short=id=>{ const n=name(id); return n.length>11?n.slice(0,10)+'…':n; };
  const slotOf=id=>ITEMS&&ITEMS.prop?ITEMS.prop(id,'slot'):null, holdable=id=>slotOf(id)==='hand'||(WIELD.LIST&&WIELD.LIST.includes(id));
  const carried=()=>Object.keys(INV.items||{}).filter(id=>INV.items[id]>0&&(['head','eyes','body'].includes(slotOf(id))||holdable(id))).sort();
  const wornIn=s=>s==='hand'?WIELD.on:(EQUIP.by&&EQUIP.by[s]);
  const wear=id=>{ if(holdable(id))WIELD.set(WIELD.on===id?null:id); else EQUIP.wear(id); refresh(); };
  const unwear=s=>{ const id=wornIn(s); if(!id)return; if(s==='hand')WIELD.set(null); else EQUIP.wear(id); refresh(); };
  const fits=(id,s)=>s==='hand'?holdable(id):slotOf(id)===s;
  const pick=(s,at)=>{ const P=el.querySelector('#cppick'), ids=carried().filter(id=>fits(id,s)), lab=(SLOTS.find(x=>x[0]===s)||[0,s])[1];
    P.innerHTML=`<div class="cp-trayh">${lab}</div>`+(ids.length?ids.map(id=>`<div class="cp-chip" data-id="${id}">${esc(short(id))}</div>`).join(''):`<span class="cp-dim">nothing for your ${s} yet — gear turns up in your pack</span>`);
    P.dataset.slot=s; P.style.top=at.offsetTop+'px'; P.hidden=false; };

  // the avatar: render W3.group into the panel canvas. The body is one mesh posed by shader uniforms, so its
  // geometry bounds are the bind pose, not the real figure: frame from the feet (group y) to the head (W3.eyeAt).
  let rt,cam,raf=0,last=0,el=null,cv=null,g2=null,spin=0,isAdmin=!!CINEMA.admin; const W=256,H=384,FACE=0, V=new THREE.Vector3();
  const shot=()=>{ const g=W3&&W3.group; if(!g||!cv||!W3.mesh)return; if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,100); }
    const sv={ry:g.rotation.y,vis:g.visible,am:g.matrixAutoUpdate}; g.visible=true; g.matrixAutoUpdate=true; g.rotation.y=FACE+spin; g.updateMatrixWorld(true);
    const gp=g.getWorldPosition(V.clone()), head=W3.eyeAt&&W3.eyeAt(new THREE.Vector3());
    const topY=(head?head.y:gp.y+2.2)+.18, botY=gp.y-.05, hh=Math.max(.6,topY-botY)*1.06, ww=hh*(W/H), cy=(topY+botY)/2, d=hh*3+6;
    cam.left=-ww/2; cam.right=ww/2; cam.top=hh/2; cam.bottom=-hh/2; cam.near=.01; cam.far=d*3+60; cam.updateProjectionMatrix();
    cam.position.set(gp.x,cy,gp.z+d); cam.up.set(0,1,0); cam.lookAt(gp.x,cy,gp.z); cam.updateMatrixWorld(true);
    DESIGN.portrait(rt,cam);
    const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px); if(PS2.on)PS2.img(px,W,H,Math.min(H,300*(devicePixelRatio||1)/pxS()));   // the same pixel size as the game around it, at your RESOLUTION
    g.rotation.y=sv.ry; g.visible=sv.vis; g.matrixAutoUpdate=sv.am; g.updateMatrixWorld(true);
    const im=g2.createImageData(W,H); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); g2.putImageData(im,0,0); };
  const loop=t=>{ if(!UI.menuOpen||!el){ raf=0; return; } raf=requestAnimationFrame(loop); if(t-last<55)return; last=t; shot(); bars(); };

  const bars=()=>{ if(!el)return; const hp=el.querySelector('#cphp'), sta=el.querySelector('#cpst'); if(hp)hp.style.width=Math.round((VIT.hp||0)*100)+'%'; if(sta)sta.style.width=Math.round((VIT.sta||0)*100)+'%'; };
  const drawSlots=()=>{ el.querySelector('#cpslots').innerHTML=SLOTS.map(([s,lab])=>{ const id=wornIn(s); return `<div class="cp-slot${id?' on':''}" data-slot="${s}"${id?' draggable="true"':''} title="${id?esc(name(id)):lab} — ${id?'click or drag off to remove':'click to pick gear, or drag it here'}">${id?esc(short(id)):'<span class="cp-dim">'+lab+'</span>'}</div>`; }).join(''); };
  const drawTray=()=>{ const ids=carried(); el.querySelector('#cptray').innerHTML='<div class="cp-trayh">CARRIED GEAR — drag onto your body, or click to wear</div>'+(ids.length?ids.map(id=>`<div class="cp-chip" draggable="true" data-id="${id}">${esc(short(id))}</div>`).join(''):'<span class="cp-dim">nothing to wear — gear turns up in your pack</span>'); };
  const btns=()=>{ const B=[['INVENTORY','I',()=>openPack('pack')],['SKILLS','',()=>openPack('skills')],['PASSPORT','',()=>UI.menuTab('passport')],['SETTINGS','',()=>UI.menuTab('display')],['GUIDE','SHIFT+G',()=>UI.menuTab('guide')],['REPORT A BUG','F8',()=>UI.menuTab('bug')],['LOG OUT','',logout],['HELP','?',()=>{ UI.toggleMenu(); UI.moves(); }]];
    if(isAdmin)B.push(['ADMIN','',adminOpen,1]);
    el.querySelector('#cpbtns').innerHTML=B.map((b,i)=>`<button class="cp-btn${b[3]?' cp-adm':''}" data-i="${i}">${b[0]}<span class="cp-tag">${b[1]}</span></button>`).join(''); el._btns=B; };
  const openPack=t=>{ if(UI.menuOpen)UI.toggleMenu(); if(FORAGE.PACK){ if(!FORAGE.PACK.open)FORAGE.PACK.toggle(t); else { FORAGE.PACK.tab=t; FORAGE.PACK.draw(); } } };
  const logout=()=>{ if(!confirm('Log out of The Strangest Flea Market?'))return; try{ document.cookie='tsfm-pass=; path=/; max-age=0; samesite=strict'; }catch(e){} try{ localStorage.removeItem('sb-jvcetttmqseoteidfggn-auth-token'); }catch(e){} location.replace('/'); };
  let ap=null; const adminOpen=()=>{ if(UI.menuOpen)UI.toggleMenu(); if(!ap){ ap=document.createElement('div'); ap.id='cpadmin'; ap.hidden=true; ap.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);z-index:21;width:min(460px,92vw);max-height:84vh;overflow:auto;padding:16px 18px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #7a3524;zoom:var(--uiz,1)';
      ap.innerHTML=`<div style="color:#e0633f;font:12px Silkscreen,monospace;letter-spacing:.14em;margin-bottom:10px">ADMIN</div>
        <button class="cp-btn cp-adm" id="cpaq" style="width:100%;margin-bottom:14px">BUG / REPORT QUEUE</button>
        <div style="color:#f2c14e;letter-spacing:.1em;margin-bottom:6px">GAME LOG</div>
        <div style="color:#9b9584;margin-bottom:8px">every update, newest first — ${CLOG.length}</div>
        <ul style="margin:0;padding-left:16px;max-height:52vh;overflow:auto;line-height:1.55">${CLOG.map(([d,t])=>`<li style="margin-bottom:5px"><b style="color:#f2c14e">${esc(d)}</b> — ${esc(t)}</li>`).join('')}</ul>`;
      document.body.appendChild(ap); ap.addEventListener('keydown',e=>e.stopPropagation()); ap.querySelector('#cpaq').onclick=()=>{ ap.hidden=true; UI.menuTab('bug'); }; }
    ap.hidden=false; };

  const refresh=()=>{ if(!el)return; el.querySelector('#cppick').hidden=true; drawSlots(); drawTray(); bars(); el.querySelector('#cpname').textContent=((LOOKS.L&&LOOKS.L.name)||'YOU').toUpperCase(); shot(); };

  const build=host=>{ el=host; if(el._cp)return; el._cp=1;
    el.innerHTML=`<div class="cp-wrap"><div class="cp-doll"><div class="cp-slots" id="cpslots"></div><div class="cp-pick" id="cppick" hidden></div>
      <div class="cp-stage"><canvas id="cpav" width="${W}" height="${H}"></canvas><span class="cp-live">LIVE</span><button class="cp-edit" id="cpedit" title="change your body, hair and shape">EDIT</button>
        <div class="cp-vit"><div>HP <span class="cp-bar"><i id="cphp" style="background:#c84a3a"></i></span></div><div>ST <span class="cp-bar"><i id="cpst" style="background:#d8b84a"></i></span></div></div></div></div>
      <div class="cp-right"><div class="cp-name" id="cpname">YOU</div><div class="cp-btns" id="cpbtns"></div></div></div>
      <div class="cp-tray" id="cptray"></div>`;
    cv=el.querySelector('#cpav'); g2=cv.getContext('2d');
    { let dx=null; cv.style.cursor='grab'; cv.addEventListener('pointerdown',e=>{ dx=e.clientX; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; }); cv.addEventListener('pointermove',e=>{ if(dx==null)return; spin+=(e.clientX-dx)*.025; dx=e.clientX; }); const up=()=>{ dx=null; cv.style.cursor='grab'; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); }   // drag to turn yourself; facing you again each time the menu opens
    el.querySelector('#cpedit').onclick=()=>{ if(UI.menuOpen)UI.toggleMenu(); LOOKS.open(); };
    el.addEventListener('mousedown',e=>{ if(e.target.closest('.cp-slot,.cp-chip'))e.stopPropagation(); },true);
    el.addEventListener('click',e=>{ const P=el.querySelector('#cppick'), sl=e.target.closest('.cp-slot');
      if(sl){ const s=sl.dataset.slot; if(wornIn(s))unwear(s); else if(!P.hidden&&P.dataset.slot===s)P.hidden=true; else pick(s,sl); return; }
      if(!e.target.closest('#cppick'))P.hidden=true; const ch=e.target.closest('.cp-chip'); if(ch){ wear(ch.dataset.id); return; } const b=e.target.closest('.cp-btn[data-i]'); if(b&&el._btns&&el._btns[+b.dataset.i])el._btns[+b.dataset.i][2](); });
    el.addEventListener('dragstart',e=>{ const ch=e.target.closest('.cp-chip'), sl=e.target.closest('.cp-slot.on'); if(ch)e.dataTransfer.setData('text/plain','wear:'+ch.dataset.id); else if(sl)e.dataTransfer.setData('text/plain','off:'+sl.dataset.slot); else return; e.dataTransfer.effectAllowed='move'; });
    el.addEventListener('dragover',e=>{ if(e.target.closest('.cp-slot,.cp-tray'))e.preventDefault(); });
    el.addEventListener('drop',e=>{ const d=e.dataTransfer.getData('text/plain')||''; const sl=e.target.closest('.cp-slot'); e.preventDefault();
      if(d.startsWith('wear:')){ if(sl)wear(d.slice(5)); } else if(d.startsWith('off:')&&e.target.closest('.cp-tray'))unwear(d.slice(4)); }); };

  Object.assign(CHARP,{ show:host=>{ spin=0; build(host); btns(); refresh(); if(!raf)raf=requestAnimationFrame(loop);
      if(!isAdmin&&CINEMA.isAdmin)CINEMA.isAdmin().then(a=>{ if(a){ isAdmin=true; if(el&&UI.menuOpen)btns(); } }); },
    hide:()=>{ if(raf){ cancelAnimationFrame(raf); raf=0; } }, admin:adminOpen, log:CLOG }); window.CHARP=CHARP;

  const css=document.createElement('style'); css.textContent=`
  #dhome .cp-wrap{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start}
  #dhome .cp-doll{display:flex;gap:10px;align-items:stretch;position:relative}
  #dhome .cp-pick{position:absolute;left:58px;z-index:2;width:190px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;background:#0b0d12;border:2px solid var(--key);padding:8px;font:10px var(--pixel)}
  #dhome .cp-pick[hidden]{display:none}
  #dhome .cp-slots,#dhome .cp-pick,#dhome .cp-tray,#dhome .cp-name{display:none}
  #dhome .cp-slot{width:48px;height:48px;background:#0b0d12;border:2px solid #3a3f4e;display:flex;align-items:center;justify-content:center;text-align:center;font:9px var(--pixel);color:var(--key);cursor:pointer;padding:2px;line-height:1.15;overflow:hidden;word-break:break-word}
  #dhome .cp-slot.on{border-color:#6b6f80}
  #dhome .cp-slot.cp-over{border-color:var(--key);border-style:dashed}
  #dhome .cp-stage{position:relative;background:radial-gradient(120% 90% at 50% 6%,#22242c,#0b0c11);border:2px solid var(--line)}
  #dhome .cp-stage canvas{display:block;width:200px;height:300px}
  #dhome .cp-edit{position:absolute;right:6px;top:6px;font:9px var(--pixel);color:var(--key);border:1px solid #3a3f4e;padding:2px 6px;background:rgba(5,6,10,.7);cursor:pointer}
  #dhome .cp-live{position:absolute;left:6px;top:6px;font:9px var(--pixel);color:var(--dim);border:1px solid #3a3f4e;padding:1px 5px;background:rgba(5,6,10,.5)}
  #dhome .cp-vit{position:absolute;left:6px;right:6px;bottom:6px;display:grid;gap:3px;font:9px var(--pixel);color:var(--dim)}
  #dhome .cp-bar{display:inline-block;width:86px;height:7px;background:#0b0d13;border:1px solid #2a3040;vertical-align:middle}
  #dhome .cp-bar i{display:block;height:100%;width:0}
  #dhome .cp-right{display:flex;flex-direction:column;gap:8px;min-width:180px;flex:1}
  #dhome .cp-name{color:var(--key);letter-spacing:.08em;border-bottom:2px solid var(--line);padding-bottom:7px}
  #dhome .cp-btns{display:flex;flex-direction:column;gap:7px}
  #dhome .cp-btn{text-align:left;font:12px var(--pixel);color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:9px 12px;cursor:pointer;display:flex;justify-content:space-between;gap:12px;letter-spacing:.05em}
  #dhome .cp-btn:hover{color:var(--key);border-color:#6b6f80}
  #dhome .cp-btn .cp-tag{color:var(--dim);font-size:9px}
  #dhome .cp-btn.cp-adm{color:#e0633f;border-color:#7a3524}
  #dhome .cp-btn.cp-adm:hover{border-color:#e0633f}
  #dhome .cp-tray{margin-top:14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;border-top:2px solid var(--line);padding-top:10px}
  #dhome .cp-trayh{width:100%;color:var(--dim);font-size:10px;margin-bottom:2px}
  #dhome .cp-chip{background:#0e1016;border:2px solid #3a3f4e;color:var(--key);padding:5px 8px;cursor:grab;font:10px var(--pixel)}
  #dhome .cp-chip:hover{border-color:#6b6f80}
  #dhome .cp-dim{color:var(--dim)}`; document.head.appendChild(css); }
