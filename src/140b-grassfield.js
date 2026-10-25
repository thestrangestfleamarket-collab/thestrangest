// THE GRASS FIELD: the lawns' grass, after cortiz2894/stylized-components (MIT, Christian Ortiz): a floor painted with blades under every lawn and thin blades over all of it, baked once (their colours and the still things' shadows fixed in, no wind), pressed flat and splayed only where you, the walkers and the rocks and trunks stand; its season presets in ATMOSPHERE.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, pos, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {MAPG, SOL, SYS, TILE} from './006-map-pre.js';
const GRASS={};
{ const T=TILE, MAXR=24;
  // the repo's settings as its control panel starts them, brighter (owner), and its presets (each applied on top of the default)
  const DEF={grDensity:300,grMinWidth:.06,grMaxWidth:.06,grMinLength:.375,grMaxLength:.625,grTiltMax:.16,grColorBottom:'#4a9a22',grColorTop:'#86c93a',grGradStart:.15,grGradEnd:1,grGradPower:1.6,grBrightness:1.2,
    grShadowStrength:.6,grShadowSampleY:.15,grPatchStrength:.73,grPatchLinkColors:true,grPatchDry:'#b8a94e',grPatchLush:'#6f9a2a',grPatchScale:.9,grPatchBias:1.6,
    grRockFlatten:1,grRockBend:.41,grRockRadiusMul:.2,grRockFalloff:.35,grTransColor:'#c1e54d',grTransStrength:2.5,grTransPower:6.4,grTransTip:1,grTransShadow:1};
  const PRESETS={default:{label:'SPRING',values:{}},
    autumn:{label:'AUTUMN',values:{grColorBottom:'#7e8005',grColorTop:'#d2db18',grTransColor:'#f8f454',grTransStrength:3}},
    mars:{label:'MARS',values:{grMinWidth:.08,grMaxWidth:.025,grMinLength:.6,grMaxLength:1,grColorBottom:'#c7611a',grColorTop:'#f879e7',grGradStart:.14,grGradEnd:.75,grBrightness:.9,grTransColor:'#ffffff',grTransStrength:2.5}}};
  const F=v=>({value:v}), C=()=>new THREE.Color();
  const U={uGrassBottom:F(C()),uGrassTop:F(C()),uBrightness:F(1),uGradStart:F(0),uGradEnd:F(1),uGradPower:F(1),uPatchStrength:F(0),uShadowStrength:F(0),uShadowSampleY:F(0),uSunOn:F(1),
    uRocks:F([...Array(MAXR)].map(()=>new THREE.Vector4())),uRockCount:F(0),uRockRadiusMul:F(1),uRockFalloff:F(.35),uRockFlatten:F(1),uRockBend:F(0),uSunDir:F(new THREE.Vector3(0,1,0)),uSunColor:F(new THREE.Color(1,1,1)),
    uTransColor:F(C()),uTransStrength:F(0),uTransPower:F(1),uTransTip:F(1),uTransShadow:F(1),uBake:F(null),uBakeSpan:F(1),uBakeOn:F(0),uGTex:F(null),uGTw:F(new THREE.Vector2(0,0)),uFwd:F(new THREE.Vector2(0,1))};
  let S=Object.assign({},DEF), cur='default'; try{ const k=SAVE.get('grass'); if(k&&PRESETS[k])cur=k; }catch(e){}
  const LUSH=new THREE.Color(), DRY=new THREE.Color();
  const sync=()=>{ const u=U; for(const [k,g] of [['uGradStart','grGradStart'],['uGradEnd','grGradEnd'],['uGradPower','grGradPower'],['uBrightness','grBrightness'],['uPatchStrength','grPatchStrength'],['uShadowStrength','grShadowStrength'],['uShadowSampleY','grShadowSampleY'],
      ['uTransStrength','grTransStrength'],['uTransPower','grTransPower'],['uTransTip','grTransTip'],['uTransShadow','grTransShadow'],['uRockFlatten','grRockFlatten'],['uRockBend','grRockBend'],['uRockRadiusMul','grRockRadiusMul'],['uRockFalloff','grRockFalloff']])u[k].value=S[g];
    u.uGrassBottom.value.set(S.grColorBottom); u.uGrassTop.value.set(S.grColorTop); u.uTransColor.value.set(S.grTransColor);
    LUSH.set(S.grPatchLinkColors?S.grColorBottom:S.grPatchLush); DRY.set(S.grPatchLinkColors?S.grColorTop:S.grPatchDry); };
  // the repo's patch noise, worked out once on the CPU for each blade and floor corner (the baked colours)
  const fr=x=>x-Math.floor(x), hash=(x,y)=>{ x=fr(x*127.1); y=fr(y*311.7); const d=x*(x+19.19)+y*(y+19.19); x+=d; y+=d; return fr(x*y); };
  const noise=(x,y)=>{ const ix=Math.floor(x), iy=Math.floor(y), fx=x-ix, fy=y-iy, ux=fx*fx*(3-2*fx), uy=fy*fy*(3-2*fy), a=hash(ix,iy), b=hash(ix+1,iy), c=hash(ix,iy+1), d=hash(ix+1,iy+1); return (a+(b-a)*ux)*(1-uy)+(c+(d-c)*ux)*uy; };
  const fbm=(x,y)=>{ let v=0, a=.5, n=0; for(let i=0;i<4;i++){ v+=a*noise(x,y); n+=a; x=x*2.03+3.1; y=y*2.03+7.7; a*=.5; } return v/n; };
  const patch=(x,z,o)=>o.copy(LUSH).lerp(DRY,Math.pow(Math.min(1,Math.max(0,fbm(x*S.grPatchScale,z*S.grPatchScale))),S.grPatchBias));
  // one shadow sample at a point (a blade's, so it is wholly in or out; the floor's own point): the still things' shadows baked (uBake), the moving ones live from the sun's moving map (the second sun); Lambert's own sun shadow is switched off
  const SHFRAG=`uniform float uSunOn, uBakeOn, uBakeSpan; uniform sampler2D uBake;
  float grassBaked(vec3 p){ return uBakeOn>.5?texture2D(uBake,fract(p.xz/uBakeSpan)).r:1.; }
#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 2
  uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
  float grassShadow(vec3 p){ if(uSunOn<.5)return 1.; DirectionalLightShadow dls=directionalLightShadows[ 1 ];
    return min(grassBaked(p),getShadow(directionalShadowMap[ 1 ],dls.shadowMapSize,dls.shadowBias,dls.shadowRadius,directionalShadowMatrix[ 1 ]*vec4(p,1.))); }
#else
  float grassShadow(vec3 p){ return uSunOn<.5?1.:grassBaked(p); }
#endif
`;
  const KILLSH=THREE.ShaderChunk.shadowmap_vertex.replace('vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;','vDirectionalShadowCoord[ i ] = vec4(2.,2.,2.,1.);');   // the suns' own shadow off (outside their maps); lamps and their shadows as usual
  // a blade: the repo's tapered strip, base width 1 and height 1, scaled by its instance
  const bladeGeo=seg=>{ const hw=t=>.5*Math.pow(1-t,1.2), P=[], I=[]; for(let i=0;i<seg;i++){ const t=i/seg, w=hw(t); P.push(-w,t,0,w,t,0); } P.push(0,1,0);
    for(let i=0;i<seg-1;i++){ const l=i*2; I.push(l,l+2,l+1,l+1,l+2,l+3); } const L=(seg-1)*2; I.push(L,seg*2,L+1);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals(); return g; };
  const BLD={dens:.3,w:2.4,g:bladeGeo(1)};   // one detail everywhere: no steps between near and far grass
  const bmat=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
  bmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
  #define MAX_ROCKS ${MAXR}
  attribute vec3 aPatch; uniform float uRockRadiusMul, uRockFalloff, uRockFlatten, uRockBend, uShadowSampleY; uniform vec4 uRocks[MAX_ROCKS]; uniform int uRockCount;
  varying float vBH; varying vec3 vPatch, vWorldPos, vBladeN, vShP;`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
  vec2 baseXZ=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xz; vPatch=aPatch;
  float rockInfl=0.; vec2 rockAway=vec2(1.,0.);
  if(uRockCount>0&&distance(baseXZ,uRocks[0].xz)<9.)for(int i=0;i<MAX_ROCKS;i++){ if(i>=uRockCount)break; vec4 rock=uRocks[i]; vec2 d=baseXZ-rock.xz; float dist=length(d), rad=rock.w*uRockRadiusMul, infl=1.-smoothstep(rad,rad+uRockFalloff,dist); if(infl>rockInfl){ rockInfl=infl; rockAway=dist>1e-4?d/dist:vec2(1.,0.); } }
  float shrink=1.-uRockFlatten*rockInfl; transformed.y*=shrink; vBH=position.y*shrink; float hMask=vBH*vBH;
  vWorldPos=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;
  mat3 instRot=mat3(normalize(vec3(instanceMatrix[0])),normalize(vec3(instanceMatrix[1])),normalize(vec3(instanceMatrix[2])));
  if(rockInfl>.001)transformed+=transpose(instRot)*vec3(rockAway.x,0.,rockAway.y)*(uRockBend*rockInfl*hMask);
  vBladeN=normalize(mat3(modelMatrix)*instRot*normal);
  vShP=mix((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,(modelMatrix*instanceMatrix*vec4(0.,1.,0.,1.)).xyz,uShadowSampleY);`)
    .replace('#include <shadowmap_vertex>',KILLSH)
    .replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n  transformedNormal=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));');
    sh.fragmentShader=`varying float vBH; varying vec3 vPatch, vWorldPos, vBladeN, vShP;
  uniform vec3 uGrassBottom, uGrassTop, uSunDir, uSunColor, uTransColor; uniform float uBrightness, uGradStart, uGradEnd, uGradPower, uPatchStrength, uShadowStrength, uTransStrength, uTransPower, uTransTip, uTransShadow;
`+sh.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n'+SHFRAG)
      .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n  normal=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`float _gT=pow(clamp((vBH-uGradStart)/max(uGradEnd-uGradStart,.001),0.,1.),uGradPower); vec3 _bladeCol=mix(mix(uGrassBottom,uGrassTop,_gT),vPatch,uPatchStrength);
  vec4 diffuseColor=vec4(_bladeCol*uBrightness,opacity);`)
      .replace('#include <opaque_fragment>',`#include <opaque_fragment>
  { float _shadow=grassShadow(vShP); gl_FragColor.rgb*=(1.-uShadowStrength*(1.-_shadow));
    vec3 _L=normalize(uSunDir), _V=normalize(cameraPosition-vWorldPos); float _back=pow(max(dot(_V,-_L),0.),uTransPower), _thin=mix(1.,vBH,uTransTip), _edge=1.-abs(dot(normalize(vBladeN),_L)), _sh=mix(1.,_shadow,uTransShadow);
    gl_FragColor.rgb+=uTransColor*uSunColor*uTransStrength*_back*_thin*_edge*_sh*uSunOn; }`); };
  bmat.customProgramCacheKey=()=>'grassblade4';
  // the floor: the lawn's own ground painted with blades once (uGTex: how far up a blade each point is, and whether a blade is there), turned to face the camera, in the blades' own colours
  const gmat=new THREE.MeshLambertMaterial({side:THREE.FrontSide});
  gmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader='attribute vec3 aPatch; varying vec3 vGndW, vPatchF;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vGndW=(modelMatrix*vec4(transformed,1.)).xyz; vPatchF=aPatch;').replace('#include <shadowmap_vertex>',KILLSH);
    sh.fragmentShader=`varying vec3 vGndW, vPatchF; uniform float uShadowStrength, uBrightness, uGradStart, uGradEnd, uGradPower, uPatchStrength; uniform vec3 uGrassBottom, uGrassTop; uniform vec2 uFwd, uGTw; uniform sampler2D uGTex;
`+sh.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n'+SHFRAG)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`vec4 _g=texture2D(uGTex,vec2(dot(vGndW.xz,vec2(-uFwd.y,uFwd.x)),dot(vGndW.xz,uFwd))/uGTw); float _gT=pow(clamp((_g.r-uGradStart)/max(uGradEnd-uGradStart,.001),0.,1.),uGradPower);
  vec4 diffuseColor=vec4(mix(mix(uGrassBottom,uGrassTop,_gT),vPatchF,uPatchStrength)*(_g.g>.5?mix(.68,1.22,_g.r):.56)*uBrightness,opacity);`)
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n  gl_FragColor.rgb*=(1.-uShadowStrength*(1.-grassShadow(vGndW)));'); };
  gmat.customProgramCacheKey=()=>'grassfloor4';
  const FL=new Map(); GRASS.floors=FL; GRASS.n=0;   // per lawn chunk: its floor and its blades, baked together
  const pc=new THREE.Color();
  const paint=f=>{ const P=f.P, col=f.m.geometry.attributes.aPatch.array; for(let i=0;i<P.length;i+=3){ patch(P[i],P[i+2],pc); col[i]=pc.r; col[i+1]=pc.g; col[i+2]=pc.b; } f.m.geometry.attributes.aPatch.needsUpdate=true; };
  const floor=(key,me)=>{ const {x0,z0,N,CELL,MG}=me, W=N+2*MG, ci=(i,j)=>(j+MG)*W+i+MG, N1=N+1, VI=new Int32Array(N1*N1).fill(-1), P=[], IX=[];
    // the lawn wider: the floor two squares out, under the paths' edges; the blades three, thinning as they go, so the grass spills messily over the edges of paths and walls
    let I=me.I, G=me.G; const RG=new Uint8Array(I.length); for(let r=0;r<3;r++){ const I2=new Uint8Array(I), G2=new Float32Array(G); for(let j=-MG+1;j<N+MG-1;j++)for(let i=-MG+1;i<N+MG-1;i++){ const c=ci(i,j); if(I[c])continue; let g=0, n=0; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const d=ci(i+di,j+dj); if(I[d]){ g+=G[d]; n++; } } if(n){ I2[c]=1; G2[c]=g/n; RG[c]=r+1; } } I=I2; G=G2; }
    const v=(a,b)=>{ const k=b*N1+a; if(VI[k]>=0)return VI[k]; let g=0, n=0, ox=0, oz=0; for(const [di,dj] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const c=ci(a+di,b+dj); if(I[c]){ g+=G[c]; n++; ox+=di+.5; oz+=dj+.5; } }
      const f=n===1?.5:n===3?-.5:0; P.push(x0+(a+ox*f)*CELL,g/n+.015*T,z0+(b+oz*f)*CELL); return VI[k]=P.length/3-1; };
    const QT=[], QR=[];   // the triangles for the scatter, and how far past the lawn each lies
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const c=ci(i,j); if(!I[c])continue; const A=v(i,j), B=v(i+1,j), Cc=v(i,j+1), D=v(i+1,j+1); if(RG[c]<3)IX.push(A,Cc,B,B,Cc,D); QT.push(A,Cc,B,B,Cc,D); QR.push(RG[c],RG[c]); }
    if(!IX.length)return; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(P.map((_,i)=>i%3===1?1:0),3)); g.setAttribute('aPatch',new THREE.Float32BufferAttribute(new Float32Array(P.length),3)); g.setIndex(IX);
    const m=new THREE.Mesh(g,gmat); m.receiveShadow=true; m.raycast=()=>{}; MAPG.bodega.add(m); const f={me,m,P,QT,QR,b:null}; paint(f); blades(f); FL.set(key,f); };
  const unfloor=key=>{ const f=FL.get(key); if(!f)return; MAPG.bodega.remove(f.m); f.m.geometry.dispose(); unblade(f); FL.delete(key); };
  // a chunk's blades, baked once with its floor: area-weighted over its floor triangles (a triangle by its area, then a uniform point in it), seeded so the field is the same every time, each blade's patch colour fixed in
  const area=f=>{ const P=f.P, Q=f.QT, cum=[]; let A=0; for(let t=0;t<Q.length;t+=3){ const a=Q[t]*3, b=Q[t+1]*3, c=Q[t+2]*3, ux=P[b]-P[a], uy=P[b+1]-P[a+1], uz=P[b+2]-P[a+2], vx=P[c]-P[a], vy=P[c+1]-P[a+1], vz=P[c+2]-P[a+2];
      A+=.5*Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx); cum.push(A); } return {A,cum}; };
  const blades=f=>{ const P=f.P, Q=f.QT, {A,cum}=area(f), n=Math.round(S.grDensity*BLD.dens*A); if(!n)return; const M=new THREE.Matrix4(), Qn=new THREE.Quaternion(), E=new THREE.Euler(), Sc=new THREE.Vector3(), V=new THREE.Vector3(), AP=new Float32Array(n*3);
    let a=((Math.floor(f.me.x0*7.13)*73856093)^(Math.floor(f.me.z0*3.71)*19349663))>>>0||1; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
    const im=new THREE.InstancedMesh(BLD.g,bmat,n);
    for(let i=0;i<n;i++){ const r=R()*A; let lo=0, hi=cum.length-1; while(lo<hi){ const mid=(lo+hi)>>1; if(cum[mid]<r)lo=mid+1; else hi=mid; } const t=lo*3, pa=Q[t]*3, pb=Q[t+1]*3, pc2=Q[t+2]*3, rg=f.QR[lo]; if(rg&&R()>SPILL[rg]){ im.setMatrixAt(i,ZERO); AP[i*3]=AP[i*3+1]=AP[i*3+2]=0; continue; }
      let u=R(), w=R(); if(u+w>1){ u=1-u; w=1-w; } V.set(P[pa]+(P[pb]-P[pa])*u+(P[pc2]-P[pa])*w,P[pa+1]+(P[pb+1]-P[pa+1])*u+(P[pc2+1]-P[pa+1])*w,P[pa+2]+(P[pb+2]-P[pa+2])*u+(P[pc2+2]-P[pa+2])*w);
      E.set((R()-.5)*2*S.grTiltMax,R()*Math.PI*2,(R()-.5)*S.grTiltMax*.5); Qn.setFromEuler(E); Sc.set((S.grMinWidth+R()*(S.grMaxWidth-S.grMinWidth))*BLD.w,S.grMinLength+R()*(S.grMaxLength-S.grMinLength),1); if(rg)Sc.y*=.55+R()*.75; im.setMatrixAt(i,M.compose(V,Qn,Sc));
      patch(V.x,V.z,pc); AP[i*3]=pc.r; AP[i*3+1]=pc.g; AP[i*3+2]=pc.b; }
    im.geometry=BLD.g.clone(); im.geometry.setAttribute('aPatch',new THREE.InstancedBufferAttribute(AP,3));
    im.computeBoundingSphere(); im.boundingSphere.radius+=1; im.receiveShadow=true; im.raycast=()=>{}; MAPG.bodega.add(im); f.b=im; GRASS.n+=n; };
  const SPILL=[1,1,.7,.35], ZERO=new THREE.Matrix4().makeScale(0,0,0);   // how many blades stand at each step past the lawn's edge
  const unblade=f=>{ const im=f.b; if(im){ MAPG.bodega.remove(im); im.geometry.dispose(); im.dispose(); GRASS.n-=im.count; } f.b=null; };
  GRASS.preset=k=>{ if(!PRESETS[k])return; cur=k; S=Object.assign({},DEF,PRESETS[k].values); sync(); try{ SAVE.set('grass',k); }catch(e){} for(const f of FL.values()){ paint(f); unblade(f); blades(f); } };   // baked: a new look rebakes the field round you
  GRASS.PRESETS=PRESETS; GRASS.U=U; GRASS.get=()=>Object.assign({},S); GRASS.cur=()=>cur;
  // the floor's blades, painted once into a tile it repeats, pixel by pixel: red how far up a blade, green a blade there; tips away from the camera, nearer blades over farther, wrapped so it tiles; one texel to one screen pixel at the usual zoom
  { const N=256, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), im=g.createImageData(N,N), D=im.data; for(let i=3;i<D.length;i+=4)D[i]=255;
    let a=12345; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; }, B=[]; for(let i=0;i<3400;i++)B.push([R()*N,R()*N,8+R()*14,(R()-.5)*5,R()<.3?2:1]);
    B.sort((p,q)=>p[1]-q[1]);
    for(const [x0,y0,h,ln,w] of B)for(let s2=0;s2<=h;s2++){ const t=s2/h, y=((Math.round(y0-s2)%N)+N)%N; for(let dx=0;dx<(t>.6?1:w);dx++){ const x=((Math.round(x0+ln*t*t)+dx)%N+N)%N, k=(y*N+x)*4; D[k]=Math.round(t*255); D[k+1]=255; } }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; U.uGTex.value=t; U.uGTw.value=new THREE.Vector2(0,0); }
  // the still things' shadows, baked: each chunk round you once, into its slot of an atlas that wraps as you walk, from the sun's held direction (CLOCK.dir); a light of its own draws the still things' depth from the sun, read back, and every point of the chunk is tested against it
  const BS=10, BP=192, AT=BS*BP, CSZ=8*T, BM=512, bake=new THREE.DataTexture(new Uint8Array(AT*AT).fill(255),AT,AT,THREE.RedFormat,THREE.UnsignedByteType);
  bake.magFilter=bake.minFilter=THREE.LinearFilter; bake.wrapS=bake.wrapT=THREE.RepeatWrapping; bake.generateMipmaps=false; bake.needsUpdate=true; U.uBake.value=bake; U.uBakeSpan.value=BS*CSZ;
  const slot=new Array(BS*BS).fill(null), BL=new THREE.DirectionalLight(0xffffff,0), BPX=new Uint8Array(BM*BM*4), piece=new THREE.DataTexture(new Uint8Array(BP*BP),BP,BP,THREE.RedFormat,THREE.UnsignedByteType);
  const PV=new THREE.Vector2(), bdir=new THREE.Vector3(), BNM=new THREE.Matrix4(), BR=new THREE.Vector3(), BU=new THREE.Vector3(), BC=new THREE.Vector3(), BQ=new THREE.Vector3(), O0=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0);
  BL.castShadow=true; BL.shadow.mapSize.set(BM,BM); BL.shadow.autoUpdate=false; BL.shadow.camera.layers.enable(3); GRASS.baked=0; let bnext=0;
  const BDS=new THREE.Scene(), BDM=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(9,3)),new THREE.MeshBasicMaterial()), BRT=new THREE.WebGLRenderTarget(1,1);   // the shadow pass runs only inside a render: an empty mesh's turn runs it
  BDM.geometry.setDrawRange(0,0); BDM.frustumCulled=false; BDS.add(BDM); BDM.onBeforeRender=()=>{ const hid=[]; for(const o of CLOCK.dyn())if(o.visible){ o.visible=false; hid.push(o); } renderer.shadowMap.render([BL],scene,SHARED.cam); for(const o of hid)o.visible=true; };
  const sl=(a,b)=>(((b%BS)+BS)%BS)*BS+((a%BS)+BS)%BS;
  const ground=(x,z)=>{ const me=WEEDS.chunks&&WEEDS.chunks.get(Math.floor(x/CSZ)+','+Math.floor(z/CSZ)); if(!me||!me.G)return 0; const W=me.N+2*me.MG, i=Math.floor((x-me.x0)/me.CELL), j=Math.floor((z-me.z0)/me.CELL), c=(j+me.MG)*W+i+me.MG; return me.I[c]?me.G[c]:0; };
  const bakeOne=(cx,cz)=>{ const d=CLOCK.dir, x0=cx*CSZ, z0=cz*CSZ, st=CSZ/BP, out=piece.image.data;
    BNM.lookAt(d,O0,UP); BR.setFromMatrixColumn(BNM,0); BU.setFromMatrixColumn(BNM,1); BC.set(x0+CSZ/2,0,z0+CSZ/2); let hr=0, hu=0;
    for(let k=0;k<8;k++){ BQ.set(k&1?x0+CSZ:x0,k&2?3*T:-T,k&4?z0+CSZ:z0).sub(BC); hr=Math.max(hr,Math.abs(BQ.dot(BR))); hu=Math.max(hu,Math.abs(BQ.dot(BU))); }
    Object.assign(BL.shadow.camera,{left:-hr-.25*T,right:hr+.25*T,top:hu+.25*T,bottom:-hu-.25*T,near:1,far:400*T}); BL.shadow.camera.updateProjectionMatrix();
    BL.target.position.copy(BC); BL.position.copy(BC).addScaledVector(d,200*T); BL.target.updateMatrixWorld(); BL.updateMatrixWorld(); BL.shadow.needsUpdate=true;
    { const rt0=renderer.getRenderTarget(), ac=renderer.autoClear; renderer.autoClear=false; renderer.setRenderTarget(BRT); renderer.render(BDS,SHARED.cam); renderer.setRenderTarget(rt0); renderer.autoClear=ac; }
    renderer.readRenderTargetPixels(BL.shadow.map,0,0,BM,BM,BPX);
    const M=BL.shadow.matrix.elements, eps=.08*T/(400*T-1), dep=(px,py)=>{ if(px<0||py<0||px>=BM||py>=BM)return 1; const k=(py*BM+px)*4; return (BPX[k]/16777216+BPX[k+1]/65536+BPX[k+2]/256+BPX[k+3])/256; };
    for(let j=0;j<BP;j++)for(let i=0;i<BP;i++){ const x=x0+(i+.5)*st, z=z0+(j+.5)*st, y=ground(x,z)+.03*T, sx=(M[0]*x+M[4]*y+M[8]*z+M[12])*BM-.5, sy=(M[1]*x+M[5]*y+M[9]*z+M[13])*BM-.5, sz=M[2]*x+M[6]*y+M[10]*z+M[14]-eps;
      const px=Math.floor(sx), py=Math.floor(sy), fx=sx-px, fy=sy-py, l=(a,b)=>sz<=dep(a,b)?1:0;
      out[j*BP+i]=Math.round(255*((l(px,py)*(1-fx)+l(px+1,py)*fx)*(1-fy)+(l(px,py+1)*(1-fx)+l(px+1,py+1)*fx)*fy)); }
    piece.needsUpdate=true; renderer.copyTextureToTexture(PV.set((((cx%BS)+BS)%BS)*BP,(((cz%BS)+BS)%BS)*BP),piece,bake); };
  S=Object.assign({},DEF,PRESETS[cur].values); sync();
  SYS.add('weedsAdd',(key,me)=>{ if(me&&me.I)floor(key,me); },'140b-grassfield'); SYS.add('weedsDrop',key=>{ unfloor(key); const [a,b]=key.split(',').map(Number); for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){ const k=sl(a+i,b+j); if(slot[k]===(a+i)+','+(b+j))slot[k]=null; } },'140b-grassfield');
  if(WEEDS.chunks)for(const [k,me] of WEEDS.chunks)if(me&&me.I)floor(k,me);
  let suns=null; const SP=new THREE.Vector3(), ST=new THREE.Vector3();
  SYS.add('life',()=>{ if(SHARED.LVL!=='up')return;
    // what presses the grass: you, the walkers near you, the trail you leave, and the rocks, logs and trunks round you (the repo's rocks; radii over its radius multiplier)
    const RK=U.uRocks.value, MV=WEEDS.movers, TR=WEEDS.UTR&&WEEDS.UTR.value, rm=S.grRockRadiusMul||1; let n=0; RK[n++].set(pos.x,0,pos.z,.28/rm);
    if(MV)for(let i=1;i<MV.length&&n<MAXR;i++)if(MV[i].w>=.5)RK[n++].set(MV[i].x,0,MV[i].y,.25/rm);
    if(TR)for(let i=0;i<TR.length&&n<10;i++)if(TR[i].w>.05)RK[n++].set(TR[i].x,0,TR[i].y,TR[i].z*.45*Math.min(1,TR[i].w)/rm);
    if(SOL.up){ const near=[]; for(const b of SOL.up){ const cx=(b[0]+b[2])/2, cz=(b[1]+b[3])/2, r=Math.hypot(b[2]-b[0],b[3]-b[1])/2; if(r>2.5*T)continue; const d=Math.hypot(cx-pos.x,cz-pos.z); if(d<8)near.push([d,cx,cz,r]); }
      near.sort((p,q)=>p[0]-q[0]); for(const [,cx,cz,r] of near){ if(n>=MAXR)break; RK[n++].set(cx,0,cz,r/rm); } }
    U.uRockCount.value=n;
    // the baked shadows: all again when the sun's held direction turns (a new look, dusk) or the shadows are switched off or soft (VSM); the chunks round you, nearest first, one at a time
    { const SM=renderer.shadowMap, ok=SM.enabled&&SM.type!==THREE.VSMShadowMap&&!!CLOCK.dir; U.uBakeOn.value=ok?1:0;
      if(ok&&bdir.dot(CLOCK.dir)<.99999){ bdir.copy(CLOCK.dir); slot.fill(null); bake.image.data.fill(255); bake.needsUpdate=true; }
      if(ok&&WEEDS.chunks&&performance.now()>=bnext){ const pcx=Math.floor(pos.x/CSZ), pcz=Math.floor(pos.z/CSZ); let best=null, bd=19;
        for(const k of WEEDS.chunks.keys()){ const [a,b]=k.split(',').map(Number), d=(a-pcx)**2+(b-pcz)**2; if(d<bd&&slot[sl(a,b)]!==k){ bd=d; best=[a,b,k]; } }
        if(best){ const t0=performance.now(); bakeOne(best[0],best[1]); slot[sl(best[0],best[1])]=best[2]; GRASS.baked++; bnext=performance.now()+Math.max(60,(performance.now()-t0)*3); } } }
    { const e=SHARED.cam.matrixWorld.elements, fx=-e[8], fz=-e[10], l=Math.hypot(fx,fz); if(l>.05)U.uFwd.value.set(fx/l,fz/l); if(!U.uGTw.value.x&&SHARED.ppu>0)U.uGTw.value.set(256/SHARED.ppu,256/(SHARED.ppu*Math.max(.2,Math.sin(SHARED.pitch||.52)))); }
    // the sun: its shadows only while it is up, and the light through the blades
    if(!suns){ suns=[]; scene.traverse(o=>{ if(o.isDirectionalLight&&o.castShadow)suns.push(o); }); }
    let sun=null; for(const L of suns)if(!sun||L.intensity>sun.intensity)sun=L;
    U.uSunOn.value=sun&&sun.intensity>0?1:0;
    if(sun){ sun.getWorldPosition(SP); sun.target.getWorldPosition(ST); U.uSunDir.value.subVectors(SP,ST).normalize(); U.uSunColor.value.copy(sun.color).multiplyScalar(sun.intensity); } },'140b-grassfield');
  // the season presets, in ATMOSPHERE
  const ui=()=>{ const P=document.querySelector('[data-p="atmo"]'); if(!P)return setTimeout(ui,1000); if(P.querySelector('#grassp'))return;
    const B=document.createElement('div'); B.id='grassp'; B.innerHTML='<h3>GRASS</h3><div class="row">'+Object.entries(PRESETS).map(([k,p])=>`<button class="btn" data-g="${k}">${p.label}</button>`).join('')+'</div><div class="dim">the grass field\'s season look</div>';
    P.appendChild(B); const mark=()=>B.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===cur)));
    B.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ GRASS.preset(b.dataset.g); mark(); }); mark(); };
  ui(); window.GRASS=GRASS; }
