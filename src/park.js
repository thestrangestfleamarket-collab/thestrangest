// ---- CENTRAL PARK'S ENTRANCE (owner, 17 Oct 2026: "import the low poly forest pack, and anything else you can use to build out central park
// entrance and a little bit further. make the trees to scale (5-20 times bigger than people)"): across the road from the shops, past the far
// sidewalk, the park's low stone wall runs the street's length, its gate open opposite the bodega between two stone posts; inside, the park's
// hexagonal pavers lead in to a round, and on past it, between lawns, under the trees of his forest pack (oaks, spruces, a dead oak and a dead
// spruce, 9 to 30 metres tall: five to twenty people high, as he asked) with the park's outcrops of rock among them, the park's lamps along
// the way. The ground and the wall are painted faces as the street's are (the game's grass, the pavers and the stone drawn here); the trees
// and the rocks his pack's models, coloured flat as the pack colours them (tools/forest-bake.py, data/forest.json), one mesh each kind,
// throwing the sun's and the lamps' shadows. Where you can't walk: the wall, the posts, the trunks, the rocks, the lamps' poles ----
const PARK={x0:50,x1:108,y0:-61,y1:-33,gate:[68.5,75.5],round:[72,-47,6]};   // (bodega tiles, x0 and x1 the street's run, set below; the gate's run along the wall; the round's middle and reach)
PARK.cut={value:1e6}; { const D=new THREE.Vector3(), V=new THREE.Vector3(); PARK.tick=you=>{ cam.getWorldDirection(D); PARK.cut.value=V.set(you.x,you.y+1,you.z).sub(cam.position).dot(D)-.8; }; }   // (how deep you are from the camera: the trees' cut)
grab('park',()=>{ PARK.x0=BOD.MAP.x0; PARK.x1=BOD.MAP.x1; const X=BOD.XS, Z=BOD.ZS, Y=BOD.YS, {hash,grain,speck,grassCol}=BOD.g, P=PARK, U=TILE/.84, f32=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer), b8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  // ---- THE PATH: from the gate to the round, the round, and on north-east; the rest lawn
  const path=(x,y)=>{ const [cx,cy,r]=P.round; if(y<cy&&Math.abs(x-cx)<3.5)return true; if(Math.hypot(x-cx,y-cy)<r)return true;
    const ax=cx+1, ay=cy+3, bx=90, by=P.y1+.5, dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(x-(ax+dx*t),y-(ay+dy*t))<2.6; };
  // the pavers: the park's hexagons (a third of a tile across), each its own grey, a dark seam between, worn here and there
  const hexCol=(x,y)=>{ const s=1/3, w=s*Math.sqrt(3), row=Math.floor(y/(s*1.5)), ox=(row&1)?w/2:0, col=Math.floor((x-ox)/w), cx=(col+.5)*w+ox, cy=row*s*1.5+s;
    const dx=Math.abs(x-cx), dy=Math.abs(y-cy), e=Math.max(dx/w*2,(dy+dx/Math.sqrt(3))/s), seam=e>.86, n=hash(col,row,71), g=grain(x,y,73,2), c=seam?42+8*n:58+22*n+10*(g-.5); return speck([c,c,c+2],x,y,75); };
  const groundCol=(x,y)=>path(x,y)?hexCol(x,y):grassCol(x,y);
  const flat=(x0,y0,x1,y1,z,col)=>BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y1-(j+.5)/24))),'G');
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
  // ---- THE TREES AND THE ROCKS: his pack's models, each at its place, its height in metres (a person 1.8: the oaks 9 to 20, the spruces 14 to
  // 30), turned as it likes; one mesh the trees, one the rocks; each leaf face its own shade of the crown's green
  const F=FOREST, mesh=(list,leafy)=>{ const P3=[], C3=[], c=new THREE.Color(); for(const [key,x,y,m,turn] of list){ const D=F[key], p=f32(D.p), col=b8(D.c), k=b8(D.k), s=m/.84*TILE, ca=Math.cos(turn||0), sa=Math.sin(turn||0), ox=X(x), oz=Z(y);
      for(let i=0;i<p.length;i+=3){ const px=p[i]*s, py=p[i+1]*s, pz=p[i+2]*s; P3.push(ox+px*ca-pz*sa,py,oz+px*sa+pz*ca); const t=Math.floor(i/9), sh=k[t]===0?.86+.28*hash(t,x*7,y*3):k[t]===2?.9+.2*hash(t,x*5,y*9):.92+.16*hash(t,x*3,y*5);
        c.setRGB(col[i]/255*sh,col[i+1]/255*sh,col[i+2]/255*sh,THREE.SRGBColorSpace); C3.push(c.r,c.g,c.b); }
      const r=Math.max(.3,D.trunk*s*.5); SOL.up.push([ox-r,oz-r,ox+r,oz+r]); FIX.up.push([ox-r,oz-r,0,ox+r,oz+r,leafy?Y(60):s*.9]); }   // (where you can't walk: the trunk, the rock)
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals();
    // (the crowns are high and wide, and you walk under them: whatever stands between the camera and you, nearer the camera than you are, is
    // left out, in a dither at its edge, so the trees never hide you; PARK.tick sets how deep you are each frame)
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}); mat.onBeforeCompile=sh=>{ sh.uniforms.uCut=PARK.cut; sh.fragmentShader='uniform float uCut;\n'+sh.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n { ivec2 q=ivec2(mod(gl_FragCoord.xy,4.)); float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); if(vViewPosition.z<uCut-3.+3.*bt[q.x+q.y*4]/16.)discard; }'); }; mat.customProgramCacheKey=()=>'parkcut';
    const me=new THREE.Mesh(g,mat); me.castShadow=true; me.receiveShadow=true; scene.add(me); return me; };
  PARK.trees=mesh([['OakTree1',63.5,-57,11,.4],['OakTree1',80.5,-57.5,12.5,2.1],['SpruceTree2',57,-57.5,9,0],['OakTree3',58,-50,16,1],['OakTree2',85,-52,9.5,.7],['OakTree3',97,-45,20,2.6],['OakTree1',65.5,-42,13,1.7],['DeadOak3',90,-40,10,.3],
    ['DeadSpruce1',52.5,-45,14,0],['OakTree2',104,-52,9.5,1.2],['SpruceTree1',54,-38,24,.5],['SpruceTree3',62,-35,30,1.1],['SpruceTree1',76,-36,26,2.2],['SpruceTree2',100,-38,14,.9],['SpruceTree3',106,-35.5,28,0],['OakTree2',87,-58.5,8.5,3],['OakTree1',118,-50,12,.8],['SpruceTree3',128,-38,26,1.9],['OakTree3',137,-52,15,.3],['DeadOak1',113,-37,8,1.4]],true);
  PARK.rocks=mesh([['BigRock1',88.5,-57.5,2.2,.6],['BigRock3',60.5,-46,3,1.8],['BigRock5',80,-38.5,2.6,.2],['Rock_12',76.5,-55,1,1],['Rock1',66.5,-50.5,.6,2],['BigRock5',102,-44,2,2.7],['Rock_12',56,-40,1.2,.4],['BigRock1',124,-57,2,1.1],['Rock1',131,-45,.7,0]],false);
  // ---- THE LAMPS: the park's, a pole and a lantern, along the path; each a warm light at night (the clock's)
  for(const [x,y] of [[67.5,-54],[76.5,-50],[78.5,-41.5],[86.5,-36],[120,-56]]){ block(x-.12,y-.12,x+.12,y+.12,0,110,31,()=>[40,40,44]); block(x-.3,y-.3,x+.3,y+.3,110,124,35,()=>[48,46,44]);
    for(const [a,b,c,d] of [[[X(x-.3),Y(110),Z(y+.3)],[X(x+.3),Y(110),Z(y+.3)],[X(x+.3),Y(124),Z(y+.3)],[X(x-.3),Y(124),Z(y+.3)]],[[X(x+.3),Y(110),Z(y-.3)],[X(x-.3),Y(110),Z(y-.3)],[X(x-.3),Y(124),Z(y-.3)],[X(x+.3),Y(124),Z(y-.3)]],
        [[X(x-.3),Y(110),Z(y-.3)],[X(x-.3),Y(110),Z(y+.3)],[X(x-.3),Y(124),Z(y+.3)],[X(x-.3),Y(124),Z(y-.3)]],[[X(x+.3),Y(110),Z(y+.3)],[X(x+.3),Y(110),Z(y-.3)],[X(x+.3),Y(124),Z(y-.3)],[X(x+.3),Y(124),Z(y+.3)]]])
      BOD.bq(a,b,c,d,BOD.faceTex(14,14,(i,j)=>i<1||i>12||j<1||j>12?[48,46,44]:[255,236,190,1]),'G');   // (the lantern's glass glows)
    const L=new THREE.PointLight(new THREE.Color(1,.86,.62),6,8*TILE,1.6); L.position.set(X(x),Y(117),Z(y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
    SOL.up.push([X(x-.15),Z(y-.15),X(x+.15),Z(y+.15)]); FIX.up.push([X(x-.15),Z(y-.15),0,X(x+.15),Z(y+.15),Y(110)]); }
  // where you can't walk: the wall each side of the gate, the posts
  const sol=(x0,y0,x1,y1,h)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Y(h)]); };
  sol(P.x0,P.y0,g0-1,P.y0+.5,WH); sol(g1+1,P.y0,P.x1,P.y0+.5,WH); sol(g0-1,P.y0-.2,g0,P.y0+.7,PH); sol(g1,P.y0-.2,g1+1,P.y0+.7,PH);
  BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide}));
  MODS.park={BOUND:{x0:X(P.x0+.3),x1:X(P.x1-.3),z0:Z(P.y0),z1:Z(P.y1-.3)},inside:()=>false}; });
