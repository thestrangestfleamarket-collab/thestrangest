// ---- THE BEARDED WALKER (owner, 18 Oct 2026, the old game's Walker sprite in six turns, a man with short brown hair and a full beard, a khaki
// tee, slate jeans, brown shoes: "lets add this to the game as a new walker, 3d"): a Walker built as the guitarist is (musBody's pieces, the
// player's own shapes, figureMesh), in the sprite's own colours (the game's RAMP as it was, materials of his own, bw_..., so the player's looks
// never change him), short hair, the rig's beard (the one Walker that wears it: the sprite has it), round eyes, mitten hands (no finger pieces:
// the sprite has none). He walks on the rig's own walk, roaming the whole map as the street's walkers do (ROAM.pick, stfree: npc-map.js), a
// stop now and then, a look round while he stands. Nobody's guard, no mind for you. ?sheet=walker2 his sheet ----
const BWK={}; window.BWK=BWK;   // (a test's reach)
{ const R=RIG, V=R.V, QS=new URLSearchParams(location.search), SHEET=QS.get('sheet')==='walker2', MAT=R.MATS;
  // his colours: the sprite's (the game's RAMP before YOUR LOOKS touched it), four tones each, as materials of his own
  const LOOK={shirt:R.RAMP.shirt,skin:R.RAMP.skin,hair:R.RAMP.hair,pants:R.RAMP.pants,shoes:R.RAMP.shoes,sole:['#3e3226','#352a20','#2a2119','#1c1611'],eye:['#2a2220','#241c1a','#1a1414','#0e0a0a']};
  for(const m in LOOK){ const n='bw_'+m; if(!MAT.includes(n)){ MAT.push(n); W3.ramp.push(LOOK[m].map(h=>new THREE.Color(h))); } }
  const MI=n=>MAT.indexOf(n), MAP={}; for(const m of ['shirt','skin','hair','pants','shoes','sole'])MAP[MI(m)]=MI('bw_'+m); for(const m of ['eye','eyeW','pupil','lid'])if(MI(m)>=0)MAP[MI(m)]=MI('bw_eye');
  const recol=m=>MAP[m];
  // his pieces: the player's shapes (shared, made once) without the other hairstyles, the other eyes or the fingers; his build the game's (no
  // YOUR LOOKS sizes: E null), and the rig's beard and plain hands of his own
  const skip=/^(hairPony|hairLong|hairBun|eyes[1-5]|fing|hand[LR]$)/;
  const PCS=W3.pcs.map(p=>skip.test(p.n)?null:Object.assign({},p,{share:p,E:null,recol})).filter(Boolean);
  R.farOnly(false); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, OWN=R.shell(J,0).filter(p=>p.n==='beard'||/^hand[LR]$/.test(p.n));
  for(const p of OWN){ p.recol=recol; p.E=null; p.share=p; if(p.n==='beard')p.step=.5; }
  PCS.push(...OWN);
  for(const P of PCS)if(!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'bwk'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); BWK.g=g; BWK.tris=FM.tris; BWK.per=FM.per;
  // where he starts: the shops' sidewalk, west of the bodega
  const st={x:BOD.XS(60),z:BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:2,hd:Math.PI/2}, S=R.create(); BWK.st=st; BWK.at=st; st.y=0;
  const free=(x,z)=>stfree(x,z,st.R), turn=a=>{ let e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
  if(typeof NPCS!=='undefined'&&NPCS.extra)NPCS.extra.push(BWK);   // (out of the picture, not drawn: NPCS.cull)
  // HIS SHEET (the owner's rule for a new character: out in a black void, close, his limbs spread): the free camera on him, all else hidden
  if(SHEET){ st.x=BOUND.x1-.5*TILE; st.z=BOD.ZS((BOD.MAP.y0+BOD.MAP.y1)/2); st.hd=Math.PI/4; }
  const spread=()=>{ const P=R.walkPose({ph:0,w:0},null); P.L.ua=[90,80]; P.R.ua=[90,80]; P.L.fa=[0,0]; P.R.fa=[0,0]; return P; };
  BWK.tick=dt=>{ const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;   // (as the guitarist's)
    if(SHEET){ R.farOnly(false); const B=R.settle(R.build(spread(),null),0); PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B)));
      st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1);
      if(!BWK.sheetOn){ BWK.sheetOn=true; UI.setFree(true); UI.camT.set(st.x,st.y+g.scale.y*27,st.z); ppu=ppuTo=PPU*4; window.SHEETTURN=d=>{ yaw=yawTo=d*Math.PI/180; };
        for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s.background&&s.background.isColor)s.background.set(0); r0(s,c); }; } return; }
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
