// WORTH: WORTH.of is the one price path every shop and trainer pays through (a thing's value times how many, or the unit you give, and up to half again for the skill that knows it: WORTH.KNOW, a goods group to its skill); nothing decays and nothing wears (owner, 5 Nov 2026: "closer to ultima online rules. food doesnt decay, fishing poles dont wear out").
import {FORAGE, ITEMS} from './003b-systems.js';
const WORTH={};
{ WORTH.KNOW={mushrooms:'myco',gems:'gem',flowers:'garden',veg:'garden',fish:'fish',butterflies:'ento',birds:'bird',honey:'bee',slime:'fight',swords:'sword',photos:'photo'};
  WORTH.know=id=>{ const B=FORAGE.BUYK||{}; for(const g in WORTH.KNOW)if((B[g]||[]).some(p=>id.startsWith(p)))return 1+(FORAGE.sk?FORAGE.sk(WORTH.KNOW[g]):0)/200; return 1; };
  WORTH.of=(id,n,unit)=>Math.round((unit??(+ITEMS.prop(id,'value')||0))*n*WORTH.know(id)); window.WORTH=WORTH; }
export {WORTH};
