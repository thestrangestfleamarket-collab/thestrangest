// THE MERCHANT BODIES: MERCH, the kit each merchant's body is made with — a skeleton of the rig's 15 bones in metres, parts hung on them (each part a shape, a colour and a little jitter), baked once into one body for BODIES; idle poses and things held in the hands ride on top.
import {THREE} from './003-shx.js';
import {ARCH} from './003b-systems.js';
import {scene} from './004-main.js';
import {BODIES} from './111a-bodies.js';
const MERCH={list:[],SURF:{plain:0,knit:1,cloth:2,denim:3,leather:4,metal:5,skin:6,fur:7,wood:8,ivory:9,plastic:9,glass:10,tulle:11}};
{ const V3=THREE.Vector3, BONES=BODIES.BONES, PARENT=BODIES.PARENT;
  const hash3=(x,y,z)=>{ const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return h-Math.floor(h); };
  const jit=(g,a)=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i),kx=Math.round(x*997),ky=Math.round(y*997),kz=Math.round(z*997);
    p.setXYZ(i,x+(hash3(kx,ky,kz)-.5)*2*a,y+(hash3(ky+3,kz,kx)-.5)*2*a,z+(hash3(kz,kx+7,ky)-.5)*2*a); } return g; };
  // soft folds: each vertex pushed out along its distance from the part's axis by a few slow waves (cloth that hangs, not shards)
  const drape=(g,a=.01,k=1)=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i), r=Math.hypot(x,z)||1, an=Math.atan2(x,z), d=a*(Math.sin(an*5*k+y*9)*.6+Math.sin(an*9*k-y*17+1.3)*.4); p.setXYZ(i,x+x/r*d,y,z+z/r*d); } return g; };
  const K=MERCH.K={hash3,jit,drape,
    CYL:(rt,rb,h,s=8,open=false,ts=0,tl=Math.PI*2)=>new THREE.CylinderGeometry(rt,rb,h,s,1,open,ts,tl), ICO:(r,d=0)=>new THREE.IcosahedronGeometry(r,d), BOX:(w,h,d)=>new THREE.BoxGeometry(w,h,d),
    SPH:(r,w=10,h=7,p0=0,pl=Math.PI*2,t0=0,tl=Math.PI)=>new THREE.SphereGeometry(r,w,h,p0,pl,t0,tl), TOR:(r,t,rs=6,ts=12,arc=Math.PI*2)=>new THREE.TorusGeometry(r,t,rs,ts,arc), CONE:(r,h,s=8)=>new THREE.ConeGeometry(r,h,s),
    // a turned shape from [radius, height] pairs, squashed front-to-back by fz
    LATHE:(pts,s=10,fz=1)=>{ const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),s); if(fz!==1){ const p=g.attributes.position; for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)*fz); } return g; },
    grp:(p,at=[0,0,0],r)=>{ const g=new THREE.Group(); g.position.set(...at); if(r)g.rotation.set(...r); p.add(g); return g; },
    // a part: its colour is '#rrggbb' (with a little shade jitter), [hex, jitter], or 'vc' when the geometry carries its own colours; 'knit:#rrggbb' (or 'knit:vc') gives it a surface (MERCH.SURF)
    mk:(p,geo,c,at=[0,0,0],r=[0,0,0],s=[1,1,1])=>{ const m=new THREE.Mesh(geo); if(typeof c==='string'&&c.includes(':')){ const [a,b]=c.split(':'); m.userData.m=MERCH.SURF[a]||0; c=b; } else if(Array.isArray(c)&&typeof c[0]==='string'&&c[0].includes(':')){ const [a,b]=c[0].split(':'); m.userData.m=MERCH.SURF[a]||0; c=[b,c[1]]; } m.userData.c=c; m.position.set(...at); m.rotation.set(...r); if(typeof s==='number')m.scale.setScalar(s); else m.scale.set(...s); p.add(m); return m; },
    // colours a geometry per vertex from fn(x,y,z) -> [r,g,b] in 0..1 (patterns: knit, carving, stripes)
    paint:(g,fn)=>{ const p=g.attributes.position, c=new Float32Array(p.count*3), col=new THREE.Color();
      for(let i=0;i<p.count;i++){ col.set(fn(p.getX(i),p.getY(i),p.getZ(i))); c.set([col.r,col.g,col.b],i*3); }
      g.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); return g; }};

  // shared shape tools: colours, value noise, turned shapes made fine, bending points, strips laid along a curve
  { const PI=Math.PI;
  const hex=c=>'#'+c.getHexString(), C=h=>new THREE.Color(h), mix=(a,b,t)=>a.clone().lerp(b,Math.max(0,Math.min(1,t)));
  const vn=(x,y,z)=>{ const xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z), f=v=>v*v*(3-2*v), u=f(x-xi), v=f(y-yi), w=f(z-zi), h=(a,b,c)=>hash3(xi+a,yi+b,zi+c), l=(a,b,t)=>a+(b-a)*t;
    return l(l(l(h(0,0,0),h(1,0,0),u),l(h(0,1,0),h(1,1,0),u),v),l(l(h(0,0,1),h(1,0,1),u),l(h(0,1,1),h(1,1,1),u),v),w); };
  const fbm=(x,y,z)=>vn(x,y,z)*.55+vn(x*2.1+5.3,y*2.1,z*2.1)*.3+vn(x*4.3,y*4.3+9.1,z*4.3)*.15;
  // a turned shape from [radius, height] pairs made finer (n rows) so painted colours and folds have points to land on
  const dense=(pts,n)=>{ const L=[0]; for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])); const out=[];
    for(let k=0;k<=n;k++){ const s=k/n*L[L.length-1]; let i=1; while(i<L.length-1&&L[i]<s)i++; const t=(s-L[i-1])/((L[i]-L[i-1])||1); out.push(new THREE.Vector2(pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t)); } return out; };
  const lathe=(pts,n,seg,fz=1,p0=0,pl=PI*2)=>{ const g=new THREE.LatheGeometry(dense(pts,n),seg,p0,pl); if(fz!==1){ const p=g.attributes.position; for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)*fz); } return g; };
  const bend=(g,fn)=>{ const p=g.attributes.position, v=new V3(); for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); fn(v); p.setXYZ(i,v.x,v.y,v.z); } return g; };
  // a strip laid along a curve (cloth, a strap, a lock of hair): across it by its width, out from the body's axis by its lift; col(u,v) its colour
  const ribbon=(pts,w,nv,nu,col,o={})=>{ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))), P=[], Cc=[], I=[], c=new THREE.Color(), up=new V3(), out=new V3(), side=new V3();
    for(let j=0;j<=nv;j++){ const v=j/nv, p=cv.getPoint(v), t=cv.getTangent(v); out.set(p.x,0,p.z/(o.fz||1)).normalize(); if(o.out)out.set(...o.out(v)).normalize(); side.crossVectors(t,out).normalize(); const ww=w*(o.taper?1-o.taper*v:1);
      for(let i=0;i<=nu;i++){ const u=i/nu-.5, q=p.clone().addScaledVector(side,u*ww).addScaledVector(out,(o.lift||0)+(o.wave?o.wave(u,v):0)); P.push(q.x,q.y-(o.ragged?o.ragged(u,v):0),q.z); c.set(col(u,v)); Cc.push(c.r,c.g,c.b); } }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){ const a=j*(nu+1)+i, b=a+nu+1; I.push(a,b,a+1,a+1,b,b+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); g.setIndex(I); return g; };
    Object.assign(K,{hex,C,mix,vn,fbm,dense,lathe,bend,ribbon}); }

  /* ---------- a skeleton in metres (feet at 0, facing +z, its left at +x); every bone a group, its offset from its parent read back for BODIES ---------- */
  MERCH.skel=(o={})=>{ const q={hipY:1,waist:.06,neck:.5,shX:.2,shY:.4,upper:.28,fore:.26,hipX:.1,thigh:.43,shin:.43,...o}, root=new THREE.Group(), B={};
    const bone=(n,p,at)=>{ const g=K.grp(p,at); g.userData.bone=n; B[n]=g; return g; };
    const hips=bone('hips',root,[0,q.hipY,0]), torso=bone('torso',hips,[0,q.waist,0]); bone('head',torso,[0,q.neck,0]);
    for(const s of [1,-1]){ const n=s>0?'L':'R', up=bone('upperArm'+n,torso,[q.shX*s,q.shY,0]), fo=bone('forearm'+n,up,[0,-q.upper,0]); bone('hand'+n,fo,[0,-q.fore,0]);
      const th=bone('thigh'+n,hips,[q.hipX*s,-.03,0]), sh=bone('shin'+n,th,[0,-q.thigh,0]); bone('shoe'+n,sh,[0,-q.shin,0]); }
    return {root,B,q}; };
  const offOf=B=>{ const off={}; for(const n of BONES){ if(!PARENT[n])continue; const p=B[n].position; off[n]=[PARENT[n],p.x,p.y,p.z]; } return off; };

  /* ---------- baked: every part's faces flat, coloured, each held by its one bone ---------- */
  MERCH.bake=({root,B})=>{ root.updateMatrixWorld(true);
    const inv={}; for(const n of BONES)inv[n]=B[n].matrixWorld.clone().invert();
    const P=[],N=[],C=[],I=[],W=[],MT=[], va=new V3(),vb=new V3(),vc=new V3(),e1=new V3(),e2=new V3(),nn=new V3(),na=new V3(),col=new THREE.Color(), M=new THREE.Matrix4(), NM=new THREE.Matrix3();
    root.traverse(o=>{ if(!o.isMesh)return; let b=o; while(b&&!b.userData.bone)b=b.parent; if(!b)return; const bi=BONES.indexOf(b.userData.bone);
      M.multiplyMatrices(inv[b.userData.bone],o.matrixWorld); NM.getNormalMatrix(M); if(o.geometry.index)o.geometry.computeVertexNormals(); else if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry, p=g.attributes.position, gn=g.attributes.normal, gc=g.attributes.color, spec=o.userData.c, mt=o.userData.m||0;
      const hex=Array.isArray(spec)?spec[0]:spec, jt=Array.isArray(spec)?spec[1]:.03; if(hex&&hex!=='vc')col.set(hex);
      for(let f=0;f<p.count;f+=3){ va.fromBufferAttribute(p,f).applyMatrix4(M); vb.fromBufferAttribute(p,f+1).applyMatrix4(M); vc.fromBufferAttribute(p,f+2).applyMatrix4(M);
        nn.crossVectors(e1.subVectors(vb,va),e2.subVectors(vc,va)); if(nn.lengthSq()<1e-14)continue; nn.normalize();
        let r,gg,bb; if(gc&&spec==='vc'){ r=-1; } else { const k=1+(hash3(Math.round(va.x*40),Math.round(va.y*40),Math.round(va.z*40))-.5)*2*jt; r=col.r*k; gg=col.g*k; bb=col.b*k; }
        [va,vb,vc].forEach((v,q)=>{ P.push(v.x,v.y,v.z); if(gn){ na.fromBufferAttribute(gn,f+q).applyMatrix3(NM).normalize(); if(na.dot(nn)<-.2)na.negate(); N.push(na.x,na.y,na.z); } else N.push(nn.x,nn.y,nn.z); if(r<0)C.push(gc.getX(f+q),gc.getY(f+q),gc.getZ(f+q)); else C.push(r,gg,bb); I.push(bi,bi); W.push(1); MT.push(mt); }); } });
    // see-through surfaces (glass, tulle: 10 and up) go last, in a group of their own drawn see-through
    const nv=MT.length, ord=[...Array(nv/3).keys()].sort((a,b)=>(MT[a*3]>=10)-(MT[b*3]>=10)), re=(A,k)=>{ const o=new Array(A.length); ord.forEach((f,i)=>{ for(let j=0;j<3*k;j++)o[i*3*k+j]=A[f*3*k+j]; }); return o; };
    const P2=re(P,3),N2=re(N,3),C2=re(C,3),I2=re(I,2),W2=re(W,1),M2=re(MT,1);
    const cut=M2.findIndex(m=>m>=10);
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P2,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N2,3)); geo.setAttribute('mt',new THREE.Float32BufferAttribute(M2,1));
    if(cut>=0){ geo.addGroup(0,cut,0); geo.addGroup(cut,nv-cut,1); }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(C2,3)); geo.setAttribute('bi',new THREE.Float32BufferAttribute(I2,2)); geo.setAttribute('bw',new THREE.Float32BufferAttribute(W2,1)); geo.computeBoundingSphere(); return geo; };

  /* ---------- a merchant: def {key, label, height (m), model()->skel with parts, at, size (x/10 of a person, the owner's scale), idle(t,N)->rig pose, after(B,N,dt), lift(t)} ---------- */
  MERCH.add=def=>{ if(ARCH.has(def.key))return null; const S=def.model();   // an archived character gets no body
    const body={key:def.key,label:def.label,height:def.height,hipY:S.q.hipY,off:offOf(S.B),binv:null,at:def.at??0,geo:()=>MERCH.bake(S),
      size:(def.size||10)/10,smooth:true,idle:def.idle,after:def.after,lift:def.lift,hd:def.hd,root:def.inside?scene:null};
    BODIES.add(body); MERCH.list.push(body); return body; };
  // where a point on one of a body's bones (metres, in the bone's own frame) is in the world, as posed this frame: for things held or worn
  MERCH.at=(N,bone,p,out)=>out.set(p[0],p[1],p[2]).applyMatrix4(N.PM.value[BONES.indexOf(bone)]).applyMatrix4(N.g.matrixWorld);
  // a body held at its stall (STALL.build's S): on its spot, facing the street, never roaming (not on its sheet or stood out with ?npcat)
  MERCH.stand=(N,S)=>{ const q=new URLSearchParams(location.search); if(!N||!S||q.get('sheet')===N.key||q.get('npcat'))return false; S.N=N; N.free=()=>true;
    Object.assign(N.st,{x:S.home.x,z:S.home.z,to:null,next:null,hold:true,pin:true,hd:Math.atan2(S.face.x-S.home.x,S.face.z-S.home.z)}); return true; };
  // a rig pose from a few joint angles (degrees), over the plain stand
  let STAND=null; MERCH.pose=c=>RIG.apply(STAND||(STAND=RIG.apply(RIG.walkPose({ph:0,w:0,run:0},null),RIG.STANDK)),c);
}
window.MERCH=MERCH;
export {MERCH};
