// THE GUITAR IN YOUR HANDS: GHOLD, Polyfork's guitar (data/pfguitar.json) held against a body, its arms reaching it and every finger on its strings and frets, from a score (a song from the book, or what you play) at a time (owner, 7 Nov 2026: "hand 3d model, physics, real string acoustics, sounds, closeup, fingers").
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {HANDS} from './111b-hands.js';
const GHOLD={};
{ const G=__DATA__("data/pfguitar.json"), F=G.frame, V3=THREE.Vector3, M4=THREE.Matrix4, Q4=THREE.Quaternion;
  /* ---------- the model (metres: y up the neck, the top facing +z, string 1 on the +x side) ---------- */
  let GEO=null;
  const geo=()=>{ if(GEO)return GEO; const q=I16(G.pos), n=q.length/3, P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*G.sc+G.lo[i%3];
    const c=B64(G.col), C=new Float32Array(n*3), col=new THREE.Color(); for(let i=0;i<n;i++){ col.setRGB(c[i*3]/255,c[i*3+1]/255,c[i*3+2]/255,THREE.SRGBColorSpace); C[i*3]=col.r; C[i*3+1]=col.g; C[i*3+2]=col.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(U16(G.tri),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return GEO=g; };
  let MAT=null; const mat=()=>MAT||(MAT=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));
  GHOLD.model=()=>{ const m=new THREE.Mesh(geo(),mat()); m.castShadow=m.receiveShadow=true; m.name='guitar'; return m; };
  GHOLD.F=F;

  /* ---------- where things are on it ---------- */
  const SAD=F.sad[0], NUT=F.nut[0], L=NUT-SAD, FB=F.fb[1];
  const fretY=k=>NUT-L*(1-Math.pow(2,-k/12));
  const strAt=(s,y,o=new V3())=>{ const u=(y-SAD)/L, x=F.x[s-1]; return o.set(x[1]+(x[0]-x[1])*u,y,F.sad[1]+(F.nut[1]-F.sad[1])*u); };
  const pressY=(k,u=.7)=>k?fretY(k-1)+u*(fretY(k)-fretY(k-1)):NUT+.01;
  GHOLD.fretY=fretY; GHOLD.strAt=strAt;
  // the neck's shape (from the model): its half width, and its rounded back, deeper at the heel
  const NECK=[.55,NUT+.012], NW=y=>.0305-(y-.55)*.018, NBK=(x,y)=>{ const c=y>=.65?.023:.023-(.65-y)*.115, u=Math.min(1,Math.abs(x)/NW(y)); return c+(.034-c)*u*u; };
  // a ball (centre p, radius r) out of the neck: the shortest way out (over the board, past its edge, or behind its back; a thumb never over the board), or null
  const neckOut=(p,r,o,back)=>{ if(p.y<NECK[0]||p.y>NECK[1])return null; const w=NW(p.y), ax=Math.abs(p.x); if(ax>w+r||p.z>FB+r)return null; const zb=NBK(Math.min(ax,w),p.y); if(p.z<zb-r)return null;
    const up=FB+r-p.z, side=w+r-ax, dn=p.z-zb+r; return !back&&up<=side&&up<=dn?o.set(0,0,up):side<=dn?o.set(Math.sign(p.x)*side,0,0):o.set(0,0,-dn); };
  GHOLD.neckOut=neckOut;
  // where each finger of the right hand plucks (a share of the string from the bridge: the thumb nearest the soundhole), and the strum
  const PLY={p:.29,i:.255,m:.225,a:.195,s:.3}, plY=r=>SAD+(PLY[r]||.2)*L;
  GHOLD.plFrac=r=>PLY[r]||.2;

  /* ---------- held against the body: the guitar's frame in the body's rest space (metres, the body facing +z, its left +x) ---------- */
  const HOLD={neck:[.84,.55,.2],top:[-.12,.12,1],at:[-.05,.89,.16],back:[0,F.hole[0],-F.d]};
  const GB=(()=>{ const y=new V3(...HOLD.neck).normalize(), z0=new V3(...HOLD.top), z=z0.sub(y.clone().multiplyScalar(z0.dot(y))).normalize(), x=new V3().crossVectors(y,z), M=new M4().makeBasis(x,y,z);
    const p=new V3(...HOLD.back).applyMatrix4(M); M.setPosition(new V3(...HOLD.at).sub(p)); return M; })();
  GHOLD.HOLD=HOLD;

  /* ---------- a score at a time: the left hand's presses, the right hand's plucks and strums (108's book compiled, or what you play, the same shape) ---------- */
  const sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); }, mix=(a,b,u,o=new V3())=>o.copy(a).lerp(b,u);
  const posAt=(sc,t)=>{ const P=sc.pos; if(!P||!P.length)return 1; let a=P[0], i=0; for(let j=0;j<P.length;j++){ if(P[j].t-.15>t)break; a=P[j]; i=j; } const pv=i>0?P[i-1]:a, u=sm((t-(a.t-.15))/.13); return pv.p+(a.p-pv.p)*u; };
  GHOLD.posAt=posAt;
  const UP=new V3(0,0,1);
  // the left hand's fingertips (index to little finger): a press is the string at its fret, pressed onto the board; free fingers hover over where they go next
  // fingers on one fret share it in their order (the index nearest the nut), so they lie side by side and never cross
  const share=(q,sc)=>{ const on=new Set(); for(const o of sc.lh)if(o.k===q.k&&o.t0<q.t1&&q.t0<o.t1&&o.f!==q.f)on.add(o.f); let lo=0; for(const f of on)if(f<q.f)lo++; return on.size?.3+.58*lo/on.size:.7; };
  const left=(sc,t,out,w)=>{ const p=posAt(sc,t), press=q=>strAt(q.s,pressY(q.k,share(q,sc))).setZ(FB+.001), hover=q=>q?strAt(q.s,pressY(q.k,share(q,sc))).addScaledVector(UP,.016):strAt(3+(w.f>2?1:0),pressY(Math.max(1,Math.round(p)+w.f-1))).addScaledVector(UP,.018);
    for(let f=1;f<=4;f++){ let cur=null, prev=null, next=null; w.f=f;
      for(const q of sc.lh){ if(q.f!==f)continue; if(q.t0<=t&&t<q.t1){ if(!cur||q.s>cur.s)cur=q; } else if(q.t1<=t)prev=q; else if(!next&&q.t0>t)next=q; }
      if(cur){ out[f].copy(press(cur)); continue; }
      if(next&&next.t0-t<.1){ mix(hover(next),press(next),sm(1-(next.t0-t)/.1),out[f]); continue; }
      if(prev&&t-prev.t1<.08){ mix(press(prev),hover(prev),sm((t-prev.t1)/.08),out[f]); continue; }
      const a=(prev?prev.t1:t)+.08, b=(next?next.t0:t+1)-.1; mix(hover(prev||next),hover(next||prev),sm((t-a)/Math.max(.05,b-a)),out[f]); }
    // the thumb behind the neck, under the middle of the hand
    { const y=pressY(Math.max(1,Math.round(p))+1); out[0].set(-.006,y,NBK(-.006,y)-GHOLD.TB); }
    return p; };
  const HOME={p:5,i:3,m:2,a:1}, RD=['p','i','m','a'];
  // the right hand's fingertips (thumb, index, middle, ring): each comes onto its string, pulls through it and lifts back; a strum sweeps the index across them all
  const right=(sc,t,out)=>{ let strum=null;
    for(let d=0;d<4;d++){ const r=RD[d]; let last=null, next=null; for(const n of sc.tune){ if(n.r!==r)continue; if(n.t<=t)last=n; else { next=n; break; } }
      const y=plY(r), s=next?next.s:last?last.s:HOME[r], rest=strAt(s,y).addScaledVector(UP,.022), on=n=>strAt(n.s,y).addScaledVector(UP,.002), thru=n=>strAt(n.s,y).addScaledVector(UP,.008).setX(strAt(n.s,y).x+(d?-1:1)*(.008+.006*n.amp));
      if(last&&t-last.t<.06){ mix(on(last),thru(last),sm((t-last.t)/.06),out[d]); continue; }
      if(next&&next.t-t<.16){ mix(last&&t-last.t<.3?thru(last):rest,on(next),sm(1-(next.t-t)/.16),out[d]); continue; }
      if(last&&t-last.t<.3){ mix(thru(last),rest,sm((t-last.t-.06)/.24),out[d]); continue; }
      out[d].copy(rest); }
    let pv=null, nx=null; for(const e of sc.strum){ if(e.t0<=t)pv=e; else { nx=e; break; } }
    const end=pv?pv.t0+pv.T:-9, near=pv&&t<end+.15||nx&&nx.t0-t<.15||pv&&nx&&nx.t0-end<.7;
    if(near){ const y=plY('s'), z=F.sad[1]+.004, X6=strAt(6,y).x-.012, X1=strAt(1,y).x+.012, sw=(e,u)=>new V3(e.dn?X6+(X1-X6)*u:X1+(X6-X1)*u,y,z), up=(e,u)=>sw(e,u).addScaledVector(UP,.03);
      let T; if(pv&&t<=end)T=sw(pv,(t-pv.t0)/pv.T); else if(nx&&t>=nx.t0-.04)T=mix(up(nx,0),sw(nx,0),sm((t-(nx.t0-.04))/.04)); else { const a=pv?end:t-1, b=nx?nx.t0-.04:end+.15; T=mix(pv?up(pv,1):out[1],nx?up(nx,0):out[1],sm((t-a)/Math.max(.05,b-a))); }
      out[1].copy(T); strum=T; }
    return strum; };

  GHOLD.tips=(sc,t,L,R)=>{ left(sc,t,L,{f:0}); return right(sc,t,R); };   // (where a score puts the fingertips at t, on the guitar: for a player without a person's hands, 146zoc)
  /* ---------- the body's bones as frames in its mesh's space; turning them; two-bone reach ---------- */
  const QA=new Q4(), VA=new V3(), VB=new V3(), VC=new V3(), VD=new V3(), MA=new M4(), MB=new M4(), MC=new M4();
  const org=(m,o)=>o.setFromMatrixPosition(m);
  const turnAbout=(m,p,q)=>{ MA.makeTranslation(-p.x,-p.y,-p.z); MB.makeRotationFromQuaternion(q); MC.makeTranslation(p.x,p.y,p.z); m.premultiply(MA).premultiply(MB).premultiply(MC); };
  const reach=(W,[u,f,h],T,pole)=>{ const S=org(W[u],new V3()), E=org(W[f],new V3()), Wr=org(W[h],new V3()), a=S.distanceTo(E), b=E.distanceTo(Wr);
    const D=VA.subVectors(T,S), d=Math.max(Math.abs(a-b)+1e-3,Math.min(a+b-1e-4,D.length())), dir=D.normalize().clone(), x=(a*a-b*b+d*d)/(2*d), hh=Math.sqrt(Math.max(0,a*a-x*x));
    const pl=VB.copy(pole).addScaledVector(dir,-pole.dot(dir)).normalize(), E2=new V3().copy(S).addScaledVector(dir,x).addScaledVector(pl,hh);
    QA.setFromUnitVectors(VC.subVectors(E,S).normalize(),VD.subVectors(E2,S).normalize()); for(const i of [u,f,h])turnAbout(W[i],S,QA);
    if(GHOLD.stage<2)return;
    const Tc=new V3().copy(S).addScaledVector(dir,d), E3=org(W[f],new V3()), W3_=org(W[h],new V3()); QA.setFromUnitVectors(VC.subVectors(W3_,E3).normalize(),VD.subVectors(Tc,E3).normalize()); for(const i of [f,h])turnAbout(W[i],E3,QA); };
  // the hand's bone turned so the hand (Polyfork's, 111b) has its fingers along F and its back toward D
  // a bone turned on its own length (pivot at its root) by k of the angle from where its z (its forward, the way an elbow bends at rest) looks to where it should
  const COL=new V3(), C2=new V3(), C3=new V3();
  const rollAng=(axis,cur,want)=>{ const c=C2.copy(cur).addScaledVector(axis,-cur.dot(axis)), w=C3.copy(want).addScaledVector(axis,-want.dot(axis)); if(c.lengthSq()<1e-8||w.lengthSq()<1e-8)return 0; c.normalize(); w.normalize(); return Math.atan2(axis.dot(COL.crossVectors(c,w)),c.dot(w)); };
  const rollBone=(m,pivot,axis,ang)=>{ if(Math.abs(ang)>1e-5)turnAbout(m,pivot,QA.setFromAxisAngle(axis,ang)); };
  const zOf=(m,o=new V3())=>o.setFromMatrixColumn(m,2).normalize();
  // the arm's twist as a person's: the upper arm turned so its elbow bends the way an elbow does (its forward toward where the forearm goes), the forearm sharing the hand's turn halfway (the two bones of the forearm)
  const untwist=(W,[u,f,h],stage)=>{ const S=org(W[u],new V3()), E=org(W[f],new V3()), Wr=org(W[h],new V3()), a1=new V3().subVectors(E,S).normalize(), a2=new V3().subVectors(Wr,E).normalize();
    if(stage===1){ const b=a2.clone().addScaledVector(a1,-a2.dot(a1)); if(b.lengthSq()>1e-4)rollBone(W[u],S,a1,rollAng(a1,zOf(W[u]),b)); return; }
    const zf=zOf(W[f]), aU=rollAng(a2,zf,zOf(W[u])), aH=rollAng(a2,zf,zOf(W[h])); rollBone(W[f],E,a2,(aU+aH)/2); };
  const aim=(W,h,side,Fd,Dd)=>{ const z=Fd.clone().normalize(), y=Dd.clone().addScaledVector(z,-Dd.dot(z)).normalize(), x=new V3().crossVectors(y,z), R=new M4().makeBasis(x,y,z).multiply(HANDS.LOC[side].clone().transpose());
    const p=org(W[h],new V3()), k=VA.setFromMatrixColumn(W[h],0).length(); W[h].copy(R).scale(VA.set(k,k,k)).setPosition(p); };

  /* ---------- the right arm posed as a person holds it (owner, 7 Nov 2026: "holds the arm up straight, then bend it at elbow, then turn it in towards guitar"): from the body's rest,
     1 the arm hangs straight from the shoulder (lifted forward f), 2 the elbow bends (e), 3 the shoulder turns it in toward the guitar (r, about the upper arm's own length); each bone's turn carried down from the shoulder ---------- */
  const QX=new Q4(), QY=new Q4(), QZ=new Q4(), MS=new M4(), ME_=new M4(), MT=new M4();
  const about=(p,q,o)=>o.makeTranslation(p.x,p.y,p.z).multiply(MT.makeRotationFromQuaternion(q)).multiply(new M4().makeTranslation(-p.x,-p.y,-p.z));
  const armFK=(P1,W,restM,[u,f,h],side,{lift,bend,turn},stage)=>{ const so=org(restM[u],new V3()), eo=org(restM[f],new V3()), wo=org(restM[h],new V3()), s=side==='R'?-1:1;
    const d0=new V3().subVectors(eo,so).normalize(), down=new V3(.06*s,-1,0).normalize(), hinge=new V3().setFromMatrixColumn(restM[u],0).normalize();
    QX.setFromUnitVectors(d0,down); QY.setFromAxisAngle(new V3(1,0,0),-lift).multiply(QX);   // 1: straight down by the side, lifted forward
    const dU=d0.clone().applyQuaternion(QY); QZ.setFromAxisAngle(dU,stage>=3?turn*s:0).multiply(QY);   // 3: turned in about its own length (toward the body's middle)
    const Mu=about(so,QZ,new M4()), eb=new Q4().setFromAxisAngle(hinge,stage>=2?bend:0);   // 2: the elbow bent forward about its hinge
    if(new V3().copy(d0).applyQuaternion(eb).z<0)eb.setFromAxisAngle(hinge,stage>=2?-bend:0);
    const Mf=Mu.clone().multiply(about(eo,eb,new M4())), Mh=Mf.clone();
    W[u].multiplyMatrices(P1,Mu).multiply(restM[u]); W[f].multiplyMatrices(P1,Mf).multiply(restM[f]); W[h].multiplyMatrices(P1,Mh).multiply(restM[h]); };
  // the three angles that bring the wrist to where the hand plays (a few damped least-squares steps from last frame's, kept within a person's reach)
  const ALIM={lift:[-.3,1.3],bend:[.2,2.5],turn:[-.2,1.7]}, AK=['lift','bend','turn'];
  const armSolve=(P1,W,restM,ids,side,T,A)=>{ const E=new V3(), P0=new V3(), J=[[],[],[]];
    const at=a=>{ armFK(P1,W,restM,ids,side,a,9); return org(W[ids[2]],new V3()); };
    for(let it=0;it<6;it++){ E.subVectors(T,P0.copy(at(A))); if(E.lengthSq()<1e-6)break;
      AK.forEach((k,q)=>{ const B={...A,[k]:A[k]+.01}, d=at(B).sub(P0).multiplyScalar(100); J[q]=[d.x,d.y,d.z]; });
      const M=[0,1,2].map(r=>[0,1,2].map(c=>J[r][0]*J[c][0]+J[r][1]*J[c][1]+J[r][2]*J[c][2]+(r===c?.02:0))), b=[0,1,2].map(r=>J[r][0]*E.x+J[r][1]*E.y+J[r][2]*E.z);
      const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]), D=det(M);
      AK.forEach((k,q)=>{ const Mq=M.map((row,r)=>row.map((v,c)=>c===q?b[r]:v)); const dx=det(Mq)/D; A[k]=Math.max(ALIM[k][0],Math.min(ALIM[k][1],A[k]+Math.max(-.3,Math.min(.3,dx)))); }); }
    return A; };

  /* ---------- the right arm from Polyfork's own recorded 'Holding lantern' (owner, 7 Nov 2026: "those dont look like human arms"): its arm bent at the elbow, the forearm across the body,
     taken against the chest, then the smallest turn at the shoulder and change at the elbow that brings the hand to the strings; the bones keep the clip's own turns ---------- */
  const CLIPN='Holding lantern';
  const clipArm=(body,H)=>{ if(H.carm)return H.carm; const c=body.clip&&body.clip(CLIPN); if(!c||!c.Q)return null; const NB=15, k=body.S||1, fr=Math.min(c.n-1,Math.floor(c.n*(GHOLD.clipU||0)));
    const pm=i=>{ const o=fr*NB+i; return new M4().compose(new V3(c.P[o*3],c.P[o*3+1],c.P[o*3+2]).multiplyScalar(k),new Q4(c.Q[o*4],c.Q[o*4+1],c.Q[o*4+2],c.Q[o*4+3]),new V3(k,k,k)); };
    const T1=pm(1).invert(); return H.carm=[6,7,8].map(i=>T1.clone().multiply(pm(i))); };
  const RV=new V3(), QR=new Q4();
  const clipPose=(P1,W,restM,R,a)=>{ [6,7,8].forEach((b,j)=>W[b].multiplyMatrices(P1,R[j]).multiply(restM[b]));
    const S=org(W[6],new V3()); RV.set(a[0],a[1],a[2]); const ang=RV.length(); if(ang>1e-6){ QR.setFromAxisAngle(RV.clone().normalize(),ang); for(const b of [6,7,8])turnAbout(W[b],S,QR); }
    const E=org(W[7],new V3()), hinge=new V3().crossVectors(new V3().subVectors(E,S),new V3().subVectors(org(W[8],new V3()),E)).normalize(); if(hinge.lengthSq()>.5&&Math.abs(a[3])>1e-6){ QR.setFromAxisAngle(hinge,a[3]); for(const b of [7,8])turnAbout(W[b],E,QR); } };
  const clipSolve=(P1,W,restM,R,T,a,k)=>{ const at=x=>{ clipPose(P1,W,restM,R,x); return org(W[8],new V3()); }, E=new V3(), lam=[.4,.4,.4,.2].map(v=>v*k*k*.05);
    for(let it=0;it<6;it++){ const p0=at(a); E.subVectors(T,p0); if(E.lengthSq()<1e-6*k*k)break; const J=[0,1,2,3].map(q=>{ const b=a.slice(); b[q]+=.01; return at(b).sub(p0).multiplyScalar(100); });
      // (J^T J + damping) dx = J^T e, damped toward the clip's own pose
      const M=[0,1,2,3].map(r=>[0,1,2,3].map(c=>J[r].dot(J[c])+(r===c?lam[r]:0))), bb=[0,1,2,3].map(r=>J[r].dot(E)-lam[r]*a[r]*.3);
      for(let i=0;i<4;i++){ let mx=i; for(let r=i+1;r<4;r++)if(Math.abs(M[r][i])>Math.abs(M[mx][i]))mx=r; [M[i],M[mx]]=[M[mx],M[i]]; [bb[i],bb[mx]]=[bb[mx],bb[i]]; for(let r=i+1;r<4;r++){ const f=M[r][i]/M[i][i]; for(let c=i;c<4;c++)M[r][c]-=f*M[i][c]; bb[r]-=f*bb[i]; } }
      const dx=[0,0,0,0]; for(let i=3;i>=0;i--){ let v=bb[i]; for(let c=i+1;c<4;c++)v-=M[i][c]*dx[c]; dx[i]=v/M[i][i]; }
      for(let q=0;q<4;q++)a[q]+=Math.max(-.25,Math.min(.25,dx[q])); a[3]=Math.max(-1.2,Math.min(1.2,a[3])); }
    clipPose(P1,W,restM,R,a); return a; };

  /* ---------- a body holding it: GHOLD.attach puts the guitar on it and a step on its pose (PM.post, 111a) ---------- */
  GHOLD.IK={reach,aim,untwist,turnAbout,org};   // (the arms' and hands' solvers, shared with the instruments you sit at, 146zp)
  const CJ=[0,1,2,3].map(()=>new V3()), GI=new M4(), NB=new V3(), NT=new V3();
  // the fretting fingers and thumb kept out of the neck as they reach (HANDS.reach's avoid): along each bone past the knuckle, a ball as thick as the finger there
  const HB=new M4(), BH=new THREE.Matrix3(), AV=new Array(18).fill(0), AQ=new V3(), AO=new V3();
  const avoid=(i,pts)=>{ for(let s=0;s<6;s++){ const j=s+1, q=AQ.copy(pts[j>>1]); if(j&1)q.lerp(pts[(j>>1)+1],.5); q.applyMatrix4(HB);   // (a pressing tip a smaller ball: it is meant to touch)
      const o=neckOut(q,s<5||!i?CR[i][Math.min(2,s>>1)]:.004,AO,!i); if(o)o.applyMatrix3(BH).multiplyScalar(2); for(let c=0;c<3;c++)AV[s*3+c]=o?o.getComponent(c):0; } return AV; };
  const KA=new V3(), KB=new V3(), KN=[.035,.01]; GHOLD.KN=KN;
  const CR=[[.011,.009,.008],[.0095,.008,.007],[.0095,.008,.007],[.0095,.008,.007],[.009,.0075,.0065]];   // (each digit's half thickness at its first, second and last bone, from the mesh)
  // the fretting hand turned by its own shape: the knuckles from the little finger to the index along the neck toward the nut, the hand from wrist to knuckles up past the board's edge leaning over it (LEAN), the palm toward the neck
  const LEAN=[.6,0]; GHOLD.LEAN=LEAN; GHOLD.THO=.02; GHOLD.TB=.006;
  const fretAim=(W,Gm)=>{ const R=HANDS.REST, N=HANDS.NAME, at=n=>new V3().setFromMatrixPosition(R[N[n]]), km=at('middle-finger-phalanx-proximal');
    const A=at('index-finger-phalanx-proximal').sub(at('pinky-finger-phalanx-proximal')).normalize(), F=km.sub(at('wrist')); F.addScaledVector(A,-F.dot(A)).normalize(); const P=new V3().crossVectors(F,A);
    const Ag=new V3(0,1,LEAN[1]).normalize(), Fg=new V3(-LEAN[0],0,1); Fg.addScaledVector(Ag,-Fg.dot(Ag)).normalize(); const Pg=new V3().crossVectors(Fg,Ag);
    const Rg=new M4().makeBasis(Ag,Fg,Pg).multiply(new M4().makeBasis(A,F,P).transpose()), p=org(W[5],new V3()), k=VA.setFromMatrixColumn(W[5],0).length();
    W[5].extractRotation(Gm).multiply(Rg).multiply(HANDS.LOC.L.clone().transpose()).scale(VA.set(k,k,k)).setPosition(p); };
  const DIRS={Rf:new V3(.85,-.1,-.5),Rd:new V3(.15,.25,1),Lpole:new V3(.35,-1,-.15),Rpole:new V3(-.3,-1,-.45)};   // (the elbows' aims in the body's own frame: +x its left, +y up, +z ahead; the left hangs under the neck, the right rests behind the upper bout)
  GHOLD.DIRS=DIRS; GHOLD.stage=4;   // (for checking the hold a stage at a time: 1 the upper arms out, 2 the elbows bent, 3 the hands turned, fingers open, 4 the fingers placed)
  GHOLD.attach=(me,PM,body,src)=>{ if(!body.binv)return null; const gm=GHOLD.model(); gm.matrixAutoUpdate=false; me.add(gm);
    // (drawn where the chest is when drawn: a step after the pose that moves the whole body (kept above the ground) takes the guitar with it, so the hands stay where they were set on it)
    gm.onBeforeRender=()=>{ if(!H.on||!gm.parent)return; gm.matrix.multiplyMatrices(PM.value[1],GB); gm.matrixWorld.multiplyMatrices(gm.parent.matrixWorld,gm.matrix); };
    const restM=body.binv.map(m=>m.clone().invert()), W=restM.map(()=>new M4()), Gm=new M4(), tgL=[0,1,2,3,4].map(()=>new V3()), tgR=[0,1,2,3,4].map(()=>new V3());
    const fg={L:HANDS.R0.map(f=>f.slice()),R:HANDS.R0.map(f=>f.slice())}, W0=restM.map(()=>new M4()), H={me,PM,gm,src,fg,on:true,off:{L:new V3(),R:new V3()},tho:new V3(),ang:{lift:.35,bend:1.6,turn:.9},cang:[0,0,0,0]};
    const toG=(v,o)=>o.copy(v).applyMatrix4(Gm), dirG=(v,o)=>o.copy(v).transformDirection(Gm); let PB=null; const dirB=v=>new V3().copy(v).transformDirection(PB);
    PM.post=(PMx,b)=>{ if(!H.on)return; const P=PMx.value, sc=src.score(), t=src.time();
      for(let i=0;i<15;i++)W[i].multiplyMatrices(P[i],restM[i]);
      PB=P[1];
      // the body plays along (owner, 7 Nov 2026: "you create the animation for guitar playing"): it breathes, sways with the music, dips on the beat and the right foot taps it
      { const beat=sc.beat||(src.beat&&src.beat())||.6, last=sc.tune&&sc.tune.length?sc.tune.reduce((m,n)=>n.t<=t&&n.t>m?n.t:m,-9):-9, live=t-last<1.6, ph=t/beat, tap=live?Math.max(0,Math.cos(ph*2*Math.PI))**4:0, sw=live?Math.sin(ph*Math.PI):0;
        const hp=org(W[0],new V3()); QA.setFromEuler(new THREE.Euler(.02*tap+.008*Math.sin(t*1.7),0,.03*sw,'XYZ'));
        for(const i of [1,2,3,4,5,6,7,8])turnAbout(W[i],hp,QA);
        const fp=org(W[14],new V3()); turnAbout(W[14],fp,QA.setFromAxisAngle(new V3(1,0,0),live?-.32*(1-tap):0)); H.tap=tap; }
      Gm.multiplyMatrices(MA.multiplyMatrices(W[1],body.binv[1]),GB); gm.matrix.copy(Gm); gm.matrixWorldNeedsUpdate=true;
      // the head looks down at the neck
      { const hp=org(W[2],new V3()), bt=sc.beat?Math.max(0,Math.sin(t/sc.beat*Math.PI))**3*.06:0; turnAbout(W[2],hp,QA.setFromEuler(new THREE.Euler(.32+bt,.22,0,'YXZ'))); }   // (the head looks down at the neck, nodding on a song's beat)
      left(sc,t,tgL,{f:0}); const strum=right(sc,t,tgR);
      // the wrists: the left under the neck at the hand's place, the right over the strings (riding the strum)
      const p=posAt(sc,t), yL=pressY(Math.max(1,Math.round(p))+1), wL=toG(new V3(.09,yL-.012,FB-.04),new V3());
      const yR=plY('m'), wr=strum?new V3(strum.x-.09,yR+.035,F.sad[1]+.075):new V3(-.1,yR+.035,F.sad[1]+.07), wR=toG(wr,new V3()), k=VA.setFromMatrixColumn(W[1],0).length();
      // (the wrists then move by what the fingertips still miss, a few rounds a frame, kept frame to frame: the hand goes where its fingers can reach)
      for(let i=0;i<15;i++)W0[i].copy(W[i]); const st=PMx.hands, E={L:new V3(),R:new V3()};
      for(let it=0;it<4;it++){ if(it)for(let i=0;i<15;i++)W[i].copy(W0[i]);
        reach(W,[3,4,5],VA.copy(wL).add(H.off.L),dirB(DIRS.Lpole));
        { const T=VB.copy(wR).add(H.off.R), R=GHOLD.clip!==false&&clipArm(body,H); if(R){ if(GHOLD.stage>=3)clipSolve(P[1],W,restM,R,T,H.cang,VA.setFromMatrixColumn(P[1],0).length()); else clipPose(P[1],W,restM,R,[0,0,0,0]); } else { armSolve(P[1],W,restM,[6,7,8],'R',T,H.ang); armFK(P[1],W,restM,[6,7,8],'R',H.ang,GHOLD.stage); } }
        if(GHOLD.twist!==false)untwist(W,[3,4,5],1);
        if(GHOLD.stage>=3){ fretAim(W,Gm); if(GHOLD.stage>=4)aim(W,8,'R',dirG(DIRS.Rf,new V3()),dirG(DIRS.Rd,new V3())); }
        if(GHOLD.stage>=3&&GHOLD.twist!==false){ untwist(W,[3,4,5],2); untwist(W,[6,7,8],2); }
        if(GHOLD.stage<4){ for(const sd of 'LR')for(let i=0;i<5;i++)fg[sd][i]=[0,0,0,HANDS.R0[i][3]]; break; }
        if(!st||!st.base||!st.near)break; H.err={L:[],R:[]};
        for(const [side,bi,tg] of [['L',5,tgL],['R',8,tgR]]){ const base=MA.multiplyMatrices(W[bi],body.binv[bi]).multiply(st.base[side]), inv=MB.copy(base).invert(), f=fg[side], e=E[side].set(0,0,0); let wsum=0;
          const fret=side==='L'; GI.copy(Gm).invert();
          // (the fretting hand's skin rests on the board and the neck's back: each digit's tip held off them by how far its last bone reaches past it)
          if(fret){ NB.set(0,0,1).transformDirection(Gm).transformDirection(inv); NT.copy(NB).negate(); HB.multiplyMatrices(GI,base); BH.setFromMatrix4(MC.multiplyMatrices(inv,Gm)); }
          for(let i=0;i<5;i++){ if(side==='R'&&i===4){ f[4]=[.9,1.2,.85,HANDS.R0[4][3]]; continue; } const tw=toG(tg[i],new V3()); let v=VC.copy(tw).applyMatrix4(inv);
            if(fret){ const n=i?NB:NT; v.addScaledVector(n,HANDS.ext(i,f[i],n)); }   // (from the pose it had: it is kept frame to frame)
            HANDS.reach(i,v,f[i],fret?avoid:null);
            // (a thumb at the end of its reach and still in the neck moves the hand away from it, a little more each round, and back as it comes clear)
            if(fret&&!i){ HANDS.chain(0,f[0],CJ); let dp=null; for(let j=1;j<7;j++){ const q=VB.copy(CJ[j>>1]); if(j&1)q.lerp(CJ[(j>>1)+1],.5); const o=neckOut(q.applyMatrix4(HB),CR[0][Math.min(2,j>>1)],VD,true); if(o&&(!dp||o.lengthSq()>dp.lengthSq()))dp=AO.copy(o); }
              if(dp)H.tho.addScaledVector(dp,.5).clampLength(0,GHOLD.THO); else H.tho.multiplyScalar(.97); }
            const tip=HANDS.tip(i,f[i],VD).applyMatrix4(base), w=i===0?.5:1; tw.copy(v).applyMatrix4(base); H.err[side][i]=tip.distanceTo(tw)/k; e.addScaledVector(tw.sub(tip),w); wsum+=w; }
          e.multiplyScalar(1/wsum);
          // the fretting hand placed, not pulled: its knuckles in a line just past the neck's edge, a little over the board, along the neck where its fingers go
          if(fret){ let y=0; for(let i=1;i<5;i++)y+=tg[i].y; y=Math.max(NECK[0],Math.min(NUT,y/4)); KA.set(0,0,0); for(let i=1;i<5;i++)KA.add(HANDS.chain(i,f[i],CJ)[0]); KA.multiplyScalar(.25).applyMatrix4(base).applyMatrix4(GI);
            const sh=KB.set(NW(y)+KN[0],y,FB+KN[1]).add(H.tho).sub(KA);
            // (and no knuckle left in the neck's edge by that: the hand moved on by the deepest)
            let dk=null; for(let i=1;i<5;i++){ const q=VB.copy(HANDS.chain(i,f[i],CJ)[0]).applyMatrix4(base).applyMatrix4(GI).add(sh), o=neckOut(q,.016,VD); if(o&&(!dk||o.lengthSq()>dk.lengthSq()))dk=AO.copy(o); } if(dk)sh.add(dk);
            e.copy(toG(VB.copy(KA).add(sh),new V3())).sub(toG(KA,new V3())); }
          H.off[side].add(e); const mx=(side==='R'?.03:.09)*k; if(H.off[side].length()>mx)H.off[side].setLength(mx); } }
      if(st)st.fg=fg;
      if(GHOLD.dbg){ const inv=new M4().copy(P[1]).invert(), k=1/VA.setFromMatrixColumn(P[1],0).length(), j=i=>org(W[i],new V3()).applyMatrix4(inv).toArray().map(v=>+v.toFixed(3)); GHOLD.dbg={R:[j(6),j(7),j(8)],L:[j(3),j(4),j(5)]}; }   // (the arms' joints in the body's rest space, metres, for the checks)
      for(let i=0;i<15;i++)P[i].multiplyMatrices(W[i],body.binv[i]); };
    return H; };
  // slung on the back (owner, 7 Nov 2026: "fully flesh out guitar"): neck up over the left shoulder, its back against yours; it rides the chest bone
  const BACKP={neck:[.38,.92,0],top:[0,0,-1],at:[-.03,1.02,-.13],back:[0,F.hole[0],-F.d]};
  const GBK=(()=>{ const y=new V3(...BACKP.neck).normalize(), z0=new V3(...BACKP.top), z=z0.sub(y.clone().multiplyScalar(z0.dot(y))).normalize(), x=new V3().crossVectors(y,z), M=new M4().makeBasis(x,y,z);
    const p=new V3(...BACKP.back).applyMatrix4(M); M.setPosition(new V3(...BACKP.at).sub(p)); return M; })();
  GHOLD.sling=(me,PM)=>{ const gm=GHOLD.model(); gm.matrixAutoUpdate=false; me.add(gm); const S={me,PM,gm,on:true}; S.upd=()=>{ gm.matrix.multiplyMatrices(PM.value[1],GBK); gm.matrixWorldNeedsUpdate=true; }; S.upd(); return S; };
  GHOLD.unsling=S=>{ if(!S)return; S.on=false; if(S.gm.parent)S.gm.parent.remove(S.gm); };
  GHOLD.detach=H=>{ if(!H)return; H.on=false; if(H.PM.post)H.PM.post=null; if(H.gm.parent)H.gm.parent.remove(H.gm); const st=H.PM.hands; if(st)st.fg=null; }; }
export {GHOLD};
