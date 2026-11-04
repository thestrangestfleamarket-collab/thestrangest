// THE MAP EDITOR (Shift+Escape, or the EDITORS menu; its own file, fetched then): the Market on a flat top-down mockup — layers, look around, pick, move, turn, size, copy, delete, undo, a 360 view in a black void; exports world.json. (Characters are edited in the list editor, 096b-charedit.js; it reuses this file's 360 VIEW.)
import {SHARED, THREE} from './003-shx.js';
import {BLK, GAMEED, keys, MAPED, NPCS, PARK, pos, W3} from './003b-systems.js';
import {renderer} from './004-main.js';
import {BLDK, BLOCK, CASTLE, FADE, LEVEL, MAPSTAIR, MODS, PARKCAVE, PARKTOWER, RING, SECTION, SECTIONS, STORE, TILE, WP, WROW} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {FOUNT} from './060a-fount.js';
Object.assign(MAPED,{on:false,open:false,dragging:false,down:()=>false,move:()=>{},up:()=>{}});
{ const BOX={bodega:()=>{ const B=SHARED.BOD.B0; return [SHARED.BOD.X(B.x0),SHARED.BOD.Z(B.y0),SHARED.BOD.X(B.x1),SHARED.BOD.Z(B.y1)]; },
    house:()=>{ const A=MODS.apts&&MODS.apts.A; return A?[SHARED.BOD.X(A.x0),SHARED.BOD.Z(A.y0),SHARED.BOD.X(A.x1),SHARED.BOD.Z(A.y1)]:null; },
    ghost:()=>{ const g=SHARED.BOD.grounds.find(g=>g.id==='ghostst'); return g?[SHARED.BOD.X(g.x0),SHARED.BOD.Z(g.y0),SHARED.BOD.X(g.x1),SHARED.BOD.Z(g.y1)]:null; },
    bar:()=>{ const R=STORE.rooms.find(r=>r.id==='bar'); return R?[R.x0,R.z0,R.x1,R.z1]:null; },
    park:()=>[SHARED.BOD.XS(PARK.x0+PARK.ox),SHARED.BOD.ZS(PARK.y0+PARK.oy),SHARED.BOD.XS(PARK.x1+PARK.ox),SHARED.BOD.ZS(PARK.y1+PARK.oy)],
    castle:()=>{ const b=CASTLE.b; return [SHARED.BOD.XS(b[0]),SHARED.BOD.ZS(b[2]),SHARED.BOD.XS(b[1]),SHARED.BOD.ZS(b[3])]; },
    subway:()=>{ const S=MAPSTAIR; return [SHARED.BOD.XS(S.x0),SHARED.BOD.ZS(S.y0),SHARED.BOD.XS(S.x1),SHARED.BOD.ZS(S.y1)]; }};
  MAPED.box=k=>BOX[k]?BOX[k]():null; }
Object.assign(GAMEED,{open:false,built:false});
GAMEED.build=()=>{ '@editor'; const T=TILE;

  const css=(el,o)=>Object.assign(el.style,o), BTN={font:'10px Silkscreen,monospace',padding:'4px 7px',color:'#ece5d3',background:'#0e1016',border:'2px solid #3a3f4e',cursor:'pointer'};
  const skin=root=>root.querySelectorAll('button.mb').forEach(b=>css(b,{...BTN,color:b.dataset.hot?'#f2c14e':BTN.color,opacity:b.disabled?.4:1}));
  const hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const TEX=['brick (block painter)','red brick, painted ivy','museum stone','castle stone','bar walls','bodega painter','park slabs','concrete pavement','asphalt','grass','pond water','cave rock','wood','iron','glass','neon front','tree bark and leaves'];

  // VIEW: one thing alone in a black void, all round. A map thing shows as a mockup model built from its numbers; a character lends its own body for the view (the character editor uses this too).
  const VIEW=MAPED.VIEW={on:false};
  { const W=640, H=480, rt=new THREE.WebGLRenderTarget(W,H,{depthBuffer:true}); rt.texture.colorSpace=THREE.SRGBColorSpace;
    const vs=new THREE.Scene(); vs.background=new THREE.Color(0,0,0); vs.add(new THREE.HemisphereLight(0xdfe6ff,0x302820,1.1)); const sun=new THREE.DirectionalLight(0xffffff,1.6); sun.position.set(3,6,4); vs.add(sun);
    const vc=new THREE.PerspectiveCamera(32,W/H,.05,4000), buf=new Uint8Array(W*H*4);
    const R=document.createElement('div'); css(R,{position:'fixed',inset:'0',zIndex:'70',display:'none',background:'#000',font:'10px Silkscreen,monospace',color:'#c9ccd6'});
    R.innerHTML='<canvas id="vwC" width="'+W+'" height="'+H+'" style="position:absolute;left:0;top:0;width:calc(100% - 340px);height:100%;object-fit:contain;cursor:grab;touch-action:none"></canvas>'
      +'<div style="position:absolute;left:12px;top:12px;color:#8a8f9c">DRAG: TURN ALL ROUND · WHEEL: CLOSER · ESC: BACK · <span id="vwN" style="color:#f2c14e"></span></div>'
      +'<div id="vwS" style="position:absolute;right:12px;top:12px;bottom:12px;width:316px;overflow:auto;padding:10px 12px;background:#0b0d13f2;border:2px solid #2a3040;box-sizing:border-box"></div>';
    document.body.appendChild(R); const cv=R.querySelector('#vwC'), g=cv.getContext('2d'), im=g.createImageData(W,H), oc=document.createElement('canvas'); oc.width=W; oc.height=H;
    let tgt=null, yaw=.8, pitch=.45, dist=1, drag=null, raf=0, M=null;
    const frame=()=>{ raf=0; if(!VIEW.on||!tgt)return; raf=requestAnimationFrame(frame);
      if(tgt.model&&tgt.dirty){ tgt.dirty=false; if(M){ vs.remove(M); M.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material)[].concat(o.material).forEach(m=>{ if(m.map)m.map.dispose(); m.dispose(); }); }); } M=tgt.model(); if(M)vs.add(M); }
      const lent=tgt.lend?tgt.lend():[], back=lent.map(o=>[o,o.parent,o.visible,o.scale.clone()]), ls=tgt.lendScale?tgt.lendScale():1; for(const o of lent){ vs.attach(o); o.visible=true; o.scale.multiplyScalar(ls); o.updateMatrixWorld(true); }
      const b=new THREE.Box3(); for(const o of [...(M?[M]:[]),...lent])b.expandByObject(o); if(b.isEmpty())b.set(new THREE.Vector3(-1,0,-1),new THREE.Vector3(1,2,1));
      const c=b.getCenter(new THREE.Vector3()), sz=b.getSize(new THREE.Vector3()), rad=Math.max(sz.x,sz.y,sz.z)*.6*dist+.05;
      vc.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*rad*4.2,c.y+Math.sin(pitch)*rad*4.2,c.z+Math.cos(yaw)*Math.cos(pitch)*rad*4.2); vc.near=rad*.05; vc.far=rad*20; vc.updateProjectionMatrix(); vc.lookAt(c); vc.updateMatrixWorld();
      sun.position.copy(c).add(new THREE.Vector3(3,6,4).multiplyScalar(rad)); sun.target.position.copy(c); sun.target.updateMatrixWorld();
      const cp=renderer.clippingPlanes, lc=renderer.localClippingEnabled; renderer.clippingPlanes=[]; renderer.localClippingEnabled=false;
      try{ renderer.setRenderTarget(rt); renderer.setClearColor(0x000000,1); renderer.clear(); renderer.render(vs,vc); renderer.readRenderTargetPixels(rt,0,0,W,H,buf); }
      finally{ renderer.setRenderTarget(null); renderer.clippingPlanes=cp; renderer.localClippingEnabled=lc; for(const [o,p,v,sc] of back){ o.scale.copy(sc); if(p)p.attach(o); o.visible=v; } }
      for(let j=0;j<H;j++)im.data.set(buf.subarray((H-1-j)*W*4,(H-j)*W*4),j*W*4); const op=tgt.opacity?tgt.opacity():1; if(op==null||op>=1)g.putImageData(im,0,0); else { oc.getContext('2d').putImageData(im,0,0); g.fillStyle='#000'; g.fillRect(0,0,W,H); g.globalAlpha=Math.max(0,op); g.drawImage(oc,0,0); g.globalAlpha=1; }
      const e=tgt.look?tgt.look():null; if(e&&e.tint&&e.tint!=='#ffffff'){ g.globalCompositeOperation='multiply'; g.fillStyle=e.tint; g.fillRect(0,0,W,H); g.globalCompositeOperation='source-over'; } };
    cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,yaw,pitch}; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove',e=>{ if(!drag)return; yaw=drag.yaw-(e.clientX-drag.x)*.01; pitch=Math.max(-1.45,Math.min(1.45,drag.pitch+(e.clientY-drag.y)*.01)); });
    cv.addEventListener('pointerup',()=>drag=null); cv.addEventListener('wheel',e=>{ e.preventDefault(); dist=Math.max(.2,Math.min(4,dist*Math.pow(1.0015,e.deltaY))); },{passive:false});
    VIEW.open=(t,side)=>{ tgt=t; t.dirty=true; VIEW.on=true; R.style.display='block'; R.querySelector('#vwN').textContent=t.name||''; const s=R.querySelector('#vwS'); s.innerHTML=''; s.appendChild(side); skin(s); yaw=.8; pitch=.35; dist=1; if(!raf)raf=requestAnimationFrame(frame); };
    VIEW.redo=()=>{ if(tgt)tgt.dirty=true; };
    VIEW.close=()=>{ VIEW.on=false; R.style.display='none'; tgt=null; if(M){ vs.remove(M); M=null; } const f=VIEW.onclose; VIEW.onclose=null; if(f)f(); };
    VIEW.root=R; }
  // the mockup model's textures: small painted patterns, one per texture name
  const PAT={};
  const pattern=(name,col)=>{ const k=name+col; if(PAT[k])return PAT[k]; const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), base=col||'#888888'; x.fillStyle=base; x.fillRect(0,0,64,64);
    const dk='rgba(0,0,0,.28)', lt='rgba(255,255,255,.12)', n=(name||'').toLowerCase();
    if(/brick/.test(n)){ x.fillStyle=dk; for(let j=0;j<8;j++){ x.fillRect(0,j*8,64,1); for(let i=0;i<4;i++)x.fillRect(((i*16)+(j%2)*8)%64,j*8,1,8); } }
    else if(/stone|cave|castle/.test(n)){ x.fillStyle=dk; for(let j=0;j<4;j++){ x.fillRect(0,j*16,64,1); for(let i=0;i<3;i++)x.fillRect(((i*22)+(j%2)*11)%64,j*16,1,16); } x.fillStyle=lt; for(let i=0;i<30;i++)x.fillRect((i*37)%64,(i*23)%64,2,2); }
    else if(/wood|plank|bark/.test(n)){ x.fillStyle=dk; for(let j=0;j<64;j+=6)x.fillRect(0,j,64,1); x.fillStyle=lt; for(let i=0;i<12;i++)x.fillRect((i*29)%64,(i*17)%64,10,1); }
    else if(/slab|pavement|concrete/.test(n)){ x.fillStyle=dk; for(let j=0;j<64;j+=16){ x.fillRect(0,j,64,1); x.fillRect(j,0,1,64); } }
    else if(/asphalt|road/.test(n)){ x.fillStyle=lt; for(let i=0;i<60;i++)x.fillRect((i*41)%64,(i*29)%64,1,1); }
    else if(/glass|neon/.test(n)){ x.fillStyle='rgba(180,220,255,.35)'; for(let i=0;i<64;i+=16)x.fillRect(i+2,4,12,40); }
    else if(/iron/.test(n)){ x.fillStyle=dk; for(let i=0;i<64;i+=8)x.fillRect(i,0,2,64); }
    else if(/grass|leaves|tree/.test(n)){ x.fillStyle=dk; for(let i=0;i<50;i++)x.fillRect((i*13)%64,(i*31)%64,2,3); x.fillStyle=lt; for(let i=0;i<30;i++)x.fillRect((i*19)%64,(i*7)%64,1,2); }
    else if(/water/.test(n)){ x.fillStyle=lt; for(let j=4;j<64;j+=10)x.fillRect((j*3)%40,j,24,1); }
    const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; PAT[k]=t; return t; };
  const mockup=o=>{ const G=new THREE.Group(), s=o.scale||1, op=o.opacity==null?1:o.opacity, mat=(col,rep)=>{ const t=pattern(o.tex||'',col).clone(); t.needsUpdate=true; t.repeat.set(rep[0],rep[1]); return new THREE.MeshLambertMaterial({map:t,transparent:op<1,opacity:op}); };
    const hgt=Math.max(.15,SHARED.BOD.YS(o.h||0)/T), Y0=(o.z||0);
    if(o.ly==='tree'){ const r=o.r*s, th=Math.max(2,hgt*.45), tr=new THREE.Mesh(new THREE.CylinderGeometry(r*.12,r*.16,th,7),mat('#5a4030',[1,2])); tr.position.y=th/2; const cn=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),mat(o.color||'#24502a',[2,2])); cn.position.y=th+r*.7; cn.material.flatShading=true; G.add(tr,cn); }
    else if(o.sh==='circle'){ const r=o.r*s, h=o.ly==='path'?.12:Math.max(.3,hgt), m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat(o.color,[Math.max(1,r),Math.max(1,h/2)])); m.position.y=h/2; G.add(m); }
    else { const w=o.w*s, d=o.d*s, h=o.ly==='path'?.12:Math.max(.3,hgt), m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(o.color,[Math.max(1,w/3),Math.max(1,h/3)])); m.position.y=h/2; G.add(m); }
    G.position.y=Y0; G.rotation.y=(o.rot||0)*Math.PI/180; return G; };
  MAPED.mockup=mockup;

  // THE MAP: a raster of the ground (streets, sidewalks, grass, water, walls) and every thing on it as a shape (a rect or a circle, turned).
  const LAYERS=[['road','STREETS',1],['walk','SIDEWALKS',1],['alley','ALLEY',1],['grass','GRASS',1],['water','WATER',1],['wall','PARK WALL',1],['path','PARK PATHS',1],
    ['shop','BUILDINGS',1],['filler','GARAGES AND LOTS',1],['park','PARK PLACES',1],['tree','TREES',1],['label','NAMES',1],['grid','GRID',0]];
  const GROUND=LAYERS.slice(0,7), LAYERS_CH=[...GROUND,['mapthings','MAP THINGS (FAINT)',1],['you','YOU',1],['people','PEOPLE',1],['toon','TOONS',1],['merchant','MERCHANTS',1],['animal','ANIMALS',1],['monster','MONSTERS',1],['label','NAMES',1],['grid','GRID',0]];
  const SHOW={}; for(const [k,,on] of [...LAYERS,...LAYERS_CH])SHOW[k]=!!on; try{ Object.assign(SHOW,JSON.parse(localStorage.getItem('maped-show')||'{}')); }catch(e){}
  const C={void:[11,13,18],lot:[70,66,60],water:[40,86,128],quay:[104,104,98],road:[52,54,60],alley:[70,71,76],walk:[142,138,128],land:[60,104,54],lawn:[74,134,60],way:[186,170,128],wall:[48,52,46]};
  const LAYOF={lot:'walk',water:'water',quay:'walk',road:'road',alley:'alley',walk:'walk',land:'grass',lawn:'grass',way:'path',wall:'wall'};
  const LCOL={shop:[176,86,62],filler:[110,100,96],shell:[140,106,88],park:[154,148,136],tree:[36,80,42],path:[186,170,128]};
  const FACEROT={n:0,e:-90,s:180,w:90}, faceOf=r=>['n','w','s','e'][((Math.round((r||0)/90)%4)+4)%4], bld=o=>!!(o&&o.gid&&WP[o.gid]&&WP[o.gid].kind==='front'), turns=o=>bld(o)&&WP[o.gid].y1!=null;
  const K=BLDK, bt=(x,y)=>[SHARED.BOD.OX+(x-SHARED.BOD.OX)*K,SHARED.BOD.OY+(y-SHARED.BOD.OY)*K], wt=(x,z)=>[SHARED.BOD.OX+x/T,SHARED.BOD.OY+z/T];
  const FRONT=BLOCK.front, BACK=BLOCK.back;
  let TER=null, F=null; const S=2;
  const terrain=()=>{ F={...RING.cf}; const W=Math.round((F.x1-F.x0)*S), H=Math.round((F.y1-F.y0)*S), P=PARK, px0=P.x0+P.ox, px1=P.x1+P.ox, py0=P.y0+P.oy, py1=P.y1+P.oy, RV=RING.river, G=SHARED.BOD.grounds.filter(g=>!g.bld), RA=SHARED.BOD.road.at;
    const SM=MODS.sections, kind=(x,y)=>{ const sk=SM&&SM.kindAt(x,y); if(sk)return sk; if(y<RV.y1)return y>RV.y1-1?'quay':'water'; if(RA(x,y))return 'road';
      if(x>px0&&x<px1&&y>py0&&y<py1){ if(x<px0+.5||x>px1-.5||y<py0+.5||y>py1-.5)return 'wall'; const u=x-P.ox, v=y-P.oy; if(FOUNT.lake(u,v)<0)return 'water'; if(FOUNT.ter(u,v)<0)return 'way';
        if(P.brook){ const h=P.brook.h(u,v), q=P.brook.q(u,v); if(h!=null&&q&&h<P.brook.L(q[1]))return 'water'; } return 'lawn'; }
      for(let i=G.length-1;i>=0;i--){ const g=G[i]; if(x>=g.x0&&x<g.x1&&y>=g.y0&&y<g.y1)return /road|Road/.test(g.id)?'road':g.id==='alley'?'alley':g.id==='corner'?(g.z<0?'road':'walk'):'walk'; } return 'land'; };
    const KS=Object.keys(C), id=new Uint8Array(W*H); for(let j=0;j<H;j++)for(let i=0;i<W;i++)id[j*W+i]=KS.indexOf(kind(F.x0+(i+.5)/S,F.y1-(j+.5)/S));
    TER={W,H,id,KS,cv:document.createElement('canvas')}; TER.cv.width=W; TER.cv.height=H; paint(); };
  const paint=()=>{ const {W,H,id,KS,cv}=TER, g=cv.getContext('2d'), im=g.createImageData(W,H);
    for(let p=0;p<W*H;p++){ const k=KS[id[p]], c=LAYOF[k]&&SHOW[LAYOF[k]]?C[k]:C.void, o=p*4; im.data[o]=c[0]; im.data[o+1]=c[1]; im.data[o+2]=c[2]; im.data[o+3]=255; } g.putImageData(im,0,0); };

  let uid=1; const nid=()=>'t'+(uid++);
  const base=()=>{ const L=[], P=PARK, ox=P.ox||0, oy=P.oy||0;
    const R=(n,ly,a,b,h,tex,gid)=>{ const x0=Math.min(a[0],b[0]), x1=Math.max(a[0],b[0]), y0=Math.min(a[1],b[1]), y1=Math.max(a[1],b[1]); L.push({id:nid(),gid:gid||null,n,ly,sh:'rect',x:(x0+x1)/2,y:(y0+y1)/2,w:x1-x0,d:y1-y0,rot:0,z:0,h:h||0,scale:1,tex,color:hex(LCOL[ly]),tint:'#ffffff',opacity:1}); };
    const Cc=(n,ly,x,y,r,h,tex,gid)=>L.push({id:nid(),gid:gid||null,n,ly,sh:'circle',x,y,r,rot:0,z:0,h:h||0,scale:1,tex,color:hex(LCOL[ly]),tint:'#ffffff',opacity:1});
    { const A=MODS.apts&&MODS.apts.A; if(A)R('APARTMENTS','shop',bt(A.x0,A.y0),bt(A.x1,A.y1),3*SHARED.BOD.K.STORY,'red brick, painted ivy','apts'); }
    { const B=SHARED.BOD.B0; R('THE BODEGA','shop',bt(B.x0,B.y0),bt(B.x1,B.y1),B.h,'bodega painter','bodega'); }
    { const m=WROW.mus; R('MUSEUM OF EARTH','shop',bt(m.x0,m.y0),bt(m.x1,m.y1),m.h,'museum stone','museum'); }
    const lot=k=>WP[k]&&WP[k].y1!=null?[[WP[k].x0,WP[k].y0],[WP[k].x1,WP[k].y1]]:[[BLOCK.lots[k][0],BACK],[BLOCK.lots[k][1],FRONT]];
    R('THE PLAYHOUSE','shop',...lot('play'),150,'red brick, marquee','play');
    { const b=STORE.bank&&STORE.bank.B; if(b)R('THE BANK','shop',bt(b.x0,b.y0),bt(b.x1,b.y1),b.h,'museum stone','bank'); else R('THE BANK','shop',...lot('bank'),200,'museum stone','bank'); }
    { const w=WROW.bar; R('THE BAR','shop',bt(w.x0,w.y0),bt(w.x1,w.y1),130,'bar walls','bar'); }
    R('SUBWAY STAIRS','shop',[MAPSTAIR.x0,MAPSTAIR.y0],[MAPSTAIR.x1,MAPSTAIR.y1],8,'concrete pavement','subway');
    R('TO THE HUDSON (PASSAGE)','path',[BLOCK.hudson[0],BLOCK.row2[0]],[BLOCK.hudson[1],FRONT],0,'concrete pavement','hudson');
    { const g=SHARED.BOD.grounds.find(q=>q.id==='ghostst'); if(g)R('THE BATH HOUSE','shop',bt(g.x0,g.y0),bt(g.x1,g.y1),170,'wood','bath'); }
    R('THE MOVIE THEATRE','shop',...lot('theatre'),176,'red brick, film front','theatre'); R('THE ARCADE','shop',...lot('arcade'),180,'neon front','arcade');
    if(window.BLK){ for(const q of BLK.blds)R('CLOSED GARAGE','filler',[q.x0,q.y0],[q.x1,q.y1],q.h,'brick (block painter)'); for(const q of BLK.lots)R(q.kind==='park'?'PARKING LOT':'EMPTY LOT','filler',[q.x0,q.y0],[q.x1,q.y1],0,q.kind==='park'?'asphalt (block painter)':'dirt (block painter)'); }
    { const c=CASTLE.b; R('THE CASTLE','park',[c[0],c[2]],[c[1],c[3]],200,'castle stone','castle'); }
    Cc('THE LAKE','park',P.lake[0]+ox,P.lake[1]+oy,P.lake[2],0,'pond water','lake'); L[L.length-1].color='#3a74aa';
    Cc('THE ROUND','path',P.round[0]+ox,P.round[1]+oy,P.round[2],0,'park slabs','round');
    Cc("THE GOLEMS' CAVE",'park',PARKCAVE[0]+ox,PARKCAVE[1]+oy,5,120,'cave rock','cave');
    R("THE SQUIRREL'S TOWER",'park',[PARKTOWER[0]-4+ox,PARKTOWER[1]-4+oy],[PARKTOWER[0]+4+ox,PARKTOWER[1]+4+oy],120,'castle stone','tower');
    { const s=LEVEL.parkPlaces.skatepark, e=s&&(s.face==='e'||s.face==='w'); if(s)R('THE SKATE PARK GATE','park',[s.x-(e?1:4.8)+ox,s.y-(e?4.8:1)+oy],[s.x+(e?1:4.8)+ox,s.y+(e?4.8:1)+oy],60,'concrete pavement','skatepark'); }
    if(FOUNT.S&&FOUNT.on)Cc('THE FOUNTAIN','park',FOUNT.S.C.x+ox,FOUNT.S.C.y+oy,FOUNT.S.R,40,'park slabs','fountain');
    if(P.campAt){ const c=P.campAt(); Cc('THE CAMPFIRE','park',c.x+ox,c.y+oy,2.5,20,'wood','camp'); }
    R('THE PARK GATE','park',[P.gate[0]+ox,P.y0+oy-1],[P.gate[1]+ox,P.y0+oy+1],150,'iron','gate');
    if(P.segs)P.segs.forEach(([ax,ay,bx,by],i)=>{ const L2=Math.hypot(bx-ax,by-ay); if(L2<.5)return; L.push({id:nid(),gid:(LEVEL.paths[i]&&LEVEL.paths[i].id)||'path'+i,n:'PARK PATH '+(i+1),ly:'path',sh:'rect',x:(ax+bx)/2+ox,y:(ay+by)/2+oy,w:L2,d:7.2,rot:Math.atan2(by-ay,bx-ax)*180/Math.PI,z:0,h:0,scale:1,tex:'park slabs',color:hex(LCOL.path),tint:'#ffffff',opacity:1}); });
    if(PARK.oaks)PARK.oaks.forEach(([X,Z,m],i)=>{ const [x,y]=wt(X,Z); Cc('TREE','tree',x,y,Math.max(.8,m*.21),m*16,'tree bark and leaves','tree'+i); });
    for(const o of L)if(bld(o)){ const f=WP[o.gid].face||'n'; o.rot=FACEROT[f]; if(f==='e'||f==='w'){ const w=o.w; o.w=o.d; o.d=w; } }
    return L; };

  const ANIMALS=['squirrel','fox','rat','frog','snake','spider','bat','wasp','slime','dragon','raincat','tvcat','scooterfrog','shark','manatee','rainfish','coatbear','origamifox','teddy','ticketfox','deer','wolf','bear','crow','owl','duck','cat','blackcat','dog','cow','pig','horse','wildhorse','mule','ibex','lion','elephant','giraffe','zebra','camel','penguin','raptor','stego','brachio','ptera','antqueen','woodant','aphid','ladybird','hopper','beetle','mantis','caterpillar','slug','snail','crab','bee','bumblebee','firefly'], MONST=/^(ogre|skeleton|slime|golem)/, PEOPLE=/^(hero|villager)/, MERCH=['tomato'];
  const kindOf=k=>k==='you'?'you':MERCH.includes(k)?'merchant':MONST.test(k)?'monster':PEOPLE.test(k)?'people':ANIMALS.includes(k)?'animal':'toon';
  const KCOL={you:'#f2f2f2',people:'#e8c49a',toon:'#c88ae0',merchant:'#f2a040',animal:'#8ad07a',monster:'#e05a5a'};
  const BEH=['STAND','WANDER','ROAM','DAILY LIFE','WORK','GUARD','FOLLOW YOU','SLEEP','FIGHT'];
  const behOf=N=>{ const j=N.rig&&N.rig.job; if(j)return 'WORK'; if(/^(ogre|skeleton)/.test(N.key)&&/guard/.test(N.key))return 'GUARD'; if(MONST.test(N.key))return 'FIGHT'; if(N.roam)return 'ROAM'; if(N.life)return 'DAILY LIFE'; if(N.st&&N.st.hold)return 'STAND'; return 'WANDER'; };
  const place=o=>{ if(o.lv==='down')return 'UNDERGROUND (THE STATION OR THE DUNGEON)'; const P=PARK, x=o.x, y=o.y;
    for(const m of (ST.map.items||[]))if((m.ly==='shop'||m.ly==='shell')&&hit(m,x,y))return 'INSIDE '+m.n;
    if(P&&x>P.x0+(P.ox||0)&&x<P.x1+(P.ox||0)&&y>P.y0+(P.oy||0)&&y<P.y1+(P.oy||0))return y>(P.y0+P.y1)/2+(P.oy||0)?'CENTRAL PARK':'SOUTH EAST CENTRAL PARK';
    if(y<RING.river.y1)return 'THE HUDSON'; if(y<BLOCK.back)return 'THE ALLEY AND THE HUDSON WALK'; if(x>RING.wx0-20&&x<RING.wx1&&y>SHARED.BOD.FAR)return 'WEST ST'; if(F&&(x<F.x0||x>F.x1||y<F.y0||y>F.y1))return 'OFF THE MAP'; return 'MARKET ST'; };
  const chStart=()=>{ const L=[]; { const [x,y]=wt(pos.x,pos.z); L.push({id:'c0',gid:'you',key:'you',n:'YOU (THE AVATAR)',ly:'you',sh:'circle',x,y,r:.45,rot:SHARED.heading*180/Math.PI,z:SHARED.py,lv:SHARED.LVL,beh:'YOU',speed:1,hp:1,home:'',job:'',scale:1,color:KCOL.you,tint:'#ffffff',opacity:1}); }
    (typeof NPCS!=='undefined'?NPCS:[]).forEach((N,i)=>{ if(!N||!N.st)return; const [x,y]=wt(N.st.x,N.st.z), j=N.rig&&N.rig.job, k=kindOf(N.key);
      L.push({id:'c'+(i+1),gid:'npc'+i,key:N.key,n:String(N.name||N.key).toUpperCase(),ly:k,sh:'circle',x,y,r:Math.max(.25,(N.st.R||.3)/T),rot:(N.st.h||0)*180/Math.PI,z:0,lv:N.lv||'up',beh:behOf(N),speed:+((N.st.v||0)/T).toFixed(3),hp:N.hp==null?1:N.hp,home:N.home?(typeof N.home==='string'?N.home:'x '+(+wt(N.home.x||0,N.home.z||0)[0]).toFixed(1)+', y '+(+wt(N.home.x||0,N.home.z||0)[1]).toFixed(1)+(N.home.r>0?', within '+(N.home.r/T).toFixed(0)+' tiles':', stays here')):'',job:j?String(j.k||j.name||j.id||'A JOB').toUpperCase():'',scale:1,color:KCOL[k],tint:'#ffffff',opacity:1}); });
    return L; };
  const npcOf=o=>{ if(o.gid==='you')return null; const i=/^npc(\d+)$/.exec(o.gid||''); return i&&typeof NPCS!=='undefined'?NPCS[+i[1]]:null; };
  let MODE='map', ITEMS=[], sel=null, UNDO=[], REDO=[]; const ST={map:{items:null,undo:[],redo:[],ex:null},chars:{items:null,undo:[],redo:[],ex:null}}, DRAFT={map:'maped-draft2',chars:'chared-draft'};
  const snap=()=>JSON.stringify(ITEMS), save=()=>{ try{ localStorage.setItem(DRAFT[MODE],snap()); }catch(e){} };
  const dirty=()=>{ const n=document.getElementById('meN'); if(n)n.textContent=ST[MODE].ex===snap()?'':'NOT EXPORTED YET'; };
  const push=()=>{ UNDO.push(snap()); if(UNDO.length>200)UNDO.shift(); REDO.length=0; };
  const mapStart=()=>{ let d=null; try{ d=JSON.parse(localStorage.getItem(DRAFT.map)||'null'); }catch(e){} return Array.isArray(d)&&d.length?d:base(); };
  const reuid=()=>{ uid=1+Math.max(0,...ITEMS.map(o=>+String(o.id).slice(1)||0)); };
  const setMode=(m,first)=>{ if(!first)ST[MODE]={items:ITEMS,undo:UNDO,redo:REDO,ex:ST[MODE].ex}; MODE=m; const S2=ST[m];
    if(!S2.items){ let d=null; try{ d=JSON.parse(localStorage.getItem(DRAFT[m])||'null'); }catch(e){} S2.items=Array.isArray(d)&&d.length?d:(m==='map'?base():chStart()); }
    ITEMS=S2.items; UNDO=S2.undo; REDO=S2.redo; sel=null; reuid(); lyHTML(); skin(R); panel(); draw(); };
  const restore=s=>{ const id=sel&&sel.id; ITEMS=JSON.parse(s); sel=ITEMS.find(o=>o.id===id)||null; reuid(); save(); panel(); draw(); };
  const undo=()=>{ if(!UNDO.length)return; REDO.push(snap()); restore(UNDO.pop()); }, redo=()=>{ if(!REDO.length)return; UNDO.push(snap()); restore(REDO.pop()); };

  const loc=(o,x,y)=>{ const a=-(o.rot||0)*Math.PI/180, dx=x-o.x, dy=y-o.y; return [dx*Math.cos(a)-dy*Math.sin(a),dx*Math.sin(a)+dy*Math.cos(a)]; };
  const wor=(o,lx,ly)=>{ const a=(o.rot||0)*Math.PI/180; return [o.x+lx*Math.cos(a)-ly*Math.sin(a),o.y+lx*Math.sin(a)+ly*Math.cos(a)]; };
  const sz=o=>o.sh==='circle'?[o.r*(o.scale||1),o.r*(o.scale||1)]:[o.w*(o.scale||1)/2,o.d*(o.scale||1)/2];
  const hit=(o,x,y)=>{ const [lx,ly]=loc(o,x,y), [hw,hd]=sz(o); return o.sh==='circle'?Math.hypot(lx,ly)<=hw:Math.abs(lx)<=hw&&Math.abs(ly)<=hd; };
  const handles=o=>{ const [hw,hd]=sz(o), k=14/V.k; return {rot:wor(o,0,hd+k*1.6),size:o.sh==='circle'?wor(o,hw,0):wor(o,hw,hd)}; };

  const R=document.createElement('div'); R.id='maped'; css(R,{position:'fixed',inset:'0',zIndex:'60',display:'none',background:'#07090d',font:'10px Silkscreen,monospace',color:'#c9ccd6'});
  R.innerHTML='<canvas id="meC" style="position:absolute;inset:0;width:100%;height:100%;cursor:grab;touch-action:none;image-rendering:pixelated"></canvas>'
    +'<div style="position:absolute;left:12px;top:12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:calc(100% - 360px)"><b style="font-size:12px;color:#ece5d3">GAME EDITOR</b><span style="width:10px"></span><button class="mb" id="meFit">WHOLE MAP</button><button class="mb" id="meIn">ZOOM +</button><button class="mb" id="meOut">ZOOM −</button><button class="mb" id="meU">↶ UNDO</button><button class="mb" id="meRd">REDO ↷</button>'
    +'<span style="color:#8a8f9c;width:100%">DRAG: LOOK AROUND · WHEEL: ZOOM · DOUBLE CLICK: PICK · DRAG THE PICKED THING: MOVE · ITS ○ HANDLE: TURN (SHIFT: 15°) · ITS □ HANDLE: SIZE · R: TURN 15° · CTRL+Z / CTRL+Y · DEL · CTRL+D: COPY</span></div>'
    +'<div id="meSide" style="position:absolute;right:12px;top:12px;bottom:12px;width:320px;max-width:calc(100vw - 24px);overflow:auto;padding:10px 12px;background:#0b0d13f2;border:2px solid #2a3040;box-sizing:border-box">'
    +'<b style="color:#ece5d3">SHOW</b><div id="meLy" style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin:6px 0 10px"></div>'
    +'<b style="color:#ece5d3">PICKED</b><div id="meSel" style="margin-top:6px;line-height:1.7;color:#8a8f9c"></div>'
    +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px"><button class="mb" id="meRA">START OVER (THE GAME AS IT IS)</button><button class="mb" id="meE" data-hot="1">EXPORT</button><button class="mb" id="meI">IMPORT</button><input id="meF" type="file" accept=".json,application/json" style="display:none"></div>'
    +'<div id="meN" style="margin-top:6px;color:#f2c14e;min-height:12px"></div>'
    +'<div style="margin-top:8px;color:#8a8f9c;line-height:1.6">EDITS CHANGE THIS MOCKUP ONLY, NEVER THE RUNNING GAME. THE MAP EDITOR EXPORTS world.json, THE GAME\'S OWN LEVEL FILE: PUT IT IN data/ AND THE GAME IS BUILT FROM IT. IMPORT LOADS IT BACK. THE DRAFT STAYS IN THIS BROWSER.</div></div>';
  document.body.appendChild(R); const q=s=>R.querySelector(s), cv=q('#meC'), g=cv.getContext('2d'); skin(R);
  const lyHTML=()=>{ q('#meLy').innerHTML=(MODE==='map'?LAYERS:LAYERS_CH).map(([k,n])=>'<label style="display:flex;gap:5px;align-items:center;cursor:pointer"><input type="checkbox" data-ly="'+k+'"'+(SHOW[k]?' checked':'')+'>'+n+'</label>').join(''); };
  q('#meLy').addEventListener('change',e=>{ const k=e.target.dataset.ly; if(!k)return; SHOW[k]=e.target.checked; try{ localStorage.setItem('maped-show',JSON.stringify(SHOW)); }catch(_){} if(TER&&['road','walk','alley','grass','water','wall','path'].includes(k))paint(); draw(); });

  let V={x:60,y:0,k:3}, drag=null;
  const size=()=>{ const r=cv.getBoundingClientRect(), d=Math.min(2,devicePixelRatio||1); cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); };
  const sx=x=>cv.width/2+(x-V.x)*V.k, sy=y=>cv.height/2-(y-V.y)*V.k, mx=px=>V.x+(px-cv.width/2)/V.k, my=py=>V.y-(py-cv.height/2)/V.k;
  const fit=()=>{ const side=Math.min(340,cv.width*.4); V.k=Math.min((cv.width-side)/(F.x1-F.x0+8),cv.height/(F.y1-F.y0+8)); V.x=(F.x0+F.x1)/2+side/2/V.k; V.y=(F.y0+F.y1)/2; };
  const ORDER=['path','filler','shell','shop','park','tree'];
  const onMap=o=>!F||(o.lv!=='down'&&o.x>F.x0-20&&o.x<F.x1+20&&o.y>F.y0-20&&o.y<F.y1+20);
  function draw(){ if(!MAPED.open||!TER)return; const dpr=Math.min(2,devicePixelRatio||1); g.setTransform(1,0,0,1,0,0); g.fillStyle='#07090d'; g.fillRect(0,0,cv.width,cv.height); g.imageSmoothingEnabled=false;
    g.drawImage(TER.cv,sx(F.x0),sy(F.y1),(F.x1-F.x0)*V.k,(F.y1-F.y0)*V.k);
    if(SHOW.grid){ g.strokeStyle='rgba(255,255,255,.07)'; g.lineWidth=1; const st=V.k<2?50:V.k<6?10:5; for(let x=Math.ceil(F.x0/st)*st;x<=F.x1;x+=st){ g.beginPath(); g.moveTo(sx(x),sy(F.y1)); g.lineTo(sx(x),sy(F.y0)); g.stroke(); } for(let y=Math.ceil(F.y0/st)*st;y<=F.y1;y+=st){ g.beginPath(); g.moveTo(sx(F.x0),sy(y)); g.lineTo(sx(F.x1),sy(y)); g.stroke(); } }
    const SM=MODS.sections, homeA=SECTIONS.home.id===SECTION.id;
    if(SM&&SM.secs.length){ for(const R of SM.rows){ const L=R.lot, c=R.col||[120,110,100]; g.fillStyle=`rgb(${c})`; g.fillRect(sx(L.x0),sy(L.y1),(L.x1-L.x0)*V.k,(L.y1-L.y0)*V.k); g.strokeStyle='rgba(0,0,0,.5)'; g.lineWidth=1; g.strokeRect(sx(L.x0)+.5,sy(L.y1)+.5,(L.x1-L.x0)*V.k-1,(L.y1-L.y0)*V.k-1); }
      for(const st of LOOP.STA||[]){ if(st.old)continue; const k=st.kiosk; g.fillStyle='#1e1e22'; g.fillRect(sx(k.x0),sy(k.y1),(k.x1-k.x0)*V.k,(k.y1-k.y0)*V.k); } }
    { const b=SECTIONS.home, d=Math.min((b.x1-b.x0),(b.y1-b.y0))*V.k; g.font=`bold ${Math.round(Math.min(160,d*.2))}px Silkscreen,monospace`; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='rgba(236,229,211,.12)'; g.fillText(b.id,sx((b.x0+b.x1)/2),sy((b.y0+b.y1)/2)); }
    g.strokeStyle='#46c8d2'; g.lineWidth=2; g.strokeRect(sx(F.x0),sy(F.y1),(F.x1-F.x0)*V.k,(F.y1-F.y0)*V.k);
    const chars=MODE==='chars', LIST=chars?(SHOW.mapthings?(ST.map.items||(ST.map.items=mapStart())):[]):ITEMS;
    for(const ly of ORDER){ if(!(chars?SHOW.mapthings:SHOW[ly]))continue; for(const o of LIST){ if(o.ly!==ly||(chars&&!SHOW[o.ly]&&o.ly!=='path'))continue; const on=!chars&&o===sel, [hw,hd]=sz(o); if(chars)g.globalAlpha=.3; g.save(); g.translate(sx(o.x),sy(o.y)); g.rotate(-(o.rot||0)*Math.PI/180); g.globalAlpha=Math.max(.15,o.opacity==null?1:o.opacity)*(chars?.3:1);
      g.fillStyle=on?'#f2c14e':o.color||'#888'; g.strokeStyle=on?'#fff6d0':'rgba(0,0,0,.5)'; g.lineWidth=on?2:1;
      if(o.sh==='circle'){ g.beginPath(); g.arc(0,0,hw*V.k,0,7); g.fill(); if(o.ly!=='tree'||on)g.stroke(); } else { g.fillRect(-hw*V.k,-hd*V.k,2*hw*V.k,2*hd*V.k); if(o.ly!=='path'||on)g.strokeRect(-hw*V.k+.5,-hd*V.k+.5,2*hw*V.k-1,2*hd*V.k-1); } g.restore(); } }
    g.globalAlpha=1; if(chars)for(const o of ITEMS){ if(!SHOW[o.ly]||!onMap(o))continue; const on=o===sel, rr=Math.max(3*dpr,(o.r||.4)*(o.scale||1)*V.k), a=(o.rot||0)*Math.PI/180; g.globalAlpha=Math.max(.2,o.opacity==null?1:o.opacity);
      g.fillStyle=on?'#f2c14e':o.color||'#e0e0e0'; g.strokeStyle=on?'#fff6d0':'#000'; g.lineWidth=on?2:1; g.beginPath(); g.arc(sx(o.x),sy(o.y),rr,0,7); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(sx(o.x),sy(o.y)); g.lineTo(sx(o.x)-Math.sin(a)*rr*1.6,sy(o.y)-Math.cos(a)*rr*1.6); g.stroke(); g.globalAlpha=1; }
    if(!chars&&SHOW.shop)for(const o of ITEMS){ if(!bld(o)||!onMap(o))continue; const [hw,hd]=sz(o), a=wor(o,-hw*.9,hd), b=wor(o,hw*.9,hd), m=wor(o,0,hd), t=wor(o,0,hd+Math.min(3,hd*.6)), L2=wor(o,-Math.min(1.6,hw*.4),hd), R2=wor(o,Math.min(1.6,hw*.4),hd);
      g.lineWidth=Math.max(3,4*dpr); g.strokeStyle='#ff5a3c'; g.beginPath(); g.moveTo(sx(a[0]),sy(a[1])); g.lineTo(sx(b[0]),sy(b[1])); g.stroke(); g.fillStyle='#ff5a3c'; g.beginPath(); g.moveTo(sx(L2[0]),sy(L2[1])); g.lineTo(sx(t[0]),sy(t[1])); g.lineTo(sx(R2[0]),sy(R2[1])); g.fill(); }
    if(sel&&SHOW[sel.ly]&&onMap(sel)){ const H=handles(sel), [ax,ay]=wor(sel,0,sz(sel)[1]); g.lineWidth=2; g.strokeStyle='#fff6d0'; g.fillStyle='#0b0d13'; g.beginPath(); g.moveTo(sx(ax),sy(ay)); g.lineTo(sx(H.rot[0]),sy(H.rot[1])); g.stroke();
      g.beginPath(); g.arc(sx(H.rot[0]),sy(H.rot[1]),6*dpr,0,7); g.fill(); g.stroke(); g.fillRect(sx(H.size[0])-5*dpr,sy(H.size[1])-5*dpr,10*dpr,10*dpr); g.strokeRect(sx(H.size[0])-5*dpr,sy(H.size[1])-5*dpr,10*dpr,10*dpr); }
    if(SHOW.label){ g.font=Math.round(9*dpr)+'px Silkscreen,monospace'; g.textAlign='center'; g.textBaseline='middle';
      for(const o of ITEMS){ if(!SHOW[o.ly]||o.ly==='filler'||o.ly==='tree'||(o.ly==='path'&&o!==sel)||(o.ly==='shell'&&V.k<3)||(chars&&(!onMap(o)||(V.k<4&&o!==sel))))continue; const t=o.n.replace(/ \(.*\)/,''); g.fillStyle='rgba(0,0,0,.6)'; const w=g.measureText(t).width; g.fillRect(sx(o.x)-w/2-2,sy(o.y)-7*dpr,w+4,14*dpr); g.fillStyle=o===sel?'#f2c14e':'#ece5d3'; g.fillText(t,sx(o.x),sy(o.y)); }
      g.fillStyle='rgba(236,229,211,.5)'; const LB=homeA?[['MARKET ST',60,(SHARED.BOD.CURB+SHARED.BOD.FAR)/2],['WEST ST',(RING.wr0+RING.wr1)/2,90],['CENTRAL PARK',(PARK.x0+PARK.x1)/2+(PARK.ox||0),165],['THE HUDSON',60,(RING.river.y0+RING.river.y1)/2]]:[];
      if(!homeA&&SM){ const ST=SECTIONS.streets, rd=SM.road, inn=SM.inner, b=SECTIONS.home, cx=(b.x0+b.x1)/2, cy=(b.y0+b.y1)/2; LB.push([b.row===0?ST.south:ST.north,cx,b.row===0?(rd.y0+inn.y0)/2:(rd.y1+inn.y1)/2]); if(b.col===0)LB.push([ST.west,(rd.x0+inn.x0)/2,cy]); if(b.col===SECTIONS.grid.cols-1)LB.push([ST.east,(rd.x1+inn.x1)/2,cy]);
        for(const st of LOOP.STA||[])if(!st.old)LB.push([st.id+'1 '+st.name,(st.kiosk.x0+st.kiosk.x1)/2,st.side==='south'?st.kiosk.y0-2.5:st.kiosk.y1+2.5]); }
      for(const [t,x,y] of LB)g.fillText(t,sx(x),sy(y)); } }

  const f2=v=>(+v||0).toFixed(2), KINDS={shop:'BUILDING',filler:'GARAGE OR LOT',park:'PARK PLACE',tree:'TREE',path:'PATH'};
  const fld=(lab,k,v,step=.25,type='number')=>'<label style="display:flex;justify-content:space-between;align-items:center;gap:6px">'+lab+(type==='number'?'<input data-f="'+k+'" type="number" step="'+step+'" value="'+f2(v)+'"':'<input data-f="'+k+'" type="'+type+'" value="'+String(v).replace(/"/g,'&quot;')+'"')+' style="width:'+(type==='color'?'60px':'110px')+';font:10px monospace;background:#000;color:#f2c14e;border:1px solid #3a3f4e;padding:2px 4px"></label>';
  const texSel=(k,v)=>'<label style="display:flex;justify-content:space-between;align-items:center;gap:6px">TEXTURE<select data-f="'+k+'" style="width:170px;font:10px monospace;background:#000;color:#f2c14e;border:1px solid #3a3f4e">'+[...new Set([v,...TEX])].map(t=>'<option'+(t===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label>';
  const fields=(o,view)=>(view?fld('TURN (°)','rot',o.rot||0,1)+fld('Z (UP)','z',o.z||0):fld('X (EAST)','x',o.x)+fld('Y (NORTH)','y',o.y)+fld('Z (UP)','z',o.z||0)+fld('TURN (°)','rot',o.rot||0,1))
      +(o.sh==='circle'?fld('RADIUS','r',o.r,.25):fld('WIDTH','w',o.w)+fld('DEPTH','d',o.d))+fld('HEIGHT (PX)','h',o.h||0,1)+fld('SCALE','scale',o.scale||1,.05)
      +texSel('tex',o.tex||TEX[0])+fld('COLOR','color',o.color||'#888888',0,'color')+fld('TINT','tint',o.tint||'#ffffff',0,'color')+fld('OPACITY','opacity',o.opacity==null?1:o.opacity,.05);
  const sel2=(k,v,list)=>'<label style="display:flex;justify-content:space-between;align-items:center;gap:6px">'+k.toUpperCase().replace('BEH','BEHAVIOR').replace('LY','KIND').replace('LV','LEVEL')+'<select data-f="'+k+'" style="width:150px;font:10px monospace;background:#000;color:#f2c14e;border:1px solid #3a3f4e">'+[...new Set([v,...list])].map(t=>'<option'+(t===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label>';
  const chFields=(o,view)=>(view?'':fld('X (EAST)','x',o.x)+fld('Y (NORTH)','y',o.y)+fld('Z (UP)','z',o.z||0))+fld('FACING (°)','rot',o.rot||0,1)+sel2('lv',o.lv||'up',['up','down'])
      +'<div>LOCATION: <span style="color:#c9ccd6">'+place(o)+'</span></div>'+sel2('ly',o.ly,Object.keys(KCOL).filter(k=>k!=='you'||o.ly==='you'))+sel2('beh',o.beh||'STAND',BEH)
      +fld('SPEED','speed',o.speed||0,.05)+fld('HEALTH','hp',o.hp==null?1:o.hp,.1)+fld('HOME','home',o.home||'',0,'text')+fld('JOB','job',o.job||'',0,'text')
      +fld('SIZE (RADIUS)','r',o.r,.05)+fld('SCALE','scale',o.scale||1,.05)+fld('COLOR (ON THE MAP)','color',o.color||'#e0e0e0',0,'color')+fld('TINT','tint',o.tint||'#ffffff',0,'color')+fld('OPACITY','opacity',o.opacity==null?1:o.opacity,.05);
  const offList=()=>{ const L=ITEMS.filter(o=>!onMap(o)); return L.length?'<div style="margin-top:10px;color:#ece5d3">NOT ON THE MAP ('+L.length+')</div><div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:4px">'+L.map(o=>'<button class="mb" data-pick="'+o.id+'">'+o.n+'</button>').join('')+'</div>':''; };
  const panel=()=>{ const el=q('#meSel'); dirty(); if(MODE==='chars'&&!sel){ el.innerHTML='DOUBLE CLICK A CHARACTER ON THE MAP.'+offList(); skin(el); return; } if(!sel){ el.innerHTML='DOUBLE CLICK A THING ON THE MAP.'; return; } const o=sel;
    if(MODE==='chars'){ el.innerHTML='<div style="color:#f2c14e;font-size:11px">'+o.n+'</div><div>WHO: '+(o.key||'')+(o.gid?'':' · ADDED HERE')+'</div>'+fld('NAME','n',o.n,0,'text')+chFields(o)
      +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">'+[['◀',-1,0],['▲',0,1],['▼',0,-1],['▶',1,0]].map(([t,a,b])=>'<button class="mb" data-n="'+a+','+b+'">'+t+'</button>').join('')+'<button class="mb" data-t="-15">⟲ 15°</button><button class="mb" data-t="15">15° ⟳</button></div>'
      +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px"><button class="mb" id="meV" data-hot="1">VIEW 360</button><button class="mb" id="meCp">COPY</button><button class="mb" id="meDl">DELETE</button></div>'+offList(); skin(el); return; }
    el.innerHTML='<div style="color:#f2c14e;font-size:11px">'+o.n+'</div><div>KIND: '+(KINDS[o.ly]||o.ly)+(o.gid?'':' · ADDED HERE')+'</div>'+fld('NAME','n',o.n,0,'text')+fields(o)
      +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">'+[['◀',-1,0],['▲',0,1],['▼',0,-1],['▶',1,0]].map(([t,a,b])=>'<button class="mb" data-n="'+a+','+b+'">'+t+'</button>').join('')+'<button class="mb" data-t="-15">⟲ 15°</button><button class="mb" data-t="15">15° ⟳</button></div>'
      +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px"><button class="mb" id="meV" data-hot="1">VIEW 360</button><button class="mb" id="meCp">COPY</button><button class="mb" id="meDl">DELETE</button></div>';
    skin(el); };
  const NUM=['x','y','z','rot','r','w','d','h','scale','opacity','speed','hp'];
  const setF=(o,f,raw)=>{ if(NUM.includes(f)){ let v=+raw; if(!isFinite(v))return false; if(['r','w','d'].includes(f))v=Math.max(.25,v); if(f==='scale')v=Math.max(.05,v); if(f==='opacity')v=Math.max(0,Math.min(1,v)); if(f==='rot'){ if(bld(o)&&!turns(o))return false; if(bld(o))v=Math.round(v/90)*90; v=((v%360)+540)%360-180; } if(f==='speed'||f==='hp')v=Math.max(0,v); o[f]=v; }
    else if(f==='ly'){ o.ly=String(raw); if(MODE==='chars'&&KCOL[o.ly]&&o.color===KCOL[o.key===undefined?'toon':kindOf(o.key)])o.color=KCOL[o.ly]; }
    else o[f]=f==='n'?String(raw).slice(0,60).toUpperCase():String(raw).slice(0,80); return true; };
  q('#meSel').addEventListener('change',e=>{ const f=e.target.dataset.f; if(!f||!sel)return; push(); if(setF(sel,f,e.target.value)){ save(); panel(); draw(); } });
  const nudge=(dx,dy)=>{ if(!sel)return; push(); sel.x=Math.round((sel.x+dx)*4)/4; sel.y=Math.round((sel.y+dy)*4)/4; save(); panel(); draw(); };
  const turn=a=>{ if(!sel||bld(sel)&&!turns(sel))return; if(bld(sel))a=Math.sign(a)*90; push(); sel.rot=((((sel.rot||0)+a)%360)+540)%360-180; save(); panel(); draw(); };
  const copy=()=>{ if(!sel)return; push(); const c=JSON.parse(JSON.stringify(sel)); c.id=nid(); c.gid=null; c.x+=2; c.y-=2; ITEMS.push(c); sel=c; save(); panel(); draw(); };
  const del=()=>{ if(!sel)return; push(); ITEMS=ITEMS.filter(o=>o!==sel); sel=null; save(); panel(); draw(); };
  q('#meSel').addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b)return; const st=e.shiftKey?1:.25;
    if(b.dataset.n){ const [a,c]=b.dataset.n.split(',').map(Number); nudge(a*st,c*st); } else if(b.dataset.t)turn(+b.dataset.t*(e.shiftKey?1/15:1)); else if(b.id==='meCp')copy(); else if(b.id==='meDl')del(); else if(b.id==='meV')view(sel); else if(b.dataset.pick){ sel=ITEMS.find(o=>o.id===b.dataset.pick)||null; panel(); draw(); } });

  const chView=o=>{ const side=document.createElement('div'), N=npcOf(o), body=o.gid==='you'?W3.group:N&&N.g;
    side.innerHTML='<div style="color:#f2c14e;font-size:11px;margin-bottom:6px">'+o.n+'</div>'+chFields(o,true)+'<div style="color:#8a8f9c;margin-top:8px;line-height:1.6">'+(body?'ITS OWN BODY, LENT TO THE VOID FOR THIS VIEW. ':'ADDED HERE: A STAND-IN. ')+'SCALE, TINT AND OPACITY SHOW HERE; EVERYTHING GOES INTO THE CHARACTERS FILE.</div><div style="margin-top:8px"><button class="mb" id="vwX" data-hot="1">BACK TO THE MAP</button></div>';
    side.addEventListener('input',e=>{ const f=e.target.dataset.f; if(!f)return; if(setF(o,f,e.target.value)){ save(); VIEW.redo(); } });
    side.addEventListener('focusin',e=>{ if(e.target.dataset&&e.target.dataset.f)push(); });
    side.addEventListener('click',e=>{ if(e.target.id==='vwX')VIEW.close(); });
    VIEW.onclose=()=>{ panel(); draw(); };
    VIEW.open({name:o.n,lend:body?()=>[body]:null,lendScale:()=>o.scale||1,opacity:()=>o.opacity,model:body?null:()=>{ const G=new THREE.Group(), m=new THREE.Mesh(new THREE.CapsuleGeometry(o.r*(o.scale||1),o.r*3*(o.scale||1),4,12),new THREE.MeshLambertMaterial({color:o.color})); m.position.y=o.r*2.5*(o.scale||1); G.add(m); return G; },look:()=>({tint:o.tint})},side); };
  const view=o=>{ if(!o)return; if(MODE==='chars')return chView(o); const side=document.createElement('div');
    side.innerHTML='<div style="color:#f2c14e;font-size:11px;margin-bottom:6px">'+o.n+'</div>'+fields(o,true)+'<div style="color:#8a8f9c;margin-top:8px;line-height:1.6">A MOCKUP MODEL OF THIS THING FROM ITS NUMBERS: EVERY CHANGE HERE SHOWS AT ONCE AND GOES INTO THE MAP FILE. TINT IS LAID OVER THE WHOLE VIEW.</div><div style="margin-top:8px"><button class="mb" id="vwX" data-hot="1">BACK TO THE MAP</button></div>';
    side.addEventListener('input',e=>{ const f=e.target.dataset.f; if(!f)return; if(setF(o,f,e.target.value)){ save(); VIEW.redo(); } });
    side.addEventListener('focusin',e=>{ if(e.target.dataset&&e.target.dataset.f)push(); });
    side.addEventListener('click',e=>{ if(e.target.id==='vwX')VIEW.close(); });
    VIEW.onclose=()=>{ panel(); draw(); };
    VIEW.open({name:o.n,model:()=>mockup(o),look:()=>({tint:o.tint})},side); };

  const pt=e=>{ const r=cv.getBoundingClientRect(), d=cv.width/r.width; return [(e.clientX-r.left)*d,(e.clientY-r.top)*d]; };
  cv.addEventListener('pointerdown',e=>{ if(e.button!==0&&e.button!==1)return; const [px,py]=pt(e), x=mx(px), y=my(py), dpr=Math.min(2,devicePixelRatio||1); cv.setPointerCapture(e.pointerId); drag=null;
    if(sel&&e.button===0&&SHOW[sel.ly]){ const H=handles(sel), near=p=>Math.hypot(sx(p[0])-px,sy(p[1])-py)<10*dpr;
      if(near(H.rot))drag={t:'rot'}; else if(near(H.size))drag={t:'size'}; else if(hit(sel,x,y)||(MODE==='chars'&&Math.hypot(sx(sel.x)-px,sy(sel.y)-py)<10*dpr))drag={t:'move',x,y,ox:sel.x,oy:sel.y}; if(drag)push(); }
    if(!drag)drag={t:'pan',px,py,vx:V.x,vy:V.y}; cv.style.cursor=drag.t==='pan'?'grabbing':drag.t==='move'?'move':'crosshair'; });
  cv.addEventListener('pointermove',e=>{ if(!drag)return; const [px,py]=pt(e), x=mx(px), y=my(py);
    if(drag.t==='pan'){ V.x=drag.vx-(px-drag.px)/V.k; V.y=drag.vy+(py-drag.py)/V.k; draw(); return; }
    if(drag.t==='move'){ sel.x=Math.round((drag.ox+x-drag.x)*4)/4; sel.y=Math.round((drag.oy+y-drag.y)*4)/4; }
    else if(drag.t==='rot'){ if(bld(sel)&&!turns(sel))return; let a=Math.atan2(y-sel.y,x-sel.x)*180/Math.PI-90; a=bld(sel)?Math.round(a/90)*90:e.shiftKey?Math.round(a/15)*15:Math.round(a); sel.rot=((a%360)+540)%360-180; }
    else { const [lx,ly]=loc(sel,x,y), s=sel.scale||1; if(sel.sh==='circle')sel.r=Math.max(.25,Math.round(Math.hypot(lx,ly)/s*4)/4); else { sel.w=Math.max(.25,Math.round(2*Math.abs(lx)/s*4)/4); sel.d=Math.max(.25,Math.round(2*Math.abs(ly)/s*4)/4); } }
    panel(); draw(); });
  const end=()=>{ if(drag&&drag.t!=='pan')save(); drag=null; cv.style.cursor='grab'; };
  cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
  cv.addEventListener('dblclick',e=>{ const [px,py]=pt(e), x=mx(px), y=my(py); let best=null, ba=1e18;
    if(MODE==='chars'){ for(const o of ITEMS){ if(!SHOW[o.ly]||!onMap(o))continue; const dd=Math.hypot(sx(o.x)-px,sy(o.y)-py); if(dd<Math.max(10,(o.r||.4)*(o.scale||1)*V.k+4)&&dd<ba){ ba=dd; best=o; } } }
    else for(const o of ITEMS){ if(!SHOW[o.ly]||!hit(o,x,y))continue; const [hw,hd]=sz(o), a=hw*hd; if(a<ba){ ba=a; best=o; } }
    sel=best; panel(); draw(); });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const [px,py]=pt(e), x=mx(px), y=my(py); V.k=Math.max(.5,Math.min(60,V.k*Math.pow(1.0015,-e.deltaY))); V.x=x-(px-cv.width/2)/V.k; V.y=y+(py-cv.height/2)/V.k; draw(); },{passive:false});
  const zoom=f=>{ V.k=Math.max(.5,Math.min(60,V.k*f)); draw(); };
  q('#meFit').onclick=()=>{ fit(); draw(); }; q('#meIn').onclick=()=>zoom(1.4); q('#meOut').onclick=()=>zoom(1/1.4); q('#meU').onclick=undo; q('#meRd').onclick=redo;
  q('#meRA').onclick=()=>{ push(); uid=1; ITEMS=MODE==='map'?base():chStart(); sel=null; save(); panel(); draw(); q('#meN').textContent='BACK TO THE GAME AS IT IS (UNDO TO GO BACK)'; };
  const stamp=()=>new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  const download=(name,obj)=>{ const b=new Blob([JSON.stringify(obj,null,1)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); };
  Object.assign(MAPED,{download,stamp,skin,css,fld,texSel,TEX});
  const worldOf=()=>{ const W=JSON.parse(JSON.stringify(LEVEL)), by={}; for(const o of ITEMS)if(o.gid)by[o.gid]=o; const r2=v=>Math.round(v*100)/100, ext=o=>{ const [hw,hd]=sz(o); return {x0:r2(o.x-hw),x1:r2(o.x+hw),y0:r2(o.y-hd),y1:r2(o.y+hd)}; };
    const extB=o=>{ const f=faceOf(o.rot), [hw,hd]=sz(o), sw=f==='e'||f==='w'; return {x0:r2(o.x-(sw?hd:hw)),x1:r2(o.x+(sw?hd:hw)),y0:r2(o.y-(sw?hw:hd)),y1:r2(o.y+(sw?hw:hd)),f}; };
    W.places=W.places.filter(p=>by[p.id]).map(p=>{ const o=by[p.id], e=bld(o)?extB(o):ext(o), q={...p,name:o.n,x0:e.x0,x1:e.x1}; if(p.y1!=null){ q.y0=e.y0; q.y1=e.y1; if(bld(o))q.face=e.f; } return q; });
    W.shells=W.shells.filter(q=>by[q.id]).map(q=>({...q,...ext(by[q.id])}));
    for(const k of ['round','lake','cave','tower','skatepark'])if(by[k]&&W.parkPlaces[k]){ const o=by[k]; W.parkPlaces[k]={...W.parkPlaces[k],x:r2(o.x),y:r2(o.y),...(W.parkPlaces[k].r!=null?{r:r2(o.r*(o.scale||1))}:{})}; }
    if(by.castle){ const e=ext(by.castle); W.parkPlaces.castle={x0:e.x0,y0:e.y0}; }
    W.paths=W.paths.filter(q=>by[q.id]).map(q=>{ const o=by[q.id], h=o.w*(o.scale||1)/2, a=(o.rot||0)*Math.PI/180; return {id:q.id,a:[r2(o.x-Math.cos(a)*h),r2(o.y-Math.sin(a)*h)],b:[r2(o.x+Math.cos(a)*h),r2(o.y+Math.sin(a)*h)]}; });
    W.homes={...(LEVEL.homes||{})}; for(const N of NPCS){ const h=N.home; if(!h||!h.id||!(h.r>0))continue; const [x,y]=wt(h.x,h.z); W.homes[h.id]=[r2(x),r2(y),r2(h.r/T)]; }
    W.editor={note:'the editor\'s own extras (added things, trees, looks); the game does not read these yet',items:ITEMS.filter(o=>!o.gid||o.ly==='tree'||o.ly==='filler'||o.tint!=='#ffffff'||o.opacity!==1||o.tex)}; return W; };
  const fromWorld=j=>{ const L=base(), keep=new Set([...j.places.map(p=>p.id),...(j.shells||[]).map(q=>q.id),...(j.paths||[]).map(q=>q.id),'round','lake','cave','tower','skatepark','castle']), known=new Set([...LEVEL.places.map(p=>p.id),...LEVEL.shells.map(q=>q.id),...LEVEL.paths.map(q=>q.id)]);
    const out=L.filter(o=>!o.gid||!known.has(o.gid)||keep.has(o.gid)), by={}; for(const o of out)if(o.gid)by[o.gid]=o;
    const box=(o,e)=>{ if(!o||!e)return; if(e.x0!=null&&e.x1!=null){ o.x=(e.x0+e.x1)/2; o.w=e.x1-e.x0; } if(e.y0!=null&&e.y1!=null){ o.y=(e.y0+e.y1)/2; o.d=e.y1-e.y0; } };
    for(const p of j.places){ const o=by[p.id]; if(!o)continue; if(p.y1==null||!bld(o)){ box(o,{x0:p.x0,x1:p.x1}); continue; } const f=p.face||'n', sw=f==='e'||f==='w'; o.rot=FACEROT[f]; o.x=(p.x0+p.x1)/2; o.y=(p.y0+p.y1)/2; o.w=sw?p.y1-p.y0:p.x1-p.x0; o.d=sw?p.x1-p.x0:p.y1-p.y0; } for(const q of j.shells||[])box(by[q.id],q);
    for(const k of ['round','lake','cave','tower','skatepark']){ const e=j.parkPlaces&&j.parkPlaces[k], o=by[k]; if(e&&o){ o.x=+e.x; o.y=+e.y; if(e.r!=null&&o.sh==='circle')o.r=+e.r; } }
    if(j.parkPlaces&&j.parkPlaces.castle&&by.castle){ const c=by.castle; c.x=j.parkPlaces.castle.x0+c.w/2; c.y=j.parkPlaces.castle.y0+c.d/2; }
    for(const q of j.paths||[]){ const o=by[q.id]; if(!o)continue; o.x=(q.a[0]+q.b[0])/2; o.y=(q.a[1]+q.b[1])/2; o.w=Math.hypot(q.b[0]-q.a[0],q.b[1]-q.a[1]); o.rot=Math.atan2(q.b[1]-q.a[1],q.b[0]-q.a[0])*180/Math.PI; }
    for(const e of (j.editor&&j.editor.items)||[]){ if(e.gid&&by[e.gid])Object.assign(by[e.gid],{tint:e.tint,opacity:e.opacity,tex:e.tex,color:e.color,scale:e.scale,h:e.h,z:e.z}); else if(!e.gid)out.push({...e,id:nid()}); }
    return out; };
  q('#meE').onclick=()=>{ if(MODE==='map'){ const n='world.json'; download(n,worldOf()); ST[MODE].ex=snap(); q('#meN').textContent='EXPORTED world.json: THE GAME\'S LEVEL FILE'; return; } const ch=MODE==='chars', n=(ch?'market-characters-':'market-map-')+stamp()+'.json'; download(n,{map:'THE MARKET',kind:ch?'characters':'map',v:2,at:new Date().toISOString(),units:'map tiles: x east, y north, z up; rot degrees anticlockwise'+(ch?'; speed in tiles a second':'; h in the game\'s px'),items:ch?ITEMS.map(o=>({...o,location:place(o)})):ITEMS}); ST[MODE].ex=snap(); q('#meN').textContent='EXPORTED '+n; };
  q('#meI').onclick=()=>q('#meF').click();
  const hexok=(c,d)=>/^#[0-9a-f]{6}$/i.test(c)?c:d;
  q('#meF').onchange=async e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(!f)return; try{ const j=JSON.parse(await f.text()); if(MODE==='map'&&j&&Array.isArray(j.places)){ push(); ITEMS=fromWorld(j); sel=null; reuid(); ST[MODE].ex=snap(); save(); panel(); draw(); q('#meN').textContent='IMPORTED '+f.name+' (A LEVEL FILE)'; return; } if(!j||!Array.isArray(j.items))throw 0; const ch=MODE==='chars'; if((j.kind||'map')!==(ch?'characters':'map')){ q('#meN').textContent=(ch?'THAT IS A MAP FILE: IMPORT IT IN THE MAP EDITOR':'THAT IS A CHARACTERS FILE: IMPORT IT IN THE CHARACTER EDITOR'); return; }
      const ok=j.items.filter(o=>o&&isFinite(+o.x)&&isFinite(+o.y)&&(o.sh==='circle'?isFinite(+o.r):isFinite(+o.w)&&isFinite(+o.d))).map(o=>({id:String(o.id||nid()),gid:o.gid||null,n:String(o.n||'THING').slice(0,60),ly:(ch?KCOL:LCOL)[o.ly]?o.ly:(ch?'toon':'park'),...(ch?{key:String(o.key||'').slice(0,40),lv:o.lv==='down'?'down':'up',beh:BEH.includes(o.beh)||o.beh==='YOU'?o.beh:'STAND',speed:Math.max(0,+o.speed||0),hp:Math.max(0,+o.hp||0),home:String(o.home||'').slice(0,80),job:String(o.job||'').slice(0,80)}:{}),sh:o.sh==='circle'?'circle':'rect',x:+o.x,y:+o.y,w:+o.w||0,d:+o.d||0,r:+o.r||0,rot:+o.rot||0,z:+o.z||0,h:+o.h||0,scale:+o.scale||1,tex:String(o.tex||'').slice(0,80),color:hexok(o.color,'#888888'),tint:hexok(o.tint,'#ffffff'),opacity:o.opacity==null?1:Math.max(0,Math.min(1,+o.opacity||0))}));
      push(); ITEMS=ok; sel=null; reuid(); ST[MODE].ex=snap(); save(); panel(); draw(); q('#meN').textContent='IMPORTED '+f.name+' ('+ok.length+' THINGS)'; }catch(err){ q('#meN').textContent='NOT AN EDITOR FILE: '+f.name; } };
  addEventListener('keydown',e=>{ if(!MAPED.open)return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return; e.stopImmediatePropagation(); const k=e.key.toLowerCase();
    if(VIEW.on){ if(k==='escape'){ e.preventDefault(); VIEW.close(); } return; }
    if(k==='escape'){ e.preventDefault(); GAMEED.toggle(); return; }
    if((e.ctrlKey||e.metaKey)&&k==='z'){ e.preventDefault(); e.shiftKey?redo():undo(); return; } if((e.ctrlKey||e.metaKey)&&k==='y'){ e.preventDefault(); redo(); return; }
    if((e.ctrlKey||e.metaKey)&&k==='d'){ e.preventDefault(); copy(); return; } if(k==='delete'||k==='backspace'){ e.preventDefault(); del(); return; }
    if(k==='r'){ e.preventDefault(); turn(e.shiftKey?-15:15); return; }
    const d={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,1],arrowdown:[0,-1]}[k]; if(d){ e.preventDefault(); nudge(d[0]*(e.shiftKey?1:.25),d[1]*(e.shiftKey?1:.25)); } },true);
  addEventListener('keyup',e=>{ if(MAPED.open&&!(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)))e.stopImmediatePropagation(); },true);
  addEventListener('resize',()=>{ if(MAPED.open){ size(); draw(); } });
  GAMEED.show=on=>{ MAPED.on=MAPED.open=GAMEED.open=on; R.style.display=on?'block':'none'; if(!on){ if(VIEW.on)VIEW.close(); return; } if(keys.clear)keys.clear();
    size(); if(!TER)terrain(); if(!GAMEED.inited){ GAMEED.inited=true; setMode(MODE,true); } fit(); panel(); draw(); };
  window.MAPED=MAPED; };
GAMEED.ensure=async()=>{ if(GAMEED.built)return; await LOAD('editor'); GAMEED.build(); GAMEED.built=true; };
GAMEED.toggle=async()=>{ if(GAMEED.busy)return; if(GAMEED.built){ GAMEED.show(!GAMEED.open); return; } GAMEED.busy=true;
  await FADE.run('LOADING GAME EDITOR',async()=>{ await GAMEED.ensure(); },{cut:true}); if(GAMEED.built)GAMEED.show(true); GAMEED.busy=false; };
MAPED.toggle=()=>GAMEED.toggle(); window.GAMEED=GAMEED;
