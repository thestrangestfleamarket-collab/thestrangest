// THE HORN'S WAY (owner, 12 Nov 2026): what a honk moves out of a vehicle's way. A honk is the SYS event 'honk' {x,z,dx,dz,by} (a traffic car held up, 150pb; a player's horn, 150pe; dx,dz its heading or null: all round it). You on foot step aside, a car left empty in the road goes back to where it parks, THE BIG CAT hurries his crossing, walkers go to the kerb, birds fly up.
import {SHARED, THREE} from './003-shx.js';
import {BIRDS, NPCS, ONLINE, pos, RIDE, ROOMS, st, USE, WALKS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {BIGCAT} from './111ei-bigcat.js';
import {TRAFFIC} from './150pb-traffic.js';
const HONK={n:0}; window.HONK=HONK;
{ const M0=TILE/.84;
  const inWay=(H,x,z,pad=0)=>{ const ax=x-H.x, az=z-H.z; if(H.dx==null)return Math.hypot(ax,az)<9*M0+pad; const f=ax*H.dx+az*H.dz, s=Math.abs(ax*H.dz-az*H.dx); return f>-M0&&f<30*M0+pad&&s<2.4*M0+pad; };
  const onRoad=(x,z)=>{ const R=TRAFFIC.road; return !!R&&x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1; };
  // where to stand clear: the nearer kerb on the road, else a few steps to the side of the car's way
  const aside=(H,x,z)=>{ const R=TRAFFIC.road; if(onRoad(x,z))return {x,z:z-R.z0<R.z1-z?R.z0-1.2*M0:R.z1+1.2*M0};
    if(H.dx==null){ const d=Math.hypot(x-H.x,z-H.z)||1; return {x:x+(x-H.x)/d*4*M0,z:z+(z-H.z)/d*4*M0}; } const s=(x-H.x)*H.dz-(z-H.z)*H.dx>=0?1:-1; return {x:x+s*H.dz*3.5*M0,z:z-s*H.dx*3.5*M0}; };
  HONK.inWay=inWay; HONK.aside=aside;
  SYS.add('honk',H=>{ if(!H||!isFinite(H.x)||!isFinite(H.z)||SHARED.LVL!=='up')return; HONK.n++; const me=ONLINE.me||'me', t=TRAINS.now?TRAINS.now():Date.now()/1000;
    // you, on foot in its way: you walk clear (a key takes the walk back)
    if(H.by!==me&&!RIDE.on&&!(MODS.cars&&MODS.cars.driving)&&!st.sit&&!USE.seat&&!ROOMS.cur&&inWay(H,pos.x,pos.z)){ const p=aside(H,pos.x,pos.z); SHARED.target=HONK.walk=new THREE.Vector3(p.x,SHARED.py,p.z); SAY('A HORN. YOU STEP OUT OF THE WAY.','#e8e2cc'); }
    // a car left empty in the road goes back to where it parks
    if(MODS.cars&&MODS.cars.cars)for(const C of MODS.cars.cars.values()){ if(C.by||!C.h0||!C.mesh||!onRoad(C.x,C.z)||onRoad(C.h0[0],C.h0[1])||!inWay(H,C.x,C.z,2*M0))continue; ONLINE.put('car:'+C.id,C.h0.join(',')); }
    // THE BIG CAT crossing hurries
    { const c=BIGCAT.road&&BIGCAT.road(); if(c&&inWay(H,c.x,c.z,3*M0)&&t-(+((ONLINE.world||{})['honk:cat'])||0)>60)ONLINE.put('honk:cat',String(Math.round(t*10)/10)); }
    // walkers go to the kerb, birds on the ground fly up
    for(const N of NPCS){ const s=N.st; if(!s||!s.folk||!N.g||!N.g.visible||t-(N.hkT||-99)<8||!inWay(H,s.x,s.z))continue; N.hkT=t; WALKS.errand(N,aside(H,s.x,s.z)); }
    if(BIRDS.list&&BIRDS.flush)for(const b of BIRDS.list)if(b.st==='ground'&&inWay(H,b.x,b.z,M0))BIRDS.flush(b); },'150pf-honk');
  // the walk a honk started ends when you get in or onto something
  SYS.add('life',()=>{ const w=HONK.walk; if(!w)return; if(SHARED.target!==w){ HONK.walk=null; return; } if(RIDE.on||(MODS.cars&&MODS.cars.driving)||st.sit||ROOMS.cur){ SHARED.target=HONK.walk=null; } },'150pf-honk');
}
