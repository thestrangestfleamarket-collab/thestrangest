// THE SKYLINE: FAR3 builds the far city skyline, the fog and the distance haze.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, CULL, FAR3, PARK, pos, SKY, VIS, WX} from './003b-systems.js';
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
  const row=(inset,hmin,hmax,wmin,wmax,tower,k)=>{ const x0=LR.x0+inset, x1=LR.x1-inset, z0=LR.z0+inset, z1=LR.z1-inset; let n=0;
    for(const [ax,fixed,lo,hi] of [['x',z0,x0,x1],['x',z1,x0,x1],['z',x0,z0,z1],['z',x1,z0,z1]]){ let p=lo+hs(n++,k)*6;
      while(p<hi){ const w=wmin+hs(n,k)*(wmax-wmin), d=wmin*.8+hs(n+1,k)*(wmax-wmin)*.6, t=hs(n+2,k)<tower, h=t?hmax*(1.2+hs(n+3,k)*.6):hmin+hs(n+3,k)*(hmax-hmin), g=hs(n+5,k);
        if(p+w>hi)break; const c=p+w/2, x=ax==='x'?c:fixed, z=ax==='x'?fixed:c, sx=ax==='x'?w:d, sz=ax==='x'?d:w, L=.26+g*.16, col=[L*.92,L*.95,L*1.04];
        B.push([x,z,sx,sz,h,col]); if(hs(n+4,k)<.3)B.push([x,z,sx*.6,sz*.6,h*1.25,col]);
        p+=w+1.5+hs(n+6,k)*5; n+=7; } } };
  row(4,12,30,7,16,0,1); row(16,8,18,6,13,0,2);
  row(-22,20,45,9,20,0,3); row(-50,30,62,10,24,.03,4); row(-90,40,90,12,28,.1,5); row(-140,50,120,14,32,.2,6);
  { const T=TILE, zf=RINGX.town.w/T+3, xa=RINGX.town.x/T+4, xb=RINGX.town.z/T-4; let x=xa, k=0;
    while(x<xb){ const w=9+hs(k,61)*8, d=9+hs(k,62)*5, h=40+hs(k,63)*36, v=[3,6,7,6,3,7][Math.floor(hs(k,64)*6)], z=zf+d/2+hs(k,65)*1.5, cx=x+w/2;
      B.push([cx,z,w,d,h,null,v]);
      const top=hs(k,66); if(top<.55)B.push([cx,z,w*.7,d*.7,h+4+hs(k,67)*5,null,v]); if(top<.2)B.push([cx,z,w*.42,d*.42,h+10+hs(k,68)*6,null,v]);
      if(top>.86&&w>13){ for(const s2 of [-1,1])B.push([cx+s2*w*.28,z,w*.24,d*.3,h+16+hs(k,69)*6,null,v]); }
      if(top>.55&&top<.86&&hs(k,70)<.6)B.push([cx+(hs(k,71)-.5)*w*.5,z,1.8,1.8,h+3.4,null,1]);
      x+=w+.3; k++; } }
  { const zN=LR.z1+75, zD=LR.z1+170, xs=t=>LR.x0+(LR.x1-LR.x0)*t, L=[.5,.52,.56], ST=[.56,.58,.62], LM=[.66,.62,.54], put=(x,z,w,d,h,c,v)=>B.push([x,z,w,d,h,c,v]);
    for(const dx of [0,19])put(xs(.3)+dx,zD,14,14,170,ST,5); put(xs(.3),zD,1.4,1.4,205,ST,5);
    put(xs(.38),zD-14,15,9,72,LM,3); put(xs(.38),zD-14,8,8,92,LM,3); put(xs(.38),zD-14,4,4,104,LM,3); put(xs(.38),zD-14,.9,.9,118,ST,5);
    { const x=xs(.5); [[30,20,42],[22,16,86],[16,12,128],[10,8,146],[6,6,154]].forEach(([w,d,h])=>put(x,zN,w,d,h,LM,3)); put(x,zN,1.6,1.6,190,ST,5); }
    { const x=xs(.58); [[18,18,96],[13,13,112],[9,9,122],[6,6,130],[3.4,3.4,137]].forEach(([w,d,h],k)=>put(x,zN-4,w,d,h,k>1?ST:LM,k>1?5:3)); put(x,zN-4,.8,.8,162,ST,5); }
    put(xs(.63),zN+6,15,15,126,ST,5);
    for(const t of [.42,.46,.53,.55,.61,.66,.69])put(xs(t),zN+(hs(t*5,2)-.5)*24,10+hs(t*9,3)*8,9,80+hs(t*7,4)*40,ST,5);
    for(let k=0;k<60;k++){ const t=k/60+hs(k,21)*.01, x=xs(t), w=5+hs(k,22)*7, h=10+hs(k,23)*10, z=LR.z1-26-hs(k,24)*5; put(x,z,w,6,h,null,null); if(hs(k,25)<.45)put(x+(hs(k,26)-.5)*w*.5,z,1.6,1.6,h+3.2,[.34,.27,.22],1); } }
  for(let i=B.length-1;i>=0;i--){ const b=B[i]; if(RINGX.inPocket(b[0]*TILE,b[1]*TILE,(Math.max(b[2],b[3])/2+10)*TILE))B.splice(i,1); }
  { const S=SECTIONS, H=S.of(SECTION.id), inn=(b,r)=>{ const x=b[0]+SHARED.BOD.OX, y=b[1]+SHARED.BOD.OY, e=Math.max(b[2],b[3])/2; return x+e>r.x0&&x-e<r.x1&&y+e>r.y0&&y-e<r.y1; }; for(let i=B.length-1;i>=0;i--)if(inn(B[i],S.all)&&!inn(B[i],{x0:H.x0+40,x1:H.x1-40,y0:H.y0+40,y1:H.y1-40}))B.splice(i,1); }
  // none standing in the Hudson (owner, 9 Nov 2026: "make sure there arent any building in the hudson"; its band is data/world.json edge.city.water)
  { const WB=(LEVEL.edge&&LEVEL.edge.city&&LEVEL.edge.city.water)||[]; for(let i=B.length-1;i>=0;i--){ const y=B[i][1]+SHARED.BOD.OY, e=Math.max(B[i][2],B[i][3])/2; if(WB.some(([a,c])=>y+e>a&&y-e<c))B.splice(i,1); } }
  // the new map's backdrop (owner, 6 Nov 2026: "they see more apt buildings until it fades out"; sunk away before the end of the view so the far plane never cuts them into floating slabs, 8 Nov 2026): past the edges, apartment blocks carry on the streets (data/world.json edge.runs: axis, from, to, across from, across to, in map tiles), drawn and hazed as the far city is
  for(const [ax,a0,a1,b0,b1] of (LEVEL.edge&&LEVEL.edge.runs)||[]){ const dir=Math.sign(a1-a0), d=b1-b0; let p=a0+dir*((LEVEL.edge.near||60)+1.2), k=0;   // (the first stretch past the edge is the street's own blocks, 069a)
    while((a1-p)*dir>0){ const w=14+hs(k,81+a0)*8, h=14+hs(k,82+a0)*16, c=p+dir*w/2, mx=ax==='x'?c:(b0+b1)/2, my=ax==='x'?(b0+b1)/2:c;
      B.push([mx-SHARED.BOD.OX,my-SHARED.BOD.OY,ax==='x'?w:d,ax==='x'?d:w,h,null,[0,1,4,6][Math.floor(hs(k,83+a0)*4)]]); p+=dir*(w+1.2); k++; } }
  // the far city past the backdrop (owner, 7 Nov 2026: "like real nyc"): the far shore across the Hudson and the city past the park, hazed rows of blocks (data/world.json edge.far: axis, from, to, across from, across to, lowest, highest in tiles)
  for(const [ax,a0,a1,b0,b1,h0,h1] of (LEVEL.edge&&LEVEL.edge.far&&LEVEL.edge.far.list)||[]){ let p=a0, k=0; while(p<a1){ const w=8+hs(k,91+a0+b0)*16, d=(b1-b0)*(.5+hs(k,92+b0)*.5), h=h0+Math.pow(hs(k,93+a0),2)*(h1-h0), c=p+w/2, mid=(b0+b1)/2+(hs(k,94+b0)-.5)*(b1-b0-d);
      B.push([(ax==='x'?c:mid)-SHARED.BOD.OX,(ax==='x'?mid:c)-SHARED.BOD.OY,ax==='x'?w:d,ax==='x'?d:w,h,null,[0,1,4,6,2,5][Math.floor(hs(k,95+a1)*6)]]); p+=w+.8+hs(k,96)*3; k++; } }
  const FW=16, FH=10, NV=8, atlas=new Uint8Array(FW*FH*NV*4), hp=(a,b)=>{ const v=Math.sin(a*91.7+b*47.3)*43758.5453; return v-Math.floor(v); };
  const WALL=[[128,60,48],[96,66,52],[118,118,114],[176,162,134],[122,56,44],[150,155,162],[168,132,96],[196,184,156]];
  for(let v=0;v<NV;v++)for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){ const k=((v*FH+y)*FW+x)*4, w=WALL[v], n=.97+hp(x+v*7,y)*.06; let c=[w[0]*n,w[1]*n,w[2]*n], a=0;
    if(v!==2&&v!==3&&(y===0))c=c.map(q=>q*.82);
    const inW=v===5?(x%2===1&&y>=1&&y<=8):(x>=2&&x<=5||x>=10&&x<=13)&&y>=2&&y<=7; if(inW){ c=[40,48,60]; a=255; if(v!==5&&(y===2||x===2||x===10))c=[52,60,74]; }
    if(y===8&&(x>=1&&x<=6||x>=9&&x<=14))c=v===3?[200,190,166]:[150,146,138];
    if(v===2&&(x===0||x===8))c=c.map(q=>q*.86);
    if(v===4){ if(y===9)c=[22,22,24]; if(y===6&&x%2===0)c=[30,30,32]; if((x+y)%7===0&&y<9&&x>6&&x<11)c=[26,26,28]; }
    atlas[k]=c[0]; atlas[k+1]=c[1]; atlas[k+2]=c[2]; atlas[k+3]=a; }
  const AVG=[],WIN=[]; for(let v=0;v<NV;v++){ let r=0,g=0,b=0,w=0; for(let i=0;i<FW*FH;i++){ const k=(v*FW*FH+i)*4; r+=atlas[k]; g+=atlas[k+1]; b+=atlas[k+2]; w+=atlas[k+3]>127?1:0; } const n=FW*FH; AVG.push(new THREE.Color().setRGB(r/n/255,g/n/255,b/n/255,THREE.SRGBColorSpace)); WIN.push(w/n); }
  const ftex=new THREE.DataTexture(atlas,FW,FH*NV); ftex.magFilter=ftex.minFilter=THREE.NearestFilter; ftex.colorSpace=THREE.SRGBColorSpace; ftex.flipY=false; ftex.needsUpdate=true;
  const FU={uBake:{value:0},uAvg:{value:AVG},uWin:{value:WIN},uMC:{value:new THREE.Color()},uMK:{value:0},uMP:{value:new THREE.Vector3()},uFT:{value:ftex},uLit:{value:0},uAmb:{value:0},uBay:{value:3*TILE},uStorey:{value:3.2*TILE},uY0:{value:-.5*ZU},uTW:{value:0},uBX:{value:MISTB},uTL:{value:TILE},uHN:{value:.2},uHF:{value:.82},uHD:{value:170},uNR:{value:150*TILE},uHS:{value:8},uDT:{value:.45},uNK:{value:0}};
  const FARIMG={"day": __B64__("data/far-day.png"), "night": __B64__("data/far-night.png"), "meta": {"CX": 33.62, "CZ": -15.82, "EYE": 1.9, "V0": -0.03492, "V1": 0.57735, "N": 450, "dens": 5, "W": 900, "H": 138, "faces": 2}}, BAKE=QS.get('farbake')==='1', FARON=!!FARIMG&&!BAKE&&QS.get('farbaked')!=='0';
  const outPast=([x,z])=>Math.max(LR.x0-x,x-LR.x1,LR.z0-z,z-LR.z1), south=([x,z])=>z<LR.z0+20&&LR.z0+20-z>LR.x0-x&&LR.z0+20-z>x-LR.x1, BN=B.filter(b=>!(FARON&&outPast(b)>=40)&&!(FARON&&south(b))&&!(mist&&outPast(b)<10&&((b[0]*TILE>PFAR.x&&b[1]*TILE>MISTB.w)||(b[1]*TILE>PFAR.y&&b[0]*TILE>MISTB.z)))), BF=B.filter(b=>outPast(b)>=40);
  const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), mat=new THREE.MeshLambertMaterial({color:0xffffff}), m4=new THREE.Matrix4(), c=new THREE.Color(), y0=-.5*ZU;
  const mk=L=>{ const g=geo.clone(), m=new THREE.InstancedMesh(g,mat,L.length), aV=new Float32Array(L.length), aS=new Float32Array(L.length);
    L.forEach(([x,z,sx,sz,h,col,fv],i)=>{ const j=B.indexOf(L[i]); m.setMatrixAt(i,m4.makeScale(sx*TILE,h*TILE,sz*TILE).setPosition(x*TILE,y0,z*TILE)); m.setColorAt(i,c.setRGB(1,1,1)); aV[i]=fv!=null?fv:Math.floor(hs(j,9)*NV); aS[i]=hs(j,11)*97; });
    g.setAttribute('aV',new THREE.InstancedBufferAttribute(aV,1)); g.setAttribute('aS',new THREE.InstancedBufferAttribute(aS,1)); return m; };
  const me=mk(BN);
  mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,FU);
    sh.vertexShader='attribute float aV; attribute float aS; varying float vFV,vFS; varying vec3 vFW,vFN;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed.y*=1.-smoothstep(${(560*TILE).toFixed(1)},${(680*TILE).toFixed(1)},distance((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,cameraPosition));\n#endif`).replace('#include <project_vertex>','#include <project_vertex>\n vec4 fw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\n fw=instanceMatrix*fw;\n#endif\n fw=modelMatrix*fw; vFW=fw.xyz; vFN=normalize(mat3(modelMatrix)*objectNormal); vFV=aV; vFS=aS;');
    sh.fragmentShader='uniform vec3 uMC,uMP; uniform float uMK; uniform sampler2D uFT; uniform float uLit,uBay,uStorey,uY0,uAmb,uTW,uTL,uHN,uHF,uHD,uHS,uDT,uNR,uNK; uniform vec4 uBX; uniform float uBake; uniform vec3 uAvg[8]; uniform float uWin[8]; varying float vFV,vFS; varying vec3 vFW,vFN; float fLit=0.,fAA=0.;\n float pastK(){ vec2 q=vFW.xz/uTL; float d=max(max(uBX.x/uTL-q.x,q.x-uBX.z/uTL),max(uBX.y/uTL-q.y,q.y-uBX.w/uTL)); return clamp((d-3.)/uHD,0.,1.); }\n'+sh.fragmentShader
      .replace('#include <color_fragment>',`#include <color_fragment>
 { vec3 an=abs(vFN); if(an.y>.5){ diffuseColor.rgb=vec3(.16,.16,.17); } else {
     float u=(an.x>an.z?vFW.z:vFW.x)/(uBay*2.), v=(vFW.y-uY0)/uStorey; vec2 f=vec2(fract(u),1.-fract(v));
     vec4 t=texture2D(uFT,vec2((floor(f.x*16.)+.5)/16.,(floor(vFV)*10.+floor(f.y*10.)+.5)/80.)); diffuseColor.rgb=t.rgb; float pk=uMK>0.?pastK():0.; if(pk>0.){ vec3 wc=texture2D(uFT,vec2(.5/16.,(floor(vFV)*10.+9.5)/80.)).rgb; diffuseColor.rgb=mix(t.rgb,wc,floor(pk*4.+.5)/4.*.85); t.a*=step(pk,uDT); }
     if(t.a>.5){ float bay=floor(u*2.+(an.x>an.z?3.:0.)), h=fract(sin(dot(vec3(bay,floor(v),vFS+floor(uTW+fract(bay*.37+floor(v)*.61)*7.)*1.7),vec3(12.9898,78.233,37.719)))*43758.5453); fLit=step(h,uLit); }
     float tp=max(fwidth(u*16.),fwidth(v*10.)), aa=smoothstep(.12,.4,tp); int fi=int(floor(vFV)); if(aa>0.){ diffuseColor.rgb=mix(diffuseColor.rgb,uAvg[fi],aa); fLit=mix(fLit,uLit*uWin[fi],aa); }
     if(uNK>0.&&aa>0.){ float cw=max(fwidth(u*2.),fwidth(v)), cl=exp2(max(0.,ceil(log2(cw*1.3)))); vec2 lc=floor(vec2(u*2.,v)/cl); fAA=aa*uNK; fLit=mix(fLit,.5*step(fract(sin(dot(lc+vFS+cl,vec2(12.9898,78.233)))*43758.5453),.08),fAA); } } }`)
      .replace('#include <fog_fragment>',`if(uMK<=0.){
#include <fog_fragment>
} else { float fd=distance(vFW.xz,uMP.xz); gl_FragColor.rgb=mix(gl_FragColor.rgb,uMC,mix(uHN,uHF,pastK())*smoothstep(0.,uNR,distance(vFW.xz,cameraPosition.xz))); }
`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=fLit*vec3(1.,.82,.5)*.9+diffuseColor.rgb*uAmb;').replace('#include <dithering_fragment>','#include <dithering_fragment>\n if(fAA>0.) gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(vec3(.09,.1,.125),uMC,.55)+fLit*vec3(1.,.82,.5)*.45,fAA);\n if(uBake>.5) gl_FragColor=vec4(pastK(),0.,0.,1.);'); };
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
    FU.uLit.value=FL.wd+(FL.wn-FL.wd)*Math.max(0,Math.min(1,(1-CLOCK.elev())/6)); FU.uNK.value=Math.max(0,Math.min(1,(-2-CLOCK.elev())/6)); FU.uTW.value=performance.now()/1000/23;
    FU.uAmb.value=.55*Math.max(0,Math.min(1,(CLOCK.elev()+3)/12));
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
