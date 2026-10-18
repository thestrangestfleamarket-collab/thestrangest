// ---- THE AVATAR'S STUDIO (owner, 18 Oct 2026: "avatar should not be in game when editing. pull into empty void. full 360 rotate and tilt, full
// editing. very minimal and inituive GUI"): while the avatar editor is open the camera sees only him (his pieces and the editor's highlight on
// layer 7, the camera on that layer alone: the world, the sky, the weather, the people all out of the picture, nothing moved or unbuilt) against a
// plain dark void, no fog. Its own camera (the perspective one) orbits his middle: a drag anywhere off him turns him all the way round and tilts
// from under his feet to over his head, the wheel brings him near or far, a double click off him puts the view back before him. Every editing
// press on him (sculpt, pose, pieces) works as before (they pick through whichever camera is drawing). Lit by the studio's own two lights (a sky
// and a sun over the camera's shoulder, the standalone editor's: avatar-pre.js), on layer 7 only, so the world's lamps and sun don't reach him
// here and the studio's never reach the world. Closed, the game's own view and background come back.
// Cost: nothing while closed; open, only his triangles drawn, two lights (his programs made once more for them, the first time it opens)
const STUDIO={on:false};
{ let yaw=0, pitch=.12, dist=3, D0=3; const BG=new THREE.Color(0x14161c), TG=new THREE.Vector3(), L=7; let bg0=null;
  const hemi=new THREE.HemisphereLight(0xdfe6ff,0x3a3428,.9), key=new THREE.DirectionalLight(0xfff1dc,2.4); hemi.layers.set(L); key.layers.set(L); key.visible=hemi.visible=false;
  scene.add(hemi,key,key.target);
  const hint=document.createElement('div'); hint.id='sthint'; hint.hidden=true; hint.textContent='DRAG TO TURN AND TILT · WHEEL TO ZOOM · DOUBLE-CLICK TO RESET';
  hint.style.cssText='position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));font:11px var(--pixel,monospace);color:var(--dim,#8a8f9c);letter-spacing:1px;z-index:20;pointer-events:none';
  document.body.appendChild(hint);
  const tag=()=>{ W3.group.traverse(o=>o.layers.enable(L)); if(ED.selMesh)ED.selMesh.layers.enable(L); };
  const front=()=>{ yaw=heading; pitch=.12; dist=D0=2.7*(W3.SZ||1); };
  STUDIO.enter=()=>{ if(STUDIO.on)return; STUDIO.on=true; bg0=scene.background; key.visible=hemi.visible=true; tag(); front(); hint.hidden=false; };
  STUDIO.exit=()=>{ if(!STUDIO.on)return; STUDIO.on=false; PCAM.layers.set(0); PCAM.clearViewOffset(); key.visible=hemi.visible=false; if(bg0)scene.background=bg0; W3.uSelf.value=W3.selfOff?1:1-W3.shade.depth*.55; hint.hidden=true; };
  // the camera, last in the view's work each frame (as the drone's: drone.js)
  const vb=UI.view3b; UI.view3b=a=>{ if(!STUDIO.on)return vb(a); tag(); cam=PCAM; if(RPASS)RPASS.camera=cam; if(Math.abs(PCAM.aspect-RW/RH)>1e-3){ PCAM.aspect=RW/RH; PCAM.updateProjectionMatrix(); }
    PCAM.layers.set(L); W3.group.visible=true;
    const pw=(document.getElementById('av')?.offsetWidth||0)*RW/innerWidth*.5; PCAM.setViewOffset(RW,RH,pw,0,RW,RH);   // (him in the middle of what the panel leaves)
    TG.set(pos.x,py+.95*(W3.SZ||1),pos.z); const c=Math.cos(pitch);
    cam.position.set(TG.x+Math.sin(yaw)*c*dist,TG.y+Math.sin(pitch)*dist,TG.z+Math.cos(yaw)*c*dist); cam.up.set(0,1,0); cam.lookAt(TG); cam.updateMatrixWorld();
    key.position.set(TG.x+Math.sin(yaw+.7)*4,TG.y+5,TG.z+Math.cos(yaw+.7)*4); key.target.position.copy(TG); key.target.updateMatrixWorld();
    W3.uSelf.value=1; scene.fog=null; scene.background=BG.setHex(0x14161c); };   // (no SELF here: his own shadow is from the world's light, not the studio's) (set afresh: the sky's and the mist's ticks copy into whatever colour the background is)
  // the void, after the sky, the mist and the weather have had their say this frame
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); if(STUDIO.on){ scene.fog=null; scene.background=BG.setHex(0x14161c); } };
  // turning and tilting: every drag the editor hands the view (off him, or on the avatar tab) turns him round, all the way, and tilts
  const o0=UI.orbit, p0=UI.pan;
  UI.orbit=(dx,dy)=>{ if(!STUDIO.on)return o0(dx,dy); yaw-=dx*.01; pitch=Math.max(-1.5,Math.min(1.5,pitch+dy*.008)); };
  UI.pan=(dx,dy)=>STUDIO.on?UI.orbit(dx,dy):p0(dx,dy);
  const cv=renderer.domElement;
  cv.addEventListener('wheel',e=>{ if(!STUDIO.on)return; e.preventDefault(); e.stopImmediatePropagation(); dist=Math.max(.35*D0,Math.min(4*D0,dist*Math.exp(e.deltaY*.0012))); },{capture:true,passive:false});
  cv.addEventListener('dblclick',e=>{ if(STUDIO.on){ e.stopImmediatePropagation(); front(); } },{capture:true});
  // with the avatar editor: in as it opens, out as it closes (HIS SHAPE's own tabs, opened from it, stay in the studio)
  const ao=AV.open; AV.open=t=>{ ao(t); STUDIO.enter(); };
  const ex=ED.exit; ED.exit=()=>{ STUDIO.exit(); ex(); };
  window.STUDIODBG=()=>({on:STUDIO.on,yaw,pitch,dist});
  window.STUDIOTURN=(y,p,d)=>{ yaw=y; if(p!=null)pitch=p; if(d!=null)dist=d; };   // (a test's)
}
