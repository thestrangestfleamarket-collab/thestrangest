// ---- CENTRAL PARK'S ENTRANCE (owner, 17 Oct 2026: "import the low poly forest pack, and anything else you can use to build out central park
// entrance and a little bit further. make the trees to scale (5-20 times bigger than people)"): across the road from the shops, past the far
// sidewalk, the park's low stone wall runs the street's length, its gate open opposite the bodega between two stone posts; inside, the park's
// hexagonal pavers lead in to a round, and on past it, between lawns, with the park's outcrops of rock among them, the park's lamps along
// the way. The ground and the wall are painted faces as the street's are (the game's grass, the pavers and the stone drawn here); the rocks
// his pack's models, coloured flat as the pack colours them (tools/forest-bake.py, data/forest.json), one mesh, throwing the sun's and the
// lamps' shadows. NO TREES (owner, 17 Oct 2026: "remove all the trees from game for now, i want to start clean"): the forest pack's oaks,
// spruces and dead trees and the terrain collection's cedars are gone from the map and the data. Where you can't walk: the wall, the posts, the rocks, the lamps' poles ----
const PARK={x0:50,x1:108,y0:-61,y1:-2,gate:[92.5,99.5],round:[96,-47,7]};   // (bodega tiles, x0 and x1 the street's run, set below; the gate's run along the wall; the round's middle and reach; y1: deep enough for the castle in its back-left corner, castle.js)
PARK.sway={value:0}; PARK.tick=()=>{ PARK.sway.value=performance.now()/1000; };   // (the oaks' sway: their crowns' clock)
grab('park',()=>{ PARK.x0=BOD.MAP.x0; PARK.x1=BOD.MAP.x1; const X=BOD.XS, Z=BOD.ZS, Y=BOD.YS, {hash,grain,speck,grassCol}=BOD.g, P=PARK, U=TILE/.84, f32=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer), b8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  // ---- THE PATH: from the gate to the round, the round, and on north-east; the rest lawn
  // (owner, 17 Oct 2026: "wider path"; then "make the path go straight through ... the circle in the middle of the park ... two paths going through
  // the entire park meeting in the middle"): two straight ways 7.2 tiles wide, one from the gate to the back, one from end to end, crossing at
  // the round (7 tiles across) in the park's middle; the gate moved along the wall to meet it
  const path=(x,y)=>{ const [cx,cy,r]=P.round; return Math.abs(x-cx)<3.6||Math.abs(y-cy)<3.6||Math.hypot(x-cx,y-cy)<r; };
  // the pavers: the park's hexagons (a third of a tile across), each its own grey, a dark seam between, worn here and there
  const hexCol=(x,y)=>{ const s=1/3, w=s*Math.sqrt(3), row=Math.floor(y/(s*1.5)), ox=(row&1)?w/2:0, col=Math.floor((x-ox)/w), cx=(col+.5)*w+ox, cy=row*s*1.5+s;
    const dx=Math.abs(x-cx), dy=Math.abs(y-cy), e=Math.max(dx/w*2,(dy+dx/Math.sqrt(3))/s), seam=e>.86, n=hash(col,row,71), g=grain(x,y,73,2), c=seam?42+8*n:58+22*n+10*(g-.5); return speck([c,c,c+2],x,y,75); };
  // THE LAWN: lawnCol (gamekit.js: the all-green lawn with its sprouts and weeds, every grass on the map)
  const lawn=BOD.g.lawnCol;
  const CS=CASTLE.stair, groundCol=(x,y)=>x>=CS.x0&&x<CS.x1&&y>=CS.y0&&y<CS.y1?null:path(x,y)?hexCol(x,y):lawn(x,y);   // (open where the castle's stair goes down)
  const flat=(x0,y0,x1,y1,z,col)=>BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),'G');   // (row 0 of the picture is y0, as gbox's tops are: it was mirrored, unseen while the park was symmetric)
  // (in strips, so no one picture is too wide for the atlas)
  for(let x=P.x0;x<P.x1;x+=29)flat(x,P.y0+.5,Math.min(P.x1,x+29),P.y1,0,groundCol);
  // ---- THE WALL: the park's grey stone in courses, its cope; the gate's posts, taller, capped
  const stone=(i,j,k)=>{ const row=Math.floor(j/9), col=Math.floor((i+(row&1)*7)/14), m=(j%9)>=8||((i+(row&1)*7)%14)>=13, n=hash(col,row,k), g=grain(i/24,j/24,k+1,1.5), c=m?70+10*n:104+34*n+18*(g-.5); return [c,c*.99,c*.95]; };
  const face=(a,b,c,d,w,h,fn)=>BOD.bq(a,b,c,d,BOD.faceTex(w,h,(i,j)=>BOD.C(fn(i,j))),'G');
  const block=(x0,y0,x1,y1,z0,z1,k,top)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], w=x1-x0, dp=y1-y0;
    face([a,f,d],[b,f,d],[b,f,c],[a,f,c],w*24,dp*24,top||((i,j)=>{ const n=grain(i/24,j/24,k+5,1.2); const c=118+22*n; return speck([c,c,c*.96],i/24,j/24,k+7); }));
    face([a,e,c],[b,e,c],[b,f,c],[a,f,c],w*24,z1-z0,(i,j)=>stone(i,j,k)); face([b,e,d],[a,e,d],[a,f,d],[b,f,d],w*24,z1-z0,(i,j)=>stone(i,j,k+1));
    face([a,e,d],[a,e,c],[a,f,c],[a,f,d],dp*24,z1-z0,(i,j)=>stone(i,j,k+2)); face([b,e,c],[b,e,d],[b,f,d],[b,f,c],dp*24,z1-z0,(i,j)=>stone(i,j,k+3)); };
  const WH=32, PH=54, [g0,g1]=P.gate;
  block(P.x0,P.y0,g0-1,P.y0+.5,0,WH,11); block(g1+1,P.y0,P.x1,P.y0+.5,0,WH,15);
  for(const [x,k] of [[g0-1,21],[g1,25]]){ block(x,P.y0-.2,x+1,P.y0+.7,0,PH,k); block(x-.1,P.y0-.3,x+1.1,P.y0+.8,PH,PH+5,k+4); }   // (each post, its cap)
  // ---- THE ROCKS: his pack's models, each at its place, its height in metres, turned as it likes; one mesh
  const F=Object.assign({},FOREST,PROPS), mesh=(list,leafy,solid=true,sway=false)=>{ const P3=[], C3=[], SW=[], c=new THREE.Color(); for(const [key,x,y,m,turn,lift] of list){ const ph=hash(Math.round(x*7),Math.round(y*7),131)*6.28; const D=F[key], p=f32(D.p), col=b8(D.c), k=b8(D.k), s=m/.84*TILE, ca=Math.cos(turn||0), sa=Math.sin(turn||0), ox=X(x), oz=Z(y), oy=(lift||0)/.84*TILE;
      for(let i=0;i<p.length;i+=3){ const px=p[i]*s, py=p[i+1]*s+oy, pz=p[i+2]*s; P3.push(ox+px*ca-pz*sa,py,oz+px*sa+pz*ca); if(sway)SW.push(Math.max(0,p[i+1])*s,ph); const t=Math.floor(i/9), sh=k[t]===0?.86+.28*hash(t,x*7,y*3):k[t]===2?.9+.2*hash(t,x*5,y*9):.92+.16*hash(t,x*3,y*5);
        c.setRGB(col[i]/255*sh,col[i+1]/255*sh,col[i+2]/255*sh,THREE.SRGBColorSpace); C3.push(c.r,c.g,c.b); }
      if(solid){ const r=Math.max(.3,D.trunk*s*.5); SOL.up.push([ox-r,oz-r,ox+r,oz+r]); FIX.up.push([ox-r,oz-r,0,ox+r,oz+r,leafy?Y(60):s*.9]); } }   // (where you can't walk: the trunk, the rock; not the undergrowth)
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals(); if(sway)g.setAttribute('aSw',new THREE.Float32BufferAttribute(SW,2));
    // (nothing cut away or dithered round you: owner, 17 Oct 2026, "no dithering and vanishing anything")
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    // (the oaks sway, owner 17 Oct 2026: "make them sway gently": each crown leans a little and back in the air, slow, its own rhythm; the trunk's
    // foot still, the lean growing with the square of the height up the tree; a deliberate motion, as the idle moves are. (Made visible, owner 17 Oct
    // 2026, "why arent the trees gently swaying?": it was some 15 cm at a 10 m oak's top over 11 s; now some 35 cm every 4 s, in slow gusts)
    if(sway){ mat.onBeforeCompile=sh=>{ sh.uniforms.uSw=PARK.sway; sh.vertexShader='attribute vec2 aSw; uniform float uSw;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n { float h=aSw.x*aSw.x*.1, g=.7+.3*sin(uSw*.23+aSw.y); transformed.x+=sin(uSw*1.6+aSw.y)*h*.035*g; transformed.z+=sin(uSw*1.2+aSw.y*1.7)*h*.025*g; }'); }; mat.customProgramCacheKey=()=>'oaksway'; }
    const me=new THREE.Mesh(g,mat); me.castShadow=true; me.receiveShadow=true; scene.add(me); return me; };
  // THE OAKS (owner, 17 Oct 2026: "lets add just trees that look like this back, make them sway gently, vary in size and spread out through the
  // park, not blocking views or paths"; his go on the plan): sixteen of the pack's three oaks, 6 to 11 m, each crown its true width and kept clear
  // of the ways, the round, the shrine's garden, the stalls, the campfire and the pillars, a tile and a half apart at least (placed once by that
  // rule: tools-free, the list below)
  const TREES=[["OakTree3", 108.9, -31.3, 6.2], ["OakTree2", 81.0, -29.9, 10.9], ["OakTree2", 64.3, -54.8, 8.7], ["OakTree1", 128.2, -35.7, 6.4], ["OakTree2", 57.8, -36.9, 10.5], ["OakTree2", 137.8, -29.9, 10.2], ["OakTree2", 113.1, -39.1, 10.2], ["OakTree2", 127.6, -56.5, 8.3], ["OakTree1", 140.9, -38.6, 5.8], ["OakTree2", 82.8, -55.1, 10.8], ["OakTree2", 56.3, -54.8, 8.2], ["OakTree2", 115.6, -55.7, 8.9], ["OakTree2", 74.3, -54.9, 8.6], ["OakTree3", 136.3, -56.0, 6.3], ["OakTree1", 87.0, -36.5, 5.7], ["OakTree2", 121.9, -29.0, 8.3]].map((t,i)=>[t[0],t[1],t[2],t[3],hash(i,5,77)*6.28]); PARK.trees=mesh(TREES,true,true,true);
  PARK.rocks=mesh([['BigRock3',87.5,-37,2.6,1.8],['BigRock5',126,-41,2.4,.2],['Rock_12',55.5,-41,1,1],['Rock1',111,-41,.6,2],['BigRock1',66,-35,2,1.1]],false);
  // ---- THE UNDERGROWTH (owner, 17 Oct 2026, "start importing google drive assets based on most recent": his Free Shrubs Flowers and Mushrooms
  // pack and the LowPoly-Psionic pack, tools/props-bake.py → data/props.json): bushes, flowers, grass, mushrooms and stones over the lawn at hashed
  // spots, off the path; logs and a bit of fence; the pots and plants of his pots & plants pack by the gate
  { const UG=[['bush1',1.1],['bush2',1.2],['bush3',1.3],['bush4',1.5],['bush5',1.1],['flower1',.5],['flower2',.7],['flower3',.3],['flower4',.7],['flower5',.35],['flower6',.8],['grass1',.5],['grass2',.6],['grass1',.45],['grass2',.55],['mushroom1',.3],['mushroom2',.35],['mushroom3',.3],['mushroom4',.25],['stone2',.5],['stone3',.2],['stones1',.25]];
    const list=[]; for(let i=0;i<90;i++){ const x=P.x0+2+hash(i,3,91)*(P.x1-P.x0-4), y=P.y1-1-Math.pow(hash(i,7,93),1.6)*(P.y1-P.y0-3); if(path(x,y)||path(x+1,y)||path(x-1,y)||path(x,y+1)||path(x,y-1)||hash(i,11,95)<.3)continue; if(x>67&&x<77&&y>-44&&y<-24)continue; { const [a,b,c,d]=CASTLE.b; if(x>a-1.6&&x<b+1.6&&y>c-1.6&&y<d+1.6)continue; }   /* (not in the castle) */   /* (the Moon Shrine's garden: store.js) */   // (fewer, more of them toward the back, a tile clear of the path)
      const [k,m]=UG[Math.floor(hash(i,13,97)*UG.length)]; list.push([k,x,y,m*(.8+.4*hash(i,17,99)),hash(i,19,101)*6.28]); }
    list.push(['log1',65,-41,.5,.4],['log2',86,-40.5,.6,1.2],['log3',104,-39,.6,2.6],['fence1',57,-41,.8,0],['fence1',126,-41,.8,1.57],['pmushroom1',62.5,-36.5,.6,0],['pmushroom2',63.5,-36.2,.5,1],['pmushroom3',61.8,-35.5,.55,2]);
    PARK.under=mesh(list,false,false);
    // THE TOY STALL (his TOYS-Psionic pack: the bear, the monkey, the penguin, the pig, the sheep, the bunny): a flea-market table inside the gate,
    // the six toys set out on it; the park's own monument, a pair of ruined pillars by the round, a sitting log, flower beds along the path
    block(g1+2.2,P.y0+2.2,g1+5.2,P.y0+3.1,0,27,41,()=>[150,110,70]); block(g1+2.3,P.y0+2.3,g1+2.55,P.y0+2.55,0,27,43,()=>[96,70,46]); block(g1+4.85,P.y0+2.75,g1+5.1,P.y0+3,0,27,45,()=>[96,70,46]);
    SOL.up.push([X(g1+2.2),Z(P.y0+2.2),X(g1+5.2),Z(P.y0+3.1)]); FIX.up.push([X(g1+2.2),Z(P.y0+2.2),0,X(g1+5.2),Z(P.y0+3.1),Y(27)]);   // (the table stands solid)
    PARK.toys=mesh([['toybear',g1+2.6,P.y0+2.65,.32,2.6,.95],['toymonkey',g1+3.1,P.y0+2.65,.3,2.9,.95],['toypenguin',g1+3.6,P.y0+2.65,.3,3.3,.95],['toypig',g1+4.1,P.y0+2.65,.26,2.7,.95],['toysheep',g1+4.6,P.y0+2.65,.28,3.1,.95],['toybunny',g1+2.85,P.y0+2.4,.3,3,.95]],false,false);
    // THE ODDITIES STALL west of the gate (the Psionic pack's crate, gems and gold), and THE CAMPFIRE east of the round by a sitting log and a
    // wood pile (the terrain collection's), its smoke the game's own (FIGFX, npc-figures.js), its light a flicker
    block(g0-5.2,P.y0+2.2,g0-2.2,P.y0+3.1,0,27,47,()=>[150,110,70]); block(g0-5.1,P.y0+2.3,g0-4.85,P.y0+2.55,0,27,49,()=>[96,70,46]); block(g0-2.55,P.y0+2.75,g0-2.3,P.y0+3,0,27,51,()=>[96,70,46]);
    SOL.up.push([X(g0-5.2),Z(P.y0+2.2),X(g0-2.2),Z(P.y0+3.1)]); FIX.up.push([X(g0-5.2),Z(P.y0+2.2),0,X(g0-2.2),Z(P.y0+3.1),Y(27)]);
    PARK.odd=mesh([['crate',g0-4.6,P.y0+2.65,.4,.2,.95],['gem1',g0-3.9,P.y0+2.5,.22,.5,.95],['gem2',g0-3.5,P.y0+2.8,.2,1.5,.95],['gem3',g0-3.1,P.y0+2.5,.24,2.5,.95],['gold',g0-2.6,P.y0+2.7,.08,.8,.95],['gem1',g0-4,P.y0+2.85,.18,3.5,.95]],false,false);
    PARK.camp=mesh([['campfire',108,-54.5,.13,0],['woodpile',109.5,-55.6,.5,.6]],false,true); PARK.fire={x:X(108),z:Z(-54.5),y:.3};
    { const L=new THREE.PointLight(new THREE.Color(1,.6,.25),4,5*TILE,1.6); L.position.set(X(108),.7,Z(-54.5)); scene.add(L); PARK.fireL=L; }
    // (the plesiosaur skeleton: removed, owner 17 Oct 2026, "remove the dinosaur bones from game")
    PARK.more=mesh([['pillar1',90,-41.5,3.2,.3],['pillar2',102,-41.5,2.6,1.2],['sitlog',106.5,-55.4,.5,.4],
      ['daisy',92.3,-56,.35,0],['tulip',92.3,-54,.4,1],['rose',92.3,-52,.45,2],['sunflower',99.7,-56,.9,.5],['lily',99.7,-54,.4,1.5],['daisy',99.7,-52,.35,2.5],['hbush1',91.5,-58.8,.9,0],['hbush2',100.5,-58.8,.9,1.2]],false,false);
    for(const [x,y,m] of [[90,-41.5,3.2],[102,-41.5,2.6]]){ const r=.35*m/.84*.2; SOL.up.push([X(x)-r,Z(y)-r,X(x)+r,Z(y)+r]); FIX.up.push([X(x)-r,Z(y)-r,0,X(x)+r,Z(y)+r,m/.84*TILE]); }   // (the pillars stand solid)
    PARK.pots=mesh([['pot5',g0-1.7,P.y0+1.1,.5,0],['paradise1',g0-1.7,P.y0+1.1,1.2,.3,.45],['pot1',g1+1.7,P.y0+1.1,.45,0],['sanseveria',g1+1.7,P.y0+1.1,.9,1.2,.4],['pot3',g0-3,P.y0+1.2,.35,0],['calathea',g0-3,P.y0+1.2,.5,2,.3],['pot2',g1+3,P.y0+1.2,.35,0],['paradise',g1+3,P.y0+1.2,.8,.8,.3]],false,true); }
  // ---- THE LAMPS: the park's, a pole and a lantern, along the path; each a warm light at night (the clock's)
  // (owner, 17 Oct 2026: "lights taller and smaller in park"): a thin pole 7 tiles high and a small lantern, along the edges of the way in, round
  // the round and up the way on
  const LP=[[92,-57],[100,-57],[92,-38],[100,-38],[58,-51.2],[74,-42.8],[118,-51.2],[134,-42.8]];   // (along both ways' edges)
  for(const [x,y] of LP){ const h0=170, h1=179, w=.17; block(x-.07,y-.07,x+.07,y+.07,0,h0,31,()=>[40,40,44]); block(x-w-.04,y-w-.04,x+w+.04,y+w+.04,h1,h1+3,35,()=>[48,46,44]);
    for(const [a,b,c,d] of [[[X(x-w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y+w)]],[[X(x+w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y-w)]],
        [[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y+w)],[X(x-w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y-w)]],[[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y-w)],[X(x+w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y+w)]]])
      BOD.bq(a,b,c,d,BOD.faceTex(9,9,(i,j)=>i<1||i>7||j<1||j>7?[48,46,44]:[255,236,190,1]),'G');   // (the lantern's glass glows)
    const L=new THREE.PointLight(new THREE.Color(1,.86,.62),6,9*TILE,1.6); L.position.set(X(x),Y(h0+4),Z(y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
    SOL.up.push([X(x-.1),Z(y-.1),X(x+.1),Z(y+.1)]); FIX.up.push([X(x-.1),Z(y-.1),0,X(x+.1),Z(y+.1),Y(h0)]); }
  // where you can't walk: the wall each side of the gate, the posts
  const sol=(x0,y0,x1,y1,h)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Y(h)]); };
  sol(P.x0,P.y0,g0-1,P.y0+.5,WH); sol(g1+1,P.y0,P.x1,P.y0+.5,WH); sol(g0-1,P.y0-.2,g0,P.y0+.7,PH); sol(g1,P.y0-.2,g1+1,P.y0+.7,PH);
  BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide}));
  MODS.park={BOUND:{x0:X(P.x0+.3),x1:X(P.x1-.3),z0:Z(P.y0),z1:Z(P.y1-.3)},inside:()=>false}; });
