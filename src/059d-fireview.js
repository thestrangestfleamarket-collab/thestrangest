// YOUR FIRE ESCAPE: the view from your fire escape (its own builder; built when you climb out).
import {SHARED} from './003-shx.js';
import {grab, MODS, STORE} from './006-map-pre.js';
await grab('fire',async()=>{ const APTS=MODS.apts, K=STORE.kit, {X,Z}=SHARED.BOD, CX=1000, WY=-95, S=SHARED.BOD.K.STORY, lv=Math.min(APTS.my,APTS.floors-2), HZ=APTS.RZ+lv*S;
  const F=window.FIREV={CX,WY,S,HZ,lv,yaw:-Math.PI/4,span:3.3,shift:-3.2,name:'YOUR FIRE ESCAPE',built:false,lot:[CX-150,WY-130,CX+150,WY+150]};
  STORE.bound.x1=Math.max(STORE.bound.x1,X(CX+12));
  K.offmap(F.name,F.lot,()=>{ '@fire'; if(F.build)F.build(); });
  STORE.places.push(['YOUR APARTMENT',...APTS.spawn]);
});
