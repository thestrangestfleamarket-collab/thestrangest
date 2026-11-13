// THE HANDS: HANDS, Polyfork's jointed hands (25 joints each, data/pfhand.json) on your avatar's wrists at all times (owner, 7 Nov 2026: "lets add real hands at all times"); the fingers follow the rig's grip, or a pose something sets (HANDS.set, the guitar).
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
const HANDS={}; window.HANDS=HANDS;
{ const H=__DATA__("data/pfhand.json"), NJ=25, V3=THREE.Vector3, M4=THREE.Matrix4;
  const Q=I16(H.pos), JI=B64(H.j), ZN=B64(H.z), TR=U16(H.tri), N=JI.length;
  const X=new Float32Array(N*3); for(let i=0;i<Q.length;i++)X[i]=(Q[i]+32500)*H.sc+H.lo[i%3];
  const REST=H.rest.map(r=>new M4().set(r[0],r[3],r[6],r[9],r[1],r[4],r[7],r[10],r[2],r[5],r[8],r[11],0,0,0,1)), RI=REST.map(m=>m.clone().invert());
  const NAME=Object.fromEntries(H.names.map((n,i)=>[n,i]));
  // each digit's chain: the joints it turns at (thumb: its base, knuckle, last joint; a finger: its knuckle, middle and last joints), then its tip
  const CH=[['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip'],
    ...['index','middle','ring','pinky'].map(f=>[f+'-finger-phalanx-proximal',f+'-finger-phalanx-intermediate',f+'-finger-phalanx-distal',f+'-finger-tip'])].map(c=>c.map(n=>NAME[n]));
  const PAR=new Int8Array(NJ).fill(-1); for(const c of CH)for(let k=1;k<c.length;k++)PAR[c[k]]=c[k-1];
  for(const f of ['index','middle','ring','pinky'])PAR[NAME[f+'-finger-phalanx-proximal']]=NAME[f+'-finger-metacarpal'];
  const LOC=REST.map((m,j)=>PAR[j]>=0?RI[PAR[j]].clone().multiply(m):m.clone());   // (each joint from its parent, at rest)
  const ORDER=[...Array(NJ).keys()].sort((a,b)=>{ const d=j=>{ let k=0; for(let p=PAR[j];p>=0;p=PAR[p])k++; return k; }; return d(a)-d(b); });

  /* ---------- one mesh for both hands, every corner held by one joint (the right hand the left one mirrored) ---------- */
  const lin=h=>new THREE.Color('#'+h), GC=new Map();
  const geo=skin=>{ let g=GC.get(skin); if(g)return g; const s=lin(skin), n=s.clone().lerp(new THREE.Color(1,.92,.88),.4);   // (the nails a step lighter than the skin)
    const pos=new Float32Array(N*6), col=new Float32Array(N*6), hj=new Float32Array(N*2), idx=new Uint16Array(TR.length*2);
    for(let h=0;h<2;h++)for(let i=0;i<N;i++){ const o=h*N+i; pos.set(X.subarray(i*3,i*3+3),o*3); const c=ZN[i]?n:s; col.set([c.r,c.g,c.b],o*3); hj[o]=h*NJ+JI[i]; }
    for(let h=0;h<2;h++)for(let t=0;t<TR.length;t++)idx[h*TR.length+t]=TR[t]+h*N;
    g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('hj',new THREE.BufferAttribute(hj,1)); g.setIndex(new THREE.BufferAttribute(idx,1));
    g.boundingSphere=new THREE.Sphere(new V3(),1); GC.set(skin,g); return g; };
  // the joints as three rows each (150 vec4: within every GPU's vertex uniforms)
  const MOVE=`attribute float hj; uniform vec4 uHJ[${NJ*6}];
  vec3 hjAt(vec3 p){ int k=int(hj+.5)*3; vec4 q=vec4(p,1.); return vec3(dot(uHJ[k],q),dot(uHJ[k+1],q),dot(uHJ[k+2],q)); }`;
  const AT='vec3 transformed=hjAt(position);';
  const mats=U=>{ const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{ sh.uniforms.uHJ=U; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT);
      // (the body's shadow lean, 111a: or the hand shadows itself darker than the arm)
      sh.fragmentShader='#define BODYB .0015\n'+sh.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replace(/((?:directional|spot|point)LightShadows?(?:\[ *\w+ *\])?)\.shadowBias/g,'($1.shadowBias-BODYB)'));
      sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition))); vec3 nonPerturbedNormal=normal;'); W3.rim(sh,W3.YES); };
    mat.customProgramCacheKey=()=>'hands';
    const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uHJ=U; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT); }; dist.customProgramCacheKey=()=>'handsdist';
    const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uHJ=U; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT); }; depth.customProgramCacheKey=()=>'handsdepth';
    return {mat,dist,depth}; };

  /* ---------- a pose: each digit [knuckle, middle, last joint, spread] in radians, the rig's way (RIG.fgOf: its rest and its fist) ---------- */
  const R0=RIG.fgOf({fist:0});
  const RX=new M4(), RY=new M4(), T1=new M4(), MX=new M4().makeScale(-1,1,1);
  const fk=(fg,out)=>{ const turn=new Array(NJ).fill(null);
    for(let i=0;i<5;i++){ const f=fg[i]||R0[i], c=CH[i], sp=i?R0[i][3]-f[3]:f[4]||0;
      // a finger curls toward its palm about its joint's x (OpenXR: -z along the bone, +y the back), and spreads about y at the knuckle; the thumb's base turns it across the palm
      for(let k=0;k<3;k++){ const m=new M4().makeRotationX(-f[k]*(i?1:.8)); if(k===0&&sp)m.premultiply(RY.makeRotationY(sp)); if(i===0&&k===0)m.premultiply(RY.makeRotationY(-f[0]*.6)); turn[c[k]]=m; } }
    for(const j of ORDER){ const p=PAR[j]; out[j].copy(p>=0?T1.multiplyMatrices(out[p],LOC[j]):LOC[j]); if(turn[j])out[j].multiply(turn[j]); }
    return out; };

  /* ---------- on a body: its wrists' rest frames (bone x out of the hand's back on the left, into it on the right, -y down the fingers, z the thumb's side) ---------- */
  const LOCL=new M4().makeBasis(new V3(0,0,-1),new V3(1,0,0),new V3(0,-1,0)), LOCR=new M4().makeBasis(new V3(0,0,1),new V3(-1,0,0),new V3(0,-1,0));
  const WR=new V3(0,.026,-.004);   // (the hand's wrist point: halfway through it, at the joint)
  const LIVE=new Set();
  // drawn only near the camera (owner, 7 Nov 2026: "dont draw hands unless zoomed in"; both hands are twice the rest of the body's triangles): past NEAR the body's own simple hands show instead
  HANDS.NEAR=3;   // metres from the camera
  const CP=new V3();
  SYS.add('cam',()=>{ const cam=SHARED.cam; if(!cam)return; const far=HANDS.NEAR*TILE/.84;
    for(const st of LIVE){ st.me.getWorldPosition(CP); const near=CP.distanceTo(cam.position)<far; if(st.near!==near){ st.near=near; st.hm.visible=near; if(st.PM.hh)st.PM.hh.value=near?1:0; } } },'111b-hands');
  // a body's hands in its rest space (the avatar fits its wrists to them, 111c)
  HANDS.base=(binv,o={})=>{ const k=(o.scale||1)*(1+.05*((o.b??1)-1)), S=new M4().makeScale(k,k,k).multiply(new M4().makeTranslation(-WR.x,-WR.y,-WR.z));
    return {L:binv[5].clone().invert().multiply(LOCL).multiply(S),R:binv[8].clone().invert().multiply(LOCR).multiply(S).multiply(MX)}; };
  HANDS.X=X;
  HANDS.add=(me,PM,body,o={})=>{ if(!body.binv)return null; const U={value:Array.from({length:NJ*6},()=>new THREE.Vector4())}, M=mats(U), g=geo(o.skin||'d9a984');
    const base=HANDS.base(body.binv,o);
    const hm=new THREE.Mesh(g,M.mat); hm.customDistanceMaterial=M.dist; hm.customDepthMaterial=M.depth; hm.castShadow=hm.receiveShadow=true; hm.name='hands';
    Object.defineProperty(hm,'boundingSphere',{configurable:true,get(){ return me.boundingSphere; },set(){}});   // (seen when the body is)
    const J={L:REST.map(()=>new M4()),R:REST.map(()=>new M4())}, W=new M4(); let fr=-1;
    const st={me,PM,fg:null,hm,near:null};
    hm.onBeforeRender=()=>{ const f=renderer.info.render.frame; if(f===fr)return; fr=f; const B=PM.B, m=B&&B.m;
      for(const [s,bi,oj] of [['L',5,0],['R',8,NJ]]){ const fg=st.fg&&st.fg[s]||(m?RIG.fgOf({fist:Math.max(m.fist&&m.fist[s]||0,o.grip&&o.grip[s]?1:0),fg:m.fg&&m.fg[s]}):R0); fk(fg,J[s]); W.multiplyMatrices(PM.value[bi],base[s]);
        for(let j=0;j<NJ;j++){ T1.multiplyMatrices(W,J[s][j]); const e=T1.elements, a=U.value, q=(oj+j)*3; a[q].set(e[0],e[4],e[8],e[12]); a[q+1].set(e[1],e[5],e[9],e[13]); a[q+2].set(e[2],e[6],e[10],e[14]); } } };
    st.base=base; PM.hands=st; me.add(hm); me.userData.hands=st; LIVE.add(st); hm.addEventListener('removed',()=>LIVE.delete(st)); return st; };
  // a joint's place in the body mesh's space (HANDS.joint(st,'L','index-finger-tip')): where the guitar's solver aims; its rest frames for the solver's reach
  HANDS.NAME=NAME; HANDS.REST=REST; HANDS.CH=CH; HANDS.LOC={L:LOCL,R:LOCR}; HANDS.R0=R0;
  // a digit's tip (hand space) for its pose f, and its pose moved till the tip reaches a point (damped least squares on its knuckle, middle joint and spread; the last joint follows the middle)
  const TA=new M4(), TM=new M4();
  const LAST=new M4();
  const tipOf=(i,f,out,pts)=>{ const c=CH[i], sp=i?R0[i][3]-f[3]:f[4]||0; TA.copy(REST[c[0]]); if(pts)pts[0].setFromMatrixPosition(TA);
    for(let k=0;k<3;k++){ TM.makeRotationX(-f[k]*(i?1:.8)); if(k===0&&sp)TM.premultiply(RY.makeRotationY(sp)); if(i===0&&k===0)TM.premultiply(RY.makeRotationY(-f[0]*.6)); TA.multiply(TM); if(k===2)LAST.copy(TA); TA.multiply(LOC[c[k+1]]); if(pts)pts[k+1].setFromMatrixPosition(TA); }
    return out.setFromMatrixPosition(TA); };
  HANDS.tip=(i,f,out=new V3())=>tipOf(i,f,out);
  // a digit's joints for its pose (hand space): its first joint, the next two, then its tip
  HANDS.chain=(i,f,pts)=>{ tipOf(i,f,pts[3],pts); return pts; };
  // how far a digit's last bone reaches past its tip joint toward -n (n a unit direction in hand space): a tip held that far off a surface facing n rests its skin on it
  const LASTV=CH.map(c=>{ const L=[]; for(let i=0;i<N;i++)if(JI[i]===c[2])L.push(new V3(X[i*3],X[i*3+1],X[i*3+2])); return L; }), VX=new V3(), VT=new V3();
  HANDS.ext=(i,f,n)=>{ tipOf(i,f,VT); let e=0; for(const v of LASTV[i]){ const d=VT.dot(n)-VX.copy(v).applyMatrix4(LAST).dot(n); if(d>e)e=d; } return e; };
  const LIM=[[-.4,1.4],[0,1.9]], P0=new V3(), P1=new V3();
  // avoid (optional): (i, its joints and tip) => the way each of its points must still move to be clear of something, flat [x,y,z,...] of a fixed length (zeros when clear); the pose then reaches as near as it can without going in
  const PJ=[0,1,2,3].map(()=>new V3()), PJ1=[0,1,2,3].map(()=>new V3());
  const res=(i,f,tg,avoid,P,pts)=>{ tipOf(i,f,P,avoid?pts:null); const r=[P.x-tg.x,P.y-tg.y,P.z-tg.z]; if(avoid)for(const v of avoid(i,pts))r.push(-v); return r; };
  HANDS.reach=(i,tg,f,avoid)=>{ const np=i||avoid?3:2, set=(f,a0,a1,sp)=>{ f[0]=Math.max(LIM[0][0],Math.min(LIM[0][1],a0)); f[1]=Math.max(LIM[1][0],Math.min(LIM[1][1],a1)); f[2]=f[1]*.72; if(np>2&&i)f[3]=Math.max(R0[i][3]-.55,Math.min(R0[i][3]+.55,sp)); else if(np>2)f[4]=Math.max(-.55,Math.min(.55,sp)); };   // (the thumb swings at its base too (its f[4]) when it has something to keep out of)
    for(let it=0;it<10;it++){ const r0=res(i,f,tg,avoid,P0,PJ); if(r0.reduce((a,v)=>a+v*v,0)<1e-8)break; const x=[f[0],f[1],i?f[3]:f[4]||0], Jc=[];
      for(let q=0;q<np;q++){ const g=f.slice(), d=.01; if(q===0)g[0]+=d; else if(q===1){ g[1]+=d; g[2]=g[1]*.72; } else if(i)g[3]+=d; else g[4]=(g[4]||0)+d; Jc.push(res(i,g,tg,avoid,P1,PJ1).map((v,m)=>(v-r0[m])/d)); }
      // (J^T J + lambda) dx = -J^T r, a 2 or 3 square by elimination
      const A=[], b=[]; for(let u=0;u<np;u++){ A.push([]); for(let c=0;c<np;c++){ let t=u===c?2e-5:0; for(let m=0;m<r0.length;m++)t+=Jc[u][m]*Jc[c][m]; A[u].push(t); } let t=0; for(let m=0;m<r0.length;m++)t-=Jc[u][m]*r0[m]; b.push(t); }
      for(let u=0;u<np;u++){ let mx=u; for(let w=u+1;w<np;w++)if(Math.abs(A[w][u])>Math.abs(A[mx][u]))mx=w; [A[u],A[mx]]=[A[mx],A[u]]; [b[u],b[mx]]=[b[mx],b[u]]; for(let w=u+1;w<np;w++){ const k=A[w][u]/A[u][u]; for(let c=u;c<np;c++)A[w][c]-=k*A[u][c]; b[w]-=k*b[u]; } }
      const dx=new Array(np).fill(0); for(let u=np-1;u>=0;u--){ let v=b[u]; for(let c=u+1;c<np;c++)v-=A[u][c]*dx[c]; dx[u]=v/A[u][u]; }
      const k=Math.min(1,.25/Math.max(1e-6,Math.hypot(...dx))); set(f,x[0]+dx[0]*k,x[1]+dx[1]*k,np>2?x[2]+dx[2]*k:f[3]); }
    return f; };
  HANDS.set=(st,fg)=>{ if(st)st.fg=fg; };
  // the headset's tracked hands as these hands (VR, 162c): WebXR's 25 joints are this hand's, frame for frame, so each joint's pose drives its bone; the right hand the left one mirrored
  let XG=null;
  const xrGeo=skin=>{ const g=geo(skin).clone(), p=g.attributes.position.array.slice(); for(let i=N*3;i<N*6;i+=3)p[i]=-p[i]; g.setAttribute('position',new THREE.BufferAttribute(p,3)); return g; };
  HANDS.vr=(skin='d9a984')=>{ const U={value:Array.from({length:NJ*6},()=>new THREE.Vector4())}, M=mats(U), g=xrGeo(skin), hm=new THREE.Mesh(g,M.mat); hm.frustumCulled=false; hm.castShadow=false; hm.name='vrhands'; hm.userData.ownMat=true;
    const seen={L:0,R:0};
    return {mesh:hm,set:(side,name,m)=>{ const j=NAME[name]; if(j==null)return; const e=m.elements, a=U.value, q=((side==='R'?NJ:0)+j)*3; a[q].set(e[0],e[4],e[8],e[12]); a[q+1].set(e[1],e[5],e[9],e[13]); a[q+2].set(e[2],e[6],e[10],e[14]); seen[side]=1; },
      hide:(side)=>{ const a=U.value; for(let j=0;j<NJ;j++){ const q=((side==='R'?NJ:0)+j)*3; a[q].set(0,0,0,0); a[q+1].set(0,0,0,0); a[q+2].set(0,0,0,0); } },U}; };
  HANDS.credit=H.credit; }
export {HANDS};
