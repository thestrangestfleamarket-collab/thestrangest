// YOUR REAL MOVES IN THE HEADSET: VRB, in VR your avatar's head, arms and fingers follow the headset, the controllers or your tracked hands, and every other player sees them live (owner, 8 Nov 2026: "C").
import {THREE} from './003-shx.js';
import {ONLINE, VR, W3} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {HANDS} from './111b-hands.js';
import {GHOLD} from './146zoa-guitar-hold.js';
const VRB={};
{ const V3=THREE.Vector3, Q4=THREE.Quaternion, M4=THREE.Matrix4;
  const EYE=new V3(0,.19,.02), HEADMAX=1.1, LEANMAX=.35, RATE=.1, FLIP=new Q4().setFromAxisAngle(new V3(0,1,0),Math.PI);
  const POLE={L:new V3(.45,-1,-.35),R:new V3(-.45,-1,-.35)}, ARM={L:[3,4,5],R:[6,7,8]};
  // a controller's grip to the wrist (OpenXR: the grip's x to the right, -z along the controller; the wrist's -z to the knuckles, +y the back of the hand), the wrist a little behind the palm
  const GRIP={L:new Q4().setFromAxisAngle(new V3(0,0,1),Math.PI/2),R:new Q4().setFromAxisAngle(new V3(0,0,1),-Math.PI/2)}, GBACK=new V3(0,0,.06);

  /* ---------- the fingers: each joint's bend from the tracked joints, against the hand model's own rest (HANDS.REST is WebXR's 25 joints) ---------- */
  const N=HANDS.NAME, DIG=['thumb','index','middle','ring','pinky'], SEQ=HANDS.CH.map((c,i)=>[i?N[DIG[i]+'-finger-metacarpal']:N.wrist,...c]);
  const A=new V3(), B=new V3();
  const bend=(P,a,b,c)=>{ A.set(P[b*3]-P[a*3],P[b*3+1]-P[a*3+1],P[b*3+2]-P[a*3+2]); B.set(P[c*3]-P[b*3],P[c*3+1]-P[b*3+1],P[c*3+2]-P[b*3+2]); return A.lengthSq()<1e-12||B.lengthSq()<1e-12?0:A.angleTo(B); };
  const RP=new Float32Array(75); HANDS.REST.forEach((m,j)=>{ const e=m.elements; RP[j*3]=e[12]; RP[j*3+1]=e[13]; RP[j*3+2]=e[14]; });
  const RB=SEQ.map(s=>[0,1,2].map(k=>bend(RP,s[k],s[k+1],s[k+2])));
  const tracked=(P,f)=>{ for(let i=0;i<5;i++){ const s=SEQ[i]; for(let k=0;k<3;k++)f[i*4+k]=Math.max(-.4,Math.min(2,(bend(P,s[k],s[k+1],s[k+2])-RB[i][k])/(i?1:.8))); f[i*4+3]=HANDS.R0[i][3]; } return f; };
  // holding a controller: the hand round it, the index on the trigger, the rest on the grip
  const FIST=RIG.fgOf({fist:1}), R0=HANDS.R0;
  const held=(g,t,f)=>{ const w=[.35+.5*Math.max(g,t),.3+.7*t,.35+.65*g,.35+.65*g,.35+.65*g]; for(let i=0;i<5;i++){ for(let k=0;k<3;k++)f[i*4+k]=R0[i][k]+(FIST[i][k]-R0[i][k])*w[i]; f[i*4+3]=R0[i][3]; } return f; };

  /* ---------- you: the headset, hands or controllers in your avatar's own space (its forward +z; the hands from your eyes, in the body's metres) ---------- */
  const MI=new M4(), PV=new V3(), SV=new V3(), QM=new Q4(), QI=new Q4(), QH=new Q4(), QW=new Q4(), EW=new V3(), HW=new V3(), DV=new V3();
  const side=()=>({d:[0,0,0],q:[0,0,0,1],f:new Array(20).fill(0),m:new V3()});   // (m: your own hand where it really is, in the mesh's space)
  const ME={raw:1,t:0,h:[0,0,0,1],L:null,R:null,e:new V3()}, MS={L:side(),R:side()};
  const capture=M=>{ const P=VR.pose, D=VR.dolly; if(!P||!D)return null; const T=P.transform;
    M.me.matrixWorld.decompose(PV,QM,SV); QI.copy(QM).invert(); const sc=SV.x||1, k=DV.setFromMatrixColumn(M.PM.value[1],0).length()||1, u=1/(sc*k), mh=D.scale.x||1;
    D.getWorldQuaternion(QW); EW.set(T.position.x,T.position.y,T.position.z).applyMatrix4(D.matrixWorld);
    QH.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w).premultiply(QW).premultiply(QI).multiply(FLIP); QH.toArray(ME.h); ME.e.copy(EW).applyMatrix4(MI.copy(M.me.matrixWorld).invert());
    for(const S of 'LR'){ const J=VR.joints[S], O=MS[S]; let ok=false;
      if(J&&J.wrist&&J.q){ HW.copy(J.wrist); QH.copy(J.q); tracked(J.jp,O.f); ok=true; }
      else { const U=VR.hand(S==='L'?'left':'right'); if(U&&U.on){ QH.copy(U.wq).multiply(GRIP[S]); HW.copy(GBACK).applyQuaternion(U.wq).multiplyScalar(mh).add(U.wp); const G=VR.grips.find(g=>g.h===(S==='L'?'left':'right')); held(G?G.grip:0,G?G.trig:0,O.f); ok=true; } }
      if(!ok){ ME[S]=null; continue; }
      O.m.copy(HW).applyMatrix4(MI.copy(M.me.matrixWorld).invert()); DV.subVectors(HW,EW).applyQuaternion(QI).multiplyScalar(u); DV.toArray(O.d); QH.premultiply(QI).toArray(O.q); ME[S]=O; }
    ME.t=performance.now(); return ME; };

  /* ---------- a body moved by them: the head turned (held within a neck's turn of the chest), each arm reaching its hand, the hand turned as yours, the fingers bent as yours ---------- */
  const IK=GHOLD.IK, RM=new WeakMap();
  const prep=(body,st)=>{ let r=RM.get(body); if(r&&r.st===st)return r; const restM=body.binv.map(m=>m.clone().invert());
    r={restM,W:restM.map(()=>new M4()),RQ:restM.map(m=>{ const q=new Q4(); m.decompose(PV,q,SV); return q; }),st,X:{}};
    if(st&&st.base)for(const S of 'LR'){ const X=new M4(); if(S==='R')X.makeScale(-1,1,1); X.multiply(HANDS.REST[N.wrist].clone().invert()).multiply(st.base[S].clone().invert()); const q=new Q4(); X.decompose(PV,q,SV); r.X[S]=q; }
    RM.set(body,r); return r; };
  const QT=new Q4(), QA=new Q4(), QB=new Q4(), O2=new V3(), E=new V3(), TG=new V3(), PO=new V3(), KS=new V3(), HP=new V3(), LA=new V3(), LB=new V3(), QL=new Q4(), ML=new M4(), MT=new M4();
  // your own body leans at the waist so its head is where your real head is (the idle's sway would carry it off); the legs keep their moves
  const lean=(W,QT,k,eye)=>{ HP.setFromMatrixPosition(W[1]); LA.setFromMatrixPosition(W[2]).add(E.copy(EYE).applyQuaternion(QT).multiplyScalar(k)).sub(HP); LB.copy(eye).sub(HP); if(LA.lengthSq()<1e-9||LB.lengthSq()<1e-9)return;
    QL.setFromUnitVectors(LA.normalize(),LB.normalize()); const w=Math.min(1,Math.abs(QL.w)), ang=2*Math.acos(w); if(ang>LEANMAX)QL.slerp(QB.identity(),1-LEANMAX/ang);
    ML.makeTranslation(HP.x,HP.y,HP.z).multiply(MT.makeRotationFromQuaternion(QL)).multiply(MT.makeTranslation(-HP.x,-HP.y,-HP.z)); for(let i=1;i<9;i++)W[i].premultiply(ML); QT.premultiply(QL); };
  const smooth=d=>{ const now=performance.now(), a=d.s?1-Math.exp(-Math.min(.1,(now-d.st)/1000)*14):1; d.st=now; const s=d.s||(d.s={h:[0,0,0,1],L:null,R:null}), g=d.g;
    QA.fromArray(s.h).slerp(QB.fromArray(g.h),a).toArray(s.h);
    for(const S of 'LR'){ const G=g[S]; if(!G){ s[S]=null; continue; } let C=s[S]; if(!C){ C=s[S]={d:G.d.slice(),q:G.q.slice(),f:G.f?G.f.slice():null}; continue; }
      for(let i=0;i<3;i++)C.d[i]+=(G.d[i]-C.d[i])*a; QA.fromArray(C.q).slerp(QB.fromArray(G.q),a).toArray(C.q);
      if(G.f){ if(!C.f)C.f=G.f.slice(); else for(let i=0;i<20;i++)C.f[i]+=(G.f[i]-C.f[i])*a; } else C.f=null; }
    return s; };
  const fgOf=(st,S,f)=>{ const F=st.vrfg||(st.vrfg={L:[0,1,2,3,4].map(()=>[0,0,0,0]),R:[0,1,2,3,4].map(()=>[0,0,0,0])}); for(let i=0;i<5;i++)for(let k=0;k<4;k++)F[S][i][k]=f[i*4+k]; return F[S]; };
  BODIES.track=(PM,body,d)=>{ if(!body.binv)return; const P=PM.value, st=PM.hands, R=prep(body,st), W=R.W, RQ=R.RQ, D=d.raw?d:smooth(d);
    for(let i=1;i<9;i++)W[i].multiplyMatrices(P[i],R.restM[i]);
    P[1].decompose(PV,QT,SV); const k=SV.x; KS.set(k,k,k); if(D.e)lean(W,QT,k,D.e);
    QA.fromArray(D.h); QB.copy(QT).invert().multiply(QA); { const w=Math.min(1,Math.abs(QB.w)), ang=2*Math.acos(w); if(ang>HEADMAX)QB.slerp(QM.identity(),1-HEADMAX/ang); } QA.copy(QT).multiply(QB);
    O2.setFromMatrixPosition(W[2]); W[2].compose(O2,QB.copy(QA).multiply(RQ[2]),KS);
    E.copy(EYE).applyQuaternion(QA).multiplyScalar(k).add(O2); if(D.e)VRB.eye=[...DV.subVectors(D.e,E).applyQuaternion(QB.copy(QA).invert()).multiplyScalar(1/k).toArray()];   // (your real eye from where the avatar's is, in its head's frame, metres: for the checks)
    let fg=null;
    for(const S of 'LR'){ const H=D[S]; if(!H)continue; const ids=ARM[S], h=ids[2];
      if(H.m)TG.copy(H.m); else TG.fromArray(H.d).multiplyScalar(k).add(E); IK.reach(W,ids,TG,PO.copy(POLE[S]).transformDirection(P[1])); IK.untwist(W,ids,1);
      if(R.X[S]){ O2.setFromMatrixPosition(W[h]); W[h].compose(O2,QB.fromArray(H.q).multiply(R.X[S]).multiply(RQ[h]),KS); IK.untwist(W,ids,2); }
      if(st&&H.f){ fg=fg||{L:null,R:null}; fg[S]=fgOf(st,S,H.f); } }
    for(let i=1;i<9;i++)P[i].multiplyMatrices(W[i],body.binv[i]);
    if(st)st.fg=fg; };

  /* ---------- each frame in the headset: your body follows you; ten times a second the others are told ---------- */
  let sent=false, mine=null, handsOff=false;
  const r3=a=>a.map(v=>Math.round(v*1000)/1000), wire=H=>H?(H.f?[...r3(H.d),...r3(H.q),...H.f.map(v=>Math.round(v*100)/100)]:[...r3(H.d),...r3(H.q)]):0;
  SYS.add('every',()=>{ const M=BODIES.mine(), on=VR.on&&!!M&&W3.body.on;
    if(mine&&(!on||mine!==M.PM)){ mine.vr=null; if(mine.hands){ mine.hands.fg=null; if(handsOff){ mine.hands.hm.visible=!!mine.hands.near; handsOff=false; } } mine=null; }
    if(!on){ if(sent&&ONLINE.on){ ONLINE.send({t:'vr',off:1}); } sent=false; return; }
    const d=capture(M); M.PM.vr=d; mine=d?M.PM:null;
    // your own tracked hands are drawn where they are (162c): the avatar's own hands stand down under them
    const st=M.PM.hands, real=!!(VR.hands>0&&VR.opt.hands); if(st&&(real||handsOff)){ st.hm.visible=real?false:!!st.near; handsOff=real; }
    if(!d||!ONLINE.on)return; const now=performance.now(); if(now-(VRB.sentT||0)<RATE*1000)return; VRB.sentT=now;
    ONLINE.send({t:'vr',h:r3(d.h),L:wire(d.L),R:wire(d.R)}); sent=true; },'162cb-vrbody');

  /* ---------- another player in a headset ---------- */
  const unwire=a=>Array.isArray(a)&&a.length>=7?{d:a.slice(0,3).map(Number),q:a.slice(3,7).map(Number),f:a.length>=27?a.slice(7,27).map(Number):null}:null;
  ONLINE.hear.vr=m=>{ const o=m.id&&ONLINE.others.get(m.id); if(!o)return; if(m.off){ o.vr=null; return; } if(!Array.isArray(m.h)||m.h.length<4)return;
    const g={h:m.h.slice(0,4).map(Number),L:unwire(m.L),R:unwire(m.R)}; if(!g.h.every(isFinite))return; const v=o.vr||(o.vr={}); v.g=g; v.t=performance.now(); };
  VRB.capture=()=>{ const M=BODIES.mine(); return M&&VR.on?capture(M):null; };
  window.VRB=VRB; }
