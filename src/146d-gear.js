// THE MINING TOOLS: the scanner and extractor as pack actions (they work underwater too), and the headlight that lights the caverns and deep water while you wear it.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FLOW, FORAGE, INSPECT, LITE, pos} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {MINING} from './146c-mining.js';
{ const T=TILE, say=(t,c)=>{ if(FORAGE.say)FORAGE.say(t,c); };
  FORAGE.add({names:{goggles:'DIVING GOGGLES',headlight:'HEADLIGHT',scanner:'RESONANCE SCANNER',cutter:'CUTTER BEAM',extractor:'SONIC EXTRACTOR'}});
  const LOOKG={goggles:()=>INSPECT.shape('goggles',0x2a2a2e,0x9ad0e8),headlight:()=>INSPECT.shape('lamp',0xd8d8d0,0xfff2c0),armor:()=>INSPECT.shape('plate',0xa8acb4,0x8a8e96),cloudcoat:()=>INSPECT.shape('coat',0xf2f4fa),
    scanner:()=>INSPECT.shape('gadget',0x3a5a7a,0x9fd8ff),cutter:()=>INSPECT.shape('gadget',0x7a3a2a,0xff8a5a),extractor:()=>INSPECT.shape('gadget',0x4a4a5a,0xc8a0ff)};
  INSPECT.kinds.push({is:id=>!!LOOKG[id],make:id=>LOOKG[id]()});
  const TOOL={scanner:'SCAN',extractor:'EXTRACT'};
  FORAGE.ROWB.push(id=>TOOL[id]?[[TOOL[id],'tool']]:[]);
  FORAGE.ACT.tool=id=>{ '@later'; if(id==='scanner'){ const n=MINING.scan(); say(n?'THE SCANNER LIGHTS '+n+' SEAM'+(n>1?'S':'')+' FOR A MINUTE.':'THE SCANNER FINDS NOTHING MORE HERE.','#9fd8ff'); }
    else if(id==='extractor'){ const n=MINING.extract(); say(n?'THE PULSE FREES '+n+' FIND'+(n>1?'S':'')+'.':'NOTHING LIT IS NEAR ENOUGH.','#9fd8ff'); } };
  const L=new THREE.PointLight(0xfff0d0,0,9*T,1.6); L.userData.both=true; L.userData.grp=null; L.userData.i0=14; LITE.recs.push(L);   // the headlight: lit while worn (EQUIP's light grant) and underground
  SYS.add('life',()=>{ L.position.set(pos.x,SHARED.py+1.5*T,pos.z); L.intensity=EQUIP.light&&(SHARED.LVL==='down'||FLOW.under)?14:0; },'146d-gear');
  window.GEARDBG=()=>({light:EQUIP.light,sight:EQUIP.sight,head:L.intensity}); }
