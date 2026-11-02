// THE BODIES: the Walker you play as, and bodies moved by his rig (each of its 15 bones takes the turn of the rig piece it stands for); you are always the Walker (a body.playable one could be picked with BODIES.set); one of each walks main street.
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {CHARS, NPCS, pos, W3} from './003b-systems.js';
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
  function mesh(body){ const PM={value:Array.from({length:NB},()=>new THREE.Matrix4())};
    const MOVE=`attribute vec2 bi; attribute float bw; uniform mat4 uPM[${NB}];`, AT_=`mat4 PM=uPM[int(bi.x+.5)]*bw+uPM[int(bi.y+.5)]*(1.-bw);`;
    if(body.smooth)return smooth(body,PM,MOVE,AT_);
    const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition))); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
    mat.customProgramCacheKey=()=>'body'+NB;
    const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'bodydist'+NB;
    const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'bodydepth'+NB;
    const me=new THREE.Mesh(body.GEO||(body.GEO=body.geo()),mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=me.receiveShadow=true; cull(me,PM,body);
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
  function pose(B,PM,body){ const S=body.S, KL=body.KL;
    for(let i=0;i<NB;i++){ const n=BONES[i], F=R.frameOf(n,B);
      X.set(F.x.x,F.x.y,F.x.z); Y.set(F.y.x,F.y.y,F.y.z); Z.set(F.z.x,F.z.y,F.z.z); if(LIMB.test(n)){ Y.negate(); Z.negate(); }
      ROT[n].makeBasis(X,Y,Z);
      if(n==='hips')POS[n].set(B.J.pelvis.x*KL,B.J.pelvis.y*KL,B.J.pelvis.z*KL);
      else{ const o=body.off[n]; M3.setFromMatrix4(ROT[o[0]]); OFV.set(o[1]*S,o[2]*S,o[3]*S).applyMatrix3(M3); POS[n].copy(POS[o[0]]).add(OFV); }
      PM.value[i].copy(ROT[n]).scale(OFV.set(S,S,S)).setPosition(POS[n]); if(body.binv)PM.value[i].multiply(body.binv[i]); } }
  BODIES.pose=pose; BODIES.mesh=mesh;

  /* ---------- you (always the Walker unless a playable body is set; knight/man/woman stay in the game as its people; kept in the browser; ?avatar=key) ---------- */
  const playable=b=>!!(b&&b.playable);
  let pick='walker'; try{ pick=SAVE.get('body')||'walker'; }catch(e){} if(QS.get('avatar'))pick=QS.get('avatar');
  const curKey=()=>playable(BODIES.by[pick])?pick:'walker';
  let ME=null, MEK=null, hid=false;
  W3.body={on:false,place:B=>{ const key=curKey(), body=BODIES.by[key]; W3.body.on=!!body;   // (on: a body is worn this frame, so the Walker's physics body stands down: 090-physbody)
    if(!body){ if(ME)ME.me.visible=false; if(hid){ hid=false; for(const m of W3.meshes)m.visible=!W3.hideMe; } return; }
    if(MEK!==key||ME.me.geometry!==body.GEO){ if(ME){ W3.group.remove(ME.me); ME.me.material.dispose(); } ME=mesh(body); MEK=key; W3.group.add(ME.me); }
    hid=true; for(const m of W3.meshes)m.visible=false; ME.me.visible=!W3.hideMe&&!W3.ghost; pose(B,ME.PM,body); }};   // (dead, you're the ghost sheet: 103a-death)
  BODIES.pick=()=>curKey();
  BODIES.set=key=>{ pick=(key==='walker'||playable(BODIES.by[key]))?key:'walker'; try{ SAVE.set('body',pick); }catch(e){} };
  // a borrowed model's licence line, shown under the menu's KEYS
  BODIES.credit=t=>{ const c=document.getElementById('credits'); if(!c)return; const d=document.createElement('div'); d.textContent=t; c.appendChild(d); };

  /* ---------- a body that walks main street (?<key>=0 keeps it off, ?sheet=<key> shows its sheet) ---------- */
  const seen=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return true; };
  BODIES.place=(key,x,z,hd,group)=>{ const N=BODIES.by[key]&&BODIES.by[key].npc; if(!N)return null; const s=N.st; if(!N.prev)N.prev={parent:N.g.parent,x:s.x,z:s.z,hd:s.hd,home:{...s.home},free:N.free,on:N.on}; s.x=x; s.z=z; s.hd=hd; s.to=s.next=null; Object.assign(s.home,{x,z,r:0}); N.free=()=>true; if(group)group.add(N.g); N.on=true; return N; };
  BODIES.hide=key=>{ const N=BODIES.by[key]&&BODIES.by[key].npc; if(N){ N.on=false; N.g.visible=false; } };
  // a borrowed body (one a place conjures for a while) goes back where it was: its group, spot, home and roaming
  BODIES.restore=key=>{ const N=BODIES.by[key]&&BODIES.by[key].npc, P=N&&N.prev; if(!P){ BODIES.hide(key); return; } const s=N.st; if(P.parent)P.parent.add(N.g); s.x=P.x; s.z=P.z; s.hd=P.hd; s.to=s.next=null; Object.assign(s.home,P.home); N.free=P.free; N.on=P.on; N.g.visible=!!P.on; delete N.prev; };
  function walker(body){ const SHEET=QS.get('sheet')===body.key, NPC=body.npc={}, g=new THREE.Group(), FIG=mesh(body); g.add(FIG.me); (body.root||MAPG.bodega).add(g); NPC.g=g;
    const st={x:SHARED.BOD.XS(body.at??100),z:SHARED.BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:3+Math.random()*4,hd:-Math.PI/2,y:0}, SR=R.create(); NPC.st=st; NPC.at=st;
    const free=(x,z)=>NPC.free?NPC.free(x,z):stfree(x,z,st.R), turn=a=>{ const e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
    if(SHEET){ st.x=SHARED.BOD.XS(100); st.z=SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2); st.hd=Math.PI/4; }
    if(NPCS.extra)NPCS.extra.push(NPC);
    NPC.on=QS.get(body.key)!=='0'&&body.at!=null; if(body.at!=null)HOMES.assign(st,body.key,{lv:'up'},(x,z)=>stfree(x,z,st.R)); else HOMES.assign(st,body.key,{home:{x:st.x,z:st.z,r:0}}); NPC.key=body.key; NPC.name=body.label; NPC.size=body.size||1; NPC.body=body; NPC.PM=FIG.PM; if(body.hd!=null)st.hd=body.hd; if(CHARS.apply)CHARS.apply(NPC);
    NPC.tick=dt=>{ if(!NPC.on&&!SHEET){ g.visible=false; return; } g.visible=true;
      if(SHEET){ R.farOnly(false); const B=R.settle(R.build(spreadPose(),null),0); st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1); pose(B,FIG.PM,body);
        if(!NPC.sheetOn){ NPC.sheetOn=true; sheetView(g,st.y+g.scale.y*27); } return; }
      const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;
      if(!free(st.x,st.z)){ for(let k=0;k<80;k++){ const a=k*2.4, r=(k>>2)*.25*TILE; if(free(st.x+Math.sin(a)*r,st.z+Math.cos(a)*r)){ st.x+=Math.sin(a)*r; st.z+=Math.cos(a)*r; break; } } }
      if(!st.to){ SR.target=0; st.wait-=dt; if(st.wait<=0&&!ROAM.pick(st,(x,z)=>free(x,z)))st.wait=1; }
      if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez);
        if(d<.15*TILE){ st.to=st.next||null; st.next=null; if(!st.to)st.wait=3+Math.random()*7; }
        else{ const e=turn(Math.atan2(ex,ez)); st.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*3); SR.target=Math.abs(e)<.6?1:0; } }
      const d0=SR.dist; R.step(SR,dt); const go=(SR.dist-d0)*W3.SZ/PPU*.85;
      if(go>0){ const nx=st.x+Math.sin(st.hd)*go, nz=st.z+Math.cos(st.hd)*go; if(free(nx,nz)){ st.x=nx; st.z=nz; } else { st.to=null; st.next=null; st.wait=.5+Math.random(); } }
      st.y=MODS.bodega.ground(st.x,st.z)+(body.lift?body.lift(performance.now()/1000,NPC):0); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1); if(NPC.size!==1)g.scale.multiplyScalar(NPC.size);
      if(!near||!seen(g)||NPC.hid)return; if(NPC.B&&!ASTEP.gate(NPC,dt))return;
      R.farOnly(false); const B=body.idle&&!st.to?R.settle(R.build(body.idle(performance.now()/1000,NPC),null),0):R.pose(SR,true); NPC.B=B; pose(B,FIG.PM,body); if(body.after)body.after(B,NPC,dt); };
    SYS.add('dress',dt=>NPC.tick(dt||0),'111a-bodies '+body.key); }

  /* ---------- a body: key, label, geo() (position, normal, color, bi, bw), height and hip height (its units), off {bone:[parent,x,y,z]}, binv (or null), at (main street spot) ---------- */
  /* ---------- a baked body (bases-bake, hero-bake: pos, tri, col a face, bone and w a corner) as one flat-faced mesh in the palette PAL {colour:[hex, shade jitter]} ---------- */
  const hash=i=>{ const h=Math.sin(i*127.1+311.7)*43758.5453; return h-Math.floor(h); };
  BODIES.baked=(D,key,label,at,PAL,more)=>{ const b=D.bodies[key], {off,binv}=BODIES.skeleton(b.origin,b.rest);
    const geo=()=>{ const P=b.pos, T=b.tri, nf=T.length/3, pos=new Float32Array(nf*9), nor=new Float32Array(nf*9), col=new Float32Array(nf*9), bi=new Float32Array(nf*6), bw=new Float32Array(nf*3);
      const C=D.colors.map(c=>new THREE.Color(PAL[c][0])), va=new V3(),vb=new V3(),vc=new V3(),n=new V3(),e=new V3();
      for(let f=0;f<nf;f++){ const ix=[T[f*3],T[f*3+1],T[f*3+2]]; va.fromArray(P,ix[0]*3); vb.fromArray(P,ix[1]*3); vc.fromArray(P,ix[2]*3); n.subVectors(vb,va).cross(e.subVectors(vc,va)).normalize();
        const ci=b.col[f], k=1+(hash(f)-.5)*2*PAL[D.colors[ci]][1];
        ix.forEach((v,j)=>{ const o=f*3+j; pos.set([P[v*3],P[v*3+1],P[v*3+2]],o*3); nor.set([n.x,n.y,n.z],o*3); col.set([C[ci].r*k,C[ci].g*k,C[ci].b*k],o*3); bi.set([b.bone[v*2],b.bone[v*2+1]],o*2); bw[o]=b.w[v]; }); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
      g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1)); g.computeBoundingSphere(); return g; };
    BODIES.add({key,label,geo,height:b.height,hipY:b.hipY,off,binv,at,...more}); };
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
  BODIES.fit=body=>{ body.S=WALKER_H/body.height; body.KL=body.hipY*body.S/R.STAND; body.tris=()=>(body.GEO||(body.GEO=body.geo())).attributes.position.count/3; return body; };   // (scaled so its height is the Walker's)
  BODIES.add=body=>{ BODIES.fit(body); BODIES.list.push(body); BODIES.by[body.key]=body;
    walker(body); };
}
export {BODIES};
