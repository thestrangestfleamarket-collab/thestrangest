// THE HANDS: HANDS, Polyfork's jointed hands (25 joints each, data/pfhand.json) on your avatar's wrists at all times (owner, 7 Nov 2026: "lets add real hands at all times"); the fingers follow the rig's grip, or a pose something sets (HANDS.set, the guitar).
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
const HANDS={};
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
      sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition))); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
    mat.customProgramCacheKey=()=>'hands';
    const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uHJ=U; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT); }; dist.customProgramCacheKey=()=>'handsdist';
    const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uHJ=U; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT); }; depth.customProgramCacheKey=()=>'handsdepth';
    return {mat,dist,depth}; };

  /* ---------- a pose: each digit [knuckle, middle, last joint, spread] in radians, the rig's way (RIG.fgOf: its rest and its fist) ---------- */
  const R0=RIG.fgOf({fist:0});
  const RX=new M4(), RY=new M4(), T1=new M4(), MX=new M4().makeScale(-1,1,1);
  const fk=(fg,out)=>{ const turn=new Array(NJ).fill(null);
    for(let i=0;i<5;i++){ const f=fg[i]||R0[i], c=CH[i], sp=(f[3]-R0[i][3])*(i?-1:0);
      // a finger curls toward its palm about its joint's x (OpenXR: -z along the bone, +y the back), and spreads about y at the knuckle; the thumb's base turns it across the palm
      for(let k=0;k<3;k++){ const m=new M4().makeRotationX(-f[k]*(i?1:.8)); if(k===0&&sp)m.premultiply(RY.makeRotationY(sp)); if(i===0&&k===0)m.premultiply(RY.makeRotationY(-f[0]*.6)); turn[c[k]]=m; } }
    for(const j of ORDER){ const p=PAR[j]; out[j].copy(p>=0?T1.multiplyMatrices(out[p],LOC[j]):LOC[j]); if(turn[j])out[j].multiply(turn[j]); }
    return out; };

  /* ---------- on a body: its wrists' rest frames (bone x out of the hand's back on the left, into it on the right, -y down the fingers, z the thumb's side) ---------- */
  const LOCL=new M4().makeBasis(new V3(0,0,-1),new V3(1,0,0),new V3(0,-1,0)), LOCR=new M4().makeBasis(new V3(0,0,1),new V3(-1,0,0),new V3(0,-1,0));
  const WR=new V3(0,.026,-.004);   // (the hand's wrist point: halfway through it, at the joint)
  const LIVE=new Set();
  HANDS.add=(me,PM,body,o={})=>{ if(!body.binv)return null; const U={value:Array.from({length:NJ*6},()=>new THREE.Vector4())}, M=mats(U), g=geo(o.skin||'d9a984');
    const k=(o.scale||.95)*(1+.05*((o.b??1)-1)), S=new M4().makeScale(k,k,k).multiply(new M4().makeTranslation(-WR.x,-WR.y,-WR.z));
    const base={L:body.binv[5].clone().invert().multiply(LOCL).multiply(S),R:body.binv[8].clone().invert().multiply(LOCR).multiply(S).multiply(MX)};
    const hm=new THREE.Mesh(g,M.mat); hm.customDistanceMaterial=M.dist; hm.customDepthMaterial=M.depth; hm.castShadow=hm.receiveShadow=true; hm.name='hands';
    Object.defineProperty(hm,'boundingSphere',{configurable:true,get(){ return me.boundingSphere; },set(){}});   // (seen when the body is)
    const J={L:REST.map(()=>new M4()),R:REST.map(()=>new M4())}, W=new M4(); let fr=-1;
    const st={me,PM,fg:null};
    hm.onBeforeRender=()=>{ const f=renderer.info.render.frame; if(f===fr)return; fr=f; const B=PM.B, m=B&&B.m;
      for(const [s,bi,oj] of [['L',5,0],['R',8,NJ]]){ const fg=st.fg&&st.fg[s]||(m?RIG.fgOf({fist:Math.max(m.fist&&m.fist[s]||0,o.grip&&o.grip[s]?1:0),fg:m.fg&&m.fg[s]}):R0); fk(fg,J[s]); W.multiplyMatrices(PM.value[bi],base[s]);
        for(let j=0;j<NJ;j++){ T1.multiplyMatrices(W,J[s][j]); const e=T1.elements, a=U.value, q=(oj+j)*3; a[q].set(e[0],e[4],e[8],e[12]); a[q+1].set(e[1],e[5],e[9],e[13]); a[q+2].set(e[2],e[6],e[10],e[14]); } } };
    me.add(hm); me.userData.hands=st; LIVE.add(st); hm.addEventListener('removed',()=>LIVE.delete(st)); return st; };
  // a joint's place in the body mesh's space (HANDS.joint(st,'L','index-finger-tip')): where the guitar's solver aims; its rest frames for the solver's reach
  HANDS.NAME=NAME; HANDS.REST=REST; HANDS.CH=CH; HANDS.fk=(fg)=>fk(fg,REST.map(()=>new M4()));
  HANDS.set=(st,fg)=>{ if(st)st.fg=fg; };
  HANDS.credit=H.credit; }
export {HANDS};
