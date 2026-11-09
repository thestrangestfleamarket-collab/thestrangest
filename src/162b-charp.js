// THE CHARACTER PAGE: ADMIN's AVATAR (your live avatar beside your look; PASSPORT, RESURRECT, LOG OUT), the paper doll's picture of you (CHARP.draw) and ADMIN's TOOLS (STATS, the render inspector, the game log).
import {THREE} from './003-shx.js';
import {BUGS, CHARP, ITEMED, PASSPORT, PS2, RINSP, TEXT, UI, VIT, W3, WE} from './003b-systems.js';
import {pxS, renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {DESIGN} from './102b-designer.js';
import {DESIGNER} from './111cb-designer.js';
import {DM} from './146bb-dm.js';
{ const esc=TEXT.esc;

  // the avatar: render W3.group into the panel canvas. The body is one mesh posed by shader uniforms, so its
  // geometry bounds are the bind pose, not the real figure: frame from the feet (group y) to the head (W3.eyeAt).
  let rt,cam,on=0,last=0,el=null,cv=null,g2=null,spin=0; const W=256,H=384,FACE=0, V=new THREE.Vector3();
  const shot=(c=cv,x=g2,sp=spin)=>{ const g=W3&&W3.group; if(!g||!c||!W3.mesh)return; if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,100); }
    const sv={ry:g.rotation.y,vis:g.visible,am:g.matrixAutoUpdate}; g.visible=true; g.matrixAutoUpdate=true; g.rotation.y=FACE+sp; g.updateMatrixWorld(true);
    const gp=g.getWorldPosition(V.clone()), head=W3.eyeAt&&W3.eyeAt(new THREE.Vector3());
    const topY=(head?head.y:gp.y+2.2)+.18, botY=gp.y-.05, hh=Math.max(.6,topY-botY)*1.06, ww=hh*(W/H), cy=(topY+botY)/2, d=hh*3+6;
    cam.left=-ww/2; cam.right=ww/2; cam.top=hh/2; cam.bottom=-hh/2; cam.near=.01; cam.far=d*3+60; cam.updateProjectionMatrix();
    cam.position.set(gp.x,cy,gp.z+d); cam.up.set(0,1,0); cam.lookAt(gp.x,cy,gp.z); cam.updateMatrixWorld(true);
    DESIGN.portrait(rt,cam);
    const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px); PS2.page(px,W,H,c.getBoundingClientRect().height||300,pxS());   // the same pixel size as the game around it, at your RESOLUTION
    g.rotation.y=sv.ry; g.visible=sv.vis; g.matrixAutoUpdate=sv.am; g.updateMatrixWorld(true);
    const im=x.createImageData(W,H); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); x.putImageData(im,0,0); };
  const loop=t=>{ if(!on||!UI.menuOpen||!el)return; if(t-last<55)return; last=t; shot(); }; SYS.add('win',loop,'162b-charp');

  const btns=()=>{ const B=[['PASSPORT','',()=>{ if(UI.menuOpen)UI.toggleMenu(); PASSPORT.open(); }],['RESURRECT','',()=>{ if(VIT.revive&&VIT.revive()&&UI.menuOpen)UI.toggleMenu(); },0,!VIT.dead],['LOG OUT','',logout]];
    el.querySelector('#cpbtns').innerHTML=B.map((b,i)=>`<button class="cp-btn${b[3]?' cp-adm':''}" data-i="${i}"${b[4]?' disabled title="only when you are dead"':''}>${b[0]}<span class="cp-tag">${b[1]}</span></button>`).join(''); el._btns=B; };
  const logout=()=>{ if(!confirm('Log out of The Strangest Flea Market?'))return; BUGS.logout(); };
  const tools=host=>{ const st=document.getElementById('stat');
    host.innerHTML=`<h3>TOOLS</h3><div class="row onoff"><button class="btn" id="cpstat" aria-pressed="${!!st&&!st.hidden}">STATS</button></div><div class="row onoff"><button class="btn" id="cprin" aria-pressed="${!!RINSP.on}">RENDER INSPECTOR</button></div>
`;
    host.querySelector('#cpstat').onclick=()=>{ const s=document.getElementById('stat'); if(s)s.hidden=!s.hidden; tools(host); };
    host.querySelector('#cprin').onclick=()=>{ if(RINSP.toggle)RINSP.toggle(); if(RINSP.on&&UI.menuOpen)UI.toggleMenu(); else tools(host); }; };

  // ADMIN's EDITORS (owner, 8 Nov 2026: "add all the editors into the admin menu - except the paint"): each opens its editor; the painter stays with paper and canvases
  const editors=host=>{ const shut=()=>{ if(UI.menuOpen)UI.toggleMenu(); }, E=[
      ['EDIT THE WORLD','SHIFT+E · isometric',()=>{ shut(); if(WE.key)WE.key(); }],
      ['DUNGEON MASTER','SHIFT+Y',()=>{ shut(); if(DM.toggle)DM.toggle(true); }],
      ['ITEM EDITOR','SHIFT+7',()=>{ shut(); if(ITEMED.key)ITEMED.key(); }],
      ['AVATAR DESIGNER','',()=>{ shut(); DESIGNER.open(); }]];
    host.innerHTML='<h3>EDITORS</h3>'+E.map((e,i)=>`<div class="row"><button class="btn" data-ed="${i}">${e[0]}${e[1]?' · '+e[1]:''}</button></div>`).join('');
    host.onclick=ev=>{ const b=ev.target.closest('[data-ed]'); if(b)E[+b.dataset.ed][2](); }; };

  const build=host=>{ el=host; if(el._cp)return; el._cp=1;
    el.innerHTML=`<div class="cp-wrap"><div class="cp-stage"><canvas id="cpav" width="${W}" height="${H}"></canvas><span class="cp-live">LIVE</span></div>
      <div class="cp-right"><div class="cp-btns" id="cpbtns"></div></div></div>`;
    cv=el.querySelector('#cpav'); g2=cv.getContext('2d');
    { let dx=null; cv.style.cursor='grab'; cv.addEventListener('pointerdown',e=>{ dx=e.clientX; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; }); cv.addEventListener('pointermove',e=>{ if(dx==null)return; spin+=(e.clientX-dx)*.025; dx=e.clientX; }); const up=()=>{ dx=null; cv.style.cursor='grab'; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); }   // drag to turn yourself; facing you again each time the menu opens
    el.addEventListener('click',e=>{ const b=e.target.closest('.cp-btn[data-i]'); if(b&&el._btns&&el._btns[+b.dataset.i])el._btns[+b.dataset.i][2](); }); };

  Object.assign(CHARP,{ show:host=>{ spin=0; build(host); btns(); shot(); on=1; },
    hide:()=>{ on=0; }, tools, editors, draw:(c,x,sp)=>shot(c,x,sp), W, H, logout }); window.CHARP=CHARP;

  const css=document.createElement('style'); css.textContent=`
  #dhome .cp-wrap{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start}
  #dhome .cp-stage{position:relative;background:radial-gradient(120% 90% at 50% 6%,#22242c,#0b0c11);border:2px solid var(--line)}
  #dhome .cp-stage canvas{display:block;width:200px;height:300px}
  #dhome .cp-live{position:absolute;left:6px;top:6px;font:9px var(--pixel);color:var(--dim);border:1px solid #3a3f4e;padding:1px 5px;background:rgba(5,6,10,.5)}
  #dhome .cp-right{display:flex;flex-direction:column;gap:8px;min-width:180px;flex:1}
  #dhome .cp-btns{display:flex;flex-direction:column;gap:7px} #menu #dhome .cp-btn:disabled{opacity:.35;cursor:default;background:transparent;color:var(--fg)}
  #dhome .cp-btn{text-align:left;font:12px var(--pixel);color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:9px 12px;cursor:pointer;display:flex;justify-content:space-between;gap:12px;letter-spacing:.05em}
  #dhome .cp-btn:hover{color:var(--key);border-color:#6b6f80}
  #dhome .cp-btn .cp-tag{color:var(--dim);font-size:9px}
  #dhome .cp-btn.cp-adm{color:#e0633f;border-color:#7a3524}
  #dhome .cp-btn.cp-adm:hover{border-color:#e0633f}`; document.head.appendChild(css); }
