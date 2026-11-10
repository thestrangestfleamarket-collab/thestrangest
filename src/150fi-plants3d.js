// THE HOUSEPLANTS: real Polyfork plants in every apartment from the start (owner, 9 Nov 2026: "add plants in your house from polyfork. realistic, real physics, hanging, dangling, leaves"; data/pfplants.json, tools/pfitems-bake.py): two floor plants, a fern on a stand, three baskets hanging from the ceiling with long vines (072a DRAPE) that hang still and swing as you walk through them, the leafy ones bend and spring back; three little pots loose on the desk and the TV.
import {SHARED, THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {MODS} from './006-map-pre.js';
import {DRAPE} from './072a-cloth.js';
import {ROOMK} from './150a-bedroom.js';
import {PFI} from './150cyb-pfitems.js';
const PLANT3={}; window.PLANT3=PLANT3;
{ const LZ=__LAZY__("data/pfplants.json"); let D=null, P=null;
  const KINDS=['FLOOR PLANT','OLIVE TREE','FERN STAND','HANGING PLANT','FLOWERING PLANT','HERB POT','BASIL POT','POTTED SHRUB','FLOWER PLANTER','LAWN CHAIR','BISTRO TABLE','WOODEN CRATE','CANDLE LANTERN','WATERING CAN','CACTUS POT']; for(const k of KINDS)ROOMK.always.add(k);
  const HIDE=new THREE.MeshBasicMaterial({visible:false}), GEO=new Map();
  const load=()=>P||(P=LZ().then(j=>{ D=j; fillAll(); }).catch(e=>{ P=null; console.warn('PLANT3',e); }));
  // a plant's model bends from its pot up (b: the tip's push over its height) and its leaves flutter (f) while something moves it; still, it is drawn as baked
  const bendMat=(y0,H)=>{ const m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.8,side:THREE.DoubleSide}), U={uB:{value:new THREE.Vector2()},uF:{value:0},uT:{value:0},uY:{value:new THREE.Vector2(y0,H)}};
    m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader='uniform vec2 uB,uY; uniform float uF,uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float bw=clamp((position.y-uY.x)/max(.001,uY.y-uY.x),0.,1.); bw*=bw; transformed.xz+=uB*bw*uY.y;
      transformed+=uF*bw*uY.y*.014*vec3(sin(uT*9.+position.x*41.+position.z*17.),.5*sin(uT*7.3+position.y*29.),cos(uT*8.1+position.z*37.+position.x*11.));`); };
    m.customProgramCacheKey=()=>'pfbend'; m.userData.u=U; return m; };
  // where a model goes: an empty box of its size until the models come (the piece's footprint, its body when loose), then the model scaled to its height
  const slot=(par,key,H,r,x,y,z,o={})=>{ const s=new THREE.Group(); s.position.set(x,y,z); s.userData.pf={key,H,r,y0:o.y0||0,bend:o.bend!==false}; par.add(s);
    const ph=new THREE.Mesh(new THREE.BoxGeometry(2*r,H,2*r),HIDE); ph.position.y=H/2; ph.userData.keep=1; ph.castShadow=false; s.add(ph); return s; };
  const fill=o=>{ if(!D)return; o.traverse(s=>{ const f=s.userData.pf; if(!f||s.children.some(q=>q.userData.pfm))return; const id=D.map[f.key], R=id&&D.m[id]; if(!R)return;
    let g=GEO.get(id); if(!g){ g=PFI.decode(R); GEO.set(id,g); } const h=R.b[4]-R.b[1], k=f.H/h, me=new THREE.Mesh(g,bendMat(f.y0/k,h)); me.scale.setScalar(k);
    me.castShadow=me.receiveShadow=true; me.userData.soft=me.userData.keep=me.userData.pfm=1; s.add(me); }); };
  // each piece's own materials (a copy from DECORATE shares its template's until here)
  const own=un=>{ const S=un.st.p3; if(!S)return; S.bends=[]; un.obj.traverse(s=>{ const f=s.userData.pf; if(!f)return; const me=s.children.find(q=>q.userData.pfm); if(!me)return;
    if(!S.mats.has(me.material)){ const u=me.material.userData.u; me.material=bendMat(u.uY.value.x,u.uY.value.y); S.mats.add(me.material); }
    if(f.bend)S.bends.push({s,me,u:me.material.userData.u,f,b:[0,0],v:[0,0],rest:1}); }); };
  const fillAll=()=>{ const A=ROOMK.api; if(!A)return; for(const k of KINDS){ const K=A.kinds[k]; if(K&&K.tpl)fill(K.tpl); } for(const un of A.units())if(un.st.p3){ fill(un.obj); own(un); } };

  /* ---------- the pieces ---------- */
  const SWAY=new Set(['HANGING PLANT']);
  ROOMK.parts.push(c=>{ '@apts'; load(); const {R,part,mat,rbox,cap,cur,solid,thing,Lx,Ly,HW}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast);
    const terra=mat([168,92,60],{roughness:.9}), soil=mat([52,38,28],{roughness:1}), wood=mat([120,84,52],{roughness:.7}), cord=mat([214,204,184],{roughness:1});
    // two floor plants: the leafy one by the back door, the olive tree in its pot by the front windows
    cap('FLOOR PLANT',g=>{ slot(g,'floor',1.5,.36,4.62,0,9.72,{y0:.5}); solid(4.45,9.55,4.79,9.89,.45); },{wire:'plant3'});
    cap('OLIVE TREE',g=>{ slot(g,'olive',1.85,.6,7.3,0,.78,{y0:.6}); solid(7.02,.5,7.58,1.06,.56); },{wire:'plant3'});
    // the fern on a three-legged wooden stand, in a clay pot, between the east windows
    cap('FERN STAND',g=>{ const u=Lx-.42, v=6.28, H=.62; p(new THREE.CylinderGeometry(.17,.17,.03,20),wood,u,H-.015,v);
      for(let i=0;i<3;i++){ const a=i*2.094+.3, l=p(new THREE.CylinderGeometry(.014,.018,H,8),wood,u+Math.cos(a)*.13,H/2,v+Math.sin(a)*.13); l.rotation.set(Math.sin(a)*.12,0,-Math.cos(a)*.12); }
      p(new THREE.TorusGeometry(.11,.008,6,24).rotateX(Math.PI/2),wood,u,.2,v); p(new THREE.CylinderGeometry(.13,.1,.2,20),terra,u,H+.1,v); p(new THREE.CylinderGeometry(.122,.122,.01,20),soil,u,H+.19,v,0,cur(),false);
      slot(g,'fern',.42,.3,u,H+.17,v,{y0:0}); solid(u-.18,v-.18,u+.18,v+.18,H+.2); },{bake:true,wire:'plant3'});
    // the baskets: each on its cord from a hook in the ceiling, a swing of its own, the vines (made by its wire) hanging from its rim
    const basket=(u,v,seed)=>{ const un=cap('HANGING PLANT',g=>{ const sw=new THREE.Group(); sw.position.set(u,HW,v); const top=-(HW-2.79); sw.userData.sw={L:HW-2.31,seed,bot:top-1.06}; g.add(sw);
        p(new THREE.CylinderGeometry(.004,.004,-top,5),cord,0,top/2,0,0,sw,false); p(new THREE.CylinderGeometry(.03,.03,.02,10),mat([60,60,64]),0,-.01,0,0,sw,false);
        slot(sw,'basket',1.06,.23,0,top-1.06,0,{bend:false}); },{wire:'plant3'});
      // hung from the ceiling: its origin at the hook, so DECORATE moves it along the ceiling
      const o=un.obj, d=o.position.y-HW; for(const q of o.children)q.position.y+=d; o.position.y=HW; un.mount='ceil'; const K=R.kinds['HANGING PLANT']; if(K&&!K.mount){ K.mount='ceil'; K.tpl=o.clone(true); } return un; };
    basket(.45,6.3,1); basket(1.75,.45,2); basket(Lx-1.1,6.62,3);
    // the little pots, loose: you can pick them up, knock them over
    const pot=(u,h,v,key,name,H,r,m)=>{ const g=thing(u,h,v); slot(g,key,H,r,0,0,0,{y0:H*.3}); R.loose.push([g,name,m,false,'plant3']); };
    pot(2.98,.745,9.8,'flower','FLOWERING PLANT',.34,.12,.9); pot(3.86,.745,9.84,'herb','HERB POT',.24,.08,.5); pot(11.2,1.29,9.8,'basil','BASIL POT',.36,.13,1.1);
    // out on your fire escape's landing (owner, 10 Nov 2026): a table and two chairs, a shrub, a planter along the rail, a crate by the wall; a lantern, a cactus and a watering can loose
    { const AP=MODS.apts, F=AP&&AP.ESC&&AP.ESC[0]; if(F){ const MPU=.907, uE=(AP.R.x1-AP.R.x0-F.ua)*MPU, D=AP.DO*MPU, V=d=>-(.245+d);
      const put=(name,key,H,r,u,d,o={})=>cap(name,g=>{ const s=slot(g,key,H,r,u,0,V(d),{bend:!!o.bend,y0:o.y0||0}); s.rotation.y=o.ry||0; const a=o.a||r, b=o.b||r; solid(u-a,V(d)-b,u+a,V(d)+b,o.h||H); },{wire:'plant3'});
      put('BISTRO TABLE','bistro',.75,.35,uE-2.4,D-.9); put('LAWN CHAIR','lawnchair',.78,.3,uE-3.3,D-.9,{ry:Math.PI/2,h:.45}); put('LAWN CHAIR','lawnchair',.78,.3,uE-1.5,D-.9,{ry:-Math.PI/2,h:.45});
      put('POTTED SHRUB','shrub',1.38,.42,uE-.6,D-.5,{bend:true,y0:.45,a:.25,b:.25,h:.45}); put('FLOWER PLANTER','planter',.48,.5,uE-6.6,D-.3,{b:.2}); put('WOODEN CRATE','crate',.6,.3,uE-7.6,.45);
      pot(uE-2.4,.75,V(D-.9),'lantern','CANDLE LANTERN',.25,.07,.4); pot(uE-7.6,.6,V(.45),'cactus','CACTUS POT',.18,.07,.3); pot(uE-6.9,0,V(.5),'wcan','WATERING CAN',.3,.2,.6); } } });

  /* ---------- the vines: a few strands from the rim, each a chain of points (DRAPE) with a leaf at each ---------- */
  const leafGeo=(()=>{ let G=null; return ()=>{ if(G)return G; const s=new THREE.Shape(); s.moveTo(0,0); s.bezierCurveTo(.03,.005,.045,.04,.03,.065); s.bezierCurveTo(.02,.08,.006,.088,0,.1); s.bezierCurveTo(-.006,.088,-.02,.08,-.03,.065); s.bezierCurveTo(-.045,.04,-.03,.005,0,0);
    G=new THREE.ShapeGeometry(s,3); const q=G.attributes.position; for(let i=0;i<q.count;i++)q.setZ(i,Math.abs(q.getX(i))*.35-q.getY(i)*.08); G.computeVertexNormals(); return G; }; })();
  const rnd=(a,b)=>{ const x=Math.sin(a*127.1+b*311.7)*43758.5453; return x-Math.floor(x); };
  const NS=7, SEG=.085;
  const vines=(un,sw)=>{ '@apts'; const {seed,bot}=sw.userData.sw, S=un.st.p3; sw.updateMatrix(); const X=[], C=[], pin=[], str=[], V=new THREE.Vector3();
    for(let k=0;k<NS;k++){ const a=k/NS*6.283+rnd(seed,k)*.6, n=9+Math.floor(rnd(seed,k+9)*9), i0=X.length/3, top=bot;
      const loc=[[Math.cos(a)*.1,top+.66,Math.sin(a)*.1],[Math.cos(a)*.235,top+.73,Math.sin(a)*.235]];
      for(let j=0;j<n;j++){ const q=j<2?loc[j]:[loc[1][0],loc[1][1]-(j-1)*SEG,loc[1][2]]; V.set(...q).applyMatrix4(sw.matrix); X.push(V.x,V.y,V.z); pin.push(j<2?1:0); if(j)C.push(i0+j-1,i0+j); }
      str.push({i0,n,loc}); }
    const c=DRAPE.make(X,C,Uint8Array.from(pin)); c.str=str; c.n0=X.length/3; c.calm=0;
    // the stems: two crossed thin ribbons along each strand
    const nv=c.n*4, sp=new Float32Array(nv*3), idx=[]; for(const s of str)for(let j=0;j<s.n-1;j++){ const a=(s.i0+j)*4, b=a+4; idx.push(a,b,a+1,a+1,b,b+1,a+2,b+2,a+3,a+3,b+2,b+3); }
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3)); sg.setIndex(idx); const stem=new THREE.Mesh(sg,new THREE.MeshStandardMaterial({color:0x5d7a3a,roughness:.8,side:THREE.DoubleSide}));
    stem.userData.soft=stem.userData.keep=1; stem.frustumCulled=false; un.obj.add(stem);
    // a heart-shaped leaf at each free point, some golden-streaked like a pothos
    let nl=0; for(const s of str)nl+=s.n-2; const lm=new THREE.InstancedMesh(leafGeo(),new THREE.MeshStandardMaterial({roughness:.65,side:THREE.DoubleSide}),nl), col=new THREE.Color();
    for(let i=0;i<nl;i++){ const r=rnd(seed+i,3); col.setRGB(.16+.12*r,.38+.16*r+(r>.8?.14:0),.12+.05*r,THREE.SRGBColorSpace); lm.setColorAt(i,col); }
    lm.castShadow=true; lm.receiveShadow=true; lm.userData.soft=lm.userData.keep=1; lm.frustumCulled=false; un.obj.add(lm);
    S.vine={c,stem,lm,sw,o:{g:-9.8,dm:.95,ks:0,it:4,col:[{a:[0,0,0],b:[0,0,0],r:.26},{a:[0,0,0],b:[0,0,0],r:.2}],push:null},pen:[0,0,0,0]};
    // it finds its hanging shape before it is seen, so it starts at rest
    for(let k=0;k<400&&c.calm<=20;k++)c.calm=DRAPE.step(c,1/30,{...S.vine.o,col:[]})<4e-4?c.calm+1:0; c.X0.set(c.X); draw(S.vine); };
  const T=new THREE.Vector3(), O=new THREE.Vector3(), SD=new THREE.Vector3(), Dd=new THREE.Vector3(), Z=new THREE.Vector3(), XA=new THREE.Vector3(), M4=new THREE.Matrix4();
  const draw=Vn=>{ const {c,stem,lm,sw}=Vn, X=c.X, P=stem.geometry.attributes.position.array, cx=X[3], cz=X[5]; let L=0, ax=0, az=0;
    for(const s of c.str){ ax+=X[(s.i0+1)*3]; az+=X[(s.i0+1)*3+2]; } ax/=c.str.length; az/=c.str.length;
    for(const s of c.str)for(let j=0;j<s.n;j++){ const i=s.i0+j, a=i*3, w=.0045*(1-.5*j/s.n), b=i*12;
      P[b]=X[a]-w; P[b+1]=X[a+1]; P[b+2]=X[a+2]; P[b+3]=X[a]+w; P[b+4]=X[a+1]; P[b+5]=X[a+2]; P[b+6]=X[a]; P[b+7]=X[a+1]; P[b+8]=X[a+2]-w; P[b+9]=X[a]; P[b+10]=X[a+1]; P[b+11]=X[a+2]+w;
      if(j<2)continue; const n=Math.min(j+1,s.n-1)*3+s.i0*3, m=(i-1)*3; T.set(X[n]-X[m],X[n+1]-X[m+1],X[n+2]-X[m+2]).normalize(); O.set(X[a]-ax,0,X[a+2]-az); if(O.lengthSq()<1e-8)O.set(1,0,0); O.normalize();
      SD.crossVectors(T,O).normalize(); const alt=j%2?1:-1;
      Dd.copy(T).multiplyScalar(.5).addScaledVector(O,.7).addScaledVector(SD,alt*.55).normalize(); Z.copy(O).addScaledVector(Dd,-Dd.dot(O)).normalize(); XA.crossVectors(Dd,Z);
      const k=(1.15-.45*j/s.n)*(.85+.3*rnd(i,5)); M4.makeBasis(XA.multiplyScalar(k),Dd.multiplyScalar(k),Z.multiplyScalar(k)).setPosition(X[a],X[a+1],X[a+2]); lm.setMatrixAt(L++,M4); }
    stem.geometry.attributes.position.needsUpdate=true; stem.geometry.computeVertexNormals(); stem.geometry.computeBoundingSphere(); lm.instanceMatrix.needsUpdate=true; lm.computeBoundingSphere(); };

  /* ---------- the wire: each piece's models, materials, vines and its frame's work ---------- */
  ROOMK.wires.plant3=un=>{ '@apts'; un.st.p3={mats:new Set(),bends:[],pp:null,pv:[0,0,0],sw:null}; fill(un.obj); own(un); load();
    un.obj.traverse(q=>{ if(q.userData.sw)un.st.p3.sw={g:q,ax:0,az:0,vx:0,vz:0,L:q.userData.sw.L,bot:q.userData.sw.bot,rest:1}; }); if(un.st.p3.sw)vines(un,un.st.p3.sw.g);
    un.tick=dt=>tick(un,dt); };
  const IM=new THREE.Matrix4(), PA=new THREE.Vector3(), PB=new THREE.Vector3(), PV=new THREE.Vector3();
  const tick=(un,dt)=>{ const A=MODS.apts; if(!A||!A.inReal||un.gone)return; const S=un.st.p3, h=Math.min(.033,dt||0); if(!h||!S)return; const t=performance.now()/1000, o=un.obj, M=(ROOMK.api&&ROOMK.api.R.M)||1;
    // you, and how fast you go, in the piece's own metres
    o.updateWorldMatrix(true,false); IM.copy(o.matrixWorld).invert(); PA.set(pos.x,SHARED.py,pos.z).applyMatrix4(IM); PB.set(pos.x,SHARED.py+1.75*M,pos.z).applyMatrix4(IM);
    if(S.pp){ S.pv[0]=(PA.x-S.pp[0])/h; S.pv[2]=(PA.z-S.pp[2])/h; if(Math.hypot(S.pv[0],S.pv[2])>8)S.pv[0]=S.pv[2]=0; } S.pp=[PA.x,PA.y,PA.z];
    // the leafy ones: a spring from the pot up, pushed by you and the draught
    for(const B of S.bends){ const f=B.f, sp=B.s.position, y0=sp.y+f.y0, y1=sp.y+f.H, rr=f.r+.25; let Fx=0, Fz=0;
      if(PB.y>y0&&PA.y<y1){ const dx=sp.x-PA.x, dz=sp.z-PA.z, d=Math.hypot(dx,dz); if(d<rr&&d>1e-4){ const pen=(rr-d)/rr; Fx+=dx/d*pen*6+S.pv[0]*pen*2; Fz+=dz/d*pen*6+S.pv[2]*pen*2; } }
      const K=28/Math.max(.4,f.H), Cd=4; B.v[0]+=(-K*B.b[0]-Cd*B.v[0]+Fx)*h; B.v[1]+=(-K*B.b[1]-Cd*B.v[1]+Fz)*h; B.b[0]+=B.v[0]*h; B.b[1]+=B.v[1]*h;
      const lim=.22; for(const i of [0,1])B.b[i]=Math.max(-lim,Math.min(lim,B.b[i]));
      const mv=Math.abs(B.v[0])+Math.abs(B.v[1]), F=Math.abs(Fx)+Math.abs(Fz);
      if(F<1e-4&&mv<2e-4&&Math.abs(B.b[0])+Math.abs(B.b[1])<2e-4){ if(!B.rest){ B.b[0]=B.b[1]=B.v[0]=B.v[1]=0; B.u.uB.value.set(0,0); B.u.uF.value=0; B.rest=1; } continue; }
      B.rest=0; B.u.uB.value.set(B.b[0],B.b[1]); B.u.uF.value=Math.min(1,mv*3); B.u.uT.value=t; }
    // the baskets: a pendulum on its cord, tugged by its vines; the vines a chain each, falling, swinging, pushed by the draught and out of your way
    const Q=S.sw, Vn=S.vine; if(!Q||!Vn)return; const c=Vn.c, X=c.X, sw=Q.g;
    const near=Math.hypot(PA.x-sw.position.x,PA.z-sw.position.z)<1.4&&PB.y>Q.bot-1.1;
    const go=near&&Math.hypot(S.pv[0],S.pv[2])>.05; if(go||S.aw==null)S.aw=20; if(S.aw<=0||(Q.rest&&c.calm>20&&!go)){ S.aw=0; return; } S.aw-=h;   // awake while it settles or you walk through it, then at rest
    let tx=0, tz=0; for(const s of c.str){ const a=(s.i0+1)*3, b=(s.i0+3)*3; tx+=X[b]-X[a]; tz+=X[b+2]-X[a+2]; }
    const g0=9.8/Q.L; Q.vx+=(-g0*Q.ax-.5*Q.vx-tz*.6/Q.L)*h; Q.vz+=(-g0*Q.az-.5*Q.vz+tx*.6/Q.L)*h; Q.ax+=Q.vx*h; Q.az+=Q.vz*h;
    sw.rotation.set(Q.ax,0,Q.az); sw.updateMatrix(); const qm=Math.abs(Q.vx)+Math.abs(Q.vz)+Math.abs(Q.ax)+Math.abs(Q.az); Q.rest=Math.abs(Q.vx)+Math.abs(Q.vz)<1.5e-4&&qm<3e-3?1:0;
    { const s=c.str[0], a=s.i0*3; PV.set(...s.loc[0]).applyMatrix4(sw.matrix); const dx=PV.x-X[a], dy=PV.y-X[a+1], dz=PV.z-X[a+2];
      if(dx*dx+dy*dy+dz*dz>.0025)for(const A of [X,c.Xp,c.X0])for(let i=0;i<A.length;i+=3){ A[i]+=dx; A[i+1]+=dy; A[i+2]+=dz; } }
    for(const s of c.str)for(let j=0;j<2;j++){ PV.set(...s.loc[j]).applyMatrix4(sw.matrix); const a=(s.i0+j)*3; X[a]=PV.x; X[a+1]=PV.y; X[a+2]=PV.z; }
    const col=Vn.o.col; col.length=0; if(near){ const y=Vn.cy||(Vn.cy={a:[0,0,0],b:[0,0,0],r:.3}); y.a[0]=y.b[0]=PA.x; y.a[2]=y.b[2]=PA.z; y.a[1]=PA.y+.3; y.b[1]=PB.y-.05; col.push(y); }
    const bb=Vn.bb||(Vn.bb={a:[0,0,0],b:[0,0,0],r:.2}); PV.set(0,Q.bot+.55,0).applyMatrix4(sw.matrix); bb.a[0]=bb.b[0]=PV.x; bb.a[2]=bb.b[2]=PV.z; bb.a[1]=PV.y-.1; bb.b[1]=PV.y+.12; col.push(bb);
    const mv=DRAPE.step(c,h,Vn.o); c.calm=mv<4e-4?c.calm+1:0; draw(Vn); };

  window.PLANT3DBG=()=>{ const A=ROOMK.api; if(!A)return null; const us=A.units().filter(u=>KINDS.includes(u.kind));
    return {loaded:!!D,units:us.map(u=>{ const S=u.st.p3, V=S&&S.vine; let tip=null; if(V){ const s=V.c.str[0], a=(s.i0+s.n-1)*3; tip=[V.c.X[a],V.c.X[a+1],V.c.X[a+2]]; }
      return {kind:u.kind,loose:!!u.loose,models:(()=>{ let n=0; u.obj.traverse(q=>{ if(q.userData.pfm)n++; }); return n; })(),vine:V?{pts:V.c.n,still:V.c.calm,dev:(()=>{ let m=0; const X=V.c.X, X0=V.c.X0; for(let i=0;i<X.length;i+=3)m=Math.max(m,Math.hypot(X[i]-X0[i],X[i+2]-X0[i+2])); return m; })(),tip,leaves:V.lm.count}:null,bend:S?S.bends.map(B=>[B.b[0],B.b[1],B.rest]):[],sw:S&&S.sw?[S.sw.ax,S.sw.az,S.sw.rest]:null}; })}; };
  PLANT3.run=(n,dt=1/30)=>{ const A=ROOMK.api; if(!A)return; const us=A.units().filter(u=>u.st.p3&&u.tick); for(let i=0;i<n;i++)for(const u of us)u.tick(dt); };   // (the tests: frames of their own)
  PLANT3.load=load; PLANT3.KINDS=KINDS; }
