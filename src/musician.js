// ---- THE MUSICIAN (owner, 17 Oct 2026: "pull in all the resources needed to replicate the musician playing guitar and the finger accuracy,
// guitar, zoom? place him outside bodega"; then "move him to the bar"). The game's own guitarist, brought over whole (its files read by build.py
// from the game: 47-play-3-guitar-1-body, -samples.data, -2-tunes, -3-hands): the classical guitar at its real size with its real recorded
// notes, the book of tunes (the Romance fingerpicked, four songs strummed, in turn), his hands solved every frame onto each note (each finger to
// its fret, the thumb on the bass, the strums; solid against the wood and each other; arms and fingers with weight). Here he's a second Walker
// with his fingers, in 3D (the player's own body: musBody, below), lit by the lamps, in the apartment house's top-floor front living room (AT, below),
// facing the room; louder as you come near, from his side, with the room's echo. A double click on him: the camera comes close on his hands
// (C to go back). He plays all the time up there (the bar's three take turns on its stage without him: src/bandstand.js) ----
const MUS={}; STORE.MUS=MUS;   // (a test's reach)
// THE PLAYER'S OWN BODY, FOR A MUSICIAN (owner, 17 Oct 2026: "reset all npcs to same exact avatar as main player", his pick: the people): the
// pieces walker3d.js made the player of (W3.pcs: his shell, his nose, the eyes and the hair he wears, his soles; no brows, mouth or beard), in
// his resting pose (meshOf's own: RB null), each piece knowing his (e: its index in W3.pcs, for his build's sizes, W3.E, each frame); only the
// fingers a piece a bone (his are one piece a finger, bent at the knuckle: playing bends every joint). Each musician dresses them his own way
function musBody(){ const R=RIG; if(!musBody.FG){ R.farOnly(false); R.fine(true); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, FG=R.shell(J,0).filter(p=>/^fing\d\d[LR]$/.test(p.n)); R.fine(false);
    const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
    for(const p of FG){ const f=/^fing(\d)(\d)([LR])$/.exec(p.n); p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.12; p.share=p; }   // (a finger's bone, fine: whole, not simplified away; made once for them all; about 270 triangles a bone)
    musBody.FG=FG; musBody.J=J; }
  const own=W3.pcs.map((p,i)=>W3.HIDE[i]||/^fing/.test(p.n)?null:Object.assign({},p,{e:i,share:p})).filter(Boolean);   // (share: the same shape in every musician, made once)
  return {PCS:own.concat(musBody.FG.map(p=>Object.assign({},p))),J:musBody.J}; }
// A FIGURE'S MESH (every musician's: as the Walker is built, walker3d.js's meshOf): the pieces into one mesh, each corner moved by its piece's
// frame handed to the graphics card each frame (uPM), lit by the lamps as the Walker is (his toon steps, W3.GP), his shadow moved the same way.
// The same pieces in more than one musician are made once (MUSGEO); one size of uPM for all of them (MUSNP), so one set of shader programs
const MUSGEO=new Map(), MUSNP=180;
function figureMesh(PCS,key){ const NP=Math.max(MUSNP,PCS.length), PM={value:Array.from({length:NP},()=>new THREE.Matrix4().makeScale(0,0,0))};
  const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), k=P.share||P; let g0=MUSGEO.get(k); if(!g0){ g0=P.box?musBox(P):W3.meshOf(P,P.step||(fine?.5:1),fine,null); if(P.share)MUSGEO.set(k,g0); }
    const g=new THREE.BufferGeometry(), n=g0.attributes.position.count; for(const a of ['position','normal','c1','mat'])g.setAttribute(a,g0.attributes[a]);
    if(P.recol){ const c=new Float32Array(n*3), mt=g0.attributes.mat.array; for(let j=0;j<n;j++){ const r=W3.ramp[P.recol(mt[j])]||W3.ramp[mt[j]]; c.set([r[1].r,r[1].g,r[1].b],j*3); } g.setAttribute('c1',new THREE.BufferAttribute(c,3)); }   // (his own clothes' colours on the player's shapes)
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of ['position','normal','c1','pidx']){ const sz=geos[0].attributes[k].itemSize, arr=new Float32Array(geos.reduce((a,g)=>a+g.attributes[k].array.length,0)); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  all.setAttribute('color',all.attributes.c1);
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT_=`mat4 PM=uPM[int(pidx+0.5)];`;
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
  mat.customProgramCacheKey=()=>'mus'+NP;
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'musdist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'musdepth'+NP;   // (the sun's shadow of him, moved the same way)
  const me=new THREE.Mesh(all,mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=true; me.receiveShadow=true; me.frustumCulled=false;
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  // a piece to its frame; the player's own pieces with his build's sizes on them (W3.E, as his are: src/looks.js, editor.js)
  return {me,PM,tris:all.attributes.position.count/3,per:geos.map((g,i)=>[PCS[i].n,g.attributes.position.count/3]),set:(i,F)=>{ M(F,PM.value[i]); const p=PCS[i], E=p.E!==undefined?p.E:p.e!=null&&W3.E&&W3.E[p.e]; if(E)W3.applyE(PM.value[i],E,F.o); }}; }   // (E: a piece's own sizes, not his: the singer's FEMALE body)
// A PLAIN BOX AS ITS TWELVE TRIANGLES (P.box: its middle and half sizes where its shape is), in its own frame as meshOf puts a piece (a piano
// key: some 1,270 triangles from the shape's grid, 12 this way)
function musBox(P){ const [cx,cy,cz,hx,hy,hz]=P.box, F=P.F0, g=new THREE.BoxGeometry(2*hx,2*hy,2*hz).toNonIndexed(), p=g.attributes.position, nn=g.attributes.normal, n=p.count, mi=RIG.MATS.indexOf(P.m), r=W3.ramp[mi];
  const pos=new Float32Array(n*3), nor=new Float32Array(n*3), c1=new Float32Array(n*3), d=(x,y,z,v)=>x*v.x+y*v.y+z*v.z;
  for(let i=0;i<n;i++){ const x=p.getX(i)+cx-F.o.x, y=p.getY(i)+cy-F.o.y, z=p.getZ(i)+cz-F.o.z, a=nn.getX(i), b=nn.getY(i), c=nn.getZ(i);
    pos.set([d(x,y,z,F.x),d(x,y,z,F.y),d(x,y,z,F.z)],i*3); nor.set([d(a,b,c,F.x),d(a,b,c,F.y),d(a,b,c,F.z)],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); }
  const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.BufferAttribute(nor,3)); o.setAttribute('c1',new THREE.BufferAttribute(c1,3)); o.setAttribute('mat',new THREE.BufferAttribute(new Float32Array(n).fill(mi),1)); return o; }
// his size, the player's (W3.SZ, a fifth bigger; his build's height, W3.BH), from his feet
const musScale=(g,bh)=>g.scale.set(W3.SZ/PPU,ZU*W3.SZ*(bh||W3.BH||1),W3.SZ/PPU);   // (bh: a body's own height, the singer's)
// WHERE HE PLAYS (owner, 17 Oct 2026: "move the musician into an apartment top floor"; before, the stored bar's stage, STORE.bar.gtr): the
// apartment house's top floor, in the front living room (the one with the fire escape over the street), the middle of the room, facing its door
{ const R=RIG, V=R.V, AP=MODS.apts, AA=AP.A, AT={x:BOD.X((AA.x0+AA.x1)/2),z:BOD.Z(AA.y1-1.5),hd:0,y:AP.SY*4}; MUS.floor=4;
  // his pieces: the player's (musBody, the shapes shared with the others: share), and the guitar in its own frame
  const PCS=musBody().PCS;
  PCS.push(Object.assign({},GT.PIECE,{d:GT.SOLID,F0:{o:V(0,0,0),x:V(1,0,0),y:V(0,1,0),z:V(0,0,1)},step:.25,cell:.25}));   // (the guitar's hull whole: the game's hollow one, thin plates and bracing, breaks up as a mesh)
  for(const P of PCS)if(!MUSGEO.has(P.share||P)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'mus'), me=FM.me;
  const g=new THREE.Group(); g.add(me); MAPG.bodega.add(g); MUS.g=g; MUS.tris=FM.tris; MUS.per=FM.per;
  // the strings: six of them, saddle to nut, a pixel wide, in the guitar's frame (nylon trebles, silver basses)
  const sg=new THREE.Group(); sg.matrixAutoUpdate=false; g.add(sg);
  for(let i=1;i<=6;i++){ const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(GT.sx(i,0),0,GT.sz(0)),new THREE.Vector3(GT.sx(i,GT.S),GT.S,GT.sz(GT.S))]); sg.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:i<4?0x6a6e72:0x55595c}))); }
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  // where he stands: his mark on the stage, facing the room
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); musScale(g); MUS.at=AT;
  // HOW HE HOLDS IT (owner, 17 Oct 2026: "fix the guitarist arm", his pick: the strumming elbow lifted). The game's guitar sat high on his
  // chest, its upper edge near his armpit, so the strumming forearm could only cross it from an upper arm held out level; here it hangs on
  // its strap lower (drop: his units), the neck up a little more (tilt), and the right wrist comes to the strings over the lower bout's upper
  // edge, the elbow down by his side (GTPOLE.R: down, a little out and back), the forearm laid over the guitar to the strings
  const F0={o:{...GTF.o},x:{...GTF.x},y:{...GTF.y},z:{...GTF.z}};
  MUS.hold=(drop,tilt,wr,pole)=>{ const c=Math.cos(tilt), s=Math.sin(tilt), rot=v=>V(v.x*c-v.y*s,v.x*s+v.y*c,v.z), P0=V(F0.o.x,F0.o.y,F0.o.z);
    GTF.x=rot(F0.x); GTF.y=rot(F0.y); GTF.z=rot(F0.z); GTF.o=R.add(rot(P0),V(0,-drop,0));
    const {add,mul,nrm}=R; GTH.L={y:GTF.z,z:nrm(add(mul(GTF.x,-0.225),mul(GTF.y,-0.974)))}; GTH.R={y:nrm(add(GTF.x,mul(GTF.z,-0.017))),z:nrm(add(add(mul(GTF.x,-0.008),mul(GTF.y,-0.891)),mul(GTF.z,-0.454)))};
    const arr=v=>[v.x,v.y,v.z]; GTH.hf={L:{y:arr(GTH.L.y),z:arr(GTH.L.z)},R:{y:arr(GTH.R.y),z:arr(GTH.R.z)}}; if(wr)GTWR.R=wr; if(pole)GTPOLE.R=V(...pole); };   // (the hands' frames on it as the game sets them)
  MUS.hold(4,10*R.D,[-4.2,2.2,2],[-.3,-1,-.2]);   // (tried against the game's hold, tests/gthold.cjs: his elbow from level with his shoulder, 7 ahead of it, to 5.7 below it, 4 ahead and 2 out; his fingertips as near their notes)
  MUS.elbow=()=>MUS.B&&['shoulderR','elbowR','wristR','shoulderL','elbowL','wristL'].map(k=>{ const p=MUS.B.J[k]; return k+' '+[p.x,p.y,p.z].map(v=>v.toFixed(1)).join(','); });   // (a test's: his arms' joints, his units)
  // HIS PLAYING, each frame he's on the stage and you're near (the game's gtStep, here): the tune's clock, his pose solved onto its notes, his
  // arms and fingers with weight, a breath and a nod with the beat; at a tune's end, a moment's rest, the next in the book
  const a={t:0}; let song=0, rest=0;
  MUS.start=()=>{ rest=0; song=gtNext(song); gtSet(song); }; MUS.stop=()=>gtHush();   // (his turn on the stage: a tune from its start; off it, silent)
  MUS.tick=dt=>{ if(MUS.watch&&!UI.freeCam){ MUS.watch=false; SHB.hidden=true; SHB.style.display='none'; if(MUS.res0!=null){ RESI=MUS.res0; MUS.res0=null; resize(); } } const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!MUS.on||!MAPG.bodega.visible||d>18&&!MUS.watch){ gtHush(); return; }
    if(GTS.t>GTEND+1.5){ rest+=dt; if(rest>2.5){ rest=0; song=gtNext(song); gtSet(song); } }
    R.farOnly(false); GTS.t+=dt; const t=GTS.t, P=gtPose(t); npcSpring(a,P,dt,NPCARMS); gtFing(P,RIG.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt;
    P.nod+=Math.sin(a.t*1.6)*0.6*R.D+Math.sin(t/GTBEAT*Math.PI)*0.8*R.D; a.P=P; musScale(g);
    const B=R.settle(R.build(P,null),0); MUS.B=B;
    if(MUS.err){ const T=P._T; for(const n of 'LR')for(let i=0;i<5;i++)if(T[n][i]&&T[n].w[i]>=.99){ const k=B.J['k'+i+'3'+n]; if(k){ const e=MUS.err[n]; e[0]+=R.len(R.sub(k,T[n][i])); e[1]++; } } }   // (a test's: how near his playing fingertips come to their notes)
    PCS.forEach((pc,i)=>{ if(pc.n==='guitar')FM.set(i,GTF); else FM.set(i,R.frameOf(pc.on||pc.n,B)); }); M(GTF,sg.matrix); sg.matrixWorldNeedsUpdate=true; R.farOnly(false);
    gtTones(t,d); };
  // ITS SOUND (the game's gtSound, here): the notes in the next tenth of a second, each at its time; as loud as he is near, from his side
  function gtTones(t,d){ if(!SND.ctx||SND.ctx.state!=='running')return; if(!gtAudio())return; const c=SND.ctx, ct=c.currentTime, A=t+0.1, when=x=>ct+Math.max(0,x-t)+0.03;
    if(GTA.wet)GTA.wet.gain.value=.08;   // (a small room's echo; the bar's was .2)
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
    UI.setFree(true); UI.camT.copy(p); ppuTo=PPU*16; MUS.watch=true; MUS.res0=RESI; RESI=MUS.sharp(); resize(); SHB.show(); }});   // (owner, 17 Oct 2026: "when you watch the guitarist zoom in all the way and add a sharpen bar to adjust to the level i want": all the way in that still shows his hands and the guitar, the wheel closer still; and the SHARPEN bar)
  // THE SHARPEN BAR (while you watch him): the art's fineness from the coarsest to one screen pixel each (past the menu's ceiling, here only), the
  // level kept in this browser for the next time; back as it was when you leave
  const SHB=document.createElement('div'); SHB.id='shbar'; SHB.hidden=true; SHB.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:6;display:none;gap:10px;align-items:center;padding:8px 12px;background:#0b0d13e0;border:2px solid #2a3040;font:11px Silkscreen,monospace;letter-spacing:1px;color:#c9ccd6';
  SHB.innerHTML='<span>SHARPEN</span><input type="range" min="0" step="1" style="width:220px"><span class="v" style="width:52px;text-align:right"></span><span style="color:#8a8f9c">C BACK</span>'; document.body.appendChild(SHB);
  const shIn=SHB.querySelector('input'), shV=SHB.querySelector('.v'); shIn.max=RESL.length-1;
  MUS.sharp=()=>{ let v=null; try{ v=SAVE.get('gtsharp'); }catch(e){} return v!=null?+v:Math.min(RESL.length-1,RESMAX+2); };
  SHB.show=()=>{ shIn.value=RESI; shV.textContent=RES()+'x'; SHB.hidden=false; SHB.style.display='flex'; };
  shIn.oninput=()=>{ RESI=+shIn.value; resize(); shV.textContent=RES()+'x'; try{ SAVE.set('gtsharp',String(RESI)); }catch(e){} };
  shIn.addEventListener('pointerdown',e=>e.stopPropagation()); shIn.addEventListener('keydown',e=>e.stopPropagation());   // (close, and sharp: the sharpness up as far as the screen shows, as the game's close-up drew him finer; back as it was when you leave)
}
