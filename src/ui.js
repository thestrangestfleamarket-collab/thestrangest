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
    ['view','change the view (map, third person, behind, first person, isometric)'],['rot','turn the view a quarter (four angles)'],['j','punch'],['k','kick'],['r','roll'],['v','wave'],['f','fall'],['q','turn left'],['e','turn right'],['z','tilt down'],['x','tilt up'],['0','reset the view'],
    ['c','free camera'],['g','fly (through walls)'],['=','sharper'],['-','coarser'],['h','hide the help']];
  const NAME=k=>k===' '?'SPACE':k.length===1?k.toUpperCase():k.toUpperCase();
  let BIND={}; try{ BIND=JSON.parse(localStorage.getItem('market-keys')||'{}')||{}; }catch(e){}
  const DEF={view:'v',v:'b',rot:'r',r:'y'},   /* (R turns the view, owner 17 Oct 2026; so the roll's on Y) */ keyOf=a=>BIND[a]??DEF[a]??a,   /* (V changes the view, owner 17 Oct 2026; so the wave's on B) */ rev=()=>{ const r={}; for(const [a] of ACTS)r[keyOf(a)]=a; return r; };
  let REV=rev(), waiting=null;
  // a pressed key to the action the game's code knows (null: not for the game: the menu has it, or a key moved to another action)
  UI.key=e=>{ const raw=e.key.toLowerCase();
    if(waiting){ if(raw!=='escape'){ const old=keyOf(waiting); for(const [a] of ACTS)if(a!==waiting&&keyOf(a)===raw)BIND[a]=old; BIND[waiting]=raw;   // (the key it had goes to the other action)
        try{ localStorage.setItem('market-keys',JSON.stringify(BIND)); }catch(err){} REV=rev(); } waiting=null; drawKeys(); e.preventDefault(); return null; }
    if(raw==='escape'){ if(e.type==='keydown'){ if(ED.on)ED.exit(); else if(WE.on)WE.toggle(); else toggleMenu(); } return null; }
    if(e.target&&/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName))return null;   // (typing in a box isn't walking)
    if(raw==='?'){ if(e.type==='keydown'&&!e.repeat)UI.moves(); return null; }   // (? : every action and move he has, with its key: below)
    if(raw==='m'&&e.shiftKey&&!ED.on){ if(e.type==='keydown'&&!e.repeat)MAPED.toggle(); return null; }   // (Shift+M: the map editor, src/mapedit.js)
    if(raw==='e'&&e.shiftKey&&!ED.on&&!UI.menuOpen){ if(e.type==='keydown'&&!e.repeat)WE.toggle(); return null; }   // (Shift+E: edit the world, src/worldedit.js)
    // (isometric: Q / E / R turn it a quarter, before any key of his own choosing: owner 17 Oct 2026, Q / E were changing the view instead)
    if(UI.view==='iso'&&!ED.on&&(raw==='q'||raw==='e'||raw==='r')){ if(e.type==='keydown'&&!e.repeat){ yawTo+=raw==='q'?Math.PI/2:-Math.PI/2; yaw=yawTo; } return null; }   /* (straight to the next angle, no turning: owner, 17 Oct 2026, "q/e should automatically show up at the next angle (jump to) not rotate") */
    if(UI.menuOpen)return null;
    if(ED.on){ const a=REV[raw]; return ['q','e','z','x','0','=','-'].includes(a)?a:null; }   // (shaping him: only the view's keys)
    const act=REV[raw]; if(act!==undefined){ if(e.type==='keydown'&&!e.repeat){ if(act==='c')setFree(!UI.freeCam); if(act==='g')setFly(!UI.fly); if(act==='view'){ const V=['iso','follow','first'];   /* (owner, 17 Oct 2026: isometric first, behind second, first person third; map and third person in DISPLAY) */ UI.setView(V[(V.indexOf(UI.view)+1)%V.length]); } if(act==='rot')UI.turn4(); } return act==='view'||act==='rot'?null:act; }
    return ACTS.some(([a])=>a===raw)?'':raw; };   // (a default key now given to nothing)
  // ---- WHAT HE CAN DO (owner, 17 Oct 2026: "pressing ? should give me list of all possible actions and moves for my player"): a panel listing
  // every key's action (as KEYS has them now, his own choice of keys included), the fighting moves and what chains from each, his own made
  // moves (HIS SHAPE's ANIMATE), and what the mouse does; ? or Escape closes it
  { const P=document.createElement('div'); P.id='movesp'; P.style.cssText='position:fixed;inset:6% 10%;z-index:20;display:none;overflow:auto;padding:16px 20px;background:#0b0d13f2;border:2px solid #2a3040;color:#c9ccd6;font:11px Silkscreen,monospace;letter-spacing:1px;line-height:1.9';
    document.body.appendChild(P);
    UI.moves=()=>{ if(P.style.display!=='none'){ P.style.display='none'; return; }
      const row=(k,t)=>'<div style="display:flex;gap:14px"><b style="min-width:120px;color:#f2c14e">'+k+'</b><span>'+t+'</span></div>', h=t=>'<div style="margin:12px 0 4px;color:#8a8f9c">'+t+'</div>';
      let o='<div style="display:flex;justify-content:space-between"><b>WHAT YOU CAN DO</b><span style="color:#8a8f9c">? OR ESC CLOSES</span></div>'+h('KEYS (CHANGE THEM IN THE MENU\'S KEYS)');
      for(const [a,what] of ACTS)o+=row(NAME(keyOf(a)),what.toUpperCase());
      o+=row('N','NOON / 7 PM')+row('SHIFT + E','EDIT THE WORLD')+row('SHIFT + M','MAP EDITOR: MOVE THE PLACES AND THE LAND')+row('ESC','THE MENU')+row('?','THIS LIST');
      const M=RIG.MOVES||{}, fights=Object.keys(M).filter(n=>M[n]&&M[n].combo);
      if(fights.length){ o+=h('FIGHTING: J PUNCH, K KICK; PRESS AGAIN IN TIME TO CHAIN'); for(const n of fights){ const c=M[n].combo; o+=row(n.replace(/([A-Z])/g,' $1').toUpperCase(),Object.entries(c).map(([k,v])=>k+' → '+v.replace(/([A-Z])/g,' $1').toUpperCase()).join(' · ')); } }
      const K=RIG.KEYMOVE||{}; if(Object.keys(K).length){ o+=h('YOUR OWN MOVES (HIS SHAPE → ANIMATE)'); for(const [k,n] of Object.entries(K))o+=row(k,n.toUpperCase()); }
      o+=h('THE MOUSE')+row('DOUBLE CLICK','WALK THERE (RUN IF FAR) · ON A SEAT: SIT · A LAMP: ON / OFF · A FRIDGE: OPEN · THE DRINKS MACHINE: A CAN · THE RADIO: MUSIC · A CHARACTER: GO UP AND GREET · YOURSELF: YOUR LOOKS · THE GUITARIST: WATCH HIS HANDS')
        +row('LEFT DRAG','MOVE THE VIEW (ISOMETRIC, MAP) · LOOK ROUND (THIRD PERSON, BEHIND, FIRST)')+row('RIGHT DRAG','TURN THE VIEW')+row('WHEEL','ZOOM');
      P.innerHTML=o; P.style.display='block'; };
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&P.style.display!=='none'){ P.style.display='none'; e.stopImmediatePropagation(); } },true); }
  // ---- FREE CAMERA and FLY
  const badge=document.createElement('div'); badge.id='mode'; document.body.appendChild(badge);
  const drawBadge=()=>{ const m=[UI.freeCam&&'FREE CAMERA: '+NAME(keyOf('c'))+' to go back',UI.fly&&'FLY: '+NAME(keyOf('g'))+' to land'].filter(Boolean); badge.textContent=m.join(' · '); badge.hidden=!m.length; };
  function setFree(on){ UI.freeCam=on; if(on)UI.camT.copy(disp); drawBadge(); }   // (from where the view is)
  function setFly(on){ UI.fly=on; if(on){ target=null; } drawBadge(); }
  UI.setFly=setFly; UI.setFree=setFree;
  UI.camStep=(dt,a,up,dn,lf,rt)=>{ if(!UI.freeCam||UI.menuOpen)return; const fx=-Math.sin(a), fz=-Math.cos(a), s=dt*9*PPU/Math.max(4,ppu);   // (as fast across the screen at any zoom)
    let mx=0,mz=0; if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;} const n=Math.hypot(mx,mz)||1;
    UI.camT.x+=mx/n*s; UI.camT.z+=mz/n*s; UI.camT.y+=((keys.has(' ')?1:0)-(keys.has('shift')&&!L?1:0))*s*.7;   // (Shift sinks it, but not while it's held to slide the view)
    UI.camT.x=Math.max(BOUND.x0,Math.min(BOUND.x1,UI.camT.x)); UI.camT.z=Math.max(BOUND.z0,Math.min(BOUND.z1,UI.camT.z)); UI.camT.y=Math.max(-12,Math.min(30,UI.camT.y)); };
  UI.flyStep=dt=>{ py+=((keys.has(' ')?1:0)-(keys.has('shift')?1:0))*dt*4; py=Math.max(-5,Math.min(10,py)); pos.x=Math.max(BOUND.x0,Math.min(BOUND.x1,pos.x)); pos.z=Math.max(BOUND.z0,Math.min(BOUND.z1,pos.z)); };
  // ---- TURNING ROUND HIM with any button's drag; a left click that didn't drag walks him there (on his own level); a double click: the view back
  const cv=renderer.domElement; let L=null;
  // ---- TURNING ROUND ANY POINT, ZOOMING AT THE MOUSE (owner, 17 Oct 2026: "it always zooms back in at my feet", "as the point of x y z"):
  // where the view looks is his place plus UI.off (or the free camera's own point); a drag turns it round the point under the mouse when
  // the drag began (the thing there, or else the point level with the view's middle), the wheel draws the point under the mouse no nearer
  // the middle, so it stays under the mouse; the tilt has no stops (the camera turned by its own angles); 0 (or RESET VIEW) back on him
  UI.off=new THREE.Vector3(); UI.eul=new THREE.Euler(); UI.snR=new THREE.Vector3(); UI.snU=new THREE.Vector3();   /* (the pixel lock: build.py) */  const viewV=()=>UI.freeCam?UI.camT:UI.off, piv=new THREE.Vector3(), q0=new THREE.Quaternion(), q1=new THREE.Quaternion(), tv=new THREE.Vector3();
  const ndc=e=>{ const r=cv.getBoundingClientRect(); return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)); };
  const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group||q===MUS.g)return false;   // (he and the guitarist are moved on the chip: not where a ray finds them)
    return o.isMesh&&!(o.material&&o.material.visible===false)&&!(o.material&&o.material.transparent&&o.material.opacity<.05); };
  UI.grab=e=>{ if(ED.on&&ED.pickW){ const p=ED.pickW(e); if(p){ piv.copy(p); return; } }   // (shaping him: the point of him you grab)
    ray.setFromCamera(ndc(e),cam); const h=ray.intersectObjects(scene.children,true).find(h=>shown(h.object)); if(h)piv.copy(h.point); else ray.ray.closestPointToPoint(disp,piv); };
  UI.orbit=(dx,dy)=>{ if(UI.view==='iso')return;   // (iso: turned only by Q / E, a quarter at a time onto its four angles, owner 17 Oct 2026: "q,e will rotate your angle back and forth, only between 4 isometric angles")
    if(UI.persp){ yawTo-=dx*.006; pitchTo=UI.clampV(pitchTo+dy*.005); yaw=yawTo; pitch=pitchTo; UI.look={x:pos.x,z:pos.z}; return; }   // (the near views: turn about him, or look about; FREE VIEW in third person and behind, owner 17 Oct 2026, "if in 3rd person view, allow free view": a drag looks round him wherever you like, from under his chin to overhead, and BEHIND only swings back to his back once he walks)
    q0.setFromEuler(UI.eul.set(-pitch,yaw,0,'YXZ')); yawTo-=dx*0.008; pitchTo=clampP(pitchTo+dy*0.006); yaw=yawTo; pitch=pitchTo; q1.setFromEuler(UI.eul.set(-pitch,yaw,0,'YXZ'));
    tv.subVectors(disp,piv); const t0=tv.clone(); tv.applyQuaternion(q0.invert()).applyQuaternion(q1); viewV().add(tv.sub(t0)); disp.add(tv);
    if(!UI.freeCam){ tv.set(0,0,1).applyQuaternion(q1); UI.off.addScaledVector(tv,-UI.off.dot(tv)); } };   // (and kept level with him along the line of sight, where it changes nothing seen)   // (what he looks at swings round the pivot as the view turns)
  // HOW FAR OUT (owner, 17 Oct 2026: "lets limit the zoom out to this far", his picture some thirty tiles across): no further out than MAXW across
  UI.MAXW=34*TILE;
  let zAt=null; UI.wheelAt=e=>{ if(UI.persp){ ppuTo=ppu; if(UI.view==='third'||UI.view==='follow')UI.dist=Math.max(1.2*TILE,Math.min(22*TILE,UI.dist*Math.pow(1.0015,e.deltaY))); return; }   // (third person: the wheel brings the camera in and out; first: nothing)
    if(e.deltaY>0&&cam.right-cam.left>=UI.MAXW){ ppuTo=Math.max(ppuTo,ppu); return; } const r=cv.getBoundingClientRect(); zAt={x:e.clientX-r.left-r.width/2,y:r.height/2-(e.clientY-r.top)}; };
  UI.zk=()=>(cam.right-cam.left)/cv.getBoundingClientRect().width;
  UI.zoomStep=k0=>{ if(cam.right-cam.left>UI.MAXW&&ppuTo<ppu)ppuTo=ppu;   // (the menu's zoom held to it too)
    if(!zAt)return; const k1=UI.zk(); if(Math.abs(k1-k0)<1e-9){ if(Math.abs(ppu/ppuTo-1)<1e-3)zAt=null; return; } const R0=tv.setFromMatrixColumn(cam.matrixWorld,0).clone(), U0=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
    viewV().addScaledVector(R0,zAt.x*(k0-k1)).addScaledVector(U0,zAt.y*(k0-k1)); };
  UI.pan=(dx,dy)=>{ const r=cv.getBoundingClientRect(), k=(cam.right-cam.left)/r.width, R0=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0), U0=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
    viewV().addScaledVector(R0,-dx*k).addScaledVector(U0,dy*k);
    const T=UI.freeCam?UI.camT:new THREE.Vector3(pos.x,0,pos.z).add(UI.off), m=8*TILE, cx=Math.max(BOUND.x0-m,Math.min(BOUND.x1+m,T.x))-T.x, cz=Math.max(BOUND.z0-m,Math.min(BOUND.z1+m,T.z))-T.z; viewV().x+=cx; viewV().z+=cz; };   // (never slid off past the map's edges)   // (the world slid under the mouse: the map's drag, and HIS SHAPE's on empty space)
  // ---- THE VIEWS (owner, 17 Oct 2026: "in display tab add an isometric toggle view, when toggled rotating only does 4 isometric angles. add 1st
  // person view toggle and 3rd person view with zoom in and out"): MAP (the free view, as it was), ISOMETRIC (the game's: turning goes a quarter
  // round at a time, the four iso angles; the tilt fixed), THIRD PERSON (a camera behind him, looking at him: a drag turns it round him, the
  // wheel brings it in or out; never lower than three feet off the ground), FIRST PERSON (his eyes: a drag looks about; his body out of the way)
  UI.view='map'; UI.persp=false; UI.dist=7*TILE; let isoAcc=0;
  const HEAD=1.5/.84*TILE, EYE=1.62/.84*TILE, LOW=.9/.84*TILE;   // (his head's height, his eyes', three feet)
  UI.clampV=v=>UI.view==='first'?Math.max(-1.2,Math.min(1.3,v)):UI.view==='third'||UI.view==='follow'?Math.max(-.6,Math.min(1.5,v)):clampP(v);
  UI.setView=v=>{ UI.view=v; UI.persp=v==='third'||v==='first'||v==='follow'; if(UI.freeCam&&UI.persp)setFree(false);
    if(v==='iso'){ yawTo+=((((-Math.PI/4-yawTo)%(2*Math.PI))+3*Math.PI)%(2*Math.PI))-Math.PI; pitchTo=Math.PI/6; ppuTo=PPU*2.2; UI.off.set(0,0,0); zAt=null; }   // (owner, 17 Oct 2026, his picture: "this should always be the angle when you switch to isometric": the counter up to his left, 2.2 times in; Q / E turn it from there)
    if(v==='follow'){ UI.dist=4*TILE; pitchTo=.2; }   // (owner, 17 Oct 2026, his picture: "when you switch to over shoulder view it should always be at this zoom and angle (you can change once you switch to it)")
    if(v==='first')pitchTo=.05; if(v==='third')pitchTo=.3; if(!UI.persp)pitchTo=clampP(pitchTo); try{ localStorage.setItem('market-view',v); }catch(e){} };
  // BEHIND HIM (owner, 17 Oct 2026: "a view that locks on behind, 3rd person view, and autorotates with player"): the third person's camera, turned
  // with him each frame so it stays at his back; R (any view but these two) turns the view a quarter round, onto the four isometric angles
  UI.turn4=()=>{ if(UI.view==='first'||UI.view==='follow')return; if(UI.view==='iso'){ yawTo=Math.round((yawTo-Math.PI/4)/(Math.PI/2))*(Math.PI/2)+Math.PI/4-Math.PI/2; return; } yawTo=Math.round((yawTo-Math.PI/4)/(Math.PI/2))*(Math.PI/2)+Math.PI/4-Math.PI/2; };
  UI.view3=a=>{ if(UI.look&&(Math.hypot(pos.x-UI.look.x,pos.z-UI.look.z)>.05))UI.look=null;   /* (a free look lasts till he walks) */
    const side=['s','a','d','arrowdown','arrowleft','arrowright'].some(k=>keys.has(k));   /* (running any way: owner 17 Oct 2026, "take off the limitation of running in directions when in 3rd person view": sideways or back, the camera stays put; it swings behind him only as he runs forward or walks somewhere) */
    if(UI.view==='follow'&&!RAG.on&&!UI.look&&!side){ const t=heading+Math.PI; yawTo=yaw+((((t-yaw)%(2*Math.PI))+3*Math.PI)%(2*Math.PI))-Math.PI; }
    cam=UI.persp?PCAM:OCAM; if(RPASS)RPASS.camera=cam; if(UI.persp&&Math.abs(PCAM.aspect-RW/RH)>1e-3){ PCAM.aspect=RW/RH; PCAM.updateProjectionMatrix(); } };
  UI.view3b=a=>{ W3.group.visible=UI.view!=='first'; if(!UI.persp)return; const sk=W3.SZ||1;
    if(UI.view==='first'){ if(!(W3.eyeAt&&W3.eyeAt(cam.position))){ cam.position.set(pos.x,py+EYE*sk,pos.z); cam.position.addScaledVector(new THREE.Vector3(-Math.sin(a),0,-Math.cos(a)),.12*TILE); } cam.updateMatrixWorld(); return; }   // (from his own eyes, where his head is this moment: walker3d.js's W3.eyeAt)
    const T=new THREE.Vector3(pos.x,py+HEAD*sk,pos.z), F=new THREE.Vector3(Math.sin(a)*Math.cos(pitch),Math.sin(pitch),Math.cos(a)*Math.cos(pitch));
    cam.position.copy(T).addScaledVector(F,UI.dist); const g=groundY(cam.position.x,cam.position.z)+LOW; if(cam.position.y<g)cam.position.y=g;   // (never under three feet)
    cam.lookAt(T); cam.updateMatrixWorld(); };
  UI.setView(new URLSearchParams(location.search).get('view')||'iso');   // (owner, 17 Oct 2026, his picture: "start the game always in this view 1st": ISOMETRIC, every time; ?view= for a test)
  UI.home=()=>{ UI.off.set(0,0,0); zAt=null; if(UI.freeCam)setFree(false); };
  cv.addEventListener('pointerdown',e=>{ if(e.button!==0||ED.on)return; if(MAPED.down(e)||WE.down(e)){ cv.setPointerCapture(e.pointerId); return; }   /* (the map editor's drag of a place first: mapedit.js) */ L={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:false}; UI.grab(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(MAPED.dragging){ MAPED.move(e); return; } if(WE.dragging){ WE.move(e); return; } if(!L)return; if(!L.moved&&Math.hypot(e.clientX-L.x0,e.clientY-L.y0)>5)L.moved=true;
    // DRAGGING THE MAP (owner, 17 Oct 2026: "you should be able to drag the map and change your focal point, its still too hard to navigate"):
    // a left drag slides the world under the mouse, the point you grabbed staying under it; where the view looks (his place plus UI.off) goes
    // with it, and stays there as he walks (0 back on him). Turning and tilting: a right or middle drag (the page's own), or Shift / Alt + drag
    if(L.moved&&!e.shiftKey&&!e.altKey&&!UI.persp)UI.pan(e.clientX-L.x,e.clientY-L.y);
    else if(L.moved)UI.orbit(e.clientX-L.x,e.clientY-L.y); L.x=e.clientX; L.y=e.clientY; });   // (Shift or Alt + drag: turn and tilt, for a trackpad)
  cv.addEventListener('pointerup',()=>{ MAPED.up(); WE.up(); L=null; });
  // ---- DOUBLE CLICK (owner, 17 Oct 2026: "take off click to walk. double click to walk. double click on anything to interact with it"):
  // on the ground he walks there; on a thing he walks up to it, turns to it and does what it's for (the THINGS list: a thing joins it with its
  // name, the object a click finds it by, how near he goes, and what happens)
  const THINGS=[]; UI.thing=o=>THINGS.push(o); UI.things=THINGS;   /* (a test's reach) */
  let goal=null; const said=document.createElement('div'); said.id='said'; said.hidden=true; document.body.appendChild(said);
  const say=(txt,at)=>{ const r=cv.getBoundingClientRect(), v=at.clone().project(cam); said.textContent=txt; said.style.left=Math.round(r.left+(v.x+1)/2*r.width)+'px'; said.style.top=Math.round(r.top+(1-v.y)/2*r.height)+'px'; said.hidden=false; clearTimeout(say.t); say.t=setTimeout(()=>said.hidden=true,2500); };
  const thAt=th=>th.obj.getWorldPosition(new THREE.Vector3());
  cv.addEventListener('dblclick',e=>{ if(MAPED.on)return; if(WE.on){ WE.pick(e); return; } if(ED.on||UI.freeCam)return; const r=cv.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),cam);
    const live=THINGS.filter(th=>th.obj.visible&&(!th.obj.parent||th.obj.parent.visible)); const hits=ray.intersectObjects(live.map(th=>th.obj),true);
    let best=null, bd=1e9; if(hits.length){ let o=hits[0].object; const th=live.find(th=>{ let q=o; while(q){ if(q===th.obj)return true; q=q.parent; } return false; }); if(th){ best=th; bd=hits[0].distance; } }
    const u=typeof USE!=='undefined'&&USE.pick(ray); if(u&&u.d<bd)best=u.th;   // (a thing of the world's to use, nearer than any character: use.js)
    if(best){ best.started=false; goal=best; return; }   // (started afresh: a thing used before walks up again)
    goal=null; if(UI.fly)return; gplane.constant=-py; if(ray.ray.intersectPlane(gplane,hit)){ target=hit.clone(); UI.go(Math.hypot(hit.x-pos.x,hit.z-pos.z)); } });
  // HOW FAR, HOW FAST (owner, 17 Oct 2026: "the further away you double click the faster you will go there (far away you will run), few steps
  // you will walk"): past six of the world's units he runs, slowing to a walk for the last stretch; Shift still runs
  UI.go=d=>{ UI.clickGo=true; UI.clickRun=d>6; };
  UI.runTick=()=>{ if(!UI.clickGo)return; if(!target){ UI.clickGo=false; st.runTarget=keys.has('shift')?1:0; return; } st.runTarget=keys.has('shift')||UI.clickRun&&Math.hypot(target.x-pos.x,target.z-pos.z)>1.6?1:0; };
  // each frame while he's going to a thing: toward it (it may be moving); there, he faces it and it happens; walking off with the keys lets it go
  // (or stopped short by something in the way, but within its near: a lamp over a counter, a seat behind a table; use.js)
  UI.goTick=()=>{ if(!goal)return; const p=thAt(goal), d=Math.hypot(p.x-pos.x,p.z-pos.z), reach=goal.reach||1;
    const stuck=!target&&goal.started; if(d>reach&&!(stuck&&d<(goal.near||0))){ if(stuck)goal=null; else { const k=(d-reach*0.8)/d; target=new THREE.Vector3(pos.x+(p.x-pos.x)*k,py,pos.z+(p.z-pos.z)*k); if(!goal.started)UI.go(d); goal.started=true; } return; }
    target=null; heading=Math.atan2(p.x-pos.x,p.z-pos.z); const g=goal; goal=null; g.act(); say(g.name,p.clone().setY(p.y+(g.tall||1.6))); };
  // ---- THE MENU
  const css=document.createElement('style'); css.textContent=`
  #mode{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom,0px));font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15}
  #mode[hidden],#shd[hidden],#said[hidden]{display:none}
  #said{position:fixed;transform:translate(-50%,-100%);font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:4px 8px;pointer-events:none;z-index:14}
  #menu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(5,6,10,.55);z-index:30}
  #menu[hidden]{display:none}
  #menu .box{width:min(860px,94vw);max-height:90vh;overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg)}
  #menu .tabs{display:flex;gap:0;border-bottom:2px solid var(--line);padding-right:32px} #menu .tabs button{flex:1;font:inherit;color:var(--dim);background:transparent;border:0;border-right:2px solid var(--line);padding:12px;cursor:pointer}
  #menu .tabs button[aria-selected="true"]{color:var(--key);background:var(--panel)} #menu .tabs button:last-child{border-right:0}
  #menu .pane{padding:14px 16px} #menu .pane[hidden]{display:none} #menu h3{font:12px var(--pixel);color:var(--key);margin:12px 0 8px} #menu h3:first-child{margin-top:0}
  #menu .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0} #menu .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:6px 10px;cursor:pointer}
  #menu .btn[aria-pressed="true"]{color:var(--key);border-color:#6b6f80} #menu .dim{color:var(--dim)} #menu input[type=range]{width:220px}
  #menu canvas{display:block;margin:0 auto;max-width:100%;image-rendering:pixelated;border:2px solid var(--line);cursor:crosshair;background:#000}
  #menu table{border-collapse:collapse;width:100%} #menu td{padding:5px 6px;border-bottom:1px solid #22252f} #menu td:last-child{text-align:right}
  #menu .foot{padding:10px 16px;border-top:2px solid var(--line);color:var(--dim);display:flex;justify-content:space-between}`;
  document.head.appendChild(css);
  const M=document.createElement('div'); M.id='menu'; M.hidden=true; M.innerHTML=`<div class="box" role="dialog" aria-label="Menu">
    <div class="tabs" role="tablist"><button role="tab" data-t="map">MAP</button><button role="tab" data-t="display">DISPLAY</button><button role="tab" data-t="graphics">GRAPHICS</button><button role="tab" data-t="keys">KEYS</button></div>
    <div class="pane" data-p="map"><div class="row"><button class="btn" data-lv="up">THE STREET</button><button class="btn" data-lv="down">UNDERGROUND</button><span class="dim">click the map to go there</span></div>
      <canvas id="mapcv"></canvas><h3>PLACES</h3><div class="row" id="places"></div></div>
    <div class="pane" data-p="display">
      <h3>VIEW</h3><div class="row"><span style="width:60px">ZOOM</span><input type="range" id="dzoom" min="0" max="1" step="0.001"></div>
      <div class="row"><span style="width:60px">TILT</span><input type="range" id="dtilt" min="0" max="1" step="0.001"><button class="btn" id="dreset">RESET THE VIEW</button></div>
      <h3>VIEW</h3><div class="row" id="dview"><button class="btn" data-view="map">MAP VIEW</button><button class="btn" data-view="iso">ISOMETRIC</button><button class="btn" data-view="third">THIRD PERSON</button><button class="btn" data-view="follow">BEHIND</button><button class="btn" data-view="first">FIRST PERSON</button></div>
      <h3>HIM</h3><div class="row"><button class="btn" id="dshape">EDIT HIS SHAPE</button><button class="btn" id="dlooks">YOUR LOOKS</button></div>
      <div class="row"><button class="btn" id="dbody">PHYSICS BODY</button><span style="width:60px">LOOSE</span><input type="range" id="dloose" min="0" max="1" step="0.01"></div>
      <h3>ON SCREEN</h3><div class="row"><button class="btn" id="dhelp">HELP PANEL</button><button class="btn" id="dstat">STATS</button></div></div>
    <div class="pane" data-p="graphics">
      <h3>RESOLUTION</h3><div class="row" id="dres"></div><div class="dim" id="dsharp"></div>
      <h3>SHADOWS</h3><div class="row" id="dshd"></div>
      <h3>LIGHT</h3><div class="row"><button class="btn" id="dlook">GLOW AND NIGHT LOOK</button><button class="btn" id="dgrain">LIGHT GRAIN</button><button class="btn" id="dlit">LIGHT ON THEM</button><button class="btn" id="doutl">OUTLINE</button></div>
      <div class="row"><span style="width:110px">SHADE STEPS</span><input type="range" id="dsteps" min="2" max="12" step="1"><span style="width:110px">SHADOW DEPTH</span><input type="range" id="ddepth" min="0.02" max="0.98" step="0.005"></div></div>
    <div class="pane" data-p="keys"><div class="dim" style="margin-bottom:8px">click a key, then press the one you want (Escape to keep it)</div><table id="keytab"></table>
      <div class="row" style="margin-top:10px"><button class="btn" id="kreset">ALL BACK AS THEY WERE</button></div></div>
    <div class="foot"><span>ESC closes</span><span>THE MARKET</span></div></div>`;
  document.body.appendChild(M);
  const $=s=>M.querySelector(s); let tab='map', mapLv='up';
  const show=t=>{ tab=t; M.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===t))); M.querySelectorAll('[data-p]').forEach(p=>p.hidden=p.dataset.p!==t); if(t==='map')drawMap(); if(t==='display'||t==='graphics')drawDisplay(); if(t==='keys')drawKeys(); };
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
  // the level from straight above (x0..x1, z0..z1 world), roofs off, brighter than the night, W x H pixels: the MAP tab's, the map editor's
  UI.topShot=(R,lv,W,H)=>{ const vis={}; rt.setSize(W,H); for(const k in MAPG)vis[k]=MAPG[k].visible; MAPG.down.visible=lv==='down'; for(const k of ['bodega','pool','poolout','park','castle'])if(MAPG[k])MAPG[k].visible=lv==='up';
    const h0=HEMI.intensity; HEMI.intensity=2.2; W3.group.visible=false; marker.visible=false;
    const yc=lv==='down'?STN.DY:0; CLP[0].constant=yc+1.5; CLP[1].constant=-(yc-2.2);   // (the slice: from under the tracks to chest height)
    top.left=R.x0; top.right=R.x1; top.top=-R.z0; top.bottom=-R.z1; top.position.set(0,yc+60,0); top.up.set(0,0,-1); top.lookAt(0,yc,0); top.near=1; top.far=120; top.updateProjectionMatrix();
    const cp=renderer.clippingPlanes; renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); renderer.clippingPlanes=CLP;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x050507,1); renderer.clear(); renderer.render(scene,top); const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px);
    renderer.setRenderTarget(null); renderer.clippingPlanes=cp; renderer.setClearColor(cc,ca);
    for(const k in vis)MAPG[k].visible=vis[k]; HEMI.intensity=h0; W3.group.visible=true;
    const im=new ImageData(W,H); for(let y=0;y<H;y++){ const o=y*W*4, q=(H-1-y)*W*4; for(let i=0;i<W*4;i+=4){ im.data[o+i]=GAM[px[q+i]]; im.data[o+i+1]=GAM[px[q+i+1]]; im.data[o+i+2]=GAM[px[q+i+2]]; im.data[o+i+3]=255; } } return im; };
  function drawMap(){ M.querySelectorAll('[data-lv]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lv===mapLv)));
    const R=mapRect(mapLv), W=R.W, H=R.H; mcv.width=W; mcv.height=H; mg.putImageData(UI.topShot(R,mapLv,W,H),0,0);
    const sx=x=>(x-R.x0)/(R.x1-R.x0)*W, sz=z=>(z-R.z0)/(R.z1-R.z0)*H; if((LVL)===mapLv){ mg.fillStyle='#f2c14e'; mg.fillRect(Math.round(sx(pos.x))-3,Math.round(sz(pos.z))-3,7,7); mg.fillStyle='#000'; mg.fillRect(Math.round(sx(pos.x))-1,Math.round(sz(pos.z))-1,3,3); } }
  STORE.goTo=(x,z,lv)=>goTo(x,z,lv);   // (a test's reach)
  const goTo=(x,z,lv)=>{ pos.set(x,0,z); target=null; py=typeof lv==='number'?lv:lv==='down'?(MODS.dungeon&&MODS.dungeon.inside(x,z)?MODS.dungeon.ground(x,z):MODS.station.ground(x,z)):0;   /* (a number: a stacked floor's height) */ if(UI.freeCam)UI.camT.set(x,py+.9,z); else UI.off.set(0,0,0); if(UI.menuOpen)toggleMenu(); };   /* (the view back on him where he lands) */
  mcv.addEventListener('click',e=>{ const r=mcv.getBoundingClientRect(), R=mapRect(mapLv); goTo(R.x0+(e.clientX-r.left)/r.width*(R.x1-R.x0),R.z0+(e.clientY-r.top)/r.height*(R.z1-R.z0),mapLv); });
  M.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ mapLv=b.dataset.lv; drawMap(); });
  const PLACES=[['THE STREET',-2.2,3.2,'up'],['THE BODEGA',BOD.X((BOD.B0.x0+BOD.B0.x1)/2),BOD.Z(BOD.B0.y1)-3.4,'up'],['THE APARTMENTS',POOLR.X(22.75),POOLR.Z(12),'up'],['THE POOL',POOLR.X(10),POOLR.Z(8.9),'up'],['THE PLATFORM',-12.4+LAY.o('subway').x*TILE,-24.9+LAY.o('subway').y*TILE,'down'],['CENTRAL PARK',BOD.XS(96+PARK.ox),BOD.ZS(-54+PARK.oy),'up'],['GHOST STREET',BOD.X(BOD.GD.door[0]),BOD.Z(BOD.GD.door[1]+4.5),'up'],['THE CASTLE',BOD.XS(CASTLE.gate),BOD.ZS(CASTLE.b[2]-3),'up'],['THE DUNGEON',BOD.XS((CASTLE.hall.x0+CASTLE.hall.x1)/2),BOD.ZS((CASTLE.hall.y0+CASTLE.hall.y1)/2),'down']];
  const goPlace=n=>{ if(STORE.ensure)STORE.ensure(); const P=PLACES.concat(STORE.places).find(p=>p[0]===n); if(P)goTo(P[1],P[2],P[3]); };   // (a stacked room is finished first if it isn't yet: store.js)
  { const q=QS.get('place'); const go=()=>window.__started?goPlace(q.toUpperCase()):setTimeout(go,200); if(q)setTimeout(go,300); }   /* (once the game runs: the page breathes while it loads) */   // (?place=central park: a test's start)
  for(const [n,x,z,lv] of PLACES){ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goTo(x,z,lv); $('#places').appendChild(b); }
  // EVERY ROOM A BUTTON (owner, 17 Oct 2026: "make sure every room and location on map has a button to jump there"): the bodega's two rooms, the
  // apartment building's (POOLR.ROOMS: the gym, the hallway, the lobby, the office; the pool hall is THE POOL above), every floor of the apartment
  // house (no stairs in it now: this is the way up), the dojo, the top of the subway stairs; each into its middle, on its floor
  { const h=document.createElement('h3'); h.textContent='ROOMS'; $('#places').parentNode.appendChild(h); const row=document.createElement('div'); row.className='row'; row.id='roomsrow'; $('#places').parentNode.appendChild(row);
    const add=(n,x,z,lv)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goTo(x,z,lv); row.appendChild(b); PLACES.push([n,x,z,lv]); };
    const mid=(X,Z,r)=>[(X(r[0])+X(r[2]))/2,(Z(r[1])+Z(r[3]))/2], B=BOD.B0;
    add('THE SHOP',...mid(BOD.X,BOD.Z,[B.x0,BOD.BODOFF,B.x1,B.y1]),'up'); add('THE BACK ROOM',...mid(BOD.X,BOD.Z,[B.x0,B.y0,B.x1,BOD.BODOFF]),'up');
    const R=POOLR.ROOMS||[]; [['THE GYM',0],['THE HALLWAY',3],['THE LOBBY',5],['THE OFFICE',6]].forEach(([n,i])=>R[i]&&add(n,...mid(POOLR.X,POOLR.Z,R[i]),'up'));
    if(BOD.GD)add('THE DOJO',...mid(BOD.X,BOD.Z,BOD.GD.r),'up');
    if(MODS.apts){ const A=MODS.apts.A, H=MODS.apts.H; for(let f=0;f<5;f++)add('APARTMENT HOUSE '+(f?'FLOOR '+(f+1):'GROUND'),BOD.X((A.x0+A.x1)/2),BOD.Z((H.y0+H.y1)/2),f?MODS.apts.SY*f:'up'); }
    add('THE SUBWAY STAIRS',BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),BOD.ZS(MAPSTAIR.y1+1.2),'up'); }
  // THE STOREROOM (owner, 17 Oct 2026: the game's rooms brought back, "dont add them to the map yet"): off the map, each a place to go and look
  { const h=document.createElement('h3'); h.textContent='STORED (OFF THE MAP)'; $('#places').parentNode.appendChild(h); const row=document.createElement('div'); row.className='row'; row.id='stored'; $('#places').parentNode.appendChild(row);
    for(const [n] of STORE.places){ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goPlace(n); row.appendChild(b); } }
  // DISPLAY
  const zMin=3, zMax=ZMAX, z2r=v=>Math.log(v/zMin)/Math.log(zMax/zMin), r2z=r=>zMin*Math.pow(zMax/zMin,r);
  function drawDisplay(){ M.querySelectorAll('[data-res]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.res===RESI))); $('#dlook').setAttribute('aria-pressed',String(LOOK.on)); $('#dlook').textContent='GLOW AND NIGHT LOOK '+(LOOK.on?'ON':'OFF'); $('#dsteps').value=W3.shade.steps; $('#ddepth').value=W3.shade.depth; M.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===UI.view))); $('#dsharp').textContent=(SCL===1&&vpu()<art()?'full':RES()+'×')+' the game\'s detail'; $('#dzoom').value=z2r(ppuTo); $('#dtilt').value=(pitchTo-PMIN)/(PMAX-PMIN);
    $('#dlit').textContent='LIGHT ON THEM: '+(UI.lit?'LAMPS':'FLAT'); $('#dlit').setAttribute('aria-pressed',String(UI.lit)); $('#dbody').setAttribute('aria-pressed',String(PB.on)); $('#dbody').textContent='PHYSICS BODY '+(PB.on?'ON':'OFF'); $('#dloose').value=PB.loose; $('#doutl').setAttribute('aria-pressed',String(OUTL.on)); $('#doutl').textContent='OUTLINE '+(OUTL.on?'ON':'OFF'); $('#dhelp').setAttribute('aria-pressed',String(!document.getElementById('hud').hidden)); $('#dstat').setAttribute('aria-pressed',String(!document.getElementById('stat').hidden));
    const sh=document.getElementById('shd'); $('#dshd').innerHTML=''; sh.querySelectorAll('button').forEach(b=>{ const c=document.createElement('button'); c.className='btn'; c.textContent=b.textContent; c.setAttribute('aria-pressed',b.getAttribute('aria-pressed')); c.onclick=()=>{ b.click(); drawDisplay(); }; $('#dshd').appendChild(c); }); }
  // GRAPHICS (owner, 17 Oct 2026: "add resolution and other graphics settings into menu"): the resolution's levels by name (the art's pixels a
  // world unit, the game's times; never finer than one screen pixel each), the shadows, the glow and night look (oldlook.js), the light on the
  // characters, the outline, his shading
  const RESN=['COARSEST','COARSE','NORMAL','SHARP'];
  for(let i=0;i<=RESMAX;i++){ const b=document.createElement('button'); b.className='btn'; b.dataset.res=i; b.textContent=RESN[i]||RESL[i]+'×'; b.onclick=()=>{ if(i<RESI)RESI=i; while(RESI<i&&(pxS()>1||vpu()>art()))RESI++; resize(); drawDisplay(); }; $('#dres').appendChild(b); }
  // LIGHT GRAIN (the noise in the light's steps, map-pre.js's DITH): 16, 12 strong, 24 fine, off; the page loads again to make it
  { const G=[16,12,24,0], N={16:'ON',12:'STRONG',24:'FINE',0:'OFF'}; $('#dgrain').textContent='LIGHT GRAIN '+N[DITH]; $('#dgrain').onclick=()=>{ const v=G[(G.indexOf(DITH)+1)%G.length]; try{ localStorage.setItem('market-grain',String(v)); }catch(e){} location.reload(); }; }
  $('#dlook').onclick=()=>{ LOOK.on=!LOOK.on; try{ localStorage.setItem('market-look',LOOK.on?'1':'0'); }catch(e){} drawDisplay(); };
  $('#dzoom').oninput=e=>{ ppuTo=r2z(+e.target.value); }; $('#dtilt').oninput=e=>{ pitchTo=clampP(PMIN+(+e.target.value)*(PMAX-PMIN)); };
  M.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{ UI.setView(b.dataset.view); drawDisplay(); });
  $('#dlooks').onclick=()=>{ toggleMenu(); LOOKS.open(); }; $('#dsteps').oninput=e=>W3.setShade(+e.target.value,W3.shade.depth); $('#ddepth').oninput=e=>W3.setShade(W3.shade.steps,+e.target.value);   // (his shading: the steps of light on him, how deep his shadows)
  $('#dreset').onclick=()=>{ yawTo=VIEW0.yaw; pitchTo=VIEW0.pitch; ppuTo=VIEW0.ppu; UI.home(); drawDisplay(); };
  $('#dhelp').onclick=()=>{ const h=document.getElementById('hud'); h.hidden=!h.hidden; drawDisplay(); }; $('#dstat').onclick=()=>{ const h=document.getElementById('stat'); h.hidden=!h.hidden; drawDisplay(); };
  // THE OUTLINE round him (owner, 17 Oct 2026: "add ability to remove the line from avatar"; off unless turned on, kept in this browser)
  try{ OUTL.on=localStorage.getItem('market-outline')==='1'; }catch(e){ OUTL.on=false; } OUTL.sp.enabled=OUTL.on;
  $('#doutl').onclick=()=>{ OUTL.on=!OUTL.on; OUTL.sp.enabled=OUTL.on; try{ localStorage.setItem('market-outline',OUTL.on?'1':'0'); }catch(e){} drawDisplay(); };
  $('#dshape').onclick=()=>ED.enter();
  // LIGHT ON THEM: the Walker, the goldfish and the bear lit by the lamps (walker3d.js, npc-map.js), or each by its own fixed light (FLAT)
  UI.setLit=on=>{ UI.lit=on; W3.mesh.material=on?W3.toon:W3.flat; for(const N of NPCS)N.me.material=on?N.toon:N.flat; try{ localStorage.setItem('market-avlight',on?'1':'0'); }catch(e){} };
  { let v='1'; try{ v=localStorage.getItem('market-avlight')||'1'; }catch(e){} UI.setLit(v==='1'); }
  $('#dlit').onclick=()=>{ UI.setLit(!UI.lit); drawDisplay(); };
  $('#dbody').onclick=()=>{ PB.set(!PB.on); drawDisplay(); }; $('#dloose').oninput=e=>{ PB.loose=+e.target.value; try{ localStorage.setItem('market-loose',String(PB.loose)); }catch(err){} };
  // KEYS
  function drawKeys(){ const t=$('#keytab'); t.innerHTML=''; for(const [a,what] of ACTS){ const tr=document.createElement('tr'), b=document.createElement('button'); b.className='btn'; b.textContent=waiting===a?'PRESS A KEY…':NAME(keyOf(a)); b.setAttribute('aria-pressed',String(waiting===a)); b.onclick=()=>{ waiting=a; drawKeys(); };
      const td1=document.createElement('td'); td1.textContent=what.toUpperCase(); const td2=document.createElement('td'); td2.appendChild(b); tr.append(td1,td2); t.appendChild(tr); }
    const e=document.createElement('tr'); e.innerHTML='<td>MENU</td><td><span class="dim">ESC</span></td>'; t.appendChild(e); }
  $('#kreset').onclick=()=>{ BIND={}; try{ localStorage.removeItem('market-keys'); }catch(e){} REV=rev(); drawKeys(); drawBadge(); };
  // NOTHING ON SCREEN BUT THE GAME (owner, 17 Oct 2026: "take off the hud ... the market and controls, shadows etc on screen entire time"):
  // the help panel, the stats and the shadows' buttons start hidden; the menu has them all (DISPLAY: shadows, help, stats; KEYS: every control)
  for(const id of ['hud','stat','shd'])document.getElementById(id).hidden=true; { const L=document.getElementById('loading'); if(L)setTimeout(()=>{ L.style.opacity=0; setTimeout(()=>L.remove(),500); },Math.max(0,6000-(performance.now()-(window.__ld0||0)))); }   /* (the line's fade done first: 1.5 s in, 3 s, 1.5 s out, then the dark lifts) */
  drawBadge(); }
// ---- EVERY PANEL CLOSES AND MOVES (owner, 17 Oct 2026: "make sure menus have way to exit out, allow all menus to be draggable"): each panel gets
// an X in its corner (what Escape or its own key would do) and is dragged by any of its plain parts (not its buttons, sliders, fields or the map);
// panels made later, or whose insides are rewritten (the ? list), get their X back on the next look round (a few times a second, cheap)
{ const PANS=[['menu',()=>UI.toggleMenu(),'.box'],['ed',()=>ED.exit()],['looks',el=>{ el.hidden=true; }],['we',()=>WE.toggle()],['movesp'],['maped',()=>MAPED.toggle()],['shbar'],['hud'],['stat'],['shd']];
  const css=document.createElement('style'); css.textContent='.pX{position:absolute;right:4px;top:4px;z-index:2;font:12px Silkscreen,monospace;color:#f2c14e;background:#0e1016;border:2px solid #3a3f4e;width:24px;height:24px;line-height:18px;padding:0;cursor:pointer} .pDrag{cursor:move}'; document.head.appendChild(css);
  const hide=el=>{ el.hidden=true; if(el.style.display)el.style.display='none'; };
  const NOPE='button,input,select,textarea,a,label,canvas,option,.pX';
  const drag=(box)=>{ box.classList.add('pDrag'); box.addEventListener('mousedown',e=>{ if(e.button!==0||e.target.closest(NOPE))return; e.stopPropagation(); e.preventDefault();
      const r=box.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; Object.assign(box.style,{position:'fixed',left:r.left+'px',top:r.top+'px',right:'auto',bottom:'auto',transform:'none',margin:'0',width:r.width+'px',height:box.id==='ed'?r.height+'px':box.style.height}); box.style.inset='auto'; box.style.left=r.left+'px'; box.style.top=r.top+'px';
      const mv=e=>{ box.style.left=Math.max(-r.width+60,Math.min(innerWidth-60,e.clientX-dx))+'px'; box.style.top=Math.max(0,Math.min(innerHeight-30,e.clientY-dy))+'px'; }, up=()=>{ removeEventListener('mousemove',mv,true); removeEventListener('mouseup',up,true); };
      addEventListener('mousemove',mv,true); addEventListener('mouseup',up,true); }); };
  const look=()=>{ for(const [id,close,sub] of PANS){ const el=document.getElementById(id); if(!el)continue; const box=sub?el.querySelector(sub):el; if(!box)continue;
      if(!box.dataset.pan){ box.dataset.pan=1; drag(box); if(getComputedStyle(box).position==='static')box.style.position='relative'; }
      if(!box.querySelector(':scope>.pX')){ const x=document.createElement('button'); x.className='pX'; x.type='button'; x.textContent='X'; x.title='close'; x.onclick=e=>{ e.stopPropagation(); close?close(el):hide(el); }; box.appendChild(x); } } };
  look(); setInterval(look,400); }
