// ---- THE BEARDED WALKER (owner, 18 Oct 2026, the old game's Walker sprite in six turns, a man with short brown hair and a full beard, a khaki
// tee, slate jeans, brown shoes: "lets add this to the game as a new walker, 3d"): a Walker built as the guitarist is (musBody's pieces, the
// player's own shapes, figureMesh), in the sprite's own colours (the game's RAMP as it was, materials of his own, bw_..., so the player's looks
// never change him), short hair, a beard (the one Walker that wears it: the sprite has it), round eyes, the player's hands and fingers. He walks on the rig's own walk, roaming the whole map as the street's walkers do (ROAM.pick, stfree: npc-map.js), a
// stop now and then, a look round while he stands. Nobody's guard, no mind for you. ?sheet=walker2 his sheet ----
const BWK={}; window.BWK=BWK;   // (a test's reach)
{ const R=RIG, V=R.V, QS=new URLSearchParams(location.search), SHEET=QS.get('sheet')==='walker2', MAT=R.MATS;
  // his colours: the sprite's (the game's RAMP before YOUR LOOKS touched it), four tones each, as materials of his own
  const LOOK={shirt:R.RAMP.shirt,skin:R.RAMP.skin,hair:R.RAMP.hair,pants:R.RAMP.pants,shoes:R.RAMP.shoes,sole:['#3e3226','#352a20','#2a2119','#1c1611'],eye:['#2a2220','#241c1a','#1a1414','#0e0a0a']};
  for(const m in LOOK){ const n='bw_'+m; if(!MAT.includes(n)){ MAT.push(n); W3.ramp.push(LOOK[m].map(h=>new THREE.Color(h))); } }
  const MI=n=>MAT.indexOf(n), MAP={}; for(const m of ['shirt','skin','hair','pants','shoes','sole'])MAP[MI(m)]=MI('bw_'+m); for(const m of ['eye','eyeW','pupil','lid'])if(MI(m)>=0)MAP[MI(m)]=MI('bw_eye');
  const recol=m=>MAP[m];
  // HIS LOOK, SIX WAYS (owner, 18 Oct 2026: "make his feet flat, give him hands and fingers, normal size nose, smaller head, jawline, normal
  // posture"; "give me 6 mockups of possible"): ?bwk=1..6 (LOOKS6). Then "allow to edit all the face and body properties in editor" (his pick:
  // both, with a switch): every one of them is F, his face (kept in the save, 'bwk'), and EB, his pieces' sizes; the avatar editor's WHO:
  // THE BEARDED WALKER edits them (src/avatar.js). head: its size (the head, hair, eyes, nose and beard together, sat onto his neck); nose, noseL:
  // the nose's size and how far it stands out; jaw: the jaw's half width; square: its corners, round 0 to square 1; chin: down and forward;
  // ears, eyes: their sizes; beard: full, boxed (shorter up the cheeks), trim (thin), stubble, none; h: his height
  const LOOKS6=[null,{head:.88,nose:.62,jaw:5.6,square:.5,beard:'full'},{head:.85,nose:.6,jaw:5.9,square:1,beard:'boxed'},{head:.85,nose:.6,jaw:5.6,square:.85,beard:'trim'},
    {head:.82,nose:.55,jaw:5.7,square:1,beard:'stubble'},{head:.78,nose:.6,jaw:5.4,square:.6,beard:'full'},{head:.9,nose:.7,jaw:5.3,square:.15,beard:'trim'}];
  const F0={shape:'round',head:.88,nose:.62,noseL:0,jaw:5.6,square:.5,chin:0,ears:1,eyes:1,beard:'full',h:1};
  let kept=null; try{ kept=JSON.parse(SAVE.get('bwk')||'null'); }catch(e){}
  const F=BWK.F=Object.assign({},F0,kept&&kept.F,LOOKS6[+QS.get('bwk')]||{}), EB=BWK.EB=(kept&&kept.EB)||{}; BWK.LOOKS6=LOOKS6; BWK.F0=F0;
  BWK.save=()=>{ try{ SAVE.set('bwk',JSON.stringify({F,EB})); }catch(e){} };
  // his pieces: the player's shapes (shared, made once) without the other hairstyles or eyes; his hands and fingers the player's; his build the
  // game's, sized by EB; his own head (the jaw, the nose, the ears), eyes, beard and flat-soled shoes, made from F
  const skip=/^(hair|eyes\d|head$|shoe[LR]$)/, HEADP=/^(head|hair|eyes|beard)/;
  R.farOnly(false); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, H=J.head, {rbox,rcone,ell,add}=R;
  const HAIR0=W3.pcs.find(p=>p.n==='hair'), SHOE0=W3.pcs.filter(p=>/^shoe[LR]$/.test(p.n)), EYE0=W3.pcs.find(p=>p.n==='eyes0');
  const E1=()=>({s:[1,1,1],o:[0,0,0],q:[0,0,0,1]}), EH={s:[1,1,1],o:[0,0,0],q:[0,0,0,1]};
  BWK.E=n=>HEADP.test(n)?null:(EB[n]||(EB[n]=E1()));   // (a piece's sizes for the editor's sliders; the head's are F.head)
  const pieces=()=>{ const PCS=W3.pcs.map(p=>skip.test(p.n)?null:Object.assign({},p,{share:p,recol})).filter(Boolean);
    // the head's shape (ED.HEADS, as yours: src/editor.js): every piece on his head drawn through warp, the point brought back to the round head
    const HS=ED.HEADS[F.shape]||ED.HEADS.round, cr=4.6*(1-.75*HS.sq), m=Math.min(HS.w,HS.h,HS.d), warp=p=>{ const y=(p.y-H.y)/HS.h; return V(H.x+(p.x-H.x)/(HS.w*(1+HS.tp*y/8)),H.y+y,H.z+(p.z-H.z)/HS.d); };
    const W=f=>p=>f(warp(p))*m, cran=p=>rbox(p,H,V(6.0,7.8,6.3),cr);
    const jr=2.2-1.5*F.square, cy=-4.6-.8*F.chin, cz=1.3+.8*F.chin, jaw=p=>rbox(p,add(H,V(0,cy,cz)),V(F.jaw,3.3+.5*Math.abs(F.chin),5.0),jr), n=F.nose, ea=F.ears;
    const head={n:'head',m:'bw_skin',bb:[H.x-13,H.x+13,H.y-16,H.y+12,H.z-12,H.z+13],step:.5,
      d:W(p=>Math.min(cran(p),jaw(p),rcone(p,add(H,V(0,-6,1.6)),add(H,V(0,-10.5,0.2)),2.4,2.2),ell(p,add(H,V(6.7,-1.8,-1.0)),V(1.3*ea,1.9*ea,1.3*ea)),ell(p,add(H,V(-6.7,-1.8,-1.0)),V(1.3*ea,1.9*ea,1.3*ea)),
        rbox(p,add(H,V(0,-2.6+(1-n)*.6,5.9+1.25*n*.7+.6*F.noseL)),V(.95*n,1.75*n,1.25*n*(1+.4*F.noseL)),.45*n)))};   // (the nose: the player's, its size n, out by noseL)
    const hair={...HAIR0,share:null,recol,d:W(p=>Math.min(HAIR0.d(p),Math.max(cran(p)-.7,H.y-2.2-p.y,p.z-(H.z+3.2))))};   // (the player's short hair, and a cap over the squared corners)
    const T={full:[.9,4.1],boxed:[.9,4.7],trim:[.45,4.4],stubble:[.22,4.6]}[F.beard], lips=p=>Math.abs(p.x-H.x)<1.9&&p.y>H.y+cy-1.1&&p.y<H.y+cy-.1&&p.z>H.z+3;
    const beard=T&&{n:'beard',on:'head',m:'bw_hair',bb:head.bb,step:.5,d:W(p=>Math.max(Math.min(rbox(p,add(H,V(0,-.9,.2)),V(6.0+T[0],7.8+T[0],6.3+T[0]),cr+T[0]),jaw(p)-T[0]),H.z-1.2-p.z,p.y-(H.y-T[1]))),
      paint:p=>lips(warp(p))?'bw_skin':null};   // (the mouth: skin showing through, as the sprite has it)
    const e=F.eyes, eyes=Object.assign({},EYE0,{share:null,recol,bb:[H.x-7,H.x+7,H.y-3,H.y+5,H.z+1,H.z+12],d:W(p=>{ const cx=H.x+Math.sign(p.x-H.x)*2.35, cy2=H.y+.7, q=V(cx+(p.x-cx)/e,cy2+(p.y-cy2)/e,p.z); return EYE0.d(q)*Math.min(1,e); }),
      paint:p=>{ p=warp(p); const cx=H.x+Math.sign(p.x-H.x)*2.35, cy2=H.y+.7; return EYE0.paint(V(cx+(p.x-cx)/e,cy2+(p.y-cy2)/e,p.z)); }});   // (the player's round eyes, each about its own middle)
    const shoes=SHOE0.map(p=>({...p,d:q=>Math.max(p.d(q),.45-q.y),m:'bw_shoes',paint:q=>q.y<1.15?'bw_sole':null,share:null}));   // (flat soles: the round of the shoe's foot cut level)
    PCS.push(head,hair,eyes,...shoes); if(beard)PCS.push(beard);
    for(const p of PCS){ p.E=HEADP.test(p.n)?EH:BWK.E(p.n); if(/^(shin|shoe)[LR]$/.test(p.n)){ p.share=null; p.cell=.9; } }   // (the trousers' hems and the shoes clean: finer than the body's half)
    return PCS; };
  let PCS=pieces(); for(const P of PCS)if(!P.share||!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  let FM=figureMesh(PCS,'bwk'); const g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); BWK.g=g; BWK.tris=FM.tris; BWK.per=FM.per;
  // made again from F (the editor's face sliders, on letting go; a quarter second or so): the new mesh in the old one's place
  BWK.remake=()=>{ const old=FM.me; PCS=pieces(); FM=figureMesh(PCS,'bwk'); g.remove(old); old.geometry.dispose(); g.add(FM.me); BWK.tris=FM.tris; BWK.per=FM.per; BWK.save(); };
  // his head's size, sat down onto his neck and back over it (an upright posture), each frame from F.head
  const headE=()=>{ const k=F.head; EH.s[0]=EH.s[1]=EH.s[2]=k; EH.o[1]=-(1-k)*10; EH.o[2]=-1.4; };
  // where he starts: the shops' sidewalk, west of the bodega
  const st={x:BOD.XS(60),z:BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:2,hd:Math.PI/2}, S=R.create(); BWK.st=st; BWK.at=st; st.y=0;
  const free=(x,z)=>stfree(x,z,st.R), turn=a=>{ let e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
  if(typeof NPCS!=='undefined'&&NPCS.extra)NPCS.extra.push(BWK);   // (out of the picture, not drawn: NPCS.cull)
  // HIS SHEET (the owner's rule for a new character: out in a black void, close, his limbs spread): the free camera on him, all else hidden
  if(SHEET){ st.x=BOD.XS(100); st.z=BOD.ZS((BOD.MAP.y0+BOD.MAP.y1)/2); st.hd=Math.PI/4; }
  const BLACK=new THREE.Color(0), spread=()=>{ const P=R.walkPose({ph:0,w:0},null); const D=R.D; P.L.ua=[0,65*D]; P.R.ua=[0,65*D]; P.L.fa=[0,70*D]; P.R.fa=[0,70*D]; return P; };
  BWK.tick=dt=>{ const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;   // (as the guitarist's)
    if(SHEET){ R.farOnly(false); const B=R.settle(R.build(spread(),null),0); PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B)));
      st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; headE(); musScale(g,F.h);
      if(!BWK.sheetOn){ BWK.sheetOn=true; UI.setFree(true); UI.camT.set(st.x,st.y+g.scale.y*27,st.z); ppu=ppuTo=PPU*4; window.SHEETTURN=d=>{ yaw=yawTo=d*Math.PI/180; }; window.SHEETZOOM=k=>{ ppu=ppuTo=PPU*k; };
        for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; for(const c of scene.children)if(!c.isLight&&!c.isCamera&&c!==MAPG.bodega)c.visible=false;   // (the skyline, the sky, the clouds too)
        const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s===scene){ s.background=BLACK; s.fog=null; } r0(s,c); }; } return; }
    if(BWK.hold){ S.target=0; st.to=null; const f=BWK.hold; st.x=f.x; st.z=f.z; st.hd=f.hd; }   // (held in front of you while the avatar editor has him: src/avatar.js)
    else if(!free(st.x,st.z)){ for(let k=0;k<80;k++){ const a=k*2.4, r=(k>>2)*.25*TILE; if(free(st.x+Math.sin(a)*r,st.z+Math.cos(a)*r)){ st.x+=Math.sin(a)*r; st.z+=Math.cos(a)*r; break; } } }   // (the street's solids come after the game opens: his spot cleared as it goes)
    // where next: a stroll or a walk across the map (ROAM.pick), a while standing between
    if(!st.to&&!BWK.hold){ S.target=0; st.wait-=dt;
      if(st.wait<=0&&!ROAM.pick(st,(x,z)=>free(x,z)))st.wait=1; }
    if(st.to&&!BWK.hold){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez);
      if(d<.15*TILE){ st.to=st.next||null; st.next=null; if(!st.to)st.wait=2+Math.random()*6; }
      else{ const e=turn(Math.atan2(ex,ez)); st.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*4); S.target=Math.abs(e)<.6?1:0; } }
    const d0=S.dist; R.step(S,dt); const go=(S.dist-d0)*W3.SZ/PPU;
    if(go>0&&!BWK.hold){ const nx=st.x+Math.sin(st.hd)*go, nz=st.z+Math.cos(st.hd)*go;
      if(free(nx,nz)){ st.x=nx; st.z=nz; } else { st.to=null; st.next=null; st.wait=.5+Math.random(); } }   // (blocked: stop, then somewhere else)
    st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; headE(); musScale(g,F.h);
    if(!near||!MAPG.bodega.visible||BWK.hid)return;   // (far or unseen: moved, not posed)
    R.farOnly(false); const B=R.pose(S,true); BWK.B=B; PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B))); };
}
