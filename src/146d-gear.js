// THE MINING TOOLS: the scanner and extractor as pack actions (they work underwater too), and the headlight that lights the caverns while you wear it.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FORAGE, LITE, pos} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {MINING} from './146c-mining.js';
{ const T=TILE, say=(t,c)=>{ if(FORAGE.say)FORAGE.say(t,c); };
  FORAGE.add({names:{goggles:'DIVING GOGGLES',headlight:'HEADLIGHT',scanner:'RESONANCE SCANNER',cutter:'CUTTER BEAM',extractor:'SONIC EXTRACTOR'}});
  const TOOL={scanner:'SCAN',extractor:'EXTRACT'};
  FORAGE.ROWB.push(id=>TOOL[id]?[[TOOL[id],'tool']]:[]);
  FORAGE.ACT.tool=id=>{ '@later'; if(id==='scanner'){ const n=MINING.scan(); say(n?'THE SCANNER LIGHTS '+n+' SEAM'+(n>1?'S':'')+' FOR A MINUTE.':'THE SCANNER FINDS NOTHING MORE HERE.','#9fd8ff'); }
    else if(id==='extractor'){ const n=MINING.extract(); say(n?'THE PULSE FREES '+n+' FIND'+(n>1?'S':'')+'.':'NOTHING LIT IS NEAR ENOUGH.','#9fd8ff'); } };
  const L=new THREE.PointLight(0xfff0d0,0,9*T,1.6); L.userData.both=true; L.userData.grp=null; L.userData.i0=14; LITE.recs.push(L);   // the headlight: lit while worn (EQUIP's light grant) and underground
  SYS.add('life',()=>{ L.position.set(pos.x,SHARED.py+1.5*T,pos.z); L.intensity=EQUIP.light&&SHARED.LVL==='down'?14:0; },'146d-gear');
  window.GEARDBG=()=>({light:EQUIP.light,sight:EQUIP.sight,head:L.intensity}); }
