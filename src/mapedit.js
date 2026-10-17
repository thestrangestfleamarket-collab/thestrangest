// ---- THE MAP EDITOR (owner, 17 Oct 2026: "build a map editor that allows me to move buildings and land around easily"): Shift+M, or the menu's
// MAP tab. The Market from above as a plan (the land, the street, every place a labelled box; the station under the street dashed): drag a place
// to move it, the arrows (or the keys, Shift for five) nudge it a tile, the park's and the land's edges drag to size them; APPLY keeps the layout
// in the browser (market-layout) and loads the page again, every place built where it now stands (map-pre.js's LAY: each place's code reads its
// move, so its faces, solids, lights, rooms, ground, stairs and lanes go with it); EXPORT gives the table to send, which goes into LAYOUT0 for good.
// Turning a place a quarter: not here (every place is built on walls along the map's two axes, its rooms, cut planes and painters with them).
// Nothing runs while it's closed: a plan drawn only when something changes ----
const MAPED={on:false};
{ const T=TILE, LBL={bodega:'THE BODEGA',house:'APARTMENT HOUSE',apartments:'APARTMENTS + POOL',ghost:'GHOST STREET + DOJO',diner:'THE DINER',bar:'THE BAR',park:'CENTRAL PARK',castle:'THE CASTLE + DUNGEON',subway:'SUBWAY STAIRS + STATION',land:'THE LAND (GRASS)'};
  const COL={bodega:'#a0503e',house:'#8c4a3c',apartments:'#5a6f8c',ghost:'#8a6a3e',diner:'#b04a44',bar:'#8a6040',park:'#3f7a3a',castle:'#8c8678',subway:'#3f7a5a',land:'#1d3420'};
  const SIZED={park:1,land:1};   // (the ones whose edges move too)
  // each place's box as it was built (world units: x0, z0, x1, z1), read from the places themselves
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
  const KEYS=Object.keys(BOX), BUILT=JSON.parse(JSON.stringify(LAY.L)), clean=o=>{ const r={}; for(const k in o){ const v=o[k]||{}, e=(v.e||[0,0,0,0]).map(n=>Math.round(n*2)/2), q={};
      if(v.x)q.x=Math.round(v.x*2)/2; if(v.y)q.y=Math.round(v.y*2)/2; if(e.some(n=>n))q.e=e; if(Object.keys(q).length)r[k]=q; } return r; };
  let WORK=clean(BUILT), sel='bodega', V=null, act=null, PH=null;
  const ent=k=>WORK[k]||(WORK[k]={}), off=(L,k)=>{ const v=L[k]||{}; return {x:v.x||0,y:v.y||0,e:v.e||[0,0,0,0]}; };
  // a place's box as the editor has it now: as built, moved by what changed since (and its edges)
  const boxOf=k=>{ const b=BOX[k](); if(!b)return null; const a=off(BUILT,k), w=off(WORK,k), dx=(w.x-a.x)*T, dz=(w.y-a.y)*T;
    return [b[0]+dx+(w.e[0]-a.e[0])*T,b[1]+dz+(w.e[1]-a.e[1])*T,b[2]+dx+(w.e[2]-a.e[2])*T,b[3]+dz+(w.e[3]-a.e[3])*T]; };
  const P=document.createElement('div'); P.id='maped'; P.style.cssText='position:fixed;right:12px;top:12px;z-index:22;display:none;width:600px;max-width:calc(100vw - 24px);padding:12px 14px;background:#0b0d13f2;border:2px solid #2a3040;color:#c9ccd6;font:11px Silkscreen,monospace;letter-spacing:.5px';
  P.innerHTML='<div style="display:flex;justify-content:space-between;padding-right:28px"><b>MAP EDITOR</b><span style="color:#8a8f9c">SHIFT+M</span></div>'
    +'<div style="color:#8a8f9c;margin:4px 0 6px">drag a place to move it · drag the park\'s or the land\'s edge to size it · wheel zooms · drag empty ground to look round</div>'
    +'<canvas id="meC" width="572" height="380" style="display:block;width:100%;image-rendering:pixelated;border:2px solid #2a3040;background:#07090d;cursor:grab;touch-action:none"></canvas>'
    +'<div id="meL" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px"></div><div id="meI" style="margin-top:6px;color:#f2c14e;min-height:14px"></div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;align-items:center"><button class="btn" data-n="-1,0">◀</button><button class="btn" data-n="0,-1">▲</button><button class="btn" data-n="0,1">▼</button><button class="btn" data-n="1,0">▶</button>'
    +'<button class="btn" id="meR">RESET THIS</button><button class="btn" id="meRA">RESET ALL</button><button class="btn" id="meA" style="color:#f2c14e">APPLY (RELOADS)</button><button class="btn" id="meE">EXPORT</button></div>'
    +'<div style="margin-top:6px;color:#8a8f9c">turning a place: not possible (every place is built on walls along the map\'s axes). the shrine goes with the park; the dungeon with the castle; the rooms stacked on the apartments with them; the station with its stairs</div>'
    +'<textarea id="meT" readonly style="display:none;width:100%;height:70px;margin-top:6px;background:#000;color:#f2c14e;font:11px monospace"></textarea>';
  document.body.appendChild(P); const q=s=>P.querySelector(s), cv=q('#meC'), g=cv.getContext('2d');
  // the view of the plan: its middle and its scale (pixels a world unit), first fitted to the street and the places
  const fit=()=>{ let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const k of KEYS){ if(k==='land')continue; const b=boxOf(k); if(!b)continue; x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); }
    const m=6*T; V={cx:(x0+x1)/2,cz:(z0+z1)/2,k:Math.min(cv.width/(x1-x0+2*m),cv.height/(z1-z0+2*m))}; };
  const sx=x=>(x-V.cx)*V.k+cv.width/2, sz=z=>(z-V.cz)*V.k+cv.height/2, wx=px=>(px-cv.width/2)/V.k+V.cx, wz=pz=>(pz-cv.height/2)/V.k+V.cz;
  const R=(b,fill,line,dash)=>{ const x=Math.round(sx(b[0])), y=Math.round(sz(b[1])), w=Math.round(sx(b[2]))-x, h=Math.round(sz(b[3]))-y; if(fill){ g.fillStyle=fill; g.fillRect(x,y,w,h); }
    if(line){ g.setLineDash(dash?[4,3]:[]); g.strokeStyle=line; g.lineWidth=dash===2?2:1; g.strokeRect(x+.5,y+.5,w-1,h-1); g.setLineDash([]); } return [x,y,w,h]; };
  const draw=()=>{ if(!V)fit(); g.fillStyle='#07090d'; g.fillRect(0,0,cv.width,cv.height); g.font='9px Silkscreen,monospace'; g.textBaseline='top';
    R(boxOf('land'),COL.land,sel==='land'?'#f2c14e':'#2e4a30');
    // the Market as it's built now, from straight above (taken once as the editor opens), under the boxes
    if(PH){ g.imageSmoothingEnabled=false; g.drawImage(PH.c,sx(PH.R.x0),sz(PH.R.z0),(PH.R.x1-PH.R.x0)*V.k,(PH.R.z1-PH.R.z0)*V.k); }
    // the street as it stays: the sidewalks, the road between its kerbs
    const M=BOD.MAP, XS=BOD.XS, ZS=BOD.ZS, W=BOD.K.LSEED.walk; R([XS(M.x0),ZS(W),XS(M.x1),ZS(M.y1)],PH?null:'#55534e','#55534e'); R([XS(M.x0),ZS(BOD.CURB),XS(M.x1),ZS(BOD.FAR)],PH?null:'#2c2e33');
    g.fillStyle='#8a8f9c'; g.fillText('THE STREET',Math.round(sx(XS(M.x0)))+4,Math.round(sz(ZS(BOD.CURB)))+3);
    // the station under the street (it goes with its stairs)
    { const S=MODS.station.BOUND, a=off(BUILT,'subway'), w=off(WORK,'subway'), dx=(w.x-a.x)*T, dz=(w.y-a.y)*T; const r=R([S.x0+dx,S.z0+dz,S.x1+dx,S.z1+dz],null,'#3f7a5a',1); g.fillStyle='#3f7a5a'; g.fillText('STATION (UNDERGROUND)',r[0]+3,r[1]+r[3]-12); }
    // the places, the biggest first so the small ones sit on top; where each was built, a faint outline while it's moved
    const order=KEYS.filter(k=>k!=='land').map(k=>[k,boxOf(k)]).filter(p=>p[1]).sort((a,b)=>(b[1][2]-b[1][0])*(b[1][3]-b[1][1])-(a[1][2]-a[1][0])*(a[1][3]-a[1][1]));
    for(const [k,b] of order){ const b0=BOX[k](); if(b0&&b0.some((v,i)=>Math.abs(v-b[i])>1e-4))R(b0,null,'#5a5e6a',1);
      const r=R(b,COL[k]+(PH?(k==='park'?'30':'70'):(k==='park'?'aa':'')),k===sel?'#f2c14e':COL[k],k===sel?2:0);
      if(k===sel||r[2]>30&&r[3]>10){ const tw=g.measureText(LBL[k]).width+5, ty=k===sel&&r[1]>14?r[1]-13:r[1]+1; g.save(); if(k!==sel){ g.beginPath(); g.rect(r[0],r[1],r[2],r[3]); g.clip(); }   // (the chosen one's name whole, over its box)
        g.fillStyle='#0b0d13cc'; g.fillRect(r[0]+1,ty,tw,12); g.fillStyle=k===sel?'#f2c14e':'#e8e6df'; g.fillText(LBL[k],r[0]+3,ty+2); g.restore(); } }
    if(SIZED[sel]){ const b=boxOf(sel); g.fillStyle='#f2c14e'; for(const [x,z] of [[(b[0]+b[2])/2,b[1]],[(b[0]+b[2])/2,b[3]],[b[0],(b[1]+b[3])/2],[b[2],(b[1]+b[3])/2]])g.fillRect(Math.round(sx(x))-3,Math.round(sz(z))-3,6,6); }
    // where he stands
    g.fillStyle='#f2c14e'; g.fillRect(Math.round(sx(pos.x))-2,Math.round(sz(pos.z))-2,5,5);
    info(); };
  const n=(v,a,b)=>v?(v>0?'+'+v+' '+a:v+' '+b):'';
  const info=()=>{ const w=off(WORK,sel), a=off(BUILT,sel), chg=JSON.stringify(clean(WORK))!==JSON.stringify(clean(BUILT));
    q('#meI').textContent=LBL[sel]+': '+([n(w.x,'EAST','WEST'),n(w.y,'SOUTH','NORTH')].filter(Boolean).join(', ')||'WHERE IT WAS MADE')+(w.e.some(Boolean)?' · EDGES '+w.e.join(' '):'')+' (TILES)'+(chg?' · NOT BUILT YET: APPLY':'');
    q('#meL').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===sel))); };
  for(const k of KEYS){ const b=document.createElement('button'); b.className='btn'; b.dataset.k=k; b.textContent=LBL[k]; b.onclick=()=>{ sel=k; draw(); }; q('#meL').appendChild(b); }
  const nudge=(dx,dy)=>{ const e=ent(sel); e.x=(e.x||0)+dx; e.y=(e.y||0)+dy; WORK=clean(WORK); draw(); };
  P.querySelectorAll('[data-n]').forEach(b=>b.onclick=ev=>{ const [x,y]=b.dataset.n.split(',').map(Number), m=ev.shiftKey?5:1; nudge(x*m,y*m); });
  q('#meR').onclick=()=>{ delete WORK[sel]; draw(); }; q('#meRA').onclick=()=>{ WORK={}; draw(); };
  q('#meA').onclick=()=>{ try{ SAVE.set('layout',JSON.stringify(clean(WORK))); }catch(e){} location.reload(); };
  q('#meE').onclick=()=>{ const t=q('#meT'); t.value='LAYOUT '+JSON.stringify(clean(WORK)); t.style.display='block'; t.select(); try{ navigator.clipboard.writeText(t.value); }catch(e){} };
  // the mouse on the plan: an edge of the park or the land (when it's the one chosen) sizes it; a place moves; empty ground slides the plan
  const hit=(px,pz)=>{ const x=wx(px), z=wz(pz), L=KEYS.map(k=>[k,boxOf(k)]).filter(p=>p[1]&&x>=p[1][0]&&x<=p[1][2]&&z>=p[1][1]&&z<=p[1][3]);
    L.sort((a,b)=>(a[1][2]-a[1][0])*(a[1][3]-a[1][1])-(b[1][2]-b[1][0])*(b[1][3]-b[1][1])); const k=L.length?L[0][0]:null; return k==='land'?null:k; };
  const edge=(px,pz)=>{ if(!SIZED[sel])return -1; const b=boxOf(sel), x=sx(b[0]), y=sz(b[1]), X=sx(b[2]), Y=sz(b[3]), d=6, inX=px>x-d&&px<X+d, inY=pz>y-d&&pz<Y+d;
    return inY&&Math.abs(px-x)<d?0:inX&&Math.abs(pz-y)<d?1:inY&&Math.abs(px-X)<d?2:inX&&Math.abs(pz-Y)<d?3:-1; };
  const at=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]; };
  cv.addEventListener('pointerdown',e=>{ const [px,pz]=at(e), ed=edge(px,pz), k=ed<0?hit(px,pz):sel; cv.setPointerCapture(e.pointerId);
    if(ed>=0){ const w=off(WORK,sel); act={t:'edge',i:ed,p:[px,pz],e:w.e.slice()}; }
    else if(k){ sel=k; const w=off(WORK,k); act={t:'move',p:[px,pz],x:w.x,y:w.y}; } else act={t:'pan',p:[px,pz],c:[V.cx,V.cz]}; draw(); });
  cv.addEventListener('pointermove',e=>{ const [px,pz]=at(e); if(!act){ const ed=edge(px,pz); cv.style.cursor=ed===0||ed===2?'ew-resize':ed>=0?'ns-resize':hit(px,pz)?'move':'grab'; return; }
    const dx=(px-act.p[0])/V.k/T, dz=(pz-act.p[1])/V.k/T, h=v=>Math.round(v*2)/2;   // (half a tile at a time)
    if(act.t==='pan'){ V.cx=act.c[0]-dx*T; V.cz=act.c[1]-dz*T; }
    else if(act.t==='move'){ const o=ent(sel); o.x=h(act.x+dx); o.y=h(act.y+dz); }
    else { const o=ent(sel), E=act.e.slice(), was=off(WORK,sel).e, i=act.i; E[i]=h(act.e[i]+(i&1?dz:dx)); o.e=E; const nb=boxOf(sel); if(nb[2]-nb[0]<4*T||nb[3]-nb[1]<4*T)o.e=was; }   // (never smaller than four tiles)
    draw(); });
  cv.addEventListener('pointerup',()=>{ act=null; WORK=clean(WORK); draw(); });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const [px,pz]=at(e), x=wx(px), z=wz(pz); V.k*=e.deltaY<0?1.2:1/1.2; V.cx=x-(px-cv.width/2)/V.k; V.cz=z-(pz-cv.height/2)/V.k; draw(); },{passive:false});
  // the arrows nudge the chosen place while the editor's open (Shift: five tiles); Escape closes it
  addEventListener('keydown',e=>{ if(!MAPED.on||/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName||''))return; const m=e.shiftKey?5:1, A={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]}[e.key.toLowerCase()];
    if(A){ nudge(A[0]*m,A[1]*m); e.preventDefault(); e.stopImmediatePropagation(); } else if(e.key==='Escape'){ MAPED.toggle(); e.stopImmediatePropagation(); } },true);
  MAPED.toggle=()=>{ MAPED.on=P.style.display==='none'; P.style.display=MAPED.on?'block':'none'; if(MAPED.on){ if(UI.menuOpen)UI.toggleMenu(); fit(); if(!PH)shoot(); draw(); } };
  // (the picture from above: the street's level over the places as built and a margin, some 8 pixels a tile, no more than 1600 across)
  const shoot=()=>{ let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9; for(const k of KEYS){ if(k==='land')continue; const b=BOX[k](); if(!b)continue; x0=Math.min(x0,b[0]); z0=Math.min(z0,b[1]); x1=Math.max(x1,b[2]); z1=Math.max(z1,b[3]); }
    const m=20*T, R={x0:x0-m,z0:z0-m,x1:x1+m,z1:z1+m}, k=Math.min(8/T,1600/(R.x1-R.x0),1600/(R.z1-R.z0)), W=Math.round((R.x1-R.x0)*k), H=Math.round((R.z1-R.z0)*k);
    try{ const c=document.createElement('canvas'); c.width=W; c.height=H; c.getContext('2d').putImageData(UI.topShot(R,'up',W,H),0,0); PH={c,R}; }catch(e){ console.warn('map editor: no picture',e); } };
  // (the menu's MAP tab has a way in too)
  { const row=document.querySelector('#menu [data-p="map"] .row'); if(row){ const b=document.createElement('button'); b.className='btn'; b.textContent='MAP EDITOR (SHIFT+M)'; b.onclick=()=>MAPED.toggle(); row.appendChild(b); } }
  window.MAPED=MAPED; MAPED.work=()=>WORK; MAPED.box=boxOf; MAPED.px=(x,z)=>{ const r=cv.getBoundingClientRect(); return [r.left+sx(x)*r.width/cv.width,r.top+sz(z)*r.height/cv.height]; }; MAPED.k=()=>V.k*cv.getBoundingClientRect().width/cv.width; }   // (a test's reach)
