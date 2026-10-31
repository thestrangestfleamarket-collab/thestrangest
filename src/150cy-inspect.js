// THE INSPECT WINDOW: INSPECT turns a thing over in a little studio window (drag to turn, wheel to zoom): what you hold or point at (the inspect key, 5), or anything in your pack (LOOK); each family of items says how it looks with INSPECT.kinds.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, GPH, INSPECT, INV, ITEMS, UI} from './003b-systems.js';
import {renderer} from './004-main.js';
{ const W=320, H=320, esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ROOM=new THREE.Scene(), KEY=new THREE.DirectionalLight(0xffffff,2.2), FILL=new THREE.DirectionalLight(0xc8d4ff,.8), PIV=new THREE.Group();
  KEY.position.set(-2,3,4); FILL.position.set(3,1,-3); ROOM.add(new THREE.AmbientLight(0xffffff,.75),KEY,FILL,PIV);
  const cam=new THREE.PerspectiveCamera(30,W/H,.01,100), CC=new THREE.Color(), BX=new THREE.Box3(), SP=new THREE.Sphere();
  let rt=null, P=null, cv=null, g2=null, px=null, im=null, obj=null, own=false, raf=0, last=0, yaw=0, pitch=.35, zoom=1, R=1, drag=null, spin=true;
  const make=()=>{ P=document.createElement('div'); P.id='inspp'; P.hidden=true;
    P.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;width:min(360px,92vw);padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
    P.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px"><b id="inspn" style="color:#f2c14e"></b><button id="inspx" style="font:inherit;color:#d8dae2;background:none;border:0;cursor:pointer">X</button></div>'+
      `<canvas id="inspc" width="${W}" height="${H}" style="display:block;width:100%;aspect-ratio:1;margin:8px 0;background:#15171e;cursor:grab;touch-action:none"></canvas><div id="inspi" style="display:flex;flex-wrap:wrap;gap:4px"></div>`+
      '<div style="color:#7d7a70;margin-top:8px">DRAG TO TURN · WHEEL TO ZOOM</div>';
    document.body.appendChild(P); cv=P.querySelector('#inspc'); g2=cv.getContext('2d'); im=g2.createImageData(W,H); px=new Uint8Array(W*H*4);
    P.querySelector('#inspx').onclick=()=>INSPECT.close();
    cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY}; spin=false; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; });
    cv.addEventListener('pointermove',e=>{ if(!drag)return; yaw+=(e.clientX-drag.x)*.012; pitch=Math.max(-1.3,Math.min(1.3,pitch+(e.clientY-drag.y)*.012)); drag={x:e.clientX,y:e.clientY}; });
    const up=()=>{ drag=null; cv.style.cursor='grab'; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    cv.addEventListener('wheel',e=>{ e.preventDefault(); zoom=Math.max(.5,Math.min(3,zoom*Math.exp(-e.deltaY*.0015))); },{passive:false});
    for(const t of ['keydown','keyup'])P.addEventListener(t,e=>e.stopPropagation());
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&INSPECT.on){ INSPECT.close(); e.stopImmediatePropagation(); } },true); };
  const chips=(id,extra)=>{ const L=[...(extra||[])], d=id&&ITEMS.def&&ITEMS.def(id);
    if(id&&INV.items&&INV.items[id]>0)L.push('YOU HAVE '+INV.items[id]);
    if(d){ if(d.value)L.push('$'+d.value); if(d.weight&&d.weight!==1)L.push(d.weight+' KG'); if(d.heals)L.push('HEALS '+Math.round(d.heals*100)+'%'); for(const [k,n] of [['edible','EDIBLE'],['burnable','BURNS'],['stackable','STACKS']])if(d[k])L.push(n);
      if(d.slot&&d.slot!=='none')L.push('WORN: '+d.slot.toUpperCase()); if(d.grants&&d.grants!=='none')L.push('GIVES: '+d.grants.toUpperCase()); }
    return L.map(t=>`<span style="background:#0e1016;border:2px solid #3a3f4e;padding:3px 6px">${esc(t)}</span>`).join(''); };
  // what INSPECT made is freed when it closes, geometry only (makers keep their materials cached, or mark their own ownMat); a part marked shared is the world's own
  const drop=()=>{ if(!obj)return; PIV.remove(obj); if(own)obj.traverse(c=>{ if(c.isInstancedMesh)c.dispose(); else if(c.geometry&&!c.userData.shared)c.geometry.dispose(); if(c.userData.ownMat&&c.material)c.material.dispose(); }); obj=null; };
  const shot=()=>{ if(!obj)return; if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; }
    PIV.rotation.set(pitch,yaw,0,'XYZ'); const d=R/Math.sin(cam.fov*Math.PI/360)*1.08/zoom; cam.position.set(0,0,d); cam.near=Math.max(.001,d-R*3); cam.far=d+R*3; cam.lookAt(0,0,0); cam.updateProjectionMatrix();
    renderer.getClearColor(CC); const ca=renderer.getClearAlpha(); renderer.setRenderTarget(rt); renderer.setClearColor(0x15171e,1); renderer.clear(); renderer.render(ROOM,cam); renderer.setRenderTarget(null); renderer.setClearColor(CC,ca);
    renderer.readRenderTargetPixels(rt,0,0,W,H,px); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); g2.putImageData(im,0,0); };
  const loop=t=>{ if(!INSPECT.on){ raf=0; return; } raf=requestAnimationFrame(loop); const dt=Math.min(.1,(t-(last||t))/1000); if(t-last<33)return; last=t; if(spin)yaw+=dt*.7; shot(); };
  // o: the thing to show; mine: INSPECT made it (dropped when closed), else it is shared with the world and only cloned
  INSPECT.open=(o,{name='',id=null,info=null,mine=false}={})=>{ if(!o)return false; if(!P)make(); drop();
    if(mine){ obj=o; own=true; } else { const s=new THREE.Vector3(); o.updateMatrixWorld(true); o.getWorldScale(s); obj=o.clone(); obj.position.set(0,0,0); obj.quaternion.identity(); obj.scale.copy(s); own=false; }
    obj.visible=true; obj.traverse(c=>{ c.visible=true; c.frustumCulled=false; }); PIV.add(obj); PIV.rotation.set(0,0,0); obj.updateMatrixWorld(true);
    BX.setFromObject(obj); if(BX.isEmpty())BX.set(new THREE.Vector3(-.5,-.5,-.5),new THREE.Vector3(.5,.5,.5)); BX.getBoundingSphere(SP); obj.position.sub(SP.center); R=Math.max(1e-3,SP.radius);
    yaw=-.6; pitch=.35; zoom=1; spin=true; P.querySelector('#inspn').textContent=(name||(id&&FORAGE.NM&&FORAGE.NM[id])||id||'').toUpperCase(); P.querySelector('#inspi').innerHTML=chips(id,info);
    P.hidden=false; INSPECT.on=true; INSPECT.id=id; if(!raf){ last=0; raf=requestAnimationFrame(loop); } return true; };
  INSPECT.close=()=>{ if(!P)return; P.hidden=true; INSPECT.on=false; INSPECT.id=null; drop(); };
    // for the families' makers: one material per colour, kept; a STALL-style recipe (MUSH, VEG) as meshes; simple shapes for the things with no model of their own
  const MATS=new Map(); INSPECT.mat=(c,{glow=0,flat=0,glass=0}={})=>{ const k=c+':'+glow+flat+glass; let m=MATS.get(k); if(!m){ m=glow?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c,flatShading:!!flat,side:THREE.DoubleSide,transparent:!!glass,opacity:glass?.55:1}); MATS.set(k,m); } return m; };
  const GG={ball:new THREE.IcosahedronGeometry(1,1),cap:new THREE.SphereGeometry(1,8,3,0,Math.PI*2,0,Math.PI/2),cone:new THREE.ConeGeometry(1,1,8),cyl:new THREE.CylinderGeometry(1,1,1,8),box:new THREE.BoxGeometry(1,1,1),tor:new THREE.TorusGeometry(1,.18,6,14),oct:new THREE.OctahedronGeometry(1,0)};
  for(const g of Object.values(GG))g.userData.keep=true;
  const part=(g,c,x,y,z,sx,sy,sz,rx=0,rz=0,glow=0,o={})=>{ const m=new THREE.Mesh(GG[g],INSPECT.mat(c,{glow,...o})); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.rotation.set(rx,0,rz); m.userData.shared=true; return m; };
  INSPECT.part=part;
  INSPECT.recipe=K=>{ const g=new THREE.Group(); let i=0; K.f((...a)=>g.add(part(...a)),K.s,0,()=>(i=(i*7+3)%10)/10); return g; };
  const B=(g,...a)=>{ g.add(part(...a)); return g; };
  INSPECT.shape=(kind,c=0x8a6a4a,c2=0xe8e0c8)=>{ const g=new THREE.Group();
    if(kind==='book'){ B(g,'box',c,0,0,0,.2,.05,.28); B(g,'box',c2,.006,0,0,.19,.042,.27); }
    else if(kind==='bottle'){ B(g,'cyl',c,0,.12,0,.06,.24,.06,0,0,0,{glass:1}); B(g,'cone',c,0,.27,0,.06,.06,.06,0,0,0,{glass:1}); B(g,'cyl',c,0,.33,0,.022,.08,.022,0,0,0,{glass:1}); B(g,'cyl',0x8a6a44,0,.38,0,.024,.04,.024); }
    else if(kind==='jar'){ B(g,'cyl',c,0,.09,0,.08,.18,.08,0,0,0,{glass:1}); B(g,'cyl',c2,0,.19,0,.084,.03,.084); }
    else if(kind==='sack'){ B(g,'ball',c,0,.1,0,.11,.11,.1); B(g,'cone',c,0,.22,0,.05,.08,.05); B(g,'tor',0x6a4a2a,0,.2,0,.035,.035,.035,Math.PI/2); }
    else if(kind==='packet'){ B(g,'box',c,0,.1,0,.14,.2,.02); B(g,'box',c2,0,.13,.011,.1,.08,.002); }
    else if(kind==='bowl'){ B(g,'cap',0xe8e2d4,0,.08,0,.13,.08,.13,Math.PI); B(g,'cyl',c,0,.075,0,.11,.01,.11); }
    else if(kind==='frame'){ B(g,'box',0x4a3424,0,0,0,.34,.26,.03); B(g,'box',c2,0,0,.012,.3,.22,.012); }
    else if(kind==='cage'){ B(g,'cyl',0x5a4a3a,0,.01,0,.16,.02,.16); B(g,'cap',0x8a7a5a,0,.32,0,.16,.1,.16); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; B(g,'cyl',0x8a7a5a,Math.cos(a)*.155,.17,Math.sin(a)*.155,.005,.3,.005); } B(g,'tor',0x8a7a5a,0,.43,0,.03,.03,.03,Math.PI/2); }
    else if(kind==='gadget'){ B(g,'box',c,0,0,0,.18,.08,.12); B(g,'cyl',c2,.1,0,0,.03,.05,.03,0,Math.PI/2,1); B(g,'box',0x222428,0,.042,0,.1,.004,.06); B(g,'cyl',0x3a3a40,-.04,-.08,0,.025,.12,.025); }
    else if(kind==='bouquet'){ B(g,'cone',c2,0,.12,0,.08,.26,.08,Math.PI); B(g,'cyl',0x3a7a2a,0,.3,0,.012,.16,.012); for(let i=0;i<7;i++){ const a=i*2.4, r=i?.06:0; B(g,'ball',Array.isArray(c)?c[i%c.length]:c,Math.cos(a)*r,.3+(i?0:.03),Math.sin(a)*r,.04,.035,.04); } }
    else if(kind==='goggles'){ for(const s of [-1,1])B(g,'tor',c,s*.055,0,0,.045,.045,.05,Math.PI/2*0); for(const s of [-1,1])B(g,'cyl',c2,s*.055,0,0,.04,.01,.04,Math.PI/2,0,0,{glass:1}); B(g,'tor',0x2a2a2e,0,0,-.08,.13,.13,.09,Math.PI/2); }
    else if(kind==='lamp'){ B(g,'tor',0x2a2a2e,0,0,0,.12,.12,.09,Math.PI/2); B(g,'cyl',c,0,0,.12,.05,.06,.05,Math.PI/2); B(g,'cyl',c2,0,0,.152,.042,.004,.042,Math.PI/2,0,1); }
    else if(kind==='coat'){ for(let i=0;i<9;i++){ const a=i*2.1, y=.05+i*.04; B(g,'ball',c,Math.cos(a)*.1,y,Math.sin(a)*.06,.09,.07,.08); } }
    else if(kind==='plate'){ B(g,'cap',c,0,.2,0,.17,.12,.11,Math.PI/2*0); B(g,'box',c,0,.1,0,.3,.2,.14); for(const s of [-1,1])B(g,'cap',c2,s*.19,.22,0,.08,.06,.08); }
    else if(kind==='lump'){ B(g,'ball',c,0,0,0,.1,.08,.09,0,0,0,{flat:1}); }
    else { B(g,'box',c,0,0,0,.3,.18,.22); for(const [w,d] of [[.31,.03],[.03,.23]])B(g,'box',c2,0,0,0,w,.185,d); }
    return g; };
  const parcel=()=>INSPECT.shape('parcel',0xb08a5a,0x6a4a2a);
  // a pack item: the first kind that knows its id makes it (each family registers in its own file); one that none knows is shown as a wrapped parcel
  INSPECT.model=id=>{ for(const k of INSPECT.kinds){ if(!k.is(id))continue; try{ const o=k.make(id); if(o)return o; }catch(e){ console.warn('INSPECT '+id,e); } } return parcel(); };
  INSPECT.item=id=>INSPECT.open(INSPECT.model(id),{id,mine:true});
  const ray=new THREE.Raycaster(), NDC=new THREE.Vector2(); let mx=-1, my=-1; addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY; },{passive:true});
  INSPECT.key=()=>{ if(INSPECT.on)return INSPECT.close(); let r=null; if(mx>=0&&SHARED.cam){ const b=renderer.domElement.getBoundingClientRect(); NDC.set((mx-b.left)/b.width*2-1,-((my-b.top)/b.height*2-1)); ray.setFromCamera(NDC,SHARED.cam); r=ray; }
    const h=GPH.inspectable&&GPH.inspectable(r); if(h)return INSPECT.open(h.obj,h);
    if(FORAGE.say)FORAGE.say('PICK SOMETHING UP OR POINT AT IT, THEN PRESS '+String(UI.keyOf?UI.keyOf('inspect'):'5').toUpperCase()+' TO LOOK IT OVER. YOUR PACK HAS A LOOK BUTTON TOO.','#9b9584'); };
  if(FORAGE.ROWB)FORAGE.ROWB.push(()=>[['LOOK','inspect']]); FORAGE.ACT&&(FORAGE.ACT.inspect=id=>INSPECT.item(id)); }
