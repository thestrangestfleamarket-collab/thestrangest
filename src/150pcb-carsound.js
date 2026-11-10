// THE CARS' ENGINES: the car you drive, other players' cars and the traffic near you each hum a recorded engine, higher and louder the faster they go (CARLAMPS.src lists what drives).
import {SHARED, THREE} from './003-shx.js';
import {CARLAMPS, ONLINE, pos, RIDE, ROOMS, SFX} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
{ const M=TILE/.84, VMAX=20*M, FAR=30*TILE, N=4, V=[], list=[], last=new Map(), AT={x:0,y:0,z:0}; let tk=0;
  const quiet=()=>{ for(const v of V)v.stop(); V.length=0; };
  SYS.add('life',dt=>{ if((tk-=dt||0)>0)return; tk=.1; const c=SFX.live();
    if(!c||!SFX.on||SHARED.LVL!=='up'||ROOMS.cur||(ROOMS.offIn&&ROOMS.offIn())){ if(V.length)quiet(); return; }
    list.length=0; for(const f of CARLAMPS.src)try{ f(list); }catch(e){}
    if(ONLINE.others)for(const [pid,o] of ONLINE.others){ const R=RIDE.their(pid); if(!R||!R.id||!R.id.startsWith('car:')||!o.p)continue;
      const l=last.get(pid), t=performance.now()/1000, sp=l&&t>l.t?Math.hypot(o.p.x-l.x,o.p.z-l.z)/(t-l.t):0; last.set(pid,{x:o.p.x,z:o.p.z,t,sp:l?l.sp*.6+sp*.4:0}); list.push({x:o.p.x,z:o.p.z,sp:last.get(pid).sp}); }
    const near=list.filter(e=>!e.fly).map(e=>(e.d=e.me?0:Math.hypot(e.x-pos.x,e.z-pos.z),e)).filter(e=>e.d<FAR).sort((a,b)=>a.d-b.d).slice(0,N);
    while(V.length>near.length)V.pop().stop();
    for(let i=0;i<near.length;i++){ const e=near[i]; if(!V[i]){ const v=SFX.voice('car_engine'); if(!v)break; V[i]=v; }
      const s=Math.min(1,Math.max(0,e.sp)/VMAX), k=e.me?1:Math.pow(1-e.d/FAR,2);
      AT.x=e.x; AT.z=e.z; AT.y=e.y!=null?e.y+TILE*.6:SHARED.py+TILE*.6;
      V[i].set((e.me?.32:.45)*k*(.55+.45*s),.75+.85*s,e.me?null:{...AT}); } },'150pcb-carsound');
  window.CARSND={voices:()=>V.length};
}
