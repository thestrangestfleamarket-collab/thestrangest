// THE MOUSE LOOK: in first person a click on the game takes the mouse (Pointer Lock) and it turns your head; Esc, a menu or an open window gives it back.
import {ED, LAND, MAPED, SPRAY, UI, WE} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {PAD} from './075-main-13.js';
{ const cv=renderer.domElement, can=!!cv.requestPointerLock&&!matchMedia('(pointer:coarse)').matches, K=.45; let t0=0;
  const held=()=>document.pointerLockElement===cv, busy=()=>UI.view!=='first'||UI.menuOpen||UI.owned()||ED.on||MAPED.on||WE.on||LAND.on||SPRAY.on||!!(window.CARS&&CARS.driving);
  const dot=document.createElement('div'); dot.id='mlk'; dot.hidden=true; dot.style.cssText='position:fixed;left:50%;top:50%;width:4px;height:4px;margin:-3px 0 0 -3px;background:#f4f0e4;border:1px solid #0b0d13;border-radius:50%;z-index:3;pointer-events:none'; document.body.appendChild(dot);
  const take=()=>{ let p=null; try{ p=cv.requestPointerLock({unadjustedMovement:true}); }catch(e){} if(p&&p.catch)p.catch(()=>{ try{ const q=cv.requestPointerLock(); if(q&&q.catch)q.catch(()=>{}); }catch(e){} }); };
  UI.locked=()=>held()&&performance.now()-t0>400;
  if(can){ cv.addEventListener('click',e=>{ if(e.button===0&&!held()&&!busy())take(); });
    document.addEventListener('pointerlockchange',()=>{ t0=performance.now(); dot.hidden=!held(); });
    document.addEventListener('mousemove',e=>{ if(!held())return; if(busy()){ document.exitPointerLock(); return; } const dx=e.movementX||0, dy=e.movementY||0; if(Math.abs(dx)<400&&Math.abs(dy)<400)UI.orbit(dx*K,dy*K); });
    SYS.every(()=>{ if(held()&&(busy()||PAD.panels().length))document.exitPointerLock(); },250,'162ac-mouselook'); } }
