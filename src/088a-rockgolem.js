// THE ROCK GOLEM: the gem merchant (owner, 10 Nov 2026), a stone golem half again the size of the dungeon's, keeping the Gem Stall at the park wall; buys gems, sells the headlight and teaches GEMS (data/characters.json rock_golem).
import {SHOPS} from './003b-systems.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {stfree, STLANE} from './076-npc-map.js';
import {PSTALLS} from './081a-parkstalls.js';
{ const T=TILE, H0=1.35, K=1.5;
  const make=()=>{ const s=(PSTALLS.list||[]).find(s=>s.key==='rock_golem'); if(!s||!MODS.pawnNew)return setTimeout(make,1000);
    const h=s.S.home, N=MODS.pawnNew('hero_m','rock_golem',{copy:1,npc:{name:'THE ROCK GOLEM',metres:H0*K,lv:'up',group:'bodega',lane:STLANE,free:stfree,ground:(x,z)=>MODS.bodega.ground(x,z),roam:false,dun:false,x:h.x,z:h.z,radius:.45,speed:.35}});
    if(!N)return setTimeout(make,1000);
    const st=N.st; st.home={x:h.x,z:h.z,r:0,id:'rock_golem'}; st.x=h.x; st.z=h.z; st.to=st.next=null; st.hold=true; st.face=s.S.face; s.at=true;
    if(SHOPS.sync)SHOPS.sync(); window.ROCKGOLEMDBG=()=>({x:+st.x.toFixed(2),z:+st.z.toFixed(2),H:+(N.H/T).toFixed(2),vis:N.g.visible,lv:N.lv}); };
  SYS.onStart(make,'088a-rockgolem'); }
