// ---- THE PIANIST (owner, 17 Oct 2026, the bar "with all musicians"): the game's own pianist, brought over whole (its files read by build.py
// from the game: 47-play-5-piano-1-sound, -samples.data, -2-music, -3-hands): the Walker's own pieces in a tuxedo (the jacket black, the white
// shirt front between satin lapels, its studs, the bow tie, white cuffs), the bench and the 88 keys as pieces of his (each key its own frame,
// turned down under his finger), his book of pieces (Bach's Prelude in C, Für Elise, the first Gymnopédie, note for note), his fingers onto
// their keys as the score's fingering says, his right foot on the pedal, the real grand's recordings (the Salamander Grand, each key the
// nearest note tuned to its pitch, as loud and bright as it's struck). Here a third Walker with his fingers, in 3D (the player's own body,
// built as the musician is: figureMesh, musician.js), in the tuxedo's own colours, seated at the stored bar's grand (store.js: STORE.bar.piano)
// facing the room, lit by the lamps; heard louder as you come near, from his side; plays while you're near and it's his turn (bandstand.js) ----
const PNM={}; STORE.PNM=PNM;   // (a test's reach)
if(STORE.bar){ const R=RIG, V=R.V, S=STORE.bar, AT={x:BOD.X(S.piano.x),z:BOD.Z(S.piano.keys-PK.Z/33.9),hd:0,y:BOD.Y(S.stage.z)};   // (at the keys: their fronts PK.Z of his units before him; on the stage)
  // the tuxedo's stuff, the bench's and the keys': materials of their own, added to the rig's list and the Walker's ramps (four tones each)
  const ADD={tux:['#3a3a40','#2c2c31','#1d1d21','#111114'],linen:['#f4f2ea','#e6e3da','#c9c6bc','#8a887f'],tie:['#26262a','#1c1c20','#121214','#0a0a0c'],vest:['#4a4a52','#3a3a42','#28282e','#161619'],
    wood:['#6a4a30','#573a24','#3f2a19','#261810'],cover:['#2e2a2a','#232020','#181616','#0e0d0d'],paper:['#f6f1e2','#e9e3d2','#cfc9b8','#8f8a7c'],hole:['#2a2a2c','#1c1c1e','#111112','#070708'],gold:['#d9b24a','#c49a38','#946f22','#5a4212']};
  for(const m in ADD)if(!R.MATS.includes(m)){ R.MATS.push(m); W3.ramp.push(ADD[m].map(h=>new THREE.Color(h))); }
  // his pieces: the player's own (musBody: his shapes and his build, the fingers a piece a bone; owner, 17 Oct 2026, "reset all npcs to same
  // exact avatar as main player"), in the resting pose, dressed by the game's PNPIECES as the game dressed them (the tuxedo's paint, the bench,
  // the keys; the grand's case for the game's close-up left out: the grand here is the world's), his shirt and trousers the tuxedo's black
  const body=musBody(), base=body.PCS, PCS=PNPIECES(body.J,base).filter(p=>!/^pn(Case|Desk|Bed|Legs)$/.test(p.n)), MI=n=>R.MATS.indexOf(n), SH=MI('shirt'), PA=MI('pants'), SO=MI('shoes'), TUX=MI('tux'), TIE=MI('tie');
  for(const p of PCS){ if(!base.includes(p))delete p.share;   // (repainted for the tuxedo: his own, made here)
    p.recol=m=>m===SH||m===PA?TUX:m===SO?TIE:undefined;
    if(/^pk\d/.test(p.n)){ const b=pnBlack(+p.n.slice(2)); p.box=b?[0,-.6,-PK.LB/2,.205,.6,PK.LB/2]:[0,-.5,-PK.LW/2,.32,.5,PK.LW/2]; }   // (each key the box its shape is: 12 triangles, not some 1,270)
    if(p.on==='prop')p.F0=/^pk\d/.test(p.n)?PNKF[+p.n.slice(2)]:PKBENCH; }   // (a key's rest frame, the bench's: its own, as the guitar's is; moved each frame by pnKeys)
  for(const P of PCS)if(!P.box&&!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'pnm'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); PNM.g=g; PNM.at=AT; PNM.tris=FM.tris; PNM.per=FM.per;
  AT.z=BOD.Z(S.piano.keys-PK.Z*W3.SZ/33.9); g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); musScale(g);   // (the player's size: the keys' fronts that much further before him)
  // HIS PLAYING, each frame you're near (the game's pnStep, here): the piece's clock, his pose from it (his hands over the keys, each finger
  // onto its key, his foot on the pedal), his arms and fingers with weight, a breath; the keys down under his fingers; the sound a moment
  // ahead; at a piece's end a moment's rest, then the next of the book
  pnSet(0); const a={t:0}; let rest=0; PNM.start=()=>{ rest=0; pnStop(); pnSet((PNS.song+1)%PNBOOK.length); }; PNM.stop=()=>pnHush();   // (his turn on the stage: the next piece from its start; off it, silent)
  PNM.tick=dt=>{ const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!PNM.on||!MAPG.bodega.visible||d>18){ pnHush(); return; }
    if(PNS.c&&PNS.t>PNS.c.len+1.5){ rest+=dt; if(rest>1.5){ rest=0; pnStop(); pnSet((PNS.song+1)%PNBOOK.length); } }
    R.farOnly(false); PNS.t+=dt; const t=PNS.t, P=pnPose(t); npcSpring(a,P,dt,NPCARMS); pnFing(P,R.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt; P.nod+=Math.sin(a.t*1.3)*0.7*R.D; musScale(g);
    const B=R.settle(R.build(P,null),0), pr=pnKeys(t); PCS.forEach((pc,i)=>FM.set(i,pc.on==='prop'?(pr[pc.n]||PKBENCH):R.frameOf(pc.on||pc.n,B))); R.farOnly(false);
    pnTones(t,d); };
  // ITS SOUND (the game's pnSound, here): the notes in the next tenth of a second at their exact times, each with its damper's fall; as loud as he is near, from his side
  function pnTones(t,d){ if(!SND.ctx||SND.ctx.state!=='running')return; if(!pnAudio())return; const c=SND.ctx, ct=c.currentTime, when=x=>ct+Math.max(0,x-t)+0.03, ns=PNS.c.notes;
    PNA.g.gain.setTargetAtTime(0.5*Math.max(0,1-d/14),ct,0.05);
    const v=new THREE.Vector3(AT.x,1,AT.z).project(cam); PNA.pan.pan.setTargetAtTime(Math.max(-0.8,Math.min(0.8,v.x*0.8)),ct,0.1);
    while(PNS.sent<ns.length&&ns[PNS.sent].t0<=t+0.1){ const n=ns[PNS.sent++]; if(n.t0<t-0.05)continue; pnPlay(n.m,when(n.t0),when(n.off),n.vel); } }
  function pnHush(){ if(PNA.g&&SND.ctx)PNA.g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.2); } }
if(!STORE.bar)PNM.tick=()=>{};   // (the Bar off the map, owner 18 Oct 2026, "i dont want any other buildings or rooms on map": no stage, no pianist; AWAY in map-pre.js)
