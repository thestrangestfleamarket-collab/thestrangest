// THE PAWNS: the baked characters (data/pawns.json) given arms, cloth colours and animation.
import {SHARED, THREE} from './003-shx.js';
import {BY, F32, SKIN} from './003a-skin.js';
import {PAWNL, pos, UI} from './003b-systems.js';
import {PPU} from './004-main.js';
import {MODS, QS, SOL, SYS, TILE} from './006-map-pre.js';
import {DUN, makeNPC, stfree, STLANE} from './076-npc-map.js';
import {PAWNS} from './087-npc-creatures.js';
{ const geomOf=M=>SKIN.geom(M), rigOf=R=>SKIN.rig(R);
  let PW=null, CLIPS=null, ALL=null, MK=null;   // filled by build() once the pawns data (data/pawns.json, lazy) has loaded, just after the start
  const HOLD=QS.get('pawnclip'), WALKC=QS.get('pawnwalk')||'UAL_Walk_Loop', IDLEC=QS.get('pawnidle')||'UAL_Idle_Loop', WALK=1.6, RUNU=5.5, STILLC=new Set(['UAL_Idle_Loop','idle_a','idle_b','sit_floor_idle_a']);
   window.PAWNL=PAWNL;
  const UNIFORM={};
  const dressed=(g,t)=>{ if(!t)return g; const c=g.attributes.color.array; for(let i=0;i<c.length;i+=3){ const l=(c[i]*.3+c[i+1]*.59+c[i+2]*.11)/255; for(let j=0;j<3;j++)c[i+j]=Math.min(255,c[i+j]*.4+t[j]*255*.6*(.3+.7*l)); } return g; };
  const hs=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); };
  const recloth=(g,seed)=>{ '@later'; const c=g.attributes.color.array, R=g.attributes.reg.array, sum={}, col=new THREE.Color(), hsl={};
    for(let i=0;i<R.length;i++){ const r=R[i], S=sum[r]||(sum[r]=[0,0,0,0]); S[0]+=c[i*3]; S[1]+=c[i*3+1]; S[2]+=c[i*3+2]; S[3]++; }
    const skin=r=>{ const S=sum[r], R_=S[0]/S[3]/255, G_=S[1]/S[3]/255, B_=S[2]/S[3]/255; return R_>.42&&R_>G_&&G_>B_&&R_-B_>.12&&G_/R_>.55&&G_/R_<.92; };
    const turn={}; for(const r in sum)turn[r]=skin(+r)?null:[hs(seed,+r),.75+hs(seed,+r+9)*.5];
    for(let i=0;i<R.length;i++){ const t=turn[R[i]]; if(!t)continue; col.setRGB(c[i*3]/255,c[i*3+1]/255,c[i*3+2]/255); col.getHSL(hsl); col.setHSL((hsl.h+t[0])%1,Math.min(1,hsl.s*1.1+.08),Math.min(.9,hsl.l*t[1])); c[i*3]=col.r*255; c[i*3+1]=col.g*255; c[i*3+2]=col.b*255; } return g; };
  const boulder=(g,seed)=>{ const I=g.index.array;
    const P=g.attributes.position.array, n=P.length/3, wid=new Int32Array(n), keys=new Map(); for(let i=0;i<n;i++){ const k=Math.round(P[i*3]*1e3)+','+Math.round(P[i*3+1]*1e3)+','+Math.round(P[i*3+2]*1e3); if(!keys.has(k))keys.set(k,keys.size); wid[i]=keys.get(k); }
    const m=keys.size, X=new Float64Array(m*3), nb=Array.from({length:m},()=>new Set()); for(let i=0;i<n;i++)for(let x=0;x<3;x++)X[wid[i]*3+x]=P[i*3+x]; const fz=new Uint8Array(m); for(let i=g.userData.n0??n;i<n;i++)fz[wid[i]]=1;
    for(let t=0;t<I.length;t+=3)for(let e=0;e<3;e++){ const u=wid[I[t+e]], v=wid[I[t+(e+1)%3]]; if(u!==v){ nb[u].add(v); nb[v].add(u); } }
    const pass=k=>{ const D=new Float64Array(m*3); for(let i=0;i<m;i++){ if(!nb[i].size||fz[i])continue; for(const j of nb[i])for(let x=0;x<3;x++)D[i*3+x]+=X[j*3+x]; for(let x=0;x<3;x++)D[i*3+x]=D[i*3+x]/nb[i].size-X[i*3+x]; } for(let i=0;i<m*3;i++)X[i]+=k*D[i]; };
    for(let it=0;it<5;it++){ pass(.55); pass(-.58); }
    const NR=new Float64Array(m*3), V=(i,x)=>X[wid[i]*3+x];
    for(let t=0;t<I.length;t+=3){ const a=I[t],b=I[t+1],c=I[t+2], ux=V(b,0)-V(a,0),uy=V(b,1)-V(a,1),uz=V(b,2)-V(a,2), vx=V(c,0)-V(a,0),vy=V(c,1)-V(a,1),vz=V(c,2)-V(a,2), cx=uy*vz-uz*vy, cy=uz*vx-ux*vz, cz=ux*vy-uy*vx;
      for(const q of [a,b,c]){ NR[wid[q]*3]+=cx; NR[wid[q]*3+1]+=cy; NR[wid[q]*3+2]+=cz; } }
    const nz=(x,y,z)=>{ const v=Math.sin(x*12.9898+y*78.233+z*37.719+seed*3.1)*43758.5453; return v-Math.floor(v); }, vn=(x,y,z)=>{ const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),f=x-i,h=y-j,e=z-k,S=t=>t*t*(3-2*t),u=S(f),v=S(h),w=S(e),L=(p,q,t)=>p+(q-p)*t;
      return L(L(L(nz(i,j,k),nz(i+1,j,k),u),L(nz(i,j+1,k),nz(i+1,j+1,k),u),v),L(L(nz(i,j,k+1),nz(i+1,j,k+1),u),L(nz(i,j+1,k+1),nz(i+1,j+1,k+1),u),v),w); };
    for(let i=0;i<m;i++){ const l=Math.hypot(NR[i*3],NR[i*3+1],NR[i*3+2])||1, x=X[i*3],y=X[i*3+1],z=X[i*3+2], d=(vn(x*3,y*3,z*3)-.5)*.09+(vn(x*7+9,y*7,z*7)-.5)*.03; for(let q=0;q<3;q++)X[i*3+q]+=NR[i*3+q]/l*d; }
    for(let i=0;i<n;i++)for(let x=0;x<3;x++)P[i*3+x]=X[wid[i]*3+x]; return g; };
  const golem=(g,seed)=>{ g=boulder(g,seed); const c=g.attributes.color.array, n=c.length/3, F=new Float32Array(n), ST=[[138,135,130],[124,124,122],[112,114,118],[146,140,128]], o=ST[seed%4], sd=(seed*.618)%1*.98;
    for(let i=0;i<n;i++){ const l0=(c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11)/255; if(l0<.09)continue;
      for(let j=0;j<3;j++)c[i*3+j]=o[j]; F[i]=2+sd; }
    g.setAttribute('fab',new THREE.BufferAttribute(F,1)); g.attributes.color.needsUpdate=true; return g; };
  const ARMR={skeleton:[.05,.045],ogre:[.12,.11]}, ARMV=new THREE.Vector3(), ARMQ=new THREE.Quaternion(), ARMM=new THREE.Matrix4(), ARMI=new THREE.Matrix4();
  const armsOf=(D,kind,rig,stone)=>{ const R=D.rig, M=D.mesh, ibm=F32(BY(R,'ibm')), rest=i=>new THREE.Matrix4().fromArray(ibm,i*16).invert(), {p:P,j:J,w:W,c:C,r:RG}=SKIN.dec(M), n=P.length/3;
    const dom=i=>{ let m=0; for(let k=1;k<4;k++)if(W[i*4+k]>W[i*4+m])m=k; return J[i*4+m]; }, SP=R.names.indexOf('DEF_spine'), HL=[R.names.indexOf('DEF_hand_L'),R.names.indexOf('DEF_hand_R')];
    const rad=stone?[.15,.14]:ARMR[kind.split('_')[0]]||[.085,.075], bony=kind.startsWith('skeleton'), G={p:[],c:[],r:[],j:[],w:[],i:[]}, sides=[];
    HL.forEach((hb,si)=>{ const sg=si?-1:1, H0=rest(hb); let wx=0, wy=0, wz=0, wn=0, hc=[0,0,0], hr=0, tc=[0,0,0], tn=0, tr=0, tx=0;
      for(let i=0;i<n;i++){ const x=P[i*3],y=P[i*3+1],z=P[i*3+2], d=dom(i);
        if(d===hb&&Math.abs(x)<.9){ wx+=x; wy+=y; wz+=z; wn++; for(let k=0;k<3;k++)hc[k]+=C[i*3+k]; hr=RG[i]; }
        if(d===SP&&x*sg>0&&y>1.6&&y<1.92){ tx=Math.max(tx,x*sg); }}
      for(let i=0;i<n;i++){ const x=P[i*3],y=P[i*3+1]; if(dom(i)===SP&&x*sg>tx-.08&&y>1.6&&y<1.92){ for(let k=0;k<3;k++)tc[k]+=C[i*3+k]; tn++; tr=RG[i]; } }
      const Wr=new THREE.Vector3(wx/wn,wy/wn,wz/wn), S=new THREE.Vector3(sg*Math.max(.12,tx-rad[0]*.6),Math.min(Wr.y+.04,1.86),Wr.z*.5), L=Wr.distanceTo(S)/2;
      const hcol=hc.map(v=>v/wn), tcol=tn&&!bony?tc.map(v=>v/tn):hcol, S0=rest(SP), q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),Wr.clone().sub(S).normalize());
      const ua=new THREE.Bone(), fa=new THREE.Bone(); ua.name='ARM_up_'+'LR'[si]; fa.name='ARM_fore_'+'LR'[si]; rig.bones[0].add(ua,fa);
      const E=S.clone().lerp(Wr,.5), B0=[new THREE.Matrix4().compose(S,q,new THREE.Vector3(1,1,1)),new THREE.Matrix4().compose(E,q,new THREE.Vector3(1,1,1))];
      const bi=[rig.bones.length,rig.bones.length+1]; rig.bones.push(ua,fa); rig.skeleton=new THREE.Skeleton(rig.bones,[...rig.skeleton.boneInverses,...B0.map(m=>m.clone().invert())]);
      rig.bones[0].updateMatrix(); [ua,fa].forEach((B,k)=>ARMI.copy(rig.bones[0].matrix).invert().multiply(B0[k]).decompose(B.position,B.quaternion,B.scale));
      const tube=(bone,len,r0,r1,col,reg)=>{ const o=G.p.length/3, m=B0[bone-bi[0]];
        for(let e=0;e<2;e++)for(let a=0;a<6;a++){ const t=a/6*Math.PI*2, r=e?r1:r0; ARMV.set(Math.cos(t)*r,e*len,Math.sin(t)*r).applyMatrix4(m); G.p.push(ARMV.x,ARMV.y,ARMV.z); G.c.push(...col); G.r.push(reg); G.j.push(bone,0,0,0); G.w.push(255,0,0,0); }
        for(let a=0;a<6;a++){ const a1=(a+1)%6; G.i.push(o+a,o+6+a,o+a1, o+a1,o+6+a,o+6+a1); }
        for(let a=1;a<5;a++)G.i.push(o,o+a,o+a+1, o+6,o+6+a+1,o+6+a); };
      const ball=(bone,y,r,col,reg)=>{ const o=G.p.length/3, m=B0[bone-bi[0]]; for(const [x,yy,z] of [[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]]){ ARMV.set(x,y+yy,z).applyMatrix4(m); G.p.push(ARMV.x,ARMV.y,ARMV.z); G.c.push(...col); G.r.push(reg); G.j.push(bone,0,0,0); G.w.push(255,0,0,0); }
        for(const [a,c2] of [[0,2],[2,1],[1,3],[3,0]])G.i.push(o+a,o+c2,o+4, o+c2,o+a,o+5); };
      const dk=c=>c.map(v=>v*.85);
      ball(bi[0],0,rad[0]*1.15,tcol,tr); tube(bi[0],L,rad[0],rad[0]*.9,tcol,tr); ball(bi[1],0,rad[1]*1.1,bony?hcol:dk(tcol),bony?hr:tr); tube(bi[1],L*1.04,rad[1],rad[1]*.85,hcol,hr);
      sides.push({hb,ua,fa,L,sg, Sl:S.clone().applyMatrix4(S0.clone().invert()), Wl:Wr.clone().applyMatrix4(H0.clone().invert())}); });
    return {G,sides,SP}; };
  const armM=(B,out)=>{ out.identity(); for(let x=B;x&&x.isBone;x=x.parent){ x.updateMatrix(); out.premultiply(x.matrix); } return out; };
  const AS=new THREE.Vector3(), AW=new THREE.Vector3(), AE=new THREE.Vector3(), AD=new THREE.Vector3(), AP=new THREE.Vector3(), AX=new THREE.Vector3(), AZ=new THREE.Vector3(), SPM=new THREE.Matrix4(), HM=new THREE.Matrix4(), RTI=new THREE.Matrix4(), ONE=new THREE.Vector3();
  const armSet=(bone,from,to,k)=>{ '@later'; AD.subVectors(to,from); const len=AD.length()||1e-6; AD.divideScalar(len); AZ.copy(AP).addScaledVector(AD,-AP.dot(AD)); if(AZ.lengthSq()<1e-8)AZ.set(0,0,1); AZ.normalize(); AX.crossVectors(AD,AZ);
    ARMM.makeBasis(AX,AD,AZ).setPosition(from); ARMM.scale(ONE.set(1,k,1)); ARMI.multiplyMatrices(RTI,ARMM).decompose(bone.position,bone.quaternion,bone.scale); };
  const armsSolve=(A,bones)=>{ '@later'; const root=bones[0]; root.updateMatrix(); RTI.copy(root.matrix).invert(); armM(bones[A.SP],SPM);
    for(const s of A.sides){ AS.copy(s.Sl).applyMatrix4(SPM); AW.copy(s.Wl).applyMatrix4(armM(bones[s.hb],HM)); const d=AS.distanceTo(AW), L=s.L, k=Math.max(1,d/(2*L));
      AP.set(s.sg*.35,-.45,-1).transformDirection(SPM);
      if(d>=2*L*.999)AE.lerpVectors(AS,AW,.5); else{ AD.subVectors(AW,AS).divideScalar(d); const a=d/2, h=Math.sqrt(Math.max(0,L*L-a*a)); AZ.copy(AP).addScaledVector(AD,-AP.dot(AD)).normalize(); AE.copy(AS).addScaledVector(AD,a).addScaledVector(AZ,h); }
      armSet(s.ua,AS,AE,k); armSet(s.fa,AE,AW,k); } };
  const withArms=(g,A)=>{ const G=A.G, o=g.userData.n0=g.attributes.position.count, cat=(name,arr,T,sz,norm)=>{ const a=g.attributes[name]; const out=new T(a.array.length+arr.length); out.set(a.array); out.set(arr,a.array.length); g.setAttribute(name,new THREE.BufferAttribute(out,sz,norm)); };
    cat('position',G.p,Float32Array,3); cat('color',G.c,Uint8Array,3,true); cat('reg',G.r,Float32Array,1); cat('sh',new Array(G.r.length).fill(0),Float32Array,1); cat('skinIndex',G.j,Uint8Array,4); cat('skinWeight',G.w,Uint8Array,4,true);
    const ix=g.index.array, I=new Uint32Array(ix.length+G.i.length); I.set(ix); for(let k=0;k<G.i.length;k++)I[ix.length+k]=G.i[k]+o; g.setIndex(new THREE.BufferAttribute(I,1)); return g; };
  const PEOPLE=['hero_m','hero_f','villager_m','villager_f'];
  MK=([key,kind,copy],i,X={})=>{ const D=PW[kind], rig=rigOf(D.rig), AR=armsOf(D,kind,rig,!!copy), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CLIPS[n])); let cur=null;
    const N=makeNPC(null,{key,name:key.toUpperCase().replace('_',' '),names:D.mesh.parts,lv:'up',group:'bodega',geo:X.cloth!=null?recloth(withArms(geomOf(D.mesh),AR),X.cloth):copy?golem(withArms(geomOf(D.mesh),AR),7):dressed(withArms(geomOf(D.mesh),AR),UNIFORM[key]),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres:1.35,x:SHARED.BOD.XS(66+(i%12)*4.4+(copy?1.7*copy:0)),z:SHARED.BOD.ZS(i%2?SHARED.BOD.FAR+.8:-73.6),lane:STLANE,free:stfree,roam:true,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.5,stride:0,rock:0,bob:0,...((copy||/^(skeleton|ogre)/.test(key))&&QS.get('sheet')!==key&&DUN()||{}),
      brain:HOLD?(dt,you,st)=>{ st.to=null; st.hold=true; }:undefined,...(X.npc||{}),
      anim:(dt,moving,st,sc)=>{ '@later'; let want, ts=1;
        if(HOLD)want=HOLD; else if(N.sheet)want='UAL_A_TPose'; else{ const run=moving&&st.v>(N.gait?2.4:1.2)*TILE; const fast=moving&&N.gaitU>2.5; want=moving?(run&&!fast?'UAL_Sprint_Loop':N.gait||WALKC):N.dwell||N.idle||IDLEC; if(moving)ts=Math.max(.6,Math.min(1.8,st.v/((run&&!fast?RUNU:N.gaitU||WALK)*sc))); }
        if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        act(cur).timeScale=N.sheet&&!HOLD?0:ts; mixer.update(dt); armsSolve(AR,rig.bones); }});
    N.restless=()=>!!HOLD||cur===N.dwell&&!STILLC.has(cur)&&(cur!=='UAL_Idle_Talking_Loop'||!!(N.walker&&N.walker.talk));
    N.mixer=mixer; N.kind=kind; N.act=act; if(copy&&!X.npc)N.park=true; if(!X.npc)PAWNL.push(N); return N; };
  const build=J=>{ PW=J; const R0=PW.hero_m.rig; CLIPS=SKIN.clips(PW.hero_m.clips,R0.names,false); ALL=[...Object.keys(PW).map(k=>[k,k,0]),...[1,2,3,4].map(n=>['hero_m_'+n,'hero_m',n])];   // one golem kind, four of it, in the dungeon (owner, 5 Nov 2026)
    ALL.forEach((k,i)=>(k[2]||!PEOPLE.includes(k[0])||QS.get('sheet')===k[0])&&MK(k,i)); };
  const go=()=>SYS.started?PAWNS().then(build).catch(e=>console.warn('PAWNS',e)):setTimeout(go,600); go();
  window.PAWNNEW=MODS.pawnNew=(kind,key,X={})=>PW&&MK([key,kind,X.copy||0],0,X);   // X.copy: a stone golem of it
  window.PAWNCAM=(i=0,k=1.6)=>{ const N=PAWNL[i]; UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); SHARED.ppu=SHARED.ppuTo=PPU*k; };
  window.PAWNDBG=()=>PAWNL.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),to:!!N.st.to,vis:N.g.visible}));
  // THE SOAK (tests/soak.cjs): n extra pawns scattered over the walkable map, roaming wide, not in the crowd; PAWNSOAKDBG reports the ones breaking an invariant.
  const SOAK={list:[],t:0}; window.PAWNSOAK=(n=100)=>{ '@later'; if(!PW)return 0; const B=SHARED.BOUND, T=TILE, R=.3*T; let tries=0;
    while(SOAK.list.length<n&&tries++<n*300){ const x=B.x0+Math.random()*(B.x1-B.x0), z=B.z0+Math.random()*(B.z1-B.z0); if(!stfree(x,z,R))continue;
      const i=SOAK.list.length, P=ALL.filter(([k])=>!/^(skeleton|ogre)/.test(k)), N=MK(P[i%P.length],900+i,{npc:{x,z,home:{x,z,r:40*T},roam:true}}); N.soak={lx:x,lz:z,still:0,hops:0,ticks:0,toSeen:false,t0:SOAK.t}; N.farMove=dt=>{ N.soak.ticks++; N.tick(dt,pos); }; SOAK.list.push(N); } return SOAK.list.length; };
  SYS.add('life',dt=>{ if(!SOAK.list.length)return; SOAK.t+=dt; for(const N of SOAK.list){ const s=N.st, k=N.soak; if(s.to)k.toSeen=true; if(Math.hypot(s.x-k.lx,s.z-k.lz)>.05*TILE){ k.still=0; k.hops++; k.lx=s.x; k.lz=s.z; } else if(s.to)k.still+=dt; } },'088 soak');
  window.PAWNSOAKDBG=()=>{ '@later'; const B=SHARED.BOUND, bad=[]; for(const N of SOAK.list){ const s=N.st, k=N.soak, why=[];
      if(!isFinite(s.x)||!isFinite(s.z))why.push('nan'); else { if(s.x<B.x0||s.x>B.x1||s.z<B.z0||s.z>B.z1)why.push('out of bounds'); if(!stfree(s.x,s.z,s.R)){ const b=SOL.up.find(b=>s.x>b[0]-s.R&&s.x<b[2]+s.R&&s.z>b[1]-s.R&&s.z<b[3]+s.R); why.push(b?'inside solid ['+b.map(v=>+v.toFixed(1)).join(',')+']':'inside a building, the ring edge or water'); } if(!isFinite(N.ground(s.x,s.z)))why.push('no ground'); }
      if(k.still>25)why.push('stuck '+k.still.toFixed(0)+'s'); if(why.length)bad.push({key:N.key,x:+s.x.toFixed(1),z:+s.z.toFixed(1),far:!!N.far,why}); }
    const exits=(s)=>{ let n=0; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; if(stfree(s.x+Math.sin(a)*3*TILE,s.z+Math.cos(a)*3*TILE,s.R))n++; } return n; };
    const still=SOAK.list.filter(N=>!N.soak.hops).map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),far:!!N.far,ticks:N.soak.ticks,toSeen:N.soak.toSeen,exits:exits(N.st),wait:+(N.st.wait||0).toFixed(1)}));
    return {n:SOAK.list.length,simT:+SOAK.t.toFixed(1),moved:SOAK.list.filter(N=>N.soak.hops>0).length,still,bad,errs:Object.entries(SYS.P).flatMap(([k,v])=>v.filter(q=>q.err).map(q=>k+':'+q.name))}; }; }
