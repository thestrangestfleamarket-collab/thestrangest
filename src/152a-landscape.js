// THE LANDSCAPE EDITOR: paint ground (box, border, free brush), place plants & rocks from a dropdown, erase; shift+9, edit while you walk.
import {SHARED, THREE} from './003-shx.js';
import {B64, F32} from './003a-skin.js';
import {LAND, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {LAWNP, lawnPaint} from './014-gamekit.js';
import {FOREST, PROPS} from './039-bodega.js';
{ const T=TILE;
  const TYPES=[['grass','GRASS','#4a7a3a'],['grass2','DRY GRASS','#6f863a'],['grass3','LUSH GRASS','#2f6b2c'],['grass4','PALE GRASS','#8fa05a'],['sidewalk','SIDEWALK','#9a968e'],['cobble','COBBLE','#6b6b70'],['dirt','DIRT','#6b4f33'],['gravel','GRAVEL','#7a766f'],['slab','STONE SLAB','#8a857a'],['sand','SAND','#c9b885']];
  const rnd=(s)=>{ let x=Math.sin(s)*43758.5453; return x-Math.floor(x); };
  const texCache={};
  function tex(t){ '@later'; if(texCache[t])return texCache[t]; const N=64, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d');
    const base=(TYPES.find(a=>a[0]===t)||['','','#4a7a3a'])[2]; g.fillStyle=base; g.fillRect(0,0,N,N);
    const dot=(x,y,r,c)=>{ g.fillStyle=c; g.fillRect(x-r,y-r,r*2,r*2); };
    if(t==='grass'||t==='grass2'||t==='grass3'||t==='grass4'){ const P=LAWNP.pal, K=4, M=N*2, tint=t==='grass2'?[1.05,.92,.6]:t==='grass3'?[.72,.86,.72]:t==='grass4'?[1.2,1.1,.85]:[1,1,1], tc=c=>c.map((v,i)=>Math.min(255,v*tint[i])); cv.width=cv.height=M;
      lawnPaint(g,M,K,{bed:tc(P.bed),greens:P.greens.map(tc),dark:tc(P.dark),earth:t==='grass2'?P.earth:null,flower:t==='grass3'||t==='grass'?P.flower:null});
      const tx=new THREE.CanvasTexture(cv); tx.magFilter=THREE.LinearFilter; tx.minFilter=THREE.LinearMipmapLinearFilter; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(1/K,1/K); tx.colorSpace=THREE.SRGBColorSpace; texCache[t]=tx; return tx; }
    else if(t==='sidewalk'){ const cell=20; for(let p=0;p<=N;p+=cell){ g.fillStyle='rgba(60,58,54,.55)'; g.fillRect(p,0,1,N); } for(let i=0;i<180;i++){ const x=rnd(i*1.9)*N,y=rnd(i*2.4+4)*N; dot(x,y,1,rnd(i*3.7)<.5?'#8d8980':'#a7a39a'); } }
    else if(t==='cobble'||t==='slab'){ const cell=t==='cobble'?12:16; for(let cy=0;cy<N;cy+=cell)for(let cx=0;cx<N;cx+=cell){ const off=t==='cobble'?(rnd(cx*cy+1)-.5)*3:0, s=rnd(cx+cy*7); g.fillStyle=t==='cobble'?(s<.33?'#5f5f64':s<.66?'#74747a':'#656569'):(s<.5?'#8f8a7f':'#827d72'); g.fillRect(cx+1+off,cy+1+off,cell-2,cell-2); } g.fillStyle='rgba(30,30,34,.5)'; for(let p=0;p<=N;p+=cell){ g.fillRect(p,0,1,N); g.fillRect(0,p,N,1); } }
    else if(t==='dirt'){ for(let i=0;i<300;i++){ const x=rnd(i*1.7)*N,y=rnd(i*3.1+2)*N,v=rnd(i*4.3); dot(x,y,1,v<.5?'#5a4028':'#7a5c3c'); } }
    else if(t==='gravel'){ for(let i=0;i<220;i++){ const x=rnd(i*2.1)*N,y=rnd(i*1.9+5)*N,v=rnd(i*6.7); dot(x,y,rnd(i)>.6?2:1,v<.4?'#5e5a54':v<.75?'#8a867e':'#9c988f'); } }
    else if(t==='sand'){ for(let i=0;i<240;i++){ const x=rnd(i*1.1)*N,y=rnd(i*2.3+1)*N; dot(x,y,1,rnd(i*3.3)<.5?'#bcaf78':'#d6c898'); } }
    const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.colorSpace=THREE.SRGBColorSpace; texCache[t]=tx; return tx; }
  const mat=t=>{ const m=new THREE.MeshToonMaterial({map:tex(t),side:THREE.DoubleSide}); if(W3.GP)m.gradientMap=W3.GP; return m; };
  const _rc=new THREE.Raycaster(), _O=new THREE.Vector3(), _D=new THREE.Vector3(0,-1,0);
  const groundY=(h)=>{ if(h.object.isSkinnedMesh||h.object.userData.landPatch||h.object.userData.landProp)return false; let q=h.object; for(;q;q=q.parent){ if(!q.visible||q===W3.group)return false; } return h.object.isMesh; };
  const groundYAt=(wx,wz,y0)=>{ '@later'; _O.set(wx,(y0||0)+30,wz); _rc.set(_O,_D); _rc.camera=SHARED.cam;
    for(const hh of _rc.intersectObjects(scene.children,true)){ if(groundY(hh))return hh.point.y; } return y0||0; };

  // ----- ground patches -----
  let regions; try{ const B=__DATA__("data/landscape.json")||[]; const L=JSON.parse(SAVE.get('land')||'null'); regions=Array.isArray(L)?L:B.slice(); }catch(e){ regions=[]; }
  const ser=r=>r.brush?{brush:r.brush,r:r.r,y:r.y,t:r.t}:r.poly?{poly:r.poly,y:r.y,t:r.t}:{x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y:r.y,t:r.t};
  const save=()=>{ try{ SAVE.set('land',JSON.stringify(regions.map(ser))); }catch(e){} };
  const addPatch=(geo,cx,cz,t)=>{ '@later'; geo.attributes.position.needsUpdate=true; if(geo.attributes.uv)geo.attributes.uv.needsUpdate=true; geo.computeVertexNormals(); geo.computeBoundingSphere();
    const me=new THREE.Mesh(geo,mat(t)); me.position.set(cx,0,cz); me.receiveShadow=true; me.renderOrder=1; me.frustumCulled=false; me.userData.landPatch=1; scene.add(me); return me; };
  const makeBox=r=>{ '@later'; const w=r.x1-r.x0, h=r.z1-r.z0; if(w<=0||h<=0)return;
    const nx=Math.max(1,Math.min(24,Math.round(w/T))), nz=Math.max(1,Math.min(24,Math.round(h/T)));
    const geo=new THREE.PlaneGeometry(w,h,nx,nz); geo.rotateX(-Math.PI/2);
    const cx=(r.x0+r.x1)/2, cz=(r.z0+r.z1)/2, P=geo.attributes.position.array, uv=geo.attributes.uv.array;
    for(let i=0,j=0;i<P.length;i+=3,j+=2){ const wx=cx+P[i], wz=cz+P[i+2]; P[i+1]=groundYAt(wx,wz,r.y)+.05; uv[j]=wx/T; uv[j+1]=wz/T; }
    r.mesh=addPatch(geo,cx,cz,r.t); };
  const makePoly=r=>{ '@later'; const pts=r.poly; if(!pts||pts.length<3)return; let cx=0,cz=0; for(const p of pts){ cx+=p[0]; cz+=p[1]; } cx/=pts.length; cz/=pts.length;
    const shape=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0]-cx,p[1]-cz))), geo=new THREE.ShapeGeometry(shape);
    const P=geo.attributes.position.array, uv=geo.attributes.uv&&geo.attributes.uv.array;
    for(let i=0,j=0;i<P.length;i+=3,j+=2){ const sx=P[i], sy=P[i+1], wx=cx+sx, wz=cz+sy; P[i+1]=groundYAt(wx,wz,r.y)+.05; P[i+2]=sy; if(uv){ uv[j]=wx/T; uv[j+1]=wz/T; } }
    r.mesh=addPatch(geo,cx,cz,r.t); };
  const makeBrush=r=>{ '@later'; const pts=r.brush; if(!pts||!pts.length)return; const R=r.r||1.5*T, n=2, P=[],UV=[],IDX=[]; let base=0;
    for(const [x,z] of pts){ for(let iz=0;iz<=n;iz++)for(let ix=0;ix<=n;ix++){ const wx=x-R+2*R*ix/n, wz=z-R+2*R*iz/n; P.push(wx,groundYAt(wx,wz,r.y)+.05,wz); UV.push(wx/T,wz/T); }
      for(let iz=0;iz<n;iz++)for(let ix=0;ix<n;ix++){ const a=base+iz*(n+1)+ix,b=a+1,c=a+(n+1),d=c+1; IDX.push(a,c,b,b,c,d); } base=P.length/3; }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); geo.setIndex(IDX);
    r.mesh=addPatch(geo,0,0,r.t); };
  const make=r=>r.brush?makeBrush(r):r.poly?makePoly(r):makeBox(r);
  const unmake=r=>{ if(r.mesh){ scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose(); r.mesh=null; } };

  // ----- plants & rocks (placed props, one path: the baked PROPS/FOREST models) -----
  const MODELS=Object.assign({},FOREST,PROPS);
  const GROUPS=[['Grass',['grass1','grass2']],['Bushes',['bush1','bush2','bush3','bush4','bush5','hbush1','hbush2']],
    ['Flowers',['flower1','flower2','flower3','flower4','flower5','flower6','daisy','tulip','rose','sunflower','lily']],
    ['Mushrooms',['mushroom1','mushroom2','mushroom3','mushroom4','pmushroom1','pmushroom2','pmushroom3']],
    ['Rocks',['stone2','stone3','stones1','BigRock1','BigRock2','BigRock3','BigRock4','BigRock5','Rock1','Rock_12']],
    ['Wood',['log1','log2','log3','sitlog','woodpile']],['Other',['fence1','fence2','pillar1','pillar2','pillar3','campfire','kayak','fisherboat']]]
    .map(([n,ks])=>[n,ks.filter(k=>MODELS[k])]).filter(g=>g[1].length);
  const dftScale=k=>{ for(const [p,s] of [['BigRock',2.2],['Rock',1],['pillar',3],['sunflower',.9],['hbush',.9],['bush',1.2],['pmushroom',.6],['mushroom',.35],['grass',.6],['stones',.3],['stone',.4],['log',.6],['sitlog',.5],['woodpile',.5],['fence',.8],['campfire',.13],['kayak',1],['fisherboat',1],['daisy',.4],['tulip',.4],['rose',.45],['lily',.4],['flower',.6]])if(k.indexOf(p)===0)return s; return 1; };
  const geoCache={}, pmat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,shadowSide:THREE.BackSide});
  const propGeo=k=>{ '@later'; if(geoCache[k])return geoCache[k]; const D=MODELS[k]; if(!D)return null; const p=F32(D.p), col=B64(D.c), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(Array.from(p),3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); geoCache[k]=g; return g; };
  let gard=null; const gardGroup=()=>{ if(!gard){ gard=new THREE.Group(); gard.userData.landProp=1; scene.add(gard); } return gard; };
  const makeProp=o=>{ '@later'; const g=propGeo(o.k); if(!g)return; const me=new THREE.Mesh(g,pmat); me.scale.setScalar(o.s/.84*T); me.rotation.y=o.rot||0;
    me.position.set(o.x,groundYAt(o.x,o.z,o.y||0),o.z); me.castShadow=true; me.receiveShadow=true; me.userData.landProp=o; o.mesh=me; gardGroup().add(me); };
  const unprop=o=>{ if(o.mesh){ gardGroup().remove(o.mesh); o.mesh=null; } };
  let gprops; try{ const B=__DATA__("data/garden.json")||[]; const G=JSON.parse(SAVE.get('land-props')||'null'); gprops=Array.isArray(G)?G:B.slice(); }catch(e){ gprops=[]; }
  const serP=o=>({k:o.k,x:o.x,z:o.z,y:o.y,s:o.s,rot:o.rot});
  const saveP=()=>{ try{ SAVE.set('land-props',JSON.stringify(gprops.map(serP))); }catch(e){} };

  { const go=()=>{ if(!window.__started)return setTimeout(go,500); for(const r of regions)make(r); for(const o of gprops)makeProp(o); }; if(regions.length||gprops.length)go(); }

  let type='grass', drag=null, prev=null, mode='box', poly=null, polyY=0, polyLine=null;
  let brushR=1.5*T, painting=null, paintY=0, paintPrev=null, prop='bush1', propS=null, rot=true;
  const ray=new THREE.Raycaster(), V2=THREE.Vector2, V3=THREE.Vector3;
  const screenRay=e=>{ const b=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new V2((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1)),SHARED.cam); };
  const showPoly=()=>{ '@later'; if(polyLine){ scene.remove(polyLine); polyLine.geometry.dispose(); polyLine=null; } if(!poly||!poly.length)return;
    polyLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(poly.map(p=>new V3(p[0],polyY+.07,p[1]))),new THREE.LineBasicMaterial({color:0xffbf5e,depthTest:false})); polyLine.renderOrder=999; polyLine.frustumCulled=false; scene.add(polyLine); };
  const hidePoly=()=>{ if(polyLine){ scene.remove(polyLine); polyLine.geometry.dispose(); polyLine=null; } };
  const groundHit=e=>{ '@later'; screenRay(e); for(const h of ray.intersectObjects(scene.children,true)){ if(groundY(h))return h.point.clone(); } return null; };
  const showPrev=()=>{ '@later'; if(!drag)return; if(!prev){ prev=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffbf5e,transparent:true,opacity:.4,depthTest:false})); prev.renderOrder=999; scene.add(prev); }
    const x0=Math.min(drag.x0,drag.x1),x1=Math.max(drag.x0,drag.x1),z0=Math.min(drag.z0,drag.z1),z1=Math.max(drag.z0,drag.z1); prev.visible=true; prev.position.set((x0+x1)/2,drag.y+.07,(z0+z1)/2); prev.scale.set(Math.max(.01,x1-x0),1,Math.max(.01,z1-z0)); };
  const hidePrev=()=>{ if(prev)prev.visible=false; };
  const paintGroup=()=>{ if(!paintPrev){ paintPrev=new THREE.Group(); paintPrev.renderOrder=999; scene.add(paintPrev); } return paintPrev; };
  const paintStamp=(x,z)=>{ '@later'; const m=new THREE.Mesh(new THREE.CircleGeometry(brushR,14).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffbf5e,transparent:true,opacity:.35,depthTest:false})); m.position.set(x,paintY+.07,z); paintGroup().add(m); };
  const clearPaintPrev=()=>{ if(paintPrev){ scene.remove(paintPrev); paintPrev.traverse(o=>o.geometry&&o.geometry.dispose()); paintPrev=null; } };

  LAND.down=e=>{ if(!LAND.on||e.button!==0)return false; const p=groundHit(e);
    if(mode==='erase'){ if(gard){ screenRay(e); const hs=ray.intersectObjects(gard.children,true); if(hs.length){ let q=hs[0].object; while(q&&!q.userData.landProp)q=q.parent; const o=q&&q.userData.landProp, i=o?gprops.indexOf(o):-1; if(i>=0){ unprop(o); gprops.splice(i,1); saveP(); draw(); } } } return true; }
    if(!p)return false;
    if(mode==='plant'){ const o={k:prop,x:p.x,z:p.z,y:p.y,s:propS!=null?propS:dftScale(prop),rot:rot?Math.random()*6.283:0}; gprops.push(o); makeProp(o); saveP(); draw(); return true; }
    if(mode==='draw'){ painting=[[p.x,p.z]]; paintY=p.y; clearPaintPrev(); paintStamp(p.x,p.z); return true; }
    if(mode==='border'){ if(!poly){ poly=[]; polyY=p.y; } poly.push([p.x,p.z]); showPoly(); draw(); return true; }
    drag={y:p.y,x0:p.x,z0:p.z,x1:p.x,z1:p.z}; showPrev(); return true; };
  LAND.move=e=>{ '@later'; if(painting){ screenRay(e); const pl=new THREE.Plane(new V3(0,1,0),-paintY), q=new V3(); if(ray.ray.intersectPlane(pl,q)){ const last=painting[painting.length-1]; if(Math.hypot(q.x-last[0],q.z-last[1])>brushR*.6&&painting.length<160){ painting.push([q.x,q.z]); paintStamp(q.x,q.z); } } return; }
    if(!drag)return; screenRay(e); const pl=new THREE.Plane(new V3(0,1,0),-drag.y), q=new V3(); if(ray.ray.intersectPlane(pl,q)){ drag.x1=q.x; drag.z1=q.z; showPrev(); } };
  LAND.up=()=>{ if(painting){ const pts=painting; painting=null; clearPaintPrev(); if(pts.length){ const r={brush:pts,r:brushR,y:paintY,t:type}; regions.push(r); make(r); save(); draw(); } return; }
    if(!drag)return; const d=drag; drag=null; hidePrev(); const x0=Math.min(d.x0,d.x1),x1=Math.max(d.x0,d.x1),z0=Math.min(d.z0,d.z1),z1=Math.max(d.z0,d.z1);
    if(x1-x0>.3*T&&z1-z0>.3*T){ const r={x0,x1,z0,z1,y:d.y,t:type}; regions.push(r); make(r); save(); draw(); } };
  Object.defineProperty(LAND,'dragging',{get:()=>!!drag||!!painting});

  const css=document.createElement('style'); css.textContent=`
  #lnd{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));top:12px;width:236px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #lnd[hidden]{display:none} #lnd h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #lnd .pane{padding:10px 14px}
  #lnd .dim{color:var(--dim);font-size:10px;line-height:1.5} #lnd .types{display:flex;flex-direction:column;gap:4px;margin:8px 0}
  #lnd .t{display:flex;align-items:center;gap:8px;background:#0e1016;border:2px solid #3a3f4e;color:var(--fg);font:inherit;padding:5px 8px;cursor:pointer;text-align:left} #lnd .t[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #lnd .sw{width:16px;height:16px;border:1px solid #000;flex:0 0 auto} #lnd .row{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap} #lnd .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer} #lnd .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #lnd select{width:100%;font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 6px;margin:6px 0} #lnd .mini{flex:1;min-width:0}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='lnd'; P.hidden=true; document.body.appendChild(P);
  function draw(){ '@later'; const ground=mode==='box'||mode==='border'||mode==='draw';
    P.innerHTML=`<h2>LANDSCAPE</h2><div class="pane">
    <div class="row"><button class="btn mini" id="lmbox" aria-pressed="${mode==='box'}">BOX</button><button class="btn mini" id="lmbord" aria-pressed="${mode==='border'}">BORDER</button><button class="btn mini" id="lmdraw" aria-pressed="${mode==='draw'}">DRAW</button></div>
    <div class="row"><button class="btn mini" id="lmplant" aria-pressed="${mode==='plant'}">PLANTS</button><button class="btn mini" id="lmerase" aria-pressed="${mode==='erase'}">ERASE</button></div>
    ${ground?`<div class="types">${TYPES.map(([k,n,c])=>`<button class="t" data-t="${k}" aria-pressed="${type===k}"><span class="sw" style="background:${c}"></span>${n}</button>`).join('')}</div>`:''}
    ${mode==='draw'?`<div class="row"><button class="btn" id="lbrsm">SIZE -</button><span class="dim" style="align-self:center">${(brushR/T).toFixed(1)} tiles</span><button class="btn" id="lbrbg">SIZE +</button></div><div class="dim">Hold and drag on the ground to paint.</div>`:''}
    ${mode==='border'?`<div class="dim">Click points on the ground, then FINISH.</div><div class="row"><button class="btn" id="lfin">FINISH (${poly?poly.length:0})</button><button class="btn" id="lcancel">CANCEL</button></div>`:''}
    ${mode==='box'?'<div class="dim">Drag a box on the ground to paint it.</div>':''}
    ${mode==='plant'?`<select id="lsel">${GROUPS.map(([n,ks])=>`<optgroup label="${n}">${ks.map(k=>`<option value="${k}"${prop===k?' selected':''}>${k}</option>`).join('')}</optgroup>`).join('')}</select>
      <div class="row"><button class="btn" id="lpsm">SIZE -</button><span class="dim" style="align-self:center">${(propS!=null?propS:dftScale(prop)).toFixed(2)}</span><button class="btn" id="lpbg">SIZE +</button><button class="btn" id="lprot" aria-pressed="${rot}">RAND ROT</button></div>
      <div class="dim">Click the ground to place one.</div>`:''}
    ${mode==='erase'?'<div class="dim">Click a plant or rock to remove it.</div>':''}
    <div class="dim">${regions.length} patch${regions.length===1?'':'es'} · ${gprops.length} plant${gprops.length===1?'':'s'}</div>
    <div class="row"><button class="btn" id="lundo">UNDO LAST</button><button class="btn" id="lclear">CLEAR ${ground||mode==='erase'?'PATCHES':''}</button></div>
    ${mode==='plant'||mode==='erase'?'<div class="row"><button class="btn" id="lclrp">CLEAR PLANTS</button></div>':''}
    <div class="row"><button class="btn" id="lexp">EXPORT ${mode==='plant'||mode==='erase'?'PLANTS':'LAND'}</button><button class="btn" id="ldone">DONE</button></div>
    <div class="dim">Walk with WASD while editing. EXPORT writes ${mode==='plant'||mode==='erase'?'garden.json':'landscape.json'}; drop it in data/ to ship.</div></div>`; }
  const setMode=m=>{ mode=m; drag=null; hidePrev(); painting=null; clearPaintPrev(); if(m!=='border'){ poly=null; hidePoly(); } draw(); };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.dataset.t){ type=b.dataset.t; draw(); return; }
    if(b.id==='lmbox'){ setMode('box'); return; }
    if(b.id==='lmbord'){ setMode('border'); return; }
    if(b.id==='lmdraw'){ setMode('draw'); return; }
    if(b.id==='lmplant'){ setMode('plant'); return; }
    if(b.id==='lmerase'){ setMode('erase'); return; }
    if(b.id==='lbrsm'){ brushR=Math.max(.5*T,brushR-.5*T); draw(); return; }
    if(b.id==='lbrbg'){ brushR=Math.min(6*T,brushR+.5*T); draw(); return; }
    if(b.id==='lpsm'){ propS=Math.max(.05,(propS!=null?propS:dftScale(prop))-.1); draw(); return; }
    if(b.id==='lpbg'){ propS=Math.min(8,(propS!=null?propS:dftScale(prop))+.1); draw(); return; }
    if(b.id==='lprot'){ rot=!rot; draw(); return; }
    if(b.id==='lfin'){ if(poly&&poly.length>=3){ const r={poly:poly.slice(),y:polyY,t:type}; regions.push(r); make(r); save(); } poly=null; hidePoly(); draw(); return; }
    if(b.id==='lcancel'){ poly=null; hidePoly(); draw(); return; }
    if(b.id==='lundo'){ if(mode==='plant'||mode==='erase'){ const o=gprops.pop(); if(o){ unprop(o); saveP(); } } else { const r=regions.pop(); if(r)unmake(r); save(); } draw(); return; }
    if(b.id==='lclear'){ if(!confirm('Remove all ground patches?'))return; for(const r of regions)unmake(r); regions.length=0; save(); draw(); return; }
    if(b.id==='lclrp'){ if(!confirm('Remove all placed plants and rocks?'))return; for(const o of gprops)unprop(o); gprops.length=0; saveP(); draw(); return; }
    if(b.id==='lexp'){ const plant=mode==='plant'||mode==='erase', data=plant?gprops.map(serP):regions.map(ser); const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=plant?'garden.json':'landscape.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); return; }
    if(b.id==='ldone'){ LAND.toggle(); return; } });
  P.addEventListener('change',e=>{ if(e.target.id==='lsel'){ prop=e.target.value; propS=null; draw(); } });
  LAND.toggle=()=>{ LAND.on=!LAND.on; if(LAND.on)draw(); else { drag=null; hidePrev(); poly=null; hidePoly(); painting=null; clearPaintPrev(); } P.hidden=!LAND.on; };
}
