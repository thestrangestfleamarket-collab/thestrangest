// THE WORN LAYER: EQUIP wears body gear (armour, the cloud coat) and turns on its granted ability — guard softens blows, float lifts you off the ground. Hand gear stays with WIELD; both read the shared item model (slot, grants).
import {EQUIP, FORAGE, ITEMS, VIT} from './003b-systems.js';
Object.assign(EQUIP,{worn:null,float:false}); window.EQUIP=EQUIP;
{ const say=FORAGE.say, prop=(id,k)=>window.ITEMS&&ITEMS.prop?ITEMS.prop(id,k):undefined, name=id=>(FORAGE.NM&&FORAGE.NM[id])||id;
  FORAGE.add({names:{armor:'ARMOUR',cloudcoat:'CLOUD COAT'},prices:{armor:40,cloudcoat:60}});
  // one grant -> one effect, resolved the same way for every body item (a property is schema-wide, not special-cased per item)
  const ABIL={ guard:{on:()=>VIT.def=.5, off:()=>VIT.def=0}, float:{on:()=>EQUIP.float=true, off:()=>EQUIP.float=false} };
  EQUIP.ability=id=>prop(id,'grants');
  EQUIP.off=()=>{ if(!EQUIP.worn)return; const a=ABIL[EQUIP.ability(EQUIP.worn)]; if(a)a.off(); EQUIP.worn=null; };
  EQUIP.wear=id=>{ if(prop(id,'slot')!=='body')return;
    if(EQUIP.worn===id){ EQUIP.off(); say('YOU TAKE OFF THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); return; }
    if(!FORAGE.has(id)){ say('YOU HAVE NO '+name(id)+'.','#c8a090'); return; }
    EQUIP.off(); EQUIP.worn=id; const a=ABIL[EQUIP.ability(id)]; if(a)a.on(); say('YOU WEAR THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); };
  FORAGE.ROWB.push(id=>prop(id,'slot')==='body'?[[EQUIP.worn===id?'TAKE OFF':'WEAR','equip']]:[]);
  FORAGE.ACT.equip=id=>EQUIP.wear(id); }
