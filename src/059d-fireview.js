// YOUR FIRE ESCAPE: the view from your fire escape (an off-map lot; built when you climb out, in the fire chunk).
import {SHARED} from './003-shx.js';
import {BLDK, MODS, OFFDX, STORE} from './006-map-pre.js';
{ const APTS=MODS.apts, K=STORE.kit, {X,Z}=SHARED.BOD, CX=1000+OFFDX/BLDK, WY=-95, S=APTS.S, lv=Math.min(APTS.my,APTS.floors-2), HZ=APTS.RB;
  const F=window.FIREV=MODS.firev={CX,WY,S,HZ,lv,yaw:-Math.PI/4,span:3.3,shift:-3.2,name:'YOUR FIRE ESCAPE',built:false,lot:[CX-150,WY-130,CX+150,WY+150]};
  STORE.bound.x1=Math.max(STORE.bound.x1,X(CX+12));
  K.offmap(F.name,F.lot,()=>{ '@fire'; if(F.build)F.build(); });
  STORE.places.push(['YOUR APARTMENT',...APTS.spawn]);
}
