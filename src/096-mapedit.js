// THE MAP EDITOR (Shift+M): a flat top-down mockup of the map, like the menu's map: layers to show, drag to look, wheel to zoom, double click to pick a thing, its details to change.
const MAPED={on:false,open:false,dragging:false,down:()=>false,move:()=>{},up:()=>{}};
{ const T=TILE;
  const BOX={bodega:()=>{ const B=BOD.B0; return [BOD.X(B.x0),BOD.Z(B.y0),BOD.X(B.x1),BOD.Z(B.y1)]; },
    house:()=>{ const A=MODS.apts&&MODS.apts.A; return A?[BOD.X(A.x0),BOD.Z(A.y0),BOD.X(A.x1),BOD.Z(A.y1)]:null; },
    ghost:()=>{ const g=BOD.grounds.find(g=>g.id==='ghostst'); return g?[BOD.X(g.x0),BOD.Z(g.y0),BOD.X(g.x1),BOD.Z(g.y1)]:null; },
    bar:()=>{ const R=STORE.rooms.find(r=>r.id==='bar'); return R?[R.x0,R.z0,R.x1,R.z1]:null; },
    park:()=>[BOD.XS(PARK.x0+PARK.ox),BOD.ZS(PARK.y0+PARK.oy),BOD.XS(PARK.x1+PARK.ox),BOD.ZS(PARK.y1+PARK.oy)],
    castle:()=>{ const b=CASTLE.b; return [BOD.XS(b[0]),BOD.ZS(b[2]),BOD.XS(b[1]),BOD.ZS(b[3])]; },
    subway:()=>{ const S=MAPSTAIR; return [BOD.XS(S.x0),BOD.ZS(S.y0),BOD.XS(S.x1),BOD.ZS(S.y1)]; }};
  MAPED.box=k=>BOX[k]?BOX[k]():null;

  const LAYERS=[['road','STREETS',1],['walk','SIDEWALKS',1],['way','PARK PATHS',1],['alley','ALLEY',1],['grass','GRASS',1],['water','WATER',1],['wall','PARK WALL',1],
    ['shop','BUILDINGS',1],['filler','EMPTY FRONTS',1],['shell','WEST ST SHELLS',1],['park','PARK PLACES',1],['tree','TREES',1],['label','NAMES',1],['grid','GRID',0]];
  const SHOW={}; for(const [k,,on] of LAYERS)SHOW[k]=!!on; try{ Object.assign(SHOW,JSON.parse(localStorage.getItem('maped-show')||'{}')); }catch(e){}
  const C={void:[11,13,18],water:[40,86,128],quay:[104,104,98],road:[52,54,60],alley:[70,71,76],walk:[142,138,128],land:[60,104,54],lawn:[74,134,60],way:[186,170,128],wall:[48,52,46]};
  const LAYOF={water:'water',quay:'walk',road:'road',alley:'alley',walk:'walk',land:'grass',lawn:'grass',way:'way',wall:'wall'};
  const K=BLDK, bt=(x,y)=>[BOD.OX+(x-BOD.OX)*K,BOD.OY+(y-BOD.OY)*K], wt=(x,z)=>[BOD.OX+x/T,BOD.OY+z/T];
  const rect=(a,b)=>({x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1])});
  const FRONT=-77, BACK=BLOCK.back;

  let TER=null, F=null, S=2;
  const terrain=()=>{ '@later'; F={...RING.cf}; const W=Math.round((F.x1-F.x0)*S), H=Math.round((F.y1-F.y0)*S), P=PARK, px0=P.x0+P.ox, px1=P.x1+P.ox, py0=P.y0+P.oy, py1=P.y1+P.oy, RV=RING.river, G=BOD.grounds.filter(g=>!g.bld), RA=BOD.road.at;
    const kind=(x,y)=>{ if(y<RV.y1)return y>RV.y1-1?'quay':'water'; if(RA(x,y))return 'road';
      if(x>px0&&x<px1&&y>py0&&y<py1){ if(x<px0+.5||x>px1-.5||y<py0+.5||y>py1-.5)return 'wall'; const u=x-P.ox, v=y-P.oy; if(FOUNT.lake(u,v)<0)return 'water'; if(FOUNT.ter(u,v)<0)return 'way'; if(P.path&&P.path(u,v))return 'way';
        if(P.brook){ const h=P.brook.h(u,v), q=P.brook.q(u,v); if(h!=null&&q&&h<P.brook.L(q[1]))return 'water'; } return 'lawn'; }
      for(let i=G.length-1;i>=0;i--){ const g=G[i]; if(x>=g.x0&&x<g.x1&&y>=g.y0&&y<g.y1)return /road|Road/.test(g.id)?'road':g.id==='alley'?'alley':g.id==='corner'?(g.z<0?'road':'walk'):'walk'; } return 'land'; };
    const KS=Object.keys(C), id=new Uint8Array(W*H); for(let j=0;j<H;j++)for(let i=0;i<W;i++)id[j*W+i]=KS.indexOf(kind(F.x0+(i+.5)/S,F.y1-(j+.5)/S));
    TER={W,H,id,KS,cv:document.createElement('canvas')}; TER.cv.width=W; TER.cv.height=H; paint(); };
  const paint=()=>{ const {W,H,id,KS,cv}=TER, g=cv.getContext('2d'), im=g.createImageData(W,H);
    for(let p=0;p<W*H;p++){ const k=KS[id[p]], c=LAYOF[k]&&SHOW[LAYOF[k]]?C[k]:C.void, o=p*4; im.data[o]=c[0]; im.data[o+1]=c[1]; im.data[o+2]=c[2]; im.data[o+3]=255; } g.putImageData(im,0,0); };

  const BUILT=JSON.parse(JSON.stringify(MEDIT)); let WORK=JSON.parse(JSON.stringify(MEDIT)), BUILT0=''; try{ const d=JSON.parse(localStorage.getItem('maped-draft')||'null'); if(d&&typeof d==='object')WORK=d; }catch(e){} const E=(id,f)=>+((WORK[id]||{})[f])||0, E0=(id,f)=>+((BUILT[id]||{})[f])||0;
  const lot=k=>rect([BLOCK.lots[k][0],BACK],[BLOCK.lots[k][1],FRONT]);
  let ITEMS=[];
  const items=()=>{ '@later'; const L=[], add=(o)=>L.push(o);
    { const A=MODS.apts&&MODS.apts.A; if(A)add({id:'apts',n:'APARTMENTS',ly:'shop',s:rect(bt(A.x0,A.y0),bt(A.x1,A.y1)),mv:'x',h:3*BOD.K.STORY,tex:'red brick, painted ivy (apartments painter)'}); }
    { const B=BOD.B0; add({id:'bodega',n:'THE BODEGA',ly:'shop',s:rect(bt(B.x0,B.y0),bt(B.x1,B.y1)),mv:'x',h:B.h,tex:'the bodega painter (brick, shop floor)'}); }
    { const m=WROW.mus; add({id:'museum',n:'MUSEUM OF EARTH',ly:'shop',s:rect(bt(m.x0,m.y0),bt(m.x1,m.y1)),mv:'x',h:m.h,tex:'museum stone (museum painter)'}); }
    add({id:'play',n:'THE PLAYHOUSE',ly:'shop',s:lot('play'),mv:'x',h:150,tex:'red brick, marquee (playhouse painter)'});
    { const b=STORE.bank&&STORE.bank.B; add({id:'bank',n:'THE BANK',ly:'shop',s:b?rect(bt(b.x0,b.y0),bt(b.x1,b.y1)):lot('bank'),mv:'x',h:b?b.h:200,tex:'museum stone, columns (bank)'}); }
    { const w=WROW.bar; add({id:'bar',n:'THE BAR',ly:'shop',s:rect(bt(w.x0,-89.5),bt(w.x1,-77)),mv:'x',h:130,tex:'bar walls (bar painter)'}); }
    add({id:'subway',n:'SUBWAY STAIRS',ly:'shop',s:rect([MAPSTAIR.x0,MAPSTAIR.y0],[MAPSTAIR.x1,MAPSTAIR.y1]),mv:'x',h:0,tex:'station tile (down below)'});
    add({id:'hudson',n:'TO THE HUDSON (PASSAGE)',ly:'shop',s:rect([BLOCK.hudson[0],BLOCK.row2[0]],[BLOCK.hudson[1],FRONT]),mv:'x',h:0,tex:'concrete pavement'});
    { const g=BOD.grounds.find(q=>q.id==='ghostst'); if(g)add({id:'bath',n:'THE BATH HOUSE',ly:'shop',s:rect(bt(g.x0,g.y0),bt(g.x1,g.y1)),mv:'x',h:170,tex:'bath house court and wood (ghost dojo painter)'}); }
    add({id:'theatre',n:'THE MOVIE THEATRE',ly:'shop',s:lot('theatre'),mv:'x',h:176,tex:'red brick, film front (theatre painter)'});
    add({id:'arcade',n:'THE ARCADE',ly:'shop',s:lot('arcade'),mv:'x',h:180,tex:'purple front, neon (arcade painter)'});
    add({id:'holo',n:'THE HOLODECK',ly:'shop',s:lot('holo'),mv:'x',h:132,tex:'dark panels, blue neon (holodeck painter)'});
    if(window.BLK)for(const q of BLK.blds){ if(q.e){ const i=L.filter(o=>o.ly==='shell').length+1; add({id:'shell'+i,n:'EMPTY SHELL '+i,ly:'shell',s:rect([q.x0,q.y0],[q.x1,q.y1]),mv:'xy',h:q.h,tex:'brick, shut front (block painter)'}); }
      else if(q.row===1)add({id:null,n:'EMPTY FRONT',ly:'filler',s:rect([q.x0,q.y0],[q.x1,q.y1]),h:q.h,tex:'brick, shutters (block painter)'});
      else add({id:null,n:'BACK ROW',ly:'filler',s:rect([q.x0,q.y0],[q.x1,q.y1]),h:q.h,tex:'brick (block painter)'}); }
    const P=PARK, ox=P.ox||0, oy=P.oy||0;
    { const c=CASTLE.b; add({id:'castle',n:'THE CASTLE',ly:'park',s:rect([c[0],c[2]],[c[1],c[3]]),mv:'xy',h:200,tex:'castle stone'}); }
    add({id:'lake',n:'THE LAKE',ly:'park',c:{x:P.lake[0]+ox,y:P.lake[1]+oy,r:P.lake[2]},mv:'xy',size:1,tex:'pond water, stone rim'});
    add({id:'round',n:'THE ROUND (AND THE GATE)',ly:'park',c:{x:P.round[0]+ox,y:P.round[1]+oy,r:P.round[2]},mv:'xy',tex:'park slabs'});
    add({id:'cave',n:"THE GOLEMS' CAVE",ly:'park',c:{x:PARKCAVE[0]+ox,y:PARKCAVE[1]+oy,r:5},mv:'xy',tex:'cave rock'});
    add({id:'tower',n:"THE SQUIRREL'S TOWER",ly:'park',s:rect([PARKTOWER[0]-4+ox,PARKTOWER[1]-4+oy],[PARKTOWER[0]+4+ox,PARKTOWER[1]+4+oy]),mv:'xy',h:120,tex:'tower stone'});
    if(FOUNT.S)add({id:null,n:'THE FOUNTAIN',ly:'park',c:{x:FOUNT.S.C.x+ox,y:FOUNT.S.C.y+oy,r:FOUNT.S.R},tex:'fountain stone, water'});
    if(P.campAt){ const c=P.campAt(); add({id:null,n:'THE CAMPFIRE',ly:'park',c:{x:c.x+ox,y:c.y+oy,r:2.5},tex:'fire, logs'}); }
    { const g=P.gate; add({id:null,n:'THE PARK GATE',ly:'park',s:rect([g[0]+ox,P.y0+oy-1],[g[1]+ox,P.y0+oy+1]),tex:'iron gate (moves with the round)'}); }
    for(const o of L){ o.c0=o.c?{...o.c}:null; o.s0=o.s?{...o.s}:null; } return L; };
  const at=o=>{ const dx=o.id?E(o.id,'dx')-E0(o.id,'dx'):0, dy=o.id?E(o.id,'dy')-E0(o.id,'dy'):0, dr=o.id?E(o.id,'dr')-E0(o.id,'dr'):0;
    if(o.c0)return {c:{x:o.c0.x+dx,y:o.c0.y+dy,r:Math.max(3,o.c0.r+dr)}}; return {s:{x0:o.s0.x0+dx,x1:o.s0.x1+dx,y0:o.s0.y0+dy,y1:o.s0.y1+dy}}; };
  const mid=o=>{ const p=at(o); return p.c?[p.c.x,p.c.y]:[(p.s.x0+p.s.x1)/2,(p.s.y0+p.s.y1)/2]; };
  const hit=(o,x,y)=>{ const p=at(o); return p.c?Math.hypot(x-p.c.x,y-p.c.y)<p.c.r:x>=p.s.x0&&x<=p.s.x1&&y>=p.s.y0&&y<=p.s.y1; };

  const R=document.createElement('div'); R.id='maped'; R.style.cssText='position:fixed;inset:0;z-index:60;display:none;background:#07090d;font:10px Silkscreen,monospace;color:#c9ccd6';
  R.innerHTML='<canvas id="meC" style="position:absolute;inset:0;width:100%;height:100%;cursor:grab;touch-action:none;image-rendering:pixelated"></canvas>'
    +'<div id="meTop" style="position:absolute;left:12px;top:12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:calc(100% - 360px)"><b style="font-size:12px;color:#ece5d3">MAP EDITOR</b><button class="mb" id="meFit">WHOLE MAP</button><button class="mb" id="meIn">ZOOM +</button><button class="mb" id="meOut">ZOOM −</button><span style="color:#8a8f9c">DRAG: LOOK AROUND · WHEEL: ZOOM · DOUBLE CLICK: PICK · DRAG THE PICKED THING: MOVE IT</span></div>'
    +'<div id="meSide" style="position:absolute;right:12px;top:12px;bottom:12px;width:320px;max-width:calc(100vw - 24px);overflow:auto;padding:10px 12px;background:#0b0d13f2;border:2px solid #2a3040;box-sizing:border-box">'
    +'<b style="color:#ece5d3">SHOW</b><div id="meLy" style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin:6px 0 10px"></div>'
    +'<b style="color:#ece5d3">PICKED</b><div id="meSel" style="margin-top:6px;line-height:1.7;color:#8a8f9c">DOUBLE CLICK A THING ON THE MAP.</div>'
    +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px"><button class="mb" id="meR">RESET THIS</button><button class="mb" id="meRA">RESET ALL</button><button class="mb" id="meE" style="color:#f2c14e">EXPORT MAP</button><button class="mb" id="meI">IMPORT MAP</button><input id="meF" type="file" accept=".json,application/json" style="display:none"></div>'
    +'<div id="meN" style="margin-top:6px;color:#f2c14e;min-height:12px"></div><textarea id="meT" readonly style="display:none;width:100%;height:80px;margin-top:6px;background:#000;color:#f2c14e;font:10px monospace;box-sizing:border-box"></textarea>'
    +'<div style="margin-top:8px;color:#8a8f9c;line-height:1.6">EDITS CHANGE THIS MOCKUP ONLY, NEVER THE GAME. EXPORT MAP SAVES THEM AS A FILE; IMPORT MAP LOADS ONE BACK. GREY FIELDS ARE FIXED FOR THAT THING.</div></div>';
  document.body.appendChild(R); const q=s=>R.querySelector(s), cv=q('#meC'), g=cv.getContext('2d');
  R.querySelectorAll('button.mb').forEach(b=>Object.assign(b.style,{font:'10px Silkscreen,monospace',padding:'4px 7px',color:b.style.color||'#ece5d3',background:'#0e1016',border:'2px solid #3a3f4e',cursor:'pointer'}));
  q('#meLy').innerHTML=LAYERS.map(([k,n])=>'<label style="display:flex;gap:5px;align-items:center;cursor:pointer"><input type="checkbox" data-ly="'+k+'"'+(SHOW[k]?' checked':'')+'>'+n+'</label>').join('');
  q('#meLy').addEventListener('change',e=>{ const k=e.target.dataset.ly; if(!k)return; SHOW[k]=e.target.checked; try{ localStorage.setItem('maped-show',JSON.stringify(SHOW)); }catch(_){} if(TER&&['road','walk','way','alley','grass','water','wall'].includes(k))paint(); draw(); });

  let V={x:60,y:0,k:3}, sel=null, drag=null;
  const size=()=>{ const r=cv.getBoundingClientRect(), d=Math.min(2,devicePixelRatio||1); cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); return d; };
  const sx=x=>cv.width/2+(x-V.x)*V.k, sy=y=>cv.height/2-(y-V.y)*V.k, mx=px=>V.x+(px-cv.width/2)/V.k, my=py=>V.y-(py-cv.height/2)/V.k;
  const fit=()=>{ const side=Math.min(340,cv.width*.4); V.x=(F.x0+F.x1)/2+side/2/((cv.width-side)/(F.x1-F.x0)); V.y=(F.y0+F.y1)/2; V.k=Math.min((cv.width-side)/(F.x1-F.x0+8),cv.height/(F.y1-F.y0+8)); };
  const COLS={shop:'#b0563e',filler:'#6e6460',shell:'#8c6a58',park:'#9a9488'};
  function draw(){ if(!MAPED.open||!TER)return; g.setTransform(1,0,0,1,0,0); g.fillStyle='#07090d'; g.fillRect(0,0,cv.width,cv.height); g.imageSmoothingEnabled=false;
    g.drawImage(TER.cv,sx(F.x0),sy(F.y1),(F.x1-F.x0)*V.k,(F.y1-F.y0)*V.k);
    if(SHOW.grid){ g.strokeStyle='rgba(255,255,255,.07)'; g.lineWidth=1; const st=V.k<2?50:V.k<6?10:5; for(let x=Math.ceil(F.x0/st)*st;x<=F.x1;x+=st){ g.beginPath(); g.moveTo(sx(x),sy(F.y1)); g.lineTo(sx(x),sy(F.y0)); g.stroke(); } for(let y=Math.ceil(F.y0/st)*st;y<=F.y1;y+=st){ g.beginPath(); g.moveTo(sx(F.x0),sy(y)); g.lineTo(sx(F.x1),sy(y)); g.stroke(); } }
    if(SHOW.tree&&PARK.oaks){ g.fillStyle='#24502a'; for(const [X,Z,m] of PARK.oaks){ const [x,y]=wt(X,Z), r=Math.max(1.5,m*.42*.5*V.k); g.beginPath(); g.arc(sx(x),sy(y),r,0,7); g.fill(); } }
    g.strokeStyle='#46c8d2'; g.lineWidth=2; g.strokeRect(sx(F.x0),sy(F.y1),(F.x1-F.x0)*V.k,(F.y1-F.y0)*V.k);
    for(const o of ITEMS){ if(!SHOW[o.ly])continue; const p=at(o), on=o===sel; g.fillStyle=on?'#f2c14e':COLS[o.ly]; g.strokeStyle=on?'#fff6d0':'rgba(0,0,0,.55)'; g.lineWidth=on?2:1;
      if(p.c){ g.globalAlpha=o.id==='lake'?.85:1; if(o.id==='lake'&&!on)g.fillStyle='#3a74aa'; g.beginPath(); g.arc(sx(p.c.x),sy(p.c.y),p.c.r*V.k,0,7); g.fill(); g.stroke(); g.globalAlpha=1; }
      else { const a=sx(p.s.x0), b=sy(p.s.y1), w=(p.s.x1-p.s.x0)*V.k, h=(p.s.y1-p.s.y0)*V.k; if(o.id==='hudson'){ g.fillStyle=on?'#f2c14e':'#9a968a'; } g.fillRect(a,b,w,h); g.strokeRect(a+.5,b+.5,w-1,h-1); } }
    if(SHOW.label){ g.font=Math.round(9*Math.min(2,devicePixelRatio||1))+'px Silkscreen,monospace'; g.textAlign='center'; g.textBaseline='middle';
      for(const o of ITEMS){ if(!SHOW[o.ly]||o.ly==='filler'||(o.ly==='shell'&&V.k<3))continue; const [x,y]=mid(o), t=o.n.replace(/ \(.*\)/,''); g.fillStyle='rgba(0,0,0,.6)'; const w=g.measureText(t).width; g.fillRect(sx(x)-w/2-2,sy(y)-7,w+4,14); g.fillStyle=o===sel?'#f2c14e':'#ece5d3'; g.fillText(t,sx(x),sy(y)); }
      g.fillStyle='rgba(236,229,211,.5)'; for(const [t,x,y] of [['MARKET ST',60,(BOD.CURB+BOD.FAR)/2],['WEST ST',(RING.wr0+RING.wr1)/2,90],['CENTRAL PARK',(PARK.x0+PARK.x1)/2+(PARK.ox||0),150],['THE HUDSON',60,(RING.river.y0+RING.river.y1)/2]])g.fillText(t,sx(x),sy(y)); } }

  const f2=v=>(+v).toFixed(2);
  const panel=()=>{ const el=q('#meSel'); if(!sel){ el.innerHTML='DOUBLE CLICK A THING ON THE MAP.'; return; } const o=sel, p=at(o), [x,y]=mid(o), w=p.c?2*p.c.r:p.s.x1-p.s.x0, d=p.c?2*p.c.r:p.s.y1-p.s.y0, mvx=o.id&&/x/.test(o.mv||''), mvy=o.id&&/y/.test(o.mv||''), szr=o.id&&o.size;
    const fld=(lab,k,v,on,step=.25)=>'<label style="display:flex;justify-content:space-between;align-items:center;gap:6px">'+lab+'<input data-f="'+k+'" type="number" step="'+step+'" value="'+f2(v)+'"'+(on?'':' disabled')+' style="width:110px;font:10px monospace;background:'+(on?'#000':'#15171d')+';color:'+(on?'#f2c14e':'#6a6e78')+';border:1px solid #3a3f4e;padding:2px 4px"></label>';
    el.innerHTML='<div style="color:#f2c14e;font-size:11px">'+o.n+'</div><div>KIND: '+({shop:'BUILDING',filler:'EMPTY FRONT',shell:'WEST ST SHELL',park:'PARK PLACE'})[o.ly]+'</div>'
      +fld('X (EAST)','x',x,mvx)+fld('Y (NORTH)','y',y,mvy)+fld('Z (GROUND)','z',0,false)+fld(p.c?'RADIUS':'WIDTH','w',p.c?p.c.r:w,szr,.5)+(p.c?'':fld('DEPTH','d',d,false))+fld('HEIGHT','h',(o.h||0)/24,false)+fld('SCALE','s',1,false,.05)
      +'<div style="margin-top:4px">TEXTURE: <span style="color:#c9ccd6">'+(o.tex||'—')+'</span></div>'+(o.id?'':'<div style="color:#c88a6a;margin-top:4px">THIS ONE IS PLACED BY THE GAME (FIXED HERE).</div>')
      +'<div style="display:flex;gap:4px;margin-top:6px">'+[['◀',-1,0],['▲',0,1],['▼',0,-1],['▶',1,0]].map(([t,a,b])=>'<button class="mb" data-n="'+a+','+b+'"'+((a&&mvx)||(b&&mvy)?'':' disabled')+'>'+t+'</button>').join('')+'</div>';
    el.querySelectorAll('button.mb').forEach(b=>Object.assign(b.style,{font:'10px Silkscreen,monospace',padding:'4px 7px',color:'#ece5d3',background:'#0e1016',border:'2px solid #3a3f4e',cursor:'pointer',opacity:b.disabled?.4:1})); };
  const ent=id=>WORK[id]||(WORK[id]={}), q4=v=>Math.round(v*4)/4;
  const nudge=(o,dx,dy)=>{ if(!o||!o.id)return; const e=ent(o.id); if(/x/.test(o.mv))e.dx=q4((e.dx||0)+dx); if(/y/.test(o.mv))e.dy=q4((e.dy||0)+dy); tidy(); panel(); draw(); };
  const tidy=()=>{ for(const k in WORK){ for(const f in WORK[k])if(!WORK[k][f])delete WORK[k][f]; if(!Object.keys(WORK[k]).length)delete WORK[k]; } q('#meN').textContent=JSON.stringify(WORK)===JSON.stringify(BUILT)?'':'NOT EXPORTED YET'; try{ localStorage.setItem('maped-draft',JSON.stringify(WORK)); }catch(e){} };
  q('#meSel').addEventListener('change',e=>{ const f=e.target.dataset.f; if(!f||!sel||!sel.id)return; const v=+e.target.value; if(!isFinite(v))return; const [x,y]=mid(sel), p=at(sel), e1=ent(sel.id);
    if(f==='x')e1.dx=q4((e1.dx||0)+v-x); else if(f==='y')e1.dy=q4((e1.dy||0)+v-y); else if(f==='w'&&p.c)e1.dr=Math.round(((e1.dr||0)+v-p.c.r)*2)/2; tidy(); panel(); draw(); });
  q('#meSel').addEventListener('click',e=>{ const n=e.target.dataset&&e.target.dataset.n; if(!n||e.target.disabled)return; const [a,b]=n.split(',').map(Number), st=e.shiftKey?1:.25; nudge(sel,a*st,b*st); });

  const pt=e=>{ const r=cv.getBoundingClientRect(), d=cv.width/r.width; return [(e.clientX-r.left)*d,(e.clientY-r.top)*d]; };
  cv.addEventListener('pointerdown',e=>{ if(e.button!==0&&e.button!==1)return; const [px,py]=pt(e), x=mx(px), y=my(py); cv.setPointerCapture(e.pointerId);
    drag=sel&&sel.id&&e.button===0&&hit(sel,x,y)?{t:'item',x,y,ex:(WORK[sel.id]||{}).dx||0,ey:(WORK[sel.id]||{}).dy||0}:{t:'pan',px,py,vx:V.x,vy:V.y}; cv.style.cursor=drag.t==='item'?'move':'grabbing'; });
  cv.addEventListener('pointermove',e=>{ if(!drag)return; const [px,py]=pt(e);
    if(drag.t==='pan'){ V.x=drag.vx-(px-drag.px)/V.k; V.y=drag.vy+(py-drag.py)/V.k; draw(); return; }
    const x=mx(px), y=my(py), e1=ent(sel.id); if(/x/.test(sel.mv))e1.dx=q4(drag.ex+x-drag.x); if(/y/.test(sel.mv))e1.dy=q4(drag.ey+y-drag.y); tidy(); panel(); draw(); });
  const end=()=>{ drag=null; cv.style.cursor='grab'; };
  cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
  cv.addEventListener('dblclick',e=>{ const [px,py]=pt(e), x=mx(px), y=my(py); let best=null, ba=1e18;
    for(const o of ITEMS){ if(!SHOW[o.ly]||!hit(o,x,y))continue; const p=at(o), a=p.c?Math.PI*p.c.r*p.c.r:(p.s.x1-p.s.x0)*(p.s.y1-p.s.y0); if(a<ba){ ba=a; best=o; } }
    sel=best; panel(); draw(); });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const [px,py]=pt(e), x=mx(px), y=my(py); V.k=Math.max(.5,Math.min(40,V.k*Math.pow(1.0015,-e.deltaY))); V.x=x-(px-cv.width/2)/V.k; V.y=y+(py-cv.height/2)/V.k; draw(); },{passive:false});
  const zoom=f=>{ V.k=Math.max(.5,Math.min(40,V.k*f)); draw(); };
  q('#meFit').onclick=()=>{ fit(); draw(); }; q('#meIn').onclick=()=>zoom(1.4); q('#meOut').onclick=()=>zoom(1/1.4);
  q('#meR').onclick=()=>{ if(!sel||!sel.id)return; delete WORK[sel.id]; if(BUILT[sel.id])WORK[sel.id]={...BUILT[sel.id]}; tidy(); panel(); draw(); };
  q('#meRA').onclick=()=>{ WORK={}; tidy(); q('#meN').textContent=Object.keys(BUILT).length?'ALL BACK TO THE GAME\'S OWN PLACES: SAVE TO KEEP':''; panel(); draw(); };
  const dump=()=>({map:'THE MARKET',v:1,at:new Date().toISOString(),edits:WORK,places:ITEMS.map(o=>{ const p=at(o), [x,y]=mid(o); return {id:o.id,name:o.n,kind:o.ly,x:+x.toFixed(2),y:+y.toFixed(2),...(p.c?{r:+p.c.r.toFixed(2)}:{w:+(p.s.x1-p.s.x0).toFixed(2),d:+(p.s.y1-p.s.y0).toFixed(2)})}; })});
  q('#meE').onclick=()=>{ tidy(); const b=new Blob([JSON.stringify(dump(),null,1)],{type:'application/json'}), a=document.createElement('a'), d=new Date(); a.href=URL.createObjectURL(b); a.download='market-map-'+d.toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); BUILT0=JSON.stringify(WORK); q('#meN').textContent='EXPORTED '+a.download; };
  q('#meI').onclick=()=>q('#meF').click();
  q('#meF').onchange=async e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(!f)return; try{ const j=JSON.parse(await f.text()), w=j&&(j.edits||j); if(!w||typeof w!=='object'||Array.isArray(w))throw 0; const ids=new Set(ITEMS.filter(o=>o.id).map(o=>o.id)), n={};
      for(const k in w)if(ids.has(k)&&w[k]&&typeof w[k]==='object'){ const o={}; for(const f2 of ['dx','dy','dr'])if(isFinite(+w[k][f2])&&+w[k][f2])o[f2]=q4(+w[k][f2]); if(Object.keys(o).length)n[k]=o; }
      WORK=n; tidy(); panel(); draw(); q('#meN').textContent='IMPORTED '+f.name+' ('+Object.keys(n).length+' MOVED)'; }catch(err){ q('#meN').textContent='NOT A MAP FILE: '+f.name; } };
  addEventListener('keydown',e=>{ if(!MAPED.open)return; if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return; e.stopImmediatePropagation();
    if(e.key==='Escape'||(e.key.toLowerCase()==='m'&&e.shiftKey)){ e.preventDefault(); MAPED.toggle(); return; }
    const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key]; if(d){ e.preventDefault(); nudge(sel,d[0]*(e.shiftKey?1:.25),d[1]*(e.shiftKey?1:.25)); } },true);
  addEventListener('keyup',e=>{ if(MAPED.open&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))e.stopImmediatePropagation(); },true);
  addEventListener('resize',()=>{ if(MAPED.open){ size(); draw(); } });
  MAPED.toggle=()=>{ '@later'; MAPED.open=R.style.display==='none'; R.style.display=MAPED.open?'block':'none'; if(!MAPED.open)return; if(typeof keys!=='undefined'&&keys.clear)keys.clear();
    size(); if(!TER)terrain(); ITEMS=items(); if(sel)sel=ITEMS.find(o=>o.n===sel.n)||null; fit(); tidy(); panel(); draw(); };
  window.MAPED=MAPED; }
