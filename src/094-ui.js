// THE UI: the camera (isometric, behind, first person), zoom and turn, the menu, places, and the top-down shot.
import {SHARED, THREE} from './003-shx.js';
import {AMB, BLK, BUGS, DN, ED, EDITORS, FEEL, FORAGE, GAMEED, keys, LAND, LEVELS, LINES, LOOK, LOOKS, MAPED, MUS, NPCS, PARK, PB, pos, RINSP, ROOMS, SFX, SNDED, st, UI, USE, VIT, W3, WE, WIELD} from './003b-systems.js';
import {art, OCAM, PCAM, PPU, pxS, renderer, RES, resize, RESL, RESMAX, RH, RW, scene, SCL, vpu, ZMAX} from './004-main.js';
import {SAVE} from './005-save.js';
import {ASTEP, BLDK, CASTLE, CEL, MAPG, MAPSTAIR, MODS, QS, RING, STORE, TILE} from './006-map-pre.js';
import {GCAVE} from './060-cave.js';
import {FOUNT} from './060a-fount.js';
import {GTOWER} from './063-tower.js';
import {HEMI} from './064-map-post.js';
import {RIVER} from './066-river.js';
import {OUTL} from './072-walker3d.js';
import {clampP, disp, gplane, hit, marker, PMAX, PMIN, ray, VIEW0} from './075-main-13.js';
import {SOUND} from './091-sfx.js';
Object.assign(UI,{freeCam:false,fly:false,menuOpen:false,camT:new THREE.Vector3()});
{
  const ACTS=[['w','walk up (screen)'],['s','walk down'],['a','walk left'],['d','walk right'],['shift','run · sink (free camera, fly)'],[' ','jump · rise (free camera, fly) · dive (swimming)'],
    ['view','change the view (map, third person, behind, first person, isometric)'],['rot','turn the view a quarter (four angles)'],['j','punch'],['k','kick'],['r','roll'],['u','cartwheel'],['1','hold: sword · net · bird net · nothing (the mouse aims it, a click swings)'],['v','wave'],['t','the ghost\'s guitar: off the back and play · back on'],['f','fall'],['shoes','shoes off / on (barefoot to forage)'],['q','turn left'],['e','turn right'],['z','tilt down'],['x','tilt up'],['0','reset the view'],
    ['c','free camera'],['g','fly (through walls)'],['=','sharper'],['-','coarser'],['h','hide the help']];
  const NAME=k=>k===' '?'SPACE':k.length===1?k.toUpperCase():k.toUpperCase();
  let BIND={}; try{ BIND=JSON.parse(SAVE.get('keys')||'{}')||{}; }catch(e){}
  const DEF={view:'v',v:'b',rot:'r',r:'y',shoes:'m'}, keyOf=a=>BIND[a]??DEF[a]??a, rev=()=>{ const r={}; for(const [a] of ACTS)r[keyOf(a)]=a; return r; };
  let REV=rev(), waiting=null; UI.keyOf=keyOf;
  UI.key=e=>{ const raw=e.key.toLowerCase();
    if(waiting){ if(raw!=='escape'){ const old=keyOf(waiting); for(const [a] of ACTS)if(a!==waiting&&keyOf(a)===raw)BIND[a]=old; BIND[waiting]=raw;
        try{ SAVE.set('keys',JSON.stringify(BIND)); }catch(err){} REV=rev(); } waiting=null; drawKeys(); e.preventDefault(); return null; }
    if(raw==='escape'&&e.shiftKey&&!ED.on){ if(e.type==='keydown'&&!e.repeat)GAMEED.toggle(); return null; }
    if(raw==='escape'){ if(e.type==='keydown'){ if(ED.on)ED.exit(); else if(WE.on)WE.toggle(); else toggleMenu(); } return null; }
    if(e.target&&/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName))return null;
    if(e.shiftKey&&/^Digit[0-9]$/.test(e.code)){ if(e.type==='keydown'&&!e.repeat&&EDITORS.key)EDITORS.key(+e.code.slice(5)); return null; }
    if(raw==='?'){ if(e.type==='keydown'&&!e.repeat)UI.moves(); return null; }
    if(raw==='e'&&e.shiftKey&&!ED.on&&!UI.menuOpen){ if(e.type==='keydown'&&!e.repeat)WE.toggle(); return null; }
    if(UI.view==='iso'&&!ED.on&&(raw==='q'||raw==='e'||raw==='r')){ if(e.type==='keydown'&&!e.repeat)UI.isoStep(raw==='q'?1:-1); return null; }
    if(UI.menuOpen)return null;
    if(ED.on){ const a=REV[raw]; return ['q','e','z','x','0','=','-'].includes(a)?a:null; }
    const act=REV[raw]; if(act!==undefined){ if(e.type==='keydown'&&!e.repeat){ if(act==='c')setFree(!UI.freeCam); if(act==='g')setFly(!UI.fly); if(act==='view'){ const V=['iso','follow','first']; UI.setView(V[(V.indexOf(UI.view)+1)%V.length]); } if(act==='rot')UI.turn4(); if(act==='shoes'&&typeof LOOKS!=='undefined'&&LOOKS.shoes)LOOKS.shoes(); } return act==='view'||act==='rot'||act==='shoes'?null:act; }
    return ACTS.some(([a])=>a===raw)?'':raw; };
  { const P=document.createElement('div'); P.id='movesp'; P.style.cssText='position:fixed;inset:6% 10%;z-index:20;display:none;overflow:auto;padding:16px 20px;background:#0b0d13f2;border:2px solid #2a3040;color:#c9ccd6;font:11px Silkscreen,monospace;letter-spacing:1px;line-height:1.9';
    document.body.appendChild(P);
    UI.moves=()=>{ '@later'; if(P.style.display!=='none'){ P.style.display='none'; return; }
      const row=(k,t)=>'<div style="display:flex;gap:14px"><b style="min-width:120px;color:#f2c14e">'+k+'</b><span>'+t+'</span></div>', h=t=>'<div style="margin:12px 0 4px;color:#8a8f9c">'+t+'</div>';
      let o='<div style="display:flex;justify-content:space-between"><b>WHAT YOU CAN DO</b><span style="color:#8a8f9c">? OR ESC CLOSES</span></div>'+h('KEYS (CHANGE THEM IN THE MENU\'S KEYS)');
      for(const [a,what] of ACTS)o+=row(NAME(keyOf(a)),what.toUpperCase());
      o+=row('N','NOON / 7 PM')+row('SHIFT + E','EDIT THE WORLD')+row('I','YOUR PACK: WHAT YOU CARRY, HUNGER, SKILLS, CRAFTING')+row('ESC','THE MENU')+row('?','THIS LIST')+row('L','FEEL LAB: THE NEW CONTROLLER, ITS TUNING AND ITS TEST YARD')+row('O','FEEL LAB DEBUG')+row('T','IN THE YARD: BACK TO ITS SPAWN');
      const M=RIG.MOVES||{}, fights=Object.keys(M).filter(n=>M[n]&&M[n].combo);
      if(fights.length){ o+=h('FIGHTING: J PUNCH, K KICK; PRESS AGAIN IN TIME TO CHAIN'); for(const n of fights){ const c=M[n].combo; o+=row(n.replace(/([A-Z])/g,' $1').toUpperCase(),Object.entries(c).map(([k,v])=>k+' → '+v.replace(/([A-Z])/g,' $1').toUpperCase()).join(' · ')); } }
      const K=RIG.KEYMOVE||{}; if(Object.keys(K).length){ o+=h('YOUR OWN MOVES (HIS SHAPE → ANIMATE)'); for(const [k,n] of Object.entries(K))o+=row(k,n.toUpperCase()); }
      if(UI.padMoves)o+=UI.padMoves(row,h);
      o+=h('THE MOUSE')+row('DOUBLE CLICK','WALK THERE (RUN IF FAR) · ON A SEAT: SIT · A LAMP: ON / OFF · A FRIDGE: OPEN · THE DRINKS MACHINE: A CAN · THE RADIO: MUSIC · A CHARACTER: GO UP AND GREET · YOURSELF: YOUR NAME, HEALTH AND BODY · THE GUITARIST: WATCH HIS HANDS · A MUSHROOM: PICK IT · THE MUSHROOM SELLER: HIS SHOP')
        +row('LEFT DRAG','MOVE THE VIEW (ISOMETRIC, MAP) · LOOK ROUND (THIRD PERSON, BEHIND, FIRST)')+row('RIGHT DRAG','TURN THE VIEW')+row('WHEEL','ZOOM');
      P.innerHTML=o; P.style.display='block'; };
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&P.style.display!=='none'){ P.style.display='none'; e.stopImmediatePropagation(); } },true); }
  const badge=document.createElement('div'); badge.id='mode'; document.body.appendChild(badge);
  const drawBadge=()=>{ const m=[UI.freeCam&&'FREE CAMERA: '+NAME(keyOf('c'))+' to go back',UI.fly&&'FLY: '+NAME(keyOf('g'))+' to land'].filter(Boolean); badge.textContent=m.join(' · '); badge.hidden=!m.length; };
  function setFree(on){ UI.freeCam=on; if(on)UI.camT.copy(disp); drawBadge(); }
  function setFly(on){ UI.fly=on; if(on){ SHARED.target=null; } drawBadge(); }
  UI.setFly=setFly; UI.setFree=setFree;
  UI.camStep=(dt,a,up,dn,lf,rt)=>{ if(!UI.freeCam||UI.menuOpen)return; const fx=-Math.sin(a), fz=-Math.cos(a), s=dt*9*PPU/Math.max(4,SHARED.ppu);
    let mx=0,mz=0; if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;} const n=Math.hypot(mx,mz)||1;
    UI.camT.x+=mx/n*s; UI.camT.z+=mz/n*s; UI.camT.y+=((keys.has(' ')?1:0)-(keys.has('shift')&&!L?1:0))*s*.7;
    UI.camT.x=Math.max(SHARED.BOUND.x0,Math.min(SHARED.BOUND.x1,UI.camT.x)); UI.camT.z=Math.max(SHARED.BOUND.z0,Math.min(SHARED.BOUND.z1,UI.camT.z)); UI.camT.y=Math.max(-12,Math.min(30,UI.camT.y)); };
  UI.flyStep=dt=>{ SHARED.py+=((keys.has(' ')?1:0)-(keys.has('shift')?1:0))*dt*4; SHARED.py=Math.max(-5,Math.min(10,SHARED.py)); pos.x=Math.max(SHARED.BOUND.x0,Math.min(SHARED.BOUND.x1,pos.x)); pos.z=Math.max(SHARED.BOUND.z0,Math.min(SHARED.BOUND.z1,pos.z)); };
  const cv=renderer.domElement; let L=null;
  UI.off=new THREE.Vector3(); UI.eul=new THREE.Euler(); UI.snR=new THREE.Vector3(); UI.snU=new THREE.Vector3();  const viewV=()=>UI.freeCam?UI.camT:UI.off, piv=new THREE.Vector3(), q0=new THREE.Quaternion(), q1=new THREE.Quaternion(), tv=new THREE.Vector3();
  const ndc=e=>{ const r=cv.getBoundingClientRect(); return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)); };
  const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group||q===MUS.g)return false;
    return o.isMesh&&!(o.material&&o.material.visible===false)&&!(o.material&&o.material.transparent&&o.material.opacity<.05); };
  UI.grab=e=>{ if(ED.on&&ED.pickW){ const p=ED.pickW(e); if(p){ piv.copy(p); return; } }
    ray.setFromCamera(ndc(e),SHARED.cam); const h=ray.intersectObjects(scene.children,true).find(h=>shown(h.object)); if(h)piv.copy(h.point); else ray.ray.closestPointToPoint(disp,piv); };
  UI.isoStep=d=>{ const A=Math.PI/2, k=(SHARED.yawTo-Math.PI/4)/A; SHARED.yawTo=Math.PI/4+(d>0?Math.floor(k+1e-6)+1:Math.ceil(k-1e-6)-1)*A; SHARED.yaw=SHARED.yawTo; };
  UI.orbit=(dx,dy)=>{ '@later'; if(UI.view==='iso'){ SHARED.yawTo-=dx*.008; SHARED.yaw=SHARED.yawTo; return; }
    if(UI.persp){ SHARED.yawTo-=dx*.006; SHARED.pitchTo=UI.clampV(SHARED.pitchTo+dy*.005); SHARED.yaw=SHARED.yawTo; SHARED.pitch=SHARED.pitchTo; return; }
    q0.setFromEuler(UI.eul.set(-SHARED.pitch,SHARED.yaw,0,'YXZ')); SHARED.yawTo-=dx*0.008; SHARED.pitchTo=clampP(SHARED.pitchTo+dy*0.006); SHARED.yaw=SHARED.yawTo; SHARED.pitch=SHARED.pitchTo; q1.setFromEuler(UI.eul.set(-SHARED.pitch,SHARED.yaw,0,'YXZ'));
    tv.subVectors(disp,piv); const t0=tv.clone(); tv.applyQuaternion(q0.invert()).applyQuaternion(q1); viewV().add(tv.sub(t0)); disp.add(tv);
    if(!UI.freeCam){ tv.set(0,0,1).applyQuaternion(q1); UI.off.addScaledVector(tv,-UI.off.dot(tv)); } };
  UI.MAXW=30*TILE; UI.NEARH=6.6/.84*TILE; window.CAMW=()=>(SHARED.cam.right-SHARED.cam.left)/TILE;
  let zAt=null; UI.wheelAt=e=>{ '@later'; if(UI.persp){ SHARED.ppuTo=SHARED.ppu; if(UI.view==='third'||UI.view==='follow')UI.dist=Math.max(1.2*TILE,Math.min(22*TILE,UI.dist*Math.pow(1.0015,e.deltaY))); return; }
    if(e.deltaY>0){ const w=SHARED.cam.right-SHARED.cam.left; SHARED.ppuTo=Math.max(SHARED.ppuTo,SHARED.ppu*w/UI.MAXW); if(w>=UI.MAXW*.995){ SHARED.ppuTo=SHARED.ppu; zAt=null; return; } } const r=cv.getBoundingClientRect(); zAt={x:e.clientX-r.left-r.width/2,y:r.height/2-(e.clientY-r.top)}; };
  UI.zk=()=>(SHARED.cam.right-SHARED.cam.left)/cv.getBoundingClientRect().width;
  UI.zoomStep=k0=>{ const w0=SHARED.cam.right-SHARED.cam.left; if(w0>UI.MAXW*1.002)SHARED.ppuTo=Math.max(SHARED.ppuTo,SHARED.ppu*w0/UI.MAXW);
    if(!zAt)return; const k1=UI.zk(); if(Math.abs(k1-k0)<1e-9){ if(Math.abs(SHARED.ppu/SHARED.ppuTo-1)<1e-3)zAt=null; return; } const R0=tv.setFromMatrixColumn(SHARED.cam.matrixWorld,0).clone(), U0=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,1);
    viewV().addScaledVector(R0,zAt.x*(k0-k1)).addScaledVector(U0,zAt.y*(k0-k1)); };
  UI.pan=(dx,dy)=>{ '@later'; const r=cv.getBoundingClientRect(), k=(SHARED.cam.right-SHARED.cam.left)/r.width, R0=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,0), U0=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,1);
    viewV().addScaledVector(R0,-dx*k).addScaledVector(U0,dy*k);
    const T=UI.freeCam?UI.camT:new THREE.Vector3(pos.x,0,pos.z).add(UI.off), m=8*TILE, cx=Math.max(SHARED.BOUND.x0-m,Math.min(SHARED.BOUND.x1+m,T.x))-T.x, cz=Math.max(SHARED.BOUND.z0-m,Math.min(SHARED.BOUND.z1+m,T.z))-T.z; viewV().x+=cx; viewV().z+=cz; };
  UI.view='map'; UI.persp=false; UI.dist=7*TILE; 
  const HEAD=1.5/.84*TILE, EYE=1.62/.84*TILE, LOW=.9/.84*TILE, eyeV=new THREE.Vector3();
  UI.clampV=v=>UI.view==='first'?Math.max(-1.2,Math.min(1.3,v)):UI.view==='third'||UI.view==='follow'?Math.max(-.6,Math.min(1.5,v)):clampP(v);
  UI.isoTo=()=>{ let r=null; try{ r=ROOMS.cur; }catch(e){} const t=r?Math.PI*3/4:-Math.PI/4; SHARED.yawTo+=((((t-SHARED.yawTo)%(2*Math.PI))+3*Math.PI)%(2*Math.PI))-Math.PI; SHARED.yaw=SHARED.yawTo; };
  UI.isoTurn=t=>{ SHARED.yawTo+=((((t-SHARED.yawTo)%(2*Math.PI))+3*Math.PI)%(2*Math.PI))-Math.PI; SHARED.yaw=SHARED.yawTo; };
  UI.isoPlace=()=>{};
  UI.setView=v=>{ UI.view=v; UI.persp=v==='third'||v==='first'||v==='follow'; if(UI.freeCam&&UI.persp)setFree(false);
    if(v==='iso'){ UI.isoTo(); SHARED.pitchTo=Math.PI/6; SHARED.ppuTo=PPU*1.5; UI.off.set(0,0,0); zAt=null; }
    if(v==='follow'){ UI.dist=4*TILE; SHARED.pitchTo=.2; }
    if(v==='first')SHARED.pitchTo=.05; if(v==='third')SHARED.pitchTo=.3; if(!UI.persp)SHARED.pitchTo=clampP(SHARED.pitchTo); try{ SAVE.set('view',v); }catch(e){} };
  UI.turn4=()=>{ if(UI.view==='first'||UI.view==='follow')return; if(UI.view==='iso'){ UI.isoStep(-1); return; } SHARED.yawTo=Math.round((SHARED.yawTo-Math.PI/4)/(Math.PI/2))*(Math.PI/2)+Math.PI/4-Math.PI/2; };
  UI.view3=a=>{
    SHARED.cam=UI.persp?PCAM:OCAM; if(SHARED.RPASS)SHARED.RPASS.camera=SHARED.cam; if(UI.persp&&Math.abs(PCAM.aspect-RW/RH)>1e-3){ PCAM.aspect=RW/RH; PCAM.updateProjectionMatrix(); } };
  UI.view3b=a=>{ W3.group.visible=UI.view!=='first'; if(!UI.persp)return; const sk=W3.SZ||1;
    if(UI.view==='first'){ if(!(W3.eyeAt&&W3.eyeAt(SHARED.cam.position))){ SHARED.cam.position.set(pos.x,SHARED.py+EYE*sk,pos.z); SHARED.cam.position.addScaledVector(new THREE.Vector3(-Math.sin(a),0,-Math.cos(a)),.12*TILE); } { const b=FOUNT.bedAt&&FOUNT.bedAt(SHARED.cam.position.x,SHARED.cam.position.z); if(b!=null&&SHARED.cam.position.y<b+LOW*.3)SHARED.cam.position.y=b+LOW*.3; } SHARED.cam.updateMatrixWorld(); return; }
    const FT=FEEL.take(); let T=new THREE.Vector3(pos.x,SHARED.py+(FT?FEEL.cfg.camH*FEEL.MV:HEAD*sk),pos.z); const F=new THREE.Vector3(Math.sin(a)*Math.cos(SHARED.pitch),Math.sin(SHARED.pitch),Math.cos(a)*Math.cos(SHARED.pitch));
    const dv=FOUNT.swim&&st.water&&FOUNT.bedAt?st.water.under:0; if(dv>.01&&W3.eyeAt&&W3.eyeAt(eyeV))T.y+=(Math.min(T.y,eyeV.y+LOW*.4)-T.y)*dv;
    if(FT){ T=FEEL.camT(T).clone(); if(UI.view!=='first'){ FEEL.cfg.camDist=UI.dist/FEEL.MH; FEEL.cfg.camPitch=SHARED.pitchTo; } }
    SHARED.cam.position.copy(T).addScaledVector(F,UI.dist);
    if(UI.view==='follow'){ const k=.45/.84*TILE*sk/Math.hypot(F.x,F.z||1e-6); tv.set(F.z*k,.1/.84*TILE*sk,-F.x*k); SHARED.cam.position.add(tv); T.add(tv); }
    { const ax=pos.x, az=pos.z, bx=SHARED.cam.position.x, bz=SHARED.cam.position.z, L=Math.hypot(bx-ax,bz-az), m=.18*TILE;
      if(L>1e-3&&typeof SHARED.solids!=='undefined'){ const x0=Math.min(ax,bx)-m, x1=Math.max(ax,bx)+m, z0=Math.min(az,bz)-m, z1=Math.max(az,bz)+m, near=SHARED.solids.filter(b=>b[2]>x0&&b[0]<x1&&b[3]>z0&&b[1]<z1);
        if(near.length){ const n=Math.ceil(L/(.05*TILE)), A=tv.set(pos.x,SHARED.py+HEAD*sk,pos.z).clone(); for(let i=1;i<=n;i++){ const u=i/n, x=ax+(bx-ax)*u, z=az+(bz-az)*u;
          if(near.some(b=>x>b[0]-m&&x<b[2]+m&&z>b[1]-m&&z<b[3]+m)){ SHARED.cam.position.lerpVectors(A,SHARED.cam.position,Math.max(.04,(i-1)/n)); break; } } } } }
    if(FT)FEEL.cam(T,SHARED.cam.position); else { let g=SHARED.groundY(SHARED.cam.position.x,SHARED.cam.position.z)+LOW; const b=FOUNT.bedAt&&FOUNT.bedAt(SHARED.cam.position.x,SHARED.cam.position.z); if(b!=null&&dv>.01)g+=(b+LOW*.3-g)*dv; if(SHARED.cam.position.y<g)SHARED.cam.position.y=g; }
    SHARED.cam.lookAt(T); SHARED.cam.updateMatrixWorld(); };
  UI.setView(new URLSearchParams(location.search).get('view')||'iso');
  UI.home=()=>{ UI.off.set(0,0,0); zAt=null; if(UI.freeCam)setFree(false); };
  let fx=null, fz=null; const fv=new THREE.Vector3();
  UI.follow=()=>{ const mv=fx!=null&&Math.hypot(pos.x-fx,pos.z-fz)>1e-4; fx=pos.x; fz=pos.z; if(!mv||UI.off.lengthSq()<1e-8)return;
    fv.set(pos.x,SHARED.py+.9,pos.z).project(SHARED.cam); if(Math.abs(fv.x)>.92||Math.abs(fv.y)>.92){ UI.off.set(0,0,0); zAt=null; } };
  cv.addEventListener('pointerdown',e=>{ '@later'; if(e.button!==0||ED.on)return; if(window.WIELD&&WIELD.on&&!MAPED.on&&!WE.on&&!LAND.on&&!UI.freeCam){ WIELD.strike(); return; } if(MAPED.down(e)||WE.down(e)||LAND.down(e)){ cv.setPointerCapture(e.pointerId); return; } L={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:false}; UI.grab(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(MAPED.dragging){ MAPED.move(e); return; } if(WE.dragging){ WE.move(e); return; } if(LAND.dragging){ LAND.move(e); return; } if(!L)return; if(!L.moved&&Math.hypot(e.clientX-L.x0,e.clientY-L.y0)>5)L.moved=true;
    if(L.moved&&!e.shiftKey&&!e.altKey&&!UI.persp)UI.pan(e.clientX-L.x,e.clientY-L.y);
    else if(L.moved)UI.orbit(e.clientX-L.x,e.clientY-L.y); L.x=e.clientX; L.y=e.clientY; });
  cv.addEventListener('pointerup',()=>{ MAPED.up(); WE.up(); if(LAND.up)LAND.up(); L=null; });
  const THINGS=[]; UI.thing=o=>THINGS.push(o); UI.things=THINGS;
  let goal=null; const said=document.createElement('div'); said.id='said'; said.hidden=true; document.body.appendChild(said);
  const say=(txt,at)=>{ '@later'; const r=cv.getBoundingClientRect(), v=at.clone().project(SHARED.cam); said.textContent=txt; said.style.left=Math.round(r.left+(v.x+1)/2*r.width)+'px'; said.style.top=Math.round(r.top+(1-v.y)/2*r.height)+'px'; said.hidden=false; clearTimeout(say.t); say.t=setTimeout(()=>said.hidden=true,2500); };
  const thAt=th=>th.obj.getWorldPosition(new THREE.Vector3());
  cv.addEventListener('dblclick',e=>{ '@later'; if(MAPED.on||LAND.on)return; if(window.WIELD&&WIELD.on&&!WE.on)return; if(WE.on){ WE.pick(e); return; } if(ED.on||UI.freeCam)return; const r=cv.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),SHARED.cam);
    const live=THINGS.filter(th=>th.obj.visible&&(!th.obj.parent||th.obj.parent.visible)&&LEVELS.drawn(th.obj)); const hits=ray.intersectObjects(live.map(th=>th.obj),true);
    let best=null, bd=1e9; if(hits.length){ let o=hits[0].object; const th=live.find(th=>{ let q=o; while(q){ if(q===th.obj)return true; q=q.parent; } return false; }); if(th){ best=th; bd=hits[0].distance; } }
    const u=USE.pick(ray); if(u&&u.d<bd)best=u.th;
    if(best){ best.started=false; goal=best; return; }
    if(window.RIVER&&RIVER.pick&&!VIT.dead&&RIVER.pick(ray.ray,pos))return;
    goal=null; if(UI.fly)return; gplane.constant=-SHARED.py; if(ray.ray.intersectPlane(gplane,hit)){ SHARED.target=hit.clone(); UI.go(Math.hypot(hit.x-pos.x,hit.z-pos.z)); } });
  UI.useNear=()=>{ '@later'; if(ED.on||UI.freeCam||MAPED.on||WE.on||LAND.on)return false; const hx=Math.sin(SHARED.heading), hz=Math.cos(SHARED.heading); let best=null, bs=1e9;
    for(const th of THINGS){ if(!th.obj.visible||th.obj.parent&&!th.obj.parent.visible||!LEVELS.drawn(th.obj))continue; const p=thAt(th), dx=p.x-pos.x, dz=p.z-pos.z, d=Math.hypot(dx,dz);
      if(d>(th.near||(th.reach||1)+1.2*TILE)||Math.abs(p.y-SHARED.py)>2*TILE)continue; const s=d-(dx*hx+dz*hz)/(d||1)*.6*TILE; if(s<bs){ bs=s; best=th; } }
    if(!best&&typeof USE!=='undefined')for(const dy of [0,-.5,-1.2]){ ray.set(new THREE.Vector3(pos.x,SHARED.py+TILE,pos.z),new THREE.Vector3(hx,dy,hz).normalize()); ray.far=2.4*TILE; const u=USE.pick(ray); ray.far=Infinity; if(u){ best=u.th; break; } }
    if(!best)return false; best.started=false; goal=best; return true; };
  UI.go=d=>{ UI.clickGo=true; UI.clickRun=d>6; };
  UI.runTick=()=>{ if(!UI.clickGo)return; if(!SHARED.target){ UI.clickGo=false; st.runTarget=keys.has('shift')?1:0; return; } st.runTarget=keys.has('shift')||UI.clickRun&&Math.hypot(SHARED.target.x-pos.x,SHARED.target.z-pos.z)>1.6?1:0; };
  UI.goTick=()=>{ if(!goal)return; const p=thAt(goal), d=Math.hypot(p.x-pos.x,p.z-pos.z), reach=goal.pick?Math.min(goal.reach||1,.5*TILE):goal.reach||1;
    const stuck=!SHARED.target&&goal.started; if(d>reach&&!(stuck&&d<(goal.near||0))){ if(stuck)goal=null; else { const k=(d-reach*0.8)/d; SHARED.target=new THREE.Vector3(pos.x+(p.x-pos.x)*k,SHARED.py,pos.z+(p.z-pos.z)*k); if(!goal.started)UI.go(d); goal.started=true; } return; }
    SHARED.target=null; SHARED.heading=Math.atan2(p.x-pos.x,p.z-pos.z); const g=goal; goal=null; if(VIT.dead&&!g.ghost)return say('YOU ARE A GHOST.',p.clone().setY(p.y+(g.tall||1.6))); if(g.pick&&!st.sit&&!st.ride&&!(st.water&&st.water.in)){ RIG.act(st,{pick:((g.pick===true?p.y:SHARED.py+g.pick)-SHARED.py)/W3.group.scale.y,z:d/W3.group.scale.x}); setTimeout(()=>g.act(),330); } else g.act(); if(g.npc&&typeof LINES!=='undefined')LINES.say(g.npc,'greet'); else say(g.name,p.clone().setY(p.y+(g.tall||1.6))); };
  const css=document.createElement('style'); css.textContent=`
  #mode{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom,0px));font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15}
  #mode[hidden],#shd[hidden],#said[hidden]{display:none}
  #menu .box,#looks,#we,#movesp,#maped,#snded,#shbar,#hud,#stat,#shd,#said,.said2,#vit,#moves{zoom:var(--uiz,1)}
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
    <div class="tabs" role="tablist"><button role="tab" data-t="map">MAP</button><button role="tab" data-t="display">DISPLAY</button><button role="tab" data-t="atmo">ATMOSPHERE</button><button role="tab" data-t="graphics">GRAPHICS</button><button role="tab" data-t="sound">SOUND</button><button role="tab" data-t="keys">KEYS</button><button role="tab" data-t="bug">REPORT A BUG</button></div>
    <div class="pane" data-p="map"><div class="row"><button class="btn" data-lv="up">THE STREET</button><button class="btn" data-lv="down">UNDERGROUND</button><span class="dim">click the map to go there</span></div>
      <canvas id="mapcv"></canvas><h3>GO TO</h3><div class="row"><select id="placesel" class="btn" style="font:inherit;min-width:min(340px,80vw);padding:6px 8px;background:#0e1016;color:#ece5d3;border:2px solid #3a3f4e"></select></div><div class="row" id="places" hidden></div></div>
    <div class="pane" data-p="display">
      <h3>VIEW</h3><div class="row"><span style="width:60px">ZOOM</span><input type="range" id="dzoom" min="0" max="1" step="0.001"></div>
      <div class="row"><span style="width:60px">TILT</span><input type="range" id="dtilt" min="0" max="1" step="0.001"><button class="btn" id="dreset">RESET THE VIEW</button></div>
      <h3>VIEW</h3><div class="row" id="dview"><button class="btn" data-view="map">MAP VIEW</button><button class="btn" data-view="iso">ISOMETRIC</button><button class="btn" data-view="third">THIRD PERSON</button><button class="btn" data-view="follow">BEHIND</button><button class="btn" data-view="first">FIRST PERSON</button></div>
      <div class="row"><button class="btn" id="dbody">PHYSICS BODY</button><span style="width:60px">LOOSE</span><input type="range" id="dloose" min="0" max="1" step="0.01"></div>
      <h3>ON SCREEN</h3><div class="row"><button class="btn" id="dhelp">HELP PANEL</button><button class="btn" id="dstat">STATS</button><button class="btn" id="drin">RENDER INSPECTOR</button><span style="width:70px;margin-left:8px">UI SCALE</span><button class="btn" data-ui="small">SMALL</button><button class="btn" data-ui="medium">MEDIUM</button><button class="btn" data-ui="large">LARGE</button></div></div>
    <div class="pane" data-p="atmo">
      <div id="adn"></div>
      <h3>WEATHER</h3><div class="row" id="awx"></div>
      <h3>LIGHT</h3><div class="row"><button class="btn" id="dlook">GLOW AND NIGHT LOOK</button><button class="btn" id="dsmooth">LIGHT BANDS</button></div>
      <h3>HAZE</h3><div class="row" id="atmhaze"></div><div class="dim">the mist round the town's edge (MIST), the old far haze and sky (FAR), or none; DISTANCE LOOK sets its every number</div></div>
    <div class="pane" data-p="graphics">
      <h3>RESOLUTION</h3><div class="row" id="dres"></div><div class="dim" id="dsharp"></div>
      <h3>SHADOWS</h3><div class="row" id="dshd"></div>
      <h3>CHARACTERS</h3><div class="row"><button class="btn" id="danim">ANIMATION</button><button class="btn" id="dlit">LIGHT ON THEM</button><button class="btn" id="doutl">OUTLINE</button></div>
      <div class="row"><span style="width:110px">SHADE STEPS</span><input type="range" id="dsteps" min="2" max="12" step="1"><span style="width:110px">SHADOW DEPTH</span><input type="range" id="ddepth" min="0.02" max="0.98" step="0.005"></div></div>
    <div class="pane" data-p="sound"><h3>SOUND</h3><div class="row"><button class="btn" id="dsfx">EFFECTS</button><button class="btn" id="damb">AMBIENCE</button><span style="width:60px">VOLUME</span><input type="range" id="dvol" min="0" max="1" step="0.01"></div><div id="dsndin"></div></div>
    <div class="pane" data-p="keys"><div class="dim" style="margin-bottom:8px">click a key, then press the one you want (Escape to keep it)</div><table id="keytab"></table>
      <div class="row" style="margin-top:10px"><button class="btn" id="kreset">ALL BACK AS THEY WERE</button></div></div>
    <div class="pane" data-p="bug" id="dbug"></div>
    <div class="foot"><span>ESC closes</span><span>THE MARKET</span></div></div>`;
  document.body.appendChild(M);
  const $=s=>M.querySelector(s); let tab='map', mapLv='up'; if(!SOUND)$('[data-t="sound"]').style.display='none';
  const show=t=>{ tab=t; M.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===t))); M.querySelectorAll('[data-p]').forEach(p=>p.hidden=p.dataset.p!==t); if(t==='map')drawMap(); if(t==='display'||t==='graphics'||t==='sound'||t==='atmo')drawDisplay(); if(t==='sound')SNDED.into($('#dsndin')); if(t==='keys')drawKeys(); if(t==='bug')BUGS.open($('#dbug')); if(t==='atmo')window.DN&&DN.draw(); };
  M.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>show(b.dataset.t));
  M.addEventListener('click',e=>{ if(e.target===M)toggleMenu(); });
  UI.toggleMenu=()=>toggleMenu(); UI.menuTab=t=>{ if(!UI.menuOpen)toggleMenu(); show(t); };
  function toggleMenu(){ UI.menuOpen=!UI.menuOpen; M.hidden=!UI.menuOpen; keys.clear(); st.runTarget=0; if(UI.menuOpen){ mapLv=SHARED.LVL; show(tab); } }
  const mcv=$('#mapcv'), mg=mcv.getContext('2d'), rt=new THREE.WebGLRenderTarget(8,8), top=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
  const mapRect=lv=>{ const B=lv==='down'?MODS.station.BOUND:MODS.bodega.BOUND;
    const w=B.x1-B.x0, d=B.z1-B.z0, k=Math.min(800/w,420/d); return {x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1,W:Math.round(w*k),H:Math.round(d*k)}; };
  const GAM=new Uint8Array(256).map((_,i)=>Math.round(255*Math.pow(i/255,1/2.2))), CLP=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(0,1,0),0)], cc=new THREE.Color();
  UI.topShot=(R,lv,W,H)=>{ '@later'; const vis={}; rt.setSize(W,H); for(const k in MAPG)vis[k]=MAPG[k].visible; if(MAPG.park)MAPG.park.visible=lv==='up'; const LH=LEVELS.hide(lv==='down'?'station':'street');
    const h0=HEMI.intensity; HEMI.intensity=2.2; W3.group.visible=false; marker.visible=false;
    const yc=lv==='down'?MODS.station.DY:0; CLP[0].constant=yc+1.5; CLP[1].constant=-(yc-2.2);
    top.left=R.x0; top.right=R.x1; top.top=-R.z0; top.bottom=-R.z1; top.position.set(0,yc+60,0); top.up.set(0,0,-1); top.lookAt(0,yc,0); top.near=1; top.far=120; top.updateProjectionMatrix();
    const cp=renderer.clippingPlanes; renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); renderer.clippingPlanes=CLP;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x050507,1); renderer.clear(); renderer.render(scene,top); const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px);
    renderer.setRenderTarget(null); renderer.clippingPlanes=cp; renderer.setClearColor(cc,ca);
    LEVELS.show(LH); for(const k in vis)MAPG[k].visible=vis[k]; HEMI.intensity=h0; W3.group.visible=true;
    const im=new ImageData(W,H); for(let y=0;y<H;y++){ const o=y*W*4, q=(H-1-y)*W*4; for(let i=0;i<W*4;i+=4){ im.data[o+i]=GAM[px[q+i]]; im.data[o+i+1]=GAM[px[q+i+1]]; im.data[o+i+2]=GAM[px[q+i+2]]; im.data[o+i+3]=255; } } return im; };
  const PLAN={}; const plan=()=>{ if(PLAN.im)return PLAN; const F={...RING.cf}, S=2, W=Math.round((F.x1-F.x0)*S), H=Math.round((F.y1-F.y0)*S), K=BLDK, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY;
    const bt=(x,y)=>[OX+(x-OX)*K,OY+(y-OY)*K], wt=(x,z)=>[OX+x/TILE,OY+z/TILE];
    const P=PARK, px0=P.x0+P.ox, px1=P.x1+P.ox, py0=P.y0+P.oy, py1=P.y1+P.oy, RV=RING.river, G=SHARED.BOD.grounds.filter(g=>!g.bld), RA=SHARED.BOD.road.at;
    const C={void:[11,13,18],water:[40,86,128],quay:[104,104,98],road:[52,54,60],alley:[70,71,76],walk:[142,138,128],land:[60,104,54],lawn:[74,134,60],way:[186,170,128],wall:[48,52,46]};
    const kind=(x,y)=>{ if(x<F.x0||x>F.x1||y<F.y0||y>F.y1)return 'void'; if(y<RV.y1)return y>RV.y1-1?'quay':'water'; if(RA(x,y))return 'road';
      if(x>px0&&x<px1&&y>py0&&y<py1){ if(x<px0+.5||x>px1-.5||y<py0+.5||y>py1-.5)return 'wall'; if(FOUNT.lake(x-P.ox,y-P.oy)<0)return 'water'; if(FOUNT.ter(x-P.ox,y-P.oy)<0)return 'way'; return P.path&&P.path(x-P.ox,y-P.oy)?'way':P.brook&&(h=>h!=null&&h<P.brook.L(P.brook.q(x-P.ox,y-P.oy)[1]))(P.brook.h(x-P.ox,y-P.oy))?'water':'lawn'; }
      for(let i=G.length-1;i>=0;i--){ const g=G[i]; if(x>=g.x0&&x<g.x1&&y>=g.y0&&y<g.y1)return /road|Road/.test(g.id)?'road':g.id==='alley'?'alley':g.id==='corner'?(g.z<0?'road':'walk'):'walk'; } return 'land'; };
    const im=new ImageData(W,H); for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const c=C[kind(F.x0+(i+.5)/S,F.y1-(j+.5)/S)], o=(j*W+i)*4; im.data[o]=c[0]; im.data[o+1]=c[1]; im.data[o+2]=c[2]; im.data[o+3]=255; }
    const B=[], add=(a,b,col,n)=>B.push({x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1]),col,n});
    { const b=SHARED.BOD.B0; add(bt(b.x0,b.y0),bt(b.x1,b.y1),[176,86,58],'BODEGA'); }
    if(MODS.apts&&MODS.apts.A){ const a=MODS.apts.A; add(bt(a.x0,a.y0),bt(a.x1,a.y1),[150,74,58],'APARTMENTS'); }
    { const g=SHARED.BOD.grounds.find(q=>q.id==='ghostst'); if(g)add(bt(g.x0,g.y0),bt(g.x1,g.y1),[112,78,48],'GHOST ST'); }
    if(window.BLK)for(const q of BLK.blds)add([q.x0,q.y0],[q.x1,q.y1],[110,100,96],'');
    { const c=CASTLE.b; add([c[0],c[2]],[c[1],c[3]],[120,118,110],'CASTLE'); }
    if(GCAVE.box){ const b=GCAVE.box; add(wt(b[0],b[1]),wt(b[2],b[3]),[96,96,100],'CAVE'); }
    if(GTOWER.site){ const t=GTOWER.site(); if(t)add(wt(t.x-t.w/2,t.z-t.d/2),wt(t.x+t.w/2,t.z+t.d/2),[130,126,116],'TOWER'); }
    add([MAPSTAIR.x0,MAPSTAIR.y0],[MAPSTAIR.x1,MAPSTAIR.y1],[30,30,34],'SUBWAY'); { const n=(MAPSTAIR.x0+MAPSTAIR.x1)/2-6; add([n-1.4,-76.35],[n+1.4,-74.85],[46,110,64],''); }
    for(const R of STORE.rooms||[]){ const a=wt(R.x0,R.z0), b=wt(R.x1,R.z1); if(a[0]>F.x0&&b[0]<F.x1&&Math.max(a[1],b[1])>RV.y1&&Math.min(a[1],b[1])<F.y1&&!B.some(q=>Math.abs(q.x0-Math.min(a[0],b[0]))<1&&Math.abs(q.y0-Math.min(a[1],b[1]))<1))add(a,b,[110,104,96],(R.name||'').toUpperCase()); }
    for(const q of B){ const i0=Math.round((q.x0-F.x0)*S), i1=Math.round((q.x1-F.x0)*S), j0=Math.round((F.y1-q.y1)*S), j1=Math.round((F.y1-q.y0)*S);
      for(let j=Math.max(0,j0);j<Math.min(H,j1);j++)for(let i=Math.max(0,i0);i<Math.min(W,i1);i++){ const e=i===i0||i===i1-1||j===j0||j===j1-1, o=(j*W+i)*4; for(let k=0;k<3;k++)im.data[o+k]=e?q.col[k]*.55:q.col[k]; } }
    for(let i=0;i<W;i++)for(const j of [0,H-1]){ const o=(j*W+i)*4; im.data[o]=70; im.data[o+1]=200; im.data[o+2]=210; }
    for(let j=0;j<H;j++)for(const i of [0,W-1]){ const o=(j*W+i)*4; im.data[o]=70; im.data[o+1]=200; im.data[o+2]=210; }
    const L=[]; for(const q of B)if(q.n)L.push([q.n,(q.x0+q.x1)/2,q.y1<SHARED.BOD.road.CORN[0].y?q.y0-2.5:q.y1+1.5]);
    L.push(['CENTRAL PARK',(px0+px1)/2,(py0+py1)/2+12],['HUDSON RIVER',(F.x0+F.x1)/2,(RV.y0+RV.y1)/2],['MARKET ST',(RING.wr1+RING.ff.x1)/2-40,(SHARED.BOD.road.CORN[0]?SHARED.BOD.road.CORN[0].y:-60)]);
    Object.assign(PLAN,{F,S,W,H,im,L,sx:x=>(x-F.x0)*S,sy:y=>(F.y1-y)*S,tile:(i,j)=>[F.x0+i/S,F.y1-j/S]}); return PLAN; };
  function drawMap(){ M.querySelectorAll('[data-lv]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lv===mapLv)));
    if(mapLv==='up'){ const Q=plan(); mcv.width=Q.W; mcv.height=Q.H; mcv.style.width='100%'; mg.putImageData(Q.im,0,0); mg.font='8px Silkscreen,monospace'; mg.textAlign='center'; mg.textBaseline='middle';
      const U=[]; for(const [n,x,y] of Q.L){ const a=Math.round(Q.sx(x)), w=mg.measureText(n).width/2+2; let b=Math.round(Q.sy(y)); while(U.some(u=>Math.abs(u[0]-a)<u[2]+w&&Math.abs(u[1]-b)<9))b+=9; U.push([a,b,w]);
        mg.fillStyle='#000'; mg.fillText(n,a+1,b+1); mg.fillStyle='#ece5d3'; mg.fillText(n,a,b); }
      if(SHARED.LVL==='up'){ const a=Math.round(Q.sx(SHARED.BOD.OX+pos.x/TILE)), b=Math.round(Q.sy(SHARED.BOD.OY+pos.z/TILE)); mg.fillStyle='#000'; mg.fillRect(a-4,b-4,9,9); mg.fillStyle='#f2c14e'; mg.fillRect(a-3,b-3,7,7); } return; }
    mcv.style.width=''; const R=mapRect(mapLv), W=R.W, H=R.H; mcv.width=W; mcv.height=H; mg.putImageData(UI.topShot(R,mapLv,W,H),0,0);
    const sx=x=>(x-R.x0)/(R.x1-R.x0)*W, sz=z=>(z-R.z0)/(R.z1-R.z0)*H; if((SHARED.LVL)===mapLv){ mg.fillStyle='#f2c14e'; mg.fillRect(Math.round(sx(pos.x))-3,Math.round(sz(pos.z))-3,7,7); mg.fillStyle='#000'; mg.fillRect(Math.round(sx(pos.x))-1,Math.round(sz(pos.z))-1,3,3); } }
  STORE.goTo=(x,z,lv,hd)=>goTo(x,z,lv,hd);
  window.__UI=UI;
  const goTo=(x,z,lv,hd)=>{ pos.set(x,0,z); SHARED.target=null; if(hd!=null)SHARED.heading=hd; SHARED.py=typeof lv==='number'?lv:lv==='down'?(MODS.dungeon&&MODS.dungeon.inside(x,z)?MODS.dungeon.ground(x,z):MODS.station.ground(x,z)):0; if(UI.freeCam)UI.camT.set(x,SHARED.py+.9,z); else UI.off.set(0,0,0); if(UI.menuOpen)toggleMenu(); };
  UI.goTo=goTo;
  mcv.addEventListener('click',e=>{ '@later'; const r=mcv.getBoundingClientRect(); if(mapLv==='up'){ const Q=plan(), [x,y]=Q.tile((e.clientX-r.left)/r.width*Q.W,(e.clientY-r.top)/r.height*Q.H); return goTo((x-SHARED.BOD.OX)*TILE,(y-SHARED.BOD.OY)*TILE,'up'); } const R=mapRect(mapLv); goTo(R.x0+(e.clientX-r.left)/r.width*(R.x1-R.x0),R.z0+(e.clientY-r.top)/r.height*(R.z1-R.z0),mapLv); });
  M.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ mapLv=b.dataset.lv; drawMap(); });
  const PLACES=[['THE STREET',-2.2,3.2,'up'],['THE BODEGA',SHARED.BOD.X((SHARED.BOD.B0.x0+SHARED.BOD.B0.x1)/2),SHARED.BOD.Z(SHARED.BOD.B0.y1)-1.6,'up',null,Math.PI],['THE PLATFORM',MODS.station.plat.x,MODS.station.plat.z,'down'],['CENTRAL PARK',SHARED.BOD.XS(PARK.round[0]+PARK.ox),SHARED.BOD.ZS(PARK.y0+7+PARK.oy),'up'],['THE BATH HOUSE',SHARED.BOD.X(SHARED.BOD.GD.door[0]),SHARED.BOD.Z(SHARED.BOD.GD.door[1]+4.5),'up'],...(STORE.main?STORE.main.doors.map(d=>[...d,'up']):[]),['THE CASTLE',SHARED.BOD.XS(CASTLE.gate),SHARED.BOD.ZS(CASTLE.b[2]-3),'up'],['DUNGEON L1',MODS.dungeon.arrive(1).x,MODS.dungeon.arrive(1).z,'down']];
  UI.places=()=>PLACES.concat(STORE.places||[]);
  const goPlace=async n=>{ if(STORE.ensure)await STORE.ensure(); if(STORE.offGo)await STORE.offGo(n); const P=PLACES.concat(STORE.places).find(p=>p[0]===n); if(P)goTo(P[1],P[2],P[3],P[5]); }; UI.goPlace=goPlace;
  { const q=QS.get('place'); const go=()=>window.__started?goPlace(q.toUpperCase()):setTimeout(go,200); if(q)setTimeout(go,300); }
  for(const [n,x,z,lv,,hd] of PLACES){ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goTo(x,z,lv,hd); $('#places').appendChild(b); }
  { const h=document.createElement('h3'); h.textContent='ROOMS'; $('#places').parentNode.appendChild(h); const row=document.createElement('div'); row.className='row'; row.id='roomsrow'; $('#places').parentNode.appendChild(row);
    const add=(n,x,z,lv)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goTo(x,z,lv); row.appendChild(b); PLACES.push([n,x,z,lv]); };
    const mid=(X,Z,r)=>[(X(r[0])+X(r[2]))/2,(Z(r[1])+Z(r[3]))/2], B=SHARED.BOD.B0;
    add('THE SHOP',...mid(SHARED.BOD.X,SHARED.BOD.Z,[B.x0,SHARED.BOD.BODOFF,B.x1,B.y1]),'up'); add('THE BACK ROOM',...mid(SHARED.BOD.X,SHARED.BOD.Z,[B.x0,B.y0,B.x1,SHARED.BOD.BODOFF]),'up');
    if(SHARED.BOD.GD)add('THE BATHS',...mid(SHARED.BOD.X,SHARED.BOD.Z,SHARED.BOD.GD.floor||SHARED.BOD.GD.r),'up');
    add('THE SUBWAY STAIRS',SHARED.BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),SHARED.BOD.ZS(MAPSTAIR.y1+1.2),'up'); }
  if(STORE.places.length){ const h=document.createElement('h3'); h.textContent='MORE PLACES'; $('#places').parentNode.appendChild(h); const row=document.createElement('div'); row.className='row'; row.id='stored'; $('#places').parentNode.appendChild(row);
    for(const [n] of STORE.places){ const b=document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>goPlace(n); row.appendChild(b); } }
  { const sel=$('#placesel'), grp=(label,list,go)=>{ if(!list.length)return; const g=document.createElement('optgroup'); g.label=label; for(const n of list){ const o=document.createElement('option'); o.value=n; o.textContent=n; o.dataset.go=go; g.appendChild(o); } sel.appendChild(g); };
    const first=document.createElement('option'); first.value=''; first.textContent='CHOOSE A PLACE...'; sel.appendChild(first);
    const pb=[...$('#places').querySelectorAll('button')].map(b=>b.textContent), rb=[...(($('#roomsrow')||{}).querySelectorAll?$('#roomsrow').querySelectorAll('button'):[])].map(b=>b.textContent);
    grp('PLACES',pb,'p'); grp('ROOMS',rb,'p'); grp('MORE PLACES',(STORE.places||[]).map(p=>p[0]),'s');
    sel.onchange=()=>{ const o=sel.selectedOptions[0]; if(!o||!o.value)return; const n=o.value; sel.value=''; if(o.dataset.go==='s')goPlace(n); else { const P=PLACES.find(p=>p[0]===n); if(P)goTo(P[1],P[2],P[3]); } };
    sel.addEventListener('keydown',e=>e.stopPropagation());
    for(const id of ['places','roomsrow','stored'])if($('#'+id)){ $('#'+id).style.display='none'; const h=$('#'+id).previousElementSibling; if(id!=='places'&&h&&h.tagName==='H3')h.style.display='none'; } }
  const zMin=3, zMax=ZMAX, z2r=v=>Math.log(v/zMin)/Math.log(zMax/zMin), r2z=r=>zMin*Math.pow(zMax/zMin,r);
  function drawDisplay(){ '@later'; $('#dsfx').textContent='EFFECTS '+(SFX.on?'ON':'OFF'); $('#dsfx').setAttribute('aria-pressed',String(SFX.on)); $('#damb').textContent='AMBIENCE '+(AMB.on?'ON':'OFF'); $('#damb').setAttribute('aria-pressed',String(AMB.on)); $('#dvol').value=SFX.vol; M.querySelectorAll('[data-res]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.res===SHARED.RESI))); $('#dlook').setAttribute('aria-pressed',String(LOOK.on)); $('#dlook').textContent='GLOW AND NIGHT LOOK '+(LOOK.on?'ON':'OFF'); $('#dsteps').value=W3.shade.steps; $('#ddepth').value=W3.shade.depth; M.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===UI.view))); $('#dsharp').textContent=(SCL===1&&vpu()<art()?'full':RES()+'×')+' the game\'s detail'; $('#dzoom').value=z2r(SHARED.ppuTo); $('#dtilt').value=(SHARED.pitchTo-PMIN)/(PMAX-PMIN);
    $('#dlit').textContent='LIGHT ON THEM: '+(UI.lit?'LAMPS':'FLAT'); $('#dlit').setAttribute('aria-pressed',String(UI.lit)); $('#dbody').setAttribute('aria-pressed',String(PB.on)); $('#dbody').textContent='PHYSICS BODY '+(PB.on?'ON':'OFF'); $('#dloose').value=PB.loose; $('#doutl').setAttribute('aria-pressed',String(OUTL.on)); $('#doutl').textContent='OUTLINE '+(OUTL.on?'ON':'OFF'); $('#dhelp').setAttribute('aria-pressed',String(!document.getElementById('hud').hidden)); $('#dstat').setAttribute('aria-pressed',String(!document.getElementById('stat').hidden)); $('#drin').setAttribute('aria-pressed',String(!!(window.RINSP&&RINSP.on)));
    const sh=document.getElementById('shd'); $('#dshd').innerHTML=''; sh.querySelectorAll('button').forEach(b=>{ const c=document.createElement('button'); c.className='btn'; c.textContent=b.textContent; c.setAttribute('aria-pressed',b.getAttribute('aria-pressed')); c.onclick=()=>{ b.click(); drawDisplay(); }; $('#dshd').appendChild(c); }); }
  const RESN=['COARSEST','COARSE','NORMAL','SHARP'];
  for(let i=0;i<=RESMAX;i++){ const b=document.createElement('button'); b.className='btn'; b.dataset.res=i; b.textContent=RESN[i]||RESL[i]+'×'; b.onclick=()=>{ if(i<SHARED.RESI)SHARED.RESI=i; while(SHARED.RESI<i&&(pxS()>1||vpu()>art()))SHARED.RESI++; resize(); drawDisplay(); }; $('#dres').appendChild(b); }
  { const b=$('#danim'), L=[8,10,12,0], name=()=>'ANIMATION '+(ASTEP.fps>0?'STEPPED '+ASTEP.fps:'EVERY FRAME'); b.textContent=name();
    b.onclick=()=>{ const i=L.indexOf(ASTEP.fps); ASTEP.fps=L[(i+1)%L.length]; try{ SAVE.set('animfps',String(ASTEP.fps)); }catch(e){} b.textContent=name(); }; }
  $('#dsmooth').textContent='LIGHT BANDS '+CEL; $('#dsmooth').onclick=()=>{ const n=CEL>=5?3:CEL+1; try{ SAVE.set('bands',String(n)); localStorage.removeItem('market-shade'); }catch(e){} location.reload(); };
  $('#dlook').onclick=()=>{ LOOK.on=!LOOK.on; try{ SAVE.set('look',LOOK.on?'1':'0'); }catch(e){} drawDisplay(); };
  $('#dzoom').oninput=e=>{ SHARED.ppuTo=r2z(+e.target.value); }; $('#dtilt').oninput=e=>{ SHARED.pitchTo=clampP(PMIN+(+e.target.value)*(PMAX-PMIN)); };
  M.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{ UI.setView(b.dataset.view); drawDisplay(); });
  $('#dsteps').oninput=e=>W3.setShade(+e.target.value,W3.shade.depth); $('#ddepth').oninput=e=>W3.setShade(W3.shade.steps,+e.target.value);
  $('#dreset').onclick=()=>{ SHARED.yawTo=VIEW0.yaw; SHARED.pitchTo=VIEW0.pitch; SHARED.ppuTo=VIEW0.ppu; UI.home(); drawDisplay(); };
  const UIS={small:.9,medium:1,large:1.1}; UI.setScale=k=>{ if(!UIS[k])k='medium'; UI.scale=k; document.documentElement.style.setProperty('--uiz',UIS[k]); SAVE.set('uiscale',k); M.querySelectorAll('[data-ui]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ui===k))); };
  UI.setScale(SAVE.get('uiscale')||'medium'); M.querySelectorAll('[data-ui]').forEach(b=>b.onclick=()=>UI.setScale(b.dataset.ui));
  $('#dhelp').onclick=()=>{ const h=document.getElementById('hud'); h.hidden=!h.hidden; drawDisplay(); }; $('#dstat').onclick=()=>{ const h=document.getElementById('stat'); h.hidden=!h.hidden; drawDisplay(); }; $('#drin').onclick=()=>{ if(!window.RINSP)return; RINSP.toggle(); drawDisplay(); if(RINSP.on&&UI.menuOpen)toggleMenu(); };
  try{ OUTL.on=SAVE.get('outline')==='1'; }catch(e){ OUTL.on=false; } OUTL.sp.enabled=OUTL.on;
  $('#doutl').onclick=()=>{ OUTL.on=!OUTL.on; OUTL.sp.enabled=OUTL.on; try{ SAVE.set('outline',OUTL.on?'1':'0'); }catch(e){} drawDisplay(); };
  UI.setLit=on=>{ UI.lit=on; W3.mesh.material=on?W3.toon:W3.flat; for(const N of NPCS)N.me.material=on?N.toon:N.flat; try{ SAVE.set('avlight',on?'1':'0'); }catch(e){} };
  { let v='1'; try{ v=SAVE.get('avlight')||'1'; }catch(e){} UI.setLit(v==='1'); }
  $('#dlit').onclick=()=>{ UI.setLit(!UI.lit); drawDisplay(); };
  $('#dsfx').onclick=()=>{ SFX.set(!SFX.on,null); drawDisplay(); }; $('#damb').onclick=()=>{ AMB.set(!AMB.on); drawDisplay(); }; $('#dvol').oninput=e=>SFX.set(null,+e.target.value);
  $('#dbody').onclick=()=>{ PB.set(!PB.on,true); drawDisplay(); }; $('#dloose').oninput=e=>{ PB.loose=+e.target.value; try{ SAVE.set('loose',String(PB.loose)); }catch(err){} };
  function drawKeys(){ '@later'; const t=$('#keytab'); t.innerHTML=''; for(const [a,what] of ACTS){ const tr=document.createElement('tr'), b=document.createElement('button'); b.className='btn'; b.textContent=waiting===a?'PRESS A KEY…':NAME(keyOf(a)); b.setAttribute('aria-pressed',String(waiting===a)); b.onclick=()=>{ waiting=a; drawKeys(); };
      const td1=document.createElement('td'); td1.textContent=what.toUpperCase(); const td2=document.createElement('td'); td2.appendChild(b); tr.append(td1,td2); t.appendChild(tr); }
    const e=document.createElement('tr'); e.innerHTML='<td>MENU</td><td><span class="dim">ESC</span></td>'; t.appendChild(e); if(UI.padKeys)UI.padKeys(t); }
  $('#kreset').onclick=()=>{ BIND={}; try{ SAVE.del('keys'); }catch(e){} REV=rev(); drawKeys(); drawBadge(); };
  for(const id of ['hud','stat','shd'])document.getElementById(id).hidden=true; document.getElementById('loading')?.remove();
  drawBadge(); }
{ const PANS=[['menu',()=>UI.toggleMenu(),'.box'],['looks',el=>{ el.hidden=true; }],['we',()=>WE.toggle()],['movesp'],['maped',()=>MAPED.toggle()],['snded',()=>SNDED.close()],['shbar'],['hud'],['stat'],['shd'],['gemp'],['packp',el=>{ el.hidden=true; if(window.FORAGE)FORAGE.PACK.open=false; }],['shopp'],['fishp'],['vegp'],['birdp'],['bookp'],['minep'],['farlook'],['rinsp',()=>RINSP.toggle(false)]];
  const css=document.createElement('style'); css.textContent='.pX{position:absolute;right:4px;top:4px;z-index:2;font:12px Silkscreen,monospace;color:#f2c14e;background:#0e1016;border:2px solid #3a3f4e;width:24px;height:24px;line-height:18px;padding:0;cursor:pointer} .pDrag{cursor:move}'; document.head.appendChild(css);
  const hide=el=>{ el.hidden=true; if(el.style.display)el.style.display='none'; };
  const NOPE='button,input,select,textarea,a,label,canvas,option,.pX';
  const drag=(box)=>{ box.classList.add('pDrag'); box.addEventListener('mousedown',e=>{ '@later'; if(e.button!==0||e.target.closest(NOPE))return; e.stopPropagation(); e.preventDefault();
      const r=box.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; Object.assign(box.style,{position:'fixed',left:r.left+'px',top:r.top+'px',right:'auto',bottom:'auto',transform:'none',margin:'0',width:r.width+'px',height:box.id==='ed'?r.height+'px':box.style.height}); const fit=t=>{ box.style.maxHeight=Math.max(120,innerHeight-t-8)+'px'; if(getComputedStyle(box).overflowY==='visible')box.style.overflowY='auto'; }; fit(r.top); box.style.inset='auto'; box.style.left=r.left+'px'; box.style.top=r.top+'px';
      const mv=e=>{ box.style.left=Math.max(-r.width+60,Math.min(innerWidth-60,e.clientX-dx))+'px'; box.style.top=Math.max(0,Math.min(innerHeight-30,e.clientY-dy))+'px'; fit(parseFloat(box.style.top)); }, up=()=>{ removeEventListener('mousemove',mv,true); removeEventListener('mouseup',up,true); };
      addEventListener('mousemove',mv,true); addEventListener('mouseup',up,true); }); };
  const look=()=>{ for(const [id,close,sub] of PANS){ const el=document.getElementById(id); if(!el)continue; const box=sub?el.querySelector(sub):el; if(!box)continue;
      if(!box.dataset.pan){ box.dataset.pan=1; drag(box); if(getComputedStyle(box).position==='static')box.style.position='relative'; }
      if(!box.querySelector(':scope>.pX')){ const x=document.createElement('button'); x.className='pX'; x.type='button'; x.textContent='X'; x.title='close'; x.onclick=e=>{ e.stopPropagation(); close?close(el):hide(el); }; box.appendChild(x); } } };
  look(); setInterval(look,400); }
