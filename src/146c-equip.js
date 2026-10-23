// THE WORN LAYER: EQUIP wears gear by slot (body: armour, the cloud coat; head: the headlight; eyes: the goggles) and turns on its granted ability — guard softens blows, float lifts you, light lights the dark, sight sees through murk. Hand gear stays with WIELD; all read the shared item model (slot, grants).
import {EQUIP, FORAGE, ITEMS, VIT} from './003b-systems.js';
import {OWNED} from './005-save.js';
Object.assign(EQUIP,{by:{},float:false,light:false,sight:false}); window.EQUIP=EQUIP; Object.defineProperty(EQUIP,'worn',{get:()=>EQUIP.by.body||null});
{ const say=FORAGE.say, prop=(id,k)=>window.ITEMS&&ITEMS.prop?ITEMS.prop(id,k):undefined, name=id=>(FORAGE.NM&&FORAGE.NM[id])||id, SLOTS=['body','head','eyes'];
  FORAGE.add({names:{armor:'ARMOUR',cloudcoat:'CLOUD COAT'},prices:{armor:40,cloudcoat:60}});
  // one grant -> one effect, resolved the same way for every worn item (a property is schema-wide, not special-cased per item)
  const ABIL={ guard:{on:()=>VIT.def=.5, off:()=>VIT.def=0}, float:{on:()=>EQUIP.float=true, off:()=>EQUIP.float=false}, light:{on:()=>EQUIP.light=true, off:()=>EQUIP.light=false}, sight:{on:()=>EQUIP.sight=true, off:()=>EQUIP.sight=false} };
  const save=()=>{ try{ OWNED.set('equip',JSON.stringify(EQUIP.by)); }catch(e){} };
  EQUIP.ability=id=>prop(id,'grants');
  EQUIP.off=(slot='body')=>{ const id=EQUIP.by[slot]; if(!id)return; const a=ABIL[EQUIP.ability(id)]; if(a)a.off(); delete EQUIP.by[slot]; };
  EQUIP.wear=(id,quiet)=>{ const slot=prop(id,'slot'); if(!SLOTS.includes(slot))return;
    if(EQUIP.by[slot]===id){ EQUIP.off(slot); save(); if(!quiet)say('YOU TAKE OFF THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); return; }
    if(!FORAGE.has(id)){ if(!quiet)say('YOU HAVE NO '+name(id)+'.','#c8a090'); return; }
    EQUIP.off(slot); EQUIP.by[slot]=id; const a=ABIL[EQUIP.ability(id)]; if(a)a.on(); save(); if(!quiet)say('YOU WEAR THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); };
  FORAGE.ROWB.push(id=>SLOTS.includes(prop(id,'slot'))?[[EQUIP.by[prop(id,'slot')]===id?'TAKE OFF':'WEAR','equip']]:[]);
  FORAGE.ACT.equip=id=>EQUIP.wear(id);
  try{ const W=JSON.parse(OWNED.get('equip')||'{}')||{}; for(const s in W)if(W[s]&&FORAGE.has(W[s]))EQUIP.wear(W[s],true); }catch(e){}   // what you wore stays on between visits
}
