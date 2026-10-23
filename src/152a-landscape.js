// THE LANDSCAPE EDITOR: LAND drags a box on the ground and lays a textured patch over it (grass, cobble, dirt...); shift+9.
import {SHARED, THREE} from './003-shx.js';
import {LAND, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
{ const T=TILE;
  const TYPES=[['grass','GRASS','#4a7a3a'],['grass2','DRY GRASS','#6f863a'],['cobble','COBBLE','#6b6b70'],['dirt','DIRT','#6b4f33'],['gravel','GRAVEL','#7a766f'],['slab','STONE SLAB','#8a857a'],['sand','SAND','#c9b885']];
  const rnd=(s)=>{ let x=Math.sin(s)*43758.5453; return x-Math.floor(x); };
  const texCache={};
  function tex(t){ '@later'; if(texCache[t])return texCache[t]; const N=64, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d');
    const base=(TYPES.find(a=>a[0]===t)||['','','#4a7a3a'])[2]; g.fillStyle=base; g.fillRect(0,0,N,N);
    const dot=(x,y,r,c)=>{ g.fillStyle=c; g.fillRect(x-r,y-r,r*2,r*2); };
    if(t==='grass'||t==='grass2'){ for(let i=0;i<340;i++){ const x=rnd(i*1.3)*N,y=rnd(i*2.7+3)*N,v=rnd(i*5.1); dot(x,y,1,v<.5?(t==='grass'?'#3d6630':'#5f7430'):(t==='grass'?'#5c8f46':'#86a24c')); } }
    else if(t==='cobble'||t==='slab'){ const cell=t==='cobble'?12:16; for(let cy=0;cy<N;cy+=cell)for(let cx=0;cx<N;cx+=cell){ const off=t==='cobble'?(rnd(cx*cy+1)-.5)*3:0, s=rnd(cx+cy*7); g.fillStyle=t==='cobble'?(s<.33?'#5f5f64':s<.66?'#74747a':'#656569'):(s<.5?'#8f8a7f':'#827d72'); g.fillRect(cx+1+off,cy+1+off,cell-2,cell-2); } g.fillStyle='rgba(30,30,34,.5)'; for(let p=0;p<=N;p+=cell){ g.fillRect(p,0,1,N); g.fillRect(0,p,N,1); } }
    else if(t==='dirt'){ for(let i=0;i<300;i++){ const x=rnd(i*1.7)*N,y=rnd(i*3.1+2)*N,v=rnd(i*4.3); dot(x,y,1,v<.5?'#5a4028':'#7a5c3c'); } }
    else if(t==='gravel'){ for(let i=0;i<220;i++){ const x=rnd(i*2.1)*N,y=rnd(i*1.9+5)*N,v=rnd(i*6.7); dot(x,y,rnd(i)>.6?2:1,v<.4?'#5e5a54':v<.75?'#8a867e':'#9c988f'); } }
    else if(t==='sand'){ for(let i=0;i<240;i++){ const x=rnd(i*1.1)*N,y=rnd(i*2.3+1)*N; dot(x,y,1,rnd(i*3.3)<.5?'#bcaf78':'#d6c898'); } }
    const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.colorSpace=THREE.SRGBColorSpace; texCache[t]=tx; return tx; }
  const mat=t=>{ const m=new THREE.MeshToonMaterial({map:tex(t),side:THREE.DoubleSide}); if(W3.GP)m.gradientMap=W3.GP; return m; };
  let regions; try{ const B=__DATA__("data/landscape.json")||[]; const L=JSON.parse(SAVE.get('land')||'null'); regions=Array.isArray(L)?L:B.slice(); }catch(e){ regions=[]; }
  const ser=r=>r.poly?{poly:r.poly,y:r.y,t:r.t}:{x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y:r.y,t:r.t};
  const save=()=>{ try{ SAVE.set('land',JSON.stringify(regions.map(ser))); }catch(e){} };
  const _rc=new THREE.Raycaster(), _O=new THREE.Vector3(), _D=new THREE.Vector3(0,-1,0);
  const groundYAt=(wx,wz,y0)=>{ '@later'; _O.set(wx,(y0||0)+30,wz); _rc.set(_O,_D);
    for(const hh of _rc.intersectObjects(scene.children,true)){ if(hh.object.isSkinnedMesh||hh.object.userData.landPatch)continue; let q=hh.object, ok=true; for(;q;q=q.parent){ if(!q.visible||q===W3.group){ ok=false; break; } } if(ok&&hh.object.isMesh)return hh.point.y; } return y0||0; };
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
  const make=r=>r.poly?makePoly(r):makeBox(r);
  const unmake=r=>{ if(r.mesh){ scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose(); r.mesh=null; } };
  { const go=()=>{ if(!window.__started)return setTimeout(go,500); for(const r of regions)make(r); }; if(regions.length)go(); }

  let type='grass', drag=null, prev=null, mode='box', poly=null, polyY=0, polyLine=null;
  const ray=new THREE.Raycaster(), V2=THREE.Vector2, V3=THREE.Vector3;
  const showPoly=()=>{ '@later'; if(polyLine){ scene.remove(polyLine); polyLine.geometry.dispose(); polyLine=null; } if(!poly||!poly.length)return;
    polyLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(poly.map(p=>new V3(p[0],polyY+.07,p[1]))),new THREE.LineBasicMaterial({color:0xffbf5e,depthTest:false})); polyLine.renderOrder=999; polyLine.frustumCulled=false; scene.add(polyLine); };
  const hidePoly=()=>{ if(polyLine){ scene.remove(polyLine); polyLine.geometry.dispose(); polyLine=null; } };
  const groundHit=e=>{ '@later'; const b=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new V2((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1)),SHARED.cam);
    for(const h of ray.intersectObjects(scene.children,true)){ if(h.object.isSkinnedMesh||h.object.userData.landPatch)continue; let q=h.object, ok=true; for(;q;q=q.parent){ if(!q.visible||q===W3.group){ ok=false; break; } } if(ok&&h.object.isMesh)return h.point.clone(); } return null; };
  const showPrev=()=>{ '@later'; if(!drag)return; if(!prev){ prev=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffbf5e,transparent:true,opacity:.4,depthTest:false})); prev.renderOrder=999; scene.add(prev); }
    const x0=Math.min(drag.x0,drag.x1),x1=Math.max(drag.x0,drag.x1),z0=Math.min(drag.z0,drag.z1),z1=Math.max(drag.z0,drag.z1); prev.visible=true; prev.position.set((x0+x1)/2,drag.y+.07,(z0+z1)/2); prev.scale.set(Math.max(.01,x1-x0),1,Math.max(.01,z1-z0)); };
  const hidePrev=()=>{ if(prev)prev.visible=false; };
  LAND.down=e=>{ if(!LAND.on||e.button!==0)return false; const p=groundHit(e); if(!p)return false;
    if(mode==='border'){ if(!poly){ poly=[]; polyY=p.y; } poly.push([p.x,p.z]); showPoly(); draw(); return true; }
    drag={y:p.y,x0:p.x,z0:p.z,x1:p.x,z1:p.z}; showPrev(); return true; };
  LAND.move=e=>{ '@later'; if(!drag)return; const b=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new V2((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1)),SHARED.cam);
    const pl=new THREE.Plane(new V3(0,1,0),-drag.y), q=new V3(); if(ray.ray.intersectPlane(pl,q)){ drag.x1=q.x; drag.z1=q.z; showPrev(); } };
  LAND.up=()=>{ if(!drag)return; const d=drag; drag=null; hidePrev(); const x0=Math.min(d.x0,d.x1),x1=Math.max(d.x0,d.x1),z0=Math.min(d.z0,d.z1),z1=Math.max(d.z0,d.z1);
    if(x1-x0>.3*T&&z1-z0>.3*T){ const r={x0,x1,z0,z1,y:d.y,t:type}; regions.push(r); make(r); save(); draw(); } };
  Object.defineProperty(LAND,'dragging',{get:()=>!!drag});

  const css=document.createElement('style'); css.textContent=`
  #lnd{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));top:12px;width:230px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #lnd[hidden]{display:none} #lnd h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #lnd .pane{padding:10px 14px}
  #lnd .dim{color:var(--dim);font-size:10px;line-height:1.5} #lnd .types{display:flex;flex-direction:column;gap:4px;margin:8px 0}
  #lnd .t{display:flex;align-items:center;gap:8px;background:#0e1016;border:2px solid #3a3f4e;color:var(--fg);font:inherit;padding:5px 8px;cursor:pointer;text-align:left} #lnd .t[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #lnd .sw{width:16px;height:16px;border:1px solid #000;flex:0 0 auto} #lnd .row{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap} #lnd .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer} #lnd .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='lnd'; P.hidden=true; document.body.appendChild(P);
  function draw(){ '@later'; P.innerHTML=`<h2>LANDSCAPE</h2><div class="pane">
    <div class="types">${TYPES.map(([k,n,c])=>`<button class="t" data-t="${k}" aria-pressed="${type===k}"><span class="sw" style="background:${c}"></span>${n}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="lmbox" aria-pressed="${mode==='box'}">BOX</button><button class="btn" id="lmbord" aria-pressed="${mode==='border'}">BORDER</button></div>
    ${mode==='border'?`<div class="dim">Click points on the ground, then FINISH.</div><div class="row"><button class="btn" id="lfin">FINISH (${poly?poly.length:0})</button><button class="btn" id="lcancel">CANCEL</button></div>`:'<div class="dim">Drag a box on the ground to paint it.</div>'}
    <div class="dim">${regions.length} patch${regions.length===1?'':'es'}</div>
    <div class="row"><button class="btn" id="lundo">UNDO LAST</button><button class="btn" id="lclear">CLEAR ALL</button></div>
    <div class="row"><button class="btn" id="lexp">EXPORT</button><button class="btn" id="ldone">DONE</button></div>
    <div class="dim">Export writes landscape.json; drop it in data/ to ship.</div></div>`; }
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.dataset.t){ type=b.dataset.t; draw(); return; }
    if(b.id==='lmbox'){ mode='box'; poly=null; hidePoly(); draw(); return; }
    if(b.id==='lmbord'){ mode='border'; drag=null; hidePrev(); draw(); return; }
    if(b.id==='lfin'){ if(poly&&poly.length>=3){ const r={poly:poly.slice(),y:polyY,t:type}; regions.push(r); make(r); save(); } poly=null; hidePoly(); draw(); return; }
    if(b.id==='lcancel'){ poly=null; hidePoly(); draw(); return; }
    if(b.id==='lundo'){ const r=regions.pop(); if(r)unmake(r); save(); draw(); return; }
    if(b.id==='lclear'){ if(!confirm('Remove all ground patches?'))return; for(const r of regions)unmake(r); regions.length=0; save(); draw(); return; }
    if(b.id==='lexp'){ const data=regions.map(r=>({x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y:r.y,t:r.t})); const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='landscape.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); return; }
    if(b.id==='ldone'){ LAND.toggle(); return; } });
  LAND.toggle=()=>{ LAND.on=!LAND.on; if(LAND.on)draw(); else { drag=null; hidePrev(); poly=null; hidePoly(); } P.hidden=!LAND.on; };
}
