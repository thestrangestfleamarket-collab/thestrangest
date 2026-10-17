// ---- ONE ATLAS, A FEW MESHES (faster, the same picture): every painted face that doesn't move or cut away is gathered here, its picture
// packed into one big texture (each with a pixel of its own edge round it, so no neighbour bleeds in), and the faces of each kind (lit, glowing,
// unlit, lit like a character, the basin's) merged into one mesh: a handful of draws where there were hundreds ----
const BATCH={items:[],tag:null};
// THE WORLD'S THINGS (for the world editor, src/worldedit.js): each face knows the thing it belongs to (BATCH.tag while a thing is built: its
// place and name), so a double click finds the thing and its faces can be moved, turned, sized, tinted, faded or taken away
const OBJS=[]; const OBJ=(place,name)=>{ const o={id:place+':'+OBJS.length,place,name,parts:[]}; OBJS.push(o); return o; };
BATCH.add=(pos,uv,cv,ecv,kind)=>{ BATCH.items.push({pos,uv,cv,ecv,kind,obj:BATCH.tag}); };
BATCH.build=(make)=>{ const it=BATCH.items; if(!it.length)return; const AW=2048;
  // shelves, tallest first
  const order=it.map((o,i)=>i).sort((a,b)=>it[b].cv.height-it[a].cv.height); let x=0, y=0, sh=0;
  for(const i of order){ const o=it[i], w=o.cv.width+2, h=o.cv.height+2; if(x+w>AW){ x=0; y+=sh; sh=0; } o.ax=x; o.ay=y; x+=w; sh=Math.max(sh,h); }
  const AH=y+sh, atlas=document.createElement('canvas'); atlas.width=AW; atlas.height=AH; const g=atlas.getContext('2d'); g.imageSmoothingEnabled=false;
  const anyE=it.some(o=>o.ecv), eat=anyE?document.createElement('canvas'):null, eg=anyE?(eat.width=AW,eat.height=AH,eat.getContext('2d')):null; if(eg){ eg.imageSmoothingEnabled=false; eg.fillStyle='#000'; eg.fillRect(0,0,AW,AH); }
  const put=(G,cv,ax,ay)=>{ const w=cv.width, h=cv.height; G.drawImage(cv,ax+1,ay+1);   // (the picture, and its own edge pixels again round it)
    G.drawImage(cv,0,0,1,h,ax,ay+1,1,h); G.drawImage(cv,w-1,0,1,h,ax+w+1,ay+1,1,h); G.drawImage(cv,0,0,w,1,ax+1,ay,w,1); G.drawImage(cv,0,h-1,w,1,ax+1,ay+h+1,w,1); };
  for(const o of it){ put(g,o.cv,o.ax,o.ay); if(o.ecv)put(eg,o.ecv,o.ax,o.ay); }
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const map=tex(atlas), emap=eat?tex(eat):null;
  // each kind's faces in one mesh, their corners' places on the atlas
  const kinds={}; for(const o of it)(kinds[o.kind]||(kinds[o.kind]=[])).push(o);
  for(const k in kinds){ const L=kinds[k], P=new Float32Array(L.length*18), U=new Float32Array(L.length*12);
    L.forEach((o,n)=>{ P.set(o.pos,n*18); const w=o.cv.width, h=o.cv.height; for(let q=0;q<6;q++){ const u=o.uv[q*2], v=o.uv[q*2+1]; U[n*12+q*2]=(o.ax+1+u*w)/AW; U[n*12+q*2+1]=1-(o.ay+1+(1-v)*h)/AH; } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.BufferAttribute(U,2)); geo.computeVertexNormals();
    geo.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(L.length*18).fill(1),3)); geo.setAttribute('aOp',new THREE.BufferAttribute(new Float32Array(L.length*6).fill(1),1));
    const mat=make(k,map,emap); BATCH.tintable(mat); const me=new THREE.Mesh(geo,mat); me.userData.objOf=L.map(o=>o.obj); L.forEach((o,n)=>{ if(o.obj)o.obj.parts.push({me,v0:n*6}); }); me.receiveShadow=true; me.castShadow=!!BATCH.cast; scene.add(me); (BATCH.meshes||(BATCH.meshes={}))[k]=me; }   // (cast: the bodega's things throw their lamps' shadows)
  BATCH.stats={faces:it.length,meshes:Object.keys(kinds).length,atlas:AW+'x'+AH}; BATCH.items=[]; };

// a face's tint and how see-through it is (the world editor's): its colour times aCol; aOp under 1 leaves pixels out in a dither, the pixel
// art's way of seeing through (no blending, no soft edges)
BATCH.tintable=m=>{ const prev=m.onBeforeCompile; m.onBeforeCompile=(sh,r)=>{ if(prev)prev(sh,r);
    sh.vertexShader='attribute vec3 aCol; attribute float aOp; varying vec3 vCol; varying float vOp;\n'+sh.vertexShader.replace('void main() {','void main() { vCol=aCol; vOp=aOp;');
    sh.fragmentShader='varying vec3 vCol; varying float vOp;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb*=vCol; if(vOp<.999){ ivec2 q=ivec2(mod(gl_FragCoord.xy,4.)); float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); if((bt[q.x+q.y*4]+.5)/16.>vOp)discard; }`); };
  const k0=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>''; m.customProgramCacheKey=()=>k0()+'|tint'; };
