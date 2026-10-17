// ---- THE POWER GRID (owner, 17 Oct 2026, after a video tracing every wire in Red Dead Redemption 2 to one power plant: "i want to use real
// power lines in the game"; "i want it graphed to make real lights work. if the line is broken, that section of the map goes dark"; "set it up so
// that if the map is changing in another chat it wont make you redo everything"; "create the system that can be applied later") ----
// The grid is a graph: a POWER HOUSE (the source) at the street's west end, the street lights' poles as its nodes, trunk wires pole to pole along
// each kerb, a service drop from the nearest pole to every building, and under it all which lamp hangs on which. Power runs from the source over
// every whole wire; a node no whole wire reaches is dark, and so are its lamps, its pools of light, its glowing faces and the buildings it feeds.
// A cut wire hangs in two halves from its poles. Flames (candles, torches, the campfire, fireballs) are not on the grid: fire burns without wires.
// NOTHING HERE IS PLACED BY HAND: the grid derives itself when it's switched on from whatever stands on the map at that moment (the poles
// dress.js made, every building's box the places set out through the layout, every point light LITE collected), so a map moved or added to in
// another session needs nothing redone here: a new building with lamps in it gets a drop of its own by its box (GRID.serve), or, unregistered,
// its lamps hang on the nearest pole. Off until applied: ?grid=1 (or market-grid=1 in the browser; a menu switch to come). ?cut=2,5 cuts spans.
// Cost (switched on): some 3,000-4,500 triangles the wires (one draw, a flat dark material), some 600 the crossarms, cans and the power house
// (one instanced draw), no new lights, no new shader program, nothing run a frame unless something changed.
const GRID={on:(()=>{ const q=QS.get('grid'); if(q!=null)return q!=='0'; let v=null; try{ v=localStorage.getItem('market-grid'); }catch(e){} return v==='1'; })(),
  nodes:[], spans:[], drops:[], servs:[], lamps:new Map(), ready:false, dirty:false, built:false};
window.GRID=GRID;
{ const M=1/.84*TILE, V3=THREE.Vector3;
  // ---- the graph's parts ----
  // a node: a pole's top (or the source); kind 'pole', 'source', 'post'; L its own lamp if it carries one; pw whether power reaches it
  GRID.node=(x,y,z,kind,o)=>{ const n=Object.assign({id:GRID.nodes.length,x,y,z,kind,pw:false,L:null,src:kind==='source',lamps:[]},o||{}); GRID.nodes.push(n); return n; };
  // a span: a wire a to b (nodes), n wires side by side; cut: broken in the middle, carrying nothing
  GRID.span=(a,b,n)=>{ const s={id:GRID.spans.length,a,b,n:n||2,cut:false}; GRID.spans.push(s); return s; };
  // a service: a building (or anything with lamps) fed by one drop. box {x0,z0,x1,z1,y0,y1} in the world holds its lamps and its glowing faces;
  // grp a group whose lamps are its (the subway's level); at [x,y,z] where the drop lands on it (a corner near its roof, found if not given)
  GRID.serve=(key,o)=>{ const s=Object.assign({key,box:null,grp:null,at:null,node:null,pw:false,cut:false,lamps:[],faces:[]},o); GRID.servs.push(s); return s; };
  const near=(x,z,kinds)=>{ let b=null, bd=1e9; for(const n of GRID.nodes){ if(kinds&&!kinds.includes(n.kind))continue; const d=(n.x-x)**2+(n.z-z)**2; if(d<bd){ bd=d; b=n; } } return b; };
  const inBox=(b,p,m=0)=>p.x>b.x0-m&&p.x<b.x1+m&&p.z>b.z0-m&&p.z<b.z1+m&&(b.y0==null||(p.y>b.y0-m&&p.y<b.y1+m));
  // ---- deriving the grid from the map (once, when switched on, after LITE has every lamp) ----
  GRID.derive=()=>{ const D=typeof DRESS!=='undefined'?DRESS:{}, poles=D.poles||[], G=(x,z)=>groundY(x,z);
    // THE POWER HOUSE: past the street's west end on the near kerb's side (the flat land there), moved by the layout as any place (LAY 'power'); its
    // wires leave a bundle at a high window on its east wall (as the Atlantic Electrical Company's did) to the first pole of each kerb
    const o=LAY.o('power'), sw=poles.length?poles.find(p=>p.d>0):null, far=poles.length?poles.find(p=>p.d<0):null;
    const PH={w:6*TILE,d:5*TILE,h:5.2*M, x:BOUND.x0-4.6*TILE+o.x*TILE, z:(sw?sw.z:BOUND.z0+2*TILE)+o.y*TILE+1.6*TILE};
    PH.y=G(PH.x,PH.z); GRID.house=PH; const src=GRID.node(PH.x+PH.w/2,PH.y+PH.h-.6*M,PH.z-.4*TILE,'source',{house:PH});
    // THE POLES: the street lights, each kerb its own trunk west to east, both fed from the house
    for(const d of [1,-1]){ const line=poles.filter(p=>p.d===d).sort((p,q)=>p.x-q.x); let prev=src;
      for(const p of line){ const n=GRID.node(p.x,p.y,p.z,'pole',{L:p.L||null,h:p.h,d}); GRID.span(prev,n,prev===src?3:2); prev=n; } }
    // THE LAMP POSTS (the park side of the far sidewalk): each hung from the nearest far-kerb pole by one wire
    for(const p of (D.lampposts||[])){ const n=GRID.node(p.x,p.y,p.z,'post',{L:p.L||null,i:p.i}), f=near(p.x,p.z,['pole']); if(f)GRID.span(f,n,1); }
    // THE BUILDINGS: every place that stands on the map, by its box in the world (each read from where the layout put it; a place not here yet
    // is skipped, so one added later gets its drop the first time this runs with it). y0/y1: the lamps it holds, from the ground to its roof
    const B=typeof BOD!=='undefined'?BOD:null, bx=(x0,y0,x1,y1,S)=>({x0:(S?B.XS:B.X)(x0),z0:(S?B.ZS:B.Z)(y0),x1:(S?B.XS:B.X)(x1),z1:(S?B.ZS:B.Z)(y1),y0:-1,y1:40});
    if(B&&B.B0)GRID.serve('bodega',{box:bx(B.B0.x0,B.B0.y0,B.B0.x1,B.B0.y1)});
    if(B&&typeof MODS!=='undefined'&&MODS.apts&&MODS.apts.A){ const A=MODS.apts.A; GRID.serve('house',{box:bx(A.x0,A.y0,A.x1,A.y1)}); }
    if(typeof POOLR!=='undefined'&&POOLR.X)GRID.serve('apartments',{box:{x0:POOLR.X(POOLR.x0),z0:POOLR.Z(POOLR.y0),x1:POOLR.X(POOLR.x1),z1:POOLR.Z(POOLR.y1),y0:-1,y1:60}});
    if(B&&B.grounds){ const g=B.grounds.find(q=>q.id==='ghostst'); if(g)GRID.serve('ghost',{box:bx(g.x0,g.y0,g.x1,g.y1)}); }
    if(typeof STORE!=='undefined')for(const R of STORE.rooms||[]){ const cx=(R.x0+R.x1)/2, cz=(R.z0+R.z1)/2; if(cx<BOUND.x0||cx>BOUND.x1||cz<BOUND.z0||cz>BOUND.z1)continue;   // (only a room on the map, not the storeroom's far east)
      GRID.serve(R.id,{box:{x0:R.x0,z0:R.z0,x1:R.x1,z1:R.z1,y0:(R.y0??0)-1,y1:(R.y0??0)+40}}); }
    // THE SUBWAY: its station's and its stairs' lamps, fed by a conduit down the stair from the pole nearest the stairs' top (no wire drawn underground)
    if(typeof MAPG!=='undefined'&&MAPG.down&&typeof MAPSTAIR!=='undefined'&&B){ const sx=B.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2), sz=B.ZS(MAPSTAIR.y1);
      GRID.serve('subway',{grp:[MAPG.down,MAPG.stairs,MAPG.dungeon].filter(Boolean),at:[sx,G(sx,sz)+.2,sz],under:true}); }
    // each service's drop: from the nearest pole to the building's corner nearest it, a little under the pole's top (the pole-side wall, near the roof)
    for(const s of GRID.servs){ if(!s.at){ const b=s.box, cx=(b.x0+b.x1)/2, cz=(b.z0+b.z1)/2, p=near(cx,cz,['pole'])||src; const x=Math.abs(p.x-b.x0)<Math.abs(p.x-b.x1)?b.x0:b.x1, z=Math.abs(p.z-b.z0)<Math.abs(p.z-b.z1)?b.z0:b.z1;
        const kx=Math.abs(p.z-cz)>Math.abs(p.x-cx), ax=kx?Math.max(b.x0+.5,Math.min(b.x1-.5,p.x)):x, az=kx?z:Math.max(b.z0+.5,Math.min(b.z1-.5,p.z)); s.at=[ax,p.y-.9*M,az]; }
      s.node=near(s.at[0],s.at[2],['pole'])||src; s.drop={a:s.node,at:s.at,n:1}; }
    // WHICH LAMP HANGS ON WHAT: every lamp LITE collected, but a flame's (fire.js: fire burns without wires) and the pool's eight stand-ins; a street
    // light's or a post's own lamp on its node; one in a building's box (or its group) on that service; any other on the nearest pole (fed underground)
    const flames=new Set((typeof FLAME!=='undefined'&&FLAME.src||[]).map(f=>f.light).filter(Boolean)); if(typeof PARK!=='undefined'&&PARK.fireL)flames.add(PARK.fireL);
    const own=new Map(); for(const n of GRID.nodes)if(n.L)own.set(n.L,n);
    const top=o=>{ while(o&&o.parent&&o.parent!==scene)o=o.parent; return o; };
    for(const L of LITE.recs){ if(flames.has(L)||L.userData.pool)continue; const p=L.position; let on=null;
      if(own.has(L))on=own.get(L); else{ const g=L.userData.grp||top(L); on=GRID.servs.find(s=>(s.grp&&s.grp.includes(g))||(s.box&&inBox(s.box,p,.4*TILE)))||near(p.x,p.z,['pole','source']); }
      if(on){ GRID.lamps.set(L,on); (on.lamps||(on.lamps=[])).push(L); } }
    // THE GLOWING FACES of each building (lit windows, signs, shelves' lamps: the batch's emissive or unlit faces in its box): dimmed with it
    // (only a face that glows: an unlit face, or one whose emissive picture has light at its middle; a brick wall in the same mesh stays as it is)
    const IDS=new Map(), pix=(t,u,v)=>{ const im=t.image; let D=IDS.get(im); if(!D){ D=im.getContext('2d').getImageData(0,0,im.width,im.height); IDS.set(im,D); } const i=(Math.floor((1-v)*im.height)*im.width+Math.floor(u*im.width))*4; return D.data[i]+D.data[i+1]+D.data[i+2]; };
    scene.traverse(me=>{ if(!me.isMesh||!me.geometry.attributes.aCol||!(me.material.emissiveMap||me.material.isMeshBasicMaterial))return; const P=me.geometry.attributes.position.array, U=me.geometry.attributes.uv&&me.geometry.attributes.uv.array, E=me.material.emissiveMap, c=new V3();
      for(let f=0;f<P.length/18;f++){ c.set(0,0,0); for(let v=0;v<6;v++)c.x+=P[f*18+v*3]/6,c.y+=P[f*18+v*3+1]/6,c.z+=P[f*18+v*3+2]/6;
        const s=GRID.servs.find(s=>s.box&&inBox(s.box,c,.7*TILE)); if(!s)continue;   // (a sign hung out from the wall, a lamp at the door: a little past the box)
        const T=E||me.material.map; if(T&&U&&T.image&&T.image.getContext){ const u0=U[f*12], v0=U[f*12+1], u2=U[f*12+4], v2=U[f*12+5]; let m=0;   // (the face's middle and four points toward its corners: a pane's middle is its dark bar)
          for(const [a,b] of [[.5,.5],[.25,.25],[.75,.25],[.25,.75],[.75,.75]]){ try{ m=Math.max(m,pix(T,u0+(u2-u0)*a,v0+(v2-v0)*b)); }catch(e){} } if(m<(E?60:420))continue; } s.faces.push([me,f]); } });   // (an unlit face counts only if bright: a lit pane, not a dark floor)
    // THE GLOWING THINGS BY A LAMP (a neon's tube letters, a lantern's glass, a lamp post's lantern: their own meshes or instances, not batch faces):
    // any unlit or emissive mesh (or an instance of one) within a little of a lamp on the grid goes dim with that lamp
    const R2=(.9*TILE)**2, near2=p=>{ for(const [L] of GRID.lamps){ const q=L.position; if((q.x-p.x)**2+(q.y-p.y)**2+(q.z-p.z)**2<R2)return L; } return null; }, m4=new THREE.Matrix4(), v=new V3();
    GRID.glows=[]; scene.traverse(me=>{ if(!me.isMesh||me.geometry.attributes.aCol||me===wireMesh||me===GRID.blocks||!(me.material.isMeshBasicMaterial||(me.material.emissive&&me.material.emissive.getHex()>0)))return; if(me.geometry.boundingBox===null)me.geometry.computeBoundingBox(); const bb=me.geometry.boundingBox; if(!bb)return;
      if(me.isInstancedMesh){ if(me===D.heads||me===D.lant)return; for(let i=0;i<me.count;i++){ me.getMatrixAt(i,m4); bb.getCenter(v).applyMatrix4(m4); me.localToWorld(v); const L=near2(v); if(L)GRID.glows.push({L,me,i}); } }
      else{ bb.getCenter(v); me.localToWorld(v); const L=near2(v); if(L)GRID.glows.push({L,me}); } });
    GRID.ready=true; };
  // ---- POWER: from every source over every whole span; what nothing reaches goes dark ----
  GRID.flow=()=>{ for(const n of GRID.nodes)n.pw=false; const q=GRID.nodes.filter(n=>n.src); for(const n of q)n.pw=true;
    while(q.length){ const n=q.pop(); for(const s of GRID.spans){ if(s.cut)continue; const o=s.a===n?s.b:s.b===n?s.a:null; if(o&&!o.pw){ o.pw=true; q.push(o); } } }
    for(const s of GRID.servs)s.pw=!!(s.node&&s.node.pw&&!s.cut); GRID.dirty=true; };
  // a lamp goes dark: LITE leaves it out, its pool goes (dress.js reads off), use.js's switch can't light it while the power's gone (tick re-darkens)
  const setLamp=(L,pw)=>{ if(!pw){ if(!L.userData.dark){ L.userData.dark=true; L.userData.offU=!!L.userData.off; } L.userData.off=true; } else if(L.userData.dark){ L.userData.dark=false; L.userData.off=L.userData.offU; } };
  const C=new THREE.Color(), DIM=[.18,.18,.2];
  GRID.apply=()=>{ GRID.dirty=false; const D=typeof DRESS!=='undefined'?DRESS:{};
    for(const [L,on] of GRID.lamps)setLamp(L,on.pw);
    for(const me of [D.heads,D.lant])if(me&&!me.instanceColor){ me.setColorAt(0,C.setRGB(1,1,1)); me.material.needsUpdate=true; }   // (the first per-head colour: the program made again with it)
    for(const n of GRID.nodes){ if(n.kind==='pole'&&D.heads&&n.h!=null){ D.heads.setColorAt(n.h,C.setRGB(...(n.pw?[1,1,1]:DIM))); D.heads.instanceColor.needsUpdate=true; }
      if(n.kind==='post'&&D.lant&&n.i!=null){ D.lant.setColorAt(n.i,C.setRGB(...(n.pw?[1,1,1]:DIM))); D.lant.instanceColor.needsUpdate=true; } }
    for(const s of GRID.servs){ if(s.shown===s.pw)continue; s.shown=s.pw; const seen=new Set();
      for(const [me,f] of s.faces){ const A=me.geometry.attributes.aCol; if(!s.pw){ for(let i=0;i<18;i++)A.array[f*18+i]=DIM[i%3]; } else{ for(let i=0;i<18;i++)A.array[f*18+i]=1; } seen.add(A); }
      for(const A of seen)A.needsUpdate=true; }
    const dims=new Map(); for(const g of GRID.glows){ const on=GRID.lamps.get(g.L), pw=on?on.pw:true; if(g.pw===pw)continue; g.pw=pw;
      if(g.i!=null){ if(!g.me.instanceColor){ g.me.setColorAt(0,C.setRGB(1,1,1)); g.me.material.needsUpdate=true; } g.me.setColorAt(g.i,C.setRGB(...(pw?[1,1,1]:DIM))); g.me.instanceColor.needsUpdate=true; }
      else{ if(pw){ if(g.m0)g.me.material=g.m0; } else{ g.m0=g.m0||g.me.material; let d=dims.get(g.m0); if(!d){ d=g.m0.clone(); if(d.color)d.color.multiplyScalar(DIM[0]); if(d.emissive)d.emissive.multiplyScalar(DIM[0]); dims.set(g.m0,d); } g.me.material=d; } } }
    LITE.t=0; if(GRID.built)GRID.wires(); };
  // ---- cutting and mending (GRID.cut(i) a span; GRID.cutNear(x,z) the span nearest a point; GRID.cutDrop(key) a building's drop; mend puts back) ----
  GRID.cut=(i,on=true)=>{ const s=GRID.spans[i]; if(s){ s.cut=on; GRID.flow(); } return s; };
  GRID.mend=i=>GRID.cut(i,false);
  GRID.cutDrop=(key,on=true)=>{ const s=GRID.servs.find(q=>q.key===key); if(s){ s.cut=on; GRID.flow(); } return s; };
  GRID.cutNear=(x,z)=>{ let b=-1, bd=1e9; GRID.spans.forEach(s=>{ const t=Math.max(0,Math.min(1,((x-s.a.x)*(s.b.x-s.a.x)+(z-s.a.z)*(s.b.z-s.a.z))/(((s.b.x-s.a.x)**2+(s.b.z-s.a.z)**2)||1))), d=(s.a.x+(s.b.x-s.a.x)*t-x)**2+(s.a.z+(s.b.z-s.a.z)*t-z)**2; if(d<bd){ bd=d; b=s.id; } }); return b>=0?GRID.cut(b):null; };
  GRID.mendAll=()=>{ for(const s of GRID.spans)s.cut=false; for(const s of GRID.servs)s.cut=false; GRID.flow(); };
  GRID.state=()=>({nodes:GRID.nodes.map(n=>[n.kind,n.pw?1:0]),spans:GRID.spans.map(s=>[s.a.id,s.b.id,s.cut?1:0]),servs:GRID.servs.map(s=>[s.key,s.pw?1:0,s.lamps.length,s.faces.length]),dark:[...GRID.lamps.keys()].filter(L=>L.userData.dark).length,lamps:GRID.lamps.size});
  // ---- THE WIRES: each a sagging curve (a parabola, 8 pieces), drawn as two thin ribbons crossed (never edge-on, never gone), all in one
  // geometry and one draw, dark, unlit (a wire against the sky is a dark line whatever the light). A cut span: two halves hanging from their poles ----
  // (never thinner than a picture pixel, however far out: each corner carries the wire's centre there (aC) and the vertex shader pushes it out to at least
  // .6 of a pixel from it on the screen, so a wire is a line a pixel wide at the least, its real width when near; one program for all the wires)
  const wireMat=new THREE.MeshBasicMaterial({color:0x14110f,side:THREE.DoubleSide}); wireMat.onBeforeCompile=sh=>{ sh.uniforms.uRes=GRID.uRes;
    sh.vertexShader='attribute vec3 aC; uniform vec2 uRes;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n { vec4 cc=projectionMatrix*modelViewMatrix*vec4(aC,1.); vec2 d=gl_Position.xy/gl_Position.w-cc.xy/cc.w; float px=length(d*uRes*.5); if(px<.6&&px>1e-6){ d*=.6/px; gl_Position.xy=(cc.xy/cc.w+d)*gl_Position.w; } }'); };
  wireMat.customProgramCacheKey=()=>'gridwire'; GRID.uRes={value:new THREE.Vector2(1,1)}; let wireMesh=null;
  const sag=(a,b,t,s)=>{ const x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t-s*4*t*(1-t), z=a[2]+(b[2]-a[2])*t; return [x,y,z]; };
  const ribbon=(P,pts,w,CC)=>{ for(let i=0;i<pts.length-1;i++){ const p=pts[i], q=pts[i+1], dx=q[0]-p[0], dz=q[2]-p[2], l=Math.hypot(dx,dz)||1, nx=-dz/l*w, nz=dx/l*w;   // (across, level; and up)
      P.push(p[0]+nx,p[1],p[2]+nz, q[0]+nx,q[1],q[2]+nz, q[0]-nx,q[1],q[2]-nz, p[0]+nx,p[1],p[2]+nz, q[0]-nx,q[1],q[2]-nz, p[0]-nx,p[1],p[2]-nz);
      P.push(p[0],p[1]+w,p[2], q[0],q[1]+w,q[2], q[0],q[1]-w,q[2], p[0],p[1]+w,p[2], q[0],q[1]-w,q[2], p[0],p[1]-w,p[2]);
      for(let r=0;r<2;r++)CC.push(...p,...q,...q,...p,...q,...p); } };
  const curve=(a,b,s,n=8)=>{ const o=[]; for(let i=0;i<=n;i++)o.push(sag(a,b,i/n,s)); return o; };
  GRID.wires=()=>{ const P=[], CC=[], W=.028*M, arm=.42*M;   // (the wires on a pole sit along its crossarm, arm apart)
    const ends=(n,k,cnt)=>{ const off=(k-(cnt-1)/2)*arm; return n.kind==='pole'?[n.x+off,n.y+.1*M,n.z]:n.kind==='source'?[n.x,n.y+off*.5,n.z]:[n.x,n.y-.2*M,n.z]; };
    for(const s of GRID.spans)for(let k=0;k<s.n;k++){ const a=ends(s.a,k,s.n), b=ends(s.b,k,s.n), L=Math.hypot(b[0]-a[0],b[2]-a[2]), g=Math.min(.9*M,.018*L);
      if(!s.cut)ribbon(P,curve(a,b,g),W,CC); else{ const m=sag(a,b,.5,g); for(const [e,q] of [[a,b],[b,a]]){ const dx=q[0]-e[0], dz=q[2]-e[2], l=Math.hypot(dx,dz)||1, h=[e[0]+dx/l*Math.min(l*.42,2.2*M)*.55,Math.min(e[1],m[1])-2.3*M,e[2]+dz/l*Math.min(l*.42,2.2*M)*.55];   // (hanging down, swung a little toward the break)
          ribbon(P,curve(e,h,-.3*M,5),W,CC); } } }
    for(const s of GRID.servs){ if(!s.drop||s.under)continue; const a=ends(s.node,0,1), b=s.at, L=Math.hypot(b[0]-a[0],b[2]-a[2]), g=Math.min(.5*M,.03*L);
      if(!s.cut)ribbon(P,curve(a,b,g,6),W,CC); else{ ribbon(P,curve(a,[a[0]+(b[0]-a[0])*.3,a[1]-1.8*M,a[2]+(b[2]-a[2])*.3],-.2*M,4),W,CC); ribbon(P,curve(b,[b[0]+(a[0]-b[0])*.2,b[1]-1.4*M,b[2]+(a[2]-b[2])*.2],-.2*M,4),W,CC); } }
    if(!wireMesh){ wireMesh=new THREE.Mesh(new THREE.BufferGeometry(),wireMat); wireMesh.frustumCulled=false; wireMesh.name='grid-wires'; (MAPG.bodega||scene).add(wireMesh); }
    wireMesh.geometry.dispose(); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('aC',new THREE.Float32BufferAttribute(CC,3)); wireMesh.geometry=g; GRID.tris=P.length/9; };
  // ---- the hardware, in blocks (dress.js's way: flat colours, one instanced draw): a crossarm with its insulators on every pole, a transformer
  // can on every third, the power house (brick walls, a dark roof, two tall stacks, a door, the window the wires leave by) ----
  GRID.hardware=()=>{ const BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), GR=0x5d6266, DK=0x3f4448, WD=0x4a3a2a, INS=0x6a8a7a;
    GRID.nodes.filter(n=>n.kind==='pole').forEach((n,i)=>{ blk(n.x,n.y,n.z,1.1*M,.08*M,.08*M,WD); for(const k of [-1,0,1])blk(n.x+k*.42*M,n.y+.09*M,n.z,.07*M,.1*M,.07*M,INS);
      if(i%3===1)blk(n.x+.22*M,n.y-.75*M,n.z+n.d*.14*M,.3*M,.5*M,.3*M,GR); });   // (the can hung under the arm, on the road's side)
    const H=GRID.house; if(H){ const x=H.x+H.w/2, z=H.z-H.d/2, y=H.y; blk(x,y+H.h/2,z,H.w,H.h,H.d,0x6e3a2c); blk(x,y+H.h+.08*M,z,H.w+.2*M,.16*M,H.d+.2*M,0x2b2628);
      for(const sx of [-.28,.28])blk(x+sx*H.w,y+H.h+1.9*M,z,.5*M,3.8*M,.5*M,0x3a3436); blk(x-.2*H.w,y+1.05*M,H.z-.03*M,1.56*TILE*.6,2.1*M,.08*M,0x2a1e16);   // (the stacks; the door on the street side)
      blk(H.x+H.w+.02*M,y+H.h-.6*M,z-.4*TILE,.06*M,.9*M,1.4*M,0x1a1c22); blk(x,y+.05*M,z,H.w+.6*M,.1*M,H.d+.6*M,0x4a4a48);   // (the window the wires leave by; the pad)
      SOL.up.push([H.x,H.z-H.d,H.x+H.w,H.z]); FIX.up.push([H.x,H.z-H.d,y,H.x+H.w,H.z,y+H.h]);
      blk(x-.2*H.w,y+2.3*M,H.z+.12*M,.3*M,.12*M,.26*M,0xffe4b0); const L=new THREE.PointLight(new THREE.Color(1,.88,.68),22,9*TILE,1.6); L.position.set(x-.2*H.w,y+2.2*M,H.z+.3*M); L.userData.i0=22; L.userData.grp=MAPG.bodega||null;   // (the lamp over its door: one of LITE's records, the source's own)
      LITE.recs.push(L); const src=GRID.nodes.find(n=>n.src); if(src){ src.L=L; GRID.lamps.set(L,src); src.lamps.push(L); } }
    const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
    BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new V3(x,y,z),q,new V3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; me.name='grid-hardware'; (MAPG.bodega||scene).add(me); GRID.blocks=me; };
  // ---- switched on: derive, build, power up; cut what ?cut= names ----
  GRID.init=()=>{ if(!GRID.on||GRID.ready)return; try{ GRID.derive(); GRID.hardware(); GRID.flow(); GRID.wires(); GRID.built=true; GRID.apply();
      const c=QS.get('cut'); if(c)for(const i of c.split(',').map(Number))if(i>=0&&i<GRID.spans.length)GRID.spans[i].cut=true; if(c){ GRID.flow(); GRID.apply(); } }catch(e){ console.warn('GRID:',e); } };
  // each quarter second: a changed graph applied; a dark lamp a switch lit again put back out (use.js's switch can't call power up)
  let acc=0; const RS=new THREE.Vector2(); GRID.tick=dt=>{ if(!GRID.ready)return; if(typeof renderer!=='undefined'){ renderer.getDrawingBufferSize(RS); GRID.uRes.value.copy(RS); } acc+=dt||0; if(GRID.dirty)GRID.apply(); if(acc<.25)return; acc=0; for(const [L,on] of GRID.lamps)if(!on.pw&&!L.userData.off){ L.userData.off=true; LITE.t=0; } };
  // its place in the page: after LITE has gathered every lamp (LITE.init, the end of the build), ticked with the street's dressing
  { const li=LITE.init; LITE.init=()=>{ li(); GRID.init(); }; if(typeof DRESS!=='undefined'){ const dt=DRESS.tick; DRESS.tick=(d,p)=>{ if(dt)dt(d,p); GRID.tick(d); }; } }
}
