// THE LANDSCAPE EDITOR: paint ground (box, border, free brush; the nine grasses set what grows there), place plants & rocks from a dropdown, erase; shift+9, edit while you walk.
import {SHARED, THREE} from './003-shx.js';
import {B64, F32} from './003a-skin.js';
import {LAND, pos, ROOMS, W3, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {FIX, SOL, SYS, TILE} from './006-map-pre.js';
import {TUFTC, tuftCol} from './014-gamekit.js';
import {GRASS} from './014a-grass.js';
import {FOREST, PROPS} from './039-bodega.js';
import {TPANE} from './087dz-tpane.js';
{ const T=TILE;
  const TYPES=[['grass','GRASS','#4a7a3a'],['grass2','DRY GRASS','#6f863a'],['grass3','LUSH GRASS','#2f6b2c'],['grass4','PALE GRASS','#8fa05a'],['sidewalk','SIDEWALK','#9a968e'],['cobble','COBBLE','#6b6b70'],['dirt','DIRT','#6b4f33'],['gravel','GRAVEL','#7a766f'],['slab','STONE SLAB','#8a857a'],['sand','SAND','#c9b885'],['road','ROAD','#34363c'],['alley','ALLEY','#46474c'],...GRASS.K.map(k=>['gk:'+k.id,k.name,k.sw])];   // the nine grass kinds last: a patch of one sets what grows there (GRASS)
  const rnd=(s)=>{ let x=Math.sin(s)*43758.5453; return x-Math.floor(x); };
  const texCache={};
  function tex(t){ if(texCache[t])return texCache[t]; const N=64, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d');
    const base=(TYPES.find(a=>a[0]===t)||['','','#4a7a3a'])[2]; g.fillStyle=base; g.fillRect(0,0,N,N);
    const dot=(x,y,r,c)=>{ g.fillStyle=c; g.fillRect(x-r,y-r,r*2,r*2); };
    if(/^grass/.test(t)){ const M=256, b=[1,3,5].map(i=>parseInt(base.slice(i,i+2),16)), A=[0,0,0], W=TUFTC.reduce((a,c)=>a+c[3],0); for(const c of TUFTC)for(let k=0;k<3;k++)A[k]+=c[k]*c[3]/W*.6;   // the lawn's tufts from above, in this grass's colour; 4 tiles a picture, mirrored
      const f=[b[0]/A[0],b[1]/A[1],b[2]/A[2]]; cv.width=cv.height=M; const im=g.createImageData(M,M);
      for(let j=0;j<M;j++)for(let i=0;i<M;i++){ const c=tuftCol((i+.5)/64+300,(j+.5)/64+300), q=(j*M+i)*4; for(let k=0;k<3;k++)im.data[q+k]=Math.min(255,c[k]*f[k]); im.data[q+3]=255; }
      g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=THREE.NearestFilter; tx.wrapS=tx.wrapT=THREE.MirroredRepeatWrapping; tx.repeat.set(.25,.25); tx.colorSpace=THREE.SRGBColorSpace; texCache[t]=tx; return tx; }
    if(t==='sidewalk'){ const cell=20; for(let p=0;p<=N;p+=cell){ g.fillStyle='rgba(60,58,54,.55)'; g.fillRect(p,0,1,N); } for(let i=0;i<180;i++){ const x=rnd(i*1.9)*N,y=rnd(i*2.4+4)*N; dot(x,y,1,rnd(i*3.7)<.5?'#8d8980':'#a7a39a'); } }
    else if(t==='cobble'||t==='slab'){ const cell=t==='cobble'?12:16; for(let cy=0;cy<N;cy+=cell)for(let cx=0;cx<N;cx+=cell){ const off=t==='cobble'?(rnd(cx*cy+1)-.5)*3:0, s=rnd(cx+cy*7); g.fillStyle=t==='cobble'?(s<.33?'#5f5f64':s<.66?'#74747a':'#656569'):(s<.5?'#8f8a7f':'#827d72'); g.fillRect(cx+1+off,cy+1+off,cell-2,cell-2); } g.fillStyle='rgba(30,30,34,.5)'; for(let p=0;p<=N;p+=cell){ g.fillRect(p,0,1,N); g.fillRect(0,p,N,1); } }
    else if(t==='dirt'){ for(let i=0;i<300;i++){ const x=rnd(i*1.7)*N,y=rnd(i*3.1+2)*N,v=rnd(i*4.3); dot(x,y,1,v<.5?'#5a4028':'#7a5c3c'); } }
    else if(t==='gravel'){ for(let i=0;i<220;i++){ const x=rnd(i*2.1)*N,y=rnd(i*1.9+5)*N,v=rnd(i*6.7); dot(x,y,rnd(i)>.6?2:1,v<.4?'#5e5a54':v<.75?'#8a867e':'#9c988f'); } }
    else if(t==='road'||t==='alley'){ for(let i=0;i<260;i++){ const x=rnd(i*1.3+t.length)*N,y=rnd(i*2.7+9)*N,v=rnd(i*5.1); dot(x,y,1,v<.5?(t==='road'?'#2c2e33':'#3c3d42'):(t==='road'?'#3f4147':'#55565b')); } if(t==='alley'){ g.fillStyle='rgba(20,20,24,.55)'; for(let i=0;i<4;i++){ let x=rnd(i*7.7)*N, y=rnd(i*3.1)*N; for(let k=0;k<8;k++){ g.fillRect(x,y,1,1); x+=rnd(i+k)*4-1; y+=1; } } } }
    else if(t==='sand'){ for(let i=0;i<240;i++){ const x=rnd(i*1.1)*N,y=rnd(i*2.3+1)*N; dot(x,y,1,rnd(i*3.3)<.5?'#bcaf78':'#d6c898'); } }
    const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.colorSpace=THREE.SRGBColorSpace; texCache[t]=tx; return tx; }
  const mat=t=>{ const m=new THREE.MeshToonMaterial({map:tex(t),side:THREE.DoubleSide}); if(W3.GP)m.gradientMap=W3.GP; return m; };
  const _rc=new THREE.Raycaster(), _O=new THREE.Vector3(), _D=new THREE.Vector3(0,-1,0);
  const groundY=(h)=>{ if(h.object.isSkinnedMesh||h.object.userData.landPatch||h.object.userData.landProp)return false; let q=h.object; for(;q;q=q.parent){ if(!q.visible||q===W3.group)return false; } return h.object.isMesh; };
  const groundYAt=(wx,wz,y0)=>{ _O.set(wx,(y0||0)+30,wz); _rc.set(_O,_D); _rc.camera=SHARED.cam;
    for(const hh of _rc.intersectObjects(scene.children,true)){ if(groundY(hh))return hh.point.y; } return y0||0; };

  // ----- ground patches -----
  let regions; try{ const B=__DATA__("data/landscape.json")||[]; const L=JSON.parse(SAVE.get('land')||'null'); regions=Array.isArray(L)?L:B.slice(); }catch(e){ regions=[]; }
  const ser=r=>r.brush?{brush:r.brush,r:r.r,y:r.y,t:r.t}:r.poly?{poly:r.poly,y:r.y,t:r.t}:{x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y:r.y,t:r.t};
  const save=()=>{ try{ SAVE.set('land',JSON.stringify(regions.map(ser))); }catch(e){} };
  const addPatch=(geo,cx,cz,t)=>{ geo.attributes.position.needsUpdate=true; if(geo.attributes.uv)geo.attributes.uv.needsUpdate=true; geo.computeVertexNormals(); geo.computeBoundingSphere();
    const me=new THREE.Mesh(geo,mat(t)); me.position.set(cx,0,cz); me.receiveShadow=true; me.renderOrder=1; me.frustumCulled=false; me.userData.landPatch=t; scene.add(me); relawn(me); return me; };
  const relawn=me=>{ if(!WEEDS.lawnDrop)return; const b=new THREE.Box3().setFromObject(me); WEEDS.lawnDrop([b.min.x,b.min.z,b.max.x,b.max.z]); };
  const regrow=r=>{ GRASS.setPainted(regions); const b=GRASS.box(r); if(GRASS.remap)GRASS.remap(...b); if(WEEDS.lawnDrop)WEEDS.lawnDrop(b); };   // a grass patch: the ground's kind map, the standing grass, flowers, mushrooms and butterflies there again
  const makeBox=r=>{ const w=r.x1-r.x0, h=r.z1-r.z0; if(w<=0||h<=0)return;
    const nx=Math.max(1,Math.min(24,Math.round(w/T))), nz=Math.max(1,Math.min(24,Math.round(h/T)));
    const geo=new THREE.PlaneGeometry(w,h,nx,nz); geo.rotateX(-Math.PI/2);
    const cx=(r.x0+r.x1)/2, cz=(r.z0+r.z1)/2, P=geo.attributes.position.array, uv=geo.attributes.uv.array;
    for(let i=0,j=0;i<P.length;i+=3,j+=2){ const wx=cx+P[i], wz=cz+P[i+2]; P[i+1]=groundYAt(wx,wz,r.y)+.05; uv[j]=wx/T; uv[j+1]=wz/T; }
    r.mesh=addPatch(geo,cx,cz,r.t); };
  const makePoly=r=>{ const pts=r.poly; if(!pts||pts.length<3)return; let cx=0,cz=0; for(const p of pts){ cx+=p[0]; cz+=p[1]; } cx/=pts.length; cz/=pts.length;
    const shape=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0]-cx,p[1]-cz))), geo=new THREE.ShapeGeometry(shape);
    const P=geo.attributes.position.array, uv=geo.attributes.uv&&geo.attributes.uv.array;
    for(let i=0,j=0;i<P.length;i+=3,j+=2){ const sx=P[i], sy=P[i+1], wx=cx+sx, wz=cz+sy; P[i+1]=groundYAt(wx,wz,r.y)+.05; P[i+2]=sy; if(uv){ uv[j]=wx/T; uv[j+1]=wz/T; } }
    r.mesh=addPatch(geo,cx,cz,r.t); };
  const makeBrush=r=>{ const pts=r.brush; if(!pts||!pts.length)return; const R=r.r||1.5*T, n=2, P=[],UV=[],IDX=[]; let base=0;
    for(const [x,z] of pts){ for(let iz=0;iz<=n;iz++)for(let ix=0;ix<=n;ix++){ const wx=x-R+2*R*ix/n, wz=z-R+2*R*iz/n; P.push(wx,groundYAt(wx,wz,r.y)+.05,wz); UV.push(wx/T,wz/T); }
      for(let iz=0;iz<n;iz++)for(let ix=0;ix<n;ix++){ const a=base+iz*(n+1)+ix,b=a+1,c=a+(n+1),d=c+1; IDX.push(a,c,b,b,c,d); } base=P.length/3; }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); geo.setIndex(IDX);
    r.mesh=addPatch(geo,0,0,r.t); };
  const make=r=>/^gk:/.test(r.t)?regrow(r):r.brush?makeBrush(r):r.poly?makePoly(r):makeBox(r);
  const unmake=r=>{ if(/^gk:/.test(r.t)){ GRASS.setPainted(regions.filter(q=>q!==r)); const b=GRASS.box(r); if(GRASS.remap)GRASS.remap(...b); if(WEEDS.lawnDrop)WEEDS.lawnDrop(b); return; } if(r.mesh){ scene.remove(r.mesh); relawn(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose(); r.mesh=null; } };

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
  // the Drive's models (owner, 3 Nov 2026): data/pfprops.json, real size in metres, kit-packed; loaded the first time a placed one needs it
  const PFL=__LAZY__("data/pfprops.json"); let PFW=null; const pfReady=()=>PFW||(PFW=PFL().then(D=>{ Object.assign(MODELS,D); GROUPS.push(['Drive models',Object.keys(D)]); if(LAND.on)draw(); return D; }));
  const kitGeo=D=>{ const q=new Int16Array(B64(D.p).buffer), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*D.sc+D.lo[i%3];
    const col=B64(D.c), C=new Float32Array(col.length), c=new THREE.Color(); for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(D.i32?new Uint32Array(B64(D.i).buffer):new Uint16Array(B64(D.i).buffer),1)); g.computeVertexNormals(); g.computeBoundingSphere(); g.computeBoundingBox(); return g; };
  const propGeo=k=>{ if(geoCache[k])return geoCache[k]; const D=MODELS[k]; if(!D)return null; if(D.sc)return geoCache[k]=kitGeo(D); const p=F32(D.p), col=B64(D.c), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(Array.from(p),3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); geoCache[k]=g; return g; };
  let gard=null; const gardGroup=()=>{ if(!gard){ gard=new THREE.Group(); gard.userData.landProp=1; scene.add(gard); } return gard; };
  const makeProp=o=>{ if(!MODELS[o.k]&&/^pf_/.test(o.k)){ pfReady().then(()=>{ if(MODELS[o.k]&&!o.mesh&&gprops.includes(o))makeProp(o); }); return; } const g=propGeo(o.k); if(!g)return; const me=new THREE.Mesh(g,pmat); me.scale.setScalar(o.s/.84*T); me.rotation.y=o.rot||0;
    me.position.set(o.x,groundYAt(o.x,o.z,o.y||0),o.z); me.castShadow=true; me.receiveShadow=true; me.userData.landProp=o; o.mesh=me; gardGroup().add(me);
    if(MODELS[o.k].sc&&o.solid!==false){ const bb=g.boundingBox, k=o.s/.84*T, w=(bb.max.x-bb.min.x)*k/2, d=(bb.max.z-bb.min.z)*k/2, h=(bb.max.y-bb.min.y)*k, cx=(bb.max.x+bb.min.x)/2*k, cz=(bb.max.z+bb.min.z)/2*k, cs=Math.cos(me.rotation.y), sn=Math.sin(me.rotation.y);
      if(Math.min(w,d)>.25*T&&h>.5*T){ const x=o.x+cx*cs+cz*sn, z=o.z-cx*sn+cz*cs, ex=Math.abs(cs)*w+Math.abs(sn)*d, ez=Math.abs(sn)*w+Math.abs(cs)*d, y=me.position.y; o.sol=[x-ex,z-ez,x+ex,z+ez]; o.fix=[x-ex,z-ez,y,x+ex,z+ez,y+h]; SOL.up.push(o.sol); FIX.up.push(o.fix); } } };
  const unprop=o=>{ if(o.mesh){ gardGroup().remove(o.mesh); o.mesh=null; } for(const [L,b] of [[SOL.up,o.sol],[FIX.up,o.fix]]){ const i=b?L.indexOf(b):-1; if(i>=0)L.splice(i,1); } o.sol=o.fix=null; };
  let gprops; try{ const B=__DATA__("data/garden.json")||[]; const G=JSON.parse(SAVE.get('land-props')||'null'); gprops=Array.isArray(G)?G:B.slice(); }catch(e){ gprops=[]; }
  try{ if(SHARED.MAPLIVE&&SHARED.MAPLIVE.gardenOf)gprops=SHARED.MAPLIVE.gardenOf(gprops); }catch(e){}
  const serP=o=>({k:o.k,x:o.x,z:o.z,y:o.y,s:o.s,rot:o.rot,...(o.solid===false?{solid:false}:{})});
  const saveP=()=>{ try{ SAVE.set('land-props',JSON.stringify(gprops.map(serP))); }catch(e){} };

  // the Drive's placed models drawn only near you (a few metres past their own size)
  // the Drive's models drawn a patch of ground at a time: each patch's models merged into one mesh (one draw, one shadow draw a pass, not one each);
  // the models one by one only while the landscape editor is open, to pick and move
  const CELL=40, cells=new Map(), V=new THREE.Vector3(), NM=new THREE.Matrix3();
  const merge=L=>{ let nv=0, ni=0; for(const m of L){ nv+=m.geometry.attributes.position.count; ni+=m.geometry.index.count; } const P=new Float32Array(nv*3), N=new Float32Array(nv*3), C=new Float32Array(nv*3), I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
    let v=0, i=0; for(const m of L){ m.updateMatrixWorld(true); NM.getNormalMatrix(m.matrixWorld); const g=m.geometry, gp=g.attributes.position, gn=g.attributes.normal, gc=g.attributes.color, gi=g.index;
      for(let k=0;k<gp.count;k++){ V.fromBufferAttribute(gp,k).applyMatrix4(m.matrixWorld); P.set([V.x,V.y,V.z],(v+k)*3); V.fromBufferAttribute(gn,k).applyMatrix3(NM).normalize(); N.set([V.x,V.y,V.z],(v+k)*3); C.set([gc.getX(k),gc.getY(k),gc.getZ(k)],(v+k)*3); }
      for(let k=0;k<gi.count;k++)I[i+k]=gi.getX(k)+v; v+=gp.count; i+=gi.count; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(N,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(I,1)); g.computeBoundingSphere(); return g; };
  const patch=(key,L)=>{ let c=cells.get(key); const sig=L.map(m=>m.id+':'+m.position.x.toFixed(2)+':'+m.position.z.toFixed(2)+':'+m.rotation.y.toFixed(3)+':'+m.scale.x.toFixed(3)).join(); if(c&&c.sig===sig)return c; if(c){ c.me.removeFromParent(); c.me.geometry.dispose(); }
    const me=new THREE.Mesh(merge(L),pmat); me.receiveShadow=true; me.matrixAutoUpdate=false; me.userData.landProp=1; gardGroup().add(me); c={me,sig,x:me.geometry.boundingSphere.center.x,z:me.geometry.boundingSphere.center.z,r:me.geometry.boundingSphere.radius}; cells.set(key,c); return c; };
  let cullT=0, wasUp=true, wasEd=false; SYS.add('places',dt=>{ const up=SHARED.LVL==='up'&&!ROOMS.cur, ed=!!LAND.on; if(up===wasUp&&ed===wasEd&&(cullT-=dt)>0)return; wasUp=up; wasEd=ed; cullT=.5;
    const by=new Map(); for(const o of gprops){ const m=o.mesh; if(!m||!MODELS[o.k]||!MODELS[o.k].sc)continue;
      if(ed){ const r=m.geometry.boundingSphere.radius*m.scale.x, d=Math.hypot(o.x-pos.x,o.z-pos.z); m.visible=up&&d<45+r; m.castShadow=m.visible&&r>2.5; continue; }
      m.visible=false; const k=Math.floor(o.x/CELL)+','+Math.floor(o.z/CELL); (by.get(k)||by.set(k,[]).get(k)).push(m); }
    for(const [k,c] of cells)if(ed||!by.has(k)){ c.me.visible=false; if(!by.has(k)&&!ed){ c.me.removeFromParent(); c.me.geometry.dispose(); cells.delete(k); } }
    if(!ed)for(const [k,L] of by){ const c=patch(k,L), d=Math.hypot(c.x-pos.x,c.z-pos.z); c.me.visible=up&&d<45+c.r; c.me.castShadow=c.me.visible&&d<22+c.r; } },'152a-landscape cull');   // (above ground and out of the off-map rooms only; a patch near you casts shadows)
  if(regions.length||gprops.length)SYS.onStart(()=>{ for(const r of regions)if(!/^gk:/.test(r.t))make(r); for(const o of gprops)makeProp(o); },'152a-landscape');
  // the map editor's published ground (worker/mappatch.js, SHARED.MAPLIVE.ground, in map tiles): one mesh a kind, a vertex a tile, laid on the ground
  { const G=(SHARED.MAPLIVE&&SHARED.MAPLIVE.ground)||[]; LAND.pub=[];
    const build=()=>{ const B=SHARED.BOD, gy=(x,z)=>{ try{ return typeof SHARED.groundY==='function'?SHARED.groundY(x,z)||0:0; }catch(e){ return 0; } }, by={};
      for(const g of G)(by[g.t]=by[g.t]||[]).push(g);
      for(const t in by){ const P=[],UV=[],IX=[];
        for(const g of by[t]){ const xa=B.XS(g.x0), xb=B.XS(g.x1), za=B.ZS(g.y0), zb=B.ZS(g.y1), x0=Math.min(xa,xb), x1=Math.max(xa,xb), z0=Math.min(za,zb), z1=Math.max(za,zb);
          const nx=Math.max(1,Math.min(64,Math.round((x1-x0)/T))), nz=Math.max(1,Math.min(64,Math.round((z1-z0)/T))), b=P.length/3;
          for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){ const x=x0+(x1-x0)*i/nx, z=z0+(z1-z0)*j/nz; P.push(x,gy(x,z)+.06,z); UV.push(x/T,z/T); }
          for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){ const a=b+j*(nx+1)+i, c=a+nx+1; IX.push(a,c,a+1,a+1,c,c+1); } }
        const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); geo.setIndex(IX); geo.computeVertexNormals(); geo.computeBoundingSphere();
        const me=new THREE.Mesh(geo,mat(t)); me.receiveShadow=true; me.renderOrder=1; me.userData.landPatch=t; me.userData.mapPub=1; scene.add(me); LAND.pub.push(me); } };
    if(G.length)SYS.onStart(()=>{ (window.LOAD?LOAD('later'):Promise.resolve()).then(build).catch(e=>console.warn('map ground',e)); },'152a-mapground'); }

  const add=r=>{ regions.push(r); make(r); save(); draw(); }; LAND.paint=add;
  LAND.props=()=>gprops; LAND.kinds=()=>Object.keys(MODELS); LAND.groups=()=>GROUPS; LAND.dft=k=>dftScale(k); LAND.pfReady=()=>pfReady();
  LAND.size=k=>{ '@later'; const g=propGeo(k); if(!g)return null; if(!g.boundingBox)g.computeBoundingBox(); const b=g.boundingBox, m=1/.84; return [(b.max.x-b.min.x)*m,(b.max.z-b.min.z)*m,(b.max.y-b.min.y)*m]; };
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
  LAND.up=()=>{ if(painting){ const pts=painting; painting=null; clearPaintPrev(); if(pts.length){ const r={brush:pts,r:brushR,y:paintY,t:type}; add(r); } return; }
    if(!drag)return; const d=drag; drag=null; hidePrev(); const x0=Math.min(d.x0,d.x1),x1=Math.max(d.x0,d.x1),z0=Math.min(d.z0,d.z1),z1=Math.max(d.z0,d.z1);
    if(x1-x0>.3*T&&z1-z0>.3*T){ const r={x0,x1,z0,z1,y:d.y,t:type}; add(r); } };
  Object.defineProperty(LAND,'dragging',{get:()=>!!drag||!!painting});

  const css=document.createElement('style'); css.textContent=`
  #lnd{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));top:12px;width:300px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20;box-sizing:border-box}
  #lnd[hidden]{display:none} #lnd h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #lnd .pane{padding:10px 14px}
  #lnd .dim{color:var(--dim);font-size:10px;line-height:1.5} #lnd .types{display:flex;flex-direction:column;gap:4px;margin:8px 0}
  #lnd .t{display:flex;align-items:center;gap:8px;background:#0e1016;border:2px solid #3a3f4e;color:var(--fg);font:inherit;padding:5px 8px;cursor:pointer;text-align:left} #lnd .t[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #lnd .sw{width:16px;height:16px;border:1px solid #000;flex:0 0 auto} #lnd .row{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap} #lnd .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer} #lnd .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #lnd select{width:100%;font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 6px;margin:6px 0} #lnd .mini{flex:1;min-width:0} #lnd .tp{margin:8px -6px}`;
  document.head.appendChild(css);
  const MB=[['lmbox','box','BOX'],['lmbord','border','BORDER'],['lmdraw','draw','DRAW'],['lmplant','plant','PLANTS'],['lmerase','erase','ERASE']], mb=([id,,n])=>`<button class="btn mini" id="${id}">${n}</button>`;
  const P=document.createElement('div'); P.id='lnd'; P.hidden=true; P.innerHTML=`<h2>LANDSCAPE</h2><div class="pane"><div class="row">${MB.slice(0,3).map(mb).join('')}</div><div class="row">${MB.slice(3).map(mb).join('')}</div><div class="pick"></div><div class="dim hint"></div><div class="tp"></div><div class="dim note"></div></div>`; document.body.appendChild(P);
  const PICK=P.querySelector('.pick'), HINT=P.querySelector('.hint'), NOTE=P.querySelector('.note');
  const LV=TPANE.live({brush:[()=>brushR/T,v=>{ brushR=v*T; }],size:[()=>propS!=null?propS:dftScale(prop),v=>{ propS=v; }],rot:[()=>rot,v=>{ rot=v; }]});
  let bl=null, busy=null;
  const exp=()=>{ const plant=mode==='plant'||mode==='erase', data=plant?gprops.map(serP):regions.map(ser); const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=plant?'garden.json':'landscape.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); };
  const build=async()=>{ '@later'; const pane=await TPANE.make(P.querySelector('.tp')); const bn=(t,id,f)=>{ const b=pane.addButton({title:t}); b.element.querySelector('button').id=id; b.on('click',f); return b; }, bd=(k,o)=>{ const b=pane.addBinding(LV,k,o); b.element.dataset.k=k; return b; };
    bl={pane,brush:bd('brush',{label:'BRUSH (TILES)',min:.5,max:6,step:.5}),size:bd('size',{label:'SIZE',min:.05,max:8,step:.01}),rot:bd('rot',{label:'RAND ROT'}),
      fin:bn('FINISH','lfin',()=>{ if(poly&&poly.length>=3){ const r={poly:poly.slice(),y:polyY,t:type}; add(r); } poly=null; hidePoly(); draw(); }),
      cancel:bn('CANCEL','lcancel',()=>{ poly=null; hidePoly(); draw(); }),
      undo:bn('UNDO LAST','lundo',()=>{ if(mode==='plant'||mode==='erase'){ const o=gprops.pop(); if(o){ unprop(o); saveP(); } } else { const r=regions.pop(); if(r)unmake(r); save(); } draw(); }),
      clear:bn('CLEAR','lclear',()=>{ if(!confirm('Remove all ground patches?'))return; const old=regions.slice(); regions.length=0; for(const r of old)unmake(r); save(); draw(); }),
      clrp:bn('CLEAR PLANTS','lclrp',()=>{ if(!confirm('Remove all placed plants and rocks?'))return; for(const o of gprops)unprop(o); gprops.length=0; saveP(); draw(); }),
      exp:bn('EXPORT','lexp',exp), done:bn('DONE','ldone',()=>LAND.toggle())}; show(); };
  const show=()=>{ const plant=mode==='plant'||mode==='erase';
    bl.brush.hidden=mode!=='draw'; bl.size.hidden=bl.rot.hidden=mode!=='plant'; bl.fin.hidden=bl.cancel.hidden=mode!=='border'; bl.clrp.hidden=!plant;
    bl.fin.title=`FINISH (${poly?poly.length:0})`; bl.clear.title=mode==='plant'?'CLEAR':'CLEAR PATCHES'; bl.exp.title=`EXPORT ${plant?'PLANTS':'LAND'}`; bl.pane.refresh(); };
  function draw(){ '@later'; const ground=mode==='box'||mode==='border'||mode==='draw', plant=mode==='plant'||mode==='erase';
    for(const [id,m] of MB)P.querySelector('#'+id).setAttribute('aria-pressed',mode===m);
    PICK.innerHTML=ground?`<div class="types">${TYPES.map(([k,n,c])=>`<button class="t" data-t="${k}" aria-pressed="${type===k}"><span class="sw" style="background:${c}"></span>${n}</button>`).join('')}</div>`
      :mode==='plant'?`<select id="lsel">${GROUPS.map(([n,ks])=>`<optgroup label="${n}">${ks.map(k=>`<option value="${k}"${prop===k?' selected':''}>${k}</option>`).join('')}</optgroup>`).join('')}</select>`:'';
    HINT.innerHTML=`<div>${{box:'Drag a box on the ground to paint it.',border:'Click points on the ground, then FINISH.',draw:'Hold and drag on the ground to paint.',plant:'Click the ground to place one.',erase:'Click a plant or rock to remove it.'}[mode]}</div><div>${regions.length} patch${regions.length===1?'':'es'} · ${gprops.length} plant${gprops.length===1?'':'s'}</div>`;
    NOTE.textContent=`Walk with WASD while editing. EXPORT writes ${plant?'garden.json':'landscape.json'}; drop it in data/ to ship.`;
    if(bl)show(); else if(!busy)busy=LAND.ready=build().catch(e=>{ busy=null; NOTE.textContent='PANEL DID NOT LOAD: '+e.message; }); }
  const setMode=m=>{ mode=m; drag=null; hidePrev(); painting=null; clearPaintPrev(); if(m!=='border'){ poly=null; hidePoly(); } draw(); };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.dataset.t){ type=b.dataset.t; draw(); return; }
    const m=MB.find(x=>x[0]===b.id); if(m)setMode(m[1]); });
  P.addEventListener('change',e=>{ if(e.target.id==='lsel'){ prop=e.target.value; propS=null; draw(); } });
  LAND.toggle=()=>{ LAND.on=!LAND.on; if(LAND.on)draw(); else { drag=null; hidePrev(); poly=null; hidePoly(); painting=null; clearPaintPrev(); } P.hidden=!LAND.on; };
}
