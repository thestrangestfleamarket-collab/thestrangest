// THE SCREEN STAYS ON: while the game is seen and you moved or pressed something in the last ten minutes, the screen does not sleep (Screen Wake Lock).
import {SHARED} from './003-shx.js';
import {pos} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
{ const IDLE=6e5; let lock=null, asking=false, last=performance.now(), px=0, pz=0;
  const take=async()=>{ if(lock||asking||document.hidden)return; asking=true; try{ const l=await navigator.wakeLock.request('screen'); l.addEventListener('release',()=>{ if(lock===l)lock=null; }); lock=l; }catch(e){} asking=false; };
  const act=()=>{ last=performance.now(); take(); };
  SHARED.awake=()=>!!lock;
  if(navigator.wakeLock){ for(const k of ['pointerdown','keydown'])addEventListener(k,act,{passive:true,capture:true});
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&performance.now()-last<IDLE)take(); });
    SYS.every(()=>{ if(Math.hypot(pos.x-px,pos.z-pz)>TILE){ px=pos.x; pz=pos.z; act(); } else if(lock&&performance.now()-last>IDLE){ lock.release().catch(()=>{}); lock=null; } },30000,'162ad-awake'); SYS.onStart(take,'162ad-awake'); } }
