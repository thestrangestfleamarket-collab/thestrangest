// ---- ONE ON THE STAGE AT A TIME (owner, 17 Oct 2026: "only 1 musician on stage at once"): the stored bar's four take turns, a set each (three
// minutes; ?set=seconds for a test), in turn: the pianist, the singer, the octopus drummer (the guitarist, once first of them, plays in his apartment now). The one whose set it is drawn, run and
// heard; the others off the stage: not drawn, not run, silent (their sound let fall to nothing). Each comes on from the start of a piece. The
// clock runs while you're near the stage (as near as they play), so a set is heard whole. The piano and the kit stay on the stage ----
const STAGE={}; STORE.STAGE=STAGE;   // (the guitarist no longer takes a turn: he plays in his apartment, musician.js)   // (a test's reach: STAGE.go('pn'), STAGE.who())
{ const ALL=[['pn',PNM],['sg',SGM],['dr',DRM]], SET=Math.max(5,+(QS.get('set')||180)); let i=0, t=0;
  STAGE.go=k=>{ i=typeof k==='number'?k:Math.max(0,ALL.findIndex(a=>a[0]===k)); t=0;
    ALL.forEach(([,X],j)=>{ const on=j===i; if(X.on===on)return; X.on=on; X.g.visible=on; if(!on)X._rh=false; const f=on?X.start:X.stop; if(f)f(); }); };   // (_rh: rooms.js hid him while you were out of the room; off the stage he stays hidden)
  STAGE.next=()=>STAGE.go((i+1)%ALL.length); STAGE.who=()=>ALL[i][0]; STAGE.left=()=>SET-t;
  STAGE.heard=()=>{ const v=n=>n?+n.gain.value.toFixed(3):null, K=IMX.nodes.get('bar|drum kit'); return {gtr:v(GTA.g),pn:v(PNA.g),sg:v(VOX.out),dr:v(K&&K.g),shown:ALL.filter(a=>a[1].g.visible).map(a=>a[0]).concat(MUS.g.visible?['gtr']:[])}; };   // (a test's: each one's loudness now, and who's drawn)
  STAGE.tick=dt=>{ const A=PNM.at; if(!MAPG.bodega.visible||Math.hypot(pos.x-A.x,pos.z-A.z)>18)return; t+=dt; if(t>=SET)STAGE.next(); };
  for(const [,X] of ALL)NPCS.extra.push(X); STAGE.go(0);
  MUS.on=true; MUS.g.visible=true; MUS.start(); NPCS.extra.push(MUS); }   // (the guitarist: not on the bar's roster since 17 Oct 2026, owner: "move the musician into an apartment top floor"; always on, up there: musician.js)
