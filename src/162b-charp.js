// THE CHARACTER PAGE: the menu's home (ESC) — your live avatar and the menu buttons; ADMIN (owners) holds the bug queue, the game log, the stats box and the render inspector.
import {THREE} from './003-shx.js';
import {CHARP, CINEMA, FORAGE, LOOKS, PASSPORT, PS2, RINSP, UI, W3} from './003b-systems.js';
import {pxS, renderer} from './004-main.js';
import {DESIGN} from './102b-designer.js';
{ const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const CLOG=__CHANGELOG__;   // [date, summary] of every HISTORY update, newest first; baked by build.py

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
  const loop=t=>{ if(!UI.menuOpen||!el){ raf=0; return; } raf=requestAnimationFrame(loop); if(t-last<55)return; last=t; shot(); };

  const btns=()=>{ const B=[['INVENTORY','I',()=>openPack('pack')],['SKILLS','',()=>openPack('skills')],['PASSPORT','',()=>{ if(UI.menuOpen)UI.toggleMenu(); PASSPORT.open(); }],['SETTINGS','',()=>UI.menuTab('display')],['GUIDE','SHIFT+G',()=>UI.menuTab('guide')],['REPORT A BUG','F8',()=>UI.menuTab('bug')],['LOG OUT','',logout],['HELP','?',()=>{ UI.toggleMenu(); UI.moves(); }]];
    if(isAdmin)B.push(['ADMIN','',adminOpen,1]);
    el.querySelector('#cpbtns').innerHTML=B.map((b,i)=>`<button class="cp-btn${b[3]?' cp-adm':''}" data-i="${i}">${b[0]}<span class="cp-tag">${b[1]}</span></button>`).join(''); el._btns=B; };
  const openPack=t=>{ if(UI.menuOpen)UI.toggleMenu(); if(FORAGE.PACK){ if(!FORAGE.PACK.open)FORAGE.PACK.toggle(t); else { FORAGE.PACK.tab=t; FORAGE.PACK.draw(); } } };
  const logout=()=>{ if(!confirm('Log out of The Strangest Flea Market?'))return; try{ document.cookie='tsfm-pass=; path=/; max-age=0; samesite=strict'; }catch(e){} try{ localStorage.removeItem('sb-jvcetttmqseoteidfggn-auth-token'); }catch(e){} location.replace('/'); };
  let ap=null; const adminOpen=()=>{ if(UI.menuOpen)UI.toggleMenu(); if(!ap){ ap=document.createElement('div'); ap.id='cpadmin'; ap.hidden=true; ap.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);z-index:21;width:min(460px,92vw);max-height:84vh;overflow:auto;padding:16px 18px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #7a3524;zoom:var(--uiz,1)';
      ap.innerHTML=`<div style="color:#e0633f;font:12px Silkscreen,monospace;letter-spacing:.14em;margin-bottom:10px">ADMIN</div>
        <button class="cp-btn cp-adm" id="cpaq" style="width:100%;margin-bottom:8px">BUG / REPORT QUEUE</button>
        <div style="display:flex;gap:8px;margin-bottom:14px"><button class="cp-btn" id="cpstat" style="flex:1">STATS</button><button class="cp-btn" id="cprin" style="flex:1">RENDER INSPECTOR</button></div>
        <div style="color:#f2c14e;letter-spacing:.1em;margin-bottom:6px">GAME LOG</div>
        <div style="color:#9b9584;margin-bottom:8px">every update, newest first — ${CLOG.length}</div>
        <ul style="margin:0;padding-left:16px;max-height:52vh;overflow:auto;line-height:1.55">${CLOG.map(([d,t])=>`<li style="margin-bottom:5px"><b style="color:#f2c14e">${esc(d)}</b> — ${esc(t)}</li>`).join('')}</ul>`;
      document.body.appendChild(ap); ap.addEventListener('keydown',e=>e.stopPropagation()); ap.querySelector('#cpaq').onclick=()=>{ ap.hidden=true; UI.menuTab('bug'); };
      const tools=()=>{ const s=document.getElementById('stat'); ap.querySelector('#cpstat').setAttribute('aria-pressed',String(!!s&&!s.hidden)); ap.querySelector('#cprin').setAttribute('aria-pressed',String(!!RINSP.on)); };
      ap.querySelector('#cpstat').onclick=()=>{ const s=document.getElementById('stat'); if(s)s.hidden=!s.hidden; tools(); };
      ap.querySelector('#cprin').onclick=()=>{ if(RINSP.toggle)RINSP.toggle(); tools(); if(RINSP.on)ap.hidden=true; }; ap._tools=tools; }
    ap._tools(); ap.hidden=false; };

  const build=host=>{ el=host; if(el._cp)return; el._cp=1;
    el.innerHTML=`<div class="cp-wrap"><div class="cp-stage"><canvas id="cpav" width="${W}" height="${H}"></canvas><span class="cp-live">LIVE</span><button class="cp-edit" id="cpedit" title="change your body, hair and shape">EDIT</button></div>
      <div class="cp-right"><div class="cp-btns" id="cpbtns"></div></div></div>`;
    cv=el.querySelector('#cpav'); g2=cv.getContext('2d');
    { let dx=null; cv.style.cursor='grab'; cv.addEventListener('pointerdown',e=>{ dx=e.clientX; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; }); cv.addEventListener('pointermove',e=>{ if(dx==null)return; spin+=(e.clientX-dx)*.025; dx=e.clientX; }); const up=()=>{ dx=null; cv.style.cursor='grab'; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); }   // drag to turn yourself; facing you again each time the menu opens
    el.querySelector('#cpedit').onclick=()=>{ if(UI.menuOpen)UI.toggleMenu(); LOOKS.open(); };
    el.addEventListener('click',e=>{ const b=e.target.closest('.cp-btn[data-i]'); if(b&&el._btns&&el._btns[+b.dataset.i])el._btns[+b.dataset.i][2](); }); };

  Object.assign(CHARP,{ show:host=>{ spin=0; build(host); btns(); shot(); if(!raf)raf=requestAnimationFrame(loop);
      if(!isAdmin&&CINEMA.isAdmin)CINEMA.isAdmin().then(a=>{ if(a){ isAdmin=true; if(el&&UI.menuOpen)btns(); } }); },
    hide:()=>{ if(raf){ cancelAnimationFrame(raf); raf=0; } }, admin:adminOpen, log:CLOG }); window.CHARP=CHARP;

  const css=document.createElement('style'); css.textContent=`
  #dhome .cp-wrap{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start}
  #dhome .cp-stage{position:relative;background:radial-gradient(120% 90% at 50% 6%,#22242c,#0b0c11);border:2px solid var(--line)}
  #dhome .cp-stage canvas{display:block;width:200px;height:300px}
  #dhome .cp-edit{position:absolute;right:6px;top:6px;font:9px var(--pixel);color:var(--key);border:1px solid #3a3f4e;padding:2px 6px;background:rgba(5,6,10,.7);cursor:pointer}
  #dhome .cp-live{position:absolute;left:6px;top:6px;font:9px var(--pixel);color:var(--dim);border:1px solid #3a3f4e;padding:1px 5px;background:rgba(5,6,10,.5)}
  #dhome .cp-right{display:flex;flex-direction:column;gap:8px;min-width:180px;flex:1}
  #dhome .cp-btns{display:flex;flex-direction:column;gap:7px}
  #dhome .cp-btn,#cpadmin .cp-btn{text-align:left;font:12px var(--pixel);color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:9px 12px;cursor:pointer;display:flex;justify-content:space-between;gap:12px;letter-spacing:.05em}
  #dhome .cp-btn:hover,#cpadmin .cp-btn:hover{color:var(--key);border-color:#6b6f80}
  #cpadmin .cp-btn[aria-pressed="true"]{color:var(--key)}
  #dhome .cp-btn .cp-tag{color:var(--dim);font-size:9px}
  #dhome .cp-btn.cp-adm,#cpadmin .cp-btn.cp-adm{color:#e0633f;border-color:#7a3524}
  #dhome .cp-btn.cp-adm:hover,#cpadmin .cp-btn.cp-adm:hover{border-color:#e0633f}`; document.head.appendChild(css); }
