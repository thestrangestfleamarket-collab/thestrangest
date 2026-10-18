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
  // posture"; "give me 6 mockups of possible"): ?bwk=1..6. k: his head's size (the head, hair, eyes, nose and beard together); ns: the nose;
  // jw, jr: the jaw's half width and how square its corners (smaller, sharper); beard: full, boxed (shorter up the cheeks), trim (thin), stubble
  const LOOKS6=[null,{k:.88,ns:.62,jw:5.6,jr:1.6,beard:'full'},{k:.85,ns:.6,jw:5.9,jr:1.0,beard:'boxed'},{k:.85,ns:.6,jw:5.6,jr:1.2,beard:'trim'},
    {k:.82,ns:.55,jw:5.7,jr:.9,beard:'stubble'},{k:.78,ns:.6,jw:5.4,jr:1.4,beard:'full'},{k:.9,ns:.7,jw:5.3,jr:2.0,beard:'trim'}];
  const LK=LOOKS6[+QS.get('bwk')]||LOOKS6[1]; BWK.look=LK;
  // his pieces: the player's shapes (shared, made once) without the other hairstyles or eyes; his hands and fingers the player's; his build the
  // game's (no YOUR LOOKS sizes: E null); his own head (the jaw, the nose), beard and flat-soled shoes
  const skip=/^(hairPony|hairLong|hairBun|eyes[1-5]|head$|shoe[LR]$)/, HEADP=/^(head|hair|eyes|beard)/;
  const PCS=W3.pcs.map(p=>skip.test(p.n)?null:Object.assign({},p,{share:p,E:null,recol})).filter(Boolean);
  R.farOnly(false); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, H=J.head, {rbox,rcone,ell,add}=R;
  const jaw=p=>rbox(p,add(H,V(0,-4.6,1.3)),V(LK.jw,3.3,5.0),LK.jr), n=LK.ns;
  const head={n:'head',m:'bw_skin',bb:[H.x-11,H.x+11,H.y-14,H.y+11,H.z-11,H.z+11],step:.5,
    d:p=>Math.min(rbox(p,H,V(6.0,7.8,6.3),4.6),jaw(p),rcone(p,add(H,V(0,-6,1.6)),add(H,V(0,-10.5,0.2)),2.4,2.2),ell(p,add(H,V(6.7,-1.8,-1.0)),V(1.3,1.9,1.3)),ell(p,add(H,V(-6.7,-1.8,-1.0)),V(1.3,1.9,1.3)),
      rbox(p,add(H,V(0,-2.6+(1-n)*.6,5.9+1.25*n*.7)),V(.95*n,1.75*n,1.25*n),.45*n))};   // (the nose: the player's, its size n)
  const T={full:[.9,4.1],boxed:[.9,4.7],trim:[.45,4.4],stubble:[.22,4.6]}[LK.beard], lips=p=>Math.abs(p.x-H.x)<1.9&&p.y>H.y-5.7&&p.y<H.y-4.7&&p.z>H.z+3;
  const beard={n:'beard',on:'head',m:'bw_hair',bb:head.bb,step:.5,d:p=>Math.max(Math.min(rbox(p,add(H,V(0,-.9,.2)),V(6.0+T[0],7.8+T[0],6.3+T[0]),4.6+T[0]),jaw(p)-T[0]),H.z-1.2-p.z,p.y-(H.y-T[1])),
    paint:p=>lips(p)?'bw_skin':null};   // (the mouth: skin showing through, as the sprite has it)
  const shoes=W3.pcs.filter(p=>/^shoe[LR]$/.test(p.n)).map(p=>({...p,d:q=>Math.max(p.d(q),.45-q.y),m:'bw_shoes',paint:q=>q.y<1.15?'bw_sole':null,share:null,E:null}));   // (flat soles: the round of the shoe's foot cut level)
  PCS.push(head,beard,...shoes);
  const EH={s:[LK.k,LK.k,LK.k],o:[0,-(1-LK.k)*10,-1.4],q:[0,0,0,1]}; for(const p of PCS)if(HEADP.test(p.n))p.E=EH;   // (a smaller head, sat down onto his neck and back over it: an upright posture)
  for(const p of PCS)if(/^(shin|shoe)[LR]$/.test(p.n)){ p.share=null; p.cell=.9; }   // (the trousers' hems and the shoes clean: finer than the body's half)
  for(const P of PCS)if(!P.share||!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'bwk'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); BWK.g=g; BWK.tris=FM.tris; BWK.per=FM.per;
  // where he starts: the shops' sidewalk, west of the bodega
  const st={x:BOD.XS(60),z:BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:2,hd:Math.PI/2}, S=R.create(); BWK.st=st; BWK.at=st; st.y=0;
  const free=(x,z)=>stfree(x,z,st.R), turn=a=>{ let e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
  if(typeof NPCS!=='undefined'&&NPCS.extra)NPCS.extra.push(BWK);   // (out of the picture, not drawn: NPCS.cull)
  // HIS SHEET (the owner's rule for a new character: out in a black void, close, his limbs spread): the free camera on him, all else hidden
  if(SHEET){ st.x=BOD.XS(100); st.z=BOD.ZS((BOD.MAP.y0+BOD.MAP.y1)/2); st.hd=Math.PI/4; }
  const BLACK=new THREE.Color(0), spread=()=>{ const P=R.walkPose({ph:0,w:0},null); const D=R.D; P.L.ua=[0,65*D]; P.R.ua=[0,65*D]; P.L.fa=[0,70*D]; P.R.fa=[0,70*D]; return P; };
  BWK.tick=dt=>{ const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;   // (as the guitarist's)
    if(SHEET){ R.farOnly(false); const B=R.settle(R.build(spread(),null),0); PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B)));
      st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1);
      if(!BWK.sheetOn){ BWK.sheetOn=true; UI.setFree(true); UI.camT.set(st.x,st.y+g.scale.y*27,st.z); ppu=ppuTo=PPU*4; window.SHEETTURN=d=>{ yaw=yawTo=d*Math.PI/180; }; window.SHEETZOOM=k=>{ ppu=ppuTo=PPU*k; };
        for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; for(const c of scene.children)if(!c.isLight&&!c.isCamera&&c!==MAPG.bodega)c.visible=false;   // (the skyline, the sky, the clouds too)
        const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s===scene){ s.background=BLACK; s.fog=null; } r0(s,c); }; } return; }
    if(!free(st.x,st.z)){ for(let k=0;k<80;k++){ const a=k*2.4, r=(k>>2)*.25*TILE; if(free(st.x+Math.sin(a)*r,st.z+Math.cos(a)*r)){ st.x+=Math.sin(a)*r; st.z+=Math.cos(a)*r; break; } } }   // (the street's solids come after the game opens: his spot cleared as it goes)
    // where next: a stroll or a walk across the map (ROAM.pick), a while standing between
    if(!st.to){ S.target=0; st.wait-=dt;
      if(st.wait<=0&&!ROAM.pick(st,(x,z)=>free(x,z)))st.wait=1; }
    if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez);
      if(d<.15*TILE){ st.to=st.next||null; st.next=null; if(!st.to)st.wait=2+Math.random()*6; }
      else{ const e=turn(Math.atan2(ex,ez)); st.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*4); S.target=Math.abs(e)<.6?1:0; } }
    const d0=S.dist; R.step(S,dt); const go=(S.dist-d0)*W3.SZ/PPU;
    if(go>0){ const nx=st.x+Math.sin(st.hd)*go, nz=st.z+Math.cos(st.hd)*go;
      if(free(nx,nz)){ st.x=nx; st.z=nz; } else { st.to=null; st.next=null; st.wait=.5+Math.random(); } }   // (blocked: stop, then somewhere else)
    st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1);
    if(!near||!MAPG.bodega.visible||BWK.hid)return;   // (far or unseen: moved, not posed)
    R.farOnly(false); const B=R.pose(S,true); BWK.B=B; PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B))); };
}
