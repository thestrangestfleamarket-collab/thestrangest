// THE MINING TOOLS: the scanner and extractor as pack actions (they work underwater too), and the headlight that lights the caverns and deep water while you wear it.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FORAGE, INSPECT, ITEMS, LITE, ONLINE, pos} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS, TILE} from './006-map-pre.js';
import {GEMS} from './101-gems.js';
{ const T=TILE, say=(t,c)=>{ SAY(t,c); };
  FORAGE.add({names:{goggles:'DIVING GOGGLES',headlight:'HEADLIGHT',scanner:'RESONANCE SCANNER',cutter:'CUTTER BEAM',extractor:'SONIC EXTRACTOR',...Object.fromEntries(GEMS.filter(g=>!/^(m_|cut_)/.test(g[0])).map(g=>[g[0],g[1]]))}});
  const LOOKG={goggles:()=>INSPECT.shape('goggles',0x2a2a2e,0x9ad0e8),headlight:()=>INSPECT.shape('lamp',0xd8d8d0,0xfff2c0),armor:()=>INSPECT.shape('armor',0xa8acb4,0x8a8e96),cloudcoat:()=>INSPECT.shape('cloudcoat',0xf2f4fa),
    scanner:()=>INSPECT.shape('gadget',0x3a5a7a,0x9fd8ff),cutter:()=>INSPECT.shape('gadget',0x7a3a2a,0xff8a5a),extractor:()=>INSPECT.shape('gadget',0x4a4a5a,0xc8a0ff)};
  INSPECT.kinds.push({is:id=>!!LOOKG[id],make:id=>LOOKG[id]()});
  const TOOL={prospect:'SCAN',extract:'EXTRACT'}, grant=id=>ITEMS.prop(id,'grants');   // a pack action for any item that grants prospecting or extracting
  FORAGE.ROWB.push(id=>TOOL[grant(id)]?[[TOOL[grant(id)],'tool']]:[]);
  FORAGE.SEAMS=[];   // what a set piece hides for the tools: {scan, extract}, each returning how many it lit or freed
  FORAGE.ACT.tool=id=>{ '@later'; const g=grant(id), sum=k=>FORAGE.SEAMS.reduce((a,s)=>a+(s[k]&&s[k]()||0),0); if(g==='prospect'){ const n=sum('scan'); say(n?'THE SCANNER LIGHTS '+n+' SEAM'+(n>1?'S':'')+' FOR A MINUTE.':'THE SCANNER FINDS NOTHING MORE HERE.','#9fd8ff'); }
    else if(g==='extract'){ const n=sum('extract'); say(n?'THE PULSE FREES '+n+' FIND'+(n>1?'S':'')+'.':'NOTHING LIT IS NEAR ENOUGH.','#9fd8ff'); } };
  const L=new THREE.PointLight(0xfff0d0,0,9*T,1.6); L.userData.both=true; L.userData.grp=null; L.userData.i0=14; LITE.recs.push(L);   // the headlight: lit while worn (EQUIP's light grant) and underground
  // the other players' headlights: three more lights, given to the nearest players you can see who wear one
  const THEIRS=[0,1,2].map(()=>{ const l=new THREE.PointLight(0xfff0d0,0,9*T,1.6); l.userData.both=true; l.userData.grp=null; l.userData.i0=14; LITE.recs.push(l); return l; });
  const lit=o=>{ const id=EQUIP.decode?EQUIP.decode((o.look||'').split('.')[3]).head:null; return !!id&&EQUIP.ability(id)==='light'; };
  SYS.add('life',()=>{ L.position.set(pos.x+Math.sin(SHARED.heading)*.8*T,SHARED.py+1.5*T,pos.z+Math.cos(SHARED.heading)*.8*T); const on=EQUIP.lampOn(); L.intensity=EQUIP.light&&on?14:0;
    const C=on&&ONLINE.others&&ONLINE.others.size?[...ONLINE.others.values()].filter(o=>o.why==='near you'&&o.fig&&o.fig.g.visible&&lit(o)).sort((a,b)=>Math.hypot(a.p.x-pos.x,a.p.z-pos.z)-Math.hypot(b.p.x-pos.x,b.p.z-pos.z)):[];
    THEIRS.forEach((l,i)=>{ const o=C[i]; if(!o){ l.intensity=0; return; } const p=o.fig.g.position, h=o.fig.g.rotation.y; l.position.set(p.x+Math.sin(h)*.8*T,p.y+1.5*T,p.z+Math.cos(h)*.8*T); l.intensity=14; }); },'146d-gear');
  window.GEARDBG=()=>({light:EQUIP.light,sight:EQUIP.sight,head:L.intensity,theirs:THEIRS.map(l=>l.intensity)}); }
