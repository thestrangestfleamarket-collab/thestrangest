// THE GRASS FIELD: the lawns' grass, after cortiz2894/stylized-components (MIT, Christian Ortiz): on every lawn of the map, built once (the park's when you enter it) and the same everywhere: a floor in the grass's colour and blades over it, thicker in tufts round rocks and trunks, still, pressed flat only where you and the walkers step; its season presets in ATMOSPHERE.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos, ROOMS, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {FADE, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
const GRASS={};
{ const T=TILE, MAXR=24;
  // the repo's settings as its control panel starts them, brighter (owner), and its presets (each applied on top of the default)
  const DEF={grDensity:58,grMinWidth:.14,grMaxWidth:.2,grMinLength:.5,grMaxLength:.85,grTiltMax:.16,grColorBottom:'#4a9a22',grColorTop:'#86c93a',grGradStart:.3,grGradEnd:1,grGradPower:1.6,grBrightness:1.2,
    grShadowStrength:.6,grShadowSampleY:.15,grPatchStrength:.73,grPatchLinkColors:true,grPatchDry:'#b8a94e',grPatchLush:'#6f9a2a',grPatchScale:.9,grPatchBias:1.6,
    grRockFlatten:1,grRockBend:.41,grRockRadiusMul:.2,grRockFalloff:.35,grTransColor:'#c1e54d',grTransStrength:1,grTransPower:6.4,grTransTip:1,grTransShadow:1};
  const PRESETS={default:{label:'SPRING',values:{}},
    autumn:{label:'AUTUMN',values:{grColorBottom:'#7e8005',grColorTop:'#d2db18',grTransColor:'#f8f454',grTransStrength:1.2}},
    mars:{label:'MARS',values:{grMinWidth:.2,grMaxWidth:.08,grMinLength:.8,grMaxLength:1.35,grColorBottom:'#c7611a',grColorTop:'#f879e7',grGradStart:.14,grGradEnd:.75,grBrightness:.9,grTransColor:'#ffffff',grTransStrength:1}}};
  const F=v=>({value:v}), C=()=>new THREE.Color();
  const U={uGrassBottom:F(C()),uGrassTop:F(C()),uBrightness:F(1),uGradStart:F(0),uGradEnd:F(1),uGradPower:F(1),uPatchStrength:F(0),uShadowStrength:F(0),uShadowSampleY:F(0),uSunOn:F(1),
    uRocks:F([...Array(MAXR)].map(()=>new THREE.Vector4())),uRockCount:F(0),uRockRadiusMul:F(1),uRockFalloff:F(.35),uRockFlatten:F(1),uRockBend:F(0),uSunDir:F(new THREE.Vector3(0,1,0)),uSunColor:F(new THREE.Color(1,1,1)),
    uTransColor:F(C()),uTransStrength:F(0),uTransPower:F(1),uTransTip:F(1),uTransShadow:F(1)};
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
  // one shadow sample at a point (a blade's, so it is wholly in or out; the floor's own point), the darkest of the suns' maps while the sun is up; Lambert's own sun shadow is switched off
  const SHFRAG=`uniform float uSunOn;
#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
  uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
  float grassShadow(vec3 p){ if(uSunOn<.5)return 1.; float s=1.; DirectionalLightShadow dls;
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
      dls=directionalLightShadows[ i ]; s=min(s,getShadow(directionalShadowMap[ i ],dls.shadowMapSize,dls.shadowBias,dls.shadowRadius,directionalShadowMatrix[ i ]*vec4(p,1.)));
    }
    #pragma unroll_loop_end
    return s; }
#else
  float grassShadow(vec3 p){ return 1.; }
#endif
`;
  const KILLSH=THREE.ShaderChunk.shadowmap_vertex.replace('vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;','vDirectionalShadowCoord[ i ] = vec4(2.,2.,2.,1.);');   // the suns' own shadow off (outside their maps); lamps and their shadows as usual
  // a blade: the repo's tapered strip, base width 1 and height 1, scaled by its instance
  const bladeGeo=seg=>{ const hw=t=>.5*Math.pow(1-t,1.2), P=[], I=[]; for(let i=0;i<seg;i++){ const t=i/seg, w=hw(t); P.push(-w,t,0,w,t,0); } P.push(0,1,0);
    for(let i=0;i<seg-1;i++){ const l=i*2; I.push(l,l+2,l+1,l+1,l+2,l+3); } const L=(seg-1)*2; I.push(L,seg*2,L+1);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals(); return g; };
  const BG=bladeGeo(2);
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
  bmat.customProgramCacheKey=()=>'grassblade3';
  // the floor: the lawn's own ground in the grass's colour, painted once into its corners
  const gmat=new THREE.MeshLambertMaterial({side:THREE.FrontSide,vertexColors:true});
  gmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vGndW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vGndW=(modelMatrix*vec4(transformed,1.)).xyz;').replace('#include <shadowmap_vertex>',KILLSH);
    sh.fragmentShader='varying vec3 vGndW; uniform float uShadowStrength;\n'+sh.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n'+SHFRAG)
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n  gl_FragColor.rgb*=(1.-uShadowStrength*(1.-grassShadow(vGndW)));'); };
  gmat.customProgramCacheKey=()=>'grassfloor3';
  const CH=new Map(); GRASS.chunks=CH; GRASS.n=0; GRASS.area=0; GRASS.stop=0; GRASS.px=0; GRASS.pz=0;   // per chunk of the map: its floor and blades, built once
  const tint=new THREE.Color(), pc=new THREE.Color(), base=new THREE.Color(), SPILL=[1,1,.7,.35];
  const paint=(m,P)=>{ const col=m.geometry.attributes.color.array; base.copy(U.uGrassBottom.value); for(let i=0;i<P.length;i+=3){ patch(P[i],P[i+2],pc); tint.copy(base).lerp(pc,S.grPatchStrength).multiplyScalar(S.grBrightness); col[i]=tint.r; col[i+1]=tint.g; col[i+2]=tint.b; } m.geometry.attributes.color.needsUpdate=true; };
  const make=(cx,cz)=>{ const me=WEEDS.lawnMask(cx,cz); const {x0,z0,N,CELL,MG}=me, W=N+2*MG, ci=(i,j)=>(j+MG)*W+i+MG, N1=N+1, VI=new Int32Array(N1*N1).fill(-1), P=[], IX=[];
    if(!me.I.some(Boolean))return null;
    // the lawn wider: the floor two squares out, under the paths' edges; the blades three, thinning as they go, so the grass spills messily over the edges of paths and walls
    let I=me.I, G=me.G; const RG=new Uint8Array(I.length); for(let r=0;r<3;r++){ const I2=new Uint8Array(I), G2=new Float32Array(G); for(let j=-MG+1;j<N+MG-1;j++)for(let i=-MG+1;i<N+MG-1;i++){ const c=ci(i,j); if(I[c])continue; let g=0, n=0; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const d=ci(i+di,j+dj); if(I[d]){ g+=G[d]; n++; } } if(n){ I2[c]=1; G2[c]=g/n; RG[c]=r+1; } } I=I2; G=G2; }
    const v=(a,b)=>{ const k=b*N1+a; if(VI[k]>=0)return VI[k]; let g=0, n=0, ox=0, oz=0; for(const [di,dj] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const c=ci(a+di,b+dj); if(I[c]){ g+=G[c]; n++; ox+=di+.5; oz+=dj+.5; } }
      const f=n===1?.5:n===3?-.5:0, x=x0+(a+ox*f)*CELL, z=z0+(b+oz*f)*CELL; P.push(x,SHARED.groundY(x,z)+.015*T,z); return VI[k]=P.length/3-1; };   // on the real ground (the park's hills too)
    const QT=[], QR=[]; for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const c=ci(i,j); if(!I[c])continue; const A=v(i,j), B=v(i+1,j), Cc=v(i,j+1), D=v(i+1,j+1); if(RG[c]<3)IX.push(A,Cc,B,B,Cc,D); QT.push(A,Cc,B,B,Cc,D); QR.push(RG[c],RG[c]); }
    const grp=new THREE.Group(); grp.userData.grass=1;
    if(IX.length){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(P.map((_,i)=>i%3===1?1:0),3)); g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(P.length),3)); g.setIndex(IX);
      const m=new THREE.Mesh(g,gmat); m.receiveShadow=true; m.raycast=()=>{}; paint(m,P); grp.add(m); grp.floor=m; grp.P=P; }
    // the blades: area-weighted over the triangles (a triangle by its area, then a uniform point in it), seeded so the field is the same every time, each blade's patch colour fixed in
    const cum=[]; let A=0, A0=0; for(let t=0;t<QT.length;t+=3){ const a=QT[t]*3, b=QT[t+1]*3, c=QT[t+2]*3, ux=P[b]-P[a], uy=P[b+1]-P[a+1], uz=P[b+2]-P[a+2], vx=P[c]-P[a], vy=P[c+1]-P[a+1], vz=P[c+2]-P[a+2], ar=.5*Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx); A+=ar; if(!QR[t/3])A0+=ar; cum.push(A); }
    let s0=((cx*73856093)^(cz*19349663))>>>0||1; const R=()=>{ s0=(s0*16807)%2147483647; return s0/2147483647; };
    const M=new THREE.Matrix4(), Qn=new THREE.Quaternion(), E=new THREE.Euler(), Sc=new THREE.Vector3(), V=new THREE.Vector3(), MS=[], AP=[];
    const put=(x,y,z,lm,wm)=>{ E.set((R()-.5)*2*S.grTiltMax,R()*Math.PI*2,(R()-.5)*S.grTiltMax*.5); Qn.setFromEuler(E); Sc.set((S.grMinWidth+R()*(S.grMaxWidth-S.grMinWidth))*wm,(S.grMinLength+R()*(S.grMaxLength-S.grMinLength))*lm,1);
      MS.push(M.compose(V.set(x,y,z),Qn,Sc).clone()); patch(x,z,pc); AP.push(pc.r,pc.g,pc.b); };
    const n=Math.round(S.grDensity*A);
    for(let i=0;i<n;i++){ const r=R()*A; let lo=0, hi=cum.length-1; while(lo<hi){ const mid=(lo+hi)>>1; if(cum[mid]<r)lo=mid+1; else hi=mid; } const t=lo*3, pa=QT[t]*3, pb=QT[t+1]*3, pc2=QT[t+2]*3, rg=QR[lo];
      let u=R(), w=R(); if(u+w>1){ u=1-u; w=1-w; } if(rg&&R()>SPILL[rg])continue;
      put(P[pa]+(P[pb]-P[pa])*u+(P[pc2]-P[pa])*w,P[pa+1]+(P[pb+1]-P[pa+1])*u+(P[pc2+1]-P[pa+1])*w,P[pa+2]+(P[pb+2]-P[pa+2])*u+(P[pc2+2]-P[pa+2])*w,rg?.55+R()*.75:1,1); }
    // tufts: thicker, taller grass round the foot of every rock, log, post and trunk on the lawn
    const gAt=(x,z)=>{ const i=Math.floor((x-x0)/CELL), j=Math.floor((z-z0)/CELL); if(i<0||j<0||i>=N||j>=N)return null; const c=ci(i,j); return I[c]?SHARED.groundY(x,z)+.015*T:null; };
    const t0=performance.now(); for(const b of SOL.up){ if(b[2]<x0-T||b[0]>x0+N*CELL+T||b[3]<z0-T||b[1]>z0+N*CELL+T)continue; const w=b[2]-b[0], d=b[3]-b[1]; if(Math.max(w,d)>5*T||Math.min(w,d)<.03*T)continue;
      const cx2=(b[0]+b[2])/2, cz2=(b[1]+b[3])/2, rx=w/2, rz=d/2, k=Math.min(240,Math.ceil(2*(w+d)*40));
      for(let q=0;q<k;q++){ const a=R()*Math.PI*2, o=Math.pow(R(),1.6)*.45, x=cx2+Math.cos(a)*(rx+o), z=cz2+Math.sin(a)*(rz+o); if(x<x0||z<z0||x>=x0+N*CELL||z>=z0+N*CELL)continue; const y=gAt(x,z); if(y==null)continue; put(x,y,z,1.25+R()*.45*(1-o/.45),.85); } }
    if(MS.length){ const im=new THREE.InstancedMesh(BG,bmat,MS.length); MS.forEach((m,i)=>im.setMatrixAt(i,m)); im.geometry=BG.clone(); im.geometry.setAttribute('aPatch',new THREE.InstancedBufferAttribute(new Float32Array(AP),3));
      im.computeBoundingSphere(); im.receiveShadow=true; im.raycast=()=>{}; grp.add(im); grp.blades=im; }
    GRASS.ms=(GRASS.ms||0)+performance.now()-t0; grp.n=MS.length; grp.A=A0; grp.c=[x0+N*CELL/2,z0+N*CELL/2]; MAPG.bodega.add(grp); return grp; };
  const unmake=grp=>{ if(!grp)return; MAPG.bodega.remove(grp); grp.traverse(o=>{ if(o.geometry&&o.geometry!==BG)o.geometry.dispose(); if(o.isInstancedMesh)o.dispose(); }); GRASS.n-=grp.n||0; GRASS.area-=grp.A||0; };
  // what to build: every chunk of the map once, nearest first; again where the land is edited; the park's only while you are in it (its water and paths are there then)
  const Q=new Set(), inPark=(cx,cz)=>{ if(!PARK.rect)return false; const r=PARK.rect(), cs=WEEDS.CS; return (cx+1)*cs>r[0]&&cx*cs<r[2]&&(cz+1)*cs>r[1]&&cz*cs<r[3]; };
  let queued=false; const fill=()=>{ const B=SHARED.BOUND, cs=WEEDS.CS; if(!B||!cs)return false; for(let cz=Math.floor(B.z0/cs);cz<=Math.floor(B.z1/cs);cz++)for(let cx=Math.floor(B.x0/cs);cx<=Math.floor(B.x1/cs);cx++)Q.add(cx+','+cz); return true; };
  SYS.add('lawnEdit',r=>{ const cs=WEEDS.CS; if(!cs)return; for(let cz=Math.floor(r[1]/cs)-1;cz<=Math.floor(r[3]/cs)+1;cz++)for(let cx=Math.floor(r[0]/cs)-1;cx<=Math.floor(r[2]/cs)+1;cx++){ if(Math.abs(cx)>4e3||Math.abs(cz)>4e3)continue; const k=cx+','+cz; if(CH.has(k)||queued)Q.add(k); } },'140b-grassfield');
  WEEDS.hideForMask=hid=>{ for(const g of CH.values())if(g&&g.visible)hid.push(g); };
  GRASS.rebuild=()=>{ for(const k of CH.keys())Q.add(k); };
  let suns=null; const SP=new THREE.Vector3(), ST=new THREE.Vector3();
  SYS.add('life',()=>{ if(SHARED.LVL!=='up'||!WEEDS.lawnMask||!window.__started)return;
    if(!queued)queued=fill();
    if(Q.size&&!(ROOMS&&ROOMS.cur)){ const t0=performance.now(), budget=window.FADE&&FADE.busy?40:6, ks=[...Q].map(k=>{ const [a,b]=k.split(',').map(Number); return [Math.hypot((a+.5)*WEEDS.CS-pos.x,(b+.5)*WEEDS.CS-pos.z),k,a,b]; }).sort((p,q)=>p[0]-q[0]);
      for(const [,k,a,b] of ks){ if(performance.now()-t0>budget)break; if(inPark(a,b)&&!PARK.in)continue; Q.delete(k); const old=CH.get(k); const tm=performance.now(); const g=make(a,b); GRASS.mk=(GRASS.mk||0)+performance.now()-tm; GRASS.built=(GRASS.built||0)+1; unmake(old); if(g){ CH.set(k,g); GRASS.n+=g.n; GRASS.area+=g.A; } else CH.delete(k); } }
    // drawn out to where the haze has them; only ever shown or hidden, never rebuilt
    for(const g of CH.values()){ if(!g)continue; const d=Math.hypot(g.c[0]-pos.x,g.c[1]-pos.z); g.visible=d<90*T&&!(ROOMS&&ROOMS.cur); }
    // what presses the grass: you (until you stand still), the walkers near you, the trail you leave
    const RK=U.uRocks.value, MV=WEEDS.movers, TR=WEEDS.UTR&&WEEDS.UTR.value, rm=S.grRockRadiusMul||1; let n=0; const now=performance.now()/1e3; if(Math.hypot(pos.x-GRASS.px,pos.z-GRASS.pz)>.004*T)GRASS.stop=now; GRASS.px=pos.x; GRASS.pz=pos.z;
    let up=Math.max(0,Math.min(1,(now-GRASS.stop-.5)/1.5)); up=up*up*(3-2*up); const keep=1-up;   // half a second after you stop, the grass round your legs stands back up
    if(keep>.02)RK[n++].set(pos.x,0,pos.z,.28*keep/rm);
    if(MV)for(let i=1;i<MV.length&&n<MAXR;i++)if(MV[i].w>=.5)RK[n++].set(MV[i].x,0,MV[i].y,.25/rm);
    if(TR)for(let i=0;i<TR.length&&n<12;i++)if(TR[i].w>.05&&(i>1||keep>.02))RK[n++].set(TR[i].x,0,TR[i].y,TR[i].z*.45*Math.min(1,TR[i].w)*(i>1?1:keep)/rm);
    U.uRockCount.value=n;
    // the sun: its shadows only while it is up, and the light through the blades
    if(!suns){ suns=[]; scene.traverse(o=>{ if(o.isDirectionalLight&&o.castShadow)suns.push(o); }); }
    let sun=null; for(const L of suns)if(!sun||L.intensity>sun.intensity)sun=L;
    U.uSunOn.value=sun&&sun.intensity>0?1:0;
    if(sun){ sun.getWorldPosition(SP); sun.target.getWorldPosition(ST); U.uSunDir.value.subVectors(SP,ST).normalize(); U.uSunColor.value.copy(sun.color).multiplyScalar(sun.intensity); } },'140b-grassfield');
  GRASS.preset=k=>{ if(!PRESETS[k])return; cur=k; S=Object.assign({},DEF,PRESETS[k].values); sync(); try{ SAVE.set('grass',k); }catch(e){} GRASS.rebuild(); };   // baked: a new look rebakes the field
  GRASS.PRESETS=PRESETS; GRASS.U=U; GRASS.get=()=>Object.assign({},S); GRASS.cur=()=>cur;
  S=Object.assign({},DEF,PRESETS[cur].values); sync();
  // the season presets, in ATMOSPHERE
  const ui=()=>{ const P=document.querySelector('[data-p="atmo"]'); if(!P)return setTimeout(ui,1000); if(P.querySelector('#grassp'))return;
    const B=document.createElement('div'); B.id='grassp'; B.innerHTML='<h3>GRASS</h3><div class="row">'+Object.entries(PRESETS).map(([k,p])=>`<button class="btn" data-g="${k}">${p.label}</button>`).join('')+'</div><div class="dim">the grass field\'s season look</div>';
    P.appendChild(B); const mark=()=>B.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===cur)));
    B.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ GRASS.preset(b.dataset.g); mark(); }); mark(); };
  ui(); window.GRASS=GRASS; }
