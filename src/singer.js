// ---- THE SINGER (owner, 17 Oct 2026, the bar "with all musicians"): the game's own singer, brought over whole (its files read by build.py
// from the game: 47-play-6-woman, 47-play-7-singer, 47-zzz-bar-singer): a woman on the Walker's bones (his skeleton, her pieces his reshaped:
// no beard, a narrower torso and a waist, her hair, a dress instead of his shirt and trousers; the game's design 2, the strapless red gown, her
// long auburn waves back off her face), the microphone in her right hand with its grille always at her mouth, the amp at her left on the
// stage, the cord from the microphone to the amp's jack as 52 points of real physics (verlet: gravity, a cable's stiffness, dragging on the
// stage, kept out of her skirt and the amp), her weight from one foot to the other as she sings (the game's three poses, blended), and her
// voice: made as a voice is made (the buzz at the note's pitch, the vowel's three resonances, breath, vibrato on a held note), wordless
// melodies over the songbook's chord songs. Here a fourth Walker with her fingers, in 3D (figureMesh: pianist.js), in her look's own colours,
// standing at the stored bar's microphone mark (STORE.bar.singer) facing the room; the cord a line; heard louder as you come near ----
const SGM={}; STORE.SGM=SGM;   // (a test's reach)
{ const R=RIG, V=R.V, S=STORE.bar, AT={x:BOD.X(S.singer.x),z:BOD.Z(S.singer.y),hd:0,y:BOD.Y(S.stage.z)};
  // her look's colours (the game's, for the strapless gown), four tones each (light to dark), as materials of her own (sg_...)
  const D=WOMAN.DESIGNS[2], LOOK={...D.look,metal:'#d6d8de',tie:'#1a181c',cover:'#2c2620',linen:'#ece4cc',ember:'#ff3a28',hole:'#2a282e'};
  const tones=h=>{ const c=new THREE.Color(h); return [1.14,1,.72,.46].map(k=>c.clone().multiplyScalar(k)); };
  for(const m in LOOK){ const n='sg_'+m; if(!R.MATS.includes(n)){ R.MATS.push(n); W3.ramp.push(tones(LOOK[m])); } }
  const own=p=>{ const q=Object.assign({},p), pm=p.paint; q.m='sg_'+(p.m||'skin'); if(pm)q.paint=x=>{ const r=pm(x); return r?'sg_'+r:null; }; return q; };
  // her pieces: the woman's on his bones (the game's WOMAN.pieces), the microphone and the amp (SINGMIC, on 'prop': their own frames)
  R.farOnly(false); R.fine(true); const RB=R.build(castPose('singA'),null), base=R.shell(RB.J,0).filter(p=>p.on!=='prop'&&p.on!=='world'); R.fine(false); R.farOnly(false);
  const B0=R.settle(R.build(castPose('singA'),null),0), MIC0=singMic(B0), J=RB.J;
  const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
  const PCS=WOMAN.pieces({...D,hair:'wavesBack'})(J,base).concat(SINGMIC).map(own).filter(p=>!p.bb||p.bb[1]-p.bb[0]>.5);   // (her beard and the sleeves she has none of: nothing, left out)
  for(const p of PCS){ const f=/^fing(\d)(\d)([LR])$/.exec(p.n); if(f){ p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.08; }
    else if(/^hand[LR]$/.test(p.n)){ p.bb=around([J['wrist'+p.n.slice(-1)]],4.5); p.step=.2; p.cell=.15; }
    else if(/^mic/.test(p.n)){ p.step=.15; p.cell=.1; p.F0=MIC0; } else if(/^amp/.test(p.n)){ p.step=.25; p.cell=.2; p.F0=SINGF; } }
  for(const P of PCS){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,RB); }
  const FM=figureMesh(PCS,RB,'sgm'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); SGM.g=g; SGM.at=AT;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); g.scale.set(1/PPU,ZU,1/PPU);
  // THE CORD: a line of its 52 points, in her own frame (as her pieces are), moved each frame
  const cg=new THREE.BufferGeometry(); cg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(CORDN*3),3)); const cord=new THREE.Line(cg,new THREE.LineBasicMaterial({color:0x1a1618})); cord.frustumCulled=false; g.add(cord);
  // EACH FRAME you're near (the game's bar tick for her, here): her weight from one foot to the other (singA, singB, singC in turn, blended
  // over a second or two), breathing, singing out to the room; the microphone at her mouth, the amp, the cord a step on; her voice
  const a={pose:'singA',from:null,P:null,B:null,bt:1,bT:1.6,t:0,next:2.5,props:{}};
  SGM.dist=()=>Math.hypot(pos.x-AT.x,pos.z-AT.z); SGM.pan=()=>{ const v=new THREE.Vector3(AT.x,1,AT.z).project(cam); return Math.max(-.8,Math.min(.8,v.x*.8)); };
  SGM.tick=dt=>{ const d=SGM.dist(); if(!MAPG.bodega.visible||d>18){ voxStop(); return; }
    a.t+=dt; a.next-=dt; if(a.next<=0){ a.next=1.8+Math.random()*1.6; const ps=['singA','singB','singC'].filter(p=>p!==a.pose); a.from=a.P?JSON.parse(JSON.stringify(a.P)):null; a.pose=ps[Math.random()*ps.length|0]; a.bt=0; a.bT=1.4+Math.random()*.6; }
    a.bt+=dt; const T=castPose(a.pose), u=a.from?Math.min(1,a.bt/a.bT):1, e=u*u*(3-2*u), P=u<1?R.mix(a.from,T,e):JSON.parse(JSON.stringify(T));
    P.bend+=Math.sin(a.t*1.6)*.5*R.D; P.nod+=Math.sin(a.t*.9)*1.5*R.D; P.look+=Math.sin(a.t*.5)*.25; a.P=P;
    const B=R.settle(R.build(P,null),0); B.props={}; a.B=B; singStep(a,dt);
    PCS.forEach((pc,i)=>FM.set(i,pc.on==='prop'?B.props[pc.n]:R.frameOf(pc.on||pc.n,B)));
    const q=cg.attributes.position.array; a.cord.forEach((c,i)=>{ q[i*3]=c.p.x; q[i*3+1]=c.p.y; q[i*3+2]=c.p.z; }); cg.attributes.position.needsUpdate=true;
    if(SND.ctx&&SND.ctx.state==='running')voxStep(dt,performance.now()); }; }
