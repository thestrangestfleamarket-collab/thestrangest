import os
# the game's own code, read as data (its objects' makers, colours and layouts): a checkout of bralynnb/tsfm beside this one, or GAME_SRC
S=os.environ.get('GAME_SRC',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','tsfm','src'))+'/'
os.chdir(os.path.dirname(os.path.abspath(__file__)))
rd=lambda f:open(f).read()
def body(f,start,end):
    t=rd(f); i=t.index(start); j=t.rindex(end); return t[i:j]
stn=body('src/station.js','{ // the game\'s helpers','\nscene.background').replace('/*WSUB*/',rd('src/wsub.js'))
def rq(s,a,b):
    assert s.count(a)==1,a[:80]; return s.replace(a,b)
stn=rq(stn,"const X=x=>(x-OX)*TILE, Z=y=>(y-OY)*TILE, Y=z=>(z-SZ)*ZU;","const X=x=>(x-OX)*TILE+STN.DX, Z=y=>(y-OY)*TILE+STN.DZ, Y=z=>(z-SZ)*ZU+STN.DY;")
stn=rq(stn,"const gx=x/TILE+OX, gy=z/TILE+OY; if(gx<PLAT)","const gx=(x-STN.DX)/TILE+OX, gy=(z-STN.DZ)/TILE+OY; if(gx<PLAT)")
stn=rq(stn,"fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt+SZ))]);","fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt+SZ)-STN.DY)]);")
stn=rq(stn,"cutaway(wallX(END,AVE,PLAT,0,UH,conc),0,-1,8);","cutaway(wallX(END,AVE,PLAT,0,UH,(u,z)=>u>=-29&&u<-25?null:conc(u,z)),0,-1,8);")
stn=rq(stn,"solid(AVE,END,PLAT,END+1,UH);","solid(AVE,END,-29,END+1,UH); solid(-25,END,PLAT,END+1,UH);")
pool=body('src/pool.js','{ const hash=','\nscene.background')
pool=rq(pool,"const X=x=>(x-OX)*TILE, Z=y=>(y-OY)*TILE, Y=z=>z*ZU;","const X=x=>(x-OX)*TILE+PDX, Z=y=>(y-OY)*TILE+PDZ, Y=z=>z*ZU;")
pool=rq(pool,"const gx=x/TILE+OX-P.bx0, gy=z/TILE+OY-P.by0;","const gx=(x-PDX)/TILE+OX-P.bx0, gy=(z-PDZ)/TILE+OY-P.by0;")
pool=rq(pool,"cutaway(wallX(P.y1,P.x0,P.x1,0,P.H,(u,z)=>poolTile(u,z)),0,-1,10);","cutaway(wallX(P.y1,P.x0,P.x1,0,P.H,(u,z)=>u>=17.4&&u<18.6&&z<72?null:poolTile(u,z)),0,-1,10);")
pool=rq(pool,"solid(P.x0,P.y1,P.x1,P.y1+1,P.H);","solid(P.x0,P.y1,17.4,P.y1+1,P.H); solid(18.6,P.y1,P.x1,P.y1+1,P.H);")
game=['23-w-bodega-shop.js','23-w-street-1-kit.js','23-w-street-2-furniture.js','23-w-street-3-city.js','23-w-street-4-catalog.js','23-w-studio-apartment-1-furniture.js','23-w-studio-apartment-2-computer.js','23-w-studio-apartment-3-rooms.js','23-x-laundry-room.js']
kit=rd('src/gamekit.js')+'\n'+'\n'.join('// ==== '+f+' (the game\'s, word for word)\n'+rd(S+f) for f in game)
bod=rd('src/bodega.js')
i=bod.index('const BOD={'); bod=bod[i:]
bod=rq(bod,"const BOD={meshes:[], walls:{}, lamps:[]};","BOD={meshes:[], walls:{}, lamps:[]};").replace('/*GAMEKIT*/',kit).replace('/*GOODS*/',rd('src/goods-defs.js'))
bb=rq(rd('src/bodbuild.js'),"const BODB={};","BODB={};")
wrap=lambda name,code,out,cutwhen: ("grab('%s',()=>{ const solids=SOL.%s, fixed=FIX.%s, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;\n"%(name,'down' if name=='down' else 'up','down' if name=='down' else 'up'))+code+"\n"+out+"\n for(const w of cutWalls.slice(c0))if(!w.when)w.when="+cutwhen+"; for(const L of SHL)L.removeFromParent(); });\n"
MAPST=(rd('src/map-pre.js')+'\n'+rd('src/batch.js')+'\n'+rd('src/water3d.js')+'\n'
  +wrap('down',stn,"MODS.station={BOUND,ground:(x,z)=>groundY(x,z)+STN.DY};","()=>LVL==='down'")
  +wrap('bodega',bod+'\n'+bb,"MODS.bodega={BOUND,ground:groundY};","()=>BODB.inside()")
  +wrap('pool',pool+'\nWATER.build();',"MODS.pool={BOUND,cut:cutWalls.slice(c0),inside:(x,z)=>x>POOLR.X(POOLR.x0)&&x<POOLR.X(POOLR.x1)&&z>POOLR.Z(POOLR.y0)&&z<POOLR.Z(POOLR.y1)};","()=>MODS.pool.inside(pos.x,pos.z)")
  +rd('src/map-post.js'))
f=open('src/flea-market-3d.html').read()  # (carries the simpler Walker)
st=MAPST
i=f.index('<script type="module">'); head,mod=f[:i],f[i:]
def rp(s,a,b):
    assert s.count(a)==1,a[:80]; return s.replace(a,b)
head=rp(head,'<title>Flea Market in 3D</title>','<title>The Market</title>')
head=rp(head,'<h1>FLEA MARKET · THREE.JS TEST</h1>','<h1>THE MARKET</h1>')
head=rp(head,'<div><b>N</b> day / night · <b>-</b> / <b>=</b> pixel size</div>','<div><b>-</b> / <b>=</b> pixel size</div>')
head=rp(head,'{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}','{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}')
a=mod.index('// ---- collision: boxes on the ground plan'); b=mod.index('// ---- the walker: the game\'s own rig')
mod=mod[:a]+st+'\n'+mod[b:]
# no market things
a=mod.index('const crate=(x,z,s,y=0)=>'); b=mod.index('looseDraw();\nlet looseAcc')
mod=mod[:a]+mod[b:]
mod=rp(mod,"const pos=new THREE.Vector3(0,0,14); let heading=0.8, py=0;","const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0;")
mod=rp(mod,"import * as THREE from 'three';","""import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';""")
# halation: the glowing things (the LED boards, the signs, the train's lamps) bloom, at the low resolution, so the glow is pixels too
mod=rp(mod,"const scene=new THREE.Scene();","""const scene=new THREE.Scene();
let composer=null, bloom=null;""")
mod=rp(mod,"renderer.setSize(RW,RH,false);","renderer.setSize(RW,RH,false); if(composer){ composer.setSize(RW,RH); bloom.resolution.set(RW,RH); }")
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);","""composer=new EffectComposer(renderer); composer.setPixelRatio(1); composer.addPass(new RenderPass(scene,cam));
bloom=new UnrealBloomPass(new THREE.Vector2(256,256),1.3,0.6,0.62); composer.addPass(bloom); composer.addPass(new OutputPass());
resize(); applyTime(0); requestAnimationFrame(frame);""")
mod=rp(mod,"  renderer.render(scene,cam);\n","""  // the game's cutaway: a wall between him and the camera is cut down to its foot
  for(const w of cutWalls)w.pl.constant=(Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05&&pitch<1.45)?w.foot:1e6;
  composer.render();\n""")
mod=rp(mod,"renderer.setPixelRatio(1);","renderer.setPixelRatio(1); renderer.localClippingEnabled=true; renderer.shadowMap.autoUpdate=false;")
mod=rp(mod,"youMat.color.setRGB(1,1,1).lerp(C1.setHex(0x6c7699),night).lerp(C2.setHex(0xffd9a0),Math.max(0,lampW)*night*0.8);   // the night and the lamps on his picture",
"youMat.color.setRGB(.42,.44,.5).lerp(C2.setRGB(.86,.9,1),Math.max(0,lampW)*0.8);   // the station's cool light on his picture: brighter under a lamp")
mod=rp(mod,"lampW=Math.max(lampW,1-d/7);","lampW=Math.max(lampW,1-d/6);")
mod=rp(mod,"const cut=Math.cos(a)<0?0.14:1; for(const sg of shopGroups)","for(const sg of shopGroups)")

# THE WALKER IN 3D (the subway only): the rig that hands out his resting pose; his pieces as meshes; the card hidden; the outline pass
rig=open('src/walker-rig-mock.js').read(); i=head.index('// THE WALKER, JOINTED'); j=head.index("if(typeof module!=='undefined') module.exports=RIG;")
head=head[:i]+rig[rig.index('// THE WALKER, JOINTED'):rig.index("if(typeof module!=='undefined') module.exports=RIG;")]+head[j:]
mod=rp(mod,"import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';","import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';\nimport {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';")
mod=rp(mod,"const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0;","const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0; you.visible=false;\n"+open('src/walker3d.js').read()+"\nOUTL.hidden=()=>cutWalls.filter(w=>w.pl.constant<1e5).map(w=>w.me);")
mod=rp(mod,"""  RIG.viewPitch(null); RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);                  // upright, as the game draws him: his body for the physics
  RIG.viewPitch(pitch); RIG.draw(B,cloud,hdA,pimg,PW,PICH,AX,AY,1,false); RIG.viewPitch(null);   // as the camera sees him, at its tilt
  new Uint32Array(pdata.data.buffer).set(pimg); pg.putImageData(pdata,0,0); ptex.needsUpdate=true;""","""  if(loose.length)RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);   // (his upright picture, his body for the physics: only where there are loose things to push)
  W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU);            // he himself: his pieces where his skeleton has them, in the scene""")
mod=rp(mod,"youMat.color.setRGB(.42,.44,.5).lerp(C2.setRGB(.86,.9,1),Math.max(0,lampW)*0.8);","W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(0,lampW)*0.9);   // (lit as the game lights a character: the light where he stands, never past his own colours)")
mod=rp(mod,"composer.addPass(new RenderPass(scene,cam));","composer.addPass(new RenderPass(scene,cam)); { const sp=new ShaderPass(OUTL.pass); composer.addPass(sp); OUTL.pass.uniforms=sp.uniforms; sp.uniforms.tId.value=OUTL.rt.texture; sp.uniforms.tint.value=W3.tint; }   // (the pass copies its uniforms and drops a render target's picture: given back, and the tint shared)")
mod=rp(mod,"  composer.render();\n","  renderer.shadowMap.needsUpdate=true; W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();   // (the lamps' shadows drawn once a frame, not for every pass)\n")
# THE GAME'S SHADOWS MENU (44-camera-input's): on or off, and shaded, self or full; on and self to begin with
head=rp(head,'<div id="stat">--</div>','<div id="stat">--</div>\n<div id="shd"><span class="k">SHADOWS</span><button type="button" data-s="on">ON</button><button type="button" data-l="1">SHADED</button><button type="button" data-l="2">SELF</button><button type="button" data-l="3">FULL</button></div>')
head=rp(head,'#stat{','#shd{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;gap:6px;align-items:center;font:12px var(--pixel);color:var(--fg);background:var(--panel);border:2px solid var(--line);padding:8px 10px}\n#shd .k{margin-right:6px}#shd button{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 9px;cursor:pointer}#shd button[aria-pressed="true"]{color:var(--key);border-color:#6b6f80}\n#stat{')
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",'''{ const SH={on:true,lv:2}, el=document.getElementById('shd'), draw=()=>{ W3.lv.value=SH.on?(SH.lv>=2?2:1):0; el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s?String(SH.on):String(SH.on&&SH.lv===+b.dataset.l))); el.querySelector('[data-s]').textContent=SH.on?'ON':'OFF'; };
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(b.dataset.s)SH.on=!SH.on; else{ SH.lv=+b.dataset.l; SH.on=true; } b.blur(); draw(); }); draw(); }   // (full: self, as the game has it for a character)
resize(); applyTime(0); requestAnimationFrame(frame);''')
mod=rp(mod,"  let lampW=0; for(const L of lamps){","  { const nb=lamps.map((L,i)=>[Math.hypot(L.position.x-pos.x,L.position.z-pos.z),i]).sort((p,q)=>p[0]-q[0]); lamps.forEach(L=>L.intensity=LAMPI); nb.slice(0,2).forEach(([,i],k)=>{ SHL[k].position.copy(lamps[i].position); lamps[i].intensity=0; }); }   // (the two lamps nearest him: their shadow-casting stand-ins lit in their place)\n  let lampW=0; for(const L of lamps){")
print('ok base')

# PIXELS THAT GROW WITH THE ZOOM (owner, 16 Oct 2026: "keep this level of res on every zoom", his pick "pixels grow with zoom"): as the game draws,
# a tile is always the same number of pixels; zooming in makes every pixel bigger, by whole screen pixels (so the zoom goes in steps), never adds detail
mod=rp(mod,"  RW=Math.ceil(pw/PXS/2)*2; RH=Math.ceil(ph/PXS/2)*2;","  const S=pxS(); SCL=S; RW=Math.ceil(pw/S/2)*2; RH=Math.ceil(ph/S/2)*2;")
mod=rp(mod,"const c=renderer.domElement, cw=RW*PXS/dpr, ch=RH*PXS/dpr;","const c=renderer.domElement, cw=RW*S/dpr, ch=RH*S/dpr;")
mod=rp(mod,"let ppu=PPU;                                    // the zoom: screen pixels per world unit (the wheel)\nfunction frustum(){ cam.left=-RW/2/ppu; cam.right=RW/2/ppu; cam.top=RH/2/ppu; cam.bottom=-RH/2/ppu; cam.updateProjectionMatrix(); }",
"""let ppu=PPU, SCL=1, RESI=2;                     // the zoom (the wheel); SCL: screen pixels to a picture pixel now; RESI: the art's fineness (- and =)
// SHARPER AT WILL (owner, 16 Oct 2026: "allow the game to go more res if i press = more times, however sharp res it can go"): the art's own
// pixels a world unit, the game's times RES (- coarser, = finer, as far as one screen pixel each: the sharpest the screen can show); the
// zoom then makes them bigger by whole screen pixels, so the zoom goes in steps
const RESL=[.5,.75,1,1.5,2,3,4,6,8,12,16], RES=()=>RESL[RESI], V0=PPU*PXS;   // (V0: screen pixels a world unit at zoom 1, as it opened)
// NEVER SHARPER ZOOMED OUT (owner, 17 Oct 2026: "when i zoom out i dont want it to get this sharp ... never sharper than this resolution"): a
// pixel is never smaller on screen than it is at the opening zoom for the sharpness chosen (MINPX); zoomed out past that, each pixel keeps its
// size and takes in more of the world, instead of the picture getting finer; the limit one step sharper than the opening's ("1 sharper
// resolution than that at that level"): the next sharpness's pixel
const MINPX=()=>Math.max(1,Math.round(PXS/RESL[Math.min(RESL.length-1,RESI+1)]));
const vpu=()=>V0*ppu/PPU, art=()=>PPU*RES(), pxS=()=>Math.max(MINPX(),Math.round(vpu()/art())), rppu=()=>Math.round(vpu()/art())<MINPX()?vpu()/pxS():art();
function frustum(){ const u=rppu(); cam.left=-RW/2/u; cam.right=RW/2/u; cam.top=RH/2/u; cam.bottom=-RH/2/u; cam.updateProjectionMatrix(); }""")
mod=rp(mod,"ppu*=Math.pow(ppuTo/ppu,ease); frustum();","ppu*=Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)resize(); else frustum();")
mod=rp(mod,"zoom ${(ppu/PPU).toFixed(2)}×`","zoom ${(SCL*rppu()/V0).toFixed(2)}× · art ${SCL===1&&vpu()<art()?'full':RES()+'×'}`")
mod=rp(mod,"if(k==='-'||k==='_'){PXS=Math.min(12,PXS+1);resize();} if(k==='='||k==='+'){PXS=Math.max(1,PXS-1);resize();}",
  "if(k==='-'||k==='_'){RESI=Math.max(0,RESI-1);resize();} if(k==='='||k==='+'){ if(pxS()>1||vpu()>art())RESI=Math.min(RESL.length-1,RESI+1); resize(); }   // (= finer until each is one screen pixel)")
head=rp(head,'<div><b>-</b> / <b>=</b> pixel size</div>','<div><b>-</b> / <b>=</b> coarser / sharper</div>')
print('ok zoom')

# THE OWNER'S CHARACTERS FROM HIS MODELS (owner, 16 Oct 2026): the goldfish and the bear, coloured, wandering the platform
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);","const GOLDFISH="+open('data/goldfish.json').read()+";\nconst BEARD="+open('data/bear.json').read()+";\n"+open('src/npc-map.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")
mod=rp(mod,"  marker.visible=!!target;","  for(const N of NPCS)N.tick(dt,pos);\n  marker.visible=!!target;")
mod=rp(mod,"function collide(p){ const r=0.3;","function collide(p){ if(typeof NPCS!=='undefined'&&LVL==='down')for(const N of NPCS)N.push(p); const r=0.3;")
print('ok npcs')


# THE MAP'S OWN EACH FRAME: the level you're on; the lamps lit on it, the two nearest you casting your shadow; a room's walls cut while you're in it
# and its roof gone; the lamps' still shadows drawn once (without you); the pool's water only while you're near it; its floats; swimming
mod=rp(mod,"  if(keys.has('q'))yawTo+=dt*1.8;","  if(MAPLV(py,pos))setPhys(LVL);   // (the level you're on: its walls, its ground, its places)\n  if(keys.has('q'))yawTo+=dt*1.8;")
mod=rp(mod,"PHYROOMS=[{on:true,x0:-1e9,x1:1e9,y0:-1e9,y1:1e9,st:STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ])}];",
 "PHYROOMS=[{on:true,x0:-1e9,x1:1e9,y0:-1e9,y1:1e9,st:STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ])}];\nfunction setPhys(lv){ STATIC=FIX[lv].map(([x0,z0,y0,x1,z1,y1])=>[x0/TL,-z1/TL,y0/TL,x1/TL,-z0/TL,y1/TL]); PHYROOMS[0].st=STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ]); }   // (the ragdoll's room: his level's things)")
mod=rp(mod,"lamps.forEach(L=>L.intensity=LAMPI); nb.slice(0,2).forEach(([,i],k)=>{ SHL[k].position.copy(lamps[i].position); lamps[i].intensity=0; });",
 "lamps.forEach(L=>L.intensity=L.userData.i0??LAMPI); SHL.forEach(S=>S.intensity=0); nb.filter(([,i])=>lamps[i].parent&&lamps[i].parent.visible).slice(0,2).forEach(([,i],k)=>{ const L=lamps[i], S=SHL[k]; S.position.copy(L.position); S.color.copy(L.color); S.intensity=L.userData.i0??LAMPI; S.distance=L.distance; S.decay=L.decay; L.intensity=0; });")
mod=rp(mod,"for(const w of cutWalls)w.pl.constant=(Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05&&pitch<1.45)?w.foot:1e6;",
 "for(const w of cutWalls)w.pl.constant=(Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05&&pitch<1.45&&(!w.when||w.when()))?w.foot:1e6;   // (only the room you're in)\n  for(const r of BODB.roof)r.visible=!BODB.inside(); MODS.pool.roof.visible=!MODS.pool.inside(pos.x,pos.z);   // (and its roof off)")
mod=rp(mod,"  renderer.shadowMap.needsUpdate=true; W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();",
 """  if(!MAPBAKE){ MAPBAKE=1; W3.group.visible=false; renderer.shadowMap.needsUpdate=true; renderer.render(scene,cam); W3.group.visible=true; }   // (the lamps' still shadows, once, without him)
  const wOn=LVL==='up'&&Math.hypot(pos.x-POOLR.X((POOLR.bx0+POOLR.bx1)/2),pos.z-POOLR.Z((POOLR.by0+POOLR.by1)/2))<14*TILE;   // (the water moves while you're near it)
  if(wOn)WATER.step(renderer,dt); renderer.shadowMap.needsUpdate=true; if(wOn)WATER.under(renderer,scene,cam,lamps); W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();""")
mod=rp(mod,"st.target=ml>0?1:0; const before=st.dist; RIG.step(st,dt);","WATER.feed(st,pos,dt,ml>0,keys); st.target=ml>0?1:0; const before=st.dist; RIG.step(st,dt);")
mod=rp(mod,"collide(pos); if(target&&","collide(pos); if(st.water&&st.water.in){ const m=0.3; pos.x=Math.max(WATER.X0+m,Math.min(WATER.X0+WATER.W-m,pos.x)); pos.z=Math.max(WATER.Z0+m,Math.min(WATER.Z0+WATER.D-m,pos.z)); }   // (swimming: within the basin's walls)\n    if(target&&")
mod=rp(mod,"if(MOVEK[k]&&!e.repeat&&!RAG.on)RIG.act(st,MOVEK[k]); });","if(st.water&&st.water.in&&(k===' '||k==='j')){ st.water.dive=true; e.preventDefault(); } else if(MOVEK[k]&&!e.repeat&&!RAG.on)RIG.act(st,MOVEK[k]); });")
mod=rp(mod,"if(MOVEK[k])RIG.release(st,MOVEK[k]); });","if(k===' '||k==='j'){ if(st.water)st.water.dive=false; } if(MOVEK[k])RIG.release(st,MOVEK[k]); });")
mod=rp(mod,"if(!RAG.on&&(trip||hit>12)){","if(!RAG.on&&!(st.water&&st.water.level!=null)&&(trip||hit>12)){")
mod=rp(mod,"looseDraw();\nlet looseAcc",open('src/floats.js').read()+"\nlooseDraw();\nlet looseAcc")
mod=rp(mod,"const PHYOU={m:null,","let PHYZ0=0; const PHYOU={m:null,")
mod=rp(mod,"fj=AY-(p[2]*TL-py)*PPU/VS","fj=AY-((p[2]-PHYZ0)*TL-py)*PPU/VS")
mod=rp(mod,"  if(loose.length)RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);","  if(loose.length||FLOATS.bodies.some(b=>Math.hypot(b.x[0]*TL-pos.x,-b.x[1]*TL-pos.z)<2.5))RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);   // (his figure for the physics only when something he could push is near)")
mod=rp(mod,"if(nst>=6)looseAcc=0; looseDraw();","if(nst>=6)looseAcc=0; looseDraw();\n  { const px=FLOATS.px??pos.x, pz=FLOATS.pz??pos.z, k=1/Math.max(dt,1e-3); FLOATS.step(dt,{inWater:!!(st.water&&st.water.in),x:pos.x,z:pos.z,vx:(pos.x-px)*k,vz:(pos.z-pz)*k}); FLOATS.px=pos.x; FLOATS.pz=pos.z; }")
head=rp(head,'<div><b>Space</b> jump','<div>The bodega, the pool room (its door east of it) and the subway (the stairs down west of it) · walk into the pool to swim · <b>Space</b> (held) under</div>\n  <div><b>Space</b> jump')
mod=rp(mod,"const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0;","const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0; { const a=(QS.get('at')||'').split(',').map(Number); if(a.length>=2&&a.every(isFinite)){ pos.set(a[0],0,a[1]); py=a[2]||0; } }   // (a test's: start at x,z[,height])")
mod=rp(mod,"  if(MAPLV(py,pos))setPhys(LVL);","  if(MAPLV(py,pos))setPhys(LVL); if(bloom){ const dn=LVL==='down'; bloom.strength=(dn?1.3:.55)*GLOW.k; bloom.radius=dn?.6:.4; bloom.threshold=dn?.62:.8; }   // (the glow: the station's strong, the street's and the shops' gentle)")
# GETTING AROUND and THE MENU (owner, 17 Oct 2026): src/ui.js, and its hooks in the frame and the keys
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",open('src/physbody.js').read()+"\n"+open('src/ui.js').read()+"\n"+open('src/editor.js').read()+"\n"+open('src/animator.js').read()+"\n"+open('src/worldedit.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")
mod=rp(mod,"addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); keys.add(k);","addEventListener('keydown',e=>{ const k=UI.key(e); if(!k)return; keys.add(k);")
mod=rp(mod,"addEventListener('keyup',e=>{ const k=e.key.toLowerCase(); keys.delete(k);","addEventListener('keyup',e=>{ const k=UI.key(e); if(!k)return; keys.delete(k);")
mod=rp(mod,"if(k==='f'&&!e.repeat)trip=true;","if(k==='f'&&!e.repeat&&!UI.freeCam&&!UI.fly&&!ED.on)trip=true;")
mod=rp(mod,"else if(MOVEK[k]&&!e.repeat&&!RAG.on)RIG.act(st,MOVEK[k]); });","else if(MOVEK[k]&&!e.repeat&&!RAG.on&&!UI.freeCam&&!ED.on&&!(UI.fly&&k===' '))RIG.act(st,MOVEK[k]); });   // (the free camera's keys and flying's Space aren't his moves)")
i=mod.index("renderer.domElement.addEventListener('pointerdown',e=>{ if(e.button!==0)return;"); j=mod.index("target=hit.clone(); });",i)+len("target=hit.clone(); });")
mod=mod[:i]+"// (a left click: walks him there unless it was a drag: the menu's code, src/ui.js)"+mod[j:]
mod=rp(mod,"  if(MAPLV(py,pos))setPhys(LVL);","  if(UI.freeCam?MAPLV(UI.camT.y-.9,UI.camT):MAPLV(py,pos))setPhys(LVL);   // (the free camera shows the level it's on)")
mod=rp(mod,"\n  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;}","\n  UI.camStep(dt,a,up,dn,lf,rt); if(UI.freeCam||ED.on)up=dn=lf=rt=false;   // (the free camera takes the walking keys)\n  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;}")
mod=rp(mod,"collide(pos); if(st.water&&st.water.in){","if(UI.fly)UI.flyStep(0); else collide(pos); if(st.water&&st.water.in){")
mod=rp(mod,"    py+=(groundY(pos.x,pos.z)-py)*Math.min(1,dt*20); P.x=pos.x/TL;","    if(UI.fly)UI.flyStep(dt); else py+=(groundY(pos.x,pos.z)-py)*Math.min(1,dt*20); P.x=pos.x/TL;   // (flying: up and down as you hold Space and Shift, through anything)\n   ")
mod=rp(mod,"  disp.set(pos.x,py,pos.z); F.set(","  if(UI.freeCam)disp.copy(UI.camT); else disp.set(pos.x,py,pos.z); F.set(")
head=rp(head,'<div><b>Right-drag</b> or <b>Q</b> / <b>E</b>, <b>Z</b> / <b>X</b> turn and tilt</div>','<div><b>Drag</b> or <b>Q</b> / <b>E</b>, <b>Z</b> / <b>X</b> turn and tilt</div>\n  <div><b>C</b> free camera · <b>G</b> fly through walls (<b>Space</b> up, <b>Shift</b> down)</div>')
head=rp(head,'<div class="dim"><b>H</b> hide this</div>','<div class="dim"><b>Esc</b> menu: map, display, keys · <b>H</b> hide this</div>')
# HIS SHAPE and THE OUTLINE (owner, 17 Oct 2026): src/editor.js; each piece's change on its frame; the outline pass off unless turned on
mod=rp(mod,"0,0,0,1); }); };","0,0,0,1); if(W3.E&&W3.E[i])W3.applyE(W3.PM.value[i],W3.E[i],F.o); }); };   // (his shape as edited: src/editor.js)")
mod=rp(mod,"W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU);","W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); if(ED.on)ED.tick();")
mod=rp(mod,"W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(0,lampW)*0.9);","W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(0,lampW)*0.9); if(ED.on)W3.tint.setRGB(1,1,1);   // (shaping him: in full light)")
mod=rp(mod,"W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();","W3.shadowPass(renderer); if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render();")
mod=rp(mod,"{ const sp=new ShaderPass(OUTL.pass); composer.addPass(sp);","{ const sp=new ShaderPass(OUTL.pass); composer.addPass(sp); OUTL.sp=sp; sp.enabled=!!OUTL.on;")
# STOPPING AT ONCE (owner, 17 Oct 2026: "when i stop walking ... im sliding a little"): the rig's own snap, the game's for you (47-you-jointed);
# the close view of HIS SHAPE on his middle; the double click's walk to a thing each frame
mod=rp(mod,"const cloud=RIG.bake(0.5,1), st=RIG.create();","const cloud=RIG.bake(0.5,1), st=RIG.create(); st.snap=true;")
mod=rp(mod,"if(UI.freeCam)disp.copy(UI.camT); else disp.set(pos.x,py,pos.z);","if(UI.freeCam)disp.copy(UI.camT); else disp.set(pos.x,py+(ED.on?0.85:0),pos.z);")
mod=rp(mod,"  marker.visible=!!target;","  UI.goTick(); UI.runTick();\n  marker.visible=!!target;")
head=rp(head,'<div><b>Click</b> the ground to walk there</div>','<div><b>Double-click</b> the ground to walk there, or a thing to go to it</div>')
# THE NEON, REAL (owner, 17 Oct 2026: "the light isnt taking into account its surroundings", "match the style", "totally disappears when diff
# angles ... just laid on map point at me"): its letters as glowing tubes with depth (a little block for every lit square of the game's
# lettering) where the flat painted plate was; its light in the window among them, casting shadows, so the walls keep it to the window, the
# pavement in front and the shop behind; and every glow in the picture stepped and dithered in square blocks, as the game's light is
mod=rp(mod,"MK.neon=(x,y,z,s,c)=>{ PNAME='neon sign'; const W=tw(s,2)+4, f=face(W,14,null,[[s,c,2,2]],FL(y),x-W/FP/2,z+7,W/FP);\n  const p=prop([WF(x-.3,x+.3,y),Bw(x-W/FP/2,x+W/FP/2,y,-.12,-.04,z-7,z+7,c,{foot:0,em:1,fj:f,fi:()=>null,top:()=>null})]); LAMPS.push({x,y:y+.4*WD(y),z,r:2.2,c:[c[0]/255,c[1]/255,c[2]/255],prop:p}); return p; };",
"MK.neon=(x,y,z,s,c)=>{ PNAME='neon sign'; const W=tw(s,2)+4, cells=[]; txt((a,b)=>cells.push([a,b]),s,2,2,c,2);\n  const p=prop([WF(x-.3,x+.3,y)]); NEONS.push({x,y,z,W,cells,c}); LAMPS.push({x,y:y+.3*WD(y),z,r:2.2,c:[c[0]/255,c[1]/255,c[2]/255],prop:p,neon:true}); return p; };   // (the tubes and their light: bodbuild.js)")
mod=rp(mod,"    if(l.r>=3){ L.castShadow=true;","    if(l.r>=3||l.neon){ L.castShadow=true;")
mod=rp(mod,"  for(const l of BOD.LAMPS){ const cm=Math.max(...l.c);","""  // the neon's tubes: a glowing block for each lit square of its letters (2 art px), a tube's depth, read from both sides of the glass
  for(const N of NEONS){ const n=N.cells.length/4, k=1/24, geo=new THREE.BoxGeometry(2*k*TILE,Y(2)-Y(0),2*k*TILE*.8), me=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color(N.c[0]/255*1.1,N.c[1]/255*1.1,N.c[2]/255*1.1)}),n), m4=new THREE.Matrix4(); let i=0;
    for(const [a,b] of N.cells){ if(a%2||b%2)continue; m4.makeTranslation(X(N.x-N.W*k/2+(a+1)*k),Y(N.z+7-(b+1)),Z(N.y-.08)); me.setMatrixAt(i++,m4); }
    me.count=i; me.castShadow=false; me.receiveShadow=false; scene.add(me); }
  for(const l of BOD.LAMPS){ const cm=Math.max(...l.c);""")
mod=rp(mod,"bloom=new UnrealBloomPass(new THREE.Vector2(256,256),1.3,0.6,0.62); composer.addPass(bloom);","""bloom=new UnrealBloomPass(new THREE.Vector2(256,256),1.3,0.6,0.62); composer.addPass(bloom);
// THE GLOW, YOUR PICK (owner, 17 Oct 2026: "the light looks like a bubble, can you give me the old lighting ... or diff options?"): OFF (the
// lamps light the room, nothing glows round them), SOFT (the glow as it first was, smooth), STEPPED (in hard steps and dither); the menu's switch
const GLOW={mode:'soft',k:.3,amount(v){ GLOW.k=v; try{ localStorage.setItem('market-glowk',String(v)); }catch(e){} },set(m){ GLOW.mode=m; bloom.enabled=m!=='off'; if(GLOW.q)GLOW.q.value=m==='stepped'?1:0; try{ localStorage.setItem('market-glow',m); }catch(e){} }};
{ const cm=bloom.compositeMaterial; cm.uniforms.uQ={value:1}; GLOW.q=cm.uniforms.uQ; cm.fragmentShader='uniform float uQ;\\n'+cm.fragmentShader.replace(/}\\s*$/,`  if(uQ>.5){ vec3 bc=gl_FragColor.rgb; float bm=max(bc.r,max(bc.g,bc.b)); ivec2 bq=ivec2(mod(gl_FragCoord.xy,4.));
    float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); float bs=5., bv=bm<0.07?0.:max(1./bs,floor(bm*bs+bt[bq.x+bq.y*4]/16.)/bs); gl_FragColor.rgb=bv>0.?bc/bm*bv:vec3(0.); }   /* (its faint end cut, not a scatter of dots) */ }`); cm.needsUpdate=true;
  bloom.renderTargetsHorizontal[0].texture.magFilter=bloom.renderTargetsHorizontal[0].texture.minFilter=THREE.NearestFilter; }   // (the glow in steps, dithered, in square blocks: the game's light, not a soft haze)""")
# HIS BODY IN A PHYSICS ENGINE (owner, 17 Oct 2026): src/physbody.js, after the rig has placed him each frame
mod=rp(mod,"W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); if(ED.on)ED.tick();","W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); PB.step(dt,B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,groundY(pos.x,pos.z),RAG.on); if(ED.on)ED.tick();")
# HIS MOVES, EDITABLE (owner, 17 Oct 2026: "edit his walk and other movements in the HIS SHAPE editor"; his picks: the walk's and the run's
# dials, a keyframe editor for every move, new moves of his own): src/animator.js. In the rig: the walk's dials (each 1 as it was), the
# hook where every pose he takes passes on its way to be drawn (his keys added on), and what the editor needs to play a move by itself
def rpn(s,a,c,n):
    assert s.count(a)==n,(a[:80],s.count(a)); return s.replace(a,c)
head=rp(head,"const WALK={cycle:0.929,stance:0.6,stride:14.67,lean:2},RUN={cycle:0.56,stance:0.4,stride:20,lean:10};",
  "const WALK={cycle:0.929,stance:0.6,stride:14.67,lean:2,bounce:1,arm:1,elbow:1,sway:1,twist:1,knee:1,width:1},RUN={cycle:0.56,stance:0.4,stride:20,lean:10,bounce:1,arm:1,elbow:1,sway:1,twist:1,knee:1,width:1};   // (bounce...width: the walk's and the run's dials, HIS MOVES: 1 as made)\nconst OVL={fn:null};   // (where his own keys are added onto every pose: src/animator.js)")
head=rp(head,"P.pyaw=-3*D*sw*(1+0.5*r); P.cyaw=2.5*D*sw*(1+r);","P.pyaw=-3*D*sw*(1+0.5*r)*g.twist; P.cyaw=2.5*D*sw*(1+r)*g.twist;")
head=rp(head,"const sway=0.9*w*(1-0.6*r)*Math.sin(2*Math.PI*q.L);","const sway=0.9*g.sway*w*(1-0.6*r)*Math.sin(2*Math.PI*q.L);")
head=rp(head,"P.roll=-4*D*w*(1-0.4*r)*Math.sin(","P.roll=-4*D*g.sway*w*(1-0.4*r)*Math.sin(")
head=rp(head,"P.root=V(sway,STAND-Math.max(0,Math.round((STAND-py)/PX))*PX,0);","P.root=V(sway,STAND-Math.max(0,Math.round((STAND-py)*g.bounce/PX))*PX,0);")
head=rpn(head,"const n=s>0?'L':'R',x=s*FOOTX,qq=q[n];","const n=s>0?'L':'R',x=s*FOOTX*g.width,qq=q[n];",2)
head=rp(head,"const F=qq2=>legReach(lab('hip',qq2,ST,rs)*w,kn(qq2)),","const F=qq2=>legReach(lab('hip',qq2,ST,rs)*w*g.knee,kn(qq2)*g.knee),")
head=rp(head,"w*lerp(16,36,rs)*Math.cos(2*Math.PI*(qq-0.04)))*D","w*lerp(16,36,rs)*g.arm*Math.cos(2*Math.PI*(qq-0.04)))*D")
head=rp(head,"el=(10+w*(lerp(2,64,rs)","el=(10+g.elbow*w*(lerp(2,64,rs)")
head=rp(head,"  const B=settle(busy||st.up||(st.water&&st.water.in)?clearPose(P,dev):build(P,dev),","  if(OVL.fn)OVL.fn(st,P);   // (his own keys on whatever he's doing: src/animator.js)\n  const B=settle(busy||st.up||(st.water&&st.water.in)?clearPose(P,dev):build(P,dev),")
head=rp(head,"return {restOf,IDF,","return {OVL,begin,beginUp,legIK,START,mkMove:move,ARMMOVES,restOf,IDF,")
mod=rp(mod,"B=RIG.pose(st); ragBlend(B);","B=ED.anim?ED.animPose():RIG.pose(st); ragBlend(B);")
os.makedirs('dist',exist_ok=True); open('dist/market.html','w').write(head+mod); print('built dist/market.html')
