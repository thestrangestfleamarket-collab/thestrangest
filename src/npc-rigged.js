// ---- THE RIGGED FIGURES WITHOUT CLIPS (owner, 17 Oct 2026, "start pulling in any new characters you see in the drive": six low-poly figures in his
// G folder, Mixamo-rigged, flat-coloured, no animations: Drizzle with her stick, Gekkou with his katana, Kasa in his cape, Kurenai, Samidale with his
// pipe, Shogun; tools/rigged-bake.py → data/<name>.json): each made by makeNPC on his own bones (the skeletons' reader), and moved by a mover
// that knows Mixamo's bone names: a pose is each part's turn in his own frame (x his right, y up, z his front), as the street's characters' poses
// are, turned into each bone's local turn through the rig's rest (so the same walk, idle, wave and jump fit every figure whatever its rest
// pose); the walk fades in as he goes. They walk the street with the others, wave back when you come near, hop now and then ----
{ const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer), u32=s=>new Uint32Array(b(s).buffer), D2R=Math.PI/180;
  const sn=(a,p=0)=>Math.sin(a+p), cs=(a,p=0)=>Math.cos(a+p), up=x=>Math.max(0,x), bell=(u,a,c)=>u<a?u/a:u>c?(1-u)/(1-c):1;
  // the poses, on the parts a figure has (a Mixamo rig's): hips, chest (Spine1), head, armL/R (the upper arm), foreL/R, thighL/R, shinL/R, footL/R
  // (his frame: x toward his left (Mixamo's left arm is at +x), y up; an arm's z turn positive is out for the left, in for the right)
  const POSES={
    idle:t=>({chest:[2*sn(t*1.5),0,0],head:[2*sn(t*1.5,1),8*sn(t*.37),0],hips:[0,0,2.5*sn(t*.41)],armL:[0,0,3*sn(t*.8)],armR:[0,0,-3*sn(t*.8,1)],root:0}),
    walk:(ph,run)=>{ const a=run?1.6:1, k=run?12:0; return {hips:[k,0,3*sn(ph)*a],chest:[k*.4,4*sn(ph)*a,0],head:[-k*.5,0,0],thighL:[32*sn(ph)*a,0,0],thighR:[-32*sn(ph)*a,0,0],shinL:[50*up(-sn(ph,-.5))*a,0,0],shinR:[50*up(sn(ph,-.5))*a,0,0],
      footL:[-8*sn(ph,.4),0,0],footR:[8*sn(ph,.4),0,0],armL:[-22*sn(ph)*a,0,0],armR:[22*sn(ph)*a,0,0],foreL:[-14*up(-sn(ph))*a,0,0],foreR:[-14*up(sn(ph))*a,0,0],root:.012*Math.abs(sn(ph))*a}; },
    wave:{T:1.8,pose:u=>({armR:[0,0,-140],foreR:[0,0,-(30-28*sn(u*22))],head:[0,-20,0]})},
    jump:{T:1.1,pose:u=>{ const c=u<.28?u/.28:u>.78?(1-u)/.22:0, air=u>.28&&u<.78?1:0; return {hips:[14*c,0,0],thighL:[-40*c-30*air,0,0],thighR:[-40*c-30*air,0,0],shinL:[70*c+50*air,0,0],shinR:[70*c+50*air,0,0],armL:[-30*air,0,10*c+30*air],armR:[-30*air,0,-10*c-30*air],root:-.1*c+.35*air*Math.sin(Math.PI*(u-.28)/.5)}; }}};
  const MAP={hips:'mixamorig_Hips',chest:'mixamorig_Spine1',head:'mixamorig_Head',armL:'mixamorig_LeftArm',foreL:['mixamorig_LeftForeArm','ForeArm_L'],armR:'mixamorig_RightArm',foreR:['mixamorig_RightForeArm','ForeArm_R'],
    thighL:'mixamorig_LeftUpLeg',shinL:'mixamorig_LeftLeg',footL:'mixamorig_LeftFoot',thighR:'mixamorig_RightUpLeg',shinR:'mixamorig_RightLeg',footR:'mixamorig_RightFoot'};
  const mix=(A,B,w)=>{ const O={}; for(const k in A)O[k]=A[k]; for(const k in B){ const a=A[k], b=B[k]; O[k]=k==='root'?(a||0)*(1-w)+b*w:a?[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w,a[2]+(b[2]-a[2])*w]:[b[0]*w,b[1]*w,b[2]*w]; } return O; };
  const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const NEAR={x0:BOUND.x0+3,x1:BOUND.x1-3,z0:zc-2.6,z1:zc-.5}, FAR={x0:BOUND.x0+3,x1:BOUND.x1-3,z0:zf+.5,z1:zf+1.8};
  function figure(D,o){ const S=D, M=S.chars[o.key], BN=S.rig.names, pts=q=>{ const P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pts(i16(M.p)),3)); geo.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); geo.setIndex(new THREE.BufferAttribute(M.i32?u32(M.i):u16(M.i),1));
    geo.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(b(M.r)),1)); geo.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1)); geo.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); geo.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true));
    const R=S.rig, bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); B.scale.fromArray(R.s[i]); return B; }); R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); });
    const ibm=f32(R.ibm), rig={bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))};
    // each bone's turn at rest, in the figure's frame (its parents' turns and its own), to carry a pose given in that frame into the bone's own
    const restL=bones.map(B=>B.quaternion.clone()), restW=[], parW=[]; bones.forEach((B,i)=>{ const p=R.parent[i], pw=p>=0?restW[p]:new THREE.Quaternion(); parW[i]=pw; restW[i]=pw.clone().multiply(restL[i]); });
    const BI={}; for(const k in MAP){ const i=[].concat(MAP[k]).map(n=>BN.indexOf(n)).find(i=>i>=0); if(i>=0)BI[k]=i; }   // (a few files rename a bone: the first name found)
    const E=new THREE.Euler(), DQ=new THREE.Quaternion(), Q=new THREE.Quaternion(), low=M.low||0;
    // his arms down: the files rest in a T-pose or an A-pose; each upper arm's rest direction (shoulder to elbow, in his frame) is measured and
    // turned to hang 12 degrees from straight down, a base under every pose
    const restP=[]; bones.forEach((B,i)=>{ const p=R.parent[i], v=B.position.clone(); if(p>=0){ v.applyQuaternion(restW[p]).add(restP[p]); } restP[i]=v; });
    const armBase=(a,f,sgn)=>{ if(BI[a]==null||BI[f]==null)return 0; const d=restP[BI[f]].clone().sub(restP[BI[a]]); return -Math.sign(d.x)*sgn*(Math.atan2(Math.abs(d.x),-d.y)/D2R-12); }, baseL=armBase('armL','foreL',1), baseR=armBase('armR','foreR',1);   // (Mixamo's left arm is on his +x side: a turn about z the way that brings that arm in)
    const setPose=P=>{ for(const k in BI){ const i=BI[k]; let r=P[k]; const bz=k==='armL'?baseL:k==='armR'?baseR:0; if(bz&&!r)r=[0,0,0]; if(!r){ bones[i].quaternion.copy(restL[i]); continue; }
        E.set(r[0]*D2R,r[1]*D2R,(r[2]+bz)*D2R,'XYZ'); DQ.setFromEuler(E); Q.copy(parW[i]).invert().multiply(DQ).multiply(parW[i]).multiply(restL[i]); bones[i].quaternion.copy(Q); } };
    let w=0, t=Math.random()*9, move=null, waved=0;
    const N=makeNPC(null,{key:o.key,name:o.name,names:M.parts,lv:'up',group:'bodega',geo,skin:rig,tall:M.tall,eye:M.eye,rank:M.parts.map(()=>0),metres:o.metres,x:o.x,z:o.z,lane:o.far?FAR:NEAR,ground:(x,z)=>G(x,z),radius:.4,speed:o.speed||.6,stride:7.5,rock:0,bob:0,
      anim:(dt,moving,st,s)=>{ t+=dt; w+=((moving?1:0)-w)*Math.min(1,dt*6); let P=mix(POSES.idle(t),POSES.walk(st.ph,st.run),w);
        if(move){ move.t+=dt; if(move.t>=move.T)move=null; else { const u=move.t/move.T, k=Math.min(1,u/.15,(1-u)/.15); P=mix(P,move.pose(u),Math.max(0,k)); } }
        setPose(P); N.body.position.y=((P.root||0)*M.tall-low)*s*(ZU*24/TILE); } });
    N.low=M.low; N.tall=M.tall; R.parent.forEach((p,i)=>{ if(p<0&&i>0)N.me.add(bones[i]); });   // (his props' bones hang on no joint: the stick, the veil, the katana; they ride the mesh as the hips do)
    N.act=name=>{ if(move)return; const m=POSES[name]; if(m)move={name,t:0,T:m.T,pose:m.pose}; };
    // his own ways: a wave back when you come near (and when you wave), a hop now and then while he stands
    const tick0=N.tick, YOU=st; N.tick=(dt,you)=>{ tick0(dt,you); const d=Math.hypot(you.x-N.st.x,you.z-N.st.z);
      if(d<3*TILE&&!N.st.to&&t-waved>6&&(YOU.move&&YOU.move.name==='wave'||Math.random()<dt*.25)){ waved=t; N.act('wave'); }
      if(!N.st.to&&!move&&Math.random()<dt*.04)N.act('jump'); };
    return N; }
  const F=[['drizzle','DRIZZLE',DRIZZLE,1.7,-9,false],['gekkou','GEKKOU',GEKKOU,1.75,-3,true],['kasa','KASA',KASA,1.8,3,false],['kurenai','KURENAI',KURENAI,1.65,9,true],['samidale','SAMIDALE',SAMIDALE,1.75,15,false],['shogun','SHOGUN',SHOGUN,1.9,21,true]];
  const RF=F.map(([key,name,D,m,dx,far])=>figure(D,{key,name,metres:m,x:xm+dx,z:far?(FAR.z0+FAR.z1)/2:(NEAR.z0+NEAR.z1)/2,far,speed:.55+Math.random()*.2}));
  window.RIGPROBE=()=>RF.map(N=>{ const me=N.me, v=new THREE.Vector3(), lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9], n=me.geometry.attributes.position.count; let ch=[], o=me; while(o){ ch.push(o.type+(o.visible?'':'(hidden)')); o=o.parent; }
      for(let i=0;i<n;i+=7){ v.fromBufferAttribute(me.geometry.attributes.position,i); me.applyBoneTransform(i,v); me.localToWorld(v); for(let k=0;k<3;k++){ lo[k]=Math.min(lo[k],v.getComponent(k)); hi[k]=Math.max(hi[k],v.getComponent(k)); } }
      const sc=me.skeleton.bones.map(b=>b.scale.x).filter(x=>Math.abs(x-1)>1e-3); const ws=new THREE.Vector3(); me.getWorldScale(ws);
      const mx=a=>{ let m=0; for(let i=0;i<a.length;i++)m=Math.max(m,Math.abs(a[i])); return m; }, P=me.geometry.attributes.position.array, W=me.geometry.attributes.skinWeight, hips=me.skeleton.bones.find(b=>b.name==='mixamorig_Hips'), hp=new THREE.Vector3(); hips.getWorldPosition(hp);
      let wmin=9,wmax=0; for(let i=0;i<W.count;i++){ const t=W.getX(i)+W.getY(i)+W.getZ(i)+W.getW(i); wmin=Math.min(wmin,t); wmax=Math.max(wmax,t); }
      const far=[]; me.skeleton.bones.forEach(b=>{ const v=new THREE.Vector3(); b.getWorldPosition(v); if(v.length()>1e3)far.push(b.name); });
      return {key:N.key,pmax:+mx(P).toFixed(2),ibmMax:+mx(me.skeleton.boneInverses.flatMap(m=>m.elements)).toFixed(1),bmMax:mx(me.skeleton.boneMatrices).toExponential(1),hips:[+hp.x.toFixed(2),+hp.y.toFixed(2),+hp.z.toFixed(2)],wsum:[+wmin.toFixed(2),+wmax.toFixed(2)],far:far.slice(0,5),nfar:far.length,chain:ch.join('<'),lo:lo.map(x=>+x.toFixed(2)),hi:hi.map(x=>+x.toFixed(2)),idx:me.geometry.index.count,scales:sc.slice(0,4),nsc:sc.length,wscale:[+ws.x.toFixed(3),+ws.y.toFixed(3)],bind:me.bindMode,mat:me.material.type,nrm:!!me.geometry.attributes.normal}; });
  window.RIGDBG=()=>RF.map(N=>{ const B=N.me.skeleton.bones, hb=B.find(b=>b.name==='mixamorig_Hips'), hd=B.find(b=>b.name==='mixamorig_Head'), ft=B.find(b=>b.name==='mixamorig_LeftFoot'), w=b=>b.getWorldPosition(new THREE.Vector3());
    const sk=N.me.skeleton, BM=sk.boneMatrices, g=N.me.geometry, P=g.attributes.position.array, SI=g.attributes.skinIndex.array, SW=g.attributes.skinWeight, n=P.length/3, lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9], m=new THREE.Matrix4(), v=new THREE.Vector3(), acc=new THREE.Vector3();
    for(let i=0;i<n;i+=Math.max(1,Math.floor(n/300))){ acc.set(0,0,0); for(let c=0;c<4;c++){ const w_=SW.getComponent(i,c); if(!w_)continue; m.fromArray(BM,SI[i*4+c]*16); v.set(P[i*3],P[i*3+1],P[i*3+2]).applyMatrix4(m).multiplyScalar(w_); acc.add(v); } for(let k=0;k<3;k++){ lo[k]=Math.min(lo[k],acc.getComponent(k)); hi[k]=Math.max(hi[k],acc.getComponent(k)); } }
    const up=w(hd).sub(w(hb)), dn=w(ft).sub(w(hb)); return {key:N.key,skinLo:lo.map(x=>+x.toFixed(2)),skinHi:hi.map(x=>+x.toFixed(2)),low:N.low,tall:N.tall,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),s:+N.body.scale.x.toFixed(4),H:+N.H.toFixed(2),hipsToHead:[+up.x.toFixed(2),+up.y.toFixed(2),+up.z.toFixed(2)],hipsToFoot:[+dn.x.toFixed(2),+dn.y.toFixed(2),+dn.z.toFixed(2)],hipsY:+w(hb).y.toFixed(2)}; }); }   // (a test's look)
