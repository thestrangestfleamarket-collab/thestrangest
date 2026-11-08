// THE INSPECT WINDOW: INSPECT turns a thing over in a little studio window (drag to turn, wheel to zoom): what you hold or point at (the inspect key, 5), or anything in your pack (LOOK); each family of items says how it looks with INSPECT.kinds.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, GPH, INSPECT, INV, ITEMS, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
{ const W=320, H=320, esc=TEXT.esc;
  const ROOM=new THREE.Scene(), KEY=new THREE.DirectionalLight(0xfff4e2,1.9), FILL=new THREE.DirectionalLight(0xbcd0ff,.6), RIM=new THREE.DirectionalLight(0xffffff,.55), PIV=new THREE.Group();
  KEY.position.set(-3,4,4); FILL.position.set(4,1,-3); RIM.position.set(0,2,-5); ROOM.add(new THREE.AmbientLight(0xffffff,.18),KEY,FILL,RIM,PIV);
  let ENV=null; const makeEnv=()=>{ '@later'; const pm=new THREE.PMREMGenerator(renderer), s=new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(24,24,24),new THREE.MeshStandardMaterial({side:THREE.BackSide,color:0x2b3040,roughness:1})));
    const lite=(r,gn,b,x,y,z,sx,sy,sz)=>{ const mm=new THREE.MeshBasicMaterial(); mm.color.setRGB(r,gn,b); const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mm); m.position.set(x,y,z); s.add(m); };
    lite(7,6.6,6,-6,9,5,7,.1,7); lite(2.6,3,4,7,3,-6,6,6,.1); lite(1.6,1.7,2,0,-7,0,12,.1,12); lite(2.4,2.6,3,0,10,0,9,.1,9);
    try{ ENV=pm.fromScene(s,.04).texture; ROOM.environment=ENV; }catch(e){ console.warn('INSPECT env',e); }
    pm.dispose(); s.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material)o.material.dispose(); }); };
  const cam=new THREE.PerspectiveCamera(30,W/H,.01,100), CC=new THREE.Color(), BX=new THREE.Box3(), SP=new THREE.Sphere();
  let rt=null, P=null, cv=null, g2=null, px=null, im=null, obj=null, own=false, last=0, yaw=0, pitch=.35, zoom=1, R=1, drag=null, spin=true;
  const make=()=>{ '@later'; P=document.createElement('div'); P.id='inspp'; P.hidden=true;
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
  const chips=(id,extra)=>{ '@later'; const L=[...(extra||[])], d=id&&ITEMS.def&&ITEMS.def(id);
    if(id&&INV.items&&INV.items[id]>0)L.push('YOU HAVE '+INV.items[id]);
    if(d){ if(d.value)L.push('$'+d.value); if(d.weight&&d.weight!==1)L.push(d.weight+' KG'); if(d.heals)L.push('HEALS '+Math.round(d.heals*100)+'%'); for(const [k,n] of [['edible','EDIBLE'],['burnable','BURNS'],['stackable','STACKS']])if(d[k])L.push(n);
      if(d.slot&&d.slot!=='none')L.push('WORN: '+d.slot.toUpperCase()); if(d.grants&&d.grants!=='none')L.push('GIVES: '+d.grants.toUpperCase()); }
    return L.map(t=>`<span style="background:#0e1016;border:2px solid #3a3f4e;padding:3px 6px">${esc(t)}</span>`).join(''); };
  // what INSPECT made is freed when it closes, geometry only (makers keep their materials cached, or mark their own ownMat); a part marked shared is the world's own
  const drop=()=>{ if(!obj)return; PIV.remove(obj); if(own)obj.traverse(c=>{ if(c.isInstancedMesh)c.dispose(); else if(c.geometry&&!c.userData.shared)c.geometry.dispose(); if(c.userData.ownMat&&c.material)c.material.dispose(); }); obj=null; };
  const shot=()=>{ '@later'; if(!obj)return; if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; } if(!ENV)makeEnv();
    PIV.rotation.set(pitch,yaw,0,'XYZ'); const d=R/Math.sin(cam.fov*Math.PI/360)*1.08/zoom; cam.position.set(0,0,d); cam.near=Math.max(.001,d-R*3); cam.far=d+R*3; cam.lookAt(0,0,0); cam.updateProjectionMatrix();
    renderer.getClearColor(CC); const ca=renderer.getClearAlpha(), tm=renderer.toneMapping, te=renderer.toneMappingExposure; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15; renderer.setRenderTarget(rt); renderer.setClearColor(0x14161d,1); renderer.clear(); renderer.render(ROOM,cam); renderer.setRenderTarget(null); renderer.setClearColor(CC,ca); renderer.toneMapping=tm; renderer.toneMappingExposure=te;
    renderer.readRenderTargetPixels(rt,0,0,W,H,px); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); g2.putImageData(im,0,0); };
  const loop=t=>{ if(!INSPECT.on)return; const dt=Math.min(.1,(t-(last||t))/1000); if(t-last<33)return; last=t; if(spin)yaw+=dt*.7; shot(); }; SYS.add('win',loop,'150cy-inspect');
  // o: the thing to show; mine: INSPECT made it (dropped when closed), else it is shared with the world and only cloned
  INSPECT.open=(o,{name='',id=null,info=null,mine=false}={})=>{ '@later'; if(!o)return false; if(!P)make(); drop();
    if(mine){ obj=o; own=true; } else { const s=new THREE.Vector3(); o.updateMatrixWorld(true); o.getWorldScale(s); obj=o.clone(); obj.position.set(0,0,0); obj.quaternion.identity(); obj.scale.copy(s); own=false; }
    obj.visible=true; obj.traverse(c=>{ c.visible=true; c.frustumCulled=false; }); PIV.add(obj); PIV.rotation.set(0,0,0); obj.updateMatrixWorld(true);
    BX.setFromObject(obj); if(BX.isEmpty())BX.set(new THREE.Vector3(-.5,-.5,-.5),new THREE.Vector3(.5,.5,.5)); BX.getBoundingSphere(SP); obj.position.sub(SP.center); R=Math.max(1e-3,SP.radius);
    yaw=-.6; pitch=.35; zoom=1; spin=true; P.querySelector('#inspn').textContent=(name||(id&&FORAGE.NM&&FORAGE.NM[id])||id||'').toUpperCase(); P.querySelector('#inspi').innerHTML=chips(id,info);
    P.hidden=false; INSPECT.on=true; INSPECT.id=id; last=0; return true; };
  INSPECT.close=()=>{ if(!P)return; P.hidden=true; INSPECT.on=false; INSPECT.id=null; drop(); };
    // for the families' makers: one material per colour, kept; a STALL-style recipe (MUSH, VEG) as meshes; simple shapes for the things with no model of their own
  const MATS=new Map(), KINDS={ metal:{m:1,r:.32}, steel:{m:1,r:.14}, chrome:{m:1,r:.08}, iron:{m:1,r:.45}, gold:{m:1,r:.28}, brass:{m:1,r:.3}, copper:{m:1,r:.34}, tin:{m:1,r:.22}, wood:{r:.72}, bark:{r:.92,flat:1}, stone:{r:.9}, rock:{r:.95,flat:1}, ceramic:{r:.35,cc:.4}, clay:{r:.8}, food:{r:.58}, bread:{r:.72}, meat:{r:.5,cc:.25,ccr:.4}, fruit:{r:.45,cc:.3,ccr:.5}, cloth:{r:.96,sh:.5}, leather:{r:.68}, paper:{r:.85}, plastic:{r:.4,cc:.45,ccr:.2}, rubber:{r:.9}, wax:{r:.4,cc:.5,ccr:.3}, skin:{r:.55,cc:.15}, wet:{r:.18,cc:.6,ccr:.1}, leaf:{r:.5,sh:.6}, bone:{r:.6}, default:{r:.55} };
  INSPECT.mat=(c,o={})=>{ '@later'; if(o.glow){ const gk='g'+c+(o.ei||''); let gm=MATS.get(gk); if(!gm){ gm=new THREE.MeshBasicMaterial({color:c,toneMapped:false}); MATS.set(gk,gm); } return gm; }
    const kind=o.kind||(o.glass?'glass':o.gem?'gem':'default'), base=KINDS[kind]||KINDS.default, glassy=kind==='glass'||kind==='gem';
    const key=c+'|'+kind+'|'+(o.flat?1:0)+'|'+(o.rough??'')+'|'+(o.metal??'')+'|'+(o.emissive??'')+'|'+(o.ei??''); let m=MATS.get(key);
    if(!m){ const P={color:c,side:THREE.DoubleSide,flatShading:!!(o.flat||base.flat),roughness:o.rough!=null?o.rough:(base.r!=null?base.r:.55),metalness:o.metal!=null?o.metal:(base.m||0)};
      if(o.emissive!=null){ P.emissive=o.emissive; P.emissiveIntensity=o.ei!=null?o.ei:1; }
      if(glassy){ P.metalness=0; P.transmission=kind==='gem'?.9:1; P.roughness=o.rough!=null?o.rough:(kind==='gem'?.04:.05); P.ior=kind==='gem'?2.1:1.46; P.thickness=kind==='gem'?.5:.35; P.transparent=true; P.specularIntensity=1; if(kind==='gem')P.clearcoat=.7; m=new THREE.MeshPhysicalMaterial(P); }
      else if(base.cc!=null||base.sh!=null){ if(base.cc!=null){ P.clearcoat=base.cc; P.clearcoatRoughness=base.ccr!=null?base.ccr:.3; } if(base.sh!=null)P.sheen=base.sh; m=new THREE.MeshPhysicalMaterial(P); }
      else m=new THREE.MeshStandardMaterial(P);
      m.envMapIntensity=glassy?1.5:1; MATS.set(key,m); } return m; };
  const GG={ball:new THREE.IcosahedronGeometry(1,3),cap:new THREE.SphereGeometry(1,24,8,0,Math.PI*2,0,Math.PI/2),cone:new THREE.ConeGeometry(1,1,24),cyl:new THREE.CylinderGeometry(1,1,1,24),box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,24,16),tor:new THREE.TorusGeometry(1,.18,14,32),oct:new THREE.OctahedronGeometry(1,0),ico:new THREE.IcosahedronGeometry(1,0),dod:new THREE.DodecahedronGeometry(1,0)};
  for(const g of Object.values(GG))g.userData.keep=true;
  const part=(g,c,x,y,z,sx,sy,sz,rx=0,rz=0,glow=0,o={})=>{ const m=new THREE.Mesh(GG[g],INSPECT.mat(c,{glow,...o})); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.rotation.set(rx,0,rz); m.userData.shared=true; return m; };
  INSPECT.part=part;
  INSPECT.recipe=K=>{ const g=new THREE.Group(); let i=0; K.f((...a)=>g.add(part(...a)),K.s,0,()=>(i=(i*7+3)%10)/10); return g; };
  const B=(g,...a)=>{ g.add(part(...a)); return g; };
  INSPECT.shape=(kind,c=0x8a6a4a,c2=0xe8e0c8)=>{ '@later'; const g=new THREE.Group();
    if(kind==='book'){ B(g,'box',c,0,0,0,.2,.052,.28,0,0,0,{kind:'leather'}); B(g,'box',c2,.01,0,0,.188,.044,.27,0,0,0,{kind:'paper'}); B(g,'box',c,-.098,0,0,.014,.058,.286,0,0,0,{kind:'leather'}); B(g,'box',0xcbb27a,.06,0,.146,.02,.03,.004,0,0,0,{kind:'gold',metal:1,rough:.3}); }
    else if(kind==='bottle'){ B(g,'cyl',c,0,.08,0,.05,.15,.05,0,0,0,{kind:'wet'}); B(g,'cyl',0xdfeee8,0,.12,0,.062,.24,.062,0,0,0,{glass:1}); B(g,'cone',0xdfeee8,0,.265,0,.062,.07,.062,0,0,0,{glass:1}); B(g,'cyl',0xdfeee8,0,.33,0,.023,.08,.023,0,0,0,{glass:1}); B(g,'cyl',0x8a6a44,0,.385,0,.026,.045,.026,0,0,0,{kind:'wood'}); }
    else if(kind==='jar'){ B(g,'cyl',c,0,.07,0,.07,.13,.07,0,0,0,{kind:'wet'}); B(g,'cyl',0xe6f0ec,0,.09,0,.08,.18,.08,0,0,0,{glass:1}); B(g,'cyl',c2,0,.195,0,.086,.035,.086,0,0,0,{kind:'metal',metal:1,rough:.35}); B(g,'tor',c2,0,.178,0,.08,.08,.025,Math.PI/2,0,0,{kind:'metal',metal:1,rough:.35}); }
    else if(kind==='sack'){ B(g,'ball',c,0,.1,0,.12,.11,.11,0,0,0,{kind:'cloth'}); B(g,'ball',c,.05,.14,.03,.07,.07,.07,0,0,0,{kind:'cloth'}); B(g,'cone',c,0,.22,0,.055,.09,.055,0,0,0,{kind:'cloth'}); B(g,'tor',0x6a4a2a,0,.2,0,.04,.04,.03,Math.PI/2,0,0,{kind:'leather'}); }
    else if(kind==='packet'){ B(g,'box',c,0,.1,0,.14,.2,.025,0,0,0,{kind:'paper'}); B(g,'box',c2,0,.13,.014,.1,.08,.002,0,0,0,{kind:'paper'}); for(const s of [-1,1])B(g,'box',c,0,.198,0,.14,.016,.028,0,s*.5,0,{kind:'paper'}); }
    else if(kind==='bowl'){ B(g,'cap',0xe8e2d4,0,.09,0,.14,.1,.14,Math.PI,0,0,{kind:'ceramic'}); B(g,'tor',0xe0d8c4,0,.092,0,.14,.14,.014,Math.PI/2,0,0,{kind:'ceramic'}); B(g,'cap',c,0,.05,0,.11,.055,.11,0,0,0,{kind:'food'}); }
    else if(kind==='frame'){ B(g,'box',0x5a3e26,0,0,0,.34,.26,.03,0,0,0,{kind:'wood'}); B(g,'box',0x3a2818,0,0,.005,.3,.22,.026,0,0,0,{kind:'wood'}); B(g,'box',c2,0,0,.018,.28,.2,.006,0,0,0,{kind:'paper'}); B(g,'box',0xdfeee8,0,0,.024,.28,.2,.004,0,0,0,{glass:1}); }
    else if(kind==='cage'){ B(g,'cyl',0x5a4a3a,0,.01,0,.16,.025,.16,0,0,0,{kind:'wood'}); B(g,'cap',0x9a8a6a,0,.33,0,.16,.11,.16,0,0,0,{kind:'metal',metal:1,rough:.4}); for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; B(g,'cyl',0xa89868,Math.cos(a)*.155,.17,Math.sin(a)*.155,.006,.3,.006,0,0,0,{kind:'metal',metal:1,rough:.35}); } B(g,'tor',0xa89868,0,.17,0,.155,.155,.012,Math.PI/2,0,0,{kind:'metal',metal:1,rough:.35}); B(g,'tor',0xa89868,0,.44,0,.03,.03,.012,Math.PI/2,0,0,{kind:'metal',metal:1,rough:.3}); }
    else if(kind==='gadget'){ B(g,'box',c,0,0,0,.18,.08,.12,0,0,0,{kind:'plastic'}); B(g,'cyl',0xc8ccd2,.1,0,0,.032,.05,.032,0,Math.PI/2,0,{kind:'chrome',metal:1,rough:.1}); B(g,'box',0x16181c,0,.042,0,.1,.006,.06,0,0,0,{kind:'glass'}); B(g,'cyl',0x3a3a40,-.04,-.08,0,.025,.12,.025,0,0,0,{kind:'rubber'}); B(g,'ball',0xffcf4a,.06,.045,.04,.012,.008,.012,0,0,1); }
    else if(kind==='bouquet'){ B(g,'cone',c2,0,.12,0,.08,.26,.08,Math.PI,0,0,{kind:'paper'}); for(let i=0;i<7;i++){ const a=i*2.4, r=i?.06:0; B(g,'cyl',0x3a7a2a,Math.cos(a)*r,.28,Math.sin(a)*r,.01,.18,.01,0,0,0,{kind:'leaf'}); B(g,'ball',Array.isArray(c)?c[i%c.length]:c,Math.cos(a)*r,.4+(i?0:.03),Math.sin(a)*r,.045,.04,.045,0,0,0,{kind:'wax'}); } }
    else if(kind==='goggles'){ for(const s of [-1,1]){ B(g,'tor',0x4a4e58,s*.052,0,.012,.05,.05,.015,0,0,0,{kind:'metal',metal:1,rough:.28}); B(g,'cyl',c2,s*.052,0,.016,.044,.01,.044,Math.PI/2,0,0,{glass:1}); } B(g,'box',0x4a4e58,0,0,.012,.028,.022,.022,0,0,0,{kind:'metal',metal:1,rough:.3}); B(g,'tor',0x2a2a30,0,0,-.03,.11,.08,.045,Math.PI/2,0,0,{kind:'rubber'}); }
    else if(kind==='lamp'){ B(g,'tor',0x2a2a2e,0,0,0,.12,.12,.04,Math.PI/2,0,0,{kind:'metal',metal:1,rough:.4}); B(g,'cyl',0x3a3a40,0,0,.1,.055,.04,.055,Math.PI/2,0,0,{kind:'metal',metal:1,rough:.3}); B(g,'cap',0xcfe8ff,0,0,.14,.05,.05,.05,-Math.PI/2,0,0,{glass:1}); B(g,'ball',c2,0,0,.13,.03,.03,.03,0,0,1); }
    else if(kind==='coat'){ for(let i=0;i<9;i++){ const a=i*2.1, y=.05+i*.04; B(g,'ball',c,Math.cos(a)*.1,y,Math.sin(a)*.06,.095,.075,.085,0,0,0,{kind:'cloth'}); } for(let i=0;i<4;i++)B(g,'ball',0xe8e2d4,Math.cos(i*2.1)*.1,.08+i*.09,Math.sin(i*2.1)*.06+.06,.016,.016,.016,0,0,0,{kind:'metal',metal:1,rough:.25}); }
    else if(kind==='plate'){ B(g,'box',c,0,.1,0,.3,.2,.14,0,0,0,{kind:'meat'}); B(g,'cap',c,0,.2,0,.17,.12,.11,0,0,0,{kind:'meat'}); for(const s of [-1,1])B(g,'cap',c2,s*.19,.22,0,.08,.06,.08,0,0,0,{kind:'bread'}); }
    else if(kind==='lump'){ B(g,'ball',c,0,0,0,.1,.08,.09,0,0,0,{kind:'food'}); B(g,'ball',c,.04,.03,.02,.05,.045,.05,0,0,0,{kind:'food'}); }
    else { B(g,'box',c,0,0,0,.3,.18,.22,0,0,0,{kind:'paper'}); for(const [w,d] of [[.31,.025],[.025,.23]])B(g,'box',0x8a6a44,0,0,0,w,.188,d,0,0,0,{kind:'leather'}); B(g,'tor',0x8a6a44,0,.095,0,.04,.04,.02,0,0,0,{kind:'leather'}); }
    return g; };
  const parcel=()=>INSPECT.shape('parcel',0xb08a5a,0x6a4a2a);
  // a pack item: the first kind that knows its id makes it (each family registers in its own file); one that none knows is shown as a wrapped parcel
  INSPECT.model=id=>{ for(const k of INSPECT.kinds){ if(!k.is(id))continue; try{ const o=k.make(id); if(o)return o; }catch(e){ console.warn('INSPECT '+id,e); } } return parcel(); };
  INSPECT.has=id=>INSPECT.kinds.some(k=>{ try{ return !!k.is(id); }catch(e){ return false; } });   // a model of its own (not the parcel)
  INSPECT.item=id=>INSPECT.open(INSPECT.model(id),{id,mine:true});
  const ray=new THREE.Raycaster(), NDC=new THREE.Vector2(); let mx=-1, my=-1; addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY; },{passive:true});
  INSPECT.key=()=>{ '@later'; if(INSPECT.on)return INSPECT.close(); let r=null; if(mx>=0&&SHARED.cam){ const b=renderer.domElement.getBoundingClientRect(); NDC.set((mx-b.left)/b.width*2-1,-((my-b.top)/b.height*2-1)); ray.setFromCamera(NDC,SHARED.cam); r=ray; }
    const h=GPH.inspectable&&GPH.inspectable(r); if(h)return INSPECT.open(h.obj,h);
    SAY('PICK SOMETHING UP OR POINT AT IT, THEN PRESS '+String(UI.keyOf?UI.keyOf('inspect'):'5').toUpperCase()+' TO LOOK IT OVER. YOUR PACK HAS A LOOK BUTTON TOO.','#9b9584'); };
  if(FORAGE.ROWB)FORAGE.ROWB.push(()=>[['LOOK','inspect']]); FORAGE.ACT&&(FORAGE.ACT.inspect=id=>INSPECT.item(id)); }
