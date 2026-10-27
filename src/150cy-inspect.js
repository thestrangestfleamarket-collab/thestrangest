// THE INSPECT WINDOW: INSPECT turns a thing over in a little studio window (drag to turn, wheel to zoom): what you hold or point at (the inspect key, 5), or anything in your pack (LOOK); each family of items says how it looks with INSPECT.kinds.
import {THREE} from './003-shx.js';
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
      '<div style="color:#7d7a70;margin-top:8px">DRAG TO TURN · WHEEL TO ZOOM · ESC CLOSES</div>';
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
    if(d){ if(d.value)L.push('$'+d.value); if(d.weight&&d.weight!==1)L.push(d.weight+' KG'); for(const [k,n] of [['edible','EDIBLE'],['burnable','BURNS'],['stackable','STACKS']])if(d[k])L.push(n);
      if(d.slot&&d.slot!=='none')L.push('WORN: '+d.slot.toUpperCase()); if(d.grants&&d.grants!=='none')L.push('GIVES: '+d.grants.toUpperCase()); }
    return L.map(t=>`<span style="background:#0e1016;border:2px solid #3a3f4e;padding:3px 6px">${esc(t)}</span>`).join(''); };
  const drop=()=>{ if(!obj)return; PIV.remove(obj); if(own)obj.traverse(c=>{ if(c.geometry)c.geometry.dispose(); const ms=Array.isArray(c.material)?c.material:c.material?[c.material]:[]; for(const m of ms){ if(m.map&&m.map.isCanvasTexture)m.map.dispose(); m.dispose(); } }); obj=null; };
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
  // a pack item: the first kind that knows its id makes it (each family registers in its own file); one that none knows is shown as a wrapped parcel
  const parcel=()=>{ const g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:0xb08a5a}), t=new THREE.MeshLambertMaterial({color:0x6a4a2a});
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.3,.18,.22),m)); for(const [w,d] of [[.31,.03],[.03,.23]])g.add(new THREE.Mesh(new THREE.BoxGeometry(w,.185,d),t)); return g; };
  INSPECT.model=id=>{ for(const k of INSPECT.kinds){ if(!k.is(id))continue; try{ const o=k.make(id); if(o)return o; }catch(e){ console.warn('INSPECT '+id,e); } } return parcel(); };
  INSPECT.item=id=>INSPECT.open(INSPECT.model(id),{id,mine:true});
  INSPECT.key=()=>{ if(INSPECT.on)return INSPECT.close(); const h=GPH.inspectable&&GPH.inspectable(); if(h)return INSPECT.open(h.obj,h);
    if(FORAGE.say)FORAGE.say('PICK SOMETHING UP OR POINT AT IT, THEN PRESS '+String(UI.keyOf?UI.keyOf('inspect'):'5').toUpperCase()+' TO LOOK IT OVER. YOUR PACK HAS A LOOK BUTTON TOO.','#9b9584'); };
  if(FORAGE.ROWB)FORAGE.ROWB.push(()=>[['LOOK','inspect']]); FORAGE.ACT&&(FORAGE.ACT.inspect=id=>INSPECT.item(id)); }
