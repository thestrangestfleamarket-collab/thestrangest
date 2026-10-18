import os, sys
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
# THE METRO (owner, 17 Oct 2026: "lets make that the subway in the new game"; 18 Oct 2026: "i want to bring the metro into the map and move the
# current subway station off map"): his Drive's Metro_PSX kit (data/metro.json, tools/metro-bake.py) as the subway, src/metro.js; the game's West
# End station (src/station.js, src/wsub.js, as patched above) kept in the page but built only when brought back (AWAY's 'station', ?bring=station)
stn="if(AWAY.has('station')){\n"+rd('src/metro.js')+"\n} else {\n"+stn+"\n}"
pool=body('src/pool.js','{ const hash=','\nscene.background')
pool=rq(pool,"const X=x=>(x-OX)*TILE, Z=y=>(y-OY)*TILE, Y=z=>z*ZU;","const X=x=>(x-OX)*BLDK*TILE+PDX, Z=y=>((y-OY)*BLDK+(P.y1-OY)*(1-BLDK))*TILE+PDZ, Y=z=>z*ZU*BLDK;")   # (a tenth bigger from its front's middle: BLDK)
pool=rq(pool,"const gx=x/TILE+OX-P.bx0, gy=z/TILE+OY-P.by0;","const gx=(x-PDX)/TILE/BLDK+OX-P.bx0, gy=((z-PDZ)/TILE-(P.y1-OY)*(1-BLDK))/BLDK+OY-P.by0;")
game=['23-w-bodega-shop.js','23-w-street-1-kit.js','23-w-street-2-furniture.js','23-w-street-3-city.js','23-w-street-4-catalog.js','23-w-studio-apartment-1-furniture.js','23-w-studio-apartment-2-computer.js','23-w-studio-apartment-3-rooms.js','23-x-laundry-room.js']
kit=rd('src/gamekit.js')+'\n'+'\n'.join('// ==== '+f+' (the game\'s, word for word)\n'+rd(S+f) for f in game)
# GHOST STREET (owner, 17 Oct 2026: "bring in ghost street from old map"): the game's own makers of the kit's wooden shop, word for word, in a block of their own (their names their own), handing out where it's set and its paving
# GHOST STREET A THIRD TALLER (owner, 17 Oct 2026: "make the ghost street building 33% taller"): its tiled roof made by the kit's own roofer at
# the new height (eaves 208, ridge 261: whole tiles, no stretched pixels), the gable's wood under it; the rest of the lift in src/ghostdojo.js
gs=rq(rd(S+'23-w-ghost-street.js'),"const wall=(v,z)=>Math.abs(v-1.75)<1.45*(1-(z-158)/36)&&z>=158&&z<194?(Math.floor(v*32)%8===0||z===158?QD.woodDark:QD.wood):null;\n    return GPUT('ghost street shop roof',kroof(o,.9,7.1,-.45,3.95,156,196,wall,true),{o:{walk:true,hang:156}}); }",
  "const wall=(v,z)=>Math.abs(v-1.75)<1.45*(1-(z-210)/49)&&z>=210&&z<259?(Math.floor(v*32)%8===0||z===210?QD.woodDark:QD.wood):null;\n    return GPUT('ghost street shop roof',kroof(o,.9,7.1,-.45,3.95,208,261,wall,true),{o:{walk:true,hang:208}}); }")
kit+='\n// ==== 23-w-ghost-street.js (the game\'s, word for word but its roof\'s height)\nconst PRESETS={}; let GHOSTK=null;\n{\n'+gs+'\nGHOSTK={GSK,gsFloor};\n}\n'
# THE DOJO'S MAKERS (owner, 17 Oct 2026: Ghost Street's inside "should look like the dojo (from other map)"): the old West End dojo's hall, word
# for word, in a block of its own (its measures, DJ, set by src/ghostdojo.js instead of from the West End's plan), handed out on BOD.GDJ
dj=rq(rd(S+'23-w-west-dojo-1-hall.js'),"DJ=(()=>{ const g=WEND.dojo","DJ=null&&(()=>{ const g=WEND.dojo")
kit+='\n// ==== 23-w-west-dojo-1-hall.js (the game\'s, word for word)\n{\n'+dj+'\nBOD.GDJ={djAndon,djCandle,djIncense,djHanging,djTokonoma,djBokkenRack,djLeaf,DJTAT,DJBRD,DJWOOD,DJPAP,DJPLA,setDJ:v=>{ DJ=v; }};\n}\n'
# THE STOREROOM (owner, 17 Oct 2026: "brng back diner and bar with all musicians, the moonshrine, the herb cottage, the octopus tank, castle keep,
# butterflies ... dont add them to the map yet just bring to this new game and all items"): each room's game files, word for word, each group in
# a block of its own; the buildings their files measure themselves by (the game's LBLD records) at the store's own spots, far off the map, where
# src/store.js sets them out; what each hands out, on BOD.STOREK. The keep's three files from the game's archive (archive/keep, stored 16 Oct 2026)
ST_B="LBLD.push({id:'ldiner',label:'DINER',x0:106.5,y0:-84,x1:120,y1:-77,h:130,st:1,c:[176,62,56]},{id:'lbodega2',label:'BAR',x0:120.5,y0:-89.5,x1:130.5,y1:-77,h:130,st:1,c:[146,96,64]},{id:'ldungeon',label:'THE DUNGEON',x0:500,y0:-58,x1:513,y1:-47,h:130,st:1,c:[60,56,52]},{id:'lcastle',label:'THE KEEP',x0:88.75,y0:-94,x1:98.25,y1:-85,h:520,st:4,tall:4,c:[150,142,126]});"
KEEPC="const KEEPC={k:[426,435.5,-86,-77],door:430.75,arches:[428.1,430.75,433.4],b:[422,439,-90,-73],gate:430.5};"
sconce=body(S+'26-y-theatre-inside.js','// ---- a wall light','// ---- the floor lights')   # (the bar's wall lights are the theatre's)
def gblock(files,out,pre='',src=S):
    return '\n{\n'+pre+'\n'.join('// ==== '+f+" (the game's, word for word)\n"+rd(src+f) for f in files)+'\n'+out+'\n}\n'
kit+='\nconst STOREK={LAMPS,PRESETS,CATALOG,PROPS,LBLD,T,STORY,hash,sh,sided,prop,LSEED}; const SQLV={octo:0}; const DEEPW={ZPX:24};\n'+ST_B+'\n'+KEEPC+'\n'
kit+=gblock(['23-w-west-diner.js'],"STOREK.diner={dinerFloorCol,dinerWall};")
kit+=gblock(['23-w-bar-1-counter.js','23-w-bar-2-seats.js','23-w-bar-3-walls.js','23-w-music-1-things.js'],"STOREK.bar={barFloorCol,barWall,theatreSconce};",sconce+'\n')
kit+=gblock(['23-w-west-moon-shrine-1-pieces.js','23-w-west-moon-shrine-2-pond.js'],"STOREK.shrine={MSP};")
kit+=gblock(['23-w-page-rooms-0-kit.js','23-w-page-rooms-1-cottage-1-room.js','23-w-page-rooms-1-cottage-2-furniture.js'],"STOREK.cottage={PGK};")
kit+=gblock(['23-x-octopus-room.js'],"STOREK.octo={OCTK,OCC,octoWall,octoFloorCol,octoTank};")
kit+=gblock(['23-w-dungeon-1-room.js','23-w-dungeon-2-things.js'],gblock(['23-w-keep-1-look.js','23-w-keep-2-pieces.js'],"STOREK.keep={KEEPR,keepOutWall,keepInWall,keepFloorCol,KMK,DGP};",'',S+'../archive/keep/src/'))
kit+=gblock(['23-w-butterflies.js','23-w-studio-mood.js'],"STOREK.bf={BF_KINDS,bfPic,bfSpan};")
# THE VENDING MACHINES (owner, 17 Oct 2026: "pull in vending machines with real depth from old game, put them in front of ghost street dojo"): the
# market lounge's kit (MLK: 23-w-y-market-lounge-2-bar, word for word) and its vending machine's maker (23-w-y-market-lounge-4-street's, word for
# word: a cabinet round a hollow, the window real glass over lit shelves of cans, the flap a real hollow), two catalog kinds, white and dark red
vend=body(S+'23-w-y-market-lounge-4-street.js','  // A VENDING MACHINE','  // THE BIN BAG')
kit+=gblock(['23-w-y-market-lounge-2-bar.js'],"{ const {art,onF,lit,C,rect,sub,fb,worn,metal}=MLK, FP=24;\n// ==== 23-w-y-market-lounge-4-street.js, the vending machine (the game's, word for word)\n"+vend+"\n  CATALOG['vending machine, white']=(x,y,f)=>vending(x,y,f||[1,0],0); CATALOG['vending machine, red']=(x,y,f)=>vending(x,y,f||[1,0],1); }")
kit+='BOD.STOREK=STOREK;\n'
# THE CASTLE'S AND THE DUNGEON'S MAKERS (owner, 17 Oct 2026: "lets bring back ... the castle, the dungeon under the castle (only 1 level)"): the
# dungeon's look and things (23-w-dungeon-1-room, -2-things) and the castle's stone and pieces (23-w-dungeon-3-castle-1-stone, -2-pieces), word for
# word, in a block of their own, handed out on BOD.KC; the dungeon's measures (DGN) the hall's under the castle (CASTLE.hall, map-pre.js); the
# gatehouse turned to stand out from the wall toward the street (the game's stood out toward +y)
kc=rq(rd(S+'23-w-dungeon-3-castle-2-pieces.js'),"KMK.gate=(gx,wy,H)=>{ PNAME='gatehouse'; const y0=wy-.5, y1=wy+1.1, w=.65, sd=4800, ps=[];","KMK.gate=(gx,wy,H)=>{ PNAME='gatehouse'; const y0=wy-1.1, y1=wy+.5, w=.65, sd=4800, ps=[];")
kc=rq(kc,"B.push(sided({x0:gx-w,y0:wy+.36,x1:gx+w,y1:wy+.46,z0:84,z1:104,","B.push(sided({x0:gx-w,y0:wy-.46,x1:gx+w,y1:wy-.36,z0:84,z1:104,")
kit+='\n// ==== the dungeon and the castle (the game\'s, word for word but the gatehouse\'s side)\n{\nconst LBLD=[{id:\'ldungeon\',...CASTLE.hall,st:1}], CATALOG={}, CAT_INFO={}, CAT_DEPTS=[], LAMPS=[];\n'+rd(S+'23-w-dungeon-1-room.js')+'\n'+rd(S+'23-w-dungeon-3-castle-1-stone.js')+'\n'+kc+'\n'+rd(S+'23-w-dungeon-2-things.js')+'\nBOD.KC={KMK,KPP,DGN,DGP,LAMPS,CATALOG,dungeonWall,dungeonFloorCol,castleArch,KARCH};\n}\n'
bod=rd('src/bodega.js')
i=bod.index('const BOD={'); bod=bod[i:]
bod=rq(bod,"const BOD={meshes:[], walls:{}, lamps:[]};","BOD={meshes:[], walls:{}, lamps:[]};").replace('/*GAMEKIT*/',kit).replace('/*GOODS*/',rd('src/goods-defs.js'))
bb=rq(rd('src/bodbuild.js'),"const BODB={};","BODB={};")
wrap=lambda name,code,out,cutwhen: ("grab('%s',()=>{ const solids=SOL.%s, fixed=FIX.%s, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;\n"%(name,'down' if name=='down' else 'up','down' if name=='down' else 'up'))+code+"\n"+out+"\n for(const w of cutWalls.slice(c0))if(!w.when)w.when="+cutwhen+"; for(const L of SHL)L.removeFromParent(); });\n"
MAPST=('const TEXTURES='+rd('data/textures.json')+';\nconst KITD='+rd('data/kit.json')+';\nconst METROD='+rd('data/metro.json')+';\n'+rd('src/save.js')+'\n'+rd('src/map-pre.js')+'\n'+rd('src/fire.js')+'\n'+rd('src/batch.js')+'\n'+rd('src/water3d.js')+'\n'
  +wrap('down',stn,"MODS.station=METRO?{BOUND,ground:(x,z)=>METRO.inside(x,z)?METRO.ground(x,z):STN.DY,DY:METRO.DY,plat:METRO.plat,lane:METRO.lane,path:METRO.path}:{BOUND,ground:(x,z)=>groundY(x,z)+STN.DY,DY:STN.DY,plat:{x:-12.4+LAY.o('subway').x*TILE,z:-24.9+LAY.o('subway').y*TILE}};","()=>LVL==='down'")   # (the metro's own floor inside it, the loop's tunnel at the old depth outside it: sub.js; plat: the platform's spot, lane: the bear's, path: the way down, lives.js)
  +wrap('bodega',bod+'\n'+bb+'\n'+rd('src/apts.js')+'\n'+rd('src/ghostdojo.js')+'\n'+rd('src/butterflies.js')+'\n'+rd('src/store.js')+'\n'+rd('src/club.js'),"MODS.bodega={BOUND,ground:groundY};","()=>BODB.inside()")
  +wrap('pool',"if(!AWAY.has('apartments')){\n"+pool+"\nWATER.build();\n} else { const P=POOLR, OX=(P.x0+P.x1)/2, OY=(P.y0+P.y1)/2; P.X=x=>(x-OX)*BLDK*TILE+PDX; P.Z=y=>((y-OY)*BLDK+(P.y1-OY)*(1-BLDK))*TILE+PDZ; P.Y=z=>z*ZU*BLDK; P.ROOMS=[]; P.inBasin=()=>null; P.bedAt=()=>0; BOUND={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9}; }","MODS.pool={BOUND,cut:cutWalls.slice(c0),inside:(x,z)=>x>POOLR.X(POOLR.x0)&&x<POOLR.X(POOLR.x1)&&z>POOLR.Z(POOLR.y0)&&z<POOLR.Z(POOLR.y1)};","()=>MODS.pool.inside(pos.x,pos.z)")
  +"const FOREST="+rd('data/forest.json')+";\nconst PROPS="+rd('data/props.json')+";\n"+rd('src/cave.js')+'\n'+rd('src/park.js')+'\n'+rd('src/castle.js')+'\n'+rd('src/tower.js')+'\n'   # (CENTRAL PARK'S ENTRANCE, owner 17 Oct 2026: park.js, data/forest.json; THE CASTLE and its dungeon in it: castle.js)
  +rd('src/map-post.js')+'\n'+rd('src/ring.js')+'\n'+rd('src/river.js')+'\n'+rd('src/sub.js')+'\n'+rd('src/kit.js')+'\n'+rd('src/dress.js')+'\n'+rd('src/grid.js'))   # (the kits placed, the pigeons: after the map)
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
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';""")
# the picture's passes: the scene, (the outline round him, when on), the output (no bloom: owner, 17 Oct 2026, the budget, "no glow or bloom")
mod=rp(mod,"const scene=new THREE.Scene();","""const scene=new THREE.Scene();
let composer=null;""")
mod=rp(mod,"renderer.setSize(RW,RH,false);","renderer.setSize(RW,RH,false); if(composer)composer.setSize(RW,RH);")
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);","""composer=new EffectComposer(renderer); composer.setPixelRatio(1); composer.addPass(new RenderPass(scene,cam));
composer.addPass(new OutputPass());
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
mod=rp(mod,"  let lampW=0; for(const L of lamps){","  if(typeof UI!=='undefined'&&UI.freeCam)LITE.tick(dt,UI.camT.x,UI.camT.y,UI.camT.z); else LITE.tick(dt,pos.x,py+1.2*TILE,pos.z);   // (the eight lamps nearest you light the world: map-post.js)\n  let lampW=0; for(const L of lamps){")
print('ok base')

# PIXELS THAT GROW WITH THE ZOOM (owner, 16 Oct 2026: "keep this level of res on every zoom", his pick "pixels grow with zoom"): as the game draws,
# a tile is always the same number of pixels; zooming in makes every pixel bigger, by whole screen pixels (so the zoom goes in steps), never adds detail
mod=rp(mod,"  RW=Math.ceil(pw/PXS/2)*2; RH=Math.ceil(ph/PXS/2)*2;","  const S=pxS(); SCL=S; RW=Math.ceil(pw/S/2)*2; RH=Math.ceil(ph/S/2)*2;")
mod=rp(mod,"const c=renderer.domElement, cw=RW*PXS/dpr, ch=RH*PXS/dpr;","const c=renderer.domElement, cw=RW*S/dpr, ch=RH*S/dpr;")
mod=rp(mod,"let ppu=PPU;                                    // the zoom: screen pixels per world unit (the wheel)\nfunction frustum(){ cam.left=-RW/2/ppu; cam.right=RW/2/ppu; cam.top=RH/2/ppu; cam.bottom=-RH/2/ppu; cam.updateProjectionMatrix(); }",
"""let ppu=PPU, SCL=1, RESI=2;                     // the zoom (the wheel); SCL: screen pixels to a picture pixel now; RESI: the art's fineness (- and =)
const FULLRES=+(new URLSearchParams(location.search).get('fullres')||0); if(FULLRES)RESI=FULLRES;   // (?fullres=N: a test's screenshots at the screen's own pixels, the art's fineness N of RESL (owner, 17 Oct 2026: "show in full res in screenshots"); never in play)
// SHARPER AT WILL (owner, 16 Oct 2026: "allow the game to go more res if i press = more times, however sharp res it can go"): the art's own
// pixels a world unit, the game's times RES (- coarser, = finer, as far as one screen pixel each: the sharpest the screen can show); the
// zoom then makes them bigger by whole screen pixels, so the zoom goes in steps
const RESL=[.5,.75,1,1.5,2,3,4,6,8,12,16,24,32,48,64], V0=PPU*PXS;   // (past 16: the guitarist's SHARPEN bar, close up, to one screen pixel each)
// CLOSE UP, ONE STEP FINER (owner, 17 Oct 2026: the opening "1 less than it is now, and when you zoom in to this level i want it to be this
// resolution", his picture at 6 screen pixels a pixel, 1.5x): once a pixel of the chosen art would be 6 screen pixels or more, the art one step
// finer; zoomed back out, back to the chosen
const ZUPX=6, RES=()=>RESL[Math.min(RESL.length-1,RESI+(V0*ppu/PPU/(PPU*RESL[RESI])>=ZUPX?1:0))];   // (V0: screen pixels a world unit at zoom 1, as it opened; Shift+R's table taken out, owner 17 Oct 2026: "resolution is fine as it is")
// NEVER SHARPER ZOOMED OUT (owner, 17 Oct 2026: "when i zoom out i dont want it to get this sharp ... never sharper than this resolution"): a
// pixel is never smaller on screen than it is at the opening zoom for the sharpness chosen (MINPX); zoomed out past that, each pixel keeps its
// size and takes in more of the world, instead of the picture getting finer (owner, 17 Oct 2026, his picture: "i dont want zoom getting any
// sharper res than this no matter how far you zoom out": the opening's pixel for the sharpness chosen, no finer)
// ALL THE WAY IN (owner, 17 Oct 2026: "zoom in all the way to his super close of each finger"): the zoom goes to 80 times; past 8 screen
// pixels a picture pixel the art gets finer instead (MAXPX), so close up you see each finger, not bigger blocks
const MINPX=()=>Math.max(1,Math.round(PXS/RES())), MAXPX=8, ZMAX=PPU*80;
// NEVER FINER THAN THE OPENING (owner, 17 Oct 2026, his picture: "dont let the game get any higher res than this at any time, at any zoom level"): the
// art's pixels never finer than the opening's (RESMAX: = stops there), and zoomed in they only grow (no finer art close up any more).
// (the menu's SHARP, 1.5x, the ceiling; the opening NORMAL, 1x, finer close up: ZUPX)
const RESMAX=FULLRES?10:3, vpu=()=>V0*ppu/PPU, art=()=>PPU*RES(), pxS=()=>Math.max(MINPX(),Math.round(vpu()/art())), rppu=()=>Math.round(vpu()/art())<MINPX()?vpu()/pxS():art();
function frustum(){ const u=rppu(); cam.left=-RW/2/u; cam.right=RW/2/u; cam.top=RH/2/u; cam.bottom=-RH/2/u; cam.updateProjectionMatrix(); }""")
mod=rp(mod,"ppu*=Math.pow(ppuTo/ppu,ease); frustum();","ppu*=Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)resize(); else frustum();")
mod=rp(mod,"zoom ${(ppu/PPU).toFixed(2)}×`","zoom ${(SCL*rppu()/V0).toFixed(2)}× · art ${SCL===1&&vpu()<art()?'full':RES()+'×'}`")
mod=rp(mod,"if(k==='-'||k==='_'){PXS=Math.min(12,PXS+1);resize();} if(k==='='||k==='+'){PXS=Math.max(1,PXS-1);resize();}",
  "if(k==='-'||k==='_'){RESI=Math.max(0,RESI-1);resize();} if(k==='='||k==='+'){ if(pxS()>1||vpu()>art())RESI=Math.min(RESMAX,RESI+1); resize(); }   // (= finer, back up to the opening's, never past)")
head=rp(head,'<div><b>-</b> / <b>=</b> pixel size</div>','<div><b>-</b> / <b>=</b> coarser / sharper</div>')
mod=rp(mod,"ppuTo=Math.max(3,Math.min(240,ppuTo*Math.pow(1.0015,-e.deltaY)));","ppuTo=Math.max(3,Math.min(ZMAX,ppuTo*Math.pow(1.0015,-e.deltaY)));")
# EVERY VIEW (owner, 17 Oct 2026: "i cant drag my mouse in enough directions to get every view i want"): the tilt all the way round, from
# straight down over the top, level, to straight up from under the ground (a hair short of each pole, where the view would flip)
# NEVER UNDER THE GROUND (owner, 17 Oct 2026: "dont let viewer rotate under ground, stop them at this angle", his picture level with the street):
# the tilt from straight down to level, no further
mod=rp(mod,"const PMIN=0.02, PMAX=Math.PI/2-0.002,","const PMIN=0.17, PMAX=Math.PI/2-0.002,")   # (and never flat to the ground: "dont allow rotate to get closer than 3 feet off ground", some ten degrees up at least)
# TURNING ROUND ANY POINT, ZOOMING AT THE MOUSE (owner, 17 Oct 2026: "i still cant drag my mouse in enough directions to get every view i
# want", "it always zooms back in at my feet", "as the point of x y z"): a drag turns the view round the point you grab, the wheel zooms toward
# the point under the mouse, the tilt goes on over the top and under (the camera turned by its own angles, not pointed with an up, so it
# never flips at the poles); the view keeps its place beside him as he walks (UI.off), 0 puts it back on him (src/ui.js)
mod=rp(mod,"ppu*=Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)resize(); else frustum();","const zk0=UI.zk(); ppu*=Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)resize(); else frustum(); UI.zoomStep(zk0);")
mod=rp(mod,"ppuTo=Math.max(3,Math.min(ZMAX,ppuTo*Math.pow(1.0015,-e.deltaY)));","ppuTo=Math.max(3,Math.min(ZMAX,ppuTo*Math.pow(1.0015,-e.deltaY))); UI.wheelAt(e);")
mod=rp(mod,"cam.position.copy(disp).addScaledVector(F,300); cam.lookAt(disp);","UI.view3(a); cam.quaternion.setFromEuler(UI.eul.set(-pitch,a,0,'YXZ')); cam.position.copy(disp).addScaledVector(F,300); if(!UI.persp){ const u=rppu(), cr=UI.snR.set(1,0,0).applyQuaternion(cam.quaternion), cu=UI.snU.set(0,1,0).applyQuaternion(cam.quaternion), x=cam.position.dot(cr), y=cam.position.dot(cu); cam.position.addScaledVector(cr,Math.round(x*u)/u-x).addScaledVector(cu,Math.round(y*u)/u-y); } { const n=.1; if(Math.abs(OCAM.near-n)>.01){ OCAM.near=n; OCAM.updateProjectionMatrix(); } } UI.view3b(a);")   # (isometric: nothing drawn between the camera and the nearest ground on the screen, so the castle at the park's far end, or any building behind you, never stands in front of you; owner 17 Oct 2026, his opening angle looks across the park; taken out 18 Oct 2026: the cut sliced poles, walls and roofs along a line across the screen that moved as he walked, "i can see things like poles form in real time", "everything stop as cut off point": nothing is cut by the camera now)
# LOCKED TO THE PIXELS (owner, 17 Oct 2026: "is there a way to not make the ground look so grainy? it looks bad when i run when i see every pixel
# change nonstop"; his pick: lock to pixels): in the map and isometric views the camera stands only on the picture's own pixel grid (across and
# up the screen, whole picture pixels), so the world moves under you a whole pixel at a time and the ground's pixels keep their colours instead
# of flickering between neighbours as the view glides
# THE VIEWS (owner, 17 Oct 2026: "in display tab add an isometric toggle ... add 1st person view toggle and 3rd person view with zoom in and out"): one camera or the other
mod=rp(mod,"const cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,800);","let cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,800); const OCAM=cam, PCAM=new THREE.PerspectiveCamera(60,1,.05,600);")
mod=rp(mod,"composer.addPass(new RenderPass(scene,cam));","composer.addPass(RPASS=new RenderPass(scene,cam));")
mod=rp(mod,"if(k==='0'){ yawTo=VIEW0.yaw; pitchTo=VIEW0.pitch; ppuTo=VIEW0.ppu; }","if(k==='0'){ yawTo=VIEW0.yaw; pitchTo=VIEW0.pitch; ppuTo=VIEW0.ppu; UI.home(); }")
mod=rp(mod,"if(e.button===2||e.button===1){ drag={x:e.clientX,y:e.clientY};","if(e.button===2||e.button===1){ drag={x:e.clientX,y:e.clientY}; UI.grab(e);")
mod=rp(mod,"yawTo-=(e.clientX-drag.x)*0.008; pitchTo=clampP(pitchTo+(e.clientY-drag.y)*0.006);","UI.orbit(e.clientX-drag.x,e.clientY-drag.y);")
print('ok zoom')

# THE OWNER'S CHARACTERS FROM HIS MODELS (owner, 16 Oct 2026): the goldfish and the bear, coloured, wandering the platform; THE SKELETONS (owner,
# 17 Oct 2026, KayKit's four, rigged and animated) on the far sidewalk: src/npc-skel.js, data/skel.json (tools/skeletons-bake.py)
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);","const SKEL="+open('data/skel.json').read()+";\n"+open('src/npc-map.js').read()+"\n"+open('src/npc-skel.js').read()+"\nconst DRAGON="+open('data/dragon.json').read()+";\n"+open('src/npc-dragon.js').read()+"\n"+"\n"+open('src/fx.js').read()+"\n"+open('src/npc-parts.js').read()+"\n"+open('src/stalls.js').read()+"\n"+open('src/npc-mushroom.js').read()+"\n"+open('src/npc-rig.js').read()+"\n"+open('src/npc-toons.js').read()+"\n"+open('src/npc-squirrel.js').read()+"\n"+open('src/npc-fox.js').read()+"\nconst CREATURES="+open('data/creatures.json').read()+";\n"+open('src/npc-creatures.js').read()+"\nconst UAL="+open('data/ual.json').read()+";\n"+open('src/ual-kit.js').read()+"\n"+open('src/playas.js').read()+"\nconst PAWNS="+open('data/pawns.json').read()+";\n"+open('src/npc-pawns.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")   # (the cyborg and the teddy: deleted, owner 17 Oct 2026, "remove the cyborg + black bear characters"; THE SIX FIGURES, npc-figures.js (their second making, npc-rigged.js with data/<name>.json, kept but not built: the same six twice); the creatures)
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",open('src/pond.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")   # (THE POND in Central Park, owner 18 Oct 2026: src/pond.js)
mod=rp(mod,"  marker.visible=!!target;","  for(const N of NPCS)N.tick(dt,pos);\n  marker.visible=!!target;")
mod=rp(mod,"function collide(p){ const r=0.3;","function collide(p){ if(typeof NPCS!=='undefined')for(const N of NPCS)if(N.lv===LVL&&!N.far)N.push(p); const r=0.36;")   # (his reach round him: 0.3, a fifth bigger with him)
print('ok npcs')


# THE MAP'S OWN EACH FRAME: the level you're on; the lamps lit on it, the two nearest you casting your shadow; a room's walls cut while you're in it
# and its roof gone; the lamps' still shadows drawn once (without you); the pool's water only while you're near it; its floats; swimming
mod=rp(mod,"  if(keys.has('q'))yawTo+=dt*1.8;","  if(MAPLV(py,pos))setPhys(LVL);   // (the level you're on: its walls, its ground, its places)\n  if(keys.has('q'))yawTo+=dt*1.8;")
mod=rp(mod,"PHYROOMS=[{on:true,x0:-1e9,x1:1e9,y0:-1e9,y1:1e9,st:STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ])}];",
 "PHYROOMS=[{on:true,x0:-1e9,x1:1e9,y0:-1e9,y1:1e9,st:STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ])}];\nfunction setPhys(lv){ STATIC=FIX[lv].map(([x0,z0,y0,x1,z1,y1])=>[x0/TL,-z1/TL,y0/TL,x1/TL,-z0/TL,y1/TL]); PHYROOMS[0].st=STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ]); }   // (the ragdoll's room: his level's things)")
mod=rp(mod,"for(const w of cutWalls)w.pl.constant=(Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05&&pitch<1.45)?w.foot:1e6;",
 "for(const w of cutWalls)w.pl.constant=(!UI.persp&&(w.always||Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05)&&pitch<1.45&&(!w.when||w.when()))?w.foot:1e6;   // (only the room you're in)\n  { const bi=BODB.inside(); for(const r of BODB.roof)SEEN(r,!bi); } if(MODS.pool.roof)SEEN(MODS.pool.roof,!MODS.pool.inside(pos.x,pos.z));   // (and its roof off)")
mod=rp(mod,"  renderer.shadowMap.needsUpdate=true; W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();",
 """  const wOn=LVL==='up'&&(MODS.pool.inside(pos.x,pos.z)||Math.hypot(pos.x-POOLR.X((POOLR.bx0+POOLR.bx1)/2),pos.z-POOLR.Z((POOLR.by0+POOLR.by1)/2))<15*TILE);   /* (the water moves only while you're near it or in its building; its picture of what's under it only while it's shown) */
  if(wOn)WATER.step(renderer,dt); renderer.shadowMap.needsUpdate=true; if(wOn&&WATER.mesh.visible)WATER.under(renderer,scene,cam,lamps); WATER.underAll(renderer,scene,cam,lamps); W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();""")
mod=rp(mod,"st.target=ml>0?1:0; const before=st.dist; RIG.step(st,dt);","WATER.feed(st,pos,dt,ml>0,keys); st.target=ml>0?1:0; const before=st.dist; RIG.step(st,dt);")
mod=rp(mod,"collide(pos); if(target&&","collide(pos); if(st.water&&st.water.in&&POOLR.inBasin(pos.x,pos.z)){ const m=0.3; pos.x=Math.max(WATER.X0+m,Math.min(WATER.X0+WATER.W-m,pos.x)); pos.z=Math.max(WATER.Z0+m,Math.min(WATER.Z0+WATER.D-m,pos.z)); }   // (swimming: within the basin's walls)\n    if(target&&")
mod=rp(mod,"if(MOVEK[k]&&!e.repeat&&!RAG.on)RIG.act(st,MOVEK[k]); });","if(st.water&&st.water.in&&(k===' '||k==='j')){ st.water.dive=true; e.preventDefault(); } else if(MOVEK[k]&&!e.repeat&&!RAG.on)RIG.act(st,MOVEK[k]); });")
mod=rp(mod,"if(MOVEK[k])RIG.release(st,MOVEK[k]); });","if(k===' '||k==='j'){ if(st.water)st.water.dive=false; } if(MOVEK[k])RIG.release(st,MOVEK[k]); });")
mod=rp(mod,"if(!RAG.on&&(trip||hit>12)){","if(!RAG.on&&!(st.water&&st.water.level!=null)&&(trip||hit>12)){")
mod=rp(mod,"looseDraw();\nlet looseAcc",open('src/floats.js').read()+"\nlooseDraw();\nlet looseAcc")   # (THE BOATS in the pool, owner 17 Oct 2026: boats.js)
mod=rp(mod,"const PHYOU={m:null,","let PHYZ0=0; const PHYOU={m:null,")
mod=rp(mod,"fj=AY-(p[2]*TL-py)*PPU/VS","fj=AY-((p[2]-PHYZ0)*TL-py)*PPU/VS")
mod=rp(mod,"  if(loose.length)RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);","  if(loose.length||FLOATS.bodies.some(b=>Math.hypot(b.x[0]*TL-pos.x,-b.x[1]*TL-pos.z)<2.5))RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);   // (his figure for the physics only when something he could push is near)")
mod=rp(mod,"if(nst>=6)looseAcc=0; looseDraw();","if(nst>=6)looseAcc=0; looseDraw();\n  { const px=FLOATS.px??pos.x, pz=FLOATS.pz??pos.z, k=1/Math.max(dt,1e-3); FLOATS.step(dt,{inWater:!!(st.water&&st.water.in),x:pos.x,z:pos.z,vx:(pos.x-px)*k,vz:(pos.z-pz)*k}); FLOATS.px=pos.x; FLOATS.pz=pos.z; }")
head=rp(head,'<div><b>Space</b> jump','<div>The bodega, Ghost Street, the apartment house and the subway · jump into the Hudson to swim · <b>Space</b> (held) under</div>\n  <div><b>Space</b> jump')
mod=rp(mod,"const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0;","const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0; { const a=(QS.get('at')||'').split(',').map(Number); if(a.length>=2&&a.every(isFinite)){ pos.set(a[0],0,a[1]); py=a[2]||0; } }   // (a test's: start at x,z[,height])")
# GETTING AROUND and THE MENU (owner, 17 Oct 2026): src/ui.js, and its hooks in the frame and the keys
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",open('src/physbody.js').read()+"\n"+open('src/sfx.js').read()+"\n"+open('src/lines.js').read()+"\n"+open('src/ambience.js').read()+"\n"+open('src/ui.js').read()+"\n"+open('src/sndedit.js').read()+"\n"+open('src/mapedit.js').read()+"\n"+open('src/editor.js').read()+"\n"+open('src/animator.js').read()+"\n"+open('src/worldedit.js').read()+"\n"+open('src/use.js').read()+"\n"+open('src/gems.js').read()+"\n"+open('src/looks.js').read()+"\n"+open('src/vitals.js').read()+"\n"+open('src/avatar.js').read()+"\n"+open('src/avmove.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")   # (AV: the avatar editor, Shift+K, src/avatar.js; its SPEED tab and BODY TYPE, src/avmove.js)
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);","if(typeof KIT!=='undefined')for(const th of KIT.things)UI.thing(th);   // (the street kit's named things: a double click walks up to them, once the menu is here)\nresize(); applyTime(0); requestAnimationFrame(frame);")
# (the street's first characters from the owner's models: deleted, owner 17 Oct 2026, the last of them "delete ghost with bag inside and whatever this is"; then the cyborg and the teddy, "remove the cyborg + black bear characters")
mod=rp(mod,"addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); keys.add(k);","addEventListener('keydown',e=>{ const k=UI.key(e); if(!k)return; keys.add(k);")
mod=rp(mod,"addEventListener('keyup',e=>{ const k=e.key.toLowerCase(); keys.delete(k);","addEventListener('keyup',e=>{ const k=UI.key(e); if(!k)return; keys.delete(k);")
mod=rp(mod,"if(k==='f'&&!e.repeat)trip=true;","if(k==='f'&&!e.repeat&&!UI.freeCam&&!UI.fly&&!ED.on)trip=true;")
mod=rp(mod,"else if(MOVEK[k]&&!e.repeat&&!RAG.on)RIG.act(st,MOVEK[k]); });","else if(MOVEK[k]&&!e.repeat&&!RAG.on&&!UI.freeCam&&!ED.on&&!(UI.fly&&k===' '))RIG.act(st,MOVEK[k]); });   // (the free camera's keys and flying's Space aren't his moves)")
i=mod.index("renderer.domElement.addEventListener('pointerdown',e=>{ if(e.button!==0)return;"); j=mod.index("target=hit.clone(); });",i)+len("target=hit.clone(); });")
mod=mod[:i]+"// (a left click: walks him there unless it was a drag: the menu's code, src/ui.js)"+mod[j:]
mod=rp(mod,"  if(MAPLV(py,pos))setPhys(LVL);","  if(UI.freeCam?MAPLV(UI.camT.y-.9,UI.camT):MAPLV(py,pos))setPhys(LVL);   // (the free camera shows the level it's on)")
mod=rp(mod,"\n  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;}","\n  UI.camStep(dt,a,up,dn,lf,rt); if(UI.freeCam||ED.on)up=dn=lf=rt=false;   // (the free camera takes the walking keys)\n  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;}")
mod=rp(mod,"collide(pos); if(st.water&&st.water.in&&POOLR.inBasin(pos.x,pos.z)){","if(UI.fly)UI.flyStep(0); else collide(pos); if(st.water&&st.water.in&&POOLR.inBasin(pos.x,pos.z)){")
mod=rp(mod,"    py+=(groundY(pos.x,pos.z)-py)*Math.min(1,dt*20); P.x=pos.x/TL;","    if(UI.fly)UI.flyStep(dt); else py+=(groundY(pos.x,pos.z)-py)*Math.min(1,dt*20); P.x=pos.x/TL;   // (flying: up and down as you hold Space and Shift, through anything)\n   ")
mod=rp(mod,"  disp.set(pos.x,py,pos.z); F.set(","  if(UI.freeCam)disp.copy(UI.camT); else disp.set(pos.x,py,pos.z); F.set(")
head=rp(head,'<div><b>Right-drag</b> or <b>Q</b> / <b>E</b>, <b>Z</b> / <b>X</b> turn and tilt</div>','<div><b>Drag</b> move the map · <b>Right-drag</b> (or <b>Shift</b> + drag), <b>Q</b> / <b>E</b>, <b>Z</b> / <b>X</b> turn and tilt · <b>0</b> back on him</div>\n  <div><b>C</b> free camera · <b>G</b> fly through walls (<b>Space</b> up, <b>Shift</b> down)</div>')
head=rp(head,'<div class="dim"><b>H</b> hide this</div>','<div class="dim"><b>Esc</b> menu: map, display, keys · <b>H</b> hide this</div>')
# HIS SHAPE and THE OUTLINE (owner, 17 Oct 2026): src/editor.js; each piece's change on its frame; the outline pass off unless turned on
W3PATCH=("0,0,0,1); }); };","0,0,0,1); if(W3.E&&W3.E[i])W3.applyE(W3.PM.value[i],W3.E[i],F.o); if(W3.HIDE[i])W3.PM.value[i].makeScale(0,0,0); }); };   // (his shape as edited: src/editor.js)")
mod=rp(mod,*W3PATCH)
mod=rp(mod,"W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU);","W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); if(ED.on)ED.tick();")
mod=rp(mod,"W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(0,lampW)*0.9);","W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(0,lampW)*0.9); if(ED.on)W3.tint.setRGB(1,1,1);   // (shaping him: in full light)")
mod=rp(mod,"W3.shadowPass(renderer); OUTL.render(renderer,scene,cam); composer.render();","W3.shadowPass(renderer); if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render();")
mod=rp(mod,"{ const sp=new ShaderPass(OUTL.pass); composer.addPass(sp);","{ const sp=new ShaderPass(OUTL.pass); composer.addPass(sp); OUTL.sp=sp; sp.enabled=!!OUTL.on;")
# STOPPING AT ONCE (owner, 17 Oct 2026: "when i stop walking ... im sliding a little"): the rig's own snap, the game's for you (47-you-jointed);
# the close view of HIS SHAPE on his middle; the double click's walk to a thing each frame
mod=rp(mod,"const cloud=RIG.bake(0.5,1), st=RIG.create();","const cloud=RIG.bake(0.5,1), st=RIG.create(); st.snap=true;")
mod=rp(mod,"if(UI.freeCam)disp.copy(UI.camT); else disp.set(pos.x,py,pos.z);","if(UI.freeCam)disp.copy(UI.camT); else{ UI.follow&&UI.follow(); disp.set(pos.x,py+(ED.on?0.85:0)+(window.PLAYAS&&PLAYAS.on&&PLAYAS.nb?PLAYAS.nb.lift*.7:0),pos.z); disp.add(UI.off); }   /* (the camera up with him off the ground: playas.js) */")
mod=rp(mod,"  marker.visible=!!target;","  UI.goTick(); UI.runTick();\n  marker.visible=!!target;")
head=rp(head,'<div><b>Click</b> the ground to walk there</div>','<div><b>Double-click</b> the ground to walk there, or a thing to go to it</div>')
# THE NEON, REAL (owner, 17 Oct 2026: "the light isnt taking into account its surroundings", "match the style", "totally disappears when diff
# angles ... just laid on map point at me"): its letters as glowing tubes with depth (a little block for every lit square of the game's
# lettering) where the flat painted plate was; its light in the window among them, casting shadows, so the walls keep it to the window, the
# pavement in front and the shop behind; and every glow in the picture stepped and dithered in square blocks, as the game's light is
mod=rp(mod,"MK.neon=(x,y,z,s,c)=>{ PNAME='neon sign'; const W=tw(s,2)+4, f=face(W,14,null,[[s,c,2,2]],FL(y),x-W/FP/2,z+7,W/FP);\n  const p=prop([WF(x-.3,x+.3,y),Bw(x-W/FP/2,x+W/FP/2,y,-.12,-.04,z-7,z+7,c,{foot:0,em:1,fj:f,fi:()=>null,top:()=>null})]); LAMPS.push({x,y:y+.4*WD(y),z,r:2.2,c:[c[0]/255,c[1]/255,c[2]/255],prop:p}); return p; };",
"MK.neon=(x,y,z,s,c)=>{ PNAME='neon sign'; const W=tw(s,2)+4, cells=[]; txt((a,b)=>cells.push([a,b]),s,2,2,c,2);\n  const p=prop([WF(x-.3,x+.3,y)]); NEONS.push({x,y,z,W,cells,c}); LAMPS.push({x,y:y+.3*WD(y),z,r:2.2,c:[c[0]/255,c[1]/255,c[2]/255],prop:p,neon:true}); return p; };   // (the tubes and their light: bodbuild.js)")
mod=rp(mod,"  for(const l of BOD.LAMPS){ const cm=Math.max(...l.c);","""  // the neon's tubes: a glowing block for each lit square of its letters (2 art px), a tube's depth, read from both sides of the glass
  // a halo's picture: an oval of light in three steps (bright, mid, faint), each step's edge broken by a grain (no halftone grid: owner, 17 Oct 2026), in square pixels
  const HALO=(c,W,H)=>{ const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), im=g.createImageData(W,H), B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const dx=(i+.5)/W*2-1, dy=(j+.5)/H*2-1, d=Math.hypot(dx,dy), t=(s0=>s0-Math.floor(s0))(Math.sin(i*12.9898+j*78.233)*43758.5453), s=d<.42+(t-.5)*.12?.5:d<.68+(t-.5)*.14?.26:d<.96+(t-.5)*.12?.1:0, q=(j*W+i)*4;
      im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=Math.round(s*255); }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  for(const N of NEONS){ const n=N.cells.length/4, k=1/24, geo=new THREE.BoxGeometry(2*k*TILE,Y(2)-Y(0),2*k*TILE*.8), me=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color(N.c[0]/255*1.1,N.c[1]/255*1.1,N.c[2]/255*1.1)}),n), m4=new THREE.Matrix4(); let i=0;
    for(const [a,b] of N.cells){ if(a%2||b%2)continue; m4.makeTranslation(X(N.x-N.W*k/2+(a+1)*k),Y(N.z+7-(b+1)),Z(N.y-.08)); me.setMatrixAt(i++,m4); }
    me.count=i; me.castShadow=false; me.receiveShadow=false; scene.add(me);
    // ITS GLOW (owner, 17 Oct 2026: "the glow is still a blur and vanishes instantly from certain angles"): a halo in the world, not a blur on the
    // screen: square pixels in three steps, dithered where they meet, the tube's colour added over what's behind; it faces you from any side,
    // a little toward you so the glass and the wall don't cut it, so it's there from every angle
    { const w=N.W*k*TILE*2, h=(Y(14)-Y(0))*2.6, m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:HALO(N.c,Math.round(N.W*k*24*2/1.2),Math.round(14*2.6/1.2)),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      const at=new THREE.Vector3(X(N.x),Y(N.z),Z(N.y-.08)), f=new THREE.Vector3(); m.position.copy(at); m.renderOrder=2;
      m.onBeforeRender=(r,s,c)=>{ m.quaternion.copy(c.quaternion); c.getWorldDirection(f); m.position.copy(at).addScaledVector(f,-.3); m.updateMatrixWorld(); }; scene.add(m); } }
  for(const l of BOD.LAMPS){ const cm=Math.max(...l.c);""")
# HIS BODY IN A PHYSICS ENGINE (owner, 17 Oct 2026): src/physbody.js, after the rig has placed him each frame
mod=rp(mod,"const go=(st.dist-before)/PPU;","const go=(st.dist-before)/PPU*(typeof PLAYAS!=='undefined'&&PLAYAS.on&&PLAYAS.K?PLAYAS.K:1);")   # (NIMBLE: the mannequin runs a third faster, src/playas.js)
mod=rp(mod,"W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); if(ED.on)ED.tick();","W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); if(typeof PLAYAS!=='undefined')PLAYAS.tick(dt,B); PB.step(dt,B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,groundY(pos.x,pos.z),RAG.on); if(ED.on)ED.tick();")
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
head=rp(head,"ell(p,add(H,V(-6.7,-1.8,-1.0)),V(1.3,1.9,1.3)))});","ell(p,add(H,V(-6.7,-1.8,-1.0)),V(1.3,1.9,1.3)),rbox(p,add(H,V(0,-2.6,6.35)),V(0.95,1.75,1.25),0.45))});")   # (A NOSE, owner 17 Oct 2026: "give all playable characters noses")
head=rp(head,"const MATS=Object.keys(RAMP)","RAMP.sole=['#3a2c22','#30241b','#251b14','#140e0a']; RAMP.eye=['#5a3a26','#4c311f','#3c2618','#24160d']; RAMP.eyeW=['#f4f0e8','#e8e2d6','#c8c0b0','#8a8274']; RAMP.pupil=['#2a1c18','#241814','#1c120f','#100a08']; RAMP.lid=['#b4896e','#a67c62','#8e6650','#5e4232']; const MATS=Object.keys(RAMP)")   # (his eyes' colour: the character editor, src/looks.js)
head=rp(head,"return {restOf,IDF,","return {rbox,ell,rcone,box,OVL,begin,beginUp,legIK,START,mkMove:move,ARMMOVES,fine:v=>{ FINEHAND=!!v; },farOnly:v=>{ FAR=!!v; },restOf,IDF,")
mod=rp(mod,"B=RIG.pose(st); ragBlend(B); ragStrikes(B,J0,J0t?(now-J0t)/1000:0); J0=B.J; J0t=now; }","if(!ASTEP.you.B||RAG.blend||ED.anim||ASTEP.gate(ASTEP.you,dt)){ B=ED.anim?ED.animPose():RIG.pose(st); ragBlend(B); ragStrikes(B,J0,J0t?(now-J0t)/1000:0); J0=B.J; J0t=now; ASTEP.you.B=B; } else { B=ASTEP.you.B; PHYOU.strikes=[]; } }")   # (your pose stepped as everyone's: ASTEP, map-pre.js; the strikes judged only from pose to pose; a blend out of the ragdoll and the animator every frame)
# THE MUSICIAN (owner, 17 Oct 2026): the game's guitarist, its files read from the game as they are (the guitar, its recordings, the tunes,
# his hands), the few things they take from the game's cast and sound stood in for here; then src/musician.js puts him on the bar's stage
# (owner, 17 Oct 2026: "move him to the bar"); his right wrist's place on the guitar a number of ours (GTWR: "fix the guitarist arm")
import base64
GA=os.path.join(S,'..','audio','guitar.mp3')
gtsrc='''
// ---- THE GAME'S CAST AND SOUND, AS THE GUITARIST NEEDS THEM (stand-ins: his standing pose, the sound's way out, no scene to wait for, the
// recordings instead of the simulated strings) ----
const CAST={}, PLAY221={seeking:false,pre:0}, PLAYA={}, GTPHYS={model:false,ok:false}, SND={ctx:null,on:true,out:null}, GTWR={R:[-3.22,3.15,2.06]};
// (castPose, the cast's poses: the game's own, with the pianist's files below)
'''
gtsrc+="const GTMP3='data:audio/mpeg;base64,"+base64.b64encode(open(GA,'rb').read()).decode()+"';\n"
for f in ['47-play-3-guitar-1-body.js','47-play-3-guitar-samples.data.js','47-play-3-guitar-2-tunes.js','47-play-3-guitar-3-hands.js']:
    t=open(S+f).read()
    if f.endswith('body.js'): t=rp(t,"fetch('audio/guitar.mp3')","fetch(GTMP3)")
    if f.endswith('hands.js'): t=rp(t,"R:gtAt(-3.22,3.15,2.06)}","R:gtAt(...GTWR.R)}")
    gtsrc+='\n'+t
# THE PIANIST (owner, 17 Oct 2026, the bar "with all musicians"): the game's 47-play-5-piano (his tuxedo, the bench and the 88 keys as pieces
# of his, the book of pieces, his fingers on the keys, the real grand's recordings) read word for word, the cast's poses and arm reach from
# 47-play-1-cast (the few lines they need), the recordings embedded; then src/pianist.js seats him at the stored bar's grand
PA=os.path.join(S,'..','audio','piano.mp3')
pnsrc="\n// ---- THE CAST'S POSES AND REACH, AS THE PIANIST NEEDS THEM (47-play-1-cast's, word for word) ----\nconst POSES={}, CV=RIG.V; function castStep(){}\n"+body(S+'47-play-1-cast.js','// HIS HANDS WHERE THEY MUST BE','// ---- A PLAYER')
pnsrc+="const PNMP3='data:audio/mpeg;base64,"+base64.b64encode(open(PA,'rb').read()).decode()+"';\n"
for f in ['47-play-5-piano-samples.data.js','47-play-5-piano-1-sound.js','47-play-5-piano-2-music.js','47-play-5-piano-3-hands.js']:
    t=open(S+f).read()
    if f.endswith('sound.js'): t=rp(t,"fetch('audio/piano.mp3')","fetch(PNMP3)")
    pnsrc+='\n'+t
# THE SINGER (owner, 17 Oct 2026): the game's 47-play-6-woman, 47-play-7-singer and 47-zzz-bar-singer word for word (her voice's loudness and
# side from where she stands here: SGM, src/singer.js), after the music engine (47-music-1-engine, -2-instruments, -1b-samples: the bar's echo
# her voice goes into, and the drummer's kit)
sgsrc="\n// ---- THE GAME'S MUSIC ENGINE (the instruments' physics, the bar's echo; word for word) ----\nconst IMV={on:false}, ONLINE={others:new Map()}, BARM={on:false}, LEVEL=0; const IMKITBAR={k:1.1,sp:1.35};\n"
for f in ['47-music-1b-samples.data.js','47-music-1-engine.js','47-music-2-instruments.js','47-play-6-woman.js','47-play-7-singer.js','47-zzz-bar-singer.js']:
    t=open(S+f).read()
    if f=='47-zzz-bar-singer.js':
        t=rp(t,"function voxStep(dt,now){ if(!voxChain())return; const c=SND.ctx, ct=c.currentTime, S=BAR.singer, d=Math.hypot(S.x-P.x,S.y-P.y);","function voxStep(dt,now){ if(!voxChain())return; const c=SND.ctx, ct=c.currentTime, d=SGM.dist();")
        t=rp(t,"VOX.out.gain.setTargetAtTime(SND.on?.5*Math.max(.18,1-d/10):0,ct,.08); { const [sx]=toS(...vw(S.x,S.y)), [px]=toS(...vw(P.x,P.y)); VOX.pan.pan.setTargetAtTime(Math.max(-.8,Math.min(.8,(sx-px)/120)),ct,.1); }","VOX.out.gain.setTargetAtTime(SND.on?.5*Math.max(0,1-d/14):0,ct,.08); VOX.pan.pan.setTargetAtTime(SGM.pan(),ct,.1);")
    sgsrc+='\n// ==== '+f+"\n"+t
# THE DRUMMER (owner, 17 Oct 2026): the game's 47-zzz-bar-octopus-1-body and -2-play word for word (the pets' part maker E they lean on, and the
# bar's line-up stood in for: he's alone on the stage); src/drummer.js sits him at the stored bar's kit
drsrc="\n// ---- THE OCTOPUS DRUMMER'S FILES (the game's, word for word) ----\nconst E=(x,y,z,rx,ry,rz,c,yaw=0,pit=0,rol=0,grp)=>[x,y,z,rx,ry,rz,yaw,pit,rol,c,grp]; const pupPaint=()=>null; const BARP={lead:'d'};\n"
for f in ['47-zzz-bar-octopus-1-body.js','47-zzz-bar-octopus-2-play.js']: drsrc+='\n// ==== '+f+"\n"+open(S+f).read()
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",gtsrc+"\n"+open('src/musician.js').read()+"\n"+open('src/npc-walker2.js').read()+pnsrc+"\n"+open('src/pianist.js').read()+sgsrc+"\n"+open('src/singer.js').read()+drsrc+"\n"+open('src/drummer.js').read()+"\n"+open('src/bandstand.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")
mod=rp(mod,"  for(const N of NPCS)N.tick(dt,pos);","  for(const N of NPCS)N.tick(dt,pos); MUS.tick(dt);")
mod=rp(mod,"  for(const N of NPCS)N.tick(dt,pos); MUS.tick(dt);","  DRESS.tick(dt,pos); RINGX.tick(dt); SUBX.tick(dt); { const r=MODS.apts.tick(); if(r)solids=r; } { const r2=STORE.stackTick&&STORE.stackTick(); if(r2)solids=r2; } for(const N of NPCS)N.tick(dt,pos); if(FIRE)FIRE.tick(dt); FIGFX.tick(dt,pos); FLAME.tick(dt,pos); MUS.tick(dt); PNM.tick(dt); SGM.tick(dt); DRM.tick(dt); STAGE.tick(dt);")   # (DRESS: the street's kit; the apartment house's floors; FIGFX: the figures' effects and the park's cut of the trees before you; the stored bar's musicians, one on the stage at a time: src/bandstand.js)
# (NO SHADOW ACNE, owner 17 Oct 2026: the one lamp shadow, 1024 a face, held off the surface it falls on: LITE in map-post.js)
# THE CLOCK (owner, 17 Oct 2026: "add the option to control the time", 7pm when the game opens): src/clock.js; ticked each frame
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",open('src/clock.js').read()+"\n"+open('src/rooms.js').read()+"\n"+open('src/weather.js').read()+"\n"+open('src/sky.js').read()+"\n"+open('src/lookfx.js').read()+"\n"+open('src/skyline.js').read()+"\n"+open('src/where.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")   # (sky.js the dome, skyline.js the far; where.js: where he left off, kept in the browser; owner, 17 Oct 2026)
# ONLY THE ROOM YOU'RE IN (owner, 17 Oct 2026): src/rooms.js, set just before the picture's drawn
mod=rp(mod,"MUS.tick(dt); PNM.tick(dt);","MUS.tick(dt); BWK.tick(dt); PNM.tick(dt);")   # (the bearded Walker, src/npc-walker2.js; owner, 18 Oct 2026)
mod=rp(mod,"if(wOn)WATER.step(renderer,dt); renderer.shadowMap.needsUpdate=true;","ROOMS.tick(); STORE.tick(); BF.tick(dt); if(wOn)WATER.step(renderer,dt); WATER.tickAll(renderer,dt,pos); renderer.shadowMap.needsUpdate=true;")   # (STORE: the storeroom's roofs and bound, map-post.js)
mod=rp(mod,"  UI.goTick(); UI.runTick();","  UI.goTick(); UI.runTick(); CLOCK.tick(dt); VIT.tick(dt); AMB.tick(dt); LINES.tick(dt);")   # (AMB: the ambience, LINES: what they say: src/ambience.js, src/lines.js)   # (VIT: your health and stamina, src/vitals.js)
# A NEW VERSION, SAID (src/version.js): the build's moment, BUILDV, and the page's note when a newer one is out (owner, 18 Oct 2026)
import time as _t
_bv=str(int(_t.time()))
head=rp(head,'<title>The Market</title>','<title>The Market</title>\n<meta name="market-build" content="'+_bv+'">')   # (the build's moment near the top of the page, read by an open copy without the store: src/version.js)
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);","const BUILDV="+_bv+";\n"+open('src/version.js').read()+"\n"+open('src/bvh.js').read()+"\nresize(); applyTime(0); requestAnimationFrame(frame);")   # (BVH: three-mesh-bvh for the rays, src/bvh.js)
# THE OLD GAME'S FINAL TOUCH (src/oldlook.js): one pass after the picture's colours, its night and glow set each frame
mod=rp(mod,"CLOCK.tick(dt); VIT.tick(dt);","CLOCK.tick(dt); VIT.tick(dt); LOOK.tick(); WHERE.tick(dt);")
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",open('src/oldlook.js').read()+"\nLOOK.sp=new ShaderPass(LOOK.shader); composer.addPass(LOOK.sp); LOOK.sp.uniforms.uNight=LOOK.night; LOOK.sp.uniforms.uCool=LOOK.cool; LOOK.sp.uniforms.uGlowK=LOOK.glowK;\nresize(); applyTime(0); requestAnimationFrame(frame);")   # (VIT: your health and stamina, src/vitals.js)
# (the keys' turn and tilt: not in the isometric view, where Q and E go a quarter round: ui.js)
mod=rp(mod,"  if(keys.has('q'))yawTo+=dt*1.8; if(keys.has('e'))yawTo-=dt*1.8; if(keys.has('z'))pitchTo=clampP(pitchTo-dt*1.2); if(keys.has('x'))pitchTo=clampP(pitchTo+dt*1.2);","  if(UI.view!=='iso'){ if(keys.has('q'))yawTo+=dt*1.8; if(keys.has('e'))yawTo-=dt*1.8; if(keys.has('z'))pitchTo=UI.clampV(pitchTo-dt*1.2); if(keys.has('x'))pitchTo=UI.clampV(pitchTo+dt*1.2); }")
head=rp(head,'<b>V</b> wave','<b>B</b> wave · <b>V</b> change the view')
# THE BUDGET (owner, 17 Oct 2026: "render what is only absolutely needed"): the characters moved and drawn only when near or seen (NPCS.tick,
# npc-map.js); every lamp made a record, eight lights standing in (LITE, map-post.js); then every shader compiled while the loading line shows,
# for the picture's own target (the composer's), once without a room's cut and once with it (its six planes), so nothing stutters when first seen
mod=rp(mod,"} for(const N of NPCS)N.tick(dt,pos); if(FIRE)","} CITY.tick(dt,pos); NPCS.tick(dt,pos); if(FIRE)")   # (the metro's train: metro.js)   # (CITY: the city's spine, src/city.js: errands walked, the schedule)
# NOT DRAWN UNLESS SEEN (owner, 17 Oct 2026: "dont render anyone not visible"): the characters out of the picture put out of sight only round its drawing (NPCS.cull, npc-map.js)
mod=rp(mod,"ROOMS.tick(); STORE.tick(); BF.tick(dt);","ROOMS.tick(); INTERIORS.tick(); STORE.tick(); NPCS.cull(true); INTERIORS.cull(true); BF.tick(dt);")   # (INTERIORS: an interior drawn only near its door, src/interiors.js; owner, 17 Oct 2026)
mod=rp(mod,"if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render();","if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render(); NPCS.cull(false); INTERIORS.cull(false);")
# THE HUDSON, REAL WATER (owner, 18 Oct 2026: the Deep Water mockup's water in the game, three ways side by side: src/river.js): its ripples and the
# scene under it before the picture, the murk round a camera under it put back after; him in it (the pool's way: the level and the bed each frame)
mod=rp(mod,"W3.shadowPass(renderer); if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render(); NPCS.cull(false);","RIVER.pre(renderer,scene,cam,dt,pos); W3.shadowPass(renderer); if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render(); RIVER.post(scene); NPCS.cull(false);")
mod=rp(mod,"RINGX.tick(dt);","RINGX.tick(dt); RIVER.tick(dt,pos); RIVER.hud();")
mod=rp(mod,"WATER.feed(st,pos,dt,ml>0,keys);","if(!RIVER.feed(st,pos,dt,ml>0,keys))WATER.feed(st,pos,dt,ml>0,keys);")
mod=rp(mod,"if(!RIVER.feed(st,pos,dt,ml>0,keys))WATER.feed(st,pos,dt,ml>0,keys);","if(window.BOAT&&BOAT.on){ BOAT.carry(st,pos); heading=BOAT.hd; } else if(!RIVER.feed(st,pos,dt,ml>0,keys))WATER.feed(st,pos,dt,ml>0,keys);")   # (in the rented rowboat: carried, seated, never swimming: src/fishing.js)
mod=rp(mod,"    const ml=Math.hypot(mx,mz), busy=st.move;","    if(window.BOAT&&BOAT.on){ BOAT.steer(dt,mx,mz); mx=0; mz=0; target=null; } const ml=Math.hypot(mx,mz), busy=st.move;")   # (WASD rows the boat, not his legs)
mod=rp(mod,"if(UI.fly)UI.flyStep(dt); else py+=(groundY(pos.x,pos.z)-py)*Math.min(1,dt*20);","if(UI.fly)UI.flyStep(dt); else if(window.BOAT&&BOAT.on)py=BOAT.py; else py+=(groundY(pos.x,pos.z)-py)*Math.min(1,dt*20);")
mod=rp(mod,"if(st.water&&st.water.in&&POOLR.inBasin(pos.x,pos.z)){ const m=0.3;","if(st.water&&st.water.in&&RIVER.swim)RIVER.clamp(pos); else if(st.water&&st.water.in&&POOLR.inBasin(pos.x,pos.z)){ const m=0.3;")   # (the pool's box only while in the pool's basin: a jump into the Hudson before the river had him put him in the pool, owner 18 Oct 2026)
# AT REST AT ONCE (owner, 17 Oct 2026: "when something stops it doesnt keep moving slightly and gradually"): the view's turn, tilt and zoom reach their mark and stop
mod=rp(mod,"yaw+=(yawTo-yaw)*ease; pitch+=(pitchTo-pitch)*ease;","yaw=Math.abs(yawTo-yaw)<1e-4?yawTo:yaw+(yawTo-yaw)*ease; pitch=Math.abs(pitchTo-pitch)<1e-4?pitchTo:pitch+(pitchTo-pitch)*ease;")
mod=rp(mod,"ppu*=Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)","ppu=Math.abs(ppuTo/ppu-1)<1e-4?ppuTo:ppu*Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)")
mod=rp(mod,"const dt=Math.min(0.05,(now-last)/1000); last=now;","const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now;   /* (never backwards: the first frame's time can be older than the page's start) */ if(METRO)METRO.train.tick(dt,pos);   /* (the metro's train first: a rider is carried with it before he walks and is drawn, metro.js) */")
mod=rp(mod,"resize(); applyTime(0); requestAnimationFrame(frame);",open('src/clip.js').read()+"\n"+open('src/weeds.js').read()+"\n"+open('src/forage.js').read()+"\n"+open('src/fishing.js').read()+"\n"+open('src/bfly.js').read()+"\n"+open('src/veggies.js').read()+"\n"+open('src/mines.js').read()+"\n"+open('src/drone.js').read()+"\n"+open('src/newsstand.js').read()+"\n"+open('src/rooftops.js').read()+"\n"+open('src/ghosts.js').read()+"\n"+open('src/goodsphys.js').read()+"\n"+open('src/studio.js').read()+"\n"+open('src/city.js').read()+"\n"+open('src/nav.js').read()+"\n"+open('src/residents.js').read()+"\nconst VEHD="+open('data/trashbag.json').read()+";\n"+"\n"+open('src/civic.js').read()+"\n"+open('src/duties.js').read()+"\n"+open('src/lives.js').read()+"\n"+open('src/walkers.js').read()+"\n"+open('src/jobs.js').read()+"\n"+open('src/mail.js').read()+"\n"+open('src/perf.js').read()+"\n"+open('src/interiors.js').read()+"""
CLIP.run(); WEEDS.init(); WEEDS.lawnInit(); DRONE.init(); NEWS.init(); ROOFS.init(); GHOSTS.init(); GPH.init(); LIVES.init(); STORE.shrineFix&&STORE.shrineFix(); LITE.init(); PERFX.split(); PERFX.maps(); INTERIORS.build(); STORE.later(); setTimeout(BVH.load,2500); setTimeout(NAV.load,4000); window.__started=true; window.__scene=scene; window.LIVES=LIVES; window.__dbg={VIT,AV,ED,W3,PERFX,LIVES,BVH,NAV,MAPK:{BOD,RING,AVE,CASTLE,POOLR,LAY,PARK,MAPSTAIR,MODS,cutWalls,AWAY:typeof AWAY!=='undefined'?AWAY:null},info:()=>renderer.info.render,gl:()=>{ const g=renderer.getContext(), x=g.getExtension('WEBGL_debug_renderer_info'); return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):''; },tris:()=>{ const F=new THREE.Frustum(), M=new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(M); let n=0; scene.traverseVisible(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine)return; if(o.frustumCulled&&!F.intersectsObject(o))return; const g=o.geometry; if(!g)return; const c=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0, d=g.drawRange, k=Math.min(c,d.count===Infinity?c:d.count); n+=(o.isMesh?k/3:o.isPoints?k:k/2)*(o.isInstancedMesh?o.count:1); }); return Math.round(n); },pos:()=>[pos.x,py,pos.z],OBJS,SOL,FIX,NPCS,renderer,scene,THREE,camera:cam,MAPG,LITE,lamps,INTERIORS,SAVE,SFX,AMB,LINES,SNDED,LOOKS,OUTL,DITH,ground:(x,z)=>groundY(x,z),lvl:()=>LVL,CLOCK,WHERE,ROOMS,hd:()=>heading,setHd:h=>{ heading=h; },setRes:i=>{ RESI=i; resize(); },res:()=>RESI,UI,yaw:()=>[yaw,yawTo],px:()=>[SCL,RES(),pxS(),vpu()/art()],cam:(y,p,z,d)=>{ if(y!=null)yawTo=y; if(p!=null)pitchTo=p; if(z!=null)ppuTo=z; if(d!=null)UI.dist=d; },cv:()=>({yaw,pitch,ppu,PPU,dist:UI.dist,TILE,heading,keys:[...keys],look:UI.look}),camO:()=>cam,go:(x,z)=>{ target=new THREE.Vector3(x,py,z); },collide:(x,z)=>{ const p={x,z}; collide(p); return [p.x,p.z]; }};   // (go: walk him there; collide: where a spot is pushed out of the level's solids: tests/mapedit.cjs)
{ const t0=performance.now(), PL=[0,1,2,3,4,5].map(()=>new THREE.Plane(new THREE.Vector3(0,1,0),1e6)); if(FREE)ROOMS.nearAll(); renderer.setRenderTarget(composer.readBuffer); renderer.compile(scene,cam);
  if(!FREE){ renderer.clippingPlanes=PL; renderer.render(new THREE.Scene(),cam); renderer.compile(scene,cam); renderer.clippingPlanes=[]; } renderer.setRenderTarget(null);   /* (FREE: the near cut's planes on every material first, rooms.js; no room planes to compile for) */   /* (the empty picture only sets the six planes for the second compile) */
  window.WARMMS=Math.round(performance.now()-t0); }
resize(); applyTime(0); requestAnimationFrame(frame);""")
   # (V: the views, owner 17 Oct 2026)
# ONLY WHAT'S NEEDED, DRAWN (owner, 17 Oct 2026, the audit's fixes: src/perf.js): the rooms' insides and the musicians set each frame; the pool's floats and the butterflies run only near them
mod=rp(mod,"ROOMS.tick(); INTERIORS.tick(); STORE.tick(); NPCS.cull(true); INTERIORS.cull(true); BF.tick(dt);","ROOMS.tick(); INTERIORS.tick(); PERFX.tick(); STORE.tick(); NPCS.cull(true); INTERIORS.cull(true); if(PERFX.bfNear())BF.tick(dt);")   # (PERFX after the interiors: perf.js)
mod=rp(mod,"  { const px=FLOATS.px??pos.x,","  if(PERFX.poolNear()){ const px=FLOATS.px??pos.x,")
# LOADING (owner, 17 Oct 2026, the live site's first moments: the help panel, the shadows box and "--" showed while the page loaded, its dots
# garbled): nothing but its line (owner, 17 Oct 2026: "slowly fade in, stay for 3 seconds, then fade out": 1.5 s in, 3 s, 1.5 s out; the dark kept till both it and the game are done: ui.js), "I took a trip to The Strangest Flea Market..." (owner: "loading should always say" it), till the game runs (ui.js takes it away); the page's letters read as UTF-8
head=rp(head,'<div id="hud">','<style>@keyframes ldfade{0%{opacity:0}25%{opacity:1}75%{opacity:1}100%{opacity:0}} #loading span{opacity:0;animation:ldfade 6s ease-in-out forwards} #loading{transition:opacity .5s}</style><script>window.__ld0=performance.now();</script><div id="loading" style="position:fixed;inset:0;display:grid;place-items:center;font:12px Silkscreen,monospace;letter-spacing:2px;color:#8a8f9c;background:#0e1016;z-index:50"><span>I took a trip to The Strangest Flea Market...</span></div>\n<div id="hud" hidden>')
head=rp(head,'<div id="stat">--</div>\n<div id="shd">','<div id="stat" hidden>--</div>\n<div id="shd" hidden>')
head='<meta charset="utf-8">\n'+head
# BREATHS WHILE LOADING (owner, 17 Oct 2026, "this artifact isn't responding"): the module script given a moment back to the browser every
# 40 ms while it builds (tools/yields.py)
sys.path.insert(0,'tools'); from yields import yields
import re
a="const grab=(name,fn)=>{ const n0=scene.children.length; fn();"; assert a in mod; mod=mod.replace(a,"const grab=async(name,fn)=>{ const n0=scene.children.length; await fn();")
mod,ng=re.subn(r"^grab\('(\w+)',\(\)=>\{",r"await grab('\1',async()=>{",mod,flags=re.M); print('builders awaited:',ng)
i=mod.index('<script type="module">')+len('<script type="module">'); j=mod.index('</script>',i); body,ny=yields(mod[i:j]); mod=mod[:i]+'\n'+body+mod[j:]; print('breaths:',ny)
os.makedirs('dist',exist_ok=True); open('dist/market.html','w').write(head+mod); print('built dist/market.html')

# THE AVATAR EDITOR, STANDALONE (owner, 18 Oct 2026: "create standalone avatar editor ... default poses ... spread all limbs out ... sculpt ...
# rotate 360, tilt, export ... as many presets as possible"; then "i want it based on our new walker and our game"): dist/avatar.html, the game's
# own Walker and the game's own editors on a page of their own: the rig exactly as built above (its script lifted from the game page's head), his
# mesh with the game's own patch, save.js, HIS SHAPE, his moves, his looks, the avatar editor, his speeds and body types word for word; the
# body types' table read from playas.js (the mannequin itself not built); src/avatar-pre.js before them, src/avatar-post.js after
a=head.index("<script>\n// the game's own Walker"); b=head.index('</script>',a); rigjs=head[a+len('<script>'):b]
bt=re.search(r"const BT=(\{.*?\});\s*\n\s*PLAYAS\.BODIES",open('src/playas.js').read(),re.S).group(1)
avcode='\n'.join([open('src/avatar-pre.js').read(),rp(open('src/walker3d.js').read(),*W3PATCH),open('src/save.js').read(),
  'window.PLAYAS={BT:'+bt+',bodyType:"AVERAGE",body(){}}; PLAYAS.BODIES=Object.keys(PLAYAS.BT);',
  open('src/editor.js').read(),open('src/animator.js').read(),open('src/looks.js').read(),open('src/avatar.js').read(),open('src/avmove.js').read(),open('src/avatar-post.js').read()])
page=open('src/avatar-page.html').read(); assert page.count('/*RIG*/')==1 and page.count('/*CODE*/')==1
open('dist/avatar.html','w').write(page.replace('/*RIG*/',rigjs).replace('/*CODE*/',avcode)); print('built dist/avatar.html')

