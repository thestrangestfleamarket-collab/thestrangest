// ---- ONE ATLAS, A FEW MESHES (faster, the same picture): every painted face that doesn't move or cut away is gathered here, its picture
// packed into one big texture (each with a pixel of its own edge round it, so no neighbour bleeds in), and the faces of each kind (lit, glowing,
// unlit, lit like a character, the basin's) merged into one mesh: a handful of draws where there were hundreds ----
const BATCH={items:[],tag:null};
// THE WORLD'S THINGS (for the world editor, src/worldedit.js): each face knows the thing it belongs to (BATCH.tag while a thing is built: its
// place and name), so a double click finds the thing and its faces can be moved, turned, sized, tinted, faded or taken away
const OBJS=[]; const OBJ=(place,name)=>{ const o={id:place+':'+OBJS.length,place,name,parts:[]}; OBJS.push(o); return o; };
// a kind's meshes on every page of the atlas (a kind can span pages: its later ones are kept as k~1, k~2 ...)
BATCH.all=(M,k)=>Object.keys(M||{}).filter(q=>q===k||q.startsWith(k+'~')).map(q=>M[q]);
BATCH.add=(pos,uv,cv,ecv,kind)=>{ BATCH.items.push({pos,uv,cv,ecv,kind,obj:BATCH.tag}); };
BATCH.build=(make)=>{ const it=BATCH.items; if(!it.length)return; const AW=2048;
  for(const o of it)if(o.cv.width+2>AW)console.warn('BATCH: a picture '+o.cv.width+' wide, over the atlas ('+AW+'): split it');   // (it would run over into its next rows: streaks)
  // shelves, tallest first; a new page (its own atlas) once a page would pass MAXH rows, the graphics card's smallest sure texture size
  // (owner, 18 Oct 2026, the main street three times wider: the street's pictures ran past the 8,192 rows software rendering allows)
  const MAXH=BATCH.MAXH||8192, order=it.map((o,i)=>i).sort((a,b)=>it[b].cv.height-it[a].cv.height); let x=0, y=0, sh=0, pg=0; const PH=[];
  for(const i of order){ const o=it[i], w=o.cv.width+2, h=o.cv.height+2; if(x+w>AW){ x=0; y+=sh; sh=0; } if(y+h>MAXH&&y>0){ PH[pg]=y+sh; pg++; x=0; y=0; sh=0; } o.ax=x; o.ay=y; o.pg=pg; x+=w; sh=Math.max(sh,h); }
  PH[pg]=y+sh; let AHs=[];
  for(let p=0;p<=pg;p++){ const ip=it.filter(o=>o.pg===p); if(!ip.length)continue;
  // (the atlas's pixels set directly, one ImageData, put once: no drawing a face at a time)
  const AH=PH[p], atlas=document.createElement('canvas'); atlas.width=AW; atlas.height=AH; const AD=new ImageData(AW,AH); AHs.push(AH);
  const anyE=ip.some(o=>o.ecv), eat=anyE?document.createElement('canvas'):null, ED=anyE?new ImageData(AW,AH):null; if(eat){ eat.width=AW; eat.height=AH; for(let q=3;q<ED.data.length;q+=4)ED.data[q]=255; }
  const px=cv=>cv instanceof ImageData?cv.data:cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
  const put=(D,cv,ax,ay)=>{ const w=cv.width, h=cv.height, s=px(cv), A=D.data, ln=(r,c)=>((ay+r)*AW+ax+c)*4;   // (the picture, and its own edge pixels again round it)
    for(let r=0;r<h;r++){ const row=s.subarray(r*w*4,(r+1)*w*4); A.set(row,ln(r+1,1)); if(r===0)A.set(row,ln(0,1)); if(r===h-1)A.set(row,ln(h+1,1));
      A.set(s.subarray(r*w*4,r*w*4+4),ln(r+1,0)); A.set(s.subarray((r+1)*w*4-4,(r+1)*w*4),ln(r+1,w+1)); } };
  for(const o of ip){ put(AD,o.cv,o.ax,o.ay); if(o.ecv)put(ED,o.ecv,o.ax,o.ay); }
  atlas.getContext('2d').putImageData(AD,0,0); if(eat)eat.getContext('2d').putImageData(ED,0,0);
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const map=tex(atlas), emap=eat?tex(eat):null;
  // each kind's faces in one mesh, their corners' places on the atlas
  const kinds={}; for(const o of ip)(kinds[o.kind]||(kinds[o.kind]=[])).push(o);
  for(const k in kinds){ const L=kinds[k], P=new Float32Array(L.length*18), U=new Float32Array(L.length*12);
    L.forEach((o,n)=>{ P.set(o.pos,n*18); const w=o.cv.width, h=o.cv.height; for(let q=0;q<6;q++){ const u=o.uv[q*2], v=o.uv[q*2+1]; U[n*12+q*2]=(o.ax+1+u*w)/AW; U[n*12+q*2+1]=1-(o.ay+1+(1-v)*h)/AH; } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.BufferAttribute(U,2)); geo.computeVertexNormals();
    geo.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(L.length*18).fill(1),3)); geo.setAttribute('aOp',new THREE.BufferAttribute(new Float32Array(L.length*6).fill(1),1));
    const mat=make(k,map,emap); BATCH.tintable(mat); const me=new THREE.Mesh(geo,mat); me.userData.objOf=L.map(o=>o.obj); L.forEach((o,n)=>{ if(o.obj)o.obj.parts.push({me,v0:n*6,e:!!o.ecv}); }); me.receiveShadow=true; me.castShadow=!!BATCH.cast; scene.add(me); (BATCH.meshes||(BATCH.meshes={}))[p?k+'~'+p:k]=me; } }   // (cast: the bodega's things throw their lamps' shadows)
  BATCH.stats={faces:it.length,pages:AHs.length,atlas:AHs.map(h=>AW+'x'+h).join(',')}; BATCH.items=[]; };

// a face's tint and how see-through it is (the world editor's): its colour times aCol (its glow too: a lamp switched off, use.js); aOp under 1 leaves pixels out in a dither, the pixel
// art's way of seeing through (no blending, no soft edges)
BATCH.tintable=m=>{ const prev=m.onBeforeCompile; m.onBeforeCompile=(sh,r)=>{ if(prev)prev(sh,r);
    sh.vertexShader='attribute vec3 aCol; attribute float aOp; varying vec3 vCol; varying float vOp;\n'+sh.vertexShader.replace('void main() {','void main() { vCol=aCol; vOp=aOp;');
    sh.fragmentShader='varying vec3 vCol; varying float vOp;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb*=vCol; if(vOp<.999){ if(fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>vOp)discard; }`); if(!m.isMeshBasicMaterial)sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n      totalEmissiveRadiance*=vCol;'); };   // (an unlit one has no glow of its own to tint: its colour is tinted above)
  const k0=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>''; m.customProgramCacheKey=()=>k0()+'|tint'; };
