// ---- THE PIANIST (owner, 17 Oct 2026, the bar "with all musicians"): the game's own pianist, brought over whole (its files read by build.py
// from the game: 47-play-5-piano-1-sound, -samples.data, -2-music, -3-hands): the Walker's own pieces in a tuxedo (the jacket black, the white
// shirt front between satin lapels, its studs, the bow tie, white cuffs), the bench and the 88 keys as pieces of his (each key its own frame,
// turned down under his finger), his book of pieces (Bach's Prelude in C, Für Elise, the first Gymnopédie, note for note), his fingers onto
// their keys as the score's fingering says, his right foot on the pedal, the real grand's recordings (the Salamander Grand, each key the
// nearest note tuned to its pitch, as loud and bright as it's struck). Here a third Walker with his fingers, in 3D (built as the musician is:
// walker3d.js's meshOf, one mesh, each corner moved by its piece's frame), in the tuxedo's own colours, seated at the stored bar's grand
// (store.js: STORE.bar.piano) facing the room, lit by the lamps; heard louder as you come near, from his side; plays while you're near ----
const PNM={}; STORE.PNM=PNM;   // (a test's reach)
// A FIGURE'S MESH (the pianist's, the singer's: as the musician is built, walker3d.js's meshOf): the pieces into one mesh, each corner moved by
// its piece's frame handed to the graphics card each frame (uPM), lit by the lamps as the Walker is (his toon steps), his shadow moved the same way
function figureMesh(PCS,RB,key){ const NP=PCS.length, PM={value:PCS.map(()=>new THREE.Matrix4())};
  const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), g=W3.meshOf(P,P.step||(fine?.5:1),fine,RB), n=g.attributes.position.count;
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of ['position','normal','c1','pidx']){ const sz=geos[0].attributes[k].itemSize, arr=new Float32Array(geos.reduce((a,g)=>a+g.attributes[k].array.length,0)); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  all.setAttribute('color',all.attributes.c1);
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT_=`mat4 PM=uPM[int(pidx+0.5)];`;
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
  mat.customProgramCacheKey=()=>key+NP;
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>key+'dist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>key+'depth'+NP;
  const me=new THREE.Mesh(all,mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=true; me.receiveShadow=true; me.frustumCulled=false;
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  return {me,PM,set:(i,F)=>M(F,PM.value[i])}; }
{ const R=RIG, V=R.V, S=STORE.bar, AT={x:BOD.X(S.piano.x),z:BOD.Z(S.piano.keys-PK.Z/33.9),hd:0,y:BOD.Y(S.stage.z)};   // (at the keys: their fronts PK.Z of his units before him; on the stage)
  // the tuxedo's stuff, the bench's and the keys': materials of their own, added to the rig's list and the Walker's ramps (four tones each)
  const ADD={tux:['#3a3a40','#2c2c31','#1d1d21','#111114'],linen:['#f4f2ea','#e6e3da','#c9c6bc','#8a887f'],tie:['#26262a','#1c1c20','#121214','#0a0a0c'],vest:['#4a4a52','#3a3a42','#28282e','#161619'],
    wood:['#6a4a30','#573a24','#3f2a19','#261810'],cover:['#2e2a2a','#232020','#181616','#0e0d0d'],paper:['#f6f1e2','#e9e3d2','#cfc9b8','#8f8a7c'],hole:['#2a2a2c','#1c1c1e','#111112','#070708'],gold:['#d9b24a','#c49a38','#946f22','#5a4212']};
  for(const m in ADD)if(!R.MATS.includes(m)){ R.MATS.push(m); W3.ramp.push(ADD[m].map(h=>new THREE.Color(h))); }
  // his pieces: his own seated at the keys (the fingers' bones too), dressed by the game's PNPIECES (the tuxedo's paint, the bench, the keys;
  // the grand's case for the game's close-up left out: the grand here is the world's), his shirt and trousers the tuxedo's black
  R.farOnly(false); R.fine(true); const RB=R.build(castPose('pianoSit'),null), base=R.shell(RB.J,0).filter(p=>p.on!=='prop'&&p.on!=='world'&&p.n!=='beard'); R.fine(false); R.farOnly(false);
  const PCS=PNPIECES(RB.J,base).filter(p=>!/^pn(Case|Desk|Bed|Legs)$/.test(p.n)), J=RB.J, around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
  for(const p of PCS){ if(p.m==='shirt'||p.m==='pants')p.m='tux'; if(/^shoe/.test(p.n))p.m='tie';
    const f=/^fing(\d)(\d)([LR])$/.exec(p.n); if(f){ p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.08; }
    else if(/^hand[LR]$/.test(p.n)){ p.bb=around([J['wrist'+p.n.slice(-1)]],4.5); p.step=.2; p.cell=.15; }
    else if(/^pk\d/.test(p.n)){ p.step=.15; p.cell=.1; }
    if(p.on==='prop')p.F0=/^pk\d/.test(p.n)?PNKF[+p.n.slice(2)]:PKBENCH; }   // (a key's rest frame, the bench's: its own, as the guitar's is; moved each frame by pnKeys)
  for(const P of PCS){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,RB); }
  const FM=figureMesh(PCS,RB,'pnm'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); PNM.g=g; PNM.at=AT;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); g.scale.set(1/PPU,ZU,1/PPU);
  // HIS PLAYING, each frame you're near (the game's pnStep, here): the piece's clock, his pose from it (his hands over the keys, each finger
  // onto its key, his foot on the pedal), his arms and fingers with weight, a breath; the keys down under his fingers; the sound a moment
  // ahead; at a piece's end a moment's rest, then the next of the book
  pnSet(0); const a={t:0}; let rest=0; PNM.tick=dt=>{ const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!MAPG.bodega.visible||d>18){ pnHush(); return; }
    if(PNS.c&&PNS.t>PNS.c.len+1.5){ rest+=dt; if(rest>1.5){ rest=0; pnStop(); pnSet((PNS.song+1)%PNBOOK.length); } }
    R.farOnly(false); PNS.t+=dt; const t=PNS.t, P=pnPose(t); npcSpring(a,P,dt,NPCARMS); pnFing(P,R.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt; P.nod+=Math.sin(a.t*1.3)*0.7*R.D;
    const B=R.settle(R.build(P,null),0), pr=pnKeys(t); PCS.forEach((pc,i)=>FM.set(i,pc.on==='prop'?(pr[pc.n]||PKBENCH):R.frameOf(pc.on||pc.n,B))); R.farOnly(false);
    pnTones(t,d); };
  // ITS SOUND (the game's pnSound, here): the notes in the next tenth of a second at their exact times, each with its damper's fall; as loud as he is near, from his side
  function pnTones(t,d){ if(!SND.ctx||SND.ctx.state!=='running')return; if(!pnAudio())return; const c=SND.ctx, ct=c.currentTime, when=x=>ct+Math.max(0,x-t)+0.03, ns=PNS.c.notes;
    PNA.g.gain.setTargetAtTime(0.5*Math.max(0,1-d/14),ct,0.05);
    const v=new THREE.Vector3(AT.x,1,AT.z).project(cam); PNA.pan.pan.setTargetAtTime(Math.max(-0.8,Math.min(0.8,v.x*0.8)),ct,0.1);
    while(PNS.sent<ns.length&&ns[PNS.sent].t0<=t+0.1){ const n=ns[PNS.sent++]; if(n.t0<t-0.05)continue; pnPlay(n.m,when(n.t0),when(n.off),n.vel); } }
  function pnHush(){ if(PNA.g&&SND.ctx)PNA.g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.2); } }
