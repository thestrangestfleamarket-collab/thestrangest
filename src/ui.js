// ---- GETTING AROUND, AND THE MENU (owner, 17 Oct 2026: "allow me to move up and down, all around easier"; his picks: a free camera, easier
// turning round him, flying through walls; the game's Escape menu with its Map, Display and Keys tabs) ----
// FREE CAMERA (C): the view leaves him and goes where you send it (the walking keys glide it along the ground as the screen has it, Space
// up, Shift down, the wheel zooms, a drag turns it); the level shown is the camera's; C again and it's back on him.
// TURNING ROUND HIM: a drag with any button turns and tilts the view (a left click that doesn't drag still walks him there); a double
// click puts the view back. FLY (G): he goes through walls and floors, Space up, Shift down; G again and he comes down to the ground.
// THE MENU (Escape): MAP (the Market from above: a click puts him there; the places in a list; the street or the station's level),
// DISPLAY (sharpness, zoom, tilt, shadows, the help panel), KEYS (every control, each one changed by clicking it and pressing a key).
const UI={freeCam:false,fly:false,menuOpen:false,camT:new THREE.Vector3()};
{ // ---- THE KEYS: each action's key, changeable (kept in this browser); the game's code asks for the action's own default key
  const ACTS=[['w','walk up (screen)'],['s','walk down'],['a','walk left'],['d','walk right'],['shift','run · sink (free camera, fly)'],[' ','jump · rise (free camera, fly) · dive (swimming)'],
    ['j','punch'],['k','kick'],['r','roll'],['v','wave'],['f','fall'],['q','turn left'],['e','turn right'],['z','tilt down'],['x','tilt up'],['0','reset the view'],
    ['c','free camera'],['g','fly (through walls)'],['=','sharper'],['-','coarser'],['h','hide the help']];
  const NAME=k=>k===' '?'SPACE':k.length===1?k.toUpperCase():k.toUpperCase();
  let BIND={}; try{ BIND=JSON.parse(localStorage.getItem('market-keys')||'{}')||{}; }catch(e){}
  const keyOf=a=>BIND[a]??a, rev=()=>{ const r={}; for(const [a] of ACTS)r[keyOf(a)]=a; return r; };
  let REV=rev(), waiting=null;
  // a pressed key to the action the game's code knows (null: not for the game: the menu has it, or a key moved to another action)
  UI.key=e=>{ const raw=e.key.toLowerCase();
    if(waiting){ if(raw!=='escape'){ const old=keyOf(waiting); for(const [a] of ACTS)if(a!==waiting&&keyOf(a)===raw)BIND[a]=old; BIND[waiting]=raw;   // (the key it had goes to the other action)
        try{ localStorage.setItem('market-keys',JSON.stringify(BIND)); }catch(err){} REV=rev(); } waiting=null; drawKeys(); e.preventDefault(); return null; }
    if(raw==='escape'){ if(e.type==='keydown'){ if(ED.on)ED.exit(); else if(WE.on)WE.toggle(); else toggleMenu(); } return null; }
    if(e.target&&/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName))return null;   // (typing in a box isn't walking)
    if(raw==='e'&&e.shiftKey&&!ED.on&&!UI.menuOpen){ if(e.type==='keydown'&&!e.repeat)WE.toggle(); return null; }   // (Shift+E: edit the world, src/worldedit.js)
    if(UI.menuOpen)return null;
    if(ED.on){ const a=REV[raw]; return ['q','e','z','x','0','=','-'].includes(a)?a:null; }   // (shaping him: only the view's keys)
    const act=REV[raw]; if(act!==undefined){ if(e.type==='keydown'&&!e.repeat){ if(act==='c')setFree(!UI.freeCam); if(act==='g')setFly(!UI.fly); } return act; }
    return ACTS.some(([a])=>a===raw)?'':raw; };   // (a default key now given to nothing)
  // ---- FREE CAMERA and FLY
  const badge=document.createElement('div'); badge.id='mode'; document.body.appendChild(badge);
  const drawBadge=()=>{ const m=[UI.freeCam&&'FREE CAMERA: '+NAME(keyOf('c'))+' to go back',UI.fly&&'FLY: '+NAME(keyOf('g'))+' to land'].filter(Boolean); badge.textContent=m.join(' · '); badge.hidden=!m.length; };
  function setFree(on){ UI.freeCam=on; if(on)UI.camT.set(pos.x,py+.9,pos.z); drawBadge(); }
  function setFly(on){ UI.fly=on; if(on){ target=null; } drawBadge(); }
  UI.setFly=setFly; UI.setFree=setFree;
  UI.camStep=(dt,a,up,dn,lf,rt)=>{ if(!UI.freeCam||UI.menuOpen)return; const fx=-Math.sin(a), fz=-Math.cos(a), s=dt*9*PPU/Math.max(4,ppu);   // (as fast across the screen at any zoom)
    let mx=0,mz=0; if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;} const n=Math.hypot(mx,mz)||1;
    UI.camT.x+=mx/n*s; UI.camT.z+=mz/n*s; UI.camT.y+=((keys.has(' ')?1:0)-(keys.has('shift')?1:0))*s*.7;
    UI.camT.x=Math.max(BOUND.x0,Math.min(BOUND.x1,UI.camT.x)); UI.camT.z=Math.max(BOUND.z0,Math.min(BOUND.z1,UI.camT.z)); UI.camT.y=Math.max(-6,Math.min(12,UI.camT.y)); };
  UI.flyStep=dt=>{ py+=((keys.has(' ')?1:0)-(keys.has('shift')?1:0))*dt*4; py=Math.max(-5,Math.min(10,py)); pos.x=Math.max(BOUND.x0,Math.min(BOUND.x1,pos.x)); pos.z=Math.max(BOUND.z0,Math.min(BOUND.z1,pos.z)); };
  // ---- TURNING ROUND HIM with any button's drag; a left click that didn't drag walks him there (on his own level); a double click: the view back
  const cv=renderer.domElement; let L=null;
  cv.addEventListener('pointerdown',e=>{ if(e.button!==0||ED.on)return; if(WE.down(e)){ cv.setPointerCapture(e.pointerId); return; } L={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:false}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(WE.dragging){ WE.move(e); return; } if(!L)return; if(!L.moved&&Math.hypot(e.clientX-L.x0,e.clientY-L.y0)>5)L.moved=true;
    if(L.moved){ yawTo-=(e.clientX-L.x)*0.008; pitchTo=clampP(pitchTo+(e.clientY-L.y)*0.006); } L.x=e.clientX; L.y=e.clientY; });
  cv.addEventListener('pointerup',()=>{ WE.up(); L=null; });
  // ---- DOUBLE CLICK (owner, 17 Oct 2026: "take off click to walk. double click to walk. double click on anything to interact with it"):
  // on the ground he walks there; on a thing he walks up to it, turns to it and does what it's for (the THINGS list: a thing joins it with its
  // name, the object a click finds it by, how near he goes, and what happens)
  const THINGS=[]; UI.thing=o=>THINGS.push(o);
  let goal=null; const said=document.createElement('div'); said.id='said'; said.hidden=true; document.body.appendChild(said);
  const say=(txt,at)=>{ const r=cv.getBoundingClientRect(), v=at.clone().project(cam); said.textContent=txt; said.style.left=Math.round(r.left+(v.x+1)/2*r.width)+'px'; said.style.top=Math.round(r.top+(1-v.y)/2*r.height)+'px'; said.hidden=false; clearTimeout(say.t); say.t=setTimeout(()=>said.hidden=true,2500); };
  const thAt=th=>th.obj.getWorldPosition(new THREE.Vector3());
  cv.addEventListener('dblclick',e=>{ if(WE.on){ WE.pick(e); return; } if(ED.on||UI.freeCam)return; const r=cv.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),cam);
    const live=THINGS.filter(th=>th.obj.visible&&(!th.obj.parent||th.obj.parent.visible)); const hits=ray.intersectObjects(live.map(th=>th.obj),true);
    if(hits.length){ let o=hits[0].object; const th=live.find(th=>{ let q=o; while(q){ if(q===th.obj)return true; q=q.parent; } return false; }); if(th){ goal=th; return; } }
    goal=null; if(UI.fly)return; gplane.constant=-py; if(ray.ray.intersectPlane(gplane,hit)){ target=hit.clone(); UI.go(Math.hypot(hit.x-pos.x,hit.z-pos.z)); } });
  // HOW FAR, HOW FAST (owner, 17 Oct 2026: "the further away you double click the faster you will go there (far away you will run), few steps
  // you will walk"): past six of the world's units he runs, slowing to a walk for the last stretch; Shift still runs
  UI.go=d=>{ UI.clickGo=true; UI.clickRun=d>6; };
  UI.runTick=()=>{ if(!UI.clickGo)return; if(!target){ UI.clickGo=false; st.runTarget=keys.has('shift')?1:0; return; } st.runTarget=keys.has('shift')||UI.clickRun&&Math.hypot(target.x-pos.x,target.z-pos.z)>1.6?1:0; };
  // each frame while he's going to a thing: toward it (it may be moving); there, he faces it and it happens; walking off with the keys lets it go
  UI.goTick=()=>{ if(!goal)return; const p=thAt(goal), d=Math.hypot(p.x-pos.x,p.z-pos.z), reach=goal.reach||1;
    if(d>reach){ if(!target&&goal.started)goal=null; else { const k=(d-reach*0.8)/d; target=new THREE.Vector3(pos.x+(p.x-pos.x)*k,py,pos.z+(p.z-pos.z)*k); if(!goal.started)UI.go(d); goal.started=true; } return; }
    target=null; heading=Math.atan2(p.x-pos.x,p.z-pos.z); const g=goal; goal=null; g.act(); say(g.name,p.clone().setY(p.y+(g.tall||1.6))); };
  // ---- THE MENU
  const css=document.createElement('style'); css.textContent=`
  #mode{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom,0px));font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15}
  #mode[hidden],#shd[hidden],#said[hidden]{display:none}
  #said{position:fixed;transform:translate(-50%,-100%);font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:4px 8px;pointer-events:none;z-index:14}
  #menu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(5,6,10,.55);z-index:30}
  #menu[hidden]{display:none}
  #menu .box{width:min(860px,94vw);max-height:90vh;overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg)}
  #menu .tabs{display:flex;gap:0;border-bottom:2px solid var(--line)} #menu .tabs button{flex:1;font:inherit;color:var(--dim);background:transparent;border:0;border-right:2px solid var(--line);padding:12px;cursor:pointer}
  #menu .tabs button[aria-selected="true"]{color:var(--key);background:var(--panel)} #menu .tabs button:last-child{border-right:0}
  #menu .pane{padding:14px 16px} #menu .pane[hidden]{display:none} #menu h3{font:12px var(--pixel);color:var(--key);margin:12px 0 8px} #menu h3:first-child{margin-top:0}
  #menu .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0} #menu .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:6px 10px;cursor:pointer}
  #menu .btn[aria-pressed="true"]{color:var(--key);border-color:#6b6f80} #menu .dim{color:var(--dim)} #menu input[type=range]{width:220px}
  #menu canvas{display:block;margin:0 auto;max-width:100%;image-rendering:pixelated;border:2px solid var(--line);cursor:crosshair;background:#000}
  #menu table{border-collapse:collapse;width:100%} #menu td{padding:5px 6px;border-bottom:1px solid #22252f} #menu td:last-child{text-align:right}
  #menu .foot{padding:10px 16px;border-top:2px solid var(--line);color:var(--dim);display:flex;justify-content:space-between}`;
  document.head.appendChild(css);
  const M=document.createElement('div'); M.id='menu'; M.hidden=true; M.innerHTML=`<div class="box" role="dialog" aria-label="Menu">
    <div class="tabs" role="tablist"><button role="tab" data-t="map">MAP</button><button role="tab" data-t="display">DISPLAY</button><button role="tab" data-t="keys">KEYS</button></div>
    <div class="pane" data-p="map"><div class="row"><button class="btn" data-lv="up">THE STREET</button><button class="btn" data-lv="down">UNDERGROUND</button><span class="dim">click the map to go there</span></div>
      <canvas id="mapcv"></canvas><h3>PLACES</h3><div class="row" id="places"></div></div>
    <div class="pane" data-p="display">
      <h3>SHARPNESS</h3><div class="row"><button class="btn" data-sh="-1">COARSER</button><span id="dsharp" class="dim"></span><button class="btn" data-sh="1">SHARPER</button></div>
      <h3>VIEW</h3><div class="row"><span style="width:60px">ZOOM</span><input type="range" id="dzoom" min="0" max="1" step="0.001"></div>
      <div class="row"><span style="width:60px">TILT</span><input type="range" id="dtilt" min="0" max="1" step="0.001"><button class="btn" id="dreset">RESET THE VIEW</button></div>
      <h3>SHADOWS</h3><div class="row" id="dshd"></div>
      <h3>HIM</h3><div class="row"><button class="btn" id="doutl">OUTLINE</button><button class="btn" id="dshape">EDIT HIS SHAPE</button></div>
      <div class="row"><button class="btn" id="dglow">GLOW</button><span style="width:60px">AMOUNT</span><input type="range" id="dglowk" min="0" max="1" step="0.01"><button class="btn" id="dlit">LIGHT ON THEM</button><button class="btn" id="dbody">PHYSICS BODY</button><span style="width:60px">LOOSE</span><input type="range" id="dloose" min="0" max="1" step="0.01"></div>
      <h3>ON SCREEN</h3><div class="row"><button class="btn" id="dhelp">HELP PANEL</button><button class="btn" id="dstat">STATS</button></div></div>
    <div class="pane" data-p="keys"><div class="dim" style="margin-bottom:8px">click a key, then press the one you want (Escape to keep it)</div><table id="keytab"></table>
      <div class="row" style="margin-top:10px"><button class="btn" id="kreset">ALL BACK AS THEY WERE</button></div></div>
    <div class="foot"><span>ESC closes</span><span>THE MARKET</span></div></div>`;
  document.body.appendChild(M);
  const $=s=>M.querySelector(s); let tab='map', mapLv='up';
  const show=t=>{ tab=t; M.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===t))); M.querySelectorAll('[data-p]').forEach(p=>p.hidden=p.dataset.p!==t); if(t==='map')drawMap(); if(t==='display')drawDisplay(); if(t==='keys')drawKeys(); };
  M.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>show(b.dataset.t));
  M.addEventListener('click',e=>{ if(e.target===M)toggleMenu(); });
  UI.toggleMenu=()=>toggleMenu();
  function toggleMenu(){ UI.menuOpen=!UI.menuOpen; M.hidden=!UI.menuOpen; keys.clear(); st.runTarget=0; if(UI.menuOpen){ mapLv=LVL; show(tab); } }
  // MAP: the Market from straight above, roofs off, brighter than the night, on the level chosen; you as a dot
  const mcv=$('#mapcv'), mg=mcv.getContext('2d'), rt=new THREE.WebGLRenderTarget(8,8), top=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
  // each level's own stretch (the street's: the bodega's and the pool's; underground: the station's), as big as fits
  const mapRect=lv=>{ const B=lv==='down'?MODS.station.BOUND:{x0:Math.min(MODS.bodega.BOUND.x0,MODS.pool.BOUND.x0),x1:Math.max(MODS.bodega.BOUND.x1,MODS.pool.BOUND.x1),z0:Math.min(MODS.bodega.BOUND.z0,MODS.pool.BOUND.z0),z1:Math.max(MODS.bodega.BOUND.z1,MODS.pool.BOUND.z1)};
    const w=B.x1-B.x0, d=B.z1-B.z0, k=Math.min(800/w,420/d); return {x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1,W:Math.round(w*k),H:Math.round(d*k)}; };
  const GAM=new Uint8Array(256).map((_,i)=>Math.round(255*Math.pow(i/255,1/2.2))), CLP=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(0,1,0),0)], cc=new THREE.Color();
  function drawMap(){ M.querySelectorAll('[data-lv]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lv===mapLv)));
    const R=mapRect(mapLv), W=R.W, H=R.H, vis={}; mcv.width=W; mcv.height=H; rt.setSize(W,H); for(const k in MAPG)vis[k]=MAPG[k].visible; MAPG.down.visible=mapLv==='down'; for(const k of ['bodega','pool','poolout'])MAPG[k].visible=mapLv==='up';
    const h0=HEMI.intensity; HEMI.intensity=2.2; W3.group.visible=false; marker.visible=false;
    const yc=mapLv==='down'?STN.DY:0; CLP[0].constant=yc+1.5; CLP[1].constant=-(yc-2.2);   // (the slice: from under the tracks to chest height)
    top.left=R.x0; top.right=R.x1; top.top=-R.z0; top.bottom=-R.z1; top.position.set(0,yc+60,0); top.up.set(0,0,-1); top.lookAt(0,yc,0); top.near=1; top.far=120; top.updateProjectionMatrix();
    const cp=renderer.clippingPlanes; renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); renderer.clippingPlanes=CLP;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x050507,1); renderer.clear(); renderer.render(scene,top); const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px);
    renderer.setRenderTarget(null); renderer.clippingPlanes=cp; renderer.setClearColor(cc,ca);
    for(const k in vis)MAPG[k].visible=vis[k]; HEMI.intensity=h0; W3.group.visible=true;
    const im=mg.createImageData(W,H); for(let y=0;y<H;y++){ const o=y*W*4, q=(H-1-y)*W*4; for(let i=0;i<W*4;i+=4){ im.data[o+i]=GAM[px[q+i]]; im.data[o+i+1]=GAM[px[q+i+1]]; im.data[o+i+2]=GAM[px[q+i+2]]; im.data[o+i+3]=255; } } mg.putImageData(im,0,0);
    const sx=x=>(x-R.x0)/(R.x1-R.x0)*W, sz=z=>(z-R.z0)/(R.z1-R.z0)*H; if((LVL)===mapLv){ mg.fillStyle='#f2c14e'; mg.fillRect(Math.round(sx(pos.x))-3,Math.round(sz(pos.z))-3,7,7); mg.fillStyle='#000'; mg.fillRect(Math.round(sx(pos.x))-1,Math.round(sz(pos.z))-1,3,3); } }
  const goTo=(x,z,lv)=>{ pos.set(x,0,z); target=null; py=lv==='down'?MODS.station.ground(x,z):0; if(UI.freeCam)UI.camT.set(x,py+.9,z); toggleMenu(); };
  mcv.addEventListener('click',e=>{ const r=mcv.getBoundingClientRect(), R=mapRect(mapLv); goTo(R.x0+(e.clientX-r.left)/r.width*(R.x1-R.x0),R.z0+(e.clientY-r.top)/r.height*(R.z1-R.z0),mapLv); });
  M.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ mapLv=b.dataset.lv; drawMap(); });
  const PLACES=[['THE STREET',-2.2,3.2,'up'],['THE BODEGA',0,-3.4,'up'],['THE POOL',32.8,-2.3,'up'],['THE PLATFORM',-12.4,-24.9,'down']];
  for(const [n,x,z,lv] of PLACES){ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goTo(x,z,lv); $('#places').appendChild(b); }
  // DISPLAY
  const zMin=3, zMax=240, z2r=v=>Math.log(v/zMin)/Math.log(zMax/zMin), r2z=r=>zMin*Math.pow(zMax/zMin,r);
  function drawDisplay(){ $('#dsharp').textContent=(SCL===1&&vpu()<art()?'full':RES()+'×')+' the game\'s detail'; $('#dzoom').value=z2r(ppuTo); $('#dtilt').value=(pitchTo-PMIN)/(PMAX-PMIN);
    $('#dglow').textContent='GLOW: '+GLOW.mode.toUpperCase(); $('#dglowk').value=GLOW.k; $('#dlit').textContent='LIGHT ON THEM: '+(UI.lit?'LAMPS':'FLAT'); $('#dlit').setAttribute('aria-pressed',String(UI.lit)); $('#dbody').setAttribute('aria-pressed',String(PB.on)); $('#dbody').textContent='PHYSICS BODY '+(PB.on?'ON':'OFF'); $('#dloose').value=PB.loose; $('#doutl').setAttribute('aria-pressed',String(OUTL.on)); $('#doutl').textContent='OUTLINE '+(OUTL.on?'ON':'OFF'); $('#dhelp').setAttribute('aria-pressed',String(!document.getElementById('hud').hidden)); $('#dstat').setAttribute('aria-pressed',String(!document.getElementById('stat').hidden));
    const sh=document.getElementById('shd'); $('#dshd').innerHTML=''; sh.querySelectorAll('button').forEach(b=>{ const c=document.createElement('button'); c.className='btn'; c.textContent=b.textContent; c.setAttribute('aria-pressed',b.getAttribute('aria-pressed')); c.onclick=()=>{ b.click(); drawDisplay(); }; $('#dshd').appendChild(c); }); }
  M.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{ if(+b.dataset.sh<0)RESI=Math.max(0,RESI-1); else if(pxS()>1||vpu()>art())RESI=Math.min(RESL.length-1,RESI+1); resize(); drawDisplay(); });
  $('#dzoom').oninput=e=>{ ppuTo=r2z(+e.target.value); }; $('#dtilt').oninput=e=>{ pitchTo=clampP(PMIN+(+e.target.value)*(PMAX-PMIN)); };
  $('#dreset').onclick=()=>{ yawTo=VIEW0.yaw; pitchTo=VIEW0.pitch; ppuTo=VIEW0.ppu; drawDisplay(); };
  $('#dhelp').onclick=()=>{ const h=document.getElementById('hud'); h.hidden=!h.hidden; drawDisplay(); }; $('#dstat').onclick=()=>{ const h=document.getElementById('stat'); h.hidden=!h.hidden; drawDisplay(); };
  // THE OUTLINE round him (owner, 17 Oct 2026: "add ability to remove the line from avatar"; off unless turned on, kept in this browser)
  try{ OUTL.on=localStorage.getItem('market-outline')==='1'; }catch(e){ OUTL.on=false; } OUTL.sp.enabled=OUTL.on;
  $('#doutl').onclick=()=>{ OUTL.on=!OUTL.on; OUTL.sp.enabled=OUTL.on; try{ localStorage.setItem('market-outline',OUTL.on?'1':'0'); }catch(e){} drawDisplay(); };
  $('#dshape').onclick=()=>ED.enter();
  // LIGHT ON THEM: the Walker, the goldfish and the bear lit by the lamps (walker3d.js, npc-map.js), or each by its own fixed light (FLAT)
  UI.setLit=on=>{ UI.lit=on; W3.mesh.material=on?W3.toon:W3.flat; for(const N of NPCS)N.me.material=on?N.toon:N.flat; try{ localStorage.setItem('market-avlight',on?'1':'0'); }catch(e){} };
  { let v='1'; try{ v=localStorage.getItem('market-avlight')||'1'; }catch(e){} UI.setLit(v==='1'); }
  $('#dlit').onclick=()=>{ UI.setLit(!UI.lit); drawDisplay(); };
  { let g='soft'; try{ g=localStorage.getItem('market-glow')||'soft'; }catch(e){} GLOW.set(g); try{ const k=localStorage.getItem('market-glowk'); if(k!=null)GLOW.k=+k; }catch(e){} }
  $('#dglowk').oninput=e=>GLOW.amount(+e.target.value);   // (owner, 17 Oct 2026: "30% between off and glow": the soft glow at 0.3 to begin with)
  $('#dglow').onclick=()=>{ GLOW.set({off:'soft',soft:'stepped',stepped:'off'}[GLOW.mode]); drawDisplay(); };
  $('#dbody').onclick=()=>{ PB.set(!PB.on); drawDisplay(); }; $('#dloose').oninput=e=>{ PB.loose=+e.target.value; try{ localStorage.setItem('market-loose',String(PB.loose)); }catch(err){} };
  // KEYS
  function drawKeys(){ const t=$('#keytab'); t.innerHTML=''; for(const [a,what] of ACTS){ const tr=document.createElement('tr'), b=document.createElement('button'); b.className='btn'; b.textContent=waiting===a?'PRESS A KEY…':NAME(keyOf(a)); b.setAttribute('aria-pressed',String(waiting===a)); b.onclick=()=>{ waiting=a; drawKeys(); };
      const td1=document.createElement('td'); td1.textContent=what.toUpperCase(); const td2=document.createElement('td'); td2.appendChild(b); tr.append(td1,td2); t.appendChild(tr); }
    const e=document.createElement('tr'); e.innerHTML='<td>MENU</td><td><span class="dim">ESC</span></td>'; t.appendChild(e); }
  $('#kreset').onclick=()=>{ BIND={}; try{ localStorage.removeItem('market-keys'); }catch(e){} REV=rev(); drawKeys(); drawBadge(); };
  // NOTHING ON SCREEN BUT THE GAME (owner, 17 Oct 2026: "take off the hud ... the market and controls, shadows etc on screen entire time"):
  // the help panel, the stats and the shadows' buttons start hidden; the menu has them all (DISPLAY: shadows, help, stats; KEYS: every control)
  for(const id of ['hud','stat','shd'])document.getElementById(id).hidden=true;
  drawBadge(); }
