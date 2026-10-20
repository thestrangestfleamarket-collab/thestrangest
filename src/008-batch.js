const BATCH=window.BATCH={items:[],tag:null};
const OBJS=[]; const OBJ=(place,name)=>{ const o={id:place+':'+OBJS.length,place,name,parts:[]}; OBJS.push(o); return o; };
BATCH.all=(M,k)=>Object.keys(M||{}).filter(q=>q===k||q.startsWith(k+'~')).map(q=>M[q]);
BATCH.add=(pos,uv,cv,ecv,kind)=>{ BATCH.items.push({pos,uv,cv,ecv,kind,obj:BATCH.tag}); };
BATCH.build=(make)=>{ const it=BATCH.items; if(!it.length)return; const AW=2048;
  for(const o of it)if(o.cv.width+2>AW)console.warn('BATCH: a picture '+o.cv.width+' wide, over the atlas ('+AW+'): split it');
  const MAXH=BATCH.MAXH||8192, KS={}; it.forEach((o,i)=>(KS[o.kind]||(KS[o.kind]=[])).push(i)); let x=0, y=0, sh=0, pg=0; const PH=[];
  const fit=(L,x,y,sh)=>{ for(const i of L){ const w=it[i].cv.width+2, h=it[i].cv.height+2; if(x+w>AW){ x=0; y+=sh; sh=0; } if(y+h>MAXH)return false; x+=w; sh=Math.max(sh,h); } return true; };
  for(const k in KS){ const L=KS[k].sort((a,b)=>it[b].cv.height-it[a].cv.height); if(y+sh>0&&!fit(L,x,y,sh)&&fit(L,0,0,0)){ PH[pg]=y+sh; pg++; x=0; y=0; sh=0; }
    for(const i of L){ const o=it[i], w=o.cv.width+2, h=o.cv.height+2; if(x+w>AW){ x=0; y+=sh; sh=0; } if(y+h>MAXH&&y>0){ PH[pg]=y+sh; pg++; x=0; y=0; sh=0; } o.ax=x; o.ay=y; o.pg=pg; x+=w; sh=Math.max(sh,h); } }
  PH[pg]=y+sh; let AHs=[];
  for(let p=0;p<=pg;p++){ const ip=it.filter(o=>o.pg===p); if(!ip.length)continue;
  const AH=PH[p], atlas=document.createElement('canvas'); atlas.width=AW; atlas.height=AH; const AD=new ImageData(AW,AH); AHs.push(AH);
  const anyE=ip.some(o=>o.ecv), eat=anyE?document.createElement('canvas'):null, ED=anyE?new ImageData(AW,AH):null; if(eat){ eat.width=AW; eat.height=AH; for(let q=3;q<ED.data.length;q+=4)ED.data[q]=255; }
  const px=cv=>cv instanceof ImageData?cv.data:cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
  const put=(D,cv,ax,ay)=>{ const w=cv.width, h=cv.height, s=px(cv), A=D.data, ln=(r,c)=>((ay+r)*AW+ax+c)*4;
    for(let r=0;r<h;r++){ const row=s.subarray(r*w*4,(r+1)*w*4); A.set(row,ln(r+1,1)); if(r===0)A.set(row,ln(0,1)); if(r===h-1)A.set(row,ln(h+1,1));
      A.set(s.subarray(r*w*4,r*w*4+4),ln(r+1,0)); A.set(s.subarray((r+1)*w*4-4,(r+1)*w*4),ln(r+1,w+1)); } };
  for(const o of ip){ put(AD,o.cv,o.ax,o.ay); if(o.ecv)put(ED,o.ecv,o.ax,o.ay); }
  atlas.getContext('2d').putImageData(AD,0,0); if(eat)eat.getContext('2d').putImageData(ED,0,0);
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const map=tex(atlas), emap=eat?tex(eat):null;
  const kinds={}; for(const o of ip)(kinds[o.kind]||(kinds[o.kind]=[])).push(o);
  for(const k in kinds){ const L=kinds[k], P=new Float32Array(L.length*18), U=new Float32Array(L.length*12);
    L.forEach((o,n)=>{ P.set(o.pos,n*18); const w=o.cv.width, h=o.cv.height; for(let q=0;q<6;q++){ const u=o.uv[q*2], v=o.uv[q*2+1]; U[n*12+q*2]=(o.ax+1+u*w)/AW; U[n*12+q*2+1]=1-(o.ay+1+(1-v)*h)/AH; } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.BufferAttribute(U,2)); geo.computeVertexNormals();
    geo.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(L.length*18).fill(1),3)); geo.setAttribute('aOp',new THREE.BufferAttribute(new Float32Array(L.length*6).fill(1),1));
    const mat=make(k,map,emap); BATCH.tintable(mat); const me=new THREE.Mesh(geo,mat); PEEK.batch(me,L); me.userData.objOf=L.map(o=>o.obj); L.forEach((o,n)=>{ if(o.obj)o.obj.parts.push({me,v0:n*6,e:!!o.ecv}); }); me.receiveShadow=true; me.castShadow=!!BATCH.cast; scene.add(me); (BATCH.meshes||(BATCH.meshes={}))[p?k+'~'+p:k]=me; } }
  BATCH.stats={faces:it.length,pages:AHs.length,atlas:AHs.map(h=>AW+'x'+h).join(','),split:Object.keys(KS).filter(k=>new Set(KS[k].map(i=>it[i].pg)).size>1)}; (BATCH.log||(BATCH.log=[])).push(BATCH.stats); BATCH.items=[]; };

BATCH.tintable=m=>{ const prev=m.onBeforeCompile; m.onBeforeCompile=(sh,r)=>{ if(prev)prev(sh,r);
    sh.vertexShader='attribute vec3 aCol; attribute float aOp; varying vec3 vCol; varying float vOp;\n'+sh.vertexShader.replace('void main() {','void main() { vCol=aCol; vOp=aOp;');
    sh.fragmentShader='varying vec3 vCol; varying float vOp;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb*=vCol; if(vOp<.999){ if(fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>vOp)discard; }`); if(!m.isMeshBasicMaterial)sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n      totalEmissiveRadiance*=vCol;'); };
  const k0=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>''; m.customProgramCacheKey=()=>k0()+'|tint'; };
const PEEK=window.PEEK={uDP:{x:0,y:0,z:-2,w:.1},uDK:{x:0,y:1,z:1e9,w:0},boxes:[],k:0,on:QS.get('dither')!=='0',ray:new THREE.Ray(),V:new THREE.Vector3(),W:new THREE.Vector3(),H:new THREE.Vector3()};
if(PEEK.on)for(const k of ['lambert','basic']){ const S=THREE.ShaderLib[k]; S.uniforms.uDP={value:PEEK.uDP}; S.uniforms.uDK={value:PEEK.uDK};
  S.vertexShader='attribute float aWl; varying vec4 vDc; varying float vWl, vWy;\n'+S.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vDc=gl_Position; vWl=aWl; vWy=(modelMatrix*vec4(transformed,1.)).y;');
  S.fragmentShader='uniform vec4 uDP, uDK; varying vec4 vDc; varying float vWl, vWy;\nfloat dB2(vec2 a){ a=floor(a); return fract(dot(a,vec2(.5,a.y*.75))); }\n'+S.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
  if(uDK.x>0.&&vWl>1.5&&(vWl<2.5||vWy>uDK.z)){ vec3 dn=vDc.xyz/vDc.w; vec2 dq=dn.xy-uDP.xy; dq.x*=uDK.y; float dr=length(dq)/uDP.w; if(dr<1.&&dn.z<uDP.z&&dB2(gl_FragCoord.xy*.5)*.25+dB2(gl_FragCoord.xy)<uDK.x*(dr<.7?.8:.4))discard; }`); }
PEEK.box=(me,x0,y0,z0,x1,y1,z1)=>{ const e=.7*TILE/.84; PEEK.boxes.push({me,b:new THREE.Box3(new THREE.Vector3(Math.min(x0,x1)-e,Math.min(y0,y1)-e,Math.min(z0,z1)-e),new THREE.Vector3(Math.max(x0,x1)+e,Math.max(y0,y1)+e,Math.max(z0,z1)+e))}); };
PEEK.mark=(g,A)=>{ g.setAttribute('aWl',new THREE.BufferAttribute(A||new Uint8Array(g.attributes.position.count).fill(2),1)); return g; };
PEEK.whole=me=>{ PEEK.mark(me.geometry); me.updateMatrixWorld(); const b=new THREE.Box3().setFromObject(me); if(!b.isEmpty())PEEK.box(me,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z); };
PEEK.batch=(me,L)=>{ const M=TILE/.84, q=.05*TILE, C=6*M, G={}, K=[], V=PEEK.V, grp=(k,v,nx,nz)=>G[k]||(G[k]={v,nx,nz,b:new THREE.Box3(),t0:1e9,t1:-1e9});
  L.forEach((o,n)=>{ const p=o.pos, ax=p[3]-p[0], ay=p[4]-p[1], az=p[5]-p[2], bx=p[6]-p[0], by=p[7]-p[1], bz=p[8]-p[2]; let nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx; const l=Math.hypot(nx,ny,nz); K.push(null); if(l<1e-12||Math.abs(ny/l)>=.15)return; nx/=l; nz/=l;
    const h=Math.hypot(nx,nz); nx/=h; nz/=h; if(nx<-1e-3||(Math.abs(nx)<=1e-3&&nz<0)){ nx=-nx; nz=-nz; } const k='v'+Math.round(nx*40)+','+Math.round(nz*40)+','+Math.round((nx*p[0]+nz*p[2])/q), g=grp(k,1,nx,nz); K[n]=k;
    for(let i=0;i<18;i+=3){ g.b.expandByPoint(V.set(p[i],p[i+1],p[i+2])); const t=-nz*p[i]+nx*p[i+2]; g.t0=Math.min(g.t0,t); g.t1=Math.max(g.t1,t); } });
  for(const k in G){ const g=G[k], b=g.b; g.w=b.max.y-b.min.y>=2.2*M&&g.t1-g.t0>=1.2*M?2:0; }
  L.forEach((o,n)=>{ if(K[n]&&G[K[n]].w)return; const p=o.pos; let y=1e9, x=0, z=0; for(let i=0;i<18;i+=3){ y=Math.min(y,p[i+1]); x+=p[i]/6; z+=p[i+2]/6; } if(y<2.4*M){ K[n]=null; return; }
    const k='r'+Math.floor(x/C)+','+Math.floor(z/C), g=grp(k,0); K[n]=k; for(let i=0;i<18;i+=3)g.b.expandByPoint(V.set(p[i],p[i+1],p[i+2])); });
  let any=false; for(const k in G){ const g=G[k], b=g.b; if(!g.v)g.w=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)>=2*M?3:0; if(g.w){ any=true; PEEK.box(me,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z); } }
  if(!any)return; const A=new Uint8Array(L.length*6); K.forEach((k,n)=>{ if(k)A.fill(G[k].w,n*6,n*6+6); }); PEEK.mark(me.geometry,A); };
PEEK.tick=dt=>{ const on=PEEK.on&&UI.view!=='first'&&!UI.freeCam&&!ED.on&&!ROOMS.cur&&PEEK.boxes.length, M=TILE/.84, c=PEEK.V.set(pos.x,py+1.1*TILE,pos.z), R=PEEK.ray, W=PEEK.W, H=PEEK.H, P=PEEK.uDP, K=PEEK.uDK;
  R.origin.copy(c); if(UI.persp)R.direction.copy(cam.position).sub(c).normalize(); else R.direction.set(0,0,1).applyQuaternion(cam.quaternion);
  let cov=false; if(on){ const far=UI.persp?c.distanceTo(cam.position):1e5; W.copy(c).project(cam); if(far>1.5*M&&Math.abs(W.x)<1.1&&Math.abs(W.y)<1.1&&W.z<1)for(const o of PEEK.boxes){ const me=o.me; if(!me.visible||(me.parent&&!me.parent.visible))continue; if(R.intersectBox(o.b,H)&&H.distanceTo(c)<far){ cov=true; break; } } }
  PEEK.k=Math.max(0,Math.min(1,PEEK.k+(cov?dt:-dt)/.25)); PEEK.cov=cov; K.x=PEEK.k; K.y=RW/RH; K.z=py+2.6*TILE; if(!PEEK.k)return;
  W.copy(c).project(cam); H.set(1,0,0).applyQuaternion(cam.quaternion).multiplyScalar(1.6*M).add(c).project(cam); P.w=Math.max(1e-4,Math.min(.6,Math.hypot((H.x-W.x)*RW/RH,H.y-W.y))); P.x=W.x; P.y=W.y;
  H.copy(c).addScaledVector(R.direction,.5*M).project(cam); P.z=H.z; };
PEEK.stat=()=>({boxes:PEEK.boxes.length,k:PEEK.k,cov:!!PEEK.cov,progs:renderer.info.programs.length});
