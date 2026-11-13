// THE POCKETS (owner, 11 Nov 2026, Stardew's pack that grows): the bag holds 60 kinds of thing (a stack is one; what sits in a pouch or a chest counts as the pouch), 80 with a LARGE PACK, 100 with a DELUXE PACK (24, 36, 48 were picked; a new player starts with 49 kinds) (the bodega's clerk sells both); full, a new kind will not go in (buying, picking up) until you make room; the owners carry everything. INV.room / INV.full are the checks every way in asks.
import {ARCHI, BAG, CINEMA, FORAGE, INV, ITEMS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
const POCKETS={BASE:60,PACKS:[['pack_deluxe',100],['pack_large',80]]};
{ FORAGE.add({names:{pack_large:'A LARGE PACK (80 KINDS)',pack_deluxe:'A DELUXE PACK (100 KINDS)'},prices:{pack_large:40,pack_deluxe:120}});
  ITEMS.reg('pack_large',{value:40,sellable:true,group:'wear'}); ITEMS.reg('pack_deluxe',{value:120,sellable:true,group:'wear'});
  let own=false; SYS.add('hi',()=>{ if(CINEMA.isAdmin)CINEMA.isAdmin().then(o=>{ own=!!o; }).catch(()=>{}); },'162ef-pockets owner');
  POCKETS.cap=()=>{ for(const [id,n] of POCKETS.PACKS)if(INV.items[id]>0)return n; return POCKETS.BASE; };
  const inside=id=>{ let n=0; for(const c in INV.inside||{})n+=(INV.inside[c]||{})[id]||0; return n; };
  POCKETS.kinds=()=>Object.keys(INV.items).filter(id=>INV.items[id]>0&&id!=='x'&&!ARCHI(id)&&INV.items[id]>inside(id)).length;
  POCKETS.owner=()=>own;
  INV.room=id=>own||!id||INV.items[id]>inside(id)||POCKETS.kinds()<POCKETS.cap();
  let lastSay=0; INV.full=()=>{ const t=performance.now(); if(t-lastSay>2500){ lastSay=t; SAY(`YOUR BAG IS FULL: ${POCKETS.cap()} KINDS OF THING. DROP OR STORE SOMETHING, OR THE BODEGA SELLS A BIGGER PACK.`,'#c8a090'); } return false; };
  POCKETS.line=()=>own?'':` · ${POCKETS.kinds()} / ${POCKETS.cap()} KINDS`;
  BAG.room=POCKETS.line;
  window.POCKETS=POCKETS; }
