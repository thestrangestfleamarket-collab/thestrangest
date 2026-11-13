// THE UI: the camera (isometric, behind, first person), zoom and turn, the menu, places, and the top-down shot.
import {SHARED, THREE} from './003-shx.js';
import {AMB, BAG, BLK, BUGS, CHARP, CINEMA, CIVIC, CLIP, DN, DRONE, ED, FEEL, FORAGE, GUIDE, INSPECT, ITEMED, keys, LAND, LEVELS, LINES, LOOK, LOOKS, MAPED, MOTION, MUS, NPCS, ONLINE, PARK, PB, PETS, pos, PROMPT, PS2, RIDE, RINSP, ROOMS, SFX, SNDED, SPEED, st, TALK, TENANTS, TEXT, UI, USE, VIT, VLOOK, VR, W3, WE, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OCAM, PCAM, PPU, renderer, resize, RESN, RH, rppu, RW, scene} from './004-main.js';
import {OWNED, SAVE} from './005-save.js';
import {ASTEP, BLDK, CASTLE, FADE, LEVEL, LOTX, LOTY, MAPG, MAPSTAIR, MODS, QS, RING, SECTION, SECTIONS, SOL, STORE, SYS, TILE, WP, ZU} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {FOUNT} from './060a-fount.js';
import {GTOWER} from './063-tower.js';
import {HEMI} from './064-map-post.js';
import {RIVER} from './066-river.js';
import {OUTL} from './072-walker3d.js';
import {clampP, disp, marker, PMAX, PMIN, ray, VIEW0} from './075-main-13.js';
import {SOUND} from './091-sfx.js';
for(const [k,d] of Object.entries({'map.train1':'TRAIN 1 · TO {next}','map.train2':'TRAIN 2 · TO {next}'}))TEXT.t(k,d);
Object.assign(UI,{freeCam:false,fly:false,menuOpen:false,camT:new THREE.Vector3(),lookK:1});
{
  const ACTS=[['w','walk up (screen)'],['s','walk down'],['a','walk left'],['d','walk right'],['shift','run · swim up, and faster · sink (free camera, fly)'],[' ','jump · rise (free camera, fly) · swim down'],
    ['view','change the view (map, isometric, third person, behind, first person)'],['use','use what is near you (pet, door, mushroom...), or what you hold (skateboard, bike, balloon...)'],['rot','turn the view (a quarter in isometric; held, it turns third and first person)'],['j','punch'],['k','kick'],['n','slap'],['i','crouch (hold): then J an uppercut, K a sweep'],['2','leg sweep'],['3','back flip'],['4','front flip'],['r','roll'],['u','cartwheel'],['1','hold: sword · net · bird net · nothing (the mouse aims it, a click swings); a filled quick slot takes its number key, 1 to 0'],['p','block (hold): bare hands soften a blow; with a sword, one caught on the beat staggers them'],['v','wave'],['h','emotes: dance, cheer, clap, sit down and more (walk to stop one that loops) · in a car, the horn'],['l','side kick (again as it lands: a spin kick)'],['o','dodge back (blows miss you for a moment)'],['inspect','look over what you hold or point at (your pack has LOOK too)'],['shoes','shoes off / on (barefoot to forage)'],['t','decorate (in your apartment)'],['chat','talk to the players on your block'],['talk','hold to speak aloud to the players near you (voice)'],['ask','hold to ask your flying bot aloud (or start a chat line with @)'],['q','turn left'],['e','turn right'],['z','tilt down'],['x','tilt up'],['0','reset the view'],
    ['c','free camera'],['g','fly (Space up, Shift down; G again lands)']];
  const FIXED=[['I','YOUR PACK'],['?','WHAT YOU CAN DO'],['F8','REPORT A BUG'],['SHIFT+M','THE MAP'],['SHIFT+E','EDIT THE WORLD (ISOMETRIC)'],['1 TO 0','THE QUICK BAR (A FILLED SLOT TAKES ITS KEY)'],['ESC','THE MENU']];   // the keys that do not rebind
  const NAME=k=>k===''?'—':k===' '?'SPACE':k.length===1?k.toUpperCase():k.toUpperCase();
  let BIND={}; try{ BIND=JSON.parse(SAVE.get('keys')||'{}')||{}; }catch(e){}
  const DEF={use:'e',e:'',view:'v',v:'b',rot:'r',r:'y',shoes:';',chat:'enter',talk:'m',ask:'/',inspect:'5',i:'c',c:'`'}, keyOf=a=>BIND[a]??DEF[a]??a, rev=()=>{ const r={}; for(const [a] of ACTS)r[keyOf(a)]=a; return r; };
  let REV=rev(), waiting=null; UI.keyOf=keyOf;
  UI.key=e=>{ const raw=e.key.toLowerCase();
    if(waiting){ if(raw!=='escape'){ const old=keyOf(waiting); for(const [a] of ACTS)if(a!==waiting&&keyOf(a)===raw)BIND[a]=old; BIND[waiting]=raw;
        try{ SAVE.set('keys',JSON.stringify(BIND)); }catch(err){} REV=rev(); } waiting=null; drawKeys(); e.preventDefault(); return null; }
    if(ITEMED.on&&(raw==='escape'||e.code==='Digit7'&&e.shiftKey)){ if(e.type==='keydown'&&!e.repeat)ITEMED.key(); return null; }   // the ITEM editor (140ba): esc or shift+7 closes it; while it is open the game takes no keys
    if(e.code==='Digit7'&&e.shiftKey&&!ED.on&&!UI.menuOpen&&!/^(TEXTAREA|INPUT|SELECT)$/.test(e.target&&e.target.tagName||'')){ if(e.type==='keydown'&&!e.repeat&&ITEMED.key)ITEMED.key(); return null; }
    if(ITEMED.on)return null;
    if(raw==='escape'){ if(e.type==='keydown'){ if(UI.menuOpen||!UI.hub)toggleMenu(); else UI.hub(); } return null; }   // ESC: the wheel (162ed-hub); out of a menu it shuts it
    if(UI.hubOpen)return null;
    if(e.target&&/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName))return null;
    if(raw==='?'){ if(e.type==='keydown'&&!e.repeat)UI.moves(); return null; }
    if(raw==='e'&&e.shiftKey&&!ED.on&&!UI.menuOpen){ if(e.type==='keydown'&&!e.repeat&&WE.key)WE.key(); return null; }
    if(UI.view==='iso'&&!ED.on&&(raw==='q'||raw==='r')){ if(e.type==='keydown'&&!e.repeat)UI.isoStep(raw==='q'?1:-1); return null; }
    if(UI.menuOpen)return null;
    if(ED.on){ const a=raw==='e'||raw==='q'?raw:REV[raw]; return ['q','e','z','x','0','=','-'].includes(a)?a:null; }
    if(REV[raw]==='talk'){ if(!e.repeat&&ONLINE.talk)ONLINE.talk(e.type==='keydown'); return null; }
    if(REV[raw]==='ask'){ if(!e.repeat&&ONLINE.ask)ONLINE.ask(e.type==='keydown'); return null; }
    const act=REV[raw]; if(act!==undefined){ if(act==='rot')UI.rotHeld=e.type==='keydown'; if(e.type==='keydown'&&!e.repeat){ if(act==='c')setFree(!UI.freeCam); if(act==='g')setFly(!UI.fly); if(act==='view'){ const V=UI.viewsHere(); UI.switchView(V[(V.indexOf(UI.view)+1)%V.length]); } if(act==='rot'&&(UI.view==='iso'||UI.view==='map'))UI.turn4(); if(act==='use'&&UI.useKey&&!/^(TEXTAREA|INPUT|SELECT)$/.test(e.target&&e.target.tagName||''))UI.useKey(); if(act==='shoes'&&typeof LOOKS!=='undefined'&&LOOKS.shoes)LOOKS.shoes(); if(act==='chat'&&ONLINE.open){ e.preventDefault(); ONLINE.open(); } if(act==='inspect'&&INSPECT.key)INSPECT.key(); } return act==='view'||act==='rot'||act==='use'||act==='shoes'||act==='chat'||act==='inspect'?null:act; }
    return ACTS.some(([a])=>a===raw)?'':raw; };
  { const K0=UI.key, K=new WeakMap(); UI.key=e=>{ if(K.has(e))return K.get(e); const r=K0(e); K.set(e,r); return r; }; }   // one press acts once: later listeners asking for the same event get the same answer
  {
    UI.moves=()=>{ const p=document.getElementById('dmoves'); if(UI.menuOpen&&p&&!p.hidden)UI.toggleMenu(); else UI.menuTab('moves'); };
  }
  const badge=document.createElement('div'); badge.id='mode'; document.body.appendChild(badge);
  // riding anything, its controls stay up until you close them (owner, 9 Nov 2026: "anytime youre on a device the control should stay on screen unless you close them"); a car has its own bar
  let rideShut=null; const rideHint=()=>RIDE.on&&!/^car:/.test(RIDE.on)&&rideShut!==RIDE.on&&RIDE.cur&&RIDE.cur.hint?String(RIDE.cur.hint):'';
  const drawBadge=()=>{ const m=[UI.freeCam&&'FREE CAMERA: '+NAME(keyOf('c'))+' to go back',UI.fly&&(UI.landing?'LANDING':'FLY: SPACE UP · SHIFT DOWN · '+NAME(keyOf('g'))+' to land')].filter(Boolean), rh=rideHint();
    badge.textContent=[...m,rh].filter(Boolean).join(' · '); if(rh){ const x=document.createElement('button'); x.type='button'; x.textContent='×'; x.title='close'; x.style.cssText='margin-left:10px;font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0 2px'; x.onclick=()=>{ rideShut=RIDE.on; drawBadge(); }; badge.appendChild(x); } badge.hidden=!(m.length||rh); };
  let lastRH=''; SYS.add('life',()=>{ if(!RIDE.on)rideShut=null; const rh=rideHint(); if(rh!==lastRH){ lastRH=rh; drawBadge(); } },'094-ridehint');
  function setFree(on){ UI.freeCam=on; if(on)UI.camT.copy(disp); drawBadge(); }
  // flying like a superhero (G): a cape on, Space up and Shift down, faster the longer you fly one way, up through the clouds (132b) to FLY.top; G again comes down where you are and lands
  const WM=TILE/.84, FLY=UI.FLY={top:300*WM,sp:0,vy:0,max:10.5,min:1.75};
  // where you can come down: over a building's solid, the nearest clear ground round it (CLIP's test, as the townsfolk are moved out of walls)
  const clearOf=(x,z)=>{ const L=SHARED.LVL==='down'?SOL.down:SOL.up, R=.35*TILE; if(!CLIP.hit||!CLIP.hit(L,x,z,R))return null; for(let r=TILE/2;r<=60*TILE;r+=TILE/2){ const n=Math.max(8,Math.round(2*Math.PI*r/(TILE/2))); for(let k=0;k<n;k++){ const a=k/n*2*Math.PI, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; const B=SHARED.BOUND; if(B&&(px<B.x0||px>B.x1||pz<B.z0||pz>B.z1))continue; if(!CLIP.hit(L,px,pz,R))return {x:px,z:pz,t:0}; } } return null; };
  const flyS=()=>st.fly||(st.fly={on:false,k:0,t:0,f:0,u:0});
  function setFly(on,now){ const g=SHARED.groundY?SHARED.groundY(pos.x,pos.z):0;
    if(!on&&!now&&UI.fly){ if(UI.landing){ UI.landing=false; FLY.to=null; drawBadge(); return; } if(SHARED.py-g>1.5*WM||clearOf(pos.x,pos.z)){ UI.landing=true; FLY.to=clearOf(pos.x,pos.z); drawBadge(); return; } }   // high up: come down first (G again while coming down flies on)
    if(on&&!UI.fly&&!UI.canFly()){ SAY('YOU NEED TO EAT A FLIGHT MUSHROOM TO FLY.','#ffd27a'); return; }   // flying comes from the FLIGHT MUSHROOM (141)
    UI.fly=on; UI.landing=false; flyS().on=on; if(on){ SHARED.target=null; st.move=null; FLY.sp=0; FLY.vy=0; } drawBadge(); }
  UI.setFly=setFly; UI.setFree=setFree;
  UI.camStep=(dt,a,up,dn,lf,rt)=>{ if(!UI.freeCam||UI.menuOpen)return; const fx=-Math.sin(a), fz=-Math.cos(a), s=dt*9*PPU/Math.max(4,SHARED.ppu);
    let mx=0,mz=0; if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;} const n=Math.hypot(mx,mz)||1;
    UI.camT.x+=mx/n*s; UI.camT.z+=mz/n*s; UI.camT.y+=((keys.has(' ')?1:0)-(keys.has('shift')&&!L?1:0))*s*.7;
    UI.camT.x=Math.max(SHARED.BOUND.x0,Math.min(SHARED.BOUND.x1,UI.camT.x)); UI.camT.z=Math.max(SHARED.BOUND.z0,Math.min(SHARED.BOUND.z1,UI.camT.z)); UI.camT.y=Math.max(-12,Math.min(30,UI.camT.y)); };
  UI.flyGo=(dt,moving)=>{ FLY.sp=moving?Math.min(FLY.max,Math.max(FLY.min,FLY.sp)+dt*(.75+FLY.sp*.45)):Math.max(0,FLY.sp-dt*30); return FLY.sp*WM*dt; };   // metres a second, built up the longer you fly
  UI.canFly=()=>!!(FORAGE.S&&FORAGE.S.fx&&FORAGE.S.fx.fly>0);
  UI.flyStep=dt=>{ if(dt&&!UI.landing&&!UI.canFly()){ UI.landing=true; FLY.to=clearOf(pos.x,pos.z); drawBadge(); } const F=flyS(), g=SHARED.groundY?SHARED.groundY(pos.x,pos.z):0, L=UI.landing, w=L?-1:(keys.has(' ')?1:0)-(keys.has('shift')?1:0), top=w>0?3.5:w<0?L?Math.max(4,Math.min(30,(SHARED.py-g)/WM*1.2)):5.5:0;
    FLY.vy+=(w*top-FLY.vy)*Math.min(1,dt*(w?2.2:4)); SHARED.py+=FLY.vy*WM*dt; SHARED.py=Math.max(-5,Math.min(FLY.top,SHARED.py));
    if(L&&FLY.to){ const dx=FLY.to.x-pos.x, dz=FLY.to.z-pos.z, d=Math.hypot(dx,dz), st=Math.min(d,14*WM*dt); if(d<.05||(FLY.to.t+=dt)>8)FLY.to=null; else{ pos.x+=dx/d*st; pos.z+=dz/d*st; SHARED.heading=Math.atan2(dx,dz); } }   // over a building: glide to clear ground as you come down
    if(L&&!FLY.to&&SHARED.py-g<.15*WM){ SHARED.py=Math.max(SHARED.py,g); setFly(false,true); }
    F.f+=(Math.min(1,FLY.sp/2.25)-F.f)*Math.min(1,dt*3); F.u+=(Math.max(-1,Math.min(1,FLY.vy/3))-F.u)*Math.min(1,dt*3); pos.x=Math.max(SHARED.BOUND.x0,Math.min(SHARED.BOUND.x1,pos.x)); pos.z=Math.max(SHARED.BOUND.z0,Math.min(SHARED.BOUND.z1,pos.z)); };
  const cv=renderer.domElement; let L=null;
  UI.off=new THREE.Vector3(); UI.eul=new THREE.Euler(); const viewV=()=>UI.freeCam?UI.camT:UI.off, piv=new THREE.Vector3(), q0=new THREE.Quaternion(), q1=new THREE.Quaternion(), tv=new THREE.Vector3();
  const ndc=e=>{ if(UI.locked&&UI.locked())return new THREE.Vector2(0,0); const r=cv.getBoundingClientRect(); return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)); };
  const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group||q===MUS.g)return false;
    return o.isMesh&&!(o.material&&o.material.visible===false)&&!(o.material&&o.material.transparent&&o.material.opacity<.05); };
  UI.grab=e=>{ if(ED.on&&ED.pickW){ const p=ED.pickW(e); if(p){ piv.copy(p); return; } }
    ray.setFromCamera(ndc(e),SHARED.cam); const h=ray.intersectObjects(scene.children,true).find(h=>shown(h.object)); if(h)piv.copy(h.point); else ray.ray.closestPointToPoint(disp,piv); };
  UI.isoStep=d=>{ const A=Math.PI/4, k=(SHARED.yawTo-Math.PI/4)/A; SHARED.yawTo=Math.PI/4+(d>0?Math.floor(k+1e-6)+1:Math.ceil(k-1e-6)-1)*A; SHARED.yaw=SHARED.yawTo; };
  UI.orbit=(dx,dy)=>{ if(UI.view==='iso'||(MODS.cars&&MODS.cars.driving))return;   // iso tilt is locked and only Q/E/R turn it (the eight angles); a drag never spins or tilts it
    if(UI.persp){ const lk=(UI.lookK||1)/(UI.view==='first'&&!UI.owned()?UI.fz:1); SHARED.yawTo-=dx*.006*lk; SHARED.pitchTo=UI.clampV(SHARED.pitchTo+dy*.005*lk); SHARED.yaw=SHARED.yawTo; SHARED.pitch=SHARED.pitchTo; return; }
    q0.setFromEuler(UI.eul.set(-SHARED.pitch,SHARED.yaw,0,'YXZ')); SHARED.yawTo-=dx*0.008; SHARED.pitchTo=clampP(SHARED.pitchTo+dy*0.006); SHARED.yaw=SHARED.yawTo; SHARED.pitch=SHARED.pitchTo; q1.setFromEuler(UI.eul.set(-SHARED.pitch,SHARED.yaw,0,'YXZ'));
    tv.subVectors(disp,piv); const t0=tv.clone(); tv.applyQuaternion(q0.invert()).applyQuaternion(q1); viewV().add(tv.sub(t0)); disp.add(tv);
    if(!UI.freeCam){ tv.set(0,0,1).applyQuaternion(q1); UI.off.addScaledVector(tv,-UI.off.dot(tv)); } };
  UI.MAXW=30*TILE; UI.NEARH=6.6/.84*TILE; window.CAMW=()=>(SHARED.cam.right-SHARED.cam.left)/TILE;
  SHARED.camMaxW=UI.MAXW;   // the frustum (004-main) caps the visible width here, so full zoom-out is the same extent at every resolution; the zoom just freezes once the view fills it
  let zAt=null; UI.wheelAt=e=>{ if(UI.persp){ SHARED.ppuTo=SHARED.ppu; return; }
    if(e.deltaY>0&&RW/rppu()>=UI.MAXW*.995){ SHARED.ppuTo=SHARED.ppu; zAt=null; return; } const r=cv.getBoundingClientRect(); zAt={x:e.clientX-r.left-r.width/2,y:r.height/2-(e.clientY-r.top)}; };
  UI.zk=()=>(SHARED.cam.right-SHARED.cam.left)/cv.getBoundingClientRect().width;
  UI.zoomStep=k0=>{ if(!UI.persp&&RW/rppu()>=UI.MAXW)SHARED.ppuTo=Math.max(SHARED.ppuTo,SHARED.ppu);   // at the zoom-out limit, hold ppu steady (the frustum cap keeps the extent at MAXW) instead of snapping back
    if(!zAt)return; const k1=UI.zk(); if(Math.abs(k1-k0)<1e-9){ if(Math.abs(SHARED.ppu/SHARED.ppuTo-1)<1e-3)zAt=null; return; } const R0=tv.setFromMatrixColumn(SHARED.cam.matrixWorld,0).clone(), U0=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,1);
    viewV().addScaledVector(R0,zAt.x*(k0-k1)).addScaledVector(U0,zAt.y*(k0-k1)); };
  UI.pan=(dx,dy)=>{ '@later'; const r=cv.getBoundingClientRect(), k=(SHARED.cam.right-SHARED.cam.left)/r.width, R0=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,0), U0=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,1);
    viewV().addScaledVector(R0,-dx*k).addScaledVector(U0,dy*k);
    const T=UI.freeCam?UI.camT:new THREE.Vector3(pos.x,0,pos.z).add(UI.off), m=8*TILE, cx=Math.max(SHARED.BOUND.x0-m,Math.min(SHARED.BOUND.x1+m,T.x))-T.x, cz=Math.max(SHARED.BOUND.z0-m,Math.min(SHARED.BOUND.z1+m,T.z))-T.z; viewV().x+=cx; viewV().z+=cz; };
  UI.view='map'; UI.persp=false; UI.dist=7*TILE; 
  const HEAD=1.5/.84*TILE, EYE=1.62/.84*TILE, LOW=.9/.84*TILE, eyeV=new THREE.Vector3();
  UI.clampV=v=>UI.view==='first'?Math.max(-(UI.upMax||1.2),Math.min(1.3,v)):UI.view==='third'||UI.view==='follow'?Math.max(-.6,Math.min(1.5,v)):clampP(v);
  UI.isoTo=()=>{ let r=null; try{ r=ROOMS.cur; }catch(e){} const t=r?Math.PI*3/4:-Math.PI/4; SHARED.yawTo+=((((t-SHARED.yawTo)%(2*Math.PI))+3*Math.PI)%(2*Math.PI))-Math.PI; SHARED.yaw=SHARED.yawTo; };
  UI.isoTurn=t=>{ SHARED.yawTo+=((((t-SHARED.yawTo)%(2*Math.PI))+3*Math.PI)%(2*Math.PI))-Math.PI; SHARED.yaw=SHARED.yawTo; };
  UI.isoPlace=()=>{};
  UI.setView=v=>{ if(v!=='first'&&UI.view==='first'&&UI.fz!==1&&!UI.owned()){ PCAM.fov=UI.FOV0; PCAM.updateProjectionMatrix(); } if(v!==UI.view)UI.fz=1; UI.view=v; UI.persp=v==='third'||v==='first'||v==='follow'; if(UI.freeCam&&UI.persp)setFree(false);
    if(v==='iso'){ UI.isoTo(); SHARED.pitchTo=Math.PI/6; SHARED.ppuTo=PPU*1.5; UI.off.set(0,0,0); zAt=null; }
    if(v==='follow'){ UI.dist=4*TILE; SHARED.pitchTo=.2; }
    if(v==='first'){ SHARED.pitchTo=.05; UI._fpy=null; } if(v==='third'){ UI.off.set(0,0,0); UI.dist=8*TILE; SHARED.pitchTo=.45; SHARED.yawTo=SHARED.yaw=SHARED.heading+Math.PI; }   // third person opens behind him, looking down the street
    if(!UI.persp)SHARED.pitchTo=clampP(SHARED.pitchTo); try{ SAVE.set('view',v); }catch(e){} };
  // the player's own switch out of the overhead view (owner, 7 Nov 2026: "before switching out of isometric view make sure the view is fully loaded"): SWITCHING VIEW behind the black until all within the new view's reach is painted
  UI.switchView=async v=>{ const into=v==='third'||v==='first'||v==='follow'; if(UI.persp||!into||!SYS.started||FADE.busy){ UI.setView(v); return; }
    await FADE.run('SWITCHING VIEW',()=>{ UI.setView(v); },{settle:true}); };
  UI.inIso=()=>{ UI.setView('iso'); requestAnimationFrame(()=>requestAnimationFrame(()=>UI.isoTo())); };   // going into an inside starts in the overhead view at the room's angle
  UI.turn4=()=>{ if(UI.view==='first'||UI.view==='follow')return; if(UI.view==='iso'){ UI.isoStep(-1); return; } SHARED.yawTo=Math.round((SHARED.yawTo-Math.PI/4)/(Math.PI/2))*(Math.PI/2)+Math.PI/4-Math.PI/2; };
  UI.view3=a=>{
    SHARED.cam=UI.persp?PCAM:OCAM; if(SHARED.RPASS)SHARED.RPASS.camera=SHARED.cam; if(UI.persp&&Math.abs(PCAM.aspect-RW/RH)>1e-3){ PCAM.aspect=RW/RH; PCAM.updateProjectionMatrix(); } if(UI.persp){ const n=UI.view==='first'?.05:.15; if(PCAM.near!==n){ PCAM.near=n; PCAM.updateProjectionMatrix(); } } };   // behind you the near plane sits further out: three times the depth buffer's grain for far faces
  UI.view3b=(a,dt)=>{ W3.group.visible=UI.view!=='first'; if(!UI.persp)return; const sk=W3.SZ||1;
    if(UI.distTo==null||UI.dist!==UI._dl)UI.distTo=UI.dist; else UI.dist=Math.abs(UI.distTo-UI.dist)<1e-3?UI.distTo:UI.dist+(UI.distTo-UI.dist)*Math.min(1,(dt||.016)*12); UI._dl=UI.dist;   // a wheel step eases there; anything else that sets the distance is taken as it is
    if(UI.view==='first'&&!UI.owned()){ const f=2*Math.atan(Math.tan(UI.FOV0*Math.PI/360)/UI.fz)*180/Math.PI; if(Math.abs(PCAM.fov-f)>.01){ PCAM.fov+=(f-PCAM.fov)*Math.min(1,(dt||.016)*12); PCAM.updateProjectionMatrix(); } }   // first person's zoom narrows the eye's view
    if(UI.view==='first'&&RIDE.cur&&RIDE.cur.eye&&RIDE.cur.eye(SHARED.cam.position)){ UI._fpo=null; SHARED.cam.updateMatrixWorld(); return; }   // in a car's seat: its driver's eye, fixed to the car
    if(UI.view==='first'){ if(!(W3.eyeAt&&W3.eyeAt(SHARED.cam.position))){ SHARED.cam.position.set(pos.x,SHARED.py+EYE*sk,pos.z); SHARED.cam.position.addScaledVector(new THREE.Vector3(-Math.sin(a),0,-Math.cos(a)),.12*TILE); }
      { const c=SHARED.cam.position, ox=c.x-pos.x, oy=c.y-SHARED.py, oz=c.z-pos.z, k=1-Math.exp(-(dt||.016)/.2), F=UI._fpo;
        if(!F||UI._fpy==null||Math.abs(SHARED.py-UI._fpy)>TILE){ UI._fpo=[ox,oy,oz,ox,oy,oz]; UI._fpy=SHARED.py; }
        else { UI._fpy+=(SHARED.py-UI._fpy)*(1-Math.exp(-(dt||.016)/.08)); F[0]+=(ox-F[0])*k; F[1]+=(oy-F[1])*k; F[2]+=(oz-F[2])*k; F[3]+=(F[0]-F[3])*k; F[4]+=(F[1]-F[4])*k; F[5]+=(F[2]-F[5])*k; }
        c.set(pos.x+UI._fpo[3],UI._fpy+UI._fpo[4],pos.z+UI._fpo[5]); }   // the eye rides the body, its offset from the body twice low-passed: the head's bob and rock in a step don't reach the view; crouching, stairs and jumps still do
      { const b=FOUNT.bedAt&&FOUNT.bedAt(SHARED.cam.position.x,SHARED.cam.position.z); if(b!=null&&SHARED.cam.position.y<b+LOW*.3)SHARED.cam.position.y=b+LOW*.3; } SHARED.cam.updateMatrixWorld(); return; }
    const FT=FEEL.take(); let T=new THREE.Vector3(pos.x,SHARED.py+(FT?FEEL.cfg.camH*FEEL.MV:HEAD*sk),pos.z); const F=new THREE.Vector3(Math.sin(a)*Math.cos(SHARED.pitch),Math.sin(SHARED.pitch),Math.cos(a)*Math.cos(SHARED.pitch));
    const dv=FOUNT.swim&&st.water&&FOUNT.bedAt?st.water.under:0; if(dv>.01&&W3.eyeAt&&W3.eyeAt(eyeV))T.y+=(Math.min(T.y,eyeV.y+LOW*.4)-T.y)*dv;
    if(FT){ T=FEEL.camT(T).clone(); if(UI.view!=='first'){ FEEL.cfg.camDist=UI.dist/FEEL.MH; FEEL.cfg.camPitch=SHARED.pitchTo; } }
    SHARED.cam.position.copy(T).addScaledVector(F,UI.dist);
    if(UI.view==='follow'){ const k=.45/.84*TILE*sk/Math.hypot(F.x,F.z||1e-6); tv.set(F.z*k,.1/.84*TILE*sk,-F.x*k); SHARED.cam.position.add(tv); T.add(tv); }
    { const ax=pos.x, az=pos.z, bx=SHARED.cam.position.x, bz=SHARED.cam.position.z, L=Math.hypot(bx-ax,bz-az), m=.18*TILE;
      if(L>1e-3&&typeof SHARED.solids!=='undefined'){ const x0=Math.min(ax,bx)-m, x1=Math.max(ax,bx)+m, z0=Math.min(az,bz)-m, z1=Math.max(az,bz)+m, near=SHARED.solids.filter(b=>b[2]>x0&&b[0]<x1&&b[3]>z0&&b[1]<z1);
        if(near.length){ const n=Math.ceil(L/(.05*TILE)), A=tv.set(pos.x,SHARED.py+HEAD*sk,pos.z).clone(); for(let i=1;i<=n;i++){ const u=i/n, x=ax+(bx-ax)*u, z=az+(bz-az)*u;
          if(near.some(b=>x>b[0]-m&&x<b[2]+m&&z>b[1]-m&&z<b[3]+m)){ const f=(i-1)/n; if(f*A.distanceTo(SHARED.cam.position)>=1.5*TILE*sk)SHARED.cam.position.lerpVectors(A,SHARED.cam.position,f); break; } } } } }
    for(const f of UI.camKeeps)f(SHARED.cam.position,T);   // places that keep the camera out of their walls
    if(FT)FEEL.cam(T,SHARED.cam.position); else { let g=SHARED.groundY(SHARED.cam.position.x,SHARED.cam.position.z)+LOW; const b=FOUNT.bedAt&&FOUNT.bedAt(SHARED.cam.position.x,SHARED.cam.position.z); if(b!=null&&dv>.01)g+=(b+LOW*.3-g)*dv; if(SHARED.cam.position.y<g)SHARED.cam.position.y=g; }
    SHARED.cam.lookAt(T); SHARED.cam.updateMatrixWorld(); };
  UI.setView(new URLSearchParams(location.search).get('view')||'iso');
  // the views by place (owner, 7 Nov 2026): in town only the overhead view, turned and zoomed in from the start's distance (never further out); third and first person inside an inside or Central Park; out of those you are put back overhead. Whatever takes the view for itself (fishing, a spyglass, the tower's glass, VR, a holodeck program) keeps it
  UI.ZL=[1,2,5,10,20,40].map(k=>PPU*.75*k); UI.ZOUT=UI.ZL[0];   // the overhead wheel steps between set zoom levels (owner, 7 Nov 2026); 2× is the start's
  UI.FZ=[1,2,5,10]; UI.fz=1; UI.FOV0=PCAM.fov;   // first person's wheel steps the eye's zoom the same way
  UI.DL=[1,2,5,10,20].map(k=>22*TILE/k);   // the behind view's wheel steps the same way: its distance 1×, 2×, 5×, 10×, 20× in from 22 tiles, never nearer than 1.2 or past the place's own limit
  { let acc=0, last=0; UI.zoomLv=e=>{ const t=performance.now(); if(t-last<180){ acc=0; return; } acc+=e.deltaY; if(Math.abs(acc)<40)return; const d=Math.sign(acc); acc=0;
    if(UI.view==='first'){ if(UI.owned())return; const c=UI.fz, n=d<0?UI.FZ.find(v=>v>c*1.02):[...UI.FZ].reverse().find(v=>v<c*.98); if(n==null)return; last=t; UI.fz=n; return; }
    if(UI.persp){ if(UI.view!=='third'&&UI.view!=='follow')return; const lo=UI.distMin||1.2*TILE, hi=UI.distMax||22*TILE, sk=W3.SZ||1, now=SHARED.cam.position.distanceTo(tv.set(pos.x,SHARED.py+HEAD*sk,pos.z)), held=now<UI.dist*.9; if(d>0&&held)return; const c=held?now:UI.distTo??UI.dist, L=[...new Set(UI.DL.map(v=>Math.max(lo,Math.min(hi,v))))];
      const n=d>0?[...L].reverse().find(v=>v>c*1.02):L.find(v=>v<c*.98); if(n==null)return; last=t; UI.distTo=n; return; }
    const c=SHARED.ppuTo; if(d>0&&RW/rppu()>=UI.MAXW*.995)return; const n=d<0?UI.ZL.find(v=>v>c*1.02):[...UI.ZL].reverse().find(v=>v<c*.98); if(n==null)return; last=t; SHARED.ppuTo=n; zAt=null; }; }   // each step zooms round the middle of the screen, wherever you have dragged the view (owner, 7 Nov 2026)
  UI.viewsHere=()=>MODS.cars&&MODS.cars.driving?['third','first']:['iso','third','first'];   // every view everywhere (owner, 7 Nov 2026: "all views from all locations in map, no restrictions"); driving: behind the car or from the driver's seat (owner, 10 Nov 2026)
  { const W=window, own=UI.owned=()=>!!((W.FISHING&&W.FISHING.mode)||(W.OPTIC&&W.OPTIC.up)||(W.TOWERK&&W.TOWERK.spy)||(W.VR&&W.VR.s)||(W.ROAM&&W.ROAM.on)||UI.freeCam||UI.holdCam);
    SYS.add('cam',()=>{ if(!SYS.started||own())return; { const V=UI.viewsHere(); if(!V.includes(UI.view))UI.setView(V[0]); } if(!UI.persp&&SHARED.ppuTo<UI.ZOUT)SHARED.ppuTo=UI.ZOUT; if(UI.view==='iso'&&!UI.hold)SHARED.pitchTo=SHARED.pitch=VIEW0.pitch; if(!UI.persp)UI.keepOn(); },'094-views'); }
  UI.keepOn=()=>{ const c=SHARED.cam; if(!c||!c.isOrthographicCamera)return; const z=c.zoom||1, R=tv.setFromMatrixColumn(c.matrixWorld,0), hw=(c.right-c.left)/2/z*.85, hh=(c.top-c.bottom)/2/z*.8;   // the view drags only as far as keeps you on screen (owner, 7 Nov 2026)
    if(!Number.isFinite(UI.off.x+UI.off.y+UI.off.z))UI.off.set(0,0,0); if(!(hw>0&&hh>0&&Number.isFinite(R.x+R.y+R.z)))return;   // a bad frame never sticks: the view comes back to you
    const bw=.4*TILE, bh=UI.mid(); let u=UI.off.dot(R), k=Math.max(-hw-bw,Math.min(hw+bw,u)); if(k!==u)UI.off.addScaledVector(R,k-u); const U=tv.setFromMatrixColumn(c.matrixWorld,1), ph=hh+bh*Math.abs(U.y); u=UI.off.dot(U); k=Math.max(-ph,Math.min(ph,u)); if(k!==u)UI.off.addScaledVector(U,k-u); };   // any part of you, feet to head (owner, 8 Nov 2026)
  UI.mid=()=>.9/.84*TILE*((W3&&W3.SZ)||1);   // the overhead view looks at your middle, so a zoom with the view undragged goes into you, not your feet
  { const p0=UI.pan; UI.pan=(dx,dy)=>{ p0(dx,dy); if(!UI.freeCam)UI.keepOn(); }; }
  UI.home=()=>{ UI.off.set(0,0,0); zAt=null; if(UI.freeCam)setFree(false); };
  let fx=null, fz=null; const fv=new THREE.Vector3();
  UI.follow=()=>{ const mv=fx!=null&&Math.hypot(pos.x-fx,pos.z-fz)>1e-4; fx=pos.x; fz=pos.z; if(!mv||UI.off.lengthSq()<1e-8)return;
    fv.set(pos.x,SHARED.py+.9,pos.z).project(SHARED.cam); if(Math.abs(fv.x)>.92||Math.abs(fv.y)>.92){ UI.off.set(0,0,0); zAt=null; } };
  cv.addEventListener('pointerdown',e=>{ if(e.button!==0||ED.on)return; if(WIELD&&WIELD.on&&!MAPED.on&&!WE.on&&!LAND.on&&!UI.freeCam&&!SHARED.fishing){ WIELD.strike(); return; } if(MAPED.down(e)||WE.down(e)||LAND.down(e)){ cv.setPointerCapture(e.pointerId); return; } L={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:false}; UI.grab(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(MAPED.dragging){ MAPED.move(e); return; } if(WE.dragging){ WE.move(e); return; } if(LAND.dragging){ LAND.move(e); return; } if(!L)return; if(!L.moved&&Math.hypot(e.clientX-L.x0,e.clientY-L.y0)>5)L.moved=true;
    if(L.moved){ const dx=e.clientX-L.x, dy=e.clientY-L.y; if(!e.shiftKey&&!e.altKey&&!UI.persp)UI.pan(dx,dy); else UI.orbit(dx,dy); } L.x=e.clientX; L.y=e.clientY; });
  cv.addEventListener('pointerup',()=>{ MAPED.up(); WE.up(); if(LAND.up)LAND.up(); L=null; });
  const THINGS=[]; UI.thing=o=>THINGS.push(o); UI.things=THINGS; const seen=o=>{ for(let n=o;n;n=n.parent)if(!n.visible)return false; return true; };
  let goal=null; const said=document.createElement('div'); said.id='said'; said.hidden=true; document.body.appendChild(said);
  const say=(txt,at)=>{ '@later'; const r=cv.getBoundingClientRect(), v=at.clone().project(SHARED.cam); said.textContent=txt; said.style.left=Math.round(r.left+(v.x+1)/2*r.width)+'px'; said.style.top=Math.round(r.top+(1-v.y)/2*r.height)+'px'; said.hidden=false; clearTimeout(say.t); say.t=setTimeout(()=>said.hidden=true,2500); };
  const thAt=th=>th.obj.getWorldPosition(new THREE.Vector3());
  cv.addEventListener('dblclick',e=>{ '@later'; if(MAPED.on||LAND.on)return; if(WE.on){ WE.pick(e); return; } if(ED.on||UI.freeCam)return; ray.setFromCamera(ndc(e),SHARED.cam);
    if(WIELD&&WIELD.on){ const me=THINGS.find(th=>th.name==='YOU'); if(me&&me.obj.visible&&ray.intersectObject(me.obj,true).length)me.act(); return; }   // holding something, a double-click on yourself still opens your avatar (owner, 9 Nov 2026)
    const live=THINGS.filter(th=>seen(th.obj)&&LEVELS.drawn(th.obj)); const hits=ray.intersectObjects(live.map(th=>th.obj),true);
    const thOf=o=>live.find(th=>{ let q=o; while(q){ if(q===th.obj)return true; q=q.parent; } return false; });
    let best=null, bd=1e9; if(hits.length){ const th=thOf(hits[0].object); if(th){ best=th; bd=hits[0].distance; }
      if(th&&th.glass)for(const h of hits.slice(1)){ const t=thOf(h.object); if(t&&t.far){ best=t; bd=h.distance; break; } if(t&&!t.glass)break; } }   // through a window's glass to what you can use from afar (the TV)
    const u=USE.pick(ray); if(u&&u.d<bd)best=u.th;
    if(best){ if(best.far){ goal=null; best.act(); } else walkUp(best); return; }   // a thing marked far (the TV) is used from wherever you see it
    if(RIVER&&RIVER.pick&&!VIT.dead&&RIVER.pick(ray.ray,pos))return;
    goal=null; });
  UI.nearThing=()=>{ if(ED.on||UI.freeCam||MAPED.on||WE.on||LAND.on)return null; const hx=Math.sin(SHARED.heading), hz=Math.cos(SHARED.heading), Wt=st.water, py=Wt&&Wt.in&&Wt.level!=null?Wt.y*ZU:SHARED.py; let best=null, bs=1e9;   // a swimmer's own height (a sunken chest is reached by diving to it)
    for(const th of THINGS){ if(th.quiet||!seen(th.obj)||!LEVELS.drawn(th.obj))continue; const p=thAt(th), dx=p.x-pos.x, dz=p.z-pos.z, d=Math.max(0,Math.hypot(dx,dz)-(th.r||0));
      if(d>(th.near||(th.reach||1)+1.2*TILE)||Math.abs(p.y-py)>2*TILE)continue; const s=(th.exit?-1e6:0)+d-(dx*hx+dz*hz)/(d||1)*.6*TILE; if(s<bs){ bs=s; best=th; } }
    if(!best&&typeof USE!=='undefined')for(const dy of [0,-.5,-1.2]){ ray.set(new THREE.Vector3(pos.x,SHARED.py+TILE,pos.z),new THREE.Vector3(hx,dy,hz).normalize()); ray.far=2.4*TILE; const u=USE.pick(ray); ray.far=Infinity; if(u){ best=u.th; break; } }
    return best; };
  // every choice E has (owner, 9 Nov 2026: "when you have multiple things you can press E for you need to be able to scroll through"): what you hold first, then the things in reach nearest first with their own extra acts; the wheel steps through them
  UI.pickI=0; let pickKey='';
  UI.choices=()=>{ if(ED.on||UI.freeCam||MAPED.on||WE.on||LAND.on)return []; const L=[], K=WIELD.on&&WIELD.kinds&&WIELD.kinds[WIELD.on];
    if(K&&K.use)L.push({held:true,name:'USE '+String((FORAGE.name&&FORAGE.name(WIELD.on))||K.name||WIELD.on).toUpperCase()});
    const hx=Math.sin(SHARED.heading), hz=Math.cos(SHARED.heading), Wt=st.water, py=Wt&&Wt.in&&Wt.level!=null?Wt.y*ZU:SHARED.py, S=[];
    for(const th of THINGS){ if(th.quiet||th.name==='YOU'||!seen(th.obj)||!LEVELS.drawn(th.obj))continue; const p=thAt(th), dx=p.x-pos.x, dz=p.z-pos.z, d=Math.max(0,Math.hypot(dx,dz)-(th.r||0));
      if(d>(th.near||(th.reach||1)+1.2*TILE)||Math.abs(p.y-py)>2*TILE)continue; S.push([d-(dx*hx+dz*hz)/(d||1)*.6*TILE,th]); }
    S.sort((a,b)=>a[0]-b[0]); if(!S.length){ const b=UI.nearThing(); if(b)S.push([0,b]); }
    for(const [,th] of S.slice(0,4)){ L.push({th,name:th.name}); for(const a of th.acts||[])L.push({th,sub:a,name:a.name}); }
    { const ex=L.filter(c=>c.th&&c.th.exit&&!c.sub); if(ex.length){ for(const c of ex)L.splice(L.indexOf(c),1); L.unshift(...ex); } }   // a way out of an inside comes first, even before what you hold (owner, 9 Nov 2026: "make exit come first")
    const k=L.map(c=>c.name).join('|'); if(k!==pickKey){ pickKey=k; UI.pickI=0; } if(UI.pickI>=L.length)UI.pickI=0; return L; };
  let pickT=0; UI.pickStep=d=>{ const L=UI.choices(); if(L.length<2)return false; const t=performance.now(); if(t-pickT<160)return true; pickT=t; UI.pickI=(UI.pickI+(d>0?1:L.length-1))%L.length; if(PROMPT)PROMPT.tick(); return true; };
  UI.useKey=()=>{ if(UI.menuOpen||UI.gamewin||SHARED.covered||TALK.on)return; if(RIDE.on&&WIELD.useHeld&&WIELD.useHeld())return; const L=UI.choices(), c=L[UI.pickI];
    if(!c){ if(WIELD.useHeld)WIELD.useHeld(); return; } if(c.held){ WIELD.useHeld(); return; } walkUp(c.sub?{...c.th,name:c.sub.name,act:c.sub.act}:c.th); };
  UI.useNear=()=>{ const best=UI.nearThing(); if(!best)return false; walkUp(best); return true; };
  UI.go=d=>{ UI.clickGo=true; UI.clickRun=d>6; };
  const GAITR=[0,.5,1]; UI.gaitRun=()=>VIT.tired?0:GAITR[SHARED.gait||0];   // walk or run (owner, 9 Nov 2026: "get rid of the jog and only use run (shift once)")
  UI.runTick=()=>{ st.jog=(SHARED.gait||0)===1&&!VIT.tired; if(!UI.clickGo){ if(!UI.menuOpen)st.runTarget=UI.gaitRun(); return; } if(!SHARED.target){ UI.clickGo=false; st.runTarget=UI.gaitRun(); return; } st.runTarget=Math.max(UI.gaitRun(),!VIT.tired&&UI.clickRun&&Math.hypot(SHARED.target.x-pos.x,SHARED.target.z-pos.z)>1.6?1:0); };
  // E and the double click: in reach, used from where you stand; a little out of reach, a walk up first; there you stop dead and use it (owner, 10 Nov 2026)
  const gap=th=>{ const p=thAt(th); return Math.max(0,Math.hypot(p.x-pos.x,p.z-pos.z)-(th.r||0)); }, reachOf=th=>th.pick?Math.min(th.reach||1,.5*TILE):th.reach||1, nearOf=th=>th.near||reachOf(th)+1.2*TILE;
  const halt=()=>{ goal=null; SHARED.target=null; UI.clickGo=false; st.target=0; st.w=0; st.mv=st.mvw=0; st.stop=null; };   // stopped dead: no stride carried into what comes next
  const useNow=g=>{ const p=thAt(g), d=gap(g), up=p.clone().setY(p.y+(g.tall||1.6)); halt(); SHARED.heading=Math.atan2(p.x-pos.x,p.z-pos.z);
    if(VIT.dead&&!g.ghost)return say('YOU ARE A GHOST.',up); { const why=g.can&&g.can(); if(why&&why!==true)return say(String(why).toUpperCase(),up); }
    const free=!st.sit&&!st.ride&&!(st.water&&st.water.in);
    if(g.pick&&free){ RIG.act(st,{pick:((g.pick===true?p.y:SHARED.py+g.pick)-SHARED.py)/W3.group.scale.y,z:d/W3.group.scale.x}); setTimeout(()=>g.act(),330); }
    else { if(!g.npc&&free&&!st.move)MOTION.play(/DOOR|GATE|HATCH|FRIDGE|CABINET|CHEST|LOCKER|CLOSET/.test(String(g.name||'').toUpperCase())?'pf_Open':'pf_Use'); g.act(); }
    if(g.npc&&typeof LINES!=='undefined'){ if(!TALK.on)LINES.say(g.npc,'greet'); } else say(g.name,up); };
  const walkUp=UI.walkUp=th=>{ if(gap(th)<=reachOf(th))return useNow(th); goal={th}; };
  const WALKK=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
  UI.goTick=()=>{ if(!goal)return; const g=goal.th; if(!g.obj.visible||WALKK.some(k=>keys.has(k))||VIT.out>0){ goal=null; return; }   // walking away calls it off
    const d=gap(g); if(d<=reachOf(g))return useNow(g);
    if(goal.on&&!SHARED.target){ if(d<=nearOf(g))useNow(g); else goal=null; return; }   // stopped short (a counter, a wall): use it from there if it is in reach at all
    const p=thAt(g), k=(d-reachOf(g)*.8)/Math.max(d,1e-6); SHARED.target=new THREE.Vector3(pos.x+(p.x-pos.x)*k,SHARED.py,pos.z+(p.z-pos.z)*k); if(!goal.on)UI.go(d); goal.on=true; };
  const css=document.createElement('style'); css.textContent=`
  #mode{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(124px + var(--fy,0px) + env(safe-area-inset-bottom,0px));font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15}
  #mode[hidden],#said[hidden]{display:none}
  #menu .box,#looks,#we,#movesp,#stat,#said,.said2,#vit,#moves{zoom:var(--uiz,1)}
  #said{position:fixed;transform:translate(-50%,-100%);font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:4px 8px;pointer-events:none;z-index:14}
  #menu{--mf:#7dffa8;--mi:#3aa866;--mb:#031a0d;--mt:#7dffa8;--md:#3aa866;--mo:#d8ffe4;--me:#0d3a1f;--mk:#020a06;--ms:#3aa866;--pixel:'Share Tech Mono',ui-monospace,monospace;--key:var(--mo);--fg:var(--mt);--dim:var(--md);--line:var(--mi);position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(5,6,10,.55);z-index:30}
  #menu[hidden]{display:none}
  #menu .box{width:min(1000px,96vw);max-height:92vh;overflow:auto;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto 1fr auto;gap:12px;padding:12px;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),var(--mk);box-shadow:0 0 0 2px var(--mi);font:20px/1.45 var(--pixel);letter-spacing:2px;color:var(--mt)}
  #menu .frame,#menu .tabs,#menu .pane{background:rgba(3,26,13,.85);box-shadow:inset 0 0 0 2px var(--mi)}
  #menu .ttl{grid-column:1/-1;display:flex;justify-content:space-between;gap:16px;padding:10px 52px 10px 18px;color:var(--mf);font-size:24px;letter-spacing:4px} #menu .ttl span:first-child::before{content:'[ '} #menu .ttl span:first-child::after{content:' ]'} #menu .ttl span+span{color:var(--md);font-size:16px}
  #menu .tabs{display:flex;flex-direction:column;gap:4px;padding:16px 10px;align-self:start} #menu .tabs button{font:inherit;text-align:left;white-space:nowrap;color:var(--mt);background:transparent;border:0;padding:8px 10px;cursor:pointer}
  #menu .tabs button:hover{color:var(--mo)} #menu .tabs button[aria-selected="true"]{color:var(--mk);background:var(--mf)}
  #menu .pane{grid-column:2;grid-row:2;padding:18px 16px;min-width:0} #menu .box.home .pane{grid-column:1/-1} #menu .pane[hidden]{display:none}
  #menu h3{font-size:13px;color:var(--md);margin:18px 0 6px;padding:0 4px 6px;border-bottom:2px solid var(--mi)} #menu h3:first-child{margin-top:0}
  #menu .row{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin:4px 0} #menu .row>span:first-child{flex:1;width:auto!important;padding:6px 4px;white-space:nowrap}
  #menu .btn{font:inherit;color:var(--md);background:transparent;border:0;padding:6px 6px;cursor:pointer} #menu .btn:hover,#menu .btn:focus-visible{color:var(--mk);background:var(--mf);outline:0}
  #menu .btn[aria-pressed="true"]{color:var(--mo)} #menu .btn[aria-pressed="true"]:hover{color:var(--mb)} #menu .btn:not([aria-pressed]){color:var(--mt)} #menu .dim{color:var(--md);font-size:15px;line-height:1.6}
  #menu input[type=range]{width:140px;height:16px;margin:0;-webkit-appearance:none;appearance:none;border:0;box-shadow:0 0 0 2px var(--mk);cursor:pointer;background:repeating-linear-gradient(90deg,transparent 0 16px,var(--mk) 16px 21px),linear-gradient(90deg,var(--mo) var(--p,50%),var(--me) var(--p,50%))}
  #menu input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:4px;height:16px;background:transparent;border:0}
  #menu input[type=range]::-moz-range-thumb{width:4px;height:16px;background:transparent;border:0}
  #menu .pick .btn{display:none} #menu .pick .btn[aria-pressed="true"],#menu .pick .btn.arr{display:inline-block;color:var(--mt)} #menu .pick .btn.arr{color:var(--md)} #menu .pick .btn:hover{color:var(--mb)}
  #menu .onoff .btn{flex:1;display:flex;justify-content:space-between;text-align:left;color:var(--mt)} #menu .onoff .btn::after{content:'OFF';color:var(--md)} #menu .onoff .btn[aria-pressed="true"]::after{content:'ON';color:var(--mo)} #menu .onoff .btn:hover::after{color:inherit}
  #menu select{font:inherit;color:var(--mt);background:var(--mb);border:2px solid var(--mi);padding:6px 8px}
  #menu #dhome .cp-live,#menu #dhome .cp-btn .cp-tag{font-size:13px;line-height:1.5} #menu #dhome .cp-btn{font-size:20px}
  #menu #dhome .cp-btn{border-color:transparent;background:transparent;box-shadow:none;padding:8px 10px} #menu #dhome .cp-btn:hover{color:var(--mk);background:var(--mf)} #menu #dhome .cp-btn:hover .cp-tag{color:var(--mk)} #menu #dhome .cp-stage{background:var(--mb)}
  #menu canvas{display:block;margin:0 auto;max-width:100%;image-rendering:pixelated;border:2px solid var(--mi);cursor:crosshair;background:var(--mk)}
  #menu table{border-collapse:collapse;width:100%} #menu td{padding:2px 6px;border-bottom:1px solid var(--me);font-size:15px;line-height:1.3} #menu td:last-child{text-align:right} #menu td .btn{padding:1px 6px}
  #keytab{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));column-gap:20px} #keytab tbody{display:contents} #keytab tr{display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid var(--me);min-width:0} #keytab td{border:0;padding:2px 4px;font-size:13px;letter-spacing:1px} #keytab td:first-child{flex:1;min-width:0} #keytab td:last-child{white-space:nowrap} #keytab tr:has(td[colspan]){grid-column:1/-1;border:0} #keytab tr:has(td[colspan]) td{flex:1;text-align:left}
  #menu.solo .tabs{display:none} #menu.solo .box{grid-template-columns:minmax(0,1fr)} #menu.solo .pane{grid-column:1/-1} #menu.solo #mapcv{display:block;margin:0 auto;max-width:100%;max-height:calc(92vh - 300px);width:auto!important;image-rendering:pixelated}
  #menu .box{grid-template-columns:200px minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);height:min(760px,92vh);overflow:hidden}
  #menu .tabs{grid-column:1;grid-row:2/4;align-self:stretch} #menu .tabs button{display:flex;justify-content:space-between;gap:10px} #menu .tabs button u{text-decoration:none;color:var(--md);font-size:13px} #menu .tabs button[aria-selected="true"] u{color:var(--mk)}
  #menu .tabs .adm{margin-top:auto;color:#ffd27a} #menu .tabs .adm[aria-selected="true"]{color:var(--mk);background:#ffd27a}
  #menu .subs{grid-column:2;grid-row:2;display:flex;flex-wrap:wrap;gap:4px;padding:8px 10px;background:rgba(3,26,13,.85);box-shadow:inset 0 0 0 2px var(--mi)} #menu .subs:empty{display:none}
  #menu .subs button{font:inherit;color:var(--mt);background:transparent;border:0;padding:4px 10px;cursor:pointer;letter-spacing:inherit} #menu .subs button:hover{color:var(--mo)} #menu .subs button[aria-selected="true"]{color:var(--mk);background:var(--mf)} #menu .subs button.act::after{content:' ↗';color:var(--md)}
  #menu .panes{grid-column:2;grid-row:3;min-height:0;overflow:auto;padding:18px 16px;background:rgba(3,26,13,.85);box-shadow:inset 0 0 0 2px var(--mi)}
  #menu .panes>.pane{grid-column:auto;grid-row:auto;padding:0;background:none;box-shadow:none;min-width:0} #menu .panes>.pane:not([hidden])~.pane:not([hidden]){margin-top:26px}
  #menu .box>.pX{color:var(--mt);background:var(--mk);border:0;box-shadow:inset 0 0 0 2px var(--mi);font-family:var(--pixel)} #menu .box>.pX:hover{color:var(--mk);background:var(--mf)}
  #menu.solo .subs{display:none} #menu.solo .panes{grid-column:1/-1;grid-row:2/4}
  #menu .you{display:grid;grid-template-columns:220px minmax(0,1fr);gap:20px} #menu #dhome .cp-wrap{flex-direction:column}
  #menu .inmenu{position:static!important;inset:auto!important;transform:none!important;width:auto!important;max-height:none!important;overflow:visible!important;padding:0!important;margin:0!important;background:none!important;box-shadow:none!important;border:0!important;zoom:1!important;z-index:auto!important}
  #menu #looks h2,#menu #looks .ltabs,#menu #looks #lclose,#menu #packp>div:first-child,#menu .inmenu>.pX{display:none!important}
  @media (max-width:640px){ #menu .box{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto minmax(0,1fr);font-size:14px} #menu .tabs{grid-row:2;flex-direction:row;flex-wrap:wrap} #menu .tabs .adm{margin-top:0} #menu .subs{grid-column:1;grid-row:3} #menu .panes{grid-column:1;grid-row:4} #menu .you{grid-template-columns:minmax(0,1fr)} #menu #dhome .cp-btn{font-size:14px} }`;
  document.head.appendChild(css);
  const M=document.createElement('div'); M.id='menu'; M.hidden=true; M.innerHTML=`<div class="box" role="dialog" aria-label="Menu">
    <div class="ttl frame"><span id="mttl">THE STRANGEST FLEA MARKET</span><span id="msec"></span></div>
    <div class="tabs" role="tablist" id="mnav"></div><div class="subs" role="tablist" id="msub"></div><div class="panes">
    <div class="pane you" data-p="home"><div id="dhome"></div><div id="dlooks"></div></div>
    <div class="pane" data-p="pack" id="dpack"></div><div class="pane" data-p="people" id="dpeople"></div><div class="pane" data-p="bbs" id="dbbs"></div>
    <div class="pane" data-p="map"><div class="row"><button class="btn" data-lv="up">THE STREET</button><button class="btn" data-lv="down">UNDERGROUND</button><button class="btn" id="myapt">MY APARTMENT</button><span class="dim">click the map to go there</span></div>
      <div class="row" id="mapz"></div><canvas id="mapcv" style="cursor:grab;touch-action:none"></canvas><h3>GO TO</h3><div class="row"><select id="placesel" class="btn" style="font:inherit;min-width:min(340px,80vw);padding:6px 8px;background:#0e1016;color:#ece5d3;border:2px solid #3a3f4e"></select></div></div>
    <div class="pane" data-p="display">
      <div class="row"><span>ZOOM</span><input type="range" id="dzoom" min="0" max="1" step="0.001"></div>
      <div class="row" hidden><span>TILT</span><input type="range" id="dtilt" min="0" max="1" step="0.001"></div>
      <div class="row pick" id="dview"><span>VIEW</span><button class="btn" data-view="map">MAP VIEW</button><button class="btn" data-view="iso">ISOMETRIC</button><button class="btn" data-view="third">THIRD PERSON</button><button class="btn" data-view="follow">BEHIND</button><button class="btn" data-view="first">FIRST PERSON</button></div>
      <div class="row"><button class="btn" id="dreset">RESET THE VIEW</button></div></div>
    <div class="pane" data-p="camera">
      <div class="row onoff"><button class="btn" id="dbody">PHYSICS BODY</button></div>
      <div class="row"><span>LOOSE</span><input type="range" id="dloose" min="0" max="1" step="0.01"></div>
      <div class="row onoff"><button class="btn" id="dsway">CAMERA SWAY</button></div>
      <div class="row"><span>SWAY LEVEL</span><input type="range" id="dswayl" min="1" max="10" step="1"><span id="dswaylv"></span></div></div>
    <div class="pane" data-p="screen">
      <div class="row pick"><span>UI SCALE</span><button class="btn" data-ui="small">SMALL</button><button class="btn" data-ui="medium">MEDIUM</button><button class="btn" data-ui="large">LARGE</button></div>
      <div class="row pick"><span>SCREEN LAYOUT</span><button class="btn" id="uireset">RESET</button><span class="dim">DRAG ANY WINDOW OR PIECE OF THE SCREEN TO MOVE IT</span></div></div>
    <div class="pane" data-p="chat"></div>
    <div class="pane" data-p="atmo">
      <div id="adn"></div>
      <div hidden><h3>HAZE</h3><div class="row" id="atmhaze"></div></div></div>
    <div class="pane" data-p="weather"><div id="awx"></div></div>
    <div class="pane" data-p="light"><div class="row"><button class="btn" id="dlook">GLOW AND NIGHT LOOK</button></div></div>
    <div class="pane" data-p="graphics">
      <div class="row" id="dres"></div>
      <div hidden><div class="row" id="dshd"></div>
      <div class="row"><button class="btn" id="danim">ANIMATION</button><button class="btn" id="dlit">LIGHT ON THEM</button><button class="btn" id="doutl">OUTLINE</button></div>
      <div class="row"><span>SHADE STEPS</span><input type="range" id="dsteps" min="2" max="12" step="1"></div><div class="row"><span>SHADOW DEPTH</span><input type="range" id="ddepth" min="0.02" max="0.98" step="0.005"></div></div></div>
    <div class="pane" data-p="filter"><div class="row" id="dfil"></div></div>
    <div class="pane" data-p="sound"><h3>SOUND</h3><div class="row"><button class="btn" id="dsnd">SOUND</button><span class="dim">every sound in the game; off until you turn it on</span></div><div class="row"><button class="btn" id="dsfx">EFFECTS</button><button class="btn" id="damb">AMBIENCE</button><span>VOLUME</span><input type="range" id="dvol" min="0" max="1" step="0.01"></div></div>
    <div class="pane" data-p="keys"><div class="dim" style="margin-bottom:8px">click a key, then press the one you want (Escape to keep it)</div><table id="keytab"></table>
      <div class="row" style="margin-top:10px"><button class="btn" id="kreset">ALL BACK AS THEY WERE</button></div><div id="credits" class="dim" style="margin-top:14px;font-size:9px"></div></div>
    <div class="pane" data-p="padset" id="dpad"></div>
    <div class="pane" data-p="vr" id="dvr"></div>
    <div class="pane" data-p="guide" id="dguide"></div>
    <div class="pane" data-p="moves" id="dmoves"></div>
    <div class="pane" data-p="pets" id="dpets"></div>
    <div class="pane" data-p="bug" id="dbug"></div>
    <div class="pane" data-p="queue" id="dqueue"></div>
    <div class="pane" data-p="tenants" id="dten"></div>
    <div class="pane" data-p="text" id="dtext"></div>
    <div class="pane" data-p="editors" id="deditors"></div>
    <div class="pane" data-p="tools" id="dtools"></div>
    <div class="pane" data-p="bag" id="dbag"></div>
    <div class="pane" data-p="vehicles" id="dveh"></div>
    <div class="pane" data-p="vedit" id="dvedit"></div>
    <div class="pane" data-p="snded" id="dsnded"></div></div></div>`;
  document.body.appendChild(M);
  const $=s=>M.querySelector(s); let mapLv='up';
  // the one menu (owner, 5 Nov 2026: "B"): its sections down the left, each section's parts as tabs along the top; [id, name, key, parts or null, what a section without parts does]; a part is [id, name, its panes, or what it does]
  const shut=()=>{ if(UI.menuOpen)toggleMenu(); };
  const SEC=[   // SETTINGS, PETS, INVENTORY, MAP, GUIDE, PEOPLE for every player, ADMIN for the owners (owner, 7 and 11 Nov 2026); no PROFILE: you are your paper doll, double-click yourself (owner, 9 Nov 2026)
    ['set','SETTINGS','',[['view','VIEW',['display']],['camera','CAMERA',['camera']],['screen','SCREEN',['screen']],['chat','CHAT',['chat']],['res','GRAPHICS',['graphics']],['filter','EFFECTS',['filter']],['time','TIME',['atmo']],['weather','WEATHER',['weather']],['light','LIGHT',['light']],['sound','SOUND',['sound']],['keys','KEYS',['keys']],['pad','CONTROLLER',['padset']],['vr','VR',['vr']],['bug','REPORT A BUG',['bug']]]],   // every setting its own tab (owner, 8 Nov 2026: "everything needs its own tab, easier to find")   // no BBS (owner, 7 Nov 2026); the chat stays in the corner
    ['moves','WHAT YOU CAN DO','?',[['move','MOVING'],['fight','FIGHTING'],['climb','CLIMBING & SWIMMING'],['ride','RIDING'],['out','OUTDOORS'],['games','GAMES & PLACES'],['home','YOUR APARTMENT'],['people','PEOPLE & MONEY'],['pad','CONTROLLER, TOUCH & VR']].map(([k,n])=>[k,n,['moves']])],   // every activity by category, its moves (owner, 10 Nov 2026)
    ['pets','PETS','',[['mine','YOUR PETS',['pets']],['pet','THEIR LOOK',['home']]]],   // every player's pets (owner, 8 Nov 2026)
    ['pack','INVENTORY','I',[['bag','BAG',['bag']],['skills','SKILLS',['pack']],['book','BOOK',['pack']],['fishing','FISHING',['pack']],['journal','JOURNAL',['pack']]]],
    ['map','MAP','SHIFT+M',null,()=>{ shut(); UI.mapWindow(); }],   // the brochure map, its own window (owner, 12 Nov 2026: "bring the old map look back")
    ['guide','GUIDE','',[['guide','THE GUIDE',['guide']]]],   // back in the menu (owner, 11 Nov 2026)
    ['people','PEOPLE','',[['people','ON YOUR BLOCK',['people']]]],   // back in the menu (owner, 11 Nov 2026)
    ['bbs','BBS','',[['shop','THE BODEGA',['bbs']],['furn','FURNITURE',['bbs']],['games','THE ARCADE',['bbs']],['orders','YOUR ORDERS',['bbs']]]],   // only from your computer, never in the menu's list
    ['tenants','TENANTS','',[['players','TENANTS',['tenants']]]],   // owners only, each its own (owner, 8 Nov 2026)
    ['admin','★ ADMIN','',[['queue','BUG QUEUE',['queue']],['text','TEXT',['text']],['editors','EDITORS',['editors']],['look','AVATAR',['home']],['veh','VEHICLES',['vehicles']],['vedit','VEHICLE EDITOR',['vedit']],['snded','SOUND EDITOR',['snded']],['tools','TOOLS',['tools']]]]];   // AVATAR: your look, owners only (owner, 9 Nov 2026: "the avatar editor should only be in the admin menu (since players cant edit themselves after they start)")   // TEXT its own tab (owner, 7 Nov 2026); no TESTS (owner, 8 Nov 2026)
  const OLD={home:['admin','look'],display:['set','view'],camera:['set','camera'],screen:['set','screen'],graphics:['set','res'],filter:['set','filter'],atmo:['set','time'],weather:['set','weather'],light:['set','light'],sound:['set','sound'],keys:['set','keys'],vr:['set','vr'],bug:['set','bug'],tenants:['tenants','players'],city:['set']};
  let cur='set', own=false; const last={}, OWN=new Set(['tenants','admin']);
  const mount=(id,host,on)=>{ const el=document.getElementById(id); if(!el)return null; if(on){ if(el.parentNode!==host)host.appendChild(el); el.classList.add('ml','inmenu'); el.hidden=false; } else if(el.parentNode!==document.body){ el.classList.remove('inmenu'); el.hidden=true; document.body.appendChild(el); } return el; };
  const people=()=>{ '@later'; const all=ONLINE.others?[...ONLINE.others.values()]:[], E=TEXT.esc;
    $('#dpeople').innerHTML=!ONLINE.on?'<div class="dim">nobody else here: other players are on the website, thestrangestfleamarket.com</div>':'<h3>ON YOUR BLOCK · '+(all.length+1)+'</h3><table>'+all.map(o=>'<tr><td>'+E(o.name||'TENANT')+'</td><td>'+(ONLINE.visit&&!(o.x&&o.x.noapt)?'<button class="btn" data-visit="'+E(o.id)+'">VISIT THEIR APARTMENT</button>':'')+'</td></tr>').join('')+'</table>'+(all.length?'':'<div class="dim">nobody else is on</div>')+'<div class="dim" style="margin-top:10px">drag a thing from your bag onto a player to trade</div>'; };
  $('#dpeople').addEventListener('click',e=>{ const b=e.target.closest('[data-visit]'); if(!b)return; const o=ONLINE.others&&ONLINE.others.get(b.dataset.visit); if(o&&ONLINE.visit){ shut(); ONLINE.visit(o.id,o.name); } });
  const nav=()=>{ $('#mnav').innerHTML=SEC.filter(S=>S[0]!=='bbs'&&(!OWN.has(S[0])||own)).map(([k,n,key])=>'<button role="tab" data-sec="'+k+'" aria-selected="'+(k===cur)+'"'+(k==='admin'?' class="adm"':'')+'>'+n+(key?'<u>'+key+'</u>':'')+'</button>').join(''); };
  const show=(sec,sub)=>{ const S=SEC.find(x=>x[0]===sec&&(!OWN.has(sec)||own))||SEC[0];
    if(!S[3]){ S[4](); return; }
    const P=S[3].find(x=>x[0]===sub); if(P&&typeof P[2]==='function'){ P[2](); return; }
    const pt=P||S[3].find(x=>x[0]===last[S[0]])||S[3].find(x=>Array.isArray(x[2])); cur=S[0]; last[cur]=pt[0];
    nav(); $('#msec').textContent=S[1].replace('★ ','');
    $('#msub').innerHTML=S[3].map(([k,n,w])=>'<button role="tab" data-sub="'+k+'" aria-selected="'+(k===pt[0])+'"'+(Array.isArray(w)?'':' class="act"')+'>'+n+'</button>').join('');
    const on=new Set(pt[2].filter(p=>p!=='sound'||SOUND)); M.querySelectorAll('.panes>[data-p]').forEach(p=>p.hidden=!on.has(p.dataset.p)); $('.panes').scrollTop=0;
    if(on.has('home')){ if(CHARP.show)CHARP.show($('#dhome')); if(LOOKS.open){ LOOKS.only=null; LOOKS.open(); mount('looks',$('#dlooks'),true); LOOKS.tab(pt[0]); } } else { if(CHARP.hide)CHARP.hide(); mount('looks',null,false); }
    if(on.has('pack')&&FORAGE.PACK){ mount('packp',$('#dpack'),true); FORAGE.PACK.tab=pt[0]; FORAGE.PACK.open=true; FORAGE.PACK.draw(); } else { if(mount('packp',null,false)&&FORAGE.PACK)FORAGE.PACK.open=false; }
    if(on.has('bag')&&BAG.into)BAG.into($('#dbag')); else if(BAG.out)BAG.out();   // the bag inside the menu (owner, 10 Nov 2026)
    if(on.has('people'))people(); if(on.has('pets')&&PETS.menu)PETS.menu($('#dpets'));
    if(on.has('bbs')){ if(DRONE.menu)DRONE.menu($('#dbbs'),pt[0]); else $('#dbbs').innerHTML='<div class="dim">the BBS answers once your apartment is built</div>'; }
    if(on.has('guide')&&GUIDE.open)GUIDE.open($('#dguide'));
    if(on.has('moves')&&UI.movesInto)UI.movesInto($('#dmoves'),pt[0]);
    if(on.has('bug'))BUGS.open($('#dbug')); if(on.has('queue'))BUGS.open($('#dqueue'),'queue');
    if(['display','camera','screen','graphics','filter','sound','atmo','light'].some(k=>on.has(k)))drawDisplay(); if(on.has('keys'))drawKeys(); if(on.has('vr')&&VR.open)VR.open($('#dvr')); if(on.has('padset')&&UI.padPage)UI.padPage($('#dpad'));
    if(on.has('atmo'))DN&&DN.draw(); if(on.has('tenants')&&TENANTS.open)TENANTS.open($('#dten')); if(on.has('text')&&TENANTS.text)TENANTS.text($('#dtext')); if(on.has('tools')&&CHARP.tools)CHARP.tools($('#dtools')); if(on.has('editors')&&CHARP.editors)CHARP.editors($('#deditors')); if(on.has('vehicles')&&SPEED.panel)SPEED.panel($('#dveh')); if(on.has('vedit')&&VLOOK.panel)VLOOK.panel($('#dvedit')); if(on.has('snded')&&SNDED.panel)SNDED.panel($('#dsnded'));
    bars(); };
  $('#mnav').addEventListener('click',e=>{ const b=e.target.closest('[data-sec]'); if(b)show(b.dataset.sec); });
  $('#msub').addEventListener('click',e=>{ const b=e.target.closest('[data-sub]'); if(b)show(cur,b.dataset.sub); });
  UI.menuNow=()=>UI.menuOpen?[cur,last[cur]]:null;
  M.querySelectorAll('.row.pick').forEach(r=>{ const o=()=>[...r.querySelectorAll('.btn:not(.arr)')], arr=(t,d)=>{ const b=document.createElement('button'); b.className='btn arr'; b.textContent=t; b.setAttribute('aria-label',d<0?'previous':'next');
    b.onclick=()=>{ const L=o(), i=L.findIndex(x=>x.getAttribute('aria-pressed')==='true'); L[(i+d+L.length)%L.length].click(); }; return b; }; r.insertBefore(arr('<',-1),o()[0]); r.appendChild(arr('>',1)); });   // a row of choices shows only the one picked, stepped with < >
  const bars=()=>M.querySelectorAll('input[type=range]').forEach(r=>r.style.setProperty('--p',(r.value-r.min)/((r.max-r.min)||1)*100+'%')); M.addEventListener('input',bars);
  M.addEventListener('click',e=>{ if(e.target===M)toggleMenu(); });
  UI.toggleMenu=()=>toggleMenu(); UI.menuTab=(t,sub)=>{ const o=OLD[t]; if(o){ t=o[0]; sub=sub||o[1]; } if(!SEC.some(q=>q[0]===t))return; if(!UI.menuOpen)toggleMenu(); M.classList.remove('solo'); document.getElementById('mttl').textContent='THE STRANGEST FLEA MARKET'; show(t,sub); };
  UI.mapWindow=()=>{ if(!UI.menuOpen)toggleMenu(); M.classList.add('solo'); V.z=1; V.cx=null; document.getElementById('mttl').textContent='MAP'; M.querySelectorAll('.panes>[data-p]').forEach(p=>p.hidden=p.dataset.p!=='map'); drawMap(); };   // the map alone, no settings tabs (Shift+M)
  function toggleMenu(){ UI.menuOpen=!UI.menuOpen; M.hidden=!UI.menuOpen; keys.clear(); st.runTarget=0; M.classList.remove('solo'); document.getElementById('mttl').textContent='THE STRANGEST FLEA MARKET';
    if(UI.menuOpen){ mapLv=SHARED.LVL; show(OWN.has(cur)&&!own?'set':cur); if(!own&&CINEMA.isAdmin)CINEMA.isAdmin().then(o=>{ if(o&&!own){ own=true; if(UI.menuOpen)nav(); } }).catch(()=>{}); }
    else { if(CHARP.hide)CHARP.hide(); if(BAG.out)BAG.out(); mount('looks',null,false); if(mount('packp',null,false)&&FORAGE.PACK)FORAGE.PACK.open=false; } }
  const mcv=$('#mapcv'), mg=mcv.getContext('2d'), rt=new THREE.WebGLRenderTarget(8,8), top=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
  const mapRect=lv=>{ const B=lv==='down'?MODS.station.BOUND:MODS.bodega.BOUND;
    const w=B.x1-B.x0, d=B.z1-B.z0, k=Math.min(800/w,420/d); return {x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1,W:Math.round(w*k),H:Math.round(d*k)}; };
  const GAM=new Uint8Array(256).map((_,i)=>Math.round(255*Math.pow(i/255,1/2.2))), CLP=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(0,1,0),0)], cc=new THREE.Color();
  UI.topShot=(R,lv,W,H)=>{ '@later'; const vis={}; rt.setSize(W,H); for(const k in MAPG)vis[k]=MAPG[k].visible; if(MAPG.park)MAPG.park.visible=lv==='up'; const LH=LEVELS.hide(lv==='down'?'station':'street');
    const h0=HEMI.intensity; HEMI.intensity=2.2; const gv=W3.group.visible; W3.group.visible=false; marker.visible=false;
    const yc=lv==='down'?MODS.station.DY:0; CLP[0].constant=yc+1.5; CLP[1].constant=-(yc-2.2);
    top.left=R.x0; top.right=R.x1; top.top=-R.z0; top.bottom=-R.z1; top.position.set(0,yc+60,0); top.up.set(0,0,-1); top.lookAt(0,yc,0); top.near=1; top.far=120; top.updateProjectionMatrix();
    const cp=renderer.clippingPlanes; renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); renderer.clippingPlanes=CLP;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x050507,1); renderer.clear(); renderer.render(scene,top); const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px);
    renderer.setRenderTarget(null); renderer.clippingPlanes=cp; renderer.setClearColor(cc,ca);
    LEVELS.show(LH); for(const k in vis)MAPG[k].visible=vis[k]; HEMI.intensity=h0; W3.group.visible=gv;
    const im=new ImageData(W,H); for(let y=0;y<H;y++){ const o=y*W*4, q=(H-1-y)*W*4; for(let i=0;i<W*4;i+=4){ im.data[o+i]=GAM[px[q+i]]; im.data[o+i+1]=GAM[px[q+i+1]]; im.data[o+i+2]=GAM[px[q+i+2]]; im.data[o+i+3]=255; } } return im; };
  const PLAN={}; const plan=()=>{ if(PLAN.im)return PLAN; const F={...RING.cf}, S=2, W=Math.round((F.x1-F.x0)*S), H=Math.round((F.y1-F.y0)*S), K=BLDK, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY;
    const bt=(x,y)=>[OX+(x-OX)*K,OY+(y-OY)*K], wt=(x,z)=>[OX+x/TILE,OY+z/TILE];
    const P=PARK, px0=P.x0+P.ox, px1=P.x1+P.ox, py0=P.y0+P.oy, py1=P.y1+P.oy, RV=RING.river, G=SHARED.BOD.grounds.filter(g=>!g.bld), RA=SHARED.BOD.road.at;
    const HOME=SECTION.id, SM=MODS.sections;
    const C={void:[11,13,18],lot:[70,66,60],water:[40,86,128],quay:[104,104,98],road:[52,54,60],alley:[70,71,76],walk:[142,138,128],land:[60,104,54],lawn:[74,134,60],way:[186,170,128],wall:[48,52,46],fair:[122,120,116]};
    const FR=(LEVEL.places||[]).filter(p=>p.kind==='fair'||p.kind==='gate');
    const kind=(x,y)=>{ if(x<F.x0||x>F.x1||y<F.y0||y>F.y1)return 'void'; for(const q of FR)if(x>=q.x0&&x<q.x1&&y>=q.y0&&y<q.y1)return 'fair'; const sk=SM&&SM.kindAt(x,y); if(sk)return sk; if(y<RV.y1)return y>RV.y1-1?'quay':'water'; if(RA(x,y))return 'road';
      if(x>px0&&x<px1&&y>py0&&y<py1){ if(x<px0+.5||x>px1-.5||y<py0+.5||y>py1-.5)return 'wall'; if(FOUNT.lake(x-P.ox,y-P.oy)<0)return 'water'; if(FOUNT.ter(x-P.ox,y-P.oy)<0)return 'way'; return P.path&&P.path(x-P.ox,y-P.oy)?'way':P.brook&&(h=>h!=null&&h<P.brook.L(P.brook.q(x-P.ox,y-P.oy)[1]))(P.brook.h(x-P.ox,y-P.oy))?'water':'lawn'; }
      for(let i=G.length-1;i>=0;i--){ const g=G[i]; if(x>=g.x0&&x<g.x1&&y>=g.y0&&y<g.y1)return /road|Road/.test(g.id)?'road':g.id==='alley'?'alley':g.id==='corner'?(g.z<0?'road':'walk'):'walk'; } return 'land'; };
    const KN=Object.keys(C), KS=new Uint8Array(W*H), im=new ImageData(W,H); for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const k=kind(F.x0+(i+.5)/S,F.y1-(j+.5)/S), c=C[k], o=(j*W+i)*4; KS[j*W+i]=KN.indexOf(k); im.data[o]=c[0]; im.data[o+1]=c[1]; im.data[o+2]=c[2]; im.data[o+3]=255; }
    const NP=(LEVEL.places||[]).filter(p=>p.name&&p.kind!=='gate'&&!p.away), bare=n=>(n||'').toUpperCase().replace(/^THE /,''), NAMED=new Set(NP.map(p=>bare(p.name)));
    const B=[], add=(a,b,col,n,k)=>B.push({x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1]),col,n,k:k||'bld'});
    for(const p of LEVEL.places||[])if((p.kind==='front'||p.kind==='gate')&&!p.away)add([p.x0,p.y0!=null?p.y0:LEVEL.block.back],[p.x1,p.y1!=null?p.y1:SHARED.BOD.OY],[110,104,96],'');
    if(!SHARED.BOD.HUD){ const b=SHARED.BOD.B0; add(bt(b.x0,b.y0),bt(b.x1,b.y1),[176,86,58],''); }
    if(MODS.apts&&MODS.apts.A){ const a=MODS.apts.A; add(bt(a.x0,a.y0),bt(a.x1,a.y1),[150,74,58],''); }
    { const g=SHARED.BOD.grounds.find(q=>q.id==='ghostst'); if(g)add(bt(g.x0,g.y0),bt(g.x1,g.y1),[112,78,48],''); }
    if(BLK){ for(const q of BLK.blds)add([q.x0,q.y0],[q.x1,q.y1],[110,100,96],''); for(const q of BLK.lots)add([q.x0,q.y0],[q.x1,q.y1],q.kind==='park'?[64,66,70]:[94,80,64],'','lot'); }
    { const c=CASTLE.stair; add([c.x0,c.y0],[c.x1,c.y1],[120,118,110],'THE DUNGEON STAIR'); }
    for(const q of FR)if(q.kind==='fair')add([q.x0,q.y0],[q.x1,q.y1],[122,120,116],'');
    if(GTOWER.site){ const t=GTOWER.site(); if(t)add(wt(t.x-t.w/2,t.z-t.d/2),wt(t.x+t.w/2,t.z+t.d/2),[130,126,116],"THE SQUIRREL'S TOWER"); }
    if(SM)for(const R of SM.rows)add([R.lot.x0,R.lot.y0],[R.lot.x1,R.lot.y1],R.col||[120,110,100],'');
    for(const st of LOOP.STA||[])if(!st.old)add([st.kiosk.x0,st.kiosk.y0],[st.kiosk.x1,st.kiosk.y1],[30,30,34],st.id+'1 '+st.name);
    add([MAPSTAIR.x0,MAPSTAIR.y0],[MAPSTAIR.x1,MAPSTAIR.y1],[30,30,34],''); { const n=(MAPSTAIR.x0+MAPSTAIR.x1)/2-6; add([n-1.4,-76.35],[n+1.4,-74.85],[46,110,64],''); }
    if(CIVIC.tower){ const c=CIVIC.tower; add(wt(c.x0,c.z0),wt(c.x1,c.z1),[150,142,128],'THE CIVIC TOWER'); }
    for(const R of STORE.rooms||[]){ const a=wt(R.x0,R.z0), b=wt(R.x1,R.z1); if(a[0]>F.x0&&b[0]<F.x1&&Math.max(a[1],b[1])>RV.y1&&Math.min(a[1],b[1])<F.y1&&!NAMED.has(bare(R.name))&&!B.some(q=>Math.abs(q.x0-Math.min(a[0],b[0]))<1&&Math.abs(q.y0-Math.min(a[1],b[1]))<1))add(a,b,[110,104,96],(R.name||'').toUpperCase()); }
    for(const q of B){ const i0=Math.round((q.x0-F.x0)*S), i1=Math.round((q.x1-F.x0)*S), j0=Math.round((F.y1-q.y1)*S), j1=Math.round((F.y1-q.y0)*S);
      for(let j=Math.max(0,j0);j<Math.min(H,j1);j++)for(let i=Math.max(0,i0);i<Math.min(W,i1);i++){ const e=i===i0||i===i1-1||j===j0||j===j1-1, o=(j*W+i)*4; for(let k=0;k<3;k++)im.data[o+k]=e?q.col[k]*.55:q.col[k]; } }
    for(let i=0;i<W;i++)for(const j of [0,H-1]){ const o=(j*W+i)*4; im.data[o]=70; im.data[o+1]=200; im.data[o+2]=210; }
    for(let j=0;j<H;j++)for(const i of [0,W-1]){ const o=(j*W+i)*4; im.data[o]=70; im.data[o+1]=200; im.data[o+2]=210; }
    const L=[], row=(y0,y1)=>y1<SHARED.BOD.FAR?y0-2.5:y1+1.5;
    for(const p of NP){ const y0=p.y0!=null?p.y0:LEVEL.block.back, y1=p.y1!=null?p.y1:SHARED.BOD.OY; L.push(p.kind==='fair'?[p.name,(p.x0+p.x1)/2,(y0+y1)/2]:p.face==='e'&&p.y1!=null?[p.name,p.x1+3,(y0+y1)/2]:[p.name,(p.x0+p.x1)/2,row(y0,y1)]); }
    for(const q of B)if(q.n)L.push([q.n,(q.x0+q.x1)/2,row(q.y0,q.y1)]);
    for(const p of STORE.places||[])if(p[4]==='see'&&p[7])L.push([p[0],...p[7]]);
    L.push(['CENTRAL PARK',(px0+px1)/2,(py0+py1)/2+12],['HUDSON RIVER',(F.x0+F.x1)/2,(RV.y0+RV.y1)/2],[SECTIONS.streets.south,(RING.wr1+RING.ff.x1)/2-40,SHARED.BOD.FAR]);
    const L2=[]; if(SM){ const ST=SECTIONS.streets, rd=SM.road, inn=SM.inner, my=(rd.y0+inn.y0)/2, ny=(rd.y1+inn.y1)/2, wx=(rd.x0+inn.x0)/2, ex=(rd.x1+inn.x1)/2;
      for(const b of SECTIONS.loaded){ const cx=(b.x0+b.x1)/2, cy=(b.y0+b.y1)/2; if(b.row===0){ if(b.id!==HOME)L2.push([ST.south,cx,my]); } else L2.push([ST.north,cx,ny]); if(b.col===0)L2.push([ST.west,wx,cy]); if(b.col===SECTIONS.grid.cols-1)L2.push([ST.east,ex,cy]); } }
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; cv.getContext('2d').putImageData(im,0,0);
    Object.assign(PLAN,{F,S,W,H,cv,L,L2,B,K:KS,KN,sx:x=>(x-F.x0)*S,sy:y=>(F.y1-y)*S,tile:(i,j)=>[F.x0+i/S,F.y1-j/S]}); return PLAN; };
  UI.mapPlan=plan;
  const V={z:1,cx:null,cy:null}, DW=1200, clv=(v,a,b)=>Math.max(a,Math.min(b,v));
  const view=()=>{ const Q=plan(); if(V.cx==null){ V.cx=Q.W/2; V.cy=Q.H/2; } const sw=Q.W/V.z, sh=Q.H/V.z; V.cx=clv(V.cx,sw/2,Q.W-sw/2); V.cy=clv(V.cy,sh/2,Q.H-sh/2); return {Q,sx:V.cx-sw/2,sy:V.cy-sh/2,sw,sh,k:DW/sw}; };
  const toMap=(e,v)=>{ const r=mcv.getBoundingClientRect(), px=v.sx+(e.clientX-r.left)/r.width*DW/v.k, py=v.sy+(e.clientY-r.top)/r.height*mcv.height/v.k; return v.Q.tile(px,py); };
  const zoomTo=(z,px,py,fx=.5,fy=.5)=>{ const Q=plan(); V.z=clv(z,1,8); const sw=Q.W/V.z, sh=Q.H/V.z; V.cx=px-fx*sw+sw/2; V.cy=py-fy*sh+sh/2; drawMap(); };
  { const Z=$('#mapz'), B=(t,f,id)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=t; if(id)b.dataset.sec=id; b.onclick=f; Z.append(b); };
    B('−',()=>{ zoomTo(V.z/1.5,V.cx,V.cy); }); B('+',()=>{ zoomTo(V.z*1.5,V.cx,V.cy); }); const sp=document.createElement('span'); sp.className='dim'; sp.textContent='wheel or +/- to zoom, drag to move'; Z.append(sp); }
  // going to another section: the world starts again behind the fade with only that section loaded 
  UI.goSection=id=>{ '@later'; const S=SECTIONS; if(!S.of(id)||id===S.home.id||FADE.busy)return; const u=new URL(location.href); u.searchParams.set('sec',id); for(const k of ['at','place','fresh'])u.searchParams.delete(k);
    FADE.run('GOING TO SECTION '+id,()=>new Promise(()=>{ location.href=u.toString(); }),{cut:true}); };
  { const Z=$('#mapz'), lab=document.createElement('span'); lab.className='dim'; lab.style.marginLeft='12px'; lab.textContent='GO TO SECTION'; Z.append(lab);
    for(let r=SECTIONS.grid.rows-1;r>=0;r--)for(let c=0;c<SECTIONS.grid.cols;c++){ const id=SECTIONS.ids[c][r], b=document.createElement('button'); b.className='btn'; b.textContent=id; b.title=id===SECTIONS.home.id?'you are here':'go to section '+id;
      if(id===SECTIONS.home.id){ b.setAttribute('aria-pressed','true'); b.disabled=true; } b.onclick=()=>UI.goSection(id); Z.append(b); } }
  const drawDown=(X_,Y_,W,H)=>{ '@later'; mg.fillStyle='#07080b'; mg.fillRect(0,0,W,H); const D=LOOP.D; if(!D)return;
    const rr=(t,col,lw)=>{ const x0=X_(t.west), x1=X_(t.east), y0=Y_(t.north), y1=Y_(t.south), r=Math.min(Math.abs(X_(D.r)-X_(0)),(x1-x0)/2,(y1-y0)/2); mg.strokeStyle=col; mg.lineWidth=Math.max(lw,lw*V.z*.6); mg.beginPath(); mg.roundRect(x0,y0,x1-x0,y1-y0,r); mg.stroke(); };
    rr(D.tracks.outer,'#c88a3a',3); rr(D.tracks.inner,'#3a8ac8',3);
    for(const st of LOOP.STA){ const a=st.my(0), b=st.my(LOOP.XW), x0=X_(st.x0), x1=X_(st.x0+LOOP.LEN), y0=Y_(Math.max(a,b)), y1=Y_(Math.min(a,b)); mg.fillStyle='#1c2028'; mg.fillRect(x0,y0,x1-x0,y1-y0); mg.strokeStyle='#8a8f9c'; mg.lineWidth=1; mg.strokeRect(x0+.5,y0+.5,x1-x0,y1-y0);
      mg.fillStyle='#c8cdd8'; mg.fillRect(x0,Y_(st.my(LOOP.P0)),x1-x0,Y_(st.my(LOOP.P1))-Y_(st.my(LOOP.P0))); } };
  function drawMap(){ '@later'; M.querySelectorAll('[data-lv]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lv===mapLv)));
    const v=view(), Q=v.Q, W=DW, H=Math.round(DW*Q.H/Q.W); if(mcv.width!==W)mcv.width=W; if(mcv.height!==H)mcv.height=H; mcv.style.width='100%';
    const X_=x=>(Q.sx(x)-v.sx)*v.k, Y_=y=>(Q.sy(y)-v.sy)*v.k; mg.imageSmoothingEnabled=false;
    if(mapLv==='up')mg.drawImage(Q.cv,v.sx,v.sy,v.sw,v.sh,0,0,W,H); else drawDown(X_,Y_,W,H);
    mg.textAlign='center'; mg.textBaseline='middle';
    for(const b of SECTIONS.loaded){ const x0=X_(b.x0), x1=X_(b.x1), y0=Y_(b.y1), y1=Y_(b.y0); mg.strokeStyle='rgba(70,200,210,.55)'; mg.lineWidth=1; mg.setLineDash([6,5]); mg.strokeRect(x0+.5,y0+.5,x1-x0,y1-y0); mg.setLineDash([]);
      mg.font=`bold ${Math.round(Math.min(90,(y1-y0)*.22))}px Silkscreen,monospace`; mg.fillStyle='rgba(236,229,211,.18)'; mg.fillText(b.id,(x0+x1)/2,(y0+y1)/2); }
    const U=[], lab=(n,x,y,sz,col)=>{ mg.font=`${sz}px Silkscreen,monospace`; const a=Math.round(X_(x)), w=mg.measureText(n).width/2+2; if(a<-w||a>W+w)return; let b=Math.round(Y_(y)); if(b<-10||b>H+10)return; while(U.some(u=>Math.abs(u[0]-a)<u[2]+w&&Math.abs(u[1]-b)<sz+1))b+=sz+1; U.push([a,b,w]); mg.fillStyle='#000'; mg.fillText(n,a+1,b+1); mg.fillStyle=col; mg.fillText(n,a,b); };
    if(mapLv==='up'){ for(const [n,x,y] of Q.L2)lab(n,x,y,12,'#f2d27a'); if(V.z>=1.6)for(const [n,x,y] of Q.L)lab(n,x,y,V.z>=3?12:10,'#ece5d3'); }
    else for(const st of LOOP.STA)lab(st.id+' · '+st.name,st.x,st.my(LOOP.XW/2)+(st.sg>0?26:-26),12,'#ece5d3');
    if(mapLv!=='up'){ mg.font='12px Silkscreen,monospace'; mg.textAlign='left'; const nn=(SHARED.METRO&&SHARED.METRO.nextHere&&SHARED.METRO.nextHere())||['…','…']; for(const [i,t] of [[0,TEXT.t('map.train1',null,{next:nn[0]})],[1,TEXT.t('map.train2',null,{next:nn[1]})]]){ const y=H-30+i*16; mg.fillStyle=i?'#3a8ac8':'#c88a3a'; mg.fillRect(12,y-2,22,4); mg.fillStyle='#ece5d3'; mg.fillText(t,42,y); } mg.textAlign='center'; }
    if(SHARED.LVL===mapLv){ const a=Math.round(X_(SHARED.BOD.OX+pos.x/TILE)), b=Math.round(Y_(SHARED.BOD.OY+pos.z/TILE)); mg.fillStyle='#000'; mg.fillRect(a-5,b-5,11,11); mg.fillStyle='#f2c14e'; mg.fillRect(a-4,b-4,9,9); } }
  STORE.goTo=(x,z,lv,hd,fl)=>goTo(x,z,lv,hd,fl);
  window.__UI=UI;
  const goTo=(x,z,lv,hd,fl)=>{ pos.set(x,0,z); SHARED.target=null; if(hd!=null)SHARED.heading=hd; SHARED.floor=fl||(typeof lv==='number'?LEVELS.below(lv):lv==='down'?'down':'up'); SHARED.py=typeof lv==='number'?lv:lv==='down'?(L=>L&&L.ground?L.ground(x,z):MODS.station.ground(x,z))(LEVELS.at?LEVELS.of[LEVELS.at(x,z,'down')]:null):0; if(UI.freeCam)UI.camT.set(x,SHARED.py+.9,z); else UI.off.set(0,0,0); if(UI.menuOpen)toggleMenu(); };
  UI.goTo=goTo;
  const toPlace=(x,z,lv,hd)=>{ const up=lv==null||lv==='up', id=up&&ROOMS.boxAt?ROOMS.boxAt(x,z):null; if(id)return ROOMS.enterAt(id,[x,z,0,hd!=null?hd:0]);
    const sr=up&&STORE.enter&&STORE.inside&&(STORE.rooms||[]).find(R=>STORE.inside[R.id]&&x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1); if(sr)return STORE.enter(sr.id,true); goTo(x,z,lv,hd); };   // a GO TO destination inside an off-map inside enters it, not teleport onto its footprint (which the next step would eject you from)
  { let dr=null, moved=false; mcv.addEventListener('pointerdown',e=>{ dr={x:e.clientX,y:e.clientY,cx:V.cx,cy:V.cy}; moved=false; mcv.setPointerCapture(e.pointerId); });
    mcv.addEventListener('pointermove',e=>{ if(!dr)return; const r=mcv.getBoundingClientRect(), v=view(), dx=(e.clientX-dr.x)/r.width*DW/v.k, dy=(e.clientY-dr.y)/r.height*mcv.height/v.k; if(Math.abs(e.clientX-dr.x)+Math.abs(e.clientY-dr.y)>5)moved=true; if(moved){ V.cx=dr.cx-dx; V.cy=dr.cy-dy; drawMap(); } });
    mcv.addEventListener('pointerup',()=>{ dr=null; }); mcv.addEventListener('pointercancel',()=>{ dr=null; });
    mcv.addEventListener('wheel',e=>{ e.preventDefault(); const r=mcv.getBoundingClientRect(), v=view(), fx=(e.clientX-r.left)/r.width, fy=(e.clientY-r.top)/r.height; zoomTo(V.z*(e.deltaY<0?1.25:.8),v.sx+fx*v.sw,v.sy+fy*v.sh,fx,fy); },{passive:false});
    mcv.addEventListener('click',e=>{ '@later'; if(moved){ moved=false; return; } const [x,y]=toMap(e,view());
      if(mapLv==='up')return goTo((x-SHARED.BOD.OX)*TILE,(y-SHARED.BOD.OY)*TILE,'up');
      const st=(LOOP.STA||[]).map(q=>[q,Math.hypot(q.x-x,q.my(LOOP.XW/2)-y)]).sort((a,b)=>a[1]-b[1])[0]; if(st&&st[1]<45){ if(st[0].old)return goTo(MODS.station.plat.x,MODS.station.plat.z,'down'); const p=st[0].P(LOOP.LEN/2,LOOP.MID,0); goTo(p[0],p[2],'down'); } }); }
  M.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ mapLv=b.dataset.lv; drawMap(); });
  $('#myapt').onclick=()=>{ if(UI.menuOpen)toggleMenu(); if(MODS.apts&&MODS.apts.enterReal)MODS.apts.enterReal(); };
  const PLACES=[['THE STREET',-2.2,3.2,'up'],['THE BODEGA',SHARED.BOD.X((SHARED.BOD.SB.x0+SHARED.BOD.SB.x1)/2),SHARED.BOD.Z(SHARED.BOD.SB.y1)-1.6,'up',null,Math.PI],['THE PLATFORM',MODS.station.plat.x,MODS.station.plat.z,'down'],['CENTRAL PARK',SHARED.BOD.XS(PARK.round[0]+PARK.ox),SHARED.BOD.ZS(PARK.y0+7+PARK.oy),'up'],(WP.bath&&WP.bath.row===2?['THE BATH HOUSE',SHARED.BOD.X(LOTX((WP.bath.x0+WP.bath.x1)/2)),SHARED.BOD.Z(LOTY(WP.bath.y0)-1.6),'up',null,Math.PI]:['THE BATH HOUSE',SHARED.BOD.X(SHARED.BOD.GD.door[0]),SHARED.BOD.Z(SHARED.BOD.GD.door[1]+4.5),'up']),...(STORE.main?STORE.main.doors.map(d=>[d[0],d[1],d[2],'up',null,d[5]]):[]),['THE DUNGEON STAIR',SHARED.BOD.XS((CASTLE.stair.x0+CASTLE.stair.x1)/2),SHARED.BOD.ZS(CASTLE.stair.y0-3),'up'],['THE DUNGEON',MODS.dungeon.arrive(1).x,MODS.dungeon.arrive(1).z,'down']];
  UI.places=()=>PLACES.concat(STORE.places||[]);
  const inOf=n=>{ const k=s=>String(s||'').toUpperCase().replace(/^THE /,''), K=k(n);   // a place with an inside: GO TO goes in, a couple of steps in from its front door, only the inside drawn (owner, 11 Nov 2026)
    for(const id in ROOMS.off){ const o=ROOMS.off[id]; if(o.spawn&&!o.outdoor&&k(o.name)===K)return ()=>ROOMS.enter(id); }
    for(const id in STORE.inside||{})if(k(STORE.inside[id].name)===K&&STORE.enter)return ()=>STORE.enter(id,true)||door(n); return null; };   // (its door asks first and says no: left at its door)
  const door=n=>{ const P=PLACES.concat(STORE.places).find(p=>p[0]===n); if(P)goTo(P[1],P[2],P[3],P[5]); };
  const goPlace=async n=>{ '@later'; if(n==='YOUR APARTMENT'&&MODS.apts&&MODS.apts.enterReal)return MODS.apts.enterReal(); if(MODS.firev&&n===MODS.firev.name&&MODS.firev.out)return MODS.firev.out(); if(STORE.ensure)await STORE.ensure(); if(STORE.offGo)await STORE.offGo(n); const I=inOf(n); if(I)return I(); const P=PLACES.concat(STORE.places).find(p=>p[0]===n); if(P&&P[6])return P[6](); if(P)toPlace(P[1],P[2],P[3],P[5]); }; UI.goPlace=goPlace;
  { const q=QS.get('place'); if(q)SYS.onStart(()=>setTimeout(()=>goPlace(q.toUpperCase()),300),'094-ui place'); }
  const PLACEN=PLACES.map(p=>p[0]), ROOMN=[];
  { const add=(n,x,z,lv)=>{ ROOMN.push(n); PLACES.push([n,x,z,lv]); }, mid=(X,Z,r)=>[(X(r[0])+X(r[2]))/2,(Z(r[1])+Z(r[3]))/2], B=SHARED.BOD.SB;
    if(SHARED.BOD.GD){ const s=SHARED.BOD.GD.shift||[0,0], m=mid(SHARED.BOD.X,SHARED.BOD.Z,SHARED.BOD.GD.floor||SHARED.BOD.GD.r); add('THE BATHS',m[0]+s[0],m[1]+s[1],'up'); }
    PLACES.push(['THE SUBWAY STAIRS',SHARED.BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),SHARED.BOD.ZS(MAPSTAIR.y1+1.2),'up']); PLACEN.push('THE SUBWAY STAIRS'); }
  { const sel=$('#placesel'), grp=(label,list)=>{ if(!list.length)return; const g=document.createElement('optgroup'); g.label=label; for(const n of list.sort((a,b)=>TEXT.bare(a).localeCompare(TEXT.bare(b)))){ const o=document.createElement('option'); o.value=n; o.textContent=TEXT.bare(n); g.appendChild(o); } sel.appendChild(g); };
    const fill=()=>{ const seen=new Set(), G={OUTSIDE:[],INSIDE:[],UNDERGROUND:[]}, inn=new Set([...ROOMN,...(STORE.rooms||[]).map(R=>(R.name||'').toUpperCase()),...Object.keys(STORE.off||{})]);   // every place the game has registered, once, made when the list opens
      for(const p of UI.places()){ const n=p[0]; if(seen.has(n))continue; seen.add(n); (p[3]==='down'?G.UNDERGROUND:p[4]==='off'||typeof p[3]==='number'||inn.has(n)?G.INSIDE:G.OUTSIDE).push(n); }
      sel.textContent=''; const first=document.createElement('option'); first.value=''; first.textContent='CHOOSE A PLACE...'; sel.appendChild(first); for(const k in G)grp(k,G[k]); };
    const fresh=()=>{ if(sel.options.length!==1+new Set(UI.places().map(p=>p[0])).size)fill(); }; UI.fillPlaces=fill; fill(); SYS.onStart(fill,'094-ui places'); sel.addEventListener('focus',fresh); sel.addEventListener('mousedown',fresh);
    UI.goName=n=>{ const P=!inOf(n)&&(PLACEN.includes(n)||ROOMN.includes(n))?PLACES.find(p=>p[0]===n):null; if(P)toPlace(P[1],P[2],P[3],P[5]); else goPlace(n); };
    sel.onchange=()=>{ const n=sel.value; sel.value=''; if(n)UI.goName(n); };
    sel.addEventListener('keydown',e=>e.stopPropagation()); }
  const zMin=UI.ZOUT, zMax=UI.ZL[UI.ZL.length-1], z2r=v=>Math.log(v/zMin)/Math.log(zMax/zMin), r2z=r=>zMin*Math.pow(zMax/zMin,r);
  function drawDisplay(){ '@later'; { const D=$('#dfil'); if(!D.firstChild)for(const k in PS2.F){ const b=document.createElement('button'); b.className='btn'; b.dataset.fil=k; b.textContent=PS2.F[k].n; b.onclick=()=>{ PS2.pick(k); drawDisplay(); }; D.appendChild(b); } D.querySelectorAll('[data-fil]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fil===PS2.f))); if(PS2.panel)PS2.panel(); } M.querySelectorAll('[data-res]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.res===SHARED.RESI))); $('#dsfx').textContent='EFFECTS '+(SFX.on?'ON':'OFF'); $('#dsfx').setAttribute('aria-pressed',String(SFX.on)); $('#dsnd').textContent='SOUND '+(SFX.snd?'ON':'OFF'); $('#dsnd').setAttribute('aria-pressed',String(SFX.snd)); $('#damb').textContent='AMBIENCE '+(AMB.on?'ON':'OFF'); $('#damb').setAttribute('aria-pressed',String(AMB.on)); $('#dvol').value=SFX.vol; $('#dlook').setAttribute('aria-pressed',String(LOOK.on)); $('#dlook').textContent='GLOW AND NIGHT LOOK '+(LOOK.on?'ON':'OFF'); $('#dsteps').value=W3.shade.steps; $('#ddepth').value=W3.shade.depth; M.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===UI.view))); $('#dzoom').value=z2r(SHARED.ppuTo); $('#dtilt').value=(SHARED.pitchTo-PMIN)/(PMAX-PMIN);
    $('#dlit').textContent='LIGHT ON THEM: '+(UI.lit?'LAMPS':'FLAT'); $('#dlit').setAttribute('aria-pressed',String(UI.lit)); $('#dbody').setAttribute('aria-pressed',String(PB.on)); $('#dsway').setAttribute('aria-pressed',String(UI.sway)); $('#dswayl').value=UI.swayL; $('#dswaylv').textContent=UI.swayL;  $('#dloose').value=PB.loose; $('#doutl').setAttribute('aria-pressed',String(OUTL.on)); $('#doutl').textContent='OUTLINE '+(OUTL.on?'ON':'OFF'); }
  { const SH={on:true,lv:2}, D=$('#dshd'); D.innerHTML='<button class="btn" data-s="1">ON</button><button class="btn" data-l="1">SHADED</button><button class="btn" data-l="2">SELF</button>';   // the figures' shadows: on/off, lit by the lamps, or self-shadowed too
    const drawSh=()=>{ W3.lv.value=SH.on?SH.lv:0; D.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s?String(SH.on):String(SH.on&&SH.lv===+b.dataset.l))); D.querySelector('[data-s]').textContent=SH.on?'ON':'OFF'; };
    D.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(b.dataset.s)SH.on=!SH.on; else{ SH.lv=+b.dataset.l; SH.on=true; } drawSh(); }); drawSh(); }
  { const b=$('#danim'), L=[8,10,12,0], name=()=>'ANIMATION '+(ASTEP.fps>0?'STEPPED '+ASTEP.fps:'EVERY FRAME'); b.textContent=name();
    b.onclick=()=>{ const i=L.indexOf(ASTEP.fps); ASTEP.fps=L[(i+1)%L.length]; try{ SAVE.set('animfps',String(ASTEP.fps)); }catch(e){} b.textContent=name(); }; }
  RESN.forEach((n,i)=>{ const b=document.createElement('button'); b.className='btn'; b.dataset.res=i; b.textContent=n; b.onclick=()=>{ SHARED.RESI=i; try{ SAVE.set('gfx',String(i)); }catch(e){} resize(); drawDisplay(); }; $('#dres').appendChild(b); });
  { let v=null; try{ v=SAVE.get('gfx'); }catch(e){} if(v!=null&&RESN[+v]&&QS.get('res')==null){ SHARED.RESI=+v; resize(); } }
  $('#dlook').onclick=()=>{ LOOK.on=!LOOK.on; try{ SAVE.set('look',LOOK.on?'1':'0'); }catch(e){} drawDisplay(); };
  $('#dzoom').oninput=e=>{ SHARED.ppuTo=r2z(+e.target.value); }; $('#dtilt').oninput=e=>{ SHARED.pitchTo=clampP(PMIN+(+e.target.value)*(PMAX-PMIN)); };
  M.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{ if(!UI.viewsHere().includes(b.dataset.view)){ UI.log('DRIVING, THE VIEW IS BEHIND THE CAR OR FROM THE SEAT.','#c8a090'); return; } UI.switchView(b.dataset.view).then(drawDisplay); drawDisplay(); });
  $('#dsteps').oninput=e=>W3.setShade(+e.target.value,W3.shade.depth); $('#ddepth').oninput=e=>W3.setShade(W3.shade.steps,+e.target.value);
  $('#dreset').onclick=()=>{ SHARED.yawTo=VIEW0.yaw; SHARED.pitchTo=VIEW0.pitch; SHARED.ppuTo=VIEW0.ppu; UI.home(); drawDisplay(); };
  const UIS={small:.9,medium:1,large:1.1}; UI.setScale=k=>{ if(!UIS[k])k='medium'; UI.scale=k; document.documentElement.style.setProperty('--uiz',UIS[k]); SAVE.set('uiscale',k); M.querySelectorAll('[data-ui]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ui===k))); };
  UI.setScale(SAVE.get('uiscale')||'medium'); M.querySelector('#uireset').onclick=()=>{ if(UI.resetLayout)UI.resetLayout(); }; M.querySelectorAll('[data-ui]').forEach(b=>b.onclick=()=>UI.setScale(b.dataset.ui));
  OUTL.on=false; OUTL.sp.enabled=false;
  $('#doutl').onclick=()=>{ OUTL.on=!OUTL.on; OUTL.sp.enabled=OUTL.on; try{ SAVE.set('outline',OUTL.on?'1':'0'); }catch(e){} drawDisplay(); };
  UI.setLit=on=>{ UI.lit=on; W3.mesh.material=on?W3.toon:W3.flat; for(const N of NPCS)N.me.material=on?N.toon:N.flat; try{ SAVE.set('avlight',on?'1':'0'); }catch(e){} };
  UI.setLit(true);
  $('#dlit').onclick=()=>{ UI.setLit(!UI.lit); drawDisplay(); };
  SYS.onStart(()=>setTimeout(()=>{ if(!SFX.snd&&SAVE.get('snd')==null&&UI.log)UI.log('SOUND IS OFF. TURN IT ON IN THE MENU: SETTINGS, SOUND.','#f2c14e'); },4000),'094-sound note');
  $('#dsnd').onclick=()=>{ SFX.master(!SFX.snd); drawDisplay(); }; $('#dsfx').onclick=()=>{ SFX.set(!SFX.on,null); drawDisplay(); }; $('#damb').onclick=()=>{ AMB.set(!AMB.on); drawDisplay(); }; $('#dvol').oninput=e=>SFX.set(null,+e.target.value);
  $('#dbody').onclick=()=>{ PB.set(!PB.on,true); drawDisplay(); };
  { UI.sway=false; UI.swayL=2; try{ UI.sway=SAVE.get('sway')==='1'; UI.swayL=Math.max(1,Math.min(10,+(SAVE.get('swayl')||2)||2)); }catch(e){}
    $('#dsway').onclick=()=>{ UI.sway=!UI.sway; try{ SAVE.set('sway',UI.sway?'1':'0'); }catch(e){} drawDisplay(); };
    $('#dswayl').oninput=e=>{ UI.swayL=+e.target.value; $('#dswaylv').textContent=UI.swayL; try{ SAVE.set('swayl',String(UI.swayL)); }catch(err){} };
    const S=new THREE.Quaternion(), E=new THREE.Euler(), D=Math.PI/180, ph=[0,0,0].map(()=>Math.random()*6.283); let t=0;
    SYS.add('cam',dt=>{ if(!UI.sway||UI.view!=='first'||ED.on||VR.on)return; t+=dt; const k=UI.swayL*.1*D;
      SHARED.cam.quaternion.multiply(S.setFromEuler(E.set(k*Math.sin(.75*t+ph[0]),k*.5*Math.sin(.75*t+ph[1]),k*.5*Math.sin(.75*t+ph[2]),'YXZ'))); },'094-ui'); } $('#dloose').oninput=e=>{ PB.loose=+e.target.value; try{ SAVE.set('loose',String(PB.loose)); }catch(err){} };
  function drawKeys(){ '@later'; const t=$('#keytab'); t.innerHTML=''; for(const [a,what] of ACTS){ const tr=document.createElement('tr'), b=document.createElement('button'); b.className='btn'; b.textContent=waiting===a?'PRESS A KEY…':NAME(keyOf(a)); b.setAttribute('aria-pressed',String(waiting===a)); b.onclick=()=>{ waiting=a; drawKeys(); };
      const td1=document.createElement('td'); td1.textContent=what.toUpperCase(); const td2=document.createElement('td'); td2.appendChild(b); tr.append(td1,td2); t.appendChild(tr); }
    for(const [k,w] of FIXED){ const e=document.createElement('tr'); e.innerHTML='<td>'+w+'</td><td><span class="dim">'+k+'</span></td>'; t.appendChild(e); } if(UI.padKeys)UI.padKeys(t); }
  $('#kreset').onclick=()=>{ BIND={}; try{ SAVE.del('keys'); }catch(e){} REV=rev(); drawKeys(); drawBadge(); };
  document.getElementById('stat').hidden=true;
  drawBadge(); }
{ const PANS=[['menu',()=>UI.toggleMenu(),'.box'],['looks',el=>{ el.hidden=true; }],['we',()=>{}],['stat'],['gemp'],['packp',el=>{ el.hidden=true; if(FORAGE)FORAGE.PACK.open=false; }],['bagp',()=>{ if(BAG.toggle)BAG.toggle(false); }],['shopp'],['fishp'],['vegp'],['birdp'],['farlook'],['rinsp',()=>RINSP.toggle(false)],['emotes',()=>MOTION.close()]];
  const css=document.createElement('style'); css.textContent='.pX{position:absolute;right:4px;top:4px;z-index:2;font:12px Silkscreen,monospace;color:#f2c14e;background:#0e1016;border:2px solid #3a3f4e;width:24px;height:24px;line-height:18px;padding:0;cursor:pointer} .pDrag{cursor:move}'; document.head.appendChild(css);
  { const ML=document.createElement('style'), C='color:#7dffa8!important', DIM='color:#3aa866!important', HI='color:#d8ffe4!important', sel=(k,cs)=>cs.map(c=>`.ml [style*="${k}:${c}"]`).join(',');   // every menu in the ESC menu's look (owner, 30 Oct 2026)
    ML.textContent=`.ml{font-family:'Share Tech Mono',ui-monospace,monospace!important;font-size:18px!important;line-height:1.45;letter-spacing:1px!important;${C};background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),#020a06!important;border:0!important;border-radius:0!important;box-shadow:0 0 0 2px #3aa866!important}
.ml *{font-family:inherit!important;letter-spacing:inherit!important} .ml *:not(h1):not(h2):not(h3):not(h4){font-size:inherit!important}
.ml button{${C};background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:3px 8px!important;cursor:pointer}
.ml select,.ml input,.ml textarea{${C};background:#031a0d!important;border:0!important;border-radius:0!important;box-shadow:inset 0 0 0 2px #3aa866!important}
.ml button[style*="color:#f2c14e"],.ml button[aria-selected="true"],.ml button.on,.ml .sl.on{color:#020a06!important;background:#7dffa8!important}
.ml button:hover:not(:disabled),.ml button:focus-visible{color:#020a06!important;background:#7dffa8!important;outline:0}
.ml button:disabled{opacity:.4}
${sel('background',['#f2c14e','#8fe3d6'])}{color:#020a06!important;background:#7dffa8!important}
.ml h1,.ml h2,.ml h3,.ml h4{${C};font-weight:normal;font-size:20px!important;letter-spacing:3px!important;padding-bottom:6px;border-bottom:2px solid #3aa866!important} .ml h3::before{content:'[ '} .ml h3::after{content:' ]'}
.ml b,${sel('color',['#f2c14e','#fff','#ffffff'])}{${HI}}
${sel('color',['#8fe3d6','#e8e2cc','#ece5d3','#d8dae2','#c8c2b0','#d8d8c8'])}{${C}}
${sel('color',['#9b9584','#7d7a70','#8a8676','#5d5a52','#8a8f9c','#9b9a92','#7a7668','#c3a7a0','#8f7470'])}{${DIM}}
${sel('color',['#d8a845'])}{${HI}}
.ml td:last-child{white-space:nowrap}
.ml tr,.ml td,.ml [style*="border-bottom:1px solid"],.ml [style*="border:1px solid"]{border-color:#0d3a1f!important}
.ml .mclose{display:none!important}
.ml .pX{color:#7dffa8!important;background:#020a06!important;box-shadow:inset 0 0 0 2px #3aa866!important;border:0!important}
.ml .pX:hover{color:#020a06!important;background:#7dffa8!important}
.mlb{font-family:'Share Tech Mono',ui-monospace,monospace!important;font-size:16px!important;letter-spacing:1px!important;${C};background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),#020a06!important;border:0!important;border-radius:0!important;box-shadow:0 0 0 2px #3aa866!important;text-shadow:0 0 5px #4aff9055}
.mlb button{font:inherit!important;${C};background:transparent!important;border:0!important;box-shadow:none!important}
button.mlb:hover:not(:disabled),.mlb button:hover{color:#020a06!important;background:#7dffa8!important;text-shadow:none}`;
    document.head.appendChild(ML);
    const HL=document.createElement('style'), PN='background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.82);box-shadow:0 0 0 1px #2d5a40', GL='text-shadow:0 0 5px #4aff9055', MONO="font-family:'Share Tech Mono',ui-monospace,monospace";   // the HUD in the same look (owner, 4 Nov 2026: "B")
    HL.textContent=`body #vit{${MONO};font-size:13px;color:#7dffa8;${GL};${PN};padding:8px 10px;width:190px} body #vit #vnm{font-size:14px} body #vit .b{height:8px;margin-top:16px;background:transparent;box-shadow:inset 0 0 0 1px #2d5a40;padding:1px} body #vit .b s,body #vit .b b{top:-15px;font-size:11px;color:#3aa866}
body #vit #vhp,body #vit #vair{background:#7dffa8!important} body #vit #vst{background:#d8ff7d!important}
body #hmap{${MONO};font-size:12px;color:#7dffa8;text-shadow:0 0 4px #000,0 0 5px #4aff9055}
body #hlog{${MONO};font-size:13px;letter-spacing:1px;color:#7dffa8;${GL}} body #hlines:not(:empty){${PN};padding:5px 9px} body #hlines b{color:#d8ffe4}
body #hlines div[style*="rgb(232, 226, 204)"],body #fjour div[style*="rgb(232, 226, 204)"]{color:#7dffa8!important}
body #fjour{${MONO}!important;font-size:14px!important;letter-spacing:1px!important} body #fjour div{${PN};padding:2px 9px;text-shadow:0 0 5px #4aff9055!important}
body #hqb{gap:3px} body #hqb .qs{width:46px;height:46px;flex-direction:column;gap:1px;padding:11px 2px 2px;${PN};${MONO};font-size:10px;color:#7dffa8;${GL};word-break:normal}
body #hqb .qs.on{box-shadow:0 0 0 1px #7dffa8,0 0 8px #4aff9066} body #hqb .qs.none{color:#3aa866;opacity:.6} body #hqb .qs.over{background:#0d3a1f} body #hqb .qs em,body #hqb .qs u{color:#3aa866;font-size:9px}
body #hqb .qg{${PN};color:#3aa866;width:24px} body #hqb .qg:hover{color:#7dffa8} body #hqb .qs img{width:18px;height:18px;image-rendering:pixelated} body #hqb .qs span{display:block;max-width:42px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body #onl{${MONO};font-size:13px;color:#7dffa8;${GL}} body #onl button{color:#7dffa8;background:rgba(2,10,6,.82);border:1px solid #3aa866} body #onl button:hover{color:#020a06;background:#7dffa8;text-shadow:none} body #onl .k{color:#3aa866;text-shadow:none}
body #onllist,body #onllog div{${PN};border:0} body #onllog b{color:#d8ffe4} body #onlin{background:#020a06;color:#7dffa8;border:1px solid #7dffa8}
body #mode,body #said{${MONO};font-size:14px;color:#7dffa8;${GL};${PN};border:0} body #roomsay{${MONO};font-size:14px}`;
    document.head.appendChild(HL);
    const NOT=/^(stage|subfade|stat|mode|said|vit|fjour|roomsay|roomedbtn|vrbtn|menu|loading|onl|newver|shbar|fishgo|dead)$/, DARK=/^rgba?\((11, 13, 19|13, 15, 20|16, 18, 26|5, 7, 11|14, 26, 18|24, 36, 28)/, IDS=/^(cinemap|nsp|talkp|hornp|holog|cabwin|inspp|cpadmin|roomed|roombuy|tletter|rvpan|ited|led|lnd|we|looks|snded|edmenu|chared|design|feelp|rinsp|emotes|winp|ceilp|crtp|libp|typerp)$/;
    UI.menuLook=()=>{ for(const el of document.body.children){ if(el.dataset.ml||el.hidden||NOT.test(el.id))continue; const cs=getComputedStyle(el); if(cs.display==='none'||cs.position!=='fixed')continue;   // a window in the old dark panel takes the menu's look the first time it shows
      el.dataset.ml=IDS.test(el.id)||DARK.test(cs.backgroundColor)&&(el.querySelector('button,table,input,select,h3')||PANS.some(p=>p[0]===el.id))?'1':'0'; if(el.dataset.ml==='1')el.classList.add('ml'); } }; }
  const hide=el=>{ el.hidden=true; if(el.style.display)el.style.display='none'; };
  const NOPE='button,input,select,textarea,a,label,canvas,option,.pX,.tpg,.bgi,.bgr,.bgm,.bgf';
  const zoomOf=el=>{ let z=1; for(let q=el;q;q=q.parentElement){ const v=parseFloat(getComputedStyle(q).zoom); if(v>0)z*=v; } return z; };
  // where you put each window and each piece of the HUD, kept with your account (owner, 4 Nov 2026: "allow players to move around the gui items where they want")
  let POS={}; try{ POS=JSON.parse(OWNED.get('uipos')||'{}')||{}; }catch(e){}
  const keep=(box,key)=>{ if(!key)return; const r=box.getBoundingClientRect(), w=parseFloat(box.style.width), h=parseFloat(box.style.height); POS[key]=[Math.round(r.left),Math.round(r.top),...(box.dataset.sized&&w&&h?[Math.round(w),Math.round(h)]:[])]; OWNED.set('uipos',JSON.stringify(POS)); };   // (and its size, once you have resized it)
  const pin=(box,x,y)=>{ '@later'; const z=zoomOf(box), r=box.getBoundingClientRect(), w=Math.max(r.width,60), h=Math.max(r.height,30); x=Math.max(-w+60,Math.min(innerWidth-60,x)); y=Math.max(0,Math.min(innerHeight-Math.min(h,30),y));
    Object.assign(box.style,{position:'fixed',inset:'auto',right:'auto',bottom:'auto',transform:'none',margin:'0',left:(x/z)+'px',top:(y/z)+'px'}); };
  const put=(box,key)=>{ const p=key&&POS[key]; if(!p)return; if(p[2]&&p[3]){ box.dataset.sized=1; box.style.width=p[2]+'px'; box.style.height=p[3]+'px'; box.style.maxHeight='none'; } pin(box,p[0],p[1]); };
  const HUDP=['vit','hmap','hlog','hqb','mode'], MOVED=new Set();
  const hudMove=el=>{ el.dataset.mv=1; el.style.pointerEvents='auto'; let s=null;   // a press that moves more than a few pixels drags it; a plain click still does what it did
    el.addEventListener('mousedown',e=>{ '@later'; if(e.button!==0||e.target.closest('button,input,select,textarea,a,[draggable="true"]'))return; const r=el.getBoundingClientRect(); s={x:e.clientX,y:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,on:false};
      const mv=e=>{ if(!s.on){ if(Math.hypot(e.clientX-s.x,e.clientY-s.y)<6)return; s.on=true; } e.preventDefault(); pin(el,e.clientX-s.dx,e.clientY-s.dy); },
        up=()=>{ removeEventListener('mousemove',mv,true); removeEventListener('mouseup',up,true); if(s.on){ MOVED.add(el); keep(el,el.id); const eat=ev=>{ ev.stopPropagation(); ev.preventDefault(); }; addEventListener('click',eat,{capture:true,once:true}); setTimeout(()=>removeEventListener('click',eat,true),0); } s=null; };
      addEventListener('mousemove',mv,true); addEventListener('mouseup',up,true); }); };
  UI.resetLayout=()=>{ POS={}; OWNED.del('uipos'); for(const id of HUDP){ const el=document.getElementById(id); if(el)for(const k of ['position','inset','right','bottom','transform','margin','left','top'])el.style[k]=''; }
    for(const b of document.querySelectorAll('.pDrag[data-sized]')){ delete b.dataset.sized; b.style.width=b.style.height=b.style.maxHeight=''; } };   // (and every window you resized, its own size again)   // the HUD back where it was; windows open where they always did
  addEventListener('resize',()=>{ for(const id in POS){ const el=document.getElementById(id); if(el&&!el.hidden)put(el,id); } });
  // a window: pressed and moved, it follows the mouse (a plain click leaves it as it is: owner, 7 Nov 2026, "dont change size of menu when clicking on it"); its bottom right corner resizes it ("allow menus to be resized though (drag to resize)")
  const drag=(box,key)=>{ box.classList.add('pDrag'); { const cs=getComputedStyle(box); if(cs.resize==='none')box.style.resize='both'; if(cs.overflow==='visible')box.style.overflow='auto'; } put(box,key);
    box.addEventListener('mousedown',e=>{ '@later'; if(e.button!==0||e.target.closest(NOPE))return; const r=box.getBoundingClientRect();
      if(e.clientX>r.right-20&&e.clientY>r.bottom-20){ e.stopPropagation(); addEventListener('mouseup',()=>{ box.dataset.sized=1; box.style.maxHeight='none'; keep(box,key); },{once:true,capture:true}); return; }   // the corner: the browser's own resize
      e.stopPropagation(); e.preventDefault();
      const z=zoomOf(box), x0=e.clientX, y0=e.clientY, dx=x0-r.left, dy=y0-r.top, px=v=>(v/z)+'px'; let on=false, mh=Infinity;
      const mv=e=>{ if(!on){ if(Math.hypot(e.clientX-x0,e.clientY-y0)<5)return; on=true; const cs=getComputedStyle(box); if(box.dataset.mh0==null)box.dataset.mh0=cs.maxHeight; mh=parseFloat(box.dataset.mh0)||Infinity;
          Object.assign(box.style,{position:'fixed',inset:'auto',right:'auto',bottom:'auto',transform:'none',margin:'0',width:cs.width,height:box.id==='ed'||box.dataset.sized?cs.height:box.style.height}); }   // (its own size, exactly: the computed one, never the outer box)
        const t=Math.max(0,Math.min(innerHeight-30,e.clientY-dy)); box.style.left=px(Math.max(-r.width+60,Math.min(innerWidth-60,e.clientX-dx))); box.style.top=px(t);
        if(!box.dataset.sized)box.style.maxHeight=Math.min(mh,(innerHeight-t-8)/z)+'px'; },
        up=()=>{ removeEventListener('mousemove',mv,true); removeEventListener('mouseup',up,true); if(on)keep(box,key); };
      addEventListener('mousemove',mv,true); addEventListener('mouseup',up,true); }); };
  const look=()=>{ for(const [id,close,sub] of PANS){ const el=document.getElementById(id); if(!el)continue; const box=sub?el.querySelector(sub):el; if(!box)continue;
      if(!box.dataset.pan){ box.dataset.pan=1; drag(box,id); if(getComputedStyle(box).position==='static')box.style.position='relative'; }
      if(!box.querySelector(':scope>.pX')){ const x=document.createElement('button'); x.className='pX'; x.type='button'; x.textContent='X'; x.title='close'; x.onclick=e=>{ e.stopPropagation(); close?close(el):hide(el); }; box.appendChild(x); } } };
  const own=el=>[...el.querySelectorAll('button')].find(b=>/^(CLOSE|DONE|PUT AWAY|LEAVE|CANCEL|X|✕|×)(\s+(ESC|ENTER|[A-Z0-9]))?$/i.test(b.textContent.trim())&&!b.classList.contains('pX'));   // (a button may carry its key: LEAVE ESC)
  const frame=()=>{ for(const el of document.querySelectorAll('body>.ml')){ if(PANS.some(p=>p[0]===el.id))continue;   // every menu: the same frame, drag and X; its own CLOSE button folds into the X
      if(!el.dataset.pan){ el.dataset.pan=1; drag(el,el.id); }
      const c=own(el); if(c&&!c.classList.contains('mclose'))c.classList.add('mclose');
      if(!el.querySelector(':scope>.pX')){ const x=document.createElement('button'); x.className='pX'; x.type='button'; x.textContent='X'; x.title='close'; x.onclick=e=>{ e.stopPropagation(); const b=own(el); if(b)b.click(); else hide(el); }; el.appendChild(x); } } };
  const DRAGONLY=['shopg'];   // a window with its own look that still moves (the shops' bag-style window, 8 Nov 2026)
  const huds=()=>{ for(const id of DRAGONLY){ const el=document.getElementById(id); if(el&&!el.hidden&&!el.dataset.pan){ el.dataset.pan=1; drag(el,id); } } for(const id of HUDP){ const el=document.getElementById(id); if(!el)continue; if(!el.dataset.mv)hudMove(el); if(POS[id]&&!el.style.left)put(el,id); } };
  look(); SYS.every(()=>{ look(); UI.menuLook(); frame(); huds(); },400,'094-ui look'); }
