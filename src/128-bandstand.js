// THE BANDSTAND: STAGE takes turns between the pianist, the singer and the drummer at the bar.
import {DRM, MUS, NPCS, PNM, pos, SGM, STAGE} from './003b-systems.js';
import {AWAY, MAPG, QS, STORE} from './006-map-pre.js';
import {GTA} from './106-game-play-3-guitar-1-body.js';
import {PNA} from './114-game-play-5-piano-1-sound.js';
import {IMX} from './119-game-music-1-engine.js';
import {VOX} from './123-game-zzz-bar-singer.js';
 STORE.STAGE=STAGE;
STAGE.tick=()=>{}; STAGE.who=()=>null;
STAGE.make=()=>{ if(!STORE.bar)return; const ALL=[['pn',PNM],['sg',SGM],['dr',DRM]], SET=Math.max(5,+(QS.get('set')||180)); let i=0, t=0;
  STAGE.go=k=>{ i=typeof k==='number'?k:Math.max(0,ALL.findIndex(a=>a[0]===k)); t=0;
    ALL.forEach(([,X],j)=>{ const on=j===i; if(X.on===on)return; X.on=on; X.g.visible=on; if(!on)X._rh=false; const f=on?X.start:X.stop; if(f)f(); }); };
  STAGE.next=()=>STAGE.go((i+1)%ALL.length); STAGE.who=()=>ALL[i][0]; STAGE.left=()=>SET-t;
  STAGE.heard=()=>{ const v=n=>n?+n.gain.value.toFixed(3):null, K=IMX.nodes.get('bar|drum kit'); return {gtr:v(GTA.g),pn:v(PNA.g),sg:v(VOX.out),dr:v(K&&K.g),shown:ALL.filter(a=>a[1].g.visible).map(a=>a[0]).concat(MUS.g&&MUS.g.visible?['gtr']:[])}; };
  STAGE.tick=dt=>{ const A=PNM.at; if(!MAPG.bodega.visible||Math.hypot(pos.x-A.x,pos.z-A.z)>18)return; t+=dt; if(t>=SET)STAGE.next(); };
  for(const [,X] of ALL)NPCS.extra.push(X); STAGE.go(0); };
if(!AWAY.has('bar'))STORE.kit.STEPS.push(PNM.make,SGM.make,DRM.make,STAGE.make);
if(MUS.g){ MUS.on=true; MUS.g.visible=true; MUS.start(); NPCS.extra.push(MUS); }
