// THE GEAR: GEAR keeps what you wear and carry for the caverns (goggles, headlight, the mining tools, sold by THE SHARK) and the headlight that follows you underground.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, LITE, pos} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {MINING} from './146c-mining.js';
const GEAR={worn:{}}; window.GEAR=GEAR; MODS.gear=GEAR;
{ const T=TILE; try{ GEAR.worn=JSON.parse(OWNED.get('gear')||'{}')||{}; }catch(e){}
  const save=()=>{ try{ OWNED.set('gear',JSON.stringify(GEAR.worn)); }catch(e){} }, say=(t,c)=>{ if(FORAGE.say)FORAGE.say(t,c); };
  FORAGE.add({names:{goggles:'DIVING GOGGLES',headlight:'HEADLIGHT',scanner:'RESONANCE SCANNER',cutter:'CUTTER BEAM',extractor:'SONIC EXTRACTOR'}});
  GEAR.on=id=>!!GEAR.worn[id]&&FORAGE.has(id);
  const WEAR=['goggles','headlight'], TOOL={scanner:'SCAN',extractor:'EXTRACT'};
  FORAGE.ROWB.push(id=>WEAR.includes(id)?[[GEAR.on(id)?'TAKE OFF':'WEAR','gear']]:TOOL[id]?[[TOOL[id],'gear']]:[]);
  FORAGE.ACT.gear=id=>{ if(WEAR.includes(id)){ GEAR.worn[id]=!GEAR.worn[id]; save(); say(GEAR.worn[id]?'YOU PUT ON THE '+FORAGE.NM[id]+'.':'YOU TAKE OFF THE '+FORAGE.NM[id]+'.'); }
    else if(id==='scanner'){ const n=MINING.scan(); say(n?'THE SCANNER LIGHTS '+n+' SEAM'+(n>1?'S':'')+' FOR A MINUTE.':'THE SCANNER FINDS NOTHING MORE HERE.','#9fd8ff'); }
    else if(id==='extractor'){ const n=MINING.extract(); say(n?'THE PULSE FREES '+n+' FIND'+(n>1?'S':'')+'.':'NOTHING LIT IS NEAR ENOUGH.','#9fd8ff'); } };
  const L=new THREE.PointLight(0xfff0d0,0,9*T,1.6); L.userData.both=true; L.userData.grp=null; L.userData.i0=14; LITE.recs.push(L);   // the headlight: lit only when worn and underground
  SYS.add('life',()=>{ L.position.set(pos.x,SHARED.py+1.5*T,pos.z); L.intensity=GEAR.on('headlight')&&SHARED.LVL==='down'?14:0; },'146d-gear');
  window.GEARDBG=()=>({worn:GEAR.worn,head:L.intensity}); }
