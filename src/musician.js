// ---- THE MUSICIAN (owner, 17 Oct 2026: "pull in all the resources needed to replicate the musician playing guitar and the finger accuracy,
// guitar, zoom? place him outside bodega"). The game's own guitarist, brought over whole (its files read by build.py from the game:
// 47-play-3-guitar-1-body, -samples.data, -2-tunes, -3-hands): the classical guitar at its real size with its real recorded notes, the book
// of tunes (the Romance fingerpicked, four songs strummed, in turn), his hands solved every frame onto each note (each finger to its fret,
// the thumb on the bass, the strums; solid against the wood and each other; arms and fingers with weight). Here he's a second Walker with
// his fingers, in 3D (built as the Walker is, walker3d.js's meshOf), lit by the lamps, on the sidewalk by the bodega, in the street light's pool, facing
// the street; louder as you come near, from his side. A double click on him: the camera comes close on his hands (C to go back) ----
const MUS={};
{ const R=RIG, V=R.V, AT={x:-2.45,z:1.75,hd:0.35};
  // his pieces: his own (the fingers' bones too: the rig's fine hand), and the guitar in its own frame
  // (his fingers: the rig leaves them out of a figure seen from afar, FAR; he's built and posed with them, the player without)
  R.farOnly(false); R.fine(true); const RB=R.build(R.walkPose({ph:0,w:0},null),null), PCS=R.shell(RB.J,0).filter(p=>p.on!=='prop'&&p.on!=='world'); R.fine(false); R.farOnly(false);
  const J=RB.J, around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
  for(const p of PCS){ const f=/^fing(\d)(\d)([LR])$/.exec(p.n); if(f){ p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.08; }   // (a finger's bone, fine: whole, not simplified away)
    else if(/^hand[LR]$/.test(p.n)){ p.bb=around([J['wrist'+p.n.slice(-1)]],4.5); p.step=.2; p.cell=.15; } }
  PCS.push(Object.assign({},GT.PIECE,{d:GT.SOLID,F0:{o:V(0,0,0),x:V(1,0,0),y:V(0,1,0),z:V(0,0,1)},step:.15,cell:.12}));   // (the guitar's hull whole: the game's hollow one, thin plates and bracing, breaks up as a mesh)
  const NP=PCS.length, PM={value:PCS.map(()=>new THREE.Matrix4())};
  const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), g=W3.meshOf(P,P.step||(fine?.5:1),fine,RB), n=g.attributes.position.count;
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of ['position','normal','c1','pidx']){ const sz=geos[0].attributes[k].itemSize, arr=new Float32Array(geos.reduce((a,g)=>a+g.attributes[k].array.length,0)); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  all.setAttribute('color',all.attributes.c1);
  // lit by the lamps as the Walker is (his toon steps), each corner moved by its piece's frame
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT_=`mat4 PM=uPM[int(pidx+0.5)];`;
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.G3,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
  mat.customProgramCacheKey=()=>'mus'+NP;
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'musdist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'musdepth'+NP;   // (the sun's shadow of him, moved the same way)
  const me=new THREE.Mesh(all,mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=true; me.receiveShadow=true; me.frustumCulled=false;
  const g=new THREE.Group(); g.add(me); MAPG.bodega.add(g); MUS.g=g;
  // the strings: six of them, saddle to nut, a pixel wide, in the guitar's frame (nylon trebles, silver basses)
  const sg=new THREE.Group(); sg.matrixAutoUpdate=false; g.add(sg);
  for(let i=1;i<=6;i++){ const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(GT.sx(i,0),0,GT.sz(0)),new THREE.Vector3(GT.sx(i,GT.S),GT.S,GT.sz(GT.S))]); sg.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:i<4?0x6a6e72:0x55595c}))); }
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  // where he stands, and what he bumps into
  g.position.set(AT.x,0,AT.z); g.rotation.set(0,AT.hd,0); g.scale.set(1/PPU,ZU,1/PPU); MUS.at=AT;
  // HIS PLAYING, each frame he's near (the game's gtStep, here): the tune's clock, his pose solved onto its notes, his arms and fingers with
  // weight, a breath and a nod with the beat; at a tune's end, a moment's rest, the next in the book
  // HIS STRUMMING ARM, NATURAL (owner, 17 Oct 2026: "can you have NPCs use natural body movement? his elbow is lifted unnatural"): the game's pose
  // had the right elbow out to his side, near level (right for its flat picture); in 3D a guitarist's strumming arm hangs: the elbow down by
  // his side, a little back and out, the forearm laid over the guitar's lower bout to the strings. The left elbow stays under the neck
  GTPOLE.R=RIG.V(-1,-1,-.55);
  const a={t:0}; let song=0, rest=0;
  MUS.tick=dt=>{ if(MUS.watch&&!UI.freeCam){ MUS.watch=false; if(MUS.res0!=null){ RESI=MUS.res0; MUS.res0=null; resize(); } } const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!MAPG.bodega.visible||d>18&&!MUS.watch){ gtHush(); return; }
    if(GTS.t>GTEND+1.5){ rest+=dt; if(rest>2.5){ rest=0; song=gtNext(song); gtSet(song); } }
    R.farOnly(false); GTS.t+=dt; const t=GTS.t, P=gtPose(t); npcSpring(a,P,dt,NPCARMS); gtFing(P,RIG.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt;
    P.nod+=Math.sin(a.t*1.6)*0.6*R.D+Math.sin(t/GTBEAT*Math.PI)*0.8*R.D; a.P=P;
    const B=R.settle(R.build(P,null),0); PCS.forEach((pc,i)=>{ if(pc.n==='guitar')M(GTF,PM.value[i]); else M(R.frameOf(pc.on||pc.n,B),PM.value[i]); }); M(GTF,sg.matrix); sg.matrixWorldNeedsUpdate=true; R.farOnly(false);
    gtTones(t,d); };
  // ITS SOUND (the game's gtSound, here): the notes in the next tenth of a second, each at its time; as loud as he is near, from his side
  function gtTones(t,d){ if(!SND.ctx||SND.ctx.state!=='running')return; if(!gtAudio())return; const c=SND.ctx, ct=c.currentTime, A=t+0.1, when=x=>ct+Math.max(0,x-t)+0.03;
    if(GTA.wet)GTA.wet.gain.value=.04;   // (outside: almost no room's echo, as the bar's busker)
    GTA.g.gain.setTargetAtTime(0.5*Math.max(0,1-d/16),ct,0.05);
    const v=new THREE.Vector3(AT.x,1,AT.z).project(cam); GTA.pan.pan.setTargetAtTime(Math.max(-0.8,Math.min(0.8,v.x*0.8)),ct,0.1);
    while(GTS.sent<GTEV.length&&GTEV[GTS.sent].t<=A){ const e=GTEV[GTS.sent++]; if(e.t<t-0.05)continue; if(e.n)gtPlay(e.n.s,e.n.at,when(e.t),e.n.amp,e.n.tone,e.n.r); else gtMute(e.s,when(e.t),0.04); } }
  function gtHush(){ if(GTA.g&&SND.ctx)GTA.g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.2); }
  // the sound starts with your first click or key (a browser's rule)
  const wake=()=>{ if(!SND.ctx){ try{ SND.ctx=new (window.AudioContext||window.webkitAudioContext)(); SND.out=SND.ctx.destination; }catch(e){ return; } } if(SND.ctx.state!=='running')SND.ctx.resume(); };
  addEventListener('pointerdown',wake); addEventListener('keydown',wake);
  // A DOUBLE CLICK ON HIM: walk up, then the camera close on his hands (the free camera, there; C goes back)
  const hitBox=new THREE.Mesh(new THREE.BoxGeometry(22,58,24),new THREE.MeshBasicMaterial({visible:false})); hitBox.position.set(0,29,2); g.add(hitBox);   // (what a double click finds: him, roughly)
  UI.thing({name:'THE GUITARIST',obj:hitBox,reach:1.6,tall:1.9,act:()=>{ const p=new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().multiplyMatrices(g.matrixWorld,new THREE.Matrix4().makeTranslation(GTF.o.x,GTF.o.y,GTF.o.z)));
    UI.setFree(true); UI.camT.copy(p); ppuTo=Math.min(240,PPU*7); MUS.watch=true; MUS.res0=RESI; while(RESI<RESL.length-1&&(pxS()>1||vpu()>art())){ RESI++; if(pxS()<=1)break; } resize(); }});   // (close, and sharp: the sharpness up as far as the screen shows, as the game's close-up drew him finer; back as it was when you leave)
  SOL.up.push([AT.x-.35,AT.z-.3,AT.x+.35,AT.z+.3]); FIX.up.push([AT.x-.35,AT.z-.3,0,AT.x+.35,AT.z+.3,1.7]);   // (solid: he and his guitar)
}
