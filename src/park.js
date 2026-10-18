// ---- CENTRAL PARK'S ENTRANCE (owner, 17 Oct 2026: "import the low poly forest pack, and anything else you can use to build out central park
// entrance and a little bit further. make the trees to scale (5-20 times bigger than people)"): across the road from the shops, past the far
// sidewalk, the park's low stone wall runs the street's length, its gate open opposite the bodega between two stone posts; inside, the park's
// hexagonal pavers lead in to a round, and on past it, between lawns, with the park's outcrops of rock among them, the park's lamps along
// the way. The ground and the wall are painted faces as the street's are (the game's grass, the pavers and the stone drawn here); the rocks
// his pack's models, coloured flat as the pack colours them (tools/forest-bake.py, data/forest.json), one mesh, throwing the sun's and the
// lamps' shadows. NO TREES (owner, 17 Oct 2026: "remove all the trees from game for now, i want to start clean"): the forest pack's oaks,
// spruces and dead trees and the terrain collection's cedars are gone from the map and the data. Where you can't walk: the wall, the posts, the rocks, the lamps' poles ----
const PARK={x0:50,x1:108,y0:-61,y1:12.5,gate:[92.5,99.5],round:[96,-47,7]};   /* (y1 12.5 since 17 Oct 2026, owner: "expand central park by 25%": a quarter more lawn, north) */   // (bodega tiles, x0 and x1 the street's run, set below; the gate's run along the wall; the round's middle and reach; y1: deep enough for the castle in its back-left corner, castle.js)
PARK.sway={value:0}; PARK.windK={value:1}; /* (windK: the wind's strength on the crowns, weather.js) */ PARK.tick=()=>{ PARK.sway.value=performance.now()/1000; };   // (the oaks' sway: their crowns' clock)
// (moved and its edges moved on the map's layout, LAY: everything here in the park's own tiles, X and Z carrying the move: PARK.ox, oy; its edges' moves e: west, front (the wall), east, back)
grab('park',()=>{ const PO=LAY.o('park'), PE=LAY.e('park'); PARK.ox=PO.x; PARK.oy=PO.y; PARK.x0=50+PE[0];   /* (not the street's run: it goes on west to the loop's west street) */ PARK.x1=AVE.x0+PE[2];   /* (the park's east edge the Avenue's west side, not the street's end: map-pre.js) */ PARK.y0+=PE[1]; PARK.y1+=PE[3]; const X=x=>BOD.XS(x+PO.x), Z=y=>BOD.ZS(y+PO.y), Y=BOD.YS, {hash,grain,speck,grassCol}=BOD.g, P=PARK, U=TILE/.84, f32=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer), b8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  // THE WAYS CROSS IN THE MIDDLE (owner, 17 Oct 2026: "put the paths that cross through central park directly in the middle ... space things out
  // logically"): the round at the park's very middle, the street's gate and the Avenue's gate on its two ways; what stood by the old round
  // (its rocks, the monument, the campfire, the logs, the flower beds) the same way off the new one (RX, RY: from the old round, 96, -47)
  P.round=[(P.x0+P.x1)/2,(P.y0+P.y1)/2,7]; P.gate=[P.round[0]-3.5,P.round[0]+3.5]; const RX=x=>x-96+P.round[0], RY=y=>y+47+P.round[1];
  // ---- THE PATH: from the gate to the round, the round, and on north-east; the rest lawn
  // (owner, 17 Oct 2026: "wider path"; then "make the path go straight through ... the circle in the middle of the park ... two paths going through
  // the entire park meeting in the middle"): two straight ways 7.2 tiles wide, one from the gate to the back, one from end to end, crossing at
  // the round (7 tiles across) in the park's middle; the gate moved along the wall to meet it
  const path=(x,y)=>{ const [cx,cy,r]=P.round; return Math.abs(x-cx)<3.6||Math.abs(y-cy)<3.6||Math.hypot(x-cx,y-cy)<r; };
  // the pavers: the park's hexagons (a third of a tile across), each its own grey, a dark seam between, worn here and there
  const hexCol=(x,y)=>{ const s=1/3, w=s*Math.sqrt(3), row=Math.floor(y/(s*1.5)), ox=(row&1)?w/2:0, col=Math.floor((x-ox)/w), cx=(col+.5)*w+ox, cy=row*s*1.5+s;
    const dx=Math.abs(x-cx), dy=Math.abs(y-cy), e=Math.max(dx/w*2,(dy+dx/Math.sqrt(3))/s), seam=e>.86, n=hash(col,row,71), g=grain(x,y,73,2), hp=hash(Math.floor(x*24),Math.floor(y*24),77);
    // (each paver bevelled (lit toward the top of the picture, shaded below), moss and weeds in the seams where a broad noise lets them: owner, 18 Oct 2026, "realistic textures")
    if(seam){ if(cvNoise(x/2.5,y/2.5,79)>.6&&hp<.65)return [[52,82,40],[66,98,48],[44,70,34]][Math.floor(hash(Math.floor(x*24),Math.floor(y*24),81)*3)]; const c=36+8*n; return [c,c,c+2]; }
    let c=58+22*n+10*(g-.5); if(e>.74)c*=(y<cy)?1.14:.84; return speck([c,c,c+2],x,y,75); };
  // THE LAWN: lawnCol (gamekit.js: the all-green lawn with its sprouts and weeds, every grass on the map)
  const lawn=BOD.g.lawnCol;
  const CS=(S=>({x0:S.x0-PO.x,x1:S.x1-PO.x,y0:S.y0-PO.y,y1:S.y1-PO.y}))(CASTLE.stair), groundCol=(x,y)=>x>=CS.x0&&x<CS.x1&&y>=CS.y0&&y<CS.y1?null:path(x,y)?hexCol(x,y):lawn(x,y);   // (open where the castle's stair goes down)
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
  // THE EAST WALL (owner, 17 Oct 2026, the Avenue): the same wall up the park's east side along the Avenue's west sidewalk, its gate (the Avenue's
  // gate, two posts) opposite the museum; the park's back stays open lawn
  const EG=PARK.egate=[P.round[1]-1.5,P.round[1]+1.5], ex=P.x1-.5;
  block(ex,P.y0+.5,P.x1,EG[0]-1,0,WH,31); block(ex,EG[1]+1,P.x1,P.y1,0,WH,35);
  for(const [y,k] of [[EG[0]-1,41],[EG[1],45]]){ block(ex-.2,y,P.x1+.2,y+1,0,PH,k); block(ex-.3,y-.1,P.x1+.3,y+1.1,PH,PH+5,k+4); }
  // THE WEST AND NORTH WALLS (the loop, 17 Oct 2026): the same wall along the west street and the north street, a gate in each where the park's
  // middle way meets it; the castle's own curtain wall the park's corner (the walls stop at it)
  const CB=[CASTLE.b[0]-PO.x,CASTLE.b[1]-PO.x,CASTLE.b[2]-PO.y,CASTLE.b[3]-PO.y], wx=P.x0, ny=P.y1-.5, WG=PARK.wgate=[P.round[1]-1.5,P.round[1]+1.5], NG=PARK.ngate=[P.round[0]-3.5,P.round[0]+3.5];
  const wTop=Math.min(P.y1,CB[2]), nLeft=Math.max(P.x0,CB[1]);
  block(wx,P.y0+.5,wx+.5,WG[0]-1,0,WH,51); block(wx,WG[1]+1,wx+.5,wTop,0,WH,55);
  for(const [y,k] of [[WG[0]-1,57],[WG[1],61]]){ block(wx-.2,y,wx+.7,y+1,0,PH,k); block(wx-.3,y-.1,wx+.8,y+1.1,PH,PH+5,k+4); }
  block(nLeft,ny,NG[0]-1,P.y1,0,WH,65); block(NG[1]+1,ny,P.x1-.5,P.y1,0,WH,69);
  for(const [x,k] of [[NG[0]-1,71],[NG[1],75]]){ block(x,ny-.2,x+1,P.y1+.2,0,PH,k); block(x-.1,ny-.3,x+1.1,P.y1+.3,PH,PH+5,k+4); }
  // ---- THE ROCKS: his pack's models, each at its place, its height in metres, turned as it likes; one mesh
  // THE TREES' LOOK, three mockups (owner, 17 Oct 2026, the oaks' crowns striped and toothed by the sun's shadow map, then "i want smooth
  // realistic shadows and lighting like gradient radial etc"), ?treelook=N, off by default (the game as it is). On the park's things (the oaks, the
  // undergrowth, the pots); the leaves told from the rest by their green:
  // 1 SOFT SHADOWS: the crowns keep the sun's real shadows (soft, as the world's), the acne gone: each leaf held 12 cm further off its face
  //   toward the shadow map, and the oaks' own shadow pass swaying with them (it stood still while the crowns moved: the stripes crawled);
  // 2 GRADIENT: no shadow map on the crowns (they still throw theirs on the ground): each crown lit as one round shape (its leaves' normals
  //   pointed out from its middle, so the light runs across it in one gradient, not face by face), softly wrapped round, and darkened
  //   underneath and toward the inside (an occlusion by its height and its depth in the crown);
  // 3 REAL: 2's round crown and occlusion with 1's shadows on it, a leaf's shadow letting a little light through (foliage, not stone)
  const TL=[0,1,2,3].includes(+QS.get('treelook'))&&QS.get('treelook')!==null?+QS.get('treelook'):3;   // (3 the game's: looked at side by side, 17 Oct 2026, the round crown lit in one gradient with soft shadows; ?treelook=0 the old, 1, 2 the others)
  const treeLook=sh=>{ sh.vertexShader='attribute vec3 aTr; varying vec3 vTr;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vTr=aTr;')
      .replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point)LightShadows\[ i \]\.shadowNormalBias/g,'($&+aTr.z*.12)'));   // (the leaves 12 cm further off: no self-acne)
    let f='varying vec3 vTr; float TW=0., TSH=1.;\n'+sh.fragmentShader
      .replace('diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:','diffuseColor.rgb*=vTr.z>.5&&'+(TL>1)+'?1.:wn.y>=max(wn.x,wn.z)?1.:');   // (2, 3: a round crown has no fixed side shades)
    if(TL>1)f=f.replace('#include <lights_lambert_pars_fragment>',THREE.ShaderChunk.lights_lambert_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );','float dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + TW ) / ( 1. + TW ) );'))   // (the light wrapped a little round the crown: leaves let it through)
      .replace('#include <shadowmap_pars_fragment>',THREE.ShaderChunk.shadowmap_pars_fragment.replace(/return shadow;/g,'return mix( 1., shadow, TSH );'))
      .replace('#include <lights_fragment_begin>','if(vTr.z>.5){ TW=.45; TSH=.7; }\n#include <lights_fragment_begin>')
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n if(vTr.z>.5){ float ao=mix(.42,1.,smoothstep(0.,1.,.62*vTr.x+.38*vTr.y)); reflectedLight.directDiffuse*=mix(1.,ao,.6); reflectedLight.indirectDiffuse*=ao; }');   // (darker underneath and inside: most on the open air's light, some on the sun's)
    sh.fragmentShader=f; };
  const F=Object.assign({},FOREST,PROPS), mesh=(list,leafy,solid=true,sway=false)=>{ const P3=[], C3=[], SW=[], TR=[], LF=[], RN=[], c=new THREE.Color(); for(const [key,x,y,m,turn,lift] of list){ const p0=P3.length, ph=hash(Math.round(x*7),Math.round(y*7),131)*6.28; const D=F[key], p=f32(D.p), col=b8(D.c), k=b8(D.k), s=m/.84*TILE, ca=Math.cos(turn||0), sa=Math.sin(turn||0), ox=X(x), oz=Z(y), oy=(lift||0)/.84*TILE;
      for(let i=0;i<p.length;i+=3){ const px=p[i]*s, py=p[i+1]*s+oy, pz=p[i+2]*s; P3.push(ox+px*ca-pz*sa,py,oz+px*sa+pz*ca); if(sway)SW.push(Math.max(0,p[i+1])*s,ph); if(TL)LF.push(col[i+1]>col[i]*1.08&&col[i+1]>col[i+2]*1.08?1:0); const t=Math.floor(i/9), sh=k[t]===0?.86+.28*hash(t,x*7,y*3):k[t]===2?.9+.2*hash(t,x*5,y*9):.92+.16*hash(t,x*3,y*5);
        c.setRGB(col[i]/255*sh,col[i+1]/255*sh,col[i+2]/255*sh,THREE.SRGBColorSpace); C3.push(c.r,c.g,c.b); }
      // (treelook: each vertex's place in its leaves, the crown's height 0 at its foot to 1 at its top, out from its middle 0 to 1 at its edge, leaf or not)
      if(TL){ const q0=p0/3, q1=P3.length/3; let y0=1e9, y1=-1e9, cx=0, cz=0, n=0, r1=1e-3; for(let v=q0;v<q1;v++)if(LF[v]){ y0=Math.min(y0,P3[v*3+1]); y1=Math.max(y1,P3[v*3+1]); cx+=P3[v*3]; cz+=P3[v*3+2]; n++; } cx/=n||1; cz/=n||1;
        for(let v=q0;v<q1;v++)if(LF[v])r1=Math.max(r1,Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)); const cy=(y0+y1)/2, ry=Math.max(1e-3,(y1-y0)/2);
        for(let v=q0;v<q1;v++){ TR.push(LF[v]?(P3[v*3+1]-y0)/Math.max(1e-3,y1-y0):0,LF[v]?Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)/r1:0,LF[v]); RN.push((P3[v*3]-cx)/(r1*r1),(P3[v*3+1]-cy)/(ry*ry),(P3[v*3+2]-cz)/(r1*r1)); } }   // (a leaf: its height in the crown 0 foot to 1 top, out from its middle 0 to 1 at the edge, and the crown's round normal there)
      CLIPX.push({place:'park',name:key,P:P3.slice(p0)});   // (its own faces, for the hitboxes' pass: clip.js)
      if(solid){ const r=Math.max(.3,D.trunk*s*.5); SOL.up.push([ox-r,oz-r,ox+r,oz+r]); FIX.up.push([ox-r,oz-r,0,ox+r,oz+r,leafy?Y(60):s*.9]); } }   // (where you can't walk: the trunk, the rock; not the undergrowth)
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals(); if(sway)g.setAttribute('aSw',new THREE.Float32BufferAttribute(SW,2)); if(TL)g.setAttribute('aTr',new THREE.Float32BufferAttribute(TR,3));
    if(TL>1){ const N=g.attributes.normal.array; for(let v=0;v<LF.length;v++)if(LF[v]){ let x=RN[v*3], y=RN[v*3+1], z=RN[v*3+2]; const l=Math.hypot(x,y,z)||1; x=x/l*.8+N[v*3]*.2; y=y/l*.8+N[v*3+1]*.2; z=z/l*.8+N[v*3+2]*.2; const m=Math.hypot(x,y,z)||1; N[v*3]=x/m; N[v*3+1]=y/m; N[v*3+2]=z/m; } }   // (2, 3: the crown's leaves facing out from its middle, a fifth their own face: one round shape to the light)
    // (nothing cut away or dithered round you: owner, 17 Oct 2026, "no dithering and vanishing anything")
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    // (the oaks sway, owner 17 Oct 2026: "make them sway gently": each crown leans a little and back in the air, slow, its own rhythm; the trunk's
    // foot still, the lean growing with the square of the height up the tree; a deliberate motion, as the idle moves are. (Made visible, owner 17 Oct
    // 2026, "why arent the trees gently swaying?": it was some 15 cm at a 10 m oak's top over 11 s; now some 35 cm every 4 s, in slow gusts)
    const SWG=sway&&(sway===2?'{ float h=aSw.x, g=(.7+.3*sin(uSw*.23+aSw.y))*uWk; transformed.x+=sin(uSw*2.3+aSw.y)*h*.12*g; transformed.z+=sin(uSw*1.9+aSw.y*1.7)*h*.08*g; }':'{ float h=aSw.x*aSw.x*.1, g=(.7+.3*sin(uSw*.23+aSw.y))*uWk; transformed.x+=sin(uSw*1.6+aSw.y)*h*.035*g; transformed.z+=sin(uSw*1.2+aSw.y*1.7)*h*.025*g; }'), swayV=sh=>{ sh.uniforms.uSw=PARK.sway; sh.uniforms.uWk=PARK.windK; sh.vertexShader='attribute vec2 aSw; uniform float uSw,uWk;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+SWG); };
    if(sway||TL){ mat.onBeforeCompile=sh=>{ if(TL)treeLook(sh); if(sway)swayV(sh); }; mat.customProgramCacheKey=()=>'oaksway'+sway+'tl'+TL; }
    const me=new THREE.Mesh(g,mat); me.castShadow=true; me.receiveShadow=TL!==2;
    if(sway&&TL)for(const [k,M] of [['customDepthMaterial',new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking})],['customDistanceMaterial',new THREE.MeshDistanceMaterial()]]){ M.onBeforeCompile=swayV; M.customProgramCacheKey=()=>'oakswayd'+sway; me[k]=M; }   // (their shadow sways with them)
    scene.add(me); return me; };
  // THE OAKS (owner, 17 Oct 2026: "lets add just trees that look like this back, make them sway gently, vary in size and spread out through the
  // park, not blocking views or paths"; his go on the plan): sixteen of the pack's three oaks, 6 to 11 m, each crown its true width and kept clear
  // of the ways, the round, the shrine's garden, the stalls, the campfire and the pillars, a tile and a half apart at least (placed once by that
  // rule: tools-free, the list below)
  // (owner, 17 Oct 2026, the park grown and its ways in the middle: "space things out logically"): set by rule, the same every time: a hashed
  // spot, kept if its crown is clear of the ways and the round, the castle, the shrine, the playground, the stalls and the campfire, and 9
  // tiles from every other oak; 22 of them, 6 to 11 m
  const TREES=(()=>{ const out=[], KEEP=[[CASTLE.b[0]-3,CASTLE.b[2]-3,CASTLE.b[1]+3,CASTLE.b[3]+3],(o=>[o[0]-3,o[1]-3,o[0]+9,o[1]+19])(STORE.shrineO||[69,-45.9]),[P.gate[0]-16,P.y0,P.gate[1]+8,P.y0+12],[RX(108)-5,RY(-54.5)-5,RX(108)+5,RY(-54.5)+5],[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3]];
    for(let i=0;i<600&&out.length<22;i++){ const x=P.x0+4+hash(i,41,7)*(P.x1-P.x0-8), y=P.y0+5+hash(i,43,9)*(P.y1-P.y0-9), m=6+hash(i,47,11)*5, r=m*.42;
      if(Math.abs(x-P.round[0])<3.6+r||Math.abs(y-P.round[1])<3.6+r)continue; if(KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r))continue; if(out.some(o=>Math.hypot(o[1]-x,o[2]-y)<9))continue;
      out.push(['OakTree'+(1+Math.floor(hash(i,53,13)*3)),+x.toFixed(1),+y.toFixed(1),+m.toFixed(1)]); } return out; })();
  PARK.oaks=TREES.map(([k,x,y,m])=>[X(x),Z(y),m]); window.PARKDBG=()=>({oaks:PARK.oaks,TL,progs:renderer.info.programs.length});   // (a test's: where the oaks are, the look, how many shader programs)   // (where the oaks stand, world units: their falling leaves, lookfx.js)
  PARK.rocks=mesh([['BigRock3',87.5,-37,2.6,1.8],['BigRock5',126,-41,2.4,.2],['Rock_12',55.5,-41,1,1],['Rock1',111,-41,.6,2],['BigRock1',66,-35,2,1.1]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]),false);
  // ---- THE UNDERGROWTH (owner, 17 Oct 2026, "start importing google drive assets based on most recent": his Free Shrubs Flowers and Mushrooms
  // pack and the LowPoly-Psionic pack, tools/props-bake.py → data/props.json): bushes, flowers, grass, mushrooms and stones over the lawn at hashed
  // spots, off the path; logs and a bit of fence; the pots and plants of his pots & plants pack by the gate
  { const UG=[['bush1',1.1],['bush2',1.2],['bush3',1.3],['bush4',1.5],['bush5',1.1],['flower1',.5],['flower2',.7],['flower3',.3],['flower4',.7],['flower5',.35],['flower6',.8],['grass1',.5],['grass2',.6],['grass1',.45],['grass2',.55],['mushroom1',.3],['mushroom2',.35],['mushroom3',.3],['mushroom4',.25],['stone2',.5],['stone3',.2],['stones1',.25]];
    const list=[]; for(let i=0;i<90;i++){ const x=P.x0+2+hash(i,3,91)*(P.x1-P.x0-4), y=P.y1-1-Math.pow(hash(i,7,93),1.6)*(P.y1-P.y0-3); if(path(x,y)||path(x+1,y)||path(x-1,y)||path(x,y+1)||path(x,y-1)||hash(i,11,95)<.3)continue; if(x>67&&x<77&&y>-44&&y<-24)continue; { const [a,b,c,d]=CASTLE.b.map((v,i)=>v-(i<2?PO.x:PO.y)); if(x>a-1.6&&x<b+1.6&&y>c-1.6&&y<d+1.6)continue; }   /* (not in the castle) */   /* (the Moon Shrine's garden: store.js) */   // (fewer, more of them toward the back, a tile clear of the path)
      const [k,m]=UG[Math.floor(hash(i,13,97)*UG.length)]; list.push([k,x,y,m*(.8+.4*hash(i,17,99)),hash(i,19,101)*6.28]); }
    list.push(...[['log1',65,-41,.5,.4],['log2',86,-40.5,.6,1.2],['log3',104,-39,.6,2.6],['fence1',57,-41,.8,0],['fence1',126,-41,.8,1.57],['pmushroom1',62.5,-36.5,.6,0],['pmushroom2',63.5,-36.2,.5,1],['pmushroom3',61.8,-35.5,.55,2]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]));
    PARK.under=mesh(list,false,false,LFX.on.has('sway')?2:false);   // (?fx=sway: the undergrowth in the wind too)
    // THE TOY STALL (his TOYS-Psionic pack: the bear, the monkey, the penguin, the pig, the sheep, the bunny): a flea-market table inside the gate,
    // the six toys set out on it; the park's own monument, a pair of ruined pillars by the round, a sitting log, flower beds along the path
    block(g1+2.2,P.y0+2.2,g1+5.2,P.y0+3.1,0,27,41,()=>[150,110,70]); block(g1+2.3,P.y0+2.3,g1+2.55,P.y0+2.55,0,27,43,()=>[96,70,46]); block(g1+4.85,P.y0+2.75,g1+5.1,P.y0+3,0,27,45,()=>[96,70,46]);
    SOL.up.push([X(g1+2.2),Z(P.y0+2.2),X(g1+5.2),Z(P.y0+3.1)]); FIX.up.push([X(g1+2.2),Z(P.y0+2.2),0,X(g1+5.2),Z(P.y0+3.1),Y(27)]);   // (the table stands solid)
    PARK.toys=mesh([['toybear',g1+2.6,P.y0+2.65,.32,2.6,.95],['toymonkey',g1+3.1,P.y0+2.65,.3,2.9,.95],['toypenguin',g1+3.6,P.y0+2.65,.3,3.3,.95],['toypig',g1+4.1,P.y0+2.65,.26,2.7,.95],['toysheep',g1+4.6,P.y0+2.65,.28,3.1,.95],['toybunny',g1+2.85,P.y0+2.4,.3,3,.95]],false,false);
    // THE ODDITIES STALL west of the gate (the Psionic pack's crate, gems and gold), and THE CAMPFIRE east of the round by a sitting log and a
    // wood pile (the terrain collection's), its fire live, embers and smoke going up (fire.js), its light flickering with it
    block(g0-5.2,P.y0+2.2,g0-2.2,P.y0+3.1,0,27,47,()=>[150,110,70]); block(g0-5.1,P.y0+2.3,g0-4.85,P.y0+2.55,0,27,49,()=>[96,70,46]); block(g0-2.55,P.y0+2.75,g0-2.3,P.y0+3,0,27,51,()=>[96,70,46]);
    SOL.up.push([X(g0-5.2),Z(P.y0+2.2),X(g0-2.2),Z(P.y0+3.1)]); FIX.up.push([X(g0-5.2),Z(P.y0+2.2),0,X(g0-2.2),Z(P.y0+3.1),Y(27)]);
    PARK.odd=mesh([['crate',g0-4.6,P.y0+2.65,.4,.2,.95],['gem1',g0-3.9,P.y0+2.5,.22,.5,.95],['gem2',g0-3.5,P.y0+2.8,.2,1.5,.95],['gem3',g0-3.1,P.y0+2.5,.24,2.5,.95],['gold',g0-2.6,P.y0+2.7,.08,.8,.95],['gem1',g0-4,P.y0+2.85,.18,3.5,.95]],false,false);
    PARK.camp=mesh([['campfire',RX(108),RY(-54.5),.13,0],['woodpile',RX(109.5),RY(-55.6),.5,.6]],false,true); PARK.fire={x:X(RX(108)),z:Z(RY(-54.5)),y:.3};
    { const L=new THREE.PointLight(new THREE.Color(1,.6,.25),26,9*TILE,1.6); L.position.set(X(RX(108)),.5*TILE,Z(RY(-54.5))); L.userData.fire=1; scene.add(L); PARK.fireL=L;   // (owner, 18 Oct 2026: "isnt causing any lights or shadows": at 3.6 it lit nothing beside the lamps' 6-40; now as strong as a street light, from the flames' middle, and first for the lamp shadow when near: LITE)
      // its fire live (fire.js): a bed of flames on the logs, embers flying up, smoke rising; the light flickering with it
      PARK.flame=FLAME.add({kind:'bed',name:'campfire',x:X(RX(108)),y:.12*TILE,z:Z(RY(-54.5)),w:.78*TILE,h:.95*TILE,embers:4,smoke:2.2,sk:1.3,light:L,seed:5}); }
    // (the plesiosaur skeleton: removed, owner 17 Oct 2026, "remove the dinosaur bones from game")
    PARK.more=mesh([['pillar1',90,-41.5,3.2,.3],['pillar2',102,-41.5,2.6,1.2],['sitlog',106.5,-55.4,.5,.4],
      ['daisy',92.3,-56,.35,0],['tulip',92.3,-54,.4,1],['rose',92.3,-52,.45,2],['sunflower',99.7,-56,.9,.5],['lily',99.7,-54,.4,1.5],['daisy',99.7,-52,.35,2.5],['hbush1',91.5,-58.8,.9,0],['hbush2',100.5,-58.8,.9,1.2]].map(([k,x,y,...r])=>[k,RX(x),/^(daisy|tulip|rose|sunflower|lily|hbush)/.test(k)?y:RY(y),...r]),false,false); PARK.sitlog=[X(106.5),Z(-55.4)];   // (the log to sit on: use.js)
    for(const [x,y,m] of [[RX(90),RY(-41.5),3.2],[RX(102),RY(-41.5),2.6]]){ const r=.35*m/.84*.2; SOL.up.push([X(x)-r,Z(y)-r,X(x)+r,Z(y)+r]); FIX.up.push([X(x)-r,Z(y)-r,0,X(x)+r,Z(y)+r,m/.84*TILE]); }   // (the pillars stand solid)
    PARK.pots=mesh([['pot5',g0-1.7,P.y0+1.1,.5,0],['paradise1',g0-1.7,P.y0+1.1,1.2,.3,.45],['pot1',g1+1.7,P.y0+1.1,.45,0],['sanseveria',g1+1.7,P.y0+1.1,.9,1.2,.4],['pot3',g0-3,P.y0+1.2,.35,0],['calathea',g0-3,P.y0+1.2,.5,2,.3],['pot2',g1+3,P.y0+1.2,.35,0],['paradise',g1+3,P.y0+1.2,.8,.8,.3]],false,true); }
  // ---- THE LAMPS: the park's, a pole and a lantern, along the path; each a warm light at night (the clock's)
  // (owner, 17 Oct 2026: "lights taller and smaller in park"): a thin pole 7 tiles high and a small lantern, along the edges of the way in, round
  // the round and up the way on
  const LP=[]; { const [cx,cy]=P.round; for(let y=P.y0+4;y<P.y1-2;y+=13)if(Math.abs(y-cy)>9)LP.push([cx+(LP.length%2?4.2:-4.2),y]); for(let x=P.x0+6;x<P.x1-4;x+=16)if(Math.abs(x-cx)>9)LP.push([x,cy+(LP.length%2?4.2:-4.2)]); }   // (along both ways' edges, every 13 and 16 tiles, side to side)
  for(const [x,y] of LP){ const h0=170, h1=179, w=.17; BATCH.tag=OBJ('park','park lamp'); block(x-.07,y-.07,x+.07,y+.07,0,h0,31,()=>[40,40,44]); block(x-w-.04,y-w-.04,x+w+.04,y+w+.04,h1,h1+3,35,()=>[48,46,44]);
    for(const [a,b,c,d] of [[[X(x-w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y+w)]],[[X(x+w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y-w)]],
        [[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y+w)],[X(x-w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y-w)]],[[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y-w)],[X(x+w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y+w)]]])
      BOD.bq(a,b,c,d,BOD.faceTex(9,9,(i,j)=>i<1||i>7||j<1||j>7?[48,46,44]:[255,236,190,1]),'G');   // (the lantern's glass glows)
    const L=new THREE.PointLight(new THREE.Color(1,.86,.62),6,9*TILE,1.6); L.position.set(X(x),Y(h0+4),Z(y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
    SOL.up.push([X(x-.1),Z(y-.1),X(x+.1),Z(y+.1)]); FIX.up.push([X(x-.1),Z(y-.1),0,X(x+.1),Z(y+.1),Y(h0)]); } BATCH.tag=null;   // (each lamp a thing: switched by a double click, use.js)
  // where you can't walk: the wall each side of the gate, the posts
  const sol=(x0,y0,x1,y1,h)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Y(h)]); };
  sol(P.x0,P.y0,g0-1,P.y0+.5,WH); sol(g1+1,P.y0,P.x1,P.y0+.5,WH); sol(g0-1,P.y0-.2,g0,P.y0+.7,PH); sol(g1,P.y0-.2,g1+1,P.y0+.7,PH);
  sol(ex,P.y0+.5,P.x1,EG[0]-1,WH); sol(ex,EG[1]+1,P.x1,P.y1,WH); sol(ex-.2,EG[0]-1,P.x1+.2,EG[0],PH); sol(ex-.2,EG[1],P.x1+.2,EG[1]+1,PH);   // (the east wall and its gate's posts)
  sol(wx,P.y0+.5,wx+.5,WG[0]-1,WH); sol(wx,WG[1]+1,wx+.5,wTop,WH); sol(wx-.2,WG[0]-1,wx+.7,WG[0],PH); sol(wx-.2,WG[1],wx+.7,WG[1]+1,PH);   // (the west wall, its gate)
  sol(nLeft,ny,NG[0]-1,P.y1,WH); sol(NG[1]+1,ny,P.x1-.5,P.y1,WH); sol(NG[0]-1,ny-.2,NG[0],P.y1+.2,PH); sol(NG[1],ny-.2,NG[1]+1,P.y1+.2,PH);   // (the north wall, its gate)
  BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide}));
  MODS.park={BOUND:{x0:X(P.x0+.3),x1:X(P.x1-.3),z0:Z(P.y0),z1:Z(P.y1-.3)},inside:()=>false}; });
