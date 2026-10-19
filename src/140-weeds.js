const WEEDS=window.WEEDS={};
WEEDS.movers=[...Array(8)].map(()=>new THREE.Vector4(0,0,0,0)); WEEDS.UMV={value:WEEDS.movers};
WEEDS.PART=(T,k)=>'{ vec4 w0=modelMatrix*instanceMatrix*vec4(transformed,1.); vec3 dw=vec3(0.); for(int i=0;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; vec2 d=w0.xz-m.xy; float l=length(d), f=1.-l/m.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dw.xz+=d/max(l,.001)*f*'+(.22*T).toFixed(4)+'; dw.y-=f*'+(.05*T).toFixed(4)+'; } transformed+=inverse(mat3(instanceMatrix))*dw*'+k+'; }';
WEEDS.clear=r=>{ (WEEDS.clr=WEEDS.clr||[]).push(r); if(WEEDS.lawnDrop)WEEDS.lawnDrop(r); const M=new THREE.Matrix4(), Z=new THREE.Matrix4().makeScale(0,0,0); for(const me of WEEDS.meshes||[]){ let n=0; for(let i=0;i<me.count;i++){ me.getMatrixAt(i,M); const x=M.elements[12], z=M.elements[14]; if(x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]){ me.setMatrixAt(i,Z); n++; } } if(n)me.instanceMatrix.needsUpdate=true; } };
WEEDS.init=()=>{ WEEDS.dbg=f=>f({FIX,SOL,TILE,MODS}); const T=TILE, hsh=(a,b,s)=>{ let h=(Math.floor(a)*374761393+Math.floor(b)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy); return (hsh(xi,yi,s)*(1-u)+hsh(xi+1,yi,s)*u)*(1-v)+(hsh(xi,yi+1,s)*(1-u)+hsh(xi+1,yi+1,s)*u)*v; };
  const RW=typeof RINGX!=='undefined'&&RINGX.walls||[], B=(FIX.up||[]).filter(b=>b[5]-b[2]>.25*T&&b[2]<.6*T&&!RW.includes(b)), RB=typeof ROOMS!=='undefined'&&ROOMS.boxes?ROOMS.boxes():[];
  const inside=(x,z)=>RB.some(b=>b.y0<1&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)||(MODS.apts&&MODS.apts.inside&&MODS.apts.inside(x,z));
  const solidAt=(x,z)=>B.some(b=>x>b[0]&&x<b[3]&&z>b[1]&&z<b[4]);
  const gy=(x,z)=>MODS.bodega&&MODS.bodega.ground?MODS.bodega.ground(x,z):0;
  const TUFT=[], FLOW=[]; WEEDS.drop=[0,0,0];
  for(const b of B){ const [x0,z0,,x1,z1]=b; if(x1<BOUND.x0||x0>BOUND.x1||z1<BOUND.z0||z0>BOUND.z1)continue; const edges=[[x0,z0,x1,z0,0,-1],[x1,z0,x1,z1,1,0],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0]];
    for(const [ax,az,bx,bz,nx,nz] of edges){ const L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/(.2*T)));
      for(let i=0;i<n;i++){ const t=(i+hsh(ax*7+i,az*3,11))/n, ex=ax+(bx-ax)*t, ez=az+(bz-az)*t, wild=vn(ex/(3*T),ez/(3*T),13);
        if(wild<.3||hsh(ex*13,ez*17,15)>wild*1.7){ WEEDS.drop[0]++; continue; }
        const out=(.03+hsh(ex*5,ez*9,17)*.12)*T, x=ex+nx*out, z=ez+nz*out; if(inside(x,z)||STALL.zones.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])){ WEEDS.drop[1]++; continue; } if(solidAt(x,z)){ WEEDS.drop[2]++; continue; }
        const s=(.28+hsh(ex*3,ez*11,19)*.34)*T*(.7+.6*wild); TUFT.push([x,gy(x,z),z,s,hsh(ex,ez,21)*3.14,hsh(ez,ex,23)]);
        if(hsh(ex*19,ez*23,25)<.07)FLOW.push([x+(hsh(ex,ez,27)-.5)*.1*T,gy(x,z)+s*.4,z]); } } }
  if(window.PARK&&PARK.tufts)for(const [px,py,r] of PARK.tufts){ const x=BOD.XS(px+PARK.ox), z=BOD.ZS(py+PARK.oy); TUFT.push([x,gy(x,z),z,(.22+.24*r)*T,r*31%6.28,(r*7)%1]); }
  if(!TUFT.length)return;
  const cv=document.createElement('canvas'); cv.width=cv.height=48; const g=cv.getContext('2d'), id=g.createImageData(48,48);
  for(let k=0;k<9;k++){ const bx=5+k*4.6+Math.sin(k*7)*1.5, lean=(hsh(k,1,41)-.5)*.7, top=Math.floor(48-(18+26*hsh(k,2,42))), wide=hsh(k,3,43)<.25;
    for(let y=top;y<48;y++){ const yy=47-y, px=bx+lean*yy, tt=yy/(47-top||1), w=(wide?3:2.2)*(1-tt*.7); for(let x=Math.floor(px-w);x<=Math.ceil(px+w);x++){ if(x<0||x>47||Math.abs(x-px)>w)continue; const i=(y*48+x)*4; id.data[i]=30+70*tt; id.data[i+1]=58+92*tt; id.data[i+2]=20+30*tt; id.data[i+3]=255; } } }
  g.putImageData(id,0,0); const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.magFilter=THREE.NearestFilter;
  const card=new THREE.PlaneGeometry(1,1).translate(0,.5,0), c2=card.clone().rotateY(Math.PI/2), geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([...card.attributes.position.array,...c2.attributes.position.array],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([...card.attributes.uv.array,...c2.attributes.uv.array],2));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(new Array(16).fill(0).flatMap(()=>[0,1,0]).slice(0,24),3)); geo.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);
  const mat=new THREE.MeshLambertMaterial({map:tx,alphaTest:.5,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uMv=WEEDS.UMV; sh.vertexShader='uniform vec4 uMv[8];\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+WEEDS.PART(T,'position.y')); };
  mat.customProgramCacheKey=()=>'weedsway';
  const CH=new Map(), cs=32*T; for(const t of TUFT){ const k=Math.floor(t[0]/cs)+','+Math.floor(t[2]/cs); if(!CH.has(k))CH.set(k,[]); CH.get(k).push(t); }
  const M=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color(); WEEDS.meshes=[];
  for(const list of CH.values()){ const me=new THREE.InstancedMesh(geo,mat,list.length);
    list.forEach(([x,y,z,s,a,c],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(up,a),new THREE.Vector3(s*1.1,s*.5,s*1.1)); me.setMatrixAt(i,M); me.setColorAt(i,col.setHSL(.24+c*.08,.35+c*.25,.42+c*.2)); });
    me.computeBoundingSphere(); me.receiveShadow=true; scene.add(me); WEEDS.meshes.push(me); }
  if(FLOW.length){ const fg=new THREE.OctahedronGeometry(.05*T,0), fmt=new THREE.MeshLambertMaterial({color:0xf0cc30,emissive:0x2a1c00}), FC=new Map();
    for(const f of FLOW){ const k=Math.floor(f[0]/cs)+','+Math.floor(f[2]/cs); if(!FC.has(k))FC.set(k,[]); FC.get(k).push(f); }
    for(const list of FC.values()){ const fm=new THREE.InstancedMesh(fg,fmt,list.length); list.forEach(([x,y,z],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.identity(),new THREE.Vector3(1,1,1)); fm.setMatrixAt(i,M); }); fm.computeBoundingSphere(); scene.add(fm); WEEDS.meshes.push(fm); } }
  WEEDS.n=TUFT.length; WEEDS.flowers=FLOW.length; };
WEEDS.lawnInit=()=>{ const T=TILE, CS=8*T, N=32, CELL=CS/N, W=N+2, hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const MV=WEEDS.movers, TR=[...Array(12)].map(()=>new THREE.Vector4(0,0,0,0)), TT=new Float64Array(12).fill(-1e9), RP=(.8*T).toFixed(4), EP=(.24*T).toFixed(4), E2=(.15*T).toFixed(4); WEEDS.UTR={value:TR};
  const mat=new THREE.MeshLambertMaterial({color:new THREE.Color().setRGB(70/255,122/255,52/255,THREE.SRGBColorSpace)});
  const HEAD='attribute float aH; attribute float aT; uniform vec4 uMv[8]; uniform vec4 uTr[12];\nfloat tgP(vec2 p){ float k=0.; for(int i=0;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; k=max(k,clamp(('+RP+'-length(p-m.xy))/'+EP+',0.,1.)); }\n for(int i=0;i<11;i++){ vec4 a=uTr[i], b=uTr[i+1]; if(a.w<=0.||b.w<=0.)continue; vec2 ab=b.xy-a.xy, ap=p-a.xy; float t=clamp(dot(ap,ab)/max(dot(ab,ab),1e-4),0.,1.); k=max(k,mix(a.w,b.w,t)*clamp(('+RP+'-length(ap-ab*t))/'+EP+',0.,1.)); } return k; }\n';
  mat.onBeforeCompile=sh=>{ sh.uniforms.uMv=WEEDS.UMV; sh.uniforms.uTr=WEEDS.UTR; sh.vertexShader=HEAD+sh.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n vec3 tgW=(modelMatrix*vec4(position,1.)).xyz; float tgK=tgP(tgW.xz); if(aT>.5){ vec2 tgG=vec2(tgP(tgW.xz+vec2('+E2+',0.)),tgP(tgW.xz+vec2(0.,'+E2+')))-tgK; objectNormal=normalize(objectNormal+vec3(tgG.x,0.,tgG.y)*aH*.82/'+E2+'); }')
    .replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.y-=aH*tgK*.82;').replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point)LightShadows\[ i \]\.shadowNormalBias/g,'($&+.12)'));
    sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=lfn(vWP.xz*.031+7.)>.6?1.07:1.;'); };
  mat.customProgramCacheKey=()=>'tallgrass';
  const near=[]; WEEDS.moveTick=()=>{ near.length=0; near.push([pos.x,pos.z,0]); if(typeof NPCS!=='undefined')for(const N of NPCS){ if(N.lv!=='up'||N.far||!N.g.visible||!N.st)continue; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<14*T)near.push([N.st.x,N.st.z,d]); }
    near.sort((a,b)=>a[2]-b[2]); for(let i=0;i<8;i++){ const n=near[i]; if(n)MV[i].set(n[0],n[1],.55*T,1); else MV[i].w=0; }
    const now=performance.now()/1e3, up=LVL==='up'; if(Math.hypot(pos.x-TR[0].x,pos.z-TR[0].y)>3*T||!up)TT.fill(-1e9);
    if(Math.hypot(pos.x-TR[1].x,pos.z-TR[1].y)>.6*T||TT[1]<0){ for(let i=11;i>1;i--){ TR[i].copy(TR[i-1]); TT[i]=TT[i-1]; } TR[1].set(pos.x,pos.z,0,1); TT[1]=up?now:-1e9; }
    TR[0].set(pos.x,pos.z,0,1); TT[0]=up?now:-1e9; for(let i=0;i<12;i++)TR[i].w=Math.max(0,Math.min(1,1.6*(1-(now-TT[i])/3.5))); };
  const skip=o=>o.isInstancedMesh||o.isSkinnedMesh||o.isPoints||o.isSprite||o.isLine||(o.material&&(o.material.visible===false||o.material.isMeshToonMaterial||o.material.transparent||o.material.depthWrite===false||o.material.side===THREE.BackSide));
  const CH=new Map(); WEEDS.chunks=CH; WEEDS.lawnN=0; const clr=WEEDS.clr||(WEEDS.clr=[]);
  const RT=new THREE.WebGLRenderTarget(W,W,{depthBuffer:true}), CAM=new THREE.OrthographicCamera(-CS/2-CELL,CS/2+CELL,CS/2+CELL,-CS/2-CELL,.1,80*T), PIX=new Uint8Array(W*W*4);
  const VS='varying float vY; void main(){ vec4 w=modelMatrix*vec4(position,1.);'+'\n#ifdef USE_INSTANCING\n w=modelMatrix*instanceMatrix*vec4(position,1.);\n#endif\n vY=w.y; gl_Position=projectionMatrix*viewMatrix*w; }';
  const M0=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(0.); }',side:THREE.DoubleSide});
  const M1=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(1.,clamp((vY+.5)/4.,0.,1.),0.,1.); }',side:THREE.DoubleSide});
  const PS=24*T, KINDS=['flat','roll','little','big','giant','bigflat','tuft'];
  const vn=(x,z,s)=>{ const ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz), h=(a,b)=>hsh(a/97,b/89,s);
    return (h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v; };
  const hgt=(x,z)=>T*(.42+.3*vn(x/T/9,z/T/9,401));
  const WK=[3,2,2,1.5,1,1.5,3], WS=WK.reduce((a,b)=>a+b,0), pickK=r=>{ r*=WS; for(let i=0;i<WK.length;i++)if((r-=WK[i])<0)return KINDS[i]; return 'flat'; };
  const inPark=(x,z,m=0)=>{ if(typeof PARK==='undefined'||PARK.ox==null)return false; const xa=BOD.XS(PARK.x0+PARK.ox+m), xb=BOD.XS(PARK.x1+PARK.ox-m), za=BOD.ZS(PARK.y0+PARK.oy+m), zb=BOD.ZS(PARK.y1+PARK.oy-m);
    return x>Math.min(xa,xb)&&x<Math.max(xa,xb)&&z>Math.min(za,zb)&&z<Math.max(za,zb); };
  WEEDS.inPark=inPark;
  const deep=(x,z)=>{ if(typeof PARK==='undefined'||PARK.ox==null)return 0; const tx=x/T, tz=z/T, xa=BOD.XS(PARK.x0+PARK.ox)/T, xb=BOD.XS(PARK.x1+PARK.ox)/T, za=BOD.ZS(PARK.y0+PARK.oy)/T, zb=BOD.ZS(PARK.y1+PARK.oy)/T;
    return Math.min(tx-Math.min(xa,xb),Math.max(xa,xb)-tx,tz-Math.min(za,zb),Math.max(za,zb)-tz)+10*(vn(tx/11,tz/11,97)-.5); };
  WEEDS.deep=deep;
  const patch=(x,z)=>{ const k=patch0(x,z); if(k==='flat'||k==='tuft')return k; const d=inPark(x,z)?deep(x,z):0;
    if(d<14)return k==='roll'||k==='bigflat'?'flat':'tuft'; if(d<28&&(k==='big'||k==='giant'))return k==='big'?'little':'roll'; return k; };
  WEEDS.mushAt=(x,z)=>vn(x/T/13,z/T/13,311)>.7;
  const patch0=(x,z)=>{ const tx=x/T, tz=z/T, wx=tx+16*(vn(tx/18,tz/18,91)-.5)+5*(vn(tx/6,tz/6,93)-.5), wz=tz+16*(vn(tx/18,tz/18,92)-.5)+5*(vn(tx/6,tz/6,94)-.5), PSt=PS/T, gx=Math.floor(wx/PSt), gz=Math.floor(wz/PSt);
    let d1=1e18, d2=1e18, k1='flat', k2='flat'; for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){ const a=gx+i, b=gz+j, px=(a+hsh(a,b,71))*PSt, pz=(b+hsh(b,a,72))*PSt, d=(wx-px)**2+(wz-pz)**2, k=pickK(hsh(a,b,73));
      if(d<d1){ d2=d1; k2=k1; d1=d; k1=k; } else if(d<d2){ d2=d; k2=k; } }
    let kind=Math.sqrt(d2)-Math.sqrt(d1)<3.5*hsh(tx*2,tz*2,95)?k2:k1;
    const isl=vn(tx/2.6,tz/2.6,96); if(isl>.8)kind=kind==='tuft'?'flat':'tuft';
    return kind; };
  WEEDS.kindAt=patch;
  const build=(cx,cz)=>{ const x0=cx*CS, z0=cz*CS, LW=[MODS.land,typeof POND!=='undefined'?POND.hills:null].filter(Boolean), hid=[];
    scene.traverseVisible(o=>{ if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&skip(o))hid.push(o); }); for(const g of [W3.group,...NPCS.map(N=>N.g)])if(g&&g.visible)hid.push(g); for(const m of CH.values())if(m&&m.visible)hid.push(m); hid.forEach(o=>o.visible=false);
    const lm=LW.map(o=>o.layers.mask); LW.forEach(o=>o.layers.set(5));
    const rt0=renderer.getRenderTarget(), ac=renderer.autoClear, ov=scene.overrideMaterial, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), bg=scene.background, fg=scene.fog;
    CAM.position.set(x0+CS/2,40*T,z0+CS/2); CAM.up.set(0,0,-1); CAM.lookAt(x0+CS/2,0,z0+CS/2); CAM.updateMatrixWorld();
    renderer.setRenderTarget(RT); renderer.setClearColor(0,0); scene.background=null; scene.fog=null; renderer.autoClear=false; renderer.clear();
    CAM.layers.set(0); scene.overrideMaterial=M0; renderer.render(scene,CAM); CAM.layers.set(5); scene.overrideMaterial=M1; renderer.render(scene,CAM);
    renderer.readRenderTargetPixels(RT,0,0,W,W,PIX);
    scene.overrideMaterial=ov; renderer.setRenderTarget(rt0); renderer.autoClear=ac; renderer.setClearColor(cc,ca); scene.background=bg; scene.fog=fg;
    LW.forEach((o,i)=>o.layers.mask=lm[i]); hid.forEach(o=>o.visible=true);
    const G=new Float32Array(W*W), I=new Uint8Array(W*W), SQ=[], P=[], AH=[], AT=[], IX=[], N1=N+1, VI=new Int32Array(N1*N1).fill(-1), VQ=[];
    for(let r=0;r<W;r++)for(let u=0;u<W;u++){ const k=(r*W+u)*4, c=(N-r+1)*W+u, x=x0+(u-.5)*CELL, z=z0+(N-r+.5)*CELL; if(PIX[k]<128||clr.some(q=>x>q[0]&&x<q[2]&&z>q[1]&&z<q[3]))continue; I[c]=1; G[c]=PIX[k+1]/255*4-.5; }
    for(let j=0;j<N;j+=2)for(let i=0;i<N;i+=2){ const c=(j+1)*W+i+1; if(I[c])SQ.push(x0+(i+1)*CELL,G[c],z0+(j+1)*CELL); }
    for(let b=0;b<=N;b++)for(let a=0;a<=N;a++){ let k=0, g=0, ox=0, oz=0; for(const [di,dj] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const c=(b+dj+1)*W+a+di+1; if(I[c]){ k++; g+=G[c]; ox+=di+.5; oz+=dj+.5; } }
      if(!k)continue; const f=k===1?.5:k===3?-.5:0, x=x0+(a+ox*f)*CELL, z=z0+(b+oz*f)*CELL, h=hgt(x,z)*(k<4?.8:1); g/=k;
      VI[b*N1+a]=P.length/3; VQ[b*N1+a]=[x,g,z,h]; P.push(x,g+h,z); AH.push(h); AT.push(1); }
    const wall=(p,q,nx,nz)=>{ const ex=q[0]-p[0], ez=q[2]-p[2]; if(Math.abs(ex)+Math.abs(ez)<1e-4)return; const v=P.length/3, lo=-.06*T;
      P.push(p[0],p[1]+p[3],p[2],q[0],q[1]+q[3],q[2],q[0],q[1]+lo,q[2],p[0],p[1]+lo,p[2]); AH.push(p[3],q[3],0,0); AT.push(0,0,0,0);
      if(ez*nx-ex*nz>0)IX.push(v,v+1,v+2,v,v+2,v+3); else IX.push(v,v+2,v+1,v,v+3,v+2); };
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ if(!I[(j+1)*W+i+1])continue; const A=j*N1+i, B=A+1, C=A+N1, D=C+1;
      IX.push(VI[A],VI[C],VI[B],VI[B],VI[C],VI[D]);
      if(!I[j*W+i+1])wall(VQ[A],VQ[B],0,-1); if(!I[(j+1)*W+i+2])wall(VQ[B],VQ[D],1,0); if(!I[(j+2)*W+i+1])wall(VQ[C],VQ[D],0,1); if(!I[(j+1)*W+i])wall(VQ[A],VQ[C],-1,0); }
    if(!IX.length)return null; const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('aH',new THREE.Float32BufferAttribute(AH,1)); geo.setAttribute('aT',new THREE.Float32BufferAttribute(AT,1));
    geo.setIndex(IX); geo.computeVertexNormals(); const me=new THREE.Mesh(geo,mat); me.receiveShadow=true; me.tri=IX.length/3; me.sq=SQ; me.top=(x,y,z)=>y+hgt(x,z); me.dispose=()=>geo.dispose();
    MAPG.bodega.add(me); WEEDS.lawnN+=me.tri; return me; };
  const drop=k=>{ const me=CH.get(k); if(me){ MAPG.bodega.remove(me); me.dispose(); WEEDS.lawnN-=me.tri; } CH.delete(k); if(WEEDS.onDrop)WEEDS.onDrop(k); };
  WEEDS.lawnDrop=r=>{ for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(r[2]>a*CS-CELL&&r[0]<(a+1)*CS+CELL&&r[3]>b*CS-CELL&&r[1]<(b+1)*CS+CELL)drop(k); } };
  let busy=0, next=0; WEEDS.lawnTick=()=>{ if(LVL!=='up'||(ROOMS&&ROOMS.cur))return; const pcx=Math.floor(pos.x/CS), pcz=Math.floor(pos.z/CS);
    for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(Math.max(Math.abs(a-pcx),Math.abs(b-pcz))>3)drop(k); }
    let best=null, bd=1e9; for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){ const k=(pcx+a)+','+(pcz+b); if(CH.has(k))continue; const d=a*a+b*b; if(d<bd){ bd=d; best=[pcx+a,pcz+b,k]; } }
    if(best&&performance.now()>=next){ const t0=performance.now(); const gb=build(best[0],best[1]); CH.set(best[2],gb); if(gb&&WEEDS.onAdd)WEEDS.onAdd(best[2],gb); busy=performance.now()-t0; WEEDS.busy=busy; next=performance.now()+Math.max(120,busy*3); } };
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); WEEDS.lawnTick(); WEEDS.moveTick(); }; };
