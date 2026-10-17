// ---- THE MAP EDITOR (owner, 17 Oct 2026: "build a map editor that allows me to move buildings and land around easily"; then "the shift+m map
// layout editor needs full 360 draggable view to move things. they should snap in place to a very small grid"): Shift+M, or the menu's MAP tab.
// In the game's own view: the map view, turned all the way round (a right drag, or Shift + drag) and tilted, slid (a left drag on nothing) and
// zoomed (the wheel) far out; a left drag on a place picks it and carries it over the ground, snapped to a quarter tile (a faint grid of them
// under it), its box (its footprint and its height) following the mouse; the park, the castle, the apartments with the pool, the subway and
// the land move their own meshes live too (their own groups); the rest are in the shared batches, so their box shows where they go. The park's
// and the land's edges drag to size them (snapped too). A small plan in the panel (drag there as well), the arrows a grid step (Shift a whole
// tile), RESET, APPLY (kept in the browser, market-layout, the page loaded again: every place built where it now stands, map-pre.js's LAY, its
// faces, solids, lights, rooms, ground, stairs and lanes with it), EXPORT (the table to send, which goes into LAYOUT0 for good). Turning a place
// a quarter: not here (every place is built on walls along the map's axes). Nothing made or run while it's off: its boxes and grid are made as
// it opens and thrown away as it closes ----
const MAPED={on:false};
{ const T=TILE, G=.25, LBL={bodega:'THE BODEGA',house:'APARTMENT HOUSE',apartments:'APARTMENTS + POOL',ghost:'GHOST STREET + DOJO',diner:'THE DINER',bar:'THE BAR',park:'CENTRAL PARK',castle:'THE CASTLE + DUNGEON',subway:'SUBWAY STAIRS + STATION',land:'THE LAND (GRASS)'};
  const COL={bodega:'#a0503e',house:'#8c4a3c',apartments:'#5a6f8c',ghost:'#8a6a3e',diner:'#b04a44',bar:'#8a6040',park:'#3f7a3a',castle:'#8c8678',subway:'#3f7a5a',land:'#1d3420'};
  const SIZED={park:1,land:1};   // (the ones whose edges move too)
  // the places that are groups of their own, moved live while dragged (the land its one sheet)
  const LIVE={apartments:['pool','poolout'],subway:['down','stairs'],park:['park'],castle:['castle','castlestairs','dungeon']};
  // each place's box as it was built (world units: x0, z0, x1, z1), read from the places themselves; and how high it stands
  const room=id=>()=>{ const R=STORE.rooms.find(r=>r.id===id); return R?[R.x0,R.z0,R.x1,R.z1]:null; };
  const BOX={bodega:()=>{ const B=BOD.B0; return [BOD.X(B.x0),BOD.Z(B.y0),BOD.X(B.x1),BOD.Z(B.y1)]; },
    house:()=>{ const A=MODS.apts.A; return [BOD.X(A.x0),BOD.Z(A.y0),BOD.X(A.x1),BOD.Z(A.y1)]; },
    apartments:()=>[POOLR.X(POOLR.x0),POOLR.Z(POOLR.y0),POOLR.X(POOLR.x1),POOLR.Z(POOLR.y1)],
    ghost:()=>{ const g=BOD.grounds.find(g=>g.id==='ghostst'); return [BOD.X(g.x0),BOD.Z(g.y0),BOD.X(g.x1),BOD.Z(g.y1)]; },
    diner:room('diner'), bar:room('bar'),
    park:()=>[BOD.XS(PARK.x0+PARK.ox),BOD.ZS(PARK.y0+PARK.oy),BOD.XS(PARK.x1+PARK.ox),BOD.ZS(PARK.y1+PARK.oy)],
    castle:()=>{ const b=CASTLE.b; return [BOD.XS(b[0]),BOD.ZS(b[2]),BOD.XS(b[1]),BOD.ZS(b[3])]; },
    subway:()=>{ const S=MAPSTAIR; return [BOD.XS(S.x0),BOD.ZS(S.y0),BOD.XS(S.x1),BOD.ZS(S.y1)]; },
    land:()=>{ const L=MODS.landR; return [L.x0*T,L.z0*T,L.x1*T,L.z1*T]; }};
  const HIGH={bodega:()=>BOD.Y(BOD.B0.h),house:()=>BOD.Y(5*BOD.K.STORY),apartments:()=>POOLR.Y(POOLR.H),ghost:()=>BOD.Y(280),diner:()=>BOD.Y(130),bar:()=>BOD.Y(130),park:()=>BOD.YS(54),castle:()=>BOD.YS(200),subway:()=>BOD.YS(30),land:()=>.05};
  const KEYS=Object.keys(BOX), BUILT=JSON.parse(JSON.stringify(LAY.L)), q4=v=>Math.round(v/G)*G, clean=o=>{ const r={}; for(const k in o){ const v=o[k]||{}, e=(v.e||[0,0,0,0]).map(q4), q={};
      if(q4(v.x||0))q.x=q4(v.x); if(q4(v.y||0))q.y=q4(v.y); if(e.some(n=>n))q.e=e; if(Object.keys(q).length)r[k]=q; } return r; };
  let WORK=clean(BUILT), sel='bodega', V=null, act=null, PH=null, d3=null, OV=null, was=null;
  const ent=k=>WORK[k]||(WORK[k]={}), off=(L,k)=>{ const v=L[k]||{}; return {x:v.x||0,y:v.y||0,e:v.e||[0,0,0,0]}; };
  // a place's box as the editor has it now: as built, moved by what changed since (and its edges)
  const boxOf=k=>{ const b=BOX[k](); if(!b)return null; const a=off(BUILT,k), w=off(WORK,k), dx=(w.x-a.x)*T, dz=(w.y-a.y)*T;
    return [b[0]+dx+(w.e[0]-a.e[0])*T,b[1]+dz+(w.e[1]-a.e[1])*T,b[2]+dx+(w.e[2]-a.e[2])*T,b[3]+dz+(w.e[3]-a.e[3])*T]; };
  // ---- THE PANEL: a small plan, the places, the buttons
  const P=document.createElement('div'); P.id='maped'; P.style.cssText='position:fixed;right:12px;top:12px;z-index:22;display:none;width:340px;max-width:calc(100vw - 24px);padding:10px 12px;background:#0b0d13f2;border:2px solid #2a3040;color:#c9ccd6;font:10px Silkscreen,monospace;letter-spacing:.5px';
  P.innerHTML='<div style="display:flex;justify-content:space-between;padding-right:28px"><b>MAP EDITOR</b><span style="color:#8a8f9c">SHIFT+M</span></div>'
    +'<div style="color:#8a8f9c;margin:4px 0 6px;line-height:1.5">LEFT DRAG A PLACE: MOVE IT (¼ TILE GRID) · DRAG OPEN GROUND, CTRL+DRAG OR RIGHT DRAG: TURN ALL ROUND, TILT · Q E TURN, Z X TILT, T TOP, Y SIDE · W A S D: SLIDE · WHEEL: ZOOM · PARK, LAND: DRAG AN EDGE</div>'
    +'<canvas id="meC" width="316" height="200" style="display:block;width:100%;image-rendering:pixelated;border:2px solid #2a3040;background:#07090d;cursor:grab;touch-action:none"></canvas>'
    +'<div id="meL" style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px"></div><div id="meI" style="margin-top:6px;color:#f2c14e;min-height:12px"></div>'
    +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;align-items:center">VIEW <button class="btn" data-v="turnL">⟲ TURN</button><button class="btn" data-v="turnR">TURN ⟳</button><button class="btn" data-v="up">TILT UP</button><button class="btn" data-v="down">TILT DOWN</button><button class="btn" data-v="top">TOP</button><button class="btn" data-v="side">SIDE</button></div>'
    +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;align-items:center"><button class="btn" data-n="-1,0">◀</button><button class="btn" data-n="0,-1">▲</button><button class="btn" data-n="0,1">▼</button><button class="btn" data-n="1,0">▶</button>'
    +'<button class="btn" id="meR">RESET THIS</button><button class="btn" id="meRA">RESET ALL</button><button class="btn" id="meA" style="color:#f2c14e">APPLY (RELOADS)</button><button class="btn" id="meE">EXPORT</button></div>'
    +'<div style="margin-top:6px;color:#8a8f9c;line-height:1.5">ARROWS ¼ TILE, SHIFT A TILE. NO TURNING (WALLS RUN ALONG THE MAP). THE SHRINE GOES WITH THE PARK, THE DUNGEON THE CASTLE, THE STACKED ROOMS THE APARTMENTS, THE STATION ITS STAIRS</div>'
    +'<textarea id="meT" readonly style="display:none;width:100%;height:60px;margin-top:6px;background:#000;color:#f2c14e;font:10px monospace"></textarea>';
  document.body.appendChild(P); const q=s=>P.querySelector(s), cv2=q('#meC'), g=cv2.getContext('2d');
  P.querySelectorAll('button.btn').forEach(b=>Object.assign(b.style,{font:'10px Silkscreen,monospace',padding:'4px 6px',color:b.style.color||'#ece5d3',background:'#0e1016',border:'2px solid #3a3f4e',cursor:'pointer'}));
  // ---- THE PLAN (small): the land, the street, each place a box over the picture from above taken as it opens
  const fit=()=>{ let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const k of KEYS){ if(k==='land')continue; const b=boxOf(k); if(!b)continue; x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); }
    const m=4*T; V={cx:(x0+x1)/2,cz:(z0+z1)/2,k:Math.min(cv2.width/(x1-x0+2*m),cv2.height/(z1-z0+2*m))}; };
  const sx=x=>(x-V.cx)*V.k+cv2.width/2, sz=z=>(z-V.cz)*V.k+cv2.height/2, wx=px=>(px-cv2.width/2)/V.k+V.cx, wz=pz=>(pz-cv2.height/2)/V.k+V.cz;
  const R=(b,fill,line,w)=>{ const x=Math.round(sx(b[0])), y=Math.round(sz(b[1])), W=Math.round(sx(b[2]))-x, H=Math.round(sz(b[3]))-y; if(fill){ g.fillStyle=fill; g.fillRect(x,y,W,H); }
    if(line){ g.strokeStyle=line; g.lineWidth=w||1; g.strokeRect(x+.5,y+.5,W-1,H-1); } return [x,y,W,H]; };
  const draw=()=>{ if(!V)fit(); g.fillStyle='#07090d'; g.fillRect(0,0,cv2.width,cv2.height); g.font='8px Silkscreen,monospace'; g.textBaseline='top';
    R(boxOf('land'),COL.land,sel==='land'?'#f2c14e':'#2e4a30');
    if(PH){ g.imageSmoothingEnabled=false; g.drawImage(PH.c,sx(PH.R.x0),sz(PH.R.z0),(PH.R.x1-PH.R.x0)*V.k,(PH.R.z1-PH.R.z0)*V.k); }
    const order=KEYS.filter(k=>k!=='land').map(k=>[k,boxOf(k)]).filter(p=>p[1]).sort((a,b)=>(b[1][2]-b[1][0])*(b[1][3]-b[1][1])-(a[1][2]-a[1][0])*(a[1][3]-a[1][1]));
    for(const [k,b] of order)R(b,COL[k]+(k==='park'?'30':'70'),k===sel?'#f2c14e':COL[k],k===sel?2:1);
    { const b=boxOf(sel), r=R(b,null,'#f2c14e',2), tw=g.measureText(LBL[sel]).width+4, ty=r[1]>12?r[1]-11:r[1]+1; g.fillStyle='#0b0d13cc'; g.fillRect(r[0],ty,tw,10); g.fillStyle='#f2c14e'; g.fillText(LBL[sel],r[0]+2,ty+1); }
    g.fillStyle='#f2c14e'; g.fillRect(Math.round(sx(pos.x))-1,Math.round(sz(pos.z))-1,3,3);
    // where the view looks: its middle on the ground
    if(d3&&d3.look){ g.strokeStyle='#ffffff88'; g.strokeRect(Math.round(sx(d3.look.x))-3.5,Math.round(sz(d3.look.z))-3.5,7,7); }
    info(); };
  const n_=(v,a,b)=>v?(v>0?'+'+v+' '+a:v+' '+b):'';
  const info=()=>{ const w=off(WORK,sel), chg=JSON.stringify(clean(WORK))!==JSON.stringify(clean(BUILT));
    q('#meI').textContent=LBL[sel]+': '+([n_(w.x,'E','W'),n_(w.y,'S','N')].filter(Boolean).join(', ')||'AS MADE')+(w.e.some(Boolean)?' · EDGES '+w.e.join(' '):'')+' TILES'+(chg?' · APPLY TO BUILD':'');
    q('#meL').querySelectorAll('button').forEach(b=>{ const on=b.dataset.k===sel; b.style.color=on?'#f2c14e':'#ece5d3'; b.style.borderColor=on?'#6b6f80':'#3a3f4e'; }); };
  for(const k of KEYS){ const b=document.createElement('button'); b.dataset.k=k; b.textContent=LBL[k]; Object.assign(b.style,{font:'9px Silkscreen,monospace',padding:'3px 5px',color:'#ece5d3',background:'#0e1016',border:'2px solid #3a3f4e',cursor:'pointer'}); b.onclick=()=>{ sel=k; changed(); }; q('#meL').appendChild(b); }
  // ---- IN THE WORLD: a box round every place (the one chosen bright, where it was built faint while it's moved), a grid of quarter tiles under
  // the one chosen, its own meshes carried along where they're a group of their own
  const LM=(c,o)=>new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o,depthTest:false,depthWrite:false});
  const boxLines=(b,y0,y1)=>{ const [x0,z0,x1,z1]=b, P_=[], c=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]; for(let i=0;i<4;i++){ const [a,bq]=[c[i],c[(i+1)%4]]; for(const y of [y0,y1])P_.push(a[0],y,a[1],bq[0],y,bq[1]); P_.push(a[0],y0,a[1],a[0],y1,a[1]); } return P_; };
  const seg=(P_,m)=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P_,3)); const l=new THREE.LineSegments(geo,m); l.renderOrder=999; l.frustumCulled=false; return l; };
  const overlay=()=>{ if(!OV)return; for(const c of OV.children.slice()){ c.geometry.dispose(); OV.remove(c); }
    const y=.03, others=[]; for(const k of KEYS){ if(k===sel||k==='land')continue; const b=boxOf(k); if(b)others.push(...boxLines(b,y,HIGH[k]())); } OV.add(seg(others,OV.userData.dim));
    const b=boxOf(sel), b0=BOX[sel](), h=HIGH[sel](); if(b0&&b0.some((v,i)=>Math.abs(v-b[i])>1e-4))OV.add(seg(boxLines(b0,y,h),OV.userData.was));
    OV.add(seg(boxLines(b,y,h),OV.userData.hi));
    // the grid: quarter tiles from where it was built (so its corners land on the lines), round it, at most some 48 tiles a side round the box's middle (round the edge held, for the land)
    const at=d3&&d3.t==='edge'&&d3.g?d3.g:{x:(b[0]+b[2])/2,z:(b[1]+b[3])/2}, ox=b0?b0[0]:0, oz=b0?b0[1]:0, H=Math.min(24*T,Math.max(b[2]-b[0],b[3]-b[1])/2+3*T), L=[];
    const i0=Math.floor((at.x-H-ox)/(G*T)), i1=Math.ceil((at.x+H-ox)/(G*T)), j0=Math.floor((at.z-H-oz)/(G*T)), j1=Math.ceil((at.z+H-oz)/(G*T)), xa=ox+i0*G*T, xb=ox+i1*G*T, za=oz+j0*G*T, zb=oz+j1*G*T;
    for(let i=i0;i<=i1;i++){ const x=ox+i*G*T; L.push(x,.02,za,x,.02,zb); } for(let j=j0;j<=j1;j++){ const z=oz+j*G*T; L.push(xa,.02,z,xb,.02,z); }
    const gm=seg(L,OV.userData.grid); OV.add(gm);
    // the place's own meshes, where they're a group of their own (the land's sheet too)
    live(); };
  const live=(reset)=>{ for(const k in LIVE){ const a=off(BUILT,k), w=off(WORK,k); for(const nm of LIVE[k]){ const gr=MAPG[nm]; if(gr)gr.position.set(reset?0:(w.x-a.x)*T,0,reset?0:(w.y-a.y)*T); } }
    if(MODS.land){ const a=off(BUILT,'land'), w=off(WORK,'land'); MODS.land.position.set(reset?0:(w.x-a.x)*T,MODS.land.position.y,reset?0:(w.y-a.y)*T); } };
  const changed=()=>{ overlay(); draw(); };
  const nudge=(dx,dy)=>{ const e=ent(sel); e.x=q4((e.x||0)+dx); e.y=q4((e.y||0)+dy); WORK=clean(WORK); changed(); };
  // THE VIEW'S OWN BUTTONS (owner, 17 Oct 2026: "how do i view sideview? nothing is letting me drag it"): turn an eighth, tilt, straight down, from the side
  const VIEW={turnL:()=>UI.orbit(-Math.PI/4/.008,0),turnR:()=>UI.orbit(Math.PI/4/.008,0),up:()=>UI.orbit(0,40),down:()=>UI.orbit(0,-40),top:()=>UI.orbit(0,1e4),side:()=>UI.orbit(0,-1e4)};
  P.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>VIEW[b.dataset.v]());
  P.querySelectorAll('[data-n]').forEach(b=>b.onclick=ev=>{ const [x,y]=b.dataset.n.split(',').map(Number), m=ev.shiftKey?1:G; nudge(x*m,y*m); });
  q('#meR').onclick=()=>{ delete WORK[sel]; changed(); }; q('#meRA').onclick=()=>{ WORK={}; changed(); };
  q('#meA').onclick=()=>{ try{ localStorage.setItem('market-layout',JSON.stringify(clean(WORK))); }catch(e){} location.reload(); };
  q('#meE').onclick=()=>{ const t=q('#meT'); t.value='LAYOUT '+JSON.stringify(clean(WORK)); t.style.display='block'; t.select(); try{ navigator.clipboard.writeText(t.value); }catch(e){} };
  // ---- dragging: a place moves by whole grid steps from where the drag began; an edge of the park or the land the same
  const moveBy=(k,s,dx,dz)=>{ const o=ent(k); o.x=q4(s.x+dx); o.y=q4(s.y+dz); };
  const edgeBy=(k,s,i,dx,dz)=>{ const o=ent(k), E=s.slice(), wasE=off(WORK,k).e; E[i]=q4(s[i]+(i&1?dz:dx)); o.e=E; const nb=boxOf(k); if(nb[2]-nb[0]<4*T||nb[3]-nb[1]<4*T)o.e=wasE; };   // (never smaller than four tiles)
  // on the plan
  const hit2=(px,pz)=>{ const x=wx(px), z=wz(pz), L=KEYS.map(k=>[k,boxOf(k)]).filter(p=>p[1]&&x>=p[1][0]&&x<=p[1][2]&&z>=p[1][1]&&z<=p[1][3]);
    L.sort((a,b)=>(a[1][2]-a[1][0])*(a[1][3]-a[1][1])-(b[1][2]-b[1][0])*(b[1][3]-b[1][1])); const k=L.length?L[0][0]:null; return k==='land'?null:k; };
  const edge2=(px,pz)=>{ if(!SIZED[sel])return -1; const b=boxOf(sel), x=sx(b[0]), y=sz(b[1]), X=sx(b[2]), Y=sz(b[3]), d=5, inX=px>x-d&&px<X+d, inY=pz>y-d&&pz<Y+d;
    return inY&&Math.abs(px-x)<d?0:inX&&Math.abs(pz-y)<d?1:inY&&Math.abs(px-X)<d?2:inX&&Math.abs(pz-Y)<d?3:-1; };
  const at2=e=>{ const r=cv2.getBoundingClientRect(); return [(e.clientX-r.left)*cv2.width/r.width,(e.clientY-r.top)*cv2.height/r.height]; };
  cv2.addEventListener('pointerdown',e=>{ const [px,pz]=at2(e), ed=edge2(px,pz), k=ed<0?hit2(px,pz):sel; cv2.setPointerCapture(e.pointerId);
    if(ed>=0)act={t:'edge',i:ed,p:[px,pz],e:off(WORK,sel).e.slice()}; else if(k){ sel=k; const w=off(WORK,k); act={t:'move',p:[px,pz],s:{x:w.x,y:w.y}}; } else act={t:'pan',p:[px,pz],c:[V.cx,V.cz]}; changed(); });
  cv2.addEventListener('pointermove',e=>{ const [px,pz]=at2(e); if(!act){ const ed=edge2(px,pz); cv2.style.cursor=ed===0||ed===2?'ew-resize':ed>=0?'ns-resize':hit2(px,pz)?'move':'grab'; return; }
    const dx=(px-act.p[0])/V.k/T, dz=(pz-act.p[1])/V.k/T;
    if(act.t==='pan'){ V.cx=act.c[0]-dx*T; V.cz=act.c[1]-dz*T; draw(); return; } if(act.t==='move')moveBy(sel,act.s,dx,dz); else edgeBy(sel,act.e,act.i,dx,dz); changed(); });
  cv2.addEventListener('pointerup',()=>{ act=null; WORK=clean(WORK); changed(); });
  cv2.addEventListener('wheel',e=>{ e.preventDefault(); const [px,pz]=at2(e), x=wx(px), z=wz(pz); V.k*=e.deltaY<0?1.2:1/1.2; V.cx=x-(px-cv2.width/2)/V.k; V.cz=z-(pz-cv2.height/2)/V.k; draw(); },{passive:false});
  // in the world (ui.js hands the view's left button here first while the editor's on): the ground under the mouse, the place the mouse is on
  const RC=new THREE.Raycaster(), GP=new THREE.Plane(new THREE.Vector3(0,1,0),0), B3=new THREE.Box3(), hv=new THREE.Vector3();
  const rayOf=e=>{ const r=renderer.domElement.getBoundingClientRect(); RC.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),cam); return RC.ray; };
  const ground=ray=>ray.intersectPlane(GP,hv)?{x:hv.x,z:hv.z}:null;
  const pick3=ray=>{ let best=null; for(const k of KEYS){ if(k==='land')continue; const b=boxOf(k); if(!b)continue; B3.min.set(b[0],0,b[1]); B3.max.set(b[2],HIGH[k](),b[3]); if(!ray.intersectBox(B3,hv))continue;
      const a=(b[2]-b[0])*(b[3]-b[1]); if(!best||a<best.a)best={k,a}; } return best&&best.k; };   // (the smallest one the ray passes through: the castle before the park)
  const edge3=(gp,e)=>{ if(!SIZED[sel]||!gp)return -1; const b=boxOf(sel), r=renderer.domElement.getBoundingClientRect(), d=Math.max(.6*T,10*(cam.isOrthographicCamera?(cam.right-cam.left)/r.width:.05)), inX=gp.x>b[0]-d&&gp.x<b[2]+d, inZ=gp.z>b[1]-d&&gp.z<b[3]+d;
    return inZ&&Math.abs(gp.x-b[0])<d?0:inX&&Math.abs(gp.z-b[1])<d?1:inZ&&Math.abs(gp.x-b[2])<d?2:inX&&Math.abs(gp.z-b[3])<d?3:-1; };
  MAPED.down=e=>{ if(!MAPED.on||e.button!==0||e.shiftKey||e.altKey)return false; const ray=rayOf(e), gp=ground(ray), ed=edge3(gp,e);
    if(ed>=0){ d3={t:'edge',i:ed,g0:gp,g:gp,e:off(WORK,sel).e.slice()}; overlay(); return true; }
    const k=e.ctrlKey||e.metaKey?null:pick3(ray); if(!k||!gp){ d3={t:'orbit',x:e.clientX,y:e.clientY}; return true; } sel=k;   /* (open ground, or Ctrl / Cmd + drag: turn and tilt the view) */ const w=off(WORK,k); d3={t:'move',g0:gp,s:{x:w.x,y:w.y}}; changed(); return true; };
  MAPED.move=e=>{ if(!d3)return; if(d3.t==='orbit'){ UI.orbit(e.clientX-d3.x,e.clientY-d3.y); d3.x=e.clientX; d3.y=e.clientY; return; } const gp=ground(rayOf(e)); if(!gp)return; const dx=(gp.x-d3.g0.x)/T, dz=(gp.z-d3.g0.z)/T; d3.g=gp;
    if(d3.t==='move')moveBy(sel,d3.s,dx,dz); else edgeBy(sel,d3.e,d3.i,dx,dz); changed(); };
  MAPED.up=()=>{ if(!d3)return; if(d3.t==='orbit'){ d3=null; return; } d3=null; WORK=clean(WORK); changed(); };
  Object.defineProperty(MAPED,'dragging',{get:()=>!!d3});
  // the arrows nudge the chosen place while the editor's open (a grid step; Shift a whole tile); Escape closes it
  addEventListener('keydown',e=>{ if(!MAPED.on||/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName||''))return; const m=e.shiftKey?1:G, A={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]}[e.key.toLowerCase()];
    const S={w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[e.key.toLowerCase()]; if(S&&!e.ctrlKey&&!e.metaKey){ const f=new THREE.Vector3(); cam.getWorldDirection(f); f.y=0; f.normalize(); const r=new THREE.Vector3(-f.z,0,f.x), k=(e.shiftKey?8:2)*T; UI.off.addScaledVector(f,-S[1]*k).addScaledVector(r,S[0]*k); e.preventDefault(); e.stopImmediatePropagation(); return; }   // (W A S D slide the view: the editor's, not his walk)
    const V={q:'turnL',e:'turnR',x:'up',z:'down',t:'top',y:'side'}[e.key.toLowerCase()]; if(V&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!(e.shiftKey&&e.key.toLowerCase()==='e')){ VIEW[V](); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(A){ nudge(A[0]*m,A[1]*m); e.preventDefault(); e.stopImmediatePropagation(); } else if(e.key==='Escape'){ MAPED.toggle(); e.stopImmediatePropagation(); } },true);
  // ---- ON AND OFF: on, the map view (free all round), zoomed out far, the rooms' cut away off; off, the view as it was, the live moves put back
  // (what's built is what stands till APPLY), the boxes and the grid thrown away
  MAPED.toggle=()=>{ MAPED.on=P.style.display==='none'; P.style.display=MAPED.on?'block':'none';
    if(MAPED.on){ if(UI.menuOpen)UI.toggleMenu(); was={view:UI.view,maxw:UI.MAXW}; UI.MAXW=240*T; if(UI.view!=='map')UI.setView('map');
      OV=new THREE.Group(); OV.userData={hi:LM(0xf2c14e,1),was:LM(0xc9ccd6,.55),dim:LM(0x8a8f9c,.35),grid:LM(0xf2c14e,.18)}; OV.userData.grid.depthTest=true; scene.add(OV);   /* (the grid on the ground, under what stands on it; the boxes seen through everything) */
      fit(); if(!PH)shoot(); changed(); }
    else { live(true); d3=null; if(OV){ for(const c of OV.children)c.geometry.dispose(); for(const k in OV.userData)OV.userData[k].dispose(); scene.remove(OV); OV=null; }
      if(was){ UI.MAXW=was.maxw; if(was.view!==UI.view)UI.setView(was.view); was=null; } } };
  // (the picture from above: the street's level over the places as built and a margin, some 6 pixels a tile, no more than 1200 across)
  const shoot=()=>{ let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const k of KEYS){ if(k==='land')continue; const b=BOX[k](); if(!b)continue; x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); }
    const m=20*T, R_={x0:x0-m,z0:z0-m,x1:x1+m,z1:z1+m}, k=Math.min(6/T,1200/(R_.x1-R_.x0),1200/(R_.z1-R_.z0)), W=Math.round((R_.x1-R_.x0)*k), H=Math.round((R_.z1-R_.z0)*k);
    live(true); try{ const c=document.createElement('canvas'); c.width=W; c.height=H; c.getContext('2d').putImageData(UI.topShot(R_,'up',W,H),0,0); PH={c,R:R_}; }catch(e){ console.warn('map editor: no picture',e); } };
  // (the menu's MAP tab has a way in too)
  { const row=document.querySelector('#menu [data-p="map"] .row'); if(row){ const b=document.createElement('button'); b.className='btn'; b.textContent='MAP EDITOR (SHIFT+M)'; b.onclick=()=>MAPED.toggle(); row.appendChild(b); } }
  // (a test's reach: the layout being made, a place's box, a world point on the screen, the plan's point on the screen)
  window.MAPED=MAPED; MAPED.work=()=>WORK; MAPED.box=boxOf; MAPED.high=k=>HIGH[k](); MAPED.sel=k=>{ if(k){ sel=k; changed(); } return sel; };
  MAPED.scr=(x,y,z)=>{ const v=new THREE.Vector3(x,y,z).project(cam), r=renderer.domElement.getBoundingClientRect(); return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]; };
  MAPED.px=(x,z)=>{ const r=cv2.getBoundingClientRect(); return [r.left+sx(x)*r.width/cv2.width,r.top+sz(z)*r.height/cv2.height]; }; MAPED.k=()=>V.k*cv2.getBoundingClientRect().width/cv2.width;
  MAPED.grp=n=>MAPG[n]&&MAPG[n].position.toArray(); MAPED.ov=()=>OV&&{n:OV.children.length,vis:OV.visible,inScene:!!OV.parent}; }
