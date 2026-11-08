// THE PARK WALL'S STALLS (owner, 8 Nov 2026): the butterfly, bee, bird and gem merchants each keep a table of their goods against the park wall, beside the mushroom and vegetable stalls (data/world.json parkPlaces.stalls); each keeper stands at the table and sells as a shopkeeper does.
import {SHARED} from './003-shx.js';
import {NPCS, PARK} from './003b-systems.js';
import {LEVEL, MODS, SYS, TILE} from './006-map-pre.js';
import {STALL} from './081-stalls.js';
const PSTALLS={list:[]};
{ const L=(LEVEL.parkPlaces&&LEVEL.parkPlaces.stalls||[]).filter(s=>s.goods);
  const go=()=>{ if(!MODS.park)return setTimeout(go,500); const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0));
    L.forEach((d,i)=>{ const A=STALL.at(d.id), S=STALL.build({X,Z,x0:A.x0,x1:A.x1,y:P.y0,goods:d.goods,seed:21+i*13,gate:A.gate,name:d.name}); PSTALLS.list.push({id:d.id,S,key:d.merchant});
      if(d.merchant&&LEVEL.homes)LEVEL.homes[d.merchant]=[S.home.x/TILE-SHARED.BOD.XS(0)/TILE,(S.home.z-SHARED.BOD.ZS(0))/(SHARED.BOD.ZS(1)-SHARED.BOD.ZS(0)),0,null]; });
    // a keeper already about is sent to its table; one made later finds its home there
    let n=0; const keep=()=>{ let left=0; for(const s of PSTALLS.list){ if(s.at||!s.key)continue; const N=NPCS.find(q=>q.key===s.key); if(!N||!N.st){ left++; continue; }
        const st=N.st; st.home={x:s.S.home.x,z:s.S.home.z,r:0,id:s.key}; st.x=s.S.home.x; st.z=s.S.home.z; st.to=st.next=null; st.hold=true; st.face=s.S.face; s.at=true; }
      if(left&&n++<60)setTimeout(keep,2000); }; keep(); };
  SYS.onStart(go,'081a-parkstalls'); }
window.PSTALLS=PSTALLS;
