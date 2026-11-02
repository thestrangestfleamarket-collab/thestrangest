// YOUR PLANTS: the watching cactus, the little cactus and the bonsai from the Market St plant stall (146v) are things for your apartment (DECORATE shows them as YOURS). The watching cactus's eye follows you round the room; the bonsai grows a little each real day you water it (a click), up to full size.
import {THREE} from './003-shx.js';
import {FORAGE} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {PLANTS} from './146v-plants.js';
import {ROOMK} from './150a-bedroom.js';
{ const say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc'), DAY=()=>Math.floor(Date.now()/864e5), STEP=.1;
  let S={}; try{ S=JSON.parse(OWNED.get('bonsai')||'{}')||{}; }catch(e){ S={}; } const save=()=>{ try{ OWNED.set('bonsai',JSON.stringify(S)); }catch(e){} };
  const K={cactus_eye:{name:'WATCHING CACTUS',make:()=>PLANTS.cactus(1),wire:'eye',sol:.16},cactus:{name:'LITTLE CACTUS',make:()=>PLANTS.cactus(.7,false),wire:null,sol:.12},bonsai:{name:'BONSAI',make:()=>{ const g=new THREE.Group(); g.name='bonsaiRoot'; g.add(PLANTS.bonsai(0)); return g; },wire:'bonsai',sol:.2}};
  ROOMK.parts.push(ctx=>{ const {R}=ctx; for(const id in K){ const k='pl:'+id; if(R.kinds[k])continue; const P=K[id], D={kind:k,name:P.name,own:id,loose:false,m:0,wire:P.wire,sol:[[-P.sol,-P.sol,P.sol,P.sol,.4]],shf:[],dept:'garden',deptName:'GARDEN'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=P.make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; } });
  const EYES=new Set();
  ROOMK.wires.eye=(un,c)=>{ const E=un.obj.getObjectByName('cactusEye'); if(!E)return; EYES.add({E,un,seed:Math.random()*9});
    c.hit(un,()=>'THE WATCHING CACTUS',()=>say('IT HAS BEEN WATCHING. IT ALWAYS IS.','#9ad8a0')); };
  // a bonsai's age: STEP more for each real day it was watered
  const age=id=>{ const s=S[id]||(S[id]={age:0,wet:-1}); return s; };
  const grow=(un,s)=>{ const r=un.obj.getObjectByName('bonsaiRoot')||un.obj; r.clear(); r.add(PLANTS.bonsai(Math.min(1,s.age))); };
  ROOMK.wires.bonsai=(un,c)=>{ const id=String(un.id), s=age(id); grow(un,s);
    const name=()=>'BONSAI: '+(s.age>=1?'FULL GROWN':Math.round(s.age*100)+'% GROWN')+(s.wet===DAY()?' · WATERED TODAY':' · THIRSTY');
    c.hit(un,name,()=>{ if(s.wet===DAY())return say('IT HAS HAD ITS WATER TODAY. PATIENCE.'); s.wet=DAY(); if(s.age<1)s.age=Math.min(1,+(s.age+STEP).toFixed(2)); save(); grow(un,s); say(s.age>=1?'YOU WATER IT. IT IS AS BIG AS IT WILL GET.':'YOU WATER IT. IT GROWS A LITTLE.','#9fd8a0');  }); };
  SYS.add('life',dt=>{ if(!EYES.size)return; const t=performance.now()/1000; for(const L of EYES){ if(!L.E.parent||L.un.gone||!L.un.obj.parent){ EYES.delete(L); continue; } PLANTS.look(L.E,dt||0,t,L.seed); } },'150i-plants');
  window.BONSAIDBG=()=>S;
}
