AVS.BUILD.ghost=()=>{ const R=RIG, D=R.D, g=new THREE.Group(); scene.add(g); NPCS.extra.push({g}); const SF=sheetFig(g), a={t:0}, ar={t:0};
  const ARM=/^(jab|cross|hook|uppercut|slap|block|guard|wave|grab|grabL|carry)$/, BODY=/kick|round|sweep|climb|mantle|wallHit|wallRun|dive/;
  const J0=musBody().J, KJ=['head','chest','spine','pelvis'].concat(...['L','R'].map(n=>['shoulder','knee','ankle','wrist','k20'].map(k=>k+n)));
  const lerp=(p,q,w)=>({x:p.x+(q.x-p.x)*w,y:p.y+(q.y-p.y)*w,z:p.z+(q.z-p.z)*w}), lerpA=(f,h,w)=>({x:R.nrm(lerp(f.x,h.x,w)),y:R.nrm(lerp(f.y,h.y,w)),z:R.nrm(lerp(f.z,h.z,w))});
  const lerpF=(f,h,w)=>Object.assign(lerpA(f,h,w),{o:lerp(f.o,h.o,w)}), sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
  const BK=(()=>{ const y=R.nrm(R.V(.5,.866,0)), z0=R.V(0,0,-1), z=R.nrm(R.sub(z0,R.mul(y,R.dot(z0,y)))); return {o:R.V(-1.5,20.5,-9.4),x:R.cross(y,z),y,z}; })();
  const v3=v=>new THREE.Vector3(v.x,v.y,v.z), M4=new THREE.Matrix4(), QB=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(v3(BK.x),v3(BK.y),v3(BK.z))), QF=new THREE.Quaternion(), QG=new THREE.Quaternion(), V1=new THREE.Vector3(), V2=new THREE.Vector3(), V3=new THREE.Vector3();
  const S={w:0,jh:0,lift:5,lv:0,lean:0,bank:0,sp:0,gs:0,gv:0,play:false,song:0,t:0,lx:null,lz:null,tk:false}, GF={};
  const float=dt=>{ const P=R.walkPose({ph:0,w:0},null), k=Math.min(1,S.sp/4), sw=S.gs>.02&&S.gs<.98?Math.sin(Math.PI*S.gs):0;
    for(const n of 'LR'){ P[n].ua=[(34-40*k)*D,16*D]; P[n].fa=[(52-34*k)*D,0]; } P.nod=(4-6*k)*D; if(sw)P.R.ua=[(22+50*sw)*D,(12+18*sw)*D];
    npcSpring(ar,P,dt,NPCARMS); ar.P=P; return R.settle(R.build(P,null),0); };
  const NS=22, sa=new THREE.BufferAttribute(new Float32Array(NS*6),3), sgeo=new THREE.BufferGeometry(), six=[];
  for(let i=0;i<NS-1;i++)six.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2); sgeo.setAttribute('position',sa); sgeo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(NS*6),3));
  sgeo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(NS*6).map((_,i)=>[.2,.13,.09][i%3]),3)); sgeo.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(NS*2).fill(SF.PCS.length),1)); sgeo.setIndex(six);
  const strap=new THREE.Mesh(sgeo,SF.FM.me.material); strap.customDepthMaterial=SF.FM.me.customDepthMaterial; strap.customDistanceMaterial=SF.FM.me.customDistanceMaterial; strap.castShadow=true; strap.frustumCulled=false; g.add(strap);
  const at=(F,x,y,z)=>R.add(F.o,R.add(R.add(R.mul(F.x,x),R.mul(F.y,y)),R.mul(F.z,z))), wrap=v=>Math.atan2(Math.sin(v),Math.cos(v));
  const sling=(F,J)=>{ const T=at(F,0,-4.9,-1.45), H=at(F,0,9.4,-1.9), c=J.chest, sd=T.x-c.x>0?'R':'L', Sh=J['shoulder'+sd], top=R.add(Sh,{x:0,y:5,z:0}), A=sa.array, pts=[];
    const ang=p=>Math.atan2(p.x-c.x,p.z-c.z), rad=p=>Math.hypot(p.x-c.x,p.z-c.z), pt=(f,y,r)=>{ const CP=SF.P; for(let k=0;k<CP.length;k+=3)if(Math.abs(CP[k+1]-y)<2.5){ const dx=CP[k]-c.x, dz=CP[k+2]-c.z; if(Math.abs(wrap(Math.atan2(dx,dz)-f))<.3)r=Math.max(r,Math.hypot(dx,dz)+.7); } return {x:c.x+Math.sin(f)*r,y,z:c.z+Math.cos(f)*r}; };
    const fT=ang(T), fS=ang(top), fH=ang(H), bS=wrap(fS-Math.PI), bH=wrap(fH-Math.PI), N1=13;
    for(let i=0;i<N1;i++){ const u=i/(N1-1), e=u*u*(3-2*u); pts.push(pt(fT+(fS-fT)*u,T.y+(top.y-T.y)*e,Math.max(7.2,rad(T)*(1-u)+rad(top)*u))); }
    for(let i=1;i<NS-N1+1;i++){ const u=i/(NS-N1), e=u*u*(3-2*u); pts.push(pt(Math.PI+bS+(bH-bS)*u,top.y+(H.y-top.y)*e,Math.max(6.6,rad(top)*(1-u)+rad(H)*u))); }
    for(let i=0;i<NS;i++){ const p=pts[i], q=pts[Math.min(NS-1,i+1)], o=pts[Math.max(0,i-1)], t=R.nrm(R.sub(q,o)), n=R.nrm({x:p.x-c.x,y:0,z:p.z-c.z}), b=R.mul(R.nrm(R.cross(t,n)),.75);
      A.set([p.x+b.x,p.y+b.y,p.z+b.z,p.x-b.x,p.y-b.y,p.z-b.z],i*6); }
    sa.needsUpdate=true; sgeo.computeVertexNormals(); };
  const C={g,tris:SF.tris+six.length/3};
  const put=()=>{ S.play=false; MUS.lent=null; MUS.hush(); };
  const take=()=>{ MUS.rest(); S.play=true; MUS.lent=put; S.song=gtNext(S.song); gtSet(S.song); a.sp=null; a.P=null; };
  C.off=()=>{ if(S.play)put(); }; C.guitar=()=>S.play?put():take();
  C.state=()=>({lift:+S.lift.toFixed(2),w:+S.w.toFixed(2),gs:+S.gs.toFixed(2),play:S.play,sp:+S.sp.toFixed(2),lean:+S.lean.toFixed(3),cloth:SF.stat()});
  C.tick=(dt,B)=>{ S.t+=dt; if(S.lx===null){ S.lx=pos.x; S.lz=pos.z; } const d=Math.hypot(pos.x-S.lx,pos.z-S.lz)/(TILE/.84)/Math.max(dt,1e-3); S.lx=pos.x; S.lz=pos.z; S.sp+=(Math.min(d,9)-S.sp)*Math.min(1,dt*6);
    const tk=keys.has('t'); if(tk&&!S.tk&&!RAG.on)C.guitar(); S.tk=tk;
    const mv=st.move&&st.move.name, wet=!!(st.water&&st.water.in), held=st.up&&st.up.name, still=RAG.on||st.sit||st.ride||st.climb||st.hang||window.BOAT&&BOAT.on;
    if(S.play&&(st.target>0||mv||wet||still))put();
    const useB=!!B&&(RAG.on||still||(mv&&(ARM.test(mv)||BODY.test(mv)))||(!mv&&held&&ARM.test(held)));
    S.w+=((useB?1:0)-S.w)*Math.min(1,dt*(useB?14:6)); if(S.w<.002)S.w=0; if(S.w>.998)S.w=1;
    const gk=20, gc=2*Math.sqrt(gk)*.5; S.gv+=(gk*((S.play?1:0)-S.gs)-gc*S.gv)*dt; S.gs+=S.gv*dt; if(!S.play&&S.gs<.001&&Math.abs(S.gv)<.001){ S.gs=0; S.gv=0; }
    const Bg=float(dt); let Bp=null, wp=0;
    if(S.play&&S.gs>.45){ Bp=gtBody(a,dt); wp=sm((S.gs-.45)/.5); if(GTS.t>GTEND+1.5){ S.song=gtNext(S.song); gtSet(S.song); } MUS.tones(GTS.t,0,pos.x,pos.z); }
    const ws=B?S.w:0, fr=n=>{ let F=R.frameOf(n,Bg); if(wp)F=lerpF(F,R.frameOf(n,Bp),wp); if(ws)F=lerpF(F,R.frameOf(n,B),ws); return F; };
    const J={}; for(const k of KJ){ let p=Bg.J[k]; if(wp&&Bp.J[k])p=lerp(p,Bp.J[k],wp); if(ws&&B.J[k])p=lerp(p,B.J[k],ws); J[k]=p; }
    let Rh=Bg.m.Rh; if(wp)Rh=lerpA(Rh,Bp.m.Rh,wp); if(ws&&B.m&&B.m.Rh)Rh=lerpA(Rh,B.m.Rh,ws);
    const e=S.gs, b=Math.sin(Math.PI*Math.max(0,Math.min(1,e))); QF.setFromRotationMatrix(M4.makeBasis(v3(GTF.x),v3(GTF.y),v3(GTF.z))); QG.slerpQuaternions(QB,QF,e); M4.makeRotationFromQuaternion(QG).extractBasis(V1,V2,V3);
    GF.x={x:V1.x,y:V1.y,z:V1.z}; GF.y={x:V2.x,y:V2.y,z:V2.z}; GF.z={x:V3.x,y:V3.y,z:V3.z}; const tb=Math.atan2(BK.o.x,BK.o.z), tf=Math.atan2(GTF.o.x,GTF.o.z), ta=tb+(tf-tb)*e, rd=Math.hypot(BK.o.x,BK.o.z)*(1-e)+Math.hypot(GTF.o.x,GTF.o.z)*e+b*3;
    GF.o={x:Math.sin(ta)*rd,y:BK.o.y+(GTF.o.y-BK.o.y)*e+b*4,z:Math.cos(ta)*rd};
    const jy=mv&&/jump|flip/.test(mv)&&B&&B.J.pelvis?Math.max(0,B.J.pelvis.y-18):0, bob=.9*Math.sin(S.t*1.4); S.jh=Math.max(jy*.9,S.jh*Math.exp(-dt*2.2));
    const tl=wet&&B&&B.J.chest?B.J.chest.y-J0.pelvis.y+8+bob:still?0:5+bob+S.jh, lk=40, lc=2*Math.sqrt(lk)*.8; S.lv+=(lk*(tl-S.lift)-lc*S.lv)*dt; S.lift+=S.lv*dt;
    S.lean+=((still?0:Math.min(.2,S.sp*.045))-S.lean)*Math.min(1,dt*3); S.bank+=(Math.max(-.2,Math.min(.2,-(st.yr||0)*.04))-S.bank)*Math.min(1,dt*3);
    musScale(g); g.position.set(pos.x,py+S.lift*g.scale.y,pos.z); g.rotation.set(S.lean*(1-S.w),RAG.on?RAG.hd:heading,S.bank*(1-S.w),'YXZ');
    SF.pose(dt,{J,m:{Rh}},GF,fr,(groundY(pos.x,pos.z)-g.position.y)/g.scale.y); sling(GF,J); };
  return C; };
if(AVS.kind==='ghost')AVS.set('ghost');
