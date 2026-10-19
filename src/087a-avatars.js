const HUM=__DATA__("data/humanoid.json");
const AVS={C:{}};
window.AVS=AVS;
{ const RG=HUM.rig, BN=RG.names, PAR=RG.parent, BI=Object.fromEntries(BN.map((n,i)=>[n,i])), V=THREE.Vector3, Q=THREE.Quaternion;
  const b=s=>{ const t=atob(s), u=new Uint8Array(t.length); for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i); return u; }, f32=s=>new Float32Array(b(s).buffer);
  const rigOf=T=>{ const bones=BN.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(T[i]); B.quaternion.fromArray(RG.q[i]); return B; });
    PAR.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); return {bones,skeleton:new THREE.Skeleton(bones)}; };
  const geoOf=(P,C,SI,SW,I)=>{ const g=new THREE.BufferGeometry(), n=P.length/3; g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3,true));
    g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(n),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(SI,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(SW,4,true)); g.setIndex(new THREE.BufferAttribute(I,1)); return g; };
  const npcOf=(geo,rig,tall,names)=>{ const N=makeNPC(null,{key:'me',name:'YOU',names,eye:-1,lv:'up',group:'bodega',geo,skin:rig,tall,rank:names.map(()=>0),metres:1.85*(W3.SZ||1),x:pos.x,z:pos.z,radius:.3,speed:0,stride:0,rock:0,bob:0});
    NPCS.splice(NPCS.indexOf(N),1); if(N.g.parent)N.g.parent.remove(N.g); scene.add(N.g); NPCS.extra.push({g:N.g}); return N; };
  const body=()=>{ const rig=rigOf(RG.t), B=rig.bones, bone=x=>B[BI[x]], A=new V(), C=new V(), wq=new Q(), pq=new Q();
    B[0].updateMatrixWorld(true);
    for(const [sd,x] of [['l',1],['r',-1]]){ const u=bone('upperarm_'+sd); u.getWorldPosition(A); bone('hand_'+sd).getWorldPosition(C);
      const dq=new Q().setFromUnitVectors(C.sub(A).normalize(),new V(.63*x,-.41,0).normalize()); u.getWorldQuaternion(wq); u.parent.getWorldQuaternion(pq); u.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); B[0].updateMatrixWorld(true); }
    rig.skeleton.calculateInverses();
    const J=B.map(b=>b.getWorldPosition(new V())), up=J[BI.Head].clone().add(new V(0,.25,0)), SEG=[];
    const sg=(a,c,n=a)=>SEG.push([BI[n],J[BI[a]],typeof c==='string'?J[BI[c]]:c]);
    sg('pelvis','spine_01'); sg('spine_01','spine_02'); sg('spine_02','spine_03'); sg('spine_03','neck_01'); sg('neck_01','Head'); sg('Head',up);
    for(const s of ['l','r']){ sg('pelvis','thigh_'+s); sg('clavicle_'+s,'upperarm_'+s); sg('upperarm_'+s,'lowerarm_'+s); sg('lowerarm_'+s,'hand_'+s); sg('hand_'+s,'middle_04_leaf_'+s);
      sg('thigh_'+s,'calf_'+s); sg('calf_'+s,'foot_'+s); sg('foot_'+s,'ball_'+s); sg('ball_'+s,'ball_leaf_'+s); }
    const P=f32(HUM.p), I=new Uint16Array(b(HUM.i).buffer), n=P.length/3, si=new Uint8Array(n*4), sw=new Uint8Array(n*4), Pv=new V(), G=new V(), E=new V();
    for(let i=0;i<n;i++){ Pv.fromArray(P,i*3); const d=SEG.map(([k,a,c])=>{ G.subVectors(c,a); const t=Math.max(0,Math.min(1,E.subVectors(Pv,a).dot(G)/G.lengthSq())); return [k,Pv.distanceTo(E.copy(a).addScaledVector(G,t))]; }).sort((x,y)=>x[1]-y[1]);
      const [k0,d0]=d[0], [k1,d1]=d.find(x=>x[0]!==k0), w0=1/Math.pow(d0+.01,4), w1=d1<d0*1.6?1/Math.pow(d1+.01,4):0, w=Math.round(255*w0/(w0+w1));
      si[i*4]=k0; sw[i*4]=w; si[i*4+1]=k1; sw[i*4+1]=255-w; }
    const N=npcOf(geoOf(P,new Uint8Array(n*3).map((_,i)=>[206,196,182][i%3]),si,sw,I),rig,HUM.tall,['body']);
    const nb=B.length, q0=B.map(x=>x.quaternion.clone()), MQ=B.map(()=>new Q()), MP=B.map(()=>new V());
    const fk=i=>{ const p=PAR[i]; if(p<0){ MQ[i].copy(B[i].quaternion); MP[i].copy(B[i].position); } else{ MQ[i].copy(MQ[p]).multiply(B[i].quaternion); MP[i].copy(B[i].position).applyQuaternion(MQ[p]).add(MP[p]); } };
    for(let i=0;i<nb;i++)fk(i);
    const W0=MQ.map(q=>q.clone()), P0=MP.map(p=>p.clone()), tq=new Q(), iq=new Q();
    const setQ=(i,q)=>{ B[i].quaternion.copy(tq.copy(MQ[PAR[i]]).invert().multiply(q)); fk(i); };
    const SIDE=s=>s==='l'?'L':'R', DRV={pelvis:['hips','pelvis','spine','spine_01'],spine_03:['torso','spine','neck','neck_01'],neck_01:['neck','neck','headBase','Head'],Head:['head','headBase','headTop',null]};
    for(const s of ['l','r']){ const S=SIDE(s); Object.assign(DRV,{['upperarm_'+s]:['upperArm'+S,'shoulder'+S,'elbow'+S,'lowerarm_'+s],['lowerarm_'+s]:['forearm'+S,'elbow'+S,'wrist'+S,'hand_'+s],['hand_'+s]:['hand'+S,'wrist'+S,'fingers'+S,'middle_01_'+s],
      ['thigh_'+s]:['thigh'+S,'hip'+S,'knee'+S,'calf_'+s],['calf_'+s]:['shin'+S,'knee'+S,'ankle'+S,'foot_'+s],['foot_'+s]:['shoe'+S,'ankle'+S,'ball'+S,'ball_'+s]}); }
    const AX={}; for(const [bn,d] of Object.entries(DRV)){ const i=BI[bn], dir=d[3]?P0[BI[d[3]]].clone().sub(P0[i]):new V(0,1,0); AX[bn]=dir.normalize().applyQuaternion(W0[i].clone().invert()); }
    const K=new V(1,1,1), m=(J,o=new V())=>o.set(J.x*K.x,J.y*K.y,J.z*K.z), mb=new THREE.Matrix4(), SW=new V(), X=new V(), Y=new V(), Z=new V();
    const basis=(J,F,d,o=new Q())=>{ m(J[d[2]],Y).sub(m(J[d[1]],Z)).normalize(); X.set(F.x.x*K.x,F.x.y*K.y,F.x.z*K.z); X.addScaledVector(Y,-X.dot(Y)).normalize(); Z.crossVectors(X,Y); return o.setFromRotationMatrix(mb.makeBasis(X,Y,Z)); };
    let R0=null, WC=null, J0=null; const swing=(q,i,bn,dir)=>tq.setFromUnitVectors(SW.copy(AX[bn]).applyQuaternion(q).normalize(),dir).multiply(q);
    const calib=()=>{ const RB=RIG.restOf().B; J0=RB.J; PZ.set(0,0,m(J0.ballL,PZ).z-P0[BI.ball_l].z); R0={}; WC={}; for(const [bn,d] of Object.entries(DRV)){ R0[bn]=basis(J0,RIG.frameOf(d[0],RB),d); WC[bn]=bn.startsWith('foot_')?W0[BI[bn]].clone():swing(W0[BI[bn]],BI[bn],bn,m(J0[d[2]],new V()).sub(m(J0[d[1]],Y)).normalize()).clone(); } };
    const PZ=new V(), FT={l:new V(),r:new V()}, LEG=B[BI.calf_l].position.length()+B[BI.foot_l].position.length(), RLEG=RIG.THIGH+RIG.SHIN, At=new V(), Hh=new V(), Kn=new V(), U=new V(), PL=new V(), DQ={}, cur=new Q(), sl=new Q();
    const drive=PB=>{ const J=PB.J, body=N.me.parent; K.set(W3.group.scale.x/body.scale.x,W3.group.scale.y/body.scale.y,W3.group.scale.z/body.scale.z); if(!R0)calib();
      for(const [bn,d] of Object.entries(DRV)){ const F=RIG.frameOf(d[0],PB); if(F)DQ[bn]=basis(J,F,d,DQ[bn]||new Q()).multiply(iq.copy(R0[bn]).invert()); }
      for(const s of ['l','r']){ const S=SIDE(s), bi=BI['ball_'+s], fi=BI['foot_'+s]; m(J['ball'+S],FT[s]); FT[s].y+=P0[bi].y-m(J0['ball'+S],X).y; FT[s].sub(X.copy(B[bi].position).applyQuaternion(sl.copy(DQ['foot_'+s]).multiply(WC['foot_'+s]))); }
      for(let i=0;i<nb;i++){ const bn=BN[i];
        if(bn==='pelvis'){ m(J.pelvis,At).sub(m(J0.pelvis,U)); B[i].position.copy(P0[i]).add(At).add(PZ);
          let lo=1e9, ex=1e9; for(const s of ['l','r']){ const S=SIDE(s), ti=BI['thigh_'+s], L=LEG*.995, a=J['ankle'+S], h=J['hip'+S], rd=Math.hypot(a.x-h.x,a.z-h.z), RL=RLEG*.995;
            ex=Math.min(ex,a.y+Math.sqrt(Math.max(0,RL*RL-rd*rd))-h.y); Hh.copy(P0[ti]).sub(P0[i]).applyQuaternion(DQ.pelvis); const f=FT[s], dx=f.x-(B[i].position.x+Hh.x), dz=f.z-(B[i].position.z+Hh.z);
            lo=Math.min(lo,f.y+Math.sqrt(Math.max(0,L*L-dx*dx-dz*dz))-Hh.y); }
          const up=J.spine.y-J.pelvis.y, lift=Math.min(J.ankleL.y-J0.ankleL.y,J.ankleR.y-J0.ankleR.y), w=Math.max(0,Math.min(1,1.5-lift/3))*Math.max(0,Math.min(1,(up/(J0.spine.y-J0.pelvis.y)-.6)/.3)), dy=J.pelvis.y-J0.pelvis.y;
          B[i].position.y=(1-w)*(dy<0?P0[i].y*J.pelvis.y/J0.pelvis.y:P0[i].y+dy*K.y)+w*(Math.min(lo,P0[i].y+Math.max(0,dy)*K.y)-Math.max(0,ex-1.1)*LEG/RLEG); B[i].position.applyQuaternion(cur.copy(MQ[PAR[i]]).invert()); }
        if(bn==='spine_01'||bn==='spine_02'){ setQ(i,sl.slerpQuaternions(DQ.pelvis,DQ.spine_03,bn==='spine_01'?1/3:2/3).multiply(W0[i])); continue; }
        if(!DRV[bn]||!DQ[bn]){ B[i].quaternion.copy(q0[i]); fk(i); continue; }
        cur.copy(DQ[bn]).multiply(WC[bn]);
        if(bn.startsWith('lowerarm_')){ const u=BN[PAR[i]]; cur.slerp(sl.copy(MQ[PAR[i]]).multiply(iq.copy(WC[u]).invert()).multiply(WC[bn]),.3); }
        if(bn.startsWith('thigh_')){ const s=bn.slice(-1), S=SIDE(s), l1=B[BI['calf_'+s]].position.length(), l2=B[BI['foot_'+s]].position.length();
          B[i].quaternion.copy(q0[i]); fk(i); Hh.copy(MP[i]); At.copy(FT[s]); U.subVectors(At,Hh); const dd=Math.min(Math.max(U.length(),.05),l1+l2-1e-3); U.normalize(); At.copy(Hh).addScaledVector(U,dd);
          m(J['knee'+S],PL).sub(m(J['hip'+S],X).add(m(J['ankle'+S],Y)).multiplyScalar(.5)); PL.addScaledVector(U,-PL.dot(U)); if(PL.lengthSq()<1e-8)PL.set(0,0,1).addScaledVector(U,-U.z); PL.normalize();
          const ca=Math.max(-1,Math.min(1,(l1*l1+dd*dd-l2*l2)/(2*l1*dd))); Kn.copy(Hh).addScaledVector(U,ca*l1).addScaledVector(PL,Math.sqrt(1-ca*ca)*l1);
          setQ(i,swing(cur,i,bn,X.subVectors(Kn,Hh).normalize()).clone()); DQ['_k'+s]=Kn.clone(); DQ['_a'+s]=At.clone(); continue; }
        if(bn.startsWith('calf_')){ const s=bn.slice(-1); fk(i); setQ(i,swing(cur,i,bn,X.subVectors(DQ['_a'+s],MP[i]).normalize()).clone()); continue; }
        setQ(i,cur); } };
    return {g:N.g,N,drive,tris:HUM.tris}; };
  AVS.tick=(dt,PB)=>{ const C=AVS.C.me||(AVS.C.me=body()), first=typeof UI!=='undefined'&&UI.view==='first';
    C.g.visible=!first&&!W3.hideMeQ; if(!W3.hideMeQ)W3.hideMe=true;
    C.g.position.set(pos.x,py,pos.z); C.g.rotation.set(0,RAG.on?RAG.hd:heading,0);
    if(PB&&PB.J&&C.g.visible&&PB!==C.last){ C.last=PB; C.drive(PB); } };
  window.AVSDBG=()=>{ const C=AVS.C.me; return {ready:!!C,tris:C?C.tris:0,vis:!!C&&C.g.visible}; }; }
