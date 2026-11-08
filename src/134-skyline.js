// THE SKYLINE: FAR3 builds the far city skyline, the fog and the distance haze.
import {SHARED, THREE} from './003-shx.js';
import {BLK, CLOCK, CULL, FAR3, PARK, pos, SKY, VIS, WX} from './003b-systems.js';
import {renderer, RH, RW, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {LEVEL, MAPG, MISTB, MISTE, MISTF, MODS, OUT, PFAR, QS, RING, SECTION, SECTIONS, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {RINGX} from './065-ring.js';
import {TPANE} from './087dz-tpane.js';

{ const q=QS.get('far'); let on=q!=='0';
  const HAZE0=26, HAZE1=q&&+q>0?+q:560;
  const FOG=new THREE.Fog(0x8fa3c0,1,2), fc=new THREE.Color(), pale=new THREE.Color(.74,.84,.98), navy=new THREE.Color(.08,.1,.17), V=new THREE.Vector3();
  FAR3.on=on; FAR3.fog=FOG; window.FAR3=FAR3;
  const mq=QS.get('mist'), mv=(mq||'').split(',').map(Number); let mist=mq!=null&&mq!=='0';
  const MIST0=mv.length===2&&mv.every(isFinite)?mv[0]:40, MIST1=mv.length===2&&mv.every(isFinite)?mv[1]:20, MD=new THREE.Color(0x3a6e68), MN=new THREE.Color(0x152d2c), MH=new THREE.Color(0x4a7f79);
  FAR3.mist=mist;
  const FL0={corner:4,m0:MIST0,m1:MIST1,md:.5,hn:.3,hf:.55,hd:170,hs:8,dt:.45,wn:.12,wd:.02,bl:0,br:1,cov:.47,cl:1.16,zk:.62,hk:.5}, FL={...FL0}; try{ const s=JSON.parse(SAVE.get('farlook')||'{}'); if(s.corner!==3){ if(s.corner!==2){ delete s.m0; delete s.m1; } delete s.hn; delete s.hf; s.corner=3; } if(s.corner!==4){ delete s.bl; s.corner=4; } Object.assign(FL,s); }catch(e){} FAR3.FL=FL; FAR3.FL0=FL0;
  FAR3.frameTris=()=>new Promise(res=>{ const I=renderer.info; I.autoReset=false; requestAnimationFrame(()=>{ I.reset(); requestAnimationFrame(()=>{ const r={tris:I.render.triangles,calls:I.render.calls,culled:0}; I.autoReset=true; res(r); }); }); });
  const LR=MODS.landR, SA=SECTIONS.live; FAR3.land=[Math.min(LR.x0*TILE,(SA.x0-72)*TILE),Math.min(LR.z0*TILE,(SA.y0+77)*TILE),Math.max(LR.x1*TILE,(SA.x1-72)*TILE),Math.max(LR.z1*TILE,(SA.y1+77)*TILE)]; const hs=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); }, B=[];
  for(let i=B.length-1;i>=0;i--){ const b=B[i]; if(RINGX.inPocket(b[0]*TILE,b[1]*TILE,(Math.max(b[2],b[3])/2+10)*TILE))B.splice(i,1); }
  // the new map's backdrop (owner, 6 Nov 2026: "they see more apt buildings until it fades out"): past the edges, apartment blocks carry on the streets (data/world.json edge.runs: axis, from, to, across from, across to, in map tiles), drawn and hazed as the far city is
  for(const [ax,a0,a1,b0,b1] of (LEVEL.edge&&LEVEL.edge.runs)||[]){ const dir=Math.sign(a1-a0), d=b1-b0; let p=a0+dir*((LEVEL.edge.near||60)+1.2), k=0;   // (the first stretch past the edge is the street's own blocks, 069a)
    while((a1-p)*dir>0){ const w=14+hs(k,81+a0)*8, h=14+hs(k,82+a0)*16, c=p+dir*w/2, mx=ax==='x'?c:(b0+b1)/2, my=ax==='x'?(b0+b1)/2:c;
      B.push([mx-SHARED.BOD.OX,my-SHARED.BOD.OY,ax==='x'?w:d,ax==='x'?d:w,h,null,[0,1,4,6][Math.floor(hs(k,83+a0)*4)]]); p+=dir*(w+1.2); k++; } }
  // the city past the map (owner, 8 Nov 2026: "the city should go on forever on exterior of map"; "other side should be endless buildings"): blocks on a street grid round the park's ring and across the Hudson out to the far plane, the rows along the river both ways; further out one box stands for half a block, a block, then two by two and four by four (data/world.json edge.city)
  const CY=LEVEL.edge&&LEVEL.edge.city; if(CY){ const OX=SHARED.BOD.OX, OY=SHARED.BOD.OY, RG=LEVEL.sections.ring, O=RG.outer, R=CY.reach, [GX,AV,GY,STW]=CY.grid, A=CY.home, SH=CY.shore-(CY.walk||0), [D0,D1,D2,D3]=CY.lod;
    const keep=(LEVEL.edge.runs||[]).map(([ax,a0,a1,b0,b1])=>ax==='x'?[Math.min(a0,a1),b0,Math.max(a0,a1),b1]:[b0,Math.min(a0,a1),b1,Math.max(a0,a1)]).concat(CY.keep||[]);
    const hit=(x0,y0,x1,y1)=>keep.some(r=>x0<r[2]&&x1>r[0]&&y0<r[3]&&y1>r[1]), dA=(x0,y0,x1,y1)=>Math.max(A[0]-x1,x0-A[2],A[1]-y1,y0-A[3],0);
    const put=(x0,y0,x1,y1,h,v)=>B.push([(x0+x1)/2-OX,(y0+y1)/2-OY,x1-x0,y1-y0,h,null,v]);
    const bld=(x0,y0,x1,y1,k,tw,lo,hi,far)=>{ const r=hs(x0*.37+y1,k), v=[0,1,4,6,2,5,3,7][Math.floor(hs(y0,x1+k)*8)];
      if(r<tw){ const h=90+hs(x1,k+3)*150, w=x1-x0, d=y1-y0, cx=(x0+x1)/2, cy=(y0+y1)/2; put(x0,y0,x1,y1,h*.45,v); (far?[[.5,1]]:[[.8,.75],[.6,.92],[.42,1]]).forEach(([s,f])=>put(cx-w*s/2,cy-d*s/2,cx+w*s/2,cy+d*s/2,h*f,v)); if(!far&&hs(cx,k+5)<.5)put(cx-.8,cy-.8,cx+.8,cy+.8,h*1.18,5); return; }
      put(x0,y0,x1,y1,lo+Math.pow(hs(x0,y0+k),1.6)*(hi-lo),v); };
    const block=(x0,y0,x1,y1,d,k)=>{ if(d<D0){ const along=x1-x0>=y1-y0; let p=along?x0:y0; const e=along?x1:y1, md=along?(y0+y1)/2:(x0+x1)/2; let n=0;
        while(e-p>1){ const w=Math.min(e-p,8+hs(p,k+n)*8), q=e-(p+w)<5?e:p+w; for(const [a,b] of along?[[y0,md],[md,y1]]:[[x0,md],[md,x1]])along?bld(p,a,q,b,k+n,.04,14,52):bld(a,p,b,q,k+n,.04,14,52); p=q; n++; } return; }
      if(d<D1){ const mx=(x0+x1)/2; bld(x0,y0,mx,y1,k,.06,16,56); bld(mx,y0,x1,y1,k+1,.06,16,56); return; }
      bld(x0+.5,y0+.5,x1-.5,y1-.5,k,.06,18,60,1); };
    const region=(xa,sx,ya,sy,cl,k0)=>{ for(let i=0;;i++){ const ax=xa+sx*i*GX, bx=xa+sx*((i+1)*GX-AV), x0=Math.max(cl[0],Math.min(ax,bx)), x1=Math.min(cl[2],Math.max(ax,bx)); if(x1<=x0)break; if(dA(x0,cl[1],x1,cl[3])>R)break;
        for(let j=0;;j++){ const ay=ya+sy*j*GY, by=ya+sy*((j+1)*GY-STW), y0=Math.max(cl[1],Math.min(ay,by)), y1=Math.min(cl[3],Math.max(ay,by)); if(y1<=y0)break; const d=dA(x0,y0,x1,y1); if(d>R)break;
          const m=d<D2?1:d<D3?2:d<D3*2?4:8; if(m>1){ if(i%m||j%m)continue; const fx=xa+sx*((i+m)*GX-AV), fy=ya+sy*((j+m)*GY-STW), X0=Math.max(cl[0],Math.min(ax,fx)), X1=Math.min(cl[2],Math.max(ax,fx)), Y0=Math.max(cl[1],Math.min(ay,fy)), Y1=Math.min(cl[3],Math.max(ay,fy)); if(!hit(X0,Y0,X1,Y1))bld(X0+1,Y0+1,X1-1,Y1-1,k0+i*7+j,.06,22,70,1); continue; }
          if(!hit(x0,y0,x1,y1))block(x0,y0,x1,y1,d,k0+i*131+j*17); } } };
    region(O.x0,-1,CY.south,1,[-R*2,CY.south,O.x0,R*2],1); region(O.x1,1,CY.south,1,[O.x1,CY.south,R*2,R*2],2); region(O.x0,1,O.y1,1,[O.x0,O.y1,O.x1,R*2],3);
    region(O.x0,-1,SH,-1,[-R*2,-R*2,O.x0,SH],4); region(O.x0,1,SH,-1,[O.x0,-R*2,R*2,SH],5);
    for(const [y0,y1,lo,hi,k] of CY.rows)for(const s of [-1,1]){ let p=s<0?A[0]:A[2], n=0; while(true){ const d=Math.abs(p-(s<0?A[0]:A[2])); if(d>R)break; const w=(d<D1?10:d<D2?30:90)+hs(p,k+n)*(d<D1?8:20), x0=s<0?p-w:p, x1=s<0?p:p+w;
        if(!hit(x0,y0,x1,y1))bld(x0,y0,x1,y1,k+n,d<D1?0:.03,lo,hi); p+=s*(w+.3); n++; } }
    FAR3.city=B.length; }
  // stand-ins past the draw distance (owner, 7 Nov 2026: "you shouldnt see gaps like no buildings, gap between buildings ... the further away the more faded"): every building on the rows and up West St and every near backdrop block has a hazed box a little inside it, seen once the real one is past the draw distance
  { const ZT=ZU/TILE, HPX={apts:480,bank:196,art:196,hotel:240,theatre:200,play:200}, IN=.6, sb=(x0,y0,x1,y1,h,v)=>{ const w=x1-x0-2*IN, d=y1-y0-2*IN; if(w>1&&d>1)B.push([(x0+x1)/2-SHARED.BOD.OX,(y0+y1)/2-SHARED.BOD.OY,w,d,h,null,v]); };
    for(const p of LEVEL.places){ if(p.kind!=='front')continue; const y0=p.y1!=null?p.y0:LEVEL.block.back, y1=p.y1!=null?p.y1:LEVEL.block.front, px=HPX[p.id]||(p.row===2?110:150); sb(p.x0,y0,p.x1,y1,px*ZT*.92,p.row===2?[1,2,5,6][Math.floor(hs(p.x0,97)*4)]:[0,4][Math.floor(hs(p.x0,98)*2)]); }
    for(const o of BLK.back||[])if(o.h)sb(o.x0,o.y0,o.x1,o.y1,o.h*ZT*.95,[0,4,1,6][o.k%4]); }
  const FW=16, FH=10, NV=8, atlas=new Uint8Array(FW*FH*NV*4), hp=(a,b)=>{ const v=Math.sin(a*91.7+b*47.3)*43758.5453; return v-Math.floor(v); };
  const WALL=[[128,60,48],[96,66,52],[118,118,114],[176,162,134],[122,56,44],[150,155,162],[168,132,96],[196,184,156]];
  for(let v=0;v<NV;v++)for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){ const k=((v*FH+y)*FW+x)*4, w=WALL[v], n=.9+hp(x+v*7,y)*.18; let c=[w[0]*n,w[1]*n,w[2]*n], a=0;
    if(v!==2&&v!==3&&(y===0))c=c.map(q=>q*.82);
    const inW=v===5?(x%2===1&&y>=1&&y<=8):(x>=2&&x<=5||x>=10&&x<=13)&&y>=2&&y<=7; if(inW){ c=[40,48,60]; a=255; if(v!==5&&(y===2||x===2||x===10))c=[52,60,74]; }
    if(y===8&&(x>=1&&x<=6||x>=9&&x<=14))c=v===3?[200,190,166]:[150,146,138];
    if(v===2&&(x===0||x===8))c=c.map(q=>q*.86);
    if(v===4){ if(y===9)c=[22,22,24]; if(y===6&&x%2===0)c=[30,30,32]; if((x+y)%7===0&&y<9&&x>6&&x<11)c=[26,26,28]; }
    atlas[k]=c[0]; atlas[k+1]=c[1]; atlas[k+2]=c[2]; atlas[k+3]=a; }
  const AVG=[],WIN=[]; for(let v=0;v<NV;v++){ let r=0,g=0,b=0,w=0; for(let i=0;i<FW*FH;i++){ const k=(v*FW*FH+i)*4; r+=atlas[k]; g+=atlas[k+1]; b+=atlas[k+2]; w+=atlas[k+3]>127?1:0; } const n=FW*FH; AVG.push(new THREE.Color().setRGB(r/n/255,g/n/255,b/n/255,THREE.SRGBColorSpace)); WIN.push(w/n); }
  const ftex=new THREE.DataTexture(atlas,FW,FH*NV); ftex.magFilter=ftex.minFilter=THREE.NearestFilter; ftex.colorSpace=THREE.SRGBColorSpace; ftex.flipY=false; ftex.needsUpdate=true;
  const FU={uBake:{value:0},uAvg:{value:AVG},uWin:{value:WIN},uMC:{value:new THREE.Color()},uMK:{value:0},uMP:{value:new THREE.Vector3()},uFT:{value:ftex},uLit:{value:0},uAmb:{value:0},uBay:{value:3*TILE},uStorey:{value:3.2*TILE},uY0:{value:-.5*ZU},uTW:{value:0},uBX:{value:MISTB},uTL:{value:TILE},uHN:{value:.2},uHF:{value:.82},uHD:{value:170},uNR:{value:150*TILE},uHS:{value:8},uDT:{value:.45}};
  const FARIMG=null, BAKE=QS.get('farbake')==='1', FARON=!!FARIMG&&!BAKE&&QS.get('farbaked')!=='0';
  const outPast=([x,z])=>Math.max(LR.x0-x,x-LR.x1,LR.z0-z,z-LR.z1), south=([x,z])=>z<LR.z0+20&&LR.z0+20-z>LR.x0-x&&LR.z0+20-z>x-LR.x1, BN=B.filter(b=>!(FARON&&outPast(b)>=40)&&!(FARON&&south(b))&&!(mist&&outPast(b)<10&&((b[0]*TILE>PFAR.x&&b[1]*TILE>MISTB.w)||(b[1]*TILE>PFAR.y&&b[0]*TILE>MISTB.z)))), BF=B.filter(b=>outPast(b)>=40);
  const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), mat=new THREE.MeshLambertMaterial({color:0xffffff}), m4=new THREE.Matrix4(), c=new THREE.Color(), y0=-.5*ZU;
  const mk=L=>{ const g=geo.clone(), m=new THREE.InstancedMesh(g,mat,L.length), aV=new Float32Array(L.length), aS=new Float32Array(L.length);
    L.forEach(([x,z,sx,sz,h,col,fv],i)=>{ const j=i; m.setMatrixAt(i,m4.makeScale(sx*TILE,h*TILE,sz*TILE).setPosition(x*TILE,y0,z*TILE)); m.setColorAt(i,c.setRGB(1,1,1)); aV[i]=fv!=null?fv:Math.floor(hs(j,9)*NV); aS[i]=hs(j,11)*97; });
    g.setAttribute('aV',new THREE.InstancedBufferAttribute(aV,1)); g.setAttribute('aS',new THREE.InstancedBufferAttribute(aS,1)); return m; };
  const me=mk(BN);
  mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,FU);
    sh.vertexShader='attribute float aV; attribute float aS; varying float vFV,vFS; varying vec3 vFW,vFN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vec4 fw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\n fw=instanceMatrix*fw;\n#endif\n fw=modelMatrix*fw; vFW=fw.xyz; vFN=normalize(mat3(modelMatrix)*objectNormal); vFV=aV; vFS=aS;');
    sh.fragmentShader='uniform vec3 uMC,uMP; uniform float uMK; uniform sampler2D uFT; uniform float uLit,uBay,uStorey,uY0,uAmb,uTW,uTL,uHN,uHF,uHD,uHS,uDT,uNR; uniform vec4 uBX; uniform float uBake; uniform vec3 uAvg[8]; uniform float uWin[8]; varying float vFV,vFS; varying vec3 vFW,vFN; float fLit=0.;\n float pastK(){ vec2 q=vFW.xz/uTL; float d=max(max(uBX.x/uTL-q.x,q.x-uBX.z/uTL),max(uBX.y/uTL-q.y,q.y-uBX.w/uTL)); return clamp((d-3.)/uHD,0.,1.); }\n'+sh.fragmentShader
      .replace('#include <color_fragment>',`#include <color_fragment>
 { vec3 an=abs(vFN); if(an.y>.5){ diffuseColor.rgb=vec3(.16,.16,.17); } else {
     float u=(an.x>an.z?vFW.z:vFW.x)/(uBay*2.), v=(vFW.y-uY0)/uStorey; vec2 f=vec2(fract(u),1.-fract(v));
     vec4 t=texture2D(uFT,vec2((floor(f.x*16.)+.5)/16.,(floor(vFV)*10.+floor(f.y*10.)+.5)/80.)); diffuseColor.rgb=t.rgb; float pk=uMK>0.?pastK():0.; if(pk>0.){ vec3 wc=texture2D(uFT,vec2(.5/16.,(floor(vFV)*10.+9.5)/80.)).rgb; diffuseColor.rgb=mix(t.rgb,wc,floor(pk*4.+.5)/4.*.85); t.a*=step(pk,uDT); }
     if(t.a>.5){ float bay=floor(u*2.+(an.x>an.z?3.:0.)), h=fract(sin(dot(vec3(bay,floor(v),vFS+floor(uTW+fract(bay*.37+floor(v)*.61)*7.)*1.7),vec3(12.9898,78.233,37.719)))*43758.5453); fLit=step(h,uLit); }
     float tp=max(fwidth(u*16.),fwidth(v*10.)), aa=smoothstep(.12,.4,tp); int fi=int(floor(vFV)); if(aa>0.){ diffuseColor.rgb=mix(diffuseColor.rgb,uAvg[fi],aa); fLit=mix(fLit,uLit*uWin[fi],aa); } } }`)
      .replace('#include <fog_fragment>',`if(uMK<=0.){
#include <fog_fragment>
} else { float fd=distance(vFW.xz,uMP.xz); gl_FragColor.rgb=mix(gl_FragColor.rgb,uMC,mix(uHN,uHF,pastK())*smoothstep(0.,uNR,distance(vFW.xz,cameraPosition.xz))); }
`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=fLit*vec3(1.,.82,.5)*.9+diffuseColor.rgb*uAmb;').replace('#include <dithering_fragment>','#include <dithering_fragment>\n if(uBake>.5) gl_FragColor=vec4(pastK(),0.,0.,1.);'); };
  mat.customProgramCacheKey=()=>'skylinefronts';
  const FSP=BN.map(([x,z,sx,sz,h])=>new THREE.Sphere(new THREE.Vector3(x*TILE,y0+h*TILE/2,z*TILE),Math.hypot(sx,sz,h)*TILE/2));
  me.frustumCulled=false; me.visible=on; me.userData.noMirror=1; (MAPG.bodega||scene).add(me); FAR3.mesh=me; FAR3.n=BN.length; FAR3.tris=BN.length*12; FAR3.FU=FU;
  const CX=(LR.x0+LR.x1)/2*TILE, CZ=(LR.z0+LR.z1)/2*TILE, EYE=1.9, V0=Math.tan(-2*Math.PI/180), V1=Math.tan(30*Math.PI/180), DIRS=[[0,1],[1,0],[0,-1],[-1,0]];
  if(BAKE){ const fm=mk(BF); fm.frustumCulled=false; FAR3.farMesh=fm;
    FAR3.bake=(dens,pk)=>{ '@later'; const N=Math.round(90*dens), rt=new THREE.WebGLRenderTarget(N,N,{type:THREE.FloatType}), camB=new THREE.PerspectiveCamera(90,1,1,20000), r0=Math.floor((V0+1)/2*N), r1=Math.ceil((V1+1)/2*N), H=r1-r0, out=new Float32Array(N*4*H*4), buf=new Float32Array(N*N*4);
      const kept=[]; scene.traverse(o=>{ if(o!==scene&&!o.isLight&&o.visible&&o.parent===scene){ kept.push(o); o.visible=false; } }); scene.add(fm); const fog=scene.fog, bg=scene.background, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), mk0=FU.uMK.value;
      scene.fog=null; scene.background=null; renderer.setClearColor(0,0); FU.uMK.value=0; FU.uBake.value=pk?1:0; const lce=renderer.localClippingEnabled; renderer.localClippingEnabled=false;
      DIRS.forEach(([dx,dz],f)=>{ camB.position.set(CX,EYE,CZ); camB.up.set(0,1,0); camB.lookAt(CX+dx,EYE,CZ+dz); camB.updateMatrixWorld();
        renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene,camB); renderer.readRenderTargetPixels(rt,0,0,N,N,buf);
        for(let y=0;y<H;y++)for(let x=0;x<N;x++){ const s4=((r0+y)*N+x)*4, d4=((H-1-y)*N*4+f*N+x)*4; for(let k=0;k<4;k++)out[d4+k]=buf[s4+k]; } });
      renderer.setRenderTarget(null); renderer.localClippingEnabled=lce; scene.remove(fm); kept.forEach(o=>o.visible=true); scene.fog=fog; scene.background=bg; renderer.setClearColor(cc,ca); FU.uMK.value=mk0; FU.uBake.value=0; rt.dispose();
      return {W:N*4,H,data:Array.from(out),meta:{R:0,CX,CZ,EYE,V0,V1,N,dens}}; }; }
  let pan=null; if(FARON){ const M=FARIMG.meta, Rr=(Math.min(LR.x1-LR.x0,LR.z1-LR.z0)/2+38)*TILE, pos=[], uv=[], idx=[];
    DIRS.forEach(([dx,dz],f)=>{ const rx=-dz, rz=dx, n=dz<0?3:1;
      for(let i=0;i<n;i++){ const b=pos.length/3; for(const [u,v] of [[0,0],[1,0],[1,1],[0,1]]){ const t=(u+i)/n*2-1, vy=(v?M.V1:M.V0)/n; pos.push(M.CX+dx*Rr+rx*t*Rr,EYE+vy*Rr,M.CZ+dz*Rr+rz*t*Rr); uv.push(((f%(M.faces||4))+u)/(M.faces||4),v); }
        idx.push(b,b+1,b+2,b,b+2,b+3); } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
    const tl=new THREE.TextureLoader(), tx=u=>{ const t=tl.load(u); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; }, TD=tx(FARIMG.day), TN=tx(FARIMG.night), PU={uN:{value:TN},uNK:{value:0}};
    const pm=new THREE.MeshBasicMaterial({map:TD,alphaTest:.5,fog:true,toneMapped:true});
    pm.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,PU,{uMC:FU.uMC,uMK:FU.uMK,uHN:FU.uHN,uHF:FU.uHF});
      sh.fragmentShader='uniform sampler2D uN; uniform float uNK,uMK,uHN,uHF; uniform vec3 uMC;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,texture2D(uN,vMapUv).rgb,uNK);')
        .replace('#include <fog_fragment>','if(uMK<=0.){\n#include <fog_fragment>\n} else gl_FragColor.rgb=mix(gl_FragColor.rgb,uMC,mix(uHN,uHF,texture2D(uN,vMapUv).a));\n#ifdef USE_FOG\n gl_FragColor.rgb=mix(gl_FragColor.rgb,uMK>0.?uMC:fogColor,1.-smoothstep(.04,.45,vMapUv.y));\n#endif'); };   // whole haze at the panels' foot: the city rises out of the haze
    pm.customProgramCacheKey=()=>'farpanels'; pan=new THREE.Mesh(g,pm); pan.userData.noMirror=1; pan.frustumCulled=false; pan.renderOrder=-1; pan.visible=on; (MAPG.bodega||scene).add(pan); FAR3.panels=pan; FAR3.PU=PU;
    { const home=SECTION.id; SYS.add('places',()=>VIS.hide(pan,'section',SHARED.LVL==='up'&&SECTIONS.at(SHARED.BOD.MX(pos.x),SHARED.BOD.MY(pos.z))!==home),'134-panels'); } }
  // the near backdrop past the edges takes the same haze, so nothing jumps where the draw distance hands it to the stand-ins (owner, 7 Nov 2026: "the change in fade shouldnt be so sudden ... more gradual")
  { const HZ=m=>{ if(m.userData.hz)return; m.userData.hz=1; m.onBeforeCompile=sh=>{ for(const k of ['uMC','uMK','uHN','uHF','uHD','uBX','uTL','uNR'])sh.uniforms[k]=FU[k];
      sh.vertexShader='varying vec3 vHW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\n vHW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\n vHW=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif');
      sh.fragmentShader='varying vec3 vHW; uniform vec3 uMC; uniform float uMK,uHN,uHF,uHD,uTL,uNR; uniform vec4 uBX;\n'+sh.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\n if(uMK>0.){ vec2 q=vHW.xz/uTL; float d=max(max(uBX.x/uTL-q.x,q.x-uBX.z/uTL),max(uBX.y/uTL-q.y,q.y-uBX.w/uTL)); gl_FragColor.rgb=mix(gl_FragColor.rgb,uMC,mix(uHN,uHF,clamp((d-3.)/uHD,0.,1.))*smoothstep(0.,uNR,distance(vHW.xz,cameraPosition.xz))); }'); };
      m.customProgramCacheKey=()=>'nearhaze'+(m.map?1:0); m.needsUpdate=true; };
    scene.traverse(o=>{ if(o.userData.haze&&o.material)for(const m of [].concat(o.material))HZ(m); }); }
  let TM=null; if(!PARK.noTrees){ const RB=RINGX.bound, T=TILE, P=[], out=(x,z)=>B.some(([bx,bz,sx,sz])=>Math.abs(x/T-bx)<sx/2+1.5&&Math.abs(z/T-bz)<sz/2+1.5);
    const TFAR=8*T, TSC=.2, wet=Math.max(SHARED.BOD.ZS(RING.river.y0),SHARED.BOD.ZS(RING.river.y1)); for(const [k,[ax,fx,a0,a1]] of [['x',RB.z0-TFAR,RB.x0-6*T,RB.x1+6*T],['x',RB.z1+TFAR,RB.x0-6*T,RB.x1+6*T],['z',RB.x0-TFAR,RB.z0,RB.z1],['z',RB.x1+TFAR,RB.z0,RB.z1]].entries()){ const sg=k%2?1:-1;
      for(let a=a0;a<a1;a+=(2.6+hs(a,k+80)*1.6)*T){ const off=sg*(hs(a,k+81)*4)*T, x=ax==='x'?a:fx+off, z=ax==='x'?fx+off:a; if(out(x,z)||RINGX.inPocket(x,z,10*T)||z<wet)continue; P.push([x,z,(2.2+hs(a,k+82)*1.4)*T*TSC,(5+hs(a,k+83)*4)*T*TSC,hs(a,k+84)]); } }
    const geo=new THREE.IcosahedronGeometry(1,0), mt=new THREE.MeshLambertMaterial({color:0x2e4a2a,flatShading:true}); TM=new THREE.InstancedMesh(geo,mt,P.length*2); const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
    P.forEach(([x,z,r,h,g],i)=>{ m4.compose(new THREE.Vector3(x,h-r*.7,z),q.setFromEuler(new THREE.Euler(0,g*6,0)),new THREE.Vector3(r,r*1.1,r)); TM.setMatrixAt(i*2,m4); TM.setColorAt(i*2,c.setHSL(.27+g*.06,.32,.2+g*.08));
      m4.compose(new THREE.Vector3(x+(g-.5)*r,h*.55,z+(g-.4)*r),q,new THREE.Vector3(r*.8,r*.9,r*.8)); TM.setMatrixAt(i*2+1,m4); TM.setColorAt(i*2+1,c.setHSL(.25+g*.05,.3,.17+g*.06)); });
    TM.computeBoundingSphere(); TM.receiveShadow=false; (MAPG.bodega||scene).add(TM); FAR3.trees=TM; FAR3.treeN=P.length; }
  SYS.add('sky',(dt)=>{
    const up=SHARED.LVL!=='down', inside=!OUT.open; me.visible=FAR3.on&&up; if(TM){ TM.visible=up; TM.material.color.setRGB(1,1,1); } if(pan){ pan.visible=me.visible; } if(me.visible&&!CULL.seen(FSP))me.visible=false; if(pan){ FAR3.PU.uNK.value=Math.max(0,Math.min(1,(FU.uLit.value-FL.wd)/Math.max(1e-3,FL.wn-FL.wd))); }
    FU.uHN.value=0; FU.uHF.value=0;   // no haze at all, near or far (owner, 7 Nov 2026: "lets remove haze from the game completeley")
    FU.uHD.value=FL.hd; FU.uHS.value=Math.round(FL.hs); FU.uDT.value=FL.dt; if(SKY.U.uCov){ SKY.U.uZk.value=FL.zk; SKY.U.uHk.value=FL.hk; }
    FU.uLit.value=FL.wd+(FL.wn-FL.wd)*Math.max(0,Math.min(1,(1-CLOCK.elev())/6)); FU.uTW.value=performance.now()/1000/23;
    FU.uAmb.value=.55*Math.max(0,Math.min(1,(CLOCK.elev()+3)/12));
    if(SKY.U.uBelow){ const dk=Math.max(0,Math.min(1,(CLOCK.elev()+4)/14)); SKY.U.uBelow.value.setRGB(.03+.17*dk,.034+.166*dk,.045+.165*dk); SKY.U.uBelowK.value=FAR3.on&&up?1:0; }
    FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(!FAR3.on||inside||!up||(scene.fog&&scene.fog!==FOG)){ if(scene.fog===FOG)scene.fog=null; return; }
    const day=Math.max(0,Math.min(1,(CLOCK.elev()+4)/14)), d=-V.copy(pos).applyMatrix4(SHARED.cam.matrixWorldInverse).z;
    if(FAR3.mist){ const k=Math.max(0,Math.min(1,(CLOCK.elev()+6)/12)); FOG.color.copy(MN).lerp(MD,k).lerp(MH,Math.max(0,Math.min(1,(CLOCK.elev()-6)/40))); { const Wn=WX.now||{cloud:.2}, dk=Math.max(0,Math.min(1,(CLOCK.elev()-3)/10))*(1-Math.max(0,Math.min(1,(Wn.cloud-.4)/.5))); FOG.color.lerp(SKY.U.uH.value,Math.max(SKY.SC&&SKY.SC.sky?SKY.SC.sky*.45:0,dk*.6)); } if(SKY.SC&&SKY.SC.blood)FOG.color.lerp(SKY.MB,.4*SKY.SC.blood*(1-k)); FU.uMC.value.copy(FOG.color).multiplyScalar(.62); FU.uMK.value=.8; FU.uMP.value.copy(pos); FOG.near=1e6; FOG.far=2e6; MISTE.x=1; MISTE.y=FL.m0; MISTE.z=FL.m1; MISTF.x=FL.md; scene.fog=FOG; SKY.dome.visible=true; SKY.U.uMistK.value=1; SKY.U.uMistC.value.copy(FOG.color); scene.background.copy(FOG.color).multiplyScalar(.5); if(WX.cloudMist)WX.cloudMist(FOG.color); return; }
    FOG.color.copy(SKY.U.uH.value); FU.uMC.value.copy(SKY.U.uH.value); FU.uMK.value=.8; FU.uMP.value.copy(pos); if(scene.fog===FOG)scene.fog=null; },'134-skyline');
  const g=null; if(g){ const b=document.createElement('button'); b.className='btn'; b.id='dhazem'; const draw=()=>{ b.textContent='DISTANCE HAZE '+(!FAR3.on?'OFF':FAR3.mist?'MIST':'FAR'); b.setAttribute('aria-pressed',String(FAR3.on)); };
    b.onclick=()=>{ if(!FAR3.on){ FAR3.on=true; FAR3.mist=true; } else if(FAR3.mist)FAR3.mist=false; else FAR3.on=false; SAVE.set('haze2',!FAR3.on?'0':FAR3.mist?'1':'2'); draw(); }; g.appendChild(b); draw(); }
  { const on=QS.get('farblur')!=='0', BGC=scene.background, LAY=4, rt=()=>{ const t=new THREE.WebGLRenderTarget(2,2,{depthBuffer:true,type:THREE.HalfFloatType}); t.texture.minFilter=t.texture.magFilter=THREE.LinearFilter; return t; }, A=rt(), Bt=rt();
    const BM=new THREE.ShaderMaterial({uniforms:{uT:{value:null},uD:{value:new THREE.Vector2()}},depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader:'uniform sampler2D uT; uniform vec2 uD; varying vec2 vU; void main(){ vec4 c=texture2D(uT,vU)*.2; float w[4]; w[0]=.17; w[1]=.13; w[2]=.08; w[3]=.04; for(int i=1;i<=4;i++){ c+=texture2D(uT,vU+uD*float(i))*w[i-1]+texture2D(uT,vU-uD*float(i))*w[i-1]; } gl_FragColor=c; }'});
    const QS2=new THREE.Scene(), QC=new THREE.OrthographicCamera(-1,1,1,-1,0,1); QS2.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),BM)); let live=false;
    // the blurred far city goes over the sky only where nothing nearer stands (the far plane's depth), its soft edges see-through: the sky, clouds and sun stay sharp, out of the haze (owner, 2 Nov 2026)
    const FQ=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:{uT:{value:null}},depthTest:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
      vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=vec4(position.xy,1.,1.); }',fragmentShader:'uniform sampler2D uT; varying vec2 vU; void main(){ gl_FragColor=texture2D(uT,vU); }'}));
    FQ.frustumCulled=false; FQ.renderOrder=901; FQ.visible=false; FQ.raycast=()=>{}; FQ.userData.sky=1; scene.add(FQ); FAR3.quad=FQ; const CC=new THREE.Color();
    FAR3.pre=(renderer,cam)=>{ live=false; if(!on||!(FL.bl>0)||!FAR3.on||!FAR3.mist||!me.visible||scene.fog!==FOG||!SKY.dome.visible){ me.layers.set(0); if(pan)pan.layers.set(0); if(TM)TM.layers.set(0); SKY.dome.layers.set(0); return; }
      const W=Math.max(2,Math.ceil(RW/FL.br)), H=Math.max(2,Math.ceil(RH/FL.br)); if(A.width!==W||A.height!==H){ A.setSize(W,H); Bt.setSize(W,H); }
      me.layers.set(LAY); if(pan)pan.layers.set(LAY); if(TM)TM.layers.set(LAY); SKY.dome.layers.set(0); const mask=cam.layers.mask, nu=renderer.shadowMap.needsUpdate, ca=renderer.getClearAlpha(), bg=scene.background; renderer.getClearColor(CC); cam.layers.set(LAY); renderer.shadowMap.needsUpdate=false;
      scene.background=null; renderer.setClearColor(0x000000,0); renderer.setRenderTarget(A); renderer.clear(); renderer.render(scene,cam); cam.layers.mask=mask; renderer.setClearColor(CC,ca); scene.background=bg;   // the far things alone on a clear picture, their colour already times their cover
      BM.uniforms.uT.value=A.texture; BM.uniforms.uD.value.set(FL.bl/W,0); renderer.setRenderTarget(Bt); renderer.render(QS2,QC);
      BM.uniforms.uT.value=Bt.texture; BM.uniforms.uD.value.set(0,FL.bl/H); renderer.setRenderTarget(A); renderer.render(QS2,QC);
      renderer.setRenderTarget(null); renderer.shadowMap.needsUpdate=nu; FQ.material.uniforms.uT.value=A.texture; FQ.visible=true; live=true; };
    FAR3.post=()=>{ if(scene.background!==BGC)scene.background=BGC; FQ.visible=false; }; }
  { const ST={'GAME':{},'CLEAR AIR':{m0:14,m1:60,md:.25,hn:.1,hf:.6,hd:260,hs:10,dt:.6,bl:0,cov:.6},'HAZY':{m0:0,m1:18,md:.35,hn:.35,hf:.9,hd:120,hs:8,dt:.3,bl:.8,cov:.4},
      'DREAMY':{m0:2,m1:30,md:.15,hn:.3,hf:.88,hd:150,hs:12,dt:.35,bl:1.4,br:2,cov:.5,cl:1.3},'DUSK CITY':{m0:8,m1:40,md:.6,hn:.15,hf:.75,hd:200,hs:6,dt:.6,wn:.3,wd:.06,bl:.3,cov:.52,zk:.45}};
    const D=[['m0','MIST STARTS (tiles past town)',-10,60,1],['m1','MIST DEPTH (tiles)',4,160,1],['md','MIST DARKER FAR',0,1,.01],['hn','BUILDINGS: HAZE NEAR',0,1,.01],['hf','BUILDINGS: HAZE FAR',0,1,.01],
      ['hd','HAZE REACHES FULL (tiles)',30,500,5],['hs','HAZE STEPS',2,16,1],['dt','WINDOWS SHOW UNTIL',0,1,.01],['wn','LIT WINDOWS AT NIGHT',0,.6,.01],['wd','LIT WINDOWS BY DAY',0,.3,.01],
      ['bl','BLUR',0,3,.05],['br','BLUR COARSENESS',1,4,.5],['zk','SKY OVERHEAD',.2,1.4,.01],['hk','SKY AT HORIZON',.1,1.2,.01]];
    let P=null, pane=null; const draw=()=>{ if(pane)pane.refresh(); };
    FAR3.panel=async()=>{ '@later'; if(P){ P.hidden=!P.hidden; draw(); return; } P=document.createElement('div'); P.id='farlook';
      P.style.cssText='position:fixed;right:12px;top:8%;width:min(470px,92vw);max-height:84vh;overflow:auto;z-index:21;padding:4px;box-sizing:border-box;font:10px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
      P.innerHTML='<div class="tp"></div><div id="flmsg" style="margin:4px 6px;color:#9aa"></div><textarea id="flout" hidden style="width:100%;height:60px;margin-top:6px;font:10px monospace;box-sizing:border-box"></textarea>';
      document.body.appendChild(P); for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>e.stopPropagation());
      const msg=P.querySelector('#flmsg'), say=t=>{ msg.textContent=t; };
      try{ pane=await TPANE.make(P.querySelector('.tp'),{title:'DISTANCE LOOK'}); }catch(e){ say('PANEL DID NOT LOAD: '+e.message); return; }
      const pr=pane.addFolder({title:'PRESETS'}); for(const n of Object.keys(ST))pr.addButton({title:n}).on('click',()=>{ Object.assign(FL,FL0,ST[n]); draw(); say(n+' (not saved)'); });
      const V=TPANE.live(Object.fromEntries(D.map(([k])=>[k,[()=>+FL[k],v=>{ v=+(+v).toFixed(3); if(v!==+FL[k]){ FL[k]=v; say('not saved'); } }]])));
      for(const [k,label,min,max,step] of D)pane.addBinding(V,k,{label,min,max,step});
      pane.addButton({title:'SAVE'}).on('click',()=>{ SAVE.set('farlook',JSON.stringify(FL)); say('saved'); });
      pane.addButton({title:'RESET'}).on('click',()=>{ Object.assign(FL,FL0); SAVE.del?SAVE.del('farlook'):SAVE.set('farlook','{}'); draw(); say('back to the game\'s own'); });
      pane.addButton({title:'EXPORT'}).on('click',()=>{ const o=P.querySelector('#flout'); o.hidden=false; o.value='FARLOOK '+JSON.stringify(Object.fromEntries(Object.entries(FL).map(([k,v])=>[k,+(+v).toFixed(3)]))); o.select(); say('copy this and send it to Claude'); }); };
    if(QS.get('farlook')==='1')setTimeout(()=>FAR3.panel(),500); }
  // inside a street shop the sections round the park stand between the camera and the room: not drawn
  SYS.add('places',()=>{ if(MAPG.sections)VIS.hide(MAPG.sections,'inside',SHARED.LVL==='up'&&!!STORE.rooms&&STORE.rooms.some(R=>R.inside(pos.x,pos.z))); },'134-sections');
  window.FAR3=FAR3; }
