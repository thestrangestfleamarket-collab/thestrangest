const UAL=__DATA__("data/ual.json"), HUM=__DATA__("data/humanoid.json");
const AVS={kind:'ghost',KINDS:['ghost','mannequin'],NAME:{ghost:'GHOST',mannequin:'MANNEQUIN'},C:{}};
window.AVS=AVS;
{ const D=UAL.ual, RG=D.rig, BN=RG.names, PAR=RG.parent, BI=Object.fromEntries(BN.map((n,i)=>[n,i])), V=THREE.Vector3, Q=THREE.Quaternion;
  const b=s=>{ const t=atob(s), u=new Uint8Array(t.length); for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i); return u; }, f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer);
  const TT=C=>Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1));
  const clipsFor=kp=>{ const out={}; for(const [name,C] of Object.entries(D.clips)){ const t=TT(C), q=i16(C.q), tr=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=q[(k*BN.length+j)*4+c]/32000; tr.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',t,v)); });
      for(const [bn,p] of Object.entries(C.p))if(bn!=='root')tr.push(new THREE.VectorKeyframeTrack(bn+'.position',t,f32(p).map(x=>x*kp)));
      out[name]=new THREE.AnimationClip(name,C.dur,tr); } return out; };
  const rigOf=T=>{ const bones=BN.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(T[i]); B.quaternion.fromArray(RG.q[i]); return B; });
    PAR.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); return {bones,skeleton:new THREE.Skeleton(bones)}; };
  const geoOf=(P,C,SI,SW,I)=>{ const g=new THREE.BufferGeometry(), n=P.length/3; g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3,true));
    g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(n),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(SI,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(SW,4,true)); g.setIndex(new THREE.BufferAttribute(I,1)); return g; };
  const Anim=(mixer,CL)=>{ const A={}, W={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); const M={base:'Idle_Loop',ts:1};
    M.update=dt=>{ const tgt=CL[M.base]?M.base:'Idle_Loop'; act(tgt).timeScale=M.ts;
      for(const n of new Set([...Object.keys(W),tgt])){ const a=act(n); W[n]=W[n]??0; W[n]+=((n===tgt?1:0)-W[n])*Math.min(1,dt*10);
        if(W[n]>.01){ if(!a.isRunning()){ a.setLoop(THREE.LoopRepeat,Infinity); a.play(); } a.setEffectiveWeight(W[n]); } else{ a.stop(); delete W[n]; } }
      mixer.update(dt); };
    return M; };
  const relaxer=(bone,root,fw)=>{ const need=['spine_02','neck_01','spine_03','pelvis'].concat(...['l','r'].map(s=>['upperarm_','lowerarm_','hand_','thigh_','calf_','foot_'].map(k=>k+s))); if(need.some(n=>!bone(n)))return null;
    let rx=0; const DOWN=new V(0,-1,0), wq=new Q(), pq=new Q(), dq=new Q(), q0=new Q(), fq=new Q(), fpq=new Q(), A=new V(), B2=new V(), P1=new V(), P2=new V();
    const aim=(b_,c,dir)=>{ b_.getWorldPosition(A); c.getWorldPosition(B2); dq.setFromUnitVectors(B2.sub(A).normalize(),dir); b_.getWorldQuaternion(wq); b_.parent.getWorldQuaternion(pq); b_.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); b_.updateMatrixWorld(true); };
    const blend=(b_,c,dir,w)=>{ q0.copy(b_.quaternion); aim(b_,c,dir); if(w<1){ b_.quaternion.slerpQuaternions(q0,b_.quaternion.clone(),w); b_.updateMatrixWorld(true); } };
    const outOf=(a,c)=>{ bone(a).getWorldPosition(P1); bone(c).getWorldPosition(P2); P2.sub(P1); P2.y=0; return P2.normalize().clone(); };
    const footY=()=>{ bone('foot_l').getWorldPosition(P1); bone('foot_r').getWorldPosition(P2); return Math.min(P1.y,P2.y); };
    return (dt,on)=>{ rx+=((on?1:0)-rx)*Math.min(1,dt*6); if(rx<.01)return; root.updateMatrixWorld(true); const f=fw(), y0=footY();
      blend(bone('spine_02'),bone('neck_01'),new V(0,1,0).addScaledVector(f,.05).normalize(),rx*.7);
      for(const sd of ['l','r']){ const o=outOf('spine_03','upperarm_'+sd);
        blend(bone('upperarm_'+sd),bone('lowerarm_'+sd),DOWN.clone().addScaledVector(o,.14).addScaledVector(f,.02).normalize(),rx);
        blend(bone('lowerarm_'+sd),bone('hand_'+sd),DOWN.clone().addScaledVector(o,.06).addScaledVector(f,.16).normalize(),rx); }
      for(const sd of ['l','r']){ const ft=bone('foot_'+sd); ft.getWorldQuaternion(fq); const o=outOf('pelvis','thigh_'+sd);
        blend(bone('thigh_'+sd),bone('calf_'+sd),DOWN.clone().addScaledVector(o,.03).normalize(),rx);
        blend(bone('calf_'+sd),ft,DOWN.clone().addScaledVector(f,-.02).normalize(),rx);
        ft.parent.getWorldQuaternion(fpq); ft.quaternion.copy(fpq.invert().multiply(fq)); ft.updateMatrixWorld(true); }
      root.position.y+=y0-footY(); }; };
  const fwd=()=>new V(Math.sin(heading),0,Math.cos(heading));
  const npcOf=(geo,rig,tall,names)=>{ const N=makeNPC(null,{key:'me',name:'YOU',names,eye:-1,lv:'up',group:'bodega',geo,skin:rig,tall,rank:names.map(()=>0),metres:1.85*(W3.SZ||1),x:pos.x,z:pos.z,radius:.3,speed:0,stride:0,rock:0,bob:0});
    NPCS.splice(NPCS.indexOf(N),1); if(N.g.parent)N.g.parent.remove(N.g); scene.add(N.g); NPCS.extra.push({g:N.g}); return N; };
  const BUILD=AVS.BUILD={};
  BUILD.mannequin=()=>{ const rig=rigOf(RG.t), B=rig.bones, bone=x=>B[BI[x]], A=new V(), C=new V(), wq=new Q(), pq=new Q();
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
    const N=npcOf(geoOf(P,new Uint8Array(n*3).map((_,i)=>[206,196,182][i%3]),si,sw,I),rig,D.tall,['body']);
    const mx=new THREE.AnimationMixer(B[0]), CL=clipsFor(1); return {g:N.g,N,mx,CL,an:Anim(mx,CL),relax:relaxer(bone,N.g,fwd),tris:HUM.tris}; };
  const MOVE={jump:'Jump_Loop',backflip:'Jump_Loop',frontflip:'Jump_Loop',jab:'Punch_Jab',cross:'Punch_Cross',hook:'Punch_Cross',uppercut:'Punch_Cross',slap:'Punch_Jab',frontKick:'Punch_Cross',roundhouse:'Punch_Cross',
    legSweep:'Crouch_Idle_Loop',fall:'Death01',roll:'Roll',block:'Spell_Simple_Idle_Loop',guard:'Spell_Simple_Idle_Loop',crouch:'Crouch_Idle_Loop',flinch:'Hit_Chest',wave:'Interact',dance:'Dance_Loop'};
  const MPS=TILE/.84; let lx=null, lz=null, sp=0;
  AVS.set=k=>{ if(!AVS.KINDS.includes(k))k='ghost'; for(const n in AVS.C)if(n!==k&&AVS.C[n].off)AVS.C[n].off(); AVS.kind=k; if(!AVS.C[k]&&BUILD[k])AVS.C[k]=BUILD[k](); try{ SAVE.set('avatar',k); }catch(e){} if(AVS.draw)AVS.draw(); };
  const pick=()=>{ const mv=st.move&&st.move.name; let base='Idle_Loop', ts=1;
    if(st.water&&st.water.in)base=sp>.3?'Swim_Fwd_Loop':'Swim_Idle_Loop';
    else if(st.sit)base='Sitting_Idle_Loop';
    else if(mv)base=MOVE[mv]||null;
    else if(st.up&&MOVE[st.up.name])base=MOVE[st.up.name];
    else if(sp>.25){ const sk=(st.wk||1)+((st.rk||1)-(st.wk||1))*(st.run||0), sn=sp/sk;
      if(sn>3.6){ base='Sprint_Loop'; ts=sp/5; } else if(sn>2){ base='Jog_Fwd_Loop'; ts=sp/3.2; } else { base='Walk_Loop'; ts=sp/1.4; } }
    return [base,Math.max(.2,Math.min(4,ts*(st.anim||1)))]; };
  const jumpY=B=>{ const mv=st.move&&st.move.name; return mv&&/jump|flip/.test(mv)&&B&&B.J&&B.J.pelvis?Math.max(0,B.J.pelvis.y-18):0; };
  AVS.tick=(dt,B)=>{ const k=AVS.kind, C=AVS.C[k], first=typeof UI!=='undefined'&&UI.view==='first', mine=!!C;
    for(const n in AVS.C){ const c=AVS.C[n]; if(c.g)c.g.visible=mine&&n===k&&!first&&!W3.hideMeQ; } if(!W3.hideMeQ)W3.hideMe=true;
    if(!dt)return;
    if(FEEL.take()){ FEEL.anim(dt,C); return; } if(FEEL.A.C)FEEL.release();
    if(lx===null){ lx=pos.x; lz=pos.z; } const d=Math.hypot(pos.x-lx,pos.z-lz)/MPS/dt; lx=pos.x; lz=pos.z; sp+=(Math.min(d,9)-sp)*Math.min(1,dt*8);
    const [base,ts]=pick();
    if(!mine)return; if(C.tick)return C.tick(dt,B);
    C.g.position.set(pos.x,py+jumpY(B)*ZU*(W3.SZ||1)*(W3.BH||1),pos.z); C.g.rotation.set(0,RAG.on?RAG.hd:heading,0);
    const b0=RAG.on?'Death01':base||'Idle_Loop'; C.an.base=b0; C.an.ts=ts; C.an.update(dt*(b0==='Idle_Loop'?st.anim||1:1));
    if(C.relax)C.relax(dt,b0==='Idle_Loop'&&!RAG.on); };
  AVS.draw=()=>document.querySelectorAll('[data-av]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.av===AVS.kind)));
  AVS.into=row=>{ if(!row.children.length){ row.innerHTML=AVS.KINDS.map(k=>`<button data-av="${k}">${AVS.NAME[k]}</button>`).join('');
      row.onclick=e=>{ const x=e.target.closest('[data-av]'); if(x){ e.stopPropagation(); AVS.set(x.dataset.av); } }; } AVS.draw(); };
  window.AVSDBG=()=>{ const C=AVS.C[AVS.kind]; return {kind:AVS.kind,ready:!!C,base:C&&C.an&&C.an.base,tris:C&&C.tris?Math.round(C.tris):0,sp:+sp.toFixed(2),vis:!!C&&!!C.g&&C.g.visible,ghost:C&&C.state?C.state():undefined}; };
  let k0=QS.get('avatar'); if(!k0)try{ k0=SAVE.get('avatar'); }catch(e){} AVS.set(AVS.KINDS.includes(k0)?k0:'ghost'); }
