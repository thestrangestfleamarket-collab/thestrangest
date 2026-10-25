// THE GRASS FIELD: the lawns' grass, ported from cortiz2894/stylized-components (MIT, Christian Ortiz): a floor in the grass's own colour with bare-dirt patches under every lawn, and thin wind-blown blades on it all round you, pressed flat and splayed where you, the walkers and the rocks and trunks stand; its season presets in ATMOSPHERE.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {MAPG, SOL, SYS, TILE} from './006-map-pre.js';
const GRASS={};
{ const T=TILE, MAXR=24;
  // the repo's settings as its control panel starts them, and its presets (each applied on top of the default)
  const DEF={grDensity:300,grMaxCount:160000,grMinWidth:.06,grMaxWidth:.06,grMinLength:.375,grMaxLength:.625,grTiltMax:.16,grSegments:3,grColorBottom:'#4f7c13',grColorTop:'#79a01c',grGradStart:.15,grGradEnd:1,grGradPower:1.6,grBrightness:.8,
    grShadowStrength:.35,grShadowSampleY:.15,grTintFloor:true,grFlatFloorNormal:1,grPatchStrength:.73,grPatchLinkColors:true,grPatchDry:'#b8a94e',grPatchLush:'#6f9a2a',grPatchScale:.9,grPatchBias:1.6,
    grDirtColor:'#ac956c',grDirtCoverage:0,grDirtScale:.4,grDirtSoftness:.06,grDirtWarp:.2,grDirtCut:1,grDirtBlend:.8,grGndVarColor:'#c4a77d',grGndVarStrength:.9,grGndVarScale:1.24,grGndGrainStrength:.95,grGndGrainScale:6.7,grGndReliefStrength:0,grGndReliefScale:.05,
    grRockFlatten:1,grRockBend:.41,grRockRadiusMul:.2,grRockFalloff:.35,grTransColor:'#c1e54d',grTransStrength:2.5,grTransPower:6.4,grTransTip:1,grTransShadow:1,grWindStrength:.1,grWindSpeed:1.3,grWindFreq:.47,grWindDir:243,grWindTurb:.04,grWindLean:.05};
  const PRESETS={default:{label:'SPRING',values:{}},
    autumn:{label:'AUTUMN',values:{grColorBottom:'#7e8005',grColorTop:'#d2db18',grDirtColor:'#e2b329',grDirtScale:.26,grDirtSoftness:.11,grDirtCut:.7,grDirtBlend:1,grGndVarColor:'#ffc866',grGndVarStrength:.9,grTransColor:'#f8f454',grTransStrength:3}},
    mars:{label:'MARS',values:{grMinWidth:.08,grMaxWidth:.025,grMinLength:.6,grMaxLength:1,grColorBottom:'#c7611a',grColorTop:'#f879e7',grGradStart:.14,grGradEnd:.75,grBrightness:.9,grDirtColor:'#66cde5',grDirtScale:.28,grDirtSoftness:.13,grGndVarColor:'#8386ff',grTransColor:'#ffffff',grTransStrength:2.5,grWindStrength:.081,grWindSpeed:2.2}}};
  const C=()=>new THREE.Color(), V2=()=>new THREE.Vector2(), F=v=>({value:v});
  const U={uTime:PARK.sway,uWindStrength:F(0),uWindSpeed:F(0),uWindFreq:F(0),uWindTurb:F(0),uWindLean:F(0),uWindDir:F(V2()),uGrassBottom:F(C()),uGrassTop:F(C()),uBrightness:F(0),uGradStart:F(0),uGradEnd:F(1),uGradPower:F(1),
    uPatchLush:F(C()),uPatchDry:F(C()),uPatchStrength:F(0),uPatchScale:F(1),uPatchBias:F(1),uShadowStrength:F(0),uShadowSampleY:F(0),uDirtColor:F(C()),uDirtScale:F(1),uDirtCoverage:F(0),uDirtSoftness:F(.1),uDirtWarp:F(0),uDirtCut:F(1),uDirtBlend:F(1),
    uRocks:F([...Array(MAXR)].map(()=>new THREE.Vector4())),uRockCount:F(0),uRockRadiusMul:F(1),uRockFalloff:F(.35),uRockFlatten:F(1),uRockBend:F(0),uSunDir:F(new THREE.Vector3(0,1,0)),uSunColor:F(new THREE.Color(1,1,1)),
    uTransColor:F(C()),uTransStrength:F(0),uTransPower:F(1),uTransTip:F(1),uTransShadow:F(1),uTintFloor:F(1),uFlatFloorNormal:F(1),uGndVarColor:F(C()),uGndVarScale:F(1),uGndVarStrength:F(0),uGndGrainScale:F(1),uGndGrainStrength:F(0),uGndReliefScale:F(1),uGndReliefStrength:F(0)};
  let S=Object.assign({},DEF), cur='default'; try{ const k=SAVE.get('grass'); if(k&&PRESETS[k])cur=k; }catch(e){}
  const sync=()=>{ const u=U, a=S.grWindDir*Math.PI/180; u.uWindDir.value.set(Math.cos(a),Math.sin(a));
    for(const [k,g] of [['uWindStrength','grWindStrength'],['uWindSpeed','grWindSpeed'],['uWindFreq','grWindFreq'],['uWindTurb','grWindTurb'],['uWindLean','grWindLean'],['uGradStart','grGradStart'],['uGradEnd','grGradEnd'],['uGradPower','grGradPower'],['uBrightness','grBrightness'],
      ['uPatchStrength','grPatchStrength'],['uPatchScale','grPatchScale'],['uPatchBias','grPatchBias'],['uShadowStrength','grShadowStrength'],['uShadowSampleY','grShadowSampleY'],['uTransStrength','grTransStrength'],['uTransPower','grTransPower'],['uTransTip','grTransTip'],['uTransShadow','grTransShadow'],
      ['uRockFlatten','grRockFlatten'],['uRockBend','grRockBend'],['uRockRadiusMul','grRockRadiusMul'],['uRockFalloff','grRockFalloff'],['uFlatFloorNormal','grFlatFloorNormal'],['uDirtCoverage','grDirtCoverage'],['uDirtScale','grDirtScale'],['uDirtSoftness','grDirtSoftness'],
      ['uDirtWarp','grDirtWarp'],['uDirtCut','grDirtCut'],['uDirtBlend','grDirtBlend'],['uGndVarScale','grGndVarScale'],['uGndVarStrength','grGndVarStrength'],['uGndGrainScale','grGndGrainScale'],['uGndGrainStrength','grGndGrainStrength'],['uGndReliefScale','grGndReliefScale'],['uGndReliefStrength','grGndReliefStrength']])u[k].value=S[g];
    u.uGrassBottom.value.set(S.grColorBottom); u.uGrassTop.value.set(S.grColorTop); u.uPatchLush.value.set(S.grPatchLinkColors?S.grColorBottom:S.grPatchLush); u.uPatchDry.value.set(S.grPatchLinkColors?S.grColorTop:S.grPatchDry);
    u.uTransColor.value.set(S.grTransColor); u.uDirtColor.value.set(S.grDirtColor); u.uGndVarColor.value.set(S.grGndVarColor); u.uTintFloor.value=S.grTintFloor?1:0; };
  GRASS.preset=k=>{ if(!PRESETS[k])return; const sz=['grMinWidth','grMaxWidth','grMinLength','grMaxLength'].map(n=>S[n]).join(); cur=k; S=Object.assign({},DEF,PRESETS[k].values); sync(); try{ SAVE.set('grass',k); }catch(e){}
    if(sz!==['grMinWidth','grMaxWidth','grMinLength','grMaxLength'].map(n=>S[n]).join())for(const f of FL.values())for(let q=0;q<4;q++)unblade(f,q); };
  GRASS.PRESETS=PRESETS; GRASS.U=U; GRASS.get=()=>Object.assign({},S); GRASS.cur=()=>cur;
  S=Object.assign({},DEF,PRESETS[cur].values); sync();
  const MASK=`uniform vec3 uDirtColor; uniform float uDirtScale, uDirtCoverage, uDirtSoftness, uDirtWarp;
  float _gmHash(vec2 p){ p=fract(p*vec2(127.1,311.7)); p+=dot(p,p+19.19); return fract(p.x*p.y); }
  float _gmNoise(vec2 p){ vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f); return mix(mix(_gmHash(i),_gmHash(i+vec2(1.,0.)),u.x),mix(_gmHash(i+vec2(0.,1.)),_gmHash(i+vec2(1.,1.)),u.x),u.y); }
  float _gmFbm(vec2 p){ float v=0., a=.5, n=0.; for(int i=0;i<4;i++){ v+=a*_gmNoise(p); n+=a; p=p*2.03+vec2(3.1,7.7); a*=.5; } return v/max(n,.001); }
  float groundDirt(vec2 w){ vec2 p=w*uDirtScale; if(uDirtWarp>0.){ vec2 q=vec2(_gmFbm(p+vec2(11.3,2.7)),_gmFbm(p+vec2(5.9,17.1))); p+=(q-.5)*uDirtWarp; } float n=_gmFbm(p), th=1.-uDirtCoverage; return smoothstep(th-uDirtSoftness,th+uDirtSoftness,n); }
`;
  // one shadow sample at a point (a blade's, so it is wholly in or out; the floor's own point), the darkest of the suns that are lit; Lambert's own shadow is switched off
  const SHFRAG=`#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
  uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
  float grassShadow(vec3 p){ float s=1.; DirectionalLightShadow dls;
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
  const KILLSH=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )
  vec4 worldPosition=vec4(1e6,1e6,1e6,1.);
#endif`;
  // a blade: a tapered strip, base width 1 and height 1, scaled by its instance
  const bladeGeo=seg=>{ const hw=t=>.5*Math.pow(1-t,1.2), P=[], I=[]; for(let i=0;i<seg;i++){ const t=i/seg, w=hw(t); P.push(-w,t,0,w,t,0); } P.push(0,1,0);
    for(let i=0;i<seg-1;i++){ const l=i*2; I.push(l,l+2,l+1,l+1,l+2,l+3); } const L=(seg-1)*2; I.push(L,seg*2,L+1);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals(); return g; };
  const BG=bladeGeo(DEF.grSegments), BG2=bladeGeo(2), LOD=[{to:8,dens:1,w:1,g:BG},{to:17,dens:.3,w:2.4,g:BG2},{to:29,dens:.09,w:5,g:BG2}];
  const bmat=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
  bmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
  #define MAX_ROCKS ${MAXR}
  ${MASK}
  uniform float uTime, uWindStrength, uWindSpeed, uWindFreq, uWindTurb, uWindLean, uPatchScale, uDirtCut, uRockRadiusMul, uRockFalloff, uRockFlatten, uRockBend, uShadowSampleY; uniform vec2 uWindDir; uniform vec4 uRocks[MAX_ROCKS]; uniform int uRockCount;
  varying float vBH, vDirt, vPatch; varying vec3 vWorldPos, vBladeN, vShP;`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
  vec2 baseXZ=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xz; vDirt=groundDirt(baseXZ); vPatch=_gmFbm(baseXZ*uPatchScale);
  float rockInfl=0.; vec2 rockAway=vec2(1.,0.);
  for(int i=0;i<MAX_ROCKS;i++){ if(i>=uRockCount)break; vec4 rock=uRocks[i]; vec2 d=baseXZ-rock.xz; float dist=length(d), rad=rock.w*uRockRadiusMul, infl=1.-smoothstep(rad,rad+uRockFalloff,dist); if(infl>rockInfl){ rockInfl=infl; rockAway=dist>1e-4?d/dist:vec2(1.,0.); } }
  float shrink=(1.-uDirtCut*vDirt)*(1.-uRockFlatten*rockInfl); transformed.y*=shrink; vBH=position.y*shrink; float hMask=vBH*vBH;
  vec3 wPos=(instanceMatrix*vec4(position,1.)).xyz; vWorldPos=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;
  float primary=sin(dot(wPos.xz,uWindDir)*uWindFreq+uTime*uWindSpeed), second=sin(dot(wPos.xz,uWindDir)*uWindFreq*2.6+uTime*uWindSpeed*1.8+1.3)*.35; vec2 perp=vec2(-uWindDir.y,uWindDir.x);
  float turb=sin(dot(wPos.xz,perp)*uWindFreq*1.9+uTime*uWindSpeed*.7+2.6)*uWindTurb, swing=(primary+second+turb)*uWindStrength*hMask, lean=uWindLean*hMask;
  mat3 instRot=mat3(normalize(vec3(instanceMatrix[0])),normalize(vec3(instanceMatrix[1])),normalize(vec3(instanceMatrix[2])));
  transformed+=transpose(instRot)*vec3(uWindDir.x,0.,uWindDir.y)*(swing+lean);
  if(rockInfl>.001)transformed+=transpose(instRot)*vec3(rockAway.x,0.,rockAway.y)*(uRockBend*rockInfl*hMask);
  vBladeN=normalize(mat3(modelMatrix)*instRot*normal);
  vShP=mix((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,(modelMatrix*instanceMatrix*vec4(0.,1.,0.,1.)).xyz,uShadowSampleY);`)
    .replace('#include <worldpos_vertex>',KILLSH)
    .replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n  transformedNormal=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));');
    sh.fragmentShader=`varying float vBH, vDirt, vPatch; varying vec3 vWorldPos, vBladeN, vShP;
  uniform vec3 uGrassBottom, uGrassTop, uDirtColor, uPatchLush, uPatchDry, uSunDir, uSunColor, uTransColor; uniform float uBrightness, uGradStart, uGradEnd, uGradPower, uDirtBlend, uPatchStrength, uPatchBias, uShadowStrength, uTransStrength, uTransPower, uTransTip, uTransShadow;
`+sh.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n'+SHFRAG)
      .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n  normal=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`float _gT=pow(clamp((vBH-uGradStart)/max(uGradEnd-uGradStart,.001),0.,1.),uGradPower); vec3 _bladeCol=mix(uGrassBottom,uGrassTop,_gT);
  float _pt=pow(clamp(vPatch,0.,1.),uPatchBias); _bladeCol=mix(_bladeCol,mix(uPatchLush,uPatchDry,_pt),uPatchStrength); _bladeCol=mix(_bladeCol,uDirtColor,vDirt*uDirtBlend);
  vec4 diffuseColor=vec4(_bladeCol*uBrightness,opacity);`)
      .replace('#include <opaque_fragment>',`#include <opaque_fragment>
  { float _shadow=grassShadow(vShP); gl_FragColor.rgb*=(1.-uShadowStrength*(1.-_shadow));
    vec3 _L=normalize(uSunDir), _V=normalize(cameraPosition-vWorldPos); float _back=pow(max(dot(_V,-_L),0.),uTransPower), _thin=mix(1.,vBH,uTransTip), _edge=1.-abs(dot(normalize(vBladeN),_L)), _sh=mix(1.,_shadow,uTransShadow);
    gl_FragColor.rgb+=uTransColor*uSunColor*uTransStrength*_back*_thin*_edge*_sh; }`); };
  bmat.customProgramCacheKey=()=>'grassblade2';
  // the floor: the lawn's own ground, tinted to the grass and painted with the dirt patches
  const gmat=new THREE.MeshLambertMaterial({side:THREE.FrontSide});
  gmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader='uniform float uFlatFloorNormal; varying vec3 vGndW;\n'+sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n  vec3 _upView=normalize(mat3(viewMatrix)*vec3(0.,1.,0.)); transformedNormal=normalize(mix(transformedNormal,_upView,uFlatFloorNormal));')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n  vGndW=(modelMatrix*vec4(transformed,1.)).xyz;').replace('#include <worldpos_vertex>',KILLSH);
    sh.fragmentShader=`varying vec3 vGndW; uniform vec3 uGrassBottom, uPatchLush, uPatchDry, uGndVarColor; uniform float uBrightness, uTintFloor, uPatchStrength, uPatchScale, uPatchBias, uGndVarScale, uGndVarStrength, uGndGrainScale, uGndGrainStrength, uGndReliefScale, uGndReliefStrength, uShadowStrength;
${MASK}`+sh.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n'+SHFRAG)
      .replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
  if(uGndReliefStrength>.001){ vec2 _rp=vGndW.xz*uGndReliefScale; float _e=.5, _hL=_gmFbm(_rp-vec2(_e,0.)), _hR=_gmFbm(_rp+vec2(_e,0.)), _hD=_gmFbm(_rp-vec2(0.,_e)), _hU=_gmFbm(_rp+vec2(0.,_e)); vec3 _wn=normalize(vec3(-(_hR-_hL),1.,-(_hU-_hD))*vec3(uGndReliefStrength,1.,uGndReliefStrength)); normal=normalize(mat3(viewMatrix)*_wn); }`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`vec2 vGndXZ=vGndW.xz; float _dirt=groundDirt(vGndXZ); float _pt=pow(clamp(_gmFbm(vGndXZ*uPatchScale),0.,1.),uPatchBias); vec3 _grassTint=mix(uGrassBottom,mix(uPatchLush,uPatchDry,_pt),uPatchStrength);
  vec3 _gndCol=mix(diffuse,_grassTint*uBrightness,uTintFloor); _gndCol=mix(_gndCol,uDirtColor*uBrightness,_dirt);
  float _var=_gmFbm(vGndXZ*uGndVarScale)-.5, _grain=_gmFbm(vGndXZ*uGndGrainScale)-.5; vec3 _varCol=uGndVarColor*uBrightness;
  _gndCol+=(_varCol-_gndCol)*_var*uGndVarStrength*_dirt; _gndCol+=(_varCol-_gndCol)*_grain*uGndGrainStrength*_dirt; _gndCol=max(_gndCol,vec3(0.));
  vec4 diffuseColor=vec4(_gndCol,opacity);`)
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n  gl_FragColor.rgb*=(1.-uShadowStrength*(1.-grassShadow(vGndW)));'); };
  gmat.customProgramCacheKey=()=>'grassfloor2';
  const FL=new Map(); GRASS.floors=FL; GRASS.n=0;   // per lawn chunk: its floor and its four quarters' blades
  const floor=(key,me)=>{ const {I,G,x0,z0,N,CELL,MG}=me, W=N+2*MG, ci=(i,j)=>(j+MG)*W+i+MG, N1=N+1, VI=new Int32Array(N1*N1).fill(-1), P=[], IX=[];
    const v=(a,b)=>{ const k=b*N1+a; if(VI[k]>=0)return VI[k]; let g=0, n=0, ox=0, oz=0; for(const [di,dj] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const c=ci(a+di,b+dj); if(I[c]){ g+=G[c]; n++; ox+=di+.5; oz+=dj+.5; } }
      const f=n===1?.5:n===3?-.5:0; P.push(x0+(a+ox*f)*CELL,g/n+.015*T,z0+(b+oz*f)*CELL); return VI[k]=P.length/3-1; };
    const QT=[[],[],[],[]], h=N/2;   // each quarter's floor triangles, for the scatter
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ if(!I[ci(i,j)])continue; const A=v(i,j), B=v(i+1,j), Cc=v(i,j+1), D=v(i+1,j+1), q=(i>=h?1:0)+(j>=h?2:0); IX.push(A,Cc,B,B,Cc,D); QT[q].push(A,Cc,B,B,Cc,D); }
    if(!IX.length)return; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(IX); g.computeVertexNormals();
    const m=new THREE.Mesh(g,gmat); m.receiveShadow=true; m.raycast=()=>{}; MAPG.bodega.add(m); FL.set(key,{me,m,P,QT,q:[null,null,null,null]}); };
  const unfloor=key=>{ const f=FL.get(key); if(!f)return; MAPG.bodega.remove(f.m); f.m.geometry.dispose(); for(let k=0;k<4;k++)unblade(f,k); FL.delete(key); };
  // a quarter's blades: area-weighted over its floor triangles (a triangle by its area, then a uniform point in it), seeded so the field is the same every time
  const area=(f,k)=>{ const P=f.P, Q=f.QT[k], cum=[]; let A=0; for(let t=0;t<Q.length;t+=3){ const a=Q[t]*3, b=Q[t+1]*3, c=Q[t+2]*3, ux=P[b]-P[a], uy=P[b+1]-P[a+1], uz=P[b+2]-P[a+2], vx=P[c]-P[a], vy=P[c+1]-P[a+1], vz=P[c+2]-P[a+2];
      A+=.5*Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx); cum.push(A); } return {A,cum}; };
  const blades=(f,k,n,L)=>{ const lod=LOD[L]; const P=f.P, Q=f.QT[k], {A,cum}=f.ar[k], M=new THREE.Matrix4(), Qn=new THREE.Quaternion(), E=new THREE.Euler(), Sc=new THREE.Vector3(), V=new THREE.Vector3();
    let a=((Math.floor(f.me.x0*7.13)*73856093)^(Math.floor(f.me.z0*3.71)*19349663)^(k*83492791))>>>0||1; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
    const im=new THREE.InstancedMesh(lod.g,bmat,n); im.lod=L; for(let i=0;i<n;i++){ const r=R()*A; let lo=0, hi=cum.length-1; while(lo<hi){ const mid=(lo+hi)>>1; if(cum[mid]<r)lo=mid+1; else hi=mid; } const t=lo*3, pa=Q[t]*3, pb=Q[t+1]*3, pc=Q[t+2]*3;
      let u=R(), w=R(); if(u+w>1){ u=1-u; w=1-w; } V.set(P[pa]+(P[pb]-P[pa])*u+(P[pc]-P[pa])*w,P[pa+1]+(P[pb+1]-P[pa+1])*u+(P[pc+1]-P[pa+1])*w,P[pa+2]+(P[pb+2]-P[pa+2])*u+(P[pc+2]-P[pa+2])*w);
      E.set((R()-.5)*2*S.grTiltMax,R()*Math.PI*2,(R()-.5)*S.grTiltMax*.5); Qn.setFromEuler(E); Sc.set((S.grMinWidth+R()*(S.grMaxWidth-S.grMinWidth))*lod.w,S.grMinLength+R()*(S.grMaxLength-S.grMinLength),1); im.setMatrixAt(i,M.compose(V,Qn,Sc)); }
    im.frustumCulled=false; im.receiveShadow=true; im.raycast=()=>{}; MAPG.bodega.add(im); f.q[k]=im; GRASS.n+=n; };
  const unblade=(f,k)=>{ const im=f.q[k]; if(im){ MAPG.bodega.remove(im); im.dispose(); GRASS.n-=im.count; } f.q[k]=null; };
  SYS.add('weedsAdd',(key,me)=>{ if(me&&me.I)floor(key,me); },'140b-grassfield'); SYS.add('weedsDrop',key=>unfloor(key),'140b-grassfield');
  if(WEEDS.chunks)for(const [k,me] of WEEDS.chunks)if(me&&me.I)floor(k,me);
  let suns=null; const SP=new THREE.Vector3(), ST=new THREE.Vector3(), RAD=7.5;
  SYS.add('life',()=>{ if(SHARED.LVL!=='up')return;
    // the blades on every lawn round you, nearest quarter first: the repo's blades close by, fewer and wider ones farther out (they cover the same ground), up to the field's count
    let best=null, bd=1e9; for(const f of FL.values()){ const me=f.me, hc=me.N/2*me.CELL; if(!f.ar)f.ar=[0,1,2,3].map(k=>area(f,k));
      for(let k=0;k<4;k++){ const cx=me.x0+((k&1)+.5)*hc, cz=me.z0+((k>>1)+.5)*hc, d=Math.max(0,Math.hypot(pos.x-cx,pos.z-cz)-hc*.7), L=LOD.findIndex(l=>d<=l.to), im=f.q[k];
        if(im&&(L<0||im.lod!==L&&(L<im.lod||d>LOD[im.lod].to+1.5)))unblade(f,k); else if(im===null&&L>=0&&d<bd){ bd=d; best=[f,k,L]; } } }
    if(best){ const [f,k,L]=best, n=Math.round(S.grDensity*LOD[L].dens*f.ar[k].A); if(!n)f.q[k]=false; else if(GRASS.n+n<=S.grMaxCount)blades(f,k,n,L); }
    // what presses the grass: you, the walkers near you, the trail you leave, and the rocks, logs and trunks round you (the repo's rocks; radii over its radius multiplier)
    const RK=U.uRocks.value, MV=WEEDS.movers, TR=WEEDS.UTR&&WEEDS.UTR.value, rm=S.grRockRadiusMul||1; let n=0; RK[n++].set(pos.x,0,pos.z,.28/rm);
    if(MV)for(let i=1;i<MV.length&&n<MAXR;i++)if(MV[i].w>=.5)RK[n++].set(MV[i].x,0,MV[i].y,.25/rm);
    if(TR)for(let i=0;i<TR.length&&n<10;i++)if(TR[i].w>.05)RK[n++].set(TR[i].x,0,TR[i].y,TR[i].z*.45*Math.min(1,TR[i].w)/rm);
    if(SOL.up){ const near=[]; for(const b of SOL.up){ const cx=(b[0]+b[2])/2, cz=(b[1]+b[3])/2, r=Math.hypot(b[2]-b[0],b[3]-b[1])/2; if(r>2.5*T)continue; const d=Math.hypot(cx-pos.x,cz-pos.z); if(d<RAD)near.push([d,cx,cz,r]); }
      near.sort((p,q)=>p[0]-q[0]); for(const [,cx,cz,r] of near){ if(n>=MAXR)break; RK[n++].set(cx,0,cz,r/rm); } }
    U.uRockCount.value=n;
    // the sun, for the light through the blades
    if(!suns){ suns=[]; scene.traverse(o=>{ if(o.isDirectionalLight&&o.castShadow)suns.push(o); }); }
    let sun=null; for(const L of suns)if(!sun||L.intensity>sun.intensity)sun=L;
    if(sun){ sun.getWorldPosition(SP); sun.target.getWorldPosition(ST); U.uSunDir.value.subVectors(SP,ST).normalize(); U.uSunColor.value.copy(sun.color).multiplyScalar(sun.intensity); } },'140b-grassfield');
  // the season presets, in ATMOSPHERE
  const ui=()=>{ const P=document.querySelector('[data-p="atmo"]'); if(!P)return setTimeout(ui,1000); if(P.querySelector('#grassp'))return;
    const B=document.createElement('div'); B.id='grassp'; B.innerHTML='<h3>GRASS</h3><div class="row">'+Object.entries(PRESETS).map(([k,p])=>`<button class="btn" data-g="${k}">${p.label}</button>`).join('')+'</div><div class="dim">the grass field\'s season look</div>';
    P.appendChild(B); const mark=()=>B.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===cur)));
    B.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ GRASS.preset(b.dataset.g); mark(); }); mark(); };
  ui(); window.GRASS=GRASS; }
