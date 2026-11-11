// THE BODIES: bodies moved by the rig (each of its 15 bones takes the turn of the rig piece it stands for); you play as the avatar (111c) or another playable body (YOU's BODY line); one of each other walks main street.
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {ARCH, CHARS, LOOKS, NPCS, pos, RAG, st, VIS, VIT, W3, WINDOWS} from './003b-systems.js';
import {PPU} from './004-main.js';
import {SAVE} from './005-save.js';
import {ASTEP, MAPG, MODS, SYS, TILE} from './006-map-pre.js';
import {HOMES, ROAM, stfree} from './076-npc-map.js';
import {musScale, sheetView, spreadPose} from './110-musician.js';
const BODIES={list:[],by:{}}; window.BODIES=BODIES;
{ const R=RIG, QS=new URLSearchParams(location.search), V3=THREE.Vector3;
  const BONES=BODIES.BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR'];
  const LIMB=/^(upperArm|forearm|hand|thigh|shin)/, NB=BONES.length, WALKER_H=52;
  const PARENT=BODIES.PARENT={torso:'hips',head:'torso',upperArmL:'torso',upperArmR:'torso',forearmL:'upperArmL',forearmR:'upperArmR',handL:'forearmL',handR:'forearmR',thighL:'hips',thighR:'hips',shinL:'thighL',shinR:'thighR',shoeL:'shinL',shoeR:'shinR'};
  // a fitted skeleton (each bone's origin and rest frame, rows of 9) as off (each bone from its parent, in the parent's frame) and binv
  BODIES.skeleton=(origin,rest)=>{ const R=rest.map(r=>new THREE.Matrix4().makeBasis(new V3(r[0],r[1],r[2]),new V3(r[3],r[4],r[5]),new V3(r[6],r[7],r[8]))), O=origin.map(o=>new V3(...o)), off={};
    BONES.forEach((n,i)=>{ if(!PARENT[n])return; const p=BONES.indexOf(PARENT[n]), d=O[i].clone().sub(O[p]), r=rest[p]; off[n]=[PARENT[n],r[0]*d.x+r[1]*d.y+r[2]*d.z,r[3]*d.x+r[4]*d.y+r[5]*d.z,r[6]*d.x+r[7]*d.y+r[8]*d.z]; });
    return {off,binv:BONES.map((n,i)=>R[i].clone().setPosition(O[i]).invert())}; };

  /* ---------- one mesh a body: every face flat (its normal from the screen), coloured, held by up to two bones ---------- */
  // its own bounding sphere (the posed bones, set in pose) so a body off screen or out of the light is not drawn
  const cull=(me,PM,body)=>{ const O=body.binv?body.binv.map(m=>new V3().setFromMatrixPosition(m.clone().invert())):null, Sp=new THREE.Sphere(), G=new THREE.Sphere(), P=BONES.map(()=>new V3());
    Object.defineProperty(me,'boundingSphere',{configurable:true,get(){ const c=Sp.center; c.set(0,0,0);
      for(let i=0;i<NB;i++){ const p=P[i]; if(O)p.copy(O[i]).applyMatrix4(PM.value[i]); else p.setFromMatrixPosition(PM.value[i]); c.add(p); } c.multiplyScalar(1/NB);
      let r=0; for(const p of P)r=Math.max(r,p.distanceTo(c)); Sp.radius=r*2.2+1e-3;
      // and the body at rest carried by its hips (all a body is before it is first posed)
      const g=me.geometry; if(!g.boundingSphere)g.computeBoundingSphere(); const H=PM.value[0]; G.copy(g.boundingSphere).applyMatrix4(H); return Sp.union(G); },set(){}}); me.userData.PM=PM; me.frustumCulled=true; };
  // body.dq (your avatar): its two bones blended as dual quaternions, not matrices, so a limb turned far from its rest keeps its thickness (owner, 5 Nov 2026: "my shoulder vanishes when i raise my arm too high")
  const DQ=`
  vec4 mq(mat3 m){ float t=m[0][0]+m[1][1]+m[2][2], s;
    if(t>0.){ s=sqrt(t+1.)*2.; return vec4((m[1][2]-m[2][1])/s,(m[2][0]-m[0][2])/s,(m[0][1]-m[1][0])/s,.25*s); }
    if(m[0][0]>m[1][1]&&m[0][0]>m[2][2]){ s=sqrt(1.+m[0][0]-m[1][1]-m[2][2])*2.; return vec4(.25*s,(m[1][0]+m[0][1])/s,(m[2][0]+m[0][2])/s,(m[1][2]-m[2][1])/s); }
    if(m[1][1]>m[2][2]){ s=sqrt(1.+m[1][1]-m[0][0]-m[2][2])*2.; return vec4((m[1][0]+m[0][1])/s,.25*s,(m[2][1]+m[1][2])/s,(m[2][0]-m[0][2])/s); }
    s=sqrt(1.+m[2][2]-m[0][0]-m[1][1])*2.; return vec4((m[2][0]+m[0][2])/s,(m[2][1]+m[1][2])/s,.25*s,(m[0][1]-m[1][0])/s); }
  vec4 qm(vec4 a,vec4 b){ return vec4(a.w*b.xyz+b.w*a.xyz+cross(a.xyz,b.xyz),a.w*b.w-dot(a.xyz,b.xyz)); }
  mat4 dqm(mat4 A,mat4 B,float w){ float sa=length(A[0].xyz), sb=length(B[0].xyz); vec4 qa=mq(mat3(A)/sa), qb=mq(mat3(B)/sb); if(dot(qa,qb)<0.)qb=-qb;
    vec4 da=.5*qm(vec4(A[3].xyz,0.),qa), db=.5*qm(vec4(B[3].xyz,0.),qb), q=qa*w+qb*(1.-w), d=da*w+db*(1.-w); float l=length(q); q/=l; d/=l;
    float x=q.x,y=q.y,z=q.z,c=q.w, s=sa*w+sb*(1.-w); vec3 t=2.*(c*d.xyz-d.w*q.xyz+cross(q.xyz,d.xyz));
    return mat4(vec4(1.-2.*(y*y+z*z),2.*(x*y+c*z),2.*(x*z-c*y),0.)*s,vec4(2.*(x*y-c*z),1.-2.*(x*x+z*z),2.*(y*z+c*x),0.)*s,vec4(2.*(x*z+c*y),2.*(y*z-c*x),1.-2.*(x*x+y*y),0.)*s,vec4(t,1.)); }`;
  function mesh(body){ const PM={value:Array.from({length:NB},()=>new THREE.Matrix4())};
    const MOVE=`attribute vec2 bi; attribute float bw; attribute float hh; uniform float uHH; uniform mat4 uPM[${NB}];`+(body.dq?DQ:''), AT_=body.dq?`mat4 PM=dqm(uPM[int(bi.x+.5)],uPM[int(bi.y+.5)],bw);`:`mat4 PM=uPM[int(bi.x+.5)]*bw+uPM[int(bi.y+.5)]*(1.-bw);`, CK=body.dq?'d':'';
    if(body.smooth)return smooth(body,PM,MOVE,AT_);
    // the body's own simple hands (hh) folded away while Polyfork's jointed ones are drawn in their place (PM.hh, 111b: only near the camera)
    PM.hh={value:0}; PM.pl={value:body.rnd?1:0}; const HH=' if(hh*uHH>.5)transformed=vec3(0.);';
    // a cape flaps in flight (body.flap: its points' fl, 0 at the tie to 1 at the hem, and fd, out from the body): lifted off the back and rippling, by PM.fk (pose)
    const FL=body.flap?(PM.fk={value:0},PM.ft={value:0},'attribute float fl; attribute vec3 fd; uniform float uFK,uFT;'):'', P0=body.flap?'position+fd*fl*uFK*(.04+.16*fl+.07*sin(uFT*12.-fl*8.+fd.x*2.))':'position';
    // body.rnd (your avatar): its points marked sm (its rounded head, 111c) shaded by their own smooth normals, the rest flat
    // body.rnd: what hangs off it (ov: BACK, its bags and straps, 111c) drawn a few centimetres nearer the eye than it is, so it shows over every coat (owner, 9 Nov 2026)
    const OV=body.rnd?' if(ov>.5){ vec4 mo=mvPosition; float od=uOV*length(modelViewMatrix[1].xyz); if(projectionMatrix[3][3]>.5)mo.z+=od; else mo.xyz*=max(0.,1.-od/length(mo.xyz)); gl_Position=projectionMatrix*mo; }':'';
    const SM=body.rnd?'attribute float sm; attribute float ov; uniform float uOV; varying float vSm;':'', NF=body.rnd?' if(vSm>.5){ vec3 sn=normalize(vNormal); normal=dot(sn,normal)<0.?-sn:sn; }':'';
    const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
    if(body.rnd)PM.ov={value:.035*(body.S||1)};
    mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.uniforms.uHH=PM.hh; if(PM.ov)sh.uniforms.uOV=PM.ov; if(FL){ sh.uniforms.uFK=PM.fk; sh.uniforms.uFT=PM.ft; } sh.fragmentShader='#define BODYB .0015\n'+(SM?'varying float vSm;\n':'')+sh.fragmentShader; sh.vertexShader=MOVE+FL+SM+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4('+P0+',1.)).xyz;'+HH+(SM?' vSm=sm;':'')).replace('#include <project_vertex>','#include <project_vertex>\n'+OV);
      // a body's own layers (cloth over its lining, over the skin) a few millimetres apart: its shadow test leans that much more toward the light, or they shadow each other in specks (owner, 6 Nov 2026: "seems like its shadows")
      sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replace(/((?:directional|spot|point)LightShadows?(?:\[ *\w+ *\])?)\.shadowBias/g,'($1.shadowBias-BODYB)')).replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));'+NF+' vec3 nonPerturbedNormal=normal;'); W3.rim(sh,PM.pl); };
    mat.customProgramCacheKey=()=>'body'+NB+CK+'b'+(FL?'f':'')+(SM?'r':'');
    const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.uniforms.uHH=PM.hh; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'+HH); }; dist.customProgramCacheKey=()=>'bodydist'+NB+CK;
    const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.uniforms.uHH=PM.hh; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'+HH); }; depth.customProgramCacheKey=()=>'bodydepth'+NB+CK;
    const me=new THREE.Mesh(body.GEO||(body.GEO=body.geo()),mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=me.receiveShadow=true; cull(me,PM,body);
    if(body.onMesh)body.onMesh(me,PM);   // (your avatar's hands, 111b)
    return {me,PM}; }

  /* ---------- a smooth body (the merchants): smooth normals, and each part's surface drawn from where it is on the part — knit, woven cloth, denim, leather, metal, skin, fur, wood, ivory, glass — with its own relief, roughness and shine ---------- */
  const SURF=`varying vec3 vRest; varying float vMt;
  float sH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
  float sN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(sH(i),sH(i+vec3(1,0,0)),f.x),mix(sH(i+vec3(0,1,0)),sH(i+vec3(1,1,0)),f.x),f.y),mix(mix(sH(i+vec3(0,0,1)),sH(i+vec3(1,0,1)),f.x),mix(sH(i+vec3(0,1,1)),sH(i+vec3(1,1,1)),f.x),f.y),f.z); }
  // relief (0..1) and a colour scale for each surface, from the rest position on its part (metres)
  vec2 surf(float m,vec3 p){ float w=p.x+p.z;
    if(m<1.5){ float n=sN(p*22.); return vec2(n*.25,.97+.04*n); }
    if(m<3.5){ float n=sN(p*18.); return vec2(n*.3,.97+.04*n); }
    if(m<4.5){ float n=sN(p*30.); return vec2(n*.3,.96+.05*n); }
    if(m<5.5){ float n=sN(p*vec3(30.,4.,30.)); return vec2(0.,.96+.06*n); }
    if(m<6.5){ float n=sN(p*20.); return vec2(0.,.98+.03*n); }
    if(m<7.5){ float n=sN(p*14.); return vec2(n*.2,.96+.05*n); }
    if(m<8.5){ float g=sin(p.y*40.+sN(p*10.)*4.)*.5+.5; return vec2(g*.2,.94+.08*g); }
    return vec2(0.,1.); }`;
  // m: 0 plain, 1 knit, 2 cloth, 3 denim, 4 leather, 5 metal, 6 skin, 7 fur, 8 wood, 9 ivory, 10 glass
  function smooth(body,PM,MOVE,AT_){ const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:0,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM;
      sh.vertexShader=MOVE+'\nattribute float mt; varying vec3 vRest; varying float vMt;\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz; vRest=position; vMt=mt;');
      sh.fragmentShader=SURF+'\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n vec2 SF=surf(vMt,vRest); diffuseColor.rgb*=SF.y;')
        .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n metalnessFactor=vMt>4.5&&vMt<5.5?.85:vMt>9.5&&vMt<10.5?.2:0.; roughnessFactor=vMt>4.5&&vMt<5.5?.38:vMt>10.5?.95:vMt>9.5?.08:vMt>8.5?.42:vMt>5.5&&vMt<6.5?.55:vMt>3.5&&vMt<4.5?.5:.9;')
        .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n { float H=SF.x*(vMt>9.5?0.:vMt>5.5&&vMt<6.5?.15:1.); vec3 dpx=dFdx(-vViewPosition), dpy=dFdy(-vViewPosition); float hx=dFdx(H), hy=dFdy(H); vec3 r1=cross(dpy,normal), r2=cross(normal,dpx); float det=dot(dpx,r1); vec3 gr=sign(det)*(hx*r1+hy*r2); normal=normalize(abs(det)*normal-gr*.08); }')
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*(vMt>9.5?.25:vMt>5.5&&vMt<6.5?.1:.06); if(vMt>9.5&&vMt<10.5){ float fr=pow(1.-abs(dot(normalize(vNormal),normalize(vViewPosition))),2.5); totalEmissiveRadiance+=vec3(.55,.8,.8)*fr*.7; diffuseColor.a=.28+.6*fr; } if(vMt>10.5)diffuseColor.a=.5;'); };
    mat.customProgramCacheKey=()=>'bodysm'+NB;
    const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'bodydist'+NB;
    const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'bodydepth'+NB;
    const geo=body.GEO||(body.GEO=body.geo()), see=geo.groups.length>1?mat.clone():null;
    if(see){ see.onBeforeCompile=mat.onBeforeCompile; see.customProgramCacheKey=()=>'bodysmg'+NB; see.transparent=true; see.opacity=1; see.depthWrite=false; }
    const me=new THREE.Mesh(geo,see?[mat,see]:mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=me.receiveShadow=true; cull(me,PM,body); return {me,PM}; }

  /* ---------- posing: the rig's turns, the body's own bone lengths ---------- */
  const X=new V3(),Y=new V3(),Z=new V3(), ROT={}, POS={}, OFV=new V3(), M3=new THREE.Matrix3();
  for(const n of BONES){ ROT[n]=new THREE.Matrix4(); POS[n]=new V3(); }
  // an arm's or leg's twist eased from the rig's reference to its fallback as the arm comes near the reference (the rig switches at once: a knot in the skin)
  const AF={x:{},y:{},z:{}}, armFrame=(a,b,ref,alt)=>{ let yx=b.x-a.x, yy=b.y-a.y, yz=b.z-a.z; const l=Math.hypot(yx,yy,yz)||1; yx/=l; yy/=l; yz/=l;
    const cr=(r)=>[r.y*yz-r.z*yy,r.z*yx-r.x*yz,r.x*yy-r.y*yx], p=cr(ref), q=cr(alt), lp=Math.hypot(...p), w=Math.min(1,Math.max(0,(.45-lp)/.3)), sg=p[0]*q[0]+p[1]*q[1]+p[2]*q[2]<0?-1:1;
    let zx=p[0]*(1-w)+q[0]*sg*w, zy=p[1]*(1-w)+q[1]*sg*w, zz=p[2]*(1-w)+q[2]*sg*w; const lz=Math.hypot(zx,zy,zz)||1; zx/=lz; zy/=lz; zz/=lz;
    AF.y.x=yx; AF.y.y=yy; AF.y.z=yz; AF.z.x=zx; AF.z.y=zy; AF.z.z=zz; AF.x.x=yy*zz-yz*zy; AF.x.y=yz*zx-yx*zz; AF.x.z=yx*zy-yy*zx; return AF; };
  function chain(B,body){ const S=body.S, KL=body.KL;
    for(let i=0;i<NB;i++){ const n=BONES[i], sd=n.charAt(n.length-1), F=n==='upperArmL'||n==='upperArmR'?armFrame(B.J['shoulder'+sd],B.J['elbow'+sd],B.m.Ru.x,B.m.Ru.z):n==='forearmL'||n==='forearmR'?armFrame(B.J['elbow'+sd],B.J['wrist'+sd],B.m.Ru.x,B.m.Ru.z):n==='thighL'||n==='thighR'?armFrame(B.J['hip'+sd],B.J['knee'+sd],B.m.Rb.x,B.m.Rb.z):n==='shinL'||n==='shinR'?armFrame(B.J['knee'+sd],B.J['ankle'+sd],B.m.Rb.x,B.m.Rb.z):R.frameOf(n,B);
      X.set(F.x.x,F.x.y,F.x.z); Y.set(F.y.x,F.y.y,F.y.z); Z.set(F.z.x,F.z.y,F.z.z); if(LIMB.test(n)){ Y.negate(); Z.negate(); }
      ROT[n].makeBasis(X,Y,Z);
      if(n==='hips')POS[n].set(B.J.pelvis.x*KL,B.J.pelvis.y*KL,B.J.pelvis.z*KL);
      else{ const o=body.off[n]; M3.setFromMatrix4(ROT[o[0]]); OFV.set(o[1]*S,o[2]*S,o[3]*S).applyMatrix3(M3); POS[n].copy(POS[o[0]]).add(OFV); } } }
  // a body of other proportions than the rig's (body.contact: your avatar) touches the ground where the rig does: each frame its lowest point (a sole, a palm, its back
  // in a roll) is set at the rig's lowest joint, with the difference they have standing; in the air it is as high off the ground as the rig (owner, 5 Nov 2026: cartwheels too high)
  const lowOf=(PM,body)=>{ const g=body.GEO; if(!g||!g.attributes.position.count)return null; const A=g.attributes, p=A.position.array, bi=A.bi.array, bw=A.bw.array, P=PM.value, n=A.position.count, step=n>3000?3:1; let lo=Infinity;
    for(let i=0;i<n;i+=step){ const a=P[bi[i*2]|0].elements, c=P[bi[i*2+1]|0].elements, w=bw[i], x=p[i*3], y=p[i*3+1], z=p[i*3+2];
      const yy=(a[1]*w+c[1]*(1-w))*x+(a[5]*w+c[5]*(1-w))*y+(a[9]*w+c[9]*(1-w))*z+(a[13]*w+c[13]*(1-w)); if(yy<lo)lo=yy; } return lo; };
  const rigLow=B=>{ let lo=Infinity; for(const k in B.J)if(B.J[k].y<lo)lo=B.J[k].y; return lo; };
  const place=(PM,body,S)=>{ for(let i=0;i<NB;i++){ const n=BONES[i]; PM.value[i].copy(ROT[n]).scale(OFV.set(S,S,S)).setPosition(POS[n]); if(body.binv)PM.value[i].multiply(body.binv[i]); } };
  // a body's own recorded walk (body.anim: your avatar's, Polyfork's Idle, Walk and Run; owner, 5 Nov 2026: "walking is very glitchy ... smooth leg movements", his pick: the
  // clips with the feet on the ground): free on your feet, walking or running, its bones come from the clips, the stride by the ground you cover (no sliding), walk and run
  // blended by the rig's run, idle as you stop; a held tool's arms stay the rig's, carried by the walking body; a move, a ride, climbing or swimming take the rig, crossfaded
  const Q1=new THREE.Quaternion(), Q2=new THREE.Quaternion(), Q3=new THREE.Quaternion(), P1=new V3(), P2=new V3(), P3=new V3(), SC=new V3(), M4=new THREE.Matrix4(), O=new V3(), O2=new V3();
  const PMX={value:BONES.map(()=>new THREE.Matrix4())}, PMR={value:BONES.map(()=>new THREE.Matrix4())};
  const prep=A=>{ if(!A.ready){ for(const c of Object.values(A.clips)){ c.Q=Float32Array.from(c.q); c.P=Float32Array.from(c.p); } A.ready=true; } return A; };
  const clipAt=(c,u,i,q,p)=>{ const f=((u%1)+1)%1*c.n, a=Math.floor(f)%c.n, b=(a+1)%c.n, t=f-Math.floor(f), A=(a*NB+i), Bq=(b*NB+i);
    q.set(c.Q[A*4],c.Q[A*4+1],c.Q[A*4+2],c.Q[A*4+3]); Q3.set(c.Q[Bq*4],c.Q[Bq*4+1],c.Q[Bq*4+2],c.Q[Bq*4+3]); q.slerp(Q3,t);
    p.set(c.P[A*3],c.P[A*3+1],c.P[A*3+2]); P3.set(c.P[Bq*3],c.P[Bq*3+1],c.P[Bq*3+2]); p.lerp(P3,t); };
  const loco=S=>!!S&&!S.move&&!S.ride&&!S.climb&&!S.hang&&!(S.water&&S.water.in)&&!S.sit&&!S.up&&!S.dead&&!S.fly;
  const clamp1=x=>x<0?0:x>1?1:x;
  // a clip at a time in seconds: looped, or held on its last frame
  const clipT=(c,t,loop,i,q,p)=>{ if(loop)return clipAt(c,t/c.dur,i,q,p); const f=Math.max(0,Math.min(c.n-1,t/c.dur*c.n)), a=Math.floor(f), b=Math.min(c.n-1,a+1), x=f-a, A=a*NB+i, Bq=b*NB+i;
    q.set(c.Q[A*4],c.Q[A*4+1],c.Q[A*4+2],c.Q[A*4+3]); Q3.set(c.Q[Bq*4],c.Q[Bq*4+1],c.Q[Bq*4+2],c.Q[Bq*4+3]); q.slerp(Q3,x); p.set(c.P[A*3],c.P[A*3+1],c.P[A*3+2]); P3.set(c.P[Bq*3],c.P[Bq*3+1],c.P[Bq*3+2]); p.lerp(P3,x); };
  // the clip a body's act names (body.act, 111c: Polyfork's clip for what the rig is doing) and when in it; the last one kept a moment to crossfade from
  const actT=(A,C,S,dt)=>{ if(S._an!==A.n){ S._an=A.n; S._at=0; } S._at+=dt; return A.t!=null?A.t:A.u!=null?A.a+A.u*((A.b??C.dur)-A.a):S._at; };
  const Q4=new THREE.Quaternion(), P4=new V3();
  function mocap(PM,body,S,dt,A,AC){ const C=prep(body.anim).clips, w=clamp1(S.w||0), r=clamp1(S.run||0), k=body.S;
    const wd=S.wd||0; let d=S._mwd==null?0:wd-S._mwd; S._mwd=wd; if(d<0)d=0;
    const LC=A&&A.loco&&AC?AC:null;   // (a walk of its own, carrying: in place of the walk, the run and the idle, still where you stop)
    const stride=LC&&!A.idle?LC.speed*LC.dur:C.Walk.speed*C.Walk.dur*(1-r)+C.Run.speed*C.Run.dur*r;   // metres a cycle
    S._mph=((S._mph||0)+d/k/Math.max(.2,stride))%1; S._mit=((S._mit||0)+dt/C.Idle.dur)%1;
    const aw=S._aw=(S._aw||0)+(((A&&AC&&!LC)?1:0)-(S._aw||0))*Math.min(1,dt*8), at=A&&AC&&!LC?actT(A,AC,S,dt):0, loop=!!(A&&A.loop);
    if(A&&AC&&!LC){ if(S._pc&&S._pc.n!==A.n){ S._pf={c:S._pc.c,t:S._pc.t,l:S._pc.l,w:1}; } S._pc={n:A.n,c:AC,t:at,l:loop}; } else if(aw<.01)S._pc=null;
    const PF=S._pf; if(PF){ PF.w-=dt*4; if(PF.w<=0)S._pf=null; }
    for(let i=0;i<NB;i++){ if(LC){ clipAt(LC,S._mph,i,Q2,P2); if(A.idle){ clipAt(C.Idle,S._mit,i,Q1,P1); Q1.slerp(Q2,w); P1.lerp(P2,w); Q2.copy(Q1); P2.copy(P1); } }
      else { clipAt(C.Walk,S._mph+C.Walk.contact,i,Q1,P1); clipAt(C.Run,S._mph+C.Run.contact,i,Q2,P2); Q1.slerp(Q2,r); P1.lerp(P2,r);
        clipAt(C.Idle,S._mit,i,Q2,P2); Q2.slerp(Q1,w); P2.lerp(P1,w); }
      if(aw>.001&&S._pc){ clipT(S._pc.c,S._pc.t,S._pc.l,i,Q1,P1); if(S._pf&&S._pf.w>0){ clipT(S._pf.c,S._pf.t,S._pf.l,i,Q4,P4); Q1.slerp(Q4,S._pf.w); P1.lerp(P4,S._pf.w); } Q2.slerp(Q1,aw); P2.lerp(P1,aw); }
      PM.value[i].compose(P2.multiplyScalar(k),Q2,SC.set(k,k,k)); } look(PM,body,S,dt,w,aw); if(body.O1)relen(PM,body); }
  // standing still a while, the head looks about (owner, 9 Nov 2026: "more idle animations for players when standing, like looking around"): a glance to a side, down, up at the sky, back ahead, every few seconds
  const LK=[[0,0],[.55,.05],[-.6,0],[.3,.28],[-.25,-.32],[.1,-.18],[0,.12]], LQ=new THREE.Quaternion(), LP=new THREE.Quaternion(), LE=new THREE.Euler(), LV=new V3(), LM=new THREE.Matrix4(), LT=new THREE.Matrix4();
  const look=(PM,body,S,dt,w,aw)=>{ if(!body.J0)return; const still=w<.05&&aw<.05; S._ls=still?(S._ls||0)+dt:0; let ty=0, tp=0;
    if(S._ls>2.5){ if(!(S._lt>0)){ S._lt=2.5+Math.random()*3; S._lk=LK[Math.floor(Math.random()*LK.length)]; } S._lt-=dt; [ty,tp]=S._lk||[0,0]; }
    const e=Math.min(1,dt*2.2); S._ly=(S._ly||0)+(ty-(S._ly||0))*e; S._lp=(S._lp||0)+(tp-(S._lp||0))*e; if(Math.abs(S._ly)+Math.abs(S._lp)<.004)return;
    const H=2, M=PM.value[H]; LV.copy(body.J0[H]).applyMatrix4(M); LQ.setFromEuler(LE.set(-S._lp,S._ly,0,'YXZ')); LM.makeRotationFromQuaternion(LQ);
    M.premultiply(LT.makeTranslation(-LV.x,-LV.y,-LV.z)).premultiply(LM).premultiply(LT.makeTranslation(LV.x,LV.y,LV.z)); };
  // a reshaped body (the designer, 111c: O1 the shape's joints) on a recorded clip: every bone turned as the clip has it, each joint where its parent's bone, at the shape's length, puts it
  const RL=BONES.map(()=>new V3()), RM=new THREE.Matrix3(), RV=new V3();
  const relen=(PM,body)=>{ const O1=body.O1; for(let i=0;i<NB;i++){ const n=BONES[i], p=PARENT[n]?BONES.indexOf(PARENT[n]):-1, e=PM.value[i].elements;
      if(p<0)RL[i].copy(O1[i]).applyMatrix4(PM.value[i]); else { RM.setFromMatrix4(PM.value[p]); RL[i].copy(RL[p]).add(RV.subVectors(O1[i],O1[p]).applyMatrix3(RM)); }
      RM.setFromMatrix4(PM.value[i]); RV.copy(O1[i]).applyMatrix3(RM); e[12]=RL[i].x-RV.x; e[13]=RL[i].y-RV.y; e[14]=RL[i].z-RV.z; } };
  // a held tool's arm: the rig's, moved so its shoulder is where the walking body's is
  const ARM={L:[3,4,5],R:[6,7,8]};
  const keepArms=(PM,PR,body)=>{ '@later'; for(const side of ['L','R']){ const [u]=ARM[side]; O.setFromMatrixPosition(M4.copy(body.binv[u]).invert()); O2.copy(O).applyMatrix4(PM.value[u]); O.applyMatrix4(PR.value[u]); O2.sub(O);
      for(const j of ARM[side]){ PM.value[j].copy(PR.value[j]); PM.value[j].elements[12]+=O2.x; PM.value[j].elements[13]+=O2.y; PM.value[j].elements[14]+=O2.z; } } };
  // the rig's pose and a clip's, mixed bone by bone at the joints (the skin's own matrices mixed swing a big arm move about the body's middle: a knot)
  const BW1=new THREE.Matrix4(), BW2=new THREE.Matrix4();
  const blend=(PM,PA,t,body)=>{ const bv=body&&body.binv, bd=bv&&(body._bind||(body._bind=bv.map(m=>m.clone().invert())));
    for(let i=0;i<NB;i++){ if(bd){ BW1.multiplyMatrices(PM.value[i],bd[i]).decompose(P1,Q1,SC); BW2.multiplyMatrices(PA.value[i],bd[i]).decompose(P2,Q2,O); }
      else { PM.value[i].decompose(P1,Q1,SC); PA.value[i].decompose(P2,Q2,O); }
      Q1.slerp(Q2,t); P1.lerp(P2,t); PM.value[i].compose(P1,Q1,SC); if(bd)PM.value[i].multiply(bv[i]); } };
  // the feet on the actual ground (your avatar walking by its clips): each foot's ground under it, the hips lowered to the lower one, each leg bent (two bones) to put its foot there
  const IKV=[new V3(),new V3(),new V3(),new V3(),new V3(),new V3(),new V3()], IKQ=new THREE.Quaternion(), IKM=new THREE.Matrix4(), IKT=new THREE.Matrix4(), LEG={L:[9,10,11],R:[12,13,14]};
  // in the water (treading, swimming): the head's base set over the surface, by A.head rig units (owner, 7 Nov 2026: "your head is almost entirely underwater"), bobbing with the rig
  const HUV=new V3(), headUp=(PM,body,S,G,me)=>{ const W=S.water; G.updateMatrixWorld(true); me.updateMatrixWorld(true); jointAt(PM,body,2,HUV).applyMatrix4(me.matrixWorld); const sy=G.scale.y||1, my=me.matrixWorld.elements[5]||sy;
    const want=G.position.y+(W.level+S._pfHead+Math.max(-2,Math.min(2,(W.y-(W.level+S._pfRest))*.4)))*sy, d=(want-HUV.y)/my*(S._aw||0)*Math.max(0,1-2*(W.under||0)); if(!isFinite(d))return; for(let i=0;i<NB;i++)PM.value[i].elements[13]+=d; };
  BODIES.headUp=headUp;
  // your own head (and hair, hat) drawn to a point at the neck while you look out of it in the headset (W3.noHead, 162c); everyone else still sees it
  const NHJ=new V3(), NHM=new THREE.Matrix4(), noHead=(PM,body)=>{ const k=.001; jointAt(PM,body,2,NHJ); NHM.makeScale(k,k,k).setPosition(NHJ.x*(1-k),NHJ.y*(1-k),NHJ.z*(1-k)); PM.value[2].premultiply(NHM); };
  const jointAt=(PM,body,i,out)=>out.setFromMatrixPosition(IKM.copy(body.binv[i]).invert()).applyMatrix4(PM.value[i]);
  const turnAbout=(Mx,pv,q)=>{ IKT.makeTranslation(-pv.x,-pv.y,-pv.z); Mx.premultiply(IKT); IKT.makeRotationFromQuaternion(q); Mx.premultiply(IKT); IKT.makeTranslation(pv.x,pv.y,pv.z); Mx.premultiply(IKT); };
  function feetOnGround(PM,body,G,ground){ if(!ground||!G)return; G.updateMatrixWorld(true); const Mw=G.matrixWorld, sy=G.scale.y||1, gy=ground(G.position.x,G.position.z), h={};   // (each foot against the ground where you stand: on a crate or a roof the ground under it is not yours)
    for(const s of ['L','R']){ const A=jointAt(PM,body,LEG[s][2],IKV[0]).applyMatrix4(Mw); h[s]=(ground(A.x,A.z)-gy)/sy; if(!isFinite(h[s])||!isFinite(gy)||Math.abs(h[s])>20)h[s]=0; }
    const low=Math.min(0,h.L,h.R); if(Math.abs(h.L)<.05&&Math.abs(h.R)<.05)return;
    for(let i=0;i<NB;i++)PM.value[i].elements[13]+=low;
    for(const s of ['L','R']){ const dy=h[s]-low; if(dy<.05)continue; const [ti,si,fi]=LEG[s], H=jointAt(PM,body,ti,IKV[1]), K=jointAt(PM,body,si,IKV[2]), A=jointAt(PM,body,fi,IKV[3]);
      const At=IKV[4].copy(A); At.y+=dy; const l1=K.distanceTo(H), l2=A.distanceTo(K), d=Math.min(l1+l2-1e-3,At.distanceTo(H));
      const dir=IKV[5].subVectors(At,H).normalize(), pole=IKV[6].subVectors(K,H); pole.addScaledVector(dir,-pole.dot(dir)); if(pole.lengthSq()<1e-6)pole.set(0,0,1); pole.normalize();
      const x=(l1*l1-l2*l2+d*d)/(2*d), yk=Math.sqrt(Math.max(0,l1*l1-x*x)), Kt=IKV[0].copy(H).addScaledVector(dir,x).addScaledVector(pole,yk);
      IKQ.setFromUnitVectors(IKV[5].subVectors(K,H).normalize(),IKV[6].subVectors(Kt,H).normalize()); turnAbout(PM.value[ti],H,IKQ); turnAbout(PM.value[si],H,IKQ); turnAbout(PM.value[fi],H,IKQ);
      const K2=jointAt(PM,body,si,IKV[1]), A2=jointAt(PM,body,fi,IKV[2]); IKQ.setFromUnitVectors(IKV[5].subVectors(A2,K2).normalize(),IKV[6].subVectors(At,K2).normalize()); turnAbout(PM.value[si],K2,IKQ);
      const A3=jointAt(PM,body,fi,IKV[5]); PM.value[fi].elements[12]+=At.x-A3.x; PM.value[fi].elements[13]+=At.y-A3.y; PM.value[fi].elements[14]+=At.z-A3.z; } }
  BODIES.feetOnGround=feetOnGround;
  // momentum (owner, 5 Nov 2026: "the running and stopping, etc ... like it used to (realistic)"): your avatar on its clips leans with what its speed does: into a start and a run,
  // into a turn, and on a stop its upper body carries on and rocks back (the rig's own stop sway); a damped spring each, about the feet (whole body) and the waist (the upper body)
  const MO={v:0,a:0,yaw:null,pit:0,pv:0,rol:0,rv:0}, MQ=new THREE.Quaternion(), MA=new V3(), MP=new V3(), MM=new THREE.Matrix4();
  const spin=(PM,ids,pv,axis,ang)=>{ if(Math.abs(ang)<1e-4)return; MQ.setFromAxisAngle(MA.copy(axis),ang); for(const i of ids)turnAbout(PM.value[i],pv,MQ); };
  const ALL=[...Array(NB).keys()], UPPER=[1,2,3,4,5,6,7,8], XA=new V3(1,0,0), ZA=new V3(0,0,1);
  function momentum(PM,body,S,G,dt){ if(!dt)return; const k=body.S, wd=S.wd||0; const d=MO.wd==null?0:Math.max(0,wd-MO.wd); MO.wd=wd; const v=Math.min(12,d/k/dt);
    const a=(v-MO.v)/dt; MO.v+=(v-MO.v)*Math.min(1,dt*12); MO.a+=(a-MO.a)*Math.min(1,dt*8);
    const yaw=G.rotation.y; let w=0; if(MO.yaw!=null){ w=Math.atan2(Math.sin(yaw-MO.yaw),Math.cos(yaw-MO.yaw))/dt; } MO.yaw=yaw;
    const pt=Math.max(-.12,Math.min(.22,.018*MO.v+.035*Math.max(0,MO.a))), rt=Math.max(-.3,Math.min(.3,-Math.atan(MO.v*w/9.8)));
    MO.pv+=((pt-MO.pit)*60-MO.pv*9)*dt; MO.pit+=MO.pv*dt; MO.rv+=((rt-MO.rol)*50-MO.rv*10)*dt; MO.rol+=MO.rv*dt;
    const so=S.stop, ks=so?so.a*Math.exp(-so.t/.3)*Math.cos(2*Math.PI*so.t/.8):0, m=S._mw||0;
    const fL=jointAt(PM,body,11,IKV[0]), fR=jointAt(PM,body,14,IKV[1]); MP.copy(fL).add(fR).multiplyScalar(.5); MP.y=Math.min(fL.y,fR.y);
    spin(PM,ALL,MP,XA,MO.pit*m); spin(PM,ALL,MP,ZA,MO.rol*m);
    if(ks){ const W=jointAt(PM,body,1,IKV[2]); spin(PM,UPPER,W,XA,.3*ks*m); } }
  BODIES.momentum=momentum;
  // never under the ground: your avatar's lowest point is raised onto the ground under it, if the rig's pose left it below (after some moves the rig sinks; owner, 5 Nov 2026: "they touch the ground when they are supposed to"); never lowered (on a crate or a roof the ground is further down); not in a pull-up from below a ledge (a move with `below`: the mantle), which starts under it
  const LOWV=new V3();
  function aboveGround(PM,body,G,ground){ const g=body.GEO; if(!ground||!G||!g||!g.attributes.position.count)return; const A=g.attributes, p=A.position.array, bi=A.bi.array, bw=A.bw.array, P=PM.value, n=A.position.count, step=n>3000?3:1; let lo=Infinity, li=-1;
    for(let i=0;i<n;i+=step){ const a=P[bi[i*2]|0].elements, c=P[bi[i*2+1]|0].elements, w=bw[i], x=p[i*3], y=p[i*3+1], z=p[i*3+2];
      const yy=(a[1]*w+c[1]*(1-w))*x+(a[5]*w+c[5]*(1-w))*y+(a[9]*w+c[9]*(1-w))*z+(a[13]*w+c[13]*(1-w)); if(yy<lo){ lo=yy; li=i; } }
    if(li<0)return; const a=P[bi[li*2]|0].elements, c=P[bi[li*2+1]|0].elements, w=bw[li], x=p[li*3], y=p[li*3+1], z=p[li*3+2];
    LOWV.set((a[0]*w+c[0]*(1-w))*x+(a[4]*w+c[4]*(1-w))*y+(a[8]*w+c[8]*(1-w))*z+(a[12]*w+c[12]*(1-w)),lo,(a[2]*w+c[2]*(1-w))*x+(a[6]*w+c[6]*(1-w))*y+(a[10]*w+c[10]*(1-w))*z+(a[14]*w+c[14]*(1-w)));
    G.updateMatrixWorld(true); LOWV.applyMatrix4(G.matrixWorld); const sy=G.scale.y||1, f=(ground(LOWV.x,LOWV.z)-LOWV.y)/sy; if(!isFinite(f)||f<.3||f>80)return;
    for(let i=0;i<NB;i++)P[i].elements[13]+=f; }
  function pose(B,PM,body,S){ const k=body.S; PM.B=B; if(PM.ov)PM.ov.value=.035*k; if(PM.fk){ const F=S&&S.fly; PM.fk.value=F?F.k*(.35+.65*Math.min(1,F.f||0)):0; PM.ft.value=performance.now()/1000; } chain(B,body); place(PM,body,k);
    if(body.contact){ const g=body.GEO;
      if(body._calG!==g){ const B0=R.build(R.walkPose({ph:0,w:0,run:0},null),null); chain(B0,body); place(PM,body,k); const l0=lowOf(PM,body); body._cal=l0==null?null:l0-rigLow(B0); body._calG=g; chain(B,body); place(PM,body,k); }
      // seated (a seat, the kart, a car, a bike): its hips on the rig's hips, the seat, its legs from there (owner, 5 Nov 2026: in the kart it sat high above the seat)
      const lo=B.seat?null:body._cal==null?null:lowOf(PM,body), dy=B.seat?B.J.pelvis.y-POS.hips.y:lo!=null?rigLow(B)+body._cal-lo:0; if(dy)for(let i=0;i<NB;i++)PM.value[i].elements[13]+=dy; }
    if(body.anim&&S){ const now=performance.now(), dt=Math.min(.1,S._mt?(now-S._mt)/1000:0); S._mt=now;
      const A=body.act&&!S.dead?body.act(S):null, AC=A&&body.clip?body.clip(A.n):null, want=loco(S)||AC?1:0;   // (a clip not fetched yet: the rig, until it comes)
      S._mw=(S._mw??want)+(want-(S._mw??want))*Math.min(1,dt*10); if(Math.abs(S._mw-want)<.01)S._mw=want; S._pfSeat=!!(AC&&A.seat); S._seatOut=S._pfSeat?1:S._mw>0?S._seatOut||0:0; S._pfHead=AC&&A.head||0; S._pfRest=AC&&A.rest||0;
      if(want||S._mw>0){ mocap(PMX,body,S,dt,AC?A:null,AC);
        if(S._pfSeat||S._seatOut){ jointAt(PM,body,0,O); jointAt(PMX,body,0,O2); O.sub(O2); O.multiplyScalar(1); for(let i=0;i<NB;i++){ const e=PMX.value[i].elements; e[12]+=O.x; e[13]+=O.y; e[14]+=O.z; } }   // (seated or swimming: the hips where the rig has them)
        if(S.aim&&S.aim.w>.3){ for(let i=0;i<NB;i++)PMR.value[i].copy(PM.value[i]); keepArms(PMX,PMR,body); }   // (a held tool: the arms where the rig aims them)
        if(S._mw>=1)for(let i=0;i<NB;i++)PM.value[i].copy(PMX.value[i]); else blend(PM,PMX,S._mw,body); } }
    if(PM.post)PM.post(PM,body,B); else if(PM.vr&&BODIES.track)BODIES.track(PM,body,PM.vr); }   // (a step after the pose: holding the guitar, 146zoa; or a headset player's own head, arms and fingers, 162cb)
  BODIES.pose=pose; BODIES.mesh=mesh;
  // a body's own hand (your avatar's, or another player's), where what it holds goes: shoulder, elbow, wrist and palm in its group's space; null for a body without bones of its own
  const HJ={shoulder:new V3(),elbow:new V3(),wrist:new V3(),palm:new V3()}, ARMI={L:[3,4,5],R:[6,7,8]};
  BODIES.hand=(side,PM,body,B)=>{ '@later'; if(!PM){ if(!ME||!W3.body.on)return null; PM=ME.PM; body=BODIES.by[MEK]; B=W3.lastB; } if(!body||!body.binv||!PM)return null; const [u,f,h]=ARMI[side==='L'?'L':'R'];
    jointAt(PM,body,u,HJ.shoulder); jointAt(PM,body,f,HJ.elbow); jointAt(PM,body,h,HJ.wrist); const J=B&&B.J, a=J&&J['palm'+side], b=J&&J['wrist'+side], d=a&&b?Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)*(body.KL||1):0;
    HJ.palm.subVectors(HJ.wrist,HJ.elbow).normalize().multiplyScalar(d).add(HJ.wrist); return HJ; };

  /* ---------- you: the avatar (owner, 5 Nov 2026: "remove walker from game completely. no option other than this new avatar to play"); the Walker is never drawn, its rig moves the avatar ---------- */
  const playable=b=>!!(b&&b.playable);
  let pick='avatar'; if(QS.get('avatar')&&QS.get('avatar')!=='walker')pick=QS.get('avatar');
  const curKey=()=>playable(BODIES.by[pick])?pick:'avatar';
  let ME=null, MEK=null;
  const MINE={me:null,PM:null,body:null}; BODIES.mine=()=>{ if(!ME)return null; MINE.me=ME.me; MINE.PM=ME.PM; MINE.body=BODIES.by[MEK]; return MINE; };   // your avatar's mesh, bones and body
  W3.body={on:false,place:B=>{ const key=curKey(), body=BODIES.by[key]; W3.body.on=!!body;   // (on: a body is worn this frame, so the Walker's physics body stands down: 090-physbody)
    for(const m of W3.meshes)m.visible=false;   // (the Walker is never drawn, not even while your avatar loads)
    if(!body){ if(ME)ME.me.visible=false; return; }
    if(MEK!==key||ME.me.geometry!==body.GEO){ if(ME){ W3.group.remove(ME.me); ME.me.material.dispose(); } ME=mesh(body); MEK=key; W3.group.add(ME.me); }
    ME.me.visible=!W3.hideMe&&!W3.ghost; pose(B,ME.PM,body,RAG.on||VIT.dead?null:st); if(st._pfHead&&st.water&&st.water.in&&st.water.level!=null&&body.binv)headUp(ME.PM,body,st,W3.group,ME.me); if(body.anim&&st._mw>0&&!RAG.on&&!st._pfSeat){ const now=performance.now(), dt=MO.t?Math.min(.1,(now-MO.t)/1000):0; MO.t=now; momentum(ME.PM,body,st,W3.group,dt); feetOnGround(ME.PM,body,W3.group,SHARED.groundY); } else MO.t=0; if(!RAG.on&&!B.seat&&!st.climb&&!st.hang&&!(st.water&&st.water.in)&&!(st.move&&st.move.def.below!=null))aboveGround(ME.PM,body,W3.group,SHARED.groundY); if(W3.noHead&&body.binv)noHead(ME.PM,body); },   // (your rig state: your avatar walks by its clips)
    // the physics body (090-physbody: the rig's 15 parts in Rapier, loose and limp when you're down) moved its parts: D[i] is part i's move off the rig, T the rig's place in that world
    phys:(D,T)=>{ if(!ME)return; W3.body.physN=(W3.body.physN||0)+1; const P=ME.PM.value; for(let i=0;i<NB;i++)P[i].premultiply(T).premultiply(D[i]); }};   // (dead, you're the ghost sheet: 103a-death)
  for(const m of W3.meshes)m.visible=false;
  BODIES.pick=()=>curKey();
  BODIES.onPick=[];   // told the body you now play as
  BODIES.set=key=>{ pick=playable(BODIES.by[key])?key:'avatar'; for(const f of BODIES.onPick)f(curKey()); };
  // YOU's BODY line: every body you can be, once there is more than one; your pick is kept with your save
  { let row=null; if(!QS.get('avatar')){ const k=SAVE.get('body'); if(k)pick=k; }
    const draw=()=>{ const L=BODIES.list.filter(playable); if(L.length<2||!LOOKS.add||!document.getElementById('looks'))return;
      if(!row){ row=document.createElement('div'); row.className='row'; row.id='lbody'; row.onclick=e=>{ const b=e.target.closest('button'); if(b)BODIES.set(b.dataset.b); }; LOOKS.add('body','BODY',row,{order:0}); }
      row.innerHTML=L.map(b=>`<button data-b="${b.key}" aria-pressed="${b.key===curKey()}">${b.label}</button>`).join(''); };
    BODIES.onPick.push(k=>{ SAVE.set('body',k); draw(); });
    BODIES.joined=body=>{ if(!playable(body))return; draw(); if(body.key===pick)for(const f of BODIES.onPick)f(curKey()); }; }
  // a borrowed model's licence line, shown under the menu's KEYS
  BODIES.credit=t=>{ const c=document.getElementById('credits'); if(!c)return; const d=document.createElement('div'); d.textContent=t; c.appendChild(d); };

  /* ---------- a body that walks main street (?<key>=0 keeps it off, ?sheet=<key> shows its sheet) ---------- */
  const seen=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return true; };
  BODIES.place=(key,x,z,hd,group)=>{ '@later'; const N=BODIES.by[key]&&BODIES.by[key].npc; if(!N)return null; const s=N.st; if(!N.prev)N.prev={parent:N.g.parent,x:s.x,z:s.z,hd:s.hd,home:{...s.home},free:N.free,on:N.on}; s.x=x; s.z=z; s.hd=hd; s.to=s.next=null; Object.assign(s.home,{x,z,r:0}); N.free=()=>true; if(group)group.add(N.g); N.on=true; return N; };
  BODIES.hide=key=>{ const N=BODIES.by[key]&&BODIES.by[key].npc; if(N){ N.on=false; VIS.hide(N.g,'away'); } };
  // a borrowed body (one a place conjures for a while) goes back where it was: its group, spot, home and roaming
  BODIES.restore=key=>{ const N=BODIES.by[key]&&BODIES.by[key].npc, P=N&&N.prev; if(!P){ BODIES.hide(key); return; } const s=N.st; if(P.parent)P.parent.add(N.g); s.x=P.x; s.z=P.z; s.hd=P.hd; s.to=s.next=null; Object.assign(s.home,P.home); N.free=P.free; N.on=P.on; VIS.hide(N.g,'away',!P.on); delete N.prev; };
  // weld a townsperson body's duplicate vertices (one that building it a face at a time left). A smooth body uses its normals, so they must match to merge; a flat body takes its normal from the screen (dFdx), so that attribute is free to differ — dropping it from the key merges more. The index keeps the original length and triangle order, so material groups stay valid. Never a playable body (the Walker shares and reshapes its geometry).
  const weldBody=(g,smooth)=>{ if(g.index)return; const A=g.attributes, all=Object.keys(A), key=smooth?all:['position','color','bi','bw'].filter(k=>A[k]), KA=key.map(nm=>({a:A[nm].array,sz:A[nm].itemSize})), n=A.position.count, buckets=new Map(), idx=new Uint32Array(n), uq=[];
    const eq=(i,j)=>{ for(const {a,sz} of KA)for(let c=0;c<sz;c++)if(a[i*sz+c]!==a[j*sz+c])return false; return true; }, PA=A.position.array;
    for(let i=0;i<n;i++){ const o=i*3, h=(Math.imul(PA[o]*4096|0,73856093)^Math.imul(PA[o+1]*4096|0,19349663)^Math.imul(PA[o+2]*4096|0,83492791))>>>0; let bk=buckets.get(h), u=-1; if(bk){ for(let x=0;x<bk.length;x++)if(eq(i,uq[bk[x]])){ u=bk[x]; break; } } else buckets.set(h,bk=[]); if(u<0){ u=uq.length; uq.push(i); bk.push(u); } idx[i]=u; }
    if(uq.length>n*0.95)return; for(const nm of all){ const a=A[nm], sz=a.itemSize, src=a.array, dst=new src.constructor(uq.length*sz); for(let j=0;j<uq.length;j++){ const o=uq[j]*sz, d=j*sz; for(let c=0;c<sz;c++)dst[d+c]=src[o+c]; } g.setAttribute(nm,new THREE.BufferAttribute(dst,sz,a.normalized)); }
    g.setIndex(new THREE.BufferAttribute(uq.length>65535?idx:Uint16Array.from(idx),1)); g.boundingSphere=null; };
  function walker(body){ const SHEET=QS.get('sheet')===body.key, NPC=body.npc={}; if(!playable(body)){ body.GEO||(body.GEO=body.geo()); weldBody(body.GEO,body.smooth); } const g=new THREE.Group(), FIG=mesh(body); g.add(FIG.me); (body.root||MAPG.bodega).add(g); NPC.g=g;
    const st={x:SHARED.BOD.XS(body.at??100),z:SHARED.BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:3+Math.random()*4,hd:-Math.PI/2,y:0}, SR=R.create(); NPC.st=st; NPC.at=st; NPC.SR=SR;
    const free=(x,z)=>NPC.free?NPC.free(x,z):stfree(x,z,st.R), turn=a=>{ const e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
    if(SHEET){ st.x=SHARED.BOD.XS(100); st.z=SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2); st.hd=Math.PI/4; }
    if(NPCS.extra&&!ARCH.has(body.key))NPCS.extra.push(NPC);
    NPC.on=QS.get(body.key)!=='0'&&body.at!=null; if(body.at!=null)HOMES.assign(st,body.key,{lv:'up'},(x,z)=>stfree(x,z,st.R)); else HOMES.assign(st,body.key,{home:{x:st.x,z:st.z,r:0}}); NPC.walk={auto:true,roam:true,v:BODIES.V}; NPC.key=body.key; NPC.name=body.label; NPC.size=body.size||1; NPC.body=body; NPC.PM=FIG.PM; if(body.hd!=null)st.hd=body.hd; if(CHARS.apply)CHARS.apply(NPC);
    if(body.ride){ NPC.board=body.ride.make(); NPC.board.visible=false; NPC.board.userData.anyRoom=true; (body.root||MAPG.bodega).add(NPC.board); NPC.RS={v:0,z:0,vz:0,lean:0,push:-1,pt:0}; }   // a rider: a RIDE kind's board under its feet
    NPC.tick=dt=>{ if(NPC.rag&&NPC.mode==='hidden')NPC.rag(dt);
      if((!NPC.on||NPC.mode==='hidden'||ARCH.has(body.key))&&!SHEET){ g.visible=false; if(NPC.board)NPC.board.visible=false; return; } g.visible=true;
      if(SHEET){ R.farOnly(false); const B=R.settle(R.build(QS.has('sheetidle')&&body.idle?body.idle(performance.now()/1000,NPC):spreadPose(),null),0); st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1); pose(B,FIG.PM,body);
        if(!NPC.sheetOn){ NPC.sheetOn=true; sheetView(g,st.y+g.scale.y*27); } return; }
      if(NPC.rag){ const B=NPC.rag(dt); if(B){ NPC.B=B; pose(B,FIG.PM,body); return; } }
      const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;
      if(!st.pin&&(st.x!==NPC.fx||st.z!==NPC.fz||(NPC.ft-=dt)<=0)){ NPC.ft=1; if(!free(st.x,st.z)){ for(let k=0;k<80;k++){ const a=k*2.4, r=(k>>2)*.25*TILE; if(free(st.x+Math.sin(a)*r,st.z+Math.cos(a)*r)){ st.x+=Math.sin(a)*r; st.z+=Math.cos(a)*r; break; } } } NPC.fx=st.x; NPC.fz=st.z; }   // (where it stands checked when it moved, else once a second)
      if(st.pin)st.to=null;
      if(!st.to){ SR.target=0; st.wait-=dt; if(st.wait<=0&&!st.hold&&!NPC.errand&&!ROAM.pick(st,(x,z)=>free(x,z)))st.wait=1; }
      if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez);
        if(d<.15*TILE){ st.to=st.next||null; st.next=null; if(!st.to)st.wait=3+Math.random()*7; }
        else{ const e=turn(Math.atan2(ex,ez)); st.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*3); SR.target=Math.abs(e)<.6?1:0; } }
      let go;
      if(body.ride){ const RS=NPC.RS, vm=(body.rideSpeed||3)*TILE/.84, mv=!!st.to&&SR.target>0;   // on its board: rolls, pushing off while it gathers speed, coasts, brakes to a stop
        RS.v=mv?Math.min(vm,RS.v+vm*.5*dt):Math.max(0,RS.v-vm*1.5*dt); if(mv&&RS.v<vm*.9){ RS.pt+=dt*1.3; RS.push=RS.pt%1; } else { RS.pt=0; RS.push=-1; }
        go=st.to?Math.min(RS.v*dt,Math.hypot(st.to.x-st.x,st.to.z-st.z)):0; SR.ride=body.ride.pose(RS); }
      else{ const d0=SR.dist; R.farOnly(true); R.step(SR,dt); R.farOnly(false); go=(SR.dist-d0)*W3.BASE/PPU*.85; }
      if(go>0){ const nx=st.x+Math.sin(st.hd)*go, nz=st.z+Math.cos(st.hd)*go; if(free(nx,nz)){ st.x=NPC.fx=nx; st.z=NPC.fz=nz; } else { st.to=null; st.next=null; st.wait=.5+Math.random(); if(NPC.RS)NPC.RS.v=0; } }
      st.y=(body.ground||MODS.bodega.ground)(st.x,st.z)+(body.lift?body.lift(performance.now()/1000,NPC):0); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1); if(NPC.size!==1)g.scale.multiplyScalar(NPC.size);
      if(NPC.board){ const b=NPC.board; b.visible=true; b.position.set(st.x,st.y+R.RIDEG.deck*g.scale.y,st.z); b.rotation.set(0,st.hd,0); if(body.ride.place)body.ride.place(b,NPC.RS,0,{g,S:body.S||1}); }
      const eye=!near&&WINDOWS.near(st.x,st.z); if(!(near||eye)||!seen(g)||NPC.hid&&!eye)return; if(NPC.B&&!(st.to&&LIVEP.has(NPC))&&!ASTEP.gate(NPC,dt))return;
      R.farOnly(true); const B=body.idle&&!st.to&&!NPC.busy&&!SR.sit?R.settle(R.build(body.idle(performance.now()/1000,NPC),null),0):R.pose(SR,true); R.farOnly(false); NPC.B=B; pose(B,FIG.PM,body); if(body.after)body.after(B,NPC,dt); };   // (no fingers worked out: a body has no finger bones)
  }
  // the nearest walkers on the move get a pose every frame, as you do; the rest keep the 10-a-second step
  const LIVEP=new Set(); let smT=0;
  const liveP=dt=>{ if((smT-=dt)>0)return; smT=.25; LIVEP.clear(); const L=[]; for(const b of BODIES.list){ const N=b.npc; if(N&&N.on&&N.mode!=='hidden'&&N.st&&N.st.to)L.push([Math.hypot(N.st.x-pos.x,N.st.z-pos.z),N]); }
    L.sort((a,b)=>a[0]-b[0]); for(let i=0;i<Math.min(BODIES.SMOOTH,L.length);i++)LIVEP.add(L[i][1]); };
  BODIES.SMOOTH=8; BODIES.V=.3*TILE;
  SYS.add('dress',dt=>{ liveP(dt||0); for(const b of BODIES.list)if(b.npc&&b.npc.tick)b.npc.tick(dt||0); },'111a-bodies');   // every walker body, one entry

  /* ---------- a body: key, label, geo() (position, normal, color, bi, bw), height and hip height (its units), off {bone:[parent,x,y,z]}, binv (or null), at (main street spot) ---------- */
  /* ---------- a re-baked body (rig-rebake.py: a clip character's own skeleton baked onto these 15 bones, its own per-vertex colours) as one flat-faced mesh ---------- */
  const rebakedObj=(D,key,more)=>{ const b=D.bodies[key], {off,binv}=BODIES.skeleton(b.origin,b.rest);
    const geo=()=>{ const Q=I16(b.pos), P=new Float32Array(Q.length); for(let i=0;i<Q.length;i++)P[i]=(Q[i]+32500)*b.sc+b.lo[i%3];
      const T=U16(b.tri), VC=B64(b.vcol), BN=B64(b.bone), BW=B64(b.w), nf=T.length/3, pos=new Float32Array(nf*9), nor=new Float32Array(nf*9), col=new Float32Array(nf*9), bi=new Float32Array(nf*6), bw=new Float32Array(nf*3), va=new V3(),vb=new V3(),vc=new V3(),n=new V3(),e=new V3();
      for(let f=0;f<nf;f++){ const ix=[T[f*3],T[f*3+1],T[f*3+2]]; va.fromArray(P,ix[0]*3); vb.fromArray(P,ix[1]*3); vc.fromArray(P,ix[2]*3); n.subVectors(vb,va).cross(e.subVectors(vc,va)).normalize();
        ix.forEach((v,j)=>{ const o=f*3+j; pos.set([P[v*3],P[v*3+1],P[v*3+2]],o*3); nor.set([n.x,n.y,n.z],o*3); col.set([VC[v*3]/255,VC[v*3+1]/255,VC[v*3+2]/255],o*3); bi.set([BN[v*2],BN[v*2+1]],o*2); bw[o]=BW[v]/255; }); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
      g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1)); g.computeBoundingSphere(); return g; };
    return {key,geo,height:b.height,hipY:b.hipY,off,binv,...more}; };
  BODIES.rebaked=(D,key,label,at,more)=>BODIES.add(rebakedObj(D,key,{label,at,...more}));
  BODIES.rebakedBody=(D,key,more)=>BODIES.fit(rebakedObj(D,key,more));   // a body for an overlay (not a street walker)
  BODIES.fit=body=>{ body.S=WALKER_H/body.height; body.KL=body.hipY*body.S/R.STAND; body.tris=()=>{ const g=body.GEO||(body.GEO=body.geo()); return (g.index?g.index.count:g.attributes.position.count)/3; }; return body; };   // (scaled so its height is the Walker's)
  BODIES.add=body=>{ BODIES.fit(body); BODIES.list.push(body); BODIES.by[body.key]=body;
    walker(body); BODIES.joined(body); };
}
export {BODIES};
