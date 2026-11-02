// THE BANDSTAND: STAGE runs the bar's acts in turn (the octopus drummer is the only one, owner 30 Oct 2026); they play silently.
import {DRM, MUS, NPCS, pos, STAGE} from './003b-systems.js';
import {AWAY, MAPG, QS, STORE} from './006-map-pre.js';
 STORE.STAGE=STAGE;
STAGE.tick=()=>{}; STAGE.who=()=>null;
STAGE.make=()=>{ if(!STORE.bar)return; const ALL=[['dr',DRM]], SET=Math.max(5,+(QS.get('set')||180)); let i=0, t=0;   // the octopus drummer is the bar's only act (owner, 30 Oct 2026)
  STAGE.go=k=>{ i=typeof k==='number'?k:Math.max(0,ALL.findIndex(a=>a[0]===k)); t=0;
    ALL.forEach(([,X],j)=>{ const on=j===i; if(X.on===on)return; X.on=on; X.g.visible=on; if(!on)X._rh=false; const f=on?X.start:X.stop; if(f)f(); }); };
  STAGE.next=()=>STAGE.go((i+1)%ALL.length); STAGE.who=()=>ALL[i][0]; STAGE.left=()=>SET-t;
  STAGE.heard=()=>({shown:ALL.filter(a=>a[1].g.visible).map(a=>a[0]).concat(MUS.g&&MUS.g.visible?['gtr']:[])});
  STAGE.tick=dt=>{ const A=DRM.at; if(!A||!MAPG.bodega.visible||Math.hypot(pos.x-A.x,pos.z-A.z)>18)return; t+=dt; if(t>=SET)STAGE.next(); };
  for(const [,X] of ALL)NPCS.extra.push(X); STAGE.go('dr'); };
if(!AWAY.has('bar'))STORE.kit.STEPS.push(DRM.make,STAGE.make);
if(MUS.g){ MUS.on=true; MUS.g.visible=true; MUS.start(); NPCS.extra.push(MUS); }
