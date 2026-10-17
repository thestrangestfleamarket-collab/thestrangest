// ---- THE SINGER (owner, 17 Oct 2026, the bar "with all musicians"): the game's own singer, brought over whole (its files read by build.py
// from the game: 47-play-6-woman, 47-play-7-singer, 47-zzz-bar-singer): a woman on the Walker's bones (his skeleton, her pieces his reshaped:
// no beard, a narrower torso and a waist, her hair, a dress instead of his shirt and trousers; the game's design 2, the strapless red gown, her
// long auburn waves back off her face), the microphone in her right hand with its grille always at her mouth, the amp at her left on the
// stage, the cord from the microphone to the amp's jack as 52 points of real physics (verlet: gravity, a cable's stiffness, dragging on the
// stage, kept out of her skirt and the amp), her weight from one foot to the other as she sings (the game's three poses, blended), and her
// voice: made as a voice is made (the buzz at the note's pitch, the vowel's three resonances, breath, vibrato on a held note), wordless
// melodies over the songbook's chord songs. Here a fourth Walker with fingers, in 3D (figureMesh: musician.js), now the player's own body in his
// FEMALE build, in her red gown, standing at the stored bar's microphone mark (STORE.bar.singer) facing the room; the cord a line; heard louder as
// you come near, while it's her turn (bandstand.js) ----
const SGM={}; STORE.SGM=SGM;   // (a test's reach)
{ const R=RIG, V=R.V, S=STORE.bar, AT={x:BOD.X(S.singer.x),z:BOD.Z(S.singer.y),hd:0,y:BOD.Y(S.stage.z)};
  // her look's colours (the game's, for the strapless gown), four tones each (light to dark), as materials of her own (sg_...)
  const D=WOMAN.DESIGNS[2], LOOK={...D.look,metal:'#d6d8de',tie:'#1a181c',cover:'#2c2620',linen:'#ece4cc',ember:'#ff3a28',hole:'#2a282e'};
  const tones=h=>{ const c=new THREE.Color(h); return [1.14,1,.72,.46].map(k=>c.clone().multiplyScalar(k)); };
  for(const m in LOOK){ const n='sg_'+m; if(!R.MATS.includes(n)){ R.MATS.push(n); W3.ramp.push(tones(LOOK[m])); } }
  const own=p=>{ const q=Object.assign({},p), pm=p.paint; q.m='sg_'+(p.m||'skin'); if(pm)q.paint=x=>{ const r=pm(x); return r?'sg_'+r:null; }; return q; };
  // her pieces: the player's own (musBody: his shapes, his hair and eyes, the fingers a piece a bone; owner, 17 Oct 2026, "reset all npcs to same
  // exact avatar as main player") in the player's FEMALE body (YOUR LOOKS' sizes and height, LOOKS.BUILDS: not the game's woman's), and her
  // gown again (owner, 17 Oct 2026, "yes"): the gown's own skirt to the floor on her hips (WOMAN.SKIRT.gown, the shape her cord keeps clear
  // of) and its strapless bodice (the torso bare above it, WOMAN.NECK.strapless), no sleeves, her shoes, all in the gown's red; her legs bare
  // under it; the microphone and the amp (SINGMIC, on 'prop': their own frames)
  const B0=R.settle(R.build(castPose('singA'),null),0), MIC0=singMic(B0), MI=n=>R.MATS.indexOf(n), SH=MI('shirt'), PA=MI('pants'), SO=MI('shoes'), SK=MI('skin'), RED=MI('sg_shirt'), SRED=MI('sg_shoes');
  const FEM=(LOOKS.BUILDS||[]).find(b=>b[3])||['',1,{}], GS=WOMAN.SKIRT.gown, top=22.4, bare=WOMAN.NECK.strapless;
  const skirt={n:'skirt',on:'hips',m:'sg_shirt',bb:[-15,15,-1,24,-12,12],d:q=>{ const y=Math.max(GS.hem,Math.min(top,q.y)), a=GS.a(y), bz=a*.7; return Math.max((Math.hypot(q.x/a,(q.z+.4)/bz)-1)*Math.min(a,bz),GS.hem-q.y,q.y-top); }};   // (the game's gown skirt, 47-play-6-woman)
  const PCS=musBody().PCS.filter(p=>!/^sleeve/.test(p.n)).concat([skirt],SINGMIC.map(own));
  for(const p of PCS){ if(p.e!=null||/^fing/.test(p.n)){ const s=FEM[2][p.n]; p.E=s?{s:s.slice(),o:[0,0,0],q:[0,0,0,1]}:null; p.recol=m=>m===SH?RED:m===PA?SK:m===SO?SRED:undefined; }
    if(p.n==='torso'){ delete p.share; p.paint=q=>bare(q)?'skin':null; }   // (the bodice: her torso hers to paint, made here)
    if(/^mic/.test(p.n)){ p.step=.15; p.cell=.2; p.F0=MIC0; } else if(/^amp/.test(p.n)){ p.step=.3; p.cell=.4; p.F0=SINGF; } }   // (coarser than they were: the amp and the microphone some 31,000 triangles before)
  for(const P of PCS)if(!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'sgm'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); SGM.g=g; SGM.at=AT; SGM.tris=FM.tris; SGM.per=FM.per;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); musScale(g,FEM[1]);
  // THE CORD: a line of its 52 points, in her own frame (as her pieces are), moved each frame
  const cg=new THREE.BufferGeometry(); cg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(CORDN*3),3)); const cord=new THREE.Line(cg,new THREE.LineBasicMaterial({color:0x1a1618})); cord.frustumCulled=false; g.add(cord);
  // EACH FRAME you're near (the game's bar tick for her, here): her weight from one foot to the other (singA, singB, singC in turn, blended
  // over a second or two), breathing, singing out to the room; the microphone at her mouth, the amp, the cord a step on; her voice
  const a={pose:'singA',from:null,P:null,B:null,bt:1,bT:1.6,t:0,next:2.5,props:{}};
  SGM.dist=()=>Math.hypot(pos.x-AT.x,pos.z-AT.z); SGM.pan=()=>{ const v=new THREE.Vector3(AT.x,1,AT.z).project(cam); return Math.max(-.8,Math.min(.8,v.x*.8)); };
  SGM.stop=()=>voxStop();   // (off the stage: silent; back on, a song from its start)
  SGM.tick=dt=>{ const d=SGM.dist(); if(!SGM.on||!MAPG.bodega.visible||d>18){ voxStop(); return; } musScale(g,FEM[1]);
    a.t+=dt; a.next-=dt; if(a.next<=0){ a.next=1.8+Math.random()*1.6; const ps=['singA','singB','singC'].filter(p=>p!==a.pose); a.from=a.P?JSON.parse(JSON.stringify(a.P)):null; a.pose=ps[Math.random()*ps.length|0]; a.bt=0; a.bT=1.4+Math.random()*.6; }
    a.bt+=dt; const T=castPose(a.pose), u=a.from?Math.min(1,a.bt/a.bT):1, e=u*u*(3-2*u), P=u<1?R.mix(a.from,T,e):JSON.parse(JSON.stringify(T));
    P.bend+=Math.sin(a.t*1.6)*.5*R.D; P.nod+=Math.sin(a.t*.9)*1.5*R.D; P.look+=Math.sin(a.t*.5)*.25; a.P=P;
    const B=R.settle(R.build(P,null),0); B.props={}; a.B=B; singStep(a,dt);
    PCS.forEach((pc,i)=>FM.set(i,pc.on==='prop'?B.props[pc.n]:R.frameOf(pc.on||pc.n,B)));
    const q=cg.attributes.position.array; a.cord.forEach((c,i)=>{ q[i*3]=c.p.x; q[i*3+1]=c.p.y; q[i*3+2]=c.p.z; }); cg.attributes.position.needsUpdate=true;
    if(SND.ctx&&SND.ctx.state==='running')voxStep(dt,performance.now()); }; }
