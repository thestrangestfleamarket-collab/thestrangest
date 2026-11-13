// THE BAR'S DRINKS: what the badger pours (items.json: edible) and what each does (the bar's old fittings are archived; the lounge, 146zca, is its room).
import {FORAGE, VIT} from './003b-systems.js';
{ // the drinks the badger pours (items.json: edible), what each does
  FORAGE.add({names:{d_ale:'A PINT OF ALE',d_stout:'A PINT OF STOUT',d_cola:'A GLASS OF COLA'},does:{d_ale:()=>{ VIT.sta=1; },d_stout:()=>{ VIT.sta=1; VIT.heal(.1); },d_cola:()=>{ VIT.sta=Math.min(1,VIT.sta+.5); }}});
}
